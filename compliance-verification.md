# Compliance verification — Discover Upper Egypt prototype vs Inception Report v1.2

Date: 2026-10-29 · Commit reviewed: 9ea6d6a (local server `node serve.mjs` on port 3002, locale copies rebuilt the same minute as the sources: newest source `slugs.js` 12:15:31, newest built page `ar/طلب-تحديث.html` 12:15:31).
Method: every judgement below comes from the running site (Puppeteer scripts in the session scratchpad: crawl of 398 rendered pages, form submissions, keyboard runs, CDP byte counts, 84 screenshots under `temporary screenshots/wireframes/`) or from a quoted file and line. `compliance-audit.html` and commit messages were not used as evidence. Playwright is not installed in this repo; Puppeteer (already in `node_modules`) ran the same browser checks. The wireframe images could not be rasterised (no pdftoppm / ImageMagick on this machine), so the wireframe comparison uses the report's text and block lists plus DOM inspection.

## 1. Summary

| State | Flows and maps (§4, §3, §7.1, §9.4) | Wireframes (Fig 11–28) | UI Review items (35) | Meeting notes (18) |
|---|---|---|---|---|
| Done / matches | 14 | 11 | 17 | 12 |
| Partially done | 5 | 5 | 6 | 2 |
| Not done / not met | 3 | 0 | 2 | 1 |
| Not applicable in the prototype (CMS / accounts / backend) | 7 | 2 | 1 | 2 |
| Needs decision | 4 | 0 | 8 | 1 |
| Contradicts the report | 2 | 0 | 1 | 0 |

Navigation audit (step 2-ب, 398 crawled pages × desktop, 96 page-locale pairs at 390 px): see §5 for the counts per verdict (OK / Broken / Wrong target / Dead control / Orphan).

## 2. User flows (§4) and maps (§3, §7.1, §9.4)

### 2.1 §4.1 Request and review workflow (Figure 8)

| Expected (report) | Found | Verdict | Evidence |
|---|---|---|---|
| Three request types only: general inquiry, organisation registration, profile update | Three public forms exist (`contact.html`, `register-organisation.html`, `update-request.html`). A fourth kind reaches the queue through the contact form's subject `directory` and is listed as its own type in the queue | **Contradicts report** (§4.1 "There are three") | `contact.html:535` link `contact.html?subject=directory`; `stakeholders.html:548` same link; `admin-queue.html:62` option `directory` "طلب دليل التواصل"; queue actions for it at `admin-queue.html:80` |
| Each form: name, email, message + type fields, consent | Contact: name, email, subject, message, consent (`c_contact`, required). Registration: name, email, org, type, city, value chains, description, public contact, **plus private contact person, phone, private email (required) and two extra consents** (`c_directory`, `c_publish`). Update request: email, kind, consent | Contact **Done**; registration **Needs decision** (fields beyond Figure 20 and §4.2 "description and public contact route") | Browser run: form shapes captured (`audit3.json → forms[].shape`); `register-organisation.html` legends "بيانات التواصل الخاصة", labels `f-private_name/phone/email` |
| Turnstile on every form; privacy notice link | `.f-turnstile` placeholder and a privacy link inside all three forms and `edit.html` | Done | `contact.html` 7 matches, `register-organisation.html` 6, `update-request.html` 6, `edit.html` 5 (`grep f-turnstile`) |
| Validation announced as text, not colour only | Empty submit: status "Check the highlighted fields and send again.", per-field "This field is required." / "This consent is required.", focus moves to the first invalid field (`f-name`); bad email: "Please enter a valid email address.", focus `f-email` | Done, with one gap: the status element carries no `aria-live`/`role=status` (captured `live: null`), so the summary is not announced | Browser run `audit3.json → forms[0].empty/badEmail` |
| Success: stored, team alerted, acknowledgement with response time | "Your message was received. We sent a confirmation to your email and will reply within five business days. Request number: …" | Done (prototype stores in localStorage; no email is sent — N/A) | `audit3.json → forms[0].valid.status` |
| Per-session / per-IP limits, blocked attempts logged | Not present in a static prototype | Not applicable in the prototype (server-side) | — |

### 2.2 Queue states (Figure 9) and §6.7 outcomes

| Expected | Found | Verdict | Evidence |
|---|---|---|---|
| New → In review → Approved / Rejected / Closed with no action | Status filter and pills: `new, in_review, approved, rejected, closed`; "بدء المراجعة" moves new → in_review | Done | `admin-queue.html:70` STATUS map, `:78` action |
| Assignee, due date, internal note, reply to sender | Columns المكلّف / موعد الرد; detail has `#asg`, `#note`, `#reply`; overdue rows flagged | Done | `admin-queue.html:72-75, 93-95`; browser `audit3.json → queue.detail` |
| Closing as spam/duplicate sends nothing | "إغلاق بلا إجراء" requires no reply and writes no delivery | Done | `admin-queue.html:103` (reply only required for rejected or approved general) |
| General inquiry: approve = send reply and close; reject not used | Buttons "إرسال الرد وإغلاق" and "إغلاق بلا إجراء" only | Done | `admin-queue.html:79` |
| Organisation registration: approve = draft entry + notify editors; reject = reply | "موافقة: إنشاء مسودة وإبلاغ المحررين" sets `draftCreated`; "رفض مع رد" | Done (draft creation is simulated by a flag) | `admin-queue.html:81, 106` |
| Profile update: approve publishes accepted fields and tells the holder which; reject = reply | Accepted fields are chosen per checkbox (`[data-field]`) and stored in `patch.accepted` | Done (publishing itself is N/A) | `admin-queue.html:82, 105` |
| CSV export | "تصدير CSV" button present | Done | `admin-queue.html:113` |
| Response time per type set by CIDEAL | Fixed demo due dates (+5 days) | Not applicable in the prototype | `admin-queue.html:114` |

