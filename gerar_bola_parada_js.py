#!/usr/bin/env python3
"""Escreve static/bola_parada_dados.js — o estudo "bola parada por treinador" do jeito que a aba lê.

No molde do `gerar_pontos_js.py`: o dado entra por uma tag `<script>` antes do `app.js`, para a
aba não abrir vazia com o Flask fora do ar, e é cópia INTEGRAL do JSON. Nada é arredondado,
renomeado ou escolhido aqui; se um número da tela estiver errado, o erro está no estudo.

O estudo mora fora deste repositório, em
`fut/BOTA/Analytics/Estudo - Bola Parada por Treinador/` (extração da Sofascore + montagem +
Excel com as mesmas contas). Uma cópia do JSON fica em `dados/bola_parada.json`, para o site
não depender daquela pasta existir.

Rode depois do `montar_estudo.py` de lá:
    python3 gerar_bola_parada_js.py
"""
import json
import os
import shutil
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDO = os.path.join(AQUI, "..", "fut", "BOTA", "Analytics", "Estudo - Bola Parada por Treinador",
                      "saida", "bola_parada_por_treinador.json")
COPIA = os.path.join(AQUI, "dados", "bola_parada.json")
SAIDA = os.path.join(AQUI, "static", "bola_parada_dados.js")

CHAVES_TRABALHO = ("tec", "time", "comp", "jogos", "primeiro", "ultimo", "media_liga", "gp", "gc",
                   "pro", "sof", "pen", "pen_sof", "gc_bp", "esc_fav", "esc_contra",
                   "xg_bp_pro", "xg_bp_sof", "xg_n", "banco_outros")

CABECALHO = """/* GERADO POR gerar_bola_parada_js.py — NAO EDITE A MAO.

   Copia integral de dados/bola_parada.json (aba Bola parada por treinador). So contagens por
   trabalho (treinador + time + competicao); as taxas sao calculadas na tela, em
   static/bola_parada.js.

   Para mudar um numero: rode o montar_estudo.py do estudo e depois `python3 gerar_bola_parada_js.py`.

   Gerado em: %s · fonte: %s
   Competicoes: %s
   Trabalhos: %d
*/
"""


def main():
    origem = ESTUDO if os.path.exists(ESTUDO) else COPIA
    if not os.path.exists(origem):
        sys.exit("nao achei %s nem %s — rode antes o montar_estudo.py" % (ESTUDO, COPIA))
    with open(origem, encoding="utf-8") as f:
        dado = json.load(f)

    for chave in ("gerado_em", "fonte", "competicoes", "trabalhos", "gols_contra", "reatribuidos", "piloto"):
        if chave not in dado:
            sys.exit("o JSON nao traz `%s`, e a aba depende dele" % chave)
    if not dado["trabalhos"]:
        sys.exit("o JSON veio sem nenhum trabalho")
    for t in dado["trabalhos"]:
        falta = [c for c in CHAVES_TRABALHO if c not in t]
        if falta:
            sys.exit("trabalho %s | %s sem %s" % (t.get("tec"), t.get("time"), ", ".join(falta)))
    comps = {c["comp"] for c in dado["competicoes"]}
    fora = {t["comp"] for t in dado["trabalhos"]} - comps
    if fora:
        sys.exit("trabalho de competicao sem media da liga: %s" % ", ".join(sorted(fora)))

    if origem != COPIA:
        shutil.copy2(origem, COPIA)
    cab = CABECALHO % (dado["gerado_em"], dado["fonte"],
                       ", ".join("%s (%d jogos)" % (c["comp"], c["jogos"]) for c in dado["competicoes"]),
                       len(dado["trabalhos"]))
    with open(SAIDA, "w", encoding="utf-8") as f:
        f.write(cab)
        f.write("const BOLA_PARADA = ")
        f.write(json.dumps(dado, ensure_ascii=False, separators=(",", ":")))
        f.write(";\n")
    print("escrito %s — %.0f KB, %d trabalhos, %d competicoes" % (
        SAIDA, os.path.getsize(SAIDA) / 1024, len(dado["trabalhos"]), len(comps)))


if __name__ == "__main__":
    main()
