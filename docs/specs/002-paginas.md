# Spec 002 — Páginas

Estado: borrador, pasada 3 de revisión · 2026-10-04

## 1. Contexto

La fase 1 (spec 001) dejó la base:

- 20 rutas ES/EN con canonical y hreflang;
- tokens y layout base;
- header, megamenú, menú mobile y footer;
- páginas vacías;
- un hero provisorio con video en el home.

La fase 2 llena las páginas con el contenido y la interactividad del diseño, salvo dos piezas que van en la fase 3:

- la maqueta `Nocti App v2` como isla React, incluidas las tabs de rol de la demo del home;
- la textura animada de fondo.

**Fuente:**
- el diseño `NoctiLabs Web v3.dc.html`;
- el inventario `docs/specs/002-inventario-diseno.md`. Es un relevamiento versionado de layout, tipografía, colores, copy literal, interactividad y huecos de cada sección, citando líneas. Este spec referencia sus secciones como «Inv §N».

**Decisiones del dueño vigentes:**
- Astro con React solo en islas (fase 3);
- ES + EN;
- SDD con revisión de gpt-6.1-sol;
- TDD solo en la costura S1;
- reglas de UI de web-design-guidelines;
- Vercel diferido hasta terminar la web;
- avanzar hasta completar todas las fases.

**Tipografía (D1, resuelta):** Inter, auto-hospedada como `--font-sans`, con la pila de Neue Haas Unica detrás. La fidelidad se juzga con Inter. Si el dueño trae un kit de Adobe Fonts con Neue Haas Unica, se cambia el token y se repiten las capturas.

## 2. Objetivo

Que las 7 páginas del diseño queden implementadas en los dos idiomas:

- Home;
- Producto;
- Industria (×5);
- Nosotros;
- Insights;
- Artículo;
- Hablemos.

Todas fieles al diseño y accesibles. Las piezas de la fase 3 quedan con lugar reservado, y el formulario llega hasta la interfaz completa (el envío real es de la fase 4).

## 3. Arquitectura del contenido

### 3.1 Fuente única por dato

| Dato | Fuente | Forma |
|---|---|---|
| Texto de interfaz compartido (nav, botones, banda «Hablemos.», 404) | `src/i18n/ui.ts` | ya existe; se suman claves |
| Metadatos de home, producto, nosotros, insights y hablemos (title, description) | `src/i18n/ui.ts` → `pages` | ya existe; se **quitan** las 5 entradas de industrias |
| Copy de cada página | `src/content/pages/<pagina>.ts` | `export const <pagina>: Localized<PaginaCopy>` |
| Industrias: copy visible **y** metadatos | `src/content/industries.ts` | `Record<IndustryId, Localized<Industry>>` (ver §3.3) |
| Artículos: cuerpo **y** metadatos | colección `insights` (ver §3.4) | Markdown por artículo e idioma |
| Fotos | `src/assets/` | importadas como `ImageMetadata` |

`Localized<T> = Record<Locale, T>`: una clave que falte en inglés es error de compilación. El title y la
descripción de cada página salen de `src/lib/meta.ts`:

- `pageMeta(page: PageRef, locale): { title, description }`;
- industria: title `«label» — NoctiLabs` y descripción = `blurb`;
- artículo: title `«title» — NoctiLabs` y descripción = `excerpt` de la entrada en ese idioma;
- resto: desde `ui.pages`.

El tipo `PageKey` y `pageTitle` de la fase 1 se reemplazan por `pageMeta`, y se adaptan todos sus consumidores.

### 3.2 Rutas de artículos (extiende S1)

`PageRef` suma `{ id: 'articulo', article: ArticleId }`. Hay un registro `ARTICLE_SLUGS` en `routes.ts`, igual que el de industrias:

| ArticleId | slug es | slug en |
|---|---|---|
| `contexto-sistema-operativo` | `el-contexto-es-el-nuevo-sistema-operativo` | `context-is-the-new-operating-system` |

URLs del contrato que se agregan:

```
/insights/el-contexto-es-el-nuevo-sistema-operativo/
/en/insights/context-is-the-new-operating-system/
```

