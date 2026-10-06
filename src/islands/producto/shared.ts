// Piezas comunes de las islas de Producto (spec 007 §3.C).
import { useEffect, useState } from 'react';

/**
 * El copy en español de la v4 escribe «62%»; el sitio usa el formato de Intl («62 %», spec 003 §4.7). Recorre los datos
 * y separa el signo con un espacio duro, una sola vez al cargar el módulo.
 */
export function esPct<T>(x: T): T {
  if (typeof x === 'string') return x.replace(/(\d)%/g, '$1 %') as T;
  if (Array.isArray(x)) return x.map(esPct) as T;
  if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, esPct(v)])) as T;
  return x;
}

/** prefers-reduced-motion: false en SSR y hasta montar. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/** true en el cliente después de hidratar: los controles que necesitan JS van `disabled` antes. */
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}
