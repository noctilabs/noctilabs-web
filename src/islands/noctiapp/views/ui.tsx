// Piezas compartidas de las vistas: contexto de la isla, pills, chips de fuente y regiones con scroll (spec 003 §4.9).
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Copy, Ref, Tag } from '../data/types';
import type { Fmt } from '../data/format';

export interface AppCtx {
  copy: Copy;
  fmt: Fmt;
  /** false en SSR y antes de hidratar: los controles que necesitan JS van `disabled` (§3.3). */
  mounted: boolean;
  reduced: boolean;
}
export const Ctx = createContext<AppCtx | null>(null);
export const useApp = () => useContext(Ctx)!;

export function Pill({ tag, children, className }: { tag: Tag; children: ReactNode; className?: string }) {
  return <span className={'na-tag' + (className ? ' ' + className : '')} data-tag={tag}>{children}</span>;
}

/** Chip de una referencia a una fuente del catálogo (§4.7 n.º 9). */
export function RefChip({ r }: { r: Ref }) {
  return <span className="na-ref" data-source={r.sourceId}>{r.label}</span>;
}

export function Kicker({ children, as: As = 'span', className }: { children: ReactNode; as?: 'span' | 'h3' | 'h4'; className?: string }) {
  return <As className={'na-kicker' + (className ? ' ' + className : '')}>{children}</As>;
}

/**
 * Wrapper con `overflow-x: auto`. En SSR ya es `role="region"` con `tabindex="0"` (funciona sin JS); al montar, deja de
 * serlo si su contenido no desborda, para no sumar paradas de Tab muertas (§4.9).
 */
export function ScrollRegion({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [over, setOver] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOver(el.scrollWidth > el.clientWidth + 1);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    check();
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className={'na-scroll' + (className ? ' ' + className : '')} {...(over ? { role: 'region', 'aria-label': label, tabIndex: 0 } : {})}>
      {children}
    </div>
  );
}

/** Ícono de trazo de 24×24, decorativo. */
export function Icon({ d, size = 15, width = 1.5, className, transform }: { d: string; size?: number; width?: number; className?: string; transform?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={d} transform={transform} />
    </svg>
  );
}
