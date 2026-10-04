GATE: SÍ

1. **IMPORTANTE — [docs/evidence/001/a7-a8-checklist.txt:74](C:/Users/adria/OneDrive/Escritorio/TOODO/noctilabs-web/docs/evidence/001/a7-a8-checklist.txt:74), también :75. La evidencia del click central todavía queda incompleta.** Las filas comprueban panel abierto, foco dentro del conjunto y permanencia de `/nosotros/` en la pestaña original. Eso no demuestra que se haya abierto otra pestaña con el destino correcto, como pidió la pasada 4. **Evidencia:** ningún resultado registra esa pestaña ni su URL. El arreglo de código sí elimina la causa del cierre anticipado; no encontré una falla concreta de navegación. **Arreglo:** registrá el link pulsado, la URL de la pestaña nueva y el estado del panel original después de soltar, en desktop y mobile.

2. **MENOR — [src/scripts/header.ts:21](C:/Users/adria/OneDrive/Escritorio/TOODO/noctilabs-web/src/scripts/header.ts:21), también :87 y :170. “Zona vacía” todavía incluye texto seleccionable.** La exclusión por `closest('a, button, input, select, textarea')` restaura las acciones de los links, pero sigue cancelando el botón principal sobre el kicker del megamenú y el idioma actual del selector. Queda parcialmente pendiente el hallazgo 2 de las pasadas 3 y 4. **Evidencia:** ejecutando los handlers reales con DOM simulado, `defaultPrevented` da `false` sobre links y `true` sobre esos textos; cancelar `mousedown` puede impedir iniciar la selección nativa. [Pointer Events](https://w3c.github.io/pointerevents/#event-type-mousedown). **Arreglo:** distinguí el texto del fondo vacío y permití su selección conservando el contrato de foco del panel.

**Estado de las cuatro pasadas:**

- **Pasada 1, hallazgos 1–10:** resueltos en sus escenarios originales, código y evidencia.
- **Pasada 2, hallazgos 1–3:** resueltos; están registrados las anclas, los focos finales, los cruces de breakpoint y las reaperturas.
- **Pasada 3:** hallazgo 1 resuelto; hallazgo 2 parcialmente resuelto por el punto 2.
- **Pasada 4:** hallazgo 1 resuelto en código, con evidencia parcial por el punto 1; hallazgo 2 parcialmente resuelto por el punto 2.

Los 26 links de los paneles tienen `tabindex="0"` explícito y sus pulsaciones conservan las acciones nativas. La solución al foco de Safari está sustentada por [WebKit](https://raw.githubusercontent.com/WebKit/WebKit/main/Source/WebCore/html/HTMLAnchorElement.cpp); no equivale a una prueba ejecutada en Safari. Las simulaciones desktop no reprodujeron las carreras anteriores de blur, hover y reapertura.

Revisión sobre **HEAD `f31b3ce`, código `45f828e`**. Build: **21 páginas, cero errores, warnings e hints**. A4 después del build: **226/226**. Sin destinos internos rotos; JS máximo: **2016 bytes gzip**. El checklist adjunto tiene **77 casos**, no 67. Vitest quedó impedido por `EPERM` del sandbox, excluido del gate.

No encontré BLOQUEANTES restantes contra el spec 001 ni regresiones bloqueantes de la fase 2 sobre su fundación.