/* One listing engine for every filtered list: chips (one group), advanced checkbox groups, search, count, URL state. */
window.LISTING = (() => {
  const $ = id => document.getElementById(id);
  function init(cfg) {
    const { t, esc, crumb } = EX;
    const q = new URLSearchParams(location.search);
    const F = { q: q.get('q') || '', chip: cfg.chips && cfg.chips.includes(q.get(cfg.chipParam)) ? q.get(cfg.chipParam) : 'all' };
    (cfg.groups || []).forEach(g => { F[g] = new Set((q.get(g) || '').split(',').filter(Boolean)); });
    if (cfg.hero !== false) (() => {
      const xh = $('xh'), nav = document.querySelector('.nav-bar'); if (!xh) return;
      const size = () => { const mobile = innerWidth < 768, vh = innerHeight; const navB = nav ? nav.getBoundingClientRect().bottom : 0; const w = Math.min(mobile ? 950 : 1550, innerWidth * 0.95); const h = Math.min(mobile ? 600 : 800, vh * 0.85, vh - navB - 100); const top = Math.max((vh - h) / 2, navB + 80); xh.style.setProperty('--xh-w', w + 'px'); xh.style.setProperty('--xh-h', h + 'px'); xh.style.setProperty('--xh-top', top + 'px'); };
      size(); addEventListener('resize', size); addEventListener('load', size);
    })();
    const match = x => (F.chip === 'all' || [].concat(cfg.chipOf(x)).includes(F.chip)) && (!F.q || cfg.hay(x).toLowerCase().includes(F.q.toLowerCase())) && (cfg.groups || []).every(g => !F[g].size || cfg.groupOf(x, g).some(v => F[g].has(v)));
    function url() { const u = new URLSearchParams(); if (F.chip !== 'all') u.set(cfg.chipParam, F.chip); if (F.q) u.set('q', F.q); (cfg.groups || []).forEach(g => { if (F[g].size) u.set(g, [...F[g]].join(',')); }); history.replaceState(null, '', u.toString() ? '?' + u.toString() : location.pathname); }
    function head() { if (cfg.crumb) $('exCrumb').innerHTML = crumb(cfg.crumb()); document.title = cfg.title() + ' — ' + t('صعيد مصر'); if (cfg.onHead) cfg.onHead(); }
    function render() {
      const shown = cfg.items().filter(match).sort(cfg.sort || (() => 0));
      $('exGrid').innerHTML = shown.map(cfg.card).join('');
      $('exCount').textContent = cfg.count(shown.length);
      $('exEmpty').hidden = shown.length > 0;
      const n = (cfg.groups || []).reduce((a, g) => a + F[g].size, 0); if ($('exAdvN')) { $('exAdvN').hidden = !n; $('exAdvN').textContent = n; }
      url(); if (cfg.onRender) cfg.onRender(shown);
    }
    $('exGrid').addEventListener('click', e => { const c = e.target.closest('[data-href]'); if (!c || e.target.closest('a,button')) return; location.href = c.dataset.href; });
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
    syncChips(); head(); render();
    return { F, render };
  }
  return { init };
})();
