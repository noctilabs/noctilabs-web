import type { ArticleRef, Locale, PageRef } from '../i18n/routes';
import { ui } from '../i18n/ui';
import { industry } from '../content/industries';

export interface PageMeta { title: string; description: string }

/** Datos editoriales de un artículo en un idioma, tal como los entrega getArticles() (spec 002 §3.4). */
export interface ArticleMetaSource { title: string; excerpt: string }

/** Title y descripción de cualquier página (spec 002 §3.1). Para un artículo, el post es obligatorio. */
export function pageMeta(page: ArticleRef, locale: Locale, article: ArticleMetaSource): PageMeta;
export function pageMeta(page: Exclude<PageRef, ArticleRef>, locale: Locale): PageMeta;
export function pageMeta(page: PageRef, locale: Locale, article?: ArticleMetaSource): PageMeta {
  if (page.id === 'industria') {
    const ind = industry(page.industry, locale);
    return { title: `${ind.label} — NoctiLabs`, description: ind.blurb };
  }
  if (page.id === 'articulo') {
    return { title: `${article!.title} — NoctiLabs`, description: article!.excerpt };
  }
  const p = ui[locale].pages[page.id];
  return { title: page.id === 'home' ? p.title : `${p.title} — NoctiLabs`, description: p.description };
}
