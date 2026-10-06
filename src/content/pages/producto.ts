import type { Localized } from '../types';

export interface OvCard { title: string; text: string }
export interface CtlItem { title: string; text: string }

export interface ProductSection {
  /** Ancla de la sección (la usan el header, el menú mobile y el footer). */
  id: 'cerebro' | 'bi' | 'agentes';
  /** La sección por rol de la v4 no lleva kicker. */
  kicker?: string;
  title: string;
  lead: string;
  /** Capacidades de la sección (Inteligencia y Agentes; en Agentes las enciende la corrida). */
  chips?: [string, string, string, string, string, string];
  /** Nota debajo de la demo. */
  caption?: string;
  /** Enlace a Hablemos debajo de la demo de Agentes (v4 «→ Nuevo agente»). */
  cta?: [string, string];
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
    bar: string;
    /** Los 6 controles del acordeón (spec 006 §3.4); el n.º i abre la sub-vista i + 1 de la app. */
    items: [CtlItem, CtlItem, CtlItem, CtlItem, CtlItem, CtlItem];
    /** Control visible del avance automático (WCAG 2.2.2). */
    autoplay: { pause: string; play: string };
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
        id: 'cerebro',
        title: 'Preguntá. Entendé. Actuá.',
        lead: 'Cada persona y agente trabaja sobre el mismo contexto, con la información y los permisos que le corresponden.',
        caption: 'Cambiá de rol con “Ver como” para comparar respuestas.',
      },
      {
        id: 'bi',
        kicker: 'Inteligencia / BI',
        title: 'Entendé qué está pasando y por qué.',
        lead: 'Explorá métricas sobre datos vivos, detectá cambios y llegá desde una pregunta hasta el dato que la explica.',
        chips: ['Lenguaje natural', 'Métricas sobre datos vivos', 'Trazabilidad hasta la fuente', 'Del KPI a la transacción', 'Anomalías y excepciones', 'Acciones desde el análisis'],
      },
      {
        id: 'agentes',
        kicker: 'Agentes',
        title: 'Agentes que trabajan sobre el contexto real de tu empresa.',
        lead: 'Creá los tuyos, integrá los que ya tenés o construílos con NoctiLabs.',
        chips: ['Crear o integrar', 'Sistemas, fuentes y herramientas', 'Permisos, reglas y acciones', 'Probar, publicar y versionar', 'Tareas, excepciones y aprobaciones', 'Historial y consumo de tokens'],
        caption: 'Los agentes usan los mismos permisos y la misma trazabilidad que las personas.',
        cta: ['Creá un agente, conectá uno existente o pedile uno a NoctiLabs', '→ Nuevo agente'],
      },
    ],
    control: {
      kicker: 'Control y gobernanza',
      title: 'Controlá cómo personas e IA operan sobre tu empresa',
      lead: 'Cerebro, Inteligencia y Agentes comparten los mismos permisos, aprobaciones y trazabilidad.',
      layers: ['Cerebro', 'Inteligencia', 'Agentes'],
      bar: 'Control y gobernanza',
      items: [
        { title: 'Permisos por rol', text: 'Cada persona y cada agente acceden únicamente a lo que les corresponde.' },
        { title: 'Aprobaciones humanas', text: 'Definí cuándo una acción puede ejecutarse automáticamente y cuándo requiere intervención.' },
        { title: 'Límites de acción', text: 'Controlá qué sistemas, herramientas y acciones puede utilizar cada agente.' },
        { title: 'Trazabilidad completa', text: 'Sabé qué información se utilizó, qué decisión se tomó y qué acción se ejecutó.' },
        { title: 'Observabilidad', text: 'Supervisá actividad, excepciones, errores y resultados de tus agentes.' },
        { title: 'Auditoría e historial', text: 'Conservá un registro verificable de acciones, cambios y decisiones.' },
      ],
      autoplay: { pause: 'Pausar avance', play: 'Reanudar avance' },
    },
  },
  en: {
    hero: {
      kicker: 'Nocti · Product',
      lead: 'One system where people and AI can understand the business, make decisions and get work done.',
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
        id: 'cerebro',
        title: 'Ask. Understand. Act.',
        lead: 'Every person and agent works on the same context, with the information and permissions that are theirs.',
        caption: 'Switch roles with “View as” to compare answers.',
      },
      {
        id: 'bi',
        kicker: 'Intelligence / BI',
        title: 'Understand what’s happening and why.',
        lead: 'Explore metrics on live data, spot changes and go from a question to the data point that explains it.',
        chips: ['Natural language', 'Metrics on live data', 'Traceable to the source', 'From KPI to transaction', 'Anomalies and exceptions', 'Actions from analysis'],
      },
      {
        id: 'agentes',
        kicker: 'Agents',
        title: 'Agents that work on your company’s real context.',
        lead: 'Build your own, integrate the ones you have, or build them with NoctiLabs.',
        chips: ['Build or integrate', 'Systems, sources and tools', 'Permissions, rules and actions', 'Test, publish and version', 'Tasks, exceptions and approvals', 'History and token usage'],
        caption: 'Agents use the same permissions and traceability as people.',
        cta: ['Create an agent, connect an existing one or ask NoctiLabs for one', '→ New agent'],
      },
    ],
    control: {
      kicker: 'Control and governance',
      title: 'Control how people and AI operate across your company',
      lead: 'Brain, Intelligence and Agents share the same permissions, approvals and traceability.',
      layers: ['Brain', 'Intelligence', 'Agents'],
      bar: 'Control and governance',
      items: [
        { title: 'Role-based permissions', text: 'Each person and each agent accesses only what applies to them.' },
        { title: 'Human approvals', text: 'Define when an action can run automatically and when it needs a person.' },
        { title: 'Action limits', text: 'Control which systems, tools and actions each agent can use.' },
        { title: 'Full traceability', text: 'Know what information was used, what decision was made and what action was taken.' },
        { title: 'Observability', text: 'Monitor your agents’ activity, exceptions, errors and results.' },
        { title: 'Audit and history', text: 'Keep a verifiable record of actions, changes and decisions.' },
      ],
      autoplay: { pause: 'Pause autoplay', play: 'Resume autoplay' },
    },
  },
};
