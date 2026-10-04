// A4 (spec 001): compara el HTML de dist/ contra a4-esperados.json. Uso: node docs/evidence/001/a4-comparar.mjs dist
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = process.argv[2] || 'dist';
const exp = JSON.parse(readFileSync(new URL('./a4-esperados.json', import.meta.url), 'utf8'));
const decode = (s) => s.replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"');
const one = (html, re) => { const m = html.match(re); return m ? decode(m[1]) : null; };
const read = (p) => readFileSync(join(dist, p.endsWith('/') ? p + 'index.html' : p), 'utf8');

const rows = [];
let fails = 0;
const cmp = (path, field, esperado, obtenido) => {
  const ok = JSON.stringify(esperado) === JSON.stringify(obtenido);
  if (!ok) fails++;
  rows.push(`${ok ? 'OK   ' : 'FALLA'} ${path} ${field}: esperado ${JSON.stringify(esperado)}${ok ? '' : ' · obtenido ' + JSON.stringify(obtenido)}`);
};

for (const p of exp.paginas) {
  for (const [i, loc] of [[0, 'es'], [1, 'en']]) {
    const path = p[loc];
    const other = loc === 'es' ? p.en : p.es;
    const html = read(path);
    cmp(path, 'lang', loc, one(html, /<html[^>]*lang="([^"]+)"/));
    cmp(path, 'canonical', exp.origen + path, one(html, /<link rel="canonical" href="([^"]+)"/));
    cmp(path, 'hreflang es', exp.origen + p.es, one(html, /hreflang="es" href="([^"]+)"/));
    cmp(path, 'hreflang en', exp.origen + p.en, one(html, /hreflang="en" href="([^"]+)"/));
    cmp(path, 'hreflang x-default', exp.origen + p.es, one(html, /hreflang="x-default" href="([^"]+)"/));
    cmp(path, 'title', p.title[i], one(html, /<title>([^<]+)<\/title>/));
    cmp(path, 'description', p.desc[i], one(html, /<meta name="description" content="([^"]+)"/));
    cmp(path, 'h1', p.h1[i], one(html, /<h1[^>]*>([^<]+)<\/h1>/));
    // Orden de atributos indistinto: link del selector = <a> con href, hreflang y el mismo lang.
    const switches = [...html.matchAll(/<a\b[^>]*>/g)].map((m) => m[0])
      .filter((tag) => { const hl = tag.match(/hreflang="(es|en)"/); return hl && new RegExp(`\\blang="${hl[1]}"`).test(tag); })
      .map((tag) => tag.match(/href="([^"]+)"/)[1]);
    cmp(path, 'selector → equivalente (footer y menú mobile)', [other, other], switches);
    cmp(path, 'selector: idioma actual con aria-current', loc.toUpperCase(), one(html, /<span aria-current="true"[^>]*>([A-Z]{2})<\/span>/));
    if (p.anclas) {
      for (const [id, es, en] of p.anclas) {
        const sec = one(html, new RegExp(`(<section[^>]*id="${id}"[^>]*>\\s*<h2[^>]*>[^<]*</h2>\\s*<p[^>]*>)`));
        cmp(path, `ancla #${id}`, { tabindex: true, h2: loc === 'es' ? es : en, placeholder: true }, sec && {
          tabindex: /tabindex="-1"/.test(sec), h2: one(sec, /<h2[^>]*>([^<]+)<\/h2>/), placeholder: /data-placeholder/.test(sec),
        });
      }
    }
    if (path === '/' || path === '/en/') {
      cmp(path, 'head viewport', exp.head.viewport, one(html, /<meta name="viewport" content="([^"]+)"/));
      cmp(path, 'head favicon', exp.head.favicon, one(html, /<link rel="icon"[^>]*href="([^"]+)"/));
      cmp(path, 'head theme-color', exp.head.themeColor, one(html, /<meta name="theme-color" content="([^"]+)"/));
      const preloads = [...html.matchAll(/<link rel="preload" href="([^"]+)" as="font"/g)].map((m) => m[1]);
      cmp(path, 'head preload de fuentes', exp.head.preload, exp.head.preload.filter((f) => preloads.some((u) => u.includes(f))));
    }
  }
}
const h = read('404.html');
cmp('/404.html', 'lang', exp.p404.lang, one(h, /<html[^>]*lang="([^"]+)"/));
cmp('/404.html', 'title', exp.p404.title, one(h, /<title>([^<]+)<\/title>/));
cmp('/404.html', 'robots', exp.p404.robots, one(h, /<meta name="robots" content="([^"]+)"/));
cmp('/404.html', 'sin canonical', null, one(h, /<link rel="canonical" href="([^"]+)"/));
cmp('/404.html', 'sin hreflang', null, one(h, /hreflang="(es|en|x-default)" href=/));
cmp('/404.html', 'sin selector de idioma', null, one(h, /<span aria-current="true"[^>]*>([A-Z]{2})<\/span>/));
cmp('/404.html', 'bloque en inglés', exp.p404.bloqueEn, one(h, /<div lang="en"[^>]*>\s*<h2[^>]*>([^<]+)<\/h2>/));
cmp('/404.html', 'links a ambos homes', exp.p404.homes, [one(h, /<a href="(\/)"[^>]*>Ir al inicio/), one(h, /<a href="(\/en\/)" hreflang="en"/)]);

console.log(rows.join('\n'));
console.log(`\n${rows.length - fails}/${rows.length} OK`);
process.exit(fails ? 1 : 0);
