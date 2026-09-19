"""Bloco 2 do gerador, etapa 1: os campos da ordem de serviço com rodada "bloco_2" que começam por
`etapa_1.` (ordem em _fonte/prototipo/sessao_14_09/ordem_gerador_bloco2.json).

Contrato dos módulos (CONTINUAR §3, item 4): este arquivo NÃO edita o gerador. Ele importa
`gerar_prototipo` como biblioteca e expõe

    CAMPOS               os 17 caminhos da ordem que ele grava;
    aplicar(saida, ctx)  acrescenta em `saida` (o dict que o main montou, antes do json.dump) só esses
                         caminhos — e a chave `etapa_1.declaracoes_bloco_2`, ver abaixo — sem mudar
                         nenhuma chave existente; devolve a lista do que gravou;
    ctx_de_teste()       monta o ctx sem rodar o main e lê a saída do dados/prototipo.json gravado.

Do ctx do main usa só `d80` (a variável local do main com as 80 clube-temporadas 2022-2025, saída de
`carregar_painel`). Nada aqui usa o `rng` global do gerador: o único sorteio (o intervalo do AUC) tem
gerador próprio `default_rng([SEMENTE, 1, 1])`, declarado antes de medir, e por isso ligar este módulo
não desloca número nenhum de outra etapa.

Por que existe `etapa_1.declaracoes_bloco_2`: a regra da casa pede que o texto da declaração vá junto
com a análise nova, e que todo bloco novo leve {universo, anos, n}. Vários campos da ordem têm formato
de LISTA ou de número (`blocos_de_posto`, `vizinhos_de_valor`, `valor_mediano_da_liga_por_ano`,
`auc_posto_de_valor.ic95`...), onde não cabe chave nenhuma sem quebrar o formato que as conclusões
leem. Em vez de enfiar a declaração dentro de cada elemento, ela vai UMA vez, num dicionário ao lado,
com a lista de campos que cada declaração cobre. Os campos com formato de dicionário
(`curva_top_k_rebaixados`, `sensibilidade_fonte_valor`) levam também universo/anos/n dentro de si.

Onde a conta já existe no gerador, este módulo não a refaz de outro jeito: usa as MESMAS funções
(`G.posto_ano`, `G.auc`, `G.bh`, `G._pmf_hiper_convoluida`, `G.r_p`, `G.r_sig`) com a mesma regra de
posto, e confere contra o que o gerador já gravou (assert) antes de acrescentar a coluna nova.
"""
import json
import os
import re

import numpy as np
import pandas as pd
from scipy import stats

import gerar_prototipo as G

CAMPOS = [
    "etapa_1.quartis[].cairam",
    "etapa_1.auc_posto_de_valor.ic95",
    "etapa_1.auc_posto_de_valor.por_ano",
    "etapa_1.auc_posto_de_valor.meio_x_cai",
    "etapa_1.auc_posto_de_valor.meio_x_cai_por_ano",
    "etapa_1.auc_posto_de_valor.p_meio_x_cai",
    "etapa_1.curva_top_k.valor_do_posto_k_por_ano",
    "etapa_1.curva_top_k.ks_da_tabela",
    "etapa_1.curva_top_k.palpite_do_dono.afirmado_n",
    "etapa_1.valor_mediano_da_liga_por_ano",
    "etapa_1.blocos_de_posto",
    "etapa_1.vizinhos_de_valor",
    "etapa_1.top4_de_valor.por_ano[].posicao_final",
    "etapa_1.curva_top_k_rebaixados",
    "etapa_1.sensibilidade_fonte_valor",
    "etapa_1.valor_por_setor.setores[].q_sobe_x_meio",
    "etapa_1.valor_por_setor.por_clube",
]
# A chave da declaração (fora da lista da ordem, pelo motivo do cabeçalho).
CAMPO_DECLARACOES = "etapa_1.declaracoes_bloco_2"

