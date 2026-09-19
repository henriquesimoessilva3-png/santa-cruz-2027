#!/usr/bin/env python3
"""J04, passo 1 — a base do titular físico.

Monta a base jogador-temporada que a parte J04 vai testar, e mais nada: aqui não se compara
Sobe com Meio. A lista de indicadores já está fechada em `resultados/J04_indicadores.json`,
declarada ANTES de qualquer teste (regra da casa).

Escreve, e só:
    resultados/J04_ponte_clubes.json   a ponte de clube + a auditoria de identidade + a cobertura
    resultados/J04_base.csv            uma linha por jogador-temporada
Lê, e não altera: o banco copiado do SkillCorner, dados/serieb_tecnico.csv,
dados/minutagem_serieb.json e resultados/A01_clube_temporada.csv.

## Por que a base tem de ser montada aqui

O J01 deveria ter gerado `resultados/base_jogador_temporada.csv` e não gerou o que J04 precisa
(não tem físico nem sc_player_id). Esta base é própria de J04 e não encosta em arquivo do J01.

## A ponte de clube, e por que ela é curta

O `physical` (o agregado por temporada) NÃO tem clube. Quem tem clube é o `physical_match`, e
ele só existe em 2025 e 2026. Daí os 28 `team_name` em nome formal. A ponte é decidida pelas
TEMPORADAS, como em A04 e T01: em cada uma das duas temporadas os 20 nomes do SkillCorner têm
de cair exatamente sobre os 20 clubes que A01 diz que estavam na Série B naquele ano. O script
prova essa bijeção; se ela falhar, ele para. Pelo nome sozinho, cinco casos seriam ambíguos
("Grêmio Novorizontino", "Botafogo FC Ribeirão Preto", "Athletic Club (Minas Gerais)" contra
"Club Athletico Paranaense", "AC Goianiense", "SC do Recife") — a temporada resolve os cinco, e
eles vão listados no JSON como decididos pela temporada, não adivinhados.

## De onde vêm clube, posição e minutos em 2022-2024

Do Wyscout, pela ponte canônica da ESPECIFICACAO.md §1.1, que já existe em
`gerar_raio_serieb.py::carregar()`: `chave_nome` + janela de idade −2 ≤ Δ ≤ +3, descartando
automaticamente todo (ano, nome) que apareça com dois clubes ou duas posições. Aqui vai um
descarte a mais, que o original não faz: (ano, nome) que apareça com DOIS sc_player_id
diferentes também sai. Sem ele, três "Marcinho" do SkillCorner receberiam o clube do único
"Marcinho" do Wyscout — é a armadilha do homônimo registrada no _registro.md.

O `players.wyscout_player_id` existe em 2.079 de 2.105 linhas, mas não fecha a ponte: nenhuma
base do lado Wyscout neste repositório carrega esse id (conferido em serieb_tecnico.csv,
minutagem_serieb.json e jogadores.json — o campo `id_` deste último é idade). Ele entra na base
como coluna, para separar pessoas diferentes dentro do SkillCorner e para auditoria futura.

## A conferência independente

Em 2025 e 2026 dá para conferir a ponte contra o próprio SkillCorner: o clube de mais minutos
do jogador no `physical_match`, traduzido pela ponte de clube, tem de bater com o clube que o
Wyscout deu. O resultado da conferência vai no JSON.

Uso:
    python3 "_fonte/estudo_serieb/scripts/J04_base.py"
"""
import collections
import csv
import datetime as dt
import json
import os
import re
import sqlite3
import unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
DB = os.path.join(ESTUDO, "dados_copiados", "skillcorner_serieb.db")

ED = {335: 2022, 446: 2023, 773: 2024, 1061: 2025, 1399: 2026}
COL_CLUBE = "Equipa dentro de um período de tempo seleccionado"
MIN_MINUTOS = 900          # o corte do CLAUDE.md para entrar em percentil
MIN_RASTREADOS = 300       # gerar_raio_serieb.py: minutes_played × matches
POUCOS_JOGOS = 8           # ESPECIFICACAO.md §4.2
COBERTURA_BAIXA = 0.80     # declarado em J04_indicadores.json antes de medir
QUANTOS = {"Goleiro": 1, "Zaga": 2, "Lateral": 2, "Volante": 2, "Meia": 2,
           "Extremo": 2, "Atacante": 2}          # a regra de titular de J03.py

