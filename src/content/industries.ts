import type { IndustryId, Locale } from '../i18n/routes';

/** Copy visible de cada industria (navegación, tabs, páginas). Los metadatos SEO viven aparte, en ui.ts. */
export interface IndustryCopy {
  label: string;
  short: string;
  blurb: string;
}

export const industries: Record<IndustryId, Record<Locale, IndustryCopy>> = {
  retail: {
    es: { label: 'Retail y distribución', short: 'Retail', blurb: 'Pedidos, stock, cobranzas y proveedores sobre un mismo contexto, con prioridades claras cada día.' },
    en: { label: 'Retail and distribution', short: 'Retail', blurb: 'Orders, stock, collections and suppliers on a shared context, with clear priorities every day.' },
  },
  manufactura: {
    es: { label: 'Manufactura', short: 'Manufactura', blurb: 'Producción, compras y calidad conectadas con los sistemas que la planta ya usa.' },
    en: { label: 'Manufacturing', short: 'Manufacturing', blurb: 'Production, purchasing and quality connected to the systems your plant already uses.' },
  },
  consumo: {
    es: { label: 'Alimentos y bienes de consumo', short: 'Consumo masivo', blurb: 'Lotes, vencimientos, canales y márgenes en una sola vista operativa.' },
    en: { label: 'Food and consumer goods', short: 'Consumer goods', blurb: 'Batches, expiry dates, channels and margins in a single operational view.' },
  },
  salud: {
    es: { label: 'Salud y actividad física', short: 'Salud y fitness', blurb: 'Socios, sedes, agenda y cobranzas, con permisos claros por rol.' },
    en: { label: 'Health and fitness', short: 'Health & fitness', blurb: 'Members, locations, schedules and collections, with clear permissions by role.' },
  },
  servicios: {
    es: { label: 'Servicios profesionales y empresariales', short: 'Servicios', blurb: 'Clientes, proyectos, horas y facturación conectados en un mismo contexto.' },
    en: { label: 'Professional and business services', short: 'Services', blurb: 'Clients, projects, hours and billing connected in a single context.' },
  },
};
