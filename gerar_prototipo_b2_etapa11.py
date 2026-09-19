"""Bloco 2 do gerador, etapa 11 — "o teste da mala" regravado com a régua declarada.

Dono deste arquivo: o módulo da etapa 11 do bloco 2 (15/09/2026). Ele NÃO edita o
`gerar_prototipo.py`: importa o gerador como biblioteca e acrescenta ao dict `saida` (antes do
json.dump do main) só os caminhos de `CAMPOS`, que são os da ordem de serviço
(`_fonte/prototipo/sessao_14_09/ordem_gerador_bloco2.json`, rodada "bloco_2", caminho que
começa por `etapa_11`).

O que muda e por quê, em prosa:

- BUG-1 (físico ligado só pelo nome). O `etapa_11` do gerador junta o atleta de um ano com o do
  ano seguinte pelo nome curto. Entram pessoas diferentes com o mesmo nome e outra data de
  nascimento, e todas caem em "mudou de clube". A chave passa a ser nome + nascimento. Os dois
  números que o gerador já grava (`fisico.pares`, `fisico.rho_mediano`) são SOBRESCRITOS com a
  chave nova; antes disso a conta com a chave antiga é refeita aqui e comparada com o gravado,
  para provar que a conta é a mesma do gerador e só a chave mudou.
- Teste de cada par de anos (decisão 3 do dono, 14/09). Spearman de cada uma das 10 métricas
  declaradas em cada par (t, t+1), bilateral; `p_max` é o maior p. Gravado na régua declarada
  antes (posto no ano, `etapa_11.fisico`) e na régua do setor (`fisico.por_setor`).
- Técnico sem 2026 (BUG-2). O gerador já calcula sem 2026 e o JSON já tem os números; aqui a conta
  é refeita com o MESMO código do gerador e comparada campo a campo com o gravado (se divergir,
  para com erro), e só então entram os campos novos: `corte_minutos`, `pares_por_ano`, e o teste
  da diferença quem mudou x quem ficou por métrica (Fisher z com o fator 1,06 do Spearman, BH nas
  10), que precisa do ρ sem arredondar.
- Físico x técnico na mesma régua (`comparacao_fisico_tecnico`). Mesma população nas duas bases
  (par físico com 8+ jogos e par técnico com 900+ minutos no mesmo par de anos, com o mesmo
  "mudou"), posição x posição e setor x setor, bootstrap de atletas. A declaração diz que a
  comparação foi montada DEPOIS de olhar (`declarada_depois_de_olhar = true`), e isso vai junto.

Toda análise nova carrega o texto da declaração (`declaracoes_novas.json`,
`etapa_11_mesma_regua`) e `{universo, anos, n}`. Todo sorteio usa gerador próprio com a semente
declarada: `[SEMENTE, 11, 2]` no setor e `[SEMENTE, 11, 1]` na comparação. Nenhum `set` é iterado
sem `sorted`.
"""
import copy
import json
import os

import numpy as np
from scipy import stats

import gerar_prototipo as G

RAIZ = os.path.dirname(os.path.abspath(__file__))
DECLARACOES = os.path.join(RAIZ, "_fonte", "prototipo", "sessao_14_09", "declaracoes_novas.json")
NOME_DECL = "etapa_11_mesma_regua"

