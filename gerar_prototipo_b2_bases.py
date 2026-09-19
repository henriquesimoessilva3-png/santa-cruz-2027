"""Bloco 2 do gerador, módulo das BASES e das etapas 0, 6, 7, 8, 13 e 15.

Ordem de serviço: `_fonte/prototipo/sessao_14_09/ordem_gerador_bloco2.json`, campos com
`rodada = bloco_2` cujo caminho começa por bases., etapa_0., etapa_6., etapa_7., etapa_8.,
etapa_13. ou etapa_15. São 16. Este arquivo tem um dono só e NUNCA edita `gerar_prototipo.py`:
importa o gerador como biblioteca e acrescenta, no dicionário que o `main` já montou (antes do
`json.dump`), só os caminhos da lista `CAMPOS`.

Contrato:
    CAMPOS          os caminhos exatos que este módulo grava
    aplicar(saida, ctx) -> lista de caminhos gravados (ou conferidos, quando o bloco 1 já grava)
    ctx_de_teste()  monta o ctx sem rodar o main inteiro

Do ctx este módulo usa (nomes das variáveis locais do `main`): `G` (o módulo gerar_prototipo),
`d80`, `jog`, `tec`, `meta` e, se houver, `ns_ti`. Tudo o mais é lido da própria `saida`, que é
o que o gerador já calculou (etapa_1, etapa_7, etapa_8.tipologia, etapa_13.candidatos, bases).

Regras da casa que moram aqui:
- nenhum número digitado: cortes, sementes, faixas e períodos saem do código do gerador, do
  arquivo congelado do teste cego ou do texto da declaração, e o que é lido de texto é
  conferido com assert;
- análise nova declarada antes de medir: a declaração do campo vai junto no JSON (chave
  `declaracao`, com o arquivo, a versão e o texto inteiro);
- sorteio com gerador próprio e semente declarada (etapa 7: [SEMENTE, 7, 1]), nunca o `rng`
  global — senão uma etapa nova deslocaria os sorteios das seguintes;
- set iterado vira `sorted`; ausência vai com motivo, nunca com número inventado.
"""
import copy
import hashlib
import inspect
import json
import os
import re

import numpy as np
import pandas as pd
from scipy import stats

import gerar_prototipo as G

CAMPOS = [
    "bases.painel_2018_2021.usadas",
    "bases.painel_2018_2021.rotulo",
    "bases.painel_2018_2021.sha256",
    "bases.origem",
    "bases.teste_cego",
    "bases.skillcorner.corte_minutos",
    "bases.tecnico_ind.corte_minutos",
    "etapa_6.colocacao",
    "etapa_7.excesso",
    "etapa_8.tipologia.bateria_limpa.por_conjunto_de_validadores",
    "etapa_8.tipologia.fora_do_top_k",
    "etapa_8.teste_cego.diferenca_entre_blocos",
    "etapa_0.mando",
    "etapa_13.empates_na_margem",
    "etapa_15.proxy_sistema.formacao_principal_por_faixa",
    "etapa_8.teste_cego.familia_dos_eixos",
]

# Caminhos relativos à raiz do projeto. São nomes de arquivo, não números.
ARQ_PAINEL_ANTIGO = "dados/serieb_clube_temporada_2018_2021.csv"
ARQ_ORIGEM = "dados/serieb_origem_2018_2026.csv"
ARQ_TESTE_CEGO = "_fonte/prototipo/teste_cego_2018_2021.json"
ARQ_DECLARACOES = "_fonte/prototipo/sessao_14_09/declaracoes_novas.json"
ARQ_TIPOLOGIA = "_fonte/prototipo/TIPOLOGIA.md"

# Os que o bloco 1 já grava e este módulo só confere (não reescreve).
CONFERIDOS_SEM_ESCREVER = []


# ══════════════════════════════════════════════════════════════════════════════
#  utilitários
# ══════════════════════════════════════════════════════════════════════════════

def _abs(rel):
    return os.path.join(G.RAIZ, rel)


def _sha256(rel):
    h = hashlib.sha256()
    with open(_abs(rel), "rb") as f:
        for bloco in iter(lambda: f.read(1 << 20), b""):
            h.update(bloco)
    return h.hexdigest()


def _pegar(saida, caminho):
    o = saida
    for k in caminho.split("."):
        if not isinstance(o, dict) or k not in o:
            return None, False
        o = o[k]
    return o, True


def _gravar(saida, caminho, valor):
    """Acrescenta `valor` em `caminho`. Cria só os dicionários intermediários que faltam e
    quebra se a chave final já existir: este módulo não muda chave nenhuma do bloco 1."""
    partes = caminho.split(".")
    o = saida
    for k in partes[:-1]:
        if k not in o:
            o[k] = {}
        assert isinstance(o[k], dict), (caminho, k)
        o = o[k]
    assert partes[-1] not in o, f"{caminho} já existe no JSON: este módulo não sobrescreve"
    o[partes[-1]] = valor


def _num(x):
    """Contagem de sorteio para o JSON: int quando é inteira, senão 1 casa."""
    v = float(x)
    return int(v) if v.is_integer() else G.r(v, 1)


def _declaracoes():
    return json.load(open(_abs(ARQ_DECLARACOES), encoding="utf-8"))


def _declaracao(chave):
    """A declaração do campo, inteira, com a origem. Vai ao JSON ao lado do número."""
    d = _declaracoes()
    assert chave in d, f"declaração {chave} não existe em {ARQ_DECLARACOES}"
    return dict(chave=chave, arquivo=ARQ_DECLARACOES, versao=d.get("versao"),
                texto=copy.deepcopy(d[chave]))


