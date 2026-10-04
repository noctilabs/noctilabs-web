// Consulta la misma GROQ que el loader y guarda la respuesta con la hora.
import { writeFileSync } from 'node:fs';
const QUERY = `*[_type == "post"]{
  _id, _rev, "slug": slug.current, "slugEs": slugEs.current, publishedAt, listed, showOnInsights, topic,
  category, readingTime, title, excerpt, body
}`;
const url = `https://q164hlpj.api.sanity.io/v2025-02-19/data/query/production?perspective=published&query=${encodeURIComponent(QUERY)}`;
const hora = new Date().toISOString();
const res = await fetch(url);
const json = await res.json();
writeFileSync(new URL('./sanity-snapshot.json', import.meta.url), JSON.stringify(json, null, 1));
console.log('consulta', hora, 'HTTP', res.status, 'docs', json.result.length);
for (const p of json.result) console.log(p._id, '|', p.slug, '|', p.slugEs ?? '-', '|', p.publishedAt, '| listed', p.listed, '| showOnInsights', p.showOnInsights ?? '-', '| topic', p.topic ?? '-', '| readingTime', p.readingTime ?? '-', '| body es', Array.isArray(p.body?.es) ? p.body.es.length : '-', '| body en', Array.isArray(p.body?.en) ? p.body.en.length : '-', '|', p.title?.es ?? '-', '/', p.title?.en ?? '-');
