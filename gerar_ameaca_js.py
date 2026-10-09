"""Aba "Ameaça (xT)": índice de ameaça por jogador, uma APROXIMAÇÃO de xT feita com os totais por 90 do Wyscout.

O xT de verdade precisa de cada passe e condução com ponto de saída e de chegada; a base só tem os totais por 90.
Aqui cada ação que leva a bola para zona de perigo, CERTA, é multiplicada pelo ganho típico de xT daquela ação
(ordens de grandeza do modelo de grade de 12x8 do xT: passe progressivo ~0,012; passe ao terço final ~0,008;
passe certo para a área ~0,045; passe em profundidade certo ~0,03; condução progressiva ~0,015; drible certo ~0,01;
aceleração com bola ~0,005; cruzamento certo ~0,008 — a maior parte do cruzamento já entra em "passes para a área";
e o passe para finalização pelo xA, com peso 0,35). A soma é o "xT estimado por 90". Serve para ordenar e comparar
dentro da posição; o número absoluto é aproximado.

Série B 2026: soma os passes perigosos e as posses/passes que viram finalização em 10 s do SkillCorner (por 30 min
com a bola) — o mais perto de "ameaça criada" que a base tem.
Jogadores: Série B 2026 + 59 ligas do Wyscout (ago/26), 900 min ou mais, sem goleiros e sem os vetados (EXCLUIDOS).
Saída: static/ameaca_dados.js."""
import json, math, os, sqlite3, sys, warnings, datetime
import pandas as pd
warnings.filterwarnings("ignore")
AQUI = os.path.dirname(os.path.abspath(__file__)); V2 = os.path.join(AQUI, "Santa Cruz V2")
sys.path.insert(0, os.path.join(V2, "scripts")); sys.path.insert(0, AQUI)
from _comum import chave, excluidos   # noqa: E402
import listas as L                    # noqa: E402

def col(r, *nomes):
    for n in nomes:
        if n in r.index:
            try:
                v = float(r[n])
                if not math.isnan(v): return v
            except (TypeError, ValueError): pass
    return None
def certo(vol, pct):
    return None if vol is None else vol * ((pct if pct is not None else 0) / 100.0)

# componente -> [(rótulo, função(r) -> certos/90, peso)]
ACOES = {
    "prog": [("Passes progressivos certos", lambda r: certo(col(r, "Passes progressivos/90", "Progressive passes per 90"), col(r, "Passes progressivos certos, %", "Accurate progressive passes, %")), 0.012),
             ("Passes certos ao terço final", lambda r: certo(col(r, "Passes para terço final/90", "Passes to final third per 90"), col(r, "Passes certos para terço final, %", "Accurate passes to final third, %")), 0.008)],
    "area": [("Passes certos para a área", lambda r: certo(col(r, "Passes para a área de penálti/90", "Passes to penalty area per 90"), col(r, "Passes precisos para a área de penálti, %", "Accurate passes to penalty area, %")), 0.045),
             ("Passes em profundidade certos", lambda r: certo(col(r, "Passes em profundidade/90", "Through passes per 90"), col(r, "Passes em profundidade certos, %", "Accurate through passes, %")), 0.030),
             ("Cruzamentos certos", lambda r: certo(col(r, "Cruzamentos/90", "Crosses per 90"), col(r, "Cruzamentos certos, %", "Accurate crosses, %")), 0.008)],
    "cond": [("Conduções progressivas", lambda r: col(r, "Corridas progressivas/90", "Progressive runs per 90"), 0.015),
             ("Dribles certos", lambda r: certo(col(r, "Dribles/90", "Dribbles per 90"), col(r, "Dribles com sucesso, %", "Successful dribbles, %")), 0.010),
             ("Acelerações", lambda r: col(r, "Acelerações/90", "Accelerations per 90"), 0.005)],
    "cria": [("xA", lambda r: col(r, "Assistências esperadas/90", "xA per 90"), 0.35)],
}
COMP = [("prog", "Progressão por passe"), ("area", "Entrega na área"), ("cond", "Condução"), ("cria", "Criação de finalização")]
SA = {"Argentina A", "Argentina B", "Colombia A", "Colombia B", "Equador A", "Equador B", "Paraguai", "Uruguai", "Chile", "Peru", "Bolivia", "Venezuela"}

