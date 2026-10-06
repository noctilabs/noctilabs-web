// Diagrama de «Control y gobernanza», variante C de la v4 (diseño runArch / archPath, L1064 y L1428–1470).
//
// Elegir un control (compuerta del diagrama en escritorio, fila en mobile) recorre la OC-4471 desde el Agente de compras
// hasta esa compuerta: un paso cada 380 ms (≤ 2,7 s, no se repite solo). Las compuertas anteriores se encienden al
// pasar y al terminar se marca el destino (ERP en Permisos, Finanzas en Aprobaciones) y el efecto del control.
// El primer recorrido arranca cuando la tarjeta llega al 75 % de la pantalla. Con reduced motion no hay recorrido:
// se muestra el estado final. Sin JavaScript queda el SSR: Permisos, terminado.
//
// Marcado (Control.astro): raíz [data-arch][data-sel][data-done]; button[data-gate=i] y button[data-row=i] con
// aria-pressed; .pill[data-p=4] (Finanzas) y .pill[data-s=0] (ERP) con data-hl; [data-ib=i] y [data-sn=i] con hidden;
// #ctl-info y .snips con style.order para ubicarse debajo de la fila elegida en mobile; [data-appr] en la vista de
// aprobación, con sus botones [data-appr-set].
import { playIcon } from './nicon';

const STEP = 380;
/** Puntos del recorrido hasta la compuerta g (archPath): bajada, una compuerta por paso y el tramo final. */
const pathLen = (g: number) => 2 + (g + 1) + (g === 0 ? 2 : g === 2 ? 3 : 0);

export function initControlArch(root: HTMLElement): void {
  const gates = [...root.querySelectorAll<HTMLButtonElement>('[data-gate]')];
  const rows = [...root.querySelectorAll<HTMLButtonElement>('[data-row]')];
  const blocks = [...root.querySelectorAll<HTMLElement>('[data-ib]')];
  const snips = [...root.querySelectorAll<HTMLElement>('[data-sn]')];
  const info = root.querySelector<HTMLElement>('#ctl-info')!;
  const snipsBox = root.querySelector<HTMLElement>('.snips')!;
  const finanzas = [...root.querySelectorAll<HTMLElement>('.pill[data-p="4"]')];
  const erp = [...root.querySelectorAll<HTMLElement>('.pill[data-s="0"]')];
  const appr = root.querySelector<HTMLElement>('[data-appr]');
  const still = matchMedia('(prefers-reduced-motion: reduce)');

  let sel = 0;
  let pk = pathLen(0) - 1;
  let timer: ReturnType<typeof setInterval> | undefined;
  let started = false;

  function paint(): void {
    const last = pathLen(sel) - 1;
    const done = pk >= last;
    root.dataset.sel = String(sel);
    root.toggleAttribute('data-done', done);
    gates.forEach((g, i) => {
      const st = i === sel ? 'on' : i < sel && pk >= 2 + i ? 'past' : '';
      if (st) g.dataset.st = st; else delete g.dataset.st;
      g.setAttribute('aria-pressed', String(i === sel));
    });
    rows.forEach((r, i) => r.setAttribute('aria-pressed', String(i === sel)));
    blocks.forEach((b, i) => { b.hidden = i !== sel; });
    snips.forEach((s, i) => { s.hidden = i !== sel; });
    info.style.order = String(sel * 10 + 1);
    snipsBox.style.order = String(sel * 10 + 2);
    finanzas.forEach((p) => p.toggleAttribute('data-hl', done && sel === 2));
    erp.forEach((p) => p.toggleAttribute('data-hl', done && sel === 0));
  }

  function setAppr(v: string): void {
    if (appr) appr.dataset.appr = v;
  }

  function run(g: number): void {
    started = true;
    clearInterval(timer);
    sel = g;
    setAppr('');
    const last = pathLen(g) - 1;
    if (still.matches) { pk = last; paint(); return; }
    pk = 0;
    paint();
    const on = [gates[g], blocks[g]].map((el) => el?.querySelector<SVGSVGElement>('svg[data-nicon]'));
    on.forEach((svg) => svg && playIcon(svg));
    timer = setInterval(() => {
      if (pk >= last) { clearInterval(timer); return; }
      pk += 1;
      paint();
    }, STEP);
  }

  gates.forEach((b, i) => b.addEventListener('click', () => run(i)));
  rows.forEach((b, i) => b.addEventListener('click', () => {
    // La fila elegida se oculta y la reemplaza su detalle, en el mismo lugar de la pantalla; el foco pasa al detalle.
    const y = b.getBoundingClientRect().top;
    run(i);
    const dy = info.getBoundingClientRect().top - y;
    if (Math.abs(dy) > 1) window.scrollBy(0, dy);
    info.focus({ preventScroll: true });
  }));

  if (appr) {
    for (const b of appr.querySelectorAll<HTMLButtonElement>('[data-appr-set]')) {
      b.addEventListener('click', () => {
        const v = b.dataset.apprSet ?? '';
        setAppr(v);
        // El botón pulsado desaparece: el foco va al que lo reemplaza (Deshacer, o Aprobar al deshacer).
        appr.querySelector<HTMLButtonElement>(v ? '.undo' : '[data-appr-set="ok"]')?.focus();
      });
    }
  }

  // Primer recorrido al llegar la tarjeta al 75 % de la pantalla (diseño: top < 0,75 vh).
  if (!still.matches) {
    pk = 0;
    paint();
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      if (!started) run(0);
    }, { rootMargin: '0px 0px -25% 0px' });
    io.observe(root);
  }
}
