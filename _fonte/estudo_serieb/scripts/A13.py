#!/usr/bin/env python3
"""A13 — trajetória: quem cai já estava mal no 1º turno, e a partir de que rodada o destino se decide?

Usa a tabela rodada a rodada do A01 (`classificacao_rodada.csv`, 3.580 linhas) e os jogos de
`serieb_jogos.csv` para o xG por turno. Recorte 2022–2025 (as quatro temporadas fechadas).

Três perguntas, três respostas:

1. **Pontos por turno em cada faixa.** Quem sobe fez a diferença no 1º ou no 2º turno?
2. **A partir de que rodada o destino fica previsível.** Para cada rodada N, a fatia dos times que
   já estavam na faixa em que terminariam — e a fatia dos que já estavam nela ou a até 3 pontos.
3. **O 1º turno prevê a faixa final?** Pontos e saldo de xG do 1º turno contra a posição final.
   É a porta temporal da §6.4 aplicada ao time inteiro.

O clube-temporada com jogo faltando (`base_incompleta = 1`, dez deles) entra: a falta é de um jogo
em algum ponto e não desloca a trajetória o bastante para mudar a leitura. O número sai com e sem.

## A saída por marcador (20/09)

Além do `A13_resumo.json` e do `A13_turnos.csv`, este script passou a gravar
`resultados/A13_numeros.json`: o valor de **cada marcador** que o `A13.json` publica, com o nome do
marcador como chave. Antes, a procedência dos 44 números da tela era disciplina — alguém lia o CSV
e copiava. Agora é mecanismo, e a regra 1 do `scripts/_portao.py` confere.

São duas camadas. A primeira só grava o que as três perguntas acima já calculavam. A segunda
acrescenta os 20 marcadores que até 19/09 **só existiam digitados** no `A13.json` — entre eles o
`rho_1t_2t` da manchete de A13-3, que o script nunca produziu (os três previsores olham a posição
final, não o 2º turno), e as quatro contagens de quem trocou de destino na segunda metade
(`n_viraram`, `n_perderam_g4`, `n_salvos`, `n_cairam_de_fora`). A receita de cada um estava no
campo `de_onde` de `resultados/A13_numeros_novos.json`; aqui ela virou código.

Essa saída é a **conferência** do que está publicado, não a substituição: onde os dois discordarem,
o portão acusa, e acusar é o que se quer. A análise não mudou — nada acima do bloco marcado foi
tocado, e o `A13_resumo.json` e o `A13_turnos.csv` saem idênticos aos de 19/09.

Uso:
    python3 _fonte/estudo_serieb/scripts/A13.py
"""
import collections
import csv
import json
import math
import os
import re
import statistics as st
import sys

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
ANOS = {"2022", "2023", "2024", "2025"}
TURNO = 19

sys.path.insert(0, AQUI)
from _metodo import cohen_d, d_minimo  # noqa: E402

# A saída por marcador: todo número que o A13.json publica sai daqui, com o mesmo nome (regra 1 do
# portão, etapa 6 do PLANO.md). Data fixa porque o script é reprodutível — roda hoje e daqui a um
# ano com o mesmo resultado, e data dinâmica só faria o arquivo mudar sem o número mudar.
NUMEROS_JSON = os.path.join(R, "A13_numeros.json")
GERADO_EM = "2026-09-20"


def faixa(pos):
    return "Sobe" if pos <= 4 else ("Cai" if pos >= 17 else "Meio")


