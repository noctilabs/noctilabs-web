# Pendientes para el lanzamiento

Registro de lo que **la fase 5 tiene que cerrar antes del lanzamiento (fase 6)** (spec 002 §9). Cada ítem se cierra con
el contenido real entregado por el dueño o con una exclusión final que el dueño acepte. El gate técnico no aprueba este
contenido como final.

| # | Ítem | Origen | Qué falta | Estado |
|---|---|---|---|---|
| 1 | Revisión del inglés | D4 | Todo el copy en inglés (interfaz, páginas, industrias, formulario) es una traducción provisoria. El dueño la revisa y corrige. | pendiente |
| 2 | Copy de 4 industrias | D8 | Manufactura, Alimentos y consumo, Salud y Servicios tienen copy redactado sin diseño fuente (`draft: true` en `src/content/industries.ts`). El dueño lo aprueba o lo reemplaza. | pendiente |
| 3 | Equipo de Nosotros | D9 | La sección no se renderiza mientras `team.members` esté vacío (`src/content/pages/nosotros.ts`). Faltan nombres, roles y retratos (con su `alt`), o la decisión de no mostrar equipo. | pendiente |
| 4 | Deploy del Studio | §3.4 | Publicar el Studio con el schema extendido (`slugEs`, `topic`, `showOnInsights`) con `npx sanity deploy` y la cuenta del dueño. | pendiente |
| 5 | Slug en español y `topic` del post de la tesis | D11 | Hoy los dos slugs son `no-context-no-intelligence` y la categoría se deduce de `category.en`. Cargar `slugEs` y `topic` en Sanity. | pendiente |
| 6 | Los otros 7 posts del blog viejo | D11 | Sus cuerpos están sólo en inglés y 6 están no listados. Decidir para cada uno: traducir, marcar para Insights o dejarlo afuera. | pendiente |
| 7 | Terminología | D12 | «Cerebro operativo» (Home, Nosotros) y «cerebro organizacional» (Producto) conviven como en el diseño. El dueño elige una o confirma las dos. | pendiente |
| 8 | Licencia de las fotos de stock | D10 | Confirmar que la licencia de Artlist cubre el uso en web de los fotogramas de Consumo y Servicios (y de las fotos del diseño). | pendiente |
| 9 | Inglés de la Nocti App | D4, spec 003 §3.2 | El copy EN de la isla (`src/islands/noctiapp/data/en.ts`) es traducción mía. El dueño lo revisa junto con el ítem 1. | pendiente |
| 10 | Anuncios con lector de pantalla real | spec 003 C5 | El contrato DOM de las regiones vivas (chat `aria-live="polite"` y `role="status"` de aprobaciones) está verificado con MutationObserver; falta comprobar con NVDA o VoiceOver que cada anuncio se oye una sola vez y que la animación automática queda en silencio. | pendiente |
| 11 | Textura: cambio real de DPR y de visibilidad | spec 003 C9 | La emulación de CDP no emite el `change` de `matchMedia('(resolution: …)')` ni `visibilitychange`, así que esos dos caminos se verificaron emitiendo el evento a mano. Falta comprobarlos en hardware: mover la ventana entre monitores de distinto DPR con el fondo en pausa y cambiar de pestaña con el fondo animado. | pendiente |
| 12 | Teclado antes de hidratar | spec 003 §3.3, C12 (B15) | Con `client:visible` y los controles `disabled` hasta montar, un recorrido con Tab desde arriba saltea las islas que todavía no entraron en pantalla, y Shift+Tab de vuelta ya las encuentra habilitadas. Decidir si se acepta o se enmienda el spec (por ejemplo `client:idle` o `rootMargin`). | pendiente |
