import type { Localized } from '../types';

export interface OvCard { title: string; text: string }

export interface ProductSection {
  /** Ancla de la sección (la usan el header, el menú mobile y el footer). */
  id: 'cerebro' | 'bi' | 'agentes';
  view: 'cerebro' | 'inteligencia' | 'agentes';
  kicker: string;
  title: string;
  lead: string;
  chips: [string, string, string, string, string, string];
  /** Caption debajo de la demo (Inv §2.4, spec 003 §3.3). */
  caption: string;
}

/** Copy de la página Producto (Inv §2). El h1 sale de `ui.pages.producto.h1`. */
export interface ProductoCopy {
  hero: { kicker: string; lead: string };
  /** Caption de la demo general (Inv §2.2). */
  demoCaption: string;
  overview: {
    kicker: string;
    title: string;
    inLabel: string;
    in: [OvCard, OvCard, OvCard];
    bar: { label: string; pills: [string, string, string] };
    outLabel: string;
    out: [OvCard, OvCard, OvCard];
  };
  sections: [ProductSection, ProductSection, ProductSection];
  control: {
    kicker: string;
    title: string;
    lead: string;
    layers: [string, string, string];
    bar: { title: string; list: string };
    /** Caption de la demo de aprobación (Inv §2.5). */
    caption: string;
  };
}

