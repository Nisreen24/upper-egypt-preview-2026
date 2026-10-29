/* CMS Editing Guide generator — writes cms-editing-guide.html, a self-contained internal handover document.
   Sources: Inception Report v1.2 (§ references), design-system.html (the three editability labels per component)
   and the repo's templates and data files (file:line). Screenshots are taken from the running dev server with
   temporary marker overlays injected into the page; no site file is touched.
   Run: node serve.mjs (then) node build-cms-guide.mjs [--base http://localhost:3002/]
   Requires the project's puppeteer (Chrome under C:/pptr-cache, see .puppeteerrc.cjs) and sharp. */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const puppeteer = (await import(pathToFileURL(require.resolve('puppeteer')).href)).default;
const sharp = require('sharp');
const BASE = (process.argv.find(a => a.startsWith('--base=')) || '--base=http://localhost:3002/').slice(7);
const OUT = 'cms-editing-guide.html';
const TODAY = new Date().toISOString().slice(0, 10);

/* ---------- vocabulary ---------- */
const ST = {
  CMS: ['cms', 'Editable in the CMS'],
  HOLDER: ['holder', 'Editable by the holder (one time link, §4.2)'],
  LOCKED: ['locked', 'Not editable: design locked'],
  DEV: ['dev', 'Not editable: developer configuration'],
  AUTO: ['auto', 'Generated automatically'],
  CIDEAL: ['cideal', 'Held by CIDEAL on request'],
};
const L3 = 'AR · EN · ES, one record (§6.3)';
const L1 = 'Single value, shared by the three languages';
const LALT = 'Alt text in AR · EN · ES';
const NA = '—';
const TBA = 'To be agreed';
const NS = 'Not stated';
const IMG = 'image rule (Global rules): 3:2, portraits 4:5, at least 2000 px, alt text ×3, consent release';
const WHO_E = 'Editor or administrator publishes; contributor drafts (§6.5)';
const WHO_A = 'Administrator (§6.5)';
const WHO_H = 'Entrepreneur or organisation via the one time link; a coordinator approves (§4.2)';
const WHO_C = 'CIDEAL staff on request (§4.2)';
const WHO_N = NA;
const DS = n => 'DS · ' + n;
const CUR = '4 shown; more than 4 move in a carousel; a curated list is capped at 12; fewer than 4 topped up from the most recently published; empty source hides the section (§3.5)';

/* ---------- page model: one entry per template; rows are keyed to the marker numbers ----------
   row: [marker, element, content type · field, status, who edits, languages, limit / format, required, source] */
