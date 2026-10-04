# Evidencia del spec 002 — páginas (fase 2)

**Commit verificado: `7813449`** (`main`, «fix: defectos de la evidencia de la fase 2 (D1–D9)»). Es la segunda pasada.
La primera se hizo sobre `58eb398` y está en el historial (`3d39eb0`); sus defectos y su cierre se resumen abajo. Todo lo de
esta carpeta se regeneró sobre `7813449` el **2026-10-04** (13:36–14:02 UTC). Ningún archivo de `src/` se modificó.

## Condiciones

- **Build:** `npm run build` (`astro check && astro build`) en el checkout de `main` con HEAD = `7813449`, tomando el
  código de salida como condición. El build de B1 empezó a las 2026-10-04T13:36:30Z. Después de las pruebas de B7
  se volvió a correr el build normal (13:59:40Z, salida 0) y se repitieron B2 y B9 sobre ese `dist/`, con el mismo
  resultado.
- **Servidor:** `astro preview` del repo en `http://localhost:4932`, que sirve `dist/`.
- **Navegador:** Chrome 154.0.8037.97 headless por CDP (puerto 9360), con emulación de foco.
- **Referencia:** `NoctiLabs Web v3.dc.html` servido en `http://localhost:4933`, con la textura en «Ninguna» (valor por
  defecto) y fondo liso. Sus fuentes caen al respaldo del sistema (Arial). El video del hero del diseño da 404 en ese
  servidor, así que la referencia muestra el hero sin video.
- **Sanity real:**
  - proyecto `q164hlpj`, dataset `production`, API `v2025-02-19`, con la misma GROQ del loader;
  - consultado el **2026-10-04T13:36:50Z** (HTTP 200, 8 documentos `post`); el `result` es idéntico al de la consulta de la primera pasada (12:01:41Z);
  - se publica uno solo: **`_id` = `post-no-context-no-intelligence`, `publishedAt` = `2026-09-28`**, sin `slugEs`, `topic` ni `readingTime`;
  - por eso los dos slugs son `no-context-no-intelligence`, la categoría «Tesis» sale de `category.en` y los minutos se calculan: 220 palabras en ES dan 1 min y 320 en EN dan 2 min.
  - Resumen y respuesta cruda: `b2-sanity-consulta.txt`, `b2-sanity-respuesta.json`.
- **Scripts:** los escenarios CDP están en la carpeta de scripts de la sesión (`…/scratchpad/ev002/`). Incluyen
  `home/`, `producto/` y `resto/`, reutilizados de los tres agentes de la fase 2 y apuntados a `localhost:4932`.
  No se copian al repo porque `astro check` incluye `**/*` y les sumaría warnings. En el repo queda solo el comparador de B2,
  que pasa `astro check` sin avisos.

## Resultado por criterio

