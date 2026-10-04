// D1 (spec 004 §5): por variante, código de salida, conteo de HTML (22 + 2N + 1) y diagnósticos clasificados en
// esperados (enumerados) e inesperados. Uso: node d1.mjs <dir builds>
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
let fails = 0;
const ok = (cond, msg) => { if (!cond) fails++; console.log(`${cond ? 'OK   ' : 'FALLA'} ${msg}`); };
const clean = (l) => l.replace(/\x1b\[[0-9;]*m/g, '').replace(/^\d\d:\d\d:\d\d\s+/, '').trim();
const DIAG = /warn|error|\[insights\]|\[legal\]|\[publicación\]|\[redirects\]|ts\(\d+\)|hint/i;
const EXPECTED_OK = [/^- 0 (errors|warnings|hints)$/, /^\[insights\] excluido: /, /^\[insights\] [\w-]+: bloque no admitido /];
const EXPECTED_FAIL = {
  'publish-falla-marcadores': [/\[legal\] faltan los datos del responsable/, /^- 0 (errors|warnings|hints)$/, /^\[insights\] excluido: /, /^\s*at /, /^Stack trace:/, /^Location:/, /^error\s+/],
  'prod-bloqueada': [/\[legal\] faltan los datos del responsable/, /^- 0 (errors|warnings|hints)$/, /^\[insights\] excluido: /, /^\s*at /, /^Stack trace:/, /^Location:/, /^error\s+/],
  'publish-falla-legal-fixture': [/\[publicación\] PUBLISH=1 no admite LEGAL_FIXTURE/, /^\s*at /, /^Stack trace:/, /^Location:/, /^error\s+/],
  'publish-falla-insights-fixture': [/\[publicación\] PUBLISH=1 no admite INSIGHTS_FIXTURE/, /^\s*at /, /^Stack trace:/, /^Location:/, /^error\s+/],
  'publish-falla-sin-clave': [/\[publicación\] falta PUBLIC_WEB3FORMS_KEY/, /^\s*at /, /^Stack trace:/, /^Location:/, /^error\s+/],
};
// Astro envuelve el error de un hook de integración con esta línea propia.
const HOOK = /\[noctilabs:publish-guard\] An unhandled error occurred while running the "astro:config:setup" hook/;
for (const v of ['publish-falla-legal-fixture', 'publish-falla-insights-fixture', 'publish-falla-sin-clave']) EXPECTED_FAIL[v].push(HOOK);
const VARIANTS = ['base', 'prod-prueba', 'adversarial', 'prod-bloqueada', 'publish-falla-marcadores', 'publish-falla-legal-fixture', 'publish-falla-insights-fixture', 'publish-falla-sin-clave'];
const N = 1;
for (const v of VARIANTS) {
  const m = JSON.parse(readFileSync(join(dir, `${v}.json`), 'utf8'));
  const lines = readFileSync(join(dir, `${v}.log`), 'utf8').split('\n').map(clean).filter((l) => DIAG.test(l) && !/^inicio .* salida \d+$/.test(l));
  const fail = v in EXPECTED_FAIL;
  const pats = fail ? EXPECTED_FAIL[v] : EXPECTED_OK;
  const unexpected = lines.filter((l) => !pats.some((p) => p.test(l)));
  const expected = [...new Set(lines.filter((l) => pats.some((p) => p.test(l))))];
  const html = m.htmlCount;
  console.log(`\n## ${v} — commit ${m.commit.slice(0, 7)} (árbol limpio: ${m.cleanTree}), lockfile ${m.lockfileSha256.slice(0, 12)}, salida ${m.exitCode}, ${html} HTML, artefactos ${m.artifactsSha256.slice(0, 12)}`);
  console.log(`   entorno: ${Object.entries(m.env).map(([k, x]) => `${k}=${k === 'INSIGHTS_FIXTURE' ? '<snapshot>' : x}`).join(' ') || '(ninguna variable de la matriz)'}`);
  for (const l of expected) console.log(`   esperado: ${l.slice(0, 200)}`);
  for (const l of unexpected) console.log(`   INESPERADO: ${l.slice(0, 200)}`);
  if (fail) ok(m.exitCode !== 0 && unexpected.length === 0 && expected.some((l) => /\[legal\]|\[publicación\]/.test(l)), `${v}: el build falla por el motivo esperado y sin otros diagnósticos`);
  else ok(m.exitCode === 0 && html === 22 + 2 * N + 1 && unexpected.length === 0, `${v}: salida 0, ${html} HTML = 22 + 2N + 1 (N = ${N}), 0 errores/avisos de tipos, 0 diagnósticos inesperados, ${expected.filter((l) => l.startsWith('[insights]')).length} avisos editoriales esperados`);
}
const t = readFileSync(join(dir, 's1-tests.log'), 'utf8');
const tests = /Tests\s+(\d+) passed \((\d+)\)/.exec(clean(t.split('\n').find((l) => /Tests/.test(l)) ?? ''));
ok(tests && tests[1] === tests[2] && /vitest salida 0/.test(t), `S1 (vitest): ${tests?.[1]}/${tests?.[2]} en verde con el origen www y privacidad`);
console.log(`\nRESULTADO D1: ${fails === 0 ? 'OK' : `${fails} FALLA(S)`}`);
process.exit(fails ? 1 : 0);
