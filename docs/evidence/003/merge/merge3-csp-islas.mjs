// Integración fase 3 + fase 4: las islas hidratan bajo la CSP, la textura corre y no hay errores de consola ni de CSP.
import { launch } from '../cdp.mjs';
import { routes } from '../routes.mjs';
const b = await launch({ port: 9365 });
let fails = 0;
try {
  await b.viewport(1440, 900, false);
  for (const r of [...routes(), '/privacidad/', '/en/privacy/']) {
    const antes = b.consoleErrors.length;
    await b.goto('http://localhost:4932' + r);
    // Recorre la página para que entren las islas (client:visible) y espera la hidratación.
    for (let y = 0; y < 40; y++) { const done = await b.eval(`(() => { scrollBy(0, innerHeight); return innerHeight + scrollY >= document.documentElement.scrollHeight - 2; })()`); await b.sleep(120); if (done) break; }
    await b.sleep(800);
    const s = await b.eval(`(() => {
      const islas = [...document.querySelectorAll('astro-island')];
      const hidratadas = islas.filter((i) => !i.hasAttribute('ssr'));
      const deshab = islas.reduce((n, i) => n + i.querySelectorAll('button:disabled').length, 0);
      const canvas = document.querySelector('[data-texture] canvas');
      return { islas: islas.length, hidratadas: hidratadas.length, botonesDeshabilitados: deshab, canvas: !!canvas && canvas.width > 0 };
    })()`);
    const errs = b.consoleErrors.slice(antes);
    const ok = s.islas === s.hidratadas && s.canvas && errs.length === 0;
    if (!ok) fails++;
    console.log(`${ok ? 'OK   ' : 'FALLA'} ${r} ${JSON.stringify(s)}${errs.length ? ' errores: ' + JSON.stringify(errs.slice(0, 3)) : ''}`);
  }
  console.log(`errores CSP totales: ${b.consoleErrors.filter((e) => /Content Security Policy/i.test(e)).length}\nfallas: ${fails}`);
} finally { await b.close(); }
