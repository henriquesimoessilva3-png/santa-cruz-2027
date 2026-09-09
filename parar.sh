#!/bin/bash
PID=$(lsof -nP -iTCP:5090 -sTCP:LISTEN -t 2>/dev/null | head -1)
[ -n "$PID" ] && kill "$PID" && echo "app parado (pid $PID)" || echo "nada rodando na 5090"
