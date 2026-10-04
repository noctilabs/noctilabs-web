# Evidencia del spec 002 — páginas (fase 2)

**Commit verificado: `58eb398`** (`main`, «fix: imports de Brand tras unificar el componente»). Todo lo de esta carpeta
se generó sobre ese commit el **2026-10-04** (12:00–13:00 UTC). Ningún archivo de `src/` se modificó; los defectos se
documentan abajo y no se arreglaron.

## Condiciones

- **Build:** `npm run build` (`astro check && astro build`) en el checkout de `main`, con el código de salida como
  condición. Inicio del build de B1: 2026-10-04T12:01:05Z. Tras las pruebas de B7 se volvió a correr el build normal
  (12:50:56Z, salida 0) y se repitió B2 sobre ese `dist/`: idéntico.
- **Servidor:** `astro preview` del repo en `http://localhost:4932`, que sirve `dist/`.
- **Navegador:** Chrome 154.0.8037.97 headless por CDP (puerto 9360), con emulación de foco.
- **Referencia:** `NoctiLabs Web v3.dc.html` servido aparte en `http://localhost:4933`, con la textura en «Ninguna»
  (valor por defecto del archivo) y fondo liso. Sus fuentes caen al respaldo del sistema (Arial); el video del hero
  del diseño da 404 en ese servidor, así que el hero de referencia se ve sin video.
- **Sanity real:** proyecto `q164hlpj`, dataset `production`, API `v2025-02-19`, la misma GROQ del loader,
  consultada el **2026-10-04T12:01:41Z** (HTTP 200, 8 documentos `post`). Se publica uno solo:
  **`_id` = `post-no-context-no-intelligence`, `publishedAt` = `2026-09-28`**, sin `slugEs`, `topic` ni `readingTime`
  (los dos slugs son `no-context-no-intelligence`; la categoría sale de `category.en` = «Thesis»; los minutos se
  calculan: 220 palabras en ES → 1 min, 320 en EN → 2 min). Resumen y respuesta cruda: `b2-sanity-consulta.txt`,
  `b2-sanity-respuesta.json`.
- **Scripts:** los escenarios CDP están en la carpeta de scripts de la sesión
  (`…/scratchpad/ev002/`, con `home/`, `producto/`, `resto/` reutilizados de los tres agentes de la fase 2 y
  apuntados a `localhost:4932`). No se copian al repo: `astro check` incluye `**/*` y los `.mjs` de escenarios le suman
  warnings (se probó y se sacaron). En el repo queda solo el comparador de B2, que pasa `astro check` sin avisos.

## Resultado por criterio

