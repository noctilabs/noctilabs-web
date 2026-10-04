// B13 contenido largo con el CMS (gate 002, hallazgo 5), sobre el build con F8: un identificador de 120 caracteres
// sin espacios en párrafo, H2, cita y resumen del destacado. A 320 px, sin desborde ni recortes (layoutcheck v2).
// Control negativo: el mismo chequeo detecta un texto largo inyectado en un contenedor con overflow hidden.
import { launch } from '../cdp.mjs';
import { LAYOUT } from '../layoutcheck.mjs';
const b = await launch({ port: 9362 });
let fails = 0;
try {
  await b.viewport(320, 700, false);
  for (const r of ['/insights/', '/en/insights/', '/insights/gate-cuerpo/', '/en/insights/gate-cuerpo/']) {
    await b.goto('http://localhost:4932' + r);
    const L = await b.eval(LAYOUT);
    const largo = await b.eval(`[...document.querySelectorAll('.prose-article p, .prose-article h2, .prose-article blockquote, .f-excerpt')].filter(e => /Identificadorlargo/.test(e.textContent)).map(e => e.tagName.toLowerCase() + (e.className ? '.' + e.className : '') + ' right=' + Math.round(e.getBoundingClientRect().right))`);
    const ok = L.scrollW <= 320 && !L.desborde.length && !L.recorte.length && !L.superpuestos.length && largo.length > 0;
    if (!ok) fails++;
    console.log(`${ok ? 'OK   ' : 'FALLA'} 320 ${r}: scrollWidth ${L.scrollW}; con el identificador largo: ${JSON.stringify(largo)}`
      + ['desborde', 'recorte', 'superpuestos'].map((k) => L[k].length ? `\n      ${k}: ${JSON.stringify(L[k].slice(0, 8))}` : '').join(''));
  }
  await b.eval(`(() => { const d = document.createElement('div'); d.style.cssText = 'overflow:hidden;width:60px'; d.innerHTML = '<span style="white-space:nowrap">Controlnegativoconunapalabramuylarga</span>'; document.querySelector('main').prepend(d); })()`);
  const N = await b.eval(LAYOUT);
  const neg = N.recorte.some((x) => /recortado por ancestro/.test(x) && /Controlnegativo/.test(x));
  if (!neg) fails++;
  console.log(`${neg ? 'OK   ' : 'FALLA'} control negativo: el recorte por ancestro se detecta — ${JSON.stringify(N.recorte.slice(0, 2))}`);
  console.log(`consola: ${JSON.stringify(b.consoleErrors)}\nfallas: ${fails}`);
} finally { await b.close(); }