def _teste_cego():
    return json.load(open(_abs(ARQ_TESTE_CEGO), encoding="utf-8"))


# ══════════════════════════════════════════════════════════════════════════════
#  bases
# ══════════════════════════════════════════════════════════════════════════════

def _bases(saida, ctx, gravados):
    # --- painel 2018-2021: usadas (bloco 1), rótulo e hash ---
    dv = pd.read_csv(_abs(ARQ_PAINEL_ANTIGO))
    usadas = int((dv.ano <= 2025).sum())      # a mesma leitura do main (dv com ano <= 2025)
    anos = sorted(int(a) for a in dv[dv.ano <= 2025].ano.unique())
    atual, existe = _pegar(saida, "bases.painel_2018_2021.usadas")
    if existe:
        # O main do bloco 1 já grava `usadas` com esta mesma leitura: aqui só se confere.
        assert atual == usadas, ("bases.painel_2018_2021.usadas diverge", atual, usadas)
        CONFERIDOS_SEM_ESCREVER.append("bases.painel_2018_2021.usadas")
    else:
        _gravar(saida, "bases.painel_2018_2021.usadas", usadas)
    gravados.append("bases.painel_2018_2021.usadas")
    anos_gravados, tem_anos = _pegar(saida, "bases.painel_2018_2021.anos")
    if tem_anos:
        assert anos_gravados == anos, (anos_gravados, anos)
    _gravar(saida, "bases.painel_2018_2021.rotulo", f"{min(anos)}-{max(anos)}")
    gravados.append("bases.painel_2018_2021.rotulo")
    _gravar(saida, "bases.painel_2018_2021.sha256", _sha256(ARQ_PAINEL_ANTIGO))
    gravados.append("bases.painel_2018_2021.sha256")

    # --- origem dos clubes, base pública ---
    ori = pd.read_csv(_abs(ARQ_ORIGEM))
    _gravar(saida, "bases.origem", dict(arquivo=ARQ_ORIGEM, linhas=int(len(ori)),
                                        sha256=_sha256(ARQ_ORIGEM)))
    gravados.append("bases.origem")

    # --- teste cego: só leitura e hash; o gerador nunca escreve nele ---
    _gravar(saida, "bases.teste_cego", dict(arquivo=ARQ_TESTE_CEGO, sha256=_sha256(ARQ_TESTE_CEGO),
                                            congelado=True))
    gravados.append("bases.teste_cego")

    # --- corte de minutos do SkillCorner ---
    # O número é a constante que o carregador do SkillCorner usa de fato (gerar_raio_serieb,
    # `sc.min_tot >= MIN_RASTREADOS`); o texto que o bloco 1 grava em `bases.skillcorner.corte`
    # é literal no main, então o assert confere que os dois dizem o mesmo número.
    raio = G.G
    assert "min_tot >= MIN_RASTREADOS" in inspect.getsource(raio.carregar), \
        "o carregador do SkillCorner deixou de cortar por MIN_RASTREADOS"
    corte_sc = int(raio.MIN_RASTREADOS)
    texto, tem = _pegar(saida, "bases.skillcorner.corte")
    assert tem and re.search(r">=\s*%d\b" % corte_sc, texto), (texto, corte_sc)
    _gravar(saida, "bases.skillcorner.corte_minutos", corte_sc)
    gravados.append("bases.skillcorner.corte_minutos")

    # --- corte de minutos do técnico individual agregado por setor ---
    # O corte está escrito dentro de `agrega_tecnico_individual`; lê-se de lá (uma ocorrência
    # só) e confere-se contra a unidade que `montar_matriz` grava em cada coluna ti_*.
    fonte = inspect.getsource(G.agrega_tecnico_individual)
    achados = re.findall(r'tec\["min"\]\s*>=\s*(\d+)', fonte)
    assert len(achados) == 1, achados
    corte_ti = int(achados[0])
    unidades = sorted({m["unidade_n"] for m in ctx["meta"].values() if m["familia"] == "tecnico_ind"})
    assert unidades == [f"atleta com {corte_ti}+ min"], unidades
    if ctx.get("ns_ti") is not None:
        tec = ctx["tec"]
        t = tec[(tec.ano <= 2025) & (tec["min"] >= corte_ti) & (tec.posicao_1 != "GK")
                & tec.setor.notna()]
        assert int(sum(ctx["ns_ti"].values())) == len(t), "ns_ti não bate com o corte lido"
    _gravar(saida, "bases.tecnico_ind.corte_minutos", corte_ti)
    gravados.append("bases.tecnico_ind.corte_minutos")


# ══════════════════════════════════════════════════════════════════════════════
#  etapa 0 — mando de campo por período (A4)
# ══════════════════════════════════════════════════════════════════════════════

