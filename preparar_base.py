#!/usr/bin/env python3
"""Gera a base de jogadores do app Santa Cruz 2027.

Une duas fontes do Botafogo Analytics:

  1. fim_contrato_<periodo>.json  — cadastro largo, vindo do Transfermarkt e amigos.
     Enxerga o elenco inteiro dos clubes (40 mil jogadores), traz nome completo,
     contrato com consenso de varias fontes e a faixa salarial do TransferRoom.
  2. rankings_<periodo>.json      — os indicadores tecnicos e as notas do ranking,
     que so existem para quem tem minutagem suficiente (18 mil jogadores).

O cadastro vem da fonte 1; a fonte 2 acrescenta as notas a quem estiver nela.
"""
import json
import os
import sys

BASE_RANKING = ("/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/"
                "fut/BOTA/Analytics/Portal Ranking/output")
AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, "dados", "jogadores.json")

GRUPO_PARA_POS = {
    "Goleiro": "GOL", "Lateral Direito": "LD", "Lateral Esquerdo": "LE",
    "Zagueiro - Direita": "ZD", "Zagueiro - Esquerda": "ZE", "Volante": "VOL",
    "Medio": "MED", "Meia": "MEI", "Extremo - Esquerda": "EE",
    "Extremo - Direita": "ED", "Atacante": "CA",
}


def num(v, casas=None):
    if v is None or v == "":
        return None
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    if casas is not None:
        f = round(f, casas)
    return int(f) if f == int(f) else f


# =============================================================================================
# FISICO QUE FALTA, PELA BASE DO ESTUDO V2 (PROMPT_ABA_FISICO.md, item 5)
# =============================================================================================
# O SkillCorner do Portal traz so a foto atual. Quem hoje joga numa liga sem rastreio (Japao,
# Serie C) fica sem fisico — mesmo tendo jogado a Serie B de 2022 a 2026, que o estudo V2
# copiou inteira em `Santa Cruz V2/bases/skillcorner/skillcorner_serieb.db`. Aqui, para quem
# nao tem fisico, busca-se a temporada MAIS RECENTE com >= 5 jogos naquele banco.
#
# A identidade e' conferida em CADEIA, porque homonimo e' a armadilha classica
# (Santa Cruz V2/ARMADILHAS.md: Ronald, Luan, Guilherme, David tem mais de um):
#   1. nome sem pontuacao igual (a mesma `chave` do V2, dos dois lados);
#   2. idade do app a +-1 ano da data de nascimento do SkillCorner;
#   3. CLUBE DE PASSAGEM: o clube daquela temporada (ponte SkillCorner->Wyscout do V2,
#      resultados/b1/base_fisico.csv) aparece nos elencos do Transfermarkt do mesmo ano com
#      o mesmo nome e a MESMA data de nascimento (bases/serieb_elencos.csv) — segunda fonte;
#   4. posicao compativel (zaga, lateral, meio, ataque);
#   5. um candidato so'. Na duvida, nao casa.
# Quem casa ganha `fis_src` ("Serie B 2025 · America-MG"): e' fisico de OUTRA temporada e de
# outro clube, e a aba e o card dizem isso. Esse jogador NAO entra na regua (coorte) da aba.
V2 = os.path.join(AQUI, "Santa Cruz V2")
V2_DB = os.path.join(V2, "bases", "skillcorner", "skillcorner_serieb.db")
POS_SETOR = {"ZD": "Zaga", "ZE": "Zaga", "LD": "Lateral", "LE": "Lateral", "VOL": "Volante",
             "MED": "Meia", "MEI": "Meia", "ED": "Extremo", "EE": "Extremo", "CA": "Atacante"}
GRUPOS_POS = [{"Zaga"}, {"Lateral"}, {"Volante", "Meia"}, {"Meia", "Extremo", "Atacante"}]
# campo do app <- coluna do banco do V2 (tabela physical, e off_ball_runs para as corridas)
CAMPOS_V2 = {"psv": "psv99", "psv5": "psv99_top5", "dist": "distance_p90", "mmin": "m_per_min",
             "run": "running_distance_p90", "hsr": "hsr_distance_p90", "hsr_n": "hsr_count_p90",
             "spr_km": "sprint_distance_p90", "spr_n": "sprint_count_p90", "hi": "hi_distance_p90",
             "hi_n": "hi_count_p90", "acel": "high_accel_p90", "desa": "high_decel_p90",
             "acel_m": "medium_accel_p90", "desa_m": "medium_decel_p90",
             "expl": "expl_accel_sprint_p90", "cod": "cod_count_p90",
             "mm_c": "m_per_min_tip", "mm_s": "m_per_min_otip",
             "hi_c": "hi_distance_p30tip", "hi_s": "hi_distance_p30otip",
             "spn_c": "sprint_count_p30tip", "spn_s": "sprint_count_p30otip"}
