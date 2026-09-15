# sp6_maquina - conserto SELO-NAO-E-ALGORITMO (14/09): cada critério do selo ganha forma de máquina e cada conclusão
# ganha a regra do selo como lista ORDENADA. O gerador (e o sp7_prova) calcula `passou` a partir de caminho → valor →
# operador/limiar/agregação, e o selo pela primeira linha da regra cujas exigências batem todas.
import math
from sp6_base import resolver, dec, NADA

T, F = True, False

LEITURA_DA_REGRA = ("vence a PRIMEIRA linha de 'ordem' cujas exigências batem todas (id do critério → passou esperado); nenhuma bate: "
                    "selo_padrao; selo_padrao null quer dizer que a regra escrita não cobre esses valores, e então selo_calculado = null, "
                    "na_tela = false e motivo_fora = 'a regra do selo não cobre os valores gravados' (nunca se inventa um selo)")
FORMA_DO_CRITERIO = {
    "id": "k0, k1, ... (posição na lista)",
    "constante": "true | false | null, só quando caminho é null: é CONSTANTE declarada no spec (fonte conclusoes_spec), nunca ausência de campo",
    "operador": "'<' | '<=' | '>' | '>=' | '==' | 'cruza_zero' ([lo, hi] com lo <= 0 <= hi) | 'acima_de_zero' ([lo, hi] com lo > 0) | 'existe' (valor não nulo)",
    "limiar": "número, texto ou booleano comparado pelo operador (null nos operadores de intervalo e em 'existe')",
    "agregacao": "'valor' (um número) | 'todos' | 'algum' | 'min' | 'max' | 'bh' (menor q de Benjamini-Hochberg da lista) | 'contagem_por_ano_todos' (lista de registros {ano, campo}: conta por ano os que cumprem o filtro e aplica o operador a cada ano) | 'fracao' (valor já é a fração)",
    "filtro": "null | {tipo: 'lista', chave, valores} (linhas de uma lista: caminho[chave=valor]) | {tipo: 'dicionario', nome, valores} (chaves de um dicionário: caminho.valor) | {tipo: 'condicao', campo, ate} (usado por contagem_por_ano_todos)",
    "subcampo": "null | str | [str] (lido depois do filtro; uma lista vira dicionário rotulado)",
    "valor_num_14_09": "valor medido nesta rodada, só quando o caminho ainda não está gravado (gravado: o valor sai do JSON)",
    "regra": "valor nulo (não medido) nunca passa, exceto no operador '==' com limiar nulo",
}


_NADA = object()

def M(op, lim, ag="valor", filtro=None, sub=None, v=_NADA, decide=None, criterio=None):
    d = {"operador": op, "limiar": lim, "agregacao": ag, "filtro": filtro, "subcampo": sub}
    if v is not _NADA:
        d["valor_num_14_09"] = v
    if decide is not None:
        d["_decide"] = decide
    if criterio is not None:
        d["_criterio"] = criterio
    return d

def FL(chave, valores):
    return {"tipo": "lista", "chave": chave, "valores": valores}

def FD(nome, valores):
    return {"tipo": "dicionario", "nome": nome, "valores": valores}

SETORES_4 = ["goleiro", "defesa", "meio", "ataque"]
A2_12 = ["dist_remate", "remates_baliza_pct", "duelos_pct", "faltas", "xg_por_remate_contra", "posse", "passes", "passes_pct", "xg_por_remate", "toques_area", "entradas_area", "xg_contra"]

# padrões de regra que se repetem (índices dos critérios)
def P_LINHA_Q(bruto_ou_q, liq, rep, decl=0):  # forte / moderado quando a repetição falha (decl = constante "declarada antes: sim")
    return [("forte", {decl: T, bruto_ou_q: T, liq: T, rep: T}), ("moderado", {decl: T, bruto_ou_q: T, liq: T, rep: F})]

def P_EXCESSO(bruto, liq, q, lista, decl=0):  # régua do "olhar a lista inteira"
    return [("moderado", {decl: T, bruto: T, liq: T, q: F, lista: T}), ("fraco", {bruto: T, liq: F}), ("fraco", {bruto: T, q: F, lista: F})]

