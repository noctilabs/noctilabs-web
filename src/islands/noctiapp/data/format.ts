// Formatos por idioma con Intl (spec 003 §3.2). Deterministas en SSR: sin zona horaria local.
import type { Locale } from './types';

export interface Fmt {
  /** «18.400.000» / «18,400,000». */
  num: (n: number) => string;
  /** «$18.400.000» / «$18,400,000». */
  money: (n: number) => string;
  /** En millones, redondeo a la mitad hacia arriba sobre el valor exacto: «$48,2 M» / «$48.2M». */
  mill: (n: number, digits?: number) => string;
  /** Registros en millones sin signo de moneda: «2,4 M» / «2.4M». */
  millPlain: (n: number, digits?: number) => string;
  /** «19,4 %» / «19.4%»; con `signed`, «−28 %» o «+18 %». */
  pct: (n: number, digits?: number, signed?: boolean) => string;
  /** Puntos porcentuales con signo: «−3,2 pp». */
  pp: (n: number) => string;
  /** Número con decimales fijos: «31,6». */
  dec: (n: number, digits: number) => string;
  /** Segundos: «0,3 s». */
  secs: (n: number) => string;
  /** Fecha corta: «5 oct» / «Oct 5». */
  date: (iso: string) => string;
}

const MINUS = '−';

export function makeFmt(locale: Locale): Fmt {
  const tag = locale === 'es' ? 'es' : 'en-US';
  const int = new Intl.NumberFormat(tag, { useGrouping: 'always', maximumFractionDigits: 0 });
  const fixed = new Map<number, Intl.NumberFormat>();
  const dec = (n: number, d: number) => {
    let f = fixed.get(d);
    if (!f) { f = new Intl.NumberFormat(tag, { useGrouping: 'always', minimumFractionDigits: d, maximumFractionDigits: d }); fixed.set(d, f); }
    return f.format(n);
  };
  const pcts = new Map<number, Intl.NumberFormat>();
  const pct = (n: number, d = 0, signed = false) => {
    let f = pcts.get(d);
    if (!f) { f = new Intl.NumberFormat(tag, { style: 'percent', minimumFractionDigits: d, maximumFractionDigits: d }); pcts.set(d, f); }
    const s = f.format(Math.abs(n) / 100);
    return (signed ? (n < 0 ? MINUS : '+') : n < 0 ? MINUS : '') + s;
  };
  // Redondeo entero (sin errores de coma flotante): 28.650.000 → 28,7.
  const millValue = (n: number, d: number) => { const k = 10 ** d; return Math.round((n * k) / 1_000_000) / k; };
  const unit = locale === 'es' ? ' M' : 'M';
  const date = new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return {
    num: (n) => int.format(n),
    money: (n) => '$' + int.format(n),
    mill: (n, d = 1) => '$' + dec(millValue(n, d), d) + unit,
    millPlain: (n, d = 1) => dec(millValue(n, d), d) + unit,
    pct,
    pp: (n) => (n < 0 ? MINUS : '+') + dec(Math.abs(n), 1) + ' pp',
    dec,
    secs: (n) => dec(n, 1) + ' s',
    date: (iso) => date.format(new Date(iso + 'T00:00:00Z')).replace(/\.$/, ''),
  };
}
