# Spec 004 — Formulario, SEO, analítica y legales

Estado: borrador para revisión · 2026-10-04

## 1. Contexto

Las fases 1 a 3 dejan el sitio completo e interactivo, pero todavía no está listo para producción:

- el formulario de Hablemos no envía (spec 002 §4.6);
- faltan sitemap, Open Graph y datos estructurados;
- no hay analítica ni política de privacidad;
- las URLs de la web vieja quedarían rotas al reemplazarla.

Este spec cierra esos puntos. El lanzamiento (dominio, Vercel y deploy hooks) es de la fase 6.

**Situación de producción** (relevada el 2026-10-04):
- el host canónico es `https://www.noctilabs.io`; `noctilabs.io` redirige ahí con un 307;
- la web vieja (`nocti-web-lastest`) sirve `/`, `/company`, `/book-a-call`, `/blog` y `/blog/<slug>`, y tiene redirects propios desde `/blog-post-*`, `/services` y `/es`;
- el formulario viejo envía a Web3Forms (`api.web3forms.com/submit`) con la clave pública de la cuenta del dueño, un honeypot `botcheck` y `subject`/`from_name` fijos.

**Decisiones vigentes:** Astro con React solo en islas; ES + EN; SDD con gpt-6.1-sol; TDD solo en S1; Web Interface Guidelines de Vercel; Vercel diferido hasta el lanzamiento.

## 2. Alcance

### 2.1 Origen canónico (cambia S1)

- **Origen:** pasa de `https://noctilabs.io` a **`https://www.noctilabs.io`**, el host que sirve producción. Se define una sola vez en `src/i18n/routes.ts` (`ORIGIN`) y en `astro.config.mjs` (`site`).
- **TDD de S1:** los literales de `alternates` en los tests se cambian primero (rojo), después el código.
- **Fase 6:** el redirect apex → www queda como está hoy en el dominio.

### 2.2 Envío del formulario

`src/lib/contact.ts` → `submitContact(data)` pasa a hacer un `POST` real a `https://api.web3forms.com/submit`:

- **Formato:** `Content-Type: application/json`, con `access_key` (la clave pública que ya usa la web vieja, en `src/lib/contact.ts`), `subject: "Nuevo contacto desde la web (ES|EN)"`, `from_name: "NoctiLabs web"`, `botcheck` y los campos de spec 002 §4.6 (`name`, `email`, `organization`, `role`, `industry` y `message`), más `locale` y `page`.
- **Honeypot:** un campo `botcheck` oculto para personas (fuera de pantalla, `tabindex="-1"`, `autocomplete="off"` y `aria-hidden`). Si viene con valor, `submitContact` resuelve sin enviar nada, igual que si hubiera funcionado.
- **Éxito:** HTTP 200 con `success: true` → estado «enviado» (spec 002 §4.6).
- **Error:** cualquier otra respuesta, un error de red o un timeout de 15 s (con `AbortController`) → estado «error», que ofrece el mail.
- **Privacidad:** debajo del botón va «Al enviar, aceptás nuestra [política de privacidad](href privacidad)», en 13 px y `--muted`, sin checkbox.

### 2.3 Política de privacidad (cambia S1)

- **Rutas nuevas:** `/privacidad/` y `/en/privacy/`, con `PageRef { id: 'privacidad' }`. Se agregan con TDD en S1: `href`, `alternates` y `pageFromPath` (con y sin barra final), y `PAGES` pasa de 20 a 22.
- **Contenido:** un borrador redactado por mí, pendiente de revisión del dueño y de un profesional (`docs/pendientes.md`), en el marco de la Ley 18.331 de Uruguay. Cubre:
  - responsable;
  - datos que se recogen (formulario y analítica sin cookies);
  - finalidad;
  - encargados (Web3Forms para el formulario, Vercel para el hosting y la analítica, Sanity para el contenido);
  - plazo de conservación;
  - derechos ARCO y cómo ejercerlos (hola@noctilabs.io);
  - fecha de actualización.
- **Layout:** el mismo `.prose-article` del artículo, sin índice. Va con `noindex: false`.
- **Footer:** un link «Privacidad» / «Privacy» en la fila inferior.

### 2.4 Metadatos sociales y datos estructurados

- **Open Graph y Twitter** en `Base.astro`, para todas las páginas: `og:title`, `og:description`, `og:url` (canonical), `og:type` (`article` en los artículos y `website` en el resto), `og:image` absoluta, `og:locale` (`es_UY` / `en_US`) con su `og:locale:alternate`, y `twitter:card=summary_large_image`.
- **Imagen OG:** una por idioma (`public/og/og-es.png` y `og-en.png`, 1200×630). Se genera una sola vez en un script local que captura con Chrome headless una plantilla HTML con el isotipo, «NoctiLabs» y el lema. Se commitea como asset.
- **JSON-LD:**
  - `Organization` (nombre, url, logo, email) y `WebSite` en el home de los dos idiomas;
  - `Article` en cada artículo (headline, datePublished, inLanguage, author Organization y url).

### 2.5 Sitemap y robots

- **`@astrojs/sitemap`**, con `i18n` configurado para emitir `xhtml:link` alternates entre ES y EN. Excluye la 404.
- **`public/robots.txt`:** `Allow: /` y `Sitemap: https://www.noctilabs.io/sitemap-index.xml`.

### 2.6 Redirects desde la web vieja (`vercel.json`)

Son permanentes (308) y se aplican cuando el dominio pase al proyecto nuevo (fase 6):

