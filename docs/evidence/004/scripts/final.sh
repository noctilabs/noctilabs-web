#!/bin/bash
# Pasada final de la evidencia 004: variantes de build desde el commit de código (árbol limpio) y todos los criterios.
E=$(cd "$(dirname "$0")" && pwd)
R=/c/Users/adria/nw-wt/formulario
RW=C:/Users/adria/nw-wt/formulario
W() { cygpath -w "$1"; }
F="$E/final"
rm -rf "$F" && mkdir -p "$F" "$E/capturas"
rm -f "$E"/capturas/*.png
log() { echo "$(date -u +%FT%TZ) $*" | tee -a "$F/pasos.log"; }

log "builds (commit $(git -C $R rev-parse --short HEAD))"
bash "$E/builds.sh" > "$F/builds.txt" 2>&1 || { log "builds.sh falló"; exit 1; }

# astro preview cachea la lista de archivos al arrancar: se reinicia sobre el dist/ nuevo.
PID=$(netstat -ano | grep 'LISTENING' | grep ':4952 ' | awk '{print $5}' | head -1)
[ -n "$PID" ] && taskkill //PID $PID //F > /dev/null
(cd "$R" && npx astro preview --port 4952 > "$E/preview-4952.log" 2>&1 &)
for i in $(seq 1 50); do curl -s -o /dev/null http://localhost:4952/ && break; sleep 0.2; done
log "preview 4952 $(curl -s -o /dev/null -w '%{http_code}' http://localhost:4952/)"

cd "$E"
run() { local name=$1; shift; "$@" > "$F/$name.txt" 2>&1; log "$name salida $?"; }
run d1 node d1.mjs builds
run d2 node d2.mjs http://localhost:4952 9383
run d3 node d3.mjs http://localhost:4952 9385
run d4 node d4.mjs $RW "$(W $E/dist-adversarial)" 9386
run d5 node d5.mjs $RW
(cd "$E/routing" && node d6.mjs $RW > "$F/d6-routing.txt" 2>&1; log "d6-routing salida $?")
(cd "$R" && sed 's#/en/insights/no-context-no-intelligence/#/en/insights/slug-inexistente/#g' vercel.json > "$E/vercel-roto.json"
 { echo "### check-redirects con el vercel.json real (dist/ de la base)"; node scripts/check-redirects.mjs --manifest "$(W $F/d6-manifest-real.json)"; echo "salida $?"; echo;
   echo "### check-redirects con vercel-roto.json (copia con un slug inexistente; sha256 $(sha256sum $E/vercel-roto.json | cut -c1-64))"; node scripts/check-redirects.mjs --config "$(W $E/vercel-roto.json)" --manifest "$(W $F/d6-manifest-roto.json)"; echo "salida $?"; } > "$F/d6-check-redirects.txt" 2>&1)
log "d6-check-redirects hecho"
run d7 node d7.mjs $RW "$(W $E/dist-adversarial)" 9387
run d8 node d8.mjs $RW 9388
run publish-scan node publish-scan.mjs $RW
log "d9 (rama)"
bash "$E/reg/run-d9.sh" > "$F/d9-run.txt" 2>&1
log "d9 (línea de base 10847c1)"
bash "$E/reg-base/run-d9.sh" > "$F/d9-base-run.txt" 2>&1
node "$E/d9-comparar.mjs" "$E/reg/salidas" "$E/reg-base/salidas" > "$F/d9-comparacion.txt" 2>&1
node "$E/d9-clasificar.mjs" "$E/reg/salidas" > "$F/d9-clasificacion.txt" 2>&1
log FIN
