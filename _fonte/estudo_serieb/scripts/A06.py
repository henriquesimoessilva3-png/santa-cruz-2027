#!/usr/bin/env python3
"""A06 — quem sobe pressiona mais alto, ou apenas cede menos finalização de qualidade?

É a continuação direta do A02, que achou o lado defensivo como o que mais separa (xG sofrido
d 1,46; xG por finalização sofrida d 1,30). A02 disse ONDE está a diferença; A06 pergunta COMO ela
é conseguida: pressionando alto, ou só cedendo chance pior?

Lista: `resultados/A06_indicadores.json`, fechada antes de rodar (8 indicadores, 3 famílias, e
3 lacunas da base registradas). Método: `scripts/_metodo.py` (o da casa).

## Duas coisas que a base não tem, e uma que ela tem escondida

- **Recuperação por altura do campo não existe.** Há o total e a quebra por comprimento do passe
  (curto/médio/longo), que é outra coisa. "Pressiona mais alto" fica respondido por PPDA e
  recuperações totais.
- **Contra-ataque sofrido não existe** — só o do próprio time. Saiu da lista.
- **Duelo defensivo existe jogo a jogo** ("Duelos defensivos ganhos, %" em serieb_jogos.csv), mas
  não no clube-temporada. É agregado aqui pela média dos jogos de Série B da temporada.

## Ajuste pela posse do adversário

Time que fica com a bola sofre menos finalização só por isso. Os dois indicadores de volume cedido
entram divididos pela posse do adversário, normalizada em 50%: `remates_contra ÷ ((100−posse)/50)`.
`xg_por_remate_contra` já é uma taxa por finalização e não se ajusta.

Uso:
    python3 _fonte/estudo_serieb/scripts/A06.py
"""
import collections
import csv
import json
import math
import os
import re
import sys

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import _porta_temporal as porta_6_4  # noqa: E402  (a §6.4, onde ela está implementada e conferida)
from _metodo import comparar, d_minimo, pct, percentil_no_ano  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
RNG = np.random.default_rng(20260917)
ANOS = {"2022", "2023", "2024", "2025"}
# Data fixa, de propósito: o script é reprodutível (mesma base, mesma semente, mesma saída), e
# carimbo de relógio faria a saída "mudar" a cada rodada sem que número nenhum tivesse mudado.
GERADO_EM = "2026-09-20"


def br(v, casas):
    """O número em pt-BR, como o marcador é publicado: vírgula decimal, sem sinal."""
    return f"{v:.{casas}f}".replace(".", ",")


def br_sinal(v, casas):
    """Idem, com o sinal sempre à mostra (+0,092 / -0,103)."""
    return f"{v:+.{casas}f}".replace(".", ",")


def ic_br(ic):
    """O IC95 do d como a tela o escreve: “+0,99 a +2,37”."""
    lo, hi = ic
    return f"{lo:+.2f} a {hi:+.2f}".replace(".", ",")