| # | Resultado | Detalle | Archivo |
|---|---|---|---|
| B1 | **OK** | `astro check`: 80 archivos, 0 errores, 0 warnings, 0 hints. `astro build`: 23 páginas (22 rutas + 404), salida 0. La única línea extra es la prevista por §3.4: `[insights] excluido: post-introducing-noctilabs … el cuerpo en es está vacío`. Vitest: 80/80. | `b1-build.txt`, `b1-tests.txt` |
| B2 | **OK** | **207/207** contra `b2-esperados.json`, escrito a mano desde el spec, `ui.ts`, `industries.ts` y el post de Sanity. Cubre por ruta `lang`, canonical con `https://noctilabs.io`, hreflang ES/EN/x-default, title, descripción, H1 (texto, único) y destino del selector de idioma; además, que `dist/` tenga exactamente las 22 rutas esperadas. 404: `lang`, title, `noindex`, H1, sin canonical, sin hreflang, sin selector. Control negativo: dos valores alterados a mano dan 205/207 y salida 1. | `b2-esperados.json`, `b2-comparar.mjs`, `b2-comparacion.txt` |
| B3 | **FALLA** | Hay dos diferencias **no autorizadas** (D1: banda del home angosta en desktop; D3: formato de fecha) y tres que no figuran en §7 aunque las prescribe o las implica otra parte del spec. Matriz abajo. Estructural EN↔ES e industrias↔Retail: 30/30 (mismas secciones y conteos, sin desbordes, a 1440 y 390). | `capturas/b3/`, `b3-estructura.txt` |
| B4 | **OK** | 68/68 (34 por idioma): alternancia de ≈3600 ms solo en pantalla y con la pestaña visible; se detiene al salir; la primera elección la detiene para siempre; `aria-pressed`, H2 y pies sincronizados; región viva solo con cambios manuales; reduced motion inicial y en vivo (incluido elegir «sin» → `reduce` conserva «sin»); descripciones por estado en el árbol AX; sin JS, «con» y sin control. | `b4.txt` |
| B5 | **OK** | 60/60 (30 por idioma): roles, nombres, `aria-controls`/`labelledby`, `aria-selected`/`tabindex`; flechas con vuelta y Home/End que solo mueven el foco; Enter, Espacio y click activan; Tab al panel; inactivos fuera del árbol y del orden de Tab; «Conocer más» a su industria; lazy → eager a 600 px; red lenta (1,5 s de latencia, 30 kB/s): fondo del visor sin imagen rota; carga bloqueada: respaldo `role=img`; sin JS, panel inicial y sin control. | `b5.txt`, `capturas/b5-b6/` |
| B6 | **OK** | 26/26: ejemplo visible en reposo, hover y táctil; contraste mínimo 5,35:1 (Capacidades) y 4,85:1 (Pasos); hover oscuro con `translateY(-4px)`; la 04 vuelve a clara; con reduced motion, sin desplazamiento ni transición. | `b6.txt`, `capturas/b5-b6/` |
| B7 | **OK** | Sin filtros ni grilla; destacado al artículo; el índice navega a las dos anclas (top 84 px, foco en el H2); selector al artículo equivalente; Insights activo sin `aria-current`; fecha y minutos iguales en destacado y cabecera (ES 1 min, EN 2 min). Builds con `INSIGHTS_FIXTURE`, con el aviso y las rutas de cada caso: cuerpo ES nulo y spans vacíos excluidos; 2026-02-30 excluido; slug ES repetido y slug EN repetido excluyen a los dos posts; minutos por idioma iguales a los calculados aparte desde el fixture (660 palabras → 3 min ES; 320 → 2 min EN; `readingTime` 7 manda); publicar (f5, 27 páginas) → retirar (f6) con la caché conservada: 23 páginas, sin rutas ni ids `fx-*` en el data store ni en el HTML; cero publicados: estado vacío y 21 páginas; Sanity inaccesible, HTTP 500 y JSON inválido: el build falla (salida 1). Al final, build normal de nuevo. | `b7.txt`, `capturas/b7/` |
| B8 | **OK** | 22/22: sin JS, `fieldset` deshabilitado, `<noscript>`, ni click ni Enter envían (0 pedidos, URL igual). Con JS: labels, `name`, tipo, `autocomplete` y requeridos según §4.6; email sin spellcheck; select con opción vacía + 5 + Otra; 4 errores en línea con foco al primero (solo espacios cuenta como vacío); editar limpia solo ese error; email inválido; «Enviando…» sincrónico, botón deshabilitado y doble submit ignorado; estado error con el mail, valores conservados y región `aria-live=polite`; `beforeunload` con cambios y sin aviso vacío. Borde #767676: 4,54:1 sobre blanco y 4,12:1 sobre #F4F4F2. | `b8.txt`, `capturas/b8/` |
| B9 | **OK** | 23 HTML (22 rutas + 404): 1177 hrefs internos, 374 con ancla, 0 rotos. Se incluyen los `#ancla` relativos. | `b9-b11.txt` |
| B10 | **OK** | 0 errores de consola en las 22 rutas, `/404.html` y una URL inexistente, a 1440 y 390, con scroll completo y las imágenes cargadas. En la URL inexistente, el 404 de la propia navegación no se cuenta. | `b10.txt` |
| B11 | **OK** | Máximo 3141 bytes gzip (home ES y EN); Hablemos 2449; el resto 1594 (solo el header). Umbral 8192. | `b9-b11.txt` |
| B12 | **OK, con observaciones** | 1440×900, DPR 1, caché deshabilitada; 10 activaciones del visor y 10 páginas de industria: AVIF/WebP + JPG, `width`/`height`, visor lazy → eager, industria eager + async; render 1022,7 px (`sizes` = 1022,5) y 1108,2 px (`sizes` = 1109); `currentSrc` de 35 a 148 KB. Lista de `alt` revisada a mano: describen la foto y coinciden entre ES y EN. Observaciones en «Defectos». | `b12.txt` |
| B13 | **FALLA** | Hay hallazgos abiertos fuera de las excepciones permitidas: D2, D4–D8 y D9 (abajo). | este README, `b13-translate.txt`, `b13-largo.txt`, `b13-guidelines-command.txt` |
| B14 | **OK** | `a7.mjs` completo: **78/78**. | `b14-a7.txt` |
| B15 | **FALLA** | **Teclado:** orden de documento, sin `tabindex` > 0 y sin trampas en las 23 páginas × 2 anchos, y Shift+Tab recorre lo mismo al revés; pero al volver con Shift+Tab el foco queda **tapado del todo** por la cápsula del header en 4 páginas a 1440 y parcialmente en otras (D2). Los campos del formulario no tienen anillo (D8). **Reflow 320:** 25/25 OK (sin scroll horizontal, recortes ni superposiciones, con control negativo del chequeo). **Zoom:** el cuerpo da 16 × zoom px en todos los pasos; al 400 % los display dan ×2,08 a ×2,94; layout sin desbordes, recortes ni superposiciones en 23 páginas × 6 pasos; controles operables. 6 fallas, todas de foco parcialmente tapado al avanzar con Tab (D2). **Árbol AX** de header, hero, antes/después, AppSlot, tabs, menú mobile, Insights, artículo, formulario y Producto en ES y EN. No hubo lector de pantalla: queda como límite. | `b15-teclado.txt`, `b15-tapado.txt`, `b15-reflow.txt`, `b15-zoom.txt`, `b15-ax.txt`, `capturas/b15/` |