### 2.3 §4.2 Profile updates (Figure 28)

| Expected | Found | Verdict | Evidence |
|---|---|---|---|
| Request a one-time link with the registered email, from the entry's page | Entrepreneur profile and organisation page carry "Request an update →" to `update-request.html?kind=…&slug=…` | Done | `audit3.json → entContact / orgContact` |
| Same answer whether or not the address matches | Known and unknown addresses both get: "If this address is registered with us, we have sent the update link to it. The link is valid for 24 hours and a single use. If no message arrives, check the address or contact the team." (identical strings) | Done | Browser run `audit4.json → updateNeutral.identical = true` |
| Pre-submission copy must not promise a match | The intro above the form reads "If the address matches a published entry, you receive a one-time link valid 24 hours" | Partially (the result is neutral; the intro still describes a match) | `update-request.html:507` |
| Link single-use, 24 h, stored hashed | Token states `invalid / expired / used`; expiry = issued + 24 h; token spent on save | Done for single use and 24 h; hashing N/A (client demo) | `edit.html:757, 764, 770` |
| Holder can change: entrepreneur text, gallery, contact route; organisation description and public contact | Entrepreneur fields: `f-sum`, `f-desc`, `f-gallery`, `f-contact`; organisation: `desc`, `f-public_contact`; locked note lists email, consent, pillar, category | Done | `edit.html:766-767` |
| Name shown, not editable | Edit page: H1 "Update the profile", locked note "Registered email, consent to publish, pillar, category — Fatma Boghdady"; editable fields `f-sum`, `f-desc`, `f-gallery`, `f-contact` only; expiry shown; after save "Your changes were saved and sent for review…"; reopening the same link: "This link has already been used." | Done (run after the own-entry route was added, see §10) | Browser run `flow-ent.mjs` steps 4–7 |
| Figure 7 entrepreneur flow: For Entrepreneurs → "learning, or own entry?" | At review time the For Entrepreneurs page offered learning paths only; the own-entry branch (request the one-time link) was reachable from the profile pages and Contact, not from the hub | Was **Not done**; fixed in §10 and re-run end to end (hub → link → form → acknowledgement with the demo link → edit → review queue → coordinator approves → status "مقبول") | `flow-ent.mjs` steps 1–10 |
| Changes enter the queue, "reviewed before it appears" shown | On save: `FORMS.tokens.spend(...)`, `FORMS.queue.add('update', …)`, message "تُراجع التغييرات قبل أن تظهر علنًا." | Done | `edit.html:770` |

### 2.4 §4.3 Editorial flow and §6.5 roles

| Expected | Found | Verdict | Evidence |
|---|---|---|---|
| Entry created in one language, saved as draft with incomplete translations flagged | `admin-entry.html`: three language columns side by side, each with a "مكتملة / ناقصة" pill; statuses draft / review / published | Done (mock) | `admin-entry.html:53, 76`; browser `audit5.json → W21_admin_entry.langCols = 3, incompleteFlag = true` |
| Publication with a missing translation requires explicit confirmation; English fallback | "نشر" button only sets a status label; no confirmation step. English fallback on the public site: Spanish dictionary falls back to English (`build-locales.mjs` D builder, `i18n.js` lookup) | Confirmation **Not done** in the mock; fallback Done | `admin-entry.html:81`; `i18n.js` lookup comment "6.3: English stands in" |
| Media uploaded once, reused, alt text in three languages | Not modelled | Not applicable in the prototype | — |
| Each entry lists the pages it appears on | Not modelled | Not applicable in the prototype | — |
| Four roles (administrator, editor, contributor, coordinator), individual accounts | No sign-in or roles | Not applicable in the prototype | — |
| Rebuild within five minutes after publishing | Label text only ("تُعاد الصفحات خلال 5 دقائق") | Not applicable in the prototype | `admin-entry.html:81` |

### 2.5 §3.1 / §3.2 Sitemap tree vs repo

Header items on every page: Home, Explore, For entrepreneurs, For tourism stakeholders, About the project, Contact us (see §5 for the per-page check). Explore menu: Luxor, Aswan, Destinations, Experiences and products, Map — **five items; Figure 4 lists six (Entrepreneurs is also under Explore)**. The meeting decision removed it; it stays reachable from the For Entrepreneurs section and the footer. **Needs decision** (Figure 4 vs meeting).

