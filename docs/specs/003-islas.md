# Spec 003 — Islas interactivas: Nocti App y textura de fondo

Estado: APROBADO (GATE SÍ en la pasada 6, con sus hallazgos aplicados) · 2026-10-04

## 1. Contexto

Las fases 1 y 2 dejaron el sitio estático completo. Quedan dos piezas:

- **Los seis embeds de `Nocti App v2`**: hoy son `AppSlot` placeholders, con el contrato de props de spec 002 §4.8.
- **La textura animada de fondo** («Tramado animado», Inv §0.3), que en la fase 2 quedó como diferencia temporal.

**Fuentes:**
- `C:\Users\adria\OneDrive\Escritorio\NoctiLabs Web - deploy\Nocti App v2.dc.html` («App L123»), con 648 líneas: plantilla L1–416 y script L417–646;
- `NoctiLabs Web v3.dc.html` («Web L123»): textura en L638–647 y L659–686, demo por rol en L125–137;
- el inventario `docs/specs/002-inventario-diseno.md` §12 y §0.3.

**Decisiones vigentes:** Astro con React solo en islas; ES + EN; SDD con gpt-6.1-sol; TDD solo en S1; Web Interface Guidelines de Vercel; Inter; Vercel diferido.

## 2. Objetivo

1. Una isla React `NoctiApp` que reproduce la app del diseño (7 vistas, roles, animaciones e interacciones), con datos coherentes, y reemplaza el interior de los seis `AppSlot` sin tocar las secciones.
2. La textura «Tramado animado» detrás de todas las páginas.
3. Las dos cosas accesibles, livianas y en los dos idiomas.

## 3. Arquitectura

### 3.1 Dependencias y configuración

- `@astrojs/react`, `react`, `react-dom`, y `@types/react` y `@types/react-dom` como dev.
- `astro.config.mjs` registra `react()`.
- `tsconfig.json` suma `"jsx": "react-jsx"` y `"jsxImportSource": "react"`.
- `simple-icons` (CC0), con **seis imports estáticos con nombre**: `siSap`, `siHubspot`, `siWhatsapp`, `siGmail`, `siGooglesheets` y `siGoogledrive`. Solo esos paths llegan al bundle, y C8 lo verifica. Así no se depende de `cdn.simpleicons.org`.

### 3.2 Estructura

```
src/islands/noctiapp/
  NoctiApp.tsx          raíz: props, estado de la app (vista, conversación, rol, aprobaciones), hidratación
  controller.ts         máquina de estados del chat y de la rotación de roles (§4.3–4.4)
  shell/                sidebar (ancho), barra compacta (angosto), conversaciones, usuario
  views/                Inicio, Preguntar, Inteligencia, Agentes (lista + detalle), Control, Conexiones, Permisos
  data/es.ts, data/en.ts  datos y copy transcriptos del script de la app con las correcciones de §4.7
  icons.ts              ICONS, SYSICON, FICON y los 6 logos
  app.css               estilos acotados a .nocti-app (tokens de App L15)
```

- **Estilos:** CSS propio. Inline solo en valores calculados, como las posiciones del lienzo de flujos.
- **Datos ES:** transcripción literal del diseño con las correcciones de §4.7.
- **Datos EN:** traducción mía (D4, `docs/pendientes.md`).
- **Números y fechas como datos:** los importes, cantidades, porcentajes y fechas se guardan como números y fechas `YYYY-MM-DD`, no como strings, y se formatean según el idioma con `Intl.NumberFormat` e `Intl.DateTimeFormat` (con `timeZone: 'UTC'`, determinista en SSR):
  - importes: «$18.400.000» / «$18,400,000», y en millones «$48,2 M» / «$48.2M»;
  - porcentajes: «19,4 %» / «19.4%»;
  - registros: «86.120» / «86,120»;
  - fechas cortas: «2 oct» / «Oct 2».

  Solo se traducen labels y prosa. El `replace('.', ',')` de App L636 no se porta.

### 3.3 Integración con `AppSlot`

`AppSlot.astro` conserva sus props (spec 002 §4.8) y el interior pasa a ser:

```astro
<NoctiApp client:visible view={view} locale={locale} contactHref={contactHref} variant={variant} />
```

**SSR determinista:**
- El primer render, tanto en el servidor como en el cliente, es la vista `view` con su estado inicial: sin conversación abierta, sin animación y con el chat vacío en Preguntar.
- Durante el render no se usan APIs del navegador (`window`, `matchMedia`, `localStorage`); esas lecturas van en efectos.

**Antes de hidratar** (y sin JS):
- Se ve la vista inicial completa y legible.
- Los controles que necesitan JS (navegación de vistas, conversaciones, Ver transacciones, aprobar, Lista/Centro, usuario, Pausar demo y el selector de rol) se renderizan **deshabilitados** (`disabled`) y se habilitan al montar.
- «Crear / Integrar» es siempre un `<a href={contactHref}>`, que funciona sin JS.

**Variante `role-demo`** (home): la isla dibuja además el selector de rol y el panel de permisos (§4.4). El rol vive en la isla; no hay comunicación con la página.

**Captions:** vuelven los de Inv §2.2, §2.4 y §2.5 debajo de cada marco de Producto, definidos en el contenido de la sección. Así se restituye la diferencia temporal de la fase 2.

**Estado sin URL:** el estado de cada isla (vista, conversación, rol, aprobaciones, Lista/Centro) es local y efímero; las seis instancias son independientes y no se reflejan en la URL. Es una excepción documentada a «Navigation & State» de las guidelines, porque es una demo.

