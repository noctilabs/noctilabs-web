GATE: NO

Cotejo de los 15 hallazgos de pasada 1 sobre el [SPEC actual](C:/Users/adria/OneDrive/Escritorio/TOODO/noctilabs-web/docs/specs/004-formulario-seo-legales.md):

| Anterior | Estado | Evidencia |
|---|---|---|
| 1. Configuración de Vercel | Resuelto en el SPEC | §2.8–2.9: reglas estáticas en la raíz; se elimina la generación en `astro:build:done`. |
| 2. Sitemap i18n | Resuelto en el SPEC | §2.6: sitemap propio con `alternates()`, sin emparejamiento por paths de `@astrojs/sitemap`. |
| 3. Tratamiento legal | Parcial | Consentimiento y bloqueo de lanzamiento definidos; conservación y eliminación efectiva siguen sin cerrar. Hallazgo 6. |
| 4. XSS mediante links | Resuelto el vector anterior | `safeHref` existe y se elimina `unsafe-inline` para scripts. La nueva CSP introduce otros fallos: hallazgos 1 y 4. |
| 5. JSON-LD | No resuelto | §2.5 todavía prescribe escapar `<` como `<`. Hallazgo 3. |
| 6. Cabeceras locales | Resuelto en el SPEC | D7 exige servidor local con cabeceras HTTP y prueba de iframe. |
| 7. Analítica | Parcial | SDK, filtrado y recepción real definidos; falta cerrar el contrato del script usado en la comprobación local. Hallazgo 12. |
| 8. Honeypot y respuesta API | Resuelto en el SPEC | `.checked`, booleanos, éxito estricto y timeout sobre el cuerpo. Falta adaptar la integración existente: hallazgo 8. |
| 9. Cuota y abuso | Parcial | Riesgo y monitoreo definidos; la protección obligatoria depende de un plan todavía indeterminado. Hallazgo 7. |
| 10. Redirects históricos | Parcial | Están los archivos y aliases relevados; las barras finales siguen mal resueltas. Hallazgo 5. |
| 11. Conteo y diagnósticos | Parcial | Corrige las 22 URLs fijas; todavía cuenta documentos crudos y restringe warnings admitidos por S2. Hallazgo 9. |
| 12. Identidad del build | Parcial | Agrega snapshot y hashes, pero exige un único build para pruebas que requieren variantes. Hallazgos 2 y 10. |
| 13. Origen canónico | Resuelto en el SPEC | Fuente compartida y recreación explícita del 308 apex → www en fase 6, conservando path/query. |
| 14. Aviso accesible | Resuelto en el SPEC | Aviso previo, asociación, checkbox, teclado, contraste, zoom y reflow ES/EN. |
| 15. Robots | Resuelto en el SPEC | Grupo `User-agent: *` y sitemap absoluto completos. |

