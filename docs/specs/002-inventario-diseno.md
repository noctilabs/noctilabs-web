# Inventario de diseño — NoctiLabs Web v3 (fase 2: páginas)

Fuente: `C:\Users\adria\OneDrive\Escritorio\NoctiLabs Web - deploy\NoctiLabs Web v3.dc.html` (810 líneas; plantilla L1–511, script L512–807).
Embebido: `Nocti App v2.dc.html` (648 líneas; plantilla L1–416, script L417–646).
Fuera de alcance (ya implementado): header L22–69 y footer L498–508. Sí se inventaría la banda «Hablemos.» (L488–496), que vive entre las páginas y el footer.

Convenciones de este documento:
- «L123» = línea de `NoctiLabs Web v3.dc.html`; «App L123» = línea de `Nocti App v2.dc.html`.
- `g('pagina','ancla')` = `() => this.go(pagina, ancla)`. `go()` hace `setState({page, menu:null, mnav:false})` y a los 30 ms hace scroll: si hay ancla y existe `#ancla` dentro del root, `scrollTo({top: rect.top + scrollY − 84, behavior:'smooth'})`; si no, `scrollTo({top:0, behavior:'auto'})`.
- Los nombres de handlers/valores son los de `renderVals()` (L742–805).

---

## 0. Fundamentos globales (fuera del header/footer, pero condicionan todas las páginas)

### 0.1 Tipografía, color base, tokens
- `<helmet>` L10–17: Google Fonts Geist Mono 400/500 (`https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&display=swap`).
- `body` (L14): `margin:0; background:#F4F4F2; color:#0B0B0C; font-family:'Neue Haas Unica Pro','Neue Haas Unica','Helvetica Neue',Helvetica,Arial,sans-serif; -webkit-font-smoothing:antialiased; text-wrap:pretty`.
- Links (L15): `a{color:#0038CC} a:hover{color:#0B0B0C}`.
- Mono stack (usado en todos los kickers/labels): `'Geist Mono',ui-monospace,monospace`.
- Root (L19): `position:relative; isolation:isolate; max-width:{{frameW}}; margin:0 auto; background-color:#F4F4F2; color:#0B0B0C; font-size:16px; line-height:1.55; min-height:100vh; box-shadow:{{frameShadow}}` + `background-image/size/attachment` de la textura (ver 0.3).
- Variables CSS en el root (inline L19, y reescritas por `applyVars()` L727–733 en cada mount/update):

| var | desktop | mobile (`isMobile()`) |
|---|---|---|
| `--edge` | `clamp(16.4px,3.3vw,45.9px)` | `16px` |
| `--display` | `clamp(42.6px,5.9vw,95.1px)` | `46px` |
| `--h2` | `clamp(27.9px,3.4vw,52.5px)` | `32px` |

- `isMobile()` (L726) = `props.device === 'Mobile' || state.w < 1000`, donde `w` es el ancho del root medido por `ResizeObserver` (`rootRef`, L687–692; sólo actualiza si cambia > 4 px). Valor inicial `w: 1200`.
- Prop `device` (`Desktop`/`Mobile`, editor): con `Mobile` → `outerBg:'#DCDCD7'`, `frameW:'390px'`, `frameShadow:'0 0 0 1px #C9C9C4'` (marco de teléfono de preview); con `Desktop` → `#F4F4F2`, `none`, `none`. Wrapper exterior L18: `background:{{outerBg}}; min-height:100vh`. En producción el marco no aplica (es herramienta de preview); el corte real es `w < 1000`.
- **Dónde cambia algo con mobile dentro de las páginas**: sólo vía las tres variables CSS de arriba. Ninguna sección de página tiene `sc-if mobile/desktop` propio; el resto de la adaptación es por `flex-wrap`, `auto-fit/auto-fill` y `clamp()`. (`ovCols`/`ovArrow` L781 sí distinguen mobile pero no se usan en la plantilla.)

### 0.2 Patrones repetidos (valores exactos; se referencian por nombre más abajo)
- **CONT** (contenedor de sección): `max-width:1200px; width:100%; margin:<top> auto 0; padding:0 var(--edge)`.
- **GAP-L** (margen superior entre secciones grandes, Home): `clamp(32.8px,4.9vw,72.2px)`.
- **GAP-P** (margen superior entre secciones, Producto/Industria/Nosotros): `clamp(45.9px,5.7vw,85.3px)`.
- **HERO-PAD** (padding-top de héroes de páginas internas): `clamp(39.4px,5.7vw,85.3px)`.
- **CARD-BIG** (panel blanco grande): `background:#FFFFFF; border:1px solid #E2E2DE; border-radius:clamp(19.7px,2.5vw,29.5px); padding:clamp(32.8px,4.9vw,72.2px) clamp(13.1px,2.9vw,45.9px) clamp(13.1px,2.9vw,45.9px)` (variante Producto: primer valor `clamp(32.8px,4.9vw,65.6px)`).
- **DARK-BIG** (panel negro grande): `background:#0A0A0B; color:#F4F4F2; border-radius:clamp(19.7px,2.5vw,29.5px); padding:clamp(32.8px,4.9vw,65.6px) clamp(16.4px,3.3vw,52.5px)`.
- **KICKER**: mono, `font-size:12px; letter-spacing:.04em; text-transform:uppercase; color:#6B6B68` (variantes 13px en héroes; 11px en sub-labels; `#7A7A80` sobre negro; `#9FBEFF` sobre negro destacado; `#0038CC` en artículos).
- **H1-INT** (h1 de páginas internas): `margin:0; font-size:var(--display); font-weight:500; line-height:.96; letter-spacing:-.05em`.
- **H2**: `margin:0; font-size:var(--h2); font-weight:500; line-height:1.02; letter-spacing:-.045em`.
- **LEAD**: `font-size:16px; color:#6B6B68` (en héroes: `17px; line-height:1.5; max-width:40ch`).
- **HEAD-ROW** (fila título + bajada): `display:flex; flex-wrap:wrap; gap:20px 64px; align-items:flex-end`; título `flex:2 1 520px`, párrafo `flex:1 1 320px`.
- **SEG** (control segmentado / tabs pill): contenedor `display:flex; gap:4px; padding:4px; border-radius:999px; background:#ECECE8` (o `#E6E6E2`), con `max-width:100%; overflow-x:auto; overflow-y:hidden; scrollbar-width:none` cuando puede desbordar. Botón: `padding:10px 20px` (o `10px 18px`); `border-radius:999px; white-space:nowrap; mono 13px; flex:none`. Estado por helper `tab(on)` (L654): activo `bg #FFFFFF, fg #0B0B0C, box-shadow 0 1px 2px rgba(11,11,12,.08)`; inactivo `bg transparent, fg #6B6B68, shadow none`.
- **BTN-DARK**: `padding:16px 26px; border-radius:999px; background:#0B0B0C; color:#FFFFFF; font-size:15px; font-weight:500; white-space:nowrap`; hover `background:#2A2A2C`.
- **BTN-WHITE**: igual con `background:#FFFFFF; color:#0B0B0C`; hover `#EDEDEA`.
- **APP-FRAME** (marco gris de los embeds de Producto): `background:#E9E9E5; border-radius:clamp(19.7px,2.5vw,29.5px); padding:clamp(8.2px,1.3vw,18px)`.
- **CAPTION**: mono `12px; letter-spacing:.03em; color:#6B6B68; padding-left:8px`.
- **HOVER-CARD** (capacidades / pasos): `transition: background .3s, color .3s, (border-color .3s,) transform .3s cubic-bezier(.4,0,.2,1)`; en hover `translateY(-4px)` y se expande una línea de ejemplo con `grid-template-rows: 0fr → 1fr` (`.35s cubic-bezier(.4,0,.2,1)`) + `opacity 0 → 1` (`.3s`); la línea: `padding-top:10px; border-top:1px solid {{exBd}}`; mono `12px; line-height:1.45; color:#D9D9DC`; viñeta `6×6px` círculo `#3D7BFF` con `translateY(-1px)`.

### 0.3 Textura de fondo y canvas animado (todas las páginas)
- `TEXTURES` (L638–647) elegida por prop `texture` (default `'Tramado animado'`). Valores aplicados al root: `texImg`, `texSize`, `texAttach`. Opciones: `Ninguna`, `Tramado animado` (anim), `Tramado fino`, `Grano`, `Puntos`, `Constelación`, `Grilla`, `Puntos + grano` (detalle en §Datos).
- Si `animTex` (sólo «Tramado animado»), L20 inserta `<div style="position:fixed;inset:0;z-index:-1;pointer-events:none">` con un `<canvas>` (`texCanvas`, ref `texRef` L659–686). Queda detrás del contenido y por encima del `background-color` del root (gracias a `isolation:isolate`).
- **Qué dibuja**: trama de semitono con dithering ordenado (matriz Bayer 4×4 `[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5]` normalizada `(v+.5)/16`). Celdas cada `texSpacing` px; en cada celda calcula un ruido de ondas
  `n = sin(u·5.1 + T·1.3)·cos(v·4.3 − T) + sin((u+v)·3.7 + T·.7)·.6 + sin(u·11 − v·9 + T·1.9)·.25`, normaliza `(n+1.85)/3.7`, eleva `^2.6` y multiplica por `texCoverage`; si supera el umbral Bayer dibuja un cuadrado `texDot`×`texDot` (o círculo si `texRound`). `u = x/w/texWave + drift`, `v = y/H/texWave + drift·.35`, `drift = texDrift·T·.25`, `T = texT·.00011`, `texT += 60·texSpeed` por frame. Color `rgba(texColor, texIntensity)`.
- Parámetros (props con editor, defaults de `data-props`): `texDot 2.1px` (0.4–6), `texSpacing 8px` (2–16), `texCoverage .85` (.1–1), `texIntensity .15` (.02–1), `texSpeed 1.7×` (0–8), `texWave .3×` (.3–4), `texDrift −2.8` (−4–4), `texColor #0B0B0C` (opciones `#0B0B0C/#0047FF/#3D7BFF/#6B6B68`), `texRound false`. (Fallbacks en código si faltan props: spacing 5, dot 1.15, speed 1, coverage .55, intensity .16, wave 1, drift 0.)
- Throttle: dibuja como máximo cada 60 ms (~16 fps); `devicePixelRatio` tope 2; redimensiona el canvas al tamaño CSS.
- **prefers-reduced-motion**: sí lo respeta: con `reduce` dibuja un único frame estático (no reprograma `requestAnimationFrame`).

### 0.4 Esfera (código muerto)
- `makeSphere()` L648–653 (1100 puntos en espiral de Fibonacci + 520 puntos de halo aleatorios) y `canvasRef` L693–722 (rotación `t·.00006` rad, inclinación .32, gradiente radial azul `rgba(28,52,140,.42)→rgba(16,28,72,.22)→transparente`, puntos `#5B8CFF`/`#9FBEFF`/`#F4F4F2` con alfa por profundidad, halo `#C9CCD6`; respeta reduced-motion con ángulo fijo .6 y un solo frame). Se expone como `sphere` en `renderVals` (L758) **pero no se usa en ninguna parte de la plantilla**. El hero de Home usa video.

---

## 1. Página HOME (`p.home`, L72–197; estado inicial `page:'home'`)

`<main data-screen-label="Home">` L73: `display:flex; flex-direction:column; padding:0 0 24px`.

### 1.1 Hero con video (L74–89)
- **Propósito**: primera impresión a pantalla completa con claim y dos CTAs.
- **Layout**: `<section>` `position:relative; margin-top:-76px` (se mete debajo del header sticky de 76 px); `height:max(680px,100vh); overflow:hidden; background:#2A2A2C; color:#FFFFFF`.
  - Capa video `position:absolute; inset:0`.
  - Overlay `position:absolute; inset:0; pointer-events:none; background:linear-gradient(#00000026 0%, #0000001a 13.1179% 60%, #0000004d 100%)`.
  - Bloque inferior `position:absolute; left:0; right:0; bottom:0; pointer-events:none`; interior `padding:0 clamp(20px,4vw,72px) clamp(32.8px,4.9vw,72.2px); display:flex; flex-wrap:wrap; gap:32px 64px; align-items:flex-end; justify-content:space-between`.
  - h1 `flex:0 1 auto; max-width:11ch`. Columna derecha `flex:0 1 440px; margin-left:auto; display:flex; flex-direction:column; gap:22px; pointer-events:auto`. Botonera `display:flex; flex-wrap:wrap; gap:12px`.
  - Mobile: sin cambios propios salvo `--display` = 46px; el `flex-wrap` apila h1 y columna.
