# Proposta de destino para as 53 conclusões — 19/09/2026

> Gerada aplicando a régua do `CLAUDE.md` (357 linhas, versão de 17/09). Run `wf_b360eada-8b2`,
> 20 agentes. Cru, com o texto completo de cada uma: `_proposta_destino.json`.

> **Isto é proposta.** Nenhum `<ID>.json` foi tocado. O que o arquivo delega a você é **validar o
> texto** — é o que esta lista existe para permitir.

## O quadro

| | |
|---|---|
| conclusões | 54 |
| confiança hoje | firme 33, provável 13, indício 7, firme (dentro de A05-1) 1 |
| confiança proposta | **indício 38, provável 14, firme 2** |
| destino | reescreve 43, rebaixa 6, inverte 4, so_texto 1 |
| esforço | recalculo 39, reanalise 13, texto 2 |
| partes sem `.md` | A05, A07, A11, A12, A13, A14, J01, J02, J03, J07, T03, T04 |
| falta dado em | A06-1, A07-2, J07-3, J03-1 |

## A resposta do estudo, como fica

> **O que separa quem sobe do meio — e o que vem antes do resultado.** Uma coisa só passa nos dois testes da casa: quem sobe finaliza de mais perto, a 19,5 metros contra 20,5 do meio, e já finalizava assim no primeiro turno. Outras três separam, mas o estudo não consegue mostrar que venham antes do placar, e ficam um degrau abaixo: ceder finalização de pior qualidade, ganhar cerca de um ponto percentual a mais da dividida no chão (60,8% contra 59,8%) e sofrer pouco perigo em casa. A peça que mais separa continua sendo o valor do elenco, que o clube não escolhe — e é também a que melhor antecipa o segundo turno.
> 
> **O que não separa.** Estilo com bola, pressão alta, bola parada, físico, a vantagem de mando e a qualidade técnica individual do titular — inclusive no gol, onde o destaque do goleiro sumia assim que se tiravam os times colados na linha. Sai desta lista a estabilidade do onze: ela separa, mas é consequência de ganhar, então saiu da régua em vez de virar critério. Ter a bola fica no meio do caminho: só aparece quando se tiram os times colados na linha, e ainda assim veio antes dos pontos do segundo turno. E "não separa" quer dizer "este desenho não conseguiria ver": com quatro anos de Série B, só diferença grande aparece.
> 
> **E o mais duro.** A vantagem da dividida é do time inteiro, cerca de um ponto percentual espalhado pelo elenco, e nenhuma posição isolada mostra o jogador que a explique — o número antigo de 1,59 comparava dois recortes diferentes e sai da tela. Fora a distância da finalização, nada da régua tem prova de vir antes do resultado. E sobre treinador a base não escolhe ninguém: o bloco inteiro rodou fora do método da casa, o jeito de jogar não se repete em ninguém — nem no treinador entre clubes, nem no clube entre treinadores — e nenhuma conclusão dele passa de indício.

## "O que decidimos" — as 7 que mereceriam o topo, depois de você validar

1. **Quem sobe finaliza de mais perto, e isso vem antes dos pontos.** Uso: o modelo de jogo persegue chegar à finalização de dentro, não volume de chute; em J05 isso vira requisito de posição (atacante que ataca as costas da zaga, meia que chega na área, lateral que entra em vez de cruzar de longe), nunca meta de finalizações. Confiança: firme — é a única conclusão firme do estudo inteiro.
2. **Quem sobe não sofre menos finalização: sofre finalização pior.** Uso: proteger a área vale mais do que reduzir o número de chutes do adversário; é critério de montagem de zaga, laterais e volante de proteção, e não promessa de acesso. Confiança: provável — separa nos dois cortes, mas o estudo não mostra que venha antes do resultado, e a régua do xG é curta.
3. **Quem sobe ganha mais a dividida no chão — e a vantagem é do time, não de um jogador.** Uso: entra como exigência de modelo de jogo e de treino da disputa; não é motivo para pagar caro num zagueiro que ganha duelo, porque posição por posição não há ninguém que explique a diferença. Confiança: provável.
4. **A régua do Bloco A cabe em sete indicadores, que são quatro coisas — e só três o clube escolhe.** Uso: chutar de perto, ceder chance ruim e ganhar a dividida são a lista de contratação e de modelo de jogo; a quarta é o valor do elenco, que não se escolhe e é a que mais puxa a régua para cima. Serve para ler a temporada rodada a rodada, não para apostar em acesso. Confiança: provável.
5. **Montar o elenco contra 64 pontos, e não contra a média — e escapar do rebaixamento é outra conta, bem mais barata.** Uso: o 4º precisou de 64 pontos em duas das quatro temporadas, e o 17º ficou entre 38 e 42; são duas decisões de orçamento diferentes, não a mesma com margem. Confiança: indício — é contagem de quatro temporadas fechadas, não teste.
6. **Na metade do campeonato a tabela já tem 10 dos 16 acessos e 10 dos 16 rebaixamentos; os outros viram depois.** Uso: a janela de julho entra no projeto desde janeiro — dinheiro e vagas de elenco guardados para reforçar no meio do ano, em vez de gastar tudo na montagem. Confiança: indício — é contagem, não teste, e vantagem na metade é banco de pontos, não vaga.
7. **Orçar comissão técnica para um ano é orçar duas.** Uso: o clube mediano da Série B troca de treinador uma vez por ano e poucos terminam a temporada com quem começaram; reserva de rescisão e de segunda comissão entram na conta desde o início, e o perfil de jogador de J05 não pode ficar amarrado a um modelo de jogo que tem grande chance de não chegar inteiro em novembro. Confiança: indício.

## Conflitos entre partes, e como a conciliação resolveu

**A04-1, J03-3, A06-3** — Duelo aéreo, mesma coluna do Wyscout, duas ordens opostas. J03-3 agora INVERTE e retira o destaque do goleiro; mas o texto novo do A04-1 mantém o goleiro como exceção ("onde o J03 achou o maior efeito individual do estudo justamente na bola aérea disputada"). A04-1 passou a se apoiar numa conclusão que caiu.
  - resolução: A04 cede: a exceção do goleiro sai inteira do A04-1. Motivo, pela régua da fronteira como escrita: o achado do goleiro só existe COM os times colados na linha (16x48, d 1,062, q 0,00121) e desaparece sem eles (8x32, d 0,679, q 0,385) — 'conclusão que só aparece com eles é ruído'. O mesmo vale para o duelo aéreo do time contra a Trave (16x16 firme, 8x7 não) e ele aponta para BAIXO (45,5% contra 47,6%). Com isso as duas frases dizem a mesma coisa sem exceção: duelo aéreo e altura não são requisito de contratação, nem na linha nem no gol. J03-3 acrescenta a tradução em unidade de jogo que o auditor confirmou (os dois goleiros ganham ~15 bolas altas por temporada; a diferença inteira é 1,4 bola perdida em 38 jogos) e registra em aberto que nenhuma métrica de goleiro — defesas, gol sofrido contra o esperado, jogo sem sofrer — chegou a ser testada.

**A02-2, A06-3** — O mesmo teste publicado duas vezes como duas conclusões. xg_por_remate_contra sai bit a bit igual em A02_testes.csv e A06_testes.csv (16x48: 0,089 contra 0,098, d 0,805; 8x32: 0,086 contra 0,100, d 1,303) e só o q muda porque cada parte o corrigiu numa família diferente (0,02076/0,0043 no A02; 0,03113/0,00967 no A06). Quem lê a síntese conta duas provas defensivas independentes e tem uma — e dá para escolher o melhor q.
  - resolução: A02 é o dono do indicador e A06 cede. Motivo: xg_por_remate_contra está na lista pré-declarada do A02, na família 'cede', e a pergunta do A02 é exatamente criar contra ceder; o A06 arquivou o mesmo número em 'cede_ajustado' sem ajustar nada (o ajuste pela posse mudou o volume de finalizações sofridas, não o xG por finalização). O q do A06 é retirado; fica só o do A02. A06-3 perde a metade de qualidade e publica só o que é dele: o volume de finalizações sofridas não separa nem no bruto nem ajustado pela posse (11,6 contra 12,1 por jogo), e aponta para o A02 para a outra metade. Sai de A06-3 a frase 'Confirma o A02 com o ajuste que faltava'. Mesma decisão para duelos_aereos_pct: dono é o A04 (régua G), o A06 apaga a cópia. E os dois ficam em provável, não firme, porque passam no BH nos dois cortes mas reprovam na porta temporal (parcial -0,026, p 0,82) — com a ressalva obrigatória de que a régua do xG reproduz 0,30 de si mesma, abaixo do piso de 0,40 da casa.

**A03-2, A06-1, J03-2** — Duelo defensivo: três instruções de contratação incompatíveis nas próprias propostas. A03-2 diz 'Ganhar a dividida defensiva é requisito de jogador na hora de contratar'; A06-1 diz 'não como motivo para pagar caro num zagueiro que ganha duelo'; J03-2 diz 'Não transforme duelo defensivo em requisito de contratação por posição'. Além disso A03-2 afirma que 'confirma o que o A06 já apontava', quando é o mesmo indicador recortado por mando — não prova independente.
  - resolução: A03 cede nas duas pontas. Dono do duelo defensivo é o A06 (é indicador declarado dele; o A03 o importou para testar por mando e declarou isso no próprio A03_indicadores.json), e quem testou posição por posição foi o J03, que não achou ninguém. Então: exigência de time e de modelo de jogo, treino da disputa — nunca requisito individual de contratação, em nenhuma das três frases. A03-2 troca 'requisito de jogador' por 'exigência de time' e troca 'confirma o A06' por 'é o mesmo indicador do A06 aberto por mando, não uma segunda medição'. Nível: provável nas duas (A06-1 e A03-2 passam no BH nos dois cortes e reprovam na porta: duelos_def_pct parcial +0,092, p 0,416; dd_casa parcial -0,026). J03-2 fica em indício, que é o que a letra manda para uma ausência que não testou nem passou em nada.

**J03-2, A06-1, A03-2, A14-1** — O número 1,59 do duelo está em quatro lugares — J03.json (numeros.dd_time), A03_indicadores.json linha 49, _fonte/CONTEXTO_sessao_17_09.md linha 49 e static/estudo_serieb_dados.js linhas 335 e 1086, esta última no ar. Ele é o corte reduzido (8x32), enquanto os números do jogador no J03 são a base inteira (16x48): a frase mais citada do estudo compara dois recortes diferentes.
  - resolução: O 1,59 sai dos quatro lugares, inclusive da aba no ar, e é substituído pelo número da base inteira, em unidade de jogo: 60,8% contra 59,8%, cerca de 1 ponto percentual de dividida defensiva ganha. Motivo: é o recorte em que o J03 mediu o jogador, e comparar time e jogador em cortes diferentes fabrica a diferença que a frase explica. No mesmo corte, o time dá 0,805 e o volante 0,535, com o intervalo do volante contendo o do time — não há contraste a explicar. Cai junto a frase 'não se compra o duelo, organiza-se': o estudo não mediu treino nem organização em lugar nenhum. O que fica é: a vantagem é de time e nenhuma posição isolada a explica. Marcador obrigatório ({dd_time_pp}), como a proposta do J03-2 já faz; nenhuma outra parte digita o número à mão.

**A05-1, A02-1, A05-3, A12-1** — A05-1 foi proposta como firme ('Quem sobe tem mais a bola — e já tinha no primeiro turno'), mas a posse NÃO separa na base inteira: 16x48 dá d 0,521, q 0,134, 'sem diferença clara'; ela só fica firme no corte reduzido (8x32, q 0,0375, sem poder). Pela letra, firme exige a correção para múltiplos testes E a porta temporal — e a correção é da rodada principal, porque a régua diz que a comparação roda 'também' sem os times colados na linha, ou seja, o corte reduzido é conferência, não a medida. Além disso A02-1 diz que finalizar de perto 'é a única coisa que este estudo consegue mostrar que vem antes do resultado', e a posse também passa na porta (parcial +0,227, p 0,043) — as duas não podem estar certas. E A12-1, na mesma rodada, classifica a construção com bola como indício.
  - resolução: A05-1 cede o selo: provável, não firme. Passa só num dos dois critérios (a porta), e a separação some quando os 20 times do ano estão na conta. A manchete muda de lugar: o que se sustenta é 'quem tinha mais a bola no primeiro turno pontuou mais no segundo', não 'quem sobe tem mais a bola' — a segunda frase depende de tirar os times colados na linha e tem de dizer isso. A02-1 cede a palavra 'única' e passa a dizer 'a única que separa quem sobe E vem antes do resultado', que é verdade e é mais forte. A05-3 se reescreve junto: 'Nenhum jeito de construir separa quem sobe — nem ter a bola, que só aparece quando se tiram os times colados na linha.' Com isso A05-1, A05-3 e A12-1 passam a dizer a mesma coisa. Resultado da rodada: A02-1 é a ÚNICA conclusão firme do estudo inteiro.

**A12-1, A14-1, A01-2, A06-1** — Quantas coisas o clube escolhe e que separam quem sobe? A12-1 diz uma ('a qualidade da chance, criada e cedida'), A14-1 diz seis (finalizar de perto, criar chance boa, ceder chance ruim, ganhar o duelo defensivo, sofrer pouco em casa, ganhar o duelo em casa) e A01-2 diz três ('a qualidade da chance criada e a cedida, e a distância de onde se finaliza'). Os três contam a mesma evidência de jeitos diferentes, e duas das seis do A14 são duplicações literais: a distância do remate está DENTRO da qualidade da chance, e o duelo em casa é metade dos jogos do duelo total.
  - resolução: Alinhar na conta do indicador cru, que é a regra dura da especificação ('quando os itens de um eixo discordam, publica-se o item'). Ficam QUATRO coisas distintas: (1) finalizar de perto — que é toda a régua de qualidade da chance criada, porque nenhum outro item dela separa; (2) ceder chance de pior qualidade; (3) ganhar a dividida defensiva; (4) o valor do elenco, que não se escolhe. Três escolhíveis, não seis, não uma. A14-1 cede a contagem: sete indicadores que são quatro coisas, e diz por escrito que duas peças eram a mesma medida contada duas vezes. A12-1 cede o alcance: sua frase passa a ser 'das nove réguas, as que separam e o clube escolhe são a qualidade da chance e a solidez' — porque a dividida defensiva não está em régua nenhuma e o A12 nunca a testou; a frase 'só uma coisa separa quem sobe' era um universal tirado de nove réguas. A01-2 cede a lista: 'a distância de onde se finaliza e a qualidade da chance cedida', sem 'a qualidade da chance criada', que no indicador cru é a mesma distância (o xG criado não separa: 1,276 contra 1,179, q 0,084).

**A14-1, A14-2, A14-3, A12-1, J02-3** — A régua do A14 muda de tamanho e os números do A14-3 não acompanham. A14-1 passa a sete indicadores (sai a estabilidade do onze), mas os marcadores do A14-3 (Juventude 83,1 em 1º, Novorizontino 80,8 em 2º) são do índice de oito — com sete a ordem inverte (Novorizontino 85,3 passa o Juventude 84,0). Publicadas juntas, A14-1 e A14-3 descrevem duas réguas diferentes. E a estabilidade do onze sai do índice enquanto o J02-3 a promove a provável ('quem sobe concentra os minutos nos mesmos onze').
  - resolução: A14-3 é recalculada no índice de sete e passa a falar do conjunto, não da ordem: 'os dois primeiros da tabela aparecem no topo da régua, em ordem trocada'. A14-1 diz por escrito, no motivo de confiança, que sem o valor do elenco a validação cai de duas temporadas em quatro para uma em quatro — a régua lê melhor o bolso do clube do que o jogo dele. O J02-3 e o A14-1 não se contradizem e passam a se citar: a concentração dos minutos separa (68,1% contra 63,1%, firme nos dois cortes) e por isso o J02 a publica; ela sai da régua do A14 porque é consequência de ganhar, não é calculável por turno e carrega o rótulo 'não contrate para isto'. Sem esse par de frases o leitor vê a mesma medida promovida numa parte e apagada na outra. Nível: A14-1 provável (teto do índice — quatro dos oito componentes foram à porta e reprovaram, dois não são testáveis), A14-2 indício, A14-3 indício, J02-3 provável.

**T03-1, T04-2, T02-2, T04-1, T02-3** — O bloco do treinador se contradiz e se sustenta em si mesmo. T03-1 diz que a distância de onde o time finaliza 'é o único traço que acompanha o treinador'; T04-2 diz que 'nenhum dos dois reaparece no clube seguinte'. E T02-2/T04-1 montam a lista curta em cima do tempo no G4 de Eduardo Baptista, enquanto T02-3 e T04-2 dizem que o tempo no G4 não se transfere — a lista curta se apoia justamente no que as irmãs derrubaram.
  - resolução: T03 cede a exceção. Recontei em T03_resumo.json: entre os 34 treinadores com mais de um clube, a distância do remate é o traço que MENOS oscila — e oscila 42,5 pontos de percentil na mediana, contra 50 a 60 dos outros seis. Isso é 'o menos instável de sete instáveis', não 'acompanha o treinador'. A frase vira: é a pergunta que vale fazer na conversa, porque é o traço que mais importa (é o único que vem antes do resultado no A14), e nem ele o treinador leva junto. Com isso T03-1 e T04-2 dizem a mesma coisa. Sobre a lista curta, T02-2 cede a promessa: sai 'É o nome que sobra para a lista curta de T04' como recomendação e entra 'é o único nome da base com mais de um clube e um piso para olhar'. T04-1 já está certo ao dizer que serve para reduzir a conversa a um nome e não para decidir. Nível de todo o bloco T: indício, sem exceção — os cinco scripts não importam o método da casa, não conhecem o corte de fronteira e não existe um único arquivo de teste do bloco T na pasta de resultados, então firme é inalcançável por construção, não por azar.

**T03-1, J02-1, J02-2** — A premissa 'na Série B o perfil de jogo é do clube, não do treinador', proposta pelo T03-1 e já repetida pelo J02-1 como coisa sabida. O dado do próprio T03 a nega: rodando o mesmo teste sobre pares do mesmo clube com treinadores diferentes, o clube repete 0,063 — três a quatro vezes MENOS que o treinador entre clubes (0,265 a 0,291), e nenhum dos dois chega perto da linha do acaso (0,609).
  - resolução: Resolvido, e confirmo que os textos novos não a carregam mais: a premissa sai do T03-1 e a frase sai do J02-1. O que vai ao registro é o achado mais duro e mais útil: em Série B o jeito de jogar não persiste em ninguém — nem no treinador entre clubes, nem no clube entre treinadores (0,063), nem no clube entre anos (0,076). Essa é a base de T03-1, T03-2 e T04-2, e é ela que sustenta 'não pague por modelo de jogo de treinador'. J02-2 não precisa de apoio do T03: ela se sustenta sozinha no próprio dado de permanência de elenco.

**A13-1, A13-2, A13-3** — As três do A13. Nas propostas elas deixaram de se contradizer (A13-1 já diz que a temporada não está perdida na rodada 19; some o erro de aritmética da Trave, que apresentava uma subida de um ponto como queda), mas sobram dois problemas: A13-3 foi proposta como 'provável' e A13-2/A13-3 dizem quase a mesma coisa.
  - resolução: A13-3 cede o selo: indício. O A13 não produz arquivo de teste nenhum — não há correção por família — e o que ele chamou de porta temporal foi o 1º turno contra a posição FINAL, que contém o 1º turno, sem a parcial; pela §6.4 isso não é a porta. Contagem que não testou nada não passou em nenhum dos dois critérios, e a frase tem de dizer por quê. Papéis separados para não repetir: A13-1 é o tamanho do buraco (quem cai chega à metade com o déficit montado) e a decisão que ele gera (correção na janela do meio do ano); A13-2 é a contagem (10 dos 16 acessos e 10 dos 16 rebaixamentos já estão na mesa na rodada 19; 6 viraram dos dois lados) e a decisão que ela gera (guardar dinheiro e vagas para julho); A13-3 é a advertência de uso (vantagem na metade é banco de pontos, não vaga) e não repete os números das outras duas. Nenhuma das três propõe mais a premissa 'o rebaixamento se define no 1º turno' — a versão que a base sustenta é a contagem de A13-2.

**A04-1, A04-2, A04-3, A12-1** — Bola parada: o estudo publica 'não separa' e o diagnóstico de conjunto mostra o contrário no corte bom. Na base inteira o saldo de gols de bola parada é 0,145 por jogo contra 0,000 do meio — cinco gols e meio por temporada, firme e com poder (q 0,00228) — e ele morre no corte reduzido (q 0,0534). Escrito como está, A04-1 diz 'não separa' para o achado mais forte do corte de maior poder, enquanto o A05 e o A12 escrevem 'depende do corte' para achados que fazem o caminho inverso: mesma régua, honestidade oposta.
  - resolução: Aplico a régua como escrita e a conclusão do A04-1 não muda de sinal: o que só aparece COM os times colados na linha é ruído, e o saldo de bola parada é exatamente isso. Mas a frase tem de dizer qual conferência o matou, e não fingir que o número não existe — é o que o nível indício exige. Duas correções obrigatórias: (1) A04-1 mantém 'nada do trabalho de bola parada separa', porque o que separa é gol e gol está na lista branca de resultado (é o placar redescrito, não característica); (2) A04-2 deixa de dizer que a fatia é 'igual para todos' sem mais nada e passa a dizer as duas metades — a FATIA dos gols que vem de bola parada é a mesma em todas as faixas (34%, cerca de 14 gols por temporada), mas o SALDO de bola parada de quem sobe é maior, e é placar, não treino. A04-3 fica em provável só se o corte declarado e o n declarado forem os mesmos da linha de onde saem os números (hoje diz '16 rebaixados contra 48' e mostra números do corte de 12 contra 32).

**J01-3, J02-3, A07-2** — 'Quantos jogadores o time que cai usa' aparece com dois números que diferem por quase o dobro, e as partes os misturam. J02 mede atletas usados pelo Wyscout: 47,0 contra 38,0 do meio. A07 mede atletas rastreados pelo SkillCorner: 25,5 contra 22,0 — que é uma amostra de cerca de 15 jogos por atleta, não o elenco. O J01-3, que hoje está na tela com o marcador quebrado ('rastreia 4,1 contra... na verdade 25,5 atletas contra 22,0'), e o J02-3, que hoje junta o valor cru de um corte com o tamanho de efeito do outro, publicam os dois sem dizer qual é qual.
  - resolução: Um dono por medida. J02 é dono de atletas_usados (47 contra 38, Wyscout, régua I) e A07 é dono de fis_atletas (25,5 contra 22,0, SkillCorner, rodízio rastreado, amostra de jogos). J01 cede: ele não recalcula nem digita nenhum dos dois, importa por marcador e nomeia a medida na própria frase. Regra que fecha os três casos: um corte por conclusão — valor cru, tamanho de efeito e correção saem sempre da MESMA linha do arquivo de teste — e o n declarado é o n dessa linha. O J02-3 tem de ser recalculado antes de qualquer outra coisa, porque o par que ele publica hoje não existe em nenhuma linha do arquivo; e a frase quebrada do J01-3 é o conserto mais urgente, porque está visível na aba no ar.

**T01-1, T01-2, T01-3** — O n do T01 está inflado e as três conclusões da parte o dividem. O T01 atribui a temporada pelo ano da data — a armadilha que o A01 registrou —, o que faz 2021 aparecer com 28 clubes e conta a mesma passagem duas vezes. O auditor corrigiu para 497 passagens-temporada; o cético refez pela regra de blocos do A01 e mostrou que são 492 (o denominador 180 clube-temporadas o auditor acertou).
  - resolução: Vale o cético: 492 passagens-temporada e 180 clube-temporadas, e nenhuma conclusão do T01 pode publicar 506 ou 188. Isso muda o denominador do T01-1 ('só X de {clube_temporadas_fechadas} terminaram a temporada com quem começou' tem de ser recontado sobre 180) e o n do T01-3. Sai também do motivo de confiança o 'zero sobra', que é propriedade do algoritmo e não conferência que poderia falhar. Em compensação, entra a conferência independente que o T01 declarava impossível: dados/bola_parada.json, gerado em 14/09 a partir do Sofascore, traz 280 passagens de Série B com nome de treinador, e a conferência PASSA em 143 de 157 passagens de 10 rodadas ou mais — as 14 restantes são grafia de clube e nome curto, e as duas maiores batem rodada a rodada. É isso que sustenta a manchete nova do T01-3 ('duas fontes contam a mesma história'), e é isso que obriga a tirar do CLAUDE.md a frase 'nenhuma base tem nome de treinador'. Nível: indício nas três (contagem, não teste), como a letra manda.

## Falta dado (o único motivo de o arquivo mandar perguntar)

- **A06-1** — Recuperação por altura do campo não existe na base: há o total e a quebra por comprimento de passe, que é outra coisa. Sem ela, 'pressiona mais alto' só tem resposta indireta, por PPDA e recuperações totais, e é por isso que essa metade da manchete não pode ser afirmada nem negada. Só coleta resolve — vale abrir coleta de recuperações por terço do campo?
- **A07-2** — Para a porta temporal do físico falta físico POR JOGO em 2022–2024: neste repositório só existe 2025 (physical_match, 374 jogos) e 2026 parcial. Ele existe no skillcorner.db do Portal Ranking, que é outro projeto — o dono decide se a base é copiada para cá (com a data da cópia no _registro.md). Sem esse dado, A07-2 não tem como passar de provável, por mais que o resto seja corrigido.
- **J07-3** — Não existe tabela de clube → país/liga no repositório: `clube_anterior` de serieb_elencos.csv traz o nome do clube e nada mais. Sem ela, {de_clube_europeu} e a liga de origem de cada estrangeiro só saem classificando à mão os ~200 nomes de clube anterior. Duas saídas, e a escolha é do dono porque é dado, não método: (1) o dono aprova uma lista de clube → país montada uma vez, conferível, e a frase sai com número; ou (2) a frase da Europa cai e a origem continua saindo só da nacionalidade, com a aproximação declarada. Isso também é o que trava J08 para as ligas vizinhas.
- **J03-1** — Existe export do Wyscout de jogador por turno (ou por rodada) da Série B em algum lugar — no Portal Ranking, por exemplo? serieb_tecnico.csv é fechado por temporada, e sem dado por turno a porta temporal do §6.4 não roda em NENHUMA conclusão de J03: o teto do bloco J fica em 'provável' para sempre. Não bloqueia a reescrita; decide só se o selo pode um dia subir.

## Conclusão por conclusão

Ordenado pelo peso da mudança: o que cai primeiro, o que fica igual por último.

### A02-2 — INVERTE  ·  provável → **provável**  ·  esforço: recalculo

**Hoje:** O lado que mais separa é o defensivo

**Proposta:** Quem sobe não sofre menos finalização, sofre finalização pior

*O que vimos.* Quem sobe sofre {remc_s_cf} finalizações por jogo e o meio {remc_m_cf}: praticamente o mesmo. O que muda é o tamanho da chance — a cada 100 finalizações que cede, quem sobe leva {xgpr_s100_cf} gols esperados e o meio {xgpr_m100_cf}, com os 20 times e também sem os que estavam colados na linha. O xG que cede por jogo anda no mesmo sentido ({xgc_s_cf} contra {xgc_m_cf}), mas esse só fica claro sem os times colados na linha, e pode ser efeito do placar: quem está ganhando recua e passa a ceder chute de longe.

*Para o Santa Cruz.* Proteger a área vale mais do que reduzir o número de chutes do adversário: o alvo é o tipo de finalização que se cede, não a quantidade, e isso é critério de montagem de zaga, laterais e volante de proteção. Mas o estudo não consegue mostrar que isso vem antes do resultado — o time que já está na frente cede chute pior —, então entra como critério de montagem e não como promessa de acesso. Sobre criar, o estudo não diz nada: a diferença de xG criado ({xg_s_cf} contra {xg_m_cf}) é menor do que este número de times consegue enxergar, e aqui 'não separa' significa 'não dá para ver'.

*n.* {n_sobe} promovidos contra {n_meio} do meio (e {n_sobe_sf} contra {n_meio_sf} sem os times colados na linha); {n_turnos} clube-temporadas no teste de anterioridade

**Por que esse nível.** (a) BH a 5% dentro da família 'o que cede': passa nos dois cortes para o xG por finalização sofrida — q 0,02076 com os 20 times e q 0,0043 sem os de fronteira. (b) Porta temporal da §6.4: NÃO passa — parcial −0,026 (p 0,8213) do 1º turno sobre os pontos do 2º, dado o 1º (_porta_temporal.json, 19/09, n=80); é porta B, 'firme, mas o 1º turno não previu o 2º'. Um sim de dois = provável. A manchete de hoje, porém, se inverte: no corte cheio o maior efeito que não é placar é de ataque (distância da finalização, d 1,203) e o defensivo fica em 0,805, com o xG sofrido total nem chegando a firme (q 0,065) — a ordenação entre os lados nunca foi testada e não sobrevive ao corte, por isso ela cai e o que fica é o indicador defensivo em si.

**Números a criar/corrigir:**
  - xgpr_s100_cf = 8.9 e xgpr_m100_cf = 9.8 (xG por finalização sofrida do corte cheio, 0.089 e 0.098, x100 para virar unidade de jogo)
  - xgc_s_cf = 1.02 e xgc_m_cf = 1.18 (com/cede/SM/xg_contra, 1.017 e 1.183 — hoje o texto usa 1.002 e 1.189, do corte reduzido)
  - remc_s_cf = 11.6 e remc_m_cf = 12.1 (compartilhados com A02-1)
  - xg_s_cf = 1.28 e xg_m_cf = 1.18 (com/cria/SM/xg, 1.276 e 1.179)
  - conf_xgpr_contra = 0.35 — NÃO existe no repositório: o split-half da §3 (pares x ímpares, posto no ano, Spearman-Brown) tem de ser rodado e gravado na coluna regua_curta, porque abaixo de 0,40 a régua obriga hachura e este indicador é o centro da conclusão
  - dmin_SM_cf = 0.82 (para a frase fixa da §6.7 sobre o xG criado)

