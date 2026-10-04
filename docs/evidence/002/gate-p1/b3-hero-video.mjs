// B3 (gate 002, hallazgo 8): hero con el video real en la referencia y en la web nueva, mismo fotograma pausado.
// La referencia sirve ahora assets/hero.mp4 y hero.webm (copiados de la carpeta deploy; el mp4 es idéntico por md5).
import { writeFileSync, mkdirSync } from 'node:fs';
import { launch } from '../cdp.mjs';
const OUT = new URL('./b3-hero/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
mkdirSync(OUT, { recursive: true });
const T = 0; // primer fotograma: el servidor de la referencia (http.server) no admite Range y no puede buscar
const PAGES = { ref: 'http://localhost:4933/NoctiLabs%20Web%20v3.dc.html', new: 'http://localhost:4932/' };
const b = await launch({ port: 9361 });
try {
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    for (const [name, url] of Object.entries(PAGES)) {
      await b.viewport(w, h, w < 768);
      await b.goto(url);
      const info = await b.eval(`(async () => {
        const deadline = Date.now() + 15000;
        let v; while (!(v = document.querySelector('video')) && Date.now() < deadline) await new Promise(r => setTimeout(r, 100));
        if (!v) return { video: false };
        v.pause();
        if (v.readyState < 1) await new Promise(r => { v.addEventListener('loadedmetadata', r, { once: true }); setTimeout(r, 10000); });
        v.currentTime = ${T};
        await new Promise(r => { v.addEventListener('seeked', r, { once: true }); setTimeout(r, 10000); });
        const r = v.getBoundingClientRect();
        return { video: true, src: v.currentSrc.split('/').pop(), t: v.currentTime, ready: v.readyState, paused: v.paused, w: v.videoWidth, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], fit: getComputedStyle(v).objectFit, pos: getComputedStyle(v).objectPosition };
      })()`);
      await b.sleep(400);
      const res = await b.send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(`${OUT}hero-${w}-${name}.png`, Buffer.from(res.data, 'base64'));
      console.log(`${w} ${name}: ${JSON.stringify(info)}`);
    }
  }
  console.log(`consola: ${JSON.stringify(b.consoleErrors)}`);
} finally { await b.close(); }
