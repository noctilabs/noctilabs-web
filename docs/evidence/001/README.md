# Evidencia del spec 001 — fundación

Commit verificado: `09ae2a0` (arreglos de las pasadas 1 a 5 del gate sobre `0f7730f`, más Inter como sans por decisión del dueño). Incluye el inicio de la fase 2 (`8263092`, `25a8892`), que cambia el H1 de 4 industrias: A4 lo registra como enmienda. **Gate de implementación: GATE SÍ en la pasada 5** (`docs/reviews/001-impl-sol-pasada-5.md`); sus dos observaciones no bloqueantes quedaron resueltas en este commit. Verificación local:

- `astro preview` en `localhost:4932`;
- Chrome headless por CDP con emulación de foco;
- referencia del diseño servida aparte, con la textura en «Ninguna».

Vercel quedó diferido por decisión del dueño (enmienda al spec), así que A11 pasa al lanzamiento. Las pasadas
del gate de implementación están en `docs/reviews/001-impl-sol-pasada-*.md`.

| # | Resultado | Archivo |
|---|---|---|
| A1 | `astro check`: 0 errores, 0 warnings, 0 hints. `astro build`: 21 páginas. | `a1-build.txt` |
| A2 | Vitest: 72 tests en verde (S1). `tests/routes.types.ts` pasa en A1. Control negativo hecho a mano: con un `IndustryId` válido, `astro check` falla con «Unused '@ts-expect-error'». | `a2-tests.txt` |
| A3 | 20 rutas + `/404.html`. | `a3-dist.txt` |
| A4 | **226/226** comprobaciones de los **valores esperados** (`a4-esperados.json`, escritos a mano desde §3.2, §3.7 y la tabla de copy) contra el HTML de `dist/` (`a4-comparar.mjs`). Cubre por página: `lang`, canonical, los tres hreflang, title, descripción, H1, destino del selector (footer y menú mobile), idioma actual con `aria-current` y, en Producto, las 5 anclas con `tabindex`, H2 y `data-placeholder`. El head (viewport, favicon, theme-color, preload) se revisa en una página por idioma. En la 404: title, `noindex`, sin canonical, sin hreflang, sin selector, bloque en inglés y links a los dos homes. | `a4-esperados.json`, `a4-comparar.mjs`, `a4-comparacion.txt` |
| A5 | **Links:** 1054 hrefs internos en `dist/`, 0 rotos (anclas incluidas). **Sin JS:** los paneles no abren, y los labels Producto e Industrias navegan a `/producto/` y a Retail. **Recorridos con JS** (en el checklist de A7): las 5 anclas del menú mobile en los dos idiomas (URL final, foco en el destino, destino visible bajo el header en top 76–92 px), el fragmento que ya estaba en la URL el Ctrl+click sin interceptar y presionar y sostener un link de los paneles (desktop y mobile) antes de soltar. Las filas registran los valores finales. | `a5-a10.txt`, `a5-sin-js.txt`, `a7-a8-checklist.txt` |
| A6 | Capturas lado a lado: header, megamenú Producto, megamenú Industrias y footer en 1440; header, menú y footer en 390. Todas sobre fondo liso: la referencia mobile se toma en la página Producto del diseño, no sobre el video. Diferencias abajo. | `capturas/ref-*` vs `capturas/nuevo-*` |
| A7 | **78/78** casos: megamenú 1–9, mobile 1–7, cortes 999/1000 en las dos direcciones (foco en link del nav, CTA, chevron, link del megamenú, botón hamburguesa y link del panel mobile), secuencias combinadas, cerrar y reabrir antes de que venza el temporizador, `blur()` sin destino (desktop y mobile), click en zona vacía del panel, link presionado y sostenido (el caso de Safari), callbacks de foco viejos frente a una apertura nueva, hover que no cancela un cierre por pérdida de foco, click central sostenido sobre links de los dos paneles (sin cerrar, sin navegar la pestaña original y con la pestaña nueva en el destino), tabindex explícito en los 26 links de los paneles, selección de texto dentro del panel, skip link y `aria-current`. | `a7-a8-checklist.txt` |
| A8 | 0 errores de consola en las 20 rutas. | `a7-a8-checklist.txt` (último caso) |
| A9 | Revisión con web-design-guidelines: abajo. | — |
| A10 | Máximo 2016 bytes gzip por página (umbral 3072). Astro inlinea el script del header; el home suma el del video. | `a5-a10.txt` |

## A6 — diferencias con el diseño

**Autorizadas por el spec:**
- links en lugar de botones;
- botones chevron junto a Producto e Industrias, que ensanchan la cápsula unos 48 px;
- selector de idioma en el footer y en el menú mobile;
- skip link, visible solo con foco;
- contenido placeholder.

**Justificadas:**
1. **Cruz del menú mobile alineada a la derecha.** En el diseño queda pegada al logo cuando el panel abierto
   ensancha la cápsula (la fila es `max-content`).
2. **Botón de pausa del video del hero.** Lo exigen las guidelines y WCAG 2.2.2.

**Tipografía (D1, decisión del dueño):** Inter reemplaza a Neue Haas Unica, que no tiene licencia; la referencia se ve con el respaldo del sistema (Arial en Windows). Cambian levemente los anchos de texto; la estructura y las medidas de los contenedores son las del diseño.

**Corregida en `1bac7c2`:** el desenfoque del glass. Lightning CSS borraba el `backdrop-filter` estándar si iba
antes del prefijado; ahora las capturas muestran el mismo desenfoque que la referencia.

## A9 — revisión con web-design-guidelines

Reglas bajadas de `vercel-labs/web-interface-guidelines/command.md` (2026-10-03). Hallazgos y resolución:

- **Autoplay de más de 5 s sin control de pausa (video del hero):** resuelto con el botón de pausa/reproducción
  y su `aria-label` según el estado. Además, `prefers-reduced-motion` se escucha en vivo: si cambia a `reduce`,
  el video se pausa.
- **Comillas rectas en el inglés:** resuelto con `’`.
- **Contraste del idioma alternativo en el footer:** era 2,76:1 por la opacidad .7. Se sacó la opacidad y ahora
  queda en `--muted` sobre `--bg` (~4,85:1); el hover es un subrayado.
- **Anillo de foco al hacer click en chevron y hamburguesa:** el foco explícito usa `focusVisible: false`, así
  que el anillo solo aparece con teclado.
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
- foco visible;
- ningún `transition: all`;
- `width`/`height` en video y SVG;
- navegación con `<a>`;
- `touch-action`, `tap-highlight` y `overscroll-behavior: contain`;
- `theme-color` y `color-scheme`;
- `translate="no"` en la marca;
- `minmax(0, 1fr)` en la grilla del megamenú;
- preload de la fuente con `font-display: swap`;
- viewport sin bloqueo de zoom.

## Límites conocidos de la verificación

- Toda la verificación de interacción corre en Chrome. El foco en Safari, que no enfoca botones al presionarlos
  ni links sin `tabindex`, se cubre por diseño:
  - los links de los paneles llevan `tabindex="0"` explícito, así que Safari los enfoca con cualquier botón del
    mouse y el foco no sale del conjunto;
  - los paneles llevan `tabindex="-1"`, así que presionar su texto o una zona vacía deja el foco dentro del panel
    sin cancelar la selección;
  - los botones retienen el foco con `preventDefault` solo en el botón principal, y el click los enfoca
    explícitamente.

  No hubo un Safari disponible para probarlo.