RAIZ = os.path.dirname(os.path.abspath(__file__))
ARQ_DECLARACOES = os.path.join(RAIZ, "_fonte", "prototipo", "sessao_14_09", "declaracoes_novas.json")

# ---------- declarações, copiadas de declaracoes_novas.json ANTES do código que mede ----------
# O gerador não lê aquele arquivo (só dados/prototipo_indicadores.json); a regra da casa é copiar a
# declaração para constante no código e gravar o texto no JSON. Para a cópia não envelhecer em silêncio,
# `_conferir_declaracoes` compara estas constantes com o arquivo quando ele existe e para a rodada se
# divergirem.
DECL_VALOR_DIN01_DIN03 = {
    "auc_ic95": "bootstrap de clube-temporada estratificado por ano, 2.000, default_rng([SEMENTE, 1, 1]), AUC sobe x resto no posto de valor",
    "auc_por_ano": "AUC sobe x resto no posto de valor, ano a ano",
    "meio_x_cai": "AUC e Mann-Whitney bilateral cai x meio no posto de valor; e por ano",
    "curva_top_k_rebaixados": "rebaixados acumulados por posto de valor; p_quartil = hipergeométrica por ano (20 clubes, 4 rebaixados, k = tamanho do quartil de cima) convoluída nos anos, P(soma <= observado)",
    "sensibilidade_fonte_valor": "a mesma contagem com a coluna valor_total (Wyscout): postos dos três rebaixados mais caros, rebaixados no top k, nomes, p_quartil",
    "blocos_de_posto": [[1, 4], [5, 8], [9, 12], [13, 20]],
    "gravar": "etapa_1.{quartis[].cairam, auc_posto_de_valor.{ic95, por_ano, meio_x_cai, meio_x_cai_por_ano, p_meio_x_cai}, curva_top_k_rebaixados, sensibilidade_fonte_valor, blocos_de_posto, vizinhos_de_valor, valor_mediano_da_liga_por_ano, curva_top_k.valor_do_posto_k_por_ano, top4_de_valor.por_ano[].posicao_final}",
    "declarada_depois_de_olhar": True,
    "sai_nesta_versao": "controle da cobertura (resíduo do posto de valor sobre o posto de tm_com_valor): tratava o jogador sem preço como dado faltando, contra a decisão do dono de 14/09 (sem preço = valor baixo ou nenhum). etapa_1.cobertura_do_valor existente continua como descrição",
}
DECL_ETAPA_1_TABELA_E_EUROS = {
    "ks_da_tabela": [4, 6, 8, 9],
    "motivo_ks": "os k aprovados pelo dono para a tabela da etapa 1 (decisão da rodada de 14/09); lista declarada, não saída do dado",
    "valor_do_posto_k_por_ano": {"ks": [1, 4, 5, 8, 9],
                                 "unidade": "euros (Transfermarkt, valor de mercado, não folha)"},
    "blocos_de_posto": [[1, 4], [5, 8], [9, 12], [13, 20]],
    "vizinhos_de_valor": {"ate_posicoes": [1, 2],
                          "contagem": "não promovidos a até N posições de valor de cada promovido, no mesmo ano, por promovido"},
}
DECL_VALOR_POR_SETOR_EXTRAS = {
    "gravar": "etapa_1.valor_por_setor.{particao.setores[].{mediana_por_ano, sorte}, setores[].q_sobe_x_meio, por_clube: [{ano, clube, faixa, pct_goleiro, pct_defesa, pct_meio, pct_ataque}]}; particao.setores[].sorte a partir de (p_bruto, q_bh) já gravados",
    "_doc": "DESCRIÇÃO em euros da DIN-04 e da DIN-05 (a fatia do valor em euros). A pergunta dos títulos é lida por jogador: ver din04_din05_por_jogador.",
    "sai_nesta_versao": "p_liquido_do_valor_total (a fatia descontada do valor total). O plano_por_dono dizia 'fica como descrição'; os mapas e a DIN-04 da tabela 'conclusoes' do mesmo plano dizem 'sai'. Sai: é um desconto pelo valor total, e a leitura por jogador (fatia do valor ÷ fatia de jogadores) já responde à pergunta sem desconto",
}
DECLARACOES = {
    "valor_DIN01_DIN03": DECL_VALOR_DIN01_DIN03,
    "etapa_1_tabela_e_euros": DECL_ETAPA_1_TABELA_E_EUROS,
    "valor_por_setor_extras_DIN04_DIN05": DECL_VALOR_POR_SETOR_EXTRAS,
}

