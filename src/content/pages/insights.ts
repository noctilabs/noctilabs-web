import type { Localized } from '../types';

export interface InsightsCopy {
  kicker: string;
  lead: string;
  /** Kicker del destacado: «Destacado · {categoría}» (sin categoría, solo «Destacado»). */
  featured: string;
  read: string;
  /** Plantilla de minutos compartida por destacado, tarjetas y cabecera del artículo (spec 002 §4.5). */
  minutes: (n: number) => string;
  more: string;
  empty: string;
}

// El H1, el title y la descripción salen de ui.pages.insights (spec 002 §3.1).
export const insights: Localized<InsightsCopy> = {
  es: {
    kicker: 'Blog',
    lead: 'Tesis y análisis sobre cómo cambian las organizaciones cuando personas e IA trabajan sobre el mismo contexto.',
    featured: 'Destacado',
    read: 'Leer →',
    minutes: (n) => `${n} min de lectura`,
    more: 'Más artículos',
    empty: 'Todavía no hay artículos publicados.',
  },
  // D4: traducción provisoria, pendiente de revisión del dueño.
  en: {
    kicker: 'Blog',
    lead: 'Theses and analysis on how organizations change when people and AI work on the same context.',
    featured: 'Featured',
    read: 'Read →',
    minutes: (n) => `${n} min read`,
    more: 'More articles',
    empty: 'No articles published yet.',
  },
};
