import { defineConfig } from 'astro/config';
import { ORIGIN } from './src/site.mjs';
import { publishGuard } from './scripts/publish-guard.mjs';

export default defineConfig({
  site: ORIGIN,
  output: 'static',
  // Spec 004 §2.2: el fixture legal nunca escribe en dist/.
  outDir: process.env.LEGAL_FIXTURE === '1' ? './dist-fixture' : './dist',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [publishGuard()],
});