# Semente do único sorteio deste módulo (declaração valor_DIN01_DIN03.auc_ic95).
SEMENTE_IC_AUC = [G.SEMENTE, 1, 1]
# Os blocos de posto são declarados igual nas duas declarações; confere-se que não divergem.
assert DECL_VALOR_DIN01_DIN03["blocos_de_posto"] == DECL_ETAPA_1_TABELA_E_EUROS["blocos_de_posto"]
BLOCOS_DE_POSTO = [tuple(b) for b in DECL_ETAPA_1_TABELA_E_EUROS["blocos_de_posto"]]
KS_EUROS = DECL_ETAPA_1_TABELA_E_EUROS["valor_do_posto_k_por_ano"]["ks"]
VIZINHOS_ATE = DECL_ETAPA_1_TABELA_E_EUROS["vizinhos_de_valor"]["ate_posicoes"]
SETORES_EUROS = [nome for nome, _ in G.SETORES_VALOR]   # goleiro, defesa, meio, ataque — a ordem do gerador


def _conferir_declaracoes():
    """Para a rodada se a cópia aqui divergir do arquivo de declarações (quando ele existe)."""
    if not os.path.exists(ARQ_DECLARACOES):
        return "arquivo de declarações ausente: conferência não feita"
    arq = json.load(open(ARQ_DECLARACOES, encoding="utf-8"))
    for nome, texto in DECLARACOES.items():
        assert arq.get(nome) == texto, f"declaração {nome} diverge de declaracoes_novas.json"
    return "igual a declaracoes_novas.json (conferido na rodada)"


# ---------- utilidades ----------

def _posto_valor(d, col):
    """Posto no ano, 1 = mais caro, empate pelo MENOR posto: a regra de `G.curva_top_k`."""
    return d.groupby("ano")[col].rank(ascending=False, method="min")


def _nome_clube_ano(clube, ano):
    return f"{clube} {int(ano)}"


def _universo(d):
    anos = sorted(int(a) for a in d.ano.unique())
    return dict(universo=("clube-temporadas da Série B de %d a %d (%d subiram, %d ficaram no meio, %d caíram), "
                          "valor de mercado do Transfermarkt; 2026 fora de toda conta"
                          % (anos[0], anos[-1], int((d.faixa == "sobe").sum()),
                             int((d.faixa == "meio").sum()), int((d.faixa == "cai").sum()))),
                anos=[anos[0], anos[-1]], n=int(len(d)))


def _por_caminho(saida, caminho):
    """Lê um dict por caminho 'a.b.c' (sem índices)."""
    o = saida
    for k in caminho.split("."):
        o = o[k]
    return o


# ---------- as contas ----------

def _base(d80):
    """A mesma preparação de `G.etapa_1`: r_val = posto percentual do ano, y = subiu."""
    assert len(d80) == 80 and int(d80.ano.max()) <= 2025, "o universo da etapa 1 são as 80 de 2022-2025"
    d = d80.copy()
    d["r_val"] = G.posto_ano(d, "tm_valor_total")
    d["y"] = (d.faixa == "sobe").astype(int)
    d["posto_valor"] = _posto_valor(d, "tm_valor_total")
    return d


