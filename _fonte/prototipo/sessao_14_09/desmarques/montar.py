import sys, os, json, sqlite3, datetime as dt
sys.dont_write_bytecode = True
RAIZ = "/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz"
sys.path.insert(0, RAIZ)
import numpy as np, pandas as pd
import analisar_serieb as A

OUT = os.path.dirname(os.path.abspath(__file__))
OBR = A.SC_OBR
ANOS = [2022, 2023, 2024, 2025]
EDS = {k: v for k, v in A.SC_EDICOES.items() if v in ANOS}

# ---- replica de A._sc_atletas, com id do SkillCorner, nome Wyscout e posicao ----
con = sqlite3.connect(A.SKILLCORNER)
sc = pd.read_sql(
    "select p.sc_competition_edition_id ed, p.sc_player_id, pl.short_name, pl.nome, pl.birthdate, "
    "p.minutes_played, p.matches, " + ", ".join("o." + m for m in OBR) +
    ", case when o.sc_player_id is null then 0 else 1 end tem_obr"
    " from physical p join players pl on pl.sc_player_id = p.sc_player_id"
    " left join off_ball_runs o on o.sc_player_id = p.sc_player_id"
    " and o.sc_competition_edition_id = p.sc_competition_edition_id"
    f" where p.sc_competition_edition_id in ({','.join(map(str, EDS))})", con)
sc["ano"] = sc.ed.map(EDS)
sc["min_tot"] = sc.minutes_played * sc.matches

T = pd.read_csv(f"{RAIZ}/dados/serieb_tecnico.csv")
T["cl"] = T["Equipa dentro de um período de tempo seleccionado"].map(A.nfc)
T["k"] = T.Jogador.map(A.chave_nome)
ponte = {}
for (a, k), g in T.groupby(["ano", "k"]):
    if g.cl.nunique() != 1:
        continue
    idades = g.idade_na_temporada.dropna()
    ponte[(a, k)] = (g.cl.iloc[0], float(idades.iloc[0]) if len(idades) else None,
                     A.grupo_fis(g.posicao_1.iloc[0]), g.posicao_1.iloc[0], g.Jogador.iloc[0])

def idade_sc(nasc, ano):
    if not isinstance(nasc, str) or len(nasc) < 10:
        return None
    n = dt.date(int(nasc[:4]), int(nasc[5:7]), int(nasc[8:10]))
    r = dt.date(ano, 9, 11)
    return r.year - n.year - ((r.month, r.day) < (n.month, n.day))

cl, gr, po, nw = [], [], [], []
for ano, nome, nasc in zip(sc.ano, sc.short_name, sc.birthdate):
    v = ponte.get((ano, A.chave_nome(nome)))
    if not v:
        cl.append(None); gr.append(None); po.append(None); nw.append(None); continue
    clube, iw, g, p, jw = v
    i = idade_sc(nasc, ano)
    if i is not None and iw is not None and not (-2 <= i - iw <= 3):
        cl.append(None); gr.append(None); po.append(None); nw.append(None); continue
    cl.append(clube); gr.append(g); po.append(p); nw.append(jw)
sc["clube"], sc["grupo"], sc["posicao"], sc["nome_wy"] = cl, gr, po, nw

# clube por jogo (so existe no SkillCorner em 2025) e xaras do Wyscout no mesmo clube/ano
PM = pd.read_sql("select sc_player_id id, sc_competition_edition_id ed, team_name, count(distinct sc_match_id) jogos "
                 "from physical_match where team_name is not null group by 1,2,3", con)
EDS_POR_ANO = {v: k for k, v in EDS.items()}
NLIN_WY = T.groupby(["ano", "k"]).size().to_dict()
XARA_WY = {key: g[["posicao_1", "idade_na_temporada"]].values.tolist() for key, g in T.groupby(["ano", "k"]) if len(g) > 1}
todos = sc[sc.clube.notna()].copy()            # casados, com e sem corte
base = todos[todos.min_tot >= 300].copy()       # = base do estudo

