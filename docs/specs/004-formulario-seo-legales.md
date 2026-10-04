# Spec 004 — Formulario, SEO, analítica y legales

Estado: borrador, pasada 2 de revisión · 2026-10-04

## 1. Contexto

Las fases 1 a 3 dejan el sitio completo e interactivo. Para producción faltan cuatro cosas:

- **Formulario de Hablemos:** que envíe de verdad, con un tratamiento de datos legalmente habilitado.
- **SEO:** sitemap, Open Graph y datos estructurados.
- **Analítica.**
- **Política de privacidad, cabeceras de seguridad y redirects** desde la web vieja.

El lanzamiento (dominio, proyecto Vercel, deploy hooks y webhook de Sanity) es de la fase 6.

**Situación de producción** (relevada el 2026-10-04):
- **Host:** el canónico es `https://www.noctilabs.io`; `noctilabs.io` redirige ahí con un 307. La configuración de dominios vive en Vercel, fuera de este repo.
- **URLs de la web vieja:** `nocti-web-lastest` (con `cleanUrls: true`) sirve `/`, `/company`, `/book-a-call`, `/blog` y `/blog/<slug>` para sus 8 posts, más sus variantes `.html`. Además tiene redirects propios desde 7 aliases `/blog-post-*`, `/services` y `/es`.
- **Formulario viejo:** envía a Web3Forms (`api.web3forms.com/submit`) con la clave pública de la cuenta del dueño, un honeypot `botcheck` (checkbox) y `subject`/`from_name` fijos.

**Decisiones vigentes:** Astro con React solo en islas; ES + EN; SDD con gpt-6.1-sol; TDD solo en S1; Web Interface Guidelines de Vercel; Insights desde Sanity; Vercel diferido hasta la fase 6.

## 2. Alcance

### 2.1 Origen canónico (cambia S1)

- **Valor:** el origen pasa a `https://www.noctilabs.io`, el host que sirve producción.
- **Fuente única:** `src/site.mjs` exporta `ORIGIN`, y lo importan `astro.config.mjs` (`site`) y `src/i18n/routes.ts`.
- **TDD de S1:** primero se cambian los literales de `alternates` en los tests (rojo) y después el código.
- **Previews:** si `VERCEL_ENV` está definido y no es `production`, `Base.astro` agrega `<meta name="robots" content="noindex">` y `vercel.json` manda `X-Robots-Tag: noindex` en los dominios `*.vercel.app` (regla `has: host`). Las previews no se indexan.
- **Fase 6:** recrear y verificar en el proyecto nuevo `noctilabs.io` → `www.noctilabs.io` con redirect **permanente** (308), con HTTPS y conservando path y query, sin loops.

### 2.2 Tratamiento de datos del formulario (Ley 18.331)

**Fundamento:** el **consentimiento expreso e informado** de quien escribe (art. 9). Cubre la finalidad (responder la consulta y coordinar una conversación comercial) y la transferencia internacional a Web3Forms (art. 23 lit. A: consentimiento del titular).

**Aviso previo** (art. 13), visible **antes** del botón de envío y asociado al formulario con `aria-describedby`. Informa:
- la identidad y el domicilio del responsable (razón social, RUT y domicilio de NoctiLabs);
- la finalidad;
- que los datos se guardan en el correo del equipo y en el proveedor del formulario;
- qué campos son obligatorios y qué pasa si faltan (no se puede responder);
- la transferencia a Web3Forms (India) y sus subencargados;
- el plazo de conservación (24 meses desde el último contacto, salvo relación comercial);
- los derechos de acceso, rectificación, actualización y supresión, y cómo ejercerlos (hola@noctilabs.io);
- un link a la política completa, que se abre en una pestaña nueva con `rel="noopener"` y un aviso para lectores de pantalla («se abre en una pestaña nueva»), así no se pierde lo escrito.

**Checkbox de consentimiento:**
- es **obligatorio** y arranca **desmarcado**: «Acepto que NoctiLabs trate mis datos para responder esta consulta, incluida su transferencia a Web3Forms, según el aviso y la política de privacidad.»;
- tiene `<label>` propio, error en línea si falta («Para enviar, necesitamos tu consentimiento.») y foco en el primer error, como el resto de la validación (spec 002 §4.6).

