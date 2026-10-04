// B15 zoom del navegador (v2, gate 002 hallazgo 9: layout medido con cada una de las cinco industrias del home y recorte por ancestros) (WCAG 1.4.4): ventana de 1280×800 con deviceScaleFactor = zoom y layout de 1280/zoom CSS px,
// en 100 (base), 125, 150, 175, 200 y 400 %. Por paso y página: tamaño renderizado (px de dispositivo) del texto de cuerpo
// y de los títulos display, layout (desborde, recorte, superposición), recorrido con Tab (foco visible, no tapado) y
// operabilidad de los controles de la fase 2. Capturas de página completa al 200 %.
import { writeFileSync } from 'node:fs';
import { launch } from './cdp.mjs';
import { routes, NEW } from './routes.mjs';
import { LAYOUT } from './layoutcheck.mjs';
const OUT = new URL('./b15out/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const ZOOMS = [1, 1.25, 1.5, 1.75, 2, 4];
const b = await launch({ port: 9360 });
const tab = async () => {
  const base = { key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers: 0 };
  await b.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...base });
  await b.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
  await b.sleep(50);
};
// Marca, a 100 %, el primer texto de cuerpo de 16 px dentro de main y los títulos display, con una ruta estable.
const PATH = `(e) => { const p = []; for (; e && e !== document.body; e = e.parentElement) { let i = 1; for (let s = e.previousElementSibling; s; s = s.previousElementSibling) if (s.tagName === e.tagName) i++; p.unshift(e.tagName.toLowerCase() + ':nth-of-type(' + i + ')'); } return 'body > ' + p.join(' > '); }`;
const PICK = `(() => {
  const path = ${PATH};
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility === 'visible' && !e.closest('[hidden], .sr-only'); };
  const body = [...document.querySelectorAll('main p, main li')].find((e) => vis(e) && getComputedStyle(e).fontSize === '16px' && e.textContent.trim().length > 10);
  const out = { cuerpo: body ? path(body) : null };
  const h1 = document.querySelector('main h1'); if (h1) out.h1 = path(h1);
  const h2 = [...document.querySelectorAll('main h2')].find((e) => vis(e) && parseFloat(getComputedStyle(e).fontSize) >= 27); if (h2) out.h2 = path(h2);
  const band = document.querySelector('.band .word'); if (band) out['banda «Hablemos.»'] = path(band);
  return out;
})()`;
const SIZE = (sel) => `(() => { const e = document.querySelector(${JSON.stringify(sel)}); return e ? parseFloat(getComputedStyle(e).fontSize) : null; })()`;
const STEP = `(() => {
  const a = document.activeElement;
  if (!a || a === document.body) return { body: true };
  if (!a.dataset.k) a.dataset.k = String(window.__k = (window.__k || 0) + 1);
  const r = a.getBoundingClientRect(); const cs = getComputedStyle(a);
  const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none' || /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName);
  let n = 0, c = 0;
  if (!a.closest('.site-header')) for (let i = 0; i < 7; i++) for (let j = 0; j < 5; j++) {
    const x = r.left + (i + .5) * r.width / 7, y = r.top + (j + .5) * r.height / 5;
    if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
    n++; const hit = document.elementFromPoint(x, y); if (hit && hit.closest('.site-header .capsule') && !a.contains(hit)) c++;
  }
  return { k: +a.dataset.k, d: a.tagName.toLowerCase() + ' «' + (a.getAttribute('aria-label') || a.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 28) + '»', fv: a.matches(':focus-visible'), ring, cubierto: n ? c / n : 0 };
})()`;
let fails = 0;
const tabla = [];
try {
  const list = [...routes(), '/404.html'];
  const picks = {};
  const base = {};
  for (const z of ZOOMS) {
    const W = Math.round(1280 / z), H = Math.round(800 / z);
    await b.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: z, mobile: false });
    for (const r of list) {
      await b.goto(NEW + r);
      if (z === 1) picks[r] = await b.eval(PICK);
      const sizes = {};
      for (const [k, sel] of Object.entries(picks[r])) if (sel) sizes[k] = await b.eval(SIZE(sel));
      if (z === 1) base[r] = sizes;
      // Tamaños en px de dispositivo.
      const dev = Object.fromEntries(Object.entries(sizes).map(([k, v]) => [k, v === null ? null : +(v * z).toFixed(1)]));
      const cuerpoOk = dev.cuerpo === null || dev.cuerpo === undefined || Math.abs(dev.cuerpo - 16 * z) < .05;
      let displayOk = true; const notas = [];
      for (const k of Object.keys(dev)) if (k !== 'cuerpo' && dev[k] !== null) {
        const ratio = dev[k] / base[r][k];
        if (z === 4 && ratio < 2) { displayOk = false; notas.push(`${k} ×${ratio.toFixed(2)} < 2`); }
        if (z > 1 && z < 4 && ratio < 1) notas.push(`${k} ×${ratio.toFixed(2)} (achica al cruzar el corte de 1000 px)`);
      }
      // Layout.
      for (let y = 0; y < 30; y++) { const done = await b.eval(`(() => { scrollBy(0, innerHeight); return innerHeight + scrollY >= document.documentElement.scrollHeight - 2; })()`); await b.sleep(40); if (done) break; }
      await b.eval('scrollTo(0,0)'); await b.sleep(100);
      const L = await b.eval(LAYOUT);
      // En el home, el layout se mide además con cada industria activa (las tabs cambian el panel visible).
      if (r === '/' || r === '/en/') for (const ind of ['retail', 'manufactura', 'consumo', 'salud', 'servicios']) {
        await b.eval(`document.getElementById('ind-tab-${ind}').click()`); await b.sleep(250);
        const Li = await b.eval(LAYOUT);
        L.scrollW = Math.max(L.scrollW, Li.scrollW);
        for (const k of ['desborde', 'recorte', 'superpuestos']) L[k].push(...Li[k].map((x) => `[${ind}] ${x}`));
      }
      if (r === '/' || r === '/en/') { await b.eval(`document.getElementById('ind-tab-retail').click()`); await b.eval('scrollTo(0,0)'); await b.sleep(100); }
      const layoutOk = L.scrollW <= W && !L.desborde.length && !L.recorte.length && !L.superpuestos.length;
      // Tab hacia adelante: foco visible y no tapado.
      const seq = [];
      for (let i = 0; i < 200; i++) { await tab(); const s = await b.eval(STEP); if (s.body || seq.some((x) => x.k === s.k)) break; seq.push(s); }
      const sinFoco = seq.filter((s) => !s.fv || !s.ring).map((s) => s.d);
      const tapados = seq.filter((s) => s.cubierto > 0).map((s) => `${s.d} ${Math.round(s.cubierto * 100)}%`);
      // Operabilidad de los controles de la fase 2.
      let oper = '';
      if (r === '/' || r === '/en/') {
        const o = await b.eval(`(async () => {
          document.querySelector('[data-ba-set=con]').click(); const a = document.querySelector('[data-ba]').dataset.state;
          document.querySelector('[data-ba-set=sin]').click(); const s = document.querySelector('[data-ba]').dataset.state;
          document.getElementById('ind-tab-salud').click(); const sel = document.getElementById('ind-tab-salud').getAttribute('aria-selected');
          const vis = !document.getElementById('ind-panel-salud').hidden;
          return a === 'con' && s === 'sin' && sel === 'true' && vis; })()`);
        oper = ` · controles ${o ? 'operables' : 'NO operables'}`; if (!o) fails++;
      }
      if (r === '/hablemos/' || r === '/en/contact/') {
        const o = await b.eval(`(() => { const f = document.querySelector('form'); f.requestSubmit(); return document.querySelectorAll('form [aria-invalid="true"]').length === 4 && document.activeElement.id === 'cf-name'; })()`);
        oper = ` · formulario ${o ? 'operable (4 errores, foco en Nombre)' : 'NO operable'}`; if (!o) fails++;
      }
      const ok = cuerpoOk && displayOk && layoutOk && !sinFoco.length && !tapados.length;
      if (!ok) fails++;
      tabla.push({ z, r, dev });
      console.log(`${ok ? 'OK   ' : 'FALLA'} ${Math.round(z * 100)}% (layout ${W}) ${r} · tamaños de dispositivo ${JSON.stringify(dev)}${notas.length ? ' · ' + notas.join('; ') : ''} · ${seq.length} paradas de Tab${oper}`
        + (L.scrollW > W ? `\n      scrollWidth ${L.scrollW}` : '')
        + ['desborde', 'recorte', 'superpuestos'].map((k) => L[k].length ? `\n      ${k}: ${JSON.stringify(L[k].slice(0, 8))}` : '').join('')
        + (sinFoco.length ? `\n      sin foco visible: ${JSON.stringify(sinFoco)}` : '')
        + (tapados.length ? `\n      foco tapado por la cápsula: ${JSON.stringify(tapados)}` : ''));
      if (z === 2 && !r.startsWith('/en/')) {
        await b.eval('scrollTo(0,0)');
        const h = await b.eval('document.documentElement.scrollHeight');
        await b.eval(`(() => { const s = document.createElement('style'); s.id = '__hh'; s.textContent = '.site-header{position:relative!important}'; document.head.append(s); })()`);
        const res = await b.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: W, height: h, scale: 1 } });
        writeFileSync(OUT + 'zoom-200' + (r.replace(/\//g, '-').replace(/-$/, '') || '-home') + '.png', Buffer.from(res.data, 'base64'));
      }
    }
  }
  // Tabla resumen: tamaño de dispositivo por paso para el cuerpo y los display del home y de una página interna.
  console.log('\nTabla de tamaños renderizados (px de dispositivo; entre paréntesis, relación con 100 %):');
  for (const r of ['/', '/producto/', '/industrias/retail-distribucion/', '/insights/no-context-no-intelligence/', '/hablemos/']) {
    const keys = Object.keys(tabla.find((t) => t.r === r && t.z === 1).dev);
    console.log(`  ${r}`);
    console.log('    ' + ['elemento'.padEnd(20), ...ZOOMS.map((z) => (Math.round(z * 100) + '%').padStart(16))].join(''));
    for (const k of keys) {
      const b1 = tabla.find((t) => t.r === r && t.z === 1).dev[k];
      console.log('    ' + [k.padEnd(20), ...ZOOMS.map((z) => { const v = tabla.find((t) => t.r === r && t.z === z).dev[k]; return `${v} (×${(v / b1).toFixed(2)})`.padStart(16); })].join(''));
    }
  }
  console.log(`\nconsola: ${JSON.stringify(b.consoleErrors)}\nfallas: ${fails}`);
} finally { await b.close(); }
