// Copy y datos del montaje «Preguntá. Entendé. Actuá.» (spec 006 §4.4), transcriptos de «Home Montage.dc.html».
// D4: el inglés es traducción provisoria, pendiente de revisión del dueño.
import type { Locale } from '../../i18n/routes';

export interface Persona {
  name: string;
  initials: string;
  bg: string;
  q: string;
  lead: string;
  items: [string, string, string];
  cx: [string, string, string];
  perm: string;
  acts: [string, string, string];
}

export interface MontageCopy {
  segs: [string, string, string];
  goTo: string;
  pause: string;
  play: string;
  /** Resumen de cada escena para lectores de pantalla (el lienzo es decorativo). */
  summary: [string, string, string];
  s1: { personas: [Persona, Persona]; placeholder: string; consulting: string; consulted: string; connections: string };
  s2: {
    asker: { name: string; initials: string; bg: string };
    q: string;
    kpiLabel: string;
    kpi: string;
    delta: string;
    anomaly: string;
    anomalyText: string;
    lead: string;
    causes: [string, string, number, number][];
    total: string;
    totalV: string;
    btn: string;
    crumbs: [string, string, string];
    txSource: string;
    tx: [string, string, string, string, string][];
  };
  s3: {
    agent: string;
    steps: [string, string, string, string];
    approvedStep: string;
    status: { run: string; wait: string; done: string };
    stamp: string;
    panelLabel: string;
    approvals: string;
    tag: { none: string; pending: string; ok: string };
    need: string;
    approved: string;
    order: string;
    rule: string;
    sources: [string, string, string];
    approve: string;
    reject: string;
    approvedFrom: string;
    wa: { label: string; name: string; online: string; from: string; text: string; qr: [string, string, string]; reply: string };
    mail: { label: string; inbox: string; fromK: string; from: string; toK: string; to: string; subject: string; body: string; review: string };
    tabs: [string, string, string];
  };
}

const ORDER = 'OC-4471 · Plastar S.A. · $18.400.000';
const ORDER_EN = 'PO-4471 · Plastar S.A. · $18,400,000';