**TDD de S1, en rebanadas separadas y con literales:**
1. `href` del artículo en los dos idiomas, con y sin fragmento.
2. `alternates` del artículo.
3. `pageFromPath`:
   - las 2 URLs con barra final y sin ella;
   - negativos: `/insights/inexistente/`, `/en/insights/el-contexto-es-el-nuevo-sistema-operativo/` (slug español con prefijo inglés), `/insights/context-is-the-new-operating-system/` y `/insights/el-contexto-es-el-nuevo-sistema-operativo//`.
4. Tipos: un `ArticleId` inexistente se rechaza con `// @ts-expect-error` en `tests/routes.types.ts`.

`PAGES` (el enumerador de `routes.ts` del que salen `BY_PATH` y `pageFromPath`) suma los artículos del registro.

**Páginas:** `src/pages/insights/[slug].astro` y `src/pages/en/insights/[slug].astro`. Su `getStaticPaths()` llama a
`getArticles()` (§3.4), toma el slug del registro para su idioma y pasa la entrada localizada como prop.
Las colecciones de Astro no generan rutas solas, y el `id` de la entrada nunca se usa como slug.

En el header, «Insights» queda activo (`data-active`) en los artículos. `aria-current` solo va en `/insights/`.

### 3.3 Industrias

```ts
interface Industry {
  label: string; short: string; blurb: string;            // ya existen (nav, tabs, metadatos)
  hero: { kicker: string; h1: string; lead: string };
  photo: Photo;                                           // ver §3.5
  processes: [Item, Item, Item, Item];                    // Item = { title: string; text: string }
  questions: [Question, Question, Question, Question];    // Question = { q: string; area: string }
  agents: [Item, Item, Item, Item];
  why: [Why, Why, Why, Why];                              // Why = { strong: string; rest: string }
  draft: boolean;                                         // true = copy redactado, pendiente del dueño (D8)
}
```

- **Retail:** copy literal del diseño (Inv §3), con `draft: false`.
- **Las otras cuatro:** copy redactado por mí con `draft: true`, anotado en `docs/pendientes.md` (§9).

### 3.4 Colección de artículos

`src/content.config.ts`:

```ts
const insights = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/insights' }),   // id por archivo (default): no colisiona
  schema: z.object({
    articleId: z.enum(ARTICLE_IDS), lang: z.enum(['es', 'en']),
    title: z.string().min(1), category: z.enum(CATEGORY_IDS), excerpt: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),   // fecha editorial, sin hora ni zona
    minutes: z.number().int().positive(),
  }),
});
```

- **Archivos:** `src/content/insights/<articleId>.<lang>.md`.
- **Slug:** el de la URL sale **del registro**, no del frontmatter, así que no pueden divergir.
- **Categorías:** `CATEGORY_IDS` son estables e independientes del idioma: `tesis`, `contexto`, `ia-operativa`, `agentes` y `transformacion`. Sus labels por idioma van en `ui.ts`.
- **Validación en el build:** `src/lib/insights.ts` → `getArticles()` agrupa las entradas por `(articleId, lang)`
  y falla si:
  - algún par aparece más de una vez (dos archivos con el mismo artículo e idioma; los ids son por archivo, así que los dos llegan a la validación);
  - algún `ArticleId` registrado no tiene exactamente una entrada `es` y una `en`;
  - algún cuerpo está vacío.

  Que el `articleId` sea uno registrado lo garantiza el esquema.
- **Fecha:** se formatea con `Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' })` sobre `new Date(date + 'T00:00:00Z')`, así no depende de la zona horaria de la máquina que construye el sitio. Vale para el destacado y para el artículo.

  Las páginas de artículo y de Insights usan solo esa función.
- **Índice «En este artículo»:** se genera con los `headings` de profundidad 2 que devuelve `render(entry)`, con los ids que asigna Astro. No hay TOC escrito a mano.
- **Estilos del cuerpo:** son globales y van acotados a un wrapper `.prose-article` en `src/styles/article.css`, con los valores de Inv §6.2 (lead, H2, p y blockquote).
- **Lead:** el primer párrafo del Markdown es el lead y lleva la clase por posición (`.prose-article > p:first-child`).
- **Cita:** se escribe como `>` en Markdown.

### 3.5 Fotos

```ts
type Photo = { src: ImageMetadata; alt: Localized<string> } | null;
```

- **Componente:** `<Picture>` de `astro:assets` con `formats={['avif', 'webp']}`, `fallbackFormat="jpg"`, `widths={[480, 768, 1080, 1440, 1920]}` y un `sizes` por contexto:
  - visor del home y foto de industria: `(min-width: 1200px) 1108px, calc(100vw - 32px)`;
  - `quality={70}`.
