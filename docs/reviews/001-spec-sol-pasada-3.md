GATE: NO

1. **BLOQUEANTE — §3.5/Megamenú, paso 3; A7: Tab tiene un destino imposible después del cierre.**  
   **Problema:** el tercer caso cierra el panel fijo, pero después exige que «en todos los casos […] el siguiente Tab entra al primer link del panel».  
   **Evidencia:** L234–236 contradice L230: un panel cerrado tiene `hidden` y queda fuera de tabulación. El contrato señalado en P1-4 sigue sin poder cumplirse íntegramente.  
   **Arreglo:** limitá esa entrada de Tab a las activaciones cuyo resultado sea un panel abierto. Después de cerrarlo, Tab continúa por los controles visibles. A7 debe registrar explícitamente apertura → cierre → Tab.

2. **IMPORTANTE — §3.5/Megamenú, paso 4: reentrar con el puntero puede deshacer el modo fijo.**  
   **Problema:** no se define qué hace `mouseenter` sobre el mismo grupo cuando su panel ya está fijo. La lectura literal lo vuelve `hover`; entonces la siguiente activación lo fija otra vez, en lugar de cerrarlo.  
   **Evidencia:** L237 prescribe abrir «en modo `hover`» sin condición sobre el estado anterior; L233–234 distingue el resultado del botón según ese modo. La corrección de P2-3 queda incompleta para esta secuencia.  
   **Arreglo:** establecé que entrar al grupo de un panel fijo conserva su modo. Agregá a A7: hover → click para fijar → salir y volver con el puntero → click para cerrar.

3. **IMPORTANTE — §3.5/Mobile, paso 7; A7: desktop → mobile todavía puede perder el foco.**  
   **Problema:** sólo se traslada al logo el foco que estaba en un botón o dentro de un panel. También desaparecen los labels del nav desktop y su CTA, que ahora son links.  
   **Evidencia:** L273–274 excluye esos `<a>` de L203–210 y L224–225. P2-5 pedía cubrir cualquier foco que fuera a quedar oculto.  
   **Arreglo:** extendé la regla a cualquier control desktop que desaparezca al cruzar el breakpoint, incluidos los cuatro labels y Hablemos. A7 debe distinguir foco en link del nav, CTA, chevron y link del megamenú.

4. **IMPORTANTE — §3.5/Megamenú, paso 6: Esc no descarta una apertura sólo por hover.**  
   **Problema:** con el foco en el contenido y el puntero sobre Producto, el panel abre, pero Esc no tiene comportamiento definido porque el foco no está en el botón ni en el panel.  
   **Evidencia:** L237 frente a L244. Un submenú que tapa contenido debe poder descartarse sin mover el puntero ni el foco. [W3C: contenido por hover o foco](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html).  
   **Arreglo:** mientras haya un megamenú abierto, Esc lo cierra también desde fuera del grupo. Conservá el foco si estaba fuera; devolvelo al botón si estaba dentro del panel. Mantené la inhibición de reapertura hasta salir y reentrar con el puntero. Registrá ambas variantes en A7.

5. **IMPORTANTE — S1(b) y S1(d): quedan comportamientos públicos sin casos que los distingan.**  
   **Problema:** una implementación que normalice el fragmento únicamente en español puede aprobar; también una que acepte indebidamente el prefijo `/es/`.  
   **Evidencia:** L386 prueba fragmento sin `#` y vacío sólo en español; en inglés únicamente `'#bi'`. Los negativos de `pageFromPath` no incluyen rutas con prefijo del idioma por defecto. P2-1 queda parcialmente pendiente en cobertura, aunque el contrato del fragmento ya está corregido.  
   **Arreglo:** agregá expectativas literales para `'overview'`, `'#overview'` y `''` en inglés, y un fragmento sobre un `PageRef` distinto de Producto, porque la firma lo permite. Sumá negativos como `/es/`, `/es/producto/`, `/producto/extra/` y `/en/industries/manufactura/`, todos con resultado `null`. Todo esto pertenece a S1.

6. **IMPORTANTE — A4: la matriz completa de rutas no comprueba todo el documento exigido.**  
   **Problema:** pueden aprobar páginas con títulos repetidos, sin descripción o con H1 incorrectos. S1 no verifica los argumentos ni el contenido de las páginas.  
   **Evidencia:** A4, L398, recoge idioma, canonical, alternates y selector; omite los títulos y descripciones de L129 y los H1 de L318–329. A6 sólo pide capturas de header y footer.  
   **Arreglo:** agregá a la matriz manual el title, la descripción y el H1 observado de cada página, contrastados con el copy aprobado. Registrá también los cinco destinos de Producto, sus H2, `tabindex` y marcadores placeholder. Adjuntá una comprobación de los demás requisitos del head —viewport, favicon, theme-color y preload— sin agregar otra costura automática.

7. **IMPORTANTE — A10: siguen ambiguos los imports transitivos.**  
   **Problema:** «cada módulo externo que la página referencia» admite contar solamente los archivos referenciados directamente por el HTML, dejando afuera sus imports y chunks compartidos.  
   **Evidencia:** L404 fija correctamente bytes, compresión separada y deduplicación, pero no explicita el recorrido de dependencias. P1-16 y P2-11 quedan parcialmente pendientes en ese punto.  
   **Arreglo:** incluí expresamente los módulos alcanzables mediante imports estáticos y dinámicos del código cliente de esa página, incluidos los imports desde scripts inline. Deduplicá los externos por URL y adjuntá ese inventario completo con las sumas.

8. **IMPORTANTE — A6: la comparación visual todavía carece de condiciones equivalentes.**  
   **Problema:** usar el mismo navegador no alcanza para comparar superficies glass si cambian el fondo detrás, la textura o la disponibilidad de Geist Mono.  
   **Evidencia:** L400 no fija esas condiciones, pedidas en P1-12. El diseño tiene textura animada por defecto —L512 y L753–756—, mientras §4 la posterga. Header y megamenús usan transparencia y blur.  
   **Arreglo:** fijá textura desactivada en la referencia, fuentes cargadas antes de capturar y el mismo fondo detrás de los recortes del header y megamenús. Enumerá las diferencias inevitables por contenido placeholder y por idioma. Así la evidencia permite distinguir una diferencia autorizada de un error visual.

9. **IMPORTANTE — §3.5 y A9: las excepciones declaradas no cubren reglas que el propio spec contradice.**  
   **Problema:** A9 exige cerrar todos los hallazgos salvo dos excepciones, pero el logo debe carecer de hover visual y los ítems del megamenú deben bajar a opacidad `.65` al hacer hover.  
   **Evidencia:** L199 y L220 frente a L403. Las guidelines exigen feedback visual de hover en links y que los estados interactivos aumenten su prominencia o contraste. [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).  
   **Arreglo:** documentá esas dos decisiones de fidelidad como excepciones adicionales, con su alcance concreto, o cambiá los estilos prescritos. A9 necesita una regla consistente para resolver esos hallazgos.

10. **MENOR — A11: falta pedir evidencia del 200 de los destinos.**  
    **Problema:** el criterio exige que `/producto/` y `/en/product/` respondan 200, pero los comandos enumerados sólo acreditan las redirecciones y las dos 404.  
    **Evidencia:** L405 pide `curl -I` de las redirecciones y GET de las 404; un HEAD sin seguimiento sobre la URL sin barra termina en el 308. P2-9 queda parcialmente pendiente en la evidencia de los destinos.  
    **Arreglo:** pedí además HEAD o GET de ambas URLs con barra y adjuntá sus respuestas 200.