# Spec 001 — Fundación de la web nueva

Estado: CERRADO · spec aprobado en la pasada 4 (2026-10-03); implementación aprobada en el gate pasada 5 (2026-10-04). A11 (Vercel) pasa al lanzamiento.

## 1. Contexto

La web nueva de NoctiLabs está diseñada en Claude Design. La fuente es la carpeta
`C:\Users\adria\OneDrive\Escritorio\NoctiLabs Web - deploy` («el diseño»):

- `NoctiLabs Web v3.dc.html`: el sitio entero como una sola página con estado
  (`home`, `producto`, `industria`, `nosotros`, `insights`, `articulo`, `hablemos`).
- `Nocti App v2.dc.html`: la maqueta interactiva del producto, embebida 4 veces.
- `support.js`: runtime de Claude Design (React global + plantillas). No va a producción.

La web que está en producción hoy es otra: `noctilabs/nocti-web-lastest`, en Vercel
con `noctilabs.io`, en inglés con alternativa en español y blog en Sanity. Se
reemplaza cuando la web nueva esté lista. Este spec no la toca.

Decisiones ya tomadas por el dueño:

- Repo nuevo (`noctilabs-web`) y proyecto de Vercel nuevo. El dominio se mueve en el lanzamiento.
- Sitio bilingüe: español e inglés.
- SDD: spec revisado → implementación → revisión. Las revisiones las hace gpt-6.1-sol.
- Las reglas de UI son las Web Interface Guidelines de Vercel (skill `web-design-guidelines`,
  fuente `vercel-labs/web-interface-guidelines/command.md`).

Fases del proyecto (cada una con su spec): **1 fundación** (este) · 2 páginas · 3 islas
interactivas (maqueta de la app, textura) · 4 formulario, SEO, analítica, legales ·
5 contenido real · 6 auditoría y lanzamiento.

## 2. Objetivo de la fase 1

Un repo que compila a un sitio estático con:

- todas las rutas en los dos idiomas;
- el layout base fiel al diseño: header cápsula, megamenú, menú mobile y footer;
- los tokens de diseño;
- páginas vacías con su H1;
- un preview en Vercel.

Sobre esta base, la fase 2 solo agrega el contenido de cada página.

## 3. Alcance

### 3.1 Stack

| Pieza | Decisión | Motivo |
|---|---|---|
| Framework | Astro 7.x, `output: 'static'` | Sitio de contenido; HTML estático e islas solo donde haga falta. |
| Lenguaje | TypeScript `strict` | `astro check` en el build. |
| Estilos | CSS plano: `src/styles/tokens.css` + `global.css` + `<style>` con scope por componente | El diseño usa valores exactos con `clamp()`; Tailwind solo agregaría una traducción. |
| JS en cliente | Un solo script chico para el header (megamenú y menú mobile), sin framework | React entra en la fase 3 junto con las islas, no antes. |
| Fuentes | Geist Mono auto-hospedada con `@fontsource/geist-mono` (400 y 500). Sans: la pila del diseño (ver D1) | Sin pedidos a Google y con preload. |
| Gestor de paquetes | npm, Node `>=22.12 <23` (`engines` en `package.json`, `.nvmrc` 22, Vercel en 22.x) | Mínimo de Astro; la máquina del dueño tiene 22.19. |
| Hosting | Vercel, preset estático de Astro, sin adaptador | No hay servidor en esta fase. |

Dependencias permitidas en la fase 1: `astro`, `@astrojs/check`, `typescript`,
`@fontsource/geist-mono`, `vitest`. Cualquier otra se justifica en el PR.

### 3.2 Rutas e i18n

Usa el i18n de Astro: `defaultLocale: 'es'`, `locales: ['es', 'en']`,
`routing.prefixDefaultLocale: false`. Las rutas en inglés traducen el slug.

| id | es | en |
|---|---|---|
| home | `/` | `/en/` |
| producto | `/producto/` | `/en/product/` |
| industria (×5) | `/industrias/<slug-es>/` | `/en/industries/<slug-en>/` |
| nosotros | `/nosotros/` | `/en/about/` |
| insights | `/insights/` | `/en/insights/` |
| hablemos | `/hablemos/` | `/en/contact/` |
| 404 | `/404.html`, una sola página bilingüe (excepción, ver 3.7) | — |

Industrias, identificadas por un `IndustryId` estable que no depende del slug (orden del diseño):

| IndustryId | slug es | slug en |
|---|---|---|
| `retail` | `retail-distribucion` | `retail-distribution` |
| `manufactura` | `manufactura` | `manufacturing` |
| `consumo` | `alimentos-consumo` | `food-consumer-goods` |
| `salud` | `salud-fitness` | `health-fitness` |
| `servicios` | `servicios` | `professional-services` |

