/* Page motion (GSAP). Loaded with defer after the GSAP bundles so it runs after first paint; every animation is unchanged. */
/* ===== Experiences: expanding cards (GSAP) ===== */
(() => {
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  const root = document.getElementById('xa'); if (!root) return;
  const cards = gsap.utils.toArray('.xa-card', root);
  const GROW = 4.5;
  let active = cards.findIndex(c => c.dataset.open === 'true'); if (active < 0) active = 0;
  let tl = null, reduced = false;

  // Initial state: the open card shows its content, the others show the vertical label
  cards.forEach((c, i) => {
    const open = i === active;
    gsap.set(c, { flexGrow: open ? GROW : 1 });
    gsap.set(c.querySelectorAll('.xa-copy > *, .xa-foot'), { autoAlpha: open ? 1 : 0, y: open ? 0 : 24 });
    gsap.set(c.querySelector('.xa-mini'), { autoAlpha: open ? 0 : 1 });
    c.dataset.open = String(open);
  });

  function expand(i) {
    if (i === active || i < 0) return;
    const prev = cards[active], next = cards[i]; active = i;
    cards.forEach((c, k) => c.dataset.open = String(k === i));
    if (tl) tl.kill();
    const d = reduced ? 0 : 1;
    tl = gsap.timeline({ defaults: { ease: 'expo.inOut', duration: 0.95 * d, overwrite: 'auto' } });
    tl.to(cards, { flexGrow: (k) => (k === i ? GROW : 1) }, 0)                                   // widths re-balance together
      .to(prev.querySelectorAll('.xa-copy > *, .xa-foot'), { autoAlpha: 0, y: 14, duration: 0.25 * d, stagger: 0.02 * d, ease: 'power2.in' }, 0)
      .to(prev.querySelector('.xa-mini'), { autoAlpha: 1, duration: 0.35 * d, ease: 'power2.out' }, 0.35 * d)
      .to(next.querySelector('.xa-mini'), { autoAlpha: 0, duration: 0.2 * d, ease: 'power2.out' }, 0)
      .fromTo(next.querySelectorAll('.xa-copy > *, .xa-foot'), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8 * d, stagger: 0.08 * d, ease: 'power3.out' }, 0.4 * d);
  }

  // Interaction: hover on fine pointers, click / tap, keyboard focus, arrow keys
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  cards.forEach((c, i) => {
    const hit = c.querySelector('.xa-hit');
    hit.addEventListener('click', () => expand(i));
    hit.addEventListener('focus', () => expand(i));
    if (fine) c.addEventListener('pointerenter', () => expand(i));
  });
  root.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const dir = (e.key === 'ArrowLeft') === (document.documentElement.dir === 'rtl') ? 1 : -1;   // forward = left in RTL, right in LTR
    const n = (active + dir + cards.length) % cards.length;
    expand(n); cards[n].querySelector('.xa-hit').focus({ preventScroll: true }); e.preventDefault();
  });

  // Entrance on scroll, and reduced-motion handling via matchMedia
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    reduced = false;
    const intro = gsap.timeline({ scrollTrigger: { trigger: '#experiences', start: 'top 72%', once: true }, defaults: { ease: 'power3.out' } });
    (window.__intros ||= []).push({ el: document.querySelector('#experiences'), tl: intro });
    intro.from('#experiences .exp-head > *', { y: 28, autoAlpha: 0, duration: 0.8, stagger: 0.12 })
         .from(cards, { y: 48, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.2);
    return () => { if (intro.scrollTrigger) intro.scrollTrigger.kill(); intro.kill(); };
  });
  mm.add('(prefers-reduced-motion: reduce)', () => { reduced = true; });
})();