| # | Resultado | Detalle | Archivo |
|---|---|---|---|
| B1 | **OK** | `astro check`: 80 archivos, 0 errores, 0 warnings, 0 hints. `astro build`: 23 páginas (22 rutas + 404), salida 0. Las líneas extra son los avisos de §3.4: **7** `[insights] excluido: …`, uno por cuerpo ES vacío y seis por «no está marcado para Insights». Vitest: 80/80. | `b1-build.txt`, `b1-tests.txt` |
| B2 | **OK** | **207/207** contra `b2-esperados.json`, escrito a mano. Por ruta: `lang`, canonical, hreflang ×3, title, descripción, H1 y destino del selector de idioma. Además, `dist/` tiene exactamente las 22 rutas. La 404 no tiene canonical, hreflang ni selector. | `b2-esperados.json`, `b2-comparar.mjs`, `b2-comparacion.txt` |
| B3 | **FALLA (una diferencia fuera de §7)** | D1 y D3 están cerrados, y 6f autoriza los nodos y el H2 del antes/después. Queda **una** diferencia que §7 no lista: a 390, «Leer →» del destacado de Insights baja a otra línea porque la meta «28 sep 2026 · 1 min de lectura» (plantilla de §4.5) es más larga que «8 min». Hace falta una enmienda en §7 o un ajuste de layout. Matriz abajo. Estructural EN↔ES e industrias↔Retail: 30/30. | `capturas/b3/`, `b3-estructura.txt` |
| B4 | **OK por la verificación complementaria; el escenario original da 64/68** | `b4.mjs` sin cambios: 32/34 por idioma. Las dos líneas en FALLA por idioma («manual: árbol accesible… de «con»» y «sin JS: árbol… descripciones de «con»») vienen del instrumento, no del comportamiento. Con D5, «Nocti» va en un `<span translate="no">` dentro de las descripciones, y el árbol AX parte cada descripción en varios StaticText; la comparación de `b4.mjs` busca el texto entero dentro de la lista unida con « \| » y ya no lo encuentra. No se tocó `b4.mjs`. Se agregó `home/b4-desc.mjs`, que concatena el texto accesible de cada descripción: **8/8**, con las 3 descripciones exactas en «con», «sin» y «con» otra vez, sin JS en «con», nunca las del otro estado y ningún botón sin JS. El resto de B4 (alternancia, detención, `aria-pressed`, región viva y reduced motion) sigue 32/32 por idioma. | `b4.txt` |
| B5 | **OK** | 60/60: tabs APG, foco con flechas/Home/End, activación manual, Tab al panel, inactivos fuera del árbol, «Conocer más» a su industria, red lenta sin imagen rota, respaldo y sin JS. | `b5.txt`, `capturas/b5-b6/` |
| B6 | **OK** | 26/26. Contraste mínimo 5,35:1 (Capacidades) y 4,85:1 (Pasos); reposo, hover, táctil y reduced motion. | `b6.txt`, `capturas/b5-b6/` |
| B7 | **OK** | Sin filtros; destacado al artículo; el índice navega a las anclas (top 84 px, ahora por `scroll-padding-top`); selector al artículo equivalente; Insights activo; fecha y minutos iguales en destacado y cabecera («28 sep 2026 · 1 min de lectura», «Sep 28, 2026 · 2 min read»). Fixtures: cuerpo ES nulo y spans vacíos, fecha imposible, slug ES repetido, slug EN repetido, minutos por idioma iguales a los calculados aparte, publicar → retirar con la caché conservada sin residuos, cero publicados y Sanity inaccesible/500/JSON inválido (el build falla). Cada build lista los 7 avisos de los posts reales más los del caso. | `b7.txt`, `capturas/b7/` |
| B8 | **OK** | 22/22 (sin JS y con JS, estados, `beforeunload`, labels/`name`/`autocomplete`/tipos y bordes de 4,54:1). | `b8.txt`, `capturas/b8/` |
| B9 | **OK** | 1177 hrefs internos (374 con ancla), 0 rotos. | `b9-b11.txt` |
| B10 | **OK** | 0 errores de consola en las 22 rutas, la 404 y una URL inexistente, a 1440 y 390. | `b10.txt` |
| B11 | **OK** | Máximo 3141 bytes gzip (home). | `b9-b11.txt` |
| B12 | **OK, con observaciones** | 20/20. `currentSrc` de 35 a 148 KB; render igual a `sizes` (1022,7/1022,5 y 1108,2/1109). Las 10 páginas de industria llevan `loading=eager`, `decoding=async` y `fetchpriority=high`. Observaciones abajo. | `b12.txt` |
| B13 | **FALLA** | D2, D5 y D7 cerrados. Quedan abiertos o parciales: **D4** («Enviar otro mensaje» con un hover prácticamente imperceptible), **D6** (la tarjeta de «Seguir leyendo» desborda con una palabra larga) y **D8** (queda `:focus` en lugar de `:focus-visible`, menor). Hallazgo nuevo **N1**: nombres de meses escritos a mano en `formatDate`. | este README, `b13-*.txt` |
| B14 | **OK** | `a7.mjs`: **78/78**. | `b14-a7.txt` |
| B15 | **OK** | **Teclado:** 46/46 (23 páginas × 1440/390). Sin trampas y en orden de documento; Shift+Tab recorre lo mismo al revés; foco visible en todo, incluidos los campos (anillo de 2 px); **ningún foco tapado** por la cápsula, ni total ni parcial. **Reflow 320:** 25/25. **Zoom** 125–400 %: 138/138. El cuerpo da 16 × zoom px en todos los pasos y los display ×2,08–×2,94 al 400 %; sin desbordes, recortes ni superposiciones; controles operables; sin foco tapado. Desde 175 % el viewport mide ≤ 480 px de alto y el header deja de ser sticky. **Árbol AX** de las secciones interactivas en ES y EN. No hubo lector de pantalla: queda como límite. | `b15-*.txt`, `capturas/b15/` |