- **Carga según el contexto:**
  - En la página de industria, la foto va inmediatamente después del hero y puede entrar en el primer viewport: `loading="eager"` y `decoding="async"`.
  - En el visor del home, las cinco fotos son `loading="lazy"`. Cuando la sección se acerca al viewport (`IntersectionObserver` con `rootMargin: 600px`), el script de tabs pasa las cinco a `loading="eager"`. Así, la activación automática de las tabs no muestra una foto pendiente.
- **Fuentes:** las tres fotos del diseño (`ind-manufactura.png`, `ind-consumo.png`, `ind-fitness.png`) y los dos fotogramas de D10 (`ind-retail.png`, `ind-servicios.png`), todas en `src/assets/industries/`.
- **Sin foto (`photo === null`):** se muestra el panel oscuro de respaldo con el isotipo y el label (`role="img"` y `aria-label` = label).

### 3.6 Componentes

Primitivas en `src/components/ui/`, con los valores de Inv §0.2:

- `Container`;
- `HeadRow`;
- `Kicker`;
- `CardBig`;
- `DarkBig`;
- `Button`: dark, white o ghost; siempre `<a>` cuando navega;
- `Segmented`: visual SEG; la semántica la pone quien lo usa;
- `AppSlot` (§4.8).

Las secciones son componentes por página en `src/components/sections/<pagina>/`, y las páginas siguen siendo finas.

## 4. Páginas

Cada sección reproduce Inv con sus valores exactos. Acá solo se listan las decisiones y las diferencias.

### 4.1 Home (Inv §1)

1. **Hero:** el provisorio de la fase 1 se mantiene: video, velo, pausa, H1 400, lead y dos CTA.

2. **Antes y después** (Inv §1.2): solo la **Opción 2** (`diagrams(con)`). El control «Comparar · Opción 1 / Opción 2» y `diagramsOld` no se portan (D6).
   - **Marcado:** los diagramas son HTML y SVG generados en el build con los datos de Inv §9.10–9.11. Los nodos van posicionados en %, las líneas en un SVG `viewBox 0 0 100 100`, y el estado va en el contenedor como `data-state="sin|con"`.
   - **Transiciones:** en CSS, con opacidad, escala y los delays escalonados de las líneas.
   - **Accesibilidad:**
     - Los nodos y el SVG son gráficos y llevan `aria-hidden="true"`.
     - El equivalente textual de cada diagrama es su pie visible (kicker, título y texto), que cambia con el estado.
     - El cierre («Tus sistemas siguen siendo tus sistemas…») queda fuera del árbol accesible mientras el estado es «sin»: `visibility: hidden` cuando termina de desvanecerse.
   - **Control Sin/Con:** un grupo de dos `<button aria-pressed>`, con `aria-describedby` hacia un texto solo para lectores: «Elegir una vista detiene la animación automática.» / «Choosing a view stops the automatic animation.».
   - **Transición de estado** (una sola función `setState(state, origin)`): actualiza `data-state`, el `aria-pressed` de los dos botones, el texto del H2 (`morphTitle`) y los pies de los tres diagramas. Si `origin` es `'usuario'`, además escribe en una región `aria-live="polite"` persistente y visualmente oculta el texto «Con Nocti: Cómo pueden operar.» o «Sin Nocti: Cómo operan hoy las empresas.». La alternancia automática no escribe en esa región.
   - **Alternancia automática:**
     - Cada 3600 ms, solo mientras el **bloque acotado** formado por el control y el H2 intersecta el viewport (`IntersectionObserver`, threshold 0) y la pestaña está visible (`document.hidden === false`). No se observa la sección entera, que en pantallas bajas puede ser más alta que el viewport.
     - El primer uso del control la detiene para siempre en esa carga, aunque se salga y se vuelva.
   - **Reduced motion:**
     - Con `prefers-reduced-motion: reduce` no hay alternancia y las transiciones van a 0 ms. El estado inicial es «con» y el control sigue disponible para elegir cualquiera de los dos.
     - El cambio de preferencia se escucha en vivo. Si pasa a `reduce`, se detiene la alternancia; si el usuario ya había elegido un estado, se respeta, y si no, queda «con».
   - **Sin JS:** el HTML inicial es el estado **«con»** y el control queda `hidden`. Con JS el control siempre se muestra. Sin reduced motion, el script pone «sin» y arranca la alternancia cuando el bloque entra en pantalla. La sección está debajo del pliegue, así que el cambio no se ve.
   - **Nodos a 320 px:** el lienzo es un contenedor (`container-type: inline-size`) y el texto de los nodos escala con `font-size: clamp(9px, 3.4cqw, 13px)` (y el padding en proporción). Así, a 320 px los nodos con `nowrap` no se recortan ni se superponen.
   - **Mobile:** el H2 puede ocupar varias líneas; no se porta el `nowrap` (Inv §11.22).
   - **Contraste:** `chipOff` usa texto `#6B6B68` (4,85:1 sobre `#F4F4F2`) en lugar de `#9A9A96`, con el borde punteado `#9A9A96`. Diferencia autorizada.

