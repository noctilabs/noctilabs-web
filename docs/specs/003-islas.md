# Spec 003 — Islas interactivas: Nocti App y textura de fondo

Estado: borrador para revisión · 2026-10-04

## 1. Contexto

Las fases 1 y 2 dejaron el sitio estático completo. Quedan dos piezas pendientes:

- **Los seis embeds de `Nocti App v2`**: hoy son `AppSlot` placeholders, con el contrato de props de spec 002 §4.8.
- **La textura animada de fondo** («Tramado animado», Inv §0.3), que en la fase 2 quedó como diferencia temporal.

Este spec las implementa.

**Fuentes:**
- `C:\Users\adria\OneDrive\Escritorio\NoctiLabs Web - deploy\Nocti App v2.dc.html` («App L123»), que tiene 648 líneas: plantilla L1–416 y script L417–646;
- el inventario `docs/specs/002-inventario-diseno.md` §12 (resumen de la app) y §0.3 (textura).

**Decisiones del dueño vigentes:** Astro con React solo en islas; ES + EN; SDD con gpt-6.1-sol; TDD solo en S1; Web Interface Guidelines de Vercel; Inter; Vercel diferido.

## 2. Objetivo

1. Una isla React `NoctiApp` que reproduce la app del diseño (7 vistas, roles, animaciones e interacciones) y reemplaza el interior de los seis `AppSlot` sin tocar las secciones.
2. La textura «Tramado animado» detrás de todas las páginas.
3. Las dos cosas accesibles, livianas y en los dos idiomas.

## 3. Arquitectura

### 3.1 Dependencias

`@astrojs/react`, `react` y `react-dom` (versiones vigentes compatibles con Astro 7). Más `simple-icons` (CC0), solo para importar en el build los 6 logos que usa la app (SAP, HubSpot, WhatsApp, Gmail, Google Sheets, Google Drive) y no depender de `cdn.simpleicons.org`.

### 3.2 Estructura

```
src/islands/noctiapp/
  NoctiApp.tsx          raíz: props, ancho propio, vista activa, rol
  shell/                sidebar (ancho), barra de tabs (angosto), menú de usuario
  views/                Inicio, Preguntar, Inteligencia, Agentes (lista + detalle), Control, Conexiones, Permisos
  chat/                 secuencia animada del chat (§4.3)
  data/es.ts, data/en.ts  datos y copy (VIEWS, ROLES, CONVOS, SUGG, D, FLOWS, …) transcriptos del script de la app
  icons.ts              paths de íconos (ICONS, SYSICON, FICON) y logos de simple-icons
  app.css               estilos (tokens de la app, App L15)
```

- **Estilos:** CSS propio con los tokens de la app (`--color-text`, `--color-bg`, `--color-surface`, `--color-divider`, `--color-neutral-*`) acotados a `.nocti-app`. No hay estilos inline salvo los valores calculados (posiciones del lienzo de flujos).
- **Datos:** el español se transcribe literal del diseño, con las correcciones de §4.7. El inglés lo traduzco yo y queda en `docs/pendientes.md` (D4).

### 3.3 Integración con `AppSlot`

`AppSlot.astro` conserva sus props (spec 002 §4.8): `view`, `locale`, `contactHref`, `frame` y `variant`. El interior pasa a ser:

```astro
<NoctiApp client:visible view={view} locale={locale} contactHref={contactHref} variant={variant} />
```

- **SSR:** Astro renderiza la isla en el build, así que sin JS se ve la vista inicial estática, sin animaciones. Se hidrata al entrar en pantalla (`client:visible`).
- **`onNewAgent`** («Crear / Integrar»): es un `<a href={contactHref}>`, no un callback.
- **`variant="role-demo"`** (home): la isla dibuja además las tabs de rol arriba y el panel de permisos al costado (§4.4). El rol lo maneja la isla y no hay comunicación con la página.
- **Captions:** vuelven los de Inv §2.2, §2.4 y §2.5, debajo del marco en Producto. Los define el contenido de la sección de Producto, no la isla. Se restituye así la diferencia temporal de la fase 2.

### 3.4 Textura

`src/scripts/texture.ts`, en TypeScript sin dependencias, se incluye en `Base.astro`:

