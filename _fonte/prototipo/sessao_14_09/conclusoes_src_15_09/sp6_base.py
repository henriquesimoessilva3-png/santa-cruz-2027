# sp6_base - base comum da reconferência de 14/09: formatos, leitor de caminhos, lacunas e universos.
# Só leitura do projeto. Quem escreve é o sp6_montar.py (CONCLUSOES.md, conclusoes_spec.json).
import json, re
from decimal import Decimal, ROUND_HALF_UP

R = "/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz/"
S = "/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Ranking/1abbf5c7-a19a-4f3a-89c2-26d0445cdbba/scratchpad/dinheiro2/conc/"
# o dado novo da rodada sem dinheiro (15/09), ainda não gravado no projeto: é contra ele que os selos são conferidos
PROTO_NOVO = S + "../prototipo_novo.json"
SESSAO = R + "_fonte/prototipo/sessao_14_09/"
PROTO = json.load(open(PROTO_NOVO, encoding="utf-8"))
CEGO = json.load(open(R + "_fonte/prototipo/teste_cego_2018_2021.json", encoding="utf-8"))

# ---------------------------------------------------------------- leitor de caminhos
SEG = re.compile(r"([^.\[\]]+)|\[([^\]]*)\]")

def _tokens(path):
    return [("k", m.group(1)) if m.group(1) is not None else ("i", m.group(2)) for m in SEG.finditer(path)]

def _resolve(root, path):
    cur = [root]
    for kind, t in _tokens(path):
        nxt = []
        for c in cur:
            if kind == "k":
                if isinstance(c, dict) and t in c:
                    nxt.append(c[t])
                elif isinstance(c, list):
                    # chave aplicada a lista ('[]' antes): vale se algum elemento tem a chave
                    vals = [e[t] for e in c if isinstance(e, dict) and t in e]
                    if vals:
                        nxt.append(vals)
            else:
                if isinstance(c, list):
                    if t == "":
                        nxt.append(c)
                    elif re.fullmatch(r"-?\d+", t):
                        i = int(t)
                        if -len(c) <= i < len(c):
                            nxt.append(c[i])
                    elif "=" in t:
                        k, v = t.split("=", 1)
                        nxt.extend([e for e in c if isinstance(e, dict) and str(e.get(k)) == v])
        cur = nxt
        if not cur:
            return False, None
    return True, cur[0]

def resolver(caminho):
    """(existe, valor). Caminho começando por 'teste_cego_2018_2021.json ' lê o arquivo congelado."""
    if caminho is None:
        return False, None
    c = caminho.strip()
    if c.startswith("teste_cego_2018_2021.json "):
        return _resolve(CEGO, c.split(" ", 1)[1])
    return _resolve(PROTO, c)

# ---------------------------------------------------------------- formatos (arredondamento comercial)
def _q(x, casas):
    d = Decimal(str(x)).quantize(Decimal(1).scaleb(-casas), rounding=ROUND_HALF_UP)
    return d

def dec(x, casas):
    s = f"{_q(x, casas):.{casas}f}"
    return s.replace("-", "−").replace(".", ",")

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
    "selo_minusculo": lambda s: {"forte": "forte", "moderado": "moderado", "fraco": "fraco", "sem_sinal": "sem sinal", "nao_da_para_afirmar": "não dá para afirmar"}[s],
}

FORMATOS_DOC = {
    "inteiro": "inteiro; arredondamento comercial (meia unidade para cima)",
    "inteiro_arredondado": "igual a inteiro",
    "dec1": "uma casa, vírgula decimal, arredondamento comercial; sinal de menos '−'",
    "dec2": "duas casas, idem",
    "dec3": "três casas, idem",
    "milhar": "inteiro com ponto de milhar",
    "ano": "quatro dígitos",
    "pct_inteiro": "inteiro (a frase acrescenta '%')",
    "chance_em_100": "p >= 0,01: 'N de cada 100 tentativas', N = inteiro(100p); p < 0,01: 'menos de 1 de cada 100 tentativas'",
    "chance_em_1000": "p >= 0,01: como chance_em_100; 0,001 <= p < 0,01: 'N de cada 1.000 tentativas'; p < 0,001: 'menos de 1 de cada 1.000 tentativas'",
    "em_1000": "'N de cada 1.000 tentativas', N = inteiro(1000p)",
    "pares_em_100": "'N de cada 100 pares', N = inteiro(100 × AUC)",
    "pares_numero": "inteiro(100 × AUC), sem texto (a frase diz 'de cada 100 pares')",
    "pares_em_100_absoluto": "inteiro(100 × |x|)",
    "milhoes_dec1": "x / 1.000.000 com uma casa (a frase diz 'milhões de euros')",
    "milhoes_inteiro": "x / 1.000.000 arredondado ao inteiro",
    "milhares_inteiro": "x / 1.000 arredondado ao inteiro, com ponto de milhar (a frase diz 'mil euros')",
    "faixa_inteira": "inteiro se x é inteiro; senão 'N ou N+1' (piso e teto)",
    "contagem_da_lista": "len(lista)",
    "numerador": "parte antes da barra em 'a/b'",
    "texto": "texto pronto (nome, lista de nomes, faixa já montada pelo gerador)",
    "tamanho_em_palavras": "d detectável < 0,4: 'enxergaria até uma diferença pequena'; < 0,9: 'só uma diferença grande apareceria'; >= 0,9: 'só uma diferença muito grande apareceria'",
    "inteiro_por_extenso_se_zero": "0 -> 'nenhum'; senão inteiro",
    "nenhuma_se_zero": "0 -> 'nenhuma'; senão inteiro",
    "zero_por_extenso": "0 -> 'zero'; senão inteiro",
    "inteiro_por_extenso": "0-5 por extenso ('nenhum', 'um', 'dois', 'três', 'quatro', 'cinco'); senão inteiro",
    "selo_minusculo": "forte | moderado | fraco | sem sinal | não dá para afirmar",
}

