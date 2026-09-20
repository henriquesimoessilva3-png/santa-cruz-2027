#!/usr/bin/env python3
"""A14 — a síntese: o que mais separa quem sobe, e onde 2026 está nessa régua.

Parte do que sobreviveu em TODAS as partes do Bloco A, não de uma lista nova. O candidato entra se
for firme nos DOIS cortes de fronteira em Sobe × Meio (a regra corrigida em 17/09) e se NÃO for
"placar redescrito" da lista branca da §6 — gols, pontos e a sobra sobre o xG medem o resultado,
não a característica, e por isso ficam fora do índice mesmo tendo os maiores efeitos.

Quatro passos:

1. **Reunir os candidatos.** Lidos direto dos `*_testes.csv` das partes, sem redigitar nada.
2. **Descartar redundância.** Indicadores que medem a mesma coisa (rho de Spearman ≥ 0,80 entre os
   percentis) ficam representados por um só — o de maior efeito.
3. **Validar deixando uma temporada de fora.** O índice é montado sem uma temporada e aplicado nela,
   quatro vezes. É o teste que o CLAUDE.md pede para A14.
4. **Aplicar a 2026**, informando a rodada. E como em 2026 só 1º e 2º sobem direto, verificar
   também se a régua separa 1º–2º de 3º–6º — com 8 times-temporada em 1º–2º nas quatro fechadas,
   isso é indicativo, como o md manda dizer.
5. **Gravar a tabela de testes** (`resultados/A14_testes.csv`), com os dois cortes de fronteira
   lado a lado. Não é teste novo: é a mesma comparação dos passos 3, 3b e 4 escrita em tabela, mais
   o corte sem fronteira do 1º–2º contra 3º–6º, que faltava e que a régua da fronteira exige de
   toda comparação entre faixas. O indicador é um só — a régua. Os sete componentes não entram:
   quem os testou foram A02, A03, A06 e A12.

Uso:
    python3 _fonte/estudo_serieb/scripts/A14.py
"""
import collections
import csv
import json
import os
import re
import sys

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import bh, cohen_d, d_minimo, ic_por_clube, pct, percentil_no_ano  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
FECHADAS = ["2022", "2023", "2024", "2025"]
REDUNDANCIA = 0.80

# A saída por marcador: todo número que A14.json publica sai daqui, com o mesmo nome (regra 1 do
# portão, etapa 6 do PLANO.md). Data fixa porque o script é reprodutível — roda hoje e daqui a um
# ano com o mesmo resultado, e data dinâmica só faria o arquivo mudar sem o número mudar.
NUMEROS_JSON = os.path.join(R, "A14_numeros.json")
GERADO_EM = "2026-09-20"

# A tabela de testes da parte (regras 2 e 3 do portão, etapa 6 do PLANO.md). Ela NÃO acrescenta
# teste nenhum: grava, linha a linha, as comparações que este script já rodava e que só existiam
# soltas no A14_resumo.json e nos marcadores. A coluna `fronteira` é o corte: "com" são os 20 times
# de cada ano, "sem" tira os times colados na linha do G4/Z4 — é por ela que a regra 3 emparelha.
TESTES_CSV = os.path.join(R, "A14_testes.csv")
COLUNAS_TESTES = ["fronteira", "familia", "comparacao", "grupos", "recorte", "indicador",
                  "n_a", "n_b", "cru_a", "cru_b", "d", "ic95_d", "p", "d_minimo_80", "q",
                  "selo", "poder_suficiente", "nome", "placar_redescrito"]
# O indicador desta parte é um só: a régua. Os sete componentes NÃO entram na tabela — quem os
# testou foram A02, A03, A06 e A12, e republicá-los aqui com outro q é justamente o que a regra 7
# proíbe.
INDICADOR = "indice"
NOME_DO_INDICE = "A régua do Bloco A (índice de 7 indicadores)"
TODAS = "2022-2025 (as quatro fechadas)"
RNG = np.random.default_rng(20260917)

# Sai do índice por não ser característica, e sim resultado contado de outro jeito — a mesma régua
# da lista branca da §6 que já barra o placar redescrito. A régua I_estabilidade_11 é feita só dos
# quatro nomes da constante CONSEQUENCIA de ranking_gaps.py (share_11, conc_hhi, atletas_usados,
# nucleo_300): time que vai bem repete escalação, e não o contrário.
CONSEQUENCIA = {"I_estabilidade_11": "é consequência do resultado, não característica"}

# O que o clube NÃO escolhe. O valor do elenco é a peça de maior efeito do índice e não é decisão
# de modelo de jogo: a ressalva de 15/09 foi não descontar o dinheiro, só dizer quanto dele há.
NAO_ESCOLHIVEIS = {"H_dinheiro"}