## B3 — matriz de fidelidad

Capturas en `capturas/b3/` con el nombre `<sección>-<ancho>-ref|nuevo|nuevo-en.webp`. Las secciones de Home, Producto e
Industria se capturan por sección y estado; las de Nosotros, Insights, Artículo y Hablemos, como página completa. Las otras
cuatro industrias y Producto/Industria en EN están como `pagina-<x>-<ancho>-nuevo.webp`, y se comparan estructuralmente en
`b3-estructura.txt`.

Diferencias comunes a todas las filas: §7.7 (Inter) y la textura ausente (temporal, fase 3).

| Página · sección (Inv) | 1440×900 | 390×844 | Diferencias observadas → ítem de §7 |
|---|---|---|---|
| Home · hero (§1.1) | `home-hero-1440-*` | `home-hero-390-*` | Botón de pausa (§7.8, fase 1). |
| Home · antes/después «sin» (§1.2) | `home-ba-sin-1440-*` | `home-ba-sin-390-*` | Sin «Comparar · Opción 1/2» (§7.1). Chip apagado con texto #6B6B68 (§7.2). A 390, el H2 tiene dos líneas (§7.6) y además es **más grande**: 32 px contra ≈21 px, porque no se portó `min(var(--h2), 5.4vw)`. El cambio de tamaño no figura en §7: lo implica 7.6. A 390, el texto de los nodos baja a ≈11 px (13 px en el diseño) por el `3.4cqw` de §4.1.2. Está prescrito en el spec, pero **no figura en §7**. |
| Home · antes/después «con» (§1.2) | `home-ba-con-1440-*` | `home-ba-con-390-*` | Las mismas. |
| Home · Toda la empresa puede preguntar (§1.3) | `home-roles-1440-*` | `home-roles-390-*` | AppSlot placeholder, sin tabs de rol (temporal, fase 3). |
| Home · Capacidades, reposo y hover (§1.4) | `home-caps[-hover]-1440-*` | `home-caps[-hover]-390-*` | Ejemplo siempre visible; el título sube en la tarjeta (§7.3). |
| Home · Pasos, reposo y hover (§1.5) | `home-steps[-hover]-1440-*` | `home-steps[-hover]-390-*` | Igual que Capacidades (§7.3). |
| Home · Industrias ×5 (§1.6) | `home-ind-0…4-1440-*` | `home-ind-0…4-390-*` | Fotos de Retail, Consumo y Servicios (§7.6d). «Conocer más» va a la industria del panel (§7.4, no visible en la captura). |
| Home · banda «Hablemos.» (§8) | `home-band-1440-*` | `home-band-390-*` | **1440: NO AUTORIZADA (D1).** La banda mide 974 px contra 1200 px del diseño y del resto de las páginas. 390: sin diferencias. |
| Producto · hero (§2.1) | `producto-00-1440-*` | `producto-00-390-*` | — |
| Producto · demo general, Cerebro, BI, Agentes (§2.2, §2.4) | `producto-01/03/04/05-*` | ídem | AppSlot placeholder y sin captions (temporal, fase 3). |
| Producto · Overview (§2.3) | `producto-02-overview-1440-*` | `producto-02-overview-390-*` | A 390, un solo conector centrado (§7.5). |
| Producto · Control (§2.5) | `producto-06-control-1440-*` | `producto-06-control-390-*` | A 390, capas en una columna (§7.5); placeholder (temporal). |
| Producto · banda (§8) | `producto-07-*` | ídem | — |
| Industria Retail · hero, procesos, preguntas, agentes, por qué y otras, banda (§3.1, §3.3–3.6, §8) | `industria-retail-00,02…06-1440-*` | ídem 390 | — |
| Industria Retail · foto (§3.2) | `industria-retail-01-1440-*` | `industria-retail-01-390-*` | Foto de depósito (§7.6d). |
| Nosotros (§4) | `nosotros-1440-*` | `nosotros-390-*` | Sin Equipo (temporal, fase 5). |
| Insights (§5) | `insights-1440-*` | `insights-390-*` | Sin filtros ni grilla (temporal, fase 5). Destacado con el post de Sanity (§7.6e). **Fecha «28 set. 2026» contra «18 sep 2026»: NO AUTORIZADA (D3).** La meta «… · 1 min de lectura» sale de la plantilla de §4.5 y es más larga que «8 min». A 390, eso hace que «Leer →» baje a otra línea, cuando en el diseño queda en la misma. No figura en §7: lo implican §4.5 y §7.6e. |
| Artículo (§6) | `articulo-1440-*` | `articulo-390-*` | Contenido, metadatos e índice del post (§7.6e). Sin «Seguir leyendo» (temporal). Fecha «28 SET. 2026» (D3). Observación: los H2 del post ocupan dos líneas y heredan un interlineado de 1,65, porque `.prose-article h2` no fija `line-height`. El diseño solo tiene H2 de una línea, así que no hay contra qué comparar. |
| Hablemos, formulario en idle (§7) | `hablemos-1440-*` | `hablemos-390-*` | Borde #767676 (§7.6b). Placeholders y opción vacía «Elegí una…» (§7.6c). Selector de idioma en el footer (§7.8). |
| Header y footer (fase 1) | en todas las capturas de página | ídem | Chevrons y selector de idioma (§7.8). |

