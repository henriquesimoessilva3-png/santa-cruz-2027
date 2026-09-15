import sys, json, sqlite3
sys.dont_write_bytecode = True
RAIZ = "/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz"
sys.path.insert(0, RAIZ)
import pandas as pd
import analisar_serieb as A
L = json.load(open("lista.json"))
con = sqlite3.connect(f"file:{A.SKILLCORNER}?mode=ro", uri=True)
print(pd.read_sql("select sc_competition_edition_id ed, count(*) n, count(distinct team_name) times, sum(team_name is null) semtime from physical_match where sc_competition_edition_id in (335,446,773,1061) group by 1", con))
pm = pd.read_sql("select sc_player_id id, sc_competition_edition_id ed, team_name, count(distinct sc_match_id) jogos from physical_match where sc_competition_edition_id in (335,446,773,1061) and team_name is not null group by 1,2,3", con)
ED = {2022:335,2023:446,2024:773,2025:1061}
# 1) multi-clube nos jogadores listados
multi = []
for t in L["times"]:
    for j in t["jogadores"]:
        g = pm[(pm.id == j["id_skillcorner"]) & (pm.ed == ED[t["ano"]])]
        if g.team_name.nunique() > 1:
            multi.append((t["ano"], t["clube"], j["nome_skillcorner"], j["id_skillcorner"], j["setor"], j["entra_na_conta_do_time"], j.get("percentil_medio"), dict(zip(g.team_name, g.jogos))))
print("MULTI-CLUBE:"); [print(" ", m) for m in multi]
# 2) xaras no Wyscout (mesmo nome-chave, mesmo clube, mesmo ano, >1 linha)
T = pd.read_csv(f"{RAIZ}/dados/serieb_tecnico.csv")
T["cl"] = T["Equipa dentro de um período de tempo seleccionado"].map(A.nfc)
T["k"] = T.Jogador.map(A.chave_nome)
xar = []
for t in L["times"]:
    for j in t["jogadores"]:
        g = T[(T.ano == t["ano"]) & (T.k == A.chave_nome(j["nome_skillcorner"]))]
        if len(g) > 1:
            xar.append((t["ano"], t["clube"], j["nome_skillcorner"], j["id_skillcorner"], j["setor"], j["posicao_wyscout"], j["minutos_rastreados"], j["entra_na_conta_do_time"], g[["Jogador","cl","posicao_1","idade_na_temporada"]].values.tolist()))
print("XARAS NO WYSCOUT:"); [print(" ", x) for x in xar]
# 3) setores com 1-3 atletas
print("SETORES 1-3:")
for t in L["times"]:
    for s, v in t["por_setor"].items():
        if 1 <= v["n_jogadores"] <= 3: print(" ", t["ano"], t["clube"], s, v["n_jogadores"])
        if v["n_jogadores"] == 0: print("  ZERO", t["ano"], t["clube"], s)
