// Arma ds-bundle/ para Claude Design desde las fuentes del repo (tokens, base, fuentes, isotipo).
// Sync solo de tokens y estilos: los componentes .astro no se pueden empaquetar como React.
// Uso: node .design-sync/build.mjs
import { mkdirSync, rmSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { markSvg } from '../src/lib/mark.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'ds-bundle');
const r = (p) => join(root, p);
const w = (p, s) => { mkdirSync(dirname(join(out, p)), { recursive: true }); writeFileSync(join(out, p), s); };

rmSync(out, { recursive: true, force: true });

// Fuentes: los mismos woff2 que importa src/layouts/Base.astro.
mkdirSync(join(out, 'fonts'), { recursive: true });
copyFileSync(r('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'), join(out, 'fonts/inter-latin-wght-normal.woff2'));
copyFileSync(r('node_modules/@fontsource-variable/inter/files/inter-latin-wght-italic.woff2'), join(out, 'fonts/inter-latin-wght-italic.woff2'));
for (const wt of [400, 500]) {
  copyFileSync(r(`node_modules/@fontsource/geist-mono/files/geist-mono-latin-${wt}-normal.woff2`), join(out, `fonts/geist-mono-latin-${wt}-normal.woff2`));
}
w('fonts/fonts.css', `@font-face { font-family: 'Inter Variable'; font-style: normal; font-display: swap; font-weight: 100 900; src: url('./inter-latin-wght-normal.woff2') format('woff2-variations'); }
@font-face { font-family: 'Inter Variable'; font-style: italic; font-display: swap; font-weight: 100 900; src: url('./inter-latin-wght-italic.woff2') format('woff2-variations'); }
@font-face { font-family: 'Geist Mono'; font-style: normal; font-display: swap; font-weight: 400; src: url('./geist-mono-latin-400-normal.woff2') format('woff2'); }
@font-face { font-family: 'Geist Mono'; font-style: normal; font-display: swap; font-weight: 500; src: url('./geist-mono-latin-500-normal.woff2') format('woff2'); }
`);

// Tokens tal cual; global.css sin su @import (styles.css arma el cierre).
w('tokens/tokens.css', readFileSync(r('src/styles/tokens.css'), 'utf8'));
const base = readFileSync(r('src/styles/global.css'), 'utf8').replace(/^@import[^\n]*\n/m, '');
w('tokens/base.css', `/* De src/styles/global.css. */\n${base}`);
w('styles.css', `@import './fonts/fonts.css';\n@import './tokens/tokens.css';\n@import './tokens/base.css';\n`);

// Isotipo.
w('guidelines/mark.svg', markSvg('#0B0B0C', '#0047FF'));
w('guidelines/mark-inverse.svg', markSvg('#FFFFFF', '#3D7BFF'));

// Tarjetas de fundamentos.
const card = (group, name, body, css = '') => `<!-- @dsCard group="${group}" -->
<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>${name}</title>
<link rel="stylesheet" href="../../../styles.css">
<style>body{padding:32px var(--edge)} .k{font-family:var(--font-mono);font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--muted)} ${css}</style>
</head><body>
${body}
</body></html>
`;

const tokens = readFileSync(r('src/styles/tokens.css'), 'utf8');
const colors = [...tokens.matchAll(/--([\w-]+):\s*(#[0-9A-Fa-f]{3,8}|rgba?\([^)]*\));/g)].map(([, n, v]) => [n, v]);
w('components/foundations/Colors/Colors.html', card('Foundations', 'Colors',
  `<div class="grid">${colors.map(([n, v]) => `<div><div class="sw" style="background:var(--${n})"></div><div class="n">--${n}</div><div class="k">${v}</div></div>`).join('')}</div>`,
  `.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:20px}.sw{height:72px;border-radius:12px;box-shadow:inset 0 0 0 1px var(--line)}.n{font-size:14px;margin-top:8px}`));

w('components/foundations/Typography/Typography.html', card('Foundations', 'Typography', `
<div class="k">Display · var(--display) · 400 · -.045em · lh 1</div>
<h1 style="margin:8px 0 32px;font-size:var(--display);font-weight:400;line-height:1;letter-spacing:-.045em">Software a medida</h1>
<div class="k">H2 · var(--h2)</div>
<h2 style="margin:8px 0 32px;font-size:var(--h2);font-weight:400;line-height:1.05;letter-spacing:-.04em">Lo que construimos</h2>
<div class="k">Body · Inter 16 / 1.55</div>
<p style="margin:8px 0 32px;max-width:60ch">Diseñamos y desarrollamos producto digital para empresas que necesitan algo más que una plantilla.</p>
<div class="k">Muted · var(--muted)</div>
<p style="margin:8px 0 32px;color:var(--muted)">Texto secundario y taglines.</p>
<div class="k">Kicker / nav · Geist Mono 12–13 · uppercase</div>
<p style="margin:8px 0 0;font-family:var(--font-mono);font-size:13px;letter-spacing:.01em;text-transform:uppercase">Producto · Industrias · Nosotros</p>`));

w('components/foundations/Radii/Radii.html', card('Foundations', 'Radii & layout', `
<div style="display:flex;gap:24px;flex-wrap:wrap;align-items:end">
${['pill', 'capsule', 'card'].map((n) => `<div><div style="width:160px;height:96px;background:var(--surface);border-radius:var(--radius-${n})"></div><div class="k" style="margin-top:8px">--radius-${n}</div></div>`).join('')}
</div>
<p class="k" style="margin-top:32px">--edge: gutter lateral (16px móvil, clamp en ≥1000px) · breakpoint único 1000px · footer max-width 1200px</p>`));

w('components/brand/Buttons/Buttons.html', card('Brand', 'Buttons', `
<div class="k">Sobre claro (header CTA)</div>
<div style="display:flex;gap:12px;margin:12px 0 32px"><a class="b-nav" href="#">Hablemos</a></div>
<div class="k">Sobre oscuro / foto (hero)</div>
<div style="display:flex;gap:12px;margin-top:12px;padding:32px;background:var(--ink-hover);border-radius:var(--radius-card)"><a class="b-solid" href="#">Hablemos</a><a class="b-ghost" href="#">Ver producto</a></div>`,
  `.b-nav{font-family:var(--font-mono);font-size:12px;text-transform:uppercase;letter-spacing:.01em;padding:9px 16px;border-radius:var(--radius-pill);background:var(--ink);color:var(--white);text-decoration:none}
.b-solid,.b-ghost{padding:17px 30px;border-radius:var(--radius-pill);font-size:16px;font-weight:500;text-decoration:none}
.b-solid{background:var(--white);color:var(--ink)}.b-ghost{box-shadow:inset 0 0 0 1px rgba(255,255,255,.7);color:var(--white)}`));

w('components/brand/Mark/Mark.html', card('Brand', 'Mark', `
<div style="display:flex;gap:32px;align-items:center">
<div class="wm">${markSvg('#0B0B0C', '#0047FF', 'width="40" height="40"')}NoctiLabs</div>
<div class="wm" style="background:var(--dark);color:var(--white);padding:20px 28px;border-radius:var(--radius-card)">${markSvg('#FFFFFF', '#3D7BFF', 'width="40" height="40"')}NoctiLabs</div>
</div>`, `.wm{display:flex;align-items:center;gap:10px;font-weight:500;font-size:23px;letter-spacing:-.045em}`));

w('components/brand/Header/Header.html', card('Brand', 'Glass capsule header', `
<div style="background:linear-gradient(135deg,#3a3a38,#8a8a86);height:180px;border-radius:var(--radius-card);position:relative">
<div style="position:absolute;top:10px;left:50%;transform:translateX(-50%);background:var(--glass);-webkit-backdrop-filter:var(--glass-filter);backdrop-filter:var(--glass-filter);border-radius:var(--radius-capsule);height:56px;padding:0 10px 0 28px;display:flex;align-items:center;gap:32px">
<span style="font-weight:600;font-size:21px;letter-spacing:-.045em">NoctiLabs</span>
<span class="nav">Producto</span><span class="nav">Industrias</span><span class="nav">Nosotros</span>
<a href="#" style="font-family:var(--font-mono);font-size:12px;text-transform:uppercase;padding:9px 16px;border-radius:var(--radius-pill);background:var(--ink);color:var(--white);text-decoration:none">Hablemos</a>
</div></div>`, `.nav{font-family:var(--font-mono);font-size:13px;text-transform:uppercase;letter-spacing:.01em;opacity:.82}`));

// README: convenciones + índice.
const conventions = readFileSync(r('.design-sync/conventions.md'), 'utf8');
w('README.md', `${conventions.trim()}\n\n---\n\n## Archivos\n\n- \`styles.css\`: entrada única (fuentes + tokens + base).\n- \`tokens/tokens.css\`: todos los tokens (\`:root\`, con override en \`@media (min-width: 1000px)\`).\n- \`tokens/base.css\`: reset y estilos base de body, links y foco.\n- \`guidelines/mark.svg\`, \`guidelines/mark-inverse.svg\`: isotipo.\n- \`components/foundations/*\`, \`components/brand/*\`: tarjetas de referencia (HTML + CSS, no hay componentes JS).\n`);
console.log('ds-bundle listo');
