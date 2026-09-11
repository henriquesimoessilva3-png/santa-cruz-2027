#!/usr/bin/env python3
"""Escreve static/sb_clubes.js — os 100 clube-temporada da Serie B que a aba do app le.

Por que um arquivo gerado e nao um calculo no navegador: as tres bases somam quase 10 MB
(5,8 do jogo a jogo, 1,9 do tecnico, 1,1 dos elencos). Mandar isso para o navegador de
alguem que so quer ver a aba seria absurdo. O que a aba precisa sao 100 linhas com ~30
numeros cada — uns 20 KB, que cabem no mesmo lugar onde ja mora a SB_TABELAS.

O que NAO muda com isso: continua valendo a regra da aba de que **o dado e a fonte e o
texto e consequencia**. Nenhuma media, nenhuma correlacao e nenhum percentual da tela sai
daqui pronto: o `sb_clubes.js` traz so o que foi MEDIDO em cada clube-temporada, e as
contas acontecem no `sbResumo()` como sempre aconteceram. Se uma partida for corrigida na
base, roda-se este script de novo e a tela inteira se corrige.

Rode depois de mexer em qualquer uma das tres bases:
    python3 gerar_sb_clubes.py
"""
import json
import os
import unicodedata

import pandas as pd

from analisar_serieb import SETORES, base, nfc

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, "static", "sb_clubes.js")

# nome curto no JS -> coluna na tabela -> casas decimais.
# Os campos que ja existem na SB_TABELAS (pos, J, V, E, D, GP, GC) NAO entram: seriam
# duas fontes para o mesmo numero, e um dia elas discordariam.
CAMPOS = [
    ("rem", "remates", 2), ("remBal", "remates_baliza_pct", 1),
    ("remCon", "remates_contra", 2), ("xg", "xg", 3), ("xgCon", "xg_contra", 3),
    ("dist", "dist_remate", 1), ("toques", "toques_area", 2),
    ("ppda", "ppda", 2), ("posse", "posse", 2), ("passePct", "passes_pct", 2),
    ("bp", "bolas_paradas", 2), ("bpRem", "bp_remates", 2), ("cantos", "cantos", 2),
    ("penCon", "penaltis_conv", 0), ("cabeca", "golos_cabeca", 0),
    ("cs", "clean_sheets", 0), ("branco", "brancos", 0),
    ("goleadaPro", "goleadas_pro", 0), ("goleadaCon", "goleadas_con", 0),
    ("ptsCasa", "pontos_casa", 0), ("ptsFora", "pontos_fora", 0),
    ("valor", "tm_valor_total", 0), ("valDef", "val_defesa", 0),
    ("valMeio", "val_meio", 0), ("valAtq", "val_ataque", 0), ("valGol", "val_goleiro", 0),
    ("usados", "atletas_usados", 0), ("nucleo300", "nucleo_300", 0),
    ("nucleo1000", "nucleo_1000", 0), ("share11", "share_11", 2),
    ("idade", "idade_pond", 2), ("minEstr", "min_estrangeiros", 2),
    ("plantel", "plantel", 0), ("aereos", "duelos_aereos_pct", 2),
    ("cruzPct", "cruz_certos_pct", 2), ("faltas", "faltas", 2),
    # --- a segunda camada de perguntas (analisar_serieb.extras_profundos) ---
    ("aprovG6", "aprovG6", 2), ("aprovMeio", "aprovMeio", 2), ("aprovZ6", "aprovZ6", 2),
    ("pts1t", "pts1t", 0), ("pts2t", "pts2t", 0),
    ("pts10ini", "pts10ini", 0), ("pts10fim", "pts10fim", 0),
    ("semVencer", "maxSemVencer", 0), ("vitSeguidas", "maxVitorias", 0),
    ("ptsAposD", "ptsAposDerrota", 2),
    ("formacoes", "formacoes", 0), ("formPct", "formPrincipalPct", 1),
    ("pctArtilheiro", "pctArtilheiro", 1), ("marcadores", "marcadores", 0),
    ("pctTop3", "pctTop3", 1),
    ("gkDefesas", "gkDefesas", 2), ("gkEvitados", "gkEvitados", 3),
    ("pctFicou", "pctFicou", 1), ("novos", "novos", 0),
    # --- fisico, do SkillCorner (ponte de nome conferida em 98%) ---
    ("psv99", "fis_psv99", 2), ("dist90", "fis_distance_p90", 0),
    ("mPorMin", "fis_m_per_min", 1), ("corrida90", "fis_running_distance_p90", 0),
    ("hsrDist", "fis_hsr_distance_p90", 0), ("hsrQtd", "fis_hsr_count_p90", 1),
    ("sprintDist", "fis_sprint_distance_p90", 0), ("sprintQtd", "fis_sprint_count_p90", 2),
    ("hiDist", "fis_hi_distance_p90", 0), ("acel", "fis_high_accel_p90", 2),
    ("desacel", "fis_high_decel_p90", 2), ("mudDirecao", "fis_cod_count_p90", 1),
    ("fisAtletas", "fis_atletas", 0),
]

