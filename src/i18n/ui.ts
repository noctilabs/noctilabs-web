import type { Locale } from './routes';

const es = {
  tagline: 'El cerebro operativo de tu empresa.',
  placeholder: 'Contenido en construcción.',
  pages: {
    home: {
      title: 'NoctiLabs — El cerebro operativo de tu empresa.',
      h1: 'El cerebro operativo de tu empresa.',
      lead: 'Un contexto compartido para que personas e IA entiendan tu negocio, decidan mejor y actúen.',
      description: 'Un contexto compartido para que personas e IA entiendan tu negocio, decidan mejor y actúen.',
    },
    producto: {
      title: 'Producto',
      h1: 'El cerebro organizacional de tu empresa.',
      description: 'Cerebro, Inteligencia y Agentes sobre una misma capa de contexto, conectada con los sistemas que tu empresa ya usa.',
    },
    nosotros: {
      title: 'Nosotros',
      h1: 'Construimos el cerebro operativo de las empresas.',
      description: 'Quiénes somos y por qué construimos Nocti: contexto, IA operativa y agentes sobre la operación real.',
    },
    insights: {
      title: 'Insights',
      h1: 'Contexto, IA operativa y agentes.',
      description: 'Ideas sobre contexto, IA operativa y agentes en la empresa.',
    },
    hablemos: {
      title: 'Hablemos',
      h1: 'Hablemos.',
      description: 'Contanos cómo opera tu empresa y te mostramos cómo Nocti se conecta con lo que ya tenés.',
    },
    privacidad: {
      title: 'Privacidad',
      h1: 'Política de privacidad',
      description: 'Cómo trata NoctiLabs los datos que nos enviás por el formulario de contacto y qué derechos tenés sobre ellos.',
    },
  },
  hero: { primary: 'Hablemos', secondary: 'Ver el producto', pause: 'Pausar video', play: 'Reproducir video' },
  productSections: {
    overview: { label: 'Overview', desc: 'Sistemas, conocimiento y operaciones conectados en una sola capa de contexto.' },
    cerebro: { label: 'Cerebro', desc: 'Preguntá a tu empresa y recibí respuestas con fuentes, según los permisos de tu rol.' },
    bi: { label: 'Inteligencia / BI', desc: 'De la pregunta al dato y del dato a la acción, sobre datos vivos y trazables.' },
    agentes: { label: 'Agentes', desc: 'Creá, integrá y supervisá agentes que trabajan sobre el contexto real.' },
    control: { label: 'Control', desc: 'Permisos, aprobaciones y trazabilidad sobre cada persona y cada agente.' },
  },
  nav: {
    label: 'Principal',
    producto: 'Producto',
    industrias: 'Industrias',
    nosotros: 'Nosotros',
    insights: 'Insights',
    cta: 'Hablemos →',
    openPanel: { producto: 'Abrir menú de Producto', industrias: 'Abrir menú de Industrias' },
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    skip: 'Saltar al contenido',
    company: 'Compañía',
    hablemos: 'Hablemos',
    privacy: 'Privacidad',
    langName: { es: 'Español', en: 'English' },
  },
  band: { title: 'Hablemos.', cta: 'Agendar una conversación →' },
  notFound: { title: 'Página no encontrada', body: 'La página que buscás no existe o cambió de dirección.', home: 'Ir al inicio' },
};

type Dict = typeof es;

// D4: traducción provisoria, pendiente de revisión del dueño.
const en: Dict = {
  tagline: "Your company’s operational brain.",
  placeholder: 'Content in progress.',
  pages: {
    home: {
      title: "NoctiLabs — Your company’s operational brain.",
      h1: "Your company’s operational brain.",
      lead: 'A shared context so people and AI understand your business, decide better and act.',
      description: 'A shared context so people and AI understand your business, decide better and act.',
    },
    producto: {
      title: 'Product',
      h1: "Your company’s organizational brain.",
      description: 'Brain, Intelligence and Agents on a single context layer, connected to the systems your company already uses.',
    },
    nosotros: {
      title: 'About',
      h1: 'We build the operational brain of companies.',
      description: 'Who we are and why we build Nocti: context, operational AI and agents on top of real operations.',
    },
    insights: {
      title: 'Insights',
      h1: 'Context, operational AI and agents.',
      description: 'Ideas on context, operational AI and agents in the enterprise.',
    },
    hablemos: {
      title: 'Contact',
      h1: "Let’s talk.",
      description: 'Tell us how your company operates and we will show you how Nocti connects with what you already have.',
    },
    privacidad: {
      title: 'Privacy',
      h1: 'Privacy policy',
      description: 'How NoctiLabs handles the data you send us through the contact form and the rights you have over it.',
    },
  },
  hero: { primary: 'Let’s talk', secondary: 'See the product', pause: 'Pause video', play: 'Play video' },
  productSections: {
    overview: { label: 'Overview', desc: 'Systems, knowledge and operations connected in a single context layer.' },
    cerebro: { label: 'Brain', desc: 'Ask your company and get sourced answers, within the permissions of your role.' },
    bi: { label: 'Intelligence / BI', desc: 'From question to data and from data to action, on live, traceable data.' },
    agentes: { label: 'Agents', desc: 'Create, integrate and supervise agents that work on real context.' },
    control: { label: 'Control', desc: 'Permissions, approvals and traceability over every person and every agent.' },
  },
  nav: {
    label: 'Main',
    producto: 'Product',
    industrias: 'Industries',
    nosotros: 'About',
    insights: 'Insights',
    cta: "Let’s talk →",
    openPanel: { producto: 'Open Product menu', industrias: 'Open Industries menu' },
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    skip: 'Skip to content',
    company: 'Company',
    hablemos: "Let’s talk",
    privacy: 'Privacy',
    langName: { es: 'Español', en: 'English' },
  },
  band: { title: 'Let’s talk.', cta: 'Book a conversation →' },
  notFound: { title: 'Page not found', body: 'The page you are looking for does not exist or has moved.', home: 'Go to home' },
};

export const ui: Record<Locale, Dict> = { es, en };

export const PRODUCT_SECTION_IDS = ['overview', 'cerebro', 'bi', 'agentes', 'control'] as const;