MAQ = {
    "DIN-01": {"k": {0: M("<", 0.05), 2: M(">", 0.5, "todos", sub="auc_sobe_x_resto", v=[1.0, 0.72, 0.84, 0.75]), 3: M(">", 0.5), 4: M("<", 0.05, v=0.005)},
               "r": [("forte", {0: T, 2: T, 3: T, 4: T}), ("moderado", {0: T})]},
    "DIN-02": {"k": {0: M("==", 8), 1: M("<", 0.05), 2: M(">", 1.6, "contagem_por_ano_todos", filtro={"tipo": "condicao", "campo": "posto_valor", "ate": 8})},
               "r": [("forte", {0: T, 1: T, 2: T}), ("moderado", {0: T, 1: T})]},
    "DIN-03": {"k": {0: M("<", 0.05, v=0.003), 4: M("<", 0.05, v=0.006)}, "r": [("fraco", {0: T, 1: F, 2: F})]},
    "DIN-04": {"k": {0: M("<", 0.05), 1: M("<", 0.05), 2: M("<", 0.05, v=0.20)}, "r": [("moderado", {0: T, 2: T, 1: F}), ("fraco", {0: T, 2: F}), ("fraco", {0: T, 1: F})]},
    "DIN-05": {"k": {0: M("<", 0.05, "bh", filtro=FL("setor", SETORES_4), sub="p_sobe_x_meio")}, "r": [("fraco", {0: T, 1: F})],
               "caminho": {0: "etapa_1.valor_por_setor.setores"}},
    "DIN-06": {"k": {1: M("==", True), 2: M("==", True)}, "r": [("nao_da_para_afirmar", {0: T, 1: T})]},
    "ORI-01": {"k": {0: M("<", 0.05, "algum", sub=["p_queda", "p_subida"], v={"p_queda": 0.00081, "p_subida": 0.015}),
                     1: M("<", 0.05, "algum", sub=["subida", "queda"], v={"subida": 1.0, "queda": 0.59}),
                     2: M("<", 0.05, "algum", sub=["subida", "queda"], v={"subida": 0.55, "queda": 0.38})},
               "caminho": {0: "conclusoes_base.origem.fisher.A_x_B"},
               "r": [("moderado", {0: T, 1: T, 2: T}), ("fraco", {0: T, 1: F}), ("fraco", {0: T, 2: F})]},
    "ORI-02": {"k": {0: M(">=", 0.10, "todos", sub=["p_subida", "p_queda"], v={"p_subida": 1.0, "p_queda": 0.45}), 1: M("existe", None, v=True)},
               "r": [("sem_sinal", {0: T})]},
    "ELE-01": {"k": {1: M("<", 0.05), 2: M("<", 0.05), 3: M("<", 0.05), 4: M("<", 0.05), 6: M("<", 0.05, v=0.006)},
               "r": [("forte", {0: T, 1: T, 2: T, 3: T, 4: T}), ("moderado", {0: T, 1: T, 2: T, 3: T, 4: F}), ("fraco", {1: T, 3: F})]},
    "ELE-02": {"k": {1: M("<", 0.05), 2: M("<", 0.05), 3: M("<", 0.05), 4: M("<", 0.05)},
               "r": [("forte", {0: T, 1: T, 2: T, 3: T, 4: T}), ("moderado", {0: T, 1: T, 2: T, 3: T, 4: F})]},
    "ELE-03": {"k": {0: M("<", 0.05), 1: M("<", 0.05)}, "r": [("fraco", {0: T, 1: F})]},
    "ELE-04": {"k": {0: M(">=", 0.10), 1: M(">=", 0.10)}, "r": [("sem_sinal", {0: T, 1: T})]},
    "ELE-05": {"k": {0: M(">=", 0.10, "todos", filtro=FL("indicador", ["plantel", "idade_11"]), sub="p_bruto_SM")}, "caminho": {0: "etapa_2.linhas"},
               "r": [("sem_sinal", {0: T})]},
    "ELE-06": {"k": {0: M("<", 0.05, v=0.0642), 1: M("<", 0.05, v=0.025), 2: M("<", 0.05, v=0.16), 4: M("<", 0.05, "todos", sub="p_posicao", v=[0.025, 0.60])},
               "r": [("sem_sinal", {0: F, 1: T, 2: F, 3: F, 4: F})]},
    "ELE-07": {"k": {2: M("<", 0.05, "algum", sub=["q_SM", "q_SC", "q_CM"], v=0.083), 3: M("<", 0.05, "algum", sub=["p_bruto_SM", "p_bruto_SC"], v=0.028, decide=True),
                     4: M("<", 0.05, "todos", sub=["p_liq_SM", "p_liq_SC"], v={"pctFicou": 0.045, "novos": 0.068})},
               "r": [("fraco", {3: T, 0: F, 1: F}), ("fraco", {3: T, 2: F})]},
    "FIS-01": {"k": {2: M("<", 0.05, v=0.0095, decide=True), 3: M("<", 0.05, v=0.094), 4: M("<", 0.05, v=0.22)},
               "r": [("fraco", {2: T, 0: F, 1: F}), ("fraco", {2: T, 3: F}), ("fraco", {2: T, 4: F})]},
    "FIS-04": {"k": {0: M("<", 0.05, "algum", filtro=FD("familia", ["fisico_col_setor", "fisico_col_elenco"]), sub="excesso.SC.bruto.p_excesso", v={"fisico_col_setor": 0.010, "fisico_col_elenco": 0.012}),
                     1: M("<", 0.05, "algum", filtro=FD("familia", ["fisico_col_setor", "fisico_col_elenco"]), sub="excesso.SC.liq2.p_excesso", v={"fisico_col_setor": 0.86, "fisico_col_elenco": 1.0})},
               "caminho": {0: "etapa_3.por_familia", 1: "etapa_3.por_familia"},
               "r": [("moderado", {0: T, 1: T}), ("fraco", {0: T, 1: F}), ("sem_sinal", {0: F})]},
    "FIS-05": {"k": {0: M(">=", 0.10), 1: M(">=", 0.10)}, "r": [("sem_sinal", {0: T, 1: T})]},
    "FIS-06": {"k": {1: M("<", 0.05), 2: M("<", 0.05), 3: M("<", 0.05), 4: M("<", 0.05, v=0.33), 5: M("<", 0.05)}, "r": P_EXCESSO(1, 2, 3, 4)},
    "FIS-07": {"k": {0: M("<", 0.05, v=1.53e-12), 1: M("<", 0.05, v=9.5e-26), 2: M("==", "chave_nome(short_name)|birthdate", v="chave_nome(short_name)|birthdate"), 3: M("existe", None, v=[0.60, 0.68])},
               "r": [("forte", {0: T, 1: T, 2: T})]},
    "FIS-08": {"k": {1: M("<", 0.05), 2: M("<", 0.05), 3: M("<", 0.05), 4: M("<", 0.05, v=0.33)}, "r": P_EXCESSO(1, 2, 3, 4)},
    "FIS-09": {"k": {0: M(">=", 0.10, v=0.33), 1: M(">=", 0.10, v=1.0)}, "r": [("sem_sinal", {0: T, 1: T})]},
    "FIS-10": {"k": {1: M("<", 0.05), 2: M("<", 0.05), 3: M("<", 0.05), 4: M("<", 0.05), 5: M("<", 0.05, v=0.010), 6: M("<", 0.05)},
               "r": [("moderado", {0: T, 1: T, 2: T, 3: T, 4: F, 5: T}), ("fraco", {1: T, 2: F}), ("fraco", {1: T, 3: F}), ("fraco", {1: T, 4: F, 5: F})]},
    "FIS-11": {"k": {1: M("<", 0.05), 2: M("<", 0.05), 3: M("<", 0.05), 4: M("<", 0.05, v=0.33)}, "r": P_EXCESSO(1, 2, 3, 4)},
    "J1": {"k": {1: M("<", 0.05), 2: M("<", 0.05), 3: M("<", 0.05), 4: M("<", 0.05, v=0.062), 5: M("<", 0.05)},
           "caminho": {4: "etapa_7.linhas[indicador=dist_remate].q_parcial"},
           "r": [("forte", {0: T, 1: T, 2: T, 3: T, 5: T}), ("moderado", {0: T, 1: T, 2: T})]},
    "J2": {"k": {1: M("<", 0.05), 2: M("<", 0.05), 3: M("<", 0.05), 4: M("<", 0.05, v=0.062), 5: M("<", 0.05)},
           "caminho": {4: "etapa_7.linhas[indicador=remates_baliza_pct].q_parcial"}, "r": P_LINHA_Q(1, 2, 3)},
    "J3": {"k": {1: M("<", 0.05), 2: M("<", 0.05), 3: M("<", 0.05), 4: M("<", 0.05), 5: M("<", 0.05)}, "r": P_LINHA_Q(1, 2, 3)},
    "J4": {"k": {1: M("<", 0.05), 2: M("<", 0.05), 3: M("<", 0.05), 4: M("<", 0.05, v=0.040), 5: M("<", 0.05), 6: M("<", 0.05), 7: M("<", 0.05)},
           "r": [("forte", {0: T, 1: T, 2: T, 3: T, 5: T}), ("moderado", {0: T, 1: T, 2: T, 3: T})] + P_EXCESSO(1, 2, 3, 4)},
    "J5": {"k": {1: M("<", 0.05, v=0.0034), 2: M("<", 0.05, v=0.019), 3: M("<", 0.05, v=0.002),
                 5: M("<", 0.05, "algum", v={"antigo_CR": 0.52, "clube": 0.22, "turno": 0.20}), 6: M("<", 0.05)},
           "caminho": {5: "etapa_2.linhas[indicador=duelos_aereos_pct].antigo_CR.p"},
           "r": [("moderado", {1: T, 2: T, 3: T}), ("fraco", {1: T, 2: F}), ("fraco", {1: T, 3: F})]},
    "J6": {"k": {1: M("<", 0.05), 2: M("<", 0.05), 3: M("<", 0.05)}, "r": P_LINHA_Q(1, 2, 3)},
    "J7": {"k": {1: M("<", 0.05), 2: M("<", 0.05), 3: M("<", 0.05), 4: M("<", 0.05, v=0.084), 5: M("<", 0.05, v=0.082), 6: M("<", 0.05, v=0.093)}, "r": P_EXCESSO(1, 2, 3, 4)},
    "J13": {"k": {1: M("<", 0.05), 2: M("<", 0.05), 3: M("<", 0.05), 4: M("<", 0.05, v=0.040), 5: M("<", 0.05), 6: M("<", 0.05)},
            "r": [("forte", {0: T, 1: T, 2: T, 3: T, 5: T}), ("moderado", {0: T, 1: T, 2: T, 3: T})] + P_EXCESSO(1, 2, 3, 4)},
    "J14": {"k": {0: M(">=", 0.10, "todos", filtro=FL("indicador", ["ppda", "bolas_paradas", "cantos", "intensidade"]), sub="p_bruto_SM"),
                  1: M(">=", 0.10, "todos", filtro=FL("indicador", ["ppda", "bolas_paradas", "cantos", "intensidade"]), sub="antigo_SM.p", v=0.19)},
            "caminho": {0: "etapa_2.linhas", 1: "etapa_2.linhas"}, "r": [("sem_sinal", {0: T, 1: T})]},
    "J15": {"k": {0: M("<", 0.05), 1: M("<", 0.05), 2: M("<", 0.05)}, "r": [("fraco", {0: F, 1: T, 2: F})]},
    "J19": {"k": {1: M("<", 0.05), 2: M("<", 0.05), 3: M("<", 0.05), 4: M("<", 0.05), 5: M("<", 0.05), 6: M("<", 0.05, sub="p", v=0.87)},
            "r": [("moderado", {0: T, 1: T, 2: T, 3: T, 4: F}), ("fraco", {1: T, 3: F})]},
    "J8": {"k": {0: M("<", 0.05, "algum", sub="p_parcial"), 1: M("<", 0.05, "algum", sub="q_parcial", v=0.062), 2: M("<", 0.05, v=0.12), 3: M("<", 0.05, v=0.044)},
           "caminho": {0: "etapa_7.linhas", 1: "etapa_7.linhas"}, "r": [("fraco", {0: T, 1: F, 2: F})]},
    "J9": {"k": {0: M("<", 0.05), 1: M("<", 0.05, "todos", sub="p", v=[0.035, 0.0627, 0.099]), 2: M("<", 0.05, "todos", sub="p", v=None)},
           "r": [("moderado", {0: T, 1: T}), ("fraco", {0: T, 1: F})]},
    "J10": {"k": {0: M(">=", 0.10)}, "r": [("sem_sinal", {0: T})]},
    "J16": {"k": {2: M("<", 0.05, v=0.038, decide=True), 3: M("<", 0.5, "fracao", v=0.75)}, "r": [("fraco", {2: T, 0: F, 1: F}), ("fraco", {2: T, 3: F})]},
    "J11": {"k": {0: M(">=", 0.10, "todos", filtro=FD("teste", ["linha3", "distintas", "principal_pct"]), sub="p"),
                  1: M(">=", 0.10, "todos", filtro=FD("teste", ["sistemas_distintos", "trocas", "fidelidade_media"]), sub="p_SM")},
            "caminho": {0: "etapa_8.tipologia.formacao", 1: "etapa_15.proxy_sistema.testes"}, "r": [("sem_sinal", {0: T, 1: T})]},
    "J17": {"k": {1: M("<", 0.05), 2: M("<", 0.05), 3: M("<", 0.05), 4: M("<", 0.05, sub="p", v=0.025), 5: M("<", 0.05), 6: M("<", 0.05, v=0.006)},
            "r": [("forte", {0: T, 1: T, 2: T, 3: T, 4: T, 5: T}), ("moderado", {0: T, 1: T, 2: T, 3: T}), ("fraco", {1: T, 3: F})]},
    "J18": {"k": {0: M(">=", 0.10, "todos", filtro=FL("indicador", ["contra_ataques", "cruzamentos"]), sub="p_bruto_SM")}, "caminho": {0: "etapa_2.linhas", 1: "etapa_2.linhas[indicador=contra_ataques].antigo_SM"},
            "r": [("sem_sinal", {0: T})]},
    "J12": {"k": {0: M("==", True)}, "r": [("nao_da_para_afirmar", {0: F})]},
    "A1": {"k": {0: M("<", 0.05, "todos", filtro=FD("periodo", ["2022-2025", "2018-2021"]), sub="TERRITORIO.p_SM"),
                 1: M("<", 0.05, "todos", filtro=FL("indicador", ["posse", "entradas_area", "toques_area"]), sub="p_liq_SM")},
           "caminho": {0: "teste_cego_2018_2021.json eixos_como_marcador_de_acesso", 1: "etapa_2.linhas"}, "r": [("fraco", {0: T, 1: F})]},
    "A2": {"k": {0: M("<", 0.05), 1: M("<", 0.05, "todos", filtro=FL("indicador", A2_12), sub="p_liq_SM")}, "r": [("moderado", {0: T, 1: T}), ("fraco", {0: T, 1: F})]},
    "A3": {"k": {1: M(">=", 0.05, "todos", sub="p", v=0.081)}, "r": [("nao_da_para_afirmar", {0: T, 1: T})]},
    "A4": {"k": {0: M("<", 0.05, v=0.027)}, "r": [("moderado", {0: T, 1: F, 2: T}), ("fraco", {0: T, 1: F, 2: F})]},
    "A5": {"k": {0: M("==", False)}, "r": [("sem_sinal", {0: T})]},
    "A6": {"k": {0: M(">=", 0.10), 1: M(">=", 0.10)}, "r": [("sem_sinal", {0: T, 1: T})]},
    "M1": {"k": {1: M("cruza_zero", None, v=[-0.004, 0.21]), 2: M("cruza_zero", None, v=[-0.01, 0.17]), 3: M("existe", None, v=True)},
           "r": [("nao_da_para_afirmar", {0: T, 1: T, 3: T}), ("nao_da_para_afirmar", {0: T, 2: T, 3: T})]},
    "M7": {"k": {0: M("acima_de_zero", None, "todos", filtro=FD("regua", ["posicao", "setor"]), sub="ic95", v={"posicao": [0.11, 0.32], "setor": [0.07, 0.25]}), 3: M("existe", None, v=None)},
           "caminho": {0: "etapa_11.comparacao_fisico_tecnico.ficou"}, "r": [("moderado", {0: T, 1: F, 2: T}), ("fraco", {0: T, 1: F, 2: F})]},
    "M2": {"k": {0: M(">=", 0.10), 1: M(">=", 0.10)}, "r": [("sem_sinal", {0: T, 1: T})]},
    "M3": {"k": {1: M(">", 0, v=213)}, "r": [("nao_da_para_afirmar", {0: T, 1: T, 2: T})]},
    "M4": {"k": {0: M(">", 0, "algum", filtro=FD("setor", ["zaga", "lateral", "ataque"]), sub="p5_clube", decide=True),
                 1: M(">", 0, "algum", filtro=FD("setor", ["zaga", "lateral", "ataque"]), sub="passam5_liq2", v={"zaga": 0, "lateral": 0, "ataque": 0}),
                 2: M("<", 0.05, "todos", filtro=FD("setor", ["zaga", "lateral", "ataque"]), sub="excesso.SC.bruto.p_excesso", v={"zaga": 0.13, "lateral": 0.15, "ataque": 0.011})},
           "caminho": {0: "sobecai_corrigido_por_clube", 1: "sobecai_corrigido_por_clube", 2: "sobecai_corrigido_por_clube"},
           "criterio": {2: "lista crua acima da sorte nos três setores (p do excesso < 0,05)"},
           "r": [("fraco", {0: T, 1: F})]},
    "M5": {"k": {1: M("<", 0.05, v=0.0055), 2: M("<", 0.05, "min", v=0.14), 3: M("<", 0.05, v=0.024)},
           "r": [("forte", {0: T, 1: T, 2: T}), ("moderado", {0: T, 1: T, 2: F, 3: T}), ("fraco", {1: T, 2: F, 3: F})]},
    "M6": {"k": {0: M("<", 0.05, v=0.016), 1: M("<", 0.05, v=0.16), 4: M("<=", 2025, "max", v=[2022, 2023, 2024, 2025]), 2: M(None, None, decide=True), 3: M(None, None, decide=True)},
           "caminho": {0: "etapa_11.tecnico.metricas[metrica=Passes recebidos/90].p_dif_mudou_ficou", 1: "etapa_11.tecnico.metricas[metrica=Passes recebidos/90].q_dif",
                       4: "etapa_11.efeito_de_retirar_2026.anos_usados_no_tecnico"},
           "r": [("fraco", {0: T, 2: F, 3: F, 4: T}), ("fraco", {0: T, 1: F, 4: T})]},
}
MAQ["M3"]["criterio"] = {2: "não há desempate medido gravado"}
MAQ["M3"]["valor"] = {2: "não há"}


