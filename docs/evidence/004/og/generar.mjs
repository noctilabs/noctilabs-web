// Genera public/og/og-es.png, og-en.png (1200×630) y logo.png (512×512) con Chrome headless (spec 004 §2.5).
// Uso, desde la raíz del repo: node docs/evidence/004/og/generar.mjs <ruta a cdp.mjs> [puerto]
// La plantilla es HTML local: isotipo (misma fórmula que src/lib/mark.ts), «NoctiLabs» y el lema, con Inter auto-hospedada.
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [cdpPath, port = '9381'] = process.argv.slice(2);
const { launch } = await import(pathToFileURL(resolve(cdpPath)).href);

const RINGS = [[8, 7, 2.6], [13.2, 13, 1.85], [18.4, 19, 1.1]];
const round = (x) => Math.round(x * 1000) / 1000;
const mark = (fg, core, size) => {
  const dots = RINGS.flatMap(([r, n, d], k) => Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2 + k * 0.3;
    return `<circle cx="${round(24 + r * Math.cos(t))}" cy="${round(24 + r * Math.sin(t))}" r="${d}" fill="${fg}"/>`;
  })).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}">${dots}<circle cx="24" cy="24" r="3.8" fill="${core}"/></svg>`;
};

const font = pathToFileURL(resolve('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')).href;
const LEMA = { es: 'El cerebro operativo de tu empresa.', en: 'Your company’s operational brain.' };

const page = (body, w, h) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: 'Inter Variable'; src: url('${font}') format('woff2'); font-weight: 100 900; }
html, body { margin: 0; width: ${w}px; height: ${h}px; overflow: hidden; }
body { background: #F4F4F2; color: #0B0B0C; font-family: 'Inter Variable', sans-serif; }
.og { box-sizing: border-box; width: ${w}px; height: ${h}px; padding: 72px 80px; display: flex; flex-direction: column; justify-content: space-between; }
.brand { display: flex; align-items: center; gap: 20px; font-size: 44px; font-weight: 500; letter-spacing: -.045em; }
.lema { margin: 0; max-width: 900px; font-size: 88px; font-weight: 500; line-height: 1; letter-spacing: -.05em; }
.foot { font-size: 26px; color: #6B6B68; letter-spacing: -.01em; }
.logo { width: ${w}px; height: ${h}px; display: grid; place-items: center; background: #FFFFFF; }
</style></head><body>${body}</body></html>`;

const og = (locale) => page(`<div class="og">
  <div class="brand">${mark('#0B0B0C', '#0047FF', 72)}<span>NoctiLabs</span></div>
  <p class="lema">${LEMA[locale]}</p>
  <div class="foot">www.noctilabs.io</div>
</div>`, 1200, 630);

const cdp = await launch({ port: Number(port) });
const shoot = async (html, w, h, out) => {
  const file = resolve(`docs/evidence/004/og/plantilla-${out.split('/').pop().replace('.png', '')}.html`);
  writeFileSync(file, html);
  await cdp.viewport(w, h);
  await cdp.goto(pathToFileURL(file).href);
  await cdp.shot(resolve(out));
  console.log(out, w, h);
};
await shoot(og('es'), 1200, 630, 'public/og/og-es.png');
await shoot(og('en'), 1200, 630, 'public/og/og-en.png');
await shoot(page(`<div class="logo">${mark('#0B0B0C', '#0047FF', 400)}</div>`, 512, 512), 512, 512, 'public/og/logo.png');
await cdp.close();
