import type { Localized } from '../types';

/** Estado del antes/después (spec 002 §4.1.2). */
export type BaState = 'sin' | 'con';
export type ByState = Record<BaState, string>;

export interface BaDiagram {
  title: ByState;
  text: ByState;
  /** Descripción textual del dibujo para lectores de pantalla (visualmente oculta). */
  desc: ByState;
}

/** Etiquetas de los nodos de los diagramas de la Opción 1 (Inv §9.12). La geometría vive en sections/home/diagrams.ts. */
export interface DiagramLabels {
  erp: string; crm: string; planillas: string; whatsapp: string; mails: string; documentos: string; personas: string; empresa: string;
  procesos: string; reglas: string; clientes: string; precios: string; excepciones: string; iaGenerica: string; iaNocti: string;
  ventas: string; finanzas: string; operaciones: string; agComercial: string; agCobranzas: string; compartido: string;
}

interface Card { n: string; t: string; d: string; ex: string }
interface Step extends Card { who: string }

export interface HomeCopy {
  before: {
    kicker: string;
    /** Nombre accesible del grupo Sin/Con (el kicker ya no describe la comparación). */
    control: string;
    title: ByState;
    /** Primera palabra de cada botón y del kicker de los pies; la segunda es «Nocti». */
    word: ByState;
    hint: string;
    live: ByState;
    diagrams: [BaDiagram, BaDiagram, BaDiagram];
    labels: DiagramLabels;
  };
  roles: { h2: string; lead: string; note: string };
  capabilities: { kicker: string; h2: string; items: [Card, Card, Card, Card]; cta: string };
  steps: { h2: string; lead: string; items: [Step, Step, Step, Step] };
  industries: { h2: string; lead: string; tablist: string; more: string; moreAbout: string };
}

