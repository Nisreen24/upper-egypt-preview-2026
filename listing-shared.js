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
  return { CITIES, CATS, P, PR, AC, q, city, t, lang, cityName, esc, svg, ARW, CLOCK, PIN, all, href, listHref, pic, card, icon, pop, crumb };
})();
