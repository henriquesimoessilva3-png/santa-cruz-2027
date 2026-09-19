"""Bloco 2 do gerador do Protótipo: `conclusoes_base.origem` e o bloco `conclusoes`.

Dono deste arquivo: o módulo das conclusões (ordem de serviço
`_fonte/prototipo/sessao_14_09/ordem_gerador_bloco2.json`, campos com rodada "bloco_2" cujo caminho
começa por `conclusoes_base`, e o campo `conclusoes`, chave `bloco_conclusoes` da ordem).

Contrato dos módulos (um dono por arquivo, nada de editar o gerador):
    CAMPOS            os caminhos da ordem que este módulo grava;
    aplicar(saida, ctx)  acrescenta em `saida` SÓ esses caminhos e devolve a lista gravada;
    ctx_de_teste()    monta o ctx sem rodar o main e traz a saída gravada em `saida_gravada`.

Do ctx do main este módulo usa: `G` (o próprio gerar_prototipo), `d80` (as 80 clube-temporadas
2022-2025) e, se houver, `dv` (o painel 2018-2021 já cortado em 2025, a mesma variável do main).
Sem `dv`, lê o CSV do mesmo jeito que o main lê.

O bloco `conclusoes` roda POR ÚLTIMO: lê o spec (`_fonte/prototipo/conclusoes_spec.json`) e o próprio
dado já montado, calcula o selo de cada conclusão pela `regra_maquina` do spec e monta os textos pelos
moldes. Nada de número digitado: todo número sai de um caminho do dado; o que não tem caminho gravado
fica com o motivo escrito (campo ausente, ou instrução de lacuna que o gerador não consegue ler sem
inventar — nome simples do glossário, artigo do nome do clube).
"""
import copy
import hashlib
import json
import math
import os
import re
from decimal import Decimal, ROUND_HALF_UP
from fractions import Fraction

import numpy as np
import pandas as pd
from scipy import stats

import gerar_prototipo as G

RAIZ = G.RAIZ
SPEC_ARQ = os.path.join(RAIZ, "_fonte", "prototipo", "conclusoes_spec.json")
CEGO_ARQ = os.path.join(RAIZ, "_fonte", "prototipo", "teste_cego_2018_2021.json")
ORIGEM_ARQ = os.path.join(RAIZ, "dados", "serieb_origem_2018_2026.csv")
PAINEL_ANTIGO_ARQ = os.path.join(RAIZ, "dados", "serieb_clube_temporada_2018_2021.csv")

CAMPOS = [
    "conclusoes_base.origem.anos_da_conta",
    "conclusoes_base.origem.anos_sensibilidade",
    "conclusoes_base.origem.por_origem",
    "conclusoes_base.origem.sensibilidade",
    "conclusoes_base.origem.fisher",
    "conclusoes_base.origem.por_periodo",
    "conclusoes_base.origem.dinheiro",
    "conclusoes_base.origem.poder",
    "conclusoes",
]


# ══════════════════════════════════════════════════════════════════════════════
#  1. conclusoes_base.origem
# ══════════════════════════════════════════════════════════════════════════════

# Declaração `origem` de _fonte/prototipo/sessao_14_09/declaracoes_novas.json, copiada ANTES de medir
# (o gerador não lê aquele arquivo; a regra mora aqui e o texto vai junto no JSON).
ORIGEM_DECL = {
    "_doc": "origem do clube na Série B (veio da A / já estava na B / veio da C). Base gravada e conferida em 14/09.",
    "base": "dados/serieb_origem_2018_2026.csv",
    "colunas_da_base": ["ano", "clube", "origem", "fonte_1", "fonte_2", "conferido_jogo_a_jogo", "nota"],
    "categorias": ["A", "B", "C"],
    "anos_da_conta": [2019, 2025],
    "anos_sensibilidade": [2018, 2025],
    "ano_so_descricao": 2026,
    "desfechos": ["subiu", "caiu", "ritmo_de_briga (faixa alta)", "ritmo_de_queda (faixa baixa)"],
    "comparacoes": ["A_x_B", "C_x_B", "A_x_C"],
    "teste": "Fisher exato bilateral",
    "por_periodo": [[2019, 2021], [2022, 2025]],
    "dinheiro": {
        "_doc": ("SÓ DESCRIÇÃO do valor de elenco com que cada origem chega, para a ressalva sem desconto da ORI-01 "
                 "('esses clubes chegam com um dos elencos mais valiosos do ano; o estudo não separa as duas coisas'). "
                 "Não há subidas esperadas, permutação dentro do quartil de valor nem razão de verossimilhança: isso "
                 "era descontar o dinheiro e saiu."),
        "anos": [2022, 2025],
        "posto": "tm_valor_total no ano, 1 = mais caro",
        "gravar": "conclusoes_base.origem.dinheiro = {anos, por_origem: {A|B|C: {n, posto_mediano, valor_mediano_eur}}}",
        "sai_nesta_versao": ["esperado (as dez especificações logísticas e de quartil)", "permutacao",
                             "razao_de_verossimilhanca", "gravar_faixa"],
    },
    "poder": {
        "teste": "Fisher 0,05",
        "simulacoes": 2000,
        "semente": "np.random.default_rng([SEMENTE, 16, 2])",
        "cenarios": "subida alvo 25% a 55% contra a taxa de B; queda alvo 0% a 15% contra a taxa de B",
        "limiar": 0.7,
        "frase": "a menor subida de C detectada com poder >= limiar contra a taxa de B",
    },
    "gravar": ("conclusoes_base.origem = {anos_da_conta, anos_sensibilidade, por_origem, sensibilidade, fisher, "
               "por_periodo, dinheiro (só descrição), poder, faixa_de_pontos: null}"),
    "declarada_depois_de_olhar": True,
}

# O que a declaração não fixa e este módulo decidiu, escrito antes de rodar:
# - o PASSO da grade de cenários do poder: 5 pontos percentuais, o mesmo das tabelas de 14/09 (o2_remedir.py);
#   subida 25, 30, ..., 55% e queda 0, 5, 10, 15%, nessa ordem, com UM gerador para a grade inteira;
# - "menor subida detectada" = o menor alvo ACIMA da taxa de B com poder >= limiar; "menor queda detectada" = o
#   alvo mais perto da taxa de B, por baixo, com poder >= limiar (a menor diferença que o estudo enxergaria);
# - a faixa de pontos de cada clube-temporada segue a régua da aba por pontos (gerar_pontos.carregar_paineis):
#   aproveitamento pts / (3 × J) em fração exata; alta >= média do 6º colocado de 2022-2025, baixa < média do 15º;
# - o posto de valor usa o empate pelo MENOR posto (rank method='min'), como o main e a curva_top_k.
PODER_PASSO_PP = 5
PODER_SUBIDA_PP = (25, 55)
PODER_QUEDA_PP = (0, 15)
PODER_SEMENTE = [G.SEMENTE, 16, 2]


def _fisher(x1, n1, x2, n2):
    return float(stats.fisher_exact([[x1, n1 - x1], [x2, n2 - x2]])[1])


def _painel_com_origem(ctx):
    """2018-2025 com origem, desfecho e faixa de pontos. 2026 fica fora por construção."""
    d80 = ctx["d80"]
    dv = ctx.get("dv")
    if dv is None:
        dv = pd.read_csv(PAINEL_ANTIGO_ARQ)
        dv = dv[dv.ano <= 2025].reset_index(drop=True)
    o = pd.read_csv(ORIGEM_ARQ)
    assert list(o.columns) == ORIGEM_DECL["colunas_da_base"], list(o.columns)
    assert sorted(o.origem.unique()) == ORIGEM_DECL["categorias"]
    antigo = dv[["ano", "clube", "pos", "pts", "J", "subiu", "caiu", "faixa"]].copy()
    antigo["tm_valor_total"] = np.nan
    novo = d80[["ano", "clube", "pos", "pts", "J", "subiu", "caiu", "faixa", "tm_valor_total"]].copy()
    d = pd.concat([antigo, novo], ignore_index=True)
    assert int(d.ano.max()) <= 2025, "2026 entrou na conta da origem"
    d = d.merge(o[["ano", "clube", "origem"]], on=["ano", "clube"], how="left", validate="one_to_one")
    assert d.origem.notna().all(), d[d.origem.isna()][["ano", "clube"]].values.tolist()
    d["subiu"] = d.subiu.astype(bool)
    d["caiu"] = d.caiu.astype(bool)
    assert ((d.faixa == "sobe") == d.subiu).all() and ((d.faixa == "cai") == d.caiu).all()

    # cortes da faixa de pontos: média das frações do 6º e do 15º de 2022-2025
    def media_do_posto(pos):
        g = d80[d80.pos == pos]
        assert len(g) == d80.ano.nunique()
        fr = [Fraction(int(p), 3 * int(j)) for p, j in zip(g.pts, g.J)]
        return sum(fr, Fraction(0)) / len(fr)

    alto, baixo = media_do_posto(6), media_do_posto(15)
    fr = [Fraction(int(p), 3 * int(j)) for p, j in zip(d.pts, d.J)]
    d["faixa_alta"] = [x >= alto for x in fr]
    d["faixa_baixa"] = [x < baixo for x in fr]
    return d, (alto, baixo)


def _contagem(s, com_faixa=True):
    out = {}
    for og in ORIGEM_DECL["categorias"]:
        t = s[s.origem == og]
        e = dict(n=int(len(t)), subiu=int(t.subiu.sum()), caiu=int(t.caiu.sum()))
        if com_faixa:
            e.update(faixa_alta=int(t.faixa_alta.sum()), faixa_baixa=int(t.faixa_baixa.sum()))
        out[og] = e
    return out


