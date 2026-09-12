# Revisão da aba Análise Série B — o diferencial de quem sobe

*Relatório final da revisão especialista · 12 de setembro de 2026 · 80 clube-temporada (2022‑2025) + 2026 parcial (27 de 38 rodadas)*

*Base desta revisão: 10 revisões seção a seção, 8 pesquisas de literatura, 34 análises novas propostas e 68 verificações (duas lentes por proposta: viabilidade no dado real e rigor estatístico). A Onda 1 de correções já foi implementada hoje (commit `ddc5bff`) e este relatório trata os oito itens dela como FEITOS.*

---

## 1. Resumo executivo

A aba faz a pergunta certa, calcula tudo no navegador e não escreve número a mão — isso é raro e é o que a sustenta. O problema nunca foi o rumo; foi **quanto do que ela conclui aguenta ser conferido**. Em oito das dez seções o rigor ficou em 2 de 5, e o padrão por trás dos problemas graves é sempre um de quatro hábitos: razão no lugar de diferença, extremo no lugar da relação, ~190 correlações sem nenhuma proteção, e repetição confundida com alavanca.

A Onda 1 (hoje) resolveu os oito erros que estavam no ar, e o mais grave deles tinha consequência de conteúdo, não de forma: o valor por setor era um retrato de 11/09/2026 aplicado a 2022 (489 de 558 atletas repetiam o mesmo valor em todas as temporadas). Refeito com o Transfermarkt por temporada, **a tese "time ameaçado compra atacante" morreu** — a diferença de fatia no ataque entre sobe e cai caiu de 13,0 pontos (30,8% x 43,8%) para 2,0 (32,8% x 34,8%) — e os três euros por setor revelaram‑se colineares com o valor total do elenco a 0,86 / 0,85 / 0,88. Euro por setor é, quase inteiro, medir o tamanho do elenco outra vez.

O que continua frágil é mais profundo que os oito itens: **a aba não tem régua**. Não há régua de repetibilidade (quanto de cada indicador é medida e quanto é ruído), não há régua de acaso (o que 32 ou 128 correlações produzem sozinhas), não há teto de previsibilidade e não há validação fora da amostra na tela. Sem isso, 0,54 e 0,22 são números sem significado, e três das quatro "alavancas" da Seção 8 são sintomas de um bom ano (persistência ano a ano: share11 0,06, goleiro 0,12, cabeça 0,15 — só o valor do elenco repete, 0,73).

**As cinco mudanças de maior impacto**, em ordem:

1. **Publicar a repetibilidade de cada indicador** (split‑half dentro da temporada, n=80): PPDA 0,81 · toques na área 0,78 · remates 0,69 · pontos 0,59 · xG 0,54 · gols−xG 0,18. Toda barra da aba passa a ser lida contra o próprio teto — e o teste dos 36 pares, que exclui por construção todos os que subiram e caíram, deixa de ser a única prova.
2. **Fazer do contraste sobe × quase‑sobe (5º‑8º) o pivô da história**, com a cadeia refeita: o quase‑sobe cria *mais* (1,35 x 1,28 de xG), concede o mesmo (1,10 x 1,08) e o vão de 4,6 gols é todo conversão — que é justamente o elo com confiabilidade 0,31.
3. **Trocar "alavancas" por "sintomas"** e pôr na tela a validação fora da amostra: R² 0,646 dentro, **0,620 fora** (quarteto da aba), contra 0,710 → 0,427 do quarteto garimpado por máximo R².
4. **Reescrever a Seção 7 contra o nulo**: a Onda 1 já converteu as razões em pontos; falta mostrar que sequência e "reação" são aritmética da taxa de vitória (permutação: sequência sem vencer esperada 4,65 x observada 4,19 em quem sobe; 10,55 x 9,06 em quem cai) e que, descontado o mando, ninguém reage.
5. **Fechar a base de lesões com número, não com adjetivo**: publicar que a cobertura anda 0,70 com o valor do elenco (43,3% dos atletas caros com histórico contra 18,5% dos baratos), que dias/atleta coberto dá −0,195 **[IC −0,40; +0,01]** — ou seja, nada — e que o controle positivo falha (dias × posição controlando valor = −0,137 contra os −0,46 de Eliakim na Premier). Registrar o descarte e aproveitar o único uso legítimo: a anatomia dentro da própria base (joelho = 55% dos dias perdidos, mediana de 92 dias contra 31,5 da lesão muscular).

Nenhuma das 34 análises propostas foi rejeitada, e **nenhuma passou intacta**: as 34 vieram com veredito "ajustar" das duas lentes. Na Seção 5 cada uma está descrita já com o ajuste incorporado.

---

## 2. O que a literatura diz e o que isso muda aqui

O brief condensa quatro temas (Sumpter; Ian Graham/Liverpool; preditores de promoção em segundas divisões; físico e sucesso). Ressalva de origem: os quatro chegaram, o quarto veio truncado no fim, e o livro de Graham não foi lido na íntegra (números "conforme relatado").

| Princípio da literatura | Fonte | Onde a aba está |
|---|---|---|
| Um jogo é ~57% acaso; a temporada também tem componente grande | Sumpter | **Ignora.** Nenhum bloco compara o observado com o que o acaso produz. As sequências e a "reação" da §7 são exatamente o nulo. |
| Gols são quase tanto ruído quanto sinal; xG só vence gols até ~16 jogos | Sumpter | **Concorda na prática** (§2 usa os dois), mas nunca declara que em 38 jogos a tabela já é a melhor estimativa. |
| Posse não prevê resultado — a correlação é artefato de estado de jogo | Sumpter, Graham | **Concorda na conclusão, erra no mecanismo.** Medido aqui: dentro do mesmo clube, perder rende **+6,3 pp de posse**; mas reponderando para o mix médio V‑E‑D, a correlação posse × posto vai de −0,29 para **−0,43**. O placar não inventa a posse, ele a **esconde**. |
| Precisão de passe não é valor | Graham | **Concorda** (0,14 na lista do que não vale). |
| KPI de clube mede PROCESSO ancorado em princípio de jogo, nunca desfecho | Sumpter/Hammarby | **Contradiz.** A §7 inteira é desfecho (0,66 a 0,87 com a posição) e as seis primeiras barras da §8 são a própria tabela (pontos em casa 0,84). |
| Defesa explica mais que ataque numa segunda divisão (GC 74% x GP 60%) | Winning With Analytics (Championship) | **Concorda embaixo, contradiz em cima e não sabe.** Cortando pela regra nova: 1º‑2º e 3º‑6º marcam igual (48,8 x 48,7) e o acesso direto sofre **5,5 gols a menos** (29,8 x 35,3). O acesso direto é defesa. |
| Quem está no topo está lá em parte por sorte | Football Quant / NTT20 | **Ignora.** Sem alvo‑sombra por xG, "quem subiu" carrega a sorte do ano. |
| Na Segunda espanhola, volume (passes, remates) não se relaciona com a classificação | Sensors 2023 | **Concorda e não cita**: remates 12,4 x 12,0 (rho 0,26, e 0,03 em 2025); distância do remate 0,55. |
| Correr mais não ganha pontos; correr **com** a posse, sim (Bundesliga) — mas por minuto de posse o sinal inverte (PL) | Hoppe 2015; PMID 42220586 | **Caiu na armadilha e já foi rebaixado.** "Sem a bola 0,22" anda +0,50 com o PPDA e +0,46 com a posse; descontado o PPDA sobra 0,05. A Onda 1 rebaixou a manchete; falta o número na tela. |
| O sinal do sprint depende da posição; agregar por time soma sinais opostos | Andrzejewski 2018 | **Concorda** — o painel por posição é a parte mais original do estudo. |
| ~250 métricas a 5% produzem ~12 "achados" por acaso | síntese do brief | **Ignorava; a Onda 1 corrigiu no físico** (34 acesas, 6,4 esperadas, 2 sobrevivem a Benjamini‑Hochberg). O quadro geral ainda não tem limiar. |
| Lesão custa posição (~136 dias = 1 ponto; r=−0,46 com o resíduo sobre o valor) | Eliakim 2020; Hägglund/Ekstrand | **Não testável nesta base** — e o fato de a base **não** recuperar esse efeito conhecido é a melhor prova do viés de cobertura. |
| Estabilidade x concentração de minutos: evidência nos dois sentidos (CIES x Sportsology) | — | **Concorda com Sportsology** (87% dos minutos em 15 jogadores) e é o achado mais forte de elenco. |
| Validação fora da amostra e explicação causal são obrigatórias | Sumpter, Graham | **Existe e não está na tela** (0,620 fora contra 0,646 dentro). |
| Nota de corte do G4 na Série B: 62 pontos em média (2014‑2023) | Gazeta Esportiva | **Confirma e estende**: 63 em 2022‑2025 (62, 64, 64, 62). |

**O que a literatura não tem e este estudo tem:** não existe nenhum estudo multi‑temporada cruzando xG, valor, físico e estabilidade com o acesso na Série B. Os 80 clube‑temporada preenchem um vazio real — o que aumenta, e não diminui, a exigência de régua.

---

## 3. Revisão seção por seção

### Tabela‑resumo

| # | Seção | Rigor | Clareza | Organiz. | Resolvido em 12/09 | O maior problema aberto | A maior falta |
|---|---|:--:|:--:|:--:|---|---|---|
| 0+1 | A linha do acesso | 2 | 3 | 3 | gráfico de 2026; corte dos empates | a linha é decidida no desempate, não em pontos | garantia (64 e 67) e o ritmo por rodada |
| 2 | De onde vem a vantagem | 2 | 3 | 4 | — | o teste de persistência exclui todos que subiram e caíram | a cadeia contra o **5º‑8º** |
| 3 | Ataque e defesa | 2 | 3 | 3 | números escritos à mão | empate em posto ainda por ordem de chegada | goleiro no nível do atleta |
| 4 | Bola parada | 2 | 3 | 3 | — | bpConv (0,49) tem ~70% de laterais no denominador | o lado defensivo |
| 5 | Elenco, dinheiro e idade | 2 | 4 | 3 | **valor por setor reconstruído** | idade "grita" com rho −0,04 | quadrante valor × concentração |
| 6 | Físico | 3 | 4 | 3 | duas faixas de aceso; "sem a bola" rebaixado | os controles ainda não estão na tela | fração da distância em sprint |
| 7 | O jogo | 2 | 3 | 3 | as três razões viraram pontos | sequência e reação são a taxa‑base | a curva rodada × posição |
| 8 | O quadro geral | 3 | 4 | 3 | quadro caiu de 28 para 26 indicadores | "alavanca" sem persistência | recorte 1º‑2º x 3º‑6º |
| 9 | A temporada | 2 | 3 | 2 | — | é a única seção que não usa o estudo | probabilidade em vez de subtração |
| 10 | Método e ressalvas | 2 | 3 | 2 | **seção reescrita** | 40 clubes disfarçados de 80 observações | teto de previsibilidade |

### 1 · A linha do acesso

**Preservar:** a conta de pontos confere (2º: 65, 65, 67, 65; 6º: 57, 63, 63, 61) e sai de `SB_TABELAS`, não de texto. Contar em clubes ("8 de 20") é a língua certa. O gráfico de faixa mostra amplitude sem coeficiente.

**RESOLVIDO EM 12/09/2026:** (a) a linha de 2026 estava **fora do viewBox** (x = −165 e x = −5 num quadro que começa em 0) — agora aparece como ritmo projetado para 38 jogos, tracejado, com os pontos reais "hoje 43 e 49" no rótulo; (b) o corte dos empates caía **em cima de um empate** e o `slice(-20)` descartava três clubes de 13+ empates, entre eles o **Atlético‑GO 2023, que subiu** — o corte passou a ser por valor e a tese trocou para o **desempate por vitórias**: 17 pares terminaram empatados em pontos, em 12 as vitórias diferiam e nos 12 ficou à frente quem venceu mais; em 3 o desempate caiu em cima de uma linha de acesso.

**Aberto — grave:** a seção ainda não diz a **garantia**. Nenhum 7º passou de 63 e nenhum 3º de 66: 64 pontos entraram no playoff nas quatro temporadas e 67 subiram direto nas quatro; o piso do 6º foi 57. E "61 dá o playoff" é falso em metade da amostra, porque em 2022 (Ituano 57 = Sport 57) e 2023 (Mirassol 63 = Sport 63) a vaga saiu no critério. **Aberto — médio:** o KPI mostra 66 (arredondado de 65,5) e a distância 4,5 — quem confere na calculadora acha erro; falta o aproveitamento (57,5% e 1,72 ponto por rodada para o 2º; 53,5% e 1,61 para o 6º); e "nenhum dos 16 que subiram perdeu mais de 12 jogos" quase não discrimina (20 dos 64 que não subiram também perderam 12 ou menos). **Ressalva que falta:** o histórico foi jogado **sem** o incentivo do playoff.

### 2 · De onde vem a vantagem

**Preservar:** é a melhor estrutura da aba e todos os números reproduzem (+3,2 / +12,6 / +16,4 / +54,0 e −9,7 / −11,5 / −19,9 / −34,4; 36 pares; −0,17 / −0,02 / +0,37; 7 e 11 de 16). A "contraprova honesta" (top‑4 de xG acerta 7 de 16, acaso 3,2) protege o leitor.

