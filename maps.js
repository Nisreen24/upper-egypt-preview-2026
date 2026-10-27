/* Maps: MapLibre GL with MapTiler vector tiles (Inception Report 7.1), one component for the directory map, the city maps and the
   detail-page locations, with markers clustered by proximity. The library loads after first paint; calls made before that are queued.
   The pages keep the small Leaflet-shaped API they were written against (L.map, L.marker, L.divIcon, L.layerGroup,
   L.markerClusterGroup, L.latLngBounds), which this file now provides on top of maplibregl. */
window.MAP_CONFIG = {
  maptilerKey: '',                                   /* CIDEAL supplies the key (Annex A); empty → demo tiles below */
  maptilerStyle: 'streets-v2',
  demoStyle: 'https://tiles.openfreemap.org/styles/liberty',
  lib: 'https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/4.7.1/',
  rtlPlugin: 'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js'
};
window.L = (() => {
  const C = window.MAP_CONFIG;
  const styleUrl = () => C.maptilerKey ? 'https://api.maptiler.com/maps/' + C.maptilerStyle + '/style.json?key=' + C.maptilerKey : C.demoStyle;
  const lngLat = ll => [ll[1], ll[0]];
  let loading = null;
  function load() {
    if (loading) return loading;
    loading = new Promise(resolve => {
      const go = () => {
        const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = C.lib + 'maplibre-gl.min.css'; document.head.appendChild(css);
        const s = document.createElement('script'); s.src = C.lib + 'maplibre-gl.min.js'; s.async = true;
        s.onload = () => { try { maplibregl.setRTLTextPlugin(C.rtlPlugin, null, true); } catch (e) {} resolve(); };
        document.head.appendChild(s);
      };
      if (document.readyState === 'complete') setTimeout(go, 0); else addEventListener('load', () => setTimeout(go, 0), { once: true });
    });
    return loading;
  }
  const rm = () => matchMedia('(prefers-reduced-motion:reduce)').matches;

  class Bounds {
    constructor(points) { this.pts = points.map(p => Array.isArray(p) ? p : [p.lat, p.lng]); this.padding = 0; }
    pad(f) { this.padding = f; return this; }
    box() { const lats = this.pts.map(p => p[0]), lngs = this.pts.map(p => p[1]); let s = Math.min(...lats), n = Math.max(...lats), w = Math.min(...lngs), e = Math.max(...lngs); const dy = Math.max((n - s) * this.padding, 0.002), dx = Math.max((e - w) * this.padding, 0.002); return [[w - dx, s - dy], [e + dx, n + dy]]; }
  }

  class GMap {
    constructor(id, opts) {
      this.el = typeof id === 'string' ? document.getElementById(id) : id; this.opts = opts || {}; this.q = []; this._m = null; this.popup = null; this.groups = [];
      this.center = this.opts.center; this.zoom = this.opts.zoom || 12;
      load().then(() => this.create());
    }
    create() {
      if (!this.el || !window.maplibregl) return;
      let m; try { m = new maplibregl.Map({ container: this.el, style: styleUrl(), center: lngLat(this.center), zoom: this.zoom - 1, scrollZoom: !!this.opts.scrollWheelZoom, attributionControl: { compact: true }, cooperativeGestures: false, fadeDuration: rm() ? 0 : 300 }); } catch (e) { this.el.classList.add('map-unavailable'); return; }
      m.on('error', e => { if (e && e.error && /WebGL|context/i.test(String(e.error.message))) this.el.classList.add('map-unavailable'); });
      if (this.opts.zoomControl !== false) m.addControl(new maplibregl.NavigationControl({ showCompass: false }), document.documentElement.dir === 'rtl' ? 'top-left' : 'top-right');
      this._m = m;
      m.on('load', () => { const q = this.q; this.q = []; q.forEach(f => f()); this.groups.forEach(g => g.recluster && g.recluster()); });
      m.on('move', () => this.groups.forEach(g => g.recluster && g.schedule()));
    }
    run(f) { if (this._m && this._m.loaded()) f(); else this.q.push(f); return this; }
    setView(ll, zoom, o) { return this.run(() => this._m[(o && o.animate === false) || rm() ? 'jumpTo' : 'easeTo']({ center: lngLat(ll), zoom: (zoom || this.zoom) - 1 })); }
    panTo(ll, o) { return this.run(() => this._m[(o && o.animate === false) || rm() ? 'jumpTo' : 'easeTo']({ center: lngLat(ll) })); }
    fitBounds(b, o) { o = o || {}; return this.run(() => this._m.fitBounds(b.box(), { padding: 48, maxZoom: (o.maxZoom || 16) - 1, animate: !(o.animate === false || rm()) })); }
    zoomIn() { return this.run(() => this._m.zoomIn()); } zoomOut() { return this.run(() => this._m.zoomOut()); }
    closePopup() { if (this.popup) { const p = this.popup; this.popup = null; p.remove(); } return this; }
    invalidateSize() { return this.run(() => this._m.resize()); }
    on() { return this; }
    addLayer(x) { x.attach(this); return this; }
  }

  class Marker {
    constructor(ll, opts) { this.ll = ll; this.options = opts || {}; this.el = this.build(); this.handlers = {}; this.map = null; this.gl = null; this.visible = true; }
    build() {
      const ic = this.options.icon, el = document.createElement('div');
      el.className = (ic && ic.className) || 'mp-pin'; el.innerHTML = (ic && ic.html) || '<span style="--c:#a53e1a"></span>';
      el.style.cursor = 'pointer'; if (this.options.title) el.title = this.options.title;
      if (this.options.keyboard !== false) { el.tabIndex = 0; el.setAttribute('role', 'button'); }
      el.setAttribute('aria-label', this.options.alt || this.options.title || '');
      el.addEventListener('click', e => { e.stopPropagation(); this.openPopup(); });
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.openPopup(); } });
      return el;
    }
    bindPopup(c, o) { this.popupContent = c; this.popupOpts = o || {}; return this; }
    on(ev, fn) { (this.handlers[ev] = this.handlers[ev] || []).push(fn); return this; }
    fire(ev, arg) { (this.handlers[ev] || []).forEach(f => f(arg)); }
    getElement() { return this.el; } getLatLng() { return { lat: this.ll[0], lng: this.ll[1] }; }
    addTo(target) { target.addLayer(this); return this; }
    attach(map) { this.map = map; map.run(() => { if (this.map !== map) return; if (!this.gl) { this.gl = new maplibregl.Marker({ element: this.el, anchor: 'center' }).setLngLat(lngLat(this.ll)); } this.gl.addTo(map._m); this.el.style.display = this.visible ? '' : 'none'; }); }
    detach() { if (this.gl) this.gl.remove(); this.gl = null; this.map = null; }
    show(on) { this.visible = on; this.el.style.display = on ? '' : 'none'; }
    openPopup() {
      const map = this.map; if (!map || !this.popupContent) return;
      map.run(() => {
        map.closePopup();
        const html = typeof this.popupContent === 'function' ? this.popupContent() : this.popupContent;
        const p = new maplibregl.Popup({ closeButton: this.popupOpts.closeButton !== false, closeOnClick: true, className: this.popupOpts.className || '', offset: 24, maxWidth: 'none' }).setLngLat(lngLat(this.ll)).setHTML(html).addTo(map._m);
        map.popup = p; const self = this;
        p.on('close', () => { if (map.popup === p) map.popup = null; self.fire('popupclose', { popup: p }); });
        self.fire('popupopen', { popup: { getElement: () => p.getElement() } });
        if (!rm()) map._m.easeTo({ center: lngLat(this.ll), offset: [0, 80] });
      });
    }
    remove() { this.detach(); }
  }

  class Group {
    constructor() { this.items = []; this.map = null; }
    addTo(map) { this.map = map; map.groups.push(this); return this; }
    addLayer(m) { this.items.push(m); if (this.map) m.attach(this.map); return this; }
    addLayers(arr) { arr.forEach(m => this.addLayer(m)); return this; }
    clearLayers() { this.items.forEach(m => m.detach()); this.items = []; return this; }
    eachLayer(fn) { this.items.forEach(fn); return this; }
  }

  /* clusters: nearby markers collapse into one badge at the current zoom; opening a cluster zooms in */
  class Cluster extends Group {
    constructor(opts) { super(); this.opts = opts || {}; this.radius = this.opts.maxClusterRadius || 46; this.badges = []; this.raf = 0; }
    schedule() { if (this.raf) return; this.raf = requestAnimationFrame(() => { this.raf = 0; this.recluster(); }); }
    addLayer(m) { this.items.push(m); if (this.map) { m.attach(this.map); this.schedule(); } return this; }
    clearLayers() { super.clearLayers(); this.badges.forEach(b => b.remove()); this.badges = []; return this; }
    recluster() {
      const map = this.map; if (!map || !map._m || !map._m.loaded()) return;
      const m = map._m, r = this.radius; const cells = new Map();
      this.items.forEach(it => { const p = m.project(lngLat(it.ll)); const k = Math.floor(p.x / r) + ':' + Math.floor(p.y / r); (cells.get(k) || cells.set(k, []).get(k)).push(it); });
      this.badges.forEach(b => b.remove()); this.badges = [];
      cells.forEach(list => {
        if (list.length === 1) { list[0].show(true); return; }
        list.forEach(it => it.show(false));
        const lat = list.reduce((a, it) => a + it.ll[0], 0) / list.length, lng = list.reduce((a, it) => a + it.ll[1], 0) / list.length;
        const icon = this.opts.iconCreateFunction ? this.opts.iconCreateFunction({ getChildCount: () => list.length }) : { className: 'mp-cluster', html: '<span>' + list.length + '</span>' };
        const el = document.createElement('div'); el.className = icon.className; el.innerHTML = icon.html; el.style.cursor = 'pointer'; el.tabIndex = 0; el.setAttribute('role', 'button'); el.setAttribute('aria-label', list.length + ' ' + (window.I18N ? I18N.t('نتيجة في') : '') + ' ' + (list[0].options.title || ''));
        const open = () => m.easeTo({ center: [lng, lat], zoom: Math.min(m.getZoom() + 2, 17), duration: rm() ? 0 : 500 });
        el.addEventListener('click', e => { e.stopPropagation(); open(); }); el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
        this.badges.push(new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([lng, lat]).addTo(m));
      });
    }
    zoomToShowLayer(mk, cb) { const map = this.map; if (!map) return; map.run(() => { const m = map._m; const after = () => { this.recluster(); mk.show(true); if (cb) cb(); }; m.once('moveend', after); m.easeTo({ center: lngLat(mk.ll), zoom: Math.max(m.getZoom(), 15), duration: rm() ? 0 : 500 }); }); }
  }

  return {
    map: (id, o) => new GMap(id, o),
    tileLayer: () => ({ addTo() { return this; } }),
    marker: (ll, o) => new Marker(ll, o),
    divIcon: o => o,
    layerGroup: () => new Group(),
    markerClusterGroup: o => new Cluster(o),
    latLngBounds: pts => new Bounds(pts),
    load
  };
})();
