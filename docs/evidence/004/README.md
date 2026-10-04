# Evidencia del spec 004 — formulario, SEO, analítica y legales (fase 4)

**Commit de código verificado: `cbfa9bc`** (rama `fase4-formulario`). Las ocho variantes de build se construyeron desde ese
commit con el árbol limpio y el mismo `package-lock.json` (sha256 `1dd83d12…3763`) el **2026-10-04** (16:09–16:11 UTC), y
todos los criterios corrieron sobre esos artefactos (16:11–16:47 UTC). Este README y las salidas se commitean después,
sin tocar `src/`.

## Condiciones

- **Snapshot de Sanity** (`snapshot/sanity-snapshot.json`, sha256 `e1e59351…dc33`): la GROQ del loader con `_rev`,
  consultada el 2026-10-04T15:04:43Z (HTTP 200, 8 documentos). Se publica uno: `post-no-context-no-intelligence`, así que
  **N = 1** (lo que devuelve `getArticles()`, no los documentos crudos). `snapshot/sanity-consulta.txt` lista los 8.
- **Variantes** (`builds/<variante>.json` es el manifiesto: commit, árbol limpio, lockfile, variables, fixtures con hash y
  hora del snapshot, sha256 de `vercel.json`, sha256 de cada HTML/JS/CSS/`sitemap.xml` servido y del conjunto, versiones):

  | Variante | Entorno | Salida | Artefactos (sha256 del conjunto) | Para |
  |---|---|---|---|---|
  | **base** | snapshot, `PUBLIC_WEB3FORMS_KEY=clave-de-prueba-local` | 0, 25 HTML en `dist/` | `85452d83…` | D1–D7, D9 |
  | **prod-bloqueada** | `VERCEL_ENV=production`, snapshot, sin `LEGAL_FIXTURE` | **1** (`[legal]`) | — | D3 |
  | **prod-prueba** | `VERCEL_ENV=production`, `LEGAL_FIXTURE=1`, snapshot | 0, 25 HTML en `dist-fixture/` + `NO-PUBLICAR.txt` | `f33b5ca0…` | D8, consola y CSP de D7 |
  | **adversarial** | `snapshot/adversarial.json` (título con comillas y `</script>`, link `javascript:`) | 0, 25 HTML | `ef0051da…` | D4, D7 |
  | **publish-falla-marcadores** | `npm run build:publish` sin fixtures | **1** (`[legal]`) | — | §2.2 |
  | **publish-falla-legal-fixture** | `build:publish` + `LEGAL_FIXTURE=1` | **1** (`[publicación]`) | — | §2.2 |
  | **publish-falla-insights-fixture** | `build:publish` + `INSIGHTS_FIXTURE` | **1** (`[publicación]`) | — | §2.2 |
  | **publish-falla-sin-clave** | `build:publish` sin `PUBLIC_WEB3FORMS_KEY` | **1** (`[publicación]`) | — | §2.2 (desviación 3) |

- **Servidores locales:** `astro preview` (astro 7.3.5) de `dist/` en `localhost:4952`; `scripts/serve-vercel.mjs` aplica las
  rutas de `vercel.json` compiladas con `@vercel/routing-utils` 6.6.0 (normalización, redirects, cabeceras y 404) sobre
  `dist/` en `127.0.0.1:4953`, `dist-fixture/` en `:4954` y el adversarial en `:4956`; `:4955` es un origen ajeno con un
  iframe; `:4957` responde cabeceras y medio JSON y nunca termina (timeout del cuerpo).
- **Navegador:** Chrome 154.0.8037.97 headless por CDP (puertos 9383–9389). El driver (`scripts/cdp.mjs`) **pausa con
  `Fetch` todo pedido a `*web3forms.com*` y a `/_vercel/insights/*`** y además mapea esos hosts a `~NOTFOUND`: **ningún
  envío salió a Web3Forms** (D2: 21 pedidos pausados, todos respondidos por CDP o redirigidos a `127.0.0.1:4957`).
- **Scripts:** todos en `scripts/` (copias de los de la sesión). `final.sh` es la pasada completa; `builds.sh`, las variantes.
  `scripts/routing/*` necesitan `@vercel/routing-utils` 6.6.0 instalado fuera del repo (en la carpeta de la sesión), como
  pide §5 D6. La regresión de D9 usa además los scripts de la fase 2 de `…/scratchpad/ev002/`, reapuntados.

## Resultado por criterio

