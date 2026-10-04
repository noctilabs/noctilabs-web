// D3 (spec 004 §5): aviso y política en ES y EN. Aviso completo antes del botón con aria-describedby; link a la
// política en pestaña nueva con su aviso; checkbox accesible; teclado; contraste sobre el fondo efectivo; zoom 200 %
// y reflow a 320 px; política con canonical, hreflang y link en el footer. Uso: node d3.mjs [base] [puertoCDP]
import { launch } from './cdp.mjs';
import { LAYOUT } from './layoutcheck.mjs';

const BASE = process.argv[2] || 'http://localhost:4952';
const b = await launch({ port: Number(process.argv[3] || 9385) });
let fails = 0;
const ok = (cond, msg) => { if (!cond) fails++; console.log(`${cond ? 'OK   ' : 'FALLA'} ${msg}`); };
const ORIGIN = 'https://www.noctilabs.io';

const L = {
  es: {
    form: '/hablemos/', policy: '/privacidad/', other: '/en/privacy/',
    items: ['[RAZÓN SOCIAL]', '[RUT]', '[DOMICILIO]', 'responder tu consulta y coordinar una conversación comercial', 'correo del equipo', 'Web3Forms', 'India', 'subencargados', 'nombre, email, empresa y mensaje', 'no podemos responderte', '24 meses desde el último contacto', 'mientras dure y 24 meses más', 'acceso, rectificación, actualización y supresión', 'hola@noctilabs.io'],
    newTab: '(se abre en una pestaña nueva)',
    consent: 'Acepto que NoctiLabs trate mis datos para responder esta consulta, incluida su transferencia a Web3Forms, según el aviso y la política de privacidad.',
    footer: 'Privacidad', h1: 'Política de privacidad', title: 'Privacidad — NoctiLabs',
    sections: ['Responsable', 'Qué datos tratamos y para qué', 'Base legal', 'Dónde se guardan y quién los procesa', 'Cuánto tiempo los conservamos', 'Cookies', 'Analítica', 'Tus derechos'],
    policyText: ['no usa cookies propias ni de terceros', 'Vercel Web Analytics', 'Web3Forms', 'Vercel', 'Sanity', 'Última actualización', '[RAZÓN SOCIAL]'],
  },
  en: {
    form: '/en/contact/', policy: '/en/privacy/', other: '/privacidad/',
    items: ['[RAZÓN SOCIAL]', '[RUT]', '[DOMICILIO]', 'answer your inquiry and set up a business conversation', 'team’s email', 'Web3Forms', 'India', 'sub-processors', 'name, email, company and message', 'we cannot reply', '24 months from the last contact', 'for its duration plus 24 months', 'access, rectification, update and deletion', 'hola@noctilabs.io'],
    newTab: '(opens in a new tab)',
    consent: 'I agree that NoctiLabs may process my data to answer this inquiry, including its transfer to Web3Forms, as described in the notice and the privacy policy.',
    footer: 'Privacy', h1: 'Privacy policy', title: 'Privacy — NoctiLabs',
    sections: ['Controller', 'What data we process and why', 'Legal basis', 'Where it is stored and who processes it', 'How long we keep it', 'Cookies', 'Analytics', 'Your rights'],
    policyText: ['uses no first-party or third-party cookies', 'Vercel Web Analytics', 'Web3Forms', 'Vercel', 'Sanity', 'Last updated', '[RAZÓN SOCIAL]'],
  },
};

// Contraste WCAG contra el fondo efectivo (primer ancestro con fondo opaco).
const CONTRAST = `(sel) => {
  const lum = (c) => { const [r, g, b] = c.match(/[\\d.]+/g).slice(0, 3).map(Number).map((v) => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
  const bg = (e) => { for (; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; const a = c.match(/[\\d.]+/g); if (a && (a.length < 4 || +a[3] === 1)) return c; } return 'rgb(255, 255, 255)'; };
  return [...document.querySelectorAll(sel)].map((e) => { const fg = getComputedStyle(e).color, b = bg(e); const [l1, l2] = [lum(fg), lum(b)].sort((x, y) => y - x); return { el: e.tagName.toLowerCase() + (e.className ? '.' + String(e.className).split(' ')[0] : ''), fg, bg: b, ratio: Math.round((l1 + .05) / (l2 + .05) * 100) / 100 }; });
}`;