Contrato de las 20 URLs, 10 por idioma. Es la lista exhaustiva y la fuente independiente de los tests de S1:

```
/                                   /en/
/producto/                          /en/product/
/industrias/retail-distribucion/    /en/industries/retail-distribution/
/industrias/manufactura/            /en/industries/manufacturing/
/industrias/alimentos-consumo/      /en/industries/food-consumer-goods/
/industrias/salud-fitness/          /en/industries/health-fitness/
/industrias/servicios/              /en/industries/professional-services/
/nosotros/                          /en/about/
/insights/                          /en/insights/
/hablemos/                          /en/contact/
```

- **Una sola fuente de verdad:** `src/i18n/routes.ts` define el registro de páginas y de industrias.
  Todos los links internos salen de él y nunca se escribe una ruta a mano. La interfaz pública es:
  - `type PageRef = { id: 'home'|'producto'|'nosotros'|'insights'|'hablemos' } | { id: 'industria', industry: IndustryId }`
  - `href(page: PageRef, locale: 'es'|'en', hash?: string): string`. Devuelve la ruta con la barra final.
    Normaliza el fragmento: `'overview'` y `'#overview'` dan `/producto/#overview`. Si `hash` es `''` o no se pasa, no lleva fragmento.
  - `alternates(page: PageRef): { es: string; en: string; 'x-default': string }`. Devuelve URLs absolutas con `https://noctilabs.io`, sin fragmento.
  - `pageFromPath(pathname: string): { page: PageRef; locale: 'es'|'en' } | null`.
    - Recibe solo un pathname, sin query ni hash. Es la inversa de `href` sin fragmento.
    - Acepta la ruta con una sola barra final o sin ella. Con barras repetidas (`/producto//`) devuelve `null`.
    - Devuelve `null` en cualquier path que no esté en el contrato, por ejemplo `/en/producto/` o `/404.html`.
    - La usan el selector de idioma y el estado activo del nav.
  - Un `IndustryId` inexistente es un error de tipos.
- **`getStaticPaths()`** de las páginas de industria se genera desde el registro, con `params: { slug }` y `props: { industry }`.
- **Textos:** van en `src/i18n/ui.ts`, en un diccionario `{ es: {...}, en: {...} }` tipado. Las claves de
  `en` tienen que ser exactamente las de `es`, y lo verifica el tipo.
- **Inglés:** lo traduzco yo y queda marcado como pendiente de revisión del dueño (D4).
- **Title y descripción:** el copy de la fase 1 vive en `ui.ts` y se copia en una tabla de valores esperados
  adjunta al PR. A4 compara contra esa tabla, es decir, conformidad técnica. La revisión editorial es aparte (D4).
- **Artículos de Insights:** `/insights/<slug>/` no entra en la fase 1. La fuente del contenido se decide en la fase 4.
- **Barra final:** `trailingSlash: 'always'` y `build.format: 'directory'` en Astro. En el hosting,
  `vercel.json` con `"trailingSlash": true`, porque en los sitios estáticos Astro delega la redirección a la
  plataforma.
- **Sin redirección automática por idioma:** no se mira `Accept-Language`, porque una redirección
  automática perjudica a los buscadores y a quien comparte links. Es una excepción documentada a la regla
  «Detect language» de las guidelines.

### 3.3 `<head>` base (`src/layouts/Base.astro`)

Aplica a las 20 páginas de 3.2. La 404 es una excepción, descrita en 3.7.

- `<html lang="es">` o `lang="en"` según la página.
- `<title>` y `<meta name="description">` por página, desde `ui.ts`. Formato del title: `«Página» — NoctiLabs`. En el home: `NoctiLabs — «lema»`.
- `<link rel="canonical">` absoluto, con `site: 'https://noctilabs.io'`.
- `<link rel="alternate" hreflang="es|en|x-default">` hacia la ruta equivalente, desde `alternates()`. `x-default` apunta a la versión en español.
- `<meta name="theme-color" content="#F4F4F2">` y `color-scheme: light`. No hay modo oscuro; el diseño es claro.
- Viewport sin `maximum-scale` ni `user-scalable=no`.
- Preload del woff2 de Geist Mono 400 con `font-display: swap`.
- Favicon: el isotipo del diseño (`mark()`) exportado a `public/favicon.svg`.
- Sitemap, Open Graph y robots quedan para la fase 4.

### 3.4 Tokens (`src/styles/tokens.css`)

Salen del diseño. Se definen como custom properties en `:root`.

