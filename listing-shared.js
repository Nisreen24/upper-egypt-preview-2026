/* shared helpers for the experiences listing and detail templates */
window.EX = (() => {
  const CITIES = { luxor: { ar: 'الأقصر', en: 'Luxor', es: 'Luxor', center: [25.714, 32.628], zoom: 13 }, aswan: { ar: 'أسوان', en: 'Aswan', es: 'Asuán', center: [24.0889, 32.8998], zoom: 13 } };
  const CATS = {"tour":{"n":"جولة إرشادية","p":"compass"},"workshop":{"n":"ورشة","p":"hand"},"food":{"n":"طعام وشراب","p":"fork-knife"},"stay":{"n":"إقامة","p":"bed"},"product":{"n":"منتج محلي","p":"basket"}};
  const P = {"gems":"كنوز مخفية","culture":"ثقافة وطقوس","food":"مذاقات","crafts":"حرف يدوية","folk":"فلكلور وروحانيات","products":"منتجات رواد الأعمال"}, PR = {"1":"$","2":"$$","3":"$$$","4":"$$$$"}, AC = {"step":"دخول بلا درجات","wc":"دورة مياه مهيأة","seat":"أماكن جلوس","av":"دعم سمعي أو بصري"};
  const q = new URLSearchParams(location.search);
  const city = CITIES[q.get('city')] ? q.get('city') : 'luxor';
  const t = k => (window.I18N ? I18N.t(k) : k), lang = () => document.documentElement.lang || 'ar';
  const cityName = () => CITIES[city][lang()] || CITIES[city].ar;
  const esc = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const svg = (p, z) => '<svg width="' + (z || 16) + '" height="' + (z || 16) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  const ARW = ICON('arrow-left', 16), CLOCK = ICON('clock', 16), PIN = ICON('map-pin', 16);
  const all = () => EXPERIENCES.list.filter(e => e.city === city);
  const href = e => 'experience.html?city=' + e.city + '&slug=' + e.slug;
  const listHref = (c, cat) => 'experiences.html?city=' + c + (cat ? '&category=' + cat : '');
  const pic = (im, sizes, cls) => im ? '<img class="' + (cls || '') + '" src="' + im.src + '" srcset="' + im.srcset + '" sizes="' + sizes + '" alt="' + esc(t(im.alt)) + '" loading="lazy" decoding="async">' : '';
  const card = (e, loc) => '<li><article class="gem" data-slug="' + e.slug + '"><div class="gem-media">' + pic(e.imgs[0], '(min-width:1024px) 300px, 90vw', 'gem-img') +
    '<span class="gem-tint" aria-hidden="true"></span><span class="gem-shade" aria-hidden="true"></span>' +
    '<span class="gem-loc ' + (e.c === 'stay' ? 'gem-loc--ink' : e.c === 'food' ? 'gem-loc--olive' : '') + '">' + ICON(CATS[e.c].p, 14) + '<span>' + esc(t(CATS[e.c].n)) + '</span></span>' +
    '<button class="gem-fav" type="button" aria-pressed="false" aria-label="' + esc(t('أضف إلى المفضلة')) + '"><svg class="ic" width="16" height="16" viewBox="0 0 256 256" aria-hidden="true" focusable="false" fill="currentColor"><path d="M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40ZM128,214.8C109.74,204.16,32,155.69,32,102A46.06,46.06,0,0,1,78,56c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,155.61,146.24,204.15,128,214.8Z"/></svg></button></div>' +
    '<div class="gem-body"><span class="gem-cat">' + esc(t(P[e.p])) + '</span><h3 class="gem-title">' + esc(t(e.n)) + '</h3><p class="gem-desc">' + esc(t(e.s)) + '</p>' +
    ((e.dur || e.pr || (e.a && e.a.length)) ? '<p class="gem-meta">' + (e.dur ? '<span>' + CLOCK + esc(t(e.dur)) + '</span>' : '') + (e.pr ? '<span>' + esc(PR[e.pr]) + '</span>' : '') + ((e.a || []).length ? '<span>' + esc(t('إمكانية الوصول')) + '</span>' : '') + '</p>' : '') +
    '<a class="gem-cta" href="' + href(e) + '"><span>' + esc(t('عرض التفاصيل')) + '</span>' + ARW + '</a></div></article></li>';
  const icon = (c, hot) => L.divIcon({ className: 'mp-pin' + (hot ? ' is-hot' : ''), iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -20], html: '<span style="--c:' + ({ tour: '#2f6f5e', workshop: '#6b4a2f', food: '#b8741a', stay: '#345c70', product: '#a53e1a' }[c]) + '">' + ICON(CATS[c].p, 20) + '</span>' });
  const pop = e => '<div class="mp-card"><div class="mp-thumb">' + pic(e.imgs[0], '96px') + '</div><div class="mp-info"><span class="mp-tag" style="--c:#a53e1a">' + ICON(CATS[e.c].p, 14) + '<span>' + esc(t(CATS[e.c].n)) + '</span></span><strong class="mp-name">' + esc(t(e.n)) + '</strong><p class="mp-sum">' + esc(t(e.s)) + '</p><a class="mp-more" href="' + href(e) + '"><span>' + esc(t('عرض التفاصيل')) + '</span>' + ARW + '</a></div></div>';
  const crumb = (items) => '<nav class="ex-crumb" aria-label="' + esc(t('مسار التنقل')) + '"><ol>' + items.map(([n, h]) => h ? '<li><a href="' + h + '">' + esc(t(n)) + '</a></li>' : '<li aria-current="page">' + esc(t(n)) + '</li>').join('') + '</ol></nav>';
  document.addEventListener('DOMContentLoaded', () => { document.querySelectorAll('.footer-links a[href="index.html#luxor"],.footer-links a[href="luxor.html"]').forEach(a => a.href = 'luxor.html'); });
  /* route sketch: an SVG polyline through the stops' coordinates with numbered dots; purely illustrative, no map tiles */
  const route = (pts, w, h) => {
    pts = pts.filter(Boolean); w = w || 120; h = h || 84; if (pts.length < 2) return '';
    const lats = pts.map(p => p[0]), lngs = pts.map(p => p[1]); const pad = 12;
    const sx = (Math.max(...lngs) - Math.min(...lngs)) || 0.001, sy = (Math.max(...lats) - Math.min(...lats)) || 0.001, k = Math.min((w - 2 * pad) / sx, (h - 2 * pad) / sy);
    const ox = (w - sx * k) / 2, oy = (h - sy * k) / 2;
    const P = pts.map(p => [ox + (p[1] - Math.min(...lngs)) * k, h - (oy + (p[0] - Math.min(...lats)) * k)]);
    const d = P.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    return '<svg class="route" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" aria-hidden="true" focusable="false"><path d="' + d + '" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 3" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>' + P.map((p, i) => '<g transform="translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')"><circle r="7" fill="var(--rust)" stroke="#fff" stroke-width="2"/><text y="2.6" text-anchor="middle" font-size="7.5" font-weight="700" fill="#fff" font-family="inherit">' + (i + 1) + '</text></g>').join('') + '</svg>';
  };
  /* related-card strips: more than three cards → horizontal swipe with arrows and page dots (three per view on desktop) */
  const strip = (() => {
    const ARW_R = '<svg class="ic" width="20" height="20" viewBox="0 0 256 256" aria-hidden="true" focusable="false" fill="currentColor"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/></svg>';
    const dir = () => document.documentElement.dir === 'rtl' ? -1 : 1;
    const apply = ul => {
      const n = ul.children.length, on = n > (ul.dataset.stripMin ? +ul.dataset.stripMin : 3);
      ul.classList.toggle('ex-strip', on);
      let nav = ul.nextElementSibling && ul.nextElementSibling.classList.contains('ex-strip-nav') ? ul.nextElementSibling : null;
      if (!on) { if (nav) nav.remove(); return; }
      if (!nav) {
        nav = document.createElement('div'); nav.className = 'ex-strip-nav';
        nav.innerHTML = '<button type="button" class="ex-strip-btn ex-strip-prev" aria-label="' + esc(t('السابق')) + '">' + ARW_R + '</button><div class="ex-strip-dots" role="tablist"></div><button type="button" class="ex-strip-btn ex-strip-next" aria-label="' + esc(t('التالي')) + '">' + ARW_R + '</button>';
        ul.after(nav);
        nav.querySelector('.ex-strip-prev').addEventListener('click', () => ul.scrollBy({ left: -dir() * ul.clientWidth, behavior: 'smooth' }));
        nav.querySelector('.ex-strip-next').addEventListener('click', () => ul.scrollBy({ left: dir() * ul.clientWidth, behavior: 'smooth' }));
        ul.addEventListener('scroll', () => sync(ul, nav), { passive: true }); addEventListener('resize', () => sync(ul, nav));
        ul.setAttribute('tabindex', '0'); ul.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); ul.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * ul.clientWidth, behavior: 'smooth' }); } });
      }
      sync(ul, nav);
    };
    const sync = (ul, nav) => {
      const li = ul.firstElementChild; if (!li) return;
      const per = Math.max(1, Math.round(ul.clientWidth / li.getBoundingClientRect().width)), pages = Math.ceil(ul.children.length / per), max = ul.scrollWidth - ul.clientWidth, x = Math.abs(ul.scrollLeft), cur = max > 0 ? Math.min(pages - 1, Math.round(x / max * (pages - 1))) : 0;
      const dots = nav.querySelector('.ex-strip-dots');
      if (dots.children.length !== pages) dots.innerHTML = Array.from({ length: pages }, (_, i) => '<button type="button" class="ex-strip-dot" role="tab" aria-label="' + esc(t('صفحة')) + ' ' + (i + 1) + '"></button>').join('');
      [...dots.children].forEach((d, i) => { d.setAttribute('aria-selected', String(i === cur)); d.onclick = () => ul.scrollTo({ left: dir() * (i * max / Math.max(1, pages - 1)), behavior: 'smooth' }); });
      nav.querySelector('.ex-strip-prev').disabled = cur === 0; nav.querySelector('.ex-strip-next').disabled = cur >= pages - 1;
      nav.hidden = pages < 2;
    };
    const watch = () => document.querySelectorAll('ul.ex-grid').forEach(ul => { if (ul.closest('#exList') || ul.dataset.strip) return; ul.dataset.strip = '1'; apply(ul); new MutationObserver(() => apply(ul)).observe(ul, { childList: true }); });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
    return apply;
  })();
  return { CITIES, CATS, P, PR, AC, q, city, t, lang, cityName, esc, svg, ARW, CLOCK, PIN, all, href, listHref, pic, card, icon, pop, crumb, strip, route };
})();
