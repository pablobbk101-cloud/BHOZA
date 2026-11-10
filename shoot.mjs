// QA: node shoot.mjs  -> .shots/*.png + report.json  (serves dist on :4400 first)
import { chromium } from 'playwright'; import fs from 'fs'; import http from 'http'; import path from 'path';
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.xml': 'text/xml', '.txt': 'text/plain' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join('dist', p);
  fs.readFile(f, (e, d) => e ? (r.writeHead(404, { 'content-type': 'text/html' }), r.end(fs.readFileSync('dist/404.html'))) : (r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }), r.end(d))); }).listen(4400);
const only = process.argv[2];
const pages = ['index', 'work', 'about', 'book', '404'].filter((p) => !only || p === only);
const axe = fs.readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
fs.mkdirSync('.shots', { recursive: true });
const b = await chromium.launch(); const report = {};
const modes = [['d', { viewport: { width: 1440, height: 900 } }], ['m', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }], ['r', { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }]];
for (const [m, opt] of modes) {
  const ctx = await b.newContext(opt);
  for (const p of pages) {
    const page = await ctx.newPage(); const errs = [];
    page.on('console', (x) => x.type() === 'error' && errs.push(x.text())); page.on('pageerror', (e) => errs.push(String(e))); page.on('requestfailed', (q) => errs.push('FAILED ' + q.url()));
    await page.goto(`http://127.0.0.1:4400/${p}.html`, { waitUntil: 'load' }); await page.waitForTimeout(1900);
    if (m === 'd') await page.mouse.move(980, 190); await page.waitForTimeout(500);
    await page.screenshot({ path: `.shots/${m}-${p}-0.png` });
    const H = await page.evaluate(() => document.documentElement.scrollHeight); const vh = opt.viewport.height; let i = 1;
    for (let y = vh * 0.9; y < H - 10 && i < (m==='m'?34:16); y += vh * 0.9, i++) { if (m === 'd') await page.mouse.wheel(0, vh * 0.9); else await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(m === 'r' ? 250 : 1100); await page.screenshot({ path: `.shots/${m}-${p}-${i}.png` }); }
    const info = await page.evaluate(() => { const de = document.documentElement;
      const hidden = [...document.querySelectorAll('[data-reveal],[data-intro]')].filter((e) => +getComputedStyle(e).opacity < 0.9).length;
      const small = [...document.querySelectorAll('a,button,input,textarea')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.height < 24 || r.width < 24); }).map((e) => (e.textContent || e.name).trim().slice(0, 30));
      return { overflowX: de.scrollWidth - de.clientWidth, hiddenAfterScroll: hidden, smallTargets: small, h1: document.querySelectorAll('h1').length }; });
    await page.addScriptTag({ content: axe });
    const ax = await page.evaluate(async () => (await axe.run(document, { resultTypes: ['violations'] })).violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, ex: v.nodes.slice(0, 3).map((n) => n.target.join(' ') + ' | ' + (n.any[0]?.message || '').slice(0, 110)) })));
    report[`${m}-${p}`] = { errs, ...info, shots: i, axe: ax }; await page.close();
  }
  await ctx.close();
}
await b.close(); srv.close(); fs.writeFileSync('.shots/report.json', JSON.stringify(report, null, 1)); console.log(JSON.stringify(report, null, 1));
