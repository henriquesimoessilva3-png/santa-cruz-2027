#!/usr/bin/env python3
"""O método da casa na unidade CLUBE-JOGO, onde o teste de linha do `_metodo.py` não vale.

Escrito em 21/09/2026 para a A15. Não altera nada do `_metodo.py`: importa dele o que continua
valendo (o posto dentro do ano, o d de Cohen, o Benjamini-Hochberg, o d mínimo por desenho) e
troca UMA coisa — de onde sai o p.

## Por que o p tinha de mudar

No clube-temporada, 80 linhas são 40 clubes, e a §6.6 já mandava reamostrar clube no IC95. No
clube-jogo o problema deixa de ser um ajuste e passa a ser o resultado: são 3.036 linhas e os
mesmos 40 clubes, cada um reaparecendo 76 vezes. O t de Welch supõe 3.036 observações
independentes; ele recebe 40. O efeito não é sutil — o erro padrão encolhe com a raiz de n, então
o t de linha devolve p minúsculo para diferença nenhuma, e o BH em cima dele carimba de firme o
ruído. Aumentar o número de linhas não cria prova; só tira do teste a chance de dizer não.

O que aumenta de verdade com a ida para o jogo é a PRECISÃO da medida dentro de cada clube: o
contraste passa a ser pareado (o time contra ele mesmo em 38 jogos) em vez de um número por
temporada. O ganho é esse, e ele é real; o número de provas independentes continua sendo 40.

## O que entra no lugar

O p sai do MESMO bootstrap de clube que já dava o IC95 no `_metodo.ic_por_clube`: reamostra-se o
conjunto de clubes com reposição, recalcula-se o d em cada reamostragem, e o p bilateral é a
proporção de reamostragens do lado errado do zero, dobrada, com piso em 1/reps (um bootstrap de
2.000 não distingue nada abaixo disso, e fingir que distingue é o erro que se está consertando).
O IC95 continua sendo o percentil 2,5 e 97,5 da mesma distribuição — a mesma regra do `_metodo`,
lida da mesma amostra, para que IC e p nunca discordem entre si.

A régua fica mais APERTADA que a da casa, nunca mais frouxa. E para que o tamanho do conserto
seja medido e não alegado, `comparar_por_clube` devolve também o que o teste de linha teria dito
(`q_linha`, `selo_linha`), lado a lado.
"""
import collections

import numpy as np
from scipy import stats

from _metodo import bh, cohen_d, d_minimo, pct

PISO_DO_P = "1/reps"          # documentação do piso; o valor sai de reps em tempo de execução


def amostras_de_d_por_clube(base, campo, grupo_a, grupo_b, sinal, rng, reps=2000):
    """A distribuição do d reamostrando CLUBES — a mesma de `_metodo.ic_por_clube`, aberta.

    O `ic_por_clube` devolve só os dois percentis; aqui a amostra sai inteira, porque dela se
    tiram o IC95 E o p. Fazer duas reamostragens separadas daria um IC e um p que podem discordar
    entre si sem que nada no dado tenha mudado.

    A conta é FECHADA, não por concatenação. O `ic_por_clube` remonta a lista de linhas a cada
    reamostragem; com 3.036 linhas e 84 células isso são meio bilhão de operações, e a parte não
    roda. O d de Cohen depende da amostra só por seis somas (n, Σx e Σx² de cada lado), e somas se
    acumulam por clube: sorteia-se quantas vezes cada clube saiu e multiplicam-se as somas dele.
    O resultado é o MESMO d da amostra concatenada — `_conferir_equivalencia()`, no fim deste
    arquivo, compara as duas contas linha a linha e é chamado pelo A15 antes de qualquer teste.
    """
    por_clube = collections.defaultdict(lambda: [0, 0.0, 0.0, 0, 0.0, 0.0])
    for l in base:
        v = l.get(campo)
        if v is None:
            continue
        i = 0 if grupo_a(l) else (3 if grupo_b(l) else None)
        if i is None:
            continue
        acc = por_clube[l["clube"]]
        acc[i] += 1
        acc[i + 1] += v
        acc[i + 2] += v * v
    if not por_clube:
        return np.array([], dtype=float)
    m = np.array([por_clube[c] for c in sorted(por_clube)], dtype=float)
    k = len(m)
    sorteio = rng.integers(0, k, size=(reps, k))
    vezes = np.zeros((reps, k), dtype=float)
    np.add.at(vezes, (np.repeat(np.arange(reps), k), sorteio.ravel()), 1.0)
    t = vezes @ m                      # (reps, 6): n_a, S_a, Q_a, n_b, S_b, Q_b
    na, sa, qa, nb, sb, qb = (t[:, i] for i in range(6))
    ok = (na > 2) & (nb > 2)
    if not ok.any():
        return np.array([], dtype=float)
    na, sa, qa, nb, sb, qb = (x[ok] for x in (na, sa, qa, nb, sb, qb))
    ma, mb = sa / na, sb / nb
    va = np.maximum(qa - sa * sa / na, 0) / (na - 1)
    vb = np.maximum(qb - sb * sb / nb, 0) / (nb - 1)
    s = np.sqrt(((na - 1) * va + (nb - 1) * vb) / (na + nb - 2))
    d = np.where(s > 0, (ma - mb) / np.where(s > 0, s, 1.0), 0.0) * sinal
    return d


