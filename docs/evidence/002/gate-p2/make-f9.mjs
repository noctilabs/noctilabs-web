// Fixture F9 (gate de implementación 002, pasada 2): categorías heredadas, hijos no admitidos y títulos largos en
// «Seguir leyendo», sobre la tesis real.
import { readFileSync, writeFileSync } from 'node:fs';
const here = new URL('.', import.meta.url);
const real = JSON.parse(readFileSync(new URL('../sanity-actual.json', here), 'utf8')).result;
const thesis = real.find((d) => d._id === 'post-no-context-no-intelligence');

let k = 0;
const key = () => `k${++k}`;
const span = (text) => ({ _key: key(), _type: 'span', marks: [], text });
const block = (children) => ({ _key: key(), _type: 'block', style: 'normal', markDefs: [], children });
const LONG = 'Tituloextremadamentelargo'.repeat(5).slice(0, 120);
const doc = (id, date, more = {}) => ({
  _id: id, slug: id, slugEs: null, publishedAt: date, listed: true, showOnInsights: true, topic: null, category: null, readingTime: null,
  title: { es: `${LONG}${id.slice(-1)}`, en: `${LONG}${id.slice(-1)}` }, excerpt: { es: 'Resumen.', en: 'Excerpt.' },
  body: { es: [block([span('Texto del cuerpo.')])], en: [block([span('Body text.')])] }, ...more,
});
const many = Array.from({ length: 500 }, () => 'palabra').join(' ');

const docs = [
  thesis,
  // P2 #1: categorías que coinciden con propiedades heredadas.
  doc('gate-cat-a', '2026-10-03', { category: { en: 'constructor', es: 'x' } }),
  doc('gate-cat-b', '2026-10-02', { category: { en: '__proto__', es: 'x' } }),
  // P2 #2: un hijo no admitido con 500 palabras y un span válido de una palabra; y un post cuyo único texto está en un hijo no admitido.
  doc('gate-hijo-c', '2026-10-01', { body: { es: [block([{ _key: key(), _type: 'unsupported', text: many }, span('Hola.')])], en: [block([{ _key: key(), _type: 'unsupported', text: many }, span('Hi.')])] } }),
  doc('gate-hijo-d', '2026-09-30', { body: { es: [block([{ _key: key(), _type: 'unsupported', text: 'Texto' }])], en: [block([span('Text.')])] } }),
];
writeFileSync(new URL('f9-gate.json', here), JSON.stringify({ result: docs }, null, 1));
console.log('f9-gate.json', docs.length, 'documentos');
