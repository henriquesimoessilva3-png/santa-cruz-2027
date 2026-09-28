"""Quem eu contrataria (a montagem) — gerado a partir de "Os meus dez por posição" (ideal10.pool), para que a
montagem, a Decisão e as listas cheguem ao mesmo nome. Regra: por posição, as vagas são preenchidas na ordem de
"Os meus dez", quem chega livre primeiro (a montagem é a passe zero); o melhor com contrato aparece como
"só se liberar". As seções 1 (elenco atual) e 2 (treinador) são texto mantido do documento; 3, 4 e 5 saem do pool.
Saída: listas/ELENCO_2027.md"""
import os, re, pandas as pd
from _comum import RAIZ
from top10 import POS
from ideal10 import pool

L = os.path.join(RAIZ, "listas")
VAGAS = {"GOL": 2, "LD": 2, "ZD": 2, "ZE": 2, "LE": 2, "VOL": 3, "MED": 2, "MEI": 2, "ED": 2, "EE": 2, "CA": 2}
PEDE = {"GOL": "vídeo decide (T1-5); os dois nomes vêm das duas notas", "LD": "explosivo e rápido é o tipo de quem sobe (F2-4); chega ao gol (➚)",
        "ZD": "o que cria e ganha no alto (T1-4); o físico não separa aqui", "ZE": "o que finaliza e sai jogando (T1-4); motor de volume é o tipo de quem sobe (F2-4)",
        "LE": "o que chega ao gol (T1-4, ➚); explosivo e rápido (F2-4)", "VOL": "duelo aéreo, corrida progressiva, interceptação (T1-4); mais intenso / intermediário (F2-4)",
        "MED": "o criador que ganha duelo (T1-4) e cobrador nº 1 (T2-3); médio em tudo (F2-4)", "MEI": "cria, chega à área, cobra (T1-4, T2-3); o físico não separa",
        "ED": "o que defende e cria, não o finalizador (T1-4); o físico não separa", "EE": "o que decide (T1-4); explosivo e rápido (F2-4)",
        "CA": "acelera, chega à área, cabeceia (T1-4, F1-3); motor de volume (F2-4)"}
f = lambda v, c=0: "—" if pd.isna(v) else f"{v:.{c}f}".replace(".", ",")
dt = lambda c: (str(c)[5:7] + "/" + str(c)[2:4]) if isinstance(c, str) and len(c) >= 7 else "sem contrato"

def porque(r):
    p = [f"nota {f(r.nota)} ({f(r.aderencia_ajustada)}/{f(r.nivel_overall)})"]
    if isinstance(r.tipo, str): p.append(("tipo de quem sobe: " if r.tipo_pref else "tipo ") + r.tipo.lower())
    if r.bp >= 85: p.append(f"bola parada {f(r.bp)}")
    if r.gol_def: p.append("gol de defesa ⚽")
    if r.chega_area: p.append("chega à área ➚")
    if isinstance(r.scouts, str): p.append("★ " + r.scouts)
    p.append("PSV " + f(r.psv, 1) if pd.notna(r.psv) else "sem rastreio físico")
    return "; ".join(p)

def sit(r):
    liga = "" if r.mercado_l == "Série B" else f", {r.liga}"
    return f"{r.clube}{liga}, {int(r.idade)}, " + ("livre" + ("" if dt(r.contrato) == "sem contrato" else f" ({dt(r.contrato)})") if r.livre else f"contrato até {dt(r.contrato)}")

