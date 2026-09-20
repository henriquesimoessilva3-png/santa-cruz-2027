#!/usr/bin/env python3
"""O método de comparação da casa, num lugar só.

Apurado em 17/09 lendo `gerar_prototipo.py` e a §6 da ESPECIFICACAO.md. Vale para toda parte do
estudo que compare faixas:

- **Posto dentro da temporada** (percentil 0–100), nunca o valor bruto. O bruto vai só para a tela.
- **t de Welch** bilateral; **d de Cohen** no mesmo percentil, com o sinal do indicador alinhado
  (positivo = a faixa A é melhor).
- **BH a 5% dentro de cada família × cada comparação**, nunca no bolo de todos os indicadores.
- **IC95 por bootstrap de CLUBE**, não de linha: 80 linhas são 40 clubes (§6.6), e Welch e BH
  supõem uma independência que o painel não tem.
- **Poder por desenho**: o menor d detectável a 80% para cada par de tamanhos.

O A02 foi escrito antes deste módulo, com uma cópia destas funções; ao passar a importar daqui, a
saída dele tem de continuar idêntica — é o teste de que a extração não mudou nada.
"""
import collections
import math

import numpy as np
from scipy import stats


# Sufixo do percentil. NÃO usar "_pct": `passes` + "_pct" é `passes_pct`, que também é indicador,
# e o percentil de um sobrescrevia o valor bruto do outro em silêncio. O sinal foi o A05 devolver
# d e q idênticos para os dois. Este sufixo não pode colidir com nome de coluna.
PCT = "::pct"


def pct(ind):
    return ind + PCT


def percentil_no_ano(base, ids, chave_ano="temporada"):
    """Acrescenta <id>::pct: o posto do clube dentro da temporada, de 0 a 100.

    Valor AUSENTE (None) fica de fora do posto e sai com pct None — acrescentado em 20/09. Até
    aqui as partes filtravam as linhas incompletas ANTES de chamar esta função, e uma linha com
    None quebrava o rankdata. Isso deixou de servir quando uma parte passou a ter indicadores de
    duas coletas diferentes na mesma linha: filtrar a linha inteira jogaria fora o indicador que
    ESTÁ lá. Quem não tem ausência não muda de resultado — o posto dos presentes é o mesmo.
    """
    por_ano = collections.defaultdict(list)
    for l in base:
        por_ano[l[chave_ano]].append(l)
    for ls in por_ano.values():
        for i in ids:
            tem = [l for l in ls if l.get(i) is not None]
            for l in ls:
                l[pct(i)] = None
            if len(tem) < 2:
                continue
            r = stats.rankdata([l[i] for l in tem])
            for l, rr in zip(tem, r):
                l[pct(i)] = 100 * (rr - 1) / (len(tem) - 1)
    return base


def cohen_d(a, b):
    na, nb = len(a), len(b)
    va, vb = np.var(a, ddof=1), np.var(b, ddof=1)
    s = math.sqrt(((na - 1) * va + (nb - 1) * vb) / (na + nb - 2))
    return (np.mean(a) - np.mean(b)) / s if s else 0.0


def ic_por_clube(base, campo, grupo_a, grupo_b, sinal, rng, reps=2000):
    """IC95 do d reamostrando CLUBES. Linha não é unidade independente."""
    por_clube = collections.defaultdict(list)
    for l in base:
        por_clube[l["clube"]].append(l)
    clubes = list(por_clube)
    saida = []
    for _ in range(reps):
        am = [l for c in rng.choice(clubes, len(clubes), replace=True) for l in por_clube[c]]
        # Mesmo par do percentil_no_ano: linha sem este indicador sai da conta dele.
        a = [l[campo] for l in am if grupo_a(l) and l.get(campo) is not None]
        b = [l[campo] for l in am if grupo_b(l) and l.get(campo) is not None]
        if len(a) > 2 and len(b) > 2:
            saida.append(cohen_d(a, b) * sinal)
    if not saida:
        return (None, None)
    return (round(float(np.percentile(saida, 2.5)), 2),
            round(float(np.percentile(saida, 97.5)), 2))


def d_minimo(n1, n2, alvo=0.80):
    """Menor d detectável com 80% de poder — por desenho, como a casa faz."""
    lo, hi = 0.05, 3.0
    for _ in range(40):
        d = (lo + hi) / 2
        nc = d * math.sqrt(n1 * n2 / (n1 + n2))
        gl = n1 + n2 - 2
        crit = stats.t.ppf(0.975, gl)
        pot = 1 - stats.nct.cdf(crit, gl, nc) + stats.nct.cdf(-crit, gl, nc)
        lo, hi = (d, hi) if pot < alvo else (lo, d)
    return round(hi, 2)


def bh(ps):
    """Benjamini-Hochberg: devolve o q de cada p, na mesma ordem."""
    idx = sorted(range(len(ps)), key=lambda i: ps[i])
    m, q, menor = len(ps), [None] * len(ps), 1.0
    for r, i in enumerate(reversed(idx), 1):
        menor = min(menor, ps[i] * m / (m - r + 1))
        q[i] = menor
    return q