3. **Toda la empresa puede preguntar** (Inv §1.3):
   - Head-row, nota al pie y el `AppSlot` de la demo por rol (`variant="role-demo"`, §4.8).
   - Las tabs de rol **no** se renderizan en la fase 2: llegan con la isla de la fase 3, que controla el rol y la rotación con `onChatDone`.

4. **Capacidades** (Inv §1.4): 4 tarjetas y CTA ancho a `href(producto, 'agentes')`.
   - **El ejemplo de cada tarjeta se ve siempre**, debajo de la descripción, sin despliegue. Las tarjetas no son interactivas y así no hay contenido oculto inaccesible por teclado ni en táctil. Diferencia autorizada.
   - **Hover** (solo con `@media (hover: hover)`): oscurecer y elevar como en el diseño. Se transicionan `transform` y colores.
   - **Colores del ejemplo:** en reposo, texto `--body-2` sobre blanco con borde superior `--line`; en hover, `#D9D9DC` sobre `#0A0A0B` con borde `#2A2A2E`. La viñeta es azul en los dos.
   - Con reduced motion, sin `translateY` y sin transición.

5. **Cuatro pasos** (Inv §1.5): igual criterio que Capacidades, con el ejemplo siempre visible y los colores según el fondo.
   - La tarjeta 04 queda oscura por defecto. Al pasar el mouse sobre otra, la 04 vuelve a clara: `.steps:has(.step:hover) .step:last-child:not(:hover)`, solo con `hover: hover`.

6. **Industrias** (Inv §1.6): selector con foto, título, blurb y «Conocer más →» a la página de **esa** industria. El diseño lleva todas a Retail (Inv §11.5).
   - **Arranque:** en Manufactura, como en el diseño (D7).
   - **Tabs** (patrón W3C APG, activación automática):
     - el `tablist` lleva `aria-label` «Industrias» / «Industries»;
     - cada tab tiene `id="ind-tab-<id>"`, `aria-controls="ind-panel-<id>"`, `aria-selected` y `tabindex` 0/-1;
     - cada panel tiene `role="tabpanel"`, `aria-labelledby` y `tabindex="0"`;
     - flechas izquierda y derecha con vuelta al principio, más Home y End;
     - Tab desde la tab activa entra al panel.
   - **JS:** los roles y atributos ARIA los pone el script al inicializar.
   - **Sin JS:** el control queda `hidden` y se ve solo el panel inicial con su botón. Las demás industrias igual son accesibles desde el header y el footer.
   - **URL:** la selección es estado efímero y no se refleja en la URL. Es una excepción documentada a la regla de URL de las guidelines (B13).

7. **Banda «Hablemos.»** (Inv §8): componente compartido, presente en todas las páginas salvo Hablemos.

### 4.2 Producto (Inv §2)

Anclas `#overview`, `#cerebro`, `#bi`, `#agentes` y `#control`. Las secciones reales reemplazan a las vacías de la fase 1 y mantienen `tabindex="-1"`.

1. **Hero:** según Inv §2.1.
2. **Demo general:** `AppSlot view="inicio"`.
3. **Overview** (Inv §2.3):
   - Diagrama de bloques con la barra Nocti y el isotipo (`Mark` en su variante oscura).
   - Los conectores de 3 columnas se muestran solo a partir de 1000 px. Por debajo hay un único conector vertical centrado entre los grupos (Inv §11.21).