def formatar(fmt, valor):
    return FORMATOS[fmt](valor)

# ---------------------------------------------------------------- lacunas
def G(fmt, caminho):
    """lacuna lida de um campo JÁ gravado (prototipo.json ou teste_cego)."""
    return {"formato": fmt, "ja_gravado_no_json": True, "caminho": caminho}

_ID = re.compile(r"^([A-Za-z0-9_]+)(?::\s*(.+))?$")

def _concretizar(campo, como):
    """'etapa_2.linhas[]' + como 'formacoes' vira 'etapa_2.linhas[indicador=formacoes]'; 'por_familia[]' e '.<setor>' idem.
    Um resto simples depois de ':' vira subcampo ('formacoes: p' → '...antigo_CM.p'). Conserto NOTACAO, 14/09."""
    if not como:
        return campo, como
    m = _ID.match(como.strip())
    if not m:
        return campo, como
    ident, resto = m.group(1), m.group(2)
    if "etapa_2.linhas[]" in campo:
        novo = campo.replace("etapa_2.linhas[]", f"etapa_2.linhas[indicador={ident}]", 1)
    elif "etapa_7.linhas[]" in campo:
        novo = campo.replace("etapa_7.linhas[]", f"etapa_7.linhas[indicador={ident}]", 1)
    elif "por_familia[]" in campo:
        novo = campo.replace("por_familia[]", f"por_familia.{ident}", 1)
    elif ".<setor>" in campo:
        novo = campo.replace(".<setor>", f".{ident}", 1)
    else:
        return campo, como
    if resto and re.fullmatch(r"[A-Za-z0-9_]+", resto.strip()):
        return novo + "." + resto.strip(), None
    return novo, resto

def N(fmt, campo, como=None):
    """lacuna que lê um campo que o gerador ainda NÃO grava: `campo` tem de estar na ordem de serviço."""
    campo, como = _concretizar(campo, como)
    d = {"formato": fmt, "ja_gravado_no_json": False, "campo": campo}
    if como:
        d["como"] = como
    return d

def V(fmt, caminho, campo, motivo):
    """o caminho existe mas o valor gravado hoje está errado para a conclusão: lê o campo novo."""
    return {"formato": fmt, "ja_gravado_no_json": False, "caminho_hoje_com_valor_velho": caminho, "campo": campo, "motivo": motivo}

def D(fmt, como, de):
    """lacuna derivada de outras lacunas, de listas gravadas ou de constantes declaradas."""
    return {"formato": fmt, "ja_gravado_no_json": False, "derivado": como, "de": de}

# lacunas comuns: entram sozinhas na conclusão que usar o marcador
COMUNS = {
    "n_clube_temporadas": G("inteiro", "etapa_0.linhas_completas"),
    "ano_ini": G("ano", "etapa_1.curva_top_k.anos[0]"),
    "ano_fim": G("ano", "etapa_1.curva_top_k.anos[-1]"),
    "n_sobe": G("inteiro", "etapa_0.sobe"),
    "n_meio": G("inteiro", "etapa_0.meio"),
    "n_cai": G("inteiro", "etapa_0.cai"),
    "n_prom": G("inteiro", "etapa_1.curva_top_k.promovidos_total"),
    "ano_parcial": G("ano", "etapa_1.fora_da_amostra_2026.ano"),
    "n_antigo": N("inteiro", "bases.painel_2018_2021.usadas"),
    "periodo_antigo": N("texto", "bases.painel_2018_2021.rotulo"),
    "periodo_recente": D("texto", "'{ano_ini}-{ano_fim}'", ["ano_ini", "ano_fim"]),
    "corte_min_fisico": N("inteiro", "bases.skillcorner.corte_minutos"),
    "corte_min_ind": N("inteiro", "bases.tecnico_ind.corte_minutos"),
    "frase_tamanho": G("tamanho_em_palavras", "etapa_0.poder.d_minimo_16x48"),
    "frase_tamanho_16x16": G("tamanho_em_palavras", "etapa_0.poder.d_minimo_16x16"),
    "n_familia_tecnico_col": G("inteiro", "etapa_3.por_familia.tecnico_col.testes"),
    "n_familia_elenco": G("inteiro", "etapa_3.por_familia.elenco.testes"),
    "n_familia_tecnico_ind": G("inteiro", "etapa_3.por_familia.tecnico_ind.testes"),
    "n_familia_fisico_setor": G("inteiro", "etapa_3.por_familia.fisico_col_setor.testes"),
    "n_testados_e7": G("contagem_da_lista", "etapa_7.linhas"),
    "selo": D("selo_minusculo", "selo_calculado desta conclusão", ["conclusoes.itens[id].selo_calculado"]),
}
VALORES_COMUNS = {"periodo_antigo": "2018-2021", "n_antigo": "80", "periodo_recente": "2022-2025", "corte_min_fisico": "300", "corte_min_ind": "600"}

