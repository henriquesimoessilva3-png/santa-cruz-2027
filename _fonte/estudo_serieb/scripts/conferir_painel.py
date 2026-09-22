#!/usr/bin/env python3
"""Quais liga-temporada do painel temporal estao com o rotulo errado, e quem depende delas.

## Por que existe

O `_temporal_photos.json` vem copiado do Portal Ranking, e em 22/09/2026 descobriu-se que o
rotulo `league` de algumas liga-temporada nao corresponde ao elenco que esta dentro: as fotos de
`Peru` em 2024 trazem times equatorianos e em 2025 trazem times paraguaios; `Portugal A` em 2023
traz 74 times onde a mediana da liga e' 18, ou seja, varias divisoes empilhadas sob um rotulo so'.

Isso importa em dois lugares:

1. **A regularidade** (J09) cruza a base com este painel. Jogador de liga-temporada trocada nao
   tem como casar, e por isso some da lista.
2. **O fator de liga** (J08) e' ajustado sobre transferencias cujo lado de origem sai deste
   painel — e o `qz` de cada foto foi normalizado DENTRO de liga+posicao la' na fonte. Se o
   rotulo mistura paises ou divisoes, o percentil daquela liga-temporada ja' nasce errado, e
   nenhum filtro daqui conserta: o J08 consome o qz, nao o recalcula.

Este script NAO conserta nada — o conserto e' no Portal Ranking. Ele declara, de forma
regeneravel, QUAIS liga-temporada estao comprometidas e QUAIS ligas dependem delas, para que a
lista por posicao possa marcar as linhas afetadas em vez de publicar o numero como se fosse
igual aos outros.

## Como classifica

Para cada (liga, temporada) com pelo menos tres temporadas de historico:

- **troca de liga** — 10% ou menos dos times aparecem naquela liga em qualquer outra temporada.
  O elenco e' de outro pais.
- **divisoes misturadas** — o numero de times e' 1,8 vez a mediana da liga ou mais. Varias
  divisoes sob o mesmo rotulo.

O limiar de sobreposicao NAO pode ser alto: acesso e rebaixamento trocam times todo ano, e uma
regua frouxa acusaria liga sadia. Foi medido: a 20% de linhas em times novos, 26 liga-temporada
caem, quase todas por troca normal de elenco.

Uso:
    python3 _fonte/estudo_serieb/scripts/conferir_painel.py
"""
import collections
import csv
import json
import os
import statistics
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDO = os.path.dirname(AQUI)
R = os.path.join(ESTUDO, "resultados")
PAINEL = os.path.join(ESTUDO, "dados_copiados", "wyscout", "_temporal_photos.json")
SAIDA = os.path.join(R, "_painel_suspeito.json")

SOBREPOSICAO_MIN = 0.10      # abaixo disto o elenco e' de outro pais
RAZAO_TIMES_MAX = 1.8        # acima disto ha' mais de uma divisao sob o rotulo
MIN_TEMPORADAS = 3

# A SENSIBILIDADE, medida em 22/09/2026 rodando o J08 inteiro num sandbox sem os 11 casos cuja
# origem cai numa liga-temporada comprometida. NAO e' o fator correto — o conserto certo e'
# rotular direito na fonte, e os portugueses legitimos de 2023 devem continuar na conta. E' o
# tamanho do que esses casos seguram, que e' o que a tela precisa dizer.
SENSIBILIDADE = {
    "medido_em": "2026-09-22",
    "como": ("J08_base.py e J08.py rodados num sandbox com o painel filtrado e os 11 casos "
             "removidos do J08_base.csv; fatores_liga.csv comparado com o publicado."),
    "o_que_nao_e": ("Não é o fator correto. Remover o caso e rotular o caso direito são coisas "
                    "diferentes, e só a segunda é conserto. Isto mede o quanto o fator publicado "
                    "depende de temporada comprometida."),
    "casos_afetados": 11, "casos_totais": 782,
    "por_fator": [
        {"liga": "Portugal A", "familia": "volume", "publicado": 3.91, "sem_os_casos": 0.58},
        {"liga": "Portugal A", "familia": "eficiencia", "publicado": 2.59, "sem_os_casos": -0.16},
        {"liga": "FAIXA ACIMA", "familia": "eficiencia", "publicado": 6.54, "sem_os_casos": 7.55},
        {"liga": "FAIXA ACIMA", "familia": "volume", "publicado": 3.25, "sem_os_casos": 3.99},
        {"liga": "Dinamarca", "familia": "os dois", "publicado": -0.80, "sem_os_casos": None},
    ],
    "o_que_nao_se_move": ("As ligas sul-americanas com fator próprio não se movem: Argentina A, "
                          "Uruguai, Chile e Brasil A mudam 0,03 ou menos."),
    "conclusoes_do_j08": ("As conclusões do próprio J08 aguentam: dos 86 marcadores, 48 se "
                          "movem e todos por pouco — o encolhimento, que é o achado firme da "
                          "parte, vai de −0,601/−0,501 para −0,604/−0,505."),
}


