GATE: NO

1. **BLOQUEANTE — `src/scripts/header.ts:17`, `:118`, `:176`; `src/components/Header.astro:110`, `:124`. El click central reintroduce el cierre antes de activar un link en Safari.** Al dejar pasar `mousedown` con `button=1`, Safari puede quitarle el foco al chevron o a la hamburguesa sin enfocar el link, que no tiene `tabindex` explícito. El `focusout` programa entonces el cierre: si sostenés la pulsación, el panel desaparece antes de `mouseup`. En mobile contradice directamente §3.5, paso 3: el click central debe conservar la navegación nativa sin cerrar el panel.

   **Evidencia:** ejecuté los handlers de `513be08` con DOM y temporizadores simulados, aplicando el comportamiento de foco de WebKit: ambos paneles quedaron ocultos y con `aria-expanded="false"` antes de soltar. Es una inferencia sustentada por el [manejo de mousedown de WebKit](https://raw.githubusercontent.com/WebKit/WebKit/main/Source/WebCore/page/EventHandler.cpp) y su [regla de foco para links](https://raw.githubusercontent.com/WebKit/WebKit/main/Source/WebCore/html/HTMLAnchorElement.cpp), sin ejecución en Safari. `a7-a8-checklist.txt:74` sólo comprueba `defaultPrevented`; no verifica foco, permanencia del panel ni navegación central.

   **Arreglo:** hacé que los links conserven el foco dentro del conjunto, por ejemplo con `tabindex="0"` explícito, o coordiná el cierre con la pulsación interna hasta su activación o cancelación. Conservá las acciones nativas y registrá click central sostenido y navegación final en ambos paneles.

2. **MENOR — `src/scripts/header.ts:17`, `:82`, `:165`. El hallazgo 2 de la pasada 3 quedó parcialmente resuelto.** Se restauraron las acciones de los botones central y secundario, pero todo `mousedown` principal dentro de los paneles sigue cancelado, incluso sobre texto y links. Sigue impidiendo selección mediante arrastre y arrastre nativo de links.

   **Evidencia:** los listeners se aplican al panel completo; esos efectos corresponden a las [acciones predeterminadas de mousedown](https://w3c.github.io/uievents/TR.html#event-type-mousedown). El caso 74 confirma que el principal continúa prevenido.

   **Arreglo:** limitá la prevención a los controles que la necesitan y resolvé el foco de los links sin cancelar indiscriminadamente las acciones del panel.

**Estado de las pasadas anteriores:** pasada 1, **1–10 resueltos** en sus escenarios originales y evidencia; pasada 2, **1–3 resueltos**, con la regresión central señalada arriba; pasada 3, **1 resuelto y 2 parcial**. `cancelHover` conserva la comprobación de foco pendiente; `cancelAll`, `hoverToken` y `openToken` invalidan correctamente los callbacks al cerrar o reemplazar. Las simulaciones de pérdida de foco seguida de hover, reapertura y reemplazo no reprodujeron las carreras anteriores.

Revisión fijada a **`513be08`, código `cee5b2c`**. Checklist: **75/75**, no 67. A4 sobre el `dist/` inicial: **226/226**; build local: **21 páginas, 0 errores, warnings e hints**. Vitest quedó impedido por `EPERM` del sandbox, excluido del gate. Los cambios de fase 2 aparecidos durante la revisión quedaron fuera del alcance.