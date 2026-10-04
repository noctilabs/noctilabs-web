GATE: NO

Verificación de la pasada 1, contra el contrato del SPEC actual:

| # | Estado | Evidencia |
|---|---|---|
| 1 | Resuelto | §6.3 limita también Centro a tres repeticiones; C4 cubre reduced motion. |
| 2 | Resuelto | §4.3 observa una franja acotada; C3 incluye viewport bajo y zoom. |
| 3 | Resuelto | §4.1 agrega conversaciones y usuario en angosto; C3 exige recorrerlos. |
| 4 | Resuelto | §4.1 separa wrapper, shell y contenedores nombrados. |
| 5 | Resuelto | §4.3 define cancelación, generación, pausa y elección manual. |
| 6 | Parcial | La región polite está definida; C5 todavía puede aprobar anuncios sin comprobarlos. Hallazgo 8. |
| 7 | Parcial | Se separan compras y lotes, pero el alcance de la aprobación no coincide con las acciones liberadas. Hallazgo 3. |
| 8 | Parcial | La OC tiene estado único; falta reconciliar el total de agentes activos. Hallazgo 2. |
| 9 | Parcial | Se corrigen importes y corridas; quedan conteos incompatibles y actividad sin fecha. Hallazgos 3–4. |
| 10 | Parcial | Lista y Centro comparten catálogo, pero faltan correspondencias para fuentes específicas. Hallazgo 5. |
| 11 | Resuelto | §4.9 exige contraste efectivo y texto opaco. |
| 12 | Resuelto | §4.5 elimina la escala y usa el espacio disponible del flujo. |
| 13 | Resuelto | §3.3 define SSR determinista y controles deshabilitados; C6 cubre carga lenta y ausencia de JS. |
| 14 | Resuelto | §3.4 protege almacenamiento y fija precedencia. |
| 15 | Resuelto | §3.4 y C9 unifican fps y amplían la medición y el escenario. |
| 16 | Resuelto | §4.6 incluye compositor, envío y disclosure de usuario. |
| 17 | Parcial | Se amplían matriz, transiciones y regresiones; persiste la limitación de anuncios. Hallazgo 8. |
| 18 | Resuelto | §3.1 especifica integración, JSX, tipos e imports; C8 controla el bundle. |
| 19 | Resuelto | §4.7.8 corrige ambos conteos en ES y EN. |

Verificación de la pasada 2:

| # | Estado | Evidencia |
|---|---|---|
| 1 | Resuelto | §3.4 oscurece `--muted`; C5 mide todo el sitio sobre la textura. |
| 2 | Resuelto | §4.3 exige conservar el mismo nodo anterior a la conversación. |
| 3 | Resuelto | §4.3 conserva pausa manual y condiciona el avance; abrir conversación actualiza identidad y permisos. |
| 4 | Resuelto | §4.1 define `flow` y `roledemo` con `container-type`; queda una frase contradictoria. Hallazgo 9. |
| 5 | Parcial | §4.8 amplía representaciones derivadas, pero omite totales y deja ambiguo el alcance de los lotes. Hallazgos 2–3. |
| 6 | Resuelto en §4.8 | La tabla define rechazo exclusivamente desde Control; C3 conserva una exigencia contradictoria. Hallazgo 9. |
| 7 | Parcial | Se clasifica el catálogo y se resuelve WMS; faltan referencias específicas. Hallazgo 5. |
| 8 | Resuelto | §4.4b limita la simulación y rotula las vistas de ejemplo. |
| 9 | Resuelto | §4.7.5 fija intervalos completos, importes exactos y redondeo. |
| 10 | Resuelto | §§4.5 y 4.9 agregan alternativas del flujo, Centro y gráfico. |
| 11 | Parcial | §3.4 define redibujado en pausa; C9 no exige comprobarlo ni queda definido el disparador de DPR. Hallazgo 7. |
| 12 | Parcial | Roles, cortes y foco están cubiertos; el anuncio real sigue siendo opcional. Hallazgo 8. |
| 13 | Resuelto | C9 identifica equipo, navegador, throttling, página y comparación activa/pausada. |
| 14 | Resuelto | C8 conserva presupuesto base, suma textura e isla e incluye hidratación. |
| 15 | Resuelto | Botones de acción sin `aria-pressed`; control del fondo oculto hasta inicializar y bajo reduced motion. |

