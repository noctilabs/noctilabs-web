# design-sync notes

- Repo es un sitio Astro, no una librería React: el sync es solo tokens + estilos + fuentes + tarjetas de referencia (decisión del dueño, 2026-10-04).
- El bundle lo arma `node .design-sync/build.mjs` (requiere `npm ci` para las fuentes de @fontsource). No usa el converter del skill ni genera `_ds_sync.json`; cada re-sync re-sube todo (son ~17 archivos).
- Cambios de marca se hacen en `src/styles/tokens.css` y se re-sincroniza; lo editado a mano en Claude Design se pisa.
- 2026-10-04 re-sync: fase 2 agregó clases compartidas en global.css (`.h1-int`, `.h2`, `.lead-hero`, `.sr-only`), `article.css` y primitivas en `src/components/ui/` (Button, CardBig, DarkBig, Kicker, HeadRow, Container). Las tarjetas las replican en HTML+CSS; si cambian esas primitivas, actualizar las tarjetas en build.mjs y conventions.md.
- Los títulos de páginas interiores son peso 500 (no 400); solo el hero de la home usa 400.
- 2026-10-04 re-sync tras la fase 3: `--muted` pasó a #595956 (spec 003 §3.4) y global.css sumó `.texture` (canvas fijo detrás del contenido; no se replica en tarjetas).
