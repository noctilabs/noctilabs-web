// Antes y después del home (spec 002 §4.1.2, enmienda 2026-10-04). Los textos de cada estado los muestra el CSS según data-state.
// El scroll manda: «con» cuando el borde superior de los diagramas pasó la mitad del viewport, «sin» si no.
// Una elección manual lo deja fijo hasta que la sección sale del viewport. Con reduced motion el cambio es igual,
// pero el CSS lo deja sin transiciones.
type State = 'sin' | 'con';
type Origin = 'usuario' | 'auto';

export function initBeforeAfter(root: HTMLElement): void {
  const control = root.querySelector<HTMLElement>('[data-ba-control]')!;
  const buttons = [...control.querySelectorAll<HTMLButtonElement>('[data-ba-set]')];
  const live = root.querySelector<HTMLElement>('[data-ba-live]')!;
  const trigger = root.querySelector<HTMLElement>('[data-ba-trigger]')!;
  let chosen = false;

  function setState(next: State, origin: Origin): void {
    root.dataset.state = next;
    for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.baSet === next));
    if (origin === 'usuario') live.textContent = next === 'sin' ? live.dataset.liveSin! : live.dataset.liveCon!;
  }

  // Se lee la geometría actual en lugar de la del entry: así un salto de scroll que no cruza el umbral no deja un estado viejo.
  function follow(): void {
    if (!chosen) setState(trigger.getBoundingClientRect().top < innerHeight / 2 ? 'con' : 'sin', 'auto');
  }

  for (const b of buttons) {
    b.addEventListener('click', () => {
      chosen = true;
      setState(b.dataset.baSet as State, 'usuario');
    });
  }
  // Raíz = mitad superior del viewport: el callback corre cuando el borde superior de los diagramas cruza la mitad.
  new IntersectionObserver(follow, { rootMargin: '0px 0px -50% 0px' }).observe(trigger);
  // La elección manual se libera cuando la sección entera sale del viewport. Al entrar también se recalcula: un salto
  // (Inicio, Fin, un ancla) puede cruzar la sección en un solo frame sin que el borde de los diagramas dispare el otro observer.
  new IntersectionObserver(([entry]) => {
    if (!entry!.isIntersecting) chosen = false;
    follow();
  }).observe(root);

  control.hidden = false;

  const row = root.querySelector<HTMLElement>('[data-ba-row]');
  const dots = root.querySelector<HTMLElement>('[data-ba-dots]');
  if (row && dots) initCarousel(row, dots);
}

// Carrusel de los diagramas por debajo de 1000 px (spec 005 §3.2): puntos que llevan a cada tarjeta, flechas sobre la fila
// y el punto activo según IntersectionObserver. En escritorio la fila no se desplaza y no es una parada de Tab.
function initCarousel(row: HTMLElement, box: HTMLElement): void {
  const items = [...row.children] as HTMLElement[];
  const dots = [...box.querySelectorAll<HTMLButtonElement>('button')];
  const wide = matchMedia('(min-width: 1000px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const ratios = items.map(() => 0);
  let active = 0;

  function mark(i: number): void {
    active = i;
    dots.forEach((d, j) => (j === i ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
  }
  // Desplaza sólo la fila (no la página) hasta la tarjeta i.
  function go(i: number): void {
    const k = Math.min(items.length - 1, Math.max(0, i));
    row.scrollTo({ left: items[k]!.offsetLeft - items[0]!.offsetLeft, behavior: reduce.matches ? 'auto' : 'smooth' });
    mark(k);
  }

  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
  row.addEventListener('keydown', (e) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step || e.target !== row || wide.matches) return;
    e.preventDefault();
    go(active + step);
  });

  // Activo = la tarjeta más visible; si hay empate (tablet, dos enteras), la última cuando la fila llegó al final.
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) ratios[items.indexOf(e.target as HTMLElement)] = e.intersectionRatio;
    const max = Math.max(...ratios);
    const atEnd = row.scrollLeft + row.clientWidth >= row.scrollWidth - 2;
    mark(atEnd ? ratios.lastIndexOf(max) : ratios.indexOf(max));
  }, { root: row, threshold: [0, 0.25, 0.5, 0.75, 1] });
  for (const it of items) io.observe(it);

  const syncTab = () => {
    if (wide.matches) row.removeAttribute('tabindex');
    else row.tabIndex = 0;
  };
  syncTab();
  wide.addEventListener('change', syncTab);
  box.hidden = false;
}
