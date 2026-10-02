/* Public request forms (BRD 5.4): client validation, consent, Turnstile, five submissions an hour, and one review queue.
   PROTOTYPE: the server side (Turnstile verification, server validation, emails, the queue store) is simulated in the browser
   with localStorage so the flows can be walked end to end. Nothing here is a production backend. */
window.FORMS = (() => {
  const t = k => (window.I18N ? I18N.t(k) : k);
  const KEY_Q = 'due.queue', KEY_RL = 'due.ratelimit', KEY_NL = 'due.newsletter', KEY_TOK = 'due.tokens';
  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  const now = () => new Date().toISOString();

  /* queue */
  const DUE = { general: 5, directory: 10, registration: 10, update: 5 };
  const queue = {
    all: () => read(KEY_Q, []),
    add: (type, payload, consent) => { const q = read(KEY_Q, []); const d = new Date(); d.setDate(d.getDate() + (DUE[type] || 5)); const item = { id: uid(), type, payload, consent, status: 'new', created: now(), due: d.toISOString(), assignee: '', note: '', reply: '', lang: document.documentElement.lang || 'ar', history: [{ at: now(), to: 'new' }] }; q.unshift(item); write(KEY_Q, q); return item; },
    update: (id, patch) => { const q = read(KEY_Q, []); const i = q.findIndex(x => x.id === id); if (i < 0) return null; q[i] = { ...q[i], ...patch }; if (patch.status) q[i].history = [...(q[i].history || []), { at: now(), to: patch.status }]; write(KEY_Q, q); return q[i]; },
    clear: () => write(KEY_Q, []),
  };

  /* rate limit: five accepted submissions an hour from one address (here: one browser) */
  const rate = { ok: () => { const h = read(KEY_RL, []).filter(ts => Date.now() - ts < 3600e3); write(KEY_RL, h); return h.length < 5; }, hit: () => { const h = read(KEY_RL, []).filter(ts => Date.now() - ts < 3600e3); h.push(Date.now()); write(KEY_RL, h); } };

  /* newsletter: pending → confirmed with tokens (not a queue request) */
  const newsletter = {
    subscribe: email => { const l = read(KEY_NL, []); let s = l.find(x => x.email === email); if (!s) { s = { email, state: 'pending', lang: document.documentElement.lang || 'ar', at: now(), confirm: uid(), unsubscribe: uid() }; l.push(s); write(KEY_NL, l); } return s; },
    confirm: tok => { const l = read(KEY_NL, []); const s = l.find(x => x.confirm === tok); if (s) { s.state = 'confirmed'; s.confirmedAt = now(); write(KEY_NL, l); } return s; },
    unsubscribe: tok => { const l = read(KEY_NL, []); const i = l.findIndex(x => x.unsubscribe === tok); if (i < 0) return null; const s = l[i]; l.splice(i, 1); write(KEY_NL, l); return s; },
  };

  /* one-time edit links: single use, 24 hours, spent on save */
  const tokens = {
    issue: (kind, slug) => { const l = read(KEY_TOK, []); const tok = { token: uid() + uid(), kind, slug, issued: Date.now(), used: false }; l.push(tok); write(KEY_TOK, l); return tok; },
    get: token => read(KEY_TOK, []).find(x => x.token === token) || null,
    state: tok => !tok ? 'invalid' : tok.used ? 'used' : (Date.now() - tok.issued > 24 * 3600e3) ? 'expired' : 'ok',
    spend: token => { const l = read(KEY_TOK, []); const x = l.find(y => y.token === token); if (x) { x.used = true; write(KEY_TOK, l); } },
  };

  /* form engine */
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function wire(form, opts) {
    const status = form.querySelector('[data-status]'), submit = form.querySelector('[type="submit"]');
    const setErr = (field, msg) => { const wrap = field.closest('.f-field') || field.parentElement; let e = wrap.querySelector('.f-err'); if (!e) { e = document.createElement('p'); e.className = 'f-err'; e.setAttribute('role', 'alert'); wrap.appendChild(e); } e.textContent = msg; wrap.classList.toggle('is-invalid', !!msg); field.setAttribute('aria-invalid', msg ? 'true' : 'false'); if (!msg) e.remove(); };
    const validate = () => {
      let first = null;
      form.querySelectorAll('input, select, textarea').forEach(f => {
        if (f.closest('[hidden]')) { setErr(f, ''); return; }
        let msg = '';
        if (f.required && ((f.type === 'checkbox' && !f.checked) || (f.type !== 'checkbox' && !f.value.trim()))) msg = f.type === 'checkbox' ? t('هذه الموافقة مطلوبة.') : t('هذا الحقل مطلوب.');
        else if (f.type === 'email' && f.value && !EMAIL.test(f.value.trim())) msg = t('من فضلك أدخل بريداً إلكترونياً صحيحاً.');
        setErr(f, msg); if (msg && !first) first = f;
      });
      return first;
    };
    /* Turnstile placeholder: a visible verification step with the same contract as the real widget */
    const ts = form.querySelector('.f-turnstile'); let verified = false;
    if (ts) { const b = ts.querySelector('button'); b.addEventListener('click', () => { verified = true; ts.classList.add('is-ok'); b.disabled = true; b.querySelector('span').textContent = t('تم التحقق'); }); }
    form.addEventListener('submit', ev => {
      ev.preventDefault(); status.className = 'f-status'; status.textContent = '';
      const bad = validate(); if (bad) { status.classList.add('is-error'); status.textContent = t('راجع الحقول المحددة ثم أعد الإرسال.'); bad.focus(); return; }
      if (ts && !verified) { status.classList.add('is-error'); status.textContent = t('أكمل خطوة التحقق أولًا.'); ts.querySelector('button').focus(); return; }
      if (!rate.ok()) { status.classList.add('is-error'); status.textContent = t('وصلت إلى الحد المسموح من الطلبات لهذه الساعة. حاول مرة أخرى بعد قليل.'); return; }
      const data = {}; new FormData(form).forEach((v, k) => { if (!form.querySelector('[name="' + k + '"]').closest('[hidden]')) data[k] = v; });
      const consent = { text: [...form.querySelectorAll('.f-consent')].map(c => c.textContent.trim()), at: now() };
      const res = opts.onSubmit ? opts.onSubmit(data, consent) : queue.add(opts.type, data, consent);
      rate.hit();
      form.querySelectorAll('fieldset, .f-field, .f-actions').forEach(x => x.hidden = true);
      status.classList.add('is-ok'); status.innerHTML = opts.success(res, data); status.focus();
    });
  }
  return { queue, rate, newsletter, tokens, wire, uid };
})();