| Report node (Figure 4) | Repo file | Verdict |
|---|---|---|
| Home | `index.html` | Matches |
| Explore › Luxor / Aswan | `luxor.html`, `aswan.html` | Matches |
| Explore › Destinations › [destination] | `destinations.html`, `destination.html` | Matches |
| Explore › Experiences and Products › [experience] | `experiences.html`, `experience.html` | Matches |
| Explore › Entrepreneurs › [entrepreneur] | `entrepreneurs.html`, `entrepreneur.html` (reached from the For Entrepreneurs section and the footer, not from Explore) | Partially (see decision above) |
| Explore › Map | `map.html` | Matches |
| For Entrepreneurs (section) | `for-entrepreneurs.html` | Matches (Wireframe 7) |
| Resources › [resource]; Learning Paths › [learning path] | `resources.html`, `learning-path.html` (resources open inline; no resource detail page — Figure 4 shows a `[resource]` template) | Partially: no `[resource]` entry template |
| Events | `events.html`, `event.html` | Matches |
| Success Stories › [story] | `stories.html`, `story.html` | Matches |
| For Tourism Stakeholders › Directory and map; Register as an Organisation; News › [news item] | `stakeholders.html`, `register-organisation.html`, `news.html`, `news-article.html` | Matches |
| About the Project; Contact; Privacy Notice (footer) | `about.html`, `contact.html`, `privacy.html` | Matches |
| — (not in the tree) | `organisation.html` (organisation detail; supported by §2.1 "public contact routes") | Extra |
| — | `accessibility.html` (statement) | Extra (supports §9.3) |
| — | `search.html` (§2.1 site search feature, not a tree node) | Extra |
| — | `update-request.html`, `edit.html` (§4.2 flow) | Extra (required by §4.2) |
| — | `newsletter-confirm.html`, `newsletter-unsubscribe.html` | Extra |
| — | `404.html` | Extra |
| — | `admin-queue.html`, `admin-entry.html` (CMS mock, Wireframes 17/21/27) | Extra, not public |
| — | `design-system.html`, `compliance-audit.html`, `fluid-demo.html` | Extra, internal |

### 2.6 §3.1 URL scheme (crawl of the rendered site)

| Check | Result |
|---|---|
| Pages crawled from `ar/`, `en/`, `es/` Home (BFS over rendered links) | 398 pages, all HTTP 200, 0 console/page errors |
| Links that leave the locale (`x.html` instead of `/<lang>/…`) | 75, all the same one: the sticky booking bar on experience pages copies the booking button's absolute href (`experience.html:1002` `c.href = b.href`) → `http://localhost:3002/contact.html?subject=general` |
| `href="#"` / `javascript:` / empty | 3: "View details" in the map popup on `aswan.html` (section "Map of Aswan"), one per locale. `luxor.html` has none |
| External links without `rel="noopener"` | 489, all three MapLibre attribution links (OpenFreeMap, OpenMapTiles, OpenStreetMap) injected by the map control on every map page; no placeholder (`example.com`, `#`) externals |
| Language switch keeps the page and the localized slug | See §5 (per-page run) |
| Orphans (locale copies no crawled page links to) | 12 = `404`, `edit` (token only), `newsletter-confirm`, `newsletter-unsubscribe` × 3 locales — all reached by email or error, not by navigation |
| Old routes | none found: every `.html?` link resolves to the localized file name |

### 2.7 §3.3 Home, §3.4 About, §3.5 City guide

| Expected | Found (English copy, rendered DOM) | Verdict |
|---|---|---|
| Home: hero · Luxor & Aswan · featured destinations · featured experiences · featured entrepreneurs · success stories · upcoming events · two audience links | Sections in order: hero → `destinations` "From Luxor to Aswan" (two city cards) → `gems` (4 destination cards) → `experiences` (4) → `business` (entrepreneur cards) → `success` (3 stories) → `tours` "Upcoming events" (carousel) → `paths` (two audience cards) | Done |
| About: programme identity · local context · the work so far · what comes next; partner logos; testimonials from stories | Four headings in that order; code 2022-PCONV-000504; partners CIDEAL, FPSC, KEF, ENROOT; 3 testimonials | Done |
| City guide text §3.5: 10 sections (hero, sustainable tourism, about, things to do, places to go, where to eat, where to stay, entrepreneurs, practical information, map) | Luxor: Explore Luxor (hero) · Sustainable tourism · About Luxor · Top things to do · Places worth visiting · Where to eat · Where to stay · Meet local entrepreneurs · Practical information · Map of Luxor | Done against §3.5 text |
| **Report conflict:** Figure 12 draws 11 blocks (adds "7 Where to buy local products"), §3.5 text and Figure 6 list 10 | The page follows the 10-block text; local products appear as a category inside experiences (§2.1) | Recorded, not resolved |
| §3.5 listing rules: 4 cards, carousel above 4, cap 12, top-up, hide empty section | Four cards per section are shown; curation, top-up and carousel-over-four are CMS behaviour | Not applicable in the prototype (hide-when-empty is implemented on the learning path related-stories block only, `learning-path.html` `lpStories.hidden`) |

### 2.8 §7.1 Interactive map and §2.1 filters

