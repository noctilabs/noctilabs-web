// Datos de «Delegá trabajo en la IA sin perder el control» (spec 007 §3.5), transcriptos de V4 L1015, L1069–1077
// y L1476–1491. D4: el inglés es traducción provisoria.
import type { Locale } from '../../i18n/routes';

export interface ArchCopy {
  kicker: string;
  title: string;
  lead: string;
  ppl: string;
  band: string;
  bandMob: string;
  sys: string;
  pplNames: [string, string, string, string, string];
  sysNames: [string, string, string, string, string];
  /** Nombre corto de cada control en la banda, en el orden de la banda. */
  gates: [string, string, string, string, string, string];
  /** Título y descripción de cada control, en el orden de la banda. */
  items: [string, string][];
  fx: [string, string, string, string, string, string];
  enRoute: string;
  of: string;
  order: string;
  snPerm: { agent: string; active: string; rows: [string, string, string][] };
  snLimit: { label: string; value: string; auto: string; order: string; stop: string };
  snAppr: { pending: string; ok: string; no: string; who: string; approve: string; reject: string; okMsg: string; noMsg: string; undo: string };
  snTrace: [string, string, string][];
  snAgents: [string, string, string, 'ok' | 'warn' | 'err'][];
  snLog: [string, string, string][];
  exportLog: string;
}

