import type { Locale } from '../i18n/routes';

/** Datos del formulario de Hablemos (spec 002 §4.6), ya recortados con trim(). */
export interface ContactData {
  name: string;
  email: string;
  organization: string;
  role: string;
  industry: string;
  message: string;
}

/** Un envío: los campos más los metadatos y el consentimiento de spec 004 §2.2–2.3. */
export interface ContactSubmission {
  data: ContactData;
  locale: Locale;
  /** URL canónica de Hablemos en ese idioma (de alternates()), sin query ni fragmento. */
  page: string;
  /** Honeypot, leído con `.checked`. */
  botcheck: boolean;
  consentVersion: string;
  /** Hora del cliente al enviar, ISO. */
  consentAt: string;
}

export const WEB3FORMS_URL = 'https://api.web3forms.com/submit';
export const SUBMIT_TIMEOUT_MS = 15_000;

/** Clave pública de la cuenta de Web3Forms del dueño, por variable de entorno (no va en el repo). */
const ACCESS_KEY: string = import.meta.env.PUBLIC_WEB3FORMS_KEY ?? '';

/**
 * Envía el formulario a Web3Forms (spec 004 §2.3). Resuelve solo con HTTP 2xx y un JSON con `success === true`;
 * cualquier otra respuesta, un error de red o el timeout (15 s, request y cuerpo) rechazan.
 * Con el honeypot marcado resuelve sin hacer ningún request.
 */
export async function submitContact(s: ContactSubmission): Promise<void> {
  if (s.botcheck) return;
  const body = {
    access_key: ACCESS_KEY,
    subject: `Nuevo contacto desde la web (${s.locale.toUpperCase()})`,
    from_name: 'NoctiLabs web',
    botcheck: false,
    ...s.data,
    locale: s.locale,
    page: s.page,
    consent: true,
    consent_version: s.consentVersion,
    consent_at: s.consentAt,
  };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), SUBMIT_TIMEOUT_MS);
  try {
    const res = await fetch(WEB3FORMS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    // La lectura del cuerpo queda dentro del mismo timeout: el AbortController también la corta.
    const text = await res.text();
    if (!res.ok) throw new Error(`Web3Forms respondió ${res.status}`);
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error('Web3Forms devolvió un JSON inválido');
    }
    if ((json as { success?: unknown } | null)?.success !== true) throw new Error('Web3Forms no confirmó el envío');
  } finally {
    clearTimeout(timer);
  }
}
