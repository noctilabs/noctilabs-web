// Chequeo de tipos de S1. Lo verifica `astro check`; Vitest no lo descubre y nunca se ejecuta.
import { href } from '../src/i18n/routes';

export function industriaInexistenteNoCompila() {
  // @ts-expect-error: 'mineria' no es un IndustryId
  href({ id: 'industria', industry: 'mineria' }, 'es');
}

export function articuloSinSlugInglesNoCompila() {
  // @ts-expect-error: el ArticleRef exige slug.es y slug.en
  href({ id: 'articulo', slug: { es: 'solo-espanol' } }, 'es');
}
