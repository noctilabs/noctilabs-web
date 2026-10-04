// B5 v2 (gate 002, pasada 2 #3): Tab y Shift+Tab salen del tablist de industrias desde tabs inactivas anteriores y
// posteriores a la seleccionada, sin cambiar la selección; la reentrada cae en la tab seleccionada. ES y EN.
import { launch } from '../cdp.mjs';
const b = await launch({ port: 9363 });
const KEYS = { Tab: 9, Home: 36, End: 35, ArrowLeft: 37, ArrowRight: 39 };
const key = async (k, shift = false) => {
  const base = { key: k, code: k, windowsVirtualKeyCode: KEYS[k], modifiers: shift ? 8 : 0 };
  await b.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...base });
  await b.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
  await b.sleep(60);
};
const state = () => b.eval(`(() => { const a = document.activeElement; const sel = document.querySelector('[role=tab][aria-selected=true]');
  return { foco: a.id || a.tagName.toLowerCase(), enTablist: !!a.closest('[role=tablist]'), seleccionada: sel.id,
    tabindex0: [...document.querySelectorAll('[role=tab]')].filter((t) => t.tabIndex === 0).map((t) => t.id) }; })()`);
let fails = 0;
const ok = (c, m, s) => { console.log(`${c ? 'OK   ' : 'FALLA'} ${m} — ${JSON.stringify(s)}`); if (!c) fails++; };
try {
  await b.send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await b.viewport(1440, 900, false);
  for (const url of ['http://localhost:4932/', 'http://localhost:4932/en/']) {
    // [mover el foco, tecla de salida, debe salir hacia (fuera/panel)]
    const casos = [
      ['Home', false, 'anterior a la seleccionada, Tab'],
      ['Home', true, 'anterior a la seleccionada, Shift+Tab'],
      ['End', false, 'posterior a la seleccionada, Tab'],
      ['End', true, 'posterior a la seleccionada, Shift+Tab'],
    ];
    for (const [mover, shift, nombre] of casos) {
      await b.goto(url);
      await b.eval(`(() => { const t = document.getElementById('ind-tab-manufactura'); t.click(); t.focus(); })()`);
      await key(mover);
      const antes = await state();
      await key('Tab', shift);
      const s = await state();
      const salio = !s.enTablist && s.seleccionada === 'ind-tab-manufactura' && s.tabindex0.join() === 'ind-tab-manufactura';
      const destino = shift ? true : s.foco === 'ind-panel-manufactura';
      ok(antes.enTablist && antes.foco !== 'ind-tab-manufactura' && salio && destino, `${url} ${nombre}: sale del tablist${shift ? '' : ' al panel'}, selección y punto de reentrada intactos`, { antes: antes.foco, despues: s });
      // Reentrada: desde donde quedó, la tecla inversa vuelve a la tab seleccionada.
      await key('Tab', !shift);
      const r = await state();
      ok(r.foco === 'ind-tab-manufactura', `${url} ${nombre}: la reentrada cae en la seleccionada`, r);
    }
  }
  console.log(`consola: ${JSON.stringify(b.consoleErrors)}\nfallas: ${fails}`);
} finally { await b.close(); }
