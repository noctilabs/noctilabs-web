// D5 (spec 004 §5): sitemap y robots sobre dist/. Uso: node d5.mjs <repo>
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = join(process.argv[2], 'dist');
const O = 'https://www.noctilabs.io';
let fails = 0;
const ok = (cond, msg) => { if (!cond) fails++; console.log(`${cond ? 'OK   ' : 'FALLA'} ${msg}`); };

const xml = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>') && xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"') && xml.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'), 'cabecera XML y espacios de nombres');
const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
  loc: /<loc>([^<]+)<\/loc>/.exec(m[1])[1],
  links: Object.fromEntries([...m[1].matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\/>/g)].map((l) => [l[1], l[2]])),
}));
const locs = new Set(entries.map((e) => e.loc));
console.log(`${entries.length} <url> en el sitemap`);

// URLs indexables de dist/: todo index.html (las páginas con canonical), sin la 404.
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const indexables = walk(dist).filter((f) => f.endsWith('index.html')).map((f) => {
  const html = readFileSync(f, 'utf8');
  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1] ?? null;
  const path = `/${relative(dist, f).split('\\').join('/').replace(/index\.html$/, '')}`;
  const noindex = /<meta name="robots" content="noindex"/.test(html);
  return { path, canonical, noindex };
});
ok(indexables.every((p) => p.canonical === O + p.path && !p.noindex), `las ${indexables.length} páginas de dist/ tienen canonical propio y ninguna es noindex`);
const faltan = indexables.filter((p) => !locs.has(O + p.path)).map((p) => p.path);
ok(faltan.length === 0, `todas las URLs indexables están en el sitemap (${indexables.length}/${indexables.length - faltan.length})${faltan.length ? ` — faltan ${faltan.join(', ')}` : ''}`);
const fileOf = (u) => join(dist, ...u.slice(O.length).split('/').filter(Boolean), 'index.html');
const inexistentes = [...locs].filter((u) => !u.startsWith(`${O}/`) || !u.endsWith('/') || !existsSync(fileOf(u)));
ok(inexistentes.length === 0, `ninguna URL del sitemap es inexistente en dist/ (${inexistentes.join(', ') || 'ninguna'})`);
ok(locs.size === entries.length, `sin <loc> repetidos (${locs.size} únicos)`);
ok(!locs.has(`${O}/404.html`) && ![...locs].some((u) => u.includes('404')), 'la 404 no está');
ok(entries.length === 24, `22 URLs fijas + 2N con N = 1 artículo = 24 (hay ${entries.length})`);

let recip = 0;
for (const e of entries) {
  const L = e.links;
  const okSet = Object.keys(L).sort().join() === 'en,es,x-default' && L['x-default'] === L.es && (e.loc === L.es || e.loc === L.en);
  const allIn = Object.values(L).every((u) => locs.has(u));
  const back = [L.es, L.en].every((u) => { const o = entries.find((x) => x.loc === u); return o && JSON.stringify(o.links) === JSON.stringify(L); });
  // El sitemap coincide con el hreflang de la página.
  const html = readFileSync(fileOf(e.loc), 'utf8');
  const page = Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((l) => [l[1], l[2]]));
  const same = JSON.stringify(page) === JSON.stringify(L);
  if (okSet && allIn && back && same) recip++;
  else ok(false, `${e.loc}: es/en/x-default ${okSet}, en el sitemap ${allIn}, recíprocos ${back}, igual al hreflang de la página ${same}`);
}
ok(recip === entries.length, `${recip}/${entries.length} con xhtml:link es, en y x-default recíprocos, dentro del sitemap e iguales al hreflang de la página`);
const pairs = [['/nosotros/', '/en/about/'], ['/hablemos/', '/en/contact/'], ['/privacidad/', '/en/privacy/'], ['/industrias/alimentos-consumo/', '/en/industries/food-consumer-goods/'], ['/insights/no-context-no-intelligence/', '/en/insights/no-context-no-intelligence/']];
for (const [es, en] of pairs) {
  const e = entries.find((x) => x.loc === O + es);
  ok(e?.links.en === O + en, `slugs distintos bien emparejados: ${es} ↔ ${e?.links.en?.slice(O.length)}`);
}

const robots = readFileSync(join(dist, 'robots.txt'), 'utf8');
const want = 'User-agent: *\nAllow: /\n\nSitemap: https://www.noctilabs.io/sitemap.xml\n';
ok(robots === want, `robots.txt igual al de §2.6 (${JSON.stringify(robots)})`);
console.log(`\nRESULTADO D5: ${fails === 0 ? 'OK' : `${fails} FALLA(S)`}`);
process.exit(fails ? 1 : 0);
