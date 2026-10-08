// Anima los íconos de «Dónde aparece el valor» (spec 009 §3.F, G6): una vez al entrar en pantalla (≤ 5 s) y de nuevo
// con hover sobre la tarjeta. Fuera de pantalla se pausan; con reduced motion (también si se activa después) vuelven a
// su estado base y no se animan.
type Smil = SVGAnimationElement & { dataset: DOMStringMap };

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const anims = (svg: SVGSVGElement) => svg.querySelectorAll<Smil>('animate, animateMotion');
/** Íconos en pantalla: sólo esos se animan, también con hover. */
const shown = new WeakSet<SVGSVGElement>();

function stop(svg: SVGSVGElement) {
  anims(svg).forEach((a) => { try { a.endElement(); } catch { /* sin SMIL */ } });
}

function play(svg: SVGSVGElement) {
  if (reduce.matches || !shown.has(svg)) return;
  svg.unpauseAnimations();
  anims(svg).forEach((a) => {
    try { a.endElement(); a.beginElementAt(Number(a.dataset.delay ?? 0)); } catch { /* sin SMIL: queda quieto */ }
  });
}

export function initValueIcons(root: ParentNode = document) {
  const icons = [...root.querySelectorAll<SVGSVGElement>('svg[data-value-icon]')];
  if (!icons.length) return;
  const played = new WeakSet<SVGSVGElement>();
  if (typeof IntersectionObserver === 'undefined') icons.forEach((svg) => shown.add(svg));
  const io = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((es) => {
    for (const e of es) {
      const svg = e.target as SVGSVGElement;
      if (!e.isIntersecting) { shown.delete(svg); svg.pauseAnimations(); continue; }
      shown.add(svg);
      if (!played.has(svg) && e.intersectionRatio >= 0.6) { played.add(svg); play(svg); } else if (played.has(svg) && !reduce.matches) svg.unpauseAnimations();
    }
  }, { threshold: [0, 0.6] });
  for (const svg of icons) {
    io?.observe(svg);
    svg.closest('li')?.addEventListener('pointerenter', (ev) => { if ((ev as PointerEvent).pointerType === 'mouse') play(svg); });
  }
  reduce.addEventListener('change', () => { if (reduce.matches) icons.forEach(stop); });
}
