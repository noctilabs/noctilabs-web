// Tabs del patrón W3C APG con activación manual (spec 002 §4.1.6), genérico por data-tabs.
// Marcado: [data-tabs] > [data-tablist] (hidden sin JS) > button[id][data-tab=<id del panel>]; los paneles con hidden
// salvo el inicial. Los roles y atributos ARIA los pone este script.
// Fotos: las <img loading="lazy"> del componente pasan a eager cuando se acerca al viewport; si una falla, el
// contenedor [data-photo] recibe data-failed y el CSS muestra su respaldo.

export function initTabs(root: HTMLElement): void {
  const list = root.querySelector<HTMLElement>('[data-tablist]')!;
  const tabs = [...list.querySelectorAll<HTMLButtonElement>('[data-tab]')];
  const panels = tabs.map((t) => document.getElementById(t.dataset.tab!)!);

  const select = (i: number) => tabs.forEach((t, j) => {
    t.setAttribute('aria-selected', String(i === j));
    t.tabIndex = i === j ? 0 : -1;
    panels[j]!.hidden = i !== j;
  });

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
    tabs[j]!.focus();
  });

  select(Math.max(0, panels.findIndex((p) => !p.hidden)));
  list.hidden = false;

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
