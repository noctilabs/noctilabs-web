import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

// Spec 002 §3.4: Insights desde Sanity (proyecto q164hlpj, dataset production, lectura pública).
const SANITY = { projectId: 'q164hlpj', dataset: 'production', apiVersion: 'v2025-02-19' };
const QUERY = `*[_type == "post"]{
  _id, _rev, "slug": slug.current, "slugEs": slugEs.current, publishedAt, listed, showOnInsights, topic,
  category, readingTime, title, excerpt, body
}`;

const localized = <T extends z.ZodType>(t: T) => z.object({ es: t.nullish(), en: t.nullish() }).partial().nullish();

/** Datos crudos de cada documento: las reglas de publicación se aplican en src/lib/insights.ts. */
export const rawPost = z.object({
  _id: z.string(),
  _rev: z.string().nullish(),
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

/**
 * Snapshot efectivo de Sanity (spec 004 §2.9): origen, hora, hash de la respuesta y los `_id`/`_rev` que entraron al
 * build. Lo lee scripts/check-redirects.mjs para el manifiesto de publicación.
 */
async function recordSnapshot(source: string, raw: string, docs: unknown[]): Promise<void> {
  const dir = join(process.cwd(), '.astro');
  await mkdir(dir, { recursive: true });
  const ids = (docs as { _id?: unknown; _rev?: unknown }[]).map((d) => ({ _id: d?._id ?? null, _rev: d?._rev ?? null }));
  const record = { source, readAt: new Date().toISOString(), sha256: createHash('sha256').update(raw).digest('hex'), docs: ids };
  await writeFile(join(dir, 'insights-snapshot.json'), `${JSON.stringify(record, null, 1)}\n`);
}

async function fetchPosts(): Promise<unknown[]> {
  const fixture = process.env.INSIGHTS_FIXTURE;
  if (fixture) {
    const raw = await readFile(fixture, 'utf8');
    const result = JSON.parse(raw).result;
    await recordSnapshot(`fixture:${fixture}`, raw, result);
    return result;
  }
  const url = `https://${SANITY.projectId}.api.sanity.io/${SANITY.apiVersion}/data/query/${SANITY.dataset}`
    + `?perspective=published&query=${encodeURIComponent(QUERY)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sanity respondió ${res.status}: ${await res.text()}`);
  const raw = await res.text();
  const json = JSON.parse(raw);
  if (!Array.isArray(json?.result)) throw new Error('Sanity devolvió una respuesta sin `result`');
  await recordSnapshot(url, raw, json.result);
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
      // Un documento con datos de otro tipo se excluye con su motivo; sólo el transporte o la respuesta abortan.
      for (const doc of docs as { _id?: unknown; slug?: unknown }[]) {
        const id = typeof doc?._id === 'string' ? doc._id : null;
        try {
          if (!id) throw new Error('sin _id');
          store.set({ id, data: await parseData({ id, data: doc as Record<string, unknown> }) });
        } catch (e) {
          const why = String((e as Error).message).replace(/\s+/g, ' ').slice(0, 300);
          console.warn(`[insights] excluido: ${id ?? '?'} (${typeof doc?.slug === 'string' ? doc.slug : 'sin slug'}) — datos inválidos: ${why}`);
        }
      }
    },
  },
  schema: rawPost,
});

export const collections = { insights };