### A05-1 — INVERTE  ·  firme → **firme**  ·  esforço: recalculo

**Hoje:** Não existe estilo com bola que separe quem sobe

**Proposta:** Quem sobe tem mais a bola — e já tinha no primeiro turno

*O que vimos.* Quem subiu ficou com {posse_sobe_med}% da bola, contra {posse_meio_med}% do meio e {posse_cai_med}% de quem caiu — {passes_dif} passes a mais por jogo. {sobe_mais_bola} dos {n_sobe} promovidos tiveram mais da metade da bola; entre os rebaixados foram {cai_mais_bola} de {n_cai}. E quem já tinha mais a bola nas {rodadas_1t} primeiras rodadas somou mais pontos nas {rodadas_2t} seguintes, mesmo entre times que vinham com a mesma pontuação.

*Para o Santa Cruz.* Ter a bola entra como critério de montagem de elenco e de escolha de treinador: é o único traço com bola que se sustenta, e vem antes do resultado. Mas é desempate, não plano — são {posse_dif} ponto de posse de diferença para o meio, e contra os times que ficam logo atrás, do 5º ao 8º, ela não separa. Marca obrigatória: pode ser efeito do placar, porque quem está ganhando cede bola e a base não permite separar por estado do jogo.

*n.* 16 promovidos contra 48 do meio (8 contra 32 sem os times a até três pontos da linha); a conta do primeiro turno usa os 80 clube-temporadas de 2022–2025

*Premissa.* Sugere premissa nova, grupo Modelo de jogo: 'Ter a bola é desempate, não requisito'. Em igualdade de condições, preferir treinador e jogadores que sustentem mais de metade da posse; não é requisito de acesso, não substitui o lado defensivo (A02 e A06) e não vale contra os times do 5º ao 8º. Corrige também o registro atual da parte, que dava a régua A (posse e construção) da Protótipo como sem sustentação: ela cai em nove dos dez itens e fica de pé no primeiro.

**Por que esse nível.** (a) BH a 5% na família: SIM. Das 60 linhas de A05_testes.csv existe exatamente um selo firme e é posse em Sobe × Meio, família construcao, q 0,03748 (d 0,689; IC95 [0,19; 1,30], exclui zero) — no corte sem os times a até três pontos da linha. No corte com eles o mesmo indicador dá q 0,13363, mesmo sinal e mesma direção. A regra da fronteira do CLAUDE.md descarta o que só aparece COM esses times ('Conclusão que só aparece com eles é ruído'); este só aparece sem eles, e o próprio _metodo_fronteira.md registra que em Sobe × Meio o viés do filtro é o menor dos três, porque os dois lados ficam mais fortes na mesma direção (+3,5 e +3,0) — o viés por construção que o A03 mostrou é entre faixas vizinhas (Sobe × Trave e Sobe × Cai). (b) Porta temporal da §6.4: SIM. A tabela da §6.4 publica 'Posse, %' com ρ +0,247 e parcial +0,227 (p 0,043), sinal certo na escala alinhada — que é exatamente o critério da porta A da §6.5 (parcial p<0,05 e sinal positivo; o BH não entra na porta). O teste de 19/09 reproduziu a tabela inteira célula a célula, 9 de 9, e a linha da posse bate (conferencia_6_4: parcial 0,227, p_parcial 0,04322, n 80, 'bate': true). Dois sim = firme. Três ressalvas que ficam na prova e não mudam o selo: (1) dados/prototipo.json etapa_7 dá parcial 0,207 e p 0,0669 para o mesmo indicador, mas é outra fórmula de parcial (a fechada de Pearson, a mesma que dá −0,34 onde a §6.4 tem −0,289 em dist_remate) — pelo CLAUDE.md vale a especificação, e foi a §6.4 que o teste de 19/09 reproduziu; (2) o desenho não tinha poder (d mínimo 0,82 no corte cheio e 1,14 no corte sem; o efeito medido é menor), o que não desqualifica um achado positivo mas manda ler o tamanho com desconfiança; (3) contra a Trave (5º–8º) a posse não separa em corte nenhum, e no corte sem fronteira chega a inverter (51,7% do Sobe contra 54,2% da Trave, 8 contra 7 times). O A12 chega ao mesmo pela régua A_posse_construcao (firme só no corte sem, q 0,0433), mas é o mesmo dado por outro moedor — não conta como segunda prova.

**Números a criar/corrigir:**
  - posse_sobe_med = 51,4 (mediana de posse dos 16 promovidos, %; já em A05_resumo.json)
  - posse_meio_med = 49,8 (mediana do Meio, %)
  - posse_cai_med = 48,5 (mediana do Cai, %)
  - posse_dif = 1,6 (diferença de posse entre Sobe e Meio, em pontos)
  - passes_dif = 21 (passes por jogo a mais, mediana 401,5 contra 380,0)
  - sobe_mais_bola = 12 (promovidos com 50% ou mais de posse)
  - cai_mais_bola = 4 (rebaixados com 50% ou mais de posse)
  - n_sobe = 16
  - n_cai = 16
  - n_meio = 48
  - rodadas_1t = 19
  - rodadas_2t = 19
  - porta_parcial_posse = 0,227 e porta_p_posse = 0,043 (só para a prova, nunca no texto de 2 minutos)
  - CORRIGIR n_testes de 30 para 60 (o arquivo de prova tem 60 linhas: 10 indicadores × 3 comparações × 2 cortes)
  - APOSENTAR sm_dois, st_dois e cm_dois (0/0/0): mediam 'firme nos dois cortes', que deixa de ser o critério

### J03-3 — INVERTE  ·  provável → **indício**  ·  esforço: recalculo

**Hoje:** O goleiro é a única posição em que o titular de quem sobe se destaca

**Proposta:** O goleiro de quem sobe ganha a mesma bola alta que o do meio: o destaque era da porcentagem, não do goleiro

*O que vimos.* Em porcentagem, o goleiro de quem sobe aparece com {gk_s}% de bola alta ganha contra {gk_m}% do meio — o maior número individual da tabela. Em bola, os dois ganham o mesmo: {gk_ganhos_s} por temporada contra {gk_ganhos_m}; a diferença inteira é perder {gk_perd_s} contra {gk_perd_m} em 38 jogos. Sem os times que terminaram colados na linha de acesso sobram {gk_n_s_sem} goleiros de quem subiu e a diferença some — e dos {n_ind_setor} números que medimos no gol, {gk_ind_vazios} são zero para quase todo goleiro.

*Para o Santa Cruz.* Este estudo não dá motivo técnico para pagar mais pelo goleiro: a única medida que apontava para lá é uma porcentagem sobre pouquíssimas bolas e ela some no recorte de controle. Não é o contrário — não estamos dizendo para economizar no gol; estamos dizendo que J03 não mediu o que um goleiro faz. Antes de J05 fechar o perfil do gol, faltam testar defesas, gol sofrido contra o esperado, jogo sem sofrer e bola alta do goleiro em número, que a base tem em serieb_tecnico.csv e esta parte não usou.

*n.* {gk_n_s} goleiros de quem sobe contra {gk_n_m} do meio no recorte cheio; {gk_n_s_sem} contra {gk_n_m_sem} sem os times colados na linha

*Premissa.* Toca a premissa m4, 'Goleiro top — investir'. Não a contradiz: retira o único apoio medido que J03 dava a ela, e a devolve ao estado de premissa do dono, sem prova a favor nem contra. Tem de conversar com A04-1, que mede o MESMO duelo aéreo no nível do time, é firme e fecha com 'altura e duelo aéreo não entram como requisito de acesso' — hoje as duas partes publicam instruções opostas sobre a mesma coluna do Wyscout, e J05/J06 recebem as duas.

**Por que esse nível.** (a) BH a 5% dentro da família: passa, e com folga — q 0,00121 na família de 4, 0,00360 na de 12 por setor e 0,02520 mesmo pondo os 84 testes numa família só. Resiste também a deixar uma temporada de fora e ao bootstrap por clube (intervalo 0,55 a 1,60). MAS o recorte sem os times de fronteira nunca rodou em J03, e quando roda o efeito não se reproduz: n 8x32, d +0,679, p 0,09629, q 0,09629, contra um mínimo detectável de 1,14. Refiz esse corte do zero e bate com a auditoria na casa decimal. A regra da fronteira, como está escrita, descarta o que só aparece COM os times de fronteira — então (a) não se sustenta. (b) porta temporal: não rodou e não roda nesta base. Zero de dois = indício, e a frase diz por quê. Dois reparos que vêm junto: 'a única posição' é desmentida pela própria segunda frase da conclusão (o meia faz menos falta) — e esse achado do meia também cai no mesmo teste (q vai de 0,00726 para 0,22264); e em unidade de jogo o efeito é minúsculo, o que a conclusão esconde atrás da porcentagem.

→ vai para **"Parece, mas não é"**.

**Números a criar/corrigir:**
  - gk_ganhos_s = 14.6 e gk_ganhos_m = 14.5 (bolas altas ganhas por temporada, mediana — a prova de que os dois goleiros ganham o mesmo)
  - gk_perd_s = 0.5 e gk_perd_m = 2.0 (bolas altas perdidas por temporada, mediana)
  - gk_n_s = 16, gk_n_m = 48, gk_n_s_sem = 8, gk_n_m_sem = 32
  - gk_ind_vazios = 7 (dos 12 indicadores, quantos têm mediana zero no gol: faltas, dribles, ações atacantes, gols esperados, assistências esperadas, remates e toques na área)
  - usar gk_s e gk_m arredondados para 97,9 e 87,9
  - tirar do texto gk_d, gk_q e os percentis 71/35 — unidade proibida na camada de leitura; ficam na prova
  - tirar do texto mf_s, mf_m, mf_d e mf_q: o achado do meia cai no mesmo teste de fronteira e não pode sustentar 'a única outra coisa que passou'

### T03-1 — INVERTE  ·  firme → **indício**  ·  esforço: reanalise

**Hoje:** O perfil de jogo não é um traço do treinador: ele não repete em outro clube

**Proposta:** O treinador leva pouca coisa de um clube para o outro — e o clube não segura nem isso

*O que vimos.* Comparei cada treinador consigo mesmo quando trocou de clube, em sete traços do jeito de jogar medidos jogo a jogo, nas {n_pass} passagens de 10 rodadas ou mais de 2022 a 2025. De {multi} treinadores que comandaram dois clubes ou mais, {n_acima} levaram o mesmo jeito de jogar de um para o outro e o acaso previa {esperado_acaso}: o traço do treinador existe, mas é fino — só a distância de onde o time finaliza o acompanha com alguma regularidade ({dist_mesmo_lado} de cada 10 comparações do mesmo lado, contra 5 de cara ou coroa), e no mesmo clube, com treinadores diferentes, a semelhança é ainda menor. É indício porque a régua é curta: a mesma passagem, cortada em jogos pares e ímpares, já concorda consigo mesma em só {meia_meia} dos 7 traços.

*Para o Santa Cruz.* Contratar treinador pelo jeito de jogar do clube anterior é apostar num sinal fino e mal medido, e o estudo não separa o que é do treinador do que é do elenco que ele pegou: serve de desempate entre nomes parecidos, nunca de critério principal. O que vale perguntar na conversa é a distância de onde o time finaliza — é o único traço que acompanha o treinador e é o mesmo que o A14 aponta como o que vem antes do resultado.

*n.* {multi} treinadores em dois clubes ou mais, dentro de {n_pass} passagens de 10 rodadas ou mais ({n_tec} treinadores), 2022–2025; {n_um_par} deles entram com um único par de clubes

*Premissa.* Derruba a premissa nova que o T03 propunha ('na Série B, o perfil de jogo é do clube, não do treinador'): nos pares do mesmo clube com treinadores diferentes a semelhança é 0,072, contra 0,153 do mesmo treinador entre clubes — a metade. A premissa a sugerir é outra: na Série B o jeito de jogar não fica com ninguém de forma estável, nem com o treinador nem com o clube. O J02-1 repete a versão velha como coisa sabida e tem de cair junto.

**Por que esse nível.** (a) BH a 5% na família: NÃO — não existe T03_testes.csv, T03.py não importa _metodo.py e nenhum q foi calculado em lugar nenhum da saída; nada passou porque nada foi corrigido. (b) Porta temporal da §6.4 (1º turno prevendo o 2º, com a parcial): NÃO — o T03 não a rodou, e o _porta_temporal.md confirma que zero das 19 partes rodaram a §6.4. Dois nãos = indício. Registro para o dono: o teste certo, que refiz por conta própria, dá p=0,005 nas fechadas; corrigido por BH numa família de sete traços isso sustentaria 'provável', mas sem a porta nunca chega a 'firme'.

**Números a criar/corrigir:**
  - n_pass, n_tec, multi recalculados só com as fechadas: na minha conferência 126 passagens, 64 treinadores, 28 multiclube (contra 151/69/34 com 2026 dentro)
  - n_um_par: quantos dos multiclube têm um único par entre clubes (15 na base cheia; recontar nas fechadas)
  - n_acima e esperado_acaso pela permutação do rótulo de treinador, não por 34 x 10%: 4 observados contra 1,2 esperados nas fechadas (5 contra 1,7 na base cheia). O 3,4 publicado está errado por um fator de 2 e inverte o sentido da frase. Declarar no rodapé que a linha é o percentil 90 dos pares avulsos (0,609)
  - dist_mesmo_lado: em quantas de cada 10 comparações entre clubes do mesmo treinador a distância da finalização cai do mesmo lado da tabela — 6 em 10 nas fechadas, contra 5 de cara ou coroa
  - meia_meia e o teto da régua: a mesma passagem cortada em jogos pares e ímpares concorda em 3,9 dos 7 traços (Spearman-Brown 0,31 pela mediana, 0,20 pela média). Vai ao texto como contagem e à prova como teto
  - o número do clube (0,072 nas fechadas, 267 pares na base cheia) ao lado do número do treinador, para a premissa
  - T03_testes.csv, que não existe: o p da permutação (0,005 nas fechadas) e BH a 5% na família dos sete traços
  - xgc_casa e dd_casa medidos na passagem, que fecham a régua do A14 e caíram sem justificativa; xg e xg_contra, que entraram no lugar, não pertencem ao índice (xg não está em régua nenhuma, xg_contra só em F_solidez, que o A14 descartou). Declarar no em_aberto a janela de casa de cada passagem
  - conferência de robustez para o texto não vender demais: contando traços do mesmo lado em vez de forma do perfil, são 6 treinadores com 5 ou mais dos 7 coincidindo, contra 3,75 esperados — mesma direção, efeito ainda menor

### A01-1 — REESCREVE  ·  firme → **indício**  ·  esforço: recalculo

**Hoje:** Subir custa {corte_mediana} pontos, e esse número quase não muda

**Proposta:** O acesso custa de {corte_min} a {corte_max} pontos, e quem planeja pelo meio fica de fora

*O que vimos.* O 4º colocado fechou com {corte_por_ano_frase} — nunca menos de {corte_min}, nunca mais de {corte_max}, sempre entre {vit_min} e {vit_max} vitórias. Um elenco montado para {corte_mediana} pontos teria ficado de fora em {anos_falha_63} das {temporadas} temporadas, porque {corte_mediana} não foi o corte de nenhuma delas. São {temporadas} temporadas contadas uma a uma, sem teste e sem leitura à frente do resultado: por isso vale como indício, não como número garantido.

*Para o Santa Cruz.* Montar o elenco contra {corte_max} pontos, e não contra a média: foi o que o 4º precisou em {anos_corte_max} das {temporadas} temporadas, e o ritmo rodada a rodada mede contra esse alvo. A linha de baixo é bem mais frouxa — o 17º ficou entre {corte_z4_min} e {corte_z4_max} —, então o elenco que só escapa do rebaixamento custa bem menos do que o elenco que sobe: são duas decisões de orçamento diferentes, não a mesma com margem.

*n.* {temporadas} temporadas fechadas (2022–2025)

*Premissa.* Sugere premissa nova em dados/premissas.json, no grupo Elenco: o custo do acesso é de 62 a 64 pontos e o planejamento usa o topo da faixa (64), não a média. Nenhuma premissa atual fixa o acesso em pontos (p7 fixa só o objetivo).

**Por que esse nível.** (a) BH a 5% na família: NÃO — não existe resultados/A01_testes.csv, A01.py não importa scripts/_metodo.py e não chama bh() nem cohen_d(); a parte não roda teste nenhum, só contagem e statistics.median, então não há q para conferir. (b) Porta temporal da §6.4 (média das 19 primeiras rodadas × pontos das 19 últimas, em posto, com parcial dada a pontuação do 1º turno): NÃO — o _porta_temporal.md registra que ZERO das 19 partes rodaram a porta, e A01 não está entre as testadas. Nenhum dos dois = indício pela letra do CLAUDE.md:51, e a frase diz por quê (é contagem completa de 4 temporadas, não previsão). Os pareceres que derrubaram o achado 1 do auditor alegam que os dois critérios seriam 'inaplicáveis' a um censo — mas a régua não tem nível para inaplicável, e criar um seria o quarto nível proibido.

**Números a criar/corrigir:**
  - corte_por_ano_frase = "62 (2022), 64 (2023), 64 (2024) e 62 (2025)" — hoje {corte_por_ano} guarda "2022: 62, 2023: 64, ..." e renderiza quebrado no meio da frase, o mesmo defeito que o achado 7 do A01-2 confirmou em {margens}
  - anos_falha_63 = 2 (em 2023 o 5º fez 63 e em 2024 o 5º fez 64 com o 6º em 63: um elenco de 63 pontos não sobe nesses dois anos)
  - anos_corte_max = 2 (o corte foi 64 em 2023 e 2024)
  - corte_z4_mediana: corrigir 39 para 39,5 em A01.json (A01_resumo.json já traz 39,5; achado 10, 2/3) — marcador morto hoje, mas mora no mesmo bloco dos dez que vão à tela
  - Regerar a tabela "A régua, ano a ano" de A01.md a partir de A01_regua.csv: 11 das 32 células estão digitadas à mão e erradas (2022 1º 78; 2023 1º 72, 8º 61, 16º 40, 20º 28; 2024 1º 68, 8º 58, 16º 43, 20º 33; 2025 8º 56, 16º 42) — achado 8, 3/3

### A01-2 — REESCREVE  ·  firme → **indício**  ·  esforço: recalculo

**Hoje:** O acesso se decide por um ponto

**Proposta:** O acesso se decide por um ponto — e o desempate é vitória, não saldo

*O que vimos.* A margem do 4º para o 5º foi de {margens_frase}, e em {anos_ate_1pt} das {temporadas} temporadas ficou em 1 ponto ou menos. Em 2024 Ceará e Novorizontino terminaram os dois com {pontos_4o_2024} pontos, e o acesso saiu na contagem de vitórias — {v_4o_2024} contra {v_5o_2024} —, nunca chegando ao saldo de gols. São {temporadas} temporadas contadas uma a uma, sem teste por trás: por isso vale como indício.

*Para o Santa Cruz.* Um jogo decide o ano, e o critério que desempata premia vitória, não goleada: com pontos iguais, vencer por 1 a 0 vale mais do que golear. O ponto que falta vem de onde o estudo achou diferença — a qualidade da chance criada e a cedida, e a distância de onde se finaliza —, e não de bola parada, que o próprio estudo mostrou não separar quem sobe; fim de jogo não entra porque não há dado para medi-lo.

*n.* {temporadas} temporadas fechadas (2022–2025)

*Premissa.* Confirma m7 (salário baixo, premiação alta por vitória): como o desempate do acesso é vitória e não saldo, o bicho por vitória está alinhado ao critério que de fato decide o ano. Corrige, porém, o uso prático antigo desta conclusão, que apontava bola parada — contradito por A04-1 (firme, n = 80).

**Por que esse nível.** (a) BH a 5% na família: NÃO — A01 não tem arquivo de testes e A01.py não roda teste algum; as margens 4, 1, 0 e 1 são leitura direta de A01_regua.csv. (b) Porta temporal da §6.4: NÃO — não foi rodada em A01 (o _porta_temporal.md diz zero das 19 partes). Nenhum dos dois = indício, e a frase diz por quê: é contagem completa de 4 temporadas. O uso prático existe e é forte (o desempate é vitória), então o nível é indício e não queda.

**Números a criar/corrigir:**
  - margens_frase = "4 (2022), 1 (2023), 0 (2024) e 1 (2025)" — hoje {margens} renderiza "A margem do 4º para o 5º foi de 2022: 4, 2023: 1, 2024: 0, 2025: 1" em static/estudo_serieb_dados.js (achado 7, 3/3)
  - pontos_4o_2024 = 64 — hoje o 64 está digitado à mão dentro do texto, sem marcador (achado 6, 2/3)
  - v_4o_2024 = 19 (Ceará) e v_5o_2024 = 18 (Novorizontino), de A01_clube_temporada.csv — substituem o "18 contra 12" de saldo que está errado em A01.md:25
  - Mesma regeração da tabela "A régua, ano a ano" de A01.md a partir de A01_regua.csv (achado 4, 3/3): as colunas 4º, 5º e margem, das quais esta conclusão depende, estão certas; as outras 11 células, não

### A01-3 — REESCREVE  ·  firme → **indício**  ·  esforço: recalculo

**Hoje:** Metade de quem sobe termina colado na linha — por isso o estudo compara duas vezes

**Proposta:** {sobe_fronteira} dos {sobe_de} que subiram terminaram colados na linha — por isso toda comparação roda duas vezes

*O que vimos.* {sobe_fronteira} dos {sobe_de} promovidos fecharam a 3 pontos ou menos da fronteira do G4, e no total {fronteira_n} de {fronteira_de} clube-temporadas ({fronteira_pct}%) estão colados numa das duas linhas. A Trave (5º a 8º) fechou entre {trave_min} e {trave_max} pontos, mediana {trave_mediana} — {trave_dist_mediana} pontos abaixo do corte do G4 —, e {trave_fronteira} dos {trave_de} casos ficaram a 3 pontos ou menos dele. É contagem das {fronteira_de} clube-temporadas fechadas, e nenhum teste aqui diz se a Trave joga diferente de quem sobe: por isso vale como indício.

*Para o Santa Cruz.* A distância entre subir e ficar na Trave é de {trave_dist_mediana} pontos na mediana, e em {trave_fronteira} dos {trave_de} casos foi de 3 pontos ou menos — perto o bastante para o acaso pesar no que se lê como característica. Por isso toda comparação de faixa deste estudo roda com e sem os times colados na linha, e o que só aparece num dos dois cortes não vira critério de contratação.

*n.* {fronteira_de} clube-temporadas fechadas (2022–2025)

**Por que esse nível.** (a) BH a 5% na família: NÃO — não há teste em A01; a contagem de fronteira sai de A01_clube_temporada.csv. (b) Porta temporal da §6.4: NÃO — não rodada. Nenhum dos dois = indício, e a frase diz por quê. Reforço do achado 1 (3/3): a versão antiga ia além da contagem e afirmava equivalência entre Trave e Sobe ("é o mesmo time com dois pontos a menos"), que é um "não separa" sem poder calculado — A01.py não importa _metodo.py nem chama d_minimo, e onde isso foi testado o desenho só enxerga d ≥ 1,02 (A02_resumo.json). O texto novo fica dentro do que a contagem sustenta.

**Números a criar/corrigir:**
  - trave_mediana: corrigir 60 para 60,5 (mediana dos pontos das 16 linhas com trave=1 e temporada≠2026 em A01_clube_temporada.csv) — achado 2, 3/3
  - trave_dist_mediana: corrigir -2 para 2,5, escrito como "2,5 pontos abaixo do corte do G4" e nunca com o sinal cru (a mediana de dist_g4 é -2,5) — achado 2, 3/3
  - trave_fronteira = 9 e trave_de = 16 (linhas de Trave com fronteira_g4=1 entre as 16 fechadas) — números novos, para substituir a afirmação de equivalência derrubada pelo achado 1
  - A01.py passa a calcular e gravar em A01_resumo.json os seis valores de Trave/Sobe (trave_min, trave_max, trave_mediana, trave_dist_mediana, sobe_fronteira, sobe_de) mais trave_fronteira: hoje eles só existem em A01.json, sem script que os produza — é a causa raiz do 60 e do -2 (achado 5, 3/3)
  - Mesma regeração da tabela "A régua, ano a ano" de A01.md: a coluna do 8º, que é o piso da Trave afirmado aqui, está errada em 3 dos 4 anos (58/59/60 no .md contra 61/58/56 na base) — achado 3, 3/3

### A02-1 — REESCREVE  ·  provável → **firme**  ·  esforço: texto

**Hoje:** Quem sobe não finaliza mais nem sofre menos finalização — finaliza e sofre de outro lugar

**Proposta:** Quem sobe finaliza de mais perto, e isso vem antes dos pontos

*O que vimos.* Quem sobe finaliza a {dist_s_cf} m do gol e o meio a {dist_m_cf} m — quase um metro mais perto em cada chute, com os 20 times e também sem os que estavam colados na linha. Volume não separa: são {rem_s_cf} finalizações por jogo contra {rem_m_cf} do meio, e {remc_s_cf} sofridas contra {remc_m_cf}, diferenças que este número de times não conseguiria enxergar. E o time que já finalizava de perto nas {rod_corte} primeiras rodadas fez mais pontos nas {rod_corte} seguintes, mesmo comparado com quem vinha pontuando igual ({n_turnos} clube-temporadas).

*Para o Santa Cruz.* É a única coisa que este estudo consegue mostrar que vem antes do resultado, e por isso é a que deve guiar o modelo de jogo: chegar à finalização de dentro, em vez de perseguir número de chutes. Na montagem do elenco, isso pede quem ataca a área — atacante que se movimenta nas costas da zaga, meia que chega na área, lateral que entra em vez de cruzar de longe —, e J05 tem de virar isso em requisito de posição, nunca em volume de finalização. Vale a ressalva: a medida vem antes dos pontos dentro da mesma temporada e com o mesmo elenco, é a melhor prova que o estudo tem e não é receita de acesso.

*n.* {n_sobe} promovidos contra {n_meio} do meio (e {n_sobe_sf} contra {n_meio_sf} sem os times colados na linha); {n_turnos} clube-temporadas no teste de anterioridade

*Premissa.* Sugere uma premissa nova: na Série B, de onde se finaliza antecipa pontos; quanto se finaliza, não.

**Por que esse nível.** (a) BH a 5% dentro da família 'o que cria': passa nos dois cortes — q 0,00009 com os 20 times (16x48, d 1,203, poder suficiente) e q 0,02313 sem os de fronteira (8x32). Nada em A02 é firme só COM a fronteira, então a regra da fronteira não descarta nada aqui; ela só obriga a publicar os números do corte cheio. (b) Porta temporal da §6.4: PASSA, e é a única de A02 que passa — parcial +0,289 (p 0,0094) do 1º turno sobre os pontos do 2º, dado o 1º (_porta_temporal.json, 19/09, n=80); é também uma das duas portas A do catálogo da §6.5. Dois sim = firme. A metade defensiva da manchete de hoje ('sofre de outro lugar') sai: lugar do chute sofrido nunca foi pré-declarado nem testado (achado confirmado 3/3).

**Números a criar/corrigir:**
  - dist_s_cf = 19.5 (float; A02_testes.csv, linha com/cria/SM/dist_remate, cru_sobe 19.522)
  - dist_m_cf = 20.5 (cru_alvo 20.472)
  - rem_s_cf = 12.6 (com/cria/SM/remates, 12.618)
  - rem_m_cf = 12.3 (12.28)
  - remc_s_cf = 11.6 (com/cede/SM/remates_contra, 11.618)
  - remc_m_cf = 12.1 (12.053)
  - n_meio_sf = 32 (Meio sem fronteira; hoje o texto usa n_meio = 48 e nenhum teste rodou 8x48)
  - rod_corte = 19
  - n_turnos = 80
  - porta_dist_parcial = 0.289 e porta_dist_p = 0.0094 (só para a prova; _porta_temporal.json)
  - dmin_SM_cf = 0.82 (menor d detectável no corte cheio, para a frase fixa da §6.7)
  - todos gravados como número, não como texto: hoje 36 dos 50 valores de `numeros` são string e chegam à tela como "13.026 vezes por jogo"

### A02-3 — REESCREVE  ·  firme → **provável**  ·  esforço: recalculo

**Hoje:** Pontaria e goleiro não são característica de quem sobe: não se repetem

**Proposta:** Quem sobe faz mais gol do que a chance pedia — e essa sobra não se compra

*O que vimos.* Quem sobe faz {fin_s_cf} gol por jogo a mais do que as chances pediam e o meio fica {fin_m_cf} abaixo — cerca de {fin_gols_temporada} gols de diferença numa temporada inteira, a maior de toda a lista e a única coisa que separa quem sobe dos times de 5º a 8º. Do lado do goleiro não há nada: quem sobe leva {def_s_cf} gol por jogo a menos do que as chances pediam e o meio {def_m_cf}. A sobra da primeira metade do ano quase não tem relação com a da segunda, mas a régua que a mede em meia temporada é quase toda ruído — o estudo não tem prova de que ela se repita, o que não é o mesmo que prova de que ela não se repete.

*Para o Santa Cruz.* Não se contrata pontaria e não se aposta em ano de goleiro inspirado: essa sobra é o placar contado de outro jeito, e o método da casa proíbe usá-la como característica de quem sobe. O que se procura é o que produz a chance boa e o que reduz a chance cedida — finalizar de perto e proteger a área. E fica o aviso ao contrário: como a régua é curta, ninguém pode usar este estudo para dizer que a sobra é pura sorte; ele só mostra que não dá para comprá-la.

