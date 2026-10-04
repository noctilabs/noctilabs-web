// Datos del responsable y textos legales del formulario y de la política (spec 004 §2.2 y §2.4).
// BORRADOR pendiente de revisión profesional (docs/pendientes.md). Los marcadores los reemplaza el dueño.
import type { Localized } from './types';
import { CONTACT_EMAIL } from './pages/hablemos';

/** Versión del aviso que acompaña cada envío como `consent_version` (fecha y número). */
export const CONSENT_VERSION = '2026-10-04.1';

/** Marcadores que bloquean la publicación hasta que el dueño cargue los datos reales. */
export const LEGAL_MARKERS = ['[RAZÓN SOCIAL]', '[RUT]', '[DOMICILIO]'] as const;

interface Responsable { razonSocial: string; rut: string; domicilio: string }

/** Datos del responsable: el dueño reemplaza los marcadores por la razón social, el RUT y el domicilio reales. */
const OWNER: Responsable = { razonSocial: '[RAZÓN SOCIAL]', rut: '[RUT]', domicilio: '[DOMICILIO]' };

/** Fixture legal (LEGAL_FIXTURE=1): datos visiblemente falsos para construir y verificar variantes locales. */
const FIXTURE: Responsable = {
  razonSocial: 'Empresa de Prueba S.A. — DATOS DE PRUEBA, NO PUBLICAR',
  rut: '000000000000 (DATOS DE PRUEBA)',
  domicilio: 'Calle Ficticia 0000, Montevideo (DATOS DE PRUEBA)',
};

const usesFixture = process.env.LEGAL_FIXTURE === '1';
const hasMarkers = Object.values(OWNER).some((v) => (LEGAL_MARKERS as readonly string[]).includes(v));

// Bloqueo de producción (§2.2): con VERCEL_ENV=production o PUBLISH=1, los marcadores hacen fallar el build.
if (hasMarkers && !usesFixture && (process.env.VERCEL_ENV === 'production' || process.env.PUBLISH === '1')) {
  throw new Error(
    '[legal] faltan los datos del responsable (razón social, RUT y domicilio) en src/content/legal.ts: '
    + 'el formulario no se publica con los marcadores (spec 004 §2.2).',
  );
}

export const responsable: Responsable = usesFixture ? FIXTURE : OWNER;

const r = responsable;

/** Fecha de la última actualización de la política (YYYY-MM-DD). */
export const POLICY_UPDATED = '2026-10-04';

export interface NoticeCopy {
  title: string;
  /** Ítems del aviso de §2.2: rótulo y texto. */
  items: { label: string; text: string }[];
  /** Link a la política: texto, aviso para lectores de pantalla. */
  policyLink: { text: string; newTab: string };
  consent: { label: string; required: string };
}

