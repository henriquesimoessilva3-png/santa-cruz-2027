#!/usr/bin/env python3
"""A lista por POSIÇÃO: minutagem ELIMINA, o resto ORDENA.

A regra desta lista mora em `resultados/J06_ordenacao.json`, versionada, e mudou em 21/09/2026.
Antes a ordem era por quantos pisos da ficha o jogador cruza; agora o corte é a minutagem alta e
repetida — o único requisito que a base sustenta por posição (J05-3) — e a ordem é o eixo da
qualidade da chance, com físico e duelo como desempate. O motivo está escrito lá e em resumo é
este: requisito que se sustenta elimina, requisito que não se sustenta no máximo ordena, e era
isso que estava trocado.

POR QUE ELA EXISTE. A ficha de J05 é uma CONJUNÇÃO: o jogador precisa cruzar 4 a 6 pisos ao mesmo
tempo. O próprio J06 mediu o que isso custa — dos livres com rodagem, 23 caem só no estilo técnico,
18 só no duelo de corpo, 10 só no físico, e sobram 2. Um filtro assim responde "quem é perfeito" e
joga fora toda a informação de QUÃO PERTO cada um está. Quem monta elenco precisa da segunda
pergunta, não da primeira.

O QUE ESTA LISTA MEDE, com todas as letras: o quanto cada jogador **se parece com o titular de
quem subiu**, na ficha da posição dele. Isso NÃO é probabilidade de dar certo. O J05-1 diz na
manchete que o perfil "descreve quem subiu e não promete quem vai subir", e o backtest da §8.6 não
autorizou publicar nome como alvo. Uma lista ordenada é mais sedutora que uma lista binária, e por
isso o aviso tem de andar junto dela.

AS DUAS COLUNAS QUE RESPONDEM A PERGUNTA:
  - `atende` / `com_dado` — quantos critérios da posição ele cruza, de quantos foram medidos.
  - `aderencia` — a média do percentil dele nos critérios da posição, de 0 a 100, já orientada
    ("quanto maior, melhor", como o J06 faz: percentil bruto quando maior é melhor, 100 − p quando
    menor é melhor). É a mesma escala dos pisos, então dá para ler lado a lado.
  - `folga` — a média de (percentil − piso). Negativa quer dizer que, em média, ele fica abaixo do
    que a ficha pede; positiva, acima.

DE ONDE VEM CADA LADO:
  - Série B: reaproveita o `base_do_jogador()`, o `percentilar()` e o `julgar()` do próprio J06 —
    é a MESMA conta que produziu o funil publicado, e o script confere isso contra o
    `J06_funil.csv` antes de gravar.
  - Exterior: `J09_base.csv`, com o percentil **ajustado pelo fator de liga de J08** (`__adj`), que
    já sai orientado. O ajuste tem força variável (`forca_do_fator`, `casos_do_fator`) e a lista
    carrega isso: estrangeiro de liga com fator fraco é palpite mais frouxo que brasileiro da B.

O QUE A LISTA NÃO DIZ: se o jogador é bom, se cabe no modelo de jogo, se o salário fecha, se o
clube libera, e se o físico dele foi verificado (muita liga de origem não tem dado físico). Custo
e disponibilidade ficam para validação externa, como manda o CLAUDE.md.

Uso:
    python3 _fonte/estudo_serieb/scripts/J06_ranking.py
"""
import collections
import csv
import json
import os
import statistics
import sys
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPTS))

import J09                      # o NOME2ID declarado la: nome da ficha -> coluna do J09_base
import J06  # noqa: E402
import J06_livres  # noqa: E402  — reaproveita a resolucao da chave do app  — reaproveita a ficha, a base e o julgar() da própria parte

RESULTADOS = SCRIPTS.parent / "resultados"
SAIDA_CSV = RESULTADOS / "J06_ranking_aderencia.csv"
SAIDA_JSON = RESULTADOS / "J06_ranking_aderencia.json"

ORDEM = ["Goleiro", "Zaga", "Lateral", "Volante", "Meia", "Extremo", "Atacante"]

# AS TRES LISTAS (22/09, decisao do dono). Ate entao era uma lista so', com a Serie B embolada
# com estrangeiro e com o exterior inteiro dentro — o que trouxe Kvaratskhelia, Doku e meio top-5
# europeu para uma tela de montagem de elenco do Santa Cruz. Nenhum deles e' alvo, e misturar os
# tres mercados numa ordem so' escondia isso.
#
#   1. SERIE B          — o mercado de foco, inteiro.
#   2. SUL-AMERICANOS   — os demais campeonatos da America do Sul, Serie A inclusa (ela e' o
#                         campeonato sul-americano com o fator de conversao mais forte).
#   3. BRASILEIROS E SUL-AMERICANOS NO RESTO DO MUNDO — as demais ligas, mas SO' quem tem
#                         passaporte brasileiro ou sul-americano. Europeu de liga europeia sai.
PASSAPORTE_SUL = {"Brazil", "Argentina", "Uruguay", "Colombia", "Chile", "Paraguay", "Peru",
                  "Ecuador", "Bolivia", "Venezuela"}
