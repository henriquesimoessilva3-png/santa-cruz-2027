"""Aba "Modelo Novorizontino": o coletivo do Novorizontino na Série B 2026 (técnico e físico, com o ranking entre os 20)
e o elenco de 2026 (minutos, posição, goleiros). O individual de linha (indicadores, percentis, tipo físico, selo e os
parecidos nos três mercados) é calculado no navegador a partir de window.SUBIDA — os mesmos números das abas Subida e
Consulta. Saída: static/novorizontino_dados.js."""
import csv, json, os, sqlite3, statistics as st
from collections import defaultdict

AQUI = os.path.dirname(os.path.abspath(__file__))
V2 = os.path.join(AQUI, "Santa Cruz V2", "bases")
CLUBE, CLUBE_SC, ANO = "Novorizontino", "Grêmio Novorizontino", "2026"

def num(v):
    try: return float(v)
    except (TypeError, ValueError): return None

# ---------- coletivo técnico (Wyscout, média por jogo) ----------
TEC = [  # chave, rótulo, bloco, maior é melhor?
    ("pts", "Pontos", "Campanha", True), ("GP", "Gols marcados", "Campanha", True), ("GC", "Gols sofridos", "Campanha", False),
    ("xg", "xG por jogo", "Ataque", True), ("remates", "Finalizações por jogo", "Ataque", True), ("remates_baliza_pct", "Finalizações no gol %", "Ataque", True),
    ("toques_area", "Toques na área por jogo", "Ataque", True), ("entradas_area", "Entradas na área por jogo", "Ataque", True),
    ("cruzamentos", "Cruzamentos por jogo", "Ataque", True), ("contra_ataques", "Contra-ataques por jogo", "Ataque", True),
    ("posse", "Posse de bola %", "Construção", True), ("passes", "Passes por jogo", "Construção", True), ("passes_pct", "Passes certos %", "Construção", True),
    ("passe_longo_pct", "Passes longos (% do total)", "Construção", True), ("compr_passe", "Comprimento médio do passe (m)", "Construção", True),
    ("passes_progressivos", "Passes progressivos por jogo", "Construção", True), ("passes_terco_final", "Passes ao terço final por jogo", "Construção", True),
    ("xg_contra", "xG sofrido por jogo", "Defesa", False), ("remates_contra", "Finalizações sofridas por jogo", "Defesa", False),
    ("ppda", "PPDA (menor = pressiona mais)", "Defesa", False), ("intensidade", "Intensidade de jogo", "Defesa", True),
    ("recuperacoes", "Recuperações por jogo", "Defesa", True), ("duelos_pct", "Duelos ganhos %", "Defesa", True), ("duelos_aereos_pct", "Duelos aéreos ganhos %", "Defesa", True),
    ("faltas", "Faltas por jogo", "Defesa", False),
    ("bolas_paradas", "Bolas paradas por jogo", "Bola parada", True), ("bp_remates", "Bolas paradas com finalização", "Bola parada", True), ("cantos", "Escanteios por jogo", "Bola parada", True),
]
linhas = [r for r in csv.DictReader(open(os.path.join(AQUI, "dados", "serieb_clube_temporada.csv"), encoding="utf-8-sig")) if r["ano"] == ANO]
nov = next(r for r in linhas if r["clube"] == CLUBE)
J = num(nov["J"])
coletivo = []
for k, rot, bl, maior in TEC:
    vals = [(r["clube"], num(r[k]) / (num(r["J"]) or 1) if k in ("pts", "GP", "GC") else num(r[k])) for r in linhas if num(r.get(k)) is not None]
    if not vals: continue
    ordem = sorted(vals, key=lambda x: -x[1] if maior else x[1])
    v = dict(vals)[CLUBE]
    coletivo.append({"k": k, "rot": rot + (" (por jogo)" if k in ("pts", "GP", "GC") else ""), "bloco": bl, "maior": maior, "v": round(v, 3),
                     "media": round(st.mean(x[1] for x in vals), 3), "melhor": round(ordem[0][1], 3), "melhor_clube": ordem[0][0],
                     "rank": [c for c, _ in ordem].index(CLUBE) + 1, "n": len(vals)})
campanha = {"pos": int(nov["pos"]), "J": int(nov["J"]), "V": int(nov["V"]), "E": int(nov["E"]), "D": int(nov["D"]), "GP": int(nov["GP"]), "GC": int(nov["GC"]), "pts": int(nov["pts"])}

# ---------- coletivo físico (SkillCorner, soma do time por jogo) ----------
FIS = [("distance_p90", "Distância total do time (km)", 1000, True), ("running_distance_p90", "Distância correndo (km)", 1000, True),
       ("hsr_distance_p90", "Distância em alta velocidade (km)", 1000, True), ("sprint_distance_p90", "Distância em sprint (m)", 1, True),
       ("sprint_count_p90", "Sprints", 1, True), ("hi_count_p90", "Ações de alta intensidade", 1, True),
       ("high_accel_p90", "Acelerações fortes", 1, True), ("expl_accel_sprint_p90", "Arrancadas explosivas", 1, True)]
db = sqlite3.connect("file:" + os.path.join(V2, "skillcorner", "skillcorner_serieb.db") + "?mode=ro", uri=True)
pm = db.execute("select sc_match_id, team_name, minutes_played, psv99, " + ",".join(k for k, *_ in FIS) + " from physical_match where match_date >= ?", (ANO + "-01-01",)).fetchall()
porjogo = defaultdict(lambda: defaultdict(float)); psv = defaultdict(list)
for row in pm:
    mid, time, mins, p = row[:4]
    if not mins: continue
    for (k, *_), v in zip(FIS, row[4:]):
        if v is not None: porjogo[(time, mid)][k] += v * mins / 90.0
    if p and mins >= 45: psv[time].append(p)