# conferencia contra o proprio estudo
ref = A._sc_atletas()
ref = ref[ref.ano.isin(ANOS)]
assert len(ref) == len(base), (len(ref), len(base))
chk = (ref.sort_values(["ano", "short_name", "min_tot"]).reset_index(drop=True))
mine = base.sort_values(["ano", "short_name", "min_tot"]).reset_index(drop=True)
assert (chk.clube.values == mine.clube.values).all() and (chk.grupo.values == mine.grupo.values).all()
for m in OBR:
    assert np.allclose(chk[m].astype(float), mine[m].astype(float), equal_nan=True)
print("base identica ao _sc_atletas do estudo:", len(base))

base["eh_gk"] = base.posicao == "GK"
todos["eh_gk"] = todos.posicao == "GK"
print("GK na base (entram em 'ataque' pelo estudo):", int(base.eh_gk.sum()),
      base[base.eh_gk][["ano", "clube", "short_name", "min_tot"]].to_string())
print("posicao nula na base:", int(base.posicao.isna().sum()))
# ids duplicados dentro do mesmo ano (mesma pessoa em 2 linhas?)
print("id repetido no ano:", int(base.duplicated(["ano", "sc_player_id"]).sum()))

tab = pd.read_csv(f"{RAIZ}/dados/serieb_clube_temporada.csv")
tab = tab[tab.ano.isin(ANOS)]
faixa = dict(zip(zip(tab.ano, tab.clube), tab.faixa))
base["faixa"] = [faixa.get((a, c)) for a, c in zip(base.ano, base.clube)]
todos["faixa"] = [faixa.get((a, c)) for a, c in zip(todos.ano, todos.clube)]
print("sem faixa:", int(base.faixa.isna().sum()))

# setor para percentil: o do estudo, mas goleiro separado
base["setor"] = np.where(base.eh_gk, "goleiro", base.grupo)
todos["setor"] = np.where(todos.eh_gk, "goleiro", todos.grupo)

def pct_de(v, amostra):
    a = amostra.dropna().values
    if pd.isna(v) or len(a) < 2:
        return None
    menor = (a < v).sum(); igual = (a == v).sum() - 1
    return round(float(100 * (menor + igual / 2) / (len(a) - 1)), 1)

SETORES = ["zaga", "lateral", "meio", "ataque"]
R = lambda x: None if x is None or pd.isna(x) else round(float(x), 3)

# ---- referencia ----
referencia = {}
for ano in ANOS:
    referencia[ano] = {}
    for s in SETORES:
        d = base[(base.ano == ano) & (base.setor == s)]
        e = {}
        for nomef, dd in [("serie_b", d), ("sobe", d[d.faixa == "sobe"]),
                          ("meio_tabela", d[d.faixa == "meio"]), ("cai", d[d.faixa == "cai"])]:
            e[nomef] = {"n_jogadores": int(len(dd)),
                        **{m: R(dd[m].median()) for m in OBR}}
        referencia[ano][s] = e