| # | Resultado | Detalle | Archivo |
|---|---|---|---|
| D1 | **OK** | Las 3 variantes que construyen: salida 0, `astro check` 0 errores / 0 warnings / 0 hints, **25 HTML = 22 + 2N + 1** con N = 1. Diagnósticos esperados, enumerados por variante: los **7** `[insights] excluido: …` del snapshot (6 «no está marcado para Insights» y 1 «cuerpo en es vacío»); ningún `bloque no admitido`. **0 diagnósticos inesperados** en las 8 variantes; las 5 que fallan lo hacen solo por su motivo. S1: Vitest **89/89** (rojo previo: 18 fallas, `s1-rojo.txt`). | `d1.txt`, `builds/`, `s1-rojo.txt` |
| D2 | **OK** (interceptado) · **envío real PENDIENTE** | 43/43. Payload exacto (15 campos: `access_key` de la variable de entorno, `subject` «Nuevo contacto desde la web (ES\|EN)», `from_name`, `botcheck: false`, los 6 campos recortados, `locale`, `page` = canónica aunque la página se cargue con query y fragmento, `consent: true`, `consent_version` `2026-10-04.1`, `consent_at` ISO del cliente); `Content-Type` y `Accept` JSON; **un** POST por envío; honeypot marcado → 0 pedidos y «enviado»; 2xx+`success:true` → enviado con foco en el título; `success:false`, sin `success`, `success:"true"`, JSON inválido, 400, 500, error de red, **timeout de cabeceras (15,17 s)** y **timeout del cuerpo (15,17 s)** → error con el mail, valores y consentimiento intactos; sin consentimiento → error en línea y foco en el checkbox; segundo envío antes de 30 s → «Esperá unos segundos…» y 0 pedidos (pasados los 30 s, sale); con la respuesta demorada, editar campos, desmarcar el consentimiento y reenviar no tienen efecto (fieldset deshabilitado) y tras el error vuelven a habilitarse con los valores intactos; tras «Enviar otro mensaje», vacío y habilitado. El envío real a la cuenta del dueño queda para su ok explícito (procedimiento abajo). | `d2.txt`, `capturas/d2-*` |
| D3 | **OK** (CDP) · build bloqueado **OK** | 55/55 en ES y EN. Aviso visible antes del botón con los 7 ítems de §2.2 (marcadores incluidos) y `aria-describedby="cf-notice"` (el árbol AX da el aviso como descripción del formulario); link a la política con `target="_blank"`, `rel="noopener"` y «(se abre en una pestaña nueva)» / «(opens in a new tab)»; checkbox con `<label>` propio, desmarcado, sin estado inválido antes de enviar; Tab: link → checkbox → botón, sin pasar por el honeypot, foco visible; Espacio marca y desmarca; contraste mínimo **4,5:1** sobre el blanco de la tarjeta (aviso, label, link, error); **zoom 200 % y reflow a 320 px** sin desbordes, recortes ni superposiciones en el formulario y en la política, y el formulario sigue operable (5 errores, foco en Nombre). Política: lang, title, H1, canonical y hreflang es/en/x-default con `www`, sin noindex, `.prose-article` sin índice, 8 secciones (cookies, analítica, encargados, fecha) y link en el footer de todas las páginas. **prod-bloqueada: salida 1** por los marcadores. | `d3.txt`, `capturas/d3-*`, `builds/prod-bloqueada.*` |
| D4 | **OK** | 55/55. Home, producto, industria, nosotros, insights, artículo, hablemos y privacidad en ES y EN: `og:title/description/url/type/image(+tamaño)/site_name/locale/locale:alternate` y `twitter:card`, absolutas con `https://www.noctilabs.io`; JSON-LD parseable con `@context` y `@type`: Organization + WebSite en el home, Article en el artículo con `headline` = H1, `datePublished` = `<time>`, `inLanguage` = lang, `url` y `mainEntityOfPage` = canonical, `image` = og:image; las demás sin JSON-LD. 404 sin canonical, `og:*` ni JSON-LD, con title, description y noindex. **Adversarial:** el JSON-LD lleva `</script>` y ningún `</script>` literal; en Chrome el H1, el title y el og:title muestran el título exacto, el JSON-LD parsea con el mismo `headline`, 0 scripts inyectados, 0 `alert()`. | `d4.txt` |
| D5 | **OK** | 14/14. 24 `<url>` = las 24 páginas indexables de `dist/` (22 + 2N), ninguna inexistente, sin la 404; 24/24 con `xhtml:link` es/en/x-default recíprocos, dentro del sitemap e iguales al hreflang de la página; slugs distintos bien emparejados (`/nosotros/` ↔ `/en/about/`…). `robots.txt` idéntico a §2.6. | `d5.txt` |
| D6 | **OK** (local) · HTTP real **PENDIENTE** (fase 6) | 134/134 con `@vercel/routing-utils` 6.6.0. Cada origen de §2.9 sin barra, con barra y `.html`, con y sin `?utm=x`: regla, destino existente en `dist/` y query conservada (la variante sin barra hace 308 de normalización y después el de migración). Las 7 bajas, sus 7 aliases `/blog-post-*` y `/blog/desconocido` (sin barra, con barra y `.html`, con y sin query) no matchean ningún redirect de migración: la variante sin barra recibe solo el 308 de `trailingSlash` y termina en 404 con el cuerpo de la 404; con barra y `.html`, 404 directo. Cabeceras de §2.8 en 200 y en 404, sin `default-src`; `X-Robots-Tag: noindex` solo en `*.vercel.app`. `check-redirects.mjs`: **17/17, salida 0** con el `vercel.json` real; **3 rotos, salida 1** con `vercel-roto.json`. | `d6-routing.txt`, `d6-check-redirects.txt`, `d6-manifest-*.json` |
| D7 | **OK** | 36/36 sobre la base servida con las cabeceras de `vercel.json` y el `<meta>` CSP. 26 URLs (las 24 páginas, una ruta desconocida que sirve la 404 y Hablemos con `?email=`): cabeceras de §2.8 en cada respuesta (también en el 404), **0 violaciones CSP** (`securitypolicyviolation` registrado desde la navegación inicial), 0 errores de consola y todos los `style=` aplicados. Video del hero (reproduce y pausa), antes/después e industrias accionados, 29 nodos del diagrama en posiciones distintas (captura revisada), formulario interceptado, Insights y artículo: 0 violaciones. **Iframe desde `127.0.0.1:4955`: bloqueado** (`frame-ancestors 'none'`, frame `chrome-error://`). Adversarial: el link `javascript:` no se renderiza (el texto queda sin `<a>`; el link https de control sí). Política emitida: `'unsafe-inline'` solo en `style-src-attr`; todos los `<script>` y `<style>` inline de las 25 páginas de la base y de prod-prueba tienen su hash. No hay islas ni textura en esta rama (fase 3 sin integrar). | `d7.txt`, `capturas/d7-*`, `csp-hashes.txt` |
| D8 | **OK** (local) · payload y panel **PENDIENTE** (fase 6) | 35/35. Base: 0 rastros del SDK en `dist/` y 0 pedidos a `/_vercel/insights` en 25 URLs. prod-prueba: las **24** páginas con PageRef cargan `/_vercel/insights/script.js` (interceptado y respondido con `stub-insights.js`, sha256 `e5e29cf3…`), la cola trae `beforeSend` y sus 5 eventos sintéticos (query, fragmento, email en la query) salen sin query ni fragmento; la 404, una ruta desconocida y una con un email en el path: 0 pedidos, sin `window.va` ni cola, noindex. **Referente:** desde `/hablemos/?email=persona@example.com`, `/en/contact/?email=…#x` y la 404 `/persona@example.com/datos/`, la página siguiente (con analítica) ve `document.referrer` = `http://127.0.0.1:4954/` (solo el origen) y la respuesta llevaba `Referrer-Policy: strict-origin`. Consola y CSP sin violaciones en prod-prueba. | `d8.txt`, `stub-insights.js` |
| D9 | **OK con observaciones** (A7, B4, B5, B8, B9, B10, B15) · **C3, C5, C8 PENDIENTE** | Los scripts de la fase 2 corrieron **sin cambios de lógica** (solo reapuntados al `dist/` de la rama, `localhost:4952` y el driver que intercepta Web3Forms) sobre la base, y los mismos sobre una **línea de base** construida desde `10847c1` (sin la fase 4, mismo snapshot) para separar regresiones de diferencias previas. **Sin diferencias:** A7 78/78, B5 60/60, B9 (1298 hrefs internos, 0 rotos), B10 (0 errores de consola en 24 rutas + 404 + inexistente, ×2 anchos), B15 teclado 50/50 (46 en la base: suma la política ES/EN), tapado y árbol AX; **B4** da 30 OK / 4 FALLA por idioma **igual que la línea de base** (el árbol AX parte las descripciones por los `translate="no"`, nota de la evidencia 002) y b4-desc 4/4. **Diferencias, todas del contrato de la fase 4:** B15 reflow (2) y zoom (12) fallan solo en `/hablemos/` y `/en/contact/`, porque el honeypot está fuera de pantalla por diseño (§2.3; `scrollWidth` igual al ancho) y porque el instrumento espera 4 errores y el consentimiento obligatorio suma un quinto (`d9-clasificacion.txt`: 14/14 explicadas, 0 otras); D3 verifica esas dos páginas a 200 % y 320 px con el honeypot aparte y el formulario operable. **B8** sin cambios: 13 FALLAs (borde de los checkboxes nuevos, quinto error y el botón bajo el pliegue a 900 px por el aviso); `b8-v2-consentimiento.mjs` (4 cambios mínimos, Δ1–Δ4 en el encabezado del script) da **24/24**. C3, C5 y C8 son de la fase 3, que no está integrada en esta rama. | `d9-comparacion.txt`, `d9-clasificacion.txt`, `d9/rama/`, `d9/base/` | `d9-*.txt`, `d9/` |
| D10 | **PENDIENTE** | El gate de gpt-6.1-sol sobre el spec y esta implementación no corre en esta tarea. Insumos listos: commit `cbfa9bc`, manifiestos de las 8 variantes (mismo commit y lockfile), snapshot con hash y salidas D1–D9. | — |