- **Tipografía/colores**:
  - h1: `font-size:var(--display); font-weight:400` (ojo: 400, no 500 como el resto de h1); `line-height:1; letter-spacing:-.045em`; blanco.
  - p: `font-size:clamp(14.8px,1.3vw,18.9px); line-height:1.35; letter-spacing:-.01em`.
  - Botón 1: `padding:17px 30px; border-radius:999px; background:#FFFFFF; color:#0B0B0C; font-size:16px; font-weight:500`; hover `#EDEDEA`.
  - Botón 2: mismo tamaño, `box-shadow:inset 0 0 0 1px rgba(255,255,255,.7); color:#FFFFFF`; hover `background:rgba(255,255,255,.12)`.
- **Copy**:
  - H1: «El cerebro operativo de tu empresa.»
  - P: «Un contexto compartido para que personas e IA entiendan tu negocio, decidan mejor y actúen.»
  - Botones: «Hablemos» · «Ver el producto»
- **Links**: «Hablemos» → `goHablemos` = `g('hablemos')`; «Ver el producto» → `goProducto` = `g('producto')` (sin ancla, scroll a 0).
- **Assets**: `<video autoPlay muted loop playsInline preload="auto" poster="assets/hero-poster.jpg" aria-hidden="true">` con `<source src="assets/hero.webm" type="video/webm">` y `<source src="assets/hero.mp4" type="video/mp4">`; `object-fit:cover; width/height:100%`. Pesos en disco: hero.webm 7,45 MB, hero.mp4 10,2 MB, hero-poster.jpg 178 KB.
- **Reduced motion**: el video NO respeta `prefers-reduced-motion` (autoplay + loop incondicional).
- Nota header: el header calcula un modo «overlay» transparente (`ov` L752: home + `top` (scrollY<40) + sin menús) pero la plantilla del header ya implementado no usa esos valores (`hdrBg`, `hdrFg`, etc.).

### 1.2 «Antes y después» — diagramas Sin/Con Nocti (L92–123)
- **Propósito**: mostrar en tres diagramas animados cómo opera una empresa sin vs. con Nocti.
- **Layout**: CONT con `margin-top: GAP-L`. Dentro, CARD-BIG con `display:flex; flex-direction:column; align-items:center; gap:28px`.
  1. **Pill «Comparar / Opción 1 / Opción 2»** (L94): `display:flex; align-items:center; gap:10px; padding:4px 4px 4px 14px; border-radius:999px; border:1px dashed #A9C4FF; background:#F7F9FF`. Label «Comparar» mono 11px, `letter-spacing:.04em; uppercase; color:#0038CC`. SEG interno `gap:4px; padding:3px; background:#ECECE8`; botones `padding:7px 14px`, mono 12px, estilo `tab()`.
  2. Kicker «Antes y después»: mono 12px, `.04em`, uppercase, `#6B6B68`.
  3. h2 `{{morphTitle}}`: H2 + `text-align:center; white-space:nowrap; font-size:min(var(--h2),5.4vw)` (la segunda declaración pisa a la primera: tamaño efectivo `min(var(--h2), 5.4vw)`).
  4. SEG Sin/Con (L97–100): fondo `#ECECE8`, `gap:4px; padding:4px`; botones `padding:10px 20px`, mono 13px.
  5. Grilla de diagramas (L101): `width:100%; display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr)); gap:16px; margin-top:8px`. Cada ítem `flex column; gap:18px`:
     - Lienzo: `position:relative; aspect-ratio:1/1; border-radius:24px; overflow:hidden; background:#F4F4F2`; contiene el SVG de líneas `{{d.lines}}` y los nodos absolutos.
     - Nodo (L107): `position:absolute; left:{x}%; top:{y}%; width/height; transform; opacity; background; color; border; padding; border-radius; font-size; font-family; letter-spacing; font-weight:500; line-height:1.2; white-space:nowrap; text-align:center; display:flex; align-items:{ai}; justify-content:center; transition: left .9s cubic-bezier(.7,0,.2,1), top .9s (ídem), transform .9s (ídem), opacity .6s, background .6s, color .6s`.
     - Pie: `flex column; gap:6px; padding:0 6px 4px; min-height:120px`: kicker mono 12px `.04em` uppercase color `{{d.kc}}` (`#0038CC` con / `#6B6B68` sin); título `26px/500/-.04em/1.05`; texto `16px #6B6B68`.
  6. Cierre (L118–121, sólo si `showClose2` = opción 2): `width:100%; border-top:1px solid #E2E2DE; margin-top:8px; padding-top:clamp(24px,3vw,40px); flex column; gap:10px; opacity:{{closeOp}}; transform:{{closeTf}}; transition: opacity .6s, transform .6s`.
     - Línea 1: `font-size:clamp(26px,3.2vw,44px); font-weight:500; letter-spacing:-.045em; line-height:1.05`.
     - Línea 2: `font-size:clamp(20px,2.2vw,30px); font-weight:500; letter-spacing:-.035em; line-height:1.2; color:#6B6B68; max-width:36ch`.
- **Copy**:
  - «Comparar» · «Opción 1» · «Opción 2»
  - «Antes y después»
  - Título: con=false «Cómo operan hoy las empresas.» / con=true «Cómo pueden operar.»
  - Botones: «Sin Nocti» · «Con Nocti»
  - Diagramas (ver §Datos `diagrams(con)` / `diagramsOld(con)`): títulos Fragmentado/Conectado, Genérico/Contextualizado, Aislado/Coordinado, con sus textos; kicker «Sin Nocti»/«Con Nocti».
  - Cierre: «Tus sistemas siguen siendo tus sistemas.» / «Nocti los conecta, los contextualiza y los vuelve utilizables por personas e IA.»
- **Interactividad**:
  - Estado `con` (bool, inicial `false`). `componentDidMount` (L723) arranca `setInterval(3600 ms)` que hace `con = !con` **sólo si** `page === 'home'` y `!this.paused`.
  - `setSin` / `setCon` (L773): fijan `this.paused = true` (detiene la alternancia automática para siempre hasta remontar) y setean `con`.
  - Estilos de los botones: `sinBg/sinFg/sinSh = tab(!con)`, `conBg/conFg/conSh = tab(con)`.
  - Estado `opt` (1|2, inicial **2**). `optTabs` → `setState({opt:n})`. `opt===1` usa `diagramsOld(con)` (nodos que se reacomodan de desordenados/rotados a ordenados; cierre oculto); `opt===2` usa `diagrams(con)` (posiciones fijas; sólo aparecen/desaparecen la capa Nocti, chips, tags y líneas; cierre visible).
  - `closeOp = con && opt !== 1 ? 1 : 0`; `closeTf = con ? 'none' : 'translateY(8px)'`.
  - Líneas SVG: opacidad con `transition: opacity .5s` y delay escalonado al aparecer (`.35s + i·.05s` en opción 2; `.55s` en opción 1), sin delay al desaparecer.
- **SVG inline**: `links()` / `oldLines()` generan `<svg viewBox="0 0 100 100" preserveAspectRatio="none">` absoluto a pantalla completa del lienzo; líneas `stroke:#3D7BFF`, `strokeWidth 1.4` (op. 2) / `1.5` (op. 1), `vector-effect:non-scaling-stroke`; en op. 2, extremos con círculos `r=.9 fill #0047FF`.
- **Reduced motion**: no se respeta (intervalo y transiciones siempre activos).

### 1.3 «Toda la empresa puede preguntar» — demo por rol con Nocti App (L125–137)
- **Propósito**: mostrar que el mismo cerebro responde distinto según el rol, con un chat animado embebido.
- **Layout**: CONT `margin-top:GAP-L; display:flex; flex-direction:column; gap:28px`.
  - HEAD-ROW (L126): h2 `flex:2 1 520px` (H2); p `flex:1 1 320px` (LEAD).
  - SEG de roles (L130): `background:#E6E6E2; align-self:center; max-width:100%; overflow-x:auto; overflow-y:hidden; scrollbar-width:none`; botones `flex:none; padding:10px 20px; mono 13px`, `tab()`.
  - Embed (L135): `<div style="position:relative;width:100%">` + `dc-import` (sin APP-FRAME; el embed trae su propio borde).
  - Nota al pie (L136): `display:flex; gap:10px; align-items:center; mono 13px; letter-spacing:.02em; color:#3A3A38`; punto `8×8px; border-radius:50%; background:#0047FF; flex:none`.
- **Copy**:
  - H2: «Toda la empresa puede preguntar. Cada uno ve lo que le corresponde.»
  - P: «La experiencia cambia por rol, manteniendo el mismo cerebro organizacional y los permisos correspondientes.»
  - Tabs (`ROLE_TABS`): «CEO» · «Comercial» · «Operaciones» · «Agentes»
  - Nota: «Cada persona y cada agente ven únicamente lo que sus permisos permiten.»
- **Embed**: `<dc-import name="Nocti App v2" on-new-agent="{{goHablemos}}" view="cerebro" role="{{role}}" hide-role-chips="{{true}}" perms-side="{{true}}" on-chat-done="{{nextRole}}" hint-size="100%,560px">`.
- **Interactividad**:
  - Estado `role` (inicial `'ceo'`); `roleTabs` → `setState({role:k})`.
  - `nextRole` (L776, memoizado): avanza al siguiente rol en ciclo ceo → comercial → operaciones → agentes → ceo. Lo llama la App al terminar cada animación de chat (`onChatDone`), así que la demo rota sola de rol en rol (≈ 11–12 s por rol: tipeo + pensamiento + respuesta + 5,2 s de lectura).
  - Al cambiar `role` la App resetea `convo` y relanza el chat (ver §4).
  - `perms-side` hace que la App dibuje el panel «Permisos de este rol / Contexto consultado» por fuera del marco a la derecha si hay lugar (o debajo, a la derecha, en 240 px / 100%), ver §4.
  - Dentro del embed el usuario puede navegar por la barra lateral a cualquier vista y abrir conversaciones fijadas/recientes.
- **Dependencia**: depende totalmente de `Nocti App v2`.

### 1.4 Capacidades (L139–155)
- **Propósito**: cuatro verbos de lo que se hace dentro de Nocti + CTA a agentes.
- **Layout**: CONT `margin-top:GAP-L; flex column; gap:28px`. Cabecera `flex column; gap:14px` (KICKER + H2). Grilla `display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr)); gap:12px`. Tarjeta (L146): `cursor:default; border:1px solid {{c.bd}}; border-radius:24px; padding:22px; min-height:213px; flex column; gap:12px` + HOVER-CARD.
  - Número: mono 13px color `{{c.nc}}` (transition color .3s).
  - Título: `margin-top:auto; 30px/500; letter-spacing:-.045em; line-height:1`.
  - Descripción: `16px; color:{{c.dc}}; max-width:28ch`.
  - Ejemplo desplegable (patrón HOVER-CARD).
  - CTA ancho (L154): `display:flex; justify-content:space-between; align-items:center; gap:16px; padding:22px 28px; border-radius:999px; background:#E6E6E2; font-size:16px; font-weight:500`; hover `#DCDCD7`; flecha `flex:none`.
- **Colores por estado** (`hc === i`): reposo `bg #FFFFFF / fg #0B0B0C / bd #E2E2DE / nc #6B6B68 / dc #6B6B68`; hover `bg #0A0A0B / fg #F4F4F2 / bd #0A0A0B / nc #9FBEFF / dc #A7A7AC / translateY(-4px)`; `exBd` `#2A2A2E` (hover) / transparent; `exFg #D9D9DC`.
- **Copy** (KICKER «Capacidades»; H2 «Qué podés hacer dentro de Nocti.»; tarjetas desde `capabilities` L777):
  - 01 · «Preguntar» · «Consultá cualquier aspecto de tu empresa.» · ej.: «“¿Qué clientes compran menos que hace tres meses?”»
  - 02 · «Analizar» · «Entendé qué está pasando y por qué.» · ej.: «Del KPI a la transacción que lo explica.»
  - 03 · «Actuar» · «Convertí una respuesta en una acción.» · ej.: «Preparar un seguimiento, una orden o un recordatorio.»
  - 04 · «Controlar» · «Supervisá agentes, tareas, excepciones y trazabilidad.» · ej.: «Cada acción queda registrada, con permisos y aprobaciones.»
  - CTA: «Creá tus propios agentes, integrá los que ya tenés o construílos con NoctiLabs.» + «→»
