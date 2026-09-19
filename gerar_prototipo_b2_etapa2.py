"""Bloco 2 do gerador, módulo da ETAPA 2: os campos da ordem de serviço com rodada "bloco_2" cujo
caminho começa por `etapa_2`.

Ordem: _fonte/prototipo/sessao_14_09/ordem_gerador_bloco2.json. Declarações:
_fonte/prototipo/sessao_14_09/declaracoes_novas.json (o texto de cada declaração vai ao JSON junto do
bloco que ela rege).

Contrato (o mesmo dos 5 módulos do bloco 2):
  CAMPOS           lista exata dos caminhos da ordem gravados aqui;
  aplicar(saida, ctx)  acrescenta em `saida` SÓ esses caminhos, sem mudar nenhuma chave existente, e
                   devolve a lista do que gravou;
  ctx_de_teste()   monta o ctx sem rodar o main e lê a saída gravada em dados/prototipo.json.

Do ctx este módulo usa, com o nome da variável do main: `G` (o gerador importado), `d80`, `bruto`,
`postos`, `meta` e `linhas_cat` (a lista que o main grava em etapa_2.linhas). O painel de 2018-2021
não é variável do ctx de hoje (no main ele se chama `dv`); se o ctx trouxer `dv`, é ele que vale;
senão ele é lido do mesmo arquivo e com o mesmo corte do main (`ano <= 2025`).

Por que a conta do SM, do SC e do rodízio é REFEITA aqui, e não só lida do JSON: as comparações
novas (quem cai contra o resto, quem sobe contra o resto, quem cai contra o meio) têm de usar
exatamente a mesma base das que já estão gravadas. Então elas são feitas com as mesmas funções do
gerador (`G.welch_p`, `G.bh`, `G.residualiza`, `G.posto_ano`) sobre as mesmas matrizes, e antes de
gravar qualquer coisa o módulo confere que o SM, o SC e o p do rodízio refeitos batem, byte a byte
depois do arredondamento, com o que o gerador gravou. Se não baterem, o módulo para: seria sinal de
que a base mudou e as comparações novas não seriam comparáveis às velhas.

Nada aqui sorteia: nenhum campo desta etapa usa permutação nem bootstrap, então não há gerador de
números aleatórios nem semente a declarar.
"""
import json
import os

import numpy as np
import pandas as pd
from scipy import stats

RAIZ = os.path.dirname(os.path.abspath(__file__))
DECLARACOES = os.path.join(RAIZ, "_fonte", "prototipo", "sessao_14_09", "declaracoes_novas.json")

CAMPOS = [
    "etapa_2.linhas[].p_bruto_CR",
    "etapa_2.linhas[].p_bruto_SR",
    "etapa_2.linhas[].p_bruto_CM",
    "etapa_2.linhas[].n_sobe",
    "etapa_2.linhas[].mediana_sobe",
    "etapa_2.linhas[].media_por_ano",
    "etapa_2.linhas[].cai_metade_baixo",
    "etapa_2.linhas[].cai_entre_5_piores",
    "etapa_2.linhas[].cai_entre_5_melhores",
    "etapa_2.linhas[].sobe_metade_cima",
    "etapa_2.linhas[].mediana_meio",
    "etapa_2.linhas[].mediana_cai",
    "etapa_2.linhas[].comparacao_declarada_antes",
    "etapa_2.linhas[].antigo_SM",
    "etapa_2.linhas[].antigo_SC",
    "etapa_2.linhas[].antigo_CM",
    "etapa_2.linhas[].antigo_CR",
    "etapa_2.linhas[].diferenca_entre_periodos_CR",
    "etapa_2.linhas[].p_SM_descontada_posse",
    "etapa_2.linhas[].p_SM_descontadas_entradas_toques",
    "etapa_2.elenco_base",
    "etapa_2.indice_intensidade",
    "etapa_2.fis10_bloco",
    "etapa_2.estilo_x_valor",
    "etapa_2.por_clube",
    "etapa_2.andam_com_o_valor",
]

