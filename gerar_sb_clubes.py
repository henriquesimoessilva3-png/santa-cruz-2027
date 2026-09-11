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

from analisar_serieb import base

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
    ("usados", "atletas_usados", 0), ("share11", "share_11", 2),
    ("idade", "idade_pond", 2), ("minEstr", "min_estrangeiros", 2),
    ("plantel", "plantel", 0), ("aereos", "duelos_aereos_pct", 2),
    ("cruzPct", "cruz_certos_pct", 2), ("faltas", "faltas", 2),
]

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


def main():
    t = base()
    campos = [c for c, _, _ in CAMPOS]
    linhas = []
    for _, r in t.sort_values(["ano", "pos"]).iterrows():
        v = []
        for _, col, casas in CAMPOS:
            x = r[col]
            v.append(int(round(x)) if casas == 0 else round(float(x), casas))
        linhas.append(f"  [{int(r.ano)},{json.dumps(r.clube, ensure_ascii=False)},"
                      + ",".join(repr(x) for x in v) + "],")

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
    kb = os.path.getsize(SAIDA) / 1024
    print(f"static/sb_clubes.js · {len(linhas)} linhas · {len(campos)} campos · {kb:.0f} KB")


if __name__ == "__main__":
    main()
