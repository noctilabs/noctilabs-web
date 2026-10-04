// Números y fechas de la demo, una sola vez para ES y EN (spec 003 §3.2 y §4.7).
// Los totales se derivan de las filas; nada se escribe dos veces.
import type { Logo, SourceId } from './types';

/** «Hoy» de la demo (lunes). Las conversaciones llevan su fecha; las corridas, «Hoy» / «Ayer». */
export const TODAY = '2026-10-05';

export const OC = { id: 'OC-4471', supplier: 'Plastar S.A.', amount: 18_400_000 } as const;
/** Umbral único de aprobación de compras (§4.7 n.º 2). */
export const PURCHASE_LIMIT = 15_000_000;
export const PAYMENTS_LIMIT = 5_000_000;
export const DISCOUNT_LIMIT = 10;

/** Antigüedad de deuda, intervalos disjuntos y exhaustivos (§4.7 n.º 5). */
export const AGING = {
  invoices: 312,
  d1_30: { amount: 9_840_000, clients: 38 },
  d31_90: { amount: 21_300_000, clients: 12 },
  d90: { amount: 17_060_000, clients: 7 },
} as const;
export const OVERDUE_TOTAL = AGING.d1_30.amount + AGING.d31_90.amount + AGING.d90.amount;
export const OVER_30 = AGING.d31_90.amount + AGING.d90.amount;
export const DEBTORS = AGING.d1_30.clients + AGING.d31_90.clients + AGING.d90.clients;

/** Filas de las tablas de aprobación de cada agente: [cantidad, monto]. */
export const ROWS = {
  cobranzas: [[AGING.d1_30.clients, AGING.d1_30.amount], [AGING.d31_90.clients, AGING.d31_90.amount], [AGING.d90.clients, AGING.d90.amount]],
  comercial: [[14, 6_200_000], [9, 11_450_000], [4, 3_900_000]],
  compras: [[3, OC.amount], [6, 7_950_000], [2, 2_300_000]],
} as const;
export const total = (rows: readonly (readonly [number, number])[]) => rows.reduce((s, r) => s + r[1], 0);

/** Pedidos retenidos (§4.7 n.º 6). */
export const HELD = { stock: 8, credit: 4 } as const;
export const HELD_TOTAL = HELD.stock + HELD.credit;

/** Catálogo único de fuentes (§4.7 n.º 9). */
export const SOURCES: readonly { id: SourceId; kind: 'system' | 'doc'; records: number; logo?: Logo }[] = [
  { id: 'erp', kind: 'system', records: 2_400_000, logo: 'sap' },
  { id: 'crm', kind: 'system', records: 86_120, logo: 'hubspot' },
  { id: 'drive', kind: 'system', records: 12_408, logo: 'googledrive' },
  { id: 'planillas', kind: 'system', records: 214, logo: 'googlesheets' },
  { id: 'whatsapp', kind: 'system', records: 31_950, logo: 'whatsapp' },
  { id: 'correo', kind: 'system', records: 58_300, logo: 'gmail' },
  { id: 'documentos', kind: 'doc', records: 1_120 },
  { id: 'conocimiento', kind: 'doc', records: 342 },
];
/** Orden de la vista Centro: los 6 sistemas. */
export const CENTER_ORDER: readonly SourceId[] = ['erp', 'crm', 'drive', 'whatsapp', 'planillas', 'correo'];

export const BARS: readonly [string, number][] = [['S1', 31.6], ['S2', 31.1], ['S3', 31.9], ['S4', 30.8], ['S5', 31.2], ['S6', 31.0], ['S7', 31.4], ['S8', 28.2]];