# ------------------------------------------------------------------ leitura e avaliação
def caminhos_efetivos(k):
    """os caminhos concretos que o critério lê (filtro × subcampo). Vazio = constante."""
    c = k.get("caminho")
    if not c:
        return []
    f, sub = k.get("filtro"), k.get("subcampo")
    subs = sub if isinstance(sub, list) else ([sub] if sub else [None])
    if not f or f.get("tipo") == "condicao":
        bases = [(None, c)]
    elif f["tipo"] == "lista":
        bases = [(v, f"{c}[{f['chave']}={v}]") for v in f["valores"]]
    else:
        bases = [(v, f"{c}.{v}") for v in f["valores"]]
    return [((rot, s), b + ("." + s if s else "")) for rot, b in bases for s in subs]

def gravado(k):
    efs = caminhos_efetivos(k)
    return bool(efs) and all(resolver(p)[0] for _, p in efs)

def valor(k):
    """(gravado?, valor): gravado lê o JSON; senão, o valor medido da rodada."""
    efs = caminhos_efetivos(k)
    if not efs:
        return False, None
    if not all(resolver(p)[0] for _, p in efs):
        return False, k.get("valor_num_14_09")
    if len(efs) == 1:
        return True, resolver(efs[0][1])[1]
    return True, {"|".join(str(x) for x in rot if x is not None): resolver(p)[1] for rot, p in efs}

