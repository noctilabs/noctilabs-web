import os
D = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'resto')
s = open(os.path.join(D, 'b8.mjs'), encoding='utf-8').read()
pairs = [
    ("// B8 (escenario CDP): formulario de Hablemos, ES y EN, sin JS y con JS.",
     "// B8 v2 (gate 002, pasada 2 #5): formulario de Hablemos, ES y EN, sin JS y con JS. Deshabilitado = :disabled\n// (el fieldset entero), y un intento de editar el mensaje mientras envía no cambia los valores."),
    ("const first = { text: btn.textContent, disabled: btn.disabled, live:",
     "const first = { text: btn.textContent, disabled: btn.matches(':disabled') && [...f.querySelectorAll('input, select, textarea')].every((c) => c.matches(':disabled')), live:"),
    ("`${lang}: «${st.text}» sincrónico, botón deshabilitado, doble submit ignorado`);",
     "`${lang}: «${st.text}» sincrónico, botón y campos :disabled, doble submit ignorado`);\n    await typeIn('#cf-message', ' editado');\n    ok(await b.eval(`document.querySelector('#cf-message').value === 'Hola'`), `${lang}: escribir en el mensaje mientras envía no cambia el valor`);"),
    ("disabled: document.querySelector('form button[type=submit]').disabled,",
     "disabled: [...document.querySelectorAll('form button[type=submit], form input, form select, form textarea')].some((c) => c.matches(':disabled')),"),
    ("`${lang}: estado error con el mail, botón habilitado, valores conservados, en región aria-live polite`",
     "`${lang}: estado error con el mail, botón y campos habilitados, valores conservados, en región aria-live polite`"),
]
for a, b in pairs:
    assert s.count(a) == 1, (a[:60], s.count(a))
    s = s.replace(a, b)
open(os.path.join(D, 'b8-v2.mjs'), 'w', encoding='utf-8').write(s)
print('ok b8-v2.mjs')
