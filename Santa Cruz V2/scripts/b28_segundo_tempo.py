"""B28 — quem mantém o físico no 2º tempo (pedido do Henrique, 30/10/2026).

Pergunta: na Europa trabalham com atletas de VO2 70+. O SkillCorner não mede VO2, mas mede o que o jogador
faz no 1º e no 2º tempo. Quem consegue manter a intensidade do 1º tempo no 2º?

Fonte: SkillCorner, /api/physical/ com period=h1 e period=h2, group_by=player,match, average_per=match,
todas as edições liberadas para o Botafogo com jogos desde 01/01/2025 (levantamento de 30/10/2026, Chrome logado).
Entram SÓ os jogos em que o jogador fez os dois tempos inteiros (40 min ou mais em cada um) — quem entra ou sai
no meio de um tempo deixaria a conta torta. O agregado chega pronto por jogador × edição × time × posição
(bases/skillcorner/segundo_tempo_agg.json.gz).

Conta (por jogador, somando os jogos completos):
  ritmo de cada tempo = indicador ÷ minutos do tempo
  manutenção do indicador = ritmo do 2º tempo ÷ ritmo do 1º tempo  (100% = manteve igual)
  MANUTENÇÃO = média da manutenção de alta intensidade (>20 km/h, distância) e de distância total.
  VOLUME = alta intensidade por minuto no jogo inteiro (os dois tempos).
Nota (dentro da posição, contra todos os jogadores da base com 5 jogos completos ou mais):
  azul    = elite: manutenção no quarto de cima (≥ P75) E alta intensidade por minuto NO 2º TEMPO na metade de cima (≥ mediana) da posição
  verde   = manutenção ≥ mediana
  amarelo = manutenção entre P25 e a mediana
  vermelho= manutenção abaixo de P25
Validação: Série B — times que sobem × ficam × caem (manutenção do time e dos titulares).
Saídas: resultados/b28/*.csv, B28.md e o JS do app (static/segundo_tempo_dados.js, via --js).
"""
import gzip, json, os, sys, unicodedata
from collections import Counter, defaultdict
import numpy as np, pandas as pd
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _comum import BASES, RES, classificacao

OUT = os.path.join(RES, "b28"); os.makedirs(OUT, exist_ok=True)
APP = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
F = ['min', 'dist', 'hsr_d', 'spr_d', 'hsr_n', 'spr_n', 'hi_d', 'hi_n', 'acc', 'dec', 'expl']
MIN_JOGOS = 5
POS = {'LB': 'Lateral', 'RB': 'Lateral', 'LWB': 'Lateral', 'RWB': 'Lateral', 'LCB': 'Zagueiro', 'RCB': 'Zagueiro', 'CB': 'Zagueiro',
       'DM': 'Volante', 'LDM': 'Volante', 'RDM': 'Volante', 'CM': 'Médio', 'LM': 'Médio', 'RM': 'Médio', 'AM': 'Meia',
       'LW': 'Extremo', 'RW': 'Extremo', 'LF': 'Centroavante', 'RF': 'Centroavante', 'CF': 'Centroavante'}
ORDEM = ['Zagueiro', 'Lateral', 'Volante', 'Médio', 'Meia', 'Extremo', 'Centroavante']
SERIE_B = {335: 2022, 446: 2023, 773: 2024, 1061: 2025, 1399: 2026}


def ler():
    with gzip.open(os.path.join(BASES, "skillcorner", "segundo_tempo_agg.json.gz"), "rt") as f:
        d = json.load(f)
    linhas = []
    for g in d["agg"]:
        r = {k: g[k] for k in ("pid", "ed", "team", "tn", "pos", "pg", "pn", "nm", "bd", "n", "dmax")}
        for i, k in enumerate(F):
            r["h1_" + k] = g["h1"][i]; r["h2_" + k] = g["h2"][i]
        linhas.append(r)
    df = pd.DataFrame(linhas)
    df["grupo"] = df["pos"].map(POS)
    df["edn"] = df["ed"].map({int(k): v for k, v in d["eds"].items()})
    return df[df.grupo.notna()].copy(), d