def _fisher_bloco(cont, comparacoes):
    """{A_x_B: {p_subida, p_queda, p_subida_cru, p_queda_cru}}: p como o gerador grava (r_p) e o cru ao lado
    (a convenção `_cru` do gerador, a mesma de `p_clube_cru`), porque o desempate das cinco lê o p sem arredondar."""
    out = {}
    for comp in comparacoes:
        o1, o2 = comp.split("_x_")
        a, b = cont[o1], cont[o2]
        ps = _fisher(a["subiu"], a["n"], b["subiu"], b["n"])
        pq = _fisher(a["caiu"], a["n"], b["caiu"], b["n"])
        out[comp] = dict(p_subida=G.r_p(ps), p_queda=G.r_p(pq), p_subida_cru=ps, p_queda_cru=pq)
    return out


def _janela(d, anos):
    return d[(d.ano >= anos[0]) & (d.ano <= anos[1])]


def _poder(n1, n2, taxa_b, desfecho, alvos, gen, sims, cache):
    cen = []
    for alvo in alvos:
        h = 0
        for _ in range(sims):
            x1 = int(gen.binomial(n1, float(alvo)))
            x2 = int(gen.binomial(n2, float(taxa_b)))
            chave = (x1, x2)
            if chave not in cache:
                cache[chave] = _fisher(x1, n1, x2, n2) < 0.05
            h += cache[chave]
        cen.append(dict(grupo="C", desfecho=desfecho, alvo=float(alvo), taxa_B=G.r(float(taxa_b), 4),
                        n1=int(n1), n2=int(n2), poder=G.r(h / sims, 3)))
    return cen


def medir_origem(ctx):
    d, (alto, baixo) = _painel_com_origem(ctx)
    anos = ORIGEM_DECL["anos_da_conta"]
    anos_s = ORIGEM_DECL["anos_sensibilidade"]
    comps = ORIGEM_DECL["comparacoes"]
    base = _janela(d, anos)
    universo = "clube-temporadas da Série B de %d a %d com origem na base pública (dados/serieb_origem_2018_2026.csv); 2026 fora de toda conta"
    faixa_txt = ("faixa de pontos pela régua da aba por pontos: aproveitamento pts/(3J) em fração exata; alta >= %s "
                 "(média do 6º de 2022-2025), baixa < %s (média do 15º)" % (f"{alto.numerator}/{alto.denominator}",
                                                                          f"{baixo.numerator}/{baixo.denominator}"))

    por_origem = _contagem(base)
    fisher = _fisher_bloco(por_origem, comps)

    sens_base = _janela(d, anos_s)
    sens_cont = _contagem(sens_base, com_faixa=False)
    sensibilidade = dict(sens_cont)
    sensibilidade["fisher"] = {k: v for k, v in _fisher_bloco(sens_cont, ["A_x_B", "C_x_B"]).items()}
    sensibilidade.update(universo=universo % tuple(anos_s), anos=list(anos_s), n=int(len(sens_base)))

    por_periodo = {}
    for ini, fim in ORIGEM_DECL["por_periodo"]:
        s = _janela(d, [ini, fim])
        c = _contagem(s)
        por_periodo[f"{ini}-{fim}"] = dict(por_origem=c, fisher=_fisher_bloco(c, comps),
                                          universo=universo % (ini, fim), anos=[ini, fim], n=int(len(s)))

    anos_d = ORIGEM_DECL["dinheiro"]["anos"]
    m = _janela(d, anos_d).copy()
    assert m.tm_valor_total.notna().all()
    m["posto"] = m.groupby("ano").tm_valor_total.rank(ascending=False, method="min")
    dinheiro = dict(anos=list(anos_d), por_origem={
        og: dict(n=int((m.origem == og).sum()),
                 posto_mediano=G.r(float(m[m.origem == og].posto.median()), 1),
                 valor_mediano_eur=G.r(float(m[m.origem == og].tm_valor_total.median()), 0))
        for og in ORIGEM_DECL["categorias"]},
        universo=universo % tuple(anos_d) + "; valor de mercado do Transfermarkt (não é folha nem gasto)",
        n=int(len(m)), posto=ORIGEM_DECL["dinheiro"]["posto"] + ", empate pelo menor posto",
        declaracao=ORIGEM_DECL["dinheiro"])

    b, c_ = por_origem["B"], por_origem["C"]
    taxa_sub = Fraction(b["subiu"], b["n"])
    taxa_cai = Fraction(b["caiu"], b["n"])
    gen = np.random.default_rng(PODER_SEMENTE)
    sims = ORIGEM_DECL["poder"]["simulacoes"]
    limiar = ORIGEM_DECL["poder"]["limiar"]
    alv_s = [Fraction(k, 100) for k in range(PODER_SUBIDA_PP[0], PODER_SUBIDA_PP[1] + 1, PODER_PASSO_PP)]
    alv_q = [Fraction(k, 100) for k in range(PODER_QUEDA_PP[0], PODER_QUEDA_PP[1] + 1, PODER_PASSO_PP)]
    cenarios = (_poder(c_["n"], b["n"], taxa_sub, "subida", alv_s, gen, sims, {})
                + _poder(c_["n"], b["n"], taxa_cai, "queda", alv_q, gen, sims, {}))
    sub_ok = [x for x in cenarios if x["desfecho"] == "subida" and x["alvo"] > float(taxa_sub) and x["poder"] >= limiar]
    que_ok = [x for x in cenarios if x["desfecho"] == "queda" and x["alvo"] < float(taxa_cai) and x["poder"] >= limiar]
    menor_sub = min(sub_ok, key=lambda x: x["alvo"]) if sub_ok else None
    menor_que = max(que_ok, key=lambda x: x["alvo"]) if que_ok else None
    poder = dict(limiar=limiar, simulacoes=sims, semente=list(PODER_SEMENTE), cenarios=cenarios,
                 menor_subida_detectada_C=menor_sub["alvo"] if menor_sub else None,
                 taxa_B_subida=G.r(float(taxa_sub), 4),
                 poder_na_menor_subida=menor_sub["poder"] if menor_sub else None,
                 menor_queda_detectada_C=menor_que["alvo"] if menor_que else None,
                 taxa_B_queda=G.r(float(taxa_cai), 4),
                 motivo_se_nulo=("nenhum cenário da grade chegou ao limiar" if (menor_sub is None or menor_que is None) else None),
                 grade=("subida de %d%% a %d%% e queda de %d%% a %d%%, passo de %d pontos (a declaração não fixa o passo; "
                        "é o das tabelas de 14/09); menor subida = menor alvo acima da taxa de B com poder >= limiar; "
                        "menor queda = alvo mais perto da taxa de B, por baixo, com poder >= limiar"
                        % (PODER_SUBIDA_PP + PODER_QUEDA_PP + (PODER_PASSO_PP,))),
                 universo=universo % tuple(anos) + "; C (n1) contra B (n2)", anos=list(anos), n=int(len(base)),
                 declaracao=ORIGEM_DECL["poder"])
    sensibilidade["declaracao"] = {k: v for k, v in ORIGEM_DECL.items() if k not in ("dinheiro", "poder")}
    sensibilidade["faixa_de_pontos_regua"] = faixa_txt
    return {
        "anos_da_conta": list(anos),
        "anos_sensibilidade": list(anos_s),
        "por_origem": por_origem,
        "sensibilidade": sensibilidade,
        "fisher": fisher,
        "por_periodo": por_periodo,
        "dinheiro": dinheiro,
        "poder": poder,
    }


# ══════════════════════════════════════════════════════════════════════════════
#  2. leitor de caminhos (a mesma leitura do spec: chave, [i], [chave=valor])
# ══════════════════════════════════════════════════════════════════════════════

_SEG = re.compile(r"([^.\[\]]+)|\[([^\]]*)\]")
PREFIXO_CEGO = "teste_cego_2018_2021.json "


def _resolve(root, path):
    cur = [root]
    for m in _SEG.finditer(path):
        k, i = m.group(1), m.group(2)
        nxt = []
        for c in cur:
            if k is not None:
                if isinstance(c, dict) and k in c:
                    nxt.append(c[k])
                elif isinstance(c, (list, tuple)):
                    vals = [e[k] for e in c if isinstance(e, dict) and k in e]
                    if vals:
                        nxt.append(vals)
            elif isinstance(c, (list, tuple)):
                if i == "":
                    nxt.append(c)
                elif re.fullmatch(r"-?\d+", i):
                    j = int(i)
                    if -len(c) <= j < len(c):
                        nxt.append(c[j])
                elif "=" in i:
                    kk, vv = i.split("=", 1)
                    nxt.extend([e for e in c if isinstance(e, dict) and str(e.get(kk)) == vv])
        cur = nxt
        if not cur:
            return False, None
    return True, cur[0]


class Leitor:
    def __init__(self, saida, cego):
        self.saida, self.cego = saida, cego

    def ler(self, caminho):
        if caminho is None:
            return False, None
        c = caminho.strip()
        if c.startswith(PREFIXO_CEGO):
            return _resolve(self.cego, c[len(PREFIXO_CEGO):])
        return _resolve(self.saida, c)


class Falta(Exception):
    """lacuna sem valor: o motivo vai ao JSON."""


def _exige(L, caminho):
    ok, v = L.ler(caminho)
    if not ok or v is None:
        raise Falta(f"campo ausente: {caminho}")
    return v


# ══════════════════════════════════════════════════════════════════════════════
#  3. formatos (conclusoes_spec.json, chave formatos; arredondamento comercial)
# ══════════════════════════════════════════════════════════════════════════════

