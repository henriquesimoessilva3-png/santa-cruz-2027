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
import csv
import json
import os
import statistics
import sys
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPTS))

import J06  # noqa: E402
import J06_livres  # noqa: E402  — reaproveita a resolucao da chave do app  — reaproveita a ficha, a base e o julgar() da própria parte

RESULTADOS = SCRIPTS.parent / "resultados"
SAIDA_CSV = RESULTADOS / "J06_ranking_aderencia.csv"
SAIDA_JSON = RESULTADOS / "J06_ranking_aderencia.json"

ORDEM = ["Goleiro", "Zaga", "Lateral", "Volante", "Meia", "Extremo", "Atacante"]

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
COLUNAS = ["setor", "bloco", "posicao_wy", "origem", "posto", "jogador", "clube", "liga", "idade", "minutos", "fatia_pct",
           "com_dado", "atende", "aderencia_eixo", "aderencia_desempate", "aderencia", "folga",
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


def exterior(ficha):
    """Os candidatos de fora, com o percentil já ajustado pelo fator de liga de J08."""
    caminho = RESULTADOS / "J09_base.csv"
    if not caminho.exists():
        return []
    fora = []
    for r in csv.DictReader(caminho.open(encoding="utf-8")):
        setor = r.get("setor")
        itens = [i for i in ficha.get(setor, []) if i.get("no_perfil_curto")]
        detalhe = []
        for i in itens:
            ind = i["indicador"]
            # O `__adj` ja sai orientado ("maior e melhor"): o J09 aplica o sinal ANTES de ranquear.
            p = J06.num(r.get(f"{ind}__adj")) or J06.num(r.get(f"{ind}__pct"))
            if p is None:
                continue
            detalhe.append({"indicador": ind, "nome": i["nome"], "bloco": i["bloco"],
                            "percentil": round(p, 1), "piso_pct": i["piso_pct"],
                            "utilizavel": (setor, ind) not in J06.NAO_UTILIZAVEL,
                            "atende": None if i["piso_pct"] is None else bool(p >= i["piso_pct"])})
        if len(detalhe) < 2:
            continue
        nota = pontuar(detalhe)
        if nota["com_dado"] < 2:
            continue
        fora.append({
            "setor": setor, "posicao_wy": (r.get("posicao") or "").strip(),
            "origem": "exterior", "jogador": r.get("jogador"),
            "clube": r.get("time"), "liga": r.get("liga"),
            "idade": J06.num(r.get("idade")), "minutos": J06.num(r.get("minutos")),
            "fatia_pct": J06.num(r.get("fatia_pct")), "contrato": r.get("contrato"),
            "livre": r.get("contrato_na_janela") in ("True", "true", "1"),
            "estrangeiro": True,
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
    return fora


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

    fora = exterior(ficha)
    # A ficha do exterior mede, no maximo, 2 dos 4 a 6 criterios com piso — o dado fisico das ligas
    # de origem nao existe e o fator de J08 so converte parte do tecnico. Ranquear os dois juntos
    # poria o estrangeiro no topo por ser medido em menos coisa, entao eles vao SEPARADOS e a lista
    # de fora diz, em cada linha, quantos criterios sustentam a nota.
    print(f"  {len(fora)} candidatos de fora, com cobertura parcial da ficha")

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
             "serie_b": [], "exterior": []}

    linhas_csv = []
    for grupo, chave in ((b, "serie_b"), (fora, "exterior")):
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
            if chave == "exterior":
                # Ordem de fora: rodagem primeiro (o achado do J09), e so depois o pouco de ficha
                # que existe. Cortada em 15 por posicao — lista longa sobre dado fino engana.
                gente = sorted(gente, key=lambda x: (-(x["fatia_pct"] or 0), -(x["atende"] or 0),
                                                     -(x["aderencia"] or 0)))[:15]
            if not gente:
                continue
            saida[chave].append({
                "posicao": bloco_nome,
                "ficha_de": setor,
                "criterios_da_ficha": max((x["com_dado"] for x in gente), default=0),
                "quantos": len(gente),
                "jogadores": [{k: x.get(k) for k in
                               ("jogador", "clube", "liga", "idade", "minutos", "fatia_pct",
                                "com_dado", "atende", "aderencia_eixo", "aderencia_desempate",
                                "criterios_do_eixo", "eixo_detalhe", "aderencia", "folga",
                                "contrato", "livre",
                                "estrangeiro", "fisico_verificado", "forca_do_fator",
                                "minutagem_regular", "detalhe", "pk_app")}
                              for x in gente],
            })
            for i, x in enumerate(gente, 1):
                linhas_csv.append({**{k: x.get(k) for k in COLUNAS if k != "posto"}, "posto": i})

    with SAIDA_CSV.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=COLUNAS, extrasaction="ignore")
        w.writeheader()
        for r in linhas_csv:
            w.writerow(r)
    SAIDA_JSON.write_text(json.dumps(saida, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    print(f"\n{SAIDA_CSV.name}: {len(linhas_csv)} linhas")
    for bloco in saida["serie_b"]:
        top = bloco["jogadores"][0]
        print(f"  {bloco['posicao']:9} {bloco['quantos']:3} jogadores · "
              f"1º {top['jogador']} ({top['clube']}) "
              f"atende {top['atende']}/{top['com_dado']} · aderência {top['aderencia']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