def main():
    fora = excluidos()
    sb = L.serie_b().copy(); sb["liga"] = "Brasil B"
    sb["sul_americano"] = sb.nascido_em.isin(L.PAIS_SA) | sb.passaporte.fillna("").apply(lambda t: any(p in t for p in L.PAIS_SA))
    lg = L.ligas().copy(); lg = lg[lg.minutos >= 900]
    with open(os.path.join(AQUI, "dados", "jogadores.json"), encoding="utf-8") as fh:
        jd = {}
        for j in json.load(fh)["jogadores"]: jd.setdefault(chave(j["n"]) + "|" + chave(j["t"]), j)

    # SkillCorner da Série B 2026: passes perigosos e o que vira finalização em 10 s
    sc = {}
    db = sqlite3.connect("file:" + os.path.join(V2, "bases", "skillcorner", "skillcorner_serieb.db") + "?mode=ro", uri=True)
    ed = db.execute("select max(sc_competition_edition_id) from passes").fetchone()[0]
    q = """select p.short_name, p.nome, p.team_name, a.pass_dangerous_p30tip, a.pass_shot_within_10s_p30tip, a.pass_goal_within_10s_p30tip,
                  b.possession_shot_within_10s_p30tip, a.minutes_tip
           from passes a join players p on p.sc_player_id = a.sc_player_id
           left join possessions b on b.sc_player_id = a.sc_player_id and b.sc_competition_edition_id = a.sc_competition_edition_id
           where a.sc_competition_edition_id = ?"""
    for sn, nome, time, perig, fin, gol, pfin, mt in db.execute(q, (ed,)):
        v = {"perig": perig, "pfin": fin, "pgol": gol, "posfin": pfin}
        for nm in (sn, nome):
            if nm: sc.setdefault(chave(nm), []).append((chave(time or ""), v))
    def acha_sc(jog, clube):
        c = sc.get(chave(jog)) or []
        if len(c) == 1: return c[0][1]
        cl = chave(clube)
        for t, v in c:
            if cl and (cl in t or t in cl): return v
        return None

    linhas, visto, nsc = [], set(), 0
    for D, eh_b in ((sb, True), (lg, False)):
        for _, r in D.iterrows():
            if r.pos11 == "GOL" or not isinstance(r.pos11, str) or fora(r.jogador, r.clube): continue
            if (r.minutos or 0) < 900: continue
            k = (chave(r.jogador), chave(r.clube), r.liga)
            if k in visto: continue
            visto.add(k)
            comp, det = {}, {}
            for c, acoes in ACOES.items():
                s = 0.0; ok = False
                for rot, f, w in acoes:
                    v = f(r)
                    det[rot] = None if v is None else round(v, 2)
                    if v is not None: s += w * v; ok = True
                comp[c] = round(s, 4) if ok else None
            if all(v is None for v in comp.values()): continue
            tot = round(sum(v for v in comp.values() if v is not None), 4)
            j = jd.get(chave(r.jogador) + "|" + chave(r.clube), {})
            nasc = str(r.get("nascido_em") or ""); psp = str(r.get("passaporte") or "")
            nac = "BR" if (nasc == "Brazil" or "Brazil" in psp) else ("SA" if bool(r.get("sul_americano")) else "")
            liga = r.liga
            merc = "b" if liga == "Brasil B" else "a" if liga == "Brasil A" else "sa" if liga in SA else ("ext" if nac and liga in L.ALCANCAVEIS else "out")
            valor = j.get("mv") or (r.valor if isinstance(r.get("valor"), (int, float)) and not math.isnan(r.valor) else None)
            row = {"n": r.jogador, "c": r.clube, "l": liga, "p": r.pos11, "i": None if pd.isna(r.idade) else int(r.idade), "min": int(r.minutos),
                   "m": merc, "nac": nac, "v": None if not valor else round(valor / 1e6, 2), "ct": (j.get("ct") or (r.contrato if isinstance(r.contrato, str) else "") or "")[:7],
                   "xt": tot, "k": [comp[c] for c, _ in COMP], "d": [det[a] for c, _ in COMP for a, _, _ in ACOES[c]]}
            if eh_b:
                s = acha_sc(r.jogador, r.clube)
                if s: row["sc"] = {k2: (None if v is None else round(v, 2)) for k2, v in s.items()}; nsc += 1
            linhas.append(row)
    # percentis: na posição e liga, e na posição em todas as ligas
    df = pd.DataFrame(linhas)
    df["pl"] = df.groupby(["p", "l"]).xt.rank(pct=True).mul(100).round().astype(int)
    df["pp"] = df.groupby("p").xt.rank(pct=True).mul(100).round().astype(int)
    for i, (_, r) in enumerate(df.iterrows()):
        linhas[i]["pl"] = int(r.pl); linhas[i]["pp"] = int(r.pp)
    saida = {"gerado_em": datetime.date.today().isoformat(), "comp": [{"k": c, "rot": rot, "acoes": [[a, w] for a, _, w in ACOES[c]]} for c, rot in COMP],
             "jog": linhas}
    with open(os.path.join(AQUI, "static", "ameaca_dados.js"), "w", encoding="utf-8") as fh:
        fh.write("/* gerado por gerar_ameaca_js.py — não editar à mão */\nwindow.AMEACA = " + json.dumps(saida, ensure_ascii=False, separators=(",", ":")).replace('"m":', '"m":') + ";\n")
    print(len(linhas), "jogadores ·", nsc, "da Série B com SkillCorner ·", round(os.path.getsize(os.path.join(AQUI, "static", "ameaca_dados.js")) / 1e6, 1), "MB")
    print(df.groupby("m").size().to_dict())
    for pos in ("LD", "VOL", "MEI", "EE", "CA"):
        t = df[(df.p == pos) & (df.l == "Brasil B")].sort_values("xt", ascending=False).head(5)
        print(pos, " · ".join(f"{a} ({b}) {x:.3f}" for a, b, x in zip(t.n, t.c, t.xt)))

if __name__ == "__main__":
    main()