def _q(x, casas):
    return Decimal(str(x)).quantize(Decimal(1).scaleb(-casas), rounding=ROUND_HALF_UP)


def dec(x, casas):
    return f"{_q(x, casas):.{casas}f}".replace("-", "−").replace(".", ",")


def inteiro(x):
    return str(int(_q(x, 0)))


def milhar(x):
    return f"{int(_q(x, 0)):,}".replace(",", ".")


def chance_100(p):
    return "menos de 1 de cada 100 tentativas" if p < 0.01 else f"{inteiro(100 * p)} de cada 100 tentativas"


def chance_1000(p):
    if p >= 0.01:
        return chance_100(p)
    if p >= 0.001:
        return f"{inteiro(1000 * p)} de cada 1.000 tentativas"
    return "menos de 1 de cada 1.000 tentativas"


def tamanho_palavras(d):
    if d < 0.4:
        return "enxergaria até uma diferença pequena"
    if d < 0.9:
        return "só uma diferença grande apareceria"
    return "só uma diferença muito grande apareceria"


EXTENSO = {0: "nenhum", 1: "um", 2: "dois", 3: "três", 4: "quatro", 5: "cinco"}
SELO_MIN = {"forte": "forte", "moderado": "moderado", "fraco": "fraco", "sem_sinal": "sem sinal",
            "nao_da_para_afirmar": "não dá para afirmar"}

FORMATOS = {
    "inteiro": inteiro,
    "inteiro_arredondado": inteiro,
    "dec1": lambda x: dec(x, 1),
    "dec2": lambda x: dec(x, 2),
    "dec3": lambda x: dec(x, 3),
    "milhar": milhar,
    "ano": lambda x: str(int(x)),
    "pct_inteiro": inteiro,
    "chance_em_100": chance_100,
    "chance_em_1000": chance_1000,
    "em_1000": lambda p: f"{inteiro(1000 * p)} de cada 1.000 tentativas",
    "pares_em_100": lambda a: f"{inteiro(100 * a)} de cada 100 pares",
    "pares_numero": lambda a: inteiro(100 * a),
    "pares_em_100_absoluto": lambda x: inteiro(100 * abs(x)),
    "milhoes_dec1": lambda x: dec(x / 1e6, 1),
    "milhoes_inteiro": lambda x: inteiro(x / 1e6),
    "milhares_inteiro": lambda x: milhar(x / 1e3),
    "faixa_inteira": lambda x: (str(int(x)) if float(x).is_integer() else f"{int(x)} ou {int(x) + 1}"),
    "contagem_da_lista": lambda v: str(len(v)),
    "numerador": lambda s: str(s).split("/")[0],
    "texto": lambda s: str(s),
    "tamanho_em_palavras": tamanho_palavras,
    "inteiro_por_extenso_se_zero": lambda x: "nenhum" if int(x) == 0 else inteiro(x),
    "nenhuma_se_zero": lambda x: "nenhuma" if int(x) == 0 else inteiro(x),
    "zero_por_extenso": lambda x: "zero" if int(x) == 0 else inteiro(x),
    "inteiro_por_extenso": lambda x: EXTENSO.get(int(x), inteiro(x)),
    "selo_minusculo": lambda s: SELO_MIN[s],
}


def _lista_e(itens, sep=", "):
    itens = [str(x) for x in itens]
    if len(itens) <= 1:
        return "".join(itens)
    # itens que já têm vírgula dentro ('Remo 2021, 1º') levam vírgula também antes do 'e'
    ultimo = ", e " if any("," in x for x in itens) else " e "
    return sep.join(itens[:-1]) + ultimo + itens[-1]


def _com_sinal(x, casas=2):
    s = dec(abs(x), casas)
    return ("−" if x < 0 else "+") + s


def _par(p):
    anos = re.findall(r"\d{4}", str(p))
    if len(anos) != 2:
        raise Falta(f"par de anos sem dois anos: {p!r}")
    return f"{anos[0]}→{anos[1]}"


def _abaixo(x, lim):
    return G.abaixo(x, lim)


# ══════════════════════════════════════════════════════════════════════════════
#  4. lacunas: campo + 'como' e derivações (cada instrução do spec tem um leitor, ou um motivo)
# ══════════════════════════════════════════════════════════════════════════════

SEM_GLOSSARIO = ("pede o nome simples do glossário, que não está no dado gravado (mora na tela, proto_glossario.js); "
                 "o gerador não escreve nome à mão")
SEM_ARTIGO = "pede o artigo do nome do clube ('o'/'a'), que não está no dado gravado; o gerador não escolhe artigo à mão"
AUC_DO_ACASO = 0.5    # definição do acerto de pares do acaso, não medida


def _como_lista_indicador(L, campo, como):
    base = campo.split("[]")[0]
    resto = campo.split("[]", 1)[1]
    ident = re.match(r"^([A-Za-z0-9_]+)", como).group(1)
    return _exige(L, f"{base}[indicador={ident}]{resto}")


def _por_clube(L):
    return _exige(L, "etapa_2.por_clube")


def _mediana(xs):
    xs = [x for x in xs if x is not None]
    if not xs:
        raise Falta("lista vazia para a mediana")
    return float(np.median(xs))


def _media_por_ano(L, campo, nivel):
    linhas = _exige(L, campo)
    return sorted([e for e in linhas if e.get("nivel", "bruto") == nivel], key=lambda e: e["ano"])


def _t_periodo(e):
    for k in ("t", "anos", "periodo", "anos_t"):
        if k in e:
            v = e[k]
            anos = re.findall(r"\d{4}", str(v))
            if len(anos) >= 2:
                return int(anos[0]), int(anos[1])
    raise Falta("por_periodo sem os anos t do período")


def _periodos(L):
    pp = _exige(L, "etapa_6.colocacao.por_periodo")
    if isinstance(pp, dict):
        itens = []
        for k, v in pp.items():
            anos = re.findall(r"\d{4}", k)
            itens.append((int(anos[0]), int(anos[1])) if len(anos) >= 2 else _t_periodo(v))
        return itens
    return [_t_periodo(e) for e in pp]


def _blocos_colocacao(L):
    pf = _exige(L, "etapa_6.colocacao.por_faixa_de_posicao")
    blocos = []
    chaves = pf.keys() if isinstance(pf, dict) else []
    for k in chaves:
        m = re.fullmatch(r"n_(\d+)_(\d+)", k)
        if m:
            blocos.append((int(m.group(1)), int(m.group(2))))
    if len(blocos) < 2:
        raise Falta("por_faixa_de_posicao sem as chaves n_<ini>_<fim>")
    return blocos


def _clube_ano_n(s):
    m = re.fullmatch(r"\s*(.+?) (\d{4}) \((\d+)º\)\s*", str(s))
    if m:
        return f"{m.group(1)} {m.group(2)}, {m.group(3)}º"
    m = re.fullmatch(r"\s*(.+?) (\d{4}), (\d+)º\s*", str(s))
    if m:
        return f"{m.group(1)} {m.group(2)}, {m.group(3)}º"
    raise Falta(f"nome sem 'CLUBE ANO (Nº)': {s!r}")


def ler_campo(L, campo, como):
    """valor cru de uma lacuna com `campo` (e `como`, quando há)."""
    if not como:
        if "[]" in campo:
            raise Falta(f"o campo {campo} não diz de qual linha da lista ler (sem 'como')")
        return _exige(L, campo)
    cm = como.strip()
    # índice
    if re.fullmatch(r"\[-?\d+\]", cm):
        return _exige(L, campo + cm)
    # 'quartil N' em lista[].campo
    m = re.fullmatch(r"quartil (\d+)", cm)
    if m and "[]" in campo:
        a, b = campo.split("[]", 1)
        return _exige(L, f"{a}[quartil={m.group(1)}]{b}")
    # 'k=N: sub'
    m = re.fullmatch(r"([A-Za-z_]+)=(\d+): ([A-Za-z_]+)", cm)
    if m:
        return _exige(L, f"{campo}[{m.group(1)}={m.group(2)}].{m.group(3)}")
    # 'posto I-F: sub'
    m = re.fullmatch(r"posto (\d+-\d+): ([A-Za-z_]+)", cm)
    if m:
        return _exige(L, f"{campo}[posto={m.group(1)}].{m.group(2)}")
    if cm == "primeiro posto do bloco 5-8":
        return _exige(L, f"{campo}[posto=5-8].posto_ini")
    # 'indicador: sub' numa lista de linhas
    m = re.fullmatch(r"([A-Za-z0-9_]+): ([A-Za-z0-9_]+)", cm)
    if m and campo.endswith(".linhas"):
        return _exige(L, f"{campo}[indicador={m.group(1)}].{m.group(2)}")
    # 'X (valor cru)' numa lista[] de linhas do catálogo
    m = re.fullmatch(r"([A-Za-z0-9_]+) \(valor cru\)", cm)
    if m and "[]" in campo:
        return _como_lista_indicador(L, campo, cm)
    # caminho pontilhado, com um parêntese de leitura no fim ('A.subiu', 'por_origem.A.n (só descrição)')
    m = re.fullmatch(r"([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*)(?: \([^)]*\))?", cm)
    if m and "[" not in campo:
        return _exige(L, f"{campo}.{m.group(1)}")
    h = COMO.get((campo, cm)) or COMO.get((None, cm))
    if h is None:
        raise Falta(f"instrução de lacuna sem leitor no gerador: {campo} / {cm}")
    return h(L, campo)