**Aberto — grave (o maior problema aberto da aba):** o teste de persistência ano a ano usa 36 pares que têm **zero clubes que subiram e zero que caíram** — são todos do 5º ao 16º, 22 clubes distintos, quatro deles com 3 pares cada. Mede persistência no miolo e aplica a conclusão aos extremos. Feito dentro da temporada (1º x 2º turno, n=80): finalização **+0,20**, defesa além do xG −0,07, saldo de xG **+0,57**. A tese sobrevive — o teste exibido é que é fraco. **Aberto:** os três números vão sem limiar (para n=36 o limiar é 0,33; IC da finalização [−0,47; +0,17]); a cadeia usa nível bruto, contra a própria regra "posto, nunca nível" (em posto: −0,22 / **+0,17** / +0,42 — a defesa troca de sinal); e "do +54% de gols só +16,4 vem de criar" trata percentual multiplicativo como soma. Em gols: dos 17,6 de diferença, 6,2 são criar e 11,4 converter.

**Contradição a resolver:** "a parte que mais pesou é a que não se contrata" contradiz a §3 (goleiro) e a §8 (goleiro como alavanca). **Falta, e é a maior lacuna do estudo:** a cadeia contra o 5º‑8º.

### 3 · Ataque e defesa

**Preservar:** a assimetria embaixo (pior defesa caiu 4 de 4; pior ataque escapou uma vez — Ponte Preta 2023) e as exceções nomeadas.

**RESOLVIDO EM 12/09/2026 (parcialmente):** os postos médios da prosa estavam **hard‑coded** e agora saem de `P.sobe.ra/rd` (4,1 / 5,4 no sobe; 16,1 / 16,9 no cai) e o "apenas" só sai quando o caso é único.

**Aberto — grave, e é a metade que ficou:** o ranking interno continua com `i + 1`, ordem simples, **sem média no empate**, contra a regra da aba (`sbPostos`). Conferi na base: em 2025 o **Athletico‑PR (2º, subiu) tem 43 gols sofridos empatado com o Volta Redonda** — posto 10,5 pela regra da aba, 10º pelo `sort` estável. Com empate = média os postos são 4,3 / 5,7 (sobe), 10,7 / 10,0 (meio) e 15,9 / 16,7 (cai), e o Athletico‑PR entra na lista "subiu com defesa fora do top 10". Correção: trocar os dois `sort/forEach` por `sbPostos(t,'gp',false)` e `sbPostos(t,'gc',true)`.

**Aberto:** "quem sobe espalha o gol" é mecânico — marcadores anda 0,43 com gols pró e, **por gol**, quem cai espalha mais (0,44 contra 0,32; rho −0,52); o artilheiro dá 0,09, abaixo do limiar, com sinal trocando por ano. O gráfico "chutar de perto" não mostra nem distância nem xG por remate — justamente os dois indicadores mais fortes (0,55 e 0,50). "Pressionar alto faz o adversário chutar de pior lugar" não se sustenta (PPDA × xG por remate sofrido = 0,03; PPDA × remates sofridos = 0,50; PPDA × posse = −0,61). **Falta:** o goleiro no nível do atleta — `gkDefesas` não ajusta a qualidade do chute (−0,49 com xG por remate sofrido), `gkEvitados` cai para 0,28, e a persistência no clube é 0,12 / −0,04. Há 25 goleiros titulares com 2+ temporadas na base.

### 4 · Bola parada

**Preservar:** o aviso "o número não existe na base" **antes** do número, e a conclusão "bola parada acompanha quem é bom, não fabrica quem sobe" (27,7% x 28,7%, rho −0,11; dos 17,6 gols, 4,6 vêm dela).

**Aberto — grave:** o indicador de destaque (bpConv 0,49) é uma razão cujo denominador tem ~19,7 de ~28 bolas paradas por jogo em **laterais** (cantos 5,1 + faltas 3,0 + pênaltis 0,13). Desagregado: escanteio→remate 29,1% x 28,6% (rho **0,14**), falta→remate 22,3% x 20,7% (rho **0,20**) — nenhum passa a régua. O 0,49 nasce de um numerador que anda 0,69 com remates totais sobre um denominador que anda −0,22 com a posição. Não é eficiência de cobrança; é "chuta mais e tem menos lateral". **Aberto:** o título ("o canal em que eficiência bate volume") contradiz o segundo bloco; gol de cabeça como fração dos gols é 17,9% x 18,1% (rho −0,03) e a parcial controlando gols por jogo é **0,09** — fazer gol de cabeça é fazer gol, o que atinge o quarteto da §8; o primeiro bloco é texto fixo ("um dos indicadores mais fortes do estudo" — é o 14º de 32); e `golos_cabeca` vem da base por atleta, que cobre 96,6% dos gols em média e só 62% no Grêmio 2022. **Falta:** o lado defensivo (cantos cedidos, remates sofridos de bola parada), que a literatura aponta como o que mais separa, e que é derivável da linha do adversário no mesmo jogo.

### 5 · Elenco, dinheiro e idade

**Preservar:** "subir não é ter elenco curto, é não precisar do resto dele" (nucleo_1000 0,15 com IC cruzando zero; nucleo_300 0,47; usados 0,51) e o bloco que corrige em público a conclusão anterior.

**RESOLVIDO EM 12/09/2026 — a correção de fundo:** `val_*` e `sh_*` saíram do "Valor de mercado" do Wyscout (snapshot de 11/09/2026; 489 de 558 atletas com 2+ temporadas repetiam o valor) e passaram a sair do `valor_eur` do Transfermarkt por temporada (591 de 709 mudam entre anos). Efeitos medidos na tela: **EUR na defesa 0,562 → 0,497** (saiu das linhas destacadas, caiu da 7ª para a 13ª posição do quadro e ficou abaixo do EUR do elenco inteiro, 0,4997); EUR no ataque 0,286 → **0,414**; EUR no meio 0,396 → 0,356; % na defesa 0,288 → 0,220; % no ataque −0,289 → **−0,133**. **A conclusão "time ameaçado compra atacante" morreu**: a diferença de fatia no ataque caiu de 13,0 pontos para **2,0** (32,8% x 34,8%), no meio é 3,5 e só a defesa sobra com 5,0. E os três euros por setor andam 0,86 / 0,85 / 0,88 com o valor total. Ressalva calculada que ficou na tela: o Transfermarkt cobre 54,4% dos atletas do plantel e quem não tem valor entra como zero — o valor de elenco da aba é **piso**.

**Aberto — grave:** o bloco de idade afirma "quem cai é mais velho onde importa" e "no meio a diferença grita" com médias de 16 x 16 e **sem a correlação** que todos os outros blocos mostram — ela é **−0,04**, e em 2022 o sinal foi o contrário. É indício, não regra. **Aberto:** "procurou mais no ataque e na defesa" (+3,6 / +3,1 / +1,6) compara setores de tamanhos diferentes — em rho, os quatro são iguais (goleiro 0,30, defesa 0,35, meio 0,36, ataque 0,34) e em % do setor também (+30%, +25%, +18%, +28%): quem cai roda mais em **todo** setor, inclusive no gol. "Relação de −0,15, ou seja nenhuma" esconde a direção (o IC cruza zero e, se algo, aponta para **mais** gente jogando). Parte do 0,50 do valor total é cobertura (`tm_com_valor` dá 0,29). **Falta:** `valor_11` — a soma do valor dos onze mais usados — que dá 0,58, o mais forte de todos os indicadores de dinheiro, e **não está na tela**; agora precisa ser recalculado com o valor por temporada, porque hoje sai do mesmo snapshot que a Onda 1 aposentou. E falta o cruzamento que a seção tem e não faz: valor × concentração (caro e concentrado: **11 de 22 sobem**; barato e disperso: **0 de 21**, e 10 caem), com os acessos baratos nomeados (Criciúma 2023 12º em valor com share11 no posto 3; Chapecoense 2025 18º com share11 1º; Mirassol 2024 9º com share11 1º).

### 6 · Físico

**Preservar:** "não se corre mais para subir — corre‑se mais rápido" sobrevive a tudo (PSV‑99 5 melhores 0,42, IC +0,25 a +0,59; 0,45 controlando idade; 0,41 controlando PPDA; 0,37 controlando valor). O painel por posição é a análise mais original do estudo. "Para onde, não quanto" nas corridas sem bola tem mecanismo (volume 0,21 / −0,01 / 0,22 / −0,03; entram na área 0,25 / 0,25 / 0,30 / 0,30).

**RESOLVIDO EM 12/09/2026:** a tabela física ganhou **duas faixas de aceso** e trocou "17 de 32" por quantos passam a 5% e a 1% — 34 de 128 acesas, 6,4 esperadas por acaso, **2 sobrevivem a Benjamini‑Hochberg** (Zaga / PSV‑99 5 melhores 0,41; Meio / arranques até o sprint 0,39). E "o achado mais nítido do painel físico" foi rebaixado a **confirmação física do PPDA**.

**Aberto:** o número que justifica o rebaixamento ainda não está na tela — metros/min sem a bola anda +0,50 com o PPDA e +0,46 com a posse, e descontado o PPDA sobra **0,05** (contra 0,41 do PSV‑99 no mesmo controle). O grupo "Corridas sem bola" continua sob o cabeçalho "por 90 minutos" sendo **por 30 minutos com posse** — régua diferente na mesma tela. "Mediana de 3,5 atletas por clube na zaga" é a **média de quem sobe** (nos 80: média 4,04, mediana 4, mínimo 1). O número mais forte da seção está escondido numa ressalva: atletas rastreados por clube é 20,5 x 25,3 com rho **−0,48** — é a rotatividade da §5 aparecendo aqui, e PSV‑99 top5 cai de 0,42 para 0,30 quando se desconta. Nenhuma correlação vem com IC nem com o sinal por temporada (PSV‑99 top5: +0,69 / +0,51 / **+0,02** / +0,45). **Falta:** a fração da distância em sprint (0,27) em vez dos metros, e a comparação sobe × 5º‑8º, onde o físico praticamente some (PSV‑99 31,0 x 30,9; sprints 8,9 x 8,7).

### 7 · O jogo

**RESOLVIDO EM 12/09/2026 — as três razões viraram diferença de pontos:** mando **0,88 x 0,75 ponto por jogo** (16,6 x 14,3 na temporada, ou seja a vantagem é maior **em casa**); contra fortes / meio / fracos **0,74 / 0,89 / 0,80** — as três cabem em 0,15 uma da outra e a dos jogos grandes **não é a maior**; e a "reação", descontado o ritmo do próprio clube, virou **+0,06 x +0,16** (quem cai não reage menos), com o posto acompanhando a tabela a −0,05. Os títulos em negrito foram reescritos.

**Aberto — grave:** "Regularidade · o que a média esconde" continua vendendo a taxa‑base como caráter. Permutando os resultados de cada clube (3.000 vezes): maior sequência sem vencer **esperada 4,65 x observada 4,19** (sobe) e **10,55 x 9,06** (cai); o esperado correlaciona **0,974** com a posição final contra 0,743 do observado, e o resíduo dá −0,19. Quem cai é até um pouco **mais** regular que o acaso. E "quem cai quase nunca ganha dois seguidos" é falso: 10 dos 16 emendaram duas vitórias ou mais. **Aberto:** o corte por faixa de adversário é ex‑post e com autoexclusão não declarada (quem termina no G6 joga 10 partidas contra o G6; quem cai joga 12); as formações estão no limiar (0,23, e nenhum ano passa 0,44) e "quem cai se apoia menos na principal" é falso — o **meio** é o mais fiel (46,4% contra 44,7% de quem sobe); "o 4‑2‑3‑1 é o mais usado nas três faixas" é texto fixo (o dado diz: é a formação principal de 9 dos 16 que subiram e de 9 dos 16 que caíram). **Falta:** a pergunta operacional — "na rodada k, com X pontos, qual a chance?".

### 8 · O quadro geral

**Preservar:** o "Como ler" é a melhor pedagogia da aba; a distinção relação × explicação com a conta escrita; e o teste de redundância (351 pares, 6 acima de 0,70).

**RESOLVIDO EM 12/09/2026 (efeito colateral):** com o valor por setor refeito, o quadro geral passou de **28 para 26** indicadores que passam sozinhos, e as cinco linhas de euros por setor deixaram de enganar.

**Aberto — grave, contradição:** "numa liga em que todos defendem parecido, é o ataque que compra vitória" contradiz a §3 e inverte sob a regra nova. Medido: 1º‑2º x 3º‑6º x 7º‑10º fazem **68,5 / 62,3 / 56,6** pontos, marcam **48,8 / 48,7 / 42,8** e sofrem **29,8 / 35,3 / 36,6**. O acesso direto se separa do playoff **sofrendo 5,5 gols a menos com o mesmo ataque**. **Aberto — grave:** "alavanca" não foi testada — persistência em 36 pares: share11 **0,06**, gkDefesas **0,12**, cabeça **0,15**, valor **0,73**. E "nenhuma delas é gol" é falso (cabeça anda 0,54 com gols por jogo; `gkDefesas` anda 0,60 com sofrer menos gols; trocando por `gkEvitados` o R² cai de 0,65 para 0,59). **Aberto:** o gráfico mistura desfecho e processo (as seis primeiras barras são a tabela; gols marcados + sofridos dão R² 0,82) e não desenha o limiar de 0,22 nem IC (share11 [0,36; 0,73], posse [0,06; 0,53] — a ordem entre 0,25 e 0,55 não é robusta); "como não se explicam uma pela outra, elas se somam" é desmentido pelos próprios números (0,29+0,25+0,24+0,20 = 0,97 contra 0,65 medido); e `gkDefesas`, terceira alavanca, **não está** em `SB_INDICADORES` e não aparece no gráfico.

### 9 · A temporada

