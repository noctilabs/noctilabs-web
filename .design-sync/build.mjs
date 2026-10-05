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
w('tokens/article.css', readFileSync(r('src/styles/article.css'), 'utf8'));
w('styles.css', `@import './fonts/fonts.css';\n@import './tokens/tokens.css';\n@import './tokens/base.css';\n@import './tokens/article.css';\n`);

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
<div class="k">.h1-int · var(--display) · 500 · -.05em (páginas interiores)</div>
<h1 class="h1-int" style="margin:8px 0 32px">Software a medida</h1>
<div class="k">Home hero h1 · var(--display) · 400 · -.045em (solo sobre foto)</div>
<h1 style="margin:8px 0 32px;font-size:var(--display);font-weight:400;line-height:1;letter-spacing:-.045em">Software a medida</h1>
<div class="k">.h2 · var(--h2) · 500 · -.045em</div>
<h2 class="h2" style="margin:8px 0 32px">Lo que construimos</h2>
<div class="k">.lead-hero · 17 / 1.5 · muted</div>
<p class="lead-hero" style="margin:8px 0 32px">Bajada bajo el titular de una página interior.</p>
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
<div class="k">Button · dark · md (16×26, 15px) / lg (17×30, 16px)</div>
<div style="display:flex;gap:12px;align-items:center;margin:12px 0 32px"><a class="btn v-dark s-md" href="#">Hablemos</a><a class="btn v-dark s-lg" href="#">Hablemos</a></div>
<div class="k">Button · white / ghost-light (sobre oscuro o foto)</div>
<div style="display:flex;gap:12px;margin:12px 0 32px;padding:32px;background:var(--dark);border-radius:var(--radius-card)"><a class="btn v-white s-lg" href="#">Hablemos</a><a class="btn v-ghost-light s-lg" href="#">Ver producto</a></div>
<div class="k">CTA del header (mono)</div>
<div style="display:flex;gap:12px;margin-top:12px"><a class="b-nav" href="#">Hablemos</a></div>`,
  // Mismas reglas que src/components/ui/Button.astro.
  `.btn{display:inline-block;border-radius:var(--radius-pill);font-weight:500;white-space:nowrap;text-decoration:none}
.s-md{padding:16px 26px;font-size:15px}.s-lg{padding:17px 30px;font-size:16px}
.v-dark{background:var(--ink);color:var(--white)}.v-white{background:var(--white);color:var(--ink)}
.v-ghost-light{box-shadow:inset 0 0 0 1px rgba(255,255,255,.7);color:var(--white)}
.b-nav{font-family:var(--font-mono);font-size:12px;text-transform:uppercase;letter-spacing:.01em;padding:9px 16px;border-radius:var(--radius-pill);background:var(--ink);color:var(--white);text-decoration:none}`));

const PANEL_R = 'clamp(19.7px,2.5vw,29.5px)';
w('components/brand/Surfaces/Surfaces.html', card('Brand', 'Card big & Dark big', `
<div class="k">CardBig · blanco, borde --line</div>
<div style="margin:12px 0 32px;background:var(--white);border:1px solid var(--line);border-radius:${PANEL_R};padding:clamp(32.8px,4.9vw,72.2px) clamp(13.1px,2.9vw,45.9px) clamp(13.1px,2.9vw,45.9px)">
<h2 class="h2">Un sistema, cinco industrias</h2><p class="lead-hero" style="margin-top:14px">Contenido del panel.</p></div>
<div class="k">DarkBig · --dark, texto --bg</div>
<div style="margin-top:12px;background:var(--dark);color:var(--bg);border-radius:${PANEL_R};padding:clamp(32.8px,4.9vw,65.6px) clamp(16.4px,3.3vw,52.5px)">
<span class="k" style="color:#9FBEFF">Nocti</span><h2 class="h2" style="margin-top:14px">Hablemos de tu operación</h2></div>`));

w('components/brand/Kicker/Kicker.html', card('Brand', 'Kicker', `
<div style="display:flex;flex-direction:column;gap:16px">
<span class="kk" style="color:var(--muted)">muted · 12px</span>
<span class="kk" style="color:var(--blue-link)">link</span>
<div style="background:var(--dark);padding:20px 24px;border-radius:var(--radius-card);display:flex;gap:24px"><span class="kk" style="color:#7A7A80">dark-muted</span><span class="kk" style="color:#9FBEFF">dark-accent</span></div>
</div>`, `.kk{font-family:var(--font-mono);font-size:12px;letter-spacing:.04em;text-transform:uppercase;line-height:1.4}`));

w('components/layout/HeadRow/HeadRow.html', card('Layout', 'Container & HeadRow', `
<section style="max-width:1200px;margin:0 auto;padding:0 var(--edge)">
<div style="display:flex;flex-wrap:wrap;gap:20px 64px;align-items:flex-end">
<div style="flex:2 1 520px;display:flex;flex-direction:column;gap:14px;min-width:0"><span class="k">Producto</span><h2 class="h2">Todo tu negocio en un sistema</h2></div>
<p style="flex:1 1 320px;margin:0;font-size:16px;color:var(--muted)">La bajada va a la derecha, alineada abajo con el título, y cae debajo en móvil.</p>
</div></section>
<p class="k" style="margin-top:40px">Container: max-width 1200 · padding 0 var(--edge) · margen superior clamp(32.8px,4.9vw,72.2px) (home) o clamp(45.9px,5.7vw,85.3px) (interiores)</p>`));

w('components/layout/Article/Article.html', card('Layout', 'Article prose', `
<div class="prose-article">
<p class="lead">Lead del artículo: más grande y en tinta.</p>
<p>Párrafo de cuerpo en --body-2, 16 / 1.65, con un <a href="#">link</a>.</p>
<h2>Subtítulo del artículo</h2>
<ul><li>Primer punto</li><li>Segundo punto</li></ul>
<blockquote><p>Una cita destacada con fondo --bg.</p></blockquote>
</div>`, `body{background:var(--white)}`));

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
w('README.md', `${conventions.trim()}\n\n---\n\n## Archivos\n\n- \`styles.css\`: entrada única (fuentes + tokens + base).\n- \`tokens/tokens.css\`: todos los tokens (\`:root\`, con override en \`@media (min-width: 1000px)\`).\n- \`tokens/base.css\`: reset, estilos base y clases compartidas (\`.h1-int\`, \`.h2\`, \`.lead-hero\`, \`.sr-only\`).\n- \`tokens/article.css\`: \`.prose-article\` para cuerpo de artículos.\n- \`guidelines/mark.svg\`, \`guidelines/mark-inverse.svg\`: isotipo.\n- \`components/foundations/*\`, \`components/brand/*\`, \`components/layout/*\`: tarjetas de referencia (HTML + CSS, no hay componentes JS).\n`);
console.log('ds-bundle listo');