### 3.4 Textura

`src/scripts/texture.ts`, en TypeScript sin dependencias, se incluye en `Base.astro`:

- **Canvas:** dentro de un contenedor `position: fixed; inset: 0; z-index: -1; pointer-events: none`, con `aria-hidden="true"` (decorativo), detrás de todo el contenido. El canvas lleva `width: 100%; height: 100%; display: block` (Web L755). El `ResizeObserver` observa el **contenedor** fijo, no el canvas: el bitmap (`canvas.width/height`) se calcula desde las dimensiones CSS del contenedor × el DPR limitado, así que cambiarlo no altera el tamaño observado. El `body` lleva `isolation: isolate`.
- **Algoritmo:** el de Inv §0.3, con los parámetros por defecto del diseño: `texDot` 2.1, `texSpacing` 8, `texCoverage` .85, `texIntensity` .15, `texSpeed` 1.7, `texWave` .3, `texDrift` -2.8, `texColor #0B0B0C`, cuadrados.
- **Rendimiento:**
  - un frame cada **62,5 ms (16 fps)** como máximo;
  - `devicePixelRatio` hasta 2;
  - dimensiones cacheadas con `ResizeObserver`, sin leer el layout dentro del bucle;
  - el `requestAnimationFrame` se **cancela** cuando la animación no corre.
- **Cuándo anima:** solo si se cumplen las tres condiciones: sin pausa manual, pestaña visible (`!document.hidden`) y sin `prefers-reduced-motion: reduce`. En cualquier otro caso queda dibujado el último frame, que con reduced motion es uno solo, estático. El cambio de preferencia y de visibilidad se escucha en vivo, y reanudar nunca pisa la pausa manual ni la preferencia del sistema.
- **Contraste del sitio con la textura:** el punto más oscuro de la trama es `#0B0B0C` al 15 % sobre `#F4F4F2`, o sea ≈ `#D1D1D0`. El texto gris del sitio (`--muted`) pasa de `#6B6B68` a **`#595956`** (4,60:1 sobre `#D1D1D0` y 6,38:1 sobre `#F4F4F2`). El resto de los textos sobre el fondo (`--ink`, `--body-2`, `--blue-link`) ya superan 4,5:1 sobre `#D1D1D0`. Diferencia autorizada en §6, que se verifica en C5 sobre todo el sitio, con la textura activa y pausada.
- **Resize en pausa:** un único procedimiento `resizeAndDraw()` actualiza el bitmap y **redibuja una vez** con la fase congelada, sin reactivar el bucle si la animación no corre (pausa, pestaña oculta o reduced motion). Lo disparan el `ResizeObserver` (tamaño y orientación) y un listener de `matchMedia('(resolution: <dpr actual>dppx)')`, que se rearma con el DPR nuevo después de cada cambio.
- **Pausa manual:** un botón de acción con nombre dinámico, «Pausar fondo» / «Animar fondo», sin `aria-pressed`, en la fila inferior del footer. Arranca `hidden` y lo muestra el script al inicializar. Con reduced motion no se muestra, porque no hay nada que pausar.
  - **Persistencia:** la preferencia se guarda en `localStorage`. El acceso, la lectura y la escritura van en `try/catch`; si el almacenamiento falla, la preferencia vive solo en memoria y el control funciona igual.

## 4. Comportamiento

### 4.1 Layout de la app y contenedores

**Contenedores:**
- `.nocti-app-cq`: el wrapper de la isla, con `container-type: inline-size` y `container-name: app`. Mide el ancho del marco donde vive la app.
- `.nocti-app`: el shell, que es descendiente de ese wrapper y se adapta con `@container app (…)`.
- En `role-demo`, la sección que agrupa app y permisos es otro contenedor (`container-type: inline-size; container-name: roledemo`).
- El área del flujo en el detalle de agente es su propio contenedor (`container-type: inline-size; container-name: flow`), y se mide su ancho **disponible**, descontando el sidebar y el padding.

**Cortes:**

| Contenedor | Corte | Efecto |
|---|---|---|
| `app` | 720 px | Sidebar de 216 px por encima; barra compacta por debajo |
| `app` | 860 px | Panel de permisos en línea en Preguntar (sin `role-demo`) |
| `roledemo` | 1100 px | Panel de permisos al costado (§4.4) |
| `flow` | 520 y 800 px | Lienzo de flujos (§4.5), según el ancho disponible del área del flujo |

**Ancho:** sidebar con navegación por vistas (`aria-current="page"` en la vista activa), conversaciones fijadas y recientes, y tarjeta de usuario (App L16–42).

**Estados de selección accesibles** (no solo con estilos, WCAG 4.1.2):
- la barra angosta de vistas es una navegación con `aria-label` («Vistas» / «Views») y el mismo `aria-current="page"` en la vista activa. Aunque se vea como tabs, **no** es un tablist APG: son botones en una navegación, con Tab entre ellos;
- la conversación abierta lleva `aria-current="true"`, en el sidebar y en el disclosure angosto;
- Lista/Centro (Conexiones, App L316, L610–612) es un grupo con `aria-label` («Presentación» / «Layout») de dos botones, con exactamente un `aria-pressed="true"`.