LIGAS_SUL = {"Brasil A", "Argentina A", "Argentina B", "Uruguai", "Colombia A", "Colombia B",
             "Chile", "Paraguai", "Peru", "Equador A", "Equador B", "Bolivia", "Venezuela"}


def e_sulamericano(passaporte):
    """Basta UM passaporte da lista. Quem tem dupla cidadania não perde a vaga por isso."""
    return any(t.strip() in PASSAPORTE_SUL for t in (passaporte or "").split(","))


# Quantos de CADA mercado de fora entram em cada bloco da lista. A Série B entra inteira: é o
# mercado de foco e é onde a ficha foi medida. O teto é por mercado, e não um teto único, para
# que o Exterior — que é dez vezes maior — não empurre Série A e sul-americanos para fora da
# tela só por tamanho de base.
TETO_FORA = 10
TETO_AJUSTE = {}

# Como a LISTA é dividida na tela — decisão do dono em 20/09. Lateral esquerdo e direito não são
# a mesma vaga, e médio e meia ofensivo não são a mesma função: uma lista só de "Lateral" obriga
# quem lê a adivinhar o lado de cada nome.
#
# O que isto NÃO faz, e é a ressalva que tem de chegar à tela: a FICHA continua sendo uma por
# setor. O lateral esquerdo é julgado pela ficha de Lateral, e o médio pela de Meia — as mesmas de
# antes, tiradas dos titulares de quem subiu. Fazer ficha própria para cada um dos quatro cortaria
# o n de cada uma quase pela metade, e o dono escolheu não pagar esse preço agora.
#
# (bloco na tela, setor que dá a ficha, códigos de posição do Wyscout)
LISTA = [
    ("Goleiro", "Goleiro", None),
    ("Zaga", "Zaga", None),
    ("Lateral esquerdo", "Lateral", {"LB", "LWB"}),
    ("Lateral direito", "Lateral", {"RB", "RWB"}),
    ("Volante", "Volante", None),
    ("Médio", "Meia", {"LCMF", "RCMF"}),
    ("Meia ofensivo", "Meia", {"AMF", "LAMF", "RAMF"}),
    ("Extremo", "Extremo", None),
    ("Atacante", "Atacante", None),
]
COLUNAS = ["lista", "setor", "bloco", "posicao_wy", "origem", "mercado", "passaporte",
           "fator_comprometido", "posto",
           "jogador", "clube", "liga", "idade", "minutos", "fatia_pct",
           "com_dado", "atende", "aderencia_eixo", "aderencia_eixo_origem", "desconto_do_eixo",
           "aderencia_desempate", "aderencia", "folga",
           "criterios_do_eixo", "eixo_detalhe", "contrato", "livre", "estrangeiro",
           "fisico_verificado", "forca_do_fator", "detalhe"]


def media(vs):
    vs = [v for v in vs if v is not None]
    return round(statistics.fmean(vs), 1) if vs else None


def pontuar(detalhe, eixo_pcts=None, blocos_desempate=()):
    """De uma lista de critérios julgados para as medidas da lista.

    `detalhe` é o que o julgar() do J06 devolve: um item por critério, com o percentil já
    orientado e o piso da posição. Critério sem piso e critério marcado como não utilizável entram
    na aderência (dizem onde o jogador está) e ficam fora da conta de atendidos (não são
    exigência) — é a mesma regra que o J06 aplica ao contar `violados`.

    As duas aderências em camadas (21/09, `J06_ordenacao.json`): `aderencia_eixo` é a média nos
    indicadores do eixo da qualidade da chance, e `aderencia_desempate` a média nos blocos de
    físico e duelo. Elas NÃO são somadas com a geral — a §8.2 proíbe virar um número único; são
    chaves em camadas, cada uma à vista na tabela.

    O EIXO CHEGA MEDIDO DE FORA (`eixo_pcts`), e não do `detalhe`. Por quê: `Toques na área/90`
    tem piso na ficha de J05 e ficou de fora do perfil CURTO que o J06 herda, então ele não existe
    no `detalhe`. Medi-lo aqui como exigência mudaria `atende` e `com_dado` e quebraria a
    conferência contra o funil publicado — que é justamente a trava que garante que esta lista é a
    mesma conta do J06. Então ele entra medido e SEM piso: descreve onde o jogador está, ordena, e
    não vira exigência nova. É a mesma regra que o J06 aplica a métrica sem piso."""
    com_piso = [d for d in detalhe if d.get("piso_pct") is not None and d.get("utilizavel")]
    do_desempate = [d for d in detalhe if d.get("bloco") in blocos_desempate]
    return {
        "com_dado": len(com_piso),
        "atende": sum(1 for d in com_piso if d.get("atende")),
        "aderencia": media([d["percentil"] for d in detalhe]),
        "aderencia_eixo": media([p for p in (eixo_pcts or {}).values()]),
        "criterios_do_eixo": sum(1 for p in (eixo_pcts or {}).values() if p is not None),
        "eixo_detalhe": "; ".join(f"{k} {v:.0f}" for k, v in (eixo_pcts or {}).items()
                                  if v is not None),
        "aderencia_desempate": media([d["percentil"] for d in do_desempate]),
        "folga": media([d["percentil"] - d["piso_pct"] for d in com_piso]),
        "detalhe": "; ".join(
            f"{d['nome']} {d['percentil']:.0f}" + (f"/{d['piso_pct']:.0f}" if d.get("piso_pct") is not None else "")
            for d in detalhe),
    }