**Registro del consentimiento:** el envío incluye `consent: true`, `consent_version` (fecha y versión del aviso, por ejemplo `2026-10-04.1`) y `consent_at` (ISO, hora del cliente). Llega en el mail de cada contacto.

**Datos del responsable:** razón social, RUT y domicilio los tiene que aportar el dueño (`docs/pendientes.md`). **El formulario no se habilita en producción** (fase 6) sin el aviso completo con esos datos y sin la revisión profesional del texto. Hasta entonces, el aviso lleva los marcadores `[RAZÓN SOCIAL]`, `[RUT]` y `[DOMICILIO]`, que un chequeo del build rechaza cuando `VERCEL_ENV === 'production'`.

### 2.3 Envío del formulario

`src/lib/contact.ts` → `submitContact(data)` hace un `POST` a `https://api.web3forms.com/submit`:

- **Cabeceras:** `Content-Type: application/json` y `Accept: application/json`.
- **Cuerpo:**
  - `access_key`: la clave pública de la cuenta del dueño, la que ya usa la web vieja;
  - `subject`: «Nuevo contacto desde la web (ES|EN)»;
  - `from_name`: «NoctiLabs web»;
  - `botcheck`: boolean, ver abajo;
  - los campos de spec 002 §4.6;
  - `locale`, `page` y los tres de consentimiento de §2.2.
- **Honeypot:** un `<input type="checkbox" name="botcheck">` fuera de pantalla, con `tabindex="-1"`, `autocomplete="off"` y `aria-hidden="true"`. Se lee con **`.checked`**. Si está marcado, `submitContact` resuelve sin hacer ningún request y se ve el estado «enviado»; si no, viaja `botcheck: false`.
- **Éxito:** solo HTTP 2xx **y** cuerpo JSON con `success === true` (booleano). Todo lo demás es error:
  - otro status;
  - JSON inválido;
  - `success` ausente, `false` o de otro tipo;
  - error de red;
  - el timeout.
- **Timeout:** 15 s con `AbortController`, que cubren el request **y** la lectura del cuerpo. El temporizador se limpia siempre (`finally`).
- **Antiabuso:**
  - el honeypot;
  - un intervalo mínimo de 30 s entre envíos exitosos en la misma pestaña; un nuevo envío antes de tiempo muestra «Esperá unos segundos antes de enviar otro mensaje.»;
  - la restricción de dominio de Web3Forms (`www.noctilabs.io`), que el dueño configura en su cuenta en la fase 6.
- **Riesgo aceptado:** sin captcha. Queda registrado en `docs/pendientes.md` junto con el plan y la cuota de Web3Forms (el gratuito permite 250 por mes, compartidos con la web vieja hasta el lanzamiento), quién monitorea los envíos y qué se hace si la cuota se agota (el mail sigue como canal alternativo en el estado de error).

### 2.4 Política de privacidad (cambia S1)

- **Rutas nuevas:** `/privacidad/` y `/en/privacy/`, con `PageRef { id: 'privacidad' }`. Van en S1 con TDD: `href`, `alternates` y `pageFromPath` con y sin barra, y `PAGES` pasa de 10 a 11 referencias (22 URLs fijas).
- **Metadatos:** en `ui.ts` (`pages.privacidad`), porque `pageMeta` los indexa por `id`.
- **Contenido:** amplía el aviso de §2.2 con:
  - las cookies (no se usan cookies propias ni de terceros);
  - la analítica de Vercel (§2.7: qué recoge y que no usa cookies);
  - los encargados (Web3Forms, Vercel y Sanity, este último solo para el contenido editorial y sin datos de visitantes);
  - la fecha de actualización.

  Es un borrador mío, pendiente de revisión profesional, con los mismos marcadores y el mismo bloqueo de producción que §2.2.
- **Layout:** `.prose-article`, sin índice.
- **Links:** desde el footer («Privacidad» / «Privacy») y desde el aviso del formulario.

### 2.5 Metadatos sociales y datos estructurados

