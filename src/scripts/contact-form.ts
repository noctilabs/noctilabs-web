// Formulario de Hablemos (spec 002 §4.6): validación propia, estados idle / enviando / error / enviado y
// aviso de cambios sin enviar. Sin JS, el fieldset queda deshabilitado y no se envía nada.
import { submitContact, type ContactData } from '../lib/contact';

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export function initContactForm(root: HTMLElement): void {
  const form = root.querySelector('form')!;
  const fieldset = form.querySelector('fieldset')!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const label = button.textContent;
  const controls = [...form.querySelectorAll<Control>('input, select, textarea')];
  const sending = root.querySelector<HTMLElement>('[data-sending]')!;
  const failed = root.querySelector<HTMLElement>('[data-failed]')!;
  const sent = root.querySelector<HTMLElement>('[data-sent]')!;
  const sentTitle = sent.querySelector<HTMLElement>('h2')!;
  let busy = false;
  let guarded = false;

  const guard = (e: BeforeUnloadEvent) => e.preventDefault();
  const setGuard = (on: boolean) => {
    if (on === guarded) return;
    guarded = on;
    if (on) window.addEventListener('beforeunload', guard);
    else window.removeEventListener('beforeunload', guard);
  };

  const errorOf = (c: Control) => document.getElementById(`${c.id}-err`)!;
  const clearError = (c: Control) => {
    c.removeAttribute('aria-invalid');
    c.removeAttribute('aria-describedby');
    errorOf(c).hidden = true;
  };
  const showError = (c: Control, message: string) => {
    const err = errorOf(c);
    err.textContent = message;
    err.hidden = false;
    c.setAttribute('aria-invalid', 'true');
    c.setAttribute('aria-describedby', err.id);
  };

  const validate = (): Control | null => {
    let first: Control | null = null;
    for (const c of controls) {
      clearError(c);
      let message = '';
      if (c.required && c.value.trim() === '') message = c.dataset.required ?? '';
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
    button.disabled = on;
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
    setSending(true);
    const data = Object.fromEntries(controls.map((c) => [c.name, c.value.trim()])) as unknown as ContactData;
    // Dos frames para que el navegador pinte «Enviando…» aunque la promesa rechace enseguida.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      submitContact(data).then(
        () => {
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
    const c = e.target as Control;
    if (c.getAttribute('aria-invalid')) clearError(c);
    setGuard(controls.some((x) => x.value !== ''));
  };
  form.addEventListener('input', onEdit);
  form.addEventListener('change', onEdit);

  sent.querySelector('button')!.addEventListener('click', () => {
    form.reset();
    controls.forEach(clearError);
    failed.hidden = true;
    setGuard(false);
    sent.hidden = true;
    form.hidden = false;
    controls[0].focus();
  });

  fieldset.disabled = false;
}