def _bh_min(ps):
    ps = sorted(ps)
    n = len(ps)
    return min(p * n / (i + 1) for i, p in enumerate(ps))

OPS = {
    "<": lambda x, l: x < l, "<=": lambda x, l: x <= l, ">": lambda x, l: x > l, ">=": lambda x, l: x >= l,
    "==": lambda x, l: x == l, "cruza_zero": lambda x, l: x[0] <= 0 <= x[1], "acima_de_zero": lambda x, l: x[0] > 0,
    "existe": lambda x, l: x is not None,
}

def avaliar(k, v):
    if "constante" in k:
        return k["constante"]
    op, lim, ag = OPS[k["operador"]], k["limiar"], k["agregacao"]
    if k["operador"] == "existe":
        return v is not None
    if v is None:
        return k["operador"] == "==" and lim is None
    intervalo = k["operador"] in ("cruza_zero", "acima_de_zero")
    if ag == "contagem_por_ano_todos":
        if isinstance(v, list) and v and isinstance(v[0], dict):
            f = k["filtro"]
            por = {}
            for e in v:
                por.setdefault(e["ano"], 0)
                if e[f["campo"]] <= f["ate"]:
                    por[e["ano"]] += 1
            v = [por[a] for a in sorted(por)]
        return all(op(x, lim) for x in v)
    if ag in ("valor", "fracao") or not isinstance(v, (list, dict)) or (intervalo and isinstance(v, list) and len(v) == 2 and not isinstance(v[0], list)):
        return op(v, lim)
    vs = list(v.values()) if isinstance(v, dict) else list(v)
    if ag in ("min", "max") and any(isinstance(x, list) for x in vs):
        vs = [y for x in vs for y in (x if isinstance(x, list) else [x])]
    if ag == "todos":
        return all(x is not None and op(x, lim) for x in vs)
    if ag == "algum":
        return any(x is not None and op(x, lim) for x in vs)
    if ag == "min":
        return op(min(vs), lim)
    if ag == "max":
        return op(max(vs), lim)
    if ag == "bh":
        return op(_bh_min(vs), lim)
    raise ValueError(ag)

