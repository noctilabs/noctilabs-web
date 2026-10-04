// B15 reflow a 320 CSS px (v2, gate 002 hallazgo 9: las cinco industrias del home y recorte por ancestros): todas las rutas (ES y EN) + 404, sin scroll horizontal, sin recortes ni superposiciones; capturas de página completa.
import { writeFileSync } from 'node:fs';
import { launch } from './cdp.mjs';
import { routes, NEW } from './routes.mjs';
import { LAYOUT } from './layoutcheck.mjs';
const OUT = new URL('./b15out/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const b = await launch({ port: 9360 });
let fails = 0;
try {
  await b.viewport(320, 700, false);
  for (const r of [...routes(), '/404.html']) {
    await b.goto(NEW + r);
    // Carga todo (lazy) y espera las imágenes.
    for (let y = 0; y < 30; y++) { const done = await b.eval(`(() => { scrollBy(0, innerHeight); return innerHeight + scrollY >= document.documentElement.scrollHeight - 2; })()`); await b.sleep(80); if (done) break; }
    await b.eval(`Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 5000); })))`);
    // El antes/después en «con» (el estado más denso); se mide también «sin» en el home.
    const states = r === '/' || r === '/en/' ? ['con', 'sin', ...['retail', 'manufactura', 'consumo', 'salud', 'servicios'].map((i) => 'ind:' + i)] : [null];
    for (const st of states) {
      if (st?.startsWith('ind:')) { await b.eval(`document.getElementById('ind-tab-${st.slice(4)}').click()`); await b.sleep(400); }
      else if (st) { await b.eval(`document.querySelector('[data-ba-set=${st}]').click()`); await b.sleep(1400); }
      await b.eval('scrollTo(0,0)'); await b.sleep(150);
      const L = await b.eval(LAYOUT);
      const ok = L.scrollW <= 320 && !L.desborde.length && !L.recorte.length && !L.superpuestos.length;
      if (!ok) fails++;
      console.log(`${ok ? 'OK   ' : 'FALLA'} 320 ${r}${st ? (st.startsWith('ind:') ? ' (industria «' + st.slice(4) + '»)' : ' (antes/después «' + st + '»)') : ''}: scrollWidth ${L.scrollW}` + ['desborde', 'recorte', 'superpuestos'].map((k) => L[k].length ? `\n      ${k}: ${JSON.stringify(L[k].slice(0, 12))}` : '').join(''));
      if (st === null || st === 'con') {
        const h = await b.eval('document.documentElement.scrollHeight');
        await b.eval(`(() => { const s = document.createElement('style'); s.id = '__hh'; s.textContent = '.site-header{position:relative!important}'; document.head.append(s); })()`);
        const res = await b.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: 320, height: h, scale: 1 } });
        await b.eval(`document.getElementById('__hh').remove()`);
        writeFileSync(OUT + 'reflow-320' + (r.replace(/\//g, '-').replace(/-$/, '') || '-home') + '.png', Buffer.from(res.data, 'base64'));
      }
    }
  }
  console.log(`\nconsola: ${JSON.stringify(b.consoleErrors)}\nfallas: ${fails}`);
} finally { await b.close(); }