export const montage: Record<Locale, MontageCopy> = {
  es: {
    segs: ['Preguntá', 'Entendé', 'Actuá'],
    goTo: 'Ir a la escena',
    pause: 'Pausar',
    play: 'Reproducir',
    summary: [
      'Preguntá: una persona de Comercial pregunta qué clientes contactar hoy; Nocti consulta el CRM y el ERP y responde con 12 clientes prioritarios, las fuentes, los permisos de su rol y acciones sugeridas.',
      'Entendé: el margen bruto cayó de 31,4 % a 28,2 %; Nocti marca la anomalía, explica tres causas y baja hasta las transacciones que lo explican.',
      'Actuá: el agente de compras prepara una orden de $18.400.000 que supera el límite y pide aprobación por el panel de Nocti, WhatsApp y correo; Martín López aprueba por WhatsApp, los tres canales se actualizan y la orden queda registrada en auditoría.',
    ],
    s1: {
      personas: [
        {
          name: 'Jorge Rodríguez', initials: 'JR', bg: '#3D7BFF',
          q: '¿Qué clientes debería contactar hoy y por qué?',
          lead: 'Hay 12 clientes prioritarios para hoy:',
          items: [
            '5 clientes compraron más de 20% menos que su promedio de los últimos 90 días.',
            '4 clientes tienen cotizaciones abiertas sin seguimiento hace más de 7 días.',
            '3 clientes compraron una categoría con oportunidad clara de venta cruzada.',
          ],
          cx: ['CRM · Cartera', 'ERP · Ventas', 'CRM · Cotizaciones'],
          perm: 'Jorge ve solo sus cuentas, pedidos y oportunidades.',
          acts: ['Ver clientes →', 'Preparar seguimientos →', 'Crear tareas →'],
        },
        {
          name: 'Silvana Pérez', initials: 'SP', bg: '#2F7D52',
          q: '¿Qué está frenando la operación hoy?',
          lead: 'Hay 7 pedidos con riesgo operativo:',
          items: [
            '4 pedidos esperan reposición de stock.',
            '2 pedidos están bloqueados por aprobación comercial.',
            '1 pedido tiene una incidencia logística pendiente.',
          ],
          cx: ['ERP · Pedidos', 'WMS · Stock', 'Logística · Entregas'],
          perm: 'Silvana ve pedidos, stock, proveedores y logística.',
          acts: ['Ver pedidos afectados →', 'Priorizar reposición →', 'Escalar bloqueos →'],
        },
      ],
      placeholder: 'Preguntale algo a tu empresa…',
      consulting: 'Consultando…',
      consulted: 'Contexto consultado',
      connections: 'Conexiones',
    },
    s2: {
      asker: { name: 'Laura Méndez', initials: 'LM', bg: '#0038CC' },
      q: '¿Por qué cayó el margen esta semana?',
      kpiLabel: 'Margen bruto',
      kpi: '28,2%',
      delta: '−3,2 pp vs semana anterior',
      anomaly: 'Anomalía',
      anomalyText: 'Desde el 1/9: costo de resina +11%',
      lead: 'El margen bajó de 31,4% a 28,2%. Tres causas:',
      causes: [['Mayor costo de insumos', '−1,6 pp', 0, 50], ['Descuentos en mayoristas', '−1,1 pp', 50, 34.375], ['Cambio de mix', '−0,5 pp', 84.375, 15.625]],
      total: 'Variación total',
      totalV: '−3,2 pp',
      btn: 'Ver transacciones',
      crumbs: ['Margen bruto', 'Mayoristas zona sur', 'Transacciones'],
      txSource: 'ERP · Ventas',
      tx: [
        ['Mayorista El Sur', 'Línea básica 1 kg', '14%', '16,2%', 'FA-21044'],
        ['Distribuidora Litoral Sur', 'Línea básica 500 g', '13%', '17,8%', 'FA-21039'],
        ['Mayorista El Sur', 'Línea básica 5 kg', '15%', '15,4%', 'FA-21021'],
      ],
    },
    s3: {
      agent: 'Agente de compras',
      steps: ['Detecta stock bajo del SKU 4410', 'Prepara OC-4471 · $18,4 M', 'Supera el límite · requiere aprobación', 'Orden enviada y registrada'],
      approvedStep: 'Aprobado · Martín López · Finanzas',
      status: { run: 'Ejecutando', wait: 'Esperando aprobación', done: 'Completado' },
      stamp: 'Registrado en auditoría ✓',
      panelLabel: 'Nocti · Panel',
      approvals: 'Aprobaciones',
      tag: { none: 'Sin pendientes', pending: 'Pendiente', ok: 'Aprobado' },
      need: 'Necesita tu aprobación',
      approved: 'Aprobado',
      order: ORDER,
      rule: 'Supera el límite de $10.000.000 para compras automáticas.',
      sources: ['ERP · Stock', 'Contrato Plastar 2026', 'Política de compras'],
      approve: 'Aprobar',
      reject: 'Rechazar',
      approvedFrom: 'Aprobado desde WhatsApp · Martín López',
      wa: {
        label: 'WhatsApp', name: 'Nocti', online: 'en línea',
        from: 'Agente de compras · Distribuidora Andes',
        text: 'Supera el límite de $10.000.000 para compras automáticas. ¿Aprobás la orden?',
        qr: ['Aprobar', 'Ver detalle', 'Rechazar'],
        reply: 'Aprobado ✓',
      },
      mail: {
        label: 'Correo', inbox: 'Bandeja de entrada',
        fromK: 'De:', from: 'Nocti · Agente de compras',
        toK: 'Para:', to: 'Martín López · Finanzas',
        subject: `Asunto: Aprobación requerida: ${ORDER}`,
        body: 'La orden supera el límite de $10.000.000 para compras automáticas. Fuentes: ERP · Stock · Contrato Plastar 2026.pdf · Política de compras.',
        review: 'Revisar en Nocti',
      },
      tabs: ['Nocti', 'WhatsApp', 'Correo'],
    },
  },
  en: {
    segs: ['Ask', 'Understand', 'Act'],
    goTo: 'Go to scene',
    pause: 'Pause',
    play: 'Play',
    summary: [
      'Ask: a sales rep asks which customers to contact today; Nocti checks the CRM and ERP and answers with 12 priority customers, the sources, the permissions of their role and suggested actions.',
      'Understand: gross margin fell from 31.4% to 28.2%; Nocti flags the anomaly, explains three causes and drills down to the transactions behind it.',
      'Act: the purchasing agent prepares an $18,400,000 order that exceeds the limit and asks for approval in the Nocti panel, on WhatsApp and by email; Martín López approves on WhatsApp, all three channels update and the order is logged for audit.',
    ],
    s1: {
      personas: [
        {
          name: 'Jorge Rodríguez', initials: 'JR', bg: '#3D7BFF',
          q: 'Which customers should I contact today, and why?',
          lead: 'There are 12 priority customers today:',
          items: [
            '5 customers bought over 20% less than their 90-day average.',
            '4 customers have open quotes with no follow-up for more than 7 days.',
            '3 customers bought a category with a clear cross-sell opportunity.',
          ],
          cx: ['CRM · Accounts', 'ERP · Sales', 'CRM · Quotes'],
          perm: 'Jorge only sees his own accounts, orders and opportunities.',
          acts: ['See customers →', 'Prepare follow-ups →', 'Create tasks →'],
        },
        {
          name: 'Silvana Pérez', initials: 'SP', bg: '#2F7D52',
          q: 'What is holding operations back today?',
          lead: 'There are 7 orders at operational risk:',
          items: [
            '4 orders are waiting for stock replenishment.',
            '2 orders are blocked pending commercial approval.',
            '1 order has an open logistics issue.',
          ],
          cx: ['ERP · Orders', 'WMS · Stock', 'Logistics · Deliveries'],
          perm: 'Silvana sees orders, stock, suppliers and logistics.',
          acts: ['See affected orders →', 'Prioritize replenishment →', 'Escalate blockers →'],
        },
      ],
      placeholder: 'Ask your company anything…',
      consulting: 'Checking…',
      consulted: 'Context checked',
      connections: 'Connections',
    },
    s2: {
      asker: { name: 'Laura Méndez', initials: 'LM', bg: '#0038CC' },
      q: 'Why did margin drop this week?',
      kpiLabel: 'Gross margin',
      kpi: '28.2%',
      delta: '−3.2 pp vs last week',
      anomaly: 'Anomaly',
      anomalyText: 'Since 9/1: resin cost +11%',
      lead: 'Margin fell from 31.4% to 28.2%. Three causes:',
      causes: [['Higher input costs', '−1.6 pp', 0, 50], ['Wholesale discounts', '−1.1 pp', 50, 34.375], ['Mix change', '−0.5 pp', 84.375, 15.625]],
      total: 'Total change',
      totalV: '−3.2 pp',
      btn: 'See transactions',
      crumbs: ['Gross margin', 'South-zone wholesalers', 'Transactions'],
      txSource: 'ERP · Sales',
      tx: [
        ['Mayorista El Sur', 'Basic line 1 kg', '14%', '16.2%', 'FA-21044'],
        ['Distribuidora Litoral Sur', 'Basic line 500 g', '13%', '17.8%', 'FA-21039'],
        ['Mayorista El Sur', 'Basic line 5 kg', '15%', '15.4%', 'FA-21021'],
      ],
    },
    s3: {
      agent: 'Purchasing agent',
      steps: ['Detects low stock for SKU 4410', 'Prepares PO-4471 · $18.4M', 'Exceeds the limit · needs approval', 'Order sent and logged'],
      approvedStep: 'Approved · Martín López · Finance',
      status: { run: 'Running', wait: 'Waiting for approval', done: 'Completed' },
      stamp: 'Logged for audit ✓',
      panelLabel: 'Nocti · Panel',
      approvals: 'Approvals',
      tag: { none: 'Nothing pending', pending: 'Pending', ok: 'Approved' },
      need: 'Needs your approval',
      approved: 'Approved',
      order: ORDER_EN,
      rule: 'Exceeds the $10,000,000 limit for automatic purchases.',
      sources: ['ERP · Stock', 'Plastar 2026 contract', 'Purchasing policy'],
      approve: 'Approve',
      reject: 'Reject',
      approvedFrom: 'Approved on WhatsApp · Martín López',
      wa: {
        label: 'WhatsApp', name: 'Nocti', online: 'online',
        from: 'Purchasing agent · Distribuidora Andes',
        text: 'Exceeds the $10,000,000 limit for automatic purchases. Do you approve the order?',
        qr: ['Approve', 'See details', 'Reject'],
        reply: 'Approved ✓',
      },
      mail: {
        label: 'Email', inbox: 'Inbox',
        fromK: 'From:', from: 'Nocti · Purchasing agent',
        toK: 'To:', to: 'Martín López · Finance',
        subject: `Subject: Approval required: ${ORDER_EN}`,
        body: 'The order exceeds the $10,000,000 limit for automatic purchases. Sources: ERP · Stock · Plastar 2026 contract.pdf · Purchasing policy.',
        review: 'Review in Nocti',
      },
      tabs: ['Nocti', 'WhatsApp', 'Email'],
    },
  },
};