def taxas(s):
    """s = soma dos jogos completos (h1_*, h2_*). Devolve manutenções e volume."""
    m1, m2 = s["h1_min"], s["h2_min"]
    r = {}
    for k in ('dist', 'hi_d', 'spr_n', 'hsr_d', 'spr_d', 'hi_n', 'acc'):
        a, b = s["h1_" + k] / m1, s["h2_" + k] / m2
        r["ret_" + k] = b / a if a > 0 else np.nan
        r["h1_" + k + "_min"] = a; r["h2_" + k + "_min"] = b
    r["manut"] = np.nanmean([r["ret_hi_d"], r["ret_dist"]])
    r["vol_hi"] = (s["h1_hi_d"] + s["h2_hi_d"]) / (m1 + m2)
    r["vol_dist"] = (s["h1_dist"] + s["h2_dist"]) / (m1 + m2)
    return r


def por_jogador(df):
    soma = [c for c in df.columns if c[:3] in ("h1_", "h2_")]
    g = df.groupby("pid")
    base = g[soma + ["n"]].sum()
    # posição: a mais jogada (em jogos completos); time e liga: os do jogo mais recente
    pos = df.sort_values("n").groupby("pid")["grupo"].agg(lambda s: s.iloc[-1])
    gp = df.groupby(["pid", "grupo"])["n"].sum().reset_index().sort_values("n").groupby("pid").tail(1).set_index("pid")["grupo"]
    rec = df.sort_values("dmax").groupby("pid").tail(1).set_index("pid")
    out = base.join(gp.rename("grupo")).join(rec[["pn", "nm", "bd", "tn", "edn", "dmax", "pos"]])
    t = pd.DataFrame([taxas(r) for _, r in out.iterrows()], index=out.index)
    out = out.join(t)
    return out[out.n >= MIN_JOGOS].copy()


def notas(j):
    regua = {}
    j["nota"] = None
    for gr, s in j.groupby("grupo"):
        p25, p50, p75 = np.nanpercentile(s.manut, [25, 50, 75]); vmed = np.nanmedian(s.h2_hi_d_min)
        regua[gr] = dict(p25=p25, p50=p50, p75=p75, vol_med=vmed, n=len(s),
                         h1_hi=s.h1_hi_d_min.median(), h2_hi=s.h2_hi_d_min.median(), h1_dist=s.h1_dist_min.median(), h2_dist=s.h2_dist_min.median())
        c = np.where((s.manut >= p75) & (s.h2_hi_d_min >= vmed), "azul", np.where(s.manut >= p50, "verde", np.where(s.manut >= p25, "amarelo", "vermelho")))
        j.loc[s.index, "nota"] = c
    return regua