## Defectos y hallazgos

Cada uno con archivo:línea y cómo reproducirlo. Ninguno se arregló.

- **D1 · banda «Hablemos.» del home angosta en desktop (B3, no autorizada).**
  - **Dónde:**
    - `src/components/HablemosBand.astro:19` define `.band-wrap { max-width: 1200px; margin: … auto 0; … }`, sin `width`.
    - En el home, la banda es hija de `.home { display: flex; flex-direction: column }` (`src/components/sections/home/Home.astro:42`). Los márgenes `auto` de un ítem flex en columna lo encogen a su contenido.
  - **Cómo se reproduce:** a 1440×900, `/` da `.band-wrap` en 233..1207 px (974 px). `/producto/` y `/nosotros/` dan 120..1320 px (1200 px), igual que el diseño en el home. Captura: `capturas/b3/home-band-1440-*`.
- **D2 · el header tapa el foco del teclado (B15, B13: «Sticky headers… must not cover the focused element»; WCAG 2.4.11).**
  - **Causa:** el header es sticky (`src/components/Header.astro:138`), y el único margen de scroll es `main [id] { scroll-margin-top: 84px }` (`src/styles/global.css:30`). No hay `scroll-padding-top`. Al enfocar un elemento sin `id` que queda arriba, el navegador lo deja debajo de la cápsula.
  - **Cómo se reproduce:**
    1. Abrir `/industrias/manufactura/` a 1440×900.
    2. Tab hasta el final de la página.
    3. Shift+Tab hasta «Retail y distribución →».
    4. El foco queda en top 6 px, debajo de la cápsula (10..66 px). «Alimentos y bienes de consumo →» y «Salud y actividad física →» quedan 100 % tapados. Captura: `capturas/b15/b15-foco-tapado-1440-manufactura.webp`.
  - **Tapado total (Shift+Tab, 1440):**
    - `/industrias/manufactura/`;
    - `/industrias/retail-distribucion/`;
    - `/industrias/salud-fitness/`;
    - `/en/industries/manufacturing/`.
  - **Tapado parcial:**
    - otras industrias y el destacado de Insights, a 1440 y 390;
    - el CTA del hero del home;
    - «← Insights» del artículo, a 390;
    - avanzando con Tab al 175 %, 200 % y 400 % de zoom: destacado de Insights y CTA ancho de Capacidades.

  Detalle en `b15-teclado.txt` y `b15-zoom.txt`.
