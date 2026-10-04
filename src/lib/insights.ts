import { getCollection } from 'astro:content';
import { toHTML, escapeHTML } from '@portabletext/to-html';
import type { ArticleRef, Locale } from '../i18n/routes';
import { CATEGORY_IDS, type CategoryId } from '../content/categories';

const LOCALES: Locale[] = ['es', 'en'];
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SUPPORTED_STYLES = new Set(['normal', 'h2', 'blockquote']);
const CATEGORY_FROM_EN: Record<string, CategoryId> = {
  thesis: 'tesis', agents: 'agentes', 'operational ai': 'ia-operativa',
  'business context': 'contexto', transformation: 'transformacion',
};

export interface Heading { id: string; text: string }
export interface ArticleLocale { title: string; excerpt: string; html: string; headings: Heading[]; minutes: number }
export interface Article {
  key: string;            // _id de Sanity
  ref: ArticleRef;
  date: string;           // YYYY-MM-DD
  category: CategoryId | null;
  es: ArticleLocale;
  en: ArticleLocale;
}

type Block = { _type?: string; style?: string; listItem?: string; children?: { _type?: string; text?: string }[] };

const blockText = (b: Block) => (b.children ?? []).map((c) => c.text ?? '').join('');
const isRenderable = (b: Block) => b._type === 'block' && (b.listItem || SUPPORTED_STYLES.has(b.style ?? 'normal'));
const hasText = (body: Block[] | null | undefined) =>
  !!body?.some((b) => isRenderable(b) && blockText(b).trim().length > 0);

export function isCalendarDate(d: string | null | undefined): d is string {
  if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const t = new Date(`${d}T00:00:00Z`);
  return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === d;
}

function slugify(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'seccion';
}

/** Portable Text → HTML con ids en los H2 (para el índice). Lo no admitido se ignora con aviso. */
function renderBody(body: Block[], warn: (m: string) => void): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const used = new Map<string, number>();
  let leadDone = false;
  const kept = body.filter((b) => {
    if (isRenderable(b)) return true;
    warn(`bloque no admitido ignorado (${b._type}${b.style ? `/${b.style}` : ''})`);
    return false;
  });
  const html = toHTML(kept as never, {
    components: {
      block: {
        h2: ({ children, value }) => {
          const text = blockText(value as Block);
          const base = slugify(text);
          const n = (used.get(base) ?? 0) + 1;
          used.set(base, n);
          const id = n === 1 ? base : `${base}-${n}`;
          headings.push({ id, text });
          return `<h2 id="${id}" tabindex="-1">${children}</h2>`;
        },
        blockquote: ({ children }) => `<blockquote><p>${children}</p></blockquote>`,
        // El primer bloque normal es el lead (spec 002 §3.4), aunque el cuerpo empiece con un H2 o una cita.
        normal: ({ children }) => {
          const cls = leadDone ? '' : ' class="lead"';
          leadDone = true;
          return `<p${cls}>${children}</p>`;
        },
      },
      marks: {
        link: ({ children, value }) => {
          const href = String(value?.href ?? '');
          const external = /^https?:/.test(href);
          return `<a href="${escapeHTML(href)}"${external ? ' rel="noopener"' : ''}>${children}</a>`;
        },
      },
    },
    onMissingComponent: (message) => warn(message),
  });
  return { html, headings };
}

const words = (body: Block[]) => body.filter(isRenderable).map(blockText).join(' ').split(/\s+/).filter(Boolean).length;

let cache: Promise<Article[]> | null = null;

/**
 * Artículos publicados en la web nueva (spec 002 §3.4). Los posts que no cumplen las reglas se excluyen
 * con un aviso `[insights] excluido: …` y no hacen fallar el build. Orden: fecha descendente.
 */
export function getArticles(): Promise<Article[]> {
  cache ??= load();
  return cache;
}

async function load(): Promise<Article[]> {
  const entries = await getCollection('insights');
  const warn = (id: string) => (m: string) => console.warn(`[insights] ${id}: ${m}`);

  type Candidate = Omit<Article, 'es' | 'en'> & { raw: (typeof entries)[number]['data'] };
  const candidates: Candidate[] = [];
  for (const { data: d } of entries) {
    const why: string[] = [];
    const visible = d.showOnInsights === true || (d.showOnInsights == null && d.listed === true);
    if (!visible) continue; // no marcado para Insights: fuera sin aviso
    for (const l of LOCALES) {
      if (!d.title?.[l]?.trim()) why.push(`falta el título en ${l}`);
      if (!d.excerpt?.[l]?.trim()) why.push(`falta el resumen en ${l}`);
      if (!hasText(d.body?.[l] as Block[] | null)) why.push(`el cuerpo en ${l} está vacío`);
    }
    if (!isCalendarDate(d.publishedAt)) why.push(`fecha inválida (${d.publishedAt ?? 'sin fecha'})`);
    const en = d.slug ?? '';
    const es = d.slugEs ?? en;
    if (!SLUG.test(en)) why.push(`slug inglés inválido (${en || 'vacío'})`);
    if (!SLUG.test(es)) why.push(`slug español inválido (${es || 'vacío'})`);
    if (why.length) {
      console.warn(`[insights] excluido: ${d._id} (${d.slug ?? 'sin slug'}) — ${why.join('; ')}`);
      continue;
    }
    const topic = CATEGORY_IDS.find((c) => c === d.topic) ?? CATEGORY_FROM_EN[d.category?.en?.trim().toLowerCase() ?? ''] ?? null;
    candidates.push({ key: d._id, ref: { id: 'articulo', slug: { es, en } }, date: d.publishedAt!, category: topic, raw: d });
  }

  // Colisiones de slug por idioma, entre todos los candidatos y antes de elegir: se excluyen todos los del choque.
  const clash = new Set<string>();
  for (const l of LOCALES) {
    const bySlug = new Map<string, Candidate[]>();
    for (const c of candidates) bySlug.set(c.ref.slug[l], [...(bySlug.get(c.ref.slug[l]) ?? []), c]);
    for (const [slug, list] of bySlug) {
      if (list.length > 1) {
        for (const c of list) clash.add(c.key);
        console.warn(`[insights] excluido: slug ${l} «${slug}» repetido en ${list.map((c) => c.key).join(', ')}`);
      }
    }
  }

  const articles: Article[] = candidates.filter((c) => !clash.has(c.key)).map(({ raw, ...c }) => {
    const editorial = Number.isInteger(raw.readingTime) && (raw.readingTime as number) >= 1 ? (raw.readingTime as number) : null;
    const loc = (l: Locale): ArticleLocale => {
      const body = raw.body![l] as Block[];
      const { html, headings } = renderBody(body, warn(c.key));
      return {
        title: raw.title![l]!.trim(),
        excerpt: raw.excerpt![l]!.trim(),
        html,
        headings,
        minutes: editorial ?? Math.max(1, Math.ceil(words(body) / 220)),
      };
    };
    return { ...c, es: loc('es'), en: loc('en') };
  });
  return articles.sort((a, b) => b.date.localeCompare(a.date));
}

/** Fecha editorial YYYY-MM-DD formateada sin depender de la zona horaria de la máquina. */
export function formatDate(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-UY' : 'en-US', { dateStyle: 'medium', timeZone: 'UTC' })
    .format(new Date(`${date}T00:00:00Z`));
}