export const notice: Localized<NoticeCopy> = {
  es: {
    title: 'Antes de enviar',
    items: [
      { label: 'Responsable', text: `${r.razonSocial} (NoctiLabs), RUT ${r.rut}, con domicilio en ${r.domicilio}.` },
      { label: 'Finalidad', text: 'responder tu consulta y coordinar una conversación comercial.' },
      { label: 'Dónde se guardan', text: 'en el correo del equipo y en Web3Forms, el proveedor del formulario.' },
      { label: 'Transferencia', text: 'Web3Forms procesa los datos en India, con sus subencargados. La transferencia se basa en tu consentimiento.' },
      { label: 'Obligatorios', text: 'nombre, email, empresa y mensaje. Sin ellos no podemos responderte.' },
      { label: 'Plazo', text: '24 meses desde el último contacto; si hay relación comercial, mientras dure y 24 meses más.' },
      { label: 'Tus derechos', text: `acceso, rectificación, actualización y supresión, escribiendo a ${CONTACT_EMAIL}.` },
    ],
    policyLink: { text: 'Política de privacidad completa', newTab: ' (se abre en una pestaña nueva)' },
    consent: {
      label: 'Acepto que NoctiLabs trate mis datos para responder esta consulta, incluida su transferencia a Web3Forms, según el aviso y la política de privacidad.',
      required: 'Para enviar, necesitamos tu consentimiento.',
    },
  },
  // D4: traducción provisoria, pendiente de revisión del dueño y de la revisión profesional.
  en: {
    title: 'Before you send',
    items: [
      { label: 'Controller', text: `${r.razonSocial} (NoctiLabs), RUT ${r.rut}, located at ${r.domicilio}.` },
      { label: 'Purpose', text: 'to answer your inquiry and set up a business conversation.' },
      { label: 'Where it is stored', text: 'in the team’s email and in Web3Forms, the form provider.' },
      { label: 'Transfer', text: 'Web3Forms processes the data in India, with its sub-processors. The transfer is based on your consent.' },
      { label: 'Required', text: 'name, email, company and message. Without them we cannot reply.' },
      { label: 'Retention', text: '24 months from the last contact; if there is a business relationship, for its duration plus 24 months.' },
      { label: 'Your rights', text: `access, rectification, update and deletion, by writing to ${CONTACT_EMAIL}.` },
    ],
    policyLink: { text: 'Full privacy policy', newTab: ' (opens in a new tab)' },
    consent: {
      label: 'I agree that NoctiLabs may process my data to answer this inquiry, including its transfer to Web3Forms, as described in the notice and the privacy policy.',
      required: 'To send, we need your consent.',
    },
  },
};

export interface PolicySection { title: string; paragraphs: string[]; list?: string[] }
export interface PolicyCopy { lead: string; updated: string; sections: PolicySection[] }

