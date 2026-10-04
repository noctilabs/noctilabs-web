// B2 (spec 002): compara el HTML de dist/ contra b2-esperados.json. Uso: node docs/evidence/002/b2-comparar.mjs dist
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const dist = process.argv[2] || 'dist';
const exp = JSON.parse(readFileSync(new URL('./b2-esperados.json', import.meta.url), 'utf8'));
const decode = (s) => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const one = (html, re) => { const m = html.match(re); return m ? decode(m[1]) : null; };
const text = (s) => s === null ? null : decode(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const read = (p) => readFileSync(join(dist, p.endsWith('/') ? p + 'index.html' : p), 'utf8');

const rows = [];
let fails = 0;
const cmp = (path, field, esperado, obtenido) => {
  const ok = JSON.stringify(esperado) === JSON.stringify(obtenido);
  if (!ok) fails++;
  rows.push(`${ok ? 'OK   ' : 'FALLA'} ${path} ${field}: esperado ${JSON.stringify(esperado)}${ok ? '' : ' · obtenido ' + JSON.stringify(obtenido)}`);
};

// Rutas generadas: todas las index.html de dist/ (la 404 aparte).
const generadas = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f === 'index.html') generadas.push('/' + relative(dist, d).split(sep).filter(Boolean).map((s) => s + '/').join(''));
  }
})(dist);
const esperadas = exp.paginas.flatMap((p) => [p.es, p.en]);
cmp('dist/', 'cantidad de rutas', exp.rutasTotales, generadas.length);
cmp('dist/', 'rutas generadas = esperadas', [...esperadas].sort(), [...generadas].sort());

for (const p of exp.paginas) {
  for (const [i, loc] of [[0, 'es'], [1, 'en']]) {
    const path = p[loc];
    const other = loc === 'es' ? p.en : p.es;
    if (!existsSync(join(dist, path, 'index.html'))) { cmp(path, 'existe', true, false); continue; }
    const html = read(path);
    cmp(path, 'lang', loc, one(html, /<html[^>]*\blang="([^"]+)"/));
    cmp(path, 'canonical', exp.origen + path, one(html, /<link rel="canonical" href="([^"]+)"/));
    cmp(path, 'hreflang es', exp.origen + p.es, one(html, /<link[^>]*hreflang="es" href="([^"]+)"/));
    cmp(path, 'hreflang en', exp.origen + p.en, one(html, /<link[^>]*hreflang="en" href="([^"]+)"/));
    cmp(path, 'hreflang x-default', exp.origen + p.es, one(html, /<link[^>]*hreflang="x-default" href="([^"]+)"/));
    cmp(path, 'title', p.title[i], one(html, /<title>([^<]+)<\/title>/));
    cmp(path, 'description', p.desc[i], one(html, /<meta name="description" content="([^"]*)"/));
    const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => text(m[1]));
    cmp(path, 'h1 (texto, único)', [p.h1[i]], h1s);
    const switches = [...html.matchAll(/<a\b[^>]*>/g)].map((m) => m[0])
      .filter((tag) => { const hl = tag.match(/hreflang="(es|en)"/); return hl && new RegExp(`\\blang="${hl[1]}"`).test(tag); })
      .map((tag) => tag.match(/href="([^"]+)"/)[1]);
    cmp(path, 'selector → equivalente (footer y menú mobile)', [other, other], switches);
  }
}

const h = read(exp.p404.archivo);
cmp('/404.html', 'lang', exp.p404.lang, one(h, /<html[^>]*\blang="([^"]+)"/));
cmp('/404.html', 'title', exp.p404.title, one(h, /<title>([^<]+)<\/title>/));
cmp('/404.html', 'robots', exp.p404.robots, one(h, /<meta name="robots" content="([^"]+)"/));
cmp('/404.html', 'h1', [exp.p404.h1], [...h.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => text(m[1])));
cmp('/404.html', 'sin canonical', null, one(h, /<link rel="canonical" href="([^"]+)"/));
cmp('/404.html', 'sin hreflang', null, one(h, /<link[^>]*hreflang="(es|en|x-default)"/));
cmp('/404.html', 'sin selector de idioma', null, one(h, /<span aria-current="true"[^>]*>([A-Z]{2})<\/span>/));

console.log(rows.join('\n'));
console.log(`\n${rows.length - fails}/${rows.length} OK`);
process.exit(fails ? 1 : 0);