def _top1_nao_subiu(L, campo):
    por_ano = _exige(L, "etapa_1.top4_de_valor.por_ano")
    prom = _exige(L, "etapa_1.curva_top_k.promovidos")
    subiram = {(int(p["ano"]), p["clube"]) for p in prom}
    for e in sorted(por_ano, key=lambda e: e["ano"]):
        if "posicao_final" not in e:
            raise Falta("campo ausente: etapa_1.top4_de_valor.por_ano[].posicao_final")
        clube = e["top4"][0]
        if (int(e["ano"]), clube) not in subiram:
            return f"o mais caro de {e['ano']}, o {clube}, terminou em {int(e['posicao_final'][0])}º"
    raise Falta("todo posto 1 de valor subiu")


def _por_ano_join(sub, casas_fmt):
    def h(L, campo):
        v = _exige(L, campo)
        return " / ".join(casas_fmt(e[sub]) for e in sorted(v, key=lambda e: e["ano"]))
    return h


def _eur_k(k, qual):
    def h(L, campo):
        v = _exige(L, campo)
        lista = v.get(str(k)) if isinstance(v, dict) else None
        if not lista:
            raise Falta(f"campo ausente: {campo}['{k}']")
        eur = [e["eur"] for e in lista]
        return min(eur) if qual == "min" else max(eur)
    return h


def _mediana_liga(qual):
    def h(L, campo):
        v = sorted(_exige(L, campo), key=lambda e: e["ano"])
        return v[0]["eur"] if qual == "primeiro" else v[-1]["eur"]
    return h


def _nomes_sensibilidade(L, campo):
    nomes = _exige(L, campo)
    if not nomes:
        raise Falta("lista de nomes vazia")
    return _lista_e(["o " + _clube_ano_n(n) for n in nomes])


def _tres_menores(L, campo):
    v = sorted(int(x) for x in _exige(L, campo))[:3]
    return _lista_e([str(x) for x in v])


def _pct_defesa_sobe_abaixo_meio(L, campo):
    pc = _exige(L, campo)
    med = _mediana([e.get("pct_defesa") for e in pc if e["faixa"] == "meio"])
    return sum(1 for e in pc if e["faixa"] == "sobe" and e.get("pct_defesa") is not None and e["pct_defesa"] < med)


def _frase_poder(L, campo):
    pod = _exige(L, campo)
    ms, tb, pw, mq = (pod.get("menor_subida_detectada_C"), pod.get("taxa_B_subida"),
                     pod.get("poder_na_menor_subida"), pod.get("menor_queda_detectada_C"))
    if ms is None or pw is None or mq is None:
        raise Falta("poder sem cenário acima do limiar")
    alvos_queda = sorted(c["alvo"] for c in pod["cenarios"] if c["desfecho"] == "queda")
    if mq != alvos_queda[0]:
        raise Falta("a frase declarada só cobre a queda detectada no menor alvo da grade ('perto de zero')")
    return (f"uma subida de {inteiro(100 * ms)}% contra {inteiro(100 * tb)}% apareceria em "
            f"{inteiro(10 * pw)} de cada 10 amostras, e uma queda mais baixa só se fosse perto de zero")


def _por_clube_conta(pred):
    def h(L, campo):
        return pred(_por_clube(L))
    return h


def _share11_acima(pc):
    med = _mediana([e["brutos"].get("share_11") for e in pc if e["faixa"] == "meio"])
    return sum(1 for e in pc if e["faixa"] == "sobe" and e["brutos"].get("share_11") is not None and e["brutos"]["share_11"] > med)


def _estrangeiros_zero(pc):
    return sum(1 for e in pc if e["faixa"] == "sobe" and e["brutos"].get("min_estrangeiros") == 0)


def _mais_correu_caiu(L, campo):
    pc = _por_clube(L)
    x = [e for e in pc if e["faixa"] == "cai" and e.get("posicao_no_ano", {}).get("fis_distance_p90") == 1]
    if not x:
        raise Falta("nenhum rebaixado com posto 1 de fis_distance_p90")
    x = sorted(x, key=lambda e: e["ano"])
    return _lista_e([f"o {e['clube']} de {e['ano']}" for e in x])


def _dist_remate_abaixo(pc):
    out = 0
    for ano in sorted({e["ano"] for e in pc}):
        g = [e for e in pc if e["ano"] == ano]
        med = _mediana([e["brutos"].get("dist_remate") for e in g])
        out += sum(1 for e in g if e["faixa"] == "sobe" and e["brutos"].get("dist_remate") is not None and e["brutos"]["dist_remate"] < med)
    return out


def _ano_contra_estrangeiros(L, campo):
    v = [e for e in _media_por_ano(L, campo, "bruto") if e["sobe"] < e["meio"]]
    if not v:
        raise Falta("nenhum ano com sobe abaixo do meio")
    return "; ".join(f"em {e['ano']} quem subiu usou menos que o meio ({dec(e['sobe'], 1)}% contra {dec(e['meio'], 1)}%)" for e in v)


def _anos_residuo_menor(L, campo):
    v = [str(e["ano"]) for e in _media_por_ano(L, campo, "rod") if e["sobe"] < e["meio"]]
    if not v:
        raise Falta("nenhum ano com resíduo de sobe menor que o de meio")
    return _lista_e(v)


def _anos_residuo_maior(L, campo):
    return sum(1 for e in _media_por_ano(L, campo, "rod") if e["sobe"] > e["meio"])


def _periodo_t(i):
    def h(L, campo):
        a, b = _periodos(L)[i]
        return f"{a} a {b}"
    return h


def _excecoes_top_k(L, campo):
    v = _exige(L, campo)
    if not v:
        raise Falta("lista de exceções vazia")
    return _lista_e([f"o {e['clube']} {e['ano']}, {int(e['posicao'])}º" for e in v])


def _faixa_p_fis10(L, campo):
    b = _exige(L, campo)
    lo, hi = b.get("p_bruto_SC_min"), b.get("p_bruto_SC_max")
    if lo is None or hi is None:
        raise Falta("fis10_bloco sem p_bruto_SC_min/max")
    ini = "menos de 1" if lo < 0.01 else inteiro(100 * lo)
    fim = "menos de 1" if hi < 0.01 else inteiro(100 * hi)
    return f"{ini} a {fim} de cada 100 tentativas"


def _len_melhores(L, campo):
    return len(_exige(L, campo + ".cai_entre_5_melhores"))


def _exemplos_melhores(L, campo):
    v = _exige(L, campo + ".cai_entre_5_melhores")
    if not v:
        raise Falta("nenhum rebaixado entre os melhores")
    return _lista_e([_clube_ano_n(x) for x in v])


def _texto_p95(L, campo):
    return f"e até {inteiro(_exige(L, campo))} em 95 de cada 100 vezes"


def _faixa_placebo(L, campo):
    ps = [e["p_placebo"] for e in _exige(L, campo) if e.get("p_placebo") is not None]
    if not ps:
        raise Falta("sem p_placebo")
    return f"{inteiro(100 * min(ps))} a {inteiro(100 * max(ps))} de cada 100 tentativas"


def _nomes_fora(L, campo):
    v = _exige(L, campo)
    if isinstance(v, str):
        return v
    return _lista_e([x if isinstance(x, str) else f"{x['clube']} {x['ano']}" for x in v])


def _colado(L, campo):
    v = _exige(L, campo)
    if isinstance(v, str):
        return v
    if isinstance(v, list) and v and all(isinstance(x, dict) and "clube" in x for x in v):
        return _lista_e([f"o {x['clube']} {x['ano']}" for x in v])
    raise Falta(f"formato de {campo} sem leitor")


def _formacao_faixa(faixa):
    def h(L, campo):
        f = _exige(L, campo)
        top = f["mais_comum_sobe"]
        return int(f[faixa].get(top, 0))
    return h


def _min_antigo_sm(L, campo):
    ps = [_exige(L, f"etapa_2.linhas[indicador={i}].antigo_SM.p") for i in ("ppda", "bolas_paradas", "cantos", "intensidade")]
    return min(ps)


def _menor_p_blocos(L, campo):
    return min(e["p"] for e in _exige(L, campo))


def _dif_sinal(L, campo):
    return _com_sinal(_exige(L, campo), 2)


def _ic_sinal(tres_se_zero):
    def h(L, campo):
        lo, hi = _exige(L, campo)[:2]

        def ponta(x):
            if tres_se_zero and dec(abs(x), 2) == "0,00":
                return _com_sinal(x, 3)
            return _com_sinal(x, 2)
        return f"{ponta(lo)} a {ponta(hi)}"
    return h


def _par_lista(qual):
    def h(L, campo):
        v = _exige(L, campo)
        if not v:
            raise Falta("lista de pares vazia")
        e = v[0] if qual == "primeiro" else v[-1]
        return _par(e["par"] if isinstance(e, dict) else e)
    return h


def _metrica_p_dif(L, campo):
    return _exige(L, "etapa_11.tecnico.metricas[metrica=Passes recebidos/90].p_dif_mudou_ficou")


def _falta(motivo):
    def h(L, campo):
        raise Falta(motivo)
    return h


