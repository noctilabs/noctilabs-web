#!/bin/bash
# Variantes de build del spec 004 §4, todas desde el mismo commit y lockfile. La base va al final, así dist/ queda
# con la base. Cada variante deja su log y su manifiesto en builds/.
R=/c/Users/adria/nw-wt/formulario
E=$(cd "$(dirname "$0")" && pwd)
W() { cygpath -w "$1"; }
SNAP=$(W "$E/snapshot/sanity-snapshot.json")
ADV=$(W "$E/snapshot/adversarial.json")
KEY=clave-de-prueba-local
B="$E/builds"
rm -rf "$B" "$E/dist-adversarial" && mkdir -p "$B"
[ "$(git -C $R branch --show-current)" = fase4-formulario ] || exit 1
[ -z "$(git -C $R status --porcelain)" ] || { echo "árbol sucio"; exit 1; }

# run <variante> <outDir|-> <comando> [VAR=valor ...]
run() {
  local v=$1 out=$2 cmd=$3; shift 3
  local t0=$(date -u +%FT%TZ)
  (cd "$R" && env -u PUBLISH -u VERCEL_ENV -u LEGAL_FIXTURE -u INSIGHTS_FIXTURE -u PUBLIC_WEB3FORMS_KEY "$@" bash -c "$cmd") > "$B/$v.log" 2>&1
  local code=$?
  echo "inicio $t0 · fin $(date -u +%FT%TZ) · comando: $* $cmd · salida $code" >> "$B/$v.log"
  node "$E/manifest.mjs" "$v" "$(W $R)" "$out" "$code" "$(W $B/$v.log)" "$(W $B/$v.json)" "$@"
}

run publish-falla-marcadores - "npm run build:publish" PUBLIC_WEB3FORMS_KEY=$KEY
run publish-falla-legal-fixture - "npm run build:publish" PUBLIC_WEB3FORMS_KEY=$KEY LEGAL_FIXTURE=1
run publish-falla-insights-fixture - "npm run build:publish" PUBLIC_WEB3FORMS_KEY=$KEY INSIGHTS_FIXTURE=$SNAP
run publish-falla-sin-clave - "npm run build:publish"
run prod-bloqueada - "npm run build" VERCEL_ENV=production INSIGHTS_FIXTURE=$SNAP PUBLIC_WEB3FORMS_KEY=$KEY
run adversarial "$(W $E/dist-adversarial)" "npx astro build --outDir '$(W $E/dist-adversarial)'" INSIGHTS_FIXTURE=$ADV PUBLIC_WEB3FORMS_KEY=$KEY
run prod-prueba "$(W $R/dist-fixture)" "npm run build" VERCEL_ENV=production LEGAL_FIXTURE=1 INSIGHTS_FIXTURE=$SNAP PUBLIC_WEB3FORMS_KEY=$KEY
run base "$(W $R/dist)" "npm run build" INSIGHTS_FIXTURE=$SNAP PUBLIC_WEB3FORMS_KEY=$KEY
(cd "$R" && npx vitest run) > "$B/s1-tests.log" 2>&1; echo "vitest salida $?" >> "$B/s1-tests.log"
echo FIN
