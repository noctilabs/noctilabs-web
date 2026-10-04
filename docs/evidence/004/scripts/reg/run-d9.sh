#!/bin/bash
# D9: regresión de A7, B4, B5, B8, B9, B10 y B15 con los scripts de la fase 2 sin cambios de lógica, solo
# reapuntados (dist del worktree, preview en localhost:4952, CDP 9389) y con el driver de ev004, que intercepta
# todo pedido a Web3Forms y a /_vercel/insights. C3, C5 y C8 son de la fase 3 (no integrada en esta rama).
D=$(cd "$(dirname "$0")" && pwd)
O="$D/salidas"
rm -rf "$O" && mkdir -p "$O" "$D/b15out"
run() { local name=$1; shift; local t0=$(date +%s); "$@" > "$O/$name.txt" 2>&1; local c=$?; echo "$name exit $c ($(( $(date +%s) - t0 )) s)" | tee -a "$O/resumen.log"; }
cd "$D"
run a7 node a7.mjs
cd "$D/home"
for l in es en; do
  run b4-$l node b4.mjs $l
  run b5-$l node b5.mjs $l
done
for l in es en; do run b4-desc-$l node b4-desc.mjs $l; done
cd "$D/resto"
run b8-v2 node b8-v2.mjs
run b8-v2-consentimiento node b8-v2-consentimiento.mjs
cd "$D"
run b9-b11 node b9-b11.mjs C:/Users/adria/nw-wt/formulario/dist
run b10 node b10.mjs
run b15-teclado node b15-teclado.mjs
run b15-tapado node b15-tapado.mjs
run b15-reflow-v2 node b15-reflow-v2.mjs
run b15-zoom-v2 node b15-zoom-v2.mjs
run b15-ax node b15-ax.mjs
echo FIN | tee -a "$O/resumen.log"
