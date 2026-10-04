// Fixture F11 (gate de implementación 002, pasada 4, menores 1 y 2): niveles de lista y links que no resuelven.
import { readFileSync, writeFileSync } from 'node:fs';
const here = new URL('.', import.meta.url);
const real = JSON.parse(readFileSync(new URL('../sanity-actual.json', here), 'utf8')).result;
const thesis = real.find((d) => d._id === 'post-no-context-no-intelligence');
let k = 0;
const key = () => `k${++k}`;
const span = (text, marks = []) => ({ _key: key(), _type: 'span', marks, text });
const item = (text, level, listItem = 'bullet') => ({ _key: key(), _type: 'block', style: 'normal', listItem, level, markDefs: [], children: [span(text)] });
const linked = (text, href) => ({ _key: key(), _type: 'block', style: 'normal', markDefs: [{ _key: 'l', _type: 'link', href }], children: [span(text, ['l'])] });
const body = [
  { _key: key(), _type: 'block', style: 'normal', markDefs: [], children: [span('Lead.')] },
  item('Uno', 1), item('Uno punto uno', 2), item('Dos', 1),
  item('Nivel texto', '2'), item('Nivel objeto', { n: 2 }), item('Sin nivel', undefined),
  item('Numerado', 1, 'number'),
  linked('https vacío', 'https://'), linked('http solo', 'http:'), linked('corchete', 'http://['), linked('válido', 'https://www.noctilabs.io/?q=a b'),
];
const doc = { _id: 'gate-listas', slug: 'gate-listas', slugEs: null, publishedAt: '2026-10-03', listed: true, showOnInsights: true, topic: null, category: null, readingTime: null,
  title: { es: 'Prueba listas', en: 'Test lists' }, excerpt: { es: 'Resumen.', en: 'Excerpt.' }, body: { es: body, en: body } };
writeFileSync(new URL('f11-gate.json', here), JSON.stringify({ result: [thesis, doc] }, null, 1));
console.log('f11-gate.json 2 documentos');
