/* search-suggest.js — live suggestions under the header search field (Inception Report §2.1).
   The four data files load on first use only, so the critical path of every page stays unchanged.
   Arrow keys move through the list, Enter opens the selected entry (or the results page), Esc closes. */
(() => {
  const input = document.getElementById('searchInput'), form = document.getElementById('searchForm');
  if (!input || !form) return;
  const box = document.createElement('div');
  box.id = 'searchSuggest'; box.className = 'menu menu--search'; box.setAttribute('role', 'listbox'); box.setAttribute('aria-label', 'اقتراحات البحث');
  form.appendChild(box);
  input.setAttribute('autocomplete', 'off'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-controls', 'searchSuggest'); input.setAttribute('aria-expanded', 'false');

  const t = k => (window.I18N ? I18N.t(k) : k);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = x => String(x || '').toLowerCase().replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  const ico = (n, s, c) => (window.ICON ? ICON(n, s, c) : '');
  const CITY = { luxor: { ar: 'الأقصر', en: 'Luxor', es: 'Luxor' }, aswan: { ar: 'أسوان', en: 'Aswan', es: 'Asuán' } };
  const cityOf = c => (CITY[c] || {})[document.documentElement.lang] || (CITY[c] || {}).ar || '';

  const FILES = { DESTINATIONS: 'destinations.js', EXPERIENCES: 'experiences.js', ENTREPRENEURS: 'entrepreneurs.js', CONTENT: 'content.js' };
  let loading = null;
  const load = () => loading || (loading = Promise.all(Object.keys(FILES).map(g => new Promise(res => {
    if (window[g]) return res();
    const s = document.createElement('script'); s.src = FILES[g]; s.onload = res; s.onerror = res; document.head.appendChild(s);
  }))));

  const GROUPS = [
    { label: 'الوجهات', icon: 'map-pin', items: () => (window.DESTINATIONS ? DESTINATIONS.list : []), name: d => d.n, hay: d => [d.n, d.s, d.area], href: d => 'destination.html?city=' + d.city + '&slug=' + d.slug, city: d => d.city },
    { label: 'التجارب والمنتجات', icon: 'compass', items: () => (window.EXPERIENCES ? EXPERIENCES.list : []), name: e => e.n, hay: e => [e.n, e.s], href: e => 'experience.html?city=' + e.city + '&slug=' + e.slug, city: e => e.city },
    { label: 'رواد الأعمال', icon: 'hand', items: () => (window.ENTREPRENEURS ? ENTREPRENEURS.list.filter(e => e.consent !== false) : []), name: e => e.name, hay: e => [e.name, e.biz], href: e => 'entrepreneur.html?slug=' + e.slug, city: e => e.city },
    { label: 'الجهات السياحية', icon: 'buildings', items: () => (window.CONTENT && CONTENT.organisations) || [], name: o => o.n, hay: o => [o.n], href: o => 'organisation.html?slug=' + o.slug, city: o => o.city },
  ];
  const MAX = 7;
  const find = q => {
    const nq = norm(q), out = [];
    GROUPS.forEach(g => g.items().forEach(x => {
      const n = norm(g.name(x)), nt = norm(t(g.name(x)));
      let score = 0;
      if (n.startsWith(nq) || nt.startsWith(nq)) score = 3;
      else if (n.includes(nq) || nt.includes(nq)) score = 2;
      else if (g.hay(x).some(v => norm(v).includes(nq) || norm(t(v)).includes(nq))) score = 1;
      if (score) out.push({ g, x, score });
    }));
    return out.sort((a, b) => b.score - a.score).slice(0, MAX);
  };

  let open = false, active = -1, seq = 0;
  const show = (on) => { open = on; box.classList.toggle('open', on); input.setAttribute('aria-expanded', on); if (!on) { active = -1; input.removeAttribute('aria-activedescendant'); } };
  const items = () => Array.from(box.querySelectorAll('[role="option"]'));
  const setActive = i => {
    const list = items(); if (!list.length) return;
    active = (i + list.length) % list.length;
    list.forEach((el, k) => el.setAttribute('aria-selected', k === active));
    input.setAttribute('aria-activedescendant', list[active].id);
  };
  const render = q => {
    const hits = find(q);
    const rows = hits.map((h, i) => '<a class="ss-item" role="option" id="ss-' + i + '" aria-selected="false" href="' + esc(h.g.href(h.x)) + '">' +
      '<span class="ss-ico">' + ico(h.g.icon, 18) + '</span><span class="ss-txt"><span class="ss-n">' + esc(t(h.g.name(h.x))) + '</span>' +
      '<span class="ss-m">' + esc(t(h.g.label)) + (h.g.city(h.x) ? ' · ' + esc(cityOf(h.g.city(h.x))) : '') + '</span></span></a>').join('');
    const all = '<a class="ss-item ss-all" role="option" id="ss-all" aria-selected="false" href="search.html?q=' + encodeURIComponent(q) + '">' +
      '<span class="ss-ico">' + ico('magnifying-glass', 18) + '</span><span class="ss-txt"><span class="ss-n">' + esc(t(hits.length ? 'كل النتائج' : 'لا توجد نتائج مطابقة')) + ' «' + esc(q) + '»</span></span></a>';
    box.innerHTML = rows + all;
    show(true);
  };
  const update = () => {
    const q = input.value.trim(), my = ++seq;
    if (q.length < 2) { show(false); return; }
    load().then(() => { if (my === seq && input.value.trim() === q) render(q); });
  };
  input.addEventListener('input', update);
  input.addEventListener('focus', () => { load(); if (input.value.trim().length >= 2) update(); });
  /* capture phase on the form runs before the page's own Enter handler on the field */
  form.addEventListener('keydown', e => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); e.stopPropagation(); location.href = LURL(items()[active].getAttribute('href')); }
    else if (e.key === 'Escape') show(false);
  }, true);
  box.addEventListener('pointerdown', e => e.preventDefault()); /* keep focus in the field while clicking a row */
  box.addEventListener('pointermove', e => { const a = e.target.closest('[role="option"]'); if (a) setActive(items().indexOf(a)); });
  document.addEventListener('click', e => { if (!form.contains(e.target)) show(false); });
  document.addEventListener('i18n:change', () => { if (open) render(input.value.trim()); });
})();