## Chequeo del artefacto de `build:publish` (§2.2)

Con los marcadores presentes, todo build con `PUBLISH=1` falla antes, en `src/content/legal.ts`, así que el chequeo del
artefacto de `scripts/publish-guard.mjs` (`artifactProblems`) se ejercitó directamente: en `dist-fixture/` detecta
`NO-PUBLICAR.txt` y «DATOS DE PRUEBA» (5 problemas, sin marcadores); en `dist/`, solo los marcadores (12, en las 4 páginas
del formulario y la política). `publish-scan.txt`.

## D2 — envío real de prueba (PENDIENTE: requiere el ok explícito del dueño en el momento)

1. El dueño confirma en el chat que autoriza **un** envío real a su cuenta de Web3Forms y que la cuota lo permite.
2. Build local con la clave real, que el dueño carga en su propia terminal (no pasa por el agente):
   `PUBLIC_WEB3FORMS_KEY=<clave> INSIGHTS_FIXTURE=<snapshot> npm run build && npx astro preview --port 4952`.
3. En `http://localhost:4952/hablemos/`: nombre «Prueba fase 4», email del dueño, empresa «NoctiLabs», mensaje
   «Envío de prueba de la fase 4 — ignorar», consentimiento marcado, Enviar. Si la cuenta tiene restricción de dominio,
   este paso se hace en la fase 6 desde `https://www.noctilabs.io` (pendientes #12).
4. Se registra: estado «enviado» en pantalla y el mail recibido con `consent`, `consent_version` (`2026-10-04.1`),
   `consent_at`, `locale` y `page` (`https://www.noctilabs.io/hablemos/`). Se borra el envío de Web3Forms si la cuenta
   lo permite (pendientes #11).

## Desviaciones e interpretaciones

1. **Consentimiento con `aria-required`, no `required`.** Con `required` nativo (y `novalidate`), Chrome expone el checkbox
   como inválido antes de cualquier envío. La obligatoriedad la impone el script con `.checked`. Chrome no expone
   «required» en el árbol AX de un checkbox con ninguna de las dos formas; queda registrado en D3.
2. **El label envuelve al checkbox** (guidelines, Forms: un solo blanco de click).
3. **`PUBLISH=1` exige `PUBLIC_WEB3FORMS_KEY`.** El spec no lo dice; sin la clave el formulario publicado fallaría siempre.
4. **`build:publish` es `node scripts/build-publish.mjs`**, que define `PUBLISH=1` de forma portable (npm en Windows usa
   cmd) y termina con `scripts/check-redirects.mjs`.
5. **Snapshot efectivo:** la consulta del loader trae `_rev` y el loader escribe `.astro/insights-snapshot.json` (origen,
   hora, sha256, `_id`/`_rev`), que `check-redirects.mjs` copia a `dist-manifest.json`.
6. **CSP:** `script-src`/`style-src` quedan en `'self'` por defecto de Astro (declararlo explícito producía un aviso del
   build); `markdown.syntaxHighlight: false` (sin Markdown, sin el aviso de Shiki); `vite.build.assetsInlineLimit` no
   incrusta fuentes, porque Vite metía como `data:` los subconjuntos chicos de @fontsource y `font-src 'self'` los bloqueaba
   (lo detectó D7). El script `is:inline` del hero pasó a procesado para quedar cubierto por su hash.
7. **Redirects sin `.html` para `/services` y `/es`:** la web vieja nunca sirvió `/services.html` ni `/es.html` (eran
   redirects); D6 los registra como 404.
8. **La regla `^/company$` (y las otras sin barra) es inalcanzable** porque la normalización de `trailingSlash` va antes
   (§2.9 lo prevé); se declaran igual.
9. **Query en redirects:** las rutas compiladas por routing-utils no codifican la query; el simulador de D6 y
   `serve-vercel.mjs` la reenvían como hace la plataforma. La respuesta real se verifica en la fase 6.
10. **D7 sin islas ni textura:** la fase 3 no está integrada en esta rama; D7 cubre el video, los diagramas y los nodos
    posicionados por `style`. C3, C5 y C8 (D9) quedan pendientes por lo mismo.
11. **Privacidad:** borrador mío pendiente de revisión profesional; agrega «inclusión» entre los derechos (art. 15) y el
    retiro del consentimiento, y no muestra un aviso de borrador en la página (el bloqueo es por los marcadores).
12. **Imágenes OG y logo** generadas con `og/generar.mjs` desde plantillas HTML locales (Inter auto-hospedada).

## Lo que queda para la fase 6 (también en `docs/pendientes.md`, #9–#16)

Envío real (D2), respuestas HTTP reales del dominio, apex → www 308, `VERCEL_ENV` expuesto, cabeceras en la 404 real,
`X-Robots-Tag` en previews, Analytics activado con un pageview real sin query ni fragmento y el payload real de
recolección (D8), restricción de dominio de Web3Forms, y los datos legales y la revisión profesional que hoy bloquean el
build publicable.


## Gate de implementación, pasada 1: GATE SÍ (merge `3576ba9`, arreglos en `dde181a`)

La pasada 1 (`docs/reviews/004-impl-sol-pasada-1.md`) dio **GATE SÍ**, con 2 importantes y 1 menor, sobre `main` con la fase 4 mergeada. Las verificaciones corrieron sobre ese `main`, que además incluye los cierres del gate 002. La evidencia nueva está en `gate-p1/`.

| # | Hallazgo | Arreglo | Verificación | Resultado |
|---|---|---|---|---|
| 1 | El JSON-LD no tenía hash en la CSP, y D7 lo excluía (`!data`) | `Base.astro` serializa cada bloque una vez, registra su hash con `Astro.csp.insertScriptHash()` y renderiza ese mismo texto. Se quitó la exclusión del verificador. | `csp-hashes.mjs` sobre el `dist/` de `main`: 41 scripts y estilos inline, **0 sin hash, JSON-LD incluido**. `unsafe-inline` solo en `style-src-attr`. El hash de Organization (`sha256-Fo4B6jt…`) está en la CSP del home. | OK (`gate-p1/csp-hashes.txt`) |
| 2 | La clasificación de B15 daba por hecha la explicación, y el `<style>` inyectado por el instrumento generaba errores CSP | B15 v3 deja de clasificar a posteriori. Del desborde excluye **solo** el honeypot y cuenta cuántas entradas excluyó. En cada paso exige los 5 ids de error (`cf-name`, `cf-email`, `cf-organization`, `cf-message`, `cf-consent`) y el foco en `cf-name`. Para las capturas usa el atributo `style` del header (permitido por `style-src-attr`) en vez de un `<style>` inyectado, e informa los errores CSP de consola. | Reflow a 320: **37/37**. Las rutas suman la política ES/EN, y en Hablemos/Contact se excluyen 2 entradas del honeypot. Zoom 100–400 %: **150/150**. En los 12 casos del formulario hay 5 errores en ese orden y foco en Nombre. **0 errores CSP** en las dos corridas. | OK (`gate-p1/b15-reflow-v3.txt`, `gate-p1/b15-zoom-v3.txt`) |
| 3 | El conteo «27 fallas nuevas» incluía la línea de resumen «12 FALLAS» | `d9-comparar.mjs` cuenta solo las filas que empiezan con `FALLA`. | `d9-comparacion.txt` regenerado: **26** fallas nuevas (B8 12, B15 reflow 2, B15 zoom 12). Las de B15 quedan resueltas en v3 (fila 2), y las de B8 están cubiertas por `b8-v2-consentimiento` (24/24). | OK |

Con esto, D9 deja de ser «OK con observaciones» y la fila 2 lo reemplaza. D10 queda cumplido con esta pasada. Siguen pendientes para la fase 6 el envío real de D2, las respuestas HTTP de D6 y el payload y el panel de D8. C3, C5 y C8 corresponden a la fase 3.
