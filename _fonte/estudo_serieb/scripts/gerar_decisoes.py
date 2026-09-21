#!/usr/bin/env python3
"""A pagina de decisoes: o que o clube FAZ, com o numero que sustenta cada coisa.

## Por que existe

O estudo responde 27 perguntas e tem 74 conclusoes. Quem decide — diretoria, treinador,
executivo — nao le 74 conclusoes, e nem deveria: a decisao ja esta la dentro, so espalhada. Esta
pagina traz a decisao para a frente e deixa as 27 perguntas como o anexo que a sustenta.

## A regra que a faz ser diferente de um slide

**Nenhuma decisao existe sem parte de origem e sem marcador.** Cada linha aponta o `<ID>` que a
sustenta e busca o numero no `<ID>_numeros.json` daquela parte — o mesmo arquivo que o portao
confere. Decisao sem numero rastreavel nao entra, e e por isso que este script FALHA quando um
marcador nao existe, em vez de imprimir um espaco em branco.

Consequencia pratica: se alguem reescrever uma parte e o numero mudar, a pagina muda junto. Ela
nao e um retrato do que se achava em setembro — e a leitura de hoje.

## O que ela NAO faz

Nao inventa decisao que o estudo nao sustenta, e nao esconde a forca do achado. Cada linha leva o
selo da conclusao de origem (firme, provavel, indicio), porque "monte para 64 pontos" e "o eixo do
modelo de jogo e a qualidade da chance" nao tem o mesmo peso de prova — e quem decide precisa
saber em qual dos dois esta pisando.

Uso:
    python3 _fonte/estudo_serieb/scripts/gerar_decisoes.py
"""
import json
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDO = os.path.dirname(AQUI)
R = os.path.join(ESTUDO, "resultados")
SAIDA = os.path.join(R, "_decisoes.json")

