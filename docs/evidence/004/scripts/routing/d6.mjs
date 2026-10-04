// D6 (spec 004 §5): compila vercel.json con @vercel/routing-utils y ejecuta la matriz de §2.9 contra dist/.
// Uso: node d6.mjs <repo> > d6.txt
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const req = createRequire(import.meta.url);
const ru = req('@vercel/routing-utils');
const RU_VERSION = req('@vercel/routing-utils/package.json').version;
const repo = process.argv[2];
const dist = join(repo, 'dist');
const cfgText = readFileSync(join(repo, 'vercel.json'), 'utf8');
const cfg = JSON.parse(cfgText);
const { routes, error } = ru.getTransformedRoutes({ trailingSlash: cfg.trailingSlash, redirects: cfg.redirects, headers: cfg.headers });
if (error) throw new Error(JSON.stringify(error));

let fails = 0;
const ok = (cond, msg) => { if (!cond) fails++; console.log(`${cond ? 'OK   ' : 'FALLA'} ${msg}`); };
const NOTFOUND = readFileSync(join(dist, '404.html'), 'utf8');

/** Archivo de dist/ que sirve un path, como el filesystem de Vercel con trailingSlash y build.format directory. */
function fileFor(path) {
  const p = decodeURIComponent(path);
  const candidates = p.endsWith('/') ? [join(dist, p, 'index.html')] : [join(dist, p)];
  return candidates.find((f) => existsSync(f) && statSync(f).isFile()) ?? null;
}

/** Un paso del enrutamiento: fase de rutas compiladas (en orden) y después el filesystem. */
function step(url, host) {
  const [path, query = ''] = url.split('?');
  const headers = {};
  for (const [i, r] of routes.entries()) {
    if (r.has && !r.has.every((h) => h.type === 'host' && new RegExp(`^${h.value}$`).test(host))) continue;
    const m = new RegExp(r.src).exec(path);
    if (!m) continue;
    if (r.status && r.headers?.Location) {
      let loc = r.headers.Location.replace(/\$(\d+)/g, (_, n) => m[Number(n)] ?? '');
      // Vercel reenvía la query del pedido en los redirects (comportamiento de la plataforma, simulado aquí).
      if (query && !loc.includes('?')) loc += `?${query}`;
      return { kind: 'redirect', status: r.status, location: loc, rule: i, src: r.src, headers };
    }
    if (r.continue) { Object.assign(headers, r.headers); continue; }
    if (!r.dest) break;  // ruta sin destino (.well-known): termina la fase de rutas
  }
  const file = fileFor(path);
  if (file) return { kind: 'file', status: 200, file, headers };
  return { kind: 'file', status: 404, file: join(dist, '404.html'), headers };
}

/** Cadena completa de saltos hasta una respuesta 200/404. */
function chain(url, host = 'www.noctilabs.io') {
  const hops = [];
  let cur = url;
  for (let i = 0; i < 6; i++) {
    const r = step(cur, host);
    hops.push({ url: cur, ...r });
    if (r.kind !== 'redirect') break;
    cur = r.location;
  }
  return hops;
}
const show = (hops) => hops.map((h) => h.kind === 'redirect'
  ? `${h.url} --${h.status} [regla ${h.rule} ${h.src}]--> ${h.location}`
  : `${h.url} => ${h.status} ${h.file.slice(dist.length).split('\\').join('/')}`).join('  |  ');

console.log(`@vercel/routing-utils ${RU_VERSION}; vercel.json sha256 ${createHash('sha256').update(cfgText).digest('hex')}`);
console.log(`rutas compiladas: ${routes.length}`);
routes.forEach((r, i) => console.log(`  [${i}] ${JSON.stringify(r)}`));
const NORMALIZE = routes.findIndex((r) => r.headers?.Location === '/$1/');
const migration = (h) => h.kind === 'redirect' && h.rule !== NORMALIZE && h.rule !== NORMALIZE + 1;

