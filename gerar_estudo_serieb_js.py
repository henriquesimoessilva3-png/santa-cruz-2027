#!/usr/bin/env python3
"""Escreve static/estudo_serieb_dados.js — o Estudo Serie B do jeito que a aba le.

No molde do `gerar_bola_parada_js.py`: o dado entra por uma tag `<script>` antes do `app.js`,
para a aba nao abrir vazia com o Flask fora do ar. O `publicar_site.py` copia a pasta `static/`
inteira, mas de `dados/` so leva seis arquivos nomeados e nada de `_fonte/` — por isso TODO o
dado da aba tem de morar aqui dentro, e nao num JSON solto.

Entrada: `_fonte/estudo_serieb/resultados/<ID>.json`, um por parte respondida.
Saida:   `static/estudo_serieb_dados.js`.

## O roteiro

A aba existe desde antes das respostas: ela mostra as 29 perguntas do estudo com o status de
cada uma. Esse roteiro e espelho do `_fonte/estudo_serieb/CLAUDE.md` e vive aqui embaixo, em
ROTEIRO. Parte que ganhar um `<ID>.json` sem estar no roteiro faz o gerador reclamar, em vez de
sumir da tela.

## Os numeros nao sao digitados

As conclusoes vem com marcador (`"a mediana e de {mediana_efetivos} treinadores"`) e os valores
medidos em `numeros`. Aqui os marcadores sao trocados pelos valores. Marcador sem valor PARA o
gerador: numero de conclusao nao se digita a mao (regra "Texto e numero" do CLAUDE.md).

Uso:
    python3 gerar_estudo_serieb_js.py
"""
import datetime as dt
import glob
import json
import os
import re
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RESULTADOS = os.path.join(AQUI, "_fonte", "estudo_serieb", "resultados")
SAIDA = os.path.join(AQUI, "static", "estudo_serieb_dados.js")

