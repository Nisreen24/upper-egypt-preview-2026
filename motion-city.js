/* Page motion (GSAP). Loaded with defer after the GSAP bundles so it runs after first paint; every animation is unchanged. */
/* Activities: expanding cards, same timeline as the home experiences section */
(() => {
  if (!window.gsap) return;
  const root = document.getElementById('xlAct'); if (!root) return;
  const cards = gsap.utils.toArray('.xl-card', root);
  const mobile = matchMedia('(max-width:767px)');
  const GROW = () => mobile.matches ? 4.2 : 8;
  let active = cards.findIndex(c => c.dataset.open === 'true'); if (active < 0) active = 0;
  let tl = null;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const state = (c, open) => { c.dataset.open = String(open); c.querySelector('.xl-hit').setAttribute('aria-expanded', String(open)); };
  function reset() {
    cards.forEach((c, i) => { const open = i === active; gsap.set(c, { flexGrow: open ? GROW() : 1 });
      gsap.set(c.querySelectorAll('.xl-copy > *'), { autoAlpha: open ? 1 : 0, y: open ? 0 : 24 }); gsap.set(c.querySelector('.xl-mini'), { autoAlpha: open ? 0 : 1 }); state(c, open); });
  }
  reset();
  function expand(i) {
    if (i === active || i < 0) return;
    const prev = cards[active], next = cards[i]; active = i;
    cards.forEach((c, k) => state(c, k === i));
    if (tl) tl.kill();
    const d = reduced.matches ? 0 : 1;
    tl = gsap.timeline({ defaults: { ease: 'expo.inOut', duration: 0.95 * d, overwrite: 'auto' } });
    tl.to(cards, { flexGrow: k => (k === i ? GROW() : 1) }, 0)
      .to(prev.querySelectorAll('.xl-copy > *'), { autoAlpha: 0, y: 14, duration: 0.25 * d, stagger: 0.02 * d, ease: 'power2.in' }, 0)
      .to(prev.querySelector('.xl-mini'), { autoAlpha: 1, duration: 0.35 * d, ease: 'power2.out' }, 0.35 * d)
      .to(next.querySelector('.xl-mini'), { autoAlpha: 0, duration: 0.2 * d, ease: 'power2.out' }, 0)
      .fromTo(next.querySelectorAll('.xl-copy > *'), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8 * d, stagger: 0.08 * d, ease: 'power3.out' }, 0.4 * d);
  }
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  cards.forEach((c, i) => {
    const hit = c.querySelector('.xl-hit');
    hit.addEventListener('click', () => { if (c.dataset.open === 'true' && c.dataset.href) { location.href = c.dataset.href; return; } expand(i); });
    hit.addEventListener('focus', () => expand(i));
    if (fine) c.addEventListener('pointerenter', () => expand(i));
  });
  root.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const dir = (e.key === 'ArrowLeft') === (document.documentElement.dir === 'rtl') ? 1 : -1;
    const n = (active + dir + cards.length) % cards.length;
    expand(n); cards[n].querySelector('.xl-hit').focus({ preventScroll: true }); e.preventDefault(); e.stopPropagation();
  });
  /* keep the icon centred in a collapsed card */
  function iconX() { if (mobile.matches) { root.style.removeProperty('--ic-x'); return; } const total = root.clientWidth, gap = parseFloat(getComputedStyle(root).columnGap) || 0;
    const w = (total - gap * (cards.length - 1)) / (GROW() + cards.length - 1); root.style.setProperty('--ic-x', Math.max(8, (w - 48) / 2) + 'px'); }
  iconX(); addEventListener('resize', () => { iconX(); if (tl) tl.kill(); reset(); });
  window.__xl = { expand, get active() { return active; } };
})();