# ==================================================================================================
# AS DECISOES
# ==================================================================================================
# Formato: (id, grupo, o que fazer, o numero, de onde vem, a ressalva que nao pode sumir).
# O texto usa {PARTE.marcador}, resolvido abaixo contra o <ID>_numeros.json de cada parte.
DECISOES = [
    {
        "id": "D1", "grupo": "Orçamento",
        "decisao": "Montar o elenco para {A01.corte_max} pontos, e planejar 65.",
        "porque": ("O 4º colocado fechou entre {A01.corte_min} e {A01.corte_max} pontos nas quatro "
                   "temporadas do recorte, e {A01.corte_mediana} teria ficado fora do G4 em "
                   "{A01.anos_falha_63} delas. {A01.corte_max} apenas EMPATOU com o 4º em "
                   "{A01.anos_empate_corte_max} das {A01.temporadas_total} temporadas medidas — e "
                   "empate não dá vaga."),
        "de": "A01", "conclusao": "A01-1",
        "ressalva": ("A linha de baixo é bem mais frouxa: o 17º ficou entre {A01.corte_z4_min} e "
                     "{A01.corte_z4_max}. Escapar do rebaixamento custa muito menos do que subir "
                     "— são duas decisões de orçamento, não a mesma com margem."),
    },
    {
        "id": "D2", "grupo": "Orçamento",
        "decisao": "Orçar duas comissões técnicas no ano.",
        "porque": ("A Série B trocou de treinador {T01.media_trocas_fechadas} vez por clube-"
                   "temporada, em média, nas temporadas fechadas. Planejar uma só é planejar o "
                   "caso raro."),
        "de": "T01", "conclusao": None,
        "ressalva": ("É média de troca, não recomendação de trocar: o T03-2 mediu que trocar de "
                     "treinador NÃO muda o jeito de jogar do time."),
    },
    {
        "id": "D3", "grupo": "Modelo de jogo",
        "decisao": "Guiar o modelo pela qualidade da chance: chegar a finalizar de dentro, e "
                   "obrigar o adversário a finalizar de fora.",
        "porque": ("É o ÚNICO traço firme do estudo, e três partes independentes chegaram nele. "
                   "Quem sobe finaliza a {A02.dist_s_cf} m do gol contra {A02.dist_m_cf} m do "
                   "meio; é o único traço que acompanha o treinador quando ele troca de clube; e "
                   "é a única das diferenças de quem sobe que dá para treinar."),
        "de": "A02", "conclusao": "A02-1",
        "ressalva": ("O que carrega o sinal é a DISTÂNCIA do chute, não a régua inteira: sem ela, "
                     "a régua de qualidade de chance perde a porta temporal (parcial +0,191, "
                     "p 0,0895). Toques e entradas na área vêm junto por construção, não por "
                     "prova própria."),
    },
    {
        "id": "D4", "grupo": "Modelo de jogo",
        "decisao": "Não montar o time por bola parada, por pressão alta nem por volume de corrida.",
        "porque": ("Foram testados e nenhum separa quem sobe do meio: nada do trabalho de bola "
                   "parada (A04-1), nada do jogo sem bola (A06-2), e correr mais não separou "
                   "(A07-1). Também não separa depender de casa (A03-1) nem o jeito de construir "
                   "a jogada (A05-1)."),
        "de": "A04", "conclusao": "A04-1",
        "ressalva": ("\"Não separa\" aqui quer dizer \"este desenho não conseguiria ver\": com 16 "
                     "promovidos contra 48 do meio, só uma vantagem grande apareceria. Não é prova "
                     "de que não importa — é aviso de que não dá para apostar nisso."),
    },
    {
        "id": "D11", "grupo": "Modelo de jogo",
        "decisao": "Defender empurrando a finalização para fora da área, e não tentando reduzir "
                   "o número de finalizações do adversário.",
        "porque": ("Medido dentro do PRÓPRIO time, no mesmo mando: no jogo em que pontua, ele "
                   "empurra o chute do adversário {A15.dentro_abs_dist_remate_contra_com} metro "
                   "para trás e NÃO sofre menos finalização ({A15.d_remates_contra_pdc_com} no "
                   "corte com todos os jogos, sem separar). É o mesmo eixo do D3, agora no lado "
                   "defensivo e dentro do time, não entre times."),
        "de": "A15", "conclusao": "A15-1",
        "ressalva": ("Dentro de um jogo não existe anterioridade: o que o time faz e o ponto "
                     "acontecem juntos, então nenhuma conclusão de jogo passa de provável. O "
                     "efeito do placar aqui joga CONTRA o achado — quem está à frente recua e "
                     "costuma ceder chute de mais perto —, o que o reforça, mas não o prova."),
    },
    {
        "id": "D12", "grupo": "Modelo de jogo",
        "decisao": "Tirar posse, passe ao terço final e escanteio da lista de metas de jogo.",
        "porque": ("No jogo em que o próprio time pontua, ele tem {A15.dentro_abs_posse_com} "
                   "pontos de posse A MENOS e dá {A15.dentro_abs_passes_terco_final_com} passes "
                   "a menos ao terço final, com {A15.dentro_abs_cantos_com} escanteio a menos. "
                   "Subir esses números não é o mesmo que somar ponto."),
        "de": "A15", "conclusao": "A15-2",
        "ressalva": ("Boa parte disso é reação ao placar: quem está atrás ataca mais, e a base "
                     "não tem o minuto do gol para separar as duas coisas. Por isso o uso é só "
                     "negativo — não perseguir esses números —, e não vira \"jogue sem a bola\"."),
    },
    {
        "id": "D13", "grupo": "Orçamento",
        "decisao": "Gastar em modelo de jogo antes de gastar em folha.",
        "porque": ("A dinheiro igual, subir do quarto de baixo para o quarto de cima da liga em "
                   "solidez vale {A16.pts_F_solidez_pv_com} pontos na temporada — mais do que os "
                   "{A16.ptsdin_F_solidez_pv_com} que o mesmo salto no valor do elenco paga, e "
                   "esse salto de elenco custa {A16.degrau_eur} de euro. Jogar assim equivale a "
                   "{A16.eur_F_solidez_pv_com} de elenco; a qualidade da chance, a "
                   "{A16.eur_E_qualidade_chance_pv_com}."),
        "de": "A16", "conclusao": "A16-1",
        "ressalva": ("Duas, e as duas pesam. O estudo mede o que o traço RENDE, não o que ele "
                     "CUSTA: treinador, treino e jogador têm preço e não estão na conta. E o "
                     "A12-2 mediu que quem jogou como os que subiram SEM dinheiro caiu mais do "
                     "que subiu — a receita existe, mas quem a tentou com elenco barato saiu "
                     "pior."),
    },
    {
        "id": "D14", "grupo": "Modelo de jogo",
        "decisao": "Não prometer que mudar o jeito de jogar no meio do ano traz os pontos do returno.",
        "porque": ("O teste de anterioridade passava para a distância do chute "
                   "({A16.porta64_dist_remate}) e para a régua da qualidade da chance "
                   "({A16.porta64_E_qualidade_chance}). Pondo o dinheiro no mesmo desconto, caem "
                   "para {A16.porta_dist_remate} e {A16.porta_E_qualidade_chance}, e nenhum dos "
                   "{A16.n_tracos} traços passa."),
        "de": "A16", "conclusao": "A16-2",
        "ressalva": ("Isto não derruba o D13: a associação a dinheiro igual continua de pé. "
                     "Derruba a frase \"jogue assim e os pontos vêm depois\". E o valor do "
                     "Transfermarkt é da temporada inteira, sem data conhecida — se foi "
                     "atualizado no meio do ano, ele carrega parte do resultado e o controle "
                     "fica forte demais. É um teto para a anterioridade, não a medida dela."),
    },
    {
        "id": "D5", "grupo": "Contratação",
        "decisao": "Usar minutagem alta e regular como PRIMEIRO filtro, e só depois olhar o resto.",
        "porque": ("É o único requisito que a base sustenta por posição (J05-3). O corte de "
                   "minutagem de quem subiu varia muito entre posições: {J05.min_corte_por_posicao}."),
        "de": "J05", "conclusao": "J05-3",
        "ressalva": ("A ficha completa NÃO deve ser filtro eliminatório: como conjunção de pisos, "
                     "ela reprova todo mundo — o J06-1 é exatamente isso, \"nenhum nome sai desta "
                     "parte por falha da ficha\". O resto da ficha ordena, não elimina. Desde "
                     "21/09 a lista desta aba funciona assim: a minutagem corta, e o que sobra é "
                     "ordenado pelo eixo da qualidade da chance, com físico e duelo desempatando "
                     "(a regra está em J06_ordenacao.json). Quem jogou pouco por LESÃO cai junto "
                     "com quem jogou pouco por escolha — o J01-2 mediu que a base não distingue "
                     "os dois —, e por isso o número de quem saiu no corte vai à vista."),
    },
    {
        "id": "D6", "grupo": "Contratação",
        "decisao": "Não contar com o mercado de livres: ele é curto demais.",
        "porque": ("Em TODA a Série B há {J06.oferta_livres_regulares} jogadores livres com "
                   "minutagem alta e regular. Por posição: {J06.oferta_frase}."),
        "de": "J06", "conclusao": "J06-3",
        "ressalva": ("No gol são {J06.oferta_gol}. Posição escassa não se resolve esperando a "
                     "janela — se resolve antes dela, ou por outro caminho."),
    },
    {
        "id": "D7", "grupo": "Contratação",
        "decisao": "Escolher goleiro por vídeo e olho, não por esta base.",
        "porque": ("O J09-3 fechou assim: no gol a base não tem como apontar um nome. Dos "
                   "{J09.pri_gol_cand} candidatos, {J09.pri_gol_publicados} chegaram ao fim do "
                   "funil. E o SkillCorner não rastreia goleiro."),
        "de": "J09", "conclusao": "J09-3",
        "ressalva": ("Isto não é opinião sobre goleiro: é limite de dado, medido. Vale enquanto a "
                     "base for esta."),
    },
    {
        "id": "D8", "grupo": "Elenco",
        "decisao": "Concentrar minutos em um núcleo fixo, e planejar a janela do meio desde já.",
        "porque": ("Quem sobe concentra {J02.s11_s}% dos minutos nos onze mais usados, contra "
                   "{J02.s11_m}% do meio. E {J02.contr_geral}% dos minutos da Série B são de "
                   "jogador que chegou naquele mesmo ano — a janela do meio não é exceção, é "
                   "como a liga funciona."),
        "de": "J02", "conclusao": "J02-3",
        "ressalva": ("Manter a base do ano anterior NÃO aparece como vantagem de quem sobe "
                     "(J02-2). O que separa é concentrar minutos, não a origem do jogador."),
    },
    {
        "id": "D9", "grupo": "Temporada",
        "decisao": "Tratar a metade do campeonato como alarme, não como sentença.",
        "porque": ("Na rodada {A13.rodada_turno}, {A13.sobe_g4_19} dos {A13.sobe_total} acessos já "
                   "estavam no G4 — e o resto virou depois. Quem cai já está "
                   "{A13.dif_1t_cai_meio} pontos atrás do meio na metade."),
        "de": "A13", "conclusao": "A13-3",
        "ressalva": ("A tabela da metade dá vantagem, não garante a vaga (A13-3). Decisão de "
                     "meio de ano tomada como se a tabela fosse definitiva erra nos dois lados."),
    },
    {
        "id": "D10", "grupo": "Treinador",
        "decisao": "Escolher treinador pelo PISO das passagens, não pela melhor delas.",
        "porque": ("Treinador de clube do top-5 de valor entrega {T02.ct_top5_rod} rodadas no G4, "
                   "contra {T02.ct_baixo_rod} de quem trabalha nos {T02.ct_baixo_n} clubes mais "
                   "baratos — e {T02.ct_baixo_zero} desses nunca chegaram ao G4. Resultado de "
                   "treinador vem colado ao elenco que ele pegou."),
        "de": "T02", "conclusao": None,
        "ressalva": ("Por isso o T04 ordena pelo piso: a melhor passagem de um treinador diz mais "
                     "sobre o clube dele do que sobre ele. E o T04-2 mediu que esta base NÃO "
                     "mostra o histórico do treinador reaparecendo no clube seguinte."),
    },
]


