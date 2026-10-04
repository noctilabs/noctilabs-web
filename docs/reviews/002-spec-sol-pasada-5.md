GATE: NO

1. **BLOQUEANTE — B15, ampliación de títulos.**  
   **Problema:** sigue siendo imposible cumplir simultáneamente la tipografía obligatoria y el criterio de zoom.  
   **Evidencia:** Inv §0.1 prescribe `clamp(42.6px,5.9vw,95.1px)` y 46 px debajo de 1000 px. A 1280 px, el H1 mide **75,52 px**. Al 150 %, el layout tiene 853,33 CSS px: el título pasa a 46 × 1,5 = **69 px**, incumpliendo “nunca quedan por debajo” (SPEC L465). Llegar a 184 px al 400 % no corrige ese incumplimiento intermedio.  
   **Arreglo:** quitar esa restricción adicional y verificar ausencia de pérdidas en los pasos intermedios y ampliación efectiva al doble al 400 %, como permite [WCAG 1.4.4](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html); o cambiar la escala y autorizar expresamente la diferencia en §7. Incluir el 400 % en la tabla y la comprobación de layout. Sigue abierto pasada 4 #1.

2. **BLOQUEANTE — §§3.4 y 7; B3, fidelidad del contenido editorial.**  
   **Problema:** la sustitución obligatoria por el post de Sanity no está incorporada a las diferencias que B3 permite.  
   **Evidencia:** §3.4 cambia el artículo a “Sin contexto, no hay inteligencia. Nuestra tesis”, del 28/9. Inv §§5.2 y 6 contiene otro título, resumen, fecha, cuerpo e índice. B3 admite exclusivamente diferencias de §7, donde esa sustitución no figura. Implementar Sanity fielmente deja la comparación literal en rojo. Reabre el conflicto de aceptación de las pasadas anteriores.  
   **Arreglo:** autorizar en §7 el contenido editorial de Sanity para destacado, tarjetas y artículo. Precisar que B3 compara sus estilos y estructura contra el diseño, y su contenido, metadatos e índice contra el post seleccionado.

3. **IMPORTANTE — §3.4, contrato de minutos; B7.**  
   **Problema:** la salida tiene un único `minutes`, pero el cálculo alternativo depende del idioma.  
   **Evidencia:** L149 define `{ …, minutes, es: {title, excerpt, body}, en: {…} }`; L166 prescribe palabras del cuerpo “en ese idioma”. Sin `readingTime`, un cuerpo ES de 220 palabras y uno EN de 221 producen **1 y 2 minutos**, que el campo escalar no puede representar.  
   **Arreglo:** definir `minutes: Record<Locale, number>` o incorporarlo a cada variante localizada. Un `readingTime` editorial válido se replica; el cálculo alternativo se hace por idioma. Definir también el tratamiento de cero, negativos y decimales. B7 debe comprobar el cálculo alternativo y la coherencia listado/cabecera en ambos idiomas. Pasada 4 #5 queda parcial.

4. **IMPORTANTE — §3.4, identidad y sincronización del loader; B7.**  
   **Problema:** falta garantizar que todos los documentos lleguen al chequeo de colisiones y que desaparezcan los retirados del CMS.  
   **Evidencia:** el spec no define el ID de colección ni su actualización entre builds. Guardar por slug puede pisar uno de los dos documentos antes de `getArticles()`, reproduciendo el problema de duplicados de las pasadas 1–3. Un loader de objeto que solamente agrega entradas puede conservar posts eliminados; Astro permite administrar un [store persistente](https://docs.astro.build/en/reference/content-loader-reference/#loading-collections-into-the-data-store).  
   **Arreglo:** usar `_id` como identidad, detectar colisiones sobre todos los candidatos antes de cualquier reducción por slug y definir una sincronización completa con la respuesta exitosa. Agregar a B7 una comprobación manual con caché conservada: publicar → retirar → reconstruir, sin entrada ni ruta residual. Comprobar colisiones independientes en ES y EN.

5. **IMPORTANTE — §3.4, contenido inválido y política de fallas; B7.**  
   **Problema:** “no vacío” no está definido para Portable Text, y la fecha validada carece de una política explícita de rechazo.  
   **Evidencia:** un array con un bloque y spans vacíos tiene longitud positiva pero no aporta cuerpo; también puede contener únicamente tipos que el renderer descarta. `publishedAt` se valida como calendario, pero las cuatro reglas de publicación no incluyen esa validación ni dicen si una fecha inválida excluye el post o aborta el build. B7 comprueba un cuerpo ausente, pero no esos cuerpos presentes y vacíos.  
   **Arreglo:** exigir `trim()` para title/excerpt y texto renderizable no vacío en ambos cuerpos. Definir qué ocurre con fecha ausente/imposible y demás datos editoriales inválidos, separándolo de las fallas de Sanity que sí abortan. Agregar comprobaciones manuales de cuerpo vacío y fecha imposible. Pasada 4 #8 no queda completamente cerrada.

6. **IMPORTANTE — §4.5; B2/B7, cero artículos publicados.**  
   **Problema:** la exclusión tolerante puede dejar el listado vacío, pero no hay comportamiento definido para ese resultado.  
   **Evidencia:** hoy existe un único post elegible. Si pierde su cuerpo ES o se desmarca, §3.4 exige excluirlo sin fallar; §4.5 solamente describe el destacado y los demás artículos. B2 fija 22 rutas aunque ese escenario produce 20.  
   **Arreglo:** definir un estado vacío localizado, sin destacado ni enlaces a artículos, y verificarlo manualmente en B7. Aclarar que las 22 rutas de B2 corresponden al contenido inicial identificado en la evidencia; las comprobaciones de exclusión usan `20 + 2 × publicados`. Para el snapshot inicial, ambos slugs son `no-context-no-intelligence`, mientras falte `slugEs`.

7. **MENOR — B12, evidencia del cálculo de `sizes`.**  
   **Problema:** las fórmulas quedaron corregidas, pero falta la medición solicitada para contrastarlas.  
   **Evidencia:** B12 registra `currentSrc` y peso; no registra el ancho renderizado.  
   **Arreglo:** agregar ese ancho por contexto y captura a la evidencia. Pasada 4 #2: cálculo resuelto, comprobación parcial.

De la pasada 4 quedan resueltos **#3, #4, #6 y #7**: pertenencia de contenido a cada panel, firma discriminada de `pageMeta`, `whyFor` y excepción de URL Sin/Con. Los demás cierres parciales están detallados arriba.

La enmienda resuelve el contrato de rutas: `ArticleRef` lleva ambos slugs, `pageFromPath` queda limitado a páginas fijas y `page` llega a header/footer/selector. La retirada de `ARTICLE_SLUGS` y la reescritura del Markdown están correctamente previstas en el plan. Studio y sus pendientes de despliegue también quedan explícitos; no requieren adelantar Vercel ni agregar tests automáticos fuera de S1.