# Os campos "companheiros" que o formato de cada caminho manda gravar junto (ex.: `p_bruto_CR` leva
# `q_CR`). Ficam aqui por escrito para a conferência de diff saber que eles pertencem aos CAMPOS.
COMPANHEIROS = {
    "etapa_2.linhas[].p_bruto_CR": ["q_CR"],
    "etapa_2.linhas[].p_bruto_SR": ["q_SR"],
    "etapa_2.linhas[].p_bruto_CM": ["q_CM", "p_mw_CM"],
    "etapa_2.linhas[].n_sobe": ["n_meio", "n_cai"],
    "etapa_2.linhas[].p_SM_descontada_posse": ["rho_com_posse", "p_rho"],
}

K_EXTREMOS = 5              # declaração etapa_2_comparacoes_extras.contagens ("os 5 ...")
METADE = 50.0               # "metade de baixo = posto orientado <= 50"
ANOS = [2022, 2025]
UNIVERSO_80 = ("80 clube-temporadas da Série B de 2022 a 2025 (16 subiram, 48 ficaram no meio, 16 "
               "caíram); 2026 fica fora de toda conta")

# Constante declarada, válida só para as linhas do catálogo (regra_comparacao_depois_de_olhar): SM e SC
# são as comparações do catálogo declarado; CR, SR e CM foram escolhidas depois de olhar.
COMPARACAO_DECLARADA_ANTES = {"SM": True, "SC": True, "CR": False, "SR": False, "CM": False}

COLUNAS_ESTILO = ["posse", "ppda", "cantos", "cruzamentos", "contra_ataques", "bolas_paradas"]
# convenção da declaração estilo_x_valor: "ppda com sinal invertido = pressão mais alta"
SINAL_ESTILO = {"ppda": -1}

COLUNAS_POR_CLUBE = ["dist_remate", "share_11", "min_estrangeiros", "fis_distance_p90",
                     "duelos_aereos_pct", "ti_zaga_duelos_aereos_ganhos",
                     "ti_meio_duelos_defensivos_ganhos", "formacoes"]


def _declaracoes():
    return json.load(open(DECLARACOES, encoding="utf-8"))


def _p(G, x):
    return G.r_p(x, 5)


def _nome_clube_ano(clube, ano, pos):
    return f"{clube} {int(ano)} ({int(pos)}º)"


def _mascaras(faixa):
    faixa = np.asarray(faixa)
    return dict(sobe=faixa == "sobe", meio=faixa == "meio", cai=faixa == "cai")


def _pares(m):
    """As cinco comparações: (grupo a, grupo b). `resto` é tudo que não é o próprio grupo."""
    return dict(SM=(m["sobe"], m["meio"]), SC=(m["sobe"], m["cai"]),
                CR=(m["cai"], ~m["cai"]), SR=(m["sobe"], ~m["sobe"]), CM=(m["cai"], m["meio"]))


def _orientado(valores, anos, sinal):
    """Posto (0-100, empate pela média) e posição (1 = melhor desempenho, empate pelo menor) no ano,
    com o sinal da linha: nas linhas em que menos é melhor (sinal −1) o valor é invertido antes.
    Linha sem lado declarado (sinal 0) fica como está: maior número = posto maior."""
    v = pd.Series(np.asarray(valores, float) * (-1.0 if sinal == -1 else 1.0))
    a = pd.Series(np.asarray(anos))
    ok = np.isfinite(v)
    posto = v.where(ok).groupby(a).rank(pct=True) * 100
    posicao = v.where(ok).groupby(a).rank(ascending=False, method="min")
    n_ano = v.where(ok).groupby(a).transform("count")
    return posto.values, posicao.values, n_ano.values


def _contagens(valores, anos, clubes, m, sinal):
    posto, posicao, n_ano = _orientado(valores, anos, sinal)
    ok = np.isfinite(posto)
    cai, sobe = m["cai"] & ok, m["sobe"] & ok
    melhores = [(_nome_clube_ano(c, a, p), int(a), c) for c, a, p, s in
                zip(clubes, anos, posicao, cai) if s and p <= K_EXTREMOS]
    melhores.sort(key=lambda t: (t[1], t[2]))
    return dict(
        cai_metade_baixo=int((cai & (posto <= METADE)).sum()),
        cai_entre_5_piores=int((cai & (posicao > n_ano - K_EXTREMOS)).sum()),
        cai_entre_5_melhores=[t[0] for t in melhores],
        sobe_metade_cima=int((sobe & (posto > METADE)).sum()),
        n_cai=int(cai.sum()))


