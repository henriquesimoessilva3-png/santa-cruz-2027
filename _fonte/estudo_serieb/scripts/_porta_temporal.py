#!/usr/bin/env python3
"""A porta temporal (§6.4) sobre os OITO componentes do índice do A14.

Motivo: a cascata de 19/09 (`resultados/_cascata_19_09.md`) mostrou que a porta temporal só tinha
sido rodada em 3 das 19 partes e que, dos oito componentes do índice do A14, apenas um
(`duelos_def_pct`) tinha passado por ela. Sem esse teste não se sabe se a régua descreve o que o
time FEZ (característica) ou o que aconteceu com quem já estava bem (consequência).

Este script NÃO altera nenhuma conclusão. Produz evidência: escreve só
`resultados/_porta_temporal.json` e `resultados/_porta_temporal.md`.

## Qual implementação da casa foi copiada, e por quê

As três partes que dizem rodar "porta temporal" divergem entre si:

- **A02 e A06** correlacionam o indicador da 1ª metade com **o próprio indicador** da 2ª metade e
  chamam o resultado de `se_repete` (p<0,05 e rho>0,30). Isso é **persistência dentro da
  temporada**, não a porta: mede se o indicador é estável, não se ele vem antes do resultado. O
  limiar 0,30 é o `rho_persist ≥ 0,30` que a §6.5 **aposentou em 15/09**.
- **A13** correlaciona previsores do 1º turno com a **posição final** — que inclui o 1º turno —,
  por Spearman e **sem a parcial**. É a porta aplicada ao time inteiro, sem o desconto.
- A **§6.4 da ESPECIFICACAO.md** define a porta: média do indicador nas 19 primeiras rodadas contra
  os **pontos somados das 19 últimas**, tudo em posto dentro do ano, com **correlação parcial dada
  a pontuação do 1º turno**.

Escolhida a **§6.4**, por duas razões: o `CLAUDE.md` do estudo manda que, onde ele e a
especificação divergirem no método, valha a especificação; e é a §6.4 que a §6.5 lê (`p_1T_2T`,
`rho_1T_2T`) para decidir a porta A. As versões de A02/A06 e de A13 vão na saída como colunas
separadas, com o nome certo, para que a comparação com o que aquelas partes publicaram seja
possível sem confundir as duas coisas.

## A receita, conferida célula a célula

A §6.4 publica uma tabela de nove indicadores. Reproduzir os nove exigiu fixar três detalhes que o
texto não diz, e que ficaram travados aqui porque só assim a tabela bate:

1. **Posto dentro do ano** (`_metodo.percentil_no_ano`) para o indicador, para os pontos do 1º turno
   e para os pontos do 2º.
2. **ρ = Spearman sobre esses postos** (não Pearson: Pearson dá −0,443 onde a §6.4 tem −0,439).
3. **Parcial = resíduo por MQO contra o posto dos pontos do 1º turno, depois Spearman entre os dois
   resíduos** (não a fórmula fechada de parcial de Pearson: ela dá −0,343 onde a §6.4 tem −0,289).

Com isso as nove linhas da §6.4 saem idênticas, inclusive `dist_remate` −0,439 / parcial −0,289
(p 0,009) e a referência "pontos do 1º turno" +0,496. A conferência roda junto e vai para o JSON.

## A armadilha da temporada (A01)

A temporada NÃO sai do ano da data: sai dos blocos de meses com jogo separados por meses sem jogo
(`blocos_de_temporada`, copiada do A01). No recorte 2022–2025 as duas regras coincidem em 100% das
linhas — a armadilha não morde aqui —, mas a função fica porque o recorte pode mudar.

## Sinal

Tudo é lido na escala **alinhada** (alto = melhor), como o A14 monta o índice. `dist_remate`,
`xg_por_remate_contra` e `xgc_casa` têm sinal −1 e entram invertidos. **Passa** = parcial com
p < 0,05 **e** sinal positivo na escala alinhada, que é a porta A da §6.5. O BH não se aplica aqui:
a §6.5 lê `p_1T_2T` bruto; o BH é do teste de separação, não da porta.

Uso:
    python3 _fonte/estudo_serieb/scripts/_porta_temporal.py
"""
import collections
import csv
import datetime as dt
import json
import math
import os
import re
import sys

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import pct, percentil_no_ano  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")