def _etapa_0_mando(saida, ctx, gravados):
    """t de Welch com o ANO como unidade (4 x 4) sobre `regime[].pct_pts_casa` do teste cego.

    A comparação entre períodos foi notada depois de olhar (o critério declarado antes era o
    ano sem torcida), e isso vai escrito: `comparacao_declarada_antes: false`. O teste cego é
    congelado e só é lido; a conta nova mora aqui, no prototipo.json.
    """
    tc = _teste_cego()
    reg = {int(x["ano"]): float(x["pct_pts_casa"]) for x in tc["regime"]}
    anos_antigos, _ = _pegar(saida, "bases.painel_2018_2021.anos")
    anos_recentes = sorted(int(a) for a in ctx["d80"].ano.unique())
    a = np.array([reg[y] for y in anos_antigos])
    b = np.array([reg[y] for y in anos_recentes])
    assert len(a) == len(b), (anos_antigos, anos_recentes)
    w = stats.ttest_ind(b, a, equal_var=False)
    va, vb = a.var(ddof=1) / len(a), b.var(ddof=1) / len(b)
    gl = (va + vb) ** 2 / (va ** 2 / (len(a) - 1) + vb ** 2 / (len(b) - 1))
    s = stats.ttest_ind(b, a)
    mw = stats.mannwhitneyu(b, a, alternative="two-sided")
    rot_a = f"{min(anos_antigos)}_{max(anos_antigos)}"
    rot_b = f"{min(anos_recentes)}_{max(anos_recentes)}"
    assert (rot_a, rot_b) == ("2018_2021", "2022_2025"), (rot_a, rot_b)  # nomes do contrato
    bloco = {
        "universo": ("jogos da Série B por ano, %% dos pontos que ficaram com o mandante; o ano é a "
                     "unidade (%d anos de cada lado)" % len(a)),
        "anos": [min(anos_antigos), max(anos_recentes)],
        "n": int(len(a) + len(b)),
        f"media_{rot_a}": G.r(a.mean(), 2),
        f"media_{rot_b}": G.r(b.mean(), 2),
        "n_anos_por_lado": int(len(a)),
        "por_ano": {str(y): reg[y] for y in anos_antigos + anos_recentes},
        "t": G.r(w.statistic, 3),
        "gl": G.r(gl, 2),
        "p_bloco_por_ano": G.r_p(w.pvalue, 4),
        "p_student": G.r_p(s.pvalue, 4),
        "p_mann_whitney": G.r_p(mw.pvalue, 4),
        "sentido": "t e medias: 2022-2025 menos 2018-2021",
        "comparacao_declarada_antes": False,
        "fonte": ARQ_TESTE_CEGO + " regime[].pct_pts_casa (só leitura)",
        "declaracao": _declaracao("A4_mando"),
    }
    _gravar(saida, "etapa_0.mando", bloco)
    gravados.append("etapa_0.mando")


# ══════════════════════════════════════════════════════════════════════════════
#  etapa 6 — colocação de um ano contra o seguinte (ELE-06)
# ══════════════════════════════════════════════════════════════════════════════

