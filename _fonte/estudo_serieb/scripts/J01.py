#!/usr/bin/env python3
"""J01 — quem tem minutagem alta e regular em cada posição, e quanto da minutagem baixa é lesão.

Parte da aba Minutagem Série B (`dados/minutagem_serieb.json`, 3.864 linhas de jogador + clube +
temporada) e acrescenta o que o CLAUDE.md pede: lesões, regularidade, a faixa do time, e a
**distribuição da minutagem por posição ANTES de fixar o corte** — o corte de 60% do md é declarado
como "a ajustar em J01", e é aqui que se ajusta, olhando a distribuição e não o resultado.

## A fatia de minutos

Vem pronta do gerador da aba: minutos do jogador ÷ tempo que o time jogou, e esse tempo é a soma dos
minutos do elenco ÷ 11 — não é jogos × 90, porque o Wyscout conta os acréscimos. Por isso há fatias
acima de 100% (um titular absoluto faz ~102 min por jogo).

## Lesão: a ponte entre as bases

`serieb_lesoes.csv` é do Transfermarkt e tem `id_jogador`; a minutagem é do Wyscout e tem só o nome.
A ponte passa por `serieb_elencos.csv`, que tem os dois lados (`id_jogador` e `jogador`), casando por
nome normalizado + clube + ano. Caso ambíguo é LISTADO, nunca adivinhado, como o CLAUDE.md manda.

## A ressalva que o md pede

Minutagem alta em time do Cai pode ser falta de opção, não qualidade. A faixa do time entra na base
para a leitura poder separar as duas coisas.

## Os DOIS recortes deste arquivo, e por que são dois

A análise (a base `base_jogador_temporada.csv` e o `J01_resumo.json`) roda em **2022-2026**, com o
nome de clube cru da minutagem: é o que ela sempre rodou, e não muda aqui. Mexer nela mudaria todo
número que este script já produzia, e a regra desta rodada é o contrário — acrescentar, nunca
alterar.

A **saída por marcador** (`J01_numeros.json`, regra 1 do portão) roda em **2022-2025 e com a ponte
de clube** `T01_ponte_clubes.json`, porque é nesse recorte que os textos de J01.json foram escritos
e validados em 19/09: o CLAUDE.md reserva 2026 para teste, e sem a ponte as 36 linhas de "Athletico
Paranaense" 2025 ficam sem faixa e o Sobe perde um clube-temporada de 16. Os dois recortes convivem
de propósito, e a diferença entre eles está dita em cada leitura do stdout.

Fica aberto, e **não** é decisão deste script: o `J01_resumo.json` ainda está gravado em 2022-2026,
como a própria dívida (3) do campo `em_aberto` de J01.json registra. Regravá-lo no recorte que vale
muda a análise e é decisão do dono.

## A saída por marcador

`resultados/J01_numeros.json` é a CONFERÊNCIA dos números que a aba publica, não a substituição
deles: J01.json não é tocado aqui. Todo marcador sai de uma conta sobre o dado bruto — nenhum é
copiado do que está publicado.

## A tabela de testes

`resultados/J01_testes.csv` grava, célula a célula, a única família que esta parte compara: os dois
indicadores de elenco (`usados`, quantos jogadores o clube usou na temporada, e `altos`, quantos
passaram do corte de minutagem) em Cai × Meio e Sobe × Meio, nos dois cortes de fronteira — oito
linhas. É a mesma família que o `confianca_motivo` de J01-3 já declarava e que só existia resumida
no marcador `rob_j01_3`; nada de novo é testado aqui, e a unidade destas oito linhas é
**clube-temporada**, não a jogador-temporada do resto da parte (por isso a coluna `unidade`).

As conclusões J01-1 e J01-2 não entram na tabela e não devem entrar: a primeira conta a distribuição
inteira da minutagem e a segunda é um achado negativo sobre a cobertura da ficha de lesão; nenhuma
das duas compara faixas, e as duas se declaram indício exatamente por isso.

O BH corre sobre as quatro células de cada corte, que é a família declarada pela parte — e é isso
que reproduz os q publicados no campo `prova` de J01-3. `_metodo.comparar` agruparia o BH por
comparação (m=2) e devolveria outro q: aqui a família não é reaberta, ela é a que está publicada.

Uso:
    python3 _fonte/estudo_serieb/scripts/J01.py
"""
import collections
import csv
import json
import math
import os
import re
import statistics as st
import sys
import unicodedata
from decimal import ROUND_HALF_UP, Decimal
from fractions import Fraction

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import bh, cohen_d, d_minimo, ic_por_clube, pct, percentil_no_ano  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
ANOS = {"2022", "2023", "2024", "2025", "2026"}

