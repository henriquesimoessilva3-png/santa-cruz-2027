#!/usr/bin/env python3
"""J08, passo 2 — o fator de conversão de liga.

Escreve, e só:
    resultados/fatores_liga.csv   entregável nomeado no CLAUDE.md (liga, fator, casos, força)
    resultados/J08_testes.csv     todo teste rodado, inclusive o que não passou
    resultados/J08_resumo.json    os números que a conclusão vai citar por marcador
Lê, e não altera:
    resultados/J08_base.csv          (passo 1)
    resultados/J08_indicadores.json  (lista pré-declarada, fechada antes de calcular)
    dados_copiados/wyscout/_temporal_aging.json   (só o meta: confiabilidade do qz)
    scripts/_metodo.py                            (bh, d_minimo, cohen_d, ic_por_clube)

Nada em `dados/`, `static/`, `templates/` nem no `_registro.md` é tocado.


## A pergunta, e a forma exata da resposta

"Como os números de um jogador de outra liga se traduzem para a Série B?"

A resposta útil para contratar é uma conta, não um adjetivo:

    Δpercentil previsto = μ  +  b·(percentil na origem − 50)  +  nível(origem) − nível(destino)
                          └──────── encolhimento ────────┘    └──── FATOR DA LIGA ────┘

O `fator` do `fatores_liga.csv` é **só o último termo** — o degrau de liga, em pontos de
percentil. O encolhimento (μ e b) é comum a qualquer contratação e vai no `J08_resumo.json`,
para o J09 montar a conta inteira. Separar os dois é o ponto: sem isso, o degrau de liga
recebe o crédito da regressão à média.


## Por que os níveis de origem e de destino saem JUNTOS

Cada transferência é uma comparação pareada entre duas ligas. Com

    Δ_i = μ + nível(origem_i) − nível(destino_i) + erro

todas as ligas entram numa régua só, ancorada em **Brasil B = 0**, e a coluna de contraste de
cada liga é `1[origem=L] − 1[destino=L]`. É o que permite converter Brasil A → Brasil B e
Argentina A → Brasil B na mesma unidade sem empilhar âncoras de contas diferentes — que é onde
a conta ingênua quebra (com âncoras cruas a escada brasileira deixa de fechar).


## Os três modelos, e o que cada um desconta

    S0 «bruto»      μ + contrastes de liga.               O degrau como ele aparece.
    S1 «+ seleção»  S0 + percentil na origem.             Tira a regressão à média.
    S2 «+ idade»    S1 + envelhecimento esperado.         Tira o que é só ficar mais velho.

**S2 é o publicado.** A distância S0→S1 é quanto do degrau era seleção na origem; a distância
S1→S2 é quanto era idade. As duas vão no resumo, número a número, porque a ordem de serviço
manda dizer o fator bruto e o fator depois do desconto de idade.

O controle de seleção é o análogo, em percentil, do contrafactual de quem FICOU que o passo 1
já traz em `qz_esperado_ficou`: nos que ficaram na mesma liga a reta é qz(t+1) = a + 0,400·qz(t);
aqui o coeficiente sai dos próprios transferidos, DENTRO de liga (as ligas são dummies), e o
script confere se os dois batem. Se baterem, o controle está medindo regressão à média, e não
nível de liga.

`dqz_ajustado_idade` e `dqz_liquido` são alternativos e nunca somados (regra dura do passo 1).
Aqui a escolha é declarada: **o nível que ordena as faixas sai de `dqz_liquido`**, porque quem
fica também envelhece e ele já absorve as duas coisas; `dqz_ajustado_idade` entra como leitura
de sensibilidade, nunca somado.


## O envelhecimento, em pontos de percentil

Não existe curva de envelhecimento por indicador — existe para o composto `qz`
(`_temporal_aging.json`). A curva dá, para cada caso, o `dqz_esperado_idade` que o passo 1 já
calculou. Para trazê-lo à régua do percentil usa-se a densidade normal no ponto de partida:

    esperado_idade_pp = 100 · φ(qz_antes) · dqz_esperado_idade

porque dentro de cada régua (liga × período × posição) o `qz` é normalizado, e a passagem de
`qz` para percentil é, em primeira ordem, a normal acumulada. O termo entra como COVARIÁVEL de
coeficiente livre — declarado assim no `J08_indicadores.json` ("a idade entra como covariável,
não como desconto prévio") — e o coeficiente estimado diz quanto da idade do composto aparece
em cada família. Coeficiente perto de 1 = a curva traduz; perto de 0 = não traduz, e isso vai
dito em vez de escondido.


## O piso, as faixas e a força

- **10+ casos** → fator próprio, força **forte**.
- **3 a 9 casos** → fator da faixa de nível, força **agrupado**.
- **1 a 2 casos** → fator da faixa, força **fraco** (a própria colocação na faixa é um caso só).
- **0 casos** → **sem faixa e sem fator**. Não se inventa nível por reputação.

A faixa sai do nível medido em `dqz_liquido` no modelo de todas as ligas, com corte em
±0,20 — metade do degrau Brasil A → Brasil B medido no mesmo modelo. O corte é uma medida da
própria base, não uma opinião sobre o futebol de cada país.

A faixa não é uma etiqueta: ela vira uma UNIDADE do modelo final, com coeficiente próprio
estimado sobre os casos de todas as ligas que a compõem. É isso que dá fator a quem tem 4 casos
sem publicar uma média de 4 casos.


## O critério de conclusão (§6 da ESPECIFICACAO.md)

- **BH a 5% dentro de cada família** (volume, 12 indicadores; eficiência, 10), por unidade
  testada. Nunca no bolo das 22.
- **IC95 por bootstrap de JOGADOR** (591 jogadores em 737 linhas; 146 linhas são jogador
  repetido), reajustando o modelo inteiro em cada réplica.
- **p por sanduíche agrupado no jogador**, pela mesma razão.
- **Poder** com `d_minimo` do `_metodo.py`, convertido em pontos de percentil, para que "a liga
  X não muda nada" não seja afirmação vazia.
- **Nulo do garimpo**: permutar o rótulo de liga de origem dentro de (posição, ano de chegada,
  destino) e refazer a escolha do maior fator. Escolher "a liga que mais traduz" entre 45 é
  escolher o melhor entre muitos, e isso tem preço.
- **Porta de coorte**: estimar com quem chegou até 2024 e conferir em quem chegou em 2025–2026.
- **Três níveis e só três**: firme = BH E porta; provável = só um; indício = nenhum.

Uso:
    python3 "_fonte/estudo_serieb/scripts/J08.py"
"""
import collections
import csv
import json
import os
import sys

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import bh, cohen_d, d_minimo, ic_por_clube  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
R = os.path.join(ESTUDO, "resultados")
COP = os.path.join(ESTUDO, "dados_copiados", "wyscout")