CAMPOS = [
    "etapa_11.fisico.chave_do_atleta",
    "etapa_11.fisico.corte_jogos",
    "etapa_11.fisico.pares",
    "etapa_11.fisico.rho_mediano",
    "etapa_11.fisico.p_max",
    "etapa_11.fisico.por_setor",
    "etapa_11.fisico.por_posicao",
    "etapa_11.efeito_de_retirar_2026.anos_usados_no_tecnico",
    "etapa_11.tecnico.corte_minutos",
    "etapa_11.tecnico.pares_mudou",
    "etapa_11.tecnico.pares_ficou",
    "etapa_11.tecnico.pares_por_ano",
    "etapa_11.tecnico.metricas[].rho_mudou",
    "etapa_11.tecnico.metricas[].rho_ficou",
    "etapa_11.tecnico.metricas[].p_dif_mudou_ficou",
    "etapa_11.tecnico.metricas[].q_dif",
    "etapa_11.comparacao_fisico_tecnico",
]
# Chaves irmãs que o FORMATO de um campo da ordem manda gravar junto (não são caminhos próprios da
# ordem, mas saem do texto do formato ou da regra "a declaração vai junto"). Listadas para quem
# confere o diff.
CAMPOS_EXTRAS = [
    "etapa_11.fisico.rho_mediano_por_par_de_anos",   # formato de etapa_11.fisico.p_max
    "etapa_11.fisico.metricas_fisicas",               # idem
    "etapa_11.fisico.n_metricas",                     # idem
    "etapa_11.fisico.n_testes",                       # idem
    "etapa_11.fisico.declaracao_teste_por_par",       # declaração da análise nova do p_max
    "etapa_11.tecnico.declaracao_dif_mudou_ficou",    # declaração da análise nova do p_dif/q_dif
]

# Os dois cortes do gerador estão escritos como número dentro do código de `etapa_11` e como
# texto em `fisico.corte` / `tecnico.corte`. O módulo não pode ler a variável local do gerador;
# por isso o int mora aqui UMA vez, e a gravação para com erro se ele não estiver no texto que o
# gerador gravou (BUG-18: um número só, nunca dois nomes que podem divergir).
CORTE_JOGOS = 8
CORTE_MIN_TEC = 900
ANO_MAXIMO = 2025
N_REPLICAS = 1000
FATOR_SPEARMAN = 1.06        # variância do z de Fisher do Spearman (Fieller, Hartley e Pearson)
# As 10 métricas técnicas do `etapa_11` do gerador, na ordem dele (conferidas contra o gravado).
METRICAS_TEC = ["Duelos/90", "Duelos aéreos/90", "Dribles/90", "Acelerações/90", "Remates/90",
                "Passes progressivos/90", "Passes recebidos/90", "Toques na área/90",
                "Golos esperados/90", "Passes chave/90"]


# ─────────────────────────────────────────────────────────────── utilidades
def _decl():
    return json.load(open(DECLARACOES, encoding="utf-8"))[NOME_DECL]


def _par(a):
    return f"{int(a)}→{int(a) + 1}"


def _setor_de(pos):
    cods = G.G.POSICOES.get(pos, [])
    return next((s for s in G.SETORES if any(c in G.G.SETOR_FUND[s] for c in cods)), None)


def _spearman(x, y):
    """(rho, p, n) do Spearman nas linhas com os dois lados finitos; rho None com n <= 8."""
    x, y = np.asarray(x, float), np.asarray(y, float)
    ok = np.isfinite(x) & np.isfinite(y)
    n = int(ok.sum())
    if n <= 8:
        return None, None, n
    res = stats.spearmanr(x[ok], y[ok])
    return float(res.statistic), float(res.pvalue), n


def _mediana_rho(df, pares_de_colunas):
    """Mediana dos ρ das métricas (a mesma estatística que o gerador grava em `rho_mediano`)."""
    rhos = [_spearman(df[a].values, df[b].values)[0] for a, b in pares_de_colunas]
    rhos = [x for x in rhos if x is not None]
    return float(np.median(rhos)) if rhos else None


def _rho_colunas(X, Y):
    """Spearman coluna a coluna de duas matrizes (linhas = pares), vetorizado; NaN tratado por coluna."""
    out = []
    for j in range(X.shape[1]):
        x, y = X[:, j], Y[:, j]
        ok = np.isfinite(x) & np.isfinite(y)
        if ok.sum() <= 8:
            out.append(np.nan)
            continue
        rx, ry = stats.rankdata(x[ok]), stats.rankdata(y[ok])
        rx, ry = rx - rx.mean(), ry - ry.mean()
        den = np.sqrt((rx * rx).sum() * (ry * ry).sum())
        out.append(float((rx * ry).sum() / den) if den > 0 else np.nan)
    return out