- **Open Graph y Twitter** en `Base.astro`, para todas las páginas **indexables**: `og:title`, `og:description`, `og:url` (canonical), `og:type` (`article` o `website`), `og:image` absoluta, `og:locale` (`es_UY` / `en_US`) con su `og:locale:alternate`, y `twitter:card=summary_large_image`. La 404 no tiene canonical ni `og:url`; solo lleva title, description y `noindex`.
- **Imagen OG:** `public/og/og-es.png` y `og-en.png` (1200×630, isotipo, «NoctiLabs» y el lema). Se generan una vez con Chrome headless a partir de una plantilla HTML local y se commitean.
- **JSON-LD:**
  - **Formato:** `<script type="application/ld+json">` con el JSON serializado y `<` escapado como `<`, así un `</script>` dentro de un título de Sanity no cierra el elemento. Cada bloque tiene `@context: "https://schema.org"` y su `@type`.
  - **Home (ES y EN):** `Organization` (`name`, `url`, `logo` absoluto, `email`) y `WebSite` (`name`, `url`, `inLanguage`).
  - **Artículos:** `Article` (`headline` = H1, `datePublished` = fecha del post, `inLanguage`, `author` y `publisher` = la Organization, `mainEntityOfPage` = canonical, `image` = OG del idioma).
  - **Política:** el JSON-LD es la única vía de scripts no ejecutables, y su contenido queda cubierto por la CSP (§2.8).

### 2.6 Sitemap y robots

- **Sitemap propio:** `src/pages/sitemap.xml.ts` genera `/sitemap.xml` a partir de `PAGES` y de `getArticles()`, con un `<url>` por URL indexable y `xhtml:link` recíprocos (es, en y x-default) que salen de `alternates()`. Los slugs distintos por idioma quedan bien emparejados. No se usa `@astrojs/sitemap`, que empareja por path y fallaría con `/nosotros/` ↔ `/en/about/`.
- **`public/robots.txt`:**

  ```
  User-agent: *
  Allow: /

  Sitemap: https://www.noctilabs.io/sitemap.xml
  ```

### 2.7 Analítica

- **Herramienta:** Vercel Web Analytics, con `@vercel/analytics` (`inject()` desde un `<script>` procesado de `Base.astro`).
- **Activación:** solo cuando `VERCEL_ENV === 'production'`; en preview y en local no hay analítica.
- **Datos:** el `beforeSend` descarta la query string y el fragmento de las URLs reportadas, para no enviar datos personales en parámetros.
- **Consentimiento:** sin cookies ni identificadores persistentes, según la documentación de Vercel. Así lo informa la política (§2.4) y no hace falta un banner de consentimiento; la revisión profesional de §2.2 lo confirma.
- **Fase 6:** activar Analytics en el proyecto y verificar un pageview real recibido.

### 2.8 Seguridad

**CSP de scripts y estilos:** `security.csp` de Astro 7 genera por página un `<meta http-equiv="content-security-policy">` con hashes de los scripts y estilos que emite, islas incluidas.
- Se configura con `algorithm: 'SHA-256'`.
- Los scripts `is:inline` que no cubra se convierten a scripts procesados o se agregan con su hash.
- **No se usa `'unsafe-inline'` en `script-src`.**