def selo_da_regra(crit, regra):
    passou = {k["id"]: k["passou"] for k in crit}
    for linha in regra["ordem"]:
        if all(passou.get(kid) == esp for kid, esp in linha["exige"].items()):
            return linha["selo"]
    return regra["selo_padrao"]


# ------------------------------------------------------------------ aplicação às conclusões
def aplicar(c):
    """acrescenta a forma de máquina aos critérios e a regra ordenada; confere passou e selo."""
    if any("_m" in k for k in c["crit"]):
        return aplicar_km(c)
    m = MAQ.get(c["id"])
    if m is None:
        raise SystemExit(f"{c['id']}: sem forma de máquina (sp6_maquina.MAQ)")
    for i, k in enumerate(c["crit"]):
        k["id"] = f"k{i}"
        if i in m.get("caminho", {}):
            k["caminho"] = m["caminho"][i]
        if i in m.get("criterio", {}):
            k["criterio"] = m["criterio"][i]
        if i in m.get("valor", {}):
            k["valor_14_09"] = m["valor"][i]
        spec = m["k"].get(i)
        if spec and "_decide" in spec:
            k["decide"] = spec["_decide"]
        if k["caminho"] is None:
            k["constante"] = k["passou"]
            k["fonte"] = "conclusoes_spec (constante declarada; caminho null é constante, não campo ausente)"
            continue
        if spec is None and k["passou"] is None and not k["decide"]:
            k["so_descricao"] = True   # outra conta citada, sem passa/não passa e sem decidir o selo
            continue
        if spec is None:
            raise SystemExit(f"{c['id']} k{i}: critério com caminho sem forma de máquina")
        for chave in ("operador", "limiar", "agregacao", "filtro", "subcampo"):
            k[chave] = spec[chave]
        if "valor_num_14_09" in spec:
            k["valor_num_14_09"] = spec["valor_num_14_09"]
        g, v = valor(k)
        if not g and "valor_num_14_09" not in spec:
            raise SystemExit(f"{c['id']} k{i}: caminho não gravado e sem valor medido ({k['caminho']})")
        calc = avaliar(k, v)
        if calc != k["passou"]:
            raise SystemExit(f"{c['id']} k{i}: passou declarado {k['passou']} ≠ calculado {calc} (valor {v!r}, {k['criterio']})")
    ids = {k["id"] for k in c["crit"]}
    ordem = [{"selo": s, "exige": {f"k{i}": b for i, b in ex.items()}} for s, ex in m["r"]]
    for linha in ordem:
        falta = set(linha["exige"]) - ids
        if falta:
            raise SystemExit(f"{c['id']}: regra exige critério inexistente {falta}")
        for kid in linha["exige"]:
            kk = c["crit"][int(kid[1:])]
            if not kk["decide"]:
                raise SystemExit(f"{c['id']}: regra exige {kid}, marcado como 'não decide'")
    regra = {"ordem": ordem, "selo_padrao": m.get("padrao"), "leitura": "regua.selo_calculado.leitura"}
    s = selo_da_regra(c["crit"], regra)
    if s != c["selo"]:
        raise SystemExit(f"{c['id']}: selo da regra de máquina {s} ≠ selo {c['selo']}")
    decisivos_na_regra = {kid for l in ordem for kid in l["exige"]}
    for k in c["crit"]:
        if k["decide"] and k["id"] not in decisivos_na_regra:
            raise SystemExit(f"{c['id']}: {k['id']} marcado 'decide' e nenhuma linha da regra o lê")
    c["regra_maquina"] = regra
    return c

