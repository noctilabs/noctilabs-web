// Montaje «Preguntá. Entendé. Actuá.» del home (spec 007 §3.B, `Home Montage.dc.html` de la v4).
//
// Línea de tiempo: tres actos de 8000, 8000 y 9000 ms de diseño, reproducidos a 1,2× como el `montageSpeed` por defecto
// de la v4 (≈ 6,7 + 6,7 + 7,5 s). El acto activo corre desde 0; los demás quedan en su estado final mientras se desvanecen.
//
// Contrato del marcado (los estilos los pone Montage.astro):
//   [data-mtg]                    raíz; data-held mientras está pausado con el botón; data-auto con avance automático.
//     [data-act=<k>]              un acto; data-cur en el activo.
//       [data-at=<ms>][data-to]   se enciende (data-on) cuando at ≤ t < to.
//       [data-steps="ms:s,…"]     data-s = el último estado cuyo ms ≤ t (o 'p' antes del primero).
//       [data-draw="desde,dur"]   path con pathLength 100: el trazo se dibuja entre desde y desde + dur.
//       [data-type][data-q]       barra del chat: escribe data-q entre 400 y 2000 ms, con data-on mientras escribe.
//       [data-who=<i>]            en el acto 0, quien pregunta (alterna en cada vuelta); data-cur en el visible.
//     button[data-seg=<k>] > [data-seg-bar]   segmentos con su barra de progreso (scaleX).
//     button[data-role=<rol>]     «Ver como»: salta al acto de ese rol; aria-pressed sigue al acto en curso.
//     button[data-mtg-toggle][data-label-pause][data-label-play]   pausa visible (WCAG 2.2.2).
//     [data-stage]                el escenario: su alto mínimo es el del acto más alto en su estado final.
//
// Comportamiento (F5): con reduced motion no avanza ni anima; cada acto se ve en su estado final y los segmentos y
// «Ver como» eligen cuál. Sin reduced motion avanza solo mientras al menos el 30 % está en pantalla; el botón lo pausa y,
// en pausa, elegir un acto lo muestra completo.

export const DUR = [8000, 8000, 9000] as const;
const SPEED = 1.2;
const TYPE_FROM = 400;
const TYPE_DUR = 1600;
const SENT = 2300;

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

type Role = 'ceo' | 'comercial' | 'operaciones' | 'agentes';
const roleOf = (act: number, who: number): Role => (act === 0 ? (who ? 'operaciones' : 'comercial') : act === 1 ? 'ceo' : 'agentes');

export function initMontage(root: HTMLElement): void {
  const stage = root.querySelector<HTMLElement>('[data-stage]')!;
  const acts = [...root.querySelectorAll<HTMLElement>('[data-act]')];
  const whos = [...root.querySelectorAll<HTMLElement>('[data-who]')];
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

  let act = 0;
  let t: number = DUR[0];
  let who = 0;
  let held = false;
  let vis = false;
  let last = 0;
  let raf = 0;

  const moving = () => !reduce.matches && !held && vis;

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
    segs.forEach((s, k) => {
      s.toggleAttribute('data-cur', k === act);
      if (k === act) s.setAttribute('aria-current', 'step');
      else s.removeAttribute('aria-current');
      const w = k < act ? 1 : k === act ? t / DUR[k]! : 0;
      bars[k]!.style.transform = `scaleX(${w.toFixed(4)})`;
    });
    const r = roleOf(act, who);
    roles.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.role === r)));
  }

  function frame(now: number): void {
    raf = 0;
    if (!moving()) return;
    // Un salto largo (pestaña en segundo plano) no adelanta el montaje.
    t += Math.min(now - last, 100) * SPEED;
    last = now;
    if (t >= DUR[act]!) {
      t = 0;
      act = (act + 1) % 3;
      if (act === 0) who = 1 - who;
    }
    paint();
    raf = requestAnimationFrame(frame);
  }

  function sync(): void {
    root.toggleAttribute('data-auto', !reduce.matches);
    root.toggleAttribute('data-held', held);
    toggle.hidden = reduce.matches;
    toggle.setAttribute('aria-label', (held ? toggle.dataset.labelPlay : toggle.dataset.labelPause) ?? '');
    if (moving() && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (!moving() && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  function go(k: number, w = who): void {
    act = k;
    who = w;
    // En movimiento el acto arranca desde cero; quieto (pausa o reduced motion) se ve completo.
    t = reduce.matches || held ? DUR[k]! : 0;
    last = performance.now();
    paint();
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

  segs.forEach((s, k) => s.addEventListener('click', () => go(k)));
  roles.forEach((b) => b.addEventListener('click', () => {
    const r = b.dataset.role as Role;
    if (r === 'comercial') go(0, 0);
    else if (r === 'operaciones') go(0, 1);
    else go(r === 'ceo' ? 1 : 2);
  }));
  toggle.addEventListener('click', () => { held = !held; sync(); });
  reduce.addEventListener('change', () => { go(act); sync(); });

  let width = 0;
  new ResizeObserver(([e]) => {
    const w = Math.round(e!.contentRect.width);
    if (w !== width) { width = w; measure(); }
  }).observe(stage);
  document.fonts?.ready.then(measure);
  new IntersectionObserver(([e]) => { vis = e!.isIntersecting; sync(); }, { threshold: 0.3 }).observe(stage);

  // El SSR deja el acto 1 completo (sin JS o con reduced motion se ve así); en movimiento arranca desde cero.
  measure();
  go(0, 0);
  sync();
}