- **Interactividad**: `onMouseEnter` → `setState({hc:i})`; `onMouseLeave` → limpia sólo si `hc === i`. Sólo hover (no hay equivalente táctil/teclado: en mobile el ejemplo nunca se ve salvo por tap-hover emulado).
- **Link**: CTA → `goAgentes` = `g('producto','agentes')` (Producto, scroll suave a `#agentes`).

### 1.5 «Construimos Nocti alrededor de tu empresa» — cuatro pasos (L157–174)
- **Propósito**: explicar el modelo servicio + plataforma en cuatro etapas.
- **Layout**: CONT `margin-top:GAP-L`; CARD-BIG `flex column; gap:36px`. HEAD-ROW (h2 + p). Grilla `repeat(auto-fit,minmax(min(100%,240px),1fr)); gap:12px`. Tarjeta (L165): `cursor:default; border-radius:24px; padding:24px; min-height:250px; flex column; gap:12px` + HOVER-CARD (sin borde).
  - Meta: mono 13px color `{{s.nc}}`, formato «{n} · {who}».
  - Título: `margin-top:auto; 26px/500; -.04em; line-height:1.05`.
  - Descripción: `15px; opacity:.75`.
- **Colores**: `dark = (hs === i) || (i === 3 && hs == null)` → la tarjeta 04 está en negro por defecto; al hacer hover sobre otra, esa pasa a negro y la 04 vuelve a claro. Oscura: `bg #0A0A0B / fg #F4F4F2`; clara: `bg #F4F4F2 / fg #0B0B0C`. `nc`: hover `#9FBEFF`; oscura sin hover `#A7A7AC`; clara `#6B6B68`. `exBd #2A2A2E`, `exFg #D9D9DC` (siempre; el ejemplo sólo se despliega en hover, nunca en la 04 por defecto).
- **Copy** (H2 «Construimos Nocti alrededor de tu empresa.»; P «Servicio + plataforma. El equipo de NoctiLabs implementa y tu organización sigue construyendo sobre Nocti.»; `steps` L778):
  - «01 · NoctiLabs» · «Entendemos» · «Aprendemos cómo funciona tu empresa.» · ej.: «Entrevistas, procesos y reglas reales del negocio.»
  - «02 · NoctiLabs» · «Conectamos» · «Unimos sistemas, información y conocimiento.» · ej.: «ERP, CRM, planillas, correo y documentos, sin migrar nada.»
  - «03 · NoctiLabs + Nocti» · «Implementamos» · «Ponemos Nocti en funcionamiento sobre ese contexto.» · ej.: «Primeros casos de uso en producción, por rol.»
  - «04 · Tu equipo + Nocti» · «Evolucionamos» · «Sumamos procesos, agentes y nuevas capacidades.» · ej.: «Nuevos agentes y procesos sobre el mismo contexto.»
- **Interactividad**: `hs` igual que `hc` (enter/leave).

### 1.6 «Pensado para cómo opera tu industria» — selector de industria con foto (L176–195)
- **Propósito**: vitrina de industrias con foto, bajada y enlace.
- **Layout**: CONT con `margin-top:clamp(13.1px,1.6vw,19.7px)` (pegada a la anterior); CARD-BIG `flex column; align-items:center; gap:22px`.
  - h2: H2 + `text-align:center; max-width:17ch`.
  - p: `16px #6B6B68; text-align:center; max-width:52ch`.
  - SEG (L180): `#ECECE8`, overflow-x auto, `margin-top:6px`; botones `padding:10px 18px; mono 13px`.
  - Visor (L185): `position:relative; width:100%; margin-top:14px; border-radius:clamp(16.4px,2.1vw,26.2px); overflow:hidden; background:#3A3A3C; height:clamp(344.4px,34.4vw,492px)`. Cinco capas `position:absolute; inset:0; display:{{t.disp}}` (sólo la activa `block`).
  - Overlay inferior (L189): `position:absolute; left:0; right:0; bottom:0; padding:clamp(18px,2.5vw,36.1px); background:linear-gradient(180deg, rgba(20,20,22,0), rgba(20,20,22,.88) 55%); color:#FFFFFF; display:flex; flex-wrap:wrap; gap:20px 40px; align-items:flex-end; justify-content:space-between; pointer-events:none`.
    - Texto `flex column; gap:10px; max-width:56ch`: título `clamp(23px,2.5vw,36.1px)/500/-.04em/1.05`; blurb `15px; line-height:1.5; color:#E4E4E0`.
    - Botón `pointer-events:auto; padding:15px 24px; border-radius:999px; background:#FFFFFF; color:#0B0B0C; 16px/500`; hover `#EDEDEA`.
- **Copy**: H2 «Pensado para cómo opera tu industria.»; P «Organizado alrededor de procesos, preguntas y agentes reales de cada sector.»; tabs (`INDUSTRIES[].short`): «Retail» · «Manufactura» · «Consumo masivo» · «Salud y fitness» · «Servicios»; título = `INDUSTRIES[ind].label`, bajada = `INDUSTRIES[ind].blurb` (§Datos); botón «Conocer más →».
- **Interactividad**: estado `ind` (inicial **1** → arranca en «Manufactura», no en Retail). `indTabs[i].go` → `setState({ind:i})`; sin transición entre fotos (cambio de `display`).
- **Imágenes** (image-slot, `shape="rect"`, `width/height:100%`):

| slot id | tab | src | placeholder |
|---|---|---|---|
| `ind-0` | Retail | (vacío) | «Depósito de distribución: pasillos, pallets, luz natural» |
| `ind-1` | Manufactura | `assets/ind-manufactura.png` (1,55 MB) | «Planta: dos operarios en una línea, luz cálida» |
| `ind-2` | Consumo masivo | `assets/ind-consumo.png` (1,74 MB) | «Línea de envasado de alimentos» |
| `ind-3` | Salud y fitness | `assets/ind-fitness.png` (1,22 MB) | «Recepción de un centro de salud o gimnasio» |
| `ind-4` | Servicios | (vacío) | «Equipo de trabajo en una oficina» |

- **Link**: «Conocer más →» → `goIndustria` = `g('industria')` **para cualquier industria seleccionada** (siempre abre la página de Retail).

### 1.7 Banda «Hablemos.» (compartida; ver §8)

---

## 2. Página PRODUCTO (`p.producto`, L200–296)

`<main data-screen-label="Producto">` `flex column; padding:0 0 24px`. Anclas de sección: `#overview`, `#cerebro`, `#bi`, `#agentes`, `#control` (coinciden con `PROD_SUB`, usadas por el mega-menú y el footer).

### 2.1 Hero (L202–211)
- **Propósito**: presentar el producto.
- **Layout**: `<section>` `max-width:1200px; width:100%; margin:0 auto; padding:HERO-PAD var(--edge) 0; display:flex; flex-wrap:wrap; gap:32px 64px; align-items:flex-end`. Izquierda `flex:2 1 560px; flex column; gap:20px`. Derecha `flex:1 1 340px; flex column; gap:24px; padding-bottom:10px`.
- **Tipografía**: kicker mono 13px `.04em` uppercase `#6B6B68`; h1 H1-INT; p `17px/1.5 #6B6B68 max-width:40ch`; botón BTN-DARK (dentro de `flex; flex-wrap:wrap; gap:10px`).
- **Copy**: «Nocti · Producto» / «El cerebro organizacional de tu empresa.» / «Un sistema desde el que personas e IA pueden entender el negocio, tomar decisiones y ejecutar trabajo.» / «Hablemos →».
- **Link**: `goHablemos`.

### 2.2 Demo general (vista Inicio) (L212–215)
- **Propósito**: recorrido libre por la app.
- **Layout**: `max-width:1200px; width:100%; margin:0 auto; padding:clamp(26.2px,3.3vw,45.9px) var(--edge) 0; flex column; gap:12px`. APP-FRAME + CAPTION.
- **Embed**: `<dc-import name="Nocti App v2" on-new-agent="{{goHablemos}}" view="inicio" hint-size="100%,560px">`.
- **Copy caption**: «Recorré Nocti desde el menú lateral · datos ilustrativos»

### 2.3 Overview (`#overview`, L217–253)
- **Propósito**: diagrama en bloques: lo que la empresa tiene → Nocti → quién lo usa.
- **Layout**: CONT `margin-top:GAP-P`; CARD-BIG (variante 65.6) `flex column; gap:36px`.
  - Cabecera centrada `flex column; gap:14px; align-items:center; text-align:center`: KICKER + H2 `max-width:20ch`.
  - Columna `flex column; gap:0`:
    1. Grupo «entrada» `flex column; gap:8px`: sub-label mono 11px `.04em` uppercase `#6B6B68`; grilla `repeat(auto-fit,minmax(min(100%,220px),1fr)); gap:8px`; tarjeta `background:#F4F4F2; border:1px solid #E2E2DE; border-radius:20px; padding:18px 20px; flex column; gap:4px`; título `19px/500/-.03em`; desc `14px #6B6B68`.
    2. Conectores (L232–234): `display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); height:28px`; en cada columna una línea vertical centrada `width:1.5px; height:100%; background:#3D7BFF` con puntos `6.5×6.5px #0047FF` arriba (`top:-3px; left:-2.5px`) y abajo (`bottom:-3px`). Se repite (L240–242) bajo la barra Nocti. `ovLinks = [1,2,3]` (sólo para iterar 3 veces).
    3. Barra Nocti (L235–239): `position:relative; background:#0A0A0B; color:#F4F4F2; border-radius:20px; padding:18px 22px; flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px 24px; overflow:hidden`; halo `radial-gradient(ellipse at 50% 50%, rgba(61,123,255,.28), rgba(61,123,255,0) 60%)`. Izquierda: logo `26×26` (`markDark` = `mark('#F4F4F2','#3D7BFF')`), «Nocti» `26px/500/-.045em/1`, label mono 11px `.04em` uppercase `#9FBEFF`. Derecha: tres pills `padding:6px 12px; border-radius:999px; background:#1E1E21; mono 12px`.
    4. Grupo «salida» igual al 1.
- **Copy**: KICKER «Overview»; H2 «Una capa que conecta lo que tu empresa ya tiene.»; sub-label 1 «Lo que tu empresa ya tiene · se queda donde está»; `ovIn`: «Sistemas» — «ERP, CRM, planillas, correo, WhatsApp» · «Conocimiento» — «Documentos, procesos, reglas, políticas» · «Operaciones» — «Pedidos, tareas, excepciones, aprobaciones»; barra: «Nocti» + «Capa de conexión» + pills «Conecta» · «Contextualiza» · «Gobierna»; sub-label 2 «Quiénes lo usan»; `ovOut`: «Personas» — «Preguntan, deciden y actúan según su rol» · «Inteligencia de negocio» — «Métricas y análisis sobre datos vivos» · «Agentes» — «Ejecutan trabajo con permisos y reglas».
- **Mobile**: las tarjetas se apilan (auto-fit) pero los conectores siguen en 3 columnas fijas → quedan desalineados (ver Huecos).
- **SVG**: logo `mark()` (anillos de puntos, ver §Datos).

