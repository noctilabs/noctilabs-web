import { describe, expect, test } from 'vitest';
import { alternates, href, pageFromPath, PAGES, type Locale, type PageRef } from '../src/i18n/routes';

// Los valores esperados son literales copiados del contrato de URLs del spec 001 (§3.2), con el origen `www` y las
// rutas de privacidad del spec 004 (§2.1 y §2.4) y el blog del spec 006 (§3.2: Insights pasa a /blog/ y /en/blog/).

describe('href', () => {
  test('home en español e inglés', () => {
    expect(href({ id: 'home' }, 'es')).toBe('/');
    expect(href({ id: 'home' }, 'en')).toBe('/en/');
  });

  test('producto traduce el slug en inglés', () => {
    expect(href({ id: 'producto' }, 'es')).toBe('/producto/');
    expect(href({ id: 'producto' }, 'en')).toBe('/en/product/');
  });

  test.each([
    ['nosotros', '/nosotros/', '/en/about/'],
    ['insights', '/blog/', '/en/blog/'],
    ['hablemos', '/hablemos/', '/en/contact/'],
    ['privacidad', '/privacidad/', '/en/privacy/'],
  ] as const)('%s en los dos idiomas', (id, es, en) => {
    expect(href({ id }, 'es')).toBe(es);
    expect(href({ id }, 'en')).toBe(en);
  });

  test.each([
    ['retail', '/industrias/retail-distribucion/', '/en/industries/retail-distribution/'],
    ['manufactura', '/industrias/manufactura/', '/en/industries/manufacturing/'],
    ['consumo', '/industrias/alimentos-consumo/', '/en/industries/food-consumer-goods/'],
    ['salud', '/industrias/salud-fitness/', '/en/industries/health-fitness/'],
  ] as const)('industria %s con slug traducido', (industry, es, en) => {
    expect(href({ id: 'industria', industry }, 'es')).toBe(es);
    expect(href({ id: 'industria', industry }, 'en')).toBe(en);
  });

  test('normaliza el fragmento con o sin #', () => {
    expect(href({ id: 'producto' }, 'es', 'overview')).toBe('/producto/#overview');
    expect(href({ id: 'producto' }, 'es', '#overview')).toBe('/producto/#overview');
    expect(href({ id: 'producto' }, 'en', 'overview')).toBe('/en/product/#overview');
    expect(href({ id: 'producto' }, 'en', '#overview')).toBe('/en/product/#overview');
    expect(href({ id: 'producto' }, 'en', '#bi')).toBe('/en/product/#bi');
    expect(href({ id: 'nosotros' }, 'es', 'equipo')).toBe('/nosotros/#equipo');
  });

  test('un fragmento vacío no agrega #', () => {
    expect(href({ id: 'producto' }, 'es', '')).toBe('/producto/');
    expect(href({ id: 'producto' }, 'en', '')).toBe('/en/product/');
  });
});

describe('alternates', () => {
  const O = 'https://www.noctilabs.io';
  test.each<[string, PageRef, string, string]>([
    ['home', { id: 'home' }, `${O}/`, `${O}/en/`],
    ['producto', { id: 'producto' }, `${O}/producto/`, `${O}/en/product/`],
    ['retail', { id: 'industria', industry: 'retail' }, `${O}/industrias/retail-distribucion/`, `${O}/en/industries/retail-distribution/`],
    ['manufactura', { id: 'industria', industry: 'manufactura' }, `${O}/industrias/manufactura/`, `${O}/en/industries/manufacturing/`],
    ['consumo', { id: 'industria', industry: 'consumo' }, `${O}/industrias/alimentos-consumo/`, `${O}/en/industries/food-consumer-goods/`],
    ['salud', { id: 'industria', industry: 'salud' }, `${O}/industrias/salud-fitness/`, `${O}/en/industries/health-fitness/`],
    ['nosotros', { id: 'nosotros' }, `${O}/nosotros/`, `${O}/en/about/`],
    ['insights', { id: 'insights' }, `${O}/blog/`, `${O}/en/blog/`],
    ['hablemos', { id: 'hablemos' }, `${O}/hablemos/`, `${O}/en/contact/`],
    ['privacidad', { id: 'privacidad' }, `${O}/privacidad/`, `${O}/en/privacy/`],
  ])('%s: es, en y x-default = es, absolutas', (_, page, es, en) => {
    expect(alternates(page)).toEqual({ es, en, 'x-default': es });
  });
});

