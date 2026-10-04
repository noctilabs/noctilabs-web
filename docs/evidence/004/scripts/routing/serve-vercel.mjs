// Servidor local para D7/D8 (spec 004 §5): sirve un dist/ aplicando las rutas de vercel.json compiladas con
// @vercel/routing-utils (normalización de trailingSlash, redirects y cabeceras), con la 404 del sitio.
// Uso: node serve-vercel.mjs <repo> <dist> <puerto> [log]
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { appendFileSync, existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const req = createRequire(import.meta.url);
const ru = req('@vercel/routing-utils');
const [repo, dist, port, log] = process.argv.slice(2);
const cfg = JSON.parse(readFileSync(join(repo, 'vercel.json'), 'utf8'));
const { routes } = ru.getTransformedRoutes({ trailingSlash: cfg.trailingSlash, redirects: cfg.redirects, headers: cfg.headers });
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
};

createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const host = (req.headers.host ?? '').split(':')[0];
  const headers = {};
  let out = null;
  for (const r of routes) {
    if (r.has && !r.has.every((h) => h.type === 'host' && new RegExp(`^${h.value}$`).test(host))) continue;
    const m = new RegExp(r.src).exec(url.pathname);
    if (!m) continue;
    if (r.status && r.headers?.Location) {
      const loc = r.headers.Location.replace(/\$(\d+)/g, (_, n) => m[Number(n)] ?? '') + url.search;
      out = { status: r.status, headers: { ...headers, Location: loc } };
      break;
    }
    if (r.continue) { Object.assign(headers, r.headers); continue; }
    if (!r.dest) break;
  }
  if (!out) {
    const p = decodeURIComponent(url.pathname);
    let file = p.endsWith('/') ? join(dist, p, 'index.html') : join(dist, p);
    let status = 200;
    if (!existsSync(file) || !statSync(file).isFile()) { file = join(dist, '404.html'); status = 404; }
    out = { status, headers: { ...headers, 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' }, file };
  }
  if (log) appendFileSync(log, `${new Date().toISOString()} ${req.method} ${host}${req.url} ${out.status} ${JSON.stringify(out.headers)}\n`);
  res.writeHead(out.status, out.headers);
  if (out.file && req.method !== 'HEAD') res.end(readFileSync(out.file));
  else res.end();
}).listen(Number(port), '127.0.0.1', () => console.log(`serve-vercel ${dist} en http://localhost:${port}`));