def faltando(c):
    return [p for k in c["crit"] if k["decide"] for _, p in caminhos_efetivos(k) if not resolver(p)[0]]


# ------------------------------------------------------------------ régua final (rodada sem dinheiro, 15/09/2026)
# Toda conclusão de diferença entre grupos responde às mesmas perguntas: declarada antes? firme (q)? conferida por outro
# caminho? a lista tem mais achados que a sorte? e, no físico, continua descontado só o rodízio? Cada critério traz o seu
# PAPEL, e as linhas da regra saem de uma função só (ordem_comum): não há linha escrita à mão conclusão por conclusão.
# As regras próprias (repetição do atleta, contas da mesma pergunta, não dá para afirmar, sem sinal de várias medidas,
# lista inteira) continuam com as linhas delas, e o regime fica escrito na conclusão.
PAPEIS = {
    "declarada": "1. a comparação do título foi escrita antes de olhar",
    "p": "p bruto < 0,05 na comparação do título",
    "zona": "p < 0,10 (zona cinzenta)",
    "outra": "p < 0,05 em outra comparação da mesma linha",
    "q": "2. firme: q < 0,05 na família declarada (teste único: q = p)",
    "q_folga": "firme com folga: q < 0,025 (entre 0,025 e 0,05 é 'firme por pouco')",
    "conf": "3. conferência testável por outro caminho (1º turno prevendo o 2º, 2018-2021, cada ano sozinho, deixando um ano de fora)",
    "ha_conf": "há pelo menos uma conferência testável (constante)",
    "uma_conf": "há uma conferência testável só (constante)",
    "lista": "4. a lista de onde saiu tem mais achados que a sorte (p do excesso < 0,05, contagem bruta)",
    "rod": "5. só no físico: continua descontado só o rodízio (p < 0,05)",
}
T_, F_ = True, False