def main():
    rod = [r for r in csv.DictReader(open(os.path.join(R, "classificacao_rodada.csv"),
                                          encoding="utf-8")) if r["temporada"] in ANOS]
    fim = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8")) if r["temporada"] in ANOS}
    por = collections.defaultdict(dict)
    for r in rod:
        por[(r["temporada"], r["clube"])][int(r["rodada"])] = r
    print(f"clube-temporadas: {len(por)} · rodadas: {max(int(r['rodada']) for r in rod)}")

    # ---- 1. pontos por turno ----
    turnos = []
    for k, rs in por.items():
        f = fim.get(k)
        if not f or TURNO not in rs or max(rs) < 30:
            continue
        ult = max(rs)
        p1 = int(rs[TURNO]["pontos"])
        p2 = int(rs[ult]["pontos"]) - p1
        turnos.append({"temporada": k[0], "clube": k[1], "faixa": f["faixa"],
                       "trave": f["trave"] == "1", "incompleta": f["base_incompleta"] == "1",
                       "pos_final": int(f["pos"]),
                       "pts_1t": p1, "pts_2t": p2, "dif": p2 - p1,
                       "pos_19": int(rs[TURNO]["pos"]), "faixa_19": rs[TURNO]["faixa"]})
    quadro = {}
    for fx in ("Sobe", "Meio", "Cai"):
        g = [t for t in turnos if t["faixa"] == fx]
        quadro[fx] = {"n": len(g),
                      "pts_1t": round(st.median(t["pts_1t"] for t in g), 1),
                      "pts_2t": round(st.median(t["pts_2t"] for t in g), 1),
                      "dif": round(st.median(t["dif"] for t in g), 1)}
    tr = [t for t in turnos if t["trave"]]
    quadro["Trave"] = {"n": len(tr), "pts_1t": round(st.median(t["pts_1t"] for t in tr), 1),
                       "pts_2t": round(st.median(t["pts_2t"] for t in tr), 1),
                       "dif": round(st.median(t["dif"] for t in tr), 1)}

    # ---- 2. a partir de que rodada o destino fica previsível ----
    previsivel = []
    for n in range(1, 39):
        acertos = na_faixa = perto = total = 0
        for k, rs in por.items():
            f = fim.get(k)
            if not f or n not in rs:
                continue
            total += 1
            fx_final = f["faixa"]
            if rs[n]["faixa"] == fx_final:
                na_faixa += 1
            # "a até 3 pontos da faixa": para Sobe, a 3 do 4º; para Cai, a 3 do 17º
            mesma = [x for x in por.values() if n in x and x[n]["temporada"] == k[0]]
            pts = {int(x[n]["pos"]): int(x[n]["pontos"]) for x in mesma}
            p = int(rs[n]["pontos"])
            if fx_final == "Sobe":
                perto += 1 if (rs[n]["faixa"] == "Sobe" or (4 in pts and pts[4] - p <= 3)) else 0
            elif fx_final == "Cai":
                perto += 1 if (rs[n]["faixa"] == "Cai" or (17 in pts and p - pts[17] <= 3)) else 0
            else:
                perto += 1 if rs[n]["faixa"] == "Meio" else 0
        if total:
            previsivel.append({"rodada": n, "n": total,
                               "ja_na_faixa_pct": round(100 * na_faixa / total, 1),
                               "na_faixa_ou_perto_pct": round(100 * perto / total, 1)})

    # ---- 3. o 1º turno prevê? ----
    xg1 = collections.defaultdict(list)
    with open(os.path.join(DADOS, "serieb_jogos.csv"), encoding="utf-8-sig") as f:
        linhas = []
        for r in csv.DictReader(f):
            if r.get("Competição") != "Brazil. Serie B":
                continue
            m = re.match(r"(\d{4})-\d{2}-\d{2}", r["Data"] or "")
            if not m or m.group(1) not in ANOS:
                continue
            try:
                xg = float(r["Golos esperados"])
            except (TypeError, ValueError):
                xg = None
            linhas.append({"ano": m.group(1), "data": r["Data"][:10], "clube": r["Equipa"],
                           "adv": r["adversario"], "xg": xg})
    idx = {(l["ano"], l["data"], l["clube"]): l for l in linhas}
    for l in linhas:
        o = idx.get((l["ano"], l["data"], l["adv"]))
        l["xgc"] = o["xg"] if o else None
    g = collections.defaultdict(list)
    for l in linhas:
        g[(l["ano"], l["clube"])].append(l)
    for k in g:
        g[k].sort(key=lambda x: x["data"])
        js = g[k][:TURNO]
        v = [(j["xg"], j["xgc"]) for j in js if j["xg"] is not None and j["xgc"] is not None]
        xg1[k] = (sum(a - b for a, b in v) / len(v)) if v else None

    prev = []
    for nome, pega in (("pontos do 1º turno", lambda t: t["pts_1t"]),
                       ("posição na rodada 19", lambda t: -t["pos_19"]),
                       ("saldo de xG do 1º turno", lambda t: xg1.get((t["temporada"], t["clube"])))):
        pares = [(pega(t), -t["pos_final"]) for t in turnos if pega(t) is not None]
        rho, p = stats.spearmanr([a for a, _ in pares], [b for _, b in pares])
        n = len(pares)
        z, se = 0.5 * math.log((1 + rho) / (1 - rho)), 1 / math.sqrt(n - 3)
        prev.append({"previsor": nome, "rho_com_posicao_final": round(float(rho), 3),
                     "ic95": [round(math.tanh(z - 1.96 * se), 2),
                              round(math.tanh(z + 1.96 * se), 2)],
                     "p": round(float(p), 6), "n": n})

    # quantos dos que terminaram no G4 já estavam no G4 na rodada 19
    sobe = [t for t in turnos if t["faixa"] == "Sobe"]
    cai = [t for t in turnos if t["faixa"] == "Cai"]
    json.dump({"quadro_por_turno": quadro, "previsibilidade_por_rodada": previsivel,
               "previsores_do_1o_turno": prev,
               "sobe_ja_no_g4_na_19": sum(1 for t in sobe if t["faixa_19"] == "Sobe"),
               "sobe_total": len(sobe),
               "cai_ja_no_z4_na_19": sum(1 for t in cai if t["faixa_19"] == "Cai"),
               "cai_total": len(cai),
               "n": len(turnos)},
              open(os.path.join(R, "A13_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    with open(os.path.join(R, "A13_turnos.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(turnos[0]))
        w.writeheader(); w.writerows(turnos)

    # ==========================================================================================
    # A saída por marcador — resultados/A13_numeros.json
    # ==========================================================================================
    # Daqui para baixo só se LÊ o que já foi calculado (`turnos`, `quadro`, `previsivel`, `prev`,
    # `fim`) e se escreve. Nenhuma linha acima mudou: o A13_resumo.json e o A13_turnos.csv saem
    # idênticos aos de 19/09, e é assim que se prova que a gravação não mexeu na análise.
    #
    # CAMADA 1: o que as três perguntas já calculavam, agora com o nome do marcador como chave.
    # CAMADA 2: os marcadores que até 19/09 só existiam digitados no A13.json. A receita de cada
    # um está no campo `de_onde` de resultados/A13_numeros_novos.json — nada foi reinventado.

    def rodada(n_):
        """A linha da rodada em previsibilidade_por_rodada. Erra alto se sumir: marcador sem
        linha é marcador sem número, e o silêncio é o defeito que a auditoria achou."""
        for it in previsivel:
            if it["rodada"] == n_:
                return it
        raise KeyError(f"A13: sem a rodada {n_} em previsibilidade_por_rodada")

    def previsor(nome):
        for it in prev:
            if it["previsor"] == nome:
                return it
        raise KeyError(f"A13: sem o previsor {nome!r} em previsores_do_1o_turno")

    meio = [t for t in turnos if t["faixa"] == "Meio"]

    # -- camada 2, o que faltava calcular -------------------------------------------------------
    # Sem os times de fronteira: a coluna `fronteira` de A01_clube_temporada.csv, que é o segundo
    # corte que a casa manda rodar. Saem 28 das 80 linhas.
    sem_fronteira = [t for t in turnos if fim[(t["temporada"], t["clube"])]["fronteira"] != "1"]
    # Os terços do 1º turno saem de quantil, não de número escrito à mão: 1/3 = 22 pontos (28
    # linhas, porque cinco times empatam em 22) e 2/3 = 28,67 (27 linhas, pts_1t >= 29).
    pts1 = [t["pts_1t"] for t in turnos]
    q33, q66 = np.percentile(pts1, 100 / 3), np.percentile(pts1, 200 / 3)
    alto = [t for t in turnos if t["pts_1t"] > q66]
    baixo = [t for t in turnos if t["pts_1t"] <= q33]
    alto_2t = round(st.median(t["pts_2t"] for t in alto), 1)
    baixo_2t = round(st.median(t["pts_2t"] for t in baixo), 1)
    # 1º turno × 2º turno. É a correlação da manchete de A13-3 e não estava em lugar nenhum do
    # script: os três previsores acima olham a POSIÇÃO FINAL, não o returno.
    rho_12, _ = stats.spearmanr(pts1, [t["pts_2t"] for t in turnos])
    rho_12_sf, _ = stats.spearmanr([t["pts_1t"] for t in sem_fronteira],
                                   [t["pts_2t"] for t in sem_fronteira])

    numeros = {
        # -- 1. pontos por turno em cada faixa (medianas do quadro_por_turno) -------------------
        "n": len(turnos),
        "n_temporadas": len({t["temporada"] for t in turnos}),
        "rodada_turno": TURNO,
        "sobe_total": quadro["Sobe"]["n"],
        "meio_total": quadro["Meio"]["n"],
        "cai_total": quadro["Cai"]["n"],
        "sobe_1t": quadro["Sobe"]["pts_1t"],
        "sobe_2t": quadro["Sobe"]["pts_2t"],
        "meio_1t": quadro["Meio"]["pts_1t"],
        "meio_2t": quadro["Meio"]["pts_2t"],
        "cai_1t": quadro["Cai"]["pts_1t"],
        "cai_2t": quadro["Cai"]["pts_2t"],
        "cai_dif": quadro["Cai"]["dif"],
        "trave_1t": quadro["Trave"]["pts_1t"],
        "trave_2t": quadro["Trave"]["pts_2t"],
        "trave_dif": quadro["Trave"]["dif"],
        # a distância do 1º turno entre o meio e quem cai, e quantos dos rebaixados ficam abaixo
        # da mediana do meio (camada 2)
        "dif_1t_cai_meio": round(quadro["Meio"]["pts_1t"] - quadro["Cai"]["pts_1t"], 1),
        "cai_abaixo_mediana": sum(1 for t in cai if t["pts_1t"] < quadro["Meio"]["pts_1t"]),
        "cai_melhoraram": sum(1 for t in cai if t["pts_2t"] > t["pts_1t"]),
        # o mesmo corte sem os de fronteira (camada 2)
        "n_sem_fronteira": len(sem_fronteira),
        "cai_1t_sf": round(st.median(t["pts_1t"] for t in sem_fronteira
                                     if t["faixa"] == "Cai"), 1),
        "meio_1t_sf": round(st.median(t["pts_1t"] for t in sem_fronteira
                                      if t["faixa"] == "Meio"), 1),
        # -- 2. a partir de que rodada o destino fica previsível --------------------------------
        "r10_faixa": rodada(10)["ja_na_faixa_pct"],
        "r19_faixa": rodada(19)["ja_na_faixa_pct"],
        "r29_faixa": rodada(29)["ja_na_faixa_pct"],
        "r34_faixa": rodada(34)["ja_na_faixa_pct"],
        "r19_perto": rodada(19)["na_faixa_ou_perto_pct"],
        "sobe_g4_19": sum(1 for t in sobe if t["faixa_19"] == "Sobe"),
        "cai_z4_19": sum(1 for t in cai if t["faixa_19"] == "Cai"),
        # quem trocou de destino na segunda metade (camada 2). É o sentido inverso das duas
        # contagens de cima, e nenhuma linha do script fazia essa conta.
        "n_viraram": sum(1 for t in sobe if t["faixa_19"] != "Sobe"),
        "n_perderam_g4": sum(1 for t in turnos
                             if t["faixa_19"] == "Sobe" and t["faixa"] != "Sobe"),
        "n_salvos": sum(1 for t in turnos if t["faixa_19"] == "Cai" and t["faixa"] != "Cai"),
        "n_cairam_de_fora": sum(1 for t in cai if t["faixa_19"] != "Cai"),
        # -- 3. o 1º turno prevê? ---------------------------------------------------------------
        "rho_1t_final": previsor("pontos do 1º turno")["rho_com_posicao_final"],
        "rho_xg": previsor("saldo de xG do 1º turno")["rho_com_posicao_final"],
        # camada 2 daqui até o fim
        "rho_1t_2t": round(float(rho_12), 3),
        "rho_1t_2t_sem_fronteira": round(float(rho_12_sf), 3),
        "alto_2t": alto_2t,
        "baixo_2t": baixo_2t,
        "dif_tercos": round(alto_2t - baixo_2t, 1),
        "alto_2t_max": max(t["pts_2t"] for t in alto),
        "baixo_2t_max": max(t["pts_2t"] for t in baixo),
        # o tamanho de efeito do tombo do returno (Cai contra Meio, coluna dif) e o menor d que
        # este desenho enxergaria com 80% de poder — as duas contas do método da casa
        "d_observado": round(float(cohen_d([t["dif"] for t in cai], [t["dif"] for t in meio])), 2),
        "d_min_cai_meio": d_minimo(len(cai), len(meio)),
        # Estes dois NÃO são marcadores publicados: o A13-1 traz os dois cravados no texto
        # («quem subiu melhora 1,0 ponto, sem os colados nas linhas perde 2,0»), que é a regra 1
        # do portão reprovando. O A13.json está fora do alcance desta tarefa, então o valor sai
        # calculado aqui para que trocar o número cravado por marcador seja uma linha de edição.
        "sobe_dif": round(st.median(t["dif"] for t in sobe), 1),
        "sobe_dif_sf": round(st.median(t["dif"] for t in sem_fronteira
                                       if t["faixa"] == "Sobe"), 1),
    }
    json.dump({"gerado_por": "scripts/A13.py", "gerado_em": GERADO_EM, "numeros": numeros},
              open(NUMEROS_JSON, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"A13_numeros.json: {len(numeros)} marcadores gravados")

    print(f"\n{'='*70}\nPONTOS POR TURNO (medianas)\n{'='*70}")
    print(f"{'faixa':7s} {'n':>3s} {'1º turno':>9s} {'2º turno':>9s} {'2º − 1º':>9s}")
    for fx in ("Sobe", "Trave", "Meio", "Cai"):
        q = quadro[fx]
        print(f"{fx:7s} {q['n']:3d} {q['pts_1t']:9.1f} {q['pts_2t']:9.1f} {q['dif']:+9.1f}")

    print(f"\n{'='*70}\nA PARTIR DE QUE RODADA O DESTINO FICA PREVISÍVEL\n{'='*70}")
    print(f"{'rodada':>7s} {'já na faixa final':>18s} {'na faixa ou a 3 pontos':>24s}")
    for p in previsivel:
        if p["rodada"] in (5, 10, 15, 19, 24, 29, 34, 38):
            print(f"{p['rodada']:7d} {p['ja_na_faixa_pct']:17.1f}% {p['na_faixa_ou_perto_pct']:23.1f}%")

    print(f"\n{'='*70}\nO 1º TURNO PREVÊ A POSIÇÃO FINAL?\n{'='*70}")
    for p in prev:
        print(f"  {p['previsor']:26s} rho {p['rho_com_posicao_final']:+.3f} "
              f"IC95 [{p['ic95'][0]:+.2f},{p['ic95'][1]:+.2f}]  p {p['p']:.6f}  n {p['n']}")
    print(f"\n  dos {len(sobe)} que subiram, {sum(1 for t in sobe if t['faixa_19']=='Sobe')} já estavam no G4 na rodada 19")
    print(f"  dos {len(cai)} que caíram, {sum(1 for t in cai if t['faixa_19']=='Cai')} já estavam no Z4 na rodada 19")


if __name__ == "__main__":
    main()
