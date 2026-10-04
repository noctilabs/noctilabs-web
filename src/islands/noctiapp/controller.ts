// Máquina de estados del chat de Preguntar (spec 003 §4.3). Una sola fuente de temporizadores por isla, con un token
// de generación: cada secuencia nueva invalida los callbacks pendientes de la anterior.

export interface ChatState {
  typed: number;
  showQ: boolean;
  thinking: boolean;
  src: number;
  showA: boolean;
  items: number;
  foot: boolean;
  pulse: boolean;
}

export const EMPTY_CHAT: ChatState = { typed: 0, showQ: false, thinking: false, src: 0, showA: false, items: 0, foot: false, pulse: true };

export const completeChat = (src: number, items: number): ChatState => ({ typed: 0, showQ: true, thinking: false, src, showA: true, items, foot: true, pulse: true });

interface Step { delay: number; apply: Partial<ChatState>; foot?: boolean; end?: boolean }

/** Tiempos de App L530–538: 500 ms de espera, 28 ms por carácter (+30 en espacios), +450, +350, +380 por fuente, +650, +520 por ítem, +450 y +5200. */
export function buildSteps(q: string, nSrc: number, nItems: number): Step[] {
  const steps: Step[] = [];
  let delay = 500;
  for (let i = 1; i <= q.length; i++) {
    steps.push({ delay, apply: { typed: i } });
    delay = 28 + (q[i - 1] === ' ' ? 30 : 0);
  }
  steps.push({ delay: delay + 450, apply: { typed: 0, showQ: true } });
  steps.push({ delay: 350, apply: { thinking: true, pulse: true } });
  for (let i = 1; i <= nSrc; i++) steps.push({ delay: 380, apply: { src: i } });
  steps.push({ delay: 650, apply: { thinking: false, showA: true, pulse: true } });
  for (let i = 1; i <= nItems; i++) steps.push({ delay: 520, apply: { items: i } });
  steps.push({ delay: 450, apply: { foot: true }, foot: true });
  steps.push({ delay: 5200, apply: {}, end: true });
  return steps;
}

export interface ChatCallbacks {
  onState: (s: ChatState) => void;
  onEnd: () => void;
  /** Escribe en la región viva manual (vacía con '' y escribe el texto en un tick posterior). */
  onAnnounce: (text: string) => void;
}