**Aberto — grave, organização:** é a única seção que **não usa o estudo**. `sb_clubes.js` tem as 20 linhas de 2026 com share11, valor, gkDefesas (12 de 20), cabeça, xg e xgCon — as quatro alavancas e o saldo de xG que a §8 acabou de apresentar — e o gráfico mostra só pontos. **Aberto — grave, estatístico:** "o 2º precisa de 17, o 6º de 18, o 10º de 22" é subtração de média arredondada, sem faixa: pela própria §1 o 6º precisa de 14 a 20 e o 2º de 16 a 18, e 11 jogos têm desvio próprio de ~4,3 pontos. Pior, a base desmente a leitura: **Juventude 2023 subiu em 2º saindo do 8º na 27ª rodada**, e o líder da 27ª ficou fora do G2 em 2024 e em 2025. **Aberto:** o gráfico mostra só os 12 primeiros (`slice(0,12)`) sem dizer, e a zona de rebaixamento — metade do objeto do estudo — nunca aparece; quatro clubes estão entre 41 e 43 pontos na fronteira do playoff e a cor da barra é uma decisão de desempate (Operário‑PR 12 vitórias x Atlético‑GO 11), não uma distância.

### 10 · Método e ressalvas

**RESOLVIDO EM 12/09/2026 — a seção foi reescrita e agora descreve o método de fato:** definições (sobe = top 4, cai = 17º+), posto dentro do ano com empate = média, Pearson nos postos, só temporadas completas; **comparações múltiplas com Benjamini‑Hochberg**; a régua de ruído por **Welch** (t variável, não fixo em 2,04) sobre 20 indicadores de porcentagem (menor ±0,9, maior ±9,4, mediana ±5,0) no lugar do antigo "dois ou três pontos percentuais é ruído"; e a ressalva do snapshot, agora contando a correção.

**Aberto:** os 80 clube‑temporada são **40 clubes** (4 com quatro temporadas, 16 com uma) — o limiar 0,22 = tanh(1,96/√77) pressupõe independência e é otimista. A frase "o xG supera o gol real em 9% a 14%" continua escrita à mão e desatualizada: recalculando por ano dá **+14,3% / +16,0% / +9,9% / +9,9% / +15,8%** — a faixa certa é 10% a 16%, e a frase aparece em dois lugares. "Aqui se usa a ordem, nunca o nível" segue contradito pela §2 (persistência em nível bruto) e pelo retrato da §8. E "trocas de treinador explicam metade do que aparece como característica de quem cai" não foi medido e a literatura brasileira aponta para o contrário (594 trocas, efeito até o ~7º jogo).

---

## 4. Contradições e redundâncias internas

| # | Contradição | Como resolver |
|---|---|---|
| 1 | §2: "a parte que mais pesou é a que **não se contrata**" × §3 e §8: o goleiro é alavanca e é contratável | Trocar por "não se repete no nível do **time** — nem de um ano para o outro, nem de um turno para o outro; se existe, mora no atleta, e isso ainda não foi testado" e abrir a pendência (A‑10/P10). |
| 2 | §8: "numa liga em que todos defendem parecido" × §3: "defesa ruim é sentença" × o recorte da regra nova | "Do 1º ao 8º defende‑se parecido"; e acrescentar a tabela 1º‑2º / 3º‑6º / 7º‑10º: o acesso direto se separa do playoff por **5,5 gols sofridos** com o mesmo ataque. |
| 3 | §4: título "eficiência bate volume" × conclusão "acompanha quem é bom" × §8: "marcar de cabeça" como alavanca | Renomear para "o que dá para medir, e o que ela não explica"; publicar cabeça como **fração dos gols** (17,9% x 18,1%, parcial 0,09) e avisar a §8 de que a quarta alavanca é gol disfarçado. |
| 4 | §8: "alavancas" e "mexer numa não mexe nas outras" × persistência 0,06 / 0,12 / 0,15 / 0,73 | "Mexer numa não mexe nas outras" é sobre colinearidade, não sobre acionabilidade. Renomear para **"quatro marcas independentes de quem sobe"** e reservar "alavanca" ao que se repete — hoje, só o valor. |
| 5 | §10: "usa‑se a ordem, nunca o nível" × §2 e o retrato da §8 usam nível bruto | Refazer a persistência em **posto** (a defesa troca de sinal: −0,02 → +0,17, prova de que o número exibido é frágil) ou declarar a exceção no método. |
| 6 | Topo e §1 falam da regra nova (2º e 6º) × todo o resto usa sobe = top 4 | Declarar o quadro em cada bloco e mostrar G4 (histórico) e G6 (regra nova) lado a lado nos cartões. |
| 7 | §6: dois "sem bola" opostos na mesma seção — fase **sem posse** (TIP/OTIP) e **corridas do jogador sem a bola** (enquanto o time TEM a bola) | Padronizar os nomes nos títulos e dar sub‑rótulo de régua ("por 30 minutos com posse — não soma com o resto"). |
| 8 | §3: "quem sobe espalha o gol" × por gol marcado quem cai espalha mais (0,44 x 0,32; rho −0,52) | Reescrever como resposta negativa e mover `pctArtilheiro` (0,09) para a lista do que não vale. |
| 9 | §10 e §8: "xG 9% a 14% acima do gol" (escrito à mão) × recálculo 10% a 16% | Calcular no navegador a partir de `sb_clubes.js` e escrever a faixa derivada nos dois lugares. |
| 10 | §1 vende empate como tese forte × §8 mostra sobe x 5º‑8º com empates 9,8 x 10,6 (−0,8, t −1,0) | Levar V/E/D das quatro faixas para um lugar só; empate separa 0,29 contra −0,98 de vitórias. |

**Redundâncias:** 66 / 61 / 4,5 aparecem em quatro lugares (topo, §1, §9, §10) — a §1 deve ser o lugar único da conta de pontos; 36,6 x 45,6 aparece três vezes e 66,6% x 58,2% duas; posse/passe/idade são reexplicados na §5 e na §8; a §4 dá a mesma ressalva duas vezes em 30 linhas; a §7 reparte o mesmo total três vezes (casa+fora, 1º+2º turno, faixas de adversário) sem dizer que são partições do mesmo número. *(A redundância da fatia no ataque entre o bloco do dinheiro e o do goleiro morreu junto com a conclusão, na Onda 1.)*

---

## 5. Análises novas propostas — APROVADAS

As 34 passaram pelas duas lentes (viabilidade no dado real; rigor estatístico) — 68 verificadores, nenhum erro, **nenhuma rejeitada e nenhuma intacta**. Todas voltaram com veredito "ajustar", então o ajuste faz parte da proposta: abaixo cada uma está descrita **já com o ajuste incorporado**, seguida do que os verificadores mudaram. Ordem por impacto sobre esforço. `[LESOES]` marca as que usam a base nova.

### Tabela de prioridade

| # | Análise | Destino | Esforço | O que o ajuste mudou |
|:--:|---|---|:--:|---|
| 1 | A‑09 Repetibilidade dentro da temporada | §2 + §8 | médio | vira régua de toda a aba; IC e teto de atenuação obrigatórios |
| 2 | A‑03 Sequência e reação por permutação | §7 | baixo | o nulo tem de preservar mando; a "reação" é alternância casa/fora |
| 3 | A‑12 Game state (posse por desfecho) | §8 + §10 | baixo | **conclusão invertida**: o placar esconde a posse, não a inventa |
| 4 | A‑28 O físico depois dos controles | §6 | baixo | teto de acaso (0,33) no lugar de 0,22; +1 controle (share11) |
| 5 | A‑14 Disponibilidade dos 11 em jogos | §5 | baixo | é troca de **unidade**, não indicador novo |
| 6 | A‑18 Estrangeiro e dinheiro | §8 | baixo | bug de nacionalidade; vira "não dá para saber", não "não vale" |
| 7 | A‑15 Veredito da base de lesões `[LESOES]` | §10 | baixo | "artefato" vira "inseparável do porte"; controle positivo entra |
| 8 | A‑31 Amplitude entre anos no físico | §6 | baixo | corta o índice; publica a instabilidade |
| 9 | A‑04 Contra fortes sem autoexclusão | §7 | baixo | usar só 5º e 6º (todos enfrentam 2x); achado **sobrevive** |
| 10 | A‑08 Os dois elos depois do chute | §2 | baixo | barra dupla: bruta e encolhida pela confiabilidade |
| 11 | A‑32 Disponibilidade + veredito | §5/§10 | baixo | fundir com A‑14 e A‑15 |
| 12 | A‑01 A curva de decisão | §7/nova | médio | **alvo trocado** para os jogos restantes; nulo por simulação |
| 13 | A‑10 Processo contra cada faixa | §7 | médio | **conclusão invertida**: três linhas paralelas |
| 14 | A‑11 A margem de um gol | §7 | médio | nulo Poisson obrigatório |
| 15 | A‑13 Apoiado x transição, e PPDA fora | §3 | médio | painel (b) morre; nasce "PPDA fora de casa" (0,40) |
| 16 | A‑17 O resíduo sobre o dinheiro | §5 | médio | 5 barras viram 1 família; IC e sinal por ano |
| 17 | A‑26 O resíduo sobre o preço | §5 | alto | parcial em vez de semi‑parcial; **refazer com val_* novo** |
| 18 | A‑30 Minutos para atleta lento | §6 | médio | manchete vira a parcial de rodízio; trocar PSV‑99 por sprints |
| 19 | A‑34 Corrida sem bola até o desfecho | §6 | médio | de 11 colunas para 2; o 0,57 é tautologia |
| 20 | A‑19 Anatomia da lesão `[LESOES]` | §5 | médio | painel de tipo fica; ranking de setor cai |
| 21 | A‑20 Continuidade: o teste negativo | §5 + §10 | médio | vira "não testável", não "testado e fraco" |
| 22 | A‑06 Quantos clubes ainda disputam | §1 | médio | corrigir o piso (57, não 61); cota superior |
| 23 | A‑29 O que o atleta leva na mala | §6 | médio | desenho de **movers** substitui as correlações |
| 24 | A‑21 O teto de previsibilidade | §8 + §10 | médio | faixa 0,57–0,79; um teto por tipo de métrica |
| 25 | A‑23 Três blocos, três modelos | §8 | alto | quatro blocos e modelos **aninhados** |
| 26 | A‑22 O quarteto é garimpo? | §8 | alto | a composição é garimpo, o **sinal não é** |
| 27 | A‑24 Probabilidade de 2026 | §9 | médio | propagar incerteza das forças; rodar também em xG |
| 28 | A‑25 Backtest e calibração | §9 + §10 | médio | corte por jogo do clube; baseline melhor |
| 29 | A‑27 Registro de previsão | §9 | baixo | registrar **dois** modelos e a faixa do Brier |
| 30 | A‑33 Quantos jogos um número físico precisa | §6 | alto | teto = √(rel_x × rel_y); só 2025 completo |
| 31 | A‑02 O playoff medido | topo + §1 | alto | **o mando vale zero**; a regra vale +10 pp |
| 32 | A‑05 Quebra de formação | §7 + §10 | alto | exige coletar treinadores; senão proibir a palavra |
| 33 | A‑16 Lesão jogo a jogo `[LESOES]` | §5 | alto | publicar como **limite**, não como efeito |
| 34 | A‑07 Calendário e descanso | §5 (nota) | alto | vira nulo de três frases; Copa do Brasil sai |

---

### Bloco A — corrigem o que está no ar (esforço baixo)

**A‑09 · O que é medida e o que é ruído (repetibilidade dentro da temporada)** — §2 como primeiro painel, referência cruzada na §8 · médio
**Pergunta:** com o mesmo elenco, no mesmo ano, qual indicador se repete de uma metade da temporada para a outra? **Por que importa:** é a pergunta que decide o que vai para o plano de elenco e o que vai para o rodapé — e o teste atual (36 pares) exclui por construção todos os que subiram e caíram. **Hipótese medida:** PPDA 0,806 · toques na área 0,779 · contra‑ataques 0,761 · remates 0,692 · pontos 0,593 · xG 0,537 · gols−xG **0,180**. **Dados conferidos:** `serieb_jogos.csv`, 3.570 linhas de Série B, mando 1.785/1.785, zero nulos nas métricas; nenhuma coluna nova. **Método:** sortear metades balanceadas por mando (60 sorteios; o corte par/ímpar é enviesado pelo espelho turno/returno), correlacionar as metades entre os 80, corrigir por Spearman‑Brown, e cruzar com a correlação de cada indicador com a posição. **Na tela:** duas colunas — "quanto anda com a tabela" x "quanto se repete" — mais a curva‑teto |rho|max = √(r × r_alvo) e uma coluna cinza com os ~14 indicadores que **não admitem** o teste (valor, share11, usados, minEstr, idade, os físicos, cabeça). **Ressalva:** repetibilidade não é utilidade — PPDA é estável e fraco; e o ranking é em parte um ranking de dispersão entre clubes. **Verificadores (ajustar/ajustar):** prometer ~18 indicadores, não 30; publicar IC por bootstrap **clusterizado por clube** (para r=0,18 o SE é ~0,11); calcular dentro do ano e também pooled; trocar o r cru por "r + nº de partidas para chegar a 0,7"; publicar as duas versões (sorteio e 1º x 2º turno) e diagnosticar o par/ímpar antes de descartá‑lo.

**A‑03 · Sequência e reação são aritmética da taxa de vitória** — §7, reescreve o bloco "Regularidade" · baixo
**Pergunta:** "maior sequência sem vencer" e "pontos após derrota" dizem algo além de quantas vitórias o time teve? **Hipótese medida (reproduzida 100%):** observado 4,19 / 6,63 / 9,06 contra esperado por permutação 4,65 / 6,74 / 10,55; o **esperado** correlaciona 0,974 com a posição e o observado 0,743; o resíduo dá −0,19; a "reação" descontado o ritmo é +0,06 (sobe) e +0,16 (cai), com rho −0,05. **Dados:** `serieb_jogos.csv` (`resultado`, `mando`, `Data`); `maxSemVencer`/`maxVitorias`/`ptsAposDerrota` já existem; gravar `espSemVencer`/`espVitSeguidas` e `excedenteAposD` no Python (a permutação não roda no navegador). **Na tela:** duas barras por faixa — "aconteceu" x "o acaso previa com os mesmos resultados" — com a barra do acaso maior nas três faixas. **Ressalva:** a permutação destrói também a dependência legítima (calendário). **Verificadores:** a parte da **sequência** passa como está; a da **reação** tem de ser reconstruída — com mando, derrota em casa dá −0,12/−0,16/−0,12 abaixo do ritmo e derrota fora +0,12/+0,32/+0,30, ou seja **o que parecia reação é o jogo seguinte ser em casa**. Usar p‑valor de permutação por clube (não a diferença contra a média, que é assimétrica), 10.000 réplicas, e três nulos empilhados: livre, dentro de mando, e dentro de mando × terço de força do adversário.