```
--bg: #F4F4F2           fondo de página
--ink: #0B0B0C          texto principal, CTA
--ink-hover: #2A2A2C    hover del CTA oscuro
--muted: #6B6B68        texto secundario, kickers
--body-2: #3A3A38       párrafos secundarios
--body-3: #262626       descripciones del megamenú y de los subítems mobile
--line: #E2E2DE         bordes, divisores
--surface: #E6E6E2      placas grises
--surface-2: #E9E9E5    marco de la maqueta
--surface-3: #EDEDEA    hover claro
--white: #FFFFFF
--blue: #0047FF         isotipo, acento
--blue-link: #0038CC    links de texto, «Con Nocti»
--blue-light: #3D7BFF   acento sobre fondo oscuro
--dark: #0A0A0B         secciones oscuras
--glass: rgba(190,190,188,.62)  cápsula del header y megamenú
--glass-filter: blur(18px) saturate(1.15)

--font-sans: 'Neue Haas Unica Pro','Neue Haas Unica','Helvetica Neue',Helvetica,Arial,sans-serif
--font-mono: 'Geist Mono',ui-monospace,monospace

--edge:    clamp(16.4px,3.3vw,45.9px)    → 16px con <1000px
--display: clamp(42.6px,5.9vw,95.1px)    → 46px con <1000px
--h2:      clamp(27.9px,3.4vw,52.5px)    → 32px con <1000px
--radius-pill: 999px · --radius-capsule: 28px · --radius-card: 20px
```

El corte entre desktop y mobile es 1000px, igual que el diseño (`isMobile()`: `w < 1000`). Los estilos
base son los de mobile, y una sola media query literal `(min-width: 1000px)` aplica los de desktop. En JS se
usa la misma query con `matchMedia`.

`global.css`:

- `box-sizing: border-box`. El `body` usa `--bg`, `--ink`, `--font-sans`, 16px,
  `line-height: 1.55`, `-webkit-font-smoothing: antialiased` y `text-wrap: pretty` (`balance` en h1 y h2).
- Los links de texto son `--blue-link` y en hover `--ink`, como en el diseño (L15).
- Se agregan `touch-action: manipulation`, `-webkit-tap-highlight-color: transparent` y un foco
  visible global con `:focus-visible` (outline de 2px en `--blue-link` con offset de 2px). Nunca `transition: all`.
- **Los links de navegación no heredan el azul.** En el diseño eran `<button>` con `all:unset`, así que
  heredaban la tinta. Logo, ítems del nav, ítems del megamenú, links del menú mobile y links del footer
  llevan `color: inherit` y `text-decoration: none`, con el hover que se indica en cada caso en 3.5 y 3.6.

### 3.5 Header (`src/components/Header.astro`)

Reproduce el header del diseño (`NoctiLabs Web v3.dc.html`, L16–70) con estas diferencias
obligatorias.

**Estructura y estilo**

- Todo lo que navega es `<a href>`, no `<button onClick>`.
- **Header:** `<header>` sticky con `top: 0`, `z-index: 30` y alto de 76px.
- **Cápsula:** `position: absolute`, `top: 10px`, centrada, con ancho `max-content` y tope
  `calc(100% - 2*var(--edge))`. Fondo `--glass` con `backdrop-filter: var(--glass-filter)`, radio de 28px,
  `overflow: hidden` y **alto automático**: crece para contener el menú mobile.
- **Fila superior de la cápsula** (L24): alto de 56px, padding `0 10px 0 28px`, flex con
  `align-items: center` y gap `clamp(23px,2.6vw,42.6px)`.
- **Logo** (L25): «NoctiLabs», texto con peso 600, 21px y `letter-spacing: -.045em`, en tinta.
  Es un `<a>` al home del idioma actual, con `translate="no"`. No tiene hover visual.

**Desktop (≥1000px)**

- **Nav** (L27–31): gap `clamp(14.8px,1.6vw,24.6px)`. Ítems Producto, Industrias, Nosotros e
  Insights: mono 13px, `letter-spacing: .01em`, mayúsculas, alto de 56px. Opacidad .82, y 1 en hover y en la sección activa.
  - **Sección activa:** con `data-active` y opacidad 1. Se marca cuando la página actual pertenece a esa
    sección: Producto en `/producto/`, Industrias en cualquier industria, Nosotros e Insights en sus páginas.
  - **`aria-current="page"`:** va solo en el link cuyo `href` coincide exactamente con la página actual.
    Por ejemplo, el link «Industrias» apunta a Retail, así que en Manufactura se ve activo pero no lleva `aria-current`.
- **CTA** (L33): «Hablemos →», mono 12px, mayúsculas, `letter-spacing: .01em`, padding `9px 16px`.
  Píldora `--ink` con texto `--white`; en hover, fondo `--ink-hover`.

**Megamenú (desktop, L57–68)**