# A ponte de clube. Decidida pelas temporadas, provada abaixo por bijeção em 2025 e 2026.
PONTE = {
    "AC Goianiense": "Atlético-GO",
    "Amazonas FC": "Amazonas",
    "América Mineiro FC": "América-MG",
    "Associação Ferroviária de Esportes": "Ferroviária",
    "Athletic Club (Minas Gerais)": "Athletic",
    "Avaí Futebol Clube": "Avaí",
    "Botafogo FC Ribeirão Preto": "Botafogo-SP",
    "Ceará Sporting Club": "Ceará",
    "Chapecoense AF": "Chapecoense",
    "Club Athletico Paranaense": "Athletico-PR",
    "Clube Náutico Capibaribe": "Náutico",
    "Clube de Regatas Brasil": "CRB",
    "Clube do Remo": "Remo",
    "Coritiba FBC": "Coritiba",
    "Criciuma EC": "Criciúma",
    "Cuiaba Esporte Club": "Cuiabá",
    "Fortaleza EC": "Fortaleza",
    "Goiás EC": "Goiás",
    "Grêmio Novorizontino": "Novorizontino",
    "Juventude RS": "Juventude",
    "Londrina EC": "Londrina",
    "Operário Ferroviário EC": "Operário-PR",
    "Paysandu SC": "Paysandu",
    "Ponte Preta": "Ponte Preta",
    "SC do Recife": "Sport",
    "São Bernardo FC": "São Bernardo",
    "Vila Nova FC": "Vila Nova",
    "Volta Redonda FC": "Volta Redonda",
}
# Quem seria ambíguo se a decisão fosse pelo nome. A temporada resolve; fica escrito qual foi
# o outro candidato, para ninguém "melhorar" a ponte depois sem ver o que estava em jogo.
AMBIGUOS_PELO_NOME = {
    "Grêmio Novorizontino": ["Novorizontino", "Grêmio"],
    "Botafogo FC Ribeirão Preto": ["Botafogo-SP", "Botafogo"],
    "Athletic Club (Minas Gerais)": ["Athletic", "Athletico-PR"],
    "Club Athletico Paranaense": ["Athletico-PR", "Athletic"],
    "AC Goianiense": ["Atlético-GO", "Atlético-MG"],
    "SC do Recife": ["Sport", "Náutico"],
}


def chave_nome(s):
    s = unicodedata.normalize("NFD", str(s)).lower()
    s = "".join(x for x in s if unicodedata.category(x) != "Mn")
    return re.sub(r"[^a-z ]", "", s).strip()


def idade_em_setembro(nasc, ano):
    if not isinstance(nasc, str) or len(nasc) < 10:
        return None
    n = dt.date(int(nasc[:4]), int(nasc[5:7]), int(nasc[8:10]))
    r = dt.date(ano, 9, 11)
    return r.year - n.year - ((r.month, r.day) < (n.month, n.day))


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


# --------------------------------------------------------------------------- A01, a faixa
def ler_a01():
    clube_temp, por_ano = {}, collections.defaultdict(set)
    with open(os.path.join(R, "A01_clube_temporada.csv"), encoding="utf-8") as f:
        for r in csv.DictReader(f):
            a = int(r["temporada"])
            clube_temp[(a, r["clube"])] = r
            por_ano[a].add(r["clube"])
    return clube_temp, por_ano


# ------------------------------------------------- a ponte de clube, provada pelas temporadas
def provar_ponte(con, a01_por_ano):
    """Cada temporada com physical_match tem de ser uma bijeção sobre os 20 clubes do A01."""
    prova, erros = {}, []
    sc_por_ano = collections.defaultdict(set)
    for e, tn in con.execute("select distinct sc_competition_edition_id, team_name "
                             "from physical_match where team_name is not null"):
        sc_por_ano[ED[e]].add(tn)
    for ano in sorted(sc_por_ano):
        nomes = sc_por_ano[ano]
        destino = {PONTE.get(n) for n in nomes}
        falta = a01_por_ano[ano] - destino
        sobra = {n for n in nomes if PONTE.get(n) not in a01_por_ano[ano]}
        prova[str(ano)] = {
            "nomes_skillcorner": len(nomes), "clubes_a01": len(a01_por_ano[ano]),
            "bijecao": len(nomes) == len(destino) == len(a01_por_ano[ano]) and not falta,
            "clube_do_a01_sem_nome_no_skillcorner": sorted(falta),
            "nome_do_skillcorner_que_nao_cai_na_temporada": sorted(sobra),
        }
        if not prova[str(ano)]["bijecao"]:
            erros.append(f"{ano}: a ponte não é bijeção (falta {sorted(falta)}, sobra {sorted(sobra)})")
    nao_mapeados = sorted(n for ns in sc_por_ano.values() for n in ns if n not in PONTE)
    if nao_mapeados:
        erros.append(f"team_name sem destino na ponte: {nao_mapeados}")
    return prova, erros


