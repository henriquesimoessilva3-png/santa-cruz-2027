#!/usr/bin/env python3
"""Gera dados/prototipo.json — a aba Protótipo, etapa por etapa, só com número medido.

## Por que este script existe, e por que ele é UM só

O dono não pediu a conclusão, pediu a CONSTRUÇÃO. Então o JSON não é um relatório: é a
obra em quinze andares, cada andar com o que a tela precisa para se desenhar sozinha. A
regra que organiza tudo é uma só e vale mais que qualquer outra:

    **Nenhuma frase escrita à mão entra aqui.** Cada afirmação carrega o seu `n`, o seu
    `p` e o seu `rho`. A tela monta o texto a partir dos números; se o número mudar, o
    texto muda junto. Um adjetivo gravado no JSON envelhece em silêncio — um `p=0,0056`
    não.

E a segunda, que é consequência da primeira: **onde o dado não existe, grava-se a ausência
com o motivo**. `null` com `motivo` sempre; imputação nunca. Um zero no lugar de um buraco
é uma mentira que a tela não tem como detectar.

## As quatro decisões de método que mudam o resultado (e por que são estas)

**1. Sempre POSTO dentro da temporada.** Uma Série B com 1,01 gol por jogo e outra com
1,11 não são o mesmo campeonato; comparar valor bruto entre anos mistura o clube com a
inflação do ano. Todo teste roda no percentil dentro do próprio ano. O valor bruto vai à
tela ao lado — é o que o dono lê —, mas não é o que o teste vê.

**2. Nenhuma linha existe só no bruto.** Toda comparação sai em duas versões: bruta e
líquida do dinheiro (resíduo do posto de `tm_valor_total`, por `np.linalg.lstsq`, porque
não há `statsmodels` aqui). A coluna líquida É a análise; a bruta é o contexto. Mais da
metade dos indicadores que "separam quem sobe" morre nessa passagem, e essa morte é o
achado mais caro do estudo.

**3. A unidade de teste é o INDICADOR CRU, nunca o eixo composto.** Foi compondo eixo
antes de testar que um dos planos perdeu o achado real: `share_11` e `conc_hhi` separam
sobe de meio, mas diluídos com `atletas_usados` e `nucleo_300` dentro de um eixo
"estabilidade" não separam nada. Eixo serve para desenhar régua na tela; quando os itens
discordam, publica-se o item.

**4. Persistência decide o que vira recomendação.** Um traço com ρ≈0,05 de um ano para o
outro não é plano de clube, é o que sobrou de uma temporada em que deu certo. Por isso o
selo de porta (A/B/C/D) exige `rho_persist >= 0,30` para que um indicador possa entrar em
score de contratação — e é por isso que `ppda`, `share_11` e `conc_hhi` ficam de fora do
score apesar do `d` alto.

## As três armadilhas do dado que fazem qualquer implementação devolver lixo em silêncio

- `serieb_jogos.csv` tem 9.318 linhas e só 3.570 são Série B (entram Série A, Paulista,
  Copa do Brasil...). **Sem `Competição == 'Brazil. Serie B'` a mediana de jogos por
  clube-temporada deixa de ser 38** e todo split por turno vira ruído. Há um `assert`.
- `Sistema` vem como `'4-2-3-1 (70.73%)'`. Sem o regex, `nunique()` devolve 1.482
  "sistemas" e qualquer contagem de troca de desenho é lixo. São 18 sistemas reais.
- Em `serieb_tecnico.csv` o clube é `'Equipa dentro de um período de tempo seleccionado'`
  (42 valores). A coluna `Equipa` tem 530 valores e está errada.

E a quarta, que é de 2026 e não de coluna: **2026 tem 27 de 38 rodadas e não entra em
média nenhuma.** Ela aparece na tela como temporada em curso, com o contador de rodadas
ao lado. Há um `assert` de que nenhuma função de média viu `ano > 2025`.

Uso:
    python3 gerar_prototipo.py            # escreve dados/prototipo.json
    python3 gerar_prototipo.py --rapido   # menos réplicas, para iterar no código
"""
import datetime as dt
import itertools
import json
import os
import re
import sys
import unicodedata

import numpy as np
import pandas as pd
from scipy import stats
from scipy.optimize import linear_sum_assignment
from sklearn.cluster import KMeans
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import silhouette_score

import analisar_serieb as A          # media_pond, chave_nome — piso de 60% já resolvido
import gerar_raio_serieb as G        # POSICOES, chave_nome, carregar, DE_PARA

RAIZ = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(RAIZ, "dados", "prototipo.json")
SEMENTE = 7
rng = np.random.default_rng(SEMENTE)   # tudo que sorteia passa por aqui, e só por aqui

RAPIDO = "--rapido" in sys.argv
N_BOOT = 200 if RAPIDO else 2000       # bootstrap por clube (seção 6.6)
N_GARIMPO = 50 if RAPIDO else 5000     # nulo do garimpo (seção 6.3)
N_NULO = 100 if RAPIDO else 500        # silhueta contra nulo (seção 7.1)
N_JACCARD = 60 if RAPIDO else 300      # Jaccard de bootstrap (seção 7.3)
N_ELENCO = 40 if RAPIDO else 200       # reamostragem de elencos (seção 9)

FAIXAS = ("sobe", "meio", "cai")
SETORES = ("zaga", "lateral", "meio", "ataque")
COMP_SERIE_B = "Brazil. Serie B"
COL_CLUBE_TEC = "Equipa dentro de um período de tempo seleccionado"


# ══════════════════════════════════════════════════════════════════════════════
#  Ferramentas
# ══════════════════════════════════════════════════════════════════════════════

def r(x, casas=4):
    """Arredonda para o JSON e troca NaN/inf por None — `null` é ausência, e o JSON sabe."""
    if x is None:
        return None
    try:
        v = float(x)
    except (TypeError, ValueError):
        return None
    return None if not np.isfinite(v) else round(v, casas)


def r_sig(x, sig=3):
    """Arredonda por ALGARISMO SIGNIFICATIVO, não por casa decimal.

    `r(5,17e-08, 4)` devolve `0.0`, e zero literal é a única coisa que um p nunca é: a tela
    passa a exibir um número que não existe e o leitor não tem como descobrir. Com
    significativo o p pequeno sobrevive em notação científica e o rótulo "< 0,0001" vai ao
    lado para quem lê, não para quem confere.
    """
    if x is None:
        return None
    try:
        v = float(x)
    except (TypeError, ValueError):
        return None
    if not np.isfinite(v):
        return None
    return 0.0 if v == 0 else float(f"{v:.{max(sig - 1, 0)}e}")


def rotulo_p(p, piso=1e-4):
    """O p como o leitor lê: o número, ou '< 0,0001' quando ele some no arredondamento."""
    if p is None or not np.isfinite(float(p)):
        return None
    p = float(p)
    return f"< {piso:.4f}".replace(".", ",") if p < piso else f"{p:.4f}".replace(".", ",")


def num_br(x, casas=3):
    """Número com vírgula decimal, para entrar em frase que vai à tela em português.

    Quem escreve o motivo do selo é o número medido, não o autor: por isso o motivo é
    montado com esta função e nunca digitado.
    """
    if x is None:
        return "—"
    try:
        v = float(x)
    except (TypeError, ValueError):
        return "—"
    return "—" if not np.isfinite(v) else f"{v:.{casas}f}".replace(".", ",")


def posto_ano(df, col, ano="ano"):
    """Percentil de 0 a 100 dentro da própria temporada. Ver decisão 1 do cabeçalho."""
    return df.groupby(ano)[col].rank(pct=True) * 100


def d_cohen(a, b):
    a, b = np.asarray(a, float), np.asarray(b, float)
    a, b = a[np.isfinite(a)], b[np.isfinite(b)]
    if len(a) < 2 or len(b) < 2:
        return np.nan
    s = np.sqrt(((len(a) - 1) * a.var(ddof=1) + (len(b) - 1) * b.var(ddof=1))
                / (len(a) + len(b) - 2))
    return np.nan if not s else (a.mean() - b.mean()) / s


def welch_p(a, b):
    a, b = np.asarray(a, float), np.asarray(b, float)
    a, b = a[np.isfinite(a)], b[np.isfinite(b)]
    if len(a) < 2 or len(b) < 2:
        return np.nan
    return float(stats.ttest_ind(a, b, equal_var=False).pvalue)


def bh(ps):
    """Benjamini-Hochberg: devolve o q de cada p, na ordem de entrada.

    BH dentro de cada família (um pilar × uma comparação), nunca no bolo e nunca por
    indicador isolado. No bolo, o q vira função de quantos indicadores de OUTRO pilar
    entraram na varredura; por indicador isolado, não há correção nenhuma.
    """
    p = np.asarray(ps, float)
    ok = np.isfinite(p)
    q = np.full(len(p), np.nan)
    if not ok.sum():
        return q
    idx = np.where(ok)[0][np.argsort(p[ok])]
    m = ok.sum()
    anterior = 1.0
    for pos in range(m - 1, -1, -1):
        i = idx[pos]
        anterior = min(anterior, p[i] * m / (pos + 1))
        q[i] = anterior
    return q


def residualiza(y, x):
    """Resíduo de y regredido em x por mínimos quadrados. Sem `statsmodels` no ambiente."""
    y, x = np.asarray(y, float), np.asarray(x, float)
    ok = np.isfinite(y) & np.isfinite(x)
    out = np.full(len(y), np.nan)
    if ok.sum() < 3:
        return out
    X = np.column_stack([np.ones(ok.sum()), x[ok]])
    beta, *_ = np.linalg.lstsq(X, y[ok], rcond=None)
    out[ok] = y[ok] - X @ beta
    return out


def residualiza_multi(y, xs):
    """Resíduo de y regredido em VÁRIOS x ao mesmo tempo, mesma mecânica de `residualiza`.

    Existe separada e não como generalização da outra para que a coluna líquida de
    dinheiro — que já foi conferida linha a linha — continue saindo do mesmo código de
    sempre. Quem precisa de dois controles pede dois; quem precisa de um não muda de rota.
    """
    y = np.asarray(y, float)
    M = np.column_stack([np.asarray(v, float) for v in xs])
    ok = np.isfinite(y) & np.isfinite(M).all(axis=1)
    out = np.full(len(y), np.nan)
    if ok.sum() < M.shape[1] + 3:
        return out
    X = np.column_stack([np.ones(int(ok.sum())), M[ok]])
    beta, *_ = np.linalg.lstsq(X, y[ok], rcond=None)
    out[ok] = y[ok] - X @ beta
    return out


def parcial_spearman(x, y, z):
    """ρ de x com y descontado z, tudo em posto. Devolve (ρ, p) com gl = n-3."""
    x, y, z = map(lambda v: np.asarray(v, float), (x, y, z))
    ok = np.isfinite(x) & np.isfinite(y) & np.isfinite(z)
    n = int(ok.sum())
    if n < 6:
        return np.nan, np.nan
    x, y, z = x[ok], y[ok], z[ok]
    rxy = stats.spearmanr(x, y).statistic
    rxz = stats.spearmanr(x, z).statistic
    ryz = stats.spearmanr(y, z).statistic
    den = np.sqrt((1 - rxz ** 2) * (1 - ryz ** 2))
    if not np.isfinite(den) or den == 0:
        return np.nan, np.nan
    rho = (rxy - rxz * ryz) / den
    if abs(rho) >= 1:
        return float(rho), 0.0
    t = rho * np.sqrt((n - 3) / (1 - rho ** 2))
    return float(rho), float(2 * stats.t.sf(abs(t), n - 3))


def auc(pos, neg):
    """AUC = P(um sorteado do grupo positivo > um do negativo). Mann-Whitney normalizado."""
    pos, neg = np.asarray(pos, float), np.asarray(neg, float)
    pos, neg = pos[np.isfinite(pos)], neg[np.isfinite(neg)]
    if not len(pos) or not len(neg):
        return np.nan
    return float(stats.mannwhitneyu(pos, neg).statistic / (len(pos) * len(neg)))


def d_minimo_detectavel(n1, n2, alfa=0.05, poder=0.80):
    """Menor `d` que este desenho enxerga — para que "não separa" não vire "não existe".

    Busca numérica no t não-central: com 16×16 o piso é alto, e a tela precisa dizer isso
    em número, não em ressalva.

    O `if not np.isfinite` não é paranoia: `scipy.stats.nct.sf` devolve NaN quando a
    não-centralidade fica grande (16×64 com d=2,5 já basta), e sem o guarda a bissecção
    interpreta o NaN como "poder insuficiente" e sobe até o teto do intervalo — devolvendo
    d=4,28 onde o certo é 0,79. Erro silencioso e plausível, que é o pior tipo.
    """
    gl = n1 + n2 - 2
    crit = stats.t.ppf(1 - alfa / 2, gl)
    lo, hi = 0.0, 3.0
    for _ in range(60):
        meio = (lo + hi) / 2
        nc = meio * np.sqrt(n1 * n2 / (n1 + n2))
        pot = stats.nct.sf(crit, gl, nc) + stats.nct.cdf(-crit, gl, nc)
        if not np.isfinite(pot):
            pot = 1.0 if nc > crit else 0.0
        lo, hi = (lo, meio) if pot >= poder else (meio, hi)
    return (lo + hi) / 2


def sistema_limpo(s):
    """'4-2-3-1 (70.73%)' -> ('4-2-3-1', 70.73). Sem isso, nunique() devolve 1.482."""
    if not isinstance(s, str):
        return None, None
    m = re.match(r"^([\d-]+)", s.strip())
    pct = re.search(r"\(([\d.]+)%\)", s)
    return (m.group(1) if m else None), (float(pct.group(1)) if pct else None)


def slug(s):
    s = unicodedata.normalize("NFD", str(s)).lower()
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"_+", "_", re.sub(r"[^a-z0-9]+", "_", s)).strip("_")


# ══════════════════════════════════════════════════════════════════════════════
#  Bases
# ══════════════════════════════════════════════════════════════════════════════

def carregar_declaracao():
    p = os.path.join(RAIZ, "dados", "prototipo_indicadores.json")
    if not os.path.exists(p):
        raise SystemExit("dados/prototipo_indicadores.json não existe. Ele é PRÉ-declarado: "
                         "sem ele, todo p exibido é decorativo (especificação 6.3).")
    return json.load(open(p, encoding="utf-8"))


def carregar_painel():
    """As 100 clube-temporada; devolve (todas, só as 4 completas).

    O corte de 2025 não é detalhe de higiene: 2026 tem os `fis_*` preenchidos e entra sem
    pedir licença se o filtro não estiver em cada função. Por isso ele é feito UMA vez,
    aqui, e o resto do script só vê `d80`.
    """
    d = pd.read_csv(os.path.join(RAIZ, "dados", "serieb_clube_temporada.csv"))
    d100 = d.copy()
    d80 = d[d.ano <= 2025].copy().reset_index(drop=True)
    assert len(d80) == 80 and (d80.J == 38).all(), (len(d80), d80.J.min())
    assert d80.ano.max() <= 2025, "2026 entrou numa média — é o erro nº 3 da especificação"
    return d100, d80


def carregar_jogos():
    """Jogo a jogo da Série B, com índice de rodada por (ano, clube).

    O filtro de competição é o que separa este arquivo de ser útil e ser ruído: sem ele
    entram 1.348 jogos de Série A, 550 de Paulista e 548 de Copa do Brasil, e a mediana
    de jogos por clube-temporada deixa de ser 38.
    """
    j = pd.read_csv(os.path.join(RAIZ, "dados", "serieb_jogos.csv"), low_memory=False)
    j = j[(j["Competição"] == COMP_SERIE_B) & (j.ano <= 2025)].copy()
    j["pts"] = j.resultado.map({"V": 3, "E": 1, "D": 0})
    j = j.sort_values(["ano", "Equipa", "Data"]).reset_index(drop=True)
    j["rod"] = j.groupby(["ano", "Equipa"]).cumcount()
    tam = j.groupby(["ano", "Equipa"]).size()
    assert tam.median() == 38, ("filtro de competição não foi aplicado", tam.median())
    assert len(tam) == 80, len(tam)
    return j


def carregar_tecnico():
    """Jogador-temporada da Série B, com o clube da coluna CERTA e o setor do mapa POSICOES.

    `Equipa` tem 530 valores distintos (traz o clube atual do atleta, não o do ano) e está
    errada; a coluna certa tem 42. Confundir as duas atribui o atleta ao clube errado em
    boa parte das linhas — e o erro é silencioso, porque os dois nomes são de clube.
    """
    t = pd.read_csv(os.path.join(RAIZ, "dados", "serieb_tecnico.csv"), low_memory=False)
    assert t[COL_CLUBE_TEC].nunique() <= 50 < t["Equipa"].nunique()
    t = t.copy()
    t["clube"] = t[COL_CLUBE_TEC]
    t["min"] = pd.to_numeric(t["Minutos jogados:"], errors="coerce")
    cod = t.posicao_1.map(lambda p: G.POSICOES.get(p, []))
    t["setor"] = [next((s for s in SETORES if any(c in G.SETOR_FUND[s] for c in cs)), None)
                  for cs in cod]
    return t


# ══════════════════════════════════════════════════════════════════════════════
#  A matriz de indicadores: 80 clube-temporada × N indicadores pré-declarados
# ══════════════════════════════════════════════════════════════════════════════

def agrega_tecnico_individual(tec, d80, regra):
    """Técnico individual do clube-temporada, por SETOR, em três regras de agregação.

    Ponderar pelo minuto dentro do SETOR e nunca no elenco inteiro: no elenco inteiro o
    número mede quantos atacantes o time usou, não o que os atacantes fizeram.

    As três regras existem por causa do teste de sensibilidade da seção 2, que é a única
    ideia de método que só um dos cinco planos teve: se a conclusão muda conforme a regra
    de agregação, ela é da regra e não do futebol. Publicam-se as três contagens.
    """
    # 2026 sai AQUI e não no reindex: o painel das médias é de temporada completa, e deixar
    # a linha entrar e depois cair por acaso do índice é como um bug se instala.
    t = tec[(tec.ano <= 2025) & (tec["min"] >= 600) & (tec.posicao_1 != "GK")
            & tec.setor.notna()].copy()
    assert t.ano.max() <= 2025
    linhas, ns = {}, {}
    for (ano, clube, setor), g in t.groupby(["ano", "clube", "setor"]):
        ns[(ano, clube, setor)] = len(g)
        for ind in DECL["tecnico_ind"]:
            v = pd.to_numeric(g[ind], errors="coerce")
            if regra == "ponderada":
                x = A.media_pond(v, g["min"])
            elif regra == "mediana":
                x = v.median()
            else:                                     # top-5 por minutos jogados
                x = v.loc[g.nlargest(min(5, len(g)), "min").index].mean()
            linhas.setdefault((ano, clube), {})[f"ti_{setor}_{slug(ind)}"] = x
    m = pd.DataFrame.from_dict(linhas, orient="index")
    m.index = pd.MultiIndex.from_tuples(m.index, names=["ano", "clube"])
    return m.reindex(pd.MultiIndex.from_arrays([d80.ano, d80.clube])), ns


def montar_matriz(d80, tec):
    """Devolve (valores brutos, postos dentro do ano, metadados de cada indicador).

    Regra de exibição da seção 5 aplicada AQUI e não na tela: setor de clube-temporada com
    menos de 3 atletas rastreados não é um número baixo, é um buraco — vira `NaN` com o
    motivo registrado nos metadados. Sete clube-temporada perdem a zaga assim, um deles
    porque tinha UM zagueiro rastreado. Um número desses na tela mente com cara de média.
    """
    col_val, meta, vazios = {}, {}, []

    for it in DECL["tecnico_col"]:
        col_val[it["col"]] = d80[it["col"]].values
        meta[it["col"]] = dict(nome=it["nome"], coluna_csv=it["col"], pilar="tecnico_col",
                               familia="tecnico_col", sinal=it["sinal"], jogo=it["jogo"],
                               unidade_n="clube-temporada")
    for it in DECL["elenco"]:
        col_val[it["col"]] = d80[it["col"]].values
        meta[it["col"]] = dict(nome=it["nome"], coluna_csv=it["col"], pilar="tecnico_col",
                               familia="elenco", sinal=it["sinal"], jogo=None,
                               unidade_n="clube-temporada")
    for c in DECL["fisico_col_elenco"]:
        col_val[c] = d80[c].values
        meta[c] = dict(nome=c.replace("fis_", "").replace("_", " "), coluna_csv=c,
                       pilar="fisico_col", familia="fisico_col_elenco", sinal=0, jogo=None,
                       unidade_n="atleta rastreado")
    for setor, cols in DECL["fisico_col_setor"].items():
        n_at = d80[f"fis_{setor}_atletas"].values
        corta = (~np.isfinite(n_at)) | (n_at < 3)
        for c in cols:
            v = d80[c].values.astype(float).copy()
            v[corta] = np.nan
            col_val[c] = v
            meta[c] = dict(nome=c.replace(f"fis_{setor}_", "").replace("_", " "),
                           coluna_csv=c, pilar="fisico_col", familia="fisico_col_setor",
                           setor=setor, sinal=0, jogo=None, unidade_n="atleta rastreado")
        vazios.append(dict(setor=setor, clube_temporada_sem_3_atletas=int(corta.sum()),
                           minimo_de_atletas=r(np.nanmin(n_at), 1),
                           marca_baixa_confianca_3_a_4=int(((n_at >= 3) & (n_at <= 4)).sum())))

    ti, ns_ti = agrega_tecnico_individual(tec, d80, "ponderada")
    for c in ti.columns:
        col_val[c] = ti[c].values
        setor = c.split("_")[1]
        nome = c[len(f"ti_{setor}_"):]
        meta[c] = dict(nome=nome.replace("_", " "), coluna_csv=c, pilar="tecnico_ind",
                       familia="tecnico_ind", setor=setor, sinal=0, jogo=None,
                       unidade_n="atleta com 600+ min")

    idx = pd.MultiIndex.from_arrays([d80.ano, d80.clube])
    bruto = pd.DataFrame(col_val, index=idx)
    anos = d80.ano.values
    postos = pd.DataFrame(
        {c: pd.Series(bruto[c].values).groupby(anos).rank(pct=True).values * 100
         for c in bruto.columns}, index=idx)
    return bruto, postos, meta, vazios, ns_ti


# ══════════════════════════════════════════════════════════════════════════════
#  ETAPA 0 — o que está sendo medido
# ══════════════════════════════════════════════════════════════════════════════

def etapa_0(d100, d80, meta, funil):
    por_ano = []
    for ano, g in d100.groupby("ano"):
        por_ano.append(dict(ano=int(ano), n=len(g), J=int(g.J.median()),
                            completa=bool(g.J.median() == 38),
                            sobe=int((g.faixa == "sobe").sum()),
                            meio=int((g.faixa == "meio").sum()),
                            cai=int((g.faixa == "cai").sum()),
                            entra_nas_medias=bool(ano <= 2025)))
    clubes = d80.clube.value_counts()
    return dict(
        titulo_chave="etapa_0",
        linhas_no_arquivo=len(d100), linhas_completas=len(d80),
        sobe=int((d80.faixa == "sobe").sum()), meio=int((d80.faixa == "meio").sum()),
        cai=int((d80.faixa == "cai").sum()),
        por_ano=por_ano,
        rodadas_2026=int(d100[d100.ano == 2026].J.median()), rodadas_completa=38,
        clubes_distintos=int(d80.clube.nunique()),
        aparicoes_por_clube={str(k): int(v) for k, v in clubes.value_counts().sort_index().items()},
        # seção 6.7 — "não separa" significa "este desenho não conseguiria ver"
        poder=dict(
            d_minimo_16x16=r(d_minimo_detectavel(16, 16), 3),
            d_minimo_16x48=r(d_minimo_detectavel(16, 48), 3),
            d_minimo_16x64=r(d_minimo_detectavel(16, 64), 3),
            d_minimo_16x16_bonferroni=r(d_minimo_detectavel(16, 16, alfa=0.05 / 191), 3),
            testes_na_correcao_bonferroni=191, alfa=0.05, poder=0.80),
        indicadores_pre_declarados=len(meta),
        indicadores_por_familia={f: sum(1 for m in meta.values() if m["familia"] == f)
                                 for f in sorted({m["familia"] for m in meta.values()})},
        funil_candidatos=funil,
    )


# ══════════════════════════════════════════════════════════════════════════════
#  ETAPA 1 — a linha de base do dinheiro, ANTES de qualquer pilar
# ══════════════════════════════════════════════════════════════════════════════

# ---------- etapa 1, pergunta do dono: quantos dos que subiram estavam perto do topo ----------

def _pmf_hiper_convoluida(tamanhos, promovidos_por_ano, k):
    """Distribuição exata do nº de promovidos no top-k somado nos anos, sob o acaso.

    Em cada ano o top-k é uma amostra SEM reposição de `k` clubes entre `N`, dos quais `K`
    subiram: hipergeométrica. Os anos são independentes entre si, então a soma é a
    convolução das quatro. Não se usa binomial nos 80 juntos porque ela ignora que cada ano
    tem exatamente quatro vagas — e, com k perto de 20, a binomial dá probabilidade
    positiva a mais de 4 promovidos num ano, o que não pode acontecer.
    """
    pmf = np.array([1.0])
    for N, K in zip(tamanhos, promovidos_por_ano):
        kk = min(k, N)
        x = np.arange(0, min(K, kk) + 1)
        pmf = np.convolve(pmf, stats.hypergeom.pmf(x, N, K, kk))
    return pmf