*n.* {n_sobe} promovidos contra {n_meio} do meio (e {n_sobe_sf} contra {n_meio_sf} sem os times colados na linha); {n_sobe} contra {n_trave} no recorte de 5º a 8º; {n_turnos} clube-temporadas na comparação entre as duas metades do ano

*Premissa.* Ajusta m4 (Goleiro top — investir): o time defender acima do que as chances pediam não separa quem sobe do meio e não tem relação de uma metade do ano para a outra. A premissa continua de pé por outros motivos, mas não pode se apoiar neste estudo — ele mede o time, não a qualidade do goleiro.

**Por que esse nível.** (a) BH a 5% dentro da família 'a sobra': passa nos dois cortes — q 0,00004 com os 20 times (d 1,257, poder suficiente contra um mínimo de 0,82) e q 0,03972 sem os de fronteira; é o único indicador de A02 que separa quem sobe dos times de 5º a 8º, também nos dois cortes (q 0,00144 e q 0,03821). (b) Porta temporal da §6.4: NÃO passa, porque nunca foi rodada para este indicador — o que A02.py chama de porta_temporal é persistência dentro da temporada (_porta_temporal.md, 19/09, 'achado zero'), e esse teste não tem poder: o menor rho que ele enxergaria a 80% com n=80 é 0,31 e o observado foi 0,19; além disso a confiabilidade da sobra medida em meia temporada é ~0,07. Um sim de dois = provável — e o selo 'firme' de hoje é insustentável porque se apoiava justamente na metade que não se sustenta. Resultado negativo, vai para 'Parece, mas não é'.

→ vai para **"Parece, mas não é"**.

**Números a criar/corrigir:**
  - fin_s_cf = 0.05 e fin_m_cf = 0.17 (com/sobra/SM/finalizacao, +0.053 e −0.169 — a troca de corte INVERTE o sinal do promovido: hoje a tela diz −0,052, ou seja o promovido convertendo ABAIXO do xG, o contrário do que o próprio uso prático afirma)
  - fin_gols_temporada = 8 (0,222 por jogo x 38 jogos = 8,4)
  - def_s_cf = 0.20 e def_m_cf = 0.17 (com/sobra/SM/defesa_vs_xg, 0.204 e 0.166)
  - conf_fin = 0.07 — NÃO existe no repositório: split-half da §3 para gols menos xG, tem de ser rodado e gravado (é o que sustenta a frase 'quase toda ruído')
  - rho_min_80 = 0.31 — NÃO existe: menor rho detectável a 80% por Fisher z com n=80, para a frase fixa da §6.7 aplicada ao teste de repetição
  - persist_fin = 0.19 (já existe como porta_fin 0.191; renomear, porque não é porta e sim persistência)
  - n_trave = 16 (já existe)

### A03-1 — REESCREVE  ·  firme → **indício**  ·  esforço: recalculo

**Hoje:** Nenhum time depende de casa mais que os outros

**Proposta:** Depender de casa não separa quem sobe de quem fica no meio

*O que vimos.* Em toda a Série B, jogar em casa vale {dif_liga} ponto por jogo a mais do que jogar fora. Essa distância é parecida nas faixas também fora do placar: a diferença casa-fora de quem sobe é {dif_xg_sobe} de xG criado contra {dif_xg_meio} do meio, {dif_xgc_sobe} de xG sofrido contra {dif_xgc_meio}, e {dif_dd_sobe} ponto percentual de dividida contra {dif_dd_meio}. Fica em indício: nenhum dos {asm_testes} testes de casa-menos-fora tinha amostra para enxergar diferenças desse tamanho, e ninguém checou se depender de casa vem antes ou depois do resultado.

*Para o Santa Cruz.* Não montar elenco atrás de 'time forte fora': a diferença de mando não separou as faixas, e este desenho também não garante que ela não exista — são coisas diferentes. O que dá para usar é o tamanho da vantagem de casa da liga, cerca de {dif_liga} ponto por jogo para qualquer time, no planejamento de calendário e viagem. E a leitura de mando sai marcada: pode ser efeito do placar, porque quem joga fora passa mais tempo atrás.

*n.* 80 clube-temporadas

*Premissa.* Sugere premissa nova em Montagem do elenco: a vantagem de casa é da liga (cerca de 0,79 ponto por jogo) e não distingue faixa — 'ser forte fora' não é perfil de elenco a procurar. Toca m6 (logística diferenciada para a Série B) sem confirmá-la: esta parte não mediu viagem nem descanso.

**Por que esse nível.** (a) BH a 5% na família dela? NÃO. A família assimetria tem 24 linhas em A03_testes.csv e ZERO com selo firme; o menor q é 0,14282 (ST, dif_xgc, corte com). A conclusão é a própria ausência, e ausência não é aprovação em BH. (b) Porta temporal da §6.4? NÃO. A03.py não calcula porta nenhuma, embora A03_indicadores.json a tenha declarado em criterio.porta_temporal; a rodada de 19/09 só cobriu os oito componentes do A14. Nenhum dos dois = indício, e a frase tem de dizer por quê: as 24 linhas trazem poder_suficiente=False, com |d| máximo 0,778 contra d mínimo de 0,82 (16x48), 0,97 (12x32), 1,02 (16x16) e 1,14 (8x32) — é o caso exato da §6.7, 'não separa' significa 'este desenho não conseguiria ver'.

→ vai para **"Parece, mas não é"**.

**Números a criar/corrigir:**
  - dif_xg_sobe = 0.419 e dif_xg_meio = 0.387 (A03_testes.csv, fronteira=com, familia=assimetria, comparacao=SM, indicador=dif_xg: cru_a e cru_b)
  - dif_xgc_sobe = 0.447 e dif_xgc_meio = 0.391 (mesma linha, indicador=dif_xgc)
  - dif_dd_sobe = 0.887 e dif_dd_meio = 1.164 (mesma linha, indicador=dif_dd)
  - d_min_com = 0.82, d_min_sem = 1.14 e maior_d_asm = 0.778, só para a prova (A03_resumo.json.poder_por_desenho e A03_testes.csv)
  - aposentar do texto asm_p_welch e asm_p_sem (viram prova) e apagar do motivo o Mann-Whitney, que nenhum script calcula; os valores novos entram como float, nunca string

### A03-2 — REESCREVE  ·  firme → **provável**  ·  esforço: recalculo

**Hoje:** A vantagem defensiva de quem sobe aparece igual dentro e fora de casa

**Proposta:** Quem sobe ganha mais dividida dentro e fora, mas só sofre menos perigo em casa

*O que vimos.* Contra o meio, quem sobe ganha {dd_casa_s}% das divididas defensivas em casa, contra {dd_casa_m}%, e {dd_fora_s}% fora, contra {dd_fora_m}% — a vantagem aparece nos dois mandos e resiste a tirar os times colados na linha. Em casa, quem sobe cede {xgc_casa_s} de xG por jogo contra {xgc_casa_m} do meio; fora a diferença encolhe para {xgc_fora_s} contra {xgc_fora_m} e só reaparece no corte mais frágil, o que tira esses times. O xG é a medida menos confiável do estudo, e o que se vê fora pode ser efeito do placar.

*Para o Santa Cruz.* Ganhar a dividida defensiva é requisito de jogador na hora de contratar: é o único traço desta parte que aparece dentro e fora de casa, com e sem os times colados na linha, e confirma o que o A06 já apontava. Ceder pouco perigo só se sustenta em casa: trate como modelo de jogo, não como requisito individual. E não escreva que o traço é do jogador e não do ambiente — sem recorte por estado do jogo, esta parte não consegue separar as duas coisas.

*n.* 16 promovidos contra 48 do meio, e 8 contra 32 sem os times colados na linha

*Premissa.* Sugere premissa nova em Montagem do elenco: ganhar a dividida defensiva é requisito de jogador, porque é o traço que viaja — aparece dentro e fora de casa. Não contradiz m1 (time físico): intensidade física não foi medida nesta parte.

**Por que esse nível.** (a) BH a 5% na família dela? SIM, e nos dois cortes de fronteira: xgc_casa q 0,02731 (com) e 0,00000 (sem); dd_casa 0,02614 e 0,00131; dd_fora 0,03030 e 0,00286. (b) Porta temporal da §6.4? NÃO. A rodada de 19/09 testou os dois componentes desta conclusão e os dois reprovaram: xgc_casa parcial +0,134 (p 0,236) e dd_casa parcial −0,026 (p 0,818); dd_fora não foi rodado, e o duelo defensivo inteiro do A06 também reprovou (parcial +0,092, p 0,416). Um sim e um não = provável. Duas ressalvas que ficam no motivo: com n=80 a parcial detectável é ~0,31, então reprovar não prova que o traço venha depois do resultado; e o xG tem confiabilidade medida 0,30, abaixo do piso de 0,40 que manda hachurar o indicador.

**Números a criar/corrigir:**
  - xgc_casa_s = 0.80 e xgc_casa_m = 1.02 — corte COM fronteira (16x48); os atuais 0,736 e 1,026 são do corte sem, enquanto o n abre com 16x48
  - dd_casa_s = 60.9, dd_casa_m = 60.1, dd_fora_s = 60.6, dd_fora_m = 59.6 (corte com, em % de dividida ganha) — substituem os quatro d de Cohen que hoje estão no texto
  - xgc_fora_s = 1.29 e xgc_fora_m = 1.36 (corte com)
  - conf_xg = 0.3 (A02.json.numeros.conf_xg), para a ressalva de confiabilidade abaixo de 0,40
  - aposentar dd_casa_com, dd_casa_sem, dd_fora_com, dd_fora_sem e xgc_fora_com_selo, que levam d e selo para dentro do texto

### A04-1 — REESCREVE  ·  firme → **indício**  ·  esforço: recalculo

**Hoje:** Bola parada não separa quem sobe — nem no gol, nem no processo, nem no jogo aéreo

**Proposta:** Bola parada não é o que faz subir: nada do trabalho separa quem sobe do meio, e o que separa é gol — que já é o placar

*O que vimos.* Dos {n_ind_carac} sinais de trabalho de bola parada — bolas paradas e escanteios por jogo, finalizações de escanteio, finalizações de falta, conversão, cruzamentos, duelo aéreo e altura do elenco —, nenhum separa os {n_sobe_com} que sobem dos {n_meio_com} do meio, nem com todos os times, nem tirando os {n_sobe_sf} e {n_meio_sf} que sobram quando se deixam de fora os colados na linha. O que aparece é o gol: quem sobe termina a temporada com cerca de {saldo_sobe_38} gols de bola parada a mais do que sofre e o meio termina empatado — só que gol é o placar contado de outro jeito, e essa vantagem some quando se tiram os times colados na linha. Com esse tamanho de amostra só uma diferença muito grande seria vista: "não separa" aqui significa "este desenho não conseguiria ver".

*Para o Santa Cruz.* Treinar bola parada não é o caminho do acesso — e o estudo também não mostra que abandoná-la custe o acesso. Na montagem do elenco, altura e duelo aéreo de linha não entram como requisito de acesso; a exceção, dita aqui para as duas frases não se contradizerem, é o goleiro, onde o J03 achou o maior efeito individual do estudo justamente na bola aérea disputada. O tamanho do fenômeno, que continua grande, está na conclusão descritiva ao lado: é volume de treino, não critério de contratação.

*n.* {n_sobe_com} promovidos contra {n_meio_com} do meio; sem os times colados na linha, {n_sobe_sf} contra {n_meio_sf}. A comparação com a trave (5º–8º) fica sem resposta nesta parte.

*Premissa.* Sugere registrar uma premissa nova: a régua G da Protótipo (bola aérea e parada) não tem sustentação como separadora de quem sobe — nenhum dos seus três itens passa em Sobe × Meio, nos dois cortes.

**Por que esse nível.** (a) BH a 5% dentro da família, em Sobe × Meio: NÃO. Conferi as 26 linhas SM do A04_testes.csv: dos 8 indicadores de trabalho (5 de processo + 3 da régua G) nenhum passa em nenhum dos dois cortes — o mais perto é a altura do elenco, q 0,143 com fronteira e 0,265 sem. Os dois que passam com fronteira (bp_pro_90 q 0,024 e bp_saldo_90 q 0,0023) são da família gol_bp, pré-declarada em A04_indicadores.json como placar redescrito, e caem no corte sem (q 0,294 e 0,053). (b) Porta temporal da §6.4: NÃO. Nunca rodou nesta parte (grep 'porta' em scripts/A04.py = 0), embora A04_indicadores.json a tivesse prometido para o processo. Nenhum dos dois ⇒ indício, e a frase diz por quê: com 16 contra 48 o desenho só enxerga d ≥ 0,82, e com 8 contra 32, d ≥ 1,14. A perna Sobe × Trave sai da conclusão: no corte com os 80 times ela tem dois firmes na régua G (duelo aéreo q 0,019 e altura q 0,025) que morrem no corte de 8 contra 7, onde o mínimo detectável sobe para 1,57 — exatamente o desenho que o _metodo_fronteira.md declara enviesado e que o A02 já declarou sem resposta.

→ vai para **"Parece, mas não é"**.

**Números a criar/corrigir:**
  - n_ind_carac = 8 (os indicadores de trabalho: 5 de processo + 3 da régua G; separa-os dos 5 de gol, que são placar redescrito)
  - n_sobe_com = 16 e n_meio_com = 48 (corte com fronteira)
  - n_sobe_sf = 8 e n_meio_sf = 32 (já existem em A04_resumo.json.n, faltam em numeros)
  - saldo_sobe_38 = 5,5 (0,145 gol por jogo × 38 jogos)
  - dmin_sm_com = 0,82 e dmin_sm_sem = 1,14 (só para o confianca_motivo e a prova, nunca para o o que vimos)
  - aposentar sm_firmes_dois e st_firmes_dois: o primeiro vira n_ind_carac_firmes = 0 e o segundo sai com a perna da trave

### A04-2 — REESCREVE  ·  firme → **indício**  ·  esforço: recalculo

**Hoje:** Um terço dos gols da Série B sai de bola parada, e essa fatia é igual para todos

**Proposta:** Um em cada três gols da Série B sai de bola parada — e não achamos faixa que dependa mais dela

*O que vimos.* Na liga, {liga_pct}% dos gols de um time vêm de bola parada: {liga_bp90} gol por jogo, cerca de {liga_bp_38} gols numa temporada de 38 jogos. A mediana fica perto disso em todas as faixas — {sobe_pct}% dos {n_sobe_com} que sobem, {meio_pct}% dos {n_meio_com} do meio e {cai_pct}% dos {n_cai_com} que caem (a trave, {trave_pct}%, são {n_trave} times de dentro do próprio meio, não uma quarta faixa). Entre clubes a variação é enorme, de {pct_min}% a {pct_max}%, com metade entre {pct_q1}% e {pct_q3}% — e este desenho só enxergaria uma diferença muito grande entre faixas: "não separa" significa "este desenho não conseguiria ver".

*Para o Santa Cruz.* É o número para dimensionar o trabalho de bola parada: um em cada três gols, cerca de {liga_bp_38} por temporada. O maior pedaço é o escanteio — {tot_esc} dos {tot_bp} gols de bola parada em quatro temporadas, contra {tot_pen} de pênalti e {tot_falta} de falta —, então é onde o tempo de treino rende mais; somados, porém, pênalti e falta pesam mais que o escanteio, e pênalti não se treina como bola parada. Não é o que separa quem sobe (ver a conclusão ao lado), mas é grande demais para tratar como detalhe.

*n.* {n_total} clube-temporadas, todas de 38 jogos: {n_sobe_com} que sobem, {n_meio_com} do meio (dos quais {n_trave} são a trave) e {n_cai_com} que caem

*Premissa.* Ajusta a premissa p15 ("O Wyscout não marca a origem do gol"): ela continua verdadeira para o Wyscout e para o dado de jogador, mas dados/bola_parada.json traz a origem do gol por time na Série B de 2022 a 2026 (escanteio, falta direta, falta indireta, lateral e pênalti, pró e contra). A premissa deve dizer onde a origem existe e onde não existe.

**Por que esse nível.** (a) BH a 5%: NÃO. O indicador que sustenta a frase é bp_pro_pct (a fatia dos gols que vem de bola parada) e ele tem selo "sem diferença clara" nas seis linhas do A04_testes.csv — q de 0,4899 (ST sem) a 0,97994 (CM com); nenhuma passa a 5%. (b) Porta temporal da §6.4: NÃO. A base de bola parada é agregada por trabalho (treinador + time + competição) e não tem jogo a jogo, como o próprio A04_indicadores.json declara. Nenhum dos dois ⇒ indício. O antigo confianca_motivo já admitia isso ao dizer "descrição, não teste", mas a tela imprime só a palavra "firme" (static/estudo_serieb.js:34-36 põe o motivo no title=), igualando esta frase às que passaram no critério. E a metade da manchete que dizia "igual para todos" é um "não separa" num desenho que só veria d ≥ 0,82 com fronteira e d ≥ 1,14 sem: ela precisa da ressalva fixa da §6.7.

**Números a criar/corrigir:**
  - n_sobe_com = 16, n_meio_com = 48, n_cai_com = 16, n_trave = 16 (e a nota de que a trave está dentro do meio: 16+48+16 = 80, não 96)
  - liga_bp_38 = 14 (0,368 gol por jogo × 38)
  - pct_min = 16,3 · pct_q1 = 27,1 · pct_q3 = 39,5 · pct_max = 60,7 (dispersão de bp_pro_pct entre os 80 clube-temporadas; refiz e confere)
  - tot_esc = 438 · tot_pen = 312 · tot_falta = 294 · tot_lat = 47 · tot_bp = 1091 (totais do recorte, que somam; as medianas 5/4/4 do texto atual não somam e por isso não sustentam a frase do escanteio)
  - os marcadores novos entram como número, não como string: o gerador (gerar_estudo_serieb_js.py:100-104) só troca ponto por vírgula em float, e A04 já publica 12 decimais em texto cru

### A04-3 — REESCREVE  ·  provável → **provável**  ·  esforço: recalculo

**Hoje:** Quem cai perde a bola parada dos dois lados

**Proposta:** Quem cai perde no alto: o duelo aéreo é a única coisa desta parte que separa quem desce

*O que vimos.* Quem cai ganha {c_aer_com}% dos duelos aéreos contra {c_aer_m_com}% do meio — cerca de {c_aer_dif} ponto a menos, nos {n_cai_com} rebaixados contra os {n_meio_com} do meio. No gol, quem cai faz {c_pro_com} gol de bola parada por jogo contra {c_pro_m_com} do meio e sofre {c_sof_com} contra {c_sof_m_com}, mas perde gol de bola parada na mesma proporção em que perde gol de qualquer origem: é o placar contado de outro jeito, não um traço de bola parada. O trabalho não muda de faixa para faixa — quem cai cobra {cai_cantos} escanteios por jogo contra {meio_cantos} do meio, e a fatia dos seus gols que vem de bola parada é a mesma das outras faixas.

*Para o Santa Cruz.* Treinar bola parada não aparece como proteção contra a queda: quem cai cobra os mesmos escanteios e tira a mesma fatia de gols dela que o meio. O que separa é ganhar a bola no alto — para um clube que precisa primeiro não cair, o duelo aéreo entra como requisito de elenco, e a altura não entra junto: ela não separa quem cai do meio. É o único indicador não-placar desta parte que separa quem desce.

*n.* {n_cai_com} rebaixados contra {n_meio_com} do meio; sem os times colados na linha, {n_cai_sf} contra {n_meio_sf}

*Premissa.* Sugere uma premissa nova para a montagem do elenco: para não cair, o requisito é ganhar o duelo aéreo, não ser alto — a altura média do elenco não separa quem cai do meio, e o duelo aéreo separa.

**Por que esse nível.** (a) BH a 5% dentro da família, em Cai × Meio: SIM. duelos_aereos_pct passa na família régua_G nos dois cortes — q 0,01262 com os 80 times (16 contra 48) e q 0,00121 sem os colados na linha (12 contra 32). Ressalva honesta: no corte com, o efeito fica rente ao que o desenho enxerga (0,80 contra um mínimo de 0,82) e só no corte sem fica claramente acima (1,16 contra 0,97). (b) Porta temporal da §6.4: NÃO. Não rodou nesta parte — e aqui, ao contrário do gol de bola parada, ela É rodável: serieb_jogos.csv tem "Duelos aéreos ganhos" por jogo. Um sim e um não ⇒ provável. O motivo antigo justificava o "provável" por outro caminho (a lista branca do placar); esse argumento continua valendo, mas como segunda ressalva, não como a régua.

**Números a criar/corrigir:**
  - trocar TODOS os valores do texto pelo corte com fronteira: c_aer_com = 44,343 · c_aer_m_com = 46,147 · c_pro_com = 0,276 · c_pro_m_com = 0,342 · c_sof_com = 0,447 · c_sof_m_com = 0,355 · c_sal_com = -0,132 · c_sal_m_com = 0,000 (os atuais 43,517/46,485/0,316/0,461/-0,184 são do corte de 12 contra 32)
  - c_aer_dif = 1,8 (a diferença cai de 3,0 para 1,8 ponto ao sair do corte sem fronteira)
  - cai_cantos = 5,026 e meio_cantos = 5,145 (escanteios por jogo, corte com, para sustentar que o trabalho não muda)
  - n_cai_com = 16 · n_meio_com = 48 · n_cai_sf = 12 · n_meio_sf = 32 (hoje o n está digitado à mão e diz 16 contra 48 com números de 12 contra 32)
  - tirar d e q do o que vimos (aparecem 4 e 1 vez) e deixá-los só no confianca_motivo e na prova; e alinhar o A04.md, que hoje publica os mesmos números do corte errado

### A05-2 — REESCREVE  ·  firme → **indício**  ·  esforço: recalculo

**Hoje:** Times sobem com estilos opostos — e no mesmo ano

**Proposta:** Dá para subir com menos da metade da bola — mas quem fez isso subiu raspando

*O que vimos.* {n_pouca_bola} dos {n_sobe} promovidos ficaram com menos da metade da bola — Chapecoense ({posse_min}%), Remo, Criciúma e Ceará — e os quatro subiram a até {pts_raspando} pontos do 5º colocado. Os {sobe_folga} que subiram com folga tiveram todos mais da metade da bola, de {posse_folga_min}% a {posse_folga_max}%. São casos contados, não teste: por isso isto é indício.

*Para o Santa Cruz.* Subir jogando sem a bola é possível, e o Santa Cruz não precisa copiar modelo de posse para buscar o acesso. Mas, nos quatro casos em que aconteceu, o acesso veio por três pontos ou menos — é o caminho apertado, não o caminho barato. Se o modelo for sem a bola, o que o time cede e o duelo (A02 e A06) têm de estar impecáveis, porque não sobra margem.

*n.* 16 promovidos de 2022 a 2025; 4 com menos da metade da bola

*Premissa.* Ajusta a premissa sugerida em A05-1: o desempate pela posse vale enquanto não custar o lado defensivo; ter pouca bola não impede o acesso, mas nos casos observados ele veio sempre por margem mínima.

**Por que esse nível.** (a) BH a 5% na família: NÃO. Nenhuma linha de teste sustenta esta conclusão — ela não é um teste, é uma descrição de dispersão. E a prova que o texto atual usa não se sustenta: a amplitude cresce com o n (16 linhas contra 48), e sem o Cruzeiro 2022 a amplitude do Sobe cai de 14,1 para 7,3 pontos. (b) Porta temporal: NÃO — a parte nunca a rodou, e uma dispersão não tem efeito a testar. Nenhum dos dois = indício, e a frase diz por quê: é contagem de casos. O núcleo descritivo é o que sobrevive, e sobrevive inteiro — a auditoria recalculou a base e os valores dos promovidos um a um reproduzem exatos. O que muda é o sentido: os quatro promovidos com menos da metade da bola (Chapecoense 47,4%, Remo 48,1%, Criciúma 48,6%, Ceará 49,6%) são todos times que terminaram a até três pontos do 5º colocado, e os oito que subiram com folga tiveram todos mais da metade da bola (de 50,1% do Grêmio a 61,6% do Cruzeiro). Some-se que 10 dos 16 promovidos estão no terço de cima de posse do próprio ano contra 5,3 esperados por acaso — o marcador topo_posse = 8 está errado (8 é o corte de 30%, não o terço) e o 'só' antes dele inverte o sentido da frase.

**Números a criar/corrigir:**
  - n_pouca_bola = 4 (promovidos com menos de 50% de posse)
  - posse_min = 47,4 (Chapecoense 2025, a menor posse entre os promovidos)
  - sobe_folga = 8 (promovidos que não terminaram a três pontos ou menos do 5º)
  - posse_folga_min = 50,1 (Grêmio 2022)
  - posse_folga_max = 61,6 (Cruzeiro 2022)
  - pts_raspando = 3 (distância ao 5º colocado que define o time de fronteira)
  - CORRIGIR topo_posse de 8 para 10 (promovidos no terço de cima de posse do próprio ano) — ou aposentar, porque a frase nova não o usa
  - APOSENTAR posse_sobe_amp (14,136) e posse_meio_amp (13,782): amplitude compara 16 linhas com 48 e depende de um clube-temporada só
  - Se o exemplo Coritiba × Chapecoense for mantido em algum lugar, usar valor bruto (Coritiba 52,3% de posse e 84,8% de passe certo; Chapecoense 47,4% e 14,1% de passe longo) e tirar contra-ataques, cuja confiabilidade medida é 0,36, abaixo do corte de 0,40

### A05-3 — REESCREVE  ·  firme (dentro de A05-1) → **indício**  ·  esforço: recalculo

**Hoje:** (não existe hoje — é o que resta de A05-1, que hoje afirma 'Não existe estilo com bola que separe quem sobe' e leva a parte inteira embora)

**Proposta:** Fora ter a bola, nenhum outro jeito de construir separa quem sobe

*O que vimos.* Dos {n_ind} traços com bola medidos, {n_nao_separam} não separam quem sobe do meio: volume e acerto de passe, passe longo, comprimento do passe, passe para frente, passe progressivo, passe no terço final, ataque posicional e contra-ataque. Com {n_sobe} promovidos contra {n_meio} do meio, porém, só diferença grande apareceria — 'não separa' quer dizer 'este desenho não conseguiria ver'. Por isso isto é indício, e não prova de que esses traços não importam.

*Para o Santa Cruz.* Não vale pagar a mais por time que passa muito, passa certo ou ataca posicionado: nada disso apareceu como marca de quem sobe. Também não vale o contrário — com quatro anos de Série B, só uma diferença grande seria vista. Tratar como neutro na hora de escolher treinador e jogador, nunca como defeito.

*n.* 16 promovidos contra 48 do meio, em 80 clube-temporadas de 2022 a 2025

*Premissa.* Nenhuma premissa existente é tocada. Registra, para o _registro.md, que a régua A (posse e construção) da Protótipo se sustenta por um item só — a posse — e não pelos outros nove.

**Por que esse nível.** (a) BH a 5% na família: NÃO, em nenhum dos nove indicadores e em nenhum dos dois cortes. O melhor deles em Sobe × Meio fica em q 0,1045 (passes por jogo, corte sem fronteira); em Sobe × Trave não há nenhum selo firme em corte algum. (b) Porta temporal da §6.4: NÃO. Dos nove, só dois chegaram a ser perguntados pela tabela da §6.4 e reprovaram — passes certos (parcial +0,173, p 0,125) e passe longo (parcial −0,152, p 0,179); os outros sete nunca foram testados. Nenhum dos dois = indício, e a frase tem de dizer por quê: o desenho não tinha poder para ver o que declara ausente — d mínimo 0,82 com 16 promovidos contra 48 do meio e 1,14 no corte sem fronteira, e o maior efeito de todo o arquivo é 0,869. É a §6.7 ao pé da letra: 'não separa' significa 'este desenho não conseguiria ver'. Esta conclusão existe para que o resultado negativo não desapareça quando o A05-1 inverte: sem ela, A05 sai de 'Parece, mas não é' e o estudo perde a informação de que nove dos dez traços não marcam quem sobe.

→ vai para **"Parece, mas não é"**.

**Números a criar/corrigir:**
  - n_nao_separam = 9 (dos 10 indicadores da lista pré-declarada, os que não separam Sobe de Meio em nenhum dos dois cortes)
  - n_ind = 10 (já existe)
  - n_sobe = 16 e n_meio = 48 (compartilhados com A05-1)
  - d_min_com = 0,82 e d_min_sem = 1,14 (já em A05_resumo.json, poder_por_desenho; só para a prova, nunca no texto de 2 minutos)

### A06-1 — REESCREVE  ·  firme → **provável**  ·  esforço: texto

**Hoje:** Quem sobe não pressiona mais alto — ganha mais duelo no chão

**Proposta:** Quem sobe ganha mais a dividida no chão — sobre pressão alta, o estudo não consegue decidir

*O que vimos.* Com todos os times na conta, quem sobe ganha {dd_s_com}% das divididas no chão contra {dd_m_com}% do meio, cerca de uma dividida a mais ganha a cada cem disputadas, e a vantagem continua quando se tiram os times colados na linha ({dd_s_sem}% contra {dd_m_sem}%). Sobre pressão alta o estudo não decide: quem sobe deixa o adversário dar {ppda_s_com} passes por ação defensiva contra {ppda_m_com} do meio, recuperações ({rec_s_com} contra {rec_m_com} por jogo) e intensidade ({int_s_com} contra {int_m_com}) ficam praticamente empatadas, e essas diferenças são pequenas demais para um estudo de {n_sobe_com} promovidos enxergar — o pouco que aparece aponta para quem sobe pressionar mais, não menos. Pode ser efeito do placar: pressão e intensidade mudam conforme o time está ganhando ou perdendo, e a base não permite separar isso; e elenco valioso tende a pressionar alto, coisa que o estudo não separa da pressão em si.