def comparar(base, familias, comparacoes, filtros, rng, sinal_de, bruto_de=None, citados=None):
    """Roda o método inteiro. Devolve uma linha por indicador × comparação × filtro.

    `citados` — acrescentado em 20/09, pela regra 7 do portão — é o conjunto de indicadores que
    esta parte MEDE mas não é dona: {(familia, indicador), ...}. Eles saem da correção para
    múltiplos testes desta família (não entram na conta do BH e não recebem q aqui), porque quem
    corrige um indicador é a família em que ele mora. A linha continua saindo, com p, d e as
    medianas — o que falta é o q, e quem o preenche é o `preencher_citados()`, lendo a tabela da
    parte dona.

    Por que isso importa: até 20/09 o mesmo indicador aparecia em duas famílias de duas partes, e
    saía com DOIS q diferentes do MESMO p — porque o BH divide o crédito entre os testes feitos
    juntos, e as duas famílias tinham vizinhos diferentes. Dois números para a mesma medida.
    """
    citados = citados or set()
    saida = []
    for rot_f, filtro in filtros:
        for fam_id, ids in familias:
            for cid, ga_f, gb_f in comparacoes:
                ps, itens = [], []
                for ind in ids:
                    campo = pct(ind)
                    ga = (lambda f=filtro, g=ga_f: (lambda l: g(l) and f(l)))()
                    gb = (lambda f=filtro, g=gb_f: (lambda l: g(l) and f(l)))()
                    # Linha sem o indicador (pct None) sai da conta DESTE indicador, e não da
                    # parte: é o par do percentil_no_ano acima.
                    la = [l for l in base if ga(l) and l.get(campo) is not None]
                    lb = [l for l in base if gb(l) and l.get(campo) is not None]
                    a = [l[campo] for l in la]
                    b = [l[campo] for l in lb]
                    if len(a) < 5 or len(b) < 5:
                        continue
                    _, p = stats.ttest_ind(a, b, equal_var=False)
                    d = cohen_d(a, b) * sinal_de(ind)
                    lo, hi = ic_por_clube(base, campo, ga, gb, sinal_de(ind), rng)
                    ca = [l[ind] for l in la]
                    cb = [l[ind] for l in lb]
                    itens.append({
                        "fronteira": rot_f, "familia": fam_id, "comparacao": cid,
                        "indicador": ind,
                        "citado": int((fam_id, ind, cid) in citados),
                        "n_a": len(a), "n_b": len(b),
                        "cru_a": round(float(np.median(ca)), 3),
                        "cru_b": round(float(np.median(cb)), 3),
                        "d": round(d, 3), "ic95_d": [lo, hi], "p": round(float(p), 5),
                        "d_minimo_80": d_minimo(len(a), len(b)),
                    })
                    if not itens[-1]["citado"]:
                        ps.append(float(p))
                corrigidos = [it for it in itens if not it["citado"]]
                for it, q in zip(corrigidos, bh(ps)):
                    it["q"] = round(q, 5)
                    it["selo"] = ("firme" if q < 0.05 else
                                  ("pode ser sorte" if it["p"] < 0.05 else "sem diferença clara"))
                    it["poder_suficiente"] = abs(it["d"]) >= it["d_minimo_80"]
                for it in itens:
                    if it["citado"]:
                        it["q"] = None          # o preencher_citados() traz o da parte dona
                        it["selo"] = None
                        it["poder_suficiente"] = abs(it["d"]) >= it["d_minimo_80"]
                saida += itens
    return saida


def citados_com_gemea(dec, resultados):
    """Quais (família, indicador, comparação) esta parte só CITA — e quais ela é dona mesmo.

    Um indicador declarado `citado_de` só sai da correção daqui ONDE a parte dona de fato publica
    a mesma comparação. Onde a dona não roda aquela comparação não há dois números para a mesma
    coisa: não há o que ceder, e a linha continua sendo desta parte, corrigida aqui. É o caso do
    duelo aéreo em Cai × Meio, que o A04 mede e o A06 não.
    """
    import csv as _csv
    import os as _os
    citados, dono_de, cache = set(), {}, {}
    for f in dec["familias"]:
        for i in f["indicadores"]:
            dono = i.get("citado_de")
            if not dono:
                continue
            dono_de[i["id"]] = dono
            if dono not in cache:
                caminho = _os.path.join(resultados, f"{dono}_testes.csv")
                cache[dono] = {(l["comparacao"], l["indicador"])
                               for l in _csv.DictReader(open(caminho, encoding="utf-8"))
                               if l.get("q")}
            for comp, ind in cache[dono]:
                if ind == i["id"]:
                    citados.add((f["id"], i["id"], comp))
    return citados, dono_de


def preencher_citados(res, dono_de, resultados):
    """Copia o q e o selo da parte DONA para as linhas que esta parte só cita.

    Falha fechada: linha citada sem gêmea na tabela do dono para o portão, e é o que se quer —
    citar um número que não existe lá é pior do que não citar.
    """
    import csv as _csv
    import os as _os
    cache = {}
    faltando = []
    # A coluna existe em TODA linha, vazia onde a parte é dona: o CSV sai do primeiro registro, e
    # uma chave que só aparece na linha 40 faria o cabeçalho não ter onde escrevê-la.
    for it in res:
        it.setdefault("q_de", "")
    for it in res:
        if not it.get("citado"):
            continue
        dono = dono_de[it["indicador"]]
        if dono not in cache:
            caminho = _os.path.join(resultados, f"{dono}_testes.csv")
            cache[dono] = {(l["fronteira"], l["comparacao"], l["indicador"]): l
                           for l in _csv.DictReader(open(caminho, encoding="utf-8"))}
        g = cache[dono].get((it["fronteira"], it["comparacao"], it["indicador"]))
        if not g or not g.get("q"):
            faltando.append((dono, it["fronteira"], it["comparacao"], it["indicador"]))
            continue
        it["q"] = float(g["q"])
        it["selo"] = g.get("selo")
        it["q_de"] = dono
    if faltando:
        raise SystemExit("linha citada sem gêmea na parte dona: " + str(faltando[:5]))
    return res