**Angosto** (diferencia autorizada, porque en el diseño se perdían conversaciones y usuario):
- una barra con las 7 vistas en tabs horizontales con scroll (App L43–49);
- un botón «Conversaciones» (disclosure, `aria-expanded`) que despliega las 5 conversaciones;
- el botón de usuario (§4.6).

**Alto mínimo:** 560 px.

### 4.2 Vistas

Las 7 vistas de Inv §12.3 con su contenido y sus estados:

- `drill` (Ver/Ocultar transacciones);
- `agentOpen` y aprobación por agente;
- la OC-4471 (§4.8);
- Lista/Centro en Conexiones, coherentes según §4.7. La variante «malla», inalcanzable en el diseño, no se porta.

La vista inicial es la prop `view`.

### 4.3 Chat animado (vista Preguntar) y controlador

**Secuencia** (App L525–539):
0. Espera inicial de 500 ms (App L530), sujeta a la misma pausa y cancelación del controlador.
1. El tipeo de la pregunta, a 28 ms por carácter, más 30 ms en los espacios.
2. La burbuja, a los +450 ms.
3. «Consultando contexto · {rol}», a los +350 ms; el punto pulsa cada 380 ms y cada fuente aparece a los +380 ms.
4. La respuesta, a los +650 ms, con un ítem cada 520 ms.
5. El pie, a los +450 ms.
6. Fin, a los +5200 ms.

**Controlador** (`controller.ts`, local a cada isla): una sola fuente de temporizadores, con un token de generación que invalida todos los callbacks pendientes cuando la secuencia se reemplaza. Transiciones:

| Evento | Efecto |
|---|---|
| Entrar a Preguntar o cambiar de rol | Limpia `convo`, cancela la secuencia anterior y arranca una nueva cuando el disparador de visibilidad lo permite |
| Abrir una conversación del sidebar | Cancela la secuencia y muestra esa conversación completa, estática, actualizando rol, persona y permisos a los de la conversación |
| Salir de Preguntar | Cancela la secuencia, el repetido y la rotación |
| Pausar demo | Congela la etapa actual y el tiempo restante; no corre ningún temporizador |
| Reanudar demo | Continúa desde la etapa y el tiempo congelados |
| Fin de secuencia | `role-demo`: pasa al rol siguiente, si la rotación sigue activa. Resto: repite, si no está en pausa |
| Elección manual de rol | Desactiva la rotación para siempre en esa carga, aunque después se pause y reanude |

**Disparador de visibilidad:** se observa la **fila de controles** de Preguntar, una franja persistente anterior a la conversación que contiene «Pausar demo», con `IntersectionObserver` y threshold 0. Es el mismo nodo durante toda la secuencia, así que mostrar la pregunta o cada ítem no la mueve fuera de pantalla. No se observa la isla entera ni el saludo, que desaparece.

**Condición única para avanzar:** la secuencia avanza solo si (a) la fila está visible, (b) no hay **pausa manual** y (c) no hay reduced motion. Si una deja de cumplirse, la secuencia se congela; cuando las tres vuelven a cumplirse, continúa. La pausa manual se conserva al salir y volver a pantalla, al cambiar de rol y al abrir conversaciones. Si se elige un rol estando en pausa, se muestra su respuesta completa y estática. Al salir de reduced motion vale la misma condición.

**Accesibilidad:**
- **Animación automática:** la región de la conversación es `role="log"` con `aria-live="off"`, así que no se anuncian caracteres, pulsos ni fuentes.
- **Anuncios manuales:** hay además una región `aria-live="polite"` persistente, visualmente oculta. Anuncia **una vez** la respuesta completa:
  - **al abrir una conversación**, que se muestra estática, de inmediato;
  - **al elegir un rol**, en cuanto se muestra el pie (paso 5), **antes** de los 5200 ms de permanencia y del evento de fin (repetición o rotación); o de inmediato si está en pausa o con reduced motion. La escritura en dos ticks termina dentro de esa permanencia, así que el fin de la secuencia no la cancela. Las secuencias que arrancan solas (repetición, rotación o la carga inicial) no anuncian nada.

  Para que un texto idéntico se vuelva a anunciar, la región se vacía y se escribe en un tick posterior. Las dos escrituras pertenecen a la generación de la secuencia, y si esta se reemplaza, el anuncio pendiente se descarta.
- **«Pausar demo» / «Reanudar demo»:** un botón de acción con nombre dinámico, sin `aria-pressed`, en la **fila de controles** de Preguntar (WCAG 2.2.2).
- **Reduced motion** (inicial y en vivo): sin tipeo, sin aparición escalonada, sin pulso, sin rotación y sin repetido. La conversación aparece completa y estática.

### 4.4 Demo por rol (home, `variant="role-demo"`)

- **Selector:** CEO, Comercial, Operaciones y Agentes. Es un grupo de botones con `aria-pressed`, porque cambia el rol de un único contenido y no son tabs APG. Va con `aria-label` «Ver como» / «View as» y la estética SEG de Inv §1.3.
- **Rotación:** automática al terminar cada secuencia (ceo → comercial → operaciones → agentes → ceo), según la tabla de §4.3.
- **Panel de permisos** («Permisos de este rol / Contexto consultado»):
  - con `roledemo` ≥ 1100 px, a la derecha del marco en una columna de 240 px;
  - por debajo, debajo del marco, alineado a la derecha;
  - nunca fuera del ancho de la sección: el diseño medía `window` y podía salirse (Inv §11.25).
