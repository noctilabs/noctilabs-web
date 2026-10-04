GATE: NO

| Hallazgo de pasada 1 | Estado | Verificación contra el spec actual |
|---|---|---|
| 1. Animación indefinida de Centro | Resuelto | §6.3 limita las repeticiones; C4 cubre reduced motion. |
| 2. Disparador de visibilidad | Parcial | Se eliminó el 35 %, pero el nuevo bloque observado depende del estado del chat. Hallazgo 2 abajo. |
| 3. Funcionalidades ausentes en angosto | Resuelto | §4.1 agrega conversaciones y usuario; C3 exige recorrerlos. |
| 4. Contenedor consultándose a sí mismo | Resuelto | §4.1 separa wrapper y shell descendiente. |
| 5. Interrupciones del chat | Parcial | Hay controlador y cancelación, pero falta la precedencia entre pausa manual y transiciones automáticas. Hallazgo 3. |
| 6. Anuncios de respuestas manuales | Resuelto en el contrato | §4.3 incorpora una región polite persistente. La verificación sigue siendo insuficiente: hallazgo 12. |
| 7. Conteo de aprobaciones | Parcial | Se distinguen compras y lotes, pero siguen sin definirse los dos pendientes de Cobranzas ni su actualización. Hallazgo 5. |
| 8. Estado compartido de OC-4471 | Parcial | §4.8 introduce el estado único, pero omite indicadores y deja transiciones contradictorias. Hallazgos 5–6. |
| 9. Datos y antigüedad de deudas | Parcial | Se corrigieron importes, causas y corridas; los intervalos siguen sin formar una partición completa. Hallazgo 9. |
| 10. Lista y Centro | Parcial | Comparten registros, pero falta clasificar las fuentes y reconciliarlas con los contextos consultados. Hallazgo 7. |
| 11. Contraste efectivo dentro de la isla | Resuelto | §4.9 exige medición efectiva y texto opaco. La textura introduce otro problema global: hallazgo 1. |
| 12. Texto escalado del flujo | Resuelto | §4.5 elimina la escala. Los nuevos cortes usan un ancho incorrecto: hallazgo 4. |
| 13. Controles antes de hidratar | Resuelto para las islas | §3.3 define SSR determinista y controles deshabilitados; C6 verifica ambos escenarios. |
| 14. localStorage y precedencia del fondo | Resuelto | §3.4 protege acceso, lectura y escritura y define las tres condiciones para animar. |
| 15. Rendimiento de textura | Parcial | Se unifican fps, DPR y mediciones; sigue faltando una referencia reproducible. Hallazgo 13. |
| 16. Falsas acciones y compositor | Resuelto | §4.6 enumera las piezas ilustrativas y elimina comportamiento de botón. |
| 17. Criterios insuficientes | Parcial | La matriz creció, pero omite roles, el corte de 800 px y verificaciones de foco y anuncios. Hallazgo 12. |
| 18. Configuración React e imports | Resuelto | §3.1 especifica integración, JSX, tipos e imports estáticos; C8 exige comprobar el bundle. |
| 19. Conteos textuales | Resuelto | §4.7.8 corrige ambos; C11 exige todas sus apariciones en ES y EN. |

1. **BLOQUEANTE — §3.4, §4.9, C5/C12: la textura reduce el contraste del contenido del sitio.**  
   **Problema:** se audita el contraste de la isla, pero se cambia el fondo de todas las páginas.  
   **Evidencia:** `texColor #0B0B0C` con intensidad `.15` sobre `--bg: #F4F4F2` produce aproximadamente `#D1D1D0` bajo cada cuadrado. `--muted: #6B6B68` pasa de **4,85:1 a 3,50:1**. El footer usa ese texto a 12 y 16 px, sobre fondo transparente, en Footer L76, L83 y L95. Incumple [WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).  
   **Arreglo:** asegurá 4,5:1 sobre el fondo más oscuro de la textura mediante texto más oscuro o superficies opacas donde corresponda. Documentá la diferencia en §6 y extendé la medición a todo el sitio, con textura activa y pausada.