def ic_e_p(amostras, reps):
    """(ic95, p) da amostra de bootstrap. Amostra vazia é (None, None) — falha fechada."""
    if amostras.size == 0:
        return (None, None), None
    lo = round(float(np.percentile(amostras, 2.5)), 2)
    hi = round(float(np.percentile(amostras, 97.5)), 2)
    abaixo = float(np.mean(amostras <= 0))
    acima = float(np.mean(amostras >= 0))
    p = min(1.0, 2 * min(abaixo, acima))
    return (lo, hi), max(p, 1.0 / reps)


def comparar_por_clube(base, familias, comparacoes, filtros, rng, sinal_de, campo_de=pct,
                       unidade="clube-jogo", reps=2000, piso_por_grupo=30):
    """Uma linha por indicador × comparação × corte, com o p do bootstrap de clube.

    Mesma forma de saída do `_metodo.comparar`, mais quatro colunas: `clubes_a`/`clubes_b` (quantos
    clubes distintos sustentam cada lado), `q_linha` e `selo_linha` (o que o t de Welch sobre as
    linhas teria dito, para comparação — nunca para decidir).

    `campo_de` diz em que campo comparar. O padrão é o posto dentro do ano (`_metodo.pct`); a
    leitura de dentro do clube passa o campo já centrado, que não se rankeia de novo.
    """
    saida = []
    for rot_f, filtro in filtros:
        for fam_id, ids in familias:
            for cid, ga_f, gb_f in comparacoes:
                ps, ps_linha, itens = [], [], []
                for ind in ids:
                    campo = campo_de(ind)
                    ga = (lambda f=filtro, g=ga_f: (lambda l: g(l) and f(l)))()
                    gb = (lambda f=filtro, g=gb_f: (lambda l: g(l) and f(l)))()
                    la = [l for l in base if ga(l) and l.get(campo) is not None]
                    lb = [l for l in base if gb(l) and l.get(campo) is not None]
                    if len(la) < piso_por_grupo or len(lb) < piso_por_grupo:
                        continue
                    a = [l[campo] for l in la]
                    b = [l[campo] for l in lb]
                    d = cohen_d(a, b) * sinal_de(ind)
                    amostras = amostras_de_d_por_clube(base, campo, ga, gb, sinal_de(ind), rng,
                                                       reps=reps)
                    ic, p = ic_e_p(amostras, reps)
                    _, p_linha = stats.ttest_ind(a, b, equal_var=False)
                    ca = sorted({l["clube"] for l in la})
                    cb = sorted({l["clube"] for l in lb})
                    # O QUE O DESENHO ENXERGA. Não é um d mínimo de duas amostras independentes:
                    # cada clube entra nos DOIS lados (ele pontua e ele perde), e a fórmula de
                    # duas amostras, aplicada a 40 contra 40, diria que nada abaixo de 0,63 é
                    # visível — o que é falso, e falso para baixo: o contraste é pareado e muito
                    # mais preciso que isso. O limite honesto sai do próprio bootstrap: a
                    # meia-largura do IC95 é o menor |d| que esta amostra separa do zero.
                    # `d_minimo_80_se_fosse_linha` fica ao lado como medida do engano contrário —
                    # o que um teste sobre as linhas fingiria enxergar.
                    meia = (round((ic[1] - ic[0]) / 2, 3)
                            if ic[0] is not None and ic[1] is not None else None)
                    itens.append({
                        "fronteira": rot_f, "familia": fam_id, "comparacao": cid,
                        "indicador": ind, "unidade": unidade,
                        "n_a": len(a), "n_b": len(b),
                        "clubes_a": len(ca), "clubes_b": len(cb),
                        "cru_a": round(float(np.median([l[ind] for l in la])), 3),
                        "cru_b": round(float(np.median([l[ind] for l in lb])), 3),
                        "d": round(d, 3), "ic95_d": [ic[0], ic[1]], "p": round(float(p), 6),
                        "limiar_visivel": meia,
                        "d_minimo_80_se_fosse_linha": d_minimo(len(a), len(b)),
                    })
                    ps.append(float(p))
                    ps_linha.append(float(p_linha))
                for it, q, ql in zip(itens, bh(ps), bh(ps_linha)):
                    it["q"] = round(q, 6)
                    it["selo"] = ("firme" if q < 0.05 else
                                  ("pode ser sorte" if it["p"] < 0.05 else "sem diferença clara"))
                    it["poder_suficiente"] = (it["limiar_visivel"] is not None
                                              and abs(it["d"]) >= it["limiar_visivel"])
                    it["q_linha"] = round(ql, 8)
                    it["selo_linha"] = "firme" if ql < 0.05 else "sem diferença clara"
                saida += itens
    return saida


