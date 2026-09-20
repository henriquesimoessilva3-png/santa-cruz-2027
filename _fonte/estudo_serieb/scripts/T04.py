#!/usr/bin/env python3
"""T04 — o treinador ideal: a lista curta, com o que a base sustenta e o que não sustenta.

O CLAUDE.md pede: "quais treinadores combinam resultado (T02), perfil alinhado ao que separa quem
sobe (T03) e consistência entre clubes?" — e uma lista de 3 a 5 nomes com pontos fortes, riscos e
tamanho da amostra.

**As duas premissas da pergunta falharam**, e isso muda o que a lista pode ser:

- **T02:** histórico de G4 não se transfere de clube. Dos 34 multiclube, 9 variam 50 pontos ou mais
  no tempo no G4, e o que manda é o tamanho do elenco (top-5 de valor passa 34% das rodadas no G4;
  do 11º para baixo, 8%).
- **T03:** o perfil de jogo não é traço do treinador. A semelhança entre os perfis do mesmo
  treinador em clubes diferentes é indistinguível do acaso, e o time não muda quando ele chega.

Então a lista NÃO é uma previsão. É o ranking do que já aconteceu, com três colunas que o dono pode
ponderar como quiser: resultado, perfil na régua do A14, e o valor do elenco com que foi feito. O
critério mais defensável, e o único que sobreviveu a um teste de repetição, é o piso: **a PIOR
passagem do treinador**, não a média. Foi assim que o T02 isolou o único nome que repete.

--------------------------------------------------------------------------------------------
ACRESCENTADO EM 20/09 — a gravação dos números publicados (`resultados/T04_numeros.json`)

O `T04.json` afirmava `gerado_por: "scripts/T04.py"` sem que este script gravasse número nenhum
por marcador: a procedência não tinha como ser conferida. Agora ela tem — cada um dos 35
marcadores que o `T04.json` publica é calculado aqui e gravado em `T04_numeros.json`, para o
portão (regras 1 e 9) comparar com o publicado.

**A análise acima não mudou.** `T04_resumo.json` e o que sai na tela continuam idênticos, linha
por linha. O que entrou foram dois recortes A MAIS, que a análise de sempre não faz e os números
publicados exigem:

- **temporadas fechadas (2022–2025).** O texto do T04-1 conta a lista sem a temporada em curso;
  a lista de sempre não filtra e 2026 entra. Daí `n_lista` = 30 no texto e 33 no resumo.
- **a partir da 10ª rodada** (`rodadas_apos_10`/`pct_g4_apos_10`), que o T04-1 cita na prova.

Os dois recortes saem da MESMA função da lista de sempre (`montar_lista`), com argumento — não
há uma segunda implementação do critério. A receita de cada marcador está em
`resultados/T04_numeros_novos.json`, campo `de_onde`, e foi seguida como está escrita lá.

Uso:
    python3 _fonte/estudo_serieb/scripts/T04.py
"""
import collections
import csv
import json
import math
import os
import statistics as st
import sys

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")

import T03                                             # noqa: E402  jogo a jogo e perfil, do T03
from _metodo import d_minimo, pct, percentil_no_ano    # noqa: E402  o método da casa
from scipy import stats                                # noqa: E402

TRACOS = ["dist_remate", "entradas_area", "duelo_def", "xg", "xg_contra",
          "xg_por_remate", "xg_por_remate_contra"]
MIN_RODADAS_TOTAL = 30       # soma das passagens, para entrar na lista curta

# ---- só para a gravação dos números; nada disto entra na análise -----------------------------
FECHADAS = ("2022", "2023", "2024", "2025")   # o recorte do texto: sem a temporada em curso
PISO_CONFIABILIDADE = 0.40                    # §6 da ESPECIFICACAO: abaixo disto a régua é curta
GERADO_EM = "2026-09-20"                      # constante, porque o script é reproduzível
SAIDA_NUMEROS = "T04_numeros.json"
# Os quatro nomes que os marcadores citam. Ficam explícitos, e não por posição na lista, para que
# uma mudança na ordem apareça como erro em vez de trocar o treinador do marcador em silêncio.
TREINADORES = {"pz": "Paulo Pezzolano", "ca": "Fábio Carille",
               "eb": "Eduardo Baptista", "carp": "Thiago Carpini"}