- **D3 · formato de fecha distinto del diseño (B3, no autorizada).** `src/lib/insights.ts:172` usa
  `Intl.DateTimeFormat('es-UY', { dateStyle: 'medium' })` y produce «28 set. 2026» (y «28 SET. 2026» en la cabecera), cuando el
  diseño muestra «18 sep 2026». EN: «Sep 28, 2026». §3.4 dice «formateado en UTC, como antes» sin fijar el formato,
  y §7 no lo autoriza.
- **D4 · botones sin estado hover (B13: «Buttons/links need hover: state»).** Los botones Sin/Con
  (`src/components/sections/home/BeforeAfter.astro:102-116`), las tabs de industria
  (`src/components/sections/home/Industries.astro:94-110`) y «Enviar otro mensaje» (`.again`,
  `src/components/sections/hablemos/Hablemos.astro:196-206`, inalcanzable en la fase 2) no tienen `:hover`.
- **D5 · `translate="no"` faltante en la marca (B13, i18n; spec §4.7).**
  - **Dónde:**
    - las descripciones textuales de los diagramas, en `BeforeAfter.astro:60` (`{d.desc[s]}` sin `Brand`): 3 por idioma;
    - el kicker «Por qué construimos Nocti» / «Why we build Nocti», en `src/components/sections/nosotros/Nosotros.astro:31` (`{b.kicker}`);
    - el cuerpo del artículo que llega de Sanity (`src/lib/insights.ts`, render del Portable Text), con «NoctiLabs» en 3 párrafos ES y 4 EN.
  - **Cómo se reproduce:** `b13-translate.txt`, que recorre todos los nodos de texto de las 23 páginas.
- **D6 · títulos del CMS sin manejo de palabras largas (B13, «Content handling»).** `.f-title`
  (`src/components/sections/insights/Insights.astro:121`), `.title` (`ArticleCard.astro:39`, `Articulo.astro:93`) y
  `.toc a` (`Articulo.astro:117`) no tienen `overflow-wrap`.
  - **Cómo se reproduce:** a 320 px, con un título de una sola palabra de 43 letras inyectado por CDP:
    - el artículo pasa a `scrollWidth` 669 px (scroll horizontal);
    - en el destacado de Insights, el título queda recortado (467 px de contenido en 210 px).

  `b13-largo.txt`. Con el contenido actual no ocurre.
- **D7 · foto de industria sin prioridad de carga (B13, «Above-fold critical images: fetchpriority=high»).**
  `src/components/sections/industria/IndustryPhoto.astro:15-25` usa `loading="eager"` y `decoding="async"` como pide §3.5, pero la foto entra
  en el primer viewport (top ≈ 570 px a 1440×900) y no lleva `fetchpriority="high"`.