def _etapa_6_colocacao(saida, ctx, gravados):
    """Pares (clube, t) e (clube, t+1) na Série B, painel 2018-2021 + 2022-2025, t+1 <= 2025.

    O ASSUNTO da ELE-06 é a repetição do clube; por isso ela fica com selo, e o ano seguinte aqui
    é o achado, não critério de outra conclusão. Declarada DEPOIS de olhar, e isso vai escrito.
    Os períodos de t e as faixas de posição saem do texto da declaração, não de número digitado.
    O valor do elenco é só descrição (Spearman do valor cru t x t+1), não entra em selo.
    """
    dec = _declaracao("colocacao_t_t1")
    txt = dec["texto"]
    periodos = [tuple(int(x) for x in p) for p in txt["por_periodo_de_t"]]
    linha_faixas = [m for m in txt["medidas"] if "faixa de posição" in m]
    assert len(linha_faixas) == 1, txt["medidas"]
    faixas = [(int(i), int(f)) for i, f in re.findall(r"(\d+)-(\d+)", linha_faixas[0])]
    linha_fisher = [m for m in txt["medidas"] if m.startswith("Fisher")]
    assert len(linha_fisher) == 1
    fisher_par = [(int(i), int(f)) for i, f in re.findall(r"(\d+)-(\d+)", linha_fisher[0])]
    assert len(fisher_par) == 2 and all(p in faixas for p in fisher_par), fisher_par

    d80 = ctx["d80"]
    dv = pd.read_csv(_abs(ARQ_PAINEL_ANTIGO))
    dv = dv[dv.ano <= 2025]
    cols = ["ano", "clube", "pos", "pts", "J", "faixa"]
    x = pd.concat([dv[cols].assign(tm_valor_total=np.nan), d80[cols + ["tm_valor_total"]]],
                  ignore_index=True)
    assert int(x.ano.max()) <= 2025
    assert not x.duplicated(["ano", "clube"]).any()
    x["aprov"] = x.pts / (3 * x.J)
    idx = {(int(a), c): i for i, (a, c) in enumerate(zip(x.ano, x.clube))}
    linhas = []
    for (a, c) in sorted(idx):
        j = idx.get((a + 1, c))
        if j is None:
            continue
        i = idx[(a, c)]
        linhas.append(dict(t=a, clube=c, pos_t=int(x.pos[i]), pos_t1=int(x.pos[j]),
                           ap_t=float(x.aprov[i]), ap_t1=float(x.aprov[j]),
                           faixa_t1=x.faixa[j], v_t=float(x.tm_valor_total[i]),
                           v_t1=float(x.tm_valor_total[j])))
    P = pd.DataFrame(linhas)
    # quem subiu ou caiu em t sai da Série B e não forma par: a posição em t fica entre as faixas
    assert P.pos_t.min() >= min(f[0] for f in faixas) and P.pos_t.max() <= max(f[1] for f in faixas), \
        (P.pos_t.min(), P.pos_t.max())

    def sp(u, v):
        res = stats.spearmanr(u, v)
        return G.r(res.statistic, 3), G.r_p(res.pvalue, 4)

    rho_pos, p_pos = sp(P.pos_t, P.pos_t1)
    rho_ap, p_ap = sp(P.ap_t, P.ap_t1)
    por_periodo = []
    for ini, fim in periodos:
        s = P[(P.t >= ini) & (P.t <= fim)]
        rp, pp = sp(s.pos_t, s.pos_t1)
        ra, pa = sp(s.ap_t, s.ap_t1)
        por_periodo.append(dict(t=[ini, fim], n=int(len(s)), rho_posicao=rp, p_posicao=pp,
                                rho_aproveitamento=ra, p_aproveitamento=pa))
    por_faixa = {}
    for ini, fim in faixas:
        s = P[(P.pos_t >= ini) & (P.pos_t <= fim)]
        por_faixa[f"n_{ini}_{fim}"] = int(len(s))
        por_faixa[f"sub_{ini}_{fim}"] = int((s.faixa_t1 == "sobe").sum())
        por_faixa[f"cai_{ini}_{fim}"] = int((s.faixa_t1 == "cai").sum())
    (ia, fa), (ib, fb) = fisher_par
    for evento, rot in (("sobe", "sub"), ("cai", "cai")):
        tab = []
        for ini, fim in fisher_par:
            s = P[(P.pos_t >= ini) & (P.pos_t <= fim)]
            k = int((s.faixa_t1 == evento).sum())
            tab.append([k, int(len(s)) - k])
        por_faixa[f"fisher_{rot}_{ia}_{fa}_x_{ib}_{fb}_p"] = G.r_p(stats.fisher_exact(tab)[1], 4)
    V = P[np.isfinite(P.v_t) & np.isfinite(P.v_t1)]
    rho_v, _ = sp(V.v_t, V.v_t1)
    rho_pv, p_pv = sp(V.pos_t, V.pos_t1)
    bloco = dict(
        universo=("clubes na Série B em t e em t+1, t+1 <= 2025, painel 2018-2021 + 2022-2025; "
                  "quem subiu ou caiu em t não forma par"),
        anos=[int(P.t.min()), int(P.t.max()) + 1],
        n=int(len(P)),
        n_pares=int(len(P)),
        rho_posicao=rho_pos, p_posicao=p_pos,
        rho_aproveitamento=rho_ap, p_aproveitamento=p_ap,
        aproveitamento="pts / (3 × J) do ano",
        conta_principal=txt.get("conta_principal"),
        por_periodo=por_periodo,
        por_faixa_de_posicao=por_faixa,
        n_pares_com_valor=int(len(V)),
        rho_valor=rho_v,
        valor_so_descricao="Spearman de tm_valor_total cru em t contra t+1; não entra na regra do selo",
        rho_posicao_nos_pares_com_valor=rho_pv,
        p_posicao_nos_pares_com_valor=p_pv,
        declarada_depois_de_olhar=bool(txt.get("declarada_depois_de_olhar")),
        declaracao=dec)
    _gravar(saida, "etapa_6.colocacao", bloco)
    gravados.append("etapa_6.colocacao")


# ══════════════════════════════════════════════════════════════════════════════
#  etapa 7 — a lista dos números do 1º turno contra o sorteio (J8)
# ══════════════════════════════════════════════════════════════════════════════

