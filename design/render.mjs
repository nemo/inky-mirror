// Render every fixture screen to previews/<name>.raw.png (browser output) and
// previews/<name>.png (quantised to the panel's 7 inks), then write the
// contact sheet previews/index.html.
//
//   cd design && node render.mjs [name-filter]

import { chromium } from "playwright";
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { compose } from "./src/compose.mjs";
import { TEMPLATES } from "./src/templates.mjs";
import { quantise } from "./quantise.mjs";
import { SCREENS, TEMPLATE_SHEETS } from "./fixtures.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.join(here, "build");
const FIX = path.join(here, "fixtures");
const OUT = path.join(here, "..", "previews");
for (const d of [BUILD, FIX, OUT]) fs.mkdirSync(d, { recursive: true });

const filter = process.argv[2];
const jobs = [
  ...SCREENS.map((s) => ({ ...s, kind: s.name.startsWith("var-") ? "Colour treatments" : s.name.startsWith("sheet") ? "Component sheets" : s.name.startsWith("ambient") ? "Ambient" : "Morning directions" })),
  ...TEMPLATE_SHEETS.map((t) => ({ name: `template-${t}`, label: `Template · ${t} — ${TEMPLATES[t].note}`, template: t, slots: {}, outline: true, kind: "Grid templates" })),
].filter((j) => !filter || j.name.includes(filter));

// Prefer Playwright's pinned browser; fall back to any cached headless shell
// (or INKY_CHROMIUM) so a half-finished `playwright install` doesn't block renders.
async function launch() {
  try { return await chromium.launch(); } catch (e) {
    const cache = path.join(process.env.HOME, "Library/Caches/ms-playwright");
    const shell = process.env.INKY_CHROMIUM || (fs.existsSync(cache) && fs.readdirSync(cache)
      .filter((d) => d.startsWith("chromium_headless_shell-")).sort().reverse()
      .map((d) => path.join(cache, d, "chrome-headless-shell-mac-arm64", "chrome-headless-shell"))
      .find((p) => fs.existsSync(p)));
    if (!shell) throw e;
    return chromium.launch({ executablePath: shell });
  }
}
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 600, height: 448 }, deviceScaleFactor: 1 });
const report = [];

for (const job of jobs) {
  const { outline, kind, label, ...screen } = job;
  if (!outline) fs.writeFileSync(path.join(FIX, `${job.name}.json`), JSON.stringify(screen, null, 2));
  const html = compose(screen, { outline });
  const file = path.join(BUILD, `${job.name}.html`);
  fs.writeFileSync(file, html);
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(() => document.fonts.ready);

  // overflow check: any slot whose content spills its box
  const overflow = await page.$$eval(".slot", (els) =>
    els.filter((e) => e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1)
       .map((e) => `${e.dataset.slot} (${e.scrollWidth}x${e.scrollHeight} in ${e.clientWidth}x${e.clientHeight})`));
  const dither = await page.$$eval("[data-dither]", (els) => els.map((e) => {
    const r = e.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  }));

  const raw = await page.screenshot({ type: "png" });
  fs.writeFileSync(path.join(OUT, `${job.name}.raw.png`), raw);
  const img = PNG.sync.read(raw);
  quantise(img, dither);
  fs.writeFileSync(path.join(OUT, `${job.name}.png`), PNG.sync.write(img));
  report.push({ ...job, overflow });
  console.log(`${job.name.padEnd(22)} ${overflow.length ? "OVERFLOW " + overflow.join(", ") : "ok"}`);
}
await browser.close();

/* contact sheet */
const groups = {};
for (const r of report) (groups[r.kind] ||= []).push(r);
const order = ["Colour treatments", "Morning directions", "Ambient", "Component sheets", "Grid templates"];
const sections = order.filter((k) => groups[k]).map((k) => `
  <section><h2>${k}</h2>
  ${groups[k].map((r) => `<figure>
      <figcaption>${r.label}${r.overflow.length ? ` <em>overflow: ${r.overflow.join(", ")}</em>` : ""}</figcaption>
      <div class="pair">
        <div><img src="${r.name}.png" width="600" height="448" alt="${r.label}, quantised"><span>On the panel: 7 inks</span></div>
        <div><img src="${r.name}.raw.png" width="600" height="448" alt="${r.label}, browser render"><span>Browser render</span></div>
      </div>
      <a href="../design/fixtures/${r.name}.json">${r.outline ? "" : "screen JSON"}</a>
    </figure>`).join("")}
  </section>`).join("");

fs.writeFileSync(path.join(OUT, "index.html"), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>inky-mirror previews</title>
<style>
@font-face { font-family: Archivo; src: url("../design/fonts/Archivo-VF.ttf"); font-weight: 100 900; font-stretch: 62% 125%; }
:root { --ink:#393039; --paper:#fff; --ground:#d6d8da; /* brushed-aluminium grey, the Braun housing */ }
body { margin: 0; background: var(--ground); color: var(--ink); font: 500 15px/1.4 Archivo, sans-serif; padding: 32px 24px 64px; }
h1 { font: 750 32px/1.1 Archivo; font-stretch: 88%; margin: 0 0 4px; }
.lede { margin: 0 0 32px; max-width: 70ch; }
h2 { font: 700 20px Archivo; margin: 48px 0 16px; border-top: 1px solid var(--ink); padding-top: 12px; }
figure { margin: 0 0 40px; }
figcaption { font-weight: 650; margin-bottom: 8px; }
figcaption em { color: #9c484b; font-style: normal; }
.pair { display: flex; flex-wrap: wrap; gap: 16px; }
.pair > div { display: flex; flex-direction: column; gap: 4px; }
.pair span { font-size: 13px; }
img { display: block; max-width: 100%; height: auto; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.18); image-rendering: pixelated; }
a { color: var(--ink); text-underline-offset: 3px; font-size: 13px; }
::selection { background: #d0be47; }
</style></head><body>
<h1>inky-mirror · component previews</h1>
<p class="lede">600×448, rendered by headless Chromium, then quantised to the Inky Impression's 7 inks. The left image of each pair is what the panel will show. All data is synthetic.</p>
${sections}
</body></html>`);
console.log(`\n${report.length} renders → ${path.relative(process.cwd(), OUT)}/index.html`);
