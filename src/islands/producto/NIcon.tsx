// Ícono animado de Producto (spec 007 §3.4; NIcon de V4 L1188–1201). Decorativo: aria-hidden.
// - prime: arranca en el primer cuadro de la animación (pausada) hasta que se dispara.
// - Se dispara una vez al entrar en pantalla (60 %), con hover salvo noHover, y cada vez que cambia `go`.
// - Con reduced motion no anima: queda el dibujo final.
import { useEffect, useRef } from 'react';
import { icDef } from './icdef';

interface Props { k: string; fg: string; ac: string; size?: number; prime?: boolean; noHover?: boolean; manual?: boolean; go?: number }
type Kf = [string, Keyframe[], KeyframeAnimationOptions?];
type AnimEl = Element & { __na?: Animation };

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function NIcon(p: Props) {
  const root = useRef<SVGSVGElement>(null);
  const refs = useRef<Record<string, AnimEl | null>>({});
  const rf = useRef<Record<string, (el: AnimEl | null) => void>>({});
  const R = (id: string) => rf.current[id] || (rf.current[id] = (el) => { refs.current[id] = el; });
  const def = icDef(p.k, p.fg, p.ac, R) as { els: React.ReactNode[]; an: Kf[] };
  const run = useRef<(paused: boolean) => void>(() => {});
  run.current = (paused) => {
    if (reduced()) return;
    def.an.forEach(([id, kf, o]) => {
      const el = refs.current[id];
      if (!el || !el.animate) return;
      el.__na?.cancel();
      const a = el.animate(kf, { duration: 800, fill: 'both', easing: 'cubic-bezier(.4,0,.2,1)', ...o });
      a.onfinish = () => a.cancel();
      if (paused) a.pause();
      el.__na = a;
    });
  };

  useEffect(() => {
    if (p.prime) run.current(true);
    if (p.manual) return;
    const el = root.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((es) => { if (es[0]?.isIntersecting) { run.current(false); io.disconnect(); } }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const last = useRef(p.go || 0);
  useEffect(() => {
    const g = p.go || 0;
    if (g !== last.current) { last.current = g; if (g) run.current(false); }
  }, [p.go]);

  const size = p.size || 32;
  return (
    <svg
      ref={root}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      focusable="false"
      onMouseEnter={p.noHover ? undefined : () => run.current(false)}
      style={{ display: 'block', overflow: 'visible', flex: 'none' }}
    >
      {def.els}
    </svg>
  );
}
