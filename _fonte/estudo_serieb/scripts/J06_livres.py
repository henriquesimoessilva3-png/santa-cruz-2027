#!/usr/bin/env python3
"""A lista nominal que a base SUSTENTA: quem está livre, o contrato confere nas duas fontes e a
minutagem é regular. 40 jogadores, por posição.

POR QUE ELA NÃO SE CHAMA `J06_alvos.csv`. Esse nome é reservado e continua vazio de propósito: o
backtest da §8.6 não autorizou (`J06_resumo.json`, `veredito_do_backtest.passou = false`), e o
`alvos_publicados` da parte é 0. A ficha de perfil do J05 descreve quem subiu e **não promete quem
vai subir** — é a manchete do J05-1, e as comparações entre o titular de quem sobe e o do meio não
se sustentaram em posição nenhuma. Dos 40 daqui, **2** atendem a ficha inteira, e é a conjunção que
mata: 23 caem só no estilo técnico, 18 no duelo de corpo, 10 no físico.

ENTÃO O QUE ESTA LISTA É: o terceiro degrau do funil do J06 — contrato vencendo na virada, as duas
fontes concordando na data, e minutagem regular pelo corte por posição do J05-3, que é **o único
requisito que a base sustenta**. É uma lista de quem está disponível e roda, não de quem faz subir.
Quem usar precisa saber a diferença.

O que ela NÃO diz: se o jogador é bom, se cabe no modelo de jogo, se o salário fecha, se o clube
libera. Custo e disponibilidade ficam para validação externa, como manda o CLAUDE.md.

RECONCILIAÇÃO. O script confere o próprio resultado contra o que a parte já publicou em
`J06_resumo.json` e PARA com erro se divergir — mesma disciplina do portão de entrega: lista que
não bate com o número publicado é alegação sobre si mesma, e é onde o estudo já se enganou antes.

Uso:
    python3 _fonte/estudo_serieb/scripts/J06_livres.py
"""
import csv
import json
import re
import sys
import unicodedata
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
RESULTADOS = SCRIPTS.parent / "resultados"
FUNIL = RESULTADOS / "J06_funil.csv"
RESUMO = RESULTADOS / "J06_resumo.json"
BASE_J01 = RESULTADOS / "base_jogador_temporada.csv"
BASE_APP = SCRIPTS.parent.parent.parent / "dados" / "jogadores.json"
SAIDA_CSV = RESULTADOS / "J06_livres_regulares.csv"
SAIDA_JSON = RESULTADOS / "J06_livres_regulares.json"

# A ordem do campograma, a mesma das sete colunas da tela.
ORDEM = ["Goleiro", "Zaga", "Lateral", "Volante", "Meia", "Extremo", "Atacante"]

COLUNAS = [
    "setor", "posicao", "jogador", "clube", "idade", "minutos", "jogos", "fatia_pct",
    "temporadas_com_dado", "lesao_dias", "lesao_jogos", "lesao_n", "estrangeiro",
    "dupla_nacionalidade", "tem_fisico", "indicadores_com_dado", "violados",
    "atende_perfil", "atende_fisico", "atende_duelo_corpo", "atende_estilo_tecnico", "id_tm",
    "contrato_confirmado", "pk_app", "motivo_sem_par",
]


def verdadeiro(v):
    return str(v).strip().lower() == "true"


def norma(t):
    """Texto comparável: sem acento, sem caixa, sem espaço sobrando. Igual ao `norma()` do app."""
    t = unicodedata.normalize("NFD", str(t or ""))
    return "".join(c for c in t if unicodedata.category(c) != "Mn").lower().strip()


def norma_clube(t):
    """O clube comparável: sem acento, sem caixa e SEM PONTUAÇÃO.

    "Atlético-GO" e "Atlético GO" convivem na base do app e só diferem pelo hífen — sem tirar a
    pontuação, o desempate de homônimo falhava por um caractere."""
    return re.sub(r"[^a-z0-9]+", " ", norma(t)).strip()