/* ===== Events carousel (GSAP) ===== */
(() => {
  if (!window.gsap) return;
  const EVENTS = [
    { cat: 'موسيقى', title: 'أمسية نيلية<br>على ضفاف أسوان', desc: 'استمتع بأجواء موسيقية ساحرة وسط جمال النيل وتحت النجوم.', time: '6:00 مساءً', loc: 'أسوان', place: ['ASWAN', 'A different kind of peace'], img: 'ASSETS/60ceeb86-ec92-4c29-a148-e06a51d46fd7-1448.webp', pos: '50% 45%', href: 'events.html' },
    { cat: 'رياضة ونيل', title: 'سباق الفلايك<br>السنوي', desc: 'عشرات المراكب الشراعية تتسابق على صفحة النيل في مشهد لا يُنسى.', time: '4:30 عصراً', loc: 'أسوان', place: ['ASWAN', 'Where the Nile sails'], img: 'ASSETS/38ee86c3-b80b-4c1b-abcd-37e619a2827f-1448.webp', pos: '50% 50%', href: 'events.html' },
    { cat: 'طعام', title: 'مهرجان المائدة<br>الصعيدية', desc: 'تذوّق أطباق الصعيد الأصيلة من أيادي أمهات القرى وطهاتها.', time: '1:00 ظهراً', loc: 'الأقصر', place: ['LUXOR', 'Flavours of the south'], img: 'ASSETS/11e105f9-71d4-4a46-a890-aa48443d4a92-1448.webp', pos: '50% 55%', href: 'events.html' },
    { cat: 'حرف يدوية', title: 'أسبوع الحرف<br>اليدوية', desc: 'ورش مفتوحة مع الحرفيين: نسيج، خزف، وخوص من قلب القرى.', time: '10:00 صباحاً', loc: 'أسوان', place: ['NUBIA', 'Woven by hand'], img: 'ASSETS/0d44a1ae-46d7-43b6-aaff-ab31c749553a-1448.webp', pos: '50% 40%', href: 'events.html' },
  ];
  const $ = (s) => document.querySelector(s);
  const info = $('#ev .ev-info'), img = $('#ev-img'), place = $('#ev-place'), thumbs = [...document.querySelectorAll('.ev-thumb')];
  let cur = 0, busy = false, reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const evData = () => { const L = I18N.events(); return L ? EVENTS.map((e, i) => Object.assign({}, e, L[i])) : EVENTS; };
  function fill(e) {
    $('#ev-cat span').textContent = e.cat; $('#ev-title').innerHTML = e.title; $('#ev-desc').textContent = e.desc;
    $('#ev-time span').textContent = e.time; $('#ev-loc span').textContent = e.loc; $('#ev-cta').href = e.href;
    place.innerHTML = `<b>${e.place[0]}</b><span>${e.place[1]}</span>`;
    img.alt = e.title.replace('<br>', ' ');
  }
  /* the stage image carries a srcset, so src alone is ignored: copy both from the selected thumbnail */
  function setImg(i, e) { const ti = thumbs[i] && thumbs[i].querySelector('img'); img.classList.remove('lz'); delete img.dataset.src; delete img.dataset.srcset; img.srcset = ti ? (ti.getAttribute('srcset') || ti.dataset.srcset || '') : ''; img.src = e.img; img.style.objectPosition = e.pos; }
  function go(i) {
    i = (i + EVENTS.length) % EVENTS.length; if (i === cur || busy) return;
    const e = evData()[i]; cur = i; busy = true;
    thumbs.forEach((t, k) => t.setAttribute('aria-selected', String(k === i)));
    if (reduced) { fill(e); setImg(i, e); busy = false; return; }
    const items = info.children;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { busy = false; } });
    tl.to(items, { autoAlpha: 0, y: -12, duration: 0.25, stagger: 0.03, ease: 'power2.in' }, 0)
      .to(img, { autoAlpha: 0, scale: 1.06, duration: 0.35, ease: 'power2.in' }, 0)
      .to(place, { autoAlpha: 0, y: 8, duration: 0.2 }, 0)
      .add(() => { fill(e); setImg(i, e); })
      .fromTo(img, { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 1.1, ease: 'power2.out' })
      .fromTo(items, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.07 }, '<0.1')
      .fromTo(place, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4 }, '<0.2');
  }
  document.addEventListener('i18n:change', () => fill(evData()[cur]));
  thumbs.forEach(t => t.addEventListener('click', () => go(+t.dataset.i)));
  $('#ev-next').addEventListener('click', () => go(cur + 1));
  $('#ev-prev').addEventListener('click', () => go(cur - 1));
  $('#ev').addEventListener('keydown', (e) => { const fwd = document.documentElement.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight', back = fwd === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft'; if (e.key === fwd) { go(cur + 1); e.preventDefault(); } if (e.key === back) { go(cur - 1); e.preventDefault(); } });

  /* ---------- Gems rail: arrows, dots ---------- */
  (() => {
    const track = $('#gems-track'); if (!track) return;
    const items = [...track.children], dots = $('#gems-dots');
    const rtl = () => document.documentElement.dir === 'rtl';
    const step = () => items[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
    const index = () => Math.round(Math.abs(track.scrollLeft) / step());
    items.forEach((_, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', String(i + 1)); b.addEventListener('click', () => goTo(i)); dots.appendChild(b); });
    const goTo = (i) => { i = Math.max(0, Math.min(items.length - 1, i)); track.scrollTo({ left: (rtl() ? -1 : 1) * i * step(), behavior: 'smooth' }); };
    const sync = () => { track.tabIndex = track.scrollWidth > track.clientWidth + 2 ? 0 : -1; const i = index(); [...dots.children].forEach((d, k) => d.setAttribute('aria-current', String(k === i))); $('#gems-prev').disabled = i === 0; $('#gems-next').disabled = i >= items.length - 1; };
    $('#gems-next').addEventListener('click', () => goTo(index() + 1));
    $('#gems-prev').addEventListener('click', () => goTo(index() - 1));
    track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    track.addEventListener('keydown', e => { const f = rtl() ? 'ArrowLeft' : 'ArrowRight', b = rtl() ? 'ArrowRight' : 'ArrowLeft'; if (e.key === f) { goTo(index() + 1); e.preventDefault(); } if (e.key === b) { goTo(index() - 1); e.preventDefault(); } });
    addEventListener('resize', sync); sync();
  })();

  /* ---------- Stories rotation: the featured entrepreneur rotates every few seconds ---------- */
  (() => {
    const section = $('#business'); if (!section) return;
    const feature = section.querySelector('.st-feature'), cards = [...section.querySelectorAll('.st-card')];
    const t = (k) => (window.I18N ? I18N.t(k) : k);
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ICO = {
      hand: '<svg class="ic" width="16" height="16" viewBox="0 0 256 256" aria-hidden="true" focusable="false" fill="currentColor"><path d="M188,48a27.75,27.75,0,0,0-12,2.71V44a28,28,0,0,0-54.65-8.6A28,28,0,0,0,80,60v64l-3.82-6.13a28,28,0,0,0-48.6,27.82c16,33.77,28.93,57.72,43.72,72.69C86.24,233.54,103.2,240,128,240a88.1,88.1,0,0,0,88-88V76A28,28,0,0,0,188,48Zm12,104a72.08,72.08,0,0,1-72,72c-20.38,0-33.51-4.88-45.33-16.85C69.44,193.74,57.26,171,41.9,138.58a6.36,6.36,0,0,0-.3-.58,12,12,0,0,1,20.79-12,1.76,1.76,0,0,0,.14.23l18.67,30A8,8,0,0,0,96,152V60a12,12,0,0,1,24,0v60a8,8,0,0,0,16,0V44a12,12,0,0,1,24,0v76a8,8,0,0,0,16,0V76a12,12,0,0,1,24,0Z"/></svg>',
      ring: '<svg class="ic" width="16" height="16" viewBox="0 0 256 256" aria-hidden="true" focusable="false" fill="currentColor"><path d="M235.33,116.72,139.28,20.66a16,16,0,0,0-22.56,0l-96,96.06a16,16,0,0,0,0,22.56l96.05,96.06h0a16,16,0,0,0,22.56,0l96.05-96.06a16,16,0,0,0,0-22.56ZM128,224h0L32,128,128,32,224,128Z"/></svg>',
      train: '<svg class="ic" width="16" height="16" viewBox="0 0 256 256" aria-hidden="true" focusable="false" fill="currentColor"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H53.39a8,8,0,0,0,7.23-4.57,48,48,0,0,1,86.76,0,8,8,0,0,0,7.23,4.57H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM80,144a24,24,0,1,1,24,24A24,24,0,0,1,80,144Zm136,56H159.43a64.39,64.39,0,0,0-28.83-26.16,40,40,0,1,0-53.2,0A64.39,64.39,0,0,0,48.57,200H40V56H216ZM56,96V80a8,8,0,0,1,8-8H192a8,8,0,0,1,8,8v96a8,8,0,0,1-8,8H176a8,8,0,0,1,0-16h8V88H72v8a8,8,0,0,1-16,0Z"/></svg>'
    };
    const srcset = (b, max) => `ASSETS/${b}-480.webp 480w, ASSETS/${b}-960.webp 960w, ASSETS/${b}-1440.webp 1440w, ASSETS/${b}-${max}.webp ${max}w`;
    const DATA = [
      { b: 'Fatma Boghdady', max: 1448, posBig: '62% 35%', posSmall: '58% 40%', tag: 'حرف يدوية', tagCls: 'st-tag--clay', ico: 'hand', alt: 'فاطمة البغدادي في ورشتها بالأقصر وأمامها حقائب جلدية وإكسسوارات من صنعها', name: 'فاطمة البغدادي', biz: 'الحرفجية', loc: 'الأقصر', href: 'entrepreneur.html?slug=fatma-boghdady',
        desc: 'تُبدع فاطمة في تصميم وصناعة منتجات جلدية يدوية مستوحاة من التراث المصري القديم، حيث تمزج بين الحرف التقليدية والتصميم العصري لتقدم قطعاً تحكي قصة الأقصر بروح جديدة.' },
      { b: 'Zainab Gamal', max: 1461, posBig: '25% 40%', posSmall: '18% 45%', tag: 'إكسسوارات', tagCls: 'st-tag--olive', ico: 'ring', alt: 'زينب جمال تعرض مجموعة من العقود والإكسسوارات اليدوية من صنعها', name: 'زينب جمال', biz: 'زينب للإكسسوارات', loc: 'الأقصر', href: 'entrepreneur.html?slug=zainab-gamal',
        desc: 'تصنع زينب إكسسوارات يدوية مستوحاة من جمال الطبيعة والتراث المحلي، لتقدم منتجات فريدة تعكس هوية الصعيد وتدعم الحرف المنزلية.' },
      { b: 'Manal Awaga', max: 1448, posBig: '62% 40%', posSmall: '64% 45%', tag: 'مهارات وتدريب', tagCls: 'st-tag--ink', ico: 'train', alt: 'منال عوض الله في البيت النوبي تعرض أقمشة مطرزة أمام جدارية نوبية', name: 'منال عوض الله', biz: 'البيت النوبي', loc: 'أسوان', href: 'entrepreneur.html?slug=manal-awadallah',
        desc: 'تعمل منال على تدريب السيدات في المجتمع النوبي والحفاظ على الحرف اليدوية النوبية، من خلال منتجات تعبر عن الهوية والثقافة وتخلق فرصاً جديدة للنساء في أسوان.' }
    ];
    let order = [0, 1, 2], busy = false, visible = false, hold = false;
    function fillTag(el, d) { el.className = 'st-tag ' + d.tagCls; el.innerHTML = ICO[d.ico] + '<span>' + t(d.tag) + '</span>'; }
    function fillCopy(root, d, link) {
      root.querySelector('.st-name').textContent = t(d.name); root.querySelector('.st-biz').textContent = t(d.biz);
      root.querySelector('.st-loc span').textContent = t(d.loc); root.querySelector('.st-desc').textContent = t(d.desc);
      const a = root.querySelector(link); a.href = d.href; a.querySelector('span').textContent = t('عرض الملف الشخصي');
    }
    function paint() {
      const f = DATA[order[0]], img = feature.querySelector('.st-feature-img');
      lzSet(img, `ASSETS/${f.b}-${f.max}.webp`, srcset(f.b, f.max)); img.style.objectPosition = f.posBig; img.alt = t(f.alt);
      fillTag(feature.querySelector('.st-tag'), f); fillCopy(feature.querySelector('.st-panel'), f, '.st-link');
      cards.forEach((c, k) => { const d = DATA[order[k + 1]], im = c.querySelector('figure img');
        lzSet(im, `ASSETS/${d.b}-${d.max}.webp`, srcset(d.b, d.max)); im.style.objectPosition = d.posSmall; im.alt = t(d.alt);
        fillTag(c.querySelector('.st-tag'), d); fillCopy(c.querySelector('.st-body'), d, '.st-link'); });
    }
    function rotate() {
      if (busy) return; busy = true;
      order = [order[1], order[2], order[0]];
      if (rm) { paint(); busy = false; return; }
      // Switcher: each card glides to the slot it is moving into (feature -> card 2, card 1 -> feature, card 2 -> card 1),
      // then the DOM is repainted underneath and the transforms are cleared. Cards never disappear.
      // Layout morph: a clone of each card travels to the slot it is moving into (feature -> card 2,
      // card 1 -> feature, card 2 -> card 1) by animating its real box, so the content reflows instead
      // of stretching. Underneath, the grid is repainted, then the clones are removed.
      const grid = section.querySelector('.st-grid'), g = grid.getBoundingClientRect();
      const els = [feature, cards[0], cards[1]];
      const from = els.map(e => e.getBoundingClientRect());
      const dest = [cards[1], feature, cards[0]].map(e => e.getBoundingClientRect());
      const clones = els.map((el, k) => {
        const c = el.cloneNode(true); c.removeAttribute('data-slot');
        Object.assign(c.style, { position: 'absolute', margin: 0, minHeight: 0, pointerEvents: 'none', zIndex: k === 1 ? 6 : 5,
          left: (from[k].left - g.left) + 'px', top: (from[k].top - g.top) + 'px', width: from[k].width + 'px', height: from[k].height + 'px' });
        grid.appendChild(c); return c;
      });
      els.forEach(e => { e.style.visibility = 'hidden'; });
      const D = 1.15;
      const tl = gsap.timeline({ onComplete: () => { clones.forEach(c => c.remove()); els.forEach(e => { e.style.visibility = ''; }); busy = false; } });
      clones.forEach((c, k) => {
        const d = dest[k];
        tl.to(c, { left: d.left - g.left, top: d.top - g.top, width: d.width, height: d.height, duration: D, ease: 'power2.inOut' }, 0);
      });
      tl.add(paint, D * 0.9);
    }
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0.35 }).observe(section);
    section.addEventListener('pointerenter', () => { hold = true; }); section.addEventListener('pointerleave', () => { hold = false; });
    section.addEventListener('focusin', () => { hold = true; }); section.addEventListener('focusout', () => { hold = section.contains(document.activeElement); });
    if (!rm) setInterval(() => { if (visible && !hold && !document.hidden) rotate(); }, 8000);
    document.addEventListener('i18n:change', paint);
    window.__stRotate = rotate;
  })();

  /* Section entrances on scroll */
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const tls = [];
    const reg = (tl, sel) => { (window.__intros ||= []).push({ el: document.querySelector(sel), tl }); return tl; };
    tls.push(reg(gsap.timeline({ scrollTrigger: { trigger: '#destinations', start: 'top 70%', once: true }, defaults: { ease: 'power3.out' } })
      .from('#destinations .journey-head > *', { y: 26, autoAlpha: 0, duration: 0.8, stagger: 0.12 })
      .from('#destinations .journey-art', { y: 40, autoAlpha: 0, scale: 0.98, duration: 1.1 }, 0.15)
      .from('#destinations .journey-btn', { y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.1 }, 0.5), '#destinations'));
    tls.push(reg(gsap.timeline({ scrollTrigger: { trigger: '#gems', start: 'top 70%', once: true }, defaults: { ease: 'power3.out' } })
      .from('#gems .gems-head > *', { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.12 })
      , '#gems'));
    tls.push(reg(gsap.timeline({ scrollTrigger: { trigger: '#business', start: 'top 70%', once: true }, defaults: { ease: 'power3.out' } })
      .from('#business .st-head > *', { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.12 })
      .from('#business .st-feature', { y: 40, autoAlpha: 0, duration: 0.9 }, 0.2)
      .from('#business .st-card', { y: 30, autoAlpha: 0, duration: 0.7, stagger: 0.12 }, 0.4), '#business'));
    tls.push(reg(gsap.timeline({ scrollTrigger: { trigger: '#success', start: 'top 70%', once: true }, defaults: { ease: 'power3.out' } })
      .from('#success .rv-head > *', { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.12 })
      .from('#success .ss-card', { y: 36, autoAlpha: 0, duration: 0.8, stagger: 0.14 }, 0.3), '#success'));
    tls.push(reg(gsap.timeline({ scrollTrigger: { trigger: '#tours', start: 'top 70%', once: true }, defaults: { ease: 'power3.out' } })
      .from('#tours .events-head > *', { y: 26, autoAlpha: 0, duration: 0.8, stagger: 0.12 })
      .from('#tours .ev-stage', { y: 40, autoAlpha: 0, duration: 0.9 }, 0.2)
      .from('#tours .ev-thumb', { y: 18, autoAlpha: 0, duration: 0.5, stagger: 0.06 }, 0.5)
      .from('#tours .ev-all', { autoAlpha: 0, duration: 0.5 }, 0.7), '#tours'));
    return () => tls.forEach(t => { if (t.scrollTrigger) t.scrollTrigger.kill(); t.kill(); });
  });

})();

