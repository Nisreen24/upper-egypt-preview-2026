/* AVIF companions for every WebP under ASSETS (Inception Report 9.2: modern formats at the layout size). Lossless in intent:
   quality 62 / effort 4 sits at visual parity with the existing WebP files. Run: node build-avif.mjs */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const files = walk('ASSETS').filter(f => /\.(webp|jpg)$/i.test(f) && !/\.mp4$/.test(f));
let made = 0, skipped = 0, failed = 0;
for (const f of files) {
  const out = f.replace(/\.(webp|jpg)$/i, '.avif');
  if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(f).mtimeMs) { skipped++; continue; }
  try { await sharp(f).avif({ quality: 62, effort: 4 }).toFile(out); made++; }
  catch (e) { failed++; console.log('failed', f, e.message.slice(0, 80)); }
  /* hero posters are JPEG today: give them a WebP too */
  if (/\.jpg$/i.test(f)) { const w = f.replace(/\.jpg$/i, '.webp'); if (!fs.existsSync(w)) await sharp(f).webp({ quality: 84 }).toFile(w); }
}
console.log('avif: made ' + made + ', up to date ' + skipped + ', failed ' + failed + ' of ' + files.length);