def id_por_jogador():
    """{(nome, time) -> id_tm} da temporada de 2026, lido da base do J01.

    Por que o id do Transfermarkt e não o nome. O app reencontra o jogador por
    `primaryKey = nome + time + liga`, e casar assim acha 26 dos 40: a base do app guarda o nome
    abreviado (“D. Doekhi”) ao lado do completo, e o clube nem sempre se escreve igual nas duas
    pontas. O `id_tm` é chave de verdade e existe para os 40 — sem ele a lista chegaria à tela
    com um terço dos nomes em silêncio, que é pior do que não chegar."""
    if not BASE_J01.exists():
        return {}
    mapa = {}
    for r in csv.DictReader(BASE_J01.open(encoding="utf-8")):
        if r.get("ano") != "2026":
            continue
        tm = (r.get("id_tm") or "").strip()
        if tm:
            mapa[(norma(r.get("jogador")), norma(r.get("time")))] = tm
    return mapa


def chave_do_app():
    """{nome normalizado -> primary_key do app}, só entre os jogadores da Série B.

    O app reencontra jogador por `primaryKey = nome + " - " + time + " - " + liga`
    (static/app.js), e é essa string que ele precisa receber pronta. Montá-la aqui, do lado do
    estudo, esbarra em duas coisas que só aparecem olhando a base:

      1. **O id do Transfermarkt não serve.** Dos 1.136 jogadores da Série B em dados/jogadores.json,
         só 31 têm o campo `tm`. Casar por ele acha 5 dos 40.
      2. **O mesmo clube tem vários nomes.** "Botafogo-SP", "Botafogo SP" e "Botafogo FC" convivem
         na base, e "América-MG" aparece também como "América Mineiro" e "América Futebol Clube
         (MG)". Por isso casar por nome+clube acha 26 dos 40 — falha no clube, não no jogador.

    O que funciona é casar pelo NOME dentro da Série B (o app guarda o abreviado em `n` e o
    completo em `nc`, e os dois entram no índice), e usar o clube só para desempatar homônimo.
    Assim os 40 resolvem, com um único desempate (Gegé, que existe no Goiás e no CRB)."""
    if not BASE_APP.exists():
        return {}
    dados = json.loads(BASE_APP.read_text(encoding="utf-8"))
    if isinstance(dados, dict):
        dados = dados.get("jogadores") or dados.get("lista") or []
    indice = {}
    for j in dados:
        # Brasil A e C entram junto: jogador da Série B de 2026 pode estar registrado numa
        # divisão diferente na base do app (subiu, desceu, ou a base é de outra data).
        if norma(j.get("l")) not in ("brasil a", "brasil b", "brasil c"):
            continue
        for campo in ("n", "nc"):
            nome = norma(j.get(campo))
            if nome:
                indice.setdefault(nome, []).append(j)
    return indice


def pk_do_app(j):
    return f"{j.get('n')} - {j.get('t')} - {j.get('l')}"


def numero(v, padrao=0.0):
    try:
        return float(str(v).strip())
    except (TypeError, ValueError):
        return padrao