## Defectos de la primera pasada y su cierre

| Defecto (sobre `58eb398`) | Cambio en `7813449` | Verificación en esta pasada | Estado |
|---|---|---|---|
| **D1** · banda «Hablemos.» del home angosta (974 px a 1440) | `HablemosBand.astro:19`: `width: 100%` | `capturas/b3/home-band-1440-*`: la banda mide 1200 px como en el diseño y en las otras páginas. | **Cerrado** |
| **D2** · el header sticky tapa el foco (Shift+Tab; total en 4 páginas) | `global.css`: `html { scroll-padding-top: 84px }` (8 px con alto ≤ 480 px), sin `scroll-margin`; `Header.astro`: no sticky con alto ≤ 480 px | `b15-teclado.txt` 46/46 sin foco tapado; `b15-zoom.txt` 138/138; `b15-tapado.txt`: el mismo recorrido deja el chip en top 472 px y «← Insights» en top 84 px, y en el centro de los dos está el propio link; las anclas del índice siguen en top 84 px (B7); B14 78/78. | **Cerrado** |
| **D3** · fecha «28 set. 2026» contra «18 sep 2026» del diseño | `insights.ts:176-181`: formato «28 sep 2026» | B7 y `capturas/b3/insights-*`, `articulo-*`. | **Cerrado** (ver N1) |
| **D4** · botones sin hover | `.seg button:hover { color: var(--ink) }` en Sin/Con e Industrias; `.again:hover { background: var(--surface-2) }` | Sin/Con y tabs: de `--muted` a `--ink`, visible. `.again`: pasa de `--surface` (#E6E6E2) a `--surface-2` (#E9E9E5), una diferencia de 1,03:1 que va **hacia** el blanco de la tarjeta. Prácticamente imperceptible, y la guideline pide que hover/active sean más prominentes que el reposo. | **Parcial** (`.again`, `Hablemos.astro:206`; inalcanzable en la fase 2) |
| **D5** · `translate="no"` faltante | `Txt` en las descripciones (`BeforeAfter.astro:60`) y en el kicker de Nosotros; `insights.ts:96-97` envuelve «Nocti»/«NoctiLabs» en el HTML del CMS | `b13-translate.txt`: **0** textos con la marca sin `translate="no"` en las 23 páginas (el artículo ES tiene 3 `span translate="no"`). | **Cerrado** (provoca la nota de B4) |
| **D6** · títulos del CMS sin `overflow-wrap` | `overflow-wrap` en `.f-title`, `ArticleCard .title`, el H1 del artículo, `.toc` (con `min-width: 0`) y `.r-card` | `b13-largo.txt`, a 320 px: destacado, H1 e índice sin desborde (`scrollWidth` 320). `b13-largo-f5.txt`, con el build de 3 artículos: la tarjeta de la grilla tampoco desborda; **la de «Seguir leyendo» sí**, con `scrollWidth` 448 px y el texto hasta 415 px. El `overflow-wrap` está en `.r-card` (flex), pero el título es un `<span>` hijo flex con `min-width: auto`, así que su mínimo sigue siendo la palabra entera. | **Parcial** (`Articulo.astro:55` y `:129-147`; solo con ≥ 2 artículos y una palabra muy larga) |
| **D7** · foto de industria sin prioridad | `fetchpriority="high"` (`IndustryPhoto.astro:24`) | `b12.txt`: 10/10 páginas con `fetchpriority high`. | **Cerrado** |
| **D8** · campos sin anillo de foco | Sin `outline: none`; `input:focus, select:focus, textarea:focus { … outline: 2px solid var(--blue-link); outline-offset: 2px }` | `b15-teclado.txt`: los 6 campos con anillo en ES y EN. Queda `:focus` en lugar de `:focus-visible` (`Hablemos.astro:162`): en el `<select>`, un click del mouse también muestra el anillo. | **Cerrado** para B15; **menor** abierto para B13 |
| **D9** · posts no marcados excluidos sin aviso | `insights.ts:123-126` | `b1-build.txt` y cada build de `b7.txt`: 7 avisos con los posts reales. | **Cerrado** |

## Hallazgos nuevos o que siguen abiertos

- **N1 (B13, nuevo) · fecha con meses escritos a mano.** `src/lib/insights.ts:176-181` arma la fecha ES con
  `MESES = ['ene', …]`. La guideline marca «Hardcoded date/number formats (use Intl.*)» como anti-patrón. Es el precio de
  igualar el diseño: `Intl` en `es` da «sept» y con `es-UY` da «set.». Hay que llevarlo como excepción documentada en el spec
  (B13), o volver a `Intl` y aceptar la diferencia en §7.
- **D4 parcial, D6 parcial y D8 menor:** ver la tabla anterior.
- **B3 · «Leer →» a 390:** diferencia fuera de §7, descrita en la tabla de resultados.
- **Observaciones de B12 (no fallan el criterio):**
  - el JPG de respaldo de 1920w de Servicios (`servicios.D2oHaJz5_Z1m0Yzd.jpg`, `src` del `<img>`) pesa **319 KB**. Supera los 300 KB, aunque no es el `currentSrc` en Chrome;
  - `retail.png` y `salud.png` miden 1024 px y se muestran a 1108 px.
- **Observación del artículo:** `.prose-article h2` no fija `line-height` y hereda 1,65; un H2 de dos líneas queda con un
  interlineado amplio. El diseño no tiene H2 de dos líneas para comparar.

## B3 — matriz de fidelidad

Capturas en `capturas/b3/` con el nombre `<sección>-<ancho>-ref|nuevo|nuevo-en.webp`, todas regeneradas sobre `7813449`. Las otras
cuatro industrias y Producto/Industria en EN están como `pagina-<x>-<ancho>-nuevo.webp`, y se comparan estructuralmente en
`b3-estructura.txt`.

Diferencias comunes a todas las filas: §7.7 (Inter) y la textura ausente (temporal, fase 3).

| Página · sección (Inv) | 1440×900 | 390×844 | Diferencias → ítem de §7 |
|---|---|---|---|
| Home · hero (§1.1) | `home-hero-1440-*` | `home-hero-390-*` | Botón de pausa (§7.8). |
| Home · antes/después «sin» y «con» (§1.2) | `home-ba-sin/con-1440-*` | `home-ba-sin/con-390-*` | Sin comparador (§7.1); chip apagado #6B6B68 (§7.2); H2 sin `nowrap` (§7.6); a 390, nodos de ≈11 px y H2 con `var(--h2)` (§7.6f). |
| Home · Toda la empresa puede preguntar (§1.3) | `home-roles-1440-*` | `home-roles-390-*` | AppSlot placeholder sin tabs de rol (temporal, fase 3). |
| Home · Capacidades y Pasos, en reposo y en hover (§1.4–1.5) | `home-caps*`, `home-steps*` | ídem | Ejemplos siempre visibles (§7.3). |
| Home · Industrias ×5 (§1.6) | `home-ind-0…4-1440-*` | `home-ind-0…4-390-*` | Fotos (§7.6d); «Conocer más» a su industria (§7.4). |
| Home · banda (§8) | `home-band-1440-*` | `home-band-390-*` | — (D1 cerrado). |
| Producto · hero, demo, Overview, Cerebro, BI, Agentes, Control y banda (§2) | `producto-00…07-1440-*` | ídem 390 | Placeholders y sin captions (temporal); a 390, un conector y Control en una columna (§7.5). |
| Industria Retail · las 7 secciones (§3, §8) | `industria-retail-00…06-1440-*` | ídem 390 | Foto (§7.6d). |
| Nosotros (§4) | `nosotros-1440-*` | `nosotros-390-*` | Sin Equipo (temporal). |
| Insights (§5) | `insights-1440-*` | `insights-390-*` | Sin filtros ni grilla (temporal); contenido del post (§7.6e); fecha «28 sep 2026», mismo formato que el diseño. **A 390, «Leer →» en otra línea: fuera de §7.** |
| Artículo (§6) | `articulo-1440-*` | `articulo-390-*` | Contenido, metadatos e índice del post (§7.6e); sin «Seguir leyendo» (temporal). |
| Hablemos, formulario en idle (§7) | `hablemos-1440-*` | `hablemos-390-*` | Borde #767676 (§7.6b); placeholders y opción vacía (§7.6c); selector de idioma (§7.8). |
| Header y footer (fase 1) | en todas las capturas | ídem | Chevrons y selector (§7.8). |

## B13 — revisión con web-design-guidelines

Reglas de `vercel-labs/web-interface-guidelines/command.md` (copia en `b13-guidelines-command.txt`, bajada el 2026-10-04).

**Alcance:**

- `src/components/sections/**` (20 archivos);
- `src/scripts/before-after.ts`, `tabs.ts` y `contact-form.ts`;
- `src/styles/article.css`;
- y, por el arreglo de D2, `src/components/Header.astro` y `src/styles/global.css`.

Se revisó el diff `58eb398..7813449` completo y se repitieron los chequeos automáticos (`b13-translate.txt`, `b13-largo.txt`,
`b13-largo-f5.txt`).

Abiertos: N1, D4 parcial (`.again`), D6 parcial (`.r-card`) y D8 menor (`:focus`).

**Excepciones permitidas, que no cuentan como hallazgo:**

- las de la fase 1;
- la URL efímera de las tabs y de Sin/Con;
- la transición de colores.

**Sin hallazgos en el resto:** lo mismo que en la primera pasada, más:

- el header deja de ser sticky con alto ≤ 480 px, sin efectos en B14;
- el envoltorio de marca en el HTML del CMS solo toca el texto entre etiquetas y no cambia los ids ni el índice (B7 y B9 en verde).

## Límites conocidos

- Toda la interacción se verificó en Chrome headless; no hubo Safari ni un lector de pantalla (árbol AX de CDP).
- «Pestaña oculta» en B4 se simula con `document.hidden` y `visibilitychange`.
- La captura de «Enviando…» (B8) se toma con `requestAnimationFrame` congelado.
- El zoom se emula con `deviceScaleFactor` = zoom sobre 1280×800, con un layout de 1280/zoom px.
- En `capturas/b15/zoom-200-home.webp` el skip link aparece visible, porque el foco quedó en él al terminar el recorrido
  con Tab.
- `capturas/b15/b15-foco-tapado-*.webp` conservan el nombre de la primera pasada y ahora muestran el foco **sin** tapar.

## Cierre posterior a la segunda pasada (commit `962a1fe`)

Lo que quedaba abierto en B3 y B13 sobre `7813449` se cerró en `962a1fe`. Los cambios son solo de CSS y del spec, y no tocan la lógica que verificaron B1–B15:

- **B3:** «Leer →» que baja de línea a 390 px queda autorizado como diferencia en el spec 002 §7, ítem 6g.
- **D4:** el hover de «Enviar otro mensaje» pasa a `#DCDCD7`, la convención del diseño para los botones `#E6E6E2`.
- **D6:** el título de «Seguir leyendo» lleva `min-width: 0` y `overflow-wrap: anywhere` (clase `.rel-title`).
- **D8:** el anillo de foco de los campos usa `:focus-visible`; el borde azul se mantiene con `:focus`.
- **N1:** el formato de fecha en español con abreviaturas propias («18 sep 2026», como el diseño) queda documentado como excepción de B13.

El build de `962a1fe` da salida 0, con 0 errores, warnings y hints, y Vitest 80/80.


## Cierre del gate de implementación, pasada 1 (código `a11f70f`)

La pasada 1 del gate (`docs/reviews/002-impl-sol-pasada-1.md`) dio GATE NO, con 1 bloqueante y 9 hallazgos más. El código se corrigió en `a11f70f`, y la evidencia nueva está en `gate-p1/`. Los scripts corren desde la carpeta de la sesión (`…/scratchpad/ev002/gate/`, con `cdp.mjs` y `routes.mjs` un nivel arriba) y aquí se guarda una copia.

| # | Hallazgo | Arreglo | Verificación | Resultado |
|---|---|---|---|---|
| 1 | Datos inválidos del CMS tiraban el build | El loader excluye con motivo los documentos que no pasan el schema. Los bloques nulos o ajenos se ignoran con aviso. Un cuerpo que no se puede renderizar excluye ese artículo. | Fixture F8: `gate-nulo` (`body.es = [null, bloque]`) se publica con el aviso `bloque no admitido ignorado (null)`, y `gate-minutos` (`readingTime: "5"`) queda excluido con `datos inválidos`. El build termina con código 0. | OK (`f8-check.txt`, `f8-build.txt`) |
| 2 | ids de H2 repetidos y choque con `toc-title` | Prefijo `sec-` y sufijo libre comprobado contra los ids ya usados | «Contexto», «Contexto», «Contexto 2» y «Toc title» generan `sec-contexto`, `sec-contexto-2`, `sec-contexto-2-2` y `sec-toc-title`. Hay 13 ids únicos por página, y cada link del índice apunta a su H2 (ES y EN). | OK |
| 3 | `safeHref` descartaba rutas relativas | Una ruta sin esquema es relativa. Se descartan `//host`, las barras invertidas y los esquemas que no sean http(s) ni mailto. | Se conservan `../otro-articulo/`, `otro-articulo/` y `./?x=1`. Se descartan `javascript:`, `//evil.example/` y `/\evil.example/`. | OK |
| 4 | Listas con estilos desconocidos | Solo se admiten `bullet`/`number` con estilo `normal`, con el mismo criterio para publicar, renderizar y contar palabras | `h3`+`bullet` y `check` se ignoran con aviso, y la lista válida se renderiza | OK |
| 5 | Contenido largo del cuerpo y del resumen | `overflow-wrap: anywhere` en `.prose-article` y `.f-excerpt` | Un identificador de 120 caracteres en el lead, un párrafo, un H2, una cita y el resumen destacado, a 320 px (ES/EN): sin desborde ni recortes | OK (`b13-largo-f8.txt`) |
| 6 | AppSlot sin `Props` | `interface Props extends AppSlotProps {}`, sin cast, y `data-app-frame` | `astro check`: 0 errores | OK (`build-final.txt`) |
| 7 | Edición durante el envío | Todo el `fieldset` queda deshabilitado mientras está ocupado. Con error se rehabilita. | Lo verifica D2 de la fase 4, con respuesta demorada, cuando exista el envío real; hoy `submitContact` siempre rechaza | Código listo; escenario en D2 (fase 4) |
| 8 | B3 del hero sin video en la referencia | La referencia sirve `assets/hero.mp4` y `hero.webm` (los mismos archivos que la web nueva, mismo md5). | Mismo fotograma (t = 0, porque el servidor de la referencia no admite Range), pausado, a 1440 y 390. Encuadre idéntico (`cover`, 50 % 50 %). Luminancia del velo en tres zonas: 176,9/177,1, 77,1/76,9 y 84,0/84,0. Las únicas diferencias son la fuente (Arial de respaldo en la referencia) y el botón de pausa (§7.8). | OK (`b3-hero/`, `b3-hero-video.txt`) |
| 9 | B15 incompleto | `layoutcheck.mjs` v2 detecta además texto recortado por un ancestro con overflow hidden/clip; un control negativo prueba que lo detecta. Reflow y zoom recorren las cinco industrias del home. | Reflow a 320: 35/35 (todas las rutas, la 404 y, en el home ES/EN, Sin/Con y las cinco industrias). Zoom 100–400 %: 138/138, con el layout medido con cada industria activa. Consola sin errores. Corre sobre `a11f70f`, que incluye el CSS de `962a1fe` (`.rel-title`, `:focus-visible`). | OK (`b15-reflow-v2.txt`, `b15-zoom-v2.txt`) |
| 10 | `translate="no"` incompleto | Las marcas están en `src/lib/brand.ts` (NoctiLabs, Nocti, WhatsApp, HubSpot, SAP y Gmail), con bordes Unicode. Se aplican en Overview y en los títulos, resúmenes, índice y relacionados del CMS. | `dist/`: WhatsApp 3/3 en el home, 1/1 en Producto (ES y EN). En el cuerpo del CMS (F8), WhatsApp con `translate="no"`. | OK |

Builds: F8 y normal, los dos con código 0. `astro check`: 0 errores. `vitest`: 80/80. Después de las pruebas con F8 se volvió a correr el build normal (`build-final.txt`).
