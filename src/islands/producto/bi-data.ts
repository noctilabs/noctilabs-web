// Inteligencia de Producto (spec 007 §3.C): tablero, gráfico y chat de la v4 («Producto · Inteligencia», BI_KPIS, BI_BARS,
// BI_Q y BI_TX). ES literal de la v4, salvo las cobranzas vencidas, que salen de facts.ts (datos coherentes, spec 007 F3).
// EN provisorio (spec 007 F4): i18n-en.js no trae estas claves; pendiente de revisión del dueño.
import { DEBTORS, OVERDUE_TOTAL } from '../noctiapp/data/facts';
import { makeFmt } from '../noctiapp/data/format';
import type { Locale } from '../noctiapp/data/types';
import { esPct } from './shared';

export type Tone = 'pos' | 'neg' | 'neu';
export interface Kpi {
  k: string;
  v: string;
  d: string;
  t: Tone;
  /** 12 semanas. */
  s: number[];
  /** [mín, máx, paso] del eje Y; ausente en el KPI de barras. */
  y?: [number, number, number];
  unit?: 'mill' | 'pct' | 'int';
  title: string;
  hiC?: string;
  anom?: boolean;
  bars?: boolean;
  mk?: { i: number; label: string; t: string; c: string; bd: string };
}
export interface BiItem { t: string; pp: string; d: string; bar?: [number, number]; seg?: number; pos?: boolean }
export interface BiQ {
  q: string;
  kpi: number;
  cuts: string[];
  lead: string;
  total?: boolean;
  items: BiItem[];
  metrics: [string, string][];
  segs: string[];
  src: string[];
  down: string[];
  act: string[];
}
export interface BiCopy {
  title: string;
  company: string;
  live: string;
  liveLong: string;
  anomaly: string;
  cutsLabel: string;
  cuts: [string, string][];
  cutsApplied: (n: number) => string;
  periods: [string, string, string];
  x0: [string, string, string];
  xEnd: string;
  barsAlert: string;
  tenDays: string;
  examples: string;
  askerName: string;
  askerInitials: string;
  totalLabel: string;
  totalValue: string;
  metrics: string;
  segments: string;
  connections: string;
  down: string;
  act: string;
  alert: string;
  drawer: { crumbs: [string, string, string]; title: string; cols: [string, string, string, string, string, string, string]; foot: string; close: string; qty: string; disc: string };
  /** Abre el detalle de transacciones (único «Bajar al dato» que funciona, como en la v4). */
  txAction: string;
  alertAction: string;
  pause: string;
  play: string;
  kpisLabel: string;
  chartAlt: (k: Kpi, x0: string) => string;
  bars: [string, number][];
  kpis: Kpi[];
  qs: BiQ[];
  tx: [string, string, string, string, string, string, string, string][];
}

const es = makeFmt('es');
const en = makeFmt('en');
const OVERDUE_S = [36.8, 37.2, 36.5, 37.9, 38.4, 38.1, 38.9, 39.4, 39.0, 39.8, 40.3, 41.2].map((v) => +(v * (OVERDUE_TOTAL / 41_200_000)).toFixed(1));
const BAR_D = [3, 4, 5, 6, 7, 10.2, 10.2, 10.2, 10.2, 10.2, 10.2, 10.2, 10.4, 10.8];

