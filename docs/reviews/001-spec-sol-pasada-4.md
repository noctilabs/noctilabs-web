GATE: SÍ

1. **IMPORTANTE — §3.5/Megamenú y A7: falta cerrar el contrato de los temporizadores.**  
   **Problema:** la cancelación al cambiar de panel está explícita únicamente para la activación del otro botón. Falta exigirla al cambiar por hover y al cerrar por Esc, foco o click exterior.  
   **Evidencia:** L235 cancela temporizadores; L238–249 no establece la misma invalidación. La secuencia Producto por hover → salir → abrir Industrias antes de 120 ms puede dejar pendiente el cierre anterior. A7 no exige ese recorrido.  
   **Arreglo:** todo cierre o reemplazo invalida los temporizadores del panel anterior; cada callback comprueba que corresponde a la apertura vigente. Agregá al checklist ese cambio por hover y cierre → reapertura antes de vencer el timeout.

2. **IMPORTANTE — §3.5/Mobile, paso 3: “cualquier activación” incluye navegación modificada.**  
   **Problema:** Ctrl/Cmd+click sobre un fragmento local queda obligado a enfocar y desplazar también la página actual, aunque la intención sea abrir otra pestaña.  
   **Evidencia:** L270–272 no distingue activación normal de activación modificada. Las guidelines requieren conservar Ctrl/Cmd+click y click central en los enlaces. [Regla de navegación](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).  
   **Arreglo:** limitá el foco y scroll locales al click primario sin modificadores y a Enter. Conservá la navegación nativa para las demás activaciones y agregá su verificación manual a A5/A7.

3. **IMPORTANTE — S1(e), A1 y A2: el chequeo negativo puede ejecutarse durante Vitest.**  
   **Problema:** `@ts-expect-error` no evita ejecutar la llamada inválida. Una implementación válida que falle al acceder a una industria inexistente podría hacer caer `npm test`, aunque el contrato solamente exige rechazarla por tipos.  
   **Evidencia:** S1(e), L391, pide una llamada inválida sin indicar que debe quedar fuera de ejecución. La directiva suprime el diagnóstico de tipos; no captura excepciones. [Documentación de TypeScript](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-9.html#-ts-expect-error-comments).  
   **Arreglo:** colocá esa llamada en una función nunca invocada o en un archivo de comprobación de tipos incluido en A1 y excluido del descubrimiento de Vitest. Sigue perteneciendo a S1; no hace falta otra costura.

4. **IMPORTANTE — §3.2 y S1(d): falta un negativo que distinga normalización excesiva.**  
   **Problema:** una implementación que quite todas las barras finales con `/\/+$/` aprobaría los casos actuales y aceptaría `/producto//`, fuera del contrato exhaustivo.  
   **Evidencia:** §3.2 permite la ruta contractual y su variante sin barra; S1(d) no incluye barras repetidas.  
   **Arreglo:** agregá expectativas literales `null` para `/producto//` y `/en/product//`, y explicitá que se admite quitar una única barra final. Esto amplía únicamente S1.

5. **MENOR — A4: el contraste de title y descripción no tiene una referencia definida.**  
   **Problema:** P3-6 quedó parcialmente resuelto: ahora se registran ambos campos, pero las tablas citadas no contienen sus valores esperados.  
   **Evidencia:** A4 remite a §3.2 y §3.7; esas tablas fijan rutas y H1. §3.3 fija el formato del title, pero no el copy de las descripciones.  
   **Arreglo:** indicá contra qué copy de fase 1 se comparan —por ejemplo, una tabla de valores esperados adjunta al PR— y distinguí esa conformidad técnica de la revisión editorial pendiente en D4.

6. **MENOR — §3.4: los breakpoints dejan un intervalo sin cubrir.**  
   **Problema:** `999.98px < width < 1000px` no coincide con ninguna de las dos media queries prescritas.  
   **Evidencia:** el contrato dice mobile para todo ancho menor que 1000px, pero exige `(max-width: 999.98px)`.  
   **Arreglo:** usá estilos mobile por defecto y una única query `(min-width: 1000px)`, o queries complementarias con sintaxis de rango.

7. **MENOR — §3.1 y §3.8: Node 22 necesita un mínimo explícito.**  
   **Problema:** “Node 22” también incluye versiones incompatibles con Astro vigente. La máquina revisada tiene `v22.19.0`, así que no bloquea este entorno.  
   **Evidencia:** Astro exige Node `22.12.0` o superior. [Requisitos oficiales](https://docs.astro.build/en/install-and-setup/#prerequisites).  
   **Arreglo:** documentá Node `22.12+` dentro de la rama 22 y declaralo en `package.json`; mantené Vercel en 22.x.