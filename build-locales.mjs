/* Locale paths (Inception Report 3.1, 7.3, 9.4): copies every public page into ar/, en/ and es/.
   Each copy sets lang/dir, a <base href="../"> so assets resolve from the root, its own canonical, og:url and description,
   and keeps page links inside the locale. Also writes one sitemap per locale and a sitemap index. Run: node build-locales.mjs */
import fs from 'node:fs';
import vm from 'node:vm';
const BASE = 'https://nisreen24.github.io/upper-egypt-preview-2026/';
const LOCALES = { ar: { dir: 'rtl', og: 'ar_EG' }, en: { dir: 'ltr', og: 'en_GB' }, es: { dir: 'ltr', og: 'es_ES' } };
const SKIP = new Set(['admin-entry.html', 'admin-queue.html', 'fluid-demo.html', 'design-system.html', 'compliance-audit.html']);
const DESC = {"404.html":["The page you are looking for is not on the Discover Upper Egypt platform.","La página que buscas no está en la plataforma Descubre el Alto Egipto."],"about.html":["About the programme, Fundación CIDEAL, AECID’s support and the purpose of the Discover Upper Egypt platform.","Sobre el programa, la Fundación CIDEAL, el apoyo de AECID y el propósito de la plataforma Descubre el Alto Egipto."],"accessibility.html":["Accessibility statement for the Discover Upper Egypt platform and its conformance with WCAG 2.1 AA.","Declaración de accesibilidad de la plataforma Descubre el Alto Egipto y su conformidad con WCAG 2.1 AA."],"aswan.html":["Aswan guide: sustainable tourism, places worth visiting, where to eat and stay, and the local entrepreneurs.","Guía de Asuán: turismo sostenible, lugares que merecen una visita, dónde comer y alojarse, y los emprendedores locales."],"contact.html":["Contact the Discover Upper Egypt team through the general inquiry form.","Contacta con el equipo de Descubre el Alto Egipto a través del formulario de consulta general."],"destination.html":["A destination in Luxor or Aswan: description, photo gallery, location on the map and the experiences related to it.","Un destino en Luxor o Asuán: descripción, galería de fotos, ubicación en el mapa y las experiencias relacionadas."],"destinations.html":["All destinations in Luxor and Aswan: heritage sites, museums, nature, viewpoints and markets.","Todos los destinos de Luxor y Asuán: sitios patrimoniales, museos, naturaleza, miradores y mercados."],"directory-request.html":["Request the contact directory of tourism organisations in Luxor and Aswan.","Solicita el directorio de contactos de las organizaciones turísticas de Luxor y Asuán."],"edit.html":["Update your entry on the Discover Upper Egypt platform through a one-time link.","Actualiza tu entrada en la plataforma Descubre el Alto Egipto mediante un enlace de un solo uso."],"entrepreneur.html":["An entrepreneur’s profile in Upper Egypt: their story, products and experiences, and a photo gallery.","Perfil de un emprendedor del Alto Egipto: su historia, sus productos y experiencias, y una galería de fotos."],"entrepreneurs.html":["Directory of entrepreneurs in Luxor and Aswan supported by the Helmak programme.","Directorio de emprendedores de Luxor y Asuán apoyados por el programa Helmak."],"event.html":["An event for entrepreneurs and tourism organisations in Upper Egypt: date, place and registration link.","Un evento para emprendedores y organizaciones turísticas del Alto Egipto: fecha, lugar y enlace de inscripción."],"events.html":["Upcoming trainings, forums and gatherings in Luxor and Aswan.","Próximas formaciones, foros y encuentros en Luxor y Asuán."],"experience.html":["An experience or product in Upper Egypt: description, the entrepreneur behind it, photo gallery and location.","Una experiencia o producto del Alto Egipto: descripción, el emprendedor que lo ofrece, galería de fotos y ubicación."],"for-entrepreneurs.html":["For entrepreneurs in Upper Egypt: learning paths, resources, upcoming events and success stories in Luxor and Aswan.","Para emprendedores del Alto Egipto: rutas de aprendizaje, recursos, próximos eventos e historias de éxito en Luxor y Asuán."],"experiences.html":["Experiences and products in Luxor and Aswan: workshops, tours, food, community-based stays and local products.","Experiencias y productos de Luxor y Asuán: talleres, visitas guiadas, gastronomía, alojamientos comunitarios y productos locales."],"index.html":["Discover Upper Egypt: destinations in Luxor and Aswan, authentic experiences, heritage crafts, local entrepreneurs and upcoming events. Your guide to sustainable tourism in southern Egypt.","Descubre el Alto Egipto: destinos de Luxor y Asuán, experiencias auténticas, artesanía tradicional, emprendedores locales y próximos eventos. Tu guía de turismo sostenible en el sur de Egipto."],"learning-path.html":["A step-by-step learning path for entrepreneurs in Upper Egypt.","Una ruta de aprendizaje paso a paso para emprendedores del Alto Egipto."],"luxor.html":["Luxor guide: sustainable tourism, places worth visiting, where to eat and stay, and the local entrepreneurs.","Guía de Luxor: turismo sostenible, lugares que merecen una visita, dónde comer y alojarse, y los emprendedores locales."],"map.html":["Map of destinations, experiences, entrepreneurs and tourism organisations in Luxor and Aswan.","Mapa de destinos, experiencias, emprendedores y organizaciones turísticas de Luxor y Asuán."],"news-article.html":["News from the tourism sector in Upper Egypt.","Noticias del sector turístico del Alto Egipto."],"news.html":["Tourism sector news from Luxor and Aswan.","Noticias del sector turístico de Luxor y Asuán."],"newsletter-confirm.html":["Confirm your subscription to the Discover Upper Egypt newsletter.","Confirma tu suscripción al boletín de Descubre el Alto Egipto."],"newsletter-unsubscribe.html":["Unsubscribe from the Discover Upper Egypt newsletter.","Cancela tu suscripción al boletín de Descubre el Alto Egipto."],"organisation.html":["A tourism organisation in Luxor or Aswan and its public contact routes.","Una organización turística de Luxor o Asuán y sus vías de contacto públicas."],"privacy.html":["Privacy notice: how the Discover Upper Egypt platform collects, uses and keeps personal data.","Aviso de privacidad: cómo la plataforma Descubre el Alto Egipto recoge, usa y conserva los datos personales."],"register-organisation.html":["Register your tourism organisation in the Discover Upper Egypt directory.","Registra tu organización turística en el directorio de Descubre el Alto Egipto."],"resources.html":["Resources and learning paths for entrepreneurs in Upper Egypt: documents, links and videos.","Recursos y rutas de aprendizaje para emprendedores del Alto Egipto: documentos, enlaces y vídeos."],"search.html":["Search destinations, experiences, entrepreneurs and tourism organisations on the Discover Upper Egypt platform.","Busca destinos, experiencias, emprendedores y organizaciones turísticas en la plataforma Descubre el Alto Egipto."],"stakeholders.html":["Map and directory of government bodies, NGOs, universities and private-sector tourism organisations in Luxor and Aswan.","Mapa y directorio de organismos públicos, ONG, universidades y empresas turísticas de Luxor y Asuán."],"stories.html":["Success stories of entrepreneurs in Luxor and Aswan.","Historias de éxito de emprendedores de Luxor y Asuán."],"story.html":["A success story of an entrepreneur from Upper Egypt.","Una historia de éxito de un emprendedor del Alto Egipto."],"update-request.html":["Request a link to update your entry on the Discover Upper Egypt platform.","Solicita un enlace para actualizar tu entrada en la plataforma Descubre el Alto Egipto."]};

