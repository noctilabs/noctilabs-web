// Comprobación estática del build con F9: categorías heredadas, hijos no admitidos y minutos.
import { readFileSync, existsSync } from 'node:fs';
const dist = process.argv[2];
const page = (p) => readFileSync(`${dist}/${p}/index.html`, 'utf8');
const out = [];
const ok = (name, cond, detail = '') => out.push(`${cond ? 'OK ' : 'FALLA'} ${name}${detail ? ` — ${detail}` : ''}`);

for (const id of ['gate-cat-a', 'gate-cat-b']) {
  for (const p of [`insights/${id}`, `en/insights/${id}`]) {
    const ex = existsSync(`${dist}/${p}/index.html`);
    const h = ex ? page(p) : '';
    const header = h.slice(h.indexOf('<header'), h.indexOf('id="art-title"'));
    ok(`P2#1 ${p} se publica sin categoría`, ex && !/function|undefined|\[object/.test(header) && !/<p[^>]*kicker/i.test(header.replace(/<header[^>]*>/, '')), ex ? '' : 'no existe');
  }
}
const c = page('insights/gate-hijo-c');
const minutes = /(\d+) min de lectura/.exec(c)?.[1];
ok('P2#2 gate-hijo-c: el hijo no admitido no cuenta minutos', minutes === '1', `minutos=${minutes}`);
ok('P2#2 gate-hijo-c: el cuerpo muestra solo el span válido', /Hola\./.test(c) && !/palabra palabra/.test(c));
ok('P2#2 gate-hijo-d: sin texto renderizable en ES, excluido', !existsSync(`${dist}/insights/gate-hijo-d/index.html`) && !existsSync(`${dist}/en/insights/gate-hijo-d/index.html`));
console.log(out.join('\n'));
process.exitCode = out.some((l) => l.startsWith('FALLA')) ? 1 : 0;
