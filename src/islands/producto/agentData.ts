// Datos de «Agent Flow.dc.html» (spec 007 §3.3): tres agentes con su flujo, la tarjeta de aprobación y los
// resultados. Números como números (`[valor, 'i' | 'm']`: entero o millones), formateados por idioma.
// D4: el inglés es traducción provisoria.
import type { Locale } from '../../i18n/routes';

export type Ic = 'clock' | 'erp' | 'web' | 'doc' | 'bot' | 'comp' | 'chat' | 'mail' | 'crm' | 'act';
export interface FNode { type: string; ic: Ic; t: string; r?: string; dur?: number; src: string[]; rule: string; out: string; appr?: boolean; from?: number }
export interface Agent {
  name: string;
  desc: string;
  approver: string;
  trigger: FNode;
  par: FNode[];
  comp: FNode & { count?: [number, 'i' | 'm', string]; ruleD: string };
  branch: FNode[];
  down: FNode[];
  card: { text: string; h: [string, string, string]; rows: [string, string, string][]; note: string; b1: string; b2: string; drawer?: boolean };
  results: [number, 'i' | 'm', string, '' | 'appr' | 'amber'][];
}
export interface FlowCopy {
  chips: [string, string, string, string, string, string];
  replay: string;
  status: { ready: string; running: string; waiting: string; done: string; rejected: string };
  tags: { pend: string; run: string; done: string; appr: string; okA: string; rej: string; cancel: string };
  groups: [string, string, string, string, string];
  sources: string;
  rule: string;
  result: string;
  card: { need: string; approved: string; rejected: string; pending: string; prep: string; rejectedTxt: string; approvedBy: string };
  run: string;
  audit: string;
  drawer: { title: string; h: [string, string, string, string, string, string]; source: string; close: string };
  skus: [string, string, string, string, number, string][];
  cta: string;
  ctaLink: string;
  caption: string;
  closePop: string;
  agents: [Agent, Agent, Agent];
}