- Producto e Industrias tienen panel.
  - **Contenedor:** `position: absolute`, `top: 66px`, centrado, ancho `min(760px, calc(100% - 2*var(--edge)))` y
    `padding-top: 8px`. Ese padding es el puente invisible que mantiene el hover entre la cápsula y el panel.
  - **Superficie** (dentro del contenedor): glass, radio de 28px, padding `22px 28px 28px` y flex en columna con gap de 20px.
  - **Contenido:** kicker en mono 12px, mayúsculas, `letter-spacing: .02em`. Debajo, una grilla de 2 columnas
    con gap `22px 40px`. Cada ítem es un `<a>` en mono con columna de gap 8px: label en 14px/500 y
    descripción en 13px, `line-height: 1.4`, color `--body-3`. Hover: opacidad .65.
  - **Producto** (L514): Overview, Cerebro, Inteligencia / BI, Agentes y Control, con sus descripciones.
    Apuntan a `href({id:'producto'}, locale, '#overview'|'#cerebro'|'#bi'|'#agentes'|'#control')`.
  - **Industrias** (L515–521): las 5 industrias con su `blurb`, cada una a su ruta.
- **Controles:** el label del ítem («Producto», «Industrias») es un `<a>` a su página. Industrias apunta a
  Retail, como en el diseño (ver D2). Pegado al label va un `<button>` de 24×56 con chevron decorativo
  (`aria-hidden`), `aria-expanded`, `aria-controls` y `aria-label` («Abrir menú de Producto» / «Open Product menu»).
- **Contrato de estado** (patrón *disclosure navigation* de la W3C APG):
  1. Hay un solo panel abierto a la vez. Cada panel abierto tiene un modo: `hover` (lo abrió el puntero)
     o `fijo` (lo abrió el botón).
  2. Un panel cerrado tiene `hidden`, así que no se puede tabular ni lo lee el lector de pantalla.
  3. **Click o Enter/Espacio en el botón:**
     - Si el panel está cerrado, lo abre en modo `fijo`.
     - Si está abierto en modo `hover`, lo pasa a `fijo` sin cerrarlo.
     - Si está en modo `fijo`, lo cierra.
     - Si estaba abierto el otro panel, ese se cierra y se cancelan sus temporizadores.
     - En todos los casos el foco se queda en el botón activado. Si el panel quedó abierto, el siguiente Tab
       entra a su primer link. Si quedó cerrado, Tab sigue por los controles visibles del header.
  4. **Hover:** al entrar el puntero a un ítem con panel (label o botón), si el panel está cerrado se abre en
     modo `hover`. Si ya está abierto en modo `fijo`, conserva ese modo.
     Al salir del conjunto ítem + contenedor del panel, se programa el cierre a los 120 ms. Si el puntero
     vuelve antes, se cancela. El hover nunca cierra un panel en modo `fijo`.
     **Prioridad del foco:** mientras el foco esté en un panel abierto o en su botón, se ignora el hover sobre
     el otro grupo y no corre el cierre retardado. Para cambiar de panel hay que activar el otro botón (paso 3).
  5. **Foco:** si el foco sale del conjunto botón + panel (`focusout` con `relatedTarget` fuera), el panel se
     cierra sin mover el foco.
  6. **Esc**, con cualquier megamenú abierto y esté donde esté el foco, cierra el panel. Si el foco estaba en
     el botón o dentro del panel, queda en el botón. Si estaba en otro lado, no se mueve. El panel no se reabre
     por hover hasta que el puntero salga del ítem y vuelva a entrar.
  7. **Click fuera del header:** cierra el panel sin mover el foco.
  8. `aria-expanded` refleja siempre el estado real.
  9. **Temporizadores:** todo cierre o reemplazo de un panel (por botón, hover, Esc, foco, click fuera o
     cambio de breakpoint) cancela los temporizadores pendientes del panel anterior. Además, cada callback
     verifica que sigue correspondiendo a la apertura vigente antes de actuar.
- Sin JS, los labels siguen siendo links que funcionan y los paneles quedan cerrados.

**Mobile (<1000px)**

- **Fila superior:** logo y un `<button>` de 44×44 con `margin-right: -10px` (L37). Lleva
  `aria-label` («Abrir menú» / «Cerrar menú» y equivalentes en inglés), `aria-expanded`, `aria-controls`
  y un ícono SVG de 20×20 con `stroke-width: 2`. Los paths son los del diseño (L767):
  `M4 8h16M4 16h16` cerrado y `M6 6l12 12M18 6L6 18` abierto.
