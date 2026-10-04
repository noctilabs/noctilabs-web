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
  // Spec 004 §2.8: CSP de carga en el <meta>, con los hashes que Astro genera por página.
  security: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "media-src 'self'",
        "font-src 'self'",
        "connect-src 'self' https://api.web3forms.com https://*.vercel-insights.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      scriptDirective: { resources: ["'self'"] },
      // Atributos `style` con valores calculados (nodos, Container, Kicker, islas): solo style-src-attr.
      styleDirective: { resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' }] },
    },
  },
});
