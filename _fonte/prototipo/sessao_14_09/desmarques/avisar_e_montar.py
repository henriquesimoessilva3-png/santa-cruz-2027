"""Fecha a lista de desmarques dos 16 times que subiram e monta a pagina.

Le lista.json (montado por montar.py e conferido em conferencia/), acrescenta os
avisos que a conferencia pediu e grava:
  - lista_final.json  : a lista inteira com o campo `avisos` em cada jogador
  - dados_pagina.json : a versao enxuta que a pagina embute
  - desmarques_de_quem_subiu.html (aqui e, se passado, na pasta do 1o argumento)

Avisos:
  - clubes : jogou por 2+ clubes na mesma Serie B (so da para ver em 2025, que e o
             unico ano com physical_match); os seis numeros somam os dois clubes.
  - xara   : o Wyscout tem 2+ linhas com o mesmo nome no mesmo ano; a ponte usa a
             primeira para setor e idade, entao o setor pode ser o do outro.
  - curto  : o setor do jogador tem 1 a 3 atletas na conta do time.

So le o projeto. Nao grava nada fora desta pasta (e da pasta do argumento).
"""
import json
import os
import re
import sqlite3
import sys

sys.dont_write_bytecode = True
RAIZ = "/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz"
sys.path.insert(0, RAIZ)
import pandas as pd  # noqa: E402
import analisar_serieb as A  # noqa: E402

AQUI = os.path.dirname(os.path.abspath(__file__))
M = ["runs_p30tip", "runs_above_hsr_p30tip", "runs_penalty_area_p30tip",
     "runs_dangerous_p30tip", "runs_received_p30tip", "runs_shot_within_10s_p30tip"]
ED = {2022: 335, 2023: 446, 2024: 773, 2025: 1061}
SETOR_PLURAL = {"zaga": "zagueiros", "lateral": "laterais", "meio": "meio-campistas",
                "ataque": "atacantes"}

L = json.load(open(os.path.join(AQUI, "lista.json")))

con = sqlite3.connect(f"file:{A.SKILLCORNER}?mode=ro", uri=True)
pm = pd.read_sql(
    "select sc_player_id id, sc_competition_edition_id ed, team_name, "
    "count(distinct sc_match_id) jogos from physical_match "
    "where sc_competition_edition_id in (335,446,773,1061) and team_name is not null "
    "group by 1,2,3", con)
eds_jogo_a_jogo = sorted(int(e) for e in pm.ed.unique())

T = pd.read_csv(f"{RAIZ}/dados/serieb_tecnico.csv")
T["k"] = T.Jogador.map(A.chave_nome)


def arred(x, n=2):
    return None if x is None else round(float(x), n)


def motivo_simples(m):
    """Os motivos da lista.json falam a lingua do banco; a pagina e para gente de futebol."""
    if not m:
        return None
    c = re.search(r"abaixo do corte de 300 min rastreados \((\d+)\)", m)
    if c:
        return f"Jogou {c.group(1)} minutos rastreados, abaixo dos 300 que entram na conta."
    if m.startswith("linha em off_ball_runs existe"):
        return ("O SkillCorner tem o jogador no ano, mas sem os números de corrida sem bola. "
                "Ele fica fora do número do time.")
    if m.startswith("sem linha em off_ball_runs"):
        return "O SkillCorner não tem corrida sem bola desse jogador no ano."
    raise ValueError(f"motivo sem traducao: {m}")