### 2.4 Secciones de producto ×3 (`productSections`, L255–272)
- **Propósito**: una sección por módulo (Cerebro, BI, Agentes) con features y demo.
- **Layout** (por ítem): `<section id="{{s.id}}">` CONT `margin-top:GAP-P; flex column; gap:24px`. HEAD-ROW: izquierda `flex:2 1 520px; flex column; gap:14px` (KICKER + H2), derecha p LEAD `flex:1 1 320px`. Chips `flex; flex-wrap:wrap; gap:8px`; chip `padding:9px 16px; border-radius:999px; background:#FFFFFF; border:1px solid #E2E2DE; 14px/500`. APP-FRAME con embed. CAPTION.
- **Embeds**: `<dc-import name="Nocti App v2" on-new-agent="{{goHablemos}}" view="{{s.view}}" hint-size="100%,560px">` con `view` = `cerebro`, `inteligencia`, `agentes`. Sin `role`, sin `hide-role-chips` (→ chips «Ver como» visibles), sin `perms-side` (→ panel de permisos en línea si el ancho de la App ≥ 860 px).
- **Copy**:
  1. `id="cerebro"` · KICKER «Cerebro organizacional» · H2 «Preguntá. Decidí. Ejecutá.» · P «CEO, Comercial y Operaciones consultan el mismo cerebro, pero ven solo la información y las acciones que les corresponden.» · chips: «Pregunta en lenguaje natural», «Respuesta contextualizada», «Fuentes consultadas», «Permisos por rol», «Análisis e insight», «Acción sugerida» · caption «Cambiá de rol con “Ver como” para comparar respuestas.»
  2. `id="bi"` · KICKER «Inteligencia / BI» · H2 «De la pregunta al dato. Del dato a la acción.» · P «Conversacional y visual, no un tablero estático. Cada resultado se puede rastrear hasta el registro que lo origina.» · chips: «Lenguaje natural», «Métricas sobre datos vivos», «Trazabilidad hasta la fuente», «Del KPI a la transacción», «Anomalías y excepciones», «Acciones desde el análisis» · caption «Probá “Ver transacciones” para bajar del KPI al detalle.»
  3. `id="agentes"` · KICKER «Agentes» · H2 «Agentes que trabajan sobre el contexto real de tu empresa.» · P «Creá los tuyos, integrá los que ya tenés o construílos con NoctiLabs.» · chips: «Crear o integrar», «Sistemas, fuentes y herramientas», «Permisos, reglas y acciones», «Probar, publicar y versionar», «Tareas, excepciones y aprobaciones», «Historial y consumo de tokens» · caption «Los agentes usan los mismos permisos y la misma trazabilidad que las personas.»
- **Interactividad**: toda dentro de la App (chat animado + «Ver como»; «Ver transacciones»; tarjetas de agente → detalle con flujo y aprobar; «Crear / Integrar» → `goHablemos`).

### 2.5 Control y gobernanza (`#control`, L274–294)
- **Propósito**: capa de control transversal + demo de aprobación humana.
- **Layout**: CONT `margin-top:GAP-P`; CARD-BIG (variante 65.6) `flex column; gap:28px`.
  - HEAD-ROW (KICKER + H2 / LEAD).
  - Diagrama de capas `flex column; gap:8px`: grilla `repeat(3,minmax(0,1fr)); gap:8px` (fija, también en mobile); tarjeta `background:#F4F4F2; border-radius:20px; padding:22px 18px; font-size:clamp(14.8px,1.6vw,21.3px); font-weight:500; letter-spacing:-.03em`. Barra negra `background:#0A0A0B; color:#F4F4F2; border-radius:20px; padding:20px 22px; flex; flex-wrap:wrap; justify-content:space-between; gap:12px 24px; align-items:center`; título `clamp(16.4px,1.8vw,23px)/500/-.03em`; lista mono 12px `.03em` uppercase `#A7A7AC`.
  - Embed en marco `background:#E9E9E5; border-radius:28px; padding:clamp(8.2px,1.3vw,14.8px)` (distinto de APP-FRAME).
  - Caption mono 12px `.03em` `#6B6B68` (sin padding-left).
- **Copy**: KICKER «Control y gobernanza»; H2 «Una capa de control debajo de todo.»; P «Cerebro, Inteligencia y Agentes comparten los mismos permisos, aprobaciones y trazabilidad.»; capas (`layers`): «Cerebro» · «Inteligencia» · «Agentes»; barra «Control y gobernanza» + «Permisos · Seguridad · Aprobaciones · Trazabilidad · Observabilidad · Agentes»; caption «Ejemplo: una orden por encima del límite espera aprobación humana. Probá aprobarla o rechazarla.»
- **Embed**: `<dc-import name="Nocti App v2" on-new-agent="{{goHablemos}}" view="control" hint-size="100%,560px">`.

### 2.6 Banda «Hablemos.» (§8)

---

## 3. Página INDUSTRIA (`p.industria`, L299–356) — única, fija en Retail y distribución

`<main data-screen-label="Industria · Retail y distribución">` `flex column; padding:0 0 24px`. Todo el contenido es de Retail; no depende de `state.ind`.

### 3.1 Hero (L301–310)
- Layout idéntico a 2.1 (HERO-PAD, `flex:2 1 560px` / `flex:1 1 340px`). Botón BTN-DARK dentro de `display:flex`.
- **Copy**: kicker «Industrias · Retail y distribución»; H1 «Cada cliente, pedido y proveedor en un mismo contexto.»; P «Nocti conecta ventas, stock, compras y cobranzas para que tu equipo sepa qué priorizar cada día y tus agentes trabajen con las mismas reglas.»; botón «Hablemos →» → `goHablemos`.

### 3.2 Foto (L311–315)
- CONT `margin-top:clamp(26.2px,3.3vw,45.9px)`; caja `position:relative; border-radius:clamp(19.7px,2.5vw,29.5px); overflow:hidden; background:#3A3A3C; height:clamp(262.4px,29.5vw,426.4px)`.
- **Image-slot**: `id="ind-0"` (mismo id que la tab Retail de Home → comparten imagen persistida), sin `src`, placeholder «Depósito de distribución: pasillos, pallets, luz natural». Hoy se ve el placeholder (no hay asset de retail).

### 3.3 Procesos clave (L316–323)
- CONT `margin-top:GAP-P; flex column; gap:24px`; cabecera `flex column; gap:14px` (KICKER + H2). Grilla `repeat(auto-fit,minmax(min(100%,260px),1fr)); gap:12px`. Tarjeta `background:#FFFFFF; border:1px solid #E2E2DE; border-radius:24px; padding:22px; min-height:189px; flex column; gap:10px`; nº mono 13px `#6B6B68`; título `margin-top:auto; 25px/500/-.04em/1.05`; desc `15px #6B6B68`.
- **Copy**: KICKER «Procesos clave»; H2 «Los procesos que mueven tu operación.»; `processes`: 01 «Ventas y clientes» — «Cartera, frecuencia de compra y oportunidades.» · 02 «Pedidos e inventario» — «Stock, quiebres y prioridades de despacho.» · 03 «Compras y proveedores» — «Órdenes, plazos y condiciones.» · 04 «Finanzas y cobranzas» — «Facturas, vencimientos y planes de pago.»
- Estática (sin hover).

### 3.4 Preguntas (L324–333)
- CONT `margin-top:GAP-P`; DARK-BIG `flex column; gap:28px`. KICKER `#7A7A80`. Lista `flex column`; fila `display:grid; grid-template-columns:minmax(0,1fr) auto; gap:16px; align-items:center; padding:22px 0; border-top:1px solid #2A2A2E`; pregunta `clamp(18px,2.1vw,31.2px)/500/-.035em/1.12`; pill área `padding:6px 12px; border-radius:999px; background:#1E1E21; color:#9FBEFF; mono 12px; nowrap`.
- **Copy**: «Preguntas que le podés hacer a Nocti»; `retailQs`: «¿Qué clientes están comprando menos que hace tres meses?» [Ventas] · «¿Qué productos tienen riesgo de quiebre esta semana?» [Inventario] · «¿Qué pedidos deberían priorizarse hoy?» [Pedidos] · «¿Qué facturas vencidas requieren seguimiento?» [Cobranzas].
- Estática (no son clicables).

### 3.5 Agentes posibles (L334–341)
- Igual layout que 3.3; tarjeta `min-height:172px`; badge `flex; gap:8px; align-items:center; mono 12px; color:#0038CC` con punto `7×7px #0047FF`; título `margin-top:auto; 23px/500/-.035em/1.08`; desc `15px #6B6B68`.
- **Copy**: KICKER «Agentes posibles»; H2 «Agentes que trabajan sobre tu operación real.»; badge «AGENTE»; `retailAgents`: «Agente comercial» — «Prepara seguimientos para clientes que compran menos.» · «Agente de cobranzas» — «Envía recordatorios y propone planes de pago dentro de las reglas.» · «Agente de compras» — «Prepara reposiciones y pide aprobación por encima del límite.» · «Agente operativo» — «Prioriza pedidos según stock, cliente y fecha comprometida.»

### 3.6 Por qué Nocti + otras industrias (L342–354)
- CONT `margin-top:GAP-P`; panel blanco `border-radius:clamp(19.7px,2.5vw,29.5px); padding:clamp(32.8px,4.9vw,65.6px) clamp(13.1px,2.9vw,45.9px)` (simétrico); `flex column; gap:28px`. H2. Grilla `repeat(auto-fit,minmax(min(100%,280px),1fr)); gap:12px`; tarjeta `background:#F4F4F2; border-radius:20px; padding:22px; flex column; gap:8px`; nº mono 13px `#6B6B68`; texto `16px/1.4` con `<strong style="font-weight:500">` + span `#6B6B68`.
- Fila «Otras industrias»: `flex; flex-wrap:wrap; gap:8px; align-items:center`; label KICKER + `margin-right:8px`; botones `padding:9px 16px; border-radius:999px; background:#F4F4F2; 14px/500`; hover `#E6E6E2`.
- **Copy**: H2 «Por qué Nocti para retail y distribución.»; `whyNocti`: 01 **«Una misma capa»** «para toda la operación.» · 02 **«Contexto real del negocio:»** «procesos, reglas, excepciones y conocimiento.» · 03 **«Control y trazabilidad»** «sobre cada acción.» · 04 **«Servicio + plataforma:»** «NoctiLabs implementa y la organización sigue construyendo sobre Nocti.»; label «Otras industrias»; botones (`INDUSTRIES.slice(1)`): «Manufactura →» · «Alimentos y bienes de consumo →» · «Salud y actividad física →» · «Servicios profesionales y empresariales →».
- **Links**: los cuatro → `g('industria')` (recarga la misma página Retail con scroll a 0; no hay páginas por industria).

### 3.7 Banda «Hablemos.» (§8)

---

## 4. Página NOSOTROS (`p.nosotros`, L359–390)

`<main data-screen-label="Nosotros">` `flex column; padding:0 0 24px`.

### 4.1 Hero (L361–364)
- `max-width:1200px; width:100%; margin:0 auto; padding:HERO-PAD var(--edge) 0; flex column; gap:20px`. Kicker mono 13px; H1-INT `max-width:14ch`.
- **Copy**: «Nosotros» / «Construimos el cerebro operativo de las empresas.»

### 4.2 Bloques «Quiénes somos / Por qué» (L365–369)
- CONT `margin-top:clamp(39.4px,4.9vw,72.2px); display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr)); gap:12px`. Tarjeta `background:#FFFFFF; border:1px solid #E2E2DE; border-radius:28px; padding:clamp(19.7px,2.5vw,32.8px); flex column; gap:14px`; KICKER; título `clamp(21.3px,2.1vw,29.5px)/500/-.04em/1.08`; texto `15px #6B6B68`.
- **Copy** (`aboutBlocks`):
  - «Quiénes somos» · «Un equipo de producto, datos e implementación.» · «NoctiLabs combina software y servicio: construimos Nocti y lo implementamos junto a cada empresa, sobre sus sistemas y su forma de trabajar.»
  - «Por qué construimos Nocti» · «Las empresas ya saben lo que necesitan saber.» · «Pero ese conocimiento está repartido entre sistemas, planillas, conversaciones y personas. Construimos Nocti para que esté disponible para todos, con los permisos correctos, y para que la IA trabaje sobre él.»

### 4.3 Qué creemos (L370–377)
- CONT `margin-top:12px`; DARK-BIG `flex column; gap:24px`. KICKER `#7A7A80`. Fila `display:grid; grid-template-columns:56px minmax(0,1fr); gap:12px; padding:18px 0; border-top:1px solid #2A2A2E`; nº mono 13px `#7A7A80; padding-top:8px`; frase `clamp(19.7px,2.5vw,36.1px)/500/-.04em/1.08`.
- **Copy**: «Qué creemos»; `beliefs`: 01 «El contexto vale más que el modelo.» · 02 «Personas y agentes deben trabajar sobre la misma base.» · 03 «Sin control y trazabilidad no hay confianza.»

### 4.4 Equipo (L378–388)
- CONT `margin-top:GAP-P; flex column; gap:24px`; cabecera KICKER + H2. Grilla `repeat(auto-fill,minmax(min(100%,220px),1fr)); gap:12px`. Tarjeta `background:#FFFFFF; border:1px solid #E2E2DE; border-radius:28px; padding:10px 10px 18px; flex column; gap:10px`; foto `aspect-ratio:4/5; border-radius:20px; overflow:hidden; background:#E6E6E2`; nombre `500/16px/-.02em; padding:0 8px`; rol mono 12px `#6B6B68; padding:0 8px`.
- **Copy**: KICKER «Equipo»; H2 «Las personas detrás de Nocti.»; `team`: «Nombre Apellido» ×4 con roles «Cofundador · CEO», «Cofundador · Producto», «Ingeniería», «Implementación».
- **Imágenes**: image-slots `team-1` … `team-4`, `shape="rect"`, placeholder «Retrato», sin `src`.

