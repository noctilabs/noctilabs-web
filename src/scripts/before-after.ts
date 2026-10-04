// Antes y después del home (spec 002 §4.1.2). Los textos de cada estado los muestra el CSS según data-state.
type State = 'sin' | 'con';
type Origin = 'usuario' | 'auto';

const PERIOD = 3600;

export function initBeforeAfter(root: HTMLElement): void {
  const control = root.querySelector<HTMLElement>('[data-ba-control]')!;
  const buttons = [...control.querySelectorAll<HTMLButtonElement>('[data-ba-set]')];
  const live = root.querySelector<HTMLElement>('[data-ba-live]')!;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let state: State = 'con';
  let chosen = false;
  let visible = false;
  let timer: number | undefined;

  function setState(next: State, origin: Origin): void {
    state = next;
    root.dataset.state = next;
    for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.baSet === next));
    if (origin === 'usuario') live.textContent = next === 'sin' ? live.dataset.liveSin! : live.dataset.liveCon!;
  }

  // La alternancia corre sólo si nadie eligió, sin reduced motion, con el bloque en pantalla y la pestaña visible.
  function sync(): void {
    const run = !chosen && !reduce.matches && visible && !document.hidden;
    if (run && timer === undefined) {
      timer = window.setInterval(() => setState(state === 'sin' ? 'con' : 'sin', 'auto'), PERIOD);
    } else if (!run && timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  }

  for (const b of buttons) {
    b.addEventListener('click', () => {
      chosen = true;
      setState(b.dataset.baSet as State, 'usuario');
      sync();
    });
  }
  reduce.addEventListener('change', () => {
    if (reduce.matches && !chosen) setState('con', 'auto');
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(([entry]) => {
    visible = entry!.isIntersecting;
    sync();
  }, { threshold: 0 }).observe(root.querySelector('[data-ba-watch]')!);

  control.hidden = false;
  if (!reduce.matches) setState('sin', 'auto');
}
