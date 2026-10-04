import type { Localized, Photo } from '../types';

/** Persona del equipo (D9): la sección no se renderiza mientras la lista esté vacía (spec 002 §4.4). */
export interface TeamMember { name: string; role: string; photo: Photo }

interface Block { kicker: string; title: string; text: string }

export interface NosotrosCopy {
  kicker: string;
  blocks: [Block, Block];
  beliefs: { kicker: string; items: [string, string, string] };
  team: { kicker: string; h2: string; members: TeamMember[] };
}

// El H1, el title y la descripción salen de ui.pages.nosotros (spec 002 §3.1).
export const nosotros: Localized<NosotrosCopy> = {
  es: {
    kicker: 'Nosotros',
    blocks: [
      {
        kicker: 'Quiénes somos',
        title: 'Un equipo de producto, datos e implementación.',
        text: 'NoctiLabs combina software y servicio: construimos Nocti y lo implementamos junto a cada empresa, sobre sus sistemas y su forma de trabajar.',
      },
      {
        kicker: 'Por qué construimos Nocti',
        title: 'Las empresas ya saben lo que necesitan saber.',
        text: 'Pero ese conocimiento está repartido entre sistemas, planillas, conversaciones y personas. Construimos Nocti para que esté disponible para todos, con los permisos correctos, y para que la IA trabaje sobre él.',
      },
    ],
    beliefs: {
      kicker: 'Qué creemos',
      items: [
        'El contexto vale más que el modelo.',
        'Personas y agentes deben trabajar sobre la misma base.',
        'Sin control y trazabilidad no hay confianza.',
      ],
    },
    team: { kicker: 'Equipo', h2: 'Las personas detrás de Nocti.', members: [] },
  },
  // D4: traducción provisoria, pendiente de revisión del dueño.
  en: {
    kicker: 'About',
    blocks: [
      {
        kicker: 'Who we are',
        title: 'A product, data and implementation team.',
        text: 'NoctiLabs combines software and service: we build Nocti and implement it alongside each company, on top of its systems and the way it works.',
      },
      {
        kicker: 'Why we build Nocti',
        title: 'Companies already know what they need to know.',
        text: 'But that knowledge is spread across systems, spreadsheets, conversations and people. We build Nocti so it’s available to everyone, with the right permissions, and so AI can work on top of it.',
      },
    ],
    beliefs: {
      kicker: 'What we believe',
      items: [
        'Context is worth more than the model.',
        'People and agents should work on the same foundation.',
        'Without control and traceability, there is no trust.',
      ],
    },
    team: { kicker: 'Team', h2: 'The people behind Nocti.', members: [] },
  },
};
