#!/bin/bash
for p in 5090 5091; do
  pid=$(lsof -nP -iTCP:$p -sTCP:LISTEN -t 2>/dev/null | head -1)
  [ -n "$pid" ] && kill "$pid" && echo "  :$p parado" || echo "  :$p já estava desligado"
done
