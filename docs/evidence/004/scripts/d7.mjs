// D7 (spec 004 §5): cabeceras de vercel.json y CSP del <meta> aplicadas juntas, sobre la base servida por
// serve-vercel.mjs (127.0.0.1:4953). Uso: node d7.mjs <repo> <dist-adversarial> [puertoCDP]
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { launch } from './cdp.mjs';
import { routesOf, setupAudit, STYLE_CHECK } from './audit.mjs';

const [repo, advDist, cdpPort = '9387'] = process.argv.slice(2);
const BASE = 'http://127.0.0.1:4953';
const b = await launch({ port: Number(cdpPort) });
const docs = await setupAudit(b);
let fails = 0;
const ok = (cond, msg) => { if (!cond) fails++; console.log(`${cond ? 'OK   ' : 'FALLA'} ${msg}`); };
const EXPECT = {
  'content-security-policy': "frame-ancestors 'none'", 'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()', 'x-frame-options': 'DENY',
};
const lower = (h) => Object.fromEntries(Object.entries(h).map(([k, v]) => [k.toLowerCase(), v]));
b.fetchHandler = async (p) => {
  if (p.request.method === 'OPTIONS') return b.send('Fetch.fulfillRequest', { requestId: p.requestId, responseCode: 204, responseHeaders: [{ name: 'Access-Control-Allow-Origin', value: '*' }, { name: 'Access-Control-Allow-Headers', value: 'content-type, accept' }] });
  if (p.request.url.includes('web3forms.com')) return b.send('Fetch.fulfillRequest', { requestId: p.requestId, responseCode: 200, responseHeaders: [{ name: 'Access-Control-Allow-Origin', value: '*' }, { name: 'Content-Type', value: 'application/json' }], body: Buffer.from('{"success":true}').toString('base64') });
  return b.send('Fetch.failRequest', { requestId: p.requestId, errorReason: 'BlockedByClient' });
};
const shot = (name) => b.shot(new URL(`./capturas/${name}.png`, import.meta.url).pathname.slice(1), null);

const routes = [...routesOf(join(repo, 'dist')), '/ruta/desconocida/', '/hablemos/?email=persona@example.com'];
console.log(`## Recorrido de ${routes.length} URLs a 1440×900 (CSP del <meta> + cabeceras del servidor)`);
await b.viewport(1440, 900);
let totalViol = 0;
for (const r of routes) {
  const n0 = docs.length;
  const e0 = b.consoleErrors.length;
  await b.goto(BASE + r);
  await b.sleep(300);
  const doc = docs.slice(n0).find((d) => d.url.startsWith(BASE));
  const h = lower(doc?.headers ?? {});
  const hdr = Object.entries(EXPECT).every(([k, v]) => h[k] === v) && !('default-src' in h);
  const st = r.startsWith('/ruta/') ? 404 : 200;
  const meta = await b.eval(`document.querySelector('meta[http-equiv="content-security-policy"]')?.content ?? ''`);
  const viol = await b.eval('window.__csp');
  const styles = await b.eval(STYLE_CHECK);
  // En la ruta desconocida, Chrome registra el propio 404 del documento: es la respuesta esperada, no un error de la página.
  const errs = b.consoleErrors.slice(e0).filter((e) => !(st === 404 && e.includes('status of 404') && e.trim().endsWith(BASE + r)));
  totalViol += viol.length;
  ok(doc?.status === st && hdr && meta.includes("default-src 'self'") && viol.length === 0 && errs.length === 0 && styles.sinAplicar === 0,
    `${r} → ${doc?.status}; cabeceras ${hdr ? 'OK' : JSON.stringify(h)}; <meta> CSP ${meta ? 'sí' : 'NO'}; violaciones ${viol.length}${viol.length ? ' ' + JSON.stringify(viol) : ''}; consola ${errs.length}${errs.length ? ' ' + errs.join(' | ').slice(0, 300) : ''}; style= ${styles.total} aplicados (${styles.sinAplicar} sin aplicar)`);
}

