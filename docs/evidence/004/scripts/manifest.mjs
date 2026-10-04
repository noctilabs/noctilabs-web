// Manifiesto de una variante de build (spec 004 §4). Uso:
// node manifest.mjs <variante> <repo> <salida|-> <código de salida> <log> <out.json> [VAR=valor ...]
// Registra commit y árbol limpio, hash del lockfile, variables de entorno de la variante, fixtures (con hash y hora
// del snapshot de Sanity), hash de vercel.json, hashes de los artefactos servidos (HTML, JS, CSS, sitemap.xml) y
// versiones (astro, node, servidor local).
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const [variant, repo, outDir, exitCode, log, out, ...envPairs] = process.argv.slice(2);
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const git = (cmd) => execSync(`git -C "${repo}" ${cmd}`, { encoding: 'utf8' }).trim();
const env = Object.fromEntries(envPairs.map((p) => { const i = p.indexOf('='); return [p.slice(0, i), p.slice(i + 1)]; }));

const artifacts = {};
if (outDir !== '-' && existsSync(outDir)) {
  const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
  for (const f of walk(outDir)) {
    const rel = relative(outDir, f).split('\\').join('/');
    if (/\.(html|js|css)$/.test(rel) || rel === 'sitemap.xml' || rel === 'robots.txt' || rel === 'NO-PUBLICAR.txt') artifacts[rel] = sha(readFileSync(f));
  }
}
const combined = sha(Object.entries(artifacts).sort().map(([k, v]) => `${k} ${v}`).join('\n'));

const fixtures = {};
if (env.INSIGHTS_FIXTURE) {
  const raw = readFileSync(env.INSIGHTS_FIXTURE);
  const consulta = join(env.INSIGHTS_FIXTURE, '..', 'sanity-consulta.txt');
  fixtures.INSIGHTS_FIXTURE = {
    path: env.INSIGHTS_FIXTURE,
    sha256: sha(raw),
    consulta: existsSync(consulta) ? readFileSync(consulta, 'utf8').split('\n')[0] : null,
    docs: JSON.parse(raw).result.map((d) => ({ _id: d._id, _rev: d._rev ?? null })),
  };
}
if (env.LEGAL_FIXTURE) fixtures.LEGAL_FIXTURE = env.LEGAL_FIXTURE;

const logText = existsSync(log) ? readFileSync(log, 'utf8') : '';
const manifest = {
  variant,
  generatedAt: new Date().toISOString(),
  commit: git('rev-parse HEAD'),
  cleanTree: git('status --porcelain') === '',
  lockfileSha256: sha(readFileSync(join(repo, 'package-lock.json'))),
  vercelJsonSha256: sha(readFileSync(join(repo, 'vercel.json'))),
  env,
  fixtures,
  exitCode: Number(exitCode),
  log: { path: log, sha256: sha(logText) },
  diagnostics: logText.split('\n').filter((l) => /\[insights\]|\[legal\]|\[publicación\]|\[redirects\]|error|warning|- \d+ (errors|warnings|hints)/i.test(l)).map((l) => l.replace(/\x1b\[[0-9;]*m/g, '').trim()),
  outDir: outDir === '-' ? null : outDir,
  htmlCount: Object.keys(artifacts).filter((k) => k.endsWith('.html')).length,
  artifactsSha256: combined,
  artifacts,
  versions: {
    node: process.version,
    astro: JSON.parse(readFileSync(join(repo, 'node_modules/astro/package.json'), 'utf8')).version,
    vercelAnalytics: JSON.parse(readFileSync(join(repo, 'node_modules/@vercel/analytics/package.json'), 'utf8')).version,
    server: 'astro preview (astro 7.3.5) / serve-vercel.mjs (scratchpad, node)',
  },
};
writeFileSync(out, `${JSON.stringify(manifest, null, 1)}\n`);
console.log(`${variant}: exit ${exitCode}, ${manifest.htmlCount} HTML, artefactos ${combined.slice(0, 12)}, commit ${manifest.commit.slice(0, 7)}, limpio ${manifest.cleanTree}`);