# Espelho do _fonte/estudo_serieb/CLAUDE.md. (id, bloco, pergunta em uma linha)
# bloco: A = que time montar · T = que treinador buscar · J = quem contratar · E = tarefa de tela
ROTEIRO = [
    ("E00", "E", "Criar a aba Estudo Série B"),
    ("A01", "A", "Quantos pontos separam as faixas em cada temporada, e quão estável é esse corte?"),
    ("A02", "A", "A distância entre quem sobe e o meio está no que o time cria ou no que cede?"),
    ("A03", "A", "Quem sobe se diferencia ganhando fora ou dominando em casa?"),
    ("A04", "A", "Quanto da produção vem de bola parada, e isso separa quem sobe?"),
    ("A05", "A", "Existe estilo com bola que separa quem sobe, ou sobe-se com estilos opostos?"),
    ("A06", "A", "Quem sobe pressiona mais alto ou apenas cede menos finalização de qualidade?"),
    ("A07", "A", "Quem sobe corre mais no total ou corre mais forte?"),
    ("A08", "A", "Quem sobe perde menos intensidade do 1º para o 2º tempo e no fim do jogo?"),
    ("A09", "A", "Em que faixas de minutos cada faixa marca e sofre, e como reage ao placar?"),
    ("A10", "A", "Quem sobe sustenta a intensidade no returno e em sequências de jogos?"),
    ("A11", "A", "A intensidade vira ação e resultado?"),
    ("A12", "A", "Em quais réguas os promovidos se concentram, e o Cenário Barato se sustenta?"),
    ("A13", "A", "Quem cai já estava mal no 1º turno ou despencou no 2º?"),
    ("A14", "A", "Quais indicadores mais separam quem sobe, e onde 2026 está nessa régua?"),
    ("A15", "A", "O que um time faz num jogo que aumenta a chance de pontuar?"),
    ("A16", "A", "Dentro do que o dinheiro compra, qual traço dá mais ponto por real?"),
    ("A17", "A", "Que jeito de jogar produz a chance boa: finalizar de perto e ceder chance ruim?"),
    ("A18", "A", "A dividida no chão mede o time ou o adversário?"),
    ("A19", "A", "A formação do time muda o resultado do jogo?"),
    ("A20", "A", "O que separa é o titular médio ou ter um ou dois muito acima?"),
    ("J10", "J", "A corrida para dentro da área vira requisito de contratação por posição?"),
    ("J11", "J", "O titular de quem sobe corre proporcionalmente mais sem a bola?"),
    ("T01", "T", "Quem comandou cada time da Série B, em quais rodadas, de 2018 a 2026?"),
    ("T02", "T", "Quais treinadores mantêm seus times mais rodadas no G4?"),
    ("T03", "T", "Os times do treinador mostram os traços de quem sobe, em clubes diferentes?"),
    ("T04", "T", "Quais treinadores combinam resultado, perfil alinhado e consistência?"),
    ("J01", "J", "Quem tem minutagem alta e regular em cada posição, e quanto é lesão?"),
    ("J02", "J", "Quem sobe concentra os minutos em menos jogadores e mantém mais a base?"),
    ("J03", "J", "Como os titulares de quem sobe se comparam aos do meio, no técnico?"),
    ("J04", "J", "Em que posições os titulares de quem sobe se diferenciam fisicamente?"),
    ("J05", "J", "Quais 4 a 6 métricas definem o jogador ideal em cada posição?"),
    ("J06", "J", "Quais jogadores da Série B atendem o perfil de cada posição?"),
    ("J07", "J", "Quantos estrangeiros jogaram a Série B, e como renderam?"),
    ("J08", "J", "Como os números de um jogador de outra liga se traduzem para a Série B?"),
    ("J09", "J", "Quais estrangeiros atendem o perfil, depois do ajuste de liga?"),
    ("R01", "E", "Tirar Análise Série B e Protótipo da barra, sem apagá-las"),
]
SECOES = {"A": "Que time montar", "T": "Que treinador buscar", "J": "Quem contratar",
          "E": "Tarefas da tela"}

# Tarefa de tela nao entrega <ID>.json (nao tem conclusao), entao o status dela nao sai dos
# arquivos: fica aqui, com a data em que foi feita.
#
# R01 entrou em 20/09 e com ESCOPO MUDADO pelo dono, o que importa registrar: o PLANO pedia para
# APOSENTAR as abas Analise Serie B e Prototipo, e o que foi feito foi tira-las da barra e
# transforma-las em material auxiliar do Estudo, com link no alto. Nada foi apagado — elas sao a
# prova de onde muita conclusao veio. A pergunta do roteiro acima foi reescrita junto, porque
# "aposentar" deixou de ser verdade e roteiro que descreve errado o que foi feito e pior do que
# roteiro desatualizado.
TAREFAS_FEITAS = {"E00": "2026-09-17", "R01": "2026-09-20"}

CABECALHO = """/* GERADO POR gerar_estudo_serieb_js.py - NAO EDITE A MAO.

   O Estudo Serie B como a aba le: o roteiro das %d perguntas com o status de cada uma, e as
   conclusoes das partes ja respondidas, com os numeros ja trocados pelos valores medidos.

   Fonte: _fonte/estudo_serieb/resultados/*.json
   Para mudar um numero: mexa no <ID>.json da parte e rode `python3 gerar_estudo_serieb_js.py`.

   Gerado em: %s - partes respondidas: %s
*/
"""


