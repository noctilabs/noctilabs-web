# Spec 003 — Islas interactivas: Nocti App y textura de fondo

Estado: borrador, pasada 2 de revisión · 2026-10-04

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

- **Canvas:** dentro de un contenedor `position: fixed; inset: 0; z-index: -1; pointer-events: none`, con `aria-hidden="true"` (decorativo), detrás de todo el contenido. El `body` lleva `isolation: isolate`.
- **Algoritmo:** el de Inv §0.3, con los parámetros por defecto del diseño: `texDot` 2.1, `texSpacing` 8, `texCoverage` .85, `texIntensity` .15, `texSpeed` 1.7, `texWave` .3, `texDrift` -2.8, `texColor #0B0B0C`, cuadrados.
- **Rendimiento:**
  - un frame cada **62,5 ms (16 fps)** como máximo;
  - `devicePixelRatio` hasta 2;
  - dimensiones cacheadas con `ResizeObserver`, sin leer el layout dentro del bucle;
  - el `requestAnimationFrame` se **cancela** cuando la animación no corre.
- **Cuándo anima:** solo si se cumplen las tres condiciones: sin pausa manual, pestaña visible (`!document.hidden`) y sin `prefers-reduced-motion: reduce`. En cualquier otro caso queda dibujado el último frame, que con reduced motion es uno solo, estático. El cambio de preferencia y de visibilidad se escucha en vivo, y reanudar nunca pisa la pausa manual ni la preferencia del sistema.
- **Pausa manual:** un `<button aria-pressed>` «Pausar fondo» / «Animar fondo» en la fila inferior del footer.
  - **Persistencia:** la preferencia se guarda en `localStorage`. El acceso, la lectura y la escritura van en `try/catch`; si el almacenamiento falla, la preferencia vive solo en memoria y el control funciona igual.

## 4. Comportamiento

### 4.1 Layout de la app y contenedores

**Contenedores:**
- `.nocti-app-cq`: el wrapper de la isla, con `container-type: inline-size` y `container-name: app`. Mide el ancho del marco donde vive la app.
- `.nocti-app`: el shell, que es descendiente de ese wrapper y se adapta con `@container app (…)`.
- En `role-demo`, la sección que agrupa app y permisos es otro contenedor (`container-name: roledemo`).

**Cortes:**

| Contenedor | Corte | Efecto |
|---|---|---|
| `app` | 720 px | Sidebar de 216 px por encima; barra compacta por debajo |
| `app` | 860 px | Panel de permisos en línea en Preguntar (sin `role-demo`) |
| `roledemo` | 1100 px | Panel de permisos al costado (§4.4) |
| `app` | 520 y 800 px | Lienzo de flujos (§4.5) |

**Ancho:** sidebar con navegación por vistas (`aria-current="page"`), conversaciones fijadas y recientes, y tarjeta de usuario (App L16–42).

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
| Abrir una conversación del sidebar | Cancela la secuencia y muestra esa conversación completa, estática |
| Salir de Preguntar | Cancela la secuencia, el repetido y la rotación |
| Pausar demo | Congela la etapa actual y el tiempo restante; no corre ningún temporizador |
| Reanudar demo | Continúa desde la etapa y el tiempo congelados |
| Fin de secuencia | `role-demo`: pasa al rol siguiente, si la rotación sigue activa. Resto: repite, si no está en pausa |
| Elección manual de rol | Desactiva la rotación para siempre en esa carga, aunque después se pause y reanude |

**Disparador de visibilidad:** se observa un **bloque acotado**, la cabecera de la vista Preguntar (el saludo y el compositor), con `IntersectionObserver` y threshold 0. Entrar en pantalla arranca o reanuda la secuencia automática; salir la pausa (es una pausa automática, distinta de la manual). No se observa la isla entera, que puede ser más alta que el viewport.

**Accesibilidad:**
- **Animación automática:** la región de la conversación es `role="log"` con `aria-live="off"`, así que no se anuncian caracteres, pulsos ni fuentes.
- **Anuncios manuales:** hay además una región `aria-live="polite"` persistente, visualmente oculta. Cuando la secuencia fue disparada por una **acción del usuario** (elegir un rol o abrir una conversación), anuncia **una vez** la respuesta completa al terminar.
- **«Pausar demo» / «Reanudar demo»:** un botón con `aria-pressed` en la cabecera de Preguntar (WCAG 2.2.2).
- **Reduced motion** (inicial y en vivo): sin tipeo, sin aparición escalonada, sin pulso, sin rotación y sin repetido. La conversación aparece completa y estática.