# ---- times ----
times, destaques, fech = [], [], []
sub = tab[tab.pos <= 4].sort_values(["ano", "pos"])
for _, t in sub.iterrows():
    ano, clube = int(t.ano), t.clube
    dj = todos[(todos.ano == ano) & (todos.clube == clube)].sort_values("min_tot", ascending=False)
    jogs = []
    for _, j in dj.iterrows():
        entra = bool(j.min_tot >= 300)
        item = {"nome_skillcorner": j.short_name, "nome_completo_skillcorner": j.nome,
                "nome_wyscout": j.nome_wy, "id_skillcorner": int(j.sc_player_id),
                "setor": j.setor, "posicao_wyscout": j.posicao,
                "minutos_rastreados": round(float(j.min_tot), 1), "partidas": int(j.matches),
                "entra_na_conta_do_time": entra}
        if j.setor == "goleiro":
            item["motivo_goleiro"] = ("goleiro fica fora da lista de desmarque (SkillCorner nao "
                                      "rastreia goleiro de forma confiavel); ATENCAO: o estudo o "
                                      "conta em 'ataque' e no time inteiro se tiver 300+ min")
        g = PM[(PM.id == j.sc_player_id) & (PM.ed == EDS_POR_ANO[ano])]
        if g.team_name.nunique() > 1:
            item["aviso_clube_duplo"] = (
                "trocou de clube dentro da Serie B no mesmo ano: os seis numeros e os minutos sao da temporada "
                "inteira do atleta, somando os jogos pelos dois clubes (" +
                ", ".join(f"{int(n)} jogos pelo {c}" for c, n in sorted(zip(g.team_name, g.jogos), key=lambda x: -x[1])) +
                "; SkillCorner jogo a jogo). O estudo faz a mesma coisa no numero do time.")
        xr = XARA_WY.get((ano, A.chave_nome(j.short_name)))
        if xr:
            item["aviso_xara_wyscout"] = (
                "setor e idade nao confiaveis: o Wyscout tem " + str(len(xr)) + " pessoas com este nome no mesmo clube e ano (" +
                "; ".join(f"{pp} {int(ii) if ii == ii else '?'} anos" for pp, ii in xr) +
                "); a ponte do estudo usa a primeira linha, que pode ser a da outra pessoa.")
        item["numeros"] = {m: R(j[m]) for m in OBR}
        if not j.tem_obr:
            item["motivo_ausencia"] = "sem linha em off_ball_runs para este atleta-edicao"
        elif all(pd.isna(j[m]) for m in OBR):
            item["motivo_ausencia"] = ("linha em off_ball_runs existe mas os seis numeros vem vazios; "
                                       "o estudo o conta nos minutos mas a media ponderada o ignora")
        if not entra:
            item["percentis"] = None
            item["motivo_sem_percentil"] = f"abaixo do corte de 300 min rastreados ({j.min_tot:.0f})"
        elif j.setor == "goleiro":
            item["percentis"] = None
            item["motivo_sem_percentil"] = "goleiro"
        else:
            amostra = base[(base.ano == ano) & (base.setor == j.setor)]
            item["percentis"] = {m: pct_de(j[m], amostra[m]) for m in OBR}
            vals = [v for v in item["percentis"].values() if v is not None]
            item["percentil_medio"] = round(sum(vals) / len(vals), 1) if len(vals) == 6 else None
        jogs.append(item)
    b = base[(base.ano == ano) & (base.clube == clube)]
    time = {"ano": ano, "clube": clube, "posicao_final": int(t.pos), "pontos": int(t.pts),
            "n_jogadores_na_conta": int(len(b)),
            "time_inteiro": {
                "estudo_media_ponderada": {m: R(t["fis_" + m]) for m in OBR},
                "mediana_dos_jogadores": {m: R(b[m].median()) for m in OBR}},
            "por_setor": {s: {"n_jogadores": int((b.grupo == s).sum()),
                              "estudo_media_ponderada": {m: R(t[f"fis_{s}_{m}"]) for m in OBR},
                              "mediana_dos_jogadores": {m: R(b[b.grupo == s][m].median()) for m in OBR}}
                          for s in SETORES},
            "jogadores": jogs}
    times.append(time)
    ok = [x for x in jogs if x.get("percentil_medio") is not None]
    top2 = sorted(ok, key=lambda x: -x["percentil_medio"])[:2]
    area = [x for x in jogs if x.get("percentis") and (x["percentis"]["runs_penalty_area_p30tip"] or 0) > 80]
    destaques.append((ano, clube, top2, area))

# ---- fechamento: 4 times (um por ano) ----
for ano, clube in [(2022, "Cruzeiro"), (2023, "Criciúma"), (2024, "Sport"), (2025, "Remo")]:
    b = base[(base.ano == ano) & (base.clube == clube)]
    t = tab[(tab.ano == ano) & (tab.clube == clube)].iloc[0]
    linhas = []
    for m in OBR:
        v = A.media_pond(b[m], b.min_tot)
        linhas.append((m, v, float(t["fis_" + m]), abs(v - float(t["fis_" + m]))))
    for s in SETORES:
        bs = b[b.grupo == s]
        for m in OBR:
            v = A.media_pond(bs[m], bs.min_tot) if len(bs) else np.nan
            c = float(t[f"fis_{s}_{m}"])
            linhas.append((f"{s}:{m}", v, c, abs(v - c) if not (np.isnan(v) and np.isnan(c)) else 0.0))
    fech.append((ano, clube, len(b), linhas))