def premissas_por_id():
    """{id -> {titulo, grupo}} de dados/premissas.json.

    O campo `premissa` da conclusão guarda o ID ("m2", "p20"), não o texto — e a aba imprimia o
    código cru, então 23 conclusões chegavam à tela dizendo "Premissa: m2", que não quer dizer
    nada para quem lê. Aqui o id vira título; o código segue junto, para quem quiser procurar."""
    caminho = os.path.join(AQUI, "dados", "premissas.json")
    if not os.path.exists(caminho):
        return {}
    with open(caminho, encoding="utf-8") as f:
        dados = json.load(f)
    if isinstance(dados, dict):
        dados = dados.get("premissas") or dados.get("lista") or []
    return {p.get("id"): {"titulo": p.get("titulo"), "grupo": p.get("grupo")}
            for p in dados if isinstance(p, dict) and p.get("id")}


def trocar(texto, numeros, onde, erros):
    """Troca {marcador} pelo valor medido. Marcador sem valor vira erro, nao vira texto."""
    def um(m):
        chave = m.group(1)
        if chave not in numeros:
            erros.append(f"{onde}: marcador {{{chave}}} não tem valor em `numeros`")
            return m.group(0)
        v = numeros[chave]
        if isinstance(v, float):
            return f"{v:.2f}".rstrip("0").rstrip(".").replace(".", ",")
        if isinstance(v, int):
            return f"{v:,}".replace(",", ".")
        return str(v)
    return re.sub(r"\{(\w+)\}", um, texto or "")


def resolver_grafico(g, numeros, onde, erros):
    """Resolve os marcadores do grafico em valores, como o trocar() faz com o texto.

    A aba nao calcula nada — nem o grafico. Se um marcador do grafico nao tiver valor,
    isso e erro aqui, do mesmo jeito que um marcador de texto sem valor: o gerador para.
    """
    if not g:
        return None

    def serie(s):
        if "valor" in s and s["valor"] is not None:
            return {"nome": s.get("nome"), "valor": s["valor"]}
        m = s.get("marcador")
        if m in numeros:
            return {"nome": s.get("nome"), "valor": numeros[m]}
        erros.append(f"{onde}: o grafico usa o marcador {{{m}}}, que nao esta em numeros")
        return {"nome": s.get("nome"), "valor": None}

    # O titulo e a unidade tambem passam pelo trocar(): sem isso nao da para escrever "A regua de
    # {n_ind} indicadores" na legenda, e o numero teria de ser digitado — que e exatamente o que a
    # regra "Texto e numero" do CLAUDE.md proibe. Legenda que nao diz o que a regua mede deixa o
    # leitor sem saber o que esta olhando; foi assim que o A14 chegou a tela.
    out = {"tipo": g.get("tipo"),
           "titulo": trocar(g.get("titulo"), numeros, onde + " / titulo do grafico", erros),
           "unidade": trocar(g.get("unidade"), numeros, onde + " / unidade do grafico", erros)}
    if g.get("series"):
        out["series"] = [serie(s) for s in g["series"]]
    if g.get("cortes"):
        out["cortes"] = [{"rotulo": c.get("rotulo"),
                          "series": [serie(s) for s in c.get("series", [])]}
                         for c in g["cortes"]]
    if g.get("linhas"):
        ls = []
        for l in g["linhas"]:
            it = {"nome": l.get("nome")}
            for lado in ("turno", "returno"):
                m = l.get(lado)
                if m in numeros:
                    it[lado] = numeros[m]
                else:
                    erros.append(f"{onde}: o grafico usa {{{m}}}, que nao esta em numeros")
                    it[lado] = None
            ls.append(it)
        out["linhas"] = ls
    if g.get("barras"):
        out["barras"] = [serie(b) for b in g["barras"]]
    lc = g.get("linha_de_corte")
    if lc is not None:
        # Ela tambem e um numero publicado: aceita marcador, como o resto do grafico, e so
        # segue como literal quando e mesmo um numero escrito (a §8.2 permite os dois).
        if isinstance(lc, str) and not re.fullmatch(r"-?[\d.,]+", lc.strip()):
            if lc in numeros:
                out["linha_de_corte"] = numeros[lc]
            else:
                erros.append(f"{onde}: a linha_de_corte usa o marcador {{{lc}}}, "
                             "que nao esta em numeros")
                out["linha_de_corte"] = None
        else:
            out["linha_de_corte"] = lc
    return out