def quartis_cairam(d, gravado):
    # Mesmo corte de `G.etapa_1` (qcut do posto percentual em 4, rótulos 1..4). A coluna nova só
    # acrescenta a soma de quem caiu; n e subiram são conferidos contra o gravado antes.
    q = pd.qcut(d.r_val, 4, labels=[1, 2, 3, 4])
    por_q = {}
    for lab, g in d.groupby(q, observed=True):
        por_q[int(lab)] = dict(n=len(g), subiram=int(g.y.sum()), cairam=int((g.faixa == "cai").sum()))
    for Q in gravado:
        m = por_q[Q["quartil"]]
        assert (m["n"], m["subiram"]) == (Q["n"], Q["subiram"]), ("quartil diverge do gravado", Q, m)
    return {k: v["cairam"] for k, v in por_q.items()}


def auc_extras(d, n_boot):
    anos = sorted(int(a) for a in d.ano.unique())
    rv = d.r_val.values
    sobe = (d.faixa == "sobe").values
    meio = (d.faixa == "meio").values
    cai = (d.faixa == "cai").values
    ano = d.ano.values

    # Intervalo do AUC sobe x resto: temporadas de clube sorteadas com reposição DENTRO do ano (cada
    # réplica mantém a estrutura de 20 por ano), o posto de cada linha é o do ano original — o mesmo
    # desenho do bootstrap de `G.valor_por_setor` — e gerador próprio [SEMENTE, 1, 1].
    gen = np.random.default_rng(SEMENTE_IC_AUC)
    idx_ano = [np.where(ano == a)[0] for a in anos]
    aucs = []
    for _ in range(n_boot):
        am = np.concatenate([gen.choice(ix, size=len(ix), replace=True) for ix in idx_ano])
        yy = sobe[am]
        if yy.all() or not yy.any():
            continue
        s = rv[am]
        aucs.append(G.auc(s[yy], s[~yy]))
    lo, hi = np.percentile(np.array(aucs), [2.5, 97.5])
    obs = G.auc(rv[sobe], rv[~sobe])

    por_ano, cm_por_ano = [], []
    for a in anos:
        m = ano == a
        por_ano.append(dict(ano=a, auc_sobe_x_resto=G.r(G.auc(rv[m & sobe], rv[m & ~sobe]), 3)))
        cm_por_ano.append(dict(ano=a, auc=G.r(G.auc(rv[m & meio], rv[m & cai]), 3)))

    # Quem caiu contra o meio: AUC = P(meio mais caro que cai) e Mann-Whitney bilateral no mesmo posto.
    p_cm = stats.mannwhitneyu(rv[meio], rv[cai], alternative="two-sided").pvalue
    return dict(obs=obs, ic95=[G.r(lo, 3), G.r(hi, 3)], replicas=len(aucs), por_ano=por_ano,
                meio_x_cai=G.r(G.auc(rv[meio], rv[cai]), 3), meio_x_cai_por_ano=cm_por_ano,
                p_meio_x_cai=G.r_p(p_cm, 4), p_meio_x_cai_cru=float(p_cm))


def valor_do_posto_k(d):
    out = {}
    for k in KS_EUROS:
        lista = []
        for a, g in d.groupby("ano"):
            s = np.sort(g.tm_valor_total.values.astype(float))[::-1]
            lista.append(dict(ano=int(a), eur=G.r(s[k - 1], 0)))
        out[str(k)] = lista
    return out


def mediana_da_liga(d):
    return [dict(ano=int(a), eur=G.r(g.tm_valor_total.median(), 0)) for a, g in d.groupby("ano")]


def blocos_de_posto(d):
    out = []
    for ini, fim in BLOCOS_DE_POSTO:
        g = d[(d.posto_valor >= ini) & (d.posto_valor <= fim)]
        out.append(dict(posto=f"{ini}-{fim}", posto_ini=ini, posto_fim=fim, n=int(len(g)),
                        subiram=int((g.faixa == "sobe").sum()), cairam=int((g.faixa == "cai").sum()),
                        valor_mediano_eur=G.r(g.tm_valor_total.median(), 0)))
    assert sum(b["n"] for b in out) == len(d), "os blocos declarados não cobrem as 80"
    return out