CAMPOS_OBR = {"obr_hsr": "runs_above_hsr_p30tip", "obr_area": "runs_penalty_area_p30tip",
              "obr_per": "runs_dangerous_p30tip", "obr_rec": "runs_received_p30tip",
              "obr_rem": "runs_shot_within_10s_p30tip"}
ANO_REF = 2026


def completar_fisico_v2(saida):
    """Preenche o fisico de quem nao tem, a partir do banco do V2. Devolve a contagem."""
    if not os.path.exists(V2_DB):
        print("    (sem o banco do V2 — fisico de outras temporadas nao preenchido)")
        return 0
    import csv
    import sqlite3
    sys.path.insert(0, os.path.join(V2, "scripts"))
    from _comum import chave, CLUBE_TM, EDICOES   # a MESMA chave de nome do estudo V2

    con = sqlite3.connect(V2_DB)
    con.row_factory = sqlite3.Row
    edi_ano = {int(k): v for k, v in EDICOES.items()}
    fis = {}
    for r in con.execute("select * from physical"):
        fis[(r["sc_player_id"], edi_ano.get(r["sc_competition_edition_id"]))] = dict(r)
    obr = {}
    for r in con.execute("select * from off_ball_runs"):
        obr[(r["sc_player_id"], edi_ano.get(r["sc_competition_edition_id"]))] = dict(r)
    jog = {r["sc_player_id"]: dict(r) for r in con.execute("select * from players")}
    # Variantes do nome do SkillCorner: o curto, o completo e o PRIMEIRO + ULTIMO do completo.
    # A terceira existe porque o SkillCorner guarda "J. Costa" / "Jonathan Aparecido de Oliveira
    # da Costa", e o app conhece "Jonathan Costa". Ela so e' segura porque a cadeia de baixo
    # (idade, clube no ano, nascimento no Transfermarkt) continua exigida inteira.
    def variantes(r):
        v = {chave(r.get("short_name")), chave(r.get("nome"))}
        partes = chave(r.get("nome")).split()
        if len(partes) >= 2:
            v.add(partes[0] + " " + partes[-1])
        return v - {""}
    por_nome = {}
    for pid, r in jog.items():
        for nm in variantes(r):
            por_nome.setdefault(nm, set()).add(pid)

    # clube de cada jogador-temporada, pela ponte do V2
    passagem = {}
    with open(os.path.join(V2, "resultados", "b1", "base_fisico.csv"), encoding="utf-8") as fh:
        for r in csv.DictReader(fh):
            if r.get("sc_player_id"):
                passagem[(int(float(r["sc_player_id"])), int(r["ano"]))] = (r["clube"], r["setor"])
    # Quem nao entrou na ponte do V2 (17% dos jogadores do banco) ainda tem o clube que o
    # PROPRIO SkillCorner registra jogo a jogo. Serve de clube de passagem, e o Transfermarkt
    # confere do mesmo jeito — so' que comparando palavras do nome do clube ("Avai" contra
    # "Avai Futebol Clube"), porque os dois escrevem o clube de jeitos diferentes.
    SC_SETOR = {"Central Defender": "Zaga", "Full Back": "Lateral", "Midfield": "Meia",
                "Wide Attacker": "Extremo", "Center Forward": "Atacante"}
    clube_sc = {}
    for r in con.execute("select sc_player_id, sc_competition_edition_id, team_name, position_group, "
                         "count(*) n from physical_match group by 1, 2, 3, 4 order by n desc"):
        k = (r["sc_player_id"], edi_ano.get(r["sc_competition_edition_id"]))
        if k not in clube_sc:        # o clube e a posicao mais frequentes da temporada
            clube_sc[k] = (r["team_name"], SC_SETOR.get(r["position_group"], "Outro"))
    # segunda fonte: elencos do Transfermarkt (nome + nascimento + clube + ano)
    tm = set()
    with open(os.path.join(V2, "bases", "serieb_elencos.csv"), encoding="utf-8-sig") as fh:
        for r in csv.DictReader(fh):
            d = (r.get("nascimento") or "").split("/")
            if len(d) != 3:
                continue
            nasc = f"{d[2]}-{d[1]}-{d[0]}"
            clube = CLUBE_TM.get(r["clube"], r["clube"])
            tm.add((int(r["ano"]), chave(clube), chave(r["jogador"]), nasc))

    tm_do_ano = {}
    for t in tm:
        tm_do_ano.setdefault(t[0], []).append(t)

    def idade(nasc):
        try:
            a, m, d = (int(x) for x in nasc.split("-"))
        except (ValueError, AttributeError):
            return None
        return ANO_REF - a - (1 if (m, d) > (8, 1) else 0)

    casou, duvida = 0, 0
    escolha = {}                     # id(j) -> (pid, ano, clube), antes de gravar
    for j in saida:
        if j.get("psv") or j.get("p") == "GOL" or j.get("p") not in POS_SETOR:
            continue
        cands = por_nome.get(chave(j.get("n")), set())
        if not cands or j.get("id_") is None:
            continue
        ok = []
        for pid in cands:
            r = jog[pid]
            ida = idade(r.get("birthdate"))
            if ida is None or abs(ida - j["id_"]) > 1:
                continue
            nomes = variantes(r)
            anos = sorted((a for (p_, a) in fis if p_ == pid and a and
                           (fis[(p_, a)].get("matches") or 0) >= 5), reverse=True)
            for ano in anos:
                ps = passagem.get((pid, ano))
                if ps:
                    clube, setor_sc = ps
                    confere = lambda ck: ck == chave(clube)
                elif (pid, ano) in clube_sc:
                    clube, setor_sc = clube_sc[(pid, ano)]
                    palavras = set(chave(clube).split())
                    confere = lambda ck: bool(ck) and set(ck.split()) <= palavras
                else:
                    continue
                if not any(POS_SETOR[j["p"]] in g and setor_sc in g for g in GRUPOS_POS):
                    continue
                if not any(a == ano and nm in nomes and nasc == r.get("birthdate") and confere(ck)
                           for (a, ck, nm, nasc) in tm_do_ano.get(ano, ())):
                    continue
                ok.append((pid, ano, clube))
                break
        if len(ok) != 1:
            duvida += len(ok) > 1
            continue
        escolha[id(j)] = (j, ok[0])

    # UMA PESSOA DO SKILLCORNER, UMA ENTRADA DO APP — salvo quando as entradas sao a mesma
    # pessoa registrada duas vezes. A regra e' a do ARMADILHAS.md: mesma data de fim de
    # contrato = mesma pessoa. Se nao for, fica so' quem joga hoje no clube daquela temporada;
    # se nenhum joga, ninguem fica. (Caso real: dois "Ronald", 29 anos, volantes, um no
    # Criciuma e outro no Vitoria, disputavam o fisico do Criciuma 2026.)
    por_pid = {}
    for jid, (j, (pid, ano, clube)) in escolha.items():
        por_pid.setdefault(pid, []).append(jid)
    for pid, jids in por_pid.items():
        if len(jids) < 2:
            continue
        js = [escolha[x][0] for x in jids]
        if len({j.get("ct") or "" for j in js}) == 1 and js[0].get("ct"):
            continue                                  # a mesma pessoa, listada duas vezes
        clube = escolha[jids[0]][1][2]
        palavras = set(chave(clube).split())
        ficam = [x for x in jids if set(chave(escolha[x][0].get("t")).split()) & palavras]
        for x in jids:
            if x not in ficam or len(ficam) != 1:
                del escolha[x]
                duvida += 1

    for j, (pid, ano, clube) in escolha.values():
        f = fis[(pid, ano)]
        for campo, col in CAMPOS_V2.items():
            v = num(f.get(col), 2)
            if v is not None:
                j[campo] = v
        o = obr.get((pid, ano)) or {}
        for campo, col in CAMPOS_OBR.items():
            v = num(o.get(col), 2)
            if v is not None:
                j[campo] = v
        j["sc_n"] = num(f.get("matches"), 0)
        j["sc_min"] = num(f.get("minutes_played"), 0)
        j["fis_src"] = f"Série B {ano} · {clube}"
        casou += 1
    print(f"    {casou} ganharam físico de outra temporada pela base do V2"
          + (f" · {duvida} ficaram de fora por ter mais de um candidato" if duvida else ""))
    return casou