# --- só a saída por marcador usa daqui para baixo -------------------------------------------------
# As temporadas fechadas. 2026 está em curso e o CLAUDE.md a reserva para teste; é o recorte em que
# os textos de J01.json foram escritos.
FECHADAS = ("2022", "2023", "2024", "2025")
PONTE_CLUBES = os.path.join(R, "T01_ponte_clubes.json")
CLUBE_TEMPORADA = os.path.join(R, "A01_clube_temporada.csv")
NUMEROS_JSON = os.path.join(R, "J01_numeros.json")
TESTES_CSV = os.path.join(R, "J01_testes.csv")
# A mesma semente das outras partes (A06, J02): o IC95 por bootstrap de clube é reproduzível.
RNG = np.random.default_rng(20260917)
# A família de J01-3, como o confianca_motivo dela a declara: os DOIS indicadores nas DUAS
# comparações, oito células ao todo (quatro por corte de fronteira). O BH corre sobre as quatro
# células de cada corte — é o que os q publicados no campo `prova` de J01-3 fixam (0,0037 e 0,0191
# com fronteira; 0,0120 e 0,0151 sem). Rodar o BH por comparação, como o _metodo.comparar agrupa,
# daria m=2 e outro q: aqui a família é a declarada pela parte, e ela não é reaberta.
FAMILIA_J01_3 = "elenco"
COMPARACOES = (("CM", "Cai"), ("SM", "Sobe"))
INDICADORES = (("usados", "Jogadores usados"), ("altos", "Fatias altas"))
# Sinal: nenhum dos dois é métrica de desempenho com "alto = melhor" (CLAUDE.md, Unidade e
# normalização). São contagens de estilo/consequência, e entram sem inversão.
SINAL = 1
# Data fixa: o script é reproduzível — roda hoje e daqui a um ano com o mesmo resultado, e data
# dinâmica só faria o arquivo mudar sem o número mudar.
GERADO_EM = "2026-09-20"


def norm(t):
    t = unicodedata.normalize("NFD", str(t or ""))
    t = "".join(c for c in t if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9 ]", " ", t).strip()


# --------------------------------------------------------------------------------------------------
# Contas exatas. Por que não bastam float e round():
#   - `round()` do Python é bancário: round(32.5) devolve 32, e a regra da casa é meio-termo para
#     cima (32,5 -> 33). Três marcadores caem exatamente em meio-termo (gk_med 21,65, gk_p75 64,65,
#     les_dias 55,5, les_alta_dias 32,5).
#   - a fatia 46,8 em binário é 46,79999999999999715..., então `fatia >= p75` dá FALSO quando o p75
#     é o próprio 46,8. Comparar em Fraction sobre o decimal escrito é o que faz altos_pos fechar em
#     795 e não em 790 — cinco linhas que estão na régua e o float deixava de fora.
# --------------------------------------------------------------------------------------------------
def fr(x):
    """O número como ele está escrito, não como o binário o guarda: 46,8 é 234/5."""
    return Fraction(Decimal(str(x)))


def arred(x, casas=0):
    """Arredonda, nunca trunca, e meio-termo para cima."""
    d = Decimal(x.numerator) / Decimal(x.denominator) if isinstance(x, Fraction) else Decimal(str(x))
    q = d.quantize(Decimal(1).scaleb(-casas), rounding=ROUND_HALF_UP)
    return float(q) if casas else int(q)


