/* i18n.js — Arabic (source) / English / Spanish for "اكتشف صعيد مصر".
 * Translates visible text nodes and key attributes in place, flips <html dir>, and swaps the Latin font stack.
 * Keys are the source strings as written in index.html (tatweel and extra spaces ignored).
 */
window.I18N = (() => {
  'use strict';
  const D = {};

  /* Localised event data (mirrors the EVENTS array in index.html) */
  const EVENTS = {
    en: [
      { cat: 'Music', title: 'A Nile evening<br>on the banks of Aswan', desc: 'An enchanting evening of music by the Nile, under the stars.', time: '6:00 PM', loc: 'Aswan', place: ['ASWAN', 'A different kind of peace'] },
      { cat: 'Sport on the Nile', title: 'The annual<br>felucca race', desc: 'Dozens of sailboats race across the Nile in an unforgettable spectacle.', time: '4:30 PM', loc: 'Aswan', place: ['ASWAN', 'Where the Nile sails'] },
      { cat: 'Food', title: 'Upper Egyptian<br>food festival', desc: 'Taste authentic Upper Egyptian dishes made by the mothers and cooks of the villages.', time: '1:00 PM', loc: 'Luxor', place: ['LUXOR', 'Flavours of the south'] },
      { cat: 'Handicrafts', title: 'Handicrafts<br>week', desc: 'Open workshops with artisans: weaving, pottery and palm-frond craft from the heart of the villages.', time: '10:00 AM', loc: 'Aswan', place: ['NUBIA', 'Woven by hand'] },
    ],
    es: [
      { cat: 'Música', title: 'Una noche en el Nilo<br>a orillas de Asuán', desc: 'Una velada musical encantadora junto al Nilo, bajo las estrellas.', time: '18:00', loc: 'Asuán', place: ['ASUÁN', 'Una paz diferente'] },
      { cat: 'Deporte en el Nilo', title: 'La regata anual<br>de falucas', desc: 'Decenas de veleros compiten sobre el Nilo en un espectáculo inolvidable.', time: '16:30', loc: 'Asuán', place: ['ASUÁN', 'Donde navega el Nilo'] },
      { cat: 'Gastronomía', title: 'Festival gastronómico<br>del Alto Egipto', desc: 'Prueba los platos auténticos del Alto Egipto preparados por las madres y cocineras de los pueblos.', time: '13:00', loc: 'Luxor', place: ['LUXOR', 'Sabores del sur'] },
      { cat: 'Artesanía', title: 'Semana de<br>la artesanía', desc: 'Talleres abiertos con artesanos: tejido, cerámica y cestería de palma desde el corazón de los pueblos.', time: '10:00', loc: 'Asuán', place: ['NUBIA', 'Tejido a mano'] },
    ],
  };

  const TITLES = { ar: 'صعيد مصر — تراث حي', en: 'Upper Egypt — Living Heritage', es: 'Alto Egipto — Patrimonio vivo' };
  const SPEECH = { ar: 'ar-EG', en: 'en-GB', es: 'es-ES' };
  const ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  const norm = s => String(s).replace(/ـ/g, '').replace(/\s+/g, ' ').trim();
  const textOrig = new WeakMap(), attrOrig = new WeakMap();
  let lang = 'ar';

  const lookup = (src, l) => { if (l === 'ar') return null; const e = D[norm(src)]; if (!e) return null; return e[l] != null ? e[l] : e.en != null ? e.en : null; }; /* 6.3: English stands in for a missing translation */

  function apply(l) {
    lang = ['ar', 'en', 'es'].includes(l) ? l : 'ar';
    const html = document.documentElement;
    html.setAttribute('lang', lang); html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr'); html.classList.toggle('lang-latin', lang !== 'ar');
    // text nodes
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const nodes = []; let n;
    while ((n = walker.nextNode())) { if (n.parentElement && n.parentElement.closest('script,style,#toast,#a11yTip,#news-msg')) continue; nodes.push(n); }
    nodes.forEach(node => {
      if (!textOrig.has(node)) { if (!norm(node.nodeValue)) return; textOrig.set(node, node.nodeValue); }
      const o = textOrig.get(node); const t = lookup(o, lang);
      if (t == null) { node.nodeValue = o; return; }
      node.nodeValue = o.match(/^\s*/)[0] + t + o.match(/\s*$/)[0];
    });
    // attributes
    document.querySelectorAll(ATTRS.map(a => '[' + a + ']').join(',')).forEach(el => {
      let orig = attrOrig.get(el);
      if (!orig) { orig = {}; ATTRS.forEach(a => { if (el.hasAttribute(a)) orig[a] = el.getAttribute(a); }); attrOrig.set(el, orig); }
      for (const a in orig) { const t = lookup(orig[a], lang); el.setAttribute(a, t == null ? orig[a] : t); }
    });
    document.title = TITLES[lang];
    try { localStorage.setItem('se-lang', lang); } catch {}
    document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang } }));
  }

  const api = {
    get lang() { return lang; },
    set: apply,
    t: (key) => { const v = lookup(key, lang); return v == null ? key : v; },
    lookup,
    events: () => EVENTS[lang] || null,          // null → use the Arabic source array
    speechLang: () => SPEECH[lang],
    init() { let saved = null; try { saved = localStorage.getItem('se-lang'); } catch {} apply(saved || 'ar'); },
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => api.init()); else api.init();
  return api;
})();
