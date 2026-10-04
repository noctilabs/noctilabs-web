import type { BeforeSendEvent } from '@vercel/analytics';

/** Spec 004 §2.7: función pura que descarta la query string y el fragmento de la URL de cada evento. */
export function beforeSend(event: BeforeSendEvent): BeforeSendEvent {
  return { ...event, url: event.url.split(/[?#]/, 1)[0] };
}