### 4.4 Demo por rol (home, `variant="role-demo"`)

- **Selector:** CEO, Comercial, Operaciones y Agentes. Es un grupo de botones con `aria-pressed`, porque cambia el rol de un único contenido y no son tabs APG. Va con `aria-label` «Ver como» / «View as» y la estética SEG de Inv §1.3.
- **Rotación:** automática al terminar cada secuencia (ceo → comercial → operaciones → agentes → ceo), según la tabla de §4.3.
- **Panel de permisos** («Permisos de este rol / Contexto consultado»):
  - con `roledemo` ≥ 1100 px, a la derecha del marco en una columna de 240 px;
  - por debajo, debajo del marco, alineado a la derecha;
  - nunca fuera del ancho de la sección: el diseño medía `window` y podía salirse (Inv §11.25).
- **Chips internos «Ver como»:** ocultos.

### 4.5 Agentes: detalle con flujo

**Lienzo:** 800×430, con 5 columnas, 10 tarjetas con logo o ícono y curvas SVG punteadas. Según el ancho del contenedor `app`:

| Ancho del contenedor `app` | Presentación |
|---|---|
| ≥ 800 px | Lienzo a tamaño natural |
| 520–799 px | Lienzo a tamaño natural dentro de una región con scroll horizontal (`tabindex="0"`, `role="region"`, `aria-label` «Flujo del agente»), sin escalar el texto |
| < 520 px | Lista vertical de las 10 tarjetas en orden de columna, con el mismo contenido |

**Curvas** (`stroke-dashoffset`): `repeatCount="3"` (menos de 5 s) y después quedan quietas. Con reduced motion, sin animación.

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
| 2 | Umbral de aprobación de compras | $15.000.000 en Control, Permisos y el flujo de Compras. La OC-4471 ($18,4 M) lo supera |
| 3 | Aprobaciones | Control es la cola de **aprobaciones de compras**. KPI de Inicio con el label «Compras por aprobar» = 1; badge de Control = 1; Control dice «1 aprobación pendiente». Las aprobaciones de los agentes (planes de pago de Cobranzas, cotizaciones de Comercial) son **lotes del agente** y se muestran en Agentes («Esperando aprobación»); no suman en el KPI de compras |
| 4 | Recordatorios | La corrida de **hoy** del agente de cobranzas prepara 38 y espera aprobación (flujo). La actividad reciente se refiere a la corrida de **ayer**: «Ayer: Agente de cobranzas envió 35 recordatorios.» |
| 5 | Facturas vencidas | Total $48,2 M = $9,8 M a menos de 30 días + $38,4 M a más de 30 días. La respuesta del CEO dice «$38,4 M vencidos a más de 30 días» en lugar de $41,2 M |
| 6 | Pedidos retenidos | 12 en total: 8 por stock y 4 por crédito. Cualquier mención que los atribuya solo a stock se corrige |
| 7 | Supermercados Delta | −28 % en todas las apariciones |
| 8 | Conteos de las respuestas | «dos temas» con tres ítems → «tres temas»; «cuatro clientes» con tres ítems → «tres clientes» |
| 9 | Conexiones | Una sola tabla de fuentes con sus registros: la de la vista Lista, con las 8 fuentes. **Centro** muestra el subconjunto de **sistemas** (las fuentes de tipo sistema de esa tabla), rotulado «{n} sistemas · ver todas las fuentes en Lista». Usa los mismos nombres y registros (WhatsApp: 31.950), sin «Entrevistas», que no está en Lista. El badge de Conexiones cuenta las 8 fuentes |

### 4.8 OC-4471: un estado por isla

La OC-4471 tiene **un solo estado** en cada isla (`pending | approved | rejected`) y de él se derivan:

- la tarjeta y la trazabilidad de Control;
- la tarjeta «OC-4471 a Plastar S.A.» y el pill del flujo de Compras;
- el ítem de Inicio en «Requiere tu atención»;
- el contador de Control.

Aprobar, rechazar o deshacer desde Control, o aprobar o desaprobar desde el flujo de Compras, cambia ese estado. El foco queda en el botón de la acción opuesta («Deshacer» o «Aprobar»). Las conversaciones son registros históricos y no cambian. Las seis instancias de la app no comparten estado.

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
- **Árbol de accesibilidad:** curvas, íconos decorativos y el canvas de la textura con `aria-hidden`.

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

