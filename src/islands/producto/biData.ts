// Datos del explorador de Inteligencia (spec 007 §3.2), transcriptos de V4 L885–904 y biVals().
// D4: el inglés es traducción provisoria.
import type { Locale } from '../../i18n/routes';

export interface Kpi {
  k: string; v: string; d: string; t: 'pos' | 'neg' | 'neu'; s: number[];
  /** Eje Y: mínimo, máximo, paso; `unit` arma las etiquetas. */
  y?: [number, number, number]; unit?: 'M' | '%' | '';
  title: string; hiC?: string; anom?: boolean; bars?: boolean;
  mk?: { i: number; label: string; t: string; c: string; bd: string };
}
export interface BiQ {
  q: string; kpi: number; cuts: string[]; lead: string; total?: boolean;
  items: { t: string; pp: string; d: string; bar?: [number, number]; seg?: number; pos?: boolean }[];
  metrics: [string, string][]; segs: string[]; src: string[];
  /** `tx` abre las transacciones; `alert` crea la alerta. */
  down: { l: string; tx?: boolean }[]; act: { l: string; alert?: boolean }[];
}
export interface BiCopy {
  kicker: string; title: string; lead: string; caption: string;
  caps: string[];
  app: string; company: string; live: string; liveShort: string;
  kpis: Kpi[];
  bars: [string, number][];
  barsRisk: string; tenDays: string;
  cutsLabel: string; cuts: string[]; cutVals: Record<string, string>; cutsApplied: (n: number) => string;
  periods: [string, string, string]; x0: [string, string, string]; thisWeek: string;
  examples: string; asker: string; total: string; totalV: string;
  metrics: string; segments: string; connections: string; down: string; act: string;
  alert: string; anomaly: string;
  crumbs: [string, string, string]; txTitle: string; txH: [string, string, string, string, string, string, string];
  txSource: string; txFoot: string; units: string; disc: string; close: string;
  qs: BiQ[];
  tx: [string, string, string, string, string, string, string, string][];
}