def ordem_comum(pp, declarada_constante):
    """linhas {selo, exige} da régua final, em ordem, a partir dos papéis (id do critério por papel)."""
    um = lambda n: pp[n][0] if n in pp else None
    d, p = um("declarada"), um("p")
    rows = []
    if "zona" in pp:
        z, o = um("zona"), um("outra")
        rows += [("sem_sinal", {p: F_, z: F_}), ("sem_sinal", {p: F_, z: T_, o: F_}), ("fraco", {p: F_, z: T_, o: T_})]
    base = {p: T_}
    if "rod" in pp:
        rows.append(("fraco", {p: T_, um("rod"): F_}))
        base[um("rod")] = T_
    lista = um("lista")
    if declarada_constante is not True:          # comparação escolhida depois de olhar: teto moderado, só com a lista DELA
        ed = {d: F_, **base}
        rows += ([("moderado", {**ed, lista: T_}), ("fraco", {**ed, lista: F_})] if lista else [("fraco", ed)])
    if declarada_constante is not False:         # declarada antes
        dd = {d: T_, **base}
        q = um("q")
        forte = {**dd, q: T_, um("ha_conf"): T_, **{c: T_ for c in pp.get("conf", [])}}
        rows += [("forte", {**forte, um("q_folga"): T_}), ("forte", {**forte, um("uma_conf"): F_}), ("moderado", {**dd, q: T_})]
        rows += ([("moderado", {**dd, q: F_, lista: T_}), ("fraco", {**dd, q: F_, lista: F_})] if lista else [("fraco", {**dd, q: F_})])
    return rows

