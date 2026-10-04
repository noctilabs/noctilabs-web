GATE: SÍ

1. **IMPORTANTE — `src/layouts/Base.astro:59`; `docs/evidence/004/scripts/csp-hashes.mjs:34`: JSON-LD sin los hashes exigidos y D7 informado incorrectamente.**  
   §2.5 exige que el contenido de JSON-LD quede cubierto por la CSP. Los bloques se emiten sin registrar sus hashes; el verificador los excluye mediante `!data`, aunque el README:48 afirma que todos los scripts inline tienen hash.  
   **Reproducción:** calculé SHA-256 del contenido de cada JSON-LD del build de `3576ba9`: ninguno aparece en su CSP. El de Organization es `sha256-Fo4B6jtdHt0cXOPl3CXVCM/j5jGLzoh1qroAobRIuIw=`, también ausente de la política registrada en la evidencia.  
   **Arreglo:** serializá cada bloque una sola vez, registrá su hash con `Astro.csp.insertScriptHash()` y renderizá ese mismo texto. Quitá la exclusión del verificador y corregí D7. Es un incumplimiento del contrato; estos bloques no ejecutables no demuestran por sí mismos una vulnerabilidad explotable.

2. **IMPORTANTE — `docs/evidence/004/scripts/d9-clasificar.mjs:23`: la clasificación de B15 presupone la explicación que debería comprobar.**  
   Cuando encuentra «formulario NO operable», lo atribuye al quinto error sin registrar cuántos errores hubo ni dónde quedó el foco. Basta que el único detalle de desborde sea el honeypot para declarar el caso explicado. Por eso «14/14 explicadas» no prueba toda la afirmación del README:50. D3 comprueba esos resultados únicamente a 200 % y 320 px.  
   **Evidencia adicional:** `d9/rama/b15-zoom-v2.txt:194` contiene **13 errores CSP** producidos por el propio instrumento al insertar el `<style>` que cambia la posición del header. Esa modificación queda bloqueada y la diferencia tampoco aparece en la clasificación.  
   **Arreglo:** reapuntá el escenario existente para esperar los cinco IDs y foco en Nombre en cada paso de zoom; excluí únicamente el honeypot del desborde. Usá el atributo `style` permitido para la preparación de capturas y registrá explícitamente los errores instrumentales. Las causas propuestas son plausibles, pero el clasificador actual puede esconder otra falla de validación o foco.

3. **MENOR — `docs/evidence/004/scripts/d9-comparar.mjs:10`: las “27 fallas nuevas” están mal contadas.**  
   El filtro `/FALLA/` incluye la línea de resumen **«12 FALLAS»** de `d9/rama/b8-v2.txt:56`. B8 tiene 12 filas fallidas, no 13; junto con las 14 filas de B15 son **26 filas**, no 27.  
   **Arreglo:** contá únicamente líneas que empiecen con `FALLA`, separá los resúmenes y regenerá la comparación y el README. Este error infla el resultado; no aporta evidencia de una regresión adicional.

**Límite de reproducción:** Vitest no pudo ejecutar S1 por `EPERM` al escribir archivos temporales del entorno; no lo cuento como hallazgo.