FECHADAS = {"2022", "2023", "2024", "2025"}   # 2026 está em curso: fora, como na §6.4
TURNO = 19

# Os oito componentes do índice, como estão em resultados/A14_resumo.json["indice"].
COMPONENTES = ["H_dinheiro", "dist_remate", "E_qualidade_chance", "xg_por_remate_contra",
               "duelos_def_pct", "I_estabilidade_11", "xgc_casa", "dd_casa"]

# Sinal declarado (alto = melhor depois de alinhar). Réguas já vêm alinhadas por construção.
SINAL = {"H_dinheiro": 1, "dist_remate": -1, "E_qualidade_chance": 1,
         "xg_por_remate_contra": -1, "duelos_def_pct": 1, "I_estabilidade_11": 1,
         "xgc_casa": -1, "dd_casa": 1}

# Como dizer cada componente sem jargão: (nome, o que o time FAZ na 3ª pessoa).
EM_PORTUGUES = {
    "H_dinheiro": ("elenco caro", "tem elenco caro"),
    "dist_remate": ("chute de perto", "chuta de perto"),
    "E_qualidade_chance": ("chance boa em vez de chute de longe",
                           "cria chance boa em vez de chutar de longe"),
    "xg_por_remate_contra": ("chute ruim cedido", "só cede chute ruim"),
    "duelos_def_pct": ("disputa ganha defendendo", "ganha a disputa quando defende"),
    "I_estabilidade_11": ("time repetido", "repete o mesmo time"),
    "xgc_casa": ("pouco perigo sofrido em casa", "sofre pouco perigo em casa"),
    "dd_casa": ("disputa ganha defendendo em casa", "ganha a disputa defendendo em casa"),
}

# A tabela da §6.4, para conferência. (rho publicado, parcial publicada)
CONFERENCIA_6_4 = [
    ("Distância média do remate", "dist", -0.439, -0.289),
    ("Golos esperados", "xg", 0.372, 0.248),
    ("Remates à baliza, %", "rem_baliza_pct", 0.328, 0.215),
    ("Posse, %", "posse", 0.247, 0.227),
    ("Intensidade de jogo", "intensidade", 0.190, 0.204),
    ("PPDA", "ppda", -0.195, -0.103),
    ("% de passe longo", "passe_longo_pct", -0.130, -0.152),
    ("Passes certos, %", "passes_pct", 0.177, 0.173),
    ("Duelos ganhos, %", "duelos_pct", 0.041, -0.030),
]

# A porta da §6.4 POR PARTE — acrescentado em 20/09.
#
# Até aqui este arquivo só respondia pelos oito componentes do índice do A14, e a regra 2 do
# portão não tinha onde ler a porta de uma parte: o comentário dela ("quando guardar, entra
# aqui") apontava um bloco `partes` que não existia. Ele passa a existir.
#
# NÃO é uma varredura das 22 partes: só entram as partes cuja conclusão principal se apoia num
# indicador ÚNICO e nomeável, que é o que a §6.4 sabe testar. Parte que conclui por contagem de
# casos, por régua agregada ou por um conjunto de indicadores continua sem porta — e sem porta o
# teto dela é o que o BH sozinho permitir. Acrescentar uma parte aqui exige dizer QUAL indicador
# sustenta QUAL conclusão, e é por isso que cada linha traz as duas coisas escritas.
PORTA_POR_PARTE = {
    "A02": {"coluna": "dist", "sinal": -1, "indicador": "distância média do remate",
            "conclusao": "A02-1, “Quem sobe finaliza de mais perto”",
            "por_que": "a conclusão é sobre a distância do chute, e é ela que a porta testa; "
                       "sinal −1 porque chutar de longe é pior"},
    "A06": {"coluna": "dd", "sinal": 1, "indicador": "duelos defensivos ganhos, %",
            "conclusao": "A06-2, “quem sobe ganha a disputa quando defende”",
            "por_que": "é o indicador da pergunta do A06 — ganhar a disputa —, e é ele que a "
                       "régua F e o A12 leem. A porta REPROVA nele, e é isso que prende a parte "
                       "no provável"},
    "A05": {"coluna": "posse", "sinal": 1, "indicador": "posse, %",
            "conclusao": "A05-1, a metade positiva (“quem tinha mais a bola no 1º turno somou "
                         "mais pontos no 2º”)",
            "por_que": "é o único indicador com bola que a A05 leva à porta, e o motivo do selo "
                       "dela já citava esta linha da tabela da §6.4 antes de ela existir aqui"},
}