def main():
    if not FUNIL.exists():
        print(f"falta {FUNIL} — rode o J06.py antes", file=sys.stderr)
        return 1
    linhas = list(csv.DictReader(FUNIL.open(encoding="utf-8")))

    # O MESMO predicado do funil do J06.py (degraus 2 a 4), na mesma ordem:
    #   livre na janela -> as duas fontes concordam no contrato -> minutagem regular.
    # `minutagem_alta` NÃO entra: o degrau do J06.py filtra só por `minutagem_regular`, e o corte
    # de minutos já é por posição (J05-3), então exigir as duas coisas derruba o atacante.
    def livre(r):
        return verdadeiro(r["livre_tm"]) or verdadeiro(r["livre_wy"])

    # Os 51 do J06-3 ("São só {oferta_livres_regulares} livres com rodagem em toda a Série B"):
    # livre na janela + minutagem regular. O degrau seguinte do funil — as duas fontes concordando
    # na data do contrato — não corta a lista aqui, vira uma COLUNA: são 40 dos 51, e esconder os
    # 11 faria a seção da tela contradizer a manchete do próprio cartão.
    sel = [r for r in linhas if livre(r) and verdadeiro(r["minutagem_regular"])]
    for r in sel:
        r["contrato_confirmado"] = "true" if verdadeiro(r["fontes_concordam"]) else "false"

    # Reconciliação com o que a parte publica. Falha fechada: divergiu, não grava.
    resumo = json.loads(RESUMO.read_text(encoding="utf-8"))
    oferta = resumo["oferta_por_posicao"]
    esperado = {s: oferta[s]["livres_regulares"] for s in oferta}
    obtido = {s: sum(1 for r in sel if r["setor"] == s) for s in oferta}
    esperado_conf = {s: oferta[s]["livres_regulares_com_confianca"] for s in oferta}
    obtido_conf = {s: sum(1 for r in sel
                          if r["setor"] == s and r["contrato_confirmado"] == "true") for s in oferta}
    if obtido != esperado or obtido_conf != esperado_conf:
        print("A lista NÃO bate com o J06_resumo.json e por isso não foi gravada:", file=sys.stderr)
        for s in ORDEM:
            if obtido.get(s, 0) != esperado.get(s, 0):
                print(f"  {s}: esta lista {obtido.get(s, 0)}, a parte publica {esperado.get(s, 0)}",
                      file=sys.stderr)
            if obtido_conf.get(s, 0) != esperado_conf.get(s, 0):
                print(f"  {s} (contrato confirmado): esta lista {obtido_conf.get(s, 0)}, "
                      f"a parte publica {esperado_conf.get(s, 0)}", file=sys.stderr)
        return 1

    sel.sort(key=lambda r: (ORDEM.index(r["setor"]) if r["setor"] in ORDEM else 99,
                            -numero(r["minutos"])))

    # O id do Transfermarkt, que é como o app reencontra cada um. Falha fechada: se algum dos
    # selecionados ficar sem id, a lista NÃO é gravada — lista que chega à tela pela metade, e em
    # silêncio, é exatamente o tipo de coisa que o portão de entrega existe para impedir.
    # O id do Transfermarkt vai junto quando existe, como referência para quem for conferir à mão
    # — mas NÃO é a chave: 5 dos 51 não o têm, e do lado do app só 31 dos 1.136 jogadores da
    # Série B o carregam. Quem manda é a `pk_app`, resolvida logo abaixo, e é ela que falha
    # fechada.
    ids = id_por_jogador()
    for r in sel:
        r["id_tm"] = ids.get((norma(r["jogador"]), norma(r["clube"]))) or ""

    # A chave com que o app reencontra cada um. Homônimo é desempatado pelo clube, e o que sobrar
    # ambíguo derruba a gravação: o CLAUDE.md manda listar caso ambíguo, nunca adivinhar.
    # A chave com que o app reencontra cada um. Quem não resolve de forma ÚNICA sai com pk_app
    # vazia e um motivo: a regra da casa ("Cruzamento de bases", no CLAUDE.md) é que caso ambíguo
    # é LISTADO, nunca adivinhado. Ele continua na lista, que é do estudo — só não vira link para
    # a linha do app, e a tela diz por quê.
    indice = chave_do_app()
    nao_casaram = []
    for r in sel:
        cand = list({id(x): x for x in indice.get(norma(r["jogador"]), [])}.values())
        motivo = ""
        if not cand:
            motivo = "não achei este nome na base do app"
        elif len(cand) > 1:
            alvo = norma_clube(r["clube"])
            perto = [x for x in cand
                     if alvo and (alvo in norma_clube(x.get("t")) or norma_clube(x.get("t")) in alvo)]
            if len(perto) == 1:
                cand = perto
            else:
                motivo = ("homônimo sem desempate: " +
                          ", ".join(sorted({str(x.get("t")) for x in cand})))
        if motivo:
            r["pk_app"] = ""
            r["motivo_sem_par"] = motivo
            nao_casaram.append(f"{r['jogador']} ({r['clube']}): {motivo}")
        else:
            r["pk_app"] = pk_do_app(cand[0])
            r["motivo_sem_par"] = ''

    with SAIDA_CSV.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=COLUNAS, extrasaction="ignore")
        w.writeheader()
        for r in sel:
            w.writerow(r)

    # A lista sai dividida por lado e por função, como a do ranking (a LISTA mora lá, para as
    # duas telas não divergirem). O `na_serie_b` continua sendo do SETOR — ele vem do
    # J06_resumo.json, que conta a oferta por setor —, e por isso o bloco dividido diz de quem é
    # esse denominador em vez de deixar “5 de 106” parecer 5 laterais esquerdos de 106.
    import J06_ranking  # noqa: E402  — só a tabela de blocos, nenhuma conta

    por_posicao = []
    for bloco_nome, s, codigos in J06_ranking.LISTA:
        conhecidos = {c for _, s2, cs in J06_ranking.LISTA if s2 == s and cs for c in cs}
        primeiro = next(n for n, s2, _ in J06_ranking.LISTA if s2 == s)

        def no_bloco(r, s=s, codigos=codigos, bloco_nome=bloco_nome,
                     conhecidos=conhecidos, primeiro=primeiro):
            if r["setor"] != s:
                return False
            if codigos is None:
                return True
            pos = (r.get("posicao") or "").strip()
            return pos in codigos or (pos not in conhecidos and bloco_nome == primeiro)

        gente = [r for r in sel if no_bloco(r)]
        por_posicao.append({
            "posicao": bloco_nome,
            "ficha_de": s,
            "quantos": len(gente),
            "com_a_ficha_inteira": sum(1 for r in gente if verdadeiro(r["atende_perfil"])),
            "com_contrato_confirmado": sum(1 for r in gente if r["contrato_confirmado"] == "true"),
            "na_serie_b": oferta[s]["na_serie_b"],
            "na_serie_b_de": s,
            "jogadores": [{
                "jogador": r["jogador"], "clube": r["clube"], "id_tm": r["id_tm"],
                "pk_app": r.get("pk_app") or None,
                "motivo_sem_par": r.get("motivo_sem_par") or None,
                # `nascido_em` do funil é o PAÍS de nascimento ("Brazil"), não a data — o nome
                # engana. Vai com o nome certo para ninguém tentar usá-lo como chave.
                "pais_de_nascimento": r.get("nascido_em") or None,
                # A chave com que o app reencontra o jogador é a mesma `primaryKey` dele,
                # "<nome> - <time> - <liga>" (static/app.js). Aqui vão as duas primeiras partes; a
                # liga o app completa. Casar por nome é o que há: o `id` da base muda a cada
                # regeração, e o funil não carrega id_tm nem primary_key.
                "setor": r["setor"], "posicao_wy": r["posicao"],
                "idade": numero(r["idade"], None), "minutos": numero(r["minutos"]),
                "jogos": numero(r["jogos"]), "fatia_pct": numero(r["fatia_pct"]),
                "temporadas_com_dado": r["temporadas_com_dado"],
                "lesao_dias": numero(r["lesao_dias"]),
                "estrangeiro": verdadeiro(r["estrangeiro"]),
                "contrato_confirmado": r["contrato_confirmado"] == "true",
                "atende_perfil": verdadeiro(r["atende_perfil"]),
                "violados": r["violados"],
                "indicadores_com_dado": r["indicadores_com_dado"],
            } for r in gente],
        })

    SAIDA_JSON.write_text(json.dumps({
        "gerado_por": "scripts/J06_livres.py",
        "gerado_em": resumo.get("gerado_em"),
        "o_que_e": "Livres na virada, contrato confirmado nas duas fontes, minutagem regular. "
                   "Terceiro degrau do funil do J06 — NÃO é lista de alvos: o backtest da §8.6 "
                   "não autorizou nome nenhum, e a ficha de perfil descreve quem subiu sem "
                   "prometer quem vai subir.",
        "total": len(sel),
        "com_a_ficha_inteira": sum(1 for r in sel if verdadeiro(r["atende_perfil"])),
        "com_contrato_confirmado": sum(1 for r in sel if r["contrato_confirmado"] == "true"),
        "sem_par_no_app": nao_casaram,
        "backtest_autorizou": resumo["veredito_do_backtest"]["passou"],
        "por_posicao": por_posicao,
    }, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    print(f"{SAIDA_CSV.name}: {len(sel)} jogadores"
          + (f" · {len(nao_casaram)} sem par único na base do app" if nao_casaram else ""))
    for x in nao_casaram:
        print(f"    sem par: {x}")
    for b in por_posicao:
        print(f"  {b['posicao']:9} {b['quantos']:2}  (de {b['na_serie_b']:3} na Série B"
              f" · {b['com_contrato_confirmado']} com contrato confirmado"
              f" · {b['com_a_ficha_inteira']} com a ficha inteira)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
