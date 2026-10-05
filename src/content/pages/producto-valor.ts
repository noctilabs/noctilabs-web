import type { Localized } from '../types';
import type { NodeLabel } from '../../scripts/value-graph';

export interface ValorItem { title: string; text: string }

/** Copy de «El valor de una capa compartida» en Producto (spec 006 §3.3). El inglés sale de `i18n-en.js` del diseño. */
export interface ValorCopy {
  kicker: string;
  title: string;
  lead: string;
  /** Alternativa textual del grafo, que es decorativo (aria-hidden). */
  graphAlt: string;
  legend: { systems: string; people: string; knowledge: string };
  nodes: Record<NodeLabel, string>;
  items: [ValorItem, ValorItem, ValorItem, ValorItem, ValorItem, ValorItem];
  /** Botón de pausa del avance automático: el verbo visible y el resto del nombre accesible. */
  pause: { pause: string; play: string; rest: string };
}

export const valor: Localized<ValorCopy> = {
  es: {
    kicker: 'Valor compuesto',
    title: 'El valor de una capa compartida',
    lead: 'Cada sistema, persona y decisión que se suma a Nocti hace más útil todo lo que ya está conectado.',
    graphAlt: 'Grafo ilustrativo: sistemas, personas, conocimiento y un agente que se van conectando en seis etapas, una por cada beneficio.',
    legend: { systems: 'Sistemas', people: 'Personas', knowledge: 'Conocimiento' },
    nodes: {
      erp: 'ERP', crm: 'CRM', drive: 'Drive', whatsapp: 'WhatsApp', correo: 'Correo',
      ventas: 'Ventas', finanzas: 'Finanzas', operaciones: 'Operaciones', compras: 'Compras',
      agente: 'Agente', politicas: 'Políticas', contratos: 'Contratos',
    },
    items: [
      { title: 'Menos tiempo buscando información', text: 'Personas y agentes acceden al mismo contexto sin reconstruirlo cada vez.' },
      { title: 'Decisiones con más contexto', text: 'Los datos, antecedentes, reglas y conocimiento relevantes aparecen juntos.' },
      { title: 'Más trazabilidad', text: 'Podés entender qué información se utilizó, qué decisión se tomó y qué acción se ejecutó.' },
      { title: 'Menos dependencia de personas clave', text: 'El conocimiento deja de vivir únicamente en quienes saben cómo resolver cada situación.' },
      { title: 'Nuevos casos de uso más rápido', text: 'Cada aplicación o agente nuevo aprovecha las integraciones y el contexto que ya existen.' },
      { title: 'Conocimiento que se acumula', text: 'Las decisiones, excepciones y acciones generan una memoria cada vez más rica de cómo opera la empresa.' },
    ],
    pause: { pause: 'Pausar', play: 'Reanudar', rest: 'el avance automático' },
  },
  en: {
    kicker: 'Compounding value',
    title: 'The value of a shared layer',
    lead: 'Every system, person and decision added to Nocti makes everything already connected more useful.',
    graphAlt: 'Illustrative graph: systems, people, knowledge and an agent connecting over six stages, one for each benefit.',
    legend: { systems: 'Systems', people: 'People', knowledge: 'Knowledge' },
    nodes: {
      erp: 'ERP', crm: 'CRM', drive: 'Drive', whatsapp: 'WhatsApp', correo: 'Email',
      ventas: 'Sales', finanzas: 'Finance', operaciones: 'Operations', compras: 'Purchasing',
      agente: 'Agent', politicas: 'Policies', contratos: 'Contracts',
    },
    items: [
      { title: 'Less time searching for information', text: 'People and agents access the same context without rebuilding it every time.' },
      { title: 'Decisions with more context', text: 'The relevant data, history, rules and knowledge show up together.' },
      { title: 'More traceability', text: 'You can see what information was used, what decision was made and what action was taken.' },
      { title: 'Less dependence on key people', text: 'Knowledge no longer lives only with the people who know how to handle each situation.' },
      { title: 'New use cases, faster', text: 'Every new application or agent builds on the integrations and context that already exist.' },
      { title: 'Knowledge that compounds', text: 'Decisions, exceptions and actions build an ever-richer memory of how the company operates.' },
    ],
    pause: { pause: 'Pause', play: 'Resume', rest: 'automatic rotation' },
  },
};