| Expected | Found | Verdict | Evidence |
|---|---|---|---|
| MapLibre GL | `window.maplibregl` present; `window.L` is the project's own wrapper (`maps.js:12`), not Leaflet; no `leaflet` script anywhere | Done | browser `audit3.json → map.maplibre = true` |
| MapTiler vector tiles | OpenFreeMap "Liberty" style (OpenStreetMap data) | **Needs decision** (§7.1 names MapTiler; `rights-register.md` calls OpenFreeMap "the demo source until the MapTiler key arrives") | attribution links in the crawl |
| Visitor filters: city, category, pillar, price band, accessibility; list beside the map | All five fieldsets + city chips; list of 40 entries beside the map | Done | `audit3.json → map.filters, listCount` |
| Organisation filters: city, type, value chain; list with the same result set; register link | City, Organisation type, Value chain; 8 rows; "Register an organisation" | Done | `audit3.json → stakeholdersMap` |

### 2.9 §9.4 sitemaps, canonical, hreflang

| Check | Result |
|---|---|
| `sitemap.xml` index → `sitemap-ar/en/es.xml` | Present; 30 URLs per locale (27 pages + 3 learning paths) |
| Every URL answers 200 | 90 / 90 |
| Each page's canonical equals its sitemap URL; three hreflang alternates per URL | 90 / 90 match; 0 with fewer than 3 alternates |
| Entry pages (`?slug=`) in the sitemaps | Only learning paths are listed; destinations, experiences, entrepreneurs, events, stories, news and organisations are not | Partially |
| Structured data | JSON-LD on Home (WebSite), destination (TouristAttraction), experience (TouristAttraction), event (Event), organisation (Organization), entrepreneur (LocalBusiness); none on story pages. `twitter:card` on all 32 public pages | Partially (story pages) |

## 3. Wireframes (Figures 11–28)

Screenshots: `temporary screenshots/wireframes/W<n>-<lang>-<width>.png` (14 pages × ar/en/es × 1366/390 = 84 files). DOM facts from the English copies.