for (const [loc, t] of Object.entries(L)) {
  console.log(`\n## ${loc.toUpperCase()} — aviso y consentimiento (${t.form})`);
  await b.viewport(1440, 900);
  await b.goto(BASE + t.form);
  const n = await b.eval(`(() => {
    const form = document.querySelector('form'); const notice = document.getElementById('cf-notice'); const btn = form.querySelector('button[type=submit]');
    const link = notice.querySelector('a');
    const cb = document.getElementById('cf-consent'); const lab = document.querySelector('label[for=cf-consent]');
    return {
      describedby: form.getAttribute('aria-describedby'),
      before: !!(notice.compareDocumentPosition(btn) & Node.DOCUMENT_POSITION_FOLLOWING),
      aboveButton: notice.getBoundingClientRect().bottom <= btn.getBoundingClientRect().top,
      cbBefore: !!(cb.compareDocumentPosition(btn) & Node.DOCUMENT_POSITION_FOLLOWING),
      visible: notice.offsetHeight > 0 && getComputedStyle(notice).visibility === 'visible',
      text: notice.textContent.replace(/\\s+/g, ' '),
      href: link.getAttribute('href'), target: link.target, rel: link.rel, srOnly: link.querySelector('.sr-only')?.textContent,
      cbType: cb.type, cbRequired: cb.getAttribute('aria-required') === 'true' && !cb.hasAttribute('required'), cbChecked: cb.checked, label: lab?.textContent.trim(),
    };
  })()`);
  ok(n.describedby === 'cf-notice', `el formulario apunta al aviso con aria-describedby="${n.describedby}"`);
  ok(n.before && n.aboveButton && n.visible, 'el aviso es visible y está antes del botón (DOM y posición)');
  const missing = t.items.filter((i) => !n.text.includes(i));
  ok(missing.length === 0, `el aviso informa responsable (marcadores), finalidad, almacenamiento, obligatorios, transferencia, plazo y derechos${missing.length ? ` — faltan: ${missing.join(' | ')}` : ''}`);
  ok(n.href === t.policy && n.target === '_blank' && /noopener/.test(n.rel) && n.srOnly?.trim() === t.newTab, `link a ${n.href}, target _blank, rel "${n.rel}", aviso «${n.srOnly?.trim()}»`);
  ok(n.cbType === 'checkbox' && n.cbRequired && !n.cbChecked && n.label === t.consent && n.cbBefore, 'checkbox obligatorio (aria-required, sin el required nativo que Chrome expone como inválido antes de enviar), desmarcado, con <label> propio y antes del botón');

  // Árbol accesible: nombre del checkbox y del link, descripción del formulario.
  await b.send('Accessibility.enable');
  const { nodes } = await b.send('Accessibility.getFullAXTree');
  const name = (n) => n.name?.value ?? '';
  const cbAx = nodes.find((x) => x.role?.value === 'checkbox' && !x.ignored);
  const linkAx = nodes.find((x) => x.role?.value === 'link' && name(x).includes(t.newTab));
  const formAx = nodes.find((x) => x.role?.value === 'form');
  const formDesc = formAx?.description?.value ?? '';
  const axp = (k) => cbAx?.properties?.find((p) => p.name === k)?.value.value;
// Chrome no expone la propiedad «required» en checkboxes (ni con required nativo ni con aria-required): se registra.
ok(cbAx && name(cbAx) === t.consent && axp('invalid') === 'false' && axp('checked') === 'false' && axp('focusable') === true, `AX: checkbox con nombre del label «${name(cbAx).slice(0, 50)}…», no marcado, enfocable, invalid ${axp('invalid')} antes de enviar (required en el árbol de Chrome: ${axp('required') ?? 'no expuesto'})`);
  ok(!!linkAx, `AX: link «${linkAx ? name(linkAx) : '—'}»`);
  ok(formDesc.includes(t.items[3]), `AX: el formulario tiene como descripción el aviso (${formDesc.length} caracteres)`);
  const honeypotAx = nodes.filter((x) => x.role?.value === 'checkbox' && !x.ignored).length;
  ok(honeypotAx === 1, `AX: un solo checkbox expuesto (el honeypot queda fuera del árbol): ${honeypotAx}`);

  // Teclado: desde el mensaje, Tab recorre link → checkbox → botón (el honeypot no recibe foco); Espacio marca.
  await b.eval(`document.getElementById('cf-message').focus()`);
  const seq = [];
  for (let i = 0; i < 3; i++) {
    await b.key('Tab');
    seq.push(await b.eval(`(() => { const a = document.activeElement; return { id: a.id || a.tagName, name: a.name || '', fv: a.matches(':focus-visible'), outline: getComputedStyle(a).outlineStyle + ' ' + getComputedStyle(a).outlineWidth }; })()`));
  }
  ok(seq[0].id === 'A' && seq[1].id === 'cf-consent' && seq[2].id === 'BUTTON' && seq.every((s) => s.name !== 'botcheck'),
    `Tab: ${seq.map((s) => s.id).join(' → ')} (sin pasar por el honeypot)`);
  ok(seq.every((s) => s.fv && !/^none/.test(s.outline)), `foco visible en los tres (${seq.map((s) => s.outline).join(' / ')})`);
  await b.key('Tab', { shift: true });
  await b.key(' ');
  ok(await b.eval(`document.getElementById('cf-consent').checked`), 'Espacio sobre el checkbox lo marca');
  await b.key(' ');
  ok(!(await b.eval(`document.getElementById('cf-consent').checked`)), 'Espacio otra vez lo desmarca');
  // Error en línea del consentimiento (texto visible) para el contraste.
  await b.eval(`(() => { for (const [k, v] of Object.entries({ name: 'A', email: 'a@b.co', organization: 'C', message: 'D' })) document.querySelector('[name="' + k + '"]').value = v; document.querySelector('button[type=submit]').click(); })()`);
  await b.sleep(200);

  // Contraste.
  const c = await b.eval(`(${CONTRAST})('#cf-notice p, #cf-notice li, #cf-notice strong, #cf-notice a, label[for=cf-consent], #cf-consent-err')`);
  const low = c.filter((x) => x.ratio < 4.5);
  ok(low.length === 0, `contraste ≥ 4,5:1 en el aviso, el label y el error (mínimo ${Math.min(...c.map((x) => x.ratio))}:1; ${[...new Set(c.map((x) => `${x.el} ${x.fg} sobre ${x.bg} = ${x.ratio}`))].join('; ')})`);
  const cbBorder = await b.eval(`(() => { const e = document.getElementById('cf-consent'); const r = e.getBoundingClientRect(); return { w: r.width, h: r.height, accent: getComputedStyle(e).accentColor }; })()`);
  console.log(`      checkbox nativo ${cbBorder.w}×${cbBorder.h} px, accent-color ${cbBorder.accent}`);
  await b.eval(`document.querySelector('form').reset(); document.querySelector('form').dispatchEvent(new Event('input', { bubbles: true }))`);

  // Zoom 200 % (1280×800 a 2×) y reflow a 320 px: sin desbordes, recortes ni superposiciones.
  for (const [label, w, h, dsf, mobile] of [['zoom 200 %', 640, 400, 2, false], ['reflow 320 px', 320, 700, 1, true]]) {
    await b.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dsf, mobile });
    for (const path of [t.form, t.policy]) {
      await b.goto(BASE + path);
      const r = await b.eval(LAYOUT);
      // El honeypot está fuera de pantalla por diseño (§2.3, aria-hidden): se saca del desborde y se registra aparte.
      const hp = r.desborde.filter((d) => /^div\.hp «» |^input «» -99/.test(d));
      r.desborde = r.desborde.filter((d) => !hp.includes(d));
      if (hp.length) console.log(`      honeypot fuera de pantalla excluido del desborde: ${hp.join(', ')}`);
      const fine = r.scrollW <= r.W && !r.desborde.length && !r.recorte.length && !r.superpuestos.length;
      ok(fine, `${label} ${path}: scrollWidth ${r.scrollW}/${r.W}${fine ? '' : ` ${JSON.stringify({ d: r.desborde.slice(0, 3), r: r.recorte.slice(0, 3), s: r.superpuestos.slice(0, 3) })}`}`);
      if (path === t.form) {
        const shot = new URL(`./capturas/d3-aviso-${loc}-${label.split(' ')[0]}${w}.png`, import.meta.url).pathname.slice(1);
        await b.eval(`document.getElementById('cf-notice').scrollIntoView({ block: 'start' })`);
        await b.sleep(150);
        await b.shot(shot, null);
        // Operable con el zoom: enviar vacío marca los 4 campos obligatorios + el consentimiento y enfoca Nombre.
        const op = await b.eval(`(() => { const f = document.querySelector('form'); f.requestSubmit(); const inv = [...document.querySelectorAll('form [aria-invalid="true"]')].map((c) => c.id); return { inv, focus: document.activeElement.id }; })()`);
        ok(op.inv.join() === 'cf-name,cf-email,cf-organization,cf-message,cf-consent' && op.focus === 'cf-name', `${label} ${path}: formulario operable (${op.inv.length} errores: ${op.inv.join(', ')}; foco en ${op.focus})`);
        await b.eval(`document.querySelector('form').reset()`);
      }
    }
  }
  await b.viewport(1440, 900);

  console.log(`\n## ${loc.toUpperCase()} — política (${t.policy})`);
  await b.goto(BASE + t.policy);
  const p = await b.eval(`(() => {
    const q = (s) => document.querySelector(s);
    return {
      lang: document.documentElement.lang, title: document.title, h1: q('main h1')?.textContent.trim(),
      canonical: q('link[rel=canonical]')?.href, es: q('link[hreflang=es]')?.href, en: q('link[hreflang=en]')?.href, xd: q('link[hreflang=x-default]')?.href,
      robots: q('meta[name=robots]')?.content ?? null,
      prose: !!q('main .prose-article'), toc: !!q('main .toc, main nav'),
      h2: [...document.querySelectorAll('main .prose-article h2')].map((h) => h.textContent.trim()),
      text: q('main').textContent.replace(/\\s+/g, ' '),
      footer: [...document.querySelectorAll('footer a')].map((a) => [a.textContent.trim(), a.getAttribute('href')]),
      lang2: q('.site-footer .lang a, header .lang a')?.getAttribute('href'),
    };
  })()`);
  ok(p.lang === loc && p.title === t.title && p.h1 === t.h1, `lang ${p.lang}, title «${p.title}», H1 «${p.h1}»`);
  ok(p.canonical === ORIGIN + t.policy && p.es === `${ORIGIN}/privacidad/` && p.en === `${ORIGIN}/en/privacy/` && p.xd === `${ORIGIN}/privacidad/` && p.robots === null,
    `canonical ${p.canonical}; hreflang es ${p.es}, en ${p.en}, x-default ${p.xd}; sin noindex`);
  ok(p.prose && !p.toc && p.h2.join('|') === t.sections.join('|'), `.prose-article sin índice; secciones: ${p.h2.join(' · ')}`);
  const pm = t.policyText.filter((x) => !p.text.includes(x));
  ok(pm.length === 0, `contenido: cookies, analítica, encargados, fecha y marcadores${pm.length ? ` — faltan ${pm.join(', ')}` : ''}`);
  ok(p.footer.some(([txt, href]) => txt === t.footer && href === t.policy), `footer con «${t.footer}» → ${t.policy}`);
  ok(p.lang2 === t.other, `selector de idioma → ${p.lang2}`);
  // El footer de las otras páginas también lleva el link.
  await b.goto(BASE + (loc === 'es' ? '/' : '/en/'));
  const fl = await b.eval(`[...document.querySelectorAll('footer a')].some((a) => a.textContent.trim() === ${JSON.stringify(t.footer)} && a.getAttribute('href') === ${JSON.stringify(t.policy)})`);
  ok(fl, `el footer del home ${loc} enlaza la política`);
}
console.log(`\nErrores de consola: ${b.consoleErrors.length ? b.consoleErrors.join(' | ') : 'ninguno'}`);
ok(b.consoleErrors.length === 0, 'sin errores de consola');
console.log(`\nRESULTADO D3 (CDP): ${fails === 0 ? 'OK' : `${fails} FALLA(S)`}`);
await b.close();
process.exit(fails ? 1 : 0);