// D4: el inglés es traducción provisoria, pendiente de revisión del dueño.
export const home: Localized<HomeCopy> = {
  es: {
    before: {
      kicker: 'Por qué Nocti',
      control: 'Antes y después',
      title: { sin: 'Cómo operan hoy las empresas.', con: 'Cómo pueden operar.' },
      word: { sin: 'Sin', con: 'Con' },
      hint: 'La vista cambia al desplazarte; elegir una la mantiene mientras esta sección siga en pantalla.',
      live: { sin: 'Sin Nocti: Cómo operan hoy las empresas.', con: 'Con Nocti: Cómo pueden operar.' },
      diagrams: [
        {
          title: { sin: 'Fragmentado', con: 'Conectado' },
          text: { sin: 'Información y conocimiento dispersos.', con: 'Sistemas y conocimiento sobre una misma base.' },
          desc: {
            sin: 'ERP, CRM, planillas, WhatsApp, mails, documentos y personas dispersos, sin conexión entre sí.',
            con: 'ERP, CRM, planillas, WhatsApp, mails, documentos y personas en un anillo, todos conectados a tu empresa, en el centro.',
          },
        },
        {
          title: { sin: 'Genérico', con: 'Contextualizado' },
          text: { sin: 'La IA conoce el modelo, no tu empresa.', con: 'La IA entiende procesos, reglas y realidad operativa.' },
          desc: {
            sin: 'Una IA genérica y, sueltos y apagados, sin conexión con ella: procesos, reglas, clientes, precios y excepciones.',
            con: 'IA + Nocti conectada a una columna ordenada de procesos, reglas, clientes, precios y excepciones.',
          },
        },
        {
          title: { sin: 'Aislado', con: 'Coordinado' },
          text: { sin: 'Personas, sistemas y agentes trabajan por separado.', con: 'Personas y agentes trabajan sobre el mismo contexto.' },
          desc: {
            sin: 'Ventas, Finanzas, Operaciones, el agente comercial y el agente de cobranzas, dispersos y sin conexión entre sí.',
            con: 'Ventas, Finanzas y Operaciones en una fila y, debajo, el agente comercial y el agente de cobranzas, todos conectados a un contexto compartido de Nocti.',
          },
        },
      ],
      labels: {
        erp: 'ERP', crm: 'CRM', planillas: 'Planillas', whatsapp: 'WhatsApp', mails: 'Mails', documentos: 'Documentos', personas: 'Personas', empresa: 'Tu empresa',
        procesos: 'Procesos', reglas: 'Reglas', clientes: 'Clientes', precios: 'Precios', excepciones: 'Excepciones', iaGenerica: 'IA genérica', iaNocti: 'IA + Nocti',
        ventas: 'Ventas', finanzas: 'Finanzas', operaciones: 'Operaciones', agComercial: 'Agente comercial', agCobranzas: 'Agente de cobranzas', compartido: 'Contexto compartido · Nocti',
      },
    },
    roles: {
      h2: 'Toda la empresa puede preguntar. Cada uno ve lo que le corresponde.',
      lead: 'La experiencia cambia por rol, manteniendo el mismo cerebro organizacional y los permisos correspondientes.',
      note: 'En Preguntar, cada persona y cada agente ven únicamente lo que sus permisos permiten.',
    },
    capabilities: {
      kicker: 'Capacidades',
      h2: 'Qué podés hacer dentro de Nocti.',
      items: [
        { n: '01', t: 'Preguntar', d: 'Consultá cualquier aspecto de tu empresa.', ex: '“¿Qué clientes compran menos que hace tres meses?”' },
        { n: '02', t: 'Analizar', d: 'Entendé qué está pasando y por qué.', ex: 'Del KPI a la transacción que lo explica.' },
        { n: '03', t: 'Actuar', d: 'Convertí una respuesta en una acción.', ex: 'Preparar un seguimiento, una orden o un recordatorio.' },
        { n: '04', t: 'Controlar', d: 'Supervisá agentes, tareas, excepciones y trazabilidad.', ex: 'Cada acción queda registrada, con permisos y aprobaciones.' },
      ],
      cta: 'Creá tus propios agentes, integrá los que ya tenés o construílos con NoctiLabs.',
    },
    steps: {
      h2: 'Construimos Nocti alrededor de tu empresa.',
      lead: 'Servicio + plataforma. El equipo de NoctiLabs implementa y tu organización sigue construyendo sobre Nocti.',
      items: [
        { n: '01', who: 'NoctiLabs', t: 'Entendemos', d: 'Aprendemos cómo funciona tu empresa.', ex: 'Entrevistas, procesos y reglas reales del negocio.' },
        { n: '02', who: 'NoctiLabs', t: 'Conectamos', d: 'Unimos sistemas, información y conocimiento.', ex: 'ERP, CRM, planillas, correo y documentos, sin migrar nada.' },
        { n: '03', who: 'NoctiLabs + Nocti', t: 'Implementamos', d: 'Ponemos Nocti en funcionamiento sobre ese contexto.', ex: 'Primeros casos de uso en producción, por rol.' },
        { n: '04', who: 'Tu equipo + Nocti', t: 'Evolucionamos', d: 'Sumamos procesos, agentes y nuevas capacidades.', ex: 'Nuevos agentes y procesos sobre el mismo contexto.' },
      ],
    },
    industries: {
      h2: 'Pensado para cómo opera tu industria.',
      lead: 'Organizado alrededor de procesos, preguntas y agentes reales de cada sector.',
      tablist: 'Industrias',
      more: 'Conocer más',
      moreAbout: 'sobre',
    },
  },
  en: {
    before: {
      kicker: 'Why Nocti',
      control: 'Before and after',
      title: { sin: 'How companies operate today.', con: 'How they could operate.' },
      word: { sin: 'Without', con: 'With' },
      hint: 'The view changes as you scroll; choosing one keeps it while this section stays on screen.',
      live: { sin: 'Without Nocti: How companies operate today.', con: 'With Nocti: How they could operate.' },
      diagrams: [
        {
          title: { sin: 'Fragmented', con: 'Connected' },
          // Opción 1 (2026-10-04): los textos y etiquetas nuevos son traducción provisoria (D4).
          text: { sin: 'Scattered information and knowledge.', con: 'Systems and knowledge on a single foundation.' },
          desc: {
            sin: 'ERP, CRM, spreadsheets, WhatsApp, email, documents and people scattered, with no connection between them.',
            con: 'ERP, CRM, spreadsheets, WhatsApp, email, documents and people in a ring, all connected to your company at the center.',
          },
        },
        {
          title: { sin: 'Generic', con: 'Contextualized' },
          text: { sin: 'AI knows the model, not your company.', con: 'AI understands processes, rules and operational reality.' },
          desc: {
            sin: 'A generic AI and, loose and faded, with no connection to it: processes, rules, customers, prices and exceptions.',
            con: 'AI + Nocti connected to an ordered column of processes, rules, customers, prices and exceptions.',
          },
        },
        {
          title: { sin: 'Isolated', con: 'Coordinated' },
          text: { sin: 'People, systems and agents work separately.', con: 'People and agents work on the same context.' },
          desc: {
            sin: 'Sales, Finance, Operations, the sales agent and the collections agent, scattered and with no connection between them.',
            con: 'Sales, Finance and Operations in a row and, below them, the sales agent and the collections agent, all connected to a shared Nocti context.',
          },
        },
      ],
      labels: {
        erp: 'ERP', crm: 'CRM', planillas: 'Spreadsheets', whatsapp: 'WhatsApp', mails: 'Email', documentos: 'Documents', personas: 'People', empresa: 'Your company',
        procesos: 'Processes', reglas: 'Rules', clientes: 'Customers', precios: 'Prices', excepciones: 'Exceptions', iaGenerica: 'Generic AI', iaNocti: 'AI + Nocti',
        ventas: 'Sales', finanzas: 'Finance', operaciones: 'Operations', agComercial: 'Sales agent', agCobranzas: 'Collections agent', compartido: 'Shared context · Nocti',
      },
    },
    roles: {
      h2: 'The whole company can ask. Everyone sees what’s theirs to see.',
      lead: 'The experience changes by role, with the same organizational brain and the right permissions.',
      note: 'In Ask, each person and each agent sees only what their permissions allow.',
    },
    capabilities: {
      kicker: 'Capabilities',
      h2: 'What you can do inside Nocti.',
      items: [
        { n: '01', t: 'Ask', d: 'Ask about any aspect of your company.', ex: '“Which customers are buying less than three months ago?”' },
        { n: '02', t: 'Analyze', d: 'Understand what’s happening and why.', ex: 'From the KPI to the transaction that explains it.' },
        { n: '03', t: 'Act', d: 'Turn an answer into an action.', ex: 'Prepare a follow-up, an order or a reminder.' },
        { n: '04', t: 'Control', d: 'Oversee agents, tasks, exceptions and traceability.', ex: 'Every action is logged, with permissions and approvals.' },
      ],
      cta: 'Create your own agents, integrate the ones you already have or build them with NoctiLabs.',
    },
    steps: {
      h2: 'We build Nocti around your company.',
      lead: 'Service + platform. The NoctiLabs team implements, and your organization keeps building on Nocti.',
      items: [
        { n: '01', who: 'NoctiLabs', t: 'We understand', d: 'We learn how your company works.', ex: 'Interviews, processes and the real rules of the business.' },
        { n: '02', who: 'NoctiLabs', t: 'We connect', d: 'We bring together systems, information and knowledge.', ex: 'ERP, CRM, spreadsheets, email and documents, with nothing to migrate.' },
        { n: '03', who: 'NoctiLabs + Nocti', t: 'We implement', d: 'We put Nocti to work on that context.', ex: 'First use cases in production, by role.' },
        { n: '04', who: 'Your team + Nocti', t: 'We evolve', d: 'We add processes, agents and new capabilities.', ex: 'New agents and processes on the same context.' },
      ],
    },
    industries: {
      h2: 'Built for how your industry operates.',
      lead: 'Organized around the real processes, questions and agents of each sector.',
      tablist: 'Industries',
      more: 'Learn more',
      moreAbout: 'about',
    },
  },
};