COMO = {
    ("etapa_1.top4_de_valor.por_ano[].posicao_final", "o posto 1 que não subiu: 'o mais caro de ANO, o CLUBE, terminou em Nº'"): _top1_nao_subiu,
    ("etapa_1.auc_posto_de_valor.por_ano", "auc_sobe_x_resto por ano, dec2 separados por ' / '"): _por_ano_join("auc_sobe_x_resto", lambda x: dec(x, 2)),
    ("etapa_1.curva_top_k.valor_do_posto_k_por_ano", "k=4, menor ano"): _eur_k(4, "min"),
    ("etapa_1.curva_top_k.valor_do_posto_k_por_ano", "k=4, maior ano"): _eur_k(4, "max"),
    ("etapa_1.curva_top_k.valor_do_posto_k_por_ano", "k=8, menor ano"): _eur_k(8, "min"),
    ("etapa_1.curva_top_k.valor_do_posto_k_por_ano", "k=8, maior ano"): _eur_k(8, "max"),
    ("etapa_1.valor_mediano_da_liga_por_ano", "primeiro ano"): _mediana_liga("primeiro"),
    ("etapa_1.valor_mediano_da_liga_por_ano", "último ano"): _mediana_liga("ultimo"),
    ("etapa_1.sensibilidade_fonte_valor.nomes", "'o CLUBE ANO, Nº'"): _nomes_sensibilidade,
    ("etapa_1.auc_posto_de_valor.meio_x_cai_por_ano", "inteiro(100 × auc) por ano, ' / '"): _por_ano_join("auc", lambda x: inteiro(100 * x)),
    ("etapa_1.sensibilidade_fonte_valor.postos_rebaixados_valor_total", "os três menores, vírgulas e 'e'"): _tres_menores,
    ("etapa_1.valor_por_setor.por_clube", "no último ano, o promovido de menor e o de maior pct_defesa: 'em ANO subiram X com N% na defesa e Y com M%'"): _falta(SEM_ARTIGO),
    ("etapa_1.valor_por_setor.por_clube", "promovidos com pct_defesa abaixo da mediana do meio"): _pct_defesa_sobe_abaixo_meio,
    ("conclusoes_base.origem.dinheiro", "soma de por_origem[].n (só descrição)"): lambda L, c: sum(int(v["n"]) for v in _exige(L, c + ".por_origem").values()),
    ("conclusoes_base.origem.poder", "menor subida de C detectada com poder >= limiar (0,70) contra a taxa de B: 'uma subida de X% contra Y% apareceria em N de cada 10 amostras, e uma queda mais baixa só se fosse perto de zero'"): _frase_poder,
    ("etapa_2.por_clube", "promovidos com share_11 acima da mediana do meio"): _por_clube_conta(_share11_acima),
    ("etapa_2.linhas[indicador=min_estrangeiros].media_por_ano", "anos com média de sobe abaixo da de meio, 'em ANO quem subiu usou menos que o meio (X% contra Y%)'"): _ano_contra_estrangeiros,
    ("etapa_2.por_clube", "promovidos com min_estrangeiros = 0"): _por_clube_conta(_estrangeiros_zero),
    ("etapa_6.colocacao.por_periodo", "t[0] 'A a B' do primeiro período"): _periodo_t(0),
    ("etapa_6.colocacao.por_periodo", "t[1] 'A a B' do segundo período"): _periodo_t(-1),
    ("etapa_2.indice_intensidade.excecoes_top_k", "'o CLUBE ANO, Nº', vírgulas e 'e'"): _excecoes_top_k,
    ("etapa_2.por_clube", "rebaixados com posto 1 de fis_distance_p90 no ano: 'o CLUBE de ANO'"): _mais_correu_caiu,
    ("etapa_2.linhas[indicador=fis_meio_expl_accel_sprint_p90].media_por_ano", "anos com resíduo de sobe menor que o de meio"): _anos_residuo_menor,
    ("etapa_11.fisico.por_setor.dif_ficou_menos_mudou", "dec2 com sinal '+' ou '−'"): _dif_sinal,
    ("etapa_11.fisico.por_setor.ic95_dif", "'−0,03 a +0,14'"): _ic_sinal(False),
    ("etapa_11.fisico.por_setor.rho_mediano_por_par_de_anos", "primeiro par 'A→B'"): _par_lista("primeiro"),
    ("etapa_11.fisico.por_setor.rho_mediano_por_par_de_anos", "último par 'A→B'"): _par_lista("ultimo"),
    ("etapa_2.fis10_bloco", "p_bruto_SC_min e p_bruto_SC_max das linhas com p < 0,05, cada ponta por chance_em_100: 'menos de 1 a M de cada 100 tentativas'"): _faixa_p_fis10,
    ("etapa_2.fis10_bloco.p_bruto_SM_min_indicador", "nome simples do glossário da linha com o menor p_bruto_SM do bloco"): _falta(SEM_GLOSSARIO),
    ("etapa_2.linhas[indicador=fis_lateral_runs_dangerous_p30tip].media_por_ano", "anos com resíduo médio de sobe > meio"): _anos_residuo_maior,
    ("etapa_2.por_clube", "promovidos com dist_remate abaixo da mediana do próprio ano"): _por_clube_conta(_dist_remate_abaixo),
    ("etapa_2.linhas[indicador=duelos_aereos_pct].antigo_CR", "len(cai_entre_5_melhores)"): _len_melhores,
    ("etapa_2.linhas[indicador=duelos_aereos_pct].antigo_CR", "cai_entre_5_melhores, 'CLUBE ANO, Nº', vírgulas e 'e'"): _exemplos_melhores,
    ("etapa_2.linhas[].antigo_SM", "min p de ppda, bolas_paradas, cantos, intensidade"): _min_antigo_sm,
    ("etapa_7.excesso.sem_sinal.nulo_p95", "'e até N em 95 de cada 100 vezes'"): _texto_p95,
    ("etapa_8.tipologia.bateria_limpa.por_conjunto_de_validadores", "menor e maior p_placebo, 'N a M de cada 100 tentativas'"): _faixa_placebo,
    ("etapa_8.tipologia.fora_do_top_k.nomes", "'Clube Ano', vírgulas e 'e'"): _nomes_fora,
    ("etapa_8.tipologia.fora_do_top_k.estilos", "contagem por grupo em palavras: 'dois foram controladores pacientes e dois reativos de bola direta'"): _falta(SEM_GLOSSARIO + " (nome dos estilos)"),
    ("etapa_8.tipologia.fora_do_top_k.colado_na_linha", "'o CLUBE ANO' com |território - corte| < 1"): _colado,
    ("etapa_15.proxy_sistema.formacao_principal_por_faixa", "sobe[mais_comum_sobe]"): _formacao_faixa("sobe"),
    ("etapa_15.proxy_sistema.formacao_principal_por_faixa", "meio[mais_comum_sobe]"): _formacao_faixa("meio"),
    ("etapa_15.proxy_sistema.formacao_principal_por_faixa", "cai[mais_comum_sobe]"): _formacao_faixa("cai"),
    ("etapa_8.teste_cego.diferenca_entre_blocos", "menor p"): _menor_p_blocos,
    ("etapa_11.comparacao_fisico_tecnico.mudou.posicao.dif", "dec2 com sinal"): _dif_sinal,
    ("etapa_11.comparacao_fisico_tecnico.mudou.setor.dif", "dec2 com sinal"): _dif_sinal,
    ("etapa_11.comparacao_fisico_tecnico.ficou.posicao.dif", "dec2 com sinal"): _dif_sinal,
    ("etapa_11.comparacao_fisico_tecnico.ficou.setor.dif", "dec2 com sinal"): _dif_sinal,
    ("etapa_11.comparacao_fisico_tecnico.mudou.posicao.ic95", "'X a Y' com sinal; três casas se a ponta arredondar para zero"): _ic_sinal(True),
    ("etapa_11.comparacao_fisico_tecnico.mudou.setor.ic95", "'X a Y' com sinal"): _ic_sinal(False),
    ("etapa_11.comparacao_fisico_tecnico.ficou.posicao.ic95", "'X a Y' com sinal"): _ic_sinal(False),
    ("etapa_11.comparacao_fisico_tecnico.ficou.setor.ic95", "'X a Y' com sinal"): _ic_sinal(False),
    ("etapa_11.comparacao_fisico_tecnico.mudou.posicao.por_par_de_anos", "primeiro par 'A→B'"): _par_lista("primeiro"),
    ("etapa_11.comparacao_fisico_tecnico.mudou.posicao.por_par_de_anos", "último par 'A→B'"): _par_lista("ultimo"),
    ("etapa_11.comparacao_fisico_tecnico.ficou.posicao.por_par_de_anos", "primeiro par 'A→B'"): _par_lista("primeiro"),
    ("etapa_11.comparacao_fisico_tecnico.ficou.posicao.por_par_de_anos", "último par 'A→B'"): _par_lista("ultimo"),
    ("etapa_11.tecnico.pares_por_ano", "primeiro par 'A→B'"): _par_lista("primeiro"),
    ("etapa_11.tecnico.pares_por_ano", "último par 'A→B'"): _par_lista("ultimo"),
    ("etapa_11.tecnico.metricas[].p_dif_mudou_ficou", "Passes recebidos/90"): _metrica_p_dif,
}


# ---------------------------------------------------------------- derivações
_Q_FRASE = re.compile(r"^q_(SC|SM) < 0,025: 'é firme'; 0,025 <= q_(SC|SM) < 0,05: 'é firme por pouco'; senão 'já não dá para descartar a sorte'$")
_PCT = re.compile(r"^100 × ([a-z_A-Z]+) / ([a-z_A-Z]+)$")