const PAGES = [
  { id: 'home', title: 'Home', file: 'index.html', fig: 'Report §3.3, Figure 5 (block list) and Figure 11 (wireframe)',
    shots: [{ url: 'en/index.html', markers: [['.hero', 1], ['#destinations', 2], ['#gems', 3], ['#experiences', 4], ['#business', 5], ['#success', 6], ['#tours', 7], ['#paths', 8], ['header.nav', 9], ['footer.footer', 10]] }, { url: 'en/index.html', mobile: true }],
    rows: [
      [1, 'Hero', 'Site configuration · platform line, one image (the prototype image is a sample collage labelled as such)', 'CMS', WHO_A, L3 + ' · ' + LALT, 'Text: ' + TBA + '. Image: ' + IMG, NS, '§3.3 Fig. 5 block 1; ' + DS('Hero: Content Editable (title, subtitle, image, alt, CTA on home only)') + '; index.html:576, :590'],
      [2, 'Luxor and Aswan, one card each', 'City · name, intro line, card image', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA + '. Image: ' + IMG, NS, '§3.3 Fig. 5 block 2; §6.2 City; ' + DS('Destination Card: Content Editable (image + alt, title, summary)') + '; index.html:595'],
      [3, 'Featured destinations', 'Site configuration · featured list, in display order → Destination entries', 'CMS', WHO_A, L1, 'Selection of published entries', NS, '§3.3 Fig. 5 block 3; §6.2 Site configuration ("what is featured on Home"); ' + DS('Section Carousel: Content Editable (items)') + '; index.html:610'],
      [4, 'Featured experiences and products', 'Site configuration · featured list → Experience or Product entries', 'CMS', WHO_A, L1, 'Selection of published entries', NS, '§3.3 Fig. 5 block 4; §6.2 Site configuration; index.html:690'],
      [5, 'Featured entrepreneurs', 'Site configuration · featured list → Entrepreneur entries (only entries with consent to publish)', 'CMS', WHO_A, L1, 'Selection of published entries', NS, '§3.3 Fig. 5 block 5; §6.2 Site configuration; Fig. 16 (consent); index.html:763'],
      [6, 'Success stories', 'Story · placement "shows on Home"', 'CMS', WHO_E, L1, 'Flag on the story entry', NS, '§3.3 Fig. 5 block 6; §6.2 Story ("where on the site it appears"); content.js:20–23 (home flag), :60; index.html:815'],
      [7, 'Upcoming events', 'Event entries, next by date', 'AUTO', WHO_N, NA, 'Upcoming = start date today or later', NA, '§3.3 Fig. 5 block 7; ' + DS('Event Card: Developer Configuration (past / upcoming status, date formatting)') + '; index.html:875'],
      [8, 'Two links: entrepreneurs, organisations', 'Card image, title and one line of text are card content; the two targets are fixed', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA + '. Image: see image rules', NS, '§3.3 Fig. 5 block 8; ' + DS('Card Anatomy: Content Editable (image, title, summary, link)') + '; index.html:918'],
      [9, 'Header', 'See "Header, footer and Site configuration"', 'CMS', WHO_A, L3, 'Six items in a fixed order', NA, '§3.2; §6.2 Site configuration (navigation labels)'],
      [10, 'Footer', 'See "Header, footer and Site configuration"', 'CMS', WHO_A, L3, 'Logos fixed; details from Site configuration', NA, '§6.2 Site configuration (footer details); §6.2 (official logo files)'],
    ],
    fixed: ['The order and number of the eight blocks (§3.3, Figure 5, Figure 11).', 'No newsletter block on Home; the newsletter sits only on the Contact page (locked decision 3, compliance-final.md:35).', 'Layout, colours and type of every block (DS · Hero, Card Anatomy, Section Carousel: Design System Locked).', 'The Explore menu children: Luxor, Aswan, Destinations, Experiences and Products, Map (§3.2, Figure 4; compliance-final.md:34).'],
    auto: ['Upcoming events are the next events by start date (Figure 5 block 7).', 'Featured blocks show the entries chosen in Site configuration in display order (§6.2). Whether the city-guide curation rule in §3.5 (4 shown, carousel above 4, cap of 12, top-up, hide when empty) also applies to Home is not stated: see Needs decision 5.'] },

  { id: 'destinations', title: 'Explore and the Destinations listing', file: 'destinations.html', fig: 'Report §3.2 (Explore branch), Figure 13 (listing with filters)',
    shots: [{ url: 'en/destinations.html', markers: [['#exploreBtn', 1], ['#exCrumb', 2], ['#xh', 3], ['#exAdvBtn', 4], ['#ds-h2', 5], ['#exGrid', 6]] }],
    rows: [
      [1, 'Explore menu (header)', 'Menu children: Luxor, Aswan, Destinations, Experiences and Products, Map. Labels come from Site configuration; the children are fixed', 'DEV', WHO_A + ' (labels only)', L3, 'Five children in a fixed order', NA, '§3.2 Figure 4; compliance-final.md:34; ' + DS('Header: Developer Configuration (current-page logic)')],
      [2, 'Breadcrumb', 'Built from the page titles', 'AUTO', WHO_N, L3 + ' (labels follow the titles)', 'Max 4 items', NA, DS('Breadcrumb: Content Editable (labels from page titles) · Developer Configuration (trail generation)')],
      [3, 'Hero: title, intro sentence, image', 'Listing page title and intro; image', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA + '. Image: ' + IMG, NS, DS('Hero: Content Editable (title, subtitle / lede, image, alt)') + '; destinations.html'],
      [4, 'Filter bar', 'Taxonomy terms and group labels: category (heritage site, museum, nature, viewpoint, market), city, pillar', 'CMS', WHO_E, L3, 'Terms per §6.4; starting values, not a fixed set', NA, '§6.4; Figure 13; ' + DS('Filter Bar: Content Editable (taxonomy, group labels, placeholder, empty message)') + '; destinations.js:9'],
      [5, 'Section heading and result count', 'Count of published destinations matching the filters', 'AUTO', WHO_N, NA, NA, NA, DS('Result Count / Empty State: Developer Configuration (live-region announcement)')],
      [6, 'Destination cards', 'Destination · image + alt, title, summary (card), link to the detail page', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA + '. Image: ' + IMG, NS, '§6.2 Destination; ' + DS('Destination Card: Content Editable (image + alt, title, summary, link)') + '; destinations.js:11–'],
    ],
    fixed: ['Card grid of 3 / 2 / 1 columns, card ratio, radius and typography (DS · Card Anatomy: Design System Locked).', 'Filter chip and panel style, the URL keys and the sort order (DS · Filter Bar: Design System Locked / Developer Configuration).', 'The hero variant per page type (DS · Hero: Design System Locked).'],
    auto: ['Filters are built from the taxonomies and empty values are hidden (DS · Filter Control: Developer Configuration).', 'Filter state is held in the URL (Figure 13; listing-engine.js:17).', 'The result count and the empty state (DS · Result Count / Empty State).'] },

  { id: 'destination', title: 'Destination detail', file: 'destination.html', fig: 'Report §6.2 Destination, Figure 14',
    shots: [{ url: 'en/destination.html?slug=karnak-temple', markers: [['#dxCrumb', 1], ['#xhMedia', 2], ['article#dx section.dxa', 3], ['#dxFacts', 4], ['#dxMapBox', 5], ['#dxDirections', 6], ['#dxRel', 7], ['#dxNear', 8]] }],
    rows: [
      [1, 'Breadcrumb', 'Home › Destinations › city › entry title', 'AUTO', WHO_N, L3, 'Max 4 items', NA, DS('Breadcrumb: Developer Configuration (trail generation)')],
      [2, 'Hero: lead image, title, summary', 'Destination · name, summary, lead image', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA + '. Image: ' + IMG, NS, '§6.2 Destination; Figure 14; ' + DS('Hero: Content Editable (title, lede, image, alt)')],
      [3, 'About the place: description, "read more", own pictures', 'Destination · description; gallery (the entry\'s own pictures)', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA + '. Gallery: ' + IMG, NS, '§6.2 Destination (description, gallery); ' + DS('Gallery: Content Editable (images, alt text, order)') + '; destination.html'],
      [4, 'Facts: category, pillar, accessibility', 'Destination · category (taxonomy), pillar (taxonomy), accessibility features (taxonomy)', 'CMS', WHO_E, L1 + ' (term labels are translated once in the taxonomy)', 'Category: heritage site, museum, nature, viewpoint, market. Accessibility: step free access, accessible toilet, seating, audio or visual support', 'Accessibility optional (§11.1 #7)', '§6.4; ' + DS('Metadata Row: Content Editable (values)') + '; destination.html:835; listing-shared.js:5'],
      [5, 'Map', 'Destination · location (coordinates); tiles and zoom are configuration', 'CMS', WHO_E + ' (coordinates)', L1, 'One coordinate pair', NS, '§6.2 Destination (location); ' + DS('Map + Results List: Content Editable (coordinates) · Developer Configuration (tile source, zoom)') + '; maps.js:5'],
      [6, 'Actions: directions, practical information, city map', 'Links derived from the coordinates and the city', 'AUTO', WHO_N, NA, NA, NA, DS('Button: Developer Configuration (variant per placement)') + '; destination.html'],
      [7, 'Experiences around this place', 'Destination · related experiences and entrepreneurs (relationship)', 'CMS', WHO_E, L1, 'Relationship to published entries', NS, '§6.2 Destination ("the experiences and entrepreneurs related to it"); Figure 14; ' + DS('Related Content: Content Editable (manual relationship)') + '; destinations.js (rel)'],
      [8, 'More places in the city', 'Other published destinations of the same city', 'AUTO', WHO_N, NA, NA, NA, DS('Related Content: Developer Configuration (auto-selection rules, max items)')],
    ],
    fixed: ['The entry template shape: hero, description, gallery, facts, map, related entries (Figure 14).', 'Column split, bento gallery layout, map size and button styles (DS · Gallery, Map + Results List, Button: Design System Locked).'],
    auto: ['Breadcrumb, action links, "more places in the city" and the map markers are derived from the entry and its city.', 'The entry lists the pages it appears on, so an editor can see what unpublishing it would change (§4.3).'] },

  { id: 'experiences', title: 'Experiences and Products listing', file: 'experiences.html', fig: 'Report §2.1 (destinations and experiences), Figure 13',
    shots: [{ url: 'en/experiences.html', markers: [['#xh', 1], ['#exQ', 2], ['#exAdvBtn', 3], ['#exGrid', 4]] }, { url: 'en/experiences.html', mobile: true }],
    rows: [
      [1, 'Hero: title, intro, image', 'Listing title and intro; image', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA + '. Image: ' + IMG, NS, DS('Hero: Content Editable (title, subtitle / lede, image, alt)') + '; experiences.html'],
      [2, 'Search field', 'Free-text search over the listing (a SwiftX addition); placeholder wording is a string', 'DEV', WHO_N, L3 + ' (placeholder)', NA, NA, '§2.1 Site search (SwiftX addition); ' + DS('Search Control: Content Editable (placeholder) · Developer Configuration (searchable fields)')],
      [3, 'Filter bar', 'Taxonomies: city, category (workshop, guided tour, food and drink, accommodation, local product), pillar, price band, accessibility', 'CMS', WHO_E, L3, 'Terms per §6.4; accommodation is community-based lodging, not a hotel', NA, '§2.1 Map filters; §6.4; §11.1 #5; ' + DS('Filter Bar: Content Editable (taxonomy, group labels)') + '; experiences.js:15–16'],
      [4, 'Experience and product cards', 'Experience or Product · image + alt, category, title, summary, duration, price band, accessibility flags', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA + '. Image: ' + IMG + '. Price band: symbol, four levels', 'Price band and accessibility optional (§11.1 #7)', '§6.2 Experience or Product; ' + DS('Experience / Product Card: Content Editable (image + alt, category, eyebrow, title, summary, duration, price, accessibility flags, link)')],
    ],
    fixed: ['Card anatomy, badge colour per category and the CTA label "View details" (DS · Experience / Product Card: Design System Locked).', 'Where to eat and where to stay are categories, not separate sections (§11.1 #5).'],
    auto: ['Filters from the taxonomies, result count, empty state and the filter state in the URL (Figure 13; listing-engine.js:17).', 'Local products appear in the same listing as experiences (§2.1).'] },

  { id: 'experience', title: 'Experience detail', file: 'experience.html', fig: 'Report §6.2 Experience or Product, Figure 15 (the entrepreneur block sits inside the page)',
    shots: [{ url: 'en/experience.html?slug=hot-air-balloon', markers: [['#dxCrumb', 1], ['#dxHero', 2], ['section.xp-gallery', 3], ['#xpNav', 4], ['#sec-overview', 5], ['#sec-highlights', 6], ['#sec-desc', 7], ['#sec-included', 8], ['#sec-meeting', 9], ['#xpCard', 10], ['#dxRel', 11]] }, { url: 'en/experience.html?slug=el-herfagya-leather', markers: [['#dxEnt', 12]], caption: 'A product entry: the entrepreneur block (marker 12) appears where the entry has an entrepreneur.' }, { url: 'en/experience.html?slug=hot-air-balloon', mobile: true }],
    rows: [
      [1, 'Breadcrumb', 'Home › Experiences › city › entry', 'AUTO', WHO_N, L3, 'Max 4 items', NA, DS('Breadcrumb: Developer Configuration')],
      [2, 'Title and "by" line', 'Experience or Product · name; the line names the city or the entrepreneur', 'CMS', WHO_E, L3, 'Text: ' + TBA, NS, '§6.2; experience.html'],
      [3, 'Lead image and thumbnails', 'Experience or Product · gallery (the entry\'s own pictures, lead first)', 'CMS', WHO_E, LALT, IMG, NS, '§6.2 (gallery); ' + DS('Gallery: Content Editable (images, alt text, order) · Developer Configuration (minimum counts)') + '; experiences.js (imgs, gal)'],
      [4, 'Section navigation', 'Built from the sections the entry carries', 'AUTO', WHO_N, NA, NA, NA, DS('Tabs: Developer Configuration (scroll-spy, keyboard model)')],
      [5, 'Overview: summary, tags, info list', 'Experience or Product · summary; city, category, pillar (taxonomies); duration', 'CMS', WHO_E, L3 + ' (summary) · ' + L1 + ' (taxonomies, duration)', 'Summary: ' + TBA + '. Duration: format ' + TBA, NS, '§6.2; §6.4; ' + DS('Metadata Row: Content Editable (values)')],
      [6, 'Highlights', 'Prototype field: three highlight lines (experiences.js "hl"). Not named in §6.2', 'CMS', WHO_E, L3, TBA, NS, 'experiences.js (hl); see Needs decision 7'],
      [7, 'Full description', 'Experience or Product · description', 'CMS', WHO_E, L3, TBA, NS, '§6.2'],
      [8, 'What is included', 'Prototype field: included items (experiences.js "inc"). Not named in §6.2', 'CMS', WHO_E, L3, TBA, NS, 'experiences.js (inc); see Needs decision 7'],
      [9, 'Meeting point and map', 'Experience or Product · location (coordinates); "get directions" derived', 'CMS', WHO_E + ' (coordinates)', L1, 'One coordinate pair', NS, '§6.2 (location); ' + DS('Map + Results List') + '; maps.js:5'],
      [10, 'Information card: facts, price band, pillar, contact route', 'Experience or Product · category, duration, location, price band (symbol), languages; "Contact the host" uses the entry\'s booking or contact route or links out', 'CMS', WHO_E, L1 + ' (facts) · ' + L3 + ' (route label)', 'Price band: one of four symbols, never an amount (§6.4). Duration: format ' + TBA, 'Price band and accessibility optional (§11.1 #7)', '§6.2; §6.4; §2.2 (no booking or payment: the platform links out and refers); experience.html:946; listing-shared.js:5 (PR)'],
      [11, 'Similar experiences', 'Other published experiences by city / category', 'AUTO', WHO_N, NA, NA, NA, DS('Related Content: Developer Configuration (auto-selection rules, strip threshold, max items)')],
      [12, 'The entrepreneur behind it', 'Experience or Product · entrepreneur (relationship); shows the entrepreneur\'s portrait, name, business and summary', 'CMS', WHO_E, L1 + ' (relationship)', 'One published entrepreneur with consent to publish', NS, '§6.2 ("the entrepreneur who offers it"); Figure 15; experiences.js (ent)'],
    ],
    fixed: ['Section order, sticky information card, rail and lightbox behaviour (DS · Gallery, Tabs: Design System Locked / Developer Configuration).', 'No booking, reservation or payment: the contact route links out or goes to the contact form (§2.2).'],
    auto: ['Section navigation, directions link, similar experiences and the map marker are derived from the entry.', 'Price band renders as a symbol from the taxonomy value (§6.4).'] },

  { id: 'city', title: 'City guide (Luxor and Aswan)', file: 'luxor.html, aswan.html', fig: 'Report §3.5, Figure 6 (10 sections and their sources), Figure 12',
    shots: [{ url: 'en/luxor.html', stitch: true, markers: [['#xh', 1], ['#lxTabs', 2], ['section.lx-sec.sus', 3], ['#cityInfo', 4], ['section.lx-sec.ac', 5], ['#lxPlaces', 6], ['section.lx-sec:has(#lx-food)', 7], ['section.lx-sec:has(#lx-stay)', 8], ['#business', 9], ['section.lx-sec:has(#lx-info)', 10], ['#lxMapSec', 11]] }, { url: 'en/luxor.html', mobile: true }],
    rows: [
      [1, '1 Hero, with the city name', 'City · name, intro line, hero image (a still poster; no self-hosted video)', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA + '. Image: ' + IMG, NS, '§3.5 Fig. 6 section 1; §6.2 City; §6.6 (no self-hosted video); ' + DS('Hero: Content Editable')],
      [2, 'Section navigation', 'Built from the sections the city carries', 'AUTO', WHO_N, NA, NA, NA, DS('Tabs: Developer Configuration (scroll-spy)') + '; luxor.html'],
      [3, '2 Sustainable tourism in this city', 'City · sustainable tourism text; chips; season rows; best-time note', 'CMS', WHO_E, L3, TBA, NS, '§3.5 Fig. 6 section 2; §6.2 City (introduction, practical information); city-info.js:5–40; luxor.html:1013'],
      [4, '3 About the city', 'City · about text and the info cards', 'CMS', WHO_E, L3, TBA, NS, '§3.5 Fig. 6 section 3; §6.2 City; luxor.html:1072'],
      [5, '4 Things to do', 'City · entries featured in this section → experiences in the workshop and guided tour categories', 'CMS', WHO_E, L1, CUR, NS, '§3.5 Fig. 6 section 4; §6.2 City ("the entries featured in each section"); luxor.html:1100'],
      [6, '5 Places to go', 'City · featured entries → destinations, any category', 'CMS', WHO_E, L1, CUR, NS, '§3.5 Fig. 6 section 5; luxor.html:1141'],
      [7, '6 Where to eat', 'City · featured entries → experiences in food and drink', 'CMS', WHO_E, L1, CUR, NS, '§3.5 Fig. 6 section 6; §11.1 #5; luxor.html:1201'],
      [8, '7 Where to stay', 'City · featured entries → experiences in accommodation (community-based, entrepreneur-run lodging; not a hotel)', 'CMS', WHO_E, L1, CUR, NS, '§3.5 Fig. 6 section 7; §6.4 (accommodation); luxor.html:1264'],
      [9, '8 Meet the entrepreneurs', 'City · featured entries → entrepreneurs in this city (consent to publish)', 'CMS', WHO_E, L1, CUR, NS, '§3.5 Fig. 6 section 8; Fig. 16; luxor.html:1287'],
      [10, '9 Practical information (accordion)', 'City · practical information: best time, transport, climate, safety, cultural tips (text only)', 'CMS', WHO_E, L3, TBA, NS, '§3.5 Fig. 6 section 9; §6.2 City (practical information); ' + DS('Accordion: Content Editable (questions, answers)') + '; city-info.js:10–40; luxor.html:1324'],
      [11, '10 The map, centred on the city', 'Markers come from the published entries of this city; the centre is the city\'s map centre', 'AUTO', WHO_N, NA, NA, NA, '§3.5 Fig. 6 section 10; ' + DS('Map + Results List: Developer Configuration (tile source, zoom, clustering)') + '; luxor.html:1334; maps.js:5'],
    ],
    fixed: ['The ten sections and their order (§3.5, Figure 6; locked decision 3); no "Where to buy" section (compliance-final.md:35).', 'Which source each listing section draws on is bound in the CMS, not in the template, so CIDEAL can point a section at a different category without a deployment (§3.5).', 'Section layouts, rails, arrows, accordion and tab styles (DS · Section Carousel, Accordion, Tabs: Design System Locked).'],
    auto: ['Four entries show at once; the chosen entries sort above any the platform adds; more than four move in a reader-advanced carousel; a curated list is capped at twelve (§3.5).', 'Fewer than four chosen are topped up to four from the most recently published entries of the section\'s own source; none chosen means all four come from there (§3.5).', 'An entry that is later unpublished drops out and the top-up fills its place; a section whose source has nothing published for that city is hidden (§3.5).', 'Each section links to its filtered listing and every card links to a detail page (§3.5).'] },

  { id: 'entrepreneurs', title: 'Entrepreneurs listing', file: 'entrepreneurs.html', fig: 'Report §2.1 (entrepreneur profiles and directory), Figure 13',
    shots: [{ url: 'en/entrepreneurs.html', markers: [['#xh', 1], ['#exQ', 2], ['#exAdvBtn', 3], ['#exGrid', 4]] }],
    rows: [
      [1, 'Hero: title, intro, image', 'Listing title and intro; image', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA + '. Image: ' + IMG, NS, DS('Hero: Content Editable')],
      [2, 'Search field', 'Free-text search over the directory (SwiftX addition)', 'DEV', WHO_N, L3 + ' (placeholder)', NA, NA, '§2.1 Site search; ' + DS('Search Control')],
      [3, 'Filter bar', 'Taxonomies: city, activity (value chain), pillar', 'CMS', WHO_E, L3, 'Value chain terms per §6.4', NA, '§6.4 (value chain, pillar, city); ' + DS('Filter Bar: Content Editable (taxonomy, group labels)') + '; entrepreneurs.js:10'],
      [4, 'Entrepreneur cards', 'Entrepreneur · portrait + alt, activity, name, business line, summary, city; only entries with consent to publish', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Portrait 4:5, at least 2000 px on the long edge, consent release', 'Consent to publish required (Fig. 16)', '§6.2 Entrepreneur; Figure 16; ' + DS('Entrepreneur Card: Content Editable (portrait + alt, activity, name, business line, summary, city, link)') + '; search.html:757 (consent filter)'],
    ],
    fixed: ['Card anatomy and the CTA label "View profile" (DS · Entrepreneur Card: Design System Locked).'],
    auto: ['Filters from the taxonomies, result count and empty state; the filter state in the URL (Figure 13).', 'An entrepreneur without consent to publish does not appear (Figure 16).'] },

  { id: 'entrepreneur', title: 'Entrepreneur profile', file: 'entrepreneur.html', fig: 'Report §6.2 Entrepreneur, §4.2 (holder edits), Figure 16 and Figure 23',
    shots: [{ url: 'en/entrepreneur.html?slug=fatma-boghdady', markers: [['#xhCrumb', 1], ['#xhMedia', 2], ['#epAbout', 3], ['#epStory', 4], ['aside.ep-side', 5], ['#dxRel', 6], ['#epGallery', 7]] }],
    rows: [
      [1, 'Breadcrumb', 'Home › Entrepreneurs › name', 'AUTO', WHO_N, L3, 'Max 4 items', NA, DS('Breadcrumb: Developer Configuration')],
      [2, 'Hero: portrait, name, business · activity', 'Entrepreneur · photo, name, business, activity (value chain taxonomy)', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Portrait 4:5, at least 2000 px, consent release. Text: ' + TBA, 'Name: publishing needs it (§6.2 v1 convention; v1.2: ' + NS + ')', '§6.2 Entrepreneur; Annex A (portraits); entrepreneurs.js:12'],
      [3, 'About: summary and description', 'Entrepreneur · descriptive text', 'HOLDER', WHO_H + '; also ' + WHO_E, L3, TBA, NS, '§4.2 (the descriptive text); §6.2 (their story); entrepreneurs.js (sum, desc)'],
      [4, 'Their story', 'Entrepreneur · story (narrative); the prototype also holds a timeline and impact numbers (entrepreneurs.js journey, impact), not named in §6.2', 'HOLDER', WHO_H + '; also ' + WHO_E, L3, TBA, NS, '§4.2; §6.2; entrepreneurs.js (journey, process, impact); see Needs decision 7'],
      [5, 'Side panel: Helmak badge, tags, contact button, update link', 'Helmak flag (CMS); city, activity, pillar (taxonomies, held by CIDEAL for the holder); contact route (holder); "Is this your profile?" link to the update request (fixed route)', 'CMS', 'Helmak flag, taxonomies: ' + WHO_E + '. Pillar and category for the holder: ' + WHO_C + '. Contact route: ' + WHO_H, L1 + ' (flag, taxonomies) · contact route per report', 'Yes / no flag; one contact route', NS, '§6.2 (whether they came through Helmak, how to reach them); §4.2 table; entrepreneur.html:895, :905'],
      [6, 'Products and experiences', 'Entrepreneur · what they offer (relationship to Experience or Product entries)', 'CMS', WHO_E, L1, 'Relationship to published entries', NS, '§6.2 ("what they offer"); Figure 16; ' + DS('Related Content: Content Editable (manual relationship)')],
      [7, 'Gallery', 'Entrepreneur · photographs (the entry\'s own pictures)', 'HOLDER', WHO_H + ' (add or remove); also ' + WHO_E, LALT, IMG, 'Alt text required before an image is used (§9.3)', '§4.2 (the gallery); §6.2; Figure 28; ' + DS('Gallery: Content Editable (images, alt text, order)')],
      ['—', 'Consent to publish', 'Entrepreneur · consent to publish: decides whether the profile appears at all', 'CIDEAL', WHO_C, L1, 'Yes / no', 'Required for publication (Fig. 16)', '§4.2 (held by CIDEAL); §6.2; Figure 16'],
      ['—', 'Registered email', 'Entrepreneur · address the one time link is sent to; never shown on the page', 'CIDEAL', WHO_C, L1, 'One address', NS, '§4.2; entrepreneurs.js:12 (prototype stand-in)'],
    ],
    fixed: ['Numbering, rail, tile sizes and lightbox (DS · Gallery: Design System Locked).', 'The profile is published only where the consent field is set (Figure 16).', 'The update route: a one time link emailed to the registered address, single use, valid 24 hours (§4.2, §7.4).'],
    auto: ['Products and experiences show the published entries related to the entrepreneur; the contact button follows the contact route.', 'A saved holder edit enters the review queue and appears only after a coordinator approves it (§4.2).'] },

  { id: 'stories', title: 'Success stories listing', file: 'stories.html', fig: 'Report Figure 24 (the leading story sits above the grid)',
    shots: [{ url: 'en/stories.html', markers: [['#xh', 1], ['#ex-h', 2], ['#exAdv', 3], ['#stLead', 4], ['#exGrid', 5]] }],
    rows: [
      [1, 'Nile header band', 'A design image on pages that carry no photograph of their own', 'LOCKED', WHO_N, NA, NA, NA, DS('Hero: Design System Locked (variant per page type, motif band)') + '; site.css:1252'],
      [2, 'Title and lede', 'Listing title and intro sentence', 'CMS', WHO_E, L3, TBA, NS, DS('Section Heading: Content Editable (title)') + '; stories.html'],
      [3, 'Dropdowns: city, pillar, entrepreneur', 'Built from the taxonomies and the published entrepreneurs; state in the URL', 'AUTO', WHO_N, L3 + ' (group labels)', NA, NA, 'Figure 24; §6.4; ' + DS('Filter Bar: Content Editable (group labels) · Developer Configuration (URL keys)') + '; compliance-final.md:42'],
      [4, 'Featured story', 'Story · placement "leads the success stories listing"', 'CMS', WHO_E, L1, 'One story carries the flag; otherwise the first published', NS, '§6.2 Story ("where on the site it appears"); Figure 24; content.js:20 (lead), :60; stories.html:795'],
      [5, 'Story cards and "load more"', 'Story · image + alt, title, city, pillar; six per page then "load more"', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA + '. Image: ' + IMG, NS, '§6.2 Story; ' + DS('Story · News · Learning Path Cards: Content Editable (image, title, summary, category / person / city)') + '; stories.html:596'],
    ],
    fixed: ['The leading story above the grid, the three dropdowns and the grid (Figure 24).', 'Card anatomy and the CTA label per type (DS · Story cards: Design System Locked).'],
    auto: ['The dropdown values, the result set and the paging.'] },

  { id: 'story', title: 'Story detail', file: 'story.html', fig: 'Report §6.2 Story; Figure 5 (each story links to the entrepreneur behind it)',
    shots: [{ url: 'en/story.html?slug=fatma-el-herfagya', markers: [['#dxCrumb', 1], ['#xhMedia', 2], ['article#dx section.dxa', 3], ['#dxEnt', 4], ['#dxFacts', 5], ['#dxSections section.dx-rel:nth-child(1)', 6], ['#dxSections section.dx-rel:nth-child(2)', 7]] }],
    rows: [
      [1, 'Breadcrumb', 'Home › Success stories › title', 'AUTO', WHO_N, L3, 'Max 4 items', NA, DS('Breadcrumb: Developer Configuration')],
      [2, 'Hero: image and title', 'Story · title, image', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA + '. Image: ' + IMG, NS, '§6.2 Story; content.js:19–23'],
      [3, 'The story: summary, body paragraphs, pictures', 'Story · summary, body', 'CMS', WHO_E, L3, TBA, NS, '§6.2 Story; content.js (s, body)'],
      [4, 'The entrepreneur behind the story', 'Story · entrepreneur (relationship); the block shows the published profile', 'CMS', WHO_E, L1, 'One published entrepreneur', NS, '§3.3 Fig. 5 ("each linking to a profile"); content.js (ent)'],
      [5, 'Facts: person, city, pillar', 'Story · person, city, pillar (taxonomy)', 'CMS', WHO_E, L3 + ' (person) · ' + L1 + ' (city, pillar)', TBA, NS, '§6.2; §6.4; ' + DS('Metadata Row: Content Editable')],
      [6, 'Products and experiences', 'The entrepreneur\'s published products and experiences', 'AUTO', WHO_N, NA, NA, NA, DS('Related Content: Developer Configuration (auto-selection rules)')],
      [7, 'Other stories', 'Other published stories', 'AUTO', WHO_N, NA, NA, NA, DS('Related Content: Developer Configuration')],
      ['—', 'Placement flags', 'Story · leads the listing; shows on Home', 'CMS', WHO_E, L1, 'Yes / no flags', NS, '§6.2 Story ("where on the site it appears"); content.js:20–23 (lead, home), :60'],
    ],
    fixed: ['The entry shape: hero, body, facts, entrepreneur block, related entries.'],
    auto: ['Related products, experiences and other stories.'] },

  { id: 'resources', title: 'Resources (opens on learning paths)', file: 'for-entrepreneurs.html', fig: 'Report §3.3 Figure 5 (For Entrepreneurs: learning paths, resources, upcoming events, success stories), Figure 17',
    shots: [{ url: 'en/for-entrepreneurs.html', markers: [['.fe-hero', 1], ['#paths', 2], ['#resources', 3], ['#events', 4]] }],
    rows: [
      [1, 'Hero: title, image, "request a link to update your entry"', 'Page title and image; the update link is the fixed route of §4.2', 'CMS', WHO_E + ' (title, image)', L3 + ' · ' + LALT, 'Text: ' + TBA + '. Image: ' + IMG, NS, DS('Hero: Content Editable') + '; §4.2 (update route); for-entrepreneurs.html:599'],
      [2, 'Learning paths', 'Learning Path · title, image; the step count is counted from the ordered resources', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA + '. Count: automatic', NS, '§6.2 Learning Path; Figure 17; ' + DS('Story · News · Learning Path Cards: Content Editable (image, title, step count)') + '; resources.js:34–37'],
      [3, 'Resources: format chips, topic and pillar dropdowns, resource cards', 'Resource · title, summary, format (document, link, video, webinar recording), topic, pillar, audience, file or link, YouTube ID', 'CMS', WHO_E, L3 + ' (title, summary) · ' + L1 + ' (format, taxonomies)', 'Format: four values (§6.6). Video: YouTube embed only, never uploaded; captions and transcript are part of the entry', NS, '§6.2 Resource; §6.6; §6.4 (audience); ' + DS('Resource Card: Content Editable (title, format, file / URL / video, duration)') + '; resources.js:6–31'],
      [4, 'Upcoming events', 'Event entries for entrepreneurs, next by date', 'AUTO', WHO_N, NA, NA, NA, '§3.3 Fig. 5 (For Entrepreneurs block 3); resources.js:40–48 (upcoming)'],
    ],
    fixed: ['The section order: learning paths first, then resources, then events (Figure 5, Figure 17).', 'Card and row layouts, format tile colours (DS · Resource Card, Learning Path cards: Design System Locked).'],
    auto: ['Format counts, the topic and pillar dropdown values, the empty state, and the upcoming filter on events.', 'The full resource library page (resources.html) opens from a video row on this page (for-entrepreneurs.html:829) and uses the same resource rows.'] },

  { id: 'learning-path', title: 'Learning path detail', file: 'learning-path.html', fig: 'Report §6.2 Learning Path, §11.1 #4, Figure 18 (Wireframe 8)',
    shots: [{ url: 'en/learning-path.html?slug=how-to-start-a-business', markers: [['#exCrumb', 1], ['#lpdHead', 2], ['#lpdSteps', 3], ['#lpdRes0', 4], ['#lpdNote', 5], ['#lpStories', 6]] }],
    rows: [
      [1, 'Breadcrumb', 'For entrepreneurs › Learning paths › path title', 'AUTO', WHO_N, L3, '3 items', NA, DS('Breadcrumb: Developer Configuration')],
      [2, 'Title and "N steps · open access, no registration"', 'Learning Path · title; the count is the number of steps; the line is a fixed string', 'CMS', WHO_E + ' (title)', L3, 'Title: ' + TBA, NS, '§6.2; Figure 18; learning-path.html (render); i18n.js ("وصول مفتوح، بدون تسجيل")'],
      [3, 'Numbered steps with their resource types', 'Learning Path · ordered resources; the prototype groups them under titled steps (resources.js plan)', 'CMS', WHO_E, L3 + ' (step titles) · ' + L1 + ' (order)', 'Order only; no completion state', NS, '§6.2 (an ordered route through several resources); §11.1 #4; resources.js:35; see Needs decision 8'],
      [4, 'Resources of the open step', 'Resource rows: document downloads, link opens in a new tab, video or webinar plays from its poster on click', 'CMS', WHO_E, L3, 'Per the Resource type (§6.6)', NS, '§6.6; ' + DS('Resource Card: Content Editable · Developer Configuration (YouTube embed loads on click, external-link attributes)') + '; learning-path.html (resRow)'],
      [5, 'Note "Ordered reading. No enrolment, no progress tracking, no certificates."', 'Fixed string', 'LOCKED', WHO_N, L3 + ' (dictionary)', NA, NA, 'Figure 18; i18n.js ("قراءة مرتبة…")'],
      [6, 'Related success stories', 'Stories named on the path (up to three); hidden when none', 'CMS', WHO_E, L1, 'Up to 3', NS, 'Figure 18 ("related stories"); resources.js:35–37 (stories); DS · Learning Path · Open items; see Needs decision 8'],
    ],
    fixed: ['The page shape of Figure 18: title, count line, full-width numbered steps, the note, related stories. No hero, sidebar, progress, enrolment or certificates (§11.1 #4).'],
    auto: ['The step count, the resource-type line under each step, the current-step marker and the empty states ("This path has no steps yet", "No resources for this step yet").'] },

  { id: 'events', title: 'Events listing and Event detail', file: 'events.html, event.html', fig: 'Report §2.1 Events, §6.2 Event',
    shots: [{ url: 'en/events.html', markers: [['#xh', 1], ['#exQ', 2], ['#exAdvBtn', 3], ['#exGrid', 4]] }, { url: 'en/event.html?slug=pricing-workshop-aswan', markers: [['#dxCrumb', 5], ['#xhMedia', 6], ['article#dx section.dxa', 7], ['#dxFacts', 8], ['#dxiActions', 9], ['#dxSections', 10]] }],
    rows: [
      [1, 'Hero: title, intro, image', 'Listing title and intro; image', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA + '. Image: ' + IMG, NS, DS('Hero: Content Editable')],
      [2, 'Search field', 'Free-text search over events (SwiftX addition)', 'DEV', WHO_N, NA, NA, NA, '§2.1 Site search; ' + DS('Search Control')],
      [3, 'Filter bar', 'Taxonomies: city, kind, audience, pillar', 'CMS', WHO_E, L3, 'Audience: entrepreneurs, organisations or both (§6.4)', NA, '§6.4; ' + DS('Filter Bar: Content Editable')],
      [4, 'Event cards', 'Event · image + alt, date, time, title, kind, city, audience, registration link', 'CMS', WHO_E, L3 + ' · ' + L1 + ' (dates)', 'Dates: ISO date and time, single value. Image: ' + IMG, NS, '§6.2 Event; ' + DS('Event Card: Content Editable (image + alt, date, time, title, kind, city, audience, registration link)') + '; content.js:11'],
      [5, 'Breadcrumb', 'Home › Events › title', 'AUTO', WHO_N, L3, 'Max 4 items', NA, DS('Breadcrumb: Developer Configuration')],
      [6, 'Hero: image and title', 'Event · title, image', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA, NS, '§6.2 Event'],
      [7, 'About the event: description', 'Event · summary, description', 'CMS', WHO_E, L3, TBA, NS, '§6.2 Event'],
      [8, 'Facts: date and time, place or online, city, audience, kind, pillar', 'Event · start and end date and time, location or online, city, audience, kind, pillar', 'CMS', WHO_E, L1 + ' (dates, flags, taxonomies) · ' + L3 + ' (place name)', 'Dates single value; the page formats them per language', NS, '§6.2 Event; §6.4; ' + DS('Date Badge: Content Editable (date, ISO) · Developer Configuration (locale formatting)')],
      [9, 'Registration link', 'Event · registration link; hidden once the event is past', 'CMS', WHO_E, L1, 'One URL', NS, '§2.1 Events (registration link); §6.2; event.html:800'],
      [10, 'Other upcoming events', 'Other events with a start date today or later', 'AUTO', WHO_N, NA, NA, NA, DS('Related Content: Developer Configuration') + '; ' + DS('Event Card: Developer Configuration (past / upcoming status)')],
    ],
    fixed: ['Square media, date block, two-line title and the compact CTA "Register now" (DS · Event Card: Design System Locked).'],
    auto: ['Past / upcoming status from the dates; date formatting per language; the related events strip.'] },

  { id: 'news', title: 'News listing and News article', file: 'news.html, news-article.html', fig: 'Report §3.3 Figure 5 (For Tourism Stakeholders: sector news), §6.2 News',
    shots: [{ url: 'en/news.html', markers: [['#xh', 1], ['#exQ', 2], ['#exAdvBtn', 3], ['#exGrid', 4]] }, { url: 'en/news-article.html?slug=helmak-third-cohort-call', markers: [['#dxCrumb', 5], ['#xhMedia', 6], ['article#dx section.dxa', 7], ['#dxFacts', 8], ['#dxSections section.dx-rel:nth-child(1)', 9], ['#dxSections section.dx-rel:nth-child(2)', 10]] }],
    rows: [
      [1, 'Hero: title, intro, image', 'Listing title and intro; image', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA + '. Image: ' + IMG, NS, DS('Hero: Content Editable')],
      [2, 'Search field', 'Free-text search over news (SwiftX addition)', 'DEV', WHO_N, NA, NA, NA, '§2.1; ' + DS('Search Control')],
      [3, 'Filter bar', 'Taxonomies: city, pillar', 'CMS', WHO_E, L3, 'Terms per §6.4', NA, '§6.4; ' + DS('Filter Bar: Content Editable')],
      [4, 'News cards', 'News · image + alt, date, title, summary, city', 'CMS', WHO_E, L3 + ' · ' + L1 + ' (date)', 'Date single value. Image: ' + IMG, NS, '§6.2 News; ' + DS('Story · News · Learning Path Cards: Content Editable (news: calendar + date badge, city meta)') + '; content.js (news)'],
      [5, 'Breadcrumb', 'Home › News › title', 'AUTO', WHO_N, L3, 'Max 4 items', NA, DS('Breadcrumb: Developer Configuration')],
      [6, 'Hero: image and title', 'News · title, cover image', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA, NS, '§6.2 News'],
      [7, 'The article: summary and body', 'News · summary, body', 'CMS', WHO_E, L3, TBA, NS, '§6.2 News'],
      [8, 'Facts: date, city, pillar', 'News · date, city, pillar (taxonomy)', 'CMS', WHO_E, L1, 'Date single value', NS, '§6.2; §6.4; ' + DS('Metadata Row')],
      [9, 'Related to this article', 'News · related entries (relationship to events, destinations, experiences…)', 'CMS', WHO_E, L1, 'Relationship to published entries', NS, '§6.2 News ("related entries" in the v1 content model; content.js rel field); ' + DS('Related Content: Content Editable (manual relationship)')],
      [10, 'Other news', 'Other published news items', 'AUTO', WHO_N, NA, NA, NA, DS('Related Content: Developer Configuration')],
    ],
    fixed: ['The entry shape and the card anatomy (DS · News card: Design System Locked).'],
    auto: ['Date formatting per language; the "other news" strip.'] },

  { id: 'stakeholders', title: 'For Tourism Stakeholders (organisations listing)', file: 'stakeholders.html', fig: 'Report §3.3 Figure 5 (directory and map; register an organisation), Figure 19',
    shots: [{ url: 'en/stakeholders.html', markers: [['#xh', 1], ['#exQ', 2], ['#exAdvBtn', 3], ['#exGrid', 4], ['aside.sk-map', 5]] }, { url: 'en/stakeholders.html', mobile: true }],
    rows: [
      [1, 'Hero: title, intro, image, "register an organisation"', 'Page title and intro; image; the registration link is the fixed route of §4.1', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA + '. Image: ' + IMG, NS, DS('Hero: Content Editable') + '; §4.1 (registration form)'],
      [2, 'Search field', 'Free-text search over organisations (SwiftX addition)', 'DEV', WHO_N, NA, NA, NA, '§2.1 Site search'],
      [3, 'Filter bar', 'Taxonomies: organisation type (government body, NGO, university, private sector operator), city, value chain', 'CMS', WHO_E, L3, 'Value chain terms per §6.4', NA, '§2.1 Map (filters for organisations); §6.4; content.js:27–28; ' + DS('Filter Bar: Content Editable')],
      [4, 'Organisation cards', 'Organisation · type, name, summary, value chain tags, city, public contact route', 'CMS', WHO_E + ' · description and public contact also by the holder (§4.2)', L3 + ' (name, description) · ' + L1 + ' (type, tags)', TBA, NS, '§6.2 Organisation; ' + DS('Organisation Card: Content Editable (type, name, summary, tags, city, link)') + '; content.js:29'],
      [5, 'Map of organisations', 'Markers from the published organisations with coordinates; same result set as the list', 'AUTO', WHO_N, NA, NA, NA, 'Figure 19; ' + DS('Map + Results List: Developer Configuration (tile source, zoom, clustering)') + '; stakeholders.html:564; maps.js:5'],
    ],
    fixed: ['Row layout, 48 px icon tile, dense tags and the compact CTA (DS · Organisation Card: Design System Locked).', 'Private contact details never render on a public page (§6.2, §7.4).'],
    auto: ['Filters from the taxonomies; the map carries the same result set as the list (Figure 19).', 'Figure 19 places the list beside the map; the built page shows the grid under the filters and the map last at the client\'s request (compliance-final.md:171): see Needs decision 10.'] },

  { id: 'organisation', title: 'Organisation detail', file: 'organisation.html', fig: 'Report §6.2 Organisation, §4.2 (holder edits)',
    shots: [{ url: 'en/organisation.html?slug=cideal-egypt', markers: [['#dxCrumb', 1], ['#xhMedia', 2], ['article#dx section.dxa', 3], ['#dxFacts', 4], ['#dxMapBox', 5], ['#dxiActions', 6], ['#dxSections', 7]] }],
    rows: [
      [1, 'Breadcrumb', 'Home › Tourism bodies › name', 'AUTO', WHO_N, L3, 'Max 4 items', NA, DS('Breadcrumb: Developer Configuration')],
      [2, 'Hero: image and name', 'Organisation · name; thumbnail image (optional)', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA, NS, '§6.2 Organisation; content.js:29'],
      [3, 'About the organisation', 'Organisation · description', 'HOLDER', WHO_H + '; also ' + WHO_E, L3, TBA, NS, '§4.2 table (the description); §6.2'],
      [4, 'Facts: type, city, value chain', 'Organisation · type (taxonomy), city, value chain tags', 'CMS', WHO_E + '; for the holder these are held by CIDEAL (§4.2: pillar, category)', L1, 'Type: government body, NGO, university, private sector operator', NS, '§6.2; §6.4 (value chain); §4.2; content.js:27–28'],
      [5, 'Map', 'Organisation · location (coordinates)', 'CMS', WHO_E, L1, 'One coordinate pair', NS, '§6.2 ("location" in the organisation entry; content.js ll); ' + DS('Map + Results List')],
      [6, 'Actions: public contact route, "update the organisation\'s details"', 'Organisation · public contact route (URL or the platform contact form); the update link is the fixed route of §4.2', 'HOLDER', WHO_H + '; also ' + WHO_E, 'Per report', 'One public route; private contact details are never published', NS, '§4.2 table (the public contact route); §6.2; organisation.html:800'],
      [7, 'Other organisations in the city', 'Other published organisations of the same city', 'AUTO', WHO_N, NA, NA, NA, DS('Related Content: Developer Configuration')],
      ['—', 'Private contact details, registered email, consent to publish', 'Held in the CMS; private contact fields never render on a public page', 'CIDEAL', WHO_C + ' (registered email, consent to publish, pillar, category)', L1, NA, NS, '§4.2 table; §6.2; §7.4'],
    ],
    fixed: ['The facts card and the map (DS · Organisation Card, Map + Results List: Design System Locked).', 'An organisation page carries its description and public contact routes only (§6.2); a richer page pattern was declined (cms-constraints.xlsx, Open items 5).'],
    auto: ['The related organisations strip and the map marker.'] },

  { id: 'about', title: 'About the Project', file: 'about.html', fig: 'Report §3.4, Figure 6 (four named sections), Figure 25',
    shots: [{ url: 'en/about.html', markers: [['header.ab-hero', 1], ['#abBlocks > section:nth-of-type(1)', 2], ['#abBlocks > section:nth-of-type(2)', 3], ['#abBlocks > section:nth-of-type(3)', 4], ['#abBlocks > section:nth-of-type(4)', 5], ['#abQuotes', 6]] }],
    rows: [
      [1, 'Hero: title and image', 'Page · title; image', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA + '. Image: ' + IMG, NS, '§6.2 Page; ' + DS('Hero: Content Editable') + '; about.html:562'],
      [2, '1 Programme identity', 'Page · section text; programme title, AECID activity code, AECID as funder, the implementing partners CIDEAL, FPSC, KEF and ENROOT (names and official logos)', 'CMS', WHO_E, L3, 'Text: ' + TBA + '. Logos: official files from CIDEAL only', NS, '§3.4 Fig. 6; Figure 25; §6.2 (official logo files); content.js:51–56 (site.about); about.html:567'],
      [3, '2 Local context and the challenges', 'Page · section text', 'CMS', WHO_E, L3, TBA, NS, '§3.4 Fig. 6; Figure 25; about.html:576'],
      [4, '3 The work so far', 'Page · section text (value chain studies, hidden gems, Helmak incubation, alliances, marketing campaigns per Figure 25)', 'CMS', WHO_E, L3, TBA, NS, '§3.4 Fig. 6; Figure 25; about.html:584'],
      [5, '4 What comes next', 'Page · section text', 'CMS', WHO_E, L3, TBA, NS, '§3.4 Fig. 6; Figure 25; about.html:595'],
      [6, 'Testimonials', 'Drawn from the Story type (the stories\' pull quotes)', 'AUTO', WHO_N + ' (chosen through the Story entries)', NA, 'Three shown', NA, 'Figure 25 ("testimonial from the Story type"); about.html:600'],
    ],
    fixed: ['Four named sections in this order, held as sections of the About page rather than free body blocks (§3.4, Figure 6).', 'Prose width and type (DS · Section Heading: Design System Locked).'],
    auto: ['The testimonials come from published Story entries.'] },

  { id: 'contact', title: 'Contact', file: 'contact.html', fig: 'Report §4.1 (general inquiry), §6.7 (review queue), Figure 26',
    shots: [{ url: 'en/contact.html', markers: [['header.pg-head', 1], ['#frm', 2], ['section.pg aside', 3], ['#newsCard', 4]] }],
    rows: [
      [1, 'Title and intro', 'Page · title and intro', 'CMS', WHO_E, L3, TBA, NS, 'Figure 26; ' + DS('Form Shell: Content Editable (legends, labels, hints)')],
      [2, 'General inquiry form: name, email, subject, message, consent, bot check', 'Labels, hints, consent text and the acknowledgement are message-template strings; the subject list is edited by CIDEAL; validation, Turnstile and the submission limits are configuration', 'CMS', WHO_A + ' (message templates, §6.5)', L3, 'Name, email, message required (contact.html form); consent required', 'Required per the form', '§4.1; §6.7; ' + DS('Form Shell: Content Editable (legends, labels, hints, consent text, success / error copy) · Developer Configuration (validation, rate limit, bot check)') + '; contact.html:733 (subjects from content.js:49)'],
      [3, 'Programme email and other routes', 'Site configuration · programme email address; the links to registration and the update request are fixed routes', 'CMS', WHO_A, L1 + ' (address) · ' + L3 + ' (labels)', 'One address', NS, '§6.2 Site configuration; content.js:48; contact.html:535'],
      [4, 'Newsletter signup', 'Email subscribe point (SwiftX addition): email and consent; confirmation and unsubscribe pages are reached from the emails', 'DEV', WHO_A + ' (title, button label and messages are strings)', L3, 'One email address; double opt-in', 'Consent required', '§2.1 Newsletter signup (SwiftX addition); ' + DS('Newsletter Section: Content Editable (title, subtitle, button label, messages) · Developer Configuration (validation, confirm / unsubscribe tokens)') + '; contact.html:527'],
    ],
    fixed: ['The form path into the review queue (§4.1, Figure 8): every submission is validated, bot-checked and rate limited, then the coordination team is alerted.', 'Field styles, validation and the bot check (DS · Form Shell: Design System Locked / Developer Configuration).'],
    auto: ['The acknowledgement email in the language the visitor wrote in, from the message templates; the due date counted from the response time CIDEAL sets per request type (§4.1, §6.7).'] },

  { id: 'search', title: 'Search results', file: 'search.html', fig: 'Report §2.1 Site search (SwiftX addition)',
    shots: [{ url: 'en/search.html?q=luxor', markers: [['#srTitle', 1], ['#srQ', 2], ['#srBrowse', 3], ['#srGroups', 4]] }],
    rows: [
      [1, 'Title and lede', 'Strings', 'CMS', WHO_A + ' (strings)', L3, TBA, NS, DS('Search Control: Content Editable (placeholder, count wording)')],
      [2, 'Search field', 'Free text over destinations, experiences, entrepreneurs and organisations', 'DEV', WHO_N, NA, NA, NA, '§2.1; search.html:752–757 (searchable fields)'],
      [3, 'Browse links', 'Fixed links to the listings', 'DEV', WHO_N, L3, NA, NA, 'search.html'],
      [4, 'Result groups with counts and the listing cards', 'Counts and cards are generated from the published entries; entrepreneurs only with consent', 'AUTO', WHO_N, NA, NA, NA, '§2.1; ' + DS('Result Count / Empty State: Developer Configuration') + '; search.html:757'],
    ],
    fixed: ['The groups and their order, the cards (the same listing cards), the pager.'],
    auto: ['Everything on the page is derived from the query and the published entries.'] },

  { id: 'map', title: 'Map', file: 'map.html', fig: 'Report §2.1 Map (filters), Figure 19 (list beside the map)',
    shots: [{ url: 'en/map.html', markers: [['#xh', 1], ['#exQ', 2], ['#exAdvBtn', 3], ['#exGrid', 4], ['aside.sk-map', 5]] }],
    rows: [
      [1, 'Hero: title, intro, image', 'Page title and intro; image', 'CMS', WHO_E, L3 + ' · ' + LALT, 'Text: ' + TBA + '. Image: ' + IMG, NS, DS('Hero: Content Editable')],
      [2, 'Search field', 'Free-text search over the places shown', 'DEV', WHO_N, NA, NA, NA, '§2.1 Site search'],
      [3, 'Filter bar', 'Taxonomies: city, category, pillar, price band, accessibility', 'CMS', WHO_E, L3, 'Terms per §6.4', NA, '§2.1 Map; §6.4; ' + DS('Filter Bar: Content Editable')],
      [4, 'Results list with pager', 'Published destinations, experiences and entrepreneurs with coordinates; six per page', 'AUTO', WHO_N, NA, NA, NA, 'Figure 19; ' + DS('Map + Results List: Developer Configuration') + '; map.html'],
      [5, 'Map', 'Markers from the entries\' coordinates; tiles, zoom and clustering are configuration; the MapTiler key is empty in the prototype', 'AUTO', WHO_N, NA, NA, NA, DS('Map + Results List: Content Editable (coordinates, type, name, summary, thumbnail) · Developer Configuration (tile source, zoom, clustering)') + '; maps.js:5; compliance-final.md:170 (key)'],
    ],
    fixed: ['Marker and popup style, split widths, marker colour per type (DS · Map + Results List: Design System Locked).'],
    auto: ['Markers, popups and the list come from the same filtered result set (Figure 19).'] },

  { id: 'forms', title: 'The request forms, their acknowledgement and the edit-link page', file: 'register-organisation.html, update-request.html, edit.html', fig: 'Report §4.1 (three request types), §4.2 (profile updates), §6.7 (review queue), Figures 8, 9, 20 and 28',
    shots: [
      { url: 'en/register-organisation.html', markers: [['header.pg-head', 1], ['#frm fieldset:nth-of-type(1)', 2], ['#frm fieldset:nth-of-type(2)', 3], ['#frm fieldset:nth-of-type(3)', 4], ['#frm fieldset:nth-of-type(4)', 5], ['section.pg aside', 6]], caption: 'Organisation registration (Figure 20).' },
      { url: 'en/update-request.html', markers: [['#frm', 7], ['section.pg aside', 8]], caption: 'Update request: the holder asks for a one time link (§4.2).', submit: { fill: { '#f-email': 'holder@example.com' }, select: { '#f-kind': 'entrepreneur' }, check: ['input[name="c_contact"]', '.f-turnstile button'] }, afterMarkers: [['#frm .f-status, #frm [role="status"], .f-status', 9]], afterCaption: 'The acknowledgement after sending (marker 9): the same answer whether or not the address matches an entry (§4.2).' },
      { url: 'en/edit.html', token: ['entrepreneur', 'fatma-boghdady'], markers: [['header.pg-head', 10], ['#frm', 11]], caption: 'Editing an entry through a valid one time link (Figure 28). The fields are the ones the holder may change; the notice says the change is reviewed before it appears.' },
    ],
    rows: [
      [1, 'Title and intro', 'Page strings', 'CMS', WHO_A + ' (message templates and page strings)', L3, TBA, NS, 'Figure 20; ' + DS('Form Shell: Content Editable (legends, labels, hints)')],
      [2, 'Applicant: name, email', 'Submission fields', 'DEV', WHO_N, L3 + ' (labels)', 'Required', 'Required', '§4.1 (name, email, message plus the fields the type needs); register-organisation.html'],
      [3, 'Organisation: name, type, city, description, value chain, public contact route', 'Becomes the draft Organisation entry on approval', 'DEV', WHO_N + ' (the editors complete the draft)', L3 + ' (labels)', 'Type: four values; city: Luxor, Aswan', 'Name, type, city required (form)', '§4.1; §6.7 (approving creates a draft organisation entry); register-organisation.html:518'],
      [4, 'Private contact details (not published)', 'Private contact name, phone, email: visible to staff only', 'DEV', WHO_N, NA, 'Never shown on a public page', NS, '§6.2; §7.4; register-organisation.html:526'],
      [5, 'Consents', 'Consent to be contacted; consent to publish the public fields; the form records the consent text as it stood (§7.4)', 'DEV', WHO_A + ' (consent wording)', L3, NA, 'Consent to publish required (form)', '§4.1; §7.4 (consent recorded); register-organisation.html:530'],
      [6, '"What gets published?" aside', 'Page strings', 'CMS', WHO_A, L3, TBA, NS, DS('Form Shell: Content Editable (aside content)')],
      [7, 'Update request: registered email, entry kind, consent', 'Asks for a one time link; answers the same way whether or not the address matches', 'DEV', WHO_A + ' (strings)', L3 + ' (labels)', 'Email required', 'Required', '§4.2; update-request.html:531'],
      [8, '"What can be edited" aside', 'Page strings', 'CMS', WHO_A, L3, TBA, NS, DS('Form Shell: Content Editable (aside content)')],
      [9, 'Acknowledgement', 'Message-template text: what happens next; the same wording whether or not the address matches', 'CMS', WHO_A + ' (message templates, §6.5)', L3, TBA, NS, '§4.1 (the submitter is emailed from the message templates); §4.2'],
      [10, 'Edit page: title and notice', 'Strings; the notice that the change is reviewed before it appears', 'CMS', WHO_A, L3, TBA, NS, 'Figure 28; edit.html:714'],
      [11, 'Editable fields: descriptive text, gallery, contact route (entrepreneur); description, public contact route (organisation)', 'The fields of §4.2; saving spends the link and sends the change to the review queue as a profile update', 'HOLDER', WHO_H, L3, 'Link single use, valid 24 hours (§4.2, §7.4)', NS, '§4.2 table; Figure 28; forms.js:31–35; edit.html:497–506, :721'],
    ],
    fixed: ['Three request types only: general inquiry, organisation registration, profile update (§4.1; locked decision 1, compliance-final.md:33).', 'Every form validates in the browser and on the server, is protected by Cloudflare Turnstile and submission limits, and enters the same review queue (§4.1, Figure 8).', 'A one time link is single use, expires after 24 hours and is stored hashed (§4.2, §7.4).'],
    auto: ['On approval: a registration creates a draft organisation entry and notifies the editors; a profile update publishes the accepted fields and tells the holder which were taken; a rejection sends the coordinator\'s reply (§6.7).', 'The edit form in the prototype also offers a contact-directory consent toggle (edit.html:506) that §4.2 does not list: see Needs decision 9.'] },
];

/* ---------- other sections (no screenshot) ---------- */
const ROLES = [
  ['Administrator', 'Yes: manages users, settings and the message templates', 'Yes (manages users, settings, templates)', 'Yes', 'Yes, can also work the queue', 'Individual account'],
  ['Editor', NS, 'Yes, every content type', 'Yes', NS, 'Individual account'],
  ['Contributor', NS, 'Yes, creates and edits', 'No. Sends an entry for review instead', NS, 'Individual account'],
  ['Coordinator', NS, 'No. Cannot open a content type and edit it directly', 'No, except that approving a profile update publishes that change to its entry', 'Yes, works the submissions queue', 'Individual account'],
];
const GLOBAL = [
  ['Three languages, one record', 'Every field a visitor reads shows Arabic, English and Spanish together in the admin interface; an editor works on one entry, not three. Entries may be saved as drafts with incomplete translations. Publishing with a missing translation requires an authorised editor\'s explicit confirmation and uses English as the fallback, provided the English version is complete; missing translations stay flagged in the CMS.', '§6.3, §4.3; prototype: admin-entry.html:83–87'],
  ['Images', 'One landscape image at 3:2 and portraits at 4:5 per entry, at least 2000 px on the long edge. Alt text is written per image in the three languages by the editor. A written consent release is held for every identifiable person. Media is uploaded once and reused across entries, and an image without alt text is not used. Logos come from official files supplied by CIDEAL only.', 'Annex A (photography library); §4.3; §6.2; §9.3'],
  ['Video', 'Embedded from YouTube and never uploaded to the platform. The player loads only when a visitor activates the poster. Captions and a transcript are part of the resource entry. No background music, autoplay audio or self-hosted video.', '§6.6, §7.4; DS · Resource Card: Developer Configuration'],
  ['Price band and accommodation', 'Price band has four levels, shown as symbols rather than amounts. Accommodation is community-based, entrepreneur-run lodging such as a guesthouse or homestay, not a hotel. Price band and accessibility are optional on an entry.', '§6.4; §11.1 #7'],
  ['Text limits', 'The report sets no word or character limit for any field. Every text limit in this guide reads "To be agreed"; no number is proposed here.', 'cms-constraints.xlsx, Read me; Needs decision 1'],
  ['Taxonomies', 'Pillar (six values), category per content type, city (Luxor, Aswan), accessibility features, price band, value chain and audience. CIDEAL staff edit all of them; the values are a starting point rather than a fixed set. Filters on the listings are built from them.', '§6.4; DS · Filter Bar'],
  ['Where used', 'Each entry lists the pages it appears on, so an editor can see what unpublishing it would change. A change published in the CMS appears within five minutes.', '§4.3; §7.2'],
  ['Sample content', 'Prototype and staging content, photographs included, is for demonstration only and is not published live without CIDEAL\'s approval. The home hero collage is labelled as a sample (index.html:590); every video resource uses one sample YouTube ID.', '§6.2; compliance-final.md:172–174'],
];
const SITECONF = [
  ['Header: six items in a fixed order', 'Home, Explore, For Entrepreneurs, For Tourism Stakeholders, About the Project, Contact', 'LOCKED', 'Labels: ' + WHO_A, '§3.2 Figure 4; compliance-final.md:34; index.html:505–511'],
  ['Header: navigation labels', 'Site configuration · the six labels', 'CMS', WHO_A, '§6.2 Site configuration ("the navigation labels"); i18n.js:18–21, :644–651'],
  ['Header: Explore menu children', 'Luxor, Aswan, Destinations, Experiences and Products, Map', 'DEV', WHO_N, '§3.2 Figure 4; compliance-final.md:34'],
  ['Header: language switcher, search, accessibility drawer', 'Three locales with the language in the address; site search; the accessibility drawer with its fixed tiles', 'DEV', WHO_N, '§3.1; §2.1; §9.3; DS · Header, Language Switcher: Developer Configuration'],
  ['Footer: AECID and CIDEAL logos, "supported by"', 'Official files only; on every page', 'LOCKED', WHO_N, '§6.2 (official logo files); DS · Footer: Design System Locked (grid, lotus art, strip)'],
  ['Footer: column headings, links, contact email, social links', 'Site configuration · footer details and the programme email address', 'CMS', WHO_A, '§6.2 Site configuration ("the footer details"); DS · Footer: Content Editable (column headings, links, contact email, partner logos)'],
  ['Footer: privacy notice and accessibility statement links', 'Reached from the footer; the privacy notice text is supplied by CIDEAL', 'LOCKED', 'Text: ' + WHO_E, 'Annex A (privacy notice text); §6.2 Page'],
  ['Site configuration: what is featured on Home', 'Featured destinations, experiences, entrepreneurs in display order; success stories carry their own placement flag', 'CMS', WHO_A, '§6.2; §3.3'],
  ['Site configuration: how long submissions are kept', '24 months by default; an administrator changes the period and deletes submissions individually or in bulk', 'CMS', WHO_A, '§7.4; content.js:50 (retentionMonths)'],
  ['Message templates and response times', 'Every outbound email in the three languages and the response time per request type, from which the queue counts the due date', 'CMS', WHO_A, '§4.1; §6.5; §6.7; content.js:49 (responseDays)'],
];
const HOLDER = [
  ['Entrepreneur', 'The descriptive text, the gallery, the contact route', 'The registered email, the consent to publish, the pillar, the category', 'Link works once and expires 24 hours after it is sent. Saved changes enter the review queue as a profile update; a coordinator compares them against the published entry; approval publishes them; a rejection carries the reason by email'],
  ['Organisation', 'The description, the public contact route', 'The registered email, the consent to publish, the pillar, the category', 'Same as above'],
];
const DECISIONS = [
  ['Text limits (words or characters) per field', 'The report sets none. The design-side workbook cms-constraints.xlsx proposes layout-derived working values; they are not adopted here.', 'CIDEAL and SwiftX'],
  ['Image file size ceiling', 'The report gives ratios (3:2, 4:5) and a minimum of 2000 px on the long edge, but no maximum file size.', 'SwiftX'],
  ['Duration format for experiences', 'The report lists duration as a field without a format.', 'CIDEAL'],
  ['Roles marked "Not stated"', 'Whether editors, contributors or coordinators manage settings or work the queue beyond what §6.5 states is not assumed.', 'CIDEAL'],
  ['Home featured blocks: curation rule', 'The 4-shown / carousel / cap-of-12 / top-up / hide-when-empty rule is stated for the city guide (§3.5). Home\'s featured blocks (§3.3, Figure 5) carry no count or rule in v1.2.', 'CIDEAL and SwiftX'],
  ['Design system vs report: learning path', 'design-system.html "Learning Path · content model" still describes a hero, a facts strip, "Step n of N" labels and an "Other paths" block. The report (Figure 18, §11.1 #4) and the built page have none of these. The page follows the report; the design-system entry needs updating.', 'SwiftX'],
  ['Prototype fields beyond §6.2', 'Experience highlights, "what is included" and languages (experiences.js hl, inc, lang); entrepreneur timeline and impact numbers (entrepreneurs.js journey, process, impact); story placement flags (content.js lead, home). Confirm each as a CMS field or remove it.', 'CIDEAL and SwiftX'],
  ['Learning path steps and related stories', 'The report\'s Learning Path holds ordered resources (§6.2, §11.1 #4). The prototype groups them under titled steps and names related stories per path (resources.js:35–37). Confirm whether step titles and the story relation are CMS fields.', 'CIDEAL and SwiftX'],
  ['Organisation: contact-directory consent', 'The edit form (edit.html:506) and the registration form (register-organisation.html:526) carry a consent to appear in a contact directory. §4.2 lists only the description and the public contact route as holder edits, and the directory request type was removed (locked decision 1).', 'CIDEAL and SwiftX'],
  ['Stakeholders page layout', 'Figure 19 places the list beside the map; the built page shows the grid under the filters and the map last at the client\'s request (compliance-final.md:171).', 'CIDEAL'],
  ['Newsletter pages', 'The signup is a SwiftX addition (§2.1). The confirmation and unsubscribe pages exist in the repo (newsletter-confirm.html, newsletter-unsubscribe.html) and are reached only from the emails; the report does not describe them.', 'CIDEAL'],
  ['Pending assets, not decisions', 'YouTube IDs for every video resource; the photography library with consent releases; the MapTiler key; the privacy notice text (Annex A; compliance-final.md:170–174).', 'CIDEAL'],
];

/* ---------- screenshots with marker overlays ---------- */
const OVERLAY = (marks) => {
  document.querySelectorAll('.cms-guide-overlay').forEach(x => x.remove());
  const layer = document.createElement('div'); layer.className = 'cms-guide-overlay';
  const H = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  layer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:' + H + 'px;pointer-events:none;z-index:2147483000';
  const missing = [];
  for (const [sel, n] of marks) {
    let el = null; try { el = document.querySelector(sel); } catch (e) { el = null; }
    if (!el) { missing.push(sel); continue; }
    const r = el.getBoundingClientRect(); const top = r.top + scrollY, left = r.left + scrollX;
    const box = document.createElement('div'); box.style.cssText = 'position:absolute;top:' + (top - 4) + 'px;left:' + (left - 4) + 'px;width:' + (r.width + 8) + 'px;height:' + (r.height + 8) + 'px;border:3px solid #a53e1a;border-radius:10px;box-shadow:0 0 0 2px #fff;';
    const tag = document.createElement('div'); tag.textContent = String(n); tag.style.cssText = 'position:absolute;top:' + (top - 20) + 'px;left:' + (left - 20) + 'px;min-width:40px;height:40px;padding:0 8px;border-radius:999px;background:#a53e1a;color:#fff;font:700 22px/40px Arial,sans-serif;text-align:center;box-shadow:0 0 0 3px #fff,0 4px 12px rgba(0,0,0,.35);';
    layer.appendChild(box); layer.appendChild(tag);
  }
  document.body.appendChild(layer); return missing;
};
const settle = async (page) => {
  /* the city guide locks the page until the hero intro has been scrolled through with the wheel: drive it like a reader would */
  for (let i = 0; i < 30 && await page.evaluate(() => document.body.classList.contains('is-locked')); i++) { await page.mouse.move(720, 500); await page.mouse.wheel({ deltaY: 500 }); await new Promise(r => setTimeout(r, 160)); }
  await page.evaluate(async () => { const H = () => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight); for (let y = 0; y < H(); y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } scrollTo(0, H()); await new Promise(r => setTimeout(r, 300)); scrollTo(0, 0); await new Promise(r => setTimeout(r, 400)); });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  /* the city guide reveals its content block only after the hero scroll-expand; show it for the capture */
  await page.evaluate(() => { document.body.classList.remove('is-locked'); document.querySelectorAll('.xc').forEach(x => x.classList.add('is-in')); const st = document.createElement('style'); st.className = 'cms-guide-overlay'; st.textContent = '.xc{opacity:1!important;transform:none!important}body.is-locked{overflow:visible!important}'; document.head.appendChild(st); });
  await new Promise(r => setTimeout(r, 900));
};
const toWebp = async (buf, width) => 'data:image/webp;base64,' + (await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 72 }).toBuffer()).toString('base64');

