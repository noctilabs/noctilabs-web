import type { Localized } from '../types';

/** Textos de interfaz de la plantilla de industria (Inv §3); el contenido de cada industria vive en `industries.ts`. */
export interface IndustriaCopy {
  /** Prefijo del kicker del hero: «{kicker} · {label}». */
  kicker: string;
  processes: { kicker: string; title: string };
  questions: { kicker: string };
  agents: { kicker: string; title: string; badge: string };
  whyTitle: (whyFor: string) => string;
  others: string;
}

// D4: inglés provisorio, pendiente de revisión del dueño.
export const industria: Localized<IndustriaCopy> = {
  es: {
    kicker: 'Industrias',
    processes: { kicker: 'Procesos clave', title: 'Los procesos que mueven tu operación.' },
    questions: { kicker: 'Preguntas que le podés hacer a Nocti' },
    agents: { kicker: 'Agentes posibles', title: 'Agentes que trabajan sobre tu operación real.', badge: 'Agente' },
    whyTitle: (whyFor) => `Por qué Nocti para ${whyFor}.`,
    others: 'Otras industrias',
  },
  en: {
    kicker: 'Industries',
    processes: { kicker: 'Key processes', title: 'The processes that drive your operation.' },
    questions: { kicker: 'Questions you can ask Nocti' },
    agents: { kicker: 'Possible agents', title: 'Agents that work on your real operation.', badge: 'Agent' },
    whyTitle: (whyFor) => `Why Nocti for ${whyFor}.`,
    others: 'Other industries',
  },
};
