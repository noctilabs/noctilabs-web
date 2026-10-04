// Fixture F10 (gate de implementación 002, pasada 3): estilos que no son texto, marcas y definiciones inválidas, y
// links con espacios internos, sobre la tesis real.
import { readFileSync, writeFileSync } from 'node:fs';
const here = new URL('.', import.meta.url);
const real = JSON.parse(readFileSync(new URL('../sanity-actual.json', here), 'utf8')).result;
const thesis = structuredClone(real.find((d) => d._id === 'post-no-context-no-intelligence'));
// P3 #1: un bloque con `style` objeto (con su propio toString) en la tesis, en los dos idiomas.
for (const l of ['es', 'en']) thesis.body[l].push({ _key: 'malo', _type: 'block', style: { toString: 'invalido' }, markDefs: [], children: [{ _key: 's', _type: 'span', marks: [], text: 'No debe verse.' }] });

let k = 0;
const key = () => `k${++k}`;
const many = Array.from({ length: 500 }, () => 'palabra').join(' ');
const doc = (id, date, body) => ({
  _id: id, slug: id, slugEs: null, publishedAt: date, listed: true, showOnInsights: true, topic: null, category: null, readingTime: null,
  title: { es: `Prueba ${id}`, en: `Test ${id}` }, excerpt: { es: 'Resumen.', en: 'Excerpt.' }, body: { es: body, en: body },
});
const block = (children, markDefs = []) => ({ _key: key(), _type: 'block', style: 'normal', markDefs, children });
const span = (text, marks = []) => ({ _key: key(), _type: 'span', marks, text });

const docs = [
  thesis,
  // P3 #2: un span de 500 palabras con una marca numérica y «Hola.»; el texto se muestra y cuenta (la marca se ignora).
  doc('gate-marca-num', '2026-10-03', [block([span(many, [42]), span(' Hola.')])]),
  // P3 #2: markDefs con una definición vacía y un link válido; el texto se muestra con su link.
  doc('gate-markdefs', '2026-10-02', [block([span('Texto con ', []), span('link', ['l1']), span(' y fin.', ['zz'])], [{}, { _key: 'l1', _type: 'link', href: '/buscar/?q=dos palabras' }])]),
  // P3 #3: links con espacios internos, que se conservan codificados.
  doc('gate-espacios', '2026-10-01', [block([span('Mail', ['m1'])], [{ _key: 'm1', _type: 'link', href: 'mailto:hola@noctilabs.io?subject=Hola Nocti' }]),
    block([span('Tab', ['t1'])], [{ _key: 't1', _type: 'link', href: 'java\tscript:alert(1)' }])]),
];
writeFileSync(new URL('f10-gate.json', here), JSON.stringify({ result: docs }, null, 1));
console.log('f10-gate.json', docs.length, 'documentos');
