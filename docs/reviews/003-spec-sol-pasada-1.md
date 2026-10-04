GATE: NO

1. **BLOQUEANTE — §4.2, §4.5, C3–C4: «Centro» queda animándose indefinidamente.**  
   **Evidencia:** App L334–336 contiene curvas con `repeatCount="indefinite"`. El límite de tres repeticiones de §4.5 corresponde únicamente a Agentes; «Pausar demo» existe únicamente en Preguntar. Se incumple [WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).  
   **Arreglo:** limitar también las curvas de Centro a menos de cinco segundos, desactivarlas con reduced motion y agregar esta diferencia a §6 y su verificación a C3–C4.

2. **BLOQUEANTE — §4.3: observar el 35 % de toda la isla puede impedir que el chat arranque.**  
   **Evidencia:** §4.1 exige al menos 560 px de alto; con un viewport de 200 px, una isla de más de 571 px nunca alcanza ese porcentaje. El contenido del chat y el panel de permisos pueden aumentar todavía más su altura. `client:visible` puede hidratarla sin que el segundo observador habilite la secuencia.  
   **Arreglo:** observar un bloque acotado del chat, como su cabecera, y definir por separado entrada y salida. Agregar un recorrido manual con viewport bajo y zoom, incluyendo la vuelta a pantalla.

3. **BLOQUEANTE — §4.1, §4.9, C3/C5: en angosto desaparecen funcionalidades.**  
   **Evidencia:** App L16–42 contiene las cinco conversaciones y el menú de usuario; App L43–49 reemplaza todo eso por navegación entre vistas. El SPEC conserva ese reemplazo y exige navegación de conversaciones y menú por teclado, sin alternativa mobile.  
   **Arreglo:** agregar acceso compacto a conversaciones y usuario en el shell angosto, documentarlo en §6 y verificar los mismos recorridos a 320/360 px.

4. **IMPORTANTE — §4.1: el contenedor de consulta y el elemento adaptable están confundidos.**  
   **Evidencia:** App L15 cambia su propia dirección flex. §4.1 coloca `container-type` en la raíz, pero una consulta de tamaño usa un **ancestro** del elemento que estiliza; la raíz no puede consultarse a sí misma. [Container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries).  
   **Arreglo:** definir un wrapper de consulta y un shell descendiente. Nombrar los contenedores: uno para el ancho del marco de app y otro para el conjunto app/permisos. Especificar sobre cuál se evalúan 720, 860 y 1100 px.

5. **IMPORTANTE — §4.3–4.4: falta el contrato de interrupción del chat.**  
   **Evidencia:** App L517–538 programa timeouts y un intervalo; L524 cambia conversación y rol; L632 limpia conversación al navegar; L634 cambia rol sin limpiar explícitamente la conversación seleccionada. El SPEC no define qué conserva una pausa ni qué invalida esos callbacks.  
   **Arreglo:** establecer transiciones concretas: cambiar rol limpia `convo`; abrir conversación cancela la secuencia anterior; salir de Preguntar cancela repetición y rotación; pausar conserva etapa y tiempo restante; reanudar continúa. La elección manual debe impedir futuras rotaciones incluso después de pausar/reanudar. Resolverlo con un controlador local, sin agregar infraestructura global.

6. **IMPORTANTE — §4.3: `aria-live="off"` también silencia las respuestas solicitadas por el usuario.**  
   **Evidencia:** L109 únicamente garantiza que la respuesta termine en el DOM. No define anuncios al elegir rol o conversación. Las [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) requieren anuncios de actualizaciones asíncronas.  
   **Arreglo:** mantener silenciosa la reproducción automática y agregar una región `aria-live="polite"` persistente para interacciones manuales. Anunciar una vez la respuesta completa, sin anunciar caracteres, pulsos ni fuentes por separado. Verificar ambas modalidades en C5.

7. **IMPORTANTE — §4.7: «1 aprobación en todos lados» contradice el resto de las aprobaciones.**  
   **Evidencia:** App L500 muestra dos aprobaciones pendientes en Cobranzas; L424 y L439 muestran Cobranzas y Comercial esperando aprobación; L454 agrega la de Compras. Cambiar solamente KPI y badge a uno conserva la contradicción.  
   **Arreglo:** definir qué cuenta cada indicador: solicitudes, lotes o aprobaciones de compras. Si el uno corresponde únicamente a Compras, explicitarlo en los labels. Derivar los totales de un único conjunto de solicitudes y ampliar C11 a tarjetas, flujos y conversaciones.

