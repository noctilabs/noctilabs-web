GATE: SÍ

Los siete hallazgos de la pasada 5 quedan cerrados: B15 incluye el 400 % y permite la reducción intermedia; §7/6e autoriza el contenido editorial de Sanity; los minutos son por idioma; el loader usa `_id`, sincronización completa y `INSIGHTS_FIXTURE`; la publicación exige texto renderizable y fecha válida; existe estado vacío; B12 registra el ancho renderizado. Los pendientes anteriores quedan resueltos o reemplazados por la enmienda.

El contrato de `ArticleRef`, `pageFromPath`, navegación y metadatos es coherente. Studio y sus pendientes están definidos; B2 contempla el número variable de publicados y B7 verifica exclusiones, colisiones, retirada con caché conservada y falla de Sanity. La reescritura del código anterior está prevista: no constituye un bloqueo del spec.

1. **MENOR — §3.4, lead del artículo.**  
   **Problema:** la regla editorial y el selector indicado no siempre seleccionan el mismo párrafo.  
   **Evidencia:** L180 define como lead el primer bloque `normal`, pero `.prose-article > p:first-child` no lo selecciona si el cuerpo empieza con un H2 o una cita, ambos admitidos.  
   **Arreglo:** asignar una clase al primer bloque `normal` durante el render y aplicar ahí el estilo de lead.

2. **MENOR — B9/B10, alcance de las comprobaciones.**  
   **Problema:** conservan el número fijo de 22 rutas, mientras B2 ya establece un total variable.  
   **Evidencia:** L474–475 dicen «en las 22 rutas»; B2 prescribe `20 + 2 × publicados`, y B7 incluye cero publicados.  
   **Arreglo:** decir «en todas las rutas generadas; 22 para el snapshot inicial identificado en B2». Así queda claro el alcance cuando cambie el contenido.

No quedan BLOQUEANTES en el contrato revisado. Este gate aprueba el spec; la implementación sigue requiriendo la evidencia B1–B15.