def serie_b(df):
    """Times da Série B: manutenção do time (todos os jogos completos dos jogadores) × faixa (sobe/meio/cai)."""
    sb = df[df.ed.isin(SERIE_B)].copy(); sb["ano"] = sb.ed.map(SERIE_B)
    cl = classificacao()
    soma = [c for c in df.columns if c[:3] in ("h1_", "h2_")]
    t = sb.groupby(["ano", "tn"])[soma + ["n"]].sum().reset_index()
    t = pd.concat([t, pd.DataFrame([taxas(r) for _, r in t.iterrows()])], axis=1)
    # ponte SkillCorner -> nome do Wyscout (manual, conferida em 01/11/2026)
    PONTE = {'ABC FC': 'ABC', 'AC Goianiense': 'Atlético-GO', 'Amazonas FC': 'Amazonas', 'América Mineiro FC': 'América-MG',
             'Associação Ferroviária de Esportes': 'Ferroviária', 'Athletic Club (Minas Gerais)': 'Athletic', 'Avaí Futebol Clube': 'Avaí',
             'Botafogo FC Ribeirão Preto': 'Botafogo-SP', 'Brusque Futebol Clube': 'Brusque', 'CR Vasco da Gama': 'Vasco', 'CS Alagoano': 'CSA',
             'Ceará Sporting Club': 'Ceará', 'Chapecoense AF': 'Chapecoense', 'Club Athletico Paranaense': 'Athletico-PR',
             'Clube Náutico Capibaribe': 'Náutico', 'Clube de Regatas Brasil': 'CRB', 'Clube do Remo': 'Remo', 'Coritiba FBC': 'Coritiba',
             'Criciuma EC': 'Criciúma', 'Cruzeiro EC': 'Cruzeiro', 'Cuiaba Esporte Club': 'Cuiabá', 'EC Vitória': 'Vitória',
             'Esporte Clube Bahia': 'Bahia', 'Fortaleza EC': 'Fortaleza', 'Goiás EC': 'Goiás', 'Grêmio FB Porto Alegrense': 'Grêmio',
             'Grêmio Novorizontino': 'Novorizontino', 'Guarani FC de Campinas': 'Guarani', 'Ituano Futebol Clube': 'Ituano',
             'Juventude RS': 'Juventude', 'Londrina EC': 'Londrina', 'Mirassol Futebol Clube': 'Mirassol', 'Operário Ferroviário EC': 'Operário-PR',
             'Paysandu SC': 'Paysandu', 'Ponte Preta': 'Ponte Preta', 'SC do Recife': 'Sport', 'Sampaio Corrêa FC': 'Sampaio Corrêa',
             'Santos Futebol Clube': 'Santos', 'São Bernardo FC': 'São Bernardo', 'Tombense FC': 'Tombense', 'Vila Nova FC': 'Vila Nova',
             'Volta Redonda FC': 'Volta Redonda'}
    m = []
    for _, r in t.iterrows():
        hit = cl[(cl.ano == r.ano) & (cl.clube == PONTE.get(r.tn))]
        m.append(hit.iloc[0][["clube", "pos", "faixa"]].to_dict() if len(hit) == 1 else dict(clube=None, pos=None, faixa=None))
    t = pd.concat([t, pd.DataFrame(m)], axis=1)
    t.loc[t.ano >= 2026, "faixa"] = None   # 2026 ainda em andamento: fora da validação
    return t


def main():
    df, meta = ler()
    # notas dos jogadores: só jogos desde 01/01/2025 (a Série B 2022–24 entra só na validação dos times)
    j = por_jogador(df[~df.ed.isin([335, 446, 773])])
    regua = notas(j)
    j.to_csv(os.path.join(OUT, "jogadores.csv"))
    # perfil geral por posição (todos) e por liga
    linhas = []
    for gr in ORDEM:
        s = j[j.grupo == gr]
        r = regua[gr]
        linhas.append(dict(grupo=gr, jogadores=len(s), manut_mediana=round(r["p50"], 3), p25=round(r["p25"], 3), p75=round(r["p75"], 3),
                           queda_hi=round(1 - s.ret_hi_d.median(), 3), queda_dist=round(1 - s.ret_dist.median(), 3), queda_spr=round(1 - s.ret_spr_n.median(), 3),
                           azul=int((s.nota == "azul").sum()), verde=int((s.nota == "verde").sum()), amarelo=int((s.nota == "amarelo").sum()), vermelho=int((s.nota == "vermelho").sum())))
    pos = pd.DataFrame(linhas); pos.to_csv(os.path.join(OUT, "posicoes.csv"), index=False)
    print(pos.to_string(index=False))
    lig = j.groupby("edn").agg(jog=("manut", "size"), manut=("manut", "median"), vol=("vol_hi", "median")).reset_index()
    lig = lig[lig.jog >= 40].sort_values("manut", ascending=False); lig.to_csv(os.path.join(OUT, "ligas.csv"), index=False)
    print(lig.head(12).to_string(index=False)); print(lig.tail(8).to_string(index=False))
    t = serie_b(df); t.to_csv(os.path.join(OUT, "serieb_times.csv"), index=False)
    print(t[["ano", "tn", "clube", "faixa", "manut", "ret_hi_d", "ret_dist", "n"]].sort_values(["ano", "manut"]).to_string(index=False))
    fx = t.dropna(subset=["faixa"]).groupby("faixa", observed=True).agg(times=("manut", "size"), manut=("manut", "mean"), ret_hi=("ret_hi_d", "mean"), ret_dist=("ret_dist", "mean")).reset_index()
    print(fx.to_string(index=False)); fx.to_csv(os.path.join(OUT, "serieb_faixas.csv"), index=False)
    # titulares da Série B 2022–25 (10+ jogos completos no time): manutenção e intensidade do 2º tempo por faixa
    sb = df[df.ed.isin([335, 446, 773, 1061])].copy(); sb["ano"] = sb.ed.map(SERIE_B)
    sb = sb.merge(t[["ano", "tn", "faixa"]], on=["ano", "tn"]); sb = sb[sb.n >= 10].dropna(subset=["faixa"])
    sb = pd.concat([sb.reset_index(drop=True), pd.DataFrame([taxas(r) for _, r in sb.iterrows()])], axis=1)
    tit = sb.groupby("faixa", observed=True).agg(jogadores=("manut", "size"), manut=("manut", "mean"), h1_hi=("h1_hi_d_min", "mean"), h2_hi=("h2_hi_d_min", "mean")).reset_index()
    print(tit.to_string(index=False)); tit.to_csv(os.path.join(OUT, "serieb_titulares.csv"), index=False)
    json.dump(dict(regua=regua, eds=len(meta["eds"])), open(os.path.join(OUT, "regua.json"), "w"), ensure_ascii=False, indent=1, default=float)
    return j, regua, pos, lig, t, fx, meta, tit


