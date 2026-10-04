# Spec 002 — Páginas

Estado: borrador para revisión · 2026-10-03

## 1. Contexto

La fase 1 (spec 001) dejó la base:

- 20 rutas ES/EN con canonical y hreflang;
- tokens y layout base;
- header, megamenú, menú mobile y footer;
- páginas vacías;
- un hero provisorio con video en el home.

La fase 2 llena las páginas con el contenido y la interactividad del diseño, salvo dos piezas que van en la fase 3:

- la maqueta `Nocti App v2`;
- la textura animada de fondo.

**Fuente:**
- el diseño `NoctiLabs Web v3.dc.html`;
- el inventario `docs/specs/002-inventario-diseno.md`. Es una copia del relevamiento del diseño, con layout, tipografía, colores, copy literal, interactividad y huecos de cada sección, citando líneas. Este spec referencia sus secciones como «Inv §N».

**Decisiones del dueño vigentes:**
- Astro con React solo en islas (fase 3);
- ES + EN;
- SDD con revisión de gpt-6.1-sol;
- TDD solo en la costura S1;
- reglas de UI de web-design-guidelines;
- Vercel diferido hasta terminar la web;
- «terminar toda la web primero».

## 2. Objetivo

Que las 7 páginas del diseño queden implementadas en los dos idiomas:

- Home;
- Producto;
- Industria (×5);
- Nosotros;
- Insights;
- Artículo;
- Hablemos.

Todas fieles al diseño y accesibles. Las piezas de la fase 3 quedan con lugar reservado, y el formulario llega hasta la interfaz completa: el envío real es de la fase 4.

## 3. Arquitectura del contenido

### 3.1 Dónde vive cada cosa

| Qué | Dónde | Forma |
|---|---|---|
| Texto de interfaz compartido (nav, botones, banda «Hablemos.») | `src/i18n/ui.ts` (ya existe) | se suman claves |
| Copy de cada página | `src/content/pages/<pagina>.ts` | `export const <pagina>: Record<Locale, …>` con un tipo explícito por página; `en` debe cumplir el mismo tipo que `es` |
| Industrias | `src/content/industries.ts` | `Record<IndustryId, Record<Locale, Industry>>` con label, short, blurb, hero (kicker, h1, lead), photo, processes[4], questions[4], agents[4] y why[4] |
| Artículos | colección de contenido de Astro `src/content/insights/` | un Markdown por artículo e idioma: `<slug>.es.md` / `<slug>.en.md` con frontmatter `{ id, lang, slug, title, category, excerpt, date (ISO), minutes, toc: [{id, label}] }` |
| Imágenes | `src/assets/` | `astro:assets` (`<Picture>` AVIF/WebP, `width`/`height`, `loading` según posición) |

`src/content/pages/*.ts` no se mezcla con `ui.ts`, para que este no crezca con el copy de cada página. Un tipo compartido `Localized<T> = Record<Locale, T>` deja como error de compilación cualquier clave que falte en inglés.

### 3.2 Rutas nuevas (extiende S1)

Artículos de Insights: `PageRef` suma `{ id: 'articulo', article: ArticleSlugId }`:

| es | en |
|---|---|
| `/insights/<slug-es>/` | `/en/insights/<slug-en>/` |

- Los slugs viven en un registro en `routes.ts` (`ARTICLE_SLUGS`), igual que las industrias. El frontmatter de cada Markdown tiene que coincidir con ese registro; si no coincide, el build falla (`getStaticPaths` valida contra el registro).
- `href`, `alternates` y `pageFromPath` cubren la ruta nueva.
- **TDD (S1):** se agregan casos literales para el artículo de la fase 2, en los dos idiomas y sin barra final, más un negativo (`/insights/inexistente/`). Primero el test en rojo, después el código.
- En el header, «Insights» queda activo (`data-active`) también en los artículos. `aria-current` solo va en `/insights/`.

Filtro de Insights: va en la query `?categoria=<id>` (es) / `?category=<id>` (en). Así la URL refleja el estado, como piden las guidelines. Sin JS no hay filtro: se ve la lista completa.

### 3.3 Componentes de sección

Primitivas en `src/components/ui/`, con los nombres y valores de Inv §0.2:

