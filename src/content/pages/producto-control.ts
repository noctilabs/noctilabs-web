import type { Localized } from '../types';
import type { IconKey } from '../../scripts/nicon';
import { OC, PURCHASE_LIMIT } from '../../islands/noctiapp/data/facts';
import { makeFmt } from '../../islands/noctiapp/data/format';

export interface Gate {
  /** Rótulo corto de la compuerta del diagrama («Permisos»). */
  short: string;
  title: string;
  text: string;
  /** Lo que le pasa a la OC-4471 en esta compuerta, cuando termina el recorrido. */
  fx: string;
  icon: IconKey;
}
type Six<T> = [T, T, T, T, T, T];
type Five<T> = [T, T, T, T, T];

/**
 * «Control y gobernanza», variante «C · Editorial» de la v4 (spec 007 §3.D; diseño L564–651 y L1055–1070, L1442–1478):
 * diagrama de arquitectura con seis compuertas y, debajo, el control elegido con su vista de ejemplo.
 * Orden de las compuertas: el de la v4 (GATE_SHORT), con su ícono c1…c6 (FLOW_ORDER).
 * Datos: los de la demo (facts.ts, spec 003 y 006): límite $10.000.000, OC-4471 por $18.400.000 y la aprobación de
 * Carla Ruiz, como en la traza de la app (la v4 dice Valeria Costa, que en la app es quien cambió el límite).
 * El inglés sale de `i18n-en.js` de la v4; lo que no está ahí va marcado como provisorio (F4).
 */
export interface ControlCopy {
  kicker: string;
  title: string;
  lead: string;
  /** Nombre del diagrama; en mobile también es el texto de la banda negra. */
  diagram: string;
  peopleLabel: string;
  bandLabel: string;
  systemsLabel: string;
  /** 0 = el agente que origina la OC (Agente de compras); 4 = Finanzas, que la aprueba. 0 y 1 son agentes. */
  people: Five<string>;
  /** 0 = ERP, donde el agente crea la orden. */
  systems: Five<string>;
  gates: Six<Gate>;
  pending: string;
  snip: {
    order: string;
    perm: { agent: string; status: string; rows: [ok: boolean, t: string, d: string][] };
    limit: { head: string; value: string; auto: string; over: string; note: string; fill: string };
    appr: { pending: string; approved: string; rejected: string; who: string; order: string; approve: string; reject: string; approvedMsg: string; rejectedMsg: string; undo: string };
    trace: [t: string, x: string, s: string][];
    agents: [n: string, tasks: string, s: string, tone: 'ok' | 'warn' | 'err'][];
    log: [t: string, a: string, x: string][];
    export: string;
  };
}

const es = makeFmt('es');
const en = makeFmt('en');
/** Parte del límite sobre el monto de la OC: el relleno de la barra (≈ 54 %). */
const fill = `${Math.round((PURCHASE_LIMIT / OC.amount) * 100)}%`;
const ICONS: Six<IconKey> = ['c1', 'c3', 'c2', 'c4', 'c5', 'c6'];
const gates = (g: Six<[string, string, string, string]>): Six<Gate> =>
  g.map(([short, title, text, fx], i) => ({ short, title, text, fx, icon: ICONS[i]! })) as Six<Gate>;