COL = {"dist": "Distância média do remate", "xg": "Golos esperados",
       "rem_baliza_pct": "Remates à baliza, %", "posse": "Posse, %",
       "intensidade": "Intensidade de jogo", "ppda": "PPDA",
       "passe_longo_pct": "% de passe longo", "passes_pct": "Passes certos, %",
       "duelos_pct": "Duelos ganhos, %", "remates": "Remates",
       "remates_contra": "Remates contra", "toques_area": "Toques na área",
       "entradas_area": "Entradas na grande área", "dd": "Duelos defensivos ganhos, %"}


# --------------------------------------------------------------------------- base

def blocos_de_temporada(datas):
    """A temporada sai dos blocos de meses com jogo, não do ano da data. Copiada do A01."""
    meses = sorted({(d.year, d.month) for d in datas})
    blocos, atual = [], [meses[0]]
    for a, b in zip(meses, meses[1:]):
        seguinte = (a[0] + 1, 1) if a[1] == 12 else (a[0], a[1] + 1)
        if b == seguinte:
            atual.append(b)
        else:
            blocos.append(atual)
            atual = [b]
    blocos.append(atual)
    return {m: bl[0][0] for bl in blocos for m in bl}


def ler_jogos():
    """Jogos da Série B, com temporada por bloco de meses, deduplicados e com o espelho do adversário."""
    linhas = []
    with open(os.path.join(DADOS, "serieb_jogos.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if r.get("Competição") != "Brazil. Serie B":
                continue
            m = re.match(r"(\d{4})-(\d{2})-(\d{2})", r["Data"] or "")
            if not m:
                continue

            def num(c):
                try:
                    return float(r[c])
                except (TypeError, ValueError, KeyError):
                    return None

            l = {"data": dt.date(*(int(x) for x in m.groups())), "clube": r["Equipa"],
                 "adv": r["adversario"], "mando": r["mando"], "ano_da_data": m.group(1),
                 "gp": int(float(r["golos_pro"] or 0)), "gc": int(float(r["golos_contra"] or 0))}
            for k, c in COL.items():
                l[k] = num(c)
            linhas.append(l)

    mapa = blocos_de_temporada([l["data"] for l in linhas])
    vistos, limpas = set(), []
    for l in sorted(linhas, key=lambda l: (l["clube"], l["data"])):
        l["temporada"] = str(mapa[(l["data"].year, l["data"].month)])
        k = (l["temporada"], l["clube"], l["data"], l["gp"], l["gc"])
        if k not in vistos:
            vistos.add(k)
            limpas.append(l)
    linhas = [l for l in limpas if l["temporada"] in FECHADAS]

    idx = {(l["temporada"], l["data"], l["clube"]): l for l in linhas}
    for l in linhas:
        o = idx.get((l["temporada"], l["data"], l["adv"]))
        l["xg_sofrido"] = o["xg"] if o else None      # xG do adversário naquele jogo
    por = collections.defaultdict(list)
    for l in linhas:
        por[(l["temporada"], l["clube"])].append(l)
    for k in por:
        por[k].sort(key=lambda x: x["data"])
    return linhas, por


def pontos(j):
    return 3 if j["gp"] > j["gc"] else (1 if j["gp"] == j["gc"] else 0)


def media(js, c):
    v = [j[c] for j in js if j[c] is not None]
    return sum(v) / len(v) if v else None


def razao(js, num, den):
    a = [j[num] for j in js if j[num] is not None and j[den] is not None]
    b = [j[den] for j in js if j[num] is not None and j[den] is not None]
    return (sum(a) / sum(b)) if b and sum(b) else None


# ----------------------------------------------------------------------- a porta

def parcial(x, y, z, n):
    """Resíduo por MQO contra z, depois Spearman entre os resíduos. É o que reproduz a §6.4."""
    def resid(a):
        A = np.vstack([np.asarray(z, float), np.ones(n)]).T
        coef, *_ = np.linalg.lstsq(A, np.asarray(a, float), rcond=None)
        return np.asarray(a, float) - A @ coef
    rho, p = stats.spearmanr(resid(x), resid(y))
    return float(rho), float(p)


def porta(reg, campo, sinal=1):
    """ρ e parcial do indicador do 1º turno contra os pontos do 2º, na escala alinhada."""
    linhas = [l for l in reg if l.get(campo) is not None]
    n = len(linhas)
    percentil_no_ano(linhas, [campo])
    x = [l[pct(campo)] * sinal for l in linhas]
    y = [l[pct("pts_2t")] for l in linhas]
    z = [l[pct("pts_1t")] for l in linhas]
    rho, p = stats.spearmanr(x, y)
    pr, pp = parcial(x, y, z, n)
    return {"rho": round(float(rho), 3), "p": round(float(p), 5),
            "parcial": round(pr, 3), "p_parcial": round(pp, 5), "n": n,
            "passa": bool(pp < 0.05 and pr > 0)}


def persistencia(por, campo):
    """A conta que A02 e A06 chamam de porta temporal: 1ª metade contra a 2ª DO PRÓPRIO indicador."""
    A, B = [], []
    for js in por.values():
        v = [j[campo] for j in js if j[campo] is not None]
        if len(v) < 30:
            continue
        h = len(v) // 2
        A.append(sum(v[:h]) / h)
        B.append(sum(v[h:]) / len(v[h:]))
    if len(A) < 20:
        return None
    rho, p = stats.spearmanr(A, B)
    return {"rho": round(float(rho), 3), "p": round(float(p), 5), "n": len(A),
            "se_repete_a02_a06": bool(p < 0.05 and rho > 0.3)}


# --------------------------------------------------------------------------- main

def main():
    indice = json.load(open(os.path.join(R, "A14_resumo.json"), encoding="utf-8"))["indice"]
    if list(indice) != COMPONENTES:
        print(f"AVISO: o índice do A14 mudou. Ele diz {indice}; este script fixou {COMPONENTES}.")

    linhas, por = ler_jogos()
    fora_do_bloco = sum(1 for l in linhas if l["ano_da_data"] != l["temporada"])
    print(f"jogos Série B 2022-2025: {len(linhas)} linhas · {len(por)} clube-temporadas")
    print(f"  temporada por bloco de meses ≠ ano da data em {fora_do_bloco} linhas")
    print("  jogos por clube-temporada:", dict(collections.Counter(len(v) for v in por.values())))

    # ---- o 1º e o 2º turno -------------------------------------------------
    # Pontos conferidos contra classificacao_rodada.csv (A01), que é a tabela recalculada por rodada.
    cls = collections.defaultdict(dict)
    for r in csv.DictReader(open(os.path.join(R, "classificacao_rodada.csv"), encoding="utf-8")):
        cls[(r["temporada"], r["clube"])][int(r["rodada"])] = int(r["pontos"])

    reg, divergentes = [], 0
    for k, js in por.items():
        a, b = js[:TURNO], js[TURNO:]
        l = {"temporada": k[0], "clube": k[1], "jogos_1t": len(a), "jogos_2t": len(b),
             "pts_1t": sum(pontos(j) for j in a), "pts_2t": sum(pontos(j) for j in b)}
        rs = cls.get(k, {})
        if rs and TURNO in rs:
            if rs[TURNO] != l["pts_1t"] or (max(rs) >= 30 and
                                            rs[max(rs)] - rs[TURNO] != l["pts_2t"]):
                divergentes += 1
        casa_1t = [j for j in a if j["mando"] == "casa"]
        l["dist_remate"] = media(a, "dist")
        l["duelos_def_pct"] = media(a, "dd")
        l["xg_por_remate_contra"] = razao(a, "xg_sofrido", "remates_contra")
        l["xgc_casa"] = media(casa_1t, "xg_sofrido")
        l["dd_casa"] = media(casa_1t, "dd")
        # itens da régua E (a régua é montada depois, em posto dentro do ano)
        l["_E_dist_remate"] = media(a, "dist")
        l["_E_xg_por_remate"] = razao(a, "xg", "remates")
        l["_E_toques_area"] = media(a, "toques_area")
        l["_E_entradas_area"] = media(a, "entradas_area")
        # conferência da §6.4
        for ch in COL:
            l["_c_" + ch] = media(a, ch)
        l["jogos_casa_1t"] = len(casa_1t)
        reg.append(l)

    print(f"  pontos por turno divergentes de classificacao_rodada.csv: {divergentes}")
    print(f"  jogos em casa no 1º turno: mín {min(l['jogos_casa_1t'] for l in reg)}, "
          f"máx {max(l['jogos_casa_1t'] for l in reg)}")

    percentil_no_ano(reg, ["pts_1t", "pts_2t"])

    # ---- régua E_qualidade_chance, montada por turno ------------------------
    itens_E = [("_E_dist_remate", -1), ("_E_xg_por_remate", 1),
               ("_E_toques_area", 1), ("_E_entradas_area", 1)]
    completos = [l for l in reg if all(l[i] is not None for i, _ in itens_E)]
    percentil_no_ano(completos, [i for i, _ in itens_E])
    for l in completos:
        l["E_qualidade_chance"] = sum((l[pct(i)] if s > 0 else 100 - l[pct(i)])
                                      for i, s in itens_E) / len(itens_E)

    # ---- conferência: a tabela da §6.4 sai idêntica? -----------------------
    conf, batem = [], 0
    for rot, ch, rho_pub, par_pub in CONFERENCIA_6_4:
        r = porta(reg, "_c_" + ch, 1)
        ok = abs(r["rho"] - rho_pub) <= 0.001 and abs(r["parcial"] - par_pub) <= 0.001
        batem += ok
        conf.append({"indicador": rot, "rho": r["rho"], "rho_publicado_6_4": rho_pub,
                     "parcial": r["parcial"], "parcial_publicada_6_4": par_pub,
                     "p_parcial": r["p_parcial"], "n": r["n"], "bate": ok})
    # ---- a porta da §6.4 por parte (20/09) ---------------------------------
    partes = {}
    for pid, d in PORTA_POR_PARTE.items():
        r = porta(reg, "_c_" + d["coluna"], d["sinal"])
        partes[pid] = {"indicador": d["indicador"], "coluna": d["coluna"],
                       "sinal_alinhado": d["sinal"], "sustenta": d["conclusao"],
                       "por_que_este_indicador": d["por_que"], **r}

    rho_ref, p_ref = stats.spearmanr([l[pct("pts_1t")] for l in reg],
                                     [l[pct("pts_2t")] for l in reg])
    print(f"\nconferência §6.4: {batem} de {len(CONFERENCIA_6_4)} linhas idênticas · "
          f"referência pontos 1º→2º turno rho {rho_ref:+.3f} (publicado +0,496)")

    # ---- os oito componentes ------------------------------------------------
    NAO = {
        "H_dinheiro": ("tm_valor_total e tm_valor_mediana são um instantâneo por temporada "
                       "(Transfermarkt). Não existem por rodada: não há como medir só no 1º turno."),
        "I_estabilidade_11": ("share_11, conc_hhi, atletas_usados e nucleo_300 saem de "
                              "minutagem_serieb.json, que guarda minutos por jogador-clube-TEMPORADA; "
                              "serieb_jogos.csv não traz escalação (só Sistema). A §6.5 já registra "
                              "este teste como impossível com o dado atual."),
    }
    saida = []
    for c in COMPONENTES:
        item = {"componente": c, "sinal_declarado": SINAL[c],
                "em_portugues": EM_PORTUGUES[c][0]}
        if c in NAO:
            item.update({"calculavel_por_turno": False, "motivo": NAO[c],
                         "rho": None, "p": None, "parcial": None, "p_parcial": None,
                         "n": 0, "passa": False})
            # o complemento honesto: o valor da TEMPORADA INTEIRA contra os pontos do 2º turno.
            comp = componente_temporada(c, reg)
            item["complemento_valor_da_temporada"] = comp
            saida.append(item)
            continue
        alvo = "E_qualidade_chance" if c == "E_qualidade_chance" else c
        fonte = completos if c == "E_qualidade_chance" else reg
        r = porta(fonte, alvo, 1 if c == "E_qualidade_chance" else SINAL[c])
        item.update({"calculavel_por_turno": True,
                     "como_montado": COMO_MONTADO[c], **r})
        saida.append(item)

    # variante de mando: xgc_casa e dd_casa contra os pontos de CASA do 2º turno
    casa2 = {}
    for k, js in por.items():
        b = [j for j in js[TURNO:] if j["mando"] == "casa"]
        casa2[k] = sum(pontos(j) for j in b) if b else None
    for l in reg:
        l["pts_2t_casa"] = casa2.get((l["temporada"], l["clube"]))
    percentil_no_ano([l for l in reg if l["pts_2t_casa"] is not None], ["pts_2t_casa"])
    variante = {}
    for c in ("xgc_casa", "dd_casa"):
        sub = [l for l in reg if l.get(c) is not None and l["pts_2t_casa"] is not None]
        n = len(sub)
        percentil_no_ano(sub, [c])
        x = [l[pct(c)] * SINAL[c] for l in sub]
        y = [l[pct("pts_2t_casa")] for l in sub]
        z = [l[pct("pts_1t")] for l in sub]
        rho, p = stats.spearmanr(x, y)
        pr, pp = parcial(x, y, z, n)
        variante[c] = {"alvo": "pontos de CASA do 2º turno", "rho": round(float(rho), 3),
                       "p": round(float(p), 5), "parcial": round(pr, 3),
                       "p_parcial": round(pp, 5), "n": n, "passa": bool(pp < 0.05 and pr > 0)}

    # a régua E por dentro: ela passa por causa de dist_remate, que já é componente separado?
    dentro_E = {}
    for i, sg in itens_E:
        dentro_E[i.replace("_E_", "")] = porta(completos, i, sg)
    for l in completos:
        l["E_sem_dist"] = sum((l[pct(i)] if sg > 0 else 100 - l[pct(i)])
                              for i, sg in itens_E if i != "_E_dist_remate") / 3
    dentro_E["E_qualidade_chance_sem_dist_remate"] = porta(completos, "E_sem_dist", 1)

    # a conta de A02/A06 (persistência), para comparação
    persist = {"dist_remate": persistencia(por, "dist"),
               "duelos_def_pct": persistencia(por, "dd")}

    # ---- leitura em uma frase ----------------------------------------------
    for it in saida:
        c = it["componente"]
        nome, verbo = EM_PORTUGUES[c]
        if not it["calculavel_por_turno"]:
            it["leitura"] = (f"Não dá para saber: {nome} só existe medido na temporada inteira, "
                             f"então não há como ver se vem antes ou depois do resultado.")
        elif it["passa"]:
            it["leitura"] = (f"É característica: o time que já {verbo} nas 19 primeiras rodadas "
                             f"pontua mais nas 19 seguintes mesmo comparado com quem vinha "
                             f"pontuando igual.")
        else:
            it["leitura"] = (f"Parece consequência: saber quem {verbo} nas 19 primeiras rodadas "
                             f"não acrescenta nada sobre as 19 seguintes depois de saber quantos "
                             f"pontos o time já tinha.")

    passam = [it["componente"] for it in saida if it["passa"]]
    json.dump({
        "_doc": "Porta temporal (§6.4) sobre os oito componentes do índice do A14. "
                "Evidência, não correção: nenhuma conclusão do estudo foi alterada.",
        "gerado_em": dt.date.today().isoformat(),
        "metodo": {
            "escolhido": "§6.4 da ESPECIFICACAO.md",
            "definicao": "média do indicador nas 19 primeiras rodadas × pontos somados das 19 "
                         "últimas, em posto dentro do ano, com parcial dada a pontuação do 1º turno",
            "parcial": "resíduo por MQO contra o posto dos pontos do 1º turno, depois Spearman "
                       "entre os resíduos",
            "criterio_passa": "p da parcial < 0,05 e parcial positiva na escala alinhada "
                              "(porta A da §6.5); o BH é do teste de separação, não da porta",
            "por_que": "o CLAUDE.md do estudo manda que a especificação valha onde houver "
                       "divergência, e é a §6.4 que a §6.5 lê em p_1T_2T / rho_1T_2T",
            "divergencia_entre_as_partes": {
                "A13": "previsores do 1º turno × POSIÇÃO FINAL (que contém o 1º turno), sem parcial",
                "consequencia": "nenhuma das três era a porta da §6.4; em 19/09, das 19 partes, "
                                "ZERO rodavam a porta como a especificação a define",
                "corrigidas_em_20_09": {
                    "A02": "o scripts/A02.py deixou de chamar a persistência de porta: ela passa "
                           "a ser gravada em A02_resumo.json como "
                           "`persistencia_dentro_da_temporada`, e ao lado dela entrou o bloco "
                           "`porta_6_4` com a porta de verdade sobre a distância do remate "
                           "(parcial +0,289, p 0,0094, n 80), contada por este script. Por isso "
                           "A02 saiu da lista acima.",
                    "A06": "mesmo conserto do A02: o scripts/A06.py grava a persistência com o "
                           "nome dela em A06_resumo.json e, ao lado, o bloco `porta_6_4` com a "
                           "porta de verdade sobre os quatro indicadores que a parte cita. Ela "
                           "REPROVA nos quatro, e é por isso que a parte fica no provável — o "
                           "conserto foi de nome, não de resultado. Por isso A06 saiu da lista.",
                    "A13": "continua como estava, e continua listada acima.",
                },
            },
        },
        "recorte": {"temporadas": sorted(FECHADAS), "linhas_de_jogo": len(linhas),
                    "clube_temporadas": len(reg), "corte": f"rodada {TURNO}",
                    "temporada_por_bloco_difere_do_ano_da_data": fora_do_bloco,
                    "pontos_divergentes_de_classificacao_rodada": divergentes},
        "conferencia_6_4": {"linhas": conf, "identicas": batem, "de": len(CONFERENCIA_6_4),
                            "referencia_pts_1t_x_pts_2t": {"rho": round(float(rho_ref), 3),
                                                           "p": round(float(p_ref), 6),
                                                           "publicado": 0.496}},
        "partes": partes,
        "partes_doc": "A porta da §6.4 rodada sobre o indicador que sustenta a conclusão de cada "
                      "parte listada. Só entram partes com indicador único e nomeável; ausência "
                      "aqui é ausência de porta, nunca porta reprovada.",
        "componentes": saida,
        "passam": passam,
        "placar": f"{len(passam)} de {len(COMPONENTES)}",
        "variante_de_mando": variante,
        "regua_E_por_dentro": dentro_E,
        "persistencia_conta_do_a02_a06": persist,
    }, open(os.path.join(R, "_porta_temporal.json"), "w", encoding="utf-8"),
        ensure_ascii=False, indent=1)

    # ---- tela ---------------------------------------------------------------
    print(f"\n{'='*104}\nCONFERÊNCIA — a tabela da §6.4 sai deste script?\n{'='*104}")
    print(f"{'indicador':30s} {'rho':>7s} {'§6.4':>7s} {'parcial':>8s} {'§6.4':>7s} {'p':>8s}  bate")
    for c in conf:
        print(f"{c['indicador'][:30]:30s} {c['rho']:+7.3f} {c['rho_publicado_6_4']:+7.3f} "
              f"{c['parcial']:+8.3f} {c['parcial_publicada_6_4']:+7.3f} {c['p_parcial']:8.4f}  "
              f"{'sim' if c['bate'] else 'NÃO'}")

    print(f"\n{'='*104}\nPORTA TEMPORAL — os oito componentes do índice do A14 "
          f"(escala alinhada: alto = melhor)\n{'='*104}")
    print(f"{'componente':22s} {'n':>3s} {'rho':>7s} {'p':>8s} {'parcial':>8s} {'p':>8s}  passa")
    for it in saida:
        if not it["calculavel_por_turno"]:
            print(f"{it['componente']:22s} {'—':>3s} {'—':>7s} {'—':>8s} {'—':>8s} {'—':>8s}  "
                  f"NÃO CALCULÁVEL POR TURNO")
            continue
        print(f"{it['componente']:22s} {it['n']:3d} {it['rho']:+7.3f} {it['p']:8.4f} "
              f"{it['parcial']:+8.3f} {it['p_parcial']:8.4f}  {'SIM' if it['passa'] else 'não'}")
    print(f"\n  placar: {len(passam)} de {len(COMPONENTES)} — {', '.join(passam) or 'nenhum'}")

    print(f"\n{'='*104}\nLEITURA, sem jargão\n{'='*104}")
    for it in saida:
        print(f"  {it['componente']:22s} {it['leitura']}")

    print(f"\n{'='*104}\nVARIANTE DE MANDO — indicador de casa contra os pontos de CASA do 2º turno"
          f"\n{'='*104}")
    for c, v in variante.items():
        print(f"  {c:12s} rho {v['rho']:+.3f} (p {v['p']:.4f})  parcial {v['parcial']:+.3f} "
              f"(p {v['p_parcial']:.4f})  n {v['n']}  {'passa' if v['passa'] else 'não passa'}")

    print(f"\n{'='*104}\nA RÉGUA E POR DENTRO — ela passa sozinha ou por causa do dist_remate?"
          f"\n{'='*104}")
    for k, v in dentro_E.items():
        print(f"  {k:38s} rho {v['rho']:+.3f} (p {v['p']:.4f})  parcial {v['parcial']:+.3f} "
              f"(p {v['p_parcial']:.4f})  {'passa' if v['passa'] else 'não passa'}")

    print(f"\n{'='*104}\nA CONTA QUE A02/A06 CHAMAM DE PORTA (persistência do próprio indicador)"
          f"\n{'='*104}")
    for c, v in persist.items():
        if v:
            print(f"  {c:22s} rho {v['rho']:+.3f} (p {v['p']:.4f}, n {v['n']}) — "
                  f"{'“se repete”' if v['se_repete_a02_a06'] else 'não “se repete”'}"
                  f"  [é estabilidade, NÃO é a porta]")

    print(f"\nescrito: {os.path.join(R, '_porta_temporal.json')}")


COMO_MONTADO = {
    "dist_remate": "média de 'Distância média do remate' nas 19 primeiras rodadas",
    "E_qualidade_chance": "régua remontada por turno: posto dentro do ano de dist_remate (−), "
                          "xg_por_remate (+), toques_area (+) e entradas_area (+), todos medidos "
                          "só no 1º turno, e a média dos quatro alinhados",
    "xg_por_remate_contra": "soma do xG do adversário ÷ soma de 'Remates contra' nas 19 primeiras "
                            "rodadas (razão de somas, como a coluna da temporada)",
    "duelos_def_pct": "média de 'Duelos defensivos ganhos, %' nas 19 primeiras rodadas",
    "xgc_casa": "média do xG do adversário nos jogos EM CASA das 19 primeiras rodadas",
    "dd_casa": "média de 'Duelos defensivos ganhos, %' nos jogos EM CASA das 19 primeiras rodadas",
}


def componente_temporada(c, reg):
    """Para quem não tem versão por turno: o valor da TEMPORADA contra os pontos do 2º turno.

    NÃO é a porta temporal e não conta como passar. Fica registrado porque a diferença entre os
    dois casos importa: o dinheiro é um valor que não se acumula jogo a jogo, enquanto a
    estabilidade do 11 é medida SOBRE os jogos — inclusive os do 2º turno, o próprio desfecho.
    """
    eixos = json.load(open(os.path.join(DADOS, "prototipo_indicadores.json"),
                           encoding="utf-8"))["eixos"][c]
    tec = {(r["ano"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(DADOS, "serieb_clube_temporada.csv"),
                                        encoding="utf-8-sig"))}
    itens = [i for i, _ in eixos]
    sub = []
    for l in reg:
        t = tec.get((l["temporada"], l["clube"]))
        if not t:
            continue
        v = {}
        for i in itens:
            x = t.get(i)
            try:
                v[i] = float(x) if x not in (None, "", "nan") else None
            except ValueError:
                v[i] = None
        if any(x is None for x in v.values()):
            continue
        sub.append({**{k: l[k] for k in ("temporada", "clube")},
                    **v, "pts_1t_r": l[pct("pts_1t")], "pts_2t_r": l[pct("pts_2t")]})
    if len(sub) < 20:
        return {"n": len(sub), "nota": "sem linhas suficientes"}
    percentil_no_ano(sub, itens)
    for l in sub:
        l[c] = sum((l[pct(i)] if s > 0 else 100 - l[pct(i)]) for i, s in eixos) / len(eixos)
    n = len(sub)
    x = [l[c] for l in sub]
    y = [l["pts_2t_r"] for l in sub]
    z = [l["pts_1t_r"] for l in sub]
    rho, p = stats.spearmanr(x, y)
    pr, pp = parcial(x, y, z, n)
    return {"rho": round(float(rho), 3), "p": round(float(p), 5), "parcial": round(pr, 3),
            "p_parcial": round(pp, 5), "n": n,
            "nao_e_a_porta": "o valor é da temporada inteira, não do 1º turno",
            "ressalva": ("instantâneo de mercado sem data conhecida: pode ter sido atualizado no "
                         "meio da temporada" if c == "H_dinheiro" else
                         "medido SOBRE os jogos, inclusive os do 2º turno — a janela de medida "
                         "invade a janela do desfecho, então o número é circular")}


if __name__ == "__main__":
    main()