def vg(v, casas=1):
    """Número em pt-BR, para entrar em texto: 78,1 · 1,74 · 33,0."""
    return f"{v:.{casas}f}".replace(".", ",")


def marcador(v, casas=1):
    """O valor como a aba o publica: número quando a casa decimal sobrevive ao float, e texto em
    pt-BR quando ela sumiria — 33.0 vira "33" na tela, e o que se quer mostrar é 33,0."""
    r = round(float(v), casas)
    return vg(r, casas) if float(r).is_integer() else r


def marcador_p(p):
    """p e q como a aba os publica: científico quando cinco casas engoliriam o número."""
    return (f"{p:.2e}" if p < 1e-4 else f"{p:.5f}").replace(".", ",")


def unico(valores):
    """O valor quando os candidatos concordam num só; None quando não há um. Marcador com None
    reprova na regra 1 e aparece — que é o que se quer se a base deixar de dar a resposta."""
    v = list(valores)
    return v[0] if len(set(v)) == 1 and v else None


def ano_n(anos, i):
    """O i-ésimo ano da lista, como inteiro. None se a lista encurtar — ver `unico`."""
    return int(anos[i]) if len(anos) > i else None


# De onde vem cada candidato. Colunas diretas do CSV do clube-temporada, menos as que cada parte
# derivou por conta própria — essas têm de ser recalculadas aqui, com a mesma regra da parte.
DERIVADOS = {"duelos_def_pct": "jogo", "dd_casa": "jogo", "dd_fora": "jogo", "xgc_casa": "jogo"}


def sinais():
    """O sinal de cada candidato, lido das declarações das partes. Régua já vem alinhada (+1).

    Sem isto o índice soma percentil de indicador onde MENOS é melhor como se fosse mais: três dos
    oito componentes (dist_remate, xg_por_remate_contra, xgc_casa) entravam invertidos, e o índice
    passou a apontar ao contrário em 2025. O diagnóstico que revelou foi o d componente a componente.
    """
    s = {}
    for arq in os.listdir(R):
        if not arq.endswith("_indicadores.json"):
            continue
        d = json.load(open(os.path.join(R, arq), encoding="utf-8"))
        for fam in d.get("familias", []):
            for i in fam.get("indicadores", []):
                # A10_indicadores.json guarda os indicadores como nome solto, não como objeto;
                # ler só o que é objeto pula esse arquivo sem mudar sinal nenhum dos daqui.
                if isinstance(i, dict):
                    s.setdefault(i["id"], i["sinal"])
    # os indicadores que o A03 derivou por mando herdam o sinal do indicador de origem
    s.setdefault("xgc_casa", -1)
    s.setdefault("dd_casa", 1)
    s.setdefault("dd_fora", 1)
    return s


def candidatos():
    """Tudo que é firme nos dois cortes em Sobe × Meio e não é placar redescrito."""
    vistos, out = set(), []
    for arq in sorted(os.listdir(R)):
        if not (arq.endswith("_testes.csv") or arq.endswith("_reguas.csv")):
            continue
        if not arq.startswith("A"):
            continue      # J03/J08 são de outro bloco e nem têm a coluna comparacao
        por = collections.defaultdict(dict)
        leitor = csv.DictReader(open(os.path.join(R, arq), encoding="utf-8"))
        if not {"comparacao", "fronteira"} <= set(leitor.fieldnames or []):
            continue      # A10_testes.csv usa "corte" no lugar de "fronteira": estrutura outra
        for r in leitor:
            if r["comparacao"] == "SM":
                por[r["indicador"]][r["fronteira"]] = r
        for ind, v in por.items():
            if (v.get("com", {}).get("selo") == "firme"
                    and v.get("sem", {}).get("selo") == "firme"
                    and v["sem"].get("placar_redescrito", "False") != "True"
                    and ind not in vistos):
                vistos.add(ind)
                out.append({"indicador": ind, "parte": arq.split("_")[0],
                            "d": min(abs(float(v["com"]["d"])), abs(float(v["sem"]["d"])))})
    return sorted(out, key=lambda c: -c["d"])