8. **IMPORTANTE — §4.2, §4.5, §4.7: la misma OC puede estar aprobada y pendiente simultáneamente.**  
   **Evidencia:** OC-4471 aparece en Control, en el flujo de Compras, en Inicio y en la conversación de stock (App L294, L460, L493 y L479). La fuente usa estados independientes: `appr` en L515 y `agentAppr[k]` en L591. La corrección no cubre esta inconsistencia.  
   **Arreglo:** usar un único estado de OC-4471 dentro de cada isla y derivar sus representaciones, contador y trazabilidad. Definir aprobar, rechazar y deshacer desde ambos accesos, con el foco final correspondiente. Mantener independientes las seis instancias de la app.

9. **IMPORTANTE — §4.7: quedan inconsistencias de datos fuera de las cinco correcciones.**  
   **Evidencia:** App L488 atribuye los 12 pedidos retenidos a stock; L477 los divide en ocho por stock y cuatro por crédito. L486 informa $41,2 M vencidos a más de 30 días; L489 asigna $9,8 M a menos de 30 días dentro de un total de $48,2 M. Si esos grupos particionan el total, quedan $38,4 M para más de 30 días. Además, L495/L502 dicen «envió» recordatorios mientras L431–432 muestra preparación y envío en espera.  
   **Arreglo:** fijar causas, intervalos de antigüedad y corrida de referencia. Diferenciar actividad histórica de la corrida pendiente. Registrar los valores coherentes en §4.7 y verificarlos en todas sus apariciones mediante C11.

10. **IMPORTANTE — §4.2, §4.7: Lista y Centro presentan versiones incompatibles de Conexiones.**  
    **Evidencia:** App L503 muestra WhatsApp con 31.950 registros; L597 muestra 41.300. Lista tiene ocho fuentes, mientras badge y Centro muestran seis (L481 y L349). Centro incorpora Entrevistas y omite Correo.  
    **Arreglo:** compartir los registros de cada fuente entre vistas. Definir explícitamente la diferencia entre sistemas y fuentes documentales, y qué representa Centro. Si muestra un subconjunto, identificarlo visualmente; no presentar ambos conjuntos como equivalentes.

