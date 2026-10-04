# Spec 004 — Formulario, SEO, analítica y legales

Estado: borrador, pasada 4 de revisión · 2026-10-04

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
- **Previews:** si `VERCEL_ENV` está definido y no es `production` (que la fase 6 verifica que esté expuesto), `Base.astro` agrega `<meta name="robots" content="noindex">` y `vercel.json` manda `X-Robots-Tag: noindex` en los dominios `*.vercel.app` (regla `has: host`). Las previews no se indexan.
- **Fase 6:** recrear y verificar en el proyecto nuevo `noctilabs.io` → `www.noctilabs.io` con redirect **permanente** (308), con HTTPS y conservando path y query, sin loops.

### 2.2 Tratamiento de datos del formulario (Ley 18.331)

**Fundamento:** el **consentimiento expreso e informado** de quien escribe (art. 9). Cubre la finalidad (responder la consulta y coordinar una conversación comercial) y la transferencia internacional a Web3Forms (art. 23 lit. A: consentimiento del titular).

**Aviso previo** (art. 13), visible **antes** del botón de envío y asociado al formulario con `aria-describedby`. Informa:
- la identidad y el domicilio del responsable (razón social, RUT y domicilio de NoctiLabs);
- la finalidad;
- que los datos se guardan en el correo del equipo y en el proveedor del formulario;
- qué campos son obligatorios y qué pasa si faltan (no se puede responder);
- la transferencia a Web3Forms (India) y sus subencargados;
- el plazo de conservación: 24 meses desde el último contacto, y si hay relación comercial, mientras dure más 24 meses;
- los derechos de acceso, rectificación, actualización y supresión, y cómo ejercerlos (hola@noctilabs.io);
- un link a la política completa, que se abre en una pestaña nueva con `rel="noopener"` y un aviso para lectores de pantalla («se abre en una pestaña nueva»), así no se pierde lo escrito.

**Checkbox de consentimiento:**
- es **obligatorio** y arranca **desmarcado**: «Acepto que NoctiLabs trate mis datos para responder esta consulta, incluida su transferencia a Web3Forms, según el aviso y la política de privacidad.»;
- tiene `<label>` propio, error en línea si falta («Para enviar, necesitamos tu consentimiento.») y foco en el primer error, como el resto de la validación (spec 002 §4.6).

**Registro del consentimiento:** el envío incluye `consent: true`, `consent_version` (fecha y versión del aviso, por ejemplo `2026-10-04.1`) y `consent_at` (ISO, hora del cliente). Llega en el mail de cada contacto.

**Datos del responsable:** razón social, RUT y domicilio los tiene que aportar el dueño (`docs/pendientes.md`). **El formulario no se habilita en producción** (fase 6) sin el aviso completo con esos datos y sin la revisión profesional del texto. Hasta entonces, los datos viven en `src/content/legal.ts` con los marcadores `[RAZÓN SOCIAL]`, `[RUT]` y `[DOMICILIO]`, y un chequeo del build los rechaza cuando `VERCEL_ENV === 'production'`.

**Fixture legal para las pruebas locales:** con `LEGAL_FIXTURE=1`, el build reemplaza los marcadores por datos sintéticos visiblemente falsos («Empresa de Prueba S.A. — DATOS DE PRUEBA, NO PUBLICAR»), escribe `NO-PUBLICAR.txt` y usa un directorio de salida **separado** (`dist-fixture/`, con `outDir` según la variable), nunca `dist/`. Así se pueden construir y verificar localmente las variantes de producción sin desactivar el bloqueo.

**Perfil de publicación:** el deploy usa `npm run build:publish` (el `buildCommand` de `vercel.json`), que define `PUBLISH=1`. Con `PUBLISH=1`, el build **falla** si hay marcadores legales, si está definido `LEGAL_FIXTURE` o `INSIGHTS_FIXTURE`, o si el artefacto contiene `NO-PUBLICAR.txt` o el texto «DATOS DE PRUEBA». Esto vale **independientemente** de las variables del sistema de Vercel (`VERCEL`, `VERCEL_ENV`), que el proyecto podría no exponer. En la fase 6 se verifica que esas variables estén expuestas y se inspecciona el artefacto final.