**A‑12 · Game state: o placar não inventa a posse, ele a esconde** — §8 (colado ao parágrafo de posse) + §10 · baixo
**Pergunta:** quanto do retrato de quem cai é consequência de estar perdendo? **Hipótese medida:** dentro do mesmo clube‑temporada, perder rende **+6,3 pp** de posse (IC −7,1 a −5,5), +2,5 cruzamentos e −0,70 contra‑ataque; mas reponderando cada clube para o mix médio V‑E‑D da liga, posse × posto vai de −0,288 para **−0,426** e cruzamentos de −0,235 para −0,358. **Dados conferidos:** `serieb_jogos.csv`, `resultado` (V 1268 / E 1034 / D 1268), `Posse, %`, `Cruzamentos`, `Contra‑ataques`, `PPDA`, `Toques na area`, precisão de passe — 0% de faltantes em 3.036 linhas. **Método:** efeito fixo de clube‑temporada; depois **reponderar** para o mix da liga e comparar o rho antes/depois. **Na tela:** barras divergentes "quando vence x quando perde" para seis indicadores, e no quadro geral dois símbolos: ▲ "o placar **infla**" (contra‑ataques 4,9x, xG 2,4x, remates 2,3x) e ▼ "o placar **suprime**" (posse 2,1x, cruzamentos 2,0x). **Ressalva:** perfil por desfecho não é game state minuto a minuto — é limite inferior; o minuto do gol exige exportação de eventos. **Verificadores:** a frase de tela estava invertida — trocar por *"O mesmo time tem 52,7% da bola nos jogos que perde e 47,3% nos que vence. Mesmo assim quem sobe tem mais posse: o placar come metade do sinal"*; e trocar a regra de marcação (a original marcaria o **xG** como contaminado, porque ele **causa** o resultado) pela comparação rho antes/depois da reponderação.

**A‑28 · O físico depois do dinheiro, da posse e do processo** — §6, substitui o bloco "com a bola e sem a bola" · baixo
**Pergunta:** quais dos indicadores físicos ainda andam com a posição depois de descontar posse, PPDA, valor e rodízio? **Hipótese medida:** PSV‑99 top5 0,42 → 0,42 (posse) / 0,37 (valor) / 0,38 (saldo de xG) / 0,41 (PPDA); "sem a bola" 0,22 → 0,00 / 0,05 / 0,23. **Dados conferidos:** 32 colunas `fis_*` com zero nulos nos 80; controles `posse`, `ppda`, `tm_valor_total`, `xg`, `xg_contra` — tudo já em `sb_clubes.js`; a parcial de primeira ordem sai de `sbRho`/`sbRhoEntre`. **Na tela:** tabela "o que sobra do físico quando se desconta o resto", célula apagada abaixo do teto, mais um gráfico de setas com os cinco maiores encolhimentos. **Ressalva:** controlar saldo de xG é controle pós‑tratamento — se o físico causa o xG, descontar o xG apaga efeito real; por isso as parciais vão **separadas**, nunca múltiplas. **Verificadores:** (a) incluir **share11** como quarto controle — com ele, PSV‑99 top5 cai de 0,42 para 0,21, porque pico de velocidade e grupo curto andam a +0,49; (b) colapsar as três duplicatas exatas (`m_per_min` = `distance_p90` etc.) e dizer 29, não 32; (c) **trocar o limiar de 0,22 pelo teto simulado**: embaralhando o posto dentro do ano 2.000 vezes, o maior |r| entre as métricas tem mediana 0,22 e p95 **0,33** — a régua atual carimba o acaso.

**A‑14 · Disponibilidade dos 11 mais usados** — §5, dentro do bloco "Time que sobe e time que se repete" · baixo
**Pergunta:** quantas das 38 partidas os 11 mais usados de cada clube jogaram? **Hipótese medida (reproduzida):** pj11 = 79,4% / 76,3% / 70,1% (sobe/meio/cai), rho **+0,545** contra 0,536 do share11; min11 74,1% x 64,3%. **Dados conferidos:** `serieb_tecnico.csv`, `Partidas jogadas` (nunca usada no projeto, 0 nulos) e `Minutos jogados:`; a chave de clube tem de ser **"Equipa dentro de um periodo de tempo seleccionado"** (casa 100/100; a coluna `Equipa` erra 982 pares e perde o Vasco 2022) e o denominador tem de ser `jogos_base`, não 38. **Na tela:** um cartão — "os 11 mais usados de quem sobe jogaram **30 das 38** partidas; os de quem cai, 27" — substituindo (não acrescentando) o "66,6% x 58,2%". **Ressalva obrigatória:** é a **mesma medida** vista de outro ângulo: os postos andam **0,881** e as parciais são +0,18 e +0,14, nenhuma acima de 0,22 — nenhum dos dois sobrevive ao outro. E a causalidade reversa não se resolve aqui. **Verificadores:** cortar a ponte com "departamento médico" (não há nada medido que a sustente — a base de lesões dá o sinal contrário por viés); não publicar `n11_80` (terceira roupa do mesmo corpo, rho 0,457); e o teste de alvo duplo reprova a leitura causal — pj11 dá 0,545 com o posto real e **0,331** com o saldo de xG, com o sinal desmanchando por ano.

**A‑18 · Estrangeiro é dinheiro, não política de montagem** — §8 · baixo
**Pergunta:** os 17,5% x 8,5% de minutos com estrangeiros são escolha que funciona ou assinatura de quem paga? **Medido:** rho 0,237 (IC **−0,449 a +0,006**), 0,332 com o valor do elenco, parcial 0,087 (IC −0,304 a +0,136), e por ano **−0,61 / +0,13 / −0,30 / −0,17** — o sinal inverte em 2023 e sem 2022 cai para −0,11 (n=60). **Correção de base obrigatória antes de tudo:** `analisar_serieb.py:157‑158` define estrangeiro como `Pais de nacionalidade != "Brazil"`, o que conta **brasileiro com segundo passaporte** como estrangeiro; corrigido, o 17,5% cai para ~10,4% e o rho para 0,153 — abaixo do limiar. **Na tela:** move para uma **terceira faixa** — não "o que não vale" (que insinua "provado que não") e sim **"não dá para saber com 80 temporadas"** — com os dois IC e os quatro anos impressos. **Verificadores:** o controle por valor é mediador (contratar estrangeiro **faz** o valor subir); usar o valor do elenco **excluindo** os estrangeiros; e corrigir a premissa da proposta — `minEstr` **já está** no gráfico da §8 com 0,24; o que é novo é a parcial.

**A‑15 · O veredito da base de lesões** `[LESOES]` — §10, com ponteiro da §5 · baixo
**Pergunta:** a base pode ser usada como está? **Resposta (achado negativo):** não. Dias de lesão na janela andam **+0,266** com a posição **no sentido errado** (sobe 458 dias, meio 229, cai 144); a fração do elenco com histórico no TM anda **0,70** com o valor do elenco e vai de 18,5% (quartil mais barato) a **43,3%** (mais caro); 15 dos 100 clube‑temporada têm zero lesão e **dois deles subiram** (Criciúma 2023, Remo 2025). **Dados conferidos:** `serieb_lesoes.csv` (2.724 lesões, 975 atletas; `dias_AAAA` = interseção exata com 01/04–30/11, conferido em 400 lesões) × `serieb_elencos.csv` por `id_jogador` (mapa de clubes casa 42/42 e 100/100). **Na tela:** dispersão valor × cobertura com o r escrito, mais as três correções que **não** salvam a base. **Verificadores — o ajuste muda a palavra:** (a) trocar "puro artefato" por **"inseparável do tamanho do clube nesta base"**, porque a parcial controlando valor **sobrevive** (−0,358, IC −0,55 a −0,13); (b) IC em todo rho — dias/atleta coberto é −0,195 **[−0,40; +0,01]**, ou seja "a base não vê nada", não "o viés persiste"; (c) incluir o **controle positivo**, que é o argumento mais forte e está fora do relatório publicado: dias × posição controlando valor = **−0,137 [−0,35; +0,07]** contra os −0,46 de Eliakim 2020 — a base não recupera o efeito conhecido; (d) declarar a atribuição dupla (216 atleta‑ano em dois clubes, 430 dias contados duas vezes) e que o superlativo "o indicador mais forte da aba" é falso (pontos em casa dá 0,84).

**A‑31 · Três números por posição, com a faixa que a média de quatro anos esconde** — §6 · baixo
**Pergunta:** qual é a chance de as células acesas serem obra do acaso, e quanto elas variam entre anos? **Medido:** PSV‑99 top5 por ano **+0,69 / +0,51 / +0,03 / +0,44** (e +0,18 em 2026); amplitude mediana entre anos de **0,47** nas 76 células renderizadas, contra um vão de apenas 0,19 entre os rhos agregados das células acesas (0,22 a 0,41); 10 das 35 acesas cruzam zero em algum ano. **Na tela:** um traço de mínimo‑máximo entre os quatro anos em cada célula acesa, e a frase derivada: *"a diferença entre um ano e outro do mesmo indicador é duas vezes e meia maior que a diferença entre o indicador mais forte e o mais fraco que ainda acende"*. **Verificadores:** **cortar o índice de três indicadores** (0,46 contra 0,415 do isolado — vender 0,046 de ganho num cartão que existe para dizer que a terceira casa não é conhecida é contradição); mas registrar o que a permutação mostrou: contra 160 métricas físicas, o maior |rho| por acaso tem mediana 0,286 e p95 **0,391** — o PSV‑99 isolado fica em p familywise 0,035, colado no teto, enquanto o **índice** fica em 0,003. Se o índice voltar um dia, é ele o defensável, não o número único.

**A‑04 · Contra fortes e fracos, sem a armadilha de não jogar contra si mesmo** — §7 · baixo
**Pergunta:** quem sobe rende mais contra os grandes, ou o recorte mede o calendário? **Medido:** quem termina no G6 joga **10** partidas contra o G6 e quem cai joga **12** (exato nos quatro anos), com calendário médio mais fraco para quem sobe (adversários de 50,7 pontos contra 52,3). **Ajuste que salva o achado:** em vez do "relativo ao próprio ritmo" (0,17 com a posição, e com viés de teto), usar **só os jogos contra o 5º e o 6º**, que todos enfrentam duas vezes: quem sobe faz 44,3% e quem cai 19,8% (2,24x). A vantagem contra os fortes **não** é artefato de calendário. **Na tela:** nota de método de três linhas dentro do bloco existente, com a contagem 10 x 12 e o recorte limpo. **Verificadores:** medir em **diferença de pontos por jogo** (e xGD/jogo como primário), nunca em razão; ritmo de comparação **leave‑one‑band‑out** (o denominador atual inclui os próprios jogos da faixa, ~28% dele); faixa do adversário também leave‑one‑out; e régua por simulação — sem ela, "todo mundo perde um quarto do rendimento contra o G6" é a definição de adversário mais forte, não um achado.

**A‑08 · Os dois elos depois do chute** — §2, estende a cadeia · baixo
**Pergunta:** dos gols que separam, quanto é criar, quanto é acertar o alvo e quanto é converter o chute que foi ao alvo? **Medido:** %alvo 34,0% x 30,5% (rho 0,32); gol/alvo 31,3% x 23,5% (0,61); alvo sofrido 3,84 x 4,50 por jogo (0,39); gol/alvo sofrido 22,9% x 29,7% (0,57). **Dados conferidos:** `Remates`, `Remates a baliza`, `Golos`, `Remates contra`, `Remates contra no alvo` — zero nulos; **atenção**, `Remates contra no alvo` só bate com a linha do adversário em 81,8% dos jogos: decidir e declarar qual fonte usar. **Método:** decomposição contrafactual **em gols** (sequencial e declarada; ou Shapley sobre as 6 ordens — a cadeia é multiplicativa e a soma dos elos isolados dá 15,7, não 17,6): chutar como quem sobe +1,0 gol, acertar o alvo +3,9, converter +12,5. **Verificadores — o ajuste é o que salva:** o elo final tem confiabilidade **0,31** (split‑half 19x19 r=0,186; 148 chutes no alvo por temporada, 65% ruído) e o rho observado de 0,611 é **maior que o teto de atenuação** (√0,35 = 0,59), o que só pode ser circularidade da mesma temporada. Logo: **barra dupla em cada elo — bruta e encolhida pela confiabilidade** (o vão de conversão cai de 10,9 para ~3,8 gols), etiqueta de confiabilidade em cada elo (remates 0,71 · xG 0,66 · gols 0,53 · %alvo 0,42 · conversão 0,31 · %alvo sofrido 0,10 · conversão sofrida 0,17) e elo abaixo de 0,30 hachurado como **não‑achado**. Isso mata o KPI defensivo como alavanca e promove o achado verdadeiro: a defesa de quem sobe está no **volume concedido** (3,84 x 4,50, rho −0,49, confiabilidade alta). E não substituir a cadeia atual: **estender** o último elo.

