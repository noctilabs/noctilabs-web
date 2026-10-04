// Comprobación estática del build con F10 (ES y EN).
import { readFileSync, existsSync } from 'node:fs';
const dist = process.argv[2];
const out = [];
const ok = (name, cond, detail = '') => out.push(`${cond ? 'OK ' : 'FALLA'} ${name}${detail ? ` — ${detail}` : ''}`);
const body = (p) => { const h = readFileSync(`${dist}/${p}/index.html`, 'utf8'); const i = h.indexOf('<div class="prose-article"'); return [h, h.slice(i, h.indexOf('</div>', i))]; };

for (const pre of ['', 'en/']) {
  const [th, tb] = body(`${pre}insights/no-context-no-intelligence`);
  ok(`P3#1 ${pre || 'es/'} tesis publicada sin el bloque con style objeto`, !/No debe verse/.test(tb) && /prose-article/.test(th));
  const [, mb] = body(`${pre}insights/gate-marca-num`);
  const [mh] = body(`${pre}insights/gate-marca-num`);
  const min = /(\d+) (min de lectura|min read)/.exec(mh)?.[1];
  ok(`P3#2 ${pre || 'es/'} gate-marca-num: muestra las 500 palabras y «Hola.», 3 min`, (mb.match(/palabra/g) ?? []).length === 500 && /Hola\./.test(mb) && min === '3', `minutos=${min}`);
  const [, db] = body(`${pre}insights/gate-markdefs`);
  ok(`P3#2 ${pre || 'es/'} gate-markdefs: texto visible y link válido`, /Texto con <a href="\/buscar\/\?q=dos%20palabras">link<\/a> y fin\./.test(db), db.slice(0, 200));
  const [, eb] = body(`${pre}insights/gate-espacios`);
  ok(`P3#3 ${pre || 'es/'} mailto conserva el asunto con el espacio codificado`, eb.includes('href="mailto:hola@noctilabs.io?subject=Hola%20Nocti"'));
  ok(`P3#3 ${pre || 'es/'} «java<TAB>script:» se descarta`, !/script:alert|javascript/.test(eb) && /Tab/.test(eb));
}
ok('las páginas existen', ['gate-marca-num', 'gate-markdefs', 'gate-espacios'].every((p) => existsSync(`${dist}/insights/${p}/index.html`)));
console.log(out.join('\n'));
process.exitCode = out.some((l) => l.startsWith('FALLA')) ? 1 : 0;
