# Evidencia del spec 001 — fundación

Commit verificado: `0f7730f`. Verificación local: `astro preview` en `localhost:4932`, Chrome headless por CDP con
emulación de foco. Vercel está diferido por decisión del dueño (enmienda al spec), así que A11 pasa al lanzamiento.

| # | Resultado | Archivo |
|---|---|---|
| A1 | `astro check`: 0 errores, 0 warnings, 0 hints. `astro build`: 21 páginas. | `a1-build.txt` |
| A2 | Vitest: 72 tests en verde (S1). El chequeo de tipos (`tests/routes.types.ts`) pasa en A1 y falla con un `IndustryId` válido (control negativo hecho a mano). | `a2-tests.txt` |
| A3 | 20 rutas + `/404.html`. | `a3-dist.txt` |
| A4 | Matriz de 20 + 1 filas: `lang`, canonical, alternates, title, descripción, H1, anclas de Producto (id, H2, `tabindex`, `data-placeholder`) y head (viewport, favicon, theme-color, preload). Contrastada con §3.2, §3.7 y la tabla de copy de abajo: coincide. El selector de idioma lo cubre A7 (aria-current) y A5 (destinos). | `a4-matriz.jsonl` |
| A5 | 1033 hrefs internos revisados en `dist/`, 0 rotos (anclas incluidas). Sin JS: los paneles no abren y el label Industrias navega a Retail. Las anclas en mobile (foco, posición y URL) y el Ctrl+click están en el checklist A7. | `a5-a10.txt`, `a5-sin-js.txt` |
| A6 | Capturas lado a lado contra el diseño (textura «Ninguna», `document.fonts.ready`, mismo fondo liso en las vistas de header y megamenú). Diferencias abajo. | `capturas/` |
| A7 | 51/51 casos de los contratos de §3.5 (megamenú 1–9, mobile 1–7, cortes 999/1000 en las dos direcciones, secuencias combinadas, skip link, aria-current). | `a7-a8-checklist.txt` |
| A8 | 0 errores de consola en las 20 rutas. | `a7-a8-checklist.txt` (último caso) |
| A9 | Revisión con web-design-guidelines: abajo. | — |
| A10 | Máximo 1816 bytes gzip por página (umbral 3072). Astro inlinea el script del header; el home suma el script del video. | `a5-a10.txt` |

## A6 — diferencias con el diseño

**Autorizadas por el spec:**
- links en lugar de botones;
- botones chevron junto a Producto e Industrias, que ensanchan la cápsula unos 48 px;
- selector de idioma en el footer y en el menú mobile;
- skip link, visible solo con foco;
- contenido placeholder debajo del header.

**Justificadas:**
1. **Cruz del menú mobile alineada a la derecha.** En el diseño queda pegada al logo cuando el panel abierto
   ensancha la cápsula (la fila es `max-content`). La alineo a la derecha con `margin-left: auto` para que quede
   donde se la busca.
2. **Botón de pausa del video del hero** (36 px, arriba a la derecha). Lo exigen las guidelines y WCAG 2.2.2,
   porque es movimiento automático de más de 5 s.

## A9 — revisión con web-design-guidelines

Reglas bajadas de `vercel-labs/web-interface-guidelines/command.md` (2026-10-03). Hallazgos y resolución:

- **Autoplay de más de 5 s sin control de pausa (video del hero):** resuelto con el botón de pausa/reproducción,
  con `aria-label` que cambia según el estado.
- **Comillas rectas en el copy en inglés** (`Let's`, `company's`): resuelto con `’`.
- **Excepciones documentadas en el spec:**
  1. Title Case.
  2. «Detect language».
  3. Logo sin hover visual.
  4. Hover del megamenú con opacidad .65.

**Sin hallazgos en el resto:**
- botones de solo ícono con `aria-label`;
- íconos decorativos con `aria-hidden`;
- skip link;
- jerarquía de headings;
- `scroll-margin-top`;
- foco visible (`:focus-visible` global; chevron, hamburguesa y pausa con su propio outline);
- ningún `transition: all`;
- `prefers-reduced-motion` respetado por el video;
- `width`/`height` en video y SVG;
- navegación con `<a>`;
- `touch-action`, `tap-highlight` y `overscroll-behavior: contain` en el panel mobile;
- `theme-color` y `color-scheme`;
- `translate="no"` en la marca;
- `min-width: 0` vía `minmax(0, 1fr)` en la grilla del megamenú;
- preload de la fuente con `font-display: swap`;
- viewport sin bloqueo de zoom.

## Tabla de title y descripción (copy de la fase 1)

Es la fuente de `src/i18n/ui.ts`; los valores de cada página están en `a4-matriz.jsonl`. El inglés es
provisorio y está pendiente de la revisión editorial del dueño (D4).