### 2.3 Envío del formulario

`src/lib/contact.ts` → `submitContact(data)` hace un `POST` a `https://api.web3forms.com/submit`:

- **Cabeceras:** `Content-Type: application/json` y `Accept: application/json`.
- **Cuerpo:**
  - `access_key`: la clave pública de la cuenta del dueño, la que ya usa la web vieja;
  - `subject`: «Nuevo contacto desde la web (ES|EN)»;
  - `from_name`: «NoctiLabs web»;
  - `botcheck`: boolean, ver abajo;
  - los campos de spec 002 §4.6;
  - `locale`; `page`, que es **la URL canónica de Hablemos en ese idioma** (de `alternates()`, sin query ni fragmento), nunca `location.href`; y los tres de consentimiento de §2.2.
- **Controlador** (`src/scripts/contact-form.ts`, adaptado):
  - el payload se arma con campos **tipados** (strings recortados, `consent: true`, `botcheck: boolean`), no recorriendo todos los inputs;
  - el consentimiento se valida con `.checked`;
  - el honeypot queda fuera de la validación, de los nodos de error y del cálculo de «formulario modificado» (`beforeunload`);
  - validar, editar y resetear no lanzan excepciones con los checkboxes;
  - **durante el envío**, después de capturar el payload, todo el `<fieldset>` queda deshabilitado, así que no se puede editar nada que no se vaya a enviar. Con error se vuelve a habilitar con los valores intactos; con éxito se oculta.
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
  - la restricción de dominio de Web3Forms (`www.noctilabs.io`), que es una función **PRO**. Si la cuenta tiene PRO, en la fase 6:
    1. un envío desde `www` antes de restringir;
    2. activar la restricción;
    3. **un envío desde `https://www.noctilabs.io` con la restricción activa**, confirmando la recepción del mail con los campos de consentimiento;
    4. un intento desde un origen no autorizado (por ejemplo, el preview), que tiene que ser rechazado.

    Si la cuenta es gratuita, el dueño acepta explícitamente el riesgo sin restricción (`docs/pendientes.md`).
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
  - **Formato:** `<script type="application/ld+json">` con el JSON de `JSON.stringify(datos)` en el que cada carácter `<` se reemplaza por su escape Unicode JSON (barra invertida, `u`, `003c`: seis caracteres). Así un `</script>` dentro de un título de Sanity no cierra el elemento, y el JSON sigue siendo equivalente. Cada bloque tiene `@context: "https://schema.org"` y su `@type`.
  - **Home (ES y EN):** `Organization` (`name`, `url`, `logo` absoluto, `email`) y `WebSite` (`name`, `url`, `inLanguage`).
  - **Artículos:** `Article` (`headline` = H1, `datePublished` = fecha del post, `inLanguage`, `author` y `publisher` = la Organization, `mainEntityOfPage` y `url` = canonical, `image` = OG del idioma).
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

- **Herramienta:** Vercel Web Analytics, con `@vercel/analytics` en una **versión fijada en el lockfile**. Se llama a `inject({ mode: 'production', beforeSend })` desde un `<script>` procesado de `Base.astro`.
- **Activación:** solo cuando `VERCEL_ENV === 'production'`. En preview y en local no hay analítica.
- **Páginas:** solo las que tienen `PageRef`, es decir, las 22 fijas y los artículos publicados. La **404 no inyecta analítica**, así que una ruta desconocida, que podría contener datos personales en el path, no se reporta. Los paths que sí se reportan son solo los del contrato de rutas y los slugs publicados.
- **`beforeSend`:** descarta la query string y el fragmento.
- **Consentimiento:** sin cookies ni identificadores persistentes, según la documentación de Vercel. Así lo informa la política (§2.4) y lo confirma la revisión profesional de §2.2.
- **`beforeSend`** se define en `src/lib/analytics.ts` como función pura (recibe y devuelve el evento). En la verificación local, la carga de `/_vercel/insights/script.js` se intercepta y se responde con un **stub del consumidor de la cola**, versionado en el scratchpad de la evidencia e identificado por su hash. El stub lee la cola `window.va` / `window.vaq` del SDK, ejecuta el `beforeSend` encolado con eventos sintéticos (URL con query, con fragmento y con un email en la query) y publica la entrada y la salida para que CDP las lea.
- **Fase 6:** activar Analytics en el proyecto y verificar en el panel de Vercel un pageview real, con una URL con query y fragmento, que figure registrado sin ellos.