async function shoot(browser, shot, missingAll) {
  const page = await browser.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const mobile = !!shot.mobile; await page.setViewport({ width: mobile ? 390 : 1440, height: mobile ? 844 : 900, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  let url = BASE + shot.url;
  if (shot.token) { await page.goto(BASE + 'en/update-request.html', { waitUntil: 'networkidle2', timeout: 60000 }); const tok = await page.evaluate(([k, s]) => FORMS.tokens.issue(k, s).token, shot.token); url += '?token=' + tok; }
  try { await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); } catch (e) { await new Promise(r => setTimeout(r, 1500)); }
  await settle(page);
  const out = { url: shot.url, mobile, errors, caption: shot.caption || '', missing: [] };
  /* a page whose hero is sized from the viewport (the city guide's scroll-expand hero) is captured in 900 px slices from a fixed viewport and stitched, so the resize a full-page capture implies never reaches the page */
  const stitched = async () => {
    const W = 1440, VH = 900; const H = await page.evaluate(() => document.documentElement.scrollHeight); const slices = [];
    for (let y = 0; ; y += VH) { const sy = Math.min(y, H - VH); await page.evaluate(sy => { scrollTo(0, sy); const nav = document.querySelector('header.nav'); if (nav) nav.style.visibility = sy > 0 ? 'hidden' : ''; }, sy); await new Promise(r => setTimeout(r, 350)); slices.push({ top: sy, buf: await page.screenshot({ captureBeyondViewport: false }) }); if (sy >= H - VH) break; }
    await page.evaluate(() => { scrollTo(0, 0); const nav = document.querySelector('header.nav'); if (nav) nav.style.visibility = ''; });
    const buf = await sharp({ create: { width: W, height: H, channels: 3, background: '#fbf7ef' } }).composite(slices.map(s => ({ input: s.buf, top: s.top, left: 0 }))).png().toBuffer();
    return { buf, h: H };
  };
  const take = async (marks, width) => { const miss = marks && marks.length ? await page.evaluate(OVERLAY, marks) : []; out.missing.push(...miss); let buf, h; if (shot.stitch) ({ buf, h } = await stitched()); else { buf = await page.screenshot({ fullPage: true }); h = await page.evaluate(() => document.documentElement.scrollHeight); } await page.evaluate(() => document.querySelectorAll('.cms-guide-overlay').forEach(x => x.remove())); return { src: await toWebp(buf, width), w: mobile ? 390 : 1440, h }; };
  Object.assign(out, await take(shot.markers, mobile ? 390 : 1100));
  if (shot.submit) {
    for (const [sel, v] of Object.entries(shot.submit.fill || {})) await page.type(sel, v);
    for (const [sel, v] of Object.entries(shot.submit.select || {})) await page.select(sel, v);
    for (const sel of shot.submit.check || []) await page.click(sel);
    await page.click('#frm [type="submit"], #frm button:not([type="button"])'); await new Promise(r => setTimeout(r, 1200)); await settle(page);
    out.after = Object.assign({ caption: shot.afterCaption || '' }, await take(shot.afterMarkers, 1100));
  }
  if (out.missing.length) missingAll.push(shot.url + ': ' + out.missing.join(', '));
  await page.close(); return out;
}

/* ---------- html ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const badge = k => { const [cls, label] = ST[k]; return '<span class="st st-' + cls + '"><i aria-hidden="true"></i>' + esc(label) + '</span>'; };
const cell = s => esc(s).replace(/§(\d+(\.\d+)?)/g, '§$1');
const rowsTable = rows => '<table class="rows"><thead><tr><th class="n">#</th><th>Element or section</th><th>Content type · field</th><th>Status</th><th>Who can edit it</th><th>Languages</th><th>Limit or format rule</th><th>Required</th><th>Source</th></tr></thead><tbody>' + rows.map(r => '<tr><td class="n">' + esc(r[0]) + '</td><td>' + cell(r[1]) + '</td><td>' + cell(r[2]) + '</td><td>' + badge(r[3]) + '</td><td>' + cell(r[4]) + '</td><td>' + cell(r[5]) + '</td><td>' + cell(r[6]) + '</td><td>' + cell(r[7]) + '</td><td class="src">' + cell(r[8]) + '</td></tr>').join('') + '</tbody></table>';
const figure = (s, n) => '<figure class="shot' + (s.mobile ? ' shot--mobile' : '') + '"><img src="' + s.src + '" width="' + s.w + '" height="' + s.h + '" alt="' + esc((s.mobile ? 'Mobile (390 px) screenshot of ' : 'Desktop screenshot of ') + s.url + (s.mobile ? '' : ' with numbered markers')) + '" loading="lazy"><figcaption>' + (s.mobile ? '390 px' : '1440 px') + ' · <code>' + esc(s.url) + '</code>' + (s.caption ? ' · ' + esc(s.caption) : '') + '</figcaption></figure>';

function pageSection(p, shots) {
  const markersUsed = new Set(); shots.forEach(s => { (s.markers || []).forEach(([, n]) => markersUsed.add(n)); if (s.after) (s.afterMarkers || []).forEach(([, n]) => markersUsed.add(n)); });
  const rowNums = new Set(p.rows.map(r => r[0]).filter(n => n !== '—'));
  const onlyRows = [...rowNums].filter(n => !markersUsed.has(n)), onlyMarks = [...markersUsed].filter(n => !rowNums.has(n));
  if (onlyRows.length || onlyMarks.length) throw new Error(p.id + ': marker / table mismatch. Rows without marker: ' + onlyRows.join(',') + '; markers without row: ' + onlyMarks.join(','));
  const figs = shots.map(s => figure(s) + (s.after ? figure(Object.assign({ url: s.url, mobile: false }, s.after)) : '')).join('');
  return '<section class="pg" id="p-' + p.id + '"><h2>' + esc(p.title) + '</h2><p class="meta">Template: <code>' + esc(p.file) + '</code> · ' + cell(p.fig) + '</p><div class="pg-body"><div class="shots">' + figs + '</div><div class="tbl">' + rowsTable(p.rows) + '</div></div>' +
    '<div class="two"><div><h3>What an editor cannot change on this page</h3><ul>' + p.fixed.map(x => '<li>' + cell(x) + '</li>').join('') + '</ul></div><div><h3>Applied by the CMS, not an editor\'s choice</h3><ul>' + p.auto.map(x => '<li>' + cell(x) + '</li>').join('') + '</ul></div></div></section>';
}

const CSS = `
@font-face{font-family:"IBM Plex Sans";font-weight:400;src:url("fonts/sub/ibm-plex-sans-400.woff2") format("woff2");font-display:swap}
@font-face{font-family:"IBM Plex Sans";font-weight:600;src:url("fonts/sub/ibm-plex-sans-600.woff2") format("woff2");font-display:swap}
@font-face{font-family:"IBM Plex Sans";font-weight:700;src:url("fonts/sub/ibm-plex-sans-700.woff2") format("woff2");font-display:swap}
@font-face{font-family:"IBM Plex Serif";font-weight:700;src:url("fonts/sub/ibm-plex-serif-700.woff2") format("woff2");font-display:swap}
:root{--paper:#fbf7ef;--ink:#0b2230;--rust:#a53e1a;--rust-deep:#8a3213;--muted:#57534e;--body:#24312f;--hair:#e6e2d8;--card:#fff;--olive:#5c6b43;--nile:#2b4d60;--sand:#cdb48a;--s-1:8px;--s-2:12px;--s-3:16px;--s-4:24px;--s-5:32px;--s-6:48px;--radius-card:18px;--radius-btn:8px}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:var(--paper);color:var(--body);font:15px/1.6 "IBM Plex Sans",system-ui,Segoe UI,Arial,sans-serif}
h1,h2,h3{font-family:"IBM Plex Serif",Georgia,serif;color:var(--ink);letter-spacing:-.02em;line-height:1.2}
h1{font-size:clamp(28px,3vw,40px);margin:0 0 var(--s-2)}h2{font-size:clamp(22px,2.2vw,28px);margin:0 0 var(--s-2);padding-top:var(--s-2)}h3{font-size:17px;margin:var(--s-3) 0 var(--s-1)}
a{color:var(--rust)}code{font:13px/1.4 ui-monospace,Consolas,monospace;background:#f1e9d9;padding:1px 5px;border-radius:5px}
.layout{display:grid;grid-template-columns:minmax(0,1fr);gap:0}.layout>*{min-width:0}
.toc{background:#fff;border-bottom:1px solid var(--hair);padding:var(--s-3);overflow:hidden}
@media(max-width:719px){.toc ol{columns:1}}
.toc h2{font-size:15px;margin:0 0 var(--s-1);padding:0}.toc ol{margin:0;padding-inline-start:20px;columns:2;column-gap:var(--s-4);font-size:13.5px}.toc li{break-inside:avoid;margin:2px 0}.toc a{color:var(--ink);text-decoration:none}.toc a:hover{color:var(--rust);text-decoration:underline}.toc a:focus-visible{outline:3px solid var(--ink);outline-offset:2px}
main{padding:var(--s-3) var(--s-3) var(--s-6);max-width:1600px;margin-inline:auto;min-width:0}
.cover{background:var(--card);border:1px solid var(--hair);border-radius:var(--radius-card);padding:var(--s-4);box-shadow:0 1px 2px rgba(43,29,14,.06),0 18px 40px -28px rgba(43,29,14,.4)}
.cover .kicker{font-size:12.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--rust)}
.cover p{max-width:80ch}
.legend{display:grid;gap:var(--s-2);margin:var(--s-3) 0 0;padding:0;list-style:none}@media(min-width:720px){.legend{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(min-width:1200px){.legend{grid-template-columns:repeat(3,minmax(0,1fr))}}
.legend li{display:flex;flex-direction:column;gap:6px;align-items:flex-start;padding:10px 12px;border:1px solid var(--hair);border-radius:12px;background:#fff}.legend li p{margin:2px 0 0;font-size:13px;color:var(--muted)}
.st{display:inline-flex;align-items:center;gap:6px;padding:2px 9px 2px 6px;border-radius:999px;font-size:12.5px;font-weight:600;white-space:nowrap;border:1px solid transparent;line-height:1.5}.st i{width:10px;height:10px;border-radius:50%;flex:none;border:1px solid rgba(0,0,0,.25)}
.st-cms{background:#e3ebd3;color:#2f4118;border-color:#b9c99a}.st-cms i{background:#5c6b43}
.st-holder{background:#d6e6ee;color:#1e3f4e;border-color:#a9c6d4}.st-holder i{background:#2b4d60}
.st-locked{background:#f1e4d2;color:#5a3a1a;border-color:#dcc49a}.st-locked i{background:#cdb48a}
.st-dev{background:#e6e3d6;color:#2b2b2b;border-color:#c9c4b4}.st-dev i{background:#57534e}
.st-auto{background:#f8e0d6;color:#8a3213;border-color:#e8b7a4}.st-auto i{background:#a53e1a}
.st-cideal{background:#ffffff;color:#0b2230;border-color:#0b2230}.st-cideal i{background:#0b2230}
section.sec,section.pg{margin-top:var(--s-5);scroll-margin-top:var(--s-3)}
.meta{color:var(--muted);font-size:13.5px;margin:0 0 var(--s-3)}
table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--hair);border-radius:12px;overflow:hidden;font-size:13px;line-height:1.45}
th,td{padding:8px 9px;border-bottom:1px solid var(--hair);vertical-align:top;text-align:left}th{background:#f1e9d9;color:var(--ink);font-weight:700;font-size:12.5px}tr:last-child td{border-bottom:0}
td.n,th.n{width:34px;text-align:center;font-weight:700;color:var(--rust)}td.src{color:var(--muted);font-size:12px}
.tbl{overflow-x:auto;min-width:0}.pg-body>*,.two>*{min-width:0}.rows{min-width:960px}.sec table{table-layout:fixed}td,th{overflow-wrap:break-word}.sec td,.sec th{overflow-wrap:anywhere}td.n,th.n{white-space:nowrap;overflow-wrap:normal}.rows td:nth-child(2){min-width:130px}.sec .st{white-space:normal}
.pg-body{display:grid;gap:var(--s-3);align-items:start}@media(min-width:1100px){.pg-body{grid-template-columns:minmax(340px,38%) minmax(0,1fr)}}
.shots{display:grid;gap:var(--s-3)}.shot{margin:0;background:#fff;border:1px solid var(--hair);border-radius:12px;padding:8px}.shot img{display:block;width:100%;height:auto;border-radius:6px}.shot--mobile{max-width:300px}.shot figcaption{font-size:12px;color:var(--muted);margin-top:6px}
.two{display:grid;gap:var(--s-3);margin-top:var(--s-3)}@media(min-width:900px){.two{grid-template-columns:1fr 1fr}}.two ul{margin:0;padding-inline-start:18px}.two li{margin:4px 0}
.note{background:#fff;border:1px solid var(--hair);border-left:4px solid var(--rust);border-radius:8px;padding:10px 14px;margin:var(--s-3) 0;font-size:13.5px}
footer.end{margin-top:var(--s-6);padding-top:var(--s-3);border-top:1px solid var(--hair);color:var(--muted);font-size:13px}
@media(min-width:1024px){.layout{grid-template-columns:260px minmax(0,1fr)}.toc{position:sticky;top:0;height:100vh;overflow:auto;border-bottom:0;border-right:1px solid var(--hair)}.toc ol{columns:1}}
@media print{@page{size:A4 landscape;margin:10mm}html{scroll-behavior:auto}body{background:#fff;font-size:10.5pt}.layout{display:block}.toc{display:none}main{max-width:none;padding:0}.cover{box-shadow:none}
 section.pg{break-before:page}section.sec{break-before:page}h2{break-after:avoid}table,figure,.two>div,.legend li{break-inside:avoid}tr{break-inside:avoid}thead{display:table-header-group}
 .pg-body{display:block}.shots{display:block}.shot{margin:0 0 6mm;padding:0;border:0}.shot img{max-height:165mm;width:auto;max-width:100%}.shot--mobile img{max-height:120mm}.tbl{overflow:visible}.rows{min-width:0;font-size:8.5pt}td,th{padding:4px 5px}.st{font-size:8pt}a{color:inherit;text-decoration:none}}
`;

/* ---------- build ---------- */
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--font-render-hinting=none'] });
const missingAll = [], consoleErrors = [];
const built = [];
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7);
for (const p of PAGES) {
  if (ONLY && p.id !== ONLY) continue;
  const shots = [];
  for (const s of p.shots) { const r = await shoot(browser, s, missingAll); if (r.errors.length) consoleErrors.push(s.url + ': ' + r.errors.join(' | ')); shots.push(Object.assign({ markers: s.markers, afterMarkers: s.afterMarkers }, r)); }
  built.push(pageSection(p, shots)); console.log('shot', p.id, shots.map(s => s.h + (s.mobile ? 'm' : '')).join(' '));
}
await browser.close();
if (missingAll.length) { console.error('MISSING SELECTORS\n' + missingAll.join('\n')); process.exit(1); }
if (consoleErrors.length) { console.error('CONSOLE ERRORS\n' + consoleErrors.join('\n')); process.exit(1); }