- `Container` (CONT, con `gap` = GAP-L o GAP-P);
- `HeadRow`;
- `Kicker`;
- `CardBig`;
- `DarkBig`;
- `Button` (dark/white/ghost, siempre `<a>` cuando navega);
- `Segmented` (SEG: tabs o filtros, ver §5);
- `AppSlot` (lugar reservado para la fase 3, ver §4.8).

Las secciones son componentes por página en `src/components/sections/<pagina>/`. Las páginas `src/pages/**` siguen siendo finas: pasan `locale` al componente de página.

## 4. Páginas

Cada sección reproduce Inv con sus valores exactos. Acá solo se listan las decisiones y diferencias respecto del diseño.

### 4.1 Home (Inv §1)

1. **Hero:** el provisorio de la fase 1 se mantiene: video, velo, pausa, H1 400, lead y dos CTA.
2. **Antes y después** (Inv §1.2):
   - Solo la **Opción 2** (`diagrams(con)`). El control «Comparar · Opción 1 / Opción 2» y `diagramsOld` no se portan (D6).
   - **Diagramas:** son HTML y SVG estáticos generados en el build a partir de los datos de Inv §9.10–9.11: nodos posicionados en % y líneas en un SVG `viewBox 0 0 100 100`. El estado «Con» se aplica con una clase en el contenedor, y las transiciones (opacidad, escala, delays escalonados de las líneas) van en CSS. El JS solo alterna la clase.
   - **Alternancia automática** cada 3600 ms. Arranca recién cuando la sección entra en pantalla (`IntersectionObserver`, threshold .35) y se pausa fuera de ella. Se detiene para siempre en cuanto se usa el control Sin/Con. Con `prefers-reduced-motion: reduce` no alterna, muestra «Con Nocti» y las transiciones quedan en 0 ms.
   - **Control Sin/Con:** es un `Segmented` de dos botones con `aria-pressed`. El título (`morphTitle`) cambia con el estado y vive en una región `aria-live="polite"`, que solo anuncia después de una interacción del usuario. Durante la alternancia automática lleva `aria-live="off"`.
   - **Mobile:** el H2 puede ocupar varias líneas; no se porta el `white-space: nowrap` (Inv §11.22). El tamaño es `var(--h2)`.
   - **Cierre** («Tus sistemas siguen siendo tus sistemas.»): aparece con «Con», como en el diseño.
3. **Toda la empresa puede preguntar** (Inv §1.3):
   - Head-row, nota al pie y tabs de rol.
   - El embed va en un `AppSlot` (`view="cerebro"`, con `role`) hasta la fase 3.
   - En la fase 2 las tabs de rol son un `Segmented` que solo cambia el rol pasado al slot. La rotación automática (`onChatDone`) llega con la fase 3.
4. **Capacidades** (Inv §1.4): 4 tarjetas y CTA ancho a `href(producto, '#agentes')`.
   - El efecto de hover del diseño (oscurecer, elevar y desplegar el ejemplo) se activa con `:hover` y también con `:focus-within`.
   - Las tarjetas no son interactivas. Para que el ejemplo sea accesible:
     - en dispositivos sin hover (`@media (hover: none)`) el ejemplo se muestra siempre desplegado, sin oscurecer;
     - para lectores de pantalla, el ejemplo siempre está en el DOM. Solo se oculta visualmente con `grid-template-rows: 0fr`, sin `display: none` ni `aria-hidden`.
   - Con `prefers-reduced-motion`, sin `translateY` y sin transición.
5. **Cuatro pasos** (Inv §1.5): igual criterio que Capacidades. La tarjeta 04 queda oscura por defecto. Al pasar el mouse sobre otra, la 04 vuelve a clara, igual que en el diseño; se hace con CSS (`:has()`), sin JS.
6. **Industrias** (Inv §1.6):
   - **Tabs:** patrón *tabs* de la W3C APG (`role="tablist"`/`tab`/`tabpanel`, flechas izquierda y derecha, Home/End, activación automática).
   - **Arranque:** en **Retail** (índice 0), no en Manufactura (D7).
   - **Contenido de cada panel:** foto, título, blurb y botón «Conocer más →» a la página de **esa** industria. El diseño lleva todas a Retail (Inv §11.5).
   - Sin JS se ve el primer panel y los demás quedan ocultos (`hidden`). La lista de industrias igual llega por el header y el footer.
   - **Fotos:** las tres del diseño (manufactura, consumo, fitness) y una de Retail sacada de un fotograma del video del hero (D10). Servicios no tiene foto: ver D10.
