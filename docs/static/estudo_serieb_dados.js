/* GERADO POR gerar_estudo_serieb_js.py - NAO EDITE A MAO.

   O Estudo Serie B como a aba le: o roteiro das 31 perguntas com o status de cada uma, e as
   conclusoes das partes ja respondidas, com os numeros ja trocados pelos valores medidos.

   Fonte: _fonte/estudo_serieb/resultados/*.json
   Para mudar um numero: mexa no <ID>.json da parte e rode `python3 gerar_estudo_serieb_js.py`.

   Gerado em: 2026-09-21 - partes respondidas: A01, A02, A03, A04, A05, A06, A07, A08, A09, A10, A11, A12, A13, A14, A15, A16, J01, J02, J03, J04, J05, J06, J07, J08, J09, T01, T02, T03, T04
*/
const ESTUDO_SERIEB = {
 "gerado_em": "2026-09-21",
 "partes": [
  {
   "id": "E00",
   "bloco": "E",
   "secao": "Tarefas da tela",
   "pergunta": "Criar a aba Estudo Série B",
   "status": "feita",
   "titulo": null,
   "tipo": null,
   "conclusoes": [],
   "em_aberto": "",
   "feita_em": "2026-09-17",
   "prova_arquivos": null
  },
  {
   "id": "A01",
   "bloco": "A",
   "secao": "Que time montar",
   "pergunta": "Quantos pontos separam as faixas em cada temporada, e quão estável é esse corte?",
   "status": "validada",
   "titulo": "A régua: o que separa as faixas, 2022 a 2026",
   "tipo": "base",
   "conclusoes": [
    {
     "id": "A01-1",
     "parte": "A01",
     "bloco": "A",
     "manchete": "Elenco de 63 pontos teria ficado fora do G4 em 2 das 4 temporadas",
     "o_que_vimos": "O 4º fechou com 62 (2022), 64 (2023), 64 (2024) e 62 (2025), com 16 a 19 vitórias; em 2026 vai em ritmo de 66. Um elenco de 63 pontos teria ficado fora do G4 em 2 das 4 temporadas do recorte. Nas quatro anteriores, fora dele, o corte variou mais e 63 falhou em 2021.",
     "para_o_santa_cruz": "Montar o elenco contra 64 pontos, e não contra os 63 do meio da faixa: 63 não teria subido em 2023, em 2024 nem em 2021. E como 64 apenas empatou com o 4º em 3 dessas 8 temporadas, quem quer sair do desempate planeja 65 — uma vitória a mais. A linha de baixo é bem mais frouxa — o 17º ficou entre 38 e 42 no recorte e entre 39 e 43 nas quatro anteriores —, então escapar do rebaixamento custa bem menos do que subir: são duas decisões de orçamento diferentes, não a mesma com margem.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere premissa nova em dados/premissas.json, grupo Elenco: o custo do acesso é de 62 a 64 pontos nas quatro temporadas do recorte (60 a 64 nas oito que a base tem) e o planejamento usa o topo da faixa, 64, com 65 como folga de desempate — nunca a mediana. Nenhuma premissa atual fixa o acesso em pontos; a p7 fixa só o objetivo.",
     "confianca": "indício",
     "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios da régua. (1) Correção para múltiplos testes (Benjamini-Hochberg a 5% por família): não há o que corrigir — não existe A01_testes.csv e scripts/A01.py não importa scripts/_metodo.py; as únicas contas da parte são contagem e mediana sobre os pontos do 4º e do 17º. (2) Porta temporal da §6.4 (1º turno prevendo o 2º): não rodou em A01, e _porta_temporal.md registra que nenhuma das 19 partes a rodou. Há ainda motivo material: a faixa de 62 a 64 é propriedade das 4 temporadas do recorte — nas quatro anteriores o corte vai de 60 a 64, e o ritmo de 2026 está em 66. O que saiu do que vimos e fica registrado aqui, onde o jargão é permitido: a conclusão é contagem completa das tabelas, sem teste e sem leitura à frente do resultado, e por isso não há tamanho de efeito, poder nem q para reportar. Nas quatro temporadas anteriores (2018–2021), que estão na base mas fora do recorte, o 4º fechou com 60, 62, 61 e 64 pontos, com 15 a 18 vitórias, e um elenco de 63 pontos também teria ficado fora em 2021 — três das oito temporadas da base.",
     "n": "4 temporadas fechadas (2022–2025); as quatro anteriores (2018–2021) conferidas na base",
     "prova": "A01_regua.csv; A01.md, seção Prova",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "barras",
      "titulo": "Pontos do 4º colocado, ano a ano",
      "unidade": "pontos",
      "barras": [
       {
        "nome": "2018",
        "valor": 60
       },
       {
        "nome": "2019",
        "valor": 62
       },
       {
        "nome": "2020",
        "valor": 61
       },
       {
        "nome": "2021",
        "valor": 64
       },
       {
        "nome": "2022",
        "valor": 62
       },
       {
        "nome": "2023",
        "valor": 64
       },
       {
        "nome": "2024",
        "valor": 64
       },
       {
        "nome": "2025",
        "valor": 62
       }
      ],
      "linha_de_corte": 63
     }
    },
    {
     "id": "A01-2",
     "parte": "A01",
     "bloco": "A",
     "manchete": "Quem desempata o acesso é a vitória, não o saldo de gols",
     "o_que_vimos": "A margem do 4º para o 5º foi de 4 (2022), 1 (2023), 0 (2024) e 1 (2025), um ponto ou menos em 3 dos 4 anos. Em 2024 Ceará e Novorizontino empataram em 64 pontos e o acesso saiu nas vitórias. Em 2018 o Goiás subiu à frente da Ponte Preta com os mesmos pontos e saldo menor.",
     "para_o_santa_cruz": "Um jogo decide o ano, e quem desempata é a vitória, não a goleada: com pontos iguais, ganhar por 1 a 0 vale mais do que golear. O ponto que falta vem do que separa quem sobe com e sem os times colados na linha — de onde o time finaliza e a qualidade da chance que ele cede. Bola parada não entra mais nesta frase como alavanca descartada: ela separa com os 20 times e só falha quando se tiram os colados na linha; e o fim de jogo fica de fora porque não existe minuto do gol em base nenhuma.",
     "premissa": "m7",
     "premissa_titulo": "Salário baixo, premiação alta por vitória e acesso",
     "premissa_grupo": "Montagem do elenco",
     "premissa_motivo": "Confirma a m7 (salário baixo, premiação alta por vitória): como o desempate do acesso é vitória, e não saldo, o bicho por vitória está alinhado ao critério que de fato decide o ano — e isso vale nas duas janelas, com 2024 e 2018 como casos. Não sugere premissa nova.",
     "confianca": "indício",
     "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios da régua. (1) Benjamini-Hochberg a 5% por família: não roda — não existe A01_testes.csv e scripts/A01.py não importa scripts/_metodo.py; as margens são leitura direta da coluna margem_4o_5o de A01_regua.csv. (2) Porta temporal da §6.4: não rodou em A01 (_porta_temporal.md registra que nenhuma das 19 partes a rodou). O uso prático é forte e o achado sobrevive aos dois cortes — vale nas quatro temporadas do recorte e nas quatro anteriores, onde o desempate por vitória fica até mais claro —, então é indício, e não queda. O que saiu do que vimos e fica registrado aqui, onde o jargão é permitido: a conclusão é contagem completa das tabelas, sem teste por trás, logo sem tamanho de efeito e sem q. Nas quatro temporadas anteriores as margens foram 0, 1, 3 e 2, o que leva a margem de um ponto ou menos a cinco das oito temporadas da base; em 2018 o mesmo desempate apareceu mais claro, com o Goiás subindo com 60 pontos e saldo de 4 à frente da Ponte Preta, com os mesmos 60 pontos e saldo de 12.",
     "n": "4 temporadas fechadas (2022–2025); as quatro anteriores (2018–2021) conferidas na base",
     "prova": "A01_regua.csv; A01.md, seção Prova",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "barras",
      "titulo": "Vitórias do 4º e do 5º no empate de 2024",
      "unidade": "vitórias",
      "barras": [
       {
        "nome": "Sobe, o 4º em 2024",
        "valor": 19
       },
       {
        "nome": "Trave, o 5º em 2024",
        "valor": 18
       }
      ]
     }
    },
    {
     "id": "A01-3",
     "parte": "A01",
     "bloco": "A",
     "manchete": "8 dos 16 promovidos fecharam na fronteira do G4",
     "o_que_vimos": "8 dos 16 promovidos e 9 dos 16 da Trave fecharam na fronteira do G4. A Trave ficou entre 56 e 64 pontos, mediana 60,5, ou seja 2,5 pontos abaixo do corte. No total, 28 das 80 campanhas fechadas ficaram na fronteira de uma das duas linhas.",
     "para_o_santa_cruz": "A distância entre subir e ficar na Trave é de 2,5 pontos na mediana, e em 9 dos 16 casos foi de 3 pontos ou menos — perto o bastante para o acaso pesar no que se lê como característica. Por isso toda comparação de faixa deste estudo roda com e sem os times colados na linha, e o que só aparece num dos dois não vira critério de contratação. Quem usar a campanha rodada a rodada que esta parte entrega precisa saber que ela discorda da tabela oficial em 8 de 100 clube-temporadas, 5 delas nas quatro temporadas fechadas.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Não trata de nenhuma premissa existente.",
     "confianca": "indício",
     "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios da régua. (1) Benjamini-Hochberg a 5% por família: não roda — não existe A01_testes.csv, e a contagem de colados na linha sai das colunas fronteira_g4 e fronteira_z4 de A01_clube_temporada.csv. (2) Porta temporal da §6.4: não rodou. A versão anterior ainda afirmava que a Trave é o mesmo time de quem sobe com dois pontos a menos: isso é um \"não separa\" sem poder calculado, que A01 não tem como sustentar (o script não importa scripts/_metodo.py e não calcula d mínimo). O texto agora fica dentro do que a contagem mostra, e a mesma contagem se repete na tabela remontada jogo a jogo. O que saiu do que vimos e fica registrado aqui, onde o jargão é permitido: a cobertura da fronteira por faixa é de 50% entre os que sobem, 33% no meio e 25% entre os que caem, e nenhum teste aqui diz se a Trave joga diferente de quem sobe — não há poder calculado nem tamanho de efeito. Refazendo a mesma contagem pela tabela remontada jogo a jogo em vez da oficial, todos esses números se repetem e só o piso da Trave muda, de 56 para 55.",
     "n": "80 clube-temporadas fechadas (2022–2025), das quais 16 promovidos e 16 na Trave",
     "prova": "A01_clube_temporada.csv; A01.md, seção Prova",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "barras",
      "titulo": "Campanhas na fronteira do G4, por faixa",
      "unidade": "casos",
      "barras": [
       {
        "nome": "Sobe",
        "valor": 8
       },
       {
        "nome": "Trave",
        "valor": 9
       }
      ],
      "linha_de_corte": 16
     }
    }
   ],
   "em_aberto": "2018–2021 fica fora do recorte (decisão do dono, 17/09): não tem dado físico nem tabela oficial no app, e entra nas conclusões como conferência ao lado, pela coluna pos de dados/serieb_clube_temporada_2018_2021.csv. Faltam 5 jogos na base de 2022–2026, listados em A01_resumo.json: por causa deles a tabela remontada jogo a jogo termina em posição diferente da oficial em 8 de 100 clube-temporadas (2 em 2022, 3 em 2024 e 3 em 2026) — inclusive sobre quem esteve na Trave em 2024. A marca base_incompleta = 1 pega só 3 dessas 8 e ainda marca 10 clubes, dos quais 7 não mudam de posição, porque o jogo que falta desloca o vizinho e é o vizinho que fica sem marca. As conclusões leem a tabela oficial e não mudam; quem lê classificacao_rodada.csv precisa saber disso.",
   "feita_em": null,
   "prova_arquivos": "scripts/A01.py"
  },
  {
   "id": "A02",
   "bloco": "A",
   "secao": "Que time montar",
   "pergunta": "A distância entre quem sobe e o meio está no que o time cria ou no que cede?",
   "status": "validada",
   "titulo": "Ataque ou defesa: onde está a distância para o meio, 2022 a 2025",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "A02-1",
     "parte": "A02",
     "bloco": "A",
     "manchete": "Quem sobe finaliza de mais perto",
     "o_que_vimos": "Quem sobe finaliza a 19,5 m do gol e o meio a 20,5 m, quase um metro mais perto. E quem já finalizava de perto nas 19 primeiras rodadas fez mais pontos nas 19 seguintes, mesmo contra quem pontuava igual. Em volume de chute, este estudo não conseguiria ver diferença.",
     "para_o_santa_cruz": "É a única coisa que este estudo mostra separando quem sobe do meio E vindo antes do resultado, e por isso é a que deve guiar o modelo de jogo: chegar à finalização de dentro, em vez de perseguir número de chutes. Na montagem do elenco isso pede quem ataca a área — atacante que se movimenta nas costas da zaga, meia que chega na área, lateral que entra em vez de cruzar de longe —, e J05 tem de virar isso em requisito de posição, nunca em volume de finalização. Vale a ressalva: a medida vem antes dos pontos dentro da mesma temporada e com o mesmo elenco, e é a melhor prova que o estudo tem, não uma receita de acesso.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere uma premissa nova: na Série B, de onde se finaliza antecipa pontos; quanto se finaliza, não.",
     "confianca": "firme",
     "confianca_motivo": "Firme porque passa nas DUAS provas, conferidas linha a linha no A02_testes.csv em 19/09. (a) Benjamini-Hochberg a 5% dentro da família “o que cria” (7 indicadores): a distância da finalização passa NOS DOIS CORTES DE FRONTEIRA — q 0,00009 com os 20 times de cada ano (16x48, d 1,203, poder suficiente contra um d mínimo de 0,82) e q 0,02 sem os times de fronteira (8x32, d 1,08, d mínimo 1,14). Nada em A02 é firme SÓ COM a fronteira, então a regra da fronteira não descarta nada aqui: ela obriga a publicar o corte cheio e a dizer o outro. (b) Porta temporal da §6.4: PASSA, e é a única de A02 que passa — parcial +0,29 (p 0,01), n = 80, do indicador das 19 primeiras rodadas sobre os pontos das 19 últimas, dada a pontuação que o time já tinha (_porta_temporal.json, 19/09; a própria §6.4 da especificação publica -0,289, p 0,009, na escala crua). Dois sim = FIRME. Pela conciliação com A05-1 esta é a única conclusão firme do estudo inteiro, e por isso ela cede a palavra “única” no uso prático: passa a dizer “a única que separa quem sobe E vem antes do resultado”, porque a posse também passa na porta temporal (parcial +0,227, p 0,043) mas não separa na base inteira. ROBUSTEZ (varredura de 19/09): os dois cortes dizem a mesma coisa e o texto publica os dois. Volume não separa nos QUATRO testes — finalizações q 0,419 com fronteira e 0,17 sem; finalizações sofridas q 0,429 com fronteira e 0,12 sem —, então a negativa não depende de corte; mesmo assim ela vai com a frase fixa da §6.7, porque no corte reduzido o desenho só veria d ≥ 1,14 e os observados são 0,66 e 0,63. O que NÃO volta, e por quê: toques na área (q 0,084 com fronteira / 0,04 sem), entradas na área (q 0,110 com fronteira / 0,04 sem) e xG sofrido por jogo (q 0,065 com fronteira e, sem os de fronteira, o menor q desta lista, que a tela com duas casas arredonda para 0) são firmes SÓ no corte reduzido, que o _metodo_fronteira.md documenta como enviesado por construção — pela regra da fronteira valem no máximo como indício e saem da frase que os chamava de “o que separa”. Sai também a metade defensiva da manchete anterior (“sofre de outro lugar”): o lugar do chute sofrido não está na lista pré-declarada e, testado, dá p 0,070 com fronteira e 0,081 sem; o parecer que tentou salvá-la usou a fatia de chute de fora da área, escolhida DEPOIS de ver o resultado, o que o CLAUDE.md proíbe. Com o xG fora da conclusão, a marca “pode ser efeito do placar” (emenda 2 da lista pré-declarada) deixa de ser obrigatória aqui. Teste de Welch no posto dentro da temporada, IC por bootstrap de clube. ETAPA 8 (20/09), o que saiu do texto de 10 segundos e passou a morar aqui: os dois cortes da distância (19,5 contra 20,5 com os 20 times, 19,67 contra 20,52 sem os times de fronteira) foram para o gráfico dois_cortes, que os mostra lado a lado; e com eles o volume, que não separa de nenhum dos dois lados — 12,6 finalizações por jogo contra 12,3 do meio, e 11,6 sofridas contra 12,1 —, com os d observados (0,66 e 0,63) abaixo do mínimo detectável em cada corte (0,82 com os 20 times, 1,14 sem os de fronteira). A porta temporal, o poder e os q continuam acima, sem corte nenhum. CONSERTO (20/09, conferência do cético): duas ressalvas voltaram ao texto de 10 segundos, porque nenhuma das duas podia morar só neste tooltip. (i) A negativa do volume passou a ir com a frase fixa da §6.7 — “não separa” significa “este desenho não conseguiria ver” —, em vez de ser afirmada como fato: o que a §8.3 manda para cá é o NÚMERO do poder (d observados 0,66 e 0,63 contra o mínimo detectável 1,14 sem os times de fronteira e 0,82 com os 20 times), não a licença de escrever que volume de chute não existe como diferença. É o defeito poder_nao_calculado da _auditoria_18_09.md. (ii) “com o mesmo elenco” voltou a ser “mesmo contra quem pontuava igual”: o controle da porta temporal da §6.4 é pela pontuação JÁ ACUMULADA (parcial +0,29, p 0,01, dada a pontuação que o time já tinha), e é ele que impede a leitura trivial de que time bom pontua mais depois; o limite de ser dentro da mesma temporada já estava no uso prático.",
     "n": "16 promovidos contra 48 do meio, e 8 contra 32 sem os times colados na linha; 80 clube-temporadas no teste de anterioridade",
     "prova": "A02_testes.csv; _porta_temporal.json, componentes; A02_numeros_novos.json; _metodo_fronteira.md; A02.md, seção Prova",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Distância da finalização",
      "unidade": "metros",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Sobe",
          "valor": 19.5
         },
         {
          "nome": "Meio",
          "valor": 20.5
         }
        ]
       },
       {
        "rotulo": "sem os times de fronteira",
        "series": [
         {
          "nome": "Sobe",
          "valor": 19.669
         },
         {
          "nome": "Meio",
          "valor": 20.522
         }
        ]
       }
      ]
     }
    },
    {
     "id": "A02-2",
     "parte": "A02",
     "bloco": "A",
     "manchete": "Quem sobe cede finalização pior, não finalização a menos",
     "o_que_vimos": "Quem sobe sofre 11,6 finalizações por jogo e o meio 12,1: praticamente o mesmo. O que muda é o tamanho da chance cedida, 8,9 gols esperados a cada cem finalizações contra 9,8 do meio. Isso é critério de montagem, não promessa de acesso.",
     "para_o_santa_cruz": "Proteger a área vale mais do que reduzir o número de chutes do adversário: o alvo é o tipo de finalização que se cede, não a quantidade, e isso é critério de montagem de zaga, laterais e volante de proteção. Mas o estudo não consegue mostrar que isso vem antes do resultado — o time que já está na frente cede chute pior —, e a régua que mede a qualidade da chance cedida repete só um terço de si mesma entre uma metade dos jogos e a outra; entra como critério de montagem, nunca como promessa de acesso. Sobre criar, o estudo não diz nada: a diferença de xG criado (1,28 contra 1,18 por jogo) é menor do que este número de times consegue enxergar, e aqui “não separa” significa “este desenho não conseguiria ver”.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere uma premissa nova: na Série B, o que separa na defesa é o tipo de chance que se cede, não o número de finalizações sofridas — com a ressalva de que o estudo não mostra que isso vem antes do resultado.",
     "confianca": "provável",
     "confianca_motivo": "Provável: passa numa prova e não na outra, conferido no A02_testes.csv em 19/09. (a) Benjamini-Hochberg a 5% dentro da família “o que cede” (4 indicadores): o xG por finalização sofrida passa NOS DOIS CORTES DE FRONTEIRA — q 0,02076 com os 20 times de cada ano (16x48, d 0,805) e, sem os times de fronteira, um q menor ainda (8x32, d 1,3), que a tela com duas casas arredonda para 0. O BH não depende de qual família o corrigiu: o A06 rodou o MESMO teste bit a bit na família “cede_ajustado” e deu q 0,03113 e 0,00967, também abaixo de 5%. (b) Porta temporal da §6.4: NÃO PASSA — parcial -0,026 (p 0,8213), n = 80 (_porta_temporal.json, 19/09): saber quem cedia chute ruim nas 19 primeiras rodadas não acrescenta nada sobre os pontos das 19 últimas depois de saber quantos pontos o time já tinha. É porta B, “firme, mas o 1º turno não previu o 2º”. Um sim de dois = PROVÁVEL. Duas ressalvas obrigatórias, que não mudam o nível mas têm de estar no texto: “pode ser efeito do placar” (emenda 2 da própria lista pré-declarada) e RÉGUA CURTA — a confiabilidade split-half do xG por finalização sofrida foi medida em 19/09 e deu 0,36, abaixo do piso de 0,40 da §3, o mesmo problema do xG criado (0,3). Não cai para indício: o indicador em si é firme nos dois cortes; o que caiu foi a ordenação entre os lados, que sai da manchete. ROBUSTEZ (varredura de 19/09): este é o caso mais grave da parte e a manchete INVERTE. Com os 20 times, o maior efeito que não é placar redescrito é de ATAQUE (distância da finalização, d 1,203, q 0,00009) e o melhor defensivo fica em d 0,805; sem os times de fronteira a ordem troca (defesa d 1,3 contra ataque d 1,08). Como qual lado é maior depende do corte — e a diferença ENTRE efeitos nunca foi testada, com os intervalos se sobrepondo —, a frase “o lado que mais separa é o defensivo” cai inteira, e com ela o motivo de confiança anterior, que invocava os dois cortes mas comparava tamanhos usando só um. O xG sofrido por jogo não vira manchete: é firme só no corte reduzido (q 0,065 com fronteira contra um q muito menor sem, que a tela também arredonda para 0), então entra no texto com o corte dito, como apoio. O empate em volume de finalizações sofridas vale nos dois cortes (q 0,429 com fronteira e q 0,12 sem). E sai a impressão de dupla prova: o A06-3 publica o mesmo teste bit a bit com outro q; pela conciliação o dono do indicador é o A02 e o A06 cede a cópia. Teste de Welch no posto dentro da temporada, IC por bootstrap de clube. ETAPA 8 (20/09), o que saiu do texto de 10 segundos e passou a morar aqui: o xG sofrido por jogo (1,02 contra 1,18 com os 20 times, 1 contra 1,19 sem os times de fronteira; q 0,065 com fronteira contra o q muito menor do corte reduzido), que é firme só no corte reduzido e por isso não sustenta mais frase visível; e o empate em volume (11,6 contra 12,1; q 0,429 com fronteira e q 0,12 sem), que o texto agora diz em uma frase, sem repetir o corte. O gráfico publica o xG por finalização sofrida no corte cheio, o único par de marcadores medido nessa unidade, e é tipo grupos e não dois_cortes de propósito: o indicador passa nos DOIS cortes (q 0,02076 com os 20 times e um q menor ainda sem os de fronteira), então não há fragilidade de corte escondida atrás de um gráfico de um corte só. A marca “pode ser efeito do placar” e a confiabilidade curta (0,36) continuam obrigatórias, e o uso prático as diz por escrito, porque não podem morar só neste tooltip.",
     "n": "16 promovidos contra 48 do meio, e 8 contra 32 sem os times colados na linha; 80 clube-temporadas no teste de anterioridade",
     "prova": "A02_testes.csv; _porta_temporal.json, componentes; A02_numeros_novos.json; _metodo_fronteira.md; A02.md, seção Prova",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "grupos",
      "titulo": "Tamanho da chance cedida, com todos os times",
      "unidade": "gols esperados a cada cem finalizações",
      "series": [
       {
        "nome": "Sobe",
        "valor": 8.9
       },
       {
        "nome": "Meio",
        "valor": 9.8
       }
      ]
     }
    },
    {
     "id": "A02-3",
     "parte": "A02",
     "bloco": "A",
     "manchete": "A sobra de gol de quem sobe não se contrata",
     "o_que_vimos": "Quem sobe converte melhor que o meio com os vinte times de cada ano. Sem os times de fronteira a vantagem fica menor, e lá até quem sobe fica abaixo do que as chances pediam. No goleiro não dá para ver diferença, nem que a sobra se repita de uma metade do ano à outra.",
     "para_o_santa_cruz": "Não se contrata pontaria e não se aposta em ano de goleiro inspirado: essa sobra é o placar contado de outro jeito, e o método da casa proíbe usá-la como característica de quem sobe. O que se procura é o que produz a chance boa e o que reduz a chance cedida — finalizar de perto e proteger a área. Dois avisos: pode ser efeito do placar, e, como a régua é curta, ninguém pode usar este estudo para dizer que a sobra é pura sorte — ele só mostra que não dá para comprá-la.",
     "premissa": "m4",
     "premissa_titulo": "Goleiro top — investir",
     "premissa_grupo": "Montagem do elenco",
     "premissa_motivo": "Ajusta m4 (Goleiro top — investir): o time defender acima do que as chances pediam não separa quem sobe do meio em corte nenhum e não tem relação de uma metade do ano para a outra. A premissa continua de pé por outros motivos, mas não pode se apoiar neste estudo — ele mede o time, não a qualidade do goleiro.",
     "confianca": "provável",
     "confianca_motivo": "Provável: passa numa prova e não na outra, conferido no A02_testes.csv em 19/09. (a) Benjamini-Hochberg a 5% dentro da família “a sobra” (2 indicadores): gols menos xG passa NOS DOIS CORTES DE FRONTEIRA — q 0,00004 com os 20 times de cada ano (16x48, d 1,257, poder suficiente contra um d mínimo de 0,82) e q 0,04 sem os times de fronteira (8x32, d 1,06, d mínimo 1,14); e é o único dos 13 indicadores a separar Sobe de Trave, também nos dois cortes (q 0,00144 com fronteira e q 0,03821 sem). (b) Porta temporal da §6.4: NÃO PASSA, porque nunca foi rodada para este indicador — o que o A02.py chama de porta temporal é persistência do indicador contra ele mesmo dentro da temporada, não o 1º turno prevendo os PONTOS do 2º (_porta_temporal.md, 19/09: “achado zero”, zero das 19 partes rodaram a porta como a §6.4 a define). E o teste que existe não tem poder: com n = 80 o menor sinal que ele enxergaria é 0,31 e o observado foi 0,19, com a confiabilidade da sobra medida em meia temporada em 0,07 contra o piso de 0,40 da §3. Um sim de dois = PROVÁVEL. O selo “firme” anterior é insustentável porque se apoiava justamente na metade que não se sustenta: uma negativa (“não se repete”) selada sem poder calculado, que é exatamente “não separa” virando “não existe”. Resultado negativo, vai para “Parece, mas não é”. Uso lícito do indicador: gols menos xG está na lista branca da §6 (“isto é o placar, não é característica”) e a emenda 1 da lista pré-declarada só o autoriza a sustentar conclusão NEGATIVA, que é o que está escrito aqui. ROBUSTEZ (varredura de 19/09): os dois cortes concordam no que importa e discordam no nível, e o texto diz os dois. A diferença Sobe-Meio é firme com os 20 times (+0,05 contra -0,17, ou cerca de 0,22 gol por jogo) e sem os times de fronteira (-0,05 contra -0,17, ou 0,12 gol por jogo); em Sobe x Trave também nos dois. Mas o SINAL do promovido inverte: com os 20 times ele converte acima do que as chances pediam, sem eles converte abaixo — e era justamente o corte calado que sustentava a prosa “convertendo acima do xG”, enquanto o número publicado (-0,05) dizia o contrário dela. Por isso o texto publica os dois e apoia a frase na diferença, não no nível. O outro indicador da família não depende de corte: xG sofrido menos gols sofridos não separa nem com fronteira (q 0,171) nem sem (q 0,515). A comparação entre as duas metades do ano não tem corte de subamostra nenhum (n = 80, sem recorte), e os dois indicadores que o texto anterior omitia dela — gols por jogo +0,540 e gols sofridos +0,335 — não mudam a leitura. Por fim, sai do texto a frase “criar e ceder se repetem”: esses coeficientes são de metade de temporada contra metade de temporada e o A11 publica, para os mesmos indicadores, persistência ano a ano quatro a sete vezes menor — comparar réguas diferentes é o defeito que o cruzamento de 19/09 registrou. ETAPA 8 (20/09), o que saiu do texto de 10 segundos e passou a morar aqui: o nível de cada corte (0,05 com os 20 times e -0,05 sem os times de fronteira, contra -0,17 e -0,17 do meio — que são o MESMO número, porque fin_m_cf está gravado sem sinal) e o lado do goleiro (0,2 contra 0,17, sem diferença em corte nenhum). O texto passou a apoiar a frase na DIFERENÇA (8 gols numa temporada inteira), nunca no nível, que é o defeito que a varredura pegou. O gráfico publica só o corte sem os times de fronteira, e não os dois: fin_m_cf está gravado como módulo — 0,17 quer dizer 0,17 ABAIXO do que as chances pediam —, de modo que desenhá-lo ao lado de 0,05 inverteria a leitura na tela. É correção de saída de script, não de texto, e fica registrada aqui. A comparação entre as duas metades do ano (0,19 observado, mínimo detectável 0,31, confiabilidade 0,07) continua acima. CORREÇÃO (20/09, conferência do cético): esta conclusão ficou SEM GRÁFICO, e o parágrafo acima, que registrava publicar só o corte sem os times de fronteira, deixa de valer. O motivo dele era verdadeiro (fin_m_cf está gravado em módulo, 0,17, quando o valor com sinal é -0,169 — o cru_alvo da linha com,sobra,SM,finalizacao do A02_testes.csv, idêntico ao fin_m), mas a saída escolhida trocava um erro visível por um silêncio: aqui o corte não muda só o tamanho, muda o SINAL, e o corte reduzido é justamente aquele em que o promovido aparece ABAIXO do que as chances pediam (-0,052), enquanto com os 20 times ele aparece acima (+0,053). Publicar sozinho o corte que o _metodo_fronteira.md documenta como enviesado por construção é o que a regra da fronteira proíbe. O dois_cortes honesto (fin_s_cf/fin_m_cf ao lado de fin_s/fin_m) depende de o A02.py regravar fin_m_cf com sinal: é conserto de saída de script, não de texto, e enquanto não vier a conclusão fica sem desenho. O texto foi reescrito junto: a diferença de 8 gols voltou a dizer de que corte sai (os 20 times de cada ano: 0,053 menos -0,169 = 0,222 por jogo, x38), o predicado virou diferença entre os dois lados e não sobra do promovido sozinho — o nível dele no corte reduzido é negativo —, a ressalva de que a vantagem aparece nos dois cortes e o nível dela não voltou a ser visível, já que sem gráfico ela não tinha onde aparecer, e “do lado do goleiro não há diferença nenhuma” virou “no goleiro não dá para ver diferença”, porque o teste não tem poder: 0,204 contra 0,166, d 0,424 contra um d mínimo de 0,82, poder_suficiente False no A02_testes.csv. Há diferença de 0,038 gol por jogo; o que não há é desenho que a enxergue. TERCEIRA PASSADA (20/09), o que o encurtamento tinha levado junto: o texto de 10 segundos dizia “a vantagem aparece também sem os times de fronteira, o tamanho dela não”, e TAMANHO não é NÍVEL — a frase falava só da diferença encolher (0,222 por jogo com os 20 times contra 0,117 sem os de fronteira) e calava a inversão de SINAL, que é a armadilha da parte: sem os times de fronteira o próprio promovido fica ABAIXO do que as chances pediam (-0,05, contra 0,05 com os 20 times; linha sem,sobra,SM,finalizacao do A02_testes.csv, cru_sobe -0,052). Como a conclusão está SEM GRÁFICO, a ressalva não tinha para onde ter ido: ficava só aqui, que na tela é o title do selo. O texto voltou a dizer o sinal por escrito — “e lá até quem sobe fica abaixo do que as chances pediam” —, o que também devolve ao predicado “converte melhor que o meio” a âncora que ele tinha perdido, para o leitor não ler que o promovido converte acima do esperado nos dois cortes. O que saiu para caber nos 280, pela ordem de quem perde espaço: primeiro o segundo número do goleiro (0,2 contra 0,17), que o corte não enxerga de qualquer forma, e a repetição de que a diferença é a maior da lista; e, como ainda não cabia, o TAMANHO da vantagem (“cerca de 8 gols na temporada”), que é o detalhe do achado. O que NÃO saiu, e por isso o número saiu no lugar: o corte (“com os vinte times de cada ano”), o sinal no corte reduzido, a palavra que segura a afirmação do goleiro (“não dá para ver”) e a janela da repetição (“de uma metade do ano à outra”) — sem ela, “nem que a sobra se repita” viraria uma negativa sobre qualquer janela, e a medida é de meia temporada contra a outra. O gráfico continua não existindo pelo motivo já registrado acima: o dois_cortes honesto depende de o A02.py regravar fin_m_cf com sinal — hoje ele está gravado 0,17 quando o cru_alvo é -0,169, e desenhar assim inverteria o resultado. Um grupos só do corte reduzido foi descartado de propósito: mostraria um corte só numa conclusão que depende do corte.",
     "n": "16 promovidos contra 48 do meio, e 8 contra 32 sem os times colados na linha; 16 contra 16 no recorte de 5º a 8º (e 8 contra 7 sem os colados na linha); 80 clube-temporadas na comparação entre as duas metades do ano",
     "prova": "A02_testes.csv; A02_resumo.json, porta_temporal; _porta_temporal.md; A02_numeros_novos.json; A02.md, seção Prova",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Sobra de gol sobre o esperado",
      "unidade": "gols por jogo acima (+) ou abaixo (−) do esperado",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Sobe",
          "valor": 0.05
         },
         {
          "nome": "Meio",
          "valor": -0.17
         }
        ]
       },
       {
        "rotulo": "sem os times de fronteira",
        "series": [
         {
          "nome": "Sobe",
          "valor": -0.052
         },
         {
          "nome": "Meio",
          "valor": -0.169
         }
        ]
       }
      ]
     }
    }
   ],
   "em_aberto": "Aplicada em 19/09 a proposta de destino v2 validada pelo dono: A02-1 sobe para firme (a única do estudo, pela conciliação com A05-1), A02-2 inverte a manchete e fica em provável, e A02-3 cai de firme para provável e vai para “Parece, mas não é”. Nenhuma conclusão caiu, nenhuma se fundiu, nenhuma nasceu. Fica em aberto, e não se resolve escrevendo melhor: Sobe x Trave (5º a 8º) continua sem resposta fora do placar redescrito — sem os times de fronteira sobram 8 contra 7 e o desenho só pegaria um abismo (d mínimo 1,57) —, e o recorte por estado do jogo não existe em base nenhuma (conferido nas 346 colunas de serieb_clube_temporada.csv e nas 119 de serieb_jogos.csv), o que só coleta resolve. Pendências fora deste arquivo: A02.md está desatualizado e hoje contradiz este JSON (precisa da tabela dos dois cortes lado a lado); e 36 dos valores de `numeros` estão gravados como string e chegam à tela com ponto decimal, que é uma linha em gerar_estudo_serieb_js.py, não correção de texto. O marcador trave_firmes foi apagado aqui, como a v2 propôs: era o único sem origem em saída de script e nenhum texto o usava. Dono do indicador: pela conciliação, o xG por finalização sofrida é do A02 e o A06 cede a cópia — é o mesmo teste bit a bit, não duas provas defensivas independentes.",
   "feita_em": null,
   "prova_arquivos": "scripts/A02.py"
  },
  {
   "id": "A03",
   "bloco": "A",
   "secao": "Que time montar",
   "pergunta": "Quem sobe se diferencia ganhando fora ou dominando em casa?",
   "status": "validada",
   "titulo": "Casa e fora: onde se ganha e onde se perde, 2022 a 2025",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "A03-1",
     "parte": "A03",
     "bloco": "A",
     "manchete": "Depender de casa não separa quem sobe de quem fica no meio",
     "o_que_vimos": "A vantagem de jogar em casa é de 0,79 ponto por jogo, e quem sobe fica em 0,9 contra 0,79 do meio — sem os times colados na linha, 0,95 contra 0,82. A exceção é o 5º-8º, só no placar e num corte só. Nenhum dos 24 testes viu diferença, e nenhum tinha amostra para ver.",
     "para_o_santa_cruz": "Não montar elenco atrás de 'time forte fora': a diferença de mando não separou as faixas, e este desenho também não garante que ela não exista — são coisas diferentes. O que dá para usar é o tamanho da vantagem de casa da liga, 0,79 ponto por jogo para qualquer time, no planejamento de calendário e de viagem. E a leitura de mando sai marcada: pode ser efeito do placar, porque quem joga fora passa mais tempo atrás.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere uma premissa nova em Montagem do elenco: a vantagem de casa é da liga inteira e não distingue quem sobe de quem fica no meio — 'ser forte fora' não é perfil de elenco a procurar. Toca a m6 (logística diferenciada para a Série B) sem confirmá-la: esta parte não mediu viagem nem descanso.",
     "confianca": "indício",
     "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios. Correção para múltiplos testes: não. A família assimetria tem 24 linhas (quatro indicadores, três comparações, dois cortes), com selo firme em 0 delas, e o menor q da família é 0,14282 — em xG sofrido: fora menos casa, na comparação Sobe × Trave com a fronteira. Porta temporal da §6.4: não. Está pré-declarada em A03_indicadores.json (criterio.porta_temporal) e nunca rodou — não há turno em scripts/A03.py nem chave porta_temporal em A03_resumo.json, e a rodada de 19/09 (_porta_temporal.md) cobriu só os oito componentes do A14, nenhum deles de assimetria. Ausência de aprovação não é aprovação: as 24 linhas têm poder_suficiente=False, com |d| máximo 0,78 contra d mínimo detectável de 0,82 no desenho principal (16x48) e 1,14 no reduzido (8x32) — é a §6.7 ao pé da letra, e aqui 'não separa' quer dizer 'este desenho não conseguiria ver'. Ressalva que fica no motivo e não vai ao texto: trocar mediana por média inverte a ordem entre Sobe e Meio nos DOIS cortes (0,796 contra 0,818 com a fronteira; 0,803 contra 0,863 sem), recálculo feito duas vezes — auditoria de 18/09, achado 9 (2/3), e varredura de robustez de 19/09. Etapa 8, o que saiu do texto para cá: fora do placar as faixas ficam perto, de quem sobe para o meio, 0,42 contra 0,39 de xG criado, 0,45 contra 0,39 de xG sofrido e 0,89 contra 1,16 ponto percentual de dividida, sempre na diferença casa menos fora. O gráfico é o par Sobe contra Meio com a maior diferença padronizada da família, o xG sofrido casa menos fora (0,45 contra 0,39, d -0,434): é o par menos favorável à conclusão negativa, e mesmo ele sai sem diferença clara. Não há marcador do ponto por jogo do Meio — o dif_liga vale 0,789 porque o Meio é 48 dos 80 casos, não porque seja a medida do Meio —, e por isso a vantagem de casa em pontos, que é o que o texto conta, ainda não tem gráfico. A exceção do grupo de 5º a 8º fica só aqui, sem gráfico — 0,87 ponto por jogo com todos os times contra 1,47 sem os times de fronteira, corte que deixa 7 dos 16 casos do grupo, onde a mediana é quase o valor de um clube só, e no corte reduzido quem sobe marca 0,947 contra esses 1,474, com d 0,777, q 0,52615 e selo sem diferença clara, com 8 contra 7 casos, que só enxergaria d 1,57 — e continua sendo placar redescrito, não indicador novo. Ela não vai a gráfico nenhum por dois motivos: o corte reduzido não publica o ponto por jogo de quem sobe em marcador, então o gráfico de dois cortes mostraria um ponto solitário numa régua compartilhada e faria a trave parecer disparar; e o em_aberto desta parte a demove a descrição de propósito. E a leitura de mando pode ser efeito do placar: quem joga fora passa mais tempo atrás. Etapa 8, terceira passada: a exceção do grupo de 5º a 8º voltou ao o_que_vimos em uma oração, sem os brutos, que ficam aqui. O texto curto da segunda passada dizia que a vantagem de casa não distingue as faixas sem recorte nenhum, e o texto longo nunca afirmou isso: ele abria a exceção do placar. Como a exceção não tem gráfico, o escopo 'só no placar e num corte só' tinha de voltar ao texto visível — é também o que o em_aberto desta parte manda, ao demover a trave a descrição dentro do A03-1. Para caber nos 280, saiu o detalhe, não a ressalva: os brutos 0,87 e 1,47 e o 'entre as faixas' do fecho ficaram de fora, e o escopo continua inteiro no fecho: 'de casa menos fora' (são os testes de assimetria, não os de nível do A03-2 e do A03-3) e 'entre as faixas'. Para abrir espaço para os dois, a abertura virou 'a vantagem de jogar em casa é de 0,79 ponto por jogo' no lugar de 'vale 0,79 ponto por jogo a mais do que jogar fora' — 278 caracteres na tela.",
     "n": "80 clube-temporadas com todos os times (16 que subiram, 48 do meio — 16 deles na trave — e 16 que caíram); 52 sem os times colados na linha (8, 32 com 7 na trave, e 12)",
     "prova": "A03_testes.csv, família assimetria; A03_resumo.json, quadro_por_faixa; _metodo_fronteira.md",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Vantagem de jogar em casa",
      "unidade": "pontos por jogo a mais em casa",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Sobe",
          "valor": 0.895
         },
         {
          "nome": "Meio",
          "valor": 0.789
         },
         {
          "nome": "Cai",
          "valor": 0.737
         }
        ]
       },
       {
        "rotulo": "sem os times de fronteira",
        "series": [
         {
          "nome": "Sobe",
          "valor": 0.947
         },
         {
          "nome": "Meio",
          "valor": 0.816
         },
         {
          "nome": "Cai",
          "valor": 0.737
         }
        ]
       }
      ]
     }
    },
    {
     "id": "A03-2",
     "parte": "A03",
     "bloco": "A",
     "manchete": "Quem sobe ganha mais dividida nos dois mandos e só sofre menos em casa",
     "o_que_vimos": "Em casa, quem sobe cede 0,8 de xG por jogo contra 1,02 do meio. Fora, a distância encolhe para 1,29 contra 1,36 e o teste só a enxerga no corte sem os times de fronteira, que o método da casa trata como enviesado.",
     "para_o_santa_cruz": "A dividida defensiva ganha é exigência de time e de modelo de jogo, não requisito individual de contratação: é o único traço desta parte que aparece dentro e fora de casa, com e sem os times colados na linha. É o mesmo indicador do A06 aberto por mando, não uma segunda medição, e ceder pouco perigo só se sustenta em casa: trate isso como modelo de jogo. Não escreva que o traço é do jogador e não do ambiente — sem recorte por estado do jogo, esta parte não consegue separar as duas coisas.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere uma premissa nova em Montagem do elenco: a dividida defensiva ganha é exigência de time — é o traço que viaja, aparece dentro e fora de casa —, nunca requisito individual de contratação. Não contradiz a m1 (time físico): intensidade física não foi medida nesta parte.",
     "confianca": "provável",
     "confianca_motivo": "Provável: passa num critério e não no outro. Correção para múltiplos testes: sim, e nos dois cortes — xG sofrido por jogo em casa, duelos defensivos ganhos em casa e duelos defensivos ganhos fora ficam abaixo de 5% com e sem a fronteira, sendo 0,03030 o pior q dos seis. A quarta perna não: o xG sofrido por jogo fora dá q 0,23734 com a fronteira e 0,02585 sem, passa só no corte reduzido — que o _metodo_fronteira.md chama de enviesado por construção — e por isso fica fora da manchete. Porta temporal da §6.4: não, e aqui ela rodou: em _porta_temporal.md o xG sofrido em casa dá parcial +0,134 (p 0,2363) e a dividida em casa −0,026 (p 0,8183), as duas reprovadas; a dividida fora não foi testada, por não ser componente do A14. Duas ressalvas: com 80 linhas só uma parcial de cerca de 0,31 para cima seria detectável, então reprovar não prova que o traço venha depois do resultado; e falta o split-half de confiabilidade do xG sofrido EM CASA, que é a perna principal — existem 0,490 (xG criado em casa) e 0,482 (xG sofrido fora), acima do piso de 0,40 e refeitos pelos três pareceres da auditoria de 18/09, mas o xG sofrido em casa nunca foi medido em separado, e o valor de temporada inteira que a v1 mandava citar não é a confiabilidade desta medida. Sem os times colados na linha a vantagem aumenta, não diminui: xG sofrido em casa 0,736 contra 1,026 (era 0,8 contra 1,02 com todos os times), dividida em casa 62,541 contra 60,381 e dividida fora 61,411 contra 59,663. Etapa 8, o que saiu do texto para cá: a dividida defensiva ganha foi para o gráfico, nos dois mandos e no corte com todos os times, e o xG sofrido fora (1,29 contra 1,36) ficou no texto sem selo, porque o teste não o enxerga no corte principal. O corte sem a fronteira não entrou no gráfico porque esta parte não publica o quadro por faixa nesse corte — os valores estão acima, vindos de recálculo de auditoria. O que se vê fora também pode ser efeito do placar: quem visita passa mais tempo atrás. Etapa 8, conserto: a dependência do corte de fronteira no xG sofrido fora voltou ao o_que_vimos, porque o gráfico mostra um corte só — divididas com todos os times — e a fragilidade do 'só' não pode morar apenas no tooltip do selo. O gráfico continua em grupos, e não em dois cortes, porque o corte reduzido não tem marcador nem para a dividida nem para o xG sofrido: os valores existem em A03_testes.csv (62,541 contra 60,381 na dividida em casa, 61,411 contra 59,663 fora, 1,253 contra 1,394 no xG sofrido fora) e inventar marcador seria pior que mostrar um corte só declarado no título. Etapa 8, terceira passada: o corte reduzido voltou ao o_que_vimos com o rótulo que lhe cabe. Dizer apenas que o teste enxerga a diferença 'quando se tiram os times de fronteira' lê como 'aparece no corte mais limpo', e o _metodo_fronteira.md diz o contrário — o filtro reforça um grupo e enfraquece o outro, infla qualquer diferença por construção, e firme só sem fronteira é suspeito, não promovido; a tabela daquele arquivo lista xgc_fora em Sobe × Meio na coluna 'caiu para suspeito'. O gráfico mostra um corte só, então o rótulo de enviesado não podia morar apenas no tooltip do selo. Coube sem tirar nada: 213 caracteres na tela.",
     "n": "16 promovidos contra 48 do meio, e 8 contra 32 sem os times colados na linha",
     "prova": "A03_testes.csv, família casa e fora na comparação SM; A03_resumo.json, quadro_por_faixa; _porta_temporal.md; _metodo_fronteira.md",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "grupos",
      "titulo": "Divididas defensivas ganhas, com todos os times",
      "unidade": "%",
      "series": [
       {
        "nome": "Sobe em casa",
        "valor": 60.932
       },
       {
        "nome": "Meio em casa",
        "valor": 60.05
       },
       {
        "nome": "Sobe fora",
        "valor": 60.605
       },
       {
        "nome": "Meio fora",
        "valor": 59.578
       }
      ]
     }
    },
    {
     "id": "A03-3",
     "parte": "A03",
     "bloco": "A",
     "manchete": "Quem cai cria menos em casa e sofre mais fora",
     "o_que_vimos": "Em casa, quem cai cria 1,26 de xG por jogo contra 1,39 do meio, e longe de casa sofre mais. Quem cai é pior nos quatro números, então não são dois problemas separados por mando. Parte disso pode ser o placar: quem cai passa mais tempo atrás longe de casa.",
     "para_o_santa_cruz": "É o retrato a não repetir: elenco que não cria dentro de casa e não protege a área longe dela. Não trate como dois problemas separados por mando — quem cai é pior nos quatro números, e os testes só isolaram onde a diferença cruzou a linha. Na montagem, o requisito é criar e proteger sempre; não existe 'reforço para jogo fora'.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Não trata de nenhuma premissa existente e não sugere nova.",
     "confianca": "provável",
     "confianca_motivo": "Provável: passa num critério e não no outro. Correção para múltiplos testes: sim, e nos dois cortes — xG criado por jogo em casa e xG sofrido por jogo fora ficam abaixo de 5% com e sem a fronteira, sendo 0,00827 o pior q dos quatro. Porta temporal da §6.4: não — o scripts/A03.py não roda porta nenhuma, e a rodada de 19/09 cobriu só os oito componentes do A14, que não incluem nenhuma das duas pernas. O que a conclusão NÃO afirma é a assimetria: os dois testes diretos e pré-declarados não passam em corte nenhum e, no corte principal, nem chegam perto — xG criado casa menos fora p 0,28372 com a fronteira contra 0,12512 sem; xG sofrido fora menos casa p 0,21983 contra 0,07426. O recorte por mando é onde a diferença cruzou a linha, não um achado, e quem cai é pior nos quatro números. Sai a ressalva de confiabilidade que a v1 pedia: os três pareceres da auditoria de 18/09 refizeram o split-half por mando e acharam 0,490 no xG criado em casa e 0,482 no xG sofrido fora, as duas pernas desta conclusão, acima do piso de 0,40. Etapa 8, o que saiu do texto para cá: o xG sofrido fora nos dois cortes foi para o gráfico (1,56 contra 1,36 com todos os times, 1,65 contra 1,39 sem os times de fronteira). O xG sofrido fora pode ser efeito do placar: quem cai passa mais tempo atrás do marcador longe de casa. Etapa 8, conserto: a ressalva do placar voltou também ao o_que_vimos, porque o para_o_santa_cruz desta conclusão não tem frase equivalente e sem ela o 'não protege a área longe dela' vira traço de elenco a contratar.",
     "n": "16 do Cai contra 48 do Meio, e 12 contra 32 sem os times colados na linha",
     "prova": "A03_testes.csv, comparação CM; A03_resumo.json, quadro_por_faixa; _metodo_fronteira.md",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "xG sofrido fora de casa",
      "unidade": "xG por jogo",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Cai",
          "valor": 1.557
         },
         {
          "nome": "Meio",
          "valor": 1.364
         }
        ]
       },
       {
        "rotulo": "sem os times de fronteira",
        "series": [
         {
          "nome": "Cai",
          "valor": 1.646
         },
         {
          "nome": "Meio",
          "valor": 1.394
         }
        ]
       }
      ]
     }
    }
   ],
   "em_aberto": "Falta o split-half de confiabilidade do xG sofrido em casa, que é a perna principal do A03-2: as duas medidas por mando que existem (xG criado em casa e xG sofrido fora) estão acima do piso, e esta nunca foi medida em separado — o cálculo é o mesmo já rodado para as outras duas. O A03.py não produz o quadro por faixa no corte sem a fronteira nem a média ao lado da mediana, e por isso a prova dos dois cortes ainda se apoia em recálculo de auditoria; o A03.md também precisa ser refeito, porque publica só tabelas do corte reduzido e brutos que o JSON já não tem. A conclusão da trave segue fora como conclusão: vale num corte só e é placar redescrito, então volta apenas como descrição no A03-1. E xG muda com o placar, que é diferente por mando: sem recorte por estado do jogo, parte do 'sofre mais fora' pode ser 'passa mais tempo perdendo fora'.",
   "feita_em": null,
   "prova_arquivos": "scripts/A03.py + scripts/_metodo.py"
  },
  {
   "id": "A04",
   "bloco": "A",
   "secao": "Que time montar",
   "pergunta": "Quanto da produção vem de bola parada, e isso separa quem sobe?",
   "status": "validada",
   "titulo": "Bola parada: quanto vale e para quem, 2022 a 2025",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "A04-1",
     "parte": "A04",
     "bloco": "A",
     "manchete": "Nada do trabalho de bola parada separa quem sobe do meio",
     "o_que_vimos": "Nenhum dos 8 sinais de trabalho separa quem sobe do meio, nos dois cortes. O que separa é gol: na temporada, quem sobe faz 5,5 gols de bola parada a mais do que sofre e o meio fecha zerado, mas gol é o placar de outro jeito, e sem os times colados na linha nem ele separa.",
     "para_o_santa_cruz": "Treinar bola parada não é o caminho do acesso — e o estudo também não mostra que abandoná-la custe o acesso. Na montagem do elenco, altura e duelo aéreo de jogador de linha não entram como requisito de acesso; a exceção, dita aqui para as duas frases do estudo não se contradizerem, é o goleiro, onde o J03 achou na bola aérea disputada o maior efeito da tabela dele — e ainda assim como provável. O tamanho do fenômeno, que continua grande, está na conclusão descritiva ao lado: é volume de treino, não critério de contratação.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere registrar uma premissa nova: a régua G da Protótipo (bola aérea e parada) não tem sustentação como separadora de quem sobe — nenhum dos seus três itens separa quem sobe do meio, nos dois cortes. A premissa não pode ser escrita como se a comparação com a trave também tivesse sido testada: ali ela fica sem resposta.",
     "confianca": "indício",
     "confianca_motivo": "Os dois critérios da §6 dizem não. (a) Correção para múltiplos testes a 5% dentro da família, em Sobe × Meio: nenhum dos 8 indicadores de trabalho é firme em qualquer dos dois cortes de fronteira — o mais perto é a altura média do elenco, e ainda assim longe da linha; os dois que passam no corte com a fronteira são da família do gol, o saldo de bola parada e os gols de bola parada feitos, por jogo, que a lista branca de A04_indicadores.json já declarava placar redescrito antes de rodar, e sem os times de fronteira o saldo fica de fora por muito pouco (0,05339 contra a linha de 5%), com o achado em campo idêntico nos dois cortes. (b) Porta temporal da §6.4: não rodou nesta parte e, para o gol de bola parada, é impossível, porque a base é agregada por trabalho (treinador + time + competição). Nenhum dos dois ⇒ indício; o desenho só enxerga efeito grande (d ≥ 0,82 com a fronteira, d ≥ 1,14 sem ela), e na comparação com a trave os dois sinais firmes do corte com a fronteira — duelos aéreos ganhos a favor da trave e altura média do elenco a favor de quem sobe — se contradizem entre si e somem sem os colados na linha, por isso essa perna sai da afirmação. O que saiu do que vimos e fica aqui: os 8 sinais de trabalho são bolas paradas e escanteios por jogo, finalizações de escanteio, finalizações de falta, conversão, cruzamentos, duelos aéreos ganhos e altura média do elenco; e a ressalva de tamanho, que é a mesma dita acima — com 16 contra 48, e 8 contra 32 sem os times de fronteira, só um efeito grande apareceria, então “não separa” aqui quer dizer “este desenho não conseguiria ver”. Esta conclusão fica sem gráfico de propósito: não há em numeros um par de medidas de trabalho de Sobe e Meio na mesma unidade para desenhar, e um desenho só com o lado de quem sobe sugeriria o contrário do que a conclusão diz. A unidade de tempo de 5,5 é a temporada, e por isso a frase diz “na temporada”: o quadro_por_faixa do A04_resumo.json dá bp_saldo_90 de 0,145 por jogo para quem sobe contra 0 do meio, e 5,5 é esse 0,145 vezes os 38 jogos. Quem encurtar este texto de novo não pode tirar “na temporada”: todo o resto da parte é por jogo, e sem a unidade o número vira outro número.",
     "n": "16 promovidos contra 48 do meio; sem os times colados na linha, 8 contra 32. A comparação com a trave (5º–8º) fica sem resposta nesta parte: são 16 contra 16 com todos os times e 8 contra 7 sem os colados na linha, um desenho que o próprio método da casa (resultados/_metodo_fronteira.md) declara enviesado entre faixas vizinhas.",
     "prova": "A04_testes.csv, comparacao SM e ST; A04_resumo.json, firme_nos_dois_cortes",
     "status": "validada",
     "negativa": true,
     "grafico": null
    },
    {
     "id": "A04-2",
     "parte": "A04",
     "bloco": "A",
     "manchete": "Um em cada três gols da Série B sai de bola parada",
     "o_que_vimos": "Na liga, 34,02% dos gols de um time vêm de bola parada, cerca de 14 gols numa temporada inteira. Essa fatia é a mesma em todas as faixas, nos dois cortes — e só um vão enorme apareceria neste desenho. Entre clubes varia muito, de 16,3% a 60,7% dos gols do time.",
     "para_o_santa_cruz": "É o número para dimensionar o trabalho de bola parada: um em cada três gols, cerca de 14 por temporada. O maior pedaço é o escanteio — 438 dos 1.091 gols de bola parada em quatro temporadas, contra 312 de pênalti e 294 de falta —, então é onde o tempo de treino rende mais; somados, porém, pênalti e falta pesam mais que o escanteio, e pênalti não se treina como bola parada. Não é o que separa quem sobe (ver a conclusão ao lado), mas é grande demais para tratar como detalhe.",
     "premissa": "p15",
     "premissa_titulo": "O Wyscout não marca a origem do gol",
     "premissa_grupo": "Dados",
     "premissa_motivo": "Ajusta a p15 (“O Wyscout não marca a origem do gol”): ela continua verdadeira para o Wyscout e para o dado de jogador, mas dados/bola_parada.json traz a origem do gol por time na Série B de 2022 a 2026 — escanteio, falta direta, falta indireta, lateral e pênalti, pró e contra. A premissa deve dizer onde a origem existe e onde não existe.",
     "confianca": "indício",
     "confianca_motivo": "Os dois critérios da §6 dizem não. (a) Correção para múltiplos testes a 5% dentro da família: o indicador que sustenta a frase é a fatia dos gols que vem de bola parada, e ele fica em “sem diferença clara” nas seis leituras — dois cortes de fronteira × três comparações —, nenhuma delas perto da linha. (b) Porta temporal da §6.4: não roda aqui, porque a base de bola parada é agregada por trabalho (treinador + time + competição) e não tem jogo a jogo, como o próprio A04_indicadores.json declara. Nenhum dos dois ⇒ indício: a contagem da liga é descrição completa, mas “não achamos faixa que dependa mais dela” é um “não separa” num desenho que só enxergaria diferença grande — por isso a frase traz a ressalva e diz os dois cortes. O que saiu do que vimos e fica aqui: a fatia de cada faixa (35,19% de quem sobe, 34,02% do meio, 31,37% de quem cai e 33,16% da trave, que são 16 dos 48 do meio e não uma quarta faixa), e os quartis da variação entre clubes, com metade dos 80 entre 27,2% e 39,5%. Esta conclusão fica sem gráfico de propósito, e por um motivo diferente do da conclusão ao lado: aqui existe par de medidas na mesma unidade, mas a régua do renderizador não começa no zero — ela se abre nos valores que recebe —, então 31,37%, 33,16%, 34,02% e 35,19% ocupariam a largura inteira, e a leitura mais nula desta parte (Cai × Meio, d de 0,007 e q de 0,97994, o menor efeito da tabela inteira) sairia na tela como uma escada de quatro faixas, que é o contrário do que a conclusão diz — e a trave, que não é faixa, apareceria como a quarta. Sem os times de fronteira a leitura é a mesma “não separa”, e é isso que a frase diz em vez de repetir os números de cada corte. E o sujeito da frase é essa fatia, e só ela: dizer “nenhuma diferença entre faixas” seria falso, porque na mesma tabela, entre faixas e nos dois cortes, duelos aéreos ganhos, saldo de bola parada e gols de bola parada feitos separam quem cai do meio — é o que a A04-3, impressa ao lado, afirma. Quem encurtar este texto de novo tem de manter o escopo no sujeito.",
     "n": "80 clube-temporadas, todas de 38 jogos: 16 que sobem, 48 do meio (dos quais 16 são a trave) e 16 que caem",
     "prova": "A04_resumo.json, quadro_por_faixa; A04_testes.csv, indicador bp_pro_pct",
     "status": "validada",
     "negativa": false,
     "grafico": null
    },
    {
     "id": "A04-3",
     "parte": "A04",
     "bloco": "A",
     "manchete": "No trabalho de bola parada, só ganhar o duelo aéreo separa quem cai",
     "o_que_vimos": "Quem cai ganha menos duelos aéreos do que o meio. No resto o trabalho é igual: cobra 5,0 escanteios por jogo contra 5,1 do meio e tira a mesma fatia de gols da bola parada. Faz menos gol de bola parada, mas perde gol de toda origem na mesma medida.",
     "para_o_santa_cruz": "Treinar bola parada não aparece como proteção contra a queda: quem cai cobra os mesmos escanteios e tira a mesma fatia de gols dela que o meio. O que separa é ganhar a bola no alto — para um clube que precisa primeiro não cair, o duelo aéreo entra como requisito de elenco, e a altura média do elenco não entra junto, porque ela não separa quem cai do meio (1,809 m dos dois lados). O tamanho do requisito muda com o corte, de 1,8 ponto com todos os times a quase três pontos sem os colados na linha: é essa faixa que o clube tem de usar, e é o único indicador não-placar desta parte que separa quem desce.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere uma premissa nova para a montagem do elenco: para não cair, o requisito é ganhar o duelo aéreo, não ser alto — a altura média do elenco não separa quem cai do meio, e o duelo aéreo separa.",
     "confianca": "provável",
     "confianca_motivo": "Um critério da §6 diz sim e o outro diz não. (a) Correção para múltiplos testes a 5% dentro da família, em Cai × Meio: sim — duelos aéreos ganhos é firme nos dois cortes de fronteira, o único não-placar desta parte que chega lá; a ressalva honesta é que, com todos os times, o efeito fica rente ao mínimo que o desenho enxerga, e só sem os colados na linha fica claramente acima. (b) Porta temporal da §6.4: não rodou nesta parte e, ao contrário do gol de bola parada, aqui ela é rodável — dados/serieb_jogos.csv tem duelos aéreos ganhos por jogo. Um sim e um não ⇒ provável; o argumento antigo, de que os outros três indicadores são gol e gol é o placar redescrito da lista branca da §6, continua valendo como segunda ressalva, não como a régua. O que saiu do que vimos e fica aqui: os números de gol, que a lista branca da §6 já declarava placar redescrito — com todos os times, quem cai faz 0,28 gol de bola parada por jogo contra 0,34 do meio, sofre 0,45 contra 0,36 e fecha com saldo de -0,13 contra 0. O tamanho do requisito muda com o corte, e quem mostra os dois lado a lado agora é o gráfico.",
     "n": "16 rebaixados contra 48 do meio; sem os times colados na linha, 12 contra 32",
     "prova": "A04_testes.csv, comparacao CM; A04_resumo.json, firme_nos_dois_cortes",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Duelos aéreos ganhos",
      "unidade": "% dos duelos",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Cai",
          "valor": "44,3"
         },
         {
          "nome": "Meio",
          "valor": "46,1"
         }
        ]
       },
       {
        "rotulo": "sem os times colados na linha",
        "series": [
         {
          "nome": "Cai",
          "valor": "43,5"
         },
         {
          "nome": "Meio",
          "valor": "46,5"
         }
        ]
       }
      ]
     }
    }
   ],
   "em_aberto": "O gol de bola parada não tem versão jogo a jogo nesta base (é agregada por trabalho: treinador + time + competição), então não passa pela porta temporal. Para o duelo aéreo ela É rodável e não rodou: dados/serieb_jogos.csv traz duelos aéreos ganhos por jogo, e esse é o caminho barato para o A04-3 virar firme — A04_indicadores.json prometeu esse teste e não cumpriu. O xG de bola parada existe só para 2025 e 2026 e ficou fora, e pênalti entra na conta como a base o classifica: pênalti sofrido é em boa parte consequência de defender sob pressão, não um traço de bola parada. O A04.md ainda traz o texto antigo e mistura os dois cortes de fronteira numa frase só; ele tem de ser regerado a partir deste arquivo antes de voltar a valer como prova, e por isso saiu do campo prova.",
   "feita_em": null,
   "prova_arquivos": "scripts/A04.py + scripts/_metodo.py"
  },
  {
   "id": "A05",
   "bloco": "A",
   "secao": "Que time montar",
   "pergunta": "Existe estilo com bola que separa quem sobe, ou sobe-se com estilos opostos?",
   "status": "validada",
   "titulo": "Estilo com bola: existe um caminho, ou vários?",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "A05-1",
     "parte": "A05",
     "bloco": "A",
     "manchete": "Nenhum jeito de construir a jogada separa quem sobe do meio da tabela",
     "o_que_vimos": "Dos 10 traços com bola medidos, nenhum separa quem sobe do meio com todos os times na conta. Ter a bola chega mais perto, 51,4% contra 49,8%, e só separa sem os times de fronteira. Quem tinha mais a bola no primeiro turno somou mais pontos no segundo.",
     "para_o_santa_cruz": "Estilo com bola não é critério de contratação nem de escolha de treinador: nem passe curto, nem passe longo, nem ataques posicionais aparecem como marca de quem sobe. Ter a bola é o único que chega perto e vale como desempate, nunca como plano — só separa depois de tirar quem subiu raspando, e contra os times do 5º ao 8º não separa em corte nenhum. Cuidado com os dois lados: com 16 promovidos contra 48 do meio só uma diferença grande apareceria, então aqui “não separa” quer dizer “este desenho não conseguiria ver”; e posse e volume de passes mudam com o placar, que a base não permite separar.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere premissa nova, no grupo Modelo de jogo: “Estilo com bola não é requisito de acesso; ter a bola é desempate.” Em igualdade de condições, preferir treinador e jogadores que sustentem mais da metade da posse — sem tratar isso como requisito, sem substituir o lado defensivo (A02 e A06) e sem valer contra os times do 5º ao 8º. Corrige o registro atual da parte, que dava a régua A (posse e construção) da Protótipo como sem sustentação inteira: ela cai em nove dos dez itens e fica de pé, dependendo do corte, só na posse.",
     "confianca": "provável",
     "confianca_motivo": "Dos dois critérios de firme, esta conclusão cumpre um — por isso provável, e não firme. (1) Correção para múltiplos testes a 5% dentro da família: NÃO na rodada principal. Conferido linha a linha no A05_testes.csv, e não no texto antigo: em Sobe × Meio com os times de fronteira na conta nenhum dos 10 indicadores recebe selo firme, e a posse, que é a que chega mais perto, tem o intervalo de confiança encostando no zero. O único selo firme das 60 linhas é a posse no corte sem os times de fronteira. A régua da casa manda rodar TAMBÉM sem os times colados na linha: o corte reduzido é conferência, a medida é a base inteira — que ainda por cima tem mais poder (efeito mínimo detectável 0,82 contra 1,14) — e a regra 4 do _metodo_fronteira.md é explícita, firme só sem fronteira é suspeito, não promovido. Nas outras duas comparações não há selo firme em corte nenhum. (2) Porta temporal da §6.4: SIM, e só para a posse. Em _porta_temporal.json, conferencia_6_4, o indicador “Posse, %” tem parcial positiva e passa a 5% sobre os 80 clube-temporadas, e a tabela reproduz a §6.4 célula a célula, como a ESPECIFICACAO.md publica. Essa medida não usa filtro de fronteira nenhum, então o meio critério que a conclusão cumpre não depende do corte enviesado. Dos outros nove indicadores, só dois chegaram a ser perguntados pela tabela e reprovaram (passes certos e passe longo); os outros sete nunca foram testados. Um sim e um não = provável. Ressalvas que ficam na prova e não mexem no selo: (a) a etapa_7 de dados/prototipo.json dá uma parcial menor e fora dos 5% para o mesmo indicador, mas é a fórmula fechada de Pearson, a mesma que diverge da §6.4 no dist_remate — pelo CLAUDE.md vale a especificação, e foi a §6.4 que o teste de 19/09 reproduziu; (b) o poder é insuficiente nas 60 linhas e o maior efeito do arquivo fica abaixo do próprio mínimo detectável, então a metade negativa da conclusão carrega a frase da §6.7: “não separa” aqui quer dizer “este desenho não conseguiria ver”; (c) contra a Trave (5º–8º) a posse não separa em corte nenhum, e nessa comparação ataques posicionais e passes progressivos trocam de sinal entre os dois cortes, o que reforça que ali não há o que ler; (d) o A12 chega ao mesmo pela régua A_posse_construcao, firme só no corte sem fronteira, mas é o mesmo dado por outro moedor e não conta como segunda prova; (e) na contagem crua, 12 dos 16 promovidos tiveram mais da metade da bola — e 4 dos 16 rebaixados também, com o meio em 49,8% e quem caiu em 48,5%. O que saiu do o que vimos e passa a morar aqui: (i) quem já tinha mais a bola nas 19 primeiras rodadas somou mais pontos nas 19 seguintes, mesmo entre times que vinham com a mesma pontuação — é essa a medida da §6.4 descrita acima, e é a metade do critério que a conclusão cumpre; (ii) os dois cortes, que agora estão no gráfico da conclusão, com todos os times na conta (51,4% contra 49,8%) e sem os times de fronteira (51,7% contra 50,2%).",
     "n": "16 promovidos contra 48 do meio (8 contra 32 sem os times a até 3 pontos da linha); a conta do primeiro turno usa os 80 clube-temporadas de 2022–2025",
     "prova": "A05_testes.csv, linhas do indicador posse em Sobe × Meio: com os times de fronteira d 0,521 e q 0,13363; sem eles d 0,689 e q 0,03748. As duas trocas de sinal entre os cortes estão contra a Trave, em ataques posicionais (d -0,496 e +0,291) e passes progressivos (d -0,284 e +0,145). _porta_temporal.json, conferencia_6_4. A05_numeros_novos.json",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Posse de bola",
      "unidade": "%",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Sobe",
          "valor": 51.4
         },
         {
          "nome": "Meio",
          "valor": 49.8
         }
        ]
       },
       {
        "rotulo": "sem os times de fronteira",
        "series": [
         {
          "nome": "Sobe",
          "valor": 51.7
         },
         {
          "nome": "Meio",
          "valor": 50.2
         }
        ]
       }
      ]
     }
    },
    {
     "id": "A05-2",
     "parte": "A05",
     "bloco": "A",
     "manchete": "Os 4 promovidos com menos da metade da bola subiram todos raspando",
     "o_que_vimos": "4 dos 16 promovidos ficaram com menos da metade da bola, a menor delas com 47,4%, e os quatro terminaram a 1 ponto ou menos do 5º colocado. Os 8 que subiram com folga tiveram todos mais da metade, de 50,1% a 61,6%. São 4 casos contados, não um teste.",
     "para_o_santa_cruz": "Subir jogando sem a bola é possível, e o Santa Cruz não precisa copiar modelo de posse para buscar o acesso. Mas nos 4 casos em que isso aconteceu o acesso veio por 1 ponto ou menos: é o caminho apertado, não o caminho barato. Se o modelo for sem a bola, o que o time cede e o duelo (A02 e A06) têm de estar impecáveis, porque não sobra margem.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Ajusta a premissa sugerida em A05-1: o desempate pela posse vale enquanto não custar o lado defensivo. Ter pouca bola não impede o acesso, mas nos casos observados ele veio sempre por margem mínima.",
     "confianca": "indício",
     "confianca_motivo": "Dos dois critérios de firme, esta conclusão não cumpre nenhum — por isso indício. (1) Correção para múltiplos testes a 5% dentro da família: NÃO, e não por ter reprovado num teste: é que ela não é um teste, é contagem de casos, 4 deles. A prova que o texto antigo usava também não se sustenta — comparar a amplitude de posse de quem sobe com a do meio compara 16 linhas com 48, amplitude cresce com o n, e sem o Cruzeiro 2022 a de quem sobe cai quase à metade; pelo IQR o meio é mais variado em posse do que quem sobe, o que enfraquece “estilo não é o eixo” em vez de sustentá-lo. Por isso os dois marcadores de amplitude saíram do texto. (2) Porta temporal da §6.4: NÃO. A parte nunca a rodou — o A05_resumo.json não tem o bloco que A02 e A06 têm, e o scripts/_rodar.py só particiona por faixa, trave e fronteira — e uma contagem de dispersão não tem efeito a testar. Nenhum dos dois = indício, e a frase diz por quê. O núcleo descritivo sobrevive inteiro: a auditoria de 19/09 recalculou a base e os valores dos promovidos reproduzem exatos. A distância real ao 5º colocado é de 1 ponto ou menos (Criciúma 2023, Ceará 2024, Chapecoense 2025 e Remo 2025), e não os 3 pontos do limiar da definição de fronteira. O que saiu do o que vimos e passa a morar aqui: posse muda com o placar — quem está ganhando cede a bola, e a base não permite separar por estado do jogo, então estes 4 casos descrevem o que aconteceu e não o que causou. Esta conclusão fica de propósito sem gráfico. O achado dela é a margem com que esses 4 subiram — a 1 ponto ou menos do 5º — e não há marcador de distância ao 5º para desenhar; as únicas barras possíveis seriam a contagem crua 4 contra 12, que diz outra coisa: sozinha, ela parece provar que ter a bola faz subir, quando 4 dos 16 rebaixados também tiveram mais da metade e o meio ficou em 49,8%. Ficar sem desenho é melhor do que desenhar a tese que a A05-1 não sustenta — e o par contado no desenho (4 e 12) nem seria o par do texto (4 e 8).",
     "n": "16 promovidos de 2022 a 2025: 4 com menos da metade da bola (todos a 1 ponto ou menos do 5º) e 8 que subiram com folga",
     "prova": "A05_resumo.json, promovidos e dispersao_por_faixa; A01_clube_temporada.csv, colunas de faixa e fronteira; A05_numeros_novos.json",
     "status": "validada",
     "negativa": false,
     "grafico": null
    }
   ],
   "em_aberto": "O achado que não coube em nenhuma conclusão: nos dez indicadores, todas as vinte linhas de Sobe × Meio apontam para o mesmo lado nos dois cortes — quem sobe sempre com o valor maior — sem que nenhuma passe no critério; pode ser um efeito real pequeno demais para este desenho enxergar, ou ruído, e a parte não tem como decidir. A ressalva pré-declarada do A05 diz que todos os indicadores passam do piso de confiabilidade de 0,40, e isso não é verdade: só cinco estão medidos, contra-ataques está em 0,36 e quatro nunca foram medidos (comprimento do passe, passes progressivos, passes no terço final, ataques posicionais) — o texto novo não se apoia mais em contra-ataques, mas a ressalva em si continua errada. Falta a camada de conferência: o A05.md não existe, justamente na parte em que havia um selo firme escondido no CSV. E como a A05-1 é negativa, ela não aparece no cartão de “O que decidimos”: onde mora a metade positiva — ter a bola vem antes do resultado — é decisão do dono. Continua valendo que posse e volume de passes mudam com o placar e que a base não permite o recorte por estado do jogo; só coleta resolveria. Agrupamento de times não foi refeito: a §7.1 já decidiu que não há grupos, e o CLAUDE.md proíbe reabrir.",
   "feita_em": null,
   "prova_arquivos": "scripts/A05.py (calcula e grava os 25 marcadores de A05_numeros.json, e confere a reprodução contra A05_testes.csv e A05_resumo.json, que continuam sendo do scripts/_rodar.py A05)"
  },
  {
   "id": "A06",
   "bloco": "A",
   "secao": "Que time montar",
   "pergunta": "Quem sobe pressiona mais alto ou apenas cede menos finalização de qualidade?",
   "status": "validada",
   "titulo": "Sem bola: pressão ou qualidade do que se cede, 2022 a 2025",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "A06-1",
     "parte": "A06",
     "bloco": "A",
     "manchete": "Quem sobe ganha mais a dividida no chão que o meio",
     "o_que_vimos": "A vantagem é de cerca de uma dividida ganha a mais a cada cem disputadas. Sobre pressão alta o estudo não decide: passes por ação defensiva, recuperações e intensidade empatam com o meio. Pressão e intensidade mudam com o placar e com o valor do elenco, que o estudo não separa.",
     "para_o_santa_cruz": "O time que sobe ganha mais a dividida no chão; se isso vem do jogador ou da organização, o A06 não decide — e medindo os dois lados no mesmo corte o número do time não se distingue do número do titular por posição do J03, então nem o contraste “separa o time, não o jogador” se sustenta. Na prática entra como exigência de modelo de jogo e de treino da disputa, e não como motivo para pagar caro num zagueiro que ganha duelo. Comprar sistema de pressão alta é o que este estudo menos sustenta: nem a favor, nem contra.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere uma premissa nova: na Série B a disputa da bola no chão separa quem sobe mais do que o sistema de pressão. Ela vale no nível do time; o estudo não consegue dizer se vem do jogador ou da organização, porque no mesmo corte o número do time e o do titular por posição não se distinguem.",
     "confianca": "provável",
     "confianca_motivo": "Provável porque passa num critério e falha no outro. (a) Correção para múltiplos testes a 5% dentro da família do duelo: PASSA, e nos dois cortes — duelos defensivos ganhos dão q 0,02556 com todos os times e, sem os times de fronteira, um q pequeno demais para as duas casas decimais da tela, que o mostra como 0 — o valor cheio está em A06_testes.csv, e o selo é firme nas duas linhas. (b) Porta temporal da §6.4 (o indicador das 19 primeiras rodadas contra os PONTOS das 19 últimas, com parcial nos pontos do 1º turno): REPROVA — parcial +0,092 com p 0,416, n 80, em _porta_temporal.md §3 e §6. O que esta parte chamava de porta era outra medida: a persistência do próprio indicador entre as duas metades da temporada, critério que a §6.5 aposentou em 15/09 e nome que ela proíbe. Um sim e um não = provável. A metade de pressão não passa em nenhum dos dois critérios: PPDA com parcial -0,103 e Intensidade de jogo com parcial +0,204 na tabela conferencia_6_4 de _porta_temporal.json, e para Recuperações por jogo não existe medida de porta em arquivo nenhum — procurei nas nove linhas de conferencia_6_4 e nos oito componentes de _porta_temporal.json e ela não está. Poder: com 16 contra 48 o desenho só enxerga efeito acima de 0,82, e os três indicadores de pressão ficam abaixo disso, então a metade negativa entra como ressalva e nunca como afirmação (§6.7). Robustez da fronteira: os dois cortes entram no texto número a número, e cai o superlativo “o maior efeito de todo o estudo até aqui” — ele só existe no corte sem os times de fronteira; com todos os times o efeito dos duelos defensivos ganhos é menos da metade e fica abaixo do dos gols marcados do A02 no mesmo corte. Recuperações por jogo e finalizações sofridas ajustadas pela posse trocam de sinal entre os dois cortes, razão a mais para o texto não afirmar o negativo e ficar em “o estudo não decide”. Duas ressalvas estavam declaradas em A06_indicadores.json e tinham sumido do JSON: pode ser efeito do placar, e elenco caro pressiona alto — o PPDA anda com o valor do plantel a -0,536. Os números de pressão saíram do texto de 2 minutos e ficam aqui: PPDA 9,69 contra 10,13 com todos os times e 9,46 contra 10,26 sem os times de fronteira, recuperações 78,38 contra 77,92 por jogo, intensidade de jogo 15,69 contra 15,55 — se apontam para algum lado, é para quem sobe pressionar mais, não menos. O efeito do duelo defensivo sem os times de fronteira é 1,59, com intervalo +0,99 a +2,37, e os dois cortes dele agora estão no gráfico da conclusão, que é onde a fragilidade fica visível sem ocupar o texto de 2 minutos. Na terceira passada as duas ressalvas declaradas em A06_indicadores.json voltaram ao texto de 2 minutos, e não só a este campo: é no texto visível que elas mudam a decisão, porque um clube de orçamento curto não copia como modelo de jogo uma pressão que anda com o valor do plantel a -0,536, e porque pressão e intensidade medidas sem recorte por estado do jogo podem ser o placar, não o método. Para caber nos 280 caracteres saiu no lugar delas a frase “nem a favor, nem contra comprar um sistema de pressão”, que apenas repetia o fecho do para o Santa Cruz, e o escopo “entre quem sobe e o meio” encolheu para “com o meio”, que diz a mesma comparação em menos espaço.",
     "n": "16 promovidos contra 48 do meio, com todos os times; 8 contra 32 sem os colados na linha",
     "prova": "A06_testes.csv; _porta_temporal.md; A06_numeros_novos.json",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Divididas no chão ganhas",
      "unidade": "%",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Sobe",
          "valor": 60.77
         },
         {
          "nome": "Meio",
          "valor": 59.78
         }
        ]
       },
       {
        "rotulo": "sem os times de fronteira",
        "series": [
         {
          "nome": "Sobe",
          "valor": 61.67
         },
         {
          "nome": "Meio",
          "valor": 59.89
         }
        ]
       }
      ]
     }
    },
    {
     "id": "A06-2",
     "parte": "A06",
     "bloco": "A",
     "manchete": "Nada do jogo sem bola separa quem sobe da trave nos dois cortes",
     "o_que_vimos": "A dividida no chão só separa as duas faixas quando se tiram os times colados na linha, e esse corte tira 9 dos 16 times da trave, justo os mais fortes. Sobram 8 contra 7, tamanho em que só diferença enorme apareceria. Com todos os times, o duelo aéreo separa, a favor da trave.",
     "para_o_santa_cruz": "Não há, na base deste estudo, alvo de contratação nem de modelo de jogo que venha do degrau da trave: o que separa quem sobe de quem parou entre 5º e 8º troca de indicador e de direção conforme quais times entram na conta. Para a montagem vale o A06-1, que se sustenta com todos os times. E o único indicador que separa essas duas faixas nos dois cortes é a pontaria — gols acima do esperado —, que é o placar contado de outro jeito e nem se repete de uma metade da temporada para a outra: o degrau da trave se parece mais com acerto de acabamento do que com característica que se compre.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Não trata de nenhuma premissa existente. Se alguma coisa sugere, é negativa: o degrau entre subir e parar na trave não está no que se mede sem a bola.",
     "confianca": "indício",
     "confianca_motivo": "Indício, o mesmo nível de 17/09 — o que muda é o sentido da conclusão. (a) Correção para múltiplos testes a 5%: passa em UM corte só. Duelos defensivos ganhos contra a trave dão q 0,00379 sem os times de fronteira, mas q 0,06438 com todos os times, que na chave da casa é “sem diferença clara” — e não o “pode ser sorte” que o texto de 17/09 citava entre aspas, que é um degrau acima do medido e exige p abaixo de 5% (scripts/_metodo.py). Pela convenção escrita em _metodo_fronteira.md, firme é firme nos dois cortes (regra 2), e o que só é firme sem a fronteira é suspeito, vale no máximo indício e a frase tem de dizer que depende do corte (regra 4). (b) Porta temporal da §6.4: REPROVA — duelos defensivos ganhos com parcial +0,092 e p 0,416. Nenhum dos dois critérios, logo indício. O corte que produz o achado tira 9 dos 16 clube-temporadas da trave, justamente os mais fortes (mediana de 63 pontos nos que saem contra 57 nos que ficam), enquanto do lado de quem sobe tira os mais fracos, e sobram 8 contra 7 — desenho em que só efeito acima de 1,57 apareceria. Robustez da fronteira: é ela que inverte a conclusão e a manda para “Parece, mas não é”. Com todos os times, o único teste firme e com poder contra a trave é o de duelos aéreos ganhos, e na direção contrária à do achado; sem a fronteira esse mesmo duelo aéreo não separa. Como os dois cortes se contradizem em qual indicador separa, e em que direção, nada sobrevive aos dois — que é o que a tabela final do _metodo_fronteira.md já registrava para o A06 em Sobe × Trave. Os duelos aéreos ganhos NÃO viram conclusão: a regra 3 do _metodo_fronteira.md manda descartar o que só é firme com a fronteira, e o painel de 18/09 decidiu isso por 0 a 3 — eles entram no texto só como a razão de nada sobreviver, e é isso que desfaz a assimetria de publicar o achado de corte único que favorece e calar o de corte único que contraria. Sai também a frase “nenhum indicador do A02 ou do A06 separa essas duas faixas nos dois cortes”: ela é falsa, porque a pontaria do A02 (gols acima do gol esperado) é firme nos dois cortes — o texto novo a nomeia e diz por que ela não serve. Os números que saíram do texto de 2 minutos ficam aqui: duelos defensivos ganhos 61,67% de quem sobe contra 59,79% da trave, sem os times de fronteira, com efeito 2,23 e intervalo +1,31 a +4,60. A mesma comparação com todos os times, e os dois números do duelo aéreo contra a trave no corte cheio, continuam sem marcador em A06_numeros.json — por isso saíram do texto em vez de virar número digitado à mão, e o em_aberto já os registra como pendência. É também por essa falta que o gráfico desta conclusão não é dois_cortes: ele mostra o viés do corte, a mediana de pontos de quem sai contra a de quem fica.",
     "n": "8 promovidos contra 7 da trave, sem os colados na linha; 16 contra 16 com todos os times",
     "prova": "A06_testes.csv; _metodo_fronteira.md; _porta_temporal.md",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "barras",
      "titulo": "A ressalva, não o achado: o corte tira os times mais fortes da trave, mediana",
      "unidade": "pontos",
      "barras": [
       {
        "nome": "Trave que o corte tira",
        "valor": 63
       },
       {
        "nome": "Os que ficam",
        "valor": 57
       }
      ]
     }
    },
    {
     "id": "A06-3",
     "parte": "A06",
     "bloco": "A",
     "manchete": "A vantagem de quem sobe é sofrer chute pior, não sofrer menos chute",
     "o_que_vimos": "Quem sobe sofre menos finalização por jogo, mas isso é a posse. O que fica é o tamanho da chance cedida, cerca de um gol esperado a menos a cada cem chutes sofridos. É o mesmo número do A02, e de régua curta: a diferença conta pela direção, não pelo tamanho.",
     "para_o_santa_cruz": "A vantagem defensiva de quem sobe não é sofrer menos finalização: é sofrer finalização que vale menos. Na montagem, o alvo é reduzir o valor do chute cedido — organização da área e altura da linha — e não comprar volume de desarme. Por qual mecanismo isso acontece, o A06 não diz: não existe distância nem ângulo do chute sofrido em nenhuma coluna da base, e a conta divide pela posse do adversário, que muda conforme o placar.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Ajusta a leitura defensiva do A02: o lado defensivo separa pela qualidade do que se cede, não pelo volume. A hipótese de que o volume só parecia menor porque quem sobe tem mais a bola precisa da posse declarada na lista e testada antes de virar afirmação — hoje a posse não está em nenhuma família do A06, e no recálculo da auditoria quem sobe tem mais bola, não menos.",
     "confianca": "provável",
     "confianca_motivo": "Provável: passa num critério e falha no outro. (a) Correção para múltiplos testes a 5% na família do que se cede: xG por finalização sofrida PASSA nos dois cortes — selo firme com todos os times e q 0,00430 sem os times de fronteira. Esse q é o do A02, e não um segundo cálculo: por decisão do dono em 20/09 este indicador mora na família `cede` do A02 — a pergunta dele é o que o time cede —, e aqui ele é medido mas fica fora da correção desta família, citando o número da parte dona. Até 20/09 as duas partes publicavam q diferente (0,03113 aqui, 0,02076 lá) do MESMO p 0,01038, só porque o Benjamini-Hochberg divide o crédito entre os testes feitos juntos e as duas famílias tinham vizinhos diferentes. A coluna `citado` e a `q_de` do A06_testes.csv marcam as duas linhas. (b) Porta temporal da §6.4: REPROVA, e com o sinal invertido em relação ao que a parte declarava — parcial -0,026 com p 0,8213, em _porta_temporal.md §3. Um sim e um não = provável, que é exatamente o nível do A02-2, que publica este mesmo número. Duas ressalvas obrigatórias que não estavam na conclusão: régua curta — o xG por finalização sofrida reproduz 0,36 de si mesmo entre rodadas pares e ímpares, abaixo do piso da §6.1, e a coluna regua_curta nem existe em A06_testes.csv; e pode ser efeito do placar — os dois indicadores de volume são divididos pela posse do adversário, que muda com o resultado, e não há recorte por estado do jogo em base nenhuma. Robustez da fronteira: sai da frase o xG sofrido por 50% de posse do adversário, que não separa em nenhum dos dois cortes; o volume ajustado também não separa e ainda troca de sinal entre eles, e por isso o texto dá os dois pares de números em vez de dizer que o volume “some”; e sai “Duelo aéreo não separa”, que era a célula mais nula das quatro que o A06 rodou para duelos aéreos ganhos — a célula firme do mesmo indicador passa a ser tratada no A06-2, para não citar a conveniente calando a contrária. Pendência de dono, não de método: o xG por finalização sofrida é rodado em A02 e em A06 e tem dois q publicados para o mesmo teste, porque cada parte o corrigiu numa família diferente; é preciso declarar um dono por indicador. Os números de volume saíram do texto de 2 minutos e ficam aqui: finalizações sofridas por jogo 11,62 contra 12,05, e por 50% de posse do adversário 12,52 contra 12,23 com todos os times e 12,26 contra 12,38 sem os times de fronteira, com efeito 0,067 e q 0,87052 — volume que empata e ainda troca de sinal entre os cortes. Os dois números do gol esperado por finalização sofrida sem os times de fronteira continuam sem marcador em A06_numeros.json e por isso saíram do texto, como o em_aberto registra; por isso o gráfico desta conclusão não é o do gol esperado por finalização sofrida e sim o das finalizações sofridas por 50% de posse do adversário, que tem os quatro marcadores e mostra nos dois cortes justamente a metade frágil da manchete, a que troca de sinal.",
     "n": "16 promovidos contra 48 do meio, com todos os times; 8 contra 32 sem os colados na linha",
     "prova": "A06_testes.csv; _porta_temporal.md; A06_numeros_novos.json",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Finalizações sofridas por 50% de posse do adversário",
      "unidade": "por 50% de posse",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Sobe",
          "valor": 12.52
         },
         {
          "nome": "Meio",
          "valor": 12.23
         }
        ]
       },
       {
        "rotulo": "sem os times de fronteira",
        "series": [
         {
          "nome": "Sobe",
          "valor": 12.256
         },
         {
          "nome": "Meio",
          "valor": 12.38
         }
        ]
       }
      ]
     }
    }
   ],
   "em_aberto": "Recuperação por altura do campo não existe na base: há o total e a quebra por comprimento de passe, que é outra coisa. Sem ela, “pressiona mais alto” só tem resposta indireta, por PPDA e recuperações totais, e é por isso que essa metade da manchete do A06-1 não pode ser afirmada nem negada; só coleta resolve — vale abrir coleta de recuperações por terço do campo? Contra-ataque sofrido, ao contrário do que esta parte dizia, EXISTE: é a coluna do adversário no mesmo jogo e cobre os 80 clube-temporadas. O bruto já está calculado em A06_numeros_novos.json e a direção é instável entre os dois cortes, então rodá-lo dificilmente muda uma manchete; ainda assim é métrica da pergunta do CLAUDE.md e precisa ser declarado numa família em A06_indicadores.json e rodado por scripts/A06.py, que é quem dá o q e o selo. Não existe distância nem ângulo do chute sofrido em nenhuma coluna da base (só dist_remate, do próprio time), então o mecanismo do “chute pior” fica sem medição e o A06-3 para na descrição. O recorte por estado do jogo não existe em base alguma (o SkillCorner só guarda o período full_all), então a marca “pode ser efeito do placar” não tem como ser levantada sem coleta nova. Pendências de arquivo, fora do texto: para Recuperações não existe medida da porta temporal da §6.4 em arquivo nenhum (rodar scripts/_porta_temporal.py com “Recuperações” resolve); os marcadores porta_rec e porta_posse continuam sendo persistência entre metades da temporada, e não a porta da §6.4, e por isso nenhum texto os usa mais; faltam marcadores para cinco números que o texto novo usa e que são cópia de célula do A06_testes.csv (a mediana do duelo defensivo da trave com todos os times, os dois do duelo aéreo contra a trave no corte cheio e os dois do gol esperado por finalização sofrida sem os colados na linha) — enquanto eles não existirem, esses cinco ficam escritos no texto; o A06.md está desatualizado, publica um intervalo do duelo que não existe em arquivo nenhum e traz só a tabela do corte sem fronteira, precisando ser reescrito com as duas colunas de corte; e o xG por finalização sofrida tem dois q publicados (A02 e A06) para o mesmo teste, o que é decisão de dono por indicador.",
   "feita_em": null,
   "prova_arquivos": "scripts/A06.py + scripts/_metodo.py"
  },
  {
   "id": "A07",
   "bloco": "A",
   "secao": "Que time montar",
   "pergunta": "Quem sobe corre mais no total ou corre mais forte?",
   "status": "validada",
   "titulo": "Físico: volume ou intensidade, com bola ou sem bola",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "A07-1",
     "parte": "A07",
     "bloco": "A",
     "manchete": "Correr mais não separou quem sobe do meio da tabela",
     "o_que_vimos": "O time mediano de quem subiu percorreu 9.644 metros por jogo contra 9.598 do meio, e 669 em alta intensidade contra 652. Nenhum dos 12 indicadores físicos declarados separou quem sobe nos dois cortes. Não vimos diferença, e aqui só apareceria a partir de 4,7 posições de tabela.",
     "para_o_santa_cruz": "Não há base aqui para contratar pensando em “time que corre mais sobe” — e também não há base para dizer que correr não importa, porque este estudo não teria como ver. Escolha o nível físico pelo modelo de jogo que o treinador vai pedir, não como atalho para o acesso. Para o físico virar critério de acesso seria preciso dado por jogo, que neste repositório só existe a partir de 2025.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Ajusta a m1 (Time físico): “a intensidade é critério de escolha, não detalhe” fica SEM PROVA pelo lado do acesso — não é contradita, este desenho não conseguiria enxergá-la. E corrige a leitura das réguas da Protótipo que o texto anterior fazia: a régua C_volume_fisico não separa nada em lugar nenhum, mas a D_explosao separa quem CAI do meio, firme nos dois cortes (A12_reguas.csv, Cai × Meio) — a frase certa é “não separam quem SOBE”, e não “não separam”.",
     "confianca": "indício",
     "confianca_motivo": "Indício porque não tem nenhum dos dois critérios da régua. (a) Correção para múltiplos testes a 5%: não — e resultado negativo não passa nela, ele é a ausência dela; nenhuma linha de Sobe × Meio ou de Sobe × Trave passa no critério, em nenhum dos dois cortes de fronteira, e com o desconto do rodízio que a especificação exige no físico o menor valor sobe ainda mais (0,52 em Sobe × Meio e 0,42 em Sobe × Trave). (b) Porta temporal da §6.4: não — nunca rodou nesta parte e não roda com o dado de hoje, porque não há físico por jogo antes de 2025. Poder: as linhas de Sobe × Meio e Sobe × Trave estão todas marcadas poder_suficiente=False, sem uma exceção — o menor efeito que este desenho enxergaria com 16 contra 48 equivale a 4,7 posições na tabela do ano, quase um quarto dela. Onde os dois cortes de fronteira trocam de sinal — acelerações fortes e distância em sprint contra a Trave, metros por minuto em Cai × Meio — o efeito é perto de zero dos dois lados, e nenhum deles vira frase. Cobertura: sai a frase “cobertura completa” que sustentava o selo firme, porque é falsa — pela conta absoluta (minutos rastreados sobre jogos × 11 × 90) a cobertura vai de 62% a 97% do possível, mediana 80%, o pior caso é um dos promovidos, e os 20 clube-temporada abaixo de três quartos foram rodados à parte, com o mesmo resultado. Vale ainda a ressalva declarada por escrito antes de rodar: correr muda com o placar, e esta base não permite o recorte. No ranking de corrida do próprio ano, a distância que separa quem subiu de quem ficou no meio vale 1 posição da tabela — e nenhum dos 12 indicadores físicos declarados separou quem sobe nos dois cortes de fronteira, nem depois de tirar os 20 clube-temporada com menos jogo rastreado, nem depois de descontar o tamanho do rodízio de elenco. Com todos os times, 9.644 contra 9.598 metros; sem os times que ficaram a três pontos da linha, 9.631 contra 9.597. A alta intensidade sem os de fronteira é 666 contra 652. O gráfico desta conclusão não mostra metros: mostra, em posições da tabela do ano, a diferença que vimos (1) e o mínimo que este estudo enxergaria (4,7).",
     "n": "16 que subiram contra 48 do meio (8 contra 32 sem os times de fronteira); contra a Trave, 16 contra 16 e 8 contra 7; 13 contra 36 quando saem os 20 clube-temporada com menos jogo rastreado. As 80 linhas são 40 clubes.",
     "prova": "A07_testes.csv, comparação SM e ST nos dois cortes de fronteira; A07_numeros_novos.json, tabela_d_rod_q_rod e rodada_sem_cobertura_baixa; A07_resumo.json, poder_por_desenho; A07_indicadores.json, ressalvas_declaradas",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Distância percorrida por jogo",
      "unidade": "metros",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Sobe",
          "valor": 9644
         },
         {
          "nome": "Meio",
          "valor": 9598
         }
        ]
       },
       {
        "rotulo": "sem os times de fronteira",
        "series": [
         {
          "nome": "Sobe",
          "valor": 9631
         },
         {
          "nome": "Meio",
          "valor": 9597
         }
        ]
       }
      ]
     }
    },
    {
     "id": "A07-2",
     "parte": "A07",
     "bloco": "A",
     "manchete": "Quem cai sprinta menos nos minutos sem a bola",
     "o_que_vimos": "A cada trinta minutos sem a bola, o time mediano dos rebaixados correu 91,1 metros em sprint contra 100,0 do meio. Descontado o rodízio de elenco, é o único número físico que continua separando quem cai. Esta amostra não diz se o sprint falta só sem a bola.",
     "para_o_santa_cruz": "Isto é sinal para medir no próprio time, não critério de contratação: a especificação (§5, armadilha a) já decidiu que correr sem a bola é a face física de pressionar alto — descreve o plano do treinador, não a qualidade do atleta, e não pode virar critério de compra. Se o elenco do Santa Cruz ficar na faixa dos 91,1 metros dos rebaixados, o assunto é o modelo de jogo e o tamanho do rodízio, não o mercado. E nada aqui autoriza dizer que sprintar mais evita a queda: o estudo só viu as duas coisas andando juntas na mesma temporada.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Ajusta a m1 (Time físico) pelo outro lado: o físico aparece contra a QUEDA, não a favor do acesso. E, pela §5 da especificação, correr sem a bola descreve o plano de jogo e não pode virar critério de compra — a premissa, que hoje diz “a intensidade é critério de escolha”, tem de separar as duas coisas. Sugere premissa nova: “o físico do elenco é escolha de modelo de jogo; mede-se o próprio time contra a régua da Série B, não se contrata por ele”.",
     "confianca": "provável",
     "confianca_motivo": "Provável porque tem um dos dois critérios da régua. (a) Correção para múltiplos testes a 5%: sim, e para um indicador só — o sprint nos minutos sem a bola, em Cai × Meio, passa nos dois cortes de fronteira, continua passando com o desconto do rodízio que a especificação exige no físico (0,0095 com os times de fronteira e 0,037 sem eles) e passa também sem os 20 clube-temporada de cobertura baixa, onde fica firme nos dois cortes. (b) Porta temporal da §6.4: não — não rodou e não roda, porque não há físico por jogo antes de 2025; por isso esta conclusão não passa de provável, por melhor que fique escrita. Os outros três números físicos que o texto anterior usava caem com o mesmo desconto: o sprint somado no jogo inteiro vai para 0,096 (com fronteira) e 0,086 (sem), o número de sprints para 0,108 (com fronteira) e 0,086 (sem) e a velocidade máxima para 0,238 (com fronteira) e 0,231 (sem) — ou seja, o rodízio EXPLICA o sprint total, ao contrário do que esta parte afirmava, e o PSV-99 sai da manchete e também do corpo do texto. O maior efeito da parte não é o sprint: é o rodízio (25,5 atletas rastreados contra 21, firme nos dois cortes), e é por isso que ele entra como desconto e não como comentário. Poder: só o corte com os times de fronteira tem poder suficiente, e no fio; a linha do corte sem eles está marcada poder_suficiente=False. Todo número de vitrine sai do corte com fronteira, com o corte sem ao lado e o n de cada um. Sem o físico por jogo de 2022 a 2024 nada disto sobe para firme, e correr muda com o placar, recorte que esta base não permite. No ranking do próprio ano, o sprint sem a bola dos rebaixados fica 4,5 posições abaixo do meio. Com a bola o buraco bruto vai na mesma direção (89,4 contra 99,1 metros), mas varia tanto de time para time que esta amostra não separa as duas fases: o estudo não consegue dizer onde exatamente falta o sprint. O sprint somado no jogo inteiro e a velocidade máxima deixam de separar com o desconto do rodízio, e esses números de corrida, o sprint sem a bola incluído, são média de cerca de 15 jogos por atleta rastreado, não de uma temporada inteira.",
     "n": "16 rebaixados contra 48 do meio (12 contra 32 sem os times de fronteira; 11 contra 36 quando saem os 20 clube-temporada com menos jogo rastreado).",
     "prova": "A07_testes.csv, comparação CM nos dois cortes de fronteira; A07_numeros_novos.json, tabela_d_rod_q_rod e rodada_sem_cobertura_baixa; A07_resumo.json, firme_nos_dois_cortes",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Sprint a cada trinta minutos sem a bola",
      "unidade": "metros",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Cai",
          "valor": 91.1
         },
         {
          "nome": "Meio",
          "valor": "100,0"
         }
        ]
       },
       {
        "rotulo": "sem os times de fronteira",
        "series": [
         {
          "nome": "Cai",
          "valor": 91.1
         },
         {
          "nome": "Meio",
          "valor": 100.9
         }
        ]
       }
      ]
     }
    }
   ],
   "em_aberto": "Falta virar arquivo, e não é escolha de método: as colunas d_rod/p_rod/q_rod em A07_testes.csv, a rodada sem os clube-temporada de cobertura baixa e os quatro ρ do rodízio em A07_resumo.json — todos já calculados e conferidos em A07_numeros_novos.json, que é a fonte dos números novos desta parte. Faltam também o A07.md (a prova em texto, que não existe e por isso saiu do campo prova) e o A07_numeros.json que a regra 1 do portão exige: enquanto ele não existir, nenhum marcador desta parte é conferível por máquina. Dois números continuam escritos à mão no texto por não haver marcador para eles: os 30 minutos sem a bola, que são a unidade do indicador, e os 38 jogos da temporada, com que se compara a média de cerca de 15 jogos por atleta que o rastreamento cobre. Decisão que sobe para o dono: copiar ou não o skillcorner.db do Portal Ranking, único caminho para o físico POR JOGO de 2022 a 2024 — sem ele a porta temporal da §6.4 não roda e nenhuma conclusão desta parte passa de provável. Separado disso, o recorte por estado do placar não existe em fonte nenhuma (o SkillCorner só guarda o jogo inteiro), então a ressalva do placar fica como texto, sem número.",
   "feita_em": null,
   "prova_arquivos": "scripts/A07.py (calcula e grava os 43 marcadores de A07_numeros.json, 24 reproduzidos do scripts/_rodar.py A07 e 19 novos — desconto do rodízio, rodada de cobertura e conversão para posições)"
  },
  {
   "id": "A08",
   "bloco": "A",
   "secao": "Que time montar",
   "pergunta": "Quem sobe perde menos intensidade do 1º para o 2º tempo e no fim do jogo?",
   "status": "validada",
   "titulo": null,
   "tipo": null,
   "conclusoes": [
    {
     "id": "A08-1",
     "parte": "A08",
     "bloco": "A",
     "manchete": "Esta base não mede o que o time faz dentro do jogo",
     "o_que_vimos": "As duas tabelas físicas têm 60 e 28 colunas, e 0 delas separam primeiro de segundo tempo. Na resposta crua do fornecedor são 31 medidas, todas do jogo inteiro. O único recorte que existe é com bola e sem bola, que é posse e não tempo.",
     "para_o_santa_cruz": "Não dá para escolher jogador nem treinador por 'aguenta os 90 minutos' com o que o clube tem hoje — quem disser isso está usando olho, não dado, e o olho aqui é legítimo desde que não se apresente como número. O que o estudo sustenta sobre desgaste é outra escala: o A10 mede do turno para o returno e diz que a queda existe, é de menos de 1% do que o jogador corria, e é a mesma para quem sobe e para quem fica no meio. Se o clube quiser a resposta de dentro do jogo, ela se compra: é pergunta para o fornecedor de dado físico, com custo, e não trabalho de análise.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Não mexe em premissa nenhuma: ausência de dado não confirma nem contradiz o que o clube acredita. Se alguém tratasse isto como prova de que o desgaste não importa, estaria lendo ausência de medida como ausência de efeito.",
     "confianca": "indício",
     "confianca_motivo": "Indício, e o nível está certo: não há teste, então não há como passar em critério nenhum. O que existe é uma CONTAGEM, e ela é decisiva no que afirma. (a) Nas duas tabelas físicas, 0 de 60 + 28 colunas trazem qualquer marca de período — procurei por period, half, 1st, 2nd, faixa de 15 minutos, phase, segment e window, e a lista de busca é generosa de propósito, porque ela existe para ACHAR o recorte. (b) Na resposta crua da API, guardada em raw_json e lida sobre 3.613 linhas, toda métrica vem com o sufixo `_full_all_`: `full` é o jogo inteiro e `all` são todas as fases. São 31 chaves e 0 com recorte de tempo. Isto é o que fecha a pergunta, e é do dado, não de quem escreve. (c) O TIP/OTIP existe e engana: são 34 colunas de recorte abaixo do jogo inteiro, o que pode dar a impressão de que a base desce ao detalhe. Desce — mas por POSSE, não por tempo. Quem cruzar as duas coisas conclui errado. (d) E mesmo por jogo o recorte é raso: a tabela por jogo cobre 2025 (374) · 2026 (207), e cada linha é o jogo inteiro. É o mesmo limite que prendeu o A10 a 2025. O QUE ESTA CONTAGEM NÃO PROVA, e precisa estar dito porque a manchete é negativa: não prova que o rendimento não cai dentro do jogo; não prova que a queda não separaria quem sobe do meio; e não prova que o fornecedor não venda o recorte por período. Nenhuma das três foi medida. O que está medido é uma coisa só — a cópia que este estudo tem não permite a pergunta. POR QUE ISSO É CONCLUSÃO E NÃO SILÊNCIO: a regra da casa diz que resultado negativo também é conclusão, e uma pergunta que fica pendente para sempre, sem ninguém dizer por quê, vira dívida invisível. Escrita assim, ela tem preço e destinatário: é uma compra, não uma análise por fazer.",
     "n": "0 colunas de período em 60 + 28 das duas tabelas físicas, e 0 chaves de tempo em 31 da API, sobre 3.613 linhas de jogador-temporada",
     "prova": "resultados/A08_resumo.json e scripts/A08.py, contra dados_copiados/skillcorner_serieb.db",
     "status": "validada",
     "negativa": true,
     "grafico": null
    }
   ],
   "em_aberto": "A pergunta continua de pé; o que falta é dado. Resolveria uma coleta com recorte por período, se o fornecedor o vender — e isso é pergunta para ele, não para esta base. Ao contrário da A09, aqui não há atalho: a A09 foi salva porque o oGol publicava a soma por faixa de minuto de graça, e não existe equivalente para dado físico. Enquanto isso, a única leitura de desgaste que o estudo tem é a do A10, entre turno e returno, que é outra escala: ela fala de meses, esta falaria de minutos.",
   "feita_em": null,
   "prova_arquivos": "scripts/A08.py"
  },
  {
   "id": "A09",
   "bloco": "A",
   "secao": "Que time montar",
   "pergunta": "Em que faixas de minutos cada faixa marca e sofre, e como reage ao placar?",
   "status": "validada",
   "titulo": null,
   "tipo": null,
   "conclusoes": [
    {
     "id": "A09-1",
     "parte": "A09",
     "bloco": "A",
     "manchete": "Quem sobe sofre metade dos gols do meio antes do intervalo",
     "o_que_vimos": "Entre 30 e 45 minutos quem sobe sofre 0,08 gol por jogo contra 0,16 do meio, e ali também marca mais, 0,18 contra 0,13. Sem os times colados na linha do acesso a distância se mantém, 0,07 contra 0,16. É a única faixa em que quem sobe se separa dos dois lados.",
     "para_o_santa_cruz": "O quarto de hora antes do intervalo é onde o jogo de quem sobe se decide, e é decisão de treino e de modelo, não de contratação: não dar o gol antes do intervalo vale tanto quanto fazê-lo. Vale como pergunta ao treinador em T04 — como ele fecha o primeiro tempo — e não como requisito de jogador em J05. Quem cai não se distingue nessa faixa (0,18 sofridos por jogo, perto do meio), então isto separa o topo, não o fundo.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere premissa nova, grupo Modelo: fechar o primeiro tempo sem sofrer é traço de quem sobe. Nenhuma premissa atual de dados/premissas.json fala de momento do jogo.",
     "confianca": "provável",
     "confianca_motivo": "Provável porque cumpre UM dos dois critérios, e o outro não existe nesta base. (a) Correção para múltiplos testes a 5% dentro da família `sofre` (os 8 recortes de minuto juntos): PASSA, e nos DOIS cortes de fronteira — q 0,00001 com todos os times e 0,00017 sem os colados na linha, com d 1,448 e 1,358 contra um mínimo detectável de 0,82. É o achado mais forte das 120 comparações da parte. (b) Porta temporal da §6.4: NÃO RODA, e é limite de dado, não reprovação: o oGol publica a conta da temporada fechada, sem corte por rodada, então não há como medir as 19 primeiras e prever as 19 últimas. Um sim e um impossível = provável, e está declarado assim em A09_indicadores.json desde antes de rodar. SOBRE O GARIMPO: foram 8 faixas de minuto testadas para `sofre` e 8 para `marca`, e é por isso que a família é o conjunto das 8 e não cada faixa sozinha — corrigir uma de cada vez seria escolher a melhor entre muitas, que a §6.6 proíbe. A faixa 30-45 sobrevive à correção do conjunto. SOBRE A LEITURA SECUNDÁRIA: contra a Trave (5º a 8º) o mesmo achado é firme com os times de fronteira (q 0,00546) e perde o selo sem eles (q 0,18930), com apenas 8 contra 7 clube-temporadas — por isso a conclusão fala de Sobe × Meio e não do topo inteiro. O QUE A FONTE NÃO PERMITE CONFERIR: a contagem por faixa vem AGREGADA do oGol, não de evento. Não dá para recontar gol a gol, não há autor, não há mando e não há qual time marcou primeiro. A única conferência possível foi o total de gols por temporada contra a base do app, e ela está em A09_resumo.json: 2023 e 2025 batem exatamente; 2022 tem 2 gols a mais no oGol e 2024 tem 5, o que é coerente com os 5 jogos que o A01 já registrou como faltando na base do app.",
     "n": "16 promovidos contra 48 do meio em 80 clube-temporadas de 2022-2025 (8 contra 32 sem os times colados na linha)",
     "prova": "resultados/A09_testes.csv, família `sofre`, Sobe × Meio, nos dois cortes; dados/serieb_gols_por_minuto.csv; resultados/A09_resumo.json",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Gols sofridos entre 30 e 45 minutos",
      "unidade": "gols sofridos por jogo",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Sobe",
          "valor": 0.08
         },
         {
          "nome": "Meio",
          "valor": 0.16
         }
        ]
       },
       {
        "rotulo": "sem os times de fronteira",
        "series": [
         {
          "nome": "Sobe",
          "valor": 0.07
         },
         {
          "nome": "Meio",
          "valor": 0.16
         }
        ]
       }
      ]
     }
    },
    {
     "id": "A09-2",
     "parte": "A09",
     "bloco": "A",
     "manchete": "Quem cai sofre mais nos dois tempos, e não num momento só",
     "o_que_vimos": "Quem cai sofre 0,63 gol por jogo no primeiro tempo contra 0,45 do meio, e 0,75 contra 0,55 no segundo. Marca menos no primeiro, 0,41 contra 0,49. Sem os times colados na linha a conta aumenta em vez de encolher, 0,67 contra 0,45.",
     "para_o_santa_cruz": "Não existe ajuste de momento que salve quem cai: o problema é nível o jogo inteiro, e é por isso que o físico de fim de jogo não entra na régua de contratação (o A10 já dizia o mesmo pelo outro lado). O que se compra contra o rebaixamento é nível de elenco, não fôlego para os últimos quinze minutos. Uma ressalva que muda a leitura: quem cai também marca menos no segundo tempo, mas isso só aparece com os times colados na linha na conta e some sem eles — por isso a frase acima fala do primeiro tempo, e só dele.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Não mexe em premissa: reforça pelo avesso o que o A10-3 já disse sobre quem cai ser elenco, e não cansaço.",
     "confianca": "provável",
     "confianca_motivo": "Provável pelo mesmo motivo do A09-1: passa na correção para múltiplos testes e a porta temporal não roda nesta base. Na família `tempo` (4 testes), Cai × Meio: gols sofridos no 1º tempo q 0,00767 com todos os times e 0,00419 sem os colados na linha; no 2º tempo 0,00072 e 0,00444; gols marcados no 1º tempo 0,00839 e 0,00693. Todos firmes NOS DOIS cortes. RESSALVA QUE MUDA A FRASE: gols marcados no 2º tempo NÃO sobrevivem aos dois cortes — q 0,00839 com os times de fronteira e 0,05818 sem eles —, e por isso a conclusão diz que quem cai marca menos no PRIMEIRO tempo, e não nos dois. Era a frase fácil e é a frase errada.",
     "n": "16 rebaixados contra 48 do meio (12 contra 32 sem os times colados na linha)",
     "prova": "resultados/A09_testes.csv, família `tempo`, Cai × Meio, nos dois cortes",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Gols sofridos no primeiro tempo",
      "unidade": "gols sofridos por jogo",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Cai",
          "valor": 0.63
         },
         {
          "nome": "Meio",
          "valor": 0.45
         }
        ]
       },
       {
        "rotulo": "sem os times de fronteira",
        "series": [
         {
          "nome": "Cai",
          "valor": 0.67
         },
         {
          "nome": "Meio",
          "valor": 0.45
         }
        ]
       }
      ]
     }
    },
    {
     "id": "A09-3",
     "parte": "A09",
     "bloco": "A",
     "manchete": "Os acréscimos não separam ninguém, nem no fim nem antes do intervalo",
     "o_que_vimos": "No acréscimo do 2º tempo quem sobe marca 0,12 gol por jogo contra 0,08 do meio, e não resiste — no do 1º também não. Entre 15 e 30 e entre 60 e 75 ele marca mais só com os times colados na linha na conta. Achado que existe num corte só não é achado.",
     "para_o_santa_cruz": "Não vale montar elenco nem discurso para \"decidir no fim\": o acréscimo é onde a base tem menos gol e menos poder para enxergar diferença. Se o clube quiser vantagem no fim de jogo, o número que sustenta isso é o dos 75 aos 90 minutos do A09-1, não o do acréscimo.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Não confirma nem contradiz premissa: é ausência de achado, e ela não vira regra.",
     "confianca": "indício",
     "confianca_motivo": "Indício porque não cumpre nenhum dos dois critérios, e a frase diz por quê. (a) Correção para múltiplos testes: com todos os times, NENHUM dos quatro indicadores de acréscimo passa em comparação nenhuma — o menor q é 0,05439 (gols marcados no acréscimo do 1º tempo, Cai × Meio), que é \"pode ser sorte\". (b) Porta temporal: não roda nesta base, como nas outras conclusões da parte. O QUE APARECE SÓ NUM CORTE, e é a razão de a conclusão ser negativa em vez de positiva: sem os times colados na linha, os gols sofridos no acréscimo final ficam firmes em Sobe × Meio (q 0,00024, 0,05 contra 0,08 por jogo) e os marcados no acréscimo do 1º tempo ficam firmes em Cai × Meio (q 0,04555) — e os dois somem com os times de fronteira na conta (0,29354 e 0,05439). A regra 4 do _metodo_fronteira.md é explícita: firme só sem fronteira é suspeito, não promovido. AS OUTRAS FAIXAS QUE SÓ APARECEM NUM CORTE, e que o texto agora cita: gols marcados entre 15 e 30 minutos, Sobe × Meio, passa com todos os times (q 0,00691) e não passa sem os colados na linha (0,05190); gols marcados entre 60 e 75, Sobe × Meio, 0,04656 com e 0,12097 sem; e gols marcados entre 15 e 30, Cai × Meio, ao contrário — 0,05439 com e 0,04555 sem. Nenhuma das três entra como achado, pela mesma regra 4 do _metodo_fronteira.md. SOBRE O PODER: o acréscimo é a faixa com menos gol da tabela — mediana de 0,04 gol por jogo no acréscimo do 1º tempo —, então \"não separa\" aqui quer dizer o que a §6.7 manda dizer: este desenho não conseguiria ver uma diferença menor do que 0,82 de efeito, e não que a diferença não exista.",
     "n": "16 promovidos contra 48 do meio; no corte reduzido são 8 contra 32, e o efeito mínimo detectável sobe junto",
     "prova": "resultados/A09_testes.csv, família `marca` e família `sofre`; resultados/A09_resumo.json",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "grupos",
      "titulo": "Gols no acréscimo do segundo tempo, com todos os times",
      "unidade": "gols por jogo",
      "series": [
       {
        "nome": "Sobe",
        "valor": 0.12
       },
       {
        "nome": "Meio",
        "valor": 0.08
       }
      ]
     }
    }
   ],
   "em_aberto": "A metade da pergunta que fala de PLACAR não roda: saber o aproveitamento de quem marca primeiro e de quem sofre primeiro exige o primeiro gol de CADA jogo, e a tabela agregada do oGol não traz evento nenhum — só a soma por faixa. O caminho está escrito no cabeçalho do coletar_serieb_gols_por_minuto.py: a página de cada jogo tem o minuto preso ao jogador que marcou e o lado sai da classe do bloco, cerca de 1.780 páginas no ritmo educado das outras coletas. Também não roda a porta temporal: o oGol publica a conta da temporada FECHADA, sem corte por rodada, então nenhuma conclusão desta parte pode passar de provável mesmo passando na correção — e nenhuma passa. E o cruzamento com a queda física do fim de jogo, que o CLAUDE.md pede, depende de A08, que não roda porque o SkillCorner guarda um período só.",
   "feita_em": null,
   "prova_arquivos": "scripts/A09.py (a análise) e coletar_serieb_gols_por_minuto.py (a coleta do oGol, 18 páginas, 20/09/2026)"
  },
  {
   "id": "A10",
   "bloco": "A",
   "secao": "Que time montar",
   "pergunta": "Quem sobe sustenta a intensidade no returno e em sequências de jogos?",
   "status": "validada",
   "titulo": "Físico ao longo da temporada: o returno de 2025 e o calendário curto nas duas temporadas medidas",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "A10-1",
     "parte": "A10",
     "bloco": "A",
     "manchete": "Em 2025 quem subiu perdeu no returno os mesmos 100 metros que o meio",
     "o_que_vimos": "Na média, do 1º para o 2º turno o mesmo jogador perde 74 metros por noventa minutos, 0,8% do que corria. A perda não separa quem subiu do meio. Sprint e alta intensidade chegam a separar com os times colados na linha do acesso na conta, e não separam sem eles.",
     "para_o_santa_cruz": "Não vale montar elenco para “aguentar o returno”: a queda de fim de temporada existe, mas é de 0,8% do que o jogador corria e é a mesma para quem sobe e para quem fica no meio. O físico entra em J05 como exigência de nível, como o A07 já apontava, e não como reserva de fôlego. E a diferença de ponto de 2025 aparece no 2º turno (1,71 contra 1,34, e num corte só), não no 1º (1,58 contra 1,37, que não passa no critério) — quem responde a pergunta da trajetória é A13, não esta parte.",
     "premissa": "m1",
     "premissa_titulo": "Time físico",
     "premissa_grupo": "Montagem do elenco",
     "premissa_motivo": "Ajusta a m1 (Time físico): a intensidade segue valendo como critério de nível na contratação, mas não como sustentação ao longo da temporada — a queda de returno existe, é de 0,8% do que o jogador corria, e não separa quem subiu do meio.",
     "confianca": "indício",
     "confianca_motivo": "(a) Correção para múltiplos testes a 5% dentro da família: não passa NADA — e é esse o achado. São 96 linhas em A10_testes.csv (2025, leitura principal, comparação SM, pilares fisico_*), 93 com selo “sem diferença clara” e 3 com “pode ser sorte”, menor q 0,29536 (high_accel_p90 em delta_descanso, sem fronteira); na leitura por setor são 64 testes, menor q 0,90502 com fronteira e 0,32704 sem. (b) Porta temporal da §6.4: não. Para returno e delta_turno ela não roda por construção (a medida já contém o 2º turno, que é o desfecho) e, onde roda (medida turno), nenhum dos 8 indicadores passa: a parcial precisaria de ~0,46 e a maior é 0,305 (distance_p90, p 0,204), com 20 clubes de uma temporada. Zero de dois = indício pela letra do CLAUDE.md:51. É um nada medido COM poder — o desenho do jogador enxerga d a partir de 0,48 e nada chega perto —, mas é uma temporada só e a leitura vem depois do desfecho; o “provável” de antes se apoiava em “resultado negativo medido com poder”, que não é nenhum dos dois critérios da régua (mesma correção que a v1 fez em A11-3, um negativo idêntico a este). No nível clube-temporada são 4 contra 12 e o desenho só enxergaria d ≥ 1,74: ali “não separa” quer dizer “este desenho não conseguiria ver”, e por isso o nível principal é o do jogador. ROBUSTEZ RESOLVIDA: o “passa pelo zero” estava citado de um lado só. O intervalo por clube da liga vai de −157 a +7 metros e encosta no zero, mas o mesmo cálculo dentro do Sobe vai de 43 a 152 metros e NÃO encosta (em metros por minuto, de −1,69 a −0,48), e o teste contra zero da linha da liga dá p 0,0006 — o mesmo teste que a parte citava quando ele favorecia. Por isso a manchete deixa de dizer que não existe queda para medir: a queda existe, é pequena, e o que é nulo é a DIFERENÇA entre as faixas. O número que o texto publica é a MÉDIA da liga; pela mediana a queda da liga é de 98 metros, e por faixa as medianas são 100 no Sobe contra 101 no meio — a diferença entre as faixas continua nula nos dois jeitos de contar, e é por isso que a manchete usa a mediana e o que vimos diz “na média”. Nos dois cortes de fronteira o veredito da diferença é o mesmo. DA PASSADA DE TEXTO: o que saiu do que vimos e fica aqui. A queda por faixa, que agora está no gráfico nos dois jeitos de medir: pela mediana 100 metros em quem subiu contra 101 no meio, e pela média 101 contra 71 — nos dois a diferença não sustenta nada, e o gráfico traz as quatro séries juntas justamente para que o empate da mediana não seja lido como distância (a régua do desenho se estica entre o menor e o maior valor do próprio gráfico). A perda em si é real: contando clube a clube, dentro do Sobe ela vai de 43 a 152 metros e não encosta no zero, enquanto na liga inteira o intervalo ainda encosta, de −157 a +7 metros. Das 96 comparações físicas entre quem subiu e o meio, nenhuma passou no critério, nos dois cortes de fronteira. E a diferença de ponto do 2º turno (1,71 contra 1,34) tem um corte só: sem os times de fronteira sobram 2 clubes no Sobe e a conta não roda.",
     "n": "47 jogadores de quem subiu contra 135 do meio (4 clubes contra 12), só 2025",
     "prova": "A10.md, seção A prova; A10_testes.csv (2025, leitura principal, comparação SM, pilares fisico_*: as 96 linhas, e as 64 da leitura por setor); A10_resumo.json, o_que_cai_antes_de_perguntar_de_quem (medida delta_turno, distance_p90, faixas todos / Sobe / Meio, com o IC por clube e o p contra zero) e porta_temporal",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "grupos",
      "titulo": "Queda do 1º para o 2º turno, pela mediana e pela média",
      "unidade": "metros por 90 minutos",
      "series": [
       {
        "nome": "Sobe, pela mediana",
        "valor": 100
       },
       {
        "nome": "Meio, pela mediana",
        "valor": 101
       },
       {
        "nome": "Sobe, pela média",
        "valor": 101
       },
       {
        "nome": "Meio, pela média",
        "valor": 71
       }
      ]
     }
    },
    {
     "id": "A10-2",
     "parte": "A10",
     "bloco": "A",
     "manchete": "Semana de três jogos: os dois anos medidos dizem o contrário um do outro, e não dá para montar elenco por isso",
     "o_que_vimos": "Em 2025, no jogo com menos de quatro dias de descanso o mesmo jogador correu igual ou um pouco mais (42 metros por 90 a mais, 8 metros de sprint, 0,19 km/h no pico, todos com o intervalo entre clubes encostando no zero) e o clube fez 1,10 ponto por jogo contra 1,37 nos jogos normais — 61 jogos curtos contra 697. Em 2026 a mesma conta inverte, e com mais força do que 2025 jamais teve: o mesmo jogador corre 174 metros por 90 a MENOS no jogo curto (1,8% do que corre), com intervalo de −290 a −52 metros que não encosta no zero, mais 51 metros de corrida e 1,93 metro por minuto a menos — e o ponto não cai (1,37 no curto contra 1,36 no normal, 75 jogos curtos contra 459, 217 jogadores em 18 clubes). A inversão não é falta de rastreamento: refazendo a conta sem os 7 clubes de cobertura baixa de 2026 ela continua (151 metros a menos, 149 jogadores), e 2026 tem quase o dobro de jogo curto que 2025 (15,9% dos jogos de quem lidera contra 8,6%).",
     "para_o_santa_cruz": "Não dá para decidir nada de calendário com o que existe hoje: nas duas únicas temporadas medidas o jogo de três em três dias mudou de sinal nas duas contas, corrida e ponto. A m6 (logística e recuperação) continua valendo como cuidado de gestão, mas sem número atrás — não serve de argumento para comprar “motor”, nem para prometer que o time pontua igual em semana cheia. O que resolve é a temporada de 2026 fechada, que já está sendo rastreada; até lá isto é aviso, não conclusão.",
     "premissa": "m6",
     "premissa_titulo": "Logística diferenciada para a Série B",
     "premissa_grupo": "Montagem do elenco",
     "premissa_motivo": "Nem confirma nem contradiz a m6 (Logística diferenciada para a Série B): com duas temporadas de sinal oposto, a premissa fica sem teste. O que muda é a ressalva ao lado dela: nada em A10 sustenta hoje o efeito do calendário apertado, em direção nenhuma.",
     "confianca": "indício",
     "confianca_motivo": "CAI COMO AFIRMAÇÃO — é a decisão da proposta v2 validada pelo dono em 19/09, aplicada aqui. Ela não foi apagada: fica como não-resultado em “Parece, mas não é”, no piso da régua, e quem decide se permanece na tela ou vai inteira para o que ficou em aberto é o dono. POR QUE CAIU: o efeito troca de sinal entre as duas únicas temporadas medidas, e nas DUAS metades da conclusão. Corrida: 2025 dá +42 metros por 90 (intervalo por clube de −91 a +148 metros, encosta no zero) e 2026 dá −174 metros (intervalo de −290 a −52 metros, não encosta), com a inversão aparecendo nos oito indicadores físicos. Ponto: 2025 dá 1,10 no curto contra 1,37 no normal; 2026 dá 1,37 contra 1,36. O texto anterior usava uma frase verdadeira sobre o RETURNO de 2026 (“1 ou 2 jogos rastreados por clube”) para dispensar 2026 inteira, inclusive na metade em que 2026 TEM teste: o próprio A10_resumo.json declara que delta_descanso roda em 2026. A conta de 2026 foi refeita a partir de A10_base.csv replicando as regras declaradas (mínimo de 1 jogo curto e 3 normais, filtro de 60 minutos), bate com o A10_resumo.json na casa decimal, e tirando os 7 clubes de cobertura baixa continua invertida. (a) Correção para múltiplos testes a 5%: não. Nas 96 linhas físicas de Sobe × Meio da leitura principal nada passa, e as duas medidas que o texto usava para afirmar (8 metros de sprint e 0,19 km/h no pico) não são comparação entre faixas: são teste contra zero dentro do jogador, e os dois intervalos por clube cruzam o zero (−2,7 a +19,1 metros; −0,02 a +0,38 km/h). No ponto, a queda dentro do clube é de 0,36 ponto por jogo, intervalo de −0,78 a +0,10 e p 0,14189 contra zero — não 0,139, como se escreveu; e o corte de sensibilidade de menos de 5 dias, citado antes com p 0,166, NUNCA foi rodado sobre os pontos (jogo_curto_ate4 existe em A10_base.py, linhas 320 e 394, e A10.py não o usa em lugar nenhum). (b) Porta temporal da §6.4: não roda para delta_descanso — a medida já contém o desfecho. Zero de dois = indício, e aqui o motivo do indício mudou de natureza: não é mais “efeito fraco”, é “efeito que troca de sinal entre as duas únicas temporadas medidas”, e isso derruba a afirmação em vez de só rebaixá-la. Some-se que 55% das unidades de jogador têm o lado “curto” medido em UM único jogo (MIN_JOGOS_CURTO = 1, declarado antes de rodar), o que sozinho explica a largura dos intervalos.",
     "n": "20 clubes e 61 jogos curtos em 2025 (280 jogadores); 18 clubes e 75 jogos curtos em 2026 (217 jogadores) — uma temporada fechada e uma parcial",
     "prova": "A10_resumo.json, o_que_cai_antes_de_perguntar_de_quem.medido (2025 e 2026, medida delta_descanso, faixa todos: os oito indicadores físicos, com média, IC por clube e p contra zero) e placar.o_placar_muda_com_o_descanso.medido (ponto por jogo no curto e no normal, nas duas temporadas); A10_resumo.json, o_que_a_temporada_de_2026_pode_testar e confundidor_do_calendario; A10_indicadores.json, seção descanso",
     "status": "removida",
     "negativa": true,
     "grafico": null
    },
    {
     "id": "A10-3",
     "parte": "A10",
     "bloco": "A",
     "manchete": "Quem caiu em 2025 corria menos forte que o meio desde o 1º turno",
     "o_que_vimos": "No 1º turno os rebaixados já correm 618 metros em alta intensidade por noventa minutos contra 690 do meio, e só dentro do próprio setor. Sem os times colados na linha a conta se inverte: o sprint separa e a alta intensidade não. Não é cansaço, é elenco.",
     "para_o_santa_cruz": "Quem caiu usou 35,9 atletas por meia temporada contra 29,1 de quem subiu: o risco da temporada longa não é o elenco cansar, é o elenco não ter o nível e ainda virar outro no meio do ano — o que conversa com as premissas m2 e m3. Núcleo fixo e minutagem concentrada valem mais que reforço de meio de temporada. Na régua de contratação (J05), sprint e alta intensidade entram como corte de nível do elenco inteiro, e não como prova de resistência para o fim do campeonato.",
     "premissa": "m3",
     "premissa_titulo": "Titulares consolidados, reservas com potencial",
     "premissa_grupo": "Montagem do elenco",
     "premissa_motivo": "Confirma a m2 e a m3 por um caminho novo: o lado fraco da tabela é o que mais troca de gente no meio da temporada. Converge com o A07-2 (quem cai sprinta menos) e NÃO localiza o achado no tempo — a diferença já está no 1º turno, e era a escolha de leitura que a empurrava para o returno.",
     "confianca": "provável",
     "confianca_motivo": "(a) Correção para múltiplos testes a 5% dentro da família (fisico_ind × Cai vs Meio, 32 testes): SIM nos dois cortes, na leitura principal — sprint por 90 no returno, q 0,04872 com os times de fronteira e q 0,03008 sem (A10_testes.csv, 2025, principal, jogador_jogo, posto_no_ano). Mas o “nos dois cortes” vale só nessa leitura: por setor o mesmo teste dá 0,05632 com fronteira e 0,02656 sem; no nível do clube, 0,14208 com e 0,01776 sem. Em todas elas o corte que FALHA é o com fronteira — ou seja, o achado nunca depende dos times de fronteira, que é exatamente o que a regra do CLAUDE.md proíbe. (b) Porta temporal da §6.4: não. Para returno ela não roda (a medida contém o desfecho) e, onde roda (medida turno), nenhum dos 8 indicadores passa: a parcial precisaria de ~0,46 e a maior é 0,305. Um sim de dois = provável, e o teto de A10 é provável por construção. ROBUSTEZ RESOLVIDA, dois casos. (1) Leitura por setor: nela o sprint do returno passa em um corte só, e o sinal do Cai aparece no 1º turno, em alta intensidade, aí sim nos dois cortes (618 contra 690 metros por 90; q 0,02656 com e 0,03264 sem, com nos_dois_cortes = true no próprio A10_resumo.json); no nível do clube a mesma coisa, e no 1º turno sem fronteira passam velocidade de pico, número e distância de sprint. Por isso a manchete deixa de localizar o achado no returno, passa a dizer “desde o 1º turno”, e some o “único sinal físico”: ele só era único dentro da leitura principal. (2) Recorte por placar: os três valores que o texto citava (q 0,30 / 0,78 / 0,26) são só do corte com fronteira; sem fronteira o recorte de vitória PASSA (q 0,0345; 5,1 sprints por 90 contra 8,2), o que ALIVIA a marca “pode ser efeito do placar” em vez de reforçá-la — mas são 7 jogadores de 2 clubes, então a marca FICA, agora com os dois lados escritos e o n do lado que passa. É leitura de nível e de composição de elenco, não de fadiga: a mesma medida dentro do jogador não acusa queda nenhuma no Cai. DA PASSADA DE TEXTO: o que saiu do que vimos e fica aqui. Os dois cortes do sprint do returno, que agora estão no gráfico (7,4 contra 8,8 com os times de fronteira, 7,3 contra 9,1 quando se tiram os times a três pontos da linha) — é a única medida física que passa no critério nos dois cortes. A diferença de alta intensidade do 1º turno (618 contra 690 metros) passa nos dois cortes quando cada jogador é comparado dentro do próprio setor, e na conta sem setor o 1º turno não passa em corte nenhum. E dentro do mesmo jogador o rebaixado até sprinta um pouco mais no returno (+0,1 sprint por 90), o que é mais um argumento contra a leitura de cansaço. O gráfico desta conclusão é o sprint do returno, que é a metade que passa nos dois cortes na leitura principal; a metade do 1º turno, que a manchete também cobre, não tem figura porque os valores de alta intensidade sem fronteira não existem em numeros nem em A10_numeros.json.",
     "n": "71 jogadores de quem caiu contra 199 do meio no returno (4 clubes contra 12) e 83 contra 215 no 1º turno; só 2025",
     "prova": "A10_testes.csv, linhas 168 e 200 (2025, principal, jogador_jogo, CM, returno, sprint_count_p90, cortes com e sem fronteira) e 360 / 392 / 424 (o mesmo indicador nos recortes de placar D / E / V) — os cinco ponteiros antigos apontavam para psv99, duas linhas acima; A10_testes.csv na normalização posto_no_ano_x_setor (2025, CM, turno, hi_distance_p90, os dois cortes); A10_resumo.json, nos_dois_cortes e rodizio.atletas_distintos_por_meio",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Sprints no 2º turno",
      "unidade": "sprints por 90 minutos",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Cai",
          "valor": "7,4"
         },
         {
          "nome": "Meio",
          "valor": "8,8"
         }
        ]
       },
       {
        "rotulo": "sem os times de fronteira",
        "series": [
         {
          "nome": "Cai",
          "valor": "7,3"
         },
         {
          "nome": "Meio",
          "valor": "9,1"
         }
        ]
       }
      ]
     }
    }
   ],
   "em_aberto": "Falta a segunda temporada FECHADA. No returno, com físico por jogo só em 2025, nada aqui é “quem sobe” — é “quem subiu em 2025”. No calendário é pior: 2025 e 2026 já dizem o contrário uma da outra, e só 2026 completa desempata (2022–2024 não tem physical_match na fonte). E o descanso de dois clubes (Amazonas e Cuiabá) é, na prática, descanso só de Série B: serieb_jogos.csv não tem nenhum jogo deles fora da competição em 2025 — os dois são Cai e Meio, nenhum é do Sobe.",
   "feita_em": null,
   "prova_arquivos": "scripts/A10_base.py + scripts/A10.py + scripts/_metodo.py"
  },
  {
   "id": "A11",
   "bloco": "A",
   "secao": "Que time montar",
   "pergunta": "A intensidade vira ação e resultado?",
   "status": "validada",
   "titulo": "Físico e técnico: a intensidade vira ação e resultado?",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "A11-1",
     "parte": "A11",
     "bloco": "A",
     "manchete": "Quem corre para dentro da área entra mais na área, não quem corre mais",
     "o_que_vimos": "O terço que mais corre para dentro da área faz 23,4 entradas na área por jogo, contra 20,4, e cria 1,28 de xG contra 1,11. Já o terço que mais percorre metros faz 21,9 entradas contra 21,6, e cria o mesmo xG.",
     "para_o_santa_cruz": "Conversa com o A02: lá, quem sobe finaliza de mais perto, com mais toques e mais entradas na área — mas toques e entradas na área só ficam firmes com os times de fronteira dentro, então cite sempre com essa ressalva. Aqui aparece a ação física que produz a entrada na área, e não é volume de corrida: é corrida para dentro da área. Em J05 o requisito físico do ataque é corrida para a área como peça do modelo de jogo, não como filtro de quem sobe — o A07 já mostrou que nenhum indicador de corrida separa quem sobe.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere uma premissa nova que ajusta a m1 (Time físico) sem contradizê-la: no físico ofensivo, a direção da corrida vale mais que o volume — pedir corrida para dentro da área, não metros percorridos.",
     "confianca": "provável",
     "confianca_motivo": "Provável: passa em um dos dois critérios da régua, e este é o teto de toda a A11. (1) Benjamini-Hochberg a 5% dentro da família com_bola: PASSA — corridas para a área × entradas na área (0,47, q 0,00004) e × xG (0,5, q 0,00001) são as duas únicas firmes da família em A11_correlacoes.csv, e as 17 correlações foram refeitas da base sem divergência. (2) Porta temporal da §6.4 (1º turno prevendo o 2º): NÃO — nunca rodou nesta parte e não tem como rodar, porque o físico por jogo do repositório só existe em 2025 e 2026 e a §6.5 diz que quem não tem versão por jogo não chega à porta A. O achado resiste aos três cortes: com as 80 linhas, sem os times colados nas linhas (0,48 e 0,5, n = 52) e sem os 20 de cobertura física baixa (0,51 e 0,62, n = 60), onde fica mais forte — não é achado que só aparece com os times de fronteira. Ressalvas obrigatórias: pode ser efeito do placar, porque correr para a área e entrar na área sobem juntos em quem está atrás e a base não permite o recorte; o xG tem confiabilidade medida 0,3, abaixo do piso de 0,40, então a metade da frase que se apoia nele entra com a régua curta e a leitura se apoia primeiro em entradas na área; associação no mesmo ano não é causa; e o intervalo tem de vir por reamostragem de clube — [0,26; 0,64] para entradas na área e [0,33; 0,65] para xG —, não da conta de Fisher que está hoje na coluna ic95 do CSV, que supõe 80 linhas independentes quando são 40 clubes. O menor efeito que estas 80 linhas enxergariam é 0,31; o rerun independente da auditoria chegou a 0,444 e 0,500 no corte sem fronteira, mesmo selo e número um pouco diferente, e vale pinar qual é quando o script passar a gravar os cortes. Saíram do texto de 2 minutos e ficam aqui, sem perder nada: os terços de corrida para dentro da área são 3,6 contra 2,5 corridas a cada 30 minutos com a bola, e 23 dos 28 times do terço de cima estão na metade de cima em entradas na área, contra 8 do terço de baixo. O gráfico da conclusão põe os quatro pontos na MESMA régua, em entradas na área por jogo: os terços por corrida para a área e os terços por metros percorridos, que é o par que mostra que o volume não move a entrada na área. Ele é do tipo grupos, e não dois_cortes, porque os dois painéis seriam duas comparações diferentes na mesma amostra cheia, não o mesmo par com e sem os times colados nas linhas — sem fronteira esta conclusão só tem correlação (0,48 e 0,5), não média de terço, então o corte de fronteira continua só aqui, em texto.",
     "n": "80 clube-temporadas (40 clubes, 2022–2025); 52 sem os times colados nas linhas e 60 só com cobertura física de 0,75 para cima, onde a relação fica mais forte",
     "prova": "A11_correlacoes.csv, família com_bola",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "grupos",
      "titulo": "Entradas na área, pelos terços de corrida para a área e de metros percorridos",
      "unidade": "por jogo",
      "series": [
       {
        "nome": "Mais à área",
        "valor": 23.4
       },
       {
        "nome": "Menos à área",
        "valor": 20.4
       },
       {
        "nome": "Mais metros",
        "valor": 21.9
       },
       {
        "nome": "Menos metros",
        "valor": 21.6
       }
      ]
     }
    },
    {
     "id": "A11-2",
     "parte": "A11",
     "bloco": "A",
     "manchete": "Correr sem a bola sobe a linha de pressão, mas não aparece nas recuperações",
     "o_que_vimos": "O terço que mais corre sem a bola deixa o adversário dar 9,3 passes por ação defensiva, contra 11,2 do terço que menos corre. Em bola recuperada os dois empatam, 77,9 contra 77,6 por jogo — e com esta base o teste não enxergaria uma diferença pequena.",
     "para_o_santa_cruz": "No modelo de jogo, pedir corrida sem a bola é pedir linha de pressão mais alta — não é pedir mais bola recuperada. E esta parte não autoriza dizer que o duelo recupera mais que a pressão: esse par nunca foi declarado nem rodado aqui, e quem o rodou por fora achou o contrário. Conversa com o A06, onde pressionar não separa quem sobe e ganhar o duelo separa — mas separar faixa e recuperar bola são duas perguntas diferentes.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Ajusta a m1 (Time físico) do lado sem a bola: correr sem a bola compra linha de pressão mais alta, e não bola recuperada — a intensidade define onde o time defende, não quanto ele rouba.",
     "confianca": "provável",
     "confianca_motivo": "Provável: um sim de dois. (1) Benjamini-Hochberg a 5% dentro da família sem_bola: PASSA na metade que sustenta a manchete — sprint sem posse × PPDA (q 0,00000) e metros por minuto sem posse × PPDA (q 0,00001) são as duas firmes em A11_correlacoes.csv (-0,63 e -0,5); a metade das recuperações não passa (q 0,29979 e q 0,90156, “sem relação clara” no próprio CSV). (2) Porta temporal da §6.4: NÃO — não rodou e não pode rodar aqui, e onde ela foi rodada no estudo o PPDA reprovou (parcial −0,103, p 0,363). O selo de firme de metros por minuto sem posse × xG sofrido (-0,27, q 0,031) tem de SAIR de A11_correlacoes.csv, e o texto não se apoia nele: sem os times colados nas linhas ele cai para −0,108 com q 0,458, e pela regra corrigida em _metodo_fronteira.md, item 3, firme só COM a fronteira é ruído. As outras duas metades resistem aos dois cortes na direção certa — a pressão fica mais forte no sprint (-0,71 sem fronteira) e praticamente igual nos metros por minuto (-0,48) — e as recuperações seguem sem aparecer nas 52 linhas: 0,105 (p = 0,45801) e 0,114 (p = 0,41963). A metade negativa entra com o poder declarado: com 80 linhas o teste só alcança 0,31 para cima, e o intervalo do par com recuperações vai a 0,34 por Fisher (0,31 por reamostragem de clube, que é exatamente o mínimo detectável). Ressalvas obrigatórias: pode ser efeito do placar — time que está atrás corre mais E pressiona mais, e a base não permite o recorte; e correr sem a bola e PPDA são, em boa parte, duas medidas da mesma escolha do time, não um mecanismo. Saíram do texto de 2 minutos e ficam aqui, sem perder nada: o terço que mais corre sem a bola faz 113 metros de sprint a cada 30 minutos sem posse, contra 87 do terço que menos corre; e a pequena vantagem no xG sofrido (1,13 contra 1,24 por jogo) saiu do texto porque some no corte sem os times de fronteira, exatamente como o parágrafo acima já dizia do selo de firme. O gráfico mostra só a metade da pressão, e o motivo é o renderizador, não a escolha do texto: o dois_cortes de estudo_serieb_grafico.js põe todos os pontos numa régua só (linhas 115-119), então um painel com 9,3 e 11,2 ao lado de outro com 77,9 e 77,6 esmagaria os dois pares em dois borrões de rótulos sobrepostos — e o grupos amplia a folga até preencher a tela (linhas 82-85), o que transformaria o empate de 77,9 contra 77,6 num abismo desenhado. Por isso a metade das recuperações fica no o_que_vimos, com o poder junto, e não num desenho que mentiria nos dois sentidos.",
     "n": "80 clube-temporadas (40 clubes, 2022–2025); 52 sem os times colados nas linhas, onde a pressão fica igual ou mais forte e as recuperações seguem sem aparecer",
     "prova": "A11_correlacoes.csv, família sem_bola",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "grupos",
      "titulo": "Pressão, pelos terços de corrida sem a bola (menos passes é mais pressão)",
      "unidade": "passes do adversário por ação defensiva",
      "series": [
       {
        "nome": "Mais corrida",
        "valor": 9.3
       },
       {
        "nome": "Menos corrida",
        "valor": 11.2
       }
      ]
     }
    },
    {
     "id": "A11-3",
     "parte": "A11",
     "bloco": "A",
     "manchete": "O físico não separa quem sobe nem entre times de nível técnico parecido",
     "o_que_vimos": "Na faixa técnica alta, quem subiu percorreu 9.614 metros por jogo e quem ficou no meio, 9.620, e nenhuma das 10 comparações apareceu. O terço que mais sprinta somou 54,5 pontos contra 47,9, mas os dois puseram 5 times no G4 e o que menos sprinta teve 9 rebaixados contra 2.",
     "para_o_santa_cruz": "O físico é um traço estável do clube que não anda com o acesso e anda com o não cair: serve para reconhecer um time — ele corre parecido todo ano — e como seguro contra o rebaixamento, que é o A07-2, não para prever quem sobe. Na montagem do elenco, correr é requisito de piso, não critério de desempate entre candidatos ao acesso. E ao citar a estabilidade, diga de onde ela vem: é medida da Protótipo ano a ano e a própria especificação a rebaixou a descrição, não critério, em 15/09 — não é a régua que o A06 usa com o mesmo nome.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Ajusta a m1 (Time físico): a intensidade continua como requisito de piso e como seguro contra a queda, mas o estudo não sustenta que correr mais faça o time subir — nem entre times de nível técnico parecido.",
     "confianca": "indício",
     "confianca_motivo": "Indício: zero de dois, e a frase diz por quê. (1) Benjamini-Hochberg a 5%: NÃO passa nenhum dos 10 testes de A11_estratificado.csv — o menor q do arquivo é 0,95148 e os dez estão selados “sem diferença clara” (0 firmes). (2) Porta temporal da §6.4: NÃO — não rodou e não pode rodar nesta parte. Três motivos materiais. O n é pequeno: 4 promovidos contra 18 do meio na faixa técnica média e 12 contra 15 na alta, 49 das 80 linhas, e a faixa técnica baixa não teve promovido NENHUM em 2022–2025 (o A11_resumo.json publica 0 também no n_meio dessa faixa, que é fallback do next(): o real é 15). O mínimo detectável vai de 1,13 a 1,63: é “não achamos”, não “não existe”. E o corte sem os times de fronteira, que o script nunca rodou, derruba a faixa média por falta de promovidos e deixa uma faixa só para testar — pela convenção da casa (percentil nas 80 linhas, filtro depois) a alta fica 7 contra 9 e a média cai para 1 × 11, abaixo do piso de 4; refazendo as faixas técnicas dentro das 52 linhas dá 6 × 12 —, e em nenhuma das leituras aparece diferença. A família resultado TEM um firme, sprint por 90 × distância ao G4 (+0,288, q 0,04769), e ele não sobe o nível desta conclusão: não é firme nos dois cortes (+0,348 com q 0,0577 sem fronteira) e some quando se tiram os 16 rebaixados (+0,079, p 0,533) — a leitura honesta é que a corrida anda com a ponta de baixo da tabela, que é o A07-2. Ressalva: pode ser efeito do placar, porque quem sobe joga mais tempo em vantagem e a base não permite o recorte. Por fim, os quatro números de persistência que sustentam a terceira frase (0,72 na distância percorrida, 0,72 no valor do elenco, 0,14 no xG e 0,13 no PPDA) são literais chumbados em A11.py:153, copiados da ESPECIFICACAO.md §7.3: estão certos, mas nada no repositório os recalcula, e a §7.3 os rebaixou a descrição, não critério, em 15/09 — não são a régua que o A06 usa com o mesmo nome. Saiu do texto de 2 minutos e fica aqui, sem perder nada: a diferença de distância percorrida é de -6 metros na faixa técnica alta e 25 na média, nenhuma das 10 comparações apareceu, e a estabilidade do traço é medida no ranking ano a ano — um clube muda em média 3,5 posições no de corrida, contra 6,1 no de xG criado e 6,1 no de pressão. O gráfico desta conclusão é a própria estratificação que a manchete afirma — 9.614 contra 9.620 na faixa técnica alta e 9.607 contra 9.582 na média, na mesma régua de metros por jogo —, e não os acessos e rebaixamentos por terço de sprint da segunda frase: aquele contraste 2 × 2 não tem teste nenhum no repositório, nem em A11_estratificado.csv nem em A11_correlacoes.csv, e desenhado sem o denominador de 28 clube-temporadas por terço ele gritaria uma diferença sob uma manchete que afirma um não-achado. Correção de 20/09, depois da conferência: o campo grafico SAIU desta conclusão, pelo mesmo motivo que a A11-2 registrou para a metade das recuperações. O grupos de estudo_serieb_grafico.js não tem régua fixa nem zero — toma o mínimo e o máximo dos próprios pontos e abre 35% de folga de cada lado (linhas 96-101) —, então com 9.582, 9.607, 9.614 e 9.620 o eixo ia de 9568,7 a 9633,3 e os 25 metros da faixa técnica média, que são 0,26% do valor, ocupavam cerca de 40% da largura do desenho. Sem o n de cada grupo, sem escala e sem o selo “sem diferença clara”, o leitor da tela via na faixa média uma distância visível entre quem subiu e o meio logo abaixo de uma manchete que afirma um não-achado — e essa comparação é d = 0,091, p = 0,80392 e q = 0,98515 em A11_estratificado.csv, com 4 promovidos contra 18 do meio, o ponto mais deslocado sendo justamente a média de 4 clube-temporadas. É exatamente o defeito que o parágrafo acima já usava para recusar o outro gráfico. Com um renderizador que normaliza pelo mínimo e pelo máximo dos próprios pontos não existe desenho honesto de um empate: pôr o não-achado no título e o n em cada série amenizaria, mas não tiraria os 40% de folga para 0,26% de diferença. A conclusão é negativa e se sustenta na manchete, no texto, no selo de indício e no campo n; a estratificação segue publicada em A11_estratificado.csv. Correção de 20/09, terceira passada: o não-achado VOLTOU ao o_que_vimos. O encurtamento tinha deixado na tela só 9.614 contra 9.620 metros, sem nada dizendo que nenhuma das 10 comparações de A11_estratificado.csv apareceu — e, com o campo grafico já retirado por este mesmo parágrafo e o confianca_motivo servindo só de tooltip do selo, o leitor da tela ficava com dois números brutos debaixo de uma manchete que afirma um não-achado e podia lê-los como resultado. A frase acima, que dava a comparação por saída do texto de 2 minutos, vale agora só para o resto do que saiu: a diferença de -6 metros na faixa alta, os 25 da média e os quatro números de persistência seguem apenas aqui. O texto visível ficou com 273 caracteres na tela, dentro da régua de 280, e nenhum número precisou sair para isso caber.",
     "n": "49 das 80 clube-temporadas na estratificação: 4 promovidos contra 18 do meio na faixa técnica média e 12 contra 15 na alta, e a faixa técnica baixa não teve promovido nenhum em 2022–2025; sem os times colados nas linhas sobra a faixa alta, 7 contra 9. Os terços de sprint são 28 contra 28, dentro das mesmas 80 linhas (40 clubes).",
     "prova": "A11_estratificado.csv; A11_correlacoes.csv, família resultado",
     "status": "validada",
     "negativa": true,
     "grafico": null
    }
   ],
   "em_aberto": "Pendências que não são desta rodada. (1) Quatro números da segunda frase da A11-3 — os 5 promovidos de cada terço extremo de sprint, os 9 rebaixados contra 2 e os 54,5 contra 47,9 pontos — foram calculados na proposta de 19/09, da mesma base e com a mesma regra de terço dos demais, mas não existem em arquivo de resultado nenhum: seguem escritos à mão até o A11.py gravá-los. (2) O selo de firme de metros por minuto sem posse × xG sofrido tem de sair de A11_correlacoes.csv: ele é firme só com os times colados nas linhas e some sem eles. (3) A coluna ic95 do mesmo CSV é Fisher supondo 80 linhas independentes, quando são 40 clubes; os intervalos por reamostragem de clube estão prontos em A11_numeros_novos.json (ic_area_ent e ic_area_xg). (4) O mínimo detectável por correlação (0,31 para as 17 linhas) não está gravado em lugar nenhum. (5) Os quatro números de persistência são literais chumbados em A11.py:153 e saem em A11_resumo.json como se fossem calculados. (6) A A06-1 publica 0,571 e a A11-3 publica 0,129 para o PPDA porque são réguas de horizonte diferente, e nenhuma das duas partes diz de qual régua veio. (7) O A11_resumo.json publica n_meio = 0 na faixa técnica baixa por fallback do next(): o real é 15. (8) O A11.md que a seção Entrega exige continua não existindo, e o A11.py não roda os cortes sem fronteira e sem cobertura baixa, cujos resultados já estão calculados. E o que trava a parte inteira em provável: a porta temporal da §6.4 é impossível enquanto não houver físico por jogo de 2022 a 2024 (o physical_match do skillcorner_serieb.db só tem 2025 e 2026), e não há recorte por estado do jogo, então a ressalva do placar fica como texto, sem número.",
   "feita_em": null,
   "prova_arquivos": "scripts/A11.py"
  },
  {
   "id": "A12",
   "bloco": "A",
   "secao": "Que time montar",
   "pergunta": "Em quais réguas os promovidos se concentram, e o Cenário Barato se sustenta?",
   "status": "validada",
   "titulo": "As réguas contínuas e o Cenário Barato",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "A12-1",
     "parte": "A12",
     "bloco": "A",
     "manchete": "Das diferenças de quem sobe, só a qualidade da chance dá para treinar",
     "o_que_vimos": "Quem sobe finaliza mais perto e faz o rival chutar pior, por medida pouco confiável. Seu elenco, 24,0 contra 13,9 milhões de euros, e o onze repetido não são escolha. Pressão, corrida e bola aérea não separam em corte nenhum, e ter a bola só separa sem os times colados na linha.",
     "para_o_santa_cruz": "O que dá para comprar e treinar é a qualidade da chance: chegar à finalização de dentro e obrigar o adversário a finalizar de longe e mal. Dinheiro não se escolhe, e time repetido é consequência de ganhar — não contrate para isto. Contra os times que ficaram entre o 5º e o 8º nada disso separa: só o valor do elenco (24,0 milhões contra 14,4), e mesmo ele some quando se tiram os times colados na linha — subir, em vez de ficar na trave, não é questão de jeito de jogar.",
     "premissa": "m1",
     "premissa_titulo": "Time físico",
     "premissa_grupo": "Montagem do elenco",
     "premissa_motivo": "Corrige a sugestão anterior do próprio A12: das nove réguas, quatro separam quem sobe do meio e só duas são escolha do clube (a qualidade da chance criada e a cedida). A construção com bola passa a “depende do corte” e a explosão sai da lista de “não separa”, porque separa quem cai, firme nos dois cortes. Junto com A07, qualifica a m1 (Time físico): no coletivo, correr mais não é o que separa quem sobe.",
     "confianca": "provável",
     "confianca_motivo": "Provável porque passa em UM dos dois critérios. (a) Benjamini-Hochberg a 5% dentro da família das réguas: PASSA. Conferido linha a linha em A12_reguas.csv (não no texto), Sobe × Meio, nos dois cortes de fronteira: E_qualidade_chance q 0,00388 com os times de fronteira e 0,00135 sem eles; F_solidez 0,04454 e 0,00080; H_dinheiro 0,00128 e 0,00007; I_estabilidade_11 0,01561 e 0,04672. (b) Porta temporal da §6.4: NÃO. O teste de 19/09 (_porta_temporal.json) dá E com parcial +0,254 e só por conter a distância da finalização — a régua sem ela cai para +0,191, p 0,0895; o único item de F que foi testado, o gol esperado por finalização sofrida, reprova com parcial −0,026, p 0,8213; H e I não são calculáveis por turno (valor de mercado e escalação não existem por rodada, e a §6.5 já registra o de I como impossível). Um critério de dois = provável, e é por isso que a proposta v2 validada pelo dono em 19/09 traz esta conclusão de firme para cá. Registro do que NÃO muda o selo: a distância da finalização sozinha passaria nos dois cortes (q 0,00009 com e 0,02313 sem, A02_testes.csv; parcial +0,289, p 0,0094), mas a conclusão é sobre as réguas e um item não sustenta as quatro; e a ressalva do xG (confiabilidade 0,30, abaixo do piso de 0,40) cai sobre dois dos três itens de F. ROBUSTEZ (varredura de 19/09), os quatro casos, cada um com os dois cortes de fronteira. (1) Construção com bola: o texto deixa de dizer “não separa” e diz em qual corte aparece — 51,7% contra 50,2% sem os times de fronteira (firme, q 0,04330) e 51,4% contra 49,8% com eles (q 0,12933, sem diferença clara); fica como “depende do corte”, nunca como ausência. (2) Explosão: a frase passa a ser “não separam quem SOBE”, porque em Cai × Meio a explosão é firme nos DOIS cortes (q 0,02637 com e 0,02875 sem) e no indicador cru a distância em sprint por 90 confirma nos dois (q 0,02389 e 0,02195, A07_testes.csv, linhas com e sem fronteira); a pressão e ritmo fica fora porque só é firme em Cai × Meio COM os times de fronteira (q 0,00479, d -0,783) e perde o selo sem eles (q 0,07936, d -0,55). (3) Sobe × Trave foi rodado e não gerava frase nenhuma: nenhuma das nove réguas separa nos dois cortes (firme_nos_dois_cortes.ST é lista vazia), a única que aparece é o valor do elenco com os times de fronteira (q 0,01723) e ela cai para “pode ser sorte” sem eles (q 0,06333, 8 contra 7) — é o que o uso prático agora diz. (4) Sai “confirma A05, A06, A07 e A04 pela régua agregada”, porque o A12 nunca lê saída dessas partes: é o mesmo dado reempacotado. FICA EM ABERTO, e é o que exige reanálise: o CLAUDE.md manda rodar com e sem os clube-temporada de cobertura física baixa, e isso nunca foi feito — C_volume_fisico e D_explosao são só colunas fis_, a cobertura vai de 62% a 97% do possível e 20 dos 80 ficam abaixo de 75%. Enquanto essa rodada não existir, tanto o “não separa” físico quanto a linha nova sobre quem cai são leitura de um corte só de cobertura. O QUE SAIU DO TEXTO NA PASSADA DA ETAPA 8, e por isso está registrado aqui: (i) a chance cedida, 0,089 de gol esperado por finalização sofrida contra 0,098 do meio, com a confiabilidade de 0,30 já ressalvada acima; (ii) a estabilidade do onze, 68,1% dos minutos nos onze mais usados contra 63,1% do meio; (iii) a explosão de quem cai, 156 metros em sprint por jogo contra 168 do meio, firme nos dois cortes; (iv) a construção com bola, cujos dois cortes, com número e com q, estão no item (1) da robustez acima, que é onde a fragilidade dela está dita. SOBRE O GRÁFICO desta conclusão: ele mostra a distância da finalização, Sobe contra Meio, que é o achado que o clube escolhe e é firme nos dois cortes (q 0,00009 com os times de fronteira e 0,02313 sem eles, A02_testes.csv). Não é um gráfico de dois cortes porque numeros não traz o par da distância no corte sem fronteira — os valores existem no A02, não aqui, e esta rodada não recalcula nada. CORREÇÃO DE 20/09, na conferência da etapa 8, e é por isso que o bloco acima tem de ser lido com esta ressalva: três coisas voltaram ao texto de leitura. (1) A construção com bola voltou ao que vimos, na forma curta “ter a bola só separa sem os times colados na linha” — o item (1) da robustez acima continua guardando os dois cortes com número e com q, mas a ressalva em si não mora mais só aqui, que é tooltip do selo. (2) A unidade do valor do elenco fica na frase do que vimos (“24,0 contra 13,9 milhões de euros”): o numeros_de_onde registra que ela mora na frase e não no valor, então tirá-la do texto a apaga da tela de leitura inteira e 24,0 seria lido como reais. É o único campo de leitura com a moeda: o para_o_santa_cruz escreve “24,0 milhões contra 14,4”, sem ela, e esse 14,4, a mediana da Trave, não tem marcador (está em sem_marcador); este selo é tooltip, não substitui a frase. (3) “chutar de pior posição” voltou a ser “chutar pior”, que é o que o indicador sustenta: o gol esperado por finalização sofrida do item (i) acima (régua F_solidez) mede a qualidade da chance cedida, que a posição do chute influencia mas não esgota. CORREÇÃO DE 20/09, TERCEIRA PASSADA DA ETAPA 8, e é o que desfaz quatro perdas do encurtamento. (1) A RESSALVA DO GOL ESPERADO VOLTOU AO TEXTO DE LEITURA, na forma curta “por medida pouco confiável”. A confiabilidade de 0,30, abaixo do piso de 0,40, está escrita acima, mas só morava aqui — que é tooltip do selo —, o gráfico é da distância da finalização e não da chance cedida, e o para_o_santa_cruz não repete a ressalva: ao contrário, manda agir sobre ela (“obrigar o adversário a finalizar de longe e mal”). Metade da única recomendação de compra e treino repousava, sem aviso visível, sobre o indicador mais fraco da casa. (2) VOLTOU O RESULTADO NEGATIVO “pressão, corrida e bola aérea não separam em corte nenhum”, que tinha sumido de todo lugar visível e que nem a lista (i) a (iv) acima registrava. É ele que sustenta a m1, e o premissa_motivo que o carrega não é impresso nesta conclusão porque o renderizador só mostra premissa_motivo quando premissa é nulo (aqui premissa = “m1”). Confere linha a linha em A12_reguas.csv, Sobe × Meio, “sem diferença clara” nos dois cortes: B_pressao_ritmo q 0,3891 com os times de fronteira e 0,14467 sem eles, C_volume_fisico 0,47 e 0,46063, G_bola_aerea_parada 0,30262 e 0,18116. D_explosao (0,8801 e 0,46154) também não separa quem sobe, mas fica FORA desta frase de propósito, porque separa quem cai — é o item (2) da robustez acima. (3) SAIU DO QUE VIMOS A CAUSA “time repetido vem de ganhar”, que a passada anterior pusera no lugar do par medido. O estudo mede associação — I_estabilidade_11, os minutos nos onze mais usados do item (ii) acima, percentil 71,1 contra 50,3 — e não tem teste de direção nenhum: I não é calculável por turno e a §6.5 já registra a porta dela como impossível. A leitura causal continua onde ela é conselho e não observação, no para_o_santa_cruz. (4) “times de fronteira” virou “times colados na linha” no que vimos, que é o nome que o resto do cartão usa (para_o_santa_cruz e n): ressalva escrita em vocabulário que a tela não define pode não ser lida como ressalva. O QUE PAGOU POR ISSO. Saíram do que vimos os metros da distância da finalização, 19,5 contra 20,5, que são a repetição do que o gráfico desta conclusão já mostra por inteiro, com título e unidade; o que vimos guarda a direção (“finaliza mais perto”), que é o que o gráfico sozinho não diz. O valor do elenco não pagou: está no que vimos, com a moeda, como o item (2) da primeira correção acima registra. OS SEIS DESENCONTROS ENTRE OS DOIS CORTES, registrados aqui para que a conta desta parte bata com a do portão: das 27 comparações emparelhadas das nove réguas nas três leituras (A12_testes.csv), seis não dizem a mesma coisa com e sem os times de fronteira. Três trocam de selo, e as três já estão ditas acima: construção com bola em Sobe × Meio (d 0,55 com os times de fronteira e 0,924 sem eles), valor do elenco em Sobe × Trave (d 1,203 e 1,945) e pressão e ritmo em Cai × Meio (d -0,783 e -0,55). As outras três só trocam o sinal do d em volta do zero, não separam em corte nenhum e por isso não mudam frase alguma: pressão e ritmo em Sobe × Trave (d -0,005 e 0,667), bola aérea e parada em Sobe × Trave (d -0,231 e 0,056) e volume físico em Cai × Meio (d -0,223 e 0,007).",
     "n": "16 promovidos contra 48 do meio, e 8 contra 32 sem os times colados na linha; na leitura de quem cai, 16 rebaixados contra 48, e 12 contra 32",
     "prova": "A12_reguas.csv; A12_resumo.json, firme_nos_dois_cortes; A12_numeros_novos.json; _porta_temporal.json; A02_testes.csv; A05_testes.csv; A07_testes.csv",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "grupos",
      "titulo": "Distância da finalização",
      "unidade": "metros",
      "series": [
       {
        "nome": "Sobe",
        "valor": "19,5"
       },
       {
        "nome": "Meio",
        "valor": "20,5"
       }
      ]
     }
    },
    {
     "id": "A12-2",
     "parte": "A12",
     "bloco": "A",
     "manchete": "Quem jogou como os que subiram sem dinheiro caiu mais do que subiu",
     "o_que_vimos": "Entre 2022 e 2025, 22 dos 80 times jogaram dentro da faixa do Cenário Barato, e o saldo foi 4 acessos contra 7 quedas. Dois dos que subiram assim eram dos elencos mais caros, então a faixa não é dos pobres. Só contando os sem dinheiro ela parece ajudar, 2 de 13 contra 4 de 48.",
     "para_o_santa_cruz": "Copiar o jeito de jogar dos quatro que subiram sem dinheiro não aumenta a chance de subir — nesses quatro anos aumentou a de cair. Se o Santa Cruz montar o time assim, que seja escolha de projeto, sabendo que a faixa descreve mais de um quarto da liga e que os três números dela mudam com o placar: time que vai ganhando pressiona menos e joga mais direto. E a ideia de que isso seria um “perfil de trave” não tem teste por trás: nas nove réguas, subir e ficar entre o 5º e o 8º só se distingue pelo valor do elenco, e mesmo essa diferença some sem os times colados na linha.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere registrar que não existe “perfil do acesso barato”: a faixa de posse, pressão e bola longa dos quatro que subiram sem dinheiro descreve 22 dos 80 times do período e, entre eles, houve mais rebaixamento (7) que acesso (4).",
     "confianca": "indício",
     "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios. (a) Benjamini-Hochberg a 5% na família: NÃO. O Cenário Barato não é teste — A12_reguas.csv só traz as nove réguas e não existe q para esta faixa em arquivo nenhum do estudo; é contagem. (b) Porta temporal da §6.4: NÃO. Nunca foi rodada aqui, e o PPDA, um dos três itens do perfil, já reprova na tabela da própria §6.4 (parcial −0,103, p 0,363). Nenhum dos dois = indício, e a frase diz por quê: a faixa foi desenhada sobre 4 casos, e posse, pressão e bola longa são exatamente os três indicadores que a regra do Placar manda ressalvar — “pode ser efeito do placar”, e elenco caro tende a ter esse PPDA sem que o estudo separe as duas coisas. ROBUSTEZ (varredura de 19/09): o caso era o enquadramento citado de um lado só, e agora os DOIS estão no texto, com o número de cada um. Enquadramento do conjunto, que estava calado: 22 dos 80 cabem no perfil publicado, 4 subiram (18,2% contra 20,0% da liga) e 7 caíram (31,8% contra os mesmos 20,0%) — vai na direção contrária da manchete antiga. Enquadramento de quem está fora do top-8 de valor, o único que o texto antigo citava: 13 cabem e 2 subiram (15,4% contra 8,3% dos 48); ele fica, dito como o único jeito de contar em que a faixa parece ajudar. Como os dois enquadramentos se contradizem, a conclusão INVERTE — é a decisão da proposta v2 validada pelo dono em 19/09. Soma-se o esvaziamento do rótulo: dois dos 4 que subiram dentro do perfil são Athletico-PR 2025 (1º em valor do ano) e Remo 2025 (3º). O segundo caso da varredura, a frase “perfil de trave”, é resolvido dizendo o que o recorte Sobe × Trave mostra nos dois cortes de fronteira (só H_dinheiro, q 0,01723 com os times de fronteira e 0,06333 sem eles), em vez de calar. FICA EM ABERTO: a rodada com e sem os times de fronteira nunca foi feita sobre o próprio Cenário Barato (o refutador que a pediu em 18/09 foi derrubado por 1 a 3), e três dos quatro casos de origem são times de fronteira. O QUE SAIU DO TEXTO NA PASSADA DA ETAPA 8, e por isso está registrado aqui: (i) o enquadramento de quem está fora do top-8 de valor — 13 cabem na faixa e 2 subiram (15,4% contra 8,3% dos 48) —, que continua descrito acima e é o único jeito de contar em que a faixa parece ajudar; (ii) a fotografia de 2026, na 27ª rodada de 38, com 5 times sem dinheiro dentro da faixa e o melhor deles em 6º com 43 pontos — temporada aberta, que por isso não sustenta frase publicada. SOBRE O GRÁFICO desta conclusão: ele compara as três taxas de contagem (18,2% de acesso e 31,8% de queda dentro da faixa contra 20,0% de cada lado na liga) e não é teste — não há q para esta faixa em arquivo nenhum do estudo, como o item (a) acima já diz. CORREÇÃO DE 20/09, na conferência da etapa 8, duas. (1) O enquadramento de quem está fora do top-8 de valor VOLTOU ao que vimos — “2 de 13 contra 4 de 48” —, porque sem ele a tela voltava a contar a faixa de um lado só e desfazia a correção de 19/09 registrada acima; o item (i) do bloco anterior continua descrevendo o mesmo recorte, agora ao lado do texto e não no lugar dele. Isso importa para quem decide: um clube sem dinheiro lendo a tela precisa ver que, no recorte que é o dele, a faixa sobe 15,4% contra 8,3%. (2) O gráfico deixou de ter uma barra única “Na liga” servindo de referência às DUAS comparações ao mesmo tempo — funcionava por acidente aritmético, porque 16 de 80 e 16 de 80 dão o mesmo 20,0%, e o rótulo não dizia qual das duas era. Agora são quatro barras: 18,2% de acesso na faixa contra 20,0% na liga, e 31,8% de queda na faixa contra os mesmos 20,0%. CORREÇÃO DE 20/09, TERCEIRA PASSADA DA ETAPA 8, uma. O recorte de quem está fora do top-8 de valor deixou de ser apresentado como achado de subgrupo (“só ENTRE os sem dinheiro ela parece ajudar”) e voltou a ser o que sempre foi, um ENQUADRAMENTO DE CONTAGEM: “só CONTANDO os sem dinheiro ela parece ajudar”. A diferença não é de estilo. O texto antigo dizia “essa é a única maneira de contar em que a faixa parece ajudar”, o que avisa que há vários enquadramentos e que eles se contradizem; “entre os sem dinheiro” afirma um achado dentro de um grupo, e nesta conclusão de selo indício, cujo para_o_santa_cruz diz o oposto, quem lê a tela e É sem dinheiro é o próprio Santa Cruz. Junto voltaram os dois pares brutos, 2 de 13 contra 4 de 48, no lugar de 15,4% contra 8,3%: a taxa fazia uma comparação de dois contra quatro eventos chegar à tela como diferença quase dobrada, sem o n de nenhum dos lados. Os percentuais continuam escritos acima, com o n ao lado, e não há q para esta faixa em arquivo nenhum do estudo, como o item (a) já diz.",
     "n": "22 times na faixa entre 2022 e 2025, 4 casos de origem, e os 20 times de 2026 na 27ª rodada de 38",
     "prova": "A12_cenario_barato.json, envelope; A12_teste_2026.json, baratos_no_perfil_2026; A12_resumo.json, cenario_barato; A12_numeros_novos.json",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "barras",
      "titulo": "Acesso e queda de quem jogou dentro da faixa, 2022 a 2025",
      "unidade": "%",
      "barras": [
       {
        "nome": "Sobe na faixa",
        "valor": "18,2"
       },
       {
        "nome": "Sobe na liga",
        "valor": "20,0"
       },
       {
        "nome": "Cai na faixa",
        "valor": "31,8"
       },
       {
        "nome": "Cai na liga",
        "valor": "20,0"
       }
      ]
     }
    },
    {
     "id": "A12-3",
     "parte": "A12",
     "bloco": "A",
     "manchete": "A faixa publicada do time barato deixa de fora dois dos quatro casos",
     "o_que_vimos": "A faixa publicada é pressão de 10,0 a 13,2, posse de 47% a 52% e bola longa de 10% a 14%. Cobrada ao pé da letra, o Vitória de 2023 e a Chapecoense de 2025 ficam de fora por centésimos. Dos quatro, só pressionar pouco é comum.",
     "para_o_santa_cruz": "Não trate a faixa como alvo de montagem: ela é o menor e o maior de quatro times, sem folga nenhuma, e em número bruto de anos diferentes. O que se sustenta dos quatro é uma coisa só: todos pressionavam pouco, entre o 13º e o 20º da liga no ano deles. Posse e bola longa espalham pela tabela inteira e não servem de requisito para o elenco de 2027 — se a faixa for usada, que seja como lugar dentro da temporada, nunca como número bruto.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere registrar que a frase “perfil coerente entre si” da §7.2(b) não se sustenta quando cada caso é lido dentro do próprio ano: a única coisa em comum aos quatro é pressionar pouco.",
     "confianca": "indício",
     "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios. (a) Benjamini-Hochberg a 5% na família: NÃO. Não há teste nenhum aqui — é a conferência de quatro valores contra um texto, e não existe q para ela em arquivo algum do estudo. (b) Porta temporal da §6.4: NÃO, e não se aplica: nada foi previsto. Nenhum dos dois = indício, e a frase diz por quê: são 4 casos e uma conferência de texto, não uma medida. É a proposta v2 validada pelo dono em 19/09 que traz esta conclusão de firme para indício. Registro de honestidade: o refutador que pediu exatamente este rebaixamento em 18/09 foi derrubado por 1 a 3, mas a régua do CLAUDE.md não abre exceção para contagem — sem os dois critérios, o selo é indício. O “dois dos quatro” fica como está: o refutador que queria trocá-lo por “um dos quatro” foi derrubado por 0 a 3. Os valores são conferíveis um a um em dados/serieb_clube_temporada.csv, e o envelope real, que por decisão da Didática não entra na manchete nem no que vimos, fica aqui na prova: PPDA 10,0184-13,1684 · posse 47,4203-52,0153% · passe longo 10,0326-14,0858%. O QUE SAIU DO TEXTO NA PASSADA DA ETAPA 8, e por isso está registrado aqui: (i) por quanto cada um dos dois fica de fora — 52,0153% de posse do Vitória de 2023 contra o teto de 52%, e 14,0858% de bola longa da Chapecoense de 2025 contra o teto de 14% —, que é a medida de quão apertada é a faixa e continua conferível um a um em dados/serieb_clube_temporada.csv; (ii) os lugares dentro do próprio ano, que passam para o gráfico. SOBRE O GRÁFICO desta conclusão: ele põe lado a lado o melhor e o pior lugar dos quatro em cada item (13º a 20º em pressão, 5º a 17º em posse e 3º a 19º em bola longa), que é onde se vê que só pressionar pouco é comum aos quatro. Não é um gráfico de dois cortes porque aqui não há teste nem corte de fronteira: é conferência de quatro valores contra um texto. CORREÇÃO DE 20/09, na conferência da etapa 8, três. (1) A manchete voltou a trazer o qualificador (“a faixa PUBLICADA”), que a passada anterior tinha perdido ao dizer “a faixa do time barato exclui… os times que ela descreve”: quem deixa os dois de fora é o número redondo publicado (posse 47 a 52, longa 10 a 14), não o envelope real (PPDA 10,0184-13,1684 · posse 47,4203-52,0153% · passe longo 10,0326-14,0858%), cujos tetos são exatamente os valores do Vitória e da Chapecoense e portanto INCLUEM os quatro. Sem o qualificador a frase virava propriedade da faixa em vez de propriedade do arredondamento, e a própria prova acima a contradizia. (2) Por quanto cada um fica de fora voltou ao que vimos, 52,0153% contra o teto de 52% e 14,0858% contra o teto de 14%: é o que mostra ao leitor que a exclusão é um fio de cabelo e que o problema é o arredondamento — sem o número, “fica fora pela posse” se lê como se o Vitória tivesse posse demais. O item (i) acima continua valendo, agora ao lado do texto e não no lugar dele. (3) O gráfico passou a declarar a unidade (“lugar na liga”) e trocou “melhor/pior” por “mais/menos” em cada item, porque as três ordenações apontam para lados diferentes: em pressão a fila vai de quem mais pressiona para quem menos pressiona, então o 13º QUER DIZER pressionar pouco, enquanto em posse o 5º quer dizer muita bola e em bola longa o 3º quer dizer jogar mais longo. FICA REGISTRADO, e não dá para consertar deste arquivo: o fmt() de static/estudo_serieb_grafico.js escolhe a casa decimal pela faixa de grandeza, então estes lugares sairão na tela como “5,00”, “3,00”, “13,0” e “20,0”. É conserto de uma linha no renderizador, que é arquivo da tela e não desta parte. ETAPA 8 (20/09), o que saiu do texto de 10 segundos: os dois casos que ficam fora da faixa publicada ficam por centésimos — o Vitória de 2023 com 52,0153% de posse contra o teto de 52%, e a Chapecoense de 2025 com 14,0858% de bola longa contra o teto de 14%. Publicar essas casas decimais no texto de leitura fazia a precisão parecer medida, quando ela é justamente a prova de que a faixa é apertada demais para servir de alvo.",
     "n": "4 casos, de 2023 a 2025",
     "prova": "A12_cenario_barato.json, envelope; dados/serieb_clube_temporada.csv; A12_numeros_novos.json",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "grupos",
      "titulo": "Onde os quatro times baratos ficaram na liga",
      "unidade": "lugar na liga, de 1º a 20º",
      "series": [
       {
        "nome": "Pressão · o mais alto dos quatro",
        "valor": 13
       },
       {
        "nome": "Pressão · o mais baixo",
        "valor": 20
       },
       {
        "nome": "Posse · o mais alto dos quatro",
        "valor": 5
       },
       {
        "nome": "Posse · o mais baixo",
        "valor": 17
       },
       {
        "nome": "Bola longa · o mais alto dos quatro",
        "valor": 3
       },
       {
        "nome": "Bola longa · o mais baixo",
        "valor": 19
       }
      ]
     }
    }
   ],
   "em_aberto": "Aplicada em 19/09 a proposta de destino v2 validada pelo dono, com a remarcação: A12-1 é reescrita e cai de firme para provável, A12-2 inverte a manchete e A12-3 cai de firme para indício; as duas últimas passam a negativa = true e vão para “Parece, mas não é”. Nenhuma conclusão caiu, nenhuma se fundiu, nenhuma nasceu — a parte continua com três. Os 14 números que a A12-3 digitava à mão e os dez marcadores medidos que nenhuma frase lia foram ligados: agora são 76 valores em numeros, 55 lidos por alguma frase e 21 guardados sem frase que os leia (os doze percentis das réguas, que a Didática proíbe no texto, mais n_reguas, sm_lista, sm_n, separam, nao_separam, depende_do_corte, n26, g4_26 e baratos26). O que ficou escrito está em sem_marcador, item a item.\n\nA ÚNICA REANÁLISE QUE FALTA, e que a v2 pede por escrito: rodar as réguas com e sem os clube-temporada de cobertura física baixa, como o CLAUDE.md manda. C_volume_fisico e D_explosao são só colunas fis_, a cobertura vai de 62% (Grêmio 2022, que é promovido) a 97%, e 20 dos 80 ficam abaixo de 75%. Sem ela, tanto o “não separa” físico quanto a linha nova sobre a explosão de quem cai valem num corte de cobertura só. Fica em aberto também a rodada com e sem os times de fronteira sobre o próprio Cenário Barato: três dos quatro casos de origem são times de fronteira.\n\nPENDÊNCIAS FORA DESTE ARQUIVO, que esta tarefa não pode escrever. (1) scripts/A12.py não grava os dois arquivos citados como prova, A12_cenario_barato.json e A12_teste_2026.json — prova que nenhum script reproduz não é prova; e o A12_cenario_barato.json que está no disco ainda traz os valores velhos (subiram 6, cabem_fora_top8 14, taxa 27,3 e 28,6), que o texto novo já corrigiu para 4, 13, 18,2 e 15,4. (2) A chave “destes_quantos_subiram” aparece duas vezes no dict do A12.py e o segundo valor apaga o primeiro: foi esse bug que gerou os cinco números errados corrigidos em 19/09. (3) O A12.md não existe. (4) A tabela de testes desta parte se chama A12_reguas.csv, e não A12_testes.csv: o portão de nove regras procura o segundo nome e, sem ele, não consegue recalcular o teto de confiança (regra 2) nem conferir os dois cortes de fronteira (regra 3), embora os dois cortes estejam lá, nas 54 linhas do A12_reguas.csv. Renomear ou emitir o alias é decisão do fluxo principal.\n\nDo que já estava aberto antes: ampliar o Cenário Barato dependia de 2018–2021, que saiu do recorte por decisão do dono em 17/09 (não tem dado físico nem tabela oficial no app) — com ele, a coleta de valor do Transfermarkt também precisaria cobrir aqueles anos, e hoje cobre 2022–2026. Agrupamento de times não foi refeito: a §7.1 já decidiu que não há grupos.",
   "feita_em": null,
   "prova_arquivos": "scripts/A12.py"
  },
  {
   "id": "A13",
   "bloco": "A",
   "secao": "Que time montar",
   "pergunta": "Quem cai já estava mal no 1º turno ou despencou no 2º?",
   "status": "validada",
   "titulo": "Trajetória: quando o destino se decide",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "A13-1",
     "parte": "A13",
     "bloco": "A",
     "manchete": "Quem cai já está 5,5 pontos atrás do meio na metade do campeonato",
     "o_que_vimos": "No 1º turno, quem caiu fez 19,5 pontos de mediana contra 25 do meio, e 15 dos 16 ficaram abaixo da marca do meio. Um tombo no returno, se existe, este recorte não enxerga: 6 dos 16 fizeram mais pontos no 2º turno. E a melhora de quem subiu depende de quem entra na conta.",
     "para_o_santa_cruz": "O déficit de quem cai já está montado na metade, então a correção é na janela do meio do ano — treinador ou reforço —, e não na espera de uma reação natural no returno. Mas a temporada não está perdida na rodada 19: em 4 temporadas, 6 times saíram do Z4 depois dela (4 no corte sem os times colados nas linhas).",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere premissa nova em dados/premissas.json, grupo Montagem do elenco: a Série B cobra planejamento de meio de ano — quem chega à metade cerca de 5 pontos abaixo do meio da tabela (5,5 nas 80 campanhas, 5,0 nas 52 sem os times colados nas linhas) precisa de correção na janela, e o orçamento tem de prever reforço de julho. NÃO entra a versão antiga que esta conclusão propunha (“na Série B o rebaixamento se define no 1º turno”): 6 dos 16 rebaixados melhoraram no returno e 6 times escaparam do Z4 depois da metade.",
     "confianca": "indício",
     "confianca_motivo": "Selo indício, fixado em 19/09 sobre a premissa de que a parte não tinha teste nenhum; a tabela gravada em 20/09 desmente essa premissa, e rever o nível é decisão do dono. (a) Correção para múltiplos testes a 5% dentro da família: SIM para o déficit — A13_testes.csv existe e scripts/A13.py importa scripts/_metodo.py; os pontos do 1º turno de quem cai contra o meio dão q 0,00000 com todos os times e q 0,00007 sem os de fronteira, selo firme nos dois cortes. O que não passa é o tombo do returno: q 0,46575 contra o meio e q 0,34438 contra quem sobe, sem diferença clara. A auditoria de 18/09 dizia q 0,42 nos três, e a tabela de hoje não reproduz esse número — lá a família eram três comparações de uma medida só, aqui o BH corre entre os indicadores de cada comparação; o veredito é o mesmo dos dois jeitos, nenhum passa. (b) Porta temporal da §6.4: NÃO — o desfecho é a faixa final, e os pontos do 1º turno já estão somados nela (_porta_temporal.md registra A13 como a porta sem o desconto, com o desfecho contaminado). Um sim e um não pela régua de hoje, e o selo publicado está um nível abaixo disso. O que sustenta a conclusão é o tamanho do déficit, que sobrevive aos dois cortes (19,5 contra 25 nas 80 campanhas, 19 contra 24 nas 52) e tem uso prático imediato na janela de julho. Duas ressalvas para a prova: o tombo do returno tem efeito observado de -0,32 no valor bruto — a tabela mede o mesmo par na escala de posto dentro da temporada e dá -0,21, o mesmo achado em outra escala — contra um mínimo detectável de 0,82, ou seja, este desenho não o enxerga; e o corte sem os clube-temporadas de base incompleta não mexe no déficit, mas por um motivo trivial: nenhum dos 16 rebaixados tem base incompleta, as quatro campanhas incompletas são todas do meio, e o que se move ali é a mediana do 2º turno do meio, de 26 para 26,5 pontos. Os dois cortes do déficit estão no gráfico desta conclusão, lado a lado. No corte sem os times de fronteira, 11 dos 12 rebaixados ficam abaixo da mediana do meio e 4 dos 12 fizeram mais pontos no returno. E a mediana da diferença entre turnos de quem subiu vai de 1 ponto nas 80 campanhas para -2 nas 52 sem esses times — troca de sinal, a única da parte entre os dois cortes, e por isso ela voltou ao texto: a tabela testa essa troca e não a confirma (q 0,7036 com todos os times e q 0,17322 sem os de fronteira, efeito encostado no zero nos dois), e o 1º turno já está somado no desfecho — por isso indício. Ela voltou como dependência de amostra, e não como afirmação seca de que a melhora vira piora: a inversão se apóia em oito campanhas, as que sobram de quem subiu quando se tiram os times de fronteira. E a comparação de quem caiu é contra a marca do meio, 25 pontos: os 15 dos 16 ficaram abaixo dela, não abaixo da própria mediana de quem caiu — abaixo dos 19,5 são oito dos 16.",
     "n": "80 clube-temporadas de 2022 a 2025 (52 sem os times colados nas linhas de corte); 16 rebaixados (12 no corte) e 48 do meio (32 no corte)",
     "prova": "A13_turnos.csv; A13_resumo.json, quadro_por_turno; A13_numeros_novos.json; A01_clube_temporada.csv",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Pontos no 1º turno, mediana da faixa",
      "unidade": "pontos",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Cai",
          "valor": 19.5
         },
         {
          "nome": "Meio",
          "valor": 25.0
         }
        ]
       },
       {
        "rotulo": "sem os times de fronteira",
        "series": [
         {
          "nome": "Cai",
          "valor": 19.0
         },
         {
          "nome": "Meio",
          "valor": 24.0
         }
        ]
       }
      ]
     }
    },
    {
     "id": "A13-2",
     "parte": "A13",
     "bloco": "A",
     "manchete": "Na metade já estão 10 dos 16 acessos, e o resto virou depois",
     "o_que_vimos": "Na rodada 19, 10 dos 16 times que subiram já estavam no G4 e 10 dos 16 que caíram já estavam no Z4. O resto virou depois: 6 subiram vindo de fora, 6 escaparam do Z4 e 6 perderam o G4 que tinham. Isto mede onde o time estava, não o que veio depois.",
     "para_o_santa_cruz": "A tabela da metade não é sentença nem garantia: em 4 temporadas, 6 times subiram vindo de fora do G4 e 6 perderam o lugar que já tinham — e os 12 terminaram a 3 pontos ou menos do 4º colocado. Isso põe a janela do meio do ano dentro do projeto desde o começo: dinheiro e vagas de elenco guardados para reforçar em julho, em vez de gastar tudo na montagem de janeiro.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Reforça a premissa nova sugerida em A13-1 (planejar e orçar a janela do meio do ano). Não confirma nem contradiz nenhuma das premissas de dados/premissas.json.",
     "confianca": "indício",
     "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios. (a) Correção para múltiplos testes a 5% dentro da família: NÃO — A13_testes.csv existe desde 20/09 e scripts/A13.py importa scripts/_metodo.py, mas a tabela compara as faixas nos pontos de cada turno e não testa nada do que esta conclusão afirma: onde o time estava na rodada 19 é contagem completa das 80 campanhas, sem teste. (b) Porta temporal da §6.4: NÃO — mede a posição na rodada 19 contra a faixa final, e os pontos dessa mesma rodada já estão somados na classificação que define a faixa; é o mesmo defeito que A13-3 denuncia. Zero de dois = indício. Os pareceres da auditoria mantinham “firme” citando a prática da casa (contagem completa = firme), mas a prática não é a régua escrita: a régua exige os dois critérios, e uma contagem que não testou nada não passou em nenhum. Fica em indício, e não abaixo, porque a metade que a manchete afirma — a maior parte do G4 e do Z4 finais já estava lá na metade — sobrevive aos dois cortes e fica ainda mais forte no corte sem os times colados nas linhas, e porque tem uso prático imediato. Duas coisas ficam aqui nesta passada, e a segunda volta também ao texto. O gráfico desta conclusão mostra as duas direções — quem chegou ao desfecho vindo de dentro e de fora, e também quem estava no G4 e não subiu (6) e quem estava no Z4 e escapou (6) —, e é do corte cheio, porque as viradas no outro corte não têm marcador: sem os times de fronteira sobram 52 campanhas e as viradas encolhem para 1 acesso vindo de fora, 4 fugas do Z4, 4 quedas vindas de fora e nenhuma perda de G4 — esse corte tira justamente quem terminou por pouco, e a conclusão fica mais forte nele, não mais fraca. E isto é contagem completa de 4 temporadas, sem teste: mede onde o time estava na rodada 19, não o que veio depois.",
     "n": "80 clube-temporadas de 2022 a 2025 (52 sem os times colados nas linhas de corte); 16 acessos e 16 rebaixamentos",
     "prova": "A13_resumo.json, previsibilidade_por_rodada; A13_turnos.csv; A13_numeros_novos.json; A01_clube_temporada.csv",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "barras",
      "titulo": "Onde o time estava na metade, e onde terminou",
      "unidade": "campanhas",
      "barras": [
       {
        "nome": "Sobe, do G4",
        "valor": 10
       },
       {
        "nome": "Sobe, de fora",
        "valor": 6
       },
       {
        "nome": "Perdeu o G4",
        "valor": 6
       },
       {
        "nome": "Cai, do Z4",
        "valor": 10
       },
       {
        "nome": "Cai, de fora",
        "valor": 6
       },
       {
        "nome": "Escapou do Z4",
        "valor": 6
       }
      ]
     }
    },
    {
     "id": "A13-3",
     "parte": "A13",
     "bloco": "A",
     "manchete": "A tabela da metade dá vantagem, não garante a vaga",
     "o_que_vimos": "O terço que mais pontuou no 1º turno fez 31 pontos no returno e o de baixo fez 22. Mas eles se cruzam nos dois cortes: o Ituano de 2022, do terço de baixo, fez 37 e passou o melhor do terço de cima, 36. Essa vantagem é feita de pontos já somados na classificação final.",
     "para_o_santa_cruz": "Vantagem na metade é banco de pontos, não vaga: dos 16 times que estavam no G4 na rodada 19, 6 terminaram fora dele — e todos os seis terminaram a 3 pontos ou menos do 4º colocado, por isso somem quando se tira quem acabou colado na linha. A segunda metade se monta como campanha própria — carga física, rodízio e reforço de julho —, e não administrando o que já foi feito.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Não trata de nenhuma das premissas de dados/premissas.json. Se alguma entrar, é a de planejar e orçar a janela do meio do ano sugerida em A13-1.",
     "confianca": "provável",
     "confianca_motivo": "Provável porque passa em um dos dois critérios. (a) Correção para múltiplos testes a 5% dentro da família: NÃO — A13_testes.csv existe desde 20/09 e scripts/A13.py importa scripts/_metodo.py, mas a tabela só traz as comparações entre as faixas: os três previsores desta conclusão continuam saindo com p bruto, sem q, fora dela. (b) Porta temporal da §6.4: SIM — é o único par de toda a A13 em que o previsor é medido inteiro nas 19 primeiras rodadas e o desfecho inteiro nas 19 últimas, e a própria §6.4 publica esse par como linha de referência, em posto dentro do ano; o recálculo bate com ela. Um sim e um não = provável. A associação entre os dois turnos sobrevive aos dois cortes: 0,48 nas 80 campanhas e 0,4 nas 52 sem os times colados nas linhas. Ressalvas para a prova: por temporada a associação some em 2022 e o intervalo por clube é largo; o número que a conclusão antiga usava para o xG (0,486) media o saldo de xG do 1º turno contra a POSIÇÃO FINAL — exatamente o par contaminado que esta conclusão denuncia —, e por isso a frase do xG saiu do texto: o par limpo, xG do 1º turno contra os pontos do 2º, vale 0,4217, e o xG ainda tem confiabilidade abaixo do piso da especificação. Duas coisas ficam aqui nesta passada, e a segunda volta também ao texto. O degrau entre os terços cai de 9 pontos nas 80 campanhas para 5,5 nas 52 sem os times de fronteira (27,5 contra 22,0, pela mesma regra de terço do script), e esse par não entra no gráfico porque a mediana do returno por terço só foi calculada para as 80: o gráfico mostra nos dois cortes a associação entre os turnos, que é o único par da conclusão com marcador nos dois cortes. E o que a tabela da metade mostra em primeiro lugar são os pontos já ganhos, que já estão somados na classificação final — é o mesmo defeito que esta conclusão denuncia.",
     "n": "80 clube-temporadas de 2022 a 2025 (52 sem os times colados nas linhas de corte); 27 no terço de cima e 28 no terço de baixo do 1º turno",
     "prova": "A13_resumo.json, previsores_do_1o_turno; A13_turnos.csv; A13_numeros_novos.json; A01_clube_temporada.csv",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Quanto o 1º turno acompanha o 2º",
      "unidade": "",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Os dois turnos",
          "valor": 0.484
         }
        ]
       },
       {
        "rotulo": "sem os times de fronteira",
        "series": [
         {
          "nome": "Os dois turnos",
          "valor": 0.399
         }
        ]
       }
      ]
     }
    }
   ],
   "em_aberto": "A rodada N aqui é o N-ésimo jogo de cada time, não a rodada do calendário — com jogo adiado isso difere da tabela do dia. E os dez clube-temporadas com um jogo faltando na base (A01) entram na conta; a falta é de um jogo em algum ponto e não desloca a trajetória o bastante para mudar a leitura. Continua aberto o que é trabalho de script, e não dado que falte: A13_testes.csv não existe e scripts/A13.py não importa scripts/_metodo.py — por isso A13-1 e A13-2 param em indício e A13-3 só chega a provável, pela porta temporal —, o script não lê a coluna fronteira nem grava os dois cortes, e A13.md, a terceira camada de leitura, ainda não foi escrito.",
   "feita_em": null,
   "prova_arquivos": "scripts/A13.py"
  },
  {
   "id": "A14",
   "bloco": "A",
   "secao": "Que time montar",
   "pergunta": "Quais indicadores mais separam quem sobe, e onde 2026 está nessa régua?",
   "status": "validada",
   "titulo": "Síntese do Bloco A e teste em 2026",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "A14-1",
     "parte": "A14",
     "bloco": "A",
     "manchete": "A régua de 7 indicadores põe no alto quem subiu",
     "o_que_vimos": "Dos 16 promovidos nas quatro temporadas fechadas, 11 ficaram entre os quatro primeiros da régua no seu ano. Das 7 peças, a de maior efeito é o valor do elenco, que não se escolhe. A trave, do 5º ao 8º, parece um degrau à parte, mas encosta no meio sem os times de fronteira.",
     "para_o_santa_cruz": "6 das 7 peças são decisão de modelo de jogo e de contratação: finalizar de perto, criar chance boa, ceder chance ruim, ganhar o duelo defensivo, sofrer pouco em casa e ganhar o duelo em casa. A mais sólida é chutar de perto — quem sobe finaliza de 19,5 m em média contra 20,5 m do meio, e é a única das 7 com prova de que vem antes do resultado, e não depois dele. A sétima é o valor do elenco, que não se escolhe e é a que mais puxa a régua para cima: use a lista como critério de contratação e de modelo de jogo, e não como aposta de acesso.",
     "premissa": "m1",
     "premissa_titulo": "Time físico",
     "premissa_grupo": "Montagem do elenco",
     "premissa_motivo": "Sugere premissa nova: a régua do Bloco A do estudo são estes 7 indicadores, no lugar da lista de nove réguas da Protótipo. E ajusta m1 (Time físico): nenhuma das 7 peças é física — o físico não aparece entre o que separa quem sobe do meio no Bloco A. Não é prova de que não exista: o desenho é que não enxerga.",
     "confianca": "provável",
     "confianca_motivo": "Provável: passa num critério e falha no outro — o mesmo nível de 17/09, agora pelo motivo certo. (a) Correção para múltiplos testes a 5%: SIM, no nível dos componentes. Fui aos CSV de origem conferir o q de cada um dos 7 componentes em Sobe × Meio, nos DOIS cortes de fronteira, e todos têm selo firme nos dois: dist_remate e xg_por_remate_contra em A02_testes.csv, xgc_casa e dd_casa em A03_testes.csv, duelos_def_pct em A06_testes.csv, H_dinheiro e E_qualidade_chance em A12_reguas.csv — o q de cada um está nesses arquivos, linha a linha, nos dois cortes. E o índice montado sobrevive aos dois cortes, que é o que a regra da fronteira exige: com fronteira, 16 contra 48, mediana 78,1 contra 47,8 (e 33,0 no Cai), d 1,59 e p 1,75e-05; sem fronteira, 8 contra 32, mediana 83,1 contra 47,0, d 2,71 e p 3,47e-07. Ressalva honesta que o texto de 17/09 não fazia: o índice EM SI nunca entrou numa família de correção, porque A14 não gera A14_testes.csv e A14.py não chama bh() — o “sim” vale no nível dos componentes, não no do índice. (b) Porta temporal da §6.4: NÃO. O _porta_temporal.md rodou os componentes e só dist_remate passa (parcial +0,289, p 0,0094); E_qualidade_chance passa apenas por conter dist_remate dentro dela, e sem ele cai para +0,191 (p 0,0895); xgc_casa, duelos_def_pct, xg_por_remate_contra e dd_casa reprovam; e H_dinheiro não é calculável por turno, porque o valor do elenco só existe medido na temporada inteira. Um sim e um não = provável, que é o nível em que ela já estava; o achado da auditoria que pedia rebaixar para indício (A14-1 n3) foi derrubado 0 a 3 e a cascata endossa provável como teto do índice. O que mudou na definição: o índice caiu de oito para 7 componentes, porque I_estabilidade_11 é feita só de nomes da constante CONSEQUENCIA de ranking_gaps.py, ou seja resultado contado de outro jeito; por redundância já tinham saído dd_fora e F_solidez. Os 7 são H_dinheiro, dist_remate, E_qualidade_chance, xg_por_remate_contra, duelos_def_pct, xgc_casa, dd_casa; saíram dd_fora (mede o mesmo que duelos_def_pct), F_solidez (mede o mesmo que xgc_casa), I_estabilidade_11 (é consequência do resultado, não característica). Robustez da fronteira: os dois cortes entram na frase, e o silêncio de 17/09 não estava favorecendo a conclusão — sem os times colados na linha a separação CRESCE, de d 1,59 para d 2,71. O único número que muda de tamanho é o degrau da trave: 56,6 contra 47,8 com fronteira e 51,7 contra 47,0 sem, porque 9 das 16 temporadas da trave são times colados na linha e ela encolhe de 16 para 7 linhas (a mediana do meio sem a trave é 46,1); por isso a terceira frase diz a contagem e tira a trave da condição de quarta faixa, em vez de exibir o degrau como se fosse próprio. Duas ressalvas que não mudam o nível e têm de constar: duas das 7 peças nascem de xG, cuja régua reproduz 30% de si mesma (_cruzar_19_09.md, achado 6); e H_dinheiro, a peça de maior efeito, é a única que nunca poderá passar pela porta temporal — enquanto ela estiver dentro, o teto do índice é provável. Passada de texto de 20/09, para nada se perder no encurtamento: os dois cortes de fronteira saíram do o_que_vimos e agora são o gráfico, que mostra Sobe contra Meio com e sem os times de fronteira, lado a lado. E ficam registrados aqui os números que saíram do texto curto: no corte cheio, 9 dos 16 promovidos ficaram acima de todo o meio da tabela; sem os times de fronteira, sete dos 8. Conserto de 20/09, depois da conferência: a trave voltou às duas leituras — é a terceira série do corte cheio no gráfico (56,6) e uma oração no o_que_vimos —, porque era ressalva do tipo “parece, mas não é” e muda o que o leitor faz com um time que se lê na casa dos 56. No gráfico ela aparece só no corte cheio: a mediana da trave sem os times de fronteira (51,7) não é marcador da saída do script, e valor de gráfico só entra por marcador — por isso o “encosta no meio” está dito no texto, e não desenhado. Terceira passada de 20/09: o texto curto dizia “11 ficaram entre os quatro primeiros”, sem dizer primeiros DE QUÊ nem em que recorte — para leitor de futebol isso é o G4 da tabela, e a frase virava tautologia. Voltou o escopo: “entre os quatro primeiros DA RÉGUA no seu ano”. Os 16 e o 11 não mudaram. Para abrir espaço saiu o detalhe de que as 7 peças são de jogo e de elenco, que o para_o_santa_cruz lista uma a uma logo abaixo; a oração da trave, que é ressalva do tipo “parece, mas não é”, ficou intacta.",
     "n": "80 clube-temporadas: 16 que subiram, 48 do meio e 16 que caíram; sem os times colados na linha, 8 contra 32",
     "prova": "A14_resumo.json; A14_numeros_novos.json; A01_clube_temporada.csv; A02_testes.csv; A03_testes.csv; A06_testes.csv; A12_reguas.csv; _porta_temporal.md; _cruzar_19_09.md",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "A régua de 7 indicadores, por faixa",
      "unidade": "0 a 100 — quanto maior, mais parecido com quem sobe",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Sobe",
          "valor": 78.1
         },
         {
          "nome": "Meio",
          "valor": 47.8
         },
         {
          "nome": "Trave",
          "valor": 56.6
         }
        ]
       },
       {
        "rotulo": "sem os times de fronteira",
        "series": [
         {
          "nome": "Sobe",
          "valor": 83.1
         },
         {
          "nome": "Meio",
          "valor": "47,0"
         }
        ]
       }
      ]
     }
    },
    {
     "id": "A14-2",
     "parte": "A14",
     "bloco": "A",
     "manchete": "Um ano sozinho não tem times suficientes para dizer se a régua vale",
     "o_que_vimos": "Ela pôs os quatro promovidos entre os seus quatro primeiros em um dos quatro anos, e dois ou três nos outros. Mas foi montada com esses mesmos quatro, nenhum ficou de fora, e justamente o ano dos quatro fica com um promovido só, sem teste, tirando os times de fronteira.",
     "para_o_santa_cruz": "Não decida contratação pela posição do time na régua de um ano só: olhe as quatro temporadas juntas, porque o retrato de um ano muda conforme quem entra na conta. E não leia isto como “a régua não vale” — o que o ano isolado diz é que não há times suficientes para responder, e nada aqui testa se a régua prevê o acesso.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Não trata de nenhuma premissa existente.",
     "confianca": "indício",
     "confianca_motivo": "Indício, e é uma queda: o texto de 17/09 dizia firme. (a) Correção para múltiplos testes a 5%: NÃO — a afirmação publicada se apoiava justamente nos dois anos que não passam. Com o índice de 7 componentes e o corte COM fronteira, a família das quatro temporadas fica assim: 2022 d 2,20 p 0,00520 q 0,01040 · 2023 d 0,87 p 0,11491 q 0,15322 · 2024 d 2,77 p 0,00022 q 0,00088 · 2025 d 0,74 p 0,39010 q 0,39010 — mínimo detectável 1,74 em todas (4 contra 12). Passam 2.022 e 2.024; 2.023 e 2.025 não passam — e não passar não é passar. Pior para a frase antiga: os dois efeitos fracos estão ABAIXO do mínimo detectável do desenho (1,74, com quatro promovidos contra doze do meio), e a §6.7 proíbe transformar “este desenho não enxergaria” em “não existe”. (b) Porta temporal da §6.4: NÃO, nunca rodada no nível da temporada; e no nível dos componentes só dist_remate passa (_porta_temporal.md). Nenhum dos dois critérios = indício, e a frase diz por quê: são quatro promovidos por temporada. Robustez da fronteira: é ela que INVERTE a conclusão — por isso o destino é “Parece, mas não é”, e não só um nível a menos. Sem os times colados na linha: 2022 4x9 d 2,18 p 0,00667 q 0,00667 (mínimo detectável 1,85) · 2023 1x5 sem teste · 2024 1x10 sem teste · 2025 2x8 d 2,68 p 0,00016 q 0,00032 (mínimo detectável 2,53). Ou seja, 2.025, o ano que o texto publicado chamava de fraco, vira o mais nítido dos quatro, e 2.023 e 2.024 ficam com um promovido só, sem teste possível. Logo “metade das temporadas” e o par (2.022, 2.024) são artefato do corte: não há duas temporadas em que a régua falhe, há duas em que não sobram times para responder — e quais duas depende de quem se conta. Some-se o achado 3 a 3 da auditoria: “deixando uma temporada de fora” não descreve o código — a variável treino da linha 202 de A14.py nunca é usada, e os componentes foram escolhidos com as quatro temporadas, inclusive a que se diz deixada de fora. Por isso o texto novo abre dizendo que nenhuma temporada ficou de fora. Passada de texto de 20/09, e o conserto do mesmo dia: esta conclusão FICA SEM GRÁFICO, de propósito. O gráfico de barras que ela teve por algumas horas mostrava a contagem de promovidos no alto do índice por temporada, num corte só, e entregava ao leitor a leitura exatamente invertida: 2.024 era a barra mais alta e é 1x10 sem os times de fronteira, grupo de 1, sem variância e sem teste; 2.025 era das mais baixas e é o ano mais nítido dos quatro sem eles (2022 4x9 d 2,18 p 0,00667 q 0,00667 (mínimo detectável 1,85) · 2023 1x5 sem teste · 2024 1x10 sem teste · 2025 2x8 d 2,68 p 0,00016 q 0,00032 (mínimo detectável 2,53)). E a linha tracejada nos quatro promovidos transformava contagem em placar por ano, quando a manchete fala de falta de times — contagem não mostra poder nenhum. Como a tese inteira é o corte de fronteira, a forma certa seria dois_cortes; não existe par de marcadores por temporada nos dois cortes na saída do script (só top4_2022 a top4_2025, que são de um corte só), então preferi não publicar desenho nenhum a publicar o corte único. A contagem por temporada continua no o_que_vimos, por extenso, e não se perdeu. Nada mais saiu: o mínimo detectável 1,74, a família das quatro temporadas e a inversão de metade fraca entre os dois cortes já estavam neste campo, acima, e continuam aqui — é onde o jargão é permitido. Terceira passada de 20/09, com dois consertos e uma correção deste campo. (1) CORREÇÃO: a frase acima, “Por isso o texto novo abre dizendo que nenhuma temporada ficou de fora”, descrevia o texto de 19/09 e deixou de ser verdade quando a passada de 20/09 encurtou o o_que_vimos — o encurtamento levou a ressalva junto, sem que ninguém decidisse tirá-la. Ela voltou ao texto visível, agora como “foi montada com esses mesmos quatro, nenhum ficou de fora”: é a circularidade, e o leitor precisa dela justamente porque o para_o_santa_cruz manda olhar as quatro temporadas juntas, que são as mesmas com que os componentes foram escolhidos. (2) O texto curto exibia o 4 em 4 solto, e esse ano é 2.024, que em 2022 4x9 d 2,18 p 0,00667 q 0,00667 (mínimo detectável 1,85) · 2023 1x5 sem teste · 2024 1x10 sem teste · 2025 2x8 d 2,68 p 0,00016 q 0,00032 (mínimo detectável 2,53) fica 1x10 SEM TESTE: grupo de um, sem variância e sem comparação. Exibir o único fato positivo do texto sem dizer que ele evapora no outro corte é publicar a leitura invertida, então a mesma frase agora carrega “justamente o ano dos quatro fica com um promovido só, sem teste, tirando os times de fronteira”. (3) Para caber nos 280, saiu a frase genérica “qual temporada parece fraca muda conforme quem entra na conta” — a inversão continua dita, e com nome, no caso concreto do ano dos quatro; o “um ano sozinho não responde” repetia a manchete e também saiu. Nenhum número mudou. Quarta passada de 20/09, e esta é troca de número, não de texto: o q de 2.023 nesta família passou a ser o que o A14.py grava, o mesmo que já estava no A14_testes.csv e no A14_resumo.json, no lugar do que vinha publicado — a decisão do dono é que o script é a verdade, e a diferença está na última casa decimal. Reli a frase com o valor novo no lugar e nenhuma palavra precisou mudar: a família continua com dois anos que passam (2.022 e 2.024) e dois que não (2.023 e 2.025), o de 2.023 continua acima do limiar de 5%, e os dois efeitos fracos continuam abaixo do mínimo detectável de 1,74.",
     "n": "4 temporadas fechadas, 4 promovidos contra 12 do meio em cada; sem os times colados na linha, 2.022 fica 4 contra 9 e 2.025 fica 2 contra 8, e 2.023 e 2.024 ficam com 1 promovido, sem comparação",
     "prova": "A14_resumo.json, validacao_uma_temporada_de_fora; A14_numeros_novos.json; A01_clube_temporada.csv; _porta_temporal.md",
     "status": "validada",
     "negativa": true,
     "grafico": null
    },
    {
     "id": "A14-3",
     "parte": "A14",
     "bloco": "A",
     "manchete": "Em 2026 a régua troca a ordem no topo e erra times do G4",
     "o_que_vimos": "Na rodada 27 ela põe no alto Novorizontino e Juventude, líderes da tabela, mas em ordem trocada. Mais abaixo erra feio: o Vila Nova é 3º em pontos e 12º nela, e a base está sem três jogos, um do próprio clube. Não dá para dizer se ela separa a dupla da ponta do resto do G6.",
     "para_o_santa_cruz": "Use a régua como leitura de rodada — ela diz se o time está fazendo as coisas que quem sobe faz — e não como aposta de quem sobe: nas temporadas fechadas ela acertou a dupla da ponta 1 vez em quatro, e erra times do G4 inteiros. Para o Santa Cruz, o uso é cobrar do elenco os 7 itens da lista ao longo do ano, e não perseguir posição na régua.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Não trata de nenhuma premissa existente.",
     "confianca": "indício",
     "confianca_motivo": "Indício, o mesmo nível de 17/09 — mas o texto publicado não podia ficar. (a) Correção para múltiplos testes a 5%: NÃO. O único teste que sustentava o verbo “separa” (1º–2º contra 3º–6º nas temporadas fechadas) nunca passou por correção nenhuma: A14 não gera A14_testes.csv e A14.py não chama bh() em lugar algum. E com 8 contra 16 o efeito medido no índice de 7 é d 0,94 (p 0,01453, mediana 79,4 contra 56,3) contra um mínimo detectável de 1,27 — abaixo do que o desenho enxerga. O corte que faltava mata o achado de vez: sem os times colados na linha vira 6 contra 4, d 0,84, p 0,35119, com mínimo detectável 2,07 (a varredura achou 6 contra 4, d 0,79, p 0,36880 no índice de oito componentes — mesma leitura). Conferi em A01_clube_temporada.csv por que isso acontece, e não é azar: 12 das 16 linhas do grupo 3º–6º são times colados na linha do G4, contra 2 das 8 do grupo 1º–2º, ou seja, a comparação publicada é carregada quase inteira por quem está em cima da fronteira. Pela regra da casa, conclusão que só aparece com esses times é ruído — por isso a frase nova diz que a régua NÃO separa a dupla da ponta do resto do G6, e é essa a resposta à verificação que o CLAUDE.md pede expressamente para A14 sob o regulamento novo. (b) Porta temporal da §6.4: NÃO. Nenhum dos dois critérios = indício, e a frase diz por quê: faltam 11 rodadas em 2026 (a leitura é da rodada 27 de 38), são só 8 times-temporada em 1º–2º nas temporadas fechadas, e a régua carrega o valor do elenco, que anda com a tabela. O que muda em relação a 17/09: com 7 componentes a ordem dos dois primeiros de 2026 inverte — Novorizontino (85,3) passa o Juventude (84,0) —, então “acerta em cheio” e “exatamente o 1º e o 2º” caem, e “os dois que sobem direto” afirmava um resultado que ainda não existe. O retrato de 2026 é descrição de temporada em curso, sem teste nenhum. O backtest continua valendo nos dois cortes, porque é contagem de acerto na tabela cheia: 2022 não · 2023 não · 2024 não · 2025 sim. E o Vila Nova, com 45,7 de índice, é 3º em pontos e 12º na régua. Ressalva que tem de constar: a base de 2026 está sem três jogos, um deles do Vila Nova, que é justamente o contraexemplo desta conclusão — conferir antes de publicar o nome. Passada de texto de 20/09: o índice dos três times que a frase nomeia virou um gráfico de barras, na mesma escala. Saíram do texto curto e continuam aqui, acima: a contagem do backtest temporada a temporada (2022 não · 2023 não · 2024 não · 2025 sim) e a conta de quem carrega a comparação 1º–2º contra 3º–6º — 12 das 16 linhas do grupo 3º–6º são times de fronteira, contra 2 das 8. Continua valendo a ressalva de conferir a base de 2026 antes de publicar o nome do Vila Nova. Conserto de 20/09, depois da conferência, em três pontos. (1) O título do gráfico era “A régua em 2026” e prometia o retrato do ano, mas o que está ali são três dos 20 times, escolhidos por serem os que o texto cita; passou a ser “O índice dos três times citados”, que é o que de fato está desenhado. O descasamento entre posição na tabela e posição no índice precisa de dois eixos e o renderizador só tem um, então o erro do Vila Nova continua dito no texto, com 3º e 12º, e não desenhado. (2) O recorte de três também não faz do Vila Nova o caso isolado: no teste_2026 do A14_resumo.json o Operário-PR é 6º em pontos com índice 16,4, o menor dos 20 e descasamento maior que o dele; e o Cuiabá descasa no sentido contrário, 10º em pontos e terceiro do índice, com 73,1. Quem lê só o gráfico sai com três times, não com o ano. (3) Os rótulos do gráfico — Novorizontino, Juventude e Vila Nova — estão CRAVADOS à mão: o formato do campo grafico aceita marcador no valor e não no rótulo, então os valores acompanham 85,3, 84,0 e 45,7 se a base mudar e os nomes não acompanham, e o portão não lê rótulo de gráfico. Isso pesa mais aqui do que em qualquer outra parte, porque a base de 2026 está sem três jogos, um deles do Vila Nova, que é o contraexemplo desta conclusão: por isso a ressalva dos três jogos foi para o o_que_vimos, onde o leitor a vê, e não fica só neste tooltip; e enquanto a base não for corrigida, quem mexer nela tem de mexer à mão nos rótulos deste gráfico. Terceira passada de 20/09, e é um conserto de afirmação, não de estilo. O encurtamento de 20/09 tinha apagado o “mas em ordem trocada” do texto de 19/09, e a manchete “Fora a dupla da ponta, a régua de 2026 não bate com a tabela” dizia, por contraste, que na dupla da ponta ela BATE. Não bate: Novorizontino é o primeiro da régua e o 2º da tabela, Juventude é o segundo da régua e o 1º da tabela — a régua acha a dupla e inverte a ordem. Era exatamente a leitura que esta rodada derrubou (“acerta em cheio” e “exatamente o 1º e o 2º” caem, acima), e o encurtamento a reintroduziu. O gráfico não podia salvar: ele é de barras num eixo só, com 85,3, 84,0 e 45,7, e não tem posição na tabela — o descasamento precisa de dois eixos, como já está dito acima. Então a inversão voltou ao o_que_vimos, em texto, e a manchete deixou de prometer acerto no topo. Para abrir os caracteres saíram só palavras, nenhuma ressalva: “os dois que lideram a tabela” virou “líderes da tabela”, e caíram o “só” antes de 12º e o “ainda” antes de “está sem três jogos”, que reforçavam a afirmação em vez de segurá-la. A ressalva dos três jogos que faltam na base e o “não dá para dizer se ela separa a dupla da ponta do resto do G6” continuam inteiros no texto visível. Nenhum número mudou.",
     "n": "20 times de 2026 na rodada 27, com 11 rodadas por jogar; nas temporadas fechadas, 8 times-temporada em 1º–2º contra 16 em 3º–6º — e, sem os times colados na linha, 6 contra 4",
     "prova": "A14_resumo.json, primeiro_segundo_contra_terceiro_sexto; A14_numeros_novos.json; A01_clube_temporada.csv",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "barras",
      "titulo": "O índice dos três times citados",
      "unidade": "0 a 100",
      "barras": [
       {
        "nome": "Novorizontino",
        "valor": 85.3
       },
       {
        "nome": "Juventude",
        "valor": "84,0"
       },
       {
        "nome": "Vila Nova",
        "valor": 45.7
       }
      ]
     }
    }
   ],
   "em_aberto": "O índice inclui H_dinheiro, o valor do elenco, que não se escolhe e é a peça de maior efeito: separar a parte escolhível da não escolhível exigiria residualizar pelo valor, e a decisão de 15/09 foi não descontar o dinheiro, só ressalvar. Continuam abertos, fora do alcance desta rodada: (1) resultados/A14.md não existe e A14_testes.csv também não, então o índice nunca entrou numa família de correção e a prova desta parte ainda aponta para o A14_resumo.json de 17/09, que é o do índice de oito componentes; (2) A14.py precisa de uma execução corrigida — prender candidatos() aos arquivos do Bloco A (hoje quebra com KeyError em J03_testes.csv e J08_testes.csv e com TypeError em A10_indicadores.json), tirar I_estabilidade_11, passar as três comparações pelos dois cortes de fronteira (o campo já é gravado e nunca é usado), emitir vn_reg em vez de contar à mão e regravar o A14_resumo.json; (3) a base de 2026 está sem três jogos, um deles do Vila Nova, que é o contraexemplo da A14-3. E duas das sete peças nascem de xG, cuja régua reproduz 30% de si mesma (_cruzar_19_09.md, achado 6).",
   "feita_em": null,
   "prova_arquivos": "scripts/A14.py"
  },
  {
   "id": "A15",
   "bloco": "A",
   "secao": "Que time montar",
   "pergunta": "O que um time faz num jogo que aumenta a chance de pontuar?",
   "status": "validada",
   "titulo": "O que o time faz num jogo que rende ponto, 2022 a 2025",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "A15-1",
     "parte": "A15",
     "bloco": "A",
     "manchete": "O time pontua cedendo chute pior, não cedendo menos chute",
     "o_que_vimos": "O mesmo time, no jogo em que pontua, chuta 0,66 metro mais perto e empurra o chute do adversário 0,85 metro para trás. E não sofre menos finalização. Recuar com o placar a favor daria o contrário.",
     "para_o_santa_cruz": "O eixo do modelo de jogo é a distância do chute, nos dois lados, e não o volume. Defender bem um jogo não é reduzir o número de finalizações do adversário — é empurrá-las para fora da área; o time que pontua sofre a mesma quantidade de chute, de mais longe. No ataque, a mesma régua: aproximar a finalização vale mais do que finalizar mais vezes. Isso vale para treino e para escolha de jogador (quem arrasta a jogada para dentro da área, quem protege a área em vez de bloquear chute de fora). O que esta parte NÃO autoriza é vender isso como causa: dentro de um jogo, o que o time faz e o ponto acontecem ao mesmo tempo.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Confirma, na unidade do jogo, a premissa que A02-1 e A06-3 montaram na temporada: o que separa é a qualidade da chance, e no lado defensivo ela é a distância do chute cedido, não o número de chutes cedidos. O acréscimo desta parte é que o achado sobrevive DENTRO do mesmo time, o que a unidade clube-temporada não conseguia mostrar.",
     "confianca": "provável",
     "confianca_motivo": "Provável porque passa num critério e o outro não existe nesta unidade. (a) Correção para múltiplos testes a 5% dentro da família: PASSA nas duas leituras e nos dois cortes. A distância do chute dá q 0,0001 e a distância do chute sofrido q 0,0001 na leitura de dentro do clube, com efeito +0,18 e +0,30 (o intervalo de 95% por clube vai de +0,12 a +0,25 e de +0,25 a +0,36). O gol esperado por finalização sofrida é o maior efeito da parte, +0,54. (b) O teste de anterioridade da §6.4 NÃO É CALCULÁVEL aqui, e isso foi declarado em A15_indicadores.json antes de rodar: ele é o indicador do 1º turno contra os PONTOS do 2º, e dentro de um jogo não existe 'antes'. Teto da parte: provável. É limite de dado, não reprovação. (c) Os dois cortes. As finalizações sofridas são a discordância: -0,06 com todos os jogos, onde não separam, e -0,11 sem os empates, onde separam — nos dois casos o sinal é o mesmo, o time que pontua sofre finalização igual ou a mais, nunca a menos, e é por isso que a manchete diz 'não cedendo menos chute'. As recuperações também trocam de sinal entre os cortes, +0,05 e -0,04, e em nenhum dos dois separam: é oscilação em volta do zero, não achado. (d) O que o desenho enxerga: o intervalo de 95% por clube tem meia-largura mediana de 0,08, e abaixo disso 'não separa' não quer dizer 'não existe'. (e) Efeito do placar. Ele é a ressalva principal desta parte e aqui joga CONTRA o achado, o que o reforça: time com o placar a favor recua e costuma ceder chute de mais perto, e o que se mediu foi o contrário. Nos indicadores de volume a ressalva continua de pé, e é o assunto de A15-2.",
     "n": "3.036 clube-jogos de Série B de 2022 a 2025 — 40 clubes, 80 clube-temporadas, 1.518 jogos: 1.961 com ponto contra 1.075 sem. Sem os empates, 1.075 contra 1.075. O erro é reamostrado por clube, 10.000 vezes.",
     "prova": "A15_testes.csv; A15_resumo.json; A15_indicadores.json; A15.md",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Distância do chute, o mesmo time comparado com ele mesmo",
      "unidade": "metros a mais no jogo em que pontuou",
      "cortes": [
       {
        "rotulo": "todos os jogos",
        "series": [
         {
          "nome": "chute do próprio time",
          "valor": -0.661
         },
         {
          "nome": "chute do adversário",
          "valor": 0.854
         }
        ]
       },
       {
        "rotulo": "sem os empates",
        "series": [
         {
          "nome": "chute do próprio time",
          "valor": -1.028
         },
         {
          "nome": "chute do adversário",
          "valor": 0.817
         }
        ]
       }
      ]
     }
    },
    {
     "id": "A15-2",
     "parte": "A15",
     "bloco": "A",
     "manchete": "No jogo em que pontua, o time tem menos bola",
     "o_que_vimos": "O mesmo time fica com 6,18 pontos de posse a menos no jogo em que pontua, e dá 8,93 passes a menos ao terço final. Bate com os 4,68 ataques posicionais e o escanteio a menos. Correr atrás do placar infla tudo isso.",
     "para_o_santa_cruz": "Não montar o time para ter a bola, e não ler 'teve menos bola' como jogo ruim: na Série B, o jogo em que o próprio time pontua é o jogo em que ele tem menos posse, menos passe ao terço final, menos ataque posicional e menos escanteio. A leitura honesta é que volume de ataque é, em boa parte, reação ao placar — quem está atrás ataca mais — e não receita. O uso prático é defensivo: tirar posse, passe ao terço final e escanteio da lista de metas de jogo e da ficha de contratação, porque subir esses números não é o mesmo que somar ponto. Isso não diz que ter a bola atrapalha; diz que ter a bola não é o que está pagando o ponto.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Confirma A05-1 (nenhum jeito de construir a jogada separa quem sobe) e dá contexto a A05-2 (os promovidos com menos da metade da bola): na unidade do jogo o sinal é o mesmo e mais forte. Não sugere premissa nova — sugere aposentar a leitura de posse como meta.",
     "confianca": "provável",
     "confianca_motivo": "Provável, e com uma ressalva que pesa mais que o número. (a) Correção para múltiplos testes: PASSA com folga nas duas leituras e nos dois cortes. A posse dá q 0,0001 e efeito -0,65 dentro do clube, indo a -0,88 sem os empates — o maior efeito de toda a parte; passes ao terço final -0,57 e ataques posicionais -0,45 vão no mesmo sentido, e os escanteios também, -0,27. (b) Anterioridade: não é calculável na unidade do jogo (ver A15-1). Teto: provável. (c) EFEITO DO PLACAR, e esta é a ressalva séria. Time que abre o placar entrega a bola; time que perde ataca até o fim. A base não tem o minuto do gol — é a mesma lacuna que a A09 mediu —, então não dá para recortar por estado do jogo e separar as duas coisas. O sinal de que é reação, e não receita, está no desenho do resultado: TODA a família de volume anda junto para baixo, que é a assinatura de quem corre atrás do resultado. Por isso a conclusão é escrita como descrição do que acontece, e o uso prático é só negativo: não perseguir esses números. (d) Os dois cortes concordam, e tirar os empates aumenta o efeito em todos eles, como se espera de um corte que afasta os grupos por construção. (e) Este achado NÃO diz que o que rende ponto num jogo é o que faz subir na temporada: são perguntas diferentes, e quem responde a segunda é o bloco A de A02 a A14.",
     "n": "3.036 clube-jogos de Série B de 2022 a 2025 — 40 clubes, 80 clube-temporadas: 1.961 com ponto contra 1.075 sem; sem os empates, 1.075 contra 1.075. Cada indicador entra centrado no próprio clube, naquela temporada e naquele mando.",
     "prova": "A15_testes.csv; A15_resumo.json; A15.md",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Posse de bola no jogo em que pontuou e no jogo em que perdeu",
      "unidade": "% de posse",
      "cortes": [
       {
        "rotulo": "todos os jogos",
        "series": [
         {
          "nome": "pontuou",
          "valor": "48,16"
         },
         {
          "nome": "perdeu",
          "valor": "52,96"
         }
        ]
       },
       {
        "rotulo": "sem os empates",
        "series": [
         {
          "nome": "venceu",
          "valor": "47,04"
         },
         {
          "nome": "perdeu",
          "valor": "52,96"
         }
        ]
       }
      ]
     }
    },
    {
     "id": "A15-3",
     "parte": "A15",
     "bloco": "A",
     "manchete": "Descer ao jogo mede melhor e não prova mais",
     "o_que_vimos": "As 3.036 linhas são os mesmos 40 clubes. Trocar o teste que conta linha pelo que conta clube move 18 indicadores para 19, quase nada. O que morre de vez é o 'antes': num jogo, o que o time faz e o ponto acontecem juntos.",
     "para_o_santa_cruz": "Vale descer ao jogo, mas pelo motivo certo. O ganho é de precisão: comparar o time com ele mesmo em 38 jogos mede muito melhor do que um número por temporada, e foi isso que deixou esta parte separar o que o time FAZ do que o time É. O ganho que não existe é de prova: o número de provas independentes continua sendo o de clubes, e o critério mais duro da casa, o de vir antes do resultado, deixa de ser calculável — nenhuma conclusão de jogo pode passar de provável. Na prática: usar o nível do jogo para afinar o modelo de jogo e a ficha de contratação, e continuar decidindo acesso pela temporada. E não encomendar mais coleta de jogo esperando que ela transforme indício em certeza.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere uma premissa de método, não de futebol: nesta base, mais linha compra precisão e não compra prova, porque o número de clubes não muda. Ela explica por que as conclusões de jogo entram no teto de provável e serve de resposta pronta à próxima proposta de descer de unidade.",
     "confianca": "indício",
     "confianca_motivo": "Indício, e de propósito: isto não é um teste, é a medida do que o desenho consegue e do que não consegue. Os números: o intervalo de 95% por clube tem meia-largura mediana de 0,08 e no pior caso 0,13, contra os 0,11 que um teste de linha fingiria enxergar; na leitura de dentro do clube, 18 indicadores sairiam como firme pelo teste de linha e 19 saem pelo de clube, e na leitura entre times 18 contra 17. Ou seja: o teste de linha, que é o errado nesta unidade, aqui dava quase a mesma resposta — não porque ele esteja certo, mas porque os efeitos medidos são grandes e do mesmo sinal nos 40 clubes. Foi o de clube que rodou; o de linha está na tabela ao lado só para que o tamanho do conserto ficasse medido e não alegado. O que a ida para o jogo NÃO compra é o critério de anterioridade, e essa perda é estrutural, não da base: nenhuma coleta a resolve.",
     "n": "21 indicadores em 5 famílias, sobre 3.036 clube-jogos de 40 clubes; 10.000 reamostragens de clube em cada célula.",
     "prova": "A15_resumo.json; A15_testes.csv; _metodo_jogo.py",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "barras",
      "titulo": "Dos 21 indicadores, quantos saem como firme em cada teste",
      "unidade": "indicadores",
      "barras": [
       {
        "nome": "teste de linha",
        "valor": 18
       },
       {
        "nome": "teste de clube",
        "valor": 19
       }
      ]
     }
    }
   ],
   "em_aberto": "Duas coisas ficaram medidas e sem dono. (1) A dividida no chão: o A06-1 acha que ganhá-la separa quem sobe na temporada, e aqui, dentro do mesmo time, ela anda de leve para o lado contrário nos dois cortes — é efeito pequeno e pode ser o placar (quem está à frente disputa menos), mas a tensão entre as duas unidades tem de ser resolvida antes de a dividida virar requisito de contratação. (2) O estado do jogo: sem minuto do gol não dá para separar o que o time escolheu fazer do que ele fez porque estava ganhando. É a mesma coleta que a A09 deixou pendente — o primeiro gol de cada jogo — e ela resolveria as duas de uma vez. Continua sem resposta, e agora com preço: é a compra que mais renderia ao estudo.",
   "feita_em": null,
   "prova_arquivos": "scripts/A15.py + scripts/_metodo_jogo.py + scripts/_metodo.py"
  },
  {
   "id": "A16",
   "bloco": "A",
   "secao": "Que time montar",
   "pergunta": "Dentro do que o dinheiro compra, qual traço dá mais ponto por real?",
   "status": "validada",
   "titulo": "Ponto por real: o que sobra depois do dinheiro, 2022 a 2025",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "A16-1",
     "parte": "A16",
     "bloco": "A",
     "manchete": "A dinheiro igual, o jeito de jogar rende mais que o elenco",
     "o_que_vimos": "Subir do quarto de baixo para o quarto de cima da liga em solidez vale +8,9 pontos. O mesmo salto no valor do elenco vale 7,0 e custa 9,9 mi de euro. Jogar assim equivale a 12,6 mi de elenco.",
     "para_o_santa_cruz": "Este é o número para levar a reunião de orçamento. Com o dinheiro controlado, os traços do modelo continuam de pé, e o salto de um quarto de tabela em solidez ou em qualidade da chance paga mais ponto do que o mesmo salto na folha. Traduzido: o que se compra com treinador, treino e modelo de jogo vale, nesta liga, dezenas de milhões de elenco — e o clube que não vai ter folha de top-5 tem aí onde competir. Duas travas. A primeira: isto NÃO diz que jogar assim é de graça; custa treinador, treino e jogador, e nada disso está medido. A segunda: o A12-2 já mediu que quem jogou como os que subiram SEM dinheiro caiu mais do que subiu — a receita existe, mas quem a tentou com elenco barato saiu pior, e é isso que separa este achado de uma promessa.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Confirma a premissa que A02-1 e A12-1 montaram e acrescenta o preço: o eixo da qualidade da chance e a solidez continuam separando depois de descontado o dinheiro, e agora com quanto valem em ponto e em elenco. Não sugere premissa nova.",
     "confianca": "provável",
     "confianca_motivo": "Provável porque passa num critério e falha no outro. (a) Correção para múltiplos testes a 5% dentro da família: PASSA nos dois cortes e com os dois controles. Solidez dá q 0,0000 com todos os times e 0,0010 sem os colados na linha; a parcial vai de +0,521 para +0,480. A régua da qualidade da chance dá q 0,0002 e a distância do chute q 0,0001. Trocando o controle pela régua do dinheiro (valor total e valor mediano juntos), a solidez dá q 0,0000: o achado não depende de qual medida de dinheiro entra. (b) Anterioridade: REPROVA, e é o assunto de A16-2. Teto: provável. (c) Poder: com 80 clube-temporadas o desenho enxerga a partir de 0,45, e as parciais publicadas estão acima disso. (d) A equivalência em euro é ARITMÉTICA de duas inclinações da mesma regressão, não promessa de mercado: ela diz quanto de elenco daria o mesmo número de pontos NESTA base, e não que exista elenco à venda por esse preço. O degrau de referência — do 25º ao 75º percentil de valor — é 9,9 mi de euro na mediana das quatro temporadas. (e) A moeda é o EURO, do Transfermarkt. A pergunta foi feita em real; converter exigiria uma taxa e uma data que a base não tem, e inventar a taxa seria pior que trocar a moeda. (f) O valor do Transfermarkt é um instantâneo sem data conhecida e pode ter sido atualizado no meio da temporada — nesse caso ele já carrega parte do resultado, e o controle fica forte demais, não fraco. O erro, se existe, é contra o achado.",
     "n": "80 clube-temporadas de 2022 a 2025 (40 clubes); sem os times colados na linha, 52. 8 traços em 3 famílias, herdados da lista do A14.",
     "prova": "A16_testes.csv; A16_resumo.json; A16_indicadores.json; A16.md",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "barras",
      "titulo": "Pontos que valem 50 postos de subida, a dinheiro igual",
      "unidade": "pontos na temporada",
      "barras": [
       {
        "nome": "solidez",
        "valor": 8.87
       },
       {
        "nome": "qualidade da chance",
        "valor": 8.51
       },
       {
        "nome": "distância do chute",
        "valor": 7.97
       },
       {
        "nome": "elenco mais caro",
        "valor": 6.95
       }
      ]
     }
    },
    {
     "id": "A16-2",
     "parte": "A16",
     "bloco": "A",
     "manchete": "Com o dinheiro na conta, nenhum traço prova vir antes do ponto",
     "o_que_vimos": "A distância do chute do 1º turno previa os pontos do returno com +0,289. Pondo o dinheiro no mesmo desconto, cai para +0,198 e deixa de valer. Dos 8 traços, 2 passavam e 0 passam agora.",
     "para_o_santa_cruz": "É o freio do A16-1, e tem de andar colado nele. O que o estudo chamava de traço que vem antes do resultado carregava dinheiro dentro: quando o elenco caro entra no mesmo desconto, a anterioridade some. Na prática isso não derruba o modelo de jogo — a associação a dinheiro igual continua de pé —, mas derruba a frase “jogue assim e os pontos vêm depois”. O que se pode prometer à diretoria é que times que jogam assim pontuam mais com o mesmo elenco; o que NÃO se pode prometer é que mudar o jeito de jogar no meio do ano traga os pontos do returno. Para decidir contratação e treinador isso basta; para decidir troca de treinador no meio da temporada, não basta.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "AJUSTA a premissa que o _porta_temporal.md registrou: a porta da §6.4 passava para a distância do chute e para a régua da qualidade da chance, e esse resultado foi reproduzido aqui número a número. O que muda é que ela não sobrevive a pôr o dinheiro no mesmo desconto — e o estudo nunca tinha rodado a porta com esse controle.",
     "confianca": "indício",
     "confianca_motivo": "Indício, e por escolha. Isto é um resultado NEGATIVO sobre o critério de anterioridade, não um achado que passou em teste: o que ele mostra é que um teste que passava deixa de passar quando o controle fica certo. Os números: sem o dinheiro, a distância do chute dá +0,289 com p 0,0094 e a régua da qualidade da chance +0,254 com p 0,0228 — os mesmos valores que o _porta_temporal.json publica para a §6.4, reproduzidos aqui pela mesma função, o que é a conferência de que esta parte roda a conta da casa e não uma parecida. Com o dinheiro no controle, +0,198 com p 0,0789 e +0,057 com p 0,6152. Nenhum dos 8 traços passa. Por que o controle a mais é mais apertado e não mais frouxo: sem ele, a porta não distingue “este traço vem antes” de “quem tem este traço é rico”. Ressalva do sinal contrário: o valor do Transfermarkt é da temporada inteira, não do 1º turno, e o _porta_temporal.json já registra que ele pode ter sido atualizado no meio do ano — se foi, ele carrega parte do resultado e o controle fica forte demais. Então este achado é um TETO para a anterioridade, não uma medida dela.",
     "n": "80 clube-temporadas de 2022 a 2025, com o traço medido só nas 19 primeiras rodadas e os pontos somados das 19 últimas.",
     "prova": "A16_testes.csv; A16_resumo.json; _porta_temporal.json; A16.md",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "O teste de anterioridade, sem e com o dinheiro no controle",
      "unidade": "correlação parcial com os pontos do returno",
      "cortes": [
       {
        "rotulo": "só descontando a pontuação do 1º turno",
        "series": [
         {
          "nome": "distância do chute",
          "valor": 0.289
         },
         {
          "nome": "qualidade da chance",
          "valor": 0.254
         }
        ]
       },
       {
        "rotulo": "descontando também o dinheiro",
        "series": [
         {
          "nome": "distância do chute",
          "valor": 0.198
         },
         {
          "nome": "qualidade da chance",
          "valor": 0.057
         }
        ]
       }
      ]
     }
    },
    {
     "id": "A16-3",
     "parte": "A16",
     "bloco": "A",
     "manchete": "A dividida no chão só paga ponto fora de casa",
     "o_que_vimos": "Ganhar mais dividida no chão FORA vale +4,9 pontos a dinheiro igual. Em casa, +0,2, e some na correção. A conta do total, somando os dois mandos, dá +3,6 e esconde essa diferença.",
     "para_o_santa_cruz": "Se a dividida no chão entrar na ficha de contratação, ela entra como exigência para o jogo FORA de casa — é lá que ela paga. Em casa o estudo não acha efeito nenhum depois do dinheiro, nos dois cortes. Isso muda o que se procura: não o zagueiro que ganha duelo em qualquer cenário, mas o time que sustenta a disputa quando joga sem o campo a favor. Vale como critério de modelo de jogo para o jogo fora e como desempate na contratação — o eixo principal continua sendo a qualidade da chance, que rende o dobro.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "AJUSTA a A03-2, que diz que quem sobe ganha mais dividida NOS DOIS mandos. Continua verdade que quem sobe ganha mais nos dois; o que esta parte acrescenta é que, descontado o dinheiro, só a de fora vira ponto. As duas leituras convivem: uma descreve quem subiu, a outra diz o que paga.",
     "confianca": "provável",
     "confianca_motivo": "Provável. (a) Correção para múltiplos testes dentro da família da disputa: a dividida no chão fora passa nos dois cortes, q 0,0131 com todos os times e 0,0498 sem os colados na linha, com parcial +0,316 e +0,305. A de casa não passa em nenhum dos dois, q 0,4919 e 0,2308, com parcial +0,078 e +0,169 — os dois cortes concordam, e é por isso que a diferença entre os mandos sobe como conclusão em vez de ficar como ruído. Com a régua do dinheiro no lugar do valor total, o mesmo: 0,0100 contra 0,3646. (b) Anterioridade: REPROVA, como em toda esta parte (A16-2). Teto: provável. (c) O que isto NÃO prova: que ganhar dividida em casa não serve. O desenho enxerga a partir de 0,45, e a parcial da dividida em casa está abaixo disso — “não separa” aqui quer dizer “este desenho não veria”, e não “não existe”. (d) Efeito do placar: quem está ganhando disputa menos, e isso vale mais em casa, onde se ganha mais. Parte da diferença entre os mandos pode ser isso, e a base não tem minuto do gol para separar — a mesma lacuna que a A09 mediu.",
     "n": "80 clube-temporadas de 2022 a 2025 (40 clubes); sem os times colados na linha, 52.",
     "prova": "A16_testes.csv; A16_indicadores.json; A16.md",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "O que a dividida no chão rende, a dinheiro igual",
      "unidade": "pontos na temporada, por 50 postos de subida",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "fora de casa",
          "valor": 4.86
         },
         {
          "nome": "em casa",
          "valor": 0.18
         }
        ]
       },
       {
        "rotulo": "sem os times colados na linha",
        "series": [
         {
          "nome": "fora de casa",
          "valor": 4.16
         },
         {
          "nome": "em casa",
          "valor": 1.6
         }
        ]
       }
      ]
     }
    }
   ],
   "em_aberto": "Duas. (1) O preço do traço. Esta parte mede o que o traço RENDE e não o que ele CUSTA: treinador, treino e jogador que sustentam a solidez têm preço, e sem ele a comparação com o elenco é de um lado só. A folha salarial por clube-temporada resolveria, e não está na base. (2) O instantâneo do Transfermarkt. O valor não tem data conhecida, então não dá para saber se ele foi medido antes ou depois do resultado — e é disso que depende a leitura da A16-2. Um valor por rodada, ou ao menos por turno, é a coleta que mais renderia a esta pergunta.",
   "feita_em": null,
   "prova_arquivos": "scripts/A16.py + scripts/_porta_temporal.py + scripts/A14.py"
  },
  {
   "id": "T01",
   "bloco": "T",
   "secao": "Que treinador buscar",
   "pergunta": "Quem comandou cada time da Série B, em quais rodadas, de 2018 a 2026?",
   "status": "validada",
   "titulo": "Quem comandou cada time da Série B, 2018 a 2026",
   "tipo": "coleta",
   "conclusoes": [
    {
     "id": "T01-1",
     "parte": "T01",
     "bloco": "T",
     "manchete": "Só 40 dos 160 times terminaram o ano com o treinador que começaram",
     "o_que_vimos": "Nas 160 clube-temporadas fechadas de 2018 a 2025 a mediana é de 2 treinadores efetivos e a média é de 1,3 troca por ano. Só 40 times chegaram ao fim do ano com quem os abriu. 2026 fica fora da conta porque não acabou.",
     "para_o_santa_cruz": "Orçar comissão técnica para um ano é orçar mais de uma: o clube mediano da Série B troca uma vez, 67 dos 160 (42%) trocaram duas vezes ou mais, e quem planeja a temporada com um nome só está planejando a exceção. A reserva de rescisão e de segunda comissão entra na conta desde o início, não como imprevisto. E o perfil de jogador de J05 não pode ficar amarrado a um modelo de jogo que tem uma chance em quatro de chegar inteiro em novembro.",
     "premissa": "m5",
     "premissa_titulo": "Comissão técnica top — investir",
     "premissa_grupo": "Montagem do elenco",
     "premissa_motivo": "Ajusta m5 (“Comissão técnica top — investir”, grupo Montagem do elenco): a premissa trata a comissão como uma linha só do orçamento, e a base mostra que o clube mediano da Série B paga mais de uma por temporada. Sugere premissa nova no grupo Orçamento: reserva de rescisão e recontratação de comissão técnica, dimensionada pela mediana de 2 treinadores por clube-temporada na Série B.",
     "confianca": "indício",
     "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios da §6. (a) Benjamini-Hochberg a 5% dentro da família: não há teste nenhum em T01 — não existe resultados/T01_testes.csv nem T01_resumo.json, nenhum script da parte importa scripts/_metodo.py e não há um único q para conferir; a parte é coleta, não análise. (b) Porta temporal da §6.4 (o indicador do 1º turno contra os pontos do 2º): uma contagem de trocas de treinador não tem indicador de 1º turno a prever pontos de 2º, e _porta_temporal.md registra que a parte não a rodou. Cai junto o motivo antigo, “contagem completa dos nove anos”: uma das 9 temporadas não acabou e 62 das 6.608 rodadas jogadas não têm dono conhecido. Os dois cortes ficam escritos: nas fechadas de 2018 a 2025 (n=160) um treinador só comandou o ano em 39 (24%), com média de 2,32 efetivos; em 2026 sozinha são 10 de 20, o dobro de qualquer ano fechado e fora da faixa de 20% a 35% que os anos fechados desenham. Os dois mostram rotatividade alta; o que não vale nos dois é o tamanho, e por isso a frase manda 2026 para fora com o número na mão. O corte de fronteira não se aplica: não há comparação entre faixas numa contagem de passagens de treinador. Do texto de 10 segundos saem para cá, por serem ressalva de cobertura e não achado: os interinos dirigiram 283 das 6.546 rodadas com treinador identificado (4,3% delas), contagem de uma fonte só e sem nenhum teste por trás; e a conta juntando as 9 temporadas, com 2026 pela metade dentro, dá 49 de 180 (27%) com um treinador só, que é o número antigo, inflado pela temporada que não acabou. O gráfico desta conclusão põe 40 contra o total de 160 fechadas, que é o par da manchete; a repartição por número de efetivos não vira gráfico porque a saída do script não tem marcador para a faixa do meio, a de dois efetivos, e duas barras sem ela seriam lidas como o todo.",
     "n": "160 clube-temporadas fechadas (2018–2025); 2026, com 20 clube-temporadas em curso, entra à parte e não na conta",
     "prova": "T01_rodada_treinador.csv; T01_numeros_novos.json; base_passagens_temporada.csv; T01.md, seção Prova",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "barras",
      "titulo": "Terminaram o ano com o treinador que começaram, 2018 a 2025",
      "unidade": "clube-temporadas",
      "barras": [
       {
        "nome": "Terminaram com quem começou",
        "valor": 40
       },
       {
        "nome": "Total de fechadas",
        "valor": 160
       }
      ]
     }
    },
    {
     "id": "T01-2",
     "parte": "T01",
     "bloco": "T",
     "manchete": "29 treinadores comandaram dez rodadas ou mais em três clubes ou mais",
     "o_que_vimos": "Dos 193 treinadores da base, 29 tiveram dez rodadas ou mais em três clubes ou mais, e 29 é piso porque 62 rodadas ficaram sem treinador conhecido. Allan Aal chegou a 9. Na janela de 2022 a 2025, a única com régua técnica e física, restam 14 nomes, metade da lista.",
     "para_o_santa_cruz": "Dá para julgar treinador pelo que ele repete em clubes diferentes, e não pela última campanha, que é o que o mercado vende. Mas a lista que chega em T03 e T04 é a de 2022 a 2025: 14 nomes, não 29 — é dessa lista curta que sai o treinador. Quem tem um clube só na Série B entra como aposta, e tem de ser pago como aposta.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Não trata de nenhuma premissa de dados/premissas.json, e não sugere nova.",
     "confianca": "indício",
     "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios da §6. (a) Benjamini-Hochberg a 5%: não existe resultados/T01_testes.csv nem T01_resumo.json, não há um q na parte e nenhum script dela importa scripts/_metodo.py. (b) Porta temporal da §6.4: não há 1º turno prevendo 2º turno numa contagem de clubes por treinador. O número em si é sólido e é piso: recontado do zero em T01_rodada_treinador.csv, reagrupando a temporada pelos blocos de meses com jogo de scripts/A01.py, deu 29, o mesmo valor de hoje, e as 62 rodadas sem dono só podem somar clubes, nunca tirar. Cai o motivo antigo, “contagem completa”, que a própria parte desmente. Os dois cortes: na janela cheia de 2018 a 2026 são 29; na janela de 2022 a 2025, única com régua física (SkillCorner, 2022–2025), são 14 — 15 com 2026 dentro. O achado vale nos dois; o que muda é a amostra que chega a T03 e T04, e é ela que sustenta o uso prático. Com e sem interino dá 29 dos dois lados; sem o corte de dez rodadas dá 47, mesma direção. Fronteira não se aplica: não há comparação entre faixas nesta conclusão. Saem do texto para cá o resto do topo de clubes — Claudinei Oliveira, Marcelo Cabo e Mozart em 7 clubes cada, Daniel Paulista e Guto Ferreira em 6 — e a ressalva de que 29 é piso: as 62 rodadas sem dono só podem somar clubes, nunca tirar. A ressalva de piso, porém, voltou para o texto de 10 segundos, e aqui fica só o porquê: o selo é tooltip, o gráfico mostra as três janelas e não a incerteza, e quem lê só a tela usaria a lista curta para escolher treinador sem saber que ela só pode crescer. Fica também escrito na tela que os 193 são os treinadores DA BASE, não os treinadores da Série B: a coleta tem 29 clube-temporadas com buraco, então 193 é quem a coleta conhece, e dizer “da Série B” transformaria uma contagem em censo. O gráfico põe as três janelas lado a lado.",
     "n": "193 treinadores; 113 chegaram a pelo menos uma passagem de dez rodadas ou mais, e 278 das 492 passagens-temporada cruzam esse corte",
     "prova": "T01_rodada_treinador.csv; T01_numeros_novos.json; base_passagens_temporada.csv; T01.md, seção Prova",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "barras",
      "titulo": "Treinadores com dez rodadas ou mais em três clubes ou mais",
      "unidade": "treinadores",
      "barras": [
       {
        "nome": "2018 a 2026",
        "valor": 29
       },
       {
        "nome": "2022 a 2026",
        "valor": 15
       },
       {
        "nome": "2022 a 2025",
        "valor": 14
       }
      ]
     }
    },
    {
     "id": "T01-3",
     "parte": "T01",
     "bloco": "T",
     "manchete": "A coleta registrou 492 passagens de treinador em 180 clube-temporadas",
     "o_que_vimos": "Na janela que a Protótipo estimava, a coleta entregou 276 passagens, dentro dos 250 a 400 previstos. Das 157 passagens de dez jogos ou mais que a segunda fonte tem de 2022 a 2026, 150 batem no mesmo clube e no mesmo ano; antes de 2022 não há conferência.",
     "para_o_santa_cruz": "O clube passa a julgar treinador pelo histórico inteiro na Série B — quantas rodadas comandou, em quais clubes, com que elenco — e não pela última campanha. Quem aparece em três clubes é histórico conferível; quem aparece em um é aposta. T02, T03 e T04 ficam destravadas com essa base.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Não trata de nenhuma premissa de dados/premissas.json. Contradiz, sim, uma frase do próprio CLAUDE.md, em “O que a base não tem”: “T01 a T04. Nenhuma base tem nome de treinador”. É falsa desde 14/09 — dados/bola_parada.json traz 280 passagens de Série B com treinador, clube, jogos e datas, de 2022 a 2026, vindas do Sofascore. A frase é do arquivo do dono e a correção é dele.",
     "confianca": "indício",
     "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios da §6. (a) Benjamini-Hochberg a 5%: não existe resultados/T01_testes.csv nem T01_resumo.json, e não há teste nem q nenhum em T01. (b) Porta temporal da §6.4: não se aplica a uma coleta. A conferência independente contra o Sofascore (150 de 157) fortalece muito a coleta e fecha o “em aberto” da parte, mas não é nenhum dos dois critérios: tira a ressalva, não sobe o selo. Sai também do motivo o “zero jogo contado duas vezes”: com um dono por jogo, sobra zero é propriedade do modelo, não conferência que poderia ter falhado. A cobertura, nos dois lados: 151 das 180 clube-temporadas fecham a conta exata e 29 ficam com buraco, somando 62 das 6.608 rodadas jogadas sem treinador conhecido — e são dois desses buracos que explicam as passagens do Sofascore que a coleta não tem. A leitura é a mesma nos dois lados, então o corte não muda a conclusão. Saem do texto para cá as 7 passagens que não batem: cinco são apelido do mesmo homem — Marcinho é Márcio Freitas no Ituano de 2023, com as mesmas 30 rodadas dos dois lados — e duas são treinadores que a coleta não tem, os dois dentro dos 29 clube-temporadas com buraco. É contagem, não teste, e por isso a conferência tira ressalva sem subir o selo. Duas ressalvas de recorte saem do texto de 10 segundos para cá. Uma: a estimativa da etapa 15 valia para 100 clube-temporadas, então a janela comparável da coleta são as 276 passagens de 2022 a 2026 — as 492 da manchete cobrem 2018 a 2026 e não se comparam com aquela faixa, e o texto antigo, que as juntava, invertia a leitura. Outra: a segunda fonte só cobre 2022 a 2026, então as 157 passagens conferidas são as longas dessa janela, menos de um terço da coleta e nenhuma antes de 2022; a conferência é parcial, e é mais um motivo para o selo ficar em indício. Essa segunda ressalva, a da janela, deixou de morar só aqui: a janela de 2022 a 2026 e o “antes de 2022 não há conferência” estão agora na própria frase do texto de 10 segundos e no título do gráfico, porque o selo é tooltip e o leitor não passa o mouse nele. A manchete diz o que a COLETA registrou, e não o que a Série B tem: 492 em 180 clube-temporadas é o que esta coleta fechou, não um censo da competição. São 29 clube-temporadas com buraco e 62 das 6.608 rodadas jogadas sem treinador conhecido, e o em_aberto da parte registra que scripts/T01_rodadas.py, rodado hoje, devolve outros números. Com o selo em indício, afirmar o número como fato da competição seria mais força do que o dado paga.",
     "n": "492 passagens-temporada em 180 clube-temporadas, 2018–2026 (era 506 em 188)",
     "prova": "T01_rodada_treinador.csv; T01_numeros_novos.json; dados/bola_parada.json; T01_lacunas.json; T01.md, seção Prova",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "barras",
      "titulo": "Conferência contra a segunda fonte, passagens longas de 2022 a 2026",
      "unidade": "passagens",
      "barras": [
       {
        "nome": "Batem",
        "valor": 150
       },
       {
        "nome": "Não batem",
        "valor": 7
       }
      ]
     }
    }
   ],
   "em_aberto": "A conferência contra fonte independente foi feita e passa (150 das 157 passagens de dez jogos ou mais do Sofascore, em dados/bola_parada.json). Ficam em aberto duas coisas. Uma: o que o Sofascore tem e a coleta não — Claudinei Oliveira na Ferroviária de 2025 e Fábio Matias no CRB de 2026 —, dentro dos 29 clube-temporadas com buraco de T01_lacunas.json, que somam 62 das 6.608 rodadas jogadas sem treinador conhecido. Outra: scripts/T01_rodadas.py ainda tira a temporada de d.year e, rodado hoje, devolve 506 passagens em 188 clube-temporadas e reescreve base_passagens_temporada.csv com 506 linhas, contra os 492 em 180 publicados aqui; o T01.md também não é reescrito desde 17/09 e discorda destes números. Os dois são decisão do dono, e nenhum deles foi tocado nesta rodada.",
   "feita_em": null,
   "prova_arquivos": "scripts/T01.py + scripts/T01_rodadas.py"
  },
  {
   "id": "T02",
   "bloco": "T",
   "secao": "Que treinador buscar",
   "pergunta": "Quais treinadores mantêm seus times mais rodadas no G4?",
   "status": "validada",
   "titulo": "Rodadas no G4 por treinador, 2022 a 2026",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "T02-1",
     "parte": "T02",
     "bloco": "T",
     "manchete": "O tempo no G4 acompanha o preço do elenco",
     "o_que_vimos": "Clube com elenco entre os cinco mais caros passa, em média, 14,6 rodadas no G4 por temporada; do 11º elenco para baixo, 3,2. A distância que a conta sustenta é a dos cinco mais caros contra o 11º para baixo; contando todas as rodadas, o degrau do meio não se separa do acaso.",
     "para_o_santa_cruz": "Currículo de treinador com muito tempo no G4 diz, antes de tudo, o caixa do clube em que ele estava: na lista curta, cada nome tem de vir com o valor do elenco que comandou em cada ano. Para o Santa Cruz, que não vai ter elenco do top-5, o alvo é quem fez tempo de G4 com elenco do 11º para baixo — grupo em que mais da metade dos clubes não passa uma rodada sequer no G4.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Confirma a ressalva aceita pelo dono em 15/09 (“elenco valioso tende a ter isso; o estudo não separa as duas coisas”) e sugere premissa nova no grupo Montagem do elenco: tempo no G4 anda com o preço do elenco, e todo currículo — de treinador ou de jogador — é lido ao lado do valor do elenco em que ele trabalhou.",
     "confianca": "provável",
     "confianca_motivo": "(a) Correção para múltiplos testes a 5%: PASSA. Família das 3 comparações de faixa de valor, posto de rodadas no G4 dentro da temporada, Welch bilateral, BH a 5% pelo scripts/_metodo.py: q = 0,005 nos 5 mais caros contra o 11º-para-baixo, d = 0,99, IC95 por bootstrap de clube de 0,48 a 1,84 e d mínimo detectável a 80% = 0,78 — ou seja, há poder. Os outros dois degraus não passam: q = 0,056 do 6º-10º contra o 11º-para-baixo e q = 0,33 dos 5 mais caros contra o 6º-10º. O degrau dos 5 mais caros contra o 11º-para-baixo é o único que sobrevive a tudo: passa nas quatro células do T02_testes.csv — as duas contagens (todas as rodadas e da 10ª rodada em diante) vezes os dois cortes de fronteira de valor (com os vinte clubes e sem os dos postos de valor 5, 6, 10 e 11) — e os dois desempates do empate CRB/Novorizontino de 2023, que cai exatamente no corte 10º/11º de valor, também não o derrubam. Os dois cortes de fronteira, porém, DISCORDAM num ponto, e a versão anterior deste motivo escondia isso ao dizer que em todas as versões só o degrau de cima passava: nas linhas do indicador Rodadas no G4 da 10ª rodada em diante, o degrau do meio contra o 11º-para-baixo PASSA com os vinte clubes (selo firme, poder suficiente) e NÃO passa sem os clubes de fronteira de valor. É por isso que essa separação do meio não entra na manchete nem no texto de 10 segundos: ela depende dos clubes de fronteira. Pela mesma tabela também não vale dizer que sem os clubes de fronteira a escada abre: os dois degraus que envolvem os 5 mais caros abrem, e o do meio contra o 11º-para-baixo fecha — é justamente o que o corte de fronteira existe para mostrar. (b) Porta temporal: NÃO passa, e não é passável — tm_valor_total é instantâneo de temporada e não tem versão por turno (_porta_temporal.md, §3 e §4: “não calculável por turno”), e o complemento honesto de lá, o valor da temporada inteira contra os pontos do 2º turno, o próprio arquivo diz que não conta como passar. Um dos dois = provável; firme é impossível aqui por falta de dado, não por falta de trabalho. Ressalva de entrega, cumprida em 20/09: o teste está gravado em T02_testes.csv e o agrupamento por faixa de valor roda dentro do scripts/T02.py, que importa o scripts/_metodo.py — o pipeline produz os dois, e o selo pode ir à tela. A contagem da 10ª rodada em diante é a mesma escada: 11,7 · 7,1 · 2,3 rodadas em 29, contra 14,6 · 9,5 · 3,2 em 38. Ela ficou FORA do gráfico de propósito: o desenho de dois cortes do static/estudo_serieb_grafico.js usa um eixo só para os dois blocos, e como os denominadores são diferentes o bloco de 29 rodadas apareceria inteiro deslocado para a esquerda, como se o corte de robustez enfraquecesse o achado — quando, em proporção das rodadas jogadas, ele não enfraquece. Rotular cada bloco não conserta eixo compartilhado. Por isso o gráfico mostra só a contagem de todas as rodadas, e os dois cortes voltam a ficar lado a lado quando o scripts/T02.py gravar a contagem em percentual de rodadas no G4. Um aviso sobre a média: a distribuição é torta, e as medianas do mesmo recorte são 9 · 6 · 0 rodadas — é por isso que o texto de 10 segundos diz “em média” e fala do grupo, nunca de um clube.",
     "n": "80 clubes-temporada de 2022 a 2025 (20 com elenco entre os 5 mais caros, 20 do 6º ao 10º, 40 do 11º para baixo); 2026 fica à parte, como teste",
     "prova": "T02_passagem.csv; classificacao_rodada.csv; T02_numeros_novos.json (testes); T02.md, seção Prova",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "grupos",
      "titulo": "Média de rodadas no G4 por temporada, contando todas as rodadas",
      "unidade": "rodadas",
      "series": [
       {
        "nome": "5 mais caros",
        "valor": "14,6"
       },
       {
        "nome": "6º ao 10º",
        "valor": "9,5"
       },
       {
        "nome": "11º para baixo",
        "valor": "3,2"
       }
      ]
     }
    },
    {
     "id": "T02-2",
     "parte": "T02",
     "bloco": "T",
     "manchete": "Eduardo Baptista teve o piso mais alto entre quem trocou de clube",
     "o_que_vimos": "Nas 3 passagens de 2022 a 2025, a pior teve o time 12 rodadas no G4 em 32 e a melhor, 20 em 38. Mas um desses clubes, o Criciúma, tinha o 8º elenco mais caro, e não é clube sem dinheiro. O segundo piso mais alto é o de Jair Ventura, 5 em 27.",
     "para_o_santa_cruz": "É o nome que sobra para a lista curta de T04, mas pelo piso e não pelo pico: o que ele mostrou foi não afundar em dois clubes diferentes. Na conversa, pedir o valor do elenco de cada ano ao lado — só as duas temporadas do Novorizontino foram com elenco barato, e a repetição “em clube sem dinheiro” não vale para o Criciúma. Disponibilidade e custo ficam para validação externa.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Não trata de nenhuma premissa existente.",
     "confianca": "indício",
     "confianca_motivo": "(a) Correção para múltiplos testes a 5%: não passa — não há teste nenhum nesta conclusão: o T02_testes.csv que o scripts/T02.py grava só traz as comparações de faixa de valor da T02-1, e nenhuma linha dele mede piso de treinador; além disso o nome é o melhor escolhido entre os 28 treinadores de dois clubes ou mais, caso em que a §6.3 ainda exigiria o nulo do garimpo, que não foi rodado. (b) Porta temporal: não passa — nunca foi rodada nesta parte, e tanto o tempo no G4 quanto o ponto por jogo são medidos na mesma janela do desfecho, então não há como mostrar que vêm antes dele. Nenhum dos dois = indício. O “amostra pequena” que o motivo antigo invocava para sustentar “provável” é literalmente a segunda definição de indício no CLAUDE.md, não de provável. O saldo de xG de 0,56 por jogo no recorte Novorizontino fica aqui como descrição, e não como critério, justamente porque a porta temporal não foi rodada. O piso dele é o mais alto nos quatro jeitos de contar: da 10ª rodada em diante são 12 rodadas em 29 contra 2 em 18 do segundo, e incluindo 2026, que fica de fora por estar em curso, o segundo passa a ser Thiago Carpini com 10 rodadas em 32. O valor do elenco de cada passagem saiu do texto de 10 segundos e fica aqui: Novorizontino com o 10º e o 16º elencos mais caros, Criciúma com o 8º, e 1,67 ponto por jogo no recorte Novorizontino. O gráfico ficou só com a amplitude do próprio Eduardo Baptista, a pior contra a melhor passagem, porque o piso da manchete é taxa e não contagem: as três passagens têm totais diferentes (32, 38 e 27 rodadas) e, postas lado a lado em rodadas cruas, as barras não seriam comparáveis entre si. O rótulo com o total não resolve isso e ainda punha número digitado no gráfico, onde o portão não o vê. A comparação com o segundo colocado fica no texto, que traz o denominador de cada um por marcador, e volta ao gráfico quando o scripts/T02.py gravar o percentual de rodadas no G4 por passagem. Vale para as duas barras que ficaram: elas também têm totais diferentes (32 e 38), o que o texto logo acima do gráfico diz. Quem é o segundo colocado muda com o corte, e é outra razão para ele não estar no desenho de um corte só. A manchete diz o que ele TEVE, no passado e em 2022–2025, e não um traço que se repita: o piso mais alto é um lugar num ranking de 28 nomes, medido na mesma janela do desfecho e sem o nulo que a §6.3 pediria, e a própria T02-3 mostra que o tempo no G4 de uma passagem não anuncia o da seguinte. A versão que dizia “é quem menos afunda” afirmava disposição presente, que este dado não paga.",
     "n": "3 passagens, 2 clubes, 108 rodadas (2022–2025); a passagem no Criciúma de 2026 fica à parte — 26 rodadas de temporada em curso, com Vila Nova 0×2 Criciúma faltando na base",
     "prova": "T02_passagem.csv; T02_treinador.csv; T02_numeros_novos.json (numeros); T02.md, seção Prova",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "barras",
      "titulo": "Rodadas no G4 na pior e na melhor passagem de Eduardo Baptista, contando todas as rodadas",
      "unidade": "rodadas",
      "barras": [
       {
        "nome": "Pior passagem",
        "valor": 12
       },
       {
        "nome": "Melhor passagem",
        "valor": 20
       }
      ]
     }
    },
    {
     "id": "T02-3",
     "parte": "T02",
     "bloco": "T",
     "manchete": "O tempo no G4 no clube anterior não anuncia o do clube seguinte",
     "o_que_vimos": "Dos 28 treinadores com dois clubes ou mais, 7 tiveram um ano zerado no G4 e outro quase todo lá. E o ano bom quase não foi melhor no placar, 0,12 ponto por jogo, e em 3 deles foi igual ou pior. Com 28 nomes só uma ligação forte apareceria, e isso não prova que nada se transfere.",
     "para_o_santa_cruz": "Não contratar ninguém pelo melhor ano de G4: o pico não se repete no clube seguinte — e nem no mesmo clube, porque nos 8 casos de treinador que ficou mais de uma temporada no mesmo clube a oscilação é pelo menos tão grande quanto entre clubes. O que sobra para comparar nomes é o ponto por jogo de cada passagem, com o valor do elenco ao lado.",
     "premissa": "m5",
     "premissa_titulo": "Comissão técnica top — investir",
     "premissa_grupo": "Montagem do elenco",
     "premissa_motivo": "Ajusta a m5 (Comissão técnica top — investir): investir na comissão continua valendo, mas a base não oferece jeito de identificar o treinador top pelo tempo no G4 — esse critério não serve para escolher.",
     "confianca": "indício",
     "confianca_motivo": "(a) Correção para múltiplos testes a 5%: não passa — nenhuma das contagens desta conclusão foi testada: o T02_testes.csv que o scripts/T02.py grava só traz as comparações de faixa de valor da T02-1, e nenhuma linha dele mede oscilação de treinador. Os marcadores da frase o script já grava, mas gravar o número não é testá-lo. (b) Porta temporal: não passa, não foi rodada em lugar nenhum da parte. Nenhum dos dois = indício — e, por ser conclusão negativa, a §6.7 manda publicar o poder junto: com 28 nomes, a menor ligação que este desenho enxergaria a 80% é r = 0,51, e a observada do primeiro clube para o clube seguinte é r = 0,11 (p = 0,59). “Contagem completa” não é um terceiro caminho para firme. O achado 1 da auditoria (derrubado, 1/3) não muda o nível: o nulo que embaralha passagens entre clubes e temporadas acha “constância”, mas embaralha justamente o que a T02-1 mostrou mandar no tempo de G4 — permutando dentro do clube-temporada não sobra sinal de transferência a publicar. Os dois cortes, com o número ao lado: a amplitude mediana saiu do texto por valer coisas diferentes conforme o corte (21,7 contando todas as rodadas contra 3,5 da 10ª em diante), enquanto a cauda dos 50 pontos percentuais ou mais sobrevive aos dois (8 e 9); e a oscilação dentro do mesmo clube é 22,4 contra 21,7 entre clubes contando tudo, o que sustenta o “pelo menos tão grande” do uso prático e não o “do mesmo tamanho” da versão antiga. Os 7 que oscilam são Claudinei Oliveira, Enderson Moreira, Guto Ferreira, Jorginho, Léo Condé, Mozart e Vagner Mancini, e o critério do ano cheio é o time no G4 em mais de 8 de cada 10 rodadas — a lista saiu do texto de 10 segundos e fica aqui. Contando só da 10ª rodada em diante são 8 nomes, 0,26 ponto por jogo de diferença e 2 casos iguais ou piores. No gráfico ficaram os dois cortes de quem oscila e mais nada — 7 e 8 dos 28 multiclube, a mesma base nos dois blocos. Os 3 e os 2 que renderam o mesmo ou menos saíram do gráfico porque não são de 28: são de 7 e de 8, e no mesmo eixo pareceriam a mesma conta. Eles ficam no texto, onde o “deles” diz de quem são. Sobre o tamanho do 0,12: ele é a MEDIANA da série dos 7 (−0,28 · −0,06 · 0,00 · +0,12 · +0,16 · +0,36 · +0,52), não uma média nem um ganho típico — é por isso que o texto de 10 segundos diz que o ano bom quase não foi melhor no placar, e não que ele rendeu mais.",
     "n": "28 treinadores com dois clubes ou mais (2022–2025); 2026 fica à parte, como teste",
     "prova": "T02_passagem.csv; T02_numeros_novos.json (correlacao_T02_3); T02.md, seção Prova",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Treinadores que oscilam entre um ano zerado no G4 e um ano com o time quase sempre lá",
      "unidade": "treinadores",
      "cortes": [
       {
        "rotulo": "contando todas as rodadas",
        "series": [
         {
          "nome": "Oscilam",
          "valor": 7
         }
        ]
       },
       {
        "rotulo": "só da 10ª rodada em diante",
        "series": [
         {
          "nome": "Oscilam",
          "valor": 8
         }
        ]
       }
      ]
     }
    }
   ],
   "em_aberto": "O recálculo que a proposta v2 pede ainda não rodou: o scripts/T02.py precisa passar a produzir o ranking de valor por temporada (T02_faixa_valor.csv), os testes pelo scripts/_metodo.py (T02_testes.csv) e as duas contagens em todos os marcadores. Hoje os números estão conferidos e reproduzíveis em T02_numeros_novos.json, mas o script da parte não os grava — e por isso o selo de provável da T02-1 não pode ir à tela. Falta também gravar em arquivo a contagem da 10ª rodada em diante na unidade clube-temporada e os quatro cortes da T02-2 e da T02-3, que só existem na conferência da proposta. A porta temporal não é passável nesta parte: o valor do elenco é instantâneo de temporada e não tem versão por turno, então o saldo de xG e o ponto por jogo entram como descrição, nunca como critério. Duas heranças a acertar fora daqui: o pedido do _cruzar de marcar a T02-1 como negativa morre na reescrita (a metade negativa “não o nome do treinador” saiu da manchete porque nunca foi testada, e a negativa da parte continua sendo a T02-3), e o T04-2 copia de T02 a frase “dos 34 multiclube, 9 variam 50 pontos ou mais”, que no recorte fechado vira 28 e 8 — arrumar T02 sem arrumar T04 deixa a aba com dois números que não existem mais.",
   "feita_em": null,
   "prova_arquivos": "scripts/T02.py"
  },
  {
   "id": "T03",
   "bloco": "T",
   "secao": "Que treinador buscar",
   "pergunta": "Os times do treinador mostram os traços de quem sobe, em clubes diferentes?",
   "status": "validada",
   "titulo": "O perfil de jogo do treinador",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "T03-1",
     "parte": "T03",
     "bloco": "T",
     "manchete": "Só a distância do chute acompanha o treinador na troca de clube",
     "o_que_vimos": "Comparei cada treinador consigo mesmo em dois clubes. Só a distância do chute o acompanha, do mesmo lado do meio da tabela em 6 de cada dez pares, contra quase cinco pelo acaso. O perfil inteiro se repete o dobro com o treinador do que com o clube, mas é o dobro de quase nada.",
     "para_o_santa_cruz": "Na conversa com um treinador, a única coisa do histórico dele que vale perguntar é de onde os times dele chutam: é o único traço que ele leva de um clube para o outro, e é o mesmo que o A14 aponta como característica de quem sobe, e não como consequência do resultado. O resto do “estilo dele” não prevê nada — serve de desempate entre dois nomes parecidos, nunca de critério principal de contratação. E o estudo não separa o que é do treinador do que é do calibre do clube que costuma contratá-lo.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Derruba a premissa que o próprio T03 propunha (na Série B o perfil de jogo seria do clube, e não do treinador): nos pares do mesmo clube com treinadores diferentes a semelhança do jeito de jogar é a METADE da que se vê entre dois clubes do mesmo treinador. A premissa a sugerir em dados/premissas.json é outra, e mais dura: na Série B o jeito de jogar não fica com ninguém de forma estável, nem com o treinador nem com o clube, e a única exceção medida é a distância de onde o time chuta, que acompanha o treinador. A conclusão J02-1 repete a versão velha como coisa sabida e tem de cair junto — é outra parte, e não foi tocada aqui.",
     "confianca": "provável",
     "confianca_motivo": "Provável porque passa em um dos dois critérios da régua e não no outro. (1) Correção para múltiplos testes a 5% por família: passa. Um teste por traço — a proporção das comparações entre clubes do mesmo treinador em que o traço cai do mesmo lado, contra o embaralhamento do rótulo de treinador — dá xg_por_remate q=0,003 · dist_remate q=0,014 · entradas_area q=0,450 · xg q=0,477 · duelo_def q=0,835 · xg_contra q=0,835 · xg_por_remate_contra q=0,835; dois dos sete sobrevivem à correção, a distância do remate e o xG por remate, que medem quase a mesma coisa; e o embaralhamento do rótulo de treinador rejeita o acaso também no conjunto, nas duas janelas. (2) Porta temporal da §6.4 (1º turno prevendo o 2º): não. O T03 nunca a rodou, e o _porta_temporal.md registra que nenhuma das 19 partes a rodou; conta a favor, mas não como aprovação, que a distância do remate é um dos dois componentes do índice do A14 que passam nela — só que ali a unidade é clube-temporada, e não a pergunta do treinador. Um sim e um não: provável. Condição para o selo valer, agora cumprida: os sete q estão publicados em resultados/T03_testes.csv, e são os que este campo cita, arredondados. Os dois cortes desta parte. (a) A janela: scripts/T03.py roda uma passada só, com 2026 dentro, contra a regra da casa, e o achado vale nas duas janelas, ficando maior nas fechadas; a ressalva honesta é que fechar a janela não move todo mundo para o mesmo lado: Claudinei Oliveira fica onde estava (0,29 nas duas janelas) e Eduardo Baptista inverte o sinal, saindo de 0,27 com a temporada em andamento para um valor negativo nas fechadas. Saem do texto o exemplo do Mozart, que nas fechadas passa a ser um dos que mais repetem, e o nome de Roger Silva, que só é multiclube por causa de uma passagem de 2026. (b) As duas leituras do mesmo T03_resumo.json: o texto antigo publicava só a contagem de cauda (“5 acima, o acaso previa 3,4”) e calava a média; o 3,4 estava errado por um fator de 2 (era 34 × 10%, e não o acaso medido), e com o acaso medido as duas leituras dizem a mesma coisa. A regra da fronteira não se aplica aqui: não se comparam faixas, compara-se o treinador consigo mesmo entre clubes. Teto de medida de cada traço, pelo corte par/ímpar: dist_remate 0,54 · entradas_area 0,44 · duelo_def 0,33 · xg_contra 0,32 · xg_por_remate_contra 0,28 · xg_por_remate 0,04 · xg 0,00. E contado de outro jeito — traços do mesmo lado, em vez da forma do perfil inteiro — o achado encolhe: 3 treinadores contra 2,8 esperados. O que saiu do texto na passada de linguagem simples, e fica aqui: 4 dos 28 treinadores que comandaram dois clubes levaram o mesmo jeito de jogar de um para o outro, e o acaso previa 1,26; com a temporada em andamento dentro da conta a leitura é a mesma, 5 de 34 contra 1,69. A medida é curta: a mesma passagem, cortada em jogos pares e ímpares, já concorda consigo mesma em só 3,7 dos 7 traços. A semelhança média do jeito de jogar, que saiu do gráfico nesta passada, é 0,15 entre dois clubes do mesmo treinador contra 0,07 nos 177 pares do mesmo clube com treinadores diferentes — metade, e é por isso que o perfil de jogo não é do clube. Ela saiu do desenho porque é a grandeza que esta conclusão NEGA: 0,15 está muito abaixo de 0,61, o percentil 90 de duas passagens quaisquer, e num eixo com dois pontos só a diferença para 0,07 ocupava metade da largura, afirmando mais do que a parte prova. O gráfico mostra agora o que a manchete afirma, a distância do chute caindo do mesmo lado do meio da tabela, com o acaso na linha tracejada: a permutação do rótulo de treinador dá 4,7 em cada 10 pares pelo acaso contra os 6 medidos (T03_numeros_novos.json, segundo caminho de dist_mesmo_lado: 63/102 pares, p = 0,003), e no conjunto o mesmo embaralhamento dá 0. Esse 4,7 NÃO é chave de T03_numeros.json, então entra no desenho como linha de corte literal, que é o único valor literal que a §8.2 admite, e no texto por extenso, “quase cinco”. Ele tem de estar no texto: 6 em dez lê como regularidade forte sozinho, e ao lado de quase cinco é quase empate — é a diferença entre “pergunte de onde os times dele chutam” e “isto é quase acaso”. Quando o T03.py rodar de novo, o acaso por traço vira marcador e a linha de corte passa a sair de numeros. Terceira passada, sobre a frase de fecho do texto curto. Ela dizia que o perfil inteiro se parece o dobro com o treinador e parava aí, sem o freio que o texto longo carregava (“o sinal é fino”), e afirmava na tela exatamente a grandeza que esta passada tirou do gráfico por afirmar mais do que a parte prova. O freio voltou ao texto visível na forma “mas é o dobro de quase nada”, que é o que 0,15 contra 0,07 dizem com 0,61 ao lado. O espaço para ele saiu da redação da própria terceira frase, que ficou mais seca — “o dobro com o treinador do que com o clube”, no lugar de “entre clubes do mesmo treinador do que no mesmo clube com outro” —, e não da comparação, que é o escopo: o detalhe da redação cede, a ressalva nunca.",
     "n": "28 treinadores em dois clubes ou mais, dentro de 126 passagens de 10 rodadas ou mais (64 treinadores), 2022–2025; 10 deles entram com um único par de clubes, e são 102 os pares entre clubes distintos. Com a temporada em andamento dentro seriam 34 em 151. A base de comparação do acaso são as 126 passagens inteiras, e não só as dos que trabalharam em mais de um clube.",
     "prova": "T03_passagens.csv; T03_resumo.json; T03_numeros_novos.json, chave bh_familia_7",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "barras",
      "titulo": "A distância do chute cai do mesmo lado do meio da tabela, e o acaso é a linha tracejada",
      "unidade": "em cada dez pares",
      "barras": [
       {
        "nome": "Dois clubes do mesmo treinador",
        "valor": 6
       }
      ],
      "linha_de_corte": 4.7
     }
    },
    {
     "id": "T03-2",
     "parte": "T03",
     "bloco": "T",
     "manchete": "Trocar de treinador não muda o jeito de jogar do time",
     "o_que_vimos": "Em 66 trocas de treinador, nenhum dos 7 traços do jeito de jogar puxa o time para um lado só. Cada time anda de 4 a 7,5 posições na tabela, mas a passagem de um treinador só, cortada ao meio, anda o mesmo tanto. É janela curta oscilando, e não a chegada do treinador.",
     "para_o_santa_cruz": "Trocar treinador no meio da temporada não compra um modelo de jogo novo: o placar sobe, de 1,15 para 1,32 ponto por jogo, e sobe em 43 das 66 trocas — mas a mesma conta feita sem troca nenhuma anda na direção oposta, de 1,55 para 1,33 em 75 passagens de um treinador só cortadas ao meio, e as duas terminam no mesmo lugar. Ou seja: quem troca troca no fundo do poço, e o que vem depois é o time voltando ao normal — se for para trocar, troque por gestão e por resultado, não esperando outro jeito de jogar. Esta conclusão pode ser efeito do placar: o xG criado e o xG sofrido mudam com ele, e a base não permite o recorte por estado do jogo.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Nenhuma premissa de dados/premissas.json trata disso, e não cabe sugerir uma nova: o desenho compara o treinador novo com o anterior no mesmo elenco, não com uma contrafactual do mesmo treinador, e não separa o efeito da troca do retorno ao normal.",
     "confianca": "indício",
     "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios da régua. (1) Correção para múltiplos testes a 5% por família: não passa — nas quatro temporadas fechadas, todos os 7 com q = 0,955 (menor p = 0,312, no xG por remate); com a temporada em andamento dentro também não passa nenhum, e lá o menor valor bruto é 0,206. (2) Porta temporal da §6.4: não rodou no T03, e o _porta_temporal.md registra que nenhuma das 19 partes a rodou. Sendo conclusão negativa, ela ainda depende do poder, que ninguém tinha calculado: o desenho só enxerga um movimento comum de 2,4 a 3,5 posições entre os 20 clubes, e quatro dos sete traços são de xG, cuja régua na janela curta de uma passagem fica em 0,16 — muito abaixo do mínimo de 0,40 da casa. O n também não é o que parece: as 66 trocas são 51 clube-temporadas e 31 clubes, com janelas que se sobrepõem, e os 7 IC95 por reamostragem de clube cruzam zero. Os dois cortes. (a) A janela: sem a temporada em andamento são 66 trocas, com ela 73, e os dois dão a MESMA leitura — nenhuma direção comum em nenhum dos sete traços. (b) As duas leituras do mesmo T03_antes_depois.csv: o texto antigo publicava só a mediana com sinal e calava a magnitude por caso; agora as duas aparecem, mas sem a leitura de que o time “muda muito” — o placebo, a mesma passagem do mesmo treinador cortada ao meio, anda o mesmo tanto, então a magnitude é janela curta, e não a chegada do treinador. Quantas trocas sobem contra quantas descem, traço a traço: 35/28 · 27/34 · 34/29 · 30/33 · 32/31 · 36/26 · 31/31. A regra da fronteira não se aplica: é antes-e-depois dentro do mesmo clube e da mesma temporada, e não comparação entre faixas. O que saiu do texto na passada de linguagem simples, e fica aqui: a janela do antes-e-depois é de pelo menos 8 jogos de cada lado, no mesmo clube e na mesma temporada; no traço em que mais trocas concordam são 36 das 66, e nos outros é menos. O gráfico desta conclusão põe os 1,15 e 1,32 ponto por jogo da troca ao lado do placebo, 1,55 e 1,33 em 75 passagens cortadas ao meio: as duas terminam no mesmo lugar. Sobre a forma do gráfico, decidido nesta passada: ele era “dois cortes”, a forma que esta aba usa para mostrar o corte de fronteira, e aqui os dois blocos não eram dois cortes da mesma conta, e sim duas populações — quem trocou e quem não trocou. Quem aprendeu a gramática visual da aba nas outras partes leria aquela forma como “a fragilidade da fronteira foi mostrada”, e ela não foi: como está escrito acima, a regra da fronteira não se aplica a um antes-e-depois dentro do mesmo clube. Agora são quatro barras numa régua só, que sobem do zero e deixam a comparação direta. E o título do gráfico carrega a leitura, porque a manchete fala do jeito de jogar e o desenho é de pontos por jogo: de relance, manchete mais gráfico diziam “o estilo não muda, mas os pontos sobem depois da troca”, que é exatamente a decisão que esta conclusão existe para impedir. Desenhar os sete traços no lugar dos pontos exigiria um marcador por traço, que o T03.py não grava hoje.",
     "n": "66 trocas em 51 clube-temporadas (31 clubes), 2022–2025 — as janelas se sobrepõem, porque o “depois” de uma troca vira o “antes” da seguinte, e 14 clube-temporadas entram com duas ou três trocas. Com a temporada em andamento dentro seriam 73. O placebo são 75 passagens de um treinador só, cortadas ao meio com 8 jogos ou mais de cada lado.",
     "prova": "T03_antes_depois.csv; T03_numeros_novos.json, chave bh_ad",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "barras",
      "titulo": "Depois da troca os pontos sobem, mas sem troca nenhuma eles caem para o mesmo lugar",
      "unidade": "pontos por jogo",
      "barras": [
       {
        "nome": "Antes da troca",
        "valor": 1.15
       },
       {
        "nome": "Depois da troca",
        "valor": 1.32
       },
       {
        "nome": "Antes, sem troca",
        "valor": 1.55
       },
       {
        "nome": "Depois, sem troca",
        "valor": 1.33
       }
      ]
     }
    }
   ],
   "em_aberto": "O item em aberto de verdade é o conjunto de traços: os sete não são “o índice do A14” — o xG não entra em régua nenhuma do índice, o xG sofrido só entra numa régua que o A14 descartou, e dois traços calculáveis jogo a jogo (xG sofrido em casa e duelo defensivo ganho em casa) ficaram de fora mesmo havendo cobertura, com mediana de nove jogos em casa por passagem. Trocar os traços obriga a rodar scripts/T03.py de novo e muda de uma vez todos os números desta parte, então é pedido separado. Continuam por escrever resultados/T03_testes.csv, com os sete q de cada família (já calculados em T03_numeros_novos.json), e resultados/T03.md, que a seção Entrega de cada parte exige; e o antes-e-depois compara o treinador novo com o anterior no mesmo elenco, não com uma contrafactual do mesmo treinador.",
   "feita_em": null,
   "prova_arquivos": "scripts/T03.py"
  },
  {
   "id": "T04",
   "bloco": "T",
   "secao": "Que treinador buscar",
   "pergunta": "Quais treinadores combinam resultado, perfil alinhado e consistência?",
   "status": "validada",
   "titulo": "O treinador ideal: o que a base sustenta",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "T04-1",
     "parte": "T04",
     "bloco": "T",
     "manchete": "O 3º da lista pela pior passagem nunca subiu",
     "o_que_vimos": "Pela pior passagem, a lista de 30 treinadores aponta dois campeões de uma temporada só e, em 3º, Eduardo Baptista, que nunca subiu. Trocando a pior passagem pela média, ele vai de 37,5% a 47,2% do tempo no G4 e perde o lugar. E quem subiu com dois clubes ficou de fora.",
     "para_o_santa_cruz": "Não dá para tirar um nome só desta lista: trocar a pior passagem pela média já muda o terceiro lugar, e o critério que produzia \"um nome só\" é o mesmo que zera todo treinador com quatro passagens ou mais. Eduardo Baptista segue o nome mais regular da base — três temporadas sem afundar, com elencos 10º, 16º e 8º mais caros do ano, ou seja meio de tabela em dinheiro, e não barato —, mas isso tem de ser dito na mesma frase em que se diz que ele parou três vezes em 5º. Para avaliar qualquer candidato, olhe as duas contas juntas e o que ele entregou de fato: dos 30, 14 já terminaram alguma vez no G4, 10 comandaram isso até a última rodada e só 2 fizeram em dois clubes; disponibilidade e custo ficam para validação externa, como o CLAUDE.md manda.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Não confirma nem contradiz premissa de dados/premissas.json. Sugere registrar, junto com o T04-2, que a lista de treinadores do estudo é ordenação do que já aconteceu e muda de nome conforme a conta escolhida — por isso não vira critério de contratação sozinha.",
     "confianca": "indício",
     "confianca_motivo": "(a) Correção para múltiplos testes dentro da família: não. O bloco T não tem tabela de testes — não existe T04_testes.csv, nenhum dos scripts T01 a T04 importa scripts/_metodo.py e o T04.py apenas ordena o T02_passagem.csv pela pior passagem, então não há q nenhum para corrigir. (b) Porta temporal (§6.4): não. Nenhum script do bloco T a roda, e o pct_g4_apos_10 é recorte de rodadas, não a porta; dos sete traços que formam o índice de perfil, só a distância da finalização tem prova de anterioridade em _porta_temporal.md. Zero dos dois critérios: pela régua escrita, indício — e agora há um segundo motivo para não subir daí, porque a própria ordem da lista muda com o critério escolhido. O que saiu do texto de 10 segundos e mora aqui: a ordem da lista depende do critério, e nenhum dos critérios é mais certo que o outro. Pela média das passagens, Enderson Moreira passa à frente com 48,5% em cinco clubes contra 47,2% dele; contando da 10ª rodada em diante ele é o 1º de 22, com 41,4%, porque aí os dois de cima não chegam às 30 rodadas. A pior passagem zera para 21 dos 30 nomes, inclusive para os 9 que comandaram quatro vezes ou mais, e é por isso que Léo Condé (Vitória 2023 e Ceará 2024) e Mozart (Mirassol 2024 e Coritiba 2025), que subiram com dois clubes cada, ficaram de fora. Os dois acima dele na lista são campeões de uma temporada só: Paulo Pezzolano no Cruzeiro 2022 e Fábio Carille no Santos 2024, 89,5% e 89,2% das rodadas no G4, com o 3º e o 1º elenco mais caro do ano e 1 e 1 passagem cada na base — o oposto do caso do Santa Cruz. Na sensibilidade do corte de rodadas (_robustez_19_09.json, subamostras_rodadas), em 20 rodadas a lista vai a 44 nomes e ele cai para o 5º; em 40 e em 60 rodadas ele é o 1º. Nenhuma das contas mexe no que ele entregou: 5º nas três temporadas, duas a um ponto do 4º colocado e uma empatada em pontos com ele, com elencos 10º, 16º e 8º mais caros do ano.",
     "n": "30 treinadores com 30 rodadas ou mais, em passagens de 10 rodadas ou mais e não interinas, nas quatro temporadas fechadas (2022–2025); Eduardo Baptista com 3 passagens, 2 clubes e 108 rodadas. 2026 entra só como teste.",
     "prova": "T02_passagem.csv, colunas pct_g4 e pct_g4_apos_10, recortadas para 2022–2025 pelas colunas em_curso e base_incompleta, que o scripts/T04.py não lê; A01_clube_temporada.csv, para a posição, os pontos e a distância ao 4º de cada temporada; T04_numeros_novos.json, chave numeros, com o de onde e o segundo caminho de cada valor; T04_resumo.json, chave lista_completa, que já traz o piso e a média lado a lado. O índice de perfil do T03 é percentil e fica só aqui, como descrição do clube-temporada nas 7 medidas do T03 — 73,6 na média das três passagens e 56,1 na pior —, nunca como perfil alinhado do treinador. Sensibilidade do corte de rodadas em _robustez_19_09.json, chave subamostras_rodadas, refeita só nas fechadas: em 20 rodadas a lista vai a 44 nomes e ele cai para o 5º; em 40 e em 60 rodadas ele é o 1º.",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "grupos",
      "titulo": "Eduardo Baptista no G4 nas quatro temporadas fechadas",
      "unidade": "% das rodadas",
      "series": [
       {
        "nome": "Pela pior passagem",
        "valor": 37.5
       },
       {
        "nome": "Pela média das passagens",
        "valor": 47.2
       }
      ]
     }
    },
    {
     "id": "T04-2",
     "parte": "T04",
     "bloco": "T",
     "manchete": "Esta base não mostra o histórico do treinador reaparecendo no clube seguinte",
     "o_que_vimos": "Entre os 28 treinadores que passaram por dois clubes ou mais, a diferença típica entre a melhor e a pior passagem dá 21,7 pontos percentuais no G4. O jeito de jogar também não acompanha. A base é pequena demais para fechar a conta: é falta de prova, não prova do contrário.",
     "para_o_santa_cruz": "Não pague pelo currículo de G4 nem pelo modelo de jogo: nenhum dos dois reaparece no clube seguinte, e o estudo também não consegue afirmar que não reapareceriam. E, depois do T04-1, também não vale a regra de escolher pela pior temporada: ela põe na frente quem nunca subiu e deixa de fora os dois que subiram com dois clubes diferentes. O que sobra de prático é usar a lista só para reduzir a conversa e decidir por entrevista, comissão e projeto, que este dado não mede; investir na comissão técnica continua de pé.",
     "premissa": "m5",
     "premissa_titulo": "Comissão técnica top — investir",
     "premissa_grupo": "Montagem do elenco",
     "premissa_motivo": "Ajusta a premissa m5 (\"Comissão técnica top — investir\", dados/premissas.json): investir na comissão continua valendo, mas histórico de G4 e modelo de jogo do treinador não servem de critério de escolha — a base não mostra que se repetem e, do tamanho em que está, não teria como mostrar. Sugere premissa nova: a escolha do treinador sai do estudo e vai para validação externa; nem a média nem a pior temporada do candidato ordenam a lista do mesmo jeito, e nenhuma das duas acerta quem subiu.",
     "confianca": "indício",
     "confianca_motivo": "(a) Correção para múltiplos testes dentro da família: não. Não existe T03_testes.csv nem T04_testes.csv — os onze arquivos de teste de resultados/ são todos dos blocos A e J — e, aplicando o bh() de scripts/_metodo.py aos sete valores de Wilcoxon do antes e depois do T03_resumo.json, todos dão q = 0,669. A perna do T02 é amplitude, que é descrição e não teste, como o próprio T02-1 escreve. (b) Porta temporal (§6.4): não — nenhum script do bloco T a roda, e o pct_g4_apos_10 é recorte de rodadas, não a porta. Zero dos dois: indício, e a frase diz por quê. Uma negativa tripla sem correção, sem anterioridade e sem mínimo detectável não carrega o selo mais forte da casa, ainda mais quando o que foi medido aponta para o lado contrário da frase: a repetição entre clubes deu 0,27 num desenho que só enxergaria um efeito de 0,48, e o pareado do antes e depois só enxergaria 0,33. O que saiu do texto de 10 segundos e mora aqui: 8 dos 28 multiclube variam mais de 50 pontos percentuais — uma passagem quase sempre no G4 e outra quase nunca. O jeito de jogar foi medido em 126 passagens de 64 nomes e em 66 trocas no meio da temporada com pelo menos 8 jogos de cada lado; com a base inteira, 2026 incluído, são 34 multiclube, 16,2 pontos percentuais típicos, 9 acima de 50, 151 passagens, 69 nomes e 73 trocas, e a leitura é a mesma. E 3 dos 7 traços do perfil são medidos com régua curta demais para mostrar repetição ainda que ela existisse — por isso a frase é falta de prova de que o treinador se repete, e não prova de que ele não se repete.",
     "n": "126 passagens de 64 treinadores nas temporadas fechadas, 28 deles em dois clubes ou mais, e 66 trocas no meio da temporada (com 2026: 151 passagens, 69 treinadores, 34 multiclube e 73 trocas).",
     "prova": "T02_passagem.csv, coluna pct_g4, para a amplitude entre a melhor e a pior passagem de cada treinador; T03_passagens.csv e T03_resumo.json, chave nulo_dois_quaisquer, para a repetição do perfil entre clubes; T03_antes_depois.csv, colunas jogos_antes e jogos_depois, para as trocas no meio da temporada; T04_numeros_novos.json, chaves dmin_multi, dmin_antes_depois e conf_tracos: o desenho entre clubes só detecta 0,48 e mediu 0,27, o pareado do antes e depois só detecta 0,33, e 3 dos 7 traços ficam abaixo do piso de 0,40 de confiabilidade.",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Distância entre a melhor e a pior passagem do mesmo treinador",
      "unidade": "pontos percentuais do tempo no G4",
      "cortes": [
       {
        "rotulo": "só as temporadas fechadas",
        "series": [
         {
          "nome": "Diferença típica",
          "valor": 21.7
         }
        ]
       },
       {
        "rotulo": "com a temporada em curso",
        "series": [
         {
          "nome": "Diferença típica",
          "valor": 16.2
         }
        ]
       }
      ]
     }
    }
   ],
   "em_aberto": "Falta o T04.md com a lista de 3 a 5 nomes, pontos fortes, riscos e amostra de cada um — agora nas duas ordens (pior passagem e média) e com a coluna de acessos ao lado do tempo no G4. O perfil ideal descrito em réguas continua sendo o índice do A14, que só se sustenta em duas das quatro temporadas, e o scripts/T04.py não abre arquivo nenhum do A14. O script também não recorta a temporada em curso (não lê em_curso nem base_incompleta) e não grava T04_numeros.json: os valores desta rodada vêm de T04_numeros_novos.json, conferidos por dois caminhos, e o script precisa ser rerrodado para produzi-los. Alguns números do texto continuam escritos à mão por não haver marcador — 48,5% e os 5 clubes de Enderson Moreira, os 21 dos 30 e os 9 com quatro passagens ou mais, os 14, 10 e 2 dos acessos, e as 126 passagens de 64 nomes das temporadas fechadas no T04-2 —, e o 48,5% é decimal, então o portão vai reprovar a regra 1 até ele ganhar marcador. Disponibilidade e custo dos nomes ficam para validação externa.",
   "feita_em": null,
   "prova_arquivos": "scripts/T04.py"
  },
  {
   "id": "J01",
   "bloco": "J",
   "secao": "Quem contratar",
   "pergunta": "Quem tem minutagem alta e regular em cada posição, e quanto é lesão?",
   "status": "validada",
   "titulo": "Base e minutagem: quem joga e por quê",
   "tipo": "base",
   "conclusoes": [
    {
     "id": "J01-1",
     "parte": "J01",
     "bloco": "J",
     "manchete": "O corte único de minutagem passa 27,3% dos goleiros e só 7% dos atacantes",
     "o_que_vimos": "Em 3.160 jogador-temporadas de 2022 a 2025, o corte de 60% dos minutos do time vale igual para todos, mas o goleiro mediano joga 21,7% e o atacante mediano, 16,5%. Quatro temporadas devolvem 90 jogadores de minutagem alta e repetida, e 215 quando o corte é o da própria posição.",
     "para_o_santa_cruz": "O corte de minutagem passa a ser por posição, e J01 tem de fixar qual: com o corte único a busca por atacante começa sem candidatos e a de goleiro começa cheia, e o problema não é o mercado, é a régua. O corte dentro da posição já está calculado — Goleiro 64,7% · Zaga 56,8% · Volante 51,0% · Lateral 46,8% · Meia 42,5% · Atacante 34,2% · Extremo 32,4% — e é ele que J03 a J06 devem usar, lendo o jogador dentro da própria posição e temporada, que é a mesma normalização que o estudo já usa para clube.",
     "premissa": "m2",
     "premissa_titulo": "Muitos minutos por temporada",
     "premissa_grupo": "Montagem do elenco",
     "premissa_motivo": "Ajusta a m2 (“Muitos minutos por temporada”): minutagem alta e repetida continua valendo, mas “alta” se mede dentro da posição — no corte único a premissa exclui o ataque por construção, porque só 8 atacantes em quatro temporadas a cumprem.",
     "confianca": "indício",
     "confianca_motivo": "Dos dois critérios de firme, esta conclusão não cumpre nenhum — por isso indício, e não rebaixamento de impressão. (1) Correção para múltiplos testes a 5% dentro da família: NÃO. A tabela de testes da parte não existe na pasta (existem as de A02, A03, A04, A05, A06, A07, A10, J02, J03, J04 e J08), o scripts/J01.py não importa o scripts/_metodo.py e não há lista de indicadores pré-declarada em lugar nenhum; sem teste não há correção a aplicar. (2) Porta temporal da §6.4: NÃO, e não é calculável nesta parte — a fatia de minutos é por temporada, não por rodada, o mesmo impedimento que a §6.5 reconheceu em 15/09 para share_11 e conc_hhi; por isso o teto de J01 é provável, nunca firme. Nenhum dos dois = indício, e a frase diz por quê: é a contagem da distribuição inteira, coerente e de uso imediato em J03 a J06. O que a sustenta é a base toda, não uma amostra: o vão entre goleiro e atacante aparece nas quatro temporadas uma a uma (conferido em _proposta_destino_v2.json, propostas.J01) e não se desfaz com a temporada em curso dentro da conta — o que muda entre os dois recortes é só o nível do goleiro, porque a temporada curta ainda não trocou de goleiro. Registro a tensão para o dono, sem reabrir nada: a casa grava firme liso para contagem em A01-1, A01-2, A04-2, T01-1, T02-1 e J07-3, e foi por isso que o achado 1 da auditoria caiu 1/3 — mas “firme (descrição)” seria um quarto nível, e a régua tem três. O que saiu do o que vimos nesta passada e fica aqui, sem se perder: com a temporada em curso dentro da conta o vão se mantém (29,2% dos goleiros contra 7,1% dos atacantes, e o que muda é só o nível do goleiro); e no corte único as quatro temporadas fechadas devolvem 8 atacantes e 7 extremos de minutagem alta e repetida contra 16 goleiros e 20 zagueiros — 90 nomes ao todo, contra 215 quando “alta” é medida dentro da posição. O gráfico é de grupos, num corte só, porque esta conclusão não é comparação entre faixas: ela conta a distribuição inteira e não passa pelo corte de fronteira, então não há dois cortes a mostrar. Terceira passada: 90 e 215 voltaram ao o que vimos com o nome do que contam — jogadores de minutagem alta e REPETIDA nas quatro temporadas, não quem passa do corte numa temporada. Os dois pares não se confundem: acima da régua ficam 457 linhas no corte único e 795 no corte por posição; regulares são 90 e 215. A versão curta anterior dizia “a mesma regra devolve 215 nomes no lugar de 90” logo depois de uma frase que só falava do corte de 60%, e assim os dois números liam-se como aprovados no corte, errado por um fator de cinco. Para pagar o conserto saiu “dos minutos” depois de 21,7%, que a frase anterior já fixa.",
     "n": "3.160 jogador-temporadas (2022-2025)",
     "prova": "J01_numeros_novos.json, chave corte_por_posicao — o percentil 75 da fatia de minutos em cada posição, com o n de cada grupo (Extremo 653, Lateral 559, Meia 529, Zaga 485, Atacante 474, Volante 244, Goleiro 216) — e as chaves reg_gk, reg_zag, reg_atk, reg_ext, altos_pos e reg_pos; dados/minutagem_serieb.json (colunas ano, grupo e fatia_pct), recorte 2022-2025. No corte único ficam 457 linhas acima da régua e 90 regulares; no corte por posição, 795 e 215, e os dois pares usam o mesmo sinal (fatia maior ou igual ao corte).",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "grupos",
      "titulo": "Quem passa no corte de minutagem, por posição",
      "unidade": "% dos jogadores",
      "series": [
       {
        "nome": "Goleiro",
        "valor": 27.3
       },
       {
        "nome": "Zaga",
        "valor": 22.5
       },
       {
        "nome": "Extremo",
        "valor": 7.8
       },
       {
        "nome": "Atacante",
        "valor": 7.0
       }
      ]
     }
    },
    {
     "id": "J01-2",
     "parte": "J01",
     "bloco": "J",
     "manchete": "A ficha de lesão não distingue quem jogou pouco de quem jogou muito",
     "o_que_vimos": "Entre 2022 e 2025, 7% dos 1.974 jogador-temporadas de minutagem baixa com ficha no Transfermarkt têm lesão registrada, contra 7,5% dos 348 de alta. Quando há lesão, quem jogou pouco fica 56 dias fora contra 33, em parte porque quem fez 60% dos minutos não ficou meio ano parado.",
     "para_o_santa_cruz": "Diante de um alvo com pouco tempo de jogo, a hipótese padrão continua sendo que ele não era opção do treinador, e a ficha de lesão não desmente isso. Mas não risque o nome por aí: em pouco mais de um quarto das linhas (838 de 3.160) não há ficha nenhuma para consultar, a base só enxerga lesão grande, e quando há lesão em quem jogou pouco ela custa quase o dobro de dias — pergunte ao clube antes de decidir.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Não mexe em premissa existente. Sugere uma nova, no grupo Montagem do elenco: minutagem baixa se lê como escolha técnica até prova em contrário, porque a ficha de lesão não separa os dois grupos — e “não separa” aqui quer dizer que esta base não enxergaria nada abaixo de 12,3% contra 7,5%, não que a lesão não exista.",
     "confianca": "indício",
     "confianca_motivo": "Dos dois critérios de firme, esta conclusão não cumpre nenhum — por isso indício. (1) Correção para múltiplos testes a 5% dentro da família: NÃO. A tabela de testes da parte não existe e nenhum teste foi rodado aqui; além disso o achado é negativo, e a correção corrige achado, não promove ausência. (2) Porta temporal da §6.4: NÃO, e não é calculável (minutagem por temporada, o impedimento reconhecido na §6.5). Nenhum dos dois = indício, e são dois os motivos, não um — o publicado até aqui só citava a cobertura. O primeiro é o alcance do desenho: sobre 1.974 contra 348, a diferença observada é de -0,48 ponto, com erro padrão de 1,52 e margem de -3,5 a +2,5 pontos, e só enxergaria a lesão a partir de 12,3% contra os 7,5% do outro lado, pela lógica da §6.7. O segundo é a cobertura da ponte: 838 das 3.160 linhas ficam sem ficha, 27% — 372 sem id e 466 com nome ambíguo, listados e nunca adivinhados. O nível já estava certo; o motivo é que estava incompleto. O que saiu do o que vimos nesta passada e fica aqui, sem se perder: a diferença observada é de meio ponto e troca de lado conforme a temporada em curso entre ou não na conta (7% contra 7,5% nas quatro fechadas; 6,9% contra 6,7% com 2026 dentro); e a diferença de dias fora (56 contra 33) é em parte da própria conta, porque quem fez 60% dos minutos do time não podia ter ficado meio ano parado — ressalva que voltou para o o que vimos, colada no número, porque muda o que o leitor faz com ele. O gráfico é de barras, num corte só, e de propósito: barra parte do zero, e assim 7% e 7,5% aparecem do tamanho que são, quase iguais, em vez de virarem um vão largo numa régua ajustada aos dois valores. A comparação é entre minutagem baixa e alta na ponte de lesão, não entre faixas da tabela, e por isso não passa pelo corte de fronteira. Terceira passada: o PORQUÊ da ressalva dos dias fora voltou ao o que vimos. “Diferença que em parte é da própria conta”, sozinha, não diz a quem lê qual conta nem por quê; agora o texto visível diz o mecanismo — quem fez 60% dos minutos não ficou meio ano parado — e a ressalva volta a segurar o número, que é o que o para o Santa Cruz usa ao mandar perguntar ao clube. O preço foi o segundo “minutagem” da primeira frase (“348 de alta”, por elipse do “minutagem baixa” anterior); ficaram de pé o recorte, “jogador-temporadas”, “com ficha no Transfermarkt” e “registrada”, que são o escopo, e “em parte”, que é a palavra que segura a afirmação.",
     "n": "1.974 de minutagem baixa e 348 de minutagem alta, com ponte ao Transfermarkt (2022-2025)",
     "prova": "J01_numeros_novos.json, chaves les_alta_base, les_alta_n, les_alta_dias e les_dmin (o cálculo de poder da §6.7 aplicado a proporção, com o h de Cohen); recorte 2022-2025. A ponte de lesão liga dados/serieb_elencos.csv (colunas jogador, ano e id_jogador) a dados/serieb_lesoes.csv (colunas dias_2022 a dias_2025): 1.974 linhas de minutagem baixa e 348 de alta casam, 838 ficam sem ficha. Das 2.322 casadas, 43 casam só por nome e ano, sem o clube, e 5 delas têm ficha de lesão — o docstring do script promete nome, clube e ano, e o código casa só nome e ano.",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "barras",
      "titulo": "Jogador-temporadas com lesão registrada",
      "unidade": "%",
      "barras": [
       {
        "nome": "Minutagem baixa",
        "valor": 7.0
       },
       {
        "nome": "Minutagem alta",
        "valor": 7.5
       }
      ]
     }
    },
    {
     "id": "J01-3",
     "parte": "J01",
     "bloco": "J",
     "manchete": "Time que cai roda o elenco, 45,6 jogadores em média contra 38,4 do meio",
     "o_que_vimos": "Nas quatro temporadas fechadas, os clubes que caíram usaram 45,6 jogadores em média, contra 38,4 do meio; quem subiu não se distingue do meio. Pelo avesso, em quem caiu só 4,3 por temporada passaram de 60% dos minutos, contra 5,8. Sem os times de fronteira o degrau só cresce.",
     "para_o_santa_cruz": "Minutagem se lê contra o elenco do time: 60% dos minutos num clube que usou 45,6 jogadores é bem mais raro do que a mesma fatia num clube que usou 38,4, e é assim que J03 a J06 têm de comparar. Não contrate por isto — quantos jogadores um time usou está na lista fixa do estudo como consequência de como o ano foi, nunca como característica de quem joga. E tire da tela a frase de que minutagem alta em time rebaixado é sinal mais forte: esta contagem não mede qualidade nenhuma, e a ressalva do CLAUDE.md sobre falta de opção continua de pé, esperando o J03.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Não contradiz a ressalva do CLAUDE.md sobre falta de opção — a contagem não a testa, e a versão publicada, que a dava por invertida, sai. Sugere premissa nova ao lado da m2, no grupo Montagem do elenco: a fatia de minutos se lê contra quantos jogadores o time usou naquela temporada.",
     "confianca": "provável",
     "confianca_motivo": "Dos dois critérios de firme, esta conclusão cumpre um — por isso provável, que é o teto desta parte. (1) Correção para múltiplos testes a 5% dentro da família: SIM, e nos dois cortes. A tabela de testes da parte não existe, então o método da casa (scripts/_metodo.py: posto dentro da temporada, t de Welch bilateral e d de Cohen) foi rodado sobre a família completa das quatro comparações desta conclusão — jogadores usados e fatias altas, cada um em Sobe × Meio e Cai × Meio — e as oito células estão em J01_numeros_novos.json, chave rob_j01_3. A perna do Cai passa a 5% nos quatro cruzamentos e, em jogadores usados, fica acima do menor efeito que este desenho conseguiria enxergar nos dois cortes (1,10 e 1,18 contra 0,82 e 0,97); em fatias altas fica abaixo (0,70 e 0,87), o que é mais uma razão para a frase se apoiar em jogadores usados. (2) Porta temporal da §6.4: NÃO, e não é calculável — a §6.5 decidiu em 15/09 que recalcular concentração de minutos só no 1º turno é impossível, porque a minutagem guarda minutos por temporada e serieb_jogos.csv não traz escalação. Um sim e um não = provável. A perna do Sobe saiu do texto: em fatias altas, Sobe × Meio só separa com os times de fronteira na conta (0,0143 com, 0,1138 sem, e 0,1601 na variante em que o posto é calculado sobre os 20 times do ano e só depois filtrado), e pela regra 4 do _metodo_fronteira.md isso é ruído; em jogadores usados, Sobe × Meio não separa em corte nenhum (0,1633 e 0,2237), e é isso que vira a frase de que quem subiu não se distingue do meio — a ausência está afirmada com os dois cortes na mão, não com um. Ressalva que o dono precisa ver e que não muda o selo: a família não foi pré-declarada e a tabela de testes da parte não existe, e é isso que o esforço de reanálise tem de produzir, para o selo ficar de pé sobre a mesma prova que o resto do estudo. A ressalva dos dois cortes voltou para o o que vimos em uma oração, e o detalhe que não cabe lá fica aqui: tirando os 28 clubes-temporada que terminaram na fronteira do acesso ou do rebaixamento, a conta se refaz com 12 que caíram contra 32 do meio e o degrau de quem cai fica maior, não menor — a conclusão existe nos dois cortes, não só num. O gráfico não é de dois cortes porque não dá: esta parte não publica marcador nenhum para as médias sem os times de fronteira, e a única coisa que existe sem eles são as células de teste da chave rob_j01_3, que não são média e não se desenham; enquanto esse par de marcadores não existir, os dois cortes se leem no texto, não no desenho. E o gráfico mostra só 38,4 contra 45,6, que é o par da manchete: a perna do Sobe saiu do gráfico pelo mesmo motivo que saiu do texto, porque numa régua ajustada aos valores ela apareceria como degrau uma diferença que não separa em corte nenhum. Terceira passada, três consertos no texto visível. (a) “Em média” voltou à manchete e ao o que vimos: sem ele, “os clubes que caíram usaram mais jogadores que os do meio” lia-se como regra sem exceção, e o que o dado paga é separação de médias com sobreposição (d +1,10 e +1,18), não clube a clube. (b) O retrato pelo avesso voltou em uma oração — 4,3 por temporada acima de 60% dos minutos em quem caiu contra 5,8 no meio —, que é a única medida publicada da raridade que o para o Santa Cruz manda o leitor usar; ela fica no texto com o “só” que a segura, e o seu tamanho de efeito (-0,70 com fronteira e -0,87 sem) continua ABAIXO do menor efeito detectável deste desenho (0,82 e 0,97), e é por isso que a manchete e o gráfico seguem em jogadores usados, não em fatias altas. (c) Os tamanhos dos grupos (16, 48 e 16) saíram do o que vimos para pagar as duas orações acima — eles continuam no campo n, inteiros e com o corte sem fronteira ao lado. “Não menor” virou “só cresce”, que diz a mesma direção em menos espaço.",
     "n": "80 clubes-temporada (2022-2025): 16 que subiram, 48 do meio e 16 que caíram; sem os times de fronteira, 8, 32 e 12",
     "prova": "J01_numeros_novos.json, chave rob_j01_3: jogadores usados Cai × Meio d +1,10 e q 0,0037 com os times de fronteira, d +1,18 e q 0,0120 sem; Sobe × Meio não separa em corte nenhum (p 0,1633 e 0,2237). Fatias altas Cai × Meio d -0,70 e q 0,0191 com, d -0,87 e q 0,0151 sem; fatias altas Sobe × Meio só separa com os times de fronteira (p 0,0143 contra 0,1138 sem) e sai pela regra 4 do _metodo_fronteira.md. Leitura que a prova fixa: as células sem fronteira só batem com o posto RECALCULADO depois de tirar as 28 linhas de fronteira; calculando sobre os 20 times do ano e filtrando depois, a leitura é a mesma e os quatro valores mudam (usados Cai × Meio d +1,09 e p 0,0034; altos Cai × Meio d -0,88 e p 0,0063; altos Sobe × Meio p 0,1601; usados Sobe × Meio p 0,2117). Menor efeito detectável do desenho: 0,82 em 16 × 48 e 0,97 em 12 × 32. Base: resultados/A01_clube_temporada.csv (coluna faixa e marca de fronteira) e dados/minutagem_serieb.json (colunas ano, time e fatia_pct), com o nome do clube passado pela ponte resultados/T01_ponte_clubes.json.",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "grupos",
      "titulo": "Jogadores usados na temporada",
      "unidade": "jogadores",
      "series": [
       {
        "nome": "Meio",
        "valor": 38.4
       },
       {
        "nome": "Cai",
        "valor": 45.6
       }
      ]
     }
    }
   ],
   "em_aberto": "A ponte com a base de lesões cobre 73% das linhas do recorte 2022-2025: das 3.160, 838 ficam sem ficha — 372 sem id do Transfermarkt e 466 com nome ambíguo (dois ou mais ids para o mesmo nome no mesmo ano), listados e nunca adivinhados. Resolver isso exige o módulo de identidade da §1.1, que não foi construído aqui. E o Wyscout corta o export em 500 linhas por temporada, então quem jogou muito pouco pode faltar na base — temporada sem dado não conta como minutagem baixa. Três dívidas de execução ficam abertas, todas fora deste arquivo: (1) scripts/J01.py continua rodando 2022-2026 e sem a ponte de clube, e não produz os números desta versão — eles vêm de J01_numeros_novos.json (19/09), e quem reexecutar a parte hoje regrava a prova com os valores antigos e entrega a J03-J06 uma base com 2026 dentro e o Athletico-PR 2025 sem faixa; (2) não existem a tabela de testes da parte nem a lista de indicadores pré-declarada, que é o que o esforço de reanálise de J01-3 tem de produzir; (3) o J01_resumo.json ainda está gravado em 2022-2026, e por isso saiu do campo prova das três conclusões até ser regravado no recorte que vale. Fica aberto também um conflito entre partes, que não cabe neste arquivo: a conciliação da v2 (J01-3, J02-3 e A07-2) decide que o dono da contagem de jogadores usados é o J02, que a mede com teste (47 contra 38, medianas), e que o par 45,6 contra 38,4 desta parte sai quando o J02-3 entrar, passando J01 a importá-lo por marcador. Aqui o texto foi aplicado como a v2 o escreveu em propostas.J01; a troca mexe em três arquivos e cabe ao fluxo principal.",
   "feita_em": null,
   "prova_arquivos": "scripts/J01.py"
  },
  {
   "id": "J02",
   "bloco": "J",
   "secao": "Quem contratar",
   "pergunta": "Quem sobe concentra os minutos em menos jogadores e mantém mais a base?",
   "status": "validada",
   "titulo": "Rotação e continuidade do elenco",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "J02-1",
     "parte": "J02",
     "bloco": "J",
     "manchete": "Na Série B, 69,8% dos minutos são de jogador que chegou naquele ano",
     "o_que_vimos": "Em quatro temporadas, 69,8% dos minutos identificáveis foram de jogador que chegou ao clube naquele mesmo ano. É contagem e não comparação: nenhum teste sustenta o número, e o Athletico-PR de 2025 ficou de fora por falta de minutos em comum.",
     "para_o_santa_cruz": "A montagem anual não é ajuste de elenco, é construção de elenco: em um ano, a maior parte do time que entra em campo não estava lá. Isso muda o peso do planejamento de janela e o peso do erro, porque não há base herdada para diluir uma contratação ruim. Vale como retrato do campeonato, não como receita — é assim que a Série B inteira funciona, e não é o que diferencia quem sobe.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere premissa nova no grupo Montagem do elenco: “Na Série B o elenco se refaz todo ano — cerca de sete em cada dez minutos de uma temporada são de jogadores que chegaram naquele ano. Planejar a temporada é construir um elenco, não ajustar o do ano anterior.” Nenhuma das premissas de dados/premissas.json trata de rotatividade anual. E sai daqui a frase que repetia a premissa do T03 como coisa sabida (“explica por que o perfil de jogo do clube não segue o treinador”): o próprio T03 a nega.",
     "confianca": "indício",
     "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios. Correção para múltiplos testes: não há teste aqui — é contagem descritiva do nível geral, e as duas linhas vizinhas de minutos de contratado em Sobe × Meio ficam em “sem diferença clara” nos dois cortes. Porta temporal: não rodou e não roda, porque a minutagem existe por temporada e não por rodada. A cobertura da ponte entre minutagem e elencos vai de 64,6% a praticamente todos os minutos, com mediana de 90,9%; abaixo do piso de cobertura declarado no J02.py o clube-temporada fica fora. n = 79 de 80 clube-temporadas. Saiu do o que vimos e fica aqui: 1 de 80 ficou de fora porque as duas bases não se encontraram em minutos suficientes (Athletico-PR 2025), e o nível geral sem os times de fronteira (69,6%) é o mesmo retrato — está no gráfico, lado a lado.",
     "n": "79 de 80 clube-temporadas, 2022–2025",
     "prova": "J02_resumo.json, chave quadro_por_faixa e o n da base. J02_testes.csv, familia continuidade: min_de_contratado_pct em Sobe × Meio dá q 0,48320 com fronteira e 0,25284 sem, selo “sem diferença clara” nos dois — nenhuma linha de teste sustenta a contagem geral, que não é comparação. J02_numeros_novos.json, chave contr_geral: o de_onde do nível geral (mediana das 79 linhas, conferida por três caminhos — 69,8478 no valor cheio, 68,5516 no agregado por minutos) e do mesmo corte sem os times de fronteira (69,6485). _porta_temporal.md, seção 4, para a medida de elenco não ser partível por turno.",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "barras",
      "titulo": "Minutos de quem chegou naquele mesmo ano",
      "unidade": "% dos minutos",
      "barras": [
       {
        "nome": "Com todos os times",
        "valor": 69.8
       },
       {
        "nome": "Sem os de fronteira",
        "valor": 69.6
       }
      ]
     }
    },
    {
     "id": "J02-2",
     "parte": "J02",
     "bloco": "J",
     "manchete": "Manter a base do ano anterior não aparece como vantagem de quem sobe",
     "o_que_vimos": "Entre os que subiram, quem já estava ficou com 27% dos minutos, contra 32,3% do meio; nos dois cortes a diferença cabe dentro do acaso. Caso a caso não há padrão: entre os 15 que subiram, de 13,9% a 70,1%. Não dá para dizer que a vantagem não existe, só que não apareceu.",
     "para_o_santa_cruz": "O que este número não pode dizer é se manter ajuda ou atrapalha: permanência de elenco depende de como foi o ano anterior, então ela vem contaminada pelo resultado e descreve em vez de orientar. Para 2027 a decisão de manter ou trocar continua aberta e tem de ser tomada jogador a jogador, pelo que cada um entrega — que é a pergunta de J05 e J06. O que dá para dizer é que o Santa Cruz não precisa temer a troca grande: ela é a norma da Série B, inclusive entre os que sobem.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Nenhuma premissa de dados/premissas.json é tocada. Derruba duas premissas internas do estudo: a da própria pergunta do J02 (“quem sobe mantém mais a base”) e a ressalva 2 de J02_indicadores.json, que dava a continuidade como livre da lista de consequência do resultado — pctFicou e novos estão nela, na constante CONSEQUENCIA de ranking_gaps.py, com o motivo escrito no próprio arquivo (“permanência de elenco depende de como foi o ano”).",
     "confianca": "indício",
     "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios. Correção para múltiplos testes: a continuidade não separa quem sobe do meio em corte nenhum, com selo “sem diferença clara” nos dois e o intervalo cruzando o zero nos dois sentidos. Porta temporal: não rodou e não é partível por turno, porque permanência de elenco só existe medida na temporada inteira. E o desenho é pequeno: a menor diferença que ele enxergaria é maior que a maior diferença já observada na família continuidade, então “não separa” aqui não vira “não existe”. A metade afirmativa da manchete antiga (“mantém menos”) não tem teste atrás em corte nenhum e caiu. n = 15 que subiram contra 48 do meio. Saiu do o que vimos e fica aqui: com 15 que subiram contra 48 do meio, e 7 contra 32 sem os times de fronteira, só uma vantagem grande apareceria — os dois cortes estão no gráfico. Saíram também do o que vimos, por espaço, os dois extremos caso a caso dessas 15 subidas: Remo 2025 com 13,9% e Criciúma 2023 com 70,1% — são caudas, e a mediana do grupo é 27%.",
     "n": "15 que subiram contra 48 do meio; sem os times de fronteira, 7 contra 32",
     "prova": "J02_testes.csv, familia continuidade: min_de_quem_ficou_pct em Sobe × Meio, com fronteira 27,017 contra 32,335 (d -0,328, q 0,32213) e sem fronteira 20,277 contra 31,218 (d -0,709, q 0,25284) — o cru e o efeito saem sempre da mesma linha, nunca de cortes trocados. Poder: a menor diferença detectável é d 0,84 com fronteira e 1,20 sem, contra um maior efeito observado de 0,709 na mesma família. Sobe × Trave da mesma medida, e do seu espelho min_de_contratado_pct, é firme só SEM os times de fronteira (20,277 contra 42,207, d -1,369, q 0,04002) e não com eles (d -0,708, q 0,09151); firme só num corte é suspeito e não é publicado, pela regra escrita em _metodo_fronteira.md.",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Minutos de quem já estava no clube",
      "unidade": "% dos minutos",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Sobe",
          "valor": 27.0
         },
         {
          "nome": "Meio",
          "valor": 32.3
         }
        ]
       },
       {
        "rotulo": "sem os times de fronteira",
        "series": [
         {
          "nome": "Sobe",
          "valor": 20.3
         },
         {
          "nome": "Meio",
          "valor": 31.2
         }
        ]
       }
      ]
     }
    },
    {
     "id": "J02-3",
     "parte": "J02",
     "bloco": "J",
     "manchete": "Quem sobe concentra 68,1% dos minutos nos onze mais usados, contra 63,1% do meio",
     "o_que_vimos": "Os onze mais usados de quem sobe ficam com 68,1% dos minutos do time, contra 63,1% do meio da tabela e 60,2% de quem cai. Quem cai usa 47 jogadores na temporada, contra 38 do meio. Já o número de jogadores usados não separa quem sobe do meio (35 contra 38).",
     "para_o_santa_cruz": "Isto descreve, não ensina: quem está ganhando repete a escalação e quem está perdendo roda o elenco, e o rótulo destes números já está decidido — não contrate para isto. O teste que separaria causa de consequência não é possível com o dado que existe, porque a minutagem é por temporada e não por rodada. Como retrato de fim de ano conversa com o J01 (4,3 jogadores de minutagem alta em quem cai contra 6,9 em quem sobe); a alavanca de montagem continua sendo quem se contrata, não quantos minutos os onze vão dividir.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Conversa com m3 (Titulares consolidados, reservas com potencial) na direção, mas não a confirma: a concentração de minutos é consequência do resultado, então não serve de prova de que montar assim faça subir. Nenhuma premissa nova. Par obrigatório com o A14-1, para o leitor não ver a mesma medida promovida numa parte e apagada na outra: a concentração separa e por isso o J02 a publica; ela sai da régua do A14 porque é consequência de ganhar e não é calculável por turno.",
     "confianca": "provável",
     "confianca_motivo": "Provável porque passa em um dos dois critérios. Correção para múltiplos testes: passa, e nos dois cortes — em Sobe × Meio pela fatia dos onze mais usados e pela concentração dos minutos, e em Cai × Meio também pelos atletas usados, pelo núcleo de quem passa dos 300 minutos e pela base mantida. Porta temporal: não passa e não pode passar, porque não há escalação por rodada para partir a medida em turnos. Ser consequência do resultado não mexe no nível — mexe no que a conclusão pode afirmar, e isso está no uso prático. n = 15 que subiram e 16 rebaixados contra 48 do meio. Saiu do o que vimos e fica aqui: a base mantida também separa quem cai do meio (24,1% contra 32,3%, e 22,3% contra 31,2% sem os times de fronteira), e os atletas usados de quem cai se sustentam nos dois cortes (47,5 contra 38,5).",
     "n": "15 que subiram e 16 rebaixados contra 48 do meio; sem os times de fronteira, 7 e 12 contra 32",
     "prova": "J02_testes.csv, familia concentracao: em Sobe × Meio, share_11 (q 0,00280 com fronteira e 0,01745 sem) e conc_hhi (0,00479 e 0,01745) são os dois únicos indicadores da parte com poder suficiente no corte cheio, e atletas usados não separa em corte nenhum (0,21439 e 0,28266), que é a última frase do texto. Em Cai × Meio são firmes nos dois cortes share_11 (0,01134 e 0,00116), atletas_usados (0,00268 e 0,00312), nucleo_300 (0,00268 e 0,00244) e min_de_quem_ficou_pct (0,03038 e 0,04028). Discordam entre os cortes, e por isso ficam fora do texto, nucleo_300 em Sobe × Meio — firme só com fronteira (d 0,672, q 0,02321) e não sem (d 0,656, q 0,12929) — e jogadores_que_ficaram_pct em Cai × Meio, também firme só com fronteira (d -0,579, q 0,04988) e não sem (d -0,57, q 0,12204). A inversão que tirou o superlativo da manchete: sem os times de fronteira quem menos mantém passa a ser o Sobe (20,277) e não o Cai (22,301), e o espelho vira junto (com fronteira, minutos de contratado dá Cai 75,911 contra Sobe 72,983; sem, Sobe 79,723 contra Cai 77,699). _porta_temporal.md, seção 4: a régua I não é partível por turno, e o número circular (valor da temporada inteira contra os pontos do 2º turno) dá parcial +0,202, p 0,0720. J01.json, chave numeros, para cai_altos e sobe_altos.",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Minutos nos onze mais usados",
      "unidade": "% dos minutos",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Sobe",
          "valor": 68.1
         },
         {
          "nome": "Meio",
          "valor": 63.1
         },
         {
          "nome": "Cai",
          "valor": 60.2
         }
        ]
       },
       {
        "rotulo": "sem os times de fronteira",
        "series": [
         {
          "nome": "Sobe",
          "valor": 68.8
         },
         {
          "nome": "Meio",
          "valor": 62.5
         },
         {
          "nome": "Cai",
          "valor": 57.5
         }
        ]
       }
      ]
     }
    }
   ],
   "em_aberto": "Os sete indicadores da parte são consequência do resultado — a régua I e também a continuidade, que é pctFicou e novos na constante CONSEQUENCIA de ranking_gaps.py: a parte descreve o campeonato e nenhuma das três conclusões vira critério de contratação. Faltam duas rodadas de manutenção: a ponte de clube do T01 é aplicada só do lado dos elencos, então Athletico-PR 2025 some invisível no `if not js: continue` do J02.py em vez de sair por cobertura (mesmos números, descarte visível, e fora_por_cobertura deixaria de ser vazio); e a cobertura da ponte, declarada como subamostra, tem só um piso duro e nunca foi rodada com um piso mais alto. Falta ainda o resultados/J02.md que a seção Entrega de cada parte exige.",
   "feita_em": null,
   "prova_arquivos": "scripts/J02.py"
  },
  {
   "id": "J03",
   "bloco": "J",
   "secao": "Quem contratar",
   "pergunta": "Como os titulares de quem sobe se comparam aos do meio, no técnico?",
   "status": "validada",
   "titulo": "O titular de quem sobe: técnico",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "J03-1",
     "parte": "J03",
     "bloco": "J",
     "manchete": "Por setor, nenhum número técnico separa o titular de quem sobe do meio",
     "o_que_vimos": "Comparamos 723 titulares com 900 minutos ou mais em 12 números técnicos por setor. Nenhum dos 84 números separa os dois grupos nos dois recortes. Só contra a mesma posição exata sobra o lateral, um passe a mais em cada cem, e nada diz se vem antes do acesso ou depois.",
     "para_o_santa_cruz": "O perfil técnico individual não é o que separa quem subiu: em nenhum dos 7 setores apareceu vantagem grande, e o único candidato que resiste aos dois recortes — e só quando a conta é refeita contra jogadores da mesma posição exata — é o lateral acertar cerca de um passe a mais em cada cem, pequeno demais para virar filtro. J05 e J06 podem exigir minutagem alta e regular e o encaixe no modelo de jogo, mas não devem pedir superioridade técnica geral como requisito de acesso. O que este desenho não autoriza é a frase contrária: ele não veria diferença menor do que a que consegue enxergar, então “não separa” não vira “não existe”.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere premissa nova: na Série B a diferença de quem sobe é coletiva, não individual — e o filtro individual que sobra de pé é a minutagem alta e regular da premissa m2, não um nível técnico superior. Não contradiz a m3 (titulares consolidados): rodagem comprovada continua valendo; o que cai é a ideia de que o titular de quem sobe tem números técnicos melhores.",
     "confianca": "indício",
     "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios da §6. (a) Benjamini-Hochberg a 5% dentro da família (3 famílias de 4 indicadores em cada um dos 7 setores): das 84 linhas de J03_testes.csv só duas têm selo firme — Goleiro/“Duelos aéreos ganhos, %”, q 0,00121, e Meia/Faltas/90, q 0,00726. No recorte sem os times de fronteira (replicação registrada em _robustez_19_09.md, que reproduz o corte “com” em 84 linhas x 10 campos sem uma divergência) os firmes são três e são OUTROS, todos do gol: Duelos defensivos ganhos, Interceções ajust. à posse e Faltas/90, q 0,01525 nos três. Interseção zero — por isso o marcador “firmes = 2”, que é a contagem de um corte só, saiu do texto. Pela normalização declarada em J03_indicadores.json (“dentro da mesma posição e temporada”; o código agrupa por (ano, setor) na linha 97 de scripts/J03.py, enquanto o comentário da linha 93 diz posição) a interseção é 1: Lateral/“Passes certos, %”, q 0,04737 com os times de fronteira e 0,04857 sem, marginal nos dois — a mesma linha, normalizada por setor como o script publica, é “pode ser sorte” (q 0,18945). Em qualquer leitura a conclusão negativa não tem nenhum teste aprovado atrás dela. (b) Porta temporal da §6.4: não rodou (grep -ci 'turno' em scripts/J03.py = 0) e não roda nesta base — dados/serieb_tecnico.csv é fechado por temporada, sem jogo a jogo. Zero de dois = indício. Poder, que é o motivo que a frase tem de dizer: contando clube-temporada, a unidade da casa (§4.4 e §6.6), o menor efeito detectável vai de 0,82 a 1 no recorte cheio e de 1,14 a 1,46 sem os times de fronteira — “não separa” aqui é “este desenho não conseguiria ver” (§6.7). Etapa 8, o gráfico e o que saiu do texto: esta conclusão fica SEM gráfico, pelo mesmo motivo da A04-1, que também é negativa e também é indício. O único par de marcadores que sustentaria figura é o do lateral em “Passes certos, %” — 78,9 contra 77,8 com todos os times e 79,5 contra 78,1 sem os times de fronteira (lat_s, lat_m, lat_s_sem, lat_m_sem) —, e ele é justamente a exceção que esta conclusão diz não valer: só vira achado na normalização contra a mesma posição exata; na normalização que o script publica, por setor (linha 97 de scripts/J03.py), a mesma linha é “pode ser sorte”, q 0,18945. Desenhá-lo num dois_cortes daria o contrário do que a conclusão diz: desenhaDoisCortes (static/estudo_serieb_grafico.js) monta a escala só com os dados, mn/mx mais 35% de folga, então 1,1 ponto ocuparia mais de um terço da largura nos dois cortes e o leitor veria vantagem grande e estável exatamente onde o “para o Santa Cruz” diz “pequeno demais para virar filtro”. Os quatro valores continuam publicados em numeros e conferidos pela regra 1. Do texto vieram para cá o poder — o mínimo detectável acima —, que é por que o achado é fraco de propósito. Voltaram para o texto visível, dentro da régua de 280 caracteres, o filtro de amostra (900 minutos ou mais, que é o que a palavra “titular” quer dizer aqui) e o limite de leitura causal (nada diz se o número vem antes do acesso ou depois dele, porque a porta temporal não roda). Os n do corte sem fronteira — 456 titulares, 91 contra 365 — continuam publicados no campo n. TERCEIRA PASSADA da etapa 8, correção posterior ao segundo cético, e é a manchete que ela conserta. O encurtamento tinha deixado “Procuramos o número técnico que separa o titular de quem sobe e não achamos”: trocou o sujeito, que no HEAD era o TITULAR, pelo NÚMERO TÉCNICO, e jogou fora o escopo “posição por posição” que a manchete antiga carregava. Sem escopo sobrava um negativo sem recorte, e assim enunciado ele é desmentido pelo marcador que esta própria parte publica: firmes_dois_cortes = 1 — Lateral/“Passes certos, %”, q 0,04737 com os times de fronteira e 0,04857 sem, abaixo de 0,05 nos DOIS cortes pela normalização declarada em J03_indicadores.json (“dentro da mesma POSIÇÃO e TEMPORADA”). Existe, sim, um número técnico que separa nos dois recortes; ele é marginal e some quando a conta é feita por setor. A manchete volta, por isso, presa à normalização em que a negativa é verdadeira — “Por setor, nenhum número técnico separa o titular de quem sobe do meio”, 13 palavras, uma oração, sem dois-pontos e sem travessão. Por setor é como scripts/J03.py agrupa (linha 97) e como J03_testes.csv publica, e nessa normalização a mesma linha do lateral é “pode ser sorte”, q 0,18945, com interseção zero entre os dois cortes. O escopo tinha de voltar à manchete, e não bastava estar na linha seguinte, porque a manchete é o que viaja sozinho para o _registro.md e para a lista de partes: J05 e J06 leem o título antes do corpo, e o título brigava com o marcador acima e com a própria frase seguinte do o_que_vimos (“Só contra a mesma posição exata sobra o lateral”). O que a manchete continua sem caber dizer, e por isso fica dito aqui: no corte cheio, por setor, duas linhas têm selo firme — Goleiro/“Duelos aéreos ganhos, %”, q 0,00121, e Meia/Faltas/90, q 0,00726 —, nenhuma delas se reproduz sem os times de fronteira, e é essa não reprodução que o “nos dois recortes” do o_que_vimos carrega, uma linha abaixo do título. O o_que_vimos não foi tocado: ele já está em 268 dos 280 caracteres da régua e já carrega os três escopos que não podem sair — “por setor”, “dos 84 números” e “nos dois recortes” —, além do limite causal no fim. O poder continua aqui e não no texto visível, como manda a etapa 8.3.",
     "n": "723 titulares — 179 de quem sobe contra 544 do meio — em 7 setores, 2022–2025; sem os times colados na linha de acesso, 456 titulares (91 contra 365)",
     "prova": "J03_testes.csv; J03_resumo.json; J03_numeros_novos.json; _robustez_19_09.md; _metodo_fronteira.md",
     "status": "validada",
     "negativa": true,
     "grafico": null
    },
    {
     "id": "J03-2",
     "parte": "J03",
     "bloco": "J",
     "manchete": "O duelo defensivo separa no time e o estudo não o acha numa posição",
     "o_que_vimos": "No time, quem sobe ganha 0,98 ponto percentual a mais de duelo que o meio. No volante a diferença é maior, 59,87% contra 58,06%, e ainda assim o estudo não tem tamanho para confirmá-la. No gol, e só sem os times de fronteira, o goleiro de quem sobe ganha menos.",
     "para_o_santa_cruz": "Não transforme duelo defensivo em requisito de contratação por posição: a vantagem que aparece é do time, cerca de um ponto percentual por jogo, e nenhuma posição isolada mostra vantagem grande o bastante para virar filtro. Isso não prova que a vantagem venha de treino ou de organização — nada disso foi medido; prova só que ela não está localizada num contratado que J06 possa apontar. E o teste que pergunta se o duelo vem antes do resultado responde que não: o duelo do 1º turno não antecipa os pontos do 2º depois de descontar como o time já vinha pontuando.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Não trata de nenhuma premissa de dados/premissas.json.",
     "confianca": "indício",
     "confianca_motivo": "Indício porque, no nível que esta parte mede — o titular —, não passa em nenhum dos dois critérios. (a) Benjamini-Hochberg a 5%: nenhuma das 7 linhas de “Duelos defensivos ganhos, %” de J03_testes.csv passa, e os menores q são Extremo 0,16753 e Volante 0,16864, os dois no selo “pode ser sorte”. No recorte sem os times de fronteira só o gol passa (q 0,01525), com o sinal INVERTIDO, sobre uma mediana degenerada (0,0 contra 50,0) e sem poder — pela regra 4 de _metodo_fronteira.md isso é suspeito, não promovido. A única perna que passa nos dois cortes é a do TIME, e ela é do A06, não do J03: A06_testes.csv, duelos_def_pct SM, q 0,02556 com fronteira (16x48) e q 6e-05 sem (8x32), este último com poder suficiente — o corte calado FAVORECE a perna do time. (b) Porta temporal da §6.4: aqui ela rodou e REPROVOU para esse mesmo indicador — ρ +0,121 (p 0,2858) e parcial +0,092 (p 0,4160), _porta_temporal.md §6. Zero de dois no nível do jogador, que é o nível desta conclusão; a perna do time é importada e carrega o “provável” que pertence à A06-1. Saiu da prosa o “cerca de dois pontos percentuais”, que era a quantidade do corte reduzido (1,79 ponto) colada ao número do corte cheio; o número de tela continua sendo o do recorte cheio, como manda _metodo_fronteira.md. Etapa 8, o gráfico e o que saiu do texto: o gráfico desta conclusão é de grupos, “Duelo defensivo ganho · o time (medido na A06), o volante e a zaga”, na mesma régua e no corte cheio, porque é ele que mostra o que ESTA conclusão mediu — o nulo posição por posição, com os pares Sobe/Meio praticamente colados no volante (59,87 contra 58,06) e na zaga (67,06 contra 66,67), e com a diferença do time pequena ao lado do degrau entre posições. O dois_cortes que estava aqui antes desenhava SÓ a perna do time, e essa perna não é do J03: 60,77 contra 59,78 com todos os times e 61,7 contra 59,9 sem os times de fronteira saem de A06_testes.csv, duelos_def_pct SM, cortes com e sem fronteira. Dar a figura inteira à perna importada fazia o leitor atribuir ao J03, que está em indício, um achado do A06 que é “provável” — e a escala automática do dois_cortes (mn/mx mais 35% de folga) ainda transformava 0,99 e 1,8 ponto em vantagem grande e crescente. Por isso o título nomeia a origem. O preço da escolha, dito aqui: a unidade de observação difere dentro do mesmo desenho — o ponto do time é clube-temporada (16 contra 48), os das posições são jogador-temporada —, e os quatro valores do corte sem fronteira do time continuam publicados em numeros (dd_time_s_sem, dd_time_m_sem), conferidos pela regra 1, só que agora citados aqui e não desenhados. O “ao contrário” do gol voltou para o o_que_vimos COM o corte que o condiciona e com a direção (sem os times de fronteira o goleiro de quem sobe ganha MENOS), porque sem essas duas travas a frase virava motivo para desclassificar goleiro por duelo defensivo — exatamente o que a regra 4 de _metodo_fronteira.md proíbe, já que o achado é q 0,01525 sobre mediana degenerada (0,0 contra 50,0) e sem poder. Ele está publicado inteiro na J03-3, que é a conclusão do gol. Voltou também para a manchete o “não numa posição”, que é a metade acionável que amarra o achado ao J06, e o verbo medido “aparece na conta do time”, porque “é do time” atribuía o fenômeno ao coletivo, e o “para o Santa Cruz” diz o contrário: nada de treino ou organização foi medido. CORREÇÃO da etapa 8, posterior à conferência do cético: o gráfico desta conclusão passou a ser SÓ das posições — “Duelo defensivo ganho por posição · volante e zaga, nenhuma diferença firme”, com as quatro séries dd_vol_s, dd_vol_m, dd_zag_s e dd_zag_m —, e as duas séries do time saíram do desenho. Com isso a descrição escrita acima, “os pares Sobe/Meio praticamente colados no volante” e “a diferença do time pequena ao lado do degrau entre posições”, está ERRADA e fica substituída por esta: a geometria do renderizador a desmente. desenhaGrupos (static/estudo_serieb_grafico.js, linhas 96-104) monta a escala só com os dados — mn/mx mais 35% de folga — e desenha a barra a partir de mn, não do zero; com as seis séries as barras saíam em 38,3% e 31,8% da largura (time), 32,4% e 20,6% (volante) e 79,4% e 76,8% (zaga), de modo que o par do volante era o que MAIS abria, 11,8 pontos de largura contra 6,5 do time, e a barra Sobe do volante ficava 57% mais comprida que a Meio contra 20% no time. Era o contrário do que a conclusão afirma, e sem selo atrás: Volante/“Duelos defensivos ganhos, %” tem q 0,16864, selo “pode ser sorte”, 22 contra 59, enquanto a única perna selada é a do TIME, que é do A06 (A06_testes.csv, duelos_def_pct SM, q 0,02556 com fronteira e 6e-05 sem) — e o renderizador não sabe desenhar selo, então o leitor via só o degrau cru. É o mesmo defeito que esta parte reconheceu ao NEGAR gráfico à J03-1, e ele tinha sido cometido aqui. Tirar as duas séries do time mata de uma vez o degrau falso e a mistura de unidades dentro do mesmo eixo — o ponto do time é clube-temporada (16 contra 48) e os das posições são jogador-temporada (22 contra 59 no volante, 32 contra 96 na zaga) —, e agora todas as pernas desenhadas são nulas, sem selo que o desenho possa esconder. A perna do time continua citada no o_que_vimos e publicada em numeros (dd_time_s, dd_time_m, dd_time_s_sem, dd_time_m_sem), conferida pela regra 1: ela é do A06 e é lá que deve ser desenhada. Voltou também ao texto visível a cláusula que trava a leitura errada, “nem no volante, que é a maior e não se distingue da conta do time”, que o encurtamento tinha jogado fora deixando só o “para o Santa Cruz” embaixo de uma figura que dizia o contrário; sem ela o leitor de J06 sairia apontando o volante por duelo defensivo, a ação que o “para o Santa Cruz” proíbe em letras maiúsculas. O que este conserto NÃO resolve, e fica registrado para o dono: a escala continua automática e é fixada pela zaga, então mesmo só com as posições o par do volante ocupa 11,8 pontos de largura contra 2,6 da zaga — o desenho mostra o volante como a maior das diferenças, que é o que a frase visível agora diz, mas dá a 1,81 ponto percentual sem selo mais espaço do que ele merece. Fechar isso exige eixo a partir do zero ou marca de selo no renderizador, que é mudança de static/estudo_serieb_grafico.js, fora desta etapa. CORREÇÃO DE 20/09, a pedido do dono, e ela muda a leitura: o texto dizia que “posição por posição não sobra nada”, o que é a armadilha de “não separa” sem poder que o catálogo do CLAUDE.md lista. O volante tem a MAIOR diferença bruta da parte — 59,87% contra 58,06%, 1,81 ponto, contra os 0,98 do time — e passa no p bruto (0,04216). O que o derruba é a correção para múltiplos testes (q 0,16864, selo “pode ser sorte”) e o poder: com 22 contra 59 jogadores o desenho só enxergaria d de 0,71 para cima, e o observado é 0,535. O time detecta menos diferença porque o d divide pela dispersão, e entre 64 clube-temporadas ela é muito menor que entre 81 jogadores. Some-se que a conta do time usa TODOS os duelos de TODOS os jogadores, e a conta por posição só os titulares: o coletivo inclui gente que o recorte por posição não vê.",
     "n": "no time, 16 temporadas de quem sobe contra 48 do meio (8 contra 32 sem os times colados na linha); no jogador, 723 titulares em 7 setores (456 sem esses times)",
     "prova": "J03_testes.csv; A06_testes.csv; _porta_temporal.md; _robustez_19_09.md; J03_numeros_novos.json",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "grupos",
      "titulo": "Duelo defensivo ganho por posição",
      "unidade": "% dos duelos, entre os titulares",
      "series": [
       {
        "nome": "Sobe · volante",
        "valor": 59.87
       },
       {
        "nome": "Meio · volante",
        "valor": 58.06
       },
       {
        "nome": "Sobe · zaga",
        "valor": 67.065
       },
       {
        "nome": "Meio · zaga",
        "valor": 66.67
       }
      ]
     }
    },
    {
     "id": "J03-3",
     "parte": "J03",
     "bloco": "J",
     "manchete": "O goleiro de quem sobe ganha a mesma bola alta que o do meio",
     "o_que_vimos": "Em porcentagem o goleiro de quem sobe aparece com 97,9% de bola alta ganha contra 87,9% do meio. Em bola ganha os dois empatam, 14,6 contra 14,5 por temporada. A diferença inteira é perder 0,5 contra 2 bolas altas no ano.",
     "para_o_santa_cruz": "Este estudo não dá motivo técnico para pagar mais pelo goleiro: a única medida que apontava para lá é uma porcentagem sobre pouquíssimas bolas, ela some no recorte de controle e o mesmo recorte mostra o goleiro de quem sobe cortando menos bola. Não é o contrário — não estamos dizendo para economizar no gol; estamos dizendo que o J03 não mediu o que um goleiro faz: dos 12 números que medimos no gol, 7 são zero para quase todo goleiro. Antes de J05 fechar o perfil do gol, faltam testar defesas, gol sofrido contra o esperado, jogo sem sofrer e bola alta em número, que a base tem em dados/serieb_tecnico.csv e esta parte não usou.",
     "premissa": "m4",
     "premissa_titulo": "Goleiro top — investir",
     "premissa_grupo": "Montagem do elenco",
     "premissa_motivo": "Toca a premissa m4, “Goleiro top — investir”. Não a contradiz: retira o único apoio medido que o J03 dava a ela e a devolve ao estado de premissa do dono, sem prova a favor nem contra. Tem de conversar com a A04-1, que mede o MESMO duelo aéreo no nível do time e fecha com “altura e duelo aéreo não entram como requisito de acesso”: hoje as duas partes publicam instruções opostas sobre a mesma coluna do Wyscout e J05/J06 recebem as duas. Com a inversão a costura fica simples — o duelo aéreo não é requisito de acesso em posição nenhuma, inclusive no gol.",
     "confianca": "indício",
     "confianca_motivo": "Indício: zero de dois critérios. (a) Benjamini-Hochberg a 5% dentro da família: passa com folga no recorte cheio — J03_testes.csv, Goleiro/“Duelos aéreos ganhos, %”, q 0,00121 na família de 4, e 0,0252 mesmo pondo os 84 testes numa família só —, mas NÃO se reproduz sem os times de fronteira: 8 contra 32, q 0,09629, selo “sem diferença clara”, intervalo por clube cruzando o zero ([-0,06; 1,52]) e mínimo detectável 1,14 contra um efeito de 0,679, ou seja, poder insuficiente. Pelo item 3 de _metodo_fronteira.md, e pelo CLAUDE.md, o que só aparece COM esses times é ruído, então (a) não se sustenta. (b) Porta temporal da §6.4: não rodou e não roda nesta base, porque dados/serieb_tecnico.csv é fechado por temporada. E há o outro lado, que o nível tem de refletir: no recorte sem fronteira os três firmes de toda a tabela são do gol e dois apontam contra quem sobe — Interceções ajust. à posse d -1,348, q 0,01525, o único firme com poder suficiente desse corte, e Duelos defensivos ganhos d -0,906, este sobre mediana degenerada. Pela regra 4 do mesmo arquivo, firme num corte só é suspeito e não promovido: vale como indício, e a frase diz de que corte saiu, publicando o valor do corte cheio (1,7 contra 2,1) ao lado. O achado do meia em faltas saiu do texto porque cai no mesmo teste — q 0,00726 no cheio e 0,22264 sem os times de fronteira. Etapa 8, o gráfico e o que saiu do texto: o gráfico desta conclusão é o de barras “Bola alta do goleiro por temporada · o selo cai no corte de controle”, por marcador (gk_ganhos_s, gk_ganhos_m, gk_perd_s, gk_perd_m) — ganhas 14,6 contra 14,5 e perdidas 0,5 contra 2 —, porque é ele que mostra a manchete: a porcentagem alta é o resultado de um denominador minúsculo, não de um goleiro melhor. As barras se chamam “Sobe · ganha”, “Meio · ganha”, “Sobe · perde” e “Meio · perde” porque corDe() pinta pelo nome da série e põe as duas de Sobe em azul e as duas de Meio em laranja: a cor codifica a faixa, não o par ganha/perde, e o ponto separa os dois pares para o olho. NÃO há gráfico dois_cortes aqui, e isso é uma exceção consciente à §8.2 do PLANO.md, que manda dois_cortes sempre que a conclusão depender do corte de fronteira — esta depende, e é a que mais depende da parte. O motivo da exceção: o dois_cortes desenharia 97,9 contra 87,9 ao lado de 97,9 contra 88,6, isto é uma vantagem grande e ESTÁVEL nos dois cortes, exatamente onde a conclusão diz que não há nenhuma; o que morre no corte sem fronteira é o selo (q 0,00121 vira 0,09629, intervalo por clube cruzando o zero), não o número, e o renderizador não sabe desenhar selo. Quem obedecesse à letra da regra produziria aqui o mesmo defeito que ela existe para evitar. A escolha precisa do aval do dono; até lá a fragilidade do corte está dita em dois lugares visíveis, no título do gráfico e no “para o Santa Cruz”, e não só neste tooltip. Essa ressalva do corte continua escrita no “para o Santa Cruz”, que é texto visível. Saiu também do texto a terceira frase, sobre a interceção: no corte sem os times de fronteira o goleiro de quem sobe faz 1,4 por jogo contra 2,1 do meio, e com todos os times a conta já ia na mesma direção, 1,7 contra 2,1 — é o firme do outro lado descrito acima, e continua no “para o Santa Cruz”.",
     "n": "16 goleiros de quem sobe contra 48 do meio no recorte cheio; 8 contra 32 sem os times colados na linha de acesso",
     "prova": "J03_testes.csv; J03_resumo.json; _robustez_19_09.md; _metodo_fronteira.md; J03_numeros_novos.json",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "barras",
      "titulo": "Bola alta do goleiro por temporada · o selo cai no corte de controle",
      "unidade": "bolas",
      "barras": [
       {
        "nome": "Sobe · ganha",
        "valor": 14.6
       },
       {
        "nome": "Meio · ganha",
        "valor": 14.5
       },
       {
        "nome": "Sobe · perde",
        "valor": 0.5
       },
       {
        "nome": "Meio · perde",
        "valor": 2.0
       }
      ]
     }
    }
   ],
   "em_aberto": "Dois indicadores foram declarados com nome que não existe na base e a emenda está datada em J03_indicadores.json: “Dribles bem sucedidos, %” virou “Dribles com sucesso, %” (mesma métrica) e “Perdas de bola/90” NÃO existe — foi substituído por “Acções atacantes com sucesso/90”, o que troca um indicador de erro por um de acerto. Não há medida de perda de bola nesta base. Falta o rerun que o próprio J03 nunca fez: acrescentar a coluna de fronteira e a opção de normalizar por posição, rodar os quatro cruzamentos e regravar J03_testes.csv com ic95 e poder. Enquanto ele não acontece, os números do corte sem fronteira citados no texto (456 titulares, 91 contra 365, 78,9/77,8 e 79,5/78,1 do lateral, 61,7/59,9 do time, 97,9/88,6 e 1,4/2,1/1,7 do goleiro) continuam escritos à mão, porque não existe marcador para eles em J03_numeros_novos.json nem em nenhuma saída de scripts/J03.py — estão registrados em _robustez_19_09.md e em _auditoria_18_09.json. Falta dado, também, para o selo algum dia subir: serieb_tecnico.csv é fechado por temporada, e sem export do Wyscout de jogador por turno (o Portal Ranking teria?) a porta temporal da §6.4 não roda em NENHUMA conclusão do J03 — o teto do bloco fica em “provável” para sempre.",
   "feita_em": null,
   "prova_arquivos": "scripts/J03.py"
  },
  {
   "id": "J04",
   "bloco": "J",
   "secao": "Quem contratar",
   "pergunta": "Em que posições os titulares de quem sobe se diferenciam fisicamente?",
   "status": "validada",
   "titulo": "O titular de quem sobe: físico, 2022 a 2025",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "J04-1",
     "parte": "J04",
     "bloco": "J",
     "manchete": "Não achamos medida de corrida que separe o titular de quem sobe",
     "o_que_vimos": "Comparei 697 titulares de 2022 a 2025 em 17 medidas de corrida, nas 6 posições de linha. Nenhuma das 204 comparações entre quem sobe e o meio sobrevive aos dois cortes. Não achar diferença não é achar que são iguais: com tão poucos por posição, só uma vantagem grande apareceria.",
     "para_o_santa_cruz": "Requisito físico não é filtro de acesso: montar o elenco pela corrida não aproxima o clube do G4. O físico entra em J05 como exigência da posição — lateral tem de correr como lateral — e nunca como sinal de quem sobe; é a segunda vez que isto aparece, porque A07-1 já dizia o mesmo no clube. O que este desenho não autoriza é a frase contrária: ele não veria uma vantagem menor do que a que consegue enxergar, então quem quiser cravar “o físico não importa” precisa de mais titulares por posição, não deste estudo.",
     "premissa": "m1",
     "premissa_titulo": "Time físico",
     "premissa_grupo": "Montagem do elenco",
     "premissa_motivo": "Ajusta m1 (Time físico) sem derrubá-la: a intensidade continua valendo como exigência da posição e como régua para comparar candidatos, mas não é critério de acesso. O ajuste vai com a ressalva de tamanho — este desenho só enxergaria uma vantagem grande —, e por isso entra como indício, não como fato assentado.",
     "confianca": "indício",
     "confianca_motivo": "(a) Correção para múltiplos testes a 5% dentro da família: NÃO passa. Dos 204 testes Sobe × Meio da subamostra `todos` em J04_testes.csv, 5 passam no BH (3 na zaga, 2 no volante) e ZERO passam nos dois cortes de fronteira — a coluna passou_bh_nos_dois_cortes é False nas 850 linhas do arquivo. E esses 5 só existem porque a família foi partida por setor: pela §6.3 literal (família = pilar × comparação), que é o que vale onde diverge, são 0 de 204, e num BH único sobre os 204 também 0. (b) Porta temporal da §6.4: NÃO rodou e não roda — physical_match tem zero linha em 2022, 2023 e 2024, sobra 2025 sozinha (20 clube-temporadas, 4 acessos) e 7 dos 17 indicadores não existem jogo a jogo em temporada nenhuma. Zero de dois = indício. É a mesma conta que o espelho técnico J03-1 já fez, e J04-1 é literalmente a mesma conclusão no físico. O “provável” publicado até 19/09 não veio de nenhum dos dois critérios: veio de um teto declarado antes de rodar (J04_indicadores.json, chave porta_temporal) — e teto é limite máximo, não piso. ESCOPO DO ARGUMENTO DE PODER (corrigido em 19/09): o desenho enxerga a partir de d 0,63 a 1,14, conforme a posição e o corte. A frase de poder vale nos 204 testes do recorte cheio, onde os 199 que não passaram mediram todos um efeito menor que o mínimo da sua própria posição; ela era lida como global e não é. Refeita sobre os 554 testes Sobe × Meio que não passaram nas três subamostras, existe 1 exceção (Zaga, metros por minuto COM a bola, sem os times de fronteira e sem as linhas de identidade marcada, |d| 0,986 contra um mínimo de 0,95) e o maior |d| ali é 0,986, não o 0,69 que a frase antiga citava. Uma exceção em 554 é o esperado por acaso e é o mesmo achado da zaga de que trata J04-2, então a leitura não vira do avesso — mas o escopo tinha de ser dito. TEXTO ENXUGADO EM 20/09 (etapa 8): para caber na régua de 280 caracteres, saíram do que vimos os exemplos crus e a conta de tamanho, e ficam registrados aqui. O volante de quem subiu corre 10.031 metros por jogo contra 10.034 do meio, e a ponta dá 12,0 sprints por jogo contra 11,8 — esse par do volante é o do corte COM todos os times. Com 8 a 28 titulares de quem sobe em cada posição, conforme o corte, só uma diferença do tamanho da que aparece na zaga (8.509 contra 8.908 metros por jogo) teria chance de aparecer — é por isso que “não achamos” aqui não é “é igual”. ESTA CONCLUSÃO FICA SEM GRÁFICO (corrigido em 20/09): ela depende inteiramente do corte de fronteira, e a §8.2 do PLANO.md pede dois_cortes nesse caso, mas o par do corte sem fronteira não existe em J04_numeros.json — no volante ele é 10.115,69 contra 9.990,61 metros por jogo (J04_testes.csv: todos, Volante, SM, sem, distance_p90; d +0,225, q 0,59), com o sinal invertido em relação ao empate do corte cheio. Um gráfico de um corte só mostrava o corte em que o volante empata e escondia aquele em que ele aparece à frente, que é exatamente a leitura que esta conclusão existe para negar; e a escala da forma `grupos` desenhava 3 metros em 10.031 (d −0,10, q 0,74) como meia tela. Volta a ter gráfico no dia em que o script emitir o par do corte sem fronteira. ESCOPO DEVOLVIDO EM 20/09 (3ª passada da etapa 8): o encurtamento tinha trocado “nas 6 posições de linha” por “nas 6 posições”. As seis são Zaga, Lateral, Volante, Meia, Extremo e Atacante (coluna setor de J04_testes.csv) — goleiro nunca entrou no desenho, e sem a palavra “linha” o para_o_santa_cruz, que fala de montar o elenco pela corrida, se estendia a uma posição que este estudo não testou. O “de linha” voltou ao que vimos, e “recortes” virou “cortes” para pagar os nove caracteres dentro da régua de 280.",
     "n": "697 titulares com físico, de 907 no recorte 2022–2025; de 8 a 28 de quem sobe em cada posição, conforme o corte",
     "prova": "J04.md; J04_testes.csv; J04_resumo.json (nao_separa_nao_e_nao_existe); _robustez_19_09.json",
     "status": "validada",
     "negativa": true,
     "grafico": null
    },
    {
     "id": "J04-2",
     "parte": "J04",
     "bloco": "J",
     "manchete": "Cada um dos dois sinais físicos que sobraram existe num recorte só",
     "o_que_vimos": "O volante de quem sobe alcança 27,9 km/h de pico contra 27,5 do meio, e só com os times colados na linha do acesso na conta. Na zaga o sinal é o contrário: aparece justamente quando esses times saem. Nenhum dos dois resiste à troca de recorte.",
     "para_o_santa_cruz": "Nenhum dos dois vira requisito de contratação: não compre volante por velocidade de pico achando que é isso que leva ao acesso, e não leia “zagueiro que corre menos” como virtude. O zagueiro de quem CAI também corre menos que o do meio, nos dois recortes (8.736 contra 8.890 metros por jogo com todos os times, 8.769 contra 8.908 sem os colados na linha): correr menos na zaga marca as duas pontas da tabela, não o acesso. As duas observações vão para J05 como contexto de posição, nunca como filtro de perfil.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Nenhuma premissa própria. Encosta em m1 (Time físico) por tabela: os dois únicos candidatos a sinal físico individual não sobrevivem à troca de recorte, o que reforça o ajuste que J04-1 faz em m1.",
     "confianca": "indício",
     "confianca_motivo": "(a) Correção para múltiplos testes a 5% dentro da família: cada um passa em um corte só, e em cortes opostos. A velocidade máxima do volante passa COM a fronteira (21 contra 50, q 0,023) e some sem ela (d +0,20, q 0,55) — “só COM” é a definição de ruído do CLAUDE.md e o item 3 do _metodo_fronteira.md: descartar. O volume da zaga passa SEM a fronteira (13 contra 54, d -0,85, q 0,034) e some com ela (q 0,26) — “só SEM” é o item 4 da regra corrigida: suspeito, vale no máximo como indício, e a frase tem de dizer que depende do corte. Pela §6.3 literal nenhum dos dois passa em corte nenhum (0 de 204). (b) Porta temporal da §6.4: não roda em J04, por falta de físico por jogo em 2022–2024. Zero de dois = indício, que é o piso da régua: o nível não tem para onde cair, e por isso o que muda aqui é o texto, não o selo. AS DUAS CONFERÊNCIAS, NOS DOIS ACHADOS (corrigido em 19/09): no volante o texto já fazia a conta — cobertura derruba (d +0,15, q 0,71) e identidade sustenta (d +0,66, q 0,013) —, e na zaga ela faltava. Sem as linhas de identidade marcada o achado da zaga NÃO some: fica mais forte, d −0,876 contra os -0,85 do corte base, q 0,053 (a um fio do BH), 11 contra 51. Quem o derruba é a cobertura: sem os clubes com menos de 80% dos minutos rastreados o zagueiro de quem sobe vai de 8.509 a 8.839 metros por jogo e a diferença para o meio cai de cerca de 400 para cerca de 80 metros (d −0,636, q 0,27, 9 contra 43). Uma derruba e a outra sustenta: as conferências discordam e nenhuma decide, que é a mesma leitura do volante. E cai a frase “distance_p90 e m_per_min são a mesma medida, é um achado de volume, não dois”: são TRÊS indicadores no mesmo corte. distance_p90 e m_per_min são de fato a mesma medida (rho 1,000 nos titulares com físico), mas m_per_min_tip — metros por minuto COM a bola — é outra normalização (rho 0,87 com distance_p90 dentro da zaga), é o mais forte dos três (114,05 contra 122,28 metros por minuto de posse, d −0,936 no corte base) e é o único teste das 850 linhas do arquivo que, fora do corte base, mede um efeito maior que o mínimo do seu próprio desenho (|d| 0,986 contra 0,95, poder_suficiente = True, na subamostra sem identidade marcada). O selo continua indício — a regra da fronteira já trava tudo aí —, mas o texto para de sugerir que a robustez desmontou a zaga por dois caminhos quando só um a desmonta. TEXTO ENXUGADO EM 20/09 (etapa 8): os valores crus saíram do que vimos para caber em 280 caracteres e ficam aqui, nenhum perdido. Volante, velocidade de pico: 27,9 contra 27,5 km/h com a fronteira e 27,8 contra 27,6 sem ela; sem os clubes de cobertura baixa, 27,6 contra 27,5; sem as linhas de identidade marcada, 27,9 contra 27,4. Zaga, metros por jogo: 8.747 contra 8.890 com a fronteira e 8.509 contra 8.908 sem ela; 8.839 contra 8.918 sem os clubes de cobertura baixa e 8.509 contra 8.898 sem as linhas de identidade marcada. Os dois cortes da zaga são o gráfico desta conclusão, que é onde a fragilidade fica visível sem depender do texto.",
     "n": "volante: 21 contra 50 (quem sobe contra o meio); zaga: 13 contra 54 — 11 contra 51 sem as linhas de identidade marcada e 9 contra 43 sem os clubes de cobertura baixa",
     "prova": "J04_testes.csv; J04_resumo.json (achados_sobe_x_meio); _metodo_fronteira.md; _robustez_19_09.json",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Zagueiro, distância por jogo",
      "unidade": "metros",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Sobe",
          "valor": 8747
         },
         {
          "nome": "Meio",
          "valor": 8890
         }
        ]
       },
       {
        "rotulo": "sem os times de fronteira",
        "series": [
         {
          "nome": "Sobe",
          "valor": 8509
         },
         {
          "nome": "Meio",
          "valor": 8908
         }
        ]
       }
      ]
     }
    },
    {
     "id": "J04-3",
     "parte": "J04",
     "bloco": "J",
     "manchete": "O que o titular correu no primeiro turno se repete no segundo",
     "o_que_vimos": "Em 2025, a única temporada com dado jogo a jogo, quem mais corria no primeiro turno seguiu entre os que mais correm no segundo; na velocidade de pico repete menos, mas repete. É repetição dentro da mesma temporada, o teste mais fácil: compara candidatos, não aponta acesso.",
     "para_o_santa_cruz": "O dado físico é o requisito mais seguro de conferir num alvo: ele se repete, então o que o jogador correu não é ruído de medição e serve para comparar candidatos. Isso vale para J05 como exigência da posição — e não como aposta de acesso, que é justamente o que J04-1 e J04-2 negam. Onde a régua é mais frouxa é na velocidade de pico: ela repete menos, e um alvo escolhido só por PSV-99 é aposta mais arriscada do que um escolhido por volume de corrida.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere uma premissa nova: o físico é o pilar que o clube compra com mais previsibilidade, porque é o que mais se repete no jogador. Nasce como indício e só fecha com a repetição de um ano para o outro dentro desta base — hoje ela existe só fora da parte (ESPECIFICACAO.md §4.3, mediana 0,853 em 614 pares).",
     "confianca": "indício",
     "confianca_motivo": "(a) Correção para múltiplos testes a 5% dentro da família: não passa porque não se aplica — isto não é teste de separação entre faixas, é a repetição de uma medida dentro do mesmo jogador. (b) Porta temporal da §6.4: não roda, pela mesma falta de físico por jogo em 2022–2024; o que rodou no lugar foi a repetição do 1º para o 2º turno dentro de 2025, que mostra medida estável, não medida que vem antes do resultado. Zero de dois = indício, e a frase diz por quê. Coerente e com uso prático, que é o que a régua exige do indício: n = 180 titulares, só jogos de 60 minutos ou mais, rho de Spearman de +0,87 a +0,93 nos nove indicadores por 90 min e +0,66 no PSV-99, todos com IC95 longe do zero (J04_resumo.json, chave porta_temporal). ESCOPO (corrigido em 19/09): saiu a frase “a medida mais estável que este estudo produziu até aqui”. Ela comparava repetição dentro da mesma temporada com a repetição de ano para ano das outras partes, que é teste mais duro — a manchete nova diz de que repetição se trata. A varredura de robustez não achou caso nesta conclusão, e o motivo está publicado: o lado ruim da regra dos 60 minutos já aparece (no PSV-99 ela reordena, rho 0,674 a 0,753, contra 0,936 a 0,990 nos indicadores por 90 min) e a própria conclusão publica o seu indicador mais fraco. TEXTO ENXUGADO EM 20/09 (etapa 8): saíram do que vimos a janela do cálculo e a comparação de dificuldade, e ficam aqui. A conta compara as 19 primeiras rodadas de 2025 com as 19 últimas, contando só os jogos de 60 minutos ou mais, nos nove indicadores por 90 minutos e no PSV-99. É repetição dentro da mesma temporada, que é o teste mais fácil: de um ano para o outro, medida fora desta parte, ela cai e continua alta. E a ressalva que saiu da manchete continua valendo no uso prático: a medida se repetir não diz quem sobe. RESSALVA DEVOLVIDA EM 20/09 (3ª passada da etapa 8): o encurtamento tinha deixado “menos na velocidade de pico”, que se lê como exceção — nela NÃO se repetiria. O dado não paga isso: em J04_resumo.json, porta_temporal.por_indicador.psv99 traz rho 0,661, IC95 0,57 a 0,74, n 180 e se_repete verdadeiro, repetição menor que a dos nove indicadores por 90 min (0,869 a 0,933) e claramente existente, que é o que o +0,66 publicado acima já dizia. A frase voltou a “repete menos, mas repete”, e com isso para de contradizer o para_o_santa_cruz, que manda usar o PSV-99 com mais cautela, não descartá-lo. Esta conclusão fica SEM GRÁFICO: os números que sobraram são coeficientes de repetição, que chegam com sinal na frente e o renderizador leria como zero, e a parte não emite o valor do 1º e do 2º turno que a forma `turno` pede.",
     "n": "180 titulares em 2025, só jogos de 60 minutos ou mais",
     "prova": "J04_resumo.json (porta_temporal); J04_resumo.json (sensibilidade_60_minutos); ESPECIFICACAO.md §4.3",
     "status": "validada",
     "negativa": false,
     "grafico": null
    }
   ],
   "em_aberto": "A porta temporal não roda: sem físico por jogo em 2022–2024 não há como dizer se o físico vem antes do resultado ou é consequência dele, e o buraco é do SkillCorner, não da cópia — só coleta resolve. A pergunta que decidiria: o Portal Ranking tem físico por jogo dessas três temporadas no skillcorner.db, ou o buraco é da própria coleta do fornecedor? Fica pendente também a unidade do BH: o cálculo rodou com a família partida por setor (pré-declarado, como em J03), e pela §6.3 da especificação, que vale onde diverge, zero dos 204 testes passam — é ela que decide se J04 tem 5 achados ou nenhum, e precisa ser resolvida antes de J05. Consequência para fora da parte: com J04-1 em indício e J03-1 também em indício, J05 recebe os dois pilares — técnico e físico — como resultado negativo fraco, não como fato assentado. E o que decidiria a zaga de J04-2 é prova de clube antes de 2025: 1.871 das 2.982 linhas (63%) não têm nenhuma, porque physical_match só existe de 2025 em diante e é o rótulo de clube que define Sobe, Meio ou Cai.",
   "feita_em": null,
   "prova_arquivos": "scripts/J04_base.py + scripts/J04_identidade.py + scripts/J04.py + scripts/_metodo.py"
  },
  {
   "id": "J05",
   "bloco": "J",
   "secao": "Quem contratar",
   "pergunta": "Quais 4 a 6 métricas definem o jogador ideal em cada posição?",
   "status": "validada",
   "titulo": "Perfil ideal por posição, 2022 a 2025",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "J05-1",
     "parte": "J05",
     "bloco": "J",
     "manchete": "O perfil por posição descreve quem subiu e não promete quem vai subir",
     "o_que_vimos": "Rodamos 74 comparações entre o titular de quem subiu e o do meio, nas 7 posições, e nenhuma se sustentou. A ficha que sobra tem de 4 a 6 números por posição e só diz como esse titular era.",
     "para_o_santa_cruz": "A ficha de cada posição vai para J06 como descrição, com três notas separadas — física, de duelo e de estilo —, que a especificação proíbe somar num número só. Ela serve para descartar quem está longe do que o titular de quem subiu era, nunca para prometer acesso a quem está perto. Das 39 métricas da ficha curta, 32 têm piso e 7 entram sem piso nenhum, porque quem subiu não estava acima da mediana da liga naquele número — e inventar exigência ali seria escrever número que o dado não tem.",
     "premissa": "p20",
     "premissa_titulo": "Índice físico",
     "premissa_grupo": "Físico",
     "premissa_motivo": "Contradiz. A p20 monta um índice geral pela média dos grupos; a §8.2 proíbe somar as notas num número único, porque as coberturas são diferentes e a soma esconde justamente o que custou mais caro para descobrir — que o físico viaja com o jogador e o estilo técnico não. J05_perfil.csv tem uma linha por indicador e nenhuma coluna de nota somada.",
     "confianca": "indício",
     "confianca_motivo": "(a) Correção para múltiplos testes a 5%, com a família da §6.3 (bloco × comparação × corte, sem partir por setor — a correção que a conferência de 19/09 pediu a J03 e J04): dos 74 testes Sobe × Meio no corte com fronteira, 1 passa no BH e 0 passam nos dois cortes; em Sobe × Cai são 0 de 54. (b) Porta temporal: NÃO roda. O técnico do Wyscout é agregado por temporada e o físico por jogo tem zero linha em 2022–2024, os mesmos motivos de J03 e J04 — por isso o teto declarado antes de rodar já era indício. (c) Poder por desenho: o menor d detectável a 80% vai de 0,58 a 1,19 e o maior efeito físico observado em Sobe × Meio é 0,72; “não separa” aqui quer dizer “este desenho não conseguiria ver”. (d) Os dois cortes de fronteira, os dois relatados: sem os times de fronteira mudam de lado ou de selo: Tempo até atingir o sprint (s) no Lateral (SC, d 0,20 contra -0,04); Passes certos, % no Meia (SC, d -0,01 contra 0,06); Duelos aéreos ganhos, % no Volante (SC, d 0,13 contra -0,09); Dribles com sucesso, % no Zaga (SC, d -0,25 contra 0,09); Dribles com sucesso, % no Atacante (SM, d -0,06 contra 0,15); Duelos defensivos ganhos, % no Atacante (SM, d -0,03 contra 0,01); Passes progressivos/90 no Atacante (SM, d 0,00 contra -0,03); Tempo para girar 90 graus (s) no Atacante (SM, d 0,12 contra -0,17); Arrancadas explosivas até o sprint por 90 min no Extremo (SM, d 0,24 contra -0,10); Tempo até a alta velocidade depois de mudar de direção (s) no Extremo (SM, d 0,19 contra -0,27); Dribles com sucesso, % no Goleiro (SM, d -0,20 contra 0,02); Duelos aéreos ganhos, % no Goleiro (SM, d 1,06 contra 0,68); Duelos aéreos ganhos, % no Lateral (SM, d -0,21 contra 0,05); Duelos defensivos ganhos, % no Lateral (SM, d -0,11 contra 0,26); Arrancadas explosivas até o sprint por 90 min no Lateral (SM, d 0,06 contra -0,04); Duelos aéreos ganhos, % no Meia (SM, d -0,26 contra 0,03); Toques na área/90 no Meia (SM, d 0,12 contra -0,02); Sprints por 90 min no Meia (SM, d 0,01 contra -0,06); Dribles com sucesso, % no Volante (SM, d 0,12 contra -0,28); Duelos aéreos ganhos, % no Volante (SM, d 0,07 contra -0,20); Dribles com sucesso, % no Zaga (SM, d -0,11 contra 0,21). (e) O único teste que cruza a régua é a bola alta do goleiro (q 0,006 com fronteira, 0,337 sem), que J03-3 já descartou: é porcentagem sobre um punhado de duelos, e o piso dela sai em 100%, que é o teto da escala. (f) Confiabilidade: o percentil técnico do Wyscout é agregado de temporada, sem split-half medido nesta unidade; o físico do SkillCorner tem ρ 0,72–0,90 de um ano para o outro (§4.3), e é por isso que a nota física pesa mais que a de estilo. (g) Placar: nenhum indicador da lista está na lista branca de resultado da §3. (h) O gráfico desta conclusão tem duas barras, e as duas contam a MESMA família: 74 comparações Sobe × Meio rodadas no corte com os times de fronteira e 0 que passam nos dois cortes. O degrau do meio saiu de propósito: 1 passa no BH, mas esse contador é só das 42 linhas não físicas, e pô-lo entre duas barras de escopo SM inteiro compararia coisas diferentes — bateria hoje por coincidência, porque 0 teste físico passou, e subnotificaria em silêncio numa rodada em que algum passasse. “Não se sustentou”, no que vimos, é exatamente isso — não passar no BH a 5% nos dois cortes —, e o tamanho de efeito de cada linha fica em J05_testes.csv. (i) A §8.2 pede a forma dois_cortes sempre que a conclusão depende do corte de fronteira, e esta depende. Ela não foi construída porque J05_numeros.json não tem contador de quantos passam no BH no corte SEM fronteira: os que existem são bh_tec_sm e bh_fis_sm, do corte com, e dois_cortes_sm, que já é o cruzamento dos dois. A exceção fica registrada aqui, e a alínea (d) continua relatando as duas leituras.",
     "n": "907 titulares com dado técnico e 697 com dado físico, 2022 a 2025; 256 linhas de teste nos dois cortes",
     "prova": "J05.md; J05_testes.csv; J05_perfil.csv; J05_resumo.json",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "barras",
      "titulo": "Comparações do titular que sobrevivem",
      "unidade": "comparações",
      "barras": [
       {
        "nome": "Comparações rodadas",
        "valor": 74
       },
       {
        "nome": "Passam nos dois cortes",
        "valor": 0
       }
      ]
     }
    },
    {
     "id": "J05-2",
     "parte": "J05",
     "bloco": "J",
     "manchete": "Metade do perfil físico que o app já usa não sobrevive à correção",
     "o_que_vimos": "Dos 18 números do perfil físico por setor que a tela mostra hoje, 9 passam na conta que corrige os muitos testes. Na zaga e no lateral não passa nenhum dos 4. E esse perfil compara quem sobe com quem cai, nunca com o meio.",
     "para_o_santa_cruz": "O perfil físico por setor que a tela mostra hoje descreve quem subiu contra quem caiu, e não pode virar filtro de acesso. Na zaga e no lateral ele descansa em 4 números que a correção derruba, então ali a ficha entra com ressalva escrita e o peso da nota física cai. Nas outras posições ele continua servindo para descartar quem está longe do padrão de corrida da posição, que é o que o dado físico sabe fazer.",
     "premissa": "m1",
     "premissa_titulo": "Time físico",
     "premissa_grupo": "Montagem do elenco",
     "premissa_motivo": "Ajusta. A intensidade continua critério de escolha dentro da posição, mas não é sinal de acesso: não separa quem sobe do meio e, nesta base de titulares, também não separa quem sobe de quem cai.",
     "confianca": "indício",
     "confianca_motivo": "(a) A conta é do próprio app, relida: em etapa_13.criterio_por_setor o critério de entrada é `p_clube < 0,05` — o p cru do teste corrigido por clube da §4.4 —, e dos 18 indicadores escolhidos só 9 têm `bh_clube` verdadeiro em sobecai_corrigido_por_clube (zaga 0 de 1, lateral 0 de 3, meio 3 de 6, ataque 6 de 8; os q_clube de cada um estão em J05_resumo.json). (b) Rodando os MESMOS indicadores na base de titulares de 2022–2025: Sobe × Cai dá 0 de 18 no BH e Sobe × Meio dá 0 de 32; o maior efeito observado em Sobe × Cai é 0,67, abaixo do menor d detectável deste desenho (0,71 a 1,19 nas linhas de Sobe × Cai). Isto NÃO é replicação do teste do app: ele compara 56 contra 75 atletas rastreados por setor, e aqui a unidade é o titular, 1 ou 2 por clube. (c) Os dois cortes de fronteira, os dois relatados: sem os times de fronteira mudam de lado ou de selo: Tempo até atingir o sprint (s) no Lateral (SC, d 0,20 contra -0,04); Passes certos, % no Meia (SC, d -0,01 contra 0,06); Duelos aéreos ganhos, % no Volante (SC, d 0,13 contra -0,09); Dribles com sucesso, % no Zaga (SC, d -0,25 contra 0,09); Dribles com sucesso, % no Atacante (SM, d -0,06 contra 0,15); Duelos defensivos ganhos, % no Atacante (SM, d -0,03 contra 0,01); Passes progressivos/90 no Atacante (SM, d 0,00 contra -0,03); Tempo para girar 90 graus (s) no Atacante (SM, d 0,12 contra -0,17); Arrancadas explosivas até o sprint por 90 min no Extremo (SM, d 0,24 contra -0,10); Tempo até a alta velocidade depois de mudar de direção (s) no Extremo (SM, d 0,19 contra -0,27); Dribles com sucesso, % no Goleiro (SM, d -0,20 contra 0,02); Duelos aéreos ganhos, % no Goleiro (SM, d 1,06 contra 0,68); Duelos aéreos ganhos, % no Lateral (SM, d -0,21 contra 0,05); Duelos defensivos ganhos, % no Lateral (SM, d -0,11 contra 0,26); Arrancadas explosivas até o sprint por 90 min no Lateral (SM, d 0,06 contra -0,04); Duelos aéreos ganhos, % no Meia (SM, d -0,26 contra 0,03); Toques na área/90 no Meia (SM, d 0,12 contra -0,02); Sprints por 90 min no Meia (SM, d 0,01 contra -0,06); Dribles com sucesso, % no Volante (SM, d 0,12 contra -0,28); Duelos aéreos ganhos, % no Volante (SM, d 0,07 contra -0,20); Dribles com sucesso, % no Zaga (SM, d -0,11 contra 0,21). (d) Porta temporal: não roda, mesmo motivo de J04. (e) O corte de fronteira derrubou 20 testes por falta de n, e eles saíram dos DOIS lados para que a tabela comparasse a mesma coisa nos dois cortes. (f) “Passar na conta que corrige os muitos testes”, no que vimos e no gráfico, é o critério da alínea (a) e nada além dele: ter `bh_clube` verdadeiro, isto é passar na correção para múltiplos testes a 5% dentro da família da §6.3. Não quer dizer que o número seja falso, e sim que este desenho não o separa do acaso depois de contar quantos testes foram feitos. O gráfico não parte por setor, e a razão é de leitura: os quatro setores têm denominadores diferentes (zaga 1, lateral 3, meio 6, ataque 8), o renderizador não tem barra agrupada, e quatro barras só com o numerador fariam ataque 6 parecer o dobro de meio 3 quando é 6 de 8 contra 3 de 6. As duas barras publicadas dividem o mesmo denominador — 18 indicadores escolhidos, 9 que passam —, e os quatro pares por setor ficam escritos na alínea (a) acima e em J05_resumo.json.",
     "n": "18 indicadores do perfil do app sobre 138 testes de sobe × cai por setor; 32 testes físicos Sobe × Meio e 18 Sobe × Cai nesta parte",
     "prova": "J05.md; J05_resumo.json; J05_testes.csv; prototipo.json",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "barras",
      "titulo": "Os números do perfil físico do app, antes e depois da correção",
      "unidade": "números",
      "barras": [
       {
        "nome": "O app escolheu",
        "valor": 18
       },
       {
        "nome": "Passam na correção",
        "valor": 9
       }
      ]
     }
    },
    {
     "id": "J05-3",
     "parte": "J05",
     "bloco": "J",
     "manchete": "O único requisito que a base sustenta é minutagem alta e regular por posição",
     "o_que_vimos": "O corte de minutos muda com a posição, 64,7% no goleiro contra 34,2% no atacante. Com ele, as quatro temporadas devolvem 215 jogador-temporadas de minutagem alta e repetida. Um corte único reprovaria o atacante por ser atacante.",
     "para_o_santa_cruz": "J06 aplica este corte antes de olhar qualquer número técnico ou físico, e ele elimina em vez de pontuar, como a §8.5 manda para viabilidade. Um corte único de minutos não mede minutagem, mede posição: reprova o atacante por ser atacante, como J01-1 mostrou. Com o corte por posição, a oferta de nomes regulares é curta, e é ela que vai dizer em quais posições J09 terá de procurar fora.",
     "premissa": "m2",
     "premissa_titulo": "Muitos minutos por temporada",
     "premissa_grupo": "Montagem do elenco",
     "premissa_motivo": "Confirma, com um ajuste. Minutagem alta e repetida nas últimas três temporadas vale como critério, mas o corte tem de ser o da posição, não um número único para o elenco inteiro.",
     "confianca": "indício",
     "confianca_motivo": "(a) Não é teste de hipótese: é um corte descritivo, herdado de J01-1, que já é indício. Nenhum BH, nenhuma porta temporal. (b) A conta foi refeita aqui, do dados/minutagem_serieb.json, pela mesma regra de scripts/J01.py (p75 da fatia dentro do grupo da posição, fatia alta em 2 das 3 temporadas da janela), e bate exatamente com o marcador corte_por_posicao de J01_numeros.json: Goleiro 64,7% · Zaga 56,8% · Volante 51,0% · Lateral 46,8% · Meia 42,5% · Atacante 34,2% · Extremo 32,4%. Os 215 regulares também batem com o `reg_pos` de J01. (c) O que o corte NÃO resolve: minutagem alta em time do Cai pode ser falta de opção, como o CLAUDE.md avisa; e J01-2 mostrou que a ficha de lesão não separa quem jogou pouco de quem jogou muito, então minutagem baixa continua sem explicação. (d) O export do Wyscout corta em 500 linhas por temporada, o que afeta quem jogou pouco e não quem é titular. (e) O gráfico mostra duas das 7 posições, o goleiro e o atacante, e elas não são as pontas da escala: o corte mais baixo é o do extremo. Os sete cortes inteiros estão no marcador min_corte_por_posicao e em J05_resumo.json.",
     "n": "215 jogador-temporadas de minutagem alta e repetida entre 3.160, 2022 a 2025",
     "prova": "J05.md; J05_resumo.json; J05_numeros.json",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "barras",
      "titulo": "Corte de minutos, goleiro contra atacante",
      "unidade": "% dos minutos da temporada",
      "barras": [
       {
        "nome": "Goleiro",
        "valor": 64.7
       },
       {
        "nome": "Atacante",
        "valor": 34.2
       }
      ]
     }
    }
   ],
   "em_aberto": "O perfil não foi validado contra desfecho: o backtest da §8.6 é de J06 e ainda não rodou, então nenhum piso desta ficha tem prova de que ordena certo. E a cláusula do CLAUDE.md sobre servir ao modelo do treinador escolhido ficou sem objeto, porque T04 não escolheu treinador.",
   "feita_em": null,
   "prova_arquivos": "scripts/J05.py + scripts/_metodo.py"
  },
  {
   "id": "J06",
   "bloco": "J",
   "secao": "Quem contratar",
   "pergunta": "Quais jogadores da Série B atendem o perfil de cada posição?",
   "status": "validada",
   "titulo": "Alvos na Série B, e o teste que decide se eles podem ser publicados",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "J06-1",
     "parte": "J06",
     "bloco": "J",
     "manchete": "Nenhum nome sai desta parte por falha da ficha",
     "o_que_vimos": "Dos 297 que chegaram a um clube da Série B, a ficha aprovaria 17. Esses 17 jogaram menos no primeiro ano que os 280 reprovados, e esta conferência não tinha tamanho para confirmar nem isso.",
     "para_o_santa_cruz": "Não contrate por esta ficha. Ela descreve como era o titular de quem subiu e serve para descartar quem está muito longe disso, mas não ordena candidatos: conferida contra o que aconteceu de verdade com 297 chegadas a clubes da Série B, ela aponta para o lado errado. Some-se a isto que exigir as 4 a 6 linhas da posição ao mesmo tempo esvazia o mercado: no elenco de hoje da Série B, 2 de 44 jogadores livres e rodados passam nas três notas juntas. A conta de contratação continua sendo a do olheiro, com a ficha ao lado como conversa, e o que o estudo entrega de útil aqui é a contagem da oferta, não a lista.",
     "premissa": "p20",
     "premissa_titulo": "Índice físico",
     "premissa_grupo": "Físico",
     "premissa_motivo": "Contradiz. A p20 supõe que dá para ordenar candidato por um índice geral; a §8.2 já proibia somar as três notas num número único, e agora o backtest da §8.6 mostra que nem a conjunção delas ordena. A mesma conferência no score da própria aba (etapa_13.backtest) deu o mesmo resultado: 209 recomendados com 1188,3 minutos contra 1220,3 de 208 reprovados.",
     "confianca": "indício",
     "confianca_motivo": "(a) A régua que autorizava publicar nome estava declarada ANTES de rodar, em J06_indicadores.json, chave regra_que_autoriza_publicar_nomes: d > 0 e q < 0,05 na família perfil_completo × minutos, com todos os setores juntos, nos DOIS cortes de fronteira. Ela não foi cumprida. (b) O teste primário nem chegou a entrar na tabela: o perfil inteiro aprova 17 das 297 chegadas e só 7 sem os clubes de fronteira, abaixo do piso declarado de 8 por lado. (c) Rodado à parte só no corte com fronteira — diagnóstico que não entra no BH nem no veredito —, o resultado é d -0,22 com p 0,46: aponta contra a ficha e não se distingue de zero. (d) Poder: o menor d que esse desenho enxergaria a 80% é 0,7, então 'não separa' aqui quer dizer também 'este desenho não conseguiria ver'. (e) Os blocos rodaram separados, como manda a §8.2, e nenhum dos três passa: físico d 0,07 (q 0,89), duelo/corpo d 0,06 (q 0,9), estilo técnico d -0,06 (q 0,79). (f) Os dois cortes, os dois relatados, com 7 pares discordantes: duelo_corpo|minutos em Todos: d 0.058 no corte com e -0.106 no corte sem (q 0.8964 e 0.92151); estilo_tecnico|minutos em Meia: d -0.589 no corte com e -0.934 no corte sem (q 0.10958 e 0.04689); estilo_tecnico|permanencia em Atacante: d 0.205 no corte com e -0.06 no corte sem (q 0.87062 e 0.88964); estilo_tecnico|permanencia em Lateral: d -0.044 no corte com e 0.34 no corte sem (q 0.87062 e 0.88964); fisico|minutos em Todos: d 0.075 no corte com e -0.123 no corte sem (q 0.88665 e 0.68946); fisico|permanencia em Zaga: d -0.603 no corte com e -0.804 no corte sem (q 0.12328 e 0.01005); minutagem|minutos em Todos: d 0.403 no corte com e 0.334 no corte sem (q 0.02874 e 0.12858). As duas únicas linhas que cruzam a correção a 5% aparecem SÓ no corte sem fronteira, que é enviesado por construção, e as duas apontam CONTRA a ficha. (g) Porta temporal da §6.4: não roda nesta unidade, pelos mesmos motivos de J03, J04 e J05 — o teto declarado antes de rodar já era indício. (h) Placar: o desfecho é minuto jogado e permanência, e nenhum dos dois está na lista branca de resultado da §3. (i) Esta conclusão ficou SEM gráfico de propósito. O único par de médias que existe aqui é o do diagnóstico do corte COM fronteira, 1.095 contra 1.317, e duas barras de alturas diferentes afirmariam no olho uma diferença que o próprio teste não distingue de zero (d -0,22, p 0,46, com d mínimo detectável de 0,7). Sem os clubes de fronteira o diagnóstico nem roda: a ficha aprova 7 chegadas, abaixo do piso de 8 por lado.",
     "n": "297 chegadas pontuáveis em 2023 a 2025, de 28 comparações por corte; 1.200 chegadas ficaram fora por não terem ano anterior na Série B e 246 por não chegarem a 900 minutos no ano anterior",
     "prova": "J06.md; J06_testes.csv; J06_backtest.csv; J06_resumo.json",
     "status": "validada",
     "negativa": true,
     "grafico": null
    },
    {
     "id": "J06-2",
     "parte": "J06",
     "bloco": "J",
     "manchete": "Quem chega já rodando joga mais no primeiro ano",
     "o_que_vimos": "Quem chegou já jogando muito e sempre fez 473 minutos a mais no ano da chegada, 5,3 jogos inteiros. Sem os clubes colados na linha do acesso e da queda a diferença deixa de ser segura, então o corte serve para eliminar, nunca para ordenar.",
     "para_o_santa_cruz": "Use minutagem alta e repetida como primeiro corte, e use-a para eliminar, nunca para pontuar. É o único requisito desta parte que aparece no dado do desfecho: entre 38 chegadas que já vinham rodando e 259 que não vinham, a diferença no primeiro ano foi de 473 minutos. Mas o mesmo dado diz para não esperar mais do que isso: quem chegou rodado NÃO ficou mais no clube no ano seguinte, e a diferença some quando se tiram os clubes de fronteira — então o corte serve para reduzir a lista, não para prometer titularidade.",
     "premissa": "m2",
     "premissa_titulo": "Muitos minutos por temporada",
     "premissa_grupo": "Montagem do elenco",
     "premissa_motivo": "Confirma, com o ajuste que J05 já tinha feito: o corte é o da posição, não um número único. Esta parte acrescenta que ele é o único do perfil que aparece do lado do desfecho — e que aparece nos minutos, não na permanência.",
     "confianca": "indício",
     "confianca_motivo": "(a) Correção para múltiplos testes a 5%, com a família da §6.3 (grupo × desfecho × corte, sem partir por setor): a linha passa no corte COM fronteira (q 0,03) e NÃO passa no corte sem (q 0,13). Pela regra da casa, firme é firme nos dois cortes, e por isso esta conclusão é indício e não provável. O que muda entre os cortes é o tamanho da amostra, não o tamanho do efeito: d 0,4 contra 0,33. (b) A família desta linha tem um teste só — os testes por setor caíram por n —, então a correção a 5% não teve o que corrigir ali, e isso está dito. (c) IC95 por bootstrap de clube: [0.05; 0.78] no corte com e [-0.01; 0.69] no corte sem, e o segundo encosta em zero. (d) Poder: o menor d detectável a 80% é 0,49 no corte com e 0,62 no corte sem. (e) O desfecho secundário vai na direção contrária e não separa: permanência de 18,4% contra 20,8%. (f) Porta temporal da §6.4: não roda. O backtest é temporal por construção — pontua com o dado do ano anterior e mede o ano da chegada —, mas é outro desenho, e esta parte não o chama de porta nem carimba confiança com ele. (g) Circularidade declarada: minuto passado prevendo minuto futuro tem correlação própria, e é por isso que o achado é um piso de triagem, não uma previsão de rendimento. (h) O gráfico desta conclusão mostra os minutos médios do corte COM fronteira, 1.718 contra 1.244, que saíram do texto, e o título do gráfico diz em que corte eles foram medidos. Ele deveria ser de dois cortes, como manda a §8.2 para conclusão que depende da fronteira, e não é por limitação de publicação, não por falta de dado: as médias por grupo do corte SEM fronteira existem em J06_testes.csv, na linha minutagem|minutos de setor Todos, mas scripts/J06.py não as grava em J06_numeros.json, e sem chave em numeros não há marcador para desenhá-las — digitar o número no gráfico é exatamente o que a §8.2 proíbe. Enquanto o script não as publicar, a ressalva da fronteira fica escrita no que vimos, e o par de cortes fica aqui: d 0,4 contra 0,33, q 0,03 contra 0,13, com a amostra caindo entre um corte e outro.",
     "n": "38 chegadas com minutagem alta e repetida contra 259 sem, em 2023 a 2025; o corte por posição é o de J05 e bate número a número",
     "prova": "J06.md; J06_testes.csv; J06_backtest.csv; J06_resumo.json",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "grupos",
      "titulo": "Minutos no ano da chegada, só no corte com todos os times",
      "unidade": "minutos",
      "series": [
       {
        "nome": "Chegou rodando",
        "valor": 1718
       },
       {
        "nome": "Não vinha rodando",
        "valor": 1244
       }
      ]
     }
    },
    {
     "id": "J06-3",
     "parte": "J06",
     "bloco": "J",
     "manchete": "São só 51 livres com rodagem em toda a Série B",
     "o_que_vimos": "Na Série B de hoje, 51 de 611 jogadores juntam contrato vencendo na virada e minutagem alta e repetida. Em 6 das 7 posições nenhum deles passa na ficha inteira.",
     "para_o_santa_cruz": "É esta a lista de onde sai o elenco, e ela é curta: 51 nomes no mercado inteiro da Série B, sendo 1 no gol, 6 no volante e 6 no extremo. A ordem em que J09 deve procurar fora é Goleiro · Volante · Extremo. A meia, com 13, é a de maior oferta, e zaga, lateral e ataque ficam no meio da faixa que o estudo pede. E cuidado com o calendário: 347 dos 611 jogadores da Série B têm contrato vencendo nesta virada — estar livre em dezembro não seleciona ninguém, é o calendário brasileiro.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere uma premissa nova: a de que o mercado de livres da Série B é grande o bastante para montar elenco. Ele não é — no gol ele é de um nome só.",
     "confianca": "indício",
     "confianca_motivo": "(a) É contagem, não teste: não há hipótese a corrigir a 5% nem porta temporal a cruzar, e por isso o teto é indício por natureza, não por fraqueza do dado. (b) O requisito que produz a contagem é o único que J05 sustenta, e o backtest desta parte o mostra do lado do desfecho (J06-2). (c) O contrato tem duas fontes e elas foram comparadas, como manda a §8.1: das 374 linhas com data dos dois lados, 316 caem no mesmo mês, 84,5%. (d) Buraco declarado: 226 dos 611 jogadores não casaram por nome com o elenco do Transfermarkt, então neles só existe a data do Wyscout, que é uma foto. (e) A contagem é publicada em três níveis — só minutagem, mais contrato e mais ficha — porque o terceiro nível depende de um filtro que o backtest não sustentou. (f) Goleiro: 39 dos 39 da Série B de hoje não têm uma linha física sequer, e o requisito físico deles fica marcado como não verificado. (g) O gráfico desta conclusão mostra só as quatro posições que têm número próprio na saída do script — Goleiro, Volante, Extremo e Meia. A contagem completa das sete, que saiu do que vimos, é Meia 13 · Lateral 9 · Zaga 8 · Atacante 8 · Volante 6 · Extremo 6 · Goleiro 1, e a ordem de busca para J09 é Goleiro 1 (escassez) · Volante 6 (aperto) · Extremo 6 (aperto) · Zaga 8 (dá para escolher) · Atacante 8 (dá para escolher) · Lateral 9 (dá para escolher) · Meia 13 (dá para escolher). O gráfico não traz linha de piso: o piso de cinco nomes por posição não existe como chave em J06_numeros.json, e a §8.2 proíbe valor digitado à mão no desenho. Abaixo dele está só Goleiro 1, isto é 1 das 7 posições.",
     "n": "611 jogadores da Série B de 2026 depois da regra de homônimo, 239 nomes ambíguos descartados; 51 livres e rodados",
     "prova": "J06.md; J06_funil.csv; J06_resumo.json",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "barras",
      "titulo": "Livres e rodados: as três posições mais curtas e a mais cheia",
      "unidade": "jogadores",
      "barras": [
       {
        "nome": "Goleiro",
        "valor": 1
       },
       {
        "nome": "Volante",
        "valor": 6
       },
       {
        "nome": "Extremo",
        "valor": 6
       },
       {
        "nome": "Meia",
        "valor": 13
       }
      ]
     }
    }
   ],
   "em_aberto": "Não há lista de nomes: o backtest da §8.6 não autorizou, e J06_alvos.csv não foi escrito. Falta para ele passar: desfecho melhor que minuto jogado (nota de atuação por jogo não existe em base nenhuma), chegada de fora da Série B pontuável (hoje só se pontua quem vinha da própria Série B, o que perde 1.200 das 1.743 chegadas) e um perfil que não exija 4 a 6 pisos ao mesmo tempo. A porta temporal da §6.4 continua sem rodar. Não rodei gerar_estudo_serieb_js.py nem escrevi no _registro.md: os dois são do fluxo principal.",
   "feita_em": null,
   "prova_arquivos": "scripts/J06.py + scripts/_metodo.py"
  },
  {
   "id": "J07",
   "bloco": "J",
   "secao": "Quem contratar",
   "pergunta": "Quantos estrangeiros jogaram a Série B, e como renderam?",
   "status": "validada",
   "titulo": "Estrangeiros na Série B",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "J07-1",
     "parte": "J07",
     "bloco": "J",
     "manchete": "Quem sobe dá 10,5% dos minutos a estrangeiro, quase o triplo do meio",
     "o_que_vimos": "63 das 80 clube-temporadas já tiveram estrangeiro, e a liga usa 2,2 por clube, longe das 9 do regulamento. É retrato de agora, não das quatro temporadas: o uso quase triplicou desde 2022, até 10,2% dos minutos da liga, e em 2023 quem subiu usou menos estrangeiro que o meio.",
     "para_o_santa_cruz": "A vaga de estrangeiro não está vazia: 63 de 80 clube-temporadas já usam pelo menos uma e 13 dos 16 clubes que subiram usaram — o Santa Cruz vai chegar num mercado com preço formado, e o que J08 e J09 fazem é escolher melhor dentro dele, não ocupar um espaço que ninguém viu. Quem subiu usa mais, mas isso é retrato de 2024-2025: em 2023 quem subiu usou menos que o meio. E nada aqui diz que estrangeiro faz subir — pode ser o contrário, clube que sobe é clube que tinha dinheiro para trazer.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere premissa nova, e ela inverte o que o texto publicado até aqui sugeria: a Série B usa 2,2 estrangeiros por clube-temporada, 63 de 80 clube-temporadas já têm pelo menos um e o uso quase triplicou em quatro anos — a vaga de estrangeiro é recurso disputado e em alta, não recurso ocioso. A premissa antiga (“a vaga está sobrando, há espaço de arbitragem”) era artefato do cruzamento de nomes quebrado e sai.",
     "confianca": "indício",
     "confianca_motivo": "Indício, por três razões que se somam. O CLAUDE.md já decidiu que \"resultados de estrangeiros na própria B são descritivos: liste os casos, sem aplicar o critério de conclusão\". Não há tabela de testes nesta parte — resultados/J07_testes.csv não existe e a linha 5 de scripts/J07.py diz por escrito que aqui não há teste de hipótese nem BH —, então nenhum q foi calculado e a distância entre as faixas não foi testada. E a porta temporal do 1º turno prevendo o 2º não rodou: a unidade desta parte é jogador-temporada e nenhum indicador tem versão por rodada. São 58 casos de estrangeiro na faixa Sobe, em 16 clube-temporadas; os dois cortes da fronteira rodaram e estão os dois no gráfico desta conclusão, um sobre o outro: sem os times colados na linha de acesso, a distância entre quem sobe e o meio aumenta em vez de encolher. A leitura é dominada por 2025, a temporada que concentra 42,2% dos casos da janela (76 dos 180: é o maior ano, mas não é a maioria), e a série de quem sobe contra o meio ano a ano continua sem marcador próprio — por isso os percentuais de cada temporada saíram da frase e esperam a re-rodada. Usar estrangeiro não anda junto só com subir, e o contrapeso está no gráfico: quem caiu dá 4,7% dos minutos a estrangeiro, mais que os 3,9% do meio, então a faixa Cai entrou no corte com todos os times. A assimetria se repete no outro corte e é maior: sem os times de fronteira o Cai vai a 6,1% contra 4,3% do meio — mas esses 6,1% existem hoje só dentro do de_onde de meio_sem em J07_numeros_novos.json, sem marcador próprio, e é por isso que a faixa Cai não aparece no corte de baixo do gráfico; ela entra na re-rodada.",
     "n": "180 casos de estrangeiro — 179 jogador-temporadas distintas, 146 jogadores — em 80 clube-temporadas de 2022 a 2025. Sobe: 58 casos em 16 clube-temporadas. Meio: 85 em 48. Cai: 37 em 16.",
     "prova": "J07_numeros_novos.json, sobe_min e sobe_sem; J07_resumo.json, por_faixa_do_time (cruzamento antigo, a regerar)",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Minutos dados a estrangeiro",
      "unidade": "% dos minutos do time",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Sobe",
          "valor": 10.5
         },
         {
          "nome": "Meio",
          "valor": 3.9
         },
         {
          "nome": "Cai",
          "valor": 4.7
         }
        ]
       },
       {
        "rotulo": "sem os times de fronteira",
        "series": [
         {
          "nome": "Sobe",
          "valor": 13.6
         },
         {
          "nome": "Meio",
          "valor": 4.3
         }
        ]
       }
      ]
     }
    },
    {
     "id": "J07-2",
     "parte": "J07",
     "bloco": "J",
     "manchete": "Um ano depois, só 26,7% dos estrangeiros seguem na liga, contra 50,9% dos brasileiros",
     "o_que_vimos": "Recortados igual, o estrangeiro não estreia jogando mais que o brasileiro: 16,6% contra 17,5% dos minutos. Isso depende de contar 2022, quando a liga inteira era estreante; sem ele a vantagem do estrangeiro volta. Seguir na liga é reaparecer na Série B, não ficar no clube.",
     "para_o_santa_cruz": "O estrangeiro não chega com vantagem de minuto: recortado por quem entrou no clube naquele ano, ele estreia com fatia igual ou menor que a do brasileiro, e quem esperava que ele viesse para jogar mais está comprando uma diferença que não existe. O que pesa na conta é a saída — 1 em cada 4 segue na Série B no ano seguinte, contra 1 em cada 2 do brasileiro —, então contrato, janela de saída e custo de reposição têm de ser montados para uma temporada. Ressalva que muda o uso: sair da Série B inclui quem subiu para a Série A ou foi para fora do país, então parte dessa rotatividade é venda, não fracasso, e esta parte não sabe separar as duas.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere premissa nova: contratar estrangeiro na Série B é aposta de uma temporada — recortado por quem entrou no clube naquele ano, ele estreia com fatia igual ou menor que a do brasileiro (16,6% contra 17,5% dos minutos) e só 26,7% reaparecem na liga no ano seguinte, contra 50,9% dos brasileiros. Derruba a premissa implícita do texto publicado até aqui, de que o estrangeiro chega com passe adiantado no time.",
     "confianca": "indício",
     "confianca_motivo": "Indício: são contagens, não testes — resultados/J07_testes.csv não existe, nenhum q foi calculado e o cabeçalho de scripts/J07.py declara que aqui não há teste de hipótese nem BH. A porta temporal do 1º turno prevendo o 2º também não rodou, e o que esta conclusão olha é o ano seguinte, que é outra coisa. Duas ressalvas de leitura: a permanência mede \"reapareceu na Série B\", não \"ficou no clube\", e o alvo é montado sobre as 3.864 linhas da base — montado só sobre as linhas que casaram nacionalidade, o estrangeiro dá 25,0% em vez de 26,7%. Além disso, 42,2% da coorte estrangeira é de 2025 e só pode ser julgada contra 2026, a temporada de pior cobertura e ainda em curso (2022: 96,3% · 2023: 96,6% · 2024: 94,8% · 2025: 91,2% · 2026: 72,2%). Sobre a estreia: a vantagem de minuto do estrangeiro (18,9% contra 18,2%) só existe na coorte frouxa, em que chegar era aparecer na base pela primeira vez, e some quando os dois lados são recortados por quem entrou no clube naquele ano — no recorte estrito o estrangeiro fica ABAIXO do brasileiro (16,6% contra 17,5%). Esse resultado do recorte estrito depende de 2022 estar dentro, e sem ele ele INVERTE: só com 2023-2025 o estrangeiro volta à frente por 3,6 pontos, 19,9% contra 16,3% do brasileiro, em 87 casos de estrangeiro — quem decide contratação lê isso como \"o estrangeiro ainda estreia jogando mais\", e é por isso que a ressalva está também no o_que_vimos e não só aqui. Esses 19,9 e 16,3 saem do mesmo cruzamento de scripts/J07.py, que não os grava como marcador, e entram na re-rodada. Na passada de 20/09 o gráfico desta conclusão mostrava a estreia, que a manchete não afirma; agora ele mostra a permanência, que é o achado do título, e a estreia voltou para a frase. A contagem bruta de quem reapareceu continua sem marcador próprio, em em_aberto.",
     "n": "Estreia, os dois lados restritos a quem entrou no clube naquele ano: 113 estrangeiros contra 1.064 brasileiros (2022-2025). Sem 2022: 87 estrangeiros. Ano seguinte: 180 casos de estrangeiro contra 2.813 de brasileiro.",
     "prova": "J07_numeros_novos.json, pri_est_nc e perm_est; J07_resumo.json, permanencia (cruzamento antigo, a regerar)",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "grupos",
      "titulo": "Segue na Série B no ano seguinte",
      "unidade": "% dos casos",
      "series": [
       {
        "nome": "Estrangeiro",
        "valor": 26.7
       },
       {
        "nome": "Brasileiro",
        "valor": 50.9
       }
      ]
     }
    },
    {
     "id": "J07-3",
     "parte": "J07",
     "bloco": "J",
     "manchete": "Quase todo estrangeiro da Série B é sul-americano, 155 dos 180 casos",
     "o_que_vimos": "Sete em cada dez casos: Argentina 42, Colômbia 35, Uruguai 34, Paraguai 20. Por jogador, não por temporada, a Colômbia lidera, e a base traz a nacionalidade, não a liga. No mesmo cruzamento, brasileiro com segundo passaporte (187) quase empata com estrangeiro de fato (180).",
     "para_o_santa_cruz": "Onde procurar é a vizinhança: Argentina, Colômbia, Uruguai e Paraguai. São essas as quatro ligas de que J08 precisa primeiro do fator de conversão, e é delas que J09 monta a lista — e, para montar lista de alvo, a contagem que vale é a de pessoas (146, com a Colômbia na frente), não a de temporadas. Ressalva que muda o uso: a base tem a nacionalidade, não a liga de onde o jogador veio — um argentino pode ter chegado de clube brasileiro —, então isso diz de que país é o mercado, não de que campeonato se compra.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere premissa nova: o mercado de estrangeiro da Série B é sul-americano — por linha, Argentina 42, Colômbia 35, Uruguai 34, Paraguai 20; por jogador, Colômbia 32, Argentina 28, Uruguai 28, Paraguai 15 —, e é dessas quatro ligas que o fator de conversão de J08 precisa primeiro. E derruba a premissa implícita de que o passaporte europeu é usado ao contrário: contados no mesmo cruzamento, dupla nacionalidade com o Brasil (187 casos) e estrangeiro de fato (180) aparecem quase 1 para 1 — o contraste que sustentava a frase antiga era artefato do cruzamento de nomes.",
     "confianca": "indício",
     "confianca_motivo": "Cai de firme para indício. O \"firme\" publicado se apoiava em \"contagem completa das cinco temporadas\", e isso não se sustenta: a janela do estudo é 2022-2025, a contagem não é completa (94,7% das linhas da janela casaram nacionalidade) e o motivo de confiança publicava cobertura de 81,7% enquanto todos os outros números da mesma conclusão vinham de um cruzamento com 94,7%. Pelos dois critérios também não passa: não há resultados/J07_testes.csv nem q calculado — scripts/J07.py declara que aqui não há teste de hipótese nem BH — e contagem de nacionalidade não tem versão por turno, então a porta temporal do 1º turno prevendo o 2º não rodou. A origem sai por nacionalidade e não por liga: clube_anterior dá o clube, não a liga, e um argentino pode ter vindo de clube brasileiro. A Europa quase não aparece dos dois jeitos de contar: Portugal, com 7 casos e 6 jogadores, é o único europeu com mais de um. O gráfico desta conclusão ficou numa unidade só, casos de estrangeiro por temporada, porque as duas contagens não são a mesma medida e não cabem na mesma régua: a barra são os 155 sul-americanos e a linha tracejada, o total de 180 casos. Por pessoa, e não por temporada, são 123 de 146, com a Colômbia na frente (Colômbia 32, Argentina 28, Uruguai 28, Paraguai 15). A linha de corte é o único valor escrito à mão em vez de marcador, porque o formato do gráfico não resolve marcador nesse campo: ela foi atualizada à mão junto com total_est e tem de continuar andando com ele. E a ressalva de contagem que muda o uso: contados no mesmo cruzamento, o brasileiro com segundo passaporte (187 casos) e o estrangeiro de fato (180) praticamente empatam — o contraste 40 x 11 que sustentava a ideia de que na Série B o passaporte europeu era usado ao contrário era artefato do cruzamento de nomes. Essa ressalva voltou para o texto de tela, no o_que_vimos, porque é ela que manda J09 separar os dois lados antes de contar vaga. Duas coisas que o dado desta parte NÃO diz e que saíram daqui na conferência de 20/09: não há fonte nenhuma, nem no de_onde de dupla_lin nem em premissas.json, para a regra de que dupla nacionalidade com o Brasil não ocupa vaga de estrangeiro — premissas.json só fixa o limite de 9 no elenco —, e a contagem de dupla nacionalidade não sustenta o \"a vaga não está sobrando\" de J07-1, que se apoia nos 2,2 por clube e nas 63 de 80 clube-temporadas.",
     "n": "180 casos de estrangeiro — 179 jogador-temporadas distintas, 146 jogadores — em 2022-2025, com 94,7% das linhas da janela cobertas por nacionalidade (Sobe 94,0% · Meio 95,2% · Cai 94,1%).",
     "prova": "J07_numeros_novos.json, ordem_por_linha e ordem_por_pessoa; J07_resumo.json, origem_por_nacionalidade (cruzamento antigo, a regerar)",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "barras",
      "titulo": "Sul-americanos, e a linha tracejada do total de estrangeiros",
      "unidade": "casos de estrangeiro (temporadas)",
      "barras": [
       {
        "nome": "Sul-americanos",
        "valor": 155
       }
      ],
      "linha_de_corte": 180
     }
    }
   ],
   "em_aberto": "Os números desta parte passaram a ser os que o scripts/J07.py grava (decisão de 20/09: onde o publicado divergia da saída do script, vale o script). O que continua pendente é o CONSERTO do cruzamento de nomes: o script precisa do módulo de identidade da §1.1, da ponte de clube nos dois sentidos e da coluna fronteira de A01_clube_temporada.csv, que ele nunca leu — o laço que procura faixa=='Trave' cai vazio em silêncio, porque trave é coluna separada. Enquanto isso não for feito, os 180 registros de estrangeiro são o que o cruzamento atual enxerga, não necessariamente o que existiu.",
   "feita_em": null,
   "prova_arquivos": "scripts/J07.py"
  },
  {
   "id": "J08",
   "bloco": "J",
   "secao": "Quem contratar",
   "pergunta": "Como os números de um jogador de outra liga se traduzem para a Série B?",
   "status": "validada",
   "titulo": "Conversão de ligas: como os números de outra liga se traduzem para a Série B",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "J08-1",
     "parte": "J08",
     "bloco": "J",
     "manchete": "Nenhum país de fora chega ao mínimo de casos com destino na Série B",
     "o_que_vimos": "Das 310 chegadas à Série B, a maior origem de fora do Brasil tem 8 casos, e o mínimo para dar número a um país são 10. Mesmo somando Série A e Série C ao destino, o degrau muda de tamanho conforme o corte e não fecha número para país nenhum.",
     "para_o_santa_cruz": "Nenhum alvo estrangeiro entra na lista com um número de conversão fechado ao lado. O J09 pode usar o degrau do grupo de países como ordem de grandeza apenas no volume, onde ele fica do mesmo lado nos dois cortes (grupo abaixo −3,2 e −5,2 lugares em cada 100; grupo acima +3,3 e +3,4); na eficiência ele troca de sinal entre os cortes (grupo pareado −1,3 e +1,9; grupo abaixo −0,3 e +2,2) e ali não serve nem como ordem de grandeza. O que resolve isto é coleta de mais temporadas das ligas de origem, não outra conta.",
     "premissa": "p18",
     "premissa_titulo": "A régua é a Série A + B",
     "premissa_grupo": "Físico",
     "premissa_motivo": "Ajusta p18 (a régua é a Série A + B). O jogador de outra liga continua entrando na mesma régua para poder ser comparado, mas o ajuste de nível que essa comparação pressupõe não existe para país nenhum — e no físico não existe nem dado. Contradiz também a seção \"Ligas de origem\" do CLAUDE.md, que trata o fator de J08 como algo que apenas faltava calcular.",
     "confianca": "indício",
     "confianca_motivo": "Zero dos dois critérios, e por isso cai dois níveis, de firme para indício. (1) Correção para múltiplos testes dentro da família dela: NÃO. No J08_testes.csv (modelo S2, corte principal), dos 154 testes de liga estrangeira 9 sobrevivem à correção (6 de 84 no volume, 3 de 70 na eficiência), onde o acaso a 5% já produz cerca de 8; nenhuma família de país estrangeiro sobrevive inteira (Colômbia A 0 de 12, Portugal A 0 de 12, EUA 0 de 12 no volume). No corte so_900_no_destino são 11 de 154, e a lista de sobreviventes não é a mesma: no principal lideram Uruguai com 4 e Argentina A com 3; lá, Chile com 4 de 10 indicadores de eficiência (6 casos) e Portugal B (5 casos). Nas 24 linhas de família dos dois cortes, poder_suficiente é False. (2) Porta temporal da §6.4 (1º turno prevendo o 2º, com a parcial dada a pontuação do 1º turno): NÃO, e não roda — não há turno nem clube-temporada aqui, a unidade é jogador que trocou de liga e o painel das ligas de origem é fechado por temporada. O que rodou foi a porta de coorte, que não é a §6.4, e ela ainda se divide: o J08_resumo.json marca passou=false no volume (erro 9.81 com o termo de liga contra 9.58 sem) e passou=true na eficiência por 0.16 pp sem barra de erro. Zero dos dois = indício, e a régua nomeia o motivo desta em especial: n pequeno. O eixo do argumento mudou junto: sai \"a parte que exige teste foi testada e não passou\", porque em dois dos três cortes o maior degrau estrangeiro SUPERA o sorteio (só 900 no destino: Colômbia A −10,05, IC95 −14,3 a −5,2 no J08_testes.csv, contra p95 de cerca de 8 com 5 países no piso; corte estrito: Uruguai −9,51 contra p95 8,3 com 4 países no piso, J08.md:265-269); entra a contagem, que não depende de corte — com destino só Série B nenhuma origem estrangeira passa de 8 casos e o piso é 10 —, e o tamanho que o desenho enxerga naquele n. Ressalva de origem, agora que o texto cita os dois cortes calados: os p95 deles não são saída de script — o do corte estrito está só no J08.md, feito à mão, e o do corte de 900 no destino só na varredura de robustez (três sementes: 7,69 / 8,18 / 8,34). É por isso que o que falta aqui é recálculo, não redação: virar corte de script o corte estrito e o de 900 na origem, rodar o sorteio dentro de cada corte com a mesma regra (alvo = os países que chegam ao piso naquele corte) e emitir a linha de base de quem só chutasse a média. Passou do o_que_vimos para cá, sem perder nada: o poder do teste não enxerga degrau menor que 12.6 lugares em cada 100 com 10 casos (10,0 com 16), e o número do mesmo país anda de 2,5 a 9,5 conforme o corte — 10,1 contando só quem jogou 900 minutos na chegada, acima do sorteio de cerca de 8, e 9,5 (Uruguai) contando só quem de fato mudou de clube, acima de 8,3. Os dois lados da comparação — o maior degrau medido contra o que a escolha do melhor entre 7 países produz por sorte, no volume (7.6 contra 9.3) e no acerto (5.2 contra 7.9) — ficaram aqui, e não no gráfico. Correção do cético, acatada, em duas frentes. A manchete voltou a trazer o recorte do destino: sem ele a negativa era falsa pelo número da própria parte, porque somando Série A e Série C ao destino 7 ligas estrangeiras CHEGAM ao piso (J08_resumo.json, nulo_do_garimpo.volume.ligas_estrangeiras_no_piso). E o gráfico de dois cortes que estava aqui saiu: os dois blocos dele não eram cortes, eram as duas famílias de indicador (volume e eficiência), e as quatro leituras saíam todas do MESMO corte principal — vestindo a forma que o renderizador descreve como “a mesma comparação nos dois cortes”, ele prometia conferência de corte e entregava “o medido fica sempre abaixo do sorteio”, que é justamente o eixo de argumento abandonado no parágrafo acima. Os marcadores do sorteio DENTRO de cada corte não existem em numeros (item 1 do em_aberto), então essa comparação não é desenhável por marcador hoje e só volta depois do recálculo. No lugar dela ficou a contagem, que é o que a manchete usa e não depende de corte: 8 casos na maior origem estrangeira contra o piso de 10.",
     "n": "737 mudanças de liga, 591 jogadores; 249 delas com origem estrangeira, em 45 países; 310 chegadas à Série B, nenhuma origem estrangeira com mais de 8 casos",
     "prova": "fatores_liga.csv; J08_testes.csv (coluna corte: principal e so_900_no_destino); J08_resumo.json (chaves nulo_do_garimpo, poder e porta_de_coorte); J08.md, seção Prova; _robustez_19_09.md, seção J08",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "barras",
      "titulo": "Casos da maior origem de fora, contra o mínimo para dar número",
      "unidade": "chegadas à Série B",
      "barras": [
       {
        "nome": "A maior origem de fora",
        "valor": 8
       },
       {
        "nome": "O mínimo para dar número",
        "valor": 10
       }
      ]
     }
    },
    {
     "id": "J08-2",
     "parte": "J08",
     "bloco": "J",
     "manchete": "O degrau da divisão de origem muda de tamanho conforme quem entra na conta",
     "o_que_vimos": "Descontando onde o jogador já estava na própria liga, a perda de quem sobe da Série C some e o ganho de quem desce da Série A fica em 3.4 lugares em cada cem. Só com quem mudou de clube e jogou 900 minutos dos dois lados, o ganho cai para 1.0 e as duas margens passam pelo zero.",
     "para_o_santa_cruz": "Nenhum número de conversão entre divisões brasileiras vai para a tela nesta parte. Em J06 e J09, jogador de Série A e jogador de Série C entram na mesma régua sem bônus nem desconto de divisão: o que separa os dois é onde cada um estava dentro da própria liga. Quem contratar da Série C pagando o desconto da divisão está pagando por uma queda que a base não sustenta, e quem pagar prêmio por Série A está pagando por 3.4 lugares em cada 100 que encolhem para 1.0 quando se conta só quem mudou mesmo de clube.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Não trata de nenhuma premissa de dados/premissas.json. Corrige uma leitura de graça anotada no _registro.md em 19/09 (\"quem sobe da Série C para a B perde 0,59 de nível\"), que não é premissa do app — e esse 0,59 é a média simples da base de 782 linhas (-0.587), não o coeficiente do modelo, que é −0,39.",
     "confianca": "indício",
     "confianca_motivo": "Fica no nível em que já estava, e a frase diz por quê: o degrau vai de 3.4 a 1.0 lugar em cada 100 conforme quem entra na conta. (1) Correção para múltiplos testes, pelo lado que a conclusão usa: NÃO. No J08_testes.csv (S2, principal) Brasil A tem 7 de 12 indicadores de volume sobrevivendo à correção e Brasil C 5 de 12, mas isso é sobre indicadores soltos; o degrau publicado é o da linha de família, e a coluna q dessa linha sai VAZIA nos quatro cortes (288 linhas de família, nenhuma com q). A família ancora_dqz idem — Brasil A aparece com p 0,0 e ainda assim com selo \"pode ser sorte\", porque não há q. Ou seja, o número que a conclusão discute nunca foi corrigido. (2) Porta temporal da §6.4: NÃO, e não roda (sem jogo a jogo em liga de origem). Na porta de coorte, que não é a §6.4, Brasil A acerta o sinal nas duas famílias e Brasil C erra o sinal nas duas (J08_resumo.json, porta_de_coorte.por_unidade). Zero dos dois = indício. O que o texto novo acrescentou é o outro lado: nos quatro cortes que o SCRIPT roda o degrau da Série A é estável (2,88 / 3,38 / 3,43 / 3,58, margem sempre fora do zero) — quem só olhasse a saída do script publicaria esse número como sólido. O que o derruba é um corte que só existe à mão, e é justamente o que o método da parte manda usar (\"jogadores que se transferiram\"); e a Série C faz o contrário da Série A, aparece onde não havia (0.1 para -3.5). Por isso o intervalo do corte estrito não vai para a tela como estava: o publicado (-1.6 a +3.3) não é reproduzível — a varredura de robustez refez e deu −1,4 a +3,4 —, e o texto passa a dizer apenas que a margem passa pelo zero. Passou do o_que_vimos para cá, sem perder nada: 189 das 737 linhas não são transferência — 56 subidas da B para a A, 55 da C para a B, 43 quedas da A para a B e 34 da B para a C —, e é por isso que o corte estrito (238 casos, quem mudou de clube e jogou 900 minutos dos dois lados) desfaz o degrau. Os dois cortes lado a lado ficaram aqui, e não no gráfico, inclusive a Série C, que sai de 0.1 para -3.5 lugar em cada 100 e é o que mostra que o sinal não se mantém. Correção do cético, acatada: o gráfico saiu desta conclusão, e a ressalva plural voltou ao texto. O gráfico tinha dois defeitos e um impedimento. O rótulo do primeiro bloco dizia “com todas as linhas”, que nomeia um corte que existe e não era o desenhado — todas as linhas é com_identidade_incoerente (Brasil A com 173 casos e 2,88), e os valores desenhados eram os do principal (156 casos, 3,38). O segundo bloco era o corte estrito, que não é um dos quatro cortes do J08_testes.csv (com_identidade_incoerente, principal, so_900_no_destino, so_temporada_fechada) e sim o corte feito à mão que o J08.md:233 admite, com intervalo não reproduzível. E o em_aberto manda, palavra por palavra, que J08-1 e J08-2 não vão para a tela com número fechado enquanto o recálculo não rodar — gráfico é tela, com tabela “ver os números” embaixo. Sem barra de erro, quatro pontos nus poriam a Série C indo de 0.1 para -3.5 como número fechado, que é exatamente o desconto que o para_o_santa_cruz proíbe, e o selo do J08_testes.csv para Brasil C é “sem diferença clara” nos quatro cortes de script. O intervalo da Série C no corte estrito (-7.4 a +0.1) é digitado, não gerado — a varredura de robustez refez e deu −7,28 a +0,87 —, então ele não vai para a tela nem para o gráfico enquanto o recálculo do item 1 não rodar. O desenho volta quando o recálculo do item 1 do em_aberto emitir o corte estrito como corte de script.",
     "n": "737 linhas no corte principal (Brasil A 156 casos, Brasil C 92), 238 no corte estrito com 228 jogadores; 189 das 737 não são transferência e 203 estão abaixo de 900 minutos na origem",
     "prova": "J08_base.csv (colunas clube_antes, clube_depois, menos_900_na_origem); fatores_liga.csv; J08_testes.csv (coluna corte, linhas de Brasil A e Brasil C); J08.md, seção Prova; _robustez_19_09.md, seção J08",
     "status": "validada",
     "negativa": true,
     "grafico": null
    },
    {
     "id": "J08-3",
     "parte": "J08",
     "bloco": "J",
     "manchete": "Quem chega de outra liga guarda menos da metade do destaque que tinha",
     "o_que_vimos": "Em 737 mudanças de liga, quem era o 10º melhor de cada cem na posição aparece por volta do 33º no ano seguinte, e isso vale igual para quem vem de dentro e de fora do Brasil. No acerto o encolhimento é maior: o 10º vai para perto do 42º.",
     "para_o_santa_cruz": "O maior risco de contratar de fora não é a liga: é comprar destaque que não viaja. O J09 não aplica um número de país como multiplicador — monta a conta inteira, com o lugar do jogador na liga dele, a idade e o degrau (fraco) do grupo de países, e prefere o alvo que continua bom depois do encolhimento. E como o encolhimento é o mesmo para todos, comparar dois estrangeiros entre si continua valendo mesmo sem número confiável de país.",
     "premissa": null,
     "premissa_titulo": null,
     "premissa_grupo": null,
     "premissa_motivo": "Sugere uma premissa nova: o que o clube compra de um jogador de fora é menos da metade do destaque que ele mostrava na liga dele, e isso é regra, não exceção.",
     "confianca": "indício",
     "confianca_motivo": "Zero dos dois critérios, e cai dois níveis, de firme para indício. (1) Correção para múltiplos testes: NÃO — e não porque reprovou, e sim porque nunca rodou sobre este número. No J08_testes.csv as linhas de família (alvo FAMILIA) saem com a coluna q vazia nos quatro cortes, e a família ancora_dqz também; o encolhimento não é um dos 22 indicadores corrigidos, é o coeficiente do modelo, e nenhum arquivo traz p ou q para ele. (2) Porta temporal da §6.4: NÃO, e não roda — não há jogo a jogo em liga de origem nenhuma. O que rodou foi a porta de coorte, que não é a §6.4: 222 chegadas até 2024 ordenam as 515 seguintes com acerto de ordem 0.52 no volume e 0.66 na eficiência (o script dá 0,655 e o J08.md 0,665; o 0,67 que estava publicado não sai de nenhum dos dois), com erro médio de 9.58. Fica registrado, porque é verdade e o dono precisa saber ao decidir: é o número mais amarrado da parte — quatro contas de fora concordam com os 0.44 medidos aqui (0.40 e 0.46 na etapa 11, 0.40 na reta dos 23.943 pares de quem ficou na mesma liga, 0.471 na confiabilidade do composto), e ele fica entre 0,40 e 0,47 nos quatro cortes que o script roda, com o corte estrito do mesmo lado (0,46 no volume, 0,25 na eficiência). O intervalo \"0,40 a 0,50\" que a parte publicava só fechava somando dois cortes que o script NÃO roda (só transferência real, 0,40; só 900 na origem, 0,50) — por isso ele sai, e com ele saem os marcadores b_min e b_max. Saiu também da frase a linha de base \"quem só chutasse a média\", que nenhum script emite; ficou só o erro de 9.58, que é saída do J08_resumo.json. O que falta é a correção e a porta da §6.4, e nenhuma das duas está ao alcance desta base: a porta exige o indicador jogo a jogo, e nenhuma liga de origem tem linha por rodada no repositório — o painel do Wyscout é fechado por temporada. Sem coleta por rodada nas ligas de origem, nenhuma conclusão do J08 chega a firme, por melhor que o número esteja amarrado. É lacuna de dado, não de escrita. Passou do o_que_vimos para cá, sem perder nada, a porta de coorte inteira: 222 chegadas até 2024 ordenam as 515 de 2025 e 2026 com acerto de ordem 0.52 no volume e 0.66 no acerto, e erro médio de 9.58 lugares em cada 100. O encolhimento dos dois lados — do 10º para o 33º no volume e para o 42º no acerto — passou para o gráfico da conclusão. Correção do cético, acatada: o título do gráfico passou a dizer o sentido da régua, porque no desenhaGrupos o traço cresce com o valor e aqui valor maior é lugar PIOR — sem isso o encolhimento aparecia como barra que cresce, e o achado é uma perda.",
     "n": "737 mudanças de liga, 591 jogadores distintos; 222 chegadas até 2024 preveem as 515 de 2025 e 2026",
     "prova": "J08_resumo.json (chaves o_encolhimento_confere_com_tres_contas_independentes, sensibilidade_do_encolhimento e porta_de_coorte); J08_testes.csv (coluna corte); J08.md, seção Prova; _robustez_19_09.md, seção J08",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "grupos",
      "titulo": "Quanto mais à direita, pior o lugar do jogador",
      "unidade": "lugar em cada 100",
      "series": [
       {
        "nome": "Na liga de origem",
        "valor": 10
       },
       {
        "nome": "Na chegada, no volume de jogo",
        "valor": 33
       },
       {
        "nome": "Na chegada, no acerto",
        "valor": 42
       }
      ]
     }
    }
   ],
   "em_aberto": "1) O recálculo que as três conclusões pedem, e que o próprio em_aberto da parte já pedia: virar corte de script o corte estrito (só transferência real + 900 minutos dos dois lados, 238 linhas) e o de 900 minutos na ORIGEM (534), hoje feitos à mão (J08.md:233 admite), rodar o sorteio dentro de CADA corte com a mesma regra (alvo = os países que chegam ao piso naquele corte) e emitir a linha de base de quem só chutasse a média. Enquanto isso não rodar, J08-1 e J08-2 não vão para a tela com número fechado. 2) A remarcação ficou incompleta por falta de fonte: J08 não tem J08_numeros_novos.json, então os números que a v2 trouxe dos cortes calados continuam escritos no texto, sem marcador, e estão listados aqui com o de_onde de cada um — 10,1 e o IC −14,3 a −5,2 (Colômbia A, volume, corte so_900_no_destino: J08_testes.csv, fator_pp −10,05); o sorteio de cerca de 8 nesse corte (varredura de robustez, três sementes: 7,69 / 8,18 / 8,34); 9,5 e 8,3 (Uruguai no corte estrito e o p95 de 4 países: J08.md:265-269); 10,0 com 16 casos (J08.md:265-269); 2,5 a 9,5 (Uruguai nos cinco cortes: J08_testes.csv, de −2,52 em com_identidade_incoerente a −9,51 no estrito); 2,9 a 3,6 e 2,88 / 3,38 / 3,43 / 3,58 (Brasil A, volume, os quatro cortes do J08_testes.csv); os degraus de grupo −3,2, −5,2, +3,3, +3,4, −1,3, +1,9, −0,3 e +2,2 (J08_testes.csv, alvo FAMILIA, unidades FAIXA ABAIXO/ACIMA/PAREADO nos cortes principal e so_900_no_destino); −0,39 (coeficiente de Brasil C no modelo pareado); 0,40 a 0,47 e o corte estrito 0,46 / 0,25 (quanto o jogador guarda; J08.md e J08_resumo.json). O recálculo do item 1 é o que grava esses números num J08_numeros.json e fecha a remarcação. 3) Quatro valores do campo numeros foram corrigidos agora, conforme a v2, e conferidos por mim na base: n_para_serieb 321 → 310 e maior_estrangeira_serieb \"Portugal A\" → \"Colômbia A e Uruguai\" (321 e Portugal A eram contagem das 782 linhas, e a mesma frase cita o corte principal de 737: ali são 310 chegadas, Colômbia A e Uruguai com 8 e Portugal A com 7); acerto_efic 0,67 → 0,66 (o script dá 0,655); lugar_depois_efic 43 → 42 (a conta sem o termo de idade). 4) b_min (−0,60) e b_max (−0,50) continuam no campo numeros mas nenhum texto os cita mais: esse intervalo só fecha somando dois cortes que o script não roda. O recálculo deve regravá-los a partir dos quatro cortes do script (−0,598 a −0,526) ou removê-los. 5) Lacuna de dado, não de escrita: a porta temporal da §6.4 exige o indicador jogo a jogo e nenhuma liga de origem tem linha por rodada no repositório (o painel do Wyscout é fechado por temporada). Sem coleta por rodada nas ligas de origem, nenhuma conclusão do J08 pode chegar a firme.",
   "feita_em": null,
   "prova_arquivos": "scripts/J08_base.py + scripts/J08.py + scripts/_metodo.py"
  },
  {
   "id": "J09",
   "bloco": "J",
   "secao": "Quem contratar",
   "pergunta": "Quais estrangeiros atendem o perfil, depois do ajuste de liga?",
   "status": "validada",
   "titulo": "Alvos no exterior, e por que as três posições que faltam não têm nenhum",
   "tipo": "analise",
   "conclusoes": [
    {
     "id": "J09-1",
     "parte": "J09",
     "bloco": "J",
     "manchete": "Estrangeiro que já rodava joga mais no primeiro ano de Série B",
     "o_que_vimos": "Das 48 chegadas do exterior à Série B, quem já vinha jogando muito na liga de origem fez 1.393 minutos no primeiro ano, contra 1.074 de quem não vinha. São 319 minutos, 3,5 jogos. Serve para reduzir a lista, não para prometer titularidade.",
     "para_o_santa_cruz": "É o único número desta parte que serve para decidir. Ao olhar um estrangeiro, a rodagem que ele tem hoje na liga dele pesa mais do que qualquer percentil da ficha — e pesa mais ainda porque os percentis da ficha, nesta mesma amostra, não separaram nada: duelo/corpo d 0,06 e estilo técnico apontando para o lado errado. Use como requisito que ELIMINA, nunca como nota. Quem chega com 70% dos minutos do time joga; quem chega de reserva não vira titular por ser bom no papel. O mesmo dado diz onde parar: dos 48 que chegaram, 30 vinham rodando e 18 não, e a diferença é de 319 minutos — serve para reduzir a lista, não para prometer titularidade.",
     "premissa": "m2",
     "premissa_titulo": "Muitos minutos por temporada",
     "premissa_grupo": "Montagem do elenco",
     "premissa_motivo": "Confirma, pelo lado de fora. A m2 diz para priorizar quem joga e joga muito; esta parte mostra que, entre estrangeiros, é o único pedaço do perfil que aparece do lado do desfecho. É a mesma direção de J06-2, medida num desenho independente: lá, dentro da Série B, era d +0,403 e caía no corte sem fronteira; aqui é d 1,02 e 1,18 e passa nos dois.",
     "confianca": "indício",
     "confianca_motivo": "(a) Pela régua mecânica da casa isto seria PROVÁVEL, e o número está aqui para o dono decidir: passa no BH a 5% nos DOIS cortes de fronteira (q 0 com e 0 sem), nos DOIS desfechos (minutos, e chegar a 900 minutos: q 0,02 e 0,01, com 70% contra 40%). (b) Poder suficiente por desenho nos dois cortes: d 1,02 contra o mínimo detectável de 0,85, e d 1,18 contra 1,03. (c) IC95 por bootstrap de clube de destino exclui o zero nos dois: [0.38; 1.88] e [0.47; 2.16]. (d) Porta temporal da §6.4: NÃO rodou. O backtest é temporal por construção (pontua com o ano anterior, mede no ano da chegada), mas é outro desenho e não é a porta — o mesmo critério que J06 usou. Por isso não pode ser firme. (e) O que segura em indício e não em provável não é o teste: é que o teto desta parte foi declarado `indício` em J09_indicadores.json ANTES de rodar, e teto declarado não se reabre depois de ver o resultado. Está em aberto para o dono. (f) n pequeno: 48 chegadas, e 31 das 79 ficaram fora por não terem foto na liga de origem; elas fizeram menos minutos no destino que as que ficaram, o que empurra para o lado conservador. (g) O filtro com repetição — que é o que a parte usa de verdade — NÃO passa: d 0,36, q 0,34, com 8 de um lado e mínimo detectável de 1,11. A repetição pode valer; esta amostra não consegue dizer. (h) Placar: o desfecho é minuto jogado, que não está na lista branca de resultado. (i) Os dois cortes de fronteira saíram do texto e foram para o gráfico desta conclusão, lado a lado: com todos os times, 1.393 minutos contra 1.074, com 30 e 18 chegadas; sem os times de fronteira, 1.600 contra 1.006, com 18 e 14. A direção é a mesma nos dois, e é isso que a frase antiga “vale nos dois recortes” dizia. (j) A manchete NÃO crava magnitude, de propósito: o 319/3,5 é o corte COM fronteira, e sem a fronteira a diferença é bem maior (1.600 contra 1.006). Cravar um dos dois na manchete traria de volta pela manchete a fragilidade que o gráfico de dois cortes existe para mostrar. Some-se o IC95 de [0.38; 1.88], que é largo, e a alínea (g): um ponto com uma casa decimal na manchete seria certeza que este número não tem.",
     "n": "48 chegadas do exterior à Série B em 2023 a 2026, 30 com minutagem alta na origem contra 18 sem; 14 testes entraram na tabela e 126 recortes por setor ficaram fora por não chegar a 8 de cada lado",
     "prova": "J09.md; J09_testes.csv (grupo minutagem_alta, setor Todos); J09_backtest.csv; J09_resumo.json",
     "status": "validada",
     "negativa": false,
     "grafico": {
      "tipo": "dois_cortes",
      "titulo": "Minutos no primeiro ano de Série B, por rodagem na liga de origem",
      "unidade": "minutos",
      "cortes": [
       {
        "rotulo": "com todos os times",
        "series": [
         {
          "nome": "Rodava",
          "valor": 1393
         },
         {
          "nome": "Não rodava",
          "valor": 1074
         }
        ]
       },
       {
        "rotulo": "sem os times de fronteira",
        "series": [
         {
          "nome": "Rodava",
          "valor": 1600
         },
         {
          "nome": "Não rodava",
          "valor": 1006
         }
        ]
       }
      ]
     }
    },
    {
     "id": "J09-2",
     "parte": "J09",
     "bloco": "J",
     "manchete": "Nenhum volante e nenhum extremo de fora passa nos 6 pisos juntos",
     "o_que_vimos": "67 volantes e 82 extremos de fora jogam muito e sempre na liga deles. Nenhum dos dois grupos tem um jogador só que atenda as 6 exigências ao mesmo tempo. Use a ficha para descartar quem está muito longe, nunca para escolher.",
     "para_o_santa_cruz": "Não há alvo estrangeiro a perseguir no volante, na ponta e no gol — e o motivo não é o mercado, é a conta. Exigir 6 pisos ao mesmo tempo esvaziou o mercado lá fora como já tinha esvaziado dentro da Série B em J06, onde os três blocos juntos aprovavam 2 de 44. Nessas três posições, siga com olheiro e vídeo, e use a ficha para DESCARTAR quem está muito longe, nunca para escolher. Fora delas o estudo consegue dizer algo: 38 nomes em 4 posições passam o piso na régua da própria liga e têm contrato vencendo até 2027-06-30, com faixa salarial ao lado — mas ali a Série B já oferece de 8 a 13 nomes e a vaga de estrangeiro é cara.",
     "premissa": "p9",
     "premissa_titulo": "Limite de estrangeiros",
     "premissa_grupo": "Elenco",
     "premissa_motivo": "Contradiz no que a p9 tem de operacional. A vaga de estrangeiro existe — são 9 — mas esta base não indica em quem gastá-la justamente nas posições em que ela faria falta. Acrescenta também um dado de graça: 199 dos 910 elegíveis nasceram no Brasil e não ocupam vaga nenhuma.",
     "confianca": "indício",
     "confianca_motivo": "(a) É CONTAGEM, não estimativa: quantos candidatos existem e quantos atravessam os pisos de J05. Nenhum teste a salva nem a derruba, porque o que falta é margem na ficha e não poder estatístico. (b) O teto da parte foi declarado indício antes de rodar e a regra que autorizaria o rótulo `alvo` (nível A) exigia d > 0 e q < 0,05 na família filtro_j09 × minutos nos dois cortes: o teste primário nem entrou na tabela, porque o filtro aprova 4 das 48 chegadas, abaixo do piso de 8 por lado. Rodado à parte, fora do BH, os 4 aprovados fizeram 1.079 minutos contra 1.291 dos 44 reprovados. Por isso o rótulo publicado é `rastrear`. (c) Os dois cortes da fronteira rodaram e os dois estão relatados; nenhum bloco técnico passa em nenhum deles. (d) As DUAS leituras do piso rodaram, como a emenda 1 declarou antes: 78 passam na régua da própria liga e 70 depois da conta de J08. (e) A conta de J08 é uma reta de encolhimento, e isto está medido: o ponto fixo dela fica em 49,5 na eficiência, então ela PROMOVE quem está abaixo e REBAIXA quem está acima — de 3.640 medidas, 1.764 sobem e 1.876 descem — e o teto de 66,1 deixa 2 dos 20 pisos técnicos fora de alcance por construção. (f) O bloco físico entrou porque esta parte achou o dado na base do próprio app, com ponte medida em 99% de 11.023 linhas; mas ele NÃO tem fator de conversão em J08, então é o lugar do jogador na régua da própria liga, sem tradução. (g) Porta temporal: não rodou. (h) O funil que saiu do texto para o gráfico, bloco a bloco isolado: dos 67 volantes, 53 têm linha física, o físico aprova 7, o duelo 8 e o passe 12, e 0 passam em tudo; dos 82 extremos, 71 têm linha física, 12, 12 e 18 por bloco, e 0 passam em tudo. É a mesma contagem nas duas leituras do piso, e o gráfico mostra a do volante. (i) O rótulo do gráfico diz ISOLADO porque é isso que a conta é: `atende`, no J09.py, é ter dado em pelo menos UM piso do bloco e não violar NENHUM dos que têm dado — leituras sobrepostas, não fatias exclusivas de um funil, e por isso 7, 8 e 12 não se somam. A barra da ficha inteira é outro critério, `passa_ficha_origem`: dado em pelo menos DOIS pisos e nenhuma violação. Como os dois critérios não são o mesmo, a base de 67 candidatos ficou FORA do desenho e está no texto: cinco barras na mesma escala liam-se como um funil de fatias exclusivas, o que seria falso.",
     "n": "910 elegíveis com dado em 39 das 62 ligas lidas; 67 volantes e 82 extremos nas posições prioritárias, dos quais 53 e 71 com linha física",
     "prova": "J09.md; J09_resumo.json (chave por_posicao); J09_base.csv; J09_rastreio.csv; J09_ligas.csv",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "barras",
      "titulo": "Volantes de fora aprovados, por bloco isolado e na ficha inteira",
      "unidade": "jogadores",
      "barras": [
       {
        "nome": "Físico, isolado",
        "valor": 7
       },
       {
        "nome": "Duelo, isolado",
        "valor": 8
       },
       {
        "nome": "Passe, isolado",
        "valor": 12
       },
       {
        "nome": "Na ficha inteira",
        "valor": 0
       }
      ]
     }
    },
    {
     "id": "J09-3",
     "parte": "J09",
     "bloco": "J",
     "manchete": "No gol a base não tem como apontar um nome",
     "o_que_vimos": "Da ficha de goleiro sobram 2 exigências, as duas de passe, e a repetição na liga de origem não dá para conferir. Decida por olho e vídeo. 99 dos 584 passam esses dois números, e 44 deles têm contrato vencendo até 2027-06-30.",
     "para_o_santa_cruz": "O gol é onde a Série B oferece menos — 1 livre com rodagem, em J06 — e é exatamente onde o estudo não ajuda. A decisão terá de ser tomada por olho e vídeo. Não peça outra conta: faltam as três pernas ao mesmo tempo e as três são de coleta, não de método. A contagem fica de pé e vale como mapa de onde procurar: 99 dos 584 passam os dois números de passe e 44 desses têm contrato vencendo na janela.",
     "premissa": "m4",
     "premissa_titulo": "Goleiro top — investir",
     "premissa_grupo": "Montagem do elenco",
     "premissa_motivo": "Trata da m4, que diz ser o goleiro posição em que vale pagar acima da média do elenco. Não a contradiz: avisa que ela terá de ser executada sem apoio deste estudo enquanto as três lacunas existirem, e que o custo de errar ali continua alto.",
     "confianca": "indício",
     "confianca_motivo": "(a) O nível C — nenhum nome — estava escrito na regra ANTES de rodar, com o goleiro citado nominalmente: 'um filtro que não olha para nada de goleiro não escolhe goleiro'. Não é resultado, é a regra disparando. (b) As três lacunas estão medidas, não supostas: das 4 métricas do goleiro em J05 o duelo defensivo ficou sem piso e o aéreo foi descartado em J03-3, sobrando 2; o painel temporal tem 7 posições-raiz e nenhuma é goleiro, o que torna a repetição INVERIFICÁVEL — diferente de baixa; e só 18 dos 584 têm linha física, o que confirma em liga estrangeira o que J04 achou na Série B, onde 105 goleiros de 900+ minutos não tinham uma linha. (c) J08 não tem fator para goleiro: o painel de transferências não traz a posição. (d) Nenhum teste roda aqui, e por isso o teto é indício por construção: é contagem de lacuna. (e) Porta temporal: não se aplica. (f) A contagem que saiu do texto para o gráfico, com as três barras na MESMA base encaixada: 854 goleiros na base, 584 deles com minutagem alta E os dois números da ficha (são 585 os de minutagem alta; o que sobra não tem dois indicadores), e 18 desses com linha física. (g) A repetição NÃO é barra do gráfico, e é de propósito: 0 goleiros têm repetição conferível porque `regularidade_verificavel` é `setor diferente de Goleiro` no J09.py — zero POR CONSTRUÇÃO, contado sobre os 854 da base e não sobre os 18 da barra anterior. Desenhada como quarto degrau do funil, ela faria ler reprovação medida onde há AUSÊNCIA DE CONFERÊNCIA: o painel do Wyscout não guarda um goleiro sequer. É o mesmo que a alínea (b) diz — inverificável, diferente de baixa — e é por isso que a frase fica no que vimos, que se lê, e não só aqui.",
     "n": "854 goleiros na base, 585 com minutagem alta e 18 com linha física, em 39 ligas",
     "prova": "J09.md (seção O goleiro); J09_resumo.json (por_posicao.Goleiro); J09_base.csv (colunas regularidade_verificavel e fisico_rastreado); J05_perfil.csv",
     "status": "validada",
     "negativa": true,
     "grafico": {
      "tipo": "barras",
      "titulo": "Goleiros de fora, e o que a base tem sobre eles",
      "unidade": "goleiros",
      "barras": [
       {
        "nome": "Na base",
        "valor": 854
       },
       {
        "nome": "Com minutos e ficha",
        "valor": 584
       },
       {
        "nome": "Com linha física",
        "valor": 18
       }
      ]
     }
    }
   ],
   "em_aberto": "O ponteiro do físico: J05 e J06 marcaram o requisito físico do alvo estrangeiro como inverificável apoiados numa frase de J08 que vale para J08 e não para eles — o dado está em dados/jogadores.json, 36 ligas, e esta parte o usou com ponte medida em 99,0%. Quem refizer J05 ou J06 deve conferir. O teto de nível da J09-1, que pela régua mecânica seria provável e saiu indício por teto declarado. E três lacunas nomeáveis: 31 das 79 chegadas do exterior não têm foto na liga de origem e ficaram fora do backtest; o backtest testa 4 dos 20 pisos, porque não há físico histórico; e a regularidade na origem não pôde ser testada, com 8 aprovados contra um mínimo detectável de 1,11.",
   "feita_em": null,
   "prova_arquivos": "scripts/J09.py + scripts/_metodo.py"
  },
  {
   "id": "R01",
   "bloco": "E",
   "secao": "Tarefas da tela",
   "pergunta": "Tirar Análise Série B e Protótipo da barra, sem apagá-las",
   "status": "feita",
   "titulo": null,
   "tipo": null,
   "conclusoes": [],
   "em_aberto": "",
   "feita_em": "2026-09-20",
   "prova_arquivos": null
  }
 ],
 "elenco_livre": {
  "gerado_por": "scripts/J06_livres.py",
  "gerado_em": "2026-09-20",
  "o_que_e": "Livres na virada, contrato confirmado nas duas fontes, minutagem regular. Terceiro degrau do funil do J06 — NÃO é lista de alvos: o backtest da §8.6 não autorizou nome nenhum, e a ficha de perfil descreve quem subiu sem prometer quem vai subir.",
  "total": 51,
  "com_a_ficha_inteira": 2,
  "com_contrato_confirmado": 40,
  "sem_par_no_app": [
   "Welliton Matheus (Fortaleza): não achei este nome na base do app",
   "Willian (América-MG): homônimo sem desempate: Grêmio, Guarani"
  ],
  "backtest_autorizou": false,
  "por_posicao": [
   {
    "posicao": "Goleiro",
    "ficha_de": "Goleiro",
    "quantos": 1,
    "com_a_ficha_inteira": 0,
    "com_contrato_confirmado": 0,
    "na_serie_b": 39,
    "na_serie_b_de": "Goleiro",
    "jogadores": [
     {
      "jogador": "Paulo Vítor",
      "clube": "Atlético-GO",
      "id_tm": "",
      "pk_app": "Paulo Vítor - Atlético GO - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Goleiro",
      "posicao_wy": "GK",
      "idade": 37.0,
      "minutos": 2402.0,
      "jogos": 24.0,
      "fatia_pct": 90.2,
      "temporadas_com_dado": "2",
      "lesao_dias": 28.0,
      "estrangeiro": false,
      "contrato_confirmado": false,
      "atende_perfil": false,
      "violados": "1",
      "indicadores_com_dado": "4"
     }
    ]
   },
   {
    "posicao": "Zaga",
    "ficha_de": "Zaga",
    "quantos": 8,
    "com_a_ficha_inteira": 0,
    "com_contrato_confirmado": 8,
    "na_serie_b": 99,
    "na_serie_b_de": "Zaga",
    "jogadores": [
     {
      "jogador": "Vilar",
      "clube": "Botafogo-SP",
      "id_tm": "978269",
      "pk_app": "Vilar - Botafogo SP - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Zaga",
      "posicao_wy": "LCB",
      "idade": 26.0,
      "minutos": 2612.0,
      "jogos": 26.0,
      "fatia_pct": 95.6,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "2",
      "indicadores_com_dado": "5"
     },
     {
      "jogador": "César Martins",
      "clube": "Criciúma",
      "id_tm": "269467",
      "pk_app": "César Martins - Criciúma - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Zaga",
      "posicao_wy": "RCB",
      "idade": 33.0,
      "minutos": 2035.0,
      "jogos": 21.0,
      "fatia_pct": 78.1,
      "temporadas_com_dado": "3",
      "lesao_dias": 33.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "2",
      "indicadores_com_dado": "5"
     },
     {
      "jogador": "Éder",
      "clube": "Ceará",
      "id_tm": "375690",
      "pk_app": "Éder - Ceará - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Zaga",
      "posicao_wy": "RCB",
      "idade": 31.0,
      "minutos": 2021.0,
      "jogos": 20.0,
      "fatia_pct": 82.9,
      "temporadas_com_dado": "2",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "3",
      "indicadores_com_dado": "5"
     },
     {
      "jogador": "Miranda",
      "clube": "Operário-PR",
      "id_tm": "412376",
      "pk_app": "Miranda - Operário PR - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Zaga",
      "posicao_wy": "LCB",
      "idade": 26.0,
      "minutos": 1945.0,
      "jogos": 20.0,
      "fatia_pct": 71.5,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "3",
      "indicadores_com_dado": "5"
     },
     {
      "jogador": "Luciano Castán",
      "clube": "Criciúma",
      "id_tm": "140541",
      "pk_app": "Luciano Castán - Criciúma - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Zaga",
      "posicao_wy": "LCB",
      "idade": 36.0,
      "minutos": 1841.0,
      "jogos": 19.0,
      "fatia_pct": 70.6,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "2",
      "indicadores_com_dado": "5"
     },
     {
      "jogador": "Tiago Pagnussat",
      "clube": "Vila Nova",
      "id_tm": "346729",
      "pk_app": "Tiago Pagnussat - Vila Nova - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Zaga",
      "posicao_wy": "RCB",
      "idade": 36.0,
      "minutos": 1770.0,
      "jogos": 21.0,
      "fatia_pct": 66.8,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "1",
      "indicadores_com_dado": "5"
     },
     {
      "jogador": "Lucas Ribeiro",
      "clube": "Goiás",
      "id_tm": "605893",
      "pk_app": "Lucas Ribeiro - Goias - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Zaga",
      "posicao_wy": "LCB",
      "idade": 27.0,
      "minutos": 1499.0,
      "jogos": 19.0,
      "fatia_pct": 55.5,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "1",
      "indicadores_com_dado": "5"
     },
     {
      "jogador": "Ricardo Silva",
      "clube": "América-MG",
      "id_tm": "206097",
      "pk_app": "Ricardo Silva - América Mineiro - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Zaga",
      "posicao_wy": "RCB",
      "idade": 34.0,
      "minutos": 1252.0,
      "jogos": 13.0,
      "fatia_pct": 46.7,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "2",
      "indicadores_com_dado": "5"
     }
    ]
   },
   {
    "posicao": "Lateral esquerdo",
    "ficha_de": "Lateral",
    "quantos": 5,
    "com_a_ficha_inteira": 0,
    "com_contrato_confirmado": 5,
    "na_serie_b": 106,
    "na_serie_b_de": "Lateral",
    "jogadores": [
     {
      "jogador": "Patrick Brey",
      "clube": "Botafogo-SP",
      "id_tm": "435170",
      "pk_app": "Patrick Brey - Botafogo SP - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Lateral",
      "posicao_wy": "LB",
      "idade": 29.0,
      "minutos": 2301.0,
      "jogos": 23.0,
      "fatia_pct": 84.2,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "3",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Zeca",
      "clube": "Athletic",
      "id_tm": "325196",
      "pk_app": "Zeca - Athletic Club - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Lateral",
      "posicao_wy": "LB",
      "idade": 32.0,
      "minutos": 1569.0,
      "jogos": 20.0,
      "fatia_pct": 57.3,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "3",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Sánchez",
      "clube": "Ceará",
      "id_tm": "375241",
      "pk_app": "Sánchez - Ceará - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Lateral",
      "posicao_wy": "LB",
      "idade": 30.0,
      "minutos": 1194.0,
      "jogos": 18.0,
      "fatia_pct": 49.0,
      "temporadas_com_dado": "2",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "3",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Sander",
      "clube": "Novorizontino",
      "id_tm": "353722",
      "pk_app": "Sander - Grêmio Novorizontino - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Lateral",
      "posicao_wy": "LB",
      "idade": 35.0,
      "minutos": 615.0,
      "jogos": 7.0,
      "fatia_pct": 21.9,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "0",
      "indicadores_com_dado": "0"
     },
     {
      "jogador": "Reverson",
      "clube": "CRB",
      "id_tm": "642570",
      "pk_app": "Reverson - CRB - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Lateral",
      "posicao_wy": "LB",
      "idade": 29.0,
      "minutos": 566.0,
      "jogos": 10.0,
      "fatia_pct": 20.9,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "0",
      "indicadores_com_dado": "0"
     }
    ]
   },
   {
    "posicao": "Lateral direito",
    "ficha_de": "Lateral",
    "quantos": 4,
    "com_a_ficha_inteira": 0,
    "com_contrato_confirmado": 2,
    "na_serie_b": 106,
    "na_serie_b_de": "Lateral",
    "jogadores": [
     {
      "jogador": "Willean Lepo",
      "clube": "Criciúma",
      "id_tm": "544464",
      "pk_app": "Willean Lepo - Criciúma - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Lateral",
      "posicao_wy": "RWB",
      "idade": 29.0,
      "minutos": 1710.0,
      "jogos": 22.0,
      "fatia_pct": 65.6,
      "temporadas_com_dado": "2",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": false,
      "atende_perfil": false,
      "violados": "3",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Rodrigo Soares",
      "clube": "Goiás",
      "id_tm": "388236",
      "pk_app": "Rodrigo Soares - Goiás - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Lateral",
      "posicao_wy": "RB",
      "idade": 33.0,
      "minutos": 1415.0,
      "jogos": 21.0,
      "fatia_pct": 52.4,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "2",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Hereda",
      "clube": "CRB",
      "id_tm": "634139",
      "pk_app": "Hereda - CRB - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Lateral",
      "posicao_wy": "RB",
      "idade": 27.0,
      "minutos": 1404.0,
      "jogos": 20.0,
      "fatia_pct": 51.8,
      "temporadas_com_dado": "2",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "1",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Marcos Vinicius",
      "clube": "Goiás",
      "id_tm": "594006",
      "pk_app": "Marcos Vinicius - Goias - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Lateral",
      "posicao_wy": "RB",
      "idade": 29.0,
      "minutos": 310.0,
      "jogos": 7.0,
      "fatia_pct": 11.5,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": false,
      "atende_perfil": false,
      "violados": "0",
      "indicadores_com_dado": "0"
     }
    ]
   },
   {
    "posicao": "Volante",
    "ficha_de": "Volante",
    "quantos": 6,
    "com_a_ficha_inteira": 0,
    "com_contrato_confirmado": 3,
    "na_serie_b": 59,
    "na_serie_b_de": "Volante",
    "jogadores": [
     {
      "jogador": "Matheus Trindade",
      "clube": "Operário-PR",
      "id_tm": "395060",
      "pk_app": "Matheus Trindade - Operário PR - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Volante",
      "posicao_wy": "DMF",
      "idade": 30.0,
      "minutos": 2067.0,
      "jogos": 26.0,
      "fatia_pct": 75.9,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "5",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Foguinho",
      "clube": "São Bernardo",
      "id_tm": "268572",
      "pk_app": "Foguinho - São Bernardo FC - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Volante",
      "posicao_wy": "RDMF",
      "idade": 34.0,
      "minutos": 1914.0,
      "jogos": 23.0,
      "fatia_pct": 72.9,
      "temporadas_com_dado": "2",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "4",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Filipe Machado",
      "clube": "Goiás",
      "id_tm": "520629",
      "pk_app": "Filipe Machado - Goiás - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Volante",
      "posicao_wy": "LDMF",
      "idade": 30.0,
      "minutos": 1855.0,
      "jogos": 21.0,
      "fatia_pct": 68.7,
      "temporadas_com_dado": "2",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": false,
      "atende_perfil": false,
      "violados": "2",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Léo Naldi",
      "clube": "Novorizontino",
      "id_tm": "859135",
      "pk_app": "Léo Naldi - Grêmio Novorizontino - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Volante",
      "posicao_wy": "LDMF",
      "idade": 25.0,
      "minutos": 1795.0,
      "jogos": 23.0,
      "fatia_pct": 64.0,
      "temporadas_com_dado": "2",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": false,
      "atende_perfil": false,
      "violados": "5",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Zé Ricardo",
      "clube": "Avaí",
      "id_tm": "476336",
      "pk_app": "Zé Ricardo - Avaí - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Volante",
      "posicao_wy": "RDMF",
      "idade": 30.0,
      "minutos": 1697.0,
      "jogos": 20.0,
      "fatia_pct": 61.2,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "5",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Igor Henrique",
      "clube": "Atlético-GO",
      "id_tm": "",
      "pk_app": "Igor Henrique - Atlético GO - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Volante",
      "posicao_wy": "RDMF",
      "idade": 34.0,
      "minutos": 715.0,
      "jogos": 13.0,
      "fatia_pct": 26.8,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": false,
      "atende_perfil": false,
      "violados": "0",
      "indicadores_com_dado": "0"
     }
    ]
   },
   {
    "posicao": "Médio",
    "ficha_de": "Meia",
    "quantos": 6,
    "com_a_ficha_inteira": 0,
    "com_contrato_confirmado": 4,
    "na_serie_b": 165,
    "na_serie_b_de": "Meia",
    "jogadores": [
     {
      "jogador": "Pedro Castro",
      "clube": "CRB",
      "id_tm": "214312",
      "pk_app": "Pedro Castro - CRB - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Meia",
      "posicao_wy": "RCMF",
      "idade": 33.0,
      "minutos": 2179.0,
      "jogos": 26.0,
      "fatia_pct": 80.3,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "2",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Crystopher",
      "clube": "CRB",
      "id_tm": "730982",
      "pk_app": "Crystopher - CRB - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Meia",
      "posicao_wy": "RCMF",
      "idade": 28.0,
      "minutos": 2138.0,
      "jogos": 23.0,
      "fatia_pct": 78.8,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": false,
      "atende_perfil": false,
      "violados": "3",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Rafael Gava",
      "clube": "Botafogo-SP",
      "id_tm": "411563",
      "pk_app": "Rafael Gava - Botafogo SP - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Meia",
      "posicao_wy": "LCMF",
      "idade": 33.0,
      "minutos": 1987.0,
      "jogos": 25.0,
      "fatia_pct": 72.7,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "3",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Danielzinho",
      "clube": "CRB",
      "id_tm": "",
      "pk_app": "Danielzinho - CRB - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Meia",
      "posicao_wy": "LCMF",
      "idade": 30.0,
      "minutos": 1875.0,
      "jogos": 25.0,
      "fatia_pct": 69.1,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": false,
      "atende_perfil": false,
      "violados": "2",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "André Lima",
      "clube": "Ponte Preta",
      "id_tm": "740299",
      "pk_app": "André Lima - Ponte Preta - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Meia",
      "posicao_wy": "RCMF",
      "idade": 26.0,
      "minutos": 1691.0,
      "jogos": 19.0,
      "fatia_pct": 67.5,
      "temporadas_com_dado": "2",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "3",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Eduardo",
      "clube": "Criciúma",
      "id_tm": "540541",
      "pk_app": "Eduardo - Criciúma - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Meia",
      "posicao_wy": "RCMF",
      "idade": 29.0,
      "minutos": 1239.0,
      "jogos": 17.0,
      "fatia_pct": 47.5,
      "temporadas_com_dado": "2",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "2",
      "indicadores_com_dado": "6"
     }
    ]
   },
   {
    "posicao": "Meia ofensivo",
    "ficha_de": "Meia",
    "quantos": 7,
    "com_a_ficha_inteira": 0,
    "com_contrato_confirmado": 7,
    "na_serie_b": 165,
    "na_serie_b_de": "Meia",
    "jogadores": [
     {
      "jogador": "Élvis",
      "clube": "Ponte Preta",
      "id_tm": "76135",
      "pk_app": "Élvis - Ponte Preta - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Meia",
      "posicao_wy": "AMF",
      "idade": 35.0,
      "minutos": 1505.0,
      "jogos": 19.0,
      "fatia_pct": 60.1,
      "temporadas_com_dado": "2",
      "lesao_dias": 1.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "4",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Lourenço",
      "clube": "Goiás",
      "id_tm": "515068",
      "pk_app": "Lourenço - Goiás - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Meia",
      "posicao_wy": "AMF",
      "idade": 29.0,
      "minutos": 1435.0,
      "jogos": 20.0,
      "fatia_pct": 53.1,
      "temporadas_com_dado": "2",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "3",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Vinícius Paiva",
      "clube": "Novorizontino",
      "id_tm": "689561",
      "pk_app": "Vinícius Paiva - Grêmio Novorizontino - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Meia",
      "posicao_wy": "LAMF",
      "idade": 25.0,
      "minutos": 1342.0,
      "jogos": 20.0,
      "fatia_pct": 47.8,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "2",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Victor Andrade",
      "clube": "Náutico",
      "id_tm": "203323",
      "pk_app": "Victor Andrade - Náutico - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Meia",
      "posicao_wy": "LAMF",
      "idade": 30.0,
      "minutos": 1054.0,
      "jogos": 19.0,
      "fatia_pct": 39.2,
      "temporadas_com_dado": "2",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "3",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Gegé",
      "clube": "Goiás",
      "id_tm": "299596",
      "pk_app": "Gegé - Goiás - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Meia",
      "posicao_wy": "LAMF",
      "idade": 32.0,
      "minutos": 1015.0,
      "jogos": 17.0,
      "fatia_pct": 37.6,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "3",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Bruno José",
      "clube": "Atlético-GO",
      "id_tm": "644210",
      "pk_app": "Bruno José - Atlético GO - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Meia",
      "posicao_wy": "RAMF",
      "idade": 28.0,
      "minutos": 960.0,
      "jogos": 21.0,
      "fatia_pct": 36.0,
      "temporadas_com_dado": "2",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "3",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Júnior Todinho",
      "clube": "Náutico",
      "id_tm": "518080",
      "pk_app": "Júnior Todinho - Náutico - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Meia",
      "posicao_wy": "RAMF",
      "idade": 32.0,
      "minutos": 710.0,
      "jogos": 14.0,
      "fatia_pct": 26.4,
      "temporadas_com_dado": "3",
      "lesao_dias": 26.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "0",
      "indicadores_com_dado": "0"
     }
    ]
   },
   {
    "posicao": "Extremo",
    "ficha_de": "Extremo",
    "quantos": 6,
    "com_a_ficha_inteira": 0,
    "com_contrato_confirmado": 5,
    "na_serie_b": 61,
    "na_serie_b_de": "Extremo",
    "jogadores": [
     {
      "jogador": "Dadá Belmonte",
      "clube": "CRB",
      "id_tm": "546253",
      "pk_app": "Dadá Belmonte - CRB - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Extremo",
      "posicao_wy": "LW",
      "idade": 29.0,
      "minutos": 2285.0,
      "jogos": 25.0,
      "fatia_pct": 84.3,
      "temporadas_com_dado": "2",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "4",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Rómulo Otero",
      "clube": "Criciúma",
      "id_tm": "177680",
      "pk_app": "Rómulo Otero - Criciúma - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Venezuela",
      "setor": "Extremo",
      "posicao_wy": "RWF",
      "idade": 33.0,
      "minutos": 1477.0,
      "jogos": 23.0,
      "fatia_pct": 56.7,
      "temporadas_com_dado": "2",
      "lesao_dias": 0.0,
      "estrangeiro": true,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "2",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Aylon",
      "clube": "Operário-PR",
      "id_tm": "329845",
      "pk_app": "Aylon - Operário PR - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Extremo",
      "posicao_wy": "LWF",
      "idade": 34.0,
      "minutos": 1431.0,
      "jogos": 23.0,
      "fatia_pct": 52.6,
      "temporadas_com_dado": "2",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "4",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Paulinho Moccelin",
      "clube": "Londrina",
      "id_tm": "282502",
      "pk_app": "Paulinho Moccelin - Londrina - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Extremo",
      "posicao_wy": "LW",
      "idade": 32.0,
      "minutos": 1117.0,
      "jogos": 21.0,
      "fatia_pct": 39.9,
      "temporadas_com_dado": "2",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "5",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Douglas Baggio",
      "clube": "CRB",
      "id_tm": "191872",
      "pk_app": "Douglas Baggio - CRB - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Extremo",
      "posicao_wy": "RW",
      "idade": 31.0,
      "minutos": 851.0,
      "jogos": 20.0,
      "fatia_pct": 31.4,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "0",
      "indicadores_com_dado": "0"
     },
     {
      "jogador": "Welliton Matheus",
      "clube": "Fortaleza",
      "id_tm": "",
      "pk_app": null,
      "motivo_sem_par": "não achei este nome na base do app",
      "pais_de_nascimento": "Brazil",
      "setor": "Extremo",
      "posicao_wy": "RW",
      "idade": 26.0,
      "minutos": 703.0,
      "jogos": 19.0,
      "fatia_pct": 25.6,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": false,
      "atende_perfil": false,
      "violados": "0",
      "indicadores_com_dado": "0"
     }
    ]
   },
   {
    "posicao": "Atacante",
    "ficha_de": "Atacante",
    "quantos": 8,
    "com_a_ficha_inteira": 2,
    "com_contrato_confirmado": 6,
    "na_serie_b": 82,
    "na_serie_b_de": "Atacante",
    "jogadores": [
     {
      "jogador": "Robson",
      "clube": "Novorizontino",
      "id_tm": "161188",
      "pk_app": "Robson - Grêmio Novorizontino - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Atacante",
      "posicao_wy": "CF",
      "idade": 35.0,
      "minutos": 2272.0,
      "jogos": 26.0,
      "fatia_pct": 81.0,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "2",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Waguininho",
      "clube": "Criciúma",
      "id_tm": "346923",
      "pk_app": "Waguininho - Criciúma - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Atacante",
      "posicao_wy": "CF",
      "idade": 36.0,
      "minutos": 1881.0,
      "jogos": 25.0,
      "fatia_pct": 72.2,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "3",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Gustavo Coutinho",
      "clube": "Atlético-GO",
      "id_tm": "612340",
      "pk_app": "Gustavo Coutinho - Atlético GO - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Atacante",
      "posicao_wy": "CF",
      "idade": 27.0,
      "minutos": 1728.0,
      "jogos": 22.0,
      "fatia_pct": 64.9,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": false,
      "atende_perfil": false,
      "violados": "2",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Hygor",
      "clube": "Botafogo-SP",
      "id_tm": "419474",
      "pk_app": "Hygor - Botafogo SP - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Atacante",
      "posicao_wy": "CF",
      "idade": 34.0,
      "minutos": 1584.0,
      "jogos": 20.0,
      "fatia_pct": 58.0,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "1",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "William Pottker",
      "clube": "Londrina",
      "id_tm": "199472",
      "pk_app": "William Pottker - Londrina - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Atacante",
      "posicao_wy": "CF",
      "idade": 32.0,
      "minutos": 1425.0,
      "jogos": 19.0,
      "fatia_pct": 50.9,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": true,
      "violados": "0",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Rodrigo Rodrigues",
      "clube": "Cuiabá",
      "id_tm": "537928",
      "pk_app": "Rodrigo Rodrigues - Cuiabá - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Atacante",
      "posicao_wy": "CF",
      "idade": 26.0,
      "minutos": 1418.0,
      "jogos": 24.0,
      "fatia_pct": 52.5,
      "temporadas_com_dado": "3",
      "lesao_dias": 120.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": true,
      "violados": "0",
      "indicadores_com_dado": "4"
     },
     {
      "jogador": "Anselmo Ramon",
      "clube": "Goiás",
      "id_tm": "118007",
      "pk_app": "Anselmo Ramon - Goiás - Brasil B",
      "motivo_sem_par": null,
      "pais_de_nascimento": "Brazil",
      "setor": "Atacante",
      "posicao_wy": "CF",
      "idade": 38.0,
      "minutos": 1331.0,
      "jogos": 22.0,
      "fatia_pct": 49.3,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": true,
      "atende_perfil": false,
      "violados": "2",
      "indicadores_com_dado": "6"
     },
     {
      "jogador": "Willian",
      "clube": "América-MG",
      "id_tm": "",
      "pk_app": null,
      "motivo_sem_par": "homônimo sem desempate: Grêmio, Guarani",
      "pais_de_nascimento": "Brazil",
      "setor": "Atacante",
      "posicao_wy": "CF",
      "idade": 39.0,
      "minutos": 1234.0,
      "jogos": 22.0,
      "fatia_pct": 46.0,
      "temporadas_com_dado": "3",
      "lesao_dias": 0.0,
      "estrangeiro": false,
      "contrato_confirmado": false,
      "atende_perfil": false,
      "violados": "3",
      "indicadores_com_dado": "6"
     }
    ]
   }
  ]
 },
 "treinadores": {
  "criterio": "ordenado pelo PISO — a pior passagem do treinador —, porque é o único critério que sobreviveu a um teste de repetição (T02). A média premia quem teve uma passagem boa em clube rico.",
  "premissas_que_falharam": {
   "T02": "histórico de G4 não se transfere entre clubes",
   "T03": "o perfil de jogo não é traço do treinador, e o time não muda quando ele chega"
  },
  "min_rodadas_total": 30,
  "lista": [
   {
    "treinador": "Paulo Pezzolano",
    "passagens": 1,
    "clubes": 1,
    "rodadas": 38,
    "pct_g4_medio": 89.5,
    "pct_g4_pior": 89.5,
    "ppj": 2.05,
    "indice_medio": 56.1,
    "indice_pior": 56.1,
    "posto_valor_mediano": 3,
    "passagens_detalhe": [
     {
      "clube": "Cruzeiro",
      "temporada": "2022",
      "rodadas": 38,
      "pct_g4": 89.5,
      "ppj": 2.05,
      "indice_perfil": 56.1,
      "posto_valor": 3
     }
    ]
   },
   {
    "treinador": "Fábio Carille",
    "passagens": 1,
    "clubes": 1,
    "rodadas": 37,
    "pct_g4_medio": 89.2,
    "pct_g4_pior": 89.2,
    "ppj": 1.84,
    "indice_medio": 82.1,
    "indice_pior": 82.1,
    "posto_valor_mediano": 1,
    "passagens_detalhe": [
     {
      "clube": "Santos",
      "temporada": "2024",
      "rodadas": 37,
      "pct_g4": 89.2,
      "ppj": 1.84,
      "indice_perfil": 82.1,
      "posto_valor": 1
     }
    ]
   },
   {
    "treinador": "Eduardo Baptista",
    "passagens": 4,
    "clubes": 2,
    "rodadas": 134,
    "pct_g4_medio": 47.0,
    "pct_g4_pior": 37.5,
    "ppj": 1.69,
    "indice_medio": 70.1,
    "indice_pior": 56.1,
    "posto_valor_mediano": 9.0,
    "passagens_detalhe": [
     {
      "clube": "Novorizontino",
      "temporada": "2023",
      "rodadas": 38,
      "pct_g4": 50.0,
      "ppj": 1.66,
      "indice_perfil": 89.6,
      "posto_valor": 10
     },
     {
      "clube": "Novorizontino",
      "temporada": "2024",
      "rodadas": 38,
      "pct_g4": 52.6,
      "ppj": 1.68,
      "indice_perfil": 56.1,
      "posto_valor": 16
     },
     {
      "clube": "Criciúma",
      "temporada": "2025",
      "rodadas": 32,
      "pct_g4": 37.5,
      "ppj": 1.75,
      "indice_perfil": 75.0,
      "posto_valor": 8
     },
     {
      "clube": "Criciúma",
      "temporada": "2026",
      "rodadas": 26,
      "pct_g4": 46.2,
      "ppj": 1.69,
      "indice_perfil": 59.6,
      "posto_valor": 5
     }
    ]
   },
   {
    "treinador": "Thiago Carpini",
    "passagens": 2,
    "clubes": 2,
    "rodadas": 51,
    "pct_g4_medio": 33.3,
    "pct_g4_pior": 31.2,
    "ppj": 1.82,
    "indice_medio": 49.1,
    "indice_pior": 48.2,
    "posto_valor_mediano": 3.0,
    "passagens_detalhe": [
     {
      "clube": "Juventude",
      "temporada": "2023",
      "rodadas": 32,
      "pct_g4": 31.2,
      "ppj": 1.94,
      "indice_perfil": 50.0,
      "posto_valor": 5
     },
     {
      "clube": "Fortaleza",
      "temporada": "2026",
      "rodadas": 19,
      "pct_g4": 36.8,
      "ppj": 1.63,
      "indice_perfil": 48.2,
      "posto_valor": 1
     }
    ]
   },
   {
    "treinador": "Cauan de Almeida",
    "passagens": 2,
    "clubes": 2,
    "rodadas": 38,
    "pct_g4_medio": 47.4,
    "pct_g4_pior": 26.7,
    "ppj": 1.26,
    "indice_medio": 38.2,
    "indice_pior": 13.6,
    "posto_valor_mediano": 9.5,
    "passagens_detalhe": [
     {
      "clube": "América-MG",
      "temporada": "2024",
      "rodadas": 23,
      "pct_g4": 60.9,
      "ppj": 1.52,
      "indice_perfil": 62.9,
      "posto_valor": 5
     },
     {
      "clube": "Avaí",
      "temporada": "2026",
      "rodadas": 15,
      "pct_g4": 26.7,
      "ppj": 0.87,
      "indice_perfil": 13.6,
      "posto_valor": 14
     }
    ]
   },
   {
    "treinador": "Odair Hellmann",
    "passagens": 1,
    "clubes": 1,
    "rodadas": 30,
    "pct_g4_medio": 20.0,
    "pct_g4_pior": 20.0,
    "ppj": 1.83,
    "indice_medio": 85.7,
    "indice_pior": 85.7,
    "posto_valor_mediano": 1,
    "passagens_detalhe": [
     {
      "clube": "Athletico-PR",
      "temporada": "2025",
      "rodadas": 30,
      "pct_g4": 20.0,
      "ppj": 1.83,
      "indice_perfil": 85.7,
      "posto_valor": 1
     }
    ]
   },
   {
    "treinador": "Jair Ventura",
    "passagens": 2,
    "clubes": 2,
    "rodadas": 46,
    "pct_g4_medio": 23.9,
    "pct_g4_pior": 18.5,
    "ppj": 1.61,
    "indice_medio": 64.7,
    "indice_pior": 59.3,
    "posto_valor_mediano": 8.5,
    "passagens_detalhe": [
     {
      "clube": "Atlético-GO",
      "temporada": "2023",
      "rodadas": 19,
      "pct_g4": 31.6,
      "ppj": 1.95,
      "indice_perfil": 59.3,
      "posto_valor": 2
     },
     {
      "clube": "Avaí",
      "temporada": "2025",
      "rodadas": 27,
      "pct_g4": 18.5,
      "ppj": 1.37,
      "indice_perfil": 70.0,
      "posto_valor": 15
     }
    ]
   },
   {
    "treinador": "Claudio Tencati",
    "passagens": 3,
    "clubes": 2,
    "rodadas": 103,
    "pct_g4_medio": 23.3,
    "pct_g4_pior": 5.3,
    "ppj": 1.46,
    "indice_medio": 63.0,
    "indice_pior": 54.6,
    "posto_valor_mediano": 16,
    "passagens_detalhe": [
     {
      "clube": "Criciúma",
      "temporada": "2022",
      "rodadas": 38,
      "pct_g4": 5.3,
      "ppj": 1.47,
      "indice_perfil": 70.4,
      "posto_valor": 16
     },
     {
      "clube": "Criciúma",
      "temporada": "2023",
      "rodadas": 38,
      "pct_g4": 50.0,
      "ppj": 1.68,
      "indice_perfil": 54.6,
      "posto_valor": 12
     },
     {
      "clube": "Botafogo-SP",
      "temporada": "2026",
      "rodadas": 27,
      "pct_g4": 11.1,
      "ppj": 1.15,
      "indice_perfil": 63.9,
      "posto_valor": 16
     }
    ]
   },
   {
    "treinador": "Adilson Batista",
    "passagens": 2,
    "clubes": 2,
    "rodadas": 50,
    "pct_g4_medio": 6.0,
    "pct_g4_pior": 2.7,
    "ppj": 1.4,
    "indice_medio": 31.2,
    "indice_pior": 24.6,
    "posto_valor_mediano": 15.5,
    "passagens_detalhe": [
     {
      "clube": "Londrina",
      "temporada": "2022",
      "rodadas": 37,
      "pct_g4": 2.7,
      "ppj": 1.41,
      "indice_perfil": 24.6,
      "posto_valor": 15
     },
     {
      "clube": "Botafogo-SP",
      "temporada": "2023",
      "rodadas": 13,
      "pct_g4": 15.4,
      "ppj": 1.38,
      "indice_perfil": 37.9,
      "posto_valor": 16
     }
    ]
   },
   {
    "treinador": "Enderson Moreira",
    "passagens": 6,
    "clubes": 5,
    "rodadas": 122,
    "pct_g4_medio": 46.7,
    "pct_g4_pior": 0.0,
    "ppj": 1.52,
    "indice_medio": 76.2,
    "indice_pior": 60.0,
    "posto_valor_mediano": 6.5,
    "passagens_detalhe": [
     {
      "clube": "Bahia",
      "temporada": "2022",
      "rodadas": 17,
      "pct_g4": 100.0,
      "ppj": 1.41,
      "indice_perfil": 90.7,
      "posto_valor": 4
     },
     {
      "clube": "Sport",
      "temporada": "2023",
      "rodadas": 37,
      "pct_g4": 75.7,
      "ppj": 1.62,
      "indice_perfil": 73.6,
      "posto_valor": 4
     },
     {
      "clube": "Avaí",
      "temporada": "2024",
      "rodadas": 19,
      "pct_g4": 0.0,
      "ppj": 1.47,
      "indice_perfil": 60.0,
      "posto_valor": 8
     },
     {
      "clube": "América-MG",
      "temporada": "2025",
      "rodadas": 11,
      "pct_g4": 0.0,
      "ppj": 0.73,
      "indice_perfil": 62.9,
      "posto_valor": 5
     },
     {
      "clube": "Novorizontino",
      "temporada": "2025",
      "rodadas": 15,
      "pct_g4": 20.0,
      "ppj": 1.6,
      "indice_perfil": 80.0,
      "posto_valor": 14
     },
     {
      "clube": "Novorizontino",
      "temporada": "2026",
      "rodadas": 23,
      "pct_g4": 39.1,
      "ppj": 1.83,
      "indice_perfil": 90.0,
      "posto_valor": 8
     }
    ]
   },
   {
    "treinador": "Vagner Mancini",
    "passagens": 4,
    "clubes": 2,
    "rodadas": 77,
    "pct_g4_medio": 37.7,
    "pct_g4_pior": 0.0,
    "ppj": 1.57,
    "indice_medio": 66.1,
    "indice_pior": 60.0,
    "posto_valor_mediano": 3.5,
    "passagens_detalhe": [
     {
      "clube": "Ceará",
      "temporada": "2023",
      "rodadas": 13,
      "pct_g4": 0.0,
      "ppj": 1.15,
      "indice_perfil": 66.4,
      "posto_valor": 1
     },
     {
      "clube": "Ceará",
      "temporada": "2024",
      "rodadas": 12,
      "pct_g4": 0.0,
      "ppj": 1.33,
      "indice_perfil": 68.6,
      "posto_valor": 4
     },
     {
      "clube": "Goiás",
      "temporada": "2024",
      "rodadas": 20,
      "pct_g4": 0.0,
      "ppj": 1.9,
      "indice_perfil": 60.0,
      "posto_valor": 3
     },
     {
      "clube": "Goiás",
      "temporada": "2025",
      "rodadas": 32,
      "pct_g4": 90.6,
      "ppj": 1.62,
      "indice_perfil": 69.3,
      "posto_valor": 10
     }
    ]
   },
   {
    "treinador": "Eduardo Barros",
    "passagens": 2,
    "clubes": 1,
    "rodadas": 40,
    "pct_g4_medio": 0.0,
    "pct_g4_pior": 0.0,
    "ppj": 1.42,
    "indice_medio": 63.2,
    "indice_pior": 57.9,
    "posto_valor_mediano": 8.5,
    "passagens_detalhe": [
     {
      "clube": "Cuiabá",
      "temporada": "2025",
      "rodadas": 17,
      "pct_g4": 0.0,
      "ppj": 1.35,
      "indice_perfil": 57.9,
      "posto_valor": 6
     },
     {
      "clube": "Cuiabá",
      "temporada": "2026",
      "rodadas": 23,
      "pct_g4": 0.0,
      "ppj": 1.48,
      "indice_perfil": 68.6,
      "posto_valor": 11
     }
    ]
   },
   {
    "treinador": "Marcinho",
    "passagens": 1,
    "clubes": 1,
    "rodadas": 30,
    "pct_g4_medio": 0.0,
    "pct_g4_pior": 0.0,
    "ppj": 1.17,
    "indice_medio": 55.0,
    "indice_pior": 55.0,
    "posto_valor_mediano": 20,
    "passagens_detalhe": [
     {
      "clube": "Ituano",
      "temporada": "2023",
      "rodadas": 30,
      "pct_g4": 0.0,
      "ppj": 1.17,
      "indice_perfil": 55.0,
      "posto_valor": 20
     }
    ]
   },
   {
    "treinador": "Alex",
    "passagens": 2,
    "clubes": 2,
    "rodadas": 53,
    "pct_g4_medio": 1.9,
    "pct_g4_pior": 0.0,
    "ppj": 1.34,
    "indice_medio": 52.3,
    "indice_pior": 45.4,
    "posto_valor_mediano": 8.0,
    "passagens_detalhe": [
     {
      "clube": "Operário-PR",
      "temporada": "2025",
      "rodadas": 26,
      "pct_g4": 0.0,
      "ppj": 1.31,
      "indice_perfil": 59.3,
      "posto_valor": 9
     },
     {
      "clube": "Athletic",
      "temporada": "2026",
      "rodadas": 27,
      "pct_g4": 3.7,
      "ppj": 1.37,
      "indice_perfil": 45.4,
      "posto_valor": 7
     }
    ]
   },
   {
    "treinador": "Alberto Valentim",
    "passagens": 4,
    "clubes": 4,
    "rodadas": 71,
    "pct_g4_medio": 2.8,
    "pct_g4_pior": 0.0,
    "ppj": 1.1,
    "indice_medio": 44.3,
    "indice_pior": 40.0,
    "posto_valor_mediano": 7.5,
    "passagens_detalhe": [
     {
      "clube": "CSA",
      "temporada": "2022",
      "rodadas": 10,
      "pct_g4": 0.0,
      "ppj": 0.7,
      "indice_perfil": 44.3,
      "posto_valor": 10
     },
     {
      "clube": "Atlético-GO",
      "temporada": "2023",
      "rodadas": 12,
      "pct_g4": 16.7,
      "ppj": 1.25,
      "indice_perfil": 48.6,
      "posto_valor": 2
     },
     {
      "clube": "Ituano",
      "temporada": "2024",
      "rodadas": 32,
      "pct_g4": 0.0,
      "ppj": 0.97,
      "indice_perfil": 44.3,
      "posto_valor": 15
     },
     {
      "clube": "América-MG",
      "temporada": "2025",
      "rodadas": 17,
      "pct_g4": 0.0,
      "ppj": 1.47,
      "indice_perfil": 40.0,
      "posto_valor": 5
     }
    ]
   },
   {
    "treinador": "Mozart",
    "passagens": 7,
    "clubes": 6,
    "rodadas": 170,
    "pct_g4_medio": 32.9,
    "pct_g4_pior": 0.0,
    "ppj": 1.61,
    "indice_medio": 59.2,
    "indice_pior": 37.1,
    "posto_valor_mediano": 7,
    "passagens_detalhe": [
     {
      "clube": "CSA",
      "temporada": "2022",
      "rodadas": 12,
      "pct_g4": 0.0,
      "ppj": 1.08,
      "indice_perfil": 37.1,
      "posto_valor": 10
     },
     {
      "clube": "Guarani",
      "temporada": "2022",
      "rodadas": 23,
      "pct_g4": 0.0,
      "ppj": 1.65,
      "indice_perfil": 57.9,
      "posto_valor": 12
     },
     {
      "clube": "Mirassol",
      "temporada": "2023",
      "rodadas": 35,
      "pct_g4": 0.0,
      "ppj": 1.63,
      "indice_perfil": 70.7,
      "posto_valor": 7
     },
     {
      "clube": "Mirassol",
      "temporada": "2024",
      "rodadas": 38,
      "pct_g4": 55.3,
      "ppj": 1.76,
      "indice_perfil": 76.8,
      "posto_valor": 9
     },
     {
      "clube": "Coritiba",
      "temporada": "2025",
      "rodadas": 38,
      "pct_g4": 86.8,
      "ppj": 1.79,
      "indice_perfil": 64.6,
      "posto_valor": 4
     },
     {
      "clube": "Ceará",
      "temporada": "2026",
      "rodadas": 11,
      "pct_g4": 18.2,
      "ppj": 1.18,
      "indice_perfil": 62.1,
      "posto_valor": 4
     },
     {
      "clube": "Goiás",
      "temporada": "2026",
      "rodadas": 13,
      "pct_g4": 0.0,
      "ppj": 1.38,
      "indice_perfil": 45.0,
      "posto_valor": 6
     }
    ]
   },
   {
    "treinador": "Hélio dos Anjos",
    "passagens": 4,
    "clubes": 4,
    "rodadas": 101,
    "pct_g4_medio": 4.0,
    "pct_g4_pior": 0.0,
    "ppj": 1.29,
    "indice_medio": 45.2,
    "indice_pior": 33.6,
    "posto_valor_mediano": 10.5,
    "passagens_detalhe": [
     {
      "clube": "Ponte Preta",
      "temporada": "2022",
      "rodadas": 38,
      "pct_g4": 0.0,
      "ppj": 1.29,
      "indice_perfil": 46.1,
      "posto_valor": 5
     },
     {
      "clube": "CRB",
      "temporada": "2024",
      "rodadas": 11,
      "pct_g4": 0.0,
      "ppj": 1.55,
      "indice_perfil": 33.6,
      "posto_valor": 11
     },
     {
      "clube": "Paysandu",
      "temporada": "2024",
      "rodadas": 25,
      "pct_g4": 0.0,
      "ppj": 1.08,
      "indice_perfil": 41.4,
      "posto_valor": 10
     },
     {
      "clube": "Náutico",
      "temporada": "2026",
      "rodadas": 27,
      "pct_g4": 14.8,
      "ppj": 1.37,
      "indice_perfil": 59.6,
      "posto_valor": 20
     }
    ]
   },
   {
    "treinador": "Léo Condé",
    "passagens": 3,
    "clubes": 3,
    "rodadas": 101,
    "pct_g4_medio": 38.6,
    "pct_g4_pior": 0.0,
    "ppj": 1.73,
    "indice_medio": 67.6,
    "indice_pior": 32.5,
    "posto_valor_mediano": 9,
    "passagens_detalhe": [
     {
      "clube": "Sampaio Corrêa",
      "temporada": "2022",
      "rodadas": 38,
      "pct_g4": 0.0,
      "ppj": 1.53,
      "indice_perfil": 32.5,
      "posto_valor": 18
     },
     {
      "clube": "Vitória",
      "temporada": "2023",
      "rodadas": 38,
      "pct_g4": 94.7,
      "ppj": 1.89,
      "indice_perfil": 83.2,
      "posto_valor": 9
     },
     {
      "clube": "Ceará",
      "temporada": "2024",
      "rodadas": 25,
      "pct_g4": 12.0,
      "ppj": 1.8,
      "indice_perfil": 87.1,
      "posto_valor": 4
     }
    ]
   },
   {
    "treinador": "Rogério Corrêa",
    "passagens": 1,
    "clubes": 1,
    "rodadas": 38,
    "pct_g4_medio": 0.0,
    "pct_g4_pior": 0.0,
    "ppj": 0.95,
    "indice_medio": 32.5,
    "indice_pior": 32.5,
    "posto_valor_mediano": 20,
    "passagens_detalhe": [
     {
      "clube": "Volta Redonda",
      "temporada": "2025",
      "rodadas": 38,
      "pct_g4": 0.0,
      "ppj": 0.95,
      "indice_perfil": 32.5,
      "posto_valor": 20
     }
    ]
   },
   {
    "treinador": "Gilmar Dal Pozzo",
    "passagens": 7,
    "clubes": 3,
    "rodadas": 116,
    "pct_g4_medio": 26.7,
    "pct_g4_pior": 0.0,
    "ppj": 1.46,
    "indice_medio": 44.5,
    "indice_pior": 29.3,
    "posto_valor_mediano": 8,
    "passagens_detalhe": [
     {
      "clube": "Chapecoense",
      "temporada": "2022",
      "rodadas": 11,
      "pct_g4": 0.0,
      "ppj": 1.45,
      "indice_perfil": 57.1,
      "posto_valor": 9
     },
     {
      "clube": "Sport",
      "temporada": "2022",
      "rodadas": 14,
      "pct_g4": 64.3,
      "ppj": 1.5,
      "indice_perfil": 42.1,
      "posto_valor": 6
     },
     {
      "clube": "Chapecoense",
      "temporada": "2023",
      "rodadas": 11,
      "pct_g4": 0.0,
      "ppj": 0.91,
      "indice_perfil": 34.3,
      "posto_valor": 6
     },
     {
      "clube": "Avaí",
      "temporada": "2024",
      "rodadas": 16,
      "pct_g4": 37.5,
      "ppj": 1.5,
      "indice_perfil": 51.4,
      "posto_valor": 8
     },
     {
      "clube": "Chapecoense",
      "temporada": "2024",
      "rodadas": 15,
      "pct_g4": 0.0,
      "ppj": 1.6,
      "indice_perfil": 29.3,
      "posto_valor": 14
     },
     {
      "clube": "Chapecoense",
      "temporada": "2025",
      "rodadas": 38,
      "pct_g4": 42.1,
      "ppj": 1.63,
      "indice_perfil": 44.6,
      "posto_valor": 18
     },
     {
      "clube": "Sport",
      "temporada": "2026",
      "rodadas": 11,
      "pct_g4": 0.0,
      "ppj": 1.18,
      "indice_perfil": 52.9,
      "posto_valor": 2
     }
    ]
   },
   {
    "treinador": "Umberto Louzer",
    "passagens": 4,
    "clubes": 4,
    "rodadas": 77,
    "pct_g4_medio": 26.0,
    "pct_g4_pior": 0.0,
    "ppj": 1.33,
    "indice_medio": 43.0,
    "indice_pior": 28.6,
    "posto_valor_mediano": 14.0,
    "passagens_detalhe": [
     {
      "clube": "Guarani",
      "temporada": "2023",
      "rodadas": 26,
      "pct_g4": 15.4,
      "ppj": 1.58,
      "indice_perfil": 52.1,
      "posto_valor": 8
     },
     {
      "clube": "Chapecoense",
      "temporada": "2024",
      "rodadas": 17,
      "pct_g4": 17.6,
      "ppj": 1.06,
      "indice_perfil": 34.3,
      "posto_valor": 14
     },
     {
      "clube": "Novorizontino",
      "temporada": "2025",
      "rodadas": 22,
      "pct_g4": 59.1,
      "ppj": 1.59,
      "indice_perfil": 57.1,
      "posto_valor": 14
     },
     {
      "clube": "América-MG",
      "temporada": "2026",
      "rodadas": 12,
      "pct_g4": 0.0,
      "ppj": 0.67,
      "indice_perfil": 28.6,
      "posto_valor": 18
     }
    ]
   },
   {
    "treinador": "Bruno Pivetti",
    "passagens": 3,
    "clubes": 3,
    "rodadas": 53,
    "pct_g4_medio": 9.4,
    "pct_g4_pior": 0.0,
    "ppj": 1.28,
    "indice_medio": 45.5,
    "indice_pior": 27.9,
    "posto_valor_mediano": 9,
    "passagens_detalhe": [
     {
      "clube": "Tombense",
      "temporada": "2022",
      "rodadas": 31,
      "pct_g4": 0.0,
      "ppj": 1.26,
      "indice_perfil": 27.9,
      "posto_valor": 20
     },
     {
      "clube": "Guarani",
      "temporada": "2023",
      "rodadas": 10,
      "pct_g4": 40.0,
      "ppj": 1.5,
      "indice_perfil": 63.6,
      "posto_valor": 8
     },
     {
      "clube": "Operário-PR",
      "temporada": "2025",
      "rodadas": 12,
      "pct_g4": 8.3,
      "ppj": 1.17,
      "indice_perfil": 45.0,
      "posto_valor": 9
     }
    ]
   },
   {
    "treinador": "Eduardo Barroca",
    "passagens": 4,
    "clubes": 3,
    "rodadas": 89,
    "pct_g4_medio": 6.7,
    "pct_g4_pior": 0.0,
    "ppj": 1.45,
    "indice_medio": 39.0,
    "indice_pior": 27.1,
    "posto_valor_mediano": 5.0,
    "passagens_detalhe": [
     {
      "clube": "Avaí",
      "temporada": "2023",
      "rodadas": 23,
      "pct_g4": 0.0,
      "ppj": 1.43,
      "indice_perfil": 27.1,
      "posto_valor": 3
     },
     {
      "clube": "Ceará",
      "temporada": "2023",
      "rodadas": 12,
      "pct_g4": 0.0,
      "ppj": 1.75,
      "indice_perfil": 33.6,
      "posto_valor": 1
     },
     {
      "clube": "CRB",
      "temporada": "2025",
      "rodadas": 38,
      "pct_g4": 15.8,
      "ppj": 1.47,
      "indice_perfil": 43.2,
      "posto_valor": 7
     },
     {
      "clube": "CRB",
      "temporada": "2026",
      "rodadas": 16,
      "pct_g4": 0.0,
      "ppj": 1.19,
      "indice_perfil": 52.1,
      "posto_valor": 9
     }
    ]
   },
   {
    "treinador": "Márcio Fernandes",
    "passagens": 3,
    "clubes": 2,
    "rodadas": 45,
    "pct_g4_medio": 0.0,
    "pct_g4_pior": 0.0,
    "ppj": 1.16,
    "indice_medio": 41.2,
    "indice_pior": 26.4,
    "posto_valor_mediano": 13,
    "passagens_detalhe": [
     {
      "clube": "Sampaio Corrêa",
      "temporada": "2023",
      "rodadas": 22,
      "pct_g4": 0.0,
      "ppj": 1.05,
      "indice_perfil": 26.4,
      "posto_valor": 17
     },
     {
      "clube": "Paysandu",
      "temporada": "2024",
      "rodadas": 13,
      "pct_g4": 0.0,
      "ppj": 1.77,
      "indice_perfil": 51.4,
      "posto_valor": 10
     },
     {
      "clube": "Paysandu",
      "temporada": "2025",
      "rodadas": 10,
      "pct_g4": 0.0,
      "ppj": 0.6,
      "indice_perfil": 45.7,
      "posto_valor": 13
     }
    ]
   },
   {
    "treinador": "Rafael Lacerda",
    "passagens": 3,
    "clubes": 3,
    "rodadas": 63,
    "pct_g4_medio": 7.9,
    "pct_g4_pior": 0.0,
    "ppj": 1.43,
    "indice_medio": 46.2,
    "indice_pior": 25.7,
    "posto_valor_mediano": 16,
    "passagens_detalhe": [
     {
      "clube": "Amazonas",
      "temporada": "2024",
      "rodadas": 31,
      "pct_g4": 0.0,
      "ppj": 1.42,
      "indice_perfil": 58.6,
      "posto_valor": 17
     },
     {
      "clube": "Atlético-GO",
      "temporada": "2025",
      "rodadas": 21,
      "pct_g4": 0.0,
      "ppj": 1.43,
      "indice_perfil": 25.7,
      "posto_valor": 2
     },
     {
      "clube": "Vila Nova",
      "temporada": "2025",
      "rodadas": 11,
      "pct_g4": 45.5,
      "ppj": 1.45,
      "indice_perfil": 54.3,
      "posto_valor": 16
     }
    ]
   },
   {
    "treinador": "Rafael Guanaes",
    "passagens": 2,
    "clubes": 2,
    "rodadas": 52,
    "pct_g4_medio": 5.8,
    "pct_g4_pior": 0.0,
    "ppj": 1.43,
    "indice_medio": 31.6,
    "indice_pior": 25.4,
    "posto_valor_mediano": 11.5,
    "passagens_detalhe": [
     {
      "clube": "Novorizontino",
      "temporada": "2022",
      "rodadas": 15,
      "pct_g4": 0.0,
      "ppj": 1.27,
      "indice_perfil": 37.9,
      "posto_valor": 11
     },
     {
      "clube": "Operário-PR",
      "temporada": "2024",
      "rodadas": 37,
      "pct_g4": 8.1,
      "ppj": 1.49,
      "indice_perfil": 25.4,
      "posto_valor": 12
     }
    ]
   },
   {
    "treinador": "Guto Ferreira",
    "passagens": 5,
    "clubes": 5,
    "rodadas": 81,
    "pct_g4_medio": 58.0,
    "pct_g4_pior": 0.0,
    "ppj": 1.72,
    "indice_medio": 50.1,
    "indice_pior": 24.3,
    "posto_valor_mediano": 4,
    "passagens_detalhe": [
     {
      "clube": "Bahia",
      "temporada": "2022",
      "rodadas": 14,
      "pct_g4": 100.0,
      "ppj": 1.79,
      "indice_perfil": 65.7,
      "posto_valor": 4
     },
     {
      "clube": "Ceará",
      "temporada": "2023",
      "rodadas": 11,
      "pct_g4": 0.0,
      "ppj": 1.27,
      "indice_perfil": 47.9,
      "posto_valor": 1
     },
     {
      "clube": "Cuiabá",
      "temporada": "2025",
      "rodadas": 21,
      "pct_g4": 28.6,
      "ppj": 1.48,
      "indice_perfil": 65.7,
      "posto_valor": 6
     },
     {
      "clube": "Remo",
      "temporada": "2025",
      "rodadas": 10,
      "pct_g4": 50.0,
      "ppj": 2.3,
      "indice_perfil": 24.3,
      "posto_valor": 3
     },
     {
      "clube": "Vila Nova",
      "temporada": "2026",
      "rodadas": 25,
      "pct_g4": 88.0,
      "ppj": 1.84,
      "indice_perfil": 47.1,
      "posto_valor": 10
     }
    ]
   },
   {
    "treinador": "Vinícius",
    "passagens": 2,
    "clubes": 2,
    "rodadas": 36,
    "pct_g4_medio": 0.0,
    "pct_g4_pior": 0.0,
    "ppj": 1.39,
    "indice_medio": 26.0,
    "indice_pior": 20.7,
    "posto_valor_mediano": 17.0,
    "passagens_detalhe": [
     {
      "clube": "Avaí",
      "temporada": "2025",
      "rodadas": 11,
      "pct_g4": 0.0,
      "ppj": 1.73,
      "indice_perfil": 31.4,
      "posto_valor": 15
     },
     {
      "clube": "Ferroviária",
      "temporada": "2025",
      "rodadas": 25,
      "pct_g4": 0.0,
      "ppj": 1.24,
      "indice_perfil": 20.7,
      "posto_valor": 19
     }
    ]
   },
   {
    "treinador": "Daniel Paulista",
    "passagens": 6,
    "clubes": 4,
    "rodadas": 120,
    "pct_g4_medio": 5.8,
    "pct_g4_pior": 0.0,
    "ppj": 1.43,
    "indice_medio": 42.3,
    "indice_pior": 16.4,
    "posto_valor_mediano": 6.5,
    "passagens_detalhe": [
     {
      "clube": "CRB",
      "temporada": "2022",
      "rodadas": 30,
      "pct_g4": 0.0,
      "ppj": 1.53,
      "indice_perfil": 30.0,
      "posto_valor": 7
     },
     {
      "clube": "CRB",
      "temporada": "2023",
      "rodadas": 30,
      "pct_g4": 0.0,
      "ppj": 1.73,
      "indice_perfil": 47.9,
      "posto_valor": 11
     },
     {
      "clube": "CRB",
      "temporada": "2024",
      "rodadas": 24,
      "pct_g4": 0.0,
      "ppj": 1.04,
      "indice_perfil": 25.0,
      "posto_valor": 11
     },
     {
      "clube": "Remo",
      "temporada": "2025",
      "rodadas": 10,
      "pct_g4": 40.0,
      "ppj": 1.7,
      "indice_perfil": 70.7,
      "posto_valor": 3
     },
     {
      "clube": "Ceará",
      "temporada": "2026",
      "rodadas": 12,
      "pct_g4": 0.0,
      "ppj": 1.17,
      "indice_perfil": 16.4,
      "posto_valor": 4
     },
     {
      "clube": "Goiás",
      "temporada": "2026",
      "rodadas": 14,
      "pct_g4": 21.4,
      "ppj": 1.29,
      "indice_perfil": 63.6,
      "posto_valor": 6
     }
    ]
   },
   {
    "treinador": "Marcelo Chamusca",
    "passagens": 2,
    "clubes": 2,
    "rodadas": 33,
    "pct_g4_medio": 0.0,
    "pct_g4_pior": 0.0,
    "ppj": 0.97,
    "indice_medio": 46.5,
    "indice_pior": 15.0,
    "posto_valor_mediano": 17.5,
    "passagens_detalhe": [
     {
      "clube": "Botafogo-SP",
      "temporada": "2023",
      "rodadas": 23,
      "pct_g4": 0.0,
      "ppj": 1.13,
      "indice_perfil": 15.0,
      "posto_valor": 16
     },
     {
      "clube": "Tombense",
      "temporada": "2023",
      "rodadas": 10,
      "pct_g4": 0.0,
      "ppj": 0.6,
      "indice_perfil": 77.9,
      "posto_valor": 19
     }
    ]
   },
   {
    "treinador": "Claudinei Oliveira",
    "passagens": 5,
    "clubes": 5,
    "rodadas": 88,
    "pct_g4_medio": 21.6,
    "pct_g4_pior": 0.0,
    "ppj": 1.4,
    "indice_medio": 51.7,
    "indice_pior": 14.3,
    "posto_valor_mediano": 13,
    "passagens_detalhe": [
     {
      "clube": "Operário-PR",
      "temporada": "2022",
      "rodadas": 19,
      "pct_g4": 5.3,
      "ppj": 1.05,
      "indice_perfil": 14.3,
      "posto_valor": 13
     },
     {
      "clube": "Sport",
      "temporada": "2022",
      "rodadas": 18,
      "pct_g4": 0.0,
      "ppj": 1.67,
      "indice_perfil": 87.1,
      "posto_valor": 6
     },
     {
      "clube": "Chapecoense",
      "temporada": "2023",
      "rodadas": 17,
      "pct_g4": 0.0,
      "ppj": 1.24,
      "indice_perfil": 51.4,
      "posto_valor": 6
     },
     {
      "clube": "Vila Nova",
      "temporada": "2023",
      "rodadas": 21,
      "pct_g4": 85.7,
      "ppj": 1.67,
      "indice_perfil": 66.4,
      "posto_valor": 14
     },
     {
      "clube": "Paysandu",
      "temporada": "2025",
      "rodadas": 13,
      "pct_g4": 0.0,
      "ppj": 1.31,
      "indice_perfil": 39.3,
      "posto_valor": 13
     }
    ]
   },
   {
    "treinador": "Márcio Zanardi",
    "passagens": 4,
    "clubes": 4,
    "rodadas": 59,
    "pct_g4_medio": 13.5,
    "pct_g4_pior": 0.0,
    "ppj": 0.98,
    "indice_medio": 32.6,
    "indice_pior": 12.9,
    "posto_valor_mediano": 15.0,
    "passagens_detalhe": [
     {
      "clube": "Botafogo-SP",
      "temporada": "2024",
      "rodadas": 10,
      "pct_g4": 0.0,
      "ppj": 1.3,
      "indice_perfil": 25.0,
      "posto_valor": 18
     },
     {
      "clube": "Goiás",
      "temporada": "2024",
      "rodadas": 18,
      "pct_g4": 44.4,
      "ppj": 1.39,
      "indice_perfil": 69.3,
      "posto_valor": 3
     },
     {
      "clube": "Amazonas",
      "temporada": "2025",
      "rodadas": 19,
      "pct_g4": 0.0,
      "ppj": 0.95,
      "indice_perfil": 23.2,
      "posto_valor": 12
     },
     {
      "clube": "Ponte Preta",
      "temporada": "2026",
      "rodadas": 12,
      "pct_g4": 0.0,
      "ppj": 0.17,
      "indice_perfil": 12.9,
      "posto_valor": 19
     }
    ]
   },
   {
    "treinador": "Allan Aal",
    "passagens": 6,
    "clubes": 6,
    "rodadas": 107,
    "pct_g4_medio": 0.0,
    "pct_g4_pior": 0.0,
    "ppj": 1.18,
    "indice_medio": 35.5,
    "indice_pior": 12.9,
    "posto_valor_mediano": 14.0,
    "passagens_detalhe": [
     {
      "clube": "Novorizontino",
      "temporada": "2022",
      "rodadas": 13,
      "pct_g4": 0.0,
      "ppj": 1.08,
      "indice_perfil": 50.0,
      "posto_valor": 11
     },
     {
      "clube": "Vila Nova",
      "temporada": "2022",
      "rodadas": 22,
      "pct_g4": 0.0,
      "ppj": 1.59,
      "indice_perfil": 47.9,
      "posto_valor": 14
     },
     {
      "clube": "ABC",
      "temporada": "2023",
      "rodadas": 19,
      "pct_g4": 0.0,
      "ppj": 0.79,
      "indice_perfil": 22.9,
      "posto_valor": 15
     },
     {
      "clube": "Guarani",
      "temporada": "2024",
      "rodadas": 20,
      "pct_g4": 0.0,
      "ppj": 1.1,
      "indice_perfil": 37.1,
      "posto_valor": 7
     },
     {
      "clube": "Botafogo-SP",
      "temporada": "2025",
      "rodadas": 22,
      "pct_g4": 0.0,
      "ppj": 1.09,
      "indice_perfil": 12.9,
      "posto_valor": 17
     },
     {
      "clube": "Avaí",
      "temporada": "2026",
      "rodadas": 11,
      "pct_g4": 0.0,
      "ppj": 1.45,
      "indice_perfil": 42.1,
      "posto_valor": 14
     }
    ]
   }
  ]
 },
 "regua": {
  "indice": [
   "H_dinheiro",
   "dist_remate",
   "E_qualidade_chance",
   "xg_por_remate_contra",
   "duelos_def_pct",
   "xgc_casa",
   "dd_casa"
  ],
  "candidatos": [
   {
    "indicador": "H_dinheiro",
    "parte": "A12",
    "d": 1.149
   },
   {
    "indicador": "dist_remate",
    "parte": "A02",
    "d": 1.084
   },
   {
    "indicador": "E_qualidade_chance",
    "parte": "A12",
    "d": 0.961
   },
   {
    "indicador": "xg_por_remate_contra",
    "parte": "A02",
    "d": 0.805
   },
   {
    "indicador": "duelos_def_pct",
    "parte": "A06",
    "d": 0.805
   },
   {
    "indicador": "dd_fora",
    "parte": "A03",
    "d": 0.788
   },
   {
    "indicador": "I_estabilidade_11",
    "parte": "A12",
    "d": 0.767
   },
   {
    "indicador": "xgc_casa",
    "parte": "A03",
    "d": 0.756
   },
   {
    "indicador": "F_solidez",
    "parte": "A12",
    "d": 0.724
   },
   {
    "indicador": "dd_casa",
    "parte": "A03",
    "d": 0.703
   }
  ],
  "descartados": [
   [
    "dd_fora",
    "duelos_def_pct",
    0.81
   ],
   [
    "F_solidez",
    "xgc_casa",
    0.83
   ]
  ],
  "fora_por_ser_consequencia": [
   [
    "I_estabilidade_11",
    "é consequência do resultado, não característica"
   ]
  ]
 },
 "ranking": {
  "gerado_por": "scripts/J06_ranking.py",
  "o_que_e": "Minutagem ELIMINA, o resto ORDENA. Só entra quem tem minutagem alta e repetida — o único requisito que a base sustenta por posição (J05-3) — e a ordem é o eixo da qualidade da chance, com físico e duelo como desempate. NÃO é probabilidade de dar certo: o perfil descreve quem subiu e não promete quem vai subir (J05-1), e o backtest da §8.6 não autorizou publicar nome como alvo.",
  "regra": {
   "de": "scripts/J06_ranking.py",
   "decidido_em": "2026-09-21",
   "o_que_mudou": "A lista da Série B deixou de ser ordenada por QUANTOS pisos o jogador cruza e passou a ser: minutagem ELIMINA, o resto ORDENA.",
   "por_que": [
    "O J06-1 mediu que nenhum nome sai da parte por falha da ficha — como conjunção de 4 a 6 pisos, ela reprova praticamente todo mundo (13 de 240 cruzam tudo). Ordenar por `atende` é ordenar por uma régua que o próprio estudo mostrou não separar.",
    "O J05-3 concluiu que o ÚNICO requisito que a base sustenta por posição é minutagem alta e regular. Requisito que se sustenta elimina; o que não se sustenta, no máximo ordena. Era isso que estava trocado.",
    "O eixo da ordem é a qualidade da chance, que é o único traço firme do estudo (A02-1) e o único que acompanha o treinador na troca de clube (T03-1) e que dá para treinar (A12-1). O A15-1 confirmou o eixo dentro do próprio time, na unidade do jogo."
   ],
   "elimina": {
    "criterio": "minutagem alta e repetida (o selo `roda`)",
    "de": "J05-3",
    "campo": "minutagem_regular",
    "vale_para": "só a lista da Série B — a do exterior já eliminava por rodagem verificável na liga de origem desde o J09",
    "o_que_isto_nao_e": "não é dizer que quem jogou pouco é pior. Minutagem baixa por LESÃO é outra coisa, e o J01-2 mediu que a ficha de lesão não distingue os dois casos. Quem cai aqui cai por não ser verificável nesta base, e o número de quem caiu vai publicado."
   },
   "ordena": {
    "chave_1": {
     "nome": "eixo da qualidade da chance",
     "campo": "aderencia_eixo",
     "indicadores": [
      "Toques na área/90",
      "Passes progressivos/90"
     ],
     "por_que_estes": "São a tradução, no jogador, de 'chegar a finalizar de dentro': levar a bola ao terço final e estar dentro da área. São os dois indicadores da ficha que ficam nesse eixo.",
     "de": "A02-1 (firme), A12-1, T03-1, A15-1",
     "como_e_medido": "No MESMO percentil do resto (dentro de temporada × setor, só quem tem 900+ minutos), orientado pelo `sentido` declarado em J05_perfil.csv. Os dois entram SEM piso: `Toques na área/90` tem piso na ficha de J05 mas ficou de fora do perfil CURTO que o J06 herda, e transformá-lo em exigência aqui mudaria `atende` e `com_dado` e quebraria a conferência contra o funil publicado — a trava que garante que esta lista é a mesma conta do J06. Então ele descreve e ordena, e não vira exigência nova. É a mesma regra que o J06 aplica a métrica sem piso.",
     "nao_vale_para_o_exterior": "A base das ligas de origem mede no máximo 2 dos 4 a 6 critérios da ficha e não traz os dois do eixo. A lista de fora continua ordenada por rodagem na liga de origem, que é o achado do J09-1, e a tela diz isso em cima dela."
    },
    "chave_2": {
     "nome": "físico e duelo",
     "campo": "aderencia_desempate",
     "blocos": [
      "fisico",
      "duelo_corpo"
     ],
     "papel": "desempate",
     "de": "A06-1 (duelo no chão) e J04-2 (o pouco de físico que sobreviveu)"
    },
    "chave_3": {
     "nome": "aderência geral à ficha",
     "campo": "aderencia",
     "papel": "último desempate, para a ordem ser determinística"
    }
   },
   "fora_do_eixo": {
    "Passes certos, %": "é controle de bola, não qualidade da chance. Continua medido e mostrado na tabela, entra na aderência geral, e não manda na ordem."
   },
   "o_que_a_ordem_continua_nao_sendo": [
    "Probabilidade de dar certo. O J05-1 diz na manchete que o perfil descreve quem subiu e não promete quem vai subir, e o backtest da §8.6 não autorizou publicar nome como alvo.",
    "Um número único de encaixe. A §8.2 proíbe somar as três notas da Protótipo num só número, e esta ordem não as soma: usa uma como chave e as outras como desempate, em camadas, com cada coluna à vista.",
    "Custo, disponibilidade e encaixe no modelo de jogo, que ficam para validação externa."
   ]
  },
  "corte_de_minutagem": {
   "saíram": 175,
   "ficaram": 65,
   "criterio": "minutagem alta e repetida (o selo `roda`)"
  },
  "serie_b": [
   {
    "posicao": "Goleiro",
    "ficha_de": "Goleiro",
    "criterios_da_ficha": 2,
    "quantos": 4,
    "jogadores": [
     {
      "jogador": "Paulo Vítor",
      "clube": "Atlético-GO",
      "liga": "Série B",
      "idade": 37.0,
      "minutos": 2402.0,
      "fatia_pct": 90.2,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": 72.6,
      "aderencia_desempate": 63.1,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 50; Passes progressivos/90 95",
      "aderencia": 57.7,
      "folga": -0.1,
      "contrato": "2026-11-30",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": false,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Duelos defensivos ganhos, % 64; Duelos aéreos ganhos, % 62/70; Passes certos, % 10/55; Passes progressivos/90 95/50",
      "pk_app": "Paulo Vítor - Atlético GO - Brasil B"
     },
     {
      "jogador": "Victor Souza",
      "clube": "Botafogo-SP",
      "liga": "Série B",
      "idade": 34.0,
      "minutos": 2238.0,
      "fatia_pct": 81.9,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": 70.2,
      "aderencia_desempate": 63.1,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 50; Passes progressivos/90 90",
      "aderencia": 62.5,
      "folga": 9.4,
      "contrato": "31/12/2027",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": false,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Duelos defensivos ganhos, % 64; Duelos aéreos ganhos, % 62/70; Passes certos, % 33/55; Passes progressivos/90 90/50",
      "pk_app": "Victor Souza - Botafogo SP - Brasil B"
     },
     {
      "jogador": "Tadeu",
      "clube": "Goiás",
      "liga": "Série B",
      "idade": 34.0,
      "minutos": 1207.0,
      "fatia_pct": 44.7,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": 64.3,
      "aderencia_desempate": 77.4,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 50; Passes progressivos/90 79",
      "aderencia": 67.9,
      "folga": 5.8,
      "contrato": "31/12/2029",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": false,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Duelos defensivos ganhos, % 93; Duelos aéreos ganhos, % 62/70; Passes certos, % 38/55; Passes progressivos/90 79/50",
      "pk_app": "Tadeu - Goiás - Brasil B"
     },
     {
      "jogador": "Jordi",
      "clube": "Novorizontino",
      "liga": "Série B",
      "idade": 33.0,
      "minutos": 1845.0,
      "fatia_pct": 65.8,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": 48.8,
      "aderencia_desempate": 63.1,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 50; Passes progressivos/90 48",
      "aderencia": 48.2,
      "folga": -19.2,
      "contrato": "31/12/2027",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": false,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Duelos defensivos ganhos, % 64; Duelos aéreos ganhos, % 62/70; Passes certos, % 19/55; Passes progressivos/90 48/50",
      "pk_app": "Jordi - Grêmio Novorizontino - Brasil B"
     }
    ]
   },
   {
    "posicao": "Zaga",
    "ficha_de": "Zaga",
    "criterios_da_ficha": 4,
    "quantos": 11,
    "jogadores": [
     {
      "jogador": "César Martins",
      "clube": "Criciúma",
      "liga": "Série B",
      "idade": 33.0,
      "minutos": 2035.0,
      "fatia_pct": 78.1,
      "com_dado": 4,
      "atende": 2,
      "aderencia_eixo": 99.0,
      "aderencia_desempate": 54.8,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 98; Passes progressivos/90 100",
      "aderencia": 55.2,
      "folga": 4.9,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 100/70; Duelos defensivos ganhos, % 31/60; Duelos aéreos ganhos, % 34/55; Passes certos, % 12; Passes progressivos/90 100/60",
      "pk_app": "César Martins - Criciúma - Brasil B"
     },
     {
      "jogador": "Luciano Castán",
      "clube": "Criciúma",
      "liga": "Série B",
      "idade": 36.0,
      "minutos": 1841.0,
      "fatia_pct": 70.6,
      "com_dado": 4,
      "atende": 2,
      "aderencia_eixo": 89.4,
      "aderencia_desempate": 40.7,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 86; Passes progressivos/90 92",
      "aderencia": 46.7,
      "folga": -7.6,
      "contrato": "31/12/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 28/70; Duelos defensivos ganhos, % 10/60; Duelos aéreos ganhos, % 85/55; Passes certos, % 19; Passes progressivos/90 92/60",
      "pk_app": "Luciano Castán - Criciúma - Brasil B"
     },
     {
      "jogador": "Ricardo Silva",
      "clube": "América-MG",
      "liga": "Série B",
      "idade": 34.0,
      "minutos": 1252.0,
      "fatia_pct": 46.7,
      "com_dado": 4,
      "atende": 2,
      "aderencia_eixo": 73.1,
      "aderencia_desempate": 65.2,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 88; Passes progressivos/90 58",
      "aderencia": 67.9,
      "folga": 2.1,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 32/70; Duelos defensivos ganhos, % 65/60; Duelos aéreos ganhos, % 98/55; Passes certos, % 86; Passes progressivos/90 58/60",
      "pk_app": "Ricardo Silva - América Mineiro - Brasil B"
     },
     {
      "jogador": "Tiago Pagnussat",
      "clube": "Vila Nova",
      "liga": "Série B",
      "idade": 36.0,
      "minutos": 1770.0,
      "fatia_pct": 66.8,
      "com_dado": 4,
      "atende": 3,
      "aderencia_eixo": 70.7,
      "aderencia_desempate": 78.0,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 74; Passes progressivos/90 67",
      "aderencia": 65.3,
      "folga": 14.1,
      "contrato": "31/12/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 62/70; Duelos defensivos ganhos, % 79/60; Duelos aéreos ganhos, % 93/55; Passes certos, % 25; Passes progressivos/90 67/60",
      "pk_app": "Tiago Pagnussat - Vila Nova - Brasil B"
     },
     {
      "jogador": "Vilar",
      "clube": "Botafogo-SP",
      "liga": "Série B",
      "idade": 26.0,
      "minutos": 2612.0,
      "fatia_pct": 95.6,
      "com_dado": 4,
      "atende": 2,
      "aderencia_eixo": 67.3,
      "aderencia_desempate": 64.6,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 96; Passes progressivos/90 38",
      "aderencia": 52.6,
      "folga": -3.1,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 90/70; Duelos defensivos ganhos, % 38/60; Duelos aéreos ganhos, % 65/55; Passes certos, % 31; Passes progressivos/90 38/60",
      "pk_app": "Vilar - Botafogo SP - Brasil B"
     },
     {
      "jogador": "Rodrigo",
      "clube": "Criciúma",
      "liga": "Série B",
      "idade": 39.0,
      "minutos": 1767.0,
      "fatia_pct": 67.8,
      "com_dado": 4,
      "atende": 2,
      "aderencia_eixo": 57.7,
      "aderencia_desempate": 67.0,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 100; Passes progressivos/90 15",
      "aderencia": 56.4,
      "folga": -7.1,
      "contrato": "31/12/2027",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 80/70; Duelos defensivos ganhos, % 69/60; Duelos aéreos ganhos, % 52/55; Passes certos, % 65; Passes progressivos/90 15/60",
      "pk_app": "Rodrigo - Criciúma - Brasil B"
     },
     {
      "jogador": "Messias",
      "clube": "Juventude",
      "liga": "Série B",
      "idade": 31.0,
      "minutos": 1645.0,
      "fatia_pct": 61.3,
      "com_dado": 4,
      "atende": 3,
      "aderencia_eixo": 45.2,
      "aderencia_desempate": 78.9,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 90; Passes progressivos/90 0",
      "aderencia": 61.2,
      "folga": -2.1,
      "contrato": "31/12/2027",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 83/70; Duelos defensivos ganhos, % 86/60; Duelos aéreos ganhos, % 67/55; Passes certos, % 69; Passes progressivos/90 0/60",
      "pk_app": "Messias - Juventude - Brasil B"
     },
     {
      "jogador": "Lucas Ribeiro",
      "clube": "Goiás",
      "liga": "Série B",
      "idade": 27.0,
      "minutos": 1499.0,
      "fatia_pct": 55.5,
      "com_dado": 4,
      "atende": 3,
      "aderencia_eixo": 43.2,
      "aderencia_desempate": 60.5,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 17; Passes progressivos/90 69",
      "aderencia": 68.2,
      "folga": 1.5,
      "contrato": "31/12/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 96/70; Duelos defensivos ganhos, % 76/60; Duelos aéreos ganhos, % 10/55; Passes certos, % 90; Passes progressivos/90 69/60",
      "pk_app": "Lucas Ribeiro - Goias - Brasil B"
     },
     {
      "jogador": "Júlio César",
      "clube": "Ceará",
      "liga": "Série B",
      "idade": 22.0,
      "minutos": 1877.0,
      "fatia_pct": 77.0,
      "com_dado": 3,
      "atende": 0,
      "aderencia_eixo": 39.9,
      "aderencia_desempate": 20.2,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 43; Passes progressivos/90 36",
      "aderencia": 31.7,
      "folga": -32.7,
      "contrato": "31/12/2027",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": false,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Duelos defensivos ganhos, % 35/60; Duelos aéreos ganhos, % 6/55; Passes certos, % 50; Passes progressivos/90 36/60",
      "pk_app": "Júlio César - Ceará - Brasil B"
     },
     {
      "jogador": "Miranda",
      "clube": "Operário-PR",
      "liga": "Série B",
      "idade": 26.0,
      "minutos": 1945.0,
      "fatia_pct": 71.5,
      "com_dado": 4,
      "atende": 1,
      "aderencia_eixo": 38.0,
      "aderencia_desempate": 26.6,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 3; Passes progressivos/90 73",
      "aderencia": 41.3,
      "folga": -23.0,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 24/70; Duelos defensivos ganhos, % 48/60; Duelos aéreos ganhos, % 8/55; Passes certos, % 54; Passes progressivos/90 73/60",
      "pk_app": "Miranda - Operário PR - Brasil B"
     },
     {
      "jogador": "Éder",
      "clube": "Ceará",
      "liga": "Série B",
      "idade": 31.0,
      "minutos": 2021.0,
      "fatia_pct": 82.9,
      "com_dado": 4,
      "atende": 1,
      "aderencia_eixo": 26.4,
      "aderencia_desempate": 34.4,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 43; Passes progressivos/90 10",
      "aderencia": 38.0,
      "folga": -33.0,
      "contrato": "31/12/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 86/70; Duelos defensivos ganhos, % 4/60; Duelos aéreos ganhos, % 14/55; Passes certos, % 77; Passes progressivos/90 10/60",
      "pk_app": "Éder - Ceará - Brasil B"
     }
    ]
   },
   {
    "posicao": "Lateral esquerdo",
    "ficha_de": "Lateral",
    "criterios_da_ficha": 4,
    "quantos": 5,
    "jogadores": [
     {
      "jogador": "Sánchez",
      "clube": "Ceará",
      "liga": "Série B",
      "idade": 30.0,
      "minutos": 1194.0,
      "fatia_pct": 49.0,
      "com_dado": 4,
      "atende": 1,
      "aderencia_eixo": 82.3,
      "aderencia_desempate": 41.6,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 90; Passes progressivos/90 75",
      "aderencia": 44.0,
      "folga": -13.8,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 45/55; Tempo até atingir o sprint (s) 18/55; Duelos defensivos ganhos, % 69/50; Duelos aéreos ganhos, % 34; Passes certos, % 23/50; Passes progressivos/90 75",
      "pk_app": "Sánchez - Ceará - Brasil B"
     },
     {
      "jogador": "Felipinho",
      "clube": "Sport",
      "liga": "Série B",
      "idade": 29.0,
      "minutos": 2169.0,
      "fatia_pct": 81.1,
      "com_dado": 4,
      "atende": 3,
      "aderencia_eixo": 81.8,
      "aderencia_desempate": 73.3,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 70; Passes progressivos/90 94",
      "aderencia": 73.6,
      "folga": 12.0,
      "contrato": "31/12/2027",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 98/55; Tempo até atingir o sprint (s) 100/55; Duelos defensivos ganhos, % 6/50; Duelos aéreos ganhos, % 90; Passes certos, % 54/50; Passes progressivos/90 94",
      "pk_app": "Felipinho - Sport Recife - Brasil B"
     },
     {
      "jogador": "Patrick Brey",
      "clube": "Botafogo-SP",
      "liga": "Série B",
      "idade": 29.0,
      "minutos": 2301.0,
      "fatia_pct": 84.2,
      "com_dado": 4,
      "atende": 1,
      "aderencia_eixo": 63.6,
      "aderencia_desempate": 29.8,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 98; Passes progressivos/90 29",
      "aderencia": 24.8,
      "folga": -26.8,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 24/55; Tempo até atingir o sprint (s) 14/55; Duelos defensivos ganhos, % 65/50; Duelos aéreos ganhos, % 17; Passes certos, % 0/50; Passes progressivos/90 29",
      "pk_app": "Patrick Brey - Botafogo SP - Brasil B"
     },
     {
      "jogador": "Pará",
      "clube": "São Bernardo",
      "liga": "Série B",
      "idade": 31.0,
      "minutos": 2238.0,
      "fatia_pct": 85.3,
      "com_dado": 4,
      "atende": 1,
      "aderencia_eixo": 53.1,
      "aderencia_desempate": 34.9,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 16; Passes progressivos/90 91",
      "aderencia": 49.8,
      "folga": -20.2,
      "contrato": "31/03/2027",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 29/55; Tempo até atingir o sprint (s) 21/55; Duelos defensivos ganhos, % 10/50; Duelos aéreos ganhos, % 79; Passes certos, % 69/50; Passes progressivos/90 91",
      "pk_app": "Pará - São Bernardo FC - Brasil B"
     },
     {
      "jogador": "Zeca",
      "clube": "Athletic",
      "liga": "Série B",
      "idade": 32.0,
      "minutos": 1569.0,
      "fatia_pct": 57.3,
      "com_dado": 4,
      "atende": 1,
      "aderencia_eixo": 41.6,
      "aderencia_desempate": 8.4,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 0; Passes progressivos/90 83",
      "aderencia": 33.7,
      "folga": -23.3,
      "contrato": "31/12/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 7/55; Tempo até atingir o sprint (s) 12/55; Duelos defensivos ganhos, % 12/50; Duelos aéreos ganhos, % 2; Passes certos, % 85/50; Passes progressivos/90 83",
      "pk_app": "Zeca - Athletic Club - Brasil B"
     }
    ]
   },
   {
    "posicao": "Lateral direito",
    "ficha_de": "Lateral",
    "criterios_da_ficha": 4,
    "quantos": 4,
    "jogadores": [
     {
      "jogador": "Willean Lepo",
      "clube": "Criciúma",
      "liga": "Série B",
      "idade": 29.0,
      "minutos": 1710.0,
      "fatia_pct": 65.6,
      "com_dado": 4,
      "atende": 1,
      "aderencia_eixo": 95.3,
      "aderencia_desempate": 46.1,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 100; Passes progressivos/90 91",
      "aderencia": 48.6,
      "folga": -5.8,
      "contrato": "31/12/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 39/55; Tempo até atingir o sprint (s) 45/55; Duelos defensivos ganhos, % 85/50; Duelos aéreos ganhos, % 15; Passes certos, % 17/50; Passes progressivos/90 91",
      "pk_app": "Willean Lepo - Criciúma - Brasil B"
     },
     {
      "jogador": "Rodrigo Soares",
      "clube": "Goiás",
      "liga": "Série B",
      "idade": 33.0,
      "minutos": 1415.0,
      "fatia_pct": 52.4,
      "com_dado": 4,
      "atende": 2,
      "aderencia_eixo": 79.2,
      "aderencia_desempate": 39.1,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 79; Passes progressivos/90 79",
      "aderencia": 55.2,
      "folga": -8.2,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 10/55; Tempo até atingir o sprint (s) 0/55; Duelos defensivos ganhos, % 72/50; Duelos aéreos ganhos, % 75; Passes certos, % 96/50; Passes progressivos/90 79",
      "pk_app": "Rodrigo Soares - Goiás - Brasil B"
     },
     {
      "jogador": "Bryan",
      "clube": "Ceará",
      "liga": "Série B",
      "idade": 30.0,
      "minutos": 1329.0,
      "fatia_pct": 54.5,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": 45.3,
      "aderencia_desempate": 40.1,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 82; Passes progressivos/90 8",
      "aderencia": 42.4,
      "folga": 26.6,
      "contrato": "2027-12-31",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": false,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Duelos defensivos ganhos, % 72/50; Duelos aéreos ganhos, % 8; Passes certos, % 81/50; Passes progressivos/90 8",
      "pk_app": null
     },
     {
      "jogador": "Hereda",
      "clube": "CRB",
      "liga": "Série B",
      "idade": 27.0,
      "minutos": 1404.0,
      "fatia_pct": 51.8,
      "com_dado": 4,
      "atende": 3,
      "aderencia_eixo": 40.1,
      "aderencia_desempate": 54.6,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 40; Passes progressivos/90 41",
      "aderencia": 55.7,
      "folga": 11.0,
      "contrato": "31/12/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 62/55; Tempo até atingir o sprint (s) 77/55; Duelos defensivos ganhos, % 40/50; Duelos aéreos ganhos, % 40; Passes certos, % 75/50; Passes progressivos/90 41",
      "pk_app": "Hereda - CRB - Brasil B"
     }
    ]
   },
   {
    "posicao": "Volante",
    "ficha_de": "Volante",
    "criterios_da_ficha": 6,
    "quantos": 7,
    "jogadores": [
     {
      "jogador": "Luís Oyama",
      "clube": "Novorizontino",
      "liga": "Série B",
      "idade": 29.0,
      "minutos": 1906.0,
      "fatia_pct": 67.9,
      "com_dado": 6,
      "atende": 2,
      "aderencia_eixo": 77.2,
      "aderencia_desempate": 37.5,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 73; Passes progressivos/90 82",
      "aderencia": 43.9,
      "folga": -16.1,
      "contrato": "31/12/2027",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 18/70; Arrancadas explosivas até o sprint por 90 min 64/60; Duelos defensivos ganhos, % 41/60; Duelos aéreos ganhos, % 27/55; Passes certos, % 32/60; Passes progressivos/90 82/55",
      "pk_app": "Luís Oyama - Grêmio Novorizontino - Brasil B"
     },
     {
      "jogador": "João Vieira",
      "clube": "Vila Nova",
      "liga": "Série B",
      "idade": 28.0,
      "minutos": 2081.0,
      "fatia_pct": 78.5,
      "com_dado": 6,
      "atende": 3,
      "aderencia_eixo": 61.4,
      "aderencia_desempate": 48.3,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 91; Passes progressivos/90 32",
      "aderencia": 51.9,
      "folga": -8.1,
      "contrato": "31/12/2027",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 91/70; Arrancadas explosivas até o sprint por 90 min 70/60; Duelos defensivos ganhos, % 9/60; Duelos aéreos ganhos, % 23/55; Passes certos, % 86/60; Passes progressivos/90 32/55",
      "pk_app": "João Vieira - Vila Nova - Brasil B"
     },
     {
      "jogador": "Filipe Machado",
      "clube": "Goiás",
      "liga": "Série B",
      "idade": 30.0,
      "minutos": 1855.0,
      "fatia_pct": 68.7,
      "com_dado": 6,
      "atende": 4,
      "aderencia_eixo": 47.8,
      "aderencia_desempate": 59.1,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 0; Passes progressivos/90 96",
      "aderencia": 71.2,
      "folga": 11.2,
      "contrato": "31/12/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 34/70; Arrancadas explosivas até o sprint por 90 min 32/60; Duelos defensivos ganhos, % 91/60; Duelos aéreos ganhos, % 80/55; Passes certos, % 96/60; Passes progressivos/90 96/55",
      "pk_app": "Filipe Machado - Goiás - Brasil B"
     },
     {
      "jogador": "Léo Naldi",
      "clube": "Novorizontino",
      "liga": "Série B",
      "idade": 25.0,
      "minutos": 1795.0,
      "fatia_pct": 64.0,
      "com_dado": 6,
      "atende": 1,
      "aderencia_eixo": 43.1,
      "aderencia_desempate": 44.9,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 82; Passes progressivos/90 4",
      "aderencia": 34.4,
      "folga": -25.5,
      "contrato": "31/12/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 23/70; Arrancadas explosivas até o sprint por 90 min 43/60; Duelos defensivos ganhos, % 64/60; Duelos aéreos ganhos, % 50/55; Passes certos, % 23/60; Passes progressivos/90 4/55",
      "pk_app": "Léo Naldi - Grêmio Novorizontino - Brasil B"
     },
     {
      "jogador": "Foguinho",
      "clube": "São Bernardo",
      "liga": "Série B",
      "idade": 34.0,
      "minutos": 1914.0,
      "fatia_pct": 72.9,
      "com_dado": 6,
      "atende": 2,
      "aderencia_eixo": 42.0,
      "aderencia_desempate": 34.1,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 59; Passes progressivos/90 25",
      "aderencia": 39.0,
      "folga": -21.0,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 48/70; Arrancadas explosivas até o sprint por 90 min 70/60; Duelos defensivos ganhos, % 18/60; Duelos aéreos ganhos, % 0/55; Passes certos, % 73/60; Passes progressivos/90 25/55",
      "pk_app": "Foguinho - São Bernardo FC - Brasil B"
     },
     {
      "jogador": "Zé Ricardo",
      "clube": "Avaí",
      "liga": "Série B",
      "idade": 30.0,
      "minutos": 1697.0,
      "fatia_pct": 61.2,
      "com_dado": 6,
      "atende": 1,
      "aderencia_eixo": 38.6,
      "aderencia_desempate": 42.6,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 4; Passes progressivos/90 73",
      "aderencia": 46.6,
      "folga": -13.4,
      "contrato": "31/12/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 54/70; Arrancadas explosivas até o sprint por 90 min 57/60; Duelos defensivos ganhos, % 23/60; Duelos aéreos ganhos, % 36/55; Passes certos, % 36/60; Passes progressivos/90 73/55",
      "pk_app": "Zé Ricardo - Avaí - Brasil B"
     },
     {
      "jogador": "Matheus Trindade",
      "clube": "Operário-PR",
      "liga": "Série B",
      "idade": 30.0,
      "minutos": 2067.0,
      "fatia_pct": 75.9,
      "com_dado": 6,
      "atende": 1,
      "aderencia_eixo": 9.1,
      "aderencia_desempate": 53.4,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 9; Passes progressivos/90 9",
      "aderencia": 44.7,
      "folga": -15.3,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 84/70; Arrancadas explosivas até o sprint por 90 min 43/60; Duelos defensivos ganhos, % 54/60; Duelos aéreos ganhos, % 32/55; Passes certos, % 46/60; Passes progressivos/90 9/55",
      "pk_app": "Matheus Trindade - Operário PR - Brasil B"
     }
    ]
   },
   {
    "posicao": "Médio",
    "ficha_de": "Meia",
    "criterios_da_ficha": 5,
    "quantos": 9,
    "jogadores": [
     {
      "jogador": "Crystopher",
      "clube": "CRB",
      "liga": "Série B",
      "idade": 28.0,
      "minutos": 2138.0,
      "fatia_pct": 78.8,
      "com_dado": 5,
      "atende": 2,
      "aderencia_eixo": 72.7,
      "aderencia_desempate": 36.5,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 57; Passes progressivos/90 89",
      "aderencia": 48.8,
      "folga": -6.9,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 27/65; Arrancadas explosivas até o sprint por 90 min 46/55; Duelos defensivos ganhos, % 36/55; Duelos aéreos ganhos, % 38; Passes certos, % 58/50; Passes progressivos/90 89/65",
      "pk_app": "Crystopher - CRB - Brasil B"
     },
     {
      "jogador": "Danielzinho",
      "clube": "CRB",
      "liga": "Série B",
      "idade": 30.0,
      "minutos": 1875.0,
      "fatia_pct": 69.1,
      "com_dado": 5,
      "atende": 3,
      "aderencia_eixo": 70.8,
      "aderencia_desempate": 51.6,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 58; Passes progressivos/90 83",
      "aderencia": 61.4,
      "folga": 4.4,
      "contrato": "2026-12-31",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 27/65; Arrancadas explosivas até o sprint por 90 min 38/55; Duelos defensivos ganhos, % 85/55; Duelos aéreos ganhos, % 57; Passes certos, % 79/50; Passes progressivos/90 83/65",
      "pk_app": "Danielzinho - CRB - Brasil B"
     },
     {
      "jogador": "Pedro Castro",
      "clube": "CRB",
      "liga": "Série B",
      "idade": 33.0,
      "minutos": 2179.0,
      "fatia_pct": 80.3,
      "com_dado": 5,
      "atende": 3,
      "aderencia_eixo": 59.0,
      "aderencia_desempate": 48.9,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 39; Passes progressivos/90 79",
      "aderencia": 58.1,
      "folga": -5.3,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 13/65; Arrancadas explosivas até o sprint por 90 min 15/55; Duelos defensivos ganhos, % 83/55; Duelos aéreos ganhos, % 85; Passes certos, % 74/50; Passes progressivos/90 79/65",
      "pk_app": "Pedro Castro - CRB - Brasil B"
     },
     {
      "jogador": "Guilherme Lobo",
      "clube": "Criciúma",
      "liga": "Série B",
      "idade": 26.0,
      "minutos": 1914.0,
      "fatia_pct": 73.4,
      "com_dado": 5,
      "atende": 3,
      "aderencia_eixo": 58.5,
      "aderencia_desempate": 58.7,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 19; Passes progressivos/90 98",
      "aderencia": 70.0,
      "folga": 11.4,
      "contrato": "31/12/2027",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 88/65; Arrancadas explosivas até o sprint por 90 min 36/55; Duelos defensivos ganhos, % 38/55; Duelos aéreos ganhos, % 73; Passes certos, % 87/50; Passes progressivos/90 98/65",
      "pk_app": "Guilherme Lobo - Criciúma - Brasil B"
     },
     {
      "jogador": "Rafael Gava",
      "clube": "Botafogo-SP",
      "liga": "Série B",
      "idade": 33.0,
      "minutos": 1987.0,
      "fatia_pct": 72.7,
      "com_dado": 5,
      "atende": 2,
      "aderencia_eixo": 54.2,
      "aderencia_desempate": 38.0,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 39; Passes progressivos/90 70",
      "aderencia": 48.3,
      "folga": -13.4,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 56/65; Arrancadas explosivas até o sprint por 90 min 12/55; Duelos defensivos ganhos, % 17/55; Duelos aéreos ganhos, % 67; Passes certos, % 68/50; Passes progressivos/90 70/65",
      "pk_app": "Rafael Gava - Botafogo SP - Brasil B"
     },
     {
      "jogador": "Everton Morelli",
      "clube": "Botafogo-SP",
      "liga": "Série B",
      "idade": 28.0,
      "minutos": 2420.0,
      "fatia_pct": 88.5,
      "com_dado": 5,
      "atende": 0,
      "aderencia_eixo": 50.9,
      "aderencia_desempate": 49.2,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 79; Passes progressivos/90 23",
      "aderencia": 43.5,
      "folga": -18.5,
      "contrato": "31/12/2028",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 60/65; Arrancadas explosivas até o sprint por 90 min 53/55; Duelos defensivos ganhos, % 21/55; Duelos aéreos ganhos, % 63; Passes certos, % 42/50; Passes progressivos/90 23/65",
      "pk_app": "Everton Morelli - Botafogo SP - Brasil B"
     },
     {
      "jogador": "André Lima",
      "clube": "Ponte Preta",
      "liga": "Série B",
      "idade": 26.0,
      "minutos": 1691.0,
      "fatia_pct": 67.5,
      "com_dado": 5,
      "atende": 2,
      "aderencia_eixo": 45.8,
      "aderencia_desempate": 42.3,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 7; Passes progressivos/90 85",
      "aderencia": 56.2,
      "folga": -8.7,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 4/65; Arrancadas explosivas até o sprint por 90 min 40/55; Duelos defensivos ganhos, % 34/55; Duelos aéreos ganhos, % 91; Passes certos, % 83/50; Passes progressivos/90 85/65",
      "pk_app": "André Lima - Ponte Preta - Brasil B"
     },
     {
      "jogador": "Kauan",
      "clube": "Athletic",
      "liga": "Série B",
      "idade": 21.0,
      "minutos": 2275.0,
      "fatia_pct": 83.1,
      "com_dado": 5,
      "atende": 2,
      "aderencia_eixo": 42.5,
      "aderencia_desempate": 42.9,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 42; Passes progressivos/90 43",
      "aderencia": 46.6,
      "folga": -5.5,
      "contrato": "2028-05-31",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 48/65; Arrancadas explosivas até o sprint por 90 min 43/55; Duelos defensivos ganhos, % 64/55; Duelos aéreos ganhos, % 17; Passes certos, % 64/50; Passes progressivos/90 43/65",
      "pk_app": "Kauan - Athletic Club - Brasil B"
     },
     {
      "jogador": "Eduardo",
      "clube": "Criciúma",
      "liga": "Série B",
      "idade": 29.0,
      "minutos": 1239.0,
      "fatia_pct": 47.5,
      "com_dado": 5,
      "atende": 3,
      "aderencia_eixo": 35.9,
      "aderencia_desempate": 45.3,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 0; Passes progressivos/90 72",
      "aderencia": 58.5,
      "folga": -3.6,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 36/65; Arrancadas explosivas até o sprint por 90 min 57/55; Duelos defensivos ganhos, % 8/55; Duelos aéreos ganhos, % 79; Passes certos, % 98/50; Passes progressivos/90 72/65",
      "pk_app": "Eduardo - Criciúma - Brasil B"
     }
    ]
   },
   {
    "posicao": "Meia ofensivo",
    "ficha_de": "Meia",
    "criterios_da_ficha": 5,
    "quantos": 10,
    "jogadores": [
     {
      "jogador": "Janderson",
      "clube": "Vila Nova",
      "liga": "Série B",
      "idade": 27.0,
      "minutos": 2279.0,
      "fatia_pct": 86.0,
      "com_dado": 5,
      "atende": 1,
      "aderencia_eixo": 76.4,
      "aderencia_desempate": 47.6,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 94; Passes progressivos/90 58",
      "aderencia": 44.0,
      "folga": -6.4,
      "contrato": "30/11/2027",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 40/65; Arrancadas explosivas até o sprint por 90 min 89/55; Duelos defensivos ganhos, % 55/55; Duelos aéreos ganhos, % 6; Passes certos, % 15/50; Passes progressivos/90 58/65",
      "pk_app": "Janderson - Vila Nova - Brasil B"
     },
     {
      "jogador": "Bruno José",
      "clube": "Atlético-GO",
      "liga": "Série B",
      "idade": 28.0,
      "minutos": 960.0,
      "fatia_pct": 36.0,
      "com_dado": 5,
      "atende": 2,
      "aderencia_eixo": 70.2,
      "aderencia_desempate": 65.3,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 94; Passes progressivos/90 46",
      "aderencia": 51.6,
      "folga": -13.8,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 76/65; Arrancadas explosivas até o sprint por 90 min 92/55; Duelos defensivos ganhos, % 6/55; Duelos aéreos ganhos, % 89; Passes certos, % 2/50; Passes progressivos/90 46/65",
      "pk_app": "Bruno José - Atlético GO - Brasil B"
     },
     {
      "jogador": "Élvis",
      "clube": "Ponte Preta",
      "liga": "Série B",
      "idade": 35.0,
      "minutos": 1505.0,
      "fatia_pct": 60.1,
      "com_dado": 5,
      "atende": 1,
      "aderencia_eixo": 56.6,
      "aderencia_desempate": 25.1,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 13; Passes progressivos/90 100",
      "aderencia": 37.5,
      "folga": -22.3,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 48/65; Arrancadas explosivas até o sprint por 90 min 4/55; Duelos defensivos ganhos, % 2/55; Duelos aéreos ganhos, % 46; Passes certos, % 24/50; Passes progressivos/90 100/65",
      "pk_app": "Élvis - Ponte Preta - Brasil B"
     },
     {
      "jogador": "Chrystian Barletta",
      "clube": "Sport",
      "liga": "Série B",
      "idade": 25.0,
      "minutos": 1991.0,
      "fatia_pct": 74.4,
      "com_dado": 5,
      "atende": 3,
      "aderencia_eixo": 56.2,
      "aderencia_desempate": 65.1,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 77; Passes progressivos/90 35",
      "aderencia": 52.7,
      "folga": 4.1,
      "contrato": "31/07/2029",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 94/65; Arrancadas explosivas até o sprint por 90 min 100/55; Duelos defensivos ganhos, % 61/55; Duelos aéreos ganhos, % 6; Passes certos, % 21/50; Passes progressivos/90 35/65",
      "pk_app": "Chrystian Barletta - Sport Recife - Brasil B"
     },
     {
      "jogador": "Vinícius Paiva",
      "clube": "Novorizontino",
      "liga": "Série B",
      "idade": 25.0,
      "minutos": 1342.0,
      "fatia_pct": 47.8,
      "com_dado": 5,
      "atende": 3,
      "aderencia_eixo": 56.1,
      "aderencia_desempate": 71.4,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 82; Passes progressivos/90 30",
      "aderencia": 53.9,
      "folga": -0.3,
      "contrato": "31/12/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 76/65; Arrancadas explosivas até o sprint por 90 min 98/55; Duelos defensivos ganhos, % 77/55; Duelos aéreos ganhos, % 35; Passes certos, % 8/50; Passes progressivos/90 30/65",
      "pk_app": "Vinícius Paiva - Grêmio Novorizontino - Brasil B"
     },
     {
      "jogador": "Gegé",
      "clube": "Goiás",
      "liga": "Série B",
      "idade": 32.0,
      "minutos": 1015.0,
      "fatia_pct": 37.6,
      "com_dado": 5,
      "atende": 2,
      "aderencia_eixo": 55.6,
      "aderencia_desempate": 36.6,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 51; Passes progressivos/90 60",
      "aderencia": 43.9,
      "folga": -10.8,
      "contrato": "31/12/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 7/65; Arrancadas explosivas até o sprint por 90 min 19/55; Duelos defensivos ganhos, % 92/55; Duelos aéreos ganhos, % 27; Passes certos, % 57/50; Passes progressivos/90 60/65",
      "pk_app": "Gegé - Goiás - Brasil B"
     },
     {
      "jogador": "Marquinhos Gabriel",
      "clube": "Vila Nova",
      "liga": "Série B",
      "idade": 36.0,
      "minutos": 2055.0,
      "fatia_pct": 77.5,
      "com_dado": 5,
      "atende": 2,
      "aderencia_eixo": 51.0,
      "aderencia_desempate": 37.9,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 70; Passes progressivos/90 32",
      "aderencia": 39.7,
      "folga": -14.3,
      "contrato": "30/11/2027",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 16/65; Arrancadas explosivas até o sprint por 90 min 21/55; Duelos defensivos ganhos, % 94/55; Duelos aéreos ganhos, % 20; Passes certos, % 55/50; Passes progressivos/90 32/65",
      "pk_app": "Marquinhos Gabriel - Vila Nova - Brasil B"
     },
     {
      "jogador": "Lourenço",
      "clube": "Goiás",
      "liga": "Série B",
      "idade": 29.0,
      "minutos": 1435.0,
      "fatia_pct": 53.1,
      "com_dado": 5,
      "atende": 2,
      "aderencia_eixo": 51.0,
      "aderencia_desempate": 20.8,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 9; Passes progressivos/90 92",
      "aderencia": 44.4,
      "folga": -7.7,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 7/65; Arrancadas explosivas até o sprint por 90 min 29/55; Duelos defensivos ganhos, % 32/55; Duelos aéreos ganhos, % 15; Passes certos, % 91/50; Passes progressivos/90 92/65",
      "pk_app": "Lourenço - Goiás - Brasil B"
     },
     {
      "jogador": "Boschilia",
      "clube": "Operário-PR",
      "liga": "Série B",
      "idade": 30.0,
      "minutos": 2396.0,
      "fatia_pct": 88.0,
      "com_dado": 5,
      "atende": 2,
      "aderencia_eixo": 46.2,
      "aderencia_desempate": 24.2,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 26; Passes progressivos/90 66",
      "aderencia": 41.9,
      "folga": -10.3,
      "contrato": "2027-11-30",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 48/65; Arrancadas explosivas até o sprint por 90 min 32/55; Duelos defensivos ganhos, % 4/55; Duelos aéreos ganhos, % 13; Passes certos, % 89/50; Passes progressivos/90 66/65",
      "pk_app": "Boschilia - Operário PR - Brasil B"
     },
     {
      "jogador": "Victor Andrade",
      "clube": "Náutico",
      "liga": "Série B",
      "idade": 30.0,
      "minutos": 1054.0,
      "fatia_pct": 39.2,
      "com_dado": 5,
      "atende": 2,
      "aderencia_eixo": 32.1,
      "aderencia_desempate": 45.8,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 64; Passes progressivos/90 0",
      "aderencia": 32.1,
      "folga": -26.5,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 0/65; Arrancadas explosivas até o sprint por 90 min 77/55; Duelos defensivos ganhos, % 72/55; Duelos aéreos ganhos, % 35; Passes certos, % 9/50; Passes progressivos/90 0/65",
      "pk_app": "Victor Andrade - Náutico - Brasil B"
     }
    ]
   },
   {
    "posicao": "Extremo",
    "ficha_de": "Extremo",
    "criterios_da_ficha": 6,
    "quantos": 4,
    "jogadores": [
     {
      "jogador": "Dadá Belmonte",
      "clube": "CRB",
      "liga": "Série B",
      "idade": 29.0,
      "minutos": 2285.0,
      "fatia_pct": 84.3,
      "com_dado": 6,
      "atende": 2,
      "aderencia_eixo": 86.3,
      "aderencia_desempate": 44.3,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 100; Passes progressivos/90 73",
      "aderencia": 50.8,
      "folga": -11.8,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 20/70; Sprints por 90 min 30/50; Duelos defensivos ganhos, % 82/75; Duelos aéreos ganhos, % 46/55; Passes certos, % 54/70; Passes progressivos/90 73/55",
      "pk_app": "Dadá Belmonte - CRB - Brasil B"
     },
     {
      "jogador": "Paulinho Moccelin",
      "clube": "Londrina",
      "liga": "Série B",
      "idade": 32.0,
      "minutos": 1117.0,
      "fatia_pct": 39.9,
      "com_dado": 6,
      "atende": 1,
      "aderencia_eixo": 54.6,
      "aderencia_desempate": 27.3,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 18; Passes progressivos/90 91",
      "aderencia": 33.3,
      "folga": -29.2,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 10/70; Sprints por 90 min 40/50; Duelos defensivos ganhos, % 36/75; Duelos aéreos ganhos, % 23/55; Passes certos, % 0/70; Passes progressivos/90 91/55",
      "pk_app": "Paulinho Moccelin - Londrina - Brasil B"
     },
     {
      "jogador": "Rómulo Otero",
      "clube": "Criciúma",
      "liga": "Série B",
      "idade": 33.0,
      "minutos": 1477.0,
      "fatia_pct": 56.7,
      "com_dado": 6,
      "atende": 4,
      "aderencia_eixo": 40.9,
      "aderencia_desempate": 54.9,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 0; Passes progressivos/90 82",
      "aderencia": 63.9,
      "folga": 1.4,
      "contrato": "31/12/2026",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 65/70; Sprints por 90 min 0/50; Duelos defensivos ganhos, % 91/75; Duelos aéreos ganhos, % 64/55; Passes certos, % 82/70; Passes progressivos/90 82/55",
      "pk_app": "Rómulo Otero - Criciúma - Brasil B"
     },
     {
      "jogador": "Aylon",
      "clube": "Operário-PR",
      "liga": "Série B",
      "idade": 34.0,
      "minutos": 1431.0,
      "fatia_pct": 52.6,
      "com_dado": 6,
      "atende": 2,
      "aderencia_eixo": 27.3,
      "aderencia_desempate": 51.4,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 36; Passes progressivos/90 18",
      "aderencia": 49.4,
      "folga": -13.1,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 50/70; Sprints por 90 min 10/50; Duelos defensivos ganhos, % 46/75; Duelos aéreos ganhos, % 100/55; Passes certos, % 73/70; Passes progressivos/90 18/55",
      "pk_app": "Aylon - Operário PR - Brasil B"
     }
    ]
   },
   {
    "posicao": "Atacante",
    "ficha_de": "Atacante",
    "criterios_da_ficha": 4,
    "quantos": 11,
    "jogadores": [
     {
      "jogador": "Robson",
      "clube": "Novorizontino",
      "liga": "Série B",
      "idade": 35.0,
      "minutos": 2272.0,
      "fatia_pct": 81.0,
      "com_dado": 4,
      "atende": 2,
      "aderencia_eixo": 90.4,
      "aderencia_desempate": 63.4,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 92; Passes progressivos/90 88",
      "aderencia": 62.8,
      "folga": 14.5,
      "contrato": "31/12/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 94/55; Sprints por 90 min 52/60; Duelos defensivos ganhos, % 38/50; Duelos aéreos ganhos, % 69; Passes certos, % 35; Passes progressivos/90 88/50",
      "pk_app": "Robson - Grêmio Novorizontino - Brasil B"
     },
     {
      "jogador": "Willian",
      "clube": "América-MG",
      "liga": "Série B",
      "idade": 39.0,
      "minutos": 1234.0,
      "fatia_pct": 46.0,
      "com_dado": 4,
      "atende": 1,
      "aderencia_eixo": 78.8,
      "aderencia_desempate": 26.8,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 65; Passes progressivos/90 92",
      "aderencia": 49.3,
      "folga": -17.3,
      "contrato": "2026-11-30",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 10/55; Sprints por 90 min 32/60; Duelos defensivos ganhos, % 12/50; Duelos aéreos ganhos, % 54; Passes certos, % 96; Passes progressivos/90 92/50",
      "pk_app": null
     },
     {
      "jogador": "William Pottker",
      "clube": "Londrina",
      "liga": "Série B",
      "idade": 32.0,
      "minutos": 1425.0,
      "fatia_pct": 50.9,
      "com_dado": 4,
      "atende": 4,
      "aderencia_eixo": 72.1,
      "aderencia_desempate": 61.6,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 77; Passes progressivos/90 67",
      "aderencia": 66.4,
      "folga": 20.9,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 86/55; Sprints por 90 min 76/60; Duelos defensivos ganhos, % 69/50; Duelos aéreos ganhos, % 15; Passes certos, % 85; Passes progressivos/90 67/50",
      "pk_app": "William Pottker - Londrina - Brasil B"
     },
     {
      "jogador": "Rodrigo Rodrigues",
      "clube": "Cuiabá",
      "liga": "Série B",
      "idade": 26.0,
      "minutos": 1418.0,
      "fatia_pct": 52.5,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": 67.3,
      "aderencia_desempate": 32.7,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 54; Passes progressivos/90 81",
      "aderencia": 54.8,
      "folga": 23.1,
      "contrato": "31/12/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": false,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Duelos defensivos ganhos, % 65/50; Duelos aéreos ganhos, % 0; Passes certos, % 73; Passes progressivos/90 81/50",
      "pk_app": "Rodrigo Rodrigues - Cuiabá - Brasil B"
     },
     {
      "jogador": "Mikael",
      "clube": "CRB",
      "liga": "Série B",
      "idade": 27.0,
      "minutos": 2236.0,
      "fatia_pct": 82.4,
      "com_dado": 4,
      "atende": 2,
      "aderencia_eixo": 64.5,
      "aderencia_desempate": 71.0,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 96; Passes progressivos/90 33",
      "aderencia": 59.8,
      "folga": 2.3,
      "contrato": "30/11/2027",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 94/55; Sprints por 90 min 36/60; Duelos defensivos ganhos, % 62/50; Duelos aéreos ganhos, % 92; Passes certos, % 42; Passes progressivos/90 33/50",
      "pk_app": "Mikael - CRB - Brasil B"
     },
     {
      "jogador": "Alisson Safira",
      "clube": "Juventude",
      "liga": "Série B",
      "idade": 31.0,
      "minutos": 1585.0,
      "fatia_pct": 59.0,
      "com_dado": 4,
      "atende": 0,
      "aderencia_eixo": 50.0,
      "aderencia_desempate": 45.9,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 58; Passes progressivos/90 42",
      "aderencia": 40.2,
      "folga": -22.3,
      "contrato": "31/12/2027",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 52/55; Sprints por 90 min 16/60; Duelos defensivos ganhos, % 15/50; Duelos aéreos ganhos, % 100; Passes certos, % 15; Passes progressivos/90 42/50",
      "pk_app": "Alisson Safira - Juventude - Brasil B"
     },
     {
      "jogador": "Hygor",
      "clube": "Botafogo-SP",
      "liga": "Série B",
      "idade": 34.0,
      "minutos": 1584.0,
      "fatia_pct": 58.0,
      "com_dado": 4,
      "atende": 3,
      "aderencia_eixo": 44.2,
      "aderencia_desempate": 73.8,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 69; Passes progressivos/90 19",
      "aderencia": 52.4,
      "folga": 10.5,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 80/55; Sprints por 90 min 100/60; Duelos defensivos ganhos, % 58/50; Duelos aéreos ganhos, % 58; Passes certos, % 0; Passes progressivos/90 19/50",
      "pk_app": "Hygor - Botafogo SP - Brasil B"
     },
     {
      "jogador": "Anselmo Ramon",
      "clube": "Goiás",
      "liga": "Série B",
      "idade": 38.0,
      "minutos": 1331.0,
      "fatia_pct": 49.3,
      "com_dado": 4,
      "atende": 2,
      "aderencia_eixo": 44.2,
      "aderencia_desempate": 49.8,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 15; Passes progressivos/90 73",
      "aderencia": 58.9,
      "folga": -3.9,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 34/55; Sprints por 90 min 0/60; Duelos defensivos ganhos, % 92/50; Duelos aéreos ganhos, % 73; Passes certos, % 81; Passes progressivos/90 73/50",
      "pk_app": "Anselmo Ramon - Goiás - Brasil B"
     },
     {
      "jogador": "Waguininho",
      "clube": "Criciúma",
      "liga": "Série B",
      "idade": 36.0,
      "minutos": 1881.0,
      "fatia_pct": 72.2,
      "com_dado": 4,
      "atende": 1,
      "aderencia_eixo": 43.2,
      "aderencia_desempate": 38.1,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 19; Passes progressivos/90 67",
      "aderencia": 40.5,
      "folga": -15.2,
      "contrato": "30/11/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 24/55; Sprints por 90 min 40/60; Duelos defensivos ganhos, % 23/50; Duelos aéreos ganhos, % 65; Passes certos, % 23; Passes progressivos/90 67/50",
      "pk_app": "Waguininho - Criciúma - Brasil B"
     },
     {
      "jogador": "Gustavo Coutinho",
      "clube": "Atlético-GO",
      "liga": "Série B",
      "idade": 27.0,
      "minutos": 1728.0,
      "fatia_pct": 64.9,
      "com_dado": 4,
      "atende": 2,
      "aderencia_eixo": 41.4,
      "aderencia_desempate": 59.5,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 50; Passes progressivos/90 33",
      "aderencia": 56.6,
      "folga": 8.2,
      "contrato": "31/12/2026",
      "livre": true,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 100/55; Sprints por 90 min 88/60; Duelos defensivos ganhos, % 27/50; Duelos aéreos ganhos, % 23; Passes certos, % 69; Passes progressivos/90 33/50",
      "pk_app": "Gustavo Coutinho - Atlético GO - Brasil B"
     },
     {
      "jogador": "Dellatorre",
      "clube": "Vila Nova",
      "liga": "Série B",
      "idade": 34.0,
      "minutos": 920.0,
      "fatia_pct": 34.7,
      "com_dado": 4,
      "atende": 1,
      "aderencia_eixo": 27.0,
      "aderencia_desempate": 52.1,
      "criterios_do_eixo": 2,
      "eixo_detalhe": "Toques na área/90 46; Passes progressivos/90 8",
      "aderencia": 41.1,
      "folga": -12.2,
      "contrato": "30/11/2027",
      "livre": false,
      "estrangeiro": false,
      "fisico_verificado": true,
      "forca_do_fator": "",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 68/55; Sprints por 90 min 48/60; Duelos defensivos ganhos, % 42/50; Duelos aéreos ganhos, % 50; Passes certos, % 31; Passes progressivos/90 8/50",
      "pk_app": "Dellatorre - Vila Nova - Brasil B"
     }
    ]
   }
  ],
  "exterior": [
   {
    "posicao": "Lateral esquerdo",
    "ficha_de": "Lateral",
    "criterios_da_ficha": 2,
    "quantos": 15,
    "jogadores": [
     {
      "jogador": "Javi Vázquez",
      "clube": "Torreense",
      "liga": "Portugal B",
      "idade": 25.0,
      "minutos": 3269.0,
      "fatia_pct": 107.6,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 62.5,
      "folga": 7.5,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 56/55; Tempo até atingir o sprint (s) 69/55",
      "pk_app": null
     },
     {
      "jogador": "Carlos Romero",
      "clube": "Espanyol",
      "liga": "Espanha A",
      "idade": 24.0,
      "minutos": 3511.0,
      "fatia_pct": 102.7,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 47.2,
      "folga": -7.8,
      "contrato": "2031-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "fraco",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 47/55; Tempo até atingir o sprint (s) 48/55",
      "pk_app": null
     },
     {
      "jogador": "Hu Hetao",
      "clube": "Chengdu Rongcheng",
      "liga": "China",
      "idade": 22.0,
      "minutos": 1482.0,
      "fatia_pct": 102.2,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 80.6,
      "folga": 25.6,
      "contrato": "2027-02-28",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 67/55; Tempo até atingir o sprint (s) 94/55",
      "pk_app": null
     },
     {
      "jogador": "Saad Balobaid",
      "clube": "Al Shabab",
      "liga": "Arabia Saudita A",
      "idade": 26.0,
      "minutos": 3123.0,
      "fatia_pct": 101.8,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 48.2,
      "folga": -6.8,
      "contrato": "2028-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 40/55; Tempo até atingir o sprint (s) 56/55",
      "pk_app": null
     },
     {
      "jogador": "César Castro",
      "clube": "2 de Mayo",
      "liga": "Paraguai",
      "idade": 33.0,
      "minutos": 2106.0,
      "fatia_pct": 101.7,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 90.2,
      "folga": 35.2,
      "contrato": "2026-12-31",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 92/55; Tempo até atingir o sprint (s) 88/55",
      "pk_app": null
     },
     {
      "jogador": "Shinichi Chan",
      "clube": "Shanghai Shenhua",
      "liga": "China",
      "idade": 23.0,
      "minutos": 1519.0,
      "fatia_pct": 101.6,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 94.5,
      "folga": 39.5,
      "contrato": "2027-12-31",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 100/55; Tempo até atingir o sprint (s) 89/55",
      "pk_app": null
     },
     {
      "jogador": " Yerco Oyanedel",
      "clube": "Univ. Concepción",
      "liga": "Chile",
      "idade": 25.0,
      "minutos": 1643.0,
      "fatia_pct": 101.4,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 76.6,
      "folga": 21.6,
      "contrato": "2026-12-31",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 59/55; Tempo até atingir o sprint (s) 94/55",
      "pk_app": null
     },
     {
      "jogador": "Ahmed Bamasud",
      "clube": "Al Feiha",
      "liga": "Arabia Saudita A",
      "idade": 30.0,
      "minutos": 3062.0,
      "fatia_pct": 100.1,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 61.4,
      "folga": 6.4,
      "contrato": "2028-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 54/55; Tempo até atingir o sprint (s) 68/55",
      "pk_app": null
     },
     {
      "jogador": "Pedro Rebocho",
      "clube": "Al Khaleej",
      "liga": "Arabia Saudita A",
      "idade": 31.0,
      "minutos": 3133.0,
      "fatia_pct": 97.0,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 32.2,
      "folga": -22.8,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 43/55; Tempo até atingir o sprint (s) 22/55",
      "pk_app": null
     },
     {
      "jogador": "Sun Guowen",
      "clube": "Zhejiang Professional",
      "liga": "China",
      "idade": 32.0,
      "minutos": 1435.0,
      "fatia_pct": 96.5,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 47.2,
      "folga": -7.8,
      "contrato": "2026-12-31",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 47/55; Tempo até atingir o sprint (s) 47/55",
      "pk_app": null
     },
     {
      "jogador": "Manu Sánchez",
      "clube": "Levante",
      "liga": "Espanha A",
      "idade": 25.0,
      "minutos": 3112.0,
      "fatia_pct": 93.5,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 18.6,
      "folga": -36.5,
      "contrato": "2028-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "fraco",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 26/55; Tempo até atingir o sprint (s) 11/55",
      "pk_app": null
     },
     {
      "jogador": "Thalisson",
      "clube": "Gençlerbirliği",
      "liga": "Turquia",
      "idade": 28.0,
      "minutos": 2756.0,
      "fatia_pct": 92.8,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 66.8,
      "folga": 11.9,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "fraco",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 83/55; Tempo até atingir o sprint (s) 51/55",
      "pk_app": null
     },
     {
      "jogador": "Marc Cucurella",
      "clube": "Chelsea",
      "liga": "Inglaterra A",
      "idade": 27.0,
      "minutos": 3047.0,
      "fatia_pct": 92.2,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 59.9,
      "folga": 4.9,
      "contrato": "2028-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 33/55; Tempo até atingir o sprint (s) 87/55",
      "pk_app": null
     },
     {
      "jogador": "Álex Grimaldo",
      "clube": "Bayer Leverkusen",
      "liga": "Alemanha A",
      "idade": 30.0,
      "minutos": 2808.0,
      "fatia_pct": 90.7,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 34.8,
      "folga": -20.2,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "fraco",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 35/55; Tempo até atingir o sprint (s) 34/55",
      "pk_app": null
     },
     {
      "jogador": "Juninho",
      "clube": "Zorya",
      "liga": "Ucrania",
      "idade": 30.0,
      "minutos": 2437.0,
      "fatia_pct": 90.3,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 77.8,
      "folga": 22.9,
      "contrato": "2026-12-31",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "fraco",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 82/55; Tempo até atingir o sprint (s) 74/55",
      "pk_app": null
     }
    ]
   },
   {
    "posicao": "Lateral direito",
    "ficha_de": "Lateral",
    "criterios_da_ficha": 2,
    "quantos": 15,
    "jogadores": [
     {
      "jogador": "Gaizka Larrazabal",
      "clube": "Casa Pia AC",
      "liga": "Portugal A",
      "idade": 28.0,
      "minutos": 3098.0,
      "fatia_pct": 104.3,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 90.9,
      "folga": 35.9,
      "contrato": "2026-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 87/55; Tempo até atingir o sprint (s) 94/55",
      "pk_app": null
     },
     {
      "jogador": "Juan Iglesias",
      "clube": "Getafe",
      "liga": "Espanha A",
      "idade": 27.0,
      "minutos": 3513.0,
      "fatia_pct": 102.7,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 70.5,
      "folga": 15.5,
      "contrato": "2026-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "fraco",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 80/55; Tempo até atingir o sprint (s) 61/55",
      "pk_app": null
     },
     {
      "jogador": "Gustavo Ferrareis",
      "clube": "Atlas",
      "liga": "Mexico",
      "idade": 30.0,
      "minutos": 3142.0,
      "fatia_pct": 102.7,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 59.5,
      "folga": 4.5,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 62/55; Tempo até atingir o sprint (s) 57/55",
      "pk_app": null
     },
     {
      "jogador": "Dodô",
      "clube": "Fiorentina",
      "liga": "Italia A",
      "idade": 27.0,
      "minutos": 3408.0,
      "fatia_pct": 102.3,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 87.7,
      "folga": 32.7,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 76/55; Tempo até atingir o sprint (s) 99/55",
      "pk_app": null
     },
     {
      "jogador": "Zayed Sultan",
      "clube": "Al Nasr",
      "liga": "Emirados",
      "idade": 25.0,
      "minutos": 2360.0,
      "fatia_pct": 100.9,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 35.3,
      "folga": -19.7,
      "contrato": "2028-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 40/55; Tempo até atingir o sprint (s) 31/55",
      "pk_app": null
     },
     {
      "jogador": "Guille Rosas",
      "clube": "Sporting Gijón",
      "liga": "Espanha B",
      "idade": 26.0,
      "minutos": 3671.0,
      "fatia_pct": 99.0,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 40.4,
      "folga": -14.6,
      "contrato": "2028-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 48/55; Tempo até atingir o sprint (s) 33/55",
      "pk_app": null
     },
     {
      "jogador": "Mohammed Al Baqawi",
      "clube": "Al Feiha",
      "liga": "Arabia Saudita A",
      "idade": 30.0,
      "minutos": 2942.0,
      "fatia_pct": 96.1,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 43.2,
      "folga": -11.8,
      "contrato": "2026-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 58/55; Tempo até atingir o sprint (s) 28/55",
      "pk_app": null
     },
     {
      "jogador": "Jeyson Rojas",
      "clube": "Colo Colo",
      "liga": "Chile",
      "idade": 24.0,
      "minutos": 1747.0,
      "fatia_pct": 95.2,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 79.7,
      "folga": 24.7,
      "contrato": "2027-12-31",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 72/55; Tempo até atingir o sprint (s) 88/55",
      "pk_app": null
     },
     {
      "jogador": "Saeed Baattia",
      "clube": "Al Fateh",
      "liga": "Arabia Saudita A",
      "idade": 25.0,
      "minutos": 2777.0,
      "fatia_pct": 94.1,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 51.3,
      "folga": -3.7,
      "contrato": "",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 52/55; Tempo até atingir o sprint (s) 51/55",
      "pk_app": null
     },
     {
      "jogador": "Rodrigo Pinheiro",
      "clube": "Famalicão",
      "liga": "Portugal A",
      "idade": 23.0,
      "minutos": 2838.0,
      "fatia_pct": 92.7,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 60.0,
      "folga": 5.0,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 73/55; Tempo até atingir o sprint (s) 47/55",
      "pk_app": null
     },
     {
      "jogador": "Tarek Salman",
      "clube": "Al Sadd",
      "liga": "Catar",
      "idade": 28.0,
      "minutos": 1841.0,
      "fatia_pct": 92.7,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 54.0,
      "folga": -1.0,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 54/55; Tempo até atingir o sprint (s) 54/55",
      "pk_app": null
     },
     {
      "jogador": "Francisco Salinas",
      "clube": "Coquimbo Unido",
      "liga": "Chile",
      "idade": 26.0,
      "minutos": 1386.0,
      "fatia_pct": 91.9,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 30.5,
      "folga": -24.5,
      "contrato": "2026-12-31",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 42/55; Tempo até atingir o sprint (s) 19/55",
      "pk_app": null
     },
     {
      "jogador": "Jon Aramburu",
      "clube": "Real Sociedad",
      "liga": "Espanha A",
      "idade": 23.0,
      "minutos": 3047.0,
      "fatia_pct": 91.5,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 70.9,
      "folga": 15.9,
      "contrato": "2030-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "fraco",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 55/55; Tempo até atingir o sprint (s) 87/55",
      "pk_app": null
     },
     {
      "jogador": "Khaled Ebraheim",
      "clube": "Al Sharjah",
      "liga": "Emirados",
      "idade": 29.0,
      "minutos": 2019.0,
      "fatia_pct": 90.7,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 88.2,
      "folga": 33.2,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 91/55; Tempo até atingir o sprint (s) 85/55",
      "pk_app": null
     },
     {
      "jogador": "Víctor Gómez",
      "clube": "Sporting Braga",
      "liga": "Portugal A",
      "idade": 26.0,
      "minutos": 2726.0,
      "fatia_pct": 90.1,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 13.2,
      "folga": -41.8,
      "contrato": "2028-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Velocidade de pico, média dos 5 melhores jogos (km/h) 6/55; Tempo até atingir o sprint (s) 21/55",
      "pk_app": null
     }
    ]
   },
   {
    "posicao": "Volante",
    "ficha_de": "Volante",
    "criterios_da_ficha": 2,
    "quantos": 15,
    "jogadores": [
     {
      "jogador": "Luis Milla",
      "clube": "Getafe",
      "liga": "Espanha A",
      "idade": 31.0,
      "minutos": 3617.0,
      "fatia_pct": 105.8,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 65.6,
      "folga": 0.6,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "fraco",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 60/70; Arrancadas explosivas até o sprint por 90 min 71/60",
      "pk_app": null
     },
     {
      "jogador": "Fabinho",
      "clube": "Al Ittihad",
      "liga": "Arabia Saudita A",
      "idade": 32.0,
      "minutos": 2925.0,
      "fatia_pct": 104.8,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 35.8,
      "folga": -29.2,
      "contrato": "2026-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 29/70; Arrancadas explosivas até o sprint por 90 min 43/60",
      "pk_app": null
     },
     {
      "jogador": "Wang Shangyuan",
      "clube": "Henan",
      "liga": "China",
      "idade": 33.0,
      "minutos": 1495.0,
      "fatia_pct": 104.7,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 27.8,
      "folga": -37.2,
      "contrato": "2026-12-31",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 44/70; Arrancadas explosivas até o sprint por 90 min 11/60",
      "pk_app": null
     },
     {
      "jogador": "Fawaz Awana",
      "clube": "Bani Yas",
      "liga": "Emirados",
      "idade": 37.0,
      "minutos": 2263.0,
      "fatia_pct": 99.9,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 53.5,
      "folga": -11.4,
      "contrato": "2026-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 100/70; Arrancadas explosivas até o sprint por 90 min 7/60",
      "pk_app": null
     },
     {
      "jogador": "Àlex Corredera",
      "clube": "Sporting Gijón",
      "liga": "Espanha B",
      "idade": 30.0,
      "minutos": 3695.0,
      "fatia_pct": 99.7,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 68.2,
      "folga": 3.1,
      "contrato": "2028-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 82/70; Arrancadas explosivas até o sprint por 90 min 54/60",
      "pk_app": null
     },
     {
      "jogador": "Antonio Blanco",
      "clube": "Deportivo Alavés",
      "liga": "Espanha A",
      "idade": 25.0,
      "minutos": 3407.0,
      "fatia_pct": 99.6,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 37.5,
      "folga": -27.5,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "fraco",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 48/70; Arrancadas explosivas até o sprint por 90 min 27/60",
      "pk_app": null
     },
     {
      "jogador": "Yang Mingyang",
      "clube": "Chengdu Rongcheng",
      "liga": "China",
      "idade": 30.0,
      "minutos": 1394.0,
      "fatia_pct": 96.1,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 77.8,
      "folga": 12.8,
      "contrato": "2027-01-31",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 100/70; Arrancadas explosivas até o sprint por 90 min 56/60",
      "pk_app": null
     },
     {
      "jogador": "Alfa Semedo",
      "clube": "Al Feiha",
      "liga": "Arabia Saudita A",
      "idade": 28.0,
      "minutos": 2910.0,
      "fatia_pct": 95.1,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 32.1,
      "folga": -32.9,
      "contrato": "2028-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 14/70; Arrancadas explosivas até o sprint por 90 min 50/60",
      "pk_app": null
     },
     {
      "jogador": "Jon Moncayola",
      "clube": "Osasuna",
      "liga": "Espanha A",
      "idade": 28.0,
      "minutos": 3262.0,
      "fatia_pct": 93.8,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 93.8,
      "folga": 28.8,
      "contrato": "2031-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "fraco",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 94/70; Arrancadas explosivas até o sprint por 90 min 94/60",
      "pk_app": null
     },
     {
      "jogador": "Isma Ruiz",
      "clube": "Córdoba",
      "liga": "Espanha B",
      "idade": 25.0,
      "minutos": 3257.0,
      "fatia_pct": 92.8,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 95.5,
      "folga": 30.5,
      "contrato": "2028-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 100/70; Arrancadas explosivas até o sprint por 90 min 91/60",
      "pk_app": null
     },
     {
      "jogador": "Ahmed Fathi",
      "clube": "Al Arabi",
      "liga": "Catar",
      "idade": 33.0,
      "minutos": 1811.0,
      "fatia_pct": 91.5,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 60.0,
      "folga": -5.0,
      "contrato": "2026-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 75/70; Arrancadas explosivas até o sprint por 90 min 45/60",
      "pk_app": null
     },
     {
      "jogador": "Mikel Jauregizar",
      "clube": "Athletic Club",
      "liga": "Espanha A",
      "idade": 22.0,
      "minutos": 3059.0,
      "fatia_pct": 91.1,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 41.6,
      "folga": -23.4,
      "contrato": "2031-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "fraco",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 33/70; Arrancadas explosivas até o sprint por 90 min 50/60",
      "pk_app": null
     },
     {
      "jogador": "Wendel",
      "clube": "Zenit",
      "liga": "Russia",
      "idade": 28.0,
      "minutos": 2450.0,
      "fatia_pct": 90.7,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 99.0,
      "folga": 34.0,
      "contrato": "2029-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 98/70; Arrancadas explosivas até o sprint por 90 min 100/60",
      "pk_app": null
     },
     {
      "jogador": "Matheus Dias",
      "clube": "Nacional",
      "liga": "Portugal A",
      "idade": 24.0,
      "minutos": 2676.0,
      "fatia_pct": 90.1,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 27.1,
      "folga": -37.9,
      "contrato": "2030-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 6/70; Arrancadas explosivas até o sprint por 90 min 48/60",
      "pk_app": null
     },
     {
      "jogador": "Mohamed Elneny",
      "clube": "Al Jazira",
      "liga": "Emirados",
      "idade": 33.0,
      "minutos": 2047.0,
      "fatia_pct": 89.4,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 23.2,
      "folga": -41.8,
      "contrato": "2026-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 25/70; Arrancadas explosivas até o sprint por 90 min 21/60",
      "pk_app": null
     }
    ]
   },
   {
    "posicao": "Médio",
    "ficha_de": "Meia",
    "criterios_da_ficha": 2,
    "quantos": 15,
    "jogadores": [
     {
      "jogador": "Mateus Vital",
      "clube": "Shanghai Port",
      "liga": "China",
      "idade": 28.0,
      "minutos": 1572.0,
      "fatia_pct": 116.4,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 50.0,
      "folga": -10.0,
      "contrato": "2026-12-31",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 75/65; Arrancadas explosivas até o sprint por 90 min 25/55",
      "pk_app": null
     },
     {
      "jogador": "Tozé",
      "clube": "Al Riyadh",
      "liga": "Arabia Saudita A",
      "idade": 33.0,
      "minutos": 3253.0,
      "fatia_pct": 106.3,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 52.7,
      "folga": -7.3,
      "contrato": "",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 65/65; Arrancadas explosivas até o sprint por 90 min 40/55",
      "pk_app": null
     },
     {
      "jogador": "Neto",
      "clube": "Al Bataeh",
      "liga": "Emirados",
      "idade": 23.0,
      "minutos": 2424.0,
      "fatia_pct": 104.8,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 13.8,
      "folga": -46.2,
      "contrato": "",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 8/65; Arrancadas explosivas até o sprint por 90 min 19/55",
      "pk_app": null
     },
     {
      "jogador": "Miguel Atienza",
      "clube": "Burgos",
      "liga": "Espanha B",
      "idade": 27.0,
      "minutos": 3838.0,
      "fatia_pct": 101.5,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 40.5,
      "folga": -19.5,
      "contrato": "2026-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 65/65; Arrancadas explosivas até o sprint por 90 min 16/55",
      "pk_app": null
     },
     {
      "jogador": "Mario Soriano",
      "clube": "Deportivo La Coruña",
      "liga": "Espanha B",
      "idade": 24.0,
      "minutos": 3891.0,
      "fatia_pct": 99.0,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 31.6,
      "folga": -28.3,
      "contrato": "2028-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 51/65; Arrancadas explosivas até o sprint por 90 min 13/55",
      "pk_app": null
     },
     {
      "jogador": "João Carvalho",
      "clube": "Estoril",
      "liga": "Portugal A",
      "idade": 29.0,
      "minutos": 3022.0,
      "fatia_pct": 98.8,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 66.3,
      "folga": 6.4,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 81/65; Arrancadas explosivas até o sprint por 90 min 52/55",
      "pk_app": null
     },
     {
      "jogador": "Luís Esteves",
      "clube": "Gil Vicente",
      "liga": "Portugal A",
      "idade": 28.0,
      "minutos": 2979.0,
      "fatia_pct": 98.1,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 71.5,
      "folga": 11.6,
      "contrato": "2028-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 86/65; Arrancadas explosivas até o sprint por 90 min 57/55",
      "pk_app": null
     },
     {
      "jogador": "Li Tixiang",
      "clube": "Liaoning Tieren",
      "liga": "China",
      "idade": 36.0,
      "minutos": 1339.0,
      "fatia_pct": 96.7,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 8.3,
      "folga": -51.7,
      "contrato": "",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 8/65; Arrancadas explosivas até o sprint por 90 min 8/55",
      "pk_app": null
     },
     {
      "jogador": "Diogo Prioste",
      "clube": "Benfica II",
      "liga": "Portugal B",
      "idade": 22.0,
      "minutos": 2534.0,
      "fatia_pct": 96.1,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 21.5,
      "folga": -38.5,
      "contrato": "2029-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 21/65; Arrancadas explosivas até o sprint por 90 min 22/55",
      "pk_app": null
     },
     {
      "jogador": "Mateus Fernandes",
      "clube": "West Ham United",
      "liga": "Inglaterra A",
      "idade": 21.0,
      "minutos": 3302.0,
      "fatia_pct": 95.9,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 29.6,
      "folga": -30.4,
      "contrato": "2030-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 18/65; Arrancadas explosivas até o sprint por 90 min 42/55",
      "pk_app": null
     },
     {
      "jogador": "Iván Morante",
      "clube": "Burgos",
      "liga": "Espanha B",
      "idade": 25.0,
      "minutos": 3608.0,
      "fatia_pct": 95.4,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 44.6,
      "folga": -15.4,
      "contrato": "2026-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 82/65; Arrancadas explosivas até o sprint por 90 min 8/55",
      "pk_app": null
     },
     {
      "jogador": "Guilherme Madruga",
      "clube": "Shandong Taishan",
      "liga": "China",
      "idade": 25.0,
      "minutos": 1280.0,
      "fatia_pct": 94.0,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 71.8,
      "folga": 11.9,
      "contrato": "2026-12-31",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 81/65; Arrancadas explosivas até o sprint por 90 min 62/55",
      "pk_app": null
     },
     {
      "jogador": "João Gomes",
      "clube": "Wolverhampton Wanderers",
      "liga": "Inglaterra A",
      "idade": 25.0,
      "minutos": 3118.0,
      "fatia_pct": 93.9,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 57.2,
      "folga": -2.8,
      "contrato": "2030-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 64/65; Arrancadas explosivas até o sprint por 90 min 50/55",
      "pk_app": null
     },
     {
      "jogador": "André",
      "clube": "Wolverhampton Wanderers",
      "liga": "Inglaterra A",
      "idade": 24.0,
      "minutos": 3071.0,
      "fatia_pct": 92.5,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 11.9,
      "folga": -48.0,
      "contrato": "2030-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 8/65; Arrancadas explosivas até o sprint por 90 min 15/55",
      "pk_app": null
     },
     {
      "jogador": "Matty Longstaff",
      "clube": "CF Montréal",
      "liga": "EUA",
      "idade": 26.0,
      "minutos": 1622.0,
      "fatia_pct": 92.3,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 49.6,
      "folga": -10.4,
      "contrato": "2026-12-31",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 83/65; Arrancadas explosivas até o sprint por 90 min 16/55",
      "pk_app": null
     }
    ]
   },
   {
    "posicao": "Meia ofensivo",
    "ficha_de": "Meia",
    "criterios_da_ficha": 2,
    "quantos": 15,
    "jogadores": [
     {
      "jogador": "Carles Gil",
      "clube": "New England",
      "liga": "EUA",
      "idade": 33.0,
      "minutos": 1892.0,
      "fatia_pct": 110.6,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 29.4,
      "folga": -30.6,
      "contrato": "2026-12-31",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 9/65; Arrancadas explosivas até o sprint por 90 min 50/55",
      "pk_app": null
     },
     {
      "jogador": "Rodri Sánchez",
      "clube": "Al Arabi",
      "liga": "Catar",
      "idade": 25.0,
      "minutos": 2148.0,
      "fatia_pct": 108.5,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 54.2,
      "folga": -5.8,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 69/65; Arrancadas explosivas até o sprint por 90 min 39/55",
      "pk_app": null
     },
     {
      "jogador": "Akram Afif",
      "clube": "Al Sadd",
      "liga": "Catar",
      "idade": 29.0,
      "minutos": 2152.0,
      "fatia_pct": 108.4,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 93.8,
      "folga": 33.8,
      "contrato": "",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 90/65; Arrancadas explosivas até o sprint por 90 min 97/55",
      "pk_app": null
     },
     {
      "jogador": "Róger Guedes",
      "clube": "Al Rayyan",
      "liga": "Catar",
      "idade": 29.0,
      "minutos": 2218.0,
      "fatia_pct": 102.6,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 70.8,
      "folga": 10.8,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 69/65; Arrancadas explosivas até o sprint por 90 min 72/55",
      "pk_app": null
     },
     {
      "jogador": "Andrés Martín",
      "clube": "Racing Santander",
      "liga": "Espanha B",
      "idade": 26.0,
      "minutos": 3673.0,
      "fatia_pct": 102.0,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 93.3,
      "folga": 33.4,
      "contrato": "2028-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 93/65; Arrancadas explosivas até o sprint por 90 min 94/55",
      "pk_app": null
     },
     {
      "jogador": "Francisco Trincão",
      "clube": "Sporting CP",
      "liga": "Portugal A",
      "idade": 26.0,
      "minutos": 3097.0,
      "fatia_pct": 101.2,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 66.3,
      "folga": 6.4,
      "contrato": "2030-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 60/65; Arrancadas explosivas até o sprint por 90 min 72/55",
      "pk_app": null
     },
     {
      "jogador": "Wellington Silva",
      "clube": "Chengdu Rongcheng",
      "liga": "China",
      "idade": 33.0,
      "minutos": 1460.0,
      "fatia_pct": 100.7,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 79.2,
      "folga": 19.1,
      "contrato": "",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 100/65; Arrancadas explosivas até o sprint por 90 min 58/55",
      "pk_app": null
     },
     {
      "jogador": "Rômulo",
      "clube": "Chengdu Rongcheng",
      "liga": "China",
      "idade": 30.0,
      "minutos": 1452.0,
      "fatia_pct": 100.1,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 25.0,
      "folga": -35.0,
      "contrato": "2027-01-31",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 29/65; Arrancadas explosivas até o sprint por 90 min 21/55",
      "pk_app": null
     },
     {
      "jogador": "Evander",
      "clube": "Cincinnati",
      "liga": "EUA",
      "idade": 28.0,
      "minutos": 1683.0,
      "fatia_pct": 98.4,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 29.9,
      "folga": -30.1,
      "contrato": "2027-12-31",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 52/65; Arrancadas explosivas até o sprint por 90 min 8/55",
      "pk_app": null
     },
     {
      "jogador": "César Gelabert",
      "clube": "Sporting Gijón",
      "liga": "Espanha B",
      "idade": 25.0,
      "minutos": 3639.0,
      "fatia_pct": 98.2,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 82.9,
      "folga": 22.9,
      "contrato": "2028-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 87/65; Arrancadas explosivas até o sprint por 90 min 78/55",
      "pk_app": null
     },
     {
      "jogador": "Gustavo Sauer",
      "clube": "Wuhan Three Towns",
      "liga": "China",
      "idade": 33.0,
      "minutos": 1367.0,
      "fatia_pct": 97.9,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 85.5,
      "folga": 25.5,
      "contrato": "2026-12-31",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 92/65; Arrancadas explosivas até o sprint por 90 min 79/55",
      "pk_app": null
     },
     {
      "jogador": "Sorriso",
      "clube": "Famalicão",
      "liga": "Portugal A",
      "idade": 25.0,
      "minutos": 2997.0,
      "fatia_pct": 97.9,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 63.8,
      "folga": 3.8,
      "contrato": "2029-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 48/65; Arrancadas explosivas até o sprint por 90 min 79/55",
      "pk_app": null
     },
     {
      "jogador": "José Corpas",
      "clube": "Eibar",
      "liga": "Espanha B",
      "idade": 34.0,
      "minutos": 3672.0,
      "fatia_pct": 96.9,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 57.2,
      "folga": -2.8,
      "contrato": "2026-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 26/65; Arrancadas explosivas até o sprint por 90 min 89/55",
      "pk_app": null
     },
     {
      "jogador": "Iñigo Vicente",
      "clube": "Racing Santander",
      "liga": "Espanha B",
      "idade": 28.0,
      "minutos": 3449.0,
      "fatia_pct": 95.8,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 62.7,
      "folga": 2.7,
      "contrato": "2030-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 65/65; Arrancadas explosivas até o sprint por 90 min 61/55",
      "pk_app": null
     },
     {
      "jogador": "Bruno Fernandes",
      "clube": "Manchester United",
      "liga": "Inglaterra A",
      "idade": 31.0,
      "minutos": 3403.0,
      "fatia_pct": 95.6,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 44.9,
      "folga": -15.1,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 80/65; Arrancadas explosivas até o sprint por 90 min 10/55",
      "pk_app": null
     }
    ]
   },
   {
    "posicao": "Extremo",
    "ficha_de": "Extremo",
    "criterios_da_ficha": 2,
    "quantos": 15,
    "jogadores": [
     {
      "jogador": "Miguel Cardoso",
      "clube": "Kayserispor",
      "liga": "Turquia",
      "idade": 31.0,
      "minutos": 3095.0,
      "fatia_pct": 107.5,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 84.2,
      "folga": 24.2,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "fraco",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 68/70; Sprints por 90 min 100/50",
      "pk_app": null
     },
     {
      "jogador": "Paulinho Bóia",
      "clube": "Nacional",
      "liga": "Portugal A",
      "idade": 27.0,
      "minutos": 3070.0,
      "fatia_pct": 103.4,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 51.7,
      "folga": -8.3,
      "contrato": "2026-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 45/70; Sprints por 90 min 59/50",
      "pk_app": null
     },
     {
      "jogador": "Bitello",
      "clube": "Dinamo Moskva",
      "liga": "Russia",
      "idade": 26.0,
      "minutos": 2541.0,
      "fatia_pct": 97.4,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 38.8,
      "folga": -21.2,
      "contrato": "2031-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 33/70; Sprints por 90 min 44/50",
      "pk_app": null
     },
     {
      "jogador": "Peglow",
      "clube": "DC United",
      "liga": "EUA",
      "idade": 24.0,
      "minutos": 1650.0,
      "fatia_pct": 96.5,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 87.5,
      "folga": 27.5,
      "contrato": "2027-12-31",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 94/70; Sprints por 90 min 81/50",
      "pk_app": null
     },
     {
      "jogador": "Jacobo González",
      "clube": "Córdoba",
      "liga": "Espanha B",
      "idade": 29.0,
      "minutos": 3338.0,
      "fatia_pct": 95.1,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 52.7,
      "folga": -7.3,
      "contrato": "2026-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 60/70; Sprints por 90 min 46/50",
      "pk_app": null
     },
     {
      "jogador": "David Larrubia",
      "clube": "Málaga",
      "liga": "Espanha B",
      "idade": 24.0,
      "minutos": 3621.0,
      "fatia_pct": 93.6,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 35.8,
      "folga": -24.2,
      "contrato": "2028-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 50/70; Sprints por 90 min 22/50",
      "pk_app": null
     },
     {
      "jogador": "Cristian Carracedo",
      "clube": "Córdoba",
      "liga": "Espanha B",
      "idade": 30.0,
      "minutos": 3287.0,
      "fatia_pct": 93.6,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 29.0,
      "folga": -30.9,
      "contrato": "2028-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 42/70; Sprints por 90 min 16/50",
      "pk_app": null
     },
     {
      "jogador": "Murilo",
      "clube": "Gil Vicente",
      "liga": "Portugal A",
      "idade": 31.0,
      "minutos": 2772.0,
      "fatia_pct": 91.3,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 24.1,
      "folga": -35.9,
      "contrato": "2028-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 31/70; Sprints por 90 min 17/50",
      "pk_app": null
     },
     {
      "jogador": "Diogo Travassos",
      "clube": "Moreirense",
      "liga": "Portugal A",
      "idade": 22.0,
      "minutos": 2651.0,
      "fatia_pct": 89.3,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 55.1,
      "folga": -4.9,
      "contrato": "2030-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 45/70; Sprints por 90 min 66/50",
      "pk_app": null
     },
     {
      "jogador": "Gil Dias",
      "clube": "Famalicão",
      "liga": "Portugal A",
      "idade": 29.0,
      "minutos": 2701.0,
      "fatia_pct": 88.3,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 75.0,
      "folga": 15.0,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 69/70; Sprints por 90 min 81/50",
      "pk_app": null
     },
     {
      "jogador": "Malcom",
      "clube": "Al Hilal",
      "liga": "Arabia Saudita A",
      "idade": 29.0,
      "minutos": 3002.0,
      "fatia_pct": 87.8,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 77.6,
      "folga": 17.6,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 100/70; Sprints por 90 min 55/50",
      "pk_app": null
     },
     {
      "jogador": "Aylton Boa Morte",
      "clube": "Khorfakkan",
      "liga": "Emirados",
      "idade": 32.0,
      "minutos": 2068.0,
      "fatia_pct": 87.7,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 76.1,
      "folga": 16.1,
      "contrato": "",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 80/70; Sprints por 90 min 73/50",
      "pk_app": null
     },
     {
      "jogador": "Ali Saleh",
      "clube": "Al Wasl",
      "liga": "Emirados",
      "idade": 26.0,
      "minutos": 2015.0,
      "fatia_pct": 85.3,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 54.5,
      "folga": -5.4,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 50/70; Sprints por 90 min 59/50",
      "pk_app": null
     },
     {
      "jogador": "Fábio Martins",
      "clube": "Al Hazem",
      "liga": "Arabia Saudita A",
      "idade": 32.0,
      "minutos": 2504.0,
      "fatia_pct": 84.3,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 12.9,
      "folga": -47.0,
      "contrato": "",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 26/70; Sprints por 90 min 0/50",
      "pk_app": null
     },
     {
      "jogador": "Ronald",
      "clube": "Swansea City",
      "liga": "Inglaterra B",
      "idade": 24.0,
      "minutos": 3331.0,
      "fatia_pct": 80.5,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 88.9,
      "folga": 28.9,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "fraco",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 78/70; Sprints por 90 min 100/50",
      "pk_app": null
     }
    ]
   },
   {
    "posicao": "Atacante",
    "ficha_de": "Atacante",
    "criterios_da_ficha": 2,
    "quantos": 15,
    "jogadores": [
     {
      "jogador": "Rafael Navarro",
      "clube": "Colorado Rapids",
      "liga": "EUA",
      "idade": 26.0,
      "minutos": 1900.0,
      "fatia_pct": 110.3,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 68.8,
      "folga": 11.2,
      "contrato": "2027-12-31",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 66/55; Sprints por 90 min 72/60",
      "pk_app": null
     },
     {
      "jogador": "Alberto Quiles",
      "clube": "Tianjin Tigers",
      "liga": "China",
      "idade": 31.0,
      "minutos": 1524.0,
      "fatia_pct": 105.2,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 50.0,
      "folga": -7.5,
      "contrato": "2026-12-31",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 50/55; Sprints por 90 min 50/60",
      "pk_app": null
     },
     {
      "jogador": "Wesley",
      "clube": "Shenzhen Peng City",
      "liga": "China",
      "idade": 29.0,
      "minutos": 1486.0,
      "fatia_pct": 105.0,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 10.4,
      "folga": -47.1,
      "contrato": "2027-12-31",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 12/55; Sprints por 90 min 8/60",
      "pk_app": null
     },
     {
      "jogador": "Andre Clóvis",
      "clube": "Académico de Viseu F.C.",
      "liga": "Portugal B",
      "idade": 28.0,
      "minutos": 3206.0,
      "fatia_pct": 104.8,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 70.6,
      "folga": 13.1,
      "contrato": "2028-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 95/55; Sprints por 90 min 46/60",
      "pk_app": null
     },
     {
      "jogador": "Juan Muñoz",
      "clube": "União de Leiria",
      "liga": "Portugal B",
      "idade": 30.0,
      "minutos": 3175.0,
      "fatia_pct": 103.8,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 8.9,
      "folga": -48.5,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 18/55; Sprints por 90 min 0/60",
      "pk_app": null
     },
     {
      "jogador": "Pep Biel",
      "clube": "Charlotte FC",
      "liga": "EUA",
      "idade": 29.0,
      "minutos": 1805.0,
      "fatia_pct": 102.1,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 60.2,
      "folga": 2.7,
      "contrato": "2027-12-31",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 73/55; Sprints por 90 min 47/60",
      "pk_app": null
     },
     {
      "jogador": "Álex Calatrava",
      "clube": "Castellón",
      "liga": "Espanha B",
      "idade": 25.0,
      "minutos": 3904.0,
      "fatia_pct": 101.9,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 60.4,
      "folga": 2.9,
      "contrato": "2029-06-30",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 83/55; Sprints por 90 min 38/60",
      "pk_app": null
     },
     {
      "jogador": "Hugo Rodallega",
      "clube": "Santa Fe",
      "liga": "Colombia A",
      "idade": 41.0,
      "minutos": 2336.0,
      "fatia_pct": 99.8,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 35.0,
      "folga": -22.5,
      "contrato": "2026-12-31",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 67/55; Sprints por 90 min 3/60",
      "pk_app": null
     },
     {
      "jogador": "Zeca",
      "clube": "Shandong Taishan",
      "liga": "China",
      "idade": 29.0,
      "minutos": 1325.0,
      "fatia_pct": 97.3,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 50.0,
      "folga": -7.5,
      "contrato": "2026-12-31",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 42/55; Sprints por 90 min 58/60",
      "pk_app": null
     },
     {
      "jogador": "Alan",
      "clube": "Moreirense",
      "liga": "Portugal A",
      "idade": 26.0,
      "minutos": 2883.0,
      "fatia_pct": 97.1,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 47.4,
      "folga": -10.1,
      "contrato": "2026-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 90/55; Sprints por 90 min 5/60",
      "pk_app": null
     },
     {
      "jogador": "Lionel Altamirano",
      "clube": "Huachipato",
      "liga": "Chile",
      "idade": 33.0,
      "minutos": 1518.0,
      "fatia_pct": 93.7,
      "com_dado": 2,
      "atende": 1,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 37.5,
      "folga": -20.0,
      "contrato": "2026-12-31",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "forte",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 70/55; Sprints por 90 min 5/60",
      "pk_app": null
     },
     {
      "jogador": "Omar Khribin",
      "clube": "Al Wahda",
      "liga": "Emirados",
      "idade": 32.0,
      "minutos": 2255.0,
      "fatia_pct": 93.3,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 19.8,
      "folga": -37.7,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 23/55; Sprints por 90 min 17/60",
      "pk_app": null
     },
     {
      "jogador": "Vinícius Júnior",
      "clube": "Real Madrid",
      "liga": "Espanha A",
      "idade": 25.0,
      "minutos": 3048.0,
      "fatia_pct": 92.5,
      "com_dado": 2,
      "atende": 2,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 81.5,
      "folga": 24.0,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "fraco",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 85/55; Sprints por 90 min 78/60",
      "pk_app": null
     },
     {
      "jogador": "Cristiano Ronaldo",
      "clube": "Al Nassr",
      "liga": "Arabia Saudita A",
      "idade": 41.0,
      "minutos": 2855.0,
      "fatia_pct": 91.3,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 32.4,
      "folga": -25.1,
      "contrato": "2027-06-30",
      "livre": true,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 22/55; Sprints por 90 min 43/60",
      "pk_app": null
     },
     {
      "jogador": "Gustavo",
      "clube": "Henan",
      "liga": "China",
      "idade": 32.0,
      "minutos": 1282.0,
      "fatia_pct": 89.8,
      "com_dado": 2,
      "atende": 0,
      "aderencia_eixo": null,
      "aderencia_desempate": null,
      "criterios_do_eixo": 0,
      "eixo_detalhe": "",
      "aderencia": 14.6,
      "folga": -42.9,
      "contrato": "",
      "livre": false,
      "estrangeiro": true,
      "fisico_verificado": true,
      "forca_do_fator": "agrupado",
      "minutagem_regular": true,
      "detalhe": "Tempo para girar 90 graus (s) 12/55; Sprints por 90 min 17/60",
      "pk_app": null
     }
    ]
   }
  ]
 },
 "decisoes": {
  "_doc": "As decisões que o estudo sustenta, com o número e a parte de origem de cada uma. Gerado por scripts/gerar_decisoes.py a partir dos <ID>_numeros.json — os mesmos arquivos que o portão confere. Nenhum número é digitado aqui.",
  "gerado_em": "2026-09-21",
  "decisoes": [
   {
    "id": "D1",
    "grupo": "Orçamento",
    "de": "A01",
    "conclusao": "A01-1",
    "decisao": "Montar o elenco para 64 pontos, e planejar 65.",
    "porque": "O 4º colocado fechou entre 62 e 64 pontos nas quatro temporadas do recorte, e 63 teria ficado fora do G4 em 2 delas. 64 apenas EMPATOU com o 4º em 3 das 8 temporadas medidas — e empate não dá vaga.",
    "ressalva": "A linha de baixo é bem mais frouxa: o 17º ficou entre 38 e 42. Escapar do rebaixamento custa muito menos do que subir — são duas decisões de orçamento, não a mesma com margem.",
    "confianca": "indício"
   },
   {
    "id": "D2",
    "grupo": "Orçamento",
    "de": "T01",
    "conclusao": null,
    "decisao": "Orçar duas comissões técnicas no ano.",
    "porque": "A Série B trocou de treinador 1,3 vez por clube-temporada, em média, nas temporadas fechadas. Planejar uma só é planejar o caso raro.",
    "ressalva": "É média de troca, não recomendação de trocar: o T03-2 mediu que trocar de treinador NÃO muda o jeito de jogar do time.",
    "confianca": null
   },
   {
    "id": "D3",
    "grupo": "Modelo de jogo",
    "de": "A02",
    "conclusao": "A02-1",
    "decisao": "Guiar o modelo pela qualidade da chance: chegar a finalizar de dentro, e obrigar o adversário a finalizar de fora.",
    "porque": "É o ÚNICO traço firme do estudo, e três partes independentes chegaram nele. Quem sobe finaliza a 19,5 m do gol contra 20,5 m do meio; é o único traço que acompanha o treinador quando ele troca de clube; e é a única das diferenças de quem sobe que dá para treinar.",
    "ressalva": "O que carrega o sinal é a DISTÂNCIA do chute, não a régua inteira: sem ela, a régua de qualidade de chance perde a porta temporal (parcial +0,191, p 0,0895). Toques e entradas na área vêm junto por construção, não por prova própria.",
    "confianca": "firme"
   },
   {
    "id": "D4",
    "grupo": "Modelo de jogo",
    "de": "A04",
    "conclusao": "A04-1",
    "decisao": "Não montar o time por bola parada, por pressão alta nem por volume de corrida.",
    "porque": "Foram testados e nenhum separa quem sobe do meio: nada do trabalho de bola parada (A04-1), nada do jogo sem bola (A06-2), e correr mais não separou (A07-1). Também não separa depender de casa (A03-1) nem o jeito de construir a jogada (A05-1).",
    "ressalva": "\"Não separa\" aqui quer dizer \"este desenho não conseguiria ver\": com 16 promovidos contra 48 do meio, só uma vantagem grande apareceria. Não é prova de que não importa — é aviso de que não dá para apostar nisso.",
    "confianca": "indício"
   },
   {
    "id": "D11",
    "grupo": "Modelo de jogo",
    "de": "A15",
    "conclusao": "A15-1",
    "decisao": "Defender empurrando a finalização para fora da área, e não tentando reduzir o número de finalizações do adversário.",
    "porque": "Medido dentro do PRÓPRIO time, no mesmo mando: no jogo em que pontua, ele empurra o chute do adversário 0,85 metro para trás e NÃO sofre menos finalização (-0,06 no corte com todos os jogos, sem separar). É o mesmo eixo do D3, agora no lado defensivo e dentro do time, não entre times.",
    "ressalva": "Dentro de um jogo não existe anterioridade: o que o time faz e o ponto acontecem juntos, então nenhuma conclusão de jogo passa de provável. O efeito do placar aqui joga CONTRA o achado — quem está à frente recua e costuma ceder chute de mais perto —, o que o reforça, mas não o prova.",
    "confianca": "provável"
   },
   {
    "id": "D12",
    "grupo": "Modelo de jogo",
    "de": "A15",
    "conclusao": "A15-2",
    "decisao": "Tirar posse, passe ao terço final e escanteio da lista de metas de jogo.",
    "porque": "No jogo em que o próprio time pontua, ele tem 6,18 pontos de posse A MENOS e dá 8,93 passes a menos ao terço final, com 0,89 escanteio a menos. Subir esses números não é o mesmo que somar ponto.",
    "ressalva": "Boa parte disso é reação ao placar: quem está atrás ataca mais, e a base não tem o minuto do gol para separar as duas coisas. Por isso o uso é só negativo — não perseguir esses números —, e não vira \"jogue sem a bola\".",
    "confianca": "provável"
   },
   {
    "id": "D13",
    "grupo": "Orçamento",
    "de": "A16",
    "conclusao": "A16-1",
    "decisao": "Gastar em modelo de jogo antes de gastar em folha.",
    "porque": "A dinheiro igual, subir do quarto de baixo para o quarto de cima da liga em solidez vale +8,9 pontos na temporada — mais do que os 7,0 que o mesmo salto no valor do elenco paga, e esse salto de elenco custa 9,9 mi de euro. Jogar assim equivale a 12,6 mi de elenco; a qualidade da chance, a 17,3 mi.",
    "ressalva": "Duas, e as duas pesam. O estudo mede o que o traço RENDE, não o que ele CUSTA: treinador, treino e jogador têm preço e não estão na conta. E o A12-2 mediu que quem jogou como os que subiram SEM dinheiro caiu mais do que subiu — a receita existe, mas quem a tentou com elenco barato saiu pior.",
    "confianca": "provável"
   },
   {
    "id": "D14",
    "grupo": "Modelo de jogo",
    "de": "A16",
    "conclusao": "A16-2",
    "decisao": "Não prometer que mudar o jeito de jogar no meio do ano traz os pontos do returno.",
    "porque": "O teste de anterioridade passava para a distância do chute (+0,289) e para a régua da qualidade da chance (+0,254). Pondo o dinheiro no mesmo desconto, caem para +0,198 e +0,057, e nenhum dos 8 traços passa.",
    "ressalva": "Isto não derruba o D13: a associação a dinheiro igual continua de pé. Derruba a frase \"jogue assim e os pontos vêm depois\". E o valor do Transfermarkt é da temporada inteira, sem data conhecida — se foi atualizado no meio do ano, ele carrega parte do resultado e o controle fica forte demais. É um teto para a anterioridade, não a medida dela.",
    "confianca": "indício"
   },
   {
    "id": "D5",
    "grupo": "Contratação",
    "de": "J05",
    "conclusao": "J05-3",
    "decisao": "Usar minutagem alta e regular como PRIMEIRO filtro, e só depois olhar o resto.",
    "porque": "É o único requisito que a base sustenta por posição (J05-3). O corte de minutagem de quem subiu varia muito entre posições: Goleiro 64,7% · Zaga 56,8% · Volante 51,0% · Lateral 46,8% · Meia 42,5% · Atacante 34,2% · Extremo 32,4%.",
    "ressalva": "A ficha completa NÃO deve ser filtro eliminatório: como conjunção de pisos, ela reprova todo mundo — o J06-1 é exatamente isso, \"nenhum nome sai desta parte por falha da ficha\". O resto da ficha ordena, não elimina. Desde 21/09 a lista desta aba funciona assim: a minutagem corta, e o que sobra é ordenado pelo eixo da qualidade da chance, com físico e duelo desempatando (a regra está em J06_ordenacao.json). Quem jogou pouco por LESÃO cai junto com quem jogou pouco por escolha — o J01-2 mediu que a base não distingue os dois —, e por isso o número de quem saiu no corte vai à vista.",
    "confianca": "indício"
   },
   {
    "id": "D6",
    "grupo": "Contratação",
    "de": "J06",
    "conclusao": "J06-3",
    "decisao": "Não contar com o mercado de livres: ele é curto demais.",
    "porque": "Em TODA a Série B há 51 jogadores livres com minutagem alta e regular. Por posição: Meia 13 · Lateral 9 · Zaga 8 · Atacante 8 · Volante 6 · Extremo 6 · Goleiro 1.",
    "ressalva": "No gol são 1. Posição escassa não se resolve esperando a janela — se resolve antes dela, ou por outro caminho.",
    "confianca": "indício"
   },
   {
    "id": "D7",
    "grupo": "Contratação",
    "de": "J09",
    "conclusao": "J09-3",
    "decisao": "Escolher goleiro por vídeo e olho, não por esta base.",
    "porque": "O J09-3 fechou assim: no gol a base não tem como apontar um nome. Dos 584 candidatos, 0 chegaram ao fim do funil. E o SkillCorner não rastreia goleiro.",
    "ressalva": "Isto não é opinião sobre goleiro: é limite de dado, medido. Vale enquanto a base for esta.",
    "confianca": "indício"
   },
   {
    "id": "D8",
    "grupo": "Elenco",
    "de": "J02",
    "conclusao": "J02-3",
    "decisao": "Concentrar minutos em um núcleo fixo, e planejar a janela do meio desde já.",
    "porque": "Quem sobe concentra 68,1% dos minutos nos onze mais usados, contra 63,1% do meio. E 69,8% dos minutos da Série B são de jogador que chegou naquele mesmo ano — a janela do meio não é exceção, é como a liga funciona.",
    "ressalva": "Manter a base do ano anterior NÃO aparece como vantagem de quem sobe (J02-2). O que separa é concentrar minutos, não a origem do jogador.",
    "confianca": "provável"
   },
   {
    "id": "D9",
    "grupo": "Temporada",
    "de": "A13",
    "conclusao": "A13-3",
    "decisao": "Tratar a metade do campeonato como alarme, não como sentença.",
    "porque": "Na rodada 19, 10 dos 16 acessos já estavam no G4 — e o resto virou depois. Quem cai já está 5,5 pontos atrás do meio na metade.",
    "ressalva": "A tabela da metade dá vantagem, não garante a vaga (A13-3). Decisão de meio de ano tomada como se a tabela fosse definitiva erra nos dois lados.",
    "confianca": "provável"
   },
   {
    "id": "D10",
    "grupo": "Treinador",
    "de": "T02",
    "conclusao": null,
    "decisao": "Escolher treinador pelo PISO das passagens, não pela melhor delas.",
    "porque": "Treinador de clube do top-5 de valor entrega 14,6 rodadas no G4, contra 3,2 de quem trabalha nos 40 clubes mais baratos — e 22 desses nunca chegaram ao G4. Resultado de treinador vem colado ao elenco que ele pegou.",
    "ressalva": "Por isso o T04 ordena pelo piso: a melhor passagem de um treinador diz mais sobre o clube dele do que sobre ele. E o T04-2 mediu que esta base NÃO mostra o histórico do treinador reaparecendo no clube seguinte.",
    "confianca": null
   }
  ],
  "como_ler": "Cada decisão leva o selo da conclusão que a sustenta. FIRME passou na correção para múltiplos testes E na porta temporal; PROVÁVEL passou em um dos dois; INDÍCIO em nenhum, e a frase diz por quê. Decisão com selo fraco não é decisão errada — é decisão que se toma sabendo o tamanho da aposta."
 },
 "validadas": [
  {
   "id": "A01-1",
   "parte": "A01",
   "bloco": "A",
   "manchete": "Elenco de 63 pontos teria ficado fora do G4 em 2 das 4 temporadas",
   "o_que_vimos": "O 4º fechou com 62 (2022), 64 (2023), 64 (2024) e 62 (2025), com 16 a 19 vitórias; em 2026 vai em ritmo de 66. Um elenco de 63 pontos teria ficado fora do G4 em 2 das 4 temporadas do recorte. Nas quatro anteriores, fora dele, o corte variou mais e 63 falhou em 2021.",
   "para_o_santa_cruz": "Montar o elenco contra 64 pontos, e não contra os 63 do meio da faixa: 63 não teria subido em 2023, em 2024 nem em 2021. E como 64 apenas empatou com o 4º em 3 dessas 8 temporadas, quem quer sair do desempate planeja 65 — uma vitória a mais. A linha de baixo é bem mais frouxa — o 17º ficou entre 38 e 42 no recorte e entre 39 e 43 nas quatro anteriores —, então escapar do rebaixamento custa bem menos do que subir: são duas decisões de orçamento diferentes, não a mesma com margem.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Sugere premissa nova em dados/premissas.json, grupo Elenco: o custo do acesso é de 62 a 64 pontos nas quatro temporadas do recorte (60 a 64 nas oito que a base tem) e o planejamento usa o topo da faixa, 64, com 65 como folga de desempate — nunca a mediana. Nenhuma premissa atual fixa o acesso em pontos; a p7 fixa só o objetivo.",
   "confianca": "indício",
   "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios da régua. (1) Correção para múltiplos testes (Benjamini-Hochberg a 5% por família): não há o que corrigir — não existe A01_testes.csv e scripts/A01.py não importa scripts/_metodo.py; as únicas contas da parte são contagem e mediana sobre os pontos do 4º e do 17º. (2) Porta temporal da §6.4 (1º turno prevendo o 2º): não rodou em A01, e _porta_temporal.md registra que nenhuma das 19 partes a rodou. Há ainda motivo material: a faixa de 62 a 64 é propriedade das 4 temporadas do recorte — nas quatro anteriores o corte vai de 60 a 64, e o ritmo de 2026 está em 66. O que saiu do que vimos e fica registrado aqui, onde o jargão é permitido: a conclusão é contagem completa das tabelas, sem teste e sem leitura à frente do resultado, e por isso não há tamanho de efeito, poder nem q para reportar. Nas quatro temporadas anteriores (2018–2021), que estão na base mas fora do recorte, o 4º fechou com 60, 62, 61 e 64 pontos, com 15 a 18 vitórias, e um elenco de 63 pontos também teria ficado fora em 2021 — três das oito temporadas da base.",
   "n": "4 temporadas fechadas (2022–2025); as quatro anteriores (2018–2021) conferidas na base",
   "prova": "A01_regua.csv; A01.md, seção Prova",
   "status": "validada",
   "negativa": false,
   "grafico": {
    "tipo": "barras",
    "titulo": "Pontos do 4º colocado, ano a ano",
    "unidade": "pontos",
    "barras": [
     {
      "nome": "2018",
      "valor": 60
     },
     {
      "nome": "2019",
      "valor": 62
     },
     {
      "nome": "2020",
      "valor": 61
     },
     {
      "nome": "2021",
      "valor": 64
     },
     {
      "nome": "2022",
      "valor": 62
     },
     {
      "nome": "2023",
      "valor": 64
     },
     {
      "nome": "2024",
      "valor": 64
     },
     {
      "nome": "2025",
      "valor": 62
     }
    ],
    "linha_de_corte": 63
   }
  },
  {
   "id": "A01-2",
   "parte": "A01",
   "bloco": "A",
   "manchete": "Quem desempata o acesso é a vitória, não o saldo de gols",
   "o_que_vimos": "A margem do 4º para o 5º foi de 4 (2022), 1 (2023), 0 (2024) e 1 (2025), um ponto ou menos em 3 dos 4 anos. Em 2024 Ceará e Novorizontino empataram em 64 pontos e o acesso saiu nas vitórias. Em 2018 o Goiás subiu à frente da Ponte Preta com os mesmos pontos e saldo menor.",
   "para_o_santa_cruz": "Um jogo decide o ano, e quem desempata é a vitória, não a goleada: com pontos iguais, ganhar por 1 a 0 vale mais do que golear. O ponto que falta vem do que separa quem sobe com e sem os times colados na linha — de onde o time finaliza e a qualidade da chance que ele cede. Bola parada não entra mais nesta frase como alavanca descartada: ela separa com os 20 times e só falha quando se tiram os colados na linha; e o fim de jogo fica de fora porque não existe minuto do gol em base nenhuma.",
   "premissa": "m7",
   "premissa_titulo": "Salário baixo, premiação alta por vitória e acesso",
   "premissa_grupo": "Montagem do elenco",
   "premissa_motivo": "Confirma a m7 (salário baixo, premiação alta por vitória): como o desempate do acesso é vitória, e não saldo, o bicho por vitória está alinhado ao critério que de fato decide o ano — e isso vale nas duas janelas, com 2024 e 2018 como casos. Não sugere premissa nova.",
   "confianca": "indício",
   "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios da régua. (1) Benjamini-Hochberg a 5% por família: não roda — não existe A01_testes.csv e scripts/A01.py não importa scripts/_metodo.py; as margens são leitura direta da coluna margem_4o_5o de A01_regua.csv. (2) Porta temporal da §6.4: não rodou em A01 (_porta_temporal.md registra que nenhuma das 19 partes a rodou). O uso prático é forte e o achado sobrevive aos dois cortes — vale nas quatro temporadas do recorte e nas quatro anteriores, onde o desempate por vitória fica até mais claro —, então é indício, e não queda. O que saiu do que vimos e fica registrado aqui, onde o jargão é permitido: a conclusão é contagem completa das tabelas, sem teste por trás, logo sem tamanho de efeito e sem q. Nas quatro temporadas anteriores as margens foram 0, 1, 3 e 2, o que leva a margem de um ponto ou menos a cinco das oito temporadas da base; em 2018 o mesmo desempate apareceu mais claro, com o Goiás subindo com 60 pontos e saldo de 4 à frente da Ponte Preta, com os mesmos 60 pontos e saldo de 12.",
   "n": "4 temporadas fechadas (2022–2025); as quatro anteriores (2018–2021) conferidas na base",
   "prova": "A01_regua.csv; A01.md, seção Prova",
   "status": "validada",
   "negativa": false,
   "grafico": {
    "tipo": "barras",
    "titulo": "Vitórias do 4º e do 5º no empate de 2024",
    "unidade": "vitórias",
    "barras": [
     {
      "nome": "Sobe, o 4º em 2024",
      "valor": 19
     },
     {
      "nome": "Trave, o 5º em 2024",
      "valor": 18
     }
    ]
   }
  },
  {
   "id": "A01-3",
   "parte": "A01",
   "bloco": "A",
   "manchete": "8 dos 16 promovidos fecharam na fronteira do G4",
   "o_que_vimos": "8 dos 16 promovidos e 9 dos 16 da Trave fecharam na fronteira do G4. A Trave ficou entre 56 e 64 pontos, mediana 60,5, ou seja 2,5 pontos abaixo do corte. No total, 28 das 80 campanhas fechadas ficaram na fronteira de uma das duas linhas.",
   "para_o_santa_cruz": "A distância entre subir e ficar na Trave é de 2,5 pontos na mediana, e em 9 dos 16 casos foi de 3 pontos ou menos — perto o bastante para o acaso pesar no que se lê como característica. Por isso toda comparação de faixa deste estudo roda com e sem os times colados na linha, e o que só aparece num dos dois não vira critério de contratação. Quem usar a campanha rodada a rodada que esta parte entrega precisa saber que ela discorda da tabela oficial em 8 de 100 clube-temporadas, 5 delas nas quatro temporadas fechadas.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Não trata de nenhuma premissa existente.",
   "confianca": "indício",
   "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios da régua. (1) Benjamini-Hochberg a 5% por família: não roda — não existe A01_testes.csv, e a contagem de colados na linha sai das colunas fronteira_g4 e fronteira_z4 de A01_clube_temporada.csv. (2) Porta temporal da §6.4: não rodou. A versão anterior ainda afirmava que a Trave é o mesmo time de quem sobe com dois pontos a menos: isso é um \"não separa\" sem poder calculado, que A01 não tem como sustentar (o script não importa scripts/_metodo.py e não calcula d mínimo). O texto agora fica dentro do que a contagem mostra, e a mesma contagem se repete na tabela remontada jogo a jogo. O que saiu do que vimos e fica registrado aqui, onde o jargão é permitido: a cobertura da fronteira por faixa é de 50% entre os que sobem, 33% no meio e 25% entre os que caem, e nenhum teste aqui diz se a Trave joga diferente de quem sobe — não há poder calculado nem tamanho de efeito. Refazendo a mesma contagem pela tabela remontada jogo a jogo em vez da oficial, todos esses números se repetem e só o piso da Trave muda, de 56 para 55.",
   "n": "80 clube-temporadas fechadas (2022–2025), das quais 16 promovidos e 16 na Trave",
   "prova": "A01_clube_temporada.csv; A01.md, seção Prova",
   "status": "validada",
   "negativa": false,
   "grafico": {
    "tipo": "barras",
    "titulo": "Campanhas na fronteira do G4, por faixa",
    "unidade": "casos",
    "barras": [
     {
      "nome": "Sobe",
      "valor": 8
     },
     {
      "nome": "Trave",
      "valor": 9
     }
    ],
    "linha_de_corte": 16
   }
  },
  {
   "id": "A02-1",
   "parte": "A02",
   "bloco": "A",
   "manchete": "Quem sobe finaliza de mais perto",
   "o_que_vimos": "Quem sobe finaliza a 19,5 m do gol e o meio a 20,5 m, quase um metro mais perto. E quem já finalizava de perto nas 19 primeiras rodadas fez mais pontos nas 19 seguintes, mesmo contra quem pontuava igual. Em volume de chute, este estudo não conseguiria ver diferença.",
   "para_o_santa_cruz": "É a única coisa que este estudo mostra separando quem sobe do meio E vindo antes do resultado, e por isso é a que deve guiar o modelo de jogo: chegar à finalização de dentro, em vez de perseguir número de chutes. Na montagem do elenco isso pede quem ataca a área — atacante que se movimenta nas costas da zaga, meia que chega na área, lateral que entra em vez de cruzar de longe —, e J05 tem de virar isso em requisito de posição, nunca em volume de finalização. Vale a ressalva: a medida vem antes dos pontos dentro da mesma temporada e com o mesmo elenco, e é a melhor prova que o estudo tem, não uma receita de acesso.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Sugere uma premissa nova: na Série B, de onde se finaliza antecipa pontos; quanto se finaliza, não.",
   "confianca": "firme",
   "confianca_motivo": "Firme porque passa nas DUAS provas, conferidas linha a linha no A02_testes.csv em 19/09. (a) Benjamini-Hochberg a 5% dentro da família “o que cria” (7 indicadores): a distância da finalização passa NOS DOIS CORTES DE FRONTEIRA — q 0,00009 com os 20 times de cada ano (16x48, d 1,203, poder suficiente contra um d mínimo de 0,82) e q 0,02 sem os times de fronteira (8x32, d 1,08, d mínimo 1,14). Nada em A02 é firme SÓ COM a fronteira, então a regra da fronteira não descarta nada aqui: ela obriga a publicar o corte cheio e a dizer o outro. (b) Porta temporal da §6.4: PASSA, e é a única de A02 que passa — parcial +0,29 (p 0,01), n = 80, do indicador das 19 primeiras rodadas sobre os pontos das 19 últimas, dada a pontuação que o time já tinha (_porta_temporal.json, 19/09; a própria §6.4 da especificação publica -0,289, p 0,009, na escala crua). Dois sim = FIRME. Pela conciliação com A05-1 esta é a única conclusão firme do estudo inteiro, e por isso ela cede a palavra “única” no uso prático: passa a dizer “a única que separa quem sobe E vem antes do resultado”, porque a posse também passa na porta temporal (parcial +0,227, p 0,043) mas não separa na base inteira. ROBUSTEZ (varredura de 19/09): os dois cortes dizem a mesma coisa e o texto publica os dois. Volume não separa nos QUATRO testes — finalizações q 0,419 com fronteira e 0,17 sem; finalizações sofridas q 0,429 com fronteira e 0,12 sem —, então a negativa não depende de corte; mesmo assim ela vai com a frase fixa da §6.7, porque no corte reduzido o desenho só veria d ≥ 1,14 e os observados são 0,66 e 0,63. O que NÃO volta, e por quê: toques na área (q 0,084 com fronteira / 0,04 sem), entradas na área (q 0,110 com fronteira / 0,04 sem) e xG sofrido por jogo (q 0,065 com fronteira e, sem os de fronteira, o menor q desta lista, que a tela com duas casas arredonda para 0) são firmes SÓ no corte reduzido, que o _metodo_fronteira.md documenta como enviesado por construção — pela regra da fronteira valem no máximo como indício e saem da frase que os chamava de “o que separa”. Sai também a metade defensiva da manchete anterior (“sofre de outro lugar”): o lugar do chute sofrido não está na lista pré-declarada e, testado, dá p 0,070 com fronteira e 0,081 sem; o parecer que tentou salvá-la usou a fatia de chute de fora da área, escolhida DEPOIS de ver o resultado, o que o CLAUDE.md proíbe. Com o xG fora da conclusão, a marca “pode ser efeito do placar” (emenda 2 da lista pré-declarada) deixa de ser obrigatória aqui. Teste de Welch no posto dentro da temporada, IC por bootstrap de clube. ETAPA 8 (20/09), o que saiu do texto de 10 segundos e passou a morar aqui: os dois cortes da distância (19,5 contra 20,5 com os 20 times, 19,67 contra 20,52 sem os times de fronteira) foram para o gráfico dois_cortes, que os mostra lado a lado; e com eles o volume, que não separa de nenhum dos dois lados — 12,6 finalizações por jogo contra 12,3 do meio, e 11,6 sofridas contra 12,1 —, com os d observados (0,66 e 0,63) abaixo do mínimo detectável em cada corte (0,82 com os 20 times, 1,14 sem os de fronteira). A porta temporal, o poder e os q continuam acima, sem corte nenhum. CONSERTO (20/09, conferência do cético): duas ressalvas voltaram ao texto de 10 segundos, porque nenhuma das duas podia morar só neste tooltip. (i) A negativa do volume passou a ir com a frase fixa da §6.7 — “não separa” significa “este desenho não conseguiria ver” —, em vez de ser afirmada como fato: o que a §8.3 manda para cá é o NÚMERO do poder (d observados 0,66 e 0,63 contra o mínimo detectável 1,14 sem os times de fronteira e 0,82 com os 20 times), não a licença de escrever que volume de chute não existe como diferença. É o defeito poder_nao_calculado da _auditoria_18_09.md. (ii) “com o mesmo elenco” voltou a ser “mesmo contra quem pontuava igual”: o controle da porta temporal da §6.4 é pela pontuação JÁ ACUMULADA (parcial +0,29, p 0,01, dada a pontuação que o time já tinha), e é ele que impede a leitura trivial de que time bom pontua mais depois; o limite de ser dentro da mesma temporada já estava no uso prático.",
   "n": "16 promovidos contra 48 do meio, e 8 contra 32 sem os times colados na linha; 80 clube-temporadas no teste de anterioridade",
   "prova": "A02_testes.csv; _porta_temporal.json, componentes; A02_numeros_novos.json; _metodo_fronteira.md; A02.md, seção Prova",
   "status": "validada",
   "negativa": false,
   "grafico": {
    "tipo": "dois_cortes",
    "titulo": "Distância da finalização",
    "unidade": "metros",
    "cortes": [
     {
      "rotulo": "com todos os times",
      "series": [
       {
        "nome": "Sobe",
        "valor": 19.5
       },
       {
        "nome": "Meio",
        "valor": 20.5
       }
      ]
     },
     {
      "rotulo": "sem os times de fronteira",
      "series": [
       {
        "nome": "Sobe",
        "valor": 19.669
       },
       {
        "nome": "Meio",
        "valor": 20.522
       }
      ]
     }
    ]
   }
  },
  {
   "id": "A02-2",
   "parte": "A02",
   "bloco": "A",
   "manchete": "Quem sobe cede finalização pior, não finalização a menos",
   "o_que_vimos": "Quem sobe sofre 11,6 finalizações por jogo e o meio 12,1: praticamente o mesmo. O que muda é o tamanho da chance cedida, 8,9 gols esperados a cada cem finalizações contra 9,8 do meio. Isso é critério de montagem, não promessa de acesso.",
   "para_o_santa_cruz": "Proteger a área vale mais do que reduzir o número de chutes do adversário: o alvo é o tipo de finalização que se cede, não a quantidade, e isso é critério de montagem de zaga, laterais e volante de proteção. Mas o estudo não consegue mostrar que isso vem antes do resultado — o time que já está na frente cede chute pior —, e a régua que mede a qualidade da chance cedida repete só um terço de si mesma entre uma metade dos jogos e a outra; entra como critério de montagem, nunca como promessa de acesso. Sobre criar, o estudo não diz nada: a diferença de xG criado (1,28 contra 1,18 por jogo) é menor do que este número de times consegue enxergar, e aqui “não separa” significa “este desenho não conseguiria ver”.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Sugere uma premissa nova: na Série B, o que separa na defesa é o tipo de chance que se cede, não o número de finalizações sofridas — com a ressalva de que o estudo não mostra que isso vem antes do resultado.",
   "confianca": "provável",
   "confianca_motivo": "Provável: passa numa prova e não na outra, conferido no A02_testes.csv em 19/09. (a) Benjamini-Hochberg a 5% dentro da família “o que cede” (4 indicadores): o xG por finalização sofrida passa NOS DOIS CORTES DE FRONTEIRA — q 0,02076 com os 20 times de cada ano (16x48, d 0,805) e, sem os times de fronteira, um q menor ainda (8x32, d 1,3), que a tela com duas casas arredonda para 0. O BH não depende de qual família o corrigiu: o A06 rodou o MESMO teste bit a bit na família “cede_ajustado” e deu q 0,03113 e 0,00967, também abaixo de 5%. (b) Porta temporal da §6.4: NÃO PASSA — parcial -0,026 (p 0,8213), n = 80 (_porta_temporal.json, 19/09): saber quem cedia chute ruim nas 19 primeiras rodadas não acrescenta nada sobre os pontos das 19 últimas depois de saber quantos pontos o time já tinha. É porta B, “firme, mas o 1º turno não previu o 2º”. Um sim de dois = PROVÁVEL. Duas ressalvas obrigatórias, que não mudam o nível mas têm de estar no texto: “pode ser efeito do placar” (emenda 2 da própria lista pré-declarada) e RÉGUA CURTA — a confiabilidade split-half do xG por finalização sofrida foi medida em 19/09 e deu 0,36, abaixo do piso de 0,40 da §3, o mesmo problema do xG criado (0,3). Não cai para indício: o indicador em si é firme nos dois cortes; o que caiu foi a ordenação entre os lados, que sai da manchete. ROBUSTEZ (varredura de 19/09): este é o caso mais grave da parte e a manchete INVERTE. Com os 20 times, o maior efeito que não é placar redescrito é de ATAQUE (distância da finalização, d 1,203, q 0,00009) e o melhor defensivo fica em d 0,805; sem os times de fronteira a ordem troca (defesa d 1,3 contra ataque d 1,08). Como qual lado é maior depende do corte — e a diferença ENTRE efeitos nunca foi testada, com os intervalos se sobrepondo —, a frase “o lado que mais separa é o defensivo” cai inteira, e com ela o motivo de confiança anterior, que invocava os dois cortes mas comparava tamanhos usando só um. O xG sofrido por jogo não vira manchete: é firme só no corte reduzido (q 0,065 com fronteira contra um q muito menor sem, que a tela também arredonda para 0), então entra no texto com o corte dito, como apoio. O empate em volume de finalizações sofridas vale nos dois cortes (q 0,429 com fronteira e q 0,12 sem). E sai a impressão de dupla prova: o A06-3 publica o mesmo teste bit a bit com outro q; pela conciliação o dono do indicador é o A02 e o A06 cede a cópia. Teste de Welch no posto dentro da temporada, IC por bootstrap de clube. ETAPA 8 (20/09), o que saiu do texto de 10 segundos e passou a morar aqui: o xG sofrido por jogo (1,02 contra 1,18 com os 20 times, 1 contra 1,19 sem os times de fronteira; q 0,065 com fronteira contra o q muito menor do corte reduzido), que é firme só no corte reduzido e por isso não sustenta mais frase visível; e o empate em volume (11,6 contra 12,1; q 0,429 com fronteira e q 0,12 sem), que o texto agora diz em uma frase, sem repetir o corte. O gráfico publica o xG por finalização sofrida no corte cheio, o único par de marcadores medido nessa unidade, e é tipo grupos e não dois_cortes de propósito: o indicador passa nos DOIS cortes (q 0,02076 com os 20 times e um q menor ainda sem os de fronteira), então não há fragilidade de corte escondida atrás de um gráfico de um corte só. A marca “pode ser efeito do placar” e a confiabilidade curta (0,36) continuam obrigatórias, e o uso prático as diz por escrito, porque não podem morar só neste tooltip.",
   "n": "16 promovidos contra 48 do meio, e 8 contra 32 sem os times colados na linha; 80 clube-temporadas no teste de anterioridade",
   "prova": "A02_testes.csv; _porta_temporal.json, componentes; A02_numeros_novos.json; _metodo_fronteira.md; A02.md, seção Prova",
   "status": "validada",
   "negativa": false,
   "grafico": {
    "tipo": "grupos",
    "titulo": "Tamanho da chance cedida, com todos os times",
    "unidade": "gols esperados a cada cem finalizações",
    "series": [
     {
      "nome": "Sobe",
      "valor": 8.9
     },
     {
      "nome": "Meio",
      "valor": 9.8
     }
    ]
   }
  },
  {
   "id": "A03-2",
   "parte": "A03",
   "bloco": "A",
   "manchete": "Quem sobe ganha mais dividida nos dois mandos e só sofre menos em casa",
   "o_que_vimos": "Em casa, quem sobe cede 0,8 de xG por jogo contra 1,02 do meio. Fora, a distância encolhe para 1,29 contra 1,36 e o teste só a enxerga no corte sem os times de fronteira, que o método da casa trata como enviesado.",
   "para_o_santa_cruz": "A dividida defensiva ganha é exigência de time e de modelo de jogo, não requisito individual de contratação: é o único traço desta parte que aparece dentro e fora de casa, com e sem os times colados na linha. É o mesmo indicador do A06 aberto por mando, não uma segunda medição, e ceder pouco perigo só se sustenta em casa: trate isso como modelo de jogo. Não escreva que o traço é do jogador e não do ambiente — sem recorte por estado do jogo, esta parte não consegue separar as duas coisas.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Sugere uma premissa nova em Montagem do elenco: a dividida defensiva ganha é exigência de time — é o traço que viaja, aparece dentro e fora de casa —, nunca requisito individual de contratação. Não contradiz a m1 (time físico): intensidade física não foi medida nesta parte.",
   "confianca": "provável",
   "confianca_motivo": "Provável: passa num critério e não no outro. Correção para múltiplos testes: sim, e nos dois cortes — xG sofrido por jogo em casa, duelos defensivos ganhos em casa e duelos defensivos ganhos fora ficam abaixo de 5% com e sem a fronteira, sendo 0,03030 o pior q dos seis. A quarta perna não: o xG sofrido por jogo fora dá q 0,23734 com a fronteira e 0,02585 sem, passa só no corte reduzido — que o _metodo_fronteira.md chama de enviesado por construção — e por isso fica fora da manchete. Porta temporal da §6.4: não, e aqui ela rodou: em _porta_temporal.md o xG sofrido em casa dá parcial +0,134 (p 0,2363) e a dividida em casa −0,026 (p 0,8183), as duas reprovadas; a dividida fora não foi testada, por não ser componente do A14. Duas ressalvas: com 80 linhas só uma parcial de cerca de 0,31 para cima seria detectável, então reprovar não prova que o traço venha depois do resultado; e falta o split-half de confiabilidade do xG sofrido EM CASA, que é a perna principal — existem 0,490 (xG criado em casa) e 0,482 (xG sofrido fora), acima do piso de 0,40 e refeitos pelos três pareceres da auditoria de 18/09, mas o xG sofrido em casa nunca foi medido em separado, e o valor de temporada inteira que a v1 mandava citar não é a confiabilidade desta medida. Sem os times colados na linha a vantagem aumenta, não diminui: xG sofrido em casa 0,736 contra 1,026 (era 0,8 contra 1,02 com todos os times), dividida em casa 62,541 contra 60,381 e dividida fora 61,411 contra 59,663. Etapa 8, o que saiu do texto para cá: a dividida defensiva ganha foi para o gráfico, nos dois mandos e no corte com todos os times, e o xG sofrido fora (1,29 contra 1,36) ficou no texto sem selo, porque o teste não o enxerga no corte principal. O corte sem a fronteira não entrou no gráfico porque esta parte não publica o quadro por faixa nesse corte — os valores estão acima, vindos de recálculo de auditoria. O que se vê fora também pode ser efeito do placar: quem visita passa mais tempo atrás. Etapa 8, conserto: a dependência do corte de fronteira no xG sofrido fora voltou ao o_que_vimos, porque o gráfico mostra um corte só — divididas com todos os times — e a fragilidade do 'só' não pode morar apenas no tooltip do selo. O gráfico continua em grupos, e não em dois cortes, porque o corte reduzido não tem marcador nem para a dividida nem para o xG sofrido: os valores existem em A03_testes.csv (62,541 contra 60,381 na dividida em casa, 61,411 contra 59,663 fora, 1,253 contra 1,394 no xG sofrido fora) e inventar marcador seria pior que mostrar um corte só declarado no título. Etapa 8, terceira passada: o corte reduzido voltou ao o_que_vimos com o rótulo que lhe cabe. Dizer apenas que o teste enxerga a diferença 'quando se tiram os times de fronteira' lê como 'aparece no corte mais limpo', e o _metodo_fronteira.md diz o contrário — o filtro reforça um grupo e enfraquece o outro, infla qualquer diferença por construção, e firme só sem fronteira é suspeito, não promovido; a tabela daquele arquivo lista xgc_fora em Sobe × Meio na coluna 'caiu para suspeito'. O gráfico mostra um corte só, então o rótulo de enviesado não podia morar apenas no tooltip do selo. Coube sem tirar nada: 213 caracteres na tela.",
   "n": "16 promovidos contra 48 do meio, e 8 contra 32 sem os times colados na linha",
   "prova": "A03_testes.csv, família casa e fora na comparação SM; A03_resumo.json, quadro_por_faixa; _porta_temporal.md; _metodo_fronteira.md",
   "status": "validada",
   "negativa": false,
   "grafico": {
    "tipo": "grupos",
    "titulo": "Divididas defensivas ganhas, com todos os times",
    "unidade": "%",
    "series": [
     {
      "nome": "Sobe em casa",
      "valor": 60.932
     },
     {
      "nome": "Meio em casa",
      "valor": 60.05
     },
     {
      "nome": "Sobe fora",
      "valor": 60.605
     },
     {
      "nome": "Meio fora",
      "valor": 59.578
     }
    ]
   }
  },
  {
   "id": "A03-3",
   "parte": "A03",
   "bloco": "A",
   "manchete": "Quem cai cria menos em casa e sofre mais fora",
   "o_que_vimos": "Em casa, quem cai cria 1,26 de xG por jogo contra 1,39 do meio, e longe de casa sofre mais. Quem cai é pior nos quatro números, então não são dois problemas separados por mando. Parte disso pode ser o placar: quem cai passa mais tempo atrás longe de casa.",
   "para_o_santa_cruz": "É o retrato a não repetir: elenco que não cria dentro de casa e não protege a área longe dela. Não trate como dois problemas separados por mando — quem cai é pior nos quatro números, e os testes só isolaram onde a diferença cruzou a linha. Na montagem, o requisito é criar e proteger sempre; não existe 'reforço para jogo fora'.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Não trata de nenhuma premissa existente e não sugere nova.",
   "confianca": "provável",
   "confianca_motivo": "Provável: passa num critério e não no outro. Correção para múltiplos testes: sim, e nos dois cortes — xG criado por jogo em casa e xG sofrido por jogo fora ficam abaixo de 5% com e sem a fronteira, sendo 0,00827 o pior q dos quatro. Porta temporal da §6.4: não — o scripts/A03.py não roda porta nenhuma, e a rodada de 19/09 cobriu só os oito componentes do A14, que não incluem nenhuma das duas pernas. O que a conclusão NÃO afirma é a assimetria: os dois testes diretos e pré-declarados não passam em corte nenhum e, no corte principal, nem chegam perto — xG criado casa menos fora p 0,28372 com a fronteira contra 0,12512 sem; xG sofrido fora menos casa p 0,21983 contra 0,07426. O recorte por mando é onde a diferença cruzou a linha, não um achado, e quem cai é pior nos quatro números. Sai a ressalva de confiabilidade que a v1 pedia: os três pareceres da auditoria de 18/09 refizeram o split-half por mando e acharam 0,490 no xG criado em casa e 0,482 no xG sofrido fora, as duas pernas desta conclusão, acima do piso de 0,40. Etapa 8, o que saiu do texto para cá: o xG sofrido fora nos dois cortes foi para o gráfico (1,56 contra 1,36 com todos os times, 1,65 contra 1,39 sem os times de fronteira). O xG sofrido fora pode ser efeito do placar: quem cai passa mais tempo atrás do marcador longe de casa. Etapa 8, conserto: a ressalva do placar voltou também ao o_que_vimos, porque o para_o_santa_cruz desta conclusão não tem frase equivalente e sem ela o 'não protege a área longe dela' vira traço de elenco a contratar.",
   "n": "16 do Cai contra 48 do Meio, e 12 contra 32 sem os times colados na linha",
   "prova": "A03_testes.csv, comparação CM; A03_resumo.json, quadro_por_faixa; _metodo_fronteira.md",
   "status": "validada",
   "negativa": false,
   "grafico": {
    "tipo": "dois_cortes",
    "titulo": "xG sofrido fora de casa",
    "unidade": "xG por jogo",
    "cortes": [
     {
      "rotulo": "com todos os times",
      "series": [
       {
        "nome": "Cai",
        "valor": 1.557
       },
       {
        "nome": "Meio",
        "valor": 1.364
       }
      ]
     },
     {
      "rotulo": "sem os times de fronteira",
      "series": [
       {
        "nome": "Cai",
        "valor": 1.646
       },
       {
        "nome": "Meio",
        "valor": 1.394
       }
      ]
     }
    ]
   }
  }
 ],
 "negativas": [
  {
   "id": "A02-3",
   "parte": "A02",
   "bloco": "A",
   "manchete": "A sobra de gol de quem sobe não se contrata",
   "o_que_vimos": "Quem sobe converte melhor que o meio com os vinte times de cada ano. Sem os times de fronteira a vantagem fica menor, e lá até quem sobe fica abaixo do que as chances pediam. No goleiro não dá para ver diferença, nem que a sobra se repita de uma metade do ano à outra.",
   "para_o_santa_cruz": "Não se contrata pontaria e não se aposta em ano de goleiro inspirado: essa sobra é o placar contado de outro jeito, e o método da casa proíbe usá-la como característica de quem sobe. O que se procura é o que produz a chance boa e o que reduz a chance cedida — finalizar de perto e proteger a área. Dois avisos: pode ser efeito do placar, e, como a régua é curta, ninguém pode usar este estudo para dizer que a sobra é pura sorte — ele só mostra que não dá para comprá-la.",
   "premissa": "m4",
   "premissa_titulo": "Goleiro top — investir",
   "premissa_grupo": "Montagem do elenco",
   "premissa_motivo": "Ajusta m4 (Goleiro top — investir): o time defender acima do que as chances pediam não separa quem sobe do meio em corte nenhum e não tem relação de uma metade do ano para a outra. A premissa continua de pé por outros motivos, mas não pode se apoiar neste estudo — ele mede o time, não a qualidade do goleiro.",
   "confianca": "provável",
   "confianca_motivo": "Provável: passa numa prova e não na outra, conferido no A02_testes.csv em 19/09. (a) Benjamini-Hochberg a 5% dentro da família “a sobra” (2 indicadores): gols menos xG passa NOS DOIS CORTES DE FRONTEIRA — q 0,00004 com os 20 times de cada ano (16x48, d 1,257, poder suficiente contra um d mínimo de 0,82) e q 0,04 sem os times de fronteira (8x32, d 1,06, d mínimo 1,14); e é o único dos 13 indicadores a separar Sobe de Trave, também nos dois cortes (q 0,00144 com fronteira e q 0,03821 sem). (b) Porta temporal da §6.4: NÃO PASSA, porque nunca foi rodada para este indicador — o que o A02.py chama de porta temporal é persistência do indicador contra ele mesmo dentro da temporada, não o 1º turno prevendo os PONTOS do 2º (_porta_temporal.md, 19/09: “achado zero”, zero das 19 partes rodaram a porta como a §6.4 a define). E o teste que existe não tem poder: com n = 80 o menor sinal que ele enxergaria é 0,31 e o observado foi 0,19, com a confiabilidade da sobra medida em meia temporada em 0,07 contra o piso de 0,40 da §3. Um sim de dois = PROVÁVEL. O selo “firme” anterior é insustentável porque se apoiava justamente na metade que não se sustenta: uma negativa (“não se repete”) selada sem poder calculado, que é exatamente “não separa” virando “não existe”. Resultado negativo, vai para “Parece, mas não é”. Uso lícito do indicador: gols menos xG está na lista branca da §6 (“isto é o placar, não é característica”) e a emenda 1 da lista pré-declarada só o autoriza a sustentar conclusão NEGATIVA, que é o que está escrito aqui. ROBUSTEZ (varredura de 19/09): os dois cortes concordam no que importa e discordam no nível, e o texto diz os dois. A diferença Sobe-Meio é firme com os 20 times (+0,05 contra -0,17, ou cerca de 0,22 gol por jogo) e sem os times de fronteira (-0,05 contra -0,17, ou 0,12 gol por jogo); em Sobe x Trave também nos dois. Mas o SINAL do promovido inverte: com os 20 times ele converte acima do que as chances pediam, sem eles converte abaixo — e era justamente o corte calado que sustentava a prosa “convertendo acima do xG”, enquanto o número publicado (-0,05) dizia o contrário dela. Por isso o texto publica os dois e apoia a frase na diferença, não no nível. O outro indicador da família não depende de corte: xG sofrido menos gols sofridos não separa nem com fronteira (q 0,171) nem sem (q 0,515). A comparação entre as duas metades do ano não tem corte de subamostra nenhum (n = 80, sem recorte), e os dois indicadores que o texto anterior omitia dela — gols por jogo +0,540 e gols sofridos +0,335 — não mudam a leitura. Por fim, sai do texto a frase “criar e ceder se repetem”: esses coeficientes são de metade de temporada contra metade de temporada e o A11 publica, para os mesmos indicadores, persistência ano a ano quatro a sete vezes menor — comparar réguas diferentes é o defeito que o cruzamento de 19/09 registrou. ETAPA 8 (20/09), o que saiu do texto de 10 segundos e passou a morar aqui: o nível de cada corte (0,05 com os 20 times e -0,05 sem os times de fronteira, contra -0,17 e -0,17 do meio — que são o MESMO número, porque fin_m_cf está gravado sem sinal) e o lado do goleiro (0,2 contra 0,17, sem diferença em corte nenhum). O texto passou a apoiar a frase na DIFERENÇA (8 gols numa temporada inteira), nunca no nível, que é o defeito que a varredura pegou. O gráfico publica só o corte sem os times de fronteira, e não os dois: fin_m_cf está gravado como módulo — 0,17 quer dizer 0,17 ABAIXO do que as chances pediam —, de modo que desenhá-lo ao lado de 0,05 inverteria a leitura na tela. É correção de saída de script, não de texto, e fica registrada aqui. A comparação entre as duas metades do ano (0,19 observado, mínimo detectável 0,31, confiabilidade 0,07) continua acima. CORREÇÃO (20/09, conferência do cético): esta conclusão ficou SEM GRÁFICO, e o parágrafo acima, que registrava publicar só o corte sem os times de fronteira, deixa de valer. O motivo dele era verdadeiro (fin_m_cf está gravado em módulo, 0,17, quando o valor com sinal é -0,169 — o cru_alvo da linha com,sobra,SM,finalizacao do A02_testes.csv, idêntico ao fin_m), mas a saída escolhida trocava um erro visível por um silêncio: aqui o corte não muda só o tamanho, muda o SINAL, e o corte reduzido é justamente aquele em que o promovido aparece ABAIXO do que as chances pediam (-0,052), enquanto com os 20 times ele aparece acima (+0,053). Publicar sozinho o corte que o _metodo_fronteira.md documenta como enviesado por construção é o que a regra da fronteira proíbe. O dois_cortes honesto (fin_s_cf/fin_m_cf ao lado de fin_s/fin_m) depende de o A02.py regravar fin_m_cf com sinal: é conserto de saída de script, não de texto, e enquanto não vier a conclusão fica sem desenho. O texto foi reescrito junto: a diferença de 8 gols voltou a dizer de que corte sai (os 20 times de cada ano: 0,053 menos -0,169 = 0,222 por jogo, x38), o predicado virou diferença entre os dois lados e não sobra do promovido sozinho — o nível dele no corte reduzido é negativo —, a ressalva de que a vantagem aparece nos dois cortes e o nível dela não voltou a ser visível, já que sem gráfico ela não tinha onde aparecer, e “do lado do goleiro não há diferença nenhuma” virou “no goleiro não dá para ver diferença”, porque o teste não tem poder: 0,204 contra 0,166, d 0,424 contra um d mínimo de 0,82, poder_suficiente False no A02_testes.csv. Há diferença de 0,038 gol por jogo; o que não há é desenho que a enxergue. TERCEIRA PASSADA (20/09), o que o encurtamento tinha levado junto: o texto de 10 segundos dizia “a vantagem aparece também sem os times de fronteira, o tamanho dela não”, e TAMANHO não é NÍVEL — a frase falava só da diferença encolher (0,222 por jogo com os 20 times contra 0,117 sem os de fronteira) e calava a inversão de SINAL, que é a armadilha da parte: sem os times de fronteira o próprio promovido fica ABAIXO do que as chances pediam (-0,05, contra 0,05 com os 20 times; linha sem,sobra,SM,finalizacao do A02_testes.csv, cru_sobe -0,052). Como a conclusão está SEM GRÁFICO, a ressalva não tinha para onde ter ido: ficava só aqui, que na tela é o title do selo. O texto voltou a dizer o sinal por escrito — “e lá até quem sobe fica abaixo do que as chances pediam” —, o que também devolve ao predicado “converte melhor que o meio” a âncora que ele tinha perdido, para o leitor não ler que o promovido converte acima do esperado nos dois cortes. O que saiu para caber nos 280, pela ordem de quem perde espaço: primeiro o segundo número do goleiro (0,2 contra 0,17), que o corte não enxerga de qualquer forma, e a repetição de que a diferença é a maior da lista; e, como ainda não cabia, o TAMANHO da vantagem (“cerca de 8 gols na temporada”), que é o detalhe do achado. O que NÃO saiu, e por isso o número saiu no lugar: o corte (“com os vinte times de cada ano”), o sinal no corte reduzido, a palavra que segura a afirmação do goleiro (“não dá para ver”) e a janela da repetição (“de uma metade do ano à outra”) — sem ela, “nem que a sobra se repita” viraria uma negativa sobre qualquer janela, e a medida é de meia temporada contra a outra. O gráfico continua não existindo pelo motivo já registrado acima: o dois_cortes honesto depende de o A02.py regravar fin_m_cf com sinal — hoje ele está gravado 0,17 quando o cru_alvo é -0,169, e desenhar assim inverteria o resultado. Um grupos só do corte reduzido foi descartado de propósito: mostraria um corte só numa conclusão que depende do corte.",
   "n": "16 promovidos contra 48 do meio, e 8 contra 32 sem os times colados na linha; 16 contra 16 no recorte de 5º a 8º (e 8 contra 7 sem os colados na linha); 80 clube-temporadas na comparação entre as duas metades do ano",
   "prova": "A02_testes.csv; A02_resumo.json, porta_temporal; _porta_temporal.md; A02_numeros_novos.json; A02.md, seção Prova",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "dois_cortes",
    "titulo": "Sobra de gol sobre o esperado",
    "unidade": "gols por jogo acima (+) ou abaixo (−) do esperado",
    "cortes": [
     {
      "rotulo": "com todos os times",
      "series": [
       {
        "nome": "Sobe",
        "valor": 0.05
       },
       {
        "nome": "Meio",
        "valor": -0.17
       }
      ]
     },
     {
      "rotulo": "sem os times de fronteira",
      "series": [
       {
        "nome": "Sobe",
        "valor": -0.052
       },
       {
        "nome": "Meio",
        "valor": -0.169
       }
      ]
     }
    ]
   }
  },
  {
   "id": "A03-1",
   "parte": "A03",
   "bloco": "A",
   "manchete": "Depender de casa não separa quem sobe de quem fica no meio",
   "o_que_vimos": "A vantagem de jogar em casa é de 0,79 ponto por jogo, e quem sobe fica em 0,9 contra 0,79 do meio — sem os times colados na linha, 0,95 contra 0,82. A exceção é o 5º-8º, só no placar e num corte só. Nenhum dos 24 testes viu diferença, e nenhum tinha amostra para ver.",
   "para_o_santa_cruz": "Não montar elenco atrás de 'time forte fora': a diferença de mando não separou as faixas, e este desenho também não garante que ela não exista — são coisas diferentes. O que dá para usar é o tamanho da vantagem de casa da liga, 0,79 ponto por jogo para qualquer time, no planejamento de calendário e de viagem. E a leitura de mando sai marcada: pode ser efeito do placar, porque quem joga fora passa mais tempo atrás.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Sugere uma premissa nova em Montagem do elenco: a vantagem de casa é da liga inteira e não distingue quem sobe de quem fica no meio — 'ser forte fora' não é perfil de elenco a procurar. Toca a m6 (logística diferenciada para a Série B) sem confirmá-la: esta parte não mediu viagem nem descanso.",
   "confianca": "indício",
   "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios. Correção para múltiplos testes: não. A família assimetria tem 24 linhas (quatro indicadores, três comparações, dois cortes), com selo firme em 0 delas, e o menor q da família é 0,14282 — em xG sofrido: fora menos casa, na comparação Sobe × Trave com a fronteira. Porta temporal da §6.4: não. Está pré-declarada em A03_indicadores.json (criterio.porta_temporal) e nunca rodou — não há turno em scripts/A03.py nem chave porta_temporal em A03_resumo.json, e a rodada de 19/09 (_porta_temporal.md) cobriu só os oito componentes do A14, nenhum deles de assimetria. Ausência de aprovação não é aprovação: as 24 linhas têm poder_suficiente=False, com |d| máximo 0,78 contra d mínimo detectável de 0,82 no desenho principal (16x48) e 1,14 no reduzido (8x32) — é a §6.7 ao pé da letra, e aqui 'não separa' quer dizer 'este desenho não conseguiria ver'. Ressalva que fica no motivo e não vai ao texto: trocar mediana por média inverte a ordem entre Sobe e Meio nos DOIS cortes (0,796 contra 0,818 com a fronteira; 0,803 contra 0,863 sem), recálculo feito duas vezes — auditoria de 18/09, achado 9 (2/3), e varredura de robustez de 19/09. Etapa 8, o que saiu do texto para cá: fora do placar as faixas ficam perto, de quem sobe para o meio, 0,42 contra 0,39 de xG criado, 0,45 contra 0,39 de xG sofrido e 0,89 contra 1,16 ponto percentual de dividida, sempre na diferença casa menos fora. O gráfico é o par Sobe contra Meio com a maior diferença padronizada da família, o xG sofrido casa menos fora (0,45 contra 0,39, d -0,434): é o par menos favorável à conclusão negativa, e mesmo ele sai sem diferença clara. Não há marcador do ponto por jogo do Meio — o dif_liga vale 0,789 porque o Meio é 48 dos 80 casos, não porque seja a medida do Meio —, e por isso a vantagem de casa em pontos, que é o que o texto conta, ainda não tem gráfico. A exceção do grupo de 5º a 8º fica só aqui, sem gráfico — 0,87 ponto por jogo com todos os times contra 1,47 sem os times de fronteira, corte que deixa 7 dos 16 casos do grupo, onde a mediana é quase o valor de um clube só, e no corte reduzido quem sobe marca 0,947 contra esses 1,474, com d 0,777, q 0,52615 e selo sem diferença clara, com 8 contra 7 casos, que só enxergaria d 1,57 — e continua sendo placar redescrito, não indicador novo. Ela não vai a gráfico nenhum por dois motivos: o corte reduzido não publica o ponto por jogo de quem sobe em marcador, então o gráfico de dois cortes mostraria um ponto solitário numa régua compartilhada e faria a trave parecer disparar; e o em_aberto desta parte a demove a descrição de propósito. E a leitura de mando pode ser efeito do placar: quem joga fora passa mais tempo atrás. Etapa 8, terceira passada: a exceção do grupo de 5º a 8º voltou ao o_que_vimos em uma oração, sem os brutos, que ficam aqui. O texto curto da segunda passada dizia que a vantagem de casa não distingue as faixas sem recorte nenhum, e o texto longo nunca afirmou isso: ele abria a exceção do placar. Como a exceção não tem gráfico, o escopo 'só no placar e num corte só' tinha de voltar ao texto visível — é também o que o em_aberto desta parte manda, ao demover a trave a descrição dentro do A03-1. Para caber nos 280, saiu o detalhe, não a ressalva: os brutos 0,87 e 1,47 e o 'entre as faixas' do fecho ficaram de fora, e o escopo continua inteiro no fecho: 'de casa menos fora' (são os testes de assimetria, não os de nível do A03-2 e do A03-3) e 'entre as faixas'. Para abrir espaço para os dois, a abertura virou 'a vantagem de jogar em casa é de 0,79 ponto por jogo' no lugar de 'vale 0,79 ponto por jogo a mais do que jogar fora' — 278 caracteres na tela.",
   "n": "80 clube-temporadas com todos os times (16 que subiram, 48 do meio — 16 deles na trave — e 16 que caíram); 52 sem os times colados na linha (8, 32 com 7 na trave, e 12)",
   "prova": "A03_testes.csv, família assimetria; A03_resumo.json, quadro_por_faixa; _metodo_fronteira.md",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "dois_cortes",
    "titulo": "Vantagem de jogar em casa",
    "unidade": "pontos por jogo a mais em casa",
    "cortes": [
     {
      "rotulo": "com todos os times",
      "series": [
       {
        "nome": "Sobe",
        "valor": 0.895
       },
       {
        "nome": "Meio",
        "valor": 0.789
       },
       {
        "nome": "Cai",
        "valor": 0.737
       }
      ]
     },
     {
      "rotulo": "sem os times de fronteira",
      "series": [
       {
        "nome": "Sobe",
        "valor": 0.947
       },
       {
        "nome": "Meio",
        "valor": 0.816
       },
       {
        "nome": "Cai",
        "valor": 0.737
       }
      ]
     }
    ]
   }
  },
  {
   "id": "A04-1",
   "parte": "A04",
   "bloco": "A",
   "manchete": "Nada do trabalho de bola parada separa quem sobe do meio",
   "o_que_vimos": "Nenhum dos 8 sinais de trabalho separa quem sobe do meio, nos dois cortes. O que separa é gol: na temporada, quem sobe faz 5,5 gols de bola parada a mais do que sofre e o meio fecha zerado, mas gol é o placar de outro jeito, e sem os times colados na linha nem ele separa.",
   "para_o_santa_cruz": "Treinar bola parada não é o caminho do acesso — e o estudo também não mostra que abandoná-la custe o acesso. Na montagem do elenco, altura e duelo aéreo de jogador de linha não entram como requisito de acesso; a exceção, dita aqui para as duas frases do estudo não se contradizerem, é o goleiro, onde o J03 achou na bola aérea disputada o maior efeito da tabela dele — e ainda assim como provável. O tamanho do fenômeno, que continua grande, está na conclusão descritiva ao lado: é volume de treino, não critério de contratação.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Sugere registrar uma premissa nova: a régua G da Protótipo (bola aérea e parada) não tem sustentação como separadora de quem sobe — nenhum dos seus três itens separa quem sobe do meio, nos dois cortes. A premissa não pode ser escrita como se a comparação com a trave também tivesse sido testada: ali ela fica sem resposta.",
   "confianca": "indício",
   "confianca_motivo": "Os dois critérios da §6 dizem não. (a) Correção para múltiplos testes a 5% dentro da família, em Sobe × Meio: nenhum dos 8 indicadores de trabalho é firme em qualquer dos dois cortes de fronteira — o mais perto é a altura média do elenco, e ainda assim longe da linha; os dois que passam no corte com a fronteira são da família do gol, o saldo de bola parada e os gols de bola parada feitos, por jogo, que a lista branca de A04_indicadores.json já declarava placar redescrito antes de rodar, e sem os times de fronteira o saldo fica de fora por muito pouco (0,05339 contra a linha de 5%), com o achado em campo idêntico nos dois cortes. (b) Porta temporal da §6.4: não rodou nesta parte e, para o gol de bola parada, é impossível, porque a base é agregada por trabalho (treinador + time + competição). Nenhum dos dois ⇒ indício; o desenho só enxerga efeito grande (d ≥ 0,82 com a fronteira, d ≥ 1,14 sem ela), e na comparação com a trave os dois sinais firmes do corte com a fronteira — duelos aéreos ganhos a favor da trave e altura média do elenco a favor de quem sobe — se contradizem entre si e somem sem os colados na linha, por isso essa perna sai da afirmação. O que saiu do que vimos e fica aqui: os 8 sinais de trabalho são bolas paradas e escanteios por jogo, finalizações de escanteio, finalizações de falta, conversão, cruzamentos, duelos aéreos ganhos e altura média do elenco; e a ressalva de tamanho, que é a mesma dita acima — com 16 contra 48, e 8 contra 32 sem os times de fronteira, só um efeito grande apareceria, então “não separa” aqui quer dizer “este desenho não conseguiria ver”. Esta conclusão fica sem gráfico de propósito: não há em numeros um par de medidas de trabalho de Sobe e Meio na mesma unidade para desenhar, e um desenho só com o lado de quem sobe sugeriria o contrário do que a conclusão diz. A unidade de tempo de 5,5 é a temporada, e por isso a frase diz “na temporada”: o quadro_por_faixa do A04_resumo.json dá bp_saldo_90 de 0,145 por jogo para quem sobe contra 0 do meio, e 5,5 é esse 0,145 vezes os 38 jogos. Quem encurtar este texto de novo não pode tirar “na temporada”: todo o resto da parte é por jogo, e sem a unidade o número vira outro número.",
   "n": "16 promovidos contra 48 do meio; sem os times colados na linha, 8 contra 32. A comparação com a trave (5º–8º) fica sem resposta nesta parte: são 16 contra 16 com todos os times e 8 contra 7 sem os colados na linha, um desenho que o próprio método da casa (resultados/_metodo_fronteira.md) declara enviesado entre faixas vizinhas.",
   "prova": "A04_testes.csv, comparacao SM e ST; A04_resumo.json, firme_nos_dois_cortes",
   "status": "validada",
   "negativa": true,
   "grafico": null
  },
  {
   "id": "A05-1",
   "parte": "A05",
   "bloco": "A",
   "manchete": "Nenhum jeito de construir a jogada separa quem sobe do meio da tabela",
   "o_que_vimos": "Dos 10 traços com bola medidos, nenhum separa quem sobe do meio com todos os times na conta. Ter a bola chega mais perto, 51,4% contra 49,8%, e só separa sem os times de fronteira. Quem tinha mais a bola no primeiro turno somou mais pontos no segundo.",
   "para_o_santa_cruz": "Estilo com bola não é critério de contratação nem de escolha de treinador: nem passe curto, nem passe longo, nem ataques posicionais aparecem como marca de quem sobe. Ter a bola é o único que chega perto e vale como desempate, nunca como plano — só separa depois de tirar quem subiu raspando, e contra os times do 5º ao 8º não separa em corte nenhum. Cuidado com os dois lados: com 16 promovidos contra 48 do meio só uma diferença grande apareceria, então aqui “não separa” quer dizer “este desenho não conseguiria ver”; e posse e volume de passes mudam com o placar, que a base não permite separar.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Sugere premissa nova, no grupo Modelo de jogo: “Estilo com bola não é requisito de acesso; ter a bola é desempate.” Em igualdade de condições, preferir treinador e jogadores que sustentem mais da metade da posse — sem tratar isso como requisito, sem substituir o lado defensivo (A02 e A06) e sem valer contra os times do 5º ao 8º. Corrige o registro atual da parte, que dava a régua A (posse e construção) da Protótipo como sem sustentação inteira: ela cai em nove dos dez itens e fica de pé, dependendo do corte, só na posse.",
   "confianca": "provável",
   "confianca_motivo": "Dos dois critérios de firme, esta conclusão cumpre um — por isso provável, e não firme. (1) Correção para múltiplos testes a 5% dentro da família: NÃO na rodada principal. Conferido linha a linha no A05_testes.csv, e não no texto antigo: em Sobe × Meio com os times de fronteira na conta nenhum dos 10 indicadores recebe selo firme, e a posse, que é a que chega mais perto, tem o intervalo de confiança encostando no zero. O único selo firme das 60 linhas é a posse no corte sem os times de fronteira. A régua da casa manda rodar TAMBÉM sem os times colados na linha: o corte reduzido é conferência, a medida é a base inteira — que ainda por cima tem mais poder (efeito mínimo detectável 0,82 contra 1,14) — e a regra 4 do _metodo_fronteira.md é explícita, firme só sem fronteira é suspeito, não promovido. Nas outras duas comparações não há selo firme em corte nenhum. (2) Porta temporal da §6.4: SIM, e só para a posse. Em _porta_temporal.json, conferencia_6_4, o indicador “Posse, %” tem parcial positiva e passa a 5% sobre os 80 clube-temporadas, e a tabela reproduz a §6.4 célula a célula, como a ESPECIFICACAO.md publica. Essa medida não usa filtro de fronteira nenhum, então o meio critério que a conclusão cumpre não depende do corte enviesado. Dos outros nove indicadores, só dois chegaram a ser perguntados pela tabela e reprovaram (passes certos e passe longo); os outros sete nunca foram testados. Um sim e um não = provável. Ressalvas que ficam na prova e não mexem no selo: (a) a etapa_7 de dados/prototipo.json dá uma parcial menor e fora dos 5% para o mesmo indicador, mas é a fórmula fechada de Pearson, a mesma que diverge da §6.4 no dist_remate — pelo CLAUDE.md vale a especificação, e foi a §6.4 que o teste de 19/09 reproduziu; (b) o poder é insuficiente nas 60 linhas e o maior efeito do arquivo fica abaixo do próprio mínimo detectável, então a metade negativa da conclusão carrega a frase da §6.7: “não separa” aqui quer dizer “este desenho não conseguiria ver”; (c) contra a Trave (5º–8º) a posse não separa em corte nenhum, e nessa comparação ataques posicionais e passes progressivos trocam de sinal entre os dois cortes, o que reforça que ali não há o que ler; (d) o A12 chega ao mesmo pela régua A_posse_construcao, firme só no corte sem fronteira, mas é o mesmo dado por outro moedor e não conta como segunda prova; (e) na contagem crua, 12 dos 16 promovidos tiveram mais da metade da bola — e 4 dos 16 rebaixados também, com o meio em 49,8% e quem caiu em 48,5%. O que saiu do o que vimos e passa a morar aqui: (i) quem já tinha mais a bola nas 19 primeiras rodadas somou mais pontos nas 19 seguintes, mesmo entre times que vinham com a mesma pontuação — é essa a medida da §6.4 descrita acima, e é a metade do critério que a conclusão cumpre; (ii) os dois cortes, que agora estão no gráfico da conclusão, com todos os times na conta (51,4% contra 49,8%) e sem os times de fronteira (51,7% contra 50,2%).",
   "n": "16 promovidos contra 48 do meio (8 contra 32 sem os times a até 3 pontos da linha); a conta do primeiro turno usa os 80 clube-temporadas de 2022–2025",
   "prova": "A05_testes.csv, linhas do indicador posse em Sobe × Meio: com os times de fronteira d 0,521 e q 0,13363; sem eles d 0,689 e q 0,03748. As duas trocas de sinal entre os cortes estão contra a Trave, em ataques posicionais (d -0,496 e +0,291) e passes progressivos (d -0,284 e +0,145). _porta_temporal.json, conferencia_6_4. A05_numeros_novos.json",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "dois_cortes",
    "titulo": "Posse de bola",
    "unidade": "%",
    "cortes": [
     {
      "rotulo": "com todos os times",
      "series": [
       {
        "nome": "Sobe",
        "valor": 51.4
       },
       {
        "nome": "Meio",
        "valor": 49.8
       }
      ]
     },
     {
      "rotulo": "sem os times de fronteira",
      "series": [
       {
        "nome": "Sobe",
        "valor": 51.7
       },
       {
        "nome": "Meio",
        "valor": 50.2
       }
      ]
     }
    ]
   }
  },
  {
   "id": "A06-2",
   "parte": "A06",
   "bloco": "A",
   "manchete": "Nada do jogo sem bola separa quem sobe da trave nos dois cortes",
   "o_que_vimos": "A dividida no chão só separa as duas faixas quando se tiram os times colados na linha, e esse corte tira 9 dos 16 times da trave, justo os mais fortes. Sobram 8 contra 7, tamanho em que só diferença enorme apareceria. Com todos os times, o duelo aéreo separa, a favor da trave.",
   "para_o_santa_cruz": "Não há, na base deste estudo, alvo de contratação nem de modelo de jogo que venha do degrau da trave: o que separa quem sobe de quem parou entre 5º e 8º troca de indicador e de direção conforme quais times entram na conta. Para a montagem vale o A06-1, que se sustenta com todos os times. E o único indicador que separa essas duas faixas nos dois cortes é a pontaria — gols acima do esperado —, que é o placar contado de outro jeito e nem se repete de uma metade da temporada para a outra: o degrau da trave se parece mais com acerto de acabamento do que com característica que se compre.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Não trata de nenhuma premissa existente. Se alguma coisa sugere, é negativa: o degrau entre subir e parar na trave não está no que se mede sem a bola.",
   "confianca": "indício",
   "confianca_motivo": "Indício, o mesmo nível de 17/09 — o que muda é o sentido da conclusão. (a) Correção para múltiplos testes a 5%: passa em UM corte só. Duelos defensivos ganhos contra a trave dão q 0,00379 sem os times de fronteira, mas q 0,06438 com todos os times, que na chave da casa é “sem diferença clara” — e não o “pode ser sorte” que o texto de 17/09 citava entre aspas, que é um degrau acima do medido e exige p abaixo de 5% (scripts/_metodo.py). Pela convenção escrita em _metodo_fronteira.md, firme é firme nos dois cortes (regra 2), e o que só é firme sem a fronteira é suspeito, vale no máximo indício e a frase tem de dizer que depende do corte (regra 4). (b) Porta temporal da §6.4: REPROVA — duelos defensivos ganhos com parcial +0,092 e p 0,416. Nenhum dos dois critérios, logo indício. O corte que produz o achado tira 9 dos 16 clube-temporadas da trave, justamente os mais fortes (mediana de 63 pontos nos que saem contra 57 nos que ficam), enquanto do lado de quem sobe tira os mais fracos, e sobram 8 contra 7 — desenho em que só efeito acima de 1,57 apareceria. Robustez da fronteira: é ela que inverte a conclusão e a manda para “Parece, mas não é”. Com todos os times, o único teste firme e com poder contra a trave é o de duelos aéreos ganhos, e na direção contrária à do achado; sem a fronteira esse mesmo duelo aéreo não separa. Como os dois cortes se contradizem em qual indicador separa, e em que direção, nada sobrevive aos dois — que é o que a tabela final do _metodo_fronteira.md já registrava para o A06 em Sobe × Trave. Os duelos aéreos ganhos NÃO viram conclusão: a regra 3 do _metodo_fronteira.md manda descartar o que só é firme com a fronteira, e o painel de 18/09 decidiu isso por 0 a 3 — eles entram no texto só como a razão de nada sobreviver, e é isso que desfaz a assimetria de publicar o achado de corte único que favorece e calar o de corte único que contraria. Sai também a frase “nenhum indicador do A02 ou do A06 separa essas duas faixas nos dois cortes”: ela é falsa, porque a pontaria do A02 (gols acima do gol esperado) é firme nos dois cortes — o texto novo a nomeia e diz por que ela não serve. Os números que saíram do texto de 2 minutos ficam aqui: duelos defensivos ganhos 61,67% de quem sobe contra 59,79% da trave, sem os times de fronteira, com efeito 2,23 e intervalo +1,31 a +4,60. A mesma comparação com todos os times, e os dois números do duelo aéreo contra a trave no corte cheio, continuam sem marcador em A06_numeros.json — por isso saíram do texto em vez de virar número digitado à mão, e o em_aberto já os registra como pendência. É também por essa falta que o gráfico desta conclusão não é dois_cortes: ele mostra o viés do corte, a mediana de pontos de quem sai contra a de quem fica.",
   "n": "8 promovidos contra 7 da trave, sem os colados na linha; 16 contra 16 com todos os times",
   "prova": "A06_testes.csv; _metodo_fronteira.md; _porta_temporal.md",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "barras",
    "titulo": "A ressalva, não o achado: o corte tira os times mais fortes da trave, mediana",
    "unidade": "pontos",
    "barras": [
     {
      "nome": "Trave que o corte tira",
      "valor": 63
     },
     {
      "nome": "Os que ficam",
      "valor": 57
     }
    ]
   }
  },
  {
   "id": "A07-1",
   "parte": "A07",
   "bloco": "A",
   "manchete": "Correr mais não separou quem sobe do meio da tabela",
   "o_que_vimos": "O time mediano de quem subiu percorreu 9.644 metros por jogo contra 9.598 do meio, e 669 em alta intensidade contra 652. Nenhum dos 12 indicadores físicos declarados separou quem sobe nos dois cortes. Não vimos diferença, e aqui só apareceria a partir de 4,7 posições de tabela.",
   "para_o_santa_cruz": "Não há base aqui para contratar pensando em “time que corre mais sobe” — e também não há base para dizer que correr não importa, porque este estudo não teria como ver. Escolha o nível físico pelo modelo de jogo que o treinador vai pedir, não como atalho para o acesso. Para o físico virar critério de acesso seria preciso dado por jogo, que neste repositório só existe a partir de 2025.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Ajusta a m1 (Time físico): “a intensidade é critério de escolha, não detalhe” fica SEM PROVA pelo lado do acesso — não é contradita, este desenho não conseguiria enxergá-la. E corrige a leitura das réguas da Protótipo que o texto anterior fazia: a régua C_volume_fisico não separa nada em lugar nenhum, mas a D_explosao separa quem CAI do meio, firme nos dois cortes (A12_reguas.csv, Cai × Meio) — a frase certa é “não separam quem SOBE”, e não “não separam”.",
   "confianca": "indício",
   "confianca_motivo": "Indício porque não tem nenhum dos dois critérios da régua. (a) Correção para múltiplos testes a 5%: não — e resultado negativo não passa nela, ele é a ausência dela; nenhuma linha de Sobe × Meio ou de Sobe × Trave passa no critério, em nenhum dos dois cortes de fronteira, e com o desconto do rodízio que a especificação exige no físico o menor valor sobe ainda mais (0,52 em Sobe × Meio e 0,42 em Sobe × Trave). (b) Porta temporal da §6.4: não — nunca rodou nesta parte e não roda com o dado de hoje, porque não há físico por jogo antes de 2025. Poder: as linhas de Sobe × Meio e Sobe × Trave estão todas marcadas poder_suficiente=False, sem uma exceção — o menor efeito que este desenho enxergaria com 16 contra 48 equivale a 4,7 posições na tabela do ano, quase um quarto dela. Onde os dois cortes de fronteira trocam de sinal — acelerações fortes e distância em sprint contra a Trave, metros por minuto em Cai × Meio — o efeito é perto de zero dos dois lados, e nenhum deles vira frase. Cobertura: sai a frase “cobertura completa” que sustentava o selo firme, porque é falsa — pela conta absoluta (minutos rastreados sobre jogos × 11 × 90) a cobertura vai de 62% a 97% do possível, mediana 80%, o pior caso é um dos promovidos, e os 20 clube-temporada abaixo de três quartos foram rodados à parte, com o mesmo resultado. Vale ainda a ressalva declarada por escrito antes de rodar: correr muda com o placar, e esta base não permite o recorte. No ranking de corrida do próprio ano, a distância que separa quem subiu de quem ficou no meio vale 1 posição da tabela — e nenhum dos 12 indicadores físicos declarados separou quem sobe nos dois cortes de fronteira, nem depois de tirar os 20 clube-temporada com menos jogo rastreado, nem depois de descontar o tamanho do rodízio de elenco. Com todos os times, 9.644 contra 9.598 metros; sem os times que ficaram a três pontos da linha, 9.631 contra 9.597. A alta intensidade sem os de fronteira é 666 contra 652. O gráfico desta conclusão não mostra metros: mostra, em posições da tabela do ano, a diferença que vimos (1) e o mínimo que este estudo enxergaria (4,7).",
   "n": "16 que subiram contra 48 do meio (8 contra 32 sem os times de fronteira); contra a Trave, 16 contra 16 e 8 contra 7; 13 contra 36 quando saem os 20 clube-temporada com menos jogo rastreado. As 80 linhas são 40 clubes.",
   "prova": "A07_testes.csv, comparação SM e ST nos dois cortes de fronteira; A07_numeros_novos.json, tabela_d_rod_q_rod e rodada_sem_cobertura_baixa; A07_resumo.json, poder_por_desenho; A07_indicadores.json, ressalvas_declaradas",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "dois_cortes",
    "titulo": "Distância percorrida por jogo",
    "unidade": "metros",
    "cortes": [
     {
      "rotulo": "com todos os times",
      "series": [
       {
        "nome": "Sobe",
        "valor": 9644
       },
       {
        "nome": "Meio",
        "valor": 9598
       }
      ]
     },
     {
      "rotulo": "sem os times de fronteira",
      "series": [
       {
        "nome": "Sobe",
        "valor": 9631
       },
       {
        "nome": "Meio",
        "valor": 9597
       }
      ]
     }
    ]
   }
  },
  {
   "id": "A08-1",
   "parte": "A08",
   "bloco": "A",
   "manchete": "Esta base não mede o que o time faz dentro do jogo",
   "o_que_vimos": "As duas tabelas físicas têm 60 e 28 colunas, e 0 delas separam primeiro de segundo tempo. Na resposta crua do fornecedor são 31 medidas, todas do jogo inteiro. O único recorte que existe é com bola e sem bola, que é posse e não tempo.",
   "para_o_santa_cruz": "Não dá para escolher jogador nem treinador por 'aguenta os 90 minutos' com o que o clube tem hoje — quem disser isso está usando olho, não dado, e o olho aqui é legítimo desde que não se apresente como número. O que o estudo sustenta sobre desgaste é outra escala: o A10 mede do turno para o returno e diz que a queda existe, é de menos de 1% do que o jogador corria, e é a mesma para quem sobe e para quem fica no meio. Se o clube quiser a resposta de dentro do jogo, ela se compra: é pergunta para o fornecedor de dado físico, com custo, e não trabalho de análise.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Não mexe em premissa nenhuma: ausência de dado não confirma nem contradiz o que o clube acredita. Se alguém tratasse isto como prova de que o desgaste não importa, estaria lendo ausência de medida como ausência de efeito.",
   "confianca": "indício",
   "confianca_motivo": "Indício, e o nível está certo: não há teste, então não há como passar em critério nenhum. O que existe é uma CONTAGEM, e ela é decisiva no que afirma. (a) Nas duas tabelas físicas, 0 de 60 + 28 colunas trazem qualquer marca de período — procurei por period, half, 1st, 2nd, faixa de 15 minutos, phase, segment e window, e a lista de busca é generosa de propósito, porque ela existe para ACHAR o recorte. (b) Na resposta crua da API, guardada em raw_json e lida sobre 3.613 linhas, toda métrica vem com o sufixo `_full_all_`: `full` é o jogo inteiro e `all` são todas as fases. São 31 chaves e 0 com recorte de tempo. Isto é o que fecha a pergunta, e é do dado, não de quem escreve. (c) O TIP/OTIP existe e engana: são 34 colunas de recorte abaixo do jogo inteiro, o que pode dar a impressão de que a base desce ao detalhe. Desce — mas por POSSE, não por tempo. Quem cruzar as duas coisas conclui errado. (d) E mesmo por jogo o recorte é raso: a tabela por jogo cobre 2025 (374) · 2026 (207), e cada linha é o jogo inteiro. É o mesmo limite que prendeu o A10 a 2025. O QUE ESTA CONTAGEM NÃO PROVA, e precisa estar dito porque a manchete é negativa: não prova que o rendimento não cai dentro do jogo; não prova que a queda não separaria quem sobe do meio; e não prova que o fornecedor não venda o recorte por período. Nenhuma das três foi medida. O que está medido é uma coisa só — a cópia que este estudo tem não permite a pergunta. POR QUE ISSO É CONCLUSÃO E NÃO SILÊNCIO: a regra da casa diz que resultado negativo também é conclusão, e uma pergunta que fica pendente para sempre, sem ninguém dizer por quê, vira dívida invisível. Escrita assim, ela tem preço e destinatário: é uma compra, não uma análise por fazer.",
   "n": "0 colunas de período em 60 + 28 das duas tabelas físicas, e 0 chaves de tempo em 31 da API, sobre 3.613 linhas de jogador-temporada",
   "prova": "resultados/A08_resumo.json e scripts/A08.py, contra dados_copiados/skillcorner_serieb.db",
   "status": "validada",
   "negativa": true,
   "grafico": null
  },
  {
   "id": "A09-3",
   "parte": "A09",
   "bloco": "A",
   "manchete": "Os acréscimos não separam ninguém, nem no fim nem antes do intervalo",
   "o_que_vimos": "No acréscimo do 2º tempo quem sobe marca 0,12 gol por jogo contra 0,08 do meio, e não resiste — no do 1º também não. Entre 15 e 30 e entre 60 e 75 ele marca mais só com os times colados na linha na conta. Achado que existe num corte só não é achado.",
   "para_o_santa_cruz": "Não vale montar elenco nem discurso para \"decidir no fim\": o acréscimo é onde a base tem menos gol e menos poder para enxergar diferença. Se o clube quiser vantagem no fim de jogo, o número que sustenta isso é o dos 75 aos 90 minutos do A09-1, não o do acréscimo.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Não confirma nem contradiz premissa: é ausência de achado, e ela não vira regra.",
   "confianca": "indício",
   "confianca_motivo": "Indício porque não cumpre nenhum dos dois critérios, e a frase diz por quê. (a) Correção para múltiplos testes: com todos os times, NENHUM dos quatro indicadores de acréscimo passa em comparação nenhuma — o menor q é 0,05439 (gols marcados no acréscimo do 1º tempo, Cai × Meio), que é \"pode ser sorte\". (b) Porta temporal: não roda nesta base, como nas outras conclusões da parte. O QUE APARECE SÓ NUM CORTE, e é a razão de a conclusão ser negativa em vez de positiva: sem os times colados na linha, os gols sofridos no acréscimo final ficam firmes em Sobe × Meio (q 0,00024, 0,05 contra 0,08 por jogo) e os marcados no acréscimo do 1º tempo ficam firmes em Cai × Meio (q 0,04555) — e os dois somem com os times de fronteira na conta (0,29354 e 0,05439). A regra 4 do _metodo_fronteira.md é explícita: firme só sem fronteira é suspeito, não promovido. AS OUTRAS FAIXAS QUE SÓ APARECEM NUM CORTE, e que o texto agora cita: gols marcados entre 15 e 30 minutos, Sobe × Meio, passa com todos os times (q 0,00691) e não passa sem os colados na linha (0,05190); gols marcados entre 60 e 75, Sobe × Meio, 0,04656 com e 0,12097 sem; e gols marcados entre 15 e 30, Cai × Meio, ao contrário — 0,05439 com e 0,04555 sem. Nenhuma das três entra como achado, pela mesma regra 4 do _metodo_fronteira.md. SOBRE O PODER: o acréscimo é a faixa com menos gol da tabela — mediana de 0,04 gol por jogo no acréscimo do 1º tempo —, então \"não separa\" aqui quer dizer o que a §6.7 manda dizer: este desenho não conseguiria ver uma diferença menor do que 0,82 de efeito, e não que a diferença não exista.",
   "n": "16 promovidos contra 48 do meio; no corte reduzido são 8 contra 32, e o efeito mínimo detectável sobe junto",
   "prova": "resultados/A09_testes.csv, família `marca` e família `sofre`; resultados/A09_resumo.json",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "grupos",
    "titulo": "Gols no acréscimo do segundo tempo, com todos os times",
    "unidade": "gols por jogo",
    "series": [
     {
      "nome": "Sobe",
      "valor": 0.12
     },
     {
      "nome": "Meio",
      "valor": 0.08
     }
    ]
   }
  },
  {
   "id": "A10-1",
   "parte": "A10",
   "bloco": "A",
   "manchete": "Em 2025 quem subiu perdeu no returno os mesmos 100 metros que o meio",
   "o_que_vimos": "Na média, do 1º para o 2º turno o mesmo jogador perde 74 metros por noventa minutos, 0,8% do que corria. A perda não separa quem subiu do meio. Sprint e alta intensidade chegam a separar com os times colados na linha do acesso na conta, e não separam sem eles.",
   "para_o_santa_cruz": "Não vale montar elenco para “aguentar o returno”: a queda de fim de temporada existe, mas é de 0,8% do que o jogador corria e é a mesma para quem sobe e para quem fica no meio. O físico entra em J05 como exigência de nível, como o A07 já apontava, e não como reserva de fôlego. E a diferença de ponto de 2025 aparece no 2º turno (1,71 contra 1,34, e num corte só), não no 1º (1,58 contra 1,37, que não passa no critério) — quem responde a pergunta da trajetória é A13, não esta parte.",
   "premissa": "m1",
   "premissa_titulo": "Time físico",
   "premissa_grupo": "Montagem do elenco",
   "premissa_motivo": "Ajusta a m1 (Time físico): a intensidade segue valendo como critério de nível na contratação, mas não como sustentação ao longo da temporada — a queda de returno existe, é de 0,8% do que o jogador corria, e não separa quem subiu do meio.",
   "confianca": "indício",
   "confianca_motivo": "(a) Correção para múltiplos testes a 5% dentro da família: não passa NADA — e é esse o achado. São 96 linhas em A10_testes.csv (2025, leitura principal, comparação SM, pilares fisico_*), 93 com selo “sem diferença clara” e 3 com “pode ser sorte”, menor q 0,29536 (high_accel_p90 em delta_descanso, sem fronteira); na leitura por setor são 64 testes, menor q 0,90502 com fronteira e 0,32704 sem. (b) Porta temporal da §6.4: não. Para returno e delta_turno ela não roda por construção (a medida já contém o 2º turno, que é o desfecho) e, onde roda (medida turno), nenhum dos 8 indicadores passa: a parcial precisaria de ~0,46 e a maior é 0,305 (distance_p90, p 0,204), com 20 clubes de uma temporada. Zero de dois = indício pela letra do CLAUDE.md:51. É um nada medido COM poder — o desenho do jogador enxerga d a partir de 0,48 e nada chega perto —, mas é uma temporada só e a leitura vem depois do desfecho; o “provável” de antes se apoiava em “resultado negativo medido com poder”, que não é nenhum dos dois critérios da régua (mesma correção que a v1 fez em A11-3, um negativo idêntico a este). No nível clube-temporada são 4 contra 12 e o desenho só enxergaria d ≥ 1,74: ali “não separa” quer dizer “este desenho não conseguiria ver”, e por isso o nível principal é o do jogador. ROBUSTEZ RESOLVIDA: o “passa pelo zero” estava citado de um lado só. O intervalo por clube da liga vai de −157 a +7 metros e encosta no zero, mas o mesmo cálculo dentro do Sobe vai de 43 a 152 metros e NÃO encosta (em metros por minuto, de −1,69 a −0,48), e o teste contra zero da linha da liga dá p 0,0006 — o mesmo teste que a parte citava quando ele favorecia. Por isso a manchete deixa de dizer que não existe queda para medir: a queda existe, é pequena, e o que é nulo é a DIFERENÇA entre as faixas. O número que o texto publica é a MÉDIA da liga; pela mediana a queda da liga é de 98 metros, e por faixa as medianas são 100 no Sobe contra 101 no meio — a diferença entre as faixas continua nula nos dois jeitos de contar, e é por isso que a manchete usa a mediana e o que vimos diz “na média”. Nos dois cortes de fronteira o veredito da diferença é o mesmo. DA PASSADA DE TEXTO: o que saiu do que vimos e fica aqui. A queda por faixa, que agora está no gráfico nos dois jeitos de medir: pela mediana 100 metros em quem subiu contra 101 no meio, e pela média 101 contra 71 — nos dois a diferença não sustenta nada, e o gráfico traz as quatro séries juntas justamente para que o empate da mediana não seja lido como distância (a régua do desenho se estica entre o menor e o maior valor do próprio gráfico). A perda em si é real: contando clube a clube, dentro do Sobe ela vai de 43 a 152 metros e não encosta no zero, enquanto na liga inteira o intervalo ainda encosta, de −157 a +7 metros. Das 96 comparações físicas entre quem subiu e o meio, nenhuma passou no critério, nos dois cortes de fronteira. E a diferença de ponto do 2º turno (1,71 contra 1,34) tem um corte só: sem os times de fronteira sobram 2 clubes no Sobe e a conta não roda.",
   "n": "47 jogadores de quem subiu contra 135 do meio (4 clubes contra 12), só 2025",
   "prova": "A10.md, seção A prova; A10_testes.csv (2025, leitura principal, comparação SM, pilares fisico_*: as 96 linhas, e as 64 da leitura por setor); A10_resumo.json, o_que_cai_antes_de_perguntar_de_quem (medida delta_turno, distance_p90, faixas todos / Sobe / Meio, com o IC por clube e o p contra zero) e porta_temporal",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "grupos",
    "titulo": "Queda do 1º para o 2º turno, pela mediana e pela média",
    "unidade": "metros por 90 minutos",
    "series": [
     {
      "nome": "Sobe, pela mediana",
      "valor": 100
     },
     {
      "nome": "Meio, pela mediana",
      "valor": 101
     },
     {
      "nome": "Sobe, pela média",
      "valor": 101
     },
     {
      "nome": "Meio, pela média",
      "valor": 71
     }
    ]
   }
  },
  {
   "id": "A10-2",
   "parte": "A10",
   "bloco": "A",
   "manchete": "Semana de três jogos: os dois anos medidos dizem o contrário um do outro, e não dá para montar elenco por isso",
   "o_que_vimos": "Em 2025, no jogo com menos de quatro dias de descanso o mesmo jogador correu igual ou um pouco mais (42 metros por 90 a mais, 8 metros de sprint, 0,19 km/h no pico, todos com o intervalo entre clubes encostando no zero) e o clube fez 1,10 ponto por jogo contra 1,37 nos jogos normais — 61 jogos curtos contra 697. Em 2026 a mesma conta inverte, e com mais força do que 2025 jamais teve: o mesmo jogador corre 174 metros por 90 a MENOS no jogo curto (1,8% do que corre), com intervalo de −290 a −52 metros que não encosta no zero, mais 51 metros de corrida e 1,93 metro por minuto a menos — e o ponto não cai (1,37 no curto contra 1,36 no normal, 75 jogos curtos contra 459, 217 jogadores em 18 clubes). A inversão não é falta de rastreamento: refazendo a conta sem os 7 clubes de cobertura baixa de 2026 ela continua (151 metros a menos, 149 jogadores), e 2026 tem quase o dobro de jogo curto que 2025 (15,9% dos jogos de quem lidera contra 8,6%).",
   "para_o_santa_cruz": "Não dá para decidir nada de calendário com o que existe hoje: nas duas únicas temporadas medidas o jogo de três em três dias mudou de sinal nas duas contas, corrida e ponto. A m6 (logística e recuperação) continua valendo como cuidado de gestão, mas sem número atrás — não serve de argumento para comprar “motor”, nem para prometer que o time pontua igual em semana cheia. O que resolve é a temporada de 2026 fechada, que já está sendo rastreada; até lá isto é aviso, não conclusão.",
   "premissa": "m6",
   "premissa_titulo": "Logística diferenciada para a Série B",
   "premissa_grupo": "Montagem do elenco",
   "premissa_motivo": "Nem confirma nem contradiz a m6 (Logística diferenciada para a Série B): com duas temporadas de sinal oposto, a premissa fica sem teste. O que muda é a ressalva ao lado dela: nada em A10 sustenta hoje o efeito do calendário apertado, em direção nenhuma.",
   "confianca": "indício",
   "confianca_motivo": "CAI COMO AFIRMAÇÃO — é a decisão da proposta v2 validada pelo dono em 19/09, aplicada aqui. Ela não foi apagada: fica como não-resultado em “Parece, mas não é”, no piso da régua, e quem decide se permanece na tela ou vai inteira para o que ficou em aberto é o dono. POR QUE CAIU: o efeito troca de sinal entre as duas únicas temporadas medidas, e nas DUAS metades da conclusão. Corrida: 2025 dá +42 metros por 90 (intervalo por clube de −91 a +148 metros, encosta no zero) e 2026 dá −174 metros (intervalo de −290 a −52 metros, não encosta), com a inversão aparecendo nos oito indicadores físicos. Ponto: 2025 dá 1,10 no curto contra 1,37 no normal; 2026 dá 1,37 contra 1,36. O texto anterior usava uma frase verdadeira sobre o RETURNO de 2026 (“1 ou 2 jogos rastreados por clube”) para dispensar 2026 inteira, inclusive na metade em que 2026 TEM teste: o próprio A10_resumo.json declara que delta_descanso roda em 2026. A conta de 2026 foi refeita a partir de A10_base.csv replicando as regras declaradas (mínimo de 1 jogo curto e 3 normais, filtro de 60 minutos), bate com o A10_resumo.json na casa decimal, e tirando os 7 clubes de cobertura baixa continua invertida. (a) Correção para múltiplos testes a 5%: não. Nas 96 linhas físicas de Sobe × Meio da leitura principal nada passa, e as duas medidas que o texto usava para afirmar (8 metros de sprint e 0,19 km/h no pico) não são comparação entre faixas: são teste contra zero dentro do jogador, e os dois intervalos por clube cruzam o zero (−2,7 a +19,1 metros; −0,02 a +0,38 km/h). No ponto, a queda dentro do clube é de 0,36 ponto por jogo, intervalo de −0,78 a +0,10 e p 0,14189 contra zero — não 0,139, como se escreveu; e o corte de sensibilidade de menos de 5 dias, citado antes com p 0,166, NUNCA foi rodado sobre os pontos (jogo_curto_ate4 existe em A10_base.py, linhas 320 e 394, e A10.py não o usa em lugar nenhum). (b) Porta temporal da §6.4: não roda para delta_descanso — a medida já contém o desfecho. Zero de dois = indício, e aqui o motivo do indício mudou de natureza: não é mais “efeito fraco”, é “efeito que troca de sinal entre as duas únicas temporadas medidas”, e isso derruba a afirmação em vez de só rebaixá-la. Some-se que 55% das unidades de jogador têm o lado “curto” medido em UM único jogo (MIN_JOGOS_CURTO = 1, declarado antes de rodar), o que sozinho explica a largura dos intervalos.",
   "n": "20 clubes e 61 jogos curtos em 2025 (280 jogadores); 18 clubes e 75 jogos curtos em 2026 (217 jogadores) — uma temporada fechada e uma parcial",
   "prova": "A10_resumo.json, o_que_cai_antes_de_perguntar_de_quem.medido (2025 e 2026, medida delta_descanso, faixa todos: os oito indicadores físicos, com média, IC por clube e p contra zero) e placar.o_placar_muda_com_o_descanso.medido (ponto por jogo no curto e no normal, nas duas temporadas); A10_resumo.json, o_que_a_temporada_de_2026_pode_testar e confundidor_do_calendario; A10_indicadores.json, seção descanso",
   "status": "removida",
   "negativa": true,
   "grafico": null
  },
  {
   "id": "A11-3",
   "parte": "A11",
   "bloco": "A",
   "manchete": "O físico não separa quem sobe nem entre times de nível técnico parecido",
   "o_que_vimos": "Na faixa técnica alta, quem subiu percorreu 9.614 metros por jogo e quem ficou no meio, 9.620, e nenhuma das 10 comparações apareceu. O terço que mais sprinta somou 54,5 pontos contra 47,9, mas os dois puseram 5 times no G4 e o que menos sprinta teve 9 rebaixados contra 2.",
   "para_o_santa_cruz": "O físico é um traço estável do clube que não anda com o acesso e anda com o não cair: serve para reconhecer um time — ele corre parecido todo ano — e como seguro contra o rebaixamento, que é o A07-2, não para prever quem sobe. Na montagem do elenco, correr é requisito de piso, não critério de desempate entre candidatos ao acesso. E ao citar a estabilidade, diga de onde ela vem: é medida da Protótipo ano a ano e a própria especificação a rebaixou a descrição, não critério, em 15/09 — não é a régua que o A06 usa com o mesmo nome.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Ajusta a m1 (Time físico): a intensidade continua como requisito de piso e como seguro contra a queda, mas o estudo não sustenta que correr mais faça o time subir — nem entre times de nível técnico parecido.",
   "confianca": "indício",
   "confianca_motivo": "Indício: zero de dois, e a frase diz por quê. (1) Benjamini-Hochberg a 5%: NÃO passa nenhum dos 10 testes de A11_estratificado.csv — o menor q do arquivo é 0,95148 e os dez estão selados “sem diferença clara” (0 firmes). (2) Porta temporal da §6.4: NÃO — não rodou e não pode rodar nesta parte. Três motivos materiais. O n é pequeno: 4 promovidos contra 18 do meio na faixa técnica média e 12 contra 15 na alta, 49 das 80 linhas, e a faixa técnica baixa não teve promovido NENHUM em 2022–2025 (o A11_resumo.json publica 0 também no n_meio dessa faixa, que é fallback do next(): o real é 15). O mínimo detectável vai de 1,13 a 1,63: é “não achamos”, não “não existe”. E o corte sem os times de fronteira, que o script nunca rodou, derruba a faixa média por falta de promovidos e deixa uma faixa só para testar — pela convenção da casa (percentil nas 80 linhas, filtro depois) a alta fica 7 contra 9 e a média cai para 1 × 11, abaixo do piso de 4; refazendo as faixas técnicas dentro das 52 linhas dá 6 × 12 —, e em nenhuma das leituras aparece diferença. A família resultado TEM um firme, sprint por 90 × distância ao G4 (+0,288, q 0,04769), e ele não sobe o nível desta conclusão: não é firme nos dois cortes (+0,348 com q 0,0577 sem fronteira) e some quando se tiram os 16 rebaixados (+0,079, p 0,533) — a leitura honesta é que a corrida anda com a ponta de baixo da tabela, que é o A07-2. Ressalva: pode ser efeito do placar, porque quem sobe joga mais tempo em vantagem e a base não permite o recorte. Por fim, os quatro números de persistência que sustentam a terceira frase (0,72 na distância percorrida, 0,72 no valor do elenco, 0,14 no xG e 0,13 no PPDA) são literais chumbados em A11.py:153, copiados da ESPECIFICACAO.md §7.3: estão certos, mas nada no repositório os recalcula, e a §7.3 os rebaixou a descrição, não critério, em 15/09 — não são a régua que o A06 usa com o mesmo nome. Saiu do texto de 2 minutos e fica aqui, sem perder nada: a diferença de distância percorrida é de -6 metros na faixa técnica alta e 25 na média, nenhuma das 10 comparações apareceu, e a estabilidade do traço é medida no ranking ano a ano — um clube muda em média 3,5 posições no de corrida, contra 6,1 no de xG criado e 6,1 no de pressão. O gráfico desta conclusão é a própria estratificação que a manchete afirma — 9.614 contra 9.620 na faixa técnica alta e 9.607 contra 9.582 na média, na mesma régua de metros por jogo —, e não os acessos e rebaixamentos por terço de sprint da segunda frase: aquele contraste 2 × 2 não tem teste nenhum no repositório, nem em A11_estratificado.csv nem em A11_correlacoes.csv, e desenhado sem o denominador de 28 clube-temporadas por terço ele gritaria uma diferença sob uma manchete que afirma um não-achado. Correção de 20/09, depois da conferência: o campo grafico SAIU desta conclusão, pelo mesmo motivo que a A11-2 registrou para a metade das recuperações. O grupos de estudo_serieb_grafico.js não tem régua fixa nem zero — toma o mínimo e o máximo dos próprios pontos e abre 35% de folga de cada lado (linhas 96-101) —, então com 9.582, 9.607, 9.614 e 9.620 o eixo ia de 9568,7 a 9633,3 e os 25 metros da faixa técnica média, que são 0,26% do valor, ocupavam cerca de 40% da largura do desenho. Sem o n de cada grupo, sem escala e sem o selo “sem diferença clara”, o leitor da tela via na faixa média uma distância visível entre quem subiu e o meio logo abaixo de uma manchete que afirma um não-achado — e essa comparação é d = 0,091, p = 0,80392 e q = 0,98515 em A11_estratificado.csv, com 4 promovidos contra 18 do meio, o ponto mais deslocado sendo justamente a média de 4 clube-temporadas. É exatamente o defeito que o parágrafo acima já usava para recusar o outro gráfico. Com um renderizador que normaliza pelo mínimo e pelo máximo dos próprios pontos não existe desenho honesto de um empate: pôr o não-achado no título e o n em cada série amenizaria, mas não tiraria os 40% de folga para 0,26% de diferença. A conclusão é negativa e se sustenta na manchete, no texto, no selo de indício e no campo n; a estratificação segue publicada em A11_estratificado.csv. Correção de 20/09, terceira passada: o não-achado VOLTOU ao o_que_vimos. O encurtamento tinha deixado na tela só 9.614 contra 9.620 metros, sem nada dizendo que nenhuma das 10 comparações de A11_estratificado.csv apareceu — e, com o campo grafico já retirado por este mesmo parágrafo e o confianca_motivo servindo só de tooltip do selo, o leitor da tela ficava com dois números brutos debaixo de uma manchete que afirma um não-achado e podia lê-los como resultado. A frase acima, que dava a comparação por saída do texto de 2 minutos, vale agora só para o resto do que saiu: a diferença de -6 metros na faixa alta, os 25 da média e os quatro números de persistência seguem apenas aqui. O texto visível ficou com 273 caracteres na tela, dentro da régua de 280, e nenhum número precisou sair para isso caber.",
   "n": "49 das 80 clube-temporadas na estratificação: 4 promovidos contra 18 do meio na faixa técnica média e 12 contra 15 na alta, e a faixa técnica baixa não teve promovido nenhum em 2022–2025; sem os times colados nas linhas sobra a faixa alta, 7 contra 9. Os terços de sprint são 28 contra 28, dentro das mesmas 80 linhas (40 clubes).",
   "prova": "A11_estratificado.csv; A11_correlacoes.csv, família resultado",
   "status": "validada",
   "negativa": true,
   "grafico": null
  },
  {
   "id": "A12-2",
   "parte": "A12",
   "bloco": "A",
   "manchete": "Quem jogou como os que subiram sem dinheiro caiu mais do que subiu",
   "o_que_vimos": "Entre 2022 e 2025, 22 dos 80 times jogaram dentro da faixa do Cenário Barato, e o saldo foi 4 acessos contra 7 quedas. Dois dos que subiram assim eram dos elencos mais caros, então a faixa não é dos pobres. Só contando os sem dinheiro ela parece ajudar, 2 de 13 contra 4 de 48.",
   "para_o_santa_cruz": "Copiar o jeito de jogar dos quatro que subiram sem dinheiro não aumenta a chance de subir — nesses quatro anos aumentou a de cair. Se o Santa Cruz montar o time assim, que seja escolha de projeto, sabendo que a faixa descreve mais de um quarto da liga e que os três números dela mudam com o placar: time que vai ganhando pressiona menos e joga mais direto. E a ideia de que isso seria um “perfil de trave” não tem teste por trás: nas nove réguas, subir e ficar entre o 5º e o 8º só se distingue pelo valor do elenco, e mesmo essa diferença some sem os times colados na linha.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Sugere registrar que não existe “perfil do acesso barato”: a faixa de posse, pressão e bola longa dos quatro que subiram sem dinheiro descreve 22 dos 80 times do período e, entre eles, houve mais rebaixamento (7) que acesso (4).",
   "confianca": "indício",
   "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios. (a) Benjamini-Hochberg a 5% na família: NÃO. O Cenário Barato não é teste — A12_reguas.csv só traz as nove réguas e não existe q para esta faixa em arquivo nenhum do estudo; é contagem. (b) Porta temporal da §6.4: NÃO. Nunca foi rodada aqui, e o PPDA, um dos três itens do perfil, já reprova na tabela da própria §6.4 (parcial −0,103, p 0,363). Nenhum dos dois = indício, e a frase diz por quê: a faixa foi desenhada sobre 4 casos, e posse, pressão e bola longa são exatamente os três indicadores que a regra do Placar manda ressalvar — “pode ser efeito do placar”, e elenco caro tende a ter esse PPDA sem que o estudo separe as duas coisas. ROBUSTEZ (varredura de 19/09): o caso era o enquadramento citado de um lado só, e agora os DOIS estão no texto, com o número de cada um. Enquadramento do conjunto, que estava calado: 22 dos 80 cabem no perfil publicado, 4 subiram (18,2% contra 20,0% da liga) e 7 caíram (31,8% contra os mesmos 20,0%) — vai na direção contrária da manchete antiga. Enquadramento de quem está fora do top-8 de valor, o único que o texto antigo citava: 13 cabem e 2 subiram (15,4% contra 8,3% dos 48); ele fica, dito como o único jeito de contar em que a faixa parece ajudar. Como os dois enquadramentos se contradizem, a conclusão INVERTE — é a decisão da proposta v2 validada pelo dono em 19/09. Soma-se o esvaziamento do rótulo: dois dos 4 que subiram dentro do perfil são Athletico-PR 2025 (1º em valor do ano) e Remo 2025 (3º). O segundo caso da varredura, a frase “perfil de trave”, é resolvido dizendo o que o recorte Sobe × Trave mostra nos dois cortes de fronteira (só H_dinheiro, q 0,01723 com os times de fronteira e 0,06333 sem eles), em vez de calar. FICA EM ABERTO: a rodada com e sem os times de fronteira nunca foi feita sobre o próprio Cenário Barato (o refutador que a pediu em 18/09 foi derrubado por 1 a 3), e três dos quatro casos de origem são times de fronteira. O QUE SAIU DO TEXTO NA PASSADA DA ETAPA 8, e por isso está registrado aqui: (i) o enquadramento de quem está fora do top-8 de valor — 13 cabem na faixa e 2 subiram (15,4% contra 8,3% dos 48) —, que continua descrito acima e é o único jeito de contar em que a faixa parece ajudar; (ii) a fotografia de 2026, na 27ª rodada de 38, com 5 times sem dinheiro dentro da faixa e o melhor deles em 6º com 43 pontos — temporada aberta, que por isso não sustenta frase publicada. SOBRE O GRÁFICO desta conclusão: ele compara as três taxas de contagem (18,2% de acesso e 31,8% de queda dentro da faixa contra 20,0% de cada lado na liga) e não é teste — não há q para esta faixa em arquivo nenhum do estudo, como o item (a) acima já diz. CORREÇÃO DE 20/09, na conferência da etapa 8, duas. (1) O enquadramento de quem está fora do top-8 de valor VOLTOU ao que vimos — “2 de 13 contra 4 de 48” —, porque sem ele a tela voltava a contar a faixa de um lado só e desfazia a correção de 19/09 registrada acima; o item (i) do bloco anterior continua descrevendo o mesmo recorte, agora ao lado do texto e não no lugar dele. Isso importa para quem decide: um clube sem dinheiro lendo a tela precisa ver que, no recorte que é o dele, a faixa sobe 15,4% contra 8,3%. (2) O gráfico deixou de ter uma barra única “Na liga” servindo de referência às DUAS comparações ao mesmo tempo — funcionava por acidente aritmético, porque 16 de 80 e 16 de 80 dão o mesmo 20,0%, e o rótulo não dizia qual das duas era. Agora são quatro barras: 18,2% de acesso na faixa contra 20,0% na liga, e 31,8% de queda na faixa contra os mesmos 20,0%. CORREÇÃO DE 20/09, TERCEIRA PASSADA DA ETAPA 8, uma. O recorte de quem está fora do top-8 de valor deixou de ser apresentado como achado de subgrupo (“só ENTRE os sem dinheiro ela parece ajudar”) e voltou a ser o que sempre foi, um ENQUADRAMENTO DE CONTAGEM: “só CONTANDO os sem dinheiro ela parece ajudar”. A diferença não é de estilo. O texto antigo dizia “essa é a única maneira de contar em que a faixa parece ajudar”, o que avisa que há vários enquadramentos e que eles se contradizem; “entre os sem dinheiro” afirma um achado dentro de um grupo, e nesta conclusão de selo indício, cujo para_o_santa_cruz diz o oposto, quem lê a tela e É sem dinheiro é o próprio Santa Cruz. Junto voltaram os dois pares brutos, 2 de 13 contra 4 de 48, no lugar de 15,4% contra 8,3%: a taxa fazia uma comparação de dois contra quatro eventos chegar à tela como diferença quase dobrada, sem o n de nenhum dos lados. Os percentuais continuam escritos acima, com o n ao lado, e não há q para esta faixa em arquivo nenhum do estudo, como o item (a) já diz.",
   "n": "22 times na faixa entre 2022 e 2025, 4 casos de origem, e os 20 times de 2026 na 27ª rodada de 38",
   "prova": "A12_cenario_barato.json, envelope; A12_teste_2026.json, baratos_no_perfil_2026; A12_resumo.json, cenario_barato; A12_numeros_novos.json",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "barras",
    "titulo": "Acesso e queda de quem jogou dentro da faixa, 2022 a 2025",
    "unidade": "%",
    "barras": [
     {
      "nome": "Sobe na faixa",
      "valor": "18,2"
     },
     {
      "nome": "Sobe na liga",
      "valor": "20,0"
     },
     {
      "nome": "Cai na faixa",
      "valor": "31,8"
     },
     {
      "nome": "Cai na liga",
      "valor": "20,0"
     }
    ]
   }
  },
  {
   "id": "A12-3",
   "parte": "A12",
   "bloco": "A",
   "manchete": "A faixa publicada do time barato deixa de fora dois dos quatro casos",
   "o_que_vimos": "A faixa publicada é pressão de 10,0 a 13,2, posse de 47% a 52% e bola longa de 10% a 14%. Cobrada ao pé da letra, o Vitória de 2023 e a Chapecoense de 2025 ficam de fora por centésimos. Dos quatro, só pressionar pouco é comum.",
   "para_o_santa_cruz": "Não trate a faixa como alvo de montagem: ela é o menor e o maior de quatro times, sem folga nenhuma, e em número bruto de anos diferentes. O que se sustenta dos quatro é uma coisa só: todos pressionavam pouco, entre o 13º e o 20º da liga no ano deles. Posse e bola longa espalham pela tabela inteira e não servem de requisito para o elenco de 2027 — se a faixa for usada, que seja como lugar dentro da temporada, nunca como número bruto.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Sugere registrar que a frase “perfil coerente entre si” da §7.2(b) não se sustenta quando cada caso é lido dentro do próprio ano: a única coisa em comum aos quatro é pressionar pouco.",
   "confianca": "indício",
   "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios. (a) Benjamini-Hochberg a 5% na família: NÃO. Não há teste nenhum aqui — é a conferência de quatro valores contra um texto, e não existe q para ela em arquivo algum do estudo. (b) Porta temporal da §6.4: NÃO, e não se aplica: nada foi previsto. Nenhum dos dois = indício, e a frase diz por quê: são 4 casos e uma conferência de texto, não uma medida. É a proposta v2 validada pelo dono em 19/09 que traz esta conclusão de firme para indício. Registro de honestidade: o refutador que pediu exatamente este rebaixamento em 18/09 foi derrubado por 1 a 3, mas a régua do CLAUDE.md não abre exceção para contagem — sem os dois critérios, o selo é indício. O “dois dos quatro” fica como está: o refutador que queria trocá-lo por “um dos quatro” foi derrubado por 0 a 3. Os valores são conferíveis um a um em dados/serieb_clube_temporada.csv, e o envelope real, que por decisão da Didática não entra na manchete nem no que vimos, fica aqui na prova: PPDA 10,0184-13,1684 · posse 47,4203-52,0153% · passe longo 10,0326-14,0858%. O QUE SAIU DO TEXTO NA PASSADA DA ETAPA 8, e por isso está registrado aqui: (i) por quanto cada um dos dois fica de fora — 52,0153% de posse do Vitória de 2023 contra o teto de 52%, e 14,0858% de bola longa da Chapecoense de 2025 contra o teto de 14% —, que é a medida de quão apertada é a faixa e continua conferível um a um em dados/serieb_clube_temporada.csv; (ii) os lugares dentro do próprio ano, que passam para o gráfico. SOBRE O GRÁFICO desta conclusão: ele põe lado a lado o melhor e o pior lugar dos quatro em cada item (13º a 20º em pressão, 5º a 17º em posse e 3º a 19º em bola longa), que é onde se vê que só pressionar pouco é comum aos quatro. Não é um gráfico de dois cortes porque aqui não há teste nem corte de fronteira: é conferência de quatro valores contra um texto. CORREÇÃO DE 20/09, na conferência da etapa 8, três. (1) A manchete voltou a trazer o qualificador (“a faixa PUBLICADA”), que a passada anterior tinha perdido ao dizer “a faixa do time barato exclui… os times que ela descreve”: quem deixa os dois de fora é o número redondo publicado (posse 47 a 52, longa 10 a 14), não o envelope real (PPDA 10,0184-13,1684 · posse 47,4203-52,0153% · passe longo 10,0326-14,0858%), cujos tetos são exatamente os valores do Vitória e da Chapecoense e portanto INCLUEM os quatro. Sem o qualificador a frase virava propriedade da faixa em vez de propriedade do arredondamento, e a própria prova acima a contradizia. (2) Por quanto cada um fica de fora voltou ao que vimos, 52,0153% contra o teto de 52% e 14,0858% contra o teto de 14%: é o que mostra ao leitor que a exclusão é um fio de cabelo e que o problema é o arredondamento — sem o número, “fica fora pela posse” se lê como se o Vitória tivesse posse demais. O item (i) acima continua valendo, agora ao lado do texto e não no lugar dele. (3) O gráfico passou a declarar a unidade (“lugar na liga”) e trocou “melhor/pior” por “mais/menos” em cada item, porque as três ordenações apontam para lados diferentes: em pressão a fila vai de quem mais pressiona para quem menos pressiona, então o 13º QUER DIZER pressionar pouco, enquanto em posse o 5º quer dizer muita bola e em bola longa o 3º quer dizer jogar mais longo. FICA REGISTRADO, e não dá para consertar deste arquivo: o fmt() de static/estudo_serieb_grafico.js escolhe a casa decimal pela faixa de grandeza, então estes lugares sairão na tela como “5,00”, “3,00”, “13,0” e “20,0”. É conserto de uma linha no renderizador, que é arquivo da tela e não desta parte. ETAPA 8 (20/09), o que saiu do texto de 10 segundos: os dois casos que ficam fora da faixa publicada ficam por centésimos — o Vitória de 2023 com 52,0153% de posse contra o teto de 52%, e a Chapecoense de 2025 com 14,0858% de bola longa contra o teto de 14%. Publicar essas casas decimais no texto de leitura fazia a precisão parecer medida, quando ela é justamente a prova de que a faixa é apertada demais para servir de alvo.",
   "n": "4 casos, de 2023 a 2025",
   "prova": "A12_cenario_barato.json, envelope; dados/serieb_clube_temporada.csv; A12_numeros_novos.json",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "grupos",
    "titulo": "Onde os quatro times baratos ficaram na liga",
    "unidade": "lugar na liga, de 1º a 20º",
    "series": [
     {
      "nome": "Pressão · o mais alto dos quatro",
      "valor": 13
     },
     {
      "nome": "Pressão · o mais baixo",
      "valor": 20
     },
     {
      "nome": "Posse · o mais alto dos quatro",
      "valor": 5
     },
     {
      "nome": "Posse · o mais baixo",
      "valor": 17
     },
     {
      "nome": "Bola longa · o mais alto dos quatro",
      "valor": 3
     },
     {
      "nome": "Bola longa · o mais baixo",
      "valor": 19
     }
    ]
   }
  },
  {
   "id": "A13-3",
   "parte": "A13",
   "bloco": "A",
   "manchete": "A tabela da metade dá vantagem, não garante a vaga",
   "o_que_vimos": "O terço que mais pontuou no 1º turno fez 31 pontos no returno e o de baixo fez 22. Mas eles se cruzam nos dois cortes: o Ituano de 2022, do terço de baixo, fez 37 e passou o melhor do terço de cima, 36. Essa vantagem é feita de pontos já somados na classificação final.",
   "para_o_santa_cruz": "Vantagem na metade é banco de pontos, não vaga: dos 16 times que estavam no G4 na rodada 19, 6 terminaram fora dele — e todos os seis terminaram a 3 pontos ou menos do 4º colocado, por isso somem quando se tira quem acabou colado na linha. A segunda metade se monta como campanha própria — carga física, rodízio e reforço de julho —, e não administrando o que já foi feito.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Não trata de nenhuma das premissas de dados/premissas.json. Se alguma entrar, é a de planejar e orçar a janela do meio do ano sugerida em A13-1.",
   "confianca": "provável",
   "confianca_motivo": "Provável porque passa em um dos dois critérios. (a) Correção para múltiplos testes a 5% dentro da família: NÃO — A13_testes.csv existe desde 20/09 e scripts/A13.py importa scripts/_metodo.py, mas a tabela só traz as comparações entre as faixas: os três previsores desta conclusão continuam saindo com p bruto, sem q, fora dela. (b) Porta temporal da §6.4: SIM — é o único par de toda a A13 em que o previsor é medido inteiro nas 19 primeiras rodadas e o desfecho inteiro nas 19 últimas, e a própria §6.4 publica esse par como linha de referência, em posto dentro do ano; o recálculo bate com ela. Um sim e um não = provável. A associação entre os dois turnos sobrevive aos dois cortes: 0,48 nas 80 campanhas e 0,4 nas 52 sem os times colados nas linhas. Ressalvas para a prova: por temporada a associação some em 2022 e o intervalo por clube é largo; o número que a conclusão antiga usava para o xG (0,486) media o saldo de xG do 1º turno contra a POSIÇÃO FINAL — exatamente o par contaminado que esta conclusão denuncia —, e por isso a frase do xG saiu do texto: o par limpo, xG do 1º turno contra os pontos do 2º, vale 0,4217, e o xG ainda tem confiabilidade abaixo do piso da especificação. Duas coisas ficam aqui nesta passada, e a segunda volta também ao texto. O degrau entre os terços cai de 9 pontos nas 80 campanhas para 5,5 nas 52 sem os times de fronteira (27,5 contra 22,0, pela mesma regra de terço do script), e esse par não entra no gráfico porque a mediana do returno por terço só foi calculada para as 80: o gráfico mostra nos dois cortes a associação entre os turnos, que é o único par da conclusão com marcador nos dois cortes. E o que a tabela da metade mostra em primeiro lugar são os pontos já ganhos, que já estão somados na classificação final — é o mesmo defeito que esta conclusão denuncia.",
   "n": "80 clube-temporadas de 2022 a 2025 (52 sem os times colados nas linhas de corte); 27 no terço de cima e 28 no terço de baixo do 1º turno",
   "prova": "A13_resumo.json, previsores_do_1o_turno; A13_turnos.csv; A13_numeros_novos.json; A01_clube_temporada.csv",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "dois_cortes",
    "titulo": "Quanto o 1º turno acompanha o 2º",
    "unidade": "",
    "cortes": [
     {
      "rotulo": "com todos os times",
      "series": [
       {
        "nome": "Os dois turnos",
        "valor": 0.484
       }
      ]
     },
     {
      "rotulo": "sem os times de fronteira",
      "series": [
       {
        "nome": "Os dois turnos",
        "valor": 0.399
       }
      ]
     }
    ]
   }
  },
  {
   "id": "A14-2",
   "parte": "A14",
   "bloco": "A",
   "manchete": "Um ano sozinho não tem times suficientes para dizer se a régua vale",
   "o_que_vimos": "Ela pôs os quatro promovidos entre os seus quatro primeiros em um dos quatro anos, e dois ou três nos outros. Mas foi montada com esses mesmos quatro, nenhum ficou de fora, e justamente o ano dos quatro fica com um promovido só, sem teste, tirando os times de fronteira.",
   "para_o_santa_cruz": "Não decida contratação pela posição do time na régua de um ano só: olhe as quatro temporadas juntas, porque o retrato de um ano muda conforme quem entra na conta. E não leia isto como “a régua não vale” — o que o ano isolado diz é que não há times suficientes para responder, e nada aqui testa se a régua prevê o acesso.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Não trata de nenhuma premissa existente.",
   "confianca": "indício",
   "confianca_motivo": "Indício, e é uma queda: o texto de 17/09 dizia firme. (a) Correção para múltiplos testes a 5%: NÃO — a afirmação publicada se apoiava justamente nos dois anos que não passam. Com o índice de 7 componentes e o corte COM fronteira, a família das quatro temporadas fica assim: 2022 d 2,20 p 0,00520 q 0,01040 · 2023 d 0,87 p 0,11491 q 0,15322 · 2024 d 2,77 p 0,00022 q 0,00088 · 2025 d 0,74 p 0,39010 q 0,39010 — mínimo detectável 1,74 em todas (4 contra 12). Passam 2.022 e 2.024; 2.023 e 2.025 não passam — e não passar não é passar. Pior para a frase antiga: os dois efeitos fracos estão ABAIXO do mínimo detectável do desenho (1,74, com quatro promovidos contra doze do meio), e a §6.7 proíbe transformar “este desenho não enxergaria” em “não existe”. (b) Porta temporal da §6.4: NÃO, nunca rodada no nível da temporada; e no nível dos componentes só dist_remate passa (_porta_temporal.md). Nenhum dos dois critérios = indício, e a frase diz por quê: são quatro promovidos por temporada. Robustez da fronteira: é ela que INVERTE a conclusão — por isso o destino é “Parece, mas não é”, e não só um nível a menos. Sem os times colados na linha: 2022 4x9 d 2,18 p 0,00667 q 0,00667 (mínimo detectável 1,85) · 2023 1x5 sem teste · 2024 1x10 sem teste · 2025 2x8 d 2,68 p 0,00016 q 0,00032 (mínimo detectável 2,53). Ou seja, 2.025, o ano que o texto publicado chamava de fraco, vira o mais nítido dos quatro, e 2.023 e 2.024 ficam com um promovido só, sem teste possível. Logo “metade das temporadas” e o par (2.022, 2.024) são artefato do corte: não há duas temporadas em que a régua falhe, há duas em que não sobram times para responder — e quais duas depende de quem se conta. Some-se o achado 3 a 3 da auditoria: “deixando uma temporada de fora” não descreve o código — a variável treino da linha 202 de A14.py nunca é usada, e os componentes foram escolhidos com as quatro temporadas, inclusive a que se diz deixada de fora. Por isso o texto novo abre dizendo que nenhuma temporada ficou de fora. Passada de texto de 20/09, e o conserto do mesmo dia: esta conclusão FICA SEM GRÁFICO, de propósito. O gráfico de barras que ela teve por algumas horas mostrava a contagem de promovidos no alto do índice por temporada, num corte só, e entregava ao leitor a leitura exatamente invertida: 2.024 era a barra mais alta e é 1x10 sem os times de fronteira, grupo de 1, sem variância e sem teste; 2.025 era das mais baixas e é o ano mais nítido dos quatro sem eles (2022 4x9 d 2,18 p 0,00667 q 0,00667 (mínimo detectável 1,85) · 2023 1x5 sem teste · 2024 1x10 sem teste · 2025 2x8 d 2,68 p 0,00016 q 0,00032 (mínimo detectável 2,53)). E a linha tracejada nos quatro promovidos transformava contagem em placar por ano, quando a manchete fala de falta de times — contagem não mostra poder nenhum. Como a tese inteira é o corte de fronteira, a forma certa seria dois_cortes; não existe par de marcadores por temporada nos dois cortes na saída do script (só top4_2022 a top4_2025, que são de um corte só), então preferi não publicar desenho nenhum a publicar o corte único. A contagem por temporada continua no o_que_vimos, por extenso, e não se perdeu. Nada mais saiu: o mínimo detectável 1,74, a família das quatro temporadas e a inversão de metade fraca entre os dois cortes já estavam neste campo, acima, e continuam aqui — é onde o jargão é permitido. Terceira passada de 20/09, com dois consertos e uma correção deste campo. (1) CORREÇÃO: a frase acima, “Por isso o texto novo abre dizendo que nenhuma temporada ficou de fora”, descrevia o texto de 19/09 e deixou de ser verdade quando a passada de 20/09 encurtou o o_que_vimos — o encurtamento levou a ressalva junto, sem que ninguém decidisse tirá-la. Ela voltou ao texto visível, agora como “foi montada com esses mesmos quatro, nenhum ficou de fora”: é a circularidade, e o leitor precisa dela justamente porque o para_o_santa_cruz manda olhar as quatro temporadas juntas, que são as mesmas com que os componentes foram escolhidos. (2) O texto curto exibia o 4 em 4 solto, e esse ano é 2.024, que em 2022 4x9 d 2,18 p 0,00667 q 0,00667 (mínimo detectável 1,85) · 2023 1x5 sem teste · 2024 1x10 sem teste · 2025 2x8 d 2,68 p 0,00016 q 0,00032 (mínimo detectável 2,53) fica 1x10 SEM TESTE: grupo de um, sem variância e sem comparação. Exibir o único fato positivo do texto sem dizer que ele evapora no outro corte é publicar a leitura invertida, então a mesma frase agora carrega “justamente o ano dos quatro fica com um promovido só, sem teste, tirando os times de fronteira”. (3) Para caber nos 280, saiu a frase genérica “qual temporada parece fraca muda conforme quem entra na conta” — a inversão continua dita, e com nome, no caso concreto do ano dos quatro; o “um ano sozinho não responde” repetia a manchete e também saiu. Nenhum número mudou. Quarta passada de 20/09, e esta é troca de número, não de texto: o q de 2.023 nesta família passou a ser o que o A14.py grava, o mesmo que já estava no A14_testes.csv e no A14_resumo.json, no lugar do que vinha publicado — a decisão do dono é que o script é a verdade, e a diferença está na última casa decimal. Reli a frase com o valor novo no lugar e nenhuma palavra precisou mudar: a família continua com dois anos que passam (2.022 e 2.024) e dois que não (2.023 e 2.025), o de 2.023 continua acima do limiar de 5%, e os dois efeitos fracos continuam abaixo do mínimo detectável de 1,74.",
   "n": "4 temporadas fechadas, 4 promovidos contra 12 do meio em cada; sem os times colados na linha, 2.022 fica 4 contra 9 e 2.025 fica 2 contra 8, e 2.023 e 2.024 ficam com 1 promovido, sem comparação",
   "prova": "A14_resumo.json, validacao_uma_temporada_de_fora; A14_numeros_novos.json; A01_clube_temporada.csv; _porta_temporal.md",
   "status": "validada",
   "negativa": true,
   "grafico": null
  },
  {
   "id": "T02-3",
   "parte": "T02",
   "bloco": "T",
   "manchete": "O tempo no G4 no clube anterior não anuncia o do clube seguinte",
   "o_que_vimos": "Dos 28 treinadores com dois clubes ou mais, 7 tiveram um ano zerado no G4 e outro quase todo lá. E o ano bom quase não foi melhor no placar, 0,12 ponto por jogo, e em 3 deles foi igual ou pior. Com 28 nomes só uma ligação forte apareceria, e isso não prova que nada se transfere.",
   "para_o_santa_cruz": "Não contratar ninguém pelo melhor ano de G4: o pico não se repete no clube seguinte — e nem no mesmo clube, porque nos 8 casos de treinador que ficou mais de uma temporada no mesmo clube a oscilação é pelo menos tão grande quanto entre clubes. O que sobra para comparar nomes é o ponto por jogo de cada passagem, com o valor do elenco ao lado.",
   "premissa": "m5",
   "premissa_titulo": "Comissão técnica top — investir",
   "premissa_grupo": "Montagem do elenco",
   "premissa_motivo": "Ajusta a m5 (Comissão técnica top — investir): investir na comissão continua valendo, mas a base não oferece jeito de identificar o treinador top pelo tempo no G4 — esse critério não serve para escolher.",
   "confianca": "indício",
   "confianca_motivo": "(a) Correção para múltiplos testes a 5%: não passa — nenhuma das contagens desta conclusão foi testada: o T02_testes.csv que o scripts/T02.py grava só traz as comparações de faixa de valor da T02-1, e nenhuma linha dele mede oscilação de treinador. Os marcadores da frase o script já grava, mas gravar o número não é testá-lo. (b) Porta temporal: não passa, não foi rodada em lugar nenhum da parte. Nenhum dos dois = indício — e, por ser conclusão negativa, a §6.7 manda publicar o poder junto: com 28 nomes, a menor ligação que este desenho enxergaria a 80% é r = 0,51, e a observada do primeiro clube para o clube seguinte é r = 0,11 (p = 0,59). “Contagem completa” não é um terceiro caminho para firme. O achado 1 da auditoria (derrubado, 1/3) não muda o nível: o nulo que embaralha passagens entre clubes e temporadas acha “constância”, mas embaralha justamente o que a T02-1 mostrou mandar no tempo de G4 — permutando dentro do clube-temporada não sobra sinal de transferência a publicar. Os dois cortes, com o número ao lado: a amplitude mediana saiu do texto por valer coisas diferentes conforme o corte (21,7 contando todas as rodadas contra 3,5 da 10ª em diante), enquanto a cauda dos 50 pontos percentuais ou mais sobrevive aos dois (8 e 9); e a oscilação dentro do mesmo clube é 22,4 contra 21,7 entre clubes contando tudo, o que sustenta o “pelo menos tão grande” do uso prático e não o “do mesmo tamanho” da versão antiga. Os 7 que oscilam são Claudinei Oliveira, Enderson Moreira, Guto Ferreira, Jorginho, Léo Condé, Mozart e Vagner Mancini, e o critério do ano cheio é o time no G4 em mais de 8 de cada 10 rodadas — a lista saiu do texto de 10 segundos e fica aqui. Contando só da 10ª rodada em diante são 8 nomes, 0,26 ponto por jogo de diferença e 2 casos iguais ou piores. No gráfico ficaram os dois cortes de quem oscila e mais nada — 7 e 8 dos 28 multiclube, a mesma base nos dois blocos. Os 3 e os 2 que renderam o mesmo ou menos saíram do gráfico porque não são de 28: são de 7 e de 8, e no mesmo eixo pareceriam a mesma conta. Eles ficam no texto, onde o “deles” diz de quem são. Sobre o tamanho do 0,12: ele é a MEDIANA da série dos 7 (−0,28 · −0,06 · 0,00 · +0,12 · +0,16 · +0,36 · +0,52), não uma média nem um ganho típico — é por isso que o texto de 10 segundos diz que o ano bom quase não foi melhor no placar, e não que ele rendeu mais.",
   "n": "28 treinadores com dois clubes ou mais (2022–2025); 2026 fica à parte, como teste",
   "prova": "T02_passagem.csv; T02_numeros_novos.json (correlacao_T02_3); T02.md, seção Prova",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "dois_cortes",
    "titulo": "Treinadores que oscilam entre um ano zerado no G4 e um ano com o time quase sempre lá",
    "unidade": "treinadores",
    "cortes": [
     {
      "rotulo": "contando todas as rodadas",
      "series": [
       {
        "nome": "Oscilam",
        "valor": 7
       }
      ]
     },
     {
      "rotulo": "só da 10ª rodada em diante",
      "series": [
       {
        "nome": "Oscilam",
        "valor": 8
       }
      ]
     }
    ]
   }
  },
  {
   "id": "T03-2",
   "parte": "T03",
   "bloco": "T",
   "manchete": "Trocar de treinador não muda o jeito de jogar do time",
   "o_que_vimos": "Em 66 trocas de treinador, nenhum dos 7 traços do jeito de jogar puxa o time para um lado só. Cada time anda de 4 a 7,5 posições na tabela, mas a passagem de um treinador só, cortada ao meio, anda o mesmo tanto. É janela curta oscilando, e não a chegada do treinador.",
   "para_o_santa_cruz": "Trocar treinador no meio da temporada não compra um modelo de jogo novo: o placar sobe, de 1,15 para 1,32 ponto por jogo, e sobe em 43 das 66 trocas — mas a mesma conta feita sem troca nenhuma anda na direção oposta, de 1,55 para 1,33 em 75 passagens de um treinador só cortadas ao meio, e as duas terminam no mesmo lugar. Ou seja: quem troca troca no fundo do poço, e o que vem depois é o time voltando ao normal — se for para trocar, troque por gestão e por resultado, não esperando outro jeito de jogar. Esta conclusão pode ser efeito do placar: o xG criado e o xG sofrido mudam com ele, e a base não permite o recorte por estado do jogo.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Nenhuma premissa de dados/premissas.json trata disso, e não cabe sugerir uma nova: o desenho compara o treinador novo com o anterior no mesmo elenco, não com uma contrafactual do mesmo treinador, e não separa o efeito da troca do retorno ao normal.",
   "confianca": "indício",
   "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios da régua. (1) Correção para múltiplos testes a 5% por família: não passa — nas quatro temporadas fechadas, todos os 7 com q = 0,955 (menor p = 0,312, no xG por remate); com a temporada em andamento dentro também não passa nenhum, e lá o menor valor bruto é 0,206. (2) Porta temporal da §6.4: não rodou no T03, e o _porta_temporal.md registra que nenhuma das 19 partes a rodou. Sendo conclusão negativa, ela ainda depende do poder, que ninguém tinha calculado: o desenho só enxerga um movimento comum de 2,4 a 3,5 posições entre os 20 clubes, e quatro dos sete traços são de xG, cuja régua na janela curta de uma passagem fica em 0,16 — muito abaixo do mínimo de 0,40 da casa. O n também não é o que parece: as 66 trocas são 51 clube-temporadas e 31 clubes, com janelas que se sobrepõem, e os 7 IC95 por reamostragem de clube cruzam zero. Os dois cortes. (a) A janela: sem a temporada em andamento são 66 trocas, com ela 73, e os dois dão a MESMA leitura — nenhuma direção comum em nenhum dos sete traços. (b) As duas leituras do mesmo T03_antes_depois.csv: o texto antigo publicava só a mediana com sinal e calava a magnitude por caso; agora as duas aparecem, mas sem a leitura de que o time “muda muito” — o placebo, a mesma passagem do mesmo treinador cortada ao meio, anda o mesmo tanto, então a magnitude é janela curta, e não a chegada do treinador. Quantas trocas sobem contra quantas descem, traço a traço: 35/28 · 27/34 · 34/29 · 30/33 · 32/31 · 36/26 · 31/31. A regra da fronteira não se aplica: é antes-e-depois dentro do mesmo clube e da mesma temporada, e não comparação entre faixas. O que saiu do texto na passada de linguagem simples, e fica aqui: a janela do antes-e-depois é de pelo menos 8 jogos de cada lado, no mesmo clube e na mesma temporada; no traço em que mais trocas concordam são 36 das 66, e nos outros é menos. O gráfico desta conclusão põe os 1,15 e 1,32 ponto por jogo da troca ao lado do placebo, 1,55 e 1,33 em 75 passagens cortadas ao meio: as duas terminam no mesmo lugar. Sobre a forma do gráfico, decidido nesta passada: ele era “dois cortes”, a forma que esta aba usa para mostrar o corte de fronteira, e aqui os dois blocos não eram dois cortes da mesma conta, e sim duas populações — quem trocou e quem não trocou. Quem aprendeu a gramática visual da aba nas outras partes leria aquela forma como “a fragilidade da fronteira foi mostrada”, e ela não foi: como está escrito acima, a regra da fronteira não se aplica a um antes-e-depois dentro do mesmo clube. Agora são quatro barras numa régua só, que sobem do zero e deixam a comparação direta. E o título do gráfico carrega a leitura, porque a manchete fala do jeito de jogar e o desenho é de pontos por jogo: de relance, manchete mais gráfico diziam “o estilo não muda, mas os pontos sobem depois da troca”, que é exatamente a decisão que esta conclusão existe para impedir. Desenhar os sete traços no lugar dos pontos exigiria um marcador por traço, que o T03.py não grava hoje.",
   "n": "66 trocas em 51 clube-temporadas (31 clubes), 2022–2025 — as janelas se sobrepõem, porque o “depois” de uma troca vira o “antes” da seguinte, e 14 clube-temporadas entram com duas ou três trocas. Com a temporada em andamento dentro seriam 73. O placebo são 75 passagens de um treinador só, cortadas ao meio com 8 jogos ou mais de cada lado.",
   "prova": "T03_antes_depois.csv; T03_numeros_novos.json, chave bh_ad",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "barras",
    "titulo": "Depois da troca os pontos sobem, mas sem troca nenhuma eles caem para o mesmo lugar",
    "unidade": "pontos por jogo",
    "barras": [
     {
      "nome": "Antes da troca",
      "valor": 1.15
     },
     {
      "nome": "Depois da troca",
      "valor": 1.32
     },
     {
      "nome": "Antes, sem troca",
      "valor": 1.55
     },
     {
      "nome": "Depois, sem troca",
      "valor": 1.33
     }
    ]
   }
  },
  {
   "id": "T04-2",
   "parte": "T04",
   "bloco": "T",
   "manchete": "Esta base não mostra o histórico do treinador reaparecendo no clube seguinte",
   "o_que_vimos": "Entre os 28 treinadores que passaram por dois clubes ou mais, a diferença típica entre a melhor e a pior passagem dá 21,7 pontos percentuais no G4. O jeito de jogar também não acompanha. A base é pequena demais para fechar a conta: é falta de prova, não prova do contrário.",
   "para_o_santa_cruz": "Não pague pelo currículo de G4 nem pelo modelo de jogo: nenhum dos dois reaparece no clube seguinte, e o estudo também não consegue afirmar que não reapareceriam. E, depois do T04-1, também não vale a regra de escolher pela pior temporada: ela põe na frente quem nunca subiu e deixa de fora os dois que subiram com dois clubes diferentes. O que sobra de prático é usar a lista só para reduzir a conversa e decidir por entrevista, comissão e projeto, que este dado não mede; investir na comissão técnica continua de pé.",
   "premissa": "m5",
   "premissa_titulo": "Comissão técnica top — investir",
   "premissa_grupo": "Montagem do elenco",
   "premissa_motivo": "Ajusta a premissa m5 (\"Comissão técnica top — investir\", dados/premissas.json): investir na comissão continua valendo, mas histórico de G4 e modelo de jogo do treinador não servem de critério de escolha — a base não mostra que se repetem e, do tamanho em que está, não teria como mostrar. Sugere premissa nova: a escolha do treinador sai do estudo e vai para validação externa; nem a média nem a pior temporada do candidato ordenam a lista do mesmo jeito, e nenhuma das duas acerta quem subiu.",
   "confianca": "indício",
   "confianca_motivo": "(a) Correção para múltiplos testes dentro da família: não. Não existe T03_testes.csv nem T04_testes.csv — os onze arquivos de teste de resultados/ são todos dos blocos A e J — e, aplicando o bh() de scripts/_metodo.py aos sete valores de Wilcoxon do antes e depois do T03_resumo.json, todos dão q = 0,669. A perna do T02 é amplitude, que é descrição e não teste, como o próprio T02-1 escreve. (b) Porta temporal (§6.4): não — nenhum script do bloco T a roda, e o pct_g4_apos_10 é recorte de rodadas, não a porta. Zero dos dois: indício, e a frase diz por quê. Uma negativa tripla sem correção, sem anterioridade e sem mínimo detectável não carrega o selo mais forte da casa, ainda mais quando o que foi medido aponta para o lado contrário da frase: a repetição entre clubes deu 0,27 num desenho que só enxergaria um efeito de 0,48, e o pareado do antes e depois só enxergaria 0,33. O que saiu do texto de 10 segundos e mora aqui: 8 dos 28 multiclube variam mais de 50 pontos percentuais — uma passagem quase sempre no G4 e outra quase nunca. O jeito de jogar foi medido em 126 passagens de 64 nomes e em 66 trocas no meio da temporada com pelo menos 8 jogos de cada lado; com a base inteira, 2026 incluído, são 34 multiclube, 16,2 pontos percentuais típicos, 9 acima de 50, 151 passagens, 69 nomes e 73 trocas, e a leitura é a mesma. E 3 dos 7 traços do perfil são medidos com régua curta demais para mostrar repetição ainda que ela existisse — por isso a frase é falta de prova de que o treinador se repete, e não prova de que ele não se repete.",
   "n": "126 passagens de 64 treinadores nas temporadas fechadas, 28 deles em dois clubes ou mais, e 66 trocas no meio da temporada (com 2026: 151 passagens, 69 treinadores, 34 multiclube e 73 trocas).",
   "prova": "T02_passagem.csv, coluna pct_g4, para a amplitude entre a melhor e a pior passagem de cada treinador; T03_passagens.csv e T03_resumo.json, chave nulo_dois_quaisquer, para a repetição do perfil entre clubes; T03_antes_depois.csv, colunas jogos_antes e jogos_depois, para as trocas no meio da temporada; T04_numeros_novos.json, chaves dmin_multi, dmin_antes_depois e conf_tracos: o desenho entre clubes só detecta 0,48 e mediu 0,27, o pareado do antes e depois só detecta 0,33, e 3 dos 7 traços ficam abaixo do piso de 0,40 de confiabilidade.",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "dois_cortes",
    "titulo": "Distância entre a melhor e a pior passagem do mesmo treinador",
    "unidade": "pontos percentuais do tempo no G4",
    "cortes": [
     {
      "rotulo": "só as temporadas fechadas",
      "series": [
       {
        "nome": "Diferença típica",
        "valor": 21.7
       }
      ]
     },
     {
      "rotulo": "com a temporada em curso",
      "series": [
       {
        "nome": "Diferença típica",
        "valor": 16.2
       }
      ]
     }
    ]
   }
  },
  {
   "id": "J01-2",
   "parte": "J01",
   "bloco": "J",
   "manchete": "A ficha de lesão não distingue quem jogou pouco de quem jogou muito",
   "o_que_vimos": "Entre 2022 e 2025, 7% dos 1.974 jogador-temporadas de minutagem baixa com ficha no Transfermarkt têm lesão registrada, contra 7,5% dos 348 de alta. Quando há lesão, quem jogou pouco fica 56 dias fora contra 33, em parte porque quem fez 60% dos minutos não ficou meio ano parado.",
   "para_o_santa_cruz": "Diante de um alvo com pouco tempo de jogo, a hipótese padrão continua sendo que ele não era opção do treinador, e a ficha de lesão não desmente isso. Mas não risque o nome por aí: em pouco mais de um quarto das linhas (838 de 3.160) não há ficha nenhuma para consultar, a base só enxerga lesão grande, e quando há lesão em quem jogou pouco ela custa quase o dobro de dias — pergunte ao clube antes de decidir.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Não mexe em premissa existente. Sugere uma nova, no grupo Montagem do elenco: minutagem baixa se lê como escolha técnica até prova em contrário, porque a ficha de lesão não separa os dois grupos — e “não separa” aqui quer dizer que esta base não enxergaria nada abaixo de 12,3% contra 7,5%, não que a lesão não exista.",
   "confianca": "indício",
   "confianca_motivo": "Dos dois critérios de firme, esta conclusão não cumpre nenhum — por isso indício. (1) Correção para múltiplos testes a 5% dentro da família: NÃO. A tabela de testes da parte não existe e nenhum teste foi rodado aqui; além disso o achado é negativo, e a correção corrige achado, não promove ausência. (2) Porta temporal da §6.4: NÃO, e não é calculável (minutagem por temporada, o impedimento reconhecido na §6.5). Nenhum dos dois = indício, e são dois os motivos, não um — o publicado até aqui só citava a cobertura. O primeiro é o alcance do desenho: sobre 1.974 contra 348, a diferença observada é de -0,48 ponto, com erro padrão de 1,52 e margem de -3,5 a +2,5 pontos, e só enxergaria a lesão a partir de 12,3% contra os 7,5% do outro lado, pela lógica da §6.7. O segundo é a cobertura da ponte: 838 das 3.160 linhas ficam sem ficha, 27% — 372 sem id e 466 com nome ambíguo, listados e nunca adivinhados. O nível já estava certo; o motivo é que estava incompleto. O que saiu do o que vimos nesta passada e fica aqui, sem se perder: a diferença observada é de meio ponto e troca de lado conforme a temporada em curso entre ou não na conta (7% contra 7,5% nas quatro fechadas; 6,9% contra 6,7% com 2026 dentro); e a diferença de dias fora (56 contra 33) é em parte da própria conta, porque quem fez 60% dos minutos do time não podia ter ficado meio ano parado — ressalva que voltou para o o que vimos, colada no número, porque muda o que o leitor faz com ele. O gráfico é de barras, num corte só, e de propósito: barra parte do zero, e assim 7% e 7,5% aparecem do tamanho que são, quase iguais, em vez de virarem um vão largo numa régua ajustada aos dois valores. A comparação é entre minutagem baixa e alta na ponte de lesão, não entre faixas da tabela, e por isso não passa pelo corte de fronteira. Terceira passada: o PORQUÊ da ressalva dos dias fora voltou ao o que vimos. “Diferença que em parte é da própria conta”, sozinha, não diz a quem lê qual conta nem por quê; agora o texto visível diz o mecanismo — quem fez 60% dos minutos não ficou meio ano parado — e a ressalva volta a segurar o número, que é o que o para o Santa Cruz usa ao mandar perguntar ao clube. O preço foi o segundo “minutagem” da primeira frase (“348 de alta”, por elipse do “minutagem baixa” anterior); ficaram de pé o recorte, “jogador-temporadas”, “com ficha no Transfermarkt” e “registrada”, que são o escopo, e “em parte”, que é a palavra que segura a afirmação.",
   "n": "1.974 de minutagem baixa e 348 de minutagem alta, com ponte ao Transfermarkt (2022-2025)",
   "prova": "J01_numeros_novos.json, chaves les_alta_base, les_alta_n, les_alta_dias e les_dmin (o cálculo de poder da §6.7 aplicado a proporção, com o h de Cohen); recorte 2022-2025. A ponte de lesão liga dados/serieb_elencos.csv (colunas jogador, ano e id_jogador) a dados/serieb_lesoes.csv (colunas dias_2022 a dias_2025): 1.974 linhas de minutagem baixa e 348 de alta casam, 838 ficam sem ficha. Das 2.322 casadas, 43 casam só por nome e ano, sem o clube, e 5 delas têm ficha de lesão — o docstring do script promete nome, clube e ano, e o código casa só nome e ano.",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "barras",
    "titulo": "Jogador-temporadas com lesão registrada",
    "unidade": "%",
    "barras": [
     {
      "nome": "Minutagem baixa",
      "valor": 7.0
     },
     {
      "nome": "Minutagem alta",
      "valor": 7.5
     }
    ]
   }
  },
  {
   "id": "J02-2",
   "parte": "J02",
   "bloco": "J",
   "manchete": "Manter a base do ano anterior não aparece como vantagem de quem sobe",
   "o_que_vimos": "Entre os que subiram, quem já estava ficou com 27% dos minutos, contra 32,3% do meio; nos dois cortes a diferença cabe dentro do acaso. Caso a caso não há padrão: entre os 15 que subiram, de 13,9% a 70,1%. Não dá para dizer que a vantagem não existe, só que não apareceu.",
   "para_o_santa_cruz": "O que este número não pode dizer é se manter ajuda ou atrapalha: permanência de elenco depende de como foi o ano anterior, então ela vem contaminada pelo resultado e descreve em vez de orientar. Para 2027 a decisão de manter ou trocar continua aberta e tem de ser tomada jogador a jogador, pelo que cada um entrega — que é a pergunta de J05 e J06. O que dá para dizer é que o Santa Cruz não precisa temer a troca grande: ela é a norma da Série B, inclusive entre os que sobem.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Nenhuma premissa de dados/premissas.json é tocada. Derruba duas premissas internas do estudo: a da própria pergunta do J02 (“quem sobe mantém mais a base”) e a ressalva 2 de J02_indicadores.json, que dava a continuidade como livre da lista de consequência do resultado — pctFicou e novos estão nela, na constante CONSEQUENCIA de ranking_gaps.py, com o motivo escrito no próprio arquivo (“permanência de elenco depende de como foi o ano”).",
   "confianca": "indício",
   "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios. Correção para múltiplos testes: a continuidade não separa quem sobe do meio em corte nenhum, com selo “sem diferença clara” nos dois e o intervalo cruzando o zero nos dois sentidos. Porta temporal: não rodou e não é partível por turno, porque permanência de elenco só existe medida na temporada inteira. E o desenho é pequeno: a menor diferença que ele enxergaria é maior que a maior diferença já observada na família continuidade, então “não separa” aqui não vira “não existe”. A metade afirmativa da manchete antiga (“mantém menos”) não tem teste atrás em corte nenhum e caiu. n = 15 que subiram contra 48 do meio. Saiu do o que vimos e fica aqui: com 15 que subiram contra 48 do meio, e 7 contra 32 sem os times de fronteira, só uma vantagem grande apareceria — os dois cortes estão no gráfico. Saíram também do o que vimos, por espaço, os dois extremos caso a caso dessas 15 subidas: Remo 2025 com 13,9% e Criciúma 2023 com 70,1% — são caudas, e a mediana do grupo é 27%.",
   "n": "15 que subiram contra 48 do meio; sem os times de fronteira, 7 contra 32",
   "prova": "J02_testes.csv, familia continuidade: min_de_quem_ficou_pct em Sobe × Meio, com fronteira 27,017 contra 32,335 (d -0,328, q 0,32213) e sem fronteira 20,277 contra 31,218 (d -0,709, q 0,25284) — o cru e o efeito saem sempre da mesma linha, nunca de cortes trocados. Poder: a menor diferença detectável é d 0,84 com fronteira e 1,20 sem, contra um maior efeito observado de 0,709 na mesma família. Sobe × Trave da mesma medida, e do seu espelho min_de_contratado_pct, é firme só SEM os times de fronteira (20,277 contra 42,207, d -1,369, q 0,04002) e não com eles (d -0,708, q 0,09151); firme só num corte é suspeito e não é publicado, pela regra escrita em _metodo_fronteira.md.",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "dois_cortes",
    "titulo": "Minutos de quem já estava no clube",
    "unidade": "% dos minutos",
    "cortes": [
     {
      "rotulo": "com todos os times",
      "series": [
       {
        "nome": "Sobe",
        "valor": 27.0
       },
       {
        "nome": "Meio",
        "valor": 32.3
       }
      ]
     },
     {
      "rotulo": "sem os times de fronteira",
      "series": [
       {
        "nome": "Sobe",
        "valor": 20.3
       },
       {
        "nome": "Meio",
        "valor": 31.2
       }
      ]
     }
    ]
   }
  },
  {
   "id": "J03-1",
   "parte": "J03",
   "bloco": "J",
   "manchete": "Por setor, nenhum número técnico separa o titular de quem sobe do meio",
   "o_que_vimos": "Comparamos 723 titulares com 900 minutos ou mais em 12 números técnicos por setor. Nenhum dos 84 números separa os dois grupos nos dois recortes. Só contra a mesma posição exata sobra o lateral, um passe a mais em cada cem, e nada diz se vem antes do acesso ou depois.",
   "para_o_santa_cruz": "O perfil técnico individual não é o que separa quem subiu: em nenhum dos 7 setores apareceu vantagem grande, e o único candidato que resiste aos dois recortes — e só quando a conta é refeita contra jogadores da mesma posição exata — é o lateral acertar cerca de um passe a mais em cada cem, pequeno demais para virar filtro. J05 e J06 podem exigir minutagem alta e regular e o encaixe no modelo de jogo, mas não devem pedir superioridade técnica geral como requisito de acesso. O que este desenho não autoriza é a frase contrária: ele não veria diferença menor do que a que consegue enxergar, então “não separa” não vira “não existe”.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Sugere premissa nova: na Série B a diferença de quem sobe é coletiva, não individual — e o filtro individual que sobra de pé é a minutagem alta e regular da premissa m2, não um nível técnico superior. Não contradiz a m3 (titulares consolidados): rodagem comprovada continua valendo; o que cai é a ideia de que o titular de quem sobe tem números técnicos melhores.",
   "confianca": "indício",
   "confianca_motivo": "Indício porque não passa em nenhum dos dois critérios da §6. (a) Benjamini-Hochberg a 5% dentro da família (3 famílias de 4 indicadores em cada um dos 7 setores): das 84 linhas de J03_testes.csv só duas têm selo firme — Goleiro/“Duelos aéreos ganhos, %”, q 0,00121, e Meia/Faltas/90, q 0,00726. No recorte sem os times de fronteira (replicação registrada em _robustez_19_09.md, que reproduz o corte “com” em 84 linhas x 10 campos sem uma divergência) os firmes são três e são OUTROS, todos do gol: Duelos defensivos ganhos, Interceções ajust. à posse e Faltas/90, q 0,01525 nos três. Interseção zero — por isso o marcador “firmes = 2”, que é a contagem de um corte só, saiu do texto. Pela normalização declarada em J03_indicadores.json (“dentro da mesma posição e temporada”; o código agrupa por (ano, setor) na linha 97 de scripts/J03.py, enquanto o comentário da linha 93 diz posição) a interseção é 1: Lateral/“Passes certos, %”, q 0,04737 com os times de fronteira e 0,04857 sem, marginal nos dois — a mesma linha, normalizada por setor como o script publica, é “pode ser sorte” (q 0,18945). Em qualquer leitura a conclusão negativa não tem nenhum teste aprovado atrás dela. (b) Porta temporal da §6.4: não rodou (grep -ci 'turno' em scripts/J03.py = 0) e não roda nesta base — dados/serieb_tecnico.csv é fechado por temporada, sem jogo a jogo. Zero de dois = indício. Poder, que é o motivo que a frase tem de dizer: contando clube-temporada, a unidade da casa (§4.4 e §6.6), o menor efeito detectável vai de 0,82 a 1 no recorte cheio e de 1,14 a 1,46 sem os times de fronteira — “não separa” aqui é “este desenho não conseguiria ver” (§6.7). Etapa 8, o gráfico e o que saiu do texto: esta conclusão fica SEM gráfico, pelo mesmo motivo da A04-1, que também é negativa e também é indício. O único par de marcadores que sustentaria figura é o do lateral em “Passes certos, %” — 78,9 contra 77,8 com todos os times e 79,5 contra 78,1 sem os times de fronteira (lat_s, lat_m, lat_s_sem, lat_m_sem) —, e ele é justamente a exceção que esta conclusão diz não valer: só vira achado na normalização contra a mesma posição exata; na normalização que o script publica, por setor (linha 97 de scripts/J03.py), a mesma linha é “pode ser sorte”, q 0,18945. Desenhá-lo num dois_cortes daria o contrário do que a conclusão diz: desenhaDoisCortes (static/estudo_serieb_grafico.js) monta a escala só com os dados, mn/mx mais 35% de folga, então 1,1 ponto ocuparia mais de um terço da largura nos dois cortes e o leitor veria vantagem grande e estável exatamente onde o “para o Santa Cruz” diz “pequeno demais para virar filtro”. Os quatro valores continuam publicados em numeros e conferidos pela regra 1. Do texto vieram para cá o poder — o mínimo detectável acima —, que é por que o achado é fraco de propósito. Voltaram para o texto visível, dentro da régua de 280 caracteres, o filtro de amostra (900 minutos ou mais, que é o que a palavra “titular” quer dizer aqui) e o limite de leitura causal (nada diz se o número vem antes do acesso ou depois dele, porque a porta temporal não roda). Os n do corte sem fronteira — 456 titulares, 91 contra 365 — continuam publicados no campo n. TERCEIRA PASSADA da etapa 8, correção posterior ao segundo cético, e é a manchete que ela conserta. O encurtamento tinha deixado “Procuramos o número técnico que separa o titular de quem sobe e não achamos”: trocou o sujeito, que no HEAD era o TITULAR, pelo NÚMERO TÉCNICO, e jogou fora o escopo “posição por posição” que a manchete antiga carregava. Sem escopo sobrava um negativo sem recorte, e assim enunciado ele é desmentido pelo marcador que esta própria parte publica: firmes_dois_cortes = 1 — Lateral/“Passes certos, %”, q 0,04737 com os times de fronteira e 0,04857 sem, abaixo de 0,05 nos DOIS cortes pela normalização declarada em J03_indicadores.json (“dentro da mesma POSIÇÃO e TEMPORADA”). Existe, sim, um número técnico que separa nos dois recortes; ele é marginal e some quando a conta é feita por setor. A manchete volta, por isso, presa à normalização em que a negativa é verdadeira — “Por setor, nenhum número técnico separa o titular de quem sobe do meio”, 13 palavras, uma oração, sem dois-pontos e sem travessão. Por setor é como scripts/J03.py agrupa (linha 97) e como J03_testes.csv publica, e nessa normalização a mesma linha do lateral é “pode ser sorte”, q 0,18945, com interseção zero entre os dois cortes. O escopo tinha de voltar à manchete, e não bastava estar na linha seguinte, porque a manchete é o que viaja sozinho para o _registro.md e para a lista de partes: J05 e J06 leem o título antes do corpo, e o título brigava com o marcador acima e com a própria frase seguinte do o_que_vimos (“Só contra a mesma posição exata sobra o lateral”). O que a manchete continua sem caber dizer, e por isso fica dito aqui: no corte cheio, por setor, duas linhas têm selo firme — Goleiro/“Duelos aéreos ganhos, %”, q 0,00121, e Meia/Faltas/90, q 0,00726 —, nenhuma delas se reproduz sem os times de fronteira, e é essa não reprodução que o “nos dois recortes” do o_que_vimos carrega, uma linha abaixo do título. O o_que_vimos não foi tocado: ele já está em 268 dos 280 caracteres da régua e já carrega os três escopos que não podem sair — “por setor”, “dos 84 números” e “nos dois recortes” —, além do limite causal no fim. O poder continua aqui e não no texto visível, como manda a etapa 8.3.",
   "n": "723 titulares — 179 de quem sobe contra 544 do meio — em 7 setores, 2022–2025; sem os times colados na linha de acesso, 456 titulares (91 contra 365)",
   "prova": "J03_testes.csv; J03_resumo.json; J03_numeros_novos.json; _robustez_19_09.md; _metodo_fronteira.md",
   "status": "validada",
   "negativa": true,
   "grafico": null
  },
  {
   "id": "J03-2",
   "parte": "J03",
   "bloco": "J",
   "manchete": "O duelo defensivo separa no time e o estudo não o acha numa posição",
   "o_que_vimos": "No time, quem sobe ganha 0,98 ponto percentual a mais de duelo que o meio. No volante a diferença é maior, 59,87% contra 58,06%, e ainda assim o estudo não tem tamanho para confirmá-la. No gol, e só sem os times de fronteira, o goleiro de quem sobe ganha menos.",
   "para_o_santa_cruz": "Não transforme duelo defensivo em requisito de contratação por posição: a vantagem que aparece é do time, cerca de um ponto percentual por jogo, e nenhuma posição isolada mostra vantagem grande o bastante para virar filtro. Isso não prova que a vantagem venha de treino ou de organização — nada disso foi medido; prova só que ela não está localizada num contratado que J06 possa apontar. E o teste que pergunta se o duelo vem antes do resultado responde que não: o duelo do 1º turno não antecipa os pontos do 2º depois de descontar como o time já vinha pontuando.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Não trata de nenhuma premissa de dados/premissas.json.",
   "confianca": "indício",
   "confianca_motivo": "Indício porque, no nível que esta parte mede — o titular —, não passa em nenhum dos dois critérios. (a) Benjamini-Hochberg a 5%: nenhuma das 7 linhas de “Duelos defensivos ganhos, %” de J03_testes.csv passa, e os menores q são Extremo 0,16753 e Volante 0,16864, os dois no selo “pode ser sorte”. No recorte sem os times de fronteira só o gol passa (q 0,01525), com o sinal INVERTIDO, sobre uma mediana degenerada (0,0 contra 50,0) e sem poder — pela regra 4 de _metodo_fronteira.md isso é suspeito, não promovido. A única perna que passa nos dois cortes é a do TIME, e ela é do A06, não do J03: A06_testes.csv, duelos_def_pct SM, q 0,02556 com fronteira (16x48) e q 6e-05 sem (8x32), este último com poder suficiente — o corte calado FAVORECE a perna do time. (b) Porta temporal da §6.4: aqui ela rodou e REPROVOU para esse mesmo indicador — ρ +0,121 (p 0,2858) e parcial +0,092 (p 0,4160), _porta_temporal.md §6. Zero de dois no nível do jogador, que é o nível desta conclusão; a perna do time é importada e carrega o “provável” que pertence à A06-1. Saiu da prosa o “cerca de dois pontos percentuais”, que era a quantidade do corte reduzido (1,79 ponto) colada ao número do corte cheio; o número de tela continua sendo o do recorte cheio, como manda _metodo_fronteira.md. Etapa 8, o gráfico e o que saiu do texto: o gráfico desta conclusão é de grupos, “Duelo defensivo ganho · o time (medido na A06), o volante e a zaga”, na mesma régua e no corte cheio, porque é ele que mostra o que ESTA conclusão mediu — o nulo posição por posição, com os pares Sobe/Meio praticamente colados no volante (59,87 contra 58,06) e na zaga (67,06 contra 66,67), e com a diferença do time pequena ao lado do degrau entre posições. O dois_cortes que estava aqui antes desenhava SÓ a perna do time, e essa perna não é do J03: 60,77 contra 59,78 com todos os times e 61,7 contra 59,9 sem os times de fronteira saem de A06_testes.csv, duelos_def_pct SM, cortes com e sem fronteira. Dar a figura inteira à perna importada fazia o leitor atribuir ao J03, que está em indício, um achado do A06 que é “provável” — e a escala automática do dois_cortes (mn/mx mais 35% de folga) ainda transformava 0,99 e 1,8 ponto em vantagem grande e crescente. Por isso o título nomeia a origem. O preço da escolha, dito aqui: a unidade de observação difere dentro do mesmo desenho — o ponto do time é clube-temporada (16 contra 48), os das posições são jogador-temporada —, e os quatro valores do corte sem fronteira do time continuam publicados em numeros (dd_time_s_sem, dd_time_m_sem), conferidos pela regra 1, só que agora citados aqui e não desenhados. O “ao contrário” do gol voltou para o o_que_vimos COM o corte que o condiciona e com a direção (sem os times de fronteira o goleiro de quem sobe ganha MENOS), porque sem essas duas travas a frase virava motivo para desclassificar goleiro por duelo defensivo — exatamente o que a regra 4 de _metodo_fronteira.md proíbe, já que o achado é q 0,01525 sobre mediana degenerada (0,0 contra 50,0) e sem poder. Ele está publicado inteiro na J03-3, que é a conclusão do gol. Voltou também para a manchete o “não numa posição”, que é a metade acionável que amarra o achado ao J06, e o verbo medido “aparece na conta do time”, porque “é do time” atribuía o fenômeno ao coletivo, e o “para o Santa Cruz” diz o contrário: nada de treino ou organização foi medido. CORREÇÃO da etapa 8, posterior à conferência do cético: o gráfico desta conclusão passou a ser SÓ das posições — “Duelo defensivo ganho por posição · volante e zaga, nenhuma diferença firme”, com as quatro séries dd_vol_s, dd_vol_m, dd_zag_s e dd_zag_m —, e as duas séries do time saíram do desenho. Com isso a descrição escrita acima, “os pares Sobe/Meio praticamente colados no volante” e “a diferença do time pequena ao lado do degrau entre posições”, está ERRADA e fica substituída por esta: a geometria do renderizador a desmente. desenhaGrupos (static/estudo_serieb_grafico.js, linhas 96-104) monta a escala só com os dados — mn/mx mais 35% de folga — e desenha a barra a partir de mn, não do zero; com as seis séries as barras saíam em 38,3% e 31,8% da largura (time), 32,4% e 20,6% (volante) e 79,4% e 76,8% (zaga), de modo que o par do volante era o que MAIS abria, 11,8 pontos de largura contra 6,5 do time, e a barra Sobe do volante ficava 57% mais comprida que a Meio contra 20% no time. Era o contrário do que a conclusão afirma, e sem selo atrás: Volante/“Duelos defensivos ganhos, %” tem q 0,16864, selo “pode ser sorte”, 22 contra 59, enquanto a única perna selada é a do TIME, que é do A06 (A06_testes.csv, duelos_def_pct SM, q 0,02556 com fronteira e 6e-05 sem) — e o renderizador não sabe desenhar selo, então o leitor via só o degrau cru. É o mesmo defeito que esta parte reconheceu ao NEGAR gráfico à J03-1, e ele tinha sido cometido aqui. Tirar as duas séries do time mata de uma vez o degrau falso e a mistura de unidades dentro do mesmo eixo — o ponto do time é clube-temporada (16 contra 48) e os das posições são jogador-temporada (22 contra 59 no volante, 32 contra 96 na zaga) —, e agora todas as pernas desenhadas são nulas, sem selo que o desenho possa esconder. A perna do time continua citada no o_que_vimos e publicada em numeros (dd_time_s, dd_time_m, dd_time_s_sem, dd_time_m_sem), conferida pela regra 1: ela é do A06 e é lá que deve ser desenhada. Voltou também ao texto visível a cláusula que trava a leitura errada, “nem no volante, que é a maior e não se distingue da conta do time”, que o encurtamento tinha jogado fora deixando só o “para o Santa Cruz” embaixo de uma figura que dizia o contrário; sem ela o leitor de J06 sairia apontando o volante por duelo defensivo, a ação que o “para o Santa Cruz” proíbe em letras maiúsculas. O que este conserto NÃO resolve, e fica registrado para o dono: a escala continua automática e é fixada pela zaga, então mesmo só com as posições o par do volante ocupa 11,8 pontos de largura contra 2,6 da zaga — o desenho mostra o volante como a maior das diferenças, que é o que a frase visível agora diz, mas dá a 1,81 ponto percentual sem selo mais espaço do que ele merece. Fechar isso exige eixo a partir do zero ou marca de selo no renderizador, que é mudança de static/estudo_serieb_grafico.js, fora desta etapa. CORREÇÃO DE 20/09, a pedido do dono, e ela muda a leitura: o texto dizia que “posição por posição não sobra nada”, o que é a armadilha de “não separa” sem poder que o catálogo do CLAUDE.md lista. O volante tem a MAIOR diferença bruta da parte — 59,87% contra 58,06%, 1,81 ponto, contra os 0,98 do time — e passa no p bruto (0,04216). O que o derruba é a correção para múltiplos testes (q 0,16864, selo “pode ser sorte”) e o poder: com 22 contra 59 jogadores o desenho só enxergaria d de 0,71 para cima, e o observado é 0,535. O time detecta menos diferença porque o d divide pela dispersão, e entre 64 clube-temporadas ela é muito menor que entre 81 jogadores. Some-se que a conta do time usa TODOS os duelos de TODOS os jogadores, e a conta por posição só os titulares: o coletivo inclui gente que o recorte por posição não vê.",
   "n": "no time, 16 temporadas de quem sobe contra 48 do meio (8 contra 32 sem os times colados na linha); no jogador, 723 titulares em 7 setores (456 sem esses times)",
   "prova": "J03_testes.csv; A06_testes.csv; _porta_temporal.md; _robustez_19_09.md; J03_numeros_novos.json",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "grupos",
    "titulo": "Duelo defensivo ganho por posição",
    "unidade": "% dos duelos, entre os titulares",
    "series": [
     {
      "nome": "Sobe · volante",
      "valor": 59.87
     },
     {
      "nome": "Meio · volante",
      "valor": 58.06
     },
     {
      "nome": "Sobe · zaga",
      "valor": 67.065
     },
     {
      "nome": "Meio · zaga",
      "valor": 66.67
     }
    ]
   }
  },
  {
   "id": "J03-3",
   "parte": "J03",
   "bloco": "J",
   "manchete": "O goleiro de quem sobe ganha a mesma bola alta que o do meio",
   "o_que_vimos": "Em porcentagem o goleiro de quem sobe aparece com 97,9% de bola alta ganha contra 87,9% do meio. Em bola ganha os dois empatam, 14,6 contra 14,5 por temporada. A diferença inteira é perder 0,5 contra 2 bolas altas no ano.",
   "para_o_santa_cruz": "Este estudo não dá motivo técnico para pagar mais pelo goleiro: a única medida que apontava para lá é uma porcentagem sobre pouquíssimas bolas, ela some no recorte de controle e o mesmo recorte mostra o goleiro de quem sobe cortando menos bola. Não é o contrário — não estamos dizendo para economizar no gol; estamos dizendo que o J03 não mediu o que um goleiro faz: dos 12 números que medimos no gol, 7 são zero para quase todo goleiro. Antes de J05 fechar o perfil do gol, faltam testar defesas, gol sofrido contra o esperado, jogo sem sofrer e bola alta em número, que a base tem em dados/serieb_tecnico.csv e esta parte não usou.",
   "premissa": "m4",
   "premissa_titulo": "Goleiro top — investir",
   "premissa_grupo": "Montagem do elenco",
   "premissa_motivo": "Toca a premissa m4, “Goleiro top — investir”. Não a contradiz: retira o único apoio medido que o J03 dava a ela e a devolve ao estado de premissa do dono, sem prova a favor nem contra. Tem de conversar com a A04-1, que mede o MESMO duelo aéreo no nível do time e fecha com “altura e duelo aéreo não entram como requisito de acesso”: hoje as duas partes publicam instruções opostas sobre a mesma coluna do Wyscout e J05/J06 recebem as duas. Com a inversão a costura fica simples — o duelo aéreo não é requisito de acesso em posição nenhuma, inclusive no gol.",
   "confianca": "indício",
   "confianca_motivo": "Indício: zero de dois critérios. (a) Benjamini-Hochberg a 5% dentro da família: passa com folga no recorte cheio — J03_testes.csv, Goleiro/“Duelos aéreos ganhos, %”, q 0,00121 na família de 4, e 0,0252 mesmo pondo os 84 testes numa família só —, mas NÃO se reproduz sem os times de fronteira: 8 contra 32, q 0,09629, selo “sem diferença clara”, intervalo por clube cruzando o zero ([-0,06; 1,52]) e mínimo detectável 1,14 contra um efeito de 0,679, ou seja, poder insuficiente. Pelo item 3 de _metodo_fronteira.md, e pelo CLAUDE.md, o que só aparece COM esses times é ruído, então (a) não se sustenta. (b) Porta temporal da §6.4: não rodou e não roda nesta base, porque dados/serieb_tecnico.csv é fechado por temporada. E há o outro lado, que o nível tem de refletir: no recorte sem fronteira os três firmes de toda a tabela são do gol e dois apontam contra quem sobe — Interceções ajust. à posse d -1,348, q 0,01525, o único firme com poder suficiente desse corte, e Duelos defensivos ganhos d -0,906, este sobre mediana degenerada. Pela regra 4 do mesmo arquivo, firme num corte só é suspeito e não promovido: vale como indício, e a frase diz de que corte saiu, publicando o valor do corte cheio (1,7 contra 2,1) ao lado. O achado do meia em faltas saiu do texto porque cai no mesmo teste — q 0,00726 no cheio e 0,22264 sem os times de fronteira. Etapa 8, o gráfico e o que saiu do texto: o gráfico desta conclusão é o de barras “Bola alta do goleiro por temporada · o selo cai no corte de controle”, por marcador (gk_ganhos_s, gk_ganhos_m, gk_perd_s, gk_perd_m) — ganhas 14,6 contra 14,5 e perdidas 0,5 contra 2 —, porque é ele que mostra a manchete: a porcentagem alta é o resultado de um denominador minúsculo, não de um goleiro melhor. As barras se chamam “Sobe · ganha”, “Meio · ganha”, “Sobe · perde” e “Meio · perde” porque corDe() pinta pelo nome da série e põe as duas de Sobe em azul e as duas de Meio em laranja: a cor codifica a faixa, não o par ganha/perde, e o ponto separa os dois pares para o olho. NÃO há gráfico dois_cortes aqui, e isso é uma exceção consciente à §8.2 do PLANO.md, que manda dois_cortes sempre que a conclusão depender do corte de fronteira — esta depende, e é a que mais depende da parte. O motivo da exceção: o dois_cortes desenharia 97,9 contra 87,9 ao lado de 97,9 contra 88,6, isto é uma vantagem grande e ESTÁVEL nos dois cortes, exatamente onde a conclusão diz que não há nenhuma; o que morre no corte sem fronteira é o selo (q 0,00121 vira 0,09629, intervalo por clube cruzando o zero), não o número, e o renderizador não sabe desenhar selo. Quem obedecesse à letra da regra produziria aqui o mesmo defeito que ela existe para evitar. A escolha precisa do aval do dono; até lá a fragilidade do corte está dita em dois lugares visíveis, no título do gráfico e no “para o Santa Cruz”, e não só neste tooltip. Essa ressalva do corte continua escrita no “para o Santa Cruz”, que é texto visível. Saiu também do texto a terceira frase, sobre a interceção: no corte sem os times de fronteira o goleiro de quem sobe faz 1,4 por jogo contra 2,1 do meio, e com todos os times a conta já ia na mesma direção, 1,7 contra 2,1 — é o firme do outro lado descrito acima, e continua no “para o Santa Cruz”.",
   "n": "16 goleiros de quem sobe contra 48 do meio no recorte cheio; 8 contra 32 sem os times colados na linha de acesso",
   "prova": "J03_testes.csv; J03_resumo.json; _robustez_19_09.md; _metodo_fronteira.md; J03_numeros_novos.json",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "barras",
    "titulo": "Bola alta do goleiro por temporada · o selo cai no corte de controle",
    "unidade": "bolas",
    "barras": [
     {
      "nome": "Sobe · ganha",
      "valor": 14.6
     },
     {
      "nome": "Meio · ganha",
      "valor": 14.5
     },
     {
      "nome": "Sobe · perde",
      "valor": 0.5
     },
     {
      "nome": "Meio · perde",
      "valor": 2.0
     }
    ]
   }
  },
  {
   "id": "J04-1",
   "parte": "J04",
   "bloco": "J",
   "manchete": "Não achamos medida de corrida que separe o titular de quem sobe",
   "o_que_vimos": "Comparei 697 titulares de 2022 a 2025 em 17 medidas de corrida, nas 6 posições de linha. Nenhuma das 204 comparações entre quem sobe e o meio sobrevive aos dois cortes. Não achar diferença não é achar que são iguais: com tão poucos por posição, só uma vantagem grande apareceria.",
   "para_o_santa_cruz": "Requisito físico não é filtro de acesso: montar o elenco pela corrida não aproxima o clube do G4. O físico entra em J05 como exigência da posição — lateral tem de correr como lateral — e nunca como sinal de quem sobe; é a segunda vez que isto aparece, porque A07-1 já dizia o mesmo no clube. O que este desenho não autoriza é a frase contrária: ele não veria uma vantagem menor do que a que consegue enxergar, então quem quiser cravar “o físico não importa” precisa de mais titulares por posição, não deste estudo.",
   "premissa": "m1",
   "premissa_titulo": "Time físico",
   "premissa_grupo": "Montagem do elenco",
   "premissa_motivo": "Ajusta m1 (Time físico) sem derrubá-la: a intensidade continua valendo como exigência da posição e como régua para comparar candidatos, mas não é critério de acesso. O ajuste vai com a ressalva de tamanho — este desenho só enxergaria uma vantagem grande —, e por isso entra como indício, não como fato assentado.",
   "confianca": "indício",
   "confianca_motivo": "(a) Correção para múltiplos testes a 5% dentro da família: NÃO passa. Dos 204 testes Sobe × Meio da subamostra `todos` em J04_testes.csv, 5 passam no BH (3 na zaga, 2 no volante) e ZERO passam nos dois cortes de fronteira — a coluna passou_bh_nos_dois_cortes é False nas 850 linhas do arquivo. E esses 5 só existem porque a família foi partida por setor: pela §6.3 literal (família = pilar × comparação), que é o que vale onde diverge, são 0 de 204, e num BH único sobre os 204 também 0. (b) Porta temporal da §6.4: NÃO rodou e não roda — physical_match tem zero linha em 2022, 2023 e 2024, sobra 2025 sozinha (20 clube-temporadas, 4 acessos) e 7 dos 17 indicadores não existem jogo a jogo em temporada nenhuma. Zero de dois = indício. É a mesma conta que o espelho técnico J03-1 já fez, e J04-1 é literalmente a mesma conclusão no físico. O “provável” publicado até 19/09 não veio de nenhum dos dois critérios: veio de um teto declarado antes de rodar (J04_indicadores.json, chave porta_temporal) — e teto é limite máximo, não piso. ESCOPO DO ARGUMENTO DE PODER (corrigido em 19/09): o desenho enxerga a partir de d 0,63 a 1,14, conforme a posição e o corte. A frase de poder vale nos 204 testes do recorte cheio, onde os 199 que não passaram mediram todos um efeito menor que o mínimo da sua própria posição; ela era lida como global e não é. Refeita sobre os 554 testes Sobe × Meio que não passaram nas três subamostras, existe 1 exceção (Zaga, metros por minuto COM a bola, sem os times de fronteira e sem as linhas de identidade marcada, |d| 0,986 contra um mínimo de 0,95) e o maior |d| ali é 0,986, não o 0,69 que a frase antiga citava. Uma exceção em 554 é o esperado por acaso e é o mesmo achado da zaga de que trata J04-2, então a leitura não vira do avesso — mas o escopo tinha de ser dito. TEXTO ENXUGADO EM 20/09 (etapa 8): para caber na régua de 280 caracteres, saíram do que vimos os exemplos crus e a conta de tamanho, e ficam registrados aqui. O volante de quem subiu corre 10.031 metros por jogo contra 10.034 do meio, e a ponta dá 12,0 sprints por jogo contra 11,8 — esse par do volante é o do corte COM todos os times. Com 8 a 28 titulares de quem sobe em cada posição, conforme o corte, só uma diferença do tamanho da que aparece na zaga (8.509 contra 8.908 metros por jogo) teria chance de aparecer — é por isso que “não achamos” aqui não é “é igual”. ESTA CONCLUSÃO FICA SEM GRÁFICO (corrigido em 20/09): ela depende inteiramente do corte de fronteira, e a §8.2 do PLANO.md pede dois_cortes nesse caso, mas o par do corte sem fronteira não existe em J04_numeros.json — no volante ele é 10.115,69 contra 9.990,61 metros por jogo (J04_testes.csv: todos, Volante, SM, sem, distance_p90; d +0,225, q 0,59), com o sinal invertido em relação ao empate do corte cheio. Um gráfico de um corte só mostrava o corte em que o volante empata e escondia aquele em que ele aparece à frente, que é exatamente a leitura que esta conclusão existe para negar; e a escala da forma `grupos` desenhava 3 metros em 10.031 (d −0,10, q 0,74) como meia tela. Volta a ter gráfico no dia em que o script emitir o par do corte sem fronteira. ESCOPO DEVOLVIDO EM 20/09 (3ª passada da etapa 8): o encurtamento tinha trocado “nas 6 posições de linha” por “nas 6 posições”. As seis são Zaga, Lateral, Volante, Meia, Extremo e Atacante (coluna setor de J04_testes.csv) — goleiro nunca entrou no desenho, e sem a palavra “linha” o para_o_santa_cruz, que fala de montar o elenco pela corrida, se estendia a uma posição que este estudo não testou. O “de linha” voltou ao que vimos, e “recortes” virou “cortes” para pagar os nove caracteres dentro da régua de 280.",
   "n": "697 titulares com físico, de 907 no recorte 2022–2025; de 8 a 28 de quem sobe em cada posição, conforme o corte",
   "prova": "J04.md; J04_testes.csv; J04_resumo.json (nao_separa_nao_e_nao_existe); _robustez_19_09.json",
   "status": "validada",
   "negativa": true,
   "grafico": null
  },
  {
   "id": "J04-2",
   "parte": "J04",
   "bloco": "J",
   "manchete": "Cada um dos dois sinais físicos que sobraram existe num recorte só",
   "o_que_vimos": "O volante de quem sobe alcança 27,9 km/h de pico contra 27,5 do meio, e só com os times colados na linha do acesso na conta. Na zaga o sinal é o contrário: aparece justamente quando esses times saem. Nenhum dos dois resiste à troca de recorte.",
   "para_o_santa_cruz": "Nenhum dos dois vira requisito de contratação: não compre volante por velocidade de pico achando que é isso que leva ao acesso, e não leia “zagueiro que corre menos” como virtude. O zagueiro de quem CAI também corre menos que o do meio, nos dois recortes (8.736 contra 8.890 metros por jogo com todos os times, 8.769 contra 8.908 sem os colados na linha): correr menos na zaga marca as duas pontas da tabela, não o acesso. As duas observações vão para J05 como contexto de posição, nunca como filtro de perfil.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Nenhuma premissa própria. Encosta em m1 (Time físico) por tabela: os dois únicos candidatos a sinal físico individual não sobrevivem à troca de recorte, o que reforça o ajuste que J04-1 faz em m1.",
   "confianca": "indício",
   "confianca_motivo": "(a) Correção para múltiplos testes a 5% dentro da família: cada um passa em um corte só, e em cortes opostos. A velocidade máxima do volante passa COM a fronteira (21 contra 50, q 0,023) e some sem ela (d +0,20, q 0,55) — “só COM” é a definição de ruído do CLAUDE.md e o item 3 do _metodo_fronteira.md: descartar. O volume da zaga passa SEM a fronteira (13 contra 54, d -0,85, q 0,034) e some com ela (q 0,26) — “só SEM” é o item 4 da regra corrigida: suspeito, vale no máximo como indício, e a frase tem de dizer que depende do corte. Pela §6.3 literal nenhum dos dois passa em corte nenhum (0 de 204). (b) Porta temporal da §6.4: não roda em J04, por falta de físico por jogo em 2022–2024. Zero de dois = indício, que é o piso da régua: o nível não tem para onde cair, e por isso o que muda aqui é o texto, não o selo. AS DUAS CONFERÊNCIAS, NOS DOIS ACHADOS (corrigido em 19/09): no volante o texto já fazia a conta — cobertura derruba (d +0,15, q 0,71) e identidade sustenta (d +0,66, q 0,013) —, e na zaga ela faltava. Sem as linhas de identidade marcada o achado da zaga NÃO some: fica mais forte, d −0,876 contra os -0,85 do corte base, q 0,053 (a um fio do BH), 11 contra 51. Quem o derruba é a cobertura: sem os clubes com menos de 80% dos minutos rastreados o zagueiro de quem sobe vai de 8.509 a 8.839 metros por jogo e a diferença para o meio cai de cerca de 400 para cerca de 80 metros (d −0,636, q 0,27, 9 contra 43). Uma derruba e a outra sustenta: as conferências discordam e nenhuma decide, que é a mesma leitura do volante. E cai a frase “distance_p90 e m_per_min são a mesma medida, é um achado de volume, não dois”: são TRÊS indicadores no mesmo corte. distance_p90 e m_per_min são de fato a mesma medida (rho 1,000 nos titulares com físico), mas m_per_min_tip — metros por minuto COM a bola — é outra normalização (rho 0,87 com distance_p90 dentro da zaga), é o mais forte dos três (114,05 contra 122,28 metros por minuto de posse, d −0,936 no corte base) e é o único teste das 850 linhas do arquivo que, fora do corte base, mede um efeito maior que o mínimo do seu próprio desenho (|d| 0,986 contra 0,95, poder_suficiente = True, na subamostra sem identidade marcada). O selo continua indício — a regra da fronteira já trava tudo aí —, mas o texto para de sugerir que a robustez desmontou a zaga por dois caminhos quando só um a desmonta. TEXTO ENXUGADO EM 20/09 (etapa 8): os valores crus saíram do que vimos para caber em 280 caracteres e ficam aqui, nenhum perdido. Volante, velocidade de pico: 27,9 contra 27,5 km/h com a fronteira e 27,8 contra 27,6 sem ela; sem os clubes de cobertura baixa, 27,6 contra 27,5; sem as linhas de identidade marcada, 27,9 contra 27,4. Zaga, metros por jogo: 8.747 contra 8.890 com a fronteira e 8.509 contra 8.908 sem ela; 8.839 contra 8.918 sem os clubes de cobertura baixa e 8.509 contra 8.898 sem as linhas de identidade marcada. Os dois cortes da zaga são o gráfico desta conclusão, que é onde a fragilidade fica visível sem depender do texto.",
   "n": "volante: 21 contra 50 (quem sobe contra o meio); zaga: 13 contra 54 — 11 contra 51 sem as linhas de identidade marcada e 9 contra 43 sem os clubes de cobertura baixa",
   "prova": "J04_testes.csv; J04_resumo.json (achados_sobe_x_meio); _metodo_fronteira.md; _robustez_19_09.json",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "dois_cortes",
    "titulo": "Zagueiro, distância por jogo",
    "unidade": "metros",
    "cortes": [
     {
      "rotulo": "com todos os times",
      "series": [
       {
        "nome": "Sobe",
        "valor": 8747
       },
       {
        "nome": "Meio",
        "valor": 8890
       }
      ]
     },
     {
      "rotulo": "sem os times de fronteira",
      "series": [
       {
        "nome": "Sobe",
        "valor": 8509
       },
       {
        "nome": "Meio",
        "valor": 8908
       }
      ]
     }
    ]
   }
  },
  {
   "id": "J05-2",
   "parte": "J05",
   "bloco": "J",
   "manchete": "Metade do perfil físico que o app já usa não sobrevive à correção",
   "o_que_vimos": "Dos 18 números do perfil físico por setor que a tela mostra hoje, 9 passam na conta que corrige os muitos testes. Na zaga e no lateral não passa nenhum dos 4. E esse perfil compara quem sobe com quem cai, nunca com o meio.",
   "para_o_santa_cruz": "O perfil físico por setor que a tela mostra hoje descreve quem subiu contra quem caiu, e não pode virar filtro de acesso. Na zaga e no lateral ele descansa em 4 números que a correção derruba, então ali a ficha entra com ressalva escrita e o peso da nota física cai. Nas outras posições ele continua servindo para descartar quem está longe do padrão de corrida da posição, que é o que o dado físico sabe fazer.",
   "premissa": "m1",
   "premissa_titulo": "Time físico",
   "premissa_grupo": "Montagem do elenco",
   "premissa_motivo": "Ajusta. A intensidade continua critério de escolha dentro da posição, mas não é sinal de acesso: não separa quem sobe do meio e, nesta base de titulares, também não separa quem sobe de quem cai.",
   "confianca": "indício",
   "confianca_motivo": "(a) A conta é do próprio app, relida: em etapa_13.criterio_por_setor o critério de entrada é `p_clube < 0,05` — o p cru do teste corrigido por clube da §4.4 —, e dos 18 indicadores escolhidos só 9 têm `bh_clube` verdadeiro em sobecai_corrigido_por_clube (zaga 0 de 1, lateral 0 de 3, meio 3 de 6, ataque 6 de 8; os q_clube de cada um estão em J05_resumo.json). (b) Rodando os MESMOS indicadores na base de titulares de 2022–2025: Sobe × Cai dá 0 de 18 no BH e Sobe × Meio dá 0 de 32; o maior efeito observado em Sobe × Cai é 0,67, abaixo do menor d detectável deste desenho (0,71 a 1,19 nas linhas de Sobe × Cai). Isto NÃO é replicação do teste do app: ele compara 56 contra 75 atletas rastreados por setor, e aqui a unidade é o titular, 1 ou 2 por clube. (c) Os dois cortes de fronteira, os dois relatados: sem os times de fronteira mudam de lado ou de selo: Tempo até atingir o sprint (s) no Lateral (SC, d 0,20 contra -0,04); Passes certos, % no Meia (SC, d -0,01 contra 0,06); Duelos aéreos ganhos, % no Volante (SC, d 0,13 contra -0,09); Dribles com sucesso, % no Zaga (SC, d -0,25 contra 0,09); Dribles com sucesso, % no Atacante (SM, d -0,06 contra 0,15); Duelos defensivos ganhos, % no Atacante (SM, d -0,03 contra 0,01); Passes progressivos/90 no Atacante (SM, d 0,00 contra -0,03); Tempo para girar 90 graus (s) no Atacante (SM, d 0,12 contra -0,17); Arrancadas explosivas até o sprint por 90 min no Extremo (SM, d 0,24 contra -0,10); Tempo até a alta velocidade depois de mudar de direção (s) no Extremo (SM, d 0,19 contra -0,27); Dribles com sucesso, % no Goleiro (SM, d -0,20 contra 0,02); Duelos aéreos ganhos, % no Goleiro (SM, d 1,06 contra 0,68); Duelos aéreos ganhos, % no Lateral (SM, d -0,21 contra 0,05); Duelos defensivos ganhos, % no Lateral (SM, d -0,11 contra 0,26); Arrancadas explosivas até o sprint por 90 min no Lateral (SM, d 0,06 contra -0,04); Duelos aéreos ganhos, % no Meia (SM, d -0,26 contra 0,03); Toques na área/90 no Meia (SM, d 0,12 contra -0,02); Sprints por 90 min no Meia (SM, d 0,01 contra -0,06); Dribles com sucesso, % no Volante (SM, d 0,12 contra -0,28); Duelos aéreos ganhos, % no Volante (SM, d 0,07 contra -0,20); Dribles com sucesso, % no Zaga (SM, d -0,11 contra 0,21). (d) Porta temporal: não roda, mesmo motivo de J04. (e) O corte de fronteira derrubou 20 testes por falta de n, e eles saíram dos DOIS lados para que a tabela comparasse a mesma coisa nos dois cortes. (f) “Passar na conta que corrige os muitos testes”, no que vimos e no gráfico, é o critério da alínea (a) e nada além dele: ter `bh_clube` verdadeiro, isto é passar na correção para múltiplos testes a 5% dentro da família da §6.3. Não quer dizer que o número seja falso, e sim que este desenho não o separa do acaso depois de contar quantos testes foram feitos. O gráfico não parte por setor, e a razão é de leitura: os quatro setores têm denominadores diferentes (zaga 1, lateral 3, meio 6, ataque 8), o renderizador não tem barra agrupada, e quatro barras só com o numerador fariam ataque 6 parecer o dobro de meio 3 quando é 6 de 8 contra 3 de 6. As duas barras publicadas dividem o mesmo denominador — 18 indicadores escolhidos, 9 que passam —, e os quatro pares por setor ficam escritos na alínea (a) acima e em J05_resumo.json.",
   "n": "18 indicadores do perfil do app sobre 138 testes de sobe × cai por setor; 32 testes físicos Sobe × Meio e 18 Sobe × Cai nesta parte",
   "prova": "J05.md; J05_resumo.json; J05_testes.csv; prototipo.json",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "barras",
    "titulo": "Os números do perfil físico do app, antes e depois da correção",
    "unidade": "números",
    "barras": [
     {
      "nome": "O app escolheu",
      "valor": 18
     },
     {
      "nome": "Passam na correção",
      "valor": 9
     }
    ]
   }
  },
  {
   "id": "J06-1",
   "parte": "J06",
   "bloco": "J",
   "manchete": "Nenhum nome sai desta parte por falha da ficha",
   "o_que_vimos": "Dos 297 que chegaram a um clube da Série B, a ficha aprovaria 17. Esses 17 jogaram menos no primeiro ano que os 280 reprovados, e esta conferência não tinha tamanho para confirmar nem isso.",
   "para_o_santa_cruz": "Não contrate por esta ficha. Ela descreve como era o titular de quem subiu e serve para descartar quem está muito longe disso, mas não ordena candidatos: conferida contra o que aconteceu de verdade com 297 chegadas a clubes da Série B, ela aponta para o lado errado. Some-se a isto que exigir as 4 a 6 linhas da posição ao mesmo tempo esvazia o mercado: no elenco de hoje da Série B, 2 de 44 jogadores livres e rodados passam nas três notas juntas. A conta de contratação continua sendo a do olheiro, com a ficha ao lado como conversa, e o que o estudo entrega de útil aqui é a contagem da oferta, não a lista.",
   "premissa": "p20",
   "premissa_titulo": "Índice físico",
   "premissa_grupo": "Físico",
   "premissa_motivo": "Contradiz. A p20 supõe que dá para ordenar candidato por um índice geral; a §8.2 já proibia somar as três notas num número único, e agora o backtest da §8.6 mostra que nem a conjunção delas ordena. A mesma conferência no score da própria aba (etapa_13.backtest) deu o mesmo resultado: 209 recomendados com 1188,3 minutos contra 1220,3 de 208 reprovados.",
   "confianca": "indício",
   "confianca_motivo": "(a) A régua que autorizava publicar nome estava declarada ANTES de rodar, em J06_indicadores.json, chave regra_que_autoriza_publicar_nomes: d > 0 e q < 0,05 na família perfil_completo × minutos, com todos os setores juntos, nos DOIS cortes de fronteira. Ela não foi cumprida. (b) O teste primário nem chegou a entrar na tabela: o perfil inteiro aprova 17 das 297 chegadas e só 7 sem os clubes de fronteira, abaixo do piso declarado de 8 por lado. (c) Rodado à parte só no corte com fronteira — diagnóstico que não entra no BH nem no veredito —, o resultado é d -0,22 com p 0,46: aponta contra a ficha e não se distingue de zero. (d) Poder: o menor d que esse desenho enxergaria a 80% é 0,7, então 'não separa' aqui quer dizer também 'este desenho não conseguiria ver'. (e) Os blocos rodaram separados, como manda a §8.2, e nenhum dos três passa: físico d 0,07 (q 0,89), duelo/corpo d 0,06 (q 0,9), estilo técnico d -0,06 (q 0,79). (f) Os dois cortes, os dois relatados, com 7 pares discordantes: duelo_corpo|minutos em Todos: d 0.058 no corte com e -0.106 no corte sem (q 0.8964 e 0.92151); estilo_tecnico|minutos em Meia: d -0.589 no corte com e -0.934 no corte sem (q 0.10958 e 0.04689); estilo_tecnico|permanencia em Atacante: d 0.205 no corte com e -0.06 no corte sem (q 0.87062 e 0.88964); estilo_tecnico|permanencia em Lateral: d -0.044 no corte com e 0.34 no corte sem (q 0.87062 e 0.88964); fisico|minutos em Todos: d 0.075 no corte com e -0.123 no corte sem (q 0.88665 e 0.68946); fisico|permanencia em Zaga: d -0.603 no corte com e -0.804 no corte sem (q 0.12328 e 0.01005); minutagem|minutos em Todos: d 0.403 no corte com e 0.334 no corte sem (q 0.02874 e 0.12858). As duas únicas linhas que cruzam a correção a 5% aparecem SÓ no corte sem fronteira, que é enviesado por construção, e as duas apontam CONTRA a ficha. (g) Porta temporal da §6.4: não roda nesta unidade, pelos mesmos motivos de J03, J04 e J05 — o teto declarado antes de rodar já era indício. (h) Placar: o desfecho é minuto jogado e permanência, e nenhum dos dois está na lista branca de resultado da §3. (i) Esta conclusão ficou SEM gráfico de propósito. O único par de médias que existe aqui é o do diagnóstico do corte COM fronteira, 1.095 contra 1.317, e duas barras de alturas diferentes afirmariam no olho uma diferença que o próprio teste não distingue de zero (d -0,22, p 0,46, com d mínimo detectável de 0,7). Sem os clubes de fronteira o diagnóstico nem roda: a ficha aprova 7 chegadas, abaixo do piso de 8 por lado.",
   "n": "297 chegadas pontuáveis em 2023 a 2025, de 28 comparações por corte; 1.200 chegadas ficaram fora por não terem ano anterior na Série B e 246 por não chegarem a 900 minutos no ano anterior",
   "prova": "J06.md; J06_testes.csv; J06_backtest.csv; J06_resumo.json",
   "status": "validada",
   "negativa": true,
   "grafico": null
  },
  {
   "id": "J08-1",
   "parte": "J08",
   "bloco": "J",
   "manchete": "Nenhum país de fora chega ao mínimo de casos com destino na Série B",
   "o_que_vimos": "Das 310 chegadas à Série B, a maior origem de fora do Brasil tem 8 casos, e o mínimo para dar número a um país são 10. Mesmo somando Série A e Série C ao destino, o degrau muda de tamanho conforme o corte e não fecha número para país nenhum.",
   "para_o_santa_cruz": "Nenhum alvo estrangeiro entra na lista com um número de conversão fechado ao lado. O J09 pode usar o degrau do grupo de países como ordem de grandeza apenas no volume, onde ele fica do mesmo lado nos dois cortes (grupo abaixo −3,2 e −5,2 lugares em cada 100; grupo acima +3,3 e +3,4); na eficiência ele troca de sinal entre os cortes (grupo pareado −1,3 e +1,9; grupo abaixo −0,3 e +2,2) e ali não serve nem como ordem de grandeza. O que resolve isto é coleta de mais temporadas das ligas de origem, não outra conta.",
   "premissa": "p18",
   "premissa_titulo": "A régua é a Série A + B",
   "premissa_grupo": "Físico",
   "premissa_motivo": "Ajusta p18 (a régua é a Série A + B). O jogador de outra liga continua entrando na mesma régua para poder ser comparado, mas o ajuste de nível que essa comparação pressupõe não existe para país nenhum — e no físico não existe nem dado. Contradiz também a seção \"Ligas de origem\" do CLAUDE.md, que trata o fator de J08 como algo que apenas faltava calcular.",
   "confianca": "indício",
   "confianca_motivo": "Zero dos dois critérios, e por isso cai dois níveis, de firme para indício. (1) Correção para múltiplos testes dentro da família dela: NÃO. No J08_testes.csv (modelo S2, corte principal), dos 154 testes de liga estrangeira 9 sobrevivem à correção (6 de 84 no volume, 3 de 70 na eficiência), onde o acaso a 5% já produz cerca de 8; nenhuma família de país estrangeiro sobrevive inteira (Colômbia A 0 de 12, Portugal A 0 de 12, EUA 0 de 12 no volume). No corte so_900_no_destino são 11 de 154, e a lista de sobreviventes não é a mesma: no principal lideram Uruguai com 4 e Argentina A com 3; lá, Chile com 4 de 10 indicadores de eficiência (6 casos) e Portugal B (5 casos). Nas 24 linhas de família dos dois cortes, poder_suficiente é False. (2) Porta temporal da §6.4 (1º turno prevendo o 2º, com a parcial dada a pontuação do 1º turno): NÃO, e não roda — não há turno nem clube-temporada aqui, a unidade é jogador que trocou de liga e o painel das ligas de origem é fechado por temporada. O que rodou foi a porta de coorte, que não é a §6.4, e ela ainda se divide: o J08_resumo.json marca passou=false no volume (erro 9.81 com o termo de liga contra 9.58 sem) e passou=true na eficiência por 0.16 pp sem barra de erro. Zero dos dois = indício, e a régua nomeia o motivo desta em especial: n pequeno. O eixo do argumento mudou junto: sai \"a parte que exige teste foi testada e não passou\", porque em dois dos três cortes o maior degrau estrangeiro SUPERA o sorteio (só 900 no destino: Colômbia A −10,05, IC95 −14,3 a −5,2 no J08_testes.csv, contra p95 de cerca de 8 com 5 países no piso; corte estrito: Uruguai −9,51 contra p95 8,3 com 4 países no piso, J08.md:265-269); entra a contagem, que não depende de corte — com destino só Série B nenhuma origem estrangeira passa de 8 casos e o piso é 10 —, e o tamanho que o desenho enxerga naquele n. Ressalva de origem, agora que o texto cita os dois cortes calados: os p95 deles não são saída de script — o do corte estrito está só no J08.md, feito à mão, e o do corte de 900 no destino só na varredura de robustez (três sementes: 7,69 / 8,18 / 8,34). É por isso que o que falta aqui é recálculo, não redação: virar corte de script o corte estrito e o de 900 na origem, rodar o sorteio dentro de cada corte com a mesma regra (alvo = os países que chegam ao piso naquele corte) e emitir a linha de base de quem só chutasse a média. Passou do o_que_vimos para cá, sem perder nada: o poder do teste não enxerga degrau menor que 12.6 lugares em cada 100 com 10 casos (10,0 com 16), e o número do mesmo país anda de 2,5 a 9,5 conforme o corte — 10,1 contando só quem jogou 900 minutos na chegada, acima do sorteio de cerca de 8, e 9,5 (Uruguai) contando só quem de fato mudou de clube, acima de 8,3. Os dois lados da comparação — o maior degrau medido contra o que a escolha do melhor entre 7 países produz por sorte, no volume (7.6 contra 9.3) e no acerto (5.2 contra 7.9) — ficaram aqui, e não no gráfico. Correção do cético, acatada, em duas frentes. A manchete voltou a trazer o recorte do destino: sem ele a negativa era falsa pelo número da própria parte, porque somando Série A e Série C ao destino 7 ligas estrangeiras CHEGAM ao piso (J08_resumo.json, nulo_do_garimpo.volume.ligas_estrangeiras_no_piso). E o gráfico de dois cortes que estava aqui saiu: os dois blocos dele não eram cortes, eram as duas famílias de indicador (volume e eficiência), e as quatro leituras saíam todas do MESMO corte principal — vestindo a forma que o renderizador descreve como “a mesma comparação nos dois cortes”, ele prometia conferência de corte e entregava “o medido fica sempre abaixo do sorteio”, que é justamente o eixo de argumento abandonado no parágrafo acima. Os marcadores do sorteio DENTRO de cada corte não existem em numeros (item 1 do em_aberto), então essa comparação não é desenhável por marcador hoje e só volta depois do recálculo. No lugar dela ficou a contagem, que é o que a manchete usa e não depende de corte: 8 casos na maior origem estrangeira contra o piso de 10.",
   "n": "737 mudanças de liga, 591 jogadores; 249 delas com origem estrangeira, em 45 países; 310 chegadas à Série B, nenhuma origem estrangeira com mais de 8 casos",
   "prova": "fatores_liga.csv; J08_testes.csv (coluna corte: principal e so_900_no_destino); J08_resumo.json (chaves nulo_do_garimpo, poder e porta_de_coorte); J08.md, seção Prova; _robustez_19_09.md, seção J08",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "barras",
    "titulo": "Casos da maior origem de fora, contra o mínimo para dar número",
    "unidade": "chegadas à Série B",
    "barras": [
     {
      "nome": "A maior origem de fora",
      "valor": 8
     },
     {
      "nome": "O mínimo para dar número",
      "valor": 10
     }
    ]
   }
  },
  {
   "id": "J08-2",
   "parte": "J08",
   "bloco": "J",
   "manchete": "O degrau da divisão de origem muda de tamanho conforme quem entra na conta",
   "o_que_vimos": "Descontando onde o jogador já estava na própria liga, a perda de quem sobe da Série C some e o ganho de quem desce da Série A fica em 3.4 lugares em cada cem. Só com quem mudou de clube e jogou 900 minutos dos dois lados, o ganho cai para 1.0 e as duas margens passam pelo zero.",
   "para_o_santa_cruz": "Nenhum número de conversão entre divisões brasileiras vai para a tela nesta parte. Em J06 e J09, jogador de Série A e jogador de Série C entram na mesma régua sem bônus nem desconto de divisão: o que separa os dois é onde cada um estava dentro da própria liga. Quem contratar da Série C pagando o desconto da divisão está pagando por uma queda que a base não sustenta, e quem pagar prêmio por Série A está pagando por 3.4 lugares em cada 100 que encolhem para 1.0 quando se conta só quem mudou mesmo de clube.",
   "premissa": null,
   "premissa_titulo": null,
   "premissa_grupo": null,
   "premissa_motivo": "Não trata de nenhuma premissa de dados/premissas.json. Corrige uma leitura de graça anotada no _registro.md em 19/09 (\"quem sobe da Série C para a B perde 0,59 de nível\"), que não é premissa do app — e esse 0,59 é a média simples da base de 782 linhas (-0.587), não o coeficiente do modelo, que é −0,39.",
   "confianca": "indício",
   "confianca_motivo": "Fica no nível em que já estava, e a frase diz por quê: o degrau vai de 3.4 a 1.0 lugar em cada 100 conforme quem entra na conta. (1) Correção para múltiplos testes, pelo lado que a conclusão usa: NÃO. No J08_testes.csv (S2, principal) Brasil A tem 7 de 12 indicadores de volume sobrevivendo à correção e Brasil C 5 de 12, mas isso é sobre indicadores soltos; o degrau publicado é o da linha de família, e a coluna q dessa linha sai VAZIA nos quatro cortes (288 linhas de família, nenhuma com q). A família ancora_dqz idem — Brasil A aparece com p 0,0 e ainda assim com selo \"pode ser sorte\", porque não há q. Ou seja, o número que a conclusão discute nunca foi corrigido. (2) Porta temporal da §6.4: NÃO, e não roda (sem jogo a jogo em liga de origem). Na porta de coorte, que não é a §6.4, Brasil A acerta o sinal nas duas famílias e Brasil C erra o sinal nas duas (J08_resumo.json, porta_de_coorte.por_unidade). Zero dos dois = indício. O que o texto novo acrescentou é o outro lado: nos quatro cortes que o SCRIPT roda o degrau da Série A é estável (2,88 / 3,38 / 3,43 / 3,58, margem sempre fora do zero) — quem só olhasse a saída do script publicaria esse número como sólido. O que o derruba é um corte que só existe à mão, e é justamente o que o método da parte manda usar (\"jogadores que se transferiram\"); e a Série C faz o contrário da Série A, aparece onde não havia (0.1 para -3.5). Por isso o intervalo do corte estrito não vai para a tela como estava: o publicado (-1.6 a +3.3) não é reproduzível — a varredura de robustez refez e deu −1,4 a +3,4 —, e o texto passa a dizer apenas que a margem passa pelo zero. Passou do o_que_vimos para cá, sem perder nada: 189 das 737 linhas não são transferência — 56 subidas da B para a A, 55 da C para a B, 43 quedas da A para a B e 34 da B para a C —, e é por isso que o corte estrito (238 casos, quem mudou de clube e jogou 900 minutos dos dois lados) desfaz o degrau. Os dois cortes lado a lado ficaram aqui, e não no gráfico, inclusive a Série C, que sai de 0.1 para -3.5 lugar em cada 100 e é o que mostra que o sinal não se mantém. Correção do cético, acatada: o gráfico saiu desta conclusão, e a ressalva plural voltou ao texto. O gráfico tinha dois defeitos e um impedimento. O rótulo do primeiro bloco dizia “com todas as linhas”, que nomeia um corte que existe e não era o desenhado — todas as linhas é com_identidade_incoerente (Brasil A com 173 casos e 2,88), e os valores desenhados eram os do principal (156 casos, 3,38). O segundo bloco era o corte estrito, que não é um dos quatro cortes do J08_testes.csv (com_identidade_incoerente, principal, so_900_no_destino, so_temporada_fechada) e sim o corte feito à mão que o J08.md:233 admite, com intervalo não reproduzível. E o em_aberto manda, palavra por palavra, que J08-1 e J08-2 não vão para a tela com número fechado enquanto o recálculo não rodar — gráfico é tela, com tabela “ver os números” embaixo. Sem barra de erro, quatro pontos nus poriam a Série C indo de 0.1 para -3.5 como número fechado, que é exatamente o desconto que o para_o_santa_cruz proíbe, e o selo do J08_testes.csv para Brasil C é “sem diferença clara” nos quatro cortes de script. O intervalo da Série C no corte estrito (-7.4 a +0.1) é digitado, não gerado — a varredura de robustez refez e deu −7,28 a +0,87 —, então ele não vai para a tela nem para o gráfico enquanto o recálculo do item 1 não rodar. O desenho volta quando o recálculo do item 1 do em_aberto emitir o corte estrito como corte de script.",
   "n": "737 linhas no corte principal (Brasil A 156 casos, Brasil C 92), 238 no corte estrito com 228 jogadores; 189 das 737 não são transferência e 203 estão abaixo de 900 minutos na origem",
   "prova": "J08_base.csv (colunas clube_antes, clube_depois, menos_900_na_origem); fatores_liga.csv; J08_testes.csv (coluna corte, linhas de Brasil A e Brasil C); J08.md, seção Prova; _robustez_19_09.md, seção J08",
   "status": "validada",
   "negativa": true,
   "grafico": null
  },
  {
   "id": "J09-2",
   "parte": "J09",
   "bloco": "J",
   "manchete": "Nenhum volante e nenhum extremo de fora passa nos 6 pisos juntos",
   "o_que_vimos": "67 volantes e 82 extremos de fora jogam muito e sempre na liga deles. Nenhum dos dois grupos tem um jogador só que atenda as 6 exigências ao mesmo tempo. Use a ficha para descartar quem está muito longe, nunca para escolher.",
   "para_o_santa_cruz": "Não há alvo estrangeiro a perseguir no volante, na ponta e no gol — e o motivo não é o mercado, é a conta. Exigir 6 pisos ao mesmo tempo esvaziou o mercado lá fora como já tinha esvaziado dentro da Série B em J06, onde os três blocos juntos aprovavam 2 de 44. Nessas três posições, siga com olheiro e vídeo, e use a ficha para DESCARTAR quem está muito longe, nunca para escolher. Fora delas o estudo consegue dizer algo: 38 nomes em 4 posições passam o piso na régua da própria liga e têm contrato vencendo até 2027-06-30, com faixa salarial ao lado — mas ali a Série B já oferece de 8 a 13 nomes e a vaga de estrangeiro é cara.",
   "premissa": "p9",
   "premissa_titulo": "Limite de estrangeiros",
   "premissa_grupo": "Elenco",
   "premissa_motivo": "Contradiz no que a p9 tem de operacional. A vaga de estrangeiro existe — são 9 — mas esta base não indica em quem gastá-la justamente nas posições em que ela faria falta. Acrescenta também um dado de graça: 199 dos 910 elegíveis nasceram no Brasil e não ocupam vaga nenhuma.",
   "confianca": "indício",
   "confianca_motivo": "(a) É CONTAGEM, não estimativa: quantos candidatos existem e quantos atravessam os pisos de J05. Nenhum teste a salva nem a derruba, porque o que falta é margem na ficha e não poder estatístico. (b) O teto da parte foi declarado indício antes de rodar e a regra que autorizaria o rótulo `alvo` (nível A) exigia d > 0 e q < 0,05 na família filtro_j09 × minutos nos dois cortes: o teste primário nem entrou na tabela, porque o filtro aprova 4 das 48 chegadas, abaixo do piso de 8 por lado. Rodado à parte, fora do BH, os 4 aprovados fizeram 1.079 minutos contra 1.291 dos 44 reprovados. Por isso o rótulo publicado é `rastrear`. (c) Os dois cortes da fronteira rodaram e os dois estão relatados; nenhum bloco técnico passa em nenhum deles. (d) As DUAS leituras do piso rodaram, como a emenda 1 declarou antes: 78 passam na régua da própria liga e 70 depois da conta de J08. (e) A conta de J08 é uma reta de encolhimento, e isto está medido: o ponto fixo dela fica em 49,5 na eficiência, então ela PROMOVE quem está abaixo e REBAIXA quem está acima — de 3.640 medidas, 1.764 sobem e 1.876 descem — e o teto de 66,1 deixa 2 dos 20 pisos técnicos fora de alcance por construção. (f) O bloco físico entrou porque esta parte achou o dado na base do próprio app, com ponte medida em 99% de 11.023 linhas; mas ele NÃO tem fator de conversão em J08, então é o lugar do jogador na régua da própria liga, sem tradução. (g) Porta temporal: não rodou. (h) O funil que saiu do texto para o gráfico, bloco a bloco isolado: dos 67 volantes, 53 têm linha física, o físico aprova 7, o duelo 8 e o passe 12, e 0 passam em tudo; dos 82 extremos, 71 têm linha física, 12, 12 e 18 por bloco, e 0 passam em tudo. É a mesma contagem nas duas leituras do piso, e o gráfico mostra a do volante. (i) O rótulo do gráfico diz ISOLADO porque é isso que a conta é: `atende`, no J09.py, é ter dado em pelo menos UM piso do bloco e não violar NENHUM dos que têm dado — leituras sobrepostas, não fatias exclusivas de um funil, e por isso 7, 8 e 12 não se somam. A barra da ficha inteira é outro critério, `passa_ficha_origem`: dado em pelo menos DOIS pisos e nenhuma violação. Como os dois critérios não são o mesmo, a base de 67 candidatos ficou FORA do desenho e está no texto: cinco barras na mesma escala liam-se como um funil de fatias exclusivas, o que seria falso.",
   "n": "910 elegíveis com dado em 39 das 62 ligas lidas; 67 volantes e 82 extremos nas posições prioritárias, dos quais 53 e 71 com linha física",
   "prova": "J09.md; J09_resumo.json (chave por_posicao); J09_base.csv; J09_rastreio.csv; J09_ligas.csv",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "barras",
    "titulo": "Volantes de fora aprovados, por bloco isolado e na ficha inteira",
    "unidade": "jogadores",
    "barras": [
     {
      "nome": "Físico, isolado",
      "valor": 7
     },
     {
      "nome": "Duelo, isolado",
      "valor": 8
     },
     {
      "nome": "Passe, isolado",
      "valor": 12
     },
     {
      "nome": "Na ficha inteira",
      "valor": 0
     }
    ]
   }
  },
  {
   "id": "J09-3",
   "parte": "J09",
   "bloco": "J",
   "manchete": "No gol a base não tem como apontar um nome",
   "o_que_vimos": "Da ficha de goleiro sobram 2 exigências, as duas de passe, e a repetição na liga de origem não dá para conferir. Decida por olho e vídeo. 99 dos 584 passam esses dois números, e 44 deles têm contrato vencendo até 2027-06-30.",
   "para_o_santa_cruz": "O gol é onde a Série B oferece menos — 1 livre com rodagem, em J06 — e é exatamente onde o estudo não ajuda. A decisão terá de ser tomada por olho e vídeo. Não peça outra conta: faltam as três pernas ao mesmo tempo e as três são de coleta, não de método. A contagem fica de pé e vale como mapa de onde procurar: 99 dos 584 passam os dois números de passe e 44 desses têm contrato vencendo na janela.",
   "premissa": "m4",
   "premissa_titulo": "Goleiro top — investir",
   "premissa_grupo": "Montagem do elenco",
   "premissa_motivo": "Trata da m4, que diz ser o goleiro posição em que vale pagar acima da média do elenco. Não a contradiz: avisa que ela terá de ser executada sem apoio deste estudo enquanto as três lacunas existirem, e que o custo de errar ali continua alto.",
   "confianca": "indício",
   "confianca_motivo": "(a) O nível C — nenhum nome — estava escrito na regra ANTES de rodar, com o goleiro citado nominalmente: 'um filtro que não olha para nada de goleiro não escolhe goleiro'. Não é resultado, é a regra disparando. (b) As três lacunas estão medidas, não supostas: das 4 métricas do goleiro em J05 o duelo defensivo ficou sem piso e o aéreo foi descartado em J03-3, sobrando 2; o painel temporal tem 7 posições-raiz e nenhuma é goleiro, o que torna a repetição INVERIFICÁVEL — diferente de baixa; e só 18 dos 584 têm linha física, o que confirma em liga estrangeira o que J04 achou na Série B, onde 105 goleiros de 900+ minutos não tinham uma linha. (c) J08 não tem fator para goleiro: o painel de transferências não traz a posição. (d) Nenhum teste roda aqui, e por isso o teto é indício por construção: é contagem de lacuna. (e) Porta temporal: não se aplica. (f) A contagem que saiu do texto para o gráfico, com as três barras na MESMA base encaixada: 854 goleiros na base, 584 deles com minutagem alta E os dois números da ficha (são 585 os de minutagem alta; o que sobra não tem dois indicadores), e 18 desses com linha física. (g) A repetição NÃO é barra do gráfico, e é de propósito: 0 goleiros têm repetição conferível porque `regularidade_verificavel` é `setor diferente de Goleiro` no J09.py — zero POR CONSTRUÇÃO, contado sobre os 854 da base e não sobre os 18 da barra anterior. Desenhada como quarto degrau do funil, ela faria ler reprovação medida onde há AUSÊNCIA DE CONFERÊNCIA: o painel do Wyscout não guarda um goleiro sequer. É o mesmo que a alínea (b) diz — inverificável, diferente de baixa — e é por isso que a frase fica no que vimos, que se lê, e não só aqui.",
   "n": "854 goleiros na base, 585 com minutagem alta e 18 com linha física, em 39 ligas",
   "prova": "J09.md (seção O goleiro); J09_resumo.json (por_posicao.Goleiro); J09_base.csv (colunas regularidade_verificavel e fisico_rastreado); J05_perfil.csv",
   "status": "validada",
   "negativa": true,
   "grafico": {
    "tipo": "barras",
    "titulo": "Goleiros de fora, e o que a base tem sobre eles",
    "unidade": "goleiros",
    "barras": [
     {
      "nome": "Na base",
      "valor": 854
     },
     {
      "nome": "Com minutos e ficha",
      "valor": 584
     },
     {
      "nome": "Com linha física",
      "valor": 18
     }
    ]
   }
  }
 ],
 "contagem": {
  "total": 29,
  "pendente": 0,
  "rascunho": 0,
  "validada": 29
 }
};