### 4.10 (anexo) Avatares

Los avatares de `i.pravatar.cc`, que son fotos de terceros, se reemplazan por avatares de iniciales: un círculo de 30 px con las iniciales, sobre un color fijo por persona tomado de la paleta de la app, con contraste ≥ 4,5:1. El agente conserva su ícono de bot azul.

## 7. Pruebas

TDD solo en S1, que esta fase no toca. Se verifica a mano con Chrome headless por CDP sobre `astro preview`, y la evidencia va en `docs/evidence/003/`.

## 8. Criterios de aceptación

| # | Criterio | Cómo se verifica |
|---|---|---|
| C1 | Build sin errores ni warnings y `npm test` en verde. | Salida (código de salida). |
| C2 | **Fidelidad por matriz:** 7 vistas, más los estados (conversación abierta, transacciones abiertas, detalle de los 3 agentes pendiente y aprobado, OC aprobada, rechazada y deshecha, Lista y Centro, usuario abierto) × variantes (`role-demo` y normal) × anchos del contenedor `app` (360, 520, 720, 860 y 1100 px, más el ancho real de cada marco a 1440 y 390) × ES y EN. Capturas lado a lado contra la app del diseño en ES, y EN de forma estructural. Diferencias: solo las de §6. | Matriz en el README de la evidencia + capturas. |
| C3 | **Interacciones**, con teclado y mouse, en ancho y en angosto: navegación de vistas y conversaciones (también desde el disclosure angosto); secuencia del chat con sus tiempos; cada transición de la tabla de §4.3 (rol, abrir conversación, salir de Preguntar, pausar y reanudar conservando la etapa, rotación detenida por elección manual aunque se pause y reanude); Ver/Ocultar transacciones; aprobar y desaprobar en los 3 agentes; OC-4471 aprobada, rechazada y deshecha desde Control y desde Compras, reflejada en Inicio y en el contador; Lista/Centro; usuario (Esc y click fuera); «Crear / Integrar» como link. Con viewport bajo (1280×400) y zoom 200 %, el chat arranca al entrar la cabecera y se pausa al salir. | Escenario CDP. |
| C4 | **Reduced motion** (inicial y en vivo): chat completo y estático, sin rotación ni curvas animadas (Agentes y Centro); la textura queda en un frame. | Escenario CDP con media emulada. |
| C5 | **Accesibilidad:** sin controles muertos en el orden de Tab; nombres y roles (árbol de accesibilidad); foco visible y foco final de cada acción (§4.8); anuncio único de la respuesta en las interacciones manuales y silencio en la animación automática (lectura de las regiones vivas); contraste medido sobre colores efectivos (tabla completa); reflow a 320 px del embed y zoom 200 % sin pérdida de contenido. | CDP + cálculo de contraste. |
| C6 | **Sin JS y carga lenta:** sin JS, cada embed muestra su vista inicial estática, legible y con los controles deshabilitados, y «Crear / Integrar» funciona. Con la red lenta (CDP) se ve lo mismo hasta hidratar, y después todo queda operable. | CDP con scripts deshabilitados y con red emulada. |
| C7 | Cero errores de consola en todas las rutas. | CDP. |
| C8 | **Peso de JS:** en las páginas con isla, React y la app pesan ≤ 110 KB gzip, con los módulos compartidos contados una vez. Solo los 6 paths de simple-icons llegan al bundle (búsqueda en `dist/`). La textura pesa ≤ 3 KB gzip. | Inventario por página con el método de A10. |
| C9 | **Textura:** detrás del contenido, sin taparlo; ≤ 16 fps; pausa con la pestaña oculta, el control del footer y reduced motion, con la precedencia de §3.4; preferencia persistente y control funcional con `localStorage` bloqueado. **Rendimiento:** con CDP `Performance`/`Tracing` durante 10 s en 1440×900, a DPR 1 y DPR 2, se registran scripting, rendering/painting y tareas largas, comparados con la textura pausada. Umbral: scripting más rendering de la textura < 15 % del hilo principal y sin tareas largas (> 50 ms) atribuibles. | CDP. |
| C10 | **EN:** 7 vistas, chat de los 4 roles, las 5 conversaciones, los 3 flujos y los mensajes de aprobación en inglés en `/en/`. | Capturas + recorrido. |
| C11 | Las 9 correcciones de §4.7 y el estado único de §4.8 se cumplen en todas sus apariciones. Tabla dato → apariciones → valor observado. | Recorrido + búsqueda en los datos. |
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