const ES: BiCopy = esPct({
  title: 'Inteligencia',
  company: 'Distribuidora Andes · datos ilustrativos',
  live: 'Datos en vivo',
  liveLong: 'Datos en vivo · ERP sincronizado hace 3 min',
  anomaly: 'Anomalía detectada',
  cutsLabel: 'Cortes',
  cuts: [['Canal', ''], ['Cliente', ''], ['Zona', 'Sur'], ['Línea de producto', 'Básica'], ['Vendedor', ''], ['Período', 'este mes']],
  cutsApplied: (n: number) => (n ? `Cortes · ${n} ${n > 1 ? 'aplicados' : 'aplicado'}` : 'Cortes'),
  periods: ['4 semanas', '12 semanas', '6 meses'],
  x0: ['Hace 4 semanas', 'Hace 12 semanas', 'Hace 6 meses'],
  xEnd: 'Esta semana',
  barsAlert: '5 SKUs con riesgo de quiebre en menos de 10 días',
  tenDays: '10 días',
  examples: 'Preguntas de ejemplo',
  askerName: 'Laura Méndez',
  askerInitials: 'LM',
  totalLabel: 'Variación total',
  totalValue: '−3,2 pp',
  metrics: 'Métricas',
  segments: 'Segmentos',
  connections: 'Conexiones',
  down: 'Bajar al dato',
  act: 'Actuar',
  alert: 'Alerta creada: avisar si el margen de mayoristas zona sur baja de 20%.',
  drawer: { crumbs: ['Margen bruto', 'Mayoristas zona sur', 'Transacciones'], title: 'Transacciones que explican la caída', cols: ['Fecha', 'Cliente', 'Producto', 'Cant.', 'Precio', 'Desc.', 'Margen'], foot: 'Cada fila enlaza al registro original en el ERP.', close: 'Cerrar transacciones', qty: 'u', disc: 'desc.' },
  txAction: 'Ver transacciones',
  alertAction: 'Crear alerta →',
  pause: 'Pausar avance',
  play: 'Reanudar avance',
  kpisLabel: 'Indicadores',
  chartAlt: (k: Kpi, x0: string) => (k.bars ? `${k.title}: 5 de 14 SKUs con menos de 10 días de cobertura.` : `${k.title}, desde ${x0.toLowerCase()} hasta esta semana: ${k.v}, ${k.d}.`),
  bars: [['Yerba 1 kg', 3], ['Aceite 900 ml', 4], ['Azúcar 1 kg', 5], ['Leche larga vida 1 L', 6], ['Galletitas surtidas', 7], ...BAR_D.slice(5).map((d): [string, number] => ['', d])],
  kpis: [
    { k: 'Ventas de la semana', v: '$86,4 M', d: '+8% vs semana anterior', t: 'pos', s: [79.2, 80.6, 78.8, 81.4, 80.2, 79.6, 81.8, 80.4, 79.4, 81.2, 80.0, 86.4], y: [75, 90, 5], unit: 'mill', title: 'Ventas semanales · millones de pesos', hiC: '#3E9A64', mk: { i: 11, label: 'Oportunidad', t: '+8% semanal · 2 clientes reactivados', c: '#2F7D52', bd: '#BFDCC9' } },
    { k: 'Margen bruto', v: '28,2%', d: '−3,2 pp vs semana anterior', t: 'neg', s: [31.3, 31.5, 31.2, 31.6, 31.4, 31.7, 31.3, 31.5, 31.8, 31.4, 31.4, 28.2], y: [27, 32, 1], unit: 'pct', title: 'Margen bruto semanal', hiC: '#0047FF', anom: true, mk: { i: 10, label: 'Anomalía', t: 'Desde el 1/9: costo de resina +11%', c: '#0038CC', bd: '#A9C4FF' } },
    { k: 'Cobranzas vencidas', v: es.mill(OVERDUE_TOTAL), d: `${DEBTORS} clientes con deuda vencida`, t: 'neu', s: OVERDUE_S, y: [42, 50, 2], unit: 'mill', title: 'Cobranzas vencidas · millones de pesos', hiC: '#0B0B0C' },
    { k: 'Stock crítico', v: '14 SKUs', d: '+5 vs semana anterior', t: 'neg', s: [9, 9, 8, 9, 10, 9, 9, 10, 9, 9, 9, 14], bars: true, title: 'Días de cobertura por SKU' },
    { k: 'Pedidos demorados', v: '9', d: 'vs 4 la semana anterior', t: 'neg', s: [4, 3, 5, 4, 4, 3, 5, 4, 4, 5, 4, 9], y: [0, 10, 2], unit: 'int', title: 'Pedidos demorados por semana', hiC: '#0B0B0C' },
    { k: 'Margen mayoristas zona sur', v: '19,8%', d: '−5,1 pp vs semana anterior', t: 'neg', s: [25.1, 25.3, 24.9, 25.2, 25.0, 25.4, 25.1, 24.8, 25.2, 25.0, 24.9, 19.8], y: [18, 27, 3], unit: 'pct', title: 'Margen mayoristas zona sur', hiC: '#0047FF' },
  ],
  qs: [
    { q: '¿Por qué cayó el margen esta semana?', kpi: 1, cuts: ['Zona', 'Línea de producto'], lead: 'El margen bajó de 31,4% a 28,2% (−3,2 pp). Tres factores explican la variación:', total: true,
      items: [{ t: 'Mayor costo de insumos', pp: '(−1,6 pp)', d: 'Resina +11% desde el 1 de septiembre, sin traslado a precio.', bar: [0, 50], seg: -1 }, { t: 'Descuentos en mayoristas', pp: '(−1,1 pp)', d: 'Descuento promedio de 8% a 13% en zona sur.', bar: [50, 34.375], seg: 0 }, { t: 'Cambio de mix', pp: '(−0,5 pp)', d: 'Más ventas de línea básica, de menor margen.', bar: [84.375, 15.625], seg: 1 }],
      metrics: [['28,2%', 'Margen bruto'], ['+11%', 'Resina'], ['13%', 'Descuento mayoristas']], segs: ['Mayoristas zona sur', 'Línea básica'], src: ['ERP · Ventas', 'ERP · Costos', 'Lista de precios'], down: ['Ver transacciones', 'Ver clientes afectados'], act: ['Crear alerta →'] },
    { q: '¿Qué productos pueden quebrar stock este mes?', kpi: 3, cuts: ['Período'], lead: 'Hay 14 SKUs en stock crítico y 5 podrían quebrar en menos de 10 días. Los más comprometidos concentran $12,8 M en pedidos ya comprometidos.', items: [],
      metrics: [['14', 'SKUs críticos'], ['5', 'con riesgo alto'], ['8,4 días', 'de cobertura promedio']], segs: ['Riesgo alto', 'Pedidos comprometidos'], src: ['ERP · Stock', 'WMS · Inventario', 'ERP · Pedidos', 'ERP · Compras'], down: ['Ver productos'], act: ['Crear orden sugerida →', 'Alertar a compras'] },
    { q: '¿Qué oportunidades positivas aparecieron esta semana?', kpi: 0, cuts: [], lead: 'Las ventas semanales crecieron 8%, dos clientes retomaron compras después de 60 días y la línea premium mejoró su margen en +1,4 pp.',
      items: [{ t: 'Ventas', pp: '', d: '+8% semanal, $86,4 M.', pos: true }, { t: 'Clientes', pp: '', d: '2 clientes retomaron compras después de 60 días.', pos: true }, { t: 'Línea premium', pp: '', d: 'Margen +1,4 pp.', pos: true }],
      metrics: [['$86,4 M', 'Ventas'], ['+8%', 'semanal'], ['2', 'clientes reactivados'], ['+1,4 pp', 'margen premium']], segs: ['Clientes reactivados', 'Línea premium'], src: ['ERP · Ventas', 'CRM · Cuentas', 'ERP · Costos'], down: ['Ver clientes reactivados', 'Analizar línea premium'], act: ['Compartir insight →'] },
  ],
  tx: [['12/9', 'Mayorista El Sur', 'Línea básica 1 kg', '1.200', '$2.140', '14%', '16,2%', 'FA-21044'], ['12/9', 'Distribuidora Litoral Sur', 'Línea básica 500 g', '800', '$1.180', '13%', '17,8%', 'FA-21039'], ['11/9', 'Mayorista El Sur', 'Línea básica 5 kg', '300', '$9.650', '15%', '15,4%', 'FA-21021'], ['10/9', 'Almacén del Puerto', 'Línea básica 1 kg', '450', '$2.190', '12%', '18,9%', 'FA-21007'], ['9/9', 'Mayorista Austral', 'Línea básica 1 kg', '950', '$2.120', '14%', '16,7%', 'FA-20988']],
});

