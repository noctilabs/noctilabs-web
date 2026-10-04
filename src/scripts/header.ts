// Contratos de estado del header: spec 001 §3.5 (megamenú pasos 1–9, mobile pasos 1–7).
const DESKTOP = '(min-width: 1000px)';
const CLOSE_DELAY = 120;

type Mode = 'hover' | 'fijo';

function focusQuietly(el: HTMLElement): void {
  // Sin anillo de foco cuando la activación vino del puntero (guidelines: :focus-visible, no en click).
  if (document.activeElement !== el) el.focus({ focusVisible: false } as FocusOptions);
}

// Foco al presionar (Safari no enfoca botones al presionarlos, ni links sin tabindex explícito):
// - los links de los paneles llevan tabindex="0" y los paneles tabindex="-1" (Header.astro): presionar
//   cualquier punto del panel, con cualquier botón, deja el foco dentro del conjunto, sin cancelar acciones
//   nativas (selección de texto, arrastre, click central);
// - los botones no mueven el foco con el botón principal; su click lo enfoca explícitamente.
function holdFocusOnPress(el: HTMLElement): void {
  el.addEventListener('mousedown', (e) => {
    if (e.button === 0) e.preventDefault();
  });
}

export function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  const logo = header.querySelector<HTMLAnchorElement>('[data-logo]')!;
  const capsule = header.querySelector<HTMLElement>('[data-capsule]')!;
  const mq = matchMedia(DESKTOP);

  // ---------- Megamenú ----------
  const groups = [...header.querySelectorAll<HTMLElement>('li[data-group]')].map((item) => {
    const id = item.dataset.group!;
    return {
      id,
      item,
      button: item.querySelector<HTMLButtonElement>('[data-toggle]')!,
      panel: header.querySelector<HTMLElement>(`[data-panel="${id}"]`)!,
    };
  });
  type Group = (typeof groups)[number];

  let open: { group: Group; mode: Mode } | null = null;
  let hoverTimer: number | undefined;
  let focusTimer: number | undefined;
  let hoverToken = 0;
  let openToken = 0;
  let hovered: Group | null = null;
  let suppressed: Group | null = null;

  const within = (g: Group, el: EventTarget | null) => el instanceof Node && (g.item.contains(el) || g.panel.contains(el));
  const inFocusSet = (g: Group, el: EventTarget | null) => el instanceof Node && (g.button.contains(el) || g.panel.contains(el));
  const focusIn = (g: Group) => inFocusSet(g, document.activeElement);
  // El hover sólo cancela su propio cierre retardado; abrir, cerrar o reemplazar un panel invalida
  // todos los callbacks pendientes, de hover y de foco (spec 001 §3.5 paso 9).
  const cancelHover = () => {
    clearTimeout(hoverTimer);
    hoverTimer = undefined;
    hoverToken++;
  };
  const cancelAll = () => {
    cancelHover();
    clearTimeout(focusTimer);
    focusTimer = undefined;
    openToken++;
  };

  function show(g: Group, mode: Mode) {
    if (open && open.group !== g) hide(open.group);
    cancelAll();
    g.panel.hidden = false;
    g.button.setAttribute('aria-expanded', 'true');
    open = { group: g, mode };
  }

  function hide(g: Group) {
    cancelAll();
    g.panel.hidden = true;
    g.button.setAttribute('aria-expanded', 'false');
    if (open?.group === g) open = null;
  }

  for (const g of groups) {
    holdFocusOnPress(g.button);
    g.button.addEventListener('click', () => {
      focusQuietly(g.button);
      if (!open || open.group !== g) show(g, 'fijo');
      else if (open.mode === 'hover') open.mode = 'fijo';
      else hide(g);
    });

    for (const el of [g.item, g.panel]) {
      el.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'touch') return;
        hovered = g;
        if (suppressed === g) return;
        if (open && open.group !== g && focusIn(open.group)) return;
        cancelHover();
        if (!open || open.group !== g) show(g, 'hover');
      });
      el.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'touch' || within(g, e.relatedTarget)) return;
        if (hovered === g) hovered = null;
        if (suppressed === g) suppressed = null;
        if (open?.group !== g || open.mode !== 'hover' || focusIn(g)) return;
        cancelHover();
        const mine = hoverToken;
        hoverTimer = window.setTimeout(() => {
          if (mine === hoverToken && open?.group === g && open.mode === 'hover' && !focusIn(g)) hide(g);
        }, CLOSE_DELAY);
      });
    }
    for (const el of [g.button, g.panel]) {
      el.addEventListener('focusout', (e) => {
        if (open?.group !== g || inFocusSet(g, e.relatedTarget)) return;
        if (e.relatedTarget !== null) return hide(g);
        // Sin destino (blur, foco a body): se decide con el foco efectivo después de la transición.
        clearTimeout(focusTimer);
        const mine = openToken;
        focusTimer = window.setTimeout(() => {
          if (mine === openToken && open?.group === g && !focusIn(g)) hide(g);
        });
      });
    }

    // Los paneles van al final del header en el DOM: el orden de Tab se lleva a mano.
    const links = () => [...g.panel.querySelectorAll<HTMLAnchorElement>('a')];
    g.button.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || e.shiftKey || g.panel.hidden) return;
      e.preventDefault();
      links()[0]?.focus();
    });
    g.panel.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const list = links();
      if (e.shiftKey && document.activeElement === list[0]) {
        e.preventDefault();
        g.button.focus();
      } else if (!e.shiftKey && document.activeElement === list[list.length - 1]) {
        const next = g.item.nextElementSibling?.querySelector<HTMLElement>('a, button') ?? header.querySelector<HTMLElement>('a.cta');
        if (next) { e.preventDefault(); next.focus(); }
      }
    });
  }

  // ---------- Menú mobile ----------
  const burger = header.querySelector<HTMLButtonElement>('[data-burger]')!;
  const icon = header.querySelector<SVGPathElement>('[data-burger-icon]')!;
  const mpanel = header.querySelector<HTMLElement>('[data-mpanel]')!;
  const ICON_OPEN = 'M4 8h16M4 16h16';
  const ICON_CLOSE = 'M6 6l12 12M18 6L6 18';

  let mobileGen = 0;
  let mobileFocusTimer: number | undefined;
  function setMobile(isOpen: boolean) {
    mobileGen++;
    clearTimeout(mobileFocusTimer);
    mpanel.hidden = !isOpen;
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', (isOpen ? burger.dataset.labelClose : burger.dataset.labelOpen)!);
    icon.setAttribute('d', isOpen ? ICON_CLOSE : ICON_OPEN);
  }
  const mobileOpen = () => !mpanel.hidden;
  const inMobile = (el: EventTarget | null) => el instanceof Node && (burger.contains(el) || mpanel.contains(el));

  holdFocusOnPress(burger);
  burger.addEventListener('click', () => {
    focusQuietly(burger);
    setMobile(!mobileOpen());
  });
  for (const el of [burger, mpanel]) {
    el.addEventListener('focusout', (e) => {
      if (!mobileOpen() || inMobile(e.relatedTarget)) return;
      if (e.relatedTarget !== null) return setMobile(false);
      clearTimeout(mobileFocusTimer);
      const mine = mobileGen;
      mobileFocusTimer = window.setTimeout(() => {
        if (mine === mobileGen && mobileOpen() && !inMobile(document.activeElement)) setMobile(false);
      });
    });
  }
  mpanel.addEventListener('click', (e) => {
    const link = (e.target as Element).closest('a');
    if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    setMobile(false);
    const url = new URL(link.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    if (location.hash !== url.hash) history.pushState(null, '', url.hash);
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start' });
  });

  // ---------- Global ----------
  let lastHeaderFocus: Element | null = null;
  document.addEventListener('focusin', (e) => {
    lastHeaderFocus = header.contains(e.target as Node) ? (e.target as Element) : null;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (mobileOpen()) {
      setMobile(false);
      burger.focus();
    } else if (open) {
      const g = open.group;
      const inside = focusIn(g);
      hide(g);
      if (inside) g.button.focus();
      if (hovered === g) suppressed = g;
    }
  });

  document.addEventListener('click', (e) => {
    if (open && !header.contains(e.target as Node)) hide(open.group);
    if (mobileOpen() && !capsule.contains(e.target as Node)) setMobile(false);
  });

  mq.addEventListener('change', () => {
    const active = document.activeElement === document.body ? lastHeaderFocus : document.activeElement;
    if (mq.matches) {
      const hadFocus = inMobile(active);
      setMobile(false);
      if (hadFocus) logo.focus();
    } else {
      const desktopOnly = active instanceof Node && (header.querySelector('nav.desk')!.contains(active)
        || header.querySelector('a.cta')!.contains(active)
        || groups.some((g) => g.panel.contains(active)));
      if (open) hide(open.group);
      hovered = suppressed = null;
      if (desktopOnly) logo.focus();
    }
  });
}
