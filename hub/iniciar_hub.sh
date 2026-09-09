#!/bin/bash
# Sobe o portal do Santa Cruz (:5091) e o app de elenco (:5090)
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
PY=/Library/Frameworks/Python.framework/Versions/3.13/bin/python3
[ -x "$PY" ] || PY=python3

subir() {   # porta, pasta, script, nome
  local pid=$(lsof -nP -iTCP:$1 -sTCP:LISTEN -t 2>/dev/null | head -1)
  if [ -n "$pid" ]; then echo "  :$1 $4 — já estava no ar"; return; fi
  ( cd "$2" && nohup "$PY" "$3" > "/tmp/sc_$1.log" 2>&1 & )
  echo "  :$1 $4 — subindo"
}

echo "Santa Cruz · portal"
subir 5090 "$RAIZ" app.py "Montagem de Elenco"
subir 5091 "$RAIZ/hub" hub_santacruz.py "Portal"
sleep 2
echo "abrindo http://localhost:5091"
open http://localhost:5091