export interface StartOptions {
  /** Texto a anunciar una vez, al mostrarse el pie (o de inmediato si la secuencia queda estática). */
  announce?: string;
  /** Elección manual de rol en pausa: se muestra la respuesta completa y estática (§4.3). */
  completeIfPaused?: boolean;
}

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export class ChatController {
  private gen = 0;
  private steps: Step[] = [];
  private idx = 0;
  private remaining = 0;
  private startedAt = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pulseTimer: ReturnType<typeof setInterval> | null = null;
  private announceTimer: ReturnType<typeof setTimeout> | null = null;
  private state: ChatState = EMPTY_CHAT;
  private announceText: string | null = null;
  private active = false;
  visible = false;
  paused = false;
  reduced = false;

  constructor(private cb: ChatCallbacks) {}

  /** Arranca una secuencia nueva (reemplaza la anterior). Avanza solo si la fila de controles está visible, sin pausa y sin reduced motion. */
  start(q: string, nSrc: number, nItems: number, opts: StartOptions = {}) {
    this.cancel();
    this.steps = buildSteps(q, nSrc, nItems);
    this.idx = 0;
    this.remaining = this.steps[0]!.delay;
    this.active = true;
    this.announceText = opts.announce ?? null;
    this.set(EMPTY_CHAT);
    if (this.reduced || (opts.completeIfPaused && this.paused)) this.jumpToFoot();
    this.update();
  }

  /** Conversación abierta: completa y estática, sin secuencia (§4.3). */
  showStatic(state: ChatState, announce?: string) {
    this.cancel();
    this.set(state);
    if (announce) this.announce(announce);
  }

  /** Cancela la secuencia, el repetido, la rotación pendiente y cualquier anuncio pendiente de esta generación. */
  cancel() {
    this.gen++;
    this.clearTimers();
    if (this.announceTimer) { clearTimeout(this.announceTimer); this.announceTimer = null; }
    this.active = false;
    this.announceText = null;
  }

  setVisible(v: boolean) { this.visible = v; this.update(); }
  setPaused(p: boolean) { this.paused = p; this.update(); }
  setReduced(r: boolean) {
    this.reduced = r;
    if (r && this.active) this.jumpToFoot();
    this.update();
  }

  dispose() { this.cancel(); }

  private canRun() { return this.visible && !this.paused && !this.reduced; }

  private set(s: ChatState) { this.state = s; this.cb.onState(s); }

  private clearTimers() {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    if (this.pulseTimer) { clearInterval(this.pulseTimer); this.pulseTimer = null; }
  }

  /** Congela o reanuda según la condición única de §4.3. */
  private update() {
    if (!this.active) return;
    if (!this.canRun()) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
        this.remaining = Math.max(0, this.remaining - (now() - this.startedAt));
      }
      if (this.pulseTimer) { clearInterval(this.pulseTimer); this.pulseTimer = null; }
      return;
    }
    if (!this.timer) this.schedule();
    if (this.state.thinking && !this.pulseTimer) this.startPulse();
  }

  private schedule() {
    const gen = this.gen;
    this.startedAt = now();
    const due = this.startedAt + this.remaining;
    this.timer = setTimeout(() => {
      if (gen !== this.gen) return;
      this.timer = null;
      // El atraso de este temporizador se descuenta del siguiente: los tiempos no se acumulan (App L530–538).
      this.advance(Math.max(0, now() - due));
    }, this.remaining);
  }

  private advance(late = 0) {
    const step = this.steps[this.idx];
    if (!step) return;
    this.idx++;
    if (step.end) {
      this.active = false;
      this.clearTimers();
      this.cb.onEnd();
      return;
    }
    this.set({ ...this.state, ...step.apply });
    if (step.apply.thinking === true) this.startPulse();
    if (step.apply.thinking === false && this.pulseTimer) { clearInterval(this.pulseTimer); this.pulseTimer = null; }
    if (step.foot) this.flushAnnounce();
    const next = this.steps[this.idx];
    if (!next) return;
    this.remaining = Math.max(0, next.delay - late);
    if (this.canRun()) this.schedule();
  }

  private startPulse() {
    if (this.pulseTimer || !this.canRun()) return;
    const gen = this.gen;
    this.pulseTimer = setInterval(() => {
      if (gen !== this.gen || !this.state.thinking) return;
      this.set({ ...this.state, pulse: !this.state.pulse });
    }, 380);
  }

  /** Salta al pie (respuesta completa) y deja pendiente solo la permanencia de 5200 ms. */
  private jumpToFoot() {
    const footIdx = this.steps.findIndex((s) => s.foot);
    if (this.idx > footIdx) return;
    let s = this.state;
    for (let i = this.idx; i <= footIdx; i++) s = { ...s, ...this.steps[i]!.apply };
    this.clearTimers();
    this.idx = footIdx + 1;
    this.remaining = this.steps[this.idx]!.delay;
    this.set({ ...s, thinking: false, pulse: true });
    this.flushAnnounce();
  }

  private flushAnnounce() {
    if (this.announceText == null) return;
    const text = this.announceText;
    this.announceText = null;
    this.announce(text);
  }

  /** Vacía la región y escribe en un tick posterior; si la generación cambia en el medio, se descarta. */
  private announce(text: string) {
    const gen = this.gen;
    if (this.announceTimer) clearTimeout(this.announceTimer);
    this.cb.onAnnounce('');
    this.announceTimer = setTimeout(() => {
      this.announceTimer = null;
      if (gen === this.gen) this.cb.onAnnounce(text);
    }, 120);
  }
}
