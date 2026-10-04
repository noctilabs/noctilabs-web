import type { ImageMetadata } from 'astro';
import type { Locale } from '../i18n/routes';

/** Una clave que falte en un idioma es error de compilación. */
export type Localized<T> = Record<Locale, T>;

/** Foto de contenido con alt por idioma; null = sin foto (panel de respaldo, spec 002 §3.5). */
export type Photo = { src: ImageMetadata; alt: Localized<string> } | null;
