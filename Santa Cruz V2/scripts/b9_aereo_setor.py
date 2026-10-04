"""T3-4 — Duelo aéreo por setor: ganhar no alto rende em qualquer lugar do campo ou só em alguns setores?

O T3-1 mediu o duelo aéreo dos titulares de zaga + volante juntos (r 0,32). Aqui o mesmo indicador é
separado por setor (Zaga, Lateral, Volante, Meia, Extremo, Atacante), em três recortes, porque a
resposta muda conforme quem entra na conta:

  A. todos os minutos do setor, ponderado pelo número de duelos (80 clube-temporadas);
  B. titulares do setor (>= 60% dos minutos do clube e >= 900 min) — o recorte do T1-4 e do T3-1;
  C. os mais usados do setor com >= 900 min (2 na zaga, nas laterais e nas pontas; 1 nos demais).

Alvos: rendimento acima do dinheiro, pontos por jogo e gols sofridos por jogo. Correlação com o posto
do indicador dentro da temporada; intervalo por bootstrap de clube (1.000 reamostras).
O Wyscout não diz ONDE no campo o duelo aconteceu: "setor" é a posição do jogador. O aéreo do zagueiro
inclui a bola parada ofensiva.

Escreve resultados/b9/aereo_setor_testes.csv, aereo_setor_faixas.csv, aereo_setor_por_ano.csv e
aereo_setor_ficha.csv (o que mudaria na ordem das listas se o peso do aéreo na ficha mudasse).
"""
import os, copy
import numpy as np, pandas as pd
from _comum import *

OUT = os.path.join(RES, "b9"); os.makedirs(OUT, exist_ok=True)
A, P = "Duelos aéreos/90", "Duelos aéreos ganhos, %"
SETORES = ["Zaga", "Lateral", "Volante", "Meia", "Extremo", "Atacante"]
ALVOS = [("rendimento", "rendimento acima do dinheiro"), ("ppj", "pontos por jogo"), ("gcj", "gols sofridos por jogo")]


def boot(x, y, clubes, n=1000, seed=1):
    rng = np.random.default_rng(seed); uc = np.unique(clubes); ix = {c: np.where(clubes == c)[0] for c in uc}; r = []
    for _ in range(n):
        idx = np.concatenate([ix[c] for c in rng.choice(uc, len(uc))])
        if np.std(x[idx]) == 0 or np.std(y[idx]) == 0: continue
        r.append(np.corrcoef(x[idx], y[idx])[0, 1])
    return np.percentile(r, [2.5, 97.5])


def base():
    t = tecnico(); ct = clube_temporada(); ct["gcj"] = ct.gc / ct.jogos
    for c in [A, P, "minutos", "fatia"]: t[c] = pd.to_numeric(t[c], errors="coerce")
    t = t.merge(ct[["ano", "clube", "rendimento", "ppj", "gcj", "faixa"]], on=["ano", "clube"])
    t = t[t.setor.isin(SETORES) & (t.minutos > 0) & (t.ano <= 2025)].copy()
    t["disputados"] = t[A] * t.minutos / 90; t["ganhos"] = t.disputados * t[P].fillna(0) / 100
    return t


def recortes(a, setor):
    """Devolve {recorte: tabela clube-temporada com a coluna 'x'} para um setor."""
    chv = dict(rendimento=("rendimento", "first"), ppj=("ppj", "first"), gcj=("gcj", "first"), faixa=("faixa", "first"))
    g = a.groupby(["ano", "clube"]).agg(d=("disputados", "sum"), w=("ganhos", "sum"), mt=("min_time", "first"), **chv).reset_index()
    g["pct"] = 100 * g.w / g.d; g["ganhos_jogo"] = g.w / (g.mt / 90)
    tit = a[(a.fatia >= 0.6) & (a.minutos >= 900)]
    b = tit.groupby(["ano", "clube"]).agg(x=(P, "mean"), **chv).reset_index()
    k = 2 if setor in ("Zaga", "Lateral", "Extremo") else 1
    c = a[a.minutos >= 900].sort_values("minutos", ascending=False).groupby(["ano", "clube"]).head(k)
    c = c.groupby(["ano", "clube"]).agg(x=(P, "mean"), **chv).reset_index()
    return {"A todos os minutos · % ganho": g.assign(x=g.pct), "A todos os minutos · ganhos por jogo": g.assign(x=g.ganhos_jogo),
            "B titulares · % ganho": b, "C mais usados · % ganho": c}, g, tit