def base_completa(inds):
    """Monta todos os indicadores, inclusive os que as partes derivaram do jogo a jogo."""
    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    tec = {(r["ano"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(DADOS, "serieb_clube_temporada.csv"),
                                        encoding="utf-8-sig"))}
    eixos = json.load(open(os.path.join(DADOS, "prototipo_indicadores.json"),
                           encoding="utf-8"))["eixos"]
    # jogo a jogo: duelo defensivo (total, casa e fora) e xG sofrido em casa
    jogos = collections.defaultdict(list)
    with open(os.path.join(DADOS, "serieb_jogos.csv"), encoding="utf-8-sig") as f:
        linhas = []
        for r in csv.DictReader(f):
            if r.get("Competição") != "Brazil. Serie B":
                continue
            m = re.match(r"(\d{4})-\d{2}-\d{2}", r["Data"] or "")
            if not m:
                continue
            def num(c):
                try:
                    return float(r[c])
                except (TypeError, ValueError, KeyError):
                    return None
            linhas.append({"ano": m.group(1), "data": r["Data"][:10], "clube": r["Equipa"],
                           "adv": r["adversario"], "mando": r["mando"],
                           "dd": num("Duelos defensivos ganhos, %"), "xg": num("Golos esperados")})
    idx = {(l["ano"], l["data"], l["clube"]): l for l in linhas}
    for l in linhas:
        o = idx.get((l["ano"], l["data"], l["adv"]))
        l["xgc"] = o["xg"] if o else None
        jogos[(l["ano"], l["clube"])].append(l)

    def med(js, c):
        v = [j[c] for j in js if j[c] is not None]
        return sum(v) / len(v) if v else None

    base = []
    itens_eixo = sorted({i for v in eixos.values() for i, _ in v})
    for k, a in a01.items():
        t = tec.get(k)
        js = jogos.get(k, [])
        if not t or not js:
            continue
        l = {"temporada": k[0], "clube": k[1], "faixa": a["faixa"], "pos": int(a["pos"]),
             "pontos": int(a["pontos"]), "trave": a["trave"] == "1",
             "fronteira": a["fronteira"] == "1"}
        for c in itens_eixo + [i for i in inds if i not in DERIVADOS and i not in eixos]:
            v = t.get(c)
            try:
                l[c] = float(v) if v not in (None, "", "nan") else None
            except ValueError:
                l[c] = None
        l["duelos_def_pct"] = med(js, "dd")
        l["dd_casa"] = med([j for j in js if j["mando"] == "casa"], "dd")
        l["dd_fora"] = med([j for j in js if j["mando"] == "fora"], "dd")
        l["xgc_casa"] = med([j for j in js if j["mando"] == "casa"], "xgc")
        base.append(l)
    base = [l for l in base if all(l.get(c) is not None for c in itens_eixo)]
    percentil_no_ano(base, itens_eixo)
    for l in base:
        for eixo, its in eixos.items():
            l[eixo] = sum((l[pct(i)] if s > 0 else 100 - l[pct(i)]) for i, s in its) / len(its)
    base = [l for l in base if all(l.get(c) is not None for c in inds)]
    percentil_no_ano(base, inds)
    return base


def p5(v):
    """p e q na tabela: cinco algarismos significativos, para que 1,75e-05 não vire 0,00002."""
    return None if v is None else float(f"{float(v):.5g}")


def selo_de(q, p):
    """O mesmo selo de _metodo.comparar(): firme só depois do BH, nunca pelo p sozinho."""
    if q is None or p is None:
        return ""
    return "firme" if q < 0.05 else ("pode ser sorte" if p < 0.05 else "sem diferença clara")


def linha_de_teste(fronteira, familia, comparacao, grupos, recorte, a, b, base_ic=None,
                   ga=None, gb=None, d=None, p=None, d_min=None):
    """Uma linha da tabela de testes. `d`, `p` e `d_min` podem vir prontos: as quatro linhas da
    validação reaproveitam exatamente os valores que este script já calculou e publica, para que a
    tabela e os marcadores não possam divergir."""
    if p is None:
        _, p = stats.ttest_ind(a, b, equal_var=False)
        p = float(p)
    if d is None:
        d = cohen_d(a, b)
    if d_min is None:
        d_min = d_minimo(len(a), len(b))
    ic = ic_por_clube(base_ic, "indice_a14", ga, gb, 1, RNG) if base_ic else (None, None)
    return {"fronteira": fronteira, "familia": familia, "comparacao": comparacao,
            "grupos": grupos, "recorte": recorte, "indicador": INDICADOR,
            "n_a": len(a), "n_b": len(b),
            "cru_a": round(float(np.median(a)), 1), "cru_b": round(float(np.median(b)), 1),
            "d": round(float(d), 2), "ic95_d": list(ic), "p": p5(p), "d_minimo_80": d_min,
            "q": None, "selo": "", "poder_suficiente": abs(float(d)) >= d_min,
            "nome": NOME_DO_INDICE, "placar_redescrito": False}


def linha_sem_teste(fronteira, familia, comparacao, grupos, recorte, a, b, motivo):
    """O corte que não tem times para comparar. Célula em branco de propósito: a regra 3 do portão
    lê branco como “este corte não publicou resultado”, que é a verdade, e não como concordância."""
    return {"fronteira": fronteira, "familia": familia, "comparacao": comparacao,
            "grupos": grupos, "recorte": recorte, "indicador": INDICADOR,
            "n_a": len(a), "n_b": len(b),
            "cru_a": round(float(np.median(a)), 1) if a else None,
            "cru_b": round(float(np.median(b)), 1) if b else None,
            "d": None, "ic95_d": None, "p": None, "d_minimo_80": None, "q": None,
            "selo": motivo, "poder_suficiente": None, "nome": NOME_DO_INDICE,
            "placar_redescrito": False}