def centrar_no_clube(base, ids, campo_de=pct, chaves=("temporada", "clube", "mando"),
                     sufixo="::dc"):
    """Acrescenta <campo>::dc: o valor menos a média do próprio clube naquele ano e mando.

    Tirar a média do clube-temporada tira o nível do elenco; tirar por mando tira junto a
    vantagem de jogar em casa, que mexe com posse, escanteio e entrada na área ao mesmo tempo em
    que mexe com o ponto. O que sobra é o que o time fez DIFERENTE naquele jogo.

    Célula com menos de dois jogos não tem média que sirva e sai como None.
    """
    grupos = collections.defaultdict(list)
    for l in base:
        grupos[tuple(l[k] for k in chaves)].append(l)
    for ind in ids:
        campo = campo_de(ind)
        for ls in grupos.values():
            tem = [l for l in ls if l.get(campo) is not None]
            for l in ls:
                l[campo + sufixo] = None
            if len(tem) < 2:
                continue
            m = sum(l[campo] for l in tem) / len(tem)
            for l in tem:
                l[campo + sufixo] = l[campo] - m
    return base


def diferenca_dentro_do_clube(base, ind, grupo_a, grupo_b, chaves=("temporada", "clube", "mando")):
    """A diferença NA UNIDADE DO JOGO, dentro de cada clube-temporada-mando, e a mediana delas.

    É o número que vai para a tela: "o mesmo time, em casa, fez X a mais nos jogos em que pontuou
    do que nos jogos em que perdeu". Célula sem os dois lados não entra.
    """
    grupos = collections.defaultdict(list)
    for l in base:
        grupos[tuple(l[k] for k in chaves)].append(l)
    difs = []
    for ls in grupos.values():
        a = [l[ind] for l in ls if grupo_a(l) and l.get(ind) is not None]
        b = [l[ind] for l in ls if grupo_b(l) and l.get(ind) is not None]
        if not a or not b:
            continue
        difs.append(sum(a) / len(a) - sum(b) / len(b))
    if not difs:
        return None, 0
    return float(np.median(difs)), len(difs)


def _conferir_equivalencia(base, campo, grupo_a, grupo_b, sinal, semente=7, reps=60, tol=1e-9):
    """A conta fechada devolve o MESMO d que a concatenação? Roda as duas com o mesmo sorteio.

    Existe porque a otimização de cima é a única parte deste módulo que um leitor não confere de
    olho. Sem esta função, "é equivalente" seria alegação — que é o tipo de frase que o portão da
    casa existe para recusar. O A15 a chama antes de testar, e para se ela discordar.
    """
    por_clube = collections.defaultdict(list)
    for l in base:
        if l.get(campo) is not None and (grupo_a(l) or grupo_b(l)):
            por_clube[l["clube"]].append(l)
    clubes = sorted(por_clube)
    rng = np.random.default_rng(semente)
    sorteio = rng.integers(0, len(clubes), size=(reps, len(clubes)))
    lento = []
    for linha in sorteio:
        am = [l for i in linha for l in por_clube[clubes[i]]]
        a = [l[campo] for l in am if grupo_a(l)]
        b = [l[campo] for l in am if grupo_b(l)]
        lento.append(cohen_d(a, b) * sinal if len(a) > 2 and len(b) > 2 else np.nan)
    m = np.array([[0, 0.0, 0.0, 0, 0.0, 0.0] for _ in clubes], dtype=float)
    for i, c in enumerate(clubes):
        for l in por_clube[c]:
            v = l[campo]
            j = 0 if grupo_a(l) else 3
            m[i, j] += 1
            m[i, j + 1] += v
            m[i, j + 2] += v * v
    vezes = np.zeros((reps, len(clubes)), dtype=float)
    np.add.at(vezes, (np.repeat(np.arange(reps), len(clubes)), sorteio.ravel()), 1.0)
    t = vezes @ m
    na, sa, qa, nb, sb, qb = (t[:, i] for i in range(6))
    ma, mb = sa / na, sb / nb
    va = np.maximum(qa - sa * sa / na, 0) / (na - 1)
    vb = np.maximum(qb - sb * sb / nb, 0) / (nb - 1)
    s = np.sqrt(((na - 1) * va + (nb - 1) * vb) / (na + nb - 2))
    rapido = (ma - mb) / s * sinal
    pior = float(np.nanmax(np.abs(np.array(lento) - rapido)))
    return pior <= tol, pior, reps
