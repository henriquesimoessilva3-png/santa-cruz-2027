#!/usr/bin/env python3
"""A01 — a régua do estudo: o que separa as faixas, e quão estável é esse corte.

Tudo o mais no estudo mede contra esta régua, então ela vem primeiro e é conferida contra a
tabela oficial antes de qualquer conta.

## Recorte: 2022 a 2026

Decisão do dono em 17/09: 2018–2021 fica para uma segunda parte, porque não tem dado físico —
e é também a janela em que o `SB_TABELAS` (a fonte de verdade do app) não existe.

## A temporada NÃO sai do ano da data

A Série B de 2020 começou em agosto de 2020 e terminou em janeiro de 2021 (calendário da covid).
Atribuir a temporada pelo ano da data mistura duas edições: apareciam 28 times em 2021, com
clubes de 6 e de 45 jogos. Aqui a temporada sai dos BLOCOS de meses com jogo, separados por meses
sem jogo nenhum, e cada bloco leva o ano do seu primeiro mês. Fora do recorte atual isso não
morde, mas a regra fica, porque a segunda parte vai precisar dela.

## De onde vem cada número

- **A tabela FINAL é do `SB_TABELAS`** (`static/app.js`), como o CLAUDE.md manda. Dela saem
  posição, pontos, V, E, D, GP e GC de cada clube-temporada. Não é recalculada.
- **A tabela POR RODADA é reconstruída aqui**, dos jogos de `serieb_jogos.csv` filtrados por
  `Competição = "Brazil. Serie B"`. Rodada N de um time = o N-ésimo jogo dele na temporada, por
  data; a tabela da rodada N considera os N primeiros jogos de cada time. É simétrica entre os
  clubes, que é o que `dist_g4` e "rodadas no G4" precisam. Com jogo adiado isso difere da tabela
  do dia; quem quiser a do dia usa a coluna `data`, que vai junto.

## Cinco jogos faltam na base, e isso está marcado

Comparando a reconstrução com o `SB_TABELAS`, dez clube-temporadas têm um jogo a menos. A
diferença de V/E/D/GP/GC identifica a partida que falta, e cada par espelha (gols trocados,
vitória de um contra derrota do outro):

    2022  Londrina    1 x 1  Tombense
    2024  Operário-PR 3 x 2  Chapecoense
    2026  Vila Nova   0 x 2  Criciúma
    2026  Atlético-GO 2 x 1  São Bernardo
    2026  Ceará       1 x 2  Londrina

2023 e 2025 estão completas. A tabela final não sofre (vem do `SB_TABELAS`), mas a linha desses
clubes no `classificacao_rodada.csv` vai com `base_incompleta = 1`: falta um jogo em algum ponto
da campanha, e não dá para saber em qual rodada sem a data.

Uso:
    python3 _fonte/estudo_serieb/scripts/A01.py
"""
import collections
import csv
import datetime as dt
import json
import os
import re
import statistics as st

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
RESULTADOS = os.path.join(ESTUDO, "resultados")

JOGOS = [os.path.join(DADOS, "serieb_jogos.csv"),
         os.path.join(DADOS, "serieb_jogos_2018_2021.csv")]
APP = os.path.join(RAIZ, "static", "app.js")

TEMPORADAS = [2022, 2023, 2024, 2025, 2026]
EM_CURSO = 2026

# A saída por marcador: todo número que A01.json publica sai daqui, com o mesmo nome (regra 1 do
# portão, etapa 6 do PLANO.md). Data fixa porque o script é reprodutível — roda hoje e daqui a um
# ano com o mesmo resultado, e data dinâmica só faria o arquivo mudar sem o número mudar.
NUMEROS_JSON = os.path.join(RESULTADOS, "A01_numeros.json")
GERADO_EM = "2026-09-20"

# A temporada em que o acesso saiu na contagem de vitórias, com o 4º e o 5º empatados em pontos.
# É o caso que o texto cita pelo nome (marcadores pontos_4o_2024, v_4o_2024, v_5o_2024).
ANO_DESEMPATE = 2024


def faixa(pos, n):
    """Sobe 1º-4º · Meio 5º-16º · Cai 17º-20º, como na especificação."""
    return "Sobe" if pos <= 4 else ("Cai" if pos >= n - 3 else "Meio")