def curva_top_k(d):
    """Para k = 1..20: quantos dos 16 promovidos estavam entre os k mais caros do próprio ano.

    Nasceu de um palpite do dono ("dos 16, 14 ou mais estão entre os 8 mais caros"), e o
    palpite fica gravado como PERGUNTA, com a resposta ao lado, medida — não como afirmação
    que a tela repete. A curva inteira vai junto porque o k=8 é um corte escolhido de
    cabeça; mostrar só ele convidaria a trocar de k até o número agradar.

    O posto é o do ano (1 = elenco mais caro), com empate resolvido pelo MENOR posto: o
    único empate das 80 (2023, Novorizontino e CRB) é entre dois clubes do meio e não
    mexe em nenhum promovido, mas a regra fica escrita para quando mexer.

    O aviso de amostra é MEDIDO e não redigido: grava-se quantos promovidos há em cada
    posto. Na medição de 13/09/2026 os postos 7 e 8 tinham zero e o 9 tinha dois: o salto
    entre k=8 e k=9 é de dois times em quatro anos — não é fronteira, é granulação, e a
    tela tem de poder mostrar isso lendo o dado, não uma frase escrita aqui.
    """
    d = d.copy()
    d["posto_valor"] = d.groupby("ano").tm_valor_total.rank(ascending=False, method="min")
    anos = sorted(d.ano.unique())
    tamanhos = [int((d.ano == a).sum()) for a in anos]
    k_por_ano = [int(d[(d.ano == a)].y.sum()) for a in anos]
    total = int(d.y.sum())
    sobe = d[d.y == 1]
    postos_sobe = sobe.posto_valor.astype(int).values
    n_max = max(tamanhos)

    curva = []
    anterior = 0
    for k in range(1, n_max + 1):
        acum = int((postos_sobe <= k).sum())
        no_k = int((postos_sobe == k).sum())
        dentro = d[d.posto_valor <= k]
        pmf = _pmf_hiper_convoluida(tamanhos, k_por_ano, k)
        esperado = float(np.dot(np.arange(len(pmf)), pmf))
        p_maior_igual = float(pmf[acum:].sum()) if acum < len(pmf) else 0.0
        curva.append(dict(
            k=k, promovidos_no_posto_k=no_k, promovidos_acumulados=acum,
            ganho_sobre_k_anterior=acum - anterior,
            pct_dos_promovidos=r(100 * acum / total, 1),
            esperado_por_acaso=r(esperado, 2),
            clubes_no_top_k=int(len(dentro)),
            taxa_de_subida_no_top_k_pct=r(100 * dentro.y.mean(), 1),
            p_exato_maior_igual=r_sig(min(p_maior_igual, 1.0), 3),
            p_exato_maior_igual_rotulo=rotulo_p(min(p_maior_igual, 1.0))))
        anterior = acum

    promovidos = [dict(ano=int(a), clube=c, posto_valor=int(p), valor_eur=r(v, 0))
                  for a, c, p, v in sorted(zip(sobe.ano, sobe.clube, sobe.posto_valor,
                                               sobe.tm_valor_total),
                                           key=lambda t: (t[0], t[2]))]
    por_posto = [dict(posto=k, promovidos=int((postos_sobe == k).sum()))
                 for k in range(1, n_max + 1)]

    K_PALPITE, AFIRMADO = 8, 14
    medido = next(L["promovidos_acumulados"] for L in curva if L["k"] == K_PALPITE)
    menor_k = next((L["k"] for L in curva if L["promovidos_acumulados"] >= AFIRMADO), None)
    L8, L9 = curva[K_PALPITE - 1], curva[K_PALPITE]
    postos_vazios_antes = [x["posto"] for x in por_posto
                           if x["posto"] <= K_PALPITE and x["promovidos"] == 0]
    return dict(
        n=len(d), promovidos_total=total, anos=[int(a) for a in anos],
        clubes_por_ano=tamanhos, promovidos_por_ano=k_por_ano,
        regra_do_posto="posto dentro do ano pelo tm_valor_total, 1 = mais caro, empate "
                       "pelo menor posto (rank method='min')",
        modelo_do_acaso=("hipergeométrica por ano (N clubes, K promovidos, k sorteados), "
                         "convoluída nos anos; p = P(soma >= acumulado medido)"),
        curva=curva,
        promovidos=promovidos,
        promovidos_por_posto=por_posto,
        palpite_do_dono=dict(
            pergunta=("dos %d que subiram, %d ou mais estavam entre os %d mais caros do ano?"
                      % (total, AFIRMADO, K_PALPITE)),
            k=K_PALPITE, afirmado=f">= {AFIRMADO}", medido=medido,
            confirma=bool(medido >= AFIRMADO), menor_k_com_14=menor_k,
            esperado_por_acaso_no_k=L8["esperado_por_acaso"],
            p_exato_do_medido=L8["p_exato_maior_igual"]),
        aviso_de_amostra=dict(
            promovidos_no_posto=[dict(posto=x["posto"], promovidos=x["promovidos"])
                                 for x in por_posto if K_PALPITE - 1 <= x["posto"] <= K_PALPITE + 1],
            postos_ate_k_sem_promovido=postos_vazios_antes,
            degrau_k8_para_k9=L9["promovidos_acumulados"] - L8["promovidos_acumulados"],
            anos_na_amostra=len(anos),
            leitura=("o degrau entre k=%d e k=%d é de %d time(s) em %d anos: granulação de "
                     "amostra, não fronteira de valor" % (K_PALPITE, K_PALPITE + 1,
                     L9["promovidos_acumulados"] - L8["promovidos_acumulados"], len(anos)))),
    )


# ---------- etapa 1, pergunta do dono: onde está o dinheiro do elenco ----------

SETORES_VALOR = (("goleiro", "val_goleiro"), ("defesa", "val_defesa"),
                 ("meio", "val_meio"), ("ataque", "val_ataque"))


def valor_por_setor(d):
    """O valor do elenco partido em goleiro, defesa, meio e ataque — e o que dá para dizer disso.

    `val_*` é Transfermarkt por temporada e soma EXATAMENTE `tm_valor_total` (a razão é
    gravada, para que ninguém precise acreditar): é a mesma régua da etapa 1, só que
    fatiada. Por isso cada setor sai em três leituras que não se confundem: o euro (tamanho
    do cheque), o % do elenco (onde o clube pôs o cheque, com o total fixo) e o posto no
    ano (o euro sem a inflação de um ano para outro).

    Duas armadilhas ficam escritas em número, não em ressalva:

    1. A PARTIÇÃO. "% na defesa" separa sobe de meio com p pequeno, mas são quatro
       percentuais que somam 100 — quatro testes da mesma pergunta. O BH dos quatro vai
       ao lado e é ele que diz se o achado se sustenta sozinho.
    2. DEFESA CONTRA TOTAL. O AUC da defesa sai maior que o do total, e o leitor vai
       querer ler "a defesa prevê melhor que o dinheiro todo". Mas a defesa é o maior de
       quatro setores, escolhido DEPOIS de olhar. A diferença vai com intervalo de
       bootstrap pareado (mesma reamostra para os dois AUC, temporadas de clube sorteadas
       dentro do ano, para que cada réplica continue tendo 4 promovidos em média por ano
       e o posto continue sendo o do ano). O gerador é PRÓPRIO, `[SEMENTE, 11]`: usar o
       `rng` global deslocaria o sorteio de todas as etapas que rodam depois desta e
       mudaria números que nada têm a ver com setor.
    """
    d = d.copy()
    faixa = d.faixa.values
    m_sobe, m_meio, m_cai = faixa == "sobe", faixa == "meio", faixa == "cai"
    soma = d[[c for _, c in SETORES_VALOR]].sum(axis=1)
    razao = (soma / d.tm_valor_total).values

    colunas = list(SETORES_VALOR) + [("total", "tm_valor_total")]
    postos_pct = {}
    linhas = []
    for nome, col in colunas:
        v = d[col].astype(float).values
        pp = posto_ano(d, col).values                      # 0-100, maior = mais caro
        postos_pct[nome] = pp
        pos = d.groupby("ano")[col].rank(ascending=False, method="average").values  # 1 = mais caro
        pct = 100 * v / d.tm_valor_total.values
        L = dict(setor=nome, coluna=col, n_nan=int((~np.isfinite(v)).sum()))
        for fx, m in (("sobe", m_sobe), ("meio", m_meio), ("cai", m_cai)):
            L[f"eur_mediano_{fx}"] = r(np.median(v[m]), 0)
            L[f"pct_do_elenco_mediano_{fx}"] = None if nome == "total" else r(np.median(pct[m]), 1)
            L[f"posicao_media_no_ano_{fx}"] = r(pos[m].mean(), 2)
        L["auc_sobe_x_resto"] = r(auc(pp[m_sobe], pp[~m_sobe]), 3)
        L["auc_sobe_x_meio"] = r(auc(pp[m_sobe], pp[m_meio]), 3)
        L["auc_sobe_x_cai"] = r(auc(pp[m_sobe], pp[m_cai]), 3)
        L["p_sobe_x_meio"] = r_sig(stats.mannwhitneyu(pp[m_sobe], pp[m_meio]).pvalue, 3)
        L["p_sobe_x_cai"] = r_sig(stats.mannwhitneyu(pp[m_sobe], pp[m_cai]).pvalue, 3)
        L["p_sobe_x_meio_rotulo"] = rotulo_p(stats.mannwhitneyu(pp[m_sobe], pp[m_meio]).pvalue)
        L["p_sobe_x_cai_rotulo"] = rotulo_p(stats.mannwhitneyu(pp[m_sobe], pp[m_cai]).pvalue)
        linhas.append(L)

    # A partição: % do elenco em cada setor, com o total fixo. Posto no ano do % para que
    # a comparação seja a mesma régua das outras; Mann-Whitney é invariante a isso.
    part = []
    for nome, col in SETORES_VALOR:
        d["_pct"] = d[col] / d.tm_valor_total
        pp = posto_ano(d, "_pct").values
        part.append(dict(setor=nome, posto_medio_sobe=r(pp[m_sobe].mean(), 1),
                         posto_medio_meio=r(pp[m_meio].mean(), 1),
                         posto_medio_cai=r(pp[m_cai].mean(), 1),
                         auc_sobe_x_meio=r(auc(pp[m_sobe], pp[m_meio]), 3),
                         p_bruto=stats.mannwhitneyu(pp[m_sobe], pp[m_meio]).pvalue))
    qs = bh([x["p_bruto"] for x in part])
    for x, q in zip(part, qs):
        x["q_bh"] = r_sig(q, 3)
        x["sobrevive_bh_5pct"] = bool(q < 0.05)
        x["p_bruto_rotulo"] = rotulo_p(x["p_bruto"])
        x["p_bruto"] = r_sig(x["p_bruto"], 3)
    menor = min(part, key=lambda x: x["p_bruto"])

    # Defesa contra total, pareado.
    rng_setor = np.random.default_rng([SEMENTE, 11])
    ano = d.ano.values
    idx_ano = [np.where(ano == a)[0] for a in sorted(np.unique(ano))]
    y = m_sobe
    melhor = max((L for L in linhas if L["setor"] != "total"), key=lambda L: L["auc_sobe_x_resto"])
    a_set, a_tot = postos_pct[melhor["setor"]], postos_pct["total"]
    obs = auc(a_set[y], a_set[~y]) - auc(a_tot[y], a_tot[~y])
    difs = []
    for _ in range(N_BOOT):
        amostra = np.concatenate([rng_setor.choice(ix, size=len(ix), replace=True) for ix in idx_ano])
        yy = y[amostra]
        if yy.all() or not yy.any():
            continue
        s, t = a_set[amostra], a_tot[amostra]
        difs.append(auc(s[yy], s[~yy]) - auc(t[yy], t[~yy]))
    difs = np.array(difs)
    lo, hi = np.percentile(difs, [2.5, 97.5])
    cruza = bool(lo <= 0 <= hi)

    return dict(
        n=len(d), faixas=dict(sobe=int(m_sobe.sum()), meio=int(m_meio.sum()), cai=int(m_cai.sum())),
        fonte="Transfermarkt por temporada: val_goleiro + val_defesa + val_meio + val_ataque",
        soma_dos_setores_sobre_total=dict(min=r(razao.min(), 4), max=r(razao.max(), 4),
                                          nan=int((~np.isfinite(razao)).sum())),
        regra_da_posicao="posição no ranking do ano (1 = mais caro), média por faixa; empate pela média",
        regra_do_auc="posto percentual dentro do ano; p = Mann-Whitney bilateral no mesmo posto",
        setores=linhas,
        particao=dict(
            o_que_e=("% do elenco em cada setor, com o total fixo; posto no ano do %, "
                     "Mann-Whitney sobe x meio"),
            testes=len(part), correcao="Benjamini-Hochberg nos %d setores" % len(part),
            setores=part,
            menor_p=dict(setor=menor["setor"], p_bruto=menor["p_bruto"], q_bh=menor["q_bh"],
                         sobrevive_bh_5pct=menor["sobrevive_bh_5pct"])),
        melhor_setor_contra_total=dict(
            setor=melhor["setor"], escolhido_depois_de_olhar=True, entre=len(SETORES_VALOR),
            auc_setor=melhor["auc_sobe_x_resto"],
            auc_total=next(L["auc_sobe_x_resto"] for L in linhas if L["setor"] == "total"),
            diferenca=r(obs, 3), ic95_lo=r(lo, 3), ic95_hi=r(hi, 3),
            replicas=int(len(difs)), replicas_pedidas=N_BOOT,
            reamostragem="temporadas de clube com reposição dentro do ano, pareada",
            gerador="np.random.default_rng([SEMENTE, 11]) — próprio, fora do rng global",
            ic_cruza_zero=cruza,
            pode_afirmar_que_supera_o_total=bool(lo > 0),
            leitura=(("o intervalo da diferença vai de %s a %s e cruza zero: não dá para "
                      "afirmar que o setor supera o total") if cruza else
                     ("o intervalo da diferença vai de %s a %s e não cruza zero"))
                    % (num_br(lo, 3), num_br(hi, 3))),
    )


def etapa_1(d80, d100):
    """O dinheiro no primeiro parágrafo e não no rodapé.

    Quem lê a aba tem de encontrar o baseline antes de ver qualquer eixo tático: 55% de
    subida no quartil mais caro contra 5% no mais barato, e AUC 0,828 só com o posto de
    valor. Qualquer eixo, índice ou elenco que não bata isso FORA da amostra é descrição,
    não recomendação — e o LOSO abaixo existe justamente para medir o "fora da amostra".
    """
    d = d80.copy()
    d["r_val"] = posto_ano(d, "tm_valor_total")
    d["y"] = (d.faixa == "sobe").astype(int)

    q = pd.qcut(d.r_val, 4, labels=[1, 2, 3, 4])
    quartis = []
    for lab, g in d.groupby(q, observed=True):
        quartis.append(dict(quartil=int(lab), n=len(g), subiram=int(g.y.sum()),
                            taxa_pct=r(100 * g.y.mean(), 1),
                            valor_mediano_eur=r(g.tm_valor_total.median(), 0)))

    acertos = sum(len(set(g.nlargest(4, "tm_valor_total").clube) & set(g[g.y == 1].clube))
                  for _, g in d.groupby("ano"))
    por_ano = [dict(ano=int(a),
                    acertos=len(set(g.nlargest(4, "tm_valor_total").clube) & set(g[g.y == 1].clube)),
                    top4=list(g.nlargest(4, "tm_valor_total").clube))
               for a, g in d.groupby("ano")]

    # LOSO: deixa um ANO inteiro de fora, não uma linha. Deixar linha de fora com 4 times
    # do mesmo ano dentro é vazamento — o ano é a unidade que se repete.
    pred = np.full(len(d), np.nan)
    for ano in sorted(d.ano.unique()):
        tr, te = d.ano != ano, d.ano == ano
        mod = LogisticRegression(max_iter=1000).fit(d.loc[tr, ["r_val"]], d.loc[tr, "y"])
        pred[te.values] = mod.predict_proba(d.loc[te, ["r_val"]])[:, 1]
    d["pred"] = pred

    # ---------- fora da amostra de verdade: 2026, que ainda não fechou ----------
    # O LOSO deixa um ano de fora mas continua dentro do mesmo painel de quatro anos. O
    # único teste em que nada de 2026 tocou o ajuste é este: ajusta em 2022-2025 e prevê
    # uma temporada que o modelo nunca viu. Ele NÃO entra em média nenhuma — 2026 tem 27
    # de 38 rodadas e a faixa é o G4 de hoje, não o do fim; por isso J e o rótulo de
    # provisória viajam junto com o número, e não numa nota de rodapé que a tela perde.
    d26 = d100[d100.ano == 2026].copy()
    if len(d26) < 10 or not pd.to_numeric(d26.tm_valor_total, errors="coerce").notna().any():
        fora_2026 = dict(existe=False,
                         motivo="não há linha de 2026 com valor de mercado no painel")
    else:
        d26["r_val"] = posto_ano(d26, "tm_valor_total")
        y26 = (d26.faixa == "sobe").values
        mod26 = LogisticRegression(max_iter=1000).fit(d[["r_val"]], d["y"])
        p26 = mod26.predict_proba(d26[["r_val"]])[:, 1]
        top4_26 = list(d26.nlargest(4, "tm_valor_total").clube)
        g4_26 = list(d26.clube[y26])
        fora_2026 = dict(
            existe=True, ano=2026, n=len(d26), J=int(d26.J.median()), rodadas_completa=38,
            ajustado_em="2022-2025", ajustado_n=len(d),
            faixa_provisoria=True,
            motivo_provisoria=("2026 tem 27 de 38 rodadas: 'sobe' aqui é o G4 da rodada de "
                               "hoje, não o G4 do fim da temporada"),
            entra_nas_medias=False,
            auc_sobe_x_resto=r(auc(p26[y26], p26[~y26]), 3),
            auc_sobe_x_meio=r(auc(p26[y26], p26[(d26.faixa == "meio").values]), 3),
            auc_sobe_x_cai=r(auc(p26[y26], p26[(d26.faixa == "cai").values]), 3),
            top4_de_valor=dict(acertos=len(set(top4_26) & set(g4_26)), de=int(y26.sum()),
                               esperado_por_acaso=r(y26.sum() * 4 / len(d26), 2),
                               top4=top4_26, g4_provisorio=g4_26))

    # ---------- o segundo controle, que não é dinheiro: quanta gente o clube usou ----------
    # Toda média física do catálogo é média POR ATLETA RASTREADO, e quem sobe usa menos
    # gente. Sem este número ao lado do dinheiro, um "sobrevive ao resíduo de valor" pode
    # ser só o efeito de dividir por um denominador menor. Ele entra como CONTROLE e nunca
    # como indicador: o alvo não é correr atrás de elenco curto.
    d["r_at"] = posto_ano(d, "fis_atletas")
    at = d.fis_atletas.values.astype(float)
    a_sobe, a_meio, a_cai = at[d.y.values == 1], at[(d.faixa == "meio").values], at[(d.faixa == "cai").values]
    rho_pos, p_pos = stats.spearmanr(d.fis_atletas, d.pos)
    rho_dim, p_dim = stats.spearmanr(d.r_at, d.r_val)
    controle_atletas = dict(
        coluna="fis_atletas", n=int(np.isfinite(at).sum()),
        media_sobe=r(np.nanmean(a_sobe), 2), media_meio=r(np.nanmean(a_meio), 2),
        media_cai=r(np.nanmean(a_cai), 2),
        d_SM=r(d_cohen(a_sobe, a_meio), 3), p_SM=r(welch_p(a_sobe, a_meio), 5),
        d_SC=r(d_cohen(a_sobe, a_cai), 3), p_SC=r_sig(welch_p(a_sobe, a_cai), 3),
        rho_com_posicao_final=r(rho_pos, 3), p_com_posicao_final=r_sig(p_pos, 3),
        rho_posto_atletas_x_posto_valor=r(rho_dim, 3), p_atletas_x_valor=r(p_dim, 4),
        por_setor=[dict(setor=s, coluna=f"fis_{s}_atletas",
                        media_sobe=r(np.nanmean(d[f"fis_{s}_atletas"].values[d.y.values == 1]), 2),
                        media_meio=r(np.nanmean(d[f"fis_{s}_atletas"].values[(d.faixa == "meio").values]), 2),
                        media_cai=r(np.nanmean(d[f"fis_{s}_atletas"].values[(d.faixa == "cai").values]), 2),
                        d_SM=r(d_cohen(d[f"fis_{s}_atletas"].values[d.y.values == 1],
                                       d[f"fis_{s}_atletas"].values[(d.faixa == "meio").values]), 3),
                        p_SM=r(welch_p(d[f"fis_{s}_atletas"].values[d.y.values == 1],
                                       d[f"fis_{s}_atletas"].values[(d.faixa == "meio").values]), 5))
                   for s in SETORES],
        entra_como="controle na coluna d_liq2 das 160 linhas físicas da etapa 2",
        nao_entra_como="indicador: não é característica de jogo, é tamanho de rodízio")

    cob = d80.tm_com_valor / d80.plantel
    return dict(
        titulo_chave="etapa_1", n=len(d),
        quartis=quartis,
        # As duas perguntas que o dono fez olhando esta etapa. Nenhuma das duas sorteia pelo
        # `rng` global (a curva é conta exata; o bootstrap do setor tem gerador próprio), e
        # por isso acrescentá-las não mexe em um único número das etapas seguintes.
        curva_top_k=curva_top_k(d),
        valor_por_setor=valor_por_setor(d),
        top4_de_valor=dict(acertos=int(acertos), de=int(d.y.sum()),
                           esperado_por_acaso=r(d.y.sum() * 4 / 20, 2), por_ano=por_ano),
        auc_posto_de_valor=dict(
            sobe_x_resto=r(auc(d.r_val[d.y == 1], d.r_val[d.y == 0]), 3),
            sobe_x_meio=r(auc(d.r_val[d.faixa == "sobe"], d.r_val[d.faixa == "meio"]), 3),
            sobe_x_cai=r(auc(d.r_val[d.faixa == "sobe"], d.r_val[d.faixa == "cai"]), 3),
            loso_sobe_x_resto=r(auc(d.pred[d.y == 1], d.pred[d.y == 0]), 3),
            eventos_por_parametro=r(d.y.sum() / 2, 1), regra_pratica=10),
        cobertura_do_valor=dict(
            tm_com_valor_mediana=r(d80.tm_com_valor.median(), 1),
            pct_do_plantel_min=r(100 * cob.min(), 1), pct_do_plantel_max=r(100 * cob.max(), 1),
            pct_do_plantel_mediana=r(100 * cob.median(), 1),
            rho_cobertura_x_valor=r(stats.spearmanr(cob, d.r_val).statistic, 3),
            # significativo e não casa decimal: em 4 casas este p sai 0,0 — ver `r_sig`
            p_cobertura_x_valor=r_sig(stats.spearmanr(cob, d.r_val).pvalue, 3),
            p_cobertura_x_valor_rotulo=rotulo_p(stats.spearmanr(cob, d.r_val).pvalue)),
        fora_da_amostra_2026=fora_2026,
        controle_n_atletas=controle_atletas,
        # pareamento por caliper: controle do MESMO ano dentro de ±0,20 de posto de valor.
        # Não impõe linearidade, que é o que a residualização impõe.
        caliper=[dict(caliper=c,
                      subidas_com_controle=int(sum(
                          any((g.faixa != "sobe") & (abs(g.r_val - v) <= c * 100))
                          for _, g in d.groupby("ano")
                          for v in g.r_val[g.faixa == "sobe"])),
                      de=int(d.y.sum()),
                      controles_medios=r(np.mean([
                          int(((g.faixa != "sobe") & (abs(g.r_val - v) <= c * 100)).sum())
                          for _, g in d.groupby("ano")
                          for v in g.r_val[g.faixa == "sobe"]]), 2))
                 for c in (0.10, 0.15, 0.20)],
    )


# ══════════════════════════════════════════════════════════════════════════════
#  ETAPA 4 — confiabilidade (split-half dentro da temporada)
# ══════════════════════════════════════════════════════════════════════════════

def etapa_4(jog, meta):
    """Teto de cada medida: rodadas pares contra ímpares, Spearman-Brown.

    A régua antes do achado. Um indicador que não concorda consigo mesmo dentro da própria
    temporada não pode sustentar diferença entre grupos — **o efeito nunca pode ser maior
    que a régua**. Abaixo de 0,40 a linha sai hachurada na tela, e o `xg` (0,30) é o caso
    que mais dói, porque é o indicador que todo mundo quer usar.
    """
    linhas = []
    for ind, m in meta.items():
        if not m.get("jogo"):
            continue
        col = m["jogo"]
        if col not in jog.columns:
            linhas.append(dict(indicador=ind, conf=None,
                               motivo=f"coluna de jogo '{col}' não existe em serieb_jogos.csv"))
            continue
        v = pd.to_numeric(jog[col], errors="coerce")
        t = pd.DataFrame(dict(ano=jog.ano, clube=jog.Equipa, rod=jog.rod, v=v))
        par = t[t.rod % 2 == 0].groupby(["ano", "clube"]).v.mean()
        imp = t[t.rod % 2 == 1].groupby(["ano", "clube"]).v.mean()
        w = pd.concat([par.rename("a"), imp.rename("b")], axis=1).reset_index()
        w["ra"] = posto_ano(w, "a")
        w["rb"] = posto_ano(w, "b")
        rho = stats.spearmanr(w.ra, w.rb).statistic
        sb = 2 * rho / (1 + rho) if np.isfinite(rho) and rho > -1 else np.nan
        linhas.append(dict(indicador=ind, coluna_jogo=col, n=len(w), rho_meias=r(rho, 3),
                           conf=r(sb, 3), hachura=bool(np.isfinite(sb) and sb < 0.40)))
    linhas.sort(key=lambda x: -(x.get("conf") if x.get("conf") is not None else -9))
    return dict(titulo_chave="etapa_4", corte_hachura=0.40, metodo="pares x ímpares, "
                "posto dentro do ano, Spearman corrigido por Spearman-Brown 2p/(1+p)",
                linhas=linhas,
                sem_versao_por_jogo=sum(1 for m in meta.values() if not m.get("jogo")))


# ══════════════════════════════════════════════════════════════════════════════
#  ETAPA 7 — a porta temporal: 1º turno contra 2º turno
# ══════════════════════════════════════════════════════════════════════════════

