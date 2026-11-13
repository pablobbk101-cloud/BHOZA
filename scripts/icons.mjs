// One-off: renders the favicon set and the Open Graph image with the real brand fonts.
// node scripts/icons.mjs   (needs Playwright + Chromium; outputs are committed, so the Cloudflare build never runs this)
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path'; import sharp from 'sharp';
const { chromium } = createRequire(import.meta.url)('playwright'); // the globally installed Playwright, or npm i -D playwright
const font = (f) => `data:font/woff2;base64,${fs.readFileSync(`src/fonts/${f}`).toString('base64')}`;
const faces = `@font-face{font-family:C;src:url(${font('cormorant.woff2')});font-weight:300 700}
@font-face{font-family:C;font-style:italic;src:url(${font('cormorant-italic.woff2')});font-weight:300 700}
@font-face{font-family:I;src:url(${font('inter.woff2')});font-weight:100 900}`;
const b = await chromium.launch();
const pg = await b.newPage({ deviceScaleFactor: 1 });

// monogram: ivory B on charcoal, a gold hairline under it
const mono = (s) => `<html><style>${faces}html,body{margin:0}div{width:${s}px;height:${s}px;background:#252522;display:grid;place-items:center;position:relative}
span{font:600 ${s * 0.78}px/1 C;color:#F4F0E8;transform:translateY(${s * 0.02}px)}i{position:absolute;left:28%;right:28%;bottom:${s * 0.16}px;height:${Math.max(1, s * 0.035)}px;background:#A58A5C}</style><div><span>B</span><i></i></div></html>`;
for (const [s, name] of [[512, 'icon-512.png'], [192, 'icon-192.png'], [180, 'apple-touch-icon.png'], [32, 'icon-32.png']]) {
  await pg.setViewportSize({ width: s, height: s }); await pg.setContent(mono(s)); await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: `src/icons/${name}` });
}
// favicon.ico: a single 32px PNG wrapped in an ICO header
const png = fs.readFileSync('src/icons/icon-32.png');
const h = Buffer.alloc(22); h.writeUInt16LE(0, 0); h.writeUInt16LE(1, 2); h.writeUInt16LE(1, 4);
h.writeUInt8(32, 6); h.writeUInt8(32, 7); h.writeUInt8(0, 8); h.writeUInt8(0, 9); h.writeUInt16LE(1, 10); h.writeUInt16LE(32, 12);
h.writeUInt32LE(png.length, 14); h.writeUInt32LE(22, 18);
fs.writeFileSync('src/icons/favicon.ico', Buffer.concat([h, png])); fs.unlinkSync('src/icons/icon-32.png');

// Open Graph 1200x630
const portrait = `data:image/jpeg;base64,${(await sharp('images/bhoza-portrait.jpg').resize(560).jpeg({ quality: 85 }).toBuffer()).toString('base64')}`;
await pg.setViewportSize({ width: 1200, height: 630 });
await pg.setContent(`<html><style>${faces}html,body{margin:0}
.og{width:1200px;height:630px;background:#F4F0E8;display:grid;grid-template-columns:1fr 420px;color:#252522}
.t{padding:64px 0 56px 72px;display:flex;flex-direction:column;justify-content:space-between}
.n{font:600 34px/1 C}h1{margin:0;font:500 104px/0.92 C;letter-spacing:-0.025em}h1 em{font-style:italic;font-weight:400;color:#7A6440}
.r{width:72px;height:2px;background:#A58A5C;margin-bottom:20px}p{margin:0;font:400 22px/1.35 I;color:#5C5B54;max-width:560px}
.img{background:url(${portrait}) center 18%/cover}</style>
<div class="og"><div class="t"><div class="n">Bhoza Mphela</div><h1>Creative Industry <em>Big Sista.</em></h1><div><div class="r"></div><p>Soul. Style. Substance. Marketing, music, entertainment, events and culture. Johannesburg.</p></div></div><div class="img"></div></div></html>`);
await pg.evaluate(() => document.fonts.ready);
await sharp(await pg.screenshot()).jpeg({ quality: 86, mozjpeg: true }).toFile('images/og.jpg');
await b.close();
console.log(fs.readdirSync('src/icons'), fs.statSync('images/og.jpg').size);