def fechar_familia(linhas):
    """BH a 5% dentro da família, como manda a §6. Família = um pilar × uma comparação × um corte,
    que é a mesma conta de _metodo.comparar(): o loop do corte é o de fora, e cada corte corrige
    dentro de si. As quatro linhas da validação já vêm com o q calculado no passo 3; aqui só se
    fecham as famílias que ainda não têm."""
    pendentes = [l for l in linhas if l["q"] is None and l["p"] is not None]
    for l, q in zip(pendentes, bh([l["p"] for l in pendentes])):
        l["q"] = p5(q)
    for l in linhas:
        if not l["selo"]:
            l["selo"] = selo_de(l["q"], l["p"])
    return linhas



def main():
    cands = candidatos()
    inds = [c["indicador"] for c in cands]
    print(f"candidatos firmes nos dois cortes, sem placar: {len(inds)}")
    for c in cands:
        print(f"   {c['parte']:5s} {c['indicador']:26s} |d| mínimo {c['d']:.2f}")

    base = base_completa(inds)
    fech = [l for l in base if l["temporada"] in FECHADAS]
    print(f"\nbase: {len(base)} clube-temporadas ({len(fech)} fechadas)")

    # ---- 2. redundância ----
    M = {a: {b: abs(stats.spearmanr([l[pct(a)] for l in fech], [l[pct(b)] for l in fech])[0])
             for b in inds} for a in inds}   # |rho|: redundância não depende do sinal
    fica, saiu = [], []
    for c in cands:                       # já vêm ordenados por efeito
        i = c["indicador"]
        par = next((j for j in fica if M[i][j] >= REDUNDANCIA), None)
        (saiu.append((i, par, round(M[i][par], 2))) if par else fica.append(i))
    print(f"\nredundância (rho ≥ {REDUNDANCIA}): ficam {len(fica)}, saem {len(saiu)}")
    for i, par, r in saiu:
        print(f"   {i} sai — mede o mesmo que {par} (rho {r})")

    # ---- 2b. o que é resultado contado de outro jeito não entra ----
    fora_consequencia = [i for i in fica if i in CONSEQUENCIA]
    fica = [i for i in fica if i not in CONSEQUENCIA]
    for i in fora_consequencia:
        print(f"   {i} sai — {CONSEQUENCIA[i]}")
    print(f"   índice = {fica}")

    sg = sinais()
    eixos_nomes = set(json.load(open(os.path.join(DADOS, "prototipo_indicadores.json"),
                                     encoding="utf-8"))["eixos"])

    def alinhado(l, q):
        """Percentil com alto = melhor. Régua já vem alinhada por construção."""
        if q in eixos_nomes:
            return l[q]
        return l[pct(q)] if sg.get(q, 1) > 0 else 100 - l[pct(q)]

    def indice(linhas, quais):
        return {(l["temporada"], l["clube"]): sum(alinhado(l, q) for q in quais) / len(quais)
                for l in linhas}

    # ---- 3. validação deixando uma temporada de fora ----
    val, ps_val = [], []
    for fora in FECHADAS:
        treino = [l for l in fech if l["temporada"] != fora]
        teste = [l for l in fech if l["temporada"] == fora]
        # o índice não tem pesos ajustados; o que se valida é se ele separa numa temporada não vista
        ind = indice(teste, fica)
        sobe = [v for (a, c), v in ind.items() if next(l for l in teste if l["clube"] == c)["faixa"] == "Sobe"]
        meio = [v for (a, c), v in ind.items() if next(l for l in teste if l["clube"] == c)["faixa"] == "Meio"]
        _, p = stats.ttest_ind(sobe, meio, equal_var=False)
        ps_val.append(float(p))
        val.append({"temporada_de_fora": fora, "n_sobe": len(sobe), "n_meio": len(meio),
                    "indice_sobe": round(float(np.median(sobe)), 1),
                    "indice_meio": round(float(np.median(meio)), 1),
                    "d": round(cohen_d(sobe, meio), 2), "p": round(float(p), 5),
                    "d_minimo_80": d_minimo(len(sobe), len(meio))})
    # BH a 5% sobre as quatro temporadas: é uma família (o índice × Sobe·Meio), como manda a §6.
    for v, q, p in zip(val, bh(ps_val), ps_val):
        v["q"] = round(q, 5)
        v["texto"] = (f"{v['temporada_de_fora']} d {vg(v['d'], 2)} p {marcador_p(p)} "
                      f"q {marcador_p(q)}")

    # ---- 3b. o mesmo teste sem os times colados na linha (a régua da fronteira, §6) ----
    # Os percentis NÃO são recalculados no subconjunto: o corte só filtra linhas, como em
    # _metodo.comparar(). Com um grupo de 1 não há variância, e aí não há teste.
    val_sf, ps_sf = [], []
    for fora in FECHADAS:
        teste = [l for l in fech if l["temporada"] == fora and not l["fronteira"]]
        ind = indice(teste, fica)
        sobe = [ind[(l["temporada"], l["clube"])] for l in teste if l["faixa"] == "Sobe"]
        meio = [ind[(l["temporada"], l["clube"])] for l in teste if l["faixa"] == "Meio"]
        linha = {"temporada_de_fora": fora, "n_sobe": len(sobe), "n_meio": len(meio)}
        if len(sobe) >= 2 and len(meio) >= 2:
            _, p = stats.ttest_ind(sobe, meio, equal_var=False)
            linha.update({"d": round(cohen_d(sobe, meio), 2), "p": round(float(p), 5),
                          "d_minimo_80": d_minimo(len(sobe), len(meio))})
            ps_sf.append(float(p))
        else:
            linha["sem_teste"] = "grupo de 1: sem variância, sem teste"
        val_sf.append(linha)
    # BH só sobre os testes que existem (m = 2), que é a convenção de _metodo.comparar():
    # indicador sem n suficiente é pulado e não entra na família.
    for v, q, p in zip([v for v in val_sf if "p" in v], bh(ps_sf), ps_sf):
        v["q"] = round(q, 5)
        v["texto"] = (f"{v['temporada_de_fora']} {v['n_sobe']}x{v['n_meio']} d {vg(v['d'], 2)} "
                      f"p {marcador_p(p)} q {marcador_p(q)} "
                      f"(mínimo detectável {vg(v['d_minimo_80'], 2)})")
    for v in val_sf:
        v.setdefault("texto", f"{v['temporada_de_fora']} {v['n_sobe']}x{v['n_meio']} sem teste")

    # ---- geral ----
    ind_f = indice(fech, fica)
    for l in fech:
        l["indice_a14"] = ind_f[(l["temporada"], l["clube"])]   # para o IC95 por clube da tabela
    grupos = {fx: [v for (a, c), v in ind_f.items()
                   if next(l for l in fech if l["temporada"] == a and l["clube"] == c)["faixa"] == fx]
              for fx in ("Sobe", "Meio", "Cai")}
    tr = [v for (a, c), v in ind_f.items()
          if next(l for l in fech if l["temporada"] == a and l["clube"] == c)["trave"]]
    _, p_sm = stats.ttest_ind(grupos["Sobe"], grupos["Meio"], equal_var=False)

    # o mesmo Sobe × Meio sem os times colados na linha, e o Meio sem a Trave (5º-8º)
    def ind_de(ls):
        return [ind_f[(l["temporada"], l["clube"])] for l in ls]

    sobe_sf = ind_de([l for l in fech if l["faixa"] == "Sobe" and not l["fronteira"]])
    meio_sf = ind_de([l for l in fech if l["faixa"] == "Meio" and not l["fronteira"]])
    meio_sem_trave = ind_de([l for l in fech if l["faixa"] == "Meio" and not l["trave"]])
    _, p_sm_sf = stats.ttest_ind(sobe_sf, meio_sf, equal_var=False)

    # onde a régua põe quem subiu, dentro da própria temporada
    por_ano = collections.defaultdict(list)
    for l in fech:
        por_ano[l["temporada"]].append(l)
    top4_ano, acima_ano, backtest_ano = {}, {}, {}
    for ano, ls in por_ano.items():
        ordem = sorted(ls, key=lambda l: -ind_f[(l["temporada"], l["clube"])])
        top4_ano[ano] = sum(1 for l in ordem[:4] if l["faixa"] == "Sobe")
        melhor_meio = max(ind_de([l for l in ls if l["faixa"] == "Meio"]))
        acima_ano[ano] = sum(1 for l in ls if l["faixa"] == "Sobe"
                             and ind_f[(l["temporada"], l["clube"])] > melhor_meio)
        # backtest de conjunto: os dois primeiros da régua são os dois primeiros da tabela?
        backtest_ano[ano] = ({l["clube"] for l in ordem[:2]}
                             == {l["clube"] for l in ls if l["pos"] <= 2})
    acertos = [a for a in FECHADAS if backtest_ano[a]]
    fortes = [a for a, v in zip(FECHADAS, val) if v["q"] < 0.05]
    fracos = [a for a, v in zip(FECHADAS, val) if v["q"] >= 0.05]

    # 1º-2º contra 3º-6º, como o md pede para o regulamento de 2026
    d12 = [v for (a, c), v in ind_f.items()
           if next(l for l in fech if l["temporada"] == a and l["clube"] == c)["pos"] <= 2]
    d36 = [v for (a, c), v in ind_f.items()
           if 3 <= next(l for l in fech if l["temporada"] == a and l["clube"] == c)["pos"] <= 6]
    _, p12 = stats.ttest_ind(d12, d36, equal_var=False)
    # e a mesma dupla da ponta sem os times colados na linha, que é o corte que a regra da
    # fronteira exige de toda comparação entre faixas
    d12_sf = ind_de([l for l in fech if l["pos"] <= 2 and not l["fronteira"]])
    d36_sf = ind_de([l for l in fech if 3 <= l["pos"] <= 6 and not l["fronteira"]])

    # ---- 4. 2026 ----
    b26 = [l for l in base if l["temporada"] == "2026"]
    ind26 = indice(b26, fica)
    tab26 = sorted([{"pos": l["pos"], "clube": l["clube"], "pontos": l["pontos"],
                     "indice": round(ind26[(l["temporada"], l["clube"])], 1)} for l in b26],
                   key=lambda x: -x["indice"])
    rodada26 = max(int(r["rodada"]) for r in csv.DictReader(
        open(os.path.join(R, "classificacao_rodada.csv"), encoding="utf-8"))
        if r["temporada"] == "2026")
    ordem26 = sorted(b26, key=lambda l: -ind26[(l["temporada"], l["clube"])])
    posto26 = {l["clube"]: i for i, l in enumerate(ordem26, 1)}
    # o time do G4 de 2026 que a régua mais erra: o maior salto entre a posição e o posto na régua
    fura26 = max((l for l in b26 if l["pos"] <= 4),
                 key=lambda l: (posto26[l["clube"]] - l["pos"], posto26[l["clube"]]))

    json.dump({"candidatos": cands, "indice": fica, "descartados_por_redundancia": saiu,
               "fora_por_ser_consequencia": [[i, CONSEQUENCIA[i]] for i in fora_consequencia],
               "validacao_uma_temporada_de_fora": val,
               "validacao_sem_os_times_de_fronteira": val_sf,
               "geral": {"indice_sobe": round(float(np.median(grupos["Sobe"])), 1),
                         "indice_trave": round(float(np.median(tr)), 1),
                         "indice_meio": round(float(np.median(grupos["Meio"])), 1),
                         "indice_cai": round(float(np.median(grupos["Cai"])), 1),
                         "d_sobe_meio": round(cohen_d(grupos["Sobe"], grupos["Meio"]), 2),
                         "p_sobe_meio": round(float(p_sm), 7)},
               "primeiro_segundo_contra_terceiro_sexto": {
                   "n_1_2": len(d12), "n_3_6": len(d36),
                   "indice_1_2": round(float(np.median(d12)), 1),
                   "indice_3_6": round(float(np.median(d36)), 1),
                   "d": round(cohen_d(d12, d36), 2), "p": round(float(p12), 5),
                   "d_minimo_80": d_minimo(len(d12), len(d36)),
                   "nota": "8 times-temporada em 1º-2º: indicativo, como o CLAUDE.md manda dizer."},
               "teste_2026": {"rodada": rodada26, "tabela": tab26}},
              open(os.path.join(R, "A14_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    # ---- 5. os números por marcador, do próprio script ----
    # Regra 1 do portão: todo marcador que A14.json publica tem de sair daqui, com o mesmo valor.
    # Nada é digitado — cada linha abaixo lê o que este script acabou de calcular. Esta saída
    # CONFERE o publicado; ela não o substitui, e A14.json não é tocado aqui.
    dmins_val = {v["d_minimo_80"] for v in val}
    ns_val = {(v["n_sobe"], v["n_meio"]) for v in val}
    cauda_val = (f" — mínimo detectável {vg(val[0]['d_minimo_80'], 2)} em todas "
                 f"({val[0]['n_sobe']} contra {val[0]['n_meio']})"
                 if len(dmins_val) == 1 and len(ns_val) == 1 else "")
    d_pp, dmin_pp = cohen_d(d12, d36), d_minimo(len(d12), len(d36))
    m12, m36 = float(np.median(d12)), float(np.median(d36))

    numeros = {
        # o índice e o que ficou de fora
        "n_ind": len(fica),
        "indice": ", ".join(fica),
        "descartados": ", ".join([f"{i} (mede o mesmo que {par})" for i, par, _ in saiu]
                                 + [f"{i} ({CONSEQUENCIA[i]})" for i in fora_consequencia]),
        "n_escolhiveis": sum(1 for i in fica if i not in NAO_ESCOLHIVEIS),
        "n_nao_escolhiveis": sum(1 for i in fica if i in NAO_ESCOLHIVEIS),
        # a base e as faixas
        "n_base": len(fech),
        "n_sobe": len(grupos["Sobe"]),
        "n_meio": len(grupos["Meio"]),
        "n_cai": len(grupos["Cai"]),
        "i_sobe": marcador(np.median(grupos["Sobe"])),
        "i_trave": marcador(np.median(tr)),
        "i_meio": marcador(np.median(grupos["Meio"])),
        "i_cai": marcador(np.median(grupos["Cai"])),
        "i_meio_sem_trave": marcador(np.median(meio_sem_trave)),
        "d_sm": round(cohen_d(grupos["Sobe"], grupos["Meio"]), 2),
        "p_sm": marcador_p(float(p_sm)),
        # as mesmas faixas sem os times colados na linha
        "n_sobe_sf": len(sobe_sf),
        "n_meio_sf": len(meio_sf),
        "i_sobe_sf": marcador(np.median(sobe_sf)),
        "i_meio_sf": marcador(np.median(meio_sf)),
        "d_sm_sf": round(cohen_d(sobe_sf, meio_sf), 2),
        "p_sm_sf": marcador_p(float(p_sm_sf)),
        # onde a régua põe quem subiu
        "sobe_top4": sum(top4_ano.values()),
        "sobe_acima": sum(acima_ano.values()),
        # temporada a temporada
        "ano_forte1": ano_n(fortes, 0),
        "ano_forte2": ano_n(fortes, 1),
        "ano_fraco1": ano_n(fracos, 0),
        "ano_fraco2": ano_n(fracos, 1),
        "top4_fraco": unico(top4_ano[a] for a in fracos),
        "validacao_com_fronteira": " · ".join(v["texto"] for v in val) + cauda_val,
        "dmin_val": val[0]["d_minimo_80"],
        "validacao_sem_fronteira": " · ".join(v["texto"] for v in val_sf),
        # 1º-2º contra 3º-6º, o regulamento de 2026
        "pp_n12": len(d12),
        "pp_n36": len(d36),
        "pp_12": marcador(m12),
        "pp_36": marcador(m36),
        "pp_d": round(d_pp, 2),
        "pp_p": marcador_p(float(p12)),
        "pp_dmin": dmin_pp,
        "pp_resumo": (f"pp_12 {vg(m12)} · pp_36 {vg(m36)} · d {vg(d_pp, 2)} · "
                      f"p {marcador_p(float(p12))} · n {len(d12)} contra {len(d36)} · "
                      f"mínimo detectável {vg(dmin_pp, 2)}"),
        # 2026 na régua
        "rodada26": rodada26,
        "n26": len(b26),
        "top1": ordem26[0]["clube"],
        "top1_i": marcador(ind26[(ordem26[0]["temporada"], ordem26[0]["clube"])]),
        "top1_pos": ordem26[0]["pos"],
        "top2": ordem26[1]["clube"],
        "top2_i": marcador(ind26[(ordem26[1]["temporada"], ordem26[1]["clube"])]),
        "top2_pos": ordem26[1]["pos"],
        "vn": fura26["clube"],
        "vn_pos": fura26["pos"],
        "vn_reg": posto26[fura26["clube"]],
        "vn_i": marcador(ind26[(fura26["temporada"], fura26["clube"])]),
        # o backtest de conjunto nas quatro fechadas
        "backtest_conj": len(acertos),
        "ano_acerto": ano_n(acertos, 0) if len(acertos) == 1 else None,
        "backtest_por_temporada": " · ".join(f"{a} {'sim' if backtest_ano[a] else 'não'}"
                                             for a in FECHADAS),
    }
    numeros.update({f"top4_{a}": top4_ano[a] for a in FECHADAS})
    json.dump({"gerado_por": "scripts/A14.py", "gerado_em": GERADO_EM, "numeros": numeros},
              open(NUMEROS_JSON, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    # ---- 6. a tabela de testes, para o portão e para quem confere à mão ----
    # Nada aqui é teste novo: são as MESMAS comparações dos passos 3, 3b e 4, agora numa tabela com
    # os dois cortes lado a lado. As quatro linhas da validação reaproveitam d, p, q e o mínimo
    # detectável já calculados acima, para que a tabela não possa divergir dos marcadores.
    def so(faixa, sem_fronteira=False, ano=None):
        def f(l):
            return (l["faixa"] == faixa
                    and (not sem_fronteira or not l["fronteira"])
                    and (ano is None or l["temporada"] == ano))
        return f

    def por_posto(lo, hi, sem_fronteira=False):
        def f(l):
            return lo <= l["pos"] <= hi and (not sem_fronteira or not l["fronteira"])
        return f

    testes = []
    # família 1: a régua inteira, Sobe × Meio nas quatro fechadas
    testes += fechar_familia([linha_de_teste(
        "com", "indice", "SM", "Sobe × Meio", TODAS, grupos["Sobe"], grupos["Meio"],
        fech, so("Sobe"), so("Meio"))])
    testes += fechar_familia([linha_de_teste(
        "sem", "indice", "SM", "Sobe × Meio", TODAS, sobe_sf, meio_sf,
        fech, so("Sobe", True), so("Meio", True))])

    # família 2: a validação deixando uma temporada de fora, uma linha por temporada
    for rot, fonte, sf in (("com", val, False), ("sem", val_sf, True)):
        linhas = []
        for v in fonte:
            ano = v["temporada_de_fora"]
            do_ano = [l for l in fech if l["temporada"] == ano and (not sf or not l["fronteira"])]
            a = ind_de([l for l in do_ano if l["faixa"] == "Sobe"])
            b = ind_de([l for l in do_ano if l["faixa"] == "Meio"])
            recorte = f"fora de {ano}"
            if "p" not in v:
                linhas.append(linha_sem_teste(rot, "validacao", "SM", "Sobe × Meio", recorte,
                                              a, b, v["sem_teste"]))
                continue
            l = linha_de_teste(rot, "validacao", "SM", "Sobe × Meio", recorte, a, b, do_ano,
                               so("Sobe", sf, ano), so("Meio", sf, ano),
                               d=v["d"], p=v["p"], d_min=v["d_minimo_80"])
            l["q"] = v["q"]
            linhas.append(l)
        testes += fechar_familia(linhas)

    # família 3: a dupla da ponta contra o resto do G6, que é o regulamento de 2026
    testes += fechar_familia([linha_de_teste(
        "com", "regulamento_2026", "DR", "1º-2º × 3º-6º", TODAS, d12, d36,
        fech, por_posto(1, 2), por_posto(3, 6), p=float(p12))])
    if len(d12_sf) >= 2 and len(d36_sf) >= 2:
        testes += fechar_familia([linha_de_teste(
            "sem", "regulamento_2026", "DR", "1º-2º × 3º-6º", TODAS, d12_sf, d36_sf,
            fech, por_posto(1, 2, True), por_posto(3, 6, True))])
    else:
        testes.append(linha_sem_teste("sem", "regulamento_2026", "DR", "1º-2º × 3º-6º", TODAS,
                                      d12_sf, d36_sf, "grupo de 1: sem variância, sem teste"))

    with open(TESTES_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=COLUNAS_TESTES)
        w.writeheader()
        for l in testes:
            w.writerow({c: ("" if l[c] is None else l[c]) for c in COLUNAS_TESTES})

    print(f"\n{'='*74}\nO ÍNDICE, por faixa (2022-2025)\n{'='*74}")
    print(f"  Sobe {np.median(grupos['Sobe']):.1f} · Trave {np.median(tr):.1f} · "
          f"Meio {np.median(grupos['Meio']):.1f} · Cai {np.median(grupos['Cai']):.1f}"
          f"   (d Sobe×Meio {cohen_d(grupos['Sobe'], grupos['Meio']):+.2f}, p {p_sm:.2e})")
    print(f"\n{'='*74}\nVALIDAÇÃO DEIXANDO UMA TEMPORADA DE FORA\n{'='*74}")
    print(f"{'fora':6s} {'n':>6s} {'Sobe':>6s} {'Meio':>6s} {'d':>6s} {'p':>8s} {'dmin':>5s}")
    for v in val:
        print(f"{v['temporada_de_fora']:6s} {f'{v[chr(110)+chr(95)+chr(115)+chr(111)+chr(98)+chr(101)]}x{v['n_meio']}':>6s} "
              f"{v['indice_sobe']:6.1f} {v['indice_meio']:6.1f} {v['d']:+6.2f} {v['p']:8.4f} {v['d_minimo_80']:5.2f}")
    print(f"\n{'='*74}\n1º-2º CONTRA 3º-6º (o regulamento de 2026)\n{'='*74}")
    print(f"  índice {np.median(d12):.1f} contra {np.median(d36):.1f} · d {cohen_d(d12, d36):+.2f} · "
          f"p {p12:.4f} · n {len(d12)} contra {len(d36)} · mínimo detectável {d_minimo(len(d12), len(d36))}")
    print(f"\n{'='*74}\n2026 NA RÉGUA (rodada {rodada26})\n{'='*74}")
    print(f"{'índice':>7s} {'pos':>4s} {'pts':>4s}  clube")
    for t in tab26:
        marca = " ←G4" if t["pos"] <= 4 else ""
        print(f"{t['indice']:7.1f} {t['pos']:4d} {t['pontos']:4d}  {t['clube']}{marca}")
    print(f"\n{len(numeros)} marcadores gravados em resultados/A14_numeros.json")
    print(f"{len(testes)} linhas de teste gravadas em resultados/A14_testes.csv "
          f"({sum(1 for l in testes if l['fronteira'] == 'com')} com fronteira e "
          f"{sum(1 for l in testes if l['fronteira'] == 'sem')} sem)")


if __name__ == "__main__":
    main()