def etapa_7(jog, meta):
    """"O que eles fizeram, ou o que aconteceu com quem estava subindo?"

    Todo teste que mede a característica na MESMA temporada do desfecho confunde causa com
    consequência. Falta escalação por rodada, então `share_11` e `conc_hhi` não podem ser
    partidos por turno — mas o que é de jogo pode, porque `serieb_jogos.csv` tem `Data`.
    Generalizar a impossibilidade de dois indicadores para todos foi o erro de três planos.

    A coluna que decide é a PARCIAL: o indicador do 1º turno ainda prevê os pontos do 2º
    turno DEPOIS de descontar como o time já vinha pontuando.
    """
    p1 = jog[jog.rod < 19].groupby(["ano", "Equipa"]).pts.sum().rename("pts1")
    p2 = jog[jog.rod >= 19].groupby(["ano", "Equipa"]).pts.sum().rename("pts2")
    base = pd.concat([p1, p2], axis=1).reset_index().rename(columns={"Equipa": "clube"})
    base["r1"] = posto_ano(base, "pts1")
    base["r2"] = posto_ano(base, "pts2")

    linhas = []
    for ind, m in meta.items():
        col = m.get("jogo")
        if not col or col not in jog.columns:
            continue
        v = pd.to_numeric(jog[col], errors="coerce")
        m1 = (pd.DataFrame(dict(ano=jog.ano, clube=jog.Equipa, rod=jog.rod, v=v))
              .query("rod < 19").groupby(["ano", "clube"]).v.mean().rename("v1"))
        t = base.merge(m1, on=["ano", "clube"])
        t["rv"] = posto_ano(t, "v1")
        rho, p = stats.spearmanr(t.rv, t.r2)
        pr, pp = parcial_spearman(t.rv, t.r2, t.r1)
        linhas.append(dict(indicador=ind, n=len(t), rho_bruto=r(rho, 3), p_bruto=r(p, 4),
                           rho_parcial=r(pr, 3), p_parcial=r(pp, 4), sinal=m["sinal"],
                           sinal_certo=bool(m["sinal"] and np.isfinite(pr)
                                            and np.sign(pr) == np.sign(m["sinal"]))))
    linhas.sort(key=lambda x: -abs(x["rho_parcial"] or 0))
    ref = stats.spearmanr(base.r1, base.r2)
    return dict(titulo_chave="etapa_7", n=len(base), rodadas_1t=19, rodadas_2t=19,
                referencia_pts1t_x_pts2t=dict(rho=r(ref.statistic, 3), p=r(ref.pvalue, 5)),
                linhas=linhas,
                nao_testaveis=["share_11", "conc_hhi", "atletas_usados", "nucleo_300"],
                motivo_nao_testaveis=("minutagem.json guarda minuto por TEMPORADA e "
                                      "serieb_jogos.csv não traz escalação"))


# ══════════════════════════════════════════════════════════════════════════════
#  ETAPA 6 — isso se repete? persistência t -> t+1
# ══════════════════════════════════════════════════════════════════════════════

def pares_consecutivos(d80):
    idx = {(a, c): i for i, (a, c) in enumerate(zip(d80.ano, d80.clube))}
    return [(idx[(a, c)], idx[(a + 1, c)], c, int(a))
            for (a, c) in idx if (a + 1, c) in idx]


def etapa_6(d80, postos, meta, pares):
    """36 pares clube-ano consecutivos. ρ de Spearman do posto em t contra o posto em t+1.

    Este é o filtro que decide o que pode virar recomendação. `fis_distance_p90` em 0,722 e
    `ppda` em 0,129 na mesma escala respondem sozinhos a pergunta do dono: um é como o
    clube é, o outro é como o clube esteve.

    E o truncamento, que precisa ir junto: dos 36 pares, só 6 terminaram em subida — metade
    das 16 promoções vem de clube que não estava na Série B no ano anterior. Todo desenho
    preditivo t→t+1 tem n=6 e a tela diz n=6.
    """
    a = np.array([p[0] for p in pares])
    b = np.array([p[1] for p in pares])
    rhos, disp = {}, {}
    for ind in postos.columns:
        x, y = postos[ind].values[a], postos[ind].values[b]
        ok = np.isfinite(x) & np.isfinite(y)
        if ok.sum() < 8:
            rhos[ind] = dict(rho=None, n=int(ok.sum()),
                             motivo="menos de 8 pares com valor nos dois anos")
            continue
        rho, p = stats.spearmanr(x[ok], y[ok])
        rhos[ind] = dict(rho=r(rho, 3), p=r(p, 4), n=int(ok.sum()))
        if meta[ind]["familia"] in ("tecnico_col", "elenco", "fisico_col_elenco"):
            disp[ind] = [[r(xx, 1), r(yy, 1)] for xx, yy in zip(x, y)]

    d = d80.reset_index(drop=True)
    subiu_em_t1 = int(sum(d.faixa.values[b[i]] == "sobe" for i in range(len(a))))
    # a régua de cima: o dinheiro é a coisa mais persistente do painel. Qualquer traço
    # tático que se venda como "o modelo do clube" tem de ser lido contra este número.
    rv = posto_ano(d, "tm_valor_total").values
    ref = stats.spearmanr(rv[a], rv[b])
    return dict(titulo_chave="etapa_6", n_pares=len(pares),
                referencia_dinheiro=dict(indicador="tm_valor_total", rho=r(ref.statistic, 3),
                                         p=r(ref.pvalue, 5), n=len(pares)),
                pares=[dict(clube=c, ano_t=an, ano_t1=an + 1,
                            faixa_t=d.faixa.values[i], faixa_t1=d.faixa.values[j])
                       for i, j, c, an in pares],
                rho=rhos, dispersao=disp,
                truncamento=dict(pares=len(pares), terminaram_em_subida=subiu_em_t1,
                                 subidas_totais=int((d.faixa == "sobe").sum()),
                                 subidas_sem_ano_anterior_na_serie_b=int(
                                     (d.faixa == "sobe").sum() - subiu_em_t1)))


# ══════════════════════════════════════════════════════════════════════════════
#  ETAPAS 2 e 3 — o catálogo dos indicadores e o aviso do sorteio
# ══════════════════════════════════════════════════════════════════════════════

def etapa_2(d80, bruto, postos, meta, conf, temporal, persist, ns_ti):
    """Uma linha por indicador, bruto E líquido de valor, com o selo de porta.

    O que esta tabela faz que nenhum dos planos fez: nunca mostra o bruto sozinho. Os
    `d` bruto e líquido ficam lado a lado na mesma linha, e é aí que se vê que `posse` cai
    de +0,52 para +0,01 e `min_estrangeiros` de +0,79 para +0,45 — os dois são dinheiro
    com nome tático. Sem a coluna líquida ao lado, os dois passariam por achado.

    A comparação primária é sobe × MEIO, não sobe × cai. Sobe × cai mede "time bom contra
    time ruim" e quase tudo passa; é o meio que define o que é CARACTERÍSTICA.
    """
    faixa = d80.faixa.values
    r_val = posto_ano(d80, "tm_valor_total").values
    m_sobe, m_meio, m_cai = (faixa == "sobe"), (faixa == "meio"), (faixa == "cai")
    inds = list(postos.columns)

    liq = pd.DataFrame({c: residualiza(postos[c].values, r_val) for c in inds})

    # ---------- o segundo resíduo: dinheiro E número de atletas rastreados ----------
    # O confundidor que faltava. Toda coluna `fis_*` é média por atleta rastreado, e quem
    # sobe usa MENOS gente (ver `controle_n_atletas` na etapa 1): o denominador menor
    # levanta a média sem que ninguém tenha corrido mais. E o nº de atletas não é dinheiro
    # disfarçado — o ρ entre os dois postos é quase nulo —, então residualizar só em valor
    # deixa o confundidor inteiro em pé. `d_liq2` ACRESCENTA uma coluna, não substitui
    # `d_liq`: a passagem que interessa ao leitor é ver as duas lado a lado e descobrir
    # qual achado físico sobrevive às duas e qual sobrevive só à primeira.
    # Só linhas físicas: o técnico coletivo é do clube-temporada, não média por atleta.
    r_atletas = {"fisico_col_elenco": posto_ano(d80, "fis_atletas").values}
    for s in SETORES:
        r_atletas[f"setor_{s}"] = posto_ano(d80, f"fis_{s}_atletas").values

    def residuo_2(ind, mt):
        """Campos `*_liq2_*` da linha: resíduo de valor + nº de atletas, ou a ausência com motivo."""
        if mt["familia"] == "fisico_col_elenco":
            ctrl, nome = r_atletas["fisico_col_elenco"], "fis_atletas"
        elif mt["familia"] == "fisico_col_setor":
            ctrl, nome = r_atletas[f"setor_{mt['setor']}"], f"fis_{mt['setor']}_atletas"
        else:
            return dict(d_liq2_SM=None, p_liq2_SM=None, d_liq2_SC=None, p_liq2_SC=None,
                        liq2_controle=None,
                        liq2_motivo=("não é média por atleta rastreado: o nº de atletas não "
                                     "é denominador desta linha e não entra como controle"))
        p2 = residualiza_multi(postos[ind].values, [r_val, ctrl])
        return dict(
            d_liq2_SM=r(d_cohen(p2[m_sobe], p2[m_meio]), 3),
            p_liq2_SM=r(welch_p(p2[m_sobe], p2[m_meio]), 5),
            d_liq2_SC=r(d_cohen(p2[m_sobe], p2[m_cai]), 3),
            p_liq2_SC=r(welch_p(p2[m_sobe], p2[m_cai]), 5),
            liq2_controle=f"posto de tm_valor_total + posto de {nome}", liq2_motivo=None)

    linhas, fam_p = [], {}
    for ind in inds:
        pb, bb = postos[ind].values, bruto[ind].values
        pl = liq[ind].values
        d_sm, p_sm = d_cohen(pb[m_sobe], pb[m_meio]), welch_p(pb[m_sobe], pb[m_meio])
        d_sl, p_sl = d_cohen(pl[m_sobe], pl[m_meio]), welch_p(pl[m_sobe], pl[m_meio])
        d_sc, p_sc = d_cohen(pb[m_sobe], pb[m_cai]), welch_p(pb[m_sobe], pb[m_cai])
        d_cl, p_cl = d_cohen(pl[m_sobe], pl[m_cai]), welch_p(pl[m_sobe], pl[m_cai])
        mt = meta[ind]
        linha = dict(
            indicador=ind, nome=mt["nome"], coluna_csv=mt["coluna_csv"], pilar=mt["pilar"],
            familia=mt["familia"], setor=mt.get("setor"), sinal=mt["sinal"],
            n=int(np.isfinite(bb).sum()),
            conf=conf.get(ind), auc_SM=r(auc(pb[m_sobe], pb[m_meio]), 3),
            m_sobe=r(np.nanmean(bb[m_sobe]), 3), m_meio=r(np.nanmean(bb[m_meio]), 3),
            m_cai=r(np.nanmean(bb[m_cai]), 3),
            r_sobe=r(np.nanmean(pb[m_sobe]), 1), r_meio=r(np.nanmean(pb[m_meio]), 1),
            r_cai=r(np.nanmean(pb[m_cai]), 1),
            d_bruto_SM=r(d_sm, 3), p_bruto_SM=r(p_sm, 5),
            d_liq_SM=r(d_sl, 3), p_liq_SM=r(p_sl, 5),
            d_bruto_SC=r(d_sc, 3), p_bruto_SC=r(p_sc, 5),
            d_liq_SC=r(d_cl, 3), p_liq_SC=r(p_cl, 5),
            rho_persist=persist[ind].get("rho"), n_persist=persist[ind].get("n"),
            rho_1T_2T=temporal.get(ind, {}).get("rho_parcial"),
            p_1T_2T=temporal.get(ind, {}).get("p_parcial"),
            resultado=bool(mt["coluna_csv"] in DECL["resultado"]),
        )
        linha.update(residuo_2(ind, mt))
        linhas.append(linha)
        fam_p.setdefault(mt["familia"], []).append((len(linhas) - 1, p_sm, p_sc, p_sl))

    # BH DENTRO de cada família — nunca no bolo (ver docstring de bh())
    resumo_fam = {}
    for fam, itens in fam_p.items():
        pos = [i for i, _, _, _ in itens]
        for chave, col in (("q_SM", 1), ("q_SC", 2), ("q_liq_SM", 3)):
            qs = bh([itens[k][col] for k in range(len(itens))])
            for k, i in enumerate(pos):
                linhas[i][chave] = r(qs[k], 5)
        resumo_fam[fam] = dict(
            testes=len(itens),
            esperados_por_acaso_5pct=r(len(itens) * 0.05, 2),
            passam5_SM=int(sum(1 for k in range(len(itens))
                               if np.isfinite(itens[k][1] or np.nan) and itens[k][1] < 0.05)),
            bh5_SM=int(sum(1 for i in pos if (linhas[i]["q_SM"] or 1) < 0.05)),
            passam5_SC=int(sum(1 for k in range(len(itens))
                               if np.isfinite(itens[k][2] or np.nan) and itens[k][2] < 0.05)),
            bh5_SC=int(sum(1 for i in pos if (linhas[i]["q_SC"] or 1) < 0.05)),
            passam5_liq_SM=int(sum(1 for k in range(len(itens))
                                   if np.isfinite(itens[k][3] or np.nan) and itens[k][3] < 0.05)),
            bh5_liq_SM=int(sum(1 for i in pos if (linhas[i]["q_liq_SM"] or 1) < 0.05)))

    # ---------- o selo de porta (seção 6.5) ----------
    # A porta A é deliberadamente difícil: q<0,10 E p líquido<0,05 E ρ>=0,30 E, se for
    # indicador de jogo, sinal certo na parcial do 1º→2º turno. Só quem tem A entra no
    # score de contratação. Se a lista de A sair vazia ou quase, isso é o resultado, não
    # um bug — e é melhor uma porta A vazia do que um score feito de Porta C.
    # A porta temporal NÃO é dispensável para quem não tem versão por jogo. Escrita como
    # "ou não é de jogo, ou passou na parcial", ela era verdadeira por omissão em 265 das
    # 293 linhas: bastava um físico de setor bater o q e o p líquido para sair na tela com
    # o selo que promete prever o 2º turno sem nunca ter sido testado contra o 2º turno —
    # e `fis_zaga_distance_p90`, com p líquido 0,021, passou a um q de fazer isso. Agora
    # quem não tem ρ do 1º→2º turno não chega à porta A, e a linha diz que foi vedada.
    for L in linhas:
        if L["resultado"]:
            L["porta"] = "D"; L["porta_motivo"] = "lista branca de resultado: é o placar redescrito"
            continue
        q = L["q_SM"] if L["q_SM"] is not None else 1
        pl = L["p_liq_SM"] if L["p_liq_SM"] is not None else 1
        rp = L["rho_persist"]
        n_fam = resumo_fam[L["familia"]]["testes"]
        tem_jogo = meta[L["indicador"]].get("jogo") is not None
        tem_temporal = L["rho_1T_2T"] is not None
        ok_temporal = bool(tem_temporal and L["sinal"]
                           and np.sign(L["rho_1T_2T"]) == np.sign(L["sinal"]))
        if q < 0.10 and pl < 0.05 and rp is not None and rp >= 0.30 and ok_temporal:
            L["porta"], L["porta_motivo"] = "A", "sobrevive ao dinheiro, se repete e prevê o 2º turno"
        elif pl < 0.05:
            # Três motivos MEDIDOS e um quarto que é a ausência da medida, nesta ordem:
            # cada um carrega o número que o produziu. O motivo antigo dizia "falha na
            # porta temporal" para cinco linhas que nunca tiveram porta temporal — frase
            # escrita à mão passando por medida, que é o que a regra da casa proíbe.
            L["porta"] = "B"
            if rp is None or rp < 0.30:
                L["porta_motivo"] = ("não se repete de um ano para o outro "
                                     f"(rho={num_br(rp)} em {L['n_persist']} pares)")
            elif q >= 0.10:
                L["porta_motivo"] = ("sobrevive ao dinheiro mas não sobrevive à família "
                                     f"(q={num_br(q)} em {n_fam} testes)")
            elif tem_temporal:
                esperado = "+" if (L["sinal"] or 0) > 0 else ("−" if (L["sinal"] or 0) < 0
                                                              else "não declarado")
                L["porta_motivo"] = (f"falha na porta temporal (rho parcial 1º→2º turno "
                                     f"{num_br(L['rho_1T_2T'])} contra sinal esperado {esperado})")
            else:
                L["porta_motivo"] = ("porta A vedada: sem versão por jogo em "
                                     "serieb_jogos.csv, o indicador não foi testado contra "
                                     "o 2º turno e não pode receber o selo que promete prevê-lo")
        elif (L["p_bruto_SM"] or 1) < 0.10:
            L["porta"], L["porta_motivo"] = "C", "passa no bruto e morre no líquido: é o valor do elenco"
        else:
            L["porta"], L["porta_motivo"] = "-", "não separa sobe de meio nem no bruto"

    # ---------- teste de sensibilidade da agregação (seção 2) ----------
    return linhas, resumo_fam, liq


def bootstrap_por_clube(d80, postos, liq, inds):
    """IC de cada `d` reamostrando CLUBES, não linhas (seção 6.6).

    As 80 linhas são 40 clubes: 16 aparecem uma vez, 12 duas, 8 três, 4 quatro. Todo Welch
    e todo BH aqui assumem independência que não existe — o Cruzeiro de 2022 e o de 2023
    não são dois sorteios. Reamostrar o CLUBE, e com ele todas as suas temporadas, é a
    correção barata: o p de Welch fica na tabela e o intervalo do bootstrap fica ao lado.
    """
    faixa = d80.faixa.values
    clubes = d80.clube.values
    unicos = np.unique(clubes)
    por_clube = {c: np.where(clubes == c)[0] for c in unicos}
    Pb = postos[inds].values.astype(float)
    Pl = liq[inds].values.astype(float)
    sobe = faixa == "sobe"
    meio = faixa == "meio"

    def d_vec(M, linhas):
        s = linhas[sobe[linhas]]
        m = linhas[meio[linhas]]
        if len(s) < 2 or len(m) < 2:
            return np.full(M.shape[1], np.nan)
        with np.errstate(invalid="ignore"):
            ms, mm = np.nanmean(M[s], 0), np.nanmean(M[m], 0)
            vs, vm = np.nanvar(M[s], 0, ddof=1), np.nanvar(M[m], 0, ddof=1)
            sp = np.sqrt(((len(s) - 1) * vs + (len(m) - 1) * vm) / (len(s) + len(m) - 2))
            return np.where(sp > 0, (ms - mm) / sp, np.nan)

    bru = np.full((N_BOOT, len(inds)), np.nan)
    liqu = np.full((N_BOOT, len(inds)), np.nan)
    for it in range(N_BOOT):
        escolha = rng.choice(unicos, size=len(unicos), replace=True)
        linhas = np.concatenate([por_clube[c] for c in escolha])
        bru[it] = d_vec(Pb, linhas)
        liqu[it] = d_vec(Pl, linhas)
    with np.errstate(invalid="ignore"):
        return {ind: dict(ic_bruto=[r(np.nanpercentile(bru[:, k], 2.5), 3),
                                    r(np.nanpercentile(bru[:, k], 97.5), 3)],
                          ic_liq=[r(np.nanpercentile(liqu[:, k], 2.5), 3),
                                  r(np.nanpercentile(liqu[:, k], 97.5), 3)],
                          replicas=N_BOOT)
                for k, ind in enumerate(inds)}


def etapa_3(d80, postos, meta, linhas_cat, resumo_fam):
    """O aviso do sorteio, em número — e o nulo do GARIMPO, que precifica a busca.

    BH corrige o teste. Nenhuma correção clássica corrige a BUSCA: escolher o melhor entre
    293 indicadores é uma operação que ganha AUC sozinha, sem futebol nenhum. O nulo do
    garimpo mede exatamente quanto: permuta cada indicador dentro do ano (a base de valor e
    a estrutura de ano ficam intactas), refaz a seleção do melhor entre N, e compara o
    melhor real com a distribuição do melhor sorteado. Se o real não ganha do p95 do
    sorteado, o "melhor indicador da tabela" é um artefato de ter olhado 293 vezes.
    """
    faixa = d80.faixa.values
    anos = d80.ano.values
    sobe, meio = faixa == "sobe", faixa == "meio"
    sel = sobe | meio
    y = sobe[sel]
    # O melhor-entre-N só é comparável entre indicadores de MESMA cobertura: uma coluna de
    # setor com 30 valores atinge AUC 0,85 por sorte com uma facilidade que uma de 64 não
    # tem, e misturar as duas faz o nulo estourar sem que isso signifique nada. Por isso o
    # garimpo roda só sobre quem tem o painel quase inteiro, e diz quantos ficaram de fora.
    cobertura = np.isfinite(postos.values[sel]).mean(axis=0)
    inds = [c for k, c in enumerate(postos.columns) if cobertura[k] >= 0.90]
    fora_cobertura = len(postos.columns) - len(inds)
    # O cabeçalho anunciava 293 e o garimpo precificava 229: quem lê a tela precisa saber
    # QUEM ficou de fora e por quanto, senão os dois números viram um erro aparente. Os
    # excluídos são o preço da regra de exibição da seção 5 (setor com menos de 3 atletas
    # rastreados vira buraco), e ela morde zaga e lateral, não o resto.
    fora_por_familia = {}
    for k, c in enumerate(postos.columns):
        if cobertura[k] >= 0.90:
            continue
        rot = (f"{meta[c]['familia']}/{meta[c]['setor']}" if meta[c].get("setor")
               else meta[c]["familia"])
        fora_por_familia.setdefault(rot, []).append(cobertura[k])
    P = postos[inds].values.astype(float)

    def aucs(M):
        out = np.full(M.shape[1], np.nan)
        for k in range(M.shape[1]):
            v = M[sel, k]
            ok = np.isfinite(v)
            if ok.sum() < 20 or not (y[ok].any() and (~y[ok]).any()):
                continue
            rk = stats.rankdata(v[ok])
            n1 = int(y[ok].sum()); n0 = int((~y[ok]).sum())
            out[k] = (rk[y[ok]].sum() - n1 * (n1 + 1) / 2) / (n1 * n0)
        return out

    reais = aucs(P)
    reais_ganho = np.abs(reais - 0.5)
    blocos = [np.where(anos == a)[0] for a in np.unique(anos)]
    # Stream próprio, com a mesma semente da casa: subir as réplicas de 400 para 5.000 é
    # correção DESTA etapa, e com um gerador só ela deslocaria o sorteio de todas as
    # etapas que sorteiam depois — silhueta, Jaccard, tipologia, elencos. Mudar por acidente
    # número de bloco alheio é regressão, não conserto.
    rng_garimpo = np.random.default_rng([SEMENTE, 3])
    melhores = np.empty(N_GARIMPO)
    for it in range(N_GARIMPO):
        Q = P.copy()
        for b in blocos:        # embaralha as LINHAS do ano, as 229 colunas juntas
            Q[b] = Q[b][rng_garimpo.permutation(len(b))]
        melhores[it] = np.nanmax(np.abs(aucs(Q) - 0.5))

    k_best = int(np.nanargmax(reais_ganho))
    total = len(postos.columns)
    # IC de Monte Carlo do p: com 5.000 réplicas o p do melhor tem incerteza própria, e
    # publicá-lo em 3 casas sem dizer de quanto é essa incerteza é fingir precisão que a
    # simulação não tem. Clopper-Pearson sobre as réplicas que bateram o real.
    acertos_nulo = int((melhores >= reais_ganho[k_best]).sum())
    p_melhor = (1 + acertos_nulo) / (N_GARIMPO + 1)
    lo = 0.0 if acertos_nulo == 0 else float(stats.beta.ppf(0.025, acertos_nulo, N_GARIMPO - acertos_nulo + 1))
    hi = 1.0 if acertos_nulo == N_GARIMPO else float(stats.beta.ppf(0.975, acertos_nulo + 1, N_GARIMPO - acertos_nulo))
    return dict(
        titulo_chave="etapa_3",
        testes_por_comparacao=total,
        esperados_por_acaso_5pct=r(total * 0.05, 1),
        por_familia=resumo_fam,
        passam5_SM=sum(1 for L in linhas_cat if (L["p_bruto_SM"] or 1) < 0.05),
        bh5_SM=sum(1 for L in linhas_cat if (L["q_SM"] or 1) < 0.05),
        passam5_SC=sum(1 for L in linhas_cat if (L["p_bruto_SC"] or 1) < 0.05),
        bh5_SC=sum(1 for L in linhas_cat if (L["q_SC"] or 1) < 0.05),
        passam5_liq_SM=sum(1 for L in linhas_cat if (L["p_liq_SM"] or 1) < 0.05),
        bh5_liq_SM=sum(1 for L in linhas_cat if (L["q_liq_SM"] or 1) < 0.05),
        nulo_do_garimpo=dict(
            replicas=N_GARIMPO, indicadores=len(inds), indicadores_no_catalogo=total,
            semente=SEMENTE,
            excluidos_por_cobertura_abaixo_de_90pct=fora_cobertura,
            excluidos_por_familia=[
                dict(familia=fam, indicadores=len(v),
                     cobertura_min=r(min(v), 3), cobertura_max=r(max(v), 3),
                     motivo=("setor com menos de 3 atletas rastreados vira buraco "
                             "(regra de exibição da seção 5) e derruba a cobertura"))
                for fam, v in sorted(fora_por_familia.items())],
            metodo=("embaralha as LINHAS dentro de cada ano — o clube-temporada leva os 229 "
                    "indicadores juntos, então a correlação ENTRE indicadores fica intacta e "
                    "só o vínculo com a faixa é quebrado; a seleção do melhor entre N é "
                    "refeita em cada réplica. É o nulo certo para precificar busca em colunas "
                    "correlacionadas: embaralhar cada coluna por si inventaria independência "
                    "que o painel não tem e devolveria um p otimista"),
            ganho_auc_real_melhor=r(reais_ganho[k_best], 4),
            indicador_real_melhor=inds[k_best],
            ganho_auc_nulo_media=r(melhores.mean(), 4),
            ganho_auc_nulo_p95=r(np.percentile(melhores, 95), 4),
            ganho_auc_nulo_max=r(melhores.max(), 4),
            replicas_acima_do_real=acertos_nulo,
            p_do_melhor=r(p_melhor, 3),
            p_do_melhor_ic95_monte_carlo=[r(lo, 4), r(hi, 4)],
            p_do_melhor_formula="(1 + réplicas >= real) / (réplicas + 1)"),
    )


# ══════════════════════════════════════════════════════════════════════════════
#  ETAPA 5 — os quatro pilares, time a time, ano a ano
# ══════════════════════════════════════════════════════════════════════════════

# Os dois únicos indicadores da família `elenco` que se contam sobre JOGOS e não sobre o
# plantel — e por isso os dois únicos que continuam com n = J. Os outros oito (plantel,
# atletas usados, núcleo de 300 e de 1.000 minutos, share do XI, HHI, % de minutos de
# estrangeiros, idade do XI) são contas sobre o elenco inteiro, e o denominador deles é o
# tamanho do plantel.
ELENCO_EM_JOGOS = ("formacoes", "formPrincipalPct")