export const policy: Localized<PolicyCopy> = {
  es: {
    lead: 'Esta política explica qué datos personales trata NoctiLabs a través de este sitio, para qué, dónde se guardan, cuánto tiempo y cómo ejercer tus derechos según la Ley 18.331 de Protección de Datos Personales.',
    updated: 'Última actualización',
    sections: [
      {
        title: 'Responsable',
        paragraphs: [
          `El responsable de la base de datos es ${r.razonSocial} (NoctiLabs), RUT ${r.rut}, con domicilio en ${r.domicilio}. Podés escribirnos a ${CONTACT_EMAIL}.`,
        ],
      },
      {
        title: 'Qué datos tratamos y para qué',
        paragraphs: [
          'Solo tratamos los datos que nos enviás por el formulario de Hablemos: nombre, email laboral, empresa y mensaje (obligatorios), y rol e industria (opcionales). Con el envío registramos también el idioma, la página del formulario y la fecha, la hora y la versión del aviso que aceptaste.',
          'Los usamos únicamente para responder tu consulta y coordinar una conversación comercial. Si faltan los datos obligatorios, no podemos responderte.',
        ],
      },
      {
        title: 'Base legal',
        paragraphs: [
          'Tratamos tus datos con tu consentimiento expreso e informado, que das al marcar la casilla del formulario (art. 9 de la Ley 18.331). Ese consentimiento cubre también la transferencia internacional a Web3Forms (art. 23, literal A).',
        ],
      },
      {
        title: 'Dónde se guardan y quién los procesa',
        paragraphs: ['Los datos se guardan en el correo del equipo y los procesan estos encargados:'],
        list: [
          'Web3Forms, el proveedor del formulario, que recibe el envío y lo reenvía por correo. Procesa los datos en India, con sus subencargados.',
          'Vercel, que aloja el sitio y la analítica.',
          'Sanity, que guarda solo el contenido editorial de Insights. No recibe datos de los visitantes.',
        ],
      },
      {
        title: 'Cuánto tiempo los conservamos',
        paragraphs: [
          'Conservamos los datos 24 meses desde el último contacto. Si hay una relación comercial, mientras dure y 24 meses más.',
        ],
      },
      {
        title: 'Cookies',
        paragraphs: ['Este sitio no usa cookies propias ni de terceros.'],
      },
      {
        title: 'Analítica',
        paragraphs: [
          'Medimos las visitas con Vercel Web Analytics, que no usa cookies ni identificadores persistentes. Registra de forma agregada la página visitada (sin la consulta ni el fragmento de la URL), el origen del sitio de procedencia, el país y el tipo de dispositivo, sistema operativo y navegador. Para contar visitantes sin identificarlos usa un valor derivado de la solicitud que se descarta cada 24 horas, según la documentación de Vercel. La página de error no se mide.',
        ],
      },
      {
        title: 'Tus derechos',
        paragraphs: [
          `Podés pedir acceso, rectificación, actualización, inclusión o supresión de tus datos escribiendo a ${CONTACT_EMAIL}. Respondemos dentro de los 5 días hábiles que fija la ley (arts. 14 y 15). Podés retirar tu consentimiento en cualquier momento, sin efecto retroactivo.`,
          'Si considerás que no respetamos tus derechos, podés presentar una denuncia ante la Unidad Reguladora y de Control de Datos Personales (URCDP).',
        ],
      },
    ],
  },
  // D4: traducción provisoria, pendiente de revisión del dueño y de la revisión profesional.
  en: {
    lead: 'This policy explains which personal data NoctiLabs processes through this site, why, where it is stored, for how long and how to exercise your rights under Uruguayan Law 18,331 on Personal Data Protection.',
    updated: 'Last updated',
    sections: [
      {
        title: 'Controller',
        paragraphs: [
          `The database controller is ${r.razonSocial} (NoctiLabs), RUT ${r.rut}, located at ${r.domicilio}. You can write to us at ${CONTACT_EMAIL}.`,
        ],
      },
      {
        title: 'What data we process and why',
        paragraphs: [
          'We only process the data you send us through the contact form: name, work email, company and message (required), and role and industry (optional). With each submission we also record the language, the form page, and the date, time and version of the notice you accepted.',
          'We use it only to answer your inquiry and set up a business conversation. Without the required data we cannot reply.',
        ],
      },
      {
        title: 'Legal basis',
        paragraphs: [
          'We process your data with your express and informed consent, which you give by ticking the box on the form (art. 9 of Law 18,331). That consent also covers the international transfer to Web3Forms (art. 23, item A).',
        ],
      },
      {
        title: 'Where it is stored and who processes it',
        paragraphs: ['The data is stored in the team’s email and processed by these processors:'],
        list: [
          'Web3Forms, the form provider, which receives the submission and forwards it by email. It processes the data in India, with its sub-processors.',
          'Vercel, which hosts the site and the analytics.',
          'Sanity, which only stores the editorial content of Insights. It receives no visitor data.',
        ],
      },
      {
        title: 'How long we keep it',
        paragraphs: [
          'We keep the data for 24 months from the last contact. If there is a business relationship, for its duration plus 24 months.',
        ],
      },
      {
        title: 'Cookies',
        paragraphs: ['This site uses no first-party or third-party cookies.'],
      },
      {
        title: 'Analytics',
        paragraphs: [
          'We measure visits with Vercel Web Analytics, which uses no cookies or persistent identifiers. It records, in aggregate, the page visited (without the URL query or fragment), the origin of the referring site, the country, and the device type, operating system and browser. To count visitors without identifying them it uses a value derived from the request that is discarded every 24 hours, according to Vercel’s documentation. The error page is not measured.',
        ],
      },
      {
        title: 'Your rights',
        paragraphs: [
          `You can request access to, rectification, update, inclusion or deletion of your data by writing to ${CONTACT_EMAIL}. We reply within the 5 business days set by law (arts. 14 and 15). You can withdraw your consent at any time, without retroactive effect.`,
          'If you believe we have not respected your rights, you can file a complaint with the Uruguayan data protection authority (URCDP).',
        ],
      },
    ],
  },
};
