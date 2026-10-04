import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://noctilabs.io',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
