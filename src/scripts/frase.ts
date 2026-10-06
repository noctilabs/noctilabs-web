// Frase del home (spec 007 §3 A): las palabras se encienden según el avance del scroll, con la fórmula de la v4.
// Sin JS o con reduced motion la frase se ve completa: el gris solo existe con la clase `armed`.
export function initFrase(p: HTMLElement) {
  const words = [...p.querySelectorAll<HTMLElement>('.w')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0;
  const update = () => {
    raf = 0;
    if (reduce.matches) { p.classList.remove('armed'); return; }
    const r = p.getBoundingClientRect();
    const vh = innerHeight;
    const k = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (vh * 0.45 + r.height * 0.6)));
    const n = Math.round(k * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < n));
    p.classList.add('armed');
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  reduce.addEventListener('change', schedule);
  update();
}