### 4.5 Banda «Hablemos.» (§8)

---

## 5. Página INSIGHTS (`p.insights`, L393–418)

`<main data-screen-label="Insights">` `flex column; padding:0 0 24px`.

### 5.1 Hero (L395–398)
- `max-width:1200px; width:100%; margin:0 auto; padding:HERO-PAD var(--edge) 0; flex; flex-wrap:wrap; gap:24px 64px; align-items:flex-end`. Izq. `flex:2 1 560px; flex column; gap:20px` (kicker mono 13px + H1-INT). P `flex:1 1 340px; 17px/1.5 #6B6B68; padding-bottom:10px`.
- **Copy**: «Insights» / «Contexto, IA operativa y agentes.» / «Tesis y análisis sobre cómo cambian las organizaciones cuando personas e IA trabajan sobre el mismo contexto.»

### 5.2 Filtros + destacado + grilla (L399–416)
- CONT `margin-top:clamp(26.2px,3.3vw,45.9px); flex column; gap:16px`.
- **Filtros** (L400): SEG `background:#E6E6E2; align-self:flex-start`, overflow-x auto; botones `padding:10px 18px; mono 13px`, `tab()`. Etiquetas (`FILTERS`): «Todos» · «Tesis» · «Contexto de negocio» · «IA operativa» · «Agentes» · «Transformación».
- **Destacado** (L405–410, sólo si `showFeatured` = filtro «Todos»): `<button>` `display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr)); gap:10px; background:#FFFFFF; border:1px solid #E2E2DE; border-radius:32px; padding:10px`.
  - Panel izq.: `position:relative; background:#0A0A0B; color:#F4F4F2; border-radius:24px; padding:28px; min-height:300px; flex column; justify-content:space-between; gap:24px; overflow:hidden`; halo `radial-gradient(circle at 75% 30%, rgba(61,123,255,.28), rgba(61,123,255,0) 50%)`; kicker mono 12px `.04em` uppercase `#9FBEFF` «Destacado · {cat}»; título `clamp(23px,2.6vw,37.7px)/500/-.04em/1.04`.
  - Panel der.: `padding:22px; flex column; justify-content:space-between; gap:24px`; resumen `17px/1.5 #6B6B68`; pie `flex; justify-content:space-between; gap:12px; align-items:center` con meta mono 12px `#6B6B68` «{date} · {mins}» y pseudo-botón `padding:11px 18px; border-radius:999px; background:#0B0B0C; color:#FFFFFF; 15px/500` «Leer →».
  - Contenido = `ARTICLES[0]`: «Destacado · Tesis» / «El contexto es el nuevo sistema operativo de la empresa.» / «Por qué la ventaja ya no está en el modelo de IA, sino en el contexto sobre el que trabaja.» / «18 sep 2026 · 8 min».
- **Grilla** (L411): `repeat(auto-fill,minmax(min(100%,320px),1fr)); gap:12px`. Tarjeta-botón `background:#FFFFFF; border:1px solid #E2E2DE; border-radius:24px; padding:22px; min-height:189px; flex column; gap:14px`; hover `border-color:#B9B9B4`; categoría mono 12px `.04em` uppercase `#0038CC`; título `21px/500/-.035em/1.12`; meta `margin-top:auto`, mono 12px `#6B6B68` «{date} · {mins}».
- **Lógica** (`articleList`, L750): `filter === 'Todos'` → `ARTICLES.slice(1)` (5 artículos, el destacado aparte); otro filtro → `ARTICLES.filter(a => a.cat === filter)` y se oculta el destacado (con «Tesis» la grilla muestra sólo el artículo 0 como tarjeta; con «Agentes», 2; con los demás, 1).
- **Links**: destacado y todas las tarjetas → `goArticulo` = `g('articulo')` (siempre el mismo artículo).
- Estado: `filter` (inicial `'Todos'`).

### 5.3 Banda «Hablemos.» (§8)

---

## 6. Página ARTÍCULO (`p.articulo`, L421–453) — un único artículo hardcodeado

`<main data-screen-label="Insights · Artículo">` `padding:0 0 24px`. En el header, «Insights» se marca activo también en esta página.

### 6.1 Cabecera (L423–429)
- `<article>` `max-width:1200px; margin:0 auto; padding:clamp(26.2px,4.1vw,59px) var(--edge) 0; flex column; gap:32px`.
- Botón volver: `align-self:flex-start; padding:9px 16px; border-radius:999px; background:#E6E6E2; mono 13px`; hover `#DCDCD7`. «← Insights» → `goInsights` = `g('insights')`.
- Bloque título `flex column; gap:20px; max-width:1000px`: categoría mono 13px `.04em` uppercase `#0038CC`; h1 `font-size:clamp(32.8px,4.4vw,68.9px); font-weight:500; line-height:1; letter-spacing:-.05em`; meta `flex; flex-wrap:wrap; gap:8px 24px; mono 12px; .03em; #6B6B68; uppercase`.
- **Copy**: «Tesis» / «El contexto es el nuevo sistema operativo de la empresa.» / meta «NoctiLabs» · «18 sep 2026» · «8 min de lectura».

### 6.2 Cuerpo (L430–442)
- Panel blanco `border:1px solid #E2E2DE; border-radius:clamp(19.7px,2.5vw,29.5px); padding:clamp(23px,4.1vw,59px) clamp(16.4px,3.3vw,52.5px); flex; flex-wrap:wrap; gap:32px 64px`.
- `<aside>` `flex:1 1 200px; flex column; gap:10px; 15px #6B6B68`; título mono 12px `.04em` uppercase `#0B0B0C`. Ítems de índice como `<span>` (no son links).
- Columna texto `flex:3 1 520px; max-width:68ch; flex column; gap:20px; 16px/1.65`.
  - Lead: `clamp(17.2px,1.6vw,20.5px)/1.45/-.015em`.
  - h2: `margin:16px 0 0; 26px/500/-.035em`.
  - p: `color:#3A3A38`.
  - blockquote: `margin:16px 0; padding:26px 28px; border-radius:24px; background:#F4F4F2; clamp(19.7px,2vw,26.2px)/500/-.035em/1.15`.
- **Copy literal**:
  - Aside: «En este artículo» / «El problema no es la IA» / «Qué es el contexto operativo» / «De sistemas a cerebro»
  - Lead: «Las empresas ya tienen la información que necesitan para operar mejor. El problema es que está repartida entre sistemas, planillas, conversaciones y la cabeza de algunas personas.»
  - H2: «El problema no es la IA»
  - P: «Los modelos de lenguaje saben mucho del mundo y casi nada de tu empresa. No conocen tus clientes, tus reglas de crédito ni por qué un pedido de los martes es más importante que otro. Sin ese contexto, cualquier respuesta es genérica.»
  - Cita: «La IA conoce el modelo. Nocti conoce tu empresa.»
  - H2: «Qué es el contexto operativo»
  - P: «Es la suma de lo que una organización sabe sobre sí misma: sus sistemas, sus procesos, sus reglas, sus excepciones y quién puede ver o hacer qué. Cuando ese contexto vive en un solo lugar, personas y agentes pueden trabajar sobre la misma base.»
  - H2: «De sistemas a cerebro»
  - P: «El ERP registra, el CRM organiza, las planillas resuelven lo que falta. Un cerebro operativo conecta todo eso y le agrega lo que ningún sistema tiene por separado: entendimiento del negocio, permisos y trazabilidad.»

### 6.3 Seguir leyendo (L443–450)
- `flex column; gap:12px`; KICKER «Seguir leyendo»; grilla `repeat(auto-fit,minmax(min(100%,320px),1fr)); gap:12px`; tarjeta-botón `background:#FFFFFF; border:1px solid #E2E2DE; border-radius:24px; padding:22px 24px; flex; justify-content:space-between; gap:16px; 18px/500/-.03em`; hover `border-color:#B9B9B4`; flecha «→».
- **Copy** (`related = ARTICLES.slice(1,3)`): «Por qué la IA genérica no entiende tu operación.» · «Agentes con permisos: cómo delegar sin perder control.»
- **Links**: ambos → `goArticulo` (re-renderiza el mismo artículo; `go` hace scroll a 0).

### 6.4 Banda «Hablemos.» (§8)

---

## 7. Página HABLEMOS (`p.hablemos`, L456–486)

`<main data-screen-label="Hablemos">` `padding:0 0 24px`. Es la única página sin banda «Hablemos.» (`showClose = page !== 'hablemos'`).

### 7.1 Contacto + formulario (L458–484)
- **Layout**: `<section>` `max-width:1200px; margin:0 auto; padding:HERO-PAD var(--edge) 0; display:flex; flex-wrap:wrap; gap:40px 64px; align-items:flex-start`.
  - Columna izq. `flex:1 1 380px; flex column; gap:28px`: H1-INT; p `max-width:40ch; 17px/1.5 #6B6B68`; lista de pasos `flex column; gap:8px`, fila `flex; gap:16px; align-items:center; padding:16px 20px; border-radius:20px; background:#FFFFFF; border:1px solid #E2E2DE` (nº mono 13px `#6B6B68`, texto 16px); línea de mail `16px #6B6B68` con `<a href="mailto:hola@noctilabs.io">` (color global `#0038CC`, hover `#0B0B0C`).
  - Columna der. (tarjeta) `flex:1 1 420px; background:#FFFFFF; border:1px solid #E2E2DE; border-radius:32px; padding:clamp(18px,2.5vw,29.5px); flex column; gap:16px`.
    - Estado `notSent`: grilla de campos `repeat(auto-fit,minmax(min(100%,200px),1fr)); gap:14px`; cada `<label>` `flex column; gap:6px`; etiqueta mono 12px `.03em` uppercase `#6B6B68`; `<input type="{{f.t}}">` `font:inherit; font-size:16px; padding:13px 16px; border-radius:14px; border:1px solid #E2E2DE; background:#F4F4F2; color:#0B0B0C; outline:none`; focus `border-color:#0047FF; background:#FFFFFF`. Select (`sc-raw-select`) mismo estilo (sin estilo de focus). Textarea igual + `min-height:130px; resize:vertical` (con focus). Botón «Enviar →»: BTN-DARK + `text-align:center` (ancho completo por ser bloque).
    - Estado `sent`: `flex column; gap:14px; min-height:320px; justify-content:center; align-items:flex-start`; punto `12×12px #0047FF`; mensaje `30px/500/-.04em/1.08`; botón `padding:10px 16px; border-radius:999px; background:#E6E6E2; 15px/500` (sin hover).
- **Copy**:
  - H1 «Hablemos.»
  - P «Contanos cómo opera tu empresa y qué te gustaría resolver. Te respondemos para coordinar una conversación.»
  - Pasos (`nextSteps`): 01 «Leemos tu mensaje y te escribimos.» · 02 «Conversamos sobre cómo opera tu empresa.» · 03 «Te mostramos Nocti sobre un caso de tu industria.»
  - «O escribinos a hola@noctilabs.io»
  - Campos (`formFields`): «Nombre» (text) · «Email laboral» (email) · «Empresa» (text) · «Rol» (text)
  - «Industria» con opciones: «Retail y distribución», «Manufactura», «Alimentos y bienes de consumo», «Salud y actividad física», «Servicios profesionales y empresariales», «Otra»
  - «¿Qué te gustaría resolver?» (textarea)
  - «Enviar →»
  - Enviado: «Gracias. Te vamos a escribir pronto.» + «Enviar otro mensaje»
- **Interactividad**: `send` → `setState({sent:true})` (sin validación, sin captura de valores, sin envío real; los inputs no son controlados ni tienen `name`/`placeholder`/`required`). `resetSend` → `sent:false` (los inputs se remontan vacíos).

---