regra = ("Fonte: SkillCorner, tabela off_ball_runs (Off Ball Runs) das edicoes da Serie B 335/446/773/1061 "
         "(2022-2025), LEFT JOIN no physical, no skillcorner.db do Portal Skillcorner. Unidade: por 30 min com a "
         "bola do time (p30tip). Clube e posicao vem da ponte do estudo (analisar_serieb._sc_atletas): short_name do "
         "SkillCorner = nome do Wyscout (serieb_tecnico.csv) no mesmo ano, nome unico num so clube, guarda de idade "
         "-2/+3; a lista foi conferida linha a linha contra a funcao do estudo (1.783 atleta-temporada com 300+ min). "
         "Jogador identificado pelo sc_player_id; o nome Wyscout vem da ponte nome+idade (nao ha id Wyscout nessa base). "
         "Corte: 300+ minutos rastreados (minutes_played x matches do physical); abaixo disso aparece com entra=false e sem "
         "percentil. Setor: posicao_1 do Wyscout -> zaga (CB/LCB/RCB), lateral (LB/RB/LWB/RWB), meio (DMF/LDMF/RDMF/LCMF/"
         "RCMF/AMF), resto ataque (GRUPOS_FIS). Goleiro listado a parte, sem percentil. Numero do time 'estudo_media_ponderada' "
         "= fis_*_p30tip do serieb_clube_temporada.csv (media ponderada por minuto rastreado, piso de 60% de cobertura); "
         "'mediana_dos_jogadores' = mediana simples dos atletas na conta. Percentil: dentro da Serie B do ano, entre os "
         "atletas do mesmo setor com 300+ min e valor nao nulo, = 100*(abaixo + empates/2)/(n-1); 100 = o maior. "
         "Referencia = medianas simples por ano e setor (Serie B inteira, 1-4, 5-16, 17-20). 2026 fora. "
         "Avisos por jogador: 'aviso_clube_duplo' = trocou de clube dentro da Serie B no ano (numeros somam os dois "
         "clubes; so da para conferir em 2025, unico ano com clube por jogo no SkillCorner); 'aviso_xara_wyscout' = "
         "o Wyscout tem duas pessoas com o mesmo nome no mesmo clube e ano, entao setor e idade podem ser da outra.")
json.dump({"regra": regra, "times": times, "referencia": referencia},
          open(f"{OUT}/lista.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

print("\n=== FECHAMENTO ===")
for ano, clube, n, linhas in fech:
    mx = max(x[3] for x in linhas if not np.isnan(x[3]))
    print(ano, clube, "n=", n, "max diff:", mx)
    for m, v, c, d in linhas[:6]:
        print(f"   {m:32} jogadores {v:.4f}  csv {c:.4f}  diff {d:.2e}")
print("\n=== DESTAQUES ===")
for ano, clube, top2, area in destaques:
    print(ano, clube, "| top2:", [(x["nome_skillcorner"], x["setor"], x["percentil_medio"]) for x in top2],
          "| area>80:", [(x["nome_skillcorner"], x["setor"], x["percentis"]["runs_penalty_area_p30tip"]) for x in area])
print("\n=== cobertura ===")
for tm in times:
    js = tm["jogadores"]
    print(tm["ano"], tm["clube"], "casados", len(js), "na conta", sum(x["entra_na_conta_do_time"] for x in js),
          "abaixo300", sum(not x["entra_na_conta_do_time"] for x in js),
          "sem_obr", sum("motivo_ausencia" in x for x in js), "gk", sum(x["setor"] == "goleiro" for x in js),
          "setores", {s: tm["por_setor"][s]["n_jogadores"] for s in SETORES})
