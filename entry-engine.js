/* One entry template (BRD 4.3): hero with title, city and pillar; summary then body; gallery; a facts panel per type;
   the map where there are coordinates; the entrepreneur where there is one; related entries at the foot. */
window.ENTRY = (() => {
  const $ = id => document.getElementById(id);
  function hero() {
    const xh = $('dxHero'), nav = document.querySelector('.nav-bar'); if (!xh) return;
    const size = () => { const mobile = innerWidth < 768, vh = innerHeight; const navB = nav ? nav.getBoundingClientRect().bottom : 0; const w = Math.min(mobile ? 950 : 1550, innerWidth * 0.95); const h = Math.min(mobile ? 600 : 800, vh * 0.85, vh - navB - 100); const top = Math.max((vh - h) / 2, navB + 80); xh.style.setProperty('--xh-w', w + 'px'); xh.style.setProperty('--xh-h', h + 'px'); xh.style.setProperty('--xh-top', top + 'px'); };
    size(); addEventListener('resize', size); addEventListener('load', size);
  }
  function init(cfg) {
    const { t, esc, crumb, pic } = EX;
    const e = cfg.entry;
    if (!e) { document.querySelectorAll('#dx > *:not(#dxEmpty)').forEach(x => x.hidden = true); if ($('dxHero')) $('dxHero').hidden = true; $('dxEmpty').hidden = false; return; }
    hero(); let map = null;
    function render() {
      const v = cfg.view(e);
      $('dxCrumb').innerHTML = crumb(v.crumb);
      $('dx-title').textContent = v.title; document.title = v.title + ' — ' + t('صعيد مصر');
      $('dxSum').textContent = v.sub || '';
      $('dxTags').innerHTML = (v.tags || []).map(x => '<span class="dx-tag">' + x + '</span>').join('');
      const hero = $('xhMedia').querySelector('img'); if (hero) hero.remove();
      if (v.img) $('xhMedia').insertAdjacentHTML('afterbegin', '<img src="' + v.img.src + '" srcset="' + v.img.srcset + '" sizes="95vw" alt="' + esc(t(v.img.alt)) + '" style="object-position:' + (v.pos || '50% 50%') + '" fetchpriority="high" decoding="async">');
      $('dxaH').textContent = v.aboutH; $('dxaSum').textContent = v.summary || '';
      $('dxDesc').innerHTML = (v.body || []).map(p => '<p>' + esc(p) + '</p>').join('');
      $('dxaChips').innerHTML = (v.chips || []).map(x => '<span class="dxi-chip">' + x + '</span>').join('');
      if ($('dxaBento')) { const pics = v.pictures || []; $('dxaBento').hidden = pics.length < 2; $('dxaBento').innerHTML = pics.slice(0, 5).map((im, i) => '<figure>' + pic(im, i === 0 ? '(min-width:1024px) 40vw, 95vw' : '(min-width:1024px) 20vw, 45vw') + '</figure>').join(''); }
      $('dxiH').textContent = v.factsH || t('المعلومات');
      $('dxFacts').innerHTML = (v.facts || []).map(([i, k, val]) => '<div><dt>' + i + esc(k) + '</dt><dd>' + val + '</dd></div>').join('');
      $('dxiPillarBox').hidden = !v.pillar; if (v.pillar) $('dxiPillar').innerHTML = '<span class="dxi-chip">' + v.pillar + '</span>';
      $('dxiActions').innerHTML = (v.actions || []).map(a => '<a class="dx-cta' + (a.ghost ? ' dx-cta--ghost' : '') + '" href="' + a.href + '"' + (a.ext ? ' target="_blank" rel="noopener"' : '') + '>' + (a.icon || '') + '<span>' + esc(a.label) + '</span></a>').join('') + (v.note ? '<p class="dxi-note">' + esc(v.note) + '</p>' : '');
      $('dxiActions').hidden = !(v.actions || []).length && !v.note;
      if (v.ll) { $('dxMapBox').hidden = false; if (!map) { map = L.map('dxMap', { center: v.ll, zoom: v.zoom || 14, zoomControl: true, scrollWheelZoom: false }); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap' }).addTo(map); L.marker(v.ll, { icon: EX.icon(v.pin || 'tour'), title: v.title }).addTo(map); setTimeout(() => map.invalidateSize(), 200); } } else $('dxMapBox').hidden = true;
      $('dxEnt').hidden = !v.ent; if (v.ent) $('dxEnt').innerHTML = v.ent;
      const secs = v.sections || []; const host = $('dxSections'); host.innerHTML = secs.map((s, i) => '<section class="dx-rel" aria-labelledby="dxs' + i + '"><header class="lx-head"><div>' + (s.eyebrow ? '<span class="sec-eyebrow">' + esc(s.eyebrow) + '</span>' : '') + '<h2 class="display lx-h" id="dxs' + i + '">' + esc(s.title) + '</h2></div>' + (s.all ? '<a class="lx-all" href="' + s.all.href + '"><span>' + esc(s.all.label) + '</span>' + EX.ARW + '</a>' : '') + '</header>' + s.html + '</section>').join('');
      if (cfg.after) cfg.after(v);
    }
    document.addEventListener('i18n:change', render); render();
  }
  return { init };
})();
