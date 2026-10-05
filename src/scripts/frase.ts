// Frase de la home (spec 006 §5): las palabras pasan de gris a tinta a medida que el párrafo entra en pantalla.
// El HTML sale en tinta; el gris lo pone este script, así sin JS o con reduced motion se lee entera.
const DIM = 'is-dim';

export function initFrase(): void {
  const p = document.querySelector<HTMLElement>('[data-frase]');
  if (!p) return;
  const words = Array.from(p.querySelectorAll<HTMLElement>('[data-fw]'));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0;

  const paint = () => {
    raf = 0;
    const r = p.getBoundingClientRect();
    const vh = window.innerHeight;
    // Misma curva que el diseño (V4 L1326).
    const k = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (vh * 0.45 + r.height * 0.6)));
    const n = reduce.matches ? words.length : Math.round(k * words.length);
    words.forEach((w, i) => w.classList.toggle(DIM, i >= n));
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  reduce.addEventListener('change', schedule);
  paint();
}