def derivar(L, nome, lac, v):
    """valor cru de uma lacuna derivada; `v(nome_ou_caminho)` lê outra lacuna (cru) ou um caminho do dado."""
    d = lac["derivado"]
    de = lac.get("de") or []

    m = _PCT.match(d)
    if m:
        return 100 * v(m.group(1)) / v(m.group(2))
    if _Q_FRASE.match(d):
        q = v(de[0])
        return "é firme" if q < 0.025 else ("é firme por pouco" if q < 0.05 else "já não dá para descartar a sorte")
    if d == "selo_calculado desta conclusão":
        return v("__selo__")
    if d == "n_A + n_B + n_C":
        return v("n_A") + v("n_B") + v("n_C")
    if d == "'{ano_ini}-{ano_fim}'":
        return f"{int(v('ano_ini'))}-{int(v('ano_fim'))}"
    if d == "prom_top8/n_prom reduzida a 'N em cada M' quando M <= 5":
        f = Fraction(int(v("prom_top8")), int(v("n_prom")))
        if f.denominator > 5:
            raise Falta("a fração não reduz a 'N em cada M' com M <= 5 e a instrução não diz o que escrever")
        return f"{f.numerator} em cada {f.denominator}"
    if d.startswith("etapa_1.quartis[quartil=4].n / n_anos") or d.startswith("tamanho do quartil de cima por ano"):
        return v("etapa_1.quartis[quartil=4].n") / len(v("etapa_1.curva_top_k.anos"))
    if d == "clubes_no_top_k - promovidos_acumulados em curva[k=8]":
        return v("etapa_1.curva_top_k.curva[k=8].clubes_no_top_k") - v("etapa_1.curva_top_k.curva[k=8].promovidos_acumulados")
    if d == "promovidos com posto_valor > k8":
        k8 = v("etapa_1.curva_top_k.palpite_do_dono.k")
        return sum(1 for p in v("etapa_1.curva_top_k.promovidos") if p["posto_valor"] > k8)
    if d.startswith("o número em palpite_do_dono.afirmado"):
        ok, n = L.ler("etapa_1.curva_top_k.palpite_do_dono.afirmado_n")
        if ok and n is not None:
            return int(n)
        num = re.findall(r"\d+", str(v("etapa_1.curva_top_k.palpite_do_dono.afirmado")))
        if len(num) != 1:
            raise Falta("palpite_do_dono.afirmado sem um número só")
        return int(num[0])
    if d.startswith("etapa_1.curva_top_k.promovidos com posto_valor > k8, ordenados pelo posto"):
        k8 = v("k8")
        fora = sorted([p for p in v("etapa_1.curva_top_k.promovidos") if p["posto_valor"] > k8], key=lambda p: (p["posto_valor"], p["ano"]))
        return _lista_e([f"{p['clube']} {p['ano']} ({p['posto_valor']}º)" for p in fora])
    if d.startswith("contagem por ano de etapa_1.curva_top_k.promovidos com posto_valor <= k8"):
        k8 = v("k8")
        prom = v("etapa_1.curva_top_k.promovidos")
        return _lista_e([str(sum(1 for p in prom if p["ano"] == a and p["posto_valor"] <= k8)) for a in v("etapa_1.curva_top_k.anos")])
    if d == "palpite - prom_top8":
        return v("palpite") - v("prom_top8")
    if d == "anos com meio_x_cai_por_ano[].auc <= 0,5, vírgulas":
        anos = [str(e["ano"]) for e in sorted(v("etapa_1.auc_posto_de_valor.meio_x_cai_por_ano"), key=lambda e: e["ano"]) if e["auc"] <= 0.5]
        if not anos:
            raise Falta("nenhum ano com acerto <= 0,5")
        return ", ".join(anos)
    if d == "0 -> 'não caiu nenhuma vez'; senão 'caiu N vezes'":
        og = re.search(r"_([ABC])(?:_|$)", nome)
        if not og:
            raise Falta("a lacuna não diz de qual origem")
        n = int(v(f"conclusoes_base.origem.por_origem.{og.group(1)}.caiu"))
        return "não caiu nenhuma vez" if n == 0 else f"caiu {n} vezes"
    if d == "número de etapa_10.titulo_chave":
        return int(re.findall(r"\d+", str(v("etapa_10.titulo_chave")))[0])
    if d == "AUC nula = 0,5 → 50":
        return AUC_DO_ACASO * 100
    if d == "Phi(etapa_0.poder.d_minimo_16x48 / raiz de 2)":
        return float(stats.norm.cdf(v("etapa_0.poder.d_minimo_16x48") / math.sqrt(2)))
    m = re.match(r"^bloco declarado(?: em declaracoes_novas\.colocacao_t_t1)? \((\d+)-(\d+)\): (início|fim)$", d)
    if m:
        blocos = _blocos_colocacao(L)
        alvo = (int(m.group(1)), int(m.group(2)))
        if alvo not in blocos:
            raise Falta(f"bloco {alvo} não está em etapa_6.colocacao.por_faixa_de_posicao")
        return alvo[0] if m.group(3) == "início" else alvo[1]
    if d == "primeiro ano t dos pares":
        return _periodos(L)[0][0]
    if d == "último ano t dos pares":
        return _periodos(L)[-1][1]
    if d == "t_ini + 1":
        return v("t_ini") + 1
    if d == "t_fim + 1":
        return v("t_fim") + 1
    if " + " in d and all(x.startswith("etapa_") for x in de) and len(de) == 2 and d.count("+") == 1:
        return v(de[0]) + v(de[1])
    if d.startswith("soma de excesso.SC.bruto.nulo_mediana das duas famílias físicas"):
        return sum(v(x) for x in de)
    if d == "menor rho de por_setor.rho_mediano_por_par_de_anos":
        return min(e["rho"] for e in v(de[0]))
    if d == "maior rho de por_setor.rho_mediano_por_par_de_anos":
        return max(e["rho"] for e in v(de[0]))
    if d == "len(por_setor.rho_mediano_por_par_de_anos)":
        return v(de[0])
    if d == "número de métricas declaradas da etapa 11 (lista fixa de 10)":
        ok, n = L.ler("etapa_11.fisico.n_metricas")
        if ok and n is not None:
            return int(n)
        ok, lst = L.ler("etapa_11.fisico.metricas_fisicas")
        if ok and lst:
            return len(lst)
        raise Falta("campo ausente: etapa_11.fisico.n_metricas")
    if d == "m_meio - m_sobe de fis_zaga_distance_p90, arredondado a 50":
        x = v(de[0]) - v(de[1])
        return int(_q(x / 50, 0)) * 50
    if d == "linhas fis_ataque_* do catálogo com p_bruto_SC < 0,05 e p_rod_SC < 0,05":
        return sum(1 for e in v("etapa_2.linhas") if str(e["indicador"]).startswith("fis_ataque_")
                   and _abaixo(e.get("p_bruto_SC"), 0.05) and _abaixo(e.get("p_rod_SC"), 0.05))
    if d == "1 - etapa_2.linhas[indicador=dist_remate].auc_SM (sinal -1)":
        return 1 - v(de[0])
    if d == "k_extremos declarado (5)":
        linha = v("etapa_2.linhas[indicador=duelos_aereos_pct]")
        ks = sorted({int(mm.group(1)) for kk in linha for mm in [re.fullmatch(r"cai_entre_(\d+)_piores", kk)] if mm})
        if len(ks) != 1:
            raise Falta("campo ausente: etapa_2.linhas[indicador=duelos_aereos_pct].cai_entre_<k>_piores")
        return ks[0]
    if d.startswith("regra do selo aplicada a ti_zaga_duelos_aereos_ganhos"):
        p = v("etapa_2.linhas[indicador=ti_zaga_duelos_aereos_ganhos].p_bruto_CR")
        lista = v("etapa_3.por_familia.tecnico_ind.excesso.CR.bruto.p_excesso")
        if not _abaixo(p, 0.05):
            raise Falta("p_bruto_CR >= 0,05: a instrução cobre só a régua da comparação escolhida depois com p < 0,05")
        return "moderado" if _abaixo(lista, 0.05) else "fraco"
    if d == "min p_bruto_SM de ppda, bolas_paradas, cantos, intensidade":
        return min(v(f"etapa_2.linhas[indicador={i}].p_bruto_SM") for i in ("ppda", "bolas_paradas", "cantos", "intensidade"))
    if d == "linhas de etapa_7 com p_parcial < 0,05 E sinal_certo":
        return sum(1 for e in v("etapa_7.linhas") if _abaixo(e.get("p_parcial"), 0.05) and e.get("sinal_certo"))
    if d.startswith("linha de menor p_parcial com sinal_certo, pelo nome simples do glossário"):
        raise Falta(SEM_GLOSSARIO)
    if d == "abs(rho_bruto) dessa linha":
        cand = [e for e in v("etapa_7.linhas") if e.get("sinal_certo") and e.get("p_parcial") is not None]
        return abs(min(cand, key=lambda e: e["p_parcial"])["rho_bruto"])
    if d == "etapa_8.tipologia.grupos[].n, vírgulas e 'e'":
        return _lista_e([str(g["n"]) for g in v("etapa_8.tipologia.grupos")])
    if d == "grupos com status = TIPO":
        return sum(1 for g in v("etapa_8.tipologia.grupos") if g.get("status") == "TIPO")
    if d.startswith("grupos com status != TIPO: 'grupo do NOME (times)'"):
        raise Falta(SEM_GLOSSARIO + " (nome do grupo)")
    if d.startswith("times que mudam de grupo em etapa_8.tipologia.estabilidade.tirar_um_time[].trocaram"):
        vistos = list(dict.fromkeys(t for e in v("etapa_8.tipologia.estabilidade.tirar_um_time") for t in e["trocaram"]))
        return _lista_e(vistos)
    if d == "max(posto_valor) em etapa_8.tipologia.grupos[G1].times":
        return max(t["posto_valor"] for t in v("etapa_8.tipologia.grupos[grupo=G1].times"))
    if d.startswith("se max(posto_valor) em grupos[G1].times <= 3"):
        times = v("etapa_8.tipologia.grupos[grupo=G1].times")
        k = max(t["posto_valor"] for t in times)
        if k > 3:
            raise Falta("max(posto_valor) do G1 > 3: a instrução não diz o que escrever")
        nomes = [f"{t['clube']} {t['ano']}" for t in sorted(times, key=lambda t: (t["ano"], t["posto_valor"]))]
        return (f"os {len(times)} do grupo dono do jogo ({_lista_e(nomes)}) estavam, sem exceção, entre os {k} "
                f"elencos mais caros do seu ano")
    if d.startswith("denominador de porta_concordancia.mesmo_sinal_SM"):
        return int(str(v(de[0])).split("/")[1])
    if d.startswith("ano do campo pct_pts_casa_2020"):
        rv = v("teste_cego_2018_2021.json regime_veredito")
        anos = sorted({int(mm.group(1)) for kk in rv for mm in [re.fullmatch(r"pct_pts_casa_(\d{4})", kk)] if mm})
        if len(anos) != 1:
            raise Falta("regime_veredito sem um pct_pts_casa_<ano> só")
        return anos[0]
    if d == "len(regime) de 2018 a 2025 menos 1":
        return sum(1 for e in v("teste_cego_2018_2021.json regime") if 2018 <= int(e["ano"]) <= 2025) - 1
    if d.startswith("teste_cego tipologia.observado com os nomes simples dos grupos"):
        raise Falta(SEM_GLOSSARIO + " (nome dos grupos)")
    if d == "número de grupos da tipologia (4)":
        return len(v("teste_cego_2018_2021.json tipologia.observado"))
    if d == "soma de tipologia.observado":
        return sum(v("teste_cego_2018_2021.json tipologia.observado").values())
    if d.startswith("primeiro ano de backtest.rotulo_da_definicao_ampla"):
        return int(re.findall(r"\d{4}", str(v(de[0])))[0])
    if d == "d_minimo_detectavel(n_recomendados, n_reprovados)":
        # A função do gerador procura o d por bissecção em [0, 4]. Com n grande (209 x 208) a integração do
        # poder falha e ela devolve o próprio teto: 4 não é medida, é "não achou". Não se grava o teto como
        # tamanho; o defeito é do bloco 1 (gerar_prototipo.potencia_t) e vai no relato.
        dm = float(G.d_minimo_detectavel(v(de[0]), v(de[1])))
        if dm >= 4.0 - 1e-6:
            raise Falta("gerar_prototipo.d_minimo_detectavel devolveu o teto da bissecção (4) com n grande: "
                        "a integração do poder não converge; defeito do bloco 1, sem número gravado")
        return dm
    if d.startswith("menor q_clube do setor < 0,025"):
        qs = [e["q_clube"] for e in v(de[0]) if e.get("q_clube") is not None]
        if not qs:
            raise Falta("sem q_clube no setor")
        return "a mais firme com folga" if min(qs) < 0.025 else "todas por pouco"
    if d.startswith("nomes simples do glossário") or d.startswith("métricas com p_dif_mudou_ficou >= 0,10"):
        raise Falta(SEM_GLOSSARIO)
    raise Falta(f"derivação sem leitor no gerador: {d}")


