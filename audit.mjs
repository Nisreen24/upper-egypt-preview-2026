// Lighthouse guardrail. Usage: npm run audit  (server must be running: npm run serve)
// Exits non-zero when any category drops below the target, so a regression is caught before handover.
// Needs Chrome: installed normally, or set CHROME_PATH to a chrome.exe.
import { execSync } from "node:child_process";
import { readFileSync, existsSync, mkdirSync } from "node:fs";

const url = process.env.AUDIT_URL || "http://localhost:3002/";
const preset = process.argv.includes("--mobile") ? "" : "--preset=desktop";
const targets = process.argv.includes("--mobile")
  ? { performance: 70, accessibility: 100, "best-practices": 100, seo: 100 }
  : { performance: 98, accessibility: 100, "best-practices": 100, seo: 100 };

const outDir = "temporary screenshots"; if (!existsSync(outDir)) mkdirSync(outDir);
const out = `${outDir}/lighthouse-audit`;
execSync(`npx --yes lighthouse@12 ${url} ${preset} --output=json --output=html --output-path="${out}" --chrome-flags="--headless=new --no-sandbox" --only-categories=performance,accessibility,best-practices,seo --quiet`, { stdio: "inherit", env: process.env });

const report = JSON.parse(readFileSync(`${out}.report.json`, "utf8"));
let failed = false;
console.log(`\nLighthouse (${process.argv.includes("--mobile") ? "mobile" : "desktop"}) for ${url}`);
for (const [key, target] of Object.entries(targets)) {
  const score = Math.round(report.categories[key].score * 100);
  const ok = score >= target; if (!ok) failed = true;
  console.log(`  ${ok ? "OK  " : "FAIL"} ${key.padEnd(16)} ${String(score).padStart(3)}  (target ≥ ${target})`);
}
const m = report.audits.metrics.details.items[0];
console.log(`  LCP ${Math.round(m.largestContentfulPaint)} ms · FCP ${Math.round(m.firstContentfulPaint)} ms · CLS ${m.cumulativeLayoutShift.toFixed(3)} · TBT ${Math.round(m.totalBlockingTime)} ms`);
console.log(`  Report: ${out}.report.html`);
if (failed) { console.error("\nAudit failed: see PERFORMANCE.md for the rules that keep these scores."); process.exit(1); }
