// Metadatos sociales y datos estructurados (spec 004 §2.5).
import { ORIGIN } from '../site.mjs';
import { alternates, type Locale, type PageRef } from '../i18n/routes';
import { CONTACT_EMAIL } from '../content/pages/hablemos';

export const OG_LOCALE: Record<Locale, string> = { es: 'es_UY', en: 'en_US' };
export const ogImage = (locale: Locale) => `${ORIGIN}/og/og-${locale}.png`;

/** Datos del artículo renderizado que viajan al JSON-LD: el H1 y la fecha del post. */
export interface ArticleLd { headline: string; datePublished: string }

const organization = () => ({
  '@type': 'Organization',
  name: 'NoctiLabs',
  url: `${ORIGIN}/`,
  logo: `${ORIGIN}/og/logo.png`,
  email: CONTACT_EMAIL,
});

/** Bloques JSON-LD de una página: Organization + WebSite en el home, Article en los artículos. */
export function structuredData(page: PageRef, locale: Locale, article?: ArticleLd): Record<string, unknown>[] {
  const url = alternates(page)[locale];
  if (page.id === 'home') {
    return [
      { '@context': 'https://schema.org', ...organization() },
      { '@context': 'https://schema.org', '@type': 'WebSite', name: 'NoctiLabs', url, inLanguage: locale },
    ];
  }
  if (page.id === 'articulo' && article) {
    return [{
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.headline,
      datePublished: article.datePublished,
      inLanguage: locale,
      author: organization(),
      publisher: organization(),
      mainEntityOfPage: url,
      url,
      image: ogImage(locale),
    }];
  }
  return [];
}

/** JSON para un <script type="application/ld+json">: cada `<` va como <, así un `</script>` no cierra el elemento. */
export const jsonLdText = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