*Para o Santa Cruz.* O time que sobe ganha mais a divisão no chão; se isso vem do jogador ou da organização, o A06 não decide — e o J03 já testou duelo defensivo por posição e não achou requisito individual em nenhuma. Então entra como exigência de modelo de jogo e de treino da disputa, e não como motivo para pagar caro num zagueiro que ganha duelo. Comprar sistema de pressão alta é o que este estudo menos sustenta: nem a favor nem contra.

*n.* {n_sobe_com} promovidos contra {n_meio_com} do meio, com todos os times; {n_sobe_sf} contra {n_meio_sf} sem os colados na linha

*Premissa.* Sugere uma premissa nova: na Série B a disputa da bola no chão separa mais quem sobe do que o sistema de pressão — e vale no nível do time, não no do jogador, porque o J03-2 testou por posição e reprovou.

**Por que esse nível.** (a) BH a 5% dentro da família do duelo: PASSA, e nos dois cortes — q 0,02556 com a fronteira e q 6e-05 sem (A06_testes.csv, linhas com/duelo/SM e sem/duelo/SM). (b) Porta temporal da §6.4: REPROVA — o duelo defensivo do 1º turno não prevê os pontos do 2º depois de descontar os pontos do 1º turno (ρ +0,121 p 0,286; parcial +0,092 p 0,416, _porta_temporal.md §6). O que o A06 chamava de porta era a auto-repetição do indicador entre as duas metades da temporada (rho 0,319), critério que a §6.5 aposentou em 15/09 e nome que ela proíbe. Um sim e um não = provável. A metade negativa da manchete (pressão) não passa em nenhum dos dois critérios e por isso deixa de ser afirmação e vira ressalva: com 16 contra 48 o desenho só enxerga efeito acima de d 0,82, os três indicadores de pressão ficam abaixo disso, e o PPDA aponta para quem sobe pressionar MAIS nos dois cortes (9,69 contra 10,13 com fronteira; 9,46 contra 10,26 sem). Ressalva do próprio teste temporal: com 80 clube-temporadas a parcial detectável fica em torno de 0,31, então reprovar é falta de prova de anterioridade, não prova de ausência.

**Números a criar/corrigir:**
  - dd_s_com = 60.77 (float; A06_testes.csv com/duelo/SM cru_a)
  - dd_m_com = 59.79 (float; com/duelo/SM cru_b)
  - dd_s_sem = 61.67 (float; hoje está como string '61.672' e sai '61.672%' na tela)
  - dd_m_sem = 59.89 (float; sem/duelo/SM cru_b)
  - dd_q_com = 0.02556
  - dd_ic_com = '+0,18 a +1,52'
  - ppda_s_com = 9.69 / ppda_m_com = 10.13 (float)
  - rec_s_com = 78.38 / rec_m_com = 77.92 (float)
  - int_s_com = 15.69 / int_m_com = 15.55 (float)
  - n_sobe_com = 16 / n_meio_com = 48
  - dmin_SM_com = 0.82 (float; hoje só existe dmin_SM = '1.14', que é o corte reduzido)
  - porta_dd_parcial = 0.092 / porta_dd_p = 0.416 (_porta_temporal.md §6; só no confianca_motivo e na prova)
  - Apagar do JSON porta_ppda, porta_rec, porta_int e porta_dd 0,319: são persistência entre metades, não a porta — renomear para persistencia_* se forem ficar

### A06-2 — REESCREVE  ·  indício → **indício**  ·  esforço: recalculo

**Hoje:** Contra a trave, o duelo defensivo é a única pista — mas depende do corte

**Proposta:** Contra quem parou na trave, a dividida no chão é a única pista — e ela depende de quais times entram na conta

*O que vimos.* Tirando os times colados na linha, quem sobe ganha {dd_s_sem}% das divididas no chão contra {ddt_t_sem}% de quem parou entre 5º e 8º; com todos os times na conta a diferença encolhe e o teste não decide. É indício porque esse corte tira {n_trave_sai} dos {n_trave} times da trave e tira os mais fortes (mediana de {pts_trave_sai} pontos nos que saem contra {pts_trave_fica} nos que ficam), enquanto do lado de quem sobe ele tira os mais fracos: compara um grupo reforçado com um enfraquecido e infla a diferença por construção. E porque sobram {n_sobe_sf} times de um lado contra {n_trave_sf} do outro, tamanho em que só uma diferença enorme apareceria.

*Para o Santa Cruz.* Segue sendo a pista mais concreta para o degrau da trave, mas não decide contratação sozinha: quem sustenta a disputa no chão é o A06-1, que vale com todos os times na conta. Contra a trave, o único indicador que separa nos dois cortes é a pontaria (gols acima do esperado), que é o placar redescrito e não prevê o turno seguinte. Ou seja: o degrau entre subir e parar em 5º não está, na base deste estudo, no que se mede sem bola.

*n.* {n_sobe_sf} contra {n_trave_sf}, sem os times colados na linha

**Por que esse nível.** (a) BH a 5%: passa em UM corte só — q 0,00379 sem a fronteira, mas q 0,06438 com todos os times, que na chave da casa é 'sem diferença clara' (o texto atual diz 'pode ser sorte', que exige p < 0,05: é um degrau acima do medido). A convenção da casa é firme = firme nos dois cortes (_metodo_fronteira.md, A03-2, A07), então não passa. (b) Porta temporal da §6.4: reprova (parcial +0,092, p 0,416). Nenhum dos dois = indício, e a frase diz por quê: o achado só existe no corte que tira 9 dos 16 times da trave, justamente os mais fortes (mediana 63 pontos nos que saem contra 57 nos que ficam), enquanto na Sobe tira os mais fracos — compara um grupo reforçado com um enfraquecido — e sobram 8 contra 7, onde só um efeito enorme (acima de d 1,57) seria visível. Mantém o nível que o 17/09 já tinha dado; o que muda é o texto.

**Números a criar/corrigir:**
  - n_trave_sf = 7 e n_trave = 16 (hoje o 7 está digitado à mão no campo n)
  - n_trave_sai = 9
  - pts_trave_sai = 63 e pts_trave_fica = 57 (medianas no recorte 2022–2025 do próprio A06; os 62 e 56,5 do texto atual vêm da tabela do _metodo_fronteira.md, que inclui 2026 e conta 20 times)
  - ddt_t_sem = 59.79 (float; hoje string '59.791')
  - dd_q_com_ST = 0.06438 e selo 'sem diferença clara' (corrige o 'pode ser sorte' citado entre aspas)
  - dmin_ST_sem = 1.57 (float; hoje string) e dmin_ST_com = 1.02
  - Tirar do o_que_vimos a frase 'Nenhum indicador do A02 ou do A06 separa essas duas faixas nos dois cortes': é falsa — a pontaria do A02 é firme nos dois cortes contra a trave (com d 1,352 q 0,00144; sem d 1,379 q 0,03821)

### A06-3 — REESCREVE  ·  firme → **provável**  ·  esforço: reanalise

**Hoje:** Quem sobe não cede menos chutes — cede chutes piores

**Proposta:** Quem sobe sofre tanto chute quanto o meio — o que muda é o tamanho da chance que ele entrega

*O que vimos.* Colocando a posse do adversário na mesma base, o volume some: quem sobe sofre {rca_s_com} finalizações por jogo contra {rca_m_com} do meio, quando sem o ajuste eram {rc_s_com} contra {rc_m_com}. O que fica é o tamanho da chance cedida: cada finalização que quem sobe sofre vale {xgpr_s_com} gol esperado contra {xgpr_m_com} do meio, cerca de um gol esperado a menos a cada cem chutes sofridos. É o mesmo teste que o A02 já publica, não uma segunda prova, e o gol esperado é uma régua curta — reproduz só {conf_xgpr} de si mesma entre rodadas pares e ímpares —, então a diferença conta pela direção, não pelo tamanho.

*Para o Santa Cruz.* A vantagem defensiva de quem sobe não é sofrer menos finalização: é sofrer finalização que vale menos. Na montagem, o alvo é reduzir o valor do chute cedido — organização da área e altura da linha —, e não comprar volume de desarme. Por qual mecanismo isso acontece, o A06 não diz: não existe distância nem ângulo do chute sofrido em nenhuma coluna da base.

*n.* {n_sobe_com} promovidos contra {n_meio_com} do meio, com todos os times; {n_sobe_sf} contra {n_meio_sf} sem os colados na linha

*Premissa.* Ajusta a leitura defensiva do A02: o lado defensivo separa pela qualidade do que se cede, não pelo volume. A hipótese de que o volume só parecia menor porque quem sobe tem mais a bola precisa da posse declarada na lista e testada antes de virar afirmação — hoje ela não está em nenhuma família do A06.

**Por que esse nível.** (a) BH a 5% na família do que se cede: o gol esperado por finalização sofrida PASSA nos dois cortes (q 0,03113 com a fronteira, 0,00967 sem). (b) Porta temporal da §6.4: REPROVA, e com o sinal invertido em relação ao declarado (ρ +0,208 p 0,0635; parcial −0,026 p 0,8213). Um sim e um não = provável — que é exatamente o nível do A02-2, que publica o mesmo teste com os mesmos dígitos. O xG sofrido ajustado pela posse sai da frase porque reprova nos dois cortes (q 0,06382 sem, 0,22961 com) e o duelo aéreo também (q 0,58867): entravam em 'o que fica' sem marca nenhuma. Marca obrigatória acrescentada: pode ser efeito do placar — o volume cedido é dividido pela posse do adversário, que muda conforme o time está ganhando ou perdendo, e não há recorte por estado do jogo em base alguma. Ressalva do próprio teste temporal: com 80 clube-temporadas a parcial detectável fica em torno de 0,31, então reprovar é falta de prova de anterioridade, não prova de ausência.

**Números a criar/corrigir:**
  - rca_s_com = 12.52 e rca_m_com = 12.23 (float; A06_testes.csv com/cede_ajustado/SM)
  - rc_s_com = 11.62 e rc_m_com = 12.05 (finalizações sofridas por jogo SEM ajuste; hoje só existem no A02_testes.csv — o A06 tem de gerar as suas)
  - xgpr_s_com = 0.089 e xgpr_m_com = 0.098 (gol esperado por finalização sofrida, corte com fronteira)
  - conf_xgpr = 0.36 (split-half Spearman-Brown do xg_por_remate_contra, medido em 0,357 na auditoria; a régua dura da especificação manda ressalvar abaixo de 0,40 e a coluna regua_curta nem existe no A06_testes.csv)
  - porta_xgpr_parcial = -0.026 e porta_xgpr_p = 0.8213 (só no confianca_motivo e na prova)
  - ca_contra_s e ca_contra_m — contra-ataques sofridos por jogo, indicador que falta: emparelhando a linha do adversário no mesmo jogo, a direção bruta é sobe 1,05 contra meio 1,28, e ele tem de rodar com o método da casa e os dois cortes antes de a pergunta do A06 ser dada por respondida
  - Tirar do texto 'Confirma o A02 com o ajuste que faltava': o ajuste mudou o volume de finalizações, não tocou no gol esperado por finalização — é o mesmo número do A02 com outro q, porque cada parte o corrigiu numa família diferente

### A07-2 — REESCREVE  ·  provável → **provável**  ·  esforço: reanalise

**Hoje:** Quem cai sprinta menos — e o sprint que falta é sem a bola

**Proposta:** Quem cai sprinta menos que o meio, e não sabemos em que fase do jogo

*O que vimos.* A cada 30 minutos sem a bola, o time mediano dos rebaixados corre {otip_c} metros em sprint contra {otip_m} do meio — no ranking do próprio ano, {pos_otip} posições abaixo. Com a bola o buraco bruto é do mesmo tamanho ({tip_c} contra {tip_m} metros), mas varia tanto de time para time que a amostra não permite dizer se é real: o estudo não consegue localizar a fase do jogo. Descontado o rodízio de elenco — quem cai usa {at_c} atletas rastreados na temporada contra {at_m} do meio —, o sprint sem a bola é o único número físico que continua de pé; o sprint somado no jogo inteiro e a velocidade máxima deixam de separar, e todos eles são média de uma amostra de jogos, cerca de 15 por atleta, não de 38.

*Para o Santa Cruz.* Isto é sinal para medir no próprio time, não critério de contratação: a especificação (§5, armadilha a) já decidiu que correr sem a bola é a face física de pressionar alto — descreve o plano do treinador, não a qualidade do atleta. Se o elenco do Santa Cruz ficar na faixa dos {otip_c} metros dos rebaixados, o assunto é o modelo de jogo e o tamanho do rodízio, não o mercado. E nada aqui autoriza dizer que sprintar mais evita a queda: o estudo só viu as duas coisas andando juntas na mesma temporada.

*n.* 16 rebaixados contra 48 do meio (12 contra 32 sem os times de fronteira)

*Premissa.* Ajusta m1 (Time físico) pelo outro lado: o físico aparece contra a QUEDA, não a favor do acesso. E, pela §5 da especificação, correr sem a bola descreve o plano de jogo e não pode virar critério de compra — a premissa, que hoje diz 'a intensidade é critério de escolha', tem de separar as duas coisas. Sugere premissa nova: 'o físico do elenco é escolha de modelo de jogo; mede-se o próprio time contra a régua da Série B, não se contrata por ele'.

**Por que esse nível.** (a) BH a 5% dentro da família: SIM, e sobrevive ao desconto do rodízio que a especificação exige em toda linha física (revisão de 15/09: 'no físico fica um desconto só: o do rodízio'; §11 controle 2). Sprint sem a bola por 30 min, Cai × Meio: q 0,00487 (com fronteira) e 0,02234 (sem) no bruto; q 0,0095 e 0,037 com o desconto — firme nos DOIS cortes, como manda _metodo_fronteira.md, e com poder suficiente (|d| 0,824 contra um mínimo de 0,82: passa no fio). Os outros três números que hoje sustentam o texto caem com o mesmo desconto: sprint por 90 (q_rod 0,086/0,096), número de sprints (0,086/0,108) e PSV-99 (0,231). O A07 já tinha tirado o PSV-99 da manchete por intuição, olhando o rho com o rodízio; o desconto prescrito confirma a intuição e derruba mais dois. (b) Porta temporal §6.4: NÃO — não rodou e não roda, porque não há físico por jogo antes de 2025. Um de dois = provável. Ressalvas que ficam no texto: o rodízio é o maior efeito da parte (quem cai usa 25,5 atletas rastreados contra 21,0 do meio, d 1,035, firme nos dois cortes); a cobertura física vai de 62% a 97% dos minutos possíveis e a rodada com e sem os 20 clube-temporada abaixo de 75% nunca foi feita; e o placar empurra CONTRA o achado (quem está atrás corre mais, e quem cai corre menos), então não é ele que fabrica o buraco. Sai do para_o_santa_cruz o reforço do A06: o A06 só tem Sobe × Meio e Sobe × Trave, nunca testou Cai × Meio.

**Números a criar/corrigir:**
  - otip_c e otip_m do corte COM fronteira, como float: 91,1 e 100,0 — hoje são string do corte SEM fronteira (91.111 e 100.854) e chegam à tela como milhar
  - tip_c e tip_m (89,4 e 99,1), que hoje não existem: o com-bola só aparece no texto em d e q, que são palavras proibidas fora da prova
  - at_c e at_m do corte COM fronteira (25,5 e 21,0). Hoje estão os do corte SEM (25,5 e 22,0) e o J01-3 e o J02-3 copiam o 22,0 à mão de outra parte
  - pos_otip = 4,5 posições abaixo do meio no ranking do ano (23,9 pontos de percentil ÷ 5,26), para o tamanho do buraco sair em unidade de jogo
  - d_rod e q_rod em TODA linha de A07_testes.csv, colunas novas ao lado de d e q, como a especificação manda para o físico (o método já existe em gerar_prototipo.py, residualizado só no posto de fis_atletas, sem dinheiro)
  - n_cai_sf = 12 e n_meio_sf = 32, marcadores que faltam (o n de hoje é digitado à mão e não bate com as linhas que produziram os números)
  - os quatro rho do rodízio (−0,118 com p 0,2991 e −0,377 com p 0,0006) gravados em A07_resumo.json: hoje decidem a confiança e não existem em arquivo nenhum
  - cobertura absoluta por clube-temporada (fis_minutos ÷ J × 11 × 90) e a rodada com e sem os 20 abaixo de 0,75, que o CLAUDE.md manda e a parte pulou

### A11-2 — REESCREVE  ·  provável → **provável**  ·  esforço: recalculo

**Hoje:** A corrida sem bola vira pressão, mas não vira bola recuperada

**Proposta:** Correr sem a bola sobe a linha de pressão — em bola recuperada não aparece

*O que vimos.* O terço que mais corre sem a bola ({spr_alto} metros de sprint a cada 30 minutos sem posse, contra {spr_baixo}) deixa o adversário dar {ppda_alto} passes por ação defensiva, contra {ppda_baixo} do terço que menos corre: é pressão bem mais alta. Mas os dois terços recuperam praticamente a mesma bola — {rec_alto} contra {rec_baixo} recuperações por jogo — e o xG sofrido quase não muda ({xgc_alto} contra {xgc_baixo} por jogo). Em recuperações é 'não achamos', não 'não tem': com estes {n} times o teste só enxergaria uma relação de tamanho médio para cima.

*Para o Santa Cruz.* No modelo de jogo, pedir corrida sem a bola é pedir linha de pressão mais alta — não é pedir mais bola recuperada. O que faz o time recuperar bola não foi testado nesta parte, então ela não autoriza preferir o duelo à pressão como jeito de recuperar: quem quiser essa resposta precisa declarar o par antes e rodar. Conversa com o A06, onde pressionar não separa quem sobe e ganhar o duelo separa.

*n.* 80 clube-temporadas (40 clubes, 2022–2025); 52 sem os times de fronteira, onde a pressão fica mais forte e as recuperações seguem sem relação

*Premissa.* Ajusta a m1 (Time físico) do lado sem a bola: correr sem a bola compra linha de pressão mais alta, e não bola recuperada — a intensidade define onde o time defende, não quanto ele rouba.

**Por que esse nível.** (a) BH a 5% dentro da família sem_bola: PASSA na metade que sustenta a manchete — sprint sem posse × PPDA q=0,00000 e metros por minuto sem posse × PPDA q=0,00001 em A11_correlacoes.csv. (b) Porta temporal da §6.4: NÃO — não rodou e não pode rodar (físico só em período único); onde ela foi rodada no estudo, a pressão não passa. Um sim de dois: provável. A metade negativa (recuperações) não passa em nenhum dos dois e por isso entra no texto como 'não achamos', com o mínimo detectável declarado: com n=80 o teste só alcança 0,31 para cima e o intervalo do par com recuperações vai até +0,34. Ressalvas obrigatórias: pode ser efeito do placar — time que está atrás corre mais E pressiona mais, e a base não permite o recorte; e correr sem a bola e PPDA são, em boa parte, duas medidas da mesma escolha do time, não um mecanismo.

**Números a criar/corrigir:**
  - {spr_alto} = 114 e {spr_baixo} = 87 — metros de sprint a cada 30 min SEM a bola, terço de cima e terço de baixo
  - {ppda_alto} = 9,3 e {ppda_baixo} = 11,1 — passes do adversário por ação defensiva nesses dois terços
  - {rec_alto} = 77,7 e {rec_baixo} = 78,1 — recuperações por jogo nesses dois terços
  - {xgc_alto} = 1,14 e {xgc_baixo} = 1,21 — xG sofrido por jogo nesses dois terços
  - {rho_min_det} = 0,31 e {ic_rec_topo} = 0,34 — mínimo detectável com n=80 e topo do intervalo do par com recuperações, para o motivo da confiança
  - {n_sf} = 52 — corte sem fronteira (pressão −0,715 e −0,480; recuperações seguem sem relação)
  - gravar o mínimo detectável por correlação em A11_resumo.json, como a estratificação já faz com o d mínimo

### A12-1 — REESCREVE  ·  firme → **provável**  ·  esforço: recalculo

**Hoje:** Das nove réguas, só quatro separam quem sobe — e duas delas não são de jogo

**Proposta:** Só uma coisa que o clube escolhe separa quem sobe: a qualidade da chance, criada e cedida

*O que vimos.* Quem sobe finaliza de {dist_sobe} metros e o meio de {dist_meio} — a única diferença de jogo que se repete com e sem os times que terminaram colados na linha e que ainda aparece antes do resultado. Do outro lado, cada finalização que quem sobe sofre vale {xgr_sobe} de gol esperado contra {xgr_meio} do meio, e essa metade vem com ressalva, porque o gol esperado é a medida menos confiável da casa. As outras duas diferenças não são escolha: o elenco de quem sobe vale {val_sobe} contra {val_meio} do meio, e os onze mais usados ficam com {sh_sobe}% dos minutos contra {sh_meio}%, que é o que acontece com quem está ganhando.

*Para o Santa Cruz.* O que dá para comprar e treinar é a qualidade da chance: chutar de perto e obrigar o adversário a chutar mal. Dinheiro não se escolhe, e time repetido é consequência de ganhar — não contrate para isto. A construção com bola não entra na lista do que não separa: ela aparece num recorte e some no outro, e fica como indício; corrida, explosão e bola aérea não aparecem em recorte nenhum, num desenho de {n_sobe} contra {n_meio} que só enxergaria diferenças grandes.

*n.* 16 promovidos contra 48 do meio, e 8 contra 32 sem os times colados na linha

*Premissa.* Corrige a sugestão anterior do próprio A12: são quatro das nove réguas que separam quem sobe do meio, não cinco que não separam — e só uma delas, a qualidade da chance, é escolha do clube. A construção com bola passa a 'depende do recorte'. Junto com A07, qualifica a premissa m1 (Time físico): no coletivo, correr mais não é o que separa quem sobe.

**Por que esse nível.** (a) BH a 5% dentro da família das réguas: SIM. Em Sobe × Meio, nos dois cortes de fronteira: E 0,00388 e 0,00135; F 0,04454 e 0,00080; H 0,00128 e 0,00007; I 0,01561 e 0,04672 (A12_reguas.csv, conferido linha a linha, não pelo texto). (b) Porta temporal da §6.4: NÃO. O teste de 19/09 (_porta_temporal.md) dá E com parcial +0,254 e só por causa de dist_remate — a régua sem ele cai para +0,191, p 0,0895; o único item de F que foi testado, xg_por_remate_contra, reprova com parcial −0,026; H e I não são calculáveis por turno. Um critério de dois = provável. Registro do que não muda o selo: o item dist_remate sozinho passaria nos dois (q 0,00009 no corte com e 0,02313 no sem, A02_testes.csv; parcial +0,289, p 0,0094), mas a conclusão é sobre as réguas e um item não sustenta as quatro. E a ressalva do xG (confiabilidade 0,30, abaixo do piso de 0,40 da especificação) cai sobre a metade de F.

**Números a criar/corrigir:**
  - dist_sobe = 19,5 e dist_meio = 20,5 (metros) — A02_testes.csv, linha com/cria/SM/dist_remate, cru_sobe 19,522 e cru_alvo 20,472
  - xgr_sobe = 0,089 e xgr_meio = 0,098 (gol esperado por finalização sofrida) — A02_testes.csv, com/cede/SM/xg_por_remate_contra
  - val_sobe = 24,0 e val_meio = 13,9 (milhões de euros) — mediana de tm_valor_total por faixa, 2022-2025, recalculada da base: 24.012.500 e 13.850.000
  - sh_sobe = 68,1 e sh_meio = 63,1 (% dos minutos nos onze mais usados) — mediana de share_11 por faixa; bate com o número que o _cruzar_19_09 pede para o J02
  - n_sobe = 16, n_meio = 48, n_sobe_sem = 8, n_meio_sem = 32
  - separam = 'qualidade da chance, solidez, valor do elenco e estabilidade do onze' (substitui o texto digitado)
  - nao_separam corrigido, de cinco para quatro = 'pressão e ritmo, volume físico, explosão, bola aérea e parada'
  - depende_do_corte = 'construção com bola' (A_posse_construcao: q 0,12933 com fronteira, 0,04330 sem)
  - usar {n_reguas}=9 na contagem e aposentar os marcadores órfãos A_sobe e A_trave, que nenhum texto lê

### A12-2 — REESCREVE  ·  indício → **indício**  ·  esforço: recalculo

**Hoje:** O Cenário Barato parece funcionar, mas a conta é circular — e 2026 não confirma

**Proposta:** O jeito de jogar dos que subiram sem dinheiro não é atalho: quem jogou assim caiu mais do que subiu

*O que vimos.* Entre 2022 e 2025, {cabem} dos {n_fech} times jogaram dentro da faixa do Cenário Barato — pressão baixa, posse perto da metade, bola direta — e o saldo foi {subiram} acessos contra {cairam} rebaixamentos, num campeonato em que sobem {sobe_liga} e caem {cai_liga} a cada quatro anos. Dos {subiram} que subiram jogando assim, dois eram o elenco mais caro e o terceiro mais caro do ano, então a faixa não é dos pobres; entre os {cabem8} times sem dinheiro que jogaram assim subiram {sub8}, que são {sub8} dos {n_barato} casos de que a faixa foi tirada. Em 2026, na {rodada}ª rodada de {total_rodadas}, {n_baratos26} times sem dinheiro jogam dentro da faixa: um está em {pos_melhor26}º, dentro da zona de acesso, dois ficam a um ponto dela e dois no meio da tabela.

*Para o Santa Cruz.* Copiar o jeito de jogar dos quatro que subiram sem dinheiro não aumenta a chance de subir — nesses quatro anos aumentou a de cair. Se o Santa Cruz montar o time assim, que seja por escolha de projeto, sabendo que a faixa descreve mais de um quarto da liga e que os três números dela mudam com o placar: time que vai ganhando pressiona menos e joga mais direto. O caminho que o estudo sustenta continua sendo chutar de perto e obrigar o adversário a chutar mal.

*n.* 22 times na faixa entre 2022 e 2025, 4 casos de origem, e os 20 times de 2026 na 27ª rodada de 38

*Premissa.* Sugere registrar que não existe 'perfil do acesso barato': a faixa de posse, pressão e bola longa dos quatro que subiram sem dinheiro descreve 22 dos 80 times do período e, entre eles, houve mais rebaixamento que acesso.

**Por que esse nível.** (a) BH a 5% na família: NÃO. O Cenário Barato não é um teste — A12_reguas.csv só traz as nove réguas, e não existe q nenhum para esta faixa em arquivo algum do estudo; é contagem. (b) Porta temporal: NÃO. Nunca foi rodada aqui, e o PPDA, um dos três itens do perfil, já reprova na tabela da própria §6.4 (parcial −0,103, p 0,363). Nenhum dos dois = indício. E a frase tem de dizer por quê: a faixa foi desenhada sobre 4 casos, e os três itens dela — posse, pressão e bola longa — são exatamente os que a regra do Placar manda ressalvar; elenco caro tende a ter esse PPDA e o estudo não separa as duas coisas.

→ vai para **"Parece, mas não é"**.

**Números a criar/corrigir:**
  - cabem = 22 e n_fech = 80 — perfil PUBLICADO da §7.2(b) (PPDA 10,0-13,2 · posse 47-52% · longo 10-14%), que é o que o A12.py fixa; os 14/4/28,6% do texto atual vêm do envelope sob medida de A12-3, não deste perfil
  - subiram = 4 e cairam = 7, contra sobe_liga = 16 e cai_liga = 16 em 80 — taxa de acesso da faixa 18,2% contra 20,0% da liga, e de queda 31,8% contra 20,0%
  - cabem8 = 13 e sub8 = 2 (15,4%), contra 8,3% dos 48 times fora do top-8 de valor; n_barato = 4
  - os dois ricos que cabem no perfil e subiram: Athletico-PR 2025 (1º em valor do ano) e Remo 2025 (3º) — junto com Criciúma 2023 (12º) e Mirassol 2024 (9º)
  - rodada = 27, total_rodadas = 38 (coluna J de serieb_clube_temporada.csv, 2026)
  - n26 = 8 times de 2026 na faixa; n_baratos26 = 5; pos_melhor26 = 6 (Operário-PR, dentro da zona 3º-6º de playoff); Atlético-GO 7º e CRB 8º a um ponto ou menos; São Bernardo 14º e Botafogo-SP 15º
  - o A12.py precisa gravar A12_cenario_barato.json e A12_teste_2026.json (hoje nenhum script os gera) e corrigir a chave duplicada 'destes_quantos_subiram' em A12_resumo.json

### A12-3 — REESCREVE  ·  firme → **indício**  ·  esforço: recalculo

**Hoje:** O perfil, como está escrito na especificação, exclui metade dos times de que foi derivado

**Proposta:** O perfil do time barato, do jeito que está escrito, deixa de fora dois dos quatro times de que foi tirado

*O que vimos.* A faixa publicada é pressão de {ppda_lo} a {ppda_hi}, posse de {posse_lo}% a {posse_hi}% e bola longa de {longo_lo}% a {longo_hi}%, tudo em número redondo. Cobrada assim, o Vitória de 2023 fica fora por {vit_posse}% de posse e a Chapecoense de 2025 por {chape_longo}% de bola longa — dois dos quatro casos. E, olhando o lugar de cada um dentro do próprio ano, os quatro só se parecem na pressão: em posse eles vão do {r_posse_melhor}º ao {r_posse_pior}º da liga, e em bola longa do {r_longo_melhor}º ao {r_longo_pior}º.

*Para o Santa Cruz.* Não trate a faixa como alvo de montagem: ela é o menor e o maior de quatro times, sem folga nenhuma, e em número bruto de anos diferentes. O que se sustenta dos quatro é uma coisa só: todos pressionavam pouco, entre o {r_ppda_melhor}º e o {r_ppda_pior}º da liga no ano deles. Posse e bola longa espalham pela tabela inteira e não servem de requisito para o elenco de 2027.

