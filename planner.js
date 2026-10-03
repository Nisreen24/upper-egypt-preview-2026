/* Trip planning assistant (travel-ideas.html). Conversational, rule-based and fully client-side: it understands city,
   length, interests and pace from what the visitor types or taps, then composes a day-by-day plan ONLY from the
   published destinations and experiences. It never invents places, prices or schedules. Saved plans live in the
   visitor's browser (localStorage "due.plans"). A hosted model can be plugged in later through PLANNER.remote(). */
window.PLANNER = (() => {
  const KEY = 'due.plans';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const write = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} };
  const norm = s => String(s || '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[ًٌٍَُِّْ]/g, '');
  const has = (s, words) => words.some(w => s.includes(norm(w)));
  /* ---- understanding ---- */
  const CITY = [['luxor', ['الاقصر', 'luxor', 'lúxor', 'الكرنك', 'وادي الملوك', 'البر الغربي']], ['aswan', ['اسوان', 'aswan', 'asuán', 'asuan', 'فيله', 'النوبه', 'nubia']]];
  const DAYS = [['نصف يوم', 0.5, ['نص يوم', 'نصف يوم', 'half day', 'medio día', 'ساعات']], ['يوم واحد', 1, ['يوم واحد', 'يوم', 'one day', '1 day', 'a day', 'un día', 'día']], ['يومان', 2, ['يومين', 'يومان', 'two days', '2 days', 'dos días', 'weekend', 'ويك اند']], ['ثلاثة أيام', 3, ['ثلاث', 'ثلاثه', '3 ايام', 'three days', '3 days', 'tres días']], ['أربعة أيام', 4, ['اربع', '4 ايام', 'four days', '4 days', 'cuatro días']], ['خمسة أيام', 5, ['خمس', '5 ايام', 'five days', '5 days', 'cinco días', 'اسبوع', 'week', 'semana']]];
  const INTEREST = { heritage: ['تراث', 'معابد', 'معبد', 'اثار', 'آثار', 'فراعنه', 'تاريخ', 'مقابر', 'temple', 'heritage', 'history', 'pharaoh', 'templo', 'historia'], nature: ['طبيعه', 'نيل', 'فلوكه', 'جزر', 'جزيره', 'غروب', 'مراكب', 'nile', 'nature', 'felucca', 'island', 'sunset', 'naturaleza', 'río'], food: ['اكل', 'أكل', 'طعام', 'مطاعم', 'مطعم', 'كشري', 'food', 'eat', 'restaurant', 'comida', 'comer'], crafts: ['حرف', 'ورش', 'ورشه', 'فضه', 'جلد', 'منتجات', 'تسوق', 'هدايا', 'craft', 'workshop', 'silver', 'leather', 'shopping', 'souvenir', 'artesan', 'taller'], culture: ['ثقافه', 'نوبه', 'نوبي', 'قريه', 'اهل', 'ناس', 'حكايات', 'شاي', 'culture', 'nubian', 'village', 'local', 'cultura', 'pueblo'], balloon: ['منطاد', 'مناطيد', 'balloon', 'globo'], slow: ['هدوء', 'هادي', 'هادئ', 'بطيء', 'استرخاء', 'ريلاكس', 'relax', 'slow', 'calm', 'tranquil', 'quiet'], family: ['عائله', 'اطفال', 'اولاد', 'عيله', 'family', 'kids', 'children', 'familia', 'niños'], access: ['كرسي', 'متحرك', 'اعاقه', 'ذوي', 'wheelchair', 'accessib', 'silla de ruedas'] };
  function understand(text, state) {
    const s = norm(text), out = Object.assign({ interests: [] }, state || {});
    for (const [k, ws] of CITY) if (has(s, ws)) out.city = k;
    for (const [label, n, ws] of DAYS) if (has(s, ws)) { out.days = n; out.dur = label; }
    const m = s.match(/(\d+)\s*(يوم|ايام|day|días|dia)/); if (m) { const n = Math.min(5, Math.max(1, +m[1])); out.days = n; out.dur = n === 1 ? 'يوم واحد' : n === 2 ? 'يومان' : n === 3 ? 'ثلاثة أيام' : n === 4 ? 'أربعة أيام' : 'خمسة أيام'; }
    for (const k in INTEREST) if (has(s, INTEREST[k]) && !out.interests.includes(k)) out.interests.push(k);
    if (has(s, ['كل حاجه', 'كل شيء', 'شامل', 'everything', 'all', 'todo'])) out.interests = ['heritage', 'nature', 'food', 'crafts', 'culture'];
    return out;
  }
  /* ---- composing: only published entries ---- */
  const score = (x, st) => { let v = 0; const I = st.interests; if (I.includes('heritage') && (x.c === 'heritage' || x.c === 'museum' || x.p === 'culture')) v += 3; if (I.includes('nature') && (x.c === 'nature' || x.c === 'viewpoint' || x.p === 'gems' || /فلوكة|نيل|جزيرة|منطاد/.test(x.n))) v += 3; if (I.includes('culture') && (x.p === 'culture' || x.p === 'folk' || /نوب|ثقاف|شاي/.test(x.n))) v += 3; if (I.includes('crafts') && (x.c === 'workshop' || x.c === 'product' || x.p === 'crafts' || x.p === 'products')) v += 3; if (I.includes('balloon') && /منطاد/.test(x.n)) v += 6; if (I.includes('access') && x.a && x.a.length) v += 2; if (I.includes('family') && x.a && x.a.includes('seat')) v += 1; return v; };
  function compose(st) {
    const city = st.city, days = st.days || 1, I = st.interests;
    const D = DESTINATIONS.list.filter(d => d.city === city).map(d => Object.assign({ kind: 'd' }, d)).sort((a, b) => score(b, st) - score(a, st));
    const E = EXPERIENCES.list.filter(e => e.city === city).map(e => Object.assign({ kind: 'e' }, e));
    const pick = (arr, used, n) => { const out = []; for (const x of arr) { if (used.has(x.slug)) continue; used.add(x.slug); out.push(x); if (out.length >= n) break; } return out; };
    const used = new Set(), plan = [];
    const acts = E.filter(e => ['tour', 'workshop'].includes(e.c) && !/منطاد/.test(e.n)).sort((a, b) => score(b, st) - score(a, st));
    const foods = E.filter(e => e.c === 'food').sort((a, b) => score(b, st) - score(a, st));
    const shops = E.filter(e => e.c === 'product').sort((a, b) => score(b, st) - score(a, st));
    const balloon = E.find(e => /منطاد/.test(e.n));
    const perDayPlaces = st.interests.includes('slow') ? 1 : 2;
    const nDays = Math.max(1, Math.ceil(days));
    for (let d = 0; d < nDays; d++) {
      const day = [];
      if (d === 0 && balloon && (I.includes('balloon') || I.includes('nature'))) { used.add(balloon.slug); day.push(balloon); }
      /* group the morning by area: start from the best unused destination, then prefer its area */
      const first = pick(D, used, 1)[0]; if (first) { day.push(first); const same = D.filter(x => x.area === first.area); day.push(...pick(same.concat(D), used, Math.max(0, perDayPlaces - 1))); }
      day.push(...pick(acts, used, 1));
      if (I.includes('crafts') || (d === nDays - 1 && shops.length)) day.push(...pick(shops, used, 1));
      day.push(...pick(foods, used, 1));
      if (day.length) plan.push(day);
    }
    const stays = E.filter(e => e.c === 'stay').sort((a, b) => score(b, st) - score(a, st)).slice(0, 2);
    const ready = CONTENT.travelIdeas.filter(i => i.city === city).sort((a, b) => Math.abs((a.days ? a.days.length : 1) - nDays) - Math.abs((b.days ? b.days.length : 1) - nDays)).slice(0, 2);
    return { city, days: nDays, dur: st.dur || (nDays === 1 ? 'يوم واحد' : nDays === 2 ? 'يومان' : nDays + ' أيام'), interests: I, plan, stays: days >= 2 ? stays : [], ready };
  }
  /* ---- saved plans ---- */
  const list = read;
  const save = p => { const all = read(); const id = p.id || ('p' + Date.now().toString(36)); const rec = Object.assign({}, p, { id, savedAt: new Date().toISOString(), plan: p.plan.map(day => day.map(x => [x.kind, x.slug])), stays: (p.stays || []).map(x => x.slug) }); const i = all.findIndex(x => x.id === id); if (i >= 0) all[i] = rec; else all.unshift(rec); write(all.slice(0, 12)); return id; };
  const remove = id => write(read().filter(x => x.id !== id));
  const hydrate = rec => Object.assign({}, rec, { plan: rec.plan.map(day => day.map(([k, s]) => k === 'd' ? Object.assign({ kind: 'd' }, DESTINATIONS.bySlug(s)) : Object.assign({ kind: 'e' }, EXPERIENCES.list.find(e => e.slug === s))).filter(x => x && x.slug)), stays: (rec.stays || []).map(s => EXPERIENCES.list.find(e => e.slug === s)).filter(Boolean) });
  /* ---- optional hosted model: set window.PLANNER_ENDPOINT to a URL that accepts {messages} and returns {reply}; the plan itself is still composed here ---- */
  const remote = async (messages) => { if (!window.PLANNER_ENDPOINT) return null; try { const r = await fetch(window.PLANNER_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }) }); const j = await r.json(); return j.reply || null; } catch (e) { return null; } };
  return { understand, compose, list, save, remove, hydrate, remote };
})();