export const BI: Record<Locale, BiCopy> = {
  es: {
    kicker: 'Inteligencia / BI',
    title: 'Entendé qué está pasando y por qué.',
    lead: 'Explorá métricas sobre datos vivos, detectá cambios y llegá desde una pregunta hasta el dato que la explica.',
    caption: 'Probá “Ver transacciones” para bajar del KPI al detalle.',
    caps: ['Lenguaje natural', 'Métricas sobre datos vivos', 'Trazabilidad hasta la fuente', 'Del KPI a la transacción', 'Anomalías y excepciones', 'Acciones desde el análisis'],
    app: 'Inteligencia', company: 'Distribuidora Andes · datos ilustrativos', live: 'Datos en vivo · ERP sincronizado hace 3 min', liveShort: 'Datos en vivo',
    kpis: [
      { k: 'Ventas de la semana', v: '$86,4 M', d: '+8% vs semana anterior', t: 'pos', s: [79.2, 80.6, 78.8, 81.4, 80.2, 79.6, 81.8, 80.4, 79.4, 81.2, 80.0, 86.4], y: [75, 90, 5], unit: 'M', title: 'Ventas semanales · millones de pesos', hiC: '#3E9A64', mk: { i: 11, label: 'Oportunidad', t: '+8% semanal · 2 clientes reactivados', c: '#2F7D52', bd: '#BFDCC9' } },
      { k: 'Margen bruto', v: '28,2%', d: '−3,2 pp vs semana anterior', t: 'neg', s: [31.3, 31.5, 31.2, 31.6, 31.4, 31.7, 31.3, 31.5, 31.8, 31.4, 31.4, 28.2], y: [27, 32, 1], unit: '%', title: 'Margen bruto semanal', hiC: '#0047FF', anom: true, mk: { i: 10, label: 'Anomalía', t: 'Desde el 1/9: costo de resina +11%', c: '#0038CC', bd: '#A9C4FF' } },
      { k: 'Cobranzas vencidas', v: '$41,2 M', d: 'Concentradas en 6 clientes', t: 'neu', s: [36.8, 37.2, 36.5, 37.9, 38.4, 38.1, 38.9, 39.4, 39.0, 39.8, 40.3, 41.2], y: [34, 44, 2], unit: 'M', title: 'Cobranzas vencidas · millones de pesos', hiC: '#0B0B0C' },
      { k: 'Stock crítico', v: '14 SKUs', d: '+5 vs semana anterior', t: 'neg', s: [9, 9, 8, 9, 10, 9, 9, 10, 9, 9, 9, 14], bars: true, title: 'Días de cobertura por SKU' },
      { k: 'Pedidos demorados', v: '9', d: 'vs 4 la semana anterior', t: 'neg', s: [4, 3, 5, 4, 4, 3, 5, 4, 4, 5, 4, 9], y: [0, 10, 2], unit: '', title: 'Pedidos demorados por semana', hiC: '#0B0B0C' },
      { k: 'Margen mayoristas zona sur', v: '19,8%', d: '−5,1 pp vs semana anterior', t: 'neg', s: [25.1, 25.3, 24.9, 25.2, 25.0, 25.4, 25.1, 24.8, 25.2, 25.0, 24.9, 19.8], y: [18, 27, 3], unit: '%', title: 'Margen mayoristas zona sur', hiC: '#0047FF' },
    ],
    bars: [['Yerba 1 kg', 3], ['Aceite 900 ml', 4], ['Azúcar 1 kg', 5], ['Leche larga vida 1 L', 6], ['Galletitas surtidas', 7], ['', 10.2], ['', 10.2], ['', 10.2], ['', 10.2], ['', 10.2], ['', 10.2], ['', 10.2], ['', 10.4], ['', 10.8]],
    barsRisk: '5 SKUs con riesgo de quiebre en menos de 10 días', tenDays: '10 días',
    cutsLabel: 'Cortes', cuts: ['Canal', 'Cliente', 'Zona', 'Línea de producto', 'Vendedor', 'Período'],
    cutVals: { Zona: 'Sur', 'Línea de producto': 'Básica', 'Período': 'este mes' },
    cutsApplied: (n) => `Cortes · ${n} ${n > 1 ? 'aplicados' : 'aplicado'}`,
    periods: ['4 semanas', '12 semanas', '6 meses'], x0: ['Hace 4 semanas', 'Hace 12 semanas', 'Hace 6 meses'], thisWeek: 'Esta semana',
    examples: 'Preguntas de ejemplo', asker: 'Laura Méndez', total: 'Variación total', totalV: '−3,2 pp',
    metrics: 'Métricas', segments: 'Segmentos', connections: 'Conexiones', down: 'Bajar al dato', act: 'Actuar',
    alert: 'Alerta creada: avisar si el margen de mayoristas zona sur baja de 20%.', anomaly: 'Anomalía detectada',
    crumbs: ['Margen bruto', 'Mayoristas zona sur', 'Transacciones'], txTitle: 'Transacciones que explican la caída',
    txH: ['Fecha', 'Cliente', 'Producto', 'Cant.', 'Precio', 'Desc.', 'Margen'], txSource: 'ERP · Ventas', txFoot: 'Cada fila enlaza al registro original en el ERP.',
    units: 'u', disc: 'desc.', close: 'Cerrar',
    qs: [
      {
        q: '¿Por qué cayó el margen esta semana?', kpi: 1, cuts: ['Zona', 'Línea de producto'], total: true,
        lead: 'El margen bajó de 31,4% a 28,2% (−3,2 pp). Tres factores explican la variación:',
        items: [
          { t: 'Mayor costo de insumos', pp: '(−1,6 pp)', d: 'Resina +11% desde el 1 de septiembre, sin traslado a precio.', bar: [0, 50], seg: -1 },
          { t: 'Descuentos en mayoristas', pp: '(−1,1 pp)', d: 'Descuento promedio de 8% a 13% en zona sur.', bar: [50, 34.375], seg: 0 },
          { t: 'Cambio de mix', pp: '(−0,5 pp)', d: 'Más ventas de línea básica, de menor margen.', bar: [84.375, 15.625], seg: 1 },
        ],
        metrics: [['28,2%', 'Margen bruto'], ['+11%', 'Resina'], ['13%', 'Descuento mayoristas']], segs: ['Mayoristas zona sur', 'Línea básica'],
        src: ['ERP · Ventas', 'ERP · Costos', 'Lista de precios'], down: [{ l: 'Ver transacciones', tx: true }, { l: 'Ver clientes afectados' }], act: [{ l: 'Crear alerta →', alert: true }],
      },
      {
        q: '¿Qué productos pueden quebrar stock este mes?', kpi: 3, cuts: ['Período'],
        lead: 'Hay 14 SKUs en stock crítico y 5 podrían quebrar en menos de 10 días. Los más comprometidos concentran $12,8 M en pedidos ya comprometidos.',
        items: [], metrics: [['14', 'SKUs críticos'], ['5', 'con riesgo alto'], ['8,4 días', 'de cobertura promedio']], segs: ['Riesgo alto', 'Pedidos comprometidos'],
        src: ['ERP · Stock', 'WMS · Inventario', 'ERP · Pedidos', 'ERP · Compras'], down: [{ l: 'Ver productos' }], act: [{ l: 'Crear orden sugerida →' }, { l: 'Alertar a compras' }],
      },
      {
        q: '¿Qué oportunidades positivas aparecieron esta semana?', kpi: 0, cuts: [],
        lead: 'Las ventas semanales crecieron 8%, dos clientes retomaron compras después de 60 días y la línea premium mejoró su margen en +1,4 pp.',
        items: [{ t: 'Ventas', pp: '', d: '+8% semanal, $86,4 M.', pos: true }, { t: 'Clientes', pp: '', d: '2 clientes retomaron compras después de 60 días.', pos: true }, { t: 'Línea premium', pp: '', d: 'Margen +1,4 pp.', pos: true }],
        metrics: [['$86,4 M', 'Ventas'], ['+8%', 'semanal'], ['2', 'clientes reactivados'], ['+1,4 pp', 'margen premium']], segs: ['Clientes reactivados', 'Línea premium'],
        src: ['ERP · Ventas', 'CRM · Cuentas', 'ERP · Costos'], down: [{ l: 'Ver clientes reactivados' }, { l: 'Analizar línea premium' }], act: [{ l: 'Compartir insight →' }],
      },
    ],
    tx: [
      ['12/9', 'Mayorista El Sur', 'Línea básica 1 kg', '1.200', '$2.140', '14%', '16,2%', 'FA-21044'],
      ['12/9', 'Distribuidora Litoral Sur', 'Línea básica 500 g', '800', '$1.180', '13%', '17,8%', 'FA-21039'],
      ['11/9', 'Mayorista El Sur', 'Línea básica 5 kg', '300', '$9.650', '15%', '15,4%', 'FA-21021'],
      ['10/9', 'Almacén del Puerto', 'Línea básica 1 kg', '450', '$2.190', '12%', '18,9%', 'FA-21007'],
      ['9/9', 'Mayorista Austral', 'Línea básica 1 kg', '950', '$2.120', '14%', '16,7%', 'FA-20988'],
    ],
  },
  en: {
    kicker: 'Intelligence / BI',
    title: 'Understand what’s happening and why.',
    lead: 'Explore metrics on live data, spot changes and get from a question to the record that explains it.',
    caption: 'Try “See transactions” to drill down from the KPI to the detail.',
    caps: ['Natural language', 'Metrics on live data', 'Traceable to the source', 'From KPI to transaction', 'Anomalies and exceptions', 'Actions from the analysis'],
    app: 'Intelligence', company: 'Distribuidora Andes · illustrative data', live: 'Live data · ERP synced 3 min ago', liveShort: 'Live data',
    kpis: [
      { k: 'Sales this week', v: '$86.4M', d: '+8% vs last week', t: 'pos', s: [79.2, 80.6, 78.8, 81.4, 80.2, 79.6, 81.8, 80.4, 79.4, 81.2, 80.0, 86.4], y: [75, 90, 5], unit: 'M', title: 'Weekly sales · millions of pesos', hiC: '#3E9A64', mk: { i: 11, label: 'Opportunity', t: '+8% weekly · 2 customers reactivated', c: '#2F7D52', bd: '#BFDCC9' } },
      { k: 'Gross margin', v: '28.2%', d: '−3.2 pp vs last week', t: 'neg', s: [31.3, 31.5, 31.2, 31.6, 31.4, 31.7, 31.3, 31.5, 31.8, 31.4, 31.4, 28.2], y: [27, 32, 1], unit: '%', title: 'Weekly gross margin', hiC: '#0047FF', anom: true, mk: { i: 10, label: 'Anomaly', t: 'Since 9/1: resin cost +11%', c: '#0038CC', bd: '#A9C4FF' } },
      { k: 'Overdue receivables', v: '$41.2M', d: 'Concentrated in 6 customers', t: 'neu', s: [36.8, 37.2, 36.5, 37.9, 38.4, 38.1, 38.9, 39.4, 39.0, 39.8, 40.3, 41.2], y: [34, 44, 2], unit: 'M', title: 'Overdue receivables · millions of pesos', hiC: '#0B0B0C' },
      { k: 'Critical stock', v: '14 SKUs', d: '+5 vs last week', t: 'neg', s: [9, 9, 8, 9, 10, 9, 9, 10, 9, 9, 9, 14], bars: true, title: 'Days of coverage by SKU' },
      { k: 'Delayed orders', v: '9', d: 'vs 4 last week', t: 'neg', s: [4, 3, 5, 4, 4, 3, 5, 4, 4, 5, 4, 9], y: [0, 10, 2], unit: '', title: 'Delayed orders per week', hiC: '#0B0B0C' },
      { k: 'South-zone wholesale margin', v: '19.8%', d: '−5.1 pp vs last week', t: 'neg', s: [25.1, 25.3, 24.9, 25.2, 25.0, 25.4, 25.1, 24.8, 25.2, 25.0, 24.9, 19.8], y: [18, 27, 3], unit: '%', title: 'South-zone wholesale margin', hiC: '#0047FF' },
    ],
    bars: [['Yerba mate 1 kg', 3], ['Oil 900 ml', 4], ['Sugar 1 kg', 5], ['UHT milk 1 L', 6], ['Assorted cookies', 7], ['', 10.2], ['', 10.2], ['', 10.2], ['', 10.2], ['', 10.2], ['', 10.2], ['', 10.2], ['', 10.4], ['', 10.8]],
    barsRisk: '5 SKUs at risk of stockout in under 10 days', tenDays: '10 days',
    cutsLabel: 'Filters', cuts: ['Channel', 'Customer', 'Zone', 'Product line', 'Sales rep', 'Period'],
    cutVals: { Zone: 'South', 'Product line': 'Basic', Period: 'this month' },
    cutsApplied: (n) => `Filters · ${n} applied`,
    periods: ['4 weeks', '12 weeks', '6 months'], x0: ['4 weeks ago', '12 weeks ago', '6 months ago'], thisWeek: 'This week',
    examples: 'Example questions', asker: 'Laura Méndez', total: 'Total change', totalV: '−3.2 pp',
    metrics: 'Metrics', segments: 'Segments', connections: 'Connections', down: 'Drill down', act: 'Act',
    alert: 'Alert created: notify if south-zone wholesale margin falls below 20%.', anomaly: 'Anomaly detected',
    crumbs: ['Gross margin', 'South-zone wholesalers', 'Transactions'], txTitle: 'Transactions behind the drop',
    txH: ['Date', 'Customer', 'Product', 'Qty', 'Price', 'Disc.', 'Margin'], txSource: 'ERP · Sales', txFoot: 'Every row links to the original record in the ERP.',
    units: 'u', disc: 'disc.', close: 'Close',
    qs: [
      {
        q: 'Why did margin drop this week?', kpi: 1, cuts: ['Zone', 'Product line'], total: true,
        lead: 'Margin fell from 31.4% to 28.2% (−3.2 pp). Three factors explain the change:',
        items: [
          { t: 'Higher input costs', pp: '(−1.6 pp)', d: 'Resin +11% since September 1, not passed on to price.', bar: [0, 50], seg: -1 },
          { t: 'Wholesale discounts', pp: '(−1.1 pp)', d: 'Average discount up from 8% to 13% in the south zone.', bar: [50, 34.375], seg: 0 },
          { t: 'Mix change', pp: '(−0.5 pp)', d: 'More sales of the lower-margin basic line.', bar: [84.375, 15.625], seg: 1 },
        ],
        metrics: [['28.2%', 'Gross margin'], ['+11%', 'Resin'], ['13%', 'Wholesale discount']], segs: ['South-zone wholesalers', 'Basic line'],
        src: ['ERP · Sales', 'ERP · Costs', 'Price list'], down: [{ l: 'See transactions', tx: true }, { l: 'See affected customers' }], act: [{ l: 'Create alert →', alert: true }],
      },
      {
        q: 'Which products could run out of stock this month?', kpi: 3, cuts: ['Period'],
        lead: 'There are 14 SKUs in critical stock and 5 could run out in under 10 days. The most exposed account for $12.8M in committed orders.',
        items: [], metrics: [['14', 'critical SKUs'], ['5', 'at high risk'], ['8.4 days', 'average coverage']], segs: ['High risk', 'Committed orders'],
        src: ['ERP · Stock', 'WMS · Inventory', 'ERP · Orders', 'ERP · Purchasing'], down: [{ l: 'See products' }], act: [{ l: 'Create suggested order →' }, { l: 'Alert purchasing' }],
      },
      {
        q: 'What positive opportunities showed up this week?', kpi: 0, cuts: [],
        lead: 'Weekly sales grew 8%, two customers resumed buying after 60 days and the premium line improved its margin by +1.4 pp.',
        items: [{ t: 'Sales', pp: '', d: '+8% weekly, $86.4M.', pos: true }, { t: 'Customers', pp: '', d: '2 customers resumed buying after 60 days.', pos: true }, { t: 'Premium line', pp: '', d: 'Margin +1.4 pp.', pos: true }],
        metrics: [['$86.4M', 'Sales'], ['+8%', 'weekly'], ['2', 'customers reactivated'], ['+1.4 pp', 'premium margin']], segs: ['Reactivated customers', 'Premium line'],
        src: ['ERP · Sales', 'CRM · Accounts', 'ERP · Costs'], down: [{ l: 'See reactivated customers' }, { l: 'Analyze premium line' }], act: [{ l: 'Share insight →' }],
      },
    ],
    tx: [
      ['9/12', 'Mayorista El Sur', 'Basic line 1 kg', '1,200', '$2,140', '14%', '16.2%', 'FA-21044'],
      ['9/12', 'Distribuidora Litoral Sur', 'Basic line 500 g', '800', '$1,180', '13%', '17.8%', 'FA-21039'],
      ['9/11', 'Mayorista El Sur', 'Basic line 5 kg', '300', '$9,650', '15%', '15.4%', 'FA-21021'],
      ['9/10', 'Almacén del Puerto', 'Basic line 1 kg', '450', '$2,190', '12%', '18.9%', 'FA-21007'],
      ['9/9', 'Mayorista Austral', 'Basic line 1 kg', '950', '$2,120', '14%', '16.7%', 'FA-20988'],
    ],
  },
};
