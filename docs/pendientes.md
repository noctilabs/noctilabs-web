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