def _med(xs):
    xs = [x for x in xs if x is not None and np.isfinite(x)]
    return float(np.median(xs)) if xs else np.nan


def _ic(v):
    v = np.asarray(v, float)
    v = v[np.isfinite(v)]
    return [G.r(np.percentile(v, 2.5), 3), G.r(np.percentile(v, 97.5), 3)]


def _linhas_por_atleta(chaves):
    """Índices das linhas de cada atleta, atletas em ordem alfabética da chave (sem set iterado)."""
    grupos = {}
    for i, k in enumerate(chaves):
        grupos.setdefault(k, []).append(i)
    atletas = sorted(grupos)
    return atletas, [np.array(grupos[a], int) for a in atletas]


# ─────────────────────────────────────────────────────────────── físico
def _fisico_pares(sc25, metricas, chave):
    """Pares atleta t / t+1, com o corte e os postos do gerador; `chave` = 'nome' ou 'nome_nasc'.

    Com chave 'nome' é exatamente a conta do `etapa_11` do gerador (merge pelo nome, posto dentro
    do ano, matches >= 8). Os postos por setor e por posição são tirados no MESMO universo (depois
    do corte de 8 jogos, como a declaração pede).
    """
    s = sc25[sc25.matches >= CORTE_JOGOS].copy()
    nome = s.short_name.map(G.G.chave_nome)
    s["k"] = nome if chave == "nome" else nome + "|" + s.birthdate.astype(str)
    s["nome_k"] = nome
    s["setor"] = s.pos_wy.map(_setor_de)
    assert s.setor.notna().all(), "atleta do físico sem setor: o mapa POSICOES não cobre a posição"
    for c in metricas:
        s[f"ra_{c}"] = s.groupby("ano")[c].rank(pct=True) * 100
        s[f"rs_{c}"] = s.groupby(["ano", "setor"])[c].rank(pct=True) * 100
        s[f"rp_{c}"] = s.groupby(["ano", "pos_wy"])[c].rank(pct=True) * 100
    m = s.merge(s, on="k", suffixes=("", "_b"))
    m = m[m.ano_b == m.ano + 1].copy()
    m["mudou"] = (m.clube != m.clube_b).values
    return m.sort_values(["ano", "k"]).reset_index(drop=True)


def _teste_por_par(m, prefixo, metricas):
    """[{par, rho, p_max, n}] e o p_max geral: Spearman de cada métrica em cada par de anos."""
    lista, p_todos, rhos_min = [], [], []
    for a in sorted(int(x) for x in m.ano.unique()):
        sub = m[m.ano == a]
        rhos, ps, ns = [], [], []
        for c in metricas:
            rho, p, n = _spearman(sub[f"{prefixo}_{c}"].values, sub[f"{prefixo}_{c}_b"].values)
            if rho is None:
                raise SystemExit(f"etapa 11: {c} em {_par(a)} sem n para o teste ({n})")
            rhos.append(rho); ps.append(p); ns.append(n)
        p_todos.extend(ps)
        rhos_min.append(min(rhos))
        lista.append(dict(par=_par(a), rho=G.r(np.median(rhos), 3), p_max=G.r_p(max(ps)),
                          n=int(max(ns))))
    return lista, max(p_todos), len(p_todos), min(rhos_min)


def _bootstrap_setor(m, metricas, rng):
    cols_a = [f"rs_{c}" for c in metricas]
    X, Y = m[cols_a].values.astype(float), m[[f"{c}_b" for c in cols_a]].values.astype(float)
    mud = m.mudou.values
    atletas, idx = _linhas_por_atleta(m.k.values)
    tot, mu, fi, dif = [], [], [], []
    for _ in range(N_REPLICAS):
        esc = rng.integers(0, len(atletas), len(atletas))
        rows = np.concatenate([idx[i] for i in esc])
        t = _med(_rho_colunas(X[rows], Y[rows]))
        rm = rows[mud[rows]]
        rf = rows[~mud[rows]]
        a, b = _med(_rho_colunas(X[rm], Y[rm])), _med(_rho_colunas(X[rf], Y[rf]))
        tot.append(t); mu.append(a); fi.append(b); dif.append(b - a)
    return tot, mu, fi, dif


