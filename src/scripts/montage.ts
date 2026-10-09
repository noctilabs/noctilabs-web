// Montaje «Preguntá. Entendé. Actuá.» del home (spec 007 §3.B, `Home Montage.dc.html` de la v4; tiempos del spec 010).
//
// Línea de tiempo: tres actos de 10000, 11900 y 10700 ms reales (sin el 1,2× del diseño, spec 010 H4): cada acto termina
// quieto el tiempo de leerlo. El acto activo corre desde 0; los demás quedan en su estado final mientras se desvanecen.
//
// Contrato del marcado (los estilos los pone Montage.astro):
//   [data-mtg]                    raíz; data-held mientras está pausado con el botón; data-auto con avance automático.
//     [data-act=<k>]              un acto; data-cur en el activo; data-still mientras se repinta desde cero.
//       [data-at=<ms>][data-to]   se enciende (data-on) cuando at ≤ t < to.
//       [data-steps="ms:s,…"]     data-s = el último estado cuyo ms ≤ t (o 'p' antes del primero).
//       [data-draw="desde,dur"]   path con pathLength 100: el trazo se dibuja entre desde y desde + dur.
//       [data-type][data-q]       barra del chat: escribe data-q entre 150 y 1350 ms, con data-on mientras escribe.
//       [data-who=<i>]            en el acto 0, quien pregunta (alterna en cada vuelta); data-cur en el visible.
//     [data-cap=<k>]              la línea de texto de cada acto; data-cur en la del acto en curso.
//     button[data-seg=<k>] > [data-seg-bar]   segmentos con su barra de progreso (scaleX).
//     button[data-role=<rol>]     «Ver como»: reproduce el acto de ese rol; aria-pressed sigue al acto en curso.
//     button[data-mtg-toggle][data-label-pause][data-label-play]   pausa visible (WCAG 2.2.2).
//     [data-stage]                el escenario: su alto mínimo es el del acto más alto en su estado final.
//
// Comportamiento (F5 y spec 010 §3.C): con reduced motion no avanza ni anima; cada acto se ve en su estado final y los
// segmentos y «Ver como» eligen cuál. Sin reduced motion avanza solo mientras al menos el 30 % está en pantalla. Elegir
// un acto (rol o segmento) lo reproduce desde cero y, al terminar, queda quieto con «Reanudar» (`picked`); en pausa,
// elegir un acto lo muestra completo. Prioridad: reduced motion, después la pausa, después la reproducción normal.

export const DUR = [10000, 11900, 10700] as const;
const TYPE_FROM = 150;
const TYPE_DUR = 1200;
const SENT = 1500;

/** Estado de un [data-steps] en el tiempo t. */
export function stepAt(steps: string, t: number): string {
  let s = 'p';
  for (const part of steps.split(',')) {
    const [ms, name] = part.split(':');
    if (Number(ms) <= t) s = name!;
  }
  return s;
}

/** Si un [data-at][data-to] está encendido en el tiempo t. */
export const isOn = (at: number, to: number | undefined, t: number) => at <= t && (to === undefined || t < to);

/** El acto que sigue a `act`; al volver al acto 0 alterna quién pregunta. */
export function nextAct(act: number, who: number): { act: number; who: number } {
  const k = (act + 1) % 3;
  return { act: k, who: k === 0 ? 1 - who : who };
}

/** «Reanudar» pasa al acto siguiente sólo si el acto elegido ya terminó; a mitad de acto sigue desde t. */
export const resumeAdvances = (picked: boolean, act: number, t: number) => picked && t >= DUR[act]!;

type Role = 'ceo' | 'comercial' | 'operaciones' | 'agentes';
const roleOf = (act: number, who: number): Role => (act === 0 ? (who ? 'operaciones' : 'comercial') : act === 1 ? 'ceo' : 'agentes');