/* ===== Motion polish (GSAP): language crossfade, card tilt, eased anchor scrolling, parallax, hero intro ===== */
(() => {
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const EASE = 'power3.out';

  /* Mirror the hero collage in LTR (GSAP owns this transform, so intro/parallax keep it) */
  const flipArt = () => gsap.set('.hero-art', { scaleX: document.documentElement.dir === 'ltr' ? -1 : 1 });
  flipArt(); document.addEventListener('i18n:change', flipArt);

  /* 1. Language switch: soft crossfade instead of a hard swap */
  let switching = false;
  window.switchLang = (l) => {
    if (switching || l === I18N.lang) { if (!switching) I18N.set(l); return; }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { I18N.set(l); return; }
    switching = true;
    const page = document.getElementById('page');
    gsap.timeline({ onComplete: () => { switching = false; } })
      .to(page, { autoAlpha: 0, y: 10, duration: 0.28, ease: 'power2.in' })
      .add(() => { I18N.set(l); ScrollTrigger.refresh(); })
      .to(page, { autoAlpha: 1, y: 0, duration: 0.55, ease: EASE });
  };

  /* 2. Eased anchor scrolling (nav, buttons, footer) */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]'); if (!a || a.pathname !== location.pathname) return;
    const id = a.hash; if (id.length < 2) return;
    const target = document.querySelector(id); if (!target) return;
    e.preventDefault();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { target.scrollIntoView(); return; }
    const dist = Math.abs(target.getBoundingClientRect().top);
    gsap.to(window, { scrollTo: { y: target, offsetY: id === '#top' ? 0 : 24, autoKill: true }, duration: gsap.utils.clamp(0.6, 1.4, dist / 1400), ease: 'power3.inOut' });
    history.replaceState(null, '', location.pathname + location.search + id);
  });

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const kills = [];

    /* 3. Hero intro on load */
    const heroCopy = document.querySelector('.hero .copy');
    if (heroCopy) {
      const intro = gsap.timeline({ defaults: { ease: EASE } })
        .from('.hero-art', { yPercent: -3, duration: 1.4, ease: 'power2.out' }, 0) /* no opacity on the LCP image: a fade from 0 delays LCP until it ends */
        .from('.hero .eyebrow', { y: 18, autoAlpha: 0, duration: 0.7 }, 0.25)
        .from('.hero .headline > span', { y: 34, autoAlpha: 0, duration: 0.9, stagger: 0.12 }, 0.35)
        .from('.hero .lede', { y: 18, autoAlpha: 0, duration: 0.7 }, 0.7)
        .from('.hero .cta', { y: 14, autoAlpha: 0, duration: 0.6 }, 0.85)
        .from('.nav-bar', { y: -16, autoAlpha: 0, duration: 0.8 }, 0.1);
      kills.push(intro);
    }

    /* 4. Paths section reveal (was static) */
    const paths = gsap.timeline({ scrollTrigger: { trigger: '#paths', start: 'top 72%', once: true }, defaults: { ease: EASE } })
      .from('#paths .paths-head > *', { y: 26, autoAlpha: 0, duration: 0.8, stagger: 0.12 })
      .from('#paths .card', { y: 46, autoAlpha: 0, duration: 0.9, stagger: 0.1 }, 0.2);
    (window.__intros ||= []).push({ el: document.querySelector('#paths'), tl: paths }); kills.push(paths);

    /* 5. Gentle parallax on artwork layers */
    const par = (sel, y, extra = {}) => { const el = document.querySelector(sel); if (!el) return;
      kills.push(gsap.to(el, { yPercent: y, ease: 'none', ...extra, scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } })); };
    par('.paths-fronds', -8); par('.events-fronds', -6); par('.journey-lotus--start', -14); par('.journey-lotus--end', -14);

    /* 6. Pointer-following tilt + lift on cards (fine pointers only) */
    if (fine) {
      const tilt = (sel, maxDeg, lift) => document.querySelectorAll(sel).forEach(card => {
        card.classList.add('js-tilt');
        const rx = gsap.quickTo(card, 'rotationX', { duration: 0.7, ease: EASE }), ry = gsap.quickTo(card, 'rotationY', { duration: 0.7, ease: EASE });
        const yy = gsap.quickTo(card, 'y', { duration: 0.6, ease: EASE }), sc = gsap.quickTo(card, 'scale', { duration: 0.6, ease: EASE });
        gsap.set(card, { transformPerspective: 1000, transformOrigin: '50% 50%' });
        card.addEventListener('pointerenter', () => { yy(-lift); sc(1.012); });
        card.addEventListener('pointermove', (e) => { const r = card.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5; ry(px * maxDeg); rx(-py * maxDeg); });
        card.addEventListener('pointerleave', () => { rx(0); ry(0); yy(0); sc(1); });
      });
      tilt('#paths .card', 5, 8); tilt('.ev-thumb', 8, 3); tilt('.ev-stage', 1.6, 0);
      // magnetic buttons: drift a few px toward the pointer
      document.querySelectorAll('.cta,.card-cta,.xa-cta,.ev-cta,.news-btn,.reset').forEach(btn => {
        const mx = gsap.quickTo(btn, 'x', { duration: 0.5, ease: EASE }), my = gsap.quickTo(btn, 'y', { duration: 0.5, ease: EASE });
        btn.addEventListener('pointermove', (e) => { const r = btn.getBoundingClientRect(); mx(((e.clientX - r.left) / r.width - 0.5) * 8); my(((e.clientY - r.top) / r.height - 0.5) * 6); });
        btn.addEventListener('pointerleave', () => { mx(0); my(0); });
      });
    }

    return () => kills.forEach(t => { if (t.scrollTrigger) t.scrollTrigger.kill(); t.kill(); });
  });
})();

/* Fail-safe: never leave a section hidden if its scroll reveal did not fire */
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener('load', refresh);
  document.querySelectorAll('img[loading="lazy"]').forEach(i => i.complete || i.addEventListener('load', refresh, { once: true }));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const item = (window.__intros || []).find(x => x.el === en.target);
      setTimeout(() => { if (item && item.tl.progress() === 0 && !item.tl.isActive()) item.tl.play(0); }, 900);
      io.unobserve(en.target);
    });
  }, { threshold: 0.15 });
  const arm = () => (window.__intros || []).forEach(x => x.el && io.observe(x.el));
  arm(); window.addEventListener('load', arm);
  // absolute last resort: 8s after load, reveal anything still at progress 0
  window.addEventListener('load', () => setTimeout(() => (window.__intros || []).forEach(x => { if (x.tl.progress() === 0) x.tl.progress(1); }), 8000));
})();