**A‑32 · Disponibilidade medida no campo + o veredito de lesões** `[LESOES]` — §5 e §10 · baixo
Pesos invertidos em relação à proposta original: o **veredito de lesões** vira a peça principal (funde com A‑15) e a disponibilidade vira um box dentro da §5 (funde com A‑14), com o nome honesto **"estabilidade da escalação"**, não "disponibilidade". Números: 30,0 x 26,7 partidas dos onze; 6,6 x 4,1 titulares com 30+ jogos; rho 0,545 mas **0,881** de sobreposição com o share11 e 0,331 contra o saldo de xG. A etiqueta "independente do orçamento (0,05)" não pode ir à tela: por temporada o rho com o valor é −0,03 / +0,03 / +0,32 / −0,17 (IC do pooled [−0,16; 0,25]). **Quarta tentativa nova para as lesões**, que fecha a porta sem apelação: coorte de cobertura constante — comparar dias **só entre atletas que têm ao menos um registro no TM**, em posto dentro do ano.

### Bloco B — blocos novos, esforço médio

**A‑01 · A curva de decisão: quanto da tabela já está escrita na rodada k** — §7 ou seção nova depois da §1 · médio
**Medido e reproduzido:** rho(posto após k, posto final) = 0,624 (k=5) · 0,676 (10) · 0,815 (19) · 0,871 (27) · 0,961 (34); P(G2 | 1º‑2º na 27ª) = 50%, P(G2 | 3º‑6º) = 19%. **Dados:** `serieb_jogos.csv` já tem `resultado`, `golos_pro/contra`, `adversario`, `mando` prontos (não parsear a coluna `Jogo` — 337 de 3.570 linhas têm nome divergente); `analisar_serieb.py:253` já faz o `cumcount` da rodada; gravar uma matriz [clube‑temporada x 38] (~8 KB). **Verificadores — o alvo tem de mudar:** com 20 times **idênticos** (moeda com as taxas reais 35,4% V / 29,2% E, 400 temporadas), o nulo dá 0,33 / 0,48 / 0,68 / 0,81 / 0,92 — e o 0,871 observado cai **dentro** da faixa p5‑p95 [0,66; 0,93]. Então: (a) linha do nulo obrigatória no gráfico; (b) **alvo principal passa a ser rho(posto após k, posto nos 38−k jogos restantes)**, que é plano: 0,48 / 0,44 / 0,46 / 0,52 / 0,45 / 0,47; (c) manchete nova — *"a tabela na 5ª rodada acerta o resto da temporada tão bem quanto a tabela na 30ª (0,48 x 0,47); o que muda com o tempo não é o quanto se sabe, é o quanto ainda dá para reverter"*, com o corolário operacional que sobrevive: **do 11º para baixo na 27ª, 0 de 40 subiram**; (d) IC por bootstrap no nível de **temporada** (n efetivo = 4); (e) em 2026 usar `SB_TABELAS` e não a reconstrução (seis clubes têm um jogo a menos; Criciúma 44 contra 47 reais); (f) células com n=8 escrevem "4 de 8", nunca "50%".

**A‑10 · O processo contra cada faixa de adversário** — §7 · médio
**Medido:** o contraste sobe−cai **dentro** de cada faixa é praticamente idêntico: G6 **+0,44** [0,19; 0,70], meio **+0,41** [0,23; 0,58], Z6 **+0,43** [0,22; 0,66], com diff‑in‑diff +0,02 [−0,27; +0,29]. A auto‑junção por `ano+Data+Jogo+adversario` fecha **3.036/3.036**. **Verificadores — conclusão invertida duas vezes:** nem "quem sobe bate os fortes" (a aba) nem "a superioridade é construída contra os fracos" (a proposta original): são **três linhas paralelas**. E o passo 4 desmente o mecanismo imaginado — o excedente de resultado sobre o xG de quem sobe contra o G6 é **−0,011 ± 0,098** (zero), estando concentrado contra o Z6 (+0,512) e o meio (+0,308). **Na tela:** três linhas com faixa de IC, nunca o nível bruto por faixa sem a linha de base da liga (−0,207 / −0,009 / +0,219).

**A‑11 · Metade dos pontos sai de jogo de um gol** — §7 · médio
**Medido (tudo reproduzido):** 29,2% / 44,2% / 18,3% / 8,3% das partidas por margem 0/1/2/3+; quem sobe tira 32,4 pontos dos jogos de um gol (49% do total) e quem cai 15,2 (43%); vitórias de um gol 10,8 x 5,1 (rho 0,76), derrotas 6,6 x 11,2; vitórias por 3+ 2,8 x 0,7. **Verificadores — o nulo derruba a manchete:** simulando gols ~Poisson do xG real (zero habilidade em jogo apertado), a repetibilidade metade‑metade dá **0,054** nos jogos de um gol e **0,188** nos de 2+ — mesma razão ~3,5x da observada. "Apertado não se repete, goleada se repete" é artefato de condicionar no placar. Publicar o **excesso sobre o acaso** ("apertado 0,27, acaso 0,05; 2+ 0,61, acaso 0,19") e trocar o split‑half por decomposição de variância: **56% a 84% da diferença entre clubes em vitórias apertadas é o que o cara‑ou‑coroa já explica**. Manter a metade descritiva (margens e pontos por faixa), que é nova e dá magnitude em pontos.

**A‑13 · Apoiado ou em transição, e a pressão que não afrouxa longe de casa** — §3 · médio
**Medido:** `atq_posicional`, `atq_pos_remates`, `contra_ataques`, `ca_remates` existem com 100% de cobertura e **nunca foram carregados** no JS. Contra‑ataque **não separa** (+0,14), conversão de contra‑ataque tampouco (+0,08) e ataque posicional com remate fica em +0,21 — não passa. Frase honesta: *"quem sobe monta mais ataques organizados, mas não tira mais remate deles — o ganho está em onde se chuta"*. **Verificadores — o painel (b) morre e nasce outro:** a hipótese de que a **variação** do PPDA separa mais que o nível é falsa (queda contra o G6 0,232; queda fora 0,244; nível 0,345) e, decisivo, a "queda de pressão" **não correlaciona nem consigo mesma** (split‑half par/ímpar: +0,012 e −0,108, contra 0,686 do PPDA médio). Regra que nasce daqui para a aba inteira: **nenhum indicador com confiabilidade split‑half abaixo de ~0,4 pode receber substantivo de traço** ("identidade", "estabilidade"). No lugar: **PPDA fora de casa, rho +0,402** (IC +0,20 a +0,57; 0,51/0,34/0,34/0,41 nos quatro anos) contra 0,198 em casa — 9,1 x 10,0 de PPDA em casa, 10,5 x 12,2 fora.

**A‑17 · O resíduo sobre o dinheiro** — §5, fechando a seção · médio
**Pergunta:** tirando o bolso, o que sobra? **Medido:** R² de 0,25 do posto final no posto de valor; resíduos negativos exatos — Chapecoense 2025 (−11,2), Sampaio 2022 (−9,2), Vitória 2023 (−8,8), Criciúma 2023 (−8,2), Novorizontino 2024 (−8,2), Mirassol 2024 (−7,8), Ituano 2022 (−7,7), Coritiba 2025 (−6,3); positivos: Guarani 2024 (+11,2), Náutico 2022 (+10,7), Paysandu 2025 (+8,3). **Verificadores:** o resíduo **não é alvo novo** — correlaciona 0,866 com o posto real, e toda variável ortogonal ao dinheiro ganha 1,155x por aritmética (os +0,611 de pj11 valem +0,529 contra a tabela). E as cinco primeiras barras são a **mesma variável** (conc_hhi, share_11, usados, nucleo_300, pj11). Então: **uma barra por família**, com a matriz de correlação entre elas ao lado; IC em toda barra e sinal em 3 de 4 temporadas; cortar idade, sh_defesa e estrangeiros (IC cruzam zero) e pctFicou (n=36). Manter o scatter com nomes, que é a peça genuinamente nova e é a resposta que a §5 promete e não dá.

**A‑26 · O resíduo sobre o preço: o único alvo que serve a um clube pobre** — §5 · alto
**Pergunta:** que indicadores preveem o resíduo **fora da amostra**? **Verificadores:** (a) erro central — correlacionar o indicador **bruto** com o resíduo é **semi‑parcial**, e encolhe toda barra por construção; tem de ser **parcial** (descontar o preço dos dois lados), com três barras por indicador (bruta, parcial, diferença); (b) ~160 testes exigem Benjamini‑Hochberg por família, sinal em ≥3 de 4 anos e holdout 2025; (c) dois resíduos, não um (sobre o posto real e sobre o posto por xPts), só entrando na tela o que sobrevive aos dois. **E aqui está a consequência da Onda 1, detalhada na Seção 9:** os números que o verificador mediu (val_defesa 0,56 → 0,20; val_meio 0,40 → 0,10; val_ataque 0,29 → 0,03) saíram das colunas **antigas** e estão obsoletos; a manchete "a seção do dinheiro é a que menos sobrevive ao desconto do preço" foi em parte respondida pela própria correção. **Refazer inteiro sobre o CSV regenerado antes de desenhar.** O que sobreviveu no teste e continua valendo: share_11 0,54 → 0,55, ppda 0,35 → 0,09, toques_area 0,41 → 0,18, posse 0,26 → 0,01.

**A‑30 · Minutos para atleta lento** — §6 · médio
**Pergunta:** quanto dos minutos o clube entrega a atletas fisicamente abaixo da própria posição? **Ajuste de métrica (obrigatório):** abandonar PSV‑99 (a fatia de minutos no quartil de baixo correlaciona −0,68 com `fis_psv99_top5`, que a aba já mostra, e separa **pior**: 0,339 contra 0,415) e adotar **sprints por 90**: sobe 18,9% / meio 23,3% / cai 31,2%, rho **+0,490** — e com os minutos reais do Wyscout no denominador, 14,5% / 17,5% / 23,0% e rho 0,440. Sobrevive aos controles: 0,357 (conc_hhi), 0,366 (usados), 0,358 (valor), 0,231 (os três). **Verificadores — a manchete é a parcial de rodízio, não a de orçamento:** o confundidor nunca foi dinheiro, foi crise; e contra o **saldo de xG** o efeito evapora (0,120, p=0,29). Publicar os dois alvos lado a lado e repetir a conta sobre os 15 mais utilizados (núcleo estável) — se sobreviver aí, é decisão de elenco; se sumir, era rodízio.

**A‑34 · Corrida sem bola: do intermediário ao desfecho** — §6 · médio
**Medido:** `runs_goal_within_10s_p30tip` dá rho **0,569** e `runs_dangerous_received_p30tip` 0,337; ambas com 96,5%–99,8% de cobertura e **nunca carregadas**. **Verificadores — o 0,57 é tautologia medida:** são ~26 corridas‑gol por clube‑temporada contra ~20 gols nos ~19 jogos rastreados (1,3 por gol), mediana **zero** por atleta e 61% dos atletas em zero — no nível do clube a coluna **é gols por minuto de posse**. E quem derruba não é a parcial (cai só para 0,231) e sim a **repetibilidade**: nos pares clube‑ano, `runs_goal` repete a +0,058 contra +0,378 de `runs_dangerous`. Então: carregar **duas** colunas (não 11 — `runs_targeted` anda 0,927 com `runs_p30tip` e as contagens por fase andam 0,923 com as distâncias já publicadas), publicar o 0,57 apenas como **demonstração da armadilha**, e promover razões que não recontam gol (conexão = perigosas recebidas / perigosas endereçadas; fatia dos gols nascidos de corrida).

**A‑19 · Anatomia da lesão na Série B** `[LESOES]` — §5, fechando o bloco de idade · médio
**Medido (reproduzido casa a casa):** 326 eventos e 20.648 dias em 2022‑2025; por tipo — **joelho 103 eventos / 11.388 dias / mediana 92 dias** contra **muscular 94 / 3.635 / mediana 31,5**, tornozelo‑pé 24 / 1.071, outros 105 / 4.554; joelho = **55,2% dos dias**. Por setor: DEF 5,63 · ATA 5,00 · GOL 4,39 · MEI 3,25 dias por atleta de elenco. **Verificadores:** o painel de **tipo** é o núcleo defensável (composição dentro da própria base, mediana robusta a outlier) — manter, trocando "explicam metade" por "respondem por 55% dos dias **catalogados**", declarando os 14% de "Lesão desconhecida" e a censura de fim de ano (92 dias é **piso**). O **ranking de setor cai**: a ordem DEF>ATA>GOL>MEI sobrevive em 27,4% do bootstrap, some sem o joelho (vira ATA 2,80 · DEF 2,26 · MEI 1,45 · GOL 1,43) e o goleiro tem 22 eventos em quatro anos — não‑achado. Sobrevive uma comparação: **o meio é o setor que menos perde dias, nos quatro anos**. E **cortar o cartão de idade** (o desmentido +0,245 não existe como coluna; `idade_11` × posição = −0,018, que é o mesmo nada que a §8 já publica). Na tela, a linha que protege o bloco: *"só 6% dos atleta‑temporada têm alguma lesão registrada aqui — isto é a anatomia da lesão grave catalogada, não a conta de dias perdidos do campeonato"*.

**A‑20 · Continuidade: o que a aba mede cobre 36 de 80, e a alternativa não salva** — §5 + §10 · médio
**Medido:** `no_clube_desde` tem 4.574/5.098 preenchidos, mas **1.573 datas são posteriores** a 1/abr da temporada (o campo guarda o vínculo mais recente) — sobram 58,9%. E o achado que a proposta escondia: o **−0,42 que circulava internamente reproduz exatamente** (−0,420, cobertura 100/100) quando **não** se filtram as datas anacrônicas, e cai para −0,18 quando se filtra. **Verificadores:** (a) resolver antes de publicar a inconsistência de sinal entre o rho e as médias (6,2 / 4,9 / 4,0 meses); (b) reclassificar o tempo de casa de "testado e fraco" para **"não testável"** — a perda de 41% é enviesada (some quem ficou e renovou), logo o −0,18 não refuta o −0,42, e o IC [−0,04; 0,39] cobre zero **e** a hipótese contrária; (c) a taxa de acerto de contratações só entra com janela **pré‑desfecho** (minutos nas 10 primeiras rodadas) e com a taxa de casamento certa — **62,3%**, não 82,3% (o 82,3% é da direção contrária).

