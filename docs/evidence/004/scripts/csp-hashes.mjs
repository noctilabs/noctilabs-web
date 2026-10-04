// Comprueba que cada <script> y <style> inline de cada HTML tenga su hash en el <meta> CSP de su página,
// y lista qué directivas llevan 'unsafe-inline'. Uso: node csp-hashes.mjs <dist>
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';

const dist = process.argv[2];
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
});
let bad = 0;
let total = 0;
let unsafeBad = 0;
for (const f of walk(dist)) {
  const html = readFileSync(f, 'utf8');
  const csp = /<meta http-equiv="content-security-policy" content="([^"]*)"/.exec(html)?.[1] ?? '';
  const dir = Object.fromEntries(csp.split(';').map((s) => s.trim()).filter(Boolean).map((s) => {
    const [k, ...v] = s.split(/\s+/);
    return [k, v];
  }));
  const items = [];
  for (const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) if (!/\bsrc=/.test(m[1])) items.push(['script-src', m[1], m[2]]);
  for (const m of html.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)) items.push(['style-src', m[1], m[2]]);
  const rel = relative(dist, f).split('\\').join('/');
  const out = [];
  let ld = 0;
  for (const [d, attrs, body] of items) {
    total++;
    const h = `'sha256-${createHash('sha256').update(body).digest('base64')}'`;
    const ok = (dir[d] ?? []).includes(h);
    const data = /type="application\/ld\+json"/.test(attrs);
    if (data) ld++;
    if (!ok) {
      bad++;
      out.push(`  FALTA ${d} ${attrs.trim()} ${h} ${body.slice(0, 60).replace(/\s+/g, ' ')}`);
    }
  }
  const unsafe = Object.entries(dir).filter(([, v]) => v.includes("'unsafe-inline'")).map(([k]) => k);
  if (unsafe.some((k) => k !== 'style-src-attr')) unsafeBad++;
  console.log(`${rel}: csp=${csp ? 'sí' : 'NO'}, ${items.length} inline (${ld} JSON-LD), 'unsafe-inline' solo en [${unsafe.join(', ')}]${out.length ? '\n' + out.join('\n') : ''}`);
}
console.log(`TOTAL inline ${total}; sin hash (JSON-LD incluido) ${bad}; páginas con 'unsafe-inline' fuera de style-src-attr ${unsafeBad}`);