- **Chips internos «Ver como»:** ocultos en `role-demo`. En la variante normal se muestran con el **mismo contrato** que el selector externo: grupo con `aria-label` «Ver como» / «View as», botones con `aria-pressed={role === key}` y exactamente un rol activo. El estado no depende solo del color (App L86–88, L634). Al abrir una conversación que cambia el rol, `aria-pressed` se actualiza al rol de la conversación.

### 4.4b Alcance de «Ver como»

El rol simulado («Ver como» y el selector de `role-demo`) solo cambia la vista **Preguntar**: respuesta, fuentes y panel de permisos. Las otras vistas muestran **un ejemplo fijo de un rol**, rotulado en su cabecera:

- «Inteligencia · vista de Finanzas»;
- «Operaciones / Control · vista de Carla Ruiz (Finanzas)»: las acciones se registran a su nombre en la trazabilidad;
- «Agentes · vista de administración».

La nota de la sección del home (Web L136) pasa a «En Preguntar, cada persona y cada agente ven únicamente lo que sus permisos permiten.» / «In Ask, each person and each agent sees only what their permissions allow.».

### 4.5 Agentes: detalle con flujo

**Lienzo:** 800 px de ancho y **alto mínimo 430 px**, con 5 columnas, 10 tarjetas con logo o ícono y curvas SVG punteadas. Las posiciones no son porcentajes fijos (App L242–250, L426–434, L471): cada columna es una pila vertical centrada con 16 px de separación entre tarjetas, con el ancho de tarjeta del diseño, y el lienzo crece hasta el alto de la columna más alta más el padding. Así las tarjetas con datos corregidos o texto EN, que cortan línea, no se superponen. Las curvas se calculan desde las posiciones medidas de las tarjetas (con `ResizeObserver` y al cambiar de estado o de idioma); sin JS no se dibujan, porque son decorativas (`aria-hidden`) y el orden ya está en la descripción textual. Según el ancho disponible del contenedor `flow`:

| Ancho del contenedor `flow` | Presentación |
|---|---|
| ≥ 800 px | Lienzo a tamaño natural |
| 520–799 px | Lienzo a tamaño natural dentro de una región con scroll horizontal (`tabindex="0"`, `role="region"`, `aria-label` «Flujo del agente»), sin escalar el texto |
| < 520 px | Lista vertical de las 10 tarjetas en orden de columna, con el mismo contenido |

**Curvas** (`stroke-dashoffset`): `repeatCount="3"` (menos de 5 s) y después quedan quietas. Con reduced motion, sin animación. El SVG lleva `aria-hidden`, y el lienzo tiene una **descripción textual** localizada: la lista de pasos en orden de columna, con lo que depende de cada uno («Priorizar y proponer acción usa facturas, historial y respuestas; de ahí salen…») y cuál espera aprobación. Es la misma lista de la presentación angosta, visualmente oculta en las otras dos.

**Aprobar / desaprobar:** cambia las tarjetas, el pill y el botón como en el diseño. En el agente de compras, actúa sobre el estado único de la OC-4471 (§4.8).

**Tarjetas en espera:** se atenúan con opacidad solo en bordes e íconos. El texto queda opaco (§4.9).

### 4.6 Elementos ilustrativos

Los controles sin acción del diseño son **contenido ilustrativo**:

- «Ver análisis»;
- la acción de cada respuesta;
- «Crear alerta»;
- «+ Conectar fuente»;
- el secundario del detalle de agente;
- el compositor del chat (App L135–140);
- su botón de envío.

Se dibujan con su forma, pero sin cursor de mano, sin hover y sin estados de botón, como `<span>`/`<div>`, fuera del orden de Tab. El compositor muestra el texto que se tipea, pero no es un campo editable.

**Usuario:** un disclosure (`<button aria-expanded>` y un panel con nombre, rol e idioma como texto), no un menú de acciones. Se cierra con Esc (el foco vuelve al botón) y con un click fuera.

### 4.7 Coherencia de datos

Las correcciones siguientes aplican a ES y EN y a **todas** las apariciones de cada dato. El resto de los valores se transcribe literal.

