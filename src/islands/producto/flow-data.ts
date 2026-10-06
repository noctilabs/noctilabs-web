// Agentes de Producto (spec 007 §3.C): los tres agentes de `Agent Flow.dc.html` de la v4 (AG y SKUS), literal en ES.
// Cobranzas «En gestión» sale de facts.ts (datos coherentes, spec 007 F3).
// EN provisorio (spec 007 F4): i18n-en.js no trae estas claves; pendiente de revisión del dueño.
import { OVER_30 } from '../noctiapp/data/facts';
import type { Locale } from '../noctiapp/data/types';

export type FIcon = 'clock' | 'erp' | 'web' | 'doc' | 'bot' | 'comp' | 'chat' | 'mail' | 'crm' | 'act';
export const FICONS: Record<FIcon, string> = {
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  erp: 'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  web: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20',
  doc: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6',
  bot: 'M12 8V4H8M6 8h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zM9 13v2M15 13v2',
  comp: 'M12 2l9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5',
  chat: 'M21 12a8 8 0 0 1-11.8 7L3 21l2-6A8 8 0 1 1 21 12z',
  mail: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM3 7l9 6 9-6',
  crm: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  act: 'M13 2L3 14h9l-1 8 10-12h-9z',
};

export interface FNode { type: string; ic: FIcon; t: string; r?: string; dur?: string; src: string[]; rule: string; out: string; ruleD?: string; appr?: boolean; from?: number; count?: [number, 'm' | 'i', string] }
export interface Agent {
  name: string;
  desc: string;
  approver: string;
  trigger: FNode;
  par: FNode[];
  comp: FNode;
  branch: FNode[];
  down: FNode[];
  card: { text: string; h: [string, string, string]; rows: [string, string, string][]; note: string; b1: string; b2: string; drawer?: boolean };
  results: [number, 'm' | 'i', string, '' | 'appr' | 'amber'][];
}
export interface FlowCopy {
  agents: [Agent, Agent, Agent];
  skus: [string, string, string, string, string, string][];
  chips: [string, string, string, string, string, string];
  replay: string;
  pause: string;
  play: string;
  agentsLabel: string;
  tag: Record<'pend' | 'hold' | 'run' | 'done' | 'appr' | 'okA' | 'rej' | 'cancel', string>;
  ready: (dur: string) => string;
  head: { rej: string; done: string; wait: (mmss: string) => string; run: string; idle: string };
  card: { appr: string; rej: string; need: string; pend: string; prep: string; rejNote: string; by: (who: string) => string };
  groups: [string, string, string, string, string];
  sources: string;
  rule: string;
  result: string;
  resultTitle: string;
  audit: string;
  skuTitle: string;
  skuCols: [string, string, string, string, string, string];
  skuSource: string;
  close: string;
  canvasLabel: string;
  num: (v: number, k: 'm' | 'i') => string;
}