const tocItems = [['#how', 'How to read this guide'], ['#roles', 'Roles'], ['#rules', 'Global rules'], ...PAGES.map(p => ['#p-' + p.id, p.title]), ['#siteconf', 'Header, footer and Site configuration'], ['#holder', 'Holder edits (§4.2)'], ['#decisions', 'Needs decision']];
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>CMS Editing Guide — Discover Upper Egypt</title>
<meta name="description" content="Internal handover document: which sections of each page template the CMS can edit, by whom, and which are fixed. Generated from the repo and Inception Report v1.2.">
<style>${CSS}</style>
</head>
<body>
<div class="layout">
<nav class="toc" aria-label="Contents"><h2>Contents</h2><ol>${tocItems.map(([h, t]) => '<li><a href="' + h + '">' + esc(t) + '</a></li>').join('')}</ol></nav>
<main>
<header class="cover" id="top">
<p class="kicker">Discover Upper Egypt · internal handover document · ${TODAY}</p>
<h1>CMS Editing Guide</h1>
<p>For the developer and for CIDEAL staff. Page by page, which sections the content management system can edit, who edits them, in which languages and under which rule, and which sections are fixed. Every row names its source: a section of the Inception Report v1.2 (§), a design-system component label from <code>design-system.html</code> (DS · component: label), or a file and line in the repository. Nothing here is added beyond those sources; what they leave open is listed under <a href="#decisions">Needs decision</a>.</p>
<p>Screenshots show the English pages of the current build at 1440 px (and 390 px where the layout changes), taken against <code>node serve.mjs</code> with temporary marker overlays; the site files were not edited. Regenerate with <code>node build-cms-guide.mjs</code>. The workbook <code>cms-constraints.xlsx</code> (sheets: content types, fields and limits, taxonomies, roles, holder edits, review queue, editing rules, open items) is the base this guide stays consistent with.</p>
<section class="sec" id="how" style="margin-top:var(--s-3)">
<h2 style="font-size:19px">How to read this guide</h2>
<p>Each page section has a screenshot with numbered markers and a table keyed to those numbers. The status column uses the six labels below; each has a colour and a text label, never the colour alone. "To be agreed" in the limit column means the report sets no text limit for that field.</p>
<ul class="legend">
<li>${badge('CMS')}<p>CIDEAL staff edit it in the CMS. The "who" column names the role (§6.5): editors and administrators publish, contributors draft.</p></li>
<li>${badge('HOLDER')}<p>The entrepreneur or organisation changes it through the one time link; a coordinator approves before it appears (§4.2).</p></li>
<li>${badge('LOCKED')}<p>Fixed by the design system: layout, colours, type, component shape (design-system.html "Design System Locked").</p></li>
<li>${badge('DEV')}<p>Fixed by configuration or code: rules, behaviour, routes (design-system.html "Developer Configuration").</p></li>
<li>${badge('AUTO')}<p>Produced by the platform from the entries: counts, dates, related items, derived links.</p></li>
<li>${badge('CIDEAL')}<p>Fields CIDEAL holds and changes on request: the registered email, the consent to publish, the pillar, the category (§4.2).</p></li>
</ul>
</section>
</header>

