import { defineConfig } from 'astro/config';
import { ORIGIN } from './src/site.mjs';

export default defineConfig({
  site: ORIGIN,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