const ES: FlowCopy = {
  agents: [
    { name: 'Agente de vencimientos y stock parado', desc: 'Cada lunes revisa los lotes que vencen pronto y el stock que no se vende hace 90 días, propone qué promocionar, qué devolver y qué liquidar, y deja las acciones listas para aprobar.', approver: 'Laura Méndez · CEO',
      trigger: { type: 'Disparador', ic: 'clock', t: 'Lunes 7:00', r: 'Revisión semanal', src: ['Programación semanal'], rule: 'Se ejecuta cada lunes a las 7:00.', out: 'Corrida iniciada.' },
      par: [{ type: 'Agente · ERP', ic: 'erp', t: 'Lotes por vencer', r: '103 lotes vencen antes del 30/11', dur: '1,7 s', src: ['ERP · Lotes', 'ERP · Stock'], rule: 'Lotes que vencen en los próximos 60 días.', out: '103 lotes detectados.' }, { type: 'Agente · ERP', ic: 'erp', t: 'Stock sin rotación', r: '224 SKUs sin venta en 90 días', dur: '2,1 s', src: ['ERP · Ventas', 'ERP · Stock'], rule: 'Sin ventas en los últimos 90 días.', out: '224 SKUs detectados.' }, { type: 'Agente · Tienda online', ic: 'web', t: 'Precio y rotación', r: '2.400 SKUs activos', dur: '1,4 s', src: ['Tienda online · Catálogo'], rule: 'Precio vigente y ventas online por SKU.', out: '2.400 SKUs analizados.' }],
      comp: { type: 'Composición', ic: 'comp', t: 'Priorizar y proponer acción', count: [64.9, 'm', ' en juego'], rule: 'Regla: vence en menos de 60 días → promoción · resto → canje o liquidación según proveedor', src: ['Resultados de los 3 agentes', 'Acuerdos con proveedores'], ruleD: 'Vence en menos de 60 días → promoción; resto → canje o liquidación.', out: '$64,9 M en juego.' },
      branch: [{ type: 'Acción · ERP', ic: 'act', t: 'Crear 77 promociones', r: '20 % hasta el vencimiento del lote', appr: true, src: ['ERP · Precios'], rule: 'Las promociones salen con aprobación.', out: '77 promociones listas para publicar.' }, { type: 'Agente', ic: 'bot', t: 'Proponer canjes', r: '171 SKUs · lácteos, galletitas, bebidas', src: ['Acuerdos con proveedores'], rule: 'Canje según condiciones de cada proveedor.', out: '171 SKUs propuestos para canje.' }],
      down: [{ type: 'Acción · Tienda online', ic: 'web', t: 'Publicar precios en la web', r: '77 SKUs en promoción', from: 0, src: ['Tienda online · Precios'], rule: 'Solo SKUs aprobados.', out: '77 precios publicados.' }, { type: 'Acción · WhatsApp', ic: 'chat', t: 'Avisar a vendedores', r: 'Qué ofrecer esta semana', from: 0, src: ['WhatsApp Business'], rule: 'Aviso a vendedores de cada zona.', out: 'Vendedores avisados.' }, { type: 'Acción · Mail', ic: 'mail', t: 'Pedir canje a proveedores', r: 'Borradores para compras', from: 1, src: ['Correo · Compras'], rule: 'Borradores para revisión de compras.', out: 'Borradores listos.' }],
      card: { text: 'Esta semana hay $4,6 M en lotes que vencen antes del 30/11 y $60,3 M en stock sin venta hace 90 días o más.', h: ['Acción propuesta', 'SKUs', '$'], rows: [['Promoción hasta el vencimiento', '77', '$4,6 M'], ['Canje o devolución al proveedor', '171', '$35,7 M'], ['Liquidación en sucursales', '53', '$24,6 M']], note: 'Las promociones y los canjes salen con tu aprobación. La liquidación la decide comercial.', b1: 'Aprobar promociones y canjes', b2: 'Ver la lista por SKU', drawer: true },
      results: [[224, 'i', 'SKUs sin venta en 90 días', ''], [103, 'i', 'Lotes que vencen antes del 30/11', ''], [4.6, 'm', 'Promocionado antes de vencer', 'appr'], [60.3, 'm', 'Inmovilizado sin rotación', 'amber']] },
    { name: 'Agente de compras', desc: 'Detecta faltantes, consulta contratos y políticas, prepara la orden de compra y la deja lista para aprobar cuando supera el límite.', approver: 'Martín López · Finanzas',
      trigger: { type: 'Disparador', ic: 'act', t: 'Stock bajo del SKU 4410', r: 'Debajo del stock mínimo', src: ['ERP · Stock'], rule: 'Stock mínimo por SKU.', out: 'Corrida iniciada.' },
      par: [{ type: 'Agente · ERP', ic: 'erp', t: 'Stock y consumo', r: 'Cobertura por debajo del mínimo', dur: '1,2 s', src: ['ERP · Stock', 'ERP · Consumo'], rule: 'Consumo de las últimas 8 semanas.', out: 'Cantidad a reponer calculada.' }, { type: 'Agente · Drive', ic: 'doc', t: 'Contrato Plastar 2026', r: 'Precios y condiciones vigentes', dur: '1,9 s', src: ['Contrato Plastar 2026.pdf'], rule: 'Proveedor con contrato vigente.', out: 'Condiciones del contrato.' }, { type: 'Agente · Políticas', ic: 'doc', t: 'Política de compras', r: 'Límite de $10.000.000', dur: '0,8 s', src: ['Política de compras'], rule: 'Límites de compra automática.', out: 'Límite identificado.' }],
      comp: { type: 'Composición', ic: 'comp', t: 'Preparar orden', r: 'OC-4471 · Plastar S.A. · $18.400.000', rule: 'Regla: compras mayores a $10.000.000 requieren aprobación de Finanzas', src: ['ERP · Compras'], ruleD: 'Compras mayores a $10.000.000 requieren aprobación de Finanzas.', out: 'OC-4471 preparada.' },
      branch: [{ type: 'Acción · ERP', ic: 'act', t: 'Emitir OC-4471', r: 'Aprobación: Martín López · Finanzas', appr: true, src: ['ERP · Compras'], rule: 'Supera el límite de compra automática.', out: 'OC-4471 emitida.' }],
      down: [{ type: 'Acción · Mail', ic: 'mail', t: 'Enviar orden al proveedor', r: 'Plastar S.A.', from: 0, src: ['Correo · Compras'], rule: 'Envío al contacto del contrato.', out: 'Orden enviada.' }, { type: 'Acción · WhatsApp', ic: 'chat', t: 'Avisar a depósito', r: 'Entrega estimada en 5 días', from: 0, src: ['WhatsApp Business'], rule: 'Aviso al responsable de recepción.', out: 'Depósito avisado.' }],
      card: { text: 'OC-4471 a Plastar S.A. por $18.400.000 supera el límite de $10.000.000 para compras automáticas.', h: ['Acción propuesta', 'Órdenes', '$'], rows: [['Emitir OC-4471 · Plastar S.A.', '1', '$18,4 M']], note: 'Regla: compras mayores a $10.000.000 requieren aprobación de Finanzas. Fuentes: ERP · Stock · Contrato Plastar 2026 · Política de compras.', b1: 'Aprobar', b2: 'Rechazar' },
      results: [[1, 'i', 'Orden de compra', ''], [18.4, 'm', 'Monto de la orden', ''], [5, 'i', 'Días de entrega estimada', '']] },
    { name: 'Agente de cobranzas', desc: 'Todos los días revisa facturas vencidas, prioriza casos, envía recordatorios dentro de las reglas y pide aprobación para las excepciones.', approver: 'Martín López · Finanzas',
      trigger: { type: 'Disparador', ic: 'clock', t: 'Todos los días 8:00', r: 'Revisión diaria', src: ['Programación diaria'], rule: 'Se ejecuta todos los días a las 8:00.', out: 'Corrida iniciada.' },
      par: [{ type: 'Agente · ERP', ic: 'erp', t: 'Facturas vencidas', r: '23 facturas', dur: '1,1 s', src: ['ERP · Cuentas a cobrar'], rule: 'Facturas con vencimiento superado.', out: '23 facturas vencidas.' }, { type: 'Agente · CRM', ic: 'crm', t: 'Historial de cobranza', r: 'Antigüedad y riesgo por cliente', dur: '1,6 s', src: ['CRM · Historial de cobranza'], rule: 'Historial de pagos de cada cliente.', out: 'Riesgo por cliente.' }, { type: 'Agente · Correo', ic: 'mail', t: 'Comprobantes recibidos', r: 'Pagos informados por clientes', dur: '0,9 s', src: ['Correo · Cobranzas'], rule: 'Comprobantes adjuntos de los últimos 7 días.', out: 'Pagos informados detectados.' }],
      comp: { type: 'Composición', ic: 'comp', t: 'Priorizar casos', count: [8, 'i', ' casos por monto, antigüedad y riesgo'], rule: 'Regla: planes de pago fuera de política requieren aprobación', src: ['Resultados de los 3 agentes'], ruleD: 'Planes de pago fuera de política requieren aprobación.', out: '8 casos priorizados.' },
      branch: [{ type: 'Acción · WhatsApp', ic: 'chat', t: 'Enviar 6 recordatorios', r: 'Dentro de las reglas de contacto', src: ['WhatsApp Business'], rule: 'Envíos dentro de las reglas de contacto.', out: '6 recordatorios enviados.' }, { type: 'Acción', ic: 'act', t: 'Plan de pago Mayorista El Sur', r: 'Fuera de política', appr: true, src: ['ERP · Cuentas a cobrar', 'WhatsApp'], rule: 'Planes fuera de política requieren aprobación.', out: 'Plan de pago aprobado.' }],
      down: [{ type: 'Acción · ERP', ic: 'erp', t: 'Conciliar facturas pagadas', r: 'Con los comprobantes recibidos', from: 0, src: ['ERP · Cuentas a cobrar', 'Correo · Cobranzas'], rule: 'Conciliación con comprobante.', out: 'Facturas conciliadas.' }],
      card: { text: 'Mayorista El Sur pide un plan de pago fuera de política. El resto de los casos sigue dentro de las reglas.', h: ['Acción propuesta', 'Alcance', 'Estado'], rows: [['Enviar recordatorios', '6 facturas', 'Automático'], ['Plan de pago · Mayorista El Sur', '1 cliente', 'Aprobación']], note: 'Los recordatorios salen dentro de las reglas. El plan de pago necesita aprobación de Finanzas.', b1: 'Aprobar', b2: 'Rechazar' },
      results: [[23, 'i', 'Facturas vencidas', ''], [8, 'i', 'Priorizadas', ''], [6, 'i', 'Recordatorios enviados', ''], [OVER_30 / 1e6, 'm', 'En gestión', '']] },
  ],
  skus: [['4410-17', 'Yogur bebible 1 L', 'L2611', '18/11', '340', 'Promoción 20 %'], ['2208-03', 'Galletitas surtidas 400 g', 'L2587', '22/11', '1.120', 'Promoción 20 %'], ['1902-08', 'Leche larga vida 1 L', 'L2620', '27/11', '2.040', 'Promoción 20 %'], ['3105-11', 'Jugo en polvo x 20', 'L2499', '—', '860', 'Canje proveedor'], ['5521-02', 'Gaseosa 2,25 L', 'L2410', '—', '640', 'Liquidación']],
  chips: ['Crear o integrar', 'Sistemas, fuentes y herramientas', 'Permisos, reglas y acciones', 'Probar, publicar y versionar', 'Tareas, excepciones y aprobaciones', 'Historial y consumo de tokens'],
  replay: '↻ Ejecutar de nuevo',
  pause: 'Pausar',
  play: 'Reanudar',
  agentsLabel: 'Agentes',
  tag: { pend: 'En espera', hold: 'En espera', run: 'Ejecutando…', done: 'Listo', appr: 'Necesita tu aprobación', okA: 'Aprobado', rej: 'Rechazado', cancel: 'Cancelado' },
  ready: (d) => `Listo · ${d}`,
  head: { rej: 'Rechazado', done: 'Completado', wait: (m) => `Esperando aprobación · ${m}`, run: 'Ejecutando…', idle: 'Lista para ejecutar' },
  card: { appr: 'Aprobado', rej: 'Rechazado', need: 'Necesita tu aprobación', pend: 'Pendiente', prep: 'En preparación', rejNote: 'Rechazado · el agente registró el motivo y no ejecutó las acciones.', by: (w) => `Aprobado por ${w}` },
  groups: ['Disparador', 'En paralelo', 'Composición', 'Acciones', 'Después de aprobar'],
  sources: 'Fuentes',
  rule: 'Regla',
  result: 'Resultado',
  resultTitle: 'Resultado de la corrida',
  audit: 'Registrado en auditoría ✓',
  skuTitle: 'Lista por SKU · muestra',
  skuCols: ['SKU', 'Producto', 'Lote', 'Vence', 'Stock', 'Acción'],
  skuSource: 'Fuente · ERP · Lotes y stock',
  close: 'Cerrar',
  canvasLabel: 'Flujo del agente',
  num: (v, k) => (k === 'm' ? '$' + v.toFixed(1).replace('.', ',') + ' M' : Math.round(v).toLocaleString('es-AR')),
};

