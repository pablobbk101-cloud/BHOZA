// Local preview of dist/ that behaves like Cloudflare Pages: clean URLs, 404.html, and the /api/contact function.
// npm run serve   ->  http://localhost:4400
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { onRequestPost } from '../functions/api/contact.js';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = +(process.env.PORT || process.argv[2] || 4400);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain', '.yml': 'text/yaml', '.webmanifest': 'application/manifest+json' };
http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  if (url.pathname === '/api/contact') {
    if (req.method !== 'POST') { res.writeHead(405); return res.end(); }
    const chunks = []; for await (const c of req) chunks.push(c);
    const r = await onRequestPost({ request: new Request(url, { method: 'POST', headers: req.headers, body: Buffer.concat(chunks) }), env: { DEV_ECHO: '1' } });
    res.writeHead(r.status, Object.fromEntries(r.headers)); return res.end(Buffer.from(await r.arrayBuffer()));
  }
  let p = decodeURIComponent(url.pathname);
  if (p.endsWith('/')) p += 'index.html';
  let f = path.join(root, p);
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (!fs.existsSync(f) && fs.existsSync(path.join(f, 'index.html'))) { res.writeHead(308, { location: url.pathname + '/' + url.search }); return res.end(); }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404, { 'content-type': types['.html'] }); return res.end(fs.readFileSync(path.join(root, '404.html'))); }
    res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); res.end(d);
  });
}).listen(port, () => console.log(`Serving dist/ on http://localhost:${port}`));