# ══════════════════════════════════════════════════════════════════════════════
#  5. critérios do selo e regra de máquina (conclusoes_spec.json regua.selo_calculado)
# ══════════════════════════════════════════════════════════════════════════════

def efetivos(k):
    c = k.get("caminho")
    if not c:
        return []
    f, sub = k.get("filtro"), k.get("subcampo")
    subs = sub if isinstance(sub, list) else ([sub] if sub else [None])
    if not f or f.get("tipo") == "condicao":
        bases = [(None, c)]
    elif f["tipo"] == "lista":
        bases = [(x, f"{c}[{f['chave']}={x}]") for x in f["valores"]]
    elif f["tipo"] == "dicionario":
        bases = [(x, f"{c}.{x}") for x in f["valores"]]
    else:
        raise ValueError(f"filtro desconhecido {f}")
    return [((rot, s), b + ("." + s if s else "")) for rot, b in bases for s in subs]


def _bh_min(ps):
    ps = sorted(ps)
    n = len(ps)
    return min(p * n / (i + 1) for i, p in enumerate(ps))


_OPS = {
    "<": lambda x, l: x < l, "<=": lambda x, l: x <= l, ">": lambda x, l: x > l, ">=": lambda x, l: x >= l,
    "==": lambda x, l: x == l, "cruza_zero": lambda x, l: x[0] <= 0 <= x[1], "acima_de_zero": lambda x, l: x[0] > 0,
}


def avaliar(k, v):
    op, lim, ag = k["operador"], k["limiar"], k["agregacao"]
    if op == "existe":
        return v is not None
    if v is None:
        return op == "==" and lim is None
    f = _OPS[op]

    def cmp(x):
        return x is not None and f(x, lim)
    if ag == "contagem_por_ano_todos":
        if isinstance(v, list) and v and isinstance(v[0], dict):
            fl = k["filtro"]
            por = {}
            for e in v:
                por.setdefault(e["ano"], 0)
                if e[fl["campo"]] <= fl["ate"]:
                    por[e["ano"]] += 1
            v = [por[a] for a in sorted(por)]
        return all(cmp(x) for x in v)
    intervalo = op in ("cruza_zero", "acima_de_zero") and isinstance(v, (list, tuple)) and len(v) == 2 \
        and not isinstance(v[0], (list, dict))
    if ag in ("valor", "fracao") or not isinstance(v, (list, tuple, dict)) or intervalo:
        return cmp(v)
    xs = list(v.values()) if isinstance(v, dict) else list(v)
    if ag in ("min", "max") and any(isinstance(x, (list, tuple)) for x in xs):
        xs = [y for x in xs for y in (x if isinstance(x, (list, tuple)) else [x])]
    if ag == "todos":
        return all(cmp(x) for x in xs)
    if ag == "algum":
        return any(cmp(x) for x in xs)
    xs = [x for x in xs if x is not None]
    if not xs:
        return False
    if ag == "min":
        return cmp(min(xs))
    if ag == "max":
        return cmp(max(xs))
    if ag == "bh":
        return cmp(_bh_min(xs))
    raise ValueError(ag)


def ler_criterio(L, k):
    """(presente, caminhos que faltam, valor)."""
    efs = efetivos(k)
    faltam = [p for _, p in efs if not L.ler(p)[0]]
    if faltam:
        return False, faltam, None
    if len(efs) == 1:
        return True, [], L.ler(efs[0][1])[1]
    return True, [], {"|".join(str(x) for x in rot if x is not None): L.ler(p)[1] for rot, p in efs}


def selo_da_regra(passou, regra):
    for linha in regra["ordem"]:
        if all(passou.get(kid) == esp for kid, esp in linha["exige"].items()):
            return linha["selo"]
    return regra.get("selo_padrao")


# ══════════════════════════════════════════════════════════════════════════════
#  6. o bloco conclusoes
# ══════════════════════════════════════════════════════════════════════════════

SELO_ORD = ["forte", "moderado", "fraco", "sem_sinal", "nao_da_para_afirmar"]
# lacunas comuns do spec (sp6_base.COMUNS) que uma derivação pode citar pelo nome sem que a conclusão as tenha
LACUNAS_COMUNS = {"ano_ini": "etapa_1.curva_top_k.anos[0]", "ano_fim": "etapa_1.curva_top_k.anos[-1]",
                  "n_prom": "etapa_1.curva_top_k.promovidos_total", "ano_parcial": "etapa_1.fora_da_amostra_2026.ano"}
MARC =re.compile(r"\{([a-zA-Z0-9_]+)\}")


def _p_principal(L, pp):
    """(p arredondado como gravado, p cru, caminho ausente ou None). O cru é `<campo>_cru` quando o gerador o
    grava ao lado; senão é o próprio gravado, e isso fica dito em `p_principal_cru_fonte`."""
    cam = pp.get("caminho")
    if not cam:
        return None, None, None, "sem p (pergunta sem teste de p)"
    ok, v = L.ler(cam)
    if not ok or v is None:
        return None, None, cam, None
    if pp.get("agregacao") == "min":
        sub = pp["subcampo"]
        itens = [e for e in v if isinstance(e, dict) and e.get(sub) is not None]
        if not itens:
            return None, None, cam, None
        melhor = min(itens, key=lambda e: (e.get(sub + "_cru", e[sub]), e[sub]))
        cru = melhor.get(sub + "_cru")
        return melhor[sub], (cru if cru is not None else melhor[sub]), None, (
            f"{sub}_cru gravado" if cru is not None else "valor gravado (o gerador não guarda o p sem arredondar neste caminho)")
    pai, _, folha = cam.rpartition(".")
    cru = None
    if pai:
        okp, dpai = L.ler(pai)
        if okp and isinstance(dpai, dict) and dpai.get(folha + "_cru") is not None:
            cru = dpai[folha + "_cru"]
    return v, (cru if cru is not None else v), None, (
        f"{folha}_cru gravado" if cru is not None else "valor gravado (o gerador não guarda o p sem arredondar neste caminho)")