- **Panel** (L43–55): va dentro de la cápsula, debajo de la fila superior, con `hidden` cuando está cerrado.
  - Caja: margen `0 18px`, `border-top: 1px solid rgba(11,11,12,.14)`, padding `8px 0 18px`,
    `max-height: calc(100dvh - 110px)`, `overflow-y: auto` y `overscroll-behavior: contain`.
  - **Grupos:** Producto (con 5 subítems a las anclas), Industrias (con 5 subítems), Nosotros e Insights.
    Cada grupo tiene padding `12px 0` y `border-bottom: 1px solid rgba(11,11,12,.1)`. El label del grupo es un `<a>`
    en mono 15px mayúsculas con padding `4px 0`. Los subítems son `<a>` en mono 14px, padding `6px 0`, color `--body-3`.
  - **CTA:** «Hablemos →», píldora `--ink` con margen superior de 16px, padding `14px 20px`, mono 14px en mayúsculas y centrado.
  - Debajo del CTA va el selector de idioma.
- **Contrato de estado** (disclosure no modal):
  1. El botón alterna el panel. Al abrir, el foco se queda en el botón y Tab entra al panel en orden.
  2. **Esc** cierra el panel y devuelve el foco al botón.
  3. Un toque, un click primario sin modificadores o Enter sobre un link del panel cierra el panel. Si el
     link es un fragmento de la página actual, aunque ya esté en la URL, además se enfoca el destino (que
     tiene `tabindex="-1"`) y se hace scroll hasta él respetando los 84px. Tab sigue desde ese destino.
     Ctrl/Cmd/Shift + click y el click central conservan la navegación nativa: no se cierra el panel ni se
     intercepta el link.
  4. **Click fuera de la cápsula:** cierra sin mover el foco.
  5. **`focusout`** fuera de botón + panel: cierra sin mover el foco.
  6. **Al cruzar a desktop** (`matchMedia('(min-width: 1000px)')`): el panel se cierra. Si el foco estaba en
     el botón o dentro del panel, pasa al logo.
  7. **Al cruzar a mobile:** los dos megamenús se cierran y se cancelan sus temporizadores. Si el foco estaba
     en cualquier control que desaparece en mobile (los cuatro links del nav, los dos chevrons, el CTA
     «Hablemos» o un link del megamenú), pasa al logo. Al volver a desktop, todos los paneles siguen cerrados.

**Común**

- **Selector de idioma** (agregado; el diseño no lo tiene): `src/components/LangSwitch.astro` muestra «ES · EN».
  - El idioma actual es texto con `aria-current="true"`.
  - El otro es un `<a>` a la ruta equivalente, calculada con `pageFromPath` + `href`, con `hreflang` y `lang`.
  - Va en dos lugares: la fila inferior del footer y el menú mobile. En la cápsula desktop no va (ver D3).
- **Skip link:** «Saltar al contenido» / «Skip to content». Es el primer elemento enfocable, oculto hasta
  recibir foco, y apunta a `<main id="contenido" tabindex="-1">`, de modo que el foco se mueve de verdad.
- **Anclas:** `scroll-margin-top: 84px` en todo elemento con `id` dentro de `<main>`, para que el header
  sticky (76px + 8px de aire) no las tape.
- El header no cambia de color en el home. Las variables de header transparente del diseño (`hdrBg`, `hdrFg`, …)
  nunca se usan en la plantilla, así que no se portan.

### 3.6 Footer (`src/components/Footer.astro`)

Reproduce el footer del diseño (L498–508):

- `max-width: 1200px`, centrado, padding `clamp(39.4px,4.9vw,65.6px) var(--edge) 32px`, flex en columna con gap de 40px.
- **Fila principal:** flex con wrap y gap `32px 48px`.
  - **Marca** (`flex: 2 1 260px`): isotipo de 28px (`Mark.astro`, fondo `--ink`, núcleo `--blue`) y el texto
    «NoctiLabs» (500, 23px, `letter-spacing: -.045em`, `translate="no"`). Debajo, el lema «El cerebro operativo de
    tu empresa.» en 16px, `--muted`, con `max-width: 30ch`.
  - **Columnas** (`flex: 1 1 170px`, gap de 10px): Producto (5 anclas), Industrias (5) y Compañía (Nosotros,
    Insights, Hablemos). Kicker en mono 12px, `letter-spacing: .04em`, mayúsculas, `--muted`, con
    `padding-bottom: 4px`. Links de 15px en tinta, con hover `--blue-link`.
- **Fila inferior:** flex con wrap, `justify-content: space-between`, gap de 8px, mono 12px, `--muted`,
  `border-top: 1px solid var(--line)` y `padding-top: 18px`. Lleva «© {año del build} NoctiLabs», el selector de idioma y «noctilabs.io».
- **`Mark.astro`:** genera en el build el SVG `viewBox="0 0 48 48"` con la fórmula de `mark()` (L539–544):
  anillos `[r, n, d] = [8,7,2.6], [13.2,13,1.85], [18.4,19,1.1]`, ángulo `i/n·2π + k·.3` y núcleo `r = 3.8`.
  Es decorativo (`aria-hidden="true"`) y no se dibuja en el cliente.