<section class="sec" id="roles">
<h2>Roles</h2>
<p class="meta">Four roles, individual accounts, no shared login; CIDEAL names at least two people who can work the queue (§6.5). Where the report is silent the cell says "Not stated".</p>
<div class="tbl"><table><thead><tr><th>Role (§6.5)</th><th>Manages users, settings, templates</th><th>Creates and edits content types</th><th>Publishes</th><th>Submissions queue</th><th>Account</th></tr></thead><tbody>${ROLES.map(r => '<tr>' + r.map((c, i) => '<td' + (i === 0 ? ' style="font-weight:700;color:var(--ink)"' : '') + '>' + cell(c) + '</td>').join('') + '</tr>').join('')}</tbody></table></div>
<p class="note">Publishing with a missing translation requires an authorised editor's explicit confirmation (§4.3, §6.3). The prototype CMS mock enforces the same gate: a contributor or coordinator cannot publish, and a missing Spanish or Arabic translation opens a confirmation before publishing (admin-entry.html:83–87).</p>
</section>

<section class="sec" id="rules">
<h2>Global rules</h2>
<p class="meta">Stated once here and not repeated per page.</p>
<div class="tbl"><table><thead><tr><th style="width:18%">Rule</th><th>What it says</th><th style="width:22%">Source</th></tr></thead><tbody>${GLOBAL.map(r => '<tr><td style="font-weight:700;color:var(--ink)">' + cell(r[0]) + '</td><td>' + cell(r[1]) + '</td><td class="src">' + cell(r[2]) + '</td></tr>').join('')}</tbody></table></div>
</section>

