// D8 (spec 004 §5): referente y analítica. Base (sin VERCEL_ENV) en 127.0.0.1:4953 y prod-prueba
// (VERCEL_ENV=production, LEGAL_FIXTURE=1, dist-fixture/) en 127.0.0.1:4954, los dos con las cabeceras de vercel.json.
// La carga de /_vercel/insights/* se intercepta con CDP Fetch y se responde con stub-insights.js.
// Uso: node d8.mjs <repo> [puertoCDP]
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { launch } from './cdp.mjs';
import { routesOf, setupAudit } from './audit.mjs';

const [repo, cdpPort = '9388'] = process.argv.slice(2);
const BASE = 'http://127.0.0.1:4953';
const PROD = 'http://127.0.0.1:4954';
const STUB = readFileSync(new URL('./stub-insights.js', import.meta.url));
const b = await launch({ port: Number(cdpPort) });
const docs = await setupAudit(b);
let fails = 0;
const ok = (cond, msg) => { if (!cond) fails++; console.log(`${cond ? 'OK   ' : 'FALLA'} ${msg}`); };
console.log(`stub-insights.js sha256 ${createHash('sha256').update(STUB).digest('hex')}`);
b.fetchHandler = async (p) => {
  if (p.request.url.includes('/_vercel/insights/script.js')) {
    return b.send('Fetch.fulfillRequest', { requestId: p.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'text/javascript' }], body: STUB.toString('base64') });
  }
  return b.send('Fetch.failRequest', { requestId: p.requestId, errorReason: 'BlockedByClient' });
};
const insightsReqs = () => b.fetchLog.filter((r) => r.url.includes('/_vercel/insights/'));

console.log('## Analítica: sin VERCEL_ENV=production no se inyecta (base)');
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const baseFiles = walk(join(repo, 'dist')).filter((f) => /\.(html|js)$/.test(f));
const withVa = baseFiles.filter((f) => /_vercel\/insights|window\.vaq|webAnalyticsBeforeSend/.test(readFileSync(f, 'utf8')));
ok(withVa.length === 0, `dist/ (base): ${baseFiles.length} HTML/JS sin rastro del SDK (${withVa.join(', ') || 'ninguno'})`);
const baseRoutes = [...routesOf(join(repo, 'dist')), '/ruta/desconocida/'];
const r0 = insightsReqs().length;
for (const r of baseRoutes) {
  await b.goto(BASE + r);
  const va = await b.eval(`({ va: typeof window.va, vaq: Array.isArray(window.vaq) })`);
  if (va.va !== 'undefined' || va.vaq) ok(false, `${r}: window.va/vaq presentes en la base`);
}
ok(insightsReqs().length === r0, `base: ${baseRoutes.length} URLs recorridas, 0 pedidos a /_vercel/insights y sin window.va`);

console.log('\n## Analítica en prod-prueba: 22 + 2N páginas con PageRef sí; 404 y ruta desconocida no');
const prodRoutes = routesOf(join(repo, 'dist-fixture'));
ok(prodRoutes.length === 24, `dist-fixture/: ${prodRoutes.length} páginas con PageRef (22 + 2N, N = 1)`);
const OUT = new Set();
for (const r of prodRoutes) {
  const n0 = insightsReqs().length;
  await b.goto(PROD + r);
  await b.sleep(200);
  const s = await b.eval(`({ stub: window.__stub ?? null, csp: window.__csp, va: typeof window.va })`);
  const reqs = insightsReqs().slice(n0);
  const io = s.stub?.io ?? [];
  const clean = io.length === 5 && io.every(({ input, output }) => output && output.type === input.type && output.url === `${PROD}${r}` && !/[?#]/.test(output.url));
  io.forEach(({ output }) => OUT.add(output?.url?.replace(PROD, '')));
  ok(reqs.length === 1 && reqs[0].url === `${PROD}/_vercel/insights/script.js` && s.stub?.found && s.stub.queue.includes('beforeSend') && clean && s.csp.length === 0,
    `${r}: 1 pedido a ${reqs[0]?.url.replace(PROD, '')} (interceptado), cola [${s.stub?.queue}], beforeSend sin query ni fragmento en ${io.length} eventos, 0 violaciones`);
  if (r === '/hablemos/') console.log(`      ejemplo: ${JSON.stringify(io.slice(0, 3))} · dataset ${JSON.stringify(s.stub?.dataset)}`);
}
for (const r of ['/404.html', '/ruta/desconocida/', '/persona@example.com/datos/']) {
  const n0 = insightsReqs().length;
  await b.goto(PROD + r);
  await b.sleep(300);
  const s = await b.eval(`({ stub: window.__stub ?? null, va: typeof window.va, vaq: window.vaq ?? null, csp: window.__csp, robots: document.querySelector('meta[name=robots]')?.content })`);
  ok(insightsReqs().length === n0 && s.va === 'undefined' && s.vaq === null && s.stub === null && s.csp.length === 0 && s.robots === 'noindex',
    `${r}: 404 sin analítica (0 pedidos, sin window.va ni cola), noindex, 0 violaciones`);
}
const html404 = readFileSync(join(repo, 'dist-fixture', '404.html'), 'utf8');
ok(!/_vercel|vaq|inject/.test(html404), 'dist-fixture/404.html no contiene el script de analítica');

console.log('\n## Referente: solo el origen (Referrer-Policy: strict-origin)');
for (const [from, click, to] of [
  ['/hablemos/?email=persona@example.com', 'footer a[href="/nosotros/"]', '/nosotros/'],
  ['/en/contact/?email=persona@example.com#x', 'footer a[href="/en/about/"]', '/en/about/'],
  ['/persona@example.com/datos/', 'main a[href="/"]', '/'],
]) {
  const n0 = docs.length;
  await b.goto(PROD + from);
  const fromDoc = docs.slice(n0).find((d) => d.url.startsWith(PROD));
  await b.eval(`document.querySelector(${JSON.stringify(click)}).click()`);
  for (let i = 0; i < 50 && (await b.eval('location.pathname').catch(() => '')) !== to; i++) await b.sleep(100);
  await b.sleep(400);
  const r = await b.eval(`({ ref: document.referrer, path: location.pathname, stub: !!window.__stub })`);
  const rp = Object.fromEntries(Object.entries(fromDoc?.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v]))['referrer-policy'];
  ok(r.path === to && r.ref === `${PROD}/` && rp === 'strict-origin' && r.stub,
    `${from} (Referrer-Policy: ${rp}, HTTP ${fromDoc?.status}) → ${r.path}: document.referrer = «${r.ref}»; la página destino tiene analítica`);
}

console.log(`\nURLs que devolvió beforeSend (sin query ni fragmento): ${[...OUT].length} distintas`);
const errs = b.consoleErrors.filter((e) => !/status of 404/.test(e));
ok(errs.length === 0, `consola sin errores en prod-prueba y base, salvo los 404 de documento esperados (${errs.join(' | ') || 'ninguno'})`);
console.log(`\nRESULTADO D8: ${fails === 0 ? 'OK' : `${fails} FALLA(S)`}`);
await b.close();
process.exit(fails ? 1 : 0);