def _se_d(d, n1, n2):
    return np.sqrt((n1 + n2) / (n1 * n2) + d ** 2 / (2 * (n1 + n2)))


def _spearman(x, y):
    x, y = np.asarray(x, float), np.asarray(y, float)
    ok = np.isfinite(x) & np.isfinite(y)
    if ok.sum() < 3:
        return np.nan, np.nan, int(ok.sum())
    res = stats.spearmanr(x[ok], y[ok])
    return float(res.statistic), float(res.pvalue), int(ok.sum())


def _painel_antigo(ctx):
    dv = ctx.get("dv")
    if dv is None:
        dv = pd.read_csv(os.path.join(RAIZ, "dados", "serieb_clube_temporada_2018_2021.csv"))
        dv = dv[dv.ano <= 2025].reset_index(drop=True)       # o mesmo corte do main
    return dv


def aplicar(saida, ctx):
    G = ctx["G"]
    d80, bruto, postos, meta = ctx["d80"], ctx["bruto"], ctx["postos"], ctx["meta"]
    e2 = saida["etapa_2"]
    linhas = e2["linhas"]
    assert [L["indicador"] for L in linhas] == list(postos.columns), "catálogo fora da ordem da matriz"
    decl = _declaracoes()

    anos = d80.ano.values
    clubes = d80.clube.values
    m = _mascaras(d80.faixa.values)
    pares = _pares(m)
    # guarda contra a ordem das linhas: as máscaras seguem d80 e as matrizes têm de seguir a mesma ordem
    assert (postos.index.get_level_values(0).values == anos).all()
    assert (postos.index.get_level_values(1).values == clubes).all()

    # ---------- o controle do rodízio, igual ao `residuo_rod` de dentro da etapa_2 ----------
    r_atletas = {"fisico_col_elenco": G.posto_ano(d80, "fis_atletas").values}
    for s in G.SETORES:
        r_atletas[f"setor_{s}"] = G.posto_ano(d80, f"fis_{s}_atletas").values

    def controle_rod(mt):
        if mt["familia"] == "fisico_col_elenco":
            return r_atletas["fisico_col_elenco"]
        if mt["familia"] == "fisico_col_setor":
            return r_atletas[f"setor_{mt['setor']}"]
        return None

    # ---------- p crus das 5 comparações e resíduo do rodízio, linha a linha ----------
    cru = []
    for ind in postos.columns:
        pb = postos[ind].values
        c = {k: G.welch_p(pb[a], pb[b]) for k, (a, b) in pares.items()}
        ctrl = controle_rod(meta[ind])
        res = G.residualiza(pb, ctrl) if ctrl is not None else None
        c["res_rod"] = res
        c["p_rod_SM"] = G.welch_p(res[m["sobe"]], res[m["meio"]]) if res is not None else None
        c["p_rod_SC"] = G.welch_p(res[m["sobe"]], res[m["cai"]]) if res is not None else None
        cru.append(c)

    # BH dentro da família, em cada comparação (a mesma regra da etapa_2: nunca no bolo)
    fam_idx = {}
    for i, L in enumerate(linhas):
        fam_idx.setdefault(L["familia"], []).append(i)
    for fam, idx in fam_idx.items():
        for comp in ("SM", "SC", "CR", "SR", "CM"):
            qs = G.bh([cru[i][comp] for i in idx])
            for k, i in enumerate(idx):
                cru[i]["q_" + comp] = qs[k]

    # Guarda: o que já estava gravado sai igual daqui. Se não sair, as comparações novas não estão
    # na mesma base das velhas e o módulo não grava nada.
    for L, c in zip(linhas, cru):
        assert L["p_bruto_SM"] == _p(G, c["SM"]) and L["p_bruto_SC"] == _p(G, c["SC"]), L["indicador"]
        assert L["q_SM"] == _p(G, c["q_SM"]) and L["q_SC"] == _p(G, c["q_SC"]), L["indicador"]
        if c["p_rod_SM"] is not None:
            assert L["p_rod_SM"] == _p(G, c["p_rod_SM"]) and L["p_rod_SC"] == _p(G, c["p_rod_SC"]), L["indicador"]

    novos_por_linha = ["p_bruto_CR", "q_CR", "p_bruto_SR", "q_SR", "p_bruto_CM", "q_CM", "p_mw_CM",
                       "n_sobe", "n_meio", "n_cai", "mediana_sobe", "mediana_meio", "mediana_cai",
                       "media_por_ano", "cai_metade_baixo", "cai_entre_5_piores",
                       "cai_entre_5_melhores", "sobe_metade_cima", "comparacao_declarada_antes",
                       "antigo_SM", "antigo_SC", "antigo_CM", "antigo_CR"]
    for L in linhas:
        ja = [k for k in novos_por_linha + ["diferenca_entre_periodos_CR", "p_SM_descontada_posse",
                                            "rho_com_posse", "p_rho", "p_SM_descontadas_entradas_toques"]
              if k in L]
        assert not ja, (L["indicador"], ja)
    for k in ("elenco_base", "indice_intensidade", "fis10_bloco", "estilo_x_valor", "por_clube",
              "andam_com_o_valor"):
        assert k not in e2, k

    # ---------- 2018-2021: as mesmas contas, só nas colunas que existem lá ----------
    dv = _painel_antigo(ctx)
    m_v = _mascaras(dv.faixa.values)
    pares_v = _pares(m_v)
    anos_v, clubes_v = dv.ano.values, dv.clube.values
    presentes = [ind for ind in postos.columns if meta[ind]["coluna_csv"] in dv.columns]
    antigo = {}
    for ind in presentes:
        col = pd.to_numeric(dv[meta[ind]["coluna_csv"]], errors="coerce")
        pv = col.groupby(dv.ano).rank(pct=True).values * 100      # o mesmo posto do main (dvp)
        a = {k: dict(d=G.d_cohen(pv[x], pv[y]), p=G.welch_p(pv[x], pv[y])) for k, (x, y) in pares_v.items()}
        a["_contagens"] = _contagens(col.values, anos_v, clubes_v, m_v, meta[ind]["sinal"])
        a["_n"] = {k: (int((m_v[k] & np.isfinite(pv)).sum())) for k in ("sobe", "meio", "cai")}
        antigo[ind] = a
    # q de BH na família da linha em 2018-2021 (as colunas dela que existem lá); declaração pede a
    # família tecnico_col (31); `formacoes` e `formPrincipalPct`, da família elenco, ficam com a própria
    # família reduzida às 2 colunas presentes, e o tamanho vai em q_familia_n.
    fam_v = {}
    for ind in presentes:
        fam_v.setdefault(meta[ind]["familia"], []).append(ind)
    for fam, inds in fam_v.items():
        for comp in ("SM", "SC", "CR"):
            qs = G.bh([antigo[i][comp]["p"] for i in inds])
            for k, i in enumerate(inds):
                antigo[i][comp]["q"] = qs[k]
                antigo[i]["_q_familia_n"] = len(inds)
    motivo_antigo = "a coluna não existe no painel de 2018-2021 (dados/serieb_clube_temporada_2018_2021.csv)"

    # ---------- as linhas ----------
    faixas = ("sobe", "meio", "cai")
    anos_lista = sorted(int(a) for a in np.unique(anos))
    for i, (L, c) in enumerate(zip(linhas, cru)):
        ind = L["indicador"]
        pb, bb = postos[ind].values, bruto[ind].values
        L["p_bruto_CR"] = _p(G, c["CR"]); L["q_CR"] = _p(G, c["q_CR"])
        L["p_bruto_SR"] = _p(G, c["SR"]); L["q_SR"] = _p(G, c["q_SR"])
        L["p_bruto_CM"] = _p(G, c["CM"]); L["q_CM"] = _p(G, c["q_CM"])
        # Mann-Whitney no POSTO DO ANO, a mesma escala do Welch da linha. No valor cru, anos diferentes
        # se misturam (a régua da liga muda de um ano para o outro), e o número citado na ELE-01
        # (0,0003) é o do posto; no cru daria 0,00045.
        L["p_mw_CM"] = _p(G, G._mw_p(pb[m["cai"]], pb[m["meio"]]))
        ok = np.isfinite(bb)
        for f in faixas:
            L["n_" + f] = int((m[f] & ok).sum())
        for f in faixas:
            L["mediana_" + f] = G.cru_para_a_tela(G._mediana(bb[m[f]]))

        # média por ano: bruto = média do posto no ano; rod (só físicas) = média do resíduo do posto
        # sobre o posto de atletas rastreados, regressão UMA vez nas 80 (o mesmo resíduo do p_rod)
        mpa = []
        niveis = [("bruto", pb)] + ([("rod", c["res_rod"])] if c["res_rod"] is not None else [])
        for nivel, vetor in niveis:
            for ano in anos_lista:
                noano = anos == ano
                med = {}
                for f in faixas:
                    v = vetor[noano & m[f]]
                    v = v[np.isfinite(v)]
                    med[f] = float(v.mean()) if len(v) else np.nan
                mpa.append(dict(ano=ano, nivel=nivel, sobe=G.r(med["sobe"], 1), meio=G.r(med["meio"], 1),
                                cai=G.r(med["cai"], 1), sobe_menos_meio=G.r(med["sobe"] - med["meio"], 1)))
        L["media_por_ano"] = mpa

        cont = _contagens(bb, anos, clubes, m, L["sinal"])
        L["cai_metade_baixo"] = cont["cai_metade_baixo"]
        L["cai_entre_5_piores"] = cont["cai_entre_5_piores"]
        L["cai_entre_5_melhores"] = cont["cai_entre_5_melhores"]
        L["sobe_metade_cima"] = cont["sobe_metade_cima"]
        L["comparacao_declarada_antes"] = dict(COMPARACAO_DECLARADA_ANTES)

        if ind in antigo:
            a = antigo[ind]
            L["antigo_SM"] = dict(d=G.r(a["SM"]["d"], 3), p=_p(G, a["SM"]["p"]), q=_p(G, a["SM"]["q"]),
                                  q_familia_n=a["_q_familia_n"])
            L["antigo_SC"] = dict(d=G.r(a["SC"]["d"], 3), p=_p(G, a["SC"]["p"]), q=_p(G, a["SC"]["q"]))
            L["antigo_CM"] = dict(d=G.r(a["CM"]["d"], 3), p=_p(G, a["CM"]["p"]))
            L["antigo_CR"] = dict(d=G.r(a["CR"]["d"], 3), p=_p(G, a["CR"]["p"]), q=_p(G, a["CR"]["q"]),
                                  cai_metade_baixo=a["_contagens"]["cai_metade_baixo"],
                                  n_cai=a["_contagens"]["n_cai"],
                                  cai_entre_5_melhores=a["_contagens"]["cai_entre_5_melhores"])
        else:
            L["antigo_SM"] = dict(d=None, p=None, q=None, q_familia_n=None, motivo=motivo_antigo)
            L["antigo_SC"] = dict(d=None, p=None, q=None, motivo=motivo_antigo)
            L["antigo_CM"] = dict(d=None, p=None, motivo=motivo_antigo)
            L["antigo_CR"] = dict(d=None, p=None, q=None, cai_metade_baixo=None, n_cai=None,
                                  cai_entre_5_melhores=None, motivo=motivo_antigo)

    por_ind = {L["indicador"]: (L, c) for L, c in zip(linhas, cru)}

    # ---------- duelos_aereos_pct: diferença entre os períodos, quem cai contra o resto ----------
    # Declaração antigo_2018_2021.diferenca_entre_periodos: z dos dois d, se_d com os n de cada lado.
    L, _ = por_ind["duelos_aereos_pct"]
    pbv = postos["duelos_aereos_pct"].values
    d1 = G.d_cohen(pbv[m["cai"]], pbv[~m["cai"]])
    n1a, n1b = int((m["cai"] & np.isfinite(pbv)).sum()), int((~m["cai"] & np.isfinite(pbv)).sum())
    a = antigo["duelos_aereos_pct"]
    d2 = a["CR"]["d"]
    n2a, n2b = a["_n"]["cai"], a["_n"]["sobe"] + a["_n"]["meio"]
    z = (d1 - d2) / np.sqrt(_se_d(d1, n1a, n1b) ** 2 + _se_d(d2, n2a, n2b) ** 2)
    L["diferenca_entre_periodos_CR"] = dict(z=G.r(z, 3), p=_p(G, 2 * stats.norm.sf(abs(z))))

    # ---------- faltas: descontada a posse (declaração faltas_x_posse_J3) ----------
    L, _ = por_ind["faltas"]
    pf, pp = postos["faltas"].values, postos["posse"].values
    rho, prho, _n = _spearman(pf, pp)
    res = G.residualiza(pf, pp)
    L["rho_com_posse"] = G.r(rho, 3)
    L["p_rho"] = _p(G, prho)
    L["p_SM_descontada_posse"] = _p(G, G.welch_p(res[m["sobe"]], res[m["meio"]]))

    # ---------- dist_remate: descontadas entradas e toques na área (declaração dist_remate_descontada_J1) ----------
    L, _ = por_ind["dist_remate"]
    res = G.residualiza_multi(postos["dist_remate"].values,
                              [postos["entradas_area"].values, postos["toques_area"].values])
    L["p_SM_descontadas_entradas_toques"] = _p(G, G.welch_p(res[m["sobe"]], res[m["meio"]]))

    # ---------- elenco_base (declaração elenco_base) ----------
    # Família própria, FORA das 293: 2023-2025, só quem estava na Série B no ano anterior (onde
    # pctFicou existe). O posto é tirado DENTRO desse universo, por ano.
    db = d80[d80.pctFicou.notna()].reset_index(drop=True)
    mb = _mascaras(db.faixa.values)
    pares_b = {k: v for k, v in _pares(mb).items() if k in ("SM", "SC", "CM")}
    testes, linhas_b = [], []
    for it in decl["elenco_base"]["colunas"]:
        col = it["col"]
        x = pd.to_numeric(db[col], errors="coerce")
        pv = x.groupby(db.ano).rank(pct=True).values * 100
        ok = np.isfinite(x.values)
        lb = dict(indicador=col, nome=it["nome"], sinal=it["sinal"], n=int(ok.sum()),
                  n_sobe=int((mb["sobe"] & ok).sum()), n_meio=int((mb["meio"] & ok).sum()),
                  n_cai=int((mb["cai"] & ok).sum()))
        for f in faixas:
            lb["mediana_" + f] = G.cru_para_a_tela(G._mediana(x.values[mb[f]]))
        for comp, (u, v) in pares_b.items():
            p = G.welch_p(pv[u], pv[v])
            lb["p_bruto_" + comp] = p
            testes.append((len(linhas_b), comp, p))
        linhas_b.append(lb)
    qs = G.bh([t[2] for t in testes])
    for (j, comp, p), q in zip(testes, qs):
        linhas_b[j]["p_bruto_" + comp] = _p(G, p)
        linhas_b[j]["q_" + comp] = _p(G, q)
    anos_b = [int(db.ano.min()), int(db.ano.max())]
    assert anos_b == decl["elenco_base"]["anos"], anos_b
    e2["elenco_base"] = dict(
        universo=decl["elenco_base"]["universo"], anos=anos_b, n=int(len(db)),
        bh_testes=len(testes), linhas=linhas_b,
        comparacao_declarada_antes=False,
        declaracao=decl["elenco_base"])

    # ---------- índice de intensidade (declaração indice_intensidade, FIS-01) ----------
    di = decl["indice_intensidade"]
    for col in di["colunas"]:
        assert meta[col]["familia"] == "fisico_col_elenco", col
    M = np.column_stack([postos[col].values for col in di["colunas"]])
    indice = M.mean(axis=1)                     # média do posto no ano; NaN se faltar coluna
    s_idx = pd.Series(indice)
    posicao = s_idx.groupby(anos).rank(ascending=False, method="min").values
    n_ano = s_idx.groupby(anos).transform("count").values
    k = di["k_extremos"]
    okx = np.isfinite(indice)
    res_idx = G.residualiza(indice, r_atletas["fisico_col_elenco"])
    ordem = sorted(range(len(d80)), key=lambda j: (int(anos[j]), str(clubes[j])))
    excecoes = [dict(clube=str(clubes[j]), ano=int(anos[j]), posicao=int(posicao[j]))
                for j in ordem if m["cai"][j] and okx[j] and posicao[j] <= k]
    e2["indice_intensidade"] = dict(
        universo=UNIVERSO_80 + "; físico do SkillCorner, média do elenco rastreado",
        anos=list(ANOS), n=int(okx.sum()),
        colunas=list(di["colunas"]), agregacao=di["agregacao"], k_extremos=k,
        n_por_ano={str(a): int(s_idx[anos == a].notna().sum()) for a in anos_lista},
        por_clube=[dict(ano=int(anos[j]), clube=str(clubes[j]), faixa=str(d80.faixa.values[j]),
                        indice=G.r(indice[j], 1), posicao=(int(posicao[j]) if okx[j] else None))
                   for j in ordem],
        mediana_posicao={f: G.r(np.median(posicao[m[f] & okx]), 1) for f in faixas},
        cai_top_k=int((m["cai"] & okx & (posicao <= k)).sum()),
        cai_bottom_k=int((m["cai"] & okx & (posicao > n_ano - k)).sum()),
        excecoes_top_k=excecoes,
        p_bruto_CM=_p(G, G.welch_p(indice[m["cai"]], indice[m["meio"]])),
        p_rod_CM=_p(G, G.welch_p(res_idx[m["cai"]], res_idx[m["meio"]])),
        rod_controle="posto de fis_atletas",
        comparacao_declarada_antes=False,
        declaracao=di)

    # ---------- bloco da FIS-10 (declaração fis10_bloco) ----------
    # Lido da própria linha do catálogo; as decisões (< 0,05) usam os p crus desta mesma conta, que a
    # guarda de cima provou iguais aos gravados.
    bloco = [(L, c) for L, c in zip(linhas, cru)
             if L["familia"] == "fisico_col_setor" and L.get("setor") == "ataque"]
    sep = [(L, c) for L, c in bloco if G.abaixo(c["SC"], 0.05)]
    sm_min = min(sep, key=lambda t: t[1]["SM"]) if sep else None
    e2["fis10_bloco"] = dict(
        universo=UNIVERSO_80 + "; físico do SkillCorner, setor ataque (setor com menos de 3 atletas "
                               "rastreados fica vazio)",
        anos=list(ANOS),
        colunas=[L["indicador"] for L, _ in bloco], n=len(bloco),
        n_p_bruto_SC_abaixo_005=len(sep),
        p_bruto_SC_min=_p(G, min(c["SC"] for _, c in sep)) if sep else None,
        p_bruto_SC_max=_p(G, max(c["SC"] for _, c in sep)) if sep else None,
        q_SC_min=_p(G, min(c["q_SC"] for _, c in sep)) if sep else None,
        # contado entre as linhas que separam no cru (é a leitura da FIS-10: "N delas continuam")
        n_p_rod_SC_abaixo_005=int(sum(1 for _, c in sep if G.abaixo(c["p_rod_SC"], 0.05))),
        p_bruto_SM_min=_p(G, sm_min[1]["SM"]) if sep else None,
        p_bruto_SM_min_indicador=sm_min[0]["indicador"] if sep else None,
        p_bruto_SM_max=_p(G, max(c["SM"] for _, c in sep)) if sep else None,
        min_e_max_entre="as linhas do bloco com p_bruto_SC < 0,05",
        declaracao=decl["fis10_bloco"])

    # ---------- relação com o valor do elenco (declarações estilo_x_valor e andam_com_o_valor) ----------
    pval = G.posto_ano(d80, "tm_valor_total").values
    estilo = dict(universo=UNIVERSO_80 + ", com valor de mercado do Transfermarkt", anos=list(ANOS))
    for col in COLUNAS_ESTILO:
        rho, p, n = _spearman(pval, postos[col].values)
        estilo[col] = dict(rho=G.r(SINAL_ESTILO.get(col, 1) * rho, 3), p=_p(G, p), n=n)
    estilo["n"] = min(estilo[c]["n"] for c in COLUNAS_ESTILO)
    estilo["declaracao"] = decl["estilo_x_valor"]
    e2["estilo_x_valor"] = estilo

    da = decl["andam_com_o_valor"]
    rel = []
    for ind in postos.columns:
        rho, p, n = _spearman(pval, postos[ind].values)
        rel.append(dict(indicador=ind, familia=meta[ind]["familia"], _rho=rho, _p=p, n=n))
    for fam, idx in fam_idx.items():
        qs = G.bh([rel[i]["_p"] for i in idx])
        for kq, i in enumerate(idx):
            rel[i]["_q"] = qs[kq]
    e2["andam_com_o_valor"] = dict(
        universo=UNIVERSO_80 + ", com valor de mercado do Transfermarkt", anos=list(ANOS),
        n=int(np.isfinite(pval).sum()),
        regra=("Spearman do posto no ano de tm_valor_total com o posto no ano da coluna, nas "
               "clube-temporadas com os dois valores; p bilateral; q de Benjamini-Hochberg dentro da "
               "família do catálogo; sorte = firme (q < 0,05) | pode_ser_sorte (p < 0,05) | "
               "sem_diferenca. Descrição: nunca porta, selo, teto nem desconto. "
               + da["regra_da_ressalva"]),
        linhas=[dict(indicador=x["indicador"], rho=G.r(x["_rho"], 3), p=_p(G, x["_p"]),
                     q=_p(G, x["_q"]), n=x["n"], sorte=G.chave_sorte(x["_p"], x["_q"])) for x in rel],
        declaracao=da)

    # ---------- por clube (declaração por_clube_etapa_2) ----------
    posicao_maior = {}
    for col in COLUNAS_POR_CLUBE:
        v = pd.Series(bruto[col].values)
        posicao_maior[col] = v.groupby(anos).rank(ascending=False, method="min").values
    e2["por_clube"] = [
        dict(ano=int(anos[j]), clube=str(clubes[j]), faixa=str(d80.faixa.values[j]),
             pos=int(d80.pos.values[j]),
             postos={col: G.r(postos[col].values[j], 1) for col in COLUNAS_POR_CLUBE},
             brutos={col: G.cru_para_a_tela(bruto[col].values[j]) for col in COLUNAS_POR_CLUBE},
             posicao_no_ano={col: (int(posicao_maior[col][j]) if np.isfinite(posicao_maior[col][j])
                                   else None) for col in COLUNAS_POR_CLUBE})
        for j in ordem]

    return list(CAMPOS)


def ctx_de_teste():
    import gerar_prototipo as G
    G.DECL = G.carregar_declaracao()
    d100, d80 = G.carregar_painel()
    tec = G.carregar_tecnico()
    bruto, postos, meta, vazios, ns_ti = G.montar_matriz(d80, tec)
    saida = json.load(open(G.SAIDA, encoding="utf-8"))
    return dict(G=G, d100=d100, d80=d80, tec=tec, bruto=bruto, postos=postos, meta=meta,
                vazios=vazios, ns_ti=ns_ti, linhas_cat=saida["etapa_2"]["linhas"], saida_gravada=saida)


if __name__ == "__main__":
    import sys
    destino = sys.argv[1]
    ctx = ctx_de_teste()
    saida = ctx["saida_gravada"]
    gravados = aplicar(saida, ctx)
    json.dump(saida, open(destino, "w", encoding="utf-8"), ensure_ascii=False,
              separators=(",", ":"), allow_nan=False)
    print("gravados", len(gravados), "em", destino)
