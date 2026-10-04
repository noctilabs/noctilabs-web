GATE: SÍ

Cotejo de los cinco hallazgos de pasada 4 contra `9274e8e`:

| Hallazgo | Estado en el SPEC |
|---|---|
| 1. Bajas sin equivalente | Corregido en §2.9: 404, sin comodín al índice. D6 introduce la contradicción del hallazgo 2 de abajo. |
| 2. Destinos del build publicable | Resuelto: `build:publish` verifica el `dist/` recién generado, registra el snapshot efectivo y define mantenimiento por publicación, cambio de slug y retiro. |
| 3. Plazos de derechos | Resuelto: cinco días hábiles, responsable, identidad, búsqueda, respuesta y comprobación operativa previa al lanzamiento. |
| 4. Edición durante el envío | Resuelto: D2 agrega respuesta demorada, bloqueo de campos y consentimiento, recuperación tras error y reset tras éxito. |
| 5. Diagnósticos de D1 | Resuelto: queda un único criterio de cero diagnósticos inesperados, con avisos editoriales enumerados por variante. |

Las pasadas 1–3 quedan corregidas en el contrato; los cierres legales, de conservación, cuenta, cuota y restricción siguen siendo condiciones obligatorias de lanzamiento. Verifiqué nuevamente la configuración CSP contra Astro 7.3.5 instalado: acepta las directivas y emite `style-src-attr 'unsafe-inline'` separado de scripts y bloques de estilos. La generación de `dist/vercel.json` y `@astrojs/sitemap` siguen eliminadas.

1. **IMPORTANTE — §2.7–2.8; D8: el filtrado no cubre el referente de Analytics.**  
   **Problema:** limpiar `event.url` y excluir la 404 no protege la URL de procedencia. Una navegación desde `/hablemos/?email=persona@example.com` —o desde una 404 con datos en el path— hacia una página indexable puede conservar esos datos como referente. D8 solo verifica la URL del evento.  
   **Evidencia:** `strict-origin-when-cross-origin` conserva path y query en navegaciones del mismo origen. Vercel documenta que recoge referentes en pageviews iniciales; el tipo público de `beforeSend` expone `type` y `url`, sin referente. Esto identifica un riesgo del contrato; no demuestra una filtración observada en producción. [Política de referentes](https://www.w3.org/TR/referrer-policy/#referrer-policy-strict-origin-when-cross-origin), [Analytics](https://vercel.com/docs/analytics/using-web-analytics), [tipo del callback](https://github.com/vercel/analytics/blob/main/packages/web/src/types.ts).  
   **Arreglo concreto:** cambiá la cabecera a `Referrer-Policy: strict-origin`, también para la 404. Agregá recorridos locales desde ambas URLs sensibles hacia una página con Analytics y comprobá que `document.referrer` conserva únicamente el origen. En fase 6, inspeccioná también el payload real de recolección.

2. **MENOR — §2.9; D6: las bajas sí matchean una regla de normalización.**  
   **Problema:** D6 exige que las bajas sin barra y los paths desconocidos «no matcheen ninguna regla». Con `trailingSlash: true`, primero reciben un 308 hacia su variante con barra; recién esa variante termina en 404. La exigencia literal rechaza el comportamiento previsto.  
   **Evidencia:** la normalización se compila antes de los redirects explícitos. Contrasté su expresión con `/blog/production-gap`, `/blog-post-production-gap` y `/blog/desconocido`: los tres matchean. [Implementación de Vercel](https://github.com/vercel/vercel/blob/main/packages/routing-utils/src/superstatic.ts).  
   **Arreglo concreto:** exigí «ningún redirect de migración» y registrá la cadena completa: normalización opcional 308, query conservada y destino final 404 con el cuerpo correspondiente. Las variantes con barra y `.html` deben terminar directamente en 404.