import { readFile } from 'node:fs/promises';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

// Spec 002 §3.4: Insights desde Sanity (proyecto q164hlpj, dataset production, lectura pública).
const SANITY = { projectId: 'q164hlpj', dataset: 'production', apiVersion: 'v2025-02-19' };
const QUERY = `*[_type == "post"]{
  _id, "slug": slug.current, "slugEs": slugEs.current, publishedAt, listed, showOnInsights, topic,
  category, readingTime, title, excerpt, body
}`;

const localized = <T extends z.ZodType>(t: T) => z.object({ es: t.nullish(), en: t.nullish() }).partial().nullish();

/** Datos crudos de cada documento: las reglas de publicación se aplican en src/lib/insights.ts. */
export const rawPost = z.object({
  _id: z.string(),
  slug: z.string().nullish(),
  slugEs: z.string().nullish(),
  publishedAt: z.string().nullish(),
  listed: z.boolean().nullish(),
  showOnInsights: z.boolean().nullish(),
  topic: z.string().nullish(),
  category: localized(z.string()),
  readingTime: z.number().nullish(),
  title: localized(z.string()),
  excerpt: localized(z.string()),
  body: localized(z.array(z.any())),
});

async function fetchPosts(): Promise<unknown[]> {
  const fixture = process.env.INSIGHTS_FIXTURE;
  if (fixture) return JSON.parse(await readFile(fixture, 'utf8')).result;
  const url = `https://${SANITY.projectId}.api.sanity.io/${SANITY.apiVersion}/data/query/${SANITY.dataset}`
    + `?perspective=published&query=${encodeURIComponent(QUERY)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sanity respondió ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (!Array.isArray(json?.result)) throw new Error('Sanity devolvió una respuesta sin `result`');
  return json.result;
}

const insights = defineCollection({
  loader: {
    name: 'sanity-insights',
    // Sincronización completa: con una respuesta válida se vacía el store y se guarda un documento por `_id`
    // (sin entradas residuales de posts retirados; dos posts con el mismo slug llegan los dos a getArticles()).
    load: async ({ store, parseData }) => {
      const docs = await fetchPosts();
      store.clear();
      for (const doc of docs as { _id: string }[]) {
        store.set({ id: doc._id, data: await parseData({ id: doc._id, data: doc as Record<string, unknown> }) });
      }
    },
  },
  schema: rawPost,
});

export const collections = { insights };
