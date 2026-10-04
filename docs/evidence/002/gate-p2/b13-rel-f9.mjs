// B13 «Seguir leyendo» con títulos de 120 caracteres sin espacios (gate 002, pasada 2 #4), sobre el build con F9:
// a 320 px y con zoom 200 % y 400 % (layout 1280/z), ES y EN, sin desborde ni recortes (layoutcheck v2).
import { launch } from '../cdp.mjs';
import { LAYOUT } from '../layoutcheck.mjs';
const b = await launch({ port: 9364 });
let fails = 0;
try {
  const casos = [[320, 700, 1], [640, 400, 2], [320, 200, 4]];
  for (const [w, h, z] of casos) {
    await b.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: z, mobile: false });
    for (const r of ['/insights/gate-cat-a/', '/en/insights/gate-cat-a/', '/insights/', '/en/insights/']) {
      await b.goto('http://localhost:4932' + r);
      const L = await b.eval(LAYOUT);
      const rel = await b.eval(`[...document.querySelectorAll('.rel-title, .card .title')].map(e => ({ len: e.textContent.length, right: Math.round(e.getBoundingClientRect().right) }))`);
      const ok = L.scrollW <= w && !L.desborde.length && !L.recorte.length && !L.superpuestos.length && rel.filter((x) => x.len >= 120).length >= 2 && rel.every((x) => x.right <= w);
      if (!ok) fails++;
      console.log(`${ok ? 'OK   ' : 'FALLA'} ${w}px (zoom ${z * 100} %) ${r}: scrollWidth ${L.scrollW}; títulos largos ${JSON.stringify(rel)}`
        + ['desborde', 'recorte', 'superpuestos'].map((k) => L[k].length ? `\n      ${k}: ${JSON.stringify(L[k].slice(0, 6))}` : '').join(''));
    }
  }
  console.log(`consola: ${JSON.stringify(b.consoleErrors)}\nfallas: ${fails}`);
} finally { await b.close(); }
