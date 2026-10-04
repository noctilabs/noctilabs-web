// D4 (spec 004 §5): OG, Twitter y JSON-LD. Extracción de dist/ (base) en una página de cada tipo y en los dos idiomas,
// y prueba con el build adversarial (título con comillas y </script>) servido en 127.0.0.1:4956.
// Uso: node d4.mjs <repo> <dist-adversarial> [puertoCDP]
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { launch } from './cdp.mjs';

const [repo, advDist, cdpPort = '9386'] = process.argv.slice(2);
const dist = join(repo, 'dist');
const O = 'https://www.noctilabs.io';
let fails = 0;
const ok = (cond, msg) => { if (!cond) fails++; console.log(`${cond ? 'OK   ' : 'FALLA'} ${msg}`); };
const ent = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const read = (d, path) => readFileSync(join(d, ...path.split('/').filter(Boolean), path.endsWith('.html') ? '' : 'index.html'), 'utf8');

function extract(html) {
  const meta = {};
  for (const m of html.matchAll(/<meta (property|name)="([^"]+)" content="([^"]*)"/g)) meta[m[2]] = ent(m[3]);
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  return {
    lang: /<html lang="([^"]+)"/.exec(html)?.[1],
    title: ent(/<title>([\s\S]*?)<\/title>/.exec(html)?.[1] ?? ''),
    canonical: /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1] ?? null,
    h1: ent((/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1] ?? '').replace(/<[^>]+>/g, '')).trim(),
    time: /<time datetime="([^"]+)"/.exec(html)?.[1] ?? null,
    meta, ld,
  };
}

const PAGES = [
  ['home', '/', 'es', 'website'], ['home', '/en/', 'en', 'website'],
  ['producto', '/producto/', 'es', 'website'], ['producto', '/en/product/', 'en', 'website'],
  ['industria', '/industrias/retail-distribucion/', 'es', 'website'], ['industria', '/en/industries/retail-distribution/', 'en', 'website'],
  ['nosotros', '/nosotros/', 'es', 'website'], ['nosotros', '/en/about/', 'en', 'website'],
  ['insights', '/insights/', 'es', 'website'], ['insights', '/en/insights/', 'en', 'website'],
  ['artículo', '/insights/no-context-no-intelligence/', 'es', 'article'], ['artículo', '/en/insights/no-context-no-intelligence/', 'en', 'article'],
  ['hablemos', '/hablemos/', 'es', 'website'], ['hablemos', '/en/contact/', 'en', 'website'],
  ['privacidad', '/privacidad/', 'es', 'website'], ['privacidad', '/en/privacy/', 'en', 'website'],
];
const LOCALE = { es: ['es_UY', 'en_US'], en: ['en_US', 'es_UY'] };
const ORG = { '@type': 'Organization', name: 'NoctiLabs', url: `${O}/`, logo: `${O}/og/logo.png`, email: 'hola@noctilabs.io' };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

console.log('## OG, Twitter y JSON-LD en dist/ (variante base)');
for (const [type, path, loc, ogType] of PAGES) {
  const x = extract(read(dist, path));
  const m = x.meta;
  const url = O + path;
  const absolute = [m['og:url'], m['og:image'], x.canonical].every((u) => u?.startsWith(`${O}/`));
  ok(x.canonical === url && m['og:url'] === url && m['og:title'] === x.title && m['og:description'] === m.description && m['og:type'] === ogType
    && m['og:image'] === `${O}/og/og-${loc}.png` && m['og:image:width'] === '1200' && m['og:image:height'] === '630'
    && m['og:locale'] === LOCALE[loc][0] && m['og:locale:alternate'] === LOCALE[loc][1] && m['twitter:card'] === 'summary_large_image' && absolute && x.lang === loc,
    `${type} ${loc} ${path}: og:url ${m['og:url']}, og:type ${m['og:type']}, og:image ${m['og:image']}, og:locale ${m['og:locale']}/${m['og:locale:alternate']}, twitter:card ${m['twitter:card']}`);
  let parsed;
  try { parsed = x.ld.map((s) => JSON.parse(s)); } catch (e) { parsed = null; }
  ok(parsed !== null && parsed.every((d) => d['@context'] === 'https://schema.org' && typeof d['@type'] === 'string'), `${type} ${loc}: ${x.ld.length} bloque(s) JSON-LD parseables con @context y @type [${parsed?.map((d) => d['@type']).join(', ')}]`);
  if (type === 'home') {
    const org = parsed.find((d) => d['@type'] === 'Organization');
    const web = parsed.find((d) => d['@type'] === 'WebSite');
    ok(parsed.length === 2 && eq({ ...org, '@context': undefined }, { ...ORG, '@context': undefined }) && web?.name === 'NoctiLabs' && web.url === url && web.inLanguage === loc,
      `home ${loc}: Organization ${JSON.stringify(org)} · WebSite ${JSON.stringify(web)}`);
  } else if (type === 'artículo') {
    const a = parsed[0];
    ok(parsed.length === 1 && a['@type'] === 'Article' && a.headline === x.h1 && a.datePublished === x.time && a.inLanguage === x.lang && a.url === x.canonical
      && a.mainEntityOfPage === x.canonical && a.image === m['og:image'] && eq(a.author, ORG) && eq(a.publisher, ORG),
      `artículo ${loc}: headline «${a.headline}» = H1 «${x.h1}»; datePublished ${a.datePublished} = <time> ${x.time}; inLanguage ${a.inLanguage}; url = canonical; image = og:image; author/publisher Organization`);
  } else {
    ok(parsed.length === 0, `${type} ${loc}: sin JSON-LD (solo home y artículos)`);
  }
}