export function initMontage(root: HTMLElement): void {
  const stage = root.querySelector<HTMLElement>('[data-stage]')!;
  const acts = [...root.querySelectorAll<HTMLElement>('[data-act]')];
  const whos = [...root.querySelectorAll<HTMLElement>('[data-who]')];
  const caps = [...root.querySelectorAll<HTMLElement>('[data-cap]')];
  const segs = [...root.querySelectorAll<HTMLButtonElement>('[data-seg]')];
  const bars = segs.map((s) => s.querySelector<HTMLElement>('[data-seg-bar]')!);
  const roles = [...root.querySelectorAll<HTMLButtonElement>('[data-role]')];
  const toggle = root.querySelector<HTMLButtonElement>('[data-mtg-toggle]')!;
  const per = acts.map((a) => ({
    at: [...a.querySelectorAll<HTMLElement>('[data-at]')],
    steps: [...a.querySelectorAll<HTMLElement>('[data-steps]')],
    draw: [...a.querySelectorAll<SVGPathElement>('[data-draw]')],
    type: [...a.querySelectorAll<HTMLElement>('[data-type]')],
  }));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  // Último valor visto de reduced motion. Chrome no dispara 'change' si algo leyó `matches` después del cambio y antes
  // de evaluarlo (lo lee cada cuadro), así que el cambio también se detecta al leerlo (`checkReduce`).
  let rm = reduce.matches;

  let act = 0;
  let t: number = DUR[0];
  let who = 0;
  let held = false;
  // El acto en curso lo eligió el usuario; `ended` marca la pausa que puso el final de esa elección (no la del usuario).
  let picked = false;
  let ended = false;
  let vis = false;
  let last = 0;
  let raf = 0;

  const moving = () => !rm && !held && vis;

  function paintAct(k: number, tk: number): void {
    const p = per[k]!;
    for (const el of p.at) {
      const to = el.dataset.to;
      el.toggleAttribute('data-on', isOn(Number(el.dataset.at), to === undefined ? undefined : Number(to), tk));
    }
    for (const el of p.steps) el.dataset.s = stepAt(el.dataset.steps!, tk);
    for (const el of p.draw) {
      const [from, dur] = el.dataset.draw!.split(',').map(Number) as [number, number];
      const lp = Math.max(0, Math.min(1, (tk - from) / dur));
      el.style.strokeDashoffset = String(100 - lp * 100);
    }
    for (const el of p.type) {
      const q = el.dataset.q!;
      const n = Math.round(Math.max(0, Math.min(1, (tk - TYPE_FROM) / TYPE_DUR)) * q.length);
      const typing = tk < SENT && n > 0;
      el.toggleAttribute('data-on', typing);
      const txt = el.querySelector<HTMLElement>('[data-type-text]')!;
      const next = typing ? q.slice(0, n) : el.dataset.placeholder!;
      if (txt.textContent !== next) txt.textContent = next;
    }
  }

  function paint(): void {
    acts.forEach((a, k) => {
      a.toggleAttribute('data-cur', k === act);
      paintAct(k, k === act ? t : DUR[k]!);
    });
    whos.forEach((w, i) => w.toggleAttribute('data-cur', i === who));
    caps.forEach((c, k) => c.toggleAttribute('data-cur', k === act));
    segs.forEach((s, k) => {
      s.toggleAttribute('data-cur', k === act);
      if (k === act) s.setAttribute('aria-current', 'step');
      else s.removeAttribute('aria-current');
      const w = k < act ? 1 : k === act ? Math.min(1, t / DUR[k]!) : 0;
      bars[k]!.style.transform = `scaleX(${w.toFixed(4)})`;
    });
    const r = roleOf(act, who);
    roles.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.role === r)));
  }

  function frame(now: number): void {
    raf = 0;
    if (reduce.matches !== rm) return checkReduce();
    if (!moving()) return;
    // Un salto largo (pestaña en segundo plano) no adelanta el montaje.
    t += Math.min(now - last, 100);
    last = now;
    if (t >= DUR[act]!) {
      if (picked) {
        // H1: la elección del usuario termina quieta en su estado final, con «Reanudar».
        t = DUR[act]!;
        held = true;
        ended = true;
        paint();
        sync();
        return;
      }
      const n = nextAct(act, who);
      start(n.act, n.who);
    } else paint();
    raf = requestAnimationFrame(frame);
  }

  function sync(): void {
    root.toggleAttribute('data-auto', !rm);
    root.toggleAttribute('data-held', held);
    toggle.hidden = rm;
    toggle.setAttribute('aria-label', (held ? toggle.dataset.labelPlay : toggle.dataset.labelPause) ?? '');
    if (moving() && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (!moving() && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  /** Arranca el acto k desde cero con su estado inicial pintado sin transiciones (§3.B); el fundido del acto sí corre. */
  function start(k: number, w: number): void {
    act = k;
    who = w;
    t = 0;
    last = performance.now();
    const el = acts[k]!;
    el.setAttribute('data-still', '');
    paint();
    void el.offsetHeight;
    el.removeAttribute('data-still');
  }

  /** Muestra el acto k completo (pausa o reduced motion). */
  function show(k: number, w: number): void {
    act = k;
    who = w;
    t = DUR[k]!;
    paint();
  }

  /** Clic en un rol o un segmento. */
  function pick(k: number, w: number): void {
    checkReduce();
    if (rm) return show(k, w);
    picked = true;
    if (held && !ended) return show(k, w);
    // Sin pausa, o quieto al final de una elección anterior: reproduce el nuevo acto desde cero.
    held = false;
    ended = false;
    start(k, w);
    sync();
  }

  // Alto del escenario: el del acto más alto con todo a la vista (data-measure abre el panel del chat sin transición).
  function measure(): void {
    root.setAttribute('data-still', '');
    root.setAttribute('data-measure', '');
    stage.style.minHeight = '';
    const h = stage.getBoundingClientRect().height;
    root.removeAttribute('data-measure');
    stage.style.minHeight = `${Math.ceil(h)}px`;
    void stage.offsetHeight;
    root.removeAttribute('data-still');
  }

  segs.forEach((s, k) => s.addEventListener('click', () => pick(k, who)));
  roles.forEach((b) => b.addEventListener('click', () => {
    const r = b.dataset.role as Role;
    if (r === 'comercial') pick(0, 0);
    else if (r === 'operaciones') pick(0, 1);
    else pick(r === 'ceo' ? 1 : 2, who);
  }));
  toggle.addEventListener('click', () => {
    checkReduce();
    if (held && resumeAdvances(picked, act, t)) {
      picked = false;
      held = false;
      const n = nextAct(act, who);
      start(n.act, n.who);
    } else held = !held;
    ended = false;
    sync();
  });
  function checkReduce(): void {
    if (reduce.matches === rm) return;
    rm = reduce.matches;
    if (rm) {
      // El botón se oculta: si tenía el foco, pasa al segmento del acto en curso.
      if (document.activeElement === toggle) segs[act]!.focus();
      if (picked) held = true;
      show(act, who);
    } else if (!held && !picked) start(act, who);
    sync();
  }
  reduce.addEventListener('change', checkReduce);

  let width = 0;
  new ResizeObserver(([e]) => {
    const w = Math.round(e!.contentRect.width);
    if (w !== width) { width = w; measure(); }
  }).observe(stage);
  document.fonts?.ready.then(measure);
  // isIntersecting es verdadero por debajo del umbral: el 30 % se comprueba con el ratio.
  new IntersectionObserver(([e]) => { vis = e!.isIntersecting && e!.intersectionRatio >= 0.3; sync(); }, { threshold: [0, 0.3] }).observe(stage);

  // El SSR deja el acto 1 completo (sin JS o con reduced motion se ve así); en movimiento arranca desde cero.
  measure();
  if (rm) show(0, 0);
  else start(0, 0);
  sync();
}