2. **BLOQUEANTE — §4.3, C3: el bloque observado puede desaparecer o desplazarse por la propia animación.**  
   **Problema:** «la cabecera […] el saludo y el compositor» no es un bloque estable de la fuente. Observarlo puede detener la secuencia mientras el usuario sigue mirando el chat.  
   **Evidencia:** el saludo es condicional en App L99–101 y desaparece al mostrar la pregunta; el compositor está después de la conversación, App L135–142. Al crecer la respuesta, se desplaza. Un wrapper que incluya ambos también incluiría la conversación y dejaría de ser acotado.  
   **Arreglo:** observá una franja persistente anterior a la conversación, por ejemplo la fila de controles con «Pausar demo». Conservá el mismo nodo durante toda la secuencia. C3 debe comprobar que mostrar la pregunta y cada ítem no dispara una pausa por cambios de layout.

3. **IMPORTANTE — §4.3–4.4: la pausa manual todavía puede quedar anulada por una transición automática.**  
   **Problema:** entrar en pantalla «arranca o reanuda» y cambiar de rol inicia otra secuencia cuando hay visibilidad. Ninguna transición exige conservar la pausa manual. Tampoco se define cómo salir de reduced motion.  
   **Evidencia:** tabla de §4.3, filas «Entrar […] o cambiar de rol», «Reanudar demo» y disparador de visibilidad. Además, abrir una conversación no explicita actualizar el rol, aunque App L524 sí lo hace.  
   **Arreglo:** definí una condición única para avanzar: visible, sin pausa manual y sin reduced motion. Conservá la pausa manual al salir, volver y cambiar de rol; una elección manual estando pausado puede mostrar la respuesta estática. Abrir conversación debe actualizar rol, persona y permisos. Invalidá también cualquier anuncio pendiente de una secuencia reemplazada.

4. **IMPORTANTE — §4.1/§4.5: el flujo se adapta al ancho del shell, no al espacio que tiene disponible.**  
   **Problema:** a partir de 800 px se declara un lienzo natural de 800 px aunque no entra en el contenido.  
   **Evidencia:** con `app = 800`, sidebar de 216 px y padding horizontal de 40 px quedan aproximadamente **544 px** para el flujo; con `app = 720`, quedan 464 px. La tabla aplica igualmente los cortes de 520/800 al ancho total. App L17 y L630 confirman sidebar y padding.  
   **Arreglo:** poné un contenedor de consulta propio alrededor del área del flujo. Aplicá lista/scroll/lienzo según ese ancho disponible. Explicitá también `container-type: inline-size` para `roledemo`; `container-name` por sí solo no habilita consultas de tamaño.

5. **IMPORTANTE — §4.7–4.8, C11: el estado único deja indicadores contradictorios.**  
   **Problema:** aprobar la OC puede dejar «Compras por aprobar = 1», «Esperando aprobación» y «pausado por Finanzas» en otras representaciones.  
   **Evidencia:** §4.7.3 fija el KPI en uno; §4.8 sólo enumera el contador de Control. App L468 contiene el resultado «$18,4 M / Esperando aprobación»; L500 conserva Compras pausado y Cobranzas con dos aprobaciones pendientes. Inicio y la cabecera de Agentes también mantienen dos agentes activos, App L492 y L209.  
   **Arreglo:** derivá del estado los KPIs, encabezados, tarjetas de lista, resultados, notas y contadores. Definí qué representan los dos lotes pendientes de Cobranzas y cuáles modifica su botón. Las conversaciones históricas deben llevar una fecha o un rótulo visible que permita interpretar su estado anterior.