def main(periodo="ago26"):
    arq_fc = os.path.join(BASE_RANKING, f"fim_contrato_{periodo}.json")
    arq_rk = os.path.join(BASE_RANKING, f"rankings_{periodo}.json")
    for a in (arq_fc, arq_rk):
        if not os.path.exists(a):
            sys.exit(f"nao achei {a}")

    print("lendo o ranking (indicadores) ...")
    with open(arq_rk, encoding="utf-8") as fh:
        ranking = {j.get("primary_key"): j for j in json.load(fh)}

    print("lendo o fisico do SkillCorner ...")
    arq_sc = os.path.join(BASE_RANKING, f"skillcorner_{periodo}.json")
    fisico = {}
    if os.path.exists(arq_sc):
        with open(arq_sc, encoding="utf-8") as fh:
            fisico = json.load(fh)

    print("lendo o fim de contrato (cadastro largo) ...")
    with open(arq_fc, encoding="utf-8") as fh:
        registros = json.load(fh)["registros"]

    saida, sem_pos, i = [], 0, 0
    vistos = set()
    for f in registros:
        pos = GRUPO_PARA_POS.get(f.get("position_group_pt"))
        nome = f.get("Player")
        if not pos or not nome:
            sem_pos += 1
            continue
        time = f.get("Team within selected timeframe") or f.get("Team") or ""
        pk = f.get("primary_key")
        # quem nao tem minutagem vem sem primary_key: monta uma para nao virar duplicata
        chave = pk or f"{nome} - {time} - {f.get('league') or ''}"
        if chave in vistos:
            continue
        vistos.add(chave)

        r = ranking.get(pk) or {} if pk else {}
        tr = f.get("transferroom") or {}

        j = {
            "id": i,
            "n": nome,
            "nc": f.get("tm_nome") or "",                 # nome completo (Transfermarkt)
            "t": time,
            "l": f.get("league") or "",
            "p": pos,
            "id_": num(f.get("Age")),
            "ct": (f.get("contrato_consenso_data") or f.get("Contract expires") or "")[:10],
            "ctc": (f.get("contrato_confianca") or "")[:12],   # alta / baixa / conflito / sem_fonte
            "ctf": f.get("contrato_fontes") or [],
            # data que cada fonte informa — e o que a aba de fim de contrato mostra
            "src": {k: (f.get("src_" + k) or "")[:10] for k in
                    ("wyscout", "transfermarkt", "transferroom", "sofascore",
                     "capology", "fotmob", "footlink", "tff")
                    if f.get("src_" + k)},
            "tm": f.get("tm_id") or "",
            "mv": num(f.get("Market value")),
            "min": num(f.get("Minutes played")),
            "pe": f.get("Foot") or "",
            "alt": num(f.get("Height")),
            "nac": f.get("Birth country") or "",
            "psp": f.get("Passport country") or r.get("Passport country") or "",
            "emp": 1 if f.get("On loan") else 0,
        }
        if tr.get("salario"):
            j["sal"] = tr["salario"]                      # faixa anual do TransferRoom
        if tr.get("xtv"):
            j["xtv"] = num(tr["xtv"])

        # fisico do SkillCorner (existe para as ligas cobertas por tracking)
        met = ((fisico.get(pk) or {}).get("metrics") or {}) if pk else {}
        for chave, campo in (("psv", "psv99"), ("vmax", "peak_velocity"),
                             ("vmax3", "top3_peak_velocity"), ("mmin", "m_min"),
                             ("dist", "total_distance_p90"), ("hsr", "hsr_distance_p90"),
                             ("spr_km", "sprint_distance_p90"), ("spr_n", "n_sprints_p90"),
                             ("acel", "high_accel_p90"), ("desa", "high_decel_p90"),
                             ("hi", "hi_distance_p90"), ("cod", "cod_count_p90"),
                             # grupos da leitura "Montoro": velocidade, uso, arranque/frenagem,
                             # giro e volume — os tempos (t_*) sao em segundos, menor e melhor
                             ("psv5", "top5_psv99"), ("hsr_n", "hsr_count_p90"),
                             ("hi_n", "hi_actions_p90"), ("expl", "explosive_accel_to_sprint"),
                             ("run", "running_distance_p90"), ("acel_m", "med_accel_p90"),
                             ("desa_m", "med_decel_p90"), ("t_spr", "top3_time_to_sprint"),
                             ("t_hsr", "top3_time_to_hsr"), ("t_spr_cod", "top3_time_to_sprint_post_cod"),
                             ("t_hsr_cod", "top3_time_to_hsr_post_cod"),
                             ("t505_90", "top3_time_505_around_90"),
                             ("t505_180", "top3_time_505_around_180"),
                             # --- com a bola e sem a bola ---
                             # REGUA DIFERENTE: estes sao por 30 MINUTOS DE CADA FASE, nao
                             # por 90. Nao podem ser comparados com as linhas de cima; entre
                             # si, podem. A tela declara isso no nome do grupo.
                             # Cobertura no ago26: 96,0% dos 9.439 jogadores com tracking.
                             ("mm_c", "m_min_tip"), ("mm_s", "m_min_otip"),
                             ("hi_c", "hi_distance_p30tip"), ("hi_s", "hi_distance_p30otip"),
                             ("spn_c", "sprint_count_p30tip"), ("spn_s", "sprint_count_p30otip"),
                             # --- corridas sem bola (Off Ball Runs) ---
                             # Outra coisa que "sem a bola" acima: aqui o TIME TEM a bola e o
                             # jogador nao — ataque da profundidade, apoio, sobreposicao. Por
                             # isso sao todas `p30tip`. Cobertura bem menor, 28,8%, e a tela
                             # mostra celula vazia onde nao ha (nao zero, que seria mentira).
                             ("obr", "runs_p30tip"),
                             ("obr_hsr", "runs_above_hsr_p30tip"),
                             ("obr_area", "runs_penalty_area_p30tip"),
                             ("obr_per", "runs_dangerous_p30tip"),
                             ("obr_rec", "runs_received_p30tip"),
                             ("obr_rem", "runs_shot_within_10s_p30tip")):
            v = num(met.get(campo), 2)
            if v is not None:
                j[chave] = v
        # tamanho da amostra do tracking: minutos e jogos que passaram no controle
        sc = (fisico.get(pk) or {}) if pk else {}
        if sc.get("minutes") is not None:
            j["sc_min"] = num(sc.get("minutes"), 0)
        if sc.get("n_perf_passed") is not None:
            j["sc_n"] = num(sc.get("n_perf_passed"), 0)

        if r:   # tem indicadores no ranking
            j.update({
                "rk_ok": 1,
                "pw": r.get("Position") or "",
                "jog": num(r.get("Matches played")),
                "peso": num(r.get("Weight")),
                "rk": num(r.get("rank")),
                "ov": num(r.get("overall"), 1),
                "ofe": num(r.get("overall_offensive"), 1),
                "def": num(r.get("overall_deffensive"), 1),
                "pas": num(r.get("overall_pass"), 1),
                "dgp": num(r.get("overall_dgp"), 1),
                "gk": num(r.get("overall_gk"), 1),
                "bp": num(r.get("overall_bola_parada"), 1),
                "fis": num(r.get("phy_score"), 1),
                "obr": num(r.get("obr_score"), 1),
                "drb": num(r.get("Successful dribbles per 90"), 2),
                "prog": num(r.get("Progressive runs per 90"), 2),
                "aer": num(r.get("Aerial duels won, %"), 1),
                "ddef": num(r.get("Defensive duels won, %"), 1),
                "pas%": num(r.get("Accurate passes, %"), 1),
                "cru%": num(r.get("Accurate crosses, %"), 1),
                "gols": num(r.get("Non-penalty goals per 90"), 2),
                "xa": num(r.get("xA per 90"), 2),
                "gk_sai": num(r.get("gk_exits_per_90"), 2),
                "gk_evi": num(r.get("gk_prevented_goals_per_90"), 2),
                "gk_def": num(r.get("gk_save_rate_pct"), 1),
                "gk_pas": num(r.get("gk_accurate_passes_pct"), 1),
                "cs": num(r.get("Clean sheets")),
            })
        else:
            j["rk_ok"] = 0

        saida.append({k: v for k, v in j.items() if v not in (None, "", [])} | {"id": i, "n": nome})
        i += 1

    completar_fisico_v2(saida)

    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, "w", encoding="utf-8") as fh:
        json.dump({"periodo": periodo, "jogadores": saida}, fh,
                  ensure_ascii=False, separators=(",", ":"))

    mb = os.path.getsize(SAIDA) / 1024 / 1024
    com_rk = sum(1 for j in saida if j.get("rk_ok"))
    com_sal = sum(1 for j in saida if j.get("sal"))
    print(f"ok: {len(saida)} jogadores ({sem_pos} sem posicao) -> {SAIDA} ({mb:.1f} MB)")
    print(f"    {com_rk} com indicadores do ranking · {len(saida)-com_rk} so cadastro")
    print(f"    {com_sal} com faixa salarial do TransferRoom")
    print(f"    {sum(1 for j in saida if j.get('psv'))} com dados físicos do SkillCorner")
    for liga in ("Brasil A", "Brasil B", "Brasil C"):
        n = sum(1 for j in saida if j.get("l") == liga)
        nr = sum(1 for j in saida if j.get("l") == liga and j.get("rk_ok"))
        print(f"    {liga}: {n} jogadores ({nr} com indicadores)")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "ago26")
