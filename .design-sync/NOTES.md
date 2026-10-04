# design-sync notes

- Repo es un sitio Astro, no una librería React: el sync es solo tokens + estilos + fuentes + tarjetas de referencia (decisión del dueño, 2026-10-04).
- El bundle lo arma `node .design-sync/build.mjs` (requiere `npm ci` para las fuentes de @fontsource). No usa el converter del skill ni genera `_ds_sync.json`; cada re-sync re-sube todo (son ~17 archivos).
- Cambios de marca se hacen en `src/styles/tokens.css` y se re-sincroniza; lo editado a mano en Claude Design se pisa.
