/* shared helpers for the experiences listing and detail templates */
window.EX = (() => {
  const CITIES = { luxor: { ar: 'الأقصر', en: 'Luxor', es: 'Luxor', center: [25.714, 32.628], zoom: 13 }, aswan: { ar: 'أسوان', en: 'Aswan', es: 'Asuán', center: [24.0889, 32.8998], zoom: 13 } };
  const CATS = {"tour":{"n":"جولة إرشادية","p":"<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M15.5 8.5l-2 5-5 2 2-5 5-2z\"/>"},"workshop":{"n":"ورشة","p":"<path d=\"M12 21a7 7 0 0 1-7-7V9a2 2 0 0 1 4 0v3M9 11V5a2 2 0 0 1 4 0v6M13 10V6a2 2 0 0 1 4 0v8a7 7 0 0 1-7 7z\"/>"},"food":{"n":"طعام وشراب","p":"<path d=\"M7 3v8M4.5 3v4.5a2.5 2.5 0 0 0 5 0V3M7 11v10M17 3c-2 1.5-3 4-3 7h3m0-7v18\"/>"},"stay":{"n":"إقامة","p":"<path d=\"M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 15h18M3 18v2M21 18v2M7 9V6.5h10V9\"/>"},"product":{"n":"منتج محلي","p":"<path d=\"M4 9.5l1.5-5h13l1.5 5M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0M5.5 12v8h13v-8M10 20v-4.5h4V20\"/>"}};
  const P = {"gems":"كنوز مخفية","culture":"ثقافة وطقوس","food":"مذاقات","crafts":"حرف يدوية","folk":"فلكلور وروحانيات","products":"منتجات رواد الأعمال"}, PR = {"1":"$","2":"$$","3":"$$$","4":"$$$$"}, AC = {"step":"دخول بلا درجات","wc":"دورة مياه مهيأة","seat":"أماكن جلوس","av":"دعم سمعي أو بصري"};
  const q = new URLSearchParams(location.search);
  const city = CITIES[q.get('city')] ? q.get('city') : 'luxor';
  const t = k => (window.I18N ? I18N.t(k) : k), lang = () => document.documentElement.lang || 'ar';
  const cityName = () => CITIES[city][lang()] || CITIES[city].ar;
  const esc = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const svg = (p, z) => '<svg width="' + (z || 16) + '" height="' + (z || 16) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  const ARW = svg('<path d="M19 12H5M11 6l-6 6 6 6"/>', 16), CLOCK = svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', 14), PIN = svg('<path d="M12 21s-6-5.3-6-11a6 6 0 0 1 12 0c0 5.7-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>', 14);
  const all = () => EXPERIENCES.list.filter(e => e.city === city);
  const href = e => 'experience.html?city=' + e.city + '&slug=' + e.slug;
  const listHref = (c, cat) => 'experiences.html?city=' + c + (cat ? '&category=' + cat : '');
  const pic = (im, sizes, cls) => im ? '<img class="' + (cls || '') + '" src="' + im.src + '" srcset="' + im.srcset + '" sizes="' + sizes + '" alt="' + esc(t(im.alt)) + '" loading="lazy" decoding="async">' : '';
  const card = (e, loc) => '<li><article class="gem" data-slug="' + e.slug + '"><div class="gem-media">' + pic(e.imgs[0], '(min-width:1024px) 300px, 90vw', 'gem-img') +
    '<span class="gem-tint" aria-hidden="true"></span><span class="gem-shade" aria-hidden="true"></span>' +
    '<span class="gem-loc ' + (e.c === 'stay' ? 'gem-loc--ink' : e.c === 'food' ? 'gem-loc--olive' : '') + '">' + svg(CATS[e.c].p, 14) + '<span>' + esc(t(CATS[e.c].n)) + '</span></span>' +
    '<button class="gem-fav" type="button" aria-pressed="false" aria-label="' + esc(t('أضف إلى المفضلة')) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7.5 2.5c0 5.4-7.5 10-7.5 10z"/></svg></button></div>' +
    '<div class="gem-body"><span class="gem-cat">' + esc(t(P[e.p])) + '</span><h3 class="gem-title">' + esc(t(e.n)) + '</h3><p class="gem-desc">' + esc(t(e.s)) + '</p>' +
    ((e.dur || e.pr || (e.a && e.a.length)) ? '<p class="gem-meta">' + (e.dur ? '<span>' + CLOCK + esc(t(e.dur)) + '</span>' : '') + (e.pr ? '<span>' + esc(PR[e.pr]) + '</span>' : '') + ((e.a || []).length ? '<span>' + esc(t('إمكانية الوصول')) + '</span>' : '') + '</p>' : '') +
    '<a class="gem-cta" href="' + href(e) + '"><span>' + esc(t('عرض التفاصيل')) + '</span>' + ARW + '</a></div></article></li>';
  const icon = (c, hot) => L.divIcon({ className: 'mp-pin' + (hot ? ' is-hot' : ''), iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -20], html: '<span style="--c:' + ({ tour: '#2f6f5e', workshop: '#6b4a2f', food: '#b8741a', stay: '#345c70', product: '#a53e1a' }[c]) + '">' + svg(CATS[c].p, 20) + '</span>' });
  const pop = e => '<div class="mp-card"><div class="mp-thumb">' + pic(e.imgs[0], '96px') + '</div><div class="mp-info"><span class="mp-tag" style="--c:#a53e1a">' + svg(CATS[e.c].p, 14) + '<span>' + esc(t(CATS[e.c].n)) + '</span></span><strong class="mp-name">' + esc(t(e.n)) + '</strong><p class="mp-sum">' + esc(t(e.s)) + '</p><a class="mp-more" href="' + href(e) + '"><span>' + esc(t('عرض التفاصيل')) + '</span>' + ARW + '</a></div></div>';
  const crumb = (items) => '<nav class="ex-crumb" aria-label="' + esc(t('مسار التنقل')) + '"><ol>' + items.map(([n, h]) => h ? '<li><a href="' + h + '">' + esc(t(n)) + '</a></li>' : '<li aria-current="page">' + esc(t(n)) + '</li>').join('') + '</ol></nav>';
  document.addEventListener('DOMContentLoaded', () => { document.querySelectorAll('.footer-links a[href="index.html#luxor"],.footer-links a[href="luxor.html"]').forEach(a => a.href = 'luxor.html'); });
  return { CITIES, CATS, P, PR, AC, q, city, t, lang, cityName, esc, svg, ARW, CLOCK, PIN, all, href, listHref, pic, card, icon, pop, crumb };
})();