## 8. Banda «Hablemos.» (compartida, L488–496)
- **Propósito**: CTA de cierre antes del footer en todas las páginas salvo Hablemos.
- **Layout**: `<section>` `max-width:1200px; margin:clamp(19.7px,3.3vw,45.9px) auto 0; padding:0 var(--edge)`. Panel `position:relative; background:#0A0A0B; color:#F4F4F2; border-radius:clamp(19.7px,2.5vw,29.5px); padding:clamp(39.4px,5.7vw,85.3px) clamp(19.7px,3.3vw,52.5px); display:flex; flex-wrap:wrap; gap:32px; align-items:flex-end; justify-content:space-between; overflow:hidden`; halo `radial-gradient(circle at 85% 20%, rgba(61,123,255,.22), rgba(61,123,255,0) 45%)`.
- **Tipografía**: palabra `position:relative; font-size:clamp(49.2px,7.4vw,123px); font-weight:500; letter-spacing:-.055em; line-height:.9`. Botón BTN-WHITE (`position:relative`).
- **Copy**: «Hablemos.» + «Agendar una conversación →».
- **Link**: `goHablemos`.
- Condición: `showClose = page !== 'hablemos'`.

---

## 9. Datos (constantes del script, transcriptas)

### 9.1 `PROD_SUB` (L514) — `[label, ancla, descripción]`
1. `['Overview', 'overview', 'Sistemas, conocimiento y operaciones conectados en una sola capa de contexto.']`
2. `['Cerebro', 'cerebro', 'Preguntá a tu empresa y recibí respuestas con fuentes, según los permisos de tu rol.']`
3. `['Inteligencia / BI', 'bi', 'De la pregunta al dato y del dato a la acción, sobre datos vivos y trazables.']`
4. `['Agentes', 'agentes', 'Creá, integrá y supervisá agentes que trabajan sobre el contexto real.']`
5. `['Control', 'control', 'Permisos, aprobaciones y trazabilidad sobre cada persona y cada agente.']`

Uso: `prodItems` (mega-menú, menú mobile y footer) → `g('producto', ancla)`.

### 9.2 `INDUSTRIES` (L515–521)
| # | label | short | blurb | ph | src |
|---|---|---|---|---|---|
| 0 | Retail y distribución | Retail | Pedidos, stock, cobranzas y proveedores sobre un mismo contexto, con prioridades claras cada día. | Depósito de distribución: pasillos, pallets, luz natural | — |
| 1 | Manufactura | Manufactura | Producción, compras y calidad conectadas con los sistemas que la planta ya usa. | Planta: dos operarios en una línea, luz cálida | assets/ind-manufactura.png |
| 2 | Alimentos y bienes de consumo | Consumo masivo | Lotes, vencimientos, canales y márgenes en una sola vista operativa. | Línea de envasado de alimentos | assets/ind-consumo.png |
| 3 | Salud y actividad física | Salud y fitness | Socios, sedes, agenda y cobranzas, con permisos claros por rol. | Recepción de un centro de salud o gimnasio | assets/ind-fitness.png |
| 4 | Servicios profesionales y empresariales | Servicios | Clientes, proyectos, horas y facturación conectados en un mismo contexto. | Equipo de trabajo en una oficina | — |

Uso: tabs de Home, `indItems` (mega-menú/footer: label + blurb como desc, todos → `g('industria')`), `otherIndustries` (slice(1)).

### 9.3 `SYSTEMS` (L522) — **no usado**
`['ERP', 'CRM', 'Drive / SharePoint', 'WhatsApp', 'Finanzas', 'RR.HH.']`

### 9.4 `ACCESS` (L523–528) — **no usado** (matriz de acceso por rol, 6 posiciones alineadas con SYSTEMS; `null` = sin acceso)
- `ceo`: who «Laura Méndez · CEO»; s: «Ventas, stock y compras» · «Todo el pipeline» · «Toda la documentación» · «Resúmenes de conversaciones» · «Márgenes y caja» · «Indicadores agregados»
- `comercial`: who «Jorge Rodríguez · Comercial»; s: «Pedidos y stock de su cartera» · «Sus clientes y oportunidades» · «Catálogo y listas de precios» · «Conversaciones con sus clientes» · null · null
- `operaciones`: who «Silvana Pérez · Operaciones»; s: «Pedidos, stock y compras» · null · «Procedimientos y manuales» · «Avisos de proveedores» · «Órdenes por aprobar» · null
- `agentes`: who «Agentes · Acceso delegado»; s: «Lectura de pedidos y facturas» · «Registro de seguimientos» · null · «Envío de recordatorios» · «Solo propuesta, con aprobación» · null

### 9.5 `ROLE_TABS` (L529)
`[['ceo','CEO'], ['comercial','Comercial'], ['operaciones','Operaciones'], ['agentes','Agentes']]`

### 9.6 `ARTICLES` (L530–537)
| # | cat | t | d | date | mins |
|---|---|---|---|---|---|
| 0 | Tesis | El contexto es el nuevo sistema operativo de la empresa. | Por qué la ventaja ya no está en el modelo de IA, sino en el contexto sobre el que trabaja. | 18 sep 2026 | 8 min |
| 1 | IA operativa | Por qué la IA genérica no entiende tu operación. | — | 4 sep 2026 | 6 min |
| 2 | Agentes | Agentes con permisos: cómo delegar sin perder control. | — | 21 ago 2026 | 7 min |
| 3 | Transformación | De la planilla al cerebro operativo, en cuatro etapas. | — | 7 ago 2026 | 9 min |
| 4 | Contexto de negocio | Preguntas que un CEO debería poder hacerle a su empresa. | — | 24 jul 2026 | 5 min |
| 5 | Agentes | Trazabilidad: la condición para confiar en un agente. | — | 10 jul 2026 | 6 min |

### 9.7 `FILTERS` (L538)
`['Todos', 'Tesis', 'Contexto de negocio', 'IA operativa', 'Agentes', 'Transformación']`

### 9.8 Copy definido inline en `renderVals()` (no constantes globales)
Ya transcripto en cada sección: `capabilities`, `steps` (+ ejemplos), `ovIn`, `ovOut`, `productSections`, `layers`, `processes`, `retailQs`, `retailAgents`, `whyNocti`, `aboutBlocks`, `beliefs`, `team`, `nextSteps`, `formFields`, `morphTitle`. También (header, fuera de alcance) `menu.kicker/title`: «Industrias» / «Organizado alrededor de procesos reales de cada sector.» y «Producto» / «Cerebro, Inteligencia y Agentes sobre una misma capa.» (`title` no se renderiza).

### 9.9 `mark(fg, core)` (L539–544) — logo SVG
`viewBox 0 0 48 48`; tres anillos de puntos alrededor de (24,24): radio 8 con 7 puntos de r 2.6; radio 13.2 con 13 puntos de r 1.85; radio 18.4 con 19 puntos de r 1.1; ángulo `i/n·2π + k·.3`; núcleo r 3.8 color `core`. Variantes: `mark('#0B0B0C','#0047FF')` (footer), `markDark = mark('#F4F4F2','#3D7BFF')` (barra Overview).

### 9.10 Nodos de diagramas: `NODE`, `BASE`, helpers (L545–560)
- `BASE`: `o:1, wd:'auto', ht:'auto', rad:'999px', pad:'7px 13px', fs:'13px', ff:'inherit', ls:'normal', ai:'center'`.
- `NODE`:
  - `src`: bg `#FFFFFF`, fg `#0B0B0C`, bd `1px solid #D9D9D4`
  - `srcSm`: ídem + pad `5px 9px`, fs `12px`
  - `chip`: bg `#F4F4F2`, fg `#0B0B0C`, bd `1px solid #E2E2DE`, pad `5px 10px`, fs `12px`
  - `chipOff`: bg `transparent`, fg `#9A9A96`, bd `1px dashed #C4C4BF`, pad `5px 10px`, fs `12px`
  - `dark`: bg `#0B0B0C`, fg `#FFFFFF`, bd `1px solid #0B0B0C`
  - `agent`: bg `#EEF3FF`, fg `#0038CC`, bd `1px solid #A9C4FF`
  - `layer`: bg `#EEF3FF`, fg `#0038CC`, bd `1px solid #A9C4FF`, rad `14px`, ff mono, fs `11px`, ls `.04em`, pad `0 12px`
  - `block`: bg `#FFFFFF`, fg `#0B0B0C`, bd `1px solid #A9C4FF`, rad `18px`, ff mono, fs `11px`, ls `.04em`, ai `flex-start`, pad `9px 12px`
  - `tag`: bg `#0047FF`, fg `#FFFFFF`, bd `1px solid #0047FF`, ff mono, fs `10px`, ls `.03em`, pad `3px 8px`
  - `badge`: bg `#FFFFFF`, fg `#0038CC`, bd `1px solid #A9C4FF`, pad `0`, fs `11px`, wd `20px`, ht `20px`
- `node(label,[x,y,sc=1],kind,extra)` → `tf: translate(-50%,-50%) scale(sc)`.
- `show(on, sc)` → `{o: on?1:0, tf: translate(-50%,-50%) scale(on?1:sc)}`.
- `links(segs, on)`: por segmento, `<line>` `stroke #3D7BFF`, `strokeWidth 1.4`, `vectorEffect non-scaling-stroke` + círculos `r .9 fill #0047FF` en ambos extremos; `opacity on?1:0`, `transition opacity .5s` con delay `.35+i·.05 s` al encender, `0s` al apagar. SVG `viewBox 0 0 100 100`, `preserveAspectRatio none`, absoluto `inset:0`.

### 9.11 `diagrams(con)` (L571–600) — Opción 2 (por defecto)
Devuelve 3 objetos `{nodes, lines, title, text, kicker, kc}`; `kicker = con ? 'Con Nocti' : 'Sin Nocti'`, `kc = con ? '#0038CC' : '#6B6B68'`. Los nodos fijos no se mueven entre estados; cambian opacidad/escala de capa, chips, tag y badges, y las líneas.

**Diagrama 1** — título «Fragmentado» → «Conectado»; texto «Información y conocimiento dispersos.» → «Tus sistemas y fuentes de conocimiento, conectados en una misma capa.»
- Capa: «Nocti · capa de conexión» `layer` en (50,58), `wd 88%`, `ht 12%`, `show(con,.92)`.
- Fuentes `src`: ERP (18,16) · CRM (50,13) · Planillas (82,16) · Personas (34,33) · Mails (18,84) · WhatsApp (50,87) · Documentos (82,84).
- Líneas: (18,20.5→18,52), (50,17.5→50,52), (82,20.5→82,52), (34,37.5→34,52), (18,79.5→18,64), (50,82.5→50,64), (82,79.5→82,64).

**Diagrama 2** — «Genérico» → «Contextualizado»; «La IA conoce el modelo, no tu empresa.» → «La IA entiende cómo funciona tu empresa: procesos, reglas, relaciones y excepciones.»
- Bloque «Contexto empresarial» `block` (50,52), `wd 84%`, `ht 38%`, `show(con,.96)` (label arriba por `ai:flex-start`).
- Chips (con → `chip`, sin → `chipOff`, siempre visibles): Procesos (31,50) · Reglas (69,50) · Relaciones (31,61) · Excepciones (69,61).
- Fuentes `srcSm` en y=87: ERP (15) · CRM (37) · Documentos (61) · Personas (85).
- «IA» `dark` (50,14) con pad `7px 18px`.
- Tag «construido por Nocti» `tag` (70,71), `show(con,.8)`.
- Líneas: (15,83→15,71), (37,83→37,71), (61,83→61,71), (85,83→85,71), (50,18.5→50,33).

**Diagrama 3** — «Aislado» → «Coordinado»; «Personas, aplicaciones y agentes trabajan por separado.» → «Personas, aplicaciones y agentes trabajan sobre el mismo contexto, con permisos y trazabilidad.»
- Capa «Contexto compartido · Nocti» `layer` (50,84), `wd 88%`, `ht 12%`, `show(con,.92)`.
- Personas `src`: Ventas (19,16) · Finanzas (50,16) · Operaciones (81,16).
- «Agente comercial» `agent` (27,42) · «Agente de cobranzas» `agent` (72,42) · «Aplicaciones» `src` (50,60).
- Badges «✓» `badge` en (19,50), (72,63), (50,71), `show(con,.5)`.
- Líneas: (19,20.5→19,78), (50,20.5→50,55.5), (81,20.5→81,78), (27,46.5→27,78), (72,46.5→72,78), (50,64.5→50,78).

