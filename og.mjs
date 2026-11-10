import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path'; import sharp from 'sharp';
const srv = http.createServer((q, r) => { let p = q.url.split('?')[0]; if (p.endsWith('/')) p += 'index.html'; fs.readFile(path.join('dist', p), (e, d) => e ? (r.writeHead(404), r.end()) : (r.writeHead(200, { 'content-type': { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' }[path.extname(p)] || 'application/octet-stream' }), r.end(d))); }).listen(4401);
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1200, height: 630 } });
await pg.goto('http://127.0.0.1:4401/index.html'); await pg.waitForTimeout(2800); await pg.mouse.move(830, 150); await pg.waitForTimeout(900);
await pg.addStyleTag({ content: '.head .nav,.hero__meta{display:none!important}' });
await sharp(await pg.screenshot()).jpeg({ quality: 86 }).toFile('dist/assets/img/og.jpg'); await b.close(); srv.close();