def etapa_5(d80, bruto, postos, meta, vazios, ns_ti, tec):
    """Matriz de 16 linhas (clube-ano promovido) × N colunas, com a faixa do meio ao fundo.

    O formato existe porque "indicador por indicador, time a time" é o pedido literal do
    dono. Cada célula carrega três números — bruto, posto e o `n` daquela célula —, e o `n`
    é o que impede a tela de mentir: um físico de setor com 3 atletas e um com 22 não podem
    ter a mesma tipografia.

    Célula vazia nunca é zero: quando o setor tem menos de 3 atletas rastreados ela vem
    `null` e o motivo está em `vazios_por_setor`.
    """
    d = d80.reset_index(drop=True)
    prom = d.index[d.faixa == "sobe"].tolist()
    n_ti = {}
    for (ano, clube, setor), n in ns_ti.items():
        n_ti[(ano, clube, setor)] = n
    n_fis = {s: d[f"fis_{s}_atletas"].values for s in SETORES}

    saida = {}
    for pilar in ("tecnico_col", "tecnico_ind", "fisico_col"):
        inds = [i for i, m in meta.items() if m["pilar"] == pilar]
        if pilar == "tecnico_col":
            grupos = [("tecnico_col", [i for i in inds if meta[i]["familia"] == "tecnico_col"]),
                      ("elenco", [i for i in inds if meta[i]["familia"] == "elenco"])]
        elif pilar == "fisico_col":
            grupos = [("fisico_col_elenco", [i for i in inds
                                             if meta[i]["familia"] == "fisico_col_elenco"])]
            grupos += [(f"fisico_col_{s}", [i for i in inds
                                            if meta[i].get("setor") == s]) for s in SETORES]
        else:
            grupos = [(f"tecnico_ind_{s}", [i for i in inds if meta[i].get("setor") == s])
                      for s in SETORES]
        for nome_g, cols in grupos:
            if not cols:
                continue

            def rotulo_ind(ind):
                """O cabeçalho de cada coluna — e o que ele promete sobre o `n` da célula.

                Duas mentiras de rótulo moravam aqui. A primeira: `coluna_csv` para um
                `ti_*`, que não é coluna de CSV nenhum e sim uma agregação feita neste
                script — quem confere vai procurar a coluna no painel e não acha. A segunda:
                um indicador de elenco contado em "clube-temporada" e entregue com n = 38,
                que é a contagem de rodadas; a própria aba já marcava a contradição como
                suspeita, e ela nasce nesta função.
                """
                m = meta[ind]
                out = dict(id=ind, nome=m["nome"], sinal=m["sinal"],
                           unidade_n=m["unidade_n"])
                if m["familia"] == "tecnico_ind":
                    out["origem"] = m["coluna_csv"]
                else:
                    out["coluna_csv"] = m["coluna_csv"]
                if m["familia"] == "elenco":
                    out["unidade_n"] = ("jogo" if ind in ELENCO_EM_JOGOS
                                        else "atleta do plantel")
                return out

            def n_celula(i, ind):
                m = meta[ind]
                if m["familia"] == "tecnico_ind":
                    return n_ti.get((int(d.ano[i]), d.clube[i], m["setor"]))
                if m["familia"] == "fisico_col_setor":
                    v = n_fis[m["setor"]][i]
                    return int(v) if np.isfinite(v) else None
                if m["familia"] == "fisico_col_elenco":
                    v = d.fis_atletas.values[i]
                    return int(v) if np.isfinite(v) else None
                if m["familia"] == "elenco" and ind not in ELENCO_EM_JOGOS:
                    v = d.plantel.values[i]
                    return int(v) if np.isfinite(v) else None
                return int(d.J.values[i])
            clubes = []
            for i in prom:
                cel = []
                for ind in cols:
                    b, p = bruto[ind].values[i], postos[ind].values[i]
                    if not np.isfinite(b):
                        m = meta[ind]
                        mot = ("menos de 3 atletas rastreados no setor"
                               if m["familia"] == "fisico_col_setor"
                               else "sem atleta com 600+ minutos no setor"
                               if m["familia"] == "tecnico_ind" else "coluna vazia na base")
                        cel.append([None, None, None, mot])
                    else:
                        cel.append([r(b, 3), r(p, 1), n_celula(i, ind)])
                clubes.append(dict(clube=d.clube[i], ano=int(d.ano[i]), pos=int(d.pos[i]),
                                   pts=int(d.pts[i]), celulas=cel))
            # A faixa de quem SUBIU entra pelo mesmo cálculo das outras duas, a pedido do dono:
            # as 16 linhas mostram cada time, mas o olho compara forma com forma — quartil contra
            # quartil. Sem a terceira faixa, o leitor compara um time contra um grupo e acha
            # padrão onde há só um caso. Mesma função, mesmo corte de 4 valores, mesmo arredondamento.
            faixa_sobe, faixa_meio, faixa_cai = [], [], []
            # As mesmas faixas no valor CRU, a pedido do dono: o percentil diz quem está na
            # frente, mas não diz quanto — e a pergunta de quem monta elenco é "quanto a mais
            # isto precisa ser" (a elasticidade). A tela troca de escala por um botão. A ressalva
            # que viaja junto: o valor cru mistura anos (calendário, bola, arbitragem mudam de
            # uma temporada para outra), e o percentil dentro do ano não; por isso o ORDENAMENTO
            # continua sendo o do percentil, e o cru é leitura de tamanho.
            faixa_sobe_bruto, faixa_meio_bruto, faixa_cai_bruto = [], [], []
            for ind in cols:
                for alvo, lst, lstb in (("sobe", faixa_sobe, faixa_sobe_bruto),
                                        ("meio", faixa_meio, faixa_meio_bruto),
                                        ("cai", faixa_cai, faixa_cai_bruto)):
                    mask = (d.faixa == alvo).values
                    v = postos[ind].values[mask]
                    v = v[np.isfinite(v)]
                    lst.append([r(np.percentile(v, 25), 1), r(np.percentile(v, 50), 1),
                                r(np.percentile(v, 75), 1)] if len(v) >= 4 else [None, None, None])
                    vb = bruto[ind].values[mask].astype(float)
                    vb = vb[np.isfinite(vb)]
                    lstb.append([r(np.percentile(vb, 25), 3), r(np.percentile(vb, 50), 3),
                                 r(np.percentile(vb, 75), 3)] if len(vb) >= 4 else [None, None, None])
            saida[nome_g] = dict(
                pilar=pilar,
                indicadores=[rotulo_ind(i) for i in cols],
                clubes=clubes, faixa_sobe=faixa_sobe, faixa_meio=faixa_meio, faixa_cai=faixa_cai,
                faixa_sobe_bruto=faixa_sobe_bruto, faixa_meio_bruto=faixa_meio_bruto,
                faixa_cai_bruto=faixa_cai_bruto,
                legenda_celula=["bruto", "posto_no_ano", "n", "motivo_se_vazia"])
            if pilar == "tecnico_ind":
                saida[nome_g]["origem_das_colunas"] = (
                    "nenhum `ti_*` é coluna de dados/serieb_clube_temporada.csv: cada um é a "
                    "média ponderada por minutos dos atletas do setor com 600+ min em "
                    "dados/serieb_tecnico.csv, agregada por este script. Por isso o campo "
                    "chama-se `origem` e não `coluna_csv`")

    # sensibilidade da regra de agregação do técnico individual (seção 2)
    sens = {}
    faixa = d80.faixa.values
    r_val = posto_ano(d80, "tm_valor_total").values
    for regra in ("ponderada", "mediana", "top5"):
        M, _ = agrega_tecnico_individual(tec, d80, regra)
        ps, pl = [], []
        for c in M.columns:
            v = pd.Series(M[c].values).groupby(d80.ano.values).rank(pct=True).values * 100
            ps.append(welch_p(v[faixa == "sobe"], v[faixa == "meio"]))
            res = residualiza(v, r_val)
            pl.append(welch_p(res[faixa == "sobe"], res[faixa == "meio"]))
        sens[regra] = dict(testes=len(ps),
                           passam5_SM=int(np.nansum(np.array(ps, float) < 0.05)),
                           bh5_SM=int(np.nansum(bh(ps) < 0.05)),
                           passam5_liq_SM=int(np.nansum(np.array(pl, float) < 0.05)),
                           bh5_liq_SM=int(np.nansum(bh(pl) < 0.05)))
    return dict(titulo_chave="etapa_5", paineis=saida, vazios_por_setor=vazios,
                sensibilidade_da_agregacao=sens,
                fis_atletas=dict(mediana=r(d80.fis_atletas.median(), 1),
                                 minimo=r(d80.fis_atletas.min(), 0),
                                 minutos_mediana=r(d80.fis_minutos.median(), 0)),
                goleiro="não rastreado pelo SkillCorner — buraco, não zero")


# ══════════════════════════════════════════════════════════════════════════════
#  ETAPA 8 — o cemitério dos padrões + a tipologia dos quatro grupos
# ══════════════════════════════════════════════════════════════════════════════

def eixos_matriz(d80, postos):
    """As nove réguas contínuas: média dos postos dos itens com o sinal alinhado."""
    E = pd.DataFrame(index=range(len(d80)))
    itens = {}
    for nome, comp in DECL["eixos"].items():
        cols = []
        usados = []
        for col, s in comp:
            if col in postos.columns:
                v = postos[col].values
            elif col in d80.columns:
                v = (pd.Series(d80[col].values).groupby(d80.ano.values)
                     .rank(pct=True).values * 100)
            else:
                continue
            cols.append(s * v)
            usados.append(col)
        E[nome] = np.nanmean(np.column_stack(cols), axis=1)
        itens[nome] = usados
    Z = (E - E.mean()) / E.std(ddof=0)
    return E, Z.fillna(0.0), itens


def silhueta_contra_nulos(X, ks, n_rep, etiqueta, gen=None):
    """A decisão mais dura da especificação, e ela é resultado e não opinião.

    Dois nulos, lado a lado, na mesma matriz e no mesmo k:

    - **colunas embaralhadas**: destrói a correlação ENTRE indicadores. Qualquer dado
      correlacionado bate esse nulo. Ele não testa agrupamento — testa correlação, e por
      isso devolve p=0,000 em cima de uma reta.
    - **mesma covariância**: gaussiana multivariada com a mesma matriz de covariância da
      observada. Este testa o que a pergunta pede — "o agrupamento observado é melhor que
      o de ruído com a mesma forma?" — e é ele que decide.

    A pergunta certa nunca é "qual o melhor k" (essa sempre devolve um número).
    """
    g = rng if gen is None else gen
    X = np.asarray(X, float)
    mu, cov = X.mean(0), np.cov(X, rowvar=False)
    out = []
    for k in ks:
        if len(X) <= k + 1:
            continue
        obs = silhouette_score(X, KMeans(k, n_init=10, random_state=SEMENTE).fit_predict(X))
        emb, mesma = [], []
        for _ in range(n_rep):
            Y = np.column_stack([X[g.permutation(len(X)), j] for j in range(X.shape[1])])
            emb.append(silhouette_score(Y, KMeans(k, n_init=3, random_state=SEMENTE).fit_predict(Y)))
            Z = g.multivariate_normal(mu, cov, size=len(X))
            mesma.append(silhouette_score(Z, KMeans(k, n_init=3, random_state=SEMENTE).fit_predict(Z)))
        emb, mesma = np.array(emb), np.array(mesma)
        out.append(dict(conjunto=etiqueta, n=len(X), dimensoes=X.shape[1], k=k,
                        silhueta_obs=r(obs, 3),
                        nulo_colunas_embaralhadas=dict(
                            mediana=r(np.median(emb), 3),
                            p=r((1 + (emb >= obs).sum()) / (n_rep + 1), 4)),
                        nulo_mesma_covariancia=dict(
                            mediana=r(np.median(mesma), 3),
                            p=r((1 + (mesma >= obs).sum()) / (n_rep + 1), 4)),
                        replicas=n_rep))
    return out


def silhueta_dos_rotulos(X, rotulos, n_rep, etiqueta, gen=None):
    """A mesma pergunta de `silhueta_contra_nulos`, mas sobre a partição QUE ESTÁ NA TELA.

    A diferença não é de detalhe. `silhueta_contra_nulos` mede o melhor recorte que o
    k-means acha na matriz — um recorte que ninguém declarou, que não é o dos quatro grupos
    e que, no plano dos dois eixos, sai com tamanhos outros. Levar o p dele ao veredito da
    tipologia é responder uma pergunta que não foi feita.

    Aqui a silhueta observada é a dos rótulos declarados, e o nulo continua sendo o k-means
    no ruído de mesma covariância — de propósito, e é a comparação mais dura possível: se a
    partição declarada separa PIOR do que o melhor recorte que o k-means encontra numa nuvem
    gaussiana sem grupo nenhum, então "quatro ilhas" não é leitura que o plano autorize.
    """
    g = rng if gen is None else gen
    X = np.asarray(X, float)
    rot = np.asarray(rotulos)
    k = len(set(rot.tolist()))
    obs = silhouette_score(X, rot)
    mu, cov = X.mean(0), np.cov(X, rowvar=False)
    emb, mesma = [], []
    for _ in range(n_rep):
        Y = np.column_stack([X[g.permutation(len(X)), j] for j in range(X.shape[1])])
        emb.append(silhouette_score(Y, KMeans(k, n_init=3, random_state=SEMENTE).fit_predict(Y)))
        Z = g.multivariate_normal(mu, cov, size=len(X))
        mesma.append(silhouette_score(Z, KMeans(k, n_init=3, random_state=SEMENTE).fit_predict(Z)))
    emb, mesma = np.array(emb), np.array(mesma)
    return dict(conjunto=etiqueta, rotulos="a partição declarada (os quatro quadrantes)",
                n=len(X), dimensoes=X.shape[1], k=k,
                tamanhos=[int((rot == c).sum()) for c in sorted(set(rot.tolist()))],
                silhueta_obs=r(obs, 3),
                nulo_colunas_embaralhadas=dict(
                    mediana=r(np.median(emb), 3),
                    p=r((1 + (emb >= obs).sum()) / (n_rep + 1), 4)),
                nulo_mesma_covariancia=dict(
                    mediana=r(np.median(mesma), 3),
                    p=r((1 + (mesma >= obs).sum()) / (n_rep + 1), 4)),
                replicas=n_rep)


def jaccard_bootstrap(X, k, n_rep, gen=None):
    """Estabilidade de Hennig: reamostra INDICADORES, refaz o k-means, mede o Jaccard.

    Critério do próprio Hennig: >=0,75 é estável, <0,60 dissolve. Um agrupamento que só
    existe com aquele conjunto exato de colunas não é um agrupamento do futebol.
    """
    g = rng if gen is None else gen
    X = np.asarray(X, float)
    base = KMeans(k, n_init=10, random_state=SEMENTE).fit_predict(X)
    jac = {c: [] for c in range(k)}
    for _ in range(n_rep):
        cols = g.integers(0, X.shape[1], X.shape[1])
        novo = KMeans(k, n_init=3, random_state=SEMENTE).fit_predict(X[:, cols])
        for c in range(k):
            a = base == c
            jac[c].append(max(((a & (novo == c2)).sum() / max(1, (a | (novo == c2)).sum()))
                              for c2 in range(k)))
    return dict(k=k, replicas=n_rep, linha_hennig_estavel=0.75, linha_hennig_dissolve=0.60,
                jaccard_por_grupo=[r(np.mean(jac[c]), 3) for c in range(k)],
                tamanhos=[int((base == c).sum()) for c in range(k)])


def eta2(valores, rotulos):
    v = np.asarray(valores, float)
    ok = np.isfinite(v)
    v, g = v[ok], np.asarray(rotulos)[ok]
    if len(set(g)) < 2 or len(v) < 4:
        return np.nan
    total = ((v - v.mean()) ** 2).sum()
    if total == 0:
        return np.nan
    # `sorted` e não `set` puro: a ordem de um set de strings muda a cada execução do Python
    # (PYTHONHASHSEED), a soma em ponto flutuante muda na 16ª casa com a ordem, e no nulo
    # por permutação o `x >= e` do empate exato — a permutação que reproduz o rótulo
    # observado — passava a cair de um lado ou de outro. Resultado: os p da bateria de fora
    # da tipologia mudavam de uma rodada para a outra sem nada ter mudado. Medido em
    # 13/09/2026, rodando o gerador intacto duas vezes.
    entre = sum(len(v[g == c]) * (v[g == c].mean() - v.mean()) ** 2 for c in sorted(set(g)))
    return entre / total


def p_exato_binario(stat, alvo, n):
    """O p de um teste um-contra-o-resto SEM sorteio: todas as C(n,k) rotulagens, uma a uma.

    Com n=16 e um grupo de 5 o espaço inteiro tem 4.368 partições, e 560 quando o grupo tem
    3 — segundos de conta. Monte Carlo aqui não aproxima nada que não caiba na memória: ele
    só acrescenta uma semente da qual o selo TIPO/DESCRITIVO passa a depender, e um selo que
    vira com a semente não é selo. A rotulagem observada entra na contagem, como manda o
    teste exato de permutação — por isso o menor p possível é 1/C(n,k) e nunca zero.
    """
    idx = np.flatnonzero(np.asarray(alvo))
    obs = stat(np.where(np.asarray(alvo), "A", "B"))
    acima = 0
    total = 0
    for comb in itertools.combinations(range(n), len(idx)):
        lab = np.full(n, "B", dtype=object)
        lab[list(comb)] = "A"
        total += 1
        if stat(lab) >= obs - 1e-12:
            acima += 1
    return obs, acima, total, acima / total


