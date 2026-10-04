# Evidencia del spec 003 — islas (Nocti App y textura)

**Commit verificado: `f6b0833`** (rama `fase3-islas`). Todo lo de esta carpeta salió de una corrida única sobre ese commit,
iniciada el 2026-10-04T17:13Z (`run-all2.sh`). La corrida anterior sobre `93b8529` encontró dos defectos reales (ver
«Defectos encontrados y cerrados»), que se arreglaron en `f6b0833` antes de esta corrida.

## Condiciones

- **Build:** `npm run build` (`astro check && astro build`) en el worktree, con el código de salida como condición. Sanity real (el
  build consulta el dataset). Salida en `c1-build.txt`.
- **Servidor:** `astro preview` del worktree en `http://127.0.0.1:4981`.
- **Navegador:** Chrome 154.0.8037.97 headless por CDP (puertos 9370–9379), sin throttling salvo donde se indica.
- **Máquina (C9):** AMD Ryzen 7 5800H (8 núcleos, 16 hilos) · GPU Radeon RX 5500M y Radeon integrada · 15,4 GB de RAM · Windows 11
  Home 10.0.26200.
- **Referencia del diseño:** copia de la carpeta de deploy servida en `http://127.0.0.1:4962` (`Nocti App v2.dc.html` y
  `NoctiLabs Web v3.dc.html`). Sus fuentes caen al respaldo del sistema.
- **Línea de base para C12:** el commit padre `10847c1` construido en un worktree aparte y servido en `:4983`, para separar fallas
  preexistentes de regresiones.
- **Scripts:** en la carpeta de scripts de la sesión (`…/scratchpad/ev003/`), no en el repo (`astro check` incluye `**/*`).
  Escenarios propios: `c3-chat`, `c3-rol`, `c3-oc`, `c3-teclado`, `c4-reduced`, `c5-a11y`, `c5-reflow`, `c5-contraste`, `c6-nojs`,
  `c8-peso`, `c9-textura`, `c9-perf`, `c10-formatos`, `c11-datos`, `c2-matriz`; los de la fase 2 en `ev003/c12/` (copias de `ev002`
  y de `docs/evidence/002/gate-p1`, solo con el puerto y la ruta de `dist/` cambiados).

## Resultado por criterio