11. **IMPORTANTE — §4.9, C5: revisar hexadecimales aislados deja pasar contrastes efectivos insuficientes.**  
    **Evidencia:** App L506 usa `#9A6A0E` sobre `#F6EBD3` ≈ 3,99:1 y `#2F7D52` sobre `#DDEEE3` ≈ 4,17:1. L593 usa texto `#6FAE88` sobre blanco ≈ 2,60:1. Las tarjetas en espera tienen opacidad .55 (L578): incluso reemplazando su texto por `#6B6B68`, el contraste resultante sobre blanco ronda 2,17:1.  
    **Arreglo:** enumerar parejas semánticas y medir colores después de aplicar opacidad y escala. Mantener opaco el texto de tarjetas en espera. Separar bordes decorativos de indicadores necesarios para reconocer controles o estados, sujetos a [WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

12. **IMPORTANTE — §4.5: escalar el flujo introduce ilegibilidad y un contrato de tamaño incompleto.**  
    **Evidencia:** con 520 px disponibles, el lienzo de 800 px se escala a .65: el texto de 9,5 px de App L251 queda en unos 6,2 px. `transform` tampoco reduce el espacio ocupado en layout. C2 solamente compara 1100 y 360 px, evitando ese caso.  
    **Arreglo:** preservar el tamaño del texto y usar lista o scroll contenido cuando el lienzo no entre. Si conservás escala, definir escala mínima legible, `transform-origin`, dimensiones del wrapper y actualización sin bucles de `ResizeObserver`. Documentar la escala como diferencia adicional en §6.

13. **IMPORTANTE — §3.3, C5–C6: SSR estático no resuelve los controles muertos antes de hidratar.**  
    **Evidencia:** Astro entrega HTML antes de cargar React con [`client:visible`](https://docs.astro.build/en/reference/directives-reference/#clientvisible). El SPEC no define cómo aparecen navegación, pausa y aprobaciones con JS deshabilitado o mientras se descarga la isla.  
    **Arreglo:** establecer un estado SSR determinista, idéntico al primer render cliente, sin APIs del navegador durante render. Ocultar o deshabilitar las acciones que necesitan hidratación y habilitarlas al montar; conservar el enlace real a Hablemos. Incluir carga lenta y ausencia de JS en C6.

14. **IMPORTANTE — §3.4: la persistencia puede romper el control del fondo.**  
    **Evidencia:** L70 protege únicamente la lectura. El acceso a [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) y la escritura mediante [`setItem`](https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem) pueden lanzar excepciones. Tampoco se define la precedencia entre pausa manual, pestaña oculta y reduced motion.  
    **Arreglo:** proteger acceso, lectura y escritura; conservar la preferencia en memoria si falla el almacenamiento. Animar únicamente cuando no haya pausa manual, la pestaña esté visible y no haya reduced motion. Reanudar no debe borrar una preferencia manual ni superar la preferencia del sistema.

15. **IMPORTANTE — §3.4, C9: el presupuesto de textura es ambiguo y mide sólo una parte del costo.**  
    **Evidencia:** 60 ms permiten 16,67 fps, mientras C9 exige hasta 16. La fuente calcula ondas por celda y limpia el canvas completo (Web L671–681); medir únicamente scripting no cubre pintura y composición. Falta identificar equipo, DPR y condiciones de medición.  
    **Arreglo:** unificar el límite temporal, cachear dimensiones mediante `ResizeObserver` y cancelar el RAF al pausar. Fijar un escenario reproducible, incluyendo DPR 2, y registrar scripting, renderizado, tareas largas y comparación con textura pausada. Ocultar el canvas decorativo al árbol de accesibilidad.

16. **IMPORTANTE — §4.6: cambiar botones por spans conserva falsas acciones visuales.**  
    **Evidencia:** App L130, L192, L274 y L316 muestran acciones destacadas sin funcionamiento. El SPEC exige conservar su aspecto; quitarles foco sólo elimina el problema del teclado. El compositor y el envío aparente de L135–140 tampoco quedan incluidos explícitamente en esta política.  
    **Arreglo:** identificar estas piezas como contenido ilustrativo, sin cursor, hover ni estados de botón. Definir el compositor como representación de la demo. El desplegable de usuario con ítems de texto debe funcionar como disclosure, sin semántica de menú de acciones.

17. **IMPORTANTE — §8: C2–C12 permiten aprobar una implementación incompleta.**  
    **Evidencia:** C2 no exige estados de conversación, transacciones abiertas, OC rechazada, Centro, permisos inline ni navegación bajo cada rol. C3 no exige esos recorridos en angosto ni interrupciones. C5 no cubre zoom, foco tras reemplazar controles ni anuncios manuales. C10 omite las cinco conversaciones y mensajes de aprobación. C12 deja indeterminados los criterios anteriores afectados.  
    **Arreglo:** agregar una matriz manual de vistas, estados, variantes e idiomas; cubrir los límites 520/720/860/1100 y el ancho real dentro de cada marco. Nombrar los criterios anteriores que se reejecutan. Documentar la excepción de estados locales sin URL para las islas, requerida por Navigation & State de las [Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md). No hacen falta tests automáticos nuevos.

18. **MENOR — §3.1–3.2: el setup React queda demasiado implícito.**  
    **Evidencia:** `astro.config.mjs` actual no registra integraciones y `tsconfig.json` no configura JSX React. La [integración oficial](https://docs.astro.build/en/guides/integrations-guide/react/) requiere registrar `react()` y configurar JSX; el proyecto verifica tipos durante build.  
    **Arreglo:** listar esos cambios y los tipos de React como parte del paso 1. Para `simple-icons`, usar seis imports estáticos identificados y comprobar en C8 que sólo sus paths llegan al bundle.

19. **MENOR — §4.7, C11: quedan contradicciones textuales simples.**  
    **Evidencia:** App L486 anuncia «dos temas» y enumera tres; L478 anuncia «cuatro clientes» y muestra tres.  
    **Arreglo:** corregir ambos conteos en ES y EN y agregarlos a C11.