import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { ARTICLE_SLUGS, type ArticleId } from './i18n/routes';
import { CATEGORY_IDS } from './content/categories';

const ARTICLE_IDS = Object.keys(ARTICLE_SLUGS) as [ArticleId, ...ArticleId[]];

// Spec 002 §3.4: un Markdown por artículo e idioma. El id de la entrada es el path relativo completo
// (sin normalizar, así dos archivos nunca colisionan); la unicidad de (articleId, lang) y la presencia
// de las dos traducciones las valida getArticles().
const insights = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/insights', generateId: ({ entry }) => entry }),
  schema: z.object({
    articleId: z.enum(ARTICLE_IDS),
    lang: z.enum(['es', 'en']),
    title: z.string().min(1),
    category: z.enum(CATEGORY_IDS),
    excerpt: z.string().min(1),
    date: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((d) => new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d, 'fecha de calendario inválida'),
    minutes: z.number().int().positive(),
  }),
});

export const collections = { insights };