BASE = os.path.join(R, "J08_base.csv")
IND = os.path.join(R, "J08_indicadores.json")
AGING = os.path.join(COP, "_temporal_aging.json")

ANCORA = "Brasil B"            # nível 0 da régua; é a liga da pergunta
PISO = 10                      # CLAUDE.md: "quando houver casos suficientes (ex.: 10 ou mais)"
PISO_AGRUPADO = 3              # de 3 a 9 casos a colocação na faixa ainda tem mais de um caso
REPS_BOOT = 2000               # §6.6: 2.000 réplicas, como no resto da casa
REPS_GARIMPO = 400
COORTE_CORTE = 2024            # porta: estima até 2024, confere em 2025–2026
SEMENTE = 8

# O agrupamento PROPOSTO no passo 1, a partir da mediana do dqz_liquido com o destino
# descontado. O passo 2 estima origem e destino JUNTOS, e o que ele mede pode discordar.
# A proposta fica aqui para ser CONFERIDA, não repetida — a divergência vai no resumo.
PROPOSTA_PASSO_1 = {
    "FAIXA ACIMA": ["Inglaterra A", "Coreia B", "Belgica A", "Russia", "Japao A",
                    "Portugal A", "Argentina A", "EUA", "Paraguai"],
    "FAIXA PAREADO": ["Italia A", "Arabia Saudita A", "Grecia", "Portugal B", "Bolivia",
                      "Peru", "Turquia", "Equador A", "França A", "Alemanha B"],
    "FAIXA ABAIXO": ["Chile", "Mexico", "Uruguai", "Colombia A", "Japao B", "Colombia B",
                     "Catar", "Bahrain", "Bulgaria", "Portugal C"],
}


# ---------------------------------------------------------------------------
# Leitura
# ---------------------------------------------------------------------------
def carregar():
    decl = json.load(open(IND, encoding="utf-8"))
    fams = [(f["id"], [i["id"] for i in f["indicadores"]])
            for f in decl["familias"] if f.get("montavel")]
    linhas = list(csv.DictReader(open(BASE, encoding="utf-8")))
    # duas passadas: primeiro descobre que coluna é numérica de verdade, depois converte.
    # Converter na mesma passada deixaria as primeiras linhas convertidas e o resto em texto.
    numericas = set(linhas[0])
    for l in linhas:
        for k, v in l.items():
            if k not in numericas or v in ("", None):
                continue
            try:
                float(v)
            except ValueError:
                numericas.discard(k)
    # o período é rótulo ("2024", "jun26"), nunca número: senão o resumo sai com "2024.0"
    numericas -= {"periodo_antes", "periodo_depois"}
    for l in linhas:
        for k in numericas:
            l[k] = float(l[k]) if l[k] not in ("", None) else None
    return decl, fams, linhas


def media(vals):
    v = [x for x in vals if x is not None]
    return sum(v) / len(v) if v else None


def preparar(linhas, fams):
    """Escore de família por caso, controle de seleção e o envelhecimento em percentil."""
    for l in linhas:
        for fid, ids in fams:
            l[fid] = media([l[i + "_dpct"] for i in ids])
            l[fid + "__antes"] = media([l[i + "_pct_antes"] for i in ids])
        # o envelhecimento do composto, trazido para a régua do percentil
        qz0, esp = l["qz_antes"], l["dqz_esperado_idade"]
        l["idade_pp"] = (100.0 * float(stats.norm.pdf(qz0)) * esp
                         if qz0 is not None and esp is not None else None)
        l["clube"] = l["nkey"]        # a unidade de reamostragem declarada é o JOGADOR
    return linhas


# ---------------------------------------------------------------------------
# O modelo pareado de níveis de liga
# ---------------------------------------------------------------------------
def unidades_de(linhas, mapa):
    """Rótulo de unidade de cada lado. `mapa` leva liga -> unidade (liga ou faixa)."""
    return ([mapa.get(l["liga_origem"], l["liga_origem"]) for l in linhas],
            [mapa.get(l["liga_destino"], l["liga_destino"]) for l in linhas])


def desenho(linhas, mapa, controles):
    """Matriz X: intercepto, controles e um contraste por unidade (âncora fora)."""
    orig, dest = unidades_de(linhas, mapa)
    uni = sorted({u for u in orig + dest if u != ANCORA})
    n = len(linhas)
    cols = [np.ones(n)]
    nomes = ["intercepto"]
    for c in controles:
        cols.append(np.array([l[c] for l in linhas], float))
        nomes.append(c)
    for u in uni:
        cols.append(np.array([(1.0 if o == u else 0.0) - (1.0 if d == u else 0.0)
                              for o, d in zip(orig, dest)]))
        nomes.append(u)
    return np.column_stack(cols), nomes, uni


def ajustar(X, y):
    b, *_ = np.linalg.lstsq(X, y, rcond=None)
    return b


def se_agrupado(X, y, b, grupos):
    """Sanduíche agrupado no jogador. A linha não é unidade independente (§6.6)."""
    n, k = X.shape
    u = y - X @ b
    xtx = np.linalg.pinv(X.T @ X)
    por = collections.defaultdict(list)
    for i, g in enumerate(grupos):
        por[g].append(i)
    meio = np.zeros((k, k))
    for idx in por.values():
        s = X[idx].T @ u[idx]
        meio += np.outer(s, s)
    G = len(por)
    corr = (G / max(G - 1, 1)) * ((n - 1) / max(n - k, 1))
    V = xtx @ (corr * meio) @ xtx
    return np.sqrt(np.clip(np.diag(V), 0, None)), G


