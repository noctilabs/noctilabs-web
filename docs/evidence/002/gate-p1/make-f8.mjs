// Fixture F8 (gate de implementación 002, pasada 1): un documento por hallazgo, sobre la tesis real.
import { readFileSync, writeFileSync } from 'node:fs';
const here = new URL('.', import.meta.url);
const real = JSON.parse(readFileSync(new URL('../sanity-actual.json', here), 'utf8')).result;
const thesis = real.find((d) => d._id === 'post-no-context-no-intelligence');

let k = 0;
const key = () => `k${++k}`;
const span = (text, marks = []) => ({ _key: key(), _type: 'span', marks, text });
const block = (text, style = 'normal', extra = {}) => ({ _key: key(), _type: 'block', style, markDefs: [], children: [span(text)], ...extra });
const linked = (text, href) => {
  const m = key();
  return { _key: key(), _type: 'block', style: 'normal', markDefs: [{ _key: m, _type: 'link', href }], children: [span(text, [m])] };
};
const LONG = 'Identificadorlargo'.repeat(7).slice(0, 120);
const doc = (id, slug, date, body, more = {}) => ({
  _id: id, slug, slugEs: null, publishedAt: date, listed: true, showOnInsights: true, topic: null, category: null, readingTime: null,
  title: { es: `Prueba ${slug}`, en: `Test ${slug}` }, excerpt: { es: `Resumen ${slug}`, en: `Excerpt ${slug}` },
  body: { es: body, en: body }, ...more,
});

const docs = [
  thesis,
  // H1: un bloque nulo en el cuerpo ES no tira el build: se ignora con aviso y el artículo se publica.
  doc('gate-nulo', 'gate-nulo', '2026-10-01', [block('Párrafo válido.')], { body: { es: [null, block('Párrafo válido.')], en: [block('Valid paragraph.')] } }),
  // H1: readingTime de otro tipo excluye ese documento con motivo.
  doc('gate-minutos', 'gate-minutos', '2026-10-01', [block('Texto.')], { readingTime: '5' }),
  // H2 a H5 y H10 en un mismo artículo.
  doc('gate-cuerpo', 'gate-cuerpo', '2026-10-02', [
    block(`Lead con WhatsApp y Nocti. ${LONG}`),
    block('Contexto', 'h2'), block('Contexto', 'h2'), block('Contexto 2', 'h2'), block('Toc title', 'h2'), block(LONG, 'h2'),
    linked('Relativo con puntos', '../otro-articulo/'), linked('Relativo simple', 'otro-articulo/'), linked('Relativo query', './?x=1'),
    linked('Javascript', 'javascript:alert(1)'), linked('Protocolo relativo', '//evil.example/'), linked('Barra invertida', '/\\evil.example/'),
    block('Lista con h3', 'h3', { listItem: 'bullet', level: 1 }), block('Lista check', 'normal', { listItem: 'check', level: 1 }),
    block('Ítem válido', 'normal', { listItem: 'bullet', level: 1 }),
    block(LONG, 'blockquote'),
  ], { excerpt: { es: `Resumen ${LONG}`, en: `Excerpt ${LONG}` } }),
];
writeFileSync(new URL('f8-gate.json', here), JSON.stringify({ result: docs }, null, 1));
console.log('f8-gate.json', docs.length, 'documentos');