# ─────────────────────────────────────────────────────────────── técnico
def _tecnico_pares(tec25):
    """A conta do `etapa_11` do gerador para o técnico, linha a linha (mesmo filtro de homônimo,
    mesmo corte, mesmos postos), mais o posto por setor que a comparação físico x técnico usa."""
    t = tec25.copy()
    t["k"] = t.Jogador.map(G.A.chave_nome)
    bons = t.groupby(["ano", "k"]).filter(
        lambda g: g.clube.nunique() == 1 and g.posicao_1.nunique() == 1)
    bons = bons.drop_duplicates(["ano", "k"])
    bons = bons[bons["min"] >= CORTE_MIN_TEC].copy()
    for c in METRICAS_TEC:
        bons[f"r_{c}"] = bons.groupby(["ano", "posicao_1"])[c].rank(pct=True) * 100
        bons[f"rs_{c}"] = bons.groupby(["ano", "setor"])[c].rank(pct=True) * 100
    mm = bons.merge(bons, on="k", suffixes=("", "_b"))
    mm = mm[mm.ano_b == mm.ano + 1].copy()
    mm["mudou"] = (mm.clube != mm.clube_b).values
    return mm.sort_values(["ano", "k"]).reset_index(drop=True)


# ─────────────────────────────────────────────────────────────── aplicar
def aplicar(saida, ctx):
    decl = _decl()
    metricas = list(decl["metricas_fisicas"])
    e11 = saida["etapa_11"]
    tec, sc = ctx.get("tec25", ctx["tec"]), ctx.get("sc25", ctx["sc"])
    tec25 = tec[tec.ano <= ANO_MAXIMO]
    sc25 = sc[sc.ano <= ANO_MAXIMO]
    assert int(tec25.ano.max()) <= ANO_MAXIMO and int(sc25.ano.max()) <= ANO_MAXIMO

    # ---- guardas contra o que o gerador já gravou ----
    faltam = [c for c in metricas if c not in sc25.columns]
    if len(metricas) < 10 or faltam:
        raise SystemExit(f"etapa 11: n_metricas < 10 (declaradas {len(metricas)}, faltam {faltam})")
    assert sorted(metricas) == sorted(x["metrica"] for x in e11["fisico"]["metricas"]), \
        "as 10 métricas declaradas não são as do cols_fis do gerador"
    assert f"matches >= {CORTE_JOGOS}" in e11["fisico"]["corte"], e11["fisico"]["corte"]
    assert f"{CORTE_MIN_TEC}+ min" in e11["tecnico"]["corte"], e11["tecnico"]["corte"]
    assert [x["metrica"] for x in e11["tecnico"]["metricas"]] == METRICAS_TEC

    # ---- físico: a conta do gerador com a chave antiga reproduz o gravado ----
    m_nome = _fisico_pares(sc25, metricas, "nome")
    pares_ra = [(f"ra_{c}", f"ra_{c}_b") for c in metricas]
    gravado = {x["metrica"]: x["rho"] for x in e11["fisico"]["metricas"]}
    for c in metricas:
        assert G.r(_spearman(m_nome[f"ra_{c}"], m_nome[f"ra_{c}_b"])[0], 3) == gravado[c], c
    assert len(m_nome) == e11["fisico"]["pares"], (len(m_nome), e11["fisico"]["pares"])
    assert G.r(_mediana_rho(m_nome, pares_ra), 3) == e11["fisico"]["rho_mediano"]

    # ---- físico com a chave nome + nascimento ----
    m = _fisico_pares(sc25, metricas, "nome_nasc")
    anos_fis = [int(m.ano.min()), int(m.ano_b.max())]
    por_par_ano, pmax_ano, n_testes, _ = _teste_por_par(m, "ra", metricas)
    f = e11["fisico"]
    f["chave_do_atleta"] = "chave_nome(short_name) + '|' + birthdate"
    f["corte_jogos"] = CORTE_JOGOS
    f["pares"] = int(len(m))
    f["rho_mediano"] = G.r(_mediana_rho(m, pares_ra), 3)
    f["p_max"] = G.r_p(pmax_ano)
    f["rho_mediano_por_par_de_anos"] = por_par_ano
    f["metricas_fisicas"] = metricas
    f["n_metricas"] = len(metricas)
    f["n_testes"] = n_testes
    f["declaracao_teste_por_par"] = dict(
        declaracao=NOME_DECL, teste_por_par_de_anos=decl["teste_por_par_de_anos"],
        regua_repeticao=decl["regua_repeticao"], chave_do_atleta_fisico=decl["chave_do_atleta_fisico"],
        metricas_fisicas_regra=decl["metricas_fisicas_regra"])

    # régua do setor: descrição + teste por par + bootstrap de atletas [SEMENTE, 11, 2]
    pares_rs = [(f"rs_{c}", f"rs_{c}_b") for c in metricas]
    mud, fic = m[m.mudou], m[~m.mudou]
    por_par_setor, pmax_setor, n_testes_setor, _ = _teste_por_par(m, "rs", metricas)
    semente_setor = [G.SEMENTE, 11, 2]
    tot, bmu, bfi, bdif = _bootstrap_setor(m, metricas, np.random.default_rng(semente_setor))
    rho_mu, rho_fi = _mediana_rho(mud, pares_rs), _mediana_rho(fic, pares_rs)
    f["por_setor"] = dict(
        universo=("pares atleta t/t+1 da Série B no SkillCorner (300+ min rastreados), 8+ jogos nos "
                  "dois anos, atleta ligado por nome + nascimento; posto dentro de ano e setor "
                  "(G.SETOR_FUND x G.POSICOES), tirado depois do corte de 8 jogos"),
        anos=anos_fis, n=int(len(m)),
        rho_mediano=G.r(_mediana_rho(m, pares_rs), 3), ic95=_ic(tot),
        rho_mudou=G.r(rho_mu, 3), rho_ficou=G.r(rho_fi, 3),
        n_mudou=int(len(mud)), n_ficou=int(len(fic)),
        dif_ficou_menos_mudou=G.r(rho_fi - rho_mu, 3), ic95_dif=_ic(bdif),
        rho_mediano_por_par_de_anos=por_par_setor, p_max=G.r_p(pmax_setor), n_testes=n_testes_setor,
        bootstrap=dict(unidade="atleta", replicas=N_REPLICAS, semente=semente_setor,
                       estatistica="mediana dos 10 ρ de Spearman"),
        declaracao=dict(declaracao=NOME_DECL, fisico_por_setor=decl["fisico_por_setor"],
                        teste_por_par_de_anos=decl["teste_por_par_de_anos"],
                        regua_repeticao=decl["regua_repeticao"]))

    pares_rp = [(f"rp_{c}", f"rp_{c}_b") for c in metricas]
    f["por_posicao"] = dict(
        universo=("os mesmos pares de por_setor; posto dentro de ano e posição do Wyscout (pos_wy), "
                  "tirado depois do corte de 8 jogos"),
        anos=anos_fis, n=int(len(m)),
        rho_mediano=G.r(_mediana_rho(m, pares_rp), 3),
        rho_mudou=G.r(_mediana_rho(mud, pares_rp), 3),
        rho_ficou=G.r(_mediana_rho(fic, pares_rp), 3),
        declaracao=dict(declaracao=NOME_DECL, fisico_por_setor=decl["fisico_por_setor"]))

    # ---- técnico: a conta do gerador refeita e conferida contra o gravado ----
    mm = _tecnico_pares(tec25)
    t_mud, t_fic = mm[mm.mudou], mm[~mm.mudou]
    tg = e11["tecnico"]
    assert tg["pares_mudou"] == len(t_mud) and tg["pares_ficou"] == len(t_fic), \
        (tg["pares_mudou"], len(t_mud), tg["pares_ficou"], len(t_fic))
    anos_tec = sorted(int(a) for a in tec25.ano.unique())
    e11["efeito_de_retirar_2026"]["anos_usados_no_tecnico"] = anos_tec
    tg["corte_minutos"] = CORTE_MIN_TEC
    tg["pares_mudou"], tg["pares_ficou"] = int(len(t_mud)), int(len(t_fic))
    tg["pares_por_ano"] = [dict(par=_par(a), mudou=int((t_mud.ano == a).sum()),
                                ficou=int((t_fic.ano == a).sum()))
                           for a in sorted(int(x) for x in mm.ano.unique())]
    ps = []
    for linha in tg["metricas"]:
        c = linha["metrica"]
        r1, _, n1 = _spearman(t_mud[f"r_{c}"], t_mud[f"r_{c}_b"])
        r2, _, n2 = _spearman(t_fic[f"r_{c}"], t_fic[f"r_{c}_b"])
        assert G.r(r1, 3) == linha["rho_mudou"] and G.r(r2, 3) == linha["rho_ficou"], c
        assert n1 == linha["n_mudou"] and n2 == linha["n_ficou"], c
        linha["rho_mudou"], linha["rho_ficou"] = G.r(r1, 3), G.r(r2, 3)
        if r1 is None or r2 is None:
            p = None
        else:
            z = (np.arctanh(r1) - np.arctanh(r2)) / np.sqrt(
                FATOR_SPEARMAN / (n1 - 3) + FATOR_SPEARMAN / (n2 - 3))
            p = float(2 * stats.norm.sf(abs(z)))
        ps.append(p)
    qs = G.bh([np.nan if p is None else p for p in ps])
    for linha, p, q in zip(tg["metricas"], ps, qs):
        linha["p_dif_mudou_ficou"] = G.r_p(p)
        linha["q_dif"] = G.r_p(q) if np.isfinite(q) else None
    tg["declaracao_dif_mudou_ficou"] = dict(
        declaracao=NOME_DECL, tecnico_dif_mudou_ficou=decl["tecnico_dif_mudou_ficou"],
        tecnico=decl["tecnico"],
        como=("z = (atanh ρ_mudou − atanh ρ_ficou) / √(1,06/(n_mudou−3) + 1,06/(n_ficou−3)), "
              "bilateral, sobre o ρ sem arredondar; q de Benjamini-Hochberg nas 10 métricas"))

    # ---- físico x técnico na mesma régua ----
    fis_j = m[["k", "nome_k", "ano", "mudou"] + [f"{p}_{c}{s}" for p in ("rp", "rs") for c in metricas
                                                   for s in ("", "_b")]]
    tec_j = mm[["k", "ano", "mudou"] + [f"{p}_{c}{s}" for p in ("r", "rs") for c in METRICAS_TEC
                                       for s in ("", "_b")]].rename(columns={"k": "nome_k", "mudou": "mudou_tec"})
    j = fis_j.merge(tec_j, on=["nome_k", "ano"], how="inner")
    assert not j.duplicated(["k", "ano"]).any(), "atleta do físico casou com dois técnicos no mesmo par"
    n_discorda = int((j.mudou != j.mudou_tec).sum())
    j = j[j.mudou == j.mudou_tec].sort_values(["ano", "k"]).reset_index(drop=True)
    reguas = dict(posicao=("rp", "r"), setor=("rs", "rs"))
    semente_comp = [G.SEMENTE, 11, 1]
    rng = np.random.default_rng(semente_comp)
    comp = dict(
        universo=("atleta com par físico (8+ jogos, ligado por nome + nascimento) e par técnico "
                  "(900+ min, filtro de homônimo do gerador) no mesmo par de anos, com o mesmo "
                  "'mudou' nas duas bases; posto de cada base no seu próprio universo"),
        anos=[int(j.ano.min()), int(j.ano.max()) + 1], n=int(len(j)),
        pares_descartados_por_mudou_diferente=n_discorda,
        replicas=N_REPLICAS, semente=semente_comp,
        estatistica="mediana dos 10 ρ de Spearman de cada base; dif = físico − técnico",
        declaracao=dict(declaracao=NOME_DECL,
                        comparacao_fisico_tecnico=decl["comparacao_fisico_tecnico"],
                        declarada_depois_de_olhar=decl["declarada_depois_de_olhar"],
                        regua_repeticao=decl["regua_repeticao"]))
    for rot, flag in (("mudou", True), ("ficou", False)):
        g = j[j.mudou == flag].reset_index(drop=True)
        atletas, idx = _linhas_por_atleta(g.k.values)
        bloco = {}
        mats = {}
        for nome_r, (pf, pt) in reguas.items():
            XF = g[[f"{pf}_{c}" for c in metricas]].values.astype(float)
            YF = g[[f"{pf}_{c}_b" for c in metricas]].values.astype(float)
            XT = g[[f"{pt}_{c}" for c in METRICAS_TEC]].values.astype(float)
            YT = g[[f"{pt}_{c}_b" for c in METRICAS_TEC]].values.astype(float)
            mats[nome_r] = (XF, YF, XT, YT)
            rf, rt = _med(_rho_colunas(XF, YF)), _med(_rho_colunas(XT, YT))
            por_par = []
            for a in sorted(int(x) for x in g.ano.unique()):
                sel = (g.ano == a).values
                por_par.append(dict(par=_par(a), n=int(sel.sum()),
                                    dif=G.r(_med(_rho_colunas(XF[sel], YF[sel]))
                                            - _med(_rho_colunas(XT[sel], YT[sel])), 3)))
            bloco[nome_r] = dict(n=int(len(g)), rho_fisico=G.r(rf, 3), rho_tecnico=G.r(rt, 3),
                                 dif=G.r(rf - rt, 3), por_par_de_anos=por_par, _pt=rf - rt)
        # uma reamostragem de atletas por réplica, a mesma para as duas réguas do grupo
        difs = {k: [] for k in reguas}
        for _ in range(N_REPLICAS):
            esc = rng.integers(0, len(atletas), len(atletas))
            rows = np.concatenate([idx[i] for i in esc])
            for nome_r in reguas:
                XF, YF, XT, YT = mats[nome_r]
                difs[nome_r].append(_med(_rho_colunas(XF[rows], YF[rows]))
                                    - _med(_rho_colunas(XT[rows], YT[rows])))
        for nome_r in reguas:
            b = bloco[nome_r]
            b.pop("_pt")
            d = np.asarray(difs[nome_r], float)
            b["ic95"] = _ic(d)
            b["frac_menor_igual_zero"] = G.r(float(np.mean(d[np.isfinite(d)] <= 0)), 3)
        comp[rot] = bloco
    e11["comparacao_fisico_tecnico"] = comp
    return list(CAMPOS)


# ─────────────────────────────────────────────────────────────── teste
def saida_gravada():
    return json.load(open(G.SAIDA, encoding="utf-8"))


def ctx_de_teste():
    """O que o main teria em variável local, sem rodar o main: `tec` (carregar_tecnico) e `sc`
    (gerar_raio_serieb.carregar). A saída gravada vai em ctx['saida_gravada'] para o teste."""
    G.DECL = G.carregar_declaracao()
    return dict(G=G, tec=G.carregar_tecnico(), sc=G.G.carregar(),
                saida_gravada=saida_gravada())


if __name__ == "__main__":
    import sys
    ctx = ctx_de_teste()
    s = copy.deepcopy(ctx["saida_gravada"])
    feitos = aplicar(s, ctx)
    destino = sys.argv[1] if len(sys.argv) > 1 else None
    if destino:
        json.dump(s, open(destino, "w", encoding="utf-8"), ensure_ascii=False,
                  separators=(",", ":"), allow_nan=False)
    print(json.dumps({k: s["etapa_11"][k] for k in ("fisico", "comparacao_fisico_tecnico")},
                     ensure_ascii=False, indent=1)[:6000])
    print(len(feitos), "campos")