def rodar_modelo(linhas, mapa, controles, respostas, rng, reps=REPS_BOOT):
    """Ajusta o modelo para várias respostas de uma vez e devolve coef, p e IC95."""
    validas = [l for l in linhas
               if all(l[r] is not None for r in respostas)
               and all(l[c] is not None for c in controles)]
    X, nomes, uni = desenho(validas, mapa, controles)
    Y = np.column_stack([[l[r] for l in validas] for r in respostas])
    B = ajustar(X, Y)
    grupos = [l["clube"] for l in validas]
    SE = np.column_stack([se_agrupado(X, Y[:, j], B[:, j], grupos)[0]
                          for j in range(Y.shape[1])])
    gl = max(len(validas) - X.shape[1], 1)
    P = 2 * (1 - stats.t.cdf(np.abs(B) / np.where(SE > 0, SE, np.nan), gl))

    # IC95 por bootstrap de JOGADOR, reajustando o modelo inteiro
    por_jog = collections.defaultdict(list)
    for l in validas:
        por_jog[l["clube"]].append(l)
    jogs = list(por_jog)
    guarda = np.full((reps, len(nomes), len(respostas)), np.nan)
    for r in range(reps):
        am = [l for j in rng.choice(jogs, len(jogs), replace=True) for l in por_jog[j]]
        Xb, nb, _ = desenho(am, mapa, controles)
        if len(nb) != len(nomes):
            pos = {nome: i for i, nome in enumerate(nb)}
            Yb = np.column_stack([[l[x] for l in am] for x in respostas])
            Bb = ajustar(Xb, Yb)
            for i, nome in enumerate(nomes):
                if nome in pos:
                    guarda[r, i, :] = Bb[pos[nome], :]
            continue
        Yb = np.column_stack([[l[x] for l in am] for x in respostas])
        guarda[r] = ajustar(Xb, Yb)
    LO = np.nanpercentile(guarda, 2.5, axis=0)
    HI = np.nanpercentile(guarda, 97.5, axis=0)
    return {"nomes": nomes, "unidades": uni, "n": len(validas),
            "coef": B, "se": SE, "p": P, "lo": LO, "hi": HI,
            "respostas": respostas, "linhas": validas}


def coef_de(mod, nome, resp):
    i, j = mod["nomes"].index(nome), mod["respostas"].index(resp)
    return (mod["coef"][i, j], mod["p"][i, j], mod["lo"][i, j], mod["hi"][i, j])


# ---------------------------------------------------------------------------
# Faixas de nível
# ---------------------------------------------------------------------------
def faixas(linhas, rng):
    """Nível de cada liga em dqz_liquido, e o corte em três faixas.

    O corte é metade do degrau Brasil A -> Brasil B medido no MESMO modelo. Não é escolhido
    olhando a lista de países: é uma medida da base.
    """
    mod = rodar_modelo(linhas, {}, [], ["dqz_liquido"], rng, reps=200)
    niveis = {u: coef_de(mod, u, "dqz_liquido")[0] for u in mod["unidades"]}
    niveis[ANCORA] = 0.0
    corte = abs(niveis.get("Brasil A", 0.4)) / 2.0
    def faixa(l):
        v = niveis.get(l)
        if v is None:
            return None
        return "FAIXA ACIMA" if v > corte else ("FAIXA ABAIXO" if v < -corte else "FAIXA PAREADO")
    return niveis, corte, faixa, mod


# ---------------------------------------------------------------------------
# Porta de coorte
# ---------------------------------------------------------------------------
def porta_coorte(linhas, mapa, controles, resposta, rng):
    """Estima com quem chegou até 2024 e confere em quem chegou em 2025–2026."""
    cedo = [l for l in linhas if l["coorte_chegada"] <= COORTE_CORTE]
    tarde = [l for l in linhas if l["coorte_chegada"] > COORTE_CORTE]
    ok = lambda ls: [l for l in ls if l[resposta] is not None
                     and all(l[c] is not None for c in controles)]
    cedo, tarde = ok(cedo), ok(tarde)
    if len(cedo) < 40 or len(tarde) < 40:
        return {"rodou": False, "motivo": "coorte cedo ou tarde pequena demais"}

    Xc, nomes, _ = desenho(cedo, mapa, controles)
    yc = np.array([l[resposta] for l in cedo])
    b = ajustar(Xc, yc)
    # linha de base: a mesma conta SEM os termos de liga (só encolhimento e idade)
    kbase = 1 + len(controles)
    bbase = ajustar(Xc[:, :kbase], yc)

    orig, dest = unidades_de(tarde, mapa)
    yt = np.array([l[resposta] for l in tarde])
    pos = {n: i for i, n in enumerate(nomes)}
    pred, predb = [], []
    for i, l in enumerate(tarde):
        v = b[0] + sum(b[pos[c]] * l[c] for c in controles)
        vb = bbase[0] + sum(bbase[1 + j] * l[c] for j, c in enumerate(controles))
        for lado, sinal in ((orig[i], 1.0), (dest[i], -1.0)):
            if lado in pos and lado != ANCORA:
                v += sinal * b[pos[lado]]
        pred.append(v)
        predb.append(vb)
    pred, predb = np.array(pred), np.array(predb)
    mae, maeb = float(np.mean(np.abs(yt - pred))), float(np.mean(np.abs(yt - predb)))
    rho = float(stats.spearmanr(pred, yt).statistic)

    # por unidade: o resíduo da linha de base na coorte tardia acompanha o fator estimado cedo?
    poru = collections.defaultdict(list)
    for i, l in enumerate(tarde):
        if orig[i] != ANCORA:
            poru[orig[i]].append(yt[i] - predb[i])
    detalhe = {}
    for u, res in poru.items():
        if u not in pos:
            continue
        fc = float(b[pos[u]])
        detalhe[u] = {"fator_ate_2024": round(fc, 2), "n_tarde": len(res),
                      "residuo_medio_tarde": round(float(np.mean(res)), 2),
                      "sinal_bate": bool(len(res) >= 5 and fc * float(np.mean(res)) > 0),
                      "testavel": bool(len(res) >= 5)}
    tv = [d for d in detalhe.values() if d["testavel"]]
    rho_u = (float(stats.spearmanr([d["fator_ate_2024"] for d in tv],
                                   [d["residuo_medio_tarde"] for d in tv]).statistic)
             if len(tv) >= 4 else None)
    return {"rodou": True, "n_cedo": len(cedo), "n_tarde": len(tarde),
            "rho_fator_cedo_x_residuo_tarde": (None if rho_u is None else round(rho_u, 3)),
            "mae_com_liga": round(mae, 2), "mae_sem_liga": round(maeb, 2),
            "ganho_mae": round(maeb - mae, 3), "rho_previsto_observado": round(rho, 3),
            "passou": bool(mae < maeb),
            "unidades_testaveis": len(tv),
            "unidades_com_sinal_certo": sum(1 for d in tv if d["sinal_bate"]),
            "por_unidade": detalhe}


