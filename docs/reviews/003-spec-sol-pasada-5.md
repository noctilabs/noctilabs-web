GATE: NO

Verificación de las pasadas anteriores **contra el contrato del SPEC**. Las correcciones están incorporadas; esto no acredita su implementación.

| Tema resuelto | Hallazgos anteriores | Evidencia actual |
|---|---|---|
| Curvas de Centro | P1: 1 | §6.3, C4 |
| Visibilidad e interrupciones del chat | P1: 2, 5; P2: 2, 3 | §4.3 |
| Conversaciones y usuario en angosto | P1: 3 | §4.1, C3 |
| Contenedores y ancho del flujo | P1: 4, 12; P2: 4; P3: 9, parte del ancho | §§4.1, 4.5 |
| Anuncios manuales | P1: 6; P2: 12, parte de anuncios; P3: 8; P4: 2 | §4.3, C5 |
| Aprobaciones, OC y totales de agentes | P1: 7, 8; P2: 5, 6; P3: 2, 3; P3: 9, parte del rechazo | §§4.7–4.8, C3/C11 |
| Deudas, pedidos y corridas históricas | P1: 9; P2: 9; P3: 4 | §4.7.4–6, §4.8 |
| Fuentes y referencias específicas | P1: 10; P2: 7; P3: 5 | §4.7.9 |
| Contraste efectivo y global | P1: 11; P2: 1 | §§3.4, 4.9, C5 |
| SSR y controles previos a hidratar | P1: 13 | §3.3, C6 |
| Almacenamiento y botones de pausa | P1: 14; P2: 15 | §§3.4, 4.3 |
| Textura, rendimiento y DPR | P1: 15; P2: 11, 13; P3: 7 | §3.4, C9 |
| Elementos ilustrativos | P1: 16 | §4.6 |
| Matriz, regresiones y presupuesto | P1: 17; P2: 12, parte de matriz, y 14 | C2–C12; nueva incompatibilidad abajo |
| Configuración React e imports | P1: 18 | §3.1, C8 |
| Conteos textuales | P1: 19 | §4.7.8 |
| Alcance de roles | P2: 8 | §4.4b |
| Alternativas, scroll y foco | P2: 10; P3: 1 | §§4.5, 4.9, C5 |
| Formatos ES/EN | P3: 6 | §3.2, C10 |
| Reflow de botones y compositor | P4: 1 | §6.17, C5 |
| Totales monetarios | P4: 3 | §4.7.8b, C11 |
| Espera inicial | P4: 4 | §4.3, paso 0 |

1. **BLOQUEANTE — §4.5, §6.17, C2/C5: el lienzo fijo permite superponer tarjetas.**  
   **Problema:** permitir que el texto corte línea no alcanza cuando las tarjetas siguen posicionadas por porcentajes dentro de 800×430 px. Las correcciones de datos y EN necesitan más altura, pero no se autoriza ajustar esa geometría.  
   **Evidencia:** App L242–250 fija el alto y centra las tarjetas con `translateY(-50%)`; L471 y L426–434 fijan columnas y centros separados aproximadamente **129 px**. Con los anchos y estilos originales, las métricas de Inter dan aproximadamente **139 px** para tarjetas como «Historial del cliente / 57 clientes con deuda vencida» y «Enviar planes de pago / con el detalle de cuotas». Es una estimación geométrica, no una captura de navegador. Además, el pill «Necesita tu aprobación» necesita aproximadamente 136 px, frente a unos 110 px de contenido disponible.  
   **Arreglo:** definir separaciones según el alto real del contenido y autorizar que el lienzo crezca desde un mínimo de 430 px. Actualizar las curvas junto con las posiciones. C2/C5 deben exigir ausencia de superposiciones y recortes en los tres flujos, ES/EN y estados pendiente/aprobado/rechazado.

2. **BLOQUEANTE — §§4.5, 4.9, C5: falta adaptar la tabla de aprobación dentro del marco más angosto.**  
   **Problema:** la tabla «Acción propuesta / Clientes o SKUs / Monto» conserva dos columnas fijas y puede dejar la columna de acciones en cero. No está incluida en el contrato de regiones desplazables.  
   **Evidencia:** App L265 impone `minmax(0,1fr) 70px 110px`. A 320 px de página, dentro del marco de Control, los paddings actuales de `Container`, `CardBig`, `AppSlot` y del panel dejan aproximadamente **175 px** para esa grilla: menos que los **180 px** reservados para las dos últimas columnas. Desde ese embed también se puede abrir cualquier agente. §4.9 enumera otras tablas, pero omite esta. La pérdida o superposición de contenido incumple [WCAG 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).  
   **Arreglo:** convertirla en una tabla semántica con ancho mínimo y wrapper desplazable, nombrado y enfocable; o definir una presentación apilada que conserve las asociaciones. Incorporarla expresamente a §6 y C5, dentro del marco real de Control a 320 px.

3. **IMPORTANTE — C2/C5: hay comprobaciones que no pueden ejecutarse tal como están escritas.**  
   **Problema:** C2 expresa un producto de anchos de contenedores dependientes; C5 exige recorrer sin JS estados que los embeds no entregan en SSR.  
   **Evidencia:** con `app = 720`, sidebar de 216 px y padding horizontal de 40 px, `flow` dispone de aproximadamente 464 px: no puede combinarse con `flow = 800`. Sin JS, §3.3 deshabilita la navegación y entrega solo la vista inicial; ninguno de los seis embeds empieza en Centro, Conexiones, Permisos ni detalle de agente.  
   **Arreglo:** reemplazar el producto cartesiano por casos alcanzables: cada caso fija un contenedor objetivo y registra los anchos derivados. En C5, exigir todas las regiones con JS y, sin JS, las regiones presentes en las vistas SSR iniciales. Mantener recorridos y evidencia manuales.

4. **IMPORTANTE — C9: el cálculo del presupuesto de textura sigue indeterminado.**  
   **Problema:** identificar máquina y escenario no define cómo calcular el porcentaje. «Tiempo del hilo principal» puede interpretarse como duración de la ventana o tiempo ocupado; sumar categorías tampoco especifica cómo evitar contar intervalos anidados dos veces.  
   **Evidencia:** C9 pide sumar scripting, rendering, painting y composición, y comparar esa diferencia con el 15 %, sin fórmula ni regla de agregación. Dos revisores pueden obtener veredictos distintos sobre la misma traza.  
   **Arreglo:** definir, por ejemplo, `(ocupación activa − ocupación pausada) / 10.000 ms < 0,15`, usando intervalos exclusivos del hilo principal, sin doble conteo. Registrar composición/GPU por separado cuando ocurra en otros hilos. Adjuntar valores y cálculo a la evidencia.

5. **IMPORTANTE — §§4.3–4.4, C5: el selector interno de rol no tiene definido su estado accesible.**  
   **Problema:** `aria-pressed` y el grupo nombrado se especifican únicamente para `role-demo`. Los chips «Ver como» de la variante normal quedan sujetos a una transcripción que comunica la selección mediante colores.  
   **Evidencia:** App L86–88 y L634 cambian fondo y texto; §4.4 exige estados accesibles para el selector externo, pero no extiende ese contrato a los chips internos. El estado seleccionado debe ser determinable según [WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html).  
   **Arreglo:** aplicar el mismo grupo nombrado y `aria-pressed={role === key}` a ambos selectores, con exactamente un rol activo. C5 debe comprobar sus estados después de elegir un rol y de abrir una conversación que cambie el rol.