cont = {"clubes": 0, "xara": 0, "curto": 0}
times, jogs = [], []
for ti, t in enumerate(L["times"]):
    ed = ED[t["ano"]]
    curtos = {s: v["n_jogadores"] for s, v in t["por_setor"].items()
              if 1 <= v["n_jogadores"] <= 3}
    times.append({
        "ano": t["ano"], "clube": t["clube"], "pos": t["posicao_final"],
        "pts": t["pontos"], "conta": t["n_jogadores_na_conta"],
        "ti": [arred(t["time_inteiro"]["estudo_media_ponderada"].get(m)) for m in M],
        "setores": {s: {"n": v["n_jogadores"],
                        "v": [arred(v["estudo_media_ponderada"].get(m)) for m in M]}
                    for s, v in t["por_setor"].items()},
        "curtos": curtos,
    })
    for j in t["jogadores"]:
        av = []
        g = pm[(pm.id == j["id_skillcorner"]) & (pm.ed == ed)]
        if g.team_name.nunique() > 1:
            g = g.sort_values("jogos", ascending=False)
            partes = [f"{int(r.jogos)} jogos pelo {r.team_name}" for r in g.itertuples()]
            av.append({"tipo": "clubes", "curto": "2 clubes",
                       "texto": f"Jogou por mais de um clube na Série B {t['ano']}: "
                                + " e ".join(partes)
                                + ". Os seis números somam os jogos pelos clubes."})
            cont["clubes"] += 1
        g2 = T[(T.ano == t["ano"]) & (T.k == A.chave_nome(j["nome_skillcorner"]))]
        if len(g2) > 1:
            desc = "; ".join(
                f"{r.posicao_1}" + ("" if pd.isna(r.idade_na_temporada)
                                    else f", {int(r.idade_na_temporada)} anos")
                for r in g2.itertuples())
            av.append({"tipo": "xara", "curto": "xará",
                       "texto": f"O Wyscout tem {len(g2)} jogadores com esse nome no clube "
                                f"em {t['ano']} ({desc}). O setor pode ser o do outro."})
            cont["xara"] += 1
        if j["entra_na_conta_do_time"] and j["setor"] in curtos:
            n = curtos[j["setor"]]
            av.append({"tipo": "curto", "curto": f"setor com {n}",
                       "texto": f"Só {n} {SETOR_PLURAL.get(j['setor'], j['setor'])} na conta "
                                f"do time: o número desse setor no time é, na prática, "
                                f"{'o dele' if n == 1 else 'o desses ' + str(n)}."})
            cont["curto"] += 1
        # os avisos refeitos aqui tem de ser os mesmos que o conserto de 14/09 gravou
        tipos = {a["tipo"] for a in av}
        assert ("clubes" in tipos) == bool(j.get("aviso_clube_duplo")), j["nome_skillcorner"]
        assert ("xara" in tipos) == bool(j.get("aviso_xara_wyscout")), j["nome_skillcorner"]
        j["avisos"] = av
        motivo = motivo_simples(j.get("motivo_ausencia") or j.get("motivo_sem_percentil"))
        p = j.get("percentis")
        jogs.append({
            "t": ti, "nome": j["nome_skillcorner"], "completo": j.get("nome_completo_skillcorner"),
            "wy": j.get("nome_wyscout"), "id": j["id_skillcorner"], "setor": j["setor"],
            "posw": j.get("posicao_wyscout"), "min": arred(j.get("minutos_rastreados"), 0),
            "jogos": j.get("partidas"), "conta": bool(j["entra_na_conta_do_time"]),
            "v": [arred((j.get("numeros") or {}).get(m)) for m in M],
            "p": None if not p else [arred(p.get(m), 1) for m in M],
            "pm": arred(j.get("percentil_medio"), 1), "av": av, "motivo": motivo,
        })

ref = {}
for ano, setores in L["referencia"].items():
    ref[ano] = {s: {g: [v["n_jogadores"]] + [arred(v.get(m), 3) for m in M]
                    for g, v in grupos.items()}
                for s, grupos in setores.items()}

L["avisos_regra"] = (
    "avisos por jogador: 'clubes' = mais de um clube na mesma Serie B pelo physical_match "
    f"(so existe nas edicoes {eds_jogo_a_jogo}; 2022-2024 nao da para conferir); "
    "'xara' = 2+ linhas do Wyscout com o mesmo nome no ano; "
    "'curto' = setor com 1 a 3 atletas na conta do time.")
json.dump(L, open(os.path.join(AQUI, "lista_final.json"), "w"), ensure_ascii=False, indent=1)

dados = {"times": times, "jog": jogs, "ref": ref, "gerado": "14/09/2026",
         "jogo_a_jogo": eds_jogo_a_jogo}
json.dump(dados, open(os.path.join(AQUI, "dados_pagina.json"), "w"), ensure_ascii=False)

modelo = open(os.path.join(AQUI, "pagina_modelo.html"), encoding="utf-8").read()
embutido = json.dumps(dados, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
assert modelo.count("__DADOS__") == 1
html = modelo.replace("__DADOS__", embutido)
destinos = [AQUI] + sys.argv[1:]
for d in destinos:
    with open(os.path.join(d, "desmarques_de_quem_subiu.html"), "w", encoding="utf-8") as f:
        f.write(html)

print("avisos:", cont)
print("times:", len(times), "| jogadores:", len(jogs),
      "| na conta:", sum(j["conta"] for j in jogs),
      "| com posicao no setor:", sum(1 for j in jogs if j["p"]))
print("html:", round(len(html.encode()) / 1024), "KB ->", destinos)