export const control: Localized<ControlCopy> = {
  es: {
    kicker: 'Control y gobernanza',
    title: 'Delegá trabajo en la IA sin perder el control.',
    lead: 'Cerebro, Inteligencia y Agentes comparten los mismos permisos, aprobaciones y trazabilidad.',
    diagram: 'Seis controles entre las personas, los agentes y tus sistemas.',
    peopleLabel: 'Personas y agentes',
    bandLabel: 'Control y gobernanza · Nocti',
    systemsLabel: 'Tus sistemas · siguen donde están',
    people: ['Agente de compras', 'Agente de cobranzas', 'CEO', 'Comercial', 'Finanzas'],
    systems: ['ERP', 'CRM', 'Drive', 'Correo', 'WhatsApp'],
    gates: gates([
      ['Permisos', 'Permisos por rol', 'Cada persona y cada agente acceden únicamente a lo que les corresponde.', 'Permitido · el agente puede crear la orden en el ERP'],
      ['Límites', 'Límites de acción', 'Controlá qué sistemas, herramientas y acciones puede utilizar cada agente.', `Detenida · ${es.money(OC.amount)} supera el límite de ${es.money(PURCHASE_LIMIT)}`],
      ['Aprobaciones', 'Aprobaciones humanas', 'Definí cuándo una acción puede ejecutarse automáticamente y cuándo requiere intervención.', 'Enviada a Carla Ruiz · Finanzas'],
      ['Trazabilidad', 'Trazabilidad completa', 'Sabé qué información se utilizó, qué decisión se tomó y qué acción se ejecutó.', 'Registrada con sus 3 fuentes'],
      ['Observabilidad', 'Observabilidad', 'Supervisá actividad, excepciones, errores y resultados de tus agentes.', 'Visible en el monitoreo de agentes'],
      ['Auditoría', 'Auditoría e historial', 'Conservá un registro verificable de acciones, cambios y decisiones.', 'Guardada en el registro de auditoría'],
    ]),
    pending: `${OC.id} en camino…`,
    snip: {
      order: OC.id,
      perm: {
        agent: 'Agente de compras',
        status: 'Activo',
        rows: [[true, 'ERP · Compras', 'Crear órdenes'], [true, 'Correo', 'Enviar a proveedores'], [false, 'Pagos', 'Sin acceso'], [false, 'Precios', 'Sin acceso']],
      },
      limit: {
        head: 'Límite de compra automática',
        value: `Hasta ${es.money(PURCHASE_LIMIT)}`,
        auto: `${es.mill(PURCHASE_LIMIT, 0)} · automática`,
        over: `${OC.id} · ${es.mill(OC.amount)}`,
        note: 'Ejecución automática detenida. Requiere aprobación de Finanzas.',
        fill,
      },
      appr: {
        pending: 'Requiere aprobación humana',
        approved: 'Aprobada',
        rejected: 'Rechazada',
        who: 'Carla Ruiz · Finanzas',
        order: `${OC.id} · ${OC.supplier} · ${es.money(OC.amount)}`,
        approve: 'Aprobar',
        reject: 'Rechazar',
        approvedMsg: 'Aprobada por Carla Ruiz a las 10:07. Se registra en el ERP.',
        rejectedMsg: 'Rechazada. El agente registró el motivo.',
        undo: 'Deshacer',
      },
      trace: [
        ['09:58', 'Detectó stock bajo del SKU 4410', 'ERP · Stock SKU 4410'],
        ['10:00', 'Consultó el contrato vigente', 'Contrato Plastar 2026.pdf'],
        ['10:01', 'Aplicó la regla de compras', 'Política de compras'],
      ],
      agents: [
        ['Agente de compras', '6 tareas', 'Completada', 'ok'],
        ['Agente de cobranzas', '214 tareas', '1 excepción', 'warn'],
        ['Agente comercial', '38 tareas', '1 error', 'err'],
      ],
      log: [
        ['10:08', 'Agente de compras', `Registró ${OC.id} en el ERP`],
        ['10:07', 'Carla Ruiz · Finanzas', `Aprobó ${OC.id} · ${es.money(OC.amount)}`],
        ['10:04', 'Agente de compras', `Envió ${OC.id} a aprobación`],
      ],
      export: 'Exportar registro',
    },
  },
  en: {
    // Provisorio (F4), no está en i18n-en.js: título, rótulos del diagrama, «Limits», los efectos de cada compuerta,
    // «on its way», los estados y botones de la aprobación, dos pasos de la traza (tomados de la app), las tareas de
    // los agentes y el registro.
    kicker: 'Control and governance',
    title: 'Delegate work to AI without losing control.',
    lead: 'Brain, Intelligence and Agents share the same permissions, approvals and traceability.',
    diagram: 'Six controls between people, agents and your systems.',
    peopleLabel: 'People and agents',
    bandLabel: 'Control and governance · Nocti',
    systemsLabel: 'Your systems · stay where they are',
    people: ['Purchasing agent', 'Collections agent', 'CEO', 'Sales', 'Finance'],
    systems: ['ERP', 'CRM', 'Drive', 'Email', 'WhatsApp'],
    gates: gates([
      ['Permissions', 'Role-based permissions', 'Each person and each agent accesses only what applies to them.', 'Allowed · the agent can create the order in the ERP'],
      ['Limits', 'Action limits', 'Control which systems, tools and actions each agent can use.', `Stopped · ${en.money(OC.amount)} exceeds the ${en.money(PURCHASE_LIMIT)} limit`],
      ['Approvals', 'Human approvals', 'Define when an action can run automatically and when it needs a person.', 'Sent to Carla Ruiz · Finance'],
      ['Traceability', 'Full traceability', 'Know what information was used, what decision was made and what action was taken.', 'Logged with its 3 sources'],
      ['Observability', 'Observability', 'Monitor your agents’ activity, exceptions, errors and results.', 'Visible in agent monitoring'],
      ['Audit', 'Audit and history', 'Keep a verifiable record of actions, changes and decisions.', 'Saved to the audit log'],
    ]),
    pending: `${OC.id} on its way…`,
    snip: {
      order: OC.id,
      perm: {
        agent: 'Purchasing agent',
        status: 'Active',
        rows: [[true, 'ERP · Purchasing', 'Create orders'], [true, 'Email', 'Send to suppliers'], [false, 'Payments', 'No access'], [false, 'Pricing', 'No access']],
      },
      limit: {
        head: 'Automatic purchase limit',
        value: `Up to ${en.money(PURCHASE_LIMIT)}`,
        auto: `${en.mill(PURCHASE_LIMIT, 0)} · automatic`,
        over: `${OC.id} · ${en.mill(OC.amount)}`,
        note: 'Automatic execution stopped. Needs Finance approval.',
        fill,
      },
      appr: {
        pending: 'Needs human approval',
        approved: 'Approved',
        rejected: 'Rejected',
        who: 'Carla Ruiz · Finance',
        order: `${OC.id} · ${OC.supplier} · ${en.money(OC.amount)}`,
        approve: 'Approve',
        reject: 'Reject',
        approvedMsg: 'Approved by Carla Ruiz at 10:07. It’s recorded in the ERP.',
        rejectedMsg: 'Rejected. The agent logged the reason.',
        undo: 'Undo',
      },
      trace: [
        ['09:58', 'Detected low stock on SKU 4410', 'ERP · Stock SKU 4410'],
        ['10:00', 'Checked the current contract', 'Plastar contract 2026.pdf'],
        ['10:01', 'Applied the purchasing rule', 'Purchasing policy'],
      ],
      agents: [
        ['Purchasing agent', '6 tasks', 'Completed', 'ok'],
        ['Collections agent', '214 tasks', '1 exception', 'warn'],
        ['Sales agent', '38 tasks', '1 error', 'err'],
      ],
      log: [
        ['10:08', 'Purchasing agent', `Recorded ${OC.id} in the ERP`],
        ['10:07', 'Carla Ruiz · Finance', `Approved ${OC.id} · ${en.money(OC.amount)}`],
        ['10:04', 'Purchasing agent', `Sent ${OC.id} for approval`],
      ],
      export: 'Export log',
    },
  },
};