def serie_b(ficha_dec, setores, eixo=(), blocos_desempate=()):
    """Os jogadores da Série B de 2026, pela MESMA conta que produziu o funil publicado.

    Reaproveita as funções de módulo do J06 — base_do_jogador, percentilar, minutagem,
    contratos_e_lesoes e julgar — em vez de reimplementar. O `main()` do J06 monta exatamente
    isto e guarda o `detalhe` de cada jogador no dicionário, mas não o grava no CSV: é esse
    detalhe, critério a critério, que esta lista precisa e que se perdia."""
    ids_fis = [{"id": i} for i in sorted({x["indicador"] for v in ficha_dec.values() for x in v
                                          if x["bloco"] == "fisico"})]
    ids_tec = [{"id": i} for i in sorted({x["indicador"] for v in ficha_dec.values() for x in v
                                          if x["bloco"] != "fisico"}
                                         | {e["indicador"] for e in eixo})]
    base, _cont = J06.base_do_jogador(ids_fis, ids_tec, setores)
    J06.percentilar(base, ids_fis + ids_tec)
    mi = J06.minutagem(("2022", "2023", "2024", "2025"))
    elencos, lesoes = J06.contratos_e_lesoes()
    fichas_mi = mi["por_jogador_ano"]

    saida = []
    for l in (x for x in base if x["ano"] == J06.ANO_ALVO):
        e = J06.casar_elenco(l["jogador"], elencos)
        ct_tm = J06.data_br(e["contrato_ate"]) if e else None
        ct_wy = J06.data_br(l["ct_wyscout"])
        m = fichas_mi.get((J06.ANO_ALVO, l["jogador"]))
        v = J06.julgar(l, ficha_dec.get(l["setor"], []), l["setor"])
        if v["indicadores_com_dado"] < 2:
            continue
        # O eixo, medido no MESMO percentil (temporada × setor, 900+ minutos) e orientado pelo
        # sentido declarado em J05_perfil.csv — nunca por convenção escrita aqui.
        eixo_pcts = {}
        for ei in eixo:
            p = l.get(J06.pct(ei["indicador"]))
            eixo_pcts[ei["nome"]] = (None if p is None else
                                     round(p if ei["sentido"] == "maior é melhor" else 100 - p, 1))
        nota = pontuar(v["detalhe"], eixo_pcts, blocos_desempate)
        if not nota["com_dado"]:
            continue
        saida.append({
            "setor": l["setor"], "posicao_wy": l["posicao"],
            "origem": "Série B", "jogador": l["jogador"],
            "clube": l["clube"], "liga": "Série B", "idade": l["idade_na_temporada"],
            "minutos": l["minutos"], "fatia_pct": m["fatia"] if m else None,
            "contrato": (e["contrato_ate"] if e else "") or l["ct_wyscout"],
            "livre": bool(J06.na_janela(ct_tm) or J06.na_janela(ct_wy)),
            "estrangeiro": bool(l["nascido_em"]) and l["nascido_em"] != "Brazil",
            "fisico_verificado": bool(l["tem_fisico"]),
            "forca_do_fator": "",
            "minutagem_regular": bool(m and m["regular"]),
            "_violados_j06": v["violados"], "_com_dado_j06": v["indicadores_com_dado"],
            **nota})
    return saida


