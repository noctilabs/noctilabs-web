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

## Cómo se trabaja

Spec-driven: cada fase tiene un spec en `docs/specs/`, revisado por gpt-6.1-sol antes de implementar. La
implementación se cierra con la evidencia en `docs/evidence/<fase>/` y un gate de gpt-6.1-sol sobre el mismo
commit. Las revisiones quedan en `docs/reviews/`.

- Fase 1, fundación: [spec](docs/specs/001-fundacion.md) · [evidencia](docs/evidence/001/README.md)
- Fase 2, páginas: [spec](docs/specs/002-paginas.md) · [inventario del diseño](docs/specs/002-inventario-diseno.md)

## Dónde está cada cosa

- `src/i18n/routes.ts`: contrato de URLs (`href`, `alternates`, `pageFromPath`). Todo link interno sale de acá.
- `src/i18n/ui.ts`: textos de interfaz y metadatos por página.
- `src/content/`: copy visible (industrias, páginas).
- `src/components/`: header, footer y piezas compartidas. `src/scripts/header.ts` tiene los contratos de estado
  del header (spec 001 §3.5).
- `src/styles/tokens.css`: tokens del diseño.