### 2.8 Seguridad

**CSP de carga, en el `<meta>` de Astro** (`security.csp`):
- todas las directivas de carga van en `security.csp.directives`, junto con los hashes que Astro genera por página para scripts y estilos, islas incluidas: `default-src 'self'; img-src 'self' data:; media-src 'self'; font-src 'self'; connect-src 'self' https://api.web3forms.com https://*.vercel-insights.com; object-src 'none'; base-uri 'self'; form-action 'self'`;
- se configura con `algorithm: 'SHA-256'`;
- los scripts `is:inline` que no cubra se convierten a scripts procesados o se agregan con su hash;
- **no hay `'unsafe-inline'` en `script-src`**;
- **atributos `style`**: los hashes no los cubren, y el sitio y las islas los usan para valores calculados (posiciones de los nodos, variables de `Container` y `Kicker`, estilos de React). Con la API de Astro 7.3: `security.csp.styleDirective.resources: [{ resource: "'unsafe-inline'", kind: 'attribute' }]` (se emite como permiso solo de atributos), y `security.csp.directives` lleva **solo** las directivas que acepta su validador. Los bloques `<style>` y los scripts siguen con `'self'` y hashes. Es un riesgo acotado: CSS en atributos, sin ejecución de scripts. D7 inspecciona la política emitida y comprueba que ningún `'unsafe-inline'` alcance scripts ni elementos `<style>`.

**Cabecera HTTP complementaria** (`vercel.json` en la raíz), **sin `default-src`**, para no restringir por fallback lo que el `<meta>` habilita: `Content-Security-Policy: frame-ancestors 'none'`. Como las dos políticas se aplican a la vez, cada recurso tiene que cumplir ambas, y la cabecera solo agrega lo que un `<meta>` no puede expresar.

**Otras cabeceras:**
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

**Por qué inglés:** la web vieja era primero en inglés.

**Barra final:** con `trailingSlash: true`, Vercel redirige `/company` a `/company/` **antes** de evaluar los redirects, y las fuentes se comparan de forma estricta. Por eso **cada origen se declara en las dos formas**, sin barra y con barra (`/company` y `/company/`), y las variantes `.html` sin barra. Lo mismo vale para los slugs de `/blog/…` y los aliases `/blog-post-*`. Las reglas específicas van antes del comodín `/blog/:slug*`. **Bajas:** cuando un post viejo se publique en Insights, su regla se actualiza a mano; queda anotado en `docs/pendientes.md` como parte de la decisión sobre los 7 posts.

## 3. Fuera de alcance

- Dominio, proyecto Vercel, deploy hooks, webhook de Sanity y las verificaciones HTTP reales: fase 6.
- Contenido real del dueño (datos del responsable, revisión legal): fase 5.

## 4. Pruebas

TDD en S1 para el origen nuevo y las rutas de privacidad. El resto se verifica a mano con CDP y la evidencia va en `docs/evidence/004/`.

**Matriz de builds identificados:** cada criterio declara sobre qué variante corre, y cada variante tiene un manifiesto:
- commit y árbol limpio;
- hash del `package-lock.json`;
- variables de entorno;
- fixtures (`INSIGHTS_FIXTURE` con el **snapshot de Sanity**, que es la respuesta guardada como JSON con su hash y su hora; y `LEGAL_FIXTURE`);
- hash de `vercel.json`;
- hashes de los artefactos servidos (HTML, JS, CSS y `sitemap.xml`);
- versión del servidor local.