- **D8 · foco de los campos del formulario (B13 y B15).** `Hablemos.astro:159` pone `outline: none`, y `:163` marca el foco con
  `:focus` (no `:focus-visible`), con borde azul de 1 px y fondo blanco. El foco se ve (WCAG 2.4.7), pero no hay anillo como
  en el resto del sitio ni como piden las guidelines. `b15-teclado.txt` lo marca como «sin foco visible» con el
  chequeo estricto (outline o sombra).
- **D9 · exclusiones silenciosas (spec §3.4).** `src/lib/insights.ts:120` excluye sin aviso los posts no marcados para Insights
  («fuera sin aviso»). §3.4 dice «Los que no cumplen quedan fuera… El build imprime cuáles y por qué». Con los datos
  actuales, 6 de los 7 posts excluidos no aparecen en el log del build.
- **Observaciones de B12 (no fallan el criterio):**
  - el JPG de respaldo de 1920w de Servicios (`servicios.D2oHaJz5_Z1m0Yzd.jpg`, `src` del `<img>`) pesa **319 KB**. Supera 300 KB, aunque no es el `currentSrc` en Chrome;
  - `retail.png` y `salud.png` miden 1024 px y se muestran a 1108 px en las páginas de industria, así que se ven ampliadas.

## B13 — revisión con web-design-guidelines

Las reglas se bajaron de `vercel-labs/web-interface-guidelines/command.md` el 2026-10-04T12:46Z (copia en
`b13-guidelines-command.txt`). Se revisaron:

- `src/components/sections/**` (20 archivos);
- `src/scripts/before-after.ts`, `tabs.ts` y `contact-form.ts`;
- `src/styles/article.css`.

Hallazgos abiertos: D2, D4, D5, D6, D7 y D8 (arriba).

**Excepciones permitidas, que no cuentan como hallazgo:**

- las de la fase 1;
- la URL efímera de las tabs de industria y del selector Sin/Con;
- la transición de colores en hover. Se verificó que ninguna transición use `all`: las propiedades son `transform`, `opacity`, `visibility` y colores.

**Sin hallazgos en:**

- **Accesibilidad:**
  - botones nativos con nombre;
  - `aria-hidden` en lienzos, viñetas e íconos;
  - jerarquía de headings en cada página;
  - región viva `polite` para el estado del antes/después y del formulario;
  - errores en línea con `aria-describedby` y foco al primero;
  - labels con `for`.
- **Formulario:**
  - `autocomplete`, `name` y tipos;
  - `spellcheck=false` en el email;
  - placeholders con «…»;
  - «Enviando…»;
  - `beforeunload`;
  - el pegado no se bloquea.
- **Movimiento:**
  - `prefers-reduced-motion` en el antes/después y en las tarjetas;
  - la alternancia automática se detiene con el control.
- **Imágenes y fechas:**
  - `width`/`height` en todas;
  - lazy en el visor;
  - `Intl.DateTimeFormat`.
- **Tipografía:** `text-wrap: balance` en h1 y h2.
- **Selects:** `background-color` y `color` explícitos.
- **Destructivas:** ninguna acción destructiva.

**Contenido del CMS (fuera del alcance del código):** el inglés del post usa comillas rectas («That's», «isn't»). Queda para la revisión de copy de la fase 5.

## Límites conocidos

- Toda la interacción se verificó en Chrome headless. No hubo Safari ni un lector de pantalla: B15 se apoya en el
  árbol de accesibilidad de CDP.
- «Pestaña oculta» en B4 se simula redefiniendo `document.hidden` y disparando `visibilitychange`.
- La captura de «Enviando…» (B8) se toma con `requestAnimationFrame` congelado para fijar el estado. El orden real se verifica igual: estado sincrónico y doble submit ignorado.
- El zoom se emula con `deviceScaleFactor` = zoom sobre 1280×800, con un layout de 1280/zoom px, como pide el spec.
- En `capturas/b15/zoom-200-home.webp` el skip link aparece visible, porque el foco quedó en él al terminar el
  recorrido con Tab.
