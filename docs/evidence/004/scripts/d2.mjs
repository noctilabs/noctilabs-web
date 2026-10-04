// D2 (spec 004 §5): formulario contra Web3Forms con la API interceptada por CDP Fetch. Ningún pedido sale a la red:
// cada pedido a *web3forms.com* se pausa y se responde desde aquí (o se redirige al servidor trabado local).
// Uso: node d2.mjs [base] [puertoCDP]
import { launch } from './cdp.mjs';

const BASE = process.argv[2] || 'http://localhost:4952';
const b = await launch({ port: Number(process.argv[3] || 9383) });
await b.viewport(1440, 900);
// El aviso de cambios sin enviar (beforeunload) abre un diálogo al navegar con el formulario modificado: se acepta y se cuenta.
let dialogs = 0;
b.on((m) => { if (m.method === 'Page.javascriptDialogOpening') { dialogs++; b.send('Page.handleJavaScriptDialog', { accept: true }); } });
let fails = 0;
const ok = (cond, msg) => { if (!cond) fails++; console.log(`${cond ? 'OK   ' : 'FALLA'} ${msg}`); };
const B64 = (s) => Buffer.from(s).toString('base64');
const CORS = [
  { name: 'Access-Control-Allow-Origin', value: '*' },
  { name: 'Access-Control-Allow-Headers', value: 'content-type, accept' },
  { name: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
];
const fulfill = (p, status, body) => b.send('Fetch.fulfillRequest', {
  requestId: p.requestId, responseCode: status, responseHeaders: [...CORS, { name: 'Content-Type', value: 'application/json' }], body: B64(body),
});

let mode = 'ok';
const held = [];
b.fetchHandler = async (p) => {
  if (!p.request.url.includes('web3forms.com')) return b.send('Fetch.failRequest', { requestId: p.requestId, errorReason: 'BlockedByClient' });
  if (p.request.method === 'OPTIONS') return b.send('Fetch.fulfillRequest', { requestId: p.requestId, responseCode: 204, responseHeaders: CORS });
  switch (mode) {
    case 'ok': return fulfill(p, 200, JSON.stringify({ success: true, message: 'Email sent successfully!' }));
    case 'false': return fulfill(p, 200, JSON.stringify({ success: false, message: 'rechazado' }));
    case 'badjson': return fulfill(p, 200, '{"success": true,,');
    case 'strtype': return fulfill(p, 200, JSON.stringify({ success: 'true' }));
    case 'nosuccess': return fulfill(p, 200, JSON.stringify({ message: 'sin success' }));
    case '4xx': return fulfill(p, 400, JSON.stringify({ success: false, message: 'bad request' }));
    case '5xx': return fulfill(p, 500, JSON.stringify({ success: true }));
    case 'net': return b.send('Fetch.failRequest', { requestId: p.requestId, errorReason: 'Failed' });
    case 'hang': held.push(p); return undefined;           // nunca responde: timeout esperando las cabeceras
    case 'stall': return b.send('Fetch.continueRequest', { requestId: p.requestId, url: 'http://127.0.0.1:4957/stall' });
    case 'hold': held.push(p); return undefined;           // respuesta demorada: la libera el escenario
    default: throw new Error(mode);
  }
};
const release = async (status, body) => { const p = held.shift(); await fulfill(p, status, body); };
const posts = () => b.fetchLog.filter((r) => r.method === 'POST' && r.url.includes('web3forms.com'));

const VALUES = {
  name: '  Ana Pérez  ', email: 'ana@empresa.com', organization: 'Distribuidora del Sur',
  role: 'Gerente de operaciones', industry: 'retail', message: 'Queremos ver stock y pedidos en un solo lugar.',
};
async function waitFor(expr, ms = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (await b.eval(expr)) return Date.now() - t0; await b.sleep(50); }
  return -1;
}
async function fresh(path) {
  // Antes de salir: vaciar el formulario quita el aviso de cambios sin enviar (beforeunload), así no hay diálogo.
  await b.eval(`(() => { const f = document.querySelector('form'); if (f) { f.reset(); f.dispatchEvent(new Event('input', { bubbles: true })); } })()`).catch(() => {});
  await b.goto(BASE + path);
  await b.eval('sessionStorage.clear()');
  await b.goto(BASE + path);
}
async function fill({ consent = true, values = VALUES } = {}) {
  await b.eval(`(() => {
    const v = ${JSON.stringify(values)};
    for (const [k, x] of Object.entries(v)) { const el = document.querySelector('[name="' + k + '"]'); el.value = x; el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); }
  })()`);
  if (consent) await clickEl('#cf-consent');
}
async function clickEl(sel) {
  await b.eval(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({ block: 'center' })`);
  await b.sleep(80);
  await b.click(sel);
}
const state = () => b.eval(`(() => {
  const q = (s) => document.querySelector(s);
  const vals = Object.fromEntries(['name','email','organization','role','industry','message'].map((n) => [n, q('[name="' + n + '"]').value]));
  return {
    vals, consent: q('#cf-consent').checked, botcheck: q('[name=botcheck]').checked, fieldset: q('form fieldset').disabled,
    formHidden: q('form').hidden, sent: !q('[data-sent]').hidden, failed: !q('[data-failed]').hidden, wait: !q('[data-wait]').hidden,
    failedMail: q('[data-failed] a')?.getAttribute('href'), button: q('button[type=submit]').textContent,
    active: document.activeElement === document.body ? 'body' : (document.activeElement.id || document.activeElement.tagName + ':' + document.activeElement.textContent.trim().slice(0, 40)),
    consentErr: q('#cf-consent-err').hidden ? null : q('#cf-consent-err').textContent, consentInvalid: q('#cf-consent').getAttribute('aria-invalid'),
  };
})()`);
const same = (a, e) => JSON.stringify(a) === JSON.stringify(e);

// 1. Payload (ES), cargando la página con query y fragmento: `page` tiene que ser la canónica.
console.log('## 1. Payload ES, una sola petición, estado enviado');
await fresh('/hablemos/?utm=x&email=otro@example.com#frag');
mode = 'ok';
const before = Date.now();
await fill();
await clickEl('button[type=submit]');
await waitFor(`!document.querySelector('[data-sent]').hidden`);
let s = await state();
let ps = posts();
ok(ps.length === 1, `una petición POST a Web3Forms (hubo ${ps.length}; OPTIONS interceptados: ${b.fetchLog.filter((r) => r.method === 'OPTIONS').length})`);
const req = ps[0];
const body = JSON.parse(req.postData);
console.log('      URL', req.url);
console.log('      cabeceras', JSON.stringify(Object.fromEntries(Object.entries(req.headers).filter(([k]) => /content-type|accept$/i.test(k)))));
console.log('      cuerpo', JSON.stringify(body));
ok(req.url === 'https://api.web3forms.com/submit', 'URL https://api.web3forms.com/submit');
ok(/application\/json/.test(req.headers['Content-Type']) && /application\/json/.test(req.headers.Accept), 'Content-Type y Accept application/json');
const KEYS = ['access_key', 'subject', 'from_name', 'botcheck', 'name', 'email', 'organization', 'role', 'industry', 'message', 'locale', 'page', 'consent', 'consent_version', 'consent_at'];
ok(same(Object.keys(body).sort(), [...KEYS].sort()), `campos exactos del payload: ${Object.keys(body).join(', ')}`);
ok(body.access_key === 'clave-de-prueba-local', 'access_key desde PUBLIC_WEB3FORMS_KEY (valor de prueba local)');
ok(body.subject === 'Nuevo contacto desde la web (ES)' && body.from_name === 'NoctiLabs web', 'subject y from_name fijos');
ok(body.botcheck === false, 'botcheck: false (boolean)');
ok(body.name === 'Ana Pérez' && body.email === VALUES.email && body.organization === VALUES.organization && body.role === VALUES.role && body.industry === 'retail' && body.message === VALUES.message, 'campos de spec 002 §4.6 recortados');
ok(body.locale === 'es' && body.page === 'https://www.noctilabs.io/hablemos/', `locale es y page canónica (${body.page}), no location.href`);
ok(body.consent === true && body.consent_version === '2026-10-04.1', 'consent: true y consent_version 2026-10-04.1');
const at = Date.parse(body.consent_at);
ok(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(body.consent_at) && at >= before - 1000 && at <= Date.now(), `consent_at ISO del cliente (${body.consent_at})`);
ok(s.sent && s.formHidden && s.active === 'H2:' + 'Gracias. Te vamos a escribir pronto.'.slice(0, 40), `enviado con foco en el título (${s.active})`);
await b.shot(new URL('./capturas/d2-enviado-1440.png', import.meta.url).pathname.slice(1), null);

// 2. EN: locale, subject y page del inglés.
console.log('\n## 2. Payload EN');
await fresh('/en/contact/?utm=y');
const n0 = posts().length;
await fill();
await clickEl('button[type=submit]');
await waitFor(`!document.querySelector('[data-sent]').hidden`);
const bodyEn = JSON.parse(posts().at(-1).postData);
ok(posts().length === n0 + 1, 'una petición');
ok(bodyEn.locale === 'en' && bodyEn.subject === 'Nuevo contacto desde la web (EN)' && bodyEn.page === 'https://www.noctilabs.io/en/contact/', `locale en, subject (EN), page ${bodyEn.page}`);
ok(bodyEn.consent === true && bodyEn.botcheck === false, 'consentimiento y botcheck');

// 3. Honeypot marcado: cero peticiones y estado enviado.
console.log('\n## 3. Honeypot');
await fresh('/hablemos/');
const n1 = posts().length;
const log1 = b.fetchLog.length;
const hp = await b.eval(`(() => { const i = document.querySelector('[name=botcheck]'); const r = i.getBoundingClientRect(); return { tabindex: i.getAttribute('tabindex'), autocomplete: i.getAttribute('autocomplete'), ariaHidden: i.getAttribute('aria-hidden'), wrapperHidden: i.parentElement.getAttribute('aria-hidden'), right: r.right, type: i.type }; })()`);
ok(hp.type === 'checkbox' && hp.tabindex === '-1' && hp.autocomplete === 'off' && hp.ariaHidden === 'true' && hp.right < 0, `honeypot checkbox fuera de pantalla con tabindex -1, autocomplete off y aria-hidden (${JSON.stringify(hp)})`);
await fill();
await b.eval(`document.querySelector('[name=botcheck]').checked = true`);
await clickEl('button[type=submit]');
await waitFor(`!document.querySelector('[data-sent]').hidden`, 3000);
await b.sleep(500);
s = await state();
ok(posts().length === n1 && b.fetchLog.length === log1, `cero peticiones con el honeypot marcado (${b.fetchLog.length - log1} pedidos pausados)`);
ok(s.sent, 'estado enviado');

// 4. Respuestas de error: mensaje con el mail y valores conservados.
console.log('\n## 4. Errores');
for (const m of ['false', 'nosuccess', 'strtype', 'badjson', '4xx', '5xx', 'net', 'hang', 'stall']) {
  await fresh('/hablemos/');
  mode = m;
  const n = posts().length;
  await fill();
  const t0 = Date.now();
  await clickEl('button[type=submit]');
  // «Enviando…»: el fieldset se deshabilita de forma sincrónica en el submit (se lee en el mismo tick del click).
  const sendingSeen = await b.eval(`document.querySelector('form fieldset').disabled || !document.querySelector('[data-failed]').hidden`);
  const waited = await waitFor(`!document.querySelector('[data-failed]').hidden || !document.querySelector('[data-sent]').hidden`, 25000);
  s = await state();
  const ms = Date.now() - t0;
  ok(s.failed && !s.sent && s.failedMail === 'mailto:hola@noctilabs.io' && same(s.vals, VALUES) && s.consent && !s.fieldset && posts().length === n + 1 && sendingSeen && waited >= 0,
    `${m}: error con el mail, valores y consentimiento conservados, fieldset habilitado, 1 petición, ${ms} ms${m === 'hang' || m === 'stall' ? ' (timeout de 15 s)' : ''} · ${JSON.stringify({ ...s, vals: same(s.vals, VALUES) ? 'iguales' : s.vals, posts: posts().length - n, sendingSeen })}`);
  if (m === 'hang' || m === 'stall') ok(ms >= 14900 && ms < 17000, `${m}: el error llega a los 15 s (${ms} ms)`);
  if (m === 'false') await b.shot(new URL('./capturas/d2-error-1440.png', import.meta.url).pathname.slice(1), null);
}
while (held.length) await release(200, '{}').catch(() => {});

// 5. Sin consentimiento: error en línea y foco en el checkbox.
console.log('\n## 5. Sin consentimiento');
await fresh('/hablemos/');
mode = 'ok';
const n5 = posts().length;
await fill({ consent: false });
await clickEl('button[type=submit]');
await b.sleep(300);
s = await state();
ok(s.consentErr === 'Para enviar, necesitamos tu consentimiento.' && s.consentInvalid === 'true' && s.active === 'cf-consent' && posts().length === n5,
  `error «${s.consentErr}», aria-invalid, foco en ${s.active}, 0 peticiones`);
const desc = await b.eval(`document.querySelector('#cf-consent').getAttribute('aria-describedby')`);
ok(desc === 'cf-consent-err', 'el checkbox apunta a su error con aria-describedby');
await clickEl('#cf-consent');
s = await state();
ok(s.consentErr === null && s.consentInvalid === null, 'marcar el consentimiento limpia el error');
await b.shot(new URL('./capturas/d2-sin-consentimiento-1440.png', import.meta.url).pathname.slice(1), null);
// Con otro error además: el foco va al primer error (email), el consentimiento también se marca.
await fresh('/hablemos/');
await fill({ consent: false, values: { ...VALUES, email: 'no-es-un-email' } });
await clickEl('button[type=submit]');
await b.sleep(300);
s = await state();
ok(s.active === 'cf-email' && s.consentErr !== null, `con email inválido y sin consentimiento: foco en ${s.active} y error de consentimiento visible`);

// 6. Segundo envío antes de 30 s.
console.log('\n## 6. Intervalo mínimo de 30 s');
await fresh('/hablemos/');
mode = 'ok';
await fill();
await clickEl('button[type=submit]');
await waitFor(`!document.querySelector('[data-sent]').hidden`);
await clickEl('[data-sent] button');
s = await state();
ok(!s.formHidden && !s.fieldset && same(Object.values(s.vals), ['', '', '', '', '', '']) && !s.consent && s.active === 'cf-name', `«Enviar otro mensaje»: formulario vacío, consentimiento desmarcado, habilitado, foco en ${s.active}`);
const n6 = posts().length;
await fill();
await clickEl('button[type=submit]');
await b.sleep(400);
s = await state();
const waitText = await b.eval(`document.querySelector('[data-wait]').textContent`);
ok(s.wait && waitText === 'Esperá unos segundos antes de enviar otro mensaje.' && posts().length === n6 && !s.sent, `aviso «${waitText}» y 0 peticiones`);
const left = await b.eval(`30000 - (Date.now() - Number(sessionStorage.getItem('nl-contact-last-sent')))`);
console.log(`      faltan ${left} ms del intervalo; se espera y se reintenta`);
await b.sleep(Math.max(0, left + 300));
await clickEl('button[type=submit]');
await waitFor(`!document.querySelector('[data-sent]').hidden`);
ok(posts().length === n6 + 1, 'pasados los 30 s, el envío sale (1 petición)');

// 7. Bloqueo durante el envío, con la respuesta demorada.
console.log('\n## 7. Bloqueo durante el envío');
await fresh('/hablemos/');
mode = 'hold';
await fill();
const n7 = posts().length;
await clickEl('button[type=submit]');
await waitFor(`document.querySelector('form fieldset').disabled`, 3000);
await b.sleep(300);
s = await state();
ok(s.fieldset && s.button === 'Enviando…', `fieldset deshabilitado y «${s.button}» mientras la respuesta está demorada`);
await clickEl('#cf-name');
await b.send('Input.insertText', { text: 'XYZ' });
await clickEl('#cf-message');
await b.send('Input.insertText', { text: ' más texto' });
await clickEl('#cf-consent');
await clickEl('button[type=submit]');
await b.key('Enter');
s = await state();
ok(same(s.vals, VALUES) && s.consent, `editar campos y desmarcar el consentimiento no tiene efecto (${JSON.stringify(s.vals.name)}, consentimiento ${s.consent})`);
ok(posts().length === n7 + 1, `doble submit ignorado: ${posts().length - n7} petición`);
await b.shot(new URL('./capturas/d2-enviando-bloqueado-1440.png', import.meta.url).pathname.slice(1), null);
await release(200, JSON.stringify({ success: false }));
await waitFor(`!document.querySelector('[data-failed]').hidden`);
s = await state();
ok(s.failed && !s.fieldset && same(s.vals, VALUES) && s.consent, 'tras el error, controles habilitados con los valores intactos');
await clickEl('#cf-role');
await b.send('Input.insertText', { text: ' ✓' });
const role = (await state()).vals.role;
ok(role.includes('✓') && role.length === VALUES.role.length + 2, `tras el error, los campos se pueden editar (rol: «${role}»)`);
await b.eval(`(() => { const el = document.querySelector('[name=role]'); el.value = ${JSON.stringify(VALUES.role)}; el.dispatchEvent(new Event('input', { bubbles: true })); })()`);
await clickEl('button[type=submit]');
await waitFor(`document.querySelector('form fieldset').disabled`, 3000);
await b.sleep(200);
await release(200, JSON.stringify({ success: true }));
await waitFor(`!document.querySelector('[data-sent]').hidden`);
await clickEl('[data-sent] button');
s = await state();
ok(!s.formHidden && !s.fieldset && same(Object.values(s.vals), ['', '', '', '', '', '']) && !s.consent && !s.failed, 'tras «Enviar otro mensaje», formulario vacío y habilitado');

console.log(`\nPeticiones pausadas en total: ${b.fetchLog.length} (POST ${posts().length}, OPTIONS ${b.fetchLog.filter((r) => r.method === 'OPTIONS').length}); ninguna salió a la red (todas respondidas por CDP o redirigidas a 127.0.0.1:4957).`);
console.log(`Diálogos beforeunload aceptados al navegar con el formulario modificado: ${dialogs}`);
console.log(`Errores de consola (los de red son las respuestas 400/500 y el error de red simulados): ${b.consoleErrors.length ? b.consoleErrors.join(' | ') : 'ninguno'}`);
const inesperados = b.consoleErrors.filter((e) => !/^Failed to load resource: .*https:\/\/api\.web3forms\.com\/submit$/.test(e.trim()));
ok(inesperados.length === 0, `sin errores de consola inesperados (${inesperados.length})`);
console.log(`\nRESULTADO D2: ${fails === 0 ? 'OK' : `${fails} FALLA(S)`}`);
await b.close();
process.exit(fails ? 1 : 0);