*n.* 4 casos, de 2023 a 2025

*Premissa.* Sugere registrar que a frase 'perfil coerente entre si' da §7.2(b) não se sustenta quando cada caso é lido dentro do próprio ano: a única coisa em comum aos quatro é pressionar pouco.

**Por que esse nível.** (a) BH a 5% na família: NÃO. Não há teste nenhum aqui — é a conferência de 4 valores contra um texto, e não existe q para ela em arquivo algum. (b) Porta temporal: NÃO. Não se aplica: nada foi previsto. Nenhum dos dois = indício, e a frase diz por quê: são 4 casos e uma conferência de texto, não uma medida. Registro de honestidade: o refutador que pediu exatamente este rebaixamento em 18/09 foi derrubado por 1 a 3, mas a régua do CLAUDE.md não abre exceção para contagem — sem os dois critérios, o selo é indício.

→ vai para **"Parece, mas não é"**.

**Números a criar/corrigir:**
  - ppda_lo = 10,0 · ppda_hi = 13,2 · posse_lo = 47 · posse_hi = 52 · longo_lo = 10 · longo_hi = 14 (faixa publicada na §7.2(b))
  - vit_posse = 52,0153 e chape_longo = 14,0858 — os dois valores que estouram a faixa, hoje digitados à mão no texto
  - envelope real, se for citado na prova: PPDA 10,0184-13,1684 · posse 47,4203-52,0153 · longo 10,0326-14,0858 (mínimo e máximo dos 4, sem margem)
  - lugar dentro do ano, de 20 times, recalculado da base: pressão 13º/15º/18º/20º (r_ppda_melhor = 13, r_ppda_pior = 20); posse 5º/7º/16º/17º (r_posse_melhor = 5, r_posse_pior = 17); bola longa 3º/5º/16º/19º (r_longo_melhor = 3, r_longo_pior = 19)
  - os 14 números hoje digitados à mão têm de descer para o campo 'numeros' e virar marcador, como manda a seção Texto e número

### A13-1 — REESCREVE  ·  firme → **indício**  ·  esforço: reanalise

**Hoje:** Quem cai não despenca: já estava mal na metade e afundou depois

**Proposta:** Quem cai chega à metade do campeonato {dif_1t_cai_meio} pontos atrás do meio da tabela

*O que vimos.* No 1º turno, quem terminou rebaixado fez {cai_1t} pontos de mediana contra {meio_1t} do meio da tabela, e {cai_abaixo_mediana} dos {cai_total} rebaixados ficaram abaixo dessa marca; tirando os times colados nas linhas de corte, a distância se mantém ({cai_1t_sf} contra {meio_1t_sf}). O tombo do returno não aparece: {cai_melhoraram} dos {cai_total} rebaixados fizeram mais pontos no 2º turno do que no 1º, e a diferença entre as faixas no returno é menor do que este desenho consegue enxergar. É contagem de {n} campanhas, sem teste que sobreviva à conta de muitas comparações, e os pontos do 1º turno já entram na soma que define a faixa — por isso fica como indício.

*Para o Santa Cruz.* O déficit de quem cai já está montado na metade, então a correção é na janela do meio do ano — treinador ou reforço —, e não na espera de uma reação natural no returno. Mas a temporada não está perdida na rodada {rodada_turno}: em quatro temporadas, {n_salvos} times saíram do Z4 depois dela.

*n.* {n} clube-temporadas de 2022 a 2025 ({n_sem_fronteira} sem os times colados nas linhas de corte); {cai_total} rebaixados e {meio_total} do meio

*Premissa.* Sugere premissa nova no grupo Montagem do elenco: a Série B cobra planejamento de meio de ano — quem chega à metade cerca de {dif_1t_cai_meio} pontos abaixo do meio da tabela precisa de correção na janela, e o orçamento tem de prever reforço de julho. NÃO entra a versão antiga que a conclusão propunha ('na Série B o rebaixamento se define no 1º turno'): {cai_melhoraram} dos {cai_total} rebaixados melhoraram no returno e {n_salvos} times escaparam do Z4 depois da metade.

**Por que esse nível.** (a) BH a 5% na família: NÃO. Não existe resultados/A13_testes.csv, A13.py não importa scripts/_metodo.py e nunca chama bh() — nenhum q foi calculado. Quando o auditor rodou a família de 3 (Cai×Meio, Cai×Sobe e permutação dentro do time) na diferença entre turnos, q = 0,42 nos três: reprova. (b) Porta temporal da §6.4: NÃO. O desfecho é a faixa final, que contém os pontos do 1º turno; não há previsor anterior ao resultado, e o _porta_temporal.md de 19/09 registra que A13 rodou 'a porta sem o desconto, e com o desfecho contaminado'. Zero de dois = indício. A metade que sobrevive (o déficit do 1º turno) é coerente e tem uso prático, e eu confirmei que ela aguenta os dois cortes da fronteira: Cai 19,5 contra 25,0 do meio com os 80, e 19,0 contra 24,0 nos 52 sem os times colados nas linhas. A metade que morre é a do returno, que troca de sinal entre os cortes (Sobe +1,0 com, −2,0 sem) e que o desenho não enxerga (d observado 0,32 contra d mínimo 0,82).

**Números a criar/corrigir:**
  - dif_1t_cai_meio = 5.5 (mediana do meio 25,0 menos a de quem cai 19,5, pontos do 1º turno)
  - cai_1t_sf = 19.0 e meio_1t_sf = 24.0 (medianas do 1º turno no corte sem fronteira)
  - n_sem_fronteira = 52 (28 das 80 linhas saem no corte)
  - cai_abaixo_mediana = 15 (dos 16 rebaixados, abaixo da mediana do meio no 1º turno; só Ponte Preta 2024, com 26, ficou acima)
  - cai_melhoraram = 6 (rebaixados com pts_2t > pts_1t)
  - meio_total = 48
  - rodada_turno = 19 (a constante TURNO, hoje digitada à mão no texto)
  - d_min_cai_meio = 0.82 e d_observado = -0.32, para a prova (por que 'não despenca' é 'não dá para ver')
  - SAIR de numeros, porque nenhum texto novo os usa e todos vêm da frase derrubada: cai_2t, cai_dif, sobe_1t, sobe_2t, meio_2t, trave_1t, trave_2t, trave_dif

### A13-3 — REESCREVE  ·  firme → **provável**  ·  esforço: recalculo

**Hoje:** O 1º turno prevê menos do que parece: rho 0,48, não 0,82

**Proposta:** A tabela da metade dá vantagem, não garante a segunda metade

*O que vimos.* O terço que mais pontuou no 1º turno fez {alto_2t} pontos no returno; o terço que menos pontuou fez {baixo_2t} — {dif_tercos} pontos de diferença em {rodada_turno} jogos. E as campanhas se cruzam: o melhor returno das quatro temporadas ({baixo_2t_max} pontos) foi de um time do terço de baixo da metade, acima do melhor time do terço de cima ({alto_2t_max}). O que a tabela da metade mostra em primeiro lugar são os pontos já ganhos, que já estão somados na classificação final.

*Para o Santa Cruz.* Vantagem na metade é banco de pontos, não vaga: {n_perderam_g4} times que estavam no G4 na rodada {rodada_turno} terminaram fora dele. A segunda metade se monta como campanha própria — carga física, rodízio e reforço de julho —, e não administrando o que já foi feito.

*n.* {n} clube-temporadas de 2022 a 2025 ({n_sem_fronteira} sem os times colados nas linhas de corte)

*Premissa.* Não trata de nenhuma premissa de dados/premissas.json. Se alguma entrar, é a de planejar o meio do ano sugerida em A13-1.

**Por que esse nível.** (a) BH a 5% na família: NÃO. Não existe A13_testes.csv, A13.py não importa _metodo.py e os três valores de previsores_do_1o_turno saem com p bruto, sem q. Pior: o número que sustenta a manchete (o par 1º turno × 2º turno) nem é calculado pelo script — grep '0.484' devolve só A13.json. (b) Porta temporal da §6.4: SIM. É o único par de toda a A13 em que o previsor é medido inteiro nas 19 primeiras rodadas e o desfecho inteiro nas 19 últimas; a própria §6.4 publica esse par como linha de referência (+0,496 em posto dentro do ano) e o recálculo do auditor bate (0,4957). Eu conferi que sobrevive aos dois cortes da fronteira: 0,484 com os 80 e 0,399 (p 0,0034) nos 52 sem os times colados nas linhas. Um sim e um não = provável, que é exatamente a correção que os três pareceres do auditor fecharam. Ressalva para a prova, não para o texto: por temporada a associação some em 2022 (0,112, p 0,64) e o IC por clube é [0,31; 0,65].

→ vai para **"Parece, mas não é"**.

**Números a criar/corrigir:**
  - alto_2t = 31.0 e baixo_2t = 22.0 (mediana de pontos no 2º turno do terço de cima e do terço de baixo do 1º turno, n = 27 cada; corte limpo em 22/23 e 28/29 pontos, sem empate na borda)
  - dif_tercos = 9.0
  - baixo_2t_max = 37 (Ituano 2022, que fez 20 no 1º turno) e alto_2t_max = 36 (Cruzeiro 2022, que fez 42)
  - n_perderam_g4 = 6
  - rodada_turno = 19
  - n_sem_fronteira = 52
  - PARA A PROVA: rho_1t_2t (0,484) tem de ser calculado DENTRO de A13.py e gravado em previsores_do_1o_turno, que hoje só tem correlações contra a posição final; acrescentar rho_1t_2t_sem_fronteira = 0,399 (p 0,0034, n 52) e rho_1t_2t_posto = 0,496 (posto dentro do ano, o valor da §6.4)
  - SAIR do texto: rho_xg (0,486) é xG do 1º turno contra a POSIÇÃO FINAL, o mesmo par contaminado que a conclusão condena; o par limpo é 0,422. Tirando a frase, a conclusão deixa de se apoiar em xG e some junto a ressalva obrigatória da régua curta do xG (0,30, abaixo do piso de 0,40).
  - SAIR da manchete: os literais 0,48 e 0,82, digitados à mão, e a palavra proibida.

### A14-1 — REESCREVE  ·  provável → **provável**  ·  esforço: reanalise

**Hoje:** Oito indicadores resumem o Bloco A, e a ordem das faixas sai limpa

**Proposta:** A régua do Bloco A cabe em {n_ind} indicadores, e quem subiu aparece no alto dela

*O que vimos.* A régua junta {n_ind} coisas que separaram quem sobe do meio nas duas contagens de fronteira e não são o resultado contado de outro jeito: finalizar de perto, criar chance boa, ceder chance ruim, ganhar o duelo defensivo, sofrer pouco em casa, ganhar o duelo em casa e o valor do elenco. Dos {n_sobe} times que subiram de 2022 a 2025, {sobe_top4} estavam entre os quatro primeiros da régua na própria temporada e {sobe_acima} ficaram acima de todo o meio da tabela; a trave (5º–8º) é um recorte dentro do meio, não uma quarta faixa. Duas dessas {n_ind} se repetem por dentro — a distância do chute já está dentro da qualidade da chance, e o duelo em casa é metade dos jogos do duelo total —, então o corte de repetição juntou o que era parecido, mas não separou o que estava contido.

*Para o Santa Cruz.* {n_escolhiveis} das {n_ind} peças são decisão de modelo de jogo e de contratação: finalizar de perto, criar chance boa, ceder chance ruim, ganhar o duelo defensivo, sofrer pouco em casa e ganhar o duelo em casa. A que sobra é o valor do elenco, que não se escolhe — e é a peça que mais puxa a régua para cima, então clube de orçamento curto não deve ler a própria posição na régua como sentença. Use a lista como critério de contratação e de modelo de jogo, e como leitura de temporada, não como aposta de acesso.

*n.* 80 clube-temporadas: 16 que subiram, 48 do meio e 16 que caíram; sem os times colados na linha, 8 contra 32

*Premissa.* Sugere premissa nova: a régua do Bloco A do estudo são estes {n_ind} indicadores, no lugar da lista de nove réguas da Protótipo. E ajusta m1 (Time físico): nenhuma das {n_ind} peças é física — o físico não aparece entre o que separa quem sobe do meio no Bloco A. Não é prova de que não exista: o desenho é que não enxerga.

**Por que esse nível.** (a) BH: SIM. Os componentes só entram com selo firme, que em scripts/_metodo.py é exatamente q<0,05 de Benjamini-Hochberg dentro da família × comparação, e conferi um a um nos CSV de origem — todos firmes nos DOIS cortes de fronteira em Sobe × Meio: dist_remate q 0,00009/0,02313 e xg_por_remate_contra 0,02076/0,00430 (A02_testes.csv); xgc_casa 0,02731/0,00000 e dd_casa 0,02614/0,00131 (A03_testes.csv); duelos_def_pct 0,02556/0,00006 (A06_testes.csv); H_dinheiro 0,00128/0,00007 e E_qualidade_chance 0,00388/0,00135 (A12_reguas.csv). E o próprio teste do índice sobrevive aos dois cortes, que é o que a regra da fronteira exige: com fronteira 16 contra 48, p 1,75e-05; sem fronteira 8 contra 32, p 3,47e-07 (reproduzido com base_completa() e sinais() do próprio A14.py). (b) Porta temporal: NÃO. Rodada em 19/09 sobre os componentes: só dist_remate passa (parcial 0,289) e E_qualidade_chance (0,254) passa apenas por conter dist_remate; xgc_casa 0,134, duelos_def_pct 0,092, dd_casa e xg_por_remate_contra −0,026 reprovam; H_dinheiro não é calculável por turno. Um dos dois critérios = provável, que é o nível em que ela já está. O achado da auditoria que pedia rebaixar para indício foi derrubado 0/3, pelo mesmo raciocínio.

**Números a criar/corrigir:**
  - n_ind = 7 (era 8; sai I_estabilidade_11, que é feito dos quatro nomes da constante CONSEQUENCIA de ranking_gaps.py)
  - indice = "H_dinheiro, dist_remate, E_qualidade_chance, xg_por_remate_contra, duelos_def_pct, xgc_casa, dd_casa" (só na prova)
  - descartados = "dd_fora (mede o mesmo que duelos_def_pct), F_solidez (mede o mesmo que xgc_casa), I_estabilidade_11 (é consequência do resultado, não característica)"
  - i_sobe = 78.1 · i_trave = 56.6 · i_meio = 47.8 · i_cai = 33.0 · d_sm = 1.59 (reproduzido duas vezes: auditor e cascata)
  - i_meio_sem_trave = 46.1 (o meio sem o recorte da trave, para não contar as mesmas linhas duas vezes)
  - sem fronteira: i_sobe_sf = 83.1 · i_meio_sf = 47.0 · d_sm_sf = 2.71 · n_sobe_sf = 8 · n_meio_sf = 32 (o corte que a regra da fronteira exige e que A14.py nunca rodou)
  - n_base = 80 · n_sobe = 16 · n_meio = 48 · n_cai = 16
  - sobe_top4 = 11 (dos 16 promovidos, quantos ficaram entre os 4 primeiros da régua na sua temporada)
  - sobe_acima = 9 (dos 16 promovidos, quantos ficaram acima de TODO o meio da sua temporada)
  - n_escolhiveis = 6 · n_nao_escolhiveis = 1
  - prova: trocar "A14_resumo.json; A14.py" por A14_resumo.json + resultados/A14.md + a data da execução, depois de prender a varredura de candidatos() aos arquivos do Bloco A

### A14-3 — REESCREVE  ·  indício → **indício**  ·  esforço: reanalise

**Hoje:** Em 2026, a régua acerta em cheio os dois que sobem direto

**Proposta:** Em 2026 a régua põe no topo os dois primeiros da tabela — o que só tinha acontecido em uma das quatro temporadas fechadas

*O que vimos.* Na rodada {rodada26}, os dois primeiros da régua são {top1} e {top2} — os mesmos dois que lideram a tabela, mas em ordem trocada. Nas quatro temporadas fechadas isso aconteceu {backtest_conj} vez, em {ano_acerto}: nas outras três a régua não pôs no seu topo a dupla que terminou na frente. E no resto da tabela ela erra feio: o {vn} é {vn_pos}º em pontos e só {vn_reg}º na régua.

*Para o Santa Cruz.* Use a régua como leitura de rodada — ela diz se o time está fazendo as coisas que quem sobe faz — e não como aposta de quem sobe: nas temporadas fechadas ela acertou a dupla da ponta uma vez em quatro e erra times do G4 inteiros. Para o Santa Cruz, o uso é cobrar do elenco os itens da lista ao longo do ano, e não perseguir posição na régua.

*n.* {n26} times de 2026 na rodada {rodada26}; nas temporadas fechadas, {pp_n12} times-temporada em 1º–2º contra {pp_n36} em 3º–6º

**Por que esse nível.** (a) BH: NÃO. O único teste que sustenta a frase (1º–2º contra 3º–6º nas temporadas fechadas) nunca passou por correção nenhuma — A14 não tem arquivo de testes e A14.py não chama bh() —, e com 8 contra 16 o efeito medido no índice de 7 (0,94) fica abaixo do mínimo detectável de 1,27. O retrato de 2026 é descrição de temporada em curso, sem teste. (b) Porta temporal: NÃO. Nenhum dos dois = indício, e a frase tem de dizer por quê: faltam 11 rodadas em 2026, são só 8 times-temporada em 1º–2º nas fechadas e a régua carrega o valor do elenco, que anda com a tabela. Fica no mesmo nível, mas o texto não pode ficar: o backtest da própria frase existe na base e dá 1 acerto em 4 nas temporadas fechadas (só 2025), e sem I_estabilidade_11 a ordem dos dois primeiros de 2026 inverte — Novorizontino 85,3 passa o Juventude 84,0 —, então "acerta em cheio" e "exatamente o 1º e o 2º" não se sustentam. E "os dois que sobem direto" afirma um resultado que ainda não existe.

**Números a criar/corrigir:**
  - top1 = "Novorizontino" (85,3) e top2 = "Juventude" (84,0) — com 7 componentes a ordem da régua inverte em relação à tabela; top1_pos = 2, top2_pos = 1
  - backtest_conj = 1 e ano_acerto = 2025 (nas 4 fechadas, quantas vezes os 2 primeiros da régua foram os 2 primeiros da tabela); por temporada: 2022 não, 2023 não, 2024 não, 2025 sim
  - vn = "Vila Nova" · vn_pos = 3 · vn_reg = 12 · vn_i = 45.7 (com 7 componentes)
  - pp_12 = 79.4 · pp_36 = 56.3 · pp_d = 0.94 · pp_p = 0.01453 · pp_n12 = 8 · pp_n36 = 16 · pp_dmin = 1.27 (índice de 7; tudo para a prova)
  - n26 = 20 · rodada26 = 27 (e 11 rodadas por jogar, para justificar o nível)
  - prova: citar também primeiro_segundo_contra_terceiro_sexto, escrever A14.md e registrar a data da execução
  - tirar do uso prático a menção ao CLAUDE.md, que pertence à prova

### J01-1 — REESCREVE  ·  firme → **indício**  ·  esforço: recalculo

**Hoje:** Um corte único de minutagem distorce por posição: 29% dos goleiros passam, 7% dos atacantes

**Proposta:** Com um corte único de minutagem, sobra goleiro e falta atacante: passam {gk_60}% dos goleiros e {atk_60}% dos atacantes

*O que vimos.* Em {n} jogador-temporadas de 2022 a 2025, a fatia de minutos muda muito de posição para posição: no corte de {corte}% passam {gk_60}% dos goleiros, {zag_60}% dos zagueiros, {ext_60}% dos extremos e {atk_60}% dos atacantes, e o goleiro mediano joga {gk_med}% dos minutos do time contra {atk_med}% do atacante mediano. Com esse corte, quatro temporadas inteiras de Série B devolvem {reg_atk} atacantes e {reg_ext} extremos com minutagem alta e repetida, contra {reg_gk} goleiros e {reg_zag} zagueiros. Nada disso foi testado — é a contagem da distribuição inteira, e por isso entra como indício.

*Para o Santa Cruz.* O corte de minutagem passa a ser por posição, e J01 tem de fixar qual: com o corte único a busca por atacante começa sem candidatos e a de goleiro começa cheia, e o problema não é o mercado, é a régua. J03 a J06 leem o jogador dentro da própria posição e temporada, que é a mesma normalização que o estudo já usa para clube.

*n.* {n} jogador-temporadas (2022-2025) = 3.160

*Premissa.* Ajusta a m2 ('Muitos minutos por temporada'): minutagem alta e repetida continua valendo, mas 'alta' se mede dentro da posição — no corte único a premissa exclui o ataque por construção.

**Por que esse nível.** (a) BH a 5% dentro da família dela: NÃO — J01 não rodou teste nenhum; não existe J01_testes.csv, J01.py não importa scripts/_metodo.py e não há lista de indicadores pré-declarada, logo não há q em família alguma. (b) Porta temporal da §6.4: NÃO, e não é calculável — a fatia de minutos é por temporada, não por rodada, o mesmo impedimento que a §6.5 já reconheceu para share_11 e conc_hhi. Nenhum dos dois critérios: indício pela letra do arquivo. Não é rebaixamento de impressão: é a régua. O teto desta conclusão é 'provável', nunca 'firme'. O achado da auditoria que pedia o rótulo 'firme (descrição)' foi derrubado 1/3, mas esse rótulo é um quarto nível e não existe na régua.

**Números a criar/corrigir:**
  - n = 3160 (2022-2025), no lugar de 3864 — 2026 sai, e 2026 sozinha move a mediana do goleiro de 21,6% para 25,9%
  - gk_60 = 27,3 · zag_60 = 22,5 · ext_60 = 7,8 · atk_60 = 7,0 (conferido por mim na base, bate com a auditoria)
  - gk_med = 21,6 · atk_med = 16,5 · gk_p75 = 64,7 · atk_p75 = 34,2
  - reg_gk = 16 · reg_zag = 20 · reg_atk = 8 · reg_ext = 7 (regulares por posição no corte único, 2022-2025)
  - altos = 457 e regulares = 90 em 2022-2025, no lugar dos 577 e 123 publicados
  - o corte POR POSIÇÃO em si, que a conclusão promete e não entrega: J01_resumo.json já tem o p75 de cada posição em 2022-2025 (Goleiro 64,7 · Zaga 56,8 · Volante 51,0 · Lateral 46,8 · Meia 42,5 · Atacante 34,2 · Extremo 32,4) e o tamanho do grupo que cada corte deixa para J03-J06 (nesse corte, 795 altos e 210 regulares)
  - os dois números da manchete têm de virar {gk_60} e {atk_60}: hoje estão digitados à mão e o gerador só quebra em marcador sem valor, nunca em número solto

### J01-2 — REESCREVE  ·  indício → **indício**  ·  esforço: recalculo

**Hoje:** Lesão não explica minutagem baixa

**Proposta:** Minutagem baixa não é enfermaria: quem jogou pouco se machucou tanto quanto quem jogou muito

*O que vimos.* Entre 2022 e 2025, {les_n} dos {les_base} jogador-temporadas de minutagem baixa que dá para ligar ao Transfermarkt têm lesão registrada ({les_baixa_pct}%), e entre os de minutagem alta são {les_alta_n} de {les_alta_base} ({les_alta_pct}%). Quando há lesão, quem jogou pouco perde {les_dias} dias contra {les_alta_dias} de quem jogou muito — diferença que em parte é da própria conta, porque quem fez {corte}% dos minutos do time não podia ter ficado meio ano fora. Este desenho só enxergaria a lesão se ela aparecesse em mais de {les_dmin}% de quem jogou pouco, então o que se pode dizer é que ela não aparece, não que não exista.

*Para o Santa Cruz.* Diante de um alvo com pouco tempo de jogo, a hipótese padrão é que ele não era opção do treinador, e a ficha de lesão não desmente isso. Mas não risque o nome por aí: a base só enxerga lesão grande, em pouco mais de um quarto das linhas não há ficha nenhuma, e quando há lesão em quem jogou pouco ela custa quase o dobro de dias — pergunte ao clube antes de decidir.

*n.* {les_base} de minutagem baixa e {les_alta_base} de minutagem alta, com ponte (2022-2025) = 1.974 e 348

*Premissa.* Não mexe em premissa existente. Sugere uma nova, no grupo Montagem do elenco: minutagem baixa se lê como escolha técnica até prova em contrário, porque a ficha de lesão não separa os dois grupos.

**Por que esse nível.** (a) BH a 5%: NÃO — nenhum teste foi rodado em J01, e além disso é resultado negativo: BH corrige achados, não promove ausência. (b) Porta temporal da §6.4: NÃO, e não é calculável (minutagem por temporada). Nenhum dos dois: indício, e a frase tem de dizer por quê. São dois motivos, não um: o desenho só enxergaria a lesão a partir de 12,3% contra os 7,5% do outro grupo (§6.7, recalculado por mim em 2022-2025 com n 1.974 × 348), e a ponte com o Transfermarkt cobre 73% das linhas. O nível já estava certo; o que muda é que o motivo publicado cita só a cobertura e nunca o poder.

→ vai para **"Parece, mas não é"**.

**Números a criar/corrigir:**
  - les_base = 1974 · les_n = 138 · les_baixa_pct = 7,0 (2022-2025; hoje 2.296, 159 e 6,9 com 2026 dentro)
  - les_alta_base = 348 · les_alta_n = 26 · les_alta_pct = 7,5 — o denominador do outro lado não existe hoje em lugar nenhum, e é o lado pequeno que domina a incerteza
  - les_dias = 56 (minutagem baixa) e les_alta_dias = 32 (minutagem alta): a dose, hoje publicada só de um lado
  - les_dmin = 12,3 — a taxa mínima que este desenho enxergaria no grupo de minutagem baixa contra os 7,5% do outro (§6.7; conferido: diferença -0,48 pp, EP 1,52 pp, IC95 -3,5 a +2,5)
  - sem_ponte = 838 de 3.160 (27%) em 2022-2025, no lugar de 1.132 de 3.864 (29%)
  - as linhas casadas só por nome+ano, sem clube: ~61 das 2.322 casadas, ~8 delas com ficha de lesão — o docstring de J01.py promete 'nome + clube + ano' e o código não usa o clube; a ponte de clube já existe em T01_ponte_clubes.json

### J01-3 — REESCREVE  ·  provável → **indício**  ·  esforço: reanalise

**Hoje:** Quem cai tem menos titulares, não mais: a ressalva da falta de opção se inverte

**Proposta:** Time que cai roda o elenco inteiro: {cai_usados} jogadores na temporada contra {meio_usados} do meio da tabela

*O que vimos.* Nas quatro temporadas fechadas, os {n_cai} clubes que caíram usaram {cai_usados} jogadores em média, contra {meio_usados} dos {n_meio} do meio da tabela; quem subiu usou {sobe_usados} e não se distingue do meio. O mesmo retrato pelo avesso: em quem caiu, {cai_altos} jogadores por temporada passaram de {corte}% dos minutos do time, contra {meio_altos} no meio. É contagem, não teste — e quantos jogadores um time usou está na lista fixa do estudo como consequência de como o ano foi, nunca como característica de quem joga.

*Para o Santa Cruz.* Minutagem se lê contra o elenco do time: {corte}% dos minutos num clube que usou {cai_usados} jogadores é bem mais raro do que a mesma fatia num clube que usou {meio_usados}, e é assim que J03 a J06 têm de comparar. Não contrate por isto, e tire da tela a frase de que minutagem alta em time rebaixado é sinal mais forte: esta contagem não mede qualidade nenhuma, e a ressalva do CLAUDE.md sobre falta de opção continua de pé, esperando o J03.

*n.* {n_ct} clubes-temporada (2022-2025) = 80: {n_sobe} que subiram, {n_meio} do meio e {n_cai} que caíram

*Premissa.* Não contradiz a ressalva do CLAUDE.md sobre falta de opção — a contagem não a testa, e a versão publicada, que a dava por invertida, sai. Sugere premissa nova ao lado da m2: a fatia de minutos se lê contra quantos jogadores o time usou naquela temporada.

**Por que esse nível.** (a) BH a 5% dentro da família: NÃO — não há J01_testes.csv, nem lista pré-declarada, nem q; o 'provável' publicado repousa numa contagem. (b) Porta temporal da §6.4: NÃO, e impossível com minutagem por temporada. Nenhum dos dois: indício. Rodando o método da casa (posto dentro do ano, Welch, com e SEM fronteira, que eu conferi na base), Cai × Meio em jogadores usados dá d +1,10 (p 0,0009) com fronteira e +1,18 (p 0,0030) sem, passa em BH nos dois cortes e fica acima do mínimo detectável nos dois — isso levaria a conclusão a 'provável', mas só depois de estar no arquivo, e nunca a 'firme'. A regra da fronteira, aplicada como escrita, mata a perna do Sobe: em fatias altas Sobe × Meio só separa COM os times de fronteira (p 0,014 contra p 0,114 sem), e em jogadores usados não separa em nenhum dos dois cortes (p 0,16 e p 0,22).