### 3.7 Páginas vacías y 404

Cada ruta de 3.2 usa `Base` + `Header` + `<main id="contenido" tabindex="-1">` + `Footer`. Adentro lleva una sección con:

- el H1 de la tabla de abajo;
- un párrafo «Contenido en construcción» / «Content in progress», marcado con `data-placeholder`, para encontrarlo después.

En `/producto/` y `/en/product/` hay además cinco secciones vacías con `id` `overview`, `cerebro`, `bi`, `agentes`
y `control`. Cada una lleva `tabindex="-1"`, un H2 con el label del ítem y `data-placeholder`, y son los destinos de las anclas
del header y el footer. Los ids son iguales en los dos idiomas.

| Página | H1 es | H1 en |
|---|---|---|
| home | El cerebro operativo de tu empresa. | Your company's operational brain. |
| producto | El cerebro organizacional de tu empresa. | Your company's organizational brain. |
| retail | Cada cliente, pedido y proveedor en un mismo contexto. | Every customer, order and supplier in one context. |
| manufactura | Manufactura | Manufacturing |
| consumo | Alimentos y bienes de consumo | Food and consumer goods |
| salud | Salud y actividad física | Health and fitness |
| servicios | Servicios profesionales y empresariales | Professional and business services |
| nosotros | Construimos el cerebro operativo de las empresas. | We build the operational brain of companies. |
| insights | Contexto, IA operativa y agentes. | Context, operational AI and agents. |
| hablemos | Hablemos. | Let's talk. |

**Enmienda 2026-10-03 (pedido del dueño): hero provisorio del home.** En lugar del placeholder liso,
el home lleva `HomeHero.astro`:

- **Video:** `public/media/hero-av1.mp4` (AV1 10 bits, 2,9 MB) con respaldo `hero-h264.mp4` (H.264, 4,9 MB), ambos 1080p, con poster `hero-poster.webp`, a sangre y con alto
  `max(680px, 100vh)`. Atributos `autoplay muted loop playsinline` y `aria-hidden`. Con
  `prefers-reduced-motion: reduce` se pausa.
- **Velo encima:** `linear-gradient(#00000026 0%, #0000001a 13.1179% 60%, #0000004d 100%)`.
- **Texto:** el H1, el lead y los dos CTA del diseño (L73–88), como links.
- **Peso:** 1080p optimizado (AV1 ≈ 2,9 MB; H.264 ≈ 4,9 MB; antes ≈ 7,5–10 MB); `preload="metadata"`.
- **Alcance:** la composición final del hero se especifica en la fase 2.

Retail usa la frase del diseño (L304). Las otras cuatro industrias usan su label como placeholder hasta la fase 2.

**La 404 es una excepción al `<head>` de 3.3.** `src/pages/404.astro` genera `/404.html`:

- `<html lang="es">`, title «Página no encontrada · Page not found — NoctiLabs» y `<meta name="robots" content="noindex">`.
- Sin canonical, sin hreflang y sin selector de idioma.
- Un bloque en español y otro en inglés (`lang="en"`), cada uno con un link al home de su idioma.
- Lleva el header y el footer en español.

### 3.8 Estructura del repo

```
noctilabs-web/
  astro.config.mjs · vercel.json · vitest.config.ts
  package.json · tsconfig.json · .gitignore · .nvmrc (22) · README.md
  docs/specs/001-fundacion.md
  public/favicon.svg
  tests/routes.test.ts · tests/routes.types.ts
  src/
    i18n/routes.ts · i18n/ui.ts
    styles/tokens.css · styles/global.css
    layouts/Base.astro
    components/Header.astro · Footer.astro · Mark.astro · LangSwitch.astro · PagePlaceholder.astro
    scripts/header.ts
    pages/index.astro · producto.astro · industrias/[slug].astro · nosotros.astro
          insights.astro · hablemos.astro · 404.astro
    pages/en/index.astro · product.astro · industries/[slug].astro · about.astro
          insights.astro · contact.astro
```

Las páginas son finas: solo pasan `locale` y un `PageRef` a componentes compartidos. Las industrias
reciben `industry` por `props` de `getStaticPaths`. La lógica no se duplica entre idiomas.

## 4. Fuera de alcance

- El contenido de las secciones (fase 2).
- La textura animada y `Nocti App v2` (fase 3). React no se instala en esta fase.
- El formulario, Sanity, analítica, sitemap, Open Graph y legales (fase 4).
- Fotos, retratos y la compra de la fuente (fase 5).
- Tocar `nocti-web-lastest` o el dominio.

## 5. Pruebas (TDD)

Se sigue la skill `mattpocock/skills/tdd`:

- **Rebanadas verticales:** un test en rojo, el código mínimo para ponerlo en verde, y la siguiente.
- **Solo comportamiento observable**, por la interfaz pública.
- **Valores esperados literales:** se copian de las tablas de este spec, nunca se recalculan con el código que se prueba.
- **Sin mocks de módulos propios.**
- **El refactor va en la etapa de revisión**, no dentro del ciclo.

**Costura confirmada por el dueño:** una sola, S1.

| Costura | Interfaz pública | Qué se prueba | Herramienta |
|---|---|---|---|
| **S1. Mapa de rutas** | `href`, `alternates` y `pageFromPath` de `src/i18n/routes.ts` | (a) Las 20 URLs del contrato de 3.2, escritas como literales en el test, salen de `href` para cada `PageRef` y locale. (b) Fragmento: `href({id:'producto'},'es','overview')` y `…,'#overview')` dan `/producto/#overview`; `href({id:'producto'},'en','#bi')` da `/en/product/#bi`; con `''` da `/producto/`; en inglés, `'overview'` y `'#overview'` dan `/en/product/#overview` y `''` da `/en/product/`; `href({id:'nosotros'},'es','equipo')` da `/nosotros/#equipo`. (c) `alternates` para los 10 `PageRef`, con sus URLs absolutas literales y x-default = es. (d) `pageFromPath` devuelve el `{page, locale}` literal para las 20 URLs y para sus 19 variantes sin barra final (todas menos `/`; `/en` incluida); devuelve `null` en `/nada/`, `/en/nada/`, `/en/producto/`, `/industrias/inexistente/`, `/404.html`, `/es/`, `/es/producto/`, `/producto/extra/`, `/en/industries/manufactura/`, `/producto//` y `/en/product//`. (e) En `tests/routes.types.ts`, un archivo que Vitest no descubre (solo corre `*.test.ts`) pero que está incluido en el `tsconfig`, una línea con `// @ts-expect-error` pasa un `IndustryId` inexistente a `href`, dentro de una función que nunca se invoca. Lo verifica `astro check` en A1. | Vitest |

No hay tests automáticos en otras costuras: el dueño no las confirmó. El HTML compilado, el
comportamiento del header y Vercel se verifican a mano con los checklists de §6, y la evidencia queda en el PR.

## 6. Criterios de aceptación