### 9.12 `diagramsOld(con)` (L601–628) — Opción 1
Helpers: `oldNode(label,[x,y,r=0,sc=1],kind,extra)` → `translate(-50%,-50%) rotate(r deg) scale(sc)`; `oldLines(segs,on)` → líneas `#3D7BFF`, `strokeWidth 1.5`, sin círculos, `opacity` con delay fijo `.55s`. `OLD_CORE` = bg `#0047FF`, fg `#FFFFFF`, bd `1px solid #0047FF`; `OLD_FADED` = bg transparent, fg `#9A9A96`, bd `1px dashed #C4C4BF`. Aquí los nodos **se desplazan** (transición `left/top .9s`).

**Diagrama 1** — «Fragmentado» → «Conectado»; «Información y conocimiento dispersos.» → «Sistemas y conocimiento sobre una misma base.»
- 7 fuentes `src` (ERP, CRM, Planillas, WhatsApp, Mails, Documentos, Personas). Sin: dispersas y rotadas en (24,18,−6°), (72,14,5°), (80,42,9°), (24,50,−4°), (66,82,−8°), (24,84,6°), (54,48,3°). Con: anillo de radio 33 alrededor de (50,50), empezando arriba (ángulo `i/7·2π − π/2`).
- «Tu empresa» (50,50) estilo `OLD_CORE`, escala 1/.4, opacidad 1/0.
- Líneas: del centro (50,50) a cada punto del anillo.

**Diagrama 2** — «Genérico» → «Contextualizado»; «La IA conoce el modelo, no tu empresa.» → «La IA entiende procesos, reglas y realidad operativa.»
- Conocimiento: Procesos, Reglas, Clientes, Precios, Excepciones. Con: apilados en x=50, y = 40/51/62/73/84, `src`, `wd 52%`. Sin: `OLD_FADED`, dispersos en (20,64,−5°), (52,76,4°), (80,60,7°), (28,90,3°), (74,90,−4°).
- Nodo superior (50,18): con «IA + Nocti» (`OLD_CORE`, `wd 52%`); sin «IA genérica» (`dark`).
- Línea: (50,18→50,84).

**Diagrama 3** — «Aislado» → «Coordinado»; «Personas, sistemas y agentes trabajan por separado.» → «Personas y agentes trabajan sobre el mismo contexto.»
- Personas `src` Ventas, Finanzas, Operaciones: con en fila (19,22), (50,22), (81,22); sin en (22,18,−4°), (78,22,5°), (24,70,3°).
- Agentes `agent` «Agente comercial», «Agente de cobranzas»: con (30,48), (70,48); sin (72,78,−6°), (56,46,4°).
- «Contexto compartido · Nocti» (50,80) `OLD_CORE`, `wd 86%`, escala 1/.6, opacidad 1/0.
- Líneas: de cada posición de fila (personas y agentes) hacia y=80.

### 9.13 `TEXTURES` (L638–647)
| opción | background-image | size | attachment |
|---|---|---|---|
| Ninguna | none | auto | scroll |
| Tramado animado (default) | none (+ canvas animado) | auto | scroll |
| Tramado fino | `radial-gradient(circle, rgba(11,11,12,.085) .6px, transparent .9px)` + SVG feTurbulence (240×240, baseFrequency .9, 2 octavas, alfa .55, opacity .4) | `4px 4px, 240px 240px` | `fixed, scroll` |
| Grano | SVG feTurbulence 220×220 (baseFrequency .85, alfa .5, opacity .55) | `220px 220px` | scroll |
| Puntos | `radial-gradient(circle, rgba(11,11,12,.13) 1px, transparent 1.4px)` | `18px 18px` | fixed |
| Constelación | SVG 320×320 generado (`constellationTile()`: 22 puntos pseudoaleatorios seed 7; líneas `#0047FF` opacidad .16; puntos `#0B0B0C` .16 r 1.1 o `#0047FF` .35 r 1.8) | `320px 320px` | fixed |
| Grilla | `linear-gradient(rgba(11,11,12,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(11,11,12,.055) 1px, transparent 1px)` | `56px 56px` | fixed |
| Puntos + grano | `radial-gradient(circle, rgba(11,11,12,.11) 1px, transparent 1.4px)` + SVG grano (opacity .45) | `18px 18px, 220px 220px` | `fixed, scroll` |

### 9.14 Estado inicial del componente Web (L657)
`{ hc:null, hs:null, opt:2, top:true, page:'home', menu:null, mnav:false, con:false, role:'ceo', sent:false, filter:'Todos', ind:1, w:1200 }`.

---

## 10. Interactividad que requiere JS (páginas; sin header/footer)

| # | Comportamiento | Dónde | Estado/handlers | Complejidad | ¿Depende de Nocti App v2? |
|---|---|---|---|---|---|
| 1 | Router de páginas por estado (7 páginas) + scroll a ancla con offset −84 px a los 30 ms | global | `page`, `go()`, `g()` | media (sin URL/hash: no hay deep-link ni botón atrás) | no |
| 2 | Variables responsivas `--edge/--display/--h2` según ancho del root < 1000 px (ResizeObserver) | global | `w`, `rootRef`, `applyVars()` | baja (reemplazable por media queries) | no |
| 3 | Textura animada de fondo (canvas Bayer, ~16 fps, respeta reduced-motion) | global | `texRef`, props `tex*` | media | no |
| 4 | Video hero autoplay/loop con poster | Home 1.1 | — (HTML) | baja | no |
| 5 | Alternancia automática Sin/Con Nocti cada 3600 ms (sólo en Home, se detiene para siempre al primer clic manual) | Home 1.2 | `con`, `setInterval`, `this.paused`, `setSin/setCon` | media | no |
| 6 | Diagramas animados (nodos absolutos con transiciones, líneas SVG con delays escalonados) | Home 1.2 | `diagrams(con)` | alta | no |
| 7 | Selector «Opción 1 / Opción 2» del diagrama (cambia de set y muestra/oculta cierre) | Home 1.2 | `opt`, `optTabs`, `showClose2`, `closeOp`, `closeTf` | media (alta si se mantienen ambos sets) | no |
| 8 | Tabs de rol + rotación automática de rol al terminar cada chat | Home 1.3 | `role`, `roleTabs`, `nextRole` ↔ `onChatDone` | media | **sí** |
| 9 | Chat animado por rol (tipeo, «Consultando contexto», fuentes, respuesta por ítems) y panel lateral de permisos | Home 1.3 | dentro de la App | alta | **sí** |
| 10 | Tarjetas de capacidades con hover (oscurecer, elevar, desplegar ejemplo) | Home 1.4 | `hc`, `c.enter/leave` | baja | no |
| 11 | Tarjetas de pasos con hover y 04 oscura por defecto | Home 1.5 | `hs`, `s.enter/leave` | baja | no |
| 12 | Tabs de industria con cambio de foto, título y bajada | Home 1.6 | `ind`, `indTabs` | baja | no |
| 13 | Demo general navegable (7 vistas por sidebar, conversaciones fijadas) | Producto 2.2 | App | alta | **sí** |
| 14 | Demo Cerebro con chips «Ver como» y panel de permisos en línea | Producto 2.4 | App | alta | **sí** |
| 15 | Demo Inteligencia: gráfico de barras + «Ver transacciones» (tabla desplegable) | Producto 2.4 | App `drill` | media | **sí** |
| 16 | Demo Agentes: lista → detalle con flujo animado (SVG dash-offset), aprobar/desaprobar; «Crear / Integrar» navega a Hablemos | Producto 2.4 | App `agentOpen`, `agentAppr`, `onNewAgent` | alta | **sí** |
| 17 | Demo Control: Aprobar / Rechazar / Deshacer la OC-4471 | Producto 2.5 | App `appr` | baja | **sí** |
| 18 | Filtros de Insights (oculta destacado, filtra por categoría) | Insights 5.2 | `filter`, `filters`, `showFeatured`, `articleList` | baja | no |
| 19 | Formulario de contacto con estado enviado/reset (sin envío real) | Hablemos 7.1 | `sent`, `send`, `resetSend` | baja hoy; media si se conecta a backend + validación | no |
| 20 | Esfera 3D en canvas | (no usada) | `canvasRef`, `sphere` | alta | no |

---

## 11. Inconsistencias y huecos

**Decisiones de diseño sin cerrar**
1. Pill «Comparar · Opción 1 / Opción 2» (L94) es un control de revisión de diseño visible en producción (borde punteado azul). Default = Opción 2. Hay que decidir una y borrar la otra (`diagramsOld` + su rama).
2. Prop `texture` con 8 opciones de fondo y 9 parámetros de tramado: herramienta de exploración; fijar una (hoy «Tramado animado» con los defaults listados).
3. Prop `device` Desktop/Mobile (marco de 390 px) es sólo de preview.
4. La App trae `conexVersion` (Lista/Centro) con tabs visibles dentro de la vista Conexiones, y una variante `v3` (malla) inalcanzable (`if (cv === 'v3') cv = 'v1'`).

**Páginas que reutilizan otras / navegación que no lleva a donde dice**
5. Hay una sola página de industria (Retail). «Conocer más →» en Home (con cualquier industria seleccionada; por defecto está seleccionada **Manufactura**, `ind:1`), los ítems de industria del mega-menú/footer y los botones «Otras industrias» llevan todos a la página de Retail.
6. Hay un solo artículo: el destacado, las 5 tarjetas y los 2 «Seguir leyendo» abren el mismo texto («El contexto es el nuevo sistema operativo…»). Los artículos 1–5 no tienen cuerpo ni bajada (`d`).
7. El índice «En este artículo» no tiene anclas (son `<span>`).
8. Navegación sólo por estado: sin URLs/hash, sin historial (el botón atrás del navegador sale del sitio), sin deep-links a `#agentes`, etc.

**Contenido placeholder / faltante**
9. Equipo: 4× «Nombre Apellido» y 4 image-slots `team-1…4` vacíos (placeholder «Retrato»).
10. Fotos de industria faltantes: Retail (`ind-0`, usada en Home y en el hero de Industria) y Servicios (`ind-4`) sin `src`. No existe `.image-slots.state.json` en la carpeta de deploy, así que se ven placeholders.
11. Formulario: no envía nada, no valida, no captura valores; sin `name`, `placeholder`, `required`, ni manejo de error. Campo «Rol» es texto libre.
12. Fechas de artículos (jul–sep 2026) y «8 min de lectura» son ficticias/ilustrativas.
13. Botones sin acción en la App: «Ver análisis», el botón de acción de cada respuesta (`ans.action`), «Crear alerta», «+ Conectar fuente», el secundario del detalle de agente (`btn2`), y el menú de usuario (Ajustes/Idioma/Ayuda/Cerrar sesión sólo cierran el menú).

**Textos de ejemplo de la maqueta**
14. Empresa ficticia «Distribuidora Andes» (sidebar y tarjeta de usuario de la App), personas «Laura Méndez», «Jorge Rodríguez», «Silvana Pérez», «Martín (Comercial)», «Carla Ruiz (Finanzas)», clientes «Supermercados Delta», «Almacén Rivera», «Mayorista El Sur», «Ferretería Norte», «Distribuidora Norte», «Distribuidora Litoral», proveedor «Plastar S.A.», OC «OC-4471», SKU 4410, facturas FA-209xx. Avatares reales de `i.pravatar.cc` (fotos de terceros).
15. Rubro de la maqueta: envases plásticos/resina (distribuidora de envases), mientras la página de industria es «Retail y distribución» genérico.

**Inconsistencias de copy/datos**
16. Terminología: Home y Nosotros dicen «cerebro **operativo**»; el hero de Producto dice «cerebro **organizacional**»; el h1 del Home usa `font-weight:400` y los demás h1 `500`.
17. Saludo de la App: «Buenos días, {nombre}.» en Inicio y «Buenas tardes, {nombre}.» en Preguntar; con rol agentes, Inicio dice «Buenos días, Agente.».
18. Umbral de aprobación de compras: vista Control «límite de $10.000.000»; tabla Permisos «Compras > $10 M»; flujo del Agente de compras «compras sobre $15 M → aprobación de Finanzas».
19. Conteos: KPI «Aprobaciones 2» y badge de nav Control «2» vs. «1 aprobación pendiente» en Control; actividad «Agente de cobranzas envió 12 recordatorios» vs. 38 recordatorios en el flujo; CEO «$41,2 M vencidos a más de 30 días» vs. agente «$48,2 M» de facturas vencidas; «Supermercados Delta» −28% (rol Comercial) vs. −32% (conversación «Clientes para contactar»).
20. Chips de Producto/Cerebro dicen «Ver como» para comparar (caption), pero en Home se ocultan (`hide-role-chips`) y el cambio de rol se hace con tabs externas: dos patrones para lo mismo.