def _etapa_7_excesso(saida, ctx, gravados):
    """Freedman-Lane dentro do ano, como a declaração `etapa_7_excesso` manda.

    Resíduo do posto dos pontos do 2º turno sobre o posto do 1º (OLS), permutado dentro do ano
    e somado de volta aos ajustados; cada clube-temporada leva os números de jogo juntos; em
    cada sorteio recalcula-se a parcial de Spearman de todos. Duas contagens: p parcial < 0,05
    sem olhar o sinal (a da régua) e com o sinal certo. Gerador próprio com a semente escrita na
    declaração; o sorteio global do gerador não é tocado.
    """
    dec = _declaracao("etapa_7_excesso")
    txt = dec["texto"]
    m = re.fullmatch(r"np\.random\.default_rng\(\[SEMENTE,\s*(\d+),\s*(\d+)\]\)", txt["semente"].strip())
    assert m, txt["semente"]
    semente = [int(G.SEMENTE), int(m.group(1)), int(m.group(2))]
    n_sort = int(txt["sorteios"])
    alfa = G.ALFA_SORTE

    jog, meta = ctx["jog"], ctx["meta"]
    p1 = jog[jog.rod < 19].groupby(["ano", "Equipa"]).pts.sum().rename("pts1")
    p2 = jog[jog.rod >= 19].groupby(["ano", "Equipa"]).pts.sum().rename("pts2")
    base = pd.concat([p1, p2], axis=1).reset_index().rename(columns={"Equipa": "clube"})
    base["r1"] = G.posto_ano(base, "pts1")
    base["r2"] = G.posto_ano(base, "pts2")
    base = base.sort_values(["ano", "clube"]).reset_index(drop=True)   # ordem fixa antes de sortear

    e7 = {L["indicador"]: L for L in saida["etapa_7"]["linhas"]}
    inds, sinais, cols_rv = [], [], []
    for ind, mt in meta.items():                      # a mesma iteração de `etapa_7`
        col = mt.get("jogo")
        if not col or col not in jog.columns:
            continue
        v = pd.to_numeric(jog[col], errors="coerce")
        m1 = (pd.DataFrame(dict(ano=jog.ano, clube=jog.Equipa, rod=jog.rod, v=v))
              .query("rod < 19").groupby(["ano", "clube"]).v.mean().rename("v1"))
        t = base[["ano", "clube"]].merge(m1, on=["ano", "clube"], how="left")
        assert len(t) == len(base) and t.v1.notna().all(), ind
        rv = G.posto_ano(t, "v1").values
        # o p parcial observado, pela MESMA função da etapa 7, tem de bater com o gravado
        pr, pp = G.parcial_spearman(rv, base.r2.values, base.r1.values)
        assert e7[ind]["p_parcial"] == G.r_p(pp, 4), (ind, e7[ind]["p_parcial"], pp)
        inds.append(ind)
        sinais.append(mt["sinal"] or 0)
        cols_rv.append(rv)
    assert sorted(inds) == sorted(e7), "a lista não é a da etapa 7"
    sinais = np.array(sinais)

    rk = stats.rankdata
    r1 = rk(base.r1.values)
    Vk = np.column_stack([rk(c) for c in cols_rv])

    def resid(y, xx):
        X = np.column_stack([np.ones(len(y)), xx])
        b, *_ = np.linalg.lstsq(X, y, rcond=None)
        return y - X @ b, X @ b

    Vr = np.column_stack([resid(Vk[:, j], r1)[0] for j in range(Vk.shape[1])])
    n = len(base)

    def contagem(r2):
        y = resid(rk(r2), r1)[0]
        rp = (Vr.T @ y) / np.sqrt((Vr ** 2).sum(0) * (y ** 2).sum())
        tt = rp * np.sqrt((n - 3) / (1 - rp ** 2))
        p = 2 * stats.t.sf(np.abs(tt), n - 3)
        passa = p < alfa
        return int(passa.sum()), int((passa & (np.sign(rp) == np.sign(sinais))).sum()), p, rp

    obs_sem, obs_certo, p_obs, rp_obs = contagem(base.r2.values)
    # a conta vetorizada tem de dar o p parcial da etapa 7, linha a linha
    for j, ind in enumerate(inds):
        assert e7[ind]["p_parcial"] == G.r_p(p_obs[j], 4), (ind, p_obs[j])
        assert e7[ind]["sinal_certo"] == bool(sinais[j] and np.sign(rp_obs[j]) == np.sign(sinais[j])), ind
    lista_sem = sorted(ind for j, ind in enumerate(inds) if p_obs[j] < alfa)
    lista_certo = sorted(ind for j, ind in enumerate(inds)
                         if p_obs[j] < alfa and sinais[j] and np.sign(rp_obs[j]) == np.sign(sinais[j]))

    eps, fit = resid(base.r2.values.astype(float), base.r1.values.astype(float))
    gen = np.random.default_rng(semente)
    grupos = [np.where(base.ano.values == a)[0] for a in sorted(base.ano.unique())]
    nul_sem, nul_certo = np.empty(n_sort, int), np.empty(n_sort, int)
    for i in range(n_sort):
        e = eps.copy()
        for gi in grupos:
            e[gi] = gen.permutation(eps[gi])
        nul_sem[i], nul_certo[i], _, _ = contagem(fit + e)

    def resumo(nul, obs, lista):
        p = (1 + int((nul >= obs).sum())) / (n_sort + 1)
        return dict(observado=int(obs), nulo_mediana=_num(np.median(nul)),
                    nulo_p95=_num(np.percentile(nul, 95)), p_excesso=G.r_p(p, 4),
                    erro_monte_carlo=G.r(np.sqrt(p * (1 - p) / n_sort), 4),
                    sorteios=n_sort, semente=semente, lista=G.chave_lista(p),
                    indicadores=lista)

    bloco = dict(
        universo=("clube-temporadas da Série B, números de jogo do 1º turno contra os pontos do "
                  "2º turno, descontados os pontos do 1º (parcial de Spearman)"),
        anos=[int(base.ano.min()), int(base.ano.max())],
        n=int(n),
        testes=len(inds),
        corte_p=alfa,
        sem_sinal=resumo(nul_sem, obs_sem, lista_sem),
        sinal_certo=resumo(nul_certo, obs_certo, lista_certo),
        nulo=txt["nulo"],
        declarada_depois_de_olhar=bool(txt.get("declarada_depois_de_olhar")),
        declaracao=dec)
    _gravar(saida, "etapa_7.excesso", bloco)
    gravados.append("etapa_7.excesso")


# ══════════════════════════════════════════════════════════════════════════════
#  etapa 8 — tipologia e teste cego (J9, J16, A1, A3)
# ══════════════════════════════════════════════════════════════════════════════