| Wireframe | Page | Order and elements found | Extra vs wireframe | Verdict |
|---|---|---|---|---|
| 1 Home (Fig 11) / 12 Home RTL (Fig 22) | `index.html` | 8 blocks in the report's order (see 2.7); RTL copy mirrors from `dir="rtl"` | None | Done |
| 2 City guide (Fig 12) | `luxor.html`, `aswan.html` | 10 sections in §3.5 order; practical information as accordion; map centred on the city | Figure 12's "Where to buy local products" block absent (report conflict) | Done vs text |
| 3 Listing with filters (Fig 13) | `experiences.html` | Filters city/category/pillar/price band/accessibility; state in the URL (`?city=aswan` survives reload); grid 3/2/1 | "Load more" absent on experiences (all 25 shown); "Clear filters" only inside the empty state | Partially |
| 4 Destination detail (Fig 14) | `destination.html` | Lead image · name + city · category · pillar · description · gallery (bento) · map · related experiences · related places | Extra "More places in the city" block | Partially |
| 5 Experience detail (Fig 15) | `experience.html` | Lead + thumbnails · name · meta (by, duration, price) · description · "The entrepreneur behind it" block linking to the profile · contact route button · map | Section nav, "Need help?" card, "Similar experiences"; photo rail only where ≥3 own pictures (hidden on this entry) | Partially |
| 6 Entrepreneur profile (Fig 16/23) | `entrepreneur.html` | Portrait · name/business/activity/Helmak badge · story · products and experiences · gallery (4) · "Request an update" | Contact button goes to the update request, not "contact this entrepreneur" (data route is CIDEAL's general form) | Partially |
| 7 Resources (Fig 17) | `resources.html` and `for-entrepreneurs.html` | Learning paths first (3 cards with step counts) · Resources with filters (audience/topic/pillar on resources; topic/format/pillar on the hub) · rows "Video · 9 min", "Document · 6 pages", "Link · external" · upcoming events | — | Done |
| 8 Learning path (Fig 18) | `learning-path.html` | Centred title · "6 steps · open access, no registration" · numbered rows with resource types · note "Ordered reading. No enrolment…" · related success stories (3) | — | Done |
| 9 Stakeholder map (Fig 19) | `stakeholders.html` | Filters type/city/value chain · map with the list beside it (same set) · "Register an organisation" | The three blocks under the map (value chains · news · events) are not on the page | Partially |
| 10 Registration (Fig 20) | `register-organisation.html` | Name, type, city, description, public contact, applicant name/email, consent, send; intro says the entry is reviewed before it appears | Extra private contact fields and two extra consents | Partially / Needs decision |
| 11 CMS entry (Fig 21) | `admin-entry.html` | Three language columns (AR/EN/ES) with complete/incomplete pills, shared fields, media, save draft / publish | — | Done (mock) |
| 13 Entrepreneur profile RTL (Fig 23) | `entrepreneur.html` (ar) | Mirrored by `dir="rtl"`; screenshot W6-ar-1366 | — | Done |
| 14 Stories (Fig 24) | `stories.html` | Title · three dropdowns (city/pillar/entrepreneur) · Featured story linking to the entrepreneur profile · All stories grid · Load more (hidden: only 3 other stories) | — | Done |
| 15 About (Fig 25) | `about.html` | 4 blocks, logos, testimonials | — | Done |
| 16 Contact (Fig 26) | `contact.html` | Name, email, subject, message, consent, send; programme email aside; acknowledgement with response time | Newsletter card and "other routes" card in the aside; social links absent (0) | Partially |
| 17 Submissions queue (Fig 27) | `admin-queue.html` | Type/status filters, columns type/from/received/due/assignee/status, detail with notes and per-type actions, CSV | Fourth type "directory" | Partially |
| 18 Edit via one-time link (Fig 28) | `edit.html` | States for invalid/expired/used links, fields per holder, locked note, "reviewed before it appears", save & send, cancel | Not opened in the browser with a valid token (see §9) | Could not fully check |

## 4. UI Review (26 Oct 2026) — item by item

Numbering follows the file order: §1 items 1–5, §2 items 6–9, §3 items 10–24, §4 items 25–30, §5 items 31–35.

| # | Item | Verdict | Evidence / how it was checked |
|---|---|---|---|
| 1 | Travel ideas present | Done | No `travel-ideas.html`; `grep -i "travel-idea\|أفكار رحل"` over root pages = 0; crawl found no such route |
| 2 | Background music | Done | No `<audio>`, no `ASSETS/audio` directory, no sound toggle; accessibility drawer section reads "الحركة" only (`index.html` `#s-motion`) |
| 3 | Hotels under Where to stay | Done | Luxor stays: Villa Nile only; Aswan: guesthouses and island stays; `rights-register.md` records the hotel galleries removed. The organisation "Winter Palace hotel" remains in the stakeholder directory (an organisation, not a stay) |
| 4 | Favourites (heart) | Done | `grep -i "wishlist\|المفضلة\|gem-fav"` over root pages/JS = 0 (only `compliance-audit.html` mentions it) |
| 5 | Weather widgets | Done | `grep -i "open-meteo\|weather"` = 0; best time and transport are static text under Practical information (`luxor.html:1324`) |
| 6 | Site search not implemented | Done | `search.html` groups results by type: "Destinations (2) · Experiences & products (8) · Entrepreneurs (2) · Tourism bodies (1)" for "Nubian"; header search submits to `en/search.html?q=…` (browser run) |
| 7 | Language not in the URL | Done | `/ar/`, `/en/`, `/es/` copies with localized file names and entry slugs (`slugs.js`); 398 pages crawled under locale paths; switch keeps the page (§5) |
| 8 | Destinations listing has no filters | Done | City chips + category/pillar/price/accessibility fieldsets; `?city=aswan` kept after reload (browser run `audit3.json → destFilters`) |
| 9 | Main nav doesn't match the sitemap | Done | Six items in the report order on every page (§5) |
| 10 | No route to contact an entrepreneur | Partially | Experience page: "Contact to book" → contact form; profile: "Request an update". Every entrepreneur's `contact` field is `contact.html?subject=general` (`entrepreneurs.js`), so the route exists but is CIDEAL's general form, not the entrepreneur's own; the profile has no "contact this entrepreneur" button |
| 11 | Organisation public contact not shown | Done | Organisations with a URL show "Official site" (4 of 8 in `content.js`); the others fall back to "Contact through the platform" (`organisation.html:852`) |
| 12 | Entrepreneur profile has no gallery | Done | `#epGal` with 4 pictures on Fatma's profile (browser run) |
| 13 | Resources: no audience filter | Done | `resources.html` fieldset `data-g="aud"` (Audience) |
| 14 | Newsletter has no consent | Done | Consent checkbox + privacy link on `resources.html` and `contact.html` newsletter forms (browser run) |
| 15 | Privacy notice incomplete | Done (text still CIDEAL's per Annex A) | `privacy.html` mentions GDPR, Law 151/2020, four sub-processors, Turnstile, YouTube, 24-month retention |
| 16 | SEO metadata missing | Partially | canonical, hreflang ×4, OG, twitter:card on all 32 pages; JSON-LD on Home, destination, experience, event, organisation, entrepreneur; none on story pages; entry pages not in the sitemaps |
| 17 | Number of request types | **Contradicts report** | Fourth type `directory` via `contact.html?subject=directory` and `admin-queue.html:62`; report §4.1 says three |
| 18 | What organisations can edit | Needs decision | `edit.html` lets an organisation change description and public contact only (matches §4.2); the registration form still collects private contact person/phone/email and directory consent (`register-organisation.html`) |
| 19 | Profile update link response | Partially | Result message neutral and identical for known/unknown addresses; the intro paragraph (`update-request.html:507`) still says "if the address matches a published entry" |
| 20 | Consent on profile update request | Done | `c_contact` required on `update-request.html` (browser run) |
| 21 | Contact form fields | Done | Contact form has exactly name, email, subject, message, consent; no conditional business fields (browser run `conditional: []`) |
| 22 | City guide section order | Done | 2.7 above |
| 23 | Home block order | Done | 2.7 above |
| 24 | Map library | Done | MapLibre GL (2.8); tiles are OpenFreeMap, not MapTiler → Needs decision |
| 25 | Wrong programme code on About | Done | 2022-PCONV-000504 rendered (browser run) |
| 26 | Two different emails | Done | Only `info@discoverupperegypt.com` on the site (36 occurrences); `hello@example.com` survives only inside `compliance-audit.html` |
| 27 | Social icons link to # | Needs decision | The footer now has **no social links at all** (0 anchors to facebook/instagram/youtube/linkedin on `index.html`); the footer wireframe lists "social" |
| 28 | Name spelled inconsistently | **Not done** | `i18n.js` holds "Manal Awaga" ×8 and "Manal Awadallah" ×2; the Home entrepreneur card shows "Manal Awaga" (screenshot W1-en-1366) while the slug is `manal-awadallah` |
| 29 | ShareAlike images | Done | `rights-register.md`: every "In use" row is CC BY / CC0 / public domain; ShareAlike rows withdrawn |
| 30 | Illustrated hero of local people | Needs decision | Collage still on Home (`ASSETS/hero-bg.webp`); `rights-register.md` says it is for demonstration and needs CIDEAL's written approval |
| 31 | No skip-to-content link | Partially | Skip link on all 32 pages; on `index.html:486` it targets `#top` (page top) while every other page targets `#main` |
| 32 | Stretched Arabic letters | Done | 0 headings containing tatweel on any crawled page |
| 33 | Accessibility drawer | Needs decision | Drawer still offers read aloud and dictation (`accessibility.html` statement); templates pass the heading/focus checks without it (§5), but the "keep it light" scope is CIDEAL's call |
| 34 | Home page weight | Partially | CDP byte counts (encoded): Home document 28 KB, CSS 25, scripts 129, fonts 179, images 428 → 361 KB without images (budget 500 ✓); critical path ≈ 242 KB (HTML+CSS+JS+first font ≈ budget 250, borderline); Luxor ≈ 254 KB critical (over by 4 KB), 437 KB without images; map page 337 KB (budget 900 ✓). Largest HTML files 215 KB (`en/luxor.html`), none over 300 KB. GSAP + ScrollTrigger (112 KB) still load on Home; 12 font files (496 KB on disk, 179 KB transferred per page) |
| 35 | Carousels keyboard-reachable | Done | Luxor places carousel: 9 controls, 8 tabbable (the hidden "previous" arrow at the start is the ninth); stays rail 1 card tabbable; food row 4/4 |

Also from §1 of the review's summary: "a contact route to entrepreneurs" — see item 10.

## 5. Navigation audit (step 2-ب)

Method: Puppeteer over all 32 public pages × 3 locales (96 page-locale pairs) at 1366 px, plus every pair at 390 px; a second targeted pass re-checked each control the broad pass had flagged. Raw results: scratchpad `audit1.json` (crawl), `audit2.json` (header / buttons / overflow / keyboard), `audit6.json` (re-checks).

| Check | Expected | Actual | Verdict |
|---|---|---|---|
| Header, every page, 3 locales | Home, Explore, For Entrepreneurs, For Tourism Stakeholders, About, Contact | 96 / 96 pages carry the six items in that order (AR: الرئيسية · استكشف · لرواد الأعمال · للجهات السياحية · عن المشروع · تواصل معنا; ES: Inicio · Explorar · Para emprendedores · Para entidades turísticas · Sobre el proyecto · Contacto) | OK |
| Explore submenu | Figure 4 children | Luxor, Aswan, Destinations, Experiences & products, Map on 96 / 96; Entrepreneurs absent by meeting decision | OK / Needs decision |
| Logo | Home of the same locale | `ar/index.html`, `en/index.html`, `es/index.html` (`#top` on Home itself) | OK |
| Language switch keeps the page, slug and query | Same page in the other locale | 50 / 52 pairs land on the expected localized file and slug (ar→en, es→ar over 26 pages incl. 7 entry pages). The 2 "misses" are `experiences.html`, which lands on the same page with `?city=luxor` added (the listing writes its default filter to the URL) — same page, so OK | OK |
| Header search | Results page grouped by type | Opens `<locale>/search.html?q=…`; results grouped Destinations / Experiences & products / Entrepreneurs / Tourism bodies | OK |
| Footer links (AR Home) | Privacy, accessibility, contact, social | 15 links, all localized: Explore ×6, Platform ×7 (incl. privacy notice, accessibility statement), contact (mailto). **No social links** | OK except social (Needs decision, §7 item 5) |
| Internal links (crawl, 398 pages) | 200, same locale, right page | 0 × 404; 75 locale leaks, all the sticky booking bar on experience pages (`experience.html:1002` copies the absolute href); titles/H1 match the destination on every crawled page | Broken ×1 cause (75 occurrences) |
| `href="#"`, `javascript:`, empty | none | 3: the map popup "View details" for one Aswan place with no detail page (`aswan.html:1799`, click shows the toast "هذه الصفحة قيد الإعداد", `aswan.html:1833`) | Dead control ×3 (1 per locale) |
| External links | `rel="noopener"`, no placeholder targets | 489 without `noopener`, all three MapLibre attribution links injected by the map control on every map page; 0 placeholders (`example.com`, `#`) | Broken (attribution control, 1 cause) |
| Breadcrumbs and internal buttons | Correct target | Crawled crumbs resolve to the right localized pages (0 wrong targets); "Request an update" → `update-request.html?kind=…&slug=…`; "Register your organisation" → `register-organisation.html`; "Contact to book" → contact form (general subject) | OK |
| Cards open their own entity | Card title = detail H1 | 398-page crawl: every `?slug=` link opened a page whose title carries that entry's name; 0 mismatches | OK |
| Filters, Load more, carousels, tabs, accordion | Work; URL state survives reload and back; Clear resets | Destinations chip → `?city=aswan`, kept after reload (pressed = true), removed on browser back; `#exClear` exists only inside the empty state on destinations; stories Load more hidden with ≤6 cards (shows with 8 in a seeded test); city-info tabs switch panes (`#ciTab-move` → `ciPane-move` shown); related strip Next scrolls (2 → 397 px); photo rail Next scrolls (0 → 568 px); places carousel card sets `is-active` on its item | OK; Clear filters only in the empty state (Partially) |
| Forms | Submit works for valid / missing / bad email / no consent; text errors; focus to the field; privacy link opens | All four states produce text messages and move focus to the first invalid field (§2.1); privacy link present and localized. The summary message carries no `aria-live` | OK except live region |
| Buttons with no effect | None | Broad pass flagged 64; after targeted re-checks the remaining real ones are: the map popup "View details" (`href="#"`, 3). The rest were observation limits: language item of the current language, MapLibre zoom/marker (canvas), carousel Prev at the start, "All" chips already pressed, current thumbnail/step | Dead control ×3 |
| Hover / pointer on non-interactive | none | Not instrumented beyond the button pass | Not checked |
| Keyboard | Tab reaches everything, Enter/Space activate, visible focus, no trap, Esc closes menus/drawer and returns focus | Home tab order: Skip link → logo → six nav items (Explore opens on Enter, Esc closes, focus returns) → accessibility button; every focused control had a visible ring; drawer: focus moves in, stays in while open, Esc closes (`hidden = true`) and focus returns to the trigger; learning-path steps respond to Enter/Space | OK |
| Orphan pages | none | 12 locale copies no page links to: `404`, `edit` (token only), `newsletter-confirm`, `newsletter-unsubscribe` × 3 — all reached by email or error, not navigation; sitemap entries all crawled | Orphan ×12 (by design) |
| 390 px overflow | none | 0 of 96 pairs scroll sideways | OK |
| Error states | 404 with a back link ×3; wrong `?slug=` → empty state | `404.html` ×3 with "Back to home" + city links; all 8 detail pages show a text empty state with a back link for an unknown slug (`audit3.json → empty`); the dev server itself answers unknown paths with plain text (`serve.mjs:52`), routing to `404.html` is a hosting rule | OK |

Counts: OK 13 checks · Broken 2 causes (sticky bar absolute link ×75; attribution links without `noopener` ×489) · Wrong target 0 · Dead control 1 cause (×3) · Orphan 12 (by design) · Partially 2 (Clear filters placement; form live region).

## 6. Not met, by importance

1. **Fourth request type** ("directory") reaches the queue through the contact form and is listed in `admin-queue.html` — §4.1 and §6.7 define three. (Contradicts report)
2. **Sticky booking bar on every experience page links to the root `contact.html`** instead of the locale copy (`experience.html:1002`): 75 locale leaks in the crawl, one per experience × locale.
3. **Map popup "View details" on Aswan is `href="#"`** (dead link) in all three locales.
4. **Entrepreneur name inconsistent** across languages (Manal Awaga / Manal Awadallah) — UI Review item 28 still open.
5. **No explicit confirmation when publishing an entry with a missing translation** in the CMS mock (§4.3/§6.3).
6. Home skip link targets `#top` instead of `#main`.
7. Form status summary is not announced (`aria-live` missing); per-field errors are text and focus moves correctly.
8. Entry pages are absent from the sitemaps; story pages carry no JSON-LD (§9.4 partially).
9. Luxor critical path ≈ 254 KB against the 250 KB budget (§9.2); GSAP still ships on Home.
10. Update-request intro still describes "if the address matches" (§4.2 neutral wording) although the result message is neutral.

## 7. Needs decision (section in conflict)

1. Explore menu without "Entrepreneurs" — Figure 4 lists it under Explore; the meeting removed it (§3.2).
2. Registration form collects private contact person/phone/email and a directory consent — beyond Figure 20 and §4.2.
3. Directory request: add it to §4.1/§6.7 as a fourth type or merge it into the general inquiry (UI Review item 17).
4. Map tiles: OpenFreeMap in the prototype vs MapTiler in §7.1.
5. Footer social links removed rather than fixed — footer wireframes list "social"; URLs are CIDEAL's (Annex A).
6. Illustrated Home hero needs CIDEAL's written approval (§6.2).
7. Accessibility drawer scope (read aloud, dictation) — §9.3 conformance does not need it.
8. §3.5 text (10 city-guide blocks) vs Figure 12 (11 blocks with "Where to buy local products") — internal conflict in the report.
9. Stakeholder page: Figure 19 shows value chains · news · events blocks under the map; the page ends at the list.
10. Organisation detail page exists though Figure 4 has no `[organisation]` template.

## 8. Meeting notes (review meeting, applied 2026-10-29)

| Note | Verdict | Evidence |
|---|---|---|
| Home, Luxor/Aswan, map, contact, destination filters by city, search + results page, dropdown fix, favourites removed, weather → static text | Done (9 items) | §2.7, §2.8, UI Review items 4–9 |
| Galleries: none on food, kept on stays, manual scroll + zoom | Done | `experience.html` `.dxg-rail` + `dialog.dxg-lb`; food entries hidden (`e.c === 'food'`); stays with own photos show the rail |
| Explore menu without Entrepreneurs | Done (Needs decision vs Figure 4) | §2.5 |
| Learning paths as guides without login; "Explore the path" button | Done | Wireframe 8 row; `for-entrepreneurs.html`, `resources.html` CTA "استكشف المسار" |
| Animation and shadow improvements | Not applicable (kept as is by instruction) | — |
| About and Contact pages | Done | Wireframes 15/16 rows |
| Accessibility panel aligned with WCAG | Partially / Needs decision | UI Review item 33 |
| Organisation page pattern (title, summary, services & projects) | Not done by decision: §6.2 only (no services block) | `organisation.html` renders name, type, city, description, value chain, contact |
| CMS constraints sheet | Done | `cms-constraints.xlsx` |
| Background music removed; suggestion file | Done / Not applicable | UI Review item 2 |
| NDA, asset handover, marketing mention | Not applicable (for information) | — |

## 9. Could not check

- Wireframe images: no PDF rasteriser on this machine, so the comparison used the report's block lists and the DOM, not pixel comparison.
- Server-side behaviour named in §4.1, §6.7, §7.4 (rate limits, email sending, hashed tokens, roles, rebuild) — a static prototype cannot exercise it; marked Not applicable rather than Done.
- The dev server answers unknown paths with a plain-text 404 (`serve.mjs:52`), so the custom `404.html` was checked by opening it directly: it exists in the three locales with "Back to home" and city links.

## 10. Changes made after the review (same day, on the client's requests)

The review above describes commit 9ea6d6a. The following edits were then made and re-verified in the browser; they do not change any verdict except the Figure 7 entrepreneur flow (now Done).

| Change | Files | Check |
|---|---|---|
| Own-entry route on the For Entrepreneurs hub ("Already listed on the platform? Request a link to update your entry" → `update-request.html?kind=entrepreneur`); the request form now also matches the registered demo address (`contactEmail`, prototype placeholder on each entrepreneur) so the one-time link is issued without the profile's `?slug=` | `for-entrepreneurs.html`, `update-request.html`, `entrepreneurs.js`, `i18n.js` | Flow run `flow-ent.mjs`: 10 steps pass (§2.3) |
| Hub events use the event row of the event page (date tile · kind · title · summary · meta · "Event details") | `for-entrepreneurs.html` | screenshot-432-hub-events.png |
| Listing search field: the global white focus box removed; the field keeps its own rust ring | `site.css` `.mp-search input:focus-visible` | events page, focus in the field |
| Nile-sunset header band on every page whose header had no photograph: learning path, stories, For Entrepreneurs, search, 404, edit, newsletter confirm / unsubscribe (WebP + AVIF at 768 / 1280 / 2048) | `site.css` `.ph`, 8 pages, `ASSETS/hero-nile-sunset-*` | screenshot-430-lp-hero.png, screenshot-433..435 (390 px) |
| Learning-path empty state uses the client's original transparent illustration (`Downloads/empty.png`, trimmed) | `ASSETS/illustrations/learning-path-empty.png` | screenshot-431-lp-empty3.png |

## 11. The five "not met" items, fixed (commits after 3cae778)

Verified in the browser in the three locales before and after (`temporary screenshots/fixes/*-before.png`, `*-after.png`; `five-before.json` / `five-after.json` in the session scratchpad), 0 console errors and 0 responses ≥ 400 on the pages exercised.

| # | Fix | Commit | After |
|---|---|---|---|
| 1 | The contact-directory request type removed from the queue (type filter, TYPE map, per-type actions, delivery log, seed) and from the due-date table; "directory" stays a preset subject of the general inquiry (`contact.html?subject=directory`, label "Contact directory (general inquiry)"). `directory-request.html` never existed in this tree | a54581e | Queue types: general · registration · update. Grep: `'directory'` 0 in `admin-queue.html` and `forms.js` |
| 2 | Sticky bar on experience pages copies the relative, localized href (`c.setAttribute('href', b.getAttribute('href'))`). Label "Contact to book / تواصل للحجز / Contactar para reservar" → "Contact the host / تواصل مع مقدّم التجربة / Contactar con el anfitrión"; note "Booking and payment happen directly with the host…" → "You contact the host directly. The platform introduces you and charges no fee." (§2.2: the platform refers, it does not book). The external "Book now" button remains for entries that carry an outside booking URL (none in the data today) | adc0272 | Bar href `ar/تواصل.html…`, `en/contact.html…`, `es/contacto.html…` |
| 3 | City maps (Luxor, Aswan) and the map page render the "View details" link only when the place has a page; the `href="#"` fallback and the "coming soon" toast are gone. Aswan's "Stays on the Nile" (no detail page) now shows name and summary only | eca5064 | 0 `href="#"` on Luxor, Aswan and the map in AR/EN/ES; popup for that place has no button |
| 4 | "Manal Awaga" → "Manal Awadallah" in the dictionary (8 strings); asset base names (`Manal Awaga-*.webp`) unchanged | 1b84a33 | Profile pages EN/ES show one spelling; grep for display text: 0 |
| 5 | CMS mock: role selector (administrator / editor / contributor / coordinator); publishing is refused for contributor and coordinator; incomplete English blocks publishing for any role; a missing Arabic or Spanish shows "الترجمة ناقصة (es). سيُستخدم الإنجليزي بدلها…" and publishes only on confirmation, with the "ناقصة" flag kept | 55199eb | Dialog sequence recorded in `five-after.json → q5.steps` |