console.log('\n## 404');
const nf = extract(readFileSync(join(dist, '404.html'), 'utf8'));
ok(nf.canonical === null && !nf.meta['og:url'] && !Object.keys(nf.meta).some((k) => k.startsWith('og:') || k.startsWith('twitter:')) && nf.ld.length === 0
  && nf.title && nf.meta.description && nf.meta.robots === 'noindex',
  `404: title «${nf.title}», description «${nf.meta.description?.slice(0, 50)}…», robots ${nf.meta.robots}; sin canonical, og:url, OG/Twitter ni JSON-LD`);

console.log('\n## Build adversarial: título con comillas y </script> (servido en 127.0.0.1:4956)');
const b = await launch({ port: Number(cdpPort) });
let dialogs = 0;
b.on((m) => { if (m.method === 'Page.javascriptDialogOpening') { dialogs++; b.send('Page.handleJavaScriptDialog', { accept: true }); } });
const ADV = { es: 'Sin "contexto" </script><script>alert(1)</script> no hay inteligencia', en: 'No "context" </script><script>alert(1)</script> no intelligence' };
for (const [loc, path] of [['es', '/insights/no-context-no-intelligence/'], ['en', '/en/insights/no-context-no-intelligence/']]) {
  const raw = read(advDist, path);
  const ldRaw = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(raw)?.[1] ?? '';
  ok(ldRaw.includes('\\u003c/script>') && !ldRaw.includes('</script'), `${loc}: en el HTML, el JSON-LD lleva \\u003c/script> y ningún </script> literal`);
  await b.goto(`http://127.0.0.1:4956${path}`);
  const r = await b.eval(`(() => {
    const lds = [...document.querySelectorAll('script[type="application/ld+json"]')];
    let parsed = null; try { parsed = JSON.parse(lds[0].textContent); } catch (e) { parsed = String(e); }
    return {
      title: document.title, h1: document.querySelector('main h1').textContent.trim(), ogTitle: document.querySelector('meta[property="og:title"]').content,
      lds: lds.length, headline: parsed?.headline ?? parsed, scripts: [...document.scripts].filter((s) => /alert\\(1\\)/.test(s.textContent) && s.type !== 'application/ld+json').length,
      mainEnd: !!document.querySelector('footer.site-footer'),
    };
  })()`);
  const want = ADV[loc];
  ok(r.h1 === want && r.title === `${want} — NoctiLabs` && r.ogTitle === r.title && r.headline === want && r.lds === 1 && r.scripts === 0 && r.mainEnd,
    `${loc}: H1, title y og:title con el texto exacto; 1 JSON-LD que parsea con headline idéntico; 0 scripts inyectados; el documento llega al footer (${JSON.stringify(r).slice(0, 220)})`);
}
ok(dialogs === 0, `ningún alert() ejecutado (${dialogs} diálogos)`);
ok(b.consoleErrors.length === 0, `consola sin errores (${b.consoleErrors.join(' | ') || 'ninguno'})`);
await b.close();
console.log(`\nRESULTADO D4: ${fails === 0 ? 'OK' : `${fails} FALLA(S)`}`);
process.exit(fails ? 1 : 0);