def tipologia(d80, postos, bruto, jog):
    """A tipologia dos 16 que subiram: dois eixos declarados, quatro grupos, e os testes.

    Ela entra ao lado do cemitério e não no lugar dele, porque as duas coisas são verdade
    ao mesmo tempo e a tela precisa mostrar as duas: **não há ilhas** (a silhueta no espaço
    reduzido não passa), mas **há um plano contínuo com quadrantes que separam indicadores
    que ninguém usou para construí-los** (o teste de fora passa até contra o nulo placebo).

    O nulo placebo é o que derrubou as análises anteriores e precisa estar aqui: partições
    feitas ordenando os 16 por QUALQUER indicador real de futebol e cortando nos mesmos
    tamanhos. Embaralhar rótulo é fácil de bater; ordenar por um indicador real não é.
    """
    # Gerador próprio, como o do garimpo: o que esta função sorteia mudou de tamanho (a
    # bateria de fora subiu de 200 para 10.000 réplicas) e dois testes deixaram de sortear
    # (viraram enumeração exata). Sem stream separado essa mudança de consumo empurraria o
    # gerador global e trocaria, de lambuja, números de etapas que não são desta função.
    gen = np.random.default_rng([SEMENTE, 8])
    d = d80.reset_index(drop=True)
    sobe = d.index[d.faixa == "sobe"].values

    def eixo_tip(comp, P):
        """Média dos percentis com o item de sinal negativo INVERTIDO (100 − p).

        Inverter em vez de trocar o sinal não é cosmético: os dois eixos precisam morar na
        mesma escala de 0 a 100 para que o corte na mediana e a distância à linha sejam
        legíveis na tela. `−passe_longo_pct` daria um eixo que vai de −100 a +100 e uma
        mediana de 16,25 onde o documento fala em 66,25 — o mesmo recorte com outro número,
        e ninguém conseguiria conferir.
        """
        return np.nanmean(np.column_stack(
            [P[c] if s > 0 else 100 - P[c] for c, s in comp]), axis=1)

    Pc = {c: postos[c].values for c in postos.columns}
    eixo_nomes = list(DECL["tipologia"])
    V = {e: eixo_tip(DECL["tipologia"][e], Pc) for e in eixo_nomes}
    cortes = {e: float(np.median(V[e][sobe])) for e in eixo_nomes}
    terr, rota = eixo_nomes
    alto_t = V[terr][sobe] >= cortes[terr]
    alto_r = V[rota][sobe] >= cortes[rota]
    grupo = np.where(alto_t & alto_r, "G1", np.where(alto_t & ~alto_r, "G2",
                     np.where(~alto_t & alto_r, "G3", "G4")))

    # A bateria de fora é PRÉ-DECLARADA (dados/prototipo_indicadores.json): 38 indicadores
    # técnicos coletivos, nenhum deles usado para construir os dois eixos. Escolher a
    # bateria depois de ver quais separam seria construir o teste em cima da resposta.
    usadas = {c for comp in DECL["tipologia"].values() for c, _ in comp}
    fora_tec = [c for c in DECL["bateria_tipologia"] if c not in usadas]
    Pt = {}
    for c in set(fora_tec) | set(DECL["tipologia_leitura"]):
        Pt[c] = (postos[c].values if c in postos.columns
                 else (pd.Series(d[c].values).groupby(d.ano.values)
                       .rank(pct=True).values * 100))
    fora_fis = [c for c in (DECL["fisico_col_elenco"]
                            + [c for s in SETORES for c in DECL["fisico_col_setor"][s]])
                if c in postos.columns]

    # 10.000 réplicas e não 200: com 200 o menor p que existe é 1/201 = 0,005, e era esse
    # piso — não uma medida — que o `p_rotulo` da bateria de fora vinha publicando. O piso
    # também empata p distintos no meio da lista, e o BH, que ordena p, devolvia 13
    # sobreviventes onde há 11. Custa segundos.
    N_BATERIA = 200 if RAPIDO else 10000

    def bateria(cols, g, fonte, n_rep=200):
        es, ps = [], []
        for c in cols:
            v = fonte[c][sobe] if isinstance(fonte, dict) else postos[c].values[sobe]
            e = eta2(v, g)
            if not np.isfinite(e):
                continue
            nulo = [eta2(v, gen.permutation(g)) for _ in range(n_rep)]
            es.append(e)
            ps.append((1 + sum(x >= e for x in nulo)) / (n_rep + 1))
        return np.array(es), np.array(ps)

    e_obs, p_obs = bateria(fora_tec, grupo, Pt, N_BATERIA)
    # nulo de RÓTULO SORTEADO, no eta² médio
    nulo_rot = np.array([np.nanmean([eta2(Pt[c][sobe], g2) for c in fora_tec])
                         for g2 in (gen.permutation(grupo) for _ in range(N_BATERIA))])
    # nulo PLACEBO: ordenar os 16 por QUALQUER indicador real de futebol e cortar nos
    # mesmos tamanhos. É o nulo que respeita a correlação entre indicadores — embaralhar
    # rótulo qualquer partição bate, ordenar por um indicador real não. Foi ele que
    # reprovou as análises anteriores, e por isso o pool de ordenação é o painel inteiro
    # (as 293 colunas pré-declaradas) e não só os 38 da bateria.
    tam = [int((grupo == g).sum()) for g in ("G1", "G2", "G3", "G4")]
    particoes_placebo = []
    for c in postos.columns:
        v = postos[c].values[sobe]
        if np.isfinite(v).sum() != len(sobe) or c in usadas:
            continue
        ordem = np.argsort(v)
        g2 = np.empty(len(sobe), dtype=object)
        i = 0
        for k, t in enumerate(tam):
            g2[ordem[i:i + t]] = f"P{k}"
            i += t
        particoes_placebo.append(g2)
    placebo = np.array([np.nanmean([eta2(Pt[x][sobe], g2) for x in fora_tec])
                        for g2 in particoes_placebo])
    obs_medio = float(np.nanmean(e_obs))

    # A ressalva que honra o teste, e que vai à tela e não ao rodapé: metade do sinal da
    # bateria de fora é a família do passe re-embalada — `passes`, `passes_certos`,
    # `passes_frente` são o eixo de ROTA dito com outras palavras. Restringindo aos
    # validadores fracamente correlacionados com os dois eixos, o global despenca.
    limpos = []
    for c in fora_tec:
        rs = [abs(stats.spearmanr(Pt[c], V[e], nan_policy="omit").statistic) for e in eixo_nomes]
        if all(np.isfinite(x) and x < 0.50 for x in rs):
            limpos.append(c)
    e_lim, _ = bateria(limpos, grupo, Pt)
    nulo_lim = np.array([np.nanmean([eta2(Pt[c][sobe], g2) for c in limpos])
                         for g2 in (gen.permutation(grupo) for _ in range(N_BATERIA))])
    # A bateria limpa é A RESSALVA CENTRAL do documento, e vinha julgada só pelo nulo fraco.
    # O placebo é o nulo que reprovou as análises anteriores; ele tem de valer aqui também,
    # e vale nas MESMAS partições já geradas acima — trocar o nulo sem trocar as partições é
    # o que torna os dois p comparáveis lado a lado.
    placebo_lim = np.array([np.nanmean([eta2(Pt[c][sobe], g2) for c in limpos])
                            for g2 in particoes_placebo])
    obs_lim = float(np.nanmean(e_lim))
    p_lim_rotulo = (1 + (nulo_lim >= obs_lim).sum()) / (len(nulo_lim) + 1)
    p_lim_placebo = (1 + (placebo_lim >= obs_lim).sum()) / (len(placebo_lim) + 1)

    # físico
    e_fis, p_fis = bateria(fora_fis, grupo, {c: postos[c].values for c in fora_fis})
    q_fis = bh(p_fis)
    # O `n` que faltava, coluna a coluna: um `fis_*` de setor entra com 12 dos 16 clubes
    # (a censura de menos de 3 atletas rastreados) e com um grupo de 2, e isso não pode ser
    # lido igual a uma coluna de elenco com 16 e grupo mínimo de 3. É este n — o de colunas
    # efetivamente testadas — que dá o esperado por acaso, não o total declarado.
    fis_por_coluna = []
    for c in fora_fis:
        v = postos[c].values[sobe]
        if not np.isfinite(eta2(v, grupo)):
            continue          # mesma peneira da `bateria`: sem eta² não houve teste
        ok = np.isfinite(v)
        g_ok = grupo[ok]
        fis_por_coluna.append(dict(
            col=c, n_clubes=int(ok.sum()),
            menor_grupo=min(int((g_ok == x).sum()) for x in ("G1", "G2", "G3", "G4")),
            grupos_com_algum=int(len(set(g_ok.tolist())))))

    # formação (proxy de Sistema), por clube-temporada promovido
    sis = jog.copy()
    sis[["sis", "sis_pct"]] = pd.DataFrame([sistema_limpo(s) for s in sis.Sistema],
                                           index=sis.index)
    form = sis.groupby(["ano", "Equipa"]).agg(
        linha3=("sis", lambda s: float(np.mean([str(x).startswith(("3", "5")) for x in s.dropna()]))),
        distintas=("sis", lambda s: int(s.dropna().nunique())),
        principal_pct=("sis", lambda s: float(s.value_counts(normalize=True).iloc[0])
                       if s.notna().any() else np.nan)).reset_index()
    form_idx = {(a, c): i for i, (a, c) in enumerate(zip(form.ano, form.Equipa))}
    linhas_form = np.array([form_idx[(int(d.ano[i]), d.clube[i])] for i in sobe])
    n_jogos_form = sis.groupby(["ano", "Equipa"]).size().reset_index(name="n")
    testes_form = {}
    for col in ("linha3", "distintas", "principal_pct"):
        v = form[col].values[linhas_form]
        e = eta2(v, grupo)
        nulo = [eta2(v, gen.permutation(grupo)) for _ in range(500)]
        testes_form[col] = dict(eta2=r(e, 3), p=r((1 + sum(x >= e for x in nulo)) / 501, 4))
    # O n deste bloco não é 16: cada clube-temporada traz os seus jogos, e é sobre eles que
    # a formação foi contada. Sem o número escrito, "a formação não separa" é uma frase sem
    # unidade — 16 o quê?
    testes_form["n"] = dict(clube_temporada=int(len(sobe)),
                            jogos=int(n_jogos_form.n.values[linhas_form].sum()),
                            jogos_por_clube_temporada=sorted(
                                {int(x) for x in n_jogos_form.n.values[linhas_form]}),
                            fonte="dados/serieb_jogos.csv, coluna Sistema")

    # dinheiro
    rv = posto_ano(d, "tm_valor_total").values
    posto_val = d.groupby("ano").tm_valor_total.rank(ascending=False).values
    e_din = eta2(rv[sobe], grupo)
    nulo_din = [eta2(rv[sobe], gen.permutation(grupo)) for _ in range(2000)]
    p_din = (1 + sum(x >= e_din for x in nulo_din)) / 2001
    kw = stats.kruskal(*[rv[sobe][grupo == g] for g in ("G1", "G2", "G3", "G4")])
    # partição rival feita SÓ com dinheiro
    ordem = np.argsort(-rv[sobe])
    g_din = np.empty(len(sobe), dtype=object)
    i = 0
    for k, t in enumerate(tam):
        g_din[ordem[i:i + t]] = f"D{k}"
        i += t
    e_rival = np.nanmean([eta2(Pt[c][sobe], g_din) for c in fora_tec])
    nulo_rival = np.array([np.nanmean([eta2(Pt[c][sobe], g2) for c in fora_tec])
                           for g2 in (gen.permutation(g_din) for _ in range(200))])

    # residualizar o dinheiro e refazer os cortes: regride cada coluna de construção no
    # percentil de valor nas 80 linhas, re-ranqueia o resíduo dentro do ano e refaz os
    # cortes. É aqui que se descobre qual dos dois eixos é bolso com nome tático.
    Pres = {c: pd.Series(residualiza(postos[c].values, rv)).groupby(d.ano.values)
            .rank(pct=True).values * 100 for c in usadas}
    V_res = {e: eixo_tip(DECL["tipologia"][e], Pres) for e in eixo_nomes}
    cortes_res = {e: float(np.median(V_res[e][sobe])) for e in eixo_nomes}
    g_res = np.where((V_res[terr][sobe] >= cortes_res[terr]) & (V_res[rota][sobe] >= cortes_res[rota]), "G1",
             np.where((V_res[terr][sobe] >= cortes_res[terr]), "G2",
             np.where((V_res[rota][sobe] >= cortes_res[rota]), "G3", "G4")))
    muda_terr = int(((V[terr][sobe] >= cortes[terr]) != (V_res[terr][sobe] >= cortes_res[terr])).sum())
    muda_rota = int(((V[rota][sobe] >= cortes[rota]) != (V_res[rota][sobe] >= cortes_res[rota])).sum())

    # estabilidade: tirar um time / tirar um indicador
    trocas_time = []
    for k in range(len(sobe)):
        mask = np.ones(len(sobe), bool); mask[k] = False
        ct = {e: float(np.median(V[e][sobe][mask])) for e in eixo_nomes}
        g2 = np.where((V[terr][sobe] >= ct[terr]) & (V[rota][sobe] >= ct[rota]), "G1",
             np.where((V[terr][sobe] >= ct[terr]), "G2",
             np.where((V[rota][sobe] >= ct[rota]), "G3", "G4")))
        trocas_time.append(dict(removido=f"{d.clube[sobe[k]]} {int(d.ano[sobe[k]])}",
                                trocas=int((g2 != grupo).sum()),
                                trocaram=[f"{d.clube[sobe[i]]} {int(d.ano[sobe[i]])}"
                                          for i in range(len(sobe)) if g2[i] != grupo[i]]))
    trocas_ind = []
    for eixo, comp in DECL["tipologia"].items():
        for c, _ in comp:
            comp2 = {e: [(cc, ss) for cc, ss in DECL["tipologia"][e] if cc != c]
                     for e in eixo_nomes}
            if not comp2[eixo]:
                continue
            V2 = {e: eixo_tip(comp2[e], Pc) for e in eixo_nomes}
            ct = {e: float(np.median(V2[e][sobe])) for e in eixo_nomes}
            g2 = np.where((V2[terr][sobe] >= ct[terr]) & (V2[rota][sobe] >= ct[rota]), "G1",
                 np.where((V2[terr][sobe] >= ct[terr]), "G2",
                 np.where((V2[rota][sobe] >= ct[rota]), "G3", "G4")))
            trocas_ind.append(dict(removido=c, trocas=int((g2 != grupo).sum())))

    # A silhueta que julga a tipologia é a DOS RÓTULOS DECLARADOS. A outra — k-means k=4 no
    # mesmo plano — responde outra pergunta: ela procura o melhor recorte que existir e o
    # acha com tamanhos que não são os quatro quadrantes. As duas ficam no arquivo, mas em
    # lugares diferentes: esta no veredito da tipologia, a do k-means no cemitério, que é
    # onde moram os padrões que o dado não sustenta.
    X2 = np.column_stack([V[e][sobe] for e in eixo_nomes])
    sil_decl = silhueta_dos_rotulos(X2, grupo, N_NULO,
                                    "16 que subiram, 2 eixos da tipologia", gen)
    sil2 = silhueta_contra_nulos(X2, [4], N_NULO, "16 que subiram, 2 eixos da tipologia", gen)
    jac2 = jaccard_bootstrap(X2, 4, min(N_JACCARD * 3, 1000), gen)
    kmeans_no_plano = dict(
        etiqueta=("k-means k=4 no plano dos dois eixos da tipologia — NÃO é a partição "
                  "declarada: os grupos abaixo são os que o próprio k-means encontrou, com "
                  "os tamanhos dele, e por isso nem a silhueta nem o Jaccard daqui julgam os "
                  "quatro quadrantes"),
        tamanhos_do_kmeans=jac2["tamanhos"],
        tamanhos_dos_quadrantes=[int((grupo == g).sum()) for g in ("G1", "G2", "G3", "G4")],
        silhueta=sil2, jaccard=jac2)

    # um-contra-o-resto por grupo, na bateria de fora — por ENUMERAÇÃO, não por sorteio.
    # O selo TIPO/DESCRITIVO de cada grupo sai deste p, e o G2 mora em cima da linha de 5%:
    # com Monte Carlo o selo dele passava a depender da semente. Com n=16 o espaço inteiro
    # de rotulagens cabe (4.368 para um grupo de 5, 560 para um de 3), então não há por que
    # aproximar o que dá para contar.
    M_fora = np.column_stack([Pt[c][sobe] for c in fora_tec])

    def eta2_medio_fora(rot, M=None):
        MM = M_fora if M is None else M
        return float(np.nanmean([eta2(MM[:, j], rot) for j in range(MM.shape[1])]))

    um_contra = {}
    for g in ("G1", "G2", "G3", "G4"):
        e, acima, total, p = p_exato_binario(eta2_medio_fora, grupo == g, len(sobe))
        um_contra[g] = dict(eta2_medio=r(e, 3), replicas=f"exato ({total} partições)",
                            particoes=total, particoes_acima_ou_iguais=acima, p=r(p, 5))

    # fronteira: distância ao corte e troca sob ruído de +-10 pontos
    fronteira = []
    for k in range(len(sobe)):
        i = sobe[k]
        dt = V[terr][i] - cortes[terr]
        dr = V[rota][i] - cortes[rota]
        trocas = 0
        for _ in range(2000):
            t2 = V[terr][i] + gen.normal(0, 10)
            r2 = V[rota][i] + gen.normal(0, 10)
            g2 = ("G1" if (t2 >= cortes[terr] and r2 >= cortes[rota]) else
                  "G2" if t2 >= cortes[terr] else
                  "G3" if r2 >= cortes[rota] else "G4")
            trocas += g2 != grupo[k]
        fronteira.append(dict(clube=d.clube[i], ano=int(d.ano[i]), grupo=grupo[k],
                              territorio=r(V[terr][i], 1), rota=r(V[rota][i], 1),
                              dist_corte_territorio=r(dt, 1), dist_corte_rota=r(dr, 1),
                              troca_sob_ruido_10pt_pct=r(100 * trocas / 2000, 1)))

    # O corte que separa os dois grupos de cada andar — é ele que diz se a ROTA é uma
    # fronteira ou uma linha desenhada no meio de uma nuvem. No TIPOLOGIA.md o andar de
    # cima (G1 x G2) é o mais frouxo da tipologia; aqui o número é recalculado.
    andares = {}
    for rot, mask in (("territorio_alto_G1_x_G2", V[terr][sobe] >= cortes[terr]),
                      ("territorio_baixo_G3_x_G4", V[terr][sobe] < cortes[terr])):
        sub = sobe[mask]
        alto_rota = V[rota][sub] >= cortes[rota]
        if len(set(alto_rota.tolist())) < 2:
            andares[rot] = dict(n=int(len(sub)), p=None, motivo="andar com um lado vazio")
            continue
        Ms = np.column_stack([Pt[c][sub] for c in fora_tec])
        e, acima, total, p = p_exato_binario(lambda x: eta2_medio_fora(x, Ms),
                                             alto_rota, len(sub))
        andares[rot] = dict(n=int(len(sub)), eta2_medio=r(e, 3),
                            replicas=f"exato ({total} partições)", particoes=total,
                            particoes_acima_ou_iguais=acima, p=r(p, 5))

    # o status declarado no TIPOLOGIA.md, ao lado do medido aqui: quando os dois
    # discordarem, a tela mostra os dois e o p de cada um. O documento é entrada declarada,
    # não verdade — e a rodada corrente é medida, não lembrada.
    STATUS_DECLARADO = {"G1": "TIPO", "G2": "DESCRITIVO", "G3": "TIPO", "G4": "TIPO"}
    P_DECLARADO = {"G1": 0.0034, "G2": 0.160, "G3": 0.0267, "G4": 0.0009}

    # assinatura de cada grupo
    grupos = []
    for g in ("G1", "G2", "G3", "G4"):
        sel = sobe[grupo == g]
        grupos.append(dict(
            grupo=g, n=int(len(sel)),
            territorio=r(np.mean(V[terr][sel]), 1), rota=r(np.mean(V[rota][sel]), 1),
            status="TIPO" if um_contra[g]["p"] is not None and um_contra[g]["p"] < 0.05
                   else "DESCRITIVO",
            corte_do_status=0.05,
            status_declarado_no_documento=STATUS_DECLARADO[g],
            p_declarado_no_documento=P_DECLARADO[g],
            p_um_contra_o_resto=um_contra[g]["p"],
            replicas_um_contra_o_resto=um_contra[g]["replicas"],
            times=[dict(clube=d.clube[i], ano=int(d.ano[i]), pos=int(d.pos[i]),
                        pts=int(d.pts[i]), posto_valor=int(posto_val[i]),
                        valor_eur=r(d.tm_valor_total[i], 0)) for i in sel],
            posto_valor_medio=r(np.mean(posto_val[sel]), 2),
            valor_medio_eur=r(np.nanmean(d.tm_valor_total.values[sel]), 0),
            brutos={c: r(np.nanmean(d[c].values[sel]), 3)
                    for c in ["posse", "passes_pct", "passe_longo_pct", "compr_passe",
                              "entradas_area", "toques_area", "atq_posicional", "ppda",
                              "recuperacoes", "cruzamentos", "cantos", "faltas", "xg",
                              "remates_contra", "xg_contra", "intensidade", "clean_sheets",
                              "defesa_vs_xg", "duelos_aereos"]
                    if c in d.columns},
            percentis={c: r(np.nanmean(Pt[c][sel]), 0) for c in
                       ["atq_posicional", "passes_frente_pct", "cantos", "cruzamentos",
                        "recuperacoes", "intensidade", "faltas", "duelos_aereos",
                        "amarelos", "xg_contra", "xg_por_remate_contra", "contra_ataques",
                        "passes_terco_final", "clean_sheets", "defesa_vs_xg"]
                       if c in Pt},
            formacao=dict(linha3_pct=r(100 * np.mean(form.linha3.values[linhas_form][grupo == g]), 1),
                          distintas=r(np.mean(form.distintas.values[linhas_form][grupo == g]), 1),
                          principal_pct=r(100 * np.mean(form.principal_pct.values[linhas_form][grupo == g]), 1)),
        ))

    q_tec = bh(p_obs)
    # O veredito, item a item: o que ela passou e o que ela NÃO passou, com o número de
    # cada um. Um teste que falhou não sai da tela — é ele que delimita o que a tipologia
    # não autoriza a dizer, e é a parte que costuma ser escondida no rodapé.
    p_rotulo = (1 + (nulo_rot >= obs_medio).sum()) / (len(nulo_rot) + 1)
    p_placebo = (1 + (placebo >= obs_medio).sum()) / (len(placebo) + 1)
    p_sil = (sil_decl["nulo_mesma_covariancia"]["p"] if sil_decl else None)
    veredito = [
        dict(teste="bateria de fora, 38 indicadores, contra rótulo sorteado",
             numero=r_sig(p_rotulo, 3), corte=0.05, passou=bool(p_rotulo < 0.05)),
        dict(teste="bateria de fora contra o NULO PLACEBO (partições por indicador real)",
             numero=r(p_placebo, 4), corte=0.05, passou=bool(p_placebo < 0.05)),
        # A bateria limpa é julgada pelo nulo DURO. Ela é a ressalva central do documento —
        # a parte do sinal que não é a família do passe re-embalada —, e era a única peça
        # do veredito avaliada só pelo nulo fraco: o placebo reprovou as análises
        # anteriores e não pode ser dispensado justamente aqui.
        dict(teste="bateria LIMPA (|rho|<0,50 contra os eixos) contra o NULO PLACEBO",
             numero=r(p_lim_placebo, 4), corte=0.05, passou=bool(p_lim_placebo < 0.05),
             p_contra_rotulo_sorteado=r(p_lim_rotulo, 4)),
        dict(teste="silhueta DOS RÓTULOS DECLARADOS nos 2 eixos contra gaussiana de mesma "
                   "covariância",
             numero=p_sil, corte=0.05, passou=bool(p_sil is not None and p_sil < 0.05)),
        dict(teste="Jaccard de bootstrap do k-means k=4 no plano — NÃO é a partição "
                   "declarada (ver cemitério), menor grupo contra a linha de Hennig",
             numero=min(jac2["jaccard_por_grupo"]), corte=0.60,
             passou=bool(min(jac2["jaccard_por_grupo"]) >= 0.60),
             julga_a_tipologia=False),
        dict(teste=f"físico ({len(e_fis)} colunas fis_*) sobrevive a Benjamini-Hochberg",
             numero=int(np.nansum(q_fis < 0.05)), corte=1,
             passou=bool(np.nansum(q_fis < 0.05) >= 1)),
        dict(teste="formação separa os grupos (% de linha de três)",
             numero=testes_form["linha3"]["p"], corte=0.05,
             passou=bool((testes_form["linha3"]["p"] or 1) < 0.05)),
        dict(teste="o dinheiro distingue os quatro grupos (permutação)",
             numero=r(p_din, 4), corte=0.05, passou=bool(p_din < 0.05)),
        dict(teste="partição rival feita SÓ com dinheiro explica a bateria de fora",
             numero=r((1 + (nulo_rival >= e_rival).sum()) / 201, 4), corte=0.05,
             passou=bool((1 + (nulo_rival >= e_rival).sum()) / 201 < 0.05)),
        dict(teste="corte de ROTA dentro do território alto (G1 x G2)",
             numero=andares["territorio_alto_G1_x_G2"].get("p"), corte=0.05,
             passou=bool((andares["territorio_alto_G1_x_G2"].get("p") or 1) < 0.05)),
        dict(teste="corte de ROTA dentro do território baixo (G3 x G4)",
             numero=andares["territorio_baixo_G3_x_G4"].get("p"), corte=0.05,
             passou=bool((andares["territorio_baixo_G3_x_G4"].get("p") or 1) < 0.05)),
        dict(teste="estabilidade: trocas ao tirar um time (máximo em 16)",
             numero=max(t["trocas"] for t in trocas_time), corte=0,
             passou=bool(max(t["trocas"] for t in trocas_time) <= 1)),
        dict(teste="estabilidade: trocas ao tirar um indicador (máximo em 16)",
             numero=max(t["trocas"] for t in trocas_ind), corte=0,
             passou=bool(max(t["trocas"] for t in trocas_ind) <= 2)),
    ]
    return dict(
        eixos={terr: [[c, s] for c, s in DECL["tipologia"][terr]],
               rota: [[c, s] for c, s in DECL["tipologia"][rota]]},
        bateria_pre_declarada=fora_tec,
        veredito=veredito, andares=andares,
        cortes={e: r(cortes[e], 2) for e in eixo_nomes},
        plano=[dict(clube=d.clube[i], ano=int(d.ano[i]), pos=int(d.pos[i]), grupo=grupo[k],
                    territorio=r(V[terr][i], 1), rota=r(V[rota][i], 1))
               for k, i in enumerate(sobe)],
        grupos=grupos,
        teste_de_fora=dict(
            indicadores=len(fora_tec), eta2_medio_obs=r(obs_medio, 3),
            eta2_medio_nulo_rotulo=r(np.mean(nulo_rot), 3),
            p_rotulo=r_sig(p_rotulo, 3), p_rotulo_texto=rotulo_p(p_rotulo),
            replicas_rotulo=len(nulo_rot),
            eta2_medio_nulo_placebo=r(np.mean(placebo), 3),
            placebo_particoes=len(placebo),
            p_placebo=r(p_placebo, 4),
            sobrevivem_bh5=int(np.nansum(q_tec < 0.05)),
            sobrevivem_bh10=int(np.nansum(q_tec < 0.10)),
            por_indicador=sorted(
                [dict(col=c, eta2=r(e, 3), p=r(p, 5), q=r(q, 5),
                      percentil_por_grupo={g: r(np.nanmean(Pt[c][sobe][grupo == g]), 0)
                                           for g in ("G1", "G2", "G3", "G4")})
                 for c, e, p, q in zip(fora_tec, e_obs, p_obs, q_tec)],
                key=lambda x: -(x["eta2"] or 0))),
        bateria_limpa=dict(
            validadores=len(limpos), criterio="|rho| < 0,50 contra os dois eixos nas 80 linhas",
            eta2_medio_obs=r(obs_lim, 3), eta2_medio_nulo=r(np.mean(nulo_lim), 3),
            p=r(p_lim_rotulo, 4), replicas_rotulo=len(nulo_lim),
            eta2_medio_nulo_placebo=r(np.mean(placebo_lim), 3),
            placebo_particoes=len(placebo_lim),
            p_placebo=r(p_lim_placebo, 4),
            julgada_por="p_placebo",
            motivo_do_julgamento=(
                "o nulo de rótulo sorteado é o fraco: qualquer partição de dados "
                "correlacionados o bate. O que reprovou as análises anteriores foi o "
                "placebo — partições feitas ordenando os 16 por um indicador real de "
                "futebol —, e é por ele que esta bateria, que é a ressalva central da "
                "tipologia, tem de passar"),
            # O p do placebo desta bateria NÃO bate com o da conferência, e a divergência
            # fica escrita em vez de conciliada: lá são 23 validadores e aqui o critério do
            # próprio código seleciona os que estão na lista `colunas`. Com um conjunto de
            # validadores diferente o eta² médio observado muda, e com ele o p.
            validadores_declarados_no_documento=23,
            p_placebo_declarado_na_conferencia=0.066,
            leitura_do_teste_cego=dict(
                declarado_em="_fonte/prototipo/CONFERENCIA.md §3.4",
                p_na_origem_2022_2025_declarado=0.0627,
                p_em_2018_2021_declarado=0.3492,
                leitura=("a bateria limpa não REPLICOU e não DEIXOU de replicar: ela já era "
                         "não-significativa em 2022-2025, onde nasceu. Dois não-resultados "
                         "não fazem uma refutação, e chamar o segundo de refutação daria "
                         "ao primeiro um status de achado que ele nunca teve"),
                p_medido_aqui_placebo=r(p_lim_placebo, 4),
                p_medido_aqui_rotulo=r(p_lim_rotulo, 4)),
            colunas=limpos),
        fisico=dict(colunas=len(fora_fis), colunas_testadas=len(e_fis),
                    passam5=int(np.nansum(p_fis < 0.05)),
                    esperados_por_acaso=r(len(e_fis) * 0.05, 1),
                    menor_q_bh=r(np.nanmin(q_fis) if len(q_fis) else np.nan, 3),
                    sobrevivem_bh5=int(np.nansum(q_fis < 0.05)),
                    n_clubes_minimo=min(x["n_clubes"] for x in fis_por_coluna),
                    n_clubes_maximo=max(x["n_clubes"] for x in fis_por_coluna),
                    menor_grupo_minimo=min(x["menor_grupo"] for x in fis_por_coluna),
                    por_coluna=fis_por_coluna,
                    colunas_fis_de_fora=[
                        dict(col=c, motivo=(
                            "denominador da média física (atletas rastreados), não "
                            "indicador — entra como controle, ver etapa_1.controle_n_atletas"
                            if c.endswith("_atletas") else
                            "minutos rastreados do elenco: medida de exposição da base, não "
                            "indicador de jogo"))
                        for c in sorted(c for c in d.columns if c.startswith("fis_")
                                        and c not in set(fora_fis))]),
        formacao=testes_form,
        dinheiro=dict(eta2_posto_valor=r(e_din, 3), p_permutacao=r(p_din, 4),
                      p_kruskal=r(kw.pvalue, 4),
                      particao_rival_so_dinheiro=dict(
                          eta2_medio=r(e_rival, 3), eta2_medio_nulo=r(np.mean(nulo_rival), 3),
                          p=r((1 + (nulo_rival >= e_rival).sum()) / 201, 4)),
                      residualizado=dict(muda_territorio=muda_terr, muda_rota=muda_rota,
                                         de=len(sobe),
                                         trocaram=[f"{d.clube[sobe[k]]} {int(d.ano[sobe[k]])}"
                                                   for k in range(len(sobe))
                                                   if g_res[k] != grupo[k]]),
                      rho_posto_valor_x_percentil_ppda=r(
                          stats.spearmanr(posto_val[sobe], postos["ppda"].values[sobe]).statistic, 3),
                      convencao_ppda=("posto de valor 1 = elenco mais caro do ano; percentil "
                                      "de PPDA alto = MENOS pressão. rho positivo significa "
                                      "elenco caro pressiona alto")),
        estabilidade=dict(
            tirar_um_time=trocas_time,
            times_que_nunca_se_movem=[f"{d.clube[sobe[k]]} {int(d.ano[sobe[k]])}"
                                      for k in range(len(sobe))
                                      if all(f"{d.clube[sobe[k]]} {int(d.ano[sobe[k]])}"
                                             not in t["trocaram"] for t in trocas_time)],
            tirar_um_indicador=trocas_ind,
            silhueta_espaco_reduzido=[sil_decl], fronteira=fronteira),
        kmeans_no_plano_da_tipologia=kmeans_no_plano,
    )


def etapa_8(d80, postos, bruto, jog, Z, itens_eixo):
    cem = silhueta_contra_nulos(Z.values[(d80.faixa == "sobe").values], [2, 3, 4],
                                N_NULO, "16 que subiram, 9 eixos")
    cem += silhueta_contra_nulos(Z.values, [2, 3, 4], N_NULO, "80 clube-temporada, 9 eixos")
    tip = tipologia(d80, postos, bruto, jog)
    # O k-means no plano dos dois eixos é padrão procurado por algoritmo, não a partição que
    # a tela mostra — logo mora no cemitério, junto com os outros que o dado não sustenta, e
    # não dentro de `tipologia.estabilidade`, onde vinha sendo lido como se fosse a
    # estabilidade dos quatro quadrantes.
    km = tip.pop("kmeans_no_plano_da_tipologia")
    return dict(titulo_chave="etapa_8",
                cemiterio=dict(
                    linhas=cem,
                    jaccard=[jaccard_bootstrap(Z.values[(d80.faixa == "sobe").values], k, N_JACCARD)
                             for k in (2, 3, 4)],
                    eixos_usados=itens_eixo,
                    kmeans_no_plano_da_tipologia=km,
                    observacoes_por_dimensao=dict(n=16, dimensoes=Z.shape[1])),
                tipologia=tip)


# ══════════════════════════════════════════════════════════════════════════════
#  ETAPA 9 — as nove réguas / ETAPA 10 — causa ou consequência / ETAPA 11 — a mala
# ══════════════════════════════════════════════════════════════════════════════

def etapa_9(d80, E, itens_eixo, postos, linhas_cat):
    faixa = d80.faixa.values
    r_val = posto_ano(d80, "tm_valor_total").values
    pares = pares_consecutivos(d80)
    a = np.array([p[0] for p in pares]); b = np.array([p[1] for p in pares])
    cat = {L["indicador"]: L for L in linhas_cat}
    reg = []
    ps = []
    for nome in E.columns:
        v = E[nome].values
        res = residualiza(v, r_val)
        ps.append(welch_p(v[faixa == "sobe"], v[faixa == "meio"]))
        rho = stats.spearmanr(v[a], v[b], nan_policy="omit").statistic
        reg.append(dict(eixo=nome, itens=itens_eixo[nome],
                        d_SM=r(d_cohen(v[faixa == "sobe"], v[faixa == "meio"]), 3),
                        p_SM=r(ps[-1], 5),
                        d_liq_SM=r(d_cohen(res[faixa == "sobe"], res[faixa == "meio"]), 3),
                        p_liq_SM=r(welch_p(res[faixa == "sobe"], res[faixa == "meio"]), 5),
                        rho_persist=r(rho, 3), esmaecido=bool(np.isfinite(rho) and rho < 0.30),
                        sobe=[r(x, 1) for x in v[faixa == "sobe"]],
                        itens_crus=[dict(col=c, d_SM=cat[c]["d_bruto_SM"] if c in cat else None,
                                         p_SM=cat[c]["p_bruto_SM"] if c in cat else None,
                                         d_liq_SM=cat[c]["d_liq_SM"] if c in cat else None,
                                         p_liq_SM=cat[c]["p_liq_SM"] if c in cat else None,
                                         rho_persist=cat[c]["rho_persist"] if c in cat else None)
                                    for c in itens_eixo[nome]]))
    qs = bh(ps)
    for k, x in enumerate(reg):
        x["q_SM"] = r(qs[k], 5)
    return dict(titulo_chave="etapa_9", reguas=reg,
                aviso_composicao="a unidade de teste é o indicador cru; o eixo é régua de tela")