describe('pageFromPath', () => {
  const CONTRATO: [string, PageRef, Locale][] = [
    ['/', { id: 'home' }, 'es'],
    ['/producto/', { id: 'producto' }, 'es'],
    ['/industrias/retail-distribucion/', { id: 'industria', industry: 'retail' }, 'es'],
    ['/industrias/manufactura/', { id: 'industria', industry: 'manufactura' }, 'es'],
    ['/industrias/alimentos-consumo/', { id: 'industria', industry: 'consumo' }, 'es'],
    ['/industrias/salud-fitness/', { id: 'industria', industry: 'salud' }, 'es'],
    ['/nosotros/', { id: 'nosotros' }, 'es'],
    ['/blog/', { id: 'insights' }, 'es'],
    ['/hablemos/', { id: 'hablemos' }, 'es'],
    ['/privacidad/', { id: 'privacidad' }, 'es'],
    ['/en/', { id: 'home' }, 'en'],
    ['/en/product/', { id: 'producto' }, 'en'],
    ['/en/industries/retail-distribution/', { id: 'industria', industry: 'retail' }, 'en'],
    ['/en/industries/manufacturing/', { id: 'industria', industry: 'manufactura' }, 'en'],
    ['/en/industries/food-consumer-goods/', { id: 'industria', industry: 'consumo' }, 'en'],
    ['/en/industries/health-fitness/', { id: 'industria', industry: 'salud' }, 'en'],
    ['/en/about/', { id: 'nosotros' }, 'en'],
    ['/en/blog/', { id: 'insights' }, 'en'],
    ['/en/contact/', { id: 'hablemos' }, 'en'],
    ['/en/privacy/', { id: 'privacidad' }, 'en'],
  ];

  test.each(CONTRATO)('%s', (path, page, locale) => {
    expect(pageFromPath(path)).toEqual({ page, locale });
  });

  test.each(CONTRATO.filter(([path]) => path !== '/'))('%s sin barra final', (path, page, locale) => {
    expect(pageFromPath(path.slice(0, -1))).toEqual({ page, locale });
  });

  test.each([
    '/nada/', '/en/nada/', '/en/producto/', '/industrias/inexistente/', '/404.html',
    '/es/', '/es/producto/', '/producto/extra/', '/en/industries/manufactura/',
    '/producto//', '/en/product//', '/en/privacidad/', '/privacy/',
    '/insights/', '/en/insights/', '/insights', '/en/insights', '/en/blog//', '/es/blog/',
    // Spec 009 §3.A: Servicios dejó de existir (redirige a la Home por vercel.json).
    '/industrias/servicios/', '/en/industries/professional-services/',
  ])('%s → null', (path) => {
    expect(pageFromPath(path)).toBeNull();
  });
});

describe('PAGES (spec 004 §2.4)', () => {
  test('10 referencias fijas, 20 URLs distintas (spec 009: sin Servicios)', () => {
    expect(PAGES).toHaveLength(10);
    const urls = PAGES.flatMap((p) => [href(p, 'es'), href(p, 'en')]);
    expect(new Set(urls).size).toBe(20);
    expect(urls).toContain('/privacidad/');
    expect(urls).toContain('/en/privacy/');
  });
});

describe('artículos (spec 002 §3.2, enmienda Sanity)', () => {
  const page = { id: 'articulo', slug: { es: 'sin-contexto-no-hay-inteligencia', en: 'no-context-no-intelligence' } } as const;

  test('href del artículo con los slugs que trae el ref, con y sin fragmento', () => {
    expect(href(page, 'es')).toBe('/blog/sin-contexto-no-hay-inteligencia/');
    expect(href(page, 'en')).toBe('/en/blog/no-context-no-intelligence/');
    expect(href(page, 'es', '#sin-contexto')).toBe('/blog/sin-contexto-no-hay-inteligencia/#sin-contexto');
  });

  test('alternates del artículo: absolutas y x-default = es', () => {
    expect(alternates(page)).toEqual({
      es: 'https://www.noctilabs.io/blog/sin-contexto-no-hay-inteligencia/',
      en: 'https://www.noctilabs.io/en/blog/no-context-no-intelligence/',
      'x-default': 'https://www.noctilabs.io/blog/sin-contexto-no-hay-inteligencia/',
    });
  });

  test.each([
    '/blog/sin-contexto-no-hay-inteligencia/',
    '/blog/sin-contexto-no-hay-inteligencia',
    '/en/blog/no-context-no-intelligence/',
    '/en/blog/no-context-no-intelligence',
    '/blog/inexistente/',
    '/blog/no-context-no-intelligence//',
    '/insights/sin-contexto-no-hay-inteligencia/',
    '/en/insights/no-context-no-intelligence/',
  ])('pageFromPath no resuelve artículos: %s → null', (path) => {
    expect(pageFromPath(path)).toBeNull();
  });
});