4. **Cerebro, BI y Agentes** (Inv §2.4): head-row, chips y `AppSlot` (`cerebro` / `inteligencia` / `agentes`).
5. **Control** (Inv §2.5): capas, barra y `AppSlot view="control" frame="control"`. La grilla de capas pasa a 1 columna por debajo de 600 px.
6. **Captions de las demos** («Recorré Nocti…», «Probá “Ver transacciones”…», etc.): **no** se renderizan mientras el slot sea un placeholder, porque describen interacciones que todavía no existen. La fase 3 los restaura junto con la isla.

### 4.3 Industria (×5) (Inv §3)

- Una sola plantilla con las secciones de Inv §3.1–3.6, alimentada por `industries.ts`.
- **Kicker:** «Industrias · <label>».
- **Foto:** según §3.5.
- **«Otras industrias»:** las otras cuatro, cada una a su página.
- **Copy con `draft: true`:** no se marca visualmente; queda registrado en `docs/pendientes.md`.

### 4.4 Nosotros (Inv §4)

- Hero, «Quiénes somos / Por qué» y «Qué creemos» con el copy del diseño.
- **Equipo:** no se renderiza mientras `team` esté vacío (D9). El componente acepta `{ name, role, photo: Photo }`.

### 4.5 Insights (Inv §5) y Artículo (Inv §6)

- **Publicados:** solo los artículos con cuerpo. En la fase 2 es uno, `contexto-sistema-operativo`, en los dos idiomas (D11).
- **Lista:**
  - El destacado es el artículo más reciente.
  - La grilla tiene los demás, por fecha descendente.
  - Si no hay más artículos, la grilla no aparece.
- **Filtros por categoría: diferidos.** No se renderizan mientras haya menos de dos categorías con artículos. Su especificación (query `?categoria=` / `?category=` con ids estables, normalización de valores inválidos, destacado y grilla según el filtro) se escribe cuando exista ese contenido, en la fase 5.
- **Artículo:**
  - Cabecera: «← Insights» como link, categoría (label localizado), H1 y meta (autor «NoctiLabs», fecha según §3.4 y «8 min de lectura» / «8 min read»).
  - **H1 del artículo** (excepción a H1-INT): `clamp(32.8px, 4.4vw, 68.9px)`, peso 500, `line-height: 1`, `letter-spacing: -.05em` (Inv §6.1).
  - Cuerpo `.prose-article`, con el índice generado (§3.4).
  - «Seguir leyendo»: otros artículos publicados; no aparece si no hay.
- **Fecha y minutos:** los del diseño (18 sep 2026, 8 min) son ilustrativos y quedan en `docs/pendientes.md`.

### 4.6 Hablemos (Inv §7)

- **Columna izquierda:** H1, lead, pasos y mail con `mailto:`.
- **Formulario:**
  - `<form novalidate>`: el navegador no valida antes del `submit`, así que la validación propia muestra los errores en línea. El botón es `type="submit"`.
  - El HTML inicial lleva todos los controles dentro de `<fieldset disabled>`. Sin JS no hay control habilitado: ni el click ni el Enter envían nada.
  - Se suma un `<noscript>` con «Escribinos a hola@noctilabs.io» como link.
  - El script registra el `submit` con `preventDefault()` y recién después habilita el fieldset.
  - No hay `action` en la fase 2.
- **Campos:**

  | Campo | `name` | Tipo | `autocomplete` | Requerido |
  |---|---|---|---|---|
  | Nombre | `name` | text | `name` | sí |
  | Email laboral | `email` | email (`spellcheck=false`) | `email` | sí |
  | Empresa | `organization` | text | `organization` | sí |
  | Rol | `role` | text | `organization-title` | no |
  | Industria | `industry` | select, 5 + «Otra», con opción vacía «Elegí una…» | — | no |
  | Mensaje | `message` | textarea | — | sí |

  Placeholders con ejemplo y terminados en «…». El `<select>` lleva `background-color` y `color` explícitos.
- **Validación (al enviar):**
  - Los requeridos se validan con `trim()`, de modo que solo espacios cuenta como vacío. El email se valida con `validity.typeMismatch`.
  - Cada error va en línea, debajo del campo, con un texto que dice cómo corregirlo («Escribí tu email laboral, por ejemplo nombre@empresa.com»), `aria-invalid="true"` y `aria-describedby`.
  - El foco va al primer campo con error.
  - El error de un campo se limpia al editarlo.
