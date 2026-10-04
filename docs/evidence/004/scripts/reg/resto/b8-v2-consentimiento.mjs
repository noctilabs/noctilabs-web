// B8 v2-consentimiento: B8 v2 con los cuatro cambios mínimos (Δ1–Δ4) que imponen el aviso y el consentimiento obligatorio del spec 004.
// B8 v2 (gate 002, pasada 2 #5): formulario de Hablemos, ES y EN, sin JS y con JS. Deshabilitado = :disabled
// (el fieldset entero), y un intento de editar el mensaje mientras envía no cambia los valores.
import { launch } from './cdp-ev.mjs';
import { NEW, PORT, OUT } from './lib.mjs';
const b = await launch({ port: PORT });
// Δ4: con el aviso de §2.2 la tarjeta crece y, a 1440×900, el botón y el consentimiento quedan bajo el pliegue. Cada
// click lleva antes su control a la vista (scrollIntoView, centro); el resto del escenario no cambia.
const click0 = b.click;
b.click = async (sel, mods) => { await b.eval(`document.querySelector(${JSON.stringify(sel)})?.scrollIntoView({ block: 'center' })`); await b.sleep(60); return click0(sel, mods); };
let fails = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'OK  ' : 'FALLA'} ${msg}`); if (!cond) fails++; };
const requests = [];
const dialogs = [];
b.on(async (m) => {
  if (m.method === 'Network.requestWillBeSent') requests.push(m.params.request.url);
  if (m.method === 'Page.javascriptDialogOpening') {
    dialogs.push(m.params.type);
    await b.send('Page.handleJavaScriptDialog', { accept: false }); // quedarse en la página
  }
});
await b.send('Network.enable');
const typeIn = async (sel, text) => { await b.click(sel); await b.send('Input.insertText', { text }); await b.sleep(40); };
const clear = (sel) => b.eval(`(() => { const c = document.querySelector(${JSON.stringify(sel)}); c.value = ''; c.dispatchEvent(new Event('input', { bubbles: true })); })()`);
const lum = (hex) => { const c = hex.match(/\w\w/g).map((x) => parseInt(x, 16) / 255).map((v) => (v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const ratio = (a, b2) => { const [x, y] = [lum(a), lum(b2)].sort((p, q) => q - p); return ((x + .05) / (y + .05)).toFixed(2); };
try {
  await b.viewport(1440, 900);

  // ---- Sin JS ----
  await b.send('Emulation.setScriptExecutionDisabled', { value: true });
  await b.goto(NEW + '/hablemos/');
  requests.length = 0;
  const s0 = await b.eval(`({ disabled: document.querySelector('form fieldset').disabled, noscript: !!document.querySelector('noscript') })`);
  ok(s0.disabled && s0.noscript, 'sin JS: fieldset deshabilitado y <noscript> presente');
  await b.click('form button[type=submit]');
  await b.click('#cf-name');
  await b.key('Enter');
  await b.sleep(500);
  const s1 = await b.eval(`({ path: location.pathname + location.search, active: document.activeElement.tagName })`);
  ok(s1.path === '/hablemos/' && requests.length === 0, `sin JS: click y Enter no envían (url ${s1.path}, pedidos ${requests.length}, foco ${s1.active})`);
  await b.shot(OUT + 'b8-sin-js.png', { x: 0, y: 0, width: 1440, height: 900 });
  await b.send('Emulation.setScriptExecutionDisabled', { value: false });

  for (const [lang, path] of [['es', '/hablemos/'], ['en', '/en/contact/']]) {
    await b.goto(NEW + path);
    // Δ1 (spec 004): la tabla de §4.6 son los 6 controles de datos; el consentimiento y el honeypot se verifican en D2/D3.
    const table = await b.eval(`[...document.querySelectorAll('form input:not([type=checkbox]), form select, form textarea')].map((c) => ({
      label: document.querySelector('label[for="' + c.id + '"]')?.textContent, name: c.name, type: c.type, autocomplete: c.getAttribute('autocomplete'),
      required: c.required, spellcheck: c.getAttribute('spellcheck'), placeholder: c.placeholder, border: getComputedStyle(c).borderTopColor,
      firstOption: c.tagName === 'SELECT' ? c.options[0].value + '|' + c.options[0].text + '|' + c.options.length : undefined }))`);
    console.table(table);
    const exp = [['name', 'text', 'name', true], ['email', 'email', 'email', true], ['organization', 'text', 'organization', true],
      ['role', 'text', 'organization-title', false], ['industry', 'select-one', null, false], ['message', 'textarea', null, true]];
    ok(exp.every(([n, t, a, r], i) => table[i].name === n && table[i].type === t && table[i].autocomplete === a && table[i].required === r && table[i].label),
      `${lang}: labels, name, tipo, autocomplete y requeridos según §4.6`);
    ok(table[1].spellcheck === 'false' && table[4].firstOption.startsWith('|') && table[4].firstOption.endsWith('|7'), `${lang}: email sin spellcheck; select con opción vacía + 5 + Otra`);
    ok(table.every((r) => r.border === 'rgb(118, 118, 118)'), `${lang}: borde #767676 en reposo (${ratio('767676', 'FFFFFF')}:1 sobre blanco, ${ratio('767676', 'F4F4F2')}:1 sobre #F4F4F2)`);
    if (lang === 'es') await b.shot(OUT + 'b8-idle.png', { x: 0, y: 0, width: 1440, height: 900 });

    // Validación: vacío (con espacios en el nombre)
    await typeIn('#cf-name', '   ');
    await b.click('form button[type=submit]');
    await b.sleep(200);
    let v = await b.eval(`({ focus: document.activeElement.id,
      errs: [...document.querySelectorAll('form [aria-invalid="true"]')].map((c) => c.id + '→' + c.getAttribute('aria-describedby') + ':' + document.getElementById(c.getAttribute('aria-describedby')).textContent) })`);
    console.log(lang, JSON.stringify(v));
    // Δ2 (spec 004 §2.2): el consentimiento es obligatorio, así que con el formulario vacío hay un quinto error.
    ok(v.errs.length === 5 && v.errs[4].startsWith('cf-consent→cf-consent-err:') && v.focus === 'cf-name', `${lang}: 4 errores en línea + el del consentimiento (nombre con espacios cuenta como vacío) y foco en el primero`);
    if (lang === 'es') await b.shot(OUT + 'b8-errores.png', { x: 0, y: 0, width: 1440, height: 900 });
    await typeIn('#cf-name', 'Ana');
    v = await b.eval(`({ inv: document.querySelector('#cf-name').getAttribute('aria-invalid'), hidden: document.querySelector('#cf-name-err').hidden, others: document.querySelectorAll('form [aria-invalid="true"]').length })`);
    ok(v.inv === null && v.hidden && v.others === 4, `${lang}: editar limpia sólo el error de ese campo`);
    // Δ3: se marca el consentimiento antes de seguir; desde acá el escenario es el de la fase 2.
    await b.eval(`document.querySelector('#cf-consent').click()`);
    await typeIn('#cf-email', 'ana@');
    await typeIn('#cf-organization', 'Empresa');
    await typeIn('#cf-message', 'Hola');
    await b.click('form button[type=submit]');
    await b.sleep(200);
    v = await b.eval(`({ focus: document.activeElement.id, msg: document.querySelector('#cf-email-err').textContent, n: document.querySelectorAll('form [aria-invalid="true"]').length })`);
    ok(v.focus === 'cf-email' && v.n === 1, `${lang}: email inválido → «${v.msg}», foco en email`);
    await clear('#cf-email');
    await typeIn('#cf-email', 'ana@empresa.com');

    // Enviando: se congelan los rAF para capturar el estado pintado y probar el doble submit.
    const st = await b.eval(`(() => {
      window.__raf = []; window.__rafN = 0; const orig = window.requestAnimationFrame;
      window.__origRaf = orig; window.requestAnimationFrame = (cb) => { window.__rafN++; window.__raf.push(cb); return 0; };
      const f = document.querySelector('form'), btn = f.querySelector('button[type=submit]');
      f.requestSubmit();
      const first = { text: btn.textContent, disabled: btn.matches(':disabled') && [...f.querySelectorAll('input, select, textarea')].every((c) => c.matches(':disabled')), live: !document.querySelector('[data-sending]').hidden, raf: window.__rafN };
      f.requestSubmit(); f.dispatchEvent(new Event('submit', { cancelable: true }));
      return { ...first, rafAfterSecond: window.__rafN };
    })()`);
    console.log(lang, JSON.stringify(st));
    ok(/…$/.test(st.text) && st.disabled && st.live && st.raf === 1 && st.rafAfterSecond === 1, `${lang}: «${st.text}» sincrónico, botón y campos :disabled, doble submit ignorado`);
    await typeIn('#cf-message', ' editado');
    ok(await b.eval(`document.querySelector('#cf-message').value === 'Hola'`), `${lang}: escribir en el mensaje mientras envía no cambia el valor`);
    await b.sleep(100);
    if (lang === 'es') await b.shot(OUT + 'b8-enviando.png', { x: 0, y: 0, width: 1440, height: 900 });
    await b.eval(`(() => { window.requestAnimationFrame = window.__origRaf; const q = window.__raf; window.__raf = []; q.forEach((cb) => requestAnimationFrame(cb)); })()`);
    await b.sleep(400);
    v = await b.eval(`({ failed: !document.querySelector('[data-failed]').hidden, text: document.querySelector('[data-failed]').textContent, mail: document.querySelector('[data-failed] a')?.getAttribute('href'),
      btn: document.querySelector('form button[type=submit]').textContent, disabled: [...document.querySelectorAll('form button[type=submit], form input, form select, form textarea')].some((c) => c.matches(':disabled')),
      values: ['name', 'email', 'organization', 'message'].map((n) => document.querySelector('#cf-' + n).value), sent: !document.querySelector('[data-sent]').hidden,
      live: document.querySelector('[data-failed]').closest('[aria-live]')?.getAttribute('aria-live') })`);
    console.log(lang, JSON.stringify(v));
    ok(v.failed && v.mail === 'mailto:hola@noctilabs.io' && !v.disabled && !/…$/.test(v.btn) && v.values.join('|') === '   Ana|ana@empresa.com|Empresa|Hola' && !v.sent && v.live === 'polite',
      `${lang}: estado error con el mail, botón y campos habilitados, valores conservados, en región aria-live polite`);
    if (lang === 'es') await b.shot(OUT + 'b8-error.png', { x: 0, y: 0, width: 1440, height: 900 });

    // beforeunload con cambios
    dialogs.length = 0;
    await b.click(`header a[href="${lang === 'es' ? '/nosotros/' : '/en/about/'}"]`);
    await b.sleep(800);
    ok(dialogs.includes('beforeunload') && (await b.eval('location.pathname')) === path, `${lang}: salir con cambios dispara beforeunload (${JSON.stringify(dialogs)})`);
    // vacío: sin aviso
    for (const n of ['name', 'email', 'organization', 'message']) await clear('#cf-' + n);
    dialogs.length = 0;
    await b.click(`header a[href="${lang === 'es' ? '/nosotros/' : '/en/about/'}"]`);
    await b.sleep(800);
    ok(dialogs.length === 0 && (await b.eval('location.pathname')) !== path, `${lang}: con el formulario vacío no hay aviso y navega`);
  }
  console.log('consola:', JSON.stringify(b.consoleErrors));
  console.log(fails ? `${fails} FALLAS` : 'B8 CDP: todo OK');
} finally { await b.close(); }