| # | Dato | Valor coherente |
|---|---|---|
| 1 | Saludo | «Hola, {nombre}.» / «Hi, {name}.» en Inicio y Preguntar. Con el rol agentes: «Hola.» / «Hi.» |
| 2 | Umbral de aprobación de compras | $15.000.000 en Control, Permisos y el flujo de Compras |
| 3 | Aprobaciones | KPI de Inicio «Compras por aprobar» = 1 (derivado de la OC, §4.8), y lo mismo el badge y el encabezado de Control. Los lotes de los agentes van aparte (§4.8): Cobranzas «Aprobaciones pendientes: 1» (no 2) y Comercial 1. «Agentes activos: 2» (Cobranzas y Comercial; Compras pausado) |
| 4 | Recordatorios | Corrida de **hoy**: prepara 38 y espera aprobación. Actividad reciente, rotulada como corrida de **ayer**: «Ayer: Agente de cobranzas envió 35 recordatorios.» |
| 5 | Antigüedad de deuda (intervalos disjuntos y exhaustivos) | Total vencido $48.200.000 en 312 facturas: **1–30 días** $9.840.000 (38 clientes, recordatorio); **31–90 días** $21.300.000 (12 clientes, plan de pago); **más de 90 días** $17.060.000 (7 clientes, pasan a comercial). Más de 30 días = $38.360.000, que se redondea a «$38,4 M». El CEO dice «$38,4 M vencidos a más de 30 días». La regla del flujo: «31 a 90 días → plan de pago; más de 90 → comercial». Los montos se calculan con los valores exactos y se muestran en millones con un decimal |
| 5b | Clientes con deuda en la corrida | 57 (38 + 12 + 7). Las apariciones de «186 clientes con deuda» (flujo de Cobranzas y su resultado) pasan a «57 clientes con deuda vencida». |
| 6 | Pedidos retenidos | 12: 8 por falta de stock del SKU 4410 y 4 por crédito (clientes con deuda de más de 90 días). La respuesta de Operaciones dice «12 pedidos retenidos: 8 por falta de stock del SKU 4410 y 4 por crédito» |
| 7 | Supermercados Delta | −28 % en todas las apariciones |
| 8 | Conteos de las respuestas | CEO: «tres temas» (no «dos»); la conversación de L478: «tres clientes» (no «cuatro») |
| 8b | Totales de Comercial y Compras | Se guardan los montos exactos de las filas y los totales se derivan: Comercial $6.200.000 + $11.450.000 + $3.900.000 = $21.550.000, que se muestra «$21,6 M en juego» (no «$21,5 M»); Compras $18.400.000 + $7.950.000 + $2.300.000 = $28.650.000, que se muestra «$28,7 M a reponer» (no «$28,6 M»). En millones con un decimal, redondeo a la mitad hacia arriba, igual que el n.º 5 |
| 8c | Advertencia de precios de Compras | «Agente de compras: proveedor sin lista de precios vigente» (Inicio, App L493) es una **advertencia** independiente de la OC: no pausa la corrida ni cuenta como aprobación pendiente, y queda igual en los tres estados de la OC. En Inicio va rotulada como advertencia («Advertencia» / «Warning»), separada del ítem de la OC en «Requiere tu atención». |
| 9 | Catálogo de fuentes | Una sola tabla, con id, nombre, tipo y registros; de ella se derivan Lista, Centro, el badge (8), los pies de fuentes y el «Contexto consultado»:<br>`erp` SAP · ERP (incluye el módulo de depósito/WMS), sistema, 2,4 M<br>`crm` HubSpot · CRM, sistema, 86.120<br>`drive` Google Drive, sistema, 12.408<br>`planillas` Google Sheets, sistema, 214<br>`whatsapp` WhatsApp Business, sistema, 31.950<br>`correo` Correo (Gmail), sistema, 58.300<br>`documentos` Contratos y políticas, documental, 1.120<br>`conocimiento` Conocimiento interno (procesos, reglas y entrevistas), documental, 342<br>**Centro** = los 6 sistemas, rotulado «6 sistemas · las 8 fuentes en Lista». Las menciones de «WMS» pasan a «ERP · Depósito». El «Contexto consultado» de cada rol y los pies de fuentes salen de las fuentes de su respuesta o corrida (Cobranzas: SAP · HubSpot · WhatsApp). Las **referencias específicas** son pares `{ sourceId, label }` que apuntan a una de las 8 fuentes y conservan su etiqueta: «Tablero de ventas» → `erp`, «Lista de precios.xlsx» → `planillas`, «Contrato Plastar 2026.pdf» → `documentos`, «Política de compras» → `conocimiento`. Ninguna referencia queda sin fuente. |

### 4.8 OC-4471 y aprobaciones: un estado por isla

La OC-4471 tiene **un solo estado** en cada isla (`pending | approved | rejected`). De ese estado se derivan **todas** sus representaciones: la tarjeta y la trazabilidad de Control; el contador de Control y el KPI «Compras por aprobar» de Inicio; el ítem de Inicio en «Requiere tu atención»; y, en el agente de compras, su tarjeta de lista (estado y «Aprobaciones pendientes», que reemplaza a «Excepciones pendientes»), el pill, la tarjeta «OC-4471 a Plastar S.A.», el resultado «$18,4 M / …» y la nota.

| Desde | Acción | Estado resultante |
|---|---|---|
| Control | Aprobar | `approved` |
| Control | Rechazar | `rejected` |
| Control | Deshacer | `pending` |
| Flujo de Compras | Aprobar (con `pending`) | `approved` |
| Flujo de Compras | Deshacer (con `approved`) | `pending` |
| Flujo de Compras con `rejected` | — | La tarjeta muestra «Rechazada en Control» y el botón queda deshabilitado con ese texto. Se vuelve a `pending` solo con «Deshacer» en Control |

El foco queda en el botón de la acción siguiente («Deshacer» o «Aprobar»).

**Anuncio del resultado:** cada isla tiene una región persistente `role="status"`, visualmente oculta, que anuncia **una frase localizada por acción manual** (aprobar, rechazar o deshacer, sobre la OC o sobre una corrida), con qué cambió y su estado resultante: «OC-4471 a Plastar S.A. aprobada. El agente de compras retoma la ejecución.» / «Corrida de cobranzas aprobada: planes de pago y recordatorios en ejecución.» / «OC-4471 vuelve a pendiente de aprobación.», y sus equivalentes EN. Las representaciones derivadas (contadores, pills, tarjetas) no son vivas, para no duplicar anuncios. Con la misma técnica que el chat (vaciar y escribir en un tick posterior) se anuncia también una acción que repite el texto anterior.

**Estado del agente de compras y totales**, derivados de la OC:

