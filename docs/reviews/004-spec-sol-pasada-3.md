GATE: NO

Cotejo de pasada 1. «Resuelto» significa corregido en el SPEC; los cierres legales y operativos siguen requiriendo evidencia antes del lanzamiento.

| # | Estado | Evidencia |
|---|---|---|
| 1. Configuración Vercel | Resuelto | §2.8–2.9: configuración estática en la raíz; eliminado el hook que escribía en `dist`. |
| 2. Sitemap i18n | Resuelto | §2.6: sitemap propio con `alternates()`, incluidos slugs traducidos. |
| 3. Tratamiento legal | Resuelto como condición de lanzamiento | §2.2 y §6: consentimiento, revisión profesional, conservación y transferencias pendientes de cierre obligatorio. |
| 4. XSS por links | Resuelto el vector | `safeHref` filtra protocolos; §2.8 prohíbe scripts con `unsafe-inline`. |
| 5. JSON-LD | Resuelto | §2.5: escape Unicode de seis caracteres, propiedades y excepción de la 404. |
| 6. Cabeceras locales | Resuelto | D7 exige HTTP real y prueba de iframe. |
| 7. Analítica | Parcial | SDK y activación definidos; la ejecución local sigue incompleta. Hallazgo 2. |
| 8. Honeypot/API | Resuelto | §2.3: `.checked`, booleanos, éxito estricto y timeout sobre el cuerpo. |
| 9. Cuota/abuso | Parcial | Plan, cuota y aceptación del riesgo definidos; falta comprobación posterior a restringir el dominio. Hallazgo 4. |
| 10. Redirects históricos | Resuelto en el contrato | §2.9 cubre los cuatro HTML principales, ocho posts y nueve redirects del `vercel.json` viejo; D6 agrega variantes y query. |
| 11. Conteo/diagnósticos | Parcial | Conteo corregido; D1 conserva dos restricciones diferentes sobre warnings. Hallazgo 8. |
| 12. Identidad del build | Parcial | §4 identifica variantes, pero D10 vuelve a exigir un único build. Hallazgo 3. |
| 13. Origen canónico | Resuelto en el contrato | §2.1: fuente compartida, 308 y comprobaciones de ambos hosts en fase 6. |
| 14. Aviso accesible | Resuelto en el contrato | Aviso previo, asociación, checkbox, link y recorridos ES/EN definidos. |
| 15. Robots | Resuelto | §2.6 incluye grupo y sitemap absoluto. |

Cotejo de pasada 2:

| # | Estado | Evidencia |
|---|---|---|
| 1. Intersección de CSP | Resuelto | La cabecera complementaria conserva solamente `frame-ancestors`. |
| 2. Producción bloqueada para pruebas | Resuelto para ejecución local | §2.2 incorpora fixture; su protección contra publicación tiene otro defecto. Hallazgo 5. |
| 3. Escape JSON-LD | Resuelto | §2.5 define el escape literal y `Article.url`. |
| 4. Atributos `style` | Parcial | Se permite su uso, pero la ubicación indicada en la configuración de Astro es inválida. Hallazgo 1. |
| 5. Barras finales | Resuelto | §2.9 exige fuentes con/sin barra. La normalización de Vercel también elimina la barra de `.html/`. |
| 6. Conservación | Resuelto como condición de lanzamiento | §6 exige comprobar eliminación, correo y procedimiento de derechos. |
| 7. Restricción PRO | Parcial | Se contempla el plan gratuito; sigue faltando recepción después de activar la restricción. Hallazgo 4. |
| 8. Controlador/check­boxes | Resuelto en el contrato | §2.3 exige payload tipado, `.checked` y exclusión del honeypot. |
| 9. Conteo/warnings | Parcial | `N = getArticles()` corregido; permanece la contradicción de D1. Hallazgo 8. |
| 10. Variantes de build | Parcial | Manifiestos ampliados; D10 no fue alineado. Hallazgo 3. |
| 11. Inscripción de la base | Resuelto como condición de lanzamiento | §6 exige inscripción, actualización o excepción fundada. |
| 12. Script Analytics/paths privados | Parcial | Excluye 404 y rutas desconocidas; sigue sin definir qué ejecuta la interceptación. Hallazgo 2. |