def montar_lista(t02, ind, posto, temporadas=None, apos_10=False):
    """A lista do T04: um treinador por linha, ordenada pelo PISO.

    Com os argumentos no padrão (`temporadas=None, apos_10=False`) é a lista de sempre, a mesma
    que vai para o `T04_resumo.json` — o corpo aqui é o que estava dentro do `main()`, movido
    sem alteração. Os dois argumentos existem só para os recortes que os números publicados
    pedem, e nenhum deles é usado pela análise.
    """
    col_rodadas = "rodadas_apos_10" if apos_10 else "rodadas"
    col_pct_g4 = "pct_g4_apos_10" if apos_10 else "pct_g4"

    por_tec = collections.defaultdict(list)
    for p in t02:
        if temporadas and p["temporada"] not in temporadas:
            continue
        k = (p["treinador"], p["clube"], p["temporada"])
        if k not in ind:
            continue
        por_tec[p["treinador"]].append({
            "clube": p["clube"], "temporada": p["temporada"], "rodadas": int(p[col_rodadas]),
            "pct_g4": float(p[col_pct_g4]), "ppj": float(p["ppj"]),
            "indice_perfil": round(ind[k], 1),
            "posto_valor": posto.get((p["temporada"], p["clube"])),
        })

    lista = []
    for tec, ps in por_tec.items():
        rod = sum(p["rodadas"] for p in ps)
        if rod < MIN_RODADAS_TOTAL:
            continue
        pv = [p["posto_valor"] for p in ps if p["posto_valor"]]
        lista.append({
            "treinador": tec, "passagens": len(ps), "clubes": len({p["clube"] for p in ps}),
            "rodadas": rod,
            "pct_g4_medio": round(sum(p["pct_g4"] * p["rodadas"] for p in ps) / rod, 1),
            "pct_g4_pior": round(min(p["pct_g4"] for p in ps), 1),
            "ppj": round(sum(p["ppj"] * p["rodadas"] for p in ps) / rod, 2),
            "indice_medio": round(st.mean(p["indice_perfil"] for p in ps), 1),
            "indice_pior": round(min(p["indice_perfil"] for p in ps), 1),
            "posto_valor_mediano": round(st.median(pv), 1) if pv else None,
            "passagens_detalhe": sorted(ps, key=lambda x: (x["temporada"], x["clube"])),
        })

    # a lista curta: ordenada pelo PISO, que é o único critério que sobreviveu a um teste
    lista.sort(key=lambda x: (-x["pct_g4_pior"], -x["indice_pior"]))
    return lista


# ==============================================================================================
# A GRAVAÇÃO DOS NÚMEROS — daqui para baixo nada toca a análise acima
# ==============================================================================================
EXTENSO_F = {1: "uma", 2: "duas", 3: "três", 4: "quatro", 5: "cinco"}
EXTENSO_M = {1: "um", 2: "dois", 3: "três", 4: "quatro", 5: "cinco"}


def por_extenso(n, mapa):
    return mapa.get(n, str(n))


def lista_de_postos(postos):
    """`eb_valores`: "10º, 16º e 8º", na ordem das temporadas."""
    ordinais = [f"{p}º" for p in postos]
    if len(ordinais) == 1:
        return ordinais[0]
    return ", ".join(ordinais[:-1]) + " e " + ordinais[-1]


def frase_da_distancia(dists):
    """`eb_dist`: como as passagens terminaram em relação ao 4º colocado, a partir da coluna
    `dist_g4` do A01 (pontos do time menos pontos do 4º). Empate em pontos é 0 e não é "um ponto"
    — foi o que o cético corrigiu em 19/09."""
    grupos = collections.Counter(dists)
    partes = []
    for d in sorted(grupos):
        n = grupos[d]
        if d == 0:
            partes.append(f"{por_extenso(n, EXTENSO_F)} empatada{'s' if n > 1 else ''} "
                          "em pontos com ele")
        else:
            pt = abs(d)
            partes.append(f"{por_extenso(n, EXTENSO_F)} a {por_extenso(pt, EXTENSO_M)} "
                          f"ponto{'s' if pt > 1 else ''} "
                          f"{'do' if d < 0 else 'acima do'} 4º colocado")
    return " e ".join(partes)


def frase_das_temporadas(linhas):
    """`eb_temps`: "2023 Novorizontino, 5º com 63 pontos · …". A posição e os pontos são os da
    TEMPORADA INTEIRA (A01), que é o mesmo critério nas três linhas — não os da passagem."""
    return " · ".join(
        f"{r['temporada']} {r['clube']}, {r['pos']}º com {r['pontos']}" + (" pontos" if i == 0 else "")
        for i, r in enumerate(linhas))