def conferir_contra_o_funil(linhas):
    """Falha fechada: a conta desta lista tem de bater, jogador a jogador, com o funil publicado.

    Lista que não reproduz o número que a parte já publicou é alegação sobre si mesma — é onde o
    estudo se enganou antes, e é o que o portão de entrega existe para impedir."""
    caminho = RESULTADOS / "J06_funil.csv"
    if not caminho.exists():
        return ["falta o J06_funil.csv: sem ele não há contra o que conferir"]
    pub = {(r["jogador"], r["clube"]): r for r in csv.DictReader(caminho.open(encoding="utf-8"))}
    erros = []
    for l in linhas:
        r = pub.get((l["jogador"], l["clube"]))
        if r is None:
            erros.append(f"{l['jogador']} ({l['clube']}) não está no funil publicado")
            continue
        if int(r["violados"] or 0) != l["_violados_j06"]:
            erros.append(f"{l['jogador']}: violados {l['_violados_j06']} aqui, "
                         f"{r['violados']} no funil")
        if int(r["indicadores_com_dado"] or 0) != l["_com_dado_j06"]:
            erros.append(f"{l['jogador']}: indicadores_com_dado {l['_com_dado_j06']} aqui, "
                         f"{r['indicadores_com_dado']} no funil")
    return erros