def main():
    d = pool()
    old = open(os.path.join(L, "ELENCO_2027.md"), encoding="utf-8").read()
    cab = old[:old.index("## 2.")]
    cab += """## 2. Treinador

A ordem é a de `Decisão 2027`: **1. Eduardo Baptista** — o modelo mais alinhado ao eixo do estudo (linha de 3, jogo direto, aéreo, intenso), o maior xPts por jogo entre os regulares (1,59), pior passagem +0,31, nunca trocou no meio do ano; está no Criciúma, pede liberação. **2. Léo Condé** — o único que rendeu acima do elenco em três clubes diferentes, cede a menor quantidade de chances claras (1,14 por jogo), 4-2-3-1 e adapta o estilo ao elenco; +0,21 ponto por jogo acima do que o xG sustenta (parte é sorte, que não repete); livre desde 15/09. Tencati é o 3º; Guto, Carpini e Mozart ficam fora (Decisão §1). A escolha muda 2–3 peças: com Baptista, zaga e 9 fortes no alto e um volante *mais intenso*; com Condé, o elenco abaixo serve como está (TR3-6).

"""
    cab = re.sub(r"\*Dado:[^\n]*\*", "*Dado: contratos e valores de ago/26; físico e técnico até set/26 · gerado de `Os meus dez por posição` em 28/09/2026.*", cab, 1)
    md = [cab.rstrip(), "", "## 3. O elenco — 4-2-3-1, por posição", "",
          "Regra única: as vagas de cada posição são preenchidas **na ordem de `Os meus dez por posição`**, quem chega **livre** primeiro — a montagem é a passe zero. "
          "Quem tem contrato e está acima na lista aparece como *só se liberar*. No máximo 4 estrangeiros (M2-4): passado isso, entra o próximo brasileiro livre da posição. **Geral** = lugar em `Os meus dez`; (ader/nível) = as duas partes da nota; ★ = scouts. Sem Série A e sem os vetados; valor ≤ € 2 MM.", ""]
    d["br"] = d.get("nascido_em", pd.Series(index=d.index, dtype=object)).eq("Brazil") | d.get("passaporte", pd.Series(index=d.index, dtype=object)).fillna("").astype(str).str.contains("Brazil")
    # escolha: vagas na ordem, livres primeiro; depois, no máximo 4 estrangeiros (M2-4) — troca o estrangeiro
    # cuja vantagem sobre o próximo brasileiro livre da posição é menor
    esc = {p: list(d[(d.pos11 == p) & d.livre].head(VAGAS[p]).index) for p, _, _ in POS}
    trocas = []
    while sum((~d.loc[i, "br"]) for p in esc for i in esc[p]) > 4:
        cand = []
        for p in esc:
            for i in esc[p]:
                if d.loc[i, "br"]: continue
                prox = d[(d.pos11 == p) & d.livre & d.br & ~d.index.isin(esc[p])].head(1)
                if len(prox): cand.append((d.loc[i, "score"] - prox.score.iloc[0], p, i, prox.index[0]))
        if not cand: break
        _, p, i, j = min(cand); esc[p] = [j if k == i else k for k in esc[p]]; trocas.append((p, d.loc[i, "jogador"], d.loc[j, "jogador"]))
    sel = []
    for p, nome, _ in POS:
        x = d[d.pos11 == p]; liv = d.loc[esc[p]].sort_values("score", ascending=False); alt = x[x.livre & ~x.index.isin(esc[p])].head(2); pres = x[~x.livre].head(1)
        sel.append(liv)
        md += [f"### {nome} — {PEDE[p]}", "", "| # | Geral | Jogador | Situação | Pontos | Por quê |", "|---|---|---|---|---|---|"]
        for i, r in enumerate(liv.itertuples(), 1):
            md.append(f"| {i} | {r.ordem_geral}º | **{r.jogador}** | {sit(r)} | **{f(r.score)}** | {porque(r)} |")
        for r in pres.itertuples():
            if r.ordem_geral < liv.ordem_geral.max():
                md.append(f"| — | {r.ordem_geral}º | **{r.jogador}** *(só se liberar)* | {sit(r)} | **{f(r.score)}** | {porque(r)} |")
        if len(alt): md.append("\nAlternativas livres, na ordem: " + ", ".join(f"**{r.jogador}** ({r.clube}, {r.ordem_geral}º, {f(r.score)})" for r in alt.itertuples()))
        md.append("")
    S = pd.concat(sel); n = len(S); estr = S[~S.br]
    bp = S[S.bp >= 85]; semf = S[S.psv.isna() & (S.pos11 != "GOL")]
    md += ["## 4. Conta de fechamento", "",
           f"**{5 + n} nomes**: 5 mantidos de 2026 + {n} contratações a passe zero acima ({sum(VAGAS.values())} vagas: {', '.join(f'{v} {k}' for k, v in VAGAS.items())}). "
           f"Estrangeiros: {len(estr)} ({', '.join(estr.jogador)}) — a B usa 2,2 estrangeiros em média e quem sobe dá 10% dos minutos a eles (M2-4): contrato de um ano com opção, e não mais que 4 no mesmo elenco — por isso " + (", ".join(f"{a} deu lugar a {b} ({p})" for p, a, b in trocas) if trocas else "não houve troca") + ".", "",
           f"Bola parada montada (índice ≥ 85, T2): {', '.join(f'{r.jogador} ({f(r.bp)})' for r in bp.itertuples()) or 'nenhum especialista entre os selecionados — ver `Especialistas de bola parada`'}. É o que separa +5 de −5 no saldo (7 pontos, T2-1).", "",
           "Salário não está na base: a conta da folha se faz com o mercado, não com o estudo.", "",
           "## 5. O que o dado não mostra e precisa de vídeo antes de fechar", "",
           f"Goleiro inteiro (T1-5); sem rastreio físico, piso de velocidade não verificado: {', '.join(semf.jogador) or 'ninguém'}; adaptação dos que vêm de fora ({', '.join(estr.jogador)}); liderança e mentalidade dos mais velhos; contrato e situação de cada um (o dado é de ago/26). E o salário real — o estudo não tem folha.", ""]
    open(os.path.join(L, "ELENCO_2027.md"), "w", encoding="utf-8").write("\n".join(md))
    # Apresentação 06 — a mesma escolha, em uma tabela
    A6 = os.path.join(RAIZ, "apresentacao", "06_A_MONTAGEM.md"); o6 = open(A6, encoding="utf-8").read()
    c6 = o6[:o6.index("## 3 ·")]
    c6 = re.sub(r"\*Reescrita[^\n]*\*", "*Gerada de `Quem eu contrataria` (28/09), que sai de `Os meus dez por posição`: uma regra, um nome. Salários não estão na base.*", c6, 1)
    t = [c6.rstrip(), "", "## 3 · O elenco (4-2-3-1): as vagas, na ordem de `Os meus dez`, livres primeiro", "",
         "| Pos | Contratações (Geral em `Os meus dez`) | Só se liberar | Alternativas livres |", "|---|---|---|---|"]
    for p, nome, _ in POS:
        x = d[d.pos11 == p]; liv = d.loc[esc[p]].sort_values("score", ascending=False); alt = x[x.livre & ~x.index.isin(esc[p])].head(2); pres = x[~x.livre].head(1)
        pres = pres[pres.ordem_geral < liv.ordem_geral.max()]
        t.append(f"| {p} | " + " · ".join(f"**{r.jogador}** ({r.clube}, {r.ordem_geral}º, {f(r.score)})" for r in liv.itertuples()) + " | " +
                 (" · ".join(f"{r.jogador} ({r.clube}, {r.ordem_geral}º, contrato {dt(r.contrato)})" for r in pres.itertuples()) or "—") + " | " +
                 (" · ".join(f"{r.jogador} ({r.clube}, {r.ordem_geral}º)" for r in alt.itertuples()) or "—") + " |")
    t += ["", f"Bola parada montada (índice ≥ 85): {', '.join(f'{r.jogador} ({f(r.bp)})' for r in bp.itertuples()) or 'nenhum entre os selecionados — ver `Especialistas de bola parada`'}.", "",
          "## 4 · Conta", "",
          f"- **Contratações**: {n} a passe zero ({sum(VAGAS.values())} vagas: {', '.join(f'{v} {k}' for k, v in VAGAS.items())}); com 5 mantidos, **{5 + n}**.",
          f"- **Estrangeiros**: {len(estr)} ({', '.join(estr.jogador)}) — teto de 4 (a B usa 2,2; quem sobe dá 10% dos minutos a eles, M2-4)" + (": " + ", ".join(f"{a} → {b}" for p, a, b in trocas) if trocas else "") + ".",
          "- **Folha**: não está na base; a conta se faz com o mercado. Regra do estudo: elenco de 28–30, cada vaga além disso é folha que não rende ponto (M1-1).", "",
          "## 5 · O que ainda é decisão humana", "",
          f"Goleiro (vídeo, T1-5); os *só se liberar* (negociação); os que vêm de fora ({', '.join(estr.jogador)}: adaptação, vídeo); sem rastreio físico ({', '.join(semf.jogador) or 'ninguém'}); os cinco a manter; contrato e situação de cada nome (dado de ago/26).", ""]
    open(A6, "w", encoding="utf-8").write("\n".join(t))
    print(S[["pos11", "ordem_geral", "jogador", "clube", "mercado_l", "score"]].to_string(index=False))

if __name__ == "__main__":
    main()