def mediana_exata(valores):
    v = sorted(fr(x) for x in valores)
    n = len(v)
    return v[n // 2] if n % 2 else (v[n // 2 - 1] + v[n // 2]) / 2


def percentil_exato(valores, p):
    """O mesmo percentil do np.percentile (interpolação linear), em fração exata."""
    v = sorted(fr(x) for x in valores)
    i = Fraction(p, 100) * (len(v) - 1)
    lo, hi = math.floor(i), math.ceil(i)
    return v[lo] + (i - lo) * (v[hi] - v[lo])


def br(x, casas=1, sinal=False):
    """12.3 -> "12,3"; com sinal, 1.1 -> "+1,10". Só para os marcadores que são frase."""
    t = f"{arred(x, casas):+.{casas}f}" if sinal else f"{arred(x, casas):.{casas}f}"
    return t.replace(".", ",")


# --------------------------------------------------------------------------------------------------
# A saída por marcador (regra 1 do portão, etapa 6 do PLANO.md)
# --------------------------------------------------------------------------------------------------
def marcadores(linhas, elencos, corte):
    """Os 45 marcadores que J01.json publica, cada um recalculado aqui a partir do dado bruto.

    Recorte 2022-2025 e ponte de clube, como explica o cabeçalho. Esta função **não lê J01.json**:
    ela é a contraparte independente dele, e é isso que dá sentido a comparar as duas.
    """
    ponte = json.load(open(PONTE_CLUBES, encoding="utf-8"))
    ct = [r for r in csv.DictReader(open(CLUBE_TEMPORADA, encoding="utf-8"))
          if r["temporada"] in FECHADAS]
    faixa = {(r["temporada"], r["clube"]): r["faixa"] for r in ct}
    fronteira = {(r["temporada"], r["clube"]): r["fronteira"] == "1" for r in ct}
    ct_da_faixa = collections.defaultdict(list)
    for r in ct:
        ct_da_faixa[r["faixa"]].append((r["temporada"], r["clube"]))

    # (nome, ano, clube) que o elenco tem, com o clube do elenco passado pela ponte para bater com
    # o nome que a minutagem usa. Serve a um marcador só: casadas_so_nome.
    elenco_nac = set()
    with open(os.path.join(DADOS, "serieb_elencos.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            elenco_nac.add((norm(r["jogador"]), r["ano"], ponte.get(r["clube"], r["clube"])))

    L = []
    for l in linhas:
        if l["ano"] not in FECHADAS:
            continue
        clube = ponte.get(l["time"], l["time"])
        ids = set(elencos.get((norm(l["jogador"]), l["ano"]), []))
        L.append({"ano": l["ano"], "jogador": l["jogador"], "clube": clube, "grupo": l["grupo"],
                  "fatia": l["fatia_pct"], "faixa": faixa.get((l["ano"], clube)),
                  "id": l["id_tm"], "ambiguo": len(ids) > 1, "dias": l["lesao_dias"]})

    # ---- a distribuição por posição, no recorte dos textos ----
    grupos = sorted({x["grupo"] for x in L if x["grupo"]})
    fatias = {g: [x["fatia"] for x in L if x["grupo"] == g and x["fatia"] is not None]
              for g in grupos}
    p75 = {g: percentil_exato(v, 75) for g, v in fatias.items()}
    med = {g: mediana_exata(v) for g, v in fatias.items()}
    acima = {g: Fraction(sum(1 for y in v if y >= corte), len(v)) * 100 for g, v in fatias.items()}
    frase_corte = " · ".join(f"{g} {br(p75[g])}%"
                             for g in sorted(grupos, key=lambda g: p75[g], reverse=True))

    # ---- regularidade nos DOIS cortes: o único de 60% e o da própria posição ----
    # Mesma regra do corpo do script: fatia alta em 2 das 3 temporadas da janela [ano-2, ano] do
    # próprio jogador, com pelo menos 2 temporadas com dado na janela. Conta-se a LINHA.
    por_nome, por_nome_pos = collections.defaultdict(dict), collections.defaultdict(dict)
    for x in L:
        if x["fatia"] is not None:
            por_nome[x["jogador"]][x["ano"]] = x["fatia"]
            por_nome_pos[x["jogador"]][x["ano"]] = fr(x["fatia"]) >= p75[x["grupo"]]
    for x in L:
        f = x["fatia"]
        jan = range(int(x["ano"]) - 2, int(x["ano"]) + 1)
        tem = sum(1 for a in por_nome[x["jogador"]] if int(a) in jan)
        x["alta"] = f is not None and f >= corte
        x["alta_pos"] = f is not None and fr(f) >= p75[x["grupo"]]
        x["regular"] = tem >= 2 and sum(
            1 for a, v in por_nome[x["jogador"]].items() if int(a) in jan and v >= corte) >= 2
        x["regular_pos"] = tem >= 2 and sum(
            1 for a, v in por_nome_pos[x["jogador"]].items() if int(a) in jan and v) >= 2
    reg_grupo = collections.Counter(x["grupo"] for x in L if x["regular"])

    # ---- lesão: os dois lados, com o denominador de cada um ----
    baixa = [x for x in L if x["fatia"] is not None and x["fatia"] < corte and x["id"]]
    alta = [x for x in L if x["alta"] and x["id"]]
    baixa_les = [x for x in baixa if x["dias"]]
    alta_les = [x for x in alta if x["dias"]]
    # O menor efeito que este desenho enxergaria, pela lógica da §6.7 da ESPECIFICACAO.md. Lá é o d
    # de Cohen; aqui a medida é proporção, então o tamanho de efeito é o h de Cohen.
    h_min = (stats.norm.ppf(0.975) + stats.norm.ppf(0.80)) * math.sqrt(1 / len(baixa) + 1 / len(alta))
    les_dmin = math.sin(h_min / 2 + math.asin(math.sqrt(len(alta_les) / len(alta)))) ** 2 * 100

    # ---- a cobertura da ponte, e o que ela casa sem olhar o clube ----
    sem_id = sum(1 for x in L if x["id"] is None and not x["ambiguo"])
    ambiguos = sum(1 for x in L if x["ambiguo"])
    casadas = [x for x in L if x["id"]]
    so_nome = [x for x in casadas if (norm(x["jogador"]), x["ano"], x["clube"]) not in elenco_nac]

    # ---- quantos jogadores cada faixa usou, e quantos passaram do corte ----
    # "Jogadores usados" é a contagem de LINHAS do clube na temporada: há 19 pares (ano, time,
    # jogador) repetidos em 2022-2025 (homônimos no mesmo elenco), e contar nomes os perderia.
    usados = collections.Counter((x["ano"], x["clube"]) for x in L)
    altos_ct = collections.Counter((x["ano"], x["clube"]) for x in L if x["alta"])

    def por_clube_temporada(conta, fx):
        ks = ct_da_faixa[fx]
        return Fraction(sum(conta[k] for k in ks), len(ks))

    # ---- a robustez de J01-3, pelo método da casa e nos dois cortes da fronteira ----
    base_ct = [{"temporada": t, "clube": c, "faixa": faixa[(t, c)], "fronteira": fronteira[(t, c)],
                "usados": usados[(t, c)], "altos": altos_ct[(t, c)]}
               for r in ct for t, c in [(r["temporada"], r["clube"])]]

    def welch(base, rotulo):
        """As quatro células de um corte: posto dentro da temporada, d de Cohen, t de Welch
        bilateral, IC95 por bootstrap de CLUBE, poder por desenho e BH sobre a família inteira —
        tudo de `scripts/_metodo.py`.

        Devolve (lookup, linhas). O lookup guarda d e p SEM arredondar, porque é dele que sai o
        marcador `rob_j01_3`, que já está publicado e não pode mudar de casa decimal. As linhas são
        a tabela de testes, com os valores arredondados na casa que as outras partes usam.
        """
        ls = [dict(l) for l in base]
        percentil_no_ano(ls, ["usados", "altos"])
        lookup, linhas, ps = {}, [], []
        for ind, nome in INDICADORES:
            for cid, a in COMPARACOES:
                campo = pct(ind)
                ga = (lambda l, a=a: l["faixa"] == a)
                gb = (lambda l: l["faixa"] == "Meio")
                va = [l[campo] for l in ls if ga(l)]
                vb = [l[campo] for l in ls if gb(l)]
                d = cohen_d(va, vb) * SINAL
                p = float(stats.ttest_ind(va, vb, equal_var=False).pvalue)
                lookup[ind, a] = (d, p)
                lo, hi = ic_por_clube(ls, campo, ga, gb, SINAL, RNG)
                linhas.append({
                    "fronteira": rotulo, "familia": FAMILIA_J01_3, "comparacao": cid,
                    "indicador": ind, "unidade": "clube-temporada",
                    "n_a": len(va), "n_b": len(vb),
                    "cru_a": round(float(np.median([l[ind] for l in ls if ga(l)])), 3),
                    "cru_b": round(float(np.median([l[ind] for l in ls if gb(l)])), 3),
                    "d": round(d, 3), "ic95_d": [lo, hi], "p": round(p, 5),
                    "d_minimo_80": d_minimo(len(va), len(vb)),
                    "nome": nome, "placar_redescrito": False,
                })
                ps.append(p)
        for it, q in zip(linhas, bh(ps)):
            it["q"] = round(q, 5)
            it["selo"] = ("firme" if q < 0.05 else
                          ("pode ser sorte" if it["p"] < 0.05 else "sem diferença clara"))
            it["poder_suficiente"] = abs(it["d"]) >= it["d_minimo_80"]
        return lookup, linhas

    # "Sem fronteira" recalcula o posto DEPOIS de tirar as 28 linhas — é a leitura que o campo
    # `prova` de J01-3 fixa. Calcular sobre os 20 do ano e filtrar depois muda quatro células.
    com, linhas_com = welch(base_ct, "com")
    sem, linhas_sem = welch([l for l in base_ct if not l["fronteira"]], "sem")
    # A ordem das colunas é a canônica das outras partes (A07_testes.csv), com `unidade` a mais,
    # como A10, J05, J06 e J08 já fazem: a unidade destas linhas é clube-temporada, e não a
    # jogador-temporada que o resto de J01 usa.
    testes = [{k: it[k] for k in ("fronteira", "familia", "comparacao", "indicador", "unidade",
                                  "n_a", "n_b", "cru_a", "cru_b", "d", "ic95_d", "p",
                                  "d_minimo_80", "q", "selo", "poder_suficiente", "nome",
                                  "placar_redescrito")}
              for it in linhas_com + linhas_sem]
    rob = (
        f"jogadores usados Cai x Meio d {br(com['usados', 'Cai'][0], 2, True)} "
        f"(p {br(com['usados', 'Cai'][1], 4)}) com fronteira e "
        f"{br(sem['usados', 'Cai'][0], 2, True)} (p {br(sem['usados', 'Cai'][1], 4)}) sem; "
        f"Sobe x Meio p {br(com['usados', 'Sobe'][1], 2)} e {br(sem['usados', 'Sobe'][1], 2)} "
        f"(nao separa); fatias altas Cai x Meio d {br(com['altos', 'Cai'][0], 2, True)} "
        f"(p {br(com['altos', 'Cai'][1], 4)}) e {br(sem['altos', 'Cai'][0], 2, True)} "
        f"(p {br(sem['altos', 'Cai'][1], 4)}); fatias altas Sobe x Meio "
        f"p {br(com['altos', 'Sobe'][1], 4)} com e {br(sem['altos', 'Sobe'][1], 4)} sem")

    numeros = {
        # a régua e o tamanho da base
        "corte": corte,
        "n": len(L),
        # a distribuição por posição
        "gk_60": arred(acima["Goleiro"], 1),
        "zag_60": arred(acima["Zaga"], 1),
        "ext_60": arred(acima["Extremo"], 1),
        "atk_60": arred(acima["Atacante"], 1),
        "gk_med": arred(med["Goleiro"], 1),
        "atk_med": arred(med["Atacante"], 1),
        "gk_p75": arred(p75["Goleiro"], 1),
        "atk_p75": arred(p75["Atacante"], 1),
        "corte_por_posicao": frase_corte,
        # quem passa da régua, no corte único e no corte da própria posição
        "altos": sum(1 for x in L if x["alta"]),
        "altos_pos": sum(1 for x in L if x["alta_pos"]),
        "regulares": sum(1 for x in L if x["regular"]),
        "reg_pos": sum(1 for x in L if x["regular_pos"]),
        "reg_gk": reg_grupo["Goleiro"],
        "reg_zag": reg_grupo["Zaga"],
        "reg_ext": reg_grupo["Extremo"],
        "reg_atk": reg_grupo["Atacante"],
        # lesão: os dois lados, cada um com o seu denominador
        "les_base": len(baixa),
        "les_n": len(baixa_les),
        "les_baixa_pct": arred(Fraction(len(baixa_les), len(baixa)) * 100, 1),
        "les_alta_base": len(alta),
        "les_alta_n": len(alta_les),
        "les_alta_pct": arred(Fraction(len(alta_les), len(alta)) * 100, 1),
        "les_dias": arred(mediana_exata([x["dias"] for x in baixa_les])),
        "les_alta_dias": arred(mediana_exata([x["dias"] for x in alta_les])),
        "les_dmin": arred(les_dmin, 1),
        # a cobertura da ponte
        "casadas_so_nome": len(so_nome),
        "casadas_so_nome_lesao": sum(1 for x in so_nome if x["dias"]),
        "sem_ponte": sem_id + ambiguos,
        "sem_id": sem_id,
        "ambiguos": ambiguos,
        "pct_sem_ponte": arred(Fraction(sem_id + ambiguos, len(L)) * 100),
        # quantos jogadores cada faixa usou, e quantos passaram do corte
        "sobe_usados": arred(por_clube_temporada(usados, "Sobe"), 1),
        "meio_usados": arred(por_clube_temporada(usados, "Meio"), 1),
        "cai_usados": arred(por_clube_temporada(usados, "Cai"), 1),
        "sobe_altos": arred(por_clube_temporada(altos_ct, "Sobe"), 1),
        "meio_altos": arred(por_clube_temporada(altos_ct, "Meio"), 1),
        "cai_altos": arred(por_clube_temporada(altos_ct, "Cai"), 1),
        "n_ct": len(ct),
        "n_sobe": len(ct_da_faixa["Sobe"]),
        "n_meio": len(ct_da_faixa["Meio"]),
        "n_cai": len(ct_da_faixa["Cai"]),
        "rob_j01_3": rob,
    }
    return numeros, L, casadas, testes


def main():
    mn = json.load(open(os.path.join(DADOS, "minutagem_serieb.json"), encoding="utf-8"))
    C = {c: i for i, c in enumerate(mn["colunas"])}
    faixa = {(r["temporada"], r["clube"]): r["faixa"]
             for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                          encoding="utf-8"))}

    # ponte: nome+clube+ano -> id do Transfermarkt, via elencos
    elencos = collections.defaultdict(list)
    with open(os.path.join(DADOS, "serieb_elencos.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            elencos[(norm(r["jogador"]), r["ano"])].append(r["id_jogador"])
    # lesões por (id, ano)
    les = collections.defaultdict(lambda: {"dias": 0, "jogos": 0, "n": 0})
    with open(os.path.join(DADOS, "serieb_lesoes.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            for ano in ANOS:
                col = f"dias_{ano}"
                try:
                    d = float(r.get(col) or 0)
                except ValueError:
                    d = 0
                if d > 0:
                    k = (r["id_jogador"], ano)
                    les[k]["dias"] += d
                    les[k]["n"] += 1
                    try:
                        les[k]["jogos"] += float(r.get("jogos_perdidos") or 0)
                    except ValueError:
                        pass

    linhas, ambiguos, sem_id = [], [], 0
    for l in mn["linhas"]:
        ano = str(l[C["ano"]])
        if ano not in ANOS:
            continue
        nome, time = l[C["jogador"]], l[C["time"]]
        ids = set(elencos.get((norm(nome), ano), []))
        if len(ids) > 1:
            ambiguos.append({"jogador": nome, "ano": ano, "time": time, "ids": sorted(ids)})
            idj = None
        elif ids:
            idj = ids.pop()
        else:
            idj = None
            sem_id += 1
        d = les.get((idj, ano), {}) if idj else {}
        linhas.append({"ano": ano, "jogador": nome, "time": time,
                       "posicao": l[C["posicao"]], "grupo": l[C["grupo"]],
                       "idade": l[C["idade"]], "jogos": l[C["jogos"]],
                       "minutos": l[C["minutos"]], "fatia_pct": l[C["fatia_pct"]],
                       "time_hoje": l[C["time_hoje"]],
                       "faixa_do_time": faixa.get((ano, time)),
                       "id_tm": idj, "lesao_dias": d.get("dias"), "lesao_n": d.get("n"),
                       "lesao_jogos_perdidos": d.get("jogos")})
    print(f"base: {len(linhas)} jogador-temporadas · {len({l['jogador'] for l in linhas})} nomes")
    print(f"  sem id do Transfermarkt: {sem_id} · nomes ambíguos (2+ ids): {len(ambiguos)}")
    print(f"  com lesão registrada: {sum(1 for l in linhas if l['lesao_dias'])}")

    # regularidade: fatia alta em quantas das últimas 3 temporadas do jogador
    por_nome = collections.defaultdict(dict)
    for l in linhas:
        if l["fatia_pct"] is not None:
            por_nome[l["jogador"]][l["ano"]] = l["fatia_pct"]

    # ---- a DISTRIBUIÇÃO por posição, antes de fixar o corte ----
    dist = {}
    for g in sorted({l["grupo"] for l in linhas if l["grupo"]}):
        v = [l["fatia_pct"] for l in linhas if l["grupo"] == g and l["fatia_pct"] is not None]
        dist[g] = {"n": len(v),
                   **{f"p{p}": round(float(np.percentile(v, p)), 1)
                      for p in (10, 25, 50, 75, 90)},
                   "max": round(max(v), 1),
                   "acima_de_60": round(100 * sum(1 for x in v if x >= 60) / len(v), 1),
                   "acima_de_50": round(100 * sum(1 for x in v if x >= 50) / len(v), 1),
                   "acima_de_70": round(100 * sum(1 for x in v if x >= 70) / len(v), 1)}
    todos = [l["fatia_pct"] for l in linhas if l["fatia_pct"] is not None]

    # com o corte escolhido, quantos por posição e por temporada
    CORTE = 60
    for l in linhas:
        f = l["fatia_pct"]
        l["alta"] = int(f is not None and f >= CORTE)
        anos_alta = sum(1 for a, x in por_nome[l["jogador"]].items()
                        if int(a) in range(int(l["ano"]) - 2, int(l["ano"]) + 1) and x >= CORTE)
        anos_tem = sum(1 for a in por_nome[l["jogador"]]
                       if int(a) in range(int(l["ano"]) - 2, int(l["ano"]) + 1))
        l["temporadas_alta_ult3"] = anos_alta
        l["temporadas_com_dado_ult3"] = anos_tem
        l["regular"] = int(anos_alta >= 2 and anos_tem >= 2)

    # ---- quanto da minutagem baixa é lesão ----
    baixa = [l for l in linhas if l["fatia_pct"] is not None and l["fatia_pct"] < CORTE]
    baixa_com_id = [l for l in baixa if l["id_tm"]]
    com_lesao = [l for l in baixa_com_id if l["lesao_dias"]]
    alta_com_id = [l for l in linhas if l["alta"] and l["id_tm"]]
    alta_lesao = [l for l in alta_com_id if l["lesao_dias"]]

    # ---- minutagem alta em time do Cai: falta de opção? ----
    por_faixa = {}
    for fx in ("Sobe", "Meio", "Cai"):
        g = [l for l in linhas if l["faixa_do_time"] == fx and l["fatia_pct"] is not None]
        if g:
            por_faixa[fx] = {"n": len(g),
                             "altos_por_clube_temporada": round(
                                 sum(1 for l in g if l["alta"]) /
                                 len({(l["ano"], l["time"]) for l in g}), 1),
                             "fatia_mediana": round(st.median(l["fatia_pct"] for l in g), 1)}

    with open(os.path.join(R, "base_jogador_temporada.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(linhas[0]))
        w.writeheader(); w.writerows(linhas)
    json.dump({"corte_escolhido": CORTE,
               "distribuicao_por_posicao": dist,
               "geral": {"n": len(todos),
                         **{f"p{p}": round(float(np.percentile(todos, p)), 1)
                            for p in (10, 25, 50, 75, 90)}},
               "lesao": {"minutagem_baixa": len(baixa), "com_id": len(baixa_com_id),
                         "com_lesao": len(com_lesao),
                         "pct_da_baixa_com_lesao": round(100 * len(com_lesao) / len(baixa_com_id), 1),
                         "dias_medianos_quando_tem": round(st.median(l["lesao_dias"] for l in com_lesao), 0),
                         "alta_com_lesao_pct": round(100 * len(alta_lesao) / len(alta_com_id), 1),
                         "leitura": "a fatia de minutagem baixa que tem lesão registrada, contra a fatia da alta que também tem — a diferença é o quanto a lesão explica"},
               "por_faixa_do_time": por_faixa,
               "regulares": sum(1 for l in linhas if l["regular"]),
               "altos": sum(1 for l in linhas if l["alta"]),
               "ambiguos": ambiguos[:40], "n_ambiguos": len(ambiguos), "sem_id": sem_id},
              open(os.path.join(R, "J01_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"\n{'='*92}\nA DISTRIBUIÇÃO DA FATIA DE MINUTOS, POR POSIÇÃO (antes de fixar o corte)\n{'='*92}")
    print(f"{'posição':12s} {'n':>5s} {'p10':>6s} {'p25':>6s} {'mediana':>8s} {'p75':>6s} {'p90':>6s} "
          f"{'máx':>6s} {'≥50%':>6s} {'≥60%':>6s} {'≥70%':>6s}")
    for g, d in dist.items():
        print(f"{g:12s} {d['n']:5d} {d['p10']:6.1f} {d['p25']:6.1f} {d['p50']:8.1f} {d['p75']:6.1f} "
              f"{d['p90']:6.1f} {d['max']:6.1f} {d['acima_de_50']:5.1f}% {d['acima_de_60']:5.1f}% "
              f"{d['acima_de_70']:5.1f}%")
    print(f"\n{'='*92}\nQUANTO DA MINUTAGEM BAIXA É LESÃO\n{'='*92}")
    j = json.load(open(os.path.join(R, "J01_resumo.json"), encoding="utf-8"))["lesao"]
    print(f"  minutagem baixa (< {CORTE}%): {j['minutagem_baixa']} · com id do Transfermarkt: {j['com_id']}")
    print(f"  destes, com lesão registrada: {j['com_lesao']} ({j['pct_da_baixa_com_lesao']}%), "
          f"mediana de {j['dias_medianos_quando_tem']:.0f} dias")
    print(f"  para comparar: dos de minutagem ALTA, {j['alta_com_lesao_pct']}% também tiveram lesão")
    print(f"\n{'='*92}\nMINUTAGEM ALTA POR FAIXA DO TIME (falta de opção?)\n{'='*92}")
    for fx, d in por_faixa.items():
        print(f"  {fx:5s} {d['altos_por_clube_temporada']:4.1f} jogadores de fatia alta por "
              f"clube-temporada · fatia mediana {d['fatia_mediana']}%")
    print(f"\n  regulares (fatia alta em 2+ das últimas 3 temporadas): "
          f"{sum(1 for l in linhas if l['regular'])} de {len(linhas)}")

    # ---- a saída por marcador: a conferência do que a aba publica ----
    # Regra 1 do portão: todo marcador de J01.json tem de sair daqui. A análise acima não muda —
    # esta parte só acrescenta, e no recorte em que os textos da aba foram escritos (2022-2025 e a
    # ponte de clube). J01.json NÃO é tocado: divergência entre os dois lados é achado, não conserto.
    numeros, L, casadas, testes = marcadores(linhas, elencos, CORTE)
    json.dump({"gerado_por": "scripts/J01.py", "gerado_em": GERADO_EM,
               "recorte": "2022-2025 (as temporadas fechadas) com a ponte de clube "
                          "resultados/T01_ponte_clubes.json",
               "numeros": numeros},
              open(NUMEROS_JSON, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"\n{'='*92}\nJ01_numeros.json: {len(numeros)} marcadores, recorte 2022-2025 + ponte "
          f"de clube\n{'='*92}")
    print(f"  base do marcador: {numeros['n']} linhas, contra as {len(linhas)} da análise acima "
          f"(a diferença são as {len(linhas) - numeros['n']} de 2026)")
    print(f"  ponte de clube: {len(L)} linhas com faixa, "
          f"{sum(1 for x in L if x['faixa'] is None)} sem — sem a ponte, as 36 do Athletico-PR "
          f"2025 ficariam de fora")
    print(f"  ponte de lesão: {len(casadas)} linhas casadas, {numeros['sem_ponte']} sem ficha "
          f"({numeros['pct_sem_ponte']}%)")
    print(f"  corte por posição (p75 de cada grupo): {numeros['corte_por_posicao']}")

    # ---- a tabela de testes: as oito células da família de J01-3, nos dois cortes ----
    # Regras 2 e 3 do portão. Ela não acrescenta conclusão nenhuma: grava, no formato das outras
    # partes, exatamente a família que o `confianca_motivo` de J01-3 já declarava e que só existia
    # resumida no marcador `rob_j01_3`.
    with open(TESTES_CSV, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(testes[0]))
        w.writeheader(); w.writerows(testes)
    print(f"\n{'='*92}\nJ01_testes.csv: {len(testes)} células (2 indicadores × 2 comparações × 2 "
          f"cortes de fronteira)\n{'='*92}")
    for t in testes:
        print(f"  {t['fronteira']:4s} {t['comparacao']} {t['indicador']:7s} "
              f"n {t['n_a']:2d}×{t['n_b']:2d}  d {t['d']:+.3f}  IC95 {t['ic95_d']}  "
              f"p {t['p']:.4f}  q {t['q']:.4f}  d_min {t['d_minimo_80']}  {t['selo']}")


if __name__ == "__main__":
    main()