def vizinhos(d):
    # Para cada promovido: clubes do MESMO ano, fora ele próprio, com posto de valor a até N posições,
    # que não subiram. Um mesmo vizinho conta para cada promovido de quem está perto (a soma repete).
    sobe = d[d.faixa == "sobe"]
    out = []
    for N in VIZINHOS_ATE:
        tot = 0
        for r_ in sobe.itertuples():
            g = d[(d.ano == r_.ano) & (d.clube != r_.clube) & ((d.posto_valor - r_.posto_valor).abs() <= N)]
            tot += int((g.faixa != "sobe").sum())
        out.append(dict(ate=int(N), nao_subiram=tot, por_promovido=G.r(tot / len(sobe), 2)))
    return out


def top4_posicao_final(d, gravado_por_ano):
    # O top 4 é refeito com a MESMA chamada do gerador (`nlargest(4, "tm_valor_total")`) e conferido
    # clube a clube, na ordem, contra o gravado; só então se acrescenta a posição final.
    out = {}
    for a, g in d.groupby("ano"):
        top = g.nlargest(4, "tm_valor_total")
        out[int(a)] = (list(top.clube), [int(p) for p in top.pos])
    for L in gravado_por_ano:
        clubes, pos = out[L["ano"]]
        assert clubes == L["top4"], ("top 4 diverge do gravado", L["ano"], clubes, L["top4"])
    return {a: v[1] for a, v in out.items()}


def rebaixados_por_posto(d, col, k_quartil):
    """Postos dos rebaixados numa coluna de valor, a curva acumulada e o p exato do top k."""
    assert d[col].notna().all(), f"{col} tem valor faltando nas 80"
    pv = _posto_valor(d, col)
    cai = d.faixa == "cai"
    anos = sorted(int(a) for a in d.ano.unique())
    tamanhos = [int((d.ano == a).sum()) for a in anos]
    cai_por_ano = [int(((d.ano == a) & cai).sum()) for a in anos]
    postos = pv[cai].astype(int).values
    no_k = int((postos <= k_quartil).sum())
    # A mesma convolução de hipergeométricas da curva dos promovidos (`G._pmf_hiper_convoluida`), com
    # os rebaixados no lugar dos promovidos; aqui a cauda é a de BAIXO: P(soma <= observado).
    pmf = G._pmf_hiper_convoluida(tamanhos, cai_por_ano, k_quartil)
    p = float(pmf[: no_k + 1].sum())
    rebaixados = sorted(((int(a), c, int(p_)) for a, c, p_ in zip(d.ano[cai], d.clube[cai], pv[cai])),
                        key=lambda t: (t[2], t[0], t[1]))
    return dict(postos=postos, no_k=no_k, p=p, rebaixados=rebaixados, tamanhos=tamanhos,
                cai_por_ano=cai_por_ano, n_max=max(tamanhos))


def q_setores(d, gravados):
    # O p cru de `G.valor_por_setor` refeito com a mesma chamada (posto_ano + mannwhitneyu), conferido
    # contra o p gravado (r_sig 3), e o BH nos 4 setores decidido no p SEM arredondar.
    faixa = d.faixa.values
    ps = {}
    for nome, col in G.SETORES_VALOR:
        pp = G.posto_ano(d, col).values
        ps[nome] = stats.mannwhitneyu(pp[faixa == "sobe"], pp[faixa == "meio"]).pvalue
        grav = next(L for L in gravados if L["setor"] == nome)["p_sobe_x_meio"]
        assert G.r_sig(ps[nome], 3) == grav, ("p do setor diverge do gravado", nome, ps[nome], grav)
    qs = G.bh([ps[s] for s in SETORES_EUROS])
    return {s: G.r_sig(q, 3) for s, q in zip(SETORES_EUROS, qs)}


def por_clube(d):
    linhas = []
    for r_ in d.sort_values(["ano", "clube"]).itertuples():
        tot = float(r_.tm_valor_total)
        L = dict(ano=int(r_.ano), clube=r_.clube, faixa=r_.faixa)
        for nome, col in G.SETORES_VALOR:
            L[f"pct_{nome}"] = G.r(100 * float(getattr(r_, col)) / tot, 1)
        linhas.append(L)
    return linhas