- un `<canvas>` en un contenedor `position: fixed; inset: 0; z-index: -1; pointer-events: none`, detrás de todo el contenido, con el `body` en `isolation: isolate`;
- el algoritmo de Inv §0.3: Bayer 4×4 y ruido de ondas, con los parámetros por defecto del diseño (`texDot 2.1`, `texSpacing 8`, `texCoverage .85`, `texIntensity .15`, `texSpeed 1.7`, `texWave .3`, `texDrift -2.8`, `texColor #0B0B0C`, cuadrados);
- **render:** un frame cada 60 ms como máximo, con `devicePixelRatio` hasta 2, y redimensionado con `ResizeObserver`;
- **pausa automática** con `document.hidden`;
- **reduced motion:** un solo frame estático, y se escucha el cambio en vivo;
- **pausa manual** (§4.6): un control «Pausar fondo» / «Animar fondo» en la fila inferior del footer. La preferencia se guarda en `localStorage` y la lectura va en `try/catch`.

## 4. Comportamiento

### 4.1 Layout de la app

- **Ancho:** `wide` cuando el ancho propio de la isla es ≥ 720 px. Por encima va el sidebar de 216 px; por debajo, una barra de tabs horizontal con scroll (App L16–49). El corte se resuelve con container queries (`container-type: inline-size` en la raíz), no con medición en JS. La única excepción es el lienzo de flujos (§4.5), que necesita escalar.
- **Alto mínimo:** 560 px.
- **Navegación por vistas:** botones con `aria-current="page"` en la vista activa.
- **Conversaciones fijadas y recientes del sidebar:** botones que abren esa conversación en la vista Preguntar.

### 4.2 Vistas

Las 7 vistas de Inv §12.3 con su contenido y sus estados:

- `drill` en Inteligencia;
- `agentOpen` y `agentAppr` en Agentes;
- `appr` con Aprobar / Rechazar / Deshacer en Control;
- `conexV` con «Lista» / «Centro» en Conexiones (la variante «malla», inalcanzable en el diseño, no se porta).

La vista inicial es la prop `view`.

### 4.3 Chat animado (vista Preguntar)

Reproduce `runChat` (App L525–539):

1. El tipeo de la pregunta, a 28 ms por carácter, más 30 ms en los espacios.
2. La burbuja.
3. «Consultando contexto · {rol}», con las fuentes apareciendo cada 380 ms.
4. La respuesta, con un ítem cada 520 ms.
5. El pie.

**Arranque:** la secuencia arranca cuando la isla está al menos al 35 % en pantalla, y se pausa si sale.

**Al terminar:**
- en `role-demo`, a los 5200 ms pasa al rol siguiente (§4.4);
- en el resto, repite desde el principio después de 5200 ms.

**Accesibilidad:**
- La región de la conversación es un `role="log"` con `aria-live="off"` durante la animación automática, para que no se anuncie cada carácter. Cuando la secuencia termina, el texto completo de la respuesta queda en el DOM.
- Hay un control **«Pausar demo» / «Reanudar demo»** (`aria-pressed`) visible en la cabecera de la vista Preguntar. Detiene la secuencia, la rotación de roles y el repetido, y deja visible el estado actual (WCAG 2.2.2).
- **Con reduced motion:** sin tipeo, sin aparición escalonada, sin rotación ni repetido. La conversación aparece completa y estática. El cambio de preferencia se escucha en vivo.

### 4.4 Demo por rol (home, `variant="role-demo"`)

- **Selector de rol:** CEO, Comercial, Operaciones y Agentes (`ROLE_TABS`). Es un grupo de botones con `aria-pressed`, porque cambia el rol de un único contenido; no son tabs APG. Va con `aria-label` «Ver como» / «View as», y con la estética SEG de Inv §1.3: `#E6E6E2`, mono 13px y el estilo `tab()`.
- **Rotación:**
  - automática, al terminar cada chat (ceo → comercial → operaciones → agentes → ceo);
  - el primer uso del selector la detiene para siempre en esa carga;
  - «Pausar demo» también la detiene.
