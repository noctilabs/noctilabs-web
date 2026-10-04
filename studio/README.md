# Studio de Sanity (Insights)

Studio del proyecto `q164hlpj` (dataset `production`). Lo usa la web nueva para Insights (spec 002 §3.4) y, hasta el
lanzamiento, también el blog de la web vieja (`nocti-web-lastest`), que ignora los campos nuevos.

Campos agregados al `post`: `slugEs`, `showOnInsights` y `topic`.

```bash
cd studio
npm install
npx sanity login      # con la cuenta del dueño
npx sanity deploy     # publica el Studio con el schema nuevo en noctilabs.sanity.studio
```

Publicar en Sanity no actualiza la web por sí solo: hace falta el webhook → deploy hook de Vercel (fase 6).