**A‑06 · Quantos clubes ainda têm o que disputar na rodada k** — §1 · médio
**Pergunta:** a linha histórica foi feita contra times de férias? **Resposta:** não — em quatro temporadas **nenhum clube estava matematicamente sem nada a disputar antes da 34ª rodada**; na 37ª eram 9 de 80. **Verificadores:** (a) **corrigir o fato de partida**: o 6º fez 57, 63, 63 e 61 — 61 é a **média**, o piso é 57, e em 2022 passou‑se com 57; a frase honesta é *"faça 63 e você entra em 4 de 4; 57 bastou uma vez"*, com IC de bootstrap de n=4 temporadas (~56 a ~66); (b) matar a área empilhada (seria uma faixa reta) e usar um número grande mais a barra de eliminados da 34ª à 38ª (1, 2, 4, 9); (c) trocar a evidência de rendimento n=2 (0,94 x 1,38) por "os que terminaram entre 5º e 10º fizeram **+0,10 ponto por jogo a mais** nas 8 últimas do que no resto do ano (n=24)"; (d) publicar como **cota superior**: 0,17 jogo por temporada contra adversário morto × 3 pontos = a inflação da linha do 6º é de no máximo ~0,4 ponto, menor que o próprio desempate.

**A‑29 · O que o atleta leva na mala e o que é do sistema** — §6 · médio
**Pergunta:** perfil físico é traço do atleta ou produto do clube? **Verificadores — trocar a correlação pelo desenho de "movers", que é a única coisa quase‑experimental ao alcance:** para os 465 atletas que trocaram de clube com origem e destino rastreados, a variação da distância/90 do atleta acompanha a diferença de patamar entre os clubes com **beta 0,63** (IC 0,53–0,74); para o PSV‑99 contra o patamar de velocidade do clube, **beta 0,22** (IC 0,07–0,37). *O mesmo jogador, mudando de casa, adota dois terços da quilometragem da casa nova e quase nada da velocidade.* Duas correções obrigatórias: média do clube **excluindo o próprio atleta**, e diferença entre clubes medida **no mesmo ano**. Os r brutos da proposta não reproduzem exatamente (PSV‑99 0,80 x 0,75, não 0,80 x 0,80) e 24% dos pares terminam em 2026 (parcial) — cortar.

**A‑21 · O teto de previsibilidade** — §8 + §10 · médio
**Pergunta:** com que correlação um oráculo acertaria a tabela? **Verificadores — publicar faixa, não ponto:** o λ da penalidade governa o resultado (0,81 com λ=0; 0,62 com λ=30) e foi escolhido a gosto; escolher por **deviance preditiva fora da amostra** e publicar a banda entre o ajuste in‑sample e o desenho fora‑de‑amostra (força do 1º turno → tabela do 2º), que dá ~0,57. **E, decisivo, um teto por tipo de métrica:** o teto limita **preditores ex‑ante** (valor, idade, concentração, físico); métricas contemporâneas (xG, remates, PPDA) compartilham a realização do acaso com o alvo e podem legitimamente ficar acima — uma linha única atravessando as 32 barras seria erro categórico e faria "pontos em casa 0,84" parecer melhor que um oráculo. Cortar os KPIs de vagas ou reformulá‑los (colidem com números já publicados: top‑4 de saldo real acerta 11 de 16).

### Bloco C — modelagem e coleta (esforço alto ou dependente)

**A‑23 · Três blocos, três modelos: desfecho, processo e ex‑ante** — §8 · alto
Rotular as ~54 colunas e rodar ridge com λ por LOSO aninhado. **Verificadores:** (a) **quatro** blocos, não três — separar SORTE/RESÍDUO (finalização, defesa_vs_xg, penaltis_conv, gkEvitados) para não vender sorte como jogo; (b) **modelos aninhados** em vez de paralelos: a pergunta honesta não é "quanto processo prevê" e sim "quanto processo **acrescenta** ao que já se sabia em janeiro" — e o delta é de 1 a 3 acertos em 16, provavelmente indistinguível de zero; (c) a manchete "o ranking cru de valor faz melhor que o modelo" não se sustenta (9, 10 e 6 em 16 não são diferenças: Fisher p ≈ 1 e ≈ 0,3); (d) renomear o bloco ex‑ante (o Transfermarkt histórico traz elenco de **dentro** da temporada); (e) tirar `pctFicou`/`novos` (0/20 em 2022) e rebaixar o bloco estadual (70 de 80, com dropout correlacionado ao porte); (f) publicar por temporada — o baseline acerta 4, 1, 2 e 3.

**A‑22 · O quarteto é garimpo? A busca refeita fora da amostra** — §8 · alto
**Reproduzido exatamente:** a busca C(41,4) = 101.270 dentro de cada fold devolve **quatro quartetos diferentes** (sem 2022: dist_remate, ppda, gkDefesas, usados; sem 2023: xg_por_remate, bp_conv, share_11, min_estrangeiros; sem 2024: remates_contra, remates_baliza_pct, gkDefesas, usados; sem 2025: xg_por_remate, remates_contra, remates_baliza_pct, gkDefesas), com rho LOSO 0,682 e 7 de 16 acessos. **Verificadores:** (a) espantalho — a busca reintroduz gol, xG e remates, que a regra da aba **excluía**; rodar a busca principal sob a regra da aba e a das 41 como braço secundário; (b) **régua nula obrigatória**: com alvo embaralhado, o melhor quarteto em treino dá R² 0,26 só de ruído e o LOSO dá rho −0,02 com 2,6 acessos em 16 — logo a frase de fecho muda de "o quarteto é garimpo" para **"a COMPOSIÇÃO é garimpo, o SINAL não é"** (0,682 e 7/16, p≈0,009); (c) publicar R² dos dois lados, não rho misturado: quarteto da aba **0,646 → 0,620**, quarteto garimpado **0,710 → 0,427**; (d) a re‑garimpagem sob a regra de descorrelação preserva os conceitos (goleiro 4/4, grupo curto 6/8, valor 4/8) — é essa a resposta à ressalva que a §8 já publica.

**A‑24 · Probabilidade de subir em 2026** — §9 · médio
Poisson penalizado sobre as 27 rodadas, simulando o restante. **Verificadores:** (a) ancorar em `SB_TABELAS[2026]` e simular **110** confrontos, não 113 — os três jogos ausentes do Wyscout são recuperáveis (Criciúma 2‑0 Vila Nova, Atlético‑GO 2‑1 Ceará, São Bernardo 1‑2 Londrina); (b) **propagar a incerteza das forças** (bootstrap/posterior dentro do laço) — simular a partir de forças pontuais entrega metade do leque; (c) rodar **duas vezes**, em gols e em xG (`Golos esperados` está na base), porque a distância entre as duas é a medida honesta de quanto do favoritismo é finalização; (d) publicar o λ com o critério que o escolheu (a sensibilidade é de 58% a 72% no Juventude); (e) arredondar (5 em 5 acima de 10%, "<5%" abaixo) e nunca ordenar por 1 pp. Números corrigidos com λ=10: Novorizontino 69% direto / 98% G6; Juventude 64% / 98%; Fortaleza 23% / 86%; Vila Nova 18% / 81%; Criciúma 17% / 82%; Operário‑PR 3% / 42%; Atlético‑GO 2% / 38%; CRB 2% / 37%; Sport <1% / 19%; Cuiabá <1% / 10%.

**A‑25 · Backtest e calibração nas rodadas 19 e 27** — §9 + §10 · médio
**Medido:** corte em 190 jogos → Brier 0,112 contra 0,160 da taxa‑base (30% menos erro); corte em 270 → 0,116 (não melhora). **Verificadores:** (a) "as 190 primeiras partidas por data" **não é a 19ª rodada** (clubes chegam com 17 a 20 jogos) — cortar no **19º jogo de cada clube**; (b) calibrar o **mesmo alvo que a tela reporta**: top‑2 (taxa‑base 10%, Brier de referência 0,090) e top‑6 (30%, 0,210), deixando o top‑4 só como leitura histórica; (c) trocar o baseline: skill score contra "quem está no G4 no corte sobe" e contra extrapolação por pontos‑por‑jogo; (d) escrever "n efetivo ≈ 4 temporadas, não 80 clubes" e publicar os quatro Briers; (e) nenhuma faixa com n<15 recebe frase interpretativa; (f) auditar por que a 27ª não melhora — se persistir após o corte corrigido, **isso** é o achado.

**A‑27 · Registro de previsão de 2026** — §9 · baixo (mas depende de A‑24 e A‑25)
Congelar num arquivo versionado, com carimbo visível, as probabilidades da rodada corrente. **Verificadores:** (a) registrar **dois** modelos lado a lado — baseline nu (pontos + força) e o modelo do estudo — e escrever **antes** a diferença média entre eles em pontos percentuais: é a única coisa no painel que testa o **estudo** em vez de testar aritmética de tabela; (b) publicar a faixa p5‑p95 do Brier que o próprio modelo produz **antes** do resultado, e usar skill score, não Brier cru; (c) escrever o critério de acerto antes; (d) declarar no carimbo que uma temporada é uma observação. Sem A‑24 e A‑25, este bloco não mede nada.

**A‑33 · Quantos jogos um número físico precisa** — §6 · alto
**Medido em 2025** (única edição com `physical_match` completo — 374 jogos; 2022‑2024 têm **zero** linhas): confiabilidade corrigida por Spearman‑Brown — cod_count 0,94 · corrida 0,90 · aceleração forte 0,85 · desaceleração 0,83 · distância 0,76 · PSV‑99 0,71 · sprints 0,69 · **metros em sprint 0,52**. **Verificadores:** (a) o teto é **√(rel_x × rel_y)**, não a confiabilidade crua — publicar 0,52 como teto geraria o constrangimento de uma correlação observada maior que o próprio teto; (b) medir também a confiabilidade do **alvo** (meias‑metades de pontos por jogo) — é o número que falta na aba inteira; (c) trocar ímpar/par por componentes de variância num modelo misto (responde literalmente "quantos jogos"); (d) **cortar** o gráfico de turnos (1% com n=4 clubes por faixa). O achado que paga o bloco: aceleração forte tem confiabilidade 0,85 e correlação −0,01 — **é um zero de verdade, não falta de amostra**.

**A‑02 · O playoff, medido** — topo + §1 · alto
**Verificadores — o achado é o oposto da hipótese:** sob Poisson independente, P(3º passa) = **0,630 com o mando real e 0,630 com mando neutro** — em ida e volta cada lado manda um jogo e o fator se cancela no agregado. A "vantagem dupla" escrita no topo e na §10 está **errada**: o melhor colocado não ganha um campo, ganha um **critério**. E o nulo aritmético é alto: com dois times idênticos, a regra do empate no agregado sozinha dá **60,0%**. Publicar o nulo como **primeiro** número, trocar a barra empilhada por um fatorial 2x2x2 (mando ligado/neutro × regra/pênaltis × forças medidas/iguais) e dar os três números: 63% (3º), 58% (4º), **"a regra sozinha vale ~10 pontos percentuais"** (sem ela o 4º seria azarão, 48,5%). Declarar que não há um único playoff de Série B para validar.

**A‑05 · Quebra de formação como proxy da troca de treinador** — §7 + §10 · alto
**Medido:** `Sistema` tem zero nulo em 3.570 linhas, 18 desenhos, parseável; a formação muda de um jogo para o outro em **50,3% a 58,2%** das partidas (não 52‑62%); contar quebras contra a posição dá +0,08 (zero). O estudo de evento fecha: 5 jogos antes 0,74 ppj → 5 depois 1,30 (+0,56) para quem quebrou o regime, contra 0,75 → 1,30 **para quem não quebrou** — regressão à média pura. **Verificadores:** (a) o desenho só enxerga efeitos ≥0,20 ponto por jogo (~7,6 pontos na temporada) — declarar a margem de equivalência **antes** e publicar TOST/IC, nunca "o jogo seguinte não muda"; (b) sem coletar os treinadores (100 clube‑temporada no Transfermarkt, mesma fonte já usada), **proibir a palavra "treinador"** em qualquer número da tela — o bloco mede quebra de desenho; (c) promover o achado de texto que já existe: `formPct` = −0,055 com o **meio** sendo o mais fiel (46,4% contra 44,7%) **derruba a frase publicada** "quem cai se apoia menos na principal".

**A‑16 · O único teste que a base de lesões suporta: dentro do mesmo clube, jogo a jogo** `[LESOES]` — §5 · alto
**Medido:** 347 jogos com desfalque contra 2.689 sem; diferença **−0,039 ponto por jogo**, t = −0,36, p = 0,72, IC **[−0,254; +0,175]**. **Verificadores — trocar o que o bloco promete:** o núcleo de 14 de toda a Série B soma apenas **64 eventos de lesão em quatro temporadas** (26 / 16 / 14 / 8), contra ~2 lesões por jogador por ano na referência UEFA; e o núcleo definido por minutagem **total** exclui por construção justamente a ausência longa. Publicar como *"por que a Série B não deixa essa conta ser feita"*: gráfico de exposição (eventos e dias por titular‑temporada), o teste pareado como **uma** linha de KPI com o intervalo inteiro, e a curva de sensibilidade ao tamanho do núcleo. Se um dia for refeito: núcleo **ex ante** (10 primeiras rodadas), alvo primário em **xG** (não pontos), exposição contínua (fração do valor do núcleo ausente) e modelo com efeito fixo de clube‑temporada.