| # | Criterio | Cómo se verifica |
|---|---|---|
| A1 | `npm run build` (= `astro check && astro build`) termina sin errores ni warnings de tipos. | Salida del comando. |
| A2 | `npm test` en verde, con S1 completa. | Salida del comando. |
| A3 | Existen las 20 rutas de 3.2 y `/404.html` en `dist/`. | Listado de `dist/` adjunto al PR. |
| A4 | En las 20 páginas: `lang` correcto, canonical absoluto, tres `hreflang` y el selector de idioma apunta a la equivalente. La 404 tiene title bilingüe, `noindex`, el bloque en inglés y ni canonical, ni hreflang, ni selector. | Matriz de 20 filas + 1 adjunta al PR, con los valores extraídos del HTML de `dist/` y contrastados contra el contrato de 3.2, las tablas de 3.7 y la tabla de title y descripción del PR. Por página: `lang`, canonical, alternates, selector, title, descripción y H1. Para `/producto/` y `/en/product/`, los 5 destinos con su `id`, H2, `tabindex` y `data-placeholder`. Además, en una página por idioma: viewport, favicon, theme-color y preload de la fuente. |
| A5 | Cero links internos rotos, anclas incluidas. | Recorrido manual desde home y desde Producto, en los dos idiomas, por header, megamenús, menú mobile y footer. Para las 5 anclas se registran la URL final, que el destino exista, que quede visible debajo del header y, en mobile, que tenga el foco. Recorrido con JS desactivado: los labels Producto e Industrias navegan y los paneles no aparecen. Ctrl+click en un ancla del menú mobile abre otra pestaña sin cerrar el panel. |
| A6 | Header y footer son fieles al diseño. | Capturas lado a lado contra el `.dc.html` servido localmente. Condiciones: mismo navegador; textura del diseño en «Ninguna»; fuentes cargadas antes de capturar (`document.fonts.ready`); el mismo fondo `--bg` liso detrás del header y los megamenús; 1440×900 y 390×844. Se captura: header cerrado, megamenú Producto, megamenú Industrias, menú mobile abierto y footer. Las diferencias autorizadas son las de este spec (links, selector de idioma, botón chevron, skip link) y el contenido placeholder debajo del header; cualquier otra se corrige o se justifica en el PR. |
| A7 | El header cumple los contratos de estado de 3.5. | Checklist manual en el navegador, registrado en el PR: los 8 pasos del megamenú (incluido cruzar el puente de 8px y cancelar el cierre retardado), los 7 del menú mobile, el corte a 999px y a 1000px en las dos direcciones con el foco en un botón y en un link, las secuencias combinadas hover + foco (foco en Producto y puntero sobre Industrias; hover y después click en el mismo chevron; Enter en un panel abierto por hover; abrir → cerrar con el botón → Tab; hover → click para fijar → salir y volver con el puntero → click para cerrar; Esc con el foco fuera del header y el panel abierto por hover; Esc con el foco dentro del panel; cruzar a mobile con el foco en un link del nav, en el CTA, en un chevron y en un link del megamenú; hover en Producto → salir → entrar a Industrias antes de 120 ms; cerrar y reabrir antes de que venza el cierre retardado), el foco final de cada secuencia, y el skip link moviendo el foco a `<main>`. |
| A8 | Cero errores en consola en las 20 rutas. | `read_console_messages` sobre `astro preview` (local). |
| A9 | La revisión con web-design-guidelines no deja hallazgos sin resolver. Excepciones documentadas: (1) Title Case: no aplica al español; en inglés se mantiene la mayúscula inicial del diseño. (2) «Detect language»: ver 3.2. (3) Por fidelidad al diseño, el logo no tiene hover visual (su estado de foco sí se ve). (4) El hover de los ítems del megamenú baja la opacidad a .65 en lugar de subir el contraste. | Salida de la revisión en el PR. |
| A10 | El JS de cada página pesa menos de 3072 bytes. Se suma cada módulo externo alcanzable desde la página, contado una vez por URL y comprimido por separado con `gzip -9 -n`. Cuenta lo que referencia el HTML más todo lo alcanzable por imports estáticos o dinámicos, incluidos los que salen de scripts inline. A eso se suma cada `<script>` inline, también comprimido por separado. | Inventario por página y sumas adjuntos al PR. |
| A11 | **Diferido al lanzamiento (enmienda 2026-10-03).** Preview de Vercel accesible. Contrato HTTP: `/producto` → 308 con `Location: /producto/`, `/en/product` → 308 con `Location: /en/product/`, y los dos destinos responden 200. `/nada/` y `/en/nada/` responden 404 con el cuerpo de la 404 bilingüe. | URL del preview, `curl -I` de las redirecciones, `curl -I` de `/producto/` y `/en/product/` (200) y `curl -i` (GET) de las dos 404 con el cuerpo, adjuntos al PR. |
| A12 | gpt-6.1-sol aprueba el spec antes de empezar, y aprueba la implementación con la evidencia de A1–A10 sobre un mismo commit. | Veredicto con el hash del commit. |

## 7. Decisiones abiertas (con default)

- **D1. Tipografía sans.** El diseño pide Neue Haas Unica Pro, que es comercial y no está cargada. Hoy cae a
  Helvetica Neue en Mac y a Arial en Windows. *Default de esta fase:* mantener la pila tal cual en
  `--font-sans`, de modo que se cambia en un solo lugar. Hay que decidirlo antes de la fase 2:
  licencia web, o una alternativa libre (Inter o Geist Sans).
- **D2. Destino del ítem «Industrias».** En el diseño, el click lleva a Retail. *Default:* igual que el diseño.
  Alternativa: una página índice `/industrias/` (no está diseñada).
- **D3. Selector de idioma en la cápsula desktop.** *Default:* no va; queda en el footer y en el menú mobile.
- **D4. Copy en inglés.** Lo traduzco yo y queda pendiente de revisión del dueño antes del lanzamiento.
- **D5. Repo de GitHub.** **Decidido:** `noctilabs/noctilabs-web`, privado. El proyecto de Vercel lo conecta el dueño.

## 8. Plan de implementación

1. **Scaffold:** Astro, config de i18n, `vercel.json`, tokens, global y Vitest. Se verifica con A1. Es un paso operativo, no una rebanada TDD.
2. **S1, una rebanada por ciclo:** home → producto → industria con slug → resto de páginas → fragmento →
   `alternates` → `pageFromPath` → chequeo de tipos. Se verifica con A2.
3. **Páginas vacías, Base y 404.** Se verifica con A3 y la parte de `dist/` de A4.
4. **GitHub (privado):** push hecho. **Enmienda 2026-10-03:** el dueño decidió no conectar Vercel hasta terminar la web. Las verificaciones que pedían el preview se hacen sobre `astro preview` local, y A11 pasa al lanzamiento (fase 6).
5. **Header, Footer, Mark y LangSwitch.** Se verifica con A5–A8 sobre `astro preview`.
6. **Revisión con web-design-guidelines y refactor**, con S1 en verde antes y después. Se verifica con A9 y A10.
7. **Evidencia final sobre un mismo commit:** A1–A10. Después, el gate de gpt-6.1-sol sobre ese commit. Se verifica con A12.
