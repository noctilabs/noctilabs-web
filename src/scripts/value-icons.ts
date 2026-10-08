// Anima los íconos de «Dónde aparece el valor» (spec 009 §3.F): una vez al entrar en pantalla (≤ 5 s) y de nuevo con
// hover sobre la tarjeta. Con reduced motion no se anima nada: quedan en su estado base.
type Smil = SVGAnimationElement & { dataset: DOMStringMap };

function play(svg: SVGSVGElement) {
  svg.querySelectorAll<Smil>('animate, animateMotion').forEach((a) => {
    try { a.endElement(); a.beginElementAt(Number(a.dataset.delay ?? 0)); } catch { /* sin SMIL: queda quieto */ }
  });
}

export function initValueIcons(root: ParentNode = document) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const icons = [...root.querySelectorAll<SVGSVGElement>('svg[data-value-icon]')];
  if (!icons.length) return;
  const io = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { play(e.target as SVGSVGElement); io?.unobserve(e.target); }
  }, { threshold: 0.6 });
  for (const svg of icons) {
    io?.observe(svg);
    svg.closest('li')?.addEventListener('pointerenter', (ev) => { if ((ev as PointerEvent).pointerType === 'mouse') play(svg); });
  }
}