| Variante | Entorno | Para |
|---|---|---|
| **base** | snapshot; sin `VERCEL_ENV` | D1, D2, D3 (ES/EN y teclado), D4, D5, D6, D7 y D9 |
| **prod-bloqueada** | `VERCEL_ENV=production`, sin `LEGAL_FIXTURE` | D3: el build falla por los marcadores |
| **prod-prueba** | `VERCEL_ENV=production`, `LEGAL_FIXTURE=1` (salida en `dist-fixture/`) | D8, más consola y CSP de D7 (no publicable) |
| **publish-falla** | `PUBLISH=1` con marcadores o con fixtures | el build falla (§2.2) |
| **adversarial** | fixture con un título con comillas y `</script>` y un link `javascript:` | D4 y D7 |

D7 y D9 corren sobre la variante base, con la implementación de la fase 3 identificada por su commit.

## 5. Criterios de aceptación

| # | Criterio | Cómo se verifica |
|---|---|---|
| D1 | Build sin errores ni warnings de tipos; diagnósticos del build: solo los avisos editoriales `[insights] excluido: …` esperados para el snapshot, listados en la evidencia. S1 en verde con el origen `www` y privacidad. Conteo de HTML: 22 + 2N + 1, con **N = artículos que devuelve `getArticles()`** para el snapshot (no los documentos crudos). Diagnósticos: cero errores de tipos y **cero diagnósticos inesperados**; los avisos editoriales esperados de cada fixture se enumeran en la evidencia. | Salida (código de salida). |
| D2 | **Formulario contra Web3Forms**, con la API interceptada por CDP `Fetch` (sin mandar mails):<br>- payload con los campos, metadatos, `botcheck: false` y consentimiento de §2.2–2.3;<br>- **un** request por envío válido;<br>- honeypot marcado: cero requests y estado enviado;<br>- casos de error: 2xx + `success: true` → enviado con foco en el título; 2xx + `success: false`, JSON inválido, `success` de otro tipo, 4xx/5xx, error de red, timeout en los headers y timeout en la lectura del cuerpo → error con el mail y valores conservados;<br>- sin consentimiento: error en línea y foco en el checkbox;<br>- segundo envío antes de 30 s: aviso de espera.<br>**Un envío real** de prueba a la cuenta del dueño, solo con su ok explícito en el momento, confirmando que el mail llegó. | Escenario CDP + registro de red. |
| D3 | **Aviso y política:** aviso de §2.2 completo antes del botón, con `aria-describedby`; link a la política en pestaña nueva con su aviso; checkbox accesible. Revisado en ES/EN con teclado, contraste sobre el fondo efectivo, zoom 200 % y reflow a 320 px. Política con canonical, hreflang y footer. Con `VERCEL_ENV=production` y marcadores presentes, el build falla. | CDP + comparador como A4 + build de prueba. |
| D4 | **OG, Twitter y JSON-LD** en una página de cada tipo y en los dos idiomas: URLs absolutas con `www`; JSON-LD parseable, con `@context` y `@type`, y `headline`, `datePublished`, `inLanguage` y `url` iguales a los del artículo renderizado. Prueba manual con un post de fixture cuyo título tiene comillas y `</script>`: el HTML no se rompe y el JSON-LD parsea. La 404 queda sin `og:url`. | Extracción de `dist/` + build con fixture. |
| D5 | **Sitemap:** todas las URLs indexables, ninguna inexistente, alternates recíprocos (cada `xhtml:link` apunta a una URL que también está en el sitemap y vuelve). `robots.txt` igual al de §2.6. | Script sobre `dist/`. |
| D6 | **`vercel.json` de la raíz:** las reglas se compilan con `@vercel/routing-utils` (el mecanismo de Vercel, instalado solo en el scratchpad de verificación) y se ejecuta la matriz completa de §2.9: cada origen sin barra, con barra y `.html`, con query (`?utm=x`). Para cada caso se registra la regla que matchea, el destino, que la query se conserva y que el destino existe en `dist/`. Se revisan también las cabeceras de §2.8 y la regla `noindex` de previews. Las respuestas HTTP reales del dominio se verifican en la fase 6. | Script con routing-utils + `dist/`. |
| D7 | **Cabeceras y CSP aplicadas juntas:** el build base se sirve con un servidor local (`scratchpad`) que aplica las cabeceras de `vercel.json`, y el `<meta>` de Astro queda activo. Se registran las respuestas HTTP y cero violaciones CSP (`securitypolicyviolation`, desde la navegación inicial) recorriendo todas las rutas con hidratación de islas, video, textura, formulario (interceptado) e Insights, más una revisión visual de los diagramas y los nodos posicionados por `style`. Un iframe a una página del sitio no carga (`frame-ancestors`). Un link `javascript:` en un fixture de Sanity no se renderiza. | CDP + servidor local. |
| D8 | **Analítica:** sin `VERCEL_ENV=production` no se inyecta en ninguna página. Con `VERCEL_ENV=production` (y `LEGAL_FIXTURE=1`, build local no publicable) se inyecta en las 22 + 2N páginas con `PageRef` y **no** en la 404 ni en una ruta desconocida; la carga de `/_vercel/insights/*` se intercepta y se registra. Con el stub del consumidor (§2.7), el `beforeSend` recibe eventos sintéticos y devuelve URLs sin query ni fragmento. En la 404 no hay cola. Consola y CSP, sin violaciones, también en esta variante. El pageview real se verifica en la fase 6. | Builds variantes + CDP. |
| D9 | **Regresión:** A7, B4, B5, B8, B9, B10, B15 y C3, C5 y C8 de la fase 3. | Re-ejecución. |
| D10 | gpt-6.1-sol aprueba el spec y la implementación con la evidencia D1–D9, **cada una vinculada al manifiesto de su variante**, todas construidas desde el mismo commit y lockfile. D7 y D9 corren sobre el mismo artefacto base; `prod-bloqueada` registra entradas, diagnóstico y código de salida. La aprobación es local de la fase 4; las verificaciones HTTP, de dominio y de Web3Forms con restricción quedan como condición de la fase 6. | Veredicto con hash, manifiestos y snapshot. |