def alvos_de_fora():
    """J09_alvos.csv, do jeito que a parte o escreve. O rotulo e' `rastrear`, nunca `alvo`."""
    caminho = os.path.join(RESULTADOS, "J09_alvos.csv")
    if not os.path.exists(caminho):
        return None
    import csv
    def num(v):
        try:
            return float(v)
        except (TypeError, ValueError):
            return None
    fora = []
    with open(caminho, encoding="utf-8") as fh:
        for r in csv.DictReader(fh):
            fora.append({
                "jogador": r.get("jogador"), "setor": r.get("setor"),
                "posicao": r.get("posicao"), "clube": r.get("time"), "liga": r.get("liga"),
                "idade": num(r.get("idade")), "minutos": num(r.get("minutos")),
                "fatia_pct": num(r.get("fatia_pct")), "contrato": r.get("contrato") or "",
                "nascido_em": r.get("nascido_em") or "",
                "estrangeiro": r.get("ocupa_vaga_de_estrangeiro") in ("True", "true", "1"),
                "forca_do_fator": r.get("forca_do_fator") or "",
                "casos_do_fator": num(r.get("casos_do_fator")),
                "criterios": r.get("indicadores_com_dado"),
                "exigencias": r.get("exigencias_da_posicao"),
                "passa_origem": r.get("passa_ficha_origem") in ("True", "true", "1"),
                "passa_ajustado": r.get("passa_ficha_ajustado") in ("True", "true", "1"),
                "viola_no_ajustado": r.get("viola_no_ajustado") or "",
                "fisico": r.get("fisico_rastreado") in ("True", "true", "1"),
            })
    return fora or None