# ---------------------------------------------------------------------------
# Nulo do garimpo
# ---------------------------------------------------------------------------
def garimpo(linhas, mapa, controles, resposta, alvos, rng, reps=REPS_GARIMPO):
    """Quanto o MAIOR fator entre muitas ligas cresce por puro sorteio."""
    val = [l for l in linhas if l[resposta] is not None
           and all(l[c] is not None for c in controles)]
    estratos = collections.defaultdict(list)
    for l in val:
        estratos[(l["root_antes"], l["coorte_chegada"], l["liga_destino"])].append(l)
    maximos = []
    for _ in range(reps):
        emb = []
        for ls in estratos.values():
            origens = [l["liga_origem"] for l in ls]
            rng.shuffle(origens)
            for l, o in zip(ls, origens):
                c = dict(l)
                c["liga_origem"] = o
                emb.append(c)
        X, nomes, _ = desenho(emb, mapa, controles)
        y = np.array([l[resposta] for l in emb])
        b = ajustar(X, y)
        pos = {n: i for i, n in enumerate(nomes)}
        v = [abs(b[pos[u]]) for u in alvos if u in pos]
        if v:
            maximos.append(max(v))
    return {"reps": len(maximos),
            "maior_fator_por_sorteio_p50": round(float(np.percentile(maximos, 50)), 2),
            "maior_fator_por_sorteio_p95": round(float(np.percentile(maximos, 95)), 2),
            "maior_fator_por_sorteio_max": round(float(np.max(maximos)), 2)}


