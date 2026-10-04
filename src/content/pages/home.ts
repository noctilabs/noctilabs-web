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

/** Etiquetas de los nodos de los diagramas (Inv §9.11). La geometría vive en sections/home/diagrams.ts. */
export interface DiagramLabels {
  capa: string; erp: string; crm: string; planillas: string; personas: string; mails: string; whatsapp: string; documentos: string;
  contexto: string; procesos: string; reglas: string; relaciones: string; excepciones: string; ia: string; construido: string;
  compartido: string; ventas: string; finanzas: string; operaciones: string; agComercial: string; agCobranzas: string; aplicaciones: string;
}

interface Card { n: string; t: string; d: string; ex: string }
interface Step extends Card { who: string }

export interface HomeCopy {
  before: {
    kicker: string;
    title: ByState;
    /** Primera palabra de cada botón y del kicker de los pies; la segunda es «Nocti». */
    word: ByState;
    hint: string;
    live: ByState;
    diagrams: [BaDiagram, BaDiagram, BaDiagram];
    labels: DiagramLabels;
    close: [string, string];
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
      kicker: 'Antes y después',
      title: { sin: 'Cómo operan hoy las empresas.', con: 'Cómo pueden operar.' },
      word: { sin: 'Sin', con: 'Con' },
      hint: 'Elegir una vista detiene la animación automática.',
      live: { sin: 'Sin Nocti: Cómo operan hoy las empresas.', con: 'Con Nocti: Cómo pueden operar.' },
      diagrams: [
        {
          title: { sin: 'Fragmentado', con: 'Conectado' },
          text: { sin: 'Información y conocimiento dispersos.', con: 'Tus sistemas y fuentes de conocimiento, conectados en una misma capa.' },
          desc: {
            sin: 'ERP, CRM, planillas, personas, mails, WhatsApp y documentos dispersos, sin conexión entre sí.',
            con: 'ERP, CRM, planillas, personas, mails, WhatsApp y documentos conectados a una misma capa de conexión de Nocti.',
          },
        },
        {
          title: { sin: 'Genérico', con: 'Contextualizado' },
          text: { sin: 'La IA conoce el modelo, no tu empresa.', con: 'La IA entiende cómo funciona tu empresa: procesos, reglas, relaciones y excepciones.' },
          desc: {
            sin: 'Una IA genérica, sin conexión con el ERP, el CRM, los documentos ni las personas. Procesos, reglas, relaciones y excepciones quedan sueltos.',
            con: 'ERP, CRM, documentos y personas alimentan un contexto empresarial construido por Nocti, con procesos, reglas, relaciones y excepciones, y ese contexto alimenta a la IA.',
          },
        },
        {
          title: { sin: 'Aislado', con: 'Coordinado' },
          text: { sin: 'Personas, aplicaciones y agentes trabajan por separado.', con: 'Personas, aplicaciones y agentes trabajan sobre el mismo contexto, con permisos y trazabilidad.' },
          desc: {
            sin: 'Ventas, Finanzas, Operaciones, el agente comercial, el agente de cobranzas y las aplicaciones trabajan por separado, sin conexión entre sí.',
            con: 'Ventas, Finanzas, Operaciones, el agente comercial, el agente de cobranzas y las aplicaciones conectados a un contexto compartido de Nocti, con permisos verificados.',
          },
        },
      ],
      labels: {
        capa: 'Nocti · capa de conexión', erp: 'ERP', crm: 'CRM', planillas: 'Planillas', personas: 'Personas', mails: 'Mails', whatsapp: 'WhatsApp', documentos: 'Documentos',
        contexto: 'Contexto empresarial', procesos: 'Procesos', reglas: 'Reglas', relaciones: 'Relaciones', excepciones: 'Excepciones', ia: 'IA', construido: 'construido por Nocti',
        compartido: 'Contexto compartido · Nocti', ventas: 'Ventas', finanzas: 'Finanzas', operaciones: 'Operaciones',
        agComercial: 'Agente comercial', agCobranzas: 'Agente de cobranzas', aplicaciones: 'Aplicaciones',
      },
      close: ['Tus sistemas siguen siendo tus sistemas.', 'Nocti los conecta, los contextualiza y los vuelve utilizables por personas e IA.'],
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
      kicker: 'Before and after',
      title: { sin: 'How companies operate today.', con: 'How they could operate.' },
      word: { sin: 'Without', con: 'With' },
      hint: 'Choosing a view stops the automatic animation.',
      live: { sin: 'Without Nocti: How companies operate today.', con: 'With Nocti: How they could operate.' },
      diagrams: [
        {
          title: { sin: 'Fragmented', con: 'Connected' },
          text: { sin: 'Scattered information and knowledge.', con: 'Your systems and knowledge sources, connected in a single layer.' },
          desc: {
            sin: 'ERP, CRM, spreadsheets, people, email, WhatsApp and documents scattered, with no connection between them.',
            con: 'ERP, CRM, spreadsheets, people, email, WhatsApp and documents connected to a single Nocti connection layer.',
          },
        },
        {
          title: { sin: 'Generic', con: 'Contextualized' },
          text: { sin: 'AI knows the model, not your company.', con: 'AI understands how your company works: processes, rules, relationships and exceptions.' },
          desc: {
            sin: 'A generic AI with no connection to the ERP, the CRM, documents or people. Processes, rules, relationships and exceptions are left loose.',
            con: 'ERP, CRM, documents and people feed a business context built by Nocti, with processes, rules, relationships and exceptions, and that context feeds the AI.',
          },
        },
        {
          title: { sin: 'Isolated', con: 'Coordinated' },
          text: { sin: 'People, applications and agents work separately.', con: 'People, applications and agents work on the same context, with permissions and traceability.' },
          desc: {
            sin: 'Sales, Finance, Operations, the sales agent, the collections agent and the applications work separately, with no connection between them.',
            con: 'Sales, Finance, Operations, the sales agent, the collections agent and the applications connected to a shared Nocti context, with verified permissions.',
          },
        },
      ],
      labels: {
        capa: 'Nocti · connection layer', erp: 'ERP', crm: 'CRM', planillas: 'Spreadsheets', personas: 'People', mails: 'Email', whatsapp: 'WhatsApp', documentos: 'Documents',
        contexto: 'Business context', procesos: 'Processes', reglas: 'Rules', relaciones: 'Relationships', excepciones: 'Exceptions', ia: 'AI', construido: 'built by Nocti',
        compartido: 'Shared context · Nocti', ventas: 'Sales', finanzas: 'Finance', operaciones: 'Operations',
        agComercial: 'Sales agent', agCobranzas: 'Collections agent', aplicaciones: 'Applications',
      },
      close: ['Your systems are still your systems.', 'Nocti connects them, puts them in context and makes them usable by people and AI.'],
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
