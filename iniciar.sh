#!/bin/bash
# Sobe o app Santa Cruz 2027 na porta 5090 (independente do hub Botafogo :5555)
cd "$(dirname "$0")" || exit 1
PY=/Library/Frameworks/Python.framework/Versions/3.13/bin/python3
[ -x "$PY" ] || PY=python3

PID=$(lsof -nP -iTCP:5090 -sTCP:LISTEN -t 2>/dev/null | head -1)
if [ -n "$PID" ]; then
  echo "porta 5090 ja estava ocupada (pid $PID) — derrubando"
  kill "$PID" 2>/dev/null; sleep 1
fi

[ -f dados/jogadores.json ] || "$PY" preparar_base.py ago26
[ -d dados/kpis ] || { "$PY" preparar_kpis.py ago26 && "$PY" dividir_kpis.py; }

echo "abrindo http://localhost:5090"
( sleep 1.5 && open http://localhost:5090 ) &
exec "$PY" app.py