def amplitude_multiclube(t02, temporadas=None):
    """(multiclube, mediana da amplitude, quantos variam 50 pontos ou mais) — o número do T02 que
    o T04-2 cita. Amplitude = maior menos menor pct_g4 entre as passagens do treinador."""
    por_tec = collections.defaultdict(list)
    for p in t02:
        if temporadas and p["temporada"] not in temporadas:
            continue
        por_tec[p["treinador"]].append((p["clube"], float(p["pct_g4"])))
    multi = [ps for ps in por_tec.values() if len({c for c, _ in ps}) >= 2]
    amps = [max(v for _, v in ps) - min(v for _, v in ps) for ps in multi]
    return len(multi), round(st.median(amps), 1), sum(1 for a in amps if a >= 50)


def d_minimo_pareado(n, alvo=0.80):
    """O `d_minimo` do `_metodo.py` é de dois grupos INDEPENDENTES. O antes e depois compara o
    mesmo clube consigo mesmo: desenho pareado, gl = n-1 e nc = d·√n. Com os 73 pares dá 0,33,
    e não os 0,47 que a função de dois grupos devolveria."""
    lo, hi = 0.01, 3.0
    gl = n - 1
    crit = stats.t.ppf(0.975, gl)
    for _ in range(40):
        d = (lo + hi) / 2
        nc = d * math.sqrt(n)
        pot = 1 - stats.nct.cdf(crit, gl, nc) + stats.nct.cdf(-crit, gl, nc)
        lo, hi = (d, hi) if pot < alvo else (lo, d)
    return round(hi, 2)


def confiabilidade_dos_tracos():
    """Split-half dos 7 traços do perfil, pelo método da §6.1/§3: jogos em ordem de data, metade
    PAR contra metade ÍMPAR do clube-temporada, posto dentro do ano e Spearman-Brown 2ρ/(1+ρ).
    O jogo a jogo e o perfil vêm do próprio T03 — não há uma segunda versão deles aqui.
    Conferência por fora: o xG sai 0,302 e reproduz o 0,30 que a §3 já publicava."""
    jogos = [l for l in T03.jogos() if l["ano"] in FECHADAS]
    por_ct = collections.defaultdict(list)
    for l in jogos:
        por_ct[(l["ano"], l["clube"])].append(l)
    metades = {}
    for k, g in por_ct.items():
        g.sort(key=lambda j: j["data"])
        if len(g) < 30:
            continue
        metades[k] = (T03.perfil([j for i, j in enumerate(g) if i % 2 == 0]),
                      T03.perfil([j for i, j in enumerate(g) if i % 2 == 1]))
    conf = {}
    for t in TRACOS:
        reg = [{"temporada": ano, "par": a[t], "impar": b[t]}
               for (ano, _c), (a, b) in metades.items()
               if a[t] is not None and b[t] is not None]
        percentil_no_ano(reg, ["par", "impar"])
        rho, _ = stats.spearmanr([l[pct("par")] for l in reg], [l[pct("impar")] for l in reg])
        conf[t] = round(2 * float(rho) / (1 + float(rho)), 3)
    return conf, len(metades)