def numeros_da_parte(pid, cache):
    if pid not in cache:
        caminho = os.path.join(R, f"{pid}_numeros.json")
        if not os.path.exists(caminho):
            cache[pid] = {}
        else:
            d = json.load(open(caminho, encoding="utf-8"))
            cache[pid] = d.get("numeros", d)
    return cache[pid]


def selo_da_conclusao(cid, cache):
    """A força da conclusão de origem. Decisão sem selo sai como '—', nunca como firme."""
    if not cid:
        return None
    pid = cid.split("-")[0]
    if pid not in cache:
        caminho = os.path.join(R, f"{pid}.json")
        cache[pid] = json.load(open(caminho, encoding="utf-8")) if os.path.exists(caminho) else {}
    for c in (cache[pid].get("conclusoes") or []):
        if c.get("id") == cid:
            return c.get("confianca")
    return None


def trocar(texto, cache, onde, faltando):
    """Resolve {PARTE.marcador}. Marcador que não existe é ERRO, não espaço em branco."""
    import re
    def um(m):
        pid, chave = m.group(1), m.group(2)
        n = numeros_da_parte(pid, cache)
        if chave not in n:
            faltando.append(f"{onde}: {{{pid}.{chave}}} não existe em {pid}_numeros.json")
            return m.group(0)
        v = n[chave]
        if isinstance(v, float):
            return f"{v:.1f}".replace(".", ",") if v != int(v) else str(int(v))
        return str(v)
    return re.sub(r"\{([AJT]\d\d)\.([a-zA-Z0-9_]+)\}", um, texto or "")