| OC | Agente de compras (tarjeta, pill y nota) | «Agentes activos» (Inicio) y encabezado de Agentes |
|---|---|---|
| `pending` | «Pausado · 1 aprobación pendiente» | 2 activos · 1 pausado |
| `approved` | «Activo · ejecutando acciones» | 3 activos |
| `rejected` | «Pausado · orden rechazada por Finanzas» | 2 activos · 1 pausado |

**Corridas de los agentes:** la aprobación de Cobranzas y la de Comercial aprueban **la corrida completa** del agente, es decir, todas las salidas en espera de su flujo:
- Cobranzas: planes de pago a 12 clientes y los 38 recordatorios;
- Comercial: cotizaciones de 9 reposiciones y los 14 seguimientos.

El botón lo dice: «Aprobar corrida (planes de pago y recordatorios)» / «Approve run (payment plans and reminders)», y análogo para Comercial; «Deshacer» la revierte. Cada corrida tiene un estado (`pending | approved`), del que derivan su tarjeta de lista («Aprobaciones pendientes: 1 → 0»), su pill, las tarjetas de su flujo y su resultado. El log «últimas tareas» y la trazabilidad llevan fecha y hora («Hoy 09:42», «Ayer 18:10»), separando lo histórico de la corrida de hoy.

**Conversaciones:** son registros históricos y llevan una fecha visible («2 oct», «1 oct»…), así que su texto no cambia con el estado.

Las seis instancias de la app no comparten estado.

### 4.9 Accesibilidad de la isla

- **Raíz:** una `section` con `aria-label` «Demo interactiva de Nocti, con datos ilustrativos» / «Interactive Nocti demo with illustrative data».
- **Teclado:** foco visible en todos los controles; navegación de vistas y conversaciones, Ver transacciones, tarjetas de agente, Aprobar/Rechazar/Deshacer, Lista/Centro y usuario operables con teclado; sin controles muertos (§4.6).
- **Contraste:** se mide sobre los **colores efectivos**, después de opacidad y fondo, contra 4,5:1 en texto y 3:1 en indicadores de estado necesarios. Ya identificados:

  | Par (texto / fondo) | Contraste | Corrección |
  |---|---|---|
  | `#8A8A86` / blanco | 3,5:1 | `#6B6B68` |
  | `#9A9A96` / blanco | 2,8:1 | `#6B6B68` |
  | warn `#9A6A0E` / `#F6EBD3` | 3,99:1 | texto `#7A5208` |
  | success `#2F7D52` / `#DDEEE3` | 4,17:1 | texto `#24613F` |
  | `#6FAE88` / blanco (App L593) | 2,6:1 | `#2F7D52` |
  | texto de tarjeta en espera con opacidad .55 | ~2,2:1 | texto opaco (§4.5) |

  Cualquier otro par por debajo del umbral que aparezca en la medición se corrige igual y se suma a la tabla de la evidencia.
- **Regiones con scroll horizontal:** las tablas de Transacciones (Inteligencia), Trazabilidad (Control), Lista (Conexiones) y Permisos, la tabla de aprobación del detalle de agente («Acción propuesta / Clientes o SKUs / Monto», App L265), que pasa a ser un `<table>` semántico con encabezados de columna y un ancho mínimo de 360 px en lugar de la grilla `minmax(0,1fr) 70px 110px`, la vista Centro (700 px) y el flujo (§4.5) van dentro de un wrapper con `overflow-x: auto`. Cuando su contenido desborda, el wrapper es `role="region"` con `aria-label` («Tabla de transacciones», etc.) y `tabindex="0"`, de modo que se puede llegar con teclado, desplazarse con las flechas hasta los dos extremos y salir con Tab. En el SSR el wrapper ya lleva `tabindex="0"`, así que también funciona sin JS.
- **Árbol de accesibilidad:** curvas, íconos decorativos y el canvas de la textura con `aria-hidden`.
- **Alternativas textuales:**
  - el flujo de Agentes (§4.5);
  - la vista Centro (texto que enumera los sistemas, el contexto y los usos que alimenta);
  - el gráfico de Inteligencia: una tabla visualmente oculta con semana → porcentaje (S1–S8) y la variación destacada.
- **Foco al navegar:** abrir el detalle de un agente lleva el foco a su título; «← Agentes» vuelve a la lista con el foco en la tarjeta de ese agente.

## 5. Fuera de alcance

- Datos reales: la demo usa los datos ilustrativos del diseño.
- Formulario, SEO, analítica y legales: fase 4.
- Filtros de Insights: fase 5.

## 6. Diferencias autorizadas respecto del diseño