def _item(L, c, ordem_spec):
    cid = c["id"]
    ausentes = []
    criterios, passou, falta_decisivo = [], {}, []
    for k in c["criterios_do_selo"]:
        e = {"id": k["id"], "criterio": k["criterio"], "caminho": k.get("caminho")}
        if k.get("caminho") is None:
            e.update(constante=k.get("constante"), operador=None, limiar=None, agregacao=None, filtro=None,
                     subcampo=None, valor=k.get("constante"), passou=k.get("constante"), decide=k["decide"])
        else:
            presente, faltam, val = ler_criterio(L, k)
            e.update(operador=k.get("operador"), limiar=k.get("limiar"), agregacao=k.get("agregacao"),
                     filtro=k.get("filtro"), subcampo=k.get("subcampo"), valor=val, decide=k["decide"])
            if not presente:
                ausentes += faltam
                e["passou"] = None
                e["motivo"] = "campo ausente: " + "; ".join(faltam)
                if k["decide"]:
                    falta_decisivo += faltam
            elif k.get("so_descricao") or k.get("operador") is None:
                e["passou"] = None
                e["so_descricao"] = True
            else:
                e["passou"] = bool(avaliar(k, val))
        passou[k["id"]] = e["passou"]
        criterios.append(e)
    regra = {"ordem": c["regra_maquina"]["ordem"], "selo_padrao": c["regra_maquina"].get("selo_padrao")}
    if falta_decisivo:
        selo, na_tela = None, False
        motivo_fora = "campo ausente: " + "; ".join(dict.fromkeys(falta_decisivo))
    else:
        selo = selo_da_regra(passou, regra)
        na_tela = selo is not None
        motivo_fora = None if na_tela else "a regra do selo não cobre os valores gravados"

    p, p_cru, p_aus, p_fonte = _p_principal(L, c["p_principal"])
    if p_aus:
        ausentes.append(p_aus)

    # ---------------- lacunas
    lacunas, cru = {}, {}

    def valor_de(nome_ou_caminho):
        if nome_ou_caminho == "__selo__":
            if selo is None:
                raise Falta("selo_calculado ausente (a conclusão está fora da tela)")
            return selo
        if nome_ou_caminho in c["lacunas"]:
            if nome_ou_caminho not in cru:
                resolver_lacuna(nome_ou_caminho)
            r_ = cru[nome_ou_caminho]
            if isinstance(r_, Falta):
                raise Falta(f"depende de {nome_ou_caminho}: {r_}")
            return r_
        if nome_ou_caminho in LACUNAS_COMUNS:
            return _exige(L, LACUNAS_COMUNS[nome_ou_caminho])
        return _exige(L, nome_ou_caminho)

    def resolver_lacuna(nome):
        lac = c["lacunas"][nome]
        cru[nome] = Falta("em resolução (dependência circular)")
        try:
            if lac.get("ja_gravado_no_json"):
                val = _exige(L, lac["caminho"])
            elif lac.get("derivado"):
                val = derivar(L, nome, lac, valor_de)
            else:
                val = ler_campo(L, lac["campo"], lac.get("como"))
            cru[nome] = val
        except Falta as ex:
            cru[nome] = ex

    for nome in c["lacunas"]:
        if nome not in cru or isinstance(cru[nome], Falta) and str(cru[nome]).startswith("em resolução"):
            resolver_lacuna(nome)
    for nome, lac in c["lacunas"].items():
        r_ = cru[nome]
        if isinstance(r_, Falta):
            motivo = str(r_)
            lacunas[nome] = {"valor_cru": None, "texto_formatado": None, "motivo": motivo}
            for mm in re.finditer(r"campo ausente: ([^\s;]+)", motivo):
                ausentes.append(mm.group(1))
            continue
        try:
            txt = FORMATOS[lac["formato"]](r_)
        except (TypeError, ValueError, KeyError) as ex:
            lacunas[nome] = {"valor_cru": _json_seguro(r_), "texto_formatado": None,
                             "motivo": f"o valor lido não cabe no formato {lac['formato']}: {ex}"}
            continue
        lacunas[nome] = {"valor_cru": _json_seguro(r_), "texto_formatado": txt}

    # ---------------- textos
    textos, sem_valor = {}, {}
    moldes = dict(c["molde"])
    moldes["universo"] = c["universo"]
    for campo in ("titulo", "frase", "numero", "ressalva", "universo", "tecnico", "descricao_em_euros"):
        if campo not in moldes:
            continue
        t = moldes[campo] or ""
        faltam = [mk for mk in dict.fromkeys(MARC.findall(t)) if (lacunas.get(mk) or {}).get("texto_formatado") is None]
        if faltam:
            textos[campo] = None
            sem_valor[campo] = faltam
        else:
            textos[campo] = MARC.sub(lambda mm: lacunas[mm.group(1)]["texto_formatado"], t)

    esperado = c.get("forca_esperada_hoje")
    if selo != esperado:
        div = (f"selo calculado {selo}; o documento diz {esperado}" if selo is not None
               else f"fora da tela ({motivo_fora}); o documento diz {esperado}")
    else:
        div = None
    item = {
        "id": cid,
        "tema": c["tema"],
        "selo_calculado": selo,
        "na_tela": na_tela,
        "motivo_fora": motivo_fora,
        "comparacao_declarada_antes": c["comparacao_declarada_antes"],
        "p_principal": p,
        "p_principal_cru": p_cru,
        "p_principal_cru_fonte": p_fonte,
        "criterios_do_selo": criterios,
        "regra_maquina": regra,
        "campos_ausentes": list(dict.fromkeys(ausentes)),
        "lacunas": lacunas,
        "textos": textos,
        "textos_sem_lacuna": sem_valor,
        "divergencia_com_o_documento": div,
        "vale_pela_faixa_de_pontos": {"provisorio": bool(c["vale_pela_faixa_de_pontos"].get("provisorio", True)),
                                      "fonte": c["vale_pela_faixa_de_pontos"].get("gerador", "PONTOS.conclusoes[id]")},
    }
    return item


def _json_seguro(x):
    if isinstance(x, Fraction):
        return float(x)
    if isinstance(x, (np.integer,)):
        return int(x)
    if isinstance(x, (np.floating,)):
        return float(x)
    return x


def montar_conclusoes(saida):
    spec_bytes = open(SPEC_ARQ, "rb").read()
    spec = json.loads(spec_bytes.decode("utf-8"))
    cego_bytes = open(CEGO_ARQ, "rb").read()
    cego = json.loads(cego_bytes.decode("utf-8"))
    L = Leitor(saida, cego)
    ordem_spec = {c["id"]: i for i, c in enumerate(spec["conclusoes"])}
    itens = [_item(L, c, ordem_spec) for c in spec["conclusoes"]]

    cont = {s: sum(1 for it in itens if it["selo_calculado"] == s) for s in SELO_ORD}
    cont["fora_da_tela"] = sum(1 for it in itens if not it["na_tela"])

    # as cinco: selo, depois o menor p cru (sem arredondar), nulo depois, empate na ordem do spec
    cand = [it for it in itens if it["na_tela"]]
    cand.sort(key=lambda it: (SELO_ORD.index(it["selo_calculado"]),
                              0 if it["p_principal_cru"] is not None else 1,
                              it["p_principal_cru"] if it["p_principal_cru"] is not None else 0.0,
                              ordem_spec[it["id"]]))
    cinco = [it["id"] for it in cand[:5]]
    return {
        "universo": ("as %d conclusões de _fonte/prototipo/conclusoes_spec.json, lidas contra este prototipo.json; "
                     "cada conclusão diz o seu universo em textos.universo" % len(itens)),
        "anos": [saida["etapa_1"]["curva_top_k"]["anos"][0], saida["etapa_1"]["curva_top_k"]["anos"][-1]],
        "n": len(itens),
        "regua_versao": f"{spec['gerado_em']} · {spec['regua']['versao']}",
        "spec": {"arquivo": "_fonte/prototipo/conclusoes_spec.json", "sha256": hashlib.sha256(spec_bytes).hexdigest()},
        "teste_cego_lido": {"arquivo": "_fonte/prototipo/teste_cego_2018_2021.json",
                            "sha256": hashlib.sha256(cego_bytes).hexdigest(), "so_leitura": True},
        "regra_do_selo_calculado": spec["regua"]["selo_calculado"]["leitura_da_regra"],
        "itens": itens,
        "contagem_de_selos": cont,
        "cinco_que_precisa_ler": cinco,
        "cinco_passos_aplicados": list(spec["regra_das_cinco"]["passos"]),
    }


# ══════════════════════════════════════════════════════════════════════════════
#  7. contrato
# ══════════════════════════════════════════════════════════════════════════════

def aplicar(saida, ctx):
    gravados = []
    cb = saida.setdefault("conclusoes_base", {})
    ori = cb.setdefault("origem", {})
    medido = medir_origem(ctx)
    for caminho in CAMPOS:
        if not caminho.startswith("conclusoes_base.origem."):
            continue
        folha = caminho.rsplit(".", 1)[1]
        if folha in ori:
            raise SystemExit(f"{caminho} já existe na saída: este módulo não sobrescreve chave existente")
        ori[folha] = medido[folha]
        gravados.append(caminho)
    if "conclusoes" in saida:
        raise SystemExit("conclusoes já existe na saída: este módulo não sobrescreve chave existente")
    saida["conclusoes"] = montar_conclusoes(saida)
    gravados.append("conclusoes")
    return gravados


def ctx_de_teste():
    G.DECL = G.carregar_declaracao()
    d100, d80 = G.carregar_painel()
    dv = pd.read_csv(PAINEL_ANTIGO_ARQ)
    dv = dv[dv.ano <= 2025].reset_index(drop=True)
    saida = json.load(open(G.SAIDA, encoding="utf-8"))
    return dict(G=G, d100=d100, d80=d80, dv=dv, saida_gravada=saida)


if __name__ == "__main__":
    import sys
    destino = sys.argv[1] if len(sys.argv) > 1 else None
    ctx = ctx_de_teste()
    saida = copy.deepcopy(ctx["saida_gravada"])
    feitos = aplicar(saida, ctx)
    print("gravados:", feitos)
    if destino:
        json.dump(saida, open(destino, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"), allow_nan=False)
        print("escrito em", destino)
