// Tabs del patrón W3C APG con activación manual (spec 002 §4.1.6), genérico por data-tabs.
// Marcado: [data-tabs] > [data-tablist] (hidden sin JS) > button[id][data-tab=<id del panel>]; los paneles con hidden
// salvo el inicial. Los roles y atributos ARIA los pone este script.
// Fotos: las <img loading="lazy"> del componente pasan a eager cuando se acerca al viewport; si una falla, el
// contenedor [data-photo] recibe data-failed y el CSS muestra su respaldo.

export function initTabs(root: HTMLElement): void {
  const list = root.querySelector<HTMLElement>('[data-tablist]')!;
  const tabs = [...list.querySelectorAll<HTMLButtonElement>('[data-tab]')];
  const panels = tabs.map((t) => document.getElementById(t.dataset.tab!)!);

  // tabindex itinerante: 0 en la tab con foco mientras el foco está en el tablist, y de vuelta en la seleccionada
  // al salir, así Tab y Shift+Tab salen del grupo desde cualquier tab y la reentrada cae en la seleccionada.
  let selected = 0;
  const rove = (k: number) => tabs.forEach((t, j) => { t.tabIndex = j === k ? 0 : -1; });

  // Fila deslizable (spec 005 §3.5): el CSS desvanece sólo el borde con tabs ocultas y la tab activa o con foco se trae a la
  // vista desplazando sólo la fila, nunca la página. FADE = ancho del desvanecido, para que la tab no quede debajo.
  const FADE = 32;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const edges = () => {
    const max = list.scrollWidth - list.clientWidth;
    list.toggleAttribute('data-more-start', list.scrollLeft > 1);
    list.toggleAttribute('data-more-end', list.scrollLeft < max - 1);
  };
  // El destino es siempre un punto de snap (inicio de una tab menos el scroll-padding, que mide lo mismo que el
  // desvanecido); si no, el navegador vuelve a ajustar y la tab puede quedar debajo del borde. Suave sólo para el click;
  // con el teclado es inmediato, así varias flechas seguidas no parten de una posición a mitad de animación.
  const reveal = (t: HTMLElement, smooth: boolean) => {
    const origin = list.getBoundingClientRect().left - list.scrollLeft;
    const snaps = tabs.map((x) => Math.max(0, x.getBoundingClientRect().left - origin - FADE));
    const left = t.getBoundingClientRect().left - origin;
    const right = left + t.offsetWidth;
    const max = list.scrollWidth - list.clientWidth;
    const now = list.scrollLeft;
    let to = now;
    if (left - FADE < now) to = snaps[tabs.indexOf(t as HTMLButtonElement)]!;
    else if (right + FADE > now + list.clientWidth) to = Math.min(max, snaps.find((s) => s >= right + FADE - list.clientWidth) ?? max);
    if (Math.abs(to - now) > 1) list.scrollTo({ left: to, behavior: smooth && !reduce.matches ? 'smooth' : 'auto' });
  };

  const select = (i: number, smooth = true) => {
    selected = i;
    rove(i);
    reveal(tabs[i]!, smooth);
    tabs.forEach((t, j) => {
      t.setAttribute('aria-selected', String(i === j));
      panels[j]!.hidden = i !== j;
    });
  };

  list.setAttribute('role', 'tablist');
  tabs.forEach((t, i) => {
    const p = panels[i]!;
    t.setAttribute('role', 'tab');
    t.setAttribute('aria-controls', p.id);
    p.setAttribute('role', 'tabpanel');
    p.setAttribute('aria-labelledby', t.id);
    p.tabIndex = 0;
    t.addEventListener('click', () => select(i));
  });

  // Flechas con vuelta, Home y End: sólo mueven el foco. Enter, Espacio y el click activan (botón nativo).
  list.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    const n = tabs.length;
    const moves: Record<string, number | undefined> = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 };
    const j = moves[e.key];
    if (i < 0 || j === undefined) return;
    e.preventDefault();
    rove(j);
    tabs[j]!.focus({ preventScroll: true });
    reveal(tabs[j]!, false);
  });
  list.addEventListener('focusout', (e) => {
    if (!list.contains(e.relatedTarget as Node | null)) rove(selected);
  });

  list.hidden = false;
  select(Math.max(0, panels.findIndex((p) => !p.hidden)), false);
  list.addEventListener('scroll', edges, { passive: true });
  new ResizeObserver(edges).observe(list);

  const imgs = [...root.querySelectorAll<HTMLImageElement>('img[loading="lazy"]')];
  for (const img of imgs) {
    const fail = () => img.closest('[data-photo]')?.setAttribute('data-failed', '');
    img.addEventListener('error', fail);
    if (img.complete && !img.naturalWidth) fail();
  }
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    for (const img of imgs) img.loading = 'eager';
    io.disconnect();
  }, { rootMargin: '600px' });
  io.observe(root);
}