**Números a criar/corrigir:**
  - n_ct = 80 · n_sobe = 16 · n_meio = 48 · n_cai = 16, no lugar do '100 clube-temporadas' digitado (o rodado foram 99, com 20 de 2026 e sem Athletico-PR 2025)
  - cai_usados = 45,6 · meio_usados = 38,4 · sobe_usados = 36,6 — jogadores usados por clube-temporada em 2022-2025 (a auditoria citou 45,0/37,5/35,6, que são as cinco temporadas com 2026 dentro)
  - cai_altos = 4,3 · meio_altos = 5,8 · sobe_altos = 6,9, no lugar de 4,1 / 6,0 / 7,1
  - o corte de robustez que J01 nunca rodou, nas duas métricas e nos dois cortes: jogadores usados Cai × Meio d +1,10 (p 0,0009) com fronteira e +1,18 (p 0,0030) sem; Sobe × Meio p 0,16 e 0,22 (não separa); fatias altas Cai × Meio d -0,70 (p 0,0143) e -0,87 (p 0,0076); fatias altas Sobe × Meio p 0,0143 com e 0,1138 sem — só aparece com a fronteira, é ruído pela regra e sai
  - a ponte de nome de clube: 'Athletico Paranaense' na minutagem contra 'Athletico-PR' na A01 deixa o único promovido de 2025 sem faixa, e o mapa já existe em T01_ponte_clubes.json; sem ele a base entregue a J03-J06 leva uma linha de clube-temporada inteira com faixa vazia
  - a marca de consequência do resultado ao lado do indicador: atletas_usados está na lista fixa CONSEQUENCIA de ranking_gaps.py ('time que perde roda o elenco'), então a conclusão vai com o rótulo 'não contrate para isto'
  - somem os 25,5 e 22,0 digitados do A07, junto com o '...na verdade' deixado no texto: são atletas rastreados pelo SkillCorner, população diferente dos 38 a 46 jogadores usados que o Wyscout conta

### J02-1 — REESCREVE  ·  firme → **indício**  ·  esforço: recalculo

**Hoje:** Sete de cada dez minutos da Série B são de jogador contratado naquele ano

**Proposta:** {contr_geral}% dos minutos jogados na Série B são de jogador que chegou ao clube naquele mesmo ano

*O que vimos.* Em 2022, 2023, 2024 e 2025, {contr_geral}% dos minutos que dá para identificar foram de jogador que chegou ao clube naquela mesma temporada. No meio da tabela, quem já estava fica com {fic_m}% dos minutos: o elenco se refaz em cerca de dois terços do tempo de jogo, todo ano. É uma contagem, não uma comparação — nenhum teste foi feito aqui —, e {n_fora} dos {n_esperado} clube-temporadas ficou de fora porque as duas bases não se encontraram em minutos suficientes.

*Para o Santa Cruz.* A montagem anual não é ajuste de elenco, é construção de elenco: em um ano, a maior parte do time que entra em campo não estava lá. Isso muda o peso do planejamento de janela e o peso do erro, porque não há base herdada para diluir uma contratação ruim. Vale como retrato do campeonato, não como receita — é assim que a Série B inteira funciona, e não é o que diferencia quem sobe.

*n.* {n} de {n_esperado} clube-temporadas, 2022–2025

*Premissa.* Sugere premissa nova no grupo Montagem do elenco: 'Na Série B o elenco se refaz todo ano — cerca de dois terços dos minutos de uma temporada são de jogadores que chegaram naquele ano. Planejar a temporada é construir um elenco, não ajustar o do ano anterior.' Nenhuma das 23 premissas de dados/premissas.json trata disso hoje.

**Por que esse nível.** (a) BH a 5%: não passa porque não existe teste — é uma contagem descritiva do nível geral, e as linhas vizinhas que existem (min_de_contratado_pct, Sobe × Meio) dão q 0,4832 com fronteira e 0,25284 sem, ambas 'sem diferença clara'. (b) Porta temporal da §6.4: não rodou e não roda — a minutagem é por temporada, não por rodada (a própria §6.4 registra isso para medida de elenco). Nenhum dos dois critérios = indício, e a frase diz por quê. O número em si é sólido: o refutador recalculou a receita do J02.py e achou mediana 69,85% e agregado 68,55% nas 79 linhas, 69,65% sem os times de fronteira — o achado contra a manchete foi derrubado 0/3.

**Números a criar/corrigir:**
  - contr_geral = 69,9 (mediana das 79 linhas de min_de_contratado_pct; agregado por minutos 68,6; sem fronteira 69,7)
  - n_esperado = 80 (já declarado em J02_indicadores.json, recorte.n_esperado)
  - n_fora = 1 (Athletico-PR 2025, cobertura 0,57 — registrar em fora_por_cobertura, hoje vazio)
  - cob_med = 90,9 e cob_min = 64,6 (cobertura da ponte, para o motivo da confiança)

### J02-2 — REESCREVE  ·  provável → **indício**  ·  esforço: recalculo

**Hoje:** Quem sobe não mantém mais a base do ano anterior — mantém menos

**Proposta:** Manter a base do ano anterior não aparece como vantagem de quem sobe

*O que vimos.* Entre os que subiram, quem já estava no clube ficou com {fic_s}% dos minutos, contra {fic_m}% do meio da tabela. Caso a caso não há padrão nenhum: entre os que subiram a fatia vai de {fic_min}% a {fic_max}%, e a diferença cabe dentro do que o acaso produz numa amostra deste tamanho, com ou sem os times que terminaram colados na linha de corte. Com {n_sobe} times que subiram contra {n_meio} do meio, só uma vantagem grande apareceria — não dá para dizer que ela não existe, só que não apareceu.

*Para o Santa Cruz.* O que este número não pode dizer é se manter ajuda ou atrapalha: permanência de elenco depende de como foi o ano anterior, então ela vem contaminada pelo resultado e descreve em vez de orientar. Para 2027 a decisão de manter ou trocar continua aberta e tem de ser tomada jogador a jogador, pelo que cada um entrega — que é a pergunta de J05 e J06. O que dá para dizer é que o Santa Cruz não precisa temer a troca grande: ela é a norma da Série B, inclusive entre os que sobem.

*n.* {n_sobe} que subiram contra {n_meio} do meio; sem os times de fronteira, {n_sobe_sf} contra {n_meio_sf}

*Premissa.* Nenhuma premissa de dados/premissas.json é tocada. Derruba duas premissas internas do estudo: a da própria pergunta do J02 ('quem sobe mantém mais a base') e a ressalva 2 de J02_indicadores.json, que dava a continuidade como livre da lista de consequência do resultado — pctFicou e novos estão nela, em ranking_gaps.py:237-238.

**Por que esse nível.** (a) BH a 5%: não passa em corte nenhum — min_de_quem_ficou_pct em Sobe × Meio dá q 0,48320 com fronteira (15 contra 48) e q 0,25284 sem (7 contra 32), selo 'sem diferença clara' nas duas linhas, com o intervalo cruzando o zero nos dois sentidos. (b) Porta temporal da §6.4: não rodou e não é partível por turno. Nenhum dos dois = indício, e a frase tem de dizer por quê — inclusive o poder: d_minimo_80 é 0,84 no corte cheio e 1,20 no sem, maior que qualquer diferença observada na parte, então 'não apareceu' não é 'não existe'. A metade afirmativa da manchete ('mantém menos') não tem teste atrás em corte nenhum (achado confirmado 2/3) e cai.

→ vai para **"Parece, mas não é"**.

**Números a criar/corrigir:**
  - n_sobe = 15, n_meio = 48, n_sobe_sf = 7, n_meio_sf = 32 (hoje a conclusão declara '{n} clube-temporadas' = 79, que inclui as 16 linhas do Cai, que não entram em teste nenhum dela)
  - fic_min = 13,9 e fic_max = 70,1 (mínimo e máximo de min_de_quem_ficou_pct entre os 15 que subiram, corte com fronteira)
  - d_min_sm = 0,84 (diferença mínima que o desenho enxergaria; fica na prova, não no texto)
  - fic_d e fic_q saem do texto e ficam só na prova, e como número, não como texto

### J02-3 — REESCREVE  ·  indício → **provável**  ·  esforço: recalculo

**Hoje:** Quem cai é o que menos mantém e o que mais roda

**Proposta:** Quem sobe concentra os minutos nos mesmos onze; quem cai usa {at_c} jogadores no ano

*O que vimos.* Os onze mais usados de quem sobe ficam com {s11_s}% dos minutos do time, contra {s11_m}% do meio da tabela, e quem cai fica em {s11_c}%. Do outro lado da mesma conta, quem cai usa {at_c} jogadores na temporada contra {at_m} do meio, tem {n300_c} com pelo menos 300 minutos contra {n300_m}, e dá {fic_c}% dos minutos a quem já estava no clube, contra {fic_m}%. Tudo isso se mantém tirando os times que terminaram colados na linha de corte; o que não separa quem sobe do meio é o número de jogadores usados ({at_s} contra {at_m}).

*Para o Santa Cruz.* Isto descreve, não ensina: quem está ganhando repete a escalação e quem está perdendo roda o elenco, e a especificação já decidiu o rótulo destes números — não contrate para isto. O teste que separaria causa de consequência não é possível com o dado que existe, porque a minutagem é por temporada e não por rodada. Serve de termômetro durante o ano, junto com o J01 ({j01_cai_altos} jogadores de minutagem alta em quem cai contra {j01_sobe_altos} em quem sobe); a alavanca de montagem continua sendo quem se contrata, não quantos minutos os onze vão dividir.

*n.* {n_sobe} que subiram e {n_cai} rebaixados contra {n_meio} do meio; sem os times de fronteira, {n_sobe_sf} e {n_cai_sf} contra {n_meio_sf}

*Premissa.* Conversa com m3 (Titulares consolidados, reservas com potencial) na direção, mas não a confirma: a concentração de minutos é consequência do resultado, então não serve de prova de que montar assim faça subir. Nenhuma premissa nova.

**Por que esse nível.** (a) BH a 5%: passa, e nos dois cortes de fronteira. Sobe × Meio, share_11: q 0,0028 com e 0,01745 sem. Cai × Meio: share_11 0,01134 e 0,00116; conc_hhi 0,00999 e 0,00116; atletas_usados 0,00268 e 0,00312; nucleo_300 0,00268 e 0,00244; min_de_quem_ficou_pct 0,03038 e 0,04028. (b) Porta temporal da §6.4: não passa — e não pode passar, porque a §6.4 registra que share_11 e conc_hhi 'realmente não podem ser partidos por turno' por falta de escalação por rodada. Um sim, um não = provável, que é exatamente a porta B da §6.5 ('separa, sem chegar à A'), onde a especificação já colocou estes indicadores. Ficam fora, pela regra da fronteira, nucleo_300 em Sobe × Meio (firme só com fronteira, q 0,02321 contra 0,12929) e jogadores_que_ficaram_pct em Cai × Meio (0,04988 contra 0,12204); atletas_usados em Sobe × Meio não separa em corte nenhum (0,21439 e 0,28266). O superlativo 'o que menos mantém' cai (confirmado 3/3): contra quem sobe nunca foi rodado e, sem fronteira, inverte de sinal. Ser consequência do resultado não mexe no selo — mexe no que a conclusão pode afirmar, e isso vai no uso prático.

**Números a criar/corrigir:**
  - at_s = 35,0 (atletas usados, mediana de quem sobe — está em J02_resumo.json e não em numeros)
  - n_cai = 16, n_cai_sf = 12, n_meio = 48, n_meio_sf = 32 (hoje o n está digitado à mão: '16 rebaixados contra 48 do meio', com d e q vindos do corte de 12 contra 32)
  - j01_cai_altos = 4,1 e j01_sobe_altos = 7,1 (copiados de J01.json; citação entre partes tem de virar marcador com valor)
  - sai a citação do A07 ('25,5 atletas contra 22,0'): é fis_atletas, atletas rastreados pelo SkillCorner, não atletas usados — mede outra coisa e não cabe nas 3 frases
  - at_cd/at_cq e fic_cd/fic_cq saem do texto; se ficarem na prova, cru, d e q têm de sair da MESMA linha do CSV (com fronteira: -1,108 e 0,00268 para atletas; -0,670 e 0,03038 para continuidade)

### J03-1 — REESCREVE  ·  firme → **indício**  ·  esforço: reanalise

**Hoje:** O titular de quem sobe é tecnicamente indistinguível do titular do meio

**Proposta:** Procuramos o titular que separa quem sobe, posição por posição, e não achamos nenhum

*O que vimos.* Comparamos {n_usado} titulares — {n_sobe_tot} de quem subiu contra {n_meio_tot} do meio, todos com {min_min} minutos ou mais na temporada — em {n_ind_setor} números técnicos dentro de cada uma das {setores} posições. Rodando com todos os times e de novo sem os que terminaram colados na linha de acesso, {firmes_dois_cortes} de {n_testes} números sobrevivem aos dois recortes. É achado fraco de propósito: com este tamanho de amostra só uma diferença grande apareceria, e nada aqui mostra se o número vem antes do acesso ou depois dele.

*Para o Santa Cruz.* O perfil técnico individual não é o que separa quem subiu: em nenhuma das {setores} posições achamos vantagem grande, e o único candidato que resiste aos dois recortes é o lateral acertar cerca de um passe a mais em cada cem — pequeno demais para virar filtro. J05 e J06 podem exigir minutagem alta e regular e o encaixe no modelo de jogo, mas não devem pedir superioridade técnica geral como requisito de acesso. O que este desenho não autoriza é a frase contrária: ele não veria diferença menor do que a que consegue enxergar, então 'não separa' não vira 'não existe'.

*n.* {n_usado} titulares — {n_sobe_tot} de quem sobe contra {n_meio_tot} do meio — em {setores} posições, 2022–2025

*Premissa.* Sugere premissa nova: na Série B a diferença de quem sobe é coletiva, não individual — e o filtro individual que sobra de pé é a minutagem alta e regular da premissa m2, não um nível técnico superior. Não contradiz m3 (titulares consolidados): rodagem comprovada continua valendo, o que cai é a ideia de que o titular de quem sobe tem números técnicos melhores.

**Por que esse nível.** (a) BH a 5% dentro da família: NÃO passa. No recorte cheio dois indicadores passavam (goleiro na bola alta, q 0,00121; meia em faltas, q 0,00726, ambos na família de 4 do setor), mas nenhum dos dois se repete sem os times de fronteira (q 0,09629 e 0,22264) — e a regra da fronteira descarta o que só aparece COM eles. Confere no J03_testes.csv e no meu recálculo. A escolha do tamanho da família não salva nada: com a família do §6.3 literal (pilar tecnico_ind × comparação SM, 84 testes) só o goleiro passaria (q 0,0252) e ele cai na fronteira do mesmo jeito; com família de 12 por setor passam os dois mesmos, e caem igual. (b) porta temporal do §6.4: NÃO rodou, e não roda nesta base — serieb_tecnico.csv é fechado por temporada, sem jogo a jogo. Zero de dois = indício. A frase tem de dizer por quê, e o motivo é poder: contando clube-temporada, que é a unidade da casa, o menor efeito detectável vai de 0,82 a 1,00 no recorte cheio (Extremo 1,00, Volante 0,93, Atacante 0,84, os outros 0,82) e de 1,14 a 1,46 sem fronteira. 'Não achamos' aqui é 'este desenho não conseguiria ver'.

→ vai para **"Parece, mas não é"**.

**Números a criar/corrigir:**
  - n_usado = 723 (titulares que realmente entraram nos 84 testes; os 907 publicados incluem 184 do Cai, que nunca entraram em teste nenhum)
  - n_sobe_tot = 179
  - n_meio_tot = 544
  - n_ind_setor = 12 (hoje o 12 está digitado à mão duas vezes no texto)
  - firmes_dois_cortes = 0 pela normalização como o código roda (setor); 1 pela normalização declarada (posição) — o rerun preenche. Se der 1, a frase nomeia o lateral
  - d_min_menor = 0.82 e d_min_maior = 1.00 (menor efeito detectável por clube-temporada, recorte cheio) — vão para a prova, não para o texto
  - d_min_sem_menor = 1.14 e d_min_sem_maior = 1.46 (o mesmo sem os times de fronteira)

### J03-2 — REESCREVE  ·  firme → **indício**  ·  esforço: recalculo

**Hoje:** O duelo defensivo separa o time, mas não o jogador

**Proposta:** Ganhar duelo defensivo é do time inteiro: posição por posição, a amostra não aponta ninguém

*O que vimos.* No time, quem sobe ganha {dd_time_pp} ponto percentual a mais de duelo defensivo do que o meio — {dd_time_s}% contra {dd_time_m}%, em {n_a06_s} temporadas de quem subiu contra {n_a06_m} do meio. Posição por posição, a maior diferença é a do volante, {dd_vol_s}% contra {dd_vol_m}%, e o intervalo dela cobre o número do time: os dois não se distinguem. É achado fraco: nenhuma posição sobrevive à correção, e o duelo defensivo do 1º turno não antecipa os pontos do 2º depois de descontar como o time já vinha pontuando.

*Para o Santa Cruz.* Não transforme duelo defensivo em requisito de contratação por posição: a vantagem que aparece no time é de cerca de {dd_time_pp} ponto percentual e nenhuma posição isolada mostra vantagem grande o bastante para virar filtro. Isso não prova que a vantagem venha de organização — a gente não mediu isso; prova só que ela não está localizada num contratado que J06 possa apontar. E o teste que pergunta se o duelo vem antes do resultado responde que não, então nem como característica de projeto ele se sustenta.

*n.* {n_a06_s} temporadas de quem sobe contra {n_a06_m} do meio, no nível do time; {n_usado} titulares em {setores} posições, no nível do jogador

**Por que esse nível.** (a) BH a 5% dentro da família: NÃO passa. No titular, o duelo defensivo não passa em nenhuma das 7 posições — o menor q é 0,16864 (volante) e o segundo é 0,16753 (extremo), os dois em 'pode ser sorte'; conferido linha a linha no J03_testes.csv. (b) porta temporal: duelos_def_pct foi testado em 19/09 e REPROVOU — parcial +0,092, p 0,416. Aqui não é 'não rodou', é 'rodou e não passou', o que é pior. Zero de dois = indício, e a frase diz por quê. Além do nível, dois números têm de mudar: o 1,59 atribuído ao time é o corte SEM fronteira (8x32), exatamente o erro que o _metodo_fronteira.md documenta; o valor que vale nos dois cortes é 0,805 (16x48), com intervalo de 0,18 a 1,52 — e esse intervalo contém o 0,535 do volante, cujo intervalo por clube é 0,09 a 1,14. Ou seja, a oposição da manchete é diferença de significância, não significância da diferença: os dois números não se distinguem. Cai junto 'o maior separador do estudo': no corte que vale ele empata com xg_por_remate_contra (0,805) e fica atrás de dist_remate (1,203), que é o único do índice que passa na porta.

→ vai para **"Parece, mas não é"**.

**Números a criar/corrigir:**
  - dd_time_pp = 0.98 (pontos percentuais; hoje o texto diz 'cerca de dois pontos percentuais' à mão, e isso dobra o número robusto)
  - dd_time_s = 60.77 e dd_time_m = 59.79 (A06_testes.csv, fronteira=com, SM, duelos_def_pct)
  - dd_vol_s = 59.87 e dd_vol_m = 58.06
  - n_a06_s = 16 e n_a06_m = 48 (hoje o texto diz '80 clube-temporadas', que é o tamanho da base e não o do teste)
  - corrigir dd_time de 1.59 para 0.805 — e mantê-lo só na prova, porque a unidade é proibida no que vimos
  - tirar de 'numeros' os campos que só existiam para o texto em unidade proibida: dd_min, dd_max, dd_zag_s, dd_zag_m

### J07-1 — REESCREVE  ·  indício → **indício**  ·  esforço: reanalise

**Hoje:** O clube pode usar nove estrangeiros e usa um — mas quem sobe usa quatro vezes mais minutos

**Proposta:** A Série B já usa {liga_ct} estrangeiros por clube — e quem sobe põe {razao_sobe_meio} vezes mais minutos neles que o meio

*O que vimos.* Nas quatro temporadas fechadas, {ct_com_algum} de {ct_total} clube-temporadas tiveram pelo menos um estrangeiro, e a liga usa {liga_ct} por clube — longe das {vagas} vagas que o regulamento permite. Quem subiu deu {sobe_min}% dos minutos a estrangeiros contra {meio_min}% do meio e {cai_min}% de quem caiu, e a diferença aparece igual sem os times colados na linha de acesso ({sobe_sem}% contra {meio_sem}%). É indício e não mais que isso: é uma contagem, sem nenhum teste, o uso de estrangeiro na liga mais que triplicou de {ano_ini} a {ano_fim} e em {ano_invertido} quem subiu usou menos estrangeiro que o meio.

*Para o Santa Cruz.* A vaga de estrangeiro não está vazia: a liga já a usa e o clube chega num mercado com preço formado. O que J08 e J09 fazem é escolher melhor dentro dele — que liga de origem se traduz para a Série B e quem atende o perfil —, não ocupar um espaço que ninguém teria visto. E como o padrão é recente, ele vale como leitura de 2024-2025, não como regra das quatro temporadas.

*n.* {est_lin} jogador-temporadas de estrangeiro ({est_pes} jogadores) em {ct_total} clube-temporadas, 2022–2025

*Premissa.* Sugere premissa nova: a Série B usa {liga_ct} estrangeiros por clube-temporada e {ct_com_algum} de {ct_total} clube-temporadas já tem pelo menos um — a vaga de estrangeiro é recurso disputado e em alta, não ocioso.

**Por que esse nível.** (a) BH a 5% na família: NÃO. Fui ao arquivo de testes e ele não existe — não há resultados/J07_testes.csv, o cabeçalho de scripts/J07.py diz 'aqui não há teste de hipótese nem BH' e a nota do J07_resumo.json repete. Não há q para conferir porque nenhum foi calculado. (b) Porta temporal da §6.4 (1º turno prevendo o 2º, com a parcial dada a pontuação do 1º turno): NÃO. O _porta_temporal.md de 19/09 mostra que ZERO das 19 partes a rodaram, e J07 não tem indicador com versão por rodada. Nenhum dos dois critérios: pela letra do CLAUDE.md isso é indício, e a frase diz por quê. O teto já era indício por outra via também ('resultados de estrangeiros na própria B são descritivos, sem aplicar o critério de conclusão'), então o nível não muda — o que muda é tudo o mais.

**Números a criar/corrigir:**
  - liga_ct — estrangeiros por clube-temporada na liga, 2022-2025, com o cruzamento refeito
  - ct_com_algum e ct_total — clube-temporadas com pelo menos um estrangeiro, de 80
  - vagas = 9 (constante do regulamento, hoje digitada à mão na manchete)
  - razao_sobe_meio — sobe_min ÷ meio_min, com o cruzamento refeito
  - sobe_min, meio_min, cai_min — % dos minutos, com a ponte de clube casada nos DOIS sentidos (Athletico-PR 2025 dentro da Sobe)
  - sobe_sem, meio_sem — os mesmos sem os times de fronteira (coluna `fronteira` de A01_clube_temporada.csv, que J07.py nunca lê)
  - sobe_por, meio_por — estrangeiros por clube-temporada, por faixa
  - est_lin e est_pes — jogador-temporadas e pessoas distintas, 2022-2025, sem 2026
  - sobe/meio por temporada e ano_invertido — a temporada em que o meio usou mais (hoje 2023)
  - ct_sobe_com_algum — em quantas das 16 clube-temporadas da Sobe o padrão aparece (o 4,3% publicado era Santos 2024 + Remo 2025)
  - cobertura_nova — % de linhas com nacionalidade depois do recasamento, por faixa

### J07-2 — REESCREVE  ·  indício → **indício**  ·  esforço: reanalise

**Hoje:** O estrangeiro que chega joga mais que o brasileiro que chega — e fica menos

**Proposta:** O estrangeiro estreia jogando mais que o brasileiro que estreia — e some da Série B no ano seguinte

*O que vimos.* Na primeira temporada na Série B o estrangeiro joga {pri_est}% dos minutos do time contra {pri_br}% do brasileiro que também estreia; comparando só quem entrou no clube naquele mesmo ano, a distância encolhe para {pri_est_nc}% contra {pri_br_nc}%. No ano seguinte, {perm_est}% dos estrangeiros reaparecem na Série B, contra {perm_br}% dos brasileiros. É indício: são contagens sem teste nenhum, e 'reaparecer na Série B' não é 'ficar no clube' — quem subiu para a Série A ou saiu do país conta como saída.

*Para o Santa Cruz.* Quem traz estrangeiro traz para jogar, e ele joga desde a estreia — o técnico o usa. Sobre o rendimento dentro de campo esta parte não diz nada: ela só mede quanto ele jogou. O que entra na conta é a rotatividade — só {perm_est}% seguem na Série B no ano seguinte —, então contrato, janela de saída e custo de reposição têm de ser pensados para uma temporada.

*n.* Estreia: {n_pri_est} estrangeiros contra {n_pri_br} brasileiros. Ano seguinte: {n_perm_est} contra {n_perm_br}. Por posição, na prova: {n_pos_min} a {n_pos_max} estrangeiros por posição.

*Premissa.* Sugere premissa nova: contratar estrangeiro na Série B é aposta de uma temporada — ele estreia jogando mais que o brasileiro que estreia e só {perm_est}% reaparecem na liga no ano seguinte.

**Por que esse nível.** (a) BH a 5% na família: NÃO — não existe J07_testes.csv; a parte não calcula um único q, então não há o que conferir. (b) Porta temporal da §6.4: NÃO — a permanência olha o ano seguinte, que não é a porta (a porta é o 1º turno prevendo o 2º, com a parcial); o _porta_temporal.md registra que nenhuma das 19 partes a rodou. Nenhum dos dois: indício, e a frase diz por quê — são contagens sem teste, e a medida de permanência responde 'reapareceu na Série B', não 'ficou no clube'.

**Números a criar/corrigir:**
  - perm_est e perm_br — permanência com o alvo montado sobre TODAS as linhas da base (3.864), não só as que casaram nacionalidade; os três pareceres reproduzem 29,5% e 50,7% contra os 25,0% e 48,5% publicados
  - n_perm_est e n_perm_br — um n por frase, os dois lados declarados, como em A02-1 e A06-2
  - pri_est e pri_br — refeitos com o cruzamento de nomes corrigido
  - pri_est_nc e pri_br_nc, com n — os dois lados restritos a quem entrou no clube naquele ano, por `no_clube_desde` de serieb_elencos.csv (a diferença cai de 8,4 para ~6,5 pontos)
  - n_pos_min e n_pos_max — o n de cada posição, para a frase por posição descer para a prova
  - cobertura_perm_por_ano — a cobertura por temporada, para a ressalva: 52% da coorte estrangeira é julgada contra 2026, que é a de pior cobertura

### J07-3 — REESCREVE  ·  firme → **indício**  ·  esforço: reanalise

**Hoje:** O estrangeiro da Série B é sul-americano, e o passaporte europeu é usado ao contrário

**Proposta:** O estrangeiro da Série B é vizinho: {pct_viz}% vêm de Argentina, Uruguai, Colômbia e Paraguai

*O que vimos.* Nas quatro temporadas fechadas, {sulamer} dos {total_est} estrangeiros são sul-americanos, nesta ordem: Argentina {arg}, Uruguai {uru}, Colômbia {col} e Paraguai {par}; Portugal ({por}) é o único europeu com mais de um caso. Contado por pessoa em vez de por temporada a lista muda de ordem — um mesmo jogador reaparece em até cinco temporadas —, e é a contagem por pessoa que responde quantos estrangeiros jogaram a Série B. É indício: é uma contagem, sem teste nenhum, e a origem sai da nacionalidade e não da liga de onde o jogador veio — boa parte chegou de clube brasileiro e {de_clube_europeu} chegaram de clube europeu.

*Para o Santa Cruz.* Onde procurar é a vizinhança: Argentina, Uruguai, Colômbia e Paraguai. São essas as ligas para as quais J08 precisa do fator de conversão primeiro, e é dali que J09 monta a lista. A Europa não sai da conta: {de_clube_europeu} dos estrangeiros chegaram de clube europeu — é caminho minoritário, não caminho fechado.

*n.* {total_est} jogador-temporadas de estrangeiro, de {total_pes} jogadores distintos, 2022–2025

*Premissa.* Sugere premissa nova: o mercado de estrangeiro da Série B é sul-americano — Argentina, Uruguai, Colômbia e Paraguai respondem por {pct_viz}% dos casos —, e é dessas ligas que o fator de conversão de J08 precisa primeiro. Derruba a premissa implícita de que o passaporte europeu é usado ao contrário na Série B: contados no mesmo cruzamento, dupla nacionalidade com Brasil e estrangeiro de fato aparecem em número parecido (na base crua de elencos, 310 contra 280).

**Por que esse nível.** (a) BH a 5% na família: NÃO — fui procurar o q e não há arquivo de testes: resultados/J07_testes.csv não existe e scripts/J07.py declara no cabeçalho que não há teste de hipótese nem BH. (b) Porta temporal da §6.4: NÃO — contagem de nacionalidade não tem versão por turno e a parte não a roda; o _porta_temporal.md confirma que nenhuma parte rodou. Nenhum dos dois: indício. O 'firme' publicado se apoiava em 'contagem completa das cinco temporadas', que é falso duas vezes — 2026 está em curso e o _registro.md manda usar 2022-2025, e 18,3% das linhas ficaram sem nacionalidade, perda que não é aleatória (conferi: casam 61 de 280 linhas estrangeiras contra 238 de 310 de dupla nacionalidade).

**Números a criar/corrigir:**
  - total_est (jogador-temporadas) e total_pes (pessoas), só 2022-2025, com o cruzamento refeito pelo módulo de identidade da §1.1
  - sulamer e pct_viz — sul-americanos no total, e o peso de Argentina+Uruguai+Colômbia+Paraguai
  - arg, uru, col, par, por — por linha E por pessoa, porque a ordem muda entre as duas contagens (hoje o texto lista países como se fossem pessoas)
  - de_clube_europeu — casos cujo `clube_anterior` é clube europeu, para a ressalva que substitui 'Europa não é o mercado'
  - dupla_lin e est_lin no MESMO cruzamento — para provar que o contraste 40 x 11 era artefato e mostrar a razão real (~1:1)
  - cobertura_nova por faixa e por ano — 'contagem incompleta, com o cruzamento de nome falhando mais no estrangeiro' no lugar de 'contagem completa'