/* per-locale dictionary (9.2): the Arabic copy needs no translations, the others only their own column */
const I18N_SRC = fs.readFileSync("i18n.js", "utf8");
const dStart = I18N_SRC.indexOf("  const D = {"), dEnd = I18N_SRC.indexOf("\n  };", dStart) + "\n  };".length;
const D_ALL = new Function("return " + I18N_SRC.slice(dStart + "  const D = ".length, dEnd - 1))();
for (const L of Object.keys(LOCALES)) {
  /* 6.3: the Spanish dictionary keeps the English string of any key that has no Spanish yet, so the page falls back to English */
  const D = {}; if (L !== "ar") for (const k in D_ALL) { const e = D_ALL[k]; if (!e) continue; if (e[L] != null) D[k] = { [L]: e[L] }; else if (L === "es" && e.en != null) D[k] = { en: e.en }; }
  const out = I18N_SRC.slice(0, dStart) + "  const D = " + JSON.stringify(D) + ";" + I18N_SRC.slice(dEnd);
  new Function(out); fs.writeFileSync("i18n." + L + ".js", out);
}

/* ---- localized slugs (9.4): page names per locale and entry slugs derived from the entry's name in each language ---- */
const PAGE_NAMES = { 'about.html': ['عن-المشروع', 'sobre-el-proyecto'], 'accessibility.html': ['إمكانية-الوصول', 'accesibilidad'], 'aswan.html': ['أسوان', 'asuan'], 'contact.html': ['تواصل', 'contacto'],
  'destination.html': ['وجهة', 'destino'], 'destinations.html': ['الوجهات', 'destinos'], 'edit.html': ['تعديل', 'editar'], 'entrepreneur.html': ['رائد-أعمال', 'emprendedor'], 'entrepreneurs.html': ['رواد-الأعمال', 'emprendedores'],
  'event.html': ['فعالية', 'evento'], 'events.html': ['الفعاليات', 'eventos'], 'experience.html': ['تجربة', 'experiencia'], 'experiences.html': ['التجارب-والمنتجات', 'experiencias-y-productos'], 'for-entrepreneurs.html': ['لرواد-الأعمال', 'para-emprendedores'], 'learning-path.html': ['مسار-تعلم', 'ruta-de-aprendizaje'],
  'luxor.html': ['الأقصر', 'luxor'], 'map.html': ['الخريطة', 'mapa'], 'news-article.html': ['خبر', 'noticia'], 'news.html': ['الأخبار', 'noticias'], 'newsletter-confirm.html': ['تأكيد-النشرة', 'confirmar-boletin'], 'newsletter-unsubscribe.html': ['إلغاء-النشرة', 'baja-boletin'],
  'organisation.html': ['جهة', 'organizacion'], 'privacy.html': ['الخصوصية', 'privacidad'], 'register-organisation.html': ['تسجيل-جهة', 'registrar-organizacion'], 'resources.html': ['الموارد', 'recursos'], 'search.html': ['بحث', 'buscar'],
  'stakeholders.html': ['الجهات-السياحية', 'actores-turisticos'], 'stories.html': ['قصص-النجاح', 'historias-de-exito'], 'story.html': ['قصة', 'historia'], 'update-request.html': ['طلب-تحديث', 'solicitud-de-actualizacion'] };
