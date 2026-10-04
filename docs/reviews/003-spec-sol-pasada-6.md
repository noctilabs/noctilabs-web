GATE: SÍ

Verificación contra el **contrato del SPEC**, sin acreditar implementación:

| Tema | Hallazgos anteriores | Estado y evidencia |
|---|---|---|
| Animaciones, visibilidad, interrupciones y anuncios del chat | P1: 1, 2, 5, 6; P2: 2, 3; P3: 8; P4: 2, 4 | Resueltos en §4.3, §6.3 y C4/C5. |
| Conversaciones, usuario, contenedores y geometría | P1: 3, 4, 12; P2: 4; P3: 9; P4: 1; P5: 1, 2 | Resueltos en §§4.1, 4.5, 4.9 y §6.17–19. |
| Aprobaciones, OC, corridas, importes y conteos | P1: 7–10, 19; P2: 5–7, 9; P3: 2–5; P4: 3 | Resueltos para las inconsistencias señaladas en §§4.7–4.8 y C11. Queda otra inconsistencia abajo. |
| Alcance de roles | P2: 8 | Resuelto en §4.4b. |
| Contraste, scroll, alternativas y foco | P1: 11; P2: 1, 10; P3: 1 | Resueltos en §§3.4, 4.5, 4.9 y C5. |
| SSR y elementos ilustrativos | P1: 13, 16 | Resueltos en §§3.3, 4.6 y C6. |
| Textura, almacenamiento, rendimiento y DPR | P1: 14, 15; P2: 11, 13, 15; P3: 7; P5: 4 | Resueltos en §3.4 y C9. |
| Configuración, formatos y criterios verificables | P1: 17, 18; P2: 12, 14; P3: 6; P5: 3 | Resueltos en §§3.1–3.2 y C2–C12. |
| Estado accesible de ambos selectores de rol | P5: 5 | Resuelto en §4.4 y C5. |

1. **IMPORTANTE — §§4.7–4.8, C11: queda una excepción de Compras fuera del estado derivado.**  
   **Problema:** aprobar la OC puede dejar al agente activo, sin excepciones pendientes, mientras Inicio sigue mostrando otra excepción actual que requiere atención.  
   **Evidencia:** App L493 contiene «Agente de compras: proveedor sin lista de precios vigente». SPEC L228 conserva literalmente los datos restantes; L246 deriva «Excepciones pendientes» del estado de la OC, pero solo incorpora a ese estado el ítem de Inicio correspondiente a la OC. La excepción de precios queda independiente y sin resolución definida.  
   **Arreglo:** distinguí esa advertencia de las aprobaciones. La opción más simple es llamar a la fila «Aprobaciones pendientes» y documentar que el problema de precios es otra advertencia que no pausa esta corrida. Si representa un bloqueo real, derivá también su resolución y el estado del agente. Agregá ambos ítems de Inicio a C11.

2. **IMPORTANTE — §§4.1–4.2, §4.9, C5: falta el estado accesible de la navegación compacta y de Lista/Centro.**  
   **Problema:** el contrato de selección accesible se completa para los roles, pero no para estos otros controles. Una transcripción literal permite que comuniquen la selección únicamente mediante estilos.  
   **Evidencia:** §4.1 exige `aria-current="page"` exclusivamente en **Ancho**. App L46 expresa la vista compacta mediante peso, fondo y color. Lista/Centro usa únicamente estilos en App L610–612 y L316. [WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html).  
   **Arreglo:** extendé `aria-current` a ambas navegaciones. Para Lista/Centro, definí un grupo nombrado de botones con exactamente un `aria-pressed="true"`. Aclaralo también para las llamadas «tabs» compactas, evitando asumir semántica APG sin su comportamiento de teclado. C5 debe comprobar los estados después de cada cambio.

3. **IMPORTANTE — §4.8, §4.9, C5: aprobar, rechazar y deshacer carecen de anuncio de resultado.**  
   **Problema:** devolver el foco al siguiente botón informa qué se puede hacer, pero no garantiza comunicar el resultado, el actor ni el estado de ejecución.  
   **Evidencia:** App L639–641 muestra mensajes de aprobación y rechazo; SPEC L257 lleva el foco a «Deshacer» o «Aprobar». La única región viva definida es la del chat, en §4.3. Estos mensajes de resultado están comprendidos por [WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).  
   **Arreglo:** agregá una región persistente `role="status"` por isla que anuncie una frase localizada por acción manual, incluyendo qué OC o corrida cambió y su estado resultante. No hagas vivas todas las representaciones derivadas, porque duplicarían anuncios. Extendé C5 a aprobar, rechazar y deshacer, con la misma distinción entre comprobación DOM y lector real.

4. **MENOR — §3.4, C9: falta fijar el tamaño CSS del canvas y el objetivo del observer.**  
   **Problema:** se especifica el contenedor de pantalla completa, pero no cómo el canvas ocupa ese espacio ni qué elemento determina sus dimensiones.  
   **Evidencia:** la fuente define expresamente `width: '100%', height: '100%', display: 'block'` en Web L755. §3.4 solo fija dimensiones del contenedor y menciona `ResizeObserver`.  
   **Arreglo:** incorporá esos estilos y observá el contenedor fijo. Calculá el bitmap desde sus dimensiones CSS y el DPR limitado; cambiar `canvas.width/height` no debe alterar el tamaño observado. C9 debe comprobar también que la superficie CSS cubre todo el viewport.