def _bateria_por_conjunto(saida, ctx, gravados):
    """A bateria limpa com cada conjunto de validadores, sem conciliar os três.

    22 validadores pelo critério do gerador (a conta desta rodada, lida da própria etapa 8);
    22 no teste cego congelado (2022-2025); 23 da TIPOLOGIA.md, que publica um p só — lido do
    texto por expressão regular, com assert, e registrado como o do placebo (é como a J9 e a
    tabela do documento o comparam com o 0,035 do placebo do gerador). O p do rótulo sorteado
    dos 23 não foi publicado: fica null com motivo.
    """
    bl = saida["etapa_8"]["tipologia"]["bateria_limpa"]
    tc = _teste_cego()["bateria_limpa"]["2022-2025"]
    md = open(_abs(ARQ_TIPOLOGIA), encoding="utf-8").read()
    achados = re.findall(r"com (\d+) validadores: eta² ([\d,]+) contra ([\d,]+), \*\*p=([\d,]+)", md)
    assert len(achados) == 1, achados
    n23, _, _, p23 = achados[0]
    lista = [
        dict(n_validadores=int(bl["validadores"]),
             fonte="gerar_prototipo.py, etapa_8.tipologia.bateria_limpa (esta rodada)",
             p=bl["p"], p_placebo=bl["p_placebo"]),
        dict(n_validadores=int(tc["n_validadores"]),
             fonte=ARQ_TESTE_CEGO + " bateria_limpa.2022-2025 (congelado)",
             p=tc["p_rotulo"], p_placebo=tc["p_placebo"]),
        dict(n_validadores=int(n23),
             fonte=ARQ_TIPOLOGIA + " (tabela do veredito, bateria limpa)",
             p=None, p_placebo=float(p23.replace(",", ".")),
             motivo_p=("o documento publica um p só para os 23 validadores; ele é registrado como "
                       "p_placebo, e o do rótulo sorteado não foi publicado")),
    ]
    _gravar(saida, "etapa_8.tipologia.bateria_limpa.por_conjunto_de_validadores", lista)
    gravados.append("etapa_8.tipologia.bateria_limpa.por_conjunto_de_validadores")


def _fora_do_top_k(saida, ctx, gravados):
    """Os promovidos com elenco fora do top k do valor, contra o eixo de território dos 16.

    k = o do palpite do dono (etapa_1.curva_top_k.palpite_do_dono.k); a mediana é o corte de
    território que a tipologia usa (mediana dos 16); hipergeométrica: dos 16, quantos ficam
    abaixo do corte, e a chance de pelo menos `abaixo` dos `n_fora` caírem lá (com todos abaixo
    é C(8,a)/C(16,a), a fórmula declarada). A linha foi escolhida depois de olhar, e isso vai
    escrito. `caros_nos_mesmos_estilos`: promovidos dos mesmos grupos com posto de valor até o
    tamanho do quartil de cima do ano.
    """
    dec = _declaracao("fora_do_top_k_J16")
    e1 = saida["etapa_1"]
    k = int(e1["curva_top_k"]["palpite_do_dono"]["k"])
    q4 = [q for q in e1["quartis"] if q["quartil"] == 4]
    assert len(q4) == 1
    n_anos = len(e1["curva_top_k"]["anos"])
    assert q4[0]["n"] % n_anos == 0, (q4[0]["n"], n_anos)
    tam_quartil = q4[0]["n"] // n_anos
    tip = saida["etapa_8"]["tipologia"]
    corte = float(tip["cortes"]["TERRITORIO"])
    plano = {(p["clube"], int(p["ano"])): p for p in tip["plano"]}
    prom = []
    for g in tip["grupos"]:
        for t in g["times"]:
            pl = plano[(t["clube"], int(t["ano"]))]
            assert pl["grupo"] == g["grupo"]
            prom.append(dict(clube=t["clube"], ano=int(t["ano"]), grupo=g["grupo"],
                             posto_valor=int(t["posto_valor"]), territorio=pl["territorio"]))
    n_prom = len(prom)
    abaixo_16 = [p for p in prom if p["territorio"] < corte]
    # o corte é a mediana dos 16: metade abaixo; e abaixo do corte = grupos de território baixo
    assert len(abaixo_16) * 2 == n_prom, (len(abaixo_16), n_prom)
    assert sorted({p["grupo"] for p in abaixo_16}) == ["G3", "G4"]
    fora = sorted([p for p in prom if p["posto_valor"] > k],
                  key=lambda p: (p["posto_valor"], p["ano"], p["clube"]))
    nome = lambda p: f"{p['clube']} {p['ano']}"
    abaixo = [p for p in fora if p["territorio"] < corte]
    p_hiper = stats.hypergeom.sf(len(abaixo) - 1, n_prom, len(abaixo_16), len(fora))
    if len(abaixo) == len(fora):
        from math import comb
        assert abs(p_hiper - comb(len(abaixo_16), len(fora)) / comb(n_prom, len(fora))) < 1e-12
    grupos_fora = sorted({p["grupo"] for p in fora})
    caros = sorted([p for p in prom if p["grupo"] in grupos_fora and p["posto_valor"] <= tam_quartil],
                   key=lambda p: (p["posto_valor"], p["ano"], p["clube"]))
    bloco = dict(
        universo="os clubes que subiram, 2022-2025, com o posto de valor do elenco no próprio ano",
        anos=[min(p["ano"] for p in prom), max(p["ano"] for p in prom)],
        n=n_prom,
        k=k,
        n_fora=len(fora),
        nomes=[nome(p) for p in fora],
        estilos={g: sum(1 for p in fora if p["grupo"] == g) for g in grupos_fora},
        colado_na_linha=[nome(p) for p in fora if abs(p["territorio"] - corte) < 1],
        abaixo_da_mediana=len(abaixo),
        p_hipergeometrico=G.r_p(p_hiper, 4),
        caros_nos_mesmos_estilos=len(caros),
        caros_nomes=[nome(p) for p in caros],
        tamanho_do_quartil=tam_quartil,
        mediana_territorio_dos_promovidos=corte,
        detalhe=[dict(clube=p["clube"], ano=p["ano"], grupo=p["grupo"], posto_valor=p["posto_valor"],
                      territorio=p["territorio"]) for p in fora],
        declarada_depois_de_olhar=bool(dec["texto"].get("declarada_depois_de_olhar")),
        declaracao=dec)
    _gravar(saida, "etapa_8.tipologia.fora_do_top_k", bloco)
    gravados.append("etapa_8.tipologia.fora_do_top_k")


