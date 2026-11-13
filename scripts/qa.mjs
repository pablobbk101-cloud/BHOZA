// QA: node scripts/qa.mjs [page-filter]   (serves dist/ with scripts/serve.mjs on :4411)
// Writes .shots/<mode>-<page>.png (full page) + .shots/report.json: console errors, overflow, tap targets,
// headings, axe-core violations, LCP/CLS, keyboard focus, and an end-to-end form submission.
import { createRequire } from 'node:module'; import fs from 'node:fs'; import { spawn } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const axe = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const srv = spawn('node', ['scripts/serve.mjs', '4411'], { stdio: 'ignore' }); await new Promise((r) => setTimeout(r, 600));
const B = 'http://127.0.0.1:4411';
const all = ['/', '/about/', '/marketing/', '/music/', '/events/', '/events/soul-connex/', '/speaking/', '/ventures/', '/lifestyle/', '/contact/', '/nope/'];
const pages = all.filter((p) => !process.argv[2] || p.includes(process.argv[2]));
const name = (p) => p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/\//g, '_');
fs.mkdirSync('.shots', { recursive: true });
const b = await chromium.launch();
const report = {};
const modes = {
  d: { viewport: { width: 1440, height: 900 } },
  m: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  r: { viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' },
};
for (const [m, opt] of Object.entries(modes)) {
  const ctx = await b.newContext(opt);
  for (const p of pages) {
    const page = await ctx.newPage(); const errs = [];
    page.on('console', (x) => x.type() === 'error' && errs.push(x.text().slice(0, 200)));
    page.on('pageerror', (e) => errs.push(String(e)));
    page.on('requestfailed', (q) => errs.push('FAILED ' + q.url()));
    await page.addInitScript(() => {
      window.__cls = 0; window.__lcp = 0;
      new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver((l) => { const e = l.getEntries().at(-1); window.__lcp = e.startTime; window.__lcpEl = e.element?.tagName + '.' + (e.element?.className || ''); }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    await page.goto(B + p, { waitUntil: 'networkidle' }); await page.waitForTimeout(400);
    if (m !== 'm') await page.screenshot({ path: `.shots/${m}-${name(p)}-top.png` });
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 500) { await page.evaluate((y) => scrollTo(0, y), y); await page.waitForTimeout(60); }
    await page.waitForTimeout(800); await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(200);
    await page.screenshot({ path: `.shots/${m}-${name(p)}.png`, fullPage: true });
    const info = await page.evaluate(() => {
      const de = document.documentElement;
      const hidden = [...document.querySelectorAll('[data-rv]')].filter((e) => +getComputedStyle(e).opacity < 0.95).length;
      const small = [...document.querySelectorAll('a,button,input,select,textarea')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && getComputedStyle(e).visibility !== 'hidden' && (r.height < 24 || r.width < 24) && !e.closest('.prose,.hp,.vh'); }).map((e) => (e.textContent || e.name).trim().slice(0, 30));
      const heads = [...document.querySelectorAll('h1,h2,h3')].map((h) => +h.tagName[1]);
      const skips = heads.filter((h, i) => i && h - heads[i - 1] > 1).length;
      const wide = [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > de.clientWidth + 1 && !e.closest('.vh,.hp,.skip')).slice(0, 5).map((e) => e.className || e.tagName);
      return { overflowX: de.scrollWidth - de.clientWidth, wide, hiddenAfterScroll: hidden, smallTargets: small, h1: document.querySelectorAll('h1').length, headingSkips: skips, cls: +window.__cls.toFixed(4), lcp: Math.round(window.__lcp), lcpEl: window.__lcpEl };
    });
    let kb;
    if (m === 'd') {
      kb = [];
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press('Tab');
        kb.push(await page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return `${a.tagName}:${(a.textContent || '').trim().slice(0, 24)} outline=${cs.outlineStyle !== 'none' && cs.outlineWidth !== '0px'}`; }));
      }
    }
    await page.addScriptTag({ content: axe });
    const ax = await page.evaluate(async () => (await axe.run(document, { resultTypes: ['violations'] })).violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, ex: v.nodes.slice(0, 3).map((n) => n.target.join(' ') + ' | ' + (n.any[0]?.message || '').slice(0, 140)) })));
    report[`${m}-${name(p)}`] = { errs, ...info, kb, axe: ax };
    await page.close();
  }
  await ctx.close();
}
// form: validation + success state (phone)
if (!process.argv[2] || 'contact'.includes(process.argv[2])) {
  const ctx = await b.newContext(modes.m); const page = await ctx.newPage();
  await page.goto(B + '/contact/?type=dj#enquiry');
  const preset = await page.$eval('#f-category', (s) => s.value);
  await page.click('[data-submit]'); await page.waitForTimeout(300);
  const invalid = await page.$$eval('[aria-invalid="true"]', (e) => e.map((x) => x.name));
  await page.screenshot({ path: '.shots/form-errors.png' });
  await page.fill('#f-name', 'Test Person'); await page.fill('#f-email', 'test@example.com');
  await page.fill('#f-message', 'We would love to book a DJ set for a launch in March.');
  await page.click('[data-submit]'); await page.waitForSelector('[data-form-ok]:not([hidden])', { timeout: 4000 });
  await page.waitForTimeout(900); await page.screenshot({ path: '.shots/form-success.png' });
  report.form = { preset, invalid, success: true };
  await ctx.close();
}
await b.close(); srv.kill();
fs.writeFileSync('.shots/report.json', JSON.stringify(report, null, 1));
const issues = Object.entries(report).map(([k, v]) => [k, { errs: v.errs?.length ? v.errs : undefined, ox: v.overflowX || undefined, wide: v.overflowX ? v.wide : undefined, hid: v.hiddenAfterScroll || undefined, small: v.smallTargets?.length ? v.smallTargets : undefined, h1: v.h1 !== 1 && v.h1 !== undefined ? v.h1 : undefined, skips: v.headingSkips || undefined, cls: v.cls > 0.02 ? v.cls : undefined, lcp: v.lcp, axe: v.axe?.length ? v.axe : undefined, kb: v.kb }]);
console.log(JSON.stringify(Object.fromEntries(issues), null, 1));