def _fmt(x):
    if isinstance(x, bool):
        return "sim" if x else "não"
    if isinstance(x, int):
        return str(x)
    if isinstance(x, float):
        if x == 0:
            return "0"
        ax = abs(x)
        if ax < 0.0001:
            e = int(math.floor(math.log10(ax))); mnt = x / 10 ** e
            return f"{dec(mnt, 1)} × 10⁻{str(-e).translate(str.maketrans('0123456789', '⁰¹²³⁴⁵⁶⁷⁸⁹'))}"
        casas = max(2, -int(math.floor(math.log10(ax))) + 1)
        return dec(x, min(casas, 4))
    if isinstance(x, list):
        return " / ".join(_fmt(y) for y in x)
    if isinstance(x, dict):
        return "; ".join(f"{k} {_fmt(v)}" for k, v in x.items())
    return str(x)

def aplicar_km(c):
    papeis, decl_const = {}, None
    novos = []
    for i, k in enumerate(c["crit"]):
        kid = f"k{i}"
        papel, mm, v, const, txt, decide = k["_papel"], k["_m"], k["_v"], k["_constante"], k["_txt"], k["_decide"]
        e = {"criterio": k["criterio"], "caminho": k["caminho"]}
        if k["caminho"] is None:
            e.update({"valor_14_09": txt if txt is not None else _fmt(const), "passou": const, "decide": decide, "id": kid, "constante": const,
                      "fonte": "conclusoes_spec (constante declarada; caminho null é constante, não campo ausente)"})
        else:
            tmp = dict(e, **mm)
            if v is not NADA:
                tmp["valor_num_14_09"] = v
            g, val = valor(tmp)
            if not g and v is NADA:
                raise SystemExit(f"{c['id']} {kid}: caminho não gravado no dado novo e sem valor medido ({k['caminho']})")
            passou = avaliar(tmp, val)
            mostra = val
            if mm["agregacao"] in ("min", "max", "bh") and isinstance(val, (list, dict)):
                xs = list(val.values()) if isinstance(val, dict) else list(val)
                xs = [y for x in xs for y in (x if isinstance(x, list) else [x]) if y is not None]
                mostra = (min(xs) if mm["agregacao"] == "min" else max(xs) if mm["agregacao"] == "max" else _bh_min(xs))
            vt = txt if txt is not None else _fmt(mostra)
            if not g:
                vt += " (medido na rodada; o campo ainda não está gravado)"
            e.update({"valor_14_09": vt, "passou": passou, "decide": decide, "id": kid, **mm})
            if v is not NADA:
                e["valor_num_14_09"] = v
        if papel:
            e["papel"] = papel
            papeis.setdefault(papel, []).append(kid)
            if papel == "declarada" and k["caminho"] is None:
                decl_const = const
        novos.append(e)
    c["crit"] = novos
    if c.get("regime", "comum") == "comum":
        faltam = [n for n in ("declarada", "p") if n not in papeis]
        if decl_const is not False:
            faltam += [n for n in ("q", "q_folga", "ha_conf", "uma_conf") if n not in papeis]
        if faltam:
            raise SystemExit(f"{c['id']}: régua comum sem os papéis {faltam}")
        linhas = ordem_comum(papeis, decl_const)
    else:
        linhas = [(s, {f"k{i}": b for i, b in ex.items()}) for s, ex in c["regra_propria"]]
    ordem = [{"selo": s, "exige": ex} for s, ex in linhas]
    ids = {k["id"] for k in c["crit"]}
    for linha in ordem:
        for kid in linha["exige"]:
            if kid not in ids:
                raise SystemExit(f"{c['id']}: regra exige {kid}, que não existe")
            if not c["crit"][int(kid[1:])]["decide"]:
                raise SystemExit(f"{c['id']}: regra exige {kid}, marcado 'não decide'")
    lidos = {kid for l in ordem for kid in l["exige"]}
    for k in c["crit"]:
        if k["decide"] and k["id"] not in lidos:
            raise SystemExit(f"{c['id']}: {k['id']} decide e nenhuma linha da regra o lê")
    regra = {"ordem": ordem, "selo_padrao": None, "leitura": "regua.selo_calculado.leitura"}
    s = selo_da_regra(c["crit"], regra)
    if s != c["selo"]:
        raise SystemExit(f"{c['id']}: a régua dá {s}, o esperado pela decisão é {c['selo']} — {[(k['id'], k['passou']) for k in c['crit']]}")
    c["regra_maquina"] = regra
    c["entradas_da_regua"] = ({"regime": "comum", "papeis": papeis, "declarada_constante": decl_const} if c.get("regime", "comum") == "comum"
                              else {"regime": c["regime"], "papeis": papeis})
    return c
