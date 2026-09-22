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

# O resolvedor de marcador e o mesmo do gerar_regras.py e do gerar_fisico.py: uma
# copia por pagina divergiria em silencio, e divergir aqui e numero sem conferencia.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _texto import numeros_da_parte, selo_da_conclusao, trocar  # noqa: E402

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
        "decisao": "Gastar em modelo de jogo antes de folha. O modelo são quatro coisas medidas, "
                   "nesta ordem: finalizar de mais perto, não ceder chance em casa, obrigar o "
                   "adversário a finalizar de fora da área e ganhar a dividida no chão FORA.",
        "porque": ("A dinheiro igual, cada uma paga — e o salto é pequeno em campo e grande na "
                   "tabela. Encurtar a distância média da própria finalização de "
                   "{A16.pior_dist_remate} m para {A16.melhor_dist_remate} m vale "
                   "{A16.ptsabs_dist_remate_pv_com} pontos na temporada. Baixar o gol esperado "
                   "sofrido em casa de {A16.pior_xgc_casa} para {A16.melhor_xgc_casa} por jogo "
                   "vale {A16.ptsabs_xgc_casa_pv_com}. Baixar o gol esperado por finalização "
                   "sofrida de {A16.pior_xg_por_remate_contra} para "
                   "{A16.melhor_xg_por_remate_contra} vale "
                   "{A16.ptsabs_xg_por_remate_contra_pv_com}. Ganhar a dividida no chão fora de "
                   "casa, de {A16.pior_dd_fora}% para {A16.melhor_dd_fora}%, vale "
                   "{A16.ptsabs_dd_fora_pv_com}. Para comparar: o mesmo salto de um quarto de "
                   "tabela no VALOR DO ELENCO paga {A16.ptsdin_dist_remate_pv_com} pontos e "
                   "custa {A16.degrau_eur} de euro."),
        "de": "A16", "conclusao": "A16-1",
        "ressalva": ("Três, e as três pesam. Primeira: NÃO é reduzir o número de finalizações do "
                     "adversário — o A15-1 mediu que o time que pontua sofre a mesma quantidade "
                     "de chute, de mais longe. Segunda: o estudo mede o que o traço RENDE, não o "
                     "que ele CUSTA; treinador, treino e jogador têm preço e não estão na conta. "
                     "Terceira: o A12-2 mediu que quem jogou como os que subiram SEM dinheiro "
                     "caiu mais do que subiu — a receita existe, mas quem a tentou com elenco "
                     "barato saiu pior."),
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
        "id": "D17", "grupo": "Modelo de jogo",
        "decisao": "Não dar ao treinador meta de estilo — cruzar mais, ter mais a bola, pressionar "
                   "mais alto — esperando que dali saia finalização de perto.",
        "porque": ("Dos {A17.testes} pares de jeito de jogar e chance boa, {A17.sobrevivem} "
                   "sobrevive aos dois cortes e {A17.porta_passam} vem antes da chance boa — e "
                   "não é o mesmo par. Nenhum dos {A17.n_preditores} jeitos de jogar medidos "
                   "cumpre os dois critérios: posse, passe longo, passe progressivo, ataque "
                   "posicional, contra-ataque, cruzamento, pressão alta, recuperação, "
                   "intensidade, dividida e bola parada."),
        "de": "A17", "conclusao": "A17-1",
        "ressalva": ("Não é \"a alavanca não existe\" — é \"ela não está entre estas "
                     "{A17.n_preditores}\". Treino, comissão técnica, escalação por rodada e bola "
                     "parada ensaiada não estão na base, e é ali que um treinador diria que ela "
                     "mora. O que a parte mostra é o mecanismo do engano: cruzar mais anda "
                     "{A17.rho_dist_remate_cruzamentos} com finalizar de perto ENTRE times e "
                     "{A17.jogo_dist_remate_cruzamentos} dentro do mesmo time, e anda "
                     "{A17.dinheiro_cruzamentos} com o valor do elenco. Regra prática: peça a "
                     "conta dentro do time antes de aceitar a conta entre times."),
    },
    {
        "id": "D18", "grupo": "Contratação",
        "decisao": "A dividida no chão volta à ficha — medida na TEMPORADA, nunca por jogo.",
        "porque": ("A fração de divididas ganhas num jogo é relacional: ela soma "
                   "{A18.h1_soma} com a do adversário no mesmo lance, e de um jogo para o outro "
                   "quem o time enfrentou explica {A18.h2_adv}% da variação contra "
                   "{A18.h2_clube}% de quem o time é. Na temporada, a média sobre trinta e oito "
                   "adversários cancela isso e o que sobra é o traço do time — que é o que o "
                   "A06-1 mede, e que a A16 precifica em ponto a dinheiro igual. E ele não vem "
                   "com o elenco caro: anda {A18.h4_rho} com o valor da folha."),
        "de": "A18", "conclusao": "A18-1",
        "ressalva": ("Não serve para julgar um jogo. Quem disser \"ganhamos pouca dividida "
                     "sábado\" está falando mais do adversário de sábado do que do time. E no "
                     "jogo que rende ponto o time DISPUTA mais dividida "
                     "({A18.d_duelos_def_n_pdc_com}) e ganha fração praticamente igual "
                     "({A18.d_duelos_def_pct_pdc_com}) — administrar resultado, não perder a "
                     "disputa."),
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
        "id": "D15", "grupo": "Contratação",
        "decisao": "Não pagar prêmio por número de corrida para a área.",
        "porque": ("A ponte entre o eixo do modelo e a ficha do jogador foi medida e não paga: de "
                   "{J10.testes_area} testes de corrida para a área por setor, "
                   "{J10.passam_area} separam o titular de quem sobe nos dois cortes. É a quarta "
                   "medida de jogador a dar negativo, depois do número técnico (J03-1), da "
                   "corrida por 90 (J04-1) e da ficha completa (J05-3)."),
        "de": "J10", "conclusao": "J10-1",
        "ressalva": ("\"Não separa\" aqui é \"este desenho não veria\": no volante os três "
                     "indicadores apontam para o lado certo — o maior é "
                     "{J10.dsm_volante_runs_dangerous_p30tip} — e ficam abaixo do mínimo "
                     "detectável de {J10.dminsm_volante_runs_dangerous_p30tip}, com "
                     "{J10.nsobe_volante} contra {J10.nmeio_volante}. Com mais temporadas "
                     "rastreadas a pergunta merece voltar, e a lista já está declarada de antes."),
    },
    {
        "id": "D16", "grupo": "Contratação",
        "decisao": "No volante, usar corrida forte e corrida longa como desempate.",
        "porque": ("É o único requisito de corrida que o estudo sustenta, e vale para uma posição "
                   "só. O volante de quem sobe faz {J10.sobe_volante_runs_above_hsr_p30tip} "
                   "corridas fortes por meia hora de posse contra "
                   "{J10.meio_volante_runs_above_hsr_p30tip} do meio, e cobre "
                   "{J10.sobe_volante_runs_avg_distance} m por corrida contra "
                   "{J10.meio_volante_runs_avg_distance}. O J04-2 já tinha achado sinal físico no "
                   "volante e em nenhuma outra posição."),
        "de": "J10", "conclusao": "J10-2",
        "ressalva": ("Desempate, nunca corte: o único filtro eliminatório continua sendo "
                     "minutagem alta e regular (D5). E os dois indicadores que passaram são da "
                     "família de CONTROLE da parte — é volume e alcance, não destino, o contrário "
                     "da hipótese que motivou a análise."),
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
        "decisao": "Não pagar por currículo de G4 nem por modelo de jogo. A lista de treinadores "
                   "serve para reduzir a conversa, e a escolha se faz por entrevista, comissão e "
                   "projeto.",
        "porque": ("Resultado de treinador vem colado ao elenco que ele pegou: quem trabalha em "
                   "clube do top-5 de valor entrega {T02.ct_top5_rod} rodadas no G4, contra "
                   "{T02.ct_baixo_rod} de quem trabalha nos {T02.ct_baixo_n} clubes mais baratos, "
                   "e {T02.ct_baixo_zero} desses nunca chegaram ao G4. E o histórico não viaja: "
                   "entre os {T04.t02_multi_fechadas} treinadores que passaram por dois clubes ou "
                   "mais, a diferença típica entre a melhor e a pior passagem é de "
                   "{T04.t02_amp_mediana_fechadas} pontos percentuais de tempo no G4, e o jeito "
                   "de jogar também não acompanha (T03)."),
        "de": "T04", "conclusao": "T04-2",
        "ressalva": ("OS NOMES, para reduzir a conversa e não para decidir. Pela pior passagem "
                     "lideram Paulo Pezzolano ({T04.pz_piso}% do tempo no G4) e Fábio Carille "
                     "({T04.ca_piso}%) — e cada um tem {T04.pz_pass} passagem só, em clube de "
                     "elenco {T04.pz_valor}º e {T04.ca_valor}º mais caro do ano, que é justamente "
                     "o viés medido acima. O 3º é Eduardo Baptista, {T04.eb_pass} passagens em "
                     "{T04.eb_cl} clubes e {T04.eb_rod} rodadas, o mais regular da base "
                     "({T04.eb_temps}) — e que nunca subiu; trocar a pior passagem pela média "
                     "leva-o de {T04.eb_piso}% a {T04.eb_med}% e já muda o terceiro lugar. Por "
                     "isso a regra do piso NÃO vira critério de escolha: o T04-1 mediu que ela "
                     "põe na frente quem nunca subiu e deixa de fora os dois que subiram com "
                     "clubes diferentes. A lista inteira, com as passagens de cada um, está em "
                     "T04_resumo.json."),
    },
]


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
