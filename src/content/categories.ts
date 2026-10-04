import type { Localized } from './types';

/** Categorías de Insights: ids estables, labels por idioma (spec 002 §3.4). */
export const CATEGORY_IDS = ['tesis', 'contexto', 'ia-operativa', 'agentes', 'transformacion'] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

export const categoryLabels: Record<CategoryId, Localized<string>> = {
  tesis: { es: 'Tesis', en: 'Thesis' },
  contexto: { es: 'Contexto de negocio', en: 'Business context' },
  'ia-operativa': { es: 'IA operativa', en: 'Operational AI' },
  agentes: { es: 'Agentes', en: 'Agents' },
  transformacion: { es: 'Transformación', en: 'Transformation' },
};
