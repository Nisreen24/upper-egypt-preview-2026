/* JSON-LD for detail templates (Inception Report 9.4): one script per page, rewritten on language change. */
window.LD = o => {
  let el = document.getElementById('ldJson');
  if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = 'ldJson'; document.head.appendChild(el); }
  const abs = u => { try { return u ? new URL(u, document.baseURI).href : undefined; } catch { return undefined; } };
  const out = Object.assign({ '@context': 'https://schema.org' }, o);
  if (out.image) out.image = abs(out.image);
  out.url = location.href; out.inLanguage = document.documentElement.lang;
  Object.keys(out).forEach(k => { if (out[k] == null || out[k] === '') delete out[k]; });
  el.textContent = JSON.stringify(out);
};