**Cabeceras HTTP** (`vercel.json` en la raíz del repo):
- `Content-Security-Policy` con las directivas que un `<meta>` no puede expresar o que conviene fijar por servidor: `frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'`, más `default-src 'self'; img-src 'self' data:; media-src 'self'; font-src 'self'; connect-src 'self' https://api.web3forms.com https://*.vercel-insights.com`. Los scripts de Vercel Analytics se sirven desde el mismo origen (`/_vercel/insights/*`), así que quedan cubiertos por `'self'`.
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-Frame-Options: DENY`

**Links del CMS:** solo `http(s)`, `mailto` y rutas relativas (`safeHref`, ya implementado en `src/lib/insights.ts`).

### 2.9 Redirects desde la web vieja (`vercel.json` en la raíz)

Las URLs viejas son un conjunto **finito y congelado**: la web vieja se retira y los posts nuevos de Sanity solo tienen URLs de `/insights`. Por eso los redirects son reglas estáticas, sin generarlas en el build. Son permanentes (`"permanent": true`, 308), las específicas van antes que el comodín, y cada destino ya trae la barra final que exige `trailingSlash`.

| Origen (y variantes) | Destino |
|---|---|
| `/company`, `/company.html` | `/en/about/` |
| `/book-a-call`, `/book-a-call.html` | `/en/contact/` |
| `/blog`, `/blog.html` | `/en/insights/` |
| `/blog/no-context-no-intelligence` (y `.html`) | `/en/insights/no-context-no-intelligence/` |
| `/blog/introducing-noctilabs`, `/blog/production-gap`, `/blog/opportunity-audit`, `/blog/model-agnostic`, `/blog/legacy-stacks`, `/blog/agent-reconciliation`, `/blog/platform-engineering` (y `.html`) | `/en/insights/` (sin equivalente publicado) |
| `/blog/:slug*` (comodín, al final) | `/en/insights/` |
| `/blog-post-introducing-noctilabs`, `/blog-post-production-gap`, `/blog-post-opportunity-audit`, `/blog-post-model-agnostic`, `/blog-post-legacy-stacks`, `/blog-post-agent-reconciliation`, `/blog-post-platform-engineering` | `/en/insights/` |
| `/services`, `/es`, `/index.html` | `/` |

**Por qué inglés:** la web vieja era primero en inglés. **Variante con barra:** `/company/` y similares los normaliza primero `trailingSlash: true` y después aplica la regla. La interacción se verifica en la fase 6. **Bajas:** cuando un post viejo se publique en Insights, su regla se actualiza a mano; queda anotado en `docs/pendientes.md` como parte de la decisión sobre los 7 posts.

## 3. Fuera de alcance

- Dominio, proyecto Vercel, deploy hooks, webhook de Sanity y las verificaciones HTTP reales: fase 6.
- Contenido real del dueño (datos del responsable, revisión legal): fase 5.

## 4. Pruebas

TDD en S1 para el origen nuevo y las rutas de privacidad. El resto se verifica a mano con CDP y la evidencia va en `docs/evidence/004/`.

**Identidad del build verificado:** la evidencia registra:
- el commit;
- el hash del `package-lock.json`;
- las variables de entorno del build;
- un **snapshot de Sanity** (la respuesta de la consulta guardada como JSON, con su hash y su hora);
- los hashes de `dist/sitemap.xml` y de los HTML de artículo.

Todos los criterios se corren sobre **ese** build. Para que sea reproducible, se construye con `INSIGHTS_FIXTURE=<snapshot>`.

## 5. Criterios de aceptación

| # | Criterio | Cómo se verifica |
|---|---|---|
| D1 | Build sin errores ni warnings de tipos; diagnósticos del build: solo los avisos editoriales `[insights] excluido: …` esperados para el snapshot, listados en la evidencia. S1 en verde con el origen `www` y privacidad. Conteo: 22 URLs fijas indexables + 2 × artículos del snapshot + la 404. | Salida (código de salida). |
| D2 | **Formulario contra Web3Forms**, con la API interceptada por CDP `Fetch` (sin mandar mails):<br>- payload con los campos, metadatos, `botcheck: false` y consentimiento de §2.2–2.3;<br>- **un** request por envío válido;<br>- honeypot marcado: cero requests y estado enviado;<br>- casos de error: 2xx + `success: true` → enviado con foco en el título; 2xx + `success: false`, JSON inválido, `success` de otro tipo, 4xx/5xx, error de red, timeout en los headers y timeout en la lectura del cuerpo → error con el mail y valores conservados;<br>- sin consentimiento: error en línea y foco en el checkbox;<br>- segundo envío antes de 30 s: aviso de espera.<br>**Un envío real** de prueba a la cuenta del dueño, solo con su ok explícito en el momento, confirmando que el mail llegó. | Escenario CDP + registro de red. |
| D3 | **Aviso y política:** aviso de §2.2 completo antes del botón, con `aria-describedby`; link a la política en pestaña nueva con su aviso; checkbox accesible. Revisado en ES/EN con teclado, contraste sobre el fondo efectivo, zoom 200 % y reflow a 320 px. Política con canonical, hreflang y footer. Con `VERCEL_ENV=production` y marcadores presentes, el build falla. | CDP + comparador como A4 + build de prueba. |
| D4 | **OG, Twitter y JSON-LD** en una página de cada tipo y en los dos idiomas: URLs absolutas con `www`; JSON-LD parseable, con `@context` y `@type`, y `headline`, `datePublished`, `inLanguage` y `url` iguales a los del artículo renderizado. Prueba manual con un post de fixture cuyo título tiene comillas y `</script>`: el HTML no se rompe y el JSON-LD parsea. La 404 queda sin `og:url`. | Extracción de `dist/` + build con fixture. |
| D5 | **Sitemap:** todas las URLs indexables, ninguna inexistente, alternates recíprocos (cada `xhtml:link` apunta a una URL que también está en el sitemap y vuelve). `robots.txt` igual al de §2.6. | Script sobre `dist/`. |
| D6 | **`vercel.json` de la raíz:** cada fila de la tabla de §2.9 (con sus variantes), en el orden correcto, más las cabeceras de §2.8 y la regla `noindex` de previews. Las respuestas HTTP reales se verifican en la fase 6. | Lectura del JSON contra la tabla. |
| D7 | **Cabeceras y CSP aplicadas:** el build se sirve con un servidor local (`scratchpad`) que aplica las cabeceras de `vercel.json`. Se registran las respuestas HTTP, cero violaciones CSP (`securitypolicyviolation`) recorriendo todas las rutas con hidratación de islas, video, textura, formulario (interceptado) e Insights. Un iframe a una página del sitio no carga (`frame-ancestors`). Un link `javascript:` en un fixture de Sanity no se renderiza. | CDP + servidor local. |
| D8 | **Analítica:** sin `VERCEL_ENV=production` no se inyecta. Con `VERCEL_ENV=production` (build de prueba), se inyecta, y los pedidos a `/_vercel/insights/*` (interceptados) llevan URLs sin query ni fragmento. El pageview real se verifica en la fase 6. | Dos builds + CDP. |
| D9 | **Regresión:** A7, B4, B5, B8, B9, B10, B15 y C3, C5 y C8 de la fase 3. | Re-ejecución. |
| D10 | gpt-6.1-sol aprueba el spec y la implementación con la evidencia D1–D9 sobre el mismo build identificado. La aprobación es local de la fase 4; las verificaciones HTTP y de dominio quedan como condición de la fase 6. | Veredicto con hash y snapshot. |

## 6. Decisiones y pendientes

- **E1. Formulario:** Web3Forms con la cuenta del dueño. *Alternativa:* una función serverless con Resend.
- **E2. Analítica:** Vercel Web Analytics, sin cookies.
- **E3. Host canónico:** `www.noctilabs.io`, con apex → www permanente en la fase 6.
- **E4. Redirects viejos a inglés.**
- **E5. Base legal:** consentimiento expreso con aviso completo.

**Pendientes del dueño** (en `docs/pendientes.md`, **bloquean el lanzamiento**):
- razón social, RUT y domicilio del responsable;
- revisión profesional del aviso y de la política;
- plan y cuota de Web3Forms, quién monitorea los envíos y la restricción de dominio.

## 7. Plan

1. **S1 con TDD:** origen `www` en `src/site.mjs` y rutas de privacidad. Se verifica con D1.
2. **Aviso, consentimiento y envío a Web3Forms** con honeypot, timeout y antiabuso. Se verifica con D2 y D3.
3. **Política de privacidad** con sus marcadores y el bloqueo de producción. Se verifica con D3.
4. **OG, JSON-LD, sitemap propio y robots.** Se verifica con D4 y D5.
5. **`vercel.json`** (redirects, cabeceras, `noindex` de previews) y **`security.csp`.** Se verifica con D6 y D7.
6. **Analítica.** Se verifica con D8.
7. **Evidencia con build identificado y gate.** Se verifica con D9 y D10.