console.log('\n## Interacciones con la CSP activa');
// Home: video del hero, antes/después y nodos posicionados por style; tabs de industrias.
await b.goto(`${BASE}/`);
await b.sleep(800);
const home = await b.eval(`(async () => {
  const v = document.querySelector('.hero .media');
  const playing = v ? !v.paused && v.currentTime > 0 : null;
  const t = document.querySelector('.hero .toggle'); t?.click(); await new Promise((r) => setTimeout(r, 200));
  const pausedByButton = v?.paused;
  t?.click(); await new Promise((r) => setTimeout(r, 200));
  const segs = [...document.querySelectorAll('.seg button, [role=tab]')];
  for (const s of segs) { s.click(); await new Promise((r) => setTimeout(r, 120)); }
  const nodes = [...document.querySelectorAll('.node')].map((n) => { const r = n.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), n.getAttribute('style')]; });
  return { playing, pausedByButton, segs: segs.length, nodes: nodes.length, distintos: new Set(nodes.map((n) => n[0] + ',' + n[1])).size, sample: nodes.slice(0, 3), csp: window.__csp };
})()`);
ok(home.playing !== false && home.pausedByButton === true && home.csp.length === 0, `home: video ${home.playing ? 'reproduciendo' : 'sin reproducir (headless)'}, el botón lo pausa, ${home.segs} controles de antes/después e industrias accionados, 0 violaciones`);
ok(home.nodes > 0 && home.distintos === home.nodes, `home: ${home.nodes} nodos del diagrama posicionados por style, todos en posiciones distintas (${JSON.stringify(home.sample)})`);
await b.eval(`document.querySelector('.ba, [class*=before], section:nth-of-type(2)')?.scrollIntoView({ block: 'start' })`);
await b.sleep(300);
await shot('d7-home-diagrama-1440');
await b.goto(`${BASE}/producto/`);
await b.sleep(500);
await shot('d7-producto-1440');
ok((await b.eval('window.__csp')).length === 0, 'producto: 0 violaciones');
// Formulario (interceptado): el envío a api.web3forms.com pasa connect-src.
await b.goto(`${BASE}/hablemos/`);
await b.eval(`(() => { for (const [k, v] of Object.entries({ name: 'A', email: 'a@b.co', organization: 'C', message: 'D' })) document.querySelector('[name="' + k + '"]').value = v; document.querySelector('#cf-consent').checked = true; document.querySelector('button[type=submit]').click(); })()`);
await b.sleep(800);
const form = await b.eval(`({ sent: !document.querySelector('[data-sent]').hidden, csp: window.__csp })`);
ok(form.sent && form.csp.length === 0, `formulario: envío interceptado → enviado; 0 violaciones (connect-src permite api.web3forms.com)`);
// Insights y artículo.
for (const p of ['/insights/', '/en/insights/no-context-no-intelligence/']) {
  await b.goto(BASE + p);
  await b.eval(`document.querySelector('a[href*="no-context"], .toc a')?.click()`);
  await b.sleep(400);
  ok((await b.eval('window.__csp')).length === 0, `${p}: navegación por Insights sin violaciones`);
}

console.log('\n## frame-ancestors: un iframe desde otro origen no carga el sitio');
const e0 = b.consoleErrors.length;
await b.goto(`http://127.0.0.1:4955/?src=${encodeURIComponent(`${BASE}/`)}`);
await b.sleep(1000);
const tree = await b.send('Page.getFrameTree');
const child = tree.frameTree.childFrames?.[0]?.frame;
const frameErrs = b.consoleErrors.slice(e0);
ok(child && child.url !== `${BASE}/` && /chrome-error/.test(child.url ?? '') || frameErrs.some((e) => /frame-ancestors|X-Frame-Options/i.test(e)),
  `iframe a ${BASE}/ bloqueado: frame ${child?.url ?? '—'}; consola: ${frameErrs.join(' | ').slice(0, 250)}`);

console.log('\n## Link javascript: de un fixture de Sanity (build adversarial)');
for (const p of ['insights/no-context-no-intelligence/index.html', 'en/insights/no-context-no-intelligence/index.html']) {
  const html = readFileSync(join(advDist, p), 'utf8');
  ok(!/javascript:/i.test(html) && html.includes('link javascript adversarial') && html.includes('href="https://example.com/ok" rel="noopener"'),
    `${p}: sin «javascript:» en el HTML; el texto del link queda sin <a>; el link https de control sí se renderiza`);
}
await b.goto('http://127.0.0.1:4956/insights/no-context-no-intelligence/');
const adv = await b.eval(`({ js: [...document.querySelectorAll('a')].filter((a) => /^javascript:/i.test(a.getAttribute('href') || '')).length, csp: window.__csp })`);
ok(adv.js === 0 && adv.csp.length === 0, `adversarial servido: 0 links javascript:, 0 violaciones CSP`);

console.log(`\nViolaciones CSP en el recorrido: ${totalViol}. Errores de consola totales: ${b.consoleErrors.length} (los del iframe bloqueado son esperados).`);
console.log(`\nRESULTADO D7: ${fails === 0 ? 'OK' : `${fails} FALLA(S)`}`);
await b.close();
process.exit(fails ? 1 : 0);
