// Textura «Tramado animado» (spec 003 §3.4, Inv §0.3): semitono con dithering Bayer 4×4 sobre un canvas fijo.
// Anima solo sin pausa manual, con la pestaña visible y sin reduced motion; si no, queda el último frame dibujado.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const DOT = 2.1, CELL = 8, COVERAGE = 0.85, ALPHA = 0.15, SPEED = 1.7, WAVE = 0.3, DRIFT = -2.8;
const FRAME_MS = 62.5;
const KEY = 'noctilabs:texture-paused';

const readPref = (): boolean => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };
const writePref = (v: boolean) => { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* sin almacenamiento: queda en memoria */ } };

function init() {
  const box = document.querySelector<HTMLElement>('[data-texture]');
  const canvas = box?.querySelector('canvas');
  const ctx = canvas?.getContext('2d');
  if (!box || !canvas || !ctx) return;
  const btn = document.querySelector<HTMLButtonElement>('[data-texture-toggle]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = readPref();
  let w = 0, h = 0, dpr = 1, raf = 0, last = 0, t = 0;

  const draw = () => {
    if (!w || !h) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = `rgba(11,11,12,${ALPHA})`;
    const T = t * 0.00011, dr = DRIFT * T * 0.25;
    for (let y = 0, r = 0; y < h; y += CELL, r++) {
      const v = y / h / WAVE + dr * 0.35;
      for (let x = 0, q = 0; x < w; x += CELL, q++) {
        const u = x / w / WAVE + dr;
        let n = Math.sin(u * 5.1 + T * 1.3) * Math.cos(v * 4.3 - T) + Math.sin((u + v) * 3.7 + T * 0.7) * 0.6 + Math.sin(u * 11 - v * 9 + T * 1.9) * 0.25;
        n = Math.pow(Math.max(0, Math.min(1, (n + 1.85) / 3.7)), 2.6) * COVERAGE;
        if (n > BAYER[(r & 3) * 4 + (q & 3)]!) ctx.fillRect(x, y, DOT, DOT);
      }
    }
  };

  const running = () => !paused && !document.hidden && !reduce.matches;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (last && now - last < FRAME_MS) return;
    if (last) t += 60 * SPEED;
    last = now;
    draw();
  };
  const sync = () => {
    if (running()) { if (!raf) { last = 0; raf = requestAnimationFrame(loop); } }
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  };

  // Un único procedimiento para tamaño, orientación y DPR: bitmap nuevo y un redibujo con la fase congelada.
  const resizeAndDraw = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    draw();
  };
  new ResizeObserver((entries) => {
    const r = entries[entries.length - 1]!.contentRect;
    w = r.width;
    h = r.height;
    resizeAndDraw();
  }).observe(box);
  let dprQuery: MediaQueryList | null = null;
  const onDpr = () => { resizeAndDraw(); watchDpr(); };
  const watchDpr = () => {
    dprQuery?.removeEventListener('change', onDpr);
    dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    dprQuery.addEventListener('change', onDpr);
  };
  watchDpr();

  const label = () => { if (btn) btn.textContent = (paused ? btn.dataset.play : btn.dataset.pause) ?? ''; };
  const showButton = () => { if (btn) btn.hidden = reduce.matches; };
  btn?.addEventListener('click', () => { paused = !paused; writePref(paused); label(); sync(); });
  reduce.addEventListener('change', () => { showButton(); sync(); });
  document.addEventListener('visibilitychange', sync);
  label();
  showButton();
  sync();
}

init();
