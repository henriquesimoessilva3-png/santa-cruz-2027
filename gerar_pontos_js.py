#!/usr/bin/env python3
"""Escreve static/pontos.js — o `dados/pontos.json` inteiro, do jeito que a aba Pontos lê.

No molde do `gerar_prototipo_js.py`, e pelo mesmo motivo: a aba tem dezesseis telas, cada
uma lê um pedaço diferente do mesmo arquivo, e buscar o JSON por rede faria a aba abrir
vazia com o Flask fora do ar. O dado entra por uma tag `<script>` antes do `app.js`.

A regra que vale aqui é a da casa: **o dado é a fonte e o texto é consequência**. Este
script não arredonda, não renomeia chave, não completa buraco e não escolhe o que entra —
copia o JSON como está. Se um número da tela estiver errado, o erro está no
`gerar_pontos.py` ou na base, nunca aqui. Por isso a cópia é integral.

Além das duas chaves que o Protótipo exige (`gerado_em`, `controles_obrigatorios`), esta aba
exige `faixas` (a régua e os rótulos que a tela usa para trocar os textos) e as dezesseis
etapas: falhar aqui é melhor do que a aba abrir com uma etapa em branco sem motivo escrito.
Etapa ausente só passa se estiver no JSON com `estado_nesta_aba == "ausente_com_motivo"`.

Rode depois de rodar o `gerar_pontos.py`:
    python3 gerar_pontos_js.py
"""
import json
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
ENTRADA = os.path.join(AQUI, "dados", "pontos.json")
SAIDA = os.path.join(AQUI, "static", "pontos.js")

CABECALHO = """/* GERADO POR gerar_pontos_js.py — NAO EDITE A MAO.

   Copia integral de dados/pontos.json (aba Pontos: as dezesseis etapas do Prototipo com
   faixas de aproveitamento alta/media/baixa). Nenhum valor aqui foi digitado, arredondado
   ou ajustado por pessoa.

   Para mudar um numero da tela, mude a base, rode `python3 gerar_pontos.py` e depois
   `python3 gerar_pontos_js.py`.

   Gerado em: %s (campo `gerado_em` do proprio JSON)
   Regua: %s
   Etapas: %s
   Bytes do JSON de origem: %s
*/
"""


def main():
    if not os.path.exists(ENTRADA):
        sys.exit("nao achei %s — rode antes o gerar_pontos.py" % ENTRADA)
    with open(ENTRADA, encoding="utf-8") as f:
        dado = json.load(f)

    for chave in ("gerado_em", "controles_obrigatorios", "faixas"):
        if chave not in dado:
            sys.exit("o JSON nao traz `%s`, e a aba depende dele" % chave)
    estados = {}
    for n in range(16):
        et = dado.get("etapa_%d" % n)
        if et is None:
            sys.exit("etapa_%d nao esta no JSON — nem como ausente com motivo" % n)
        estados[n] = et.get("estado_nesta_aba")
        if estados[n] is None:
            sys.exit("etapa_%d nao diz o seu estado (completa / adaptada / ausente_com_motivo)" % n)
        if estados[n] == "ausente_com_motivo" and not et.get("motivo"):
            sys.exit("etapa_%d esta ausente sem motivo" % n)

    corpo = json.dumps(dado, ensure_ascii=False, separators=(",", ":"))
    cab = CABECALHO % (
        dado["gerado_em"],
        dado["faixas"]["regra"],
        ", ".join("%d %s" % (n, e) for n, e in estados.items()),
        os.path.getsize(ENTRADA),
    )
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, "w", encoding="utf-8") as f:
        f.write(cab)
        f.write("const PONTOS = ")
        f.write(corpo)
        f.write(";\n")
    print("escrito %s — %.0f KB, 16 etapas (%s)" % (
        SAIDA, os.path.getsize(SAIDA) / 1024,
        ", ".join("%s: %d" % (e, sum(1 for x in estados.values() if x == e))
                  for e in sorted(set(estados.values())))))


if __name__ == "__main__":
    main()