| # | Resultado | Detalle | Archivo |
|---|---|---|---|
| C1 | **OK** | `astro check`: 0 errores, 0 warnings, 0 hints. `astro build`: 23 páginas, salida 0; las únicas líneas de aviso son los 7 `[insights] excluido` esperados de la fase 2. Vitest 80/80. | `c1-build.txt`, `c1-tests.txt` |
| C2 | **OK, con observaciones** | Matriz abajo: 261 capturas de la isla (ES completo; EN a 1440 y 390) y 74 de referencia. Los 10 casos de ancho quedaron fijados exactos. 0 hallazgos de layout (desborde, recorte o superposición) en las 261. Las diferencias observadas se mapean a §6 en la tabla de diferencias. La comparación lado a lado fue a ojo sobre pares de capturas, no automática. | `c2-matriz.txt`, `capturas/c2/`, `capturas/c2-ref/` |
| C3 | **OK** | Chat con sus tiempos (desvío ≤ 100 ms desde el click en las 13 etapas; ver tabla en `c3-chat-*`), todas las transiciones de §4.3, rotación y elección manual (también tras pausar y reanudar), OC-4471 desde Control y desde Compras con su reflejo en Inicio, contadores, totales y flujo; rechazo solo desde Control; corridas de Cobranzas y Comercial; Lista/Centro; usuario (Esc y click fuera); «Crear / Integrar» como link; viewport bajo 1280×400 con zoom 200 %. Mouse y teclado (Enter/Espacio) en 1440 y 390. ES y EN. | `c3-chat-{es,en}.txt` 19/19, `c3-rol-*` 14/14, `c3-oc-*` 74/74, `c3-teclado-*` 19/19, `c5-a11y-*` (zoom 200 %) |
| C4 | **OK** | Reduced motion inicial y en vivo: respuesta completa y estática, sin repetido ni rotación, curvas del flujo y de Centro sin `<animate>`, textura en un frame y sin «Pausar fondo»; al salir de reduced, vale la misma condición. | `c4-reduced-{es,en}.txt` 11/11 |
| C5 | **OK en el contrato DOM; PENDIENTE el anuncio con lector real** | Orden de Tab en las 7 vistas sin controles muertos ni ilustrativos, foco visible; regiones con scroll a 320 px con JS (las 8, incluida la tabla de aprobación de los 3 agentes dentro del marco de Control) y sin JS (la de trazabilidad), recorridas con flechas hasta los dos extremos; flujo 520–799 como región; `aria-current`/`aria-pressed` después de cada cambio (ancho y angosto, los dos selectores de rol); `role="status"` con una frase por acción; árbol AX; alternativas textuales; reflow a 320 y zoom 200 % sin pérdida (219/219 por idioma, en las 6 instancias, con los flujos de los 3 agentes pendiente/aprobado y Compras rechazado); controles de §6.17 enteros; contraste sobre colores efectivos (tabla abajo). Regiones vivas: MutationObserver con tiempos en reproducción automática (0 escrituras), elección manual (1, tras el pie y antes de los 5200 ms), elección en la variante normal hasta la repetición (1), la misma conversación dos veces (2, una por apertura) y secuencia cancelada antes del anuncio (0). **Anuncio comprobado con NVDA/VoiceOver: PENDIENTE** (no hay lector en la máquina; `docs/pendientes.md` n.º 18). | `c5-a11y-*` 21/21, `c5-reflow-*` 219/219, `c5-contraste-*`, `c5-ax-*.txt`, `c3-chat-*`, `c3-oc-*` |
| C6 | **OK** | Sin JS: los 6 embeds (5 de Producto y el home) muestran su vista inicial legible con todos los botones deshabilitados; «Crear / Integrar» navega a Hablemos; la región SSR de trazabilidad se recorre con teclado a 320. Red lenta (600 ms, 40 KB/s): igual hasta hidratar (≈3 s), después todo habilitado y operable. | `c6-nojs-{es,en}.txt` 21/21, `capturas/c6/` |
| C7 | **OK** | 0 errores de consola en las 22 rutas, la 404 y una URL inexistente, a 1440 y 390 (B10), y 0 en todos los escenarios de esta carpeta (cada uno imprime su lista). | `c12-b10.txt`, final de cada `c*.txt` |
| C8 | **OK** | Sin isla: fase 2 ≤ 1594 B (2449 en Hablemos) + textura 1007 B, sin React. Con isla: fase 2 3141 B (home) / 1594 B (Producto) + textura 1007 B + isla 99 385 B (React 65 675, app 28 624, renderer 3010, runtime y directiva de hidratación inline). Solo los 6 íconos de simple-icons en `dist/`. | `c8-peso.txt` |
| C9 | **OK, con dos caminos verificados por emulación (PENDIENTE en hardware)** | Capa fija detrás del contenido, sin tapar ni capturar el puntero, superficie CSS = viewport; 13,6–14,3 fps (máximo 15 en cualquier segundo); pausa manual con su precedencia, persistente y funcional con `localStorage` bloqueado; resize, orientación y DPR 1→2→1 en pausa y con reduced motion: bitmap correcto, un redibujo, cero frames después. Rendimiento a DPR 1: (625,6 − 0,0)/10 000 = **0,063**; DPR 2: (671,3 − 0,0)/10 000 = **0,067** (umbral 0,15), sin tareas > 50 ms. **Emulado:** la emulación de CDP no emite el `change` de `matchMedia('(resolution: …)')` ni `visibilitychange` (sondas `dbg2`/`dbg3`/`dbg4` en la carpeta de scripts), así que en los casos «solo DPR» y «pestaña oculta» el evento se emitió a mano sobre la consulta que armó el script y sobre `document`. La reacción del código quedó verificada; el disparo real por el navegador queda PENDIENTE (`docs/pendientes.md` n.º 19). | `c9-textura-{es,en}.txt` 26/26, `c9-rendimiento.txt` |
| C10 | **OK** | 7 vistas, los 4 roles, las 5 conversaciones, los 3 flujos y los mensajes de aprobación en inglés (`c3-*-en`, `c11-datos-en`, capturas `en-*`); ninguna cadena de la interfaz en español en las 7 vistas EN. Formatos: «$18.400.000»/«$18,400,000», «$48,2 M»/«$48.2M», «19,4 %»/«19.4%», «86.120»/«86,120», «5 oct»/«Oct 5». El inglés es traducción mía (D4, `docs/pendientes.md` n.º 17). | `c10-formatos.txt` 11/11 |
| C11 | **OK** | Tabla dato → aparición → valor observado, en ES y EN (36/36 cada una), con los dos ítems de Compras en Inicio y los estados de la OC y de las corridas en todas sus representaciones (`c3-oc-*`, 74/74 por idioma). Ningún valor viejo del diseño aparece en el texto recorrido. | `c11-datos-{es,en}.txt`, `c3-oc-*` |
| C12 | **FALLA en B15 teclado (hidratación de las islas: atribuida; ciclo de fin de documento: PENDIENTE de clasificar); el resto OK o como la base** | A7 78/78; B4 con las mismas 4 fallas por idioma que la línea de base (instrumento, B4-desc 8/8); B5 0 fallas; B9 0 links rotos; B10 0 errores; B11 reemplazado por C8; B15: ver «C12 en detalle». | `c12-*.txt` |
| C13 | **PENDIENTE** | Gate de gpt-6.1-sol sobre este commit: no es parte de esta entrega. | — |