export const ARCH: Record<Locale, ArchCopy> = {
  es: {
    kicker: 'Control y gobernanza',
    title: 'Delegá trabajo en la IA sin perder el control.',
    lead: 'Cerebro, Inteligencia y Agentes comparten los mismos permisos, aprobaciones y trazabilidad.',
    ppl: 'Personas y agentes',
    band: 'Control y gobernanza · Nocti',
    bandMob: 'Seis controles entre las personas, los agentes y tus sistemas.',
    sys: 'Tus sistemas · siguen donde están',
    pplNames: ['Agente de compras', 'Agente de cobranzas', 'CEO', 'Comercial', 'Finanzas'],
    sysNames: ['ERP', 'CRM', 'Drive', 'Correo', 'WhatsApp'],
    gates: ['Permisos', 'Límites', 'Aprobaciones', 'Trazabilidad', 'Observabilidad', 'Auditoría'],
    items: [
      ['Permisos por rol', 'Cada persona y cada agente acceden únicamente a lo que les corresponde.'],
      ['Límites de acción', 'Controlá qué sistemas, herramientas y acciones puede utilizar cada agente.'],
      ['Aprobaciones humanas', 'Definí cuándo una acción puede ejecutarse automáticamente y cuándo requiere intervención.'],
      ['Trazabilidad completa', 'Sabé qué información se utilizó, qué decisión se tomó y qué acción se ejecutó.'],
      ['Observabilidad', 'Supervisá actividad, excepciones, errores y resultados de tus agentes.'],
      ['Auditoría e historial', 'Conservá un registro verificable de acciones, cambios y decisiones.'],
    ],
    fx: [
      'Permitido · el agente puede crear la orden en el ERP',
      'Detenida · $18.400.000 supera el límite de $10.000.000',
      'Enviada a Valeria Costa · Finanzas',
      'Registrada con sus 3 fuentes',
      'Visible en el monitoreo de agentes',
      'Guardada en el registro de auditoría',
    ],
    enRoute: 'OC-4471 en camino…',
    of: '06',
    order: 'OC-4471',
    snPerm: {
      agent: 'Agente de compras', active: 'Activo',
      rows: [['ok', 'ERP · Compras', 'Crear órdenes'], ['ok', 'Correo', 'Enviar a proveedores'], ['no', 'Pagos', 'Sin acceso'], ['no', 'Precios', 'Sin acceso']],
    },
    snLimit: { label: 'Límite de compra automática', value: 'Hasta $10.000.000', auto: '$10 M · automática', order: 'OC-4471 · $18,4 M', stop: 'Ejecución automática detenida. Requiere aprobación de Finanzas.' },
    snAppr: {
      pending: 'Requiere aprobación humana', ok: 'Aprobada', no: 'Rechazada', who: 'Valeria Costa · Finanzas',
      approve: 'Aprobar', reject: 'Rechazar',
      okMsg: 'Aprobada por Valeria Costa a las 10:07. Se registra en el ERP.', noMsg: 'Rechazada. El agente registró el motivo.', undo: 'Deshacer',
    },
    snTrace: [['09:58', 'Detectó stock bajo del SKU 4410', 'ERP · Stock SKU 4410'], ['10:00', 'Consultó el contrato vigente', 'Contrato Plastar 2026.pdf'], ['10:01', 'Aplicó la regla de compras', 'Política de compras']],
    snAgents: [['Agente de compras', '7 tareas', 'Completada', 'ok'], ['Agente de cobranzas', '214 tareas', '1 excepción', 'warn'], ['Agente comercial', '38 tareas', '1 error', 'err']],
    snLog: [['10:08', 'Agente de compras', 'Registró OC-4471 en el ERP'], ['10:07', 'Valeria Costa · Finanzas', 'Aprobó OC-4471 · $18.400.000'], ['10:04', 'Agente de compras', 'Envió OC-4471 a aprobación']],
    exportLog: 'Exportar registro',
  },
  en: {
    kicker: 'Control and governance',
    title: 'Delegate work to AI without losing control.',
    lead: 'Brain, Intelligence and Agents share the same permissions, approvals and traceability.',
    ppl: 'People and agents',
    band: 'Control and governance · Nocti',
    bandMob: 'Six controls between people, agents and your systems.',
    sys: 'Your systems · stay where they are',
    pplNames: ['Purchasing agent', 'Collections agent', 'CEO', 'Sales', 'Finance'],
    sysNames: ['ERP', 'CRM', 'Drive', 'Email', 'WhatsApp'],
    gates: ['Permissions', 'Limits', 'Approvals', 'Traceability', 'Observability', 'Audit'],
    items: [
      ['Role-based permissions', 'Every person and every agent accesses only what belongs to them.'],
      ['Action limits', 'Control which systems, tools and actions each agent can use.'],
      ['Human approvals', 'Define when an action can run automatically and when it needs a person.'],
      ['Full traceability', 'Know what information was used, what decision was made and what action was taken.'],
      ['Observability', 'Monitor your agents’ activity, exceptions, errors and results.'],
      ['Audit and history', 'Keep a verifiable record of actions, changes and decisions.'],
    ],
    fx: [
      'Allowed · the agent can create the order in the ERP',
      'Stopped · $18,400,000 exceeds the $10,000,000 limit',
      'Sent to Valeria Costa · Finance',
      'Logged with its 3 sources',
      'Visible in agent monitoring',
      'Saved in the audit log',
    ],
    enRoute: 'PO-4471 on its way…',
    of: '06',
    order: 'PO-4471',
    snPerm: {
      agent: 'Purchasing agent', active: 'Active',
      rows: [['ok', 'ERP · Purchasing', 'Create orders'], ['ok', 'Email', 'Send to suppliers'], ['no', 'Payments', 'No access'], ['no', 'Pricing', 'No access']],
    },
    snLimit: { label: 'Automatic purchase limit', value: 'Up to $10,000,000', auto: '$10M · automatic', order: 'PO-4471 · $18.4M', stop: 'Automatic execution stopped. Needs Finance approval.' },
    snAppr: {
      pending: 'Needs human approval', ok: 'Approved', no: 'Rejected', who: 'Valeria Costa · Finance',
      approve: 'Approve', reject: 'Reject',
      okMsg: 'Approved by Valeria Costa at 10:07. Logged in the ERP.', noMsg: 'Rejected. The agent logged the reason.', undo: 'Undo',
    },
    snTrace: [['09:58', 'Detected low stock for SKU 4410', 'ERP · Stock SKU 4410'], ['10:00', 'Checked the current contract', 'Plastar 2026 contract.pdf'], ['10:01', 'Applied the purchasing rule', 'Purchasing policy']],
    snAgents: [['Purchasing agent', '7 tasks', 'Completed', 'ok'], ['Collections agent', '214 tasks', '1 exception', 'warn'], ['Sales agent', '38 tasks', '1 error', 'err']],
    snLog: [['10:08', 'Purchasing agent', 'Logged PO-4471 in the ERP'], ['10:07', 'Valeria Costa · Finance', 'Approved PO-4471 · $18,400,000'], ['10:04', 'Purchasing agent', 'Sent PO-4471 for approval']],
    exportLog: 'Export log',
  },
};