${built.join('\n')}

<section class="sec" id="siteconf">
<h2>Header, footer and Site configuration</h2>
<p class="meta">What an administrator can edit and what stays fixed. Home markers 9 and 10 show the header and footer.</p>
<div class="tbl"><table><thead><tr><th>Element</th><th>What it is</th><th>Status</th><th>Who</th><th>Source</th></tr></thead><tbody>${SITECONF.map(r => '<tr><td style="font-weight:700;color:var(--ink)">' + cell(r[0]) + '</td><td>' + cell(r[1]) + '</td><td>' + badge(r[2]) + '</td><td>' + cell(r[3]) + '</td><td class="src">' + cell(r[4]) + '</td></tr>').join('')}</tbody></table></div>
</section>

<section class="sec" id="holder">
<h2>Holder edits (§4.2)</h2>
<p class="meta">What an entrepreneur or an organisation can change through the one time link, and what only CIDEAL changes. The link is emailed to the registered address, works once, expires after 24 hours and is stored hashed (§4.2, §7.4).</p>
<div class="tbl"><table><thead><tr><th>Holder</th><th>Can change</th><th>CIDEAL changes on request</th><th>What happens after saving</th></tr></thead><tbody>${HOLDER.map(r => '<tr>' + r.map((c, i) => '<td' + (i === 0 ? ' style="font-weight:700;color:var(--ink)"' : '') + '>' + cell(c) + '</td>').join('') + '</tr>').join('')}</tbody></table></div>
</section>

<section class="sec" id="decisions">
<h2>Needs decision</h2>
<p class="meta">Open items the report does not settle, and conflicts between the report and the design system. Nothing here is decided in this guide.</p>
<div class="tbl"><table><thead><tr><th class="n">#</th><th style="width:24%">Item</th><th>Why it is open</th><th style="width:16%">Owner</th></tr></thead><tbody>${DECISIONS.map((r, i) => '<tr><td class="n">' + (i + 1) + '</td><td style="font-weight:700;color:var(--ink)">' + cell(r[0]) + '</td><td>' + cell(r[1]) + '</td><td>' + cell(r[2]) + '</td></tr>').join('')}</tbody></table></div>
</section>

<footer class="end">Generated ${TODAY} by <code>build-cms-guide.mjs</code> from the repository and Inception Report v1.2. Internal document: not part of the public site, not indexed, not linked from any page.</footer>
</main>
</div>
</body>
</html>
`;
fs.writeFileSync(OUT, html);
console.log('wrote', OUT, (fs.statSync(OUT).size / 1048576).toFixed(2) + ' MB', PAGES.length + ' page sections');