def classificar(painel):
    por = collections.defaultdict(dict)
    for temp, linhas in painel.items():
        d = collections.defaultdict(set)
        for r in linhas:
            d[r["league"]].add(r["team"])
        for lg, times in d.items():
            por[lg][temp] = times

    ruins = []
    for lg, tt in sorted(por.items()):
        if len(tt) < MIN_TEMPORADAS:
            continue
        mediana = statistics.median(len(v) for v in tt.values())
        for temp, times in sorted(tt.items()):
            outros = set().union(*[v for k, v in tt.items() if k != temp])
            sobrep = len(times & outros) / len(times) if times else 1.0
            razao = len(times) / mediana if mediana else 1.0
            tipo = None
            if sobrep <= SOBREPOSICAO_MIN:
                tipo = "troca de liga"
            elif razao >= RAZAO_TIMES_MAX:
                tipo = "divisões misturadas"
            if tipo:
                ruins.append({"liga": lg, "temporada": temp, "tipo": tipo,
                              "times": len(times), "mediana_da_liga": round(mediana),
                              "sobreposicao_pct": round(100 * sobrep),
                              "linhas": sum(1 for r in painel[temp] if r["league"] == lg)})
    return ruins


def main():
    painel = json.load(open(PAINEL, encoding="utf-8"))
    ruins = classificar(painel)
    chaves = {(x["liga"], x["temporada"]) for x in ruins}

    # Quem depende: (a) a liga cujas proprias temporadas estao trocadas — o jogador dela nao casa
    # com a foto, e o percentil de origem dela nasce de um grupo errado; (b) a liga cujo FATOR foi
    # ajustado sobre caso que sai de uma temporada comprometida.
    afetadas = {x["liga"]: "as fotos desta liga têm elenco de outro país ou de outra divisão"
                for x in ruins}
    caminho_j08 = os.path.join(R, "J08_base.csv")
    casos = collections.Counter()
    if os.path.exists(caminho_j08):
        for r in csv.DictReader(open(caminho_j08, encoding="utf-8")):
            if (r["liga_origem"], r["periodo_antes"]) in chaves:
                casos[r["liga_origem"]] += 1
            if (r["liga_destino"], r["periodo_depois"]) in chaves:
                casos[r["liga_destino"]] += 1
    for lg, n in casos.items():
        afetadas[lg] = (f"o fator de liga foi ajustado com {n} caso(s) que saem de uma temporada "
                        "com o rótulo errado")

    saida = {
        "_doc": ("As liga-temporada do painel temporal cujo rótulo não corresponde ao elenco, e "
                 "as ligas que dependem delas. Gerado por scripts/conferir_painel.py. O conserto "
                 "é no Portal Ranking, de onde o painel é copiado — aqui só se declara o que "
                 "está comprometido, para a lista poder marcar a linha."),
        "gerado_em": "2026-09-22",
        "criterio": {
            "troca de liga": f"sobreposição de times com as outras temporadas ≤ {int(100*SOBREPOSICAO_MIN)}%",
            "divisões misturadas": f"número de times ≥ {RAZAO_TIMES_MAX}× a mediana da liga",
            "por_que_nao_mais_frouxo": ("Acesso e rebaixamento trocam times todo ano. Medido: a "
                                        "20% de linhas em times novos caem 26 liga-temporada, "
                                        "quase todas por troca normal de elenco."),
        },
        "liga_temporada_comprometida": ruins,
        "ligas_afetadas": [{"liga": k, "por_que": v} for k, v in sorted(afetadas.items())],
        "casos_do_j08_por_liga": dict(sorted(casos.items())),
        "sensibilidade_do_fator": SENSIBILIDADE,
    }
    json.dump(saida, open(SAIDA, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(ruins)} liga-temporada comprometidas · {len(afetadas)} ligas afetadas")
    for x in ruins:
        print(f"  {x['liga']:16} {x['temporada']:6} {x['tipo']:22} "
              f"{x['times']:3} times (mediana {x['mediana_da_liga']}) · {x['linhas']} linhas")
    print("  ligas afetadas:", ", ".join(sorted(afetadas)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