**A‑07 · O calendário como adversário** — nota dentro da §5 · alto → rebaixada
**Verificadores:** a perna da Copa do Brasil **não existe** — das 5.748 linhas fora da Série B, só 155 caem dentro da janela do campeonato (82 de Copa do Brasil, 0,8 por clube‑temporada; zero de Libertadores/Sul‑Americana). Sobra o descanso, e ele é **nulo**: quem sobe joga 13,2% das partidas com ≤3 dias de descanso e quem cai 12,0% (4,7 jogos por temporada, não 15); dentro do próprio clube a diferença entre ≤3 e 6‑7 dias é 0,10 ponto por jogo (p=0,15); e a fatia de jogos apertados não anda com `atletas_usados` (0,07) nem com a posição (−0,04). Publicar como três frases com o **EMD declarado** ("só enxergamos diferenças acima de ~0,19 ponto por jogo"): *"o calendário da Série B é igual para quem sobe e para quem cai — os 45,6 atletas de quem cai não são consequência de semana cheia (0,07), são escolha"*. E separar congestionamento exógeno (rodada de meio de semana imposta a todos) de endógeno (avanço em copa).

---

## 6. Propostas rejeitadas, e o que **não** deve ser reproposto

Nenhuma das 34 foi rejeitada. O que segue é a lista do que foi **cortado dentro** das propostas aprovadas, ou descartado em rodadas anteriores — registrado aqui para não voltar:

- **Lesão como indicador comparável entre clubes.** A cobertura anda 0,70 com o valor do elenco; dias/atleta coberto dá −0,195 com IC cruzando zero; o controle positivo falha. Uso permitido: composição dentro da base (A‑19) e o registro do viés (A‑15). `[LESOES]`
- **Minutagem do núcleo no ano como achado novo.** Correlação de posto 0,881 com o share11 e parciais de 0,18 e 0,14 — nenhuma passa a régua. Entra como **troca de unidade**, nunca como indicador adicional.
- **O índice de três indicadores físicos** (A‑31). Ganho de 0,046 sobre o indicador isolado num cartão cuja função é dizer que a terceira casa não é conhecida.
- **A fatia "mando" da simulação de playoff** (A‑02). É zero por construção em ida e volta — e essa é a notícia, não a barra.
- **A perna da Copa do Brasil e a de lesões dentro do bloco de calendário** (A‑07): 0,8 jogo por clube‑temporada.
- **Contar quebras de formação contra a posição** (A‑05): +0,08.
- **`n11_80`** (titulares com 80%+ dos jogos) e **`runs_targeted`/`runs_dangerous_targeted`** e as contagens físicas por fase (A‑34): terceira e quarta roupas do mesmo corpo (0,92 a 0,93 com o que já está na tela).
- **O "aproveitamento relativo ao próprio ritmo"** (A‑04): 0,17 com a posição, com viés de teto a favor dos fracos.
- **O gradiente do saldo de xG por faixa de adversário** (A‑10): mede a força do adversário, não o time.
- **O passo Poisson de "pontos merecidos" nos jogos apertados** (A‑11) sem calibração prévia do simulador.
- **O gráfico de linha por bloco de rodadas no físico** (A‑33): 1% de diferença com n=4 clubes por faixa.

---

## 7. Reorganização da narrativa

**Diagnóstico.** São três abas empilhadas: uma conta de pontos (repetida em quatro lugares), um catálogo organizado por assunto de planilha (ataque, defesa, bola parada, elenco, físico, jogo) e um apêndice que reapresenta o catálogo. O leitor recebe ~120 números sem hierarquia. Dois defeitos estruturais acima dos locais: **o contraste é o errado** (nove blocos em dez comparam sobe com cai — dois grupos separados por 31 pontos — quando a pergunta do clube é sobe × quase‑sobe, que está escondido numa tabela sem texto na §8); e **a ordem contradiz a conclusão** (80% da aba é desfecho, e só no fim se revela que o que explica é montagem e processo).

**Estrutura nova — sete seções:**

| Nova | Responde | Vem de |
|---|---|---|
| **1. O alvo** | quantos pontos, a garantia (64 e 67) e o desempate | topo + §1 + o 63 do antigo 4º da §10 |
| **2. O relógio** | quando se decide, e quanto ainda dá para reverter | §7 (turnos) + A‑01 + A‑06 |
| **3. A conta do gol** | criar, converter, defender — e o que se repete | §2 + o goleiro da §3 + A‑08 + A‑09 |
| **4. O degrau** | **sobe × quase‑sobe**: o que falta a quem chega perto | tabela 5º‑8º da §8 + a cadeia refeita |
| **5. A montagem** | elenco, minutos, idade, dinheiro, corpo | §5 + §6 condensada + A‑14 + A‑17 |
| **6. O que se soma** | as quatro marcas, o que se repete, o que não separa | §8 + §4 comprimida + A‑22 |
| **7. Onde estamos, e onde isto pode estar errado** | 2026 e o método | §9 + §10 + A‑15 + A‑24 |

*(O relatório publicado propunha cinco seções. A diferença é deliberada: "o relógio" e "o degrau" foram promovidos a seções próprias porque enterrar a ferramenta dentro de um bloco maior é exatamente o erro que a aba já cometeu com a tabela do 5º‑8º; e a seção de método fica, porque a Onda 1 acabou de transformá‑la em algo que vale ler.)*

**Cortar:** as repetições de 66/61 fora da §1; "atletas utilizados" como três blocos (vira dois); três dos cinco painéis físicos (vão para apêndice dobrável); `pctArtilheiro`, "espalhar o gol" e minutos com estrangeiros para a lista do que não vale; os dois parágrafos da §8 que reexplicam a §5.
**Fundir:** bola parada vira um bloco dentro de "O que se soma" (a própria aba conclui que o canal não explica); o goleiro sai do elenco e vai para o fim da cadeia defensiva; "tudo o que medimos", a tabela 18x4 e o retrato viram apêndice de consulta.

**A história em cinco frases:**
1. Subir direto custa 66 pontos e o playoff 61 — mas a **garantia** é 67 e 64, e em metade dos anos a linha do playoff foi decidida no desempate por vitórias.
2. A tabela na 5ª rodada prevê o resto do ano tão bem quanto a tabela na 30ª: o que passa com o tempo não é a informação, é a chance de reverter — do 11º para baixo na 27ª, **0 de 40 subiram**.
3. Contra quem cai, um terço da vantagem é criar e dois terços converter; **contra o quase‑sobe, criar não separa nada** — e a conversão é o elo que menos se repete (confiabilidade 0,31).
4. O que se repete é o elenco: confiar num grupo curto (30 das 38 partidas com os mesmos onze), ter um goleiro que defende e ter dezesseis atletas que já jogavam — mas destes, só o **dinheiro** persiste de um ano para o outro (0,73 contra 0,06, 0,12 e 0,15).
5. Correr mais não sobe; correr mais rápido, sim — no meio‑campo e com destino — e nada disso separa quem sobe de quem quase sobe.

**O que um diretor vê primeiro (cinco números):** `66 · 61` (as duas linhas) — `top‑8` (onde é preciso estar na 19ª) — `2/3` (da vantagem está no último elo) — `30 de 38` (partidas dos onze mais usados) — `0,62` (o que o modelo acerta na temporada que não viu).

---

## 8. Roteiro de implementação

### Onda 1 — **FEITA** em 12/09/2026 (`ddc5bff`), em `static/app.js`, `analisar_serieb.py`, `gerar_sb_clubes.py`, `static/style.css` e no espelho `docs/`

1. Valor por setor **reconstruído** do Transfermarkt (EUR defesa 0,562→0,497; ataque 0,286→0,414; meio 0,396→0,356; % defesa 0,288→0,220; % ataque −0,289→−0,133; a tese do atacante morreu; ressalva de cobertura 54,4% calculada na tela; quadro geral 28→26 indicadores).
2. Gráfico da §1 mostra 2026 (ritmo projetado, tracejado, com "hoje 43 e 49").
3. As três razões da §7 viraram diferença de pontos (0,88 x 0,75; 0,74 / 0,89 / 0,80; reação +0,06 x +0,16).
4. Corte dos empates por valor e tese trocada para o desempate por vitórias (17 pares, 12 decididos por vitórias, 3 em cima de linha de acesso).
5. Números da §3 calculados (4,1 / 5,4 / 16,1 / 16,9), "apenas" só quando o caso é único.
6. Tabela física com duas faixas (34 acesas, 6,4 esperadas, 2 sobrevivem a BH).
7. "O achado mais nítido do painel físico" rebaixado a confirmação do PPDA.
8. §10 reescrita com o método real, BH e a régua de ruído por Welch.

**Pendência residual da Onda 1** (não é Onda 2, é o fecho da 1): trocar `i+1` por `sbPostos` no ranking de ataque/defesa da §3 — hoje o **Athletico‑PR 2025**, que subiu, aparece como 10º em defesa quando está empatado em 43 gols sofridos com o Volta Redonda (posto 10,5). E recalcular `valor_11` a partir do valor por temporada, já que o 0,58 conhecido saiu do snapshot aposentado.

### Onda 2 — o que já está calculado e corrige o que engana (sem dado novo)

Ordem: **A‑09** (a régua, antes de tudo) → **A‑03** → **A‑12** → **A‑28** → **A‑14 + A‑32** → **A‑15** → **A‑31** → **A‑04** → **A‑08**.
Dependências de dado: nenhuma coleta nova. Três campos gravados no Python (permutação de sequência; repetibilidade; pj11/min11) porque não rodam no navegador; duas colunas novas em `gerar_sb_clubes.py` (`conc_hhi` ou `pj11`; `obrGol` e `obrPerigoRecebeu` se A‑34 vier junto). Correção de código obrigatória antes de A‑18: o bug de nacionalidade em `analisar_serieb.py:157‑158`.

### Onda 3 — blocos novos e modelagem

Ordem: **A‑01** → **A‑10** → **A‑13** → **A‑11** → **A‑17** → **A‑26** → **A‑30** → **A‑34** → **A‑19** → **A‑20** → **A‑06** → **A‑29** → **A‑21** → **A‑23** → **A‑22** → **A‑24 + A‑25 + A‑27** (um pacote só) → **A‑33** → **A‑02** → **A‑05** → **A‑16** → **A‑07**.
Dependências internas: A‑26 depende do CSV regenerado pela Onda 1 e de A‑09 (encolhimento); A‑27 depende de A‑24 e A‑25; A‑22 e A‑23 devem rodar **depois** de A‑09 (para que persistência e repetibilidade entrem nos blocos) e sobre as colunas de valor novas; A‑21 antes de qualquer leitura de "forte/fraco" no quadro geral.

### O que exige coleta nova

| Precisa | Para que | Estado |
|---|---|---|
| **Exportação de eventos por tipo de jogada (Wyscout)** | o gol de bola parada de verdade; hoje só há o proxy cabeça+pênalti, que erra nos dois sentidos | continua pendente |
| **Treinadores por clube‑temporada (Transfermarkt)** | sem isso, A‑05 mede quebra de desenho e a palavra "treinador" fica proibida na tela | 100 clube‑temporada, mesma fonte já usada |
| **Sync/backfill do SkillCorner** | `physical_match` só existe em 2025 (374 jogos) e 2026 (207) — as edições 335/446/773 têm **zero** linhas, o que limita A‑33 a uma temporada; e `Peak Velocity` tem 0% de cobertura em 2022‑2024 | pedido de backfill |
| **Colunas do SkillCorner não carregadas** | 4 de `off_ball_runs` (incluindo `runs_goal_within_10s` e `runs_dangerous_received`, 96,5–99,8% de cobertura) e as contagens `p30tip/p30otip` de `physical` | só falta mapear no gerador |
| **Nada** | as 67 colunas de `serieb_clube_temporada.csv` que não viajam para o JS — incluindo `atq_posicional`, `contra_ataques`, `passes_terco_final`, `passes_progressivos`, `recuperacoes`, `perdas` | mapeamento em `gerar_sb_clubes.py` |

---

## 9. Cruzamento com o relatório já publicado (11/09/2026)

Li `_fonte/revisao-2026-09-11/relatorio.html`. Ele propõe onze análises (P1–P11), escritas **fora** deste workflow. Veredito de cada uma à luz das 68 verificações deste run:

| | Proposta publicada | Veredito | Em uma linha |
|---|---|---|---|
| P1 | Quando o acesso se decide | **AJUSTA (forte)** | a curva reproduz, mas 0,87 na 27ª cabe dentro do nulo [0,66; 0,93]; o alvo tem de virar os jogos restantes |
| P2 | O ritmo contra a régua histórica | **AJUSTA** | "sete clubes no ritmo" são dez; usar `SB_TABELAS` (3 jogos faltam) e a faixa, não a média |
| P3 | Casa e fora por processo | **CONFIRMA** | não re‑verificada; ganha vizinho obrigatório (A‑12, game state) |
| P4 | A cadeia contra o quase‑sobe | **CONFIRMA como prioridade, AJUSTA a leitura** | o vão de 4,6 gols é conversão, cujo elo tem confiabilidade 0,31 — barra encolhida obrigatória |
| P5 | Persistência ano a ano por indicador | **AJUSTA / absorvida por A‑09** | o teste dentro da temporada cobre os 80 e escapa da restrição de amplitude |
| P6 | O alvo‑sombra por xG | **CONFIRMA** | ganha desenho rigoroso em A‑23 (blocos aninhados, delta com IC) |
| P7 | Quem sobe contrata quem já jogava | **AJUSTA** | a metade "no ano" é a mesma alavanca (0,881); a histórica fica, com a taxa de casamento certa (62,3%) |
| P8 | Validação fora da amostra na tela | **CONFIRMA e melhora** | publicar R² 0,646 → **0,620** (e o nulo: rho LOSO −0,02, 2,6 acessos em 16) |
| P9 | O teto de previsibilidade | **AJUSTA (forte)** | faixa 0,57–0,79, λ por validação, e **um teto por tipo de métrica** — nunca uma linha só |
| P10 | O goleiro no nível do atleta | **CONFIRMA e sobe de prioridade** | não re‑verificada aqui, mas gkDefesas não ajusta o chute (−0,49) e trocar por gkEvitados derruba o R² de 0,65 para 0,59 |
| P11 | Bola parada por tipo e lado defensivo | **CONFIRMA e ganha os números** | escanteio→remate 29,1% x 28,6% (0,14) e falta 22,3% x 20,7% (0,20): nenhum passa a régua |

