#!/usr/bin/env python3
"""O resolvedor de marcador, comum as paginas montadas a mao.

## Por que existe

Tres paginas do estudo sao escritas a mao e NAO sao parte de analise: a pagina de decisoes
(gerar_decisoes.py), as regras de leitura (gerar_regras.py) e a secao de fisico (gerar_fisico.py).
As tres tem o mesmo contrato: o texto e da casa, o numero vem do `<ID>_numeros.json` que o portao
confere, e marcador que nao existe PARA o gerador em vez de virar espaco em branco.

Ate 21/09 esse resolvedor vivia dentro do gerar_decisoes.py. Com a terceira pagina pedindo a
mesma conta, copiar seria criar tres versoes que divergem em silencio — e divergir aqui quer
dizer numero publicado sem conferencia.

## O que ele NAO faz

Nao formata numero: o `<ID>_numeros.json` ja guarda o texto final (`+0,33`, `1,75`, `82,4`), com
virgula e sinal decididos por quem rodou a analise. Float solto e formatado com uma casa so por
compatibilidade com o que existia antes.
"""
import json
import os
import re

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDO = os.path.dirname(AQUI)
R = os.path.join(ESTUDO, "resultados")

MARCADOR = re.compile(r"\{([AJT]\d\d)\.([a-zA-Z0-9_]+)\}")


def numeros_da_parte(pid, cache):
    if pid not in cache:
        caminho = os.path.join(R, f"{pid}_numeros.json")
        if not os.path.exists(caminho):
            cache[pid] = {}
        else:
            d = json.load(open(caminho, encoding="utf-8"))
            cache[pid] = d.get("numeros", d)
    return cache[pid]


def selo_da_conclusao(cid, cache):
    """A forca da conclusao de origem. Linha sem selo sai como '—', nunca como firme."""
    if not cid:
        return None
    pid = cid.split("-")[0]
    if pid not in cache:
        caminho = os.path.join(R, f"{pid}.json")
        cache[pid] = json.load(open(caminho, encoding="utf-8")) if os.path.exists(caminho) else {}
    for c in (cache[pid].get("conclusoes") or []):
        if c.get("id") == cid:
            return c.get("confianca")
    return None


def trocar(texto, cache, onde, faltando):
    """Resolve {PARTE.marcador}. Marcador que nao existe e ERRO, nao espaco em branco."""
    def um(m):
        pid, chave = m.group(1), m.group(2)
        n = numeros_da_parte(pid, cache)
        if chave not in n:
            faltando.append(f"{onde}: {{{pid}.{chave}}} não existe em {pid}_numeros.json")
            return m.group(0)
        v = n[chave]
        if isinstance(v, float):
            return f"{v:.1f}".replace(".", ",") if v != int(v) else str(int(v))
        return str(v)
    return MARCADOR.sub(um, texto or "")
