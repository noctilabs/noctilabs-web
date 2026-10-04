GATE: NO

Verificación de las pasadas anteriores, contra el **contrato del spec**, no contra una implementación:

| Tema | Pasada 1 | Pasada 2 | Pasada 3 | Estado y evidencia actual |
|---|---|---|---|---|
| Curvas de Centro | 1 | — | — | Resuelto: §6.3 y C4. |
| Visibilidad, interrupciones y pausa del chat | 2, 5 | 2, 3 | — | Resuelto: fila persistente y transiciones de §4.3. |
| Anuncios manuales | 6 | 12, parte de anuncios | 8 | Parcial: región persistente, repetición de texto y verificación real definidos; queda el conflicto del hallazgo 2 de esta pasada. |
| Layout, contenedores y acceso angosto | 3, 4, 12 | 4 | — | Resuelto: §4.1 y cortes propios de `flow` en §4.5. |
| Datos, fuentes, OC y corridas | 7–10, 19 | 5–7, 9 | 2–5 | Resuelto para los problemas señalados: §§4.7–4.8 y C11. |
| Alcance de roles | — | 8 | — | Resuelto: §4.4b y nota del home ajustada. |
| Contraste | 11 | 1 | — | Resuelto: colores efectivos en §4.9 y contraste global sobre textura en §3.4/C5. |
| Scroll, alternativas textuales y foco | — | 10; 12, parte de foco | 1 | Resuelto: §4.9 y C5. |
| SSR y controles previos a hidratar | 13 | — | — | Resuelto: §3.3 y C6. |
| Textura, almacenamiento, rendimiento y DPR | 14, 15 | 11, 13, 15 | 7 | Resuelto: §3.4 y escenarios de C9. |
| Contenido ilustrativo y usuario | 16 | — | — | Resuelto: §4.6. |
| React e imports | 18 | — | — | Resuelto: §3.1 y C8. |
| Formatos ES/EN | — | — | 6 | Resuelto: §3.2 y ejemplos exigidos por C10. |
| Matriz, presupuesto y erratas | 17 | 12, parte de matriz; 14 | 9 | Resuelto: C2–C12, `flow` corregido y rechazo exclusivo desde Control. |

1. **BLOQUEANTE — §§4.6, 4.8, §6; C2/C5: fidelidad y reflow siguen dando instrucciones incompatibles.**  
   **Problema:** se agregaron nombres de aprobación largos sin autorizar la adaptación de los estilos que los recortan. También se conserva una fila del compositor que no entra en angosto.  
   **Evidencia:** App L273 impone `white-space:nowrap` al botón; §4.8 ahora exige «Aprobar corrida (planes de pago y recordatorios)». A 320 px de embed, descontando padding del contenido y del panel, quedan aproximadamente **254 px** para ese control. App L137–140 pone dos chips sin corte y el envío en una fila sin `flex-wrap`; L15 recorta el desborde con `overflow:hidden`. C2 admite únicamente diferencias de §6, mientras C5 exige reflow sin pérdida. Los botones y chips no tienen la excepción bidimensional de las tablas. [WCAG 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).  
   **Arreglo:** autorizá en §6 que botones, chips y filas auxiliares corten línea o se apilen según el ancho disponible. Especificá `max-width:100%`, texto envolvente y `flex-wrap` donde corresponda. C5 debe comprobar estos controles concretos en ES/EN, a 320 px y dentro de los marcos reales de Producto.

2. **IMPORTANTE — §4.3; C3/C5: el fin del chat puede cancelar su propio anuncio manual.**  
   **Problema:** en la variante normal, elegir un rol termina en una repetición automática inmediata. El anuncio solicitado al terminar esa misma secuencia necesita una escritura posterior, ligada a la generación que la repetición invalida.  
   **Evidencia:** SPEC L156 ordena repetir al finalizar; L167 ubica el anuncio manual al terminar la secuencia; L169 exige vaciar y escribir en un tick posterior, descartando el anuncio si se reemplaza la generación. App L537–538 separa el pie de la respuesta del reinicio por 5200 ms. El contrato permite que se vacíe la región y se cancele la escritura de la respuesta.  
   **Arreglo:** ubicá el anuncio manual al completar la respuesta y su pie, **antes** de los 5200 ms de permanencia y del evento de repetición/rotación. Agregá a C5 el recorrido «elegir rol en variante normal → respuesta completa → repetición», comprobando una sola escritura completa y ningún anuncio del ciclo automático.

3. **IMPORTANTE — §§3.2, 4.7; C11: quedan dos totales monetarios incompatibles con sus filas.**  
   **Problema:** «el resto se transcribe literal» conserva importes agregados incorrectos.  
   **Evidencia:** Comercial muestra **$21,5 M en juego** en App L444, pero L451 suma $6.200.000 + $11.450.000 + $3.900.000 = **$21.550.000**. Compras muestra **$28,6 M a reponer** en L459, pero L466 suma $18.400.000 + $7.950.000 + $2.300.000 = **$28.650.000**. Redondeados a un decimal son **$21,6 M** y **$28,7 M**. Ninguna corrección actual cubre esos totales.  
   **Arreglo:** guardá los montos exactos de las filas y derivá ambos agregados. Mostralos con precisión explícita y consistente. Si representan otro alcance, rotulalo y documentá su cálculo. Sumá ambas comprobaciones a §4.7/C11 en ES y EN.

4. **MENOR — §4.3; C3: falta la espera inicial del chat.**  
   **Problema:** el contrato de tiempos omite un tramo de la fuente y no lo declara como diferencia.  
   **Evidencia:** App L530 inicia el cronograma en **500 ms**; §4.3 comienza directamente con el tipeo. C3 exige verificar sus tiempos y C2 restringe las diferencias a §6.  
   **Arreglo:** incorporá los 500 ms antes del primer carácter, sujetos a la misma pausa y cancelación del controlador, o autorizá explícitamente su eliminación.