def main():
    por_id, erros = {}, []
    premissas = premissas_por_id()
    for caminho in sorted(glob.glob(os.path.join(RESULTADOS, "*.json"))):
        nome = os.path.basename(caminho)
        if nome.startswith("_") or "_" in nome[:-5]:
            continue  # T01_clubes.json, T01_lacunas.json e afins nao sao entrega de parte
        with open(caminho, encoding="utf-8") as f:
            por_id[nome[:-5]] = json.load(f)

    ids_roteiro = {i for i, _, _ in ROTEIRO}
    for pid in por_id:
        if pid not in ids_roteiro:
            erros.append(f"{pid}.json existe mas {pid} não está no ROTEIRO deste gerador")

    partes, validadas, negativas = [], [], []
    for pid, bloco, pergunta in ROTEIRO:
        d = por_id.get(pid)
        concl = []
        for c in (d or {}).get("conclusoes", []):
            numeros = d.get("numeros", {})
            onde = f"{pid} / {c.get('id', '?')}"
            item = {
                "id": c.get("id"), "parte": pid, "bloco": bloco,
                "manchete": trocar(c.get("manchete"), numeros, onde, erros),
                "o_que_vimos": trocar(c.get("o_que_vimos"), numeros, onde, erros),
                "para_o_santa_cruz": trocar(c.get("para_o_santa_cruz"), numeros, onde, erros),
                "premissa": c.get("premissa"),
                "premissa_titulo": (premissas.get(c.get("premissa")) or {}).get("titulo"),
                "premissa_grupo": (premissas.get(c.get("premissa")) or {}).get("grupo"),
                # A tela MOSTRA o premissa_motivo (o bloco "Premissa:"), então ele passa pelo
                # trocar() como o resto. Enquanto não passava, todo número dentro dele era
                # digitado à mão por construção — e foi assim que o J07-2 ficou anunciando um
                # empate de 16,6% contra 16,5% depois que o número virou 17,5.
                "premissa_motivo": trocar(c.get("premissa_motivo"), numeros,
                                          onde + " / premissa_motivo", erros),
                "confianca": c.get("confianca"),
                "confianca_motivo": trocar(c.get("confianca_motivo"), numeros, onde, erros),
                "n": trocar(c.get("n"), numeros, onde, erros),
                "prova": c.get("prova"), "status": c.get("status", "rascunho"),
                "negativa": bool(c.get("negativa")),
                "grafico": resolver_grafico(c.get("grafico"), numeros, onde, erros),
            }
            concl.append(item)
            if item["negativa"]:
                negativas.append(item)
            elif item["status"] == "validada":
                validadas.append(item)
        if bloco == "E":
            status = "feita" if pid in TAREFAS_FEITAS else "pendente"
        elif not d:
            status = "pendente"
        elif any(c["status"] == "validada" for c in concl):
            status = "validada"
        else:
            status = "rascunho"
        partes.append({
            "id": pid, "bloco": bloco, "secao": SECOES[bloco], "pergunta": pergunta,
            "status": status, "titulo": (d or {}).get("titulo"),
            "tipo": (d or {}).get("tipo"), "conclusoes": concl,
            # Idem: "Em aberto" é texto de tela, e números nele envelhecem em silêncio.
            "em_aberto": trocar((d or {}).get("em_aberto"), (d or {}).get("numeros", {}),
                                f"{pid} / em_aberto", erros),
            "feita_em": TAREFAS_FEITAS.get(pid),
            "prova_arquivos": (d or {}).get("gerado_por"),
        })

    if erros:
        print("O gerador PAROU. Conserte e rode de novo:", file=sys.stderr)
        for e in erros:
            print("  -", e, file=sys.stderr)
        sys.exit(1)

    # A lista nominal que a base sustenta (scripts/J06_livres.py). Entra na aba como seção
    # própria, com o rótulo que ela tem no arquivo: NÃO é lista de alvos — o backtest da §8.6 não
    # autorizou nome nenhum. Se o arquivo não existir, a seção simplesmente não aparece.
    livres = None
    caminho_livres = os.path.join(RESULTADOS, "J06_livres_regulares.json")
    if os.path.exists(caminho_livres):
        with open(caminho_livres, encoding="utf-8") as f:
            livres = json.load(f)
        if livres.get("backtest_autorizou"):
            erros.append("J06_livres_regulares.json diz que o backtest autorizou: "
                         "se isso virou verdade, a seção da aba tem de deixar de dizer que não")

    # A lista inteira de treinadores do T04, aberta na tela. Ela ORDENA O QUE ACONTECEU e não diz
    # quem é melhor: as duas premissas que sustentariam a leitura como previsão falharam (T02, o
    # histórico de G4 não se transfere entre clubes; T03, o perfil de jogo não é traço do
    # treinador). Vai com os dois critérios lado a lado — a média e o piso — porque trocar um pelo
    # outro muda o pódio, e essa instabilidade É o achado da parte.
    treinadores = None
    caminho_t04 = os.path.join(RESULTADOS, "T04_resumo.json")
    if os.path.exists(caminho_t04):
        with open(caminho_t04, encoding="utf-8") as f:
            t04 = json.load(f)
        if t04.get("lista_completa"):
            treinadores = {
                "criterio": t04.get("criterio"),
                "premissas_que_falharam": t04.get("premissas_que_falharam"),
                "min_rodadas_total": t04.get("min_rodadas_total"),
                "lista": t04["lista_completa"],
            }

    # A régua do A14, peça por peça. A aba mostrava só a nota final por faixa, com a legenda
    # "A régua, por faixa · 0 a 100", e nada dizia DE QUE ela é feita — o leitor não tinha como
    # saber o que estava olhando. Aqui vão as sete peças, o tamanho de efeito de cada uma e o que
    # foi descartado por medir a mesma coisa que outra.
    regua = None
    caminho_a14 = os.path.join(RESULTADOS, "A14_resumo.json")
    if os.path.exists(caminho_a14):
        with open(caminho_a14, encoding="utf-8") as f:
            a14 = json.load(f)
        if a14.get("indice"):
            regua = {
                "indice": a14["indice"],
                "candidatos": a14.get("candidatos") or [],
                "descartados": a14.get("descartados_por_redundancia") or [],
                "fora_por_ser_consequencia": a14.get("fora_por_ser_consequencia") or [],
            }

    # A lista por posição ordenada por ADERÊNCIA à ficha (scripts/J06_ranking.py). Existe porque a
    # ficha é uma conjunção de 4 a 6 pisos e responde "quem é perfeito", jogando fora a informação
    # de quão perto cada um está — que é o que serve para montar elenco.
    ranking = None
    caminho_rk = os.path.join(RESULTADOS, "J06_ranking_aderencia.json")
    if os.path.exists(caminho_rk):
        with open(caminho_rk, encoding="utf-8") as f:
            ranking = json.load(f)

    dado = {
        "gerado_em": dt.date.today().isoformat(),
        "partes": partes,
        "elenco_livre": livres,
        "treinadores": treinadores,
        "regua": regua,
        "ranking": ranking,
        # A pagina de decisoes, gerada por scripts/gerar_decisoes.py. Ela vem PRONTA: os
        # numeros ja foram resolvidos la, contra os <ID>_numeros.json, e aquele script falha
        # quando um marcador nao existe. Aqui so se carrega.
        "decisoes": json.load(open(os.path.join(RESULTADOS, "_decisoes.json"), encoding="utf-8"))
                    if os.path.exists(os.path.join(RESULTADOS, "_decisoes.json")) else None,
        # As regras de leitura (scripts/gerar_regras.py) e a secao de fisico
        # (scripts/gerar_fisico.py). Mesmo contrato das decisoes: vem prontas, com os numeros ja
        # resolvidos contra os <ID>_numeros.json, e o gerador de la falha se um marcador sumir.
        # Os nomes que o J09 publica com o rotulo `rastrear`. Ate 22/09 o arquivo nao existia:
        # a parte passava de zero nome, e por isso a aba nunca precisou le-lo. Depois do
        # conserto da chave do painel temporal ela passou a publicar 4 — e nome publicado que
        # nao chega a tela e' nome que nao existe para quem decide.
        "alvos_fora": alvos_de_fora(),
        "regras": json.load(open(os.path.join(RESULTADOS, "_regras.json"), encoding="utf-8"))
                  if os.path.exists(os.path.join(RESULTADOS, "_regras.json")) else None,
        "fisico": json.load(open(os.path.join(RESULTADOS, "_fisico.json"), encoding="utf-8"))
                  if os.path.exists(os.path.join(RESULTADOS, "_fisico.json")) else None,
        "validadas": validadas[:7],   # "O que decidimos" mostra ate 7
        "negativas": negativas,
        "contagem": {
            "total": sum(1 for p in partes if p["bloco"] != "E"),
            "pendente": sum(1 for p in partes if p["status"] == "pendente" and p["bloco"] != "E"),
            "rascunho": sum(1 for p in partes if p["status"] == "rascunho"),
            "validada": sum(1 for p in partes if p["status"] == "validada"),
        },
    }
    respondidas = ", ".join(sorted(por_id)) or "nenhuma ainda"
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, "w", encoding="utf-8") as f:
        f.write(CABECALHO % (len(ROTEIRO), dado["gerado_em"], respondidas))
        f.write("const ESTUDO_SERIEB = ")
        json.dump(dado, f, ensure_ascii=False, indent=1)
        f.write(";\n")
    c = dado["contagem"]
    print(f"{SAIDA}")
    print(f"  {c['total']} perguntas: {c['validada']} validadas, {c['rascunho']} em rascunho, "
          f"{c['pendente']} pendentes")
    print(f"  partes respondidas: {respondidas}")


if __name__ == "__main__":
    main()