const EN: FlowCopy = {
  agents: [
    { name: 'Expiring and slow-moving stock agent', desc: 'Every Monday it reviews batches that expire soon and stock that hasn’t sold in 90 days, proposes what to promote, return or clear, and leaves the actions ready for approval.', approver: 'Laura Méndez · CEO',
      trigger: { type: 'Trigger', ic: 'clock', t: 'Monday 7:00', r: 'Weekly review', src: ['Weekly schedule'], rule: 'Runs every Monday at 7:00.', out: 'Run started.' },
      par: [{ type: 'Agent · ERP', ic: 'erp', t: 'Expiring batches', r: '103 batches expire before 11/30', dur: '1.7 s', src: ['ERP · Batches', 'ERP · Stock'], rule: 'Batches expiring in the next 60 days.', out: '103 batches found.' }, { type: 'Agent · ERP', ic: 'erp', t: 'Slow-moving stock', r: '224 SKUs with no sales in 90 days', dur: '2.1 s', src: ['ERP · Sales', 'ERP · Stock'], rule: 'No sales in the last 90 days.', out: '224 SKUs found.' }, { type: 'Agent · Online store', ic: 'web', t: 'Price and turnover', r: '2,400 active SKUs', dur: '1.4 s', src: ['Online store · Catalog'], rule: 'Current price and online sales by SKU.', out: '2,400 SKUs analyzed.' }],
      comp: { type: 'Composition', ic: 'comp', t: 'Prioritize and propose action', count: [64.9, 'm', ' at stake'], rule: 'Rule: expires in under 60 days → promotion · rest → swap or clearance per supplier', src: ['Results from the 3 agents', 'Supplier agreements'], ruleD: 'Expires in under 60 days → promotion; rest → swap or clearance.', out: '$64.9M at stake.' },
      branch: [{ type: 'Action · ERP', ic: 'act', t: 'Create 77 promotions', r: '20% until the batch expires', appr: true, src: ['ERP · Prices'], rule: 'Promotions go out with approval.', out: '77 promotions ready to publish.' }, { type: 'Agent', ic: 'bot', t: 'Propose swaps', r: '171 SKUs · dairy, cookies, drinks', src: ['Supplier agreements'], rule: 'Swap per each supplier’s terms.', out: '171 SKUs proposed for swap.' }],
      down: [{ type: 'Action · Online store', ic: 'web', t: 'Publish prices online', r: '77 SKUs on promotion', from: 0, src: ['Online store · Prices'], rule: 'Approved SKUs only.', out: '77 prices published.' }, { type: 'Action · WhatsApp', ic: 'chat', t: 'Notify sales reps', r: 'What to offer this week', from: 0, src: ['WhatsApp Business'], rule: 'Notice to each zone’s reps.', out: 'Reps notified.' }, { type: 'Action · Email', ic: 'mail', t: 'Request swaps from suppliers', r: 'Drafts for purchasing', from: 1, src: ['Email · Purchasing'], rule: 'Drafts for purchasing to review.', out: 'Drafts ready.' }],
      card: { text: 'This week there is $4.6M in batches expiring before 11/30 and $60.3M in stock with no sales for 90 days or more.', h: ['Proposed action', 'SKUs', '$'], rows: [['Promotion until expiry', '77', '$4.6M'], ['Swap or return to supplier', '171', '$35.7M'], ['Clearance in branches', '53', '$24.6M']], note: 'Promotions and swaps go out with your approval. Sales decides on clearance.', b1: 'Approve promotions and swaps', b2: 'See the SKU list', drawer: true },
      results: [[224, 'i', 'SKUs with no sales in 90 days', ''], [103, 'i', 'Batches expiring before 11/30', ''], [4.6, 'm', 'Promoted before expiry', 'appr'], [60.3, 'm', 'Tied up in slow-moving stock', 'amber']] },
    { name: 'Purchasing agent', desc: 'Detects shortages, checks contracts and policies, prepares the purchase order and leaves it ready for approval when it exceeds the limit.', approver: 'Martín López · Finance',
      trigger: { type: 'Trigger', ic: 'act', t: 'Low stock on SKU 4410', r: 'Below minimum stock', src: ['ERP · Stock'], rule: 'Minimum stock per SKU.', out: 'Run started.' },
      par: [{ type: 'Agent · ERP', ic: 'erp', t: 'Stock and usage', r: 'Coverage below minimum', dur: '1.2 s', src: ['ERP · Stock', 'ERP · Usage'], rule: 'Usage over the last 8 weeks.', out: 'Restock quantity calculated.' }, { type: 'Agent · Drive', ic: 'doc', t: 'Plastar 2026 contract', r: 'Current prices and terms', dur: '1.9 s', src: ['Plastar 2026 contract.pdf'], rule: 'Supplier with a current contract.', out: 'Contract terms.' }, { type: 'Agent · Policies', ic: 'doc', t: 'Purchasing policy', r: '$10,000,000 limit', dur: '0.8 s', src: ['Purchasing policy'], rule: 'Automatic purchase limits.', out: 'Limit identified.' }],
      comp: { type: 'Composition', ic: 'comp', t: 'Prepare order', r: 'OC-4471 · Plastar S.A. · $18,400,000', rule: 'Rule: purchases over $10,000,000 need Finance approval', src: ['ERP · Purchasing'], ruleD: 'Purchases over $10,000,000 need Finance approval.', out: 'OC-4471 prepared.' },
      branch: [{ type: 'Action · ERP', ic: 'act', t: 'Issue OC-4471', r: 'Approval: Martín López · Finance', appr: true, src: ['ERP · Purchasing'], rule: 'Exceeds the automatic purchase limit.', out: 'OC-4471 issued.' }],
      down: [{ type: 'Action · Email', ic: 'mail', t: 'Send order to supplier', r: 'Plastar S.A.', from: 0, src: ['Email · Purchasing'], rule: 'Sent to the contract contact.', out: 'Order sent.' }, { type: 'Action · WhatsApp', ic: 'chat', t: 'Notify warehouse', r: 'Estimated delivery in 5 days', from: 0, src: ['WhatsApp Business'], rule: 'Notice to the receiving lead.', out: 'Warehouse notified.' }],
      card: { text: 'OC-4471 to Plastar S.A. for $18,400,000 exceeds the $10,000,000 limit for automatic purchases.', h: ['Proposed action', 'Orders', '$'], rows: [['Issue OC-4471 · Plastar S.A.', '1', '$18.4M']], note: 'Rule: purchases over $10,000,000 need Finance approval. Sources: ERP · Stock · Plastar 2026 contract · Purchasing policy.', b1: 'Approve', b2: 'Reject' },
      results: [[1, 'i', 'Purchase order', ''], [18.4, 'm', 'Order amount', ''], [5, 'i', 'Estimated delivery days', '']] },
    { name: 'Collections agent', desc: 'Every day it reviews overdue invoices, prioritizes cases, sends reminders within the rules and asks for approval on exceptions.', approver: 'Martín López · Finance',
      trigger: { type: 'Trigger', ic: 'clock', t: 'Every day 8:00', r: 'Daily review', src: ['Daily schedule'], rule: 'Runs every day at 8:00.', out: 'Run started.' },
      par: [{ type: 'Agent · ERP', ic: 'erp', t: 'Overdue invoices', r: '23 invoices', dur: '1.1 s', src: ['ERP · Accounts receivable'], rule: 'Invoices past their due date.', out: '23 overdue invoices.' }, { type: 'Agent · CRM', ic: 'crm', t: 'Collections history', r: 'Aging and risk by customer', dur: '1.6 s', src: ['CRM · Collections history'], rule: 'Each customer’s payment history.', out: 'Risk by customer.' }, { type: 'Agent · Email', ic: 'mail', t: 'Receipts received', r: 'Payments reported by customers', dur: '0.9 s', src: ['Email · Collections'], rule: 'Receipts attached in the last 7 days.', out: 'Reported payments found.' }],
      comp: { type: 'Composition', ic: 'comp', t: 'Prioritize cases', count: [8, 'i', ' cases by amount, age and risk'], rule: 'Rule: off-policy payment plans need approval', src: ['Results from the 3 agents'], ruleD: 'Off-policy payment plans need approval.', out: '8 cases prioritized.' },
      branch: [{ type: 'Action · WhatsApp', ic: 'chat', t: 'Send 6 reminders', r: 'Within the contact rules', src: ['WhatsApp Business'], rule: 'Messages within the contact rules.', out: '6 reminders sent.' }, { type: 'Action', ic: 'act', t: 'Mayorista El Sur payment plan', r: 'Outside policy', appr: true, src: ['ERP · Accounts receivable', 'WhatsApp'], rule: 'Off-policy plans need approval.', out: 'Payment plan approved.' }],
      down: [{ type: 'Action · ERP', ic: 'erp', t: 'Reconcile paid invoices', r: 'With the receipts received', from: 0, src: ['ERP · Accounts receivable', 'Email · Collections'], rule: 'Reconciliation with receipt.', out: 'Invoices reconciled.' }],
      card: { text: 'Mayorista El Sur is asking for an off-policy payment plan. The other cases stay within the rules.', h: ['Proposed action', 'Scope', 'Status'], rows: [['Send reminders', '6 invoices', 'Automatic'], ['Payment plan · Mayorista El Sur', '1 customer', 'Approval']], note: 'Reminders go out within the rules. The payment plan needs Finance approval.', b1: 'Approve', b2: 'Reject' },
      results: [[23, 'i', 'Overdue invoices', ''], [8, 'i', 'Prioritized', ''], [6, 'i', 'Reminders sent', ''], [OVER_30 / 1e6, 'm', 'In collection', '']] },
  ],
  skus: [['4410-17', 'Drinkable yogurt 1 L', 'L2611', '11/18', '340', 'Promotion 20%'], ['2208-03', 'Assorted cookies 400 g', 'L2587', '11/22', '1,120', 'Promotion 20%'], ['1902-08', 'UHT milk 1 L', 'L2620', '11/27', '2,040', 'Promotion 20%'], ['3105-11', 'Powdered juice x 20', 'L2499', '—', '860', 'Supplier swap'], ['5521-02', 'Soda 2.25 L', 'L2410', '—', '640', 'Clearance']],
  chips: ['Build or integrate', 'Systems, sources and tools', 'Permissions, rules and actions', 'Test, publish and version', 'Tasks, exceptions and approvals', 'History and token usage'],
  replay: '↻ Run again',
  pause: 'Pause',
  play: 'Resume',
  agentsLabel: 'Agents',
  tag: { pend: 'Waiting', hold: 'Waiting', run: 'Running…', done: 'Done', appr: 'Needs your approval', okA: 'Approved', rej: 'Rejected', cancel: 'Canceled' },
  ready: (d) => `Done · ${d}`,
  head: { rej: 'Rejected', done: 'Completed', wait: (m) => `Waiting for approval · ${m}`, run: 'Running…', idle: 'Ready to run' },
  card: { appr: 'Approved', rej: 'Rejected', need: 'Needs your approval', pend: 'Pending', prep: 'Preparing', rejNote: 'Rejected · the agent logged the reason and didn’t run the actions.', by: (w) => `Approved by ${w}` },
  groups: ['Trigger', 'In parallel', 'Composition', 'Actions', 'After approval'],
  sources: 'Sources',
  rule: 'Rule',
  result: 'Result',
  resultTitle: 'Run result',
  audit: 'Logged in the audit trail ✓',
  skuTitle: 'SKU list · sample',
  skuCols: ['SKU', 'Product', 'Batch', 'Expires', 'Stock', 'Action'],
  skuSource: 'Source · ERP · Batches and stock',
  close: 'Close',
  canvasLabel: 'Agent flow',
  num: (v, k) => (k === 'm' ? '$' + v.toFixed(1) + 'M' : Math.round(v).toLocaleString('en-US')),
};

export const FLOW: Record<Locale, FlowCopy> = { es: ES, en: EN };