const slugify = s => String(s).normalize('NFC').replace(/[\u064B-\u0652\u0640]/g, '').replace(/[“”"'’‘()،,.:;!?؟«»\/]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
const ctx = { encodeURI, encodeURIComponent, console }; ctx.window = ctx; ctx.self = ctx; vm.createContext(ctx);
['destinations.js', 'experiences.js', 'entrepreneurs.js', 'content.js', 'resources.js'].forEach(f => vm.runInContext(fs.readFileSync(f, 'utf8'), ctx));
const tr = (name, l) => (D_ALL[name] && D_ALL[name][l]) || null;
const pages = {}; Object.keys(PAGE_NAMES).forEach(f => { pages[f] = { ar: PAGE_NAMES[f][0], en: f.replace(/\.html$/, ''), es: PAGE_NAMES[f][1] }; });
const entries = {}, used = { ar: new Set(), es: new Set() };
const addEntry = (slug, name) => { if (!slug || entries[slug]) return; const e = { ar: slugify(name) || slug, en: slug, es: slugify(tr(name, 'es') || tr(name, 'en') || slug) || slug }; ['ar', 'es'].forEach(l => { let v = e[l], n = 2; while (used[l].has(v)) v = e[l] + '-' + (n++); used[l].add(v); e[l] = v; }); entries[slug] = e; };
ctx.DESTINATIONS.list.forEach(d => addEntry(d.slug, d.n)); ctx.EXPERIENCES.list.forEach(e => addEntry(e.slug, e.n)); ctx.ENTREPRENEURS.list.forEach(e => addEntry(e.slug, e.name));
['stories', 'events', 'organisations', 'news'].forEach(k => (ctx.CONTENT[k] || []).forEach(x => addEntry(x.slug, x.n)));
(ctx.RESOURCES.list || []).forEach(r => addEntry(r.slug, r.n)); (ctx.RESOURCES.paths || []).forEach(p => addEntry(p.slug, p.n)); (ctx.RESOURCES.events || []).forEach(x => addEntry(x.slug, x.n));
const rev = {}; Object.entries(entries).forEach(([k, v]) => ['ar', 'es'].forEach(l => { if (v[l] !== k) rev[v[l]] = k; }));
const pageRev = {}; Object.entries(pages).forEach(([f, v]) => ['ar', 'en', 'es'].forEach(l => { pageRev[v[l]] = f; }));
fs.writeFileSync('slugs.js', '/* generated by build-locales.mjs: localized page names and entry slugs (Inception Report 9.4) */\nwindow.SLUGS = ' + JSON.stringify({ pages, entries, rev, pageRev }) + ';\n');
const pageName = (f, L) => pages[f] ? pages[f][L] + '.html' : f;
const slugOut = (q, L) => q.replace(/([?&]slug=)([^&#"]*)/, (x, k, v) => { const e = entries[v]; return k + (e ? e[L] : v); });
const enc = p => encodeURI(p);

/* ---- images (9.2): AVIF with WebP fallback for every eager image; lazy-loaded (data-src) images and the stories reel keep WebP ---- */
const toAvif = s => s.replace(/\.webp(?=\s|,|"|$)/g, '.avif');
const hasAvif = src => { try { return fs.existsSync(decodeURI(src.replace(/\.webp$/, '.avif'))); } catch { return false; } };
function pictures(html) {
  const parts = html.split(/(<div class="xh-reel"[\s\S]*?<\/div>)/);
  return parts.map((part, i) => i % 2 ? part : part
    /* existing <picture> (home hero): an AVIF source before each WebP source, plus one for the img's own srcset */
    .replace(/<picture>([\s\S]*?)<\/picture>/g, (m, inner) => {
      let out = inner.replace(/<source ([^>]*srcset="[^"]*\.webp[^"]*"[^>]*)>/g, (sm, attrs) => '<source type="image/avif" ' + toAvif(attrs) + '>' + sm);
      const img = inner.match(/<img [^>]*srcset="([^"]*)"[^>]*>/); if (img) { const sizes = (img[0].match(/sizes="([^"]*)"/) || [])[1]; out = out.replace(/(<img )/, '<source type="image/avif" srcset="' + toAvif(img[1]) + '"' + (sizes ? ' sizes="' + sizes + '"' : '') + '>$1'); }
      return '<picture>' + out + '</picture>';
    })
    /* standalone eager <img> with a WebP src; an <img> already inside a <picture> is left alone (a nested <picture> hid the mobile sources) */
    .split(/(<picture>[\s\S]*?<\/picture>)/).map((seg, k) => k % 2 ? seg : seg.replace(/<img ([^>]*)>/g, (m, attrs) => {
      if (/data-src=|class="[^"]*\blz\b/.test(attrs)) return m;
      const src = (attrs.match(/\ssrc="(ASSETS\/[^"]*\.webp)"/) || [])[1]; if (!src || !hasAvif(src)) return m;
      const srcset = (attrs.match(/srcset="([^"]*)"/) || [])[1]; const sizes = (attrs.match(/sizes="([^"]*)"/) || [])[1];
      return '<picture><source type="image/avif" srcset="' + toAvif(srcset || src) + '"' + (sizes ? ' sizes="' + sizes + '"' : '') + '><img ' + attrs + '></picture>';
    })).join(''));
  }
  /* picture wrapping must not touch script-generated markup inside <script> blocks */
function picturesOutsideScripts(html) { return html.split(/(<script[\s\S]*?<\/script>)/).map((p, i) => i % 2 ? p : pictures(p)).join(''); }
const PAGES = fs.readdirSync('.').filter(f => f.endsWith('.html') && !SKIP.has(f)).sort();
const NOINDEX = new Set(['404.html', 'edit.html', 'newsletter-confirm.html', 'newsletter-unsubscribe.html', 'search.html']);
for (const L of Object.keys(LOCALES)) {
  fs.rmSync(L, { recursive: true, force: true }); fs.mkdirSync(L, { recursive: true });
  for (const f of PAGES) {
    let s = fs.readFileSync(f, 'utf8');
    s = s.replace(/<html lang="ar" dir="rtl"([^>]*)>/, (m, rest) => '<html lang="' + L + '" dir="' + LOCALES[L].dir + '"' + rest.replace(/ class="([^"]*)"/, (m2, c) => ' class="' + (c + (L === 'ar' ? '' : ' lang-latin')).trim() + '"') + (L !== 'ar' && !/class=/.test(rest) ? ' class="lang-latin"' : '') + '>');
    s = s.replace('<script src="i18n.js"></script>', '<script src="i18n.' + L + '.js"></script>');
    s = s.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="../">');
    s = s.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + BASE + L + '/' + enc(pageName(f, L)) + '">');
    s = s.replace(/<link rel="alternate" hreflang="(ar|en|es|x-default)" href="[^"]*">/g, (m0, h) => '<link rel="alternate" hreflang="' + h + '" href="' + BASE + (h === 'x-default' ? 'ar' : h) + '/' + enc(pageName(f, h === 'x-default' ? 'ar' : h)) + '">');
    s = s.replace(/<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="' + BASE + L + '/' + enc(pageName(f, L)) + '">');
    s = s.replace(/<meta property="og:locale" content="[^"]*">/, '<meta property="og:locale" content="' + LOCALES[L].og + '">');
    if (L !== 'ar' && DESC[f]) { const d = DESC[f][L === 'en' ? 0 : 1].replace(/"/g, '&quot;'); s = s.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + d + '">').replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + d + '">').replace(/<meta name="twitter:description" content="[^"]*">/, '<meta name="twitter:description" content="' + d + '">'); }
    /* static page links stay inside the locale; in-page anchors keep the page */
    s = s.replace(/(href|data-href)="([\w-]+\.html)((?:\?[^"#]*)?)((?:#[^"]*)?)"/g, (m0, attr, file, q, hash) => attr + '="' + L + '/' + pageName(file, L) + slugOut(q, L) + hash + '"');
    s = s.replace(/href="#([^"]*)"/g, 'href="' + L + '/' + pageName(f, L) + '#$1"');
    s = picturesOutsideScripts(s);
    if (L !== 'ar') s = s.replace(/fonts\/sub\/ibm-plex-sans-arabic-(400|700)\.woff2" as="font"/g, 'fonts/sub/ibm-plex-sans-$1.woff2" as="font"');
    if (f === 'index.html') s = s.replace('<link rel="preload" href="fonts/sub/', '<link rel="preload" as="image" type="image/avif" imagesrcset="ASSETS/hero-bg-1440.avif 1440w, ASSETS/hero-bg.avif 1567w" imagesizes="100vw" media="(min-width:640px)" fetchpriority="high">\n<link rel="preload" href="fonts/sub/');
    /* learning path: without JavaScript the reader still gets every published path with its steps (titles from the dictionary, English when a translation is missing) */
    if (f === 'learning-path.html') {
      const T = n => (L === 'ar' ? n : (tr(n, L) || tr(n, 'en') || n));
      const esc = x => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const stepsOf = p => p.plan ? p.plan.map(x => x.t) : p.steps.map(sl => { const r = (ctx.RESOURCES.list || []).find(x => x.slug === sl); return r ? r.n : null; }).filter(Boolean);
      const list = (ctx.RESOURCES.paths || []).filter(p => !p.draft).map(p => '<li><a href="' + L + '/' + pageName(f, L) + '?slug=' + encodeURIComponent(entries[p.slug] ? entries[p.slug][L] : p.slug) + '">' + esc(T(p.n)) + '</a><ol>' + stepsOf(p).map(n => '<li>' + esc(T(n)) + '</li>').join('') + '</ol></li>').join('');
      s = s.replace('<div id="exCrumb"></div>', '<div id="exCrumb"></div>\n      <noscript><ul class="lpd-noscript">' + list + '</ul></noscript>');
    }
    fs.writeFileSync(L + '/' + pageName(f, L), s);
  }
}
/* sitemaps: one per locale in an index (9.4) */
const today = new Date().toISOString().slice(0, 10);
const url = (L, f) => '  <url><loc>' + BASE + L + '/' + enc(pageName(f, L)) + '</loc>' + ['ar', 'en', 'es'].map(x => '<xhtml:link rel="alternate" hreflang="' + x + '" href="' + BASE + x + '/' + enc(pageName(f, x)) + '"/>').join('') + '<lastmod>' + today + '</lastmod></url>';
/* every published learning path has its own address per locale (9.4) */
const pathUrl = (L, p) => { const e = entries[p.slug]; const at = x => BASE + x + '/' + enc(pageName('learning-path.html', x)) + '?slug=' + encodeURIComponent(e ? e[x] : p.slug); return '  <url><loc>' + at(L) + '</loc>' + ['ar', 'en', 'es'].map(x => '<xhtml:link rel="alternate" hreflang="' + x + '" href="' + at(x) + '"/>').join('') + '<lastmod>' + today + '</lastmod></url>'; };
const livePaths = (ctx.RESOURCES.paths || []).filter(p => !p.draft);
for (const L of Object.keys(LOCALES)) fs.writeFileSync('sitemap-' + L + '.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + PAGES.filter(f => !NOINDEX.has(f)).map(f => url(L, f)).concat(livePaths.map(p => pathUrl(L, p))).join('\n') + '\n</urlset>\n');
fs.writeFileSync('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + Object.keys(LOCALES).map(L => '  <sitemap><loc>' + BASE + 'sitemap-' + L + '.xml</loc><lastmod>' + today + '</lastmod></sitemap>').join('\n') + '\n</sitemapindex>\n');
console.log('locale copies: ' + PAGES.length + ' pages × ' + Object.keys(LOCALES).length + ' locales; sitemaps written');
