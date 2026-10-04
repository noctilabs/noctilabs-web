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
}
