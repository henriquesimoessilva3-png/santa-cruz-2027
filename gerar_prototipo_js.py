#!/usr/bin/env python3
"""Escreve static/prototipo.js — o `dados/prototipo.json` inteiro, do jeito que a aba le.

Por que um arquivo gerado e nao um `fetch` do JSON: a aba Prototipo nao tem uma tela so,
tem dezesseis, e cada uma le um pedaco diferente do mesmo arquivo. Buscar o JSON por rede
significaria ou dezesseis idas ao servidor ou uma ida com toda a tela esperando por ela —
e, nos dois casos, uma aba que abre vazia quando o Flask estiver fora do ar. Como
`sb_clubes.js`, o dado entra pela mesma porta do resto do front: uma tag `<script>` antes
do `app.js`, e quando `ptRender()` roda o `PROTO` ja esta na memoria.

O que NAO muda com isso: continua valendo a regra da casa de que **o dado e a fonte e o
texto e consequencia**. Este script nao arredonda, nao renomeia chave, nao completa buraco
e nao escolhe o que entra: ele copia o JSON como esta. Se um numero da tela estiver errado,
o erro esta no `gerar_prototipo.py` ou na base — nunca aqui no meio. E por isso que a copia
e integral mesmo custando ~1 MB: filtrar chave aqui criaria uma segunda versao da verdade,
e um dia as duas discordariam.

O arquivo sai minificado (`separators` sem espaco) porque o JSON ja vem assim do
`gerar_prototipo.py`; identar aqui dobraria o tamanho para enfeitar um arquivo que ninguem
le a mao — e o cabecalho diz, em letras grandes, que ninguem deve.

Rode depois de rodar o `gerar_prototipo.py`:
    python3 gerar_prototipo_js.py
"""
import json
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
ENTRADA = os.path.join(AQUI, "dados", "prototipo.json")
SAIDA = os.path.join(AQUI, "static", "prototipo.js")

CABECALHO = """/* GERADO POR gerar_prototipo_js.py — NAO EDITE A MAO.

   Copia integral de dados/prototipo.json. Qualquer numero que apareca na aba Prototipo
   sai daqui, e daqui sai apenas o que foi MEDIDO pelo gerar_prototipo.py: nao ha nesta
   linha nenhum valor digitado, arredondado ou ajustado por pessoa.

   Para mudar um numero da tela, mude a base, rode `python3 gerar_prototipo.py` e depois
   `python3 gerar_prototipo_js.py`. Editar este arquivo a mao quebra a unica garantia que
   a aba oferece: a de que a tela e consequencia do dado.

   Gerado em: %s (campo `gerado_em` do proprio JSON)
   Etapas presentes: %s
   Bytes do JSON de origem: %s
*/
"""


def main():
    if not os.path.exists(ENTRADA):
        sys.exit("nao achei %s — rode antes o gerar_prototipo.py" % ENTRADA)

    with open(ENTRADA, encoding="utf-8") as f:
        dado = json.load(f)

    # As duas coisas que a aba assume existir. Falhar aqui e melhor do que a tela abrir
    # sem tarja de conferencia (`gerado_em`) ou sem baseline do dinheiro ao lado das
    # propostas (`controles_obrigatorios`) — os dois sao obrigatorios por especificacao.
    for chave in ("gerado_em", "controles_obrigatorios"):
        if chave not in dado:
            sys.exit("o JSON nao traz `%s`, e a aba depende dele" % chave)

    etapas = sorted(
        (int(k.split("_")[1]) for k in dado if k.startswith("etapa_")),
    )
    faltando = [n for n in range(16) if n not in etapas]

    corpo = json.dumps(dado, ensure_ascii=False, separators=(",", ":"))
    cabecalho = CABECALHO % (
        dado["gerado_em"],
        ", ".join(str(n) for n in etapas) + (
            "  (SEM: %s — a aba escreve a ausencia na tela)" % ", ".join(str(n) for n in faltando)
            if faltando else ""
        ),
        os.path.getsize(ENTRADA),
    )

    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, "w", encoding="utf-8") as f:
        f.write(cabecalho)
        f.write("const PROTO = ")
        f.write(corpo)
        f.write(";\n")

    print("escrito %s — %.0f KB, %d etapas%s" % (
        SAIDA, os.path.getsize(SAIDA) / 1024, len(etapas),
        "" if not faltando else " (faltam %s)" % faltando,
    ))


if __name__ == "__main__":
    main()
