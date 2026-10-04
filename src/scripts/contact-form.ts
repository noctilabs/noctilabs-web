// Formulario de Hablemos (spec 002 §4.6 y spec 004 §2.2–2.3): validación propia, consentimiento, honeypot,
// estados idle / enviando / error / enviado, intervalo mínimo entre envíos y aviso de cambios sin enviar.
// Sin JS, el fieldset queda deshabilitado y no se envía nada.
import { submitContact, type ContactData } from '../lib/contact';
import type { Locale } from '../i18n/routes';

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/** Intervalo mínimo entre envíos exitosos en la misma pestaña (§2.3). */
const MIN_INTERVAL_MS = 30_000;
const LAST_SENT_KEY = 'nl-contact-last-sent';

// sessionStorage es por pestaña; si no está disponible, queda la memoria de la página.
let lastSentMemory = 0;
const readLastSent = (): number => {
  try {
    return Number(sessionStorage.getItem(LAST_SENT_KEY)) || lastSentMemory;
  } catch {
    return lastSentMemory;
  }
};
const writeLastSent = (t: number) => {
  lastSentMemory = t;
  try {
    sessionStorage.setItem(LAST_SENT_KEY, String(t));
  } catch { /* sin almacenamiento: alcanza la memoria */ }
};

export function initContactForm(root: HTMLElement): void {
  const form = root.querySelector('form')!;
  const fieldset = form.querySelector('fieldset')!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const label = button.textContent;
  // Campos de datos: todo menos los checkboxes (consentimiento y honeypot), que se tratan aparte.
  const fields = [...form.querySelectorAll<Field>('input:not([type="checkbox"]), select, textarea')];
  const field = (name: keyof ContactData) => fields.find((f) => f.name === name)!;
  const consent = form.querySelector<HTMLInputElement>('input[name="consent"]')!;
  const botcheck = form.querySelector<HTMLInputElement>('input[name="botcheck"]')!;
  const validated: (Field | HTMLInputElement)[] = [...fields, consent];
  const sending = root.querySelector<HTMLElement>('[data-sending]')!;
  const failed = root.querySelector<HTMLElement>('[data-failed]')!;
  const wait = root.querySelector<HTMLElement>('[data-wait]')!;
  const sent = root.querySelector<HTMLElement>('[data-sent]')!;
  const sentTitle = sent.querySelector<HTMLElement>('h2')!;
  const locale = root.dataset.locale as Locale;
  const page = root.dataset.page!;
  const consentVersion = root.dataset.consentVersion!;
  let busy = false;
  let guarded = false;

  const guard = (e: BeforeUnloadEvent) => e.preventDefault();
  const setGuard = (on: boolean) => {
    if (on === guarded) return;
    guarded = on;
    if (on) window.addEventListener('beforeunload', guard);
    else window.removeEventListener('beforeunload', guard);
  };
  // «Formulario modificado»: solo los campos de datos (el honeypot y el consentimiento no cuentan).
  const modified = () => fields.some((f) => f.value !== '');

  const errorOf = (c: Element) => document.getElementById(`${c.id}-err`)!;
  const clearError = (c: Field) => {
    c.removeAttribute('aria-invalid');
    c.removeAttribute('aria-describedby');
    errorOf(c).hidden = true;
  };
  const showError = (c: Field, message: string) => {
    const err = errorOf(c);
    err.textContent = message;
    err.hidden = false;
    c.setAttribute('aria-invalid', 'true');
    c.setAttribute('aria-describedby', err.id);
  };

  const validate = (): Field | null => {
    let first: Field | null = null;
    for (const c of validated) {
      clearError(c);
      let message = '';
      if (c === consent) {
        if (!consent.checked) message = consent.dataset.required ?? '';
      } else if (c.required && c.value.trim() === '') message = c.dataset.required ?? '';
      else if (c instanceof HTMLInputElement && c.validity.typeMismatch) message = c.dataset.invalid ?? '';
      if (message) {
        showError(c, message);
        first ??= c;
      }
    }
    return first;
  };

  const setSending = (on: boolean) => {
    busy = on;
    // Todo el fieldset: lo que se edite durante el envío no se mandaría (los datos ya se capturaron).
    fieldset.disabled = on;
    button.textContent = on ? sending.textContent : label;
    sending.hidden = !on;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (busy) return;
    const invalid = validate();
    if (invalid) {
      invalid.focus();
      return;
    }
    failed.hidden = true;
    if (Date.now() - readLastSent() < MIN_INTERVAL_MS) {
      wait.hidden = false;
      return;
    }
    wait.hidden = true;
    // Payload tipado, capturado antes de bloquear el formulario.
    const value = (name: keyof ContactData) => field(name).value.trim();
    const submission = {
      data: {
        name: value('name'),
        email: value('email'),
        organization: value('organization'),
        role: value('role'),
        industry: value('industry'),
        message: value('message'),
      },
      locale,
      page,
      botcheck: botcheck.checked,
      consentVersion,
      consentAt: new Date().toISOString(),
    };
    setSending(true);
    // Dos frames para que el navegador pinte «Enviando…» aunque la promesa rechace enseguida.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      submitContact(submission).then(
        () => {
          writeLastSent(Date.now());
          setSending(false);
          setGuard(false);
          form.hidden = true;
          sent.hidden = false;
          sentTitle.focus();
        },
        () => {
          setSending(false);
          failed.hidden = false;
          if (document.activeElement === document.body) button.focus();
        },
      );
    }));
  });

  const onEdit = (e: Event) => {
    const c = e.target as Field;
    if (c === botcheck) return;
    if (c.getAttribute('aria-invalid')) clearError(c);
    setGuard(modified());
  };
  form.addEventListener('input', onEdit);
  form.addEventListener('change', onEdit);

  sent.querySelector('button')!.addEventListener('click', () => {
    form.reset();
    validated.forEach(clearError);
    failed.hidden = true;
    wait.hidden = true;
    setGuard(false);
    sent.hidden = true;
    form.hidden = false;
    fields[0].focus();
  });

  fieldset.disabled = false;
}