### T01-1 — REESCREVE  ·  firme → **indício**  ·  esforço: recalculo

**Hoje:** Time da Série B troca de treinador duas vezes por ano, e só 3 em cada 10 terminam a temporada com quem começou

**Proposta:** Time da Série B tem {mediana_efetivos} treinadores por ano, e só {termina_com_quem_comecou} de {clube_temporadas_fechadas} terminaram a temporada com quem começou

*O que vimos.* Nas {clube_temporadas_fechadas} clube-temporadas fechadas de 2018 a 2025, a mediana é de {mediana_efetivos} treinadores efetivos e a média de {media_trocas_fechadas} troca por ano — uma troca, não duas. Só {termina_com_quem_comecou} times terminaram a temporada com o treinador que a abriu, um em cada quatro, e os interinos dirigiram {rodadas_interino} das {rodadas_com_dono} rodadas com treinador identificado. É contagem de uma fonte só, sem nenhum teste por trás, e por isso entra como indício.

*Para o Santa Cruz.* Orçar comissão técnica para um ano é orçar duas: o clube mediano da Série B troca uma vez, e quem planeja a temporada com um nome só está planejando a exceção. A reserva de rescisão e de segunda comissão entra na conta desde o início, não como imprevisto. E o perfil de jogador de J05 não pode ficar amarrado a um modelo de jogo que tem uma chance em quatro de chegar inteiro em novembro.

*n.* {clube_temporadas_fechadas} clube-temporadas fechadas (2018–2025); 2026 em curso fica à parte

*Premissa.* Ajusta m5 ("Comissão técnica top — investir"): o custo da comissão tem de ser orçado para mais de uma comissão por temporada. Sugere premissa nova no grupo Orçamento: reserva de rescisão e recontratação de comissão técnica, dimensionada pela mediana de dois treinadores por ano na Série B.

**Por que esse nível.** (a) BH a 5% dentro da família: NÃO — T01 não rodou teste nenhum; não existe resultados/T01_testes.csv e nem scripts/T01.py nem scripts/T01_rodadas.py importam scripts/_metodo.py. (b) porta temporal da §6.4: NÃO — uma contagem de trocas de treinador não tem indicador do 1º turno a prever os pontos do 2º, e zero das 19 partes rodou a porta como a §6.4 define. Zero de dois critérios: pela letra do CLAUDE.md isso é indício, e a frase diz por quê. Conferi os números corrigidos na base (T01_rodada_treinador.csv reagrupado pelos blocos de meses de A01.py): 180 clube-temporadas, 160 fechadas, mediana 2 efetivos, média 2,32 (= 1,32 troca), 40 de 160 terminam com quem começou.

**Números a criar/corrigir:**
  - clube_temporadas = 180 (era 188): temporada pelos blocos de meses com jogo, como A01.py:blocos_de_temporada
  - clube_temporadas_fechadas = 160 (2018–2025)
  - mediana_efetivos = 2, como inteiro (hoje o campo grava 2.0 e sairia "2,0 treinadores" na tela)
  - media_trocas_fechadas = 1,3 (média de 2,32 efetivos por clube-temporada fechada, menos 1)
  - termina_com_quem_comecou = 40 de 160: o efetivo da primeira rodada com dono é o mesmo da última
  - um_efetivo_so = 39 de 160 e pct = 24 (era 54 de 188 e 29)
  - rodadas_com_dono = 6.546 (o que a conta usou) e rodadas_jogadas = 6.608; rodadas_sem_dono = 62 — o denominador de 6.546 fica, o achado que pedia 6.608 foi derrubado 0/3
  - 2026 sai da conta por temporada ou entra à parte: sozinha dá 10 de 20 com um treinador só, contra 20–35% em cada ano fechado, porque só 27 das 38 rodadas foram jogadas
  - dois ou mais trocas (3+ efetivos) = 67 de 160 nas fechadas, 42% — o número que desmente o "duas vezes" e vale citar na prova

### T01-3 — REESCREVE  ·  firme → **indício**  ·  esforço: reanalise

**Hoje:** O nome do treinador deixou de ser o que não dá

**Proposta:** O nome do treinador deixou de ser o que não dá, e duas fontes contam a mesma história

*O que vimos.* A etapa 15 da Protótipo dizia que não havia nome de treinador em base nenhuma e estimava de {etapa15_min} a {etapa15_max} passagens para {etapa15_clube_temporadas} clube-temporadas; a coleta entregou {passagens_2226} nessa mesma janela, e {passagens_temporada} em {clube_temporadas} clube-temporadas de {temporadas} temporadas. A conferência contra uma segunda fonte, que a parte dava como não feita, existe e passa: das {sofa_10} passagens de dez jogos ou mais do Sofascore que já estavam em casa desde 14/09, {sofa_batem} batem com a coleta no mesmo clube e no mesmo ano, e as que não batem são apelido do mesmo homem — Marcinho é Márcio Freitas no Ituano de 2023, com as mesmas {marcinho_rodadas} rodadas dos dois lados. Ainda é indício: é contagem, não teste, e {cobertura_buraco} clube-temporadas somam {rodadas_sem_dono} rodadas sem treinador conhecido.

*Para o Santa Cruz.* O clube passa a julgar treinador pelo histórico inteiro na Série B — quantas rodadas comandou, em quais clubes, com que elenco — e não pela última campanha. Quem aparece em três clubes é histórico conferível; quem aparece em um é aposta. T02, T03 e T04 ficam destravadas com essa base.

*n.* {passagens_temporada} passagens-temporada em {clube_temporadas} clube-temporadas, 2018–2026 (era 506 em 188)

*Premissa.* Não trata de nenhuma premissa de dados/premissas.json. Contradiz, sim, uma frase do próprio CLAUDE.md, em "O que a base não tem": "T01 a T04. Nenhuma base tem nome de treinador". É falsa desde 14/09 — dados/bola_parada.json traz 280 passagens de Série B com treinador, clube, jogos e datas, de 2022 a 2026, vindas do Sofascore. A frase é do arquivo do dono e a correção é dele.

**Por que esse nível.** (a) BH a 5% dentro da família: NÃO — não há teste nenhum em T01. (b) porta temporal da §6.4: NÃO — não se aplica a uma coleta. Zero de dois: indício pela letra do arquivo, e a frase diz por quê (é contagem, e 62 rodadas ficaram sem dono). A conferência independente que apareceu em 19/09 (Sofascore, 143 de 157) fortalece muito a coleta e fecha o "em aberto" da parte, mas não é nenhum dos dois critérios da régua: tira a ressalva, não sobe o selo. Também tirei do motivo da confiança o "zero jogo contado duas vezes": é propriedade do modelo de um dono por jogo, não conferência que poderia ter falhado. O pedido de rebaixar por causa da cobertura foi derrubado 0/3 e não entra: refiz e a cobertura se sustenta em 151 exatos de 180.

**Números a criar/corrigir:**
  - passagens_temporada = 492 (era 506), com a temporada saindo dos blocos de meses com jogo — conferi na base: 492, e NÃO os 497 que o auditor propôs; o parecer do cético está certo
  - clube_temporadas = 180 (era 188)
  - cobertura_exata = 151 de 180 (era 159 de 188); cobertura_buraco = 29; rodadas_sem_dono = 62 de 6.608 rodadas jogadas
  - cobertura_sobra sai do confianca_motivo: o zero é garantido por construção (dono[clube][data] = um treinador só), não é conferência
  - etapa15_min = 250, etapa15_max = 400 e etapa15_clube_temporadas = 100 — por marcador; hoje "250 a 400" está digitado no texto e etapa15_estimativa nunca é usado
  - passagens_2226 = 276, na janela exata da estimativa (2022–2026, 100 clube-temporadas): é esse número que se compara com 250–400, não o 506
  - sofa_10 = 157 e sofa_batem = 143 (cruzamento de 19/09 contra dados/bola_parada.json; refiz com ponte de clube própria e deu 144 — a diferença é casamento de nome curto, não a base)
  - marcinho_rodadas = 30 (Ituano 2023, 30 dos dois lados); guardar também Alex = Alexsandro de Souza, Operário-PR 2025, 26 dos dois lados
  - com_10_rodadas = 278 (era 273) e passagens_brutas = 1.160, que hoje está em numeros e não é usado por conclusão nenhuma

### T02-1 — REESCREVE  ·  firme → **indício**  ·  esforço: recalculo

**Hoje:** No G4 quem manda é o tamanho do elenco, não o nome do treinador

**Proposta:** No G4 o que pesa é o preço do elenco

*O que vimos.* Clube com elenco entre os 5 mais caros do ano passa, em média, {ct_top5_rod} rodadas no G4; do 6º ao 10º elenco, {ct_meio_rod}; do 11º para baixo, {ct_baixo_rod} — e {ct_baixo_zero} dos {ct_baixo_n} clubes desse último grupo não passam uma rodada sequer lá. A distância que a conta sustenta é a dos 5 mais caros contra o 11º para baixo; entre os 5 mais caros e o 6º-10º a diferença é pequena demais para se separar do acaso. Fica como indício porque é contagem: esta parte nunca comparou treinador com treinador, e o valor do elenco só existe medido na temporada inteira, então não dá para mostrar que ele vem antes do resultado.

*Para o Santa Cruz.* Currículo de treinador com muito tempo no G4 diz, antes de tudo, o caixa do clube em que ele estava: na lista curta, cada nome tem de vir com o valor do elenco que comandou em cada ano. Para o Santa Cruz, que não vai ter elenco do top-5, o alvo é quem fez tempo de G4 com elenco do 11º para baixo — grupo em que a mediana é {ct_baixo_mediana} rodada no G4.

*n.* 80 clubes-temporada de 2022 a 2025 (20 com elenco top-5, 20 do 6º ao 10º, 40 do 11º para baixo); 2026 fica à parte, como teste

*Premissa.* Confirma a ressalva aceita pelo dono em 15/09 ('elenco valioso tende a ter isso; o estudo não separa as duas coisas') e sugere premissa nova no grupo Montagem do elenco: tempo no G4 anda com o preço do elenco, e todo currículo — de treinador ou de jogador — é lido ao lado do valor do elenco em que ele trabalhou.

**Por que esse nível.** (a) BH: não passou, porque não foi rodado — não existe resultados/T02_testes.csv e scripts/T02.py não importa _metodo.py (sem bh(), sem cohen_d, sem ic_por_clube). Rodando o método da casa por fora, a família das três comparações de faixa de valor dá q 0,005 no top-5 contra o 11º-para-baixo (d 0,99, IC por clube [0,48;1,80]) e q 0,33 no top-5 contra o 6º-10º; ou seja, escrever esse teste dentro de T02.py sobe esta conclusão para provável. (b) Porta temporal: não passou e não é passável — tm_valor_total é instantâneo de temporada e não tem versão por turno (_porta_temporal.md §4, H_dinheiro 'não calculável por turno'), então firme é impossível aqui. Nenhum dos dois = indício.

**Números a criar/corrigir:**
  - ct_n = 80 (clubes-temporada 2022–2025, unidade da casa, no lugar das 151 passagens)
  - ct_top5_rod = 14,6 · ct_meio_rod = 9,4 · ct_baixo_rod = 3,2 (média de rodadas no G4 por clube-temporada, em vez de 34,4/22,5/7,8 em %)
  - ct_top5_n = 20 · ct_meio_n = 20 · ct_baixo_n = 40
  - ct_top5_mediana = 9 · ct_meio_mediana = 6 · ct_baixo_mediana = 0 (rodadas no G4; fecha o furo do 'a mediana é ZERO' escrito à mão)
  - ct_baixo_zero = 22 (de 40 clubes-temporada do 11º elenco para baixo, sem uma rodada no G4; substitui a frase falsa sobre 'a maioria dos times')
  - T02_faixa_valor.csv: o ranking de valor por temporada e a quebra top5/6º-10º/11º+ gravados por T02.py, hoje inexistentes no pipeline
  - T02_testes.csv: Welch no posto dentro da temporada, d de Cohen, IC95 por clube e BH nas 3 comparações — q_top5_baixo = 0,005 (d 0,99), q_meio_baixo = 0,056, q_top5_meio = 0,33 (conferidos com scripts/_metodo.py)

### T02-2 — REESCREVE  ·  provável → **indício**  ·  esforço: recalculo

**Hoje:** Um treinador só repete G4 em clubes diferentes: Eduardo Baptista

**Proposta:** O pior ano de Eduardo Baptista ainda teve o time um terço das rodadas no G4 — nenhum outro chega perto

*O que vimos.* Nas {eb_passagens} passagens de 2022 a 2025, em {eb_clubes} clubes, a pior teve o time {eb_pior_rod} rodadas no G4 em {eb_pior_tot} e a melhor, {eb_melhor_rod} em {eb_melhor_tot} — é o piso mais alto entre os {multi} treinadores que passaram por dois clubes ou mais, e o segundo, {eb_seg_nome}, tem {eb_seg_rod} em {eb_seg_tot} no pior ano dele. Dois desses três anos são no Novorizontino, com o {eb_val_2023}º e o {eb_val_2024}º elencos mais caros do ano e {eb_ppj_nov} ponto por jogo; o terceiro é o Criciúma de 2025, que tinha o {eb_val_cri}º elenco — esse não é clube sem dinheiro. Fica como indício: é o melhor nome escolhido entre {multi}, são {eb_passagens} passagens em {eb_clubes} clubes, e nada aqui mostra que o número vem antes do resultado.

*Para o Santa Cruz.* É o nome que sobra para a lista curta de T04, mas pelo piso e não pelo pico: o que ele mostrou foi não afundar em dois clubes diferentes. Na conversa, pedir o elenco de cada ano ao lado — só as duas temporadas do Novorizontino foram com elenco barato. Disponibilidade e custo ficam para validação externa.

*n.* 3 passagens, 2 clubes, 108 rodadas (2022–2025); a passagem no Criciúma de 2026 fica à parte, com a base da temporada incompleta (falta Vila Nova 0×2 Criciúma)

**Por que esse nível.** (a) BH: não passou — não há teste nenhum nesta conclusão (T02.py não importa _metodo.py, não existe T02_testes.csv) e o nome é o melhor escolhido entre 28 treinadores multiclube, caso em que a §6.3 ainda exigiria o nulo do garimpo, que não foi rodado. (b) Porta temporal: não passou — o próprio em_aberto da parte registra que falta, e %G4 e ponto por jogo do mesmo período são o resultado, não algo medido antes dele. Nenhum dos dois = indício; o 'amostra pequena' que o confianca_motivo já invocava é literalmente a segunda definição de indício no CLAUDE.md, não de provável.

**Números a criar/corrigir:**
  - eb_passagens = 3 e eb_rodadas = 108 (2022–2025), no lugar de 4 e 134, que embutiam 26 rodadas de 2026 em curso e com base incompleta
  - eb_pior_rod = 12 / eb_pior_tot = 32 (Criciúma 2025) e eb_melhor_rod = 20 / eb_melhor_tot = 38 (Novorizontino 2024) — o piso e o teto em rodadas, no lugar de 38% e 53%
  - eb_seg_nome = Jair Ventura · eb_seg_rod = 5 · eb_seg_tot = 27 (Avaí 2025): o segundo piso mais alto, que derruba o 'todos os outros são estáveis em zero' (em 2022–2025 quatro multiclube têm piso acima de zero)
  - eb_ppj_nov = 1,67 e eb_xg_nov = 0,56 em 76 rodadas — os números do recorte Novorizontino, no lugar de 1,69 e 0,41, que são o total das quatro passagens
  - eb_val_cri = 8 (Criciúma 2025, 8º elenco mais caro do ano), ao lado de eb_val_2023 = 10 e eb_val_2024 = 16
  - multi = 28 treinadores com dois clubes ou mais em 2022–2025 (eram 34 com 2026)

### T02-3 — REESCREVE  ·  firme → **indício**  ·  esforço: recalculo

**Hoje:** Histórico de G4 não se transfere de um clube para outro

**Proposta:** O tempo no G4 no clube anterior não anuncia o do clube seguinte

*O que vimos.* Dos {multi} treinadores que passaram por dois clubes ou mais de 2022 a 2025, {osc_n} têm um ano sem uma rodada sequer no G4 e outro com o time lá em mais de 8 de cada 10 rodadas que comandaram: {oscilam}. E o ano bom quase não foi melhor no placar: nesses {osc_n} casos o ano de mais tempo no G4 rendeu {osc_dppj} ponto por jogo a mais que o ano zerado, e em {osc_piores} deles rendeu o mesmo ou menos. Fica como indício, e não como prova de que nada se transfere: com {multi} nomes só uma ligação forte apareceria neste desenho, e a que aparece do primeiro clube para o seguinte é fraca.

*Para o Santa Cruz.* Não contratar pelo melhor ano de G4 de ninguém: o pico não se repete no clube seguinte — e nem no mesmo clube, porque nos {mc_pares} casos de treinador que repetiu clube a oscilação é do mesmo tamanho. O que sobra para comparar nomes é o ponto por jogo de cada passagem, com o valor do elenco ao lado.

*n.* 28 treinadores com dois clubes ou mais (2022–2025); 2026 fica à parte, como teste

*Premissa.* Ajusta a m5 ('Comissão técnica top — investir'): investir na comissão continua valendo, mas a base não oferece jeito de identificar o treinador top pelo tempo no G4 — esse critério não serve para escolher.

**Por que esse nível.** (a) BH: não passou — nenhuma das duas contagens foi testada (não existe T02_testes.csv; T02.py não importa _metodo.py e nem gera os quatro marcadores da frase). (b) Porta temporal: não passou — não foi rodada em lugar nenhum da parte. Nenhum dos dois = indício, e aqui o nível vem com um agravante que a §6.7 manda escrever: é conclusão negativa sem poder calculado — com 28 nomes, o desenho só enxergaria uma ligação forte (mínimo detectável ~0,51 a 80%), e a que aparece do primeiro clube para o seguinte é 0,11. 'Contagem completa' não é um terceiro caminho para firme.

→ vai para **"Parece, mas não é"**.

**Números a criar/corrigir:**
  - multi = 28 (2022–2025), no lugar de 34 — seis multiclube só existem por 2026, temporada em curso e em que o G4 nem é mais a zona de acesso
  - osc_n = 7 e oscilam = 'Claudinei Oliveira, Enderson Moreira, Guto Ferreira, Jorginho, Léo Condé, Mozart e Vagner Mancini' — pelo critério que a própria frase enuncia faltava Claudinei Oliveira (Vila Nova 2023, 18 de 21 rodadas no G4, e três passagens em zero)
  - osc_dppj = 0,12 e osc_piores = 3 de 7: a diferença mediana de ponto por jogo entre o ano de mais G4 e o ano zerado, e em quantos o ano bom rendeu igual ou menos (Mancini 1,62 contra 1,90; Enderson 1,41 contra 1,47; Claudinei 1,67 contra 1,67)
  - mc_pares = 8: pares de treinador que repetiu o mesmo clube em 2022–2025, com oscilação mediana de 22,4 pontos percentuais contra 21,7 entre clubes — é o número que derruba o 'é o clube em que ele estava'
  - sai amp_mediana: 21,7 contando todas as rodadas e 3,5 contando só da 10ª em diante (as duas contagens que o CLAUDE.md exige em T02). O número vira três vezes conforme o corte, então não pode ir ao texto; a cauda dos 50+ sobrevive aos dois jeitos de contar (8 e 9) e é ela que fica
  - para a prova: r 0,11 do primeiro clube para o seguinte (n=28, p=0,59) contra 0,51 de mínimo detectável a 80% — é o poder que a §6.7 manda publicar para que 'não se transfere' não vire 'não existe'
  - os quatro marcadores passam a ser gravados por T02.py; hoje nenhum deles é produzido pelo script

### T03-2 — REESCREVE  ·  firme → **indício**  ·  esforço: recalculo

**Hoje:** E o time não muda quando o treinador chega

**Proposta:** Trocar o treinador mexe muito no time, mas cada time vai para um lado

*O que vimos.* Em {ad_n} trocas de 2022 a 2025, com pelo menos 8 jogos antes e 8 depois no mesmo clube e na mesma temporada, o time muda bastante: em cada traço ele anda de {ad_mexe_min} a {ad_mexe_max} posições entre os 20 do campeonato. Só que anda para lados diferentes — em nenhum dos sete traços a maioria das trocas empurra o time para o mesmo lado, e somando todas sobra quase nada. É indício porque um movimento comum a todas as trocas só apareceria se valesse de {dmin_min} a {dmin_max} posições, e porque quatro dos sete traços são de xG, régua fraca e que mexe com o placar.

*Para o Santa Cruz.* Trocar treinador no meio da temporada não compra um modelo de jogo novo: o placar melhora ({pts_antes} para {pts_depois} ponto por jogo, subindo em {ad_sobe} das {ad_n} trocas), mas a mesma conta feita sem troca nenhuma — a passagem de um só treinador cortada ao meio — anda na direção oposta ({placebo_antes} para {placebo_depois}), o que é o time voltando ao normal depois do fundo do poço. Se for para trocar, troque por gestão e por resultado, não esperando outro jeito de jogar; e marque esta conclusão como podendo ser efeito do placar, porque xG criado e xG sofrido mudam com ele e a base não permite o recorte por estado do jogo.

*n.* {ad_n} trocas em {ad_ct} clube-temporadas ({ad_cl} clubes), 2022–2025 — as janelas se sobrepõem, porque o 'depois' de uma troca vira o 'antes' da seguinte

*Premissa.* Nenhuma premissa de dados/premissas.json trata disso, e não cabe sugerir uma nova: o desenho compara o treinador novo com o anterior no mesmo elenco e não separa o efeito da troca do retorno à média.

**Por que esse nível.** (a) BH a 5% na família: NÃO — sete Wilcoxon sem nenhuma correção, e não há q em lugar nenhum (não existe T03_testes.csv). Mesmo se rodasse não passaria: o menor p nas fechadas é 0,31. (b) Porta temporal da §6.4: NÃO — o T03 não a rodou. Dois nãos = indício. Somado ao poder que ninguém calculou (o desenho só enxerga movimento comum de 2,4 a 3,5 posições entre os 20 clubes) e à régua do xG, medida em 0,30 e presente em quatro dos sete traços, 'firme' não tinha como nascer aqui.

→ vai para **"Parece, mas não é"**.

**Números a criar/corrigir:**
  - ad_n sem 2026: 66 trocas (as 7 de 2026 saem do principal e vão a teste, à parte), e o n declarado por clube-temporada: 51 clube-temporadas, 31 clubes
  - ad_mexe_min e ad_mexe_max: mediana do quanto cada troca mexe o time em cada traço, convertida em posições entre os 20 clubes — 4 a 7,5 nas fechadas
  - dmin_min e dmin_max: mudança comum mínima que o desenho enxerga a 80%, em posições — 2,4 a 3,5 (12,0 a 17,7 na escala de 0 a 100). Sai do desvio das diferenças com _metodo.d_minimo(), que T03.py nunca importou
  - quantas trocas sobem e quantas descem em cada traço (35/28, 27/34, 34/29, 30/33, 32/31, 36/26, 31/31 nas fechadas), para sustentar 'cada time vai para um lado' em contagem e não em p
  - pts_antes, pts_depois e ad_sobe: 1,15 para 1,32 ponto por jogo, subindo em 43 das 66 trocas
  - placebo_antes e placebo_depois: a mesma conta sem troca nenhuma, passagem de um só treinador cortada ao meio, 1,55 para 1,33 ponto por jogo em 75 casos — é o número que desmente a frase antiga 'resolve por outro caminho que este dado não vê'
  - BH a 5% nos sete testes e reamostragem por clube, porque 66 casos não são 66 observações independentes
  - ressalva da régua do xG (0,30, abaixo do mínimo de 0,40 da casa) no confianca_motivo, e a lista explícita dos itens do índice do A14 que não foram medidos (xgc_casa e dd_casa), no lugar de 'os traços que separam quem sobe'

### T04-1 — REESCREVE  ·  provável → **indício**  ·  esforço: recalculo

**Hoje:** A lista curta tem um nome só: Eduardo Baptista

**Proposta:** A lista curta tem um nome com amostra — Eduardo Baptista —, e ele nunca subiu

*O que vimos.* Ordenando os {n_lista} treinadores com 30 rodadas ou mais nas quatro temporadas fechadas pela PIOR passagem de cada um, os dois primeiros têm uma passagem só, nos elencos {ca_valor}º e {pz_valor}º mais caros do ano: o time deles ficou no G4 em {ca_piso}% e {pz_piso}% das rodadas, e não há segunda passagem para comparar. O terceiro é Eduardo Baptista, com {eb_pass} passagens em {eb_cl} clubes e {eb_rod} rodadas, time no G4 em {eb_piso}% das rodadas na pior delas e {eb_med}% no conjunto, com elencos {eb_valores} mais caros do ano — e as três terminaram em 5º lugar, {eb_dist}. Nada disso passou por teste algum: é a ordenação do que já aconteceu entre {n_lista} nomes, e por isso entra como indício, não como recomendação.

*Para o Santa Cruz.* Serve para reduzir a conversa a um nome, não para decidir: é o único treinador da base com mais de um clube e resultado que se repete, mas em três temporadas ele parou três vezes em 5º, com elenco de meio de tabela em dinheiro. Para avaliar um nome de fora da lista, o que a base sustenta é olhar a pior temporada do candidato, não a melhor, e desconfiar de quem tem uma temporada boa só, feita no elenco mais caro do ano. Disponibilidade e custo ficam para validação externa, como o CLAUDE.md manda.

*n.* {eb_rod} rodadas em {eb_pass} passagens e {eb_cl} clubes, nas temporadas fechadas de 2022 a 2025; 2026 entra só como teste

**Por que esse nível.** (a) Passou em BH a 5% dentro da família? NÃO. Fui ao <PARTE>_testes.csv e ele não existe: não há resultados/T04_testes.csv, e scripts/T04.py só ordena T02_passagem.csv por min(pct_g4) — nenhum p, nenhum q, nenhum BH, e grep -c '_metodo' devolve 0 em T01.py, T01_rodadas.py, T02.py, T03.py e T04.py. Não há q para conferir em lugar nenhum. (b) Passou na porta temporal como a §6.4 define? NÃO. Nunca foi rodada aqui, e a medida de perfil que a conclusão usa é a média de 7 traços dos quais só dist_remate tem prova de anterioridade (_porta_temporal.md §3 e §5: entradas_area parcial +0,211 p 0,0599, xg_por_remate +0,093, xg_por_remate_contra −0,026, duelos_def_pct +0,092). Zero dos dois critérios: pela letra do arquivo é indício, e a frase diz por quê.

**Números a criar/corrigir:**
  - n_lista = 30 (treinadores com 30+ rodadas, lista refeita só com 2022–2025; hoje o JSON publica 33 porque inclui 2026) — conferido rodando o T04.py com o filtro
  - eb_pass = 3 e eb_rod = 108 (hoje 4 e 134, inflados pela passagem do Criciúma 2026, que vem marcada em_curso=1 e base_incompleta=1 em T02_passagem.csv e que o T04.py não lê)
  - eb_med = 47,2 (hoje 47,0) e eb_piso = 37,5 (não muda)
  - eb_valores = "10º, 16º e 8º" — os três elencos, em lugar do marcador eb_valor=9, que é mediana e vinha com 2026 dentro; a mediana das três fechadas é 10º
  - eb_dist = "duas a um ponto do 4º colocado e uma empatada em pontos com ele" — de A01_clube_temporada.csv: dist_g4 −1 em 2023, 0 em 2024 e −1 em 2025 (o auditor escreveu "sempre a um ponto" e o cético corrigiu: em 2024 é empate em pontos)
  - eb_temps = "2023 Novorizontino, 5º com 63 pontos · 2024 Novorizontino, 5º com 64 · 2025 Criciúma, 5º com 61" — substitui o eb_temps atual, que mistura 2026 e percentuais de G4
  - carp_piso = 31,2 e o 4º da lista no corte fechado passa a ser Thiago Carpini com 1 passagem (hoje aparece com 2 por causa do Fortaleza 2026)
  - eb_piso10 = 41,4 e n_lista10 = 22 — a contagem a partir da 10ª rodada, que o CLAUDE.md pede no T02: nela Eduardo Baptista passa a 1º da lista, mas só porque Pezzolano e Carille caem abaixo do corte de 30 rodadas; vai para a prova, não para o texto
  - SAEM eb_ind (70,1), eb_ind_piso (56,1) e cauan_ind_piso (13,6): são percentil e não podem aparecer no que vimos; o índice de perfil fica só na prova, rotulado como descrição do clube-temporada, não do treinador

### T04-2 — REESCREVE  ·  firme → **indício**  ·  esforço: recalculo

**Hoje:** A pergunta do treinador ideal não tem resposta preditiva nesta base

**Proposta:** O histórico do treinador não reaparece no clube seguinte — e esta base não conseguiria ver se reaparecesse

*O que vimos.* Entre os {t02_multi} treinadores que passaram por dois clubes ou mais, a diferença típica entre a melhor e a pior passagem é de {t02_amp_mediana} pontos percentuais do tempo em que o time fica no G4, e {t02_amp50} deles variam mais de 50 pontos percentuais: uma passagem quase sempre no G4 e outra quase nunca. O jeito de jogar também não acompanha o treinador de um clube para outro, em {t03_pass} passagens de {t03_tec} nomes, e o time não muda nos {ad_n} casos de troca no meio da temporada — mas com {t02_multi} treinadores multiclube este desenho não enxergaria nem uma repetição de tamanho médio, e o pouco que ele mediu aponta para o lado de haver alguma. Por isso é indício e não conclusão fechada: é falta de prova de que o treinador se repete, não prova de que ele não se repete.