def mercados(ficha, eixo=()):
    """Os candidatos de FORA da Série B, com o percentil já na escala da Série B pelo fator de J08.

    Desde 21/09 isto cobre três mercados e não um: **Série A** (que o J09 passou a ler, e cujo
    fator de conversão é o mais forte da tabela — 156 casos), **sul-americanos** e o **resto do
    exterior**. Cada linha diz de qual mercado veio, qual a força do fator daquela liga e qual o
    passaporte, porque as três coisas mudam o tamanho da aposta e nenhuma delas se deduz do nome
    do jogador.
    """
    caminho = RESULTADOS / "J09_base.csv"
    if not caminho.exists():
        return []
    fora = []
    for r in csv.DictReader(caminho.open(encoding="utf-8")):
        setor = r.get("setor")
        itens = [i for i in ficha.get(setor, []) if i.get("no_perfil_curto")]
        detalhe = []
        for i in itens:
            # A COLUNA NAO SE CHAMA COMO A FICHA. A ficha de J05 nomeia o indicador tecnico como o
            # Wyscout o nomeia ("Duelos defensivos ganhos, %"); o J09_base.csv guarda a coluna pelo
            # ID ("duelos_def_ganhos_pct"). Ate 21/09 esta funcao procurava a coluna pelo NOME, que
            # nunca bate — e o efeito era silencioso e grave: so os indicadores FISICOS eram
            # encontrados, porque o id deles (psv5, t_spr, t505_90, expl, spr_n) por acaso e igual
            # ao prefixo da coluna. Consequencias medidas: todo ZAGUEIRO saia da lista (a ficha
            # dele tem um fisico so, entao ficava com menos de dois criterios) e todo GOLEIRO
            # tambem (a ficha dele nao tem fisico nenhum); e o resto era julgado SO pelo fisico,
            # que e justamente o dado raro la fora — 9.833 das 11.023 linhas tem o tecnico e so
            # 2.892 tem o psv5. O mapa e o NOME2ID do proprio J09, que e onde ele foi declarado.
            ind = J09.NOME2ID.get(i["indicador"], i["indicador"])
            # O `__adj` ja sai orientado ("maior e melhor"): o J09 aplica o sinal ANTES de ranquear.
            p = J06.num(r.get(f"{ind}__adj")) or J06.num(r.get(f"{ind}__pct"))
            if p is None:
                continue
            detalhe.append({"indicador": i["indicador"], "coluna": ind,
                            "nome": i["nome"], "bloco": i["bloco"],
                            "percentil": round(p, 1), "piso_pct": i["piso_pct"],
                            "utilizavel": (setor, ind) not in J06.NAO_UTILIZAVEL,
                            "atende": None if i["piso_pct"] is None else bool(p >= i["piso_pct"])})
        if len(detalhe) < 2:
            continue
        # O EIXO LA FORA E MEIO EIXO, e isso vai escrito em vez de escondido. Dos dois
        # indicadores do eixo da qualidade da chance, `Passes progressivos/90` existe na base das
        # ligas de origem e `Toques na area/90` NAO existe — a J09_base nao traz coluna nenhuma de
        # area. Entao a aderencia do eixo sai de um criterio so, e o `criterios_do_eixo` diz isso
        # em cada linha, para que ninguem leia a lista de fora como se fosse a de dentro.
        # O EIXO CHEIO, e nao mais metade dele. Ate 21/09 a tela afirmava que `Toques na
        # area/90` nao existia em liga de origem: nao era verdade — a coluna esta nos 115
        # cabecalhos de TODOS os arquivos, e o que faltava era a extracao. O J09 passou a
        # carrega-la (`eixo_toques_area`, `eixo_passes_progressivos`), ja percentilada dentro de
        # (liga, setor) e ajustada para a escala da Serie B pela familia `volume` de J08. E' o
        # que permite ordenar todos os mercados na MESMA lista: sem isso, quem vem de fora seria
        # ordenado por meia regua contra a regua inteira de quem esta aqui.
        eixo_pcts, eixo_origem = {}, {}
        for ei in eixo:
            col = EIXO_J09.get(ei["nome"])
            po = J06.num(r.get(f"{col}__pct")) if col else None
            pv = (J06.num(r.get(f"{col}__adj")) if col else None)
            if pv is None:
                pv = po
            eixo_pcts[ei["nome"]] = (None if pv is None else round(pv, 1))
            eixo_origem[ei["nome"]] = (None if po is None else round(po, 1))
        nota = pontuar(detalhe, eixo_pcts, ("fisico", "duelo_corpo"))
        if nota["com_dado"] < 2:
            continue
        # O DESCONTO DE LIGA, a vista. O ajuste de J08 tem teto aritmetico (76,4 na familia
        # `volume`, que e' a do eixo): nenhum jogador de fora pode passar dele, enquanto a Serie B
        # vai ate 100. Sem o numero de ORIGEM ao lado, a lista unica afirma que um volante da
        # Serie B e' melhor que um extremo da Espanha — quando o que ela mediu foi o desconto.
        # Publicar os dois e' o que torna a ordem legivel em vez de absurda.
        nota["aderencia_eixo_origem"] = media([v for v in eixo_origem.values()])
        nota["desconto_do_eixo"] = (
            None if nota["aderencia_eixo"] is None or nota["aderencia_eixo_origem"] is None
            else round(nota["aderencia_eixo"] - nota["aderencia_eixo_origem"], 1))
        fora.append({
            "setor": setor, "posicao_wy": (r.get("posicao") or "").strip(),
            "origem": "exterior", "mercado": r.get("mercado") or "Exterior",
            "passaporte": (r.get("passaporte") or "").split(",")[0].strip(),
            "passaporte_todos": r.get("passaporte") or "",
            "lista": ("sul" if (r.get("liga") in LIGAS_SUL) else
                      ("mundo" if e_sulamericano(r.get("passaporte")) else None)),
            "jogador": r.get("jogador"),
            "clube": r.get("time"), "liga": r.get("liga"),
            "idade": J06.num(r.get("idade")), "minutos": J06.num(r.get("minutos")),
            "fatia_pct": J06.num(r.get("fatia_pct")), "contrato": r.get("contrato"),
            "livre": r.get("contrato_na_janela") in ("True", "true", "1"),
            # Quem tem passaporte brasileiro NAO ocupa vaga de estrangeiro, jogue ele onde
            # jogar — e' a coluna que o J09 publica, nao uma suposicao pelo nome da liga.
            "estrangeiro": r.get("ocupa_vaga_de_estrangeiro") in ("True", "true", "1"),
            "fisico_verificado": r.get("fisico_rastreado") in ("True", "true", "1"),
            "forca_do_fator": r.get("forca_do_fator") or "",
            "minutagem_regular": r.get("minutagem_regular") in ("True", "true", "1"),
            "regularidade_verificavel": r.get("regularidade_verificavel") in ("True", "true", "1"),
            **nota})
    # A ficha nao e medida la fora (1 a 2 criterios de 4 a 6), entao a ordem NAO pode ser a
    # aderencia: seria ranquear pelo terco do perfil que existe. O que o J09 estabeleceu e outra
    # coisa — "estrangeiro que ja rodava joga mais no primeiro ano de Serie B" —, e e essa a
    # peneira. So entra quem tem minutagem regular VERIFICAVEL na liga de origem.
    fora = [x for x in fora if x["minutagem_regular"] and x["regularidade_verificavel"]]
    # Quem nao cai em nenhuma das duas listas de fora simplesmente NAO e' mercado do Santa Cruz:
    # europeu jogando na Europa, asiatico jogando na Asia. Sai aqui, e a conta de quantos sairam
    # vai para a tela — o que se descarta tem de ser visivel.
    fora = [x for x in fora if x["lista"]]
    return fora


# nome do indicador na ficha -> coluna que o J09 publica para o eixo
EIXO_J09 = {"Toques na área/90": "eixo_toques_area",
            "Passes progressivos/90": "eixo_passes_progressivos"}


