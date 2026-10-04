import { describe, expect, test } from 'vitest';
import { alternates, href, pageFromPath, type Locale, type PageRef } from '../src/i18n/routes';

// Los valores esperados son literales copiados del contrato de URLs del spec 001 (§3.2).

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
    ['insights', '/insights/', '/en/insights/'],
    ['hablemos', '/hablemos/', '/en/contact/'],
  ] as const)('%s en los dos idiomas', (id, es, en) => {
    expect(href({ id }, 'es')).toBe(es);
    expect(href({ id }, 'en')).toBe(en);
  });

  test.each([
    ['retail', '/industrias/retail-distribucion/', '/en/industries/retail-distribution/'],
    ['manufactura', '/industrias/manufactura/', '/en/industries/manufacturing/'],
    ['consumo', '/industrias/alimentos-consumo/', '/en/industries/food-consumer-goods/'],
    ['salud', '/industrias/salud-fitness/', '/en/industries/health-fitness/'],
    ['servicios', '/industrias/servicios/', '/en/industries/professional-services/'],
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
  const O = 'https://noctilabs.io';
  test.each<[string, PageRef, string, string]>([
    ['home', { id: 'home' }, `${O}/`, `${O}/en/`],
    ['producto', { id: 'producto' }, `${O}/producto/`, `${O}/en/product/`],
    ['retail', { id: 'industria', industry: 'retail' }, `${O}/industrias/retail-distribucion/`, `${O}/en/industries/retail-distribution/`],
    ['manufactura', { id: 'industria', industry: 'manufactura' }, `${O}/industrias/manufactura/`, `${O}/en/industries/manufacturing/`],
    ['consumo', { id: 'industria', industry: 'consumo' }, `${O}/industrias/alimentos-consumo/`, `${O}/en/industries/food-consumer-goods/`],
    ['salud', { id: 'industria', industry: 'salud' }, `${O}/industrias/salud-fitness/`, `${O}/en/industries/health-fitness/`],
    ['servicios', { id: 'industria', industry: 'servicios' }, `${O}/industrias/servicios/`, `${O}/en/industries/professional-services/`],
    ['nosotros', { id: 'nosotros' }, `${O}/nosotros/`, `${O}/en/about/`],
    ['insights', { id: 'insights' }, `${O}/insights/`, `${O}/en/insights/`],
    ['hablemos', { id: 'hablemos' }, `${O}/hablemos/`, `${O}/en/contact/`],
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
    ['/industrias/servicios/', { id: 'industria', industry: 'servicios' }, 'es'],
    ['/nosotros/', { id: 'nosotros' }, 'es'],
    ['/insights/', { id: 'insights' }, 'es'],
    ['/hablemos/', { id: 'hablemos' }, 'es'],
    ['/en/', { id: 'home' }, 'en'],
    ['/en/product/', { id: 'producto' }, 'en'],
    ['/en/industries/retail-distribution/', { id: 'industria', industry: 'retail' }, 'en'],
    ['/en/industries/manufacturing/', { id: 'industria', industry: 'manufactura' }, 'en'],
    ['/en/industries/food-consumer-goods/', { id: 'industria', industry: 'consumo' }, 'en'],
    ['/en/industries/health-fitness/', { id: 'industria', industry: 'salud' }, 'en'],
    ['/en/industries/professional-services/', { id: 'industria', industry: 'servicios' }, 'en'],
    ['/en/about/', { id: 'nosotros' }, 'en'],
    ['/en/insights/', { id: 'insights' }, 'en'],
    ['/en/contact/', { id: 'hablemos' }, 'en'],
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
    '/producto//', '/en/product//',
  ])('%s → null', (path) => {
    expect(pageFromPath(path)).toBeNull();
  });
});
