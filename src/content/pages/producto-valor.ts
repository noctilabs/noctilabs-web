import type { Localized } from '../types';
import type { IconKey } from '../../scripts/nicon';

export interface ValorRow { icon: IconKey; title: string; text: string }

/**
 * Copy de «El valor de una capa compartida», variante «C · Editorial» de la v4 (spec 007 §3.D; diseño BEN_ED, L1055).
 * El inglés sale de `i18n-en.js` de la v4; lo que no está ahí va marcado como provisorio (F4).
 */
export interface ValorCopy {
  kicker: string;
  title: string;
  lead: string;
  rows: [ValorRow, ValorRow, ValorRow, ValorRow, ValorRow, ValorRow];
}

export const valor: Localized<ValorCopy> = {
  es: {
    kicker: 'Capa compartida',
    title: 'El valor de una capa compartida',
    lead: 'Lo que cambia cuando personas e IA trabajan sobre el mismo contexto de tu empresa.',
    rows: [
      { icon: 'b1', title: 'Menos tiempo buscando información', text: 'Encontrá lo que necesitás, cuando lo necesitás.' },
      { icon: 'b2', title: 'Decisiones con más contexto', text: 'Datos, reglas, antecedentes y conocimiento en una misma vista.' },
      { icon: 'b7', title: 'Más rentabilidad', text: 'Mejores decisiones, menos errores y más oportunidades detectadas ayudan a proteger margen y reducir costos.' },
      { icon: 'b3', title: 'Una misma versión de la realidad', text: 'Equipos distintos trabajan sobre las mismas definiciones, métricas y datos.' },
      { icon: 'b5', title: 'Nuevos casos de uso más rápido', text: 'Reutilizá contexto, integraciones y reglas ya construidas.' },
      { icon: 'b6', title: 'Conocimiento que se acumula', text: 'Cada decisión, excepción y acción enriquece lo que la empresa sabe.' },
    ],
  },
  en: {
    // Provisorio (F4): kicker, lead, las bajadas de las seis filas y los títulos 3 y 4 no están en i18n-en.js.
    kicker: 'Shared layer',
    title: 'The value of a shared layer',
    lead: 'What changes when people and AI work on the same context of your company.',
    rows: [
      { icon: 'b1', title: 'Less time searching for information', text: 'Find what you need, when you need it.' },
      { icon: 'b2', title: 'Decisions with more context', text: 'Data, rules, history and knowledge in a single view.' },
      { icon: 'b7', title: 'More profitability', text: 'Better decisions, fewer errors and more opportunities spotted help protect margin and cut costs.' },
      { icon: 'b3', title: 'A single version of the truth', text: 'Different teams work on the same definitions, metrics and data.' },
      { icon: 'b5', title: 'New use cases, faster', text: 'Reuse the context, integrations and rules you’ve already built.' },
      { icon: 'b6', title: 'Knowledge that compounds', text: 'Every decision, exception and action adds to what the company knows.' },
    ],
  },
};
