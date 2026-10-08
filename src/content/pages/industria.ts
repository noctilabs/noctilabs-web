import type { Localized } from '../types';

/** Textos de interfaz de la plantilla de industria (spec 009 §3.D–E); el contenido de cada industria vive en `industries.ts`. */
export interface IndustriaCopy {
  /** Prefijo del kicker del hero: «{kicker} · {label}». */
  kicker: string;
  ops: { kicker: string; title: string; region: string };
  chat: {
    kicker: string;
    title: string;
    /** «{empresa} · {note}». */
    note: string;
    /** Nombre accesible del registro de mensajes. */
    log: string;
    placeholder: string;
    inputLabel: string;
    send: string;
    pause: string;
    resume: string;
    status: { online: string; thinking: string; answering: string; paused: string };
    sources: string;
    more: string;
    /** Respuesta fija a lo que escribe el visitante (spec 009 §3.E). */
    reply: string;
  };
  vals: { kicker: string; title: string };
  cta: { title: string; others: string };
}

export const industria: Localized<IndustriaCopy> = {
  es: {
    kicker: 'Industrias',
    ops: { kicker: 'Tu operación', title: 'Cómo funciona tu operación.', region: 'Áreas de tu operación' },
    chat: {
      kicker: 'Conversación',
      title: 'Preguntale a tu empresa.',
      note: 'datos ilustrativos',
      log: 'Conversación con Nocti',
      placeholder: 'Preguntale algo a tu empresa…',
      inputLabel: 'Preguntale algo a tu empresa',
      send: 'Enviar',
      pause: 'Pausar',
      resume: 'Reanudar',
      status: { online: 'En línea', thinking: 'Consultando contexto…', answering: 'Respondiendo…', paused: 'En pausa' },
      sources: 'Fuentes consultadas',
      more: 'Podés seguir preguntando',
      reply: 'En tu empresa, te respondería con tus propios datos.',
    },
    vals: { kicker: 'Valor', title: 'Dónde aparece el valor.' },
    cta: { title: 'Veamos cómo opera tu empresa.', others: 'Otras industrias' },
  },
  en: {
    kicker: 'Industries',
    ops: { kicker: 'Your operation', title: 'How your operation works.', region: 'Areas of your operation' },
    chat: {
      kicker: 'Conversation',
      title: 'Ask your company.',
      note: 'illustrative data',
      log: 'Conversation with Nocti',
      placeholder: 'Ask your company something…',
      inputLabel: 'Ask your company something',
      send: 'Send',
      pause: 'Pause',
      resume: 'Resume',
      status: { online: 'Online', thinking: 'Checking context…', answering: 'Answering…', paused: 'Paused' },
      sources: 'Sources consulted',
      more: 'Keep asking',
      reply: 'At your company, I’d answer with your own data.',
    },
    vals: { kicker: 'Value', title: 'Where the value shows up.' },
    cta: { title: 'Let’s see how your company operates.', others: 'Other industries' },
  },
};