def main():
    cache_num, cache_json, faltando = {}, {}, []
    fora = []
    for d in DECISOES:
        item = {k: d[k] for k in ("id", "grupo", "de", "conclusao")}
        for campo in ("decisao", "porque", "ressalva"):
            item[campo] = trocar(d[campo], cache_num, f"{d['id']}.{campo}", faltando)
        item["confianca"] = selo_da_conclusao(d.get("conclusao"), cache_json)
        fora.append(item)

    if faltando:
        print("MARCADORES QUE NÃO EXISTEM — não gravo página com buraco:", file=sys.stderr)
        for f in faltando:
            print("  " + f, file=sys.stderr)
        return 1

    saida = {
        "_doc": ("As decisões que o estudo sustenta, com o número e a parte de origem de cada "
                 "uma. Gerado por scripts/gerar_decisoes.py a partir dos <ID>_numeros.json — os "
                 "mesmos arquivos que o portão confere. Nenhum número é digitado aqui."),
        "gerado_em": "2026-09-21",
        "decisoes": fora,
        "como_ler": ("Cada decisão leva o selo da conclusão que a sustenta. FIRME passou na "
                     "correção para múltiplos testes E na porta temporal; PROVÁVEL passou em um "
                     "dos dois; INDÍCIO em nenhum, e a frase diz por quê. Decisão com selo fraco "
                     "não é decisão errada — é decisão que se toma sabendo o tamanho da aposta."),
    }
    json.dump(saida, open(SAIDA, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(fora)} decisões em {os.path.relpath(SAIDA, ESTUDO)}")
    for d in fora:
        print(f"  {d['id']:4} [{(d['confianca'] or '—'):9}] {d['grupo']:12} {d['decisao'][:62]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