1. **BLOQUEANTE — §4.2, §4.9, C3/C5: el scroll de tablas y de Centro puede quedar inaccesible por teclado.**  
   **Problema:** el SPEC garantiza una región enfocable únicamente para el flujo de Agentes. Portar las otras regiones como están en la fuente deja columnas y contenido fuera de alcance en navegadores que no enfocan automáticamente los contenedores desplazables.  
   **Evidencia:** App L196–197, L305–306 y L318–319 usan tablas de al menos 520 px; L384–385, de 600 px; L328–329 contiene Centro de 700 px. Sus wrappers tienen `overflow-x:auto`, sin `tabindex` ni alternativa de desplazamiento. C3 enumera botones y cambios de vista, pero no exige llegar al extremo derecho de estas regiones. Incumple [WCAG 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html); la [documentación de overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow#accessibility) describe este problema.  
   **Arreglo:** extender el contrato de región enfocable y nombrada a Transacciones, Trazabilidad, Lista, Permisos y Centro cuando desborden. En C5, exigir llegar con teclado a ambos extremos, leer todas las columnas y salir con Tab, a 320 px, también sin JS.

2. **IMPORTANTE — §4.7.3, §4.8, C11: aprobar Compras todavía puede dejar totales incompatibles.**  
   **Problema:** la tarjeta de Compras deriva su estado de la OC, pero «Agentes activos: 2» queda fijado aparte. Tampoco se define cómo cambia el encabezado de Agentes.  
   **Evidencia:** SPEC L222 fija dos activos y Compras pausado; L232 exige derivar el estado de su tarjeta. App L209 muestra «2 activos · 1 pausado» y L590 muestra «Aprobado · ejecutando acciones» después de aprobar.  
   **Arreglo:** definir una tabla para `pending`, `approved` y `rejected` que incluya estado de Compras, KPI de Inicio y encabezado de Agentes. Si aprobar reactiva Compras, ambos totales pasan a tres activos. Si sigue pausado por otro motivo, identificar ese motivo y corregir «ejecutando acciones». Incluir los totales en C11.

3. **IMPORTANTE — §4.7.4, §4.8: aprobar un lote libera acciones que su nombre no incluye.**  
   **Problema:** el lote de Cobranzas comprende solamente planes de pago, pero el flujo pone también los recordatorios detrás de esa aprobación. Comercial tiene la misma ambigüedad entre cotizaciones y seguimientos. Además, el log de Cobranzas sigue sin una fecha que lo separe de la corrida pendiente.  
   **Evidencia:** SPEC L245 define los lotes como planes y cotizaciones. App L432–434 y L447–449 contiene las salidas en espera; L577 convierte **todas** las tarjetas no terminadas en aprobadas o en curso con el mismo toggle. L436 llama al recordatorio «automático», mientras L501 registra un recordatorio enviado a las 09:42 sin fecha. La corrección de ayer no identifica explícitamente ese log.  
   **Arreglo:** definir qué acciones autoriza cada lote. Podés conservar un único estado por corrida, ampliando nombre y explicación a todas las acciones dependientes; o dejar los recordatorios y seguimientos fuera de esa aprobación y representarlos coherentemente. Fechar también el log y la trazabilidad histórica. Verificar cada salida antes y después en C11.

4. **IMPORTANTE — §4.7.5, C11: la partición de deuda no concuerda con los clientes del flujo.**  
   **Problema:** los tres grupos cubren todo el importe vencido, pero abarcan 57 clientes, mientras la misma corrida declara 186 clientes con deuda.  
   **Evidencia:** SPEC L224 asigna 38, 12 y 7 clientes a categorías exhaustivas. App L427 y L438 mantiene «186 clientes con deuda». Aunque un cliente apareciera en más de un intervalo, la unión de esos grupos no podría superar 57.  
   **Arreglo:** reconciliar cantidades y alcance. Para conservar los grupos actuales, usar 57 clientes con deuda en esa corrida; si 186 pertenece al historial general, rotularlo así y corregir el resultado de la corrida. Agregar esta corrección a §4.7 y C11.

5. **IMPORTANTE — §4.7.9: el catálogo no alcanza para preservar las referencias de la app.**  
   **Problema:** se exige derivar los pies del catálogo, pero varias referencias de la fuente no tienen una correspondencia definida. Eliminarlas pierde precisión; transcribirlas conserva fuentes que no aparecen en Conexiones.  
   **Evidencia:** App L475 cita «Tablero de ventas»; L191, «Lista de precios.xlsx»; L296, «Contrato Plastar 2026.pdf» y «Política de compras». SPEC L228 enumera ocho fuentes generales, sin mapear esos documentos o vistas.  
   **Arreglo:** definir referencias simples `{ sourceId, label }`: cada documento, módulo o tablero apunta a una de las ocho fuentes y conserva su etiqueta localizada. Enumerar esas correspondencias y exigir en C11 que ninguna referencia quede sin fuente. No hace falta otro catálogo independiente.

6. **IMPORTANTE — §3.2, §4.7, C10: traducir copy no garantiza formatos EN correctos.**  
   **Problema:** los datos siguen siendo strings con formatos españoles; el contrato EN comprueba idioma, pero no números, monedas, porcentajes ni fechas.  
   **Evidencia:** App L466 usa `18.400.000`; L499 contiene `19,4%`; L503, `86.120`; L636 fuerza coma decimal mediante `replace('.', ',')`. SPEC L247 agrega fechas como «2 oct». Las [Guidelines de Vercel, Locale & i18n](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) requieren `Intl.NumberFormat` e `Intl.DateTimeFormat`.  
   **Arreglo:** conservar valores numéricos y fechas fijas como datos; formatearlos según `locale`, con moneda y zona horaria explícitas cuando corresponda. Reservar la traducción para labels y prosa. Agregar ejemplos verificables ES/EN a C10, manteniendo SSR determinista.

7. **IMPORTANTE — §3.4, C4/C9: el cambio de DPR en pausa sigue sin una verificación suficiente.**  
   **Problema:** observar dimensiones CSS no garantiza detectar un cambio de densidad de pantalla. Con el RAF cancelado, el canvas puede conservar el bitmap anterior.  
   **Evidencia:** SPEC L83 define `ResizeObserver`; L87 exige responder también a DPR. C9 solo mide escenarios separados a DPR 1 y 2, sin cambiarlo durante la pausa. La [documentación de `devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) contempla un listener de resolución que se rearma después de cada cambio.  
   **Arreglo:** definir ese disparador, además del observer de tamaño, y un único procedimiento de actualizar bitmap y dibujar con fase congelada. C9 debe cubrir resize, orientación y DPR mientras hay pausa manual y reduced motion, comprobando que no reaparece el bucle.

8. **IMPORTANTE — §4.3, C5: observar escrituras no demuestra los anuncios exigidos.**  
   **Problema:** C5 puede darse por cumplido sin lector de pantalla aunque exige «anuncio único» y silencio. Una escritura en una región viva no prueba que se anuncie, especialmente al abrir dos veces la misma conversación.  
   **Evidencia:** SPEC L315 admite reemplazar la comprobación del lector por `MutationObserver`. L158 no define cómo vuelve a anunciarse una respuesta idéntica ni cuándo termina una interacción que muestra contenido estático inmediatamente. La regla de actualizaciones asíncronas está en las [Guidelines de Vercel](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).  
   **Arreglo:** definir anuncio inmediato para conversaciones estáticas y anuncio al completar la respuesta manual animada. Para repetir texto, vaciar y escribir en actualizaciones efectivamente separadas, cancelables por generación. Separar en C5 «contrato DOM verificado» de «anuncio comprobado»: sin lector, este último queda pendiente, no aprobado por inferencia.

9. **MENOR — §4.5, C3: quedan dos instrucciones contradictorias de la pasada anterior.**  
   **Problema:** el implementador todavía encuentra dos anchos y dos contratos de rechazo.  
   **Evidencia:** SPEC L184 dice «según el ancho del contenedor `app`», aunque la tabla usa `flow`. L313 vuelve a exigir OC «rechazada […] desde Control y desde Compras», pese a que §4.8 y el inicio de C3 restringen el rechazo a Control.  
   **Arreglo:** reemplazar `app` por `flow`; escribir en C3 «aprobar/deshacer desde ambos accesos; rechazar desde Control y comprobar su reflejo en Compras».