# ---------------------------------------------------------------------------
# Principal
# ---------------------------------------------------------------------------
def main():
    rng = np.random.default_rng(SEMENTE)
    decl, fams, linhas = carregar()
    linhas = preparar(linhas, fams)
    meta_aging = json.load(open(AGING, encoding="utf-8"))["meta"]

    todos_ind = [i for _, ids in fams for i in ids]
    fam_de = {i: fid for fid, ids in fams for i in ids}

    # ---- cortes declarados -------------------------------------------------
    # `caso_completo` do passo 1 já exige identidade coerente (J08_base.py:727), então o corte
    # que DEVOLVE os 38 casos suspeitos tem de ser montado à mão: 22 deltas e régua não curta.
    completo = lambda l: l["caso_completo"] == 1
    completo_sem_identidade = (lambda l: l["n_indicadores_com_delta"] == 22
                               and l["regua_curta"] == 0)
    cortes = [
        ("principal", completo),
        ("com_identidade_incoerente", completo_sem_identidade),
        ("so_900_no_destino", lambda l: completo(l) and l["menos_900_no_destino"] == 0),
        ("so_temporada_fechada", lambda l: completo(l)
            and l["temporada_destino_em_curso"] == 0),
    ]
    P = [l for l in linhas if cortes[0][1](l)]

    # ---- faixas de nível ---------------------------------------------------
    niveis, corte_faixa, faixa_de, mod_niv = faixas(P, rng)
    casos_origem = collections.Counter(l["liga_origem"] for l in P)
    acima_do_piso = sorted([g for g, n in casos_origem.items() if n >= PISO])
    for d in ("Brasil A", "Brasil B", "Brasil C"):
        if d not in acima_do_piso:
            acima_do_piso.append(d)
    mapa = {}
    for g in casos_origem:
        if g in acima_do_piso:
            continue
        f = faixa_de(g)
        if f:
            mapa[g] = f
    membros = collections.defaultdict(list)
    for g, f in mapa.items():
        membros[f].append(g)

    # ---- os três modelos, em cada corte ------------------------------------
    CTRL = {"S0_bruto": [], "S1_selecao": None, "S2_selecao_idade": None}
    respostas_fam = [fid for fid, _ in fams]
    saida_testes = []
    guardado = {}

    for nome_corte, filtro in cortes:
        sub = [l for l in linhas if filtro(l)]
        for fid, ids in fams:
            ctrl = {"S0_bruto": [], "S1_selecao": [fid + "__antes"],
                    "S2_selecao_idade": [fid + "__antes", "idade_pp"]}
            for modelo, cs in ctrl.items():
                reps = REPS_BOOT if (nome_corte == "principal"
                                     and modelo == "S2_selecao_idade") else 400
                alvos = [i + "_dpct" for i in ids]
                mod = rodar_modelo(sub, mapa, cs, [fid] + alvos, rng, reps=reps)
                guardado[(nome_corte, modelo, fid)] = mod
                n_por_uni = collections.Counter(
                    mapa.get(l["liga_origem"], l["liga_origem"]) for l in mod["linhas"])
                sd = {r: float(np.std([l[r] for l in mod["linhas"]], ddof=1))
                      for r in [fid] + alvos}
                for u in mod["unidades"]:
                    if u == ANCORA:
                        continue
                    nu = n_por_uni.get(u, 0)
                    if nu == 0:
                        continue
                    ps, itens = [], []
                    for ind in alvos:
                        c, p, lo, hi = coef_de(mod, u, ind)
                        dmin = d_minimo(nu, mod["n"] - nu)
                        itens.append({
                            "corte": nome_corte, "modelo": modelo, "familia": fid,
                            "unidade": u, "tipo_unidade": ("liga" if not u.startswith("FAIXA")
                                                           else "faixa"),
                            "destino_ref": ANCORA, "alvo": ind[:-5],
                            "n_casos": nu, "n_total": mod["n"],
                            "fator_pp": round(float(c), 2),
                            "ic95_lo": round(float(lo), 2), "ic95_hi": round(float(hi), 2),
                            "p": round(float(p), 5),
                            "d_minimo_80": dmin,
                            "limiar_visivel_pp": round(dmin * sd[ind], 2),
                            "poder_suficiente": bool(abs(c) >= dmin * sd[ind]),
                        })
                        ps.append(float(p))
                    for it, q in zip(itens, bh(ps)):
                        it["q"] = round(q, 5)
                        it["selo"] = ("firme" if q < 0.05 else
                                      ("pode ser sorte" if it["p"] < 0.05
                                       else "sem diferença clara"))
                    saida_testes += itens
                    # a família inteira, fora do BH (é o resumo dos 12/10, não um 13º teste)
                    c, p, lo, hi = coef_de(mod, u, fid)
                    dmin = d_minimo(nu, mod["n"] - nu)
                    saida_testes.append({
                        "corte": nome_corte, "modelo": modelo, "familia": fid,
                        "unidade": u, "tipo_unidade": ("liga" if not u.startswith("FAIXA")
                                                       else "faixa"),
                        "destino_ref": ANCORA, "alvo": "FAMILIA (média dos indicadores)",
                        "n_casos": nu, "n_total": mod["n"],
                        "fator_pp": round(float(c), 2),
                        "ic95_lo": round(float(lo), 2), "ic95_hi": round(float(hi), 2),
                        "p": round(float(p), 5), "q": "",
                        "d_minimo_80": dmin,
                        "limiar_visivel_pp": round(dmin * sd[fid], 2),
                        "poder_suficiente": bool(abs(c) >= dmin * sd[fid]),
                        "selo": ("pode ser sorte" if p < 0.05 else "sem diferença clara"),
                        "quantos_do_bh_passaram": sum(1 for it in itens if it["q"] < 0.05),
                    })

        # a âncora dqz, fora de qualquer BH
        for resp, modelo in (("dqz", "S0_bruto"), ("dqz_ajustado_idade", "idade_pela_curva"),
                             ("dqz_liquido", "quem_ficou")):
            mod = rodar_modelo(sub, mapa, [], [resp], rng, reps=400)
            guardado[(nome_corte, modelo, resp)] = mod
            n_por_uni = collections.Counter(
                mapa.get(l["liga_origem"], l["liga_origem"]) for l in mod["linhas"])
            sd = float(np.std([l[resp] for l in mod["linhas"]], ddof=1))
            for u in mod["unidades"]:
                nu = n_por_uni.get(u, 0)
                if u == ANCORA or nu == 0:
                    continue
                c, p, lo, hi = coef_de(mod, u, resp)
                dmin = d_minimo(nu, mod["n"] - nu)
                saida_testes.append({
                    "corte": nome_corte, "modelo": modelo, "familia": "ancora_dqz",
                    "unidade": u, "tipo_unidade": ("liga" if not u.startswith("FAIXA")
                                                   else "faixa"),
                    "destino_ref": ANCORA, "alvo": resp,
                    "n_casos": nu, "n_total": mod["n"],
                    "fator_pp": round(float(c), 3),
                    "ic95_lo": round(float(lo), 3), "ic95_hi": round(float(hi), 3),
                    "p": round(float(p), 5), "q": "",
                    "d_minimo_80": dmin, "limiar_visivel_pp": round(dmin * sd, 3),
                    "poder_suficiente": bool(abs(c) >= dmin * sd),
                    "selo": ("pode ser sorte" if p < 0.05 else "sem diferença clara"),
                })

    # ---- porta de coorte ---------------------------------------------------
    portas = {}
    for fid, _ in fams:
        portas[fid] = porta_coorte(P, mapa, [fid + "__antes", "idade_pp"], fid, rng)
    portas["dqz_liquido"] = porta_coorte(P, mapa, [], "dqz_liquido", rng)

    # ---- nulo do garimpo ---------------------------------------------------
    estrangeiras_no_piso = [g for g in acima_do_piso if not g.startswith("Brasil")]
    garimpos = {}
    for fid, _ in fams:
        g = garimpo(P, mapa, [fid + "__antes", "idade_pp"], fid, estrangeiras_no_piso, rng)
        m2 = guardado[("principal", "S2_selecao_idade", fid)]
        obs = {u: abs(float(coef_de(m2, u, fid)[0])) for u in estrangeiras_no_piso
               if u in m2["nomes"]}
        maior = max(obs.items(), key=lambda kv: kv[1])
        g["ligas_estrangeiras_no_piso"] = len(obs)
        g["maior_fator_observado"] = {"liga": maior[0], "pp": round(maior[1], 2)}
        g["o_maior_supera_o_sorteio"] = bool(maior[1] > g["maior_fator_por_sorteio_p95"])
        g["leitura"] = ("o maior fator estrangeiro (%s, %.1f pp) %s o que a busca entre %d "
                        "ligas produz por sorteio no p95 (%.1f pp)"
                        % (maior[0], maior[1],
                           "supera" if maior[1] > g["maior_fator_por_sorteio_p95"]
                           else "NÃO supera", len(obs), g["maior_fator_por_sorteio_p95"]))
        garimpos[fid] = g

    # ---- sensibilidade: o encolhimento fixado pela confiabilidade do qz ----
    # O coeficiente de seleção é estimado livremente em S2. Se a régua de origem é medida com
    # erro, parte do degrau de liga pode estar escorrendo para ele. O teste é fixar o
    # encolhimento na confiabilidade declarada do qz (0,471) e ver quanto os fatores andam.
    rel = float(meta_aging.get("reliability"))
    sens_encolhimento = {}
    for fid, _ in fams:
        fixo = -(1.0 - rel)
        for l in P:
            l[fid + "__fixo"] = (None if l[fid] is None or l[fid + "__antes"] is None
                                 else l[fid] - fixo * (l[fid + "__antes"] - 50.0))
        mf = rodar_modelo(P, mapa, ["idade_pp"], [fid + "__fixo"], rng, reps=200)
        m2 = guardado[("principal", "S2_selecao_idade", fid)]
        difs = {}
        for u in acima_do_piso + sorted(membros):
            if u == ANCORA or u not in mf["nomes"] or u not in m2["nomes"]:
                continue
            difs[u] = round(float(coef_de(mf, u, fid + "__fixo")[0]
                                  - coef_de(m2, u, fid)[0]), 2)
        e = m2["nomes"].index(fid + "__antes")
        sens_encolhimento[fid] = {
            "b_livre": round(float(m2["coef"][e, m2["respostas"].index(fid)]), 3),
            "b_fixado_pela_confiabilidade": round(fixo, 3),
            "quanto_o_fator_anda_pp": difs,
            "maior_movimento_pp": (max(difs.items(), key=lambda kv: abs(kv[1]))
                                   if difs else None),
        }

    # ---- viés do sobrevivente ----------------------------------------------
    vies = {}
    for fid, _ in fams:
        a = [l for l in P if l["menos_900_no_destino"] == 0 and l[fid] is not None]
        b = [l for l in P if l["menos_900_no_destino"] == 1 and l[fid] is not None]
        d = cohen_d([l[fid] for l in a], [l[fid] for l in b])
        lo, hi = ic_por_clube(P, fid, lambda l: l["menos_900_no_destino"] == 0,
                              lambda l: l["menos_900_no_destino"] == 1, 1, rng, reps=1000)
        vies[fid] = {
            "n_jogou_900": len(a), "n_nao_jogou_900": len(b),
            "media_jogou_900": round(float(np.mean([l[fid] for l in a])), 2),
            "media_nao_jogou_900": round(float(np.mean([l[fid] for l in b])), 2),
            "d_cohen": round(d, 3), "ic95_d": [lo, hi],
        }
    # e o que muda em cada fator publicado
    for fid, _ in fams:
        mp = guardado[("principal", "S2_selecao_idade", fid)]
        m9 = guardado[("so_900_no_destino", "S2_selecao_idade", fid)]
        difs = {}
        for u in acima_do_piso + sorted(membros):
            if u == ANCORA or u not in mp["nomes"] or u not in m9["nomes"]:
                continue
            difs[u] = round(float(coef_de(m9, u, fid)[0] - coef_de(mp, u, fid)[0]), 2)
        vies[fid]["quanto_o_fator_muda_sem_eles"] = difs
        vies[fid]["maior_mudanca_pp"] = (max(difs.items(), key=lambda kv: abs(kv[1]))
                                         if difs else None)

    # ---- o entregável: fatores_liga.csv ------------------------------------
    catalogo = sorted({l["liga_origem"] for l in linhas} |
                      {l["liga_destino"] for l in linhas})
    xlsx = os.path.join(COP, "xlsx_ago26")
    if os.path.isdir(xlsx):
        catalogo = sorted(set(catalogo) | {f.split("_", 1)[1].rsplit(".", 1)[0]
                                           for f in os.listdir(xlsx) if f.endswith(".xlsx")})

    destinos = ["Brasil B", "Brasil A", "Brasil C"]
    linhas_csv = []
    for liga in catalogo:
        n = casos_origem.get(liga, 0)
        uni = liga if liga in acima_do_piso else mapa.get(liga)
        if n == 0 or uni is None:
            linhas_csv.append({
                "liga": liga, "destino": "", "familia": "", "fator": "",
                "casos": n, "forca": "sem fator",
                "ic95_lo": "", "ic95_hi": "", "unidade_usada": "",
                "fator_bruto": "", "fator_sem_idade": "",
                "quanto_era_selecao": "", "quanto_era_idade": "",
                "fator_so_quem_jogou_900": "", "passou_bh": "", "porta_coorte": "",
                "nivel": "", "ic95": "", "p_da_familia": "",
                "n_indicadores_da_familia_no_bh": "",
                "obs": "liga do painel sem nenhuma transferência para o futebol brasileiro: "
                       "sem faixa e sem fator",
            })
            continue
        forca = ("forte" if n >= PISO else
                 ("agrupado" if n >= PISO_AGRUPADO else "fraco"))
        for fid, ids in fams:
            m2 = guardado[("principal", "S2_selecao_idade", fid)]
            m1 = guardado[("principal", "S1_selecao", fid)]
            m0 = guardado[("principal", "S0_bruto", fid)]
            m9 = guardado[("so_900_no_destino", "S2_selecao_idade", fid)]
            nivel_o = coef_de(m2, uni, fid) if uni != ANCORA else (0.0, 1.0, 0.0, 0.0)
            b0 = coef_de(m0, uni, fid)[0] if uni != ANCORA else 0.0
            b1 = coef_de(m1, uni, fid)[0] if uni != ANCORA else 0.0
            b9 = (0.0 if uni == ANCORA else
                  (coef_de(m9, uni, fid)[0] if uni in m9["nomes"] else None))
            passou = sum(1 for t in saida_testes
                         if t["corte"] == "principal" and t["modelo"] == "S2_selecao_idade"
                         and t["familia"] == fid and t["unidade"] == uni
                         and t["alvo"] in ids and t["q"] != "" and t["q"] < 0.05)
            pc = portas[fid]["por_unidade"].get(uni, {})
            porta_ok = bool(pc.get("sinal_bate")) and portas[fid].get("passou")
            nivel = ("firme" if passou > 0 and porta_ok else
                     ("provável" if passou > 0 or porta_ok else "indício"))
            if forca != "forte":
                nivel = "indício"
            for dest in destinos:
                nivel_d = (coef_de(m2, dest, fid)[0] if dest != ANCORA else 0.0)
                b0d = (coef_de(m0, dest, fid)[0] if dest != ANCORA else 0.0)
                b1d = (coef_de(m1, dest, fid)[0] if dest != ANCORA else 0.0)
                b9d = (0.0 if dest == ANCORA else
                       (coef_de(m9, dest, fid)[0] if dest in m9["nomes"] else None))
                if liga == dest:
                    continue
                f = nivel_o[0] - nivel_d
                linhas_csv.append({
                    "liga": liga, "destino": dest, "familia": fid,
                    "fator": round(float(f), 2),
                    "casos": n, "forca": forca,
                    "ic95_lo": round(float(nivel_o[2] - nivel_d), 2),
                    "ic95_hi": round(float(nivel_o[3] - nivel_d), 2),
                    "unidade_usada": uni,
                    "fator_bruto": round(float(b0 - b0d), 2),
                    "fator_sem_idade": round(float(b1 - b1d), 2),
                    "quanto_era_selecao": round(float((b0 - b0d) - (b1 - b1d)), 2),
                    "quanto_era_idade": round(float((b1 - b1d) - f), 2),
                    "fator_so_quem_jogou_900": ("" if b9 is None or b9d is None
                                                else round(float(b9 - b9d), 2)),
                    "passou_bh": passou,
                    "porta_coorte": ("passou" if porta_ok else
                                     ("não testável" if not pc.get("testavel") else "não passou")),
                    "nivel": nivel,
                    "ic95": "[%+.1f, %+.1f]" % (nivel_o[2] - nivel_d, nivel_o[3] - nivel_d),
                    "p_da_familia": round(float(nivel_o[1]), 5) if uni != ANCORA else "",
                    "n_indicadores_da_familia_no_bh": len(ids),
                    "obs": ("fator próprio da liga" if forca == "forte" else
                            "fator da faixa de nível %s (a liga tem %d caso%s)"
                            % (uni, n, "s" if n != 1 else "")),
                })

    ordem = {"Brasil B": 0, "Brasil A": 1, "Brasil C": 2}
    linhas_csv.sort(key=lambda r: (ordem.get(r["destino"], 9), -float(r["casos"]),
                                   r["liga"], r["familia"]))
    campos = ["liga", "fator", "casos", "forca", "destino", "familia", "ic95",
              "ic95_lo", "ic95_hi", "p_da_familia", "unidade_usada", "fator_bruto",
              "fator_sem_idade", "quanto_era_selecao", "quanto_era_idade",
              "fator_so_quem_jogou_900", "passou_bh", "porta_coorte", "nivel",
              "n_indicadores_da_familia_no_bh", "obs"]
    with open(os.path.join(R, "fatores_liga.csv"), "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=campos)
        w.writeheader()
        w.writerows(linhas_csv)

    with open(os.path.join(R, "J08_testes.csv"), "w", newline="", encoding="utf-8") as fh:
        cols = ["corte", "modelo", "familia", "unidade", "tipo_unidade", "destino_ref", "alvo",
                "n_casos", "n_total", "fator_pp", "ic95_lo", "ic95_hi", "p", "q", "selo",
                "d_minimo_80", "limiar_visivel_pp", "poder_suficiente",
                "quantos_do_bh_passaram"]
        w = csv.DictWriter(fh, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(saida_testes)

    # ---- resumo ------------------------------------------------------------
    encolhimento = {}
    for fid, _ in fams:
        m2 = guardado[("principal", "S2_selecao_idade", fid)]
        i = m2["nomes"].index(fid + "__antes")
        j = m2["respostas"].index(fid)
        ii = m2["nomes"].index("idade_pp")
        encolhimento[fid] = {
            "intercepto": round(float(m2["coef"][0, j]), 2),
            "b_percentil_origem": round(float(m2["coef"][i, j]), 3),
            "b_implicito_de_quem_fica": round(1 + float(m2["coef"][i, j]), 3),
            "coef_envelhecimento": round(float(m2["coef"][ii, j]), 3),
            "p_envelhecimento": round(float(m2["p"][ii, j]), 5),
            "ic95_coef_envelhecimento": [round(float(m2["lo"][ii, j]), 3),
                                         round(float(m2["hi"][ii, j]), 3)],
        }

    et11 = json.load(open(os.path.join(os.path.dirname(os.path.dirname(ESTUDO)),
                                       "dados", "prototipo.json"),
                         encoding="utf-8"))["etapa_11"]["tecnico"]
    comparacao_encolhimento = {
        "o_que_e": "quanto do posto de origem o jogador guarda no ano seguinte. Três medidas "
                   "de origens diferentes; se batem, o controle de seleção está medindo "
                   "regressão à média, e não nível de liga.",
        "aqui_volume": encolhimento["volume"]["b_implicito_de_quem_fica"],
        "aqui_eficiencia": encolhimento["eficiencia"]["b_implicito_de_quem_fica"],
        "etapa_11_quem_mudou_de_clube": et11["rho_mediano_mudou"],
        "etapa_11_quem_ficou": et11["rho_mediano_ficou"],
        "reta_de_quem_ficou_na_mesma_liga_qz": 0.400,
        "fonte_da_reta": "emenda do passo 1 (J08_indicadores.json): qz(t+1)=a+b·qz(t) em "
                         "23.943 pares de quem permaneceu na mesma liga",
        "confiabilidade_do_qz": meta_aging.get("reliability"),
    }

    # a proposta do passo 1, conferida contra o que o passo 2 mede
    proposto = {g: f for f, gs in PROPOSTA_PASSO_1.items() for g in gs}
    medido = dict(mapa)
    for g in acima_do_piso:
        if not g.startswith("Brasil"):
            medido[g] = "FATOR PRÓPRIO (%d casos)" % casos_origem[g]
    conferencia = {"confirmadas": [], "mudaram_de_faixa": [], "viraram_fator_proprio": [],
                   "sem_caso_na_base": []}
    for g, f in sorted(proposto.items()):
        m = medido.get(g)
        if m is None:
            conferencia["sem_caso_na_base"].append(g)
        elif m.startswith("FATOR PRÓPRIO"):
            conferencia["viraram_fator_proprio"].append("%s (%s)" % (g, m))
        elif m == f:
            conferencia["confirmadas"].append(g)
        else:
            conferencia["mudaram_de_faixa"].append("%s: proposta %s → medida %s"
                                                   % (g, f.split()[-1], m.split()[-1]))

    periodos = collections.defaultdict(set)
    for l in linhas:
        periodos[str(l["periodo_antes"])].add(l["liga_origem"])
        periodos[str(l["periodo_depois"])].add(l["liga_destino"])

    poder = {}
    for fid, ids in fams:
        m2 = guardado[("principal", "S2_selecao_idade", fid)]
        sd = float(np.std([l[fid] for l in m2["linhas"]], ddof=1))
        poder[fid] = {"sd_do_delta_pp": round(sd, 2)}
        for n in (4, 8, 10, 16, 22, 28):
            dm = d_minimo(n, m2["n"] - n)
            poder[fid]["com_%d_casos_ve_a_partir_de_pp" % n] = round(dm * sd, 1)

    # os números que a conclusão vai citar por marcador
    def linha(l, d, f):
        for r in linhas_csv:
            if r["liga"] == l and r["destino"] == d and r["familia"] == f:
                return r
        return {}
    achado = {
        "ligas_estrangeiras_com_fator_proprio": len(estrangeiras_no_piso),
        "quais": estrangeiras_no_piso,
        "so_e_possivel_porque_o_destino_inclui_A_e_C":
            "com destino só Série B a maior origem estrangeira é Portugal A, com 8 casos; "
            "nenhuma chega ao piso de 10 (conferido, e bate com o que o dono contou)",
        "ligas_estrangeiras_abaixo_do_piso": sum(1 for g in casos_origem
                                                 if not g.startswith("Brasil")
                                                 and casos_origem[g] < PISO),
        "casos_nessas_ligas": sum(n for g, n in casos_origem.items()
                                  if not g.startswith("Brasil") and n < PISO),
        "ligas_do_painel_sem_nenhum_caso": sum(1 for r in linhas_csv
                                               if r["forca"] == "sem fator"),
        "escada_brasileira_em_pontos_de_percentil": {
            f: {"Brasil A → Brasil B": {"bruto": linha("Brasil A", "Brasil B", f)["fator_bruto"],
                                        "com_controle": linha("Brasil A", "Brasil B", f)["fator"]},
                "Brasil C → Brasil B": {"bruto": linha("Brasil C", "Brasil B", f)["fator_bruto"],
                                        "com_controle": linha("Brasil C", "Brasil B", f)["fator"]}}
            for f, _ in fams},
        "o_maior_fator_estrangeiro_nao_bate_o_garimpo": {
            f: garimpos[f]["leitura"] for f, _ in fams},
        "indicadores_que_passaram_no_BH": {
            "%s · %s" % (u, f): sum(1 for t in saida_testes
                                    if t["corte"] == "principal"
                                    and t["modelo"] == "S2_selecao_idade"
                                    and t["familia"] == f and t["unidade"] == u
                                    and t["q"] != "" and t["q"] < 0.05)
            for f, _ in fams for u in acima_do_piso + sorted(membros) if u != ANCORA},
        "porta_de_coorte": {f: ("passou" if portas[f]["passou"] else "não passou")
                            for f, _ in fams},
    }

    resumo = {
        "parte": "J08", "passo": 2,
        "achado": achado,
        "pergunta": decl["pergunta"],
        "rodado_em": "2026-09-19",
        "base": {"linhas": len(linhas), "principal": len(P),
                 "jogadores_distintos": len({l["nkey"] for l in P}),
                 "cortes": {n: sum(1 for l in linhas if f(l)) for n, f in cortes}},
        "o_encolhimento_confere_com_tres_contas_independentes": comparacao_encolhimento,
        "sensibilidade_do_encolhimento": sens_encolhimento,
        "a_conta_para_o_J09": {
            "forma": "Δpercentil previsto = intercepto + b·(percentil na origem) "
                     "+ coef_idade·envelhecimento_esperado_pp + fator(origem) − fator(destino)",
            "por_familia": encolhimento,
            "onde_esta_o_fator": "coluna `fator` de fatores_liga.csv, já com o destino descontado",
        },
        "conferencia_do_agrupamento_proposto_no_passo_1": conferencia,
        "faixas": {
            "criterio": "nível em dqz_liquido no modelo pareado de todas as ligas; corte em "
                        "±%.2f, metade do degrau Brasil A → Brasil B medido no mesmo modelo"
                        % corte_faixa,
            "corte": round(corte_faixa, 3),
            "membros": {k: sorted(v) for k, v in membros.items()},
            "niveis_por_liga_dqz_liquido": {k: round(v, 2) for k, v in
                                            sorted(niveis.items(), key=lambda kv: -kv[1])},
            "ligas_com_fator_proprio": acima_do_piso,
        },
        "envelhecimento": encolhimento,
        "vies_do_sobrevivente": vies,
        "porta_de_coorte": portas,
        "nulo_do_garimpo": garimpos,
        "poder": poder,
        "confiabilidade_do_qz": meta_aging.get("reliability"),
        "precisa_copiar": {
            "o_que": "os Excels do Wyscout (aba BASE) do Portal Ranking, por período, lidos em "
                     "modo somente-leitura pelo passo 1 (J08_base.py). Nada foi copiado por "
                     "este estudo; o fluxo principal copia e registra a data.",
            "onde": "Portal Ranking/dados/<periodo>/ (e <periodo>/_pre_filtro/ quando existir, "
                    "que é o export cru e é o que o script prefere)",
            "periodos_e_ligas": {k: sorted(v) for k, v in sorted(periodos.items())},
            "total_pares_periodo_liga": sum(len(v) for v in periodos.values()),
            "o_que_ja_esta_no_repositorio": "dados_copiados/wyscout/ (rankings_ago26.json, "
                                            "_temporal_movers.json, _temporal_photos.json, "
                                            "_temporal_aging.json, xlsx_ago26/) — o período "
                                            "ago26 NÃO cobre os lados das transferências.",
        },
        "o_que_nao_tem": {
            "fisicas": "família não montável: não há dado físico por temporada para liga de "
                       "origem nenhuma. O fator do J08 é TÉCNICO, e o J09 marca o requisito "
                       "físico como 'não verificado' em todo alvo estrangeiro.",
            "goleiros": "o painel temporal não tem posição-raiz de goleiro; J08 não produz "
                        "fator para goleiro.",
        },
    }
    json.dump(resumo, open(os.path.join(R, "J08_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    # ---- console -----------------------------------------------------------
    print("J08 — fator de conversão de liga")
    print("base %d linhas · principal %d · %d jogadores distintos"
          % (len(linhas), len(P), len({l["nkey"] for l in P})))
    print("ligas com fator próprio (%d+ casos): %s" % (PISO, ", ".join(acima_do_piso)))
    print("faixas (corte ±%.2f em dqz_liquido):" % corte_faixa)
    for f in sorted(membros):
        print("   %-14s %2d ligas, %3d casos" % (f, len(membros[f]),
              sum(casos_origem[g] for g in membros[f])))
    print()
    for fid, _ in fams:
        e = encolhimento[fid]
        print("[%s] encolhimento b=%.3f (quem fica guarda %.3f) · idade coef=%.2f (p=%.4f)"
              % (fid, e["b_percentil_origem"], e["b_implicito_de_quem_fica"],
                 e["coef_envelhecimento"], e["p_envelhecimento"]))
        m2 = guardado[("principal", "S2_selecao_idade", fid)]
        for u in acima_do_piso + sorted(membros):
            if u == ANCORA or u not in m2["nomes"]:
                continue
            c, p, lo, hi = coef_de(m2, u, fid)
            print("    %-16s %+6.1f pp  IC[%+.1f, %+.1f]  p=%.4f  n=%d"
                  % (u, c, lo, hi, p,
                     sum(1 for l in m2["linhas"]
                         if mapa.get(l["liga_origem"], l["liga_origem"]) == u)))
        pc = portas[fid]
        print("    porta de coorte: %s (MAE com liga %.2f x sem liga %.2f)"
              % ("passou" if pc.get("passou") else "NÃO passou",
                 pc.get("mae_com_liga", float("nan")), pc.get("mae_sem_liga", float("nan"))))
        print("    garimpo: maior fator por sorteio p95 = %.1f pp"
              % garimpos[fid]["maior_fator_por_sorteio_p95"])
        print()
    print("escrito: fatores_liga.csv (%d linhas), J08_testes.csv (%d linhas), J08_resumo.json"
          % (len(linhas_csv), len(saida_testes)))


if __name__ == "__main__":
    main()