if __name__ == "__main__" and "--js" not in sys.argv:
    main()


# ---------------- app: static/segundo_tempo_dados.js ----------------
def _norm(s):
    s = unicodedata.normalize("NFKD", str(s or "")).encode("ascii", "ignore").decode().lower()
    return " ".join(s.replace("-", " ").replace(".", " ").split())


STOP = {'fc', 'cf', 'sc', 'ec', 'club', 'de', 'ca', 'cd', 'sd', 'ac', 'fk', 'sk', 'afc', 'cfc', 'esporte', 'clube', 'futebol', 'football',
        'calcio', 'sport', 'sporting', 'atletico', 'united', 'city', 'real', 'deportivo', 'do', 'da', 'the', 'us', 'as', 'ss', 'if', 'bk',
        'sv', 'vfl', 'tsg', 'rc', 'ud', 'cs', 'csd', 'ad', 'ce', 'se', 'ee'}


def chaves_extra(j, ids, df):
    """App players fora do sc_ids.json: nome (completo ou curto, sem acento) igual ao de um jogador do SkillCorner
    E time em comum (algum time dele no SkillCorner desde 2025 divide uma palavra com o time do app). Ambíguo fica de fora."""
    tok = lambda x: set(_norm(x).split()) - STOP
    base = json.load(open(os.path.join(APP, "dados", "jogadores.json")))["jogadores"]
    times = defaultdict(set); nomes = defaultdict(set)
    for _, r in df.iterrows():
        if r.pid not in j.index: continue
        times[r.pid] |= tok(r.tn); nomes[_norm(r.nm)].add(r.pid); nomes[_norm(r.pn)].add(r.pid)
    # times do jogador no app: o atual + os de 2025/2026 do histórico (quem trocou de clube casa pelo time antigo)
    hist = json.load(open(os.path.join(APP, "dados", "historico.json")))["jogadores"]
    # por time do SkillCorner: jogadores e as palavras do nome completo (para "Paulo Baya" achar "Paulo ... Baya")
    porTime = defaultdict(set)
    for p_, ts in times.items():
        for t_ in ts: porTime[t_].add(p_)
    palavras = {}
    for _, r in df.iterrows():
        if r.pid in j.index: palavras.setdefault(r.pid, set()).update(w for w in (_norm(r.nm).split() + _norm(r.pn).split()) if len(w) >= 3)
    extra = {}
    for b in base:
        k = f"{b['n']} - {b['t']} - {b['l']}"
        if k in ids or b.get("p") == "GOL": continue
        tt = tok(b.get("t"))
        for h in (hist.get(k) or []):
            if isinstance(h, dict) and str(h.get("t")) in ("2025", "2026"): tt |= tok(h.get("tm"))
        c = nomes.get(_norm(b.get("nc")), set()) | nomes.get(_norm(b.get("n")), set())
        c = {p for p in c if tt & times[p]}
        if not c:
            # 2ª tentativa: no mesmo time, alguém cujo nome contém TODAS as palavras do nome do app (3+ letras)
            ws = {w for w in _norm(b.get("nc") or b.get("n")).split() if len(w) >= 3} or {w for w in _norm(b.get("n")).split() if len(w) >= 3}
            cand = set().union(*[porTime[t_] for t_ in tt]) if tt else set()
            c = {p for p in cand if ws and ws <= palavras.get(p, set())}
        if len(c) == 1:
            extra[k] = int(next(iter(c)))
    return extra


