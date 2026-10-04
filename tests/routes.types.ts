// Chequeo de tipos de S1(e). Lo verifica `astro check`; Vitest no lo descubre y nunca se ejecuta.
import { href } from '../src/i18n/routes';

export function industriaInexistenteNoCompila() {
  // @ts-expect-error: 'mineria' no es un IndustryId
  href({ id: 'industria', industry: 'mineria' }, 'es');
}

export function articuloInexistenteNoCompila() {
  // @ts-expect-error: 'otro-articulo' no es un ArticleId
  href({ id: 'articulo', article: 'otro-articulo' }, 'es');
}