**As duas descartadas do relatório publicado:** o descarte da **minutagem do núcleo no ano** é **confirmado com número** (0,881; parciais 0,18 e 0,14). O descarte das **lesões** é **ajustado**: o viés está provado, mas "puro artefato" é forte demais (a parcial controlando valor sobrevive a −0,358) e a base tem dois usos legítimos que o relatório publicado fechou junto — o registro com IC e controle positivo (A‑15) e a anatomia dentro da própria base (A‑19).

### A pergunta mais importante deste cruzamento: o que a correção do valor por setor tornou desnecessário ou mudou de sentido

O relatório publicado listava a correção do valor por setor como **dependência de coleta** da Onda 1. Ela foi feita. Consequências:

1. **A ressalva morreu como pendência e virou correção.** O "viés de olhar o futuro no valor por setor" sai da lista de armadilhas abertas do mapa de métodos; o que fica na tela é a **cobertura de 54,4%** do Transfermarkt e o aviso de que o valor de elenco da aba é piso.
2. **A proposta A‑26 (resíduo sobre o preço) mudou de sentido e precisa ser refeita antes de desenhada.** Sua manchete era "a aba tem uma seção inteira cujo número principal — € na defesa, 0,56 — é o que menos sobrevive ao desconto do preço (0,56 → 0,20)". Esse 0,56 **não existe mais**: é 0,497, já abaixo do valor do elenco inteiro (0,4997), e os três euros por setor andam **0,86 / 0,85 / 0,88** com o total. Ou seja, a Onda 1 já respondeu metade da pergunta — somar euro por setor é medir o tamanho do elenco de novo — e todas as barras `val_*`/`sh_*` do bloco têm de ser recalculadas. O que sobrevive intacto e útil é o outro lado: **share_11 passa de 0,54 para 0,55 quando se desconta o preço**, e ppda (0,35→0,09), toques_area (0,41→0,18) e posse (0,26→0,01) desabam.
3. **O bloco "Onde o dinheiro rende, e onde ele se perde" (§5) perdeu o achado e precisa ser reconstruído, não apenas corrigido.** Não há mais "endereço do dinheiro": sobra a defesa com 5,0 pontos de fatia e colinearidade de 0,86‑0,88 com o total. A recomendação muda: substituir o bloco por **valor total + `valor_11` + o quadrante valor × concentração** (caro e concentrado: 11 de 22 sobem; barato e disperso: 0 de 21, e 10 caem), que é a pergunta do Santa Cruz e não depende de setor nenhum.
4. **`valor_11` (0,58) está contaminado pela mesma fonte aposentada** — é calculado sobre o "Valor de mercado" do Wyscout. Antes de entrar na tela como "o indicador de dinheiro mais forte", tem de ser recalculado do Transfermarkt por temporada. Até lá, o 0,58 não pode ser citado.
5. **A‑17, A‑22 e A‑23 têm de ser re‑rodadas sobre o CSV regenerado**, porque `val_defesa`, `sh_defesa` e `sh_ataque` estão entre as 41 candidatas da busca e entre os candidatos do resíduo. A conclusão metodológica (composição instável, sinal real) não muda; os **quatro quartetos impressos na tela**, possivelmente sim.
6. **Não mudam:** A‑18, A‑21, A‑28, A‑30, A‑31 e todo o bloco de lesões — usam `tm_valor_total`, que nunca teve o viés.

### Análises aprovadas aqui que são **novas** em relação ao relatório publicado

Vinte e três: A‑02 (playoff simulado), A‑03 (permutação de sequência e reação), A‑04 (autoexclusão no recorte de adversário), A‑05 (quebra de formação), A‑06 (clubes vivos por rodada), A‑07 (calendário, como nulo), A‑08 (os dois elos depois do chute), A‑09 (repetibilidade dentro da temporada), A‑10 (processo por faixa), A‑11 (margem de um gol), A‑12 (game state), A‑13 (apoiado × transição e PPDA fora), A‑14 (disponibilidade em jogos), A‑15 (veredito das lesões com IC), A‑16 (lesão jogo a jogo, como limite), A‑17 (resíduo sobre o dinheiro), A‑18 (estrangeiro), A‑19 (anatomia da lesão), A‑20 (o teste negativo do tempo de casa), A‑24/25/27 (probabilidade, backtest e registro), A‑28 (físico depois dos controles), A‑29 (atleta × sistema), A‑30 (minutos para atleta lento), A‑31 (amplitude por posição), A‑33 (confiabilidade física), A‑34 (corrida sem bola até o desfecho).

### Lista única e final, sem duplicata, na ordem de implementação

**Fecho da Onda 1** — 0a) `sbPostos` no ranking de ataque/defesa da §3; 0b) `valor_11` recalculado do Transfermarkt; 0c) bug de nacionalidade em `analisar_serieb.py:157‑158`; 0d) a faixa do xG (10% a 16%) calculada no navegador nos dois lugares.

**Onda 2 — a régua e o que está no ar (sem coleta):**
1. **A‑09** repetibilidade dentro da temporada *(absorve P5)*
2. **A‑03** sequência e reação contra o nulo
3. **A‑12** game state — o placar esconde a posse
4. **A‑28** o físico depois dos controles (fecha o item 7 da Onda 1)
5. **A‑14 + A‑32** disponibilidade como troca de unidade *(absorve a metade "no ano" de P7)*
6. **A‑15 + A‑32b** veredito das lesões, com IC e controle positivo `[LESOES]`
7. **A‑31** amplitude entre anos na tabela física
8. **A‑04** contra fortes, sem autoexclusão
9. **A‑08 + P4** os dois elos depois do chute **e** a cadeia contra o quase‑sobe, no mesmo bloco e com barra encolhida
10. **P8/A‑22 (parte 1)** publicar 0,646 dentro / **0,620** fora ao lado do R²
11. **P11/A‑11b** bola parada por tipo + lado defensivo (cantos cedidos e remates sofridos de bola parada saem da linha do adversário)

**Onda 3 — blocos novos:**
12. **A‑01 + P1 + P2** o relógio: curva contra o nulo, alvo nos jogos restantes, régua de ritmo
13. **P3 + A‑10** casa/fora e faixas de adversário, por processo
14. **A‑13** apoiado × transição, e PPDA fora de casa
15. **A‑11** a margem de um gol, contra o nulo Poisson
16. **A‑17** resíduo sobre o dinheiro (uma barra por família)
17. **A‑26** resíduo sobre o preço — **refeito sobre as colunas novas**
18. **P10** o goleiro no nível do atleta (25 goleiros com 2+ temporadas)
19. **A‑30** minutos para atleta lento (sprints, não PSV‑99)
20. **A‑34** corrida sem bola até o desfecho (duas colunas)
21. **A‑19** anatomia da lesão `[LESOES]`
22. **A‑20** continuidade: o teste negativo do tempo de casa
23. **A‑06** quantos clubes ainda disputam
24. **A‑29** o que o atleta leva na mala (movers)
25. **P9/A‑21** teto de previsibilidade, em faixa e por tipo de métrica
26. **P6/A‑23** quatro blocos aninhados com alvo‑sombra
27. **A‑22 (completa)** o garimpo LOSO, com régua nula
28. **A‑24 + A‑25 + A‑27** probabilidade de 2026, backtest e registro carimbado
29. **A‑33** confiabilidade física por partida *(depende do backfill do SkillCorner)*
30. **A‑02** o playoff medido — o mando vale zero, a regra vale +10 pp
31. **A‑05** quebra de formação *(depende da coleta de treinadores)*
32. **A‑16** lesão jogo a jogo, publicada como limite `[LESOES]`
33. **A‑07** calendário, como nulo de três frases

---

## 10. Referências

**Sumpter / Soccermatics**
- *Luck, skill and randomness* — https://soccermatics.medium.com/luck-skill-and-randomness-aaa8d80836ea
- *Should you write about real goals or expected goals?* — https://soccermatics.medium.com/should-you-write-about-real-goals-or-expected-goals-a-guide-for-journalists-2cf0c7ec6bb6
- *How important is it to have the ball?* — https://soccermatics.medium.com/how-important-is-it-to-have-the-ball-47f93b7760fd
- *Football's magical equation?* — https://soccermatics.medium.com/footballs-magical-equation-bfe212ce7d4a
- *If you had followed the betting advice in Soccermatics…* — https://soccermatics.medium.com/if-you-had-followed-the-betting-advice-in-soccermatics-you-would-now-be-very-rich-1f643a4f5a23
- *Why Hammarby are Sweden's most successful club* — https://soccermatics.medium.com/why-hammarby-are-swedens-most-successful-club-58904569c6d2
- *What defines young and successful football teams?* — https://soccermatics.medium.com/what-defines-young-and-successful-football-teams-e41020f3c287
- *Explaining Expected Threat* — https://soccermatics.medium.com/explaining-expected-threat-cbc775d97935

**Liverpool / Ian Graham** *(livro não lido na íntegra; números conforme relatado)*
- *How to Win the Premier League* (Century, 2024) — https://www.penguin.co.uk/books/462193/how-to-win-the-premier-league-by-graham-ian/9781804950302
- Resumo por capítulos (Bookey) — https://cdn.bookey.app/files/pdf/book/en/how-to-win-the-premier-league.pdf
- Training Ground Guru, *Goal Probability Added* — https://trainingground.guru/ian-graham-the-one-currency-liverpool-use-to-judge-players/
- ESPN, *Data nerd Ian Graham helped fix Liverpool* — https://www.espn.com/soccer/insider/story/_/id/38857256/data-analyst-ian-graham-fixed-liverpool-wants-fix-european-soccer
- The42, *How the data revolution changed Liverpool* — https://www.the42.ie/ian-graham-liverpool-6491974-Sep2024/
- Significance, *How data decided Klopp's replacement* (as seis métricas de estilo) — https://significancemagazine.com/how-data-decided-jurgen-klopps-replacement/
- Spearman, *Beyond Expected Goals* (MIT Sloan 2018) — https://www.researchgate.net/publication/327139841_Beyond_Expected_Goals

**Promoção em segundas divisões**
- Sensors 2023, Segunda División (volume não se relaciona com a classificação) — https://pmc.ncbi.nlm.nih.gov/articles/PMC10675284/
- Front. Psychol. 2019 (precisão de finalização, remates sofridos, escanteios cedidos) — https://pmc.ncbi.nlm.nih.gov/articles/PMC6856952/
- Nota de corte do G4 da Série B (62 pontos, 2014‑2023) — Gazeta Esportiva / Umdois Esportes

**Físico e tracking**
- Corrida com posse na Bundesliga (Andrzejewski 2022) — https://pmc.ncbi.nlm.nih.gov/articles/PMC9465759/
- TIP/OTIP e o sinal invertido na Premier League (Second Spectrum) — PMID 42220586
- Ju & Bradley 2023 (alta intensidade por contexto tático) — https://pmc.ncbi.nlm.nih.gov/articles/PMC10108770/
- Série B brasileira 2020, GPS, 1 promovido x 1 rebaixado — https://pmc.ncbi.nlm.nih.gov/articles/PMC8369321/
- Ligue 2 com xG + tracking (só métricas defensivas separaram) — https://pmc.ncbi.nlm.nih.gov/articles/PMC11571459/
- Variabilidade jogo a jogo (CV 30‑41% em HSR e sprints) — https://pmc.ncbi.nlm.nih.gov/articles/PMC11270202/
- Curva de idade no Brasil (pico de velocidade aos 25,7) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12551122/
- SkillCorner — *Peak Velocity / PSV‑99*, *Off‑ball run profiles*, *Making the Leap*

**Elenco, lesões e dinheiro**
- Eliakim 2020 (~136 dias = 1 ponto; r=−0,46 com o resíduo sobre o valor) — https://pmc.ncbi.nlm.nih.gov/articles/PMC7247414/
- Hägglund & Ekstrand 2013 (UEFA, 11 anos; p=0,011) — só resumo lido
- CIES Football Observatory — *squad stability*; Sportsology (87% dos minutos em 15 jogadores)
- Swiss Ramble / Twenty First Group — folha salarial e posição no Championship
- Universidade do Futebol — 594 trocas de treinador no Brasileirão 2003‑2018

*Todos os números deste relatório foram calculados sobre `serieb_clube_temporada.csv`, `serieb_jogos.csv`, `serieb_tecnico.csv`, `serieb_elencos.csv`, `serieb_lesoes.csv` e `skillcorner.db`, ou reproduzidos contra `static/sb_clubes.js` e `static/app.js`. Os retornos brutos das 68 verificações estão em `_fonte/revisao-2026-09-11/resultados_agentes.json`; o diagnóstico e o aplicador da Onda 1, em `onda1_diagnostico.json` e `onda1_aplicar.py`. Onde um número não foi conferido neste run, está dito.*