def jogos_serieb():
    """Os jogos de Série B com as colunas sem bola, por clube e temporada."""
    out = collections.defaultdict(list)
    with open(os.path.join(DADOS, "serieb_jogos.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if r.get("Competição") != "Brazil. Serie B":
                continue
            m = re.match(r"(\d{4})-\d{2}-\d{2}", r["Data"] or "")
            if not m or m.group(1) not in ANOS:
                continue
            def num(c):
                try:
                    return float(r[c])
                except (TypeError, ValueError, KeyError):
                    return None
            out[(m.group(1), r["Equipa"])].append({
                "data": r["Data"][:10],
                "ppda": num("PPDA"),
                "recuperacoes": num("Recuperações"),
                "duelos_def_pct": num("Duelos defensivos ganhos, %"),
                "duelos_aereos_pct": num("Duelos aéreos ganhos, %"),
                "posse": num("Posse, %"),
                "intensidade": num("Intensidade de jogo"),
            })
    for k in out:
        out[k].sort(key=lambda j: j["data"])
    return out


def main():
    dec = json.load(open(os.path.join(R, "A06_indicadores.json"), encoding="utf-8"))
    inds = [i for fam in dec["familias"] for i in fam["indicadores"]]
    sinal = {i["id"]: i["sinal"] for i in inds}
    nome = {i["id"]: i["nome"] for i in inds}

    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    tec = {}
    with open(os.path.join(DADOS, "serieb_clube_temporada.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            tec[(r["ano"], r["clube"])] = r
    jogos = jogos_serieb()

    base, sem_duelo = [], 0
    for k, a in a01.items():
        if k[0] not in ANOS or k not in tec:
            continue
        t = tec[k]
        def num(c):
            v = t.get(c)
            return float(v) if v not in (None, "", "nan") else None
        posse = num("posse")
        posse_adv = (100 - posse) if posse is not None else None
        fator = (posse_adv / 50) if posse_adv else None
        dd = [j["duelos_def_pct"] for j in jogos.get(k, []) if j["duelos_def_pct"] is not None]
        if not dd:
            sem_duelo += 1
        l = {"temporada": k[0], "clube": k[1], "faixa": a["faixa"],
             "trave": a["trave"] == "1", "fronteira": a["fronteira"] == "1",
             "posse": posse,
             "ppda": num("ppda"), "recuperacoes": num("recuperacoes"),
             "intensidade": num("intensidade"),
             "duelos_aereos_pct": num("duelos_aereos_pct"),
             "duelos_def_pct": (sum(dd) / len(dd)) if dd else None,
             "xg_por_remate_contra": num("xg_por_remate_contra"),
             "remates_contra_aj": (num("remates_contra") / fator) if fator else None,
             "xg_contra_aj": (num("xg_contra") / fator) if fator else None,
             # Fora da lista pré-declarada: não entra em teste nenhum, não é rankeado e não
             # filtra a base. Só alimenta marcador de tela (rc_*, pts_trave_*).
             "remates_contra": num("remates_contra"),
             "pontos": float(a["pontos"]) if a.get("pontos") not in (None, "") else None}
        base.append(l)

    faltas = {i["id"]: sum(1 for l in base if l[i["id"]] is None) for i in inds}
    print(f"base: {len(base)} clube-temporadas · {len({l['clube'] for l in base})} clubes")
    print("buracos por indicador:", {k: v for k, v in faltas.items() if v} or "nenhum")
    if sem_duelo:
        print(f"  {sem_duelo} clube-temporadas sem duelo defensivo jogo a jogo")
    base = [l for l in base if all(l[i["id"]] is not None for i in inds)]
    print(f"base usada (sem buraco): {len(base)}")

    percentil_no_ano(base, [i["id"] for i in inds])
    familias = [(f["id"], [i["id"] for i in f["indicadores"]]) for f in dec["familias"]]
    comparacoes = [("SM", lambda l: l["faixa"] == "Sobe", lambda l: l["faixa"] == "Meio"),
                   ("ST", lambda l: l["faixa"] == "Sobe", lambda l: l["trave"])]
    filtros = [("com", lambda l: True), ("sem", lambda l: not l["fronteira"])]
    res = comparar(base, familias, comparacoes, filtros, RNG, lambda i: sinal[i])
    for it in res:
        it["nome"] = nome[it["indicador"]]

    with open(os.path.join(R, "A06_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(res[0]))
        w.writeheader(); w.writerows(res)

    # ---- porta temporal: 1º turno prevendo o 2º ----
    porta = {}
    for campo in ("ppda", "recuperacoes", "duelos_def_pct", "duelos_aereos_pct", "posse",
                  "intensidade"):
        A, B = [], []
        for k, js in jogos.items():
            if len(js) < 30:
                continue
            v = [j[campo] for j in js if j[campo] is not None]
            if len(v) < 30:
                continue
            h = len(v) // 2
            A.append(sum(v[:h]) / h); B.append(sum(v[h:]) / len(v[h:]))
        if len(A) < 20:
            continue
        rho, p = stats.spearmanr(A, B)
        n = len(A)
        z, se = 0.5 * math.log((1 + rho) / (1 - rho)), 1 / math.sqrt(n - 3)
        porta[campo] = {"rho": round(float(rho), 3), "p": round(float(p), 5), "n": n,
                        "ic": [round(math.tanh(z - 1.96 * se), 2),
                               round(math.tanh(z + 1.96 * se), 2)],
                        "se_repete": bool(p < 0.05 and rho > 0.3)}

    # ---- PPDA e o valor do elenco: a ressalva, sem desconto ----
    valor = {}
    for k in {(l["temporada"], l["clube"]) for l in base}:
        v = tec[k].get("tm_valor_total")
        try:
            valor[k] = float(v) if v else None
        except ValueError:
            valor[k] = None
    pares = [(valor[(l["temporada"], l["clube"])], l[pct("ppda")]) for l in base
             if valor.get((l["temporada"], l["clube"]))]
    rho_v, p_v = stats.spearmanr([a for a, _ in pares], [b for _, b in pares])

    json.dump({"porta_temporal": porta,
               "ppda_x_valor_elenco": {"rho": round(float(rho_v), 3), "p": round(float(p_v), 5),
                                       "n": len(pares),
                                       "convencao": "percentil alto de PPDA = MENOS pressão; rho positivo = elenco caro pressiona alto"},
               "poder_por_desenho": {"16x48": d_minimo(16, 48), "8x32": d_minimo(8, 32),
                                     "16x16": d_minimo(16, 16), "8x7": d_minimo(8, 7)},
               "n": {"total": len(base),
                     "sobe_sem_fronteira": sum(1 for l in base if l["faixa"] == "Sobe" and not l["fronteira"]),
                     "meio_sem_fronteira": sum(1 for l in base if l["faixa"] == "Meio" and not l["fronteira"])}},
              open(os.path.join(R, "A06_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    for rot in ("com", "sem"):
        print(f"\n{'='*96}\n{rot.upper()} fronteira\n{'='*96}")
        print(f"{'fam':14s} {'indicador':22s} {'cmp':3s} {'n':>6s} {'Sobe':>8s} {'alvo':>8s} "
              f"{'d':>6s} {'q':>8s} {'dmin':>5s}  selo")
        for it in res:
            if it["fronteira"] != rot:
                continue
            print(f"{it['familia']:14s} {it['indicador'][:22]:22s} {it['comparacao']:3s} "
                  f"{f'{it[chr(110)+chr(95)+chr(97)]}x{it[chr(110)+chr(95)+chr(98)]}':>6s} "
                  f"{it['cru_a']:8.2f} {it['cru_b']:8.2f} {it['d']:+6.2f} {it['q']:8.4f} "
                  f"{it['d_minimo_80']:5.2f}  {it['selo']}")

    print(f"\n{'='*96}\nPORTA TEMPORAL — 1º turno prevendo o 2º\n{'='*96}")
    for k, v in porta.items():
        print(f"  {k:20s} rho {v['rho']:+.3f}  IC95 [{v['ic'][0]:+.2f},{v['ic'][1]:+.2f}]  "
              f"p {v['p']:.4f}  n {v['n']}   {'SE REPETE' if v['se_repete'] else 'NÃO se repete'}")
    print(f"\nPPDA × valor do elenco: rho {rho_v:+.3f} (p {p_v:.4f}, n {len(pares)}) — "
          f"ressalva, nunca desconto")

    # ==========================================================================================
    # A SAÍDA DOS NÚMEROS — resultados/A06_numeros.json
    # ==========================================================================================
    # Etapa 6 do PLANO.md, regras 1 e 9 do portão: todo marcador que A06.json publica tem de SAIR
    # daqui, com o nome do marcador como chave. Nada abaixo muda a análise — as medianas, os d, os
    # q e os selos são os que já foram calculados acima. O que se acrescenta é (a) gravar, e
    # (b) calcular os marcadores que até 19/09 só existiam digitados no <ID>.json.
    #
    # Os que faltavam, e de onde saem (o campo `de_onde` de A06_numeros_novos.json):
    #   n_trave_sai, pts_trave_sai, pts_trave_fica → coluna `pontos` de A01_clube_temporada.csv,
    #       nas linhas trave=1, separadas por fronteira.
    #   rc_s_com, rc_m_com → `remates_contra` SEM o ajuste de posse (o par bruto do rca_*).
    #   conf_xgpr → confiabilidade meia-metade do xg_por_remate_contra: rodadas ímpares contra
    #       pares, razão de somas (xG do adversário ÷ remates contra) em cada metade, posto dentro
    #       do ano, Spearman e correção de Spearman-Brown.
    #   porta_dd, porta_dd_p, porta_ppda, porta_int, porta_xgpr_parcial, porta_xgpr_p, porta_n →
    #       a porta temporal da §6.4 DE VERDADE: indicador das 19 primeiras rodadas contra os
    #       PONTOS das 19 últimas, parcial dada aos pontos do 1º turno. Vem de
    #       scripts/_porta_temporal.py, que é onde ela está implementada e conferida (9 de 9
    #       linhas da tabela da §6.4 idênticas) — não se reimplementa teste aqui.
    #       ATENÇÃO: o que este script chama de `porta_temporal` lá em cima é PERSISTÊNCIA
    #       (o indicador prevendo a si mesmo entre as duas metades), que é outra medida. São as
    #       persistências que porta_rec e porta_posse publicam.
    T = {(r["fronteira"], r["familia"], r["comparacao"], r["indicador"]): r for r in res}
    grupos = {
        "S_com": lambda l: l["faixa"] == "Sobe",
        "M_com": lambda l: l["faixa"] == "Meio",
        "S_sem": lambda l: l["faixa"] == "Sobe" and not l["fronteira"],
        "M_sem": lambda l: l["faixa"] == "Meio" and not l["fronteira"],
        "T_sem": lambda l: l["trave"] and not l["fronteira"],
    }

    def med(campo, grupo, casas):
        v = [l[campo] for l in base if grupos[grupo](l) and l[campo] is not None]
        return round(float(np.median(v)), casas)

    def med_pontos(so_os_que_saem):
        v = [l["pontos"] for l in base
             if l["trave"] and l["fronteira"] == so_os_que_saem and l["pontos"] is not None]
        m = float(np.median(v))
        return int(m) if m.is_integer() else round(m, 1)

    # ---- a porta da §6.4, pelos quatro indicadores que o A06 cita ----
    _, por_ct = porta_6_4.ler_jogos()
    reg64 = []
    for (temporada, clube), js in por_ct.items():
        t1, t2 = js[:porta_6_4.TURNO], js[porta_6_4.TURNO:]
        reg64.append({"temporada": temporada, "clube": clube,
                      "pts_1t": sum(porta_6_4.pontos(j) for j in t1),
                      "pts_2t": sum(porta_6_4.pontos(j) for j in t2),
                      "duelos_def_pct": porta_6_4.media(t1, "dd"),
                      "ppda": porta_6_4.media(t1, "ppda"),
                      "intensidade": porta_6_4.media(t1, "intensidade"),
                      "xg_por_remate_contra": porta_6_4.razao(t1, "xg_sofrido",
                                                              "remates_contra")})
    percentil_no_ano(reg64, ["pts_1t", "pts_2t"])
    p64 = {c: porta_6_4.porta(reg64, c, s) for c, s in (("duelos_def_pct", 1), ("ppda", 1),
                                                        ("intensidade", 1),
                                                        ("xg_por_remate_contra", -1))}

    # ---- confiabilidade meia-metade do xg_por_remate_contra ----
    meias = []
    for (temporada, clube), js in por_ct.items():
        impares = porta_6_4.razao(js[0::2], "xg_sofrido", "remates_contra")
        pares = porta_6_4.razao(js[1::2], "xg_sofrido", "remates_contra")
        if impares is None or pares is None:
            continue
        meias.append({"temporada": temporada, "clube": clube,
                      "meia_a": impares, "meia_b": pares})
    percentil_no_ano(meias, ["meia_a", "meia_b"])
    r_meias, _ = stats.spearmanr([l[pct("meia_a")] for l in meias],
                                 [l[pct("meia_b")] for l in meias])
    conf_xgpr = 2 * float(r_meias) / (1 + float(r_meias))          # Spearman-Brown

    numeros = {
        # quantos são
        "n_sobe_com": T[("com", "pressao", "SM", "ppda")]["n_a"],
        "n_meio_com": T[("com", "pressao", "SM", "ppda")]["n_b"],
        "n_sobe_sf": T[("sem", "pressao", "SM", "ppda")]["n_a"],
        "n_meio_sf": T[("sem", "pressao", "SM", "ppda")]["n_b"],
        "n_trave": T[("com", "pressao", "ST", "ppda")]["n_b"],
        "n_trave_sf": T[("sem", "pressao", "ST", "ppda")]["n_b"],
        "n_trave_sai": sum(1 for l in base if l["trave"] and l["fronteira"]),
        "pts_trave_sai": med_pontos(True),
        "pts_trave_fica": med_pontos(False),
        # o menor efeito que cada desenho enxerga
        "dmin_SM_com": T[("com", "pressao", "SM", "ppda")]["d_minimo_80"],
        "dmin_SM": T[("sem", "pressao", "SM", "ppda")]["d_minimo_80"],
        "dmin_ST": T[("sem", "pressao", "ST", "ppda")]["d_minimo_80"],
        # duelo defensivo — A06-1 (Sobe × Meio) e A06-2 (Sobe × trave)
        "dd_s_com": med("duelos_def_pct", "S_com", 2),
        "dd_m_com": med("duelos_def_pct", "M_com", 2),
        "dd_s_sem": med("duelos_def_pct", "S_sem", 2),
        "dd_m_sem": med("duelos_def_pct", "M_sem", 2),
        "dd_s": med("duelos_def_pct", "S_sem", 3),
        "dd_m": med("duelos_def_pct", "M_sem", 3),
        "dd_d": T[("sem", "duelo", "SM", "duelos_def_pct")]["d"],
        "dd_q_com": br(T[("com", "duelo", "SM", "duelos_def_pct")]["q"], 5),
        "dd_q": T[("sem", "duelo", "SM", "duelos_def_pct")]["q"],
        "dd_ic": ic_br(T[("sem", "duelo", "SM", "duelos_def_pct")]["ic95_d"]),
        "ddt_t_sem": med("duelos_def_pct", "T_sem", 2),
        "ddt_t": med("duelos_def_pct", "T_sem", 3),
        "ddt_d": T[("sem", "duelo", "ST", "duelos_def_pct")]["d"],
        "ddt_q": br(T[("sem", "duelo", "ST", "duelos_def_pct")]["q"], 5),
        "ddt_ic": ic_br(T[("sem", "duelo", "ST", "duelos_def_pct")]["ic95_d"]),
        "dd_q_com_ST": br(T[("com", "duelo", "ST", "duelos_def_pct")]["q"], 5),
        "selo_dd_com_ST": T[("com", "duelo", "ST", "duelos_def_pct")]["selo"],
        # duelo aéreo
        "da_d": br(T[("sem", "duelo", "SM", "duelos_aereos_pct")]["d"], 3),
        "da_q": br(T[("sem", "duelo", "SM", "duelos_aereos_pct")]["q"], 5),
        # pressão
        "ppda_s_com": med("ppda", "S_com", 2),
        "ppda_m_com": med("ppda", "M_com", 2),
        "ppda_s": med("ppda", "S_sem", 3),
        "ppda_m": med("ppda", "M_sem", 3),
        "ppda_d": T[("sem", "pressao", "SM", "ppda")]["d"],
        "ppda_q": br(T[("sem", "pressao", "SM", "ppda")]["q"], 5),
        "rec_s_com": med("recuperacoes", "S_com", 2),
        "rec_m_com": med("recuperacoes", "M_com", 2),
        "rec_d": br(T[("sem", "pressao", "SM", "recuperacoes")]["d"], 3),
        "rec_q": br(T[("sem", "pressao", "SM", "recuperacoes")]["q"], 5),
        "int_s_com": med("intensidade", "S_com", 2),
        "int_m_com": med("intensidade", "M_com", 2),
        "int_d": T[("sem", "pressao", "SM", "intensidade")]["d"],
        "int_q": br(T[("sem", "pressao", "SM", "intensidade")]["q"], 5),
        # o que se cede
        "rc_s_com": med("remates_contra", "S_com", 2),
        "rc_m_com": med("remates_contra", "M_com", 2),
        "rca_s_com": med("remates_contra_aj", "S_com", 2),
        "rca_m_com": med("remates_contra_aj", "M_com", 2),
        "rca_s": med("remates_contra_aj", "S_sem", 3),
        "rca_m": med("remates_contra_aj", "M_sem", 3),
        "rca_d": br(T[("sem", "cede_ajustado", "SM", "remates_contra_aj")]["d"], 3),
        "rca_q": br(T[("sem", "cede_ajustado", "SM", "remates_contra_aj")]["q"], 5),
        "xgpr_s_com": br(med("xg_por_remate_contra", "S_com", 3), 3),
        "xgpr_m_com": br(med("xg_por_remate_contra", "M_com", 3), 3),
        "xgpr_d": br(T[("sem", "cede_ajustado", "SM", "xg_por_remate_contra")]["d"], 3),
        "xgpr_q": br(T[("sem", "cede_ajustado", "SM", "xg_por_remate_contra")]["q"], 5),
        "xgca_d": br(T[("sem", "cede_ajustado", "SM", "xg_contra_aj")]["d"], 3),
        "xgca_q": br(T[("sem", "cede_ajustado", "SM", "xg_contra_aj")]["q"], 5),
        "conf_xgpr": round(conf_xgpr, 2),
        # persistência dentro da temporada (é o que estes dois marcadores publicam)
        "porta_rec": porta["recuperacoes"]["rho"],
        "porta_posse": porta["posse"]["rho"],
        # a porta temporal da §6.4
        "porta_dd": br_sinal(p64["duelos_def_pct"]["parcial"], 3),
        "porta_dd_p": br(p64["duelos_def_pct"]["p_parcial"], 3),
        "porta_ppda": br_sinal(p64["ppda"]["parcial"], 3),
        "porta_int": br_sinal(p64["intensidade"]["parcial"], 3),
        "porta_xgpr_parcial": br_sinal(p64["xg_por_remate_contra"]["parcial"], 3),
        "porta_xgpr_p": br(p64["xg_por_remate_contra"]["p_parcial"], 4),
        "porta_n": p64["duelos_def_pct"]["n"],
        # a ressalva do elenco
        "ppda_valor": br_sinal(float(rho_v), 3),
    }

    json.dump({"gerado_por": "scripts/A06.py", "gerado_em": GERADO_EM, "numeros": numeros},
              open(os.path.join(R, "A06_numeros.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    # ---- conferência contra o publicado. Divergir é ACHADO: nada é consertado aqui, e este
    # script não escreve em A06.json. ----
    caminho_pub = os.path.join(R, "A06.json")
    publicados = (json.load(open(caminho_pub, encoding="utf-8")).get("numeros", {})
                  if os.path.exists(caminho_pub) else {})
    faltam = sorted(set(publicados) - set(numeros))
    divergem = [(m, publicados[m], numeros[m]) for m in publicados
                if m in numeros and str(numeros[m]) != str(publicados[m])]
    print(f"\n{'='*96}\nNÚMEROS — {len(numeros)} marcadores gravados em A06_numeros.json\n{'='*96}")
    print(f"  publicados em A06.json: {len(publicados)} · sem contraparte no script: {len(faltam)}"
          f" · divergentes: {len(divergem)}")
    for m in faltam:
        print(f"  FALTA   {m}: publicado {publicados[m]!r} e o script não o produz")
    for m, pubv, calc in divergem:
        print(f"  DIVERGE {m}: publicado {pubv!r} · o script dá {calc!r}")
    if not faltam and not divergem:
        print("  todos batem")


if __name__ == "__main__":
    main()