- **Estados:**
  1. **idle**.
  2. **enviando:**
     - el estado se fija de forma sincrónica en el `submit`: el botón muestra «Enviando…» y queda deshabilitado, y un segundo submit se ignora;
     - recién después de dos `requestAnimationFrame` consecutivos se llama a `submitContact`, para que el navegador llegue a pintar el estado aunque la promesa rechace enseguida.
  3. **error:**
     - mensaje en línea con «No pudimos enviar el mensaje. Escribinos a hola@noctilabs.io.» (con el link);
     - el botón vuelve a estar habilitado y los valores se conservan.
  4. **enviado:**
     - panel «Gracias. Te vamos a escribir pronto.» con el foco en su título;
     - «Enviar otro mensaje» resetea el formulario, vuelve a idle y enfoca el primer campo.
  - Todo va en una región `aria-live="polite"` persistente.
- **Envío:** `submitContact(data)` está en `src/lib/contact.ts`. En la fase 2 rechaza siempre, así que «enviado» no es alcanzable y su verificación queda para la fase 4. En la fase 2 se verifican idle, validación, enviando y error.
- Sin banda «Hablemos.».

### 4.7 Cambios transversales

- **Tipografía de H1:** los H1 internos usan H1-INT (500, `line-height` .96). Hay dos excepciones, ambas como en el diseño: el H1 del home (400) y el del artículo (§4.5).
- **Navegación:** todo lo que en el diseño era `<button onClick=go>` pasa a `<a href>` con `href()`.
- **`translate="no"`:** en «Nocti», «NoctiLabs» y nombres de sistemas usados como marca.
- **Animaciones:** se transicionan `transform`, `opacity` y colores. La transición de colores en hover de tarjetas y botones es una excepción documentada a «animar solo transform/opacity» (B13), porque es corta y no mueve el layout. No se animan alturas.

### 4.8 `AppSlot` (contrato con la fase 3)

Props serializables, las mismas que tendrá la isla:

```ts
interface AppSlotProps {
  view: 'inicio' | 'cerebro' | 'inteligencia' | 'agentes' | 'control';
  locale: Locale;
  contactHref: string;               // destino de «Crear / Integrar» (onNewAgent) = href(hablemos)
  frame: 'app' | 'control' | 'none'; // marco APP-FRAME, el de Control o ninguno
  variant?: 'role-demo';             // demo por rol del home: tabs de rol + rotación, propias de la isla
}
```

| Embed | view | frame | variant |
|---|---|---|---|
| Home · demo por rol | cerebro | none | role-demo |
| Producto · demo general | inicio | app | — |
| Producto · Cerebro | cerebro | app | — |
| Producto · BI | inteligencia | app | — |
| Producto · Agentes | agentes | app | — |
| Producto · Control | control | control | — |

- **Placeholder de la fase 2:**
  - el marco correspondiente, con alto mínimo de 560 px y fondo `--surface-2`;
  - adentro, el isotipo y «Demo interactiva» / «Interactive demo»;
  - `data-placeholder` y los props como atributos `data-app-*`.
- **Fase 3:** reemplaza el interior del slot por la isla con los mismos props. El rol vive dentro de la isla `role-demo` y no hay comunicación con la página.

## 5. Interactividad (JS de la fase 2)

| Pieza | Script | Página |
|---|---|---|
| Antes/después | `src/scripts/before-after.ts` | Home |
| Tabs APG | `src/scripts/tabs.ts`, genérico por `data-tabs` | Home (industrias) |
| Formulario | `src/scripts/contact-form.ts` + `src/lib/contact.ts` | Hablemos |
| Tarjetas | solo CSS | Home |

TypeScript sin dependencias, incluido solo en la página que lo usa.

## 6. Fuera de alcance

- `Nocti App v2` como isla React (con las tabs de rol y los captions) y la textura animada: fase 3.
- Envío real del formulario, sitemap, Open Graph, analítica y legales: fase 4.
- Filtros de Insights, equipo, artículos 2–6, y revisión del copy en inglés y del copy redactado: fase 5 (ver `docs/pendientes.md`).
- Vercel: fase 6.

## 7. Diferencias autorizadas respecto del diseño

