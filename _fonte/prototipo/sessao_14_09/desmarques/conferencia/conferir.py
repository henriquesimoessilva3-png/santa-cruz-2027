import sys, json, sqlite3, unicodedata, re, datetime as dt, random
sys.dont_write_bytecode = True
import numpy as np, pandas as pd

RAIZ = "/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz"
DB = ("/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/fut/BOTA/"
      "Analytics/Portal Skillcorner/dados/skillcorner.db")
LISTA = ("/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-"
         "Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/scratchpad/desmarques/lista.json")
EDS = {335: 2022, 446: 2023, 773: 2024, 1061: 2025}
OBR = ["runs_p30tip", "runs_above_hsr_p30tip", "runs_penalty_area_p30tip",
       "runs_dangerous_p30tip", "runs_received_p30tip", "runs_shot_within_10s_p30tip"]
SET = {"CB": "zaga", "LCB": "zaga", "RCB": "zaga", "LB": "lateral", "RB": "lateral", "LWB": "lateral",
       "RWB": "lateral", "DMF": "meio", "LDMF": "meio", "RDMF": "meio", "LCMF": "meio", "RCMF": "meio", "AMF": "meio"}
setor = lambda p: SET.get(str(p), "ataque")

def key(s):
    s = unicodedata.normalize("NFD", str(s)).lower()
    s = "".join(x for x in s if unicodedata.category(x) != "Mn")
    return re.sub(r"[^a-z ]", "", s).strip()

L = json.load(open(LISTA))
out = {}

# ---------- base independente ----------
con = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)
sc = pd.read_sql("select p.sc_competition_edition_id ed, p.sc_player_id id, pl.short_name, pl.birthdate, "
                 "p.minutes_played*p.matches mt, p.matches from physical p join players pl on pl.sc_player_id=p.sc_player_id "
                 f"where p.sc_competition_edition_id in ({','.join(map(str, EDS))})", con)
obr = pd.read_sql(f"select sc_player_id id, sc_competition_edition_id ed, {','.join(OBR)} from off_ball_runs "
                  f"where sc_competition_edition_id in ({','.join(map(str, EDS))})", con)
sc = sc.merge(obr, on=["id", "ed"], how="left")
sc["ano"] = sc.ed.map(EDS)
T = pd.read_csv(f"{RAIZ}/dados/serieb_tecnico.csv")
T["cl"] = T["Equipa dentro de um período de tempo seleccionado"].map(lambda s: unicodedata.normalize("NFC", str(s)))
T["k"] = T.Jogador.map(key)
T = T[T.ano.isin(EDS.values())]
br = {}
for (a, k), g in T.groupby(["ano", "k"]):
    if g.cl.nunique() != 1: continue
    i = g.idade_na_temporada.dropna()
    br[(a, k)] = (g.cl.iloc[0], float(i.iloc[0]) if len(i) else None, g.posicao_1.iloc[0], g.Jogador.iloc[0], len(g))

rows = []
for r in sc.itertuples():
    v = br.get((r.ano, key(r.short_name)))
    if not v: rows.append((None,) * 5); continue
    c, iw, p, jw, nlin = v
    ok = isinstance(r.birthdate, str) and len(r.birthdate) >= 10
    isc = None
    if ok:
        b = dt.date(int(r.birthdate[:4]), int(r.birthdate[5:7]), int(r.birthdate[8:10])); ref = dt.date(r.ano, 9, 11)
        isc = ref.year - b.year - ((ref.month, ref.day) < (b.month, b.day))
    if isc is not None and iw is not None and not (-2 <= isc - iw <= 3):
        rows.append((None,) * 5); continue
    rows.append((c, p, jw, isc is None or iw is None, nlin))
sc[["clube", "pos", "nome_wy", "sem_guarda", "nlin_wy"]] = pd.DataFrame(rows, index=sc.index)
sc["setor"] = sc.pos.map(setor)
cas = sc[sc.clube.notna()].copy()
base = cas[cas.mt >= 300].copy()
out["base_n"] = len(base)