**Huecos de layout/accesibilidad**
21. Overview: conectores en `repeat(3, …)` fijo mientras las tarjetas pasan a 1 columna en mobile → líneas desalineadas. Igual la grilla de capas de Control (3 columnas fijas en mobile, texto de hasta 21 px).
22. h2 del bloque «Antes y después» (`morphTitle`) con `white-space:nowrap` y `min(var(--h2),5.4vw)`: en mobile queda chico (≈ 20 px a 375 px).
23. Hover-only en capacidades y pasos: el ejemplo no es accesible en táctil ni por teclado.
24. Video hero, diagramas, chat de la App y animaciones SVG no respetan `prefers-reduced-motion` (sólo la textura y la esfera lo hacen).
25. El panel lateral de permisos de la Home (`perms-side`) se posiciona por medición de `window.innerWidth − rect.right` y puede salirse del contenedor de 1200 px hacia el margen; con poco espacio cae debajo del embed.
26. `on-chat-done` no está declarado en los `data-props` de la App (se usa como `this.props.onChatDone`).
27. Código/valores muertos: esfera (`sphere`, `makeSphere`, `canvasRef`), `SYSTEMS`, `ACCESS`, `ovCols`, `ovArrow`, `menu.title`, valores de header overlay (`hdrBg`, `hdrBlur`, `hdrFg`, `hdrMuted`, `hdrMark`, `inBg`, `inSh`, `ctaBg`, `ctaFg`); en la App `initials`, `crumb`, `syncText`, `nav[].dot`, `nodes[].tr/dot`, rama `conex.v3`, ternario redundante `i === 1 ? '✓' : '✓'`.
28. Image-slot `ind-0` duplicado entre Home y la página Industria (comparten persistencia; no colisionan en el DOM porque nunca se renderizan juntos).

---

## 12. Nocti App v2 (`Nocti App v2.dc.html`) — resumen

### 12.1 Props (`data-props`, App L417)
| prop | tipo | default | uso en la web |
|---|---|---|---|
| `view` | enum inicio/cerebro/inteligencia/agentes/control/fuentes/permisos | `inicio` | sí: `cerebro` (Home), `inicio`, `cerebro`, `inteligencia`, `agentes`, `control` (Producto). `fuentes` y `permisos` sólo vía sidebar. |
| `role` | enum ceo/comercial/operaciones/agentes | `ceo` | sí, sólo Home (`{{role}}`) |
| `hideRoleChips` | bool | false | Home: `true` |
| `minHeight` | text | `560px` | no (queda 560px) |
| `hidePerms` | bool | false | no |
| `permsSide` | bool | false | Home: `true` |
| `conexVersion` | enum v1/v2 | `v1` | no |
| `onNewAgent` | `() => void` | — | todas: `goHablemos` |
| `onChatDone` | (no declarado) | — | Home: `nextRole` |

`$preview` 1100×620. `hint-size="100%,560px"` en todos los embeds.

### 12.2 Estructura y layout
- Root App L15: `background:#F6F6F4; border:1px solid #E2E2DE; border-radius:24px; display:flex; flex-direction: row (wide) | column (narrow); min-height:560px; font-size:13px; line-height:1.45; overflow:hidden`; tokens `--color-text #0B0B0C`, `--color-bg #FFFFFF`, `--color-surface #F4F4F2`, `--color-divider #E2E2DE`, `--color-neutral-200 #EDEDEA`, `-300 #E6E6E2`, `-400 #C9C9C4`, `-700 #6B6B68`, `-800 #3A3A38`.
- `wide = w >= 720` (ancho propio, ResizeObserver). Wide: sidebar 216 px (App L16–42) con logo «Nocti», selector de empresa «Distribuidora Andes», nav de 7 vistas con íconos y contadores (`COUNTS`: Agentes 3, Operaciones/Control 2, Conexiones 6), grupos de chats «Fijados»/«Recientes» (`CONVOS`), y tarjeta de usuario con menú (Ajustes, Idioma «Español», Ayuda, Cerrar sesión; cierra con clic afuera o Escape). Narrow: barra de tabs horizontal con scroll (App L43–49). Padding del contenido `18px 20px` / `14px`.
- Labels de nav (`VIEWS`): Inicio · Preguntar · Inteligencia · Agentes · Operaciones / Control · Conexiones · Permisos.

### 12.3 Vistas (líneas de plantilla aprox.)
| view | líneas | contenido | estados interactivos |
|---|---|---|---|
| `inicio` | App L53–81 (≈29) | «Buenos días, {nombre}.», 4 KPIs, «Requiere tu atención» (4 ítems con tags semánticos), «Preguntas sugeridas» (3), «Actividad reciente» (3) | ninguno (las sugeridas no son clicables) |
| `cerebro` («Preguntar») | App L83–167 (≈85) + panel lateral L397–413 (≈17) | chips «Ver como» (4 roles), pill de usuario+rol, «Conexiones»; héroe «Buenas tardes, {nombre}.» / «¿Qué querés saber de la empresa hoy?»; compositor con tipeo animado, chips «Área: Todas» / «Período: según la pregunta», botón enviar; 4 tarjetas de sugerencias (`SUGG`); conversación: burbuja de pregunta con avatar, bloque «Consultando contexto · {rol}» con fuentes apareciendo, respuesta de Nocti con ítems numerados, «Conexiones» y botones; panel «Permisos de este rol» (✓ ve / ✕ oculto) + «Contexto consultado» (`brainMap`, con «Sistemas» por rol) en línea (≥ 860 px) o lateral (`permsSide`) | `role`, `convo` (5 conversaciones de sidebar), animación `c` (`typed, showQ, thinking, src, showA, items, foot, pulse`), `onChatDone` |
| `inteligencia` | App L169–205 (≈37) | «Inteligencia» / «Margen bruto · últimas 8 semanas»; pregunta «¿Por qué cayó el margen esta semana?»; gráfico de 8 barras (S1–S8, 26–32 % normalizado, S8 en `#0038CC`), «28,2%» «−3,2 pp» (`#AE1800`); 3 causas; segmentos; conexiones; «Ver transacciones →» / «Crear alerta»; tabla de 5 facturas | `drill` (toggle tabla, label «Ver transacciones →» ↔ «Ocultar transacciones») |
| `agentes` | App L207–287 (≈81) | Lista: «Agentes» / «2 activos · 1 pausado», 3 tarjetas (cobranzas, comercial, compras) + «Crear / Integrar»; log «Agente de cobranzas · últimas tareas». Detalle: «← Agentes», título, descripción, pill de estado; lienzo de flujo 800×430 (5 columnas, 10 tarjetas con logos simpleicons o íconos, curvas SVG punteadas animadas por `stroke-dashoffset`); panel de aprobación (resumen, tabla acción/unidad/monto, nota, botón aprobar + secundario); «Resultado de la corrida» (4 stats) | `agentOpen` (lista ↔ detalle), `agentAppr[k]` (toggle aprobado: tarjetas `appr`→«Aprobada», `wait`→«En curso», líneas a verde, pill «Aprobado · ejecutando acciones», botón «Aprobado ✓» verde), `newAgent` → `onNewAgent` |
| `control` («Operaciones») | App L289–313 (≈25) | «Operaciones» / «1 aprobación pendiente»; tarjeta OC-4471 · Plastar S.A. · $18.400.000 con regla y fuentes; Aprobar/Rechazar; tabla de trazabilidad (5 filas) | `appr`: pending → approved («Aprobada · ejecutándose», «Aprobada por Carla Ruiz (Finanzas) a las 10:07. La orden se envía al ERP.») / rejected («Rechazada · no se ejecutó», «Rechazada por Carla Ruiz (Finanzas). El agente registró el motivo.»); «Deshacer» |
| `fuentes` («Conexiones») | App L315–380 (≈66) | «Conexiones», tabs «Lista»/«Centro», «+ Conectar fuente»; Lista: tabla de 8 fuentes (tipo, registros, sincronización, estado Conectado/Revisar); Centro: diagrama hub 700×420 (6 sistemas a la izquierda con logos simpleicons → «Contexto» «6 sistemas / 64 reglas con fuente» → 4 usos a la derecha) con curvas animadas; (malla v3 inalcanzable con puntos `animateMotion` y núcleo pulsante) | `conexV` (v1/v2) |
| `permisos` | App L382–392 (≈11) | «Permisos» / «Aplican a personas y agentes por igual»; tabla de 5 roles × (Puede ver, Puede consultar, Puede ejecutar, Requiere aprobación) | ninguno |

Script de la App: App L417–646 (≈230 líneas): constantes `VIEWS`, `ICONS`, `SYSICON`/`sysIcon`, `FLOWS` (3 flujos de agentes), `FICON`, `FCOLS`, `PEOPLE`, `PUESTO`, `CONVOS` (5), `COUNTS`, `SUGG`, `SYS`, `NAMES`, `ROLES` (4 respuestas por rol), `D` (datos de todas las vistas), `SEM` (colores semánticos warn `#F6EBD3/#9A6A0E`, danger `#F8DED8/#AE1800`, info `#DDF1EE/#0038CC`, success `#DDEEE3/#2F7D52`).

### 12.4 Roles
| key | persona | puesto | avatar | pregunta por defecto |
|---|---|---|---|---|
| `ceo` | Laura Méndez | CEO | `https://i.pravatar.cc/96?img=47` | «¿Cómo viene el negocio hoy y qué debería mirar?» |
| `comercial` | Jorge Rodríguez | Comercial | `https://i.pravatar.cc/96?img=12` | «¿Qué clientes debería contactar hoy y por qué?» |
| `operaciones` | Silvana Pérez | Operaciones | `https://i.pravatar.cc/96?img=44` | «¿Qué está frenando la operación hoy?» |
| `agentes` | Agente de cobranzas | Agente | (ícono de bot azul `#0047FF`) | «¿Qué facturas vencidas tengo que gestionar hoy?» |

### 12.5 Qué anima
- **Chat** (`runChat`, App L525–539): arranca a 500 ms; tipea la pregunta a 28 ms/carácter (+30 ms en espacios) con caret azul; +450 ms muestra la burbuja; +350 ms «Consultando contexto» con punto que pulsa cada 380 ms (opacidad 1 ↔ .25, transición .35 s); cada fuente +380 ms; +650 ms respuesta; cada ítem +520 ms; +450 ms pie (conexiones + botones); +5200 ms → `onChatDone()` (Home: cambia de rol) o, si no hay handler, se reinicia en loop. Disparo: `IntersectionObserver` (threshold .35) o fallback a 2,5 s del mount; sólo corre en la vista `cerebro`; se relanza al cambiar rol o vista.
- **Flujos de agentes**: `<animate attributeName="stroke-dashoffset" values="12;0">` en curvas punteadas (`2 4`), duraciones 1–1,45 s; transiciones de opacidad/borde .4 s en tarjetas.
- **Centro de conexiones**: dash-offset `14;0` en curvas (`3 4`), 1–1,6 s.
- **Malla v3** (inalcanzable): líneas punteadas animadas, puntos `animateMotion`, núcleo con `r` 34↔40 y opacidad del trazo, 3 s.
- Hover en tarjetas de agentes (borde `#A9C4FF`, fondo blanco, .15 s).
- **Reduced motion**: la App no lo respeta en ningún lado.

### 12.6 Dependencias externas
- Google Fonts Geist Mono (igual que la web).
- `i.pravatar.cc` (3 avatares).
- `cdn.simpleicons.org/{slug}`: `sap`, `hubspot`, `whatsapp`, `gmail`, `googlesheets`, `googledrive` (flujos de agentes y vista Centro).
- Runtime `support.js` (DCLogic, `sc-if`, `sc-for`, `dc-import`, `style-hover`, `style-focus`, `sc-raw-select`) e `image-slot.js` (sólo la web).

### 12.7 Qué usa la web de la App
- 6 embeds: Home (cerebro, con `role`, `hide-role-chips`, `perms-side`, `on-chat-done`, `on-new-agent`) y Producto ×5 (inicio, cerebro, inteligencia, agentes, control; sólo `view` + `on-new-agent`).
- Cada embed es una app completa e independiente (estado propio; desde cualquiera se puede navegar a las 7 vistas).
- Integración web ↔ App: `onNewAgent` (App → web: navegar a Hablemos), `onChatDone` (App → web: siguiente rol), `role` (web → App: resetea `convo` y relanza el chat).