# ---------- aplicar ----------

def aplicar(saida, ctx):
    d80 = ctx["d80"]
    e1 = saida["etapa_1"]
    decl_ok = _conferir_declaracoes()

    novos_e1 = ("valor_mediano_da_liga_por_ano", "blocos_de_posto", "vizinhos_de_valor",
                "curva_top_k_rebaixados", "declaracoes_bloco_2")
    for k in novos_e1:
        assert k not in e1, f"etapa_1.{k} já existe: este módulo só acrescenta"
    assert "por_clube" not in e1["valor_por_setor"]
    for k in ("ic95", "por_ano", "meio_x_cai", "meio_x_cai_por_ano", "p_meio_x_cai"):
        assert k not in e1["auc_posto_de_valor"]
    for k in ("valor_do_posto_k_por_ano", "ks_da_tabela"):
        assert k not in e1["curva_top_k"]
    assert "afirmado_n" not in e1["curva_top_k"]["palpite_do_dono"]
    assert "sensibilidade_fonte_valor" not in e1

    d = _base(d80)
    uni = _universo(d)
    gravados = []

    # 1. quartis[].cairam
    cair = quartis_cairam(d, e1["quartis"])
    for Q in e1["quartis"]:
        Q["cairam"] = cair[Q["quartil"]]
    gravados.append("etapa_1.quartis[].cairam")

    # 2-6. auc_posto_de_valor
    ax = auc_extras(d, G.N_BOOT)
    assert G.r(ax["obs"], 3) == e1["auc_posto_de_valor"]["sobe_x_resto"], "AUC sobe x resto diverge do gravado"
    apv = e1["auc_posto_de_valor"]
    apv["ic95"] = ax["ic95"]
    apv["por_ano"] = ax["por_ano"]
    apv["meio_x_cai"] = ax["meio_x_cai"]
    apv["meio_x_cai_por_ano"] = ax["meio_x_cai_por_ano"]
    apv["p_meio_x_cai"] = ax["p_meio_x_cai"]
    gravados += ["etapa_1.auc_posto_de_valor.ic95", "etapa_1.auc_posto_de_valor.por_ano",
                 "etapa_1.auc_posto_de_valor.meio_x_cai", "etapa_1.auc_posto_de_valor.meio_x_cai_por_ano",
                 "etapa_1.auc_posto_de_valor.p_meio_x_cai"]

    # 7-9. curva_top_k
    ct = e1["curva_top_k"]
    ct["valor_do_posto_k_por_ano"] = valor_do_posto_k(d)
    ct["ks_da_tabela"] = list(DECL_ETAPA_1_TABELA_E_EUROS["ks_da_tabela"])
    # O número do palpite sai do PRÓPRIO texto gravado ('>= 14'), não é digitado; e confere com a chave
    # que o gerador já calculou a partir dele (`menor_k_com_14` é o menor k com >= esse número).
    m = re.fullmatch(r"\s*>=\s*(\d+)\s*", ct["palpite_do_dono"]["afirmado"])
    assert m, ct["palpite_do_dono"]["afirmado"]
    afirmado_n = int(m.group(1))
    mk = ct["palpite_do_dono"]["menor_k_com_14"]
    assert mk is None or next(L["k"] for L in ct["curva"] if L["promovidos_acumulados"] >= afirmado_n) == mk
    ct["palpite_do_dono"]["afirmado_n"] = afirmado_n
    gravados += ["etapa_1.curva_top_k.valor_do_posto_k_por_ano", "etapa_1.curva_top_k.ks_da_tabela",
                 "etapa_1.curva_top_k.palpite_do_dono.afirmado_n"]

    # 10-12. euros da liga, blocos de posto, vizinhos
    e1["valor_mediano_da_liga_por_ano"] = mediana_da_liga(d)
    e1["blocos_de_posto"] = blocos_de_posto(d)
    e1["vizinhos_de_valor"] = vizinhos(d)
    gravados += ["etapa_1.valor_mediano_da_liga_por_ano", "etapa_1.blocos_de_posto", "etapa_1.vizinhos_de_valor"]

    # 13. top4_de_valor.por_ano[].posicao_final
    pf = top4_posicao_final(d, e1["top4_de_valor"]["por_ano"])
    for L in e1["top4_de_valor"]["por_ano"]:
        L["posicao_final"] = pf[L["ano"]]
    gravados.append("etapa_1.top4_de_valor.por_ano[].posicao_final")

    # 14. curva_top_k_rebaixados. k = tamanho do quartil de cima POR ANO: quartis[4].n / nº de anos,
    # lido do que o gerador gravou (20 / 4), com a exigência de dar inteiro.
    n_anos = len(ct["anos"])
    n_q4 = next(Q["n"] for Q in e1["quartis"] if Q["quartil"] == 4)
    assert n_q4 % n_anos == 0, ("o quartil de cima não dá um número inteiro por ano", n_q4, n_anos)
    k_quartil = n_q4 // n_anos
    tm = rebaixados_por_posto(d, "tm_valor_total", k_quartil)
    e1["curva_top_k_rebaixados"] = dict(
        **uni,
        declaracao="valor_DIN01_DIN03 (texto em etapa_1.declaracoes_bloco_2)",
        coluna="tm_valor_total",
        regra_do_posto="posto dentro do ano pelo tm_valor_total, 1 = mais caro, empate pelo menor posto (a de curva_top_k)",
        modelo_do_acaso=("hipergeométrica por ano (N clubes, K rebaixados, k do quartil), convoluída nos anos; "
                         "p_quartil = P(soma <= observado)"),
        clubes_por_ano=tm["tamanhos"], rebaixados_por_ano=tm["cai_por_ano"],
        curva=[dict(k=k, rebaixados_acumulados=int((tm["postos"] <= k).sum())) for k in range(1, tm["n_max"] + 1)],
        rebaixados=[dict(ano=a, clube=c, posto_valor=p) for a, c, p in tm["rebaixados"]],
        k_quartil=k_quartil, k_quartil_de_onde="etapa_1.quartis[quartil=4].n / len(etapa_1.curva_top_k.anos)",
        rebaixados_no_quartil=tm["no_k"],
        p_quartil=G.r_p(tm["p"], 4))
    gravados.append("etapa_1.curva_top_k_rebaixados")

    # 15. sensibilidade_fonte_valor (Wyscout, coluna valor_total)
    wy = rebaixados_por_posto(d, "valor_total", k_quartil)
    tres = sorted(wy["postos"].tolist())[:3]
    no_top = [(a, c, p) for a, c, p in wy["rebaixados"] if p <= k_quartil]
    e1["sensibilidade_fonte_valor"] = dict(
        **uni,
        declaracao="valor_DIN01_DIN03 (texto em etapa_1.declaracoes_bloco_2)",
        coluna="valor_total",
        fonte="Wyscout (valor_total de dados/serieb_clube_temporada.csv)",
        regra_do_posto="posto dentro do ano pelo valor_total, 1 = mais caro, empate pelo menor posto",
        postos_rebaixados_valor_total=[int(x) for x in tres],
        k=k_quartil,
        rebaixados_no_top_k=len(no_top),
        nomes=[_nome_clube_ano(c, a) for a, c, _ in no_top],
        rebaixados_no_top_k_detalhe=[dict(ano=a, clube=c, posto_valor=p) for a, c, p in no_top],
        p_quartil=G.r_p(wy["p"], 4))
    gravados.append("etapa_1.sensibilidade_fonte_valor")

    # 16. valor_por_setor.setores[].q_sobe_x_meio
    vps = e1["valor_por_setor"]
    qs = q_setores(d, vps["setores"])
    for L in vps["setores"]:
        if L["setor"] in qs:
            L["q_sobe_x_meio"] = qs[L["setor"]]
        else:
            # o total não é um dos 4 setores da partição: fica fora da família do BH
            L["q_sobe_x_meio"] = None
            L["q_sobe_x_meio_motivo"] = ("o total não entra no BH dos %d setores; é o teste único da DIN-01 "
                                         "(q = p_sobe_x_meio)" % len(SETORES_EUROS))
    gravados.append("etapa_1.valor_por_setor.setores[].q_sobe_x_meio")

    # 17. valor_por_setor.por_clube
    vps["por_clube"] = por_clube(d)
    gravados.append("etapa_1.valor_por_setor.por_clube")

    # A declaração vai junto (ver cabeçalho).
    e1["declaracoes_bloco_2"] = dict(
        o_que_e=("texto das declarações que cobrem os campos da etapa 1 gravados no bloco 2 do gerador "
                 "(gerar_prototipo_b2_etapa1.py), copiado de declaracoes_novas.json antes de medir"),
        conferencia=decl_ok,
        **uni,
        regra_do_q_sobe_x_meio="Benjamini-Hochberg nos %d setores (%s), no p sem arredondar" % (
            len(SETORES_EUROS), ", ".join(SETORES_EUROS)),
        semente_do_ic95=SEMENTE_IC_AUC, replicas_do_ic95=int(ax["replicas"]), replicas_pedidas=int(G.N_BOOT),
        declaracoes={
            "valor_DIN01_DIN03": dict(texto=DECL_VALOR_DIN01_DIN03, campos=[
                "etapa_1.quartis[].cairam", "etapa_1.auc_posto_de_valor.ic95", "etapa_1.auc_posto_de_valor.por_ano",
                "etapa_1.auc_posto_de_valor.meio_x_cai", "etapa_1.auc_posto_de_valor.meio_x_cai_por_ano",
                "etapa_1.auc_posto_de_valor.p_meio_x_cai", "etapa_1.top4_de_valor.por_ano[].posicao_final",
                "etapa_1.curva_top_k_rebaixados", "etapa_1.sensibilidade_fonte_valor"]),
            "etapa_1_tabela_e_euros": dict(texto=DECL_ETAPA_1_TABELA_E_EUROS, campos=[
                "etapa_1.curva_top_k.valor_do_posto_k_por_ano", "etapa_1.curva_top_k.ks_da_tabela",
                "etapa_1.valor_mediano_da_liga_por_ano", "etapa_1.blocos_de_posto", "etapa_1.vizinhos_de_valor"]),
            "valor_por_setor_extras_DIN04_DIN05": dict(texto=DECL_VALOR_POR_SETOR_EXTRAS, campos=[
                "etapa_1.valor_por_setor.setores[].q_sobe_x_meio", "etapa_1.valor_por_setor.por_clube"]),
        },
        sem_declaracao={"etapa_1.curva_top_k.palpite_do_dono.afirmado_n":
                        "não é análise nova: o número do texto afirmado ('>= 14') já gravado"})
    assert sorted(gravados) == sorted(CAMPOS), set(gravados) ^ set(CAMPOS)
    return gravados


def ctx_de_teste():
    """ctx sem rodar o main: só o painel (d80). A saída gravada é lida por `saida_gravada()`."""
    _d100, d80 = G.carregar_painel()
    return dict(G=G, d80=d80, d100=_d100)


def saida_gravada():
    return json.load(open(G.SAIDA, encoding="utf-8"))


if __name__ == "__main__":
    # Teste do módulo: grava SÓ no rascunho indicado em argv[1] (nunca em dados/).
    import sys
    destino = sys.argv[1]
    s = saida_gravada()
    feitos = aplicar(s, ctx_de_teste())
    os.makedirs(destino, exist_ok=True)
    json.dump(s, open(os.path.join(destino, "prototipo_b2_etapa1.json"), "w", encoding="utf-8"),
              ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    print("gravados:", len(feitos))
