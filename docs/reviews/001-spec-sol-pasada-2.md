GATE: NO

1. **BLOQUEANTE — §3.2, §3.5 y S1(b): contrato contradictorio del fragmento.**  
   **Problema:** `href` agrega `#hash`, pero los consumidores pasan `'#overview'`. Una implementación literal produce `/producto/##overview`, sin destino válido. El hallazgo 3 de la pasada 1 queda parcialmente pendiente: existen los destinos, pero el contrato puede generar enlaces rotos.  
   **Evidencia:** L103 frente a L217; S1(b) no fija una entrada y salida concretas.  
   **Arreglo:** definí que `href` normaliza un único `#` inicial y que tanto `'overview'` como `'#overview'` devuelven `/producto/#overview`. Precisá el comportamiento del fragmento vacío y agregá esos resultados literales a S1, en ambos idiomas.

2. **BLOQUEANTE — §3.5/Megamenú y A7: la prioridad entre hover y foco sigue incompleta.**  
   **Problema:** con foco en un link de Producto, pasar el puntero por Industrias abre ese panel y oculta Producto, incluido el elemento enfocado. No hay destino de foco definido. La protección del paso 4 solamente impide el cierre retardado; no impide el cierre provocado por abrir otro panel. El hallazgo 4 anterior no quedó completamente resuelto.  
   **Evidencia:** combinación de los pasos 1, 2 y 4, L223–229.  
   **Arreglo:** mientras el foco permanezca en un panel o su botón, ignorá el hover de otro grupo. Permití el cambio mediante activación explícita del otro botón, conservando el foco allí. Cancelá o invalidá los temporizadores del panel anterior. A7 debe registrar estas secuencias combinadas y comprobar el foco final.

3. **IMPORTANTE — §3.5/Megamenú: el primer click puede cerrar lo que acaba de abrir el hover.**  
   **Problema:** entrar con el mouse al chevron abre el panel; hacer click inmediatamente lo cierra porque el botón alterna el estado. El contrato es ejecutable, pero introduce una interacción sorprendente que el checklist no identifica.  
   **Evidencia:** pasos 3 y 4, L225–229.  
   **Arreglo:** distinguí apertura por hover de apertura explícita: el primer click sobre un panel abierto solamente por hover confirma su apertura; la siguiente activación lo cierra. Definí también el resultado para Enter/Espacio y anotá ambas secuencias en A7.

4. **IMPORTANTE — §3.5/Mobile y A7: cerrar sobre un ancla local no define la continuación del foco.**  
   **Problema:** al activar un link desde el teclado, el panel se oculta antes del scroll. El spec no establece dónde queda el foco ni desde dónde continúa Tab. Además, “tocar” no exige explícitamente el mismo comportamiento para Enter. El hallazgo 8 anterior sigue parcialmente pendiente.  
   **Evidencia:** paso mobile 3, L254; los destinos de Producto son secciones sin `tabindex` definido, L298–300.  
   **Arreglo:** aplicá el cierre a toda activación normal del enlace. Para fragmentos de la misma página, cerrá el panel, enfocá el destino con `tabindex="-1"` y desplazalo respetando los 84px. Verificá manualmente Enter, toque y activación del fragmento que ya está en la URL.

5. **IMPORTANTE — §3.5 y A7: falta la transición desktop → mobile.**  
   **Problema:** solamente se regula mobile → desktop. Achicar la ventana con foco dentro de un megamenú puede ocultar el control enfocado y conservar un estado que reaparece al volver a desktop.  
   **Evidencia:** L257–258 define una sola dirección; A7 menciona 999/1000px sin establecer el resultado inverso.  
   **Arreglo:** al entrar a mobile, cerrá ambos megamenús, cancelá sus temporizadores y trasladá al logo cualquier foco que vaya a quedar oculto. Al volver a desktop, todos los paneles deben permanecer cerrados. Registrá ambas direcciones, con foco en botón y en link.