| Origen | Destino |
|---|---|
| `/company` | `/en/about/` |
| `/book-a-call` | `/en/contact/` |
| `/blog` | `/en/insights/` |
| `/blog/:slug` | `/en/insights/:slug/` si el slug está publicado; si no, `/en/insights/` |
| `/blog-post-*` (las 7 de la web vieja) | `/en/insights/` |
| `/services`, `/es` | `/` |

**Por qué inglés:** la web vieja era primero en inglés, así que esas URLs vienen de público y links en inglés.

**Destinos de `/blog/:slug`:** se generan en el build. Un paso de `astro:build:done` escribe en `dist/` un `vercel.json` final con un redirect por cada slug publicado, más el comodín. El `vercel.json` versionado queda como base.

### 2.7 Analítica

- **Herramienta:** Vercel Web Analytics, que no usa cookies, así que no hace falta banner de consentimiento.
- **Script:** `/_vercel/insights/script.js`, con `defer`. Se incluye **solo** si la variable de entorno `VERCEL` está definida en el build, para que localmente no haya un 404 ni errores de consola.
- **Activación:** en el panel del proyecto Vercel, en la fase 6.
- **Política de privacidad:** la menciona.

### 2.8 Cabeceras de seguridad (`vercel.json`)

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-Frame-Options: DENY`
- `Content-Security-Policy`:
  - `default-src 'self'`;
  - `script-src 'self' 'unsafe-inline'`, porque Astro inlinea scripts chicos;
  - `style-src 'self' 'unsafe-inline'`;
  - `img-src 'self' data:`;
  - `media-src 'self'`;
  - `font-src 'self'`;
  - `connect-src 'self' https://api.web3forms.com`;
  - `frame-ancestors 'none'`;
  - `base-uri 'self'`;
  - `form-action 'self'`.

  `script-src` y `connect-src` agregan `/_vercel/insights` si hace falta. Antes de fijarla se verifica que no rompa ninguna página.

## 3. Fuera de alcance

- Dominio, proyecto Vercel, deploy hooks y webhook de Sanity: fase 6.
- Contenido real del dueño: fase 5.

## 4. Pruebas

TDD en S1 para el origen nuevo y las rutas de privacidad. El resto se verifica a mano con CDP y la evidencia queda en `docs/evidence/004/`.

## 5. Criterios de aceptación

| # | Criterio | Cómo se verifica |
|---|---|---|
| D1 | Build sin errores ni warnings; S1 en verde con el origen `www` y las rutas de privacidad (24 páginas fijas + artículos). | Salida. |
| D2 | **Formulario contra Web3Forms**, con la API interceptada por CDP `Fetch` (sin mandar mails reales): el payload tiene los campos y metadatos de §2.2; 200 + `success` → enviado con foco en el título; 4xx/5xx, error de red y timeout → error con el mail y valores conservados; con honeypot lleno no hay request y se ve enviado. **Un envío real** de prueba a la cuenta del dueño, solo con su ok explícito en el momento. | Escenario CDP + registro de red. |
| D3 | Política de privacidad en ES/EN, linkeada desde el footer y desde el formulario, con canonical y hreflang. | Comparador como el de A4. |
| D4 | Open Graph, Twitter y JSON-LD presentes y válidos en una página de cada tipo y en los dos idiomas: el JSON-LD se parsea sin errores y las URLs son absolutas con `www`. | Extracción de `dist/`. |
| D5 | `sitemap-index.xml` con todas las páginas indexables y sus alternates; `robots.txt` correcto. | Lectura de `dist/`. |
| D6 | `vercel.json` final con los redirects de §2.6, uno por cada slug publicado, y las cabeceras de §2.8. | Lectura de `dist/vercel.json`. Las respuestas HTTP reales se verifican en la fase 6. |
| D7 | Sin errores de consola en todas las rutas con la CSP aplicada. Se emula con un `<meta http-equiv>` temporal en el preview local, porque `astro preview` no aplica las cabeceras de Vercel. | CDP. |
| D8 | Analítica: sin `VERCEL`, no hay script; con `VERCEL=1`, el script está en todas las páginas. | Dos builds. |
| D9 | Las fases anteriores no se rompen: checklist del header, B y C afectados. | Re-ejecución. |
| D10 | gpt-6.1-sol aprueba el spec y la implementación con la evidencia D1–D9 sobre un mismo commit. | Veredicto con hash. |

## 6. Decisiones (con default)

- **E1. Backend del formulario:** Web3Forms, con la cuenta y la clave del dueño que ya usa la web vieja. *Alternativa:* una función serverless con Resend (requiere una API key nueva).
- **E2. Analítica:** Vercel Web Analytics, sin cookies. *Alternativa:* Plausible (pago).
- **E3. Host canónico:** `www.noctilabs.io`, como hoy.
- **E4. Redirects viejos a inglés.**
- **E5. Política de privacidad:** borrador mío, pendiente de revisión profesional.

## 7. Plan

1. **S1 con TDD:** origen `www` y rutas de privacidad. Se verifica con D1.
2. **Envío del formulario y honeypot.** Se verifica con D2.
3. **Política de privacidad y links.** Se verifica con D3.
4. **OG, JSON-LD, sitemap y robots.** Se verifica con D4 y D5.
5. **`vercel.json`: redirects, generación en el build y cabeceras.** Se verifica con D6 y D7.
6. **Analítica condicional.** Se verifica con D8.
7. **Evidencia y gate.** Se verifica con D9 y D10.