1. **BLOQUEANTE — §2.8; D1 y D7: la configuración indicada para CSP puede impedir el build.**  
   **Problema:** exigir que todas las directivas de carga vayan en `security.csp.directives` e incluir allí `style-src-attr` contradice la API de Astro.  
   **Evidencia:** ejecuté el validador de Astro **7.3.5 instalado**: `allowedDirectivesSchema.safeParse("style-src-attr 'unsafe-inline'")` devuelve `success: false`. El diagnóstico exige usar `styleDirective` con `kind`. El recurso de atributo equivalente sí pasa. [Referencia oficial de Astro](https://docs.astro.build/en/reference/configuration-reference/#securitycspstyledirectiveresources).  
   **Arreglo concreto:** limitá `directives` a las directivas admitidas y especificá `styleDirective.resources: [{ resource: "'unsafe-inline'", kind: "attribute" }]`. Conservá `'self'` y los hashes para estilos de elementos. D7 debe inspeccionar la política emitida y comprobar que ningún `unsafe-inline` alcance scripts ni bloques `<style>`.

2. **IMPORTANTE — §2.7–2.8; D7–D8: sigue siendo posible aprobar Analytics sin ejecutar su filtrado.**  
   **Problema:** interceptar y registrar la carga del script no demuestra que procese eventos ni ejecute `beforeSend`. Además, D7 corre exclusivamente sobre `base`, donde Analytics está apagado.  
   **Evidencia:** el [SDK de Vercel](https://raw.githubusercontent.com/vercel/analytics/main/packages/web/src/generic.ts) encola `beforeSend` y carga otro script; no ejecuta por sí mismo ese callback. D8 no define la respuesta ejecutable interceptada y difiere todo el filtrado a fase 6.  
   **Arreglo concreto:** definí un fixture ejecutable o un stub documentado del consumidor de la cola, identificándolo por hash. Verificá localmente entrada y salida del callback con query, fragmento y ruta desconocida. Ejecutá también la comprobación de CSP y consola sobre `prod-prueba`. Reservá para fase 6 la recepción real en Vercel.

3. **IMPORTANTE — §4; D10: el criterio final sigue contradiciendo las variantes obligatorias.**  
   **Problema:** D10 exige evidencia D1–D9 «sobre el mismo build identificado», aunque D3 requiere un build rechazado, D8 otra configuración y D4/D7 un fixture adversarial.  
   **Evidencia:** la matriz de §4 distingue cuatro variantes; D10 mantiene literalmente el requisito anterior. Un build fallido tampoco tiene necesariamente artefactos servidos que hashear.  
   **Arreglo concreto:** cambiá D10 por «cada evidencia vinculada al manifiesto de su variante, construidas desde el mismo commit y lockfile». Exigí D7/D9 sobre el mismo artefacto base y registrá entradas, diagnóstico y código de salida para `prod-bloqueada`.

4. **IMPORTANTE — §2.3, antiabuso; fase 6: falta probar el formulario después de restringir el dominio.**  
   **Problema:** verificar un envío desde `www` **antes** de activar la restricción no valida la configuración que queda funcionando al lanzamiento.  
   **Evidencia:** §2.3 establece ese orden, pero no exige repetir el envío después. La [restricción de dominio](https://docs.web3forms.com/getting-started/pro-features/restrict-to-domain) modifica qué orígenes acepta Web3Forms.  
   **Arreglo concreto:** agregá como condición de fase 6 un envío autorizado desde `https://www.noctilabs.io`, **con la restricción ya activa**, confirmando recepción y campos de consentimiento. Registrá también rechazo desde un origen no autorizado.

5. **IMPORTANTE — §2.2 y §2.1: el bloqueo legal depende de variables que Vercel permite deshabilitar.**  
   **Problema:** `LEGAL_FIXTURE` junto con `VERCEL` no garantiza que un deploy real rechace datos sintéticos. Tampoco `VERCEL_ENV === 'production'` garantiza rechazar marcadores si faltan las variables del sistema.  
   **Evidencia:** Vercel permite desactivar su exposición; `VERCEL` indica que fueron expuestas. [Variables del sistema](https://vercel.com/docs/environment-variables/system-environment-variables). Con esa configuración, desaparecen las señales usadas por el bloqueo, Analytics y el `noindex` del HTML.  
   **Arreglo concreto:** definí un perfil obligatorio de publicación que rechace marcadores y fixtures independientemente de esas señales. En fase 6 verificá la exposición de variables y exigí inspección del artefacto final: ningún marcador, dato sintético ni `NO-PUBLICAR.txt`. Separá la salida de los fixtures del directorio usado para publicar.

6. **IMPORTANTE — §2.3; D2: se pueden perder cambios hechos mientras el envío está pendiente.**  
   **Problema:** el controlador permite seguir editando después de capturar el payload. Si llega éxito, oculta el formulario y elimina la protección de salida, aunque esas últimas modificaciones nunca se enviaron.  
   **Evidencia:** [contact-form.ts](C:/Users/adria/OneDrive/Escritorio/TOODO/noctilabs-web/src/scripts/contact-form.ts:57) deshabilita solamente el botón; captura los valores en L74 y oculta el formulario en L81. Antes, el stub siempre rechazaba: el envío real vuelve alcanzable esta pérdida.  
   **Arreglo concreto:** bloqueá los controles durante el request después de capturar el payload, o preservá explícitamente cualquier modificación posterior como borrador pendiente. D2 debe retrasar una respuesta exitosa e intentar editar campos y consentimiento durante la espera.

7. **IMPORTANTE — §2.3, payload; D2: `page` no tiene un contrato que evite filtrar datos de la URL.**  
   **Problema:** el SPEC admite enviar `location.href`, con query y fragmento, al proveedor y al correo. El filtrado previsto para Analytics no protege este envío.  
   **Evidencia:** §2.3 enumera `page` sin definir su valor; §2.7 sí exige quitar esos componentes. Un formulario abierto desde una URL con email o token podría reenviarlos como metadatos.  
   **Arreglo concreto:** fijá `page` como la URL canónica de Hablemos para el idioma, derivada de `alternates()`, sin query ni fragmento. En D2 abrí una URL con valores sintéticos sensibles y comprobá que ninguno viaje en el payload.

8. **MENOR — D1: quedaron dos contratos incompatibles para los diagnósticos editoriales.**  
   **Problema:** la primera oración permite solamente `[insights] excluido: …`; la última permite además `[insights] <id>: bloque no admitido …`.  
   **Evidencia:** ambas restricciones aparecen en la misma celda de D1. Un fixture con bloques ignorados cumple una y viola la otra.  
   **Arreglo concreto:** eliminá la formulación vieja y dejá un único criterio: cero diagnósticos inesperados, con todos los avisos editoriales esperados enumerados por fixture.