// Driver mínimo de Chrome headless por CDP (Node 22, WebSocket global). Uso: node run.mjs <escenario.mjs>
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch({ port = 9333 } = {}) {
  const profile = mkdtempSync(join(tmpdir(), 'cdp-'));
  const proc = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required',
    // Fase 4: ningún pedido puede llegar a Web3Forms ni a Vercel aunque falle la intercepción (red de seguridad).
    '--host-resolver-rules=MAP api.web3forms.com ~NOTFOUND, MAP *.web3forms.com ~NOTFOUND, MAP *.vercel-insights.com ~NOTFOUND, MAP va.vercel-scripts.com ~NOTFOUND',
    'about:blank',
  ], { stdio: 'ignore' });
  let targets;
  for (let i = 0; i < 50; i++) {
    try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (targets.some((t) => t.type === 'page')) break; } catch {}
    await sleep(200);
  }
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0;
  const pending = new Map();
  const listeners = [];
  const consoleErrors = [];
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    } else if (msg.method) {
      if (msg.method === 'Runtime.exceptionThrown') consoleErrors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '));
      if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') consoleErrors.push(`${msg.params.entry.text} ${msg.params.entry.url || ''}`);
      for (const l of listeners) l(msg);
    }
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });

  // Fase 4: todo pedido a Web3Forms o a /_vercel/insights se pausa con Fetch. Sin manejador propio, se rechaza.
  const fetchLog = [];
  listeners.push(async (m) => {
    if (m.method !== 'Fetch.requestPaused') return;
    const p = m.params;
    fetchLog.push({ t: Date.now(), method: p.request.method, url: p.request.url, postData: p.request.postData ?? null, headers: p.request.headers });
    try {
      if (api.fetchHandler) await api.fetchHandler(p);
      else await send('Fetch.failRequest', { requestId: p.requestId, errorReason: 'BlockedByClient' });
    } catch (e) { consoleErrors.push(`[fetch handler] ${e.message}`); }
  });
  await send('Fetch.enable', { patterns: [{ urlPattern: '*web3forms.com*', requestStage: 'Request' }, { urlPattern: '*/_vercel/insights/*', requestStage: 'Request' }] });

  const api = {
    send,
    consoleErrors,
    fetchLog,
    fetchHandler: null,
    on(fn) { listeners.push(fn); },
    async viewport(width, height, mobile = false) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
    },
    async goto(url) {
      await send('Page.navigate', { url: 'about:blank' });
      await sleep(100);
      const loaded = new Promise((r) => { const f = (m) => { if (m.method === 'Page.loadEventFired') { listeners.splice(listeners.indexOf(f), 1); r(); } }; listeners.push(f); });
      await send('Page.navigate', { url });
      await loaded;
      await api.eval('document.fonts.ready.then(() => true)');
      await sleep(250);
    },
    async eval(expression) {
      const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    async center(selector) {
      return api.eval(`(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
    },
    async move(x, y) { await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y }); await sleep(30); },
    async hover(selector) { const { x, y } = await api.center(selector); await api.move(x, y); },
    async click(selector, modifiers = 0) {
      const { x, y } = await api.center(selector);
      await api.move(x, y);
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1, modifiers });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1, modifiers });
      await sleep(60);
    },
    async clickAt(x, y) {
      await api.move(x, y);
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
      await sleep(60);
    },
    async key(key, { shift = false } = {}) {
      const codes = { Tab: [9, 'Tab'], Enter: [13, 'Enter'], Escape: [27, 'Escape'], ' ': [32, 'Space'] };
      const [kc, code] = codes[key];
      const base = { key, code, windowsVirtualKeyCode: kc, modifiers: shift ? 8 : 0 };
      await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...base, ...(key === 'Enter' ? { text: '\r' } : key === ' ' ? { text: ' ' } : {}) });
      if (key === 'Enter' || key === ' ') await send('Input.dispatchKeyEvent', { type: 'char', ...base, text: key === 'Enter' ? '\r' : ' ' });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
      await sleep(60);
    },
    focused() {
      return api.eval(`(() => { const a = document.activeElement; if (!a || a === document.body) return 'body'; return (a.tagName + (a.id ? '#' + a.id : '') + (a.className && typeof a.className === 'string' ? '.' + a.className.split(' ').filter(c => !c.startsWith('astro-')).join('.') : '') + ' "' + (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 30) + '"'); })()`);
    },
    async shot(file, clip) {
      const r = await send('Page.captureScreenshot', { format: 'png', ...(clip ? { clip: { ...clip, scale: 1 } } : {}) });
      writeFileSync(file, Buffer.from(r.data, 'base64'));
    },
    sleep,
    async close() { try { await send('Browser.close'); } catch {} proc.kill(); },
  };
  return api;
}
