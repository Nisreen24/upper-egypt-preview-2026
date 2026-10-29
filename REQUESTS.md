# REQUESTS.md — client requests, status and evidence

Every request made in the 2026-10-29 session, in the order it was asked. A row moves to **Done** only after the page was run on `http://localhost:3002` (Puppeteer, 1440×900 unless stated) or the file was grepped; the evidence column names what was measured. Rows are never deleted. A row that conflicts with the Inception Report (DUE_InceptionReport_V1.2) is **Needs decision** and quotes the report.

Verification scripts: `.cache/final/verify-requests.mjs` (writes `verify-requests.json`), `.cache/final/probe-rows.mjs`, `probe2.mjs`, `probe3.mjs`, `probe4.mjs`. Screenshots: `temporary screenshots/`.

Statuses: Done · Needs decision · Open

| # | Request (as asked) | Status | Evidence |
|---|---|---|---|
| 1 | حدث صفحة رواد الأعمال بالشكل التالي ومتشيلش سيكشن الفعاليات القادمة (rebuild For Entrepreneurs per the 4 screenshots, keep upcoming events) | Done | `ar/لرواد-الأعمال.html`: `.fe-hero`, 3 `.fe-paths` tiles, `.fe-list`, heading "الفعاليات القادمة" present in the DOM (verify-requests R01) |
| 2 | بتعدل على اللوكال صح (are you editing locally?) | Done | Answered: edits are made locally, built with `node build-locales.mjs`, pushed only when asked (rows 45–47) |
| 3 | الهيدر هنا كبير أوي عايزاه بنفس ارتفاع وستايل هيدر الأقصر وأسوان والإطار يكون نفسه (FE hero = Luxor/Aswan size and frame) | Done | `.fe-hero` 1368×704 at 1440×900; Luxor hero box formula `luxor.html:1589-1601` (w = min(1550, 95vw), h = min(800, 85vh, vh − nav − 100)) is the same formula as the shared sizer `locale.js:48`; `.fe-hero-band` (band-luxor motif) present |
| 4 | عاوزة أشيل الـ indicator اللي تحت الكلام في كل صورة (remove the bars under the learning-path tiles) | Done | 0 elements matching bar/step/indicator/progress inside `.fe-paths` (R03) |
| 5 | تأكد أن الخطوط بالألوان مكتوبة بنفس الخطوط اللي استخدمناها ونفس الديزاين سيستم (fonts per the design system) | Done | Computed fonts on the FE page: tile numerals `b.display` = Thmanyah Serif Display, section `h2` = Thmanyah Serif Display, tile titles/body = IBM Plex Sans Arabic (probe2 fe-nums, R04) |
| 6 | هنحدث صفحة عن المشروع تكون كما مرفقة بالصور بالظبط (About page exactly per the 6 screenshots) | Done | `ar/عن-المشروع.html`: `.ab-hero`, `.ab-facts` (01), `.ab-duo` (02), `.ab-blocks` (03), `.ab-next` (04), `.ab-quotes` all present (R05); `temporary screenshots/screenshot-500-about.png` |
| 7 | هنعتمد شكل الكرت ده في كروت الفعاليات القادمة وأي كرت تكون الكتابة مكتوبة تحته (event cards = experience card, text under the photo) | Done | `.fe-evl .gem` ×2, `.gem-body` follows `.gem-media` in each (R06) |
| 8 | تأكد أن عرض باقي الصفحة يكون متناسب مع الهيدر والكرت اللي جنب الصورة يكون خلفيته بيضاء (About column proportional, card beside the photo white) | Done | `.ab-blocks` width 1168px; `.ab-facts` and `.ab-card` background rgb(255,255,255) (R07) |
| 9 | عايزة نفس الصورة دي تكون موجودة في السياق المحلي (Nubian guesthouse photo in section 02) | Done | `about.html` `.ab-duo-a` → `ASSETS/gal/nubian-guesthouses-1-{960,1280}.{avif,webp}` (edited this session, `ar/عن-المشروع.html` contains `nubian-guesthouses`; R08). Note: the project's own Nubian guesthouse photo was used; if the attached photo was a different one, drop it into `ASSETS/` and it will be swapped |
| 10 | عايزة لون الأرقام يكون neutral يتناسب مع ألوان الصفحة وهنوحد الترقيم بلون واحد (numerals one uniform colour) | Done | All 4 `.ab-num::before` numerals rgb(165,62,26) in Thmanyah Serif Display (probe4); badges `.ab-badge` one neutral colour |
| 11 | فيه أنيميشن حركة على الكروت دي مش عاجبني وكبر عرض كل كرت شوية (no gem animation, wider cards) | Done | `motion-home.js` has no tween on `.gem` (only `.gems-head`); `.gems-track` 1168px shows 3 cards of 368px with 32px gap (probe home) |
| 12 | عايزة أغير طريقة العرض هنا يكون تحت الفلتر مباشرة شكل عرض الكروت وبعدها الخريطة في آخر الصفحة وشكل الكروت هنعتمد شكل الكرت المرفق (stakeholders: cards under the filters, map last) | Needs decision | Built as asked: DOM order `#exAdv` → `#exGrid` (7 `.gem` cards) → `.sk-map` last section (R11). Conflicts with the Inception Report, Figure 19: "Organisation map and directory. The list beside the map carries the same result set." and locked decision 5 ("list view beside the map"). The map page keeps the side-by-side layout. Client to confirm which layout ships |
| 13 | الهيدر الخاص بعن المشروع عايزاه نفس ارتفاع وعرض هيدر الأقصر وأسوان وهنغير الإطار تحت يكون نفس الإطار ومش عايزة كتابة تكون واضحة باللون (About hero = Luxor size, same band, no coloured text) | Done | `.ab-hero` 1368×704; `.ab-hero-band` present; hero title colour rgb(255,255,255) (R12) |
| 14 | ضيف صورة هنا في الموارد ومسارات التعلم (Nile sunset photo on the resources and learning-paths heroes) | Done | `#xh img` currentSrc `hero-nile-sunset-2048.avif` on `ar/الموارد.html` and `ar/رواد-الأعمال.html` (R13) |
| 15 | تأكد أن الارتفاع هنا مطابق لهيدر الأقصر وأسوان ولو فيه أي هيدر طوله مش نفس هيدر الأقصر خليه نفس الارتفاع (every hero = Luxor height) | Done | Framed hero box at 1440×900: destinations, stories, search, for-entrepreneurs, about 1368×704; resources, entrepreneurs, events, news, experiences `#xh .xh-media` 1368×704 (probe3); Luxor/Aswan `.xh-media` target from the same formula (`luxor.html:1589-1601` ≡ `locale.js:48`) |
| 16 | الكتابة الثانوية واخدة اهتمام محتاجة تكون أقل Bold وأقل حجم (hero subtitle lighter and smaller) | Done | `.xh-cap-sub` 18px / weight 500 vs `#xh h1` 86.4px / 700 on the listing heroes; Luxor subtitle 18px / 500 (`site.css:1267`) |
| 17 | تأكد أن حجم كروت الأنشطة والتجارب يكون بنفس حجم كروت ما وراء المألوف (listing cards = home cards) | Done | `ar/التجارب-والمنتجات.html` `#exGrid .gem` 368px (12 cards), entrepreneurs/events/news first card `.gem` 368px = home `.gems-track .gem` 368px (probe2, probe3) |
| 18 | محتاجين نزود محتوى أكتر عن كل جهة سياحية ونضيف عناصر جمالية للخلفية (longer organisation text, side motif strips) | Done | `ar/جهة.html?slug=luxor-tourism-authority`: 10 paragraphs, `.dx-strips` present, 2 related cards; `content.js` has 7 `long: []` blocks (R17) |
| 19 | تأكد أن يكون فيه خريطة في صفحة الخريطة (map visible on the map page) | Done | `#skMap canvas` 646px tall on `ar/الخريطة.html` (R18) |
| 20 | صفحة الخريطة طويلة أوي اعرض 6 كروت وبعدها يكون فيه pagination | Done | 6 cards on page 1, 9 pager buttons (`#exPager`), `map.html` `pageSize: 6` (R19) |
| 21 | عايزة الشكل ده يختفي ونبدله بشكل كروت ما وراء المألوف (replace the related rows with gem cards) | Done | `.dx-rel .gem` on experience 4, entrepreneur 1, destination 7, story 4, organisation 2; `.ex-strip-dots` display none (R20, probe3). The event page has only the "فعاليات أخرى قادمة" list and no related-experience block |
| 22 | تأكد أن ارتفاع وعرض الهيدر هنا بنفس باقي الهيدر + حدث شكل السيرش والشكل العام عشان يتناسق مع باقي الصفحات والفلتر (search page hero and bar) | Done | `ar/بحث.html` `#xh` 1368×704; `form.mp-bar.ex-bar.sr-bar` with 4 type chips (R21) |
| 23 | ممكن تستخدم أي عنصر من عناصر الصورة دي عشان نعمل decoration لصفحة الوجهات | Done | `.ds-deco--palms` and `.ds-deco--birds` present on `ar/الوجهات.html` (R22) |
| 24 | تأكد أن الكتابة هنا تكون واضحة ومرقمة أو جنبها بوينت (privacy and accessibility text as lists) | Done | privacy main: 7 list items (1 ol, 1 ul); accessibility main: 15 list items (R23) |
| 25 | تأكد أن الزر ده يفتح صفحة تواصل معنا (the button opens the Contact page) | Done | grep: every "تواصل معنا" link in the source pages has `href="contact.html"` (0 exceptions outside `design-system.html`); the ar build localises it (stakeholders CTA "طلب دليل التواصل" → `ar/تواصل.html?subject=directory` in the DOM) |
| 26 | فيه مساحة كبيرة هنا محتاجين نوازن المساحات (destinations page spacing) | Done | First element after the hero (the search bar) sits 32px below it; `.ds-sec{margin-top:var(--s-7)}` (probe dest) |
| 27 | هنحافظ على نفس عرض الكرت والارتفاع بس بنفس ستايل الكرت المرفق وبدون CTA، الخلفية البيضا بالإطار (destination card white, framed, no CTA) | Done | `.ds-card` background rgb(255,255,255), border 1px solid, 0 CTA elements (R26) |
| 28 | شيل الجزء ده (remove the listing-type tabs) | Done | 0 tablist/`.ex-tabs` elements on experiences and entrepreneurs (R27) |
| 29 | محتاج يكون فيه سبيس صغير أوي بيفصل بين الهيدر والسيكشن (small gap hero → first section) | Done | Luxor: `#xh` → next section gap 64px (R28) |
| 30 | خلفية الكروت دي محتاجة تكون بيضا (resource cards white) | Done | `.rs-row` background rgb(255,255,255) on `ar/الموارد.html` (R29) |
| 31 | قلل الطول بتاع السيكشن ده شوية / رقم 04 محتاجة تكون بنفس لون 03 | Done | `.ab-next` height 423px at 1440; 04 numeral rgb(165,62,26) = 03 numeral (probe4) |
| 32 | الصورة هنا البنت شكلها مقصوص (photo crops) | Done | `experiences.js` silver workshop lead `pos: '50% 22%'`; story card crops in `content.js` (`pos: '62% 35%'` …) (R31a) |
| 33 | لو الكتابة هنا هتكون أكبر بكتير محتاجين نراعي شكل الكتابة في العرض (long Aswan intro in two columns) | Done | `aswan.html:560` `.ci-desc.is-long:not(.is-clamped){column-count:2}`; current intro is 458 chars (< 650 threshold at `aswan.html:1880`) so it stays one column until the text grows (R31b) |
| 34 | الكتابة دي عايزاها تكون على نفس السطر ("أهم الأنشطة في أسوان" on one line) | Done | `#lx-act` renders on 1 line at 1440 (R31c) |
| 35 | المساحة هنا كبيرة أوي ممكن تراجع عرض كل سيكشن في صفحة الأقصر (Luxor section widths) | Done | Every Luxor section's inner column is 1200px (probe2 luxor-sections) |
| 36 | عايزة يكون نفس الإطار المستخدم في هيدر الأقصر وأسوان موجود هنا (same motif band) | Done | `#xh .xh-band` on Luxor and Aswan; `.ab-hero-band`, `.fe-hero-band`, `xh-band ds-band` on destinations (R31e, R12, R02) |
| 37 | الكروت هنا محتاجة يكون خلفيتها بيضاء (About cards white) | Done | Same measurement as row 8: `.ab-card` and `.ab-facts` rgb(255,255,255) |
| 38 | dropdown "نوع المدخل" بنفس ستايل الفلتر وhover بلون البراند | Done | `#kindDd` details dropdown mirrors the hidden select; `update-request.html:244` `.f-dd .stl-dd summary:hover{…border-color:var(--rust)}` (R32) |
| 39 | الهيدر على الموبايل (mobile hero collage) | Done | `ar/index.html` has no nested `<picture>`; hero currentSrc `hero-bg-1440.avif` at 1440 and `hero-bg-mobile-768.avif` at 390 (probe home/home390) |
| 40 | pagination spacing + remove the indicator (home gems) | Done | `.gems-dots` display none; `.gems-nav--prev` inset-inline-start −72px (R34) |
| 41 | CTA "عرض كل التجارب والمنتجات" outlined like "استكشف كل الوجهات" | Done | Both `.gems-cta` computed identically: bg rgba(255,255,255,.35), border 1px solid rgb(165,62,26), colour rgb(165,62,26), radius 8px (probe home) |
| 42 | related cards everywhere = home cards (texture, no hover lift, no dots) | Done | `site.css:1261-1264`: `.gem-body::after` texture, `.gem:hover{transform:none}`, `.ex-strip-dots{display:none}`; experience detail `.dx-rel .gem` transform none, dots display none (probe3) |
| 43 | stakeholder cards same size as home cards | Done | `.sk-grid .gem` 368px = home gem 368px (R37) |
| 44 | frond background behind the map | Done | `.gems-fronds` layer inside `.sk-map` with `ASSETS/Group 21.webp` (probe2 sk-map-bg) |
| 45 | section 04 on the pharaonic illustration | Done | `.ab-next::before` background `ASSETS/motifs/pharaoh-frieze-1920.avif/webp` (R39) |
| 46 | Final pre-delivery check: locked decisions 1–11, checks A–F, compliance-final.md, fix, commit, push, verify live, short report | Done | `compliance-final.md` (Pass 72 / Fail 5 / N/A 2 / Needs decision 2); commits `4f391ef`, `f5b07a9`, `68a71c2` on `origin/main`; live site verified (R40) |
| 47 | عاوزة أحدث الخلفية فقط لكل كرت من الكروت الثلاثة بصفحة عن المشروع والتعديل يترفع على GitHub | Done | `.ab-quote` backgrounds `story-card-clay/ink/olive` (cropped from the ASSETS PNGs), text in the card colour; commit `f8b58ee` on `origin/main`, live page serves `story-card-clay-960` (R41) |
| 48 | الكروت تحت الوجهات - التجارب والمنتجات - رواد الأعمال - الجهات السياحية بشكل الكروت المخصص ليهم مع pagination يمين وشمال على GitHub (search results) | Done | `ar/بحث.html?q=ا`: `#sr-dest .ds-card` 6, `#sr-exp .gem` 6, `#sr-ep .gem` 4, `#sr-org .gem` 6; 3 group pagers with prev/next arrows at both ends; old rows 0; commit `80a580a` on `origin/main`, live page serves `sr-grid` (R42) |
| 49 | القصة المختارة في قصص النجاح single كرت بنفس شكل كرت ما وراء المألوف | Done | `#stLead` holds 1 `.gem` card, 440px = grid card 440px (R43); commit `80a580a` |

## Counts

| Status | Rows |
|---|---|
| Done | 48 |
| Needs decision | 1 (row 12) |
| Open | 0 |

## Rows not Done

| # | Status | Reason |
|---|---|---|
| 12 | Needs decision | Built the way the client asked today (card grid under the filters, map last). The Inception Report, Figure 19, says "Organisation map and directory. The list beside the map carries the same result set." and locked decision 5 says "list view beside the map". The client has to confirm which layout ships; the map page keeps the side-by-side layout meanwhile. |
