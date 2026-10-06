// Integración del build (spec 004 §2.2): fixture legal y perfil de publicación.
// - LEGAL_FIXTURE=1: la salida va a dist-fixture/ (astro.config.mjs) y se escribe NO-PUBLICAR.txt.
// - PUBLISH=1 (npm run build:publish): falla con LEGAL_FIXTURE o INSIGHTS_FIXTURE definidos, sin la clave de
//   Web3Forms, o si el artefacto contiene marcadores legales, NO-PUBLICAR.txt o «DATOS DE PRUEBA».
// Vale aunque el proyecto de Vercel no exponga VERCEL ni VERCEL_ENV.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALLOW_PENDING_LAUNCH } from '../src/site.mjs';

export const LEGAL_MARKERS = ['[RAZÓN SOCIAL]', '[RUT]', '[DOMICILIO]'];
const TEST_TEXT = 'DATOS DE PRUEBA';
const STOP_FILE = 'NO-PUBLICAR.txt';
const TEXT_EXT = new Set(['.html', '.xml', '.txt', '.js', '.mjs', '.css', '.json', '.svg', '.webmanifest']);

function* files(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else yield path;
  }
}

/** Problemas del artefacto publicable en `dir` (vacío si está limpio). */
export function artifactProblems(dir, { markers = true, testData = true } = {}) {
  const problems = [];
  for (const path of files(dir)) {
    const rel = relative(dir, path).replaceAll('\\', '/');
    if (testData && rel === STOP_FILE) problems.push(`${rel}: el artefacto tiene ${STOP_FILE}`);
    if (!TEXT_EXT.has(extname(path))) continue;
    const text = readFileSync(path, 'utf8');
    if (markers) for (const m of LEGAL_MARKERS) if (text.includes(m)) problems.push(`${rel}: marcador legal ${m}`);
    if (testData && text.includes(TEST_TEXT)) problems.push(`${rel}: texto «${TEST_TEXT}»`);
  }
  return problems;
}

export function publishGuard() {
  const env = process.env;
  const publish = env.PUBLISH === '1';
  const fixture = env.LEGAL_FIXTURE === '1';
  return {
    name: 'noctilabs:publish-guard',
    hooks: {
      'astro:config:setup': () => {
        if (!publish) return;
        const fixtures = ['LEGAL_FIXTURE', 'INSIGHTS_FIXTURE'].filter((k) => env[k] !== undefined);
        if (fixtures.length) throw new Error(`[publicación] PUBLISH=1 no admite ${fixtures.join(' ni ')} definidos.`);
        // Con ALLOW_PENDING_LAUNCH (src/site.mjs) se publica sin la clave: Hablemos muestra el contacto por mail.
        if (!env.PUBLIC_WEB3FORMS_KEY && !ALLOW_PENDING_LAUNCH) throw new Error('[publicación] falta PUBLIC_WEB3FORMS_KEY (clave pública de Web3Forms).');
      },
      'astro:build:done': ({ dir }) => {
        const out = fileURLToPath(dir);
        if (fixture) {
          writeFileSync(join(out, STOP_FILE), 'Build con LEGAL_FIXTURE=1: datos legales sintéticos. NO PUBLICAR.\n');
        }
        const production = env.VERCEL_ENV === 'production' && !fixture;
        if (!publish && !production) return;
        const problems = artifactProblems(out, { markers: true, testData: publish });
        if (problems.length) {
          throw new Error(`[publicación] el artefacto no es publicable:\n  ${problems.slice(0, 20).join('\n  ')}`);
        }
      },
    },
  };
}