7. **Banda «Hablemos.»** (Inv §8): componente compartido, presente en todas las páginas salvo Hablemos.

### 4.2 Producto (Inv §2)

Anclas `#overview`, `#cerebro`, `#bi`, `#agentes` y `#control`. Reemplazan a las secciones vacías de la fase 1 y mantienen `tabindex="-1"` para el foco desde el menú mobile.

1. **Hero:** según Inv §2.1.
2. **Demo general:** `AppSlot view="inicio"` con su caption.
3. **Overview** (Inv §2.3):
   - Diagrama de bloques con los textos de `ovIn`/`ovOut` y la barra Nocti con el isotipo (`Mark` variante oscura).
   - **Conectores** (Inv §11.21): solo a partir de 1000 px, cuando las tres columnas están alineadas. Por debajo, un único conector vertical centrado entre los grupos.
4. **Cerebro, BI y Agentes** (Inv §2.4): head-row, chips, `AppSlot` (`cerebro` / `inteligencia` / `agentes`) y caption.
5. **Control** (Inv §2.5):
   - Capas, barra y `AppSlot view="control"` con su caption.
   - La grilla de capas pasa a 1 columna por debajo de 600 px (Inv §11.21).

### 4.3 Industria (×5) (Inv §3)

- Una sola plantilla con las secciones de Inv §3.1–3.6, alimentada por `industries.ts`.
- **Retail:** copy literal del diseño.
- **Las otras cuatro:** copy redactado por mí, siguiendo la misma estructura, el tono y el blurb de cada una (D8). Queda marcado como borrador pendiente de revisión del dueño, y el inglés también (D4).
- **Foto:** la de la industria si existe; si no, el panel oscuro de D10.
- **«Otras industrias»:** lista las otras 4 (todas menos la actual), cada una a su página.
- El kicker del hero es «Industrias · <label>».

### 4.4 Nosotros (Inv §4)

- Hero, «Quiénes somos / Por qué» y «Qué creemos» con el copy del diseño.
- **Equipo** (Inv §4.4): **no se renderiza** mientras `team` esté vacío (D9). El componente queda listo para recibir `{ name, role, photo }`.

### 4.5 Insights (Inv §5) y Artículo (Inv §6)

- **Publicados:** solo los artículos con cuerpo. En la fase 2 es uno, «El contexto es el nuevo sistema operativo de la empresa.», en los dos idiomas (D11).
- **Filtros:** solo las categorías con al menos un artículo, más «Todos». Si queda una sola categoría además de «Todos», no se muestran.
- **Lista:**
  - El destacado es el artículo más reciente.
  - La grilla tiene el resto, con «Todos» ordenado por fecha descendente.
  - Con un solo artículo, se ve el destacado y la grilla vacía no aparece.
- **Artículo:**
  - Cabecera: «← Insights» como link, categoría, H1 y meta (autor «NoctiLabs», fecha y minutos). La fecha se formatea con `Intl.DateTimeFormat` según el idioma.
  - Cuerpo desde el Markdown.
  - Índice «En este artículo» con links a anclas reales de los H2 (Inv §11.7), con `scroll-margin-top` de 84 px.
  - «Seguir leyendo» lista otros artículos publicados y no aparece si no hay.
- `/insights/<slug>/` hereda el `<head>` de la fase 1: canonical, hreflang al artículo equivalente y title `«Título» — NoctiLabs`.

### 4.6 Hablemos (Inv §7)

- **Columna izquierda:** H1, lead, pasos y mail con `mailto:`.
- **Formulario, solo la interfaz** (el envío real va en la fase 4):
  - `<form method="post" novalidate>`, con `action` a definir en la fase 4.
  - Campos con `<label for>`, `name`, `autocomplete` y tipo correcto:
    - nombre: `name`, `autocomplete="name"`, requerido;
    - email laboral: `email`, `type="email"`, `autocomplete="email"`, `spellcheck="false"`, requerido;
    - empresa: `organization`, requerido;
    - rol: `organization-title`;
    - industria: `<select>` con las 5 industrias + «Otra», con `background-color` y `color` explícitos;
    - mensaje: `<textarea>`, requerido.
  - **Placeholders:** con ejemplo y terminados en «…».
  - **Validación en el cliente al enviar:** error en línea junto al campo, con texto que dice cómo corregirlo, `aria-invalid`, `aria-describedby` y foco en el primer error. El botón sigue habilitado.
  - **Estados:**
    - idle;
    - enviando: botón con «Enviando…» y deshabilitado;
    - enviado: panel «Gracias. Te vamos a escribir pronto.» con el foco movido al título;
    - error: mensaje con la alternativa del mail.
  - Las regiones de estado van con `aria-live="polite"`.
  - **Envío en la fase 2:** una función `submitContact(data): Promise<void>` que en esta fase rechaza siempre, por lo que se ve el estado «error» con el mail. La fase 4 la reemplaza por el envío real.
