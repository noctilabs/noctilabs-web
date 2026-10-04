export type Locale = 'es' | 'en';

type SimpleId = 'home' | 'producto' | 'nosotros' | 'insights' | 'hablemos';

export const INDUSTRY_SLUGS = {
  retail: { es: 'retail-distribucion', en: 'retail-distribution' },
  manufactura: { es: 'manufactura', en: 'manufacturing' },
  consumo: { es: 'alimentos-consumo', en: 'food-consumer-goods' },
  salud: { es: 'salud-fitness', en: 'health-fitness' },
  servicios: { es: 'servicios', en: 'professional-services' },
} as const satisfies Record<string, Record<Locale, string>>;

export type IndustryId = keyof typeof INDUSTRY_SLUGS;

export type PageRef = { id: SimpleId } | { id: 'industria'; industry: IndustryId };

const PATHS: Record<SimpleId, Record<Locale, string>> = {
  home: { es: '/', en: '/en/' },
  producto: { es: '/producto/', en: '/en/product/' },
  nosotros: { es: '/nosotros/', en: '/en/about/' },
  insights: { es: '/insights/', en: '/en/insights/' },
  hablemos: { es: '/hablemos/', en: '/en/contact/' },
};

const INDUSTRY_BASE: Record<Locale, string> = { es: '/industrias/', en: '/en/industries/' };

function pathOf(page: PageRef, locale: Locale): string {
  if (page.id === 'industria') {
    return `${INDUSTRY_BASE[locale]}${INDUSTRY_SLUGS[page.industry][locale]}/`;
  }
  return PATHS[page.id][locale];
}

export function href(page: PageRef, locale: Locale, hash = ''): string {
  const fragment = hash.replace(/^#/, '');
  return fragment ? `${pathOf(page, locale)}#${fragment}` : pathOf(page, locale);
}

export const PAGES: PageRef[] = [
  ...(Object.keys(PATHS) as SimpleId[]).map((id) => ({ id })),
  ...(Object.keys(INDUSTRY_SLUGS) as IndustryId[]).map((industry) => ({ id: 'industria' as const, industry })),
];

const BY_PATH = new Map<string, { page: PageRef; locale: Locale }>(
  PAGES.flatMap((page) => (['es', 'en'] as const).map((locale) => [pathOf(page, locale), { page, locale }] as const)),
);

/** Recibe solo un pathname; acepta una única barra final o ninguna. */
export function pageFromPath(pathname: string): { page: PageRef; locale: Locale } | null {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return BY_PATH.get(path) ?? null;
}

const ORIGIN = 'https://noctilabs.io';

export function alternates(page: PageRef): { es: string; en: string; 'x-default': string } {
  const es = ORIGIN + pathOf(page, 'es');
  return { es, en: ORIGIN + pathOf(page, 'en'), 'x-default': es };
}
