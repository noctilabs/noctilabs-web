/** Datos del formulario de Hablemos (spec 002 §4.6), ya recortados con trim(). */
export interface ContactData {
  name: string;
  email: string;
  organization: string;
  role: string;
  industry: string;
  message: string;
}

/**
 * Envío del formulario. En la fase 2 no hay envío real: rechaza siempre, así que el estado «enviado» no es
 * alcanzable. El envío llega en la fase 4.
 */
export function submitContact(data: ContactData): Promise<void> {
  void data;
  return Promise.reject(new Error('Envío no disponible hasta la fase 4.'));
}