times = defaultdict(lambda: defaultdict(list))
for (time, mid), d in porjogo.items():
    for k, v in d.items(): times[time][k].append(v)
fisico = []
for k, rot, div, maior in FIS:
    vals = [(t, st.mean(d[k]) / div) for t, d in times.items() if d[k]]
    ordem = sorted(vals, key=lambda x: -x[1])
    v = dict(vals)[CLUBE_SC]
    fisico.append({"k": k, "rot": rot + " por jogo", "v": round(v, 2), "media": round(st.mean(x[1] for x in vals), 2), "melhor": round(ordem[0][1], 2),
                   "melhor_clube": ordem[0][0], "rank": [t for t, _ in ordem].index(CLUBE_SC) + 1, "n": len(vals), "maior": maior})
vals = sorted(((t, st.median(v)) for t, v in psv.items()), key=lambda x: -x[1])
fisico.append({"k": "psv", "rot": "Velocidade máxima mediana dos jogadores (PSV-99, km/h)", "v": round(dict(vals)[CLUBE_SC], 2), "media": round(st.mean(x[1] for x in vals), 2),
               "melhor": round(vals[0][1], 2), "melhor_clube": vals[0][0], "rank": [t for t, _ in vals].index(CLUBE_SC) + 1, "n": len(vals), "maior": True})
jogos_fis = len({mid for (t, mid) in porjogo if t == CLUBE_SC})
ult_fis = max(r[0] for r in db.execute("select match_date from physical_match where team_name = ?", (CLUBE_SC,)))

# ---------- elenco 2026 (Wyscout) e goleiros ----------
elenco, gols = [], []
for r in csv.DictReader(open(os.path.join(V2, "serieb_tecnico.csv"), encoding="utf-8-sig")):
    if r["ano"] != ANO or r["Equipa"] != CLUBE: continue
    m = num(r.get("Minutos jogados:")) or 0
    e = {"n": r["Jogador"], "pos": r.get("posicao_1") or r.get("Posição"), "posicoes": r.get("Posição"), "idade": num(r.get("Idade")), "min": int(m),
         "jogos": int(num(r.get("Partidas jogadas")) or 0), "gols": int(num(r.get("Golos")) or 0), "assist": int(num(r.get("Assistências")) or 0),
         "nac": r.get("País de nacionalidade"), "pe": r.get("Pé"), "alt": num(r.get("Altura")), "contrato": r.get("Contrato termina"), "emprestado": r.get("Emprestado")}
    if (r.get("posicao_1") or "") == "GK":
        e["gk"] = {"gs90": num(r.get("Golos sofridos/90")), "def_pct": num(r.get("Defesas, %")), "xgs90": num(r.get("Golos sofridos esperados/90")),
                   "evit90": num(r.get("Golos expectáveis defendidos por 90´")), "saidas90": num(r.get("Saídas/90"))}
    elenco.append(e)
elenco.sort(key=lambda e: -e["min"])
treinador = None
for r in csv.DictReader(open(os.path.join(V2, "coletas", "T01_rodada_treinador.csv"), encoding="utf-8-sig")):
    if r["temporada"] == ANO and r["clube_wyscout"] == CLUBE: treinador = {"nome": r["treinador"], "desde": r["inicio"], "rodada": r["rodada"]}

# ---------- titulares que a base da Subida tirou (vetados nas recomendações, como o Rômulo) ----------
# A base da Subida não traz quem está em EXCLUIDOS. Para o estudo do Novorizontino eles contam (são do time): monta a
# linha deles do mesmo jeito, rodando o gerador da Subida sem a lista de excluídos num arquivo temporário.
import tempfile, importlib, sys
sys.argv = sys.argv[:1]
G = importlib.import_module("gerar_subida_js")
G.excluidos = lambda: (lambda *a, **k: False)
tmp = os.path.join(tempfile.gettempdir(), "subida_sem_excluidos.js"); G.SAIDA = tmp
import contextlib, io
with contextlib.redirect_stdout(io.StringIO()): G.main()
t = open(tmp, encoding="utf-8").read(); tudo = json.loads(t[t.index("{"):t.rindex("}") + 1])
t = open(os.path.join(AQUI, "static", "subida_dados.js"), encoding="utf-8").read(); atual = json.loads(t[t.index("{"):t.rindex("}") + 1])
extra = {}
for pos, P in tudo["posicoes"].items():
    tem = {(r[0], r[2]) for r in atual["posicoes"][pos]["jog"]}
    for r in P["jog"]:
        if r[2] == CLUBE and r[3] == "Brasil B" and (r[0], r[2]) not in tem:
            extra.setdefault(pos, []).append(r)
print("fora da base da Subida (vetados), entram só aqui:", {p: [r[0] for r in v] for p, v in extra.items()})

saida = {"extra": extra, "gerado_em": __import__("datetime").date.today().isoformat(), "clube": CLUBE, "ano": ANO, "campanha": campanha, "treinador": treinador,
         "coletivo": coletivo, "fisico": fisico, "jogos_fis": jogos_fis, "ult_fis": ult_fis, "elenco": elenco}
with open(os.path.join(AQUI, "static", "novorizontino_dados.js"), "w", encoding="utf-8") as fh:
    fh.write("/* gerado por gerar_novorizontino_js.py — não editar à mão */\nwindow.NOVORIZ = " + json.dumps(saida, ensure_ascii=False) + ";\n")
print("coletivo", len(coletivo), "· físico", len(fisico), "jogos", jogos_fis, "até", ult_fis, "· elenco", len(elenco), "· treinador", treinador)
for c in coletivo + fisico: print(f"  {c['rot'][:46]:46} {c['v']:>9} média {c['media']:>9}  {c['rank']}º/{c['n']}")