1. **BLOQUEANTE — §2.8; D7: la cabecera CSP bloquea lo que habilitan los hashes de Astro.**  
   **Problema:** las dos políticas se aplican simultáneamente. La cabecera tiene `default-src 'self'`, sin `script-src` ni `style-src`; por fallback bloquea scripts y estilos inline, aunque el `<meta>` de Astro permita sus hashes.  
   **Evidencia:** L127–133. Agregar otra política únicamente puede restringir las capacidades; sus permisos no se suman. Los hashes del meta no autorizan recursos bloqueados por la cabecera. [CSP, políticas múltiples](https://www.w3.org/TR/CSP3/#multiple-policies).  
   **Arreglo:** poner las directivas de carga —incluido `default-src`— en `security.csp.directives`, junto con los hashes generados. Dejar en la cabecera una política complementaria sin ese fallback, especialmente `frame-ancestors 'none'`. D7 debe comprobar ambas políticas aplicadas juntas.

2. **BLOQUEANTE — §2.2, §3; D3 y D8: el gate local requiere un build que el propio SPEC prohíbe.**  
   **Problema:** D8 exige construir con `VERCEL_ENV=production`, pero ese build debe fallar mientras estén los marcadores legales que recién se completan en fase 5. No existe un perfil de prueba definido que permita terminar fase 4.  
   **Evidencia:** L53, L160–161 y D8. D3 verifica justamente el rechazo de esos marcadores.  
   **Arreglo:** definir un fixture legal sintético exclusivamente para comprobaciones locales, sin desactivar el bloqueo de marcadores. Construir la variante de producción con ese fixture, interceptar sus servicios externos y marcar el artefacto como no publicable. Mantener los datos reales y la revisión profesional como condiciones de lanzamiento.

3. **IMPORTANTE — §2.5; D4: la serialización indicada permite cerrar el elemento JSON-LD.**  
   **Problema:** reemplazar `<` por `<` no escapa nada. Un título con `</script>` termina el bloque y permite introducir marcado HTML. La CSP no evita ese cierre del parser.  
   **Evidencia:** L100 conserva literalmente esa instrucción; D4 exige que el mismo caso no rompa el documento. La web vieja ya usa el reemplazo correcto en `scripts/build.mjs`.  
   **Arreglo:** especificar `JSON.stringify(datos).replace(/</g, '\\u003c')` y verificar que el contenido insertado conserva la secuencia literal `\u003c`. Además, alinear D4 con §2.5: comprobar `mainEntityOfPage`, o agregar explícitamente `Article.url`, que D4 exige pero el contrato no incluye.

4. **IMPORTANTE — §2.8; D7 y D9: los hashes de estilos no habilitan los atributos `style`.**  
   **Problema:** corregir la intersección anterior no alcanza. La política propuesta sigue bloqueando atributos inline existentes, con cambios de composición y posicionamiento.  
   **Evidencia:** [BeforeAfter.astro:54](C:/Users/adria/OneDrive/Escritorio/TOODO/noctilabs-web/src/components/sections/home/BeforeAfter.astro:54) posiciona nodos mediante `style`; `Container.astro:14` y `Kicker.astro:11` también usan atributos. Los hashes de bloques `<style>` no autorizan automáticamente esos atributos. [Reglas CSP para atributos](https://www.w3.org/TR/CSP3/#unsafe-hashes-usage).  
   **Arreglo:** migrar esos valores a clases y reglas CSS generadas, o definir una política explícita y acotada para `style-src-attr`. Auditar también el HTML inicial de las islas de S3. D7 debe registrar violaciones desde la navegación inicial y D9 comprobar visualmente los diagramas.

5. **IMPORTANTE — §2.9; D6: `trailingSlash: true` deja sin match las reglas exactas propuestas.**  
   **Problema:** `/company/` no se normaliza a `/company`. Es `/company` el que se redirige a `/company/`; una regla exacta sin barra no cubre ese destino. En artículos, la variante con barra puede caer en el comodín y perder el redirect al artículo equivalente.  
   **Evidencia:** L147–156. El código de Vercel genera la normalización antes de los redirects y compila sus fuentes con `strict: true`. [Orden de reglas](https://raw.githubusercontent.com/vercel/vercel/main/packages/routing-utils/src/index.ts), [normalización y matching](https://raw.githubusercontent.com/vercel/vercel/main/packages/routing-utils/src/superstatic.ts).  
   **Arreglo:** cubrir explícitamente fuentes con y sin barra —o usar un patrón de barra opcional válido—, incluyendo aliases y variantes `.html/`. En D6, ejecutar manualmente la matriz contra reglas compiladas con el mecanismo de Vercel, comprobar query conservada y destino existente. La lectura del JSON contra la tabla no detecta este fallo.

6. **IMPORTANTE — §2.2–2.4: la conservación prometida no coincide con una operación definida.**  
   **Problema:** se anuncian 24 meses, pero no se establece cómo borrar envíos del proveedor, del correo y de sus copias, ni cómo tramitar una supresión. “Salvo relación comercial” tampoco fija otro plazo o criterio.  
   **Evidencia:** L40–44. Web3Forms declara conservación de hasta tres años desde el envío, salvo eliminación anticipada o condiciones del plan; también procesa datos mediante infraestructura y servicios antispam. [Política de Web3Forms](https://web3forms.com/privacy).  
   **Arreglo:** confirmar las capacidades de eliminación de la cuenta, responsable y frecuencia de ejecución; fijar conservación por finalidad y procedimiento de derechos. Identificar también al proveedor del correo y sus transferencias. La revisión legal de fase 5 debe cerrar esos puntos con evidencia operativa, además del texto publicado.

7. **IMPORTANTE — §2.3, §6: la restricción de dominio obligatoria requiere una suscripción no asegurada.**  
   **Problema:** el SPEC admite registrar un plan gratuito, pero exige una protección que ese plan no ofrece. El lanzamiento puede quedar condicionado a una función inexistente en la cuenta.  
   **Evidencia:** L78–79 y pendientes. Web3Forms identifica la restricción como función PRO con suscripción activa; además, una vez aplicada, el formulario deja de funcionar localmente. [Restricción de dominio](https://docs.web3forms.com/getting-started/pro-features/restrict-to-domain).  
   **Arreglo:** exigir y verificar PRO antes de configurar la restricción, o documentar una alternativa aceptada para el plan gratuito. Ordenar las comprobaciones: envío local autorizado antes de restringir y recepción desde `www` después de restringir, como condición de fase 6.

8. **IMPORTANTE — §2.2–2.3; D2: el controlador actual no soporta los checkboxes que se agregan.**  
   **Problema:** agregar el consentimiento y el honeypot al formulario existente puede romper la validación o aceptar consentimiento desmarcado. El contrato sólo explicita `.checked` para el honeypot.  
   **Evidencia:** [contact-form.ts:12](C:/Users/adria/OneDrive/Escritorio/TOODO/noctilabs-web/src/scripts/contact-form.ts:12) recoge todos los inputs; L47 valida requeridos mediante `.value`; L74 serializa todos como strings. L28–32 asume un nodo de error para cada control, incluido el futuro honeypot.  
   **Arreglo:** incluir explícitamente la adaptación de ese controlador: consentimiento por `.checked`, honeypot fuera de la validación y del estado “modificado”, y payload construido con campos tipados. D2 debe verificar ausencia de requests sin consentimiento y ausencia de excepciones al validar, editar y resetear.

9. **IMPORTANTE — D1: el conteo sigue usando el conjunto equivocado y rechaza warnings editoriales válidos.**  
   **Problema:** “artículos del snapshot” incluye documentos que `getArticles()` excluye. Además, D1 sólo permite `[insights] excluido`, aunque S2 permite avisos por bloques o componentes ignorados.  
   **Evidencia:** el snapshot definido en §4 es la respuesta cruda de Sanity; S2 §3.4 consulta todos los posts y describe ocho documentos iniciales, de los cuales publica uno. `insights.ts` emite también `[insights] <id>: bloque no admitido…`.  
   **Arreglo:** definir `N = cantidad de artículos devueltos por getArticles()` y contar `22 + 2N + 1` HTML. Listar todos los diagnósticos editoriales esperados por fixture, manteniendo cero errores de tipos y cero diagnósticos inesperados.

10. **IMPORTANTE — §4; D4, D8 y D10: “todos sobre ese build” contradice las variantes obligatorias.**  
    **Problema:** D8 requiere dos entornos, D4 un fixture adversarial y D3 un build rechazado. No pueden tener los mismos artefactos y variables que el build base. Tampoco se identifican los JS/CSS, la configuración de cabeceras ni el servidor que produce D7.  
    **Evidencia:** L167–174 y D3–D10; los hashes exigidos sólo cubren sitemap y HTML de artículos.  
    **Arreglo:** definir una matriz de ejecuciones con manifiesto por variante: commit, estado del árbol, lockfile, entorno, fixtures, hash de `vercel.json`, artefactos servidos y versión del servidor local. D10 debe vincular cada evidencia a su variante y exigir D7/D9 sobre el mismo build base, con la implementación de S3 identificada.

11. **IMPORTANTE — §2.2–2.4, §6: falta cerrar la inscripción de la base de contactos.**  
    **Problema:** consentimiento y aviso no sustituyen las obligaciones sobre la base donde se almacenan los contactos. El SPEC no contempla verificar una inscripción existente ni actualizarla por los nuevos tratamientos.  
    **Evidencia:** se prevé almacenamiento organizado en correo y proveedor; el artículo 28 exige registro para bases personales privadas creadas, modificadas o suprimidas. [Ley 18.331, artículo 28](https://www.impo.com.uy/bases/leyes/18331-2008/28).  
    **Arreglo:** agregar a fase 5 la verificación profesional de la inscripción aplicable, su actualización o la excepción fundada. Registrar responsable y evidencia de cierre como condición de lanzamiento.

12. **IMPORTANTE — §2.7; D8: la comprobación local no cierra el script ejecutado ni evita datos personales en paths desconocidos.**  
    **Problema:** `inject()` carga otro script; el SPEC no define qué respuesta ejecutable entrega la interceptación local. Además, quitar query y fragmento conserva un path como `/cliente/persona@empresa.com/`, que puede ejecutar Analytics desde la 404.  
    **Evidencia:** el [SDK inserta un script externo](https://raw.githubusercontent.com/vercel/analytics/main/packages/web/src/generic.ts); Vercel documenta configuraciones dinámicas y advierte que los paths pueden contener datos personales. [Configuración del SDK](https://vercel.com/docs/analytics/package), [privacidad de Analytics](https://vercel.com/docs/analytics/privacy-policy).  
    **Arreglo:** fijar versión/opciones del SDK y el script de recolección usado por D8, con hash y respuestas locales que permitan ejecutar el flujo real de `beforeSend`. Descartar pageviews de la 404 y de rutas desconocidas; comprobar un caso con datos personales en el path, además de query y fragmento.