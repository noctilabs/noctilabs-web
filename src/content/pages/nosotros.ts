import type { Localized, Photo } from '../types';

/** Persona del equipo (D9): la sección no se renderiza mientras la lista esté vacía (spec 002 §4.4). */
export interface TeamMember { name: string; role: string; photo: Photo }

interface Row { n: string; t: string; d: string }

export interface NosotrosCopy {
  kicker: string;
  lead: string;
  thesis: { kicker: string; h2: string; lead: string; quote: { a: string; b: string } };
  what: { kicker: string; h2: string; lead: string; rows: [Row, Row, Row, Row]; close: string };
  how: { kicker: string; h2: string; steps: [Row, Row, Row, Row] };
  team: { kicker: string; h2: string; members: TeamMember[] };
}

// Spec 009 §3.G: castellano del v6; inglés de Claude (G4). El H1, el title y la descripción salen de ui.pages.nosotros.
export const nosotros: Localized<NosotrosCopy> = {
  es: {
    kicker: 'Quiénes somos',
    lead: 'NoctiLabs conecta sistemas, conocimiento y operación en una misma capa de contexto para que las empresas puedan convertir la información que ya tienen en mejores decisiones, mayor eficiencia y nuevas capacidades para personas e IA.',
    thesis: {
      kicker: 'Nuestra tesis',
      h2: 'La IA no puede operar un negocio que no entiende.',
      lead: 'Los modelos son cada vez más capaces. Pero para generar valor real dentro de una empresa necesitan entender cómo funciona: sus procesos, reglas, decisiones, excepciones y conocimiento.',
      quote: { a: 'El contexto es lo que transforma inteligencia genérica en', b: 'inteligencia operativa.' },
    },
    what: {
      kicker: 'Qué estamos construyendo',
      h2: 'Un lugar donde tu empresa puede entenderse a sí misma.',
      lead: 'Un cerebro organizacional desde el que personas e IA pueden:',
      rows: [
        { n: '01', t: 'Preguntar.', d: 'Acceder al conocimiento y los datos de la empresa.' },
        { n: '02', t: 'Analizar.', d: 'Entender qué está pasando y por qué.' },
        { n: '03', t: 'Decidir.', d: 'Combinar datos, antecedentes, reglas y contexto.' },
        { n: '04', t: 'Ejecutar.', d: 'Convertir decisiones en acciones y trabajo realizado.' },
      ],
      close: 'Todo sobre el mismo contexto de la empresa.',
    },
    how: {
      kicker: 'Cómo lo construimos',
      h2: 'Cómo lo construimos.',
      steps: [
        { n: '01', t: 'Entendemos', d: 'Cómo funciona realmente la empresa: sus procesos, decisiones, reglas y excepciones.' },
        { n: '02', t: 'Conectamos', d: 'Los sistemas, datos, documentos y conocimiento donde vive la operación.' },
        { n: '03', t: 'Creamos', d: 'El cerebro de la empresa: el contexto compartido que permite que personas e IA entiendan el negocio.' },
        { n: '04', t: 'Evolucionamos', d: 'Ese cerebro a medida que aparecen nuevas preguntas, procesos y oportunidades.' },
      ],
    },
    team: { kicker: 'Equipo', h2: 'Las personas detrás de Nocti.', members: [] },
  },
  en: {
    kicker: 'Who we are',
    lead: 'NoctiLabs connects systems, knowledge and operations in a single context layer, so companies can turn the information they already have into better decisions, greater efficiency and new capabilities for people and AI.',
    thesis: {
      kicker: 'Our thesis',
      h2: 'AI can’t run a business it doesn’t understand.',
      lead: 'Models keep getting more capable. But to create real value inside a company, they need to understand how it works: its processes, rules, decisions, exceptions and knowledge.',
      quote: { a: 'Context is what turns generic intelligence into', b: 'operational intelligence.' },
    },
    what: {
      kicker: 'What we’re building',
      h2: 'A place where your company can understand itself.',
      lead: 'An organizational brain from which people and AI can:',
      rows: [
        { n: '01', t: 'Ask.', d: 'Access the company’s knowledge and data.' },
        { n: '02', t: 'Analyze.', d: 'Understand what’s happening and why.' },
        { n: '03', t: 'Decide.', d: 'Combine data, history, rules and context.' },
        { n: '04', t: 'Execute.', d: 'Turn decisions into actions and completed work.' },
      ],
      close: 'All on the same company context.',
    },
    how: {
      kicker: 'How we build it',
      h2: 'How we build it.',
      steps: [
        { n: '01', t: 'We understand', d: 'How the company really works: its processes, decisions, rules and exceptions.' },
        { n: '02', t: 'We connect', d: 'The systems, data, documents and knowledge where the operation lives.' },
        { n: '03', t: 'We build', d: 'The company’s brain: the shared context that lets people and AI understand the business.' },
        { n: '04', t: 'We evolve', d: 'That brain, as new questions, processes and opportunities come up.' },
      ],
    },
    team: { kicker: 'Team', h2: 'The people behind Nocti.', members: [] },
  },
};