- Sin banda «Hablemos.».

### 4.7 Cambios transversales

- **Coherencia de tipografía:** los H1 internos usan peso 500 y `line-height: .96` (H1-INT). El H1 del home sigue en 400, como en el diseño.
- **Botones-link:** todo lo que en el diseño era `<button onClick=go>` pasa a `<a href>` con `href()`.
- **Sin JS:**
  - Las páginas se leen completas.
  - Las tabs muestran su primer panel.
  - El filtro de Insights muestra todo.
  - El formulario se ve, pero sin JS no envía y avisa con un `<noscript>` que muestra el mail.
- **`translate="no"`:** en «Nocti», «NoctiLabs» y nombres de sistemas (ERP, CRM, etc.) cuando aparecen como marca.

### 4.8 `AppSlot` (lugar reservado para la fase 3)

- Marco APP-FRAME (o el marco de Control) con alto mínimo de 560 px y fondo `--surface-2`.
- Adentro, un panel con el isotipo y el texto «Demo interactiva» / «Interactive demo». Va marcado con `data-placeholder` y `data-app-view`, más `data-app-role` cuando corresponde.
- **Props:** `view`, `role?`, `hideRoleChips?`, `permsSide?` y `frame: 'app' | 'control' | 'none'`. Son los mismos que usará la isla de la fase 3, así que el reemplazo no toca las secciones.

## 5. Interactividad (JS de la fase 2)

| Pieza | Dónde | Implementación |
|---|---|---|
| Alternancia y control Sin/Con | Home | `src/scripts/before-after.ts` |
| Tabs (APG) | Home industrias, tabs de rol | `src/scripts/tabs.ts`, genérico por `data-tabs` |
| Filtro de Insights | Insights | `src/scripts/insights-filter.ts`: lee y escribe la query con `history.replaceState`, filtra con `hidden` y actualiza el `aria-pressed` de los botones |
| Formulario | Hablemos | `src/scripts/contact-form.ts` (validación, estados, `submitContact`) |
| Hover y foco de tarjetas | Home | solo CSS |

Todo en TypeScript sin dependencias. Cada script se incluye solo en la página que lo usa.

## 6. Fuera de alcance

- `Nocti App v2` como isla React y la textura animada (fase 3).
- Envío real del formulario, sitemap, Open Graph, analítica y legales (fase 4).
- Fotos del equipo, foto de Servicios, artículos 2–6 y licencia de la fuente (fase 5, contenido del dueño).
- Vercel (fase 6).

## 7. Pruebas

- **TDD:** solo S1, extendida con la ruta de artículos (§3.2). No hay otras costuras confirmadas.
- **Verificación manual con evidencia:** igual que en la fase 1, con Chrome headless por CDP sobre `astro preview`. Los escenarios van en `docs/evidence/002/`.

## 8. Criterios de aceptación