# ------------------------------------------------------------------- o lado Wyscout, por ano
def ler_wyscout(setor_de):
    """(ano, chave_nome) -> dados, só quando o Wyscout não é ambíguo naquele ano."""
    bruto = collections.defaultdict(list)
    with open(os.path.join(DADOS, "serieb_tecnico.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            bruto[(int(r["ano"]), chave_nome(r["Jogador"]))].append(r)
    # O elegível vai por LINHA (ano, nome, clube, posição), como em J03.py: o titular tem de
    # ser exatamente o mesmo das duas partes, e J03 não descarta nome ambíguo — ele não precisa,
    # porque não vai buscar nada em outra base. Aqui o descarte de ambiguidade entra só na hora
    # de pendurar o físico. Duas linhas do mesmo nome, clube e posição são a mesma pessoa vinda
    # das duas planilhas que se sobrepõem no export: fica a de mais minutos.
    melhor = {}
    for (ano, k), g in bruto.items():
        for x in g:
            mi = num(x["Minutos jogados:"]) or 0
            ch = (ano, k, x[COL_CLUBE], x["posicao_1"])
            if ch not in melhor or mi > melhor[ch]["minutos_wy"]:
                melhor[ch] = {"temporada": ano, "chave": k, "jogador": x["Jogador"],
                              "clube": x[COL_CLUBE], "posicao": x["posicao_1"],
                              "setor": setor_de.get(x["posicao_1"]),
                              "idade_na_temporada": num(x["idade_na_temporada"]),
                              "minutos_wy": mi,
                              "jogos_wy": num(x["Partidas jogadas"]) or 0}
    ok, ambiguos = {}, []
    for (ano, k), g in bruto.items():
        clubes = {x[COL_CLUBE] for x in g}
        posicoes = {x["posicao_1"] for x in g}
        if len(clubes) != 1 or len(posicoes) != 1:
            ambiguos.append({"temporada": ano, "jogador": g[0]["Jogador"],
                             "clubes": sorted(clubes), "posicoes": sorted(posicoes),
                             "motivo": "mesmo nome com dois clubes ou duas posições no ano"})
            continue
        idades = [num(x["idade_na_temporada"]) for x in g]
        idades = [i for i in idades if i is not None]
        pos = g[0]["posicao_1"]
        ok[(ano, k)] = {
            "jogador": g[0]["Jogador"], "clube": g[0][COL_CLUBE], "posicao": pos,
            "setor": setor_de.get(pos),
            "idade_na_temporada": idades[0] if idades else None,
            "minutos_wy": max((num(x["Minutos jogados:"]) or 0) for x in g),
            "jogos_wy": max((num(x["Partidas jogadas"]) or 0) for x in g),
        }
    return ok, ambiguos, list(melhor.values())


def ler_fatia():
    d = json.load(open(os.path.join(DADOS, "minutagem_serieb.json"), encoding="utf-8"))
    c = d["colunas"]
    ia, ij, it, ifa = c.index("ano"), c.index("jogador"), c.index("time"), c.index("fatia_pct")
    return {(l[ia], chave_nome(l[ij]), l[it]): l[ifa] for l in d["linhas"]}


# ------------------------------------------------------------------------------------ físico
def ler_fisico(con, inds):
    cols = ", ".join(f"p.{i}" for i in inds)
    q = (f"select p.sc_player_id, p.sc_competition_edition_id, pl.nome, pl.short_name, "
         f"pl.birthdate, pl.wyscout_player_id, p.minutes_played, p.matches, {cols} "
         f"from physical p join players pl on pl.sc_player_id = p.sc_player_id")
    fixas = ["sc_player_id", "ed", "sc_nome", "sc_short_name", "nascimento",
             "wyscout_player_id", "sc_min_medio", "sc_matches"]
    linhas = []
    for r in con.execute(q):
        l = dict(zip(fixas + list(inds), r))
        l["temporada"] = ED[l.pop("ed")]
        l["sc_min_tot"] = (l["sc_min_medio"] or 0) * (l["sc_matches"] or 0)
        linhas.append(l)
    orfas = con.execute(
        "select count(*) from physical p where not exists "
        "(select 1 from players pl where pl.sc_player_id = p.sc_player_id)").fetchone()[0]
    return linhas, orfas


def ler_m60(con, colunas):
    """Reconstrói o agregado só com jogos de 60+ minutos. Só 2025 e 2026 têm physical_match."""
    acc = collections.defaultdict(lambda: collections.defaultdict(list))
    q = (f"select sc_player_id, sc_competition_edition_id, minutes_played, "
         f"{', '.join(colunas)} from physical_match where minutes_played >= 60")
    for r in con.execute(q):
        pid, ano, mi = r[0], ED[r[1]], r[2]
        for c, v in zip(colunas, r[3:]):
            if v is not None:
                acc[(pid, ano)][c].append((mi, v))
    saida = {}
    for chave, d in acc.items():
        linha = {}
        for c, pares in d.items():
            peso = sum(m for m, _ in pares)
            if not peso:
                continue
            # psv99 é pico: o valor da temporada é o maior do jogo, não a média ponderada.
            linha[c + "_m60"] = (max(v for _, v in pares) if c == "psv99"
                                 else sum(m * v for m, v in pares) / peso)
        saida[chave] = linha
    return saida


def clube_do_skillcorner(con):
    """Clube de mais minutos rastreados do jogador na temporada, pelo próprio SkillCorner."""
    acc = collections.defaultdict(collections.Counter)
    for pid, e, tn, mi in con.execute(
            "select sc_player_id, sc_competition_edition_id, team_name, minutes_played "
            "from physical_match where team_name is not null"):
        acc[(pid, ED[e])][tn] += mi or 0
    return {k: (PONTE.get(v.most_common(1)[0][0]), len(v)) for k, v in acc.items()}


# ------------------------------------------------------------------------------------- main
def main():
    dec = json.load(open(os.path.join(R, "J04_indicadores.json"), encoding="utf-8"))
    setor_de = {p: s for s, ps in dec["setores"].items() for p in ps}
    inds = [i["id"] for fam in dec["familias"] for i in fam["indicadores"]]
    cols_m60 = dec["regra_dos_60_minutos"]["colunas_m60_possiveis"]
    anos_recorte = set(dec["recorte"]["temporadas"])

    clube_temp, a01_por_ano = ler_a01()
    con = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)

    prova, erros = provar_ponte(con, a01_por_ano)
    if erros:
        raise SystemExit("A ponte de clube não fecha pelas temporadas:\n  " + "\n  ".join(erros))
    print(f"ponte de clube: {len(PONTE)} nomes, bijeção provada em "
          f"{', '.join(k for k, v in prova.items() if v['bijecao'])}")

    wy, wy_ambiguos, wy_linhas = ler_wyscout(setor_de)
    fatia = ler_fatia()
    fis, orfas = ler_fisico(con, inds)
    m60 = ler_m60(con, cols_m60)
    sc_clube = clube_do_skillcorner(con)
    print(f"physical: {len(fis) + orfas} linhas, {orfas} sem cadastro em `players` (perdidas)")
    print(f"Wyscout: {len(wy)} chaves ano+nome sem ambiguidade, {len(wy_ambiguos)} ambíguas")

    # ---- casamento SkillCorner -> Wyscout
    dup_sc = collections.Counter((l["temporada"], chave_nome(l["sc_short_name"])) for l in fis)
    casadas, perdas, homonimos_sc = [], collections.Counter(), []
    for l in fis:
        k = (l["temporada"], chave_nome(l["sc_short_name"]))
        w = wy.get(k)
        if w is None:
            perdas["sem nome igual no Wyscout (ou nome ambíguo lá)"] += 1
            continue
        if dup_sc[k] > 1:
            perdas["mesmo nome com mais de um jogador no SkillCorner"] += 1
            homonimos_sc.append({"temporada": l["temporada"], "nome_curto": l["sc_short_name"],
                                 "nome_completo": l["sc_nome"], "sc_player_id": l["sc_player_id"],
                                 "wyscout_player_id": l["wyscout_player_id"]})
            continue
        i_sc = idade_em_setembro(l["nascimento"], l["temporada"])
        i_wy = w["idade_na_temporada"]
        if i_sc is not None and i_wy is not None and not (-2 <= i_sc - i_wy <= 3):
            perdas["idade fora da janela (−2 a +3): não é a mesma pessoa"] += 1
            continue
        l.update(w)
        casadas.append(l)
    print(f"casadas: {len(casadas)}  " + "  ".join(f"[{k}: {v}]" for k, v in perdas.items()))

    # ---- titular: a regra de J03, escolhida no lado WYSCOUT, antes de olhar o físico
    elegivel_wy = [w for w in wy_linhas
                   if w["setor"] and w["minutos_wy"] >= MIN_MINUTOS
                   and (w["temporada"], w["clube"]) in clube_temp]
    por_ct = collections.defaultdict(list)
    for w in elegivel_wy:
        por_ct[(w["temporada"], w["clube"], w["setor"])].append(w)
    titular = {}
    for (a, c, s), g in por_ct.items():
        g.sort(key=lambda w: (-w["minutos_wy"], w["chave"]))
        for ordem, w in enumerate(g[:QUANTOS[s]], 1):
            titular[(a, w["chave"], c, w["posicao"])] = ordem
    conferencia_j03 = collections.Counter(
        (w["setor"], clube_temp[(w["temporada"], w["clube"])]["faixa"])
        for w in elegivel_wy if w["temporada"] in anos_recorte
        and (w["temporada"], w["chave"], w["clube"], w["posicao"]) in titular)
    print(f"titulares pela regra de J03: {len(titular)} em 2022-2026, "
          f"{sum(conferencia_j03.values())} no recorte 2022-2025 "
          f"(J03_resumo.json diz 907 — tem de bater)")

    # ---- cobertura: quem é elegível tem físico?
    com_fisico = {(l["temporada"], chave_nome(l["sc_short_name"]), l["clube"]) for l in casadas
                  if l["sc_min_tot"] >= MIN_RASTREADOS}
    # Existe no SkillCorner ≠ dá para usar. Separar as duas coisas é o que diz se o buraco é da
    # fonte (o atleta não foi rastreado) ou da ponte (foi, mas o nome não fecha sem adivinhar).
    existe_sc = {(l["temporada"], chave_nome(l["sc_short_name"])) for l in fis}
    cob_ct, cob_ano = {}, collections.defaultdict(lambda: collections.Counter())
    for w in elegivel_wy:
        ct = (w["temporada"], w["clube"])
        d = cob_ct.setdefault(ct, {"n_900": 0, "n_900_gk": 0, "n_900_rastreado": 0,
                                   "n_900_com_fisico": 0,
                                   "min_rastreados": 0.0, "n_fisico_total": 0})
        if w["setor"] == "Goleiro":
            d["n_900_gk"] += 1
            continue
        d["n_900"] += 1
        if (w["temporada"], w["chave"]) in existe_sc:
            d["n_900_rastreado"] += 1
        if (w["temporada"], w["chave"], w["clube"]) in com_fisico:
            d["n_900_com_fisico"] += 1
    for l in casadas:
        ct = (l["temporada"], l["clube"])
        if ct in cob_ct:
            cob_ct[ct]["n_fisico_total"] += 1
            cob_ct[ct]["min_rastreados"] += l["sc_min_tot"]
    for ct, d in cob_ct.items():
        d["pct"] = round(100 * d["n_900_com_fisico"] / d["n_900"], 1) if d["n_900"] else None
        d["pct_rastreado"] = (round(100 * d["n_900_rastreado"] / d["n_900"], 1)
                              if d["n_900"] else None)
        d["cobertura_baixa"] = int(d["pct"] is not None and d["pct"] < 100 * COBERTURA_BAIXA)
        d["min_rastreados"] = round(d["min_rastreados"])
        a = ct[0]
        cob_ano[a]["clubes"] += 1
        cob_ano[a]["n_900"] += d["n_900"]
        cob_ano[a]["n_900_rastreado"] += d["n_900_rastreado"]
        cob_ano[a]["n_900_com_fisico"] += d["n_900_com_fisico"]
        cob_ano[a]["n_900_gk"] += d["n_900_gk"]
        cob_ano[a]["clubes_cobertura_baixa"] += d["cobertura_baixa"]
        cob_ano[a]["jogador_temporada_com_fisico"] += d["n_fisico_total"]

    # ---- conferência da ponte contra o próprio SkillCorner (2025 e 2026)
    conf = collections.Counter()
    divergencias = []
    for l in casadas:
        v = sc_clube.get((l["sc_player_id"], l["temporada"]))
        if not v:
            l["clube_sc"], l["clube_confere"], l["clubes_no_ano_sc"] = "", "", ""
            conf["sem jogo rastreado (2022-2024 não tem physical_match)"] += 1
            continue
        l["clube_sc"], l["clubes_no_ano_sc"] = v[0] or "", v[1]
        l["clube_confere"] = int(v[0] == l["clube"])
        conf["confere" if l["clube_confere"] else "diverge"] += 1
        if not l["clube_confere"]:
            divergencias.append({
                "temporada": l["temporada"], "jogador": l["jogador"],
                "nome_skillcorner": l["sc_nome"], "sc_player_id": l["sc_player_id"],
                "clube_wyscout": l["clube"], "clube_skillcorner": v[0],
                "clubes_rastreados_no_ano": v[1],
                "leitura": ("trocou de clube dentro da temporada: o SkillCorner rastreou dois, "
                            "o Wyscout guardou um" if v[1] > 1 else
                            "um clube só dos dois lados, e eles não batem — conferir antes de usar")})

    # ---- a base
    campos = ["temporada", "clube", "faixa", "trave", "fronteira", "dist_g4", "no_recorte",
              "jogador", "posicao", "setor", "idade_na_temporada",
              "sc_player_id", "sc_nome", "sc_short_name", "wyscout_player_id", "nascimento",
              "minutos_wy", "jogos_wy", "fatia_pct",
              "sc_matches", "sc_min_medio", "sc_min_tot", "sc_poucos_jogos",
              "tem_fisico", "elegivel", "titular", "titular_ordem",
              "clube_sc", "clube_confere", "clubes_no_ano_sc",
              "cobertura_clube_pct", "cobertura_baixa"] + inds + [c + "_m60" for c in cols_m60]

    def linha_base(temporada, clube, jogador, posicao, setor, idade, minutos, jogos, chave,
                   f=None):
        ct = clube_temp.get((temporada, clube), {})
        cob = cob_ct.get((temporada, clube), {})
        l = {c: "" for c in campos}
        l.update(
            temporada=temporada, clube=clube, faixa=ct.get("faixa", ""),
            trave=ct.get("trave", ""), fronteira=ct.get("fronteira", ""),
            dist_g4=ct.get("dist_g4", ""), no_recorte=int(temporada in anos_recorte),
            jogador=jogador, posicao=posicao, setor=setor, idade_na_temporada=idade,
            minutos_wy=minutos, jogos_wy=jogos,
            fatia_pct=fatia.get((temporada, chave_nome(jogador), clube), ""),
            titular=int((temporada, chave, clube, posicao) in titular),
            titular_ordem=titular.get((temporada, chave, clube, posicao), ""),
            cobertura_clube_pct=cob.get("pct", ""), cobertura_baixa=cob.get("cobertura_baixa", ""),
            tem_fisico=int(f is not None))
        if f is None:
            l["elegivel"] = 0
            return l
        l.update({k: f.get(k) for k in inds})
        l.update({c + "_m60": m60.get((f["sc_player_id"], temporada), {}).get(c + "_m60", "")
                  for c in cols_m60})
        l.update(sc_player_id=f["sc_player_id"], sc_nome=f["sc_nome"],
                 sc_short_name=f["sc_short_name"], wyscout_player_id=f["wyscout_player_id"] or "",
                 nascimento=f["nascimento"], sc_matches=f["sc_matches"],
                 sc_min_medio=round(f["sc_min_medio"], 1) if f["sc_min_medio"] else "",
                 sc_min_tot=round(f["sc_min_tot"]),
                 sc_poucos_jogos=int((f["sc_matches"] or 0) < POUCOS_JOGOS),
                 clube_sc=f.get("clube_sc", ""), clube_confere=f.get("clube_confere", ""),
                 clubes_no_ano_sc=f.get("clubes_no_ano_sc", ""))
        l["elegivel"] = int(minutos >= MIN_MINUTOS and setor != "Goleiro"
                            and f["sc_min_tot"] >= MIN_RASTREADOS
                            and all(f.get(i) is not None for i in inds))
        return l

    base, vistos = [], set()
    for l in casadas:
        if (l["temporada"], l["clube"]) not in clube_temp:
            continue                      # clube fora da Série B naquele ano: não existe faixa
        chave = chave_nome(l["sc_short_name"])
        base.append(linha_base(l["temporada"], l["clube"], l["jogador"], l["posicao"],
                               l["setor"], l["idade_na_temporada"], l["minutos_wy"],
                               l["jogos_wy"], chave, l))
        vistos.add((l["temporada"], chave, l["clube"]))
    sem_fisico = 0
    for w in elegivel_wy:                 # 900+ minutos e sem físico: entram, vazios, para contar
        if (w["temporada"], w["chave"], w["clube"]) in vistos:
            continue
        base.append(linha_base(w["temporada"], w["clube"], w["jogador"], w["posicao"],
                               w["setor"], w["idade_na_temporada"], w["minutos_wy"],
                               w["jogos_wy"], w["chave"]))
        sem_fisico += 1
    base.sort(key=lambda l: (l["temporada"], l["clube"], l["setor"], -(l["minutos_wy"] or 0)))

    with open(os.path.join(R, "J04_base.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=campos)
        w.writeheader()
        w.writerows(base)

    # ---- o JSON da ponte, da identidade e da cobertura
    tit = [l for l in base if l["titular"] and l["no_recorte"]]
    saida = {
        "parte": "J04",
        "gerado_em": dt.date.today().isoformat(),
        "o_que_e": ("A ponte de nome de clube do SkillCorner para o nome do A01, mais a "
                    "auditoria de identidade jogador a jogador e a cobertura física — as três "
                    "coisas que o CLAUDE.md manda medir ANTES de usar dado físico."),
        "fonte": "physical_match.team_name do skillcorner_serieb.db (copiado em 19/09/2026)",
        "regra": ("Decidida pelas TEMPORADAS, como em A04_ponte_clubes.json e "
                  "T01_ponte_clubes.json: em cada temporada com physical_match os nomes do "
                  "SkillCorner caem um a um sobre os clubes que A01 diz que estavam na Série B "
                  "naquele ano. Caso ambíguo pelo nome é listado, nunca adivinhado."),
        "limite": ("O team_name só existe no physical_match, e o physical_match só existe em "
                   "2025 e 2026. Por isso a ponte tem 28 nomes e não mais: são os 20 clubes de "
                   "2025 e os 20 de 2026, com 12 em comum. Em 2022-2024 o clube do jogador vem "
                   "do Wyscout, não do SkillCorner."),
        "mapa": dict(sorted(PONTE.items())),
        "n": len(PONTE),
        "prova_por_temporada": prova,
        "ambiguos_pelo_nome_resolvidos_pela_temporada": [
            {"nome_skillcorner": k, "escolhido": v[0], "outro_candidato": v[1],
             "por_que": f"{v[1]} não estava na Série B nas temporadas em que este nome aparece"}
            for k, v in sorted(AMBIGUOS_PELO_NOME.items())],

        "identidade_jogador": {
            "regra": ("Ponte canônica da ESPECIFICACAO.md §1.1 (gerar_raio_serieb.py::carregar): "
                      "chave de nome sem acento + janela de idade −2 ≤ Δ ≤ +3. Descarte "
                      "automático dos dois lados: (ano, nome) com dois clubes ou duas posições "
                      "no Wyscout, e (ano, nome) com dois sc_player_id no SkillCorner."),
            "por_que_o_wyscout_player_id_nao_fecha_a_ponte": (
                "A `players` tem o id em 2.079 de 2.105 linhas, mas nenhuma base do lado Wyscout "
                "neste repositório carrega esse id: serieb_tecnico.csv não tem coluna de id, "
                "minutagem_serieb.json também não, e o campo `id_` de dados/jogadores.json é "
                "idade (conferido). O id entra na base como coluna e serve para separar pessoas "
                "diferentes dentro do SkillCorner, não para casar com o Wyscout."),
            "linhas_physical": len(fis) + orfas,
            "linhas_physical_sem_cadastro_em_players": orfas,
            "casadas": len(casadas),
            "perdidas": dict(perdas),
            "homonimos_no_skillcorner_descartados": homonimos_sc,
            "ambiguos_no_wyscout_descartados": len(wy_ambiguos),
            "ambiguos_no_wyscout_exemplos": wy_ambiguos[:15],
        },
        "conferencia_independente_do_clube": {
            "como": ("Em 2025 e 2026 o próprio SkillCorner diz o clube, no physical_match. O "
                     "clube de mais minutos rastreados, traduzido pela ponte, é comparado com o "
                     "clube que o Wyscout deu."),
            "resultado": dict(conf),
            "taxa_de_acerto_pct": (round(100 * conf["confere"] /
                                         (conf["confere"] + conf["diverge"]), 1)
                                   if (conf["confere"] + conf["diverge"]) else None),
            "divergencias": divergencias,
            "leitura": ("As divergências não são homônimo: são troca de clube dentro da "
                        "temporada. O agregado físico do SkillCorner mistura os dois clubes e o "
                        "Wyscout guarda um. Ficam marcadas em `clube_confere = 0` na base, e a "
                        "comparação de J04 roda com e sem elas."),
        },
        "cobertura_por_temporada": {
            str(a): {"clubes": d["clubes"],
                     "jogador_temporada_com_fisico": d["jogador_temporada_com_fisico"],
                     "elegiveis_900min_sem_goleiro": d["n_900"],
                     "elegiveis_rastreados_pelo_skillcorner": d["n_900_rastreado"],
                     "elegiveis_com_fisico": d["n_900_com_fisico"],
                     "cobertura_da_fonte_pct": round(100 * d["n_900_rastreado"] / d["n_900"], 1)
                     if d["n_900"] else None,
                     "cobertura_pct": round(100 * d["n_900_com_fisico"] / d["n_900"], 1)
                     if d["n_900"] else None,
                     "goleiros_900min_sem_nenhum_fisico": d["n_900_gk"],
                     "clubes_com_cobertura_baixa": d["clubes_cobertura_baixa"]}
            for a, d in sorted(cob_ano.items())},
        "cobertura_por_clube_temporada": {
            f"{a}|{c}": cob_ct[(a, c)] for a, c in sorted(cob_ct)},
        "cobertura_regra": {
            "corte": f"cobertura_baixa = 1 quando menos de {int(COBERTURA_BAIXA*100)}% dos "
                     "jogadores de 900+ minutos do clube-temporada têm dado físico",
            "declarado_antes_de_medir": True,
            "nao_impute": "Nenhum valor físico é preenchido por média, mediana ou vizinho. "
                          "Quem não tem, não tem, e a linha fica com tem_fisico = 0.",
            "goleiro": "O SkillCorner não rastreia goleiro. Goleiro não é cobertura baixa: é "
                       "ausência declarada, e o setor Goleiro não produz teste em J04.",
        },
        "titulares": {
            "regra": dec["quem_e_titular"]["regra"],
            "conferencia_contra_j03": {
                "como": ("A regra foi re-rodada aqui sobre as mesmas linhas do Wyscout. O total "
                         "e a contagem por setor e faixa têm de bater com J03_resumo.json, "
                         "senão as duas partes não estão falando dos mesmos titulares."),
                "total_2022_2025": sum(conferencia_j03.values()),
                "j03_resumo_diz": 907,
                "bate": sum(conferencia_j03.values()) == 907,
                "por_setor_sobe_meio": {s: {"sobe": conferencia_j03[(s, "Sobe")],
                                            "meio": conferencia_j03[(s, "Meio")]}
                                        for s in QUANTOS},
            },
            "total_no_recorte_2022_2025": len(tit),
            "com_fisico": sum(1 for l in tit if l["tem_fisico"]),
            "sem_fisico": sum(1 for l in tit if not l["tem_fisico"]),
            "por_setor_e_faixa": {
                f"{s}|{fx}": {
                    "titulares": sum(1 for l in tit if l["setor"] == s and l["faixa"] == fx),
                    "com_fisico": sum(1 for l in tit if l["setor"] == s and l["faixa"] == fx
                                      and l["tem_fisico"]),
                    "elegivel_para_o_teste": sum(1 for l in tit if l["setor"] == s
                                                 and l["faixa"] == fx and l["elegivel"])}
                for s in QUANTOS for fx in ("Sobe", "Meio", "Cai")},
            "trave_por_setor": {
                s: {"titulares": sum(1 for l in tit if l["setor"] == s and l["trave"] == "1"),
                    "elegivel_para_o_teste": sum(1 for l in tit if l["setor"] == s
                                                 and l["trave"] == "1" and l["elegivel"])}
                for s in QUANTOS},
            "sem_fronteira_por_setor_e_faixa": {
                f"{s}|{fx}": sum(1 for l in tit if l["setor"] == s and l["faixa"] == fx
                                 and l["elegivel"] and l["fronteira"] == "0")
                for s in QUANTOS for fx in ("Sobe", "Meio", "Cai")},
        },
        "base": {
            "arquivo": "J04_base.csv",
            "linhas": len(base),
            "com_fisico": sum(1 for l in base if l["tem_fisico"]),
            "sem_fisico_900min": sem_fisico,
            "elegiveis_para_percentil": sum(1 for l in base if l["elegivel"]),
            "elegiveis_no_recorte_2022_2025": sum(1 for l in base
                                                  if l["elegivel"] and l["no_recorte"]),
            "indicadores": inds,
            "colunas_m60": [c + "_m60" for c in cols_m60],
        },
    }
    json.dump(saida, open(os.path.join(R, "J04_ponte_clubes.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    # ------------------------------------------------------------------------------ relatório
    print(f"\n{'='*94}\nCOBERTURA FÍSICA POR TEMPORADA (o CLAUDE.md manda informar antes de usar)\n{'='*94}")
    print(f"  {'ano':5s} {'clubes':>6s} {'com físico':>11s} {'900+ min':>9s} {'rastreado':>10s} "
          f"{'usável':>7s} {'fonte':>7s} {'ponte':>7s} {'GK 900+':>8s} {'clubes baixa':>13s}")
    for a, d in saida["cobertura_por_temporada"].items():
        print(f"  {a:5s} {d['clubes']:6d} {d['jogador_temporada_com_fisico']:11d} "
              f"{d['elegiveis_900min_sem_goleiro']:9d} "
              f"{d['elegiveis_rastreados_pelo_skillcorner']:10d} "
              f"{d['elegiveis_com_fisico']:7d} {str(d['cobertura_da_fonte_pct'])+'%':>7s} "
              f"{str(d['cobertura_pct'])+'%':>7s} "
              f"{d['goleiros_900min_sem_nenhum_fisico']:8d} "
              f"{d['clubes_com_cobertura_baixa']:13d}")
    baixa = [(k, v) for k, v in saida["cobertura_por_clube_temporada"].items()
             if v["cobertura_baixa"]]
    print(f"\n  clube-temporada com cobertura abaixo de {int(COBERTURA_BAIXA*100)}%: {len(baixa)}")
    for k, v in sorted(baixa, key=lambda x: x[1]["pct"]):
        print(f"    {k:28s} {v['n_900_com_fisico']:2d} de {v['n_900']:2d} "
              f"({v['pct']}%) · {v['min_rastreados']} min rastreados")

    print(f"\n{'='*94}\nTITULARES NO RECORTE 2022-2025, PELA REGRA DE J03\n{'='*94}")
    print(f"  {'setor':10s} " + "".join(f"{f:>18s}" for f in ("Sobe", "Meio", "Cai")))
    for s in QUANTOS:
        cel = []
        for fx in ("Sobe", "Meio", "Cai"):
            d = saida["titulares"]["por_setor_e_faixa"][f"{s}|{fx}"]
            cel.append(f"{d['com_fisico']} de {d['titulares']}")
        print(f"  {s:10s} " + "".join(f"{c:>18s}" for c in cel))
    print(f"\n  total: {saida['titulares']['total_no_recorte_2022_2025']} titulares, "
          f"{saida['titulares']['com_fisico']} com físico, "
          f"{saida['titulares']['sem_fisico']} sem")
    print(f"\ngravado: J04_ponte_clubes.json · J04_base.csv ({len(base)} linhas)")


if __name__ == "__main__":
    main()
