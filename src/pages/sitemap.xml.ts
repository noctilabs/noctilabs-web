// Sitemap propio (spec 004 §2.6): un <url> por URL indexable, con xhtml:link recíprocos que salen de alternates().
// No usa @astrojs/sitemap, que empareja por path y fallaría con /nosotros/ ↔ /en/about/.
import type { APIRoute } from 'astro';
import { alternates, PAGES, type PageRef } from '../i18n/routes';
import { getArticles } from '../lib/insights';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async () => {
  const refs: PageRef[] = [...PAGES, ...(await getArticles()).map((a) => a.ref)];
  const urls = refs.flatMap((page) => {
    const alt = alternates(page);
    const links = (['es', 'en', 'x-default'] as const)
      .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${esc(alt[l])}"/>`).join('\n');
    return [alt.es, alt.en].map((loc) => `  <url>\n    <loc>${esc(loc)}</loc>\n${links}\n  </url>`);
  });
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
    + `${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
