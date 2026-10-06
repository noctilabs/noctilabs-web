import type { Localized } from '../types';

/** Quien pregunta en el acto 1: alterna entre Comercial y Operaciones en cada vuelta del montaje. */
interface Asker {
  role: 'comercial' | 'operaciones';
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

/** «Preguntá. Entendé. Actuá.» (spec 007 §3.B): textos de `Home Montage.dc.html` de la v4. */
export interface MontageCopy {
  h2: string;
  lead: string;
  viewAs: string;
  roles: { ceo: string; comercial: string; operaciones: string; agentes: string };
  segs: [string, string, string];
  /** Nombre accesible del botón de pausa y de los segmentos. */
  pause: string;
  play: string;
  /** Alternativa textual de cada acto (el escenario es decorativo y va con aria-hidden). */
  alt: { title: string; acts: [string, string, string] };
  ask: { placeholder: string; consulting: string; consulted: string; connections: string; askers: [Asker, Asker] };
  understand: {
    kpi: string;
    value: string;
    delta: string;
    anomaly: string;
    anomalyText: string;
    crumbs: [string, string, string];
    tx: [string, string, string, string, string][];
    sales: string;
    q: string;
    who: { name: string; initials: string; bg: string };
    lead: string;
    causes: [string, string][];
    total: string;
    totalPp: string;
    button: string;
  };
  act: {
    agent: string;
    status: { run: string; wait: string; done: string };
    stamp: string;
    steps: [string, string, string, string];
    approved: string;
    tabs: [string, string, string];
    panel: {
      label: string; title: string; tag: { none: string; wait: string; ok: string }; head: { wait: string; ok: string };
      oc: string; limit: string; chips: [string, string, string]; approve: string; reject: string; done: string;
    };
    wa: { online: string; sender: string; text: string; replies: [string, string, string]; reply: string };
    mail: { label: string; inbox: string; from: [string, string]; to: [string, string]; subject: string; body: string; review: string };
  };
}

export const montage: Localized<MontageCopy> = {
  es: {
    h2: 'Preguntá. Entendé. Actuá.',
    lead: 'Personas y agentes trabajan sobre el mismo contexto, con la información, las fuentes y los permisos que les corresponden.',
    viewAs: 'Ver como',
    roles: { ceo: 'CEO', comercial: 'Comercial', operaciones: 'Operaciones', agentes: 'Agentes' },
    segs: ['Preguntá', 'Entendé', 'Actuá'],
    pause: 'Pausar la demo',
    play: 'Reanudar la demo',
    alt: {
      title: 'Qué muestra la demo',
      acts: [
        'Preguntá: Jorge Rodríguez, de Comercial, pregunta qué clientes debería contactar hoy y por qué. Nocti consulta el CRM y el ERP y responde con 12 clientes prioritarios, solo de sus cuentas, con acciones para seguir. En la vuelta siguiente, Silvana Pérez, de Operaciones, pregunta qué está frenando la operación y recibe los 7 pedidos con riesgo.',
        'Entendé: Laura Méndez, la CEO, pregunta por qué cayó el margen bruto, que bajó de 31,4 % a 28,2 % esta semana. Nocti marca la anomalía (el costo de resina subió 11 % desde el 1/9), explica las tres causas (insumos, −1,6 pp; descuentos en mayoristas, −1,1 pp, y cambio de mix, −0,5 pp) y baja a las transacciones del ERP.',
        'Actuá: el agente de compras detecta stock bajo del SKU 4410 y prepara la OC-4471 por $18.400.000. Como supera el límite de $10.000.000 para compras automáticas, pide aprobación en el panel de Nocti, por WhatsApp y por correo. Martín López, de Finanzas, la aprueba desde WhatsApp; la orden se envía y queda registrada en auditoría.',
      ],
    },
    ask: {
      placeholder: 'Preguntale algo a tu empresa…',
      consulting: 'Consultando…',
      consulted: 'Contexto consultado',
      connections: 'Conexiones',
      askers: [
        {
          role: 'comercial', name: 'Jorge Rodríguez', initials: 'JR', bg: '#24613F',
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
          role: 'operaciones', name: 'Silvana Pérez', initials: 'SP', bg: '#7A5208',
          q: '¿Qué está frenando la operación hoy?',
          lead: 'Hay 7 pedidos con riesgo operativo:',
          items: ['4 pedidos esperan reposición de stock.', '2 pedidos están bloqueados por aprobación comercial.', '1 pedido tiene una incidencia logística pendiente.'],
          cx: ['ERP · Pedidos', 'WMS · Stock', 'Logística · Entregas'],
          perm: 'Silvana ve pedidos, stock, proveedores y logística.',
          acts: ['Ver pedidos afectados →', 'Priorizar reposición →', 'Escalar bloqueos →'],
        },
      ],
    },
    understand: {
      kpi: 'Margen bruto',
      value: '28,2%',
      delta: '−3,2 pp vs semana anterior',
      anomaly: 'Anomalía',
      anomalyText: 'Desde el 1/9: costo de resina +11%',
      crumbs: ['Margen bruto', 'Mayoristas zona sur', 'Transacciones'],
      tx: [
        ['Mayorista El Sur', 'Línea básica 1 kg', '14%', '16,2%', 'FA-21044'],
        ['Distribuidora Litoral Sur', 'Línea básica 500 g', '13%', '17,8%', 'FA-21039'],
        ['Mayorista El Sur', 'Línea básica 5 kg', '15%', '15,4%', 'FA-21021'],
      ],
      sales: 'ERP · Ventas',
      q: '¿Por qué cayó el margen esta semana?',
      who: { name: 'Laura Méndez', initials: 'LM', bg: '#0038CC' },
      lead: 'El margen bajó de 31,4% a 28,2%. Tres causas:',
      causes: [['Mayor costo de insumos', '−1,6 pp'], ['Descuentos en mayoristas', '−1,1 pp'], ['Cambio de mix', '−0,5 pp']],
      total: 'Variación total',
      totalPp: '−3,2 pp',
      button: 'Ver transacciones',
    },
    act: {
      agent: 'Agente de compras',
      status: { run: 'Ejecutando', wait: 'Esperando aprobación', done: 'Completado' },
      stamp: 'Registrado en auditoría ✓',
      steps: ['Detecta stock bajo del SKU 4410', 'Prepara OC-4471 · $18,4 M', 'Supera el límite · requiere aprobación', 'Orden enviada y registrada'],
      approved: 'Aprobado · Martín López · Finanzas',
      tabs: ['Nocti', 'WhatsApp', 'Correo'],
      panel: {
        label: 'Nocti · Panel',
        title: 'Aprobaciones',
        tag: { none: 'Sin pendientes', wait: 'Pendiente', ok: 'Aprobado' },
        head: { wait: 'Necesita tu aprobación', ok: 'Aprobado' },
        oc: 'OC-4471 · Plastar S.A. · $18.400.000',
        limit: 'Supera el límite de $10.000.000 para compras automáticas.',
        chips: ['ERP · Stock', 'Contrato Plastar 2026', 'Política de compras'],
        approve: 'Aprobar',
        reject: 'Rechazar',
        done: 'Aprobado desde WhatsApp · Martín López',
      },
      wa: {
        online: 'en línea',
        sender: 'Agente de compras · Distribuidora Andes',
        text: 'Supera el límite de $10.000.000 para compras automáticas. ¿Aprobás la orden?',
        replies: ['Aprobar', 'Ver detalle', 'Rechazar'],
        reply: 'Aprobado ✓',
      },
      mail: {
        label: 'Correo',
        inbox: 'Bandeja de entrada',
        from: ['De:', 'Nocti · Agente de compras'],
        to: ['Para:', 'Martín López · Finanzas'],
        subject: 'Asunto: Aprobación requerida: OC-4471 · Plastar S.A. · $18.400.000',
        body: 'La orden supera el límite de $10.000.000 para compras automáticas. Fuentes: ERP · Stock · Contrato Plastar 2026.pdf · Política de compras.',
        review: 'Revisar en Nocti',
      },
    },
  },
  // D4 / F4: el título y los roles salen de i18n-en.js de la v4; el resto no está en ese diccionario y es traducción
  // provisoria, pendiente de revisión del dueño (con los términos de la isla en inglés).
  en: {
    h2: 'Ask. Understand. Act.',
    lead: 'People and agents work on the same context, with the information, sources and permissions that apply to them.',
    viewAs: 'View as',
    roles: { ceo: 'CEO', comercial: 'Sales', operaciones: 'Operations', agentes: 'Agents' },
    segs: ['Ask', 'Understand', 'Act'],
    pause: 'Pause the demo',
    play: 'Resume the demo',
    alt: {
      title: 'What the demo shows',
      acts: [
        'Ask: Jorge Rodríguez, from Sales, asks which customers he should contact today and why. Nocti checks the CRM and the ERP and answers with 12 priority customers, only from his accounts, with next actions. On the next loop, Silvana Pérez, from Operations, asks what is holding operations back and gets the 7 orders at risk.',
        'Understand: Laura Méndez, the CEO, asks why gross margin fell from 31.4% to 28.2% this week. Nocti flags the anomaly (resin cost up 11% since 9/1), explains the three causes (input costs, −1.6 pp; wholesale discounts, −1.1 pp; mix shift, −0.5 pp) and drills down to the ERP transactions.',
        'Act: the purchasing agent detects low stock on SKU 4410 and prepares OC-4471 for $18,400,000. Since it exceeds the $10,000,000 limit for automatic purchases, it requests approval in the Nocti panel, on WhatsApp and by email. Martín López, from Finance, approves it on WhatsApp; the order is sent and logged in the audit trail.',
      ],
    },
    ask: {
      placeholder: 'Ask your company anything…',
      consulting: 'Checking…',
      consulted: 'Context checked',
      connections: 'Connections',
      askers: [
        {
          role: 'comercial', name: 'Jorge Rodríguez', initials: 'JR', bg: '#24613F',
          q: 'Which customers should I contact today and why?',
          lead: 'There are 12 priority customers for today:',
          items: [
            '5 customers bought over 20% less than their 90-day average.',
            '4 customers have open quotes with no follow-up for over 7 days.',
            '3 customers bought a category with a clear cross-selling opportunity.',
          ],
          cx: ['CRM · Accounts', 'ERP · Sales', 'CRM · Quotes'],
          perm: 'Jorge only sees his own accounts, orders and opportunities.',
          acts: ['View customers →', 'Prepare follow-ups →', 'Create tasks →'],
        },
        {
          role: 'operaciones', name: 'Silvana Pérez', initials: 'SP', bg: '#7A5208',
          q: 'What is holding operations back today?',
          lead: 'There are 7 orders at operational risk:',
          items: ['4 orders are waiting for stock replenishment.', '2 orders are blocked pending sales approval.', '1 order has a pending logistics issue.'],
          cx: ['ERP · Orders', 'WMS · Stock', 'Logistics · Deliveries'],
          perm: 'Silvana sees orders, stock, suppliers and logistics.',
          acts: ['View affected orders →', 'Prioritize restocking →', 'Escalate blockers →'],
        },
      ],
    },
    understand: {
      kpi: 'Gross margin',
      value: '28.2%',
      delta: '−3.2 pp vs previous week',
      anomaly: 'Anomaly',
      anomalyText: 'Since 9/1: resin cost +11%',
      crumbs: ['Gross margin', 'Southern wholesalers', 'Transactions'],
      tx: [
        ['Mayorista El Sur', 'Basic line 1 kg', '14%', '16.2%', 'FA-21044'],
        ['Distribuidora Litoral Sur', 'Basic line 500 g', '13%', '17.8%', 'FA-21039'],
        ['Mayorista El Sur', 'Basic line 5 kg', '15%', '15.4%', 'FA-21021'],
      ],
      sales: 'ERP · Sales',
      q: 'Why did margin drop this week?',
      who: { name: 'Laura Méndez', initials: 'LM', bg: '#0038CC' },
      lead: 'Margin fell from 31.4% to 28.2%. Three causes:',
      causes: [['Higher input costs', '−1.6 pp'], ['Wholesale discounts', '−1.1 pp'], ['Mix shift', '−0.5 pp']],
      total: 'Total change',
      totalPp: '−3.2 pp',
      button: 'View transactions',
    },
    act: {
      agent: 'Purchasing agent',
      status: { run: 'Running', wait: 'Waiting for approval', done: 'Completed' },
      stamp: 'Logged in audit ✓',
      steps: ['Detects low stock on SKU 4410', 'Prepares OC-4471 · $18.4 M', 'Exceeds the limit · needs approval', 'Order sent and logged'],
      approved: 'Approved · Martín López · Finance',
      tabs: ['Nocti', 'WhatsApp', 'Email'],
      panel: {
        label: 'Nocti · Panel',
        title: 'Approvals',
        tag: { none: 'Nothing pending', wait: 'Pending', ok: 'Approved' },
        head: { wait: 'Needs your approval', ok: 'Approved' },
        oc: 'OC-4471 · Plastar S.A. · $18,400,000',
        limit: 'Exceeds the $10,000,000 limit for automatic purchases.',
        chips: ['ERP · Stock', 'Plastar contract 2026', 'Purchasing policy'],
        approve: 'Approve',
        reject: 'Reject',
        done: 'Approved on WhatsApp · Martín López',
      },
      wa: {
        online: 'online',
        sender: 'Purchasing agent · Distribuidora Andes',
        text: 'Exceeds the $10,000,000 limit for automatic purchases. Do you approve the order?',
        replies: ['Approve', 'View details', 'Reject'],
        reply: 'Approved ✓',
      },
      mail: {
        label: 'Email',
        inbox: 'Inbox',
        from: ['From:', 'Nocti · Purchasing agent'],
        to: ['To:', 'Martín López · Finance'],
        subject: 'Subject: Approval required: OC-4471 · Plastar S.A. · $18,400,000',
        body: 'The order exceeds the $10,000,000 limit for automatic purchases. Sources: ERP · Stock · Plastar contract 2026.pdf · Purchasing policy.',
        review: 'Review in Nocti',
      },
    },
  },
};