const EN: BiCopy = {
  title: 'Intelligence',
  company: 'Distribuidora Andes · illustrative data',
  live: 'Live data',
  liveLong: 'Live data · ERP synced 3 min ago',
  anomaly: 'Anomaly detected',
  cutsLabel: 'Filters',
  cuts: [['Channel', ''], ['Customer', ''], ['Zone', 'South'], ['Product line', 'Basic'], ['Sales rep', ''], ['Period', 'this month']],
  cutsApplied: (n: number) => (n ? `Filters · ${n} applied` : 'Filters'),
  periods: ['4 weeks', '12 weeks', '6 months'],
  x0: ['4 weeks ago', '12 weeks ago', '6 months ago'],
  xEnd: 'This week',
  barsAlert: '5 SKUs at risk of stocking out in under 10 days',
  tenDays: '10 days',
  examples: 'Example questions',
  askerName: 'Laura Méndez',
  askerInitials: 'LM',
  totalLabel: 'Total change',
  totalValue: '−3.2 pp',
  metrics: 'Metrics',
  segments: 'Segments',
  connections: 'Connections',
  down: 'Drill down',
  act: 'Act',
  alert: 'Alert created: notify if the south-zone wholesale margin drops below 20%.',
  drawer: { crumbs: ['Gross margin', 'South-zone wholesale', 'Transactions'], title: 'Transactions behind the drop', cols: ['Date', 'Customer', 'Product', 'Qty', 'Price', 'Disc.', 'Margin'], foot: 'Each row links to the original record in the ERP.', close: 'Close transactions', qty: 'u', disc: 'disc.' },
  txAction: 'See transactions',
  alertAction: 'Create alert →',
  pause: 'Pause autoplay',
  play: 'Resume autoplay',
  kpisLabel: 'Indicators',
  chartAlt: (k: Kpi, x0: string) => (k.bars ? `${k.title}: 5 of 14 SKUs have less than 10 days of coverage.` : `${k.title}, from ${x0} to this week: ${k.v}, ${k.d}.`),
  bars: [['Yerba mate 1 kg', 3], ['Oil 900 ml', 4], ['Sugar 1 kg', 5], ['UHT milk 1 L', 6], ['Assorted cookies', 7], ...BAR_D.slice(5).map((d): [string, number] => ['', d])],
  kpis: [
    { k: 'Sales this week', v: '$86.4M', d: '+8% vs last week', t: 'pos', s: [79.2, 80.6, 78.8, 81.4, 80.2, 79.6, 81.8, 80.4, 79.4, 81.2, 80.0, 86.4], y: [75, 90, 5], unit: 'mill', title: 'Weekly sales · millions of pesos', hiC: '#3E9A64', mk: { i: 11, label: 'Opportunity', t: '+8% weekly · 2 customers reactivated', c: '#2F7D52', bd: '#BFDCC9' } },
    { k: 'Gross margin', v: '28.2%', d: '−3.2 pp vs last week', t: 'neg', s: [31.3, 31.5, 31.2, 31.6, 31.4, 31.7, 31.3, 31.5, 31.8, 31.4, 31.4, 28.2], y: [27, 32, 1], unit: 'pct', title: 'Weekly gross margin', hiC: '#0047FF', anom: true, mk: { i: 10, label: 'Anomaly', t: 'Since 9/1: resin cost +11%', c: '#0038CC', bd: '#A9C4FF' } },
    { k: 'Overdue receivables', v: en.mill(OVERDUE_TOTAL), d: `${DEBTORS} customers with overdue debt`, t: 'neu', s: OVERDUE_S, y: [42, 50, 2], unit: 'mill', title: 'Overdue receivables · millions of pesos', hiC: '#0B0B0C' },
    { k: 'Critical stock', v: '14 SKUs', d: '+5 vs last week', t: 'neg', s: [9, 9, 8, 9, 10, 9, 9, 10, 9, 9, 9, 14], bars: true, title: 'Days of coverage by SKU' },
    { k: 'Delayed orders', v: '9', d: 'vs 4 last week', t: 'neg', s: [4, 3, 5, 4, 4, 3, 5, 4, 4, 5, 4, 9], y: [0, 10, 2], unit: 'int', title: 'Delayed orders per week', hiC: '#0B0B0C' },
    { k: 'South-zone wholesale margin', v: '19.8%', d: '−5.1 pp vs last week', t: 'neg', s: [25.1, 25.3, 24.9, 25.2, 25.0, 25.4, 25.1, 24.8, 25.2, 25.0, 24.9, 19.8], y: [18, 27, 3], unit: 'pct', title: 'South-zone wholesale margin', hiC: '#0047FF' },
  ],
  qs: [
    { q: 'Why did margin drop this week?', kpi: 1, cuts: ['Zone', 'Product line'], lead: 'Margin fell from 31.4% to 28.2% (−3.2 pp). Three factors explain the change:', total: true,
      items: [{ t: 'Higher input costs', pp: '(−1.6 pp)', d: 'Resin +11% since September 1, not passed on to prices.', bar: [0, 50], seg: -1 }, { t: 'Wholesale discounts', pp: '(−1.1 pp)', d: 'Average discount up from 8% to 13% in the south zone.', bar: [50, 34.375], seg: 0 }, { t: 'Mix shift', pp: '(−0.5 pp)', d: 'More sales of the lower-margin basic line.', bar: [84.375, 15.625], seg: 1 }],
      metrics: [['28.2%', 'Gross margin'], ['+11%', 'Resin'], ['13%', 'Wholesale discount']], segs: ['South-zone wholesale', 'Basic line'], src: ['ERP · Sales', 'ERP · Costs', 'Price list'], down: ['See transactions', 'See affected customers'], act: ['Create alert →'] },
    { q: 'Which products could stock out this month?', kpi: 3, cuts: ['Period'], lead: '14 SKUs are at critical stock and 5 could run out in under 10 days. The most exposed ones account for $12.8M in committed orders.', items: [],
      metrics: [['14', 'critical SKUs'], ['5', 'at high risk'], ['8.4 days', 'average coverage']], segs: ['High risk', 'Committed orders'], src: ['ERP · Stock', 'WMS · Inventory', 'ERP · Orders', 'ERP · Purchasing'], down: ['See products'], act: ['Create suggested order →', 'Alert purchasing'] },
    { q: 'What positive opportunities came up this week?', kpi: 0, cuts: [], lead: 'Weekly sales grew 8%, two customers resumed buying after 60 days and the premium line improved its margin by +1.4 pp.',
      items: [{ t: 'Sales', pp: '', d: '+8% weekly, $86.4M.', pos: true }, { t: 'Customers', pp: '', d: '2 customers resumed buying after 60 days.', pos: true }, { t: 'Premium line', pp: '', d: 'Margin +1.4 pp.', pos: true }],
      metrics: [['$86.4M', 'Sales'], ['+8%', 'weekly'], ['2', 'reactivated customers'], ['+1.4 pp', 'premium margin']], segs: ['Reactivated customers', 'Premium line'], src: ['ERP · Sales', 'CRM · Accounts', 'ERP · Costs'], down: ['See reactivated customers', 'Analyze premium line'], act: ['Share insight →'] },
  ],
  tx: [['9/12', 'Mayorista El Sur', 'Basic line 1 kg', '1,200', '$2,140', '14%', '16.2%', 'FA-21044'], ['9/12', 'Distribuidora Litoral Sur', 'Basic line 500 g', '800', '$1,180', '13%', '17.8%', 'FA-21039'], ['9/11', 'Mayorista El Sur', 'Basic line 5 kg', '300', '$9,650', '15%', '15.4%', 'FA-21021'], ['9/10', 'Almacén del Puerto', 'Basic line 1 kg', '450', '$2,190', '12%', '18.9%', 'FA-21007'], ['9/9', 'Mayorista Austral', 'Basic line 1 kg', '950', '$2,120', '14%', '16.7%', 'FA-20988']],
};

export const BI: Record<Locale, BiCopy> = { es: ES, en: EN };