## C12 en detalle

Se corrieron los instrumentos de la fase 2 sin cambios de lógica y, para atribuir cada falla, los mismos sobre la línea de base
`10847c1` (`ev003/c12-base/`).

| Instrumento | Esta rama | Línea de base | Clasificación |
|---|---|---|---|
| A7 (header) | 78/78 | — | OK |
| B4 (antes/después) | 4 fallas por idioma | 4 fallas por idioma, las mismas líneas | Preexistentes del instrumento (StaticText partidos por `translate="no"`); `c12-b4-desc.txt` 0 fallas. |
| B5 (industrias) | 0 fallas | — | OK |
| B9 / B10 | 0 rotos / 0 errores | — | OK |
| B15 teclado (`b15-teclado`) | ver `c12-b15-teclado.txt` | 0 fallas | **Islas:** en Producto y el home, el recorrido de Tab desde arriba encuentra los botones de las islas que no entraron en pantalla `disabled` (no enfocables) y los saltea; al llegar a la isla, esta hidrata y Shift+Tab ya encuentra más paradas → «Shift+Tab DISTINTO» y «orden de documento NO». Es la combinación de `client:visible` con controles deshabilitados hasta montar que pide §3.3: no es un defecto del instrumento ni de un control puntual. Con las islas ya hidratadas (`b15-teclado-hidratado`, mismo instrumento con un recorrido previo de la página) desaparece. Decisión pendiente: `docs/pendientes.md` n.º 20. **Otras páginas (sin clasificar, PENDIENTE):** «trampa ciclo en Saltar al contenido» en páginas sin isla, en las dos corridas de esta rama y no en la línea de base. Lo único nuevo en esas páginas es el botón «Pausar fondo», último control del footer. La sonda `c12-b15-fin-de-documento.txt` muestra que el fin de documento en Chrome headless depende del tipo del último control (en la base, Tab desde el último link vuelve a «Saltar al contenido»; con un botón al final, va al body), así que apunta al detector de fin del instrumento y no a una trampa real (Tab sigue avanzando y Shift+Tab funciona), pero no alcancé a aislarlo: queda PENDIENTE de clasificación, no aprobado. |
| B15 teclado hidratado | **0 fallas** (46 recorridos) | — | Complementario: mismo instrumento con un recorrido previo de la página. Sin fallas, tampoco el «ciclo» de fin de documento. En `93b8529` sus únicas fallas fueron «sin foco visible» en «Ver agente» (el anillo estaba en la tarjeta y no en el botón): defecto real, arreglado en `f6b0833`. |
| B15 tapado / reflow v2 / zoom v2 / AX | tapado: foco no tapado (el propio link en el centro); **reflow v2 0 fallas; zoom v2 0 fallas** (125–400 %); AX sin errores | reflow v2 y zoom v2: 0 fallas | OK. En `93b8529`, las 12 fallas del zoom v1 eran las mismas «sin foco visible» de «Ver agente», y el reflow v1 marcaba los `span` ocultos de la isla porque usaban una clase propia en lugar de `.sr-only`; los dos defectos se cerraron. Los v2 son los instrumentos vigentes del gate de la fase 2 (`docs/evidence/002/gate-p1/`). |

La corrida terminó completa (`FIN 2026-10-04T18:00:40Z`).

