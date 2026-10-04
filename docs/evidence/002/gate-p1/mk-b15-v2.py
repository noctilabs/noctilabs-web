import os
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def derive(src, dst, pairs):
    s = open(os.path.join(D, src), encoding='utf-8').read()
    for a, b in pairs:
        assert s.count(a) == 1, (src, a[:60], s.count(a))
        s = s.replace(a, b)
    open(os.path.join(D, dst), 'w', encoding='utf-8').write(s)
    print('ok', dst)


IND = "['retail', 'manufactura', 'consumo', 'salud', 'servicios']"

derive('b15-reflow.mjs', 'b15-reflow-v2.mjs', [
    ("// B15 reflow a 320 CSS px:", "// B15 reflow a 320 CSS px (v2, gate 002 hallazgo 9: las cinco industrias del home y recorte por ancestros):"),
    ("const states = r === '/' || r === '/en/' ? ['con', 'sin'] : [null];",
     "const states = r === '/' || r === '/en/' ? ['con', 'sin', ..." + IND + ".map((i) => 'ind:' + i)] : [null];"),
    ("if (st) { await b.eval(`document.querySelector('[data-ba-set=${st}]').click()`); await b.sleep(1400); }",
     "if (st?.startsWith('ind:')) { await b.eval(`document.getElementById('ind-tab-${st.slice(4)}').click()`); await b.sleep(400); }\n      else if (st) { await b.eval(`document.querySelector('[data-ba-set=${st}]').click()`); await b.sleep(1400); }"),
    ("${st ? ' (antes/después «' + st + '»)' : ''}", "${st ? (st.startsWith('ind:') ? ' (industria «' + st.slice(4) + '»)' : ' (antes/después «' + st + '»)') : ''}"),
    ("if (st !== 'sin') {", "if (st === null || st === 'con') {"),
])

derive('b15-zoom.mjs', 'b15-zoom-v2.mjs', [
    ("// B15 zoom del navegador (WCAG 1.4.4):", "// B15 zoom del navegador (v2, gate 002 hallazgo 9: layout medido con cada una de las cinco industrias del home y recorte por ancestros) (WCAG 1.4.4):"),
    ("      const L = await b.eval(LAYOUT);\n      const layoutOk = L.scrollW <= W && !L.desborde.length && !L.recorte.length && !L.superpuestos.length;",
     "      const L = await b.eval(LAYOUT);\n"
     "      // En el home, el layout se mide además con cada industria activa (las tabs cambian el panel visible).\n"
     "      if (r === '/' || r === '/en/') for (const ind of " + IND + ") {\n"
     "        await b.eval(`document.getElementById('ind-tab-${ind}').click()`); await b.sleep(250);\n"
     "        const Li = await b.eval(LAYOUT);\n"
     "        L.scrollW = Math.max(L.scrollW, Li.scrollW);\n"
     "        for (const k of ['desborde', 'recorte', 'superpuestos']) L[k].push(...Li[k].map((x) => `[${ind}] ${x}`));\n"
     "      }\n"
     "      if (r === '/' || r === '/en/') { await b.eval(`document.getElementById('ind-tab-retail').click()`); await b.eval('scrollTo(0,0)'); await b.sleep(100); }\n"
     "      const layoutOk = L.scrollW <= W && !L.desborde.length && !L.recorte.length && !L.superpuestos.length;"),
])