1. Sin el comparador Opción 1/2; solo la Opción 2.
2. `chipOff` con texto `#6B6B68`.
3. Ejemplos de Capacidades y Pasos siempre visibles, con colores según el fondo.
4. «Conocer más» lleva a la industria del panel.
5. Conectores de Overview y grilla de Control adaptados a mobile.
6. H2 del antes/después sin `nowrap`.
7. Inter en lugar de Neue Haas Unica.
8. Las diferencias de la fase 1.

**Temporales, con su fase de restitución:**

| Diferencia | Se restituye en |
|---|---|
| Demos de `Nocti App v2` como placeholder, sin tabs de rol ni captions (§4.1.3, §4.2.6, §4.8) | fase 3 |
| Textura de fondo ausente | fase 3 |
| Equipo de Nosotros oculto (§4.4) | fase 5 (contenido del dueño) |
| Insights sin filtros, sin grilla y sin «Seguir leyendo» mientras haya un solo artículo (§4.5) | fase 5 (contenido del dueño) |
| Formulario sin envío real; estado «enviado» inalcanzable (§4.6) | fase 4 |

Cualquier otra diferencia se corrige o se agrega acá como enmienda y pasa por el gate.

## 8. Criterios de aceptación

| # | Criterio | Cómo se verifica |
|---|---|---|
| B1 | `npm run build` sin errores ni warnings y `npm test` en verde, con S1 extendida (§3.2). | Salida de los comandos. |
| B2 | 22 rutas (20 + 2 del artículo) con `lang`, canonical, hreflang, title, descripción y H1 iguales a una tabla de **valores esperados escrita a mano** (`docs/evidence/002/b2-esperados.json`), más la 404. | Comparador como el de A4. |
| B3 | **Fidelidad:** matriz de secciones (Inv §1–§8) × 1440×900 y 390×844, con capturas lado a lado contra el diseño en las condiciones de A6 (textura «Ninguna», fuentes cargadas, fondo liso). Se captura por estado: antes/después en «sin» y en «con»; tarjetas en reposo y en hover; las cinco industrias del visor; y los estados alcanzables del formulario (idle, errores, enviando, error). Diferencias: solo las de §7, permanentes o temporales. EN y las otras 4 industrias se comparan **estructuralmente** contra ES y Retail: mismas secciones, sin desbordes. | `docs/evidence/002/capturas/` + matriz en el README de la evidencia. |
| B4 | **Antes/después:** alterna cada 3,6 s solo en pantalla; el primer uso del control la detiene aunque se salga y se vuelva; `aria-pressed`, H2 y pies quedan sincronizados; la región viva anuncia solo cambios manuales; con reduced motion (inicial y en vivo) no alterna y muestra «con»; sin JS se ve «con» y no hay control. | Escenario CDP + árbol de accesibilidad (CDP `Accessibility`). |
| B5 | **Tabs de industria:** roles, nombres, `aria-controls`/`labelledby`, `aria-selected`/`tabindex`, flechas con vuelta, Home/End, Tab al panel; «Conocer más» lleva a la industria del panel; sin JS, el panel inicial y sin control. | Escenario CDP con teclado real. |
| B6 | **Tarjetas:** ejemplo visible en reposo, en hover y en táctil, con contraste ≥ 4,5:1 en cada fondo; con reduced motion, sin desplazamiento. | Escenario CDP con media emulada + contraste calculado. |
| B7 | **Insights y artículo:** sin filtros (una sola categoría); destacado al artículo; el índice navega a las anclas generadas; el selector de idioma lleva al artículo equivalente. Si se borra la traducción de un artículo, el build falla (prueba manual). | Escenario CDP + prueba manual de build. |
| B8 | **Formulario:** sin JS, ni el click ni el Enter envían (sin pedidos de red ni navegación). Con JS: errores en línea con foco al primero, limpieza al editar, «Enviando…» visible y doble submit ignorado, estado error con el mail y valores conservados. Labels, `name`, `autocomplete` y tipos según §4.6. | Escenario CDP + registro de red. |
| B9 | Cero links internos rotos, anclas incluidas, en las 22 rutas. | Script sobre `dist/`. |
| B10 | Cero errores de consola en las 22 rutas. | CDP. |
| B11 | JS de la fase 2 < 8192 bytes gzip por página (mismo método que A10). | Inventario por página. |
| B12 | **Imágenes de contenido** (fotos de industria): AVIF/WebP con fallback JPG, `width`/`height`, y carga según §3.5. A 1440×900 con DPR 1, con la caché deshabilitada (`Network.setCacheDisabled`), se activa cada uno de los cinco paneles del visor y cada página de industria, se espera la carga y se registra el `currentSrc`. El archivo correspondiente en `dist/` pesa ≤ 300 KB (se mide el tamaño del archivo, no `transferSize`). Los `alt` se revisan a mano y se listan. | CDP + tamaños de `dist/` + lista en la evidencia. |
| B13 | Revisión con web-design-guidelines sin hallazgos abiertos, salvo las excepciones de la fase 1, la URL efímera de las tabs (§4.1.6) y la transición de colores (§4.7). | Informe en la evidencia. |
| B14 | El checklist del header vigente (75 casos al cerrar la fase 1, o el que esté vigente) sigue en verde. | Re-ejecución. |
| B15 | **Accesibilidad manual:** recorrido completo con teclado en cada página (orden, foco visible y no tapado por el header, sin trampas). **Reflow a 320 CSS px** (WCAG 1.4.10): sin scroll horizontal **y** sin contenido recortado, superpuesto ni perdido (texto completo de nodos, tarjetas, chips y formulario), revisado sobre capturas de página completa. **Zoom 200 %**, equivalente a un viewport de 720×450 CSS px: controles operables y foco visible. **Árbol de accesibilidad** de cada sección interactiva: nombres, roles y regiones vivas. No hay un lector de pantalla disponible; queda declarado como límite. | Escenario CDP + capturas a 320 y 720 px. |
| B16 | gpt-6.1-sol aprueba el spec antes de empezar y la implementación con la evidencia B1–B15 sobre un mismo commit. | Veredicto con hash. |