console.log('\n## Redirects de migración (§2.9)');
const MATRIX = [
  ['/company', '/en/about/'], ['/book-a-call', '/en/contact/'], ['/blog', '/en/insights/'],
  ['/blog/no-context-no-intelligence', '/en/insights/no-context-no-intelligence/'],
];
const cases = [];
for (const [base, dest] of MATRIX) for (const v of [base, `${base}/`, `${base}.html`]) cases.push([v, dest]);
for (const v of ['/services', '/services/', '/es', '/es/', '/index.html']) cases.push([v, '/']);
for (const [src, dest] of cases) {
  for (const q of ['', '?utm=x']) {
    const hops = chain(src + q);
    const last = hops.at(-1);
    const final = hops.at(-2)?.location ?? null;
    const anyMigration = hops.some(migration);
    const destOk = last.status === 200 && last.file === join(dist, ...dest.split('/').filter(Boolean), 'index.html');
    const queryOk = !q || hops.filter((h) => h.kind === 'redirect').every((h) => h.location.endsWith(q));
    ok(anyMigration && destOk && queryOk && final === dest + q, `${src}${q}: ${show(hops)}${q ? ` · query conservada: ${queryOk}` : ''}`);
  }
}

console.log('\n## Bajas sin reemplazo y paths desconocidos: ningún redirect de migración, 404 con el cuerpo de la 404');
const SLUGS = ['introducing-noctilabs', 'production-gap', 'opportunity-audit', 'model-agnostic', 'legacy-stacks', 'agent-reconciliation', 'platform-engineering'];
const bajas = [];
for (const s of SLUGS) {
  bajas.push([`/blog/${s}`, true], [`/blog/${s}/`, false], [`/blog/${s}.html`, false]);
  bajas.push([`/blog-post-${s}`, true], [`/blog-post-${s}/`, false], [`/blog-post-${s}.html`, false]);
}
bajas.push(['/blog/desconocido', true], ['/blog/desconocido/', false], ['/blog/desconocido.html', false]);
bajas.push(['/services.html', false], ['/es.html', false]);
for (const [src, sinBarra] of bajas) {
  for (const q of ['', '?utm=x']) {
    const hops = chain(src + q);
    const last = hops.at(-1);
    const noMigration = !hops.some(migration);
    const body404 = last.status === 404 && readFileSync(last.file, 'utf8') === NOTFOUND;
    const shape = sinBarra
      ? hops.length === 2 && hops[0].rule === NORMALIZE && hops[0].location === `${src}/${q}`
      : hops.length === 1;
    const notInDist = !existsSync(join(dist, ...src.split('/').filter(Boolean))) && !existsSync(join(dist, ...src.split('/').filter(Boolean), 'index.html'));
    ok(noMigration && body404 && shape && notInDist, `${src}${q}: ${show(hops)}${sinBarra ? ' (solo la normalización 308 de trailingSlash)' : ' (404 directo)'}`);
  }
}

console.log('\n## Cabeceras (§2.8) y noindex de previews (§2.1)');
const EXPECT = {
  'Content-Security-Policy': "frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Frame-Options': 'DENY',
};
for (const [url, host, status] of [['/', 'www.noctilabs.io', 200], ['/hablemos/', 'www.noctilabs.io', 200], ['/no-existe/', 'www.noctilabs.io', 404], ['/', 'noctilabs-web-git-x-noctilabs.vercel.app', 200], ['/no-existe/', 'noctilabs-web-abc123.vercel.app', 404]]) {
  const r = step(url, host);
  const preview = host.endsWith('.vercel.app');
  const hdrOk = Object.entries(EXPECT).every(([k, v]) => r.headers[k] === v) && !('default-src' in r.headers);
  const robots = r.headers['X-Robots-Tag'];
  ok(r.status === status && hdrOk && (preview ? robots === 'noindex' : robots === undefined),
    `${host}${url} → ${r.status}; cabeceras ${JSON.stringify(r.headers)}`);
}
ok(!Object.values(EXPECT).join(' ').includes('default-src'), 'la cabecera CSP no declara default-src');

console.log(`\nRESULTADO D6 (routing-utils): ${fails === 0 ? 'OK' : `${fails} FALLA(S)`}`);
process.exitCode = fails ? 1 : 0;