1. Panel de permisos dentro del ancho de la sección (§4.4).
2. Flujo con scroll horizontal entre 520 y 799 px, y lista por debajo de 520 px (§4.5).
3. Curvas de Agentes y de Centro animadas 3 veces y quietas después (§4.5, §4.2).
4. Elementos ilustrativos no interactivos, y el usuario como disclosure (§4.6).
5. Datos coherentes (§4.7) y OC-4471 con estado único (§4.8).
6. Avatares de iniciales en lugar de `i.pravatar.cc` (§4.10).
7. Contrastes corregidos (§4.9).
8. «Pausar demo» y «Pausar fondo» (§4.3, §3.4).
9. Acceso a conversaciones y usuario en angosto (§4.1).
10. Controles deshabilitados hasta hidratar (§3.3).
11. Sin la variante «malla» de Conexiones.
12. Inter, como en las fases anteriores.
13. `--muted` del sitio oscurecido a `#595956` por el contraste sobre la textura (§3.4).
14. Alcance de «Ver como» limitado a Preguntar, con las demás vistas rotuladas como ejemplos de un rol y la nota del home ajustada (§4.4b).
15. Alternativas textuales del flujo, de Centro y del gráfico (§4.9).
16. Lotes de los agentes con estado propio y conversaciones con fecha visible (§4.8).
17. **Reflow de controles:** los botones de aprobación (App L273, `white-space: nowrap`), el pill de estado del agente («Necesita tu aprobación»), los chips y la fila de envío del compositor (App L137–140, sin `flex-wrap`) y las demás filas auxiliares cortan línea o se apilan según el ancho disponible: `max-width: 100%`, texto envolvente (`white-space: normal`) y `flex-wrap: wrap` donde corresponda. Es la única desviación visual: en el ancho del diseño se ven igual, porque ahí entran en una línea.
18. **Flujo de agentes con alto según el contenido** y curvas calculadas desde las posiciones reales (§4.5).
19. **Tabla de aprobación semántica y desplazable** en el detalle de agente (§4.9).

### 4.10 (anexo) Avatares

Los avatares de `i.pravatar.cc`, que son fotos de terceros, se reemplazan por avatares de iniciales: un círculo de 30 px con las iniciales, sobre un color fijo por persona tomado de la paleta de la app, con contraste ≥ 4,5:1. El agente conserva su ícono de bot azul.

## 7. Pruebas

TDD solo en S1, que esta fase no toca. Se verifica a mano con Chrome headless por CDP sobre `astro preview`, y la evidencia va en `docs/evidence/003/`.

## 8. Criterios de aceptación