def ligas_comprometidas():
    """As ligas cujo número desta lista depende de uma liga-temporada com o rótulo errado.

    Vem de scripts/conferir_painel.py, regenerável: quando o Portal Ranking corrigir o painel, o
    arquivo esvazia sozinho e as marcas somem da tela. NÃO é lista escrita à mão aqui.
    """
    caminho = RESULTADOS / "_painel_suspeito.json"
    if not caminho.exists():
        return {}
    d = json.load(caminho.open(encoding="utf-8"))
    return {x["liga"]: x["por_que"] for x in d.get("ligas_afetadas", [])}


def main():
    ficha, ficha_completa = {}, []
    for l in csv.DictReader((RESULTADOS / "J05_perfil.csv").open(encoding="utf-8")):
        ficha_completa.append(l)
        ficha.setdefault(l["setor"], []).append({
            "indicador": l["indicador"], "nome": l["nome"], "bloco": l["bloco"],
            "sentido": l["sentido"], "piso_pct": J06.num(l["piso_pct"]),
            "no_perfil_curto": l["no_perfil_curto"] == "1",
        })

    dec = json.load((RESULTADOS / "J06_indicadores.json").open(encoding="utf-8"))
    ficha_dec = dict(dec["perfil_herdado_de_J05"]["por_setor"])
    setores = dec["setores"]

    # A regra da lista — o que ELIMINA e o que ORDENA — mora em J06_ordenacao.json, versionada e
    # auditável, e não aqui dentro. Mudou em 21/09: até então a ordem era por quantos pisos o
    # jogador cruza, que é a conjunção que o próprio J06-1 mostrou reprovar todo mundo.
    ordem = json.load((RESULTADOS / "J06_ordenacao.json").open(encoding="utf-8"))
    nomes_do_eixo = ordem["ordena"]["chave_1"]["indicadores"]
    # O sentido de cada indicador do eixo vem da ficha de J05, que é a autoritativa — e não de
    # uma convenção escrita aqui. Se ele não estiver lá, o script para: eixo com indicador que a
    # ficha não conhece é eixo inventado.
    eixo = []
    for nome in nomes_do_eixo:
        achado = next((l for l in ficha_completa if l["nome"] == nome or l["indicador"] == nome),
                      None)
        if not achado:
            raise SystemExit(f"o eixo pede “{nome}”, que não está em J05_perfil.csv")
        eixo.append({"indicador": achado["indicador"], "nome": achado["nome"],
                     "sentido": achado["sentido"]})
    blocos_desempate = tuple(ordem["ordena"]["chave_2"]["blocos"])
    campo_elimina = ordem["elimina"]["campo"]

    # O teto aritmetico do ajuste de J08, LIDO da saida do J09 e nunca digitado aqui.
    global TETO_AJUSTE
    TETO_AJUSTE = json.load((RESULTADOS / "J09_resumo.json").open(
        encoding="utf-8"))["teto_aritmetico_do_ajuste"]

    print("montando a base da Série B (mesma conta do J06)…")
    b = serie_b(ficha_dec, setores, eixo, blocos_desempate)

    # A chave com que o app reencontra cada um — a mesma `primaryKey` dele, resolvida pelo
    # J06_livres. Quem não resolve de forma única fica sem chave e a lista diz por quê: caso
    # ambíguo é listado, nunca adivinhado.
    indice = J06_livres.chave_do_app()
    sem_par = 0
    for l in b:
        cand = list({id(x): x for x in indice.get(J06_livres.norma(l["jogador"]), [])}.values())
        if len(cand) > 1:
            alvo = J06_livres.norma_clube(l["clube"])
            perto = [x for x in cand if alvo and (alvo in J06_livres.norma_clube(x.get("t"))
                                                  or J06_livres.norma_clube(x.get("t")) in alvo)]
            cand = perto if len(perto) == 1 else []
        l["pk_app"] = J06_livres.pk_do_app(cand[0]) if len(cand) == 1 else None
        if not l["pk_app"]:
            sem_par += 1
    print(f"  chave do app resolvida para {len(b) - sem_par} de {len(b)}"
          + (f" · {sem_par} sem par único" if sem_par else ""))
    erros = conferir_contra_o_funil(b)
    if erros:
        print(f"A lista NÃO foi gravada — {len(erros)} divergência(s) contra o funil publicado:",
              file=sys.stderr)
        for e in erros[:12]:
            print(f"  {e}", file=sys.stderr)
        return 1
    print(f"  {len(b)} jogadores com dois ou mais critérios medidos, conferidos contra o funil")

    # O CORTE DA MINUTAGEM. Vem DEPOIS da conferência contra o funil, de propósito: o que tem de
    # bater com o J06 é a conta da base inteira, não a da lista já peneirada.
    sem_rodagem = [x for x in b if not x.get(campo_elimina)]
    b = [x for x in b if x.get(campo_elimina)]
    print(f"  corte de minutagem ({ordem['elimina']['criterio']}): "
          f"{len(sem_rodagem)} saíram, {len(b)} ficaram")

    for x in b:
        x["mercado"] = "Série B"
        x["passaporte"] = ""
        x["fator_comprometido"] = ""
    fora = mercados(ficha, eixo)
    # A MARCA. A conversão de liga de quem vem de fora sai do J08, e o J08 é ajustado sobre um
    # painel em que algumas liga-temporada têm o rótulo errado. Onde isso acontece, o número
    # desta linha não tem a mesma confiança dos outros — e a linha diz isso em vez de sair igual.
    comp = ligas_comprometidas()
    for x in fora:
        x["fator_comprometido"] = comp.get(x["liga"], "")
    n_marcadas = sum(1 for x in fora if x["fator_comprometido"])
    print(f"  {n_marcadas} candidatos com fator comprometido, em "
          f"{len({x['liga'] for x in fora if x['fator_comprometido']})} ligas")
    # ATE 21/09 a lista de fora ia SEPARADA, embaixo, com a justificativa de que "a ficha la fora
    # mede no maximo 2 dos 4 a 6 criterios" e de que o eixo la e' meio eixo. As duas premissas
    # eram efeito de DEFEITO, nao do dado: a primeira caiu com o NOME2ID (4 a 6 criterios, como
    # aqui), e a segunda com a extracao de `Toques na area/90`, que existe em toda liga. Sem
    # premissa que as separe, elas passam a ser UMA lista por posicao, na mesma ordem — que e' o
    # que responde "quem e' o melhor volante disponivel" numa leitura so'.
    por_mercado = collections.Counter(x["mercado"] for x in fora)
    print(f"  {len(fora)} candidatos fora da Série B: "
          + " · ".join(f"{k} {v}" for k, v in por_mercado.most_common()))

    saida = {"gerado_por": "scripts/J06_ranking.py",
             "o_que_e": ("Minutagem ELIMINA, o resto ORDENA. Só entra quem tem minutagem alta e "
                         "repetida — o único requisito que a base sustenta por posição (J05-3) — "
                         "e a ordem é o eixo da qualidade da chance, com físico e duelo como "
                         "desempate. NÃO é probabilidade de dar certo: o perfil descreve quem "
                         "subiu e não promete quem vai subir (J05-1), e o backtest da §8.6 não "
                         "autorizou publicar nome como alvo."),
             "regra": ordem,
             "corte_de_minutagem": {"saíram": len(sem_rodagem), "ficaram": len(b),
                                    "criterio": ordem["elimina"]["criterio"]},
             "teto_por_mercado_de_fora": TETO_FORA,
             "teto_do_ajuste": TETO_AJUSTE,
             "painel_suspeito": (json.load((RESULTADOS / "_painel_suspeito.json").open(
                 encoding="utf-8")) if (RESULTADOS / "_painel_suspeito.json").exists() else None),
             "listas": []}

    # As tres listas, na ordem de foco declarada pelo dono.
    GRUPOS = [
        ("serie_b", "Série B", "O mercado de foco, inteiro — é aqui que a ficha foi medida.",
         b, None),
        ("sul", "Demais campeonatos sul-americanos",
         "Série A, Argentina, Uruguai, Colômbia, Chile, Paraguai, Peru, Equador, Bolívia e "
         "Venezuela. Todo jogador dessas ligas entra, seja qual for o passaporte.",
         [x for x in fora if x["lista"] == "sul"], TETO_FORA),
        ("mundo", "Brasileiros e sul-americanos no resto do mundo",
         "As demais ligas do planeta, e só quem tem passaporte brasileiro ou sul-americano — "
         "europeu jogando na Europa não é mercado deste clube e não aparece.",
         [x for x in fora if x["lista"] == "mundo"], TETO_FORA + 5),
    ]
    linhas_csv = []
    for chave_lista, titulo_lista, sub_lista, grupo, teto in GRUPOS:
        blocos_da_lista = []
        for bloco_nome, setor, codigos in LISTA:
            # Quem tem setor certo mas código de posição que não conheço (ou nenhum) NÃO some da
            # tela: cai no primeiro bloco daquele setor, e é melhor aparecer no lado errado do que
            # desaparecer da lista sem ninguém notar.
            conhecidos = {c for _, s2, cs in LISTA if s2 == setor and cs for c in cs}
            primeiro = next(n for n, s2, _ in LISTA if s2 == setor)

            def no_bloco(x):
                if x["setor"] != setor:
                    return False
                if codigos is None:
                    return True
                pos = (x.get("posicao_wy") or "").strip()
                return pos in codigos or (pos not in conhecidos and bloco_nome == primeiro)

            # A ORDEM. Em camadas, nunca somada (§8.2): eixo da qualidade da chance primeiro,
            # físico e duelo como desempate, aderência geral como último critério para a ordem
            # ser determinística. `atende` continua na tabela e não manda mais na ordem.
            # Quem não tem o eixo medido vai para o fim da lista, e não para o começo.
            def chave_de_ordem(x):
                def d(v):
                    return -v if v is not None else 1e9
                return (0 if x.get("aderencia_eixo") is not None else 1,
                        d(x.get("aderencia_eixo")), d(x.get("aderencia_desempate")),
                        d(x.get("aderencia")), x["jogador"])
            gente = sorted([x for x in grupo if no_bloco(x)], key=chave_de_ordem)
            for x in gente:
                x["bloco"] = bloco_nome
            # O TETO por mercado de fora. A Serie B entra inteira — ela e' o mercado de foco e a
            # base em que a ficha foi medida. Cada mercado de fora entra com os TETO_FORA
            # primeiros daquele bloco: lista longa sobre dado fino engana, e o teto e' por
            # mercado para que um mercado grande nao empurre um pequeno para fora da tela.
            # O TETO. A Serie B entra inteira. Nas duas listas de fora o teto e' por MERCADO
            # dentro da lista, para que a Serie A nao coma as vagas dos hermanos nem o contrario.
            if teto is not None:
                corte = []
                vistos = collections.Counter()
                for x in gente:
                    if vistos[x["mercado"]] >= teto:
                        continue
                    vistos[x["mercado"]] += 1
                    corte.append(x)
                gente = corte
            if False:
                # ATE 21/09 a ordem de fora era a rodagem, porque "a ficha la fora mede no maximo
                # 2 dos 4 a 6 criterios". Essa premissa era efeito de um DEFEITO, nao do dado: a
                # busca da coluna pelo nome so encontrava os indicadores fisicos. Com o mapa
                # certo, la fora se medem 4 a 6 criterios como aqui dentro, e um dos dois do eixo.
                # Entao a ordem passa a ser a MESMA da Serie B — minutagem ja eliminou, o eixo
                # ordena —, com o corte em 15 por posicao, que continua: lista longa sobre dado
                # fino engana. A rodagem continua sendo a porta de entrada (o achado do J09-1).
                gente = sorted(gente, key=chave_de_ordem)[:15]
            if not gente:
                continue
            blocos_da_lista.append({
                "posicao": bloco_nome,
                "ficha_de": setor,
                "criterios_da_ficha": max((x["com_dado"] for x in gente), default=0),
                "quantos": len(gente),
                "por_mercado": dict(collections.Counter(x["mercado"] for x in gente)),
                "jogadores": [{k: x.get(k) for k in
                               ("jogador", "clube", "liga", "mercado", "passaporte",
                                "fator_comprometido",
                                "aderencia_eixo_origem", "desconto_do_eixo",
                                "idade", "minutos", "fatia_pct",
                                "com_dado", "atende", "aderencia_eixo", "aderencia_desempate",
                                "criterios_do_eixo", "eixo_detalhe", "aderencia", "folga",
                                "contrato", "livre",
                                "estrangeiro", "fisico_verificado", "forca_do_fator",
                                "minutagem_regular", "detalhe", "pk_app")}
                              for x in gente],
            })
            for i, x in enumerate(gente, 1):
                linhas_csv.append({**{k: x.get(k) for k in COLUNAS if k != "posto"},
                                   "posto": i, "lista": chave_lista})

        saida["listas"].append({
            "chave": chave_lista, "titulo": titulo_lista, "subtitulo": sub_lista,
            "quantos": sum(x["quantos"] for x in blocos_da_lista),
            "candidatos": len(grupo), "teto_por_mercado": teto,
            "blocos": blocos_da_lista,
        })

    with SAIDA_CSV.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=COLUNAS, extrasaction="ignore")
        w.writeheader()
        for r in linhas_csv:
            w.writerow(r)
    SAIDA_JSON.write_text(json.dumps(saida, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    print(f"\n{SAIDA_CSV.name}: {len(linhas_csv)} linhas")
    for L in saida["listas"]:
        print(f"\n  === {L['titulo']} — {L['quantos']} nomes de {L['candidatos']} candidatos")
        for bloco in L["blocos"]:
            top = bloco["jogadores"][0]
            print(f"    {bloco['posicao']:16} {bloco['quantos']:3} · 1º {top['jogador']} "
                  f"({top['clube']}, {top['liga'] or 'Série B'}) eixo {top['aderencia_eixo']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