# Campos de TEXTO (a formacao mais usada). Ficam a parte porque nao passam pelo
# arredondamento numerico.
CAMPOS_TXT = [("formPrin", "formPrincipal")]

# --- distribuicao por idade ---
# As faixas sao fechadas a ESQUERDA: "20 a 23" e 20, 21 e 22. Sem essa convencao escrita,
# alguem um dia soma 23 nas duas faixas vizinhas e o total passa de 100%.
FAIXAS = [("ate20", 0, 20), ("f2023", 20, 23), ("f2327", 23, 27), ("f2730", 27, 30), ("f30", 30, 99)]
GRUPOS = ["goleiro", "defesa", "meio", "ataque"]


def por_idade():
    """Minutos e atletas de cada clube-temporada, por setor x faixa etaria.

    A idade e a `idade_na_temporada` do serieb_tecnico.csv, que e a idade do atleta em
    SETEMBRO daquele ano (os dez arquivos do Wyscout sairam em 11/09/2026, e a coluna
    original e a idade naquele dia). Conferida contra 3.181 datas de nascimento do
    Transfermarkt: bate exatamente em 90% dos casos e erra um ano em 9% — e parte desses 9%
    e homonimo casado errado, nao idade errada. Para faixas de tres e quatro anos isso e
    aceitavel; para qualquer conta no nivel do atleta, nao e.
    """
    T = pd.read_csv(os.path.join(AQUI, "dados", "serieb_tecnico.csv"))
    T["clube"] = T["Equipa dentro de um período de tempo seleccionado"].map(nfc)
    T["grupo"] = T["posicao_1"].map(lambda p: SETORES.get(str(p), "ataque"))

    def faixa(i):
        if pd.isna(i):
            return None
        for nome, a, b in FAIXAS:
            if a <= i < b:
                return nome
        return None

    T["faixa"] = T["idade_na_temporada"].map(faixa)
    T = T[T["faixa"].notna()]
    minutos, atletas = {}, {}
    for (ano, clube, g, f), d in T.groupby(["ano", "clube", "grupo", "faixa"]):
        minutos[(ano, clube, g, f)] = int(d["Minutos jogados:"].sum())
        atletas[(ano, clube, g, f)] = int(len(d))
    return minutos, atletas


def uso_por_setor():
    """Quantos atletas cada clube usou em cada setor, e quantos de fato jogaram.

    Tres camadas por setor: quem passou de 1000 minutos (o time de verdade, uns onze jogos
    inteiros), quem passou de 300 (foi opcao, nao so entrou uma vez) e o total de usados.
    E o mesmo corte do bloco geral, agora aberto por posicao — que e onde se ve QUAL setor
    o clube passou o ano procurando.
    """
    T = pd.read_csv(os.path.join(AQUI, "dados", "serieb_tecnico.csv"))
    T["clube"] = T["Equipa dentro de um período de tempo seleccionado"].map(nfc)
    T["grupo"] = T["posicao_1"].map(lambda p: SETORES.get(str(p), "ataque"))
    fora = {}
    for (ano, clube, g), d in T.groupby(["ano", "clube", "grupo"]):
        m = d["Minutos jogados:"]
        fora[(ano, clube, g)] = (len(d), int((m >= 300).sum()), int((m >= 1000).sum()))
    return fora


CABECALHO = '''/* GERADO POR gerar_sb_clubes.py — NAO EDITE A MAO.

   Os 100 clube-temporada da Serie B de 2022 a 2026, com o que as tres bases mediram em
   cada um. As bases inteiras somam quase 10 MB e nao tem por que viajar ate o navegador;
   isto aqui tem 100 linhas.

   Continua valendo a regra da aba: **o dado e a fonte, o texto e consequencia.** Aqui so
   entra o que foi MEDIDO. Toda media, correlacao e percentual da tela e calculado em
   `sbResumo()`, em static/app.js. Nenhum numero da tela vem pronto daqui.

   Nao ha pos, J, V, E, D, GP nem GC: esses ja estao na SB_TABELAS. Duas fontes para o
   mesmo numero e o jeito mais certo de um dia elas discordarem.

   Refazer:  python3 gerar_sb_clubes.py
*/
'''


t_base = None