6. **IMPORTANTE — §4.5/§4.8 frente a C3: se exige rechazar y deshacer desde Compras sin definir esas acciones.**  
   **Problema:** el comportamiento ofrece aprobar/desaprobar desde el flujo, pero C3 exige OC aprobada, rechazada y deshecha desde ambos accesos.  
   **Evidencia:** App L591 tiene un toggle binario; §4.8 introduce tres estados sin indicar si «desaprobar» devuelve a pendiente o rechaza.  
   **Arreglo:** elegí un contrato explícito. La opción más cercana a la fuente es: flujo pendiente → aprobar; flujo aprobado → deshacer → pendiente; rechazo únicamente desde Control, reflejado también en el flujo. Ajustá C3 y definí el contenido y las acciones del flujo cuando la OC está rechazada.

7. **IMPORTANTE — §4.7.9: el catálogo corregido sigue desconectado de las fuentes usadas por la app.**  
   **Problema:** «fuentes de tipo sistema» no identifica qué filas entran en Centro, y algunos contextos consultados siguen mostrando fuentes ausentes o distintas.  
   **Evidencia:** App L503 no tiene una clasificación sistema/documental ni WMS. WMS aparece en L477 y L483. Operaciones consulta Correo y Planillas en L488, pero su `SYS` muestra ERP, WMS y Drive. Cobranzas muestra Correo en su tarjeta, L500, mientras el flujo consulta HubSpot, L427.  
   **Arreglo:** agregá IDs y una clasificación explícita a la tabla compartida; enumerá el subconjunto de Centro. Resolvé WMS como conexión o módulo de ERP y usá ese criterio en todas sus menciones. Derivá «Contexto consultado» y los pies de fuentes de los datos de la respuesta o corrida correspondiente.

8. **IMPORTANTE — §4.2/§4.4/§4.7: el alcance de los roles contradice las restricciones que muestra la demo.**  
   **Problema:** seleccionar Comercial y navegar a Inteligencia permite ver costos y márgenes que el propio panel declara ocultos; también permite aprobar una compra atribuida a Finanzas.  
   **Evidencia:** App L487 oculta costos y márgenes a Comercial; L169–205 muestra ese análisis sin condición por rol; L298 permite aprobar y L641 atribuye la aprobación a Carla Ruiz. La nota de Web L136 afirma que cada persona ve únicamente lo permitido.  
   **Arreglo:** explicitá que «Ver como» simula el rol sólo en Preguntar y rotulá las otras vistas como ejemplos de sus respectivos roles, con identidad coherente al ejecutar acciones. Ajustá la nota para expresar ese alcance. No hace falta implementar un sistema real de permisos.

9. **IMPORTANTE — §4.7.5, C11: los intervalos de deuda siguen teniendo huecos y solapamientos.**  
   **Problema:** corregir la suma no define categorías consistentes. «Menos de 30» y «más de 30» excluyen exactamente 30; planes para más de 60 incluyen también las deudas de más de 90 derivadas a Comercial.  
   **Evidencia:** §4.7.5 y App L429, L435–436 y L489.  
   **Arreglo:** fijá límites disjuntos y exhaustivos. Por ejemplo: 1–30 días, 31–60, 61–90 y más de 90; si la muestra no tiene deuda de 31–60 días, explicitá ese cero. Conservá importes exactos para calcular y definí cómo se redondean los valores en millones.

10. **IMPORTANTE — §4.5/§4.9, C5: ocultar las curvas elimina información sin alternativa textual.**  
    **Problema:** las conexiones del flujo y de Centro comunican dependencias; no son solamente decoración. El gráfico de Inteligencia tampoco tiene definido un equivalente accesible.  
    **Evidencia:** App L582–588 construye ramificaciones y dependencias de aprobación; L599–600 conecta fuentes, contexto y usos. En L176–181, valores y semanas del gráfico aparecen en grupos separados. [WCAG 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html) exige una alternativa equivalente.  
    **Arreglo:** mantené los SVG ocultos, pero agregá descripciones localizadas de las relaciones y dependencias. Asociá cada semana con su porcentaje en una lista o tabla accesible. C5 debe comprobar esa información, no sólo la presencia de nombres.