def limpo(v):
    """60,5 continua 60,5; 63.0 vira 63. O portão compara por valor, mas gente lê este arquivo."""
    return int(v) if isinstance(v, float) and v.is_integer() else v


def frase_por_ano(pares):
    """[(2022, 62), (2023, 64)] -> "62 (2022) e 64 (2023)".

    O texto da aba precisa da frase, não do dict: o repr Python ({2022: 62, ...}) renderiza
    quebrado no meio de uma frase, e foi de onde saíram os marcadores montados à mão.
    """
    ps = [f"{v} ({a})" for a, v in pares]
    return ps[0] if len(ps) == 1 else ", ".join(ps[:-1]) + " e " + ps[-1]


def tabela_oficial():
    """SB_TABELAS do app.js: ano -> [(pos, clube, J, V, E, D, GP, GC)]. Fonte de verdade."""
    s = open(APP, encoding="utf-8").read()
    i = s.find("SB_TABELAS")
    b = s[s.find("{", i):s.find("\n};", i) + 2]
    b = re.sub(r"(\d{4}):", r'"\1":', b).replace("'", '"')
    b = re.sub(r",(\s*[\]}])", r"\1", b)
    return {int(a): sorted(v, key=lambda l: l[0]) for a, v in json.loads(b).items()}


def blocos_de_temporada(datas):
    meses = sorted({(d.year, d.month) for d in datas})
    blocos, atual = [], [meses[0]]
    for a, b in zip(meses, meses[1:]):
        seguinte = (a[0] + 1, 1) if a[1] == 12 else (a[0], a[1] + 1)
        if b == seguinte:
            atual.append(b)
        else:
            blocos.append(atual)      # lista NOVA a cada bloco: reaproveitar e limpar a mesma
            atual = [b]               # apaga o que ja foi guardado (aliasing)
    blocos.append(atual)
    return {m: bl[0][0] for bl in blocos for m in bl}


def ler_jogos():
    linhas = []
    for arq in JOGOS:
        if not os.path.exists(arq):
            continue
        with open(arq, encoding="utf-8-sig") as f:
            for r in csv.DictReader(f):
                if r.get("Competição") != "Brazil. Serie B":
                    continue
                m = re.match(r"(\d{4})-(\d{2})-(\d{2})", r["Data"] or "")
                if not m:
                    continue
                linhas.append({"data": dt.date(*(int(x) for x in m.groups())),
                               "clube": r["Equipa"], "gp": int(float(r["golos_pro"] or 0)),
                               "gc": int(float(r["golos_contra"] or 0)), "res": r["resultado"]})
    mapa = blocos_de_temporada([l["data"] for l in linhas])
    vistos, limpas = set(), []
    for l in sorted(linhas, key=lambda l: (l["clube"], l["data"])):
        l["temporada"] = mapa[(l["data"].year, l["data"].month)]
        k = (l["temporada"], l["clube"], l["data"], l["gp"], l["gc"])
        if k not in vistos:
            vistos.add(k)
            limpas.append(l)
    return [l for l in limpas if l["temporada"] in TEMPORADAS]


def ordenar(times, n):
    """Pontos, vitórias, saldo, gols pró, nome. Confronto direto e cartões não há na base."""
    o = sorted(times, key=lambda t: (-t["pts"], -t["v"], -(t["gp"] - t["gc"]), -t["gp"],
                                     t["clube"]))
    for i, t in enumerate(o, 1):
        t["pos"], t["sg"], t["faixa"] = i, t["gp"] - t["gc"], faixa(i, n)
    return o


