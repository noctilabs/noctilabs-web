import { getCollection, type CollectionEntry } from 'astro:content';
import { ARTICLE_SLUGS, type ArticleId, type Locale } from '../i18n/routes';

export type ArticleEntry = CollectionEntry<'insights'>;
export type Article = { id: ArticleId; date: string } & Record<Locale, ArticleEntry>;

const LOCALES: Locale[] = ['es', 'en'];

/**
 * Artículos publicados, validados contra el registro (spec 002 §3.4). Falla el build si un par
 * (articleId, lang) aparece más de una vez, si falta una traducción o si un cuerpo está vacío.
 * Ordenados por fecha descendente.
 */
export async function getArticles(): Promise<Article[]> {
  const entries = await getCollection('insights');
  const byPair = new Map<string, ArticleEntry[]>();
  for (const e of entries) {
    const key = `${e.data.articleId}.${e.data.lang}`;
    byPair.set(key, [...(byPair.get(key) ?? []), e]);
  }
  const errors: string[] = [];
  for (const [key, list] of byPair) {
    if (list.length > 1) errors.push(`${key} aparece en ${list.length} archivos: ${list.map((e) => e.filePath).join(', ')}`);
  }
  const articles: Article[] = [];
  for (const id of Object.keys(ARTICLE_SLUGS) as ArticleId[]) {
    const pair = {} as Record<Locale, ArticleEntry>;
    for (const lang of LOCALES) {
      const entry = byPair.get(`${id}.${lang}`)?.[0];
      if (!entry) errors.push(`falta la traducción ${lang} de ${id}`);
      else if (!entry.body?.trim()) errors.push(`${id}.${lang} tiene el cuerpo vacío`);
      else pair[lang] = entry;
    }
    if (pair.es && pair.en) {
      if (pair.es.data.date !== pair.en.data.date) errors.push(`${id}: la fecha difiere entre idiomas`);
      articles.push({ id, date: pair.es.data.date, ...pair });
    }
  }
  if (errors.length) throw new Error(`Insights inválidos:\n- ${errors.join('\n- ')}`);
  return articles.sort((a, b) => b.date.localeCompare(a.date));
}

/** Fecha editorial YYYY-MM-DD formateada sin depender de la zona horaria de la máquina. */
export function formatDate(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-UY' : 'en-US', { dateStyle: 'medium', timeZone: 'UTC' })
    .format(new Date(`${date}T00:00:00Z`));
}
