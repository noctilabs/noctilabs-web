// Comprobación del build publicable (spec 004 §2.9): cada destino de los redirects de vercel.json existe en el
// dist/ recién generado. Escribe dist-manifest.json fuera del artefacto con el commit, el lockfile, el snapshot
// efectivo de Sanity (ids y _rev) y los redirects comprobados.
// Uso: node scripts/check-redirects.mjs [--config vercel.json] [--dist dist] [--manifest dist-manifest.json]
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const configPath = opt('config', 'vercel.json');
const dist = opt('dist', 'dist');
const manifestPath = opt('manifest', 'dist-manifest.json');

const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const git = (cmd) => {
  try {
    return execSync(`git ${cmd}`, { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
};

/** Archivo de dist/ que sirve un destino con barra final (trailingSlash: true, build.format: 'directory'). */
const fileFor = (destination) => join(dist, ...destination.split('/').filter(Boolean), 'index.html');

const config = JSON.parse(readFileSync(configPath, 'utf8'));
const checked = (config.redirects ?? []).map(({ source, destination, permanent }) => {
  const problems = [];
  // Spec 009 G3: el destino puede llevar un fragmento; se comprueba la ruta y que su HTML tenga ese id.
  const hash = destination.indexOf('#');
  const path = hash < 0 ? destination : destination.slice(0, hash);
  const fragment = hash < 0 ? undefined : destination.slice(hash + 1);
  if (!/^\/([a-z0-9-]+\/)*$/.test(path)) problems.push('el destino no es una ruta interna con barra final');
  else if (!existsSync(fileFor(path))) problems.push(`no existe ${fileFor(path)}`);
  else if (fragment !== undefined && !(/^[a-z0-9-]+$/.test(fragment) && new RegExp(`\\sid="${fragment}"`).test(readFileSync(fileFor(path), 'utf8')))) {
    problems.push(`${fileFor(path)} no tiene id="${fragment}"`);
  }
  if (permanent !== true) problems.push('no es permanente');
  return { source, destination, ok: problems.length === 0, problems };
});

const snapshotPath = join('.astro', 'insights-snapshot.json');
const manifest = {
  generatedAt: new Date().toISOString(),
  commit: git('rev-parse HEAD'),
  cleanTree: git('status --porcelain') === '',
  lockfileSha256: sha256('package-lock.json'),
  vercelJson: { path: configPath, sha256: sha256(configPath) },
  env: Object.fromEntries(['PUBLISH', 'VERCEL', 'VERCEL_ENV', 'LEGAL_FIXTURE', 'INSIGHTS_FIXTURE'].map((k) => [k, process.env[k] ?? null])),
  sanity: existsSync(snapshotPath) ? JSON.parse(readFileSync(snapshotPath, 'utf8')) : null,
  redirects: checked,
};
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const broken = checked.filter((r) => !r.ok);
for (const r of checked) console.log(`${r.ok ? 'ok   ' : 'FALLA'} ${r.source} -> ${r.destination}${r.ok ? '' : ` (${r.problems.join('; ')})`}`);
console.log(`[redirects] ${checked.length - broken.length}/${checked.length} destinos presentes en ${dist}; manifiesto en ${manifestPath}`);
if (broken.length) {
  console.error(`[redirects] ${broken.length} redirect(s) con destino roto: el build no es publicable.`);
  process.exit(1);
}