## C2 — matriz de fidelidad

Contenedores medidos por caso (anchos en CSS px; `app` = `.nocti-app-cq`, `flow` = área del flujo, `roledemo` = sección del home):

| Caso | Cómo se fija | app | flow | roledemo | Capturas |
|---|---|---|---|---|---|
| Página 1440 · marcos reales | ancho de página | 1072,22 (Control 993,13) | ≈ 814 (calculado: app − 216 − 40 − 2) | 1108,22 (app 852,22) | `es-1440-*`, `en-1440-*` |
| Página 390 · marcos reales | ancho de página | 341,63 (Control 313,44) | lista | 358 | `es-390-*`, `en-390-*` |
| Página 360 | ancho de página | 311,63 | lista | 328 | `es-360-*` |
| app 719 / 720 | ancho del embed | 719 / 720 | 689 / 462 | — | `es-app719-*`, `es-app720-*` |
| app 859 / 860 | ancho del embed | 859 / 860 | 601 / 602 | — | `es-app859-*`, `es-app860-*` |
| flow 519 / 520 | ancho del embed | 549 / 550 | 519 / 520 | — | `es-flow519-*`, `es-flow520-*` |
| flow 799 / 800 | ancho del embed | 1057 / 1058 | 799 / 800 | — | `es-flow799-*`, `es-flow800-*` |
| roledemo 1099 / 1100 | ancho de la sección | 1099 / 844 | — | 1099 / 1100 | `es-roledemo1099-*`, `es-roledemo1100-*` |

Por caso de app y por marco real: las 7 vistas, los 4 roles en Preguntar (pausado, respuesta completa), transacciones, Centro,
conversación abierta, los 3 agentes pendiente y aprobado, OC aprobada, deshecha y rechazada, Compras rechazado y usuario abierto
(24 capturas por recorrido). Referencia del diseño en `capturas/c2-ref/` a 1072, 341, 720, 719, 860 y 859 (12 estados cada uno) y la
sección del home a 1440 y 390.

**Diferencias observadas → §6:**

| Diferencia | §6 |
|---|---|
| Panel de permisos del home dentro de la sección, a la derecha (≥ 1100) o debajo | 1 |
| Flujo en región con scroll entre 520 y 799 y en lista por debajo de 520; alto según el contenido; kickers y títulos de tarjeta que cortan línea | 2, 17, 18 |
| Curvas animadas 3 veces y quietas | 3 |
| Botones ilustrativos sin estados; usuario como panel de texto (sin Ajustes/Idioma/Ayuda/Cerrar sesión como acciones) | 4 |
| Saludo «Hola», umbral $15 M, conteos, antigüedad, 57 clientes, −28 %, totales $21,6 M y $28,7 M, «Advertencia», catálogo de 8 fuentes (Centro con Correo en lugar de Entrevistas, «ERP · Depósito»), «Contexto consultado» por respuesta, OC y corridas con estado único | 5 |
| Avatares de iniciales | 6 |
| Colores de texto corregidos (warn, success, grises, tarjetas en espera con texto opaco) | 7 |
| «Pausar demo» en la fila de controles y «Pausar fondo» en el footer | 8 |
| Barra angosta con «Conversaciones» y usuario | 9 |
| Sin malla | 11 |
| Inter (los anchos de texto cambian; «Operaciones / Control» corta línea en el sidebar) | 12 |
| Gris del sitio `#595956` | 13 |
| Cabeceras rotuladas «Vista de Finanzas», «Vista de Carla Ruiz (Finanzas)», «Vista de administración»; nota del home | 14 |
| Tabla oculta del gráfico, texto de Centro, lista del flujo | 15 |
| Conversaciones con fecha (dos líneas en el sidebar), log y trazabilidad con «Hoy/Ayer», botón de corrida que pasa a «Deshacer» con un chip «Aprobado ✓» | 16 |
| Chips, pills y compositor que cortan línea | 17 |
| Tabla de aprobación semántica con scroll | 19 |
| Formatos de §3.2 («28,2 %», «31,0», «$11,45 M») | 5 (datos) y §3.2 |

## Contraste (C5)

