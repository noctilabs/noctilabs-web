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
    // Si el wrapper tiene el foco, no se le quita el tabindex (perdería el foco); se vuelve a medir al salir.
    const check = () => { const o = el.scrollWidth > el.clientWidth + 1; if (o || document.activeElement !== el) setOver(o); };
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    el.addEventListener('focusout', check);
    check();
    return () => { ro.disconnect(); el.removeEventListener('focusout', check); };
  }, []);
  return (
    <div ref={ref} className={'na-scroll' + (className ? ' ' + className : '')} {...(over ? { role: 'region', 'aria-label': label, tabIndex: 0 } : {})}>
      {children}
    </div>
  );
}

/**
 * Fila deslizable (spec 005 §3.3): marca con `is-fade-s` / `is-fade-e` el borde que tiene contenido oculto (el CSS lo
 * desvanece) y, cuando cambia `active`, trae a la vista el ítem activo (`aria-pressed`/`aria-current`). Desplaza solo la
 * fila, nunca la página: `scrollIntoView` movería también el scroll vertical si la fila queda fuera de pantalla.
 */
export function useScrollRow<T extends HTMLElement>(active: unknown) {
  const ref = useRef<T>(null);
  const { reduced } = useApp();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const upd = () => {
      const max = el.scrollWidth - el.clientWidth;
      el.classList.toggle('is-fade-s', el.scrollLeft > 1);
      el.classList.toggle('is-fade-e', el.scrollLeft < max - 1);
    };
    const ro = new ResizeObserver(upd);
    ro.observe(el);
    for (const c of el.children) ro.observe(c);
    el.addEventListener('scroll', upd, { passive: true });
    upd();
    return () => { ro.disconnect(); el.removeEventListener('scroll', upd); };
  }, []);
  useEffect(() => {
    const el = ref.current;
    const it = el?.querySelector<HTMLElement>('[aria-pressed="true"], [aria-current="page"]');
    if (!el || !it || el.scrollWidth <= el.clientWidth + 1) return;
    // Margen del desvanecido y del scroll-padding (ver app.css): el ítem queda entero fuera del degradé. Los destinos son
    // puntos de snap (el inicio de un ítem a `pad` del borde), así el snap no lo corre: el más cercano que deja el activo visible.
    const pad = 28;
    const max = el.scrollWidth - el.clientWidth;
    const r = el.getBoundingClientRect();
    const a = it.getBoundingClientRect();
    const fits = (s: number) => {
      const d = s - el.scrollLeft;
      return a.left - d >= r.left + (s > 1 ? pad : 0) - 1 && a.right - d <= r.right + 1 - (s < max - 1 ? pad : 0);
    };
    if (fits(el.scrollLeft)) return;
    const stops = [...el.children].map((c) => Math.min(max, Math.max(0, el.scrollLeft + c.getBoundingClientRect().left - r.left - pad)));
    const near = stops.filter(fits).sort((x, y) => Math.abs(x - el.scrollLeft) - Math.abs(y - el.scrollLeft));
    const left = near[0] ?? Math.max(0, el.scrollLeft + a.left - r.left - pad);
    el.scrollTo({ left, behavior: reduced ? 'auto' : 'smooth' });
  }, [active, reduced]);
  return ref;
}

/** Ícono de trazo de 24×24, decorativo. */
export function Icon({ d, size = 15, width = 1.5, className, transform }: { d: string; size?: number; width?: number; className?: string; transform?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={d} transform={transform} />
    </svg>
  );
}