def exportar_js(j, regua, pos, lig, fx, meta, anos_sb, tit=None, DF=None):
    ids = json.load(open(os.path.join(APP, "static", "sc_ids.json")))
    G = ORDEM; NOTA = {"azul": 0, "verde": 1, "amarelo": 2, "vermelho": 3}
    jog = {}
    for pid, r in j.iterrows():
        jog[str(int(pid))] = [NOTA[r.nota], round(float(r.manut), 3), round(float(r.ret_hi_d), 3), round(float(r.ret_dist), 3), int(r.n), round(float(r.vol_hi), 2), G.index(r.grupo), round(float(r.h2_hi_d_min), 2)]
    elite = {}
    for g in G:
        s = j[(j.grupo == g) & (j.nota == "azul")].sort_values("manut", ascending=False)
        elite[g] = [[r.pn, r.tn, r.edn, round(float(r.manut), 3), round(float(r.vol_hi), 2), int(r.n)] for _, r in s.iterrows()]
    txt = ""
    if len(fx):
        f = {r.faixa: r for _, r in fx.iterrows()}
        if "Sobe" in f and "Cai" in f:
            d = (f["Sobe"].manut - f["Cai"].manut) * 100
            txt = (f"Times que subiram mantiveram em média {f['Sobe'].manut*100:.1f}% da intensidade do 1º tempo; os que caíram, {f['Cai'].manut*100:.1f}% "
                   f"({'+' if d >= 0 else ''}{d:.1f} pontos para quem sobe). Times: soma de todos os jogos completos dos seus jogadores na Série B.")
    extra = chaves_extra(j, ids, DF[~DF.ed.isin([335, 446, 773])])
    D = dict(min_jogos=MIN_JOGOS, grupos=G, regua={g: {k: round(float(v), 3) for k, v in regua[g].items()} for g in G}, jog=jog, chave=extra,
             estudo=dict(eds=int(DF.ed.nunique()) if DF is not None else len(meta["eds"]), jogos=int(j.n.sum()), jogadores=int(len(j)), gerado=meta.get("gerado", ""),
                         pos=pos.to_dict("records"), ligas=[dict(edn=r.edn, jog=int(r.jog), manut=round(float(r.manut), 3), vol=round(float(r.vol), 2)) for _, r in lig.iterrows()],
                         faixas=[dict(faixa={"Sobe": "Subiram", "Meio": "Ficaram", "Cai": "Caíram"}[r.faixa], times=int(r.times), manut=round(float(r.manut), 3), ret_hi=round(float(r.ret_hi), 3), ret_dist=round(float(r.ret_dist), 3)) for _, r in fx.iterrows()],
                         faixas_txt=txt, serieb_anos=anos_sb, elite=elite,
                         titulares=[dict(faixa={'Sobe': 'Subiram', 'Meio': 'Ficaram', 'Cai': 'Caíram'}[r.faixa], jogadores=int(r.jogadores), manut=round(float(r.manut), 3), h1=round(float(r.h1_hi), 2), h2=round(float(r.h2_hi), 2)) for _, r in tit.iterrows()] if tit is not None else []))
    caminho = os.path.join(APP, "static", "segundo_tempo_dados.js")
    with open(caminho, "w") as f:
        f.write("/* Gerado por Santa Cruz V2/scripts/b28_segundo_tempo.py — não editar à mão. */\nwindow.SEGUNDO_TEMPO = ")
        json.dump(D, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")
    print("app:", caminho, os.path.getsize(caminho) // 1024, "KB ·", len(jog), "jogadores ·", len(extra), "chaves extra")


if __name__ == "__main__" and "--js" in sys.argv:
    j, regua, pos, lig, t, fx, meta, tit = main()
    anos = sorted(t.dropna(subset=["faixa"]).ano.unique())
    exportar_js(j, regua, pos, lig, fx, meta, f"{anos[0]}–{anos[-1]}" if anos else "", tit, ler()[0])