def gravar_numeros(perfis, t02, ind, posto):
    """Os 35 marcadores que o `T04.json` publica, cada um calculado aqui e gravado com o nome do
    marcador como chave. A receita de cada um está em `T04_numeros_novos.json`, campo `de_onde`.
    """
    fechadas = montar_lista(t02, ind, posto, FECHADAS)
    fechadas10 = montar_lista(t02, ind, posto, FECHADAS, apos_10=True)
    por_nome = {x["treinador"]: x for x in fechadas}
    por_nome10 = {x["treinador"]: x for x in fechadas10}
    faltam = [n for n in TREINADORES.values() if n not in por_nome]
    if faltam:
        raise SystemExit(f"T04: os marcadores citam treinador fora da lista: {faltam}")

    pz, ca, eb, carp = (por_nome[TREINADORES[k]] for k in ("pz", "ca", "eb", "carp"))

    # posição e pontos da TEMPORADA das passagens do Eduardo Baptista, para as duas frases
    with open(os.path.join(R, "A01_clube_temporada.csv"), encoding="utf-8-sig") as f:
        a01 = {(r["temporada"], r["clube"]): r for r in csv.DictReader(f)}
    eb_linhas = [a01[(p["temporada"], p["clube"])] for p in eb["passagens_detalhe"]]

    with open(os.path.join(R, "T03_antes_depois.csv"), encoding="utf-8") as f:
        antes_depois = list(csv.DictReader(f))

    multi, amp_mediana, amp50 = amplitude_multiclube(t02)
    multi_f, amp_mediana_f, amp50_f = amplitude_multiclube(t02, FECHADAS)
    conf, _n_conf = confiabilidade_dos_tracos()
    ad_n = len(antes_depois)

    numeros = {
        # ---- T04-1: a lista, no recorte das temporadas fechadas ----
        "n_lista": len(fechadas),
        "n_lista10": len(fechadas10),
        "pz_piso": pz["pct_g4_pior"], "pz_pass": pz["passagens"],
        "pz_valor": pz["posto_valor_mediano"],
        "ca_piso": ca["pct_g4_pior"], "ca_pass": ca["passagens"],
        "ca_valor": ca["posto_valor_mediano"],
        "eb_piso": eb["pct_g4_pior"], "eb_piso10": por_nome10[TREINADORES["eb"]]["pct_g4_pior"],
        "eb_pass": eb["passagens"], "eb_cl": eb["clubes"], "eb_rod": eb["rodadas"],
        "eb_med": eb["pct_g4_medio"], "eb_ppj": eb["ppj"],
        "eb_ind": eb["indice_medio"], "eb_ind_piso": eb["indice_pior"],
        "eb_valor": eb["posto_valor_mediano"],
        "eb_valores": lista_de_postos([p["posto_valor"] for p in eb["passagens_detalhe"]]),
        "eb_dist": frase_da_distancia([int(r["dist_g4"]) for r in eb_linhas]),
        "eb_temps": frase_das_temporadas(eb_linhas),
        "carp_piso": carp["pct_g4_pior"],
        # ---- T04-2: o que o T02 e o T03 mediram (recorte deles, com 2026) ----
        "t02_multi": multi, "t02_multi_fechadas": multi_f,
        "t02_amp_mediana": amp_mediana, "t02_amp_mediana_fechadas": amp_mediana_f,
        "t02_amp50": amp50, "t02_amp50_fechadas": amp50_f,
        "t03_pass": len(perfis), "t03_tec": len({p["treinador"] for p in perfis}),
        "ad_n": ad_n,
        "ad_n_fechadas": sum(1 for r in antes_depois if r["temporada"] in FECHADAS),
        "dmin_multi": d_minimo(multi, 2000),
        "dmin_antes_depois": d_minimo_pareado(ad_n),
        "conf_tracos": sum(1 for v in conf.values() if v < PISO_CONFIABILIDADE),
    }

    # Os números que o texto do T04.json traz CRAVADOS, sem marcador. A regra 1 do portão reprova
    # a parte por causa deles, e o T04.json não é deste trabalho — ficam calculados aqui, FORA de
    # `numeros`, para quem for transformá-los em marcador não precisar digitar nenhum.
    enderson = next((x for x in fechadas if x["treinador"] == "Enderson Moreira"), None)
    perfis_fechadas = [p for p in perfis if p["temporada"] in FECHADAS]
    cravados = {
        "48,5 (T04-1): média de G4 do Enderson Moreira, nas fechadas":
            enderson["pct_g4_medio"] if enderson else None,
        "5 clubes (T04-1): clubes do Enderson Moreira, nas fechadas":
            enderson["clubes"] if enderson else None,
        "21 (T04-1): treinadores da lista com a pior passagem zerada":
            sum(1 for x in fechadas if x["pct_g4_pior"] == 0),
        "9 (T04-1): desses, os que comandaram quatro vezes ou mais":
            sum(1 for x in fechadas if x["pct_g4_pior"] == 0 and x["passagens"] >= 4),
        "126 (T04-2): passagens nas temporadas fechadas": len(perfis_fechadas),
        "64 (T04-2): nomes distintos nessas passagens":
            len({p["treinador"] for p in perfis_fechadas}),
    }

    json.dump({
        "gerado_por": "scripts/T04.py",
        "gerado_em": GERADO_EM,
        "recorte": "Os marcadores do T04-1 saem das temporadas FECHADAS (2022-2025), como o texto "
                   "os conta; os do T04-2 saem do recorte do T02/T03, que inclui 2026, com o "
                   "alternativo fechado ao lado, no sufixo _fechadas. A análise do próprio T04 "
                   "(T04_resumo.json) não filtra temporada: por isso n_lista é 30 aqui e 33 lá.",
        "confiabilidade_dos_tracos": conf,
        "numeros": numeros,
        "cravados_no_texto_sem_marcador": cravados,
    }, open(os.path.join(R, SAIDA_NUMEROS), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return numeros


def main():
    perfis = [r for r in csv.DictReader(open(os.path.join(R, "T03_passagens.csv"),
                                             encoding="utf-8"))]
    t02 = [r for r in csv.DictReader(open(os.path.join(R, "T02_passagem.csv"), encoding="utf-8"))
           if r["no_ranking"] == "1"]
    tec_csv = {r["treinador"]: r for r in csv.DictReader(
        open(os.path.join(R, "T02_treinador.csv"), encoding="utf-8"))}

    # posto do valor do elenco dentro do ano
    valor = {}
    with open(os.path.join(DADOS, "serieb_clube_temporada.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            try:
                valor[(r["ano"], r["clube"])] = float(r["tm_valor_total"])
            except (TypeError, ValueError):
                pass
    por_ano = collections.defaultdict(list)
    for (ano, clube), v in valor.items():
        por_ano[ano].append((v, clube))
    posto = {}
    for ano, ls in por_ano.items():
        for i, (v, c) in enumerate(sorted(set(ls), reverse=True), 1):
            posto[(ano, c)] = i

    # perfil na régua: média dos 7 traços já em percentil alinhado
    ind = {}
    for p in perfis:
        ind[(p["treinador"], p["clube"], p["temporada"])] = st.mean(float(p[t]) for t in TRACOS)

    lista = montar_lista(t02, ind, posto)
    curta = lista[:5]

    json.dump({"criterio": "ordenado pelo PISO — a pior passagem do treinador —, porque é o único "
                           "critério que sobreviveu a um teste de repetição (T02). A média premia "
                           "quem teve uma passagem boa em clube rico.",
               "premissas_que_falharam": {
                   "T02": "histórico de G4 não se transfere entre clubes",
                   "T03": "o perfil de jogo não é traço do treinador, e o time não muda quando ele chega"},
               "min_rodadas_total": MIN_RODADAS_TOTAL,
               "n_na_lista": len(lista), "lista_curta": curta, "lista_completa": lista},
              open(os.path.join(R, "T04_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"treinadores com {MIN_RODADAS_TOTAL}+ rodadas e perfil medido: {len(lista)}\n")
    print(f"{'treinador':22s} {'pass':>4s} {'cl':>3s} {'rod':>4s} {'%G4 méd':>8s} {'%G4 PIOR':>9s} "
          f"{'ppj':>5s} {'índice':>7s} {'índ. PIOR':>10s} {'valor med':>10s}")
    for x in lista:
        print(f"{x['treinador'][:22]:22s} {x['passagens']:4d} {x['clubes']:3d} {x['rodadas']:4d} "
              f"{x['pct_g4_medio']:8.1f} {x['pct_g4_pior']:9.1f} {x['ppj']:5.2f} "
              f"{x['indice_medio']:7.1f} {x['indice_pior']:10.1f} "
              f"{(x['posto_valor_mediano'] or 0):10.1f}")
    print(f"\n{'='*70}\nA LISTA CURTA (5), pelo piso\n{'='*70}")
    for x in curta:
        print(f"\n{x['treinador']} — {x['passagens']} passagens em {x['clubes']} clube(s), "
              f"{x['rodadas']} rodadas")
        print(f"   piso de G4 {x['pct_g4_pior']}% · média {x['pct_g4_medio']}% · ppj {x['ppj']} · "
              f"índice de perfil {x['indice_medio']} (piso {x['indice_pior']}) · "
              f"elenco mediano {x['posto_valor_mediano']}º")
        for p in x["passagens_detalhe"]:
            print(f"      {p['temporada']} {p['clube'][:16]:16s} {p['rodadas']:2d} rod · "
                  f"{p['pct_g4']:5.1f}% G4 · ppj {p['ppj']:.2f} · índice {p['indice_perfil']:5.1f} · "
                  f"elenco {p['posto_valor']}º")

    numeros = gravar_numeros(perfis, t02, ind, posto)
    print(f"\n{'='*70}\nOS NÚMEROS PUBLICADOS ({len(numeros)} marcadores) → {SAIDA_NUMEROS}\n"
          f"{'='*70}")
    for m, v in numeros.items():
        print(f"   {m:26s} {v}")


if __name__ == "__main__":
    main()