| # | Criterio | Cómo se verifica |
|---|---|---|
| C1 | Build sin errores ni warnings y `npm test` en verde. | Salida (código de salida). |
| C2 | **Fidelidad por matriz:** 7 vistas, más los estados (conversación abierta, transacciones abiertas, detalle de los 3 agentes pendiente y aprobado, OC aprobada, rechazada y deshecha, Lista y Centro, usuario abierto) × los 4 roles en Preguntar × variantes (`role-demo` y normal) × **casos de ancho alcanzables**: cada caso fija **un** contenedor objetivo a un lado de su corte (`app` 719/720 y 859/860; `flow` 519/520 y 799/800; `roledemo` 1099/1100) eligiendo el ancho de página o del embed que lo produce, y registra los anchos derivados de los demás contenedores (por ejemplo, con `app` = 720, `flow` ≈ 464). Se suman 360 y el ancho real de cada marco a 1440 y 390. Todo × ES y EN. Capturas lado a lado contra la app del diseño en ES, y EN de forma estructural. Diferencias: solo las de §6. | Matriz en el README de la evidencia + capturas. |
| C3 | **Interacciones** (con el contrato de §4.8 para la OC: rechazo solo desde Control, reflejado en Compras), con teclado y mouse, en ancho y en angosto: navegación de vistas y conversaciones (también desde el disclosure angosto); secuencia del chat con sus tiempos; cada transición de la tabla de §4.3 (rol, abrir conversación, salir de Preguntar, pausar y reanudar conservando la etapa, rotación detenida por elección manual aunque se pause y reanude); Ver/Ocultar transacciones; aprobar y desaprobar en los 3 agentes; OC-4471: aprobar y deshacer desde Control y desde Compras, y rechazar solo desde Control, verificando su reflejo en Compras, en Inicio, en los contadores y en los totales de agentes (§4.8); aprobar y deshacer las corridas de Cobranzas y Comercial; Lista/Centro; usuario (Esc y click fuera); «Crear / Integrar» como link. Con viewport bajo (1280×400) y zoom 200 %, el chat arranca al entrar la cabecera y se pausa al salir. | Escenario CDP. |
| C4 | **Reduced motion** (inicial y en vivo): chat completo y estático, sin rotación ni curvas animadas (Agentes y Centro); la textura queda en un frame. | Escenario CDP con media emulada. |
| C5 | **Accesibilidad:** sin controles muertos en el orden de Tab; regiones con scroll a 320 px: **con JS**, todas las regiones de §4.9 (incluida la tabla de aprobación dentro del marco real de Control); **sin JS**, las regiones presentes en las vistas SSR iniciales de cada embed. En cada una: llegar con teclado, recorrer hasta los dos extremos y leer todas las columnas; flujos de los tres agentes en ES y EN, en pendiente, aprobado y (Compras) rechazado, sin superposiciones ni recortes; los dos selectores de rol con exactamente un `aria-pressed="true"` después de elegir un rol y de abrir una conversación que lo cambia; `aria-current` de la vista (ancho y angosto) y de la conversación, y `aria-pressed` de Lista/Centro, después de cada cambio; la región `role="status"` escribe una sola frase por aprobar, rechazar y deshacer (OC y corridas), con la misma distinción entre «contrato DOM verificado» y «anuncio comprobado»; nombres y roles (árbol de accesibilidad); foco visible y foco final de cada acción (§4.8 y el detalle de agente de §4.9); alternativas textuales del flujo, de Centro y del gráfico; contraste ≥ 4,5:1 de los textos del sitio sobre la textura (peor caso `#D1D1D0`), con la textura activa y pausada; anuncio único de la respuesta en las interacciones manuales y silencio en la animación automática. Se registra **cuándo** se escribe cada región viva (MutationObserver) en estos recorridos: reproducción automática, elección manual, elegir un rol en la variante normal hasta la repetición (una sola escritura completa y ningún anuncio del ciclo automático), la misma conversación abierta dos veces y una secuencia cancelada antes del anuncio. C5 distingue **«contrato DOM verificado»** (qué y cuándo se escribe en cada región, con MutationObserver) de **«anuncio comprobado»** (con un lector de pantalla real). Sin un lector en la máquina, el segundo **queda pendiente**, no se da por aprobado, y se registra en `docs/pendientes.md` como verificación con NVDA o VoiceOver antes del lanzamiento; contraste medido sobre colores efectivos (tabla completa); reflow a 320 px del embed y zoom 200 % sin pérdida de contenido, comprobando en ES y EN, a 320 px y dentro de los marcos reales de Producto, los controles de §6.17: los botones «Aprobar corrida …» / «Approve run …», los chips y la fila de envío del compositor, enteros y sin recorte. | CDP + cálculo de contraste. |
| C6 | **Sin JS y carga lenta:** sin JS, cada embed muestra su vista inicial estática, legible y con los controles deshabilitados, y «Crear / Integrar» funciona. Con la red lenta (CDP) se ve lo mismo hasta hidratar, y después todo queda operable. | CDP con scripts deshabilitados y con red emulada. |
| C7 | Cero errores de consola en todas las rutas. | CDP. |
| C8 | **Peso de JS por página** (método de A10, con imports dinámicos e inline): sin isla, ≤ 8192 B de la fase 2 + ≤ 3 KB de la textura, y **sin React**; con isla, eso más ≤ 110 KB de React, la app y el runtime de hidratación de Astro, con los módulos compartidos contados una vez. Solo los 6 paths de simple-icons llegan al bundle (búsqueda en `dist/`). | Inventario por página. |
| C9 | **Textura:** detrás del contenido, sin taparlo; ≤ 16 fps; pausa con la pestaña oculta, el control del footer y reduced motion, con la precedencia de §3.4; preferencia persistente y control funcional con `localStorage` bloqueado. **Rendimiento:** escenario de referencia registrado en la evidencia: CPU, GPU, RAM y SO de la máquina; versión de Chrome; sin throttling; página `/nosotros/`, sin video ni otras animaciones; 1440×900. Se toman trazas CDP (`Tracing`, categorías de scripting, rendering, painting y composición) de 10 s con la textura activa y otras de 10 s con la textura pausada, a DPR 1 y DPR 2. Umbral: **(ocupación activa − ocupación pausada) / 10.000 ms < 0,15**, donde la ocupación es la suma de la unión de los intervalos de tareas de nivel superior del hilo principal del renderer (eventos `RunTask` de `CrRendererMain`, sin contar dos veces los anidados) en la ventana de 10 s. La composición y la GPU en otros hilos se registran aparte, con su propio tiempo, sin entrar en el umbral. La evidencia adjunta los valores y el cálculo de cada traza, sin tareas largas (> 50 ms) atribuibles a la textura y con ≤ 16 fps del canvas. La superficie CSS del canvas cubre todo el viewport (rect igual al del viewport). **Resize en pausa:** con pausa manual y con reduced motion, al cambiar el tamaño, la orientación (emulada) y el DPR (1 → 2 → 1, con `Emulation.setDeviceMetricsOverride`), el canvas se redibuja con el bitmap correcto y no reaparece el bucle (cero frames nuevos después del redibujo). | CDP. |
| C10 | **EN:** 7 vistas, chat de los 4 roles, las 5 conversaciones, los 3 flujos y los mensajes de aprobación en inglés en `/en/`, con los formatos de §3.2 verificados en ejemplos concretos (un importe, un importe en millones, un porcentaje, un conteo y una fecha, en ES y EN). | Capturas + recorrido. |
| C11 | Las correcciones de §4.7 (incluidas 5b, 8b y 8c, con las sumas recalculadas desde las filas y los dos ítems de Compras en Inicio, la OC y la advertencia de precios, en los tres estados de la OC) y los estados de §4.8 (OC y los dos lotes, con todas sus representaciones derivadas) se cumplen en todas sus apariciones, en ES y EN. Tabla dato → apariciones → valor observado. | Recorrido + búsqueda en los datos. |
| C12 | **Regresión** de las fases anteriores: checklist del header (A7, 78 casos), B4, B5, B9, B10, B11 (actualizado al presupuesto C8) y B15 de la fase 2. | Re-ejecución. |
| C13 | gpt-6.1-sol aprueba el spec antes de empezar y la implementación con la evidencia C1–C12 sobre un mismo commit. | Veredicto con hash. |

## 9. Plan

1. **Configuración de React** (§3.1), `icons.ts` y los datos ES con las correcciones de §4.7. Se verifica con C1 y C11.
2. **Shell** (ancho y angosto, conversaciones, usuario) e **Inicio, Inteligencia, Control (con §4.8), Conexiones (coherente) y Permisos.** Se verifica con C2 y C3.
3. **Controlador, Preguntar y demo por rol.** Se verifica con C3, C4 y C5.
4. **Agentes:** lista, detalle y flujo con sus tres presentaciones. Se verifica con C2 y C3.
5. **`AppSlot` con la isla, SSR determinista y captions de Producto.** Se verifica con C6 y C12.
6. **Datos EN.** Se verifica con C10.
7. **Textura y su control.** Se verifica con C4 y C9.
8. **Contraste, peso, consola, evidencia y gate.** Se verifica con C5, C7, C8 y C13.
