#!/usr/bin/env python3
"""Quebra dados/kpis.json em um arquivo por posicao.

Na web o servidor nao pode segurar 16 MB de indicadores na memoria: cada posicao
vira um arquivo servido como estatico, e a tela busca so o do jogador aberto.
"""
import json
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
DADOS = os.path.join(AQUI, "dados")


def main():
    with open(os.path.join(DADOS, "kpis.json"), encoding="utf-8") as fh:
        base = json.load(fh)
    with open(os.path.join(DADOS, "jogadores.json"), encoding="utf-8") as fh:
        jogadores = json.load(fh)["jogadores"]

    # primary_key -> posicao
    pos_de = {}
    for j in jogadores:
        pos_de[f"{j['n']} - {j.get('t','')} - {j.get('l','')}"] = j["p"]

    saida = os.path.join(DADOS, "kpis")
    os.makedirs(saida, exist_ok=True)
    por_pos, sem_pos = {}, 0
    for pk, linhas in base["jogadores"].items():
        p = pos_de.get(pk)
        if not p:
            sem_pos += 1
            continue
        por_pos.setdefault(p, {})[pk] = linhas

    for p, mapa in por_pos.items():
        caminho = os.path.join(saida, f"{p}.json")
        with open(caminho, "w", encoding="utf-8") as fh:
            json.dump({"periodo": base.get("periodo", ""), "kpis": base["kpis"],
                       "jogadores": mapa}, fh, ensure_ascii=False, separators=(",", ":"))
        mb = os.path.getsize(caminho) / 1024 / 1024
        print(f"  {p:4s} {len(mapa):6d} jogadores  {mb:5.1f} MB")
    print(f"{sem_pos} sem posicao correspondente")


if __name__ == "__main__":
    main()
