// Acordeón con avance automático y barra de progreso (spec 006 §3.3 y §3.4, E5): Valor avanza cada 7 s y Control cada 6 s.
//
// Contrato del marcado (los estilos los pone cada componente):
//   [data-aa][data-aa-interval=<ms>]   raíz y zona de pausa: el hover y el foco con teclado dentro pausan.
//     [data-aa-item]                    un ítem, con:
//       button[data-aa-trigger][aria-controls=<id del panel>][aria-expanded]   el SSR marca abierto el inicial;
//       el panel con ese id             el CSS lo colapsa cuando el ítem no tiene data-open;
//       [data-aa-bar]                   la barra de progreso: el script anima su transform de scaleX(0) a scaleX(1)
//                                       (el CSS la deja en scaleX(0) y le pone transform-origin).
//     button[data-aa-toggle][hidden][data-label-pause][data-label-play] > [data-aa-label]
//                                       la pausa visible (WCAG 2.2.2); el script cambia el texto del [data-aa-label].
//
// Estado que el script deja en el DOM para el CSS:
//   data-open en el [data-aa-item] abierto (y aria-expanded en su botón);
//   data-aa-auto en la raíz mientras hay avance automático; data-aa-held mientras está pausado con el botón.
//
// Comportamiento:
//   - Desde 1000 px y sin reduced motion avanza solo: siempre hay un ítem abierto, al completarse la barra pasa al
//     siguiente (con vuelta) y el click elige otro y reinicia la barra.
//   - Pausa con el hover, con el foco con teclado (:focus-visible) dentro o con el botón; la barra queda congelada y
//     sigue desde ahí. Reanudar con el botón descarta el hover y el foco en curso: vuelven a contar desde la próxima entrada.
//   - Con reduced motion no avanza: el click elige el ítem, igual que en escritorio.
//   - Por debajo de 1000 px no avanza: un toque abre o cierra el ítem y pueden quedar todos cerrados.
//   - onChange(i) avisa cada cambio del ítem abierto (−1 = ninguno) para sincronizar otra vista (el grafo, la app).

export function initAutoAccordion(root: HTMLElement, onChange: (index: number) => void = () => {}): void {
  const items = [...root.querySelectorAll<HTMLElement>('[data-aa-item]')];
  const triggers = items.map((it) => it.querySelector<HTMLButtonElement>('[data-aa-trigger]')!);
  const bars = items.map((it) => it.querySelector<HTMLElement>('[data-aa-bar]'));
  const toggle = root.querySelector<HTMLButtonElement>('[data-aa-toggle]');
  const label = toggle?.querySelector<HTMLElement>('[data-aa-label]');
  const interval = Number(root.dataset.aaInterval) || 7000;
  const wide = matchMedia('(min-width: 1000px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  let open = triggers.findIndex((t) => t.getAttribute('aria-expanded') === 'true');
  let held = false;
  let hover = false;
  let focus = false;
  let run: Animation | null = null;

  const auto = () => wide.matches && !reduce.matches;

  function sync(): void {
    if (run) {
      if (held || hover || focus) run.pause();
      else run.play();
    }
    root.toggleAttribute('data-aa-held', held);
    if (toggle && label) label.textContent = (held ? toggle.dataset.labelPlay : toggle.dataset.labelPause) ?? '';
  }

  function restart(): void {
    run?.cancel();
    run = null;
    const bar = bars[open];
    if (auto() && bar) {
      run = bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: interval, easing: 'linear' });
      run.onfinish = () => show((open + 1) % items.length);
    }
    sync();
  }

  function show(i: number): void {
    open = i;
    items.forEach((it, j) => {
      it.toggleAttribute('data-open', j === i);
      triggers[j]!.setAttribute('aria-expanded', String(j === i));
    });
    onChange(i);
    restart();
  }

  function mode(): void {
    root.toggleAttribute('data-aa-auto', auto());
    if (toggle) toggle.hidden = !auto();
    // En escritorio siempre hay uno abierto (en mobile pudieron quedar todos cerrados).
    if (wide.matches && open < 0) show(0);
    else restart();
  }

  triggers.forEach((t, i) => t.addEventListener('click', () => {
    if (wide.matches) {
      // El abierto vuelve a avisar su índice (re-sincroniza lo que depende de él, p. ej. la vista de la app tras navegar
      // dentro de ella) sin reiniciar su avance.
      if (i !== open) show(i);
      else onChange(i);
    } else {
      show(open === i ? -1 : i);
    }
  }));

  root.addEventListener('pointerenter', () => { hover = true; sync(); });
  root.addEventListener('pointerleave', () => { hover = false; sync(); });
  root.addEventListener('focusin', (e) => {
    const el = e.target as HTMLElement;
    // Cualquier foco de teclado dentro pausa, también el del botón; solo «Reanudar» (su click) libera la pausa.
    focus = el.matches(':focus-visible');
    sync();
  });
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget as Node | null)) { focus = false; sync(); }
  });
  toggle?.addEventListener('click', () => {
    held = !held;
    if (!held) hover = focus = false;
    sync();
  });

  wide.addEventListener('change', mode);
  reduce.addEventListener('change', mode);
  items.forEach((it, j) => it.toggleAttribute('data-open', j === open));
  mode();
}