def _diferenca_entre_blocos(saida, ctx, gravados):
    """z da diferença entre os d de quem sobe contra o meio nos dois períodos (A3).

    se_d = raiz((n1+n2)/(n1·n2) + d²/(2(n1+n2))); z = (d_novo − d_velho) / raiz(se_novo² +
    se_velho²); bilateral. n1 e n2 são os tamanhos de sobe e meio das 80 de 2022-2025 (a
    etapa 0 confere 16 e 48 e o teste cego usa os mesmos tamanhos). Os 12 indicadores são os de
    `porta.novo`, na ordem do arquivo, e têm de ser os mesmos de `porta.velho`.
    """
    tc = _teste_cego()
    nv = tc["porta"]["novo"]
    vv = {x["ind"]: x for x in tc["porta"]["velho"]}
    assert sorted(x["ind"] for x in nv) == sorted(vv), "porta.novo e porta.velho diferem"
    n1, n2 = int(saida["etapa_0"]["sobe"]), int(saida["etapa_0"]["meio"])

    def se_d(d):
        return np.sqrt((n1 + n2) / (n1 * n2) + d ** 2 / (2 * (n1 + n2)))

    lista = []
    for x in nv:
        d_novo, d_velho = float(x["d_SM"]), float(vv[x["ind"]]["d_SM"])
        z = (d_novo - d_velho) / np.sqrt(se_d(d_novo) ** 2 + se_d(d_velho) ** 2)
        lista.append(dict(ind=x["ind"], d_novo=G.r(d_novo, 3), d_velho=G.r(d_velho, 3),
                          z=G.r(z, 3), p=G.r_p(2 * stats.norm.sf(abs(z)), 4)))
    _gravar(saida, "etapa_8.teste_cego.diferenca_entre_blocos", lista)
    gravados.append("etapa_8.teste_cego.diferenca_entre_blocos")


def _familia_dos_eixos(saida, ctx, gravados):
    """BH nos 2 p_SM de 2022-2025 dos eixos da tipologia (A1), lidos do teste cego congelado.

    A família (território e rota) foi escolhida depois de olhar, pela regra da casa, e isso vai
    escrito. Os eixos e o período saem do texto da declaração `familia_A1`.
    """
    dec = _declaracao("familia_A1")
    txt = dec["texto"]
    eixos = list(txt["eixos"])
    per = re.search(r"\['(\d{4}-\d{4})'\]", txt["fonte"]).group(1)
    tc = _teste_cego()["eixos_como_marcador_de_acesso"][per]
    p = {e: float(tc[e]["p_SM"]) for e in eixos}
    q = dict(zip(eixos, G.bh([p[e] for e in eixos])))
    ini, fim = (int(a) for a in per.split("-"))
    bloco = dict(
        universo="os 80 clube-temporadas de %s, quem subiu contra o meio, eixo a eixo" % per,
        anos=[ini, fim],
        n=len(eixos),
        eixos=eixos,
        periodo=per,
        p_SM={e: p[e] for e in eixos},
        q_SM={e: G.r_p(q[e], 4) for e in eixos},
        correcao=txt["correcao"],
        escolhida_depois_de_olhar=bool(txt["escolhida_depois_de_olhar"]),
        sha256_da_fonte=_sha256(ARQ_TESTE_CEGO),
        fonte=ARQ_TESTE_CEGO + " eixos_como_marcador_de_acesso (só leitura)",
        declaracao=dec)
    _gravar(saida, "etapa_8.teste_cego.familia_dos_eixos", bloco)
    gravados.append("etapa_8.teste_cego.familia_dos_eixos")


# ══════════════════════════════════════════════════════════════════════════════
#  etapa 13 — empates na margem (M3)
# ══════════════════════════════════════════════════════════════════════════════

def _empates_na_margem(saida, ctx, gravados):
    """Contagem sobre os candidatos que a etapa 13 já grava, pela definição declarada.

    n = |margem_normalizada| >= 1,0; de = margem_normalizada não nula; n_pool = etapa_13.n. Quem
    fica sem margem vai contado pelo motivo que a própria linha traz (BUG-8 da ordem), para o
    universo de 586 contra 603 não ficar sem explicação.
    """
    dec = _declaracao("empates_na_margem_M3")
    e13 = saida["etapa_13"]
    cand = e13["candidatos"]
    assert len(cand) == e13["n"]
    lim = float(re.search(r">=\s*([\d,]+)", dec["texto"]["definicao"]).group(1).replace(",", "."))
    com = [c for c in cand if c["nota_fisica"].get("margem_normalizada") is not None]
    teto = sum(1 for c in com if c["nota_fisica"]["margem_normalizada"] >= lim)
    piso = sum(1 for c in com if c["nota_fisica"]["margem_normalizada"] <= -lim)
    n = sum(1 for c in com if abs(c["nota_fisica"]["margem_normalizada"]) >= lim)
    assert n == teto + piso
    sem = {}
    for c in cand:
        nf = c["nota_fisica"]
        if nf.get("margem_normalizada") is not None:
            continue
        motivo = (nf.get("criterio") if nf.get("criterio") == "posição sem setor físico" else
                  "setor com bloco de %d indicadores e %d usados pelo atleta"
                  % (nf.get("indicadores_no_bloco"), nf.get("indicadores_usados")))
        chave = f"{c.get('setor')}|{motivo}"
        sem[chave] = sem.get(chave, 0) + 1
    bloco = dict(
        n=n,
        de=len(com),
        n_pool=int(e13["n"]),
        universo=("candidatos da etapa 13 com margem física calculada (margem_normalizada não "
                  "nula), de todos os candidatos do conjunto"),
        anos=None,
        motivo_anos=("a lista de candidatos é uma foto do mercado (bases.mercado.periodo), não uma "
                     "série de temporadas"),
        definicao=dec["texto"]["definicao"],
        n_no_teto=teto,
        n_no_piso=piso,
        sem_margem={k: sem[k] for k in sorted(sem)},
        declaracao=dec)
    assert bloco["de"] + sum(sem.values()) == bloco["n_pool"]
    _gravar(saida, "etapa_13.empates_na_margem", bloco)
    gravados.append("etapa_13.empates_na_margem")


