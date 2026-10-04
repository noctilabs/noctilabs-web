import type { Localized } from '../types';

// Los minutos usan la plantilla compartida de insights.ts (spec 002 §4.5); el contenido editorial viene de Sanity.
export interface ArticuloCopy {
  back: string;
  author: string;
  toc: string;
  related: string;
}

export const articulo: Localized<ArticuloCopy> = {
  es: { back: 'Insights', author: 'NoctiLabs', toc: 'En este artículo', related: 'Seguir leyendo' },
  // D4: traducción provisoria, pendiente de revisión del dueño.
  en: { back: 'Insights', author: 'NoctiLabs', toc: 'In this article', related: 'Keep reading' },
};