# ---------- (1) 16 times e elenco ----------
tab = pd.read_csv(f"{RAIZ}/dados/serieb_clube_temporada.csv")
sobe = tab[(tab.pos <= 4) & tab.ano.between(2022, 2025)]
esp = set(zip(sobe.ano, sobe.clube))
got = {(t["ano"], t["clube"]) for t in L["times"]}
out["times_ok"] = (esp == got, len(got), sorted(esp ^ got))
dif = []
for t in L["times"]:
    a, c = t["ano"], t["clube"]
    mine_all = set(cas[(cas.ano == a) & (cas.clube == c)].id)
    mine_300 = set(base[(base.ano == a) & (base.clube == c)].id)
    lj_all = {j["id_skillcorner"] for j in t["jogadores"]}
    lj_300 = {j["id_skillcorner"] for j in t["jogadores"] if j["entra_na_conta_do_time"]}
    flags = [j for j in t["jogadores"] if j["entra_na_conta_do_time"] != (j["minutos_rastreados"] >= 300)]
    csvn = int(tab[(tab.ano == a) & (tab.clube == c)].fis_atletas.iloc[0])
    if mine_all != lj_all or mine_300 != lj_300 or flags or len(mine_300) != t["n_jogadores_na_conta"] or csvn != len(mine_300):
        dif.append((a, c, sorted(mine_all ^ lj_all), sorted(mine_300 ^ lj_300), len(flags), csvn))
out["elenco_divergencias"] = dif

# ---------- (2) 20 sorteados ----------
random.seed(1409)
todos = [(t["ano"], t["clube"], j) for t in L["times"] for j in t["jogadores"]]
amostra = random.sample(todos, 20)
prob2 = []
db_rows = {}
for a, c, j in amostra:
    ed = [k for k, v in EDS.items() if v == a][0]
    r = con.execute(f"select {','.join(OBR)} from off_ball_runs where sc_player_id=? and sc_competition_edition_id=?",
                    (j["id_skillcorner"], ed)).fetchone()
    pm = con.execute("select minutes_played*matches, matches from physical where sc_player_id=? and sc_competition_edition_id=?",
                     (j["id_skillcorner"], ed)).fetchone()
    tw = T[(T.ano == a) & (T.k == key(j["nome_wyscout"]))]
    s_ok = setor(tw.posicao_1.iloc[0]) == j["setor"] and tw.posicao_1.iloc[0] == j["posicao_wyscout"] and tw.cl.iloc[0] == c
    nums = [None if r is None else r[i] for i in range(6)]
    n_ok = all((x is None and y is None) or (x is not None and y is not None and abs(x - y) < 0.0015)
               for x, y in zip(nums, [j["numeros"][m] for m in OBR]))
    m_ok = abs(pm[0] - j["minutos_rastreados"]) < 0.1 and pm[1] == j["partidas"]
    db_rows[(a, j["id_skillcorner"])] = (j, nums)
    prob2.append(dict(ano=a, clube=c, nome=j["nome_skillcorner"], id=j["id_skillcorner"], setor=j["setor"],
                      pos=j["posicao_wyscout"], nums_ok=n_ok, setor_ok=bool(s_ok), min_ok=m_ok))
out["amostra20"] = prob2

# ---------- (3) percentil de 10 ----------
def pct(v, arr):
    arr = arr[~np.isnan(arr)]
    return 100 * ((arr < v).sum() + ((arr == v).sum() - 1) / 2) / (len(arr) - 1)
p3 = []
elig = [(a, c, j) for a, c, j in amostra if j["entra_na_conta_do_time"] and j.get("percentis")]
for a, c, j in elig[:10]:
    pool = base[(base.ano == a) & (base.setor == j["setor"])]
    mx = 0
    for m in OBR:
        v = db_rows[(a, j["id_skillcorner"])][1][OBR.index(m)]
        mine = pct(v, pool[m].astype(float).values)
        mx = max(mx, abs(mine - j["percentis"][m]))
    p3.append((a, c, j["nome_skillcorner"], j["setor"], len(pool), round(mx, 3)))
out["percentis10"] = p3
out["n_eligiveis_na_amostra"] = len(elig)

# ---------- (4) fechamento 6 times ----------
def mp(v, w):
    ok = v.notna()
    if ok.sum() < max(1, len(v) * 0.6): return np.nan
    return float(np.average(v[ok], weights=w[ok]))