- **Panel de permisos** («Permisos de este rol / Contexto consultado»): va a la derecha del marco, dentro del ancho de la sección, cuando la sección mide al menos 1100 px (columna de 240 px). Por debajo, va debajo del marco, alineado a la derecha. Sin medición de `window`: el diseño lo calculaba y podía salirse del contenedor (Inv §11.25). Diferencia autorizada.
- **Chips «Ver como» internos:** ocultos, por `hideRoleChips`.

### 4.5 Agentes: detalle con flujo

- **Lienzo de flujo:** 800×430 (5 columnas, 10 tarjetas con logo o ícono, curvas SVG punteadas). Se escala con `transform: scale()` al ancho disponible, medido con `ResizeObserver`. Por debajo de 520 px de ancho se reemplaza por una lista vertical de las 10 tarjetas en orden de columna, con el mismo contenido, para no volverlo ilegible.
- **Animación de las curvas** (`stroke-dashoffset`): `repeatCount="3"` (menos de 5 s) y después quedan quietas. Con reduced motion no se animan.
- **Aprobar / desaprobar** (`agentAppr`): cambia las tarjetas, el pill y el botón como en el diseño.

### 4.6 Controles sin acción en el diseño

Algunos botones del diseño no hacen nada (Inv §11.13): «Ver análisis», la acción de cada respuesta, «Crear alerta», «+ Conectar fuente», el secundario del detalle de agente y los ítems del menú de usuario. Se dibujan con el mismo aspecto, pero como elementos **no interactivos** (`<span>`, sin foco), para que no haya controles muertos en el orden de Tab.

El menú de usuario conserva su botón de apertura (`aria-expanded`), y se cierra con Esc y con un click fuera. Sus ítems son texto.

### 4.7 Correcciones de datos (Inv §11.17–11.19)

| Inconsistencia | Corrección |
|---|---|
| Saludo «Buenos días» en Inicio y «Buenas tardes» en Preguntar | «Hola, {nombre}.» en las dos vistas («Hi, {name}.»). Con el rol agentes: «Hola.» |
| Umbral de aprobación de compras: $10.000.000 (Control y Permisos) frente a $15 M (flujo de Compras) | $15.000.000 en todos lados. La OC-4471 ($18,4 M) lo supera. |
| KPI «Aprobaciones 2» y badge «2» de Control frente a «1 aprobación pendiente» | 1 en todos lados |
| «Agente de cobranzas envió 12 recordatorios» frente a 38 en el flujo | 38 |
| «Supermercados Delta» −28 % (rol Comercial) frente a −32 % (conversación) | −28 % |

### 4.8 Avatares

Los avatares de `i.pravatar.cc` (fotos de terceros) se reemplazan por avatares de iniciales: un círculo de 30 px con las iniciales de la persona, sobre un color fijo por persona tomado de la paleta de la app. El agente conserva su ícono de bot azul. Diferencia autorizada.

### 4.9 Accesibilidad de la isla

- La raíz es una `section` con `aria-label` «Demo interactiva de Nocti, con datos ilustrativos» / «Interactive Nocti demo with illustrative data».
- **Foco y teclado:** foco visible en todos los controles; navegación de vistas, conversaciones, Ver transacciones, tarjetas de agente, Aprobar/Rechazar/Deshacer, Lista/Centro y el menú de usuario operables con teclado.
- **Contraste:** los colores de la app con texto por debajo de 4,5:1 se corrigen. Ya identificados:
  - `#8A8A86` sobre blanco: 3,5:1 → `--color-neutral-700` `#6B6B68`;
  - `#9A9A96`: 2,8:1 → `#6B6B68`.

  Los grises de borde no cambian.
- **Árbol de accesibilidad:** las curvas y los íconos decorativos van con `aria-hidden`.

## 5. Fuera de alcance

- Datos reales: la app es una demo con datos ilustrativos (la «Distribuidora Andes» del diseño).
- Filtros de Insights: fase 5.
- Formulario, SEO, analítica y legales: fase 4.

## 6. Diferencias autorizadas respecto del diseño

1. Panel de permisos de la demo por rol dentro del ancho de la sección (§4.4).
2. Lista vertical del flujo por debajo de 520 px (§4.5).
3. Curvas animadas 3 veces y quietas después (§4.5).
4. Controles sin acción como elementos no interactivos (§4.6).
5. Datos corregidos (§4.7).
6. Avatares de iniciales (§4.8).
7. Contrastes corregidos (§4.9).
8. Control «Pausar demo» en Preguntar y «Pausar fondo» en el footer (§4.3, §3.4).
9. Saludo neutro (§4.7).
10. Sin la variante «malla» de Conexiones.
11. Inter, como en las fases anteriores.

