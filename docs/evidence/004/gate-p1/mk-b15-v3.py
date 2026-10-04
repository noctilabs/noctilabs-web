# B15 v3 (gate de implementación 004, pasada 1, hallazgo 2): reapunta B15 reflow/zoom al contrato de la fase 4.
#  - Excluye del desborde SOLO el honeypot (fuera de pantalla por §2.3) y cuenta cuántas entradas excluyó.
#  - El formulario operable espera 5 errores (los 4 de antes + el consentimiento, §2.2) y foco en Nombre, y lista los ids.
#  - La preparación de capturas usa el atributo style del header (permitido por style-src-attr), no un <style> inyectado,
#    que la CSP bloquea; al final se informan los errores CSP de consola.
import os
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DROP = """const dropHoneypot = (L) => {
  const antes = L.desborde.length;
  L.desborde = L.desborde.filter((x) => !(x.startsWith('div.hp ') || /^input «» -99\\d\\d\\.\\.-99\\d\\d$/.test(x)));
  return antes - L.desborde.length;
};
"""
HDR_ON = "await b.eval(`document.querySelector('.site-header').style.setProperty('position', 'relative', 'important')`);"
HDR_OFF = "await b.eval(`document.querySelector('.site-header').style.removeProperty('position')`);"
CSP_END = "  console.log(`errores CSP en consola: ${b.consoleErrors.filter((e) => /Content Security Policy/i.test(e)).length}`);\n"


def derive(src, dst, pairs):
    s = open(os.path.join(D, src), encoding='utf-8').read()
    for a, b in pairs:
        assert s.count(a) >= 1, (src, a[:70])
        s = s.replace(a, b)
    open(os.path.join(D, dst), 'w', encoding='utf-8').write(s)
    print('ok', dst)


STYLE_ON = "await b.eval(`(() => { const s = document.createElement('style'); s.id = '__hh'; s.textContent = '.site-header{position:relative!important}'; document.head.append(s); })()`);"

derive('b15-reflow-v2.mjs', 'b15-reflow-v3.mjs', [
    ("import { LAYOUT } from './layoutcheck.mjs';", "import { LAYOUT } from './layoutcheck.mjs';\n" + DROP),
    ("      const L = await b.eval(LAYOUT);", "      const L = await b.eval(LAYOUT);\n      const hp = dropHoneypot(L);"),
    ("${st ? (st.startsWith('ind:')", "${hp ? ` [honeypot excluido: ${hp}]` : ''}${st ? (st.startsWith('ind:')"),
    (STYLE_ON, HDR_ON),
    ("await b.eval(`document.getElementById('__hh').remove()`);", HDR_OFF),
    ("  console.log(`\\nconsola:", CSP_END + "  console.log(`\\nconsola:"),
])

derive('b15-zoom-v2.mjs', 'b15-zoom-v3.mjs', [
    ("import { LAYOUT } from './layoutcheck.mjs';", "import { LAYOUT } from './layoutcheck.mjs';\n" + DROP),
    ("      const L = await b.eval(LAYOUT);\n", "      const L = await b.eval(LAYOUT);\n      let hp = dropHoneypot(L);\n"),
    ("        const Li = await b.eval(LAYOUT);", "        const Li = await b.eval(LAYOUT);\n        hp += dropHoneypot(Li);"),
    ("const o = await b.eval(`(() => { const f = document.querySelector('form'); f.requestSubmit(); return document.querySelectorAll('form [aria-invalid=\"true\"]').length === 4 && document.activeElement.id === 'cf-name'; })()`);\n        oper = ` · formulario ${o ? 'operable (4 errores, foco en Nombre)' : 'NO operable'}`; if (!o) fails++;",
     "const fo = await b.eval(`(() => { const f = document.querySelector('form'); f.requestSubmit(); return { ids: [...document.querySelectorAll('form [aria-invalid=\"true\"]')].map((e) => e.id), foco: document.activeElement.id }; })()`);\n"
     "        const o = fo.ids.length === 5 && fo.ids.join() === 'cf-name,cf-email,cf-organization,cf-message,cf-consent' && fo.foco === 'cf-name';\n"
     "        oper = ` · formulario ${o ? 'operable' : 'NO operable'} (errores ${JSON.stringify(fo.ids)}, foco ${fo.foco})`; if (!o) fails++;"),
    ("${notas.length ? ' · ' + notas.join('; ') : ''}", "${notas.length ? ' · ' + notas.join('; ') : ''}${hp ? ` · honeypot excluido: ${hp}` : ''}"),
    (STYLE_ON, HDR_ON),
    ("  console.log(`\\nconsola:", CSP_END + "  console.log(`\\nconsola:"),
])