## 9. Decisiones y pendientes

- **D1. Tipografía.** Cerrada: Inter. Cambiarla requiere una nueva decisión explícita del dueño; no es un pendiente de la fase 5.
- **D4. Inglés.** Lo traduzco yo; pendiente de revisión del dueño.
- **D6. Diagramas.** Solo la Opción 2.
- **D7. Industria inicial del home.** Manufactura, como en el diseño.
- **D8. Industrias sin copy.** Lo redacto yo, con `draft: true`.
- **D9. Equipo.** Oculto hasta tener datos reales.
- **D10. Fotos faltantes.** Fotogramas de los clips de stock de Artlist que el dueño ya usó en el video:
  - Retail: «Stocktaking Warehouse Worker Inventory Check».
  - Servicios: «Floor Business Window Office».
- **D11. Insights.** Se publica solo el artículo con cuerpo.
- **D12. Terminología.** «Cerebro operativo» y «organizacional» como en el diseño.

`docs/pendientes.md` es el registro de lo que **la fase 5 tiene que cerrar antes del lanzamiento (fase 6)**. Para cada ítem hay que tener el contenido real entregado o una exclusión final aceptada por el dueño:

- revisión del inglés (D4);
- aprobación del copy de 4 industrias (D8);
- equipo (D9);
- artículos 2–6 o su exclusión (D11);
- fecha y minutos reales del artículo;
- terminología (D12);
- licencia de las fotos de stock en web (D10).

El gate técnico no aprueba ese contenido como final.

## 10. Plan

1. **S1 extendida con TDD** (§3.2), en rebanadas rojo/verde separadas para `href`, `alternates`, `pageFromPath` y tipos. Incluye el registro `ARTICLE_SLUGS` y los artículos en `PAGES`. Se verifica con B1.
2. **Contenido tipado y primitivas:** `meta.ts`, `content/pages`, `industries.ts` extendido, la colección con su validación y las páginas de artículo. Se verifica con B1 y B2.
3. **Home** (sin la isla). Se verifica con B3–B6.
4. **Producto.** Se verifica con B3.
5. **Industrias** (plantilla + 5, con fotos). Se verifica con B3 y B12.
6. **Nosotros, Insights y Artículo.** Se verifica con B3 y B7.
7. **Hablemos.** Se verifica con B8.
8. **`docs/pendientes.md`, guidelines, links, consola, peso de JS, checklist del header y accesibilidad manual.** Se verifica con B9–B15.
9. **Evidencia y gate de gpt-6.1-sol.** Se verifica con B16.
