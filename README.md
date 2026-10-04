# noctilabs-web

Web de NoctiLabs: Astro 7 estático, en español (sin prefijo) e inglés (`/en/`, con slugs traducidos).

## Desarrollo

Requiere Node `>=22.12 <23` (ver `.nvmrc`).

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # astro check + build estático en dist/
npm run preview   # sirve dist/ (las verificaciones se hacen sobre esto)
npm test          # Vitest: mapa de rutas (S1)
```

## Dónde está cada cosa

- `src/i18n/routes.ts`: contrato de URLs (`href`, `alternates`, `pageFromPath`). Todo link interno sale de acá.
- `src/i18n/ui.ts`: textos de interfaz y metadatos por página.
- `src/content/`: copy visible (industrias, páginas).
- `src/components/`: header, footer y piezas compartidas. `src/scripts/header.ts` tiene los estados
  del header (abierto, cerrado, menú mobile).
- `src/styles/tokens.css`: tokens del diseño.