def etapa_10(d80, bruto, postos, linhas_cat):
    """"Não contrate para isto": o que separa forte e é o resultado redescrito."""
    faixa = d80.faixa.values
    linhas = []
    for L in linhas_cat:
        if L["porta"] == "D" or (L["porta"] == "B" and (L["rho_persist"] or 0) < 0.15):
            c = L["coluna_csv"]
            if c not in bruto.columns:
                continue
            v = bruto[c].values
            linhas.append(dict(indicador=L["indicador"], nome=L["nome"], porta=L["porta"],
                               m_sobe=r(np.nanmean(v[faixa == "sobe"]), 3),
                               m_meio=r(np.nanmean(v[faixa == "meio"]), 3),
                               m_cai=r(np.nanmean(v[faixa == "cai"]), 3),
                               d_bruto_SM=L["d_bruto_SM"], d_bruto_SC=L["d_bruto_SC"],
                               rho_persist=L["rho_persist"]))
    for c in DECL["resultado"]:
        if c in d80.columns and not any(x["indicador"] == c for x in linhas):
            v = d80[c].values
            linhas.append(dict(indicador=c, nome=c, porta="D",
                               m_sobe=r(np.nanmean(v[faixa == "sobe"]), 3),
                               m_meio=r(np.nanmean(v[faixa == "meio"]), 3),
                               m_cai=r(np.nanmean(v[faixa == "cai"]), 3),
                               d_bruto_SM=r(d_cohen(v[faixa == "sobe"], v[faixa == "meio"]), 3),
                               d_bruto_SC=r(d_cohen(v[faixa == "sobe"], v[faixa == "cai"]), 3),
                               rho_persist=None))
    linhas.sort(key=lambda x: -abs(x["d_bruto_SC"] or 0))
    return dict(titulo_chave="etapa_10", linhas=linhas)


def etapa_11(tec, sc):
    """O teste da mala: o que acompanha o atleta quando ele troca de clube.

    É o achado que sustenta a aba inteira, e ele é uma comparação de duas persistências na
    MESMA escala: o físico do atleta (ρ mediano ~0,85) contra o volume técnico dele
    (~0,28 quando muda de clube). Traduzido: **o que se compra num jogador é o físico e o
    duelo; o volume de passe dele era do time anterior.**

    A magnitude não replica entre implementações (um dos planos achou 0,129 com 52 pares,
    aqui dá ~0,28 com ~400) — por isso os ρ entram na nota de encaixe como FAIXA e nunca
    como coeficiente multiplicativo.
    """
    # físico: pares atleta t / t+1 com matches >= 8 nos dois anos
    s = sc.copy()
    s["k"] = s.short_name.map(G.chave_nome)
    s = s[s.matches >= 8]
    cols_fis = [c for c in ["psv99", "psv99_top5", "sprint_count_p90", "sprint_distance_p90",
                            "hsr_distance_p90", "high_accel_p90", "high_decel_p90",
                            "cod_count_p90", "distance_p90", "m_per_min"] if c in s.columns]
    for c in cols_fis:
        s[f"r_{c}"] = s.groupby("ano")[c].rank(pct=True) * 100
    m = s.merge(s, on="k", suffixes=("", "_b"))
    m = m[m.ano_b == m.ano + 1]
    fis = []
    for c in cols_fis:
        x, y = m[f"r_{c}"].values, m[f"r_{c}_b"].values
        ok = np.isfinite(x) & np.isfinite(y)
        fis.append(dict(metrica=c, n=int(ok.sum()),
                        rho=r(stats.spearmanr(x[ok], y[ok]).statistic, 3)))
    n_pares_fis = int(len(m))

    # técnico: postos dentro de ano + posição, >=900 min nos dois anos, separando quem
    # MUDOU de clube de quem FICOU. A regra de descarte de homônimo é a mesma de
    # gerar_raio_serieb::carregar — sem ela o merge ingênuo infla 3.866 para 4.216 linhas.
    t = tec.copy()
    t["k"] = t.Jogador.map(A.chave_nome)
    bons = t.groupby(["ano", "k"]).filter(
        lambda g: g.clube.nunique() == 1 and g.posicao_1.nunique() == 1)
    bons = bons.drop_duplicates(["ano", "k"])
    bons = bons[bons["min"] >= 900]
    inds = ["Duelos/90", "Duelos aéreos/90", "Dribles/90", "Acelerações/90", "Remates/90",
            "Passes progressivos/90", "Passes recebidos/90", "Toques na área/90",
            "Golos esperados/90", "Passes chave/90"]
    for c in inds:
        bons[f"r_{c}"] = (bons.groupby(["ano", "posicao_1"])[c]
                          .rank(pct=True) * 100)
    mm = bons.merge(bons, on="k", suffixes=("", "_b"))
    mm = mm[mm.ano_b == mm.ano + 1]
    mudou = mm[mm.clube != mm.clube_b]
    ficou = mm[mm.clube == mm.clube_b]
    tecn = []
    for c in inds:
        linha = dict(metrica=c)
        for rot, sub in (("mudou", mudou), ("ficou", ficou)):
            x, y = sub[f"r_{c}"].values, sub[f"r_{c}_b"].values
            ok = np.isfinite(x) & np.isfinite(y)
            linha[f"rho_{rot}"] = r(stats.spearmanr(x[ok], y[ok]).statistic, 3) if ok.sum() > 8 else None
            linha[f"n_{rot}"] = int(ok.sum())
        tecn.append(linha)
    med = lambda xs: r(np.nanmedian([x for x in xs if x is not None]), 3)
    return dict(titulo_chave="etapa_11",
                fisico=dict(pares=n_pares_fis, corte="matches >= 8 nos dois anos",
                            metricas=sorted(fis, key=lambda x: -(x["rho"] or 0)),
                            rho_mediano=med([x["rho"] for x in fis])),
                tecnico=dict(pares_mudou=int(len(mudou)), pares_ficou=int(len(ficou)),
                             corte="600+ min no arquivo e 900+ min nos dois anos, "
                                   "posto dentro de ano+posição",
                             metricas=tecn,
                             rho_mediano_mudou=med([x["rho_mudou"] for x in tecn]),
                             rho_mediano_ficou=med([x["rho_ficou"] for x in tecn])),
                uso="os rho entram na nota de encaixe como FAIXA, nunca como coeficiente")


# ══════════════════════════════════════════════════════════════════════════════
#  Seção 4.4 — a pseudorreplicação do sobecai, corrigida por clube
# ══════════════════════════════════════════════════════════════════════════════

def sobecai_corrigido(sc, raio):
    """Os 137 testes do `sobecai` usam n de ATLETA vindo de 16 e 16 CLUBES.

    Quatro zagueiros do mesmo clube dividem treinador, calendário e placar — não são quatro
    sorteios. A correção custa um `groupby`: agregar por clube-temporada (média ponderada
    por minuto rastreado) ANTES do teste e refazer com 16×16. Os 16 sobreviventes de BH vão
    cair. **É para caírem** — e a tela publica as duas colunas lado a lado, usando a de
    clube para decidir.
    """
    chaves = list(G.DE_PARA) + list(G.DE_PARA_JSON) + list(G.DE_PARA_OBR)
    saida = {}
    for setor, codigos in G.SETOR_FUND.items():
        wy = {w for w, cs in G.POSICOES.items() if any(c in codigos for c in cs)}
        d = sc[sc.pos_wy.isin(wy)]
        itens_ref = {it["k"]: it for it in raio["sobecai"]["setores"][setor]["itens"]}
        ps, linhas = [], []
        for k in chaves:
            col = G.DE_PARA.get(k) or G.DE_PARA_OBR.get(k) or k
            if col not in d.columns:
                continue
            v = pd.to_numeric(d[col], errors="coerce")
            g = pd.DataFrame(dict(ano=d.ano, clube=d.clube, faixa=d.faixa, v=v, w=d.min_tot))
            ag = (g.groupby(["ano", "clube", "faixa"])
                  .apply(lambda x: A.media_pond(x.v, x.w), include_groups=False)
                  .rename("v").reset_index().dropna())
            a = ag.v[ag.faixa == "sobe"].values
            b = ag.v[ag.faixa == "cai"].values
            if len(a) < 8 or len(b) < 8:
                continue
            dd = d_cohen(a, b)
            pp = welch_p(a, b)
            if k in G.MENOR_MELHOR:
                dd = -dd
            ref = itens_ref.get(k, {})
            ps.append(pp)
            linhas.append(dict(k=k, menor=k in G.MENOR_MELHOR,
                               n_clube_sobe=int(len(a)), n_clube_cai=int(len(b)),
                               m_sobe_clube=r(a.mean(), 3), m_cai_clube=r(b.mean(), 3),
                               d_clube=r(dd, 3), p_clube=r(pp, 5),
                               n_atleta_sobe=ref.get("n_sobe"), n_atleta_cai=ref.get("n_cai"),
                               d_atleta=ref.get("d"), p_atleta=ref.get("p"),
                               bh_atleta=ref.get("bh")))
        qs = bh(ps)
        for i, x in enumerate(linhas):
            x["q_clube"] = r(qs[i], 5)
            x["bh_clube"] = bool(np.isfinite(qs[i]) and qs[i] < 0.05)
        linhas.sort(key=lambda x: -(x["d_clube"] or 0))
        saida[setor] = dict(
            n_clube_sobe=max([x["n_clube_sobe"] for x in linhas], default=0),
            n_clube_cai=max([x["n_clube_cai"] for x in linhas], default=0),
            n_atleta_sobe=raio["sobecai"]["setores"][setor]["n_sobe"],
            n_atleta_cai=raio["sobecai"]["setores"][setor]["n_cai"],
            testes=len(linhas),
            bh5_atleta=sum(1 for x in linhas if x["bh_atleta"]),
            bh5_clube=sum(1 for x in linhas if x["bh_clube"]),
            p5_clube=sum(1 for x in linhas if (x["p_clube"] or 1) < 0.05),
            itens=linhas)
    return saida


# ══════════════════════════════════════════════════════════════════════════════
#  ETAPA 12 — o funil dos livres em dez/26
# ══════════════════════════════════════════════════════════════════════════════

def etapa_12(jogs, elencos):
    """A cascata, com quem saiu e por quê em cada degrau.

    Duas ressalvas que precisam de número e não de adjetivo:

    - **dezembro de 2026 não é filtro seletivo.** A esmagadora maioria dos contratos da
      região vence exatamente ali: é o calendário brasileiro. A seletividade da lista vem
      da NOTA, não do contrato.
    - **aceitar fonte única de contrato é aceitar milhares de registros sem confirmação.**
      A diferença entre o degrau 3 e o 4 é exatamente onde um erro de data vira uma
      proposta errada.
    """
    ligas = set(DECL["ligas_alvo"])
    br = {"Brasil A", "Brasil B", "Brasil C"}
    def livre(j):
        c = j.get("ct")
        return isinstance(c, str) and "2026-11" <= c[:7] <= "2027-01"
    def conf(j):
        return j.get("ctc") == "alta" or len(j.get("ctf") or []) >= 2
    def pool(j):
        return ((j.get("min") or 0) >= 900 and j.get("psv") is not None
                and j.get("rk_ok") and (j.get("id_") or 99) <= 32)

    degraus, atual = [], jogs
    passos = [("arquivo", lambda j: True),
              ("ligas_alvo", lambda j: j["l"] in ligas),
              ("contrato_nov26_jan27", livre),
              ("confianca_de_contrato", conf),
              ("pool_operacional", pool)]
    for i, (nome, f) in enumerate(passos):
        novo = [j for j in atual if f(j)]
        linha = dict(degrau=nome, n=len(novo), saiu=len(atual) - len(novo),
                     serie_b=sum(1 for j in novo if j["l"] == "Brasil B"),
                     nao_brasileiros=sum(1 for j in novo if j["l"] not in br),
                     brasil=sum(1 for j in novo if j["l"] in br))
        # "sul-americano" só é verdade DEPOIS do corte de ligas: no arquivo inteiro o
        # complemento do Brasil é o mundo, da Escócia ao Japão. Antes do degrau `ligas_alvo`
        # o campo não é emitido, para que a tela não possa escrever o rótulo errado.
        if i > 0:
            linha["sul_americanos"] = linha["nao_brasileiros"]
        degraus.append(linha)
        atual = novo
    p = atual
    dez26 = sum(1 for j in jogs if j["l"] in ligas and isinstance(j.get("ct"), str)
                and j["ct"][:7] == "2026-12")
    livres = [j for j in jogs if j["l"] in ligas and livre(j)]

    # cobertura física por liga: seis ligas com ZERO. Nelas a nota cairia inteira no bloco
    # técnico, que é justamente o que NÃO viaja. "Sem base para pontuar" > nota fraca.
    cob = {}
    for l in sorted(ligas):
        g = [j for j in jogs if j["l"] == l]
        cob[l] = dict(n=len(g), com_psv=sum(1 for j in g if j.get("psv") is not None),
                      pool=sum(1 for j in p if j["l"] == l))
    sem_fisico = [l for l, v in cob.items() if v["com_psv"] == 0]

    # conferência cruzada de contrato contra o Transfermarkt (única fonte independente)
    # Duas pontes, porque uma só cobre pouco: o id do Transfermarkt (`tm`) existe em 6.589
    # dos 40.059, e o nome cobre o resto. O nome vira chave por `chave_nome` e só é aceito
    # quando não é ambíguo dentro do elenco de 2026 — homônimo descartado, nunca adivinhado.
    e26 = elencos[elencos.ano == 2026]
    tm2ct, nome2ct, repetidos = {}, {}, set()
    for tm, nome, ca in zip(e26.id_jogador, e26.jogador, e26.contrato_ate):
        if not isinstance(ca, str) or len(ca) < 10:
            continue
        mes = f"{ca[6:10]}-{ca[3:5]}"
        tm2ct[str(tm)] = mes
        k = A.chave_nome(nome)
        if k in nome2ct and nome2ct[k] != mes:
            repetidos.add(k)
        nome2ct[k] = mes
    for k in repetidos:
        nome2ct.pop(k, None)

    # A conferência vale DENTRO da Série B e em lugar nenhum mais: a fonte independente é o
    # elenco de 2026 da própria Série B, então um atleta do Peru que "casa" por nome com um
    # nome de elenco brasileiro é homônimo POR CONSTRUÇÃO — não é uma data que discorda, é
    # outra pessoa. Os dois lados vão à tela: o de dentro mede concordância, o de fora mede
    # o tamanho da colisão de nomes, e é por isso que ele fica separado em vez de somado.
    bate = {c: [0, 0] for c in ("alta", "baixa", "conflito", "sem_fonte", "contestada", "manual")}
    fora_bate = {c: [0, 0] for c in bate}
    por_ponte = {"tm": [0, 0], "nome": [0, 0]}
    fora_ponte = {"tm": [0, 0], "nome": [0, 0]}
    for j in jogs:
        if not isinstance(j.get("ct"), str):
            continue
        alvo, ponte = None, None
        if j.get("tm") and str(j["tm"]) in tm2ct:
            alvo, ponte = tm2ct[str(j["tm"])], "tm"
        else:
            for nome in (j.get("nc"), j.get("n")):
                k = A.chave_nome(nome) if nome else None
                if k and k in nome2ct:
                    alvo, ponte = nome2ct[k], "nome"
                    break
        if alvo is None:
            continue
        acerto = int(j["ct"][:7] == alvo)
        dentro = j["l"] == "Brasil B"
        pp = por_ponte if dentro else fora_ponte
        bb = bate if dentro else fora_bate
        pp[ponte][1] += 1
        pp[ponte][0] += acerto
        c = j.get("ctc") or "sem_fonte"
        if c in bb:
            bb[c][1] += 1
            bb[c][0] += acerto
    bb_no_arquivo = sum(1 for j in jogs if j["l"] == "Brasil B")
    bb_com_tm = sum(1 for j in jogs if j["l"] == "Brasil B" and j.get("tm"))
    return dict(
        titulo_chave="etapa_12", periodo_da_base=PERIODO,
        degraus=degraus,
        vencem_exatamente_em_dez26=dez26, vencem_na_janela=len(livres),
        pct_da_janela_em_dez26=r(100 * dez26 / max(1, len(livres)), 1),
        por_liga=cob, ligas_sem_cobertura_fisica=sem_fisico,
        pool=dict(n=len(p),
                  por_liga={l: sum(1 for j in p if j["l"] == l)
                            for l in sorted({j["l"] for j in p})},
                  por_posicao={q: sum(1 for j in p if j["p"] == q)
                               for q in sorted({j["p"] for j in p})},
                  serie_b=sum(1 for j in p if j["l"] == "Brasil B"),
                  sul_americanos=sum(1 for j in p if j["l"] not in br)),
        conferencia_cruzada=dict(
            fonte="serieb_elencos.csv ano 2026 (contrato_ate 99,8% preenchido só ali)",
            populacao_coberta="Brasil B",
            motivo_do_recorte=("a fonte independente é o elenco de 2026 da Série B; fora dela "
                               "o casamento por nome é homônimo por construção, não discordância "
                               "de data. Os dois números vão lado a lado e nunca somados."),
            por_confianca={k: dict(bate=v[0], de=v[1],
                                   pct=r(100 * v[0] / v[1], 1) if v[1] else None)
                           for k, v in bate.items() if v[1]},
            geral=dict(bate=sum(v[0] for v in por_ponte.values()),
                       de=sum(v[1] for v in por_ponte.values()),
                       pct=r(100 * sum(v[0] for v in por_ponte.values())
                             / max(1, sum(v[1] for v in por_ponte.values())), 1)),
            por_ponte={k: dict(bate=v[0], de=v[1],
                               pct=r(100 * v[0] / v[1], 1) if v[1] else None)
                       for k, v in por_ponte.items()},
            fora_da_serie_b=dict(
                o_que_e=("casamentos da mesma ponte em atletas que NÃO são da Série B: a fonte "
                         "não cobre essas ligas, então a taxa mede colisão de nome, não acerto "
                         "de data"),
                geral=dict(bate=sum(v[0] for v in fora_ponte.values()),
                           de=sum(v[1] for v in fora_ponte.values()),
                           pct=r(100 * sum(v[0] for v in fora_ponte.values())
                                 / max(1, sum(v[1] for v in fora_ponte.values())), 1)),
                por_ponte={k: dict(bate=v[0], de=v[1],
                                   pct=r(100 * v[0] / v[1], 1) if v[1] else None)
                           for k, v in fora_ponte.items()},
                por_confianca={k: dict(bate=v[0], de=v[1],
                                       pct=r(100 * v[0] / v[1], 1) if v[1] else None)
                               for k, v in fora_bate.items() if v[1]}),
            cobertura_da_ponte_tm=dict(
                brasil_b_no_arquivo=bb_no_arquivo, brasil_b_com_id_tm=bb_com_tm,
                pct=r(100 * bb_com_tm / max(1, bb_no_arquivo), 1),
                conferidos_por_tm=por_ponte["tm"][1],
                motivo=("o id do Transfermarkt é a única ponte sem risco de homônimo, e ela "
                        "cobre uma fração do universo: o resto da conferência é por nome")),
            homonimos_descartados=len(repetidos),
            contrato_ate_2022_2025=int(elencos[elencos.ano <= 2025].contrato_ate.notna().sum())),
    ), p


# ══════════════════════════════════════════════════════════════════════════════
#  ETAPA 13 — a nota de encaixe, em três pedaços, com o backtest
# ══════════════════════════════════════════════════════════════════════════════

def alvos_fisicos(sc, corrigido, posto_val):
    """O vetor-alvo físico: o percentil que o cenário pede, por setor.

    A ponte com o candidato é por NOME DE MÉTRICA e não por nome de pessoa — as chaves do
    `sobecai` são exatamente os campos de `jogadores.json`. Isso elimina a classe inteira
    de erro de casamento de jogador, e é por isso que a nota tem chão.

    O alvo entra na forma "distância ao vetor CAI menos distância ao vetor SOBE": o que
    interessa é estar do lado certo da fronteira, e a fronteira precisa dos dois lados.
    Alvo é percentil DENTRO da distribuição da própria Série B rastreada, e o candidato é
    medido em percentil dentro da própria (liga, posição): as duas pontas são "posição
    relativa", que é o que viaja entre ligas. O valor bruto não viaja — o `m_por_min`
    mediano vai de 99,2 no Peru a 110,0 no Uruguai, 11% que é da liga e não do atleta.

    Três cenários, e eles precisam ser DIFERENTES de verdade, não o mesmo score com três
    rótulos: o **Caro** é o perfil dos promovidos que estavam no top-8 de valor do ano; o
    **Barato** é o perfil dos que subiram fora do top-8, que é o único material honesto
    para um clube que não vai ser o mais rico da liga; o **Anti-queda** é ficar acima do
    perfil de quem caiu, e é a recomendação por eliminação — a única que o n sustenta com
    folga, porque compara 16 contra 16 em vez de 4 contra 60.
    """
    sc = sc.copy()
    sc["posto_val"] = [posto_val.get((a, c), 99) for a, c in zip(sc.ano, sc.clube)]
    cenarios = {
        "sobe": lambda g: g.faixa == "sobe",
        "caro": lambda g: (g.faixa == "sobe") & (g.posto_val <= 8),
        "barato": lambda g: (g.faixa == "sobe") & (g.posto_val > 8),
        "cai": lambda g: g.faixa == "cai",
    }
    alvos, ns = {}, {}
    for setor, codigos in G.SETOR_FUND.items():
        wy = {w for w, cs in G.POSICOES.items() if any(c in codigos for c in cs)}
        d = sc[sc.pos_wy.isin(wy)]
        itens = {}
        for it in corrigido[setor]["itens"]:
            k = it["k"]
            col = G.DE_PARA.get(k) or G.DE_PARA_OBR.get(k) or k
            if col not in d.columns:
                continue
            v_todos = pd.to_numeric(d[col], errors="coerce")
            ref = v_todos.dropna().values
            if len(ref) < 30:
                continue
            linha = dict(d_clube=it["d_clube"], p_clube=it["p_clube"], q_clube=it["q_clube"],
                         bh_clube=it["bh_clube"], bh_atleta=it["bh_atleta"],
                         menor=it["menor"], n_atletas_serie_b=int(len(ref)))
            falta = False
            for cen, filtro in cenarios.items():
                g = d[filtro(d)]
                ag = (pd.DataFrame(dict(ano=g.ano, clube=g.clube,
                                        v=pd.to_numeric(g[col], errors="coerce"), w=g.min_tot))
                      .groupby(["ano", "clube"])
                      .apply(lambda x: A.media_pond(x.v, x.w), include_groups=False).dropna())
                if len(ag) < 3:
                    linha[f"pct_{cen}"] = None
                    linha[f"n_clubes_{cen}"] = int(len(ag))
                    linha[f"motivo_{cen}"] = "menos de 3 clube-temporada com o indicador"
                    falta = falta or cen in ("sobe", "cai")
                    continue
                linha[f"pct_{cen}"] = r(100 * (ref < ag.mean()).mean(), 1)
                linha[f"n_clubes_{cen}"] = int(len(ag))
                ns[cen] = max(ns.get(cen, 0), len(ag))
            if not falta:
                itens[k] = linha
        alvos[setor] = itens
    alvos["_n_clube_por_cenario"] = ns
    return alvos


SETOR_DE_POS = {"ZD": "zaga", "ZE": "zaga", "LD": "lateral", "LE": "lateral",
                "VOL": "meio", "MED": "meio", "MEI": "meio",
                "ED": "ataque", "EE": "ataque", "CA": "ataque"}

N_ERRO = 50 if RAPIDO else 400     # bootstrap do erro-padrão da margem, por atleta


def indicadores_do_setor(alvo):
    """Quais indicadores pontuam um setor — em UM lugar só, porque a nota e o backtest dela
    precisam ser a mesma coisa.

    A regra estava escrita duas vezes, e as duas versões discordavam: o backtest não filtrava
    pelo bloco físico declarado (8.2) e caía para o teste por atleta só quando a lista ficava
    vazia. Com isso ele media um score que ninguém publica — entravam `obr_*` (condicionados à
    posse, que o atleta não leva ao mudar de clube), `spn_s`, `hi*` e `hsr_n`. Um backtest de
    outro score não diz nada sobre o ranking publicado, seja qual for o p que ele devolva.

    O piso de três indicadores é o que separa "o setor tem bloco" de "o setor tem um traço": a
    nota de um setor inteiro não pode descansar sobre um indicador sem que isso esteja dito.
    """
    campos_fis = DECL["blocos_encaixe"]["fisica"]
    do_clube = [k for k, a in alvo.items()
                if k in campos_fis and (a["p_clube"] or 1) < 0.05]
    if len(do_clube) >= 3:
        usa, pseudo = do_clube, False
        crit = "p_clube < 0,05 (teste corrigido por clube, 16x16)"
    else:
        usa = [k for k, a in alvo.items() if k in campos_fis and a["bh_atleta"]]
        pseudo = True
        if not do_clube:
            crit = ("nenhum indicador do bloco sobreviveu ao teste por CLUBE; caiu-se para BH "
                    "no teste por ATLETA (pseudorreplicado)")
        else:
            crit = (f"só {len(do_clube)} indicador(es) do bloco sobreviveu(ram) ao teste por "
                    f"clube (p_clube<0,05); a nota do setor descansa sobre {len(usa)} "
                    f"indicador(es)")
    # teto da margem do setor: com o alvo fixo, a maior margem que um indicador pode dar é
    # |pct_cai − pct_sobe|/100, atingida por quem está do lado de fora do vetor sobe. Um setor
    # de um indicador só tem teto próprio, e a margem dele NÃO é comparável com a de um setor
    # de oito — por isso o teto viaja junto e vai impresso ao lado de cada linha.
    tetos = {}
    for c in ("sobe", "caro", "barato"):
        vs = [abs(alvo[k][f"pct_{c}"] - alvo[k]["pct_cai"]) / 100 for k in usa
              if alvo[k].get(f"pct_{c}") is not None and alvo[k].get("pct_cai") is not None]
        tetos[f"margem_{c}"] = float(np.mean(vs)) if vs else None
    return dict(usa=usa, criterio=crit, pseudorreplicado=pseudo,
                sobreviventes_por_clube=len(do_clube), tetos=tetos)