export const FLOW: Record<Locale, FlowCopy> = {
  es: {
    chips: ['Crear o integrar', 'Sistemas, fuentes y herramientas', 'Permisos, reglas y acciones', 'Probar, publicar y versionar', 'Tareas, excepciones y aprobaciones', 'Historial y consumo de tokens'],
    replay: '↻ Ejecutar de nuevo',
    status: { ready: 'Lista para ejecutar', running: 'Ejecutando…', waiting: 'Esperando aprobación · ', done: 'Completado', rejected: 'Rechazado' },
    tags: { pend: 'En espera', run: 'Ejecutando…', done: 'Listo', appr: 'Necesita tu aprobación', okA: 'Aprobado', rej: 'Rechazado', cancel: 'Cancelado' },
    groups: ['Disparador', 'En paralelo', 'Composición', 'Acciones', 'Después de aprobar'],
    sources: 'Fuentes',
    rule: 'Regla · ',
    result: 'Resultado · ',
    card: { need: 'Necesita tu aprobación', approved: 'Aprobado', rejected: 'Rechazado', pending: 'Pendiente', prep: 'En preparación', rejectedTxt: 'Rechazado · el agente registró el motivo y no ejecutó las acciones.', approvedBy: 'Aprobado por ' },
    run: 'Resultado de la corrida',
    audit: 'Registrado en auditoría ✓',
    drawer: { title: 'Lista por SKU · muestra', h: ['SKU', 'Producto', 'Lote', 'Vence', 'Stock', 'Acción'], source: 'Fuente · ERP · Lotes y stock', close: 'Cerrar' },
    skus: [
      ['4410-17', 'Yogur bebible 1 L', 'L2611', '18/11', 340, 'Promoción 20%'],
      ['2208-03', 'Galletitas surtidas 400 g', 'L2587', '22/11', 1120, 'Promoción 20%'],
      ['1902-08', 'Leche larga vida 1 L', 'L2620', '27/11', 2040, 'Promoción 20%'],
      ['3105-11', 'Jugo en polvo x 20', 'L2499', '—', 860, 'Canje proveedor'],
      ['5521-02', 'Gaseosa 2,25 L', 'L2410', '—', 640, 'Liquidación'],
    ],
    cta: 'Creá un agente, conectá uno existente o pedile uno a NoctiLabs',
    ctaLink: '→ Nuevo agente',
    caption: 'Los agentes usan los mismos permisos y la misma trazabilidad que las personas.',
    closePop: 'Cerrar detalle',
    agents: [
      {
        name: 'Agente de vencimientos y stock parado',
        desc: 'Cada lunes revisa los lotes que vencen pronto y el stock que no se vende hace 90 días, propone qué promocionar, qué devolver y qué liquidar, y deja las acciones listas para aprobar.',
        approver: 'Laura Méndez · CEO',
        trigger: { type: 'Disparador', ic: 'clock', t: 'Lunes 7:00', r: 'Revisión semanal', src: ['Programación semanal'], rule: 'Se ejecuta cada lunes a las 7:00.', out: 'Corrida iniciada.' },
        par: [
          { type: 'Agente · ERP', ic: 'erp', t: 'Lotes por vencer', r: '103 lotes vencen antes del 30/11', dur: 1.7, src: ['ERP · Lotes', 'ERP · Stock'], rule: 'Lotes que vencen en los próximos 60 días.', out: '103 lotes detectados.' },
          { type: 'Agente · ERP', ic: 'erp', t: 'Stock sin rotación', r: '224 SKUs sin venta en 90 días', dur: 2.1, src: ['ERP · Ventas', 'ERP · Stock'], rule: 'Sin ventas en los últimos 90 días.', out: '224 SKUs detectados.' },
          { type: 'Agente · Tienda online', ic: 'web', t: 'Precio y rotación', r: '2.400 SKUs activos', dur: 1.4, src: ['Tienda online · Catálogo'], rule: 'Precio vigente y ventas online por SKU.', out: '2.400 SKUs analizados.' },
        ],
        comp: { type: 'Composición', ic: 'comp', t: 'Priorizar y proponer acción', count: [64.9, 'm', ' en juego'], rule: 'Regla: vence en menos de 60 días → promoción · resto → canje o liquidación según proveedor', src: ['Resultados de los 3 agentes', 'Acuerdos con proveedores'], ruleD: 'Vence en menos de 60 días → promoción; resto → canje o liquidación.', out: '$64,9 M en juego.' },
        branch: [
          { type: 'Acción · ERP', ic: 'act', t: 'Crear 77 promociones', r: '20% hasta el vencimiento del lote', appr: true, src: ['ERP · Precios'], rule: 'Las promociones salen con aprobación.', out: '77 promociones listas para publicar.' },
          { type: 'Agente', ic: 'bot', t: 'Proponer canjes', r: '171 SKUs · lácteos, galletitas, bebidas', src: ['Acuerdos con proveedores'], rule: 'Canje según condiciones de cada proveedor.', out: '171 SKUs propuestos para canje.' },
        ],
        down: [
          { type: 'Acción · Tienda online', ic: 'web', t: 'Publicar precios en la web', r: '77 SKUs en promoción', from: 0, src: ['Tienda online · Precios'], rule: 'Solo SKUs aprobados.', out: '77 precios publicados.' },
          { type: 'Acción · WhatsApp', ic: 'chat', t: 'Avisar a vendedores', r: 'Qué ofrecer esta semana', from: 0, src: ['WhatsApp Business'], rule: 'Aviso a vendedores de cada zona.', out: 'Vendedores avisados.' },
          { type: 'Acción · Mail', ic: 'mail', t: 'Pedir canje a proveedores', r: 'Borradores para compras', from: 1, src: ['Correo · Compras'], rule: 'Borradores para revisión de compras.', out: 'Borradores listos.' },
        ],
        card: {
          text: 'Esta semana hay $4,6 M en lotes que vencen antes del 30/11 y $60,3 M en stock sin venta hace 90 días o más.',
          h: ['Acción propuesta', 'SKUs', '$'],
          rows: [['Promoción hasta el vencimiento', '77', '$4,6 M'], ['Canje o devolución al proveedor', '171', '$35,7 M'], ['Liquidación en sucursales', '53', '$24,6 M']],
          note: 'Las promociones y los canjes salen con tu aprobación. La liquidación la decide comercial.',
          b1: 'Aprobar promociones y canjes', b2: 'Ver la lista por SKU', drawer: true,
        },
        results: [[224, 'i', 'SKUs sin venta en 90 días', ''], [103, 'i', 'Lotes que vencen antes del 30/11', ''], [4.6, 'm', 'Promocionado antes de vencer', 'appr'], [60.3, 'm', 'Inmovilizado sin rotación', 'amber']],
      },
      {
        name: 'Agente de compras',
        desc: 'Detecta faltantes, consulta contratos y políticas, prepara la orden de compra y la deja lista para aprobar cuando supera el límite.',
        approver: 'Martín López · Finanzas',
        trigger: { type: 'Disparador', ic: 'act', t: 'Stock bajo del SKU 4410', r: 'Debajo del stock mínimo', src: ['ERP · Stock'], rule: 'Stock mínimo por SKU.', out: 'Corrida iniciada.' },
        par: [
          { type: 'Agente · ERP', ic: 'erp', t: 'Stock y consumo', r: 'Cobertura por debajo del mínimo', dur: 1.2, src: ['ERP · Stock', 'ERP · Consumo'], rule: 'Consumo de las últimas 8 semanas.', out: 'Cantidad a reponer calculada.' },
          { type: 'Agente · Drive', ic: 'doc', t: 'Contrato Plastar 2026', r: 'Precios y condiciones vigentes', dur: 1.9, src: ['Contrato Plastar 2026.pdf'], rule: 'Proveedor con contrato vigente.', out: 'Condiciones del contrato.' },
          { type: 'Agente · Políticas', ic: 'doc', t: 'Política de compras', r: 'Límite de $10.000.000', dur: 0.8, src: ['Política de compras'], rule: 'Límites de compra automática.', out: 'Límite identificado.' },
        ],
        comp: { type: 'Composición', ic: 'comp', t: 'Preparar orden', r: 'OC-4471 · Plastar S.A. · $18.400.000', rule: 'Regla: compras mayores a $10.000.000 requieren aprobación de Finanzas', src: ['ERP · Compras'], ruleD: 'Compras mayores a $10.000.000 requieren aprobación de Finanzas.', out: 'OC-4471 preparada.' },
        branch: [
          { type: 'Acción · ERP', ic: 'act', t: 'Emitir OC-4471', r: 'Aprobación: Martín López · Finanzas', appr: true, src: ['ERP · Compras'], rule: 'Supera el límite de compra automática.', out: 'OC-4471 emitida.' },
        ],
        down: [
          { type: 'Acción · Mail', ic: 'mail', t: 'Enviar orden al proveedor', r: 'Plastar S.A.', from: 0, src: ['Correo · Compras'], rule: 'Envío al contacto del contrato.', out: 'Orden enviada.' },
          { type: 'Acción · WhatsApp', ic: 'chat', t: 'Avisar a depósito', r: 'Entrega estimada en 5 días', from: 0, src: ['WhatsApp Business'], rule: 'Aviso al responsable de recepción.', out: 'Depósito avisado.' },
        ],
        card: {
          text: 'OC-4471 a Plastar S.A. por $18.400.000 supera el límite de $10.000.000 para compras automáticas.',
          h: ['Acción propuesta', 'Órdenes', '$'],
          rows: [['Emitir OC-4471 · Plastar S.A.', '1', '$18,4 M']],
          note: 'Regla: compras mayores a $10.000.000 requieren aprobación de Finanzas. Fuentes: ERP · Stock · Contrato Plastar 2026 · Política de compras.',
          b1: 'Aprobar', b2: 'Rechazar',
        },
        results: [[1, 'i', 'Orden de compra', ''], [18.4, 'm', 'Monto de la orden', ''], [5, 'i', 'Días de entrega estimada', '']],
      },
      {
        name: 'Agente de cobranzas',
        desc: 'Todos los días revisa facturas vencidas, prioriza casos, envía recordatorios dentro de las reglas y pide aprobación para las excepciones.',
        approver: 'Martín López · Finanzas',
        trigger: { type: 'Disparador', ic: 'clock', t: 'Todos los días 8:00', r: 'Revisión diaria', src: ['Programación diaria'], rule: 'Se ejecuta todos los días a las 8:00.', out: 'Corrida iniciada.' },
        par: [
          { type: 'Agente · ERP', ic: 'erp', t: 'Facturas vencidas', r: '23 facturas', dur: 1.1, src: ['ERP · Cuentas a cobrar'], rule: 'Facturas con vencimiento superado.', out: '23 facturas vencidas.' },
          { type: 'Agente · CRM', ic: 'crm', t: 'Historial de cobranza', r: 'Antigüedad y riesgo por cliente', dur: 1.6, src: ['CRM · Historial de cobranza'], rule: 'Historial de pagos de cada cliente.', out: 'Riesgo por cliente.' },
          { type: 'Agente · Correo', ic: 'mail', t: 'Comprobantes recibidos', r: 'Pagos informados por clientes', dur: 0.9, src: ['Correo · Cobranzas'], rule: 'Comprobantes adjuntos de los últimos 7 días.', out: 'Pagos informados detectados.' },
        ],
        comp: { type: 'Composición', ic: 'comp', t: 'Priorizar casos', count: [8, 'i', ' casos por monto, antigüedad y riesgo'], rule: 'Regla: planes de pago fuera de política requieren aprobación', src: ['Resultados de los 3 agentes'], ruleD: 'Planes de pago fuera de política requieren aprobación.', out: '8 casos priorizados.' },
        branch: [
          { type: 'Acción · WhatsApp', ic: 'chat', t: 'Enviar 6 recordatorios', r: 'Dentro de las reglas de contacto', src: ['WhatsApp Business'], rule: 'Envíos dentro de las reglas de contacto.', out: '6 recordatorios enviados.' },
          { type: 'Acción', ic: 'act', t: 'Plan de pago Mayorista El Sur', r: 'Fuera de política', appr: true, src: ['ERP · Cuentas a cobrar', 'WhatsApp'], rule: 'Planes fuera de política requieren aprobación.', out: 'Plan de pago aprobado.' },
        ],
        down: [
          { type: 'Acción · ERP', ic: 'erp', t: 'Conciliar facturas pagadas', r: 'Con los comprobantes recibidos', from: 0, src: ['ERP · Cuentas a cobrar', 'Correo · Cobranzas'], rule: 'Conciliación con comprobante.', out: 'Facturas conciliadas.' },
        ],
        card: {
          text: 'Mayorista El Sur pide un plan de pago fuera de política. El resto de los casos sigue dentro de las reglas.',
          h: ['Acción propuesta', 'Alcance', 'Estado'],
          rows: [['Enviar recordatorios', '6 facturas', 'Automático'], ['Plan de pago · Mayorista El Sur', '1 cliente', 'Aprobación']],
          note: 'Los recordatorios salen dentro de las reglas. El plan de pago necesita aprobación de Finanzas.',
          b1: 'Aprobar', b2: 'Rechazar',
        },
        results: [[23, 'i', 'Facturas vencidas', ''], [8, 'i', 'Priorizadas', ''], [6, 'i', 'Recordatorios enviados', ''], [41.2, 'm', 'En gestión', '']],
      },
    ],
  },
  en: {
    chips: ['Create or integrate', 'Systems, sources and tools', 'Permissions, rules and actions', 'Test, publish and version', 'Tasks, exceptions and approvals', 'History and token usage'],
    replay: '↻ Run again',
    status: { ready: 'Ready to run', running: 'Running…', waiting: 'Waiting for approval · ', done: 'Completed', rejected: 'Rejected' },
    tags: { pend: 'Waiting', run: 'Running…', done: 'Done', appr: 'Needs your approval', okA: 'Approved', rej: 'Rejected', cancel: 'Canceled' },
    groups: ['Trigger', 'In parallel', 'Composition', 'Actions', 'After approval'],
    sources: 'Sources',
    rule: 'Rule · ',
    result: 'Result · ',
    card: { need: 'Needs your approval', approved: 'Approved', rejected: 'Rejected', pending: 'Pending', prep: 'Preparing', rejectedTxt: 'Rejected · the agent logged the reason and did not run the actions.', approvedBy: 'Approved by ' },
    run: 'Run result',
    audit: 'Logged for audit ✓',
    drawer: { title: 'List by SKU · sample', h: ['SKU', 'Product', 'Lot', 'Expires', 'Stock', 'Action'], source: 'Source · ERP · Lots and stock', close: 'Close' },
    skus: [
      ['4410-17', 'Drinkable yogurt 1 L', 'L2611', '11/18', 340, '20% promotion'],
      ['2208-03', 'Assorted cookies 400 g', 'L2587', '11/22', 1120, '20% promotion'],
      ['1902-08', 'UHT milk 1 L', 'L2620', '11/27', 2040, '20% promotion'],
      ['3105-11', 'Powdered juice x 20', 'L2499', '—', 860, 'Supplier exchange'],
      ['5521-02', 'Soda 2.25 L', 'L2410', '—', 640, 'Clearance'],
    ],
    cta: 'Create an agent, connect an existing one or ask NoctiLabs for one',
    ctaLink: '→ New agent',
    caption: 'Agents use the same permissions and the same traceability as people.',
    closePop: 'Close details',
    agents: [
      {
        name: 'Expiring and slow-moving stock agent',
        desc: 'Every Monday it reviews lots that expire soon and stock that hasn’t sold in 90 days, proposes what to promote, return or clear, and leaves the actions ready to approve.',
        approver: 'Laura Méndez · CEO',
        trigger: { type: 'Trigger', ic: 'clock', t: 'Monday 7:00', r: 'Weekly review', src: ['Weekly schedule'], rule: 'Runs every Monday at 7:00.', out: 'Run started.' },
        par: [
          { type: 'Agent · ERP', ic: 'erp', t: 'Expiring lots', r: '103 lots expire before 11/30', dur: 1.7, src: ['ERP · Lots', 'ERP · Stock'], rule: 'Lots that expire in the next 60 days.', out: '103 lots found.' },
          { type: 'Agent · ERP', ic: 'erp', t: 'Slow-moving stock', r: '224 SKUs with no sales in 90 days', dur: 2.1, src: ['ERP · Sales', 'ERP · Stock'], rule: 'No sales in the last 90 days.', out: '224 SKUs found.' },
          { type: 'Agent · Online store', ic: 'web', t: 'Price and turnover', r: '2,400 active SKUs', dur: 1.4, src: ['Online store · Catalog'], rule: 'Current price and online sales by SKU.', out: '2,400 SKUs analyzed.' },
        ],
        comp: { type: 'Composition', ic: 'comp', t: 'Prioritize and propose action', count: [64.9, 'm', ' at stake'], rule: 'Rule: expires in under 60 days → promotion · rest → exchange or clearance by supplier', src: ['Results of the 3 agents', 'Supplier agreements'], ruleD: 'Expires in under 60 days → promotion; rest → exchange or clearance.', out: '$64.9M at stake.' },
        branch: [
          { type: 'Action · ERP', ic: 'act', t: 'Create 77 promotions', r: '20% until the lot expires', appr: true, src: ['ERP · Pricing'], rule: 'Promotions go out with approval.', out: '77 promotions ready to publish.' },
          { type: 'Agent', ic: 'bot', t: 'Propose exchanges', r: '171 SKUs · dairy, cookies, drinks', src: ['Supplier agreements'], rule: 'Exchange per each supplier’s terms.', out: '171 SKUs proposed for exchange.' },
        ],
        down: [
          { type: 'Action · Online store', ic: 'web', t: 'Publish prices online', r: '77 SKUs on promotion', from: 0, src: ['Online store · Prices'], rule: 'Approved SKUs only.', out: '77 prices published.' },
          { type: 'Action · WhatsApp', ic: 'chat', t: 'Notify sales reps', r: 'What to offer this week', from: 0, src: ['WhatsApp Business'], rule: 'Notice to the reps of each zone.', out: 'Sales reps notified.' },
          { type: 'Action · Email', ic: 'mail', t: 'Request supplier exchanges', r: 'Drafts for purchasing', from: 1, src: ['Email · Purchasing'], rule: 'Drafts for purchasing to review.', out: 'Drafts ready.' },
        ],
        card: {
          text: 'This week there is $4.6M in lots that expire before 11/30 and $60.3M in stock with no sales for 90 days or more.',
          h: ['Proposed action', 'SKUs', '$'],
          rows: [['Promotion until expiry', '77', '$4.6M'], ['Exchange or return to supplier', '171', '$35.7M'], ['Clearance in branches', '53', '$24.6M']],
          note: 'Promotions and exchanges go out with your approval. Sales decides on clearance.',
          b1: 'Approve promotions and exchanges', b2: 'See the list by SKU', drawer: true,
        },
        results: [[224, 'i', 'SKUs with no sales in 90 days', ''], [103, 'i', 'Lots expiring before 11/30', ''], [4.6, 'm', 'Promoted before expiry', 'appr'], [60.3, 'm', 'Tied up in slow-moving stock', 'amber']],
      },
      {
        name: 'Purchasing agent',
        desc: 'Detects shortages, checks contracts and policies, prepares the purchase order and leaves it ready to approve when it exceeds the limit.',
        approver: 'Martín López · Finance',
        trigger: { type: 'Trigger', ic: 'act', t: 'Low stock for SKU 4410', r: 'Below minimum stock', src: ['ERP · Stock'], rule: 'Minimum stock per SKU.', out: 'Run started.' },
        par: [
          { type: 'Agent · ERP', ic: 'erp', t: 'Stock and consumption', r: 'Coverage below the minimum', dur: 1.2, src: ['ERP · Stock', 'ERP · Consumption'], rule: 'Consumption over the last 8 weeks.', out: 'Replenishment quantity calculated.' },
          { type: 'Agent · Drive', ic: 'doc', t: 'Plastar 2026 contract', r: 'Current prices and terms', dur: 1.9, src: ['Plastar 2026 contract.pdf'], rule: 'Supplier with a current contract.', out: 'Contract terms.' },
          { type: 'Agent · Policies', ic: 'doc', t: 'Purchasing policy', r: '$10,000,000 limit', dur: 0.8, src: ['Purchasing policy'], rule: 'Automatic purchase limits.', out: 'Limit identified.' },
        ],
        comp: { type: 'Composition', ic: 'comp', t: 'Prepare order', r: 'PO-4471 · Plastar S.A. · $18,400,000', rule: 'Rule: purchases over $10,000,000 need Finance approval', src: ['ERP · Purchasing'], ruleD: 'Purchases over $10,000,000 need Finance approval.', out: 'PO-4471 prepared.' },
        branch: [
          { type: 'Action · ERP', ic: 'act', t: 'Issue PO-4471', r: 'Approval: Martín López · Finance', appr: true, src: ['ERP · Purchasing'], rule: 'Exceeds the automatic purchase limit.', out: 'PO-4471 issued.' },
        ],
        down: [
          { type: 'Action · Email', ic: 'mail', t: 'Send order to supplier', r: 'Plastar S.A.', from: 0, src: ['Email · Purchasing'], rule: 'Sent to the contract contact.', out: 'Order sent.' },
          { type: 'Action · WhatsApp', ic: 'chat', t: 'Notify the warehouse', r: 'Estimated delivery in 5 days', from: 0, src: ['WhatsApp Business'], rule: 'Notice to the receiving lead.', out: 'Warehouse notified.' },
        ],
        card: {
          text: 'PO-4471 to Plastar S.A. for $18,400,000 exceeds the $10,000,000 limit for automatic purchases.',
          h: ['Proposed action', 'Orders', '$'],
          rows: [['Issue PO-4471 · Plastar S.A.', '1', '$18.4M']],
          note: 'Rule: purchases over $10,000,000 need Finance approval. Sources: ERP · Stock · Plastar 2026 contract · Purchasing policy.',
          b1: 'Approve', b2: 'Reject',
        },
        results: [[1, 'i', 'Purchase order', ''], [18.4, 'm', 'Order amount', ''], [5, 'i', 'Estimated delivery days', '']],
      },
      {
        name: 'Collections agent',
        desc: 'Every day it reviews overdue invoices, prioritizes cases, sends reminders within the rules and asks for approval on exceptions.',
        approver: 'Martín López · Finance',
        trigger: { type: 'Trigger', ic: 'clock', t: 'Every day 8:00', r: 'Daily review', src: ['Daily schedule'], rule: 'Runs every day at 8:00.', out: 'Run started.' },
        par: [
          { type: 'Agent · ERP', ic: 'erp', t: 'Overdue invoices', r: '23 invoices', dur: 1.1, src: ['ERP · Accounts receivable'], rule: 'Invoices past their due date.', out: '23 overdue invoices.' },
          { type: 'Agent · CRM', ic: 'crm', t: 'Collections history', r: 'Age and risk by customer', dur: 1.6, src: ['CRM · Collections history'], rule: 'Payment history of each customer.', out: 'Risk by customer.' },
          { type: 'Agent · Email', ic: 'mail', t: 'Receipts received', r: 'Payments reported by customers', dur: 0.9, src: ['Email · Collections'], rule: 'Attached receipts from the last 7 days.', out: 'Reported payments found.' },
        ],
        comp: { type: 'Composition', ic: 'comp', t: 'Prioritize cases', count: [8, 'i', ' cases by amount, age and risk'], rule: 'Rule: payment plans outside policy need approval', src: ['Results of the 3 agents'], ruleD: 'Payment plans outside policy need approval.', out: '8 cases prioritized.' },
        branch: [
          { type: 'Action · WhatsApp', ic: 'chat', t: 'Send 6 reminders', r: 'Within the contact rules', src: ['WhatsApp Business'], rule: 'Sent within the contact rules.', out: '6 reminders sent.' },
          { type: 'Action', ic: 'act', t: 'Payment plan Mayorista El Sur', r: 'Outside policy', appr: true, src: ['ERP · Accounts receivable', 'WhatsApp'], rule: 'Plans outside policy need approval.', out: 'Payment plan approved.' },
        ],
        down: [
          { type: 'Action · ERP', ic: 'erp', t: 'Reconcile paid invoices', r: 'Against the receipts received', from: 0, src: ['ERP · Accounts receivable', 'Email · Collections'], rule: 'Reconciliation with receipt.', out: 'Invoices reconciled.' },
        ],
        card: {
          text: 'Mayorista El Sur asks for a payment plan outside policy. The other cases stay within the rules.',
          h: ['Proposed action', 'Scope', 'Status'],
          rows: [['Send reminders', '6 invoices', 'Automatic'], ['Payment plan · Mayorista El Sur', '1 customer', 'Approval']],
          note: 'Reminders go out within the rules. The payment plan needs Finance approval.',
          b1: 'Approve', b2: 'Reject',
        },
        results: [[23, 'i', 'Overdue invoices', ''], [8, 'i', 'Prioritized', ''], [6, 'i', 'Reminders sent', ''], [41.2, 'm', 'In progress', '']],
      },
    ],
  },
};