// D4: inglés provisorio, pendiente de revisión del dueño.
export const producto: Localized<ProductoCopy> = {
  es: {
    hero: {
      kicker: 'Nocti · Producto',
      lead: 'Un sistema desde el que personas e IA pueden entender el negocio, tomar decisiones y ejecutar trabajo.',
    },
    demoCaption: 'Recorré Nocti desde el menú lateral · datos ilustrativos',
    overview: {
      kicker: 'Overview',
      title: 'Una capa que conecta lo que tu empresa ya tiene.',
      inLabel: 'Lo que tu empresa ya tiene · se queda donde está',
      in: [
        { title: 'Sistemas', text: 'ERP, CRM, planillas, correo, WhatsApp' },
        { title: 'Conocimiento', text: 'Documentos, procesos, reglas, políticas' },
        { title: 'Operaciones', text: 'Pedidos, tareas, excepciones, aprobaciones' },
      ],
      bar: { label: 'Capa de conexión', pills: ['Conecta', 'Contextualiza', 'Gobierna'] },
      outLabel: 'Quiénes lo usan',
      out: [
        { title: 'Personas', text: 'Preguntan, deciden y actúan según su rol' },
        { title: 'Inteligencia de negocio', text: 'Métricas y análisis sobre datos vivos' },
        { title: 'Agentes', text: 'Ejecutan trabajo con permisos y reglas' },
      ],
    },
    sections: [
      {
        id: 'cerebro', view: 'cerebro',
        kicker: 'Cerebro organizacional',
        title: 'Preguntá. Decidí. Ejecutá.',
        lead: 'CEO, Comercial y Operaciones consultan el mismo cerebro, pero ven solo la información y las acciones que les corresponden.',
        chips: ['Pregunta en lenguaje natural', 'Respuesta contextualizada', 'Fuentes consultadas', 'Permisos por rol', 'Análisis e insight', 'Acción sugerida'],
        caption: 'Cambiá de rol con “Ver como” para comparar respuestas.',
      },
      {
        id: 'bi', view: 'inteligencia',
        kicker: 'Inteligencia / BI',
        title: 'De la pregunta al dato. Del dato a la acción.',
        lead: 'Conversacional y visual, no un tablero estático. Cada resultado se puede rastrear hasta el registro que lo origina.',
        chips: ['Lenguaje natural', 'Métricas sobre datos vivos', 'Trazabilidad hasta la fuente', 'Del KPI a la transacción', 'Anomalías y excepciones', 'Acciones desde el análisis'],
        caption: 'Probá “Ver transacciones” para bajar del KPI al detalle.',
      },
      {
        id: 'agentes', view: 'agentes',
        kicker: 'Agentes',
        title: 'Agentes que trabajan sobre el contexto real de tu empresa.',
        lead: 'Creá los tuyos, integrá los que ya tenés o construílos con NoctiLabs.',
        chips: ['Crear o integrar', 'Sistemas, fuentes y herramientas', 'Permisos, reglas y acciones', 'Probar, publicar y versionar', 'Tareas, excepciones y aprobaciones', 'Historial y consumo de tokens'],
        caption: 'Los agentes usan los mismos permisos y la misma trazabilidad que las personas.',
      },
    ],
    control: {
      kicker: 'Control y gobernanza',
      title: 'Una capa de control debajo de todo.',
      lead: 'Cerebro, Inteligencia y Agentes comparten los mismos permisos, aprobaciones y trazabilidad.',
      layers: ['Cerebro', 'Inteligencia', 'Agentes'],
      bar: { title: 'Control y gobernanza', list: 'Permisos · Seguridad · Aprobaciones · Trazabilidad · Observabilidad · Agentes' },
      caption: 'Ejemplo: una orden por encima del límite espera aprobación humana. Probá aprobarla o rechazarla.',
    },
  },
  en: {
    hero: {
      kicker: 'Nocti · Product',
      lead: 'A system where people and AI can understand the business, make decisions and get work done.',
    },
    demoCaption: 'Explore Nocti from the side menu · illustrative data',
    overview: {
      kicker: 'Overview',
      title: 'A layer that connects what your company already has.',
      inLabel: 'What your company already has · stays where it is',
      in: [
        { title: 'Systems', text: 'ERP, CRM, spreadsheets, email, WhatsApp' },
        { title: 'Knowledge', text: 'Documents, processes, rules, policies' },
        { title: 'Operations', text: 'Orders, tasks, exceptions, approvals' },
      ],
      bar: { label: 'Connection layer', pills: ['Connects', 'Contextualizes', 'Governs'] },
      outLabel: 'Who uses it',
      out: [
        { title: 'People', text: 'Ask, decide and act according to their role' },
        { title: 'Business intelligence', text: 'Metrics and analysis on live data' },
        { title: 'Agents', text: 'Do work with permissions and rules' },
      ],
    },
    sections: [
      {
        id: 'cerebro', view: 'cerebro',
        kicker: 'Organizational brain',
        title: 'Ask. Decide. Execute.',
        lead: 'CEO, Sales and Operations query the same brain, but each sees only the information and actions that apply to them.',
        chips: ['Natural-language questions', 'Contextualized answers', 'Sources consulted', 'Role-based permissions', 'Analysis and insight', 'Suggested action'],
        caption: 'Switch roles with “View as” to compare answers.',
      },
      {
        id: 'bi', view: 'inteligencia',
        kicker: 'Intelligence / BI',
        title: 'From question to data. From data to action.',
        lead: 'Conversational and visual, not a static dashboard. Every result can be traced back to the record it comes from.',
        chips: ['Natural language', 'Metrics on live data', 'Traceability to the source', 'From KPI to transaction', 'Anomalies and exceptions', 'Actions from analysis'],
        caption: 'Try “See transactions” to drill down from the KPI to the detail.',
      },
      {
        id: 'agentes', view: 'agentes',
        kicker: 'Agents',
        title: 'Agents that work on your company’s real context.',
        lead: 'Create your own, integrate the ones you already have or build them with NoctiLabs.',
        chips: ['Create or integrate', 'Systems, sources and tools', 'Permissions, rules and actions', 'Test, publish and version', 'Tasks, exceptions and approvals', 'History and token usage'],
        caption: 'Agents use the same permissions and the same traceability as people.',
      },
    ],
    control: {
      kicker: 'Control and governance',
      title: 'A control layer beneath everything.',
      lead: 'Brain, Intelligence and Agents share the same permissions, approvals and traceability.',
      layers: ['Brain', 'Intelligence', 'Agents'],
      bar: { title: 'Control and governance', list: 'Permissions · Security · Approvals · Traceability · Observability · Agents' },
      caption: 'Example: an order above the limit waits for human approval. Try approving or rejecting it.',
    },
  },
};