def erro_da_margem(prox, n_rep):
    """O erro-padrão da margem de um atleta, MEDIDO — e medido no que de fato o produz.

    A margem é a média, sobre os indicadores presentes, da diferença entre a proximidade ao
    vetor sobe e a proximidade ao vetor cai. O que faz esse número tremer é justamente quais
    indicadores o atleta tem e quanto eles discordam entre si: um zagueiro com oito
    indicadores concordantes tem uma margem firme, um com dois que apontam para lados opostos
    tem uma margem que é quase sorteio. Reamostrar os indicadores presentes (pareados, porque
    a margem é uma diferença dentro do mesmo indicador) mede exatamente isso.

    Com um indicador só não há o que medir, e é isso que fica gravado: `null` com motivo, e
    quem usa o número decide o que fazer com a ausência. A constante que estava aqui antes —
    0,30 dividido pela raiz do número de partidas rastreadas — não vinha de medida nenhuma.
    """
    saida = dict(replicas=n_rep,
                 origem=("bootstrap pareado dos indicadores presentes do próprio atleta: "
                         "desvio-padrão da margem sob reamostragem dos indicadores"))
    for c in ("sobe", "caro", "barato"):
        ks = [k for k in prox[c] if k in prox["cai"]]
        m = len(ks)
        saida[f"n_indicadores_{c}"] = m
        if m < 2:
            saida[f"margem_{c}"] = None
            saida[f"motivo_{c}"] = (
                f"{m} indicador presente: sem variabilidade entre indicadores para medir"
                if m else "nenhum indicador presente")
            continue
        a = np.array([prox[c][k] for k in ks], float)
        b = np.array([prox["cai"][k] for k in ks], float)
        idx = rng.integers(0, m, size=(n_rep, m))
        saida[f"margem_{c}"] = r(float((a[idx].mean(1) - b[idx].mean(1)).std(ddof=1)), 4)
    return saida


def etapa_13(pool, jogs, kpis, alvos, backtest):
    """Três notas, nunca uma só — e nunca somadas.

    O peso de cada bloco é o que COMPROVADAMENTE acompanha o atleta quando ele troca de
    clube (etapa 11): físico alto, duelo médio, estilo técnico baixo e com aviso. Somar os
    três num número único esconderia justamente a informação que custou mais caro para
    descobrir — e as coberturas dos três blocos são diferentes, então a soma também seria
    aritmeticamente falsa.

    Nada é imputado. Indicador ausente sai da conta e o denominador vai à tela.
    """
    kj = kpis["jogadores"]
    ids_duelo = DECL["blocos_encaixe"]["duelo"]
    ids_estilo = DECL["blocos_encaixe"]["estilo"]

    # percentil DENTRO de (liga, posição) — nunca entre ligas.
    #
    # E percentil CRU, sem inverter o "menor é melhor". O alvo com que este número vai ser
    # comparado (`pct_{cen}` de `alvos_fisicos`) é o percentil bruto do vetor do cenário
    # dentro da própria Série B: para `t_spr`, que é tempo de sprint, o alvo de quem sobe é
    # 40,1 justamente porque quem sobe é mais rápido. Inverter uma ponta e não a outra punia
    # o candidato rápido por ser rápido — a nota media a distância entre duas escalas
    # diferentes. A regra do "menor é melhor" já está toda dentro do alvo, e entra uma vez só.
    por_lp = {}
    for j in jogs:
        por_lp.setdefault((j["l"], j["p"]), []).append(j)
    pct_cache = {}
    def pct(j, campo, valor):
        chave = (j["l"], j["p"], campo)
        if chave not in pct_cache:
            vs = np.array([x.get(campo) for x in por_lp[(j["l"], j["p"])]
                           if isinstance(x.get(campo), (int, float))], float)
            pct_cache[chave] = np.sort(vs)
        vs = pct_cache[chave]
        if len(vs) < 12:
            return None, len(vs)
        return 100 * np.searchsorted(vs, valor, "left") / len(vs), len(vs)

    kpi_cache = {}
    def kpi_pcts(j, bloco, ids):
        # o bloco entra na chave do cache: sem ele, a primeira chamada (duelo) grava a
        # coorte só com os ids do duelo e a segunda (estilo) lê esse mesmo cache e não
        # acha nada — a nota de estilo sai vazia para o pool inteiro, em silêncio.
        chave = (j["l"], j["p"], bloco)
        if chave not in kpi_cache:
            tab = {}
            for x in por_lp[(j["l"], j["p"])]:
                regs = kj.get(f"{x['n']} - {x['t']} - {x['l']}")
                if not regs:
                    continue
                for kid, val, *_ in regs:
                    if kid in ids:
                        tab.setdefault(kid, []).append(val)
            kpi_cache[chave] = {k: np.sort(np.array(v, float)) for k, v in tab.items()}
        return kpi_cache[chave]

    # o critério do setor é do SETOR e não do atleta: calculá-lo uma vez por setor deixa a
    # regra visível inteira (inclusive o teto que ela impõe à margem) em vez de espalhada —
    # e é a MESMA função que o backtest chama, para que os dois pontuem a mesma coisa.
    criterio_setor = {s: indicadores_do_setor(alvos.get(s, {})) for s in SETORES}

    linhas = []
    sem_kpi = 0
    for j in pool:
        setor = SETOR_DE_POS.get(j["p"])
        alvo = alvos.get(setor, {})
        reg = criterio_setor.get(setor, dict(usa=[], criterio="posição sem setor físico",
                                             pseudorreplicado=False,
                                             sobreviventes_por_clube=0, tetos={}))
        usa = reg["usa"]
        prox = {c: {} for c in ("sobe", "caro", "barato", "cai")}
        n_ok = 0
        for k in usa:
            v = j.get(k)
            if not isinstance(v, (int, float)):
                continue
            p, n = pct(j, k, v)
            if p is None:
                continue
            n_ok += 1
            for c in prox:
                alv = alvo[k].get(f"pct_{c}")
                if alv is not None:
                    prox[c][k] = 1 - abs(p - alv) / 100
        med = {c: (float(np.mean(list(v.values()))) if v else None) for c, v in prox.items()}
        nota_fis = dict(indicadores_usados=n_ok, indicadores_no_bloco=len(usa),
                        criterio=reg["criterio"], pseudorreplicado=reg["pseudorreplicado"],
                        sobreviventes_por_clube=reg["sobreviventes_por_clube"])
        for c in ("sobe", "caro", "barato", "cai"):
            nota_fis[f"prox_{c}"] = r(med[c], 4)
        for c in ("sobe", "caro", "barato"):
            nota_fis[f"margem_{c}"] = (r(med[c] - med["cai"], 4)
                                       if med[c] is not None and med["cai"] is not None else None)
        nota_fis["margem"] = nota_fis["margem_sobe"]
        nota_fis["tetos_do_setor"] = {k: r(v, 4) for k, v in reg["tetos"].items()}
        nota_fis["teto_do_setor"] = nota_fis["tetos_do_setor"].get("margem_sobe")
        for c in ("sobe", "caro", "barato"):
            # a normalizada sai do valor NÃO arredondado: dividir a margem já arredondada
            # pelo teto devolvia 1,0003 para quem está exatamente no teto, e uma razão maior
            # que 1 num campo que se chama "normalizada pelo teto" parece bug e não é.
            t = reg["tetos"].get(f"margem_{c}")
            m = (med[c] - med["cai"]) if med[c] is not None and med["cai"] is not None else None
            nota_fis[f"margem_{c}_normalizada"] = (r(m / t, 4) if m is not None and t
                                                   and t >= 0.01 else None)
        nota_fis["margem_normalizada"] = nota_fis["margem_sobe_normalizada"]
        nota_fis["erro_padrao"] = erro_da_margem(prox, N_ERRO)
        # blocos técnicos, do kpis.json
        regs = kj.get(f"{j['n']} - {j['t']} - {j['l']}")
        blocos_tec = {}
        if regs:
            val = {kid: v for kid, v, *_ in regs}
            for rot, ids in (("duelo", ids_duelo), ("estilo", ids_estilo)):
                tab = kpi_pcts(j, rot, ids)
                xs, n_ok = [], 0
                for kid in ids:
                    if kid not in val or kid not in tab or len(tab[kid]) < 12:
                        continue
                    xs.append(100 * np.searchsorted(tab[kid], val[kid], "left") / len(tab[kid]))
                    n_ok += 1
                blocos_tec[rot] = dict(percentil_medio=r(np.mean(xs), 1) if xs else None,
                                       indicadores_usados=n_ok, indicadores_no_bloco=len(ids))
        else:
            sem_kpi += 1
            blocos_tec = {rot: dict(percentil_medio=None, indicadores_usados=0,
                                    indicadores_no_bloco=len(ids),
                                    motivo="sem casamento em kpis.json")
                          for rot, ids in (("duelo", ids_duelo), ("estilo", ids_estilo))}
        linhas.append(dict(
            nome=j["n"], clube=j["t"], liga=j["l"], pos=j["p"], setor=setor,
            idade=j.get("id_"), min=j.get("min"), sc_n=j.get("sc_n"), sc_min=j.get("sc_min"),
            ctc=j.get("ctc"), ctf=len(j.get("ctf") or []), ct=j.get("ct"),
            mv=j.get("mv"), sal=j.get("sal"), emp=j.get("emp"),
            nota_fisica=nota_fis, nota_duelo=blocos_tec["duelo"], nota_estilo=blocos_tec["estilo"],
            confianca=dict(sc_n=j.get("sc_n"), min=j.get("min"), ctc=j.get("ctc"),
                           ctf=len(j.get("ctf") or []),
                           barrado_do_ranking=bool((j.get("sc_n") or 0) < 8))))
    # Ordenar pela margem crua misturava setores com tetos diferentes: a zaga pontua sobre um
    # indicador (teto 0,185) e o ataque sobre oito (teto 0,150), e a diferença entre as duas
    # listas era em parte a aritmética do teto, não o atleta. A ordenação passa a ser pela
    # margem dividida pelo teto do próprio setor, com o teto impresso em cada linha; quem não
    # tem teto medido cai para o fim, e não para o meio como se tivesse margem zero.
    linhas.sort(key=lambda x: (-(x["nota_fisica"]["margem_normalizada"]
                                 if x["nota_fisica"]["margem_normalizada"] is not None else -9),
                               x["setor"] or "", x["nome"]))

    # Goleiro sai da esteira principal por REGRA e não por olho: o SkillCorner não rastreia
    # goleiro (é buraco, não zero) e no pool sobram 2 GOL contra 87 ZD. Trilha separada, só
    # técnica, com o motivo escrito — e o `n` de cada percentil, porque com coorte pequena
    # o percentil é um número com cara de medida.
    gk_campos = ["gk_def", "gk_evi", "gk_sai", "gk_pas", "cs"]
    gks = []
    ligas = set(DECL["ligas_alvo"])
    for j in jogs:
        if j["p"] != "GOL" or j["l"] not in ligas or not isinstance(j.get("ct"), str):
            continue
        if not ("2026-11" <= j["ct"][:7] <= "2027-01"):
            continue
        if not (j.get("ctc") == "alta" or len(j.get("ctf") or []) >= 2):
            continue
        if (j.get("min") or 0) < 900 or not j.get("rk_ok"):
            continue
        pcts = {}
        for c in gk_campos:
            v = j.get(c)
            if not isinstance(v, (int, float)):
                pcts[c] = None
                continue
            p, n = pct(j, c, v)
            pcts[c] = dict(percentil=r(p, 1), n_na_coorte=n) if p is not None else None
        gks.append(dict(nome=j["n"], clube=j["t"], liga=j["l"], idade=j.get("id_"),
                        min=j.get("min"), ctc=j.get("ctc"), mv=j.get("mv"),
                        percentis=pcts,
                        indicadores_com_dado=sum(1 for v in pcts.values() if v)))
    gks.sort(key=lambda x: -x["indicadores_com_dado"])

    return dict(
        titulo_chave="etapa_13", n=len(linhas),
        trilha_goleiro=dict(
            motivo_fora_da_esteira="SkillCorner não rastreia goleiro: sem base física nenhuma",
            no_pool_operacional=sum(1 for j in pool if j["p"] == "GOL"),
            referencia_ZD_no_pool=sum(1 for j in pool if j["p"] == "ZD"),
            indicadores=gk_campos + ["Golos expectáveis defendidos por 90´ (kpis.json)"],
            candidatos=gks),
        pesos=dict(fisica=dict(rho_ao_trocar_de_clube=[0.72, 0.90], peso="alto"),
                   duelo=dict(rho_ao_trocar_de_clube=[0.34, 0.46], peso="medio"),
                   estilo=dict(rho_ao_trocar_de_clube=[0.16, 0.30], peso="baixo")),
        nunca_somar=True,
        ordenacao=dict(
            chave="margem_normalizada",
            o_que_e="margem do cenário sobe dividida pelo teto do próprio setor",
            motivo=("margem crua de setores diferentes não é comparável: o teto é |pct_cai − "
                    "pct_sobe| médio dos indicadores do setor, e vai impresso em cada linha"),
            tetos_por_setor={s: {k: r(v, 4) for k, v in reg["tetos"].items()}
                             for s, reg in criterio_setor.items()}),
        criterio_por_setor={s: dict(criterio=reg["criterio"],
                                    pseudorreplicado=reg["pseudorreplicado"],
                                    sobreviventes_por_clube=reg["sobreviventes_por_clube"],
                                    indicadores=reg["usa"],
                                    tetos={k: r(v, 4) for k, v in reg["tetos"].items()})
                            for s, reg in criterio_setor.items()},
        erro_padrao_da_margem=dict(
            origem=("bootstrap pareado dos indicadores presentes de cada atleta (campo "
                    "`erro_padrao` de cada candidato)"),
            replicas=N_ERRO,
            motivo=("substitui a constante 0,30/sqrt(sc_n) que estava digitada e não vinha de "
                    "medida nenhuma; setor de um indicador só fica com null e motivo")),
        alvos_por_setor=alvos,
        casamento_kpis=dict(pool=len(linhas), sem_kpi=sem_kpi,
                            pct=r(100 * (len(linhas) - sem_kpi) / max(1, len(linhas)), 1)),
        goleiros_no_pool=sum(1 for j in pool if j["p"] == "GOL"),
        barrados_sc_n_menor_8=sum(1 for L in linhas if L["confianca"]["barrado_do_ranking"]),
        backtest=backtest,
        candidatos=linhas)


def backtest_nota(tec, sc, alvos):
    """O único número que o clube vai usar para assinar contrato é o único que ninguém testou.

    Ele É testável com o que existe: quem CHEGOU a um clube em t (presente em X no ano t e
    ausente de X em t-1), pontuado com o dado de t-1 — o dado que o clube teria na mesa —,
    e medido pelo que aconteceu depois: minutos em t e permanência em t+1.

    A pergunta é uma só: **os jogadores que a fórmula teria recomendado jogaram mais que os
    que ela teria reprovado?** O resultado vai para a tela, positivo ou negativo.
    """
    # 2026 sai AQUI, antes de qualquer contagem: a temporada tem 27 de 38 rodadas, e uma
    # "chegada em 2026" seria pontuada contra minutos de dois terços de campeonato — um
    # desfecho que não terminou de acontecer. O `assert` existe porque este é o erro que se
    # reinstala sozinho toda vez que a base ganha um ano.
    t = tec[tec.ano <= 2025].copy()
    assert t.ano.max() <= 2025, "2026 entrou no backtest — 27 de 38 rodadas"
    anos_do_arquivo = sorted(int(a) for a in tec.ano.unique())
    t["k"] = t.Jogador.map(A.chave_nome)
    bons = t.groupby(["ano", "k"]).filter(
        lambda g: g.clube.nunique() == 1 and g.posicao_1.nunique() == 1).drop_duplicates(["ano", "k"])
    presenca = {(a, k): c for a, k, c in zip(bons.ano, bons.k, bons.clube)}
    minutos = {(a, k): m for a, k, m in zip(bons.ano, bons.k, bons["min"])}

    # e a mesma coisa do outro lado do calendário: 2022 é o primeiro ano do arquivo, então
    # TODO atleta de 2022 aparece como chegada — não porque chegou, mas porque 2021 não
    # existe aqui. A contagem publicada é a de 2023 em diante; as duas descartadas vão ao
    # lado com o motivo, para que ninguém precise adivinhar de onde veio a diferença.
    ano0 = min(anos_do_arquivo)

    # A nota do backtest é a MESMA da etapa 13 — margem "distância ao vetor cai menos
    # distância ao vetor sobe", por setor, com os indicadores que passaram no teste por
    # clube. Testar um score mais simples do que o publicado responderia outra pergunta.
    s = sc.copy()
    s["k"] = s.short_name.map(G.chave_nome)
    s["setor"] = [next((x for x in SETORES
                        if any(c in G.SETOR_FUND[x] for c in G.POSICOES.get(p, []))), None)
                  for p in s.pos_wy]
    notas = {}
    criterio_setor = {}
    for setor in SETORES:
        g = s[s.setor == setor]
        if not len(g):
            continue
        alvo = alvos.get(setor, {})
        reg = indicadores_do_setor(alvo)
        criterio_setor[setor] = dict(criterio=reg["criterio"], indicadores=reg["usa"],
                                     pseudorreplicado=reg["pseudorreplicado"],
                                     sobreviventes_por_clube=reg["sobreviventes_por_clube"])
        pr = {}
        for k in reg["usa"]:
            col = G.DE_PARA.get(k) or G.DE_PARA_OBR.get(k) or k
            if col not in g.columns or alvo[k].get("pct_sobe") is None:
                continue
            v = pd.to_numeric(g[col], errors="coerce")
            # percentil CRU, como na etapa 13: o "menor é melhor" já está dentro do alvo, e
            # aplicá-lo de novo aqui deixaria as duas pontas da distância em escalas opostas.
            pr[k] = (g.groupby("ano")[col].rank(pct=True) * 100).where(v.notna())
        if not pr:
            continue
        for idx, ano, kk in zip(g.index, g.ano, g.k):
            ms, mc = [], []
            for k, p in pr.items():
                if np.isfinite(p.loc[idx]):
                    ms.append(1 - abs(p.loc[idx] - alvo[k]["pct_sobe"]) / 100)
                    mc.append(1 - abs(p.loc[idx] - alvo[k]["pct_cai"]) / 100)
            if ms:
                notas[(int(ano), kk)] = float(np.mean(ms) - np.mean(mc))

    # Duas definições de "chegada", e a diferença entre elas é o que o backtest consegue
    # testar. A ampla — presente no clube X em t e ausente de X em t-1 — inclui quem veio
    # de fora da Série B; a pontuável exige o atleta no arquivo em t-1, porque só aí existe
    # o dado que o clube teria na mesa. Publicar as duas impede a leitura de que o teste
    # cobriu o mercado inteiro.
    ampla = sum(1 for (ano, k), clube in presenca.items()
                if ano > ano0 and presenca.get((ano - 1, k)) != clube)
    ampla_com_ano0 = sum(1 for (ano, k), clube in presenca.items()
                         if presenca.get((ano - 1, k)) != clube)
    chegadas, permanencias = [], 0
    for (ano, k), clube in presenca.items():
        antes = presenca.get((ano - 1, k))
        if antes is None:
            continue
        if antes == clube:
            permanencias += 1
            continue
        mt = minutos.get((ano, k), np.nan)
        chegadas.append(dict(ano=int(ano), clube=clube, de=antes,
                             nota_fisica_t1=notas.get((ano - 1, k), np.nan),
                             min_t=float(mt) if np.isfinite(mt) else np.nan,
                             min_t1_anterior=float(minutos.get((ano - 1, k), np.nan)),
                             ficou_em_t1=int(presenca.get((ano + 1, k)) == clube)))
    ch = pd.DataFrame(chegadas)
    com = ch[np.isfinite(ch.nota_fisica_t1)]
    janela = dict(
        chegadas_definicao_ampla=int(ampla),
        rotulo_da_definicao_ampla=f"{ano0 + 1}-{int(t.ano.max())}",
        chegadas_definicao_ampla_com_o_primeiro_ano=int(ampla_com_ano0),
        anos_no_arquivo=anos_do_arquivo, ano_maximo_usado=int(t.ano.max()),
        motivo_de_descartar_o_primeiro_ano=(
            f"{ano0} é o primeiro ano do arquivo: sem {ano0 - 1} para comparar, todo atleta de "
            f"{ano0} conta como chegada e o número infla"),
        motivo_de_descartar_2026="2026 tem 27 de 38 rodadas e não entra em conta nenhuma")
    if len(com) < 30:
        return dict(possivel=False, motivo="menos de 30 chegadas com nota física em t-1",
                    chegadas_pontuaveis=len(ch), permanencias=permanencias, **janela)
    corte = com.nota_fisica_t1.median()
    alto, baixo = com[com.nota_fisica_t1 >= corte], com[com.nota_fisica_t1 < corte]
    rho_min, p_min = stats.spearmanr(com.nota_fisica_t1, com.min_t, nan_policy="omit")
    return dict(
        possivel=True, **janela,
        chegadas_pontuaveis=int(len(ch)), permanencias=int(permanencias),
        chegadas_com_nota=int(len(com)),
        cobertura_fisica_pct=r(100 * len(com) / max(1, len(ch)), 1),
        corte_mediana=r(corte, 4),
        nota="margem = proximidade ao vetor sobe menos proximidade ao vetor cai, do setor",
        criterio_por_setor=criterio_setor,
        mesma_regra_da_etapa_13=("os indicadores saem de `indicadores_do_setor`, a mesma "
                                 "função que pontua o ranking publicado"),
        min_medio_recomendados=r(alto.min_t.mean(), 1), n_recomendados=int(len(alto)),
        min_medio_reprovados=r(baixo.min_t.mean(), 1), n_reprovados=int(len(baixo)),
        d_minutos=r(d_cohen(alto.min_t.dropna(), baixo.min_t.dropna()), 3),
        p_minutos=r(welch_p(alto.min_t.dropna(), baixo.min_t.dropna()), 5),
        rho_nota_x_minutos=r(rho_min, 3), p_rho=r(p_min, 5),
        permanencia_recomendados_pct=r(100 * alto.ficou_em_t1.mean(), 1),
        permanencia_reprovados_pct=r(100 * baixo.ficou_em_t1.mean(), 1),
        p_permanencia=r(stats.fisher_exact([[int(alto.ficou_em_t1.sum()),
                                             int((1 - alto.ficou_em_t1).sum())],
                                            [int(baixo.ficou_em_t1.sum()),
                                             int((1 - baixo.ficou_em_t1).sum())]])[1], 5),
        o_que_mede="nota física do ano ANTERIOR à chegada, posto dentro do ano")


# ══════════════════════════════════════════════════════════════════════════════
#  ETAPA 14 — os elencos propostos, como FAIXA
# ══════════════════════════════════════════════════════════════════════════════

GRADE = [("GOL", 1), ("ZD", 2), ("ZE", 2), ("LD", 1), ("LE", 1), ("VOL", 2),
         ("MED", 2), ("MEI", 1), ("ED", 1), ("EE", 1), ("CA", 2)]   # XI + 5 = 16

# Piso do erro-padrão: valor DECLARADO, não medido. Ele só é usado onde a medida não existe
# (atleta cujo setor pontua com um indicador só) e serve para que um atleta sem incerteza
# medível não entre na reamostragem como se fosse a certeza absoluta e trave a vaga nas 200
# réplicas. Vai ao JSON com esse rótulo, e a contagem de quem caiu nele vai junto.
PISO_ERRO = 0.02