11. **IMPORTANTE — §3.4, C4/C9: redimensionar mientras la textura está pausada no tiene contrato.**  
    **Problema:** cancelar el RAF deja sin mecanismo definido para restaurar el dibujo tras cambiar dimensiones o DPR.  
    **Evidencia:** Web L668–671 redimensiona y dibuja dentro del mismo ciclo. Cambiar `canvas.width` o `height` reinicia el contexto y el bitmap según el [HTML Standard](https://html.spec.whatwg.org/multipage/canvas.html#concept-canvas-set-bitmap-dimensions).  
    **Arreglo:** el resize debe actualizar el bitmap y redibujar una vez usando la fase temporal congelada, incluso estando pausado o con reduced motion. No debe reactivar el bucle. Verificá manualmente resize y cambio de orientación/DPR en esos estados.

12. **IMPORTANTE — C2–C5: faltan casos que distinguen una implementación correcta de una incompleta.**  
    **Problema:** C2 no incluye roles como eje ni el corte de 800 px; C5 sólo fija foco final para la OC y pretende comprobar anuncios leyendo regiones vivas.  
    **Evidencia:** C2 enumera 360/520/720/860/1100. Abrir un agente elimina la tarjeta activada, App L232–235; volver elimina el botón de retorno. Inspeccionar `aria-live` no demuestra qué anuncia un lector.  
    **Arreglo:** cubrí los cuatro roles en los estados que cambian con el rol, ambos lados de cada corte y 800 px. Definí foco al abrir detalle y devolución a su tarjeta al cerrar. Sumá un recorrido manual con lector de pantalla: reproducción automática, elección manual, misma conversación dos veces y cancelación antes del anuncio.

13. **IMPORTANTE — C9: el umbral de rendimiento todavía depende de condiciones no identificadas.**  
    **Problema:** 1440×900 y DPR no alcanzan para reproducir «menos del 15 %» ni atribuir la diferencia a la textura.  
    **Evidencia:** C9 no fija equipo, versión de Chrome, throttling ni estado de las otras animaciones del sitio. El home incluye video y otras animaciones simultáneas.  
    **Arreglo:** identificá una máquina y configuración de referencia; registrá CPU/GPU, navegador, throttling y estado de las demás animaciones. Compará trazas equivalentes con textura activa/pausada e incluí pintura/composición. Conservá los límites actuales de fps y tareas largas.

14. **IMPORTANTE — C8/C12: el presupuesto de JS total queda sin límite claro.**  
    **Problema:** C8 limita React/app y textura por separado, mientras C12 reemplaza B11 por C8. Quedan sin presupuesto explícito el resto de los scripts y las páginas sin islas.  
    **Evidencia:** B11 limitaba el JS por página; A10 incluye imports dinámicos y scripts inline. C8 sólo menciona «React y la app» en páginas con isla.  
    **Arreglo:** conservá el presupuesto base de B11, agregá los límites de isla y textura, y definí la suma máxima por página. Incluí el runtime de hidratación de Astro en el costo de las islas y exigí que las páginas sin islas no incorporen React.

15. **MENOR — §3.4/§4.3: los botones de pausa mezclan dos patrones y el del fondo queda fuera del contrato sin JS.**  
    **Problema:** se cambia «Pausar» por «Reanudar/Animar» usando también `aria-pressed`; además, el botón del footer no tiene estado previo a inicializar su script.  
    **Evidencia:** el [patrón de botón de APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/) conserva el nombre en un toggle con `aria-pressed`. §3.3 sólo deshabilita controles de las islas.  
    **Arreglo:** usá botones de acción con nombre dinámico y sin `aria-pressed`, o toggles con nombre fijo. Ocultá el control del fondo hasta inicializarlo y explicá su indisponibilidad si reduced motion impide animar.