Pares de la isla sobre colores efectivos (mínimo observado; tabla completa en `c5-contraste-*.txt`): el más bajo es
`#6B6B68 / #EDEDEA` 4,56:1 (Lista/Centro inactivo, «En espera»); los corregidos de §4.9 quedaron `#7A5208 / #F6EBD3` 5,84:1,
`#24613F / #DDEEE3` 6,1:1, `#2F7D52 / #FFFFFF` 5,03:1; el selector del home usa `#595956 / #E6E6E2` 5,62:1. Sitio con textura:
`#595956` sobre `#D1D1D0` 4,6:1 y sobre `#F4F4F2` 6,38:1; el resto ≥ 5,64:1. La trama activa y pausada tiene el mismo punto más oscuro,
así que el peor caso es el mismo en los dos estados.

## Interpretaciones documentadas (sin cambio de spec)

- **Fechas de la demo:** «hoy» es el lunes 5 oct 2026 (así cuadran «lunes 7:00», «pagar el jueves» y «llega el viernes»). Las
  conversaciones ligadas a la corrida de hoy o a la OC llevan «5 oct»; las demás, «2 oct».
- **Trazabilidad y log:** la fila de la OC y la del plan de pago derivan su estado de la OC y de la corrida de Cobranzas; aprobar o
  rechazar en Control agrega «Hoy 10:07 · Carla Ruiz · Finanzas». Los 35 recordatorios y el comprobante conciliado son de «Ayer».
- **Badge y KPI:** con la OC resuelta, «Compras por aprobar» = 0 y el badge de Control no muestra número.
- **OC rechazada en Inicio:** el ítem «Aprobación» se reemplaza por «Pausa · Agente de compras pausado: OC-4471 rechazada por
  Finanzas»; con la OC aprobada, el ítem desaparece. La advertencia de precios queda igual en los tres estados.
- **Stats con dos decimales del diseño** («$11,45 M», «$7,95 M») se conservan literales; los totales de 8b van con uno.
- **Lista:** la columna «Tipo» muestra «Sistema» o «Documental» (el catálogo de §4.7 n.º 9); la descripción queda en Centro.
- **Regiones con scroll:** en SSR siempre llevan `role="region"` y `tabindex="0"`; al hidratar, dejan de serlo si no desbordan (para no
  sumar paradas muertas), salvo que tengan el foco en ese momento.
- **Flujo:** el lienzo es `aria-hidden` y la lista ordenada es su alternativa (visible por debajo de 520 px).
- **Anuncios:** la región se vacía y se escribe 120 ms después, dentro de la misma generación de la secuencia.

## Defectos encontrados y cerrados durante la verificación

| Defecto | Arreglo | Commit |
|---|---|---|
| Deriva acumulada del tipeo (hasta 162 ms al final de la secuencia) | El atraso de cada temporizador se descuenta del siguiente | `93b8529` |
| Una región de scroll enfocada perdía el foco al hidratar | No se le quita el `tabindex` mientras tiene el foco | `93b8529` |
| Tabla oculta del gráfico que ensanchaba la página a 320 | Envuelta en un `div.sr-only` | `93b8529` |
| Placeholder del compositor recortado en el marco de Control a 320 | El compositor corta línea | `93b8529` |
| Región `log` ausente del árbol cuando estaba vacía | Siempre presente | `93b8529` |
| Fila del registro de agentes superpuesta a 320 en EN | La fila corta línea | `f6b0833` |
| «Ver agente» sin anillo de foco en el propio botón | Anillo en el botón | `f6b0833` |

## Riesgo de integración con la fase 4

La rama de la fase 4 agrega una CSP en `<meta>` con `font-src 'self'` y `script-src` por hashes. Sobre la preview de esa rama se vio
que bloquea las fuentes WOFF que Vite incrusta como `data:`; además, la isla agrega scripts inline de Astro (runtime y directiva de
hidratación) cuyos hashes tienen que entrar en la CSP. Hay que revisarlo al integrar las dos ramas.


## Gate de implementación: GATE SÍ (pasada 1, sobre el merge `93fa57c`)

gpt-6.1-sol aprobó la implementación sin hallazgos accionables (`docs/reviews/003-impl-sol-pasada-1.md`). Coincidió con la clasificación de B15 teclado: el salto de controles antes de hidratar responde al contrato de `client:visible` y queda como pendiente 20, y la «trampa ciclo» es un falso positivo del detector de fin de documento. **La fase 3 queda cerrada.** Siguen pendientes 17–20 de `docs/pendientes.md`.