*Para o Santa Cruz.* Não pague pelo currículo de G4 nem pelo modelo de jogo do treinador: nenhum dos dois reaparece no clube seguinte, e o estudo também não consegue afirmar que não reapareceriam. O que resta de prático é olhar a pior temporada do candidato em vez da melhor, e decidir por entrevista, comissão e projeto — que este dado não mede. Investir na comissão técnica continua de pé; o que cai é usar histórico de G4 e estilo de jogo como critério de escolha.

*n.* {t03_pass} passagens de {t03_tec} treinadores, {t02_multi} deles em dois clubes ou mais, e {ad_n} trocas no meio da temporada

*Premissa.* Ajusta a premissa m5 ("Comissão técnica top — investir", dados/premissas.json): investir na comissão continua valendo, mas o histórico de G4 e o modelo de jogo do treinador não servem de critério de escolha — a base não mostra que se repetem e, do tamanho em que está, não teria como mostrar. Sugere premissa nova: a escolha do treinador sai do estudo e vai para validação externa, com o piso (a pior temporada) como única leitura que a base sustenta.

**Por que esse nível.** (a) Passou em BH a 5% dentro da família? NÃO. Não existe resultados/T04_testes.csv nem T03_testes.csv; aplicando bh() de scripts/_metodo.py aos 7 p de Wilcoxon de T03_resumo.json, todos dão q = 0,669. A perna do T02 é amplitude, que é descrição e não teste. (b) Passou na porta temporal da §6.4? NÃO — nenhum script do bloco T a roda. Zero dos dois: indício, e a frase diz por quê. Uma negativa tripla sem correção, sem anterioridade e sem mínimo detectável não pode carregar o selo mais forte da casa — ainda mais quando o ponto medido aponta para o lado contrário da frase (repetição entre clubes de 0,27 num desenho que só enxergaria 0,48).

→ vai para **"Parece, mas não é"**.

**Números a criar/corrigir:**
  - t02_multi = 34, t02_amp_mediana = 16,2 e t02_amp50 = 9 — hoje digitados à mão no texto; devem virar marcadores lidos de T02.json (numeros.multi, numeros.amp_mediana, numeros.amp_50mais). ATENÇÃO à coerência com o T04-1: esses três números do T02 incluem 2026; só com as temporadas fechadas viram 28, 21,7 e 8 (conferido em T02_passagem.csv). A decisão de recortar é do T02, mas o T04 não pode cortar 2026 numa conclusão e manter na outra sem dizer.
  - t03_pass = 151 e t03_tec = 69 — hoje digitados no campo n; devem vir de T03.json (numeros.n_pass, numeros.n_tec)
  - ad_n = 73 — as trocas no meio da temporada, de T03.json numeros.ad_n
  - dmin_multi: a menor repetição detectável com {t02_multi} treinadores, por scripts/_metodo.py::d_minimo — não existe em arquivo nenhum e é o número que falta para a frase "não conseguiria ver" (a auditoria mediu 0,48 contra 0,27 observado)
  - dmin_antes_depois: o mínimo detectável do antes e depois, que é desenho PAREADO com 73 pares — o cético corrigiu o auditor aqui: d_minimo(73,73)=0,47 é a fórmula de dois grupos independentes; o número a publicar é o do pareado (0,33)
  - conf_tracos = 3: quantos dos 7 traços do perfil ficam abaixo do piso de confiabilidade de 0,40 da §6.1. O auditor escreveu 4 e o cético corrigiu medindo — xg 0,302, xg_por_remate 0,349 e xg_por_remate_contra 0,357 ficam abaixo, mas xg_contra dá 0,533. A ressalva entra assim: parte do perfil é medida com régua curta, o que sozinho já achataria qualquer repetição.

### A07-1 — REBAIXA  ·  firme → **indício**  ·  esforço: recalculo

**Hoje:** Correr não separa quem sobe: nem no volume, nem na intensidade, nem com ou sem bola

**Proposta:** Corrida não separou quem sobe do meio — e só uma diferença enorme apareceria neste estudo

*O que vimos.* O time mediano de quem subiu percorreu {dist_s} metros por jogo contra {dist_m} do meio, e {hi_s} metros em alta intensidade contra {hi_m} — no ranking de corrida do próprio ano, isso é {pos_dist} posição de diferença. Este desenho só enxergaria a partir de {pos_visivel} posições, quase um quarto da tabela: não vimos diferença, o que é diferente de não haver. Nenhum dos {n_ind} indicadores físicos declarados separou quem sobe, com ou sem os times de fronteira, nem quando a corrida é quebrada em com bola e sem bola.

*Para o Santa Cruz.* Não há base aqui para contratar pensando em 'time que corre mais sobe' — e também não há base para dizer que correr não importa, porque o estudo não teria como ver. Escolha o nível físico pelo modelo de jogo que o treinador vai pedir, não como atalho para o acesso. Para o físico virar critério de acesso seria preciso dado por jogo, que neste repositório só existe a partir de 2025.

*n.* 16 que subiram contra 48 do meio (8 contra 32 sem os times de fronteira); contra a Trave, 16 contra 16 e 8 contra 7. As 80 linhas são 40 clubes.

*Premissa.* Ajusta m1 (Time físico): 'a intensidade é critério de escolha, não detalhe' fica SEM PROVA pelo lado do acesso — não é contradita, é que este desenho não conseguiria enxergá-la. E corrige a leitura das réguas da Protótipo que o texto atual faz: C_volume_fisico não separa nada em lugar nenhum, mas D_explosao separa quem CAI do meio, firme nos dois cortes (A12_reguas.csv, CM, q 0,02637 e 0,02875) — a frase certa é 'não separam quem SOBE', não 'não separam'.

**Por que esse nível.** (a) BH a 5% dentro da família: NÃO. Nenhum dos 12 indicadores passa em Sobe × Meio nem em Sobe × Trave, em nenhum dos dois cortes de fronteira — o menor q de SM é 0,40 e o maior |d| é 0,57 (A07_testes.csv). E resultado negativo não 'passa' na correção: ele é a ausência dela. (b) Porta temporal §6.4: NÃO. Nunca rodou nesta parte (A07_resumo.json não tem a chave, _rodar.py não calcula nenhuma) e não roda com o dado atual, porque não há físico por jogo antes de 2025. Zero de dois critérios = indício. E a frase TEM de dizer por quê: com 16 contra 48 o menor d detectável a 80% é 0,82 (1,02 contra a Trave; 1,14 e 1,57 sem a fronteira), ou seja o desenho não enxergaria nem efeito grande — a frase fixa da §6.7 ('não separa significa este desenho não conseguiria ver') não aparece em lugar nenhum da entrega. Some-se que a cobertura física por clube-temporada vai de 62% a 97% dos minutos possíveis (o pior é o Grêmio 2022, um dos 16 promovidos em que o estudo se apoia) e a rodada com e sem os 20 abaixo de 75%, que o CLAUDE.md manda, nunca foi feita. Marcar também 'pode ser efeito do placar', como a própria parte declarou por escrito antes de rodar.

→ vai para **"Parece, mas não é"**.

**Números a criar/corrigir:**
  - dist_s, dist_m, hi_s, hi_m como float arredondado do corte COM fronteira: 9644, 9598, 669 e 652 — hoje são string com três casas e chegam à tela como '9631.175', do corte SEM fronteira (a vitrine tem de ser o corte padrão)
  - dif_dist = 46 metros por jogo, a diferença que existe, para o leitor comparar com o limiar
  - pos_dist = 1,0 — distância entre a média de quem sobe e a do meio no ranking de corrida do ano (5,4 pontos de percentil ÷ 5,26 por posição). É o que traduz o teste, que roda em percentil dentro do ano (_metodo.py), para unidade de jogo
  - pos_visivel = 4,7 — o d mínimo 0,82 convertido em posições na tabela do ano; é assim que o poder vira unidade de jogo sem usar d
  - n_sobe_sf = 8 e n_meio_sf = 32, marcadores que faltam (hoje o n é digitado à mão)
  - q com o desconto do rodízio nas linhas SM e ST: a especificação exige em toda linha física e o A07 não gravou nenhuma. Aqui o negativo é robusto por construção (q de 0,40 para cima), mas o número tem de existir

### A11-1 — REBAIXA  ·  firme → **provável**  ·  esforço: recalculo

**Hoje:** Não é correr: é correr para onde

**Proposta:** Não é correr: é correr para onde

*O que vimos.* Com a bola, correr mais não muda nada: o terço que mais percorre metros faz {vol_ent_alto} entradas na área por jogo e cria {vol_xg_alto} de xG, contra {vol_ent_baixo} e {vol_xg_baixo} do terço que menos percorre. Já o terço que mais faz corridas para dentro da área ({corr_alto} contra {corr_baixo} a cada 30 minutos com a bola) faz {ent_alto} entradas por jogo e {xg_alto} de xG, contra {ent_baixo} e {xg_baixo} — e {ent_metade_alto} desses {n_terco} times estão na metade de cima em entradas na área, contra {ent_metade_baixo} do outro terço. A mesma relação aparece igual sem os times de fronteira ({n_sf} times) e sem os {n_cob_fora} de cobertura física mais baixa ({n_cob} times), onde fica até mais forte.

*Para o Santa Cruz.* Conversa com o A02: lá, quem sobe finaliza de mais perto, com mais toques e mais entradas na área — esse par ficou como indício por causa da fronteira, e é bom lembrar disso ao citar. Aqui aparece a ação física que produz a entrada na área, e não é volume de corrida: é corrida para dentro da área. Em J05, o requisito físico do ataque é corrida para a área — serve ao modelo de jogo, não como filtro de quem sobe, porque o A07 já mostrou que nenhum indicador de corrida separa quem sobe.

*n.* 80 clube-temporadas (40 clubes, 2022–2025); 52 sem os times de fronteira e 60 só com cobertura física acima de 0,75

*Premissa.* Sugere uma premissa nova, que ajusta a m1 (Time físico) sem contradizê-la: no físico ofensivo, a direção da corrida vale mais que o volume — pedir corrida para dentro da área, não metros percorridos.

**Por que esse nível.** (a) BH a 5% dentro da família com_bola: PASSA — corridas para a área × entradas na área q=0,00004 e × xG q=0,00001 em A11_correlacoes.csv (conferi as duas linhas, não o texto). (b) Porta temporal da §6.4: NÃO — nunca rodou e não pode rodar nesta parte, porque o SkillCorner guarda um período só (full_all) e não há físico de 1º/2º turno. Um sim de dois: provável. Ressalvas obrigatórias que vão no motivo: pode ser efeito do placar (correr para a área e entrar na área sobem juntos em quem está atrás, e a base não permite o recorte por estado do jogo); o xG tem confiabilidade medida 0,30, abaixo de 0,40, então a metade da frase que se apoia nele entra com a régua curta e a frase se apoia primeiro em entradas na área; associação no mesmo ano não é causa; e o intervalo tem de sair por reamostragem de clube (as 80 linhas são 40 clubes), não pela conta que supõe 80 independentes.

**Números a criar/corrigir:**
  - {corr_alto} = 3,6 e {corr_baixo} = 2,5 — corridas para dentro da área a cada 30 min com a bola, terço de cima e terço de baixo
  - {ent_alto} = 23,5 e {ent_baixo} = 20,5 — entradas na área por jogo nesses dois terços
  - {xg_alto} = 1,28 e {xg_baixo} = 1,12 — xG criado por jogo nesses dois terços
  - {vol_ent_alto} = 22,0 e {vol_ent_baixo} = 21,5 — entradas na área por jogo nos terços de metros percorridos COM a bola
  - {vol_xg_alto} = 1,19 e {vol_xg_baixo} = 1,18 — xG por jogo nos mesmos terços de volume
  - {ent_metade_alto} = 21 e {ent_metade_baixo} = 8 — de {n_terco} = 26, quantos estão na metade de cima em entradas na área
  - {n_sf} = 52 (sem fronteira, relação 0,481 e 0,497) e {n_cob} = 60 / {n_cob_fora} = 20 (cobertura ≥0,75, relação 0,507 e 0,617)
  - {rho_min_det} = 0,31 — mínimo detectável a 80% com n=80, para o motivo da confiança e para o CSV
  - {conf_xg} = 0,30 — confiabilidade medida do xG, abaixo do piso de 0,40
  - intervalo das duas correlações por reamostragem de clube, no lugar do atual (substituir a coluna ic95 de A11_correlacoes.csv)

### A11-3 — REBAIXA  ·  provável → **indício**  ·  esforço: recalculo

**Hoje:** O físico não separa quem sobe nem entre times de nível técnico parecido

**Proposta:** O físico não separa quem sobe — nem entre times de nível técnico parecido

*O que vimos.* Entre os times de nível técnico alto, quem subiu percorreu {dist_sobe_alta} metros por jogo e quem ficou no meio percorreu {dist_meio_alta}: {dif_alta} metros de diferença em quase dez quilômetros. Na faixa técnica do meio a diferença é de {dif_media} metros, e nenhuma das {n_testes} comparações apareceu. E isso apesar de o físico ser o traço mais repetido que a Protótipo mediu ano a ano: no ranking de corrida da Série B um clube muda em média {pos_corrida} posições de uma temporada para a outra, contra {pos_xg} no ranking de xG criado e {pos_ppda} no de pressão.

*Para o Santa Cruz.* O físico é um traço estável do clube que não anda com o acesso: serve para reconhecer um time — ele corre parecido todo ano — não para prever se ele sobe. Como seguro contra a queda vale, e o A07-2 mostra isso (quem cai sprinta menos); como alavanca de acesso, não. Na montagem do elenco, correr é requisito de piso, não critério de desempate entre candidatos.

*n.* 49 das 80 clube-temporadas: 4 promovidos contra 18 do meio na faixa técnica média e 12 contra 15 na alta

*Premissa.* Ajusta a m1 (Time físico): a intensidade continua como requisito de piso e como seguro contra a queda, mas o estudo não sustenta que correr mais faça o time subir — nem entre times de nível técnico parecido.

**Por que esse nível.** (a) BH a 5% dentro da família: NÃO passa nenhum dos 10 testes — fui ao A11_estratificado.csv e o menor q é 0,95148. (b) Porta temporal da §6.4: NÃO — não rodou e não pode rodar nesta parte. Zero de dois: indício, e a frase diz por quê. O porquê tem três partes: n pequeno (4 promovidos contra 18 do meio na faixa técnica média e 12 contra 15 na alta — 49 das 80 linhas, e a faixa técnica baixa não teve promovido nenhum em 2022–2025); mínimo detectável de 1,13 a 1,63, ou seja é 'não achamos', não 'não existe'; e o corte sem os times de fronteira, que o script nunca rodou, faz a faixa média sumir por falta de promovidos e a alta cair para 7 contra 9. Acrescentar ainda: pode ser efeito do placar, porque quem sobe joga mais tempo em vantagem e a base não permite o recorte por estado do jogo.

→ vai para **"Parece, mas não é"**.

**Números a criar/corrigir:**
  - {n_estrat} = 49, {n_sobe_media} = 4, {n_meio_media} = 18, {n_sobe_alta} = 12, {n_meio_alta} = 15 — trocar o n hoje publicado (80) aqui e na linha do _registro.md
  - {dist_sobe_alta} = 9.614 e {dist_meio_alta} = 9.620 metros por jogo, {dif_alta} = −6 — faixa técnica alta
  - {dist_sobe_media} = 9.607 e {dist_meio_media} = 9.582 metros por jogo, {dif_media} = +25 — faixa técnica média
  - {n_testes} = 10 — comparações rodadas, nenhuma passou
  - {pos_corrida} = 3,5 · {pos_xg} = 6,1 · {pos_ppda} = 6,1 — posições que um clube muda no ranking de 20, de um ano para o outro (36 pares, 2022–2025): é a tradução em linguagem de jogo dos 0,722 / 0,144 / 0,129 da Protótipo
  - {sf_alta} = '7 contra 9' e a faixa média sem promovidos suficientes — resultado do corte sem fronteira, que o script precisa passar a rodar
  - {d_min_alta} = 1,13 e {d_min_media} = 1,63 — já estão no CSV, faltam no texto

### A13-2 — REBAIXA  ·  firme → **indício**  ·  esforço: recalculo

**Hoje:** Na metade, 7 em cada 10 já estão na faixa em que vão terminar — mas virar acontece todo ano

**Proposta:** Na metade, a tabela já tem {sobe_g4_19} dos {sobe_total} acessos e {cai_z4_19} dos {cai_total} rebaixamentos — os outros viram depois

*O que vimos.* Na rodada {rodada_turno}, {sobe_g4_19} dos {sobe_total} times que subiram já estavam no G4 e {cai_z4_19} dos {cai_total} que caíram já estavam no Z4. O resto virou depois da metade: {n_viraram} subiram vindo de fora do G4, {n_salvos} escaparam do Z4, {n_cairam_de_fora} caíram vindo de fora dele e {n_perderam_g4} perderam o G4 que já tinham. É contagem das {n_temporadas} temporadas fechadas, sem teste, e o que ela mede é onde o time estava, não o que veio depois — por isso fica como indício.

*Para o Santa Cruz.* A tabela da metade não é sentença nem garantia: em {n_temporadas} temporadas, {n_viraram} times subiram vindo de fora do G4 e {n_perderam_g4} perderam o lugar que tinham. Isso põe a janela do meio do ano dentro do projeto desde o começo — dinheiro e vagas de elenco guardados para reforçar em julho, em vez de gastar tudo na montagem de janeiro.

*n.* {n} clube-temporadas de 2022 a 2025; {sobe_total} acessos e {cai_total} rebaixamentos

*Premissa.* Reforça a premissa nova sugerida em A13-1 (planejar e orçar a janela do meio do ano). Não confirma nem contradiz nenhuma das 23 premissas de dados/premissas.json.

**Por que esse nível.** (a) BH a 5% na família: NÃO. É contagem completa das 80 linhas e não há teste nenhum na parte — não existe A13_testes.csv e nenhum q foi calculado. (b) Porta temporal da §6.4: NÃO. O que ela mede é a posição na rodada 19 contra a FAIXA FINAL, e os pontos da rodada 19 já estão somados nessa classificação final; não é previsor anterior ao desfecho. Zero de dois = indício. Os três pareceres do auditor defenderam manter 'firme (contagem)' citando a prática da casa (A01-1/2/3, A04-2, T01-1, T02-1/3), mas essa prática não é a régua escrita: a régua exige os dois critérios, e uma contagem que não testou nada não passou em nenhum. É coerente e tem uso prático imediato (a janela de julho), então indício é o nível, com a frase dizendo que é contagem.

**Números a criar/corrigir:**
  - n_perderam_g4 = 6 (estavam no G4 na rodada 19 e terminaram fora: Vila Nova 2023, Sport 2023, Novorizontino 2023, Novorizontino 2024, Goiás 2025, Novorizontino 2025)
  - n_temporadas = 4
  - rodada_turno = 19
  - GRAVAR NO SCRIPT, em vez de deduzir à mão como 16−10: n_salvos = 6, n_cairam_de_fora = 6, n_viraram = 6, mais a lista dos clubes de cada grupo (hoje A13.py não escreve nenhum deles)
  - SAIR do texto: r19_perto (80,0%) descreve uma folga de 3 pontos que o script só aplica a quem termina no G4 ou no Z4; a regra simétrica daria 95,0%. Ou se redefine a chave, ou ela fica só na prova com a definição escrita.
  - SAIR do texto: r10_faixa, r29_faixa, r34_faixa (a rampa some — a rodada 19 é MENOR que a 17 e a 18, ambas 72,5%); a série inteira fica na prova.
  - ACRESCENTAR à prova, além de previsibilidade_por_rodada: A13_turnos.csv, de onde saem os clubes nomeados.

### A14-2 — REBAIXA  ·  firme → **indício**  ·  esforço: reanalise

**Hoje:** O índice só se sustenta em metade das temporadas

**Proposta:** Parece que a régua vale em toda temporada — em duas das quatro não dá para saber

*O que vimos.* Temporada a temporada, com a régua montada sobre as quatro juntas — nenhuma foi deixada de fora, ao contrário do que este texto dizia antes: em {ano_forte1} e {ano_forte2} os quatro que subiram ficaram acima do meio da tabela; em {ano_fraco1} e {ano_fraco2} ficaram misturados com ele. Mesmo nesses dois anos fracos a régua pegou {top4_fraco} dos 4 promovidos entre os seus quatro primeiros: ela erra parte deles, não todos. E tirando os times colados na linha do G4 e do Z4 o retrato inverte — {ano_fraco2} fica forte, e {ano_fraco1} e {ano_forte2} ficam com um promovido só, sem comparação possível.

*Para o Santa Cruz.* Não decida contratação pela posição do time na régua de um ano só: olhe as quatro temporadas juntas. E não leia isto como "a régua não vale" — com quatro promovidos por temporada, o ano isolado não tem tamanho para responder, e nada aqui testa se a régua prevê o acesso.

*n.* 4 temporadas fechadas, 4 promovidos contra 12 do meio em cada; sem os times colados na linha, 2023 e 2024 ficam com 1 promovido

**Por que esse nível.** (a) BH: NÃO. A afirmação se apoia justamente nos dois anos que não passam. Rodando Benjamini-Hochberg sobre as quatro temporadas (índice de 7 componentes, corte COM fronteira) dá q 0,01040 em 2022 e 0,00088 em 2024 — passam — contra q 0,15322 em 2023 e 0,39010 em 2025, que não passam; e não passar não é passar. Pior: com 4 contra 12 o mínimo detectável do desenho é 1,74 e os efeitos de 2023 e 2025 são 0,87 e 0,74, ou seja abaixo do que o desenho enxergaria — a §6.7 proíbe transformar isso em "não existe". (b) Porta temporal: NÃO, nunca rodada. Nenhum dos dois = indício, e a frase tem de dizer por quê (4 promovidos por temporada). Acrescente-se que a conclusão nunca foi rodada no segundo corte de fronteira: rodei, e nele o retrato vira outro — 2025 fica forte (q 0,00065) e 2023 e 2024 ficam com 1 promovido, sem teste possível. A fraqueza só aparece no corte COM os times de fronteira, e é disso que a regra da casa manda desconfiar. Some-se o achado 3/3 de que "deixando uma temporada de fora" não é o que o script fez: nada foi deixado de fora, o índice é o mesmo nas quatro.

→ vai para **"Parece, mas não é"**.

**Números a criar/corrigir:**
  - ano_forte1 = 2022 · ano_forte2 = 2024 · ano_fraco1 = 2023 · ano_fraco2 = 2025
  - top4_2022 = 3 · top4_2023 = 2 · top4_2024 = 4 · top4_2025 = 2 (promovidos entre os 4 primeiros da régua naquele ano); top4_fraco = 2
  - validação COM fronteira, índice de 7: 2022 d 2,20 p 0,00520 q 0,01040 · 2023 d 0,87 p 0,11491 q 0,15322 · 2024 d 2,77 p 0,00022 q 0,00088 · 2025 d 0,74 p 0,39010 q 0,39010 — mínimo detectável 1,74 (tudo para a prova)
  - validação SEM fronteira, índice de 7 (não existe hoje em arquivo nenhum): 2022 4x9 d 2,18 q 0,01334 · 2023 1x5 sem teste · 2024 1x10 sem teste · 2025 2x8 d 2,68 q 0,00065
  - marcar negativa = true no JSON, para a conclusão ir para "Parece, mas não é" — hoje ela está elegível a subir para "O que decidimos" (gerar_estudo_serieb_js.py, linhas 139-146)
  - trocar a frase "deixando uma temporada de fora" por "temporada a temporada, com a régua montada sobre as quatro"
  - cai do uso prático "em duas das quatro temporadas medidas, quem subiu não estava no topo dela": é falso, metade dos promovidos estava no topo nas duas

### T01-2 — REBAIXA  ·  firme → **indício**  ·  esforço: recalculo

**Hoje:** Treinador de Série B roda entre clubes: {rodam_3_clubes} comandaram dez rodadas ou mais em três clubes diferentes

**Proposta:** Treinador de Série B roda entre clubes: {rodam_3_clubes} comandaram dez rodadas ou mais em três clubes diferentes

*O que vimos.* Dos {treinadores} treinadores da base, {rodam_3_clubes} tiveram passagem de dez rodadas ou mais em três clubes ou mais da Série B: Allan Aal em {clubes_allan_aal}, Claudinei Oliveira, Marcelo Cabo e Mozart em {clubes_sete} cada, Daniel Paulista e Guto Ferreira em {clubes_seis}. Dentro de 2022 a 2025, que é a janela em que T03 tem régua técnica e física, restam {rodam_3_clubes_2225}. É contagem de uma fonte só, sem teste por trás, e o número é piso: {rodadas_sem_dono} rodadas ficaram sem treinador conhecido e qualquer uma delas só pode somar clubes.

*Para o Santa Cruz.* Dá para julgar treinador pelo que ele repete em clubes diferentes, e não pela última campanha, que é o que o mercado vende. Mas a amostra que chega em T03 é a de 2022 a 2025: {rodam_3_clubes_2225} nomes, não {rodam_3_clubes} — é dessa lista curta que sai o treinador de T04. Quem tem um clube só na Série B entra como aposta, e a aposta tem de ser paga como aposta.

*n.* {treinadores} treinadores; {treinadores_com_10} chegaram a pelo menos uma passagem de dez rodadas ou mais

**Por que esse nível.** (a) BH a 5% dentro da família: NÃO — a parte não tem arquivo de teste nem importa o método da casa. (b) porta temporal da §6.4: NÃO — não há 1º turno a prever 2º turno numa contagem de clubes por treinador. Zero de dois: indício pela letra do arquivo, e a frase diz por quê. O número em si é sólido e é piso: refiz na base com a temporada corrigida e deu 29 com interino e 29 sem interino; as 62 rodadas sem dono só podem somar clubes, nunca tirar. O que cai é o selo, e com ele o motivo "Contagem completa.", que a própria parte desmente.

**Números a criar/corrigir:**
  - clubes_allan_aal = 9 (o texto diz oito; nove é o que sai quando a temporada é corrigida)
  - clubes_sete = 7 — Claudinei Oliveira, Marcelo Cabo e Mozart, todos pelo MESMO critério que produz o 29 (passagem de 10+ rodadas, interino incluído; Cabo tem 7 contando o interinato de 19 rodadas no Goiás 2021)
  - clubes_seis = 6 — Daniel Paulista e Guto Ferreira; Guto estava fora da lista de cinco por um corte não declarado
  - rodam_3_clubes_2225 = 14 (janela 2022–2025 de T03); 15 se a janela for 2022–2026
  - rodadas_sem_dono = 62, de 6.608 rodadas jogadas
  - treinadores_com_10 = 113 (treinadores distintos com pelo menos uma passagem-temporada de 10+ rodadas, temporada corrigida)
  - com_10_rodadas = 278 (era 273), das 492 passagens-temporada
  - topo_clubes precisa de um critério único declarado: hoje o 29 conta interino e a lista de nomes não conta, e é daí que vem o erro de Marcelo Cabo

### A03-3 — SO_TEXTO  ·  provável → **provável**  ·  esforço: recalculo

**Hoje:** Quem cai cria menos em casa e sofre mais fora

**Proposta:** Quem cai cria menos em casa e sofre mais fora

*O que vimos.* Em casa, quem cai cria {c_xgcasa_c} de xG por jogo contra {c_xgcasa_m} do meio; fora, sofre {c_xgcfora_c} contra {c_xgcfora_m}. As duas se repetem quando se tiram os times que estavam colados na linha ({n_cai_sf} contra {n_meio_sf}). Mas quem cai é pior nos dois mandos, e o xG sofrido fora pode ser efeito do placar: time que cai passa mais tempo atrás do marcador longe de casa.

*Para o Santa Cruz.* É o retrato a não repetir: elenco que não cria dentro de casa e não protege a área longe dela. Não trate como dois problemas separados por mando — quem cai é pior nos quatro números, e os testes só isolaram onde a diferença cruzou a linha. Na montagem, o requisito é criar e proteger sempre; não existe 'reforço para jogo fora'.

*n.* 16 do Cai contra 48 do Meio, e 12 contra 32 sem os times colados na linha

**Por que esse nível.** (a) BH a 5% na família dela? SIM, nos dois cortes: xG criado em casa q 0,00529 (com) e 0,00827 (sem); xG sofrido fora q 0,00191 e 0,00141. (b) Porta temporal da §6.4? NÃO: A03.py não calcula porta nenhuma e a rodada de 19/09 só cobriu os oito componentes do A14, que não incluem xg_casa nem xgc_fora. Um sim e um não = provável, que é o nível que ela já tem — o pedido de rebaixar (achado 6) foi derrubado 0/3 com razão. Continua valendo o que segura a frase: os dois testes diretos de assimetria, pré-declarados, não passam (dif_xg p 0,28372 com e 0,12512 sem; dif_xgc p 0,21983 e 0,07426), então o recorte por mando é onde a diferença cruzou a linha, não um achado. E o xG tem confiabilidade 0,30, abaixo de 0,40.

**Números a criar/corrigir:**
  - n_cai_com = 16 e n_meio_com = 48 (não existem hoje em numeros, e o n declarado cita só o corte sem)
  - c_xgcasa_c = 1.26 e c_xgcfora_c = 1.56 — corte COM fronteira; os atuais 1.246 e 1.646 são do corte sem e aparecem no texto como se fossem o valor geral
  - c_xgcfora_m = 1.36 (hoje 1.394, do corte sem); c_xgcasa_m = 1.39 serve nos dois cortes
  - aposentar do texto c_xgcasa_dcom, c_xgcasa_dsem, c_xgcfora_dcom, c_xgcfora_dsem (são d) e c_difxg_p, c_difxgc_p (são p) — todos vão para a prova
  - conf_xg = 0.3, para a ressalva de confiabilidade do xG nas duas pernas
