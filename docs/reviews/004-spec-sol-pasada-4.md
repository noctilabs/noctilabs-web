GATE: SÍ

El gate corresponde al **SPEC de fase 4**. Los cierres legales y operativos siguen siendo condiciones de lanzamiento.

Cotejo de las revisiones anteriores: «resuelto» significa corregido en el contrato, no implementado ni probado.

| Revisión | Resueltos en el SPEC | Cierre condicionado al lanzamiento | Pendientes |
|---|---|---|---|
| Pasada 1 | 1–2, 4–8, 10, 12–15 | 3: tratamiento legal; 9: cuenta, cuota y abuso | 11: contradicción de diagnósticos en D1 |
| Pasada 2 | 1–5, 7–8, 10, 12 | 6: conservación; 11: inscripción de la base | 9: diagnósticos en D1 |
| Pasada 3 | 1–5, 7 | Los cierres operativos agregados por 4–5 | 6: contrato corregido, escenario manual ausente de D2; 8: contradicción de D1 |

Verifiqué la configuración propuesta contra **Astro 7.3.5 instalado**: las directivas pasan el validador y se emite `style-src-attr 'unsafe-inline'` separado de scripts y estilos de elementos. El hook que generaba `dist/vercel.json` y `@astrojs/sitemap` ya no forman parte del contrato. No quedan BLOQUEANTES identificados.

1. **IMPORTANTE — §2.9; D6: las bajas se redirigen a contenido que no las reemplaza.**  
   **Problema:** siete artículos sin equivalente, sus aliases y cualquier path del comodín `/blog/:slug*` terminan en el índice. La cobertura de URLs no garantiza una migración SEO correcta.  
   **Evidencia:** §2.9 declara expresamente «sin equivalente publicado». Google advierte que redirigir URLs a un destino que no reemplaza su contenido puede producir *soft 404*. El índice nuevo tampoco contiene esos siete artículos. [Guía de migraciones de Google](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes).  
   **Arreglo concreto:** conservá el 308 cuando exista un equivalente o una consolidación efectiva de contenido. Para bajas sin reemplazo, definí 404 o 410; para paths desconocidos, 404. D6 debe verificar también los estados esperados de esas bajas.

2. **IMPORTANTE — §2.2, §4 y §2.9: el artefacto publicable puede tener redirects rotos aunque D6 haya pasado.**  
   **Problema:** D6 corre sobre el snapshot, mientras `build:publish` rechaza `INSIGHTS_FIXTURE` y consulta nuevamente Sanity. No se exige repetir la comprobación de destinos sobre ese resultado.  
   **Evidencia:** `src/content.config.ts` consulta el CMS cuando falta el fixture; `getArticles()` excluye posts retirados o incompletos. Si la tesis deja de publicarse o cambia su slug inglés, el redirect fijo a `/en/insights/no-context-no-intelligence/` termina en una 404. §2.9 solo define actualizar reglas cuando se incorporan los otros siete posts.  
   **Arreglo concreto:** agregá al perfil de publicación una comprobación de que los destinos específicos existen en el build recién generado. Registrá el snapshot efectivo y el manifiesto de publicación. Definí cómo actualizar la matriz cuando se cambia un slug o se retira un artículo. Puede verificarse localmente, sin adelantar Vercel.

3. **IMPORTANTE — §6: el procedimiento de derechos admite un plazo incompatible con la ley.**  
   **Problema:** exigir un procedimiento «con un plazo» permite cerrar el pendiente con cualquier duración, aunque la ley fija máximos concretos.  
   **Evidencia:** el acceso debe responderse dentro de cinco días hábiles; la rectificación, actualización, inclusión o supresión tiene también un máximo de cinco días hábiles, con respuesta fundada cuando no corresponda. [Artículo 14](https://www.impo.com.uy/bases/leyes/18331-2008/14), [artículo 15](https://www.impo.com.uy/bases/leyes/18331-2008/15).  
   **Arreglo concreto:** fijá esos plazos en el contrato operativo, junto con responsable, verificación de identidad, búsqueda en correo/proveedor y registro de respuesta. Exigí comprobar que la operación del proveedor permite cumplirlos antes del lanzamiento.

4. **MENOR — §2.3; D2: falta verificar la corrección de pasada 3, hallazgo 6.**  
   **Problema:** el SPEC exige deshabilitar el fieldset durante el request, pero D2 no incluye el escenario que demuestra que los cambios posteriores al payload quedan impedidos.  
   **Evidencia:** D2 verifica respuestas, conservación de valores y consentimiento, sin intentar editar durante una respuesta exitosa demorada. El controlador actual deshabilita solamente el botón.  
   **Arreglo concreto:** agregá un caso manual con respuesta demorada: intentar modificar campos y consentimiento, comprobar que permanecen bloqueados y verificar su recuperación tras error y tras «Enviar otro mensaje».

5. **MENOR — D1: sigue abierto el hallazgo de diagnósticos de las tres pasadas.**  
   **Problema:** la primera oración admite únicamente `[insights] excluido: …`; la última admite todos los avisos editoriales esperados.  
   **Evidencia:** `src/lib/insights.ts` también emite `[insights] <id>: bloque no admitido ignorado (…)`. Ese snapshot puede cumplir la última condición y violar la primera.  
   **Arreglo concreto:** eliminá la restricción inicial y dejá un único criterio: cero diagnósticos inesperados, con todos los avisos editoriales esperados enumerados por variante.