# ══════════════════════════════════════════════════════════════════════════════
#  etapa 15 — formação principal por faixa (J11)
# ══════════════════════════════════════════════════════════════════════════════

def _formacao_por_faixa(saida, ctx, gravados):
    """Contagem da coluna `formPrincipal` do painel 2022-2025, por faixa. Descrição, sem teste.

    Dentro de cada faixa as formações vão da mais comum para a menos comum (empate pelo nome);
    `mais_comum_sobe` é a primeira de quem subiu, e se houver empate no topo ele fica escrito.
    """
    dec = _declaracao("formacao_principal_por_faixa_J11")
    d80 = ctx["d80"]
    assert int(d80.ano.max()) <= 2025
    assert d80.formPrincipal.notna().all()
    bloco = {}
    for fx in ("sobe", "meio", "cai"):
        vc = d80[d80.faixa == fx].formPrincipal.value_counts()
        itens = sorted(((str(f), int(v)) for f, v in vc.items()), key=lambda t: (-t[1], t[0]))
        bloco[fx] = dict(itens)
    topo = max(bloco["sobe"].values())
    empatados = sorted(f for f, v in bloco["sobe"].items() if v == topo)
    bloco["mais_comum_sobe"] = empatados[0]
    if len(empatados) > 1:
        bloco["empate_no_topo_sobe"] = empatados
    bloco["n_por_faixa"] = {fx: int((d80.faixa == fx).sum()) for fx in ("sobe", "meio", "cai")}
    bloco["universo"] = "80 clube-temporadas da Série B, formação principal anotada no painel"
    bloco["anos"] = [int(d80.ano.min()), int(d80.ano.max())]
    bloco["n"] = int(len(d80))
    bloco["fonte"] = "dados/serieb_clube_temporada.csv, coluna formPrincipal"
    bloco["declaracao"] = dec
    _gravar(saida, "etapa_15.proxy_sistema.formacao_principal_por_faixa", bloco)
    gravados.append("etapa_15.proxy_sistema.formacao_principal_por_faixa")


# ══════════════════════════════════════════════════════════════════════════════
#  contrato
# ══════════════════════════════════════════════════════════════════════════════

def aplicar(saida, ctx):
    """Acrescenta em `saida` só os caminhos de CAMPOS. Devolve os caminhos gravados.

    `bases.painel_2018_2021.usadas` já é gravado pelo main do bloco 1: aqui é conferido e entra
    na lista devolvida, sem ser reescrito (fica também em CONFERIDOS_SEM_ESCREVER).
    """
    assert ctx["G"] is G
    del CONFERIDOS_SEM_ESCREVER[:]
    hash_cego_antes = _sha256(ARQ_TESTE_CEGO)
    gravados = []
    _bases(saida, ctx, gravados)
    _etapa_0_mando(saida, ctx, gravados)
    _etapa_6_colocacao(saida, ctx, gravados)
    _etapa_7_excesso(saida, ctx, gravados)
    _bateria_por_conjunto(saida, ctx, gravados)
    _fora_do_top_k(saida, ctx, gravados)
    _diferenca_entre_blocos(saida, ctx, gravados)
    _familia_dos_eixos(saida, ctx, gravados)
    _empates_na_margem(saida, ctx, gravados)
    _formacao_por_faixa(saida, ctx, gravados)
    assert _sha256(ARQ_TESTE_CEGO) == hash_cego_antes, "o teste cego congelado mudou"
    assert sorted(gravados) == sorted(CAMPOS), (sorted(set(CAMPOS) ^ set(gravados)))
    return gravados


def ctx_de_teste():
    """O ctx sem rodar o main: as mesmas funções de carga do gerador, com a declaração carregada
    antes de `montar_matriz` (regra da casa fora do main)."""
    G.DECL = G.carregar_declaracao()
    d100, d80 = G.carregar_painel()
    jog = G.carregar_jogos()
    tec = G.carregar_tecnico()
    bruto, postos, meta, vazios, ns_ti = G.montar_matriz(d80, tec)
    return dict(G=G, d100=d100, d80=d80, jog=jog, tec=tec, bruto=bruto, postos=postos, meta=meta,
                ns_ti=ns_ti)


def saida_gravada():
    """O dados/prototipo.json gravado, para o teste do módulo (só leitura)."""
    return json.load(open(G.SAIDA, encoding="utf-8"))
