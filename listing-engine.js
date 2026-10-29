/* One listing engine for every filtered list: chips (one group), advanced checkbox groups, search, count, URL state. */
window.LISTING = (() => {
  const $ = id => document.getElementById(id);
  function init(cfg) {
    const { t, esc, crumb } = EX;
    const q = new URLSearchParams(location.search);
    const F = { q: q.get('q') || '', chip: cfg.chips && cfg.chips.includes(q.get(cfg.chipParam)) ? q.get(cfg.chipParam) : 'all' };
    (cfg.groups || []).forEach(g => { F[g] = new Set((q.get(g) || '').split(',').filter(Boolean)); });
    let page = Math.max(1, +q.get('page') || 1), sig = '';
    const sigOf = () => JSON.stringify([F.chip, F.q, (cfg.groups || []).map(g => [...F[g]])]);
    if (cfg.hero !== false) (() => {
      const xh = $('xh'), nav = document.querySelector('.nav-bar'); if (!xh) return;
      const size = () => { const mobile = innerWidth < 768, vh = innerHeight; const navB = nav ? nav.getBoundingClientRect().bottom : 0; const w = Math.min(mobile ? 950 : 1550, innerWidth * 0.95); const h = Math.min(mobile ? 600 : 800, vh * 0.85, vh - navB - 100); const top = Math.max((vh - h) / 2, navB + 80); xh.style.setProperty('--xh-w', w + 'px'); xh.style.setProperty('--xh-h', h + 'px'); xh.style.setProperty('--xh-top', top + 'px'); };
      size(); addEventListener('resize', size); addEventListener('load', size);
    })();
    const match = x => (F.chip === 'all' || [].concat(cfg.chipOf(x)).includes(F.chip)) && (!F.q || cfg.hay(x).toLowerCase().includes(F.q.toLowerCase())) && (cfg.groups || []).every(g => !F[g].size || cfg.groupOf(x, g).some(v => F[g].has(v)));
    function url() { const u = new URLSearchParams(); if (F.chip !== 'all') u.set(cfg.chipParam, F.chip); if (F.q) u.set('q', F.q); (cfg.groups || []).forEach(g => { if (F[g].size) u.set(g, [...F[g]].join(',')); }); if (cfg.pageSize && page > 1) u.set('page', page); history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u.toString() : '')); }
    function head() { if (cfg.crumb) $('exCrumb').innerHTML = crumb(cfg.crumb()); document.title = cfg.title() + ' — ' + t('صعيد مصر'); if (cfg.onHead) cfg.onHead(); }
    function render() {
      const shown = cfg.items().filter(match).sort(cfg.sort || (() => 0));
      const now = sigOf(); if (sig && now !== sig) page = 1; sig = now;
      const ps = cfg.pageSize, pages = ps ? Math.max(1, Math.ceil(shown.length / ps)) : 1; page = Math.min(page, pages);
      $('exGrid').innerHTML = (ps ? shown.slice((page - 1) * ps, page * ps) : shown).map(cfg.card).join('');
      pager(pages);
      $('exCount').textContent = cfg.count(shown.length);
      $('exEmpty').hidden = shown.length > 0;
      const n = (cfg.groups || []).reduce((a, g) => a + F[g].size, 0); if ($('exAdvN')) { $('exAdvN').hidden = !n; $('exAdvN').textContent = n; }
      url(); if (cfg.onRender) cfg.onRender(shown);
    }
    /* pager: previous, numbered pages, next; a page change scrolls back to the top of the results */
    const goPage = p => { page = p; render(); const top = ($('exResultsH') || $('exGrid')).getBoundingClientRect().top + scrollY - 140; scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' }); };
    function pager(pages) { const el = $('exPager'); if (!el) return; el.hidden = pages < 2; if (pages < 2) { el.innerHTML = ''; return; } const AR = '<svg class="ic" width="18" height="18" viewBox="0 0 256 256" aria-hidden="true" focusable="false" fill="currentColor"><path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"/></svg>'; let h = '<button type="button" class="ex-page ex-page--prev" data-p="' + (page - 1) + '" aria-label="' + esc(t('السابق')) + '"' + (page === 1 ? ' disabled' : '') + '>' + AR + '</button>'; for (let i = 1; i <= pages; i++) h += '<button type="button" class="ex-page" data-p="' + i + '" aria-label="' + esc(t('الصفحة')) + ' ' + i + '"' + (i === page ? ' aria-current="page"' : '') + '>' + i + '</button>'; h += '<button type="button" class="ex-page ex-page--next" data-p="' + (page + 1) + '" aria-label="' + esc(t('التالي')) + '"' + (page === pages ? ' disabled' : '') + '>' + AR + '</button>'; el.innerHTML = h; }
    if ($('exPager')) $('exPager').addEventListener('click', e => { const b = e.target.closest('.ex-page'); if (b && !b.disabled) goPage(+b.dataset.p); });
    $('exGrid').addEventListener('click', e => { const c = e.target.closest('[data-href]'); if (!c || e.target.closest('a,button')) return; location.href = (window.LURL || (u => u))(c.dataset.href); });
    const chips = [...document.querySelectorAll('.mp-chip[data-cat]')];
    const syncChips = () => chips.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.cat === F.chip)));
    chips.forEach(c => c.addEventListener('click', () => { F.chip = c.dataset.cat; syncChips(); render(); }));
    if ($('exQ')) { $('exQ').value = F.q; let qt = 0; $('exQ').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { F.q = e.target.value.trim(); render(); }, 160); }); }
    document.querySelectorAll('#exAdv input').forEach(i => { i.checked = F[i.dataset.f].has(i.value); i.addEventListener('change', () => { const s = F[i.dataset.f]; i.checked ? s.add(i.value) : s.delete(i.value); render(); }); });
    if ($('exAdvBtn')) $('exAdvBtn').addEventListener('click', () => { const open = $('exAdv').hidden; $('exAdv').hidden = !open; $('exAdvBtn').setAttribute('aria-expanded', String(open)); });
    if ($('exClear')) $('exClear').addEventListener('click', () => { F.q = ''; F.chip = 'all'; (cfg.groups || []).forEach(g => F[g].clear()); if ($('exQ')) $('exQ').value = ''; document.querySelectorAll('#exAdv input').forEach(i => i.checked = false); syncChips(); render(); });
    /* only offer filter values that published entries carry */
    document.querySelectorAll('#exAdv fieldset').forEach(f => { let any = false; f.querySelectorAll('label').forEach(l => { const v = l.querySelector('input').value; const has = cfg.items().some(x => cfg.groupOf(x, f.dataset.g).includes(v)); l.hidden = !has; any = any || has; }); f.hidden = !any; });
    if ((cfg.groups || []).some(g => F[g].size) && $('exAdv')) { $('exAdv').hidden = false; $('exAdvBtn').setAttribute('aria-expanded', 'true'); }
    document.addEventListener('i18n:change', () => { head(); render(); });
    sig = sigOf(); syncChips(); head(); render();
    return { F, render };
  }
  return { init };
})();
