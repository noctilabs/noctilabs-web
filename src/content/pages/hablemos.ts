import type { Localized } from '../types';

export const CONTACT_EMAIL = 'hola@noctilabs.io';

interface Field { label: string; placeholder: string; required?: string }

export interface HablemosCopy {
  lead: string;
  steps: [string, string, string];
  /** «O escribinos a {mail}». */
  mailPrefix: string;
  formLabel: string;
  fields: {
    name: Field;
    email: Field & { invalid: string };
    organization: Field;
    role: Field;
    message: Field;
  };
  /** Las opciones son los labels de las 5 industrias (industries.ts) más «Otra». */
  industry: { label: string; empty: string; other: string };
  submit: string;
  sending: string;
  /** Segundo envío antes del intervalo mínimo (spec 004 §2.3). */
  wait: string;
  /** «No pudimos enviar el mensaje. Escribinos a {mail}.» */
  error: [string, string];
  sent: string;
  again: string;
  /** Sin JS: «Escribinos a {mail}». */
  noscript: string;
  /** Sin la clave de Web3Forms (ALLOW_PENDING_LAUNCH): contacto por mail en lugar del formulario. */
  fallback: { title: string; text: string; cta: string };
}

// El H1, el title y la descripción salen de ui.pages.hablemos (spec 002 §3.1).
export const hablemos: Localized<HablemosCopy> = {
  es: {
    lead: 'Contanos cómo opera tu empresa y qué te gustaría resolver. Te respondemos para coordinar una conversación.',
    steps: [
      'Leemos tu mensaje y te escribimos.',
      'Conversamos sobre cómo opera tu empresa.',
      'Te mostramos Nocti sobre un caso de tu industria.',
    ],
    mailPrefix: 'O escribinos a ',
    formLabel: 'Formulario de contacto',
    fields: {
      name: { label: 'Nombre', placeholder: 'Ana Pérez…', required: 'Escribí tu nombre.' },
      email: {
        label: 'Email laboral',
        placeholder: 'ana@empresa.com…',
        required: 'Escribí tu email laboral, por ejemplo nombre@empresa.com.',
        invalid: 'Revisá el email: tiene que tener la forma nombre@empresa.com.',
      },
      organization: { label: 'Empresa', placeholder: 'Distribuidora del Sur…', required: 'Escribí el nombre de tu empresa.' },
      role: { label: 'Rol', placeholder: 'Gerente de operaciones…' },
      message: {
        label: '¿Qué te gustaría resolver?',
        placeholder: 'Por ejemplo: queremos ver stock, pedidos y cobranzas en un solo lugar…',
        required: 'Contanos qué te gustaría resolver.',
      },
    },
    industry: { label: 'Industria', empty: 'Elegí una…', other: 'Otra' },
    submit: 'Enviar →',
    sending: 'Enviando…',
    wait: 'Esperá unos segundos antes de enviar otro mensaje.',
    error: ['No pudimos enviar el mensaje. Escribinos a ', '.'],
    sent: 'Gracias. Te vamos a escribir pronto.',
    again: 'Enviar otro mensaje',
    noscript: 'Escribinos a ',
    fallback: { title: 'Escribinos', text: 'Mandanos un mail y te respondemos para coordinar una conversación.', cta: 'Escribinos por mail' },
  },
  // D4: traducción provisoria, pendiente de revisión del dueño.
  en: {
    lead: 'Tell us how your company operates and what you’d like to solve. We’ll get back to you to set up a conversation.',
    steps: [
      'We read your message and get back to you.',
      'We talk about how your company operates.',
      'We show you Nocti on a case from your industry.',
    ],
    mailPrefix: 'Or email us at ',
    formLabel: 'Contact form',
    fields: {
      name: { label: 'Name', placeholder: 'Jane Smith…', required: 'Enter your name.' },
      email: {
        label: 'Work email',
        placeholder: 'jane@company.com…',
        required: 'Enter your work email, for example name@company.com.',
        invalid: 'Check the email: it should look like name@company.com.',
      },
      organization: { label: 'Company', placeholder: 'Southern Distribution…', required: 'Enter your company’s name.' },
      role: { label: 'Role', placeholder: 'Operations manager…' },
      message: {
        label: 'What would you like to solve?',
        placeholder: 'For example: we want to see stock, orders and collections in one place…',
        required: 'Tell us what you’d like to solve.',
      },
    },
    industry: { label: 'Industry', empty: 'Choose one…', other: 'Other' },
    submit: 'Send →',
    sending: 'Sending…',
    wait: 'Please wait a few seconds before sending another message.',
    error: ['We couldn’t send your message. Email us at ', '.'],
    sent: 'Thank you. We’ll be in touch soon.',
    again: 'Send another message',
    noscript: 'Email us at ',
    fallback: { title: 'Write to us', text: 'Send us an email and we will get back to you to set up a conversation.', cta: 'Email us' },
  },
};