6. **IMPORTANTE — §3.2 y S1: faltan límites públicos y cobertura explícita de normalización.**  
   **Problema:** `pageFromPath` se declara inversa de un `href` que admite fragmentos, pero no aclara si recibe exclusivamente `pathname` o también query/hash. S1 exige solamente `/producto` como ejemplo sin barra; una implementación que rechace `/en/product` podría aprobar. Tampoco explicita que (c) cubre los diez `PageRef`.  
   **Evidencia:** L103–106 y L370; el tipo de retorno deja `locale` sin tipo escrito.  
   **Arreglo:** declaralo como `locale: 'es'|'en'`; fijá que recibe exclusivamente un pathname y que la inversión corresponde a `href` sin fragmento. Exigí las variantes sin barra de todas las rutas aplicables, resultados `{page, locale}` literales, los diez resultados de `alternates` y negativos como `/en/producto/` y `/404.html`. Incluí una comprobación negativa de tipos para `IndustryId` dentro de S1, verificada por A1.

7. **IMPORTANTE — A4: el muestreo no acredita el criterio universal.**  
   **Problema:** se exige corrección en veinte páginas, pero se inspeccionan solamente tres páginas normales y una 404. Un `PageRef` equivocado en otra página puede generar canonical y alternates incorrectos y pasar esta revisión.  
   **Evidencia:** L382; S1 prueba las funciones, no los argumentos que les pasan las páginas.  
   **Arreglo:** adjuntá una matriz manual de las veinte páginas con `lang`, canonical, tres alternates y destino del selector. Agregá una fila separada para la 404 que compruebe title bilingüe, `noindex`, bloque inglés y ausencia de canonical, alternates y selectores.

8. **IMPORTANTE — A5: falta distinguir navegación entre páginas y navegación local.**  
   **Problema:** recorrer los enlaces desde una página arbitraria por idioma no demuestra el cierre del menú ni el foco y scroll al activar anclas estando ya en Producto. Tampoco se pide registrar el destino observado.  
   **Evidencia:** L383 frente al comportamiento especial de L254 y al margen de L268–269.  
   **Arreglo:** exigí recorridos desde home y desde Producto, en ambos idiomas, incluyendo header, mobile y footer. Para las cinco anclas, registrá URL final, existencia del destino, posición visible y, cuando corresponda, foco. Sumá un recorrido sin JS para verificar los labels que deben seguir funcionando.

9. **IMPORTANTE — A11: `curl -I` no demuestra que se sirva la 404 bilingüe.**  
   **Problema:** HEAD acredita status y headers, pero no identifica el documento devuelto. Una 404 genérica de Vercel pasaría con la evidencia pedida. El hallazgo 11 anterior queda parcialmente pendiente.  
   **Evidencia:** L389; Vercel sirve el archivo `404.html` como cuerpo para rutas estáticas inexistentes. [Documentación de Vercel](https://vercel.com/kb/guide/custom-404-page).  
   **Arreglo:** conservá HEAD para verificar 308 y `Location`; agregá GET de `/nada/` y `/en/nada/`, adjuntando status y cuerpo con los dos bloques y links a ambos homes. Comprobá también que ambos destinos de las redirecciones responden 200.

10. **IMPORTANTE — §8, A8 y A12: el plan exige evidencia antes de crear el preview.**  
    **Problema:** el paso 4 verifica A8 “en el preview”, pero Vercel aparece recién en el paso 7. El gate de implementación también ocurre antes de obtener A11.  
    **Evidencia:** L386 y L410–413.  
    **Arreglo:** creá el preview antes de las verificaciones que lo necesitan y ubicá el gate final después de reunir A1–A11. El veredicto debe corresponder al mismo commit desplegado y revisado.

11. **MENOR — A10: la medición de JS todavía admite resultados distintos.**  
    **Problema:** `gzip -9` fija el nivel, pero no define si se comprimen archivos por separado o concatenados, cómo se deduplican imports ni cuántos bytes significa “3 KB”. El hallazgo 16 anterior queda parcialmente pendiente.  
    **Evidencia:** L388.  
    **Arreglo:** fijá el umbral en bytes, contá cada módulo externo una vez por página y definí cómo agrupar los scripts inline. Usá `gzip -9 -n` y adjuntá el inventario y las sumas por página.