## 6. Decisiones y pendientes

- **E1. Formulario:** Web3Forms con la cuenta del dueño. *Alternativa:* una función serverless con Resend.
- **E2. Analítica:** Vercel Web Analytics, sin cookies.
- **E3. Host canónico:** `www.noctilabs.io`, con apex → www permanente en la fase 6.
- **E4. Redirects viejos a inglés.**
- **E5. Base legal:** consentimiento expreso con aviso completo.

**Pendientes del dueño** (en `docs/pendientes.md`, **bloquean el lanzamiento**, cada uno con responsable y evidencia de cierre):
- razón social, RUT y domicilio del responsable;
- revisión profesional del aviso y de la política, incluida la **inscripción de la base de contactos** ante la URCDP (art. 28): verificar si existe, actualizarla por los tratamientos nuevos o fundar la excepción;
- **conservación operativa**:
  - Web3Forms: si la cuenta permite deshabilitar el almacenamiento de envíos o borrarlos, quién lo hace y con qué frecuencia; su política declara hasta 3 años si no se borran;
  - el proveedor del correo (buzón de hola@noctilabs.io) y sus transferencias;
  - el procedimiento para responder pedidos de acceso, rectificación y supresión, con un plazo;
- plan y cuota de Web3Forms, quién monitorea los envíos, y la restricción de dominio (PRO) o la aceptación del riesgo.

## 7. Plan

1. **S1 con TDD:** origen `www` en `src/site.mjs` y rutas de privacidad. Se verifica con D1.
2. **Aviso, consentimiento y envío a Web3Forms** con honeypot, timeout y antiabuso. Se verifica con D2 y D3.
3. **Política de privacidad** con sus marcadores y el bloqueo de producción. Se verifica con D3.
4. **OG, JSON-LD, sitemap propio y robots.** Se verifica con D4 y D5.
5. **`vercel.json`** (redirects, cabeceras, `noindex` de previews) y **`security.csp`.** Se verifica con D6 y D7.
6. **Analítica.** Se verifica con D8.
7. **Evidencia con build identificado y gate.** Se verifica con D9 y D10.
