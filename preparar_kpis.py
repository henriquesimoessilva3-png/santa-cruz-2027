#!/usr/bin/env python3
"""Gera dados/kpis.json: os indicadores que o Ranking mostra na ficha do jogador.

Le kpis_detail_<periodo>.json (que ja traz valor, media e maximo da coorte de cada
KPI) e guarda so os indicadores categorizados — os mesmos que entram no overall.
"""
import json
import os
import sys

BASE_RANKING = ("/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/"
                "fut/BOTA/Analytics/Portal Ranking/output")
AQUI = os.path.dirname(os.path.abspath(__file__))

CATEGORIAS = ("DEFENSE", "OFFENSIVE", "PASS", "DGP")

# nome no Wyscout -> rotulo curto em portugues (o que aparece na ficha)
ROTULO = {
    "Duels per 90": "Duelos /90", "Duels won per 90": "Duelos ganhos /90",
    "Duels won, %": "Duelos %", "Defensive duels won per 90": "Duelos def. /90",
    "Defensive duels won, %": "Duelos def. %", "Aerial duels won per 90": "Aéreos ganhos /90",
    "Aerial duels won, %": "Aéreos %", "PAdj Interceptions": "Interceptações (PAdj)",
    "Yellow cards per 90": "Amarelos /90",
    "Successful attacking actions per 90": "Ações ofensivas /90",
    "Shots per 90": "Remates /90", "Shots on target, %": "Remates no alvo %",
    "Accurate shots on target": "Remates no alvo", "Successful dribbles per 90": "Dribles certos /90",
    "Successful dribbles, %": "Dribles %", "Ofensive duels won per 90": "Duelos ofens. /90",
    "Touches in box per 90": "Toques na área /90", "Progressive runs per 90": "Corridas prog. /90",
    "Accelerations per 90": "Acelerações /90", "Received passes per 90": "Passes recebidos /90",
    "Deep completions per 90": "Deep completions /90", "Fouls suffered per 90": "Faltas sofridas /90",
    "Passes per 90": "Passes /90", "Accurate passes": "Passes certos",
    "Accurate passes, %": "Passes certos %", "Accurate forward passes": "Passes à frente",
    "Accurate long passes, %": "Passes longos %", "Accurate smart passes": "Smart passes",
    "Accurate through passes": "Passes em profundidade", "Accurate crosses": "Cruzamentos certos",
    "Accurate crosses, %": "Cruzamentos %", "Accurate passes to final third": "Passes ao último terço",
    "Accurate passes to penalty area": "Passes à área",
    "Accurate progressive passes": "Passes progressivos",
    "Goals per 90": "Gols /90", "Non-penalty goals per 90": "Gols s/ pênalti /90",
    "xG per 90": "xG /90", "Goal conversion, %": "Conversão %",
    "Assists per 90": "Assistências /90", "xA per 90": "xA /90",
    "Second assists per 90": "2ª assistência /90", "Third assists per 90": "3ª assistência /90",
}
GRUPO_PT = {"DEFENSE": "Defesa", "OFFENSIVE": "Ataque", "PASS": "Passe", "DGP": "Decisão (DGP)"}


def main(periodo="ago26"):
    origem = os.path.join(BASE_RANKING, f"kpis_detail_{periodo}.json")
    if not os.path.exists(origem):
        sys.exit(f"nao achei {origem}")

    print(f"lendo {origem} (arquivo grande, ~1 min) ...")
    with open(origem, encoding="utf-8") as fh:
        bruto = json.load(fh)

    nomes, indice = [], {}
    def id_kpi(cat, nome):
        chave = (cat, nome)
        if chave not in indice:
            indice[chave] = len(nomes)
            nomes.append([GRUPO_PT[cat], ROTULO.get(nome, nome)])
        return indice[chave]

    def num(v, casas=2):
        try:
            return round(float(v), casas)
        except (TypeError, ValueError):
            return None

    saida = {}
    for pk, lista in bruto.items():
        linhas = []
        for k in lista:
            cat = k.get("kpi_category")
            if cat not in CATEGORIAS:
                continue
            v = num(k.get("kpi_value"))
            if v is None:
                continue
            linhas.append([id_kpi(cat, k["kpi"]), v,
                           num(k.get("avg_kpi_value")), num(k.get("max_kpi_value"))])
        if linhas:
            saida[pk] = linhas

    destino = os.path.join(AQUI, "dados", "kpis.json")
    with open(destino, "w", encoding="utf-8") as fh:
        json.dump({"periodo": periodo, "kpis": nomes, "jogadores": saida},
                  fh, ensure_ascii=False, separators=(",", ":"))

    mb = os.path.getsize(destino) / 1024 / 1024
    print(f"ok: {len(saida)} jogadores · {len(nomes)} indicadores -> {destino} ({mb:.1f} MB)")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "ago26")