UNIVERSOS = {
    "clube": "{n_clube_temporadas} clube-temporadas da Série B de {ano_ini} a {ano_fim} ({n_sobe} subiram, {n_meio} ficaram no meio, {n_cai} caíram); {ano_parcial} fica fora de toda conta",
    "clube_valor": "{n_clube_temporadas} clube-temporadas da Série B de {ano_ini} a {ano_fim} ({n_sobe} subiram, {n_meio} ficaram no meio, {n_cai} caíram), com valor de mercado do Transfermarkt (valor de mercado não é folha nem gasto); {ano_parcial} fica fora de toda conta",
    "clube_antigo": "{n_clube_temporadas} clube-temporadas da Série B de {ano_ini} a {ano_fim} ({n_sobe} subiram, {n_meio} ficaram no meio, {n_cai} caíram) e as {n_antigo} de {periodo_antigo}, só no técnico do time e sem valor de mercado; {ano_parcial} fica fora de toda conta",
    "fisico": "{n_clube_temporadas} clube-temporadas da Série B de {ano_ini} a {ano_fim} ({n_sobe} subiram, {n_meio} ficaram no meio, {n_cai} caíram); físico do SkillCorner, atletas com {corte_min_fisico}+ minutos rastreados; antes de {ano_ini} não há físico",
    "tec_ind": "{n_clube_temporadas} clube-temporadas da Série B de {ano_ini} a {ano_fim} ({n_sobe} subiram, {n_meio} ficaram no meio, {n_cai} caíram); técnico individual do Wyscout, atletas com {corte_min_ind}+ minutos, agregado por setor; {periodo_antigo} não foi processado",
    "periodos": "as {n_antigo} clube-temporadas de {periodo_antigo} e as {n_clube_temporadas} de {periodo_recente}, cada período com {n_sobe} que subiram, {n_meio} no meio e {n_cai} que caíram; {periodo_antigo} sem valor de mercado",
    "tipologia": "os {n_prom} que subiram de {ano_ini} a {ano_fim}; para o valor do elenco, as {n_clube_temporadas} clube-temporadas do período",
}

def K(criterio, caminho, valor, passou, decide=True):
    """critério do selo: `passou` True/False; None = não se aplica. `caminho` None = regra declarada, sem campo."""
    return {"criterio": criterio, "caminho": caminho, "valor_14_09": valor, "passou": passou, "decide": decide}

def P(caminho, valor, agregacao=None, subcampo=None):
    d = {"caminho": caminho, "valor_14_09": valor}
    if agregacao:
        d["agregacao"] = agregacao
        d["subcampo"] = subcampo
    return d

MARC = re.compile(r"\{([a-zA-Z0-9_]+)\}")

def marcadores(txt):
    return MARC.findall(txt or "")

def conc(**kw):
    d = dict(kw)
    d.setdefault("extra", {})
    d.setdefault("val", {})
    d.setdefault("crit", [])
    d.setdefault("nova_em", None)
    d.setdefault("tecnico", "")
    return d


# ---------------------------------------------------------------- critério em forma de máquina já na fonte (rodada sem dinheiro, 15/09)
# KM escreve o critério com operador e limiar junto do texto, e o papel dele na régua comum. O `passou` NÃO é digitado:
# sai do valor gravado (ou do medido na rodada, quando o campo ainda não existe), para o selo não poder ser escrito à mão.
NADA = object()

def KM(criterio, caminho, papel=None, op=None, lim=None, ag="valor", filtro=None, sub=None, v=NADA, decide=None, constante=None, txt=None):
    return {"criterio": criterio, "caminho": caminho, "_papel": papel, "_m": {"operador": op, "limiar": lim, "agregacao": ag, "filtro": filtro, "subcampo": sub},
            "_v": v, "_constante": constante, "_txt": txt, "_decide": (papel is not None) if decide is None else decide}

def CONST(criterio, valor, papel=None, txt=None, decide=None):
    """constante declarada no spec (caminho nulo): o valor é a própria regra, não campo ausente."""
    return KM(criterio, None, papel=papel, constante=valor, txt=txt, decide=decide)