f4 = []
for a, c in [(2022, "Grêmio"), (2022, "Vasco"), (2023, "Atlético-GO"), (2024, "Mirassol"), (2025, "Chapecoense"), (2025, "Athletico-PR")]:
    b = base[(base.ano == a) & (base.clube == c)]
    t = tab[(tab.ano == a) & (tab.clube == c)].iloc[0]
    lt = [x for x in L["times"] if x["ano"] == a and x["clube"] == c][0]
    mx, mxl = 0, 0
    for m in OBR:
        v = mp(b[m], b.mt); mx = max(mx, abs(v - t["fis_" + m]))
        mxl = max(mxl, abs(lt["time_inteiro"]["estudo_media_ponderada"][m] - t["fis_" + m]))
        mxl = max(mxl, abs(lt["time_inteiro"]["mediana_dos_jogadores"][m] - b[m].median()))
        for s in ["zaga", "lateral", "meio", "ataque"]:
            bs = b[b.setor == s]
            vs = mp(bs[m], bs.mt) if len(bs) else np.nan
            cs = t[f"fis_{s}_{m}"]
            if not (np.isnan(vs) and np.isnan(cs)): mx = max(mx, abs(vs - cs))
            ls = lt["por_setor"][s]
            if ls["n_jogadores"] != len(bs) or int(t[f"fis_{s}_atletas"]) != len(bs): mxl = 99
            if ls["estudo_media_ponderada"][m] is not None: mxl = max(mxl, abs(ls["estudo_media_ponderada"][m] - cs))
    f4.append((a, c, len(b), float(mx), round(float(mxl), 4)))
out["fechamento6"] = f4

# ---------- (5) homonimos ----------
h = {}
d = cas.groupby(["ano", "id"]).clube.nunique(); h["id_em_2_clubes_mesmo_ano"] = int((d > 1).sum())
d = cas.groupby(["ano", "id"]).size(); h["id_repetido_mesmo_ano"] = int((d > 1).sum())
cas["k"] = cas.short_name.map(key)
dd = cas[cas.duplicated(["ano", "k"], keep=False)]
h["dois_ids_sc_mesmo_nome_mesmo_ano_casados"] = dd[["ano", "clube", "short_name", "id", "birthdate", "mt"]].sort_values(["ano", "short_name"]).values.tolist()
sub = cas[[(a, c) in esp for a, c in zip(cas.ano, cas.clube)]]
h["sem_guarda_de_idade_nos_16"] = sub[sub.sem_guarda][["ano", "clube", "short_name", "id", "mt"]].values.tolist()
h["wyscout_2_linhas_mesmo_clube"] = sub[sub.nlin_wy > 1][["ano", "clube", "short_name", "nlin_wy"]].values.tolist()
# jogador que aparece em 2 dos 16 times no mesmo ano na lista
ids = pd.DataFrame([(t["ano"], j["id_skillcorner"], t["clube"]) for t in L["times"] for j in t["jogadores"]], columns=["a", "i", "c"])
h["lista_id_repetido_no_ano"] = ids[ids.duplicated(["a", "i"], keep=False)].values.tolist()
# nome_wyscout x nome skillcorner sem nenhuma palavra em comum? (casamento por key, deve ser igual)
h["nome_wy_difere_de_short_name"] = [(t["ano"], t["clube"], j["nome_skillcorner"], j["nome_wyscout"]) for t in L["times"] for j in t["jogadores"] if key(j["nome_skillcorner"]) != key(j["nome_wyscout"])]
# conferencia pelo team_name/wyscout id do SC (so 2025/26 tem clube no SC): players.team_name
tn = pd.read_sql("select sc_player_id id, team_name from players", con)
x = sub.merge(tn, on="id"); x = x[x.team_name.notna() & (x.team_name != "")]
h["team_name_sc_preenchido_nos_16"] = len(x)
out["homonimos"] = h
# clube do SC por partida (physical_match) em 2025 para os 4 times de 2025
try:
    cols = [r[1] for r in con.execute("pragma table_info(physical_match)")]
    out["physical_match_cols"] = cols[:30]
except Exception as e:
    out["physical_match_cols"] = str(e)

# ---------- (6) referencias 2 anos ----------
fx = dict(zip(zip(tab.ano, tab.clube), tab.faixa))
base["faixa"] = [fx.get(k) for k in zip(base.ano, base.clube)]
r6 = []
for a in [2023, 2025]:
    for s in ["zaga", "lateral", "meio", "ataque"]:
        d0 = base[(base.ano == a) & (base.setor == s)]
        for nm, dd2 in [("serie_b", d0), ("sobe", d0[d0.faixa == "sobe"]), ("meio_tabela", d0[d0.faixa == "meio"]), ("cai", d0[d0.faixa == "cai"])]:
            ref = L["referencia"][str(a)][s][nm]
            mx = max(abs(ref[m] - round(dd2[m].median(), 3)) for m in OBR)
            r6.append((a, s, nm, len(dd2), ref["n_jogadores"], round(float(mx), 4)))
out["referencia"] = r6
json.dump(out, open(LISTA.replace("lista.json", "conferencia/resultado.json"), "w"), ensure_ascii=False, indent=1, default=str)
print(json.dumps(out, ensure_ascii=False, indent=1, default=str))
