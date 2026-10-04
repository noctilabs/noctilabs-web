// §2.2: el chequeo del artefacto de build:publish (scripts/publish-guard.mjs, artifactProblems) aplicado a los
// artefactos locales. Con los marcadores presentes, un build PUBLISH=1 falla antes (src/content/legal.ts), así que
// este chequeo se ejercita directamente. Uso: node publish-scan.mjs <repo>
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const repo = process.argv[2];
const { artifactProblems } = await import(pathToFileURL(join(repo, 'scripts/publish-guard.mjs')).href);
let fails = 0;
const ok = (cond, msg) => { if (!cond) fails++; console.log(`${cond ? 'OK   ' : 'FALLA'} ${msg}`); };
const fx = artifactProblems(join(repo, 'dist-fixture'));
ok(fx.some((p) => p.startsWith('NO-PUBLICAR.txt')) && fx.some((p) => p.includes('DATOS DE PRUEBA')) && !fx.some((p) => p.includes('marcador')),
  `dist-fixture/ (prod-prueba): ${fx.length} problemas — NO-PUBLICAR.txt y «DATOS DE PRUEBA», sin marcadores. Ej.: ${fx.slice(0, 3).join(' · ')}`);
const base = artifactProblems(join(repo, 'dist'));
ok(base.length > 0 && base.every((p) => p.includes('marcador legal')), `dist/ (base): ${base.length} problemas, todos marcadores legales. Ej.: ${base.slice(0, 3).join(' · ')}`);
const pages = [...new Set(base.map((p) => p.split(':')[0]))];
console.log(`   páginas con marcadores: ${pages.join(', ')}`);
console.log(`\nRESULTADO chequeo de artefacto: ${fails === 0 ? 'OK' : `${fails} FALLA(S)`}`);
process.exit(fails ? 1 : 0);