def etapa_14(cand, d80, elencos):
    """Núcleo de 16 (XI + 5), entregue como FAIXA e não como time.

    Duas decisões, e as duas são sobre honestidade de precisão:

    **Faixa, não escalação.** 200 elencos por reamostragem das notas dentro do erro-padrão
    de cada atleta; por vaga, quem aparece em mais de 50% das soluções é recomendação e
    quem aparece em 10% a 50% é alternativa equivalente DENTRO DO RUÍDO. Um XI único
    calibrado em n=16 seria precisão falsa.

    **`linear_sum_assignment` e não programação inteira.** `pulp` e `ortools` não estão
    instalados; o Húngaro resolve a alocação ótima jogador×vaga com as restrições como
    pré-filtro e como penalidade na matriz de custo. O resultado é o mesmo para este porte.

    E o contrafactual do dinheiro ao pé de cada proposta, sempre: o elenco proposto vale
    tanto, isso o colocaria em tal posto de valor da Série B, e a taxa histórica de subida
    daquele quartil foi tanto. Sem isso a proposta é uma lista de nomes.
    """
    d = d80.copy()
    d["r_val"] = posto_ano(d, "tm_valor_total")
    q = pd.qcut(d.r_val, 4, labels=[1, 2, 3, 4])
    taxa_q = {int(l): r(100 * (g.faixa == "sobe").mean(), 1)
              for l, g in d.groupby(q, observed=True)}
    # Régua do contrafactual: o núcleo se compara com os atletas mais valiosos de cada clube
    # da Série B, e não com o plantel inteiro de 55, que carrega base e quem não joga. Mas o
    # tamanho do topo não é fixo em 15: o núcleo proposto tem 15 nomes e nem todos têm valor
    # de mercado — e só se soma quem tem. A régua tem o MESMO tamanho da soma: se
    # o núcleo entrou com 8 valores, ele se compara com os 8 atletas mais valiosos de cada
    # clube, nunca com os 15. Somar 8 e comparar com 15 fazia qualquer proposta parecer
    # barata, e o buraco (o atleta sem valor) virava desconto.
    e25 = elencos[elencos.ano == 2025]
    def regua_topo(n):
        s = (e25.groupby("clube").valor_eur
             .apply(lambda x: float(x.nlargest(n).sum())).sort_values(ascending=False))
        return s.values

    propostas = {}
    for cen, alvo_key, filtro in (
        ("A_caro", "margem_caro", lambda c: True),
        ("B_barato_transicao", "margem_barato", lambda c: (c.get("mv") or 0) <= 3_000_000),
        ("C_anti_queda", "margem_sobe", lambda c: True),
    ):
        def nota(c, _k=alvo_key):
            return c["nota_fisica"].get(_k)
        base = [c for c in cand if nota(c) is not None]
        for escopo, pred in (("serie_b", lambda c: c["liga"] == "Brasil B"),
                             ("sul_americano", lambda c: True)):
            pool = [c for c in base if filtro(c) and pred(c) and not c["emp"]
                    and (c["idade"] or 99) <= 32]
            vagas = [p for p, n in GRADE for _ in range(n)]
            # goleiro sai da esteira física por regra: o SkillCorner não rastreia goleiro
            vagas = [v for v in vagas if v != "GOL"]
            pos_pool = {}
            for c in pool:
                pos_pool.setdefault(c["pos"], []).append(c)
            # `dict.fromkeys(vagas)` e não `set(vagas)`: a ordem do set de strings muda a cada
            # execução (PYTHONHASHSEED), e com ela a ordem de `lista` — que é a ordem em que o
            # `rng.normal` distribui o ruído entre os atletas. O mesmo código, rodado duas
            # vezes sobre a mesma base, devolvia elencos diferentes (386 campos da etapa 14
            # mudaram entre duas rodadas do gerador intacto em 13/09/2026). A ordem agora é a
            # da GRADE, que é declarada e não sorteada.
            ordem_vagas = list(dict.fromkeys(vagas))
            denom = {v: len(pos_pool.get(v, [])) for v in ordem_vagas}
            lista = [c for v in ordem_vagas for c in pos_pool.get(v, [])]
            lista = list({id(c): c for c in lista}.values())
            if len(lista) < len(vagas):
                propostas[f"{cen}__{escopo}"] = dict(
                    possivel=False, motivo="candidatos elegíveis abaixo do número de vagas",
                    candidatos=len(lista), vagas=len(vagas), denominador_por_vaga=denom)
                continue
            notas = np.array([nota(c) for c in lista], float)
            # O erro-padrão é o MEDIDO na etapa 13 (bootstrap pareado dos indicadores do
            # próprio atleta). A fórmula que estava aqui — 0,30 sobre a raiz das partidas
            # rastreadas — tinha o 0,30 digitado: a faixa inteira, que é o produto desta
            # etapa, saía de uma constante que ninguém mediu. Onde a medida não existe (setor
            # de um indicador só, onde não há discordância entre indicadores para medir) o
            # atleta cai num PISO declarado, e quantos caíram vai à tela.
            erro, no_piso = [], 0
            for c in lista:
                e = (c["nota_fisica"].get("erro_padrao") or {}).get(alvo_key)
                if e is None or not np.isfinite(e) or e <= 0:
                    e, no_piso = PISO_ERRO, no_piso + 1
                erro.append(max(PISO_ERRO, float(e)))
            erro = np.array(erro, float)
            # As restrições da seção 9 entram como PENALIDADE na matriz de custo e não como
            # corte duro: um corte duro em teto de folha ou em teto de idade deixaria vagas
            # sem solução no pool pequeno da Série B e a proposta sairia incompleta sem
            # dizer por quê. Como penalidade, o Húngaro ainda devolve um elenco e a
            # infração fica medida no `restricoes` abaixo.
            idade = np.array([c["idade"] or 30 for c in lista], float)
            veterano = np.array([(c["min"] or 0) >= 1800 for c in lista])
            liga_de = [c["liga"] for c in lista]
            sal_meio = []
            for c in lista:
                m = re.findall(r"([\d.]+)\s*([MK])", str(c.get("sal") or ""))
                vals = [float(x) * (1e6 if u == "M" else 1e3) for x, u in m]
                sal_meio.append(np.mean(vals) if vals else np.nan)
            sal_meio = np.array(sal_meio, float)
            teto_idade, teto_liga, min_veteranos = 29.0, 6, 5

            contagem = [{} for _ in vagas]
            infracoes = dict(idade_media_acima_do_teto=0, liga_estrangeira_acima_de_6=0,
                             menos_de_5_com_1800_min=0, replicas=N_ELENCO)
            for _ in range(N_ELENCO):
                ruido = notas + rng.normal(0, erro)
                # penalidade de idade e de pouca rodagem: elenco novo inteiro é risco de
                # integração que o dado não mede, e a nota física premia o jovem sozinha.
                pen = np.where(idade > teto_idade, 0.02 * (idade - teto_idade), 0.0)
                pen += np.where(veterano, 0.0, 0.01)
                custo = np.full((len(lista), len(vagas)), 1e3)
                for jv, v in enumerate(vagas):
                    for ic, c in enumerate(lista):
                        if c["pos"] == v:
                            custo[ic, jv] = -(ruido[ic] - pen[ic])
                li, co = linear_sum_assignment(custo)
                sel_ic = [ic for ic, jv in zip(li, co) if custo[ic, jv] < 1e2]
                for ic, jv in zip(li, co):
                    if custo[ic, jv] < 1e2:
                        nm = f"{lista[ic]['nome']} ({lista[ic]['clube']})"
                        contagem[jv][nm] = contagem[jv].get(nm, 0) + 1
                if sel_ic:
                    infracoes["idade_media_acima_do_teto"] += idade[sel_ic].mean() > teto_idade
                    por_liga = {}
                    for ic in sel_ic:
                        if liga_de[ic] != "Brasil B":
                            por_liga[liga_de[ic]] = por_liga.get(liga_de[ic], 0) + 1
                    infracoes["liga_estrangeira_acima_de_6"] += any(v > teto_liga
                                                                    for v in por_liga.values())
                    infracoes["menos_de_5_com_1800_min"] += veterano[sel_ic].sum() < min_veteranos
            vagas_out = []
            vazias = 0
            for jv, v in enumerate(vagas):
                itens = sorted(contagem[jv].items(), key=lambda x: -x[1])
                rec = [dict(nome=n, freq_pct=r(100 * k / N_ELENCO, 1))
                       for n, k in itens if k / N_ELENCO > 0.50]
                alt = [dict(nome=n, freq_pct=r(100 * k / N_ELENCO, 1))
                       for n, k in itens if 0.10 <= k / N_ELENCO <= 0.50]
                linha_v = dict(vaga=v, denominador=denom.get(v, 0),
                               recomendacao=rec, alternativas=alt)
                # Vaga vazia não é vaga sem candidato: é vaga em que a massa se espalhou tanto
                # que ninguém chegou a 10% das réplicas. Sem o motivo escrito, a tela mostra
                # um buraco e o leitor conclui que não há quem jogue ali — quando o que houve
                # foi o oposto, gente demais empatada dentro do ruído.
                if not rec and not alt:
                    vazias += 1
                    lider = itens[0] if itens else None
                    linha_v["motivo"] = (
                        f"nenhum nome passou de 10% das {N_ELENCO} réplicas; a massa ficou "
                        f"espalhada entre {len(itens)} candidatos"
                        if itens else
                        f"nenhum candidato desta posição foi alocado em nenhuma das "
                        f"{N_ELENCO} réplicas")
                    linha_v["candidatos_com_alguma_replica"] = len(itens)
                    linha_v["primeiro_colocado"] = lider[0] if lider else None
                    linha_v["freq_pct_do_primeiro"] = (r(100 * lider[1] / N_ELENCO, 1)
                                                       if lider else None)
                vagas_out.append(linha_v)
            # contrafactual do dinheiro: soma dos mv dos nomes mais frequentes
            escolhidos, vistos = [], set()
            for jv, v in enumerate(vagas):
                itens = sorted(contagem[jv].items(), key=lambda x: -x[1])
                for n, _ in itens:
                    if n not in vistos:
                        vistos.add(n)
                        escolhidos.append(next(c for c in lista
                                               if f"{c['nome']} ({c['clube']})" == n))
                        break
            # `sum(c["mv"] or 0 ...)` somava ZERO para quem não tem valor de mercado: o
            # atleta sem dado entrava como atleta de graça e barateava o elenco proposto sem
            # que nada na tela dissesse isso. Soma-se só quem tem, e a régua encolhe junto.
            com_valor = [c for c in escolhidos if c.get("mv")]
            soma = float(sum(c["mv"] for c in com_valor))
            sem_mv = len(escolhidos) - len(com_valor)
            referencia = regua_topo(max(1, len(com_valor)))
            posto = int((referencia > soma).sum() + 1)
            quartil = min(4, max(1, int(np.ceil(posto / (len(referencia) / 4)))))
            quartil = 5 - quartil            # quartil 4 = o mais caro, como na etapa 1
            # Validação de volta (seção 9): recalcular do elenco proposto a mesma medida do
            # cenário e mostrar a distância ao alvo. Se não bate, o problema é o MERCADO e
            # não o método — e a tela precisa poder dizer qual eixo ficou de fora.
            volta = {}
            for c in ("sobe", "caro", "barato", "cai"):
                vs = [x["nota_fisica"].get(f"prox_{c}") for x in escolhidos]
                vs = [v for v in vs if v is not None]
                volta[f"prox_{c}"] = r(np.mean(vs), 4) if vs else None
            volta["margem_do_cenario"] = (
                r(volta[alvo_key.replace("margem_", "prox_")] - volta["prox_cai"], 4)
                if volta.get(alvo_key.replace("margem_", "prox_")) is not None
                and volta.get("prox_cai") is not None else None)
            volta["indicadores_medios_por_atleta"] = r(
                np.mean([x["nota_fisica"]["indicadores_usados"] for x in escolhidos]), 2)
            # a contagem lia o começo da frase do critério; a frase mudou de forma quando
            # passou a descrever o que houve, e um teste de texto quebra em silêncio. O campo
            # que responde à pergunta é booleano e é ele que conta.
            volta["atletas_com_criterio_pseudorreplicado"] = sum(
                1 for x in escolhidos if x["nota_fisica"].get("pseudorreplicado"))

            propostas[f"{cen}__{escopo}"] = dict(
                possivel=True, cenario=cen, escopo=escopo, replicas=N_ELENCO,
                alvo=alvo_key,
                alvo_significa=dict(
                    A_caro="perfil FÍSICO dos 12 promovidos que estavam no top-8 de valor",
                    B_barato_transicao="perfil FÍSICO dos 4 que subiram fora do top-8 de valor (n=4)",
                    C_anti_queda="distância ao perfil de quem CAIU, 16 contra 16")[cen],
                candidatos=len(lista), vagas=len(vagas),
                denominador_por_vaga=denom, vagas_detalhe=vagas_out,
                vagas_sem_nenhum_nome=vazias,
                erro_padrao=dict(
                    origem=("medido por atleta na etapa 13: bootstrap pareado dos indicadores "
                            "presentes, campo `erro_padrao` de cada candidato"),
                    replicas_do_bootstrap=N_ERRO,
                    medidos=len(lista) - no_piso, no_piso=no_piso,
                    piso_declarado=PISO_ERRO,
                    motivo_do_piso=("setor que pontua com um indicador só não tem discordância "
                                    "entre indicadores para medir; o piso é DECLARADO, não "
                                    "medido, e existe para o atleta não entrar na reamostragem "
                                    "como certeza absoluta")),
                validacao_de_volta=volta,
                restricoes=dict(
                    implementadas=["teto de idade média (iii)",
                                   "teto de 6 por liga estrangeira (iv)"],
                    teto_idade_media=teto_idade, teto_por_liga_estrangeira=teto_liga,
                    forma="penalidade na matriz de custo, não corte duro",
                    infracoes_nas_replicas={k: int(v) for k, v in infracoes.items()},
                    idade_media_do_nucleo=r(np.mean([c["idade"] or 30 for c in escolhidos]), 1),
                    com_1800_min_no_nucleo=int(sum(1 for c in escolhidos
                                                   if (c["min"] or 0) >= 1800)),
                    # Duas restrições da seção 9 NÃO estão implementadas, e estavam sendo
                    # listadas como se estivessem — `minimo_com_1800_min: 5` ao lado de
                    # `com_1800_min_no_nucleo: 1` é uma restrição que não restringe nada.
                    # Declará-las por fora, com o motivo, é o que permite ao leitor saber que
                    # o elenco proposto pode violá-las, e por quê.
                    nao_implementadas=dict(
                        teto_de_folha_9ii=dict(
                            motivo=("não existe valor de teto declarado em lugar nenhum do "
                                    "projeto, e `sal` é faixa de texto presente em parte do "
                                    "pool; qualquer teto aqui seria número inventado"),
                            o_que_existe="a soma do ponto médio da banda, abaixo, como medida"),
                        minimo_de_veteranos_9v=dict(
                            valor_pedido_na_especificacao=min_veteranos,
                            criterio="min >= 1800",
                            motivo=("é restrição de CONJUNTO e o Húngaro otimiza custo célula "
                                    "a célula: a penalidade de 0,01 por atleta sem rodagem não "
                                    "obriga o conjunto a ter 5. Implementar exigiria reservar "
                                    "k vagas para veteranos antes da alocação, o que muda a "
                                    "natureza da faixa e pode ficar inviável no pool pequeno"),
                            replicas_que_violam=int(infracoes["menos_de_5_com_1800_min"]),
                            de=N_ELENCO,
                            efeito_no_custo="penalidade de 0,01 na nota de quem tem min < 1800")),
                    folha=dict(
                        com_faixa_salarial=int(np.isfinite(sal_meio).sum()),
                        de=len(lista),
                        soma_ponto_medio_eur=r(float(np.nansum(
                            [s for c, s in zip(lista, sal_meio)
                             if f"{c['nome']} ({c['clube']})" in vistos])), 0),
                        motivo_banda=("`sal` vem como faixa de texto ('1.2M - 1.6M'); o "
                                      "ponto médio é banda, nunca número exato"))),
                sem_goleiro="SkillCorner não rastreia goleiro: trilha técnica separada",
                contrafactual=dict(
                    nucleo_valor_eur=r(soma, 0), atletas_no_nucleo=len(escolhidos),
                    atletas_com_valor_de_mercado=len(com_valor),
                    atletas_sem_valor_de_mercado=sem_mv,
                    regua=(f"soma dos {max(1, len(com_valor))} atletas mais valiosos de cada "
                           f"clube da Série B 2025 — o MESMO número de nomes que entrou na "
                           f"soma do núcleo"),
                    regua_topo_n=max(1, len(com_valor)),
                    motivo_da_regua=("o núcleo soma só os atletas com valor de mercado; comparar "
                                     "essa soma com o top-15 de cada clube mediria o buraco, "
                                     "não o elenco"),
                    posto_de_valor_em_2025=posto, de=int(len(referencia)),
                    abaixo_de_todos=bool(posto > len(referencia)),
                    referencia_1o_eur=r(referencia[0], 0),
                    referencia_mediana_eur=r(float(np.median(referencia)), 0),
                    referencia_20o_eur=r(referencia[-1], 0),
                    quartil=quartil, taxa_historica_de_subida_do_quartil_pct=taxa_q.get(quartil),
                    sem_faixa_salarial=sum(1 for c in escolhidos if not c["sal"])))
    return dict(titulo_chave="etapa_14", grade=[list(x) for x in GRADE],
                forma=("núcleo de 15 de campo (XI + 4); o goleiro sai por regra — SkillCorner "
                       "não rastreia goleiro"),
                grade_e_referencia_tatica=("a grade de 16 abaixo é referência tática (dupla "
                                           "cobertura em 4-2-3-1 e 4-4-2); a vaga de goleiro "
                                           "não é preenchida por esta esteira"),
                vagas_preenchidas=len([p for p, n in GRADE for _ in range(n)]) - 1,
                justificativa_no_dado=dict(
                    atletas_usados_sobe=r(d80[d80.faixa == "sobe"].atletas_usados.mean(), 1),
                    atletas_usados_cai=r(d80[d80.faixa == "cai"].atletas_usados.mean(), 1),
                    share_11_sobe=r(d80[d80.faixa == "sobe"].share_11.mean(), 1),
                    share_11_cai=r(d80[d80.faixa == "cai"].share_11.mean(), 1),
                    porta="B", aviso="aposta declarada, não característica comprável"),
                taxa_de_subida_por_quartil_pct=taxa_q,
                propostas=propostas)


# ══════════════════════════════════════════════════════════════════════════════
#  ETAPA 15 — treinador: o card do que NÃO dá
# ══════════════════════════════════════════════════════════════════════════════

def etapa_15(jog, d80, formas):
    """O achado negativo, publicado com os p e não escondido.

    Não há nome de treinador em base nenhuma do projeto. O único proxy possível é a troca
    de `Sistema`, e ele não distingue quem sobe de quem fica no meio em métrica nenhuma.
    Publicar isso com número é o que impede a aba de fingir que respondeu a pergunta.

    E a observação que mata o proxy por dentro: um clube troca de desenho ~20 vezes em 38
    jogos. Isso é ajuste de partida, não assinatura de comissão técnica.
    """
    j = jog.copy()
    j[["sis", "sis_pct"]] = pd.DataFrame([sistema_limpo(s) for s in j.Sistema], index=j.index)
    ag = j.groupby(["ano", "Equipa"]).agg(
        sistemas_distintos=("sis", lambda s: int(s.dropna().nunique())),
        trocas=("sis", lambda s: int((s.dropna().values[1:] != s.dropna().values[:-1]).sum())),
        principal_pct=("sis", lambda s: float(s.value_counts(normalize=True).iloc[0] * 100)),
        linha3_pct=("sis", lambda s: float(100 * np.mean(
            [str(x).startswith(("3", "5")) for x in s.dropna()]))),
        fidelidade_media=("sis_pct", "mean")).reset_index()
    ag = ag.merge(d80[["ano", "clube", "faixa"]], left_on=["ano", "Equipa"],
                  right_on=["ano", "clube"])
    testes = {}
    for col in ("sistemas_distintos", "trocas", "principal_pct", "linha3_pct", "fidelidade_media"):
        a = ag[col][ag.faixa == "sobe"]; b = ag[col][ag.faixa == "meio"]; c = ag[col][ag.faixa == "cai"]
        testes[col] = dict(m_sobe=r(a.mean(), 2), m_meio=r(b.mean(), 2), m_cai=r(c.mean(), 2),
                           d_SM=r(d_cohen(a, b), 3), p_SM=r(welch_p(a, b), 4),
                           d_SC=r(d_cohen(a, c), 3), p_SC=r(welch_p(a, c), 4))
    return dict(titulo_chave="etapa_15",
                tem_nome_de_treinador=False,
                bases_conferidas=formas,
                proxy_sistema=dict(
                    sistemas_reais=int(j.sis.dropna().nunique()),
                    sistemas_sem_regex=int(j.Sistema.nunique()),
                    trocas_medianas_em_38_jogos=r(ag.trocas.median(), 1),
                    testes=testes),
                coleta_que_resolveria=dict(
                    tabela="(ano, clube, treinador, data_inicio, data_fim)",
                    clube_temporada=100, passagens_estimadas=[250, 400],
                    fonte="ogol", raspador_existente="preparar_ogol.py / ogol_clubes.json",
                    perguntas_que_passariam_a_ser_respondiveis=[
                        "pontos por jogo antes/depois da troca, controlado por adversário e mando",
                        "se ppda (rho=0,129) e posse (rho=0,272) passam a persistir quando se "
                        "condiciona a permanência do técnico",
                        "quais técnicos aparecem em mais de uma promoção"]))


# ══════════════════════════════════════════════════════════════════════════════
#  main
# ══════════════════════════════════════════════════════════════════════════════

DECL = None
PERIODO = None


def main():
    global DECL, PERIODO
    t0 = dt.datetime.now()
    DECL = carregar_declaracao()
    print(f"lista pré-declarada: versão {DECL['versao']}")

    d100, d80 = carregar_painel()
    jog = carregar_jogos()
    tec = carregar_tecnico()
    elencos = pd.read_csv(os.path.join(RAIZ, "dados", "serieb_elencos.csv"), low_memory=False)
    raio = json.load(open(os.path.join(RAIZ, "dados", "raio_ref.json"), encoding="utf-8"))
    base_j = json.load(open(os.path.join(RAIZ, "dados", "jogadores.json"), encoding="utf-8"))
    PERIODO = base_j["periodo"]
    jogs = base_j["jogadores"]
    kpis = json.load(open(os.path.join(RAIZ, "dados", "kpis.json"), encoding="utf-8"))
    sc = G.carregar()
    print(f"painel {len(d80)} · jogos {len(jog)} · tecnico {len(tec)} · "
          f"skillcorner {len(sc)} · mercado {len(jogs)} ({PERIODO})")

    bruto, postos, meta, vazios, ns_ti = montar_matriz(d80, tec)
    print(f"matriz {bruto.shape[0]}x{bruto.shape[1]}")

    e4 = etapa_4(jog, meta)
    conf = {L["indicador"]: L.get("conf") for L in e4["linhas"]}
    e7 = etapa_7(jog, meta)
    temporal = {L["indicador"]: L for L in e7["linhas"]}
    pares = pares_consecutivos(d80)
    e6 = etapa_6(d80, postos, meta, pares)
    persist = e6["rho"]

    linhas_cat, resumo_fam, liq = etapa_2(d80, bruto, postos, meta, conf, temporal, persist, ns_ti)
    print("bootstrap por clube...")
    ics = bootstrap_por_clube(d80, postos, liq, list(postos.columns))
    for L in linhas_cat:
        L.update(ics[L["indicador"]])
    print("nulo do garimpo...")
    e3 = etapa_3(d80, postos, meta, linhas_cat, resumo_fam)
    e1 = etapa_1(d80, d100)   # d100 entra só pelo fora-da-amostra de 2026; médias são d80
    e5 = etapa_5(d80, bruto, postos, meta, vazios, ns_ti, tec)
    E, Z, itens_eixo = eixos_matriz(d80, postos)
    print("silhuetas e tipologia...")
    e8 = etapa_8(d80, postos, bruto, jog, Z, itens_eixo)
    e9 = etapa_9(d80, E, itens_eixo, postos, linhas_cat)
    e10 = etapa_10(d80, bruto, postos, linhas_cat)
    e11 = etapa_11(tec, sc)
    print("funil, encaixe e elencos...")
    e12, pool = etapa_12(jogs, elencos)
    corrigido = sobecai_corrigido(sc, raio)
    posto_val = {(int(a), c): int(p) for a, c, p in
                 zip(d80.ano, d80.clube, d80.groupby("ano").tm_valor_total.rank(ascending=False))}
    alvos = alvos_fisicos(sc, corrigido, posto_val)
    bt = backtest_nota(tec, sc, alvos)
    e13 = etapa_13(pool, jogs, kpis, alvos, bt)
    e14 = etapa_14(e13["candidatos"], d80, elencos)
    e15 = etapa_15(jog, d80, dict(
        serieb_clube_temporada_colunas=len(d100.columns),
        serieb_jogos_colunas=len(jog.columns) - 2,   # `pts` e `rod` são deste script
        serieb_tecnico_colunas=len(tec.columns) - 3,
        serieb_elencos_colunas=len(elencos.columns),
        jogadores_json_campos=len({c for x in jogs for c in x}),
        procurado_em="dados/*.csv, dados/*.json e os arquivos do ogol"))

    saida = {
        "_doc": ("Aba Protótipo, etapa por etapa. Só número medido: nenhuma frase escrita à "
                 "mão. Cada afirmação carrega o seu n, o seu p e o seu rho; onde o dado não "
                 "existe há null com motivo, nunca imputação."),
        "gerado_em": t0.strftime("%Y-%m-%d %H:%M"),
        "gerado_por": "gerar_prototipo.py",
        "semente": SEMENTE,
        "replicas": dict(bootstrap_clube=N_BOOT, garimpo=N_GARIMPO, nulo_silhueta=N_NULO,
                         jaccard=N_JACCARD, elencos=N_ELENCO, rapido=RAPIDO),
        "bases": dict(
            painel=dict(arquivo="dados/serieb_clube_temporada.csv", linhas=len(d100),
                        colunas=len(d100.columns), usadas=len(d80)),
            jogos=dict(arquivo="dados/serieb_jogos.csv", linhas_serie_b_2022_2025=len(jog),
                       filtro=COMP_SERIE_B),
            tecnico=dict(arquivo="dados/serieb_tecnico.csv", linhas=len(tec),
                         coluna_de_clube=COL_CLUBE_TEC),
            elencos=dict(arquivo="dados/serieb_elencos.csv", linhas=len(elencos)),
            skillcorner=dict(atleta_temporada=len(sc), corte="min_tot >= 300"),
            mercado=dict(arquivo="dados/jogadores.json", periodo=PERIODO, jogadores=len(jogs)),
            kpis=dict(arquivo="dados/kpis.json", kpis=len(kpis["kpis"]),
                      jogadores=len(kpis["jogadores"]))),
        "etapa_0": etapa_0(d100, d80, meta, e12["degraus"]),
        "etapa_1": e1,
        "etapa_2": dict(titulo_chave="etapa_2", comparacao_primaria="sobe x meio",
                        colunas=["indicador", "nome", "coluna_csv", "pilar", "familia", "n",
                                 "conf", "m_sobe", "m_meio", "m_cai", "r_sobe", "r_meio",
                                 "r_cai", "d_bruto_SM", "p_bruto_SM", "q_SM", "d_liq_SM",
                                 "p_liq_SM", "q_liq_SM", "d_bruto_SC", "q_SC", "ic_bruto",
                                 "ic_liq", "rho_persist", "rho_1T_2T", "porta"],
                        linhas=linhas_cat),
        "etapa_3": e3,
        "etapa_4": e4,
        "etapa_5": e5,
        "etapa_6": e6,
        "etapa_7": e7,
        "etapa_8": e8,
        "etapa_9": e9,
        "etapa_10": e10,
        "etapa_11": e11,
        "etapa_12": e12,
        "etapa_13": e13,
        "etapa_14": e14,
        "etapa_15": e15,
        "sobecai_corrigido_por_clube": corrigido,
        "controles_obrigatorios": dict(
            baseline_de_dinheiro=dict(auc=e1["auc_posto_de_valor"]["sobe_x_resto"],
                                      acertos_top4=e1["top4_de_valor"]["acertos"], de=16),
            coluna_liquida_em_toda_linha=True,
            assert_ano_max=int(d80.ano.max()),
            assert_filtro_competicao=COMP_SERIE_B),
    }
    json.dump(saida, open(SAIDA, "w", encoding="utf-8"), ensure_ascii=False,
              separators=(",", ":"), allow_nan=False)
    kb = os.path.getsize(SAIDA) / 1024
    print(f"gravado {SAIDA} ({kb:.0f} KB, {len(saida)} chaves) em "
          f"{(dt.datetime.now() - t0).seconds}s")


if __name__ == "__main__":
    main()
