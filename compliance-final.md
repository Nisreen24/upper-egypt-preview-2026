# Final pre-delivery check — Discover Upper Egypt prototype

Date: 2026-10-29 · Repository: https://github.com/Nisreen24/upper-egypt-preview-2026 (branch `main`) · Published: https://nisreen24.github.io/upper-egypt-preview-2026/

Sources of truth: Inception Report v1.2 (text extracted from `DUE_InceptionReport_V1.2.docx`, sections 2–7 and 9; Figures 4–28 extracted from the same file), the eleven locked decisions, and `design-system.html`.

Method: everything below was run against `node serve.mjs` on `http://localhost:3002` after `node build-locales.mjs`, driven by headless Chrome through Puppeteer (the project's installed browser driver; Playwright is not installed and would have driven the same Chrome). Scripts and raw results live in `.cache/final/` (ignored by git): `crawl.mjs` → `crawl.json` (396 pages, 20 343 links, 84 pages at 390 px), `flows*.mjs` → `flows*.json`, `axe-perf.mjs` → `axe-perf.json` (axe-core 4.10.2 on 28 templates × 3 locales, CDP byte counts), `probe*.mjs`, `recheck.mjs`. No judgement relies on commit messages or on the old `compliance-audit.html` (now removed).

Commits reviewed: `4f391ef` (design pass, state at the start of the check) → fixes in `f5b07a9` → this report. Two passes: the first was read-only; the fixes below were then applied and the affected checks re-run.

## 1. Summary

| Verdict | Rows |
|---|---|
| Pass | 72 (11 of them after a fix made during this check) |
| Fail (recorded, not fixed: outside the locked decisions) | 5 |
| Not applicable in the static prototype | 2 rows + the list in §9 |
| Needs decision | 2 rows + the list in §10 |

Fixed during this check (commit `f5b07a9`): locked decisions 3, 4, 6 and 11; mobile overflow on four listing templates; search/stories hero overflow at 1440 px; resources and entrepreneurs filter state lost on refresh; the profile-update answer revealing a match; empty-state pages without an H1; the edit page with two H1s; five axe violation types.

Remaining Fail list, by severity:
1. **Detail canonicals without the entry slug** (entrepreneur and story templates, 23 URLs per locale): `canonical` and `hreflang` point at the bare template, so every entrepreneur or story shares one canonical. Destination, experience, event, organisation and learning-path pages do carry the slug. SEO §9.4. Evidence: `.cache/final/summary.json` → `detailCanonicalWithoutSlug_*`.
2. **Arabic city guide over the 500 KB non-image budget** (`/ar/الأقصر.html`: 682 KB; EN/ES 375 KB). The Arabic copy loaded the map library (244 KB, deferred) and the larger Arabic font set (300 KB) inside the measurement window. §9.2.
3. **Learning-path detail loads 2.9 MB of images at 1440 × 900** (step thumbnails and related stories are not lazy below the fold). §9.2.
4. **Control boundaries under 3:1**: filter chips and cards use a 16 % ink border on cream (≈1.4:1). Text and focus rings pass; the boundary rule in §9.3 does not. Design-system token question.
5. **Search results page not in the sitemaps** (`/ar/بحث.html`, `/en/search.html`, `/es/buscar.html`) and without a `robots` meta. Harmless if intended; record only.

## 2. Locked decisions

| # | Expected | Actual | Verdict | Evidence |
|---|---|---|---|---|
| 1 | Three request types; no directory-request page or type; contact form = name, email, subject, message, consent, Turnstile placeholder | Forms: `contact.html`, `register-organisation.html`, `update-request.html`. Contact fields rendered: `name*`, `email*`, `subject*` (select), `message*`, `c_contact*`, `.f-turnstile` placeholder, privacy link. Queue `TYPE` map has `general`, `registration`, `update` only. `grep -ri directory-request` over the repo = 0 (one leftover description key in `build-locales.mjs` removed) | Pass | `flows.json` → `form_contact`; `admin-queue.html:70`; §4 grep table |
| 2 | Header: Home, Explore, For Entrepreneurs, For Tourism Stakeholders, About, Contact; Explore = Luxor, Aswan, Destinations, Experiences and Products, Map | Every one of the 396 crawled pages renders exactly six `.nav-link` items in that order; Explore menu = الأقصر, أسوان, الوجهات, التجارب والمنتجات, الخريطة (no Entrepreneurs) | Pass | `summary.json` → `navNotSix` (0); `flows.json` → `home_keyboard.navItems`, `.explore` |
| 3 | Home 8 blocks, no newsletter; newsletter only in Contact side panel; About 4 sections; city guide = the 10 sections of §3.5 (Figure 6) in order, no "Where to buy" | Home sections in DOM order: hero, Luxor+Aswan, featured destinations, featured experiences, featured entrepreneurs, success stories, upcoming events, two audience links (8). No newsletter form on Home. About: 01 هوية البرنامج, 02 السياق المحلي, 03 ما أُنجز, 04 ما القادم. Luxor/Aswan: hero, السياحة المستدامة, عن المدينة, أهم الأنشطة, أماكن تستحق الزيارة, أماكن تناول الطعام, أماكن الإقامة, رواد الأعمال, معلومات عملية (accordion), الخريطة = 10, no "where to buy". **Found: a newsletter block on the resources page** (`resources.html:568–584` + its script) → removed | Pass after fix | `flows.json` → `home_keyboard.homeSections`, `luxor.h2`; `recheck.json` → `resources_newsletter.newsForm=false` |
| 4 | Travel ideas, planner, background audio, favourites, weather, hotels, "Tours" nav, Leaflet removed everywhere incl. built copies; grep for the 12 terms = 0 | First pass: `compliance-audit.html` (quoted every term), `winter-palace-hotel` organisation + "فندق ونتر بالاس" as a forum venue in `content.js`, 24 unreferenced hotel photos `ASSETS/stay-{winter-palace,steigenberger,sonesta,jolie-ville}-*`, unused `heart`/`heart-fill` icons, "heart" in four English phrases, "medio ambiente" (Spanish) and the words quoted in `compliance-verification.md`. All removed or reworded. Second pass: every term 0 in tracked and built files (only `.git/logs` match, which is history, not content). No `leaflet` script; `window.L` is the MapLibre wrapper in `maps.js` | Pass after fix | §4 grep table; `recheck.json` → `stakeholders.cards=7`, `forum_venue.hotel=false` |
| 5 | MapLibre GL with MapTiler tiles from one config constant; list view beside the map; library after first paint | `maps.js`: `MAP_CONFIG.maptilerKey` (empty → OpenFreeMap demo style), `maplibregl` loaded on `window.load` + `setTimeout(0)`; no `<script src*=maplibre>` in HTML. Map page: list beside the map (same result set, 40 markers, six cards per page). **Stakeholders page**: the client asked today for the card grid under the filters and the map at the end of the page, so the list is no longer beside the map there (Figure 19 / this decision) | Needs decision | `flows.json` → `stakeholders_map` (maplibre true, leaflet false, libLoadedAfterPaint true, key empty); screenshot-498-map-list.png |
| 6 | Drawer order Larger, Smaller, Underline links, Reduce motion, Big cursor, High contrast, Readable font, Reset; removed voice/read-aloud/invert/guide/grayscale/hide-images/brightness/tooltips; keyboard, Esc returns focus, aria-pressed, prefers-reduced-motion; templates pass WCAG 2.1 AA | Tiles in order `text-inc, text-dec, links, motion, cursor, contrast, readable`, then Reset (disabled until a change). Open by keyboard → focus on close button; Enter on a tile → `aria-pressed=true`, `--a11y-scale 1.125`; Esc closes and returns focus to `#a11yOpen`; with `prefers-reduced-motion: reduce` the page loads with `a11y-motion` set. No removed feature in code or dictionary; `design-system.html` mentioned a "tooltip layer" twice → removed. axe first pass: 4 violation types on 84 pages (`aria-allowed-attr` on the header search input on every page, scrollable events rail, `aria-label` on a plain div, breadcrumb contrast on About, `aria-pressed` on map-page links) → fixed; second full pass (84 pages): see §7 | Pass after fix | `flows.json` → `drawer`; `axe-perf.json`; `recheck.json` → `home_events_rail` |
| 7 | Only info@discoverupperegypt.com; programme code 2022-PCONV-000504; hero collage labelled sample; no ShareAlike images; rights-register.md exists | `info@discoverupperegypt.com` ×35; the only other addresses are sample contact emails of demo entrepreneurs/organisations in the CMS mock (`@example.com`). Code `AECID 2022-PCONV-000504` in `content.js` and on About. `.hero-sample` note under the home hero ×2. `rights-register.md` (54 lines) lists every third-party item; CC BY-SA items are marked "Withdrawn (ShareAlike) · awaiting CIDEAL" | Pass | §4 email grep; `about.html` facts card; `rights-register.md:9–13` |
| 8 | Stories page = Wireframe 14: title, City/Pillar/Entrepreneur dropdowns with state in URL, featured story, 3-column grid, Load more | `#ddCity`, `#ddPil`, `#ddEnt` dropdowns; `?city=luxor` survives a refresh; featured story `article.stl-feat#stLead`; grid 3 columns; `#stMore` "تحميل المزيد" present, hidden because the sample data has 3 stories (fewer than one page) | Pass (Load more: N/A with sample data) | `flows.json` → `filter_stories`, `load_more` |
| 9 | Learning path = Wireframe 8: title, "N steps · open access, no registration", numbered steps with resource types, the ordered-reading note, related stories; no hero, side column, newsletter, "Other paths", "Start the path" | Markup: `section.lpd` (title, "6 خطوات · وصول مفتوح، بدون تسجيل", numbered steps with document/video/link rows), note "قراءة مرتبة: لا تسجيل، ولا تتبع للتقدم، ولا شهادات.", `#lpStories` related stories, `#lpdNoSteps` empty state. No hero/side/newsletter markup (the only `xh-media`/`dx-side` strings are in shared CSS); no "ابدأ المسار" or "مسارات أخرى" | Pass | `learning-path.html:512, 702`; §2 greps |
| 10a | Sticky bar → current locale's contact page, no booking wording | `#xpBarCta`: AR "تواصل مع مقدّم التجربة" → `ar/تواصل.html?subject=general`; EN "Contact the host" → `en/contact.html?subject=general`; ES "Contactar con el anfitrión" → `es/contacto.html?subject=general`; no حجز/book/reserv | Pass | `flows4.json` → `sticky_*` |
| 10b | City map popups: "View details" only where a page exists | Luxor: 15 markers, 15 popups, every popup link resolves to a destination/experience page, 0 `href="#"`; Aswan: 18 markers, 1 popup without a details link (place without a page), 0 bad hrefs | Pass | `flows3.json` → `map_popups_*` |
| 10c | "Manal" spelled Awadallah in every language | AR "منال عوض الله", EN/ES "Manal Awadallah"; 0 matches for Awaga/Awadalla/عوجة on the three profile pages | Pass | `flows.json` → `manal` |
| 10d | Publishing with a missing translation needs explicit confirmation (§4.3) | `admin-entry.html`: with Spanish missing, Publish opens `confirm("الترجمة ناقصة (es)… تأكيد النشر؟")`; Dismiss leaves the status unchanged; Accept publishes flagged "ترجمات ناقصة: es"; missing English → `alert` and no publish; contributor/coordinator roles → `alert`, no publish. (All 25 sample entries are fully translated, so the missing translation was simulated by stubbing `I18N.lookup` for `es`) | Pass | `flows4.json` → `cms_confirm` |
| 10e | Fourth request type gone | See decision 1 | Pass | — |
| 11 | design-system.html documents what the pages use and mentions no removed component | Sections 01–09 (foundations → inventory). No planner/favourites/weather/Leaflet/voice/invert/grayscale/guide/hide-images/brightness; "tooltip" mentions removed; the inventory now lists the Pager added today and the carousel navigation without dots | Pass after fix | `design-system.html` inventory table |

## 3. Check A — Routes (crawl of every internal link, three locales)

Crawler: seeds = the three sitemaps + `/{locale}/index.html`; every internal `<a href>` on every rendered page was followed (query strings kept). Desktop 1440 × 900: 396 pages. Phone 390 × 844: the 84 distinct pages without query.

| Check | Result | Verdict |
|---|---|---|
| HTTP status | 396/396 return 200; 0 404 | Pass |
| Console and page errors | 0 console errors, 0 uncaught errors on 396 pages (the `NAV:` entries in `crawl.json` are the crawler's own CDP call, see `summary.json`) | Pass |
| `href="#"` / `javascript:` | 0 | Pass |
| Links that drop the locale | 0 (every internal link resolves under `/ar/`, `/en/` or `/es/`; `locale.js` localises page names and entry slugs) | Pass |
| Links to the wrong page | 198 card/CTA links whose label is not the destination H1 were reviewed: all are generic CTAs ("استكشف المزيد" → hub pages, "سجّل الآن" → contact form with subject, video rows → resources player with `?q=`, "Event details" → the event). No link opens a different entity than its card | Pass |
| Buttons with no effect | Buttons without a direct listener on 14 templates are all driven by delegated handlers and were exercised: pager (page 2 renders 6 new cards and `?page=2`), "شاهد الفيديو" (opens the YouTube player iframe), gallery thumbnails (open the `<dialog>`), map list names (highlight the marker) | Pass |
| Orphan pages | 0 (every 200 page has at least one incoming link from another page) | Pass |
| Sitemaps | Every sitemap entry returns 200 in its locale; every crawled page without query is in its locale's sitemap except the search results page (ar/en/es) | Pass (search: recorded, §1 item 5) |
| Canonical and hreflang | Template URLs: canonical = own URL, hreflang `ar`/`en`/`es`/`x-default` present and the current locale's entry equals the page, on all 396 pages. Detail pages: destination, experience, event, organisation, learning-path carry the localised `?slug=`; entrepreneur and story do not | Fail (recorded, §1 item 1) |
| Language switch keeps page, slug, query | ar experience `?city=luxor&slug=hot-air-balloon` → `/en/experience.html?city=luxor&slug=hot-air-balloon`; ar story → `/es/historia.html?slug=de-una-tienda-…`; listing `?city=aswan&category=workshop` → same query on `/en/experiences.html`; map `?type=experience&page=2` kept; EN → AR gives the Arabic slug `?slug=رحلات-المناطيد` | Pass |
| Breadcrumbs, CTAs, list cards open the right entity from lists, Home, city guides, map and search | Covered by the crawl above plus the map popups (10b) and search rows (B9) | Pass |
| Phone width 390 | First pass: experiences, map, news, entrepreneurs (×3 locales) rendered at 1040 px because the result grid kept three fixed 320 px columns inside an intrinsically sized grid track. Fixed (`site.css`: `#exList .ex-body{grid-template-columns:minmax(0,1fr)}`, same for the map split). Re-check: scrollWidth 390 on all five | Pass after fix |
| Desktop overflow | First pass: search page 1504 px (hero wider than its column, not centred). Fixed with negative margins; stories hero likewise. Re-check: 1440 | Pass after fix |

## 4. Check B — Flows

| Flow | Result | Verdict |
|---|---|---|
| Contact form | Empty submit: five "هذا الحقل مطلوب." / "هذه الموافقة مطلوبة." texts, status text, focus moves to `name`. Filled without the Turnstile placeholder: "أكمل خطوة التحقق أولًا." and focus on the placeholder button. Placeholder ticked: "تم استلام رسالتك… نرد خلال خمسة أيام عمل. رقم الطلب: …". Privacy link inside the form. Side panel carries the newsletter (only place on the site) | Pass |
| Organisation registration | Same validation pattern; success "تم استلام طلب التسجيل… يُراجع الطلب خلال عشرة أيام عمل، وعند الموافقة تُنشأ صفحة الجهة كمسودة…" | Pass |
| Profile-update link request | First pass: known address got an extra "(نموذج: افتح رابط التحديث…)" link, unknown did not → the answer revealed a match. Fixed: both answers are byte-identical (`recheck.json` → `update_identical.same=true`, 0 links); the prototype's shortcut to the one-time link now sits on the queue item (`admin-queue.html`, `.ad-demo`) | Pass after fix |
| Queue statuses | Four submissions above appear as rows (type, email, received, due, assignee, status "جديد"); statuses `new → in_review → approved / rejected / closed`; "بدء المراجعة" moves a row to "قيد المراجعة"; per-type actions; assignee, internal note, reply fields; CSV export button | Pass |
| Filters: destinations | `?city=aswan` chip pressed, count "6 وجهات", identical after refresh | Pass |
| Filters: experiences | `?city=luxor&category=workshop`, 1 card, identical after refresh | Pass |
| Filters: resources (and entrepreneurs) | First pass: ticking "بدء المشروع" wrote `/?topic=start` (relative `?` resolved against the locale copy's `<base href="../">`) → a refresh landed on the home page. Fixed: absolute `location.pathname`. Re-check: `/ar/الموارد.html?topic=start`, 7 rows, checkbox and 7 rows after refresh; entrepreneurs `?act=stay` likewise | Pass after fix |
| Filters: stories | `?city=luxor`, 1 story, identical after refresh | Pass |
| Search grouped by type | "أسوان": 11 results in 4 groups — الوجهات (3), التجارب والمنتجات (4), رواد الأعمال (1), الجهات السياحية (3) | Pass |
| Load more | Button present; hidden because 3 sample stories fit one page | N/A (sample data) |
| Carousels by keyboard | Home gems strip: Tab from the first card visits all four cards in order (each with a visible outline), then the Next button; thumbnail rails are focusable (`tabindex=0` added to the events rail) | Pass |

## 5. Check C — Empty states and validation

| Case | Result | Verdict |
|---|---|---|
| Wrong, empty or unpublished slug (learning path first, then experience, destination, entrepreneur, organisation, event, story, news, edit token) in ar/en/es | Each template shows its message with a link back to the listing ("هذا المسار غير موجود. العودة إلى الموارد", "This story does not exist.", "Esta organización no existe.", "هذا الرابط غير صالح.") and no JS errors. First pass: the message was a `<p>` under a hidden hero, so the page had no H1. Fixed in `entry-engine.js`, `experience.html` and `learning-path.html`: the empty state carries an H1 (and the title where the page does not set its own) | Pass after fix |
| Zero-result list | `experiences.html?q=zzzzqq`: `#exEmpty` shown, 0 cards, "مسح الفلاتر" restores 12; search "zzzzqq": "لا توجد نتائج مطابقة…" | Pass |
| Path with no steps | `#lpdNoSteps` section exists and is shown when a path has no resources; no sample path is empty, so verified by markup | Pass (by code) |
| Section with no content is hidden | For Entrepreneurs hides the events section when none are upcoming (`$('events').hidden = !ev.length`); city sections are hidden when their source is empty; About/organisation empty blocks hidden by `entry-engine` | Pass |
| Missing translation falls back to English, no Arabic in EN/ES | EN and ES hub and listing pages: 0 Arabic fragments in `<main>`; ES For Entrepreneurs falls back to English copy where no Spanish exists | Pass |
| 404 in three languages | `/ar/404.html` "هذه الصفحة غير موجودة", `/en/404.html` "This page does not exist", `/es/404.html` "Esta página no existe", each with a home link and the right `lang` | Pass |
| Form error states | See §4 | Pass |

## 6. Check D — Accessibility (§9.3)

| Check | Result | Verdict |
|---|---|---|
| Skip link | Present on all 396 pages, visible on focus (top 16 px, solid outline), target exists (`main#main`; Home uses `main#top`) | Pass |
| One H1, heading order | 0 pages with heading-level skips; after the fixes every page has exactly one visible H1 (empty states, edit page) | Pass after fix |
| Alt text in the active language | 0 images without an `alt` attribute on 396 pages; alt strings go through the dictionary (`t(im.alt)`) | Pass |
| Stretched Arabic letters | No tatweel (ـ) in any page except `fluid-demo.html` (internal demo); no `text-align: justify` | Pass |
| Visible focus ring | `outline-style: solid` on the focused skip link and on each focused card CTA | Pass |
| 3:1 boundaries | Form field borders `#57534e` on white = 7.0:1; focus ring ink. Filter chips and cards: 16 % ink border on cream ≈ 1.4:1 | Fail (recorded, §1 item 4) |
| axe-core (wcag2a/aa, wcag21a/aa) on 28 templates × 3 locales | First pass: 84 pages, 6 with violations after the search-input fix (`color-contrast` on About ×3, `aria-allowed-attr` on map ×3). All fixed; targeted re-run on About (ar/en), map (ar/en/es), Home, Luxor: 0 violations. Full re-run: see the line below | Pass after fix |

Full axe re-run after the fixes (28 templates × 3 locales = 84 pages, axe-core 4.10.2, WCAG 2.0/2.1 A and AA rules): **0 violations on 0 pages** (`.cache/final/axe-perf.json`, third run).

## 7. Check E — Performance (§9.2) and SEO (§9.4)

Compressed transfer sizes (gzip served by `serve.mjs`, bytes over the wire, measured with CDP `encodedDataLength` until network idle at 1440 × 900):

| Template | Non-image (KB) ar / en / es | Critical path approx. (HTML + CSS + JS + first font) | Images (KB) | Verdict vs 500 KB / 250 KB |
|---|---|---|---|---|
| Home | 360 / 360 / 362 | 193 / 240 / 242 | 420–438 | Pass |
| City guide (Luxor) | **682** / 375 / 377 | 442 / 252 / 254 | 1 363–1 395 + 360 tiles (ar) | Fail for AR (map library 244 KB and Arabic fonts 300 KB counted) |
| Listing (experiences) | 358 / 305 / 307 | 136 / 182 / 184 | 604–953 | Pass |
| Detail (experience) | 369 / 316 / 318 | 147 / 193 / 195 | 753–772 | Pass |
| Map page (budget 900 KB excl. images) | 392 + 308 tiles / 339 / 341 | — | 572–882 | Pass |

The "critical path" column counts all CSS and JS loaded by the page plus the first 60 KB of fonts; the real critical path is smaller because `maps.js`, `search-suggest.js` and the motion scripts are deferred. Images: learning-path detail loads 2.9 MB of images at 1440 × 900 (§1 item 3).

| SEO | Result | Verdict |
|---|---|---|
| Title, description, canonical, hreflang (ar/en/es/x-default), Open Graph (title, image, url), Twitter card | Present on all 396 pages; `lang` and `dir` match the locale | Pass |
| JSON-LD | `WebSite` (home), `TouristAttraction` (destinations/experiences, 96), `Product` (12), `LocalBusiness` (12), `Event` (12), `Organization` (24); 0 invalid | Pass (listing/static pages carry none: N/A per §9.4 scope) |
| Localised slugs | `/ar/تجربة.html?slug=رحلات-المناطيد`, `/es/historia.html?slug=de-una-tienda-…`, `/en/learning-path.html?slug=how-to-start-a-business` | Pass |
| Detail canonicals | See §3 | Fail (recorded) |
| Animations still play | Luxor hero expands on scroll (300 → 1368 px), first content block reveals (`.xc` opacity 1), home strips move with arrows, `:hover` rules present; home gem cards no longer animate on entry by the client's request today | Pass |

## 8. Check F — Report conformance

Sitemap tree (§3.2, Figure 4): every node exists under each locale — Home; Explore → Luxor, Aswan, Destinations (+ destination), Experiences and Products (+ experience), Map; For Entrepreneurs → Resources (+ resource rows), Learning Paths (+ path), Events (+ event), Success Stories (+ story); For Tourism Stakeholders → Directory and map (+ organisation), Register as an Organisation; About; Contact; News (+ item); Privacy (footer). Figure 4 also places Entrepreneurs under Explore; locked decision 2 removes it from Explore, and the directory stays reachable from the hub, city guides and Home (§10).

Figures 11–28 (extracted from the .docx; `pdftoppm` is not installed, so the comparison was done by inspection of the figure images against the rendered screenshots in `temporary screenshots/`):

| Figure | Verdict | Note |
|---|---|---|
| 11 Home | Pass | Eight blocks in the §3.3 order |
| 12 City guide | Pass | Ten sections in order; the figure's "Where to buy local products" is out by decision 3 (§10); four-card carousels are CMS behaviour (§9) |
| 13 Listing with filters | Pass | City chips, category chips, advanced pillar/price/accessibility; filter state in the URL |
| 14 Destination detail | Pass | Lead image, description, gallery, map, related |
| 15 Experience detail | Pass | Entrepreneur block inside the page, contact route, gallery, map |
| 16 Entrepreneur profile | Pass | Portrait, story, products, gallery, contact → request flow |
| 17 Resources and learning paths | Pass | Paths first, resources filtered by topic/format/pillar, upcoming events |
| 18 Learning path detail | Pass | See decision 9 |
| 19 Stakeholder map and directory | Needs decision | List beside the map in the figure; today's client-directed layout puts the grid first and the map last |
| 20 Organisation registration | Pass | Fields and consent as drawn; reviewed-before-listing note |
| 21 CMS entry, three languages | Pass | `admin-entry.html` three language columns, completeness pills, role select |
| 22 Home in Arabic / 23 Profile in Arabic | Pass | Same components mirrored from `dir="rtl"` with logical properties |
| 24 Success stories | Pass | See decision 8 |
| 25 About | Pass | Four blocks + testimonials from the Story type |
| 26 Contact | Pass | Form + side panel (email, social, newsletter), acknowledgement with response time |
| 27 Submissions queue | Pass | Type/status/assignee/due columns, open item with field-by-field changes and per-type actions |
| 28 Editing through a one-time link | Pass | One use · 24 h note, name locked, editable description/contact/gallery, "reviewed before it appears" |

Copy across the three languages: no Arabic text inside `<main>` of EN/ES pages; Spanish pages fall back to English where no Spanish string exists; the same entity names appear in all three (Manal Awadallah; spelled once).

## 9. Not applicable in the static prototype

- Four-card top-up, cap of twelve, carousel beyond four and "unpublished entry drops out" (§3.5): CMS behaviour; the prototype renders curated sample sets.
- Per-session / per-IP submission limits, the real Turnstile widget, outgoing email, hashed tokens, CSV download, response time per type set by CIDEAL (§4.1, §6.7): server-side; the mock stores in `localStorage`.
- Load more on Success stories: only three sample stories exist.
- Payload roles and accounts: the mock has a role select, not sign-in.

## 10. Needs decision (owed by CIDEAL or conflicting with the locked decisions)

1. Figure 4 places Entrepreneurs under Explore; locked decision 2 removes it from Explore. Built per the decision.
2. Figure 12 has a "Where to buy local products" section; locked decision 3 removes it. Built per the decision.
3. Figure 19 / decision 5 want the list beside the map on the stakeholders page; the client asked today for the card grid under the filters and the map at the end. Built per today's request; the map page keeps the side-by-side layout.
4. MapTiler key: `MAP_CONFIG.maptilerKey` is empty, so the demo OpenFreeMap style is used.
5. YouTube IDs: every video resource uses the one sample ID `M7lc1UVf-VE`.
6. FPSC and KEF Arabic descriptions: the partner chips carry names only.
7. Real photography and consent releases: the home hero is an AI collage labelled as sample; several galleries are AI-generated placeholders; CC BY-SA photos were withdrawn and are listed in `rights-register.md` as awaiting CIDEAL; Villa Nile and island-stay photo rails wait for CIDEAL photos.

## 11. Re-crawl after the fixes

Second full crawl after the fixes (same crawler, three locales, 1440 and 390 px): 390 pages (the hotel organisation and its related links are gone), 20 028 links, 84 pages at 390 px.

| Check | Result |
|---|---|
| HTTP status, console errors, uncaught errors | 390/390 return 200; 0 console errors; 0 page errors |
| `href="#"` / `javascript:` · locale drops · broken internal links · orphans | 0 · 0 · 0 · 0 |
| Header items | 6 on every page |
| Desktop horizontal overflow at 1440 | 0 pages (was 3) |
| Phone horizontal overflow at 390 | 0 pages (was 12) |
| Heading-level skips · images without `alt` · skip-link target | 0 · 0 · 0 |
| Visible H1 | one per page; the bare detail templates keep a second, hidden and empty H1 inside the hidden hero (not exposed to assistive technology; axe 0 violations). The destination and entrepreneur templates received their empty-state H1 in the same pass |
| Meta (title, description, canonical, hreflang, OG) · JSON-LD validity | complete on all pages · 0 invalid |
| Sitemaps | every entry 200; only the search results page is absent from each sitemap (§1 item 5) |
| Detail canonicals without the slug | 22 per locale (entrepreneur and story templates), unchanged: §1 item 1 |
