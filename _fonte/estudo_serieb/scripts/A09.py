#!/usr/bin/env python3
"""A09 — Momentos do jogo: em que faixas de minutos cada faixa da tabela marca e sofre.

## Esta parte estava dada como impossível, e metade dela era mesmo

O `CLAUDE.md` registrou em 17/09, na seção "O que a base não tem": *"A09 não roda. Não existe
minuto do gol em dados/serieb_jogos.csv nem em serieb_jogos_2018_2021.csv — nenhuma das 119
colunas traz minuto ou tempo. Só coleta resolve."* Estava certo sobre a base e certo sobre o
remédio. Decisão do dono em 20/09: coletar.

A coleta é o `coletar_serieb_gols_por_minuto.py`, e ela é BARATA — dezoito páginas, não 1.782 —
porque o oGol já publica a conta por edição. O que ela traz, e o que ela não traz, está escrito
no cabeçalho de lá e repetido aqui em `A09_indicadores.json`.

**Metade da pergunta continua sem resposta**, e é a metade "como reage ao placar": o
aproveitamento quando o time marca primeiro e quando sofre primeiro exige saber quem marcou
primeiro em cada jogo, e a tabela agregada não diz. Isso NÃO vira conclusão nenhuma aqui — vira
"em aberto", com o caminho escrito.

## A unidade

Gols na faixa ÷ jogos da temporada. Não é percentual do total de gols do time, de propósito: a
proporção confunde "marca no fim" com "marca pouco no resto do jogo", e a pergunta é sobre
QUANDO, não sobre como o bolo se divide. A declaração registra essa escolha antes de rodar.

## O teto desta parte é PROVÁVEL, e não por fraqueza do achado

A porta temporal da §6.4 pede o indicador nas 19 primeiras rodadas prevendo os pontos das 19
últimas. O oGol publica a conta da temporada fechada, sem corte por rodada: a porta não roda, e
sem ela nenhuma conclusão passa de provável. É limite de dado, e está declarado.

Uso:
    python3 _fonte/estudo_serieb/scripts/A09.py
"""
import collections
import csv
import json
import os
import sys
import unicodedata

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import comparar, d_minimo, percentil_no_ano  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")

GERADO_EM = "2026-09-20"
RNG = np.random.default_rng(20260920)
FECHADAS = {"2022", "2023", "2024", "2025"}

# A ponte de clube do T01 cobre 49 dos 51 nomes do oGol. Estes dois são desta parte, e ficam
# escritos aqui em vez de entrarem no T01_ponte_clubes.json: aquele arquivo é saída do T01, e
# uma parte não reescreve a saída de outra.
PONTE_EXTRA = {"Operário Ferroviário": "Operário-PR", "Athletic-MG": "Athletic"}


def normal(t):
    t = unicodedata.normalize("NFD", str(t or ""))
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return " ".join(t.lower().replace("-", " ").split())


def base_dos_gols():
    """Uma linha por clube-temporada, com gols marcados e sofridos por faixa, por jogo."""
    ponte = json.load(open(os.path.join(R, "T01_ponte_clubes.json"), encoding="utf-8"))
    ponte = {**ponte, **PONTE_EXTRA}
    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    por_nome = {}
    for (temp, clube) in a01:
        por_nome.setdefault(normal(clube), clube)

    linhas = list(csv.DictReader(open(os.path.join(DADOS, "serieb_gols_por_minuto.csv"),
                                      encoding="utf-8")))
    juntas, sem_par = collections.defaultdict(dict), collections.Counter()
    for l in linhas:
        if l["temporada"] not in FECHADAS:
            continue
        nome = ponte.get(l["clube_ogol"], l["clube_ogol"])
        clube = por_nome.get(normal(nome))
        if not clube or (l["temporada"], clube) not in a01:
            sem_par[l["clube_ogol"]] += 1
            continue
        juntas[(l["temporada"], clube)][l["lado"]] = l

    base = []
    for (temp, clube), lados in sorted(juntas.items()):
        if set(lados) != {"marcados", "sofridos"}:
            continue
        a = a01[(temp, clube)]
        m, s = lados["marcados"], lados["sofridos"]
        jogos = int(m["jogos"])
        l = {"temporada": temp, "clube": clube, "faixa": a["faixa"],
             "trave": a["trave"] == "1", "fronteira": a["fronteira"] == "1",
             "jogos": jogos, "gols_pro": int(m["gols"]), "gols_contra": int(s["gols"])}
        for k in [c for c in m if c.startswith("faixa_")]:
            l["marca_" + k[len("faixa_"):]] = int(m[k]) / jogos
            l["sofre_" + k[len("faixa_"):]] = int(s[k]) / jogos
        l["marca_1t"] = int(m["primeiro_tempo"]) / jogos
        l["marca_2t"] = int(m["segundo_tempo"]) / jogos
        l["sofre_1t"] = int(s["primeiro_tempo"]) / jogos
        l["sofre_2t"] = int(s["segundo_tempo"]) / jogos
        base.append(l)
    return base, sem_par