## 7. Pruebas

TDD solo en S1, que esta fase no toca. Se verifica a mano con Chrome headless por CDP sobre `astro preview` y con evidencia en `docs/evidence/003/`.

## 8. Criterios de aceptación

| # | Criterio | Cómo se verifica |
|---|---|---|
| C1 | `npm run build` sin errores ni warnings y `npm test` en verde. | Salida. |
| C2 | **Fidelidad por vista:** las 7 vistas, más el detalle de los 3 agentes y el estado aprobado, en ancho (1100 px de isla) y angosto (360 px), lado a lado contra la app del diseño. Diferencias: solo las de §6. | Capturas en `docs/evidence/003/capturas/`. |
| C3 | **Interacciones**, por recorrido con teclado y mouse: navegación de vistas y conversaciones; secuencia completa del chat con sus tiempos; rotación de roles y su detención por selector y por pausa; Ver/Ocultar transacciones; detalle de agente con aprobar y desaprobar; Aprobar, Rechazar y Deshacer de la OC; Lista/Centro; menú de usuario (Esc y click fuera); «Crear / Integrar» como link a Hablemos. | Escenario CDP. |
| C4 | **Reduced motion** (inicial y en vivo): chat completo y estático, sin rotación ni curvas animadas; la textura queda en un frame. | Escenario CDP con media emulada. |
| C5 | **Accesibilidad:** sin controles muertos en el orden de Tab, nombres y roles correctos (árbol de accesibilidad), foco visible, contraste ≥ 4,5:1 en texto, y un reflow a 320 px del embed sin pérdida de contenido. | CDP + cálculo de contraste. |
| C6 | **Sin JS:** cada embed muestra su vista inicial estática, legible y sin huecos. | CDP con scripts deshabilitados. |
| C7 | Cero errores de consola en todas las rutas. | CDP. |
| C8 | **Peso de JS:** en las páginas con isla, React y la app pesan ≤ 110 KB gzip, contando una vez los módulos compartidos. La textura pesa ≤ 3 KB gzip. Las páginas sin isla mantienen el presupuesto de la fase 2 más la textura. | Inventario por página, con el método de A10. |
| C9 | **Textura:** se dibuja detrás del contenido sin taparlo, hasta 16 fps; se pausa con la pestaña oculta; el control del footer la pausa y la reanuda y la preferencia persiste; con reduced motion queda estática. Costo en CPU medido con el Performance de CDP durante 10 s en 1440×900: scripting < 15 % del hilo principal. | CDP. |
| C10 | **EN:** las 7 vistas, el chat de los 4 roles y los 3 flujos en inglés en las páginas `/en/`. | Capturas + recorrido. |
| C11 | Las correcciones de datos de §4.7 se ven en la app (tabla con el valor observado). | Recorrido. |
| C12 | Las fases 1 y 2 no se rompen: checklist del header y criterios de la fase 2 afectados, re-ejecutados. | Re-ejecución. |
| C13 | gpt-6.1-sol aprueba el spec antes de empezar y la implementación con la evidencia C1–C12 sobre un mismo commit. | Veredicto con hash. |

## 9. Plan

1. **Dependencias, integración React, `icons.ts` con simple-icons y los datos ES** (transcripción literal con las correcciones de §4.7). Se verifica con C1.
2. **Shell e Inicio, Inteligencia, Control, Conexiones y Permisos.** Se verifica con C2 y C3.
3. **Preguntar con el chat, la pausa y la demo por rol.** Se verifica con C3 y C4.
4. **Agentes: lista, detalle y flujo.** Se verifica con C2 y C3.
5. **`AppSlot` con la isla y los captions de Producto.** Se verifica con C6 y C12.
6. **Datos EN.** Se verifica con C10.
7. **Textura y su control en el footer.** Se verifica con C4 y C9.
8. **Accesibilidad, peso, consola, evidencia y gate.** Se verifica con C5, C7, C8 y C13.