| # | Criterio | Cómo se verifica |
|---|---|---|
| B1 | `npm run build` sin errores ni warnings y `npm test` en verde, con S1 extendida. | Salida de los comandos. |
| B2 | Las 20 rutas de la fase 1 más las 2 del artículo existen. Cada una tiene `lang`, canonical, hreflang, title, descripción y H1 correctos. | Matriz extraída de `dist/`, como A4. |
| B3 | **Fidelidad:** cada sección de Inv §1–§8 se compara con capturas lado a lado contra el diseño (textura «Ninguna»), en 1440×900 y 390×844. Las diferencias autorizadas son las de este spec; cualquier otra se corrige o se justifica. | Capturas por sección en `docs/evidence/002/capturas/`. |
| B4 | **Antes y después:** alterna cada 3,6 s solo en pantalla; el primer uso del control detiene la alternancia; `aria-pressed` refleja el estado; con reduced motion no alterna y muestra «Con». | Escenario CDP. |
| B5 | **Tabs:** teclado APG (flechas, Home/End), `aria-selected`/`tabindex` correctos y panel visible correcto. «Conocer más» lleva a la industria del panel. | Escenario CDP. |
| B6 | **Tarjetas:** con hover, con `:focus-within` y con `hover: none` se ve el ejemplo; con reduced motion, sin desplazamiento. | Escenario CDP con media emulada. |
| B7 | **Insights:** el filtro actualiza la query y la lista; al recargar con `?categoria=` filtra; el índice del artículo navega a sus anclas; el artículo tiene su equivalente en el otro idioma. | Escenario CDP. |
| B8 | **Formulario:** errores en línea con foco en el primero; estados «Enviando…» y «error» con el mail; labels, `name`, `autocomplete` y tipos correctos; sin JS, el aviso del mail. | Escenario CDP. |
| B9 | Cero links internos rotos, anclas incluidas, en las 22 rutas. | Script sobre `dist/`. |
| B10 | Cero errores de consola en las 22 rutas. | CDP. |
| B11 | El JS de la fase 2 pesa menos de 8192 bytes gzip por página, con el mismo método de medición que A10. | Inventario por página. |
| B12 | **Imágenes:** todas con `width`/`height`, AVIF/WebP, `loading="lazy"` debajo del pliegue y `alt` descriptivo (o `alt=""` si son decorativas); ninguna pesa más de 300 KB servida a 1440 px. | Script sobre `dist/`. |
| B13 | La revisión con web-design-guidelines queda sin hallazgos abiertos, salvo las excepciones de la fase 1. | Informe en la evidencia. |
| B14 | El layout de la fase 1 no se rompe: el checklist A7 vuelve a dar 51/51. | Re-ejecución del escenario. |
| B15 | gpt-6.1-sol aprueba el spec antes de empezar y la implementación con la evidencia B1–B14 sobre un mismo commit. | Veredicto con hash. |

## 9. Decisiones (con default)

- **D1. Tipografía.** Sigue pendiente; se usa la pila del diseño.
- **D4. Inglés.** Lo traduzco yo; pendiente de revisión.
- **D6. Diagramas.** Solo la Opción 2 y el comparador fuera.
- **D7. Industria inicial del Home.** Retail, el primero de la lista, en lugar de Manufactura.
- **D8. Industrias sin copy.** Lo redacto yo como borrador. *Alternativa:* publicar solo Retail y sacar las otras 4 de la navegación hasta tener el texto.
- **D9. Equipo.** Oculto hasta tener nombres, roles y fotos reales.
- **D10. Fotos faltantes.** Salen de fotogramas de los clips de stock de Artlist que el dueño ya usó para el
  video del hero:
  - Retail: «Stocktaking Warehouse Worker Inventory Check» (depósito con estanterías, coincide con el placeholder
    del diseño).
  - Servicios: «Floor Business Window Office» (oficina).

  El panel oscuro con isotipo queda solo como respaldo si falta una foto.
- **D11. Insights.**
  - Se publica solo el artículo con cuerpo.
  - Los otros 5 títulos del diseño no se publican sin texto.
  - El blog viejo en Sanity («No context, no intelligence», etc.) se evalúa en la fase 4.
- **D12. Terminología.** Se mantienen «cerebro operativo» (Home y Nosotros) y «organizacional» (Producto), como en el diseño; lo decide el dueño.

## 10. Plan

1. **Primitivas UI y contenido tipado** (`content/pages`, `industries.ts`). Se verifica con B1.
2. **S1 extendida con TDD y colección de Insights.** Se verifica con B1 y B2.
3. **Home** (sin las piezas de la fase 3). Se verifica con B3–B6.
4. **Producto.** Se verifica con B3.
5. **Industrias** (plantilla + 5). Se verifica con B3.
6. **Nosotros, Insights y Artículo.** Se verifica con B3 y B7.
7. **Hablemos.** Se verifica con B8.
8. **Imágenes optimizadas, revisión con guidelines, links, consola y peso de JS.** Se verifica con B9–B14.
9. **Evidencia y gate de gpt-6.1-sol.** Se verifica con B15.