def main():
    global t_base
    t = t_base = base()
    campos = [c for c, _, _ in CAMPOS] + [c for c, _ in CAMPOS_TXT]
    linhas = []
    for _, r in t.sort_values(["ano", "pos"]).iterrows():
        v = []
        for _, col, casas in CAMPOS:
            x = r[col]
            # NaN vira null: 44 dos 100 clube-temporada nao tem ano anterior na Serie B, e
            # `pctFicou` deles nao e zero — e ausente. Zero ali seria mentira.
            if pd.isna(x):
                v.append("null")
            else:
                v.append(repr(int(round(x)) if casas == 0 else round(float(x), casas)))
        for _, col in CAMPOS_TXT:
            v.append(json.dumps("" if pd.isna(r[col]) else str(r[col]), ensure_ascii=False))
        linhas.append(f"  [{int(r.ano)},{json.dumps(r.clube, ensure_ascii=False)},"
                      + ",".join(v) + "],")

    with open(SAIDA, "w", encoding="utf-8") as f:
        f.write(CABECALHO)
        f.write("const SB_CAMPOS = " + json.dumps(campos) + ";\n\n")
        f.write("/* ano, clube, " + ", ".join(campos) + " */\n")
        f.write("const SB_CLUBES = [\n")
        f.write("\n".join(linhas))
        f.write("\n];\n\n")
        f.write("""/* Vira {ano, clube, rem, xg, ...} — e assim o resto do codigo nunca precisa
   saber a ordem das colunas. */
const SB_POR_CLUBE = SB_CLUBES.map(l => {
  const o = { ano: l[0], clube: l[1] };
  SB_CAMPOS.forEach((c, i) => { o[c] = l[i + 2]; });
  return o;
});

""")
        # --- distribuicao por idade ---
        minutos, atletas = por_idade()
        f.write("""/* Minutos e atletas por SETOR x FAIXA ETARIA. As faixas sao fechadas a esquerda:
   "20 a 23" e 20, 21 e 22 — sem isso alguem soma 23 nas duas faixas vizinhas.

   A idade e a do atleta em SETEMBRO daquele ano (a coluna do Wyscout e a idade no dia da
   exportacao, 11/09/2026). Conferida contra 3.181 datas de nascimento do Transfermarkt:
   exata em 90%, um ano de diferenca em 9% — e parte desses 9% e homonimo casado errado.
   Serve para faixas de tres e quatro anos; nao serve para conta no nivel do atleta. */
""")
        f.write("const SB_FAIXAS = " + json.dumps([n for n, _, _ in FAIXAS]) + ";\n")
        f.write("const SB_FAIXA_ROT = " + json.dumps(["até 20", "20 a 23", "23 a 27", "27 a 30", "30+"],
                                                     ensure_ascii=False) + ";\n")
        f.write("const SB_GRUPOS = " + json.dumps(GRUPOS, ensure_ascii=False) + ";\n\n")
        f.write("/* ano, clube, [minutos, atletas] por grupo x faixa, na ordem acima */\n")
        f.write("const SB_IDADE = [\n")
        for _, r in t_base.sort_values(["ano", "pos"]).iterrows():
            v = []
            for g in GRUPOS:
                for nome, _, _ in FAIXAS:
                    k = (int(r.ano), r.clube, g, nome)
                    v.append(minutos.get(k, 0))
                    v.append(atletas.get(k, 0))
            f.write(f"  [{int(r.ano)},{json.dumps(r.clube, ensure_ascii=False)}," + ",".join(map(str, v)) + "],\n")
        f.write("];\n\n")
        f.write("""/* Vira {ano, clube, grupo: {faixa: {min, n}}} — o resto do codigo nunca precisa
   saber a ordem em que os 40 numeros foram escritos. */
const SB_IDADE_POR_CLUBE = SB_IDADE.map(l => {
  const o = { ano: l[0], clube: l[1], g: {} };
  let i = 2;
  SB_GRUPOS.forEach(g => {
    o.g[g] = {};
    SB_FAIXAS.forEach(f => { o.g[g][f] = { min: l[i++], n: l[i++] }; });
  });
  return o;
});

""")
        # --- uso de elenco por setor ---
        uso = uso_por_setor()
        f.write("""/* Atletas usados por SETOR, em tres camadas: total, quem passou de 300 minutos e quem
   passou de 1000. Mesmos cortes do bloco geral, abertos por posicao — e onde se ve QUAL
   setor o clube passou o ano procurando. */
/* ano, clube, [usados, n300, n1000] por grupo, na ordem de SB_GRUPOS */
""")
        f.write("const SB_USO_SETOR = [\n")
        for _, r in t_base.sort_values(["ano", "pos"]).iterrows():
            v = []
            for g in GRUPOS:
                v.extend(uso.get((int(r.ano), r.clube, g), (0, 0, 0)))
            f.write(f"  [{int(r.ano)},{json.dumps(r.clube, ensure_ascii=False)}," + ",".join(map(str, v)) + "],\n")
        f.write("];\n\n")
        f.write("""const SB_USO_POR_CLUBE = SB_USO_SETOR.map(l => {
  const o = { ano: l[0], clube: l[1], g: {} };
  let i = 2;
  SB_GRUPOS.forEach(g => { o.g[g] = { usados: l[i++], n300: l[i++], n1000: l[i++] }; });
  return o;
});
""")
    kb = os.path.getsize(SAIDA) / 1024
    print(f"static/sb_clubes.js · {len(linhas)} linhas · {len(campos)} campos · {kb:.0f} KB")


if __name__ == "__main__":
    main()