def main():
    t = base(); testes, faixas, anos = [], [], []
    for s in SETORES:
        a = t[t.setor == s]; rec, g, tit = recortes(a, s)
        for nome, d in rec.items():
            for alvo, rot in ALVOS:
                e = d.dropna(subset=["x", alvo]); x = e.groupby("ano")["x"].rank(pct=True).values; y = e[alvo].values
                r = np.corrcoef(x, y)[0, 1]; ic = boot(x, y, e.clube.values)
                testes.append(dict(setor=s, recorte=nome, alvo=rot, n=len(e), r=round(r, 2), ic_baixo=round(ic[0], 2), ic_alto=round(ic[1], 2),
                                   fora_do_zero=bool(ic[0] > 0 or ic[1] < 0)))
        # descrição por faixa (nunca como teste): % ganho e aéreos ganhos por jogo, todos os minutos; % dos titulares
        for fx, h in g.groupby("faixa", observed=True):
            tt = tit[tit.faixa == fx]
            faixas.append(dict(setor=s, faixa=fx, clubes=len(h), pct_todos=round(h.pct.mean(), 1), ganhos_por_jogo=round(h.ganhos_jogo.mean(), 1),
                               titulares=len(tt), pct_titulares=round(tt[P].mean(), 1) if len(tt) else np.nan,
                               aereos_90_titulares=round(tt[A].mean(), 1) if len(tt) else np.nan))
        # o sinal repete de um ano para o outro? titulares × rendimento, por temporada
        for ano, h in tit.dropna(subset=[P]).groupby("ano"):
            if len(h) >= 6: anos.append(dict(setor=s, ano=int(ano), n=len(h), r=round(np.corrcoef(h[P].rank(), h.rendimento)[0, 1], 2)))
    T = pd.DataFrame(testes); T.to_csv(os.path.join(OUT, "aereo_setor_testes.csv"), index=False)
    F = pd.DataFrame(faixas); F.to_csv(os.path.join(OUT, "aereo_setor_faixas.csv"), index=False)
    Y = pd.DataFrame(anos); Y.to_csv(os.path.join(OUT, "aereo_setor_por_ano.csv"), index=False)
    pd.set_option("display.width", 220)
    T["txt"] = T.r.map("{:+.2f}".format) + " [" + T.ic_baixo.map("{:+.2f}".format) + "; " + T.ic_alto.map("{:+.2f}".format) + "]"
    print(T.pivot_table(index=["recorte", "setor"], columns="alvo", values="txt", aggfunc="first").join(
        T.groupby(["recorte", "setor"]).n.first()).to_string())
    print(F.to_string(index=False)); print(Y.pivot(index="setor", columns="ano", values="r").to_string())
    ficha()


def ficha():
    """Quanto a ordem das listas da Série B mudaria com o peso do aéreo revisto: VOL 3 -> 2, LD e LE 1 -> 0."""
    import listas as L
    atual = copy.deepcopy(L.FICHA)
    nova = copy.deepcopy(atual)
    nova["VOL"] = [(k, 2 if k == "Aerial duels won, %" else w) for k, w in atual["VOL"]]
    for p in ("LD", "LE"): nova[p] = [x for x in atual[p] if x[0] != "Aerial duels won, %"]
    def rodar(f):
        L.FICHA = f; d = L.serie_b(); return d[d.pos11.isin(["VOL", "LD", "LE"])][["pos11", "jogador", "clube", "aderencia"]]
    m = rodar(atual).merge(rodar(nova), on=["pos11", "jogador", "clube"], suffixes=("_atual", "_revista")); L.FICHA = atual
    m["posto_atual"] = m.groupby("pos11").aderencia_atual.rank(ascending=False); m["posto_revisto"] = m.groupby("pos11").aderencia_revista.rank(ascending=False)
    m.sort_values(["pos11", "posto_atual"]).to_csv(os.path.join(OUT, "aereo_setor_ficha.csv"), index=False)
    for p, g in m.groupby("pos11"):
        iguais = len(set(g.nsmallest(10, "posto_atual").jogador) & set(g.nsmallest(10, "posto_revisto").jogador))
        print(f"ficha {p}: n {len(g)} · correlação dos postos {g.posto_atual.corr(g.posto_revisto):.3f} · "
              f"maior mudança de aderência {(g.aderencia_revista - g.aderencia_atual).abs().max():.1f} · dez primeiros iguais {iguais}")


if __name__ == "__main__":
    main()