def main():
    jogos = ler_jogos()
    ofic = tabela_oficial()
    por = collections.defaultdict(lambda: collections.defaultdict(list))
    for l in jogos:
        por[l["temporada"]][l["clube"]].append(l)
    for t in por:
        for c in por[t]:
            por[t][c].sort(key=lambda l: l["data"])

    # ---- 1. quem tem jogo faltando, e qual jogo é ----
    incompletos, faltantes = set(), []
    for ano in TEMPORADAS:
        dif = []
        for pos, c, J, V, E, D, GP, GC in ofic[ano]:
            js = por[ano].get(c, [])
            v = sum(1 for g in js if g["res"] == "V")
            e = sum(1 for g in js if g["res"] == "E")
            d = sum(1 for g in js if g["res"] == "D")
            if len(js) != J:
                incompletos.add((ano, c))
                dif.append({"clube": c, "V": V - v, "E": E - e, "D": D - d,
                            "GP": GP - sum(g["gp"] for g in js),
                            "GC": GC - sum(g["gc"] for g in js)})
        usados = set()
        for a in dif:
            if a["clube"] in usados:
                continue
            for b in dif:
                if b["clube"] in usados or b["clube"] == a["clube"]:
                    continue
                if (a["GP"], a["GC"], a["V"], a["D"], a["E"]) == \
                   (b["GC"], b["GP"], b["D"], b["V"], b["E"]):
                    usados.update({a["clube"], b["clube"]})
                    faltantes.append({"temporada": ano, "casa": a["clube"], "gols_casa": a["GP"],
                                      "gols_fora": a["GC"], "fora": b["clube"]})
                    break

    # ---- 2. a tabela por rodada ----
    linhas_rodada = []
    for ano in TEMPORADAS:
        clubes = por[ano]
        n = len(ofic[ano])
        maxr = max(len(v) for v in clubes.values())
        acum = {c: {"clube": c, "j": 0, "v": 0, "e": 0, "d": 0, "gp": 0, "gc": 0, "pts": 0}
                for c in clubes}
        for rod in range(1, maxr + 1):
            data_r = None
            for c, js in clubes.items():
                if len(js) < rod:
                    continue
                g, a = js[rod - 1], acum[c]
                a["j"] += 1; a["gp"] += g["gp"]; a["gc"] += g["gc"]
                if g["res"] == "V":
                    a["v"] += 1; a["pts"] += 3
                elif g["res"] == "E":
                    a["e"] += 1; a["pts"] += 1
                else:
                    a["d"] += 1
                data_r = g["data"] if data_r is None or g["data"] > data_r else data_r
            ordem = ordenar(list(acum.values()), n)
            p4 = ordem[3]["pts"]
            for t in ordem:
                linhas_rodada.append({
                    "temporada": ano, "rodada": rod, "data": data_r.isoformat(),
                    "clube": t["clube"], "pos": t["pos"], "J": t["j"], "V": t["v"], "E": t["e"],
                    "D": t["d"], "GP": t["gp"], "GC": t["gc"], "SG": t["sg"], "pontos": t["pts"],
                    "dist_g4": t["pts"] - p4, "faixa": t["faixa"],
                    "base_incompleta": int((ano, t["clube"]) in incompletos),
                })

    # ---- 3. a régua, do oficial ----
    regua, clube_temp = [], []
    for ano in TEMPORADAS:
        n = len(ofic[ano])
        final = [{"pos": p, "clube": c, "J": J, "V": V, "E": E, "D": D, "GP": GP, "GC": GC,
                  "pts": 3 * V + E, "sg": GP - GC} for p, c, J, V, E, D, GP, GC in ofic[ano]]
        pts = {t["pos"]: t["pts"] for t in final}
        p4, p5, p8 = pts[4], pts[5], pts[8]
        p16, p17 = pts[n - 4], pts[n - 3]
        regua.append({
            "temporada": ano, "times": n, "rodadas": max(t["J"] for t in final),
            "em_curso": int(ano == EM_CURSO),
            "pontos_1o": pts[1], "pontos_4o": p4, "pontos_5o": p5, "pontos_8o": p8,
            "pontos_16o": p16, "pontos_17o": p17, "pontos_20o": pts[n],
            "vitorias_4o": next(t["V"] for t in final if t["pos"] == 4),
            "sg_4o": next(t["sg"] for t in final if t["pos"] == 4),
            "margem_4o_5o": p4 - p5, "margem_16o_17o": p16 - p17,
            "aproveit_4o_pct": round(100 * p4 / (3 * next(t["J"] for t in final if t["pos"] == 4)), 1),
        })
        for t in final:
            fg4 = (t["pos"] <= 4 and t["pts"] - p5 <= 3) or (t["pos"] > 4 and p4 - t["pts"] <= 3)
            fz4 = (t["pos"] <= n - 4 and t["pts"] - p17 <= 3) or \
                  (t["pos"] > n - 4 and p16 - t["pts"] <= 3)
            clube_temp.append({
                "temporada": ano, "clube": t["clube"], "pos": t["pos"],
                "faixa": faixa(t["pos"], n), "trave": int(5 <= t["pos"] <= 8),
                "pontos": t["pts"], "J": t["J"], "V": t["V"], "E": t["E"], "D": t["D"],
                "GP": t["GP"], "GC": t["GC"], "SG": t["sg"], "dist_g4": t["pts"] - p4,
                "fronteira_g4": int(fg4), "fronteira_z4": int(fz4),
                "fronteira": int(fg4 or fz4),
                "base_incompleta": int((ano, t["clube"]) in incompletos),
            })

    def grava(nome, linhas):
        caminho = os.path.join(RESULTADOS, nome)
        with open(caminho, "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=list(linhas[0]))
            w.writeheader(); w.writerows(linhas)
        print(f"  {nome}: {len(linhas)} linhas")

    print("temporadas:", ", ".join(f"{a} ({len(por[a])} times)" for a in TEMPORADAS))
    print("\ngravando")
    grava("classificacao_rodada.csv", linhas_rodada)
    grava("A01_regua.csv", regua)
    grava("A01_clube_temporada.csv", clube_temp)

    fechadas = [r for r in regua if not r["em_curso"]]
    p4s = [r["pontos_4o"] for r in fechadas]
    p17s = [r["pontos_17o"] for r in fechadas]
    fron = sum(c["fronteira"] for c in clube_temp if c["temporada"] != EM_CURSO)
    resumo = {
        "temporadas": TEMPORADAS, "fechadas": [r["temporada"] for r in fechadas],
        "corte_g4": {"min": min(p4s), "max": max(p4s), "mediana": st.median(p4s),
                     "amplitude": max(p4s) - min(p4s), "por_ano": {r["temporada"]: r["pontos_4o"] for r in fechadas}},
        "corte_z4": {"min": min(p17s), "max": max(p17s), "mediana": st.median(p17s),
                     "amplitude": max(p17s) - min(p17s), "por_ano": {r["temporada"]: r["pontos_17o"] for r in fechadas}},
        "margem_4o_5o": {r["temporada"]: r["margem_4o_5o"] for r in fechadas},
        "fronteira": {"clubes": fron, "de": 4 * 20, "pct": round(100 * fron / (4 * 20), 1)},
        "jogos_faltando": faltantes,
        "clube_temporadas_incompletos": len([c for c in clube_temp if c["base_incompleta"]]),
    }
    json.dump(resumo, open(os.path.join(RESULTADOS, "A01_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print("\nA RÉGUA (temporadas fechadas, 2022-2025)")
    print(f"  corte do G4 (pontos do 4º): {min(p4s)} a {max(p4s)}, mediana {st.median(p4s):.0f}"
          f"  ·  por ano: {resumo['corte_g4']['por_ano']}")
    print(f"  corte do Z4 (pontos do 17º): {min(p17s)} a {max(p17s)}, mediana {st.median(p17s):.0f}"
          f"  ·  por ano: {resumo['corte_z4']['por_ano']}")
    print(f"  margem do 4º para o 5º: {resumo['margem_4o_5o']}")
    print(f"  fronteira: {fron} de 80 clube-temporadas ({resumo['fronteira']['pct']}%)")
    print(f"\n  jogos faltando na base: {len(faltantes)} "
          f"({resumo['clube_temporadas_incompletos']} clube-temporadas marcados)")

    # ---- 4. os números por marcador, do próprio script ----
    # Regra 1 do portão: todo marcador que A01.json publica tem de sair daqui, com o mesmo valor.
    # Nada é digitado — cada linha abaixo lê as três tabelas que este script acabou de gravar.
    # Esta saída CONFERE o publicado; ela não o substitui, e A01.json não é tocado aqui.
    fech_ct = [c for c in clube_temp if c["temporada"] != EM_CURSO]
    trave_ct = [c for c in fech_ct if c["trave"]]
    sobe_ct = [c for c in fech_ct if c["faixa"] == "Sobe"]
    corte_mediana = st.median(p4s)
    r_curso = next(r for r in regua if r["temporada"] == EM_CURSO)
    pos_curso = {c["pos"]: c for c in clube_temp if c["temporada"] == EM_CURSO}
    pos_desempate = {c["pos"]: c for c in clube_temp if c["temporada"] == ANO_DESEMPATE}
    rodadas_cheias = 2 * (r_curso["times"] - 1)   # turno e returno, para o ritmo de quem está em curso

    numeros = {
        # a janela
        "temporadas": len(fechadas),
        "anos": " · ".join(str(r["temporada"]) for r in fechadas),
        # o corte do G4
        "corte_min": min(p4s),
        "corte_max": max(p4s),
        "corte_mediana": corte_mediana,
        "corte_amplitude": max(p4s) - min(p4s),
        "corte_por_ano_frase": frase_por_ano([(r["temporada"], r["pontos_4o"]) for r in fechadas]),
        # empate não garante vaga: um elenco da mediana só entra se fizer MAIS que o 4º do ano
        "anos_falha_63": sum(1 for r in fechadas if corte_mediana <= r["pontos_4o"]),
        "aprov_min": min(r["aproveit_4o_pct"] for r in fechadas),
        "aprov_max": max(r["aproveit_4o_pct"] for r in fechadas),
        "vit_min": min(r["vitorias_4o"] for r in fechadas),
        "vit_max": max(r["vitorias_4o"] for r in fechadas),
        # a margem do 4º para o 5º
        "margens_frase": frase_por_ano([(r["temporada"], r["margem_4o_5o"]) for r in fechadas]),
        "margem_max": max(r["margem_4o_5o"] for r in fechadas),
        "anos_ate_1pt": sum(1 for r in fechadas if r["margem_4o_5o"] <= 1),
        "pontos_4o_2024": next(r["pontos_4o"] for r in regua if r["temporada"] == ANO_DESEMPATE),
        "v_4o_2024": pos_desempate[4]["V"],
        "v_5o_2024": pos_desempate[5]["V"],
        # o corte do Z4
        "corte_z4_min": min(p17s),
        "corte_z4_max": max(p17s),
        "corte_z4_mediana": st.median(p17s),
        # quem termina colado numa das linhas
        "fronteira_n": fron,
        "fronteira_de": resumo["fronteira"]["de"],
        "fronteira_pct": resumo["fronteira"]["pct"],
        "sobe_fronteira": sum(1 for c in sobe_ct if c["fronteira_g4"]),
        "sobe_de": len(sobe_ct),
        # a Trave (5º a 8º)
        "trave_min": min(c["pontos"] for c in trave_ct),
        "trave_max": max(c["pontos"] for c in trave_ct),
        "trave_mediana": st.median(c["pontos"] for c in trave_ct),
        # o texto escreve "{trave_dist_mediana} pontos abaixo do corte": a palavra "abaixo"
        # carrega o sinal, então o marcador vai em módulo — nunca o sinal cru.
        "trave_dist_mediana": abs(st.median(c["dist_g4"] for c in trave_ct)),
        "trave_fronteira": sum(1 for c in trave_ct if c["fronteira_g4"]),
        "trave_de": len(trave_ct),
        # o tamanho da base
        "clube_temporadas": len(clube_temp),
        "linhas_rodada": len(linhas_rodada),
        "jogos_faltando": len(faltantes),
        # a temporada em curso, projetada no ritmo dela
        "ritmo_4o_2026": round(r_curso["pontos_4o"] / r_curso["rodadas"] * rodadas_cheias),
        "clube_4o_2026": pos_curso[4]["clube"],
        "rodada_2026": r_curso["rodadas"],
    }
    json.dump({"gerado_por": "scripts/A01.py", "gerado_em": GERADO_EM,
               "numeros": {k: limpo(v) for k, v in numeros.items()}},
              open(NUMEROS_JSON, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"\n  A01_numeros.json: {len(numeros)} marcadores")


if __name__ == "__main__":
    main()