def conferir_contra_a_base_do_app(base):
    """Os gols que o oGol conta batem com os que a base do app tem? Relata, não conserta.

    A divergência que aparecer é achado: o A01 já registrou 5 jogos faltando na base do app, e é
    exatamente onde as duas contas se afastam. Vai para o resumo e para a prova, nunca escondida.
    """
    app = collections.Counter()
    with open(os.path.join(DADOS, "serieb_jogos.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if r.get("Competição") != "Brazil. Serie B":
                continue
            ano = (r["Data"] or "")[:4]
            if ano in FECHADAS:
                app[ano] += int(float(r["golos_pro"] or 0))
    ogol = collections.Counter()
    for l in base:
        ogol[l["temporada"]] += l["gols_pro"]
    return {ano: {"ogol": ogol[ano], "base_do_app": app[ano], "diferenca": ogol[ano] - app[ano]}
            for ano in sorted(FECHADAS)}


# ==================================================================================================
# A SEGUNDA METADE: como cada faixa reage ao placar          (acrescentado em 20/09)
# ==================================================================================================
# A primeira metade sai da tabela AGREGADA do oGol (gols por faixa de minuto) e nao permite saber
# quem marcou primeiro em cada jogo. Esta metade sai da coleta JOGO A JOGO
# (coletar_serieb_primeiro_gol.py), em que cada jogo so entra depois de os gols lidos baterem com o
# proprio placar.
#
# Uma consequencia que muda o teto da parte: com dado por JOGO, a porta temporal da §6.4 volta a
# ser calculavel — da para medir as 19 primeiras rodadas e prever os pontos das 19 ultimas. A
# primeira metade nao permitia isso, e era por isso que ela parava no provavel.

JOGOS_PRIMEIRO_GOL = "serieb_jogos_primeiro_gol.csv"


def pontos_de(gp, gc):
    return 3 if gp > gc else (1 if gp == gc else 0)


def base_do_placar():
    """Uma linha por clube-temporada, com o que o time rende marcando e sofrendo primeiro.

    Cada jogo entra DUAS vezes, uma por clube, cada uma do ponto de vista dele. O `primeiro_gol_de`
    vem como "casa"/"fora" e aqui vira "a favor"/"contra" do clube da linha.
    """
    caminho = os.path.join(DADOS, JOGOS_PRIMEIRO_GOL)
    if not os.path.exists(caminho):
        return {}, {"motivo": f"{JOGOS_PRIMEIRO_GOL} nao existe: a coleta jogo a jogo nao rodou"}

    ponte = json.load(open(os.path.join(R, "T01_ponte_clubes.json"), encoding="utf-8"))
    ponte = {**ponte, **PONTE_EXTRA}
    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    por_nome = {}
    for (_t, clube) in a01:
        por_nome.setdefault(normal(clube), clube)

    por_ct, sem_par, jogos_lidos = collections.defaultdict(list), collections.Counter(), 0
    for j in csv.DictReader(open(caminho, encoding="utf-8")):
        if j["temporada"] not in FECHADAS:
            continue
        jogos_lidos += 1
        for lado in ("casa", "fora"):
            bruto = j[lado]
            clube = por_nome.get(normal(ponte.get(bruto, bruto)))
            if not clube or (j["temporada"], clube) not in a01:
                sem_par[bruto] += 1
                continue
            gp = int(j["gols_casa"] if lado == "casa" else j["gols_fora"])
            gc = int(j["gols_fora"] if lado == "casa" else j["gols_casa"])
            primeiro = j["primeiro_gol_de"]
            por_ct[(j["temporada"], clube)].append({
                "data": j["data"], "rodada": j["rodada"], "pts": pontos_de(gp, gc),
                "venceu": gp > gc,
                "marcou_primeiro": primeiro == lado,
                "sofreu_primeiro": bool(primeiro) and primeiro != lado,
                "min_primeiro": int(j["primeiro_gol_min"]) if j["primeiro_gol_min"] else None,
            })
    return por_ct, {"jogos_lidos": jogos_lidos, "sem_par_na_ponte": dict(sem_par)}


def medidas_do_placar(js):
    """Os sete indicadores declarados, para um clube-temporada. None onde o n nao sustenta."""
    com = [x for x in js if x["marcou_primeiro"]]
    sem = [x for x in js if x["sofreu_primeiro"]]
    # Um clube-temporada com menos de 4 jogos de um dos lados nao tem media que se leia: fica None,
    # e o `comparar` da casa simplesmente nao o usa naquele indicador.
    m = {
        "pj_marcando_primeiro": (sum(x["pts"] for x in com) / len(com)) if len(com) >= 4 else None,
        "pj_sofrendo_primeiro": (sum(x["pts"] for x in sem) / len(sem)) if len(sem) >= 4 else None,
        "pct_marca_primeiro": 100 * len(com) / len(js) if js else None,
        "pct_virada_quando_sofre": (100 * sum(1 for x in sem if x["venceu"]) / len(sem)
                                    if len(sem) >= 4 else None),
        "pct_perde_vantagem": (100 * sum(1 for x in com if not x["venceu"]) / len(com)
                               if len(com) >= 4 else None),
    }
    mp = [x["min_primeiro"] for x in com if x["min_primeiro"] is not None]
    mc = [x["min_primeiro"] for x in sem if x["min_primeiro"] is not None]
    m["min_primeiro_gol_pro"] = (sum(mp) / len(mp)) if len(mp) >= 4 else None
    m["min_primeiro_gol_contra"] = (sum(mc) / len(mc)) if len(mc) >= 4 else None
    return m


def porta_do_placar(por_ct, corte=19):
    """A porta da §6.4 sobre marcar primeiro: as 19 primeiras rodadas prevendo os pontos das 19
    ultimas, com a parcial dada aos pontos do 1o turno.

    Aqui ela RODA, e e a diferenca que o dado por jogo traz. A conta e a do scripts/
    _porta_temporal.py, pela mesma razao das outras partes: nao se reimplementa teste da casa.
    """
    import _porta_temporal as pt
    reg = []
    for (temporada, clube), js in por_ct.items():
        ordenados = sorted(js, key=lambda x: x["data"])
        t1, t2 = ordenados[:corte], ordenados[corte:]
        if len(t1) < corte or len(t2) < 10:
            continue
        com1 = [x for x in t1 if x["marcou_primeiro"]]
        reg.append({"temporada": temporada, "clube": clube,
                    "pts_1t": sum(x["pts"] for x in t1),
                    "pts_2t": sum(x["pts"] for x in t2),
                    "marca_primeiro_1t": 100 * len(com1) / len(t1)})
    if len(reg) < 20:
        return {"roda": False, "motivo": f"so {len(reg)} clube-temporadas com os dois turnos"}
    percentil_no_ano(reg, ["pts_1t", "pts_2t"])
    fora = pt.porta(reg, "marca_primeiro_1t", 1)
    return {"roda": True, "indicador": "marca_primeiro_1t",
            "definicao": ("fatia dos jogos em que o time marcou primeiro nas 19 primeiras rodadas "
                          "x pontos somados das 19 ultimas, em posto dentro do ano, com parcial "
                          "dada a pontuacao do 1o turno"),
            "conta_de": "scripts/_porta_temporal.py", **fora}


def main():
    dec = json.load(open(os.path.join(R, "A09_indicadores.json"), encoding="utf-8"))
    inds = [i for fam in dec["familias"] for i in fam["indicadores"]]
    sinal = {i["id"]: i["sinal"] for i in inds}
    nome = {i["id"]: i["nome"] for i in inds}

    base, sem_par = base_dos_gols()
    print(f"base: {len(base)} clube-temporadas · {len({l['clube'] for l in base})} clubes")
    if sem_par:
        print(f"  sem par na ponte de clube: {dict(sem_par)}")

    # ---- a segunda metade: o placar, jogo a jogo ----------------------------------------
    # Se a coleta jogo a jogo ainda nao rodou, a parte continua respondendo so a primeira metade:
    # os indicadores do placar ficam sem valor e o `comparar` nao os usa. Falha aberta de
    # proposito — e melhor a parte rodar com menos do que nao rodar.
    por_ct, nota_placar = base_do_placar()
    com_placar = 0
    for l in base:
        js = por_ct.get((l["temporada"], l["clube"]))
        if not js:
            continue
        l.update(medidas_do_placar(js))
        l["jogos_com_placar"] = len(js)
        com_placar += 1
    print(f"  placar jogo a jogo: {com_placar} de {len(base)} clube-temporadas · {nota_placar}")
    porta = porta_do_placar(por_ct) if por_ct else {"roda": False, "motivo": "sem coleta"}
    print(f"  porta da §6.4 sobre marcar primeiro: {porta}")

    conf = conferir_contra_a_base_do_app(base)
    print("  gols por temporada, oGol × base do app:")
    for ano, c in conf.items():
        print(f"    {ano}: {c['ogol']} × {c['base_do_app']}  ({c['diferenca']:+d})")

    percentil_no_ano(base, [i["id"] for i in inds])
    familias = [(f["id"], [i["id"] for i in f["indicadores"]]) for f in dec["familias"]]
    comparacoes = [
        ("SM", lambda l: l["faixa"] == "Sobe", lambda l: l["faixa"] == "Meio"),
        ("ST", lambda l: l["faixa"] == "Sobe", lambda l: l["trave"]),
        ("CM", lambda l: l["faixa"] == "Cai", lambda l: l["faixa"] == "Meio"),
    ]
    filtros = [("com", lambda l: True), ("sem", lambda l: not l["fronteira"])]
    res = comparar(base, familias, comparacoes, filtros, RNG, lambda i: sinal[i])
    for it in res:
        it["nome"] = nome[it["indicador"]]
        # A porta não roda nesta parte, e o selo do CSV não pode sugerir que rodou.
        it["porta_roda"] = 0
        it["teto_da_parte"] = "provável"

    with open(os.path.join(R, "A09_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(res[0]))
        w.writeheader()
        w.writerows(res)

    firmes = [r for r in res if r["selo"] == "firme"]
    firmes_nos_dois = []
    por_chave = collections.defaultdict(dict)
    for r in res:
        por_chave[(r["comparacao"], r["indicador"])][r["fronteira"]] = r
    for (comp, ind), d in por_chave.items():
        if len(d) == 2 and all(x["selo"] == "firme" for x in d.values()):
            firmes_nos_dois.append({"comparacao": comp, "indicador": ind,
                                    "q_com": d["com"]["q"], "q_sem": d["sem"]["q"],
                                    "d_com": d["com"]["d"], "d_sem": d["sem"]["d"]})

    poder = {"16x48": d_minimo(16, 48), "16x16": d_minimo(16, 16),
             "8x32": d_minimo(8, 32), "8x7": d_minimo(8, 7)}
    resumo = {
        "n": {"total": len(base),
              "sobe": sum(1 for l in base if l["faixa"] == "Sobe"),
              "meio": sum(1 for l in base if l["faixa"] == "Meio"),
              "cai": sum(1 for l in base if l["faixa"] == "Cai"),
              "trave": sum(1 for l in base if l["trave"]),
              "sobe_sem_fronteira": sum(1 for l in base
                                        if l["faixa"] == "Sobe" and not l["fronteira"]),
              "meio_sem_fronteira": sum(1 for l in base
                                        if l["faixa"] == "Meio" and not l["fronteira"])},
        "n_testes": len(res),
        "firmes_no_corte_com": len([r for r in firmes if r["fronteira"] == "com"]),
        "firmes_nos_dois_cortes": firmes_nos_dois,
        "poder_por_desenho": poder,
        "conferencia_da_coleta": conf,
        # A porta vale POR METADE da parte, e as duas metades tem dado diferente.
        "porta_6_4": {
            "primeira_metade_agregada": {
                "roda": False,
                "por_que": ("a tabela por faixa de minuto do oGol e da temporada FECHADA, sem "
                            "corte por rodada: nao ha como medir as 19 primeiras e prever as 19 "
                            "ultimas"),
                "consequencia": ("nenhuma conclusao apoiada so nela passa de provavel — e o caso "
                                 "de A09-1, A09-2 e A09-3")},
            "segunda_metade_jogo_a_jogo": porta},
    }
    json.dump(resumo, open(os.path.join(R, "A09_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    # ---- os números por marcador ----
    def med(f, campo):
        v = [l[campo] for l in base if f(l) and l.get(campo) is not None]
        return round(float(np.median(v)), 2) if v else None

    sobe = lambda l: l["faixa"] == "Sobe"                                    # noqa: E731
    meio = lambda l: l["faixa"] == "Meio"                                    # noqa: E731
    cai = lambda l: l["faixa"] == "Cai"                                      # noqa: E731
    sobe_sf = lambda l: l["faixa"] == "Sobe" and not l["fronteira"]          # noqa: E731
    meio_sf = lambda l: l["faixa"] == "Meio" and not l["fronteira"]          # noqa: E731
    cai_sf = lambda l: l["faixa"] == "Cai" and not l["fronteira"]            # noqa: E731

    numeros = {
        "n": len(base), "n_sobe": resumo["n"]["sobe"], "n_meio": resumo["n"]["meio"],
        "n_cai": resumo["n"]["cai"], "n_trave": resumo["n"]["trave"],
        "n_sobe_sf": resumo["n"]["sobe_sem_fronteira"],
        "n_meio_sf": resumo["n"]["meio_sem_fronteira"],
        "n_cai_sf": sum(1 for l in base if l["faixa"] == "Cai" and not l["fronteira"]),
        "n_testes": len(res), "n_faixas": 8,
        "n_firmes": len(firmes_nos_dois),
        "dmin_SM": poder["16x48"], "dmin_ST": poder["16x16"],
        "gols_pro_sobe": med(sobe, "gols_pro"), "gols_pro_meio": med(meio, "gols_pro"),
        "gols_contra_sobe": med(sobe, "gols_contra"), "gols_contra_meio": med(meio, "gols_contra"),
    }
    numeros["n_com_placar"] = com_placar
    if porta.get("roda"):
        numeros["porta_placar_parcial"] = porta["parcial"]
        numeros["porta_placar_p"] = round(porta["p_parcial"], 4)
        numeros["porta_placar_n"] = porta["n"]
    for i in inds:
        k = i["id"]
        numeros[f"{k}_sobe"] = med(sobe, k)
        numeros[f"{k}_meio"] = med(meio, k)
        numeros[f"{k}_cai"] = med(cai, k)
        numeros[f"{k}_sobe_sf"] = med(sobe_sf, k)
        numeros[f"{k}_meio_sf"] = med(meio_sf, k)
        numeros[f"{k}_cai_sf"] = med(cai_sf, k)
    json.dump({"gerado_por": "scripts/A09.py", "gerado_em": GERADO_EM, "numeros": numeros},
              open(os.path.join(R, "A09_numeros.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"\n{'='*96}\nA09 — {len(res)} testes · {len(firmes_nos_dois)} firmes NOS DOIS cortes"
          f"\n{'='*96}")
    print(f"{'família':8} {'comp':5} {'indicador':16} {'Sobe':>7} {'Meio':>7} {'d':>7} {'q':>9}  selo")
    for r in sorted(res, key=lambda x: (x["fronteira"], x["familia"], x["comparacao"], x["q"])):
        if r["fronteira"] != "com" or r["comparacao"] != "SM":
            continue
        print(f"{r['familia']:8} {r['comparacao']:5} {r['indicador']:16} "
              f"{r['cru_a']:7.2f} {r['cru_b']:7.2f} {r['d']:+7.3f} {r['q']:9.5f}  {r['selo']}")
    rotulo = ", ".join(f"{f['indicador']} ({f['comparacao']})" for f in firmes_nos_dois)
    print(f"\n  firmes nos dois cortes: {rotulo or 'nenhum'}")
    print(f"  A09_numeros.json: {len(numeros)} marcadores")
    return 0


if __name__ == "__main__":
    sys.exit(main())
