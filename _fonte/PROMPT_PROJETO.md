# PROMPT DO PROJETO — Santa Cruz 2027

> Gerado por `gerar_prompt_projeto.py` em 2026-09-22, a partir dos arquivos do
> repositório. Nenhum número aqui foi digitado à mão: eles vêm do mesmo dado que a aba Estudo
> lê, já conferido pelo portão. Para atualizar: `python3 gerar_prompt_projeto.py`.

## Como usar este documento

Cole-o no início de uma sessão nova. Ele diz o que é o projeto, o que já se sabe (com os
números), como se trabalha, o que barra erro, o que está publicado, onde mora cada coisa e o
que está pendente. Depois de lê-lo, a pessoa (ou o modelo) deve:

1. Tratar toda afirmação de **limite de dado** ("essa base não tem X") como suspeita até abrir o
   arquivo cru — três vezes em dois dias isso foi defeito de código, não de dado.
2. Nunca digitar número em texto publicado: número vem de marcador, de `<ID>_numeros.json`.
3. Terminar toda análise em **nome para contratar** (treinador ou jogador). Parte que para no
   traço do time está na metade.
4. Uma pergunta por vez, com relato a cada entrega.

## O projeto em uma página

**O que é.** Um app de montagem de elenco do Santa Cruz para 2027 (campograma, orçamento,
fim de contrato, físico, financeiro, empresários, indicados, bola parada, minutagem) e, dentro
dele, o **Estudo Série B**: 35 perguntas respondidas com dado técnico (Wyscout) e físico
(SkillCorner) sobre o que separa quem sobe, qual treinador buscar e quem contratar.

**Estado.** 35 de 35 perguntas validadas · 99 conclusões
(67 indício, 31 provável, 1 firme) ·
18 decisões · 4 regras de leitura ·
portão aceitando 35 de 35 · dado de 2026-09-22.

**O alvo, dito pelo dono em 21/09/2026.** O fim de qualquer parte é sempre treinador e jogador
sugeridos para contratação. O mercado, em ordem de foco: Série B; Série A; brasileiros e
sul-americanos no exterior; campeonatos sul-americanos (principalmente).

**A única conclusão firme do estudo inteiro** é a A02-1: quem sobe finaliza de mais perto — o
eixo da qualidade da chance. Tudo o mais é provável ou indício, e o estudo diz isso na tela.


---

# 1. O MÉTODO (do `_fonte/estudo_serieb/CLAUDE.md`)

> Transcrito do arquivo que decide o método. Se este prompt e o CLAUDE.md divergirem, vale o CLAUDE.md.

## Objetivo
Responder, em partes, com os dados técnicos e físicos da Série B:
1. O que diferencia os times por faixa de classificação (Bloco A).
2. Qual o treinador ideal (Bloco T).
3. Quais os jogadores ideais para contratar em cada posição, na Série B e no exterior (Bloco J).

Cada pedido responde uma única parte (lista no fim). Nunca tente fazer um bloco ou o estudo inteiro de uma vez.

## Como trabalhar
- Uma parte por pedido. Não antecipe partes seguintes nem amplie a pergunta.
- Antes de começar, leia `_fonte/estudo_serieb/resultados/_registro.md`.
- Antes de calcular, veja se as análises existentes já respondem: `dados/prototipo.json` e `_fonte/prototipo/ESPECIFICACAO.md` (Protótipo), `static/sb_clubes.js` (Análise Série B), `dados/minutagem_serieb.json`, `dados/raio_ref.json` e `dados/bola_parada.json`. Elas continuam valendo como fonte mesmo depois que as abas Protótipo e Análise Série B saírem do menu; "etapa N" neste arquivo é a chave `etapa_N` de `dados/prototipo.json`. Se já respondem, parta desse número e só acrescente o que falta.
- Abra dizendo, em até 5 linhas, o que já existe, quais arquivos e colunas vai usar e o que vai acrescentar. Se houver dúvida ou faltar dado, pergunte antes de rodar.
- Indicador novo entra na lista pré-declarada antes de rodar (`dados/prototipo_indicadores.json` ou lista própria da parte, versionada), nunca depois de ver o resultado.
- Não altere nada em `dados/` nem os scripts existentes; só E00 e R01 mexem em arquivos do app, como descrito nelas. Os scripts do estudo ficam em `_fonte/estudo_serieb/scripts/<ID>.py`, reproduzíveis.
- Responda em português, curto e direto, sem repetir a metodologia.

## Didática
O material atual do app é denso, difícil de ler e chega a poucas conclusões práticas. Este estudo aproveita as análises que já existem, mas toda apresentação segue esta seção.

**Organização por decisão, não por método.** Tudo responde a uma de três decisões do Santa Cruz: que time montar (Bloco A), que treinador buscar (Bloco T) e quem contratar, posição por posição (Bloco J). Teste estatístico não é seção nem título; fica na prova.

**Três camadas de leitura.** A manchete serve a quem tem 10 segundos; o que vimos e o uso prático, a quem tem 2 minutos; a prova, a quem quer conferir.

**Formato de toda conclusão.**
- **Manchete:** a conclusão numa frase, dita como numa reunião de clube. É o título, nunca um tema ("Quem sobe finaliza de mais perto", e não "Qualidade de chance").
- **O que vimos:** até 3 frases, com números em unidade de jogo (finalizações por jogo, pontos, "3 em cada 8"), nunca percentil, d, q ou p.
- **Para o Santa Cruz:** o que muda na montagem do elenco, na escolha do treinador ou no modelo de jogo. Conclusão sem uso prático não sobe para o topo.
- **Premissa:** se confirma, ajusta ou contradiz uma premissa de `dados/premissas.json`, ou se sugere uma nova.
- **Confiança:** firme, provável ou indício, sempre com o n.
- **Prova:** a parte do estudo ou o trecho da análise existente que sustenta a conclusão; na tela, fica em Como sabemos.

**Confiança em três níveis.** Firme: passa na correção para múltiplos testes e vem antes do resultado (porta temporal). Provável: passa em só um dos dois. Indício: não passa em nenhum, mas é coerente e tem uso prático, ou o n é pequeno; a frase diz por quê.

**Resultado negativo também é conclusão.** O que parecia importante e não separa quem sobe vai para "Parece, mas não é", no mesmo formato (ex.: quem sobe não tem um estilo único).

**Linguagem.** Na manchete e no que vimos não aparecem: porta, nulo, família, BH, q, p, d, rho, silhueta, Jaccard, posto, garimpo. Esses termos só na prova. Um gráfico por conclusão, o mais simples que mostre o achado. Nenhum parágrafo com mais de 3 frases.

**Texto e número.** Manchete e frases são escritas com cuidado e validadas pelo usuário; os números dentro delas vêm do dado por marcador (ex.: "subiram {n_barato} de {n_fora_top8}"), para que nenhum número seja digitado à mão. Conclusão nasce como rascunho e só vai para o topo depois de validada.

## Definições fixas

### Times
**Temporadas.** 2022–2025 (completas) são a base. 2018–2021 (`dados/*_2018_2021.csv`, só técnico coletivo) servem para conferir o que a base mostrou. 2026 (em andamento) é só teste. Em 2026 o regulamento mudou (1º–2º sobem direto; 3º–6º vão a playoff): vale a posição na fase de pontos corridos. 2020 e boa parte de 2021 foram sem público: sinalizar em qualquer leitura de casa e fora.

**Classificação.** A final vem de `SB_TABELAS` (`static/app.js`), fonte de verdade do app. A de cada rodada é recalculada em A01 a partir de `dados/serieb_jogos.csv` e `dados/serieb_jogos_2018_2021.csv`, filtrando só jogos da Série B (a base traz estaduais e copas).

**Faixas.** Sobe 1º–4º | Meio 5º–16º | Cai 17º–20º, como na especificação. Comparação padrão: Sobe × Meio. Sobe × Cai mede time bom contra time ruim e é leitura secundária. Recorte próprio deste estudo: Trave (5º–8º), comparado com Sobe como leitura secundária, com n no cabeçalho.

**Fronteira.** Time do G4 a até 3 pontos do 5º, ou time fora do G4 a até 3 pontos do 4º; mesma lógica na linha do Z4, com 16º e 17º. Toda comparação entre faixas roda também sem esses times. Conclusão que só aparece com eles é ruído.

**Distância à linha.** `dist_g4 = pontos do time − pontos do 4º colocado no ano`. Usada nas análises contínuas, com os 20 times.

**Unidade e normalização.** Clube-temporada. Posto dentro da temporada, nunca número bruto entre anos. Métricas por 90 min; físicas por minuto de bola em jogo quando possível; defensivas ajustadas pela posse quando fizer sentido. Métricas de desempenho com sinal alinhado (alto = melhor); métricas de estilo sem inversão.

**Critério de conclusão.** O da especificação (§6): Benjamini-Hochberg a 5% por família, lista pré-declarada, nulo do garimpo quando houver escolha do melhor entre muitos, poder calculado para que "não separa" não vire "não existe" e porta temporal (1º turno prevendo o 2º) para separar causa plausível de consequência. Todo número vai com n; na tela, o resultado vira os três níveis de confiança da seção Didática.

**Resultado contado de outro jeito.** Os indicadores da lista fixa de consequência do resultado nunca são tratados como característica. A lista é a constante `CONSEQUENCIA` de
`ranking_gaps.py` (7 nomes), **não a etapa 10 inteira**: das 22 linhas da `etapa_10`, 17 são do tipo
`resultado` (gols, pontos, saldo de xG, finalização) e só 5 são `consequencia`. Tratar a etapa toda
como consequência tira de A02 e A04 indicadores de que elas precisam. Dois dos 7 nomes (`pctFicou` e
`novos`) não existem em `prototipo.json` e têm de sair da base de elencos.

**Placar.** Posse, volume de passes e corrida mudam com o resultado. Quando a base permitir, recorte por estado do jogo; quando não permitir, marque a conclusão como "pode ser efeito do placar".

**Valor do elenco.** Aparece como descrição ao lado (etapa 1), nunca como desconto (decisão de 15/09
na especificação). A régua contínua do dinheiro existe e chama-se `H_dinheiro`: são **nove** réguas
(A a I), não oito. A12 depende dela para o top-8 de valor e para o Cenário Barato.

**Dado físico.** SkillCorner, 2022–2025. Antes de usar, informe a cobertura por temporada e por time. Não impute valores; time-temporada com cobertura baixa é sinalizado e rodado com e sem. Descontar o rodízio como na especificação.

### Jogadores
**Unidade.** Jogador-temporada. Posição pela ponte de posição do app (`gerar_raio_serieb.py`, `dados/posicao_overrides.json`), até chegar às posições do campograma.

**Minutagem.** Fatia de minutos como em `gerar_minutagem_serieb.py`: minutos do jogador ÷ tempo que o time jogou (soma dos minutos do elenco ÷ 11, porque o Wyscout conta os acréscimos). Corte inicial de minutagem alta: 60%, a ajustar em J01. Regular, como na premissa do app: alta e repetida nas últimas três temporadas. O export do Wyscout corta em 500 linhas por temporada, então quem jogou pouco pode faltar na base (o corte está no cabeçalho de `gerar_minutagem_serieb.py` e em `_fonte/CONTEXTO_sessao_15_16_09.md`; a §6.8 da especificação é sobre truncamento de n, não sobre isto; elencos do Transfermarkt e oGol dizem quem existia). Temporada sem dado não conta como minutagem baixa.

**Lesões.** `dados/serieb_lesoes.csv` (Transfermarkt), com dias e jogos perdidos por ano, separa minutagem baixa por lesão de minutagem baixa por escolha.

**Percentis.** Dentro da mesma posição e temporada, só para quem tem pelo menos 900 minutos. Ações defensivas ajustadas pela posse do time. Métricas físicas por 90 usam só jogos com pelo menos 60 minutos em campo; velocidade máxima pode usar todos.

**Cruzamento de bases.** Pelo módulo de identidade que já existe (§1.1 da especificação). Casos ambíguos são listados, nunca adivinhados — e, **desde 20/09/2026, antes de listar, são pesquisados fora da base** (autorização do dono). Homônimo de futebol brasileiro quase sempre se resolve com uma busca: o Transfermarkt, o BID da CBF e a imprensa local trazem data de nascimento e clube de formação, que é o que falta aqui dentro. Só o que sobreviver à pesquisa é que sobe como dúvida.

**O que a busca resolveu em 20/09, e vale como molde:** 12 pares de mesmo nome e mesma idade na Série B. Oito eram a mesma pessoa (posição igual ou vizinha + **a mesma data exata de fim de contrato** = transferência registrada duas vezes); quatro eram pessoas diferentes, e o sinal era posição distante — volante × goleiro, atacante × goleiro — com datas de contrato diferentes. O detalhe caso a caso está na seção de armadilhas do `_fonte/CONTEXTO.md`.

### Estrangeiros
**Contexto.** O clube pode usar até 9 estrangeiros, mas a Série B historicamente usa poucos. Resultados de estrangeiros na própria B são descritivos: liste os casos, sem aplicar o critério de conclusão.

**Definição.** Nacionalidade de `serieb_elencos.csv` e `serieb_tecnico.csv`; dupla nacionalidade sinalizada (no app, o ⚑ marca naturalizados).

**Ligas de origem.** Percentis de jogadores de outras ligas são calculados dentro da própria liga, temporada e posição e só depois ajustados pelo fator de J08. Hoje, na régua de A e B do app, jogador de outra liga entra sem ajuste de nível; o fator de J08 é o que falta nessa comparação. Se a base não tiver as ligas necessárias, pare e pergunte.

**Físico.** Muitas ligas de origem não têm dado físico. Alvo sem dado físico é mantido, com o requisito físico marcado como "não verificado".

### Treinadores
**Passagem.** Não há nome de treinador em nenhuma base do repositório (especificação §0). T01 é uma coleta do histórico de treinadores de cada clube, de 2018 a 2026, no molde dos coletores existentes (`coletar_serieb_lesoes.py`: uma conexão, pausa entre páginas, cache, retomável).

**Mínimo.** Passagens com menos de 10 rodadas ficam fora dos rankings, mas aparecem sinalizadas.

**Contexto.** Todo resultado de treinador vem com a posição do time quando ele assumiu e quando saiu, e com o valor do elenco como descrição.

## Entrega de cada parte
Em `_fonte/estudo_serieb/resultados/`:
1. `<ID>.md`: primeiro, até 3 conclusões no formato da seção Didática; depois, separada, a prova (o que já existia e o que foi acrescentado, arquivos, colunas, n, lacunas, tabela e testes) e o que ficou em aberto, em até 2 linhas.
2. `<ID>.json`, para a tela: as mesmas conclusões em campos (`id`, `bloco`, `manchete`, `o_que_vimos`, `para_o_santa_cruz`, `premissa`, `confianca`, `n`, `prova`, `status`), com os números por marcador e os valores medidos em `numeros`; `null` e motivo onde faltar dado.

Depois, acrescentar ao `_registro.md`: ID, manchete, confiança e indicadores que passaram no critério.


---

# 2. O PORTÃO — o que barra a classe de erro inteira

Toda parte passa por `scripts/_portao.py` antes de ser publicada. Ele **só lê**: confere que o
número publicado é igual ao que o script gravou, que os dois cortes de fronteira existem e que o
texto cita quando discordam, que a manchete cabe em 14 palavras, que nenhuma palavra técnica
vaza para o texto de 10 segundos. Parte recusada não sobe. As 11 regras:

1. Todo marcador de numeros consta na saída do próprio script, com o mesmo valor
2. A confiança recalculada do testes.csv (firme = BH a 5% E porta temporal)
3. Os dois cortes de fronteira existem, e quando discordam o texto cita os dois
4. O campo prova aponta para algo que existe e não está vazio
5. scripts/<ID>.py importa scripts/_metodo.py
6. Nenhuma palavra proibida na manchete e no que vimos
7. Nenhum indicador publicado duas vezes com q diferente
8. O _registro.md é gerado dos <ID>.json, nunca editado à mão
9. O campo gerado_por é verdade ou não existe
10. A manchete cabe em 14 palavras, numa oração só
11. O que vimos cabe em 280 caracteres e em 3 frases

**O que o portão NÃO prova:** que o número saiu do dado (ele não executa script nem abre base);
que o teste publicado veio do `_metodo.py` (só que o módulo foi importado); que o trecho citado
como prova sustenta a conclusão (só que existe). Isso continua sendo leitura humana.


---

# 3. AS QUATRO REGRAS DE LEITURA

## Quatro regras, e nenhuma é conselho genérico: cada uma nasceu de um número deste estudo que teria enganado a casa. Valem para ler o que está nesta página e também para ler o número que chegar de fora — de um empresário, de uma apresentação, de outro clube.

### R1. Peça a conta DENTRO do time antes de aceitar a conta ENTRE times.

**Evita:** Transformar em meta de treino um número que só descreve que clube é aquele — quase sempre, quanto ele custou.

**A conta que a produziu:** Cruzar mais anda +0,33 com finalizar de perto quando se comparam clubes DIFERENTES, e +0,02 quando se compara o MESMO time consigo mesmo de um jogo para o outro. A ponte entre os dois números é o dinheiro: cruzar mais anda +0,26 com o valor do elenco. O time que cruza muito finaliza de perto porque é caro, não porque cruza.

*De A17 · A17-1 · D17*

### R2. Recorte cujo critério pode ser consequência do desfecho não é robustez, é seleção.

**Evita:** Publicar como "olha só nos jogos limpos" um filtro que, na prática, já sabe quem ganhou — e por isso devolve o efeito que se queria achar.

**A conta que a produziu:** Ficar com os jogos em que o time manteve o desenho de cinco defensores até o fim dá 1,75 ponto por jogo (76 jogos); os jogos em que ele trocou dão 0,86 (85 jogos). O filtro não mediu a formação: mediu quem estava ganhando, porque quem está perdendo é que mexe no time.

*De A19 · A19-1*

### R3. Falhar porque o efeito SOME é diferente de falhar porque o corte não tem TAMANHO.

**Evita:** Enterrar como "não separa" um achado que só precisa de mais temporada rastreada — e tratar como promissor um que evaporou quando o recorte mudou.

**A conta que a produziu:** Os dois falham no mesmo critério. A desigualdade do elenco dá +0,80 com todos os times e +0,81 sem os colados na linha — o MESMO efeito —, e o que muda é o que o desenho enxerga: de 0,82 para 1,14. Já o extremo do J11 vai de +0,47 para +1,00 conforme o recorte, com mínimo detectável de 0,79: aí o que mudou foi o efeito, não a régua. O primeiro é fila de coleta; o segundo, não.

*De A20 · A20-2*

### R4. Decisão com nome de régua é decisão vaga; decisão que contradiz a parte que ela cita é pior.

**Evita:** Levar para a reunião um "guiar pelo eixo da qualidade da chance" que ninguém sabe executar — ou um critério que a própria análise de origem já reprovou.

**A conta que a produziu:** Medido na própria página de decisões: a D10 mandava escolher treinador pelo PISO das passagens, e o T04-1 mede que esse critério põe em 3º lugar quem nunca subiu — trocar o piso pela média leva-o de 37,5% a 47,2% de tempo no G4 e já muda o pódio. Decisão que cita uma parte tem de sobreviver à leitura dessa parte.

*De T04 · T04-1 · D10*


---

# 4. AS 18 DECISÕES — o que o clube FAZ

Cada decisão leva o selo da conclusão que a sustenta. FIRME passou na correção para múltiplos testes E na porta temporal; PROVÁVEL passou em um dos dois; INDÍCIO em nenhum, e a frase diz por quê. Decisão com selo fraco não é decisão errada — é decisão que se toma sabendo o tamanho da aposta.


## Orçamento

### D1 · Montar o elenco para 64 pontos, e planejar 65.  *[indício]*

O 4º colocado fechou entre 62 e 64 pontos nas quatro temporadas do recorte, e 63 teria ficado fora do G4 em 2 delas. 64 apenas EMPATOU com o 4º em 3 das 8 temporadas medidas — e empate não dá vaga.

**Mas:** A linha de baixo é bem mais frouxa: o 17º ficou entre 38 e 42. Escapar do rebaixamento custa muito menos do que subir — são duas decisões de orçamento, não a mesma com margem.

*De A01 · A01-1*

### D2 · Orçar duas comissões técnicas no ano.  *[—]*

A Série B trocou de treinador 1,3 vez por clube-temporada, em média, nas temporadas fechadas. Planejar uma só é planejar o caso raro.

**Mas:** É média de troca, não recomendação de trocar: o T03-2 mediu que trocar de treinador NÃO muda o jeito de jogar do time.

*De T01*


## Modelo de jogo

### D3 · Guiar o modelo pela qualidade da chance: chegar a finalizar de dentro, e obrigar o adversário a finalizar de fora.  *[firme]*

É o ÚNICO traço firme do estudo, e três partes independentes chegaram nele. Quem sobe finaliza a 19,5 m do gol contra 20,5 m do meio; é o único traço que acompanha o treinador quando ele troca de clube; e é a única das diferenças de quem sobe que dá para treinar.

**Mas:** O que carrega o sinal é a DISTÂNCIA do chute, não a régua inteira: sem ela, a régua de qualidade de chance perde a porta temporal (parcial +0,191, p 0,0895). Toques e entradas na área vêm junto por construção, não por prova própria.

*De A02 · A02-1*

### D4 · Não montar o time por bola parada, por pressão alta nem por volume de corrida.  *[indício]*

Foram testados e nenhum separa quem sobe do meio: nada do trabalho de bola parada (A04-1), nada do jogo sem bola (A06-2), e correr mais não separou (A07-1). Também não separa depender de casa (A03-1) nem o jeito de construir a jogada (A05-1).

**Mas:** "Não separa" aqui quer dizer "este desenho não conseguiria ver": com 16 promovidos contra 48 do meio, só uma vantagem grande apareceria. Não é prova de que não importa — é aviso de que não dá para apostar nisso.

*De A04 · A04-1*

### D11 · Defender empurrando a finalização para fora da área, e não tentando reduzir o número de finalizações do adversário.  *[provável]*

Medido dentro do PRÓPRIO time, no mesmo mando: no jogo em que pontua, ele empurra o chute do adversário 0,85 metro para trás e NÃO sofre menos finalização (-0,06 no corte com todos os jogos, sem separar). É o mesmo eixo do D3, agora no lado defensivo e dentro do time, não entre times.

**Mas:** Dentro de um jogo não existe anterioridade: o que o time faz e o ponto acontecem juntos, então nenhuma conclusão de jogo passa de provável. O efeito do placar aqui joga CONTRA o achado — quem está à frente recua e costuma ceder chute de mais perto —, o que o reforça, mas não o prova.

*De A15 · A15-1*

### D12 · Tirar posse, passe ao terço final e escanteio da lista de metas de jogo.  *[provável]*

No jogo em que o próprio time pontua, ele tem 6,18 pontos de posse A MENOS e dá 8,93 passes a menos ao terço final, com 0,89 escanteio a menos. Subir esses números não é o mesmo que somar ponto.

**Mas:** Boa parte disso é reação ao placar: quem está atrás ataca mais, e a base não tem o minuto do gol para separar as duas coisas. Por isso o uso é só negativo — não perseguir esses números —, e não vira "jogue sem a bola".

*De A15 · A15-2*


## Orçamento

### D13 · Gastar em modelo de jogo antes de folha. O modelo são quatro coisas medidas, nesta ordem: finalizar de mais perto, não ceder chance em casa, obrigar o adversário a finalizar de fora da área e ganhar a dividida no chão FORA.  *[provável]*

A dinheiro igual, cada uma paga — e o salto é pequeno em campo e grande na tabela. Encurtar a distância média da própria finalização de 20,8 m para 20,0 m vale 8,0 pontos na temporada. Baixar o gol esperado sofrido em casa de 1,09 para 0,86 por jogo vale 7,1. Baixar o gol esperado por finalização sofrida de 0,10 para 0,09 vale 6,2. Ganhar a dividida no chão fora de casa, de 58,2% para 61,0%, vale 4,9. Para comparar: o mesmo salto de um quarto de tabela no VALOR DO ELENCO paga 6,5 pontos e custa 9,9 mi de euro.

**Mas:** Três, e as três pesam. Primeira: NÃO é reduzir o número de finalizações do adversário — o A15-1 mediu que o time que pontua sofre a mesma quantidade de chute, de mais longe. Segunda: o estudo mede o que o traço RENDE, não o que ele CUSTA; treinador, treino e jogador têm preço e não estão na conta. Terceira: o A12-2 mediu que quem jogou como os que subiram SEM dinheiro caiu mais do que subiu — a receita existe, mas quem a tentou com elenco barato saiu pior.

*De A16 · A16-1*


## Modelo de jogo

### D14 · Não prometer que mudar o jeito de jogar no meio do ano traz os pontos do returno.  *[indício]*

O teste de anterioridade passava para a distância do chute (+0,289) e para a régua da qualidade da chance (+0,254). Pondo o dinheiro no mesmo desconto, caem para +0,198 e +0,057, e nenhum dos 8 traços passa.

**Mas:** Isto não derruba o D13: a associação a dinheiro igual continua de pé. Derruba a frase "jogue assim e os pontos vêm depois". E o valor do Transfermarkt é da temporada inteira, sem data conhecida — se foi atualizado no meio do ano, ele carrega parte do resultado e o controle fica forte demais. É um teto para a anterioridade, não a medida dela.

*De A16 · A16-2*

### D17 · Não dar ao treinador meta de estilo — cruzar mais, ter mais a bola, pressionar mais alto — esperando que dali saia finalização de perto.  *[indício]*

Dos 34 pares de jeito de jogar e chance boa, 1 sobrevive aos dois cortes e 1 vem antes da chance boa — e não é o mesmo par. Nenhum dos 17 jeitos de jogar medidos cumpre os dois critérios: posse, passe longo, passe progressivo, ataque posicional, contra-ataque, cruzamento, pressão alta, recuperação, intensidade, dividida e bola parada.

**Mas:** Não é "a alavanca não existe" — é "ela não está entre estas 17". Treino, comissão técnica, escalação por rodada e bola parada ensaiada não estão na base, e é ali que um treinador diria que ela mora. O que a parte mostra é o mecanismo do engano: cruzar mais anda +0,33 com finalizar de perto ENTRE times e +0,02 dentro do mesmo time, e anda +0,26 com o valor do elenco. Regra prática: peça a conta dentro do time antes de aceitar a conta entre times.

*De A17 · A17-1*


## Contratação

### D18 · A dividida no chão volta à ficha — medida na TEMPORADA, nunca por jogo.  *[provável]*

A fração de divididas ganhas num jogo é relacional: ela soma 100,0 com a do adversário no mesmo lance, e de um jogo para o outro quem o time enfrentou explica 7,0% da variação contra 6,6% de quem o time é. Na temporada, a média sobre trinta e oito adversários cancela isso e o que sobra é o traço do time — que é o que o A06-1 mede, e que a A16 precifica em ponto a dinheiro igual. E ele não vem com o elenco caro: anda +0,11 com o valor da folha.

**Mas:** Não serve para julgar um jogo. Quem disser "ganhamos pouca dividida sábado" está falando mais do adversário de sábado do que do time. E no jogo que rende ponto o time DISPUTA mais dividida (+0,35) e ganha fração praticamente igual (-0,08) — administrar resultado, não perder a disputa.

*De A18 · A18-1*

### D5 · Usar minutagem alta e regular como PRIMEIRO filtro, e só depois olhar o resto.  *[indício]*

É o único requisito que a base sustenta por posição (J05-3). O corte de minutagem de quem subiu varia muito entre posições: Goleiro 64,7% · Zaga 56,8% · Volante 51,0% · Lateral 46,8% · Meia 42,5% · Atacante 34,2% · Extremo 32,4%.

**Mas:** A ficha completa NÃO deve ser filtro eliminatório: como conjunção de pisos, ela reprova todo mundo — o J06-1 é exatamente isso, "nenhum nome sai desta parte por falha da ficha". O resto da ficha ordena, não elimina. Desde 21/09 a lista desta aba funciona assim: a minutagem corta, e o que sobra é ordenado pelo eixo da qualidade da chance, com físico e duelo desempatando (a regra está em J06_ordenacao.json). Quem jogou pouco por LESÃO cai junto com quem jogou pouco por escolha — o J01-2 mediu que a base não distingue os dois —, e por isso o número de quem saiu no corte vai à vista.

*De J05 · J05-3*

### D15 · Não pagar prêmio por número de corrida para a área.  *[provável]*

A ponte entre o eixo do modelo e a ficha do jogador foi medida e não paga: de 18 testes de corrida para a área por setor, 0 separam o titular de quem sobe nos dois cortes. É a quarta medida de jogador a dar negativo, depois do número técnico (J03-1), da corrida por 90 (J04-1) e da ficha completa (J05-3).

**Mas:** "Não separa" aqui é "este desenho não veria": no volante os três indicadores apontam para o lado certo — o maior é +0,43 — e ficam abaixo do mínimo detectável de 0,74, com 21 contra 50. Com mais temporadas rastreadas a pergunta merece voltar, e a lista já está declarada de antes.

*De J10 · J10-1*

### D16 · No volante, usar corrida forte e corrida longa como desempate.  *[provável]*

É o único requisito de corrida que o estudo sustenta, e vale para uma posição só. O volante de quem sobe faz 3,23 corridas fortes por meia hora de posse contra 1,88 do meio, e cobre 12,44 m por corrida contra 11,30. O J04-2 já tinha achado sinal físico no volante e em nenhuma outra posição.

**Mas:** Desempate, nunca corte: o único filtro eliminatório continua sendo minutagem alta e regular (D5). E os dois indicadores que passaram são da família de CONTROLE da parte — é volume e alcance, não destino, o contrário da hipótese que motivou a análise.

*De J10 · J10-2*

### D6 · Não contar com o mercado de livres: ele é curto demais.  *[indício]*

Em TODA a Série B há 51 jogadores livres com minutagem alta e regular. Por posição: Meia 13 · Lateral 9 · Zaga 8 · Atacante 8 · Volante 6 · Extremo 6 · Goleiro 1.

**Mas:** No gol são 1. Posição escassa não se resolve esperando a janela — se resolve antes dela, ou por outro caminho.

*De J06 · J06-3*

### D7 · Escolher goleiro por vídeo e olho, não por esta base.  *[indício]*

O J09-3 fechou assim: no gol a base não tem como apontar um nome. Dos 584 candidatos, 0 chegaram ao fim do funil. E o SkillCorner não rastreia goleiro.

**Mas:** Isto não é opinião sobre goleiro: é limite de dado, medido. Vale enquanto a base for esta.

*De J09 · J09-3*


## Elenco

### D8 · Concentrar minutos em um núcleo fixo, e planejar a janela do meio desde já.  *[provável]*

Quem sobe concentra 68,1% dos minutos nos onze mais usados, contra 63,1% do meio. E 69,8% dos minutos da Série B são de jogador que chegou naquele mesmo ano — a janela do meio não é exceção, é como a liga funciona.

**Mas:** Manter a base do ano anterior NÃO aparece como vantagem de quem sobe (J02-2). O que separa é concentrar minutos, não a origem do jogador.

*De J02 · J02-3*


## Temporada

### D9 · Tratar a metade do campeonato como alarme, não como sentença.  *[provável]*

Na rodada 19, 10 dos 16 acessos já estavam no G4 — e o resto virou depois. Quem cai já está 5,5 pontos atrás do meio na metade.

**Mas:** A tabela da metade dá vantagem, não garante a vaga (A13-3). Decisão de meio de ano tomada como se a tabela fosse definitiva erra nos dois lados.

*De A13 · A13-3*


## Treinador

### D10 · Não pagar por currículo de G4 nem por modelo de jogo. A lista de treinadores serve para reduzir a conversa, e a escolha se faz por entrevista, comissão e projeto.  *[indício]*

Resultado de treinador vem colado ao elenco que ele pegou: quem trabalha em clube do top-5 de valor entrega 14,6 rodadas no G4, contra 3,2 de quem trabalha nos 40 clubes mais baratos, e 22 desses nunca chegaram ao G4. E o histórico não viaja: entre os 28 treinadores que passaram por dois clubes ou mais, a diferença típica entre a melhor e a pior passagem é de 21,7 pontos percentuais de tempo no G4, e o jeito de jogar também não acompanha (T03).

**Mas:** OS NOMES, para reduzir a conversa e não para decidir. Pela pior passagem lideram Paulo Pezzolano (89,5% do tempo no G4) e Fábio Carille (89,2%) — e cada um tem 1 passagem só, em clube de elenco 3º e 1º mais caro do ano, que é justamente o viés medido acima. O 3º é Eduardo Baptista, 3 passagens em 2 clubes e 108 rodadas, o mais regular da base (2023 Novorizontino, 5º com 63 pontos · 2024 Novorizontino, 5º com 64 · 2025 Criciúma, 5º com 61) — e que nunca subiu; trocar a pior passagem pela média leva-o de 37,5% a 47,2% e já muda o terceiro lugar. Por isso a regra do piso NÃO vira critério de escolha: o T04-1 mediu que ela põe na frente quem nunca subiu e deixa de fora os dois que subiram com clubes diferentes. A lista inteira, com as passagens de cada um, está em T04_resumo.json.

*De T04 · T04-2*


---

# 5. AS 99 CONCLUSÕES, PARTE POR PARTE


## Bloco A — Que time montar (20 partes)


### A01 — A régua: o que separa as faixas, 2022 a 2026

*Pergunta:* Quantos pontos separam as faixas em cada temporada, e quão estável é esse corte?


**A01-1 · Elenco de 63 pontos teria ficado fora do G4 em 2 das 4 temporadas**  *[indício]*

- O que vimos: O 4º fechou com 62 (2022), 64 (2023), 64 (2024) e 62 (2025), com 16 a 19 vitórias; em 2026 vai em ritmo de 66. Um elenco de 63 pontos teria ficado fora do G4 em 2 das 4 temporadas do recorte. Nas quatro anteriores, fora dele, o corte variou mais e 63 falhou em 2021.
- Para o Santa Cruz: Montar o elenco contra 64 pontos, e não contra os 63 do meio da faixa: 63 não teria subido em 2023, em 2024 nem em 2021. E como 64 apenas empatou com o 4º em 3 dessas 8 temporadas, quem quer sair do desempate planeja 65 — uma vitória a mais. A linha de baixo é bem mais frouxa — o 17º ficou entre 38 e 42 no recorte e entre 39 e 43 nas quatro anteriores —, então escapar do rebaixamento custa bem menos do que subir: são duas decisões de orçamento diferentes, não a mesma com margem.
- n: 4 temporadas fechadas (2022–2025); as quatro anteriores (2018–2021) conferidas na base
- Prova: A01_regua.csv; A01.md, seção Prova


**A01-2 · Quem desempata o acesso é a vitória, não o saldo de gols**  *[indício]*

- O que vimos: A margem do 4º para o 5º foi de 4 (2022), 1 (2023), 0 (2024) e 1 (2025), um ponto ou menos em 3 dos 4 anos. Em 2024 Ceará e Novorizontino empataram em 64 pontos e o acesso saiu nas vitórias. Em 2018 o Goiás subiu à frente da Ponte Preta com os mesmos pontos e saldo menor.
- Para o Santa Cruz: Um jogo decide o ano, e quem desempata é a vitória, não a goleada: com pontos iguais, ganhar por 1 a 0 vale mais do que golear. O ponto que falta vem do que separa quem sobe com e sem os times colados na linha — de onde o time finaliza e a qualidade da chance que ele cede. Bola parada não entra mais nesta frase como alavanca descartada: ela separa com os 20 times e só falha quando se tiram os colados na linha; e o fim de jogo fica de fora porque não existe minuto do gol em base nenhuma.
- n: 4 temporadas fechadas (2022–2025); as quatro anteriores (2018–2021) conferidas na base
- Prova: A01_regua.csv; A01.md, seção Prova


**A01-3 · 8 dos 16 promovidos fecharam na fronteira do G4**  *[indício]*

- O que vimos: 8 dos 16 promovidos e 9 dos 16 da Trave fecharam na fronteira do G4. A Trave ficou entre 56 e 64 pontos, mediana 60,5, ou seja 2,5 pontos abaixo do corte. No total, 28 das 80 campanhas fechadas ficaram na fronteira de uma das duas linhas.
- Para o Santa Cruz: A distância entre subir e ficar na Trave é de 2,5 pontos na mediana, e em 9 dos 16 casos foi de 3 pontos ou menos — perto o bastante para o acaso pesar no que se lê como característica. Por isso toda comparação de faixa deste estudo roda com e sem os times colados na linha, e o que só aparece num dos dois não vira critério de contratação. Quem usar a campanha rodada a rodada que esta parte entrega precisa saber que ela discorda da tabela oficial em 8 de 100 clube-temporadas, 5 delas nas quatro temporadas fechadas.
- n: 80 clube-temporadas fechadas (2022–2025), das quais 16 promovidos e 16 na Trave
- Prova: A01_clube_temporada.csv; A01.md, seção Prova


*Em aberto (A01):* 2018–2021 fica fora do recorte (decisão do dono, 17/09): não tem dado físico nem tabela oficial no app, e entra nas conclusões como conferência ao lado, pela coluna pos de dados/serieb_clube_temporada_2018_2021.csv. Faltam 5 jogos na base de 2022–2026, listados em A01_resumo.json: por causa deles a tabela remontada jogo a jogo termina em posição diferente da oficial em 8 de 100 clube-temporadas (2 em 2022, 3 em 2024 e 3 em 2026) — inclusive sobre quem esteve na Trave em 2024. A marca base_incompleta = 1 pega só 3 dessas 8 e ainda marca 10 clubes, dos quais 7 não mudam de posição, porque o jogo que falta desloca o vizinho e é o vizinho que fica sem marca. As conclusões leem a tabela oficial e não mudam; quem lê classificacao_rodada.csv precisa saber disso.


### A02 — Ataque ou defesa: onde está a distância para o meio, 2022 a 2025

*Pergunta:* A distância entre quem sobe e o meio está no que o time cria ou no que cede?


**A02-1 · Quem sobe finaliza de mais perto**  *[firme]*

- O que vimos: Quem sobe finaliza a 19,5 m do gol e o meio a 20,5 m, quase um metro mais perto. E quem já finalizava de perto nas 19 primeiras rodadas fez mais pontos nas 19 seguintes, mesmo contra quem pontuava igual. Em volume de chute, este estudo não conseguiria ver diferença.
- Para o Santa Cruz: É a única coisa que este estudo mostra separando quem sobe do meio E vindo antes do resultado, e por isso é a que deve guiar o modelo de jogo: chegar à finalização de dentro, em vez de perseguir número de chutes. Na montagem do elenco isso pede quem ataca a área — atacante que se movimenta nas costas da zaga, meia que chega na área, lateral que entra em vez de cruzar de longe —, e J05 tem de virar isso em requisito de posição, nunca em volume de finalização. Vale a ressalva: a medida vem antes dos pontos dentro da mesma temporada e com o mesmo elenco, e é a melhor prova que o estudo tem, não uma receita de acesso.
- n: 16 promovidos contra 48 do meio, e 8 contra 32 sem os times colados na linha; 80 clube-temporadas no teste de anterioridade
- Prova: A02_testes.csv; _porta_temporal.json, componentes; A02_numeros_novos.json; _metodo_fronteira.md; A02.md, seção Prova


**A02-2 · Quem sobe cede finalização pior, não finalização a menos**  *[provável]*

- O que vimos: Quem sobe sofre 11,6 finalizações por jogo e o meio 12,1: praticamente o mesmo. O que muda é o tamanho da chance cedida, 8,9 gols esperados a cada cem finalizações contra 9,8 do meio. Isso é critério de montagem, não promessa de acesso.
- Para o Santa Cruz: Proteger a área vale mais do que reduzir o número de chutes do adversário: o alvo é o tipo de finalização que se cede, não a quantidade, e isso é critério de montagem de zaga, laterais e volante de proteção. Mas o estudo não consegue mostrar que isso vem antes do resultado — o time que já está na frente cede chute pior —, e a régua que mede a qualidade da chance cedida repete só um terço de si mesma entre uma metade dos jogos e a outra; entra como critério de montagem, nunca como promessa de acesso. Sobre criar, o estudo não diz nada: a diferença de xG criado (1,28 contra 1,18 por jogo) é menor do que este número de times consegue enxergar, e aqui “não separa” significa “este desenho não conseguiria ver”.
- n: 16 promovidos contra 48 do meio, e 8 contra 32 sem os times colados na linha; 80 clube-temporadas no teste de anterioridade
- Prova: A02_testes.csv; _porta_temporal.json, componentes; A02_numeros_novos.json; _metodo_fronteira.md; A02.md, seção Prova


**A02-3 · A sobra de gol de quem sobe não se contrata**  *[provável · **negativa**]*

- O que vimos: Quem sobe converte melhor que o meio com os vinte times de cada ano. Sem os times de fronteira a vantagem fica menor, e lá até quem sobe fica abaixo do que as chances pediam. No goleiro não dá para ver diferença, nem que a sobra se repita de uma metade do ano à outra.
- Para o Santa Cruz: Não se contrata pontaria e não se aposta em ano de goleiro inspirado: essa sobra é o placar contado de outro jeito, e o método da casa proíbe usá-la como característica de quem sobe. O que se procura é o que produz a chance boa e o que reduz a chance cedida — finalizar de perto e proteger a área. Dois avisos: pode ser efeito do placar, e, como a régua é curta, ninguém pode usar este estudo para dizer que a sobra é pura sorte — ele só mostra que não dá para comprá-la.
- n: 16 promovidos contra 48 do meio, e 8 contra 32 sem os times colados na linha; 16 contra 16 no recorte de 5º a 8º (e 8 contra 7 sem os colados na linha); 80 clube-temporadas na comparação entre as duas metades do ano
- Prova: A02_testes.csv; A02_resumo.json, porta_temporal; _porta_temporal.md; A02_numeros_novos.json; A02.md, seção Prova


*Em aberto (A02):* Aplicada em 19/09 a proposta de destino v2 validada pelo dono: A02-1 sobe para firme (a única do estudo, pela conciliação com A05-1), A02-2 inverte a manchete e fica em provável, e A02-3 cai de firme para provável e vai para “Parece, mas não é”. Nenhuma conclusão caiu, nenhuma se fundiu, nenhuma nasceu. Fica em aberto, e não se resolve escrevendo melhor: Sobe x Trave (5º a 8º) continua sem resposta fora do placar redescrito — sem os times de fronteira sobram 8 contra 7 e o desenho só pegaria um abismo (d mínimo 1,57) —, e o recorte por estado do jogo não existe em base nenhuma (conferido nas 346 colunas de serieb_clube_temporada.csv e nas 119 de serieb_jogos.csv), o que só coleta resolve. Pendências fora deste arquivo: A02.md está desatualizado e hoje contradiz este JSON (precisa da tabela dos dois cortes lado a lado); e 36 dos valores de `numeros` estão gravados como string e chegam à tela com ponto decimal, que é uma linha em gerar_estudo_serieb_js.py, não correção de texto. O marcador trave_firmes foi apagado aqui, como a v2 propôs: era o único sem origem em saída de script e nenhum texto o usava. Dono do indicador: pela conciliação, o xG por finalização sofrida é do A02 e o A06 cede a cópia — é o mesmo teste bit a bit, não duas provas defensivas independentes.


### A03 — Casa e fora: onde se ganha e onde se perde, 2022 a 2025

*Pergunta:* Quem sobe se diferencia ganhando fora ou dominando em casa?


**A03-1 · Depender de casa não separa quem sobe de quem fica no meio**  *[indício · **negativa**]*

- O que vimos: A vantagem de jogar em casa é de 0,79 ponto por jogo, e quem sobe fica em 0,9 contra 0,79 do meio — sem os times colados na linha, 0,95 contra 0,82. A exceção é o 5º-8º, só no placar e num corte só. Nenhum dos 24 testes viu diferença, e nenhum tinha amostra para ver.
- Para o Santa Cruz: Não montar elenco atrás de 'time forte fora': a diferença de mando não separou as faixas, e este desenho também não garante que ela não exista — são coisas diferentes. O que dá para usar é o tamanho da vantagem de casa da liga, 0,79 ponto por jogo para qualquer time, no planejamento de calendário e de viagem. E a leitura de mando sai marcada: pode ser efeito do placar, porque quem joga fora passa mais tempo atrás.
- n: 80 clube-temporadas com todos os times (16 que subiram, 48 do meio — 16 deles na trave — e 16 que caíram); 52 sem os times colados na linha (8, 32 com 7 na trave, e 12)
- Prova: A03_testes.csv, família assimetria; A03_resumo.json, quadro_por_faixa; _metodo_fronteira.md


**A03-2 · Quem sobe ganha mais dividida nos dois mandos e só sofre menos em casa**  *[provável]*

- O que vimos: Em casa, quem sobe cede 0,8 de xG por jogo contra 1,02 do meio. Fora, a distância encolhe para 1,29 contra 1,36 e o teste só a enxerga no corte sem os times de fronteira, que o método da casa trata como enviesado.
- Para o Santa Cruz: A dividida defensiva ganha é exigência de time e de modelo de jogo, não requisito individual de contratação: é o único traço desta parte que aparece dentro e fora de casa, com e sem os times colados na linha. É o mesmo indicador do A06 aberto por mando, não uma segunda medição, e ceder pouco perigo só se sustenta em casa: trate isso como modelo de jogo. Não escreva que o traço é do jogador e não do ambiente — sem recorte por estado do jogo, esta parte não consegue separar as duas coisas.
- n: 16 promovidos contra 48 do meio, e 8 contra 32 sem os times colados na linha
- Prova: A03_testes.csv, família casa e fora na comparação SM; A03_resumo.json, quadro_por_faixa; _porta_temporal.md; _metodo_fronteira.md


**A03-3 · Quem cai cria menos em casa e sofre mais fora**  *[provável]*

- O que vimos: Em casa, quem cai cria 1,26 de xG por jogo contra 1,39 do meio, e longe de casa sofre mais. Quem cai é pior nos quatro números, então não são dois problemas separados por mando. Parte disso pode ser o placar: quem cai passa mais tempo atrás longe de casa.
- Para o Santa Cruz: É o retrato a não repetir: elenco que não cria dentro de casa e não protege a área longe dela. Não trate como dois problemas separados por mando — quem cai é pior nos quatro números, e os testes só isolaram onde a diferença cruzou a linha. Na montagem, o requisito é criar e proteger sempre; não existe 'reforço para jogo fora'.
- n: 16 do Cai contra 48 do Meio, e 12 contra 32 sem os times colados na linha
- Prova: A03_testes.csv, comparação CM; A03_resumo.json, quadro_por_faixa; _metodo_fronteira.md


*Em aberto (A03):* Falta o split-half de confiabilidade do xG sofrido em casa, que é a perna principal do A03-2: as duas medidas por mando que existem (xG criado em casa e xG sofrido fora) estão acima do piso, e esta nunca foi medida em separado — o cálculo é o mesmo já rodado para as outras duas. O A03.py não produz o quadro por faixa no corte sem a fronteira nem a média ao lado da mediana, e por isso a prova dos dois cortes ainda se apoia em recálculo de auditoria; o A03.md também precisa ser refeito, porque publica só tabelas do corte reduzido e brutos que o JSON já não tem. A conclusão da trave segue fora como conclusão: vale num corte só e é placar redescrito, então volta apenas como descrição no A03-1. E xG muda com o placar, que é diferente por mando: sem recorte por estado do jogo, parte do 'sofre mais fora' pode ser 'passa mais tempo perdendo fora'.


### A04 — Bola parada: quanto vale e para quem, 2022 a 2025

*Pergunta:* Quanto da produção vem de bola parada, e isso separa quem sobe?


**A04-1 · Nada do trabalho de bola parada separa quem sobe do meio**  *[indício · **negativa**]*

- O que vimos: Nenhum dos 8 sinais de trabalho separa quem sobe do meio, nos dois cortes. O que separa é gol: na temporada, quem sobe faz 5,5 gols de bola parada a mais do que sofre e o meio fecha zerado, mas gol é o placar de outro jeito, e sem os times colados na linha nem ele separa.
- Para o Santa Cruz: Treinar bola parada não é o caminho do acesso — e o estudo também não mostra que abandoná-la custe o acesso. Na montagem do elenco, altura e duelo aéreo de jogador de linha não entram como requisito de acesso; a exceção, dita aqui para as duas frases do estudo não se contradizerem, é o goleiro, onde o J03 achou na bola aérea disputada o maior efeito da tabela dele — e ainda assim como provável. O tamanho do fenômeno, que continua grande, está na conclusão descritiva ao lado: é volume de treino, não critério de contratação.
- n: 16 promovidos contra 48 do meio; sem os times colados na linha, 8 contra 32. A comparação com a trave (5º–8º) fica sem resposta nesta parte: são 16 contra 16 com todos os times e 8 contra 7 sem os colados na linha, um desenho que o próprio método da casa (resultados/_metodo_fronteira.md) declara enviesado entre faixas vizinhas.
- Prova: A04_testes.csv, comparacao SM e ST; A04_resumo.json, firme_nos_dois_cortes


**A04-2 · Um em cada três gols da Série B sai de bola parada**  *[indício]*

- O que vimos: Na liga, 34,02% dos gols de um time vêm de bola parada, cerca de 14 gols numa temporada inteira. Essa fatia é a mesma em todas as faixas, nos dois cortes — e só um vão enorme apareceria neste desenho. Entre clubes varia muito, de 16,3% a 60,7% dos gols do time.
- Para o Santa Cruz: É o número para dimensionar o trabalho de bola parada: um em cada três gols, cerca de 14 por temporada. O maior pedaço é o escanteio — 438 dos 1.091 gols de bola parada em quatro temporadas, contra 312 de pênalti e 294 de falta —, então é onde o tempo de treino rende mais; somados, porém, pênalti e falta pesam mais que o escanteio, e pênalti não se treina como bola parada. Não é o que separa quem sobe (ver a conclusão ao lado), mas é grande demais para tratar como detalhe.
- n: 80 clube-temporadas, todas de 38 jogos: 16 que sobem, 48 do meio (dos quais 16 são a trave) e 16 que caem
- Prova: A04_resumo.json, quadro_por_faixa; A04_testes.csv, indicador bp_pro_pct


**A04-3 · No trabalho de bola parada, só ganhar o duelo aéreo separa quem cai**  *[provável]*

- O que vimos: Quem cai ganha menos duelos aéreos do que o meio. No resto o trabalho é igual: cobra 5,0 escanteios por jogo contra 5,1 do meio e tira a mesma fatia de gols da bola parada. Faz menos gol de bola parada, mas perde gol de toda origem na mesma medida.
- Para o Santa Cruz: Treinar bola parada não aparece como proteção contra a queda: quem cai cobra os mesmos escanteios e tira a mesma fatia de gols dela que o meio. O que separa é ganhar a bola no alto — para um clube que precisa primeiro não cair, o duelo aéreo entra como requisito de elenco, e a altura média do elenco não entra junto, porque ela não separa quem cai do meio (1,809 m dos dois lados). O tamanho do requisito muda com o corte, de 1,8 ponto com todos os times a quase três pontos sem os colados na linha: é essa faixa que o clube tem de usar, e é o único indicador não-placar desta parte que separa quem desce.
- n: 16 rebaixados contra 48 do meio; sem os times colados na linha, 12 contra 32
- Prova: A04_testes.csv, comparacao CM; A04_resumo.json, firme_nos_dois_cortes


*Em aberto (A04):* O gol de bola parada não tem versão jogo a jogo nesta base (é agregada por trabalho: treinador + time + competição), então não passa pela porta temporal. Para o duelo aéreo ela É rodável e não rodou: dados/serieb_jogos.csv traz duelos aéreos ganhos por jogo, e esse é o caminho barato para o A04-3 virar firme — A04_indicadores.json prometeu esse teste e não cumpriu. O xG de bola parada existe só para 2025 e 2026 e ficou fora, e pênalti entra na conta como a base o classifica: pênalti sofrido é em boa parte consequência de defender sob pressão, não um traço de bola parada. O A04.md ainda traz o texto antigo e mistura os dois cortes de fronteira numa frase só; ele tem de ser regerado a partir deste arquivo antes de voltar a valer como prova, e por isso saiu do campo prova.


### A05 — Estilo com bola: existe um caminho, ou vários?

*Pergunta:* Existe estilo com bola que separa quem sobe, ou sobe-se com estilos opostos?


**A05-1 · Nenhum jeito de construir a jogada separa quem sobe do meio da tabela**  *[provável · **negativa**]*

- O que vimos: Dos 10 traços com bola medidos, nenhum separa quem sobe do meio com todos os times na conta. Ter a bola chega mais perto, 51,4% contra 49,8%, e só separa sem os times de fronteira. Quem tinha mais a bola no primeiro turno somou mais pontos no segundo.
- Para o Santa Cruz: Estilo com bola não é critério de contratação nem de escolha de treinador: nem passe curto, nem passe longo, nem ataques posicionais aparecem como marca de quem sobe. Ter a bola é o único que chega perto e vale como desempate, nunca como plano — só separa depois de tirar quem subiu raspando, e contra os times do 5º ao 8º não separa em corte nenhum. Cuidado com os dois lados: com 16 promovidos contra 48 do meio só uma diferença grande apareceria, então aqui “não separa” quer dizer “este desenho não conseguiria ver”; e posse e volume de passes mudam com o placar, que a base não permite separar.
- n: 16 promovidos contra 48 do meio (8 contra 32 sem os times a até 3 pontos da linha); a conta do primeiro turno usa os 80 clube-temporadas de 2022–2025
- Prova: A05_testes.csv, linhas do indicador posse em Sobe × Meio: com os times de fronteira d 0,521 e q 0,13363; sem eles d 0,689 e q 0,03748. As duas trocas de sinal entre os cortes estão contra a Trave, em ataques posicionais (d -0,496 e +0,291) e passes progressivos (d -0,284 e +0,145). _porta_temporal.json, conferencia_6_4. A05_numeros_novos.json


**A05-2 · Os 4 promovidos com menos da metade da bola subiram todos raspando**  *[indício]*

- O que vimos: 4 dos 16 promovidos ficaram com menos da metade da bola, a menor delas com 47,4%, e os quatro terminaram a 1 ponto ou menos do 5º colocado. Os 8 que subiram com folga tiveram todos mais da metade, de 50,1% a 61,6%. São 4 casos contados, não um teste.
- Para o Santa Cruz: Subir jogando sem a bola é possível, e o Santa Cruz não precisa copiar modelo de posse para buscar o acesso. Mas nos 4 casos em que isso aconteceu o acesso veio por 1 ponto ou menos: é o caminho apertado, não o caminho barato. Se o modelo for sem a bola, o que o time cede e o duelo (A02 e A06) têm de estar impecáveis, porque não sobra margem.
- n: 16 promovidos de 2022 a 2025: 4 com menos da metade da bola (todos a 1 ponto ou menos do 5º) e 8 que subiram com folga
- Prova: A05_resumo.json, promovidos e dispersao_por_faixa; A01_clube_temporada.csv, colunas de faixa e fronteira; A05_numeros_novos.json


*Em aberto (A05):* O achado que não coube em nenhuma conclusão: nos dez indicadores, todas as vinte linhas de Sobe × Meio apontam para o mesmo lado nos dois cortes — quem sobe sempre com o valor maior — sem que nenhuma passe no critério; pode ser um efeito real pequeno demais para este desenho enxergar, ou ruído, e a parte não tem como decidir. A ressalva pré-declarada do A05 diz que todos os indicadores passam do piso de confiabilidade de 0,40, e isso não é verdade: só cinco estão medidos, contra-ataques está em 0,36 e quatro nunca foram medidos (comprimento do passe, passes progressivos, passes no terço final, ataques posicionais) — o texto novo não se apoia mais em contra-ataques, mas a ressalva em si continua errada. Falta a camada de conferência: o A05.md não existe, justamente na parte em que havia um selo firme escondido no CSV. E como a A05-1 é negativa, ela não aparece no cartão de “O que decidimos”: onde mora a metade positiva — ter a bola vem antes do resultado — é decisão do dono. Continua valendo que posse e volume de passes mudam com o placar e que a base não permite o recorte por estado do jogo; só coleta resolveria. Agrupamento de times não foi refeito: a §7.1 já decidiu que não há grupos, e o CLAUDE.md proíbe reabrir.


### A06 — Sem bola: pressão ou qualidade do que se cede, 2022 a 2025

*Pergunta:* Quem sobe pressiona mais alto ou apenas cede menos finalização de qualidade?


**A06-1 · Quem sobe ganha mais a dividida no chão que o meio**  *[provável]*

- O que vimos: A vantagem é de cerca de uma dividida ganha a mais a cada cem disputadas. Sobre pressão alta o estudo não decide: passes por ação defensiva, recuperações e intensidade empatam com o meio. Pressão e intensidade mudam com o placar e com o valor do elenco, que o estudo não separa.
- Para o Santa Cruz: O time que sobe ganha mais a dividida no chão; se isso vem do jogador ou da organização, o A06 não decide — e medindo os dois lados no mesmo corte o número do time não se distingue do número do titular por posição do J03, então nem o contraste “separa o time, não o jogador” se sustenta. Na prática entra como exigência de modelo de jogo e de treino da disputa, e não como motivo para pagar caro num zagueiro que ganha duelo. Comprar sistema de pressão alta é o que este estudo menos sustenta: nem a favor, nem contra.
- n: 16 promovidos contra 48 do meio, com todos os times; 8 contra 32 sem os colados na linha
- Prova: A06_testes.csv; _porta_temporal.md; A06_numeros_novos.json


**A06-2 · Nada do jogo sem bola separa quem sobe da trave nos dois cortes**  *[indício · **negativa**]*

- O que vimos: A dividida no chão só separa as duas faixas quando se tiram os times colados na linha, e esse corte tira 9 dos 16 times da trave, justo os mais fortes. Sobram 8 contra 7, tamanho em que só diferença enorme apareceria. Com todos os times, o duelo aéreo separa, a favor da trave.
- Para o Santa Cruz: Não há, na base deste estudo, alvo de contratação nem de modelo de jogo que venha do degrau da trave: o que separa quem sobe de quem parou entre 5º e 8º troca de indicador e de direção conforme quais times entram na conta. Para a montagem vale o A06-1, que se sustenta com todos os times. E o único indicador que separa essas duas faixas nos dois cortes é a pontaria — gols acima do esperado —, que é o placar contado de outro jeito e nem se repete de uma metade da temporada para a outra: o degrau da trave se parece mais com acerto de acabamento do que com característica que se compre.
- n: 8 promovidos contra 7 da trave, sem os colados na linha; 16 contra 16 com todos os times
- Prova: A06_testes.csv; _metodo_fronteira.md; _porta_temporal.md


**A06-3 · A vantagem de quem sobe é sofrer chute pior, não sofrer menos chute**  *[provável]*

- O que vimos: Quem sobe sofre menos finalização por jogo, mas isso é a posse. O que fica é o tamanho da chance cedida, cerca de um gol esperado a menos a cada cem chutes sofridos. É o mesmo número do A02, e de régua curta: a diferença conta pela direção, não pelo tamanho.
- Para o Santa Cruz: A vantagem defensiva de quem sobe não é sofrer menos finalização: é sofrer finalização que vale menos. Na montagem, o alvo é reduzir o valor do chute cedido — organização da área e altura da linha — e não comprar volume de desarme. Por qual mecanismo isso acontece, o A06 não diz: não existe distância nem ângulo do chute sofrido em nenhuma coluna da base, e a conta divide pela posse do adversário, que muda conforme o placar.
- n: 16 promovidos contra 48 do meio, com todos os times; 8 contra 32 sem os colados na linha
- Prova: A06_testes.csv; _porta_temporal.md; A06_numeros_novos.json


*Em aberto (A06):* Recuperação por altura do campo não existe na base: há o total e a quebra por comprimento de passe, que é outra coisa. Sem ela, “pressiona mais alto” só tem resposta indireta, por PPDA e recuperações totais, e é por isso que essa metade da manchete do A06-1 não pode ser afirmada nem negada; só coleta resolve — vale abrir coleta de recuperações por terço do campo? Contra-ataque sofrido, ao contrário do que esta parte dizia, EXISTE: é a coluna do adversário no mesmo jogo e cobre os 80 clube-temporadas. O bruto já está calculado em A06_numeros_novos.json e a direção é instável entre os dois cortes, então rodá-lo dificilmente muda uma manchete; ainda assim é métrica da pergunta do CLAUDE.md e precisa ser declarado numa família em A06_indicadores.json e rodado por scripts/A06.py, que é quem dá o q e o selo. Não existe distância nem ângulo do chute sofrido em nenhuma coluna da base (só dist_remate, do próprio time), então o mecanismo do “chute pior” fica sem medição e o A06-3 para na descrição. O recorte por estado do jogo não existe em base alguma (o SkillCorner só guarda o período full_all), então a marca “pode ser efeito do placar” não tem como ser levantada sem coleta nova. Pendências de arquivo, fora do texto: para Recuperações não existe medida da porta temporal da §6.4 em arquivo nenhum (rodar scripts/_porta_temporal.py com “Recuperações” resolve); os marcadores porta_rec e porta_posse continuam sendo persistência entre metades da temporada, e não a porta da §6.4, e por isso nenhum texto os usa mais; faltam marcadores para cinco números que o texto novo usa e que são cópia de célula do A06_testes.csv (a mediana do duelo defensivo da trave com todos os times, os dois do duelo aéreo contra a trave no corte cheio e os dois do gol esperado por finalização sofrida sem os colados na linha) — enquanto eles não existirem, esses cinco ficam escritos no texto; o A06.md está desatualizado, publica um intervalo do duelo que não existe em arquivo nenhum e traz só a tabela do corte sem fronteira, precisando ser reescrito com as duas colunas de corte; e o xG por finalização sofrida tem dois q publicados (A02 e A06) para o mesmo teste, o que é decisão de dono por indicador.


### A07 — Físico: volume ou intensidade, com bola ou sem bola

*Pergunta:* Quem sobe corre mais no total ou corre mais forte?


**A07-1 · Correr mais não separou quem sobe do meio da tabela**  *[indício · **negativa**]*

- O que vimos: O time mediano de quem subiu percorreu 9.644 metros por jogo contra 9.598 do meio, e 669 em alta intensidade contra 652. Nenhum dos 12 indicadores físicos declarados separou quem sobe nos dois cortes. Não vimos diferença, e aqui só apareceria a partir de 4,7 posições de tabela.
- Para o Santa Cruz: Não há base aqui para contratar pensando em “time que corre mais sobe” — e também não há base para dizer que correr não importa, porque este estudo não teria como ver. Escolha o nível físico pelo modelo de jogo que o treinador vai pedir, não como atalho para o acesso. Para o físico virar critério de acesso seria preciso dado por jogo, que neste repositório só existe a partir de 2025.
- n: 16 que subiram contra 48 do meio (8 contra 32 sem os times de fronteira); contra a Trave, 16 contra 16 e 8 contra 7; 13 contra 36 quando saem os 20 clube-temporada com menos jogo rastreado. As 80 linhas são 40 clubes.
- Prova: A07_testes.csv, comparação SM e ST nos dois cortes de fronteira; A07_numeros_novos.json, tabela_d_rod_q_rod e rodada_sem_cobertura_baixa; A07_resumo.json, poder_por_desenho; A07_indicadores.json, ressalvas_declaradas


**A07-2 · Quem cai sprinta menos nos minutos sem a bola**  *[provável]*

- O que vimos: A cada trinta minutos sem a bola, o time mediano dos rebaixados correu 91,1 metros em sprint contra 100,0 do meio. Descontado o rodízio de elenco, é o único número físico que continua separando quem cai. Esta amostra não diz se o sprint falta só sem a bola.
- Para o Santa Cruz: Isto é sinal para medir no próprio time, não critério de contratação: a especificação (§5, armadilha a) já decidiu que correr sem a bola é a face física de pressionar alto — descreve o plano do treinador, não a qualidade do atleta, e não pode virar critério de compra. Se o elenco do Santa Cruz ficar na faixa dos 91,1 metros dos rebaixados, o assunto é o modelo de jogo e o tamanho do rodízio, não o mercado. E nada aqui autoriza dizer que sprintar mais evita a queda: o estudo só viu as duas coisas andando juntas na mesma temporada.
- n: 16 rebaixados contra 48 do meio (12 contra 32 sem os times de fronteira; 11 contra 36 quando saem os 20 clube-temporada com menos jogo rastreado).
- Prova: A07_testes.csv, comparação CM nos dois cortes de fronteira; A07_numeros_novos.json, tabela_d_rod_q_rod e rodada_sem_cobertura_baixa; A07_resumo.json, firme_nos_dois_cortes


*Em aberto (A07):* Falta virar arquivo, e não é escolha de método: as colunas d_rod/p_rod/q_rod em A07_testes.csv, a rodada sem os clube-temporada de cobertura baixa e os quatro ρ do rodízio em A07_resumo.json — todos já calculados e conferidos em A07_numeros_novos.json, que é a fonte dos números novos desta parte. Faltam também o A07.md (a prova em texto, que não existe e por isso saiu do campo prova) e o A07_numeros.json que a regra 1 do portão exige: enquanto ele não existir, nenhum marcador desta parte é conferível por máquina. Dois números continuam escritos à mão no texto por não haver marcador para eles: os 30 minutos sem a bola, que são a unidade do indicador, e os 38 jogos da temporada, com que se compara a média de cerca de 15 jogos por atleta que o rastreamento cobre. Decisão que sobe para o dono: copiar ou não o skillcorner.db do Portal Ranking, único caminho para o físico POR JOGO de 2022 a 2024 — sem ele a porta temporal da §6.4 não roda e nenhuma conclusão desta parte passa de provável. Separado disso, o recorte por estado do placar não existe em fonte nenhuma (o SkillCorner só guarda o jogo inteiro), então a ressalva do placar fica como texto, sem número.


### A08 — Quem sobe perde menos intensidade do 1º para o 2º tempo e no fim do jogo?

*Pergunta:* Quem sobe perde menos intensidade do 1º para o 2º tempo e no fim do jogo?


**A08-1 · Esta base não mede o que o time faz dentro do jogo**  *[indício · **negativa**]*

- O que vimos: As duas tabelas físicas têm 60 e 28 colunas, e 0 delas separam primeiro de segundo tempo. Na resposta crua do fornecedor são 31 medidas, todas do jogo inteiro. O único recorte que existe é com bola e sem bola, que é posse e não tempo.
- Para o Santa Cruz: Não dá para escolher jogador nem treinador por 'aguenta os 90 minutos' com o que o clube tem hoje — quem disser isso está usando olho, não dado, e o olho aqui é legítimo desde que não se apresente como número. O que o estudo sustenta sobre desgaste é outra escala: o A10 mede do turno para o returno e diz que a queda existe, é de menos de 1% do que o jogador corria, e é a mesma para quem sobe e para quem fica no meio. Se o clube quiser a resposta de dentro do jogo, ela se compra: é pergunta para o fornecedor de dado físico, com custo, e não trabalho de análise.
- n: 0 colunas de período em 60 + 28 das duas tabelas físicas, e 0 chaves de tempo em 31 da API, sobre 3.613 linhas de jogador-temporada
- Prova: resultados/A08_resumo.json e scripts/A08.py, contra dados_copiados/skillcorner_serieb.db


*Em aberto (A08):* A pergunta continua de pé; o que falta é dado. Resolveria uma coleta com recorte por período, se o fornecedor o vender — e isso é pergunta para ele, não para esta base. Ao contrário da A09, aqui não há atalho: a A09 foi salva porque o oGol publicava a soma por faixa de minuto de graça, e não existe equivalente para dado físico. Enquanto isso, a única leitura de desgaste que o estudo tem é a do A10, entre turno e returno, que é outra escala: ela fala de meses, esta falaria de minutos.


### A09 — Em que faixas de minutos cada faixa marca e sofre, e como reage ao placar?

*Pergunta:* Em que faixas de minutos cada faixa marca e sofre, e como reage ao placar?


**A09-1 · Quem sobe sofre metade dos gols do meio antes do intervalo**  *[provável]*

- O que vimos: Entre 30 e 45 minutos quem sobe sofre 0,08 gol por jogo contra 0,16 do meio, e ali também marca mais, 0,18 contra 0,13. Sem os times colados na linha do acesso a distância se mantém, 0,07 contra 0,16. É a única faixa em que quem sobe se separa dos dois lados.
- Para o Santa Cruz: O quarto de hora antes do intervalo é onde o jogo de quem sobe se decide, e é decisão de treino e de modelo, não de contratação: não dar o gol antes do intervalo vale tanto quanto fazê-lo. Vale como pergunta ao treinador em T04 — como ele fecha o primeiro tempo — e não como requisito de jogador em J05. Quem cai não se distingue nessa faixa (0,18 sofridos por jogo, perto do meio), então isto separa o topo, não o fundo.
- n: 16 promovidos contra 48 do meio em 80 clube-temporadas de 2022-2025 (8 contra 32 sem os times colados na linha)
- Prova: resultados/A09_testes.csv, família `sofre`, Sobe × Meio, nos dois cortes; dados/serieb_gols_por_minuto.csv; resultados/A09_resumo.json


**A09-2 · Quem cai sofre mais nos dois tempos, e não num momento só**  *[provável]*

- O que vimos: Quem cai sofre 0,63 gol por jogo no primeiro tempo contra 0,45 do meio, e 0,75 contra 0,55 no segundo. Marca menos no primeiro, 0,41 contra 0,49. Sem os times colados na linha a conta aumenta em vez de encolher, 0,67 contra 0,45.
- Para o Santa Cruz: Não existe ajuste de momento que salve quem cai: o problema é nível o jogo inteiro, e é por isso que o físico de fim de jogo não entra na régua de contratação (o A10 já dizia o mesmo pelo outro lado). O que se compra contra o rebaixamento é nível de elenco, não fôlego para os últimos quinze minutos. Uma ressalva que muda a leitura: quem cai também marca menos no segundo tempo, mas isso só aparece com os times colados na linha na conta e some sem eles — por isso a frase acima fala do primeiro tempo, e só dele.
- n: 16 rebaixados contra 48 do meio (12 contra 32 sem os times colados na linha)
- Prova: resultados/A09_testes.csv, família `tempo`, Cai × Meio, nos dois cortes


**A09-3 · Os acréscimos não separam ninguém, nem no fim nem antes do intervalo**  *[indício · **negativa**]*

- O que vimos: No acréscimo do 2º tempo quem sobe marca 0,12 gol por jogo contra 0,08 do meio, e não resiste — no do 1º também não. Entre 15 e 30 e entre 60 e 75 ele marca mais só com os times colados na linha na conta. Achado que existe num corte só não é achado.
- Para o Santa Cruz: Não vale montar elenco nem discurso para "decidir no fim": o acréscimo é onde a base tem menos gol e menos poder para enxergar diferença. Se o clube quiser vantagem no fim de jogo, o número que sustenta isso é o dos 75 aos 90 minutos do A09-1, não o do acréscimo.
- n: 16 promovidos contra 48 do meio; no corte reduzido são 8 contra 32, e o efeito mínimo detectável sobe junto
- Prova: resultados/A09_testes.csv, família `marca` e família `sofre`; resultados/A09_resumo.json


*Em aberto (A09):* A metade da pergunta que fala de PLACAR não roda: saber o aproveitamento de quem marca primeiro e de quem sofre primeiro exige o primeiro gol de CADA jogo, e a tabela agregada do oGol não traz evento nenhum — só a soma por faixa. O caminho está escrito no cabeçalho do coletar_serieb_gols_por_minuto.py: a página de cada jogo tem o minuto preso ao jogador que marcou e o lado sai da classe do bloco, cerca de 1.780 páginas no ritmo educado das outras coletas. Também não roda a porta temporal: o oGol publica a conta da temporada FECHADA, sem corte por rodada, então nenhuma conclusão desta parte pode passar de provável mesmo passando na correção — e nenhuma passa. E o cruzamento com a queda física do fim de jogo, que o CLAUDE.md pede, depende de A08, que não roda porque o SkillCorner guarda um período só.


### A10 — Físico ao longo da temporada: o returno de 2025 e o calendário curto nas duas temporadas medidas

*Pergunta:* Quem sobe sustenta a intensidade no returno e em sequências de jogos?


**A10-1 · Em 2025 quem subiu perdeu no returno os mesmos 100 metros que o meio**  *[indício · **negativa**]*

- O que vimos: Na média, do 1º para o 2º turno o mesmo jogador perde 74 metros por noventa minutos, 0,8% do que corria. A perda não separa quem subiu do meio. Sprint e alta intensidade chegam a separar com os times colados na linha do acesso na conta, e não separam sem eles.
- Para o Santa Cruz: Não vale montar elenco para “aguentar o returno”: a queda de fim de temporada existe, mas é de 0,8% do que o jogador corria e é a mesma para quem sobe e para quem fica no meio. O físico entra em J05 como exigência de nível, como o A07 já apontava, e não como reserva de fôlego. E a diferença de ponto de 2025 aparece no 2º turno (1,71 contra 1,34, e num corte só), não no 1º (1,58 contra 1,37, que não passa no critério) — quem responde a pergunta da trajetória é A13, não esta parte.
- n: 47 jogadores de quem subiu contra 135 do meio (4 clubes contra 12), só 2025
- Prova: A10.md, seção A prova; A10_testes.csv (2025, leitura principal, comparação SM, pilares fisico_*: as 96 linhas, e as 64 da leitura por setor); A10_resumo.json, o_que_cai_antes_de_perguntar_de_quem (medida delta_turno, distance_p90, faixas todos / Sobe / Meio, com o IC por clube e o p contra zero) e porta_temporal


**A10-2 · Semana de três jogos: os dois anos medidos dizem o contrário um do outro, e não dá para montar elenco por isso**  *[indício · **negativa**]*

- O que vimos: Em 2025, no jogo com menos de quatro dias de descanso o mesmo jogador correu igual ou um pouco mais (42 metros por 90 a mais, 8 metros de sprint, 0,19 km/h no pico, todos com o intervalo entre clubes encostando no zero) e o clube fez 1,10 ponto por jogo contra 1,37 nos jogos normais — 61 jogos curtos contra 697. Em 2026 a mesma conta inverte, e com mais força do que 2025 jamais teve: o mesmo jogador corre 174 metros por 90 a MENOS no jogo curto (1,8% do que corre), com intervalo de −290 a −52 metros que não encosta no zero, mais 51 metros de corrida e 1,93 metro por minuto a menos — e o ponto não cai (1,37 no curto contra 1,36 no normal, 75 jogos curtos contra 459, 217 jogadores em 18 clubes). A inversão não é falta de rastreamento: refazendo a conta sem os 7 clubes de cobertura baixa de 2026 ela continua (151 metros a menos, 149 jogadores), e 2026 tem quase o dobro de jogo curto que 2025 (15,9% dos jogos de quem lidera contra 8,6%).
- Para o Santa Cruz: Não dá para decidir nada de calendário com o que existe hoje: nas duas únicas temporadas medidas o jogo de três em três dias mudou de sinal nas duas contas, corrida e ponto. A m6 (logística e recuperação) continua valendo como cuidado de gestão, mas sem número atrás — não serve de argumento para comprar “motor”, nem para prometer que o time pontua igual em semana cheia. O que resolve é a temporada de 2026 fechada, que já está sendo rastreada; até lá isto é aviso, não conclusão.
- n: 20 clubes e 61 jogos curtos em 2025 (280 jogadores); 18 clubes e 75 jogos curtos em 2026 (217 jogadores) — uma temporada fechada e uma parcial
- Prova: A10_resumo.json, o_que_cai_antes_de_perguntar_de_quem.medido (2025 e 2026, medida delta_descanso, faixa todos: os oito indicadores físicos, com média, IC por clube e p contra zero) e placar.o_placar_muda_com_o_descanso.medido (ponto por jogo no curto e no normal, nas duas temporadas); A10_resumo.json, o_que_a_temporada_de_2026_pode_testar e confundidor_do_calendario; A10_indicadores.json, seção descanso


**A10-3 · Quem caiu em 2025 corria menos forte que o meio desde o 1º turno**  *[provável]*

- O que vimos: No 1º turno os rebaixados já correm 618 metros em alta intensidade por noventa minutos contra 690 do meio, e só dentro do próprio setor. Sem os times colados na linha a conta se inverte: o sprint separa e a alta intensidade não. Não é cansaço, é elenco.
- Para o Santa Cruz: Quem caiu usou 35,9 atletas por meia temporada contra 29,1 de quem subiu: o risco da temporada longa não é o elenco cansar, é o elenco não ter o nível e ainda virar outro no meio do ano — o que conversa com as premissas m2 e m3. Núcleo fixo e minutagem concentrada valem mais que reforço de meio de temporada. Na régua de contratação (J05), sprint e alta intensidade entram como corte de nível do elenco inteiro, e não como prova de resistência para o fim do campeonato.
- n: 71 jogadores de quem caiu contra 199 do meio no returno (4 clubes contra 12) e 83 contra 215 no 1º turno; só 2025
- Prova: A10_testes.csv, linhas 168 e 200 (2025, principal, jogador_jogo, CM, returno, sprint_count_p90, cortes com e sem fronteira) e 360 / 392 / 424 (o mesmo indicador nos recortes de placar D / E / V) — os cinco ponteiros antigos apontavam para psv99, duas linhas acima; A10_testes.csv na normalização posto_no_ano_x_setor (2025, CM, turno, hi_distance_p90, os dois cortes); A10_resumo.json, nos_dois_cortes e rodizio.atletas_distintos_por_meio


*Em aberto (A10):* Falta a segunda temporada FECHADA. No returno, com físico por jogo só em 2025, nada aqui é “quem sobe” — é “quem subiu em 2025”. No calendário é pior: 2025 e 2026 já dizem o contrário uma da outra, e só 2026 completa desempata (2022–2024 não tem physical_match na fonte). E o descanso de dois clubes (Amazonas e Cuiabá) é, na prática, descanso só de Série B: serieb_jogos.csv não tem nenhum jogo deles fora da competição em 2025 — os dois são Cai e Meio, nenhum é do Sobe.


### A11 — Físico e técnico: a intensidade vira ação e resultado?

*Pergunta:* A intensidade vira ação e resultado?


**A11-1 · Quem corre para dentro da área entra mais na área, não quem corre mais**  *[provável]*

- O que vimos: O terço que mais corre para dentro da área faz 23,4 entradas na área por jogo, contra 20,4, e cria 1,28 de xG contra 1,11. Já o terço que mais percorre metros faz 21,9 entradas contra 21,6, e cria o mesmo xG.
- Para o Santa Cruz: Conversa com o A02: lá, quem sobe finaliza de mais perto, com mais toques e mais entradas na área — mas toques e entradas na área só ficam firmes com os times de fronteira dentro, então cite sempre com essa ressalva. Aqui aparece a ação física que produz a entrada na área, e não é volume de corrida: é corrida para dentro da área. Em J05 o requisito físico do ataque é corrida para a área como peça do modelo de jogo, não como filtro de quem sobe — o A07 já mostrou que nenhum indicador de corrida separa quem sobe.
- n: 80 clube-temporadas (40 clubes, 2022–2025); 52 sem os times colados nas linhas e 60 só com cobertura física de 0,75 para cima, onde a relação fica mais forte
- Prova: A11_correlacoes.csv, família com_bola


**A11-2 · Correr sem a bola sobe a linha de pressão, mas não aparece nas recuperações**  *[provável]*

- O que vimos: O terço que mais corre sem a bola deixa o adversário dar 9,3 passes por ação defensiva, contra 11,2 do terço que menos corre. Em bola recuperada os dois empatam, 77,9 contra 77,6 por jogo — e com esta base o teste não enxergaria uma diferença pequena.
- Para o Santa Cruz: No modelo de jogo, pedir corrida sem a bola é pedir linha de pressão mais alta — não é pedir mais bola recuperada. E esta parte não autoriza dizer que o duelo recupera mais que a pressão: esse par nunca foi declarado nem rodado aqui, e quem o rodou por fora achou o contrário. Conversa com o A06, onde pressionar não separa quem sobe e ganhar o duelo separa — mas separar faixa e recuperar bola são duas perguntas diferentes.
- n: 80 clube-temporadas (40 clubes, 2022–2025); 52 sem os times colados nas linhas, onde a pressão fica igual ou mais forte e as recuperações seguem sem aparecer
- Prova: A11_correlacoes.csv, família sem_bola


**A11-3 · O físico não separa quem sobe nem entre times de nível técnico parecido**  *[indício · **negativa**]*

- O que vimos: Na faixa técnica alta, quem subiu percorreu 9.614 metros por jogo e quem ficou no meio, 9.620, e nenhuma das 10 comparações apareceu. O terço que mais sprinta somou 54,5 pontos contra 47,9, mas os dois puseram 5 times no G4 e o que menos sprinta teve 9 rebaixados contra 2.
- Para o Santa Cruz: O físico é um traço estável do clube que não anda com o acesso e anda com o não cair: serve para reconhecer um time — ele corre parecido todo ano — e como seguro contra o rebaixamento, que é o A07-2, não para prever quem sobe. Na montagem do elenco, correr é requisito de piso, não critério de desempate entre candidatos ao acesso. E ao citar a estabilidade, diga de onde ela vem: é medida da Protótipo ano a ano e a própria especificação a rebaixou a descrição, não critério, em 15/09 — não é a régua que o A06 usa com o mesmo nome.
- n: 49 das 80 clube-temporadas na estratificação: 4 promovidos contra 18 do meio na faixa técnica média e 12 contra 15 na alta, e a faixa técnica baixa não teve promovido nenhum em 2022–2025; sem os times colados nas linhas sobra a faixa alta, 7 contra 9. Os terços de sprint são 28 contra 28, dentro das mesmas 80 linhas (40 clubes).
- Prova: A11_estratificado.csv; A11_correlacoes.csv, família resultado


*Em aberto (A11):* Pendências que não são desta rodada. (1) Quatro números da segunda frase da A11-3 — os 5 promovidos de cada terço extremo de sprint, os 9 rebaixados contra 2 e os 54,5 contra 47,9 pontos — foram calculados na proposta de 19/09, da mesma base e com a mesma regra de terço dos demais, mas não existem em arquivo de resultado nenhum: seguem escritos à mão até o A11.py gravá-los. (2) O selo de firme de metros por minuto sem posse × xG sofrido tem de sair de A11_correlacoes.csv: ele é firme só com os times colados nas linhas e some sem eles. (3) A coluna ic95 do mesmo CSV é Fisher supondo 80 linhas independentes, quando são 40 clubes; os intervalos por reamostragem de clube estão prontos em A11_numeros_novos.json (ic_area_ent e ic_area_xg). (4) O mínimo detectável por correlação (0,31 para as 17 linhas) não está gravado em lugar nenhum. (5) Os quatro números de persistência são literais chumbados em A11.py:153 e saem em A11_resumo.json como se fossem calculados. (6) A A06-1 publica 0,571 e a A11-3 publica 0,129 para o PPDA porque são réguas de horizonte diferente, e nenhuma das duas partes diz de qual régua veio. (7) O A11_resumo.json publica n_meio = 0 na faixa técnica baixa por fallback do next(): o real é 15. (8) O A11.md que a seção Entrega exige continua não existindo, e o A11.py não roda os cortes sem fronteira e sem cobertura baixa, cujos resultados já estão calculados. E o que trava a parte inteira em provável: a porta temporal da §6.4 é impossível enquanto não houver físico por jogo de 2022 a 2024 (o physical_match do skillcorner_serieb.db só tem 2025 e 2026), e não há recorte por estado do jogo, então a ressalva do placar fica como texto, sem número.


### A12 — As réguas contínuas e o Cenário Barato

*Pergunta:* Em quais réguas os promovidos se concentram, e o Cenário Barato se sustenta?


**A12-1 · Das diferenças de quem sobe, só a qualidade da chance dá para treinar**  *[provável]*

- O que vimos: Quem sobe finaliza mais perto e faz o rival chutar pior, por medida pouco confiável. Seu elenco, 24,0 contra 13,9 milhões de euros, e o onze repetido não são escolha. Pressão, corrida e bola aérea não separam em corte nenhum, e ter a bola só separa sem os times colados na linha.
- Para o Santa Cruz: O que dá para comprar e treinar é a qualidade da chance: chegar à finalização de dentro e obrigar o adversário a finalizar de longe e mal. Dinheiro não se escolhe, e time repetido é consequência de ganhar — não contrate para isto. Contra os times que ficaram entre o 5º e o 8º nada disso separa: só o valor do elenco (24,0 milhões contra 14,4), e mesmo ele some quando se tiram os times colados na linha — subir, em vez de ficar na trave, não é questão de jeito de jogar.
- n: 16 promovidos contra 48 do meio, e 8 contra 32 sem os times colados na linha; na leitura de quem cai, 16 rebaixados contra 48, e 12 contra 32
- Prova: A12_reguas.csv; A12_resumo.json, firme_nos_dois_cortes; A12_numeros_novos.json; _porta_temporal.json; A02_testes.csv; A05_testes.csv; A07_testes.csv


**A12-2 · Quem jogou como os que subiram sem dinheiro caiu mais do que subiu**  *[indício · **negativa**]*

- O que vimos: Entre 2022 e 2025, 22 dos 80 times jogaram dentro da faixa do Cenário Barato, e o saldo foi 4 acessos contra 7 quedas. Dois dos que subiram assim eram dos elencos mais caros, então a faixa não é dos pobres. Só contando os sem dinheiro ela parece ajudar, 2 de 13 contra 4 de 48.
- Para o Santa Cruz: Copiar o jeito de jogar dos quatro que subiram sem dinheiro não aumenta a chance de subir — nesses quatro anos aumentou a de cair. Se o Santa Cruz montar o time assim, que seja escolha de projeto, sabendo que a faixa descreve mais de um quarto da liga e que os três números dela mudam com o placar: time que vai ganhando pressiona menos e joga mais direto. E a ideia de que isso seria um “perfil de trave” não tem teste por trás: nas nove réguas, subir e ficar entre o 5º e o 8º só se distingue pelo valor do elenco, e mesmo essa diferença some sem os times colados na linha.
- n: 22 times na faixa entre 2022 e 2025, 4 casos de origem, e os 20 times de 2026 na 27ª rodada de 38
- Prova: A12_cenario_barato.json, envelope; A12_teste_2026.json, baratos_no_perfil_2026; A12_resumo.json, cenario_barato; A12_numeros_novos.json


**A12-3 · A faixa publicada do time barato deixa de fora dois dos quatro casos**  *[indício · **negativa**]*

- O que vimos: A faixa publicada é pressão de 10,0 a 13,2, posse de 47% a 52% e bola longa de 10% a 14%. Cobrada ao pé da letra, o Vitória de 2023 e a Chapecoense de 2025 ficam de fora por centésimos. Dos quatro, só pressionar pouco é comum.
- Para o Santa Cruz: Não trate a faixa como alvo de montagem: ela é o menor e o maior de quatro times, sem folga nenhuma, e em número bruto de anos diferentes. O que se sustenta dos quatro é uma coisa só: todos pressionavam pouco, entre o 13º e o 20º da liga no ano deles. Posse e bola longa espalham pela tabela inteira e não servem de requisito para o elenco de 2027 — se a faixa for usada, que seja como lugar dentro da temporada, nunca como número bruto.
- n: 4 casos, de 2023 a 2025
- Prova: A12_cenario_barato.json, envelope; dados/serieb_clube_temporada.csv; A12_numeros_novos.json


*Em aberto (A12):* Aplicada em 19/09 a proposta de destino v2 validada pelo dono, com a remarcação: A12-1 é reescrita e cai de firme para provável, A12-2 inverte a manchete e A12-3 cai de firme para indício; as duas últimas passam a negativa = true e vão para “Parece, mas não é”. Nenhuma conclusão caiu, nenhuma se fundiu, nenhuma nasceu — a parte continua com três. Os 14 números que a A12-3 digitava à mão e os dez marcadores medidos que nenhuma frase lia foram ligados: agora são 76 valores em numeros, 55 lidos por alguma frase e 21 guardados sem frase que os leia (os doze percentis das réguas, que a Didática proíbe no texto, mais n_reguas, sm_lista, sm_n, separam, nao_separam, depende_do_corte, n26, g4_26 e baratos26). O que ficou escrito está em sem_marcador, item a item.

A ÚNICA REANÁLISE QUE FALTA, e que a v2 pede por escrito: rodar as réguas com e sem os clube-temporada de cobertura física baixa, como o CLAUDE.md manda. C_volume_fisico e D_explosao são só colunas fis_, a cobertura vai de 62% (Grêmio 2022, que é promovido) a 97%, e 20 dos 80 ficam abaixo de 75%. Sem ela, tanto o “não separa” físico quanto a linha nova sobre a explosão de quem cai valem num corte de cobertura só. Fica em aberto também a rodada com e sem os times de fronteira sobre o próprio Cenário Barato: três dos quatro casos de origem são times de fronteira.

PENDÊNCIAS FORA DESTE ARQUIVO, que esta tarefa não pode escrever. (1) scripts/A12.py não grava os dois arquivos citados como prova, A12_cenario_barato.json e A12_teste_2026.json — prova que nenhum script reproduz não é prova; e o A12_cenario_barato.json que está no disco ainda traz os valores velhos (subiram 6, cabem_fora_top8 14, taxa 27,3 e 28,6), que o texto novo já corrigiu para 4, 13, 18,2 e 15,4. (2) A chave “destes_quantos_subiram” aparece duas vezes no dict do A12.py e o segundo valor apaga o primeiro: foi esse bug que gerou os cinco números errados corrigidos em 19/09. (3) O A12.md não existe. (4) A tabela de testes desta parte se chama A12_reguas.csv, e não A12_testes.csv: o portão de nove regras procura o segundo nome e, sem ele, não consegue recalcular o teto de confiança (regra 2) nem conferir os dois cortes de fronteira (regra 3), embora os dois cortes estejam lá, nas 54 linhas do A12_reguas.csv. Renomear ou emitir o alias é decisão do fluxo principal.

Do que já estava aberto antes: ampliar o Cenário Barato dependia de 2018–2021, que saiu do recorte por decisão do dono em 17/09 (não tem dado físico nem tabela oficial no app) — com ele, a coleta de valor do Transfermarkt também precisaria cobrir aqueles anos, e hoje cobre 2022–2026. Agrupamento de times não foi refeito: a §7.1 já decidiu que não há grupos.


### A13 — Trajetória: quando o destino se decide

*Pergunta:* Quem cai já estava mal no 1º turno ou despencou no 2º?


**A13-1 · Quem cai já está 5,5 pontos atrás do meio na metade do campeonato**  *[indício]*

- O que vimos: No 1º turno, quem caiu fez 19,5 pontos de mediana contra 25 do meio, e 15 dos 16 ficaram abaixo da marca do meio. Um tombo no returno, se existe, este recorte não enxerga: 6 dos 16 fizeram mais pontos no 2º turno. E a melhora de quem subiu depende de quem entra na conta.
- Para o Santa Cruz: O déficit de quem cai já está montado na metade, então a correção é na janela do meio do ano — treinador ou reforço —, e não na espera de uma reação natural no returno. Mas a temporada não está perdida na rodada 19: em 4 temporadas, 6 times saíram do Z4 depois dela (4 no corte sem os times colados nas linhas).
- n: 80 clube-temporadas de 2022 a 2025 (52 sem os times colados nas linhas de corte); 16 rebaixados (12 no corte) e 48 do meio (32 no corte)
- Prova: A13_turnos.csv; A13_resumo.json, quadro_por_turno; A13_numeros_novos.json; A01_clube_temporada.csv


**A13-2 · Na metade já estão 10 dos 16 acessos, e o resto virou depois**  *[indício]*

- O que vimos: Na rodada 19, 10 dos 16 times que subiram já estavam no G4 e 10 dos 16 que caíram já estavam no Z4. O resto virou depois: 6 subiram vindo de fora, 6 escaparam do Z4 e 6 perderam o G4 que tinham. Isto mede onde o time estava, não o que veio depois.
- Para o Santa Cruz: A tabela da metade não é sentença nem garantia: em 4 temporadas, 6 times subiram vindo de fora do G4 e 6 perderam o lugar que já tinham — e os 12 terminaram a 3 pontos ou menos do 4º colocado. Isso põe a janela do meio do ano dentro do projeto desde o começo: dinheiro e vagas de elenco guardados para reforçar em julho, em vez de gastar tudo na montagem de janeiro.
- n: 80 clube-temporadas de 2022 a 2025 (52 sem os times colados nas linhas de corte); 16 acessos e 16 rebaixamentos
- Prova: A13_resumo.json, previsibilidade_por_rodada; A13_turnos.csv; A13_numeros_novos.json; A01_clube_temporada.csv


**A13-3 · A tabela da metade dá vantagem, não garante a vaga**  *[provável · **negativa**]*

- O que vimos: O terço que mais pontuou no 1º turno fez 31 pontos no returno e o de baixo fez 22. Mas eles se cruzam nos dois cortes: o Ituano de 2022, do terço de baixo, fez 37 e passou o melhor do terço de cima, 36. Essa vantagem é feita de pontos já somados na classificação final.
- Para o Santa Cruz: Vantagem na metade é banco de pontos, não vaga: dos 16 times que estavam no G4 na rodada 19, 6 terminaram fora dele — e todos os seis terminaram a 3 pontos ou menos do 4º colocado, por isso somem quando se tira quem acabou colado na linha. A segunda metade se monta como campanha própria — carga física, rodízio e reforço de julho —, e não administrando o que já foi feito.
- n: 80 clube-temporadas de 2022 a 2025 (52 sem os times colados nas linhas de corte); 27 no terço de cima e 28 no terço de baixo do 1º turno
- Prova: A13_resumo.json, previsores_do_1o_turno; A13_turnos.csv; A13_numeros_novos.json; A01_clube_temporada.csv


*Em aberto (A13):* A rodada N aqui é o N-ésimo jogo de cada time, não a rodada do calendário — com jogo adiado isso difere da tabela do dia. E os dez clube-temporadas com um jogo faltando na base (A01) entram na conta; a falta é de um jogo em algum ponto e não desloca a trajetória o bastante para mudar a leitura. Continua aberto o que é trabalho de script, e não dado que falte: A13_testes.csv não existe e scripts/A13.py não importa scripts/_metodo.py — por isso A13-1 e A13-2 param em indício e A13-3 só chega a provável, pela porta temporal —, o script não lê a coluna fronteira nem grava os dois cortes, e A13.md, a terceira camada de leitura, ainda não foi escrito.


### A14 — Síntese do Bloco A e teste em 2026

*Pergunta:* Quais indicadores mais separam quem sobe, e onde 2026 está nessa régua?


**A14-1 · A régua de 7 indicadores põe no alto quem subiu**  *[provável]*

- O que vimos: Dos 16 promovidos nas quatro temporadas fechadas, 11 ficaram entre os quatro primeiros da régua no seu ano. Das 7 peças, a de maior efeito é o valor do elenco, que não se escolhe. A trave, do 5º ao 8º, parece um degrau à parte, mas encosta no meio sem os times de fronteira.
- Para o Santa Cruz: 6 das 7 peças são decisão de modelo de jogo e de contratação: finalizar de perto, criar chance boa, ceder chance ruim, ganhar o duelo defensivo, sofrer pouco em casa e ganhar o duelo em casa. A mais sólida é chutar de perto — quem sobe finaliza de 19,5 m em média contra 20,5 m do meio, e é a única das 7 com prova de que vem antes do resultado, e não depois dele. A sétima é o valor do elenco, que não se escolhe e é a que mais puxa a régua para cima: use a lista como critério de contratação e de modelo de jogo, e não como aposta de acesso.
- n: 80 clube-temporadas: 16 que subiram, 48 do meio e 16 que caíram; sem os times colados na linha, 8 contra 32
- Prova: A14_resumo.json; A14_numeros_novos.json; A01_clube_temporada.csv; A02_testes.csv; A03_testes.csv; A06_testes.csv; A12_reguas.csv; _porta_temporal.md; _cruzar_19_09.md


**A14-2 · Um ano sozinho não tem times suficientes para dizer se a régua vale**  *[indício · **negativa**]*

- O que vimos: Ela pôs os quatro promovidos entre os seus quatro primeiros em um dos quatro anos, e dois ou três nos outros. Mas foi montada com esses mesmos quatro, nenhum ficou de fora, e justamente o ano dos quatro fica com um promovido só, sem teste, tirando os times de fronteira.
- Para o Santa Cruz: Não decida contratação pela posição do time na régua de um ano só: olhe as quatro temporadas juntas, porque o retrato de um ano muda conforme quem entra na conta. E não leia isto como “a régua não vale” — o que o ano isolado diz é que não há times suficientes para responder, e nada aqui testa se a régua prevê o acesso.
- n: 4 temporadas fechadas, 4 promovidos contra 12 do meio em cada; sem os times colados na linha, 2.022 fica 4 contra 9 e 2.025 fica 2 contra 8, e 2.023 e 2.024 ficam com 1 promovido, sem comparação
- Prova: A14_resumo.json, validacao_uma_temporada_de_fora; A14_numeros_novos.json; A01_clube_temporada.csv; _porta_temporal.md


**A14-3 · Em 2026 a régua troca a ordem no topo e erra times do G4**  *[indício]*

- O que vimos: Na rodada 27 ela põe no alto Novorizontino e Juventude, líderes da tabela, mas em ordem trocada. Mais abaixo erra feio: o Vila Nova é 3º em pontos e 12º nela, e a base está sem três jogos, um do próprio clube. Não dá para dizer se ela separa a dupla da ponta do resto do G6.
- Para o Santa Cruz: Use a régua como leitura de rodada — ela diz se o time está fazendo as coisas que quem sobe faz — e não como aposta de quem sobe: nas temporadas fechadas ela acertou a dupla da ponta 1 vez em quatro, e erra times do G4 inteiros. Para o Santa Cruz, o uso é cobrar do elenco os 7 itens da lista ao longo do ano, e não perseguir posição na régua.
- n: 20 times de 2026 na rodada 27, com 11 rodadas por jogar; nas temporadas fechadas, 8 times-temporada em 1º–2º contra 16 em 3º–6º — e, sem os times colados na linha, 6 contra 4
- Prova: A14_resumo.json, primeiro_segundo_contra_terceiro_sexto; A14_numeros_novos.json; A01_clube_temporada.csv


*Em aberto (A14):* O índice inclui H_dinheiro, o valor do elenco, que não se escolhe e é a peça de maior efeito: separar a parte escolhível da não escolhível exigiria residualizar pelo valor, e a decisão de 15/09 foi não descontar o dinheiro, só ressalvar. Continuam abertos, fora do alcance desta rodada: (1) resultados/A14.md não existe e A14_testes.csv também não, então o índice nunca entrou numa família de correção e a prova desta parte ainda aponta para o A14_resumo.json de 17/09, que é o do índice de oito componentes; (2) A14.py precisa de uma execução corrigida — prender candidatos() aos arquivos do Bloco A (hoje quebra com KeyError em J03_testes.csv e J08_testes.csv e com TypeError em A10_indicadores.json), tirar I_estabilidade_11, passar as três comparações pelos dois cortes de fronteira (o campo já é gravado e nunca é usado), emitir vn_reg em vez de contar à mão e regravar o A14_resumo.json; (3) a base de 2026 está sem três jogos, um deles do Vila Nova, que é o contraexemplo da A14-3. E duas das sete peças nascem de xG, cuja régua reproduz 30% de si mesma (_cruzar_19_09.md, achado 6).


### A15 — O que o time faz num jogo que rende ponto, 2022 a 2025

*Pergunta:* O que um time faz num jogo que aumenta a chance de pontuar?


**A15-1 · O time pontua cedendo chute pior, não cedendo menos chute**  *[provável]*

- O que vimos: O mesmo time, no jogo em que pontua, chuta 0,66 metro mais perto e empurra o chute do adversário 0,85 metro para trás. E não sofre menos finalização. Recuar com o placar a favor daria o contrário.
- Para o Santa Cruz: O eixo do modelo de jogo é a distância do chute, nos dois lados, e não o volume. Defender bem um jogo não é reduzir o número de finalizações do adversário — é empurrá-las para fora da área; o time que pontua sofre a mesma quantidade de chute, de mais longe. No ataque, a mesma régua: aproximar a finalização vale mais do que finalizar mais vezes. Isso vale para treino e para escolha de jogador (quem arrasta a jogada para dentro da área, quem protege a área em vez de bloquear chute de fora). O que esta parte NÃO autoriza é vender isso como causa: dentro de um jogo, o que o time faz e o ponto acontecem ao mesmo tempo.
- n: 3.036 clube-jogos de Série B de 2022 a 2025 — 40 clubes, 80 clube-temporadas, 1.518 jogos: 1.961 com ponto contra 1.075 sem. Sem os empates, 1.075 contra 1.075. O erro é reamostrado por clube, 10.000 vezes.
- Prova: A15_testes.csv; A15_resumo.json; A15_indicadores.json; A15.md


**A15-2 · No jogo em que pontua, o time tem menos bola**  *[provável]*

- O que vimos: O mesmo time fica com 6,18 pontos de posse a menos no jogo em que pontua, e dá 8,93 passes a menos ao terço final. Bate com os 4,68 ataques posicionais e o escanteio a menos. Correr atrás do placar infla tudo isso.
- Para o Santa Cruz: Não montar o time para ter a bola, e não ler 'teve menos bola' como jogo ruim: na Série B, o jogo em que o próprio time pontua é o jogo em que ele tem menos posse, menos passe ao terço final, menos ataque posicional e menos escanteio. A leitura honesta é que volume de ataque é, em boa parte, reação ao placar — quem está atrás ataca mais — e não receita. O uso prático é defensivo: tirar posse, passe ao terço final e escanteio da lista de metas de jogo e da ficha de contratação, porque subir esses números não é o mesmo que somar ponto. Isso não diz que ter a bola atrapalha; diz que ter a bola não é o que está pagando o ponto.
- n: 3.036 clube-jogos de Série B de 2022 a 2025 — 40 clubes, 80 clube-temporadas: 1.961 com ponto contra 1.075 sem; sem os empates, 1.075 contra 1.075. Cada indicador entra centrado no próprio clube, naquela temporada e naquele mando.
- Prova: A15_testes.csv; A15_resumo.json; A15.md


**A15-3 · Descer ao jogo mede melhor e não prova mais**  *[indício]*

- O que vimos: As 3.036 linhas são os mesmos 40 clubes. Trocar o teste que conta linha pelo que conta clube move 18 indicadores para 19, quase nada. O que morre de vez é o 'antes': num jogo, o que o time faz e o ponto acontecem juntos.
- Para o Santa Cruz: Vale descer ao jogo, mas pelo motivo certo. O ganho é de precisão: comparar o time com ele mesmo em 38 jogos mede muito melhor do que um número por temporada, e foi isso que deixou esta parte separar o que o time FAZ do que o time É. O ganho que não existe é de prova: o número de provas independentes continua sendo o de clubes, e o critério mais duro da casa, o de vir antes do resultado, deixa de ser calculável — nenhuma conclusão de jogo pode passar de provável. Na prática: usar o nível do jogo para afinar o modelo de jogo e a ficha de contratação, e continuar decidindo acesso pela temporada. E não encomendar mais coleta de jogo esperando que ela transforme indício em certeza.
- n: 21 indicadores em 5 famílias, sobre 3.036 clube-jogos de 40 clubes; 10.000 reamostragens de clube em cada célula.
- Prova: A15_resumo.json; A15_testes.csv; _metodo_jogo.py


*Em aberto (A15):* A tensão da dividida no chão FOI RESOLVIDA em 21/09, pelo A18: num jogo, a fração de divididas ganhas é medida relacional — ela soma cem com a do adversário, e quem o time enfrentou explica mais da variação do que quem o time é. Na temporada, a média sobre trinta e oito adversários cancela isso e o que sobra é o traço do time, que é o que o A06-1 mede. As duas leituras valem, para decisões diferentes. Continua em aberto o ESTADO DO JOGO: sem minuto do gol não dá para separar o que o time escolheu fazer do que ele fez porque estava ganhando. É a mesma coleta que a A09 deixou pendente — o primeiro gol de cada jogo — e agora com quatro partes pedindo por ela. Continua sem resposta, e com preço: é a compra que mais renderia ao estudo.


### A16 — Ponto por real: o que sobra depois do dinheiro, 2022 a 2025

*Pergunta:* Dentro do que o dinheiro compra, qual traço dá mais ponto por real?


**A16-1 · A dinheiro igual, o jeito de jogar rende mais que o elenco**  *[provável]*

- O que vimos: Subir do quarto de baixo para o quarto de cima da liga em solidez vale +8,9 pontos. O mesmo salto no valor do elenco vale 7,0 e custa 9,9 mi de euro. Jogar assim equivale a 12,6 mi de elenco.
- Para o Santa Cruz: Este é o número para levar a reunião de orçamento. Com o dinheiro controlado, os traços do modelo continuam de pé, e o salto de um quarto de tabela em solidez ou em qualidade da chance paga mais ponto do que o mesmo salto na folha. Traduzido: o que se compra com treinador, treino e modelo de jogo vale, nesta liga, dezenas de milhões de elenco — e o clube que não vai ter folha de top-5 tem aí onde competir. Duas travas. A primeira: isto NÃO diz que jogar assim é de graça; custa treinador, treino e jogador, e nada disso está medido. A segunda: o A12-2 já mediu que quem jogou como os que subiram SEM dinheiro caiu mais do que subiu — a receita existe, mas quem a tentou com elenco barato saiu pior, e é isso que separa este achado de uma promessa.
- n: 80 clube-temporadas de 2022 a 2025 (40 clubes); sem os times colados na linha, 52. 8 traços em 3 famílias, herdados da lista do A14.
- Prova: A16_testes.csv; A16_resumo.json; A16_indicadores.json; A16.md


**A16-2 · Com o dinheiro na conta, nenhum traço prova vir antes do ponto**  *[indício]*

- O que vimos: A distância do chute do 1º turno previa os pontos do returno com +0,289. Pondo o dinheiro no mesmo desconto, cai para +0,198 e deixa de valer. Dos 8 traços, 2 passavam e 0 passam agora.
- Para o Santa Cruz: É o freio do A16-1, e tem de andar colado nele. O que o estudo chamava de traço que vem antes do resultado carregava dinheiro dentro: quando o elenco caro entra no mesmo desconto, a anterioridade some. Na prática isso não derruba o modelo de jogo — a associação a dinheiro igual continua de pé —, mas derruba a frase “jogue assim e os pontos vêm depois”. O que se pode prometer à diretoria é que times que jogam assim pontuam mais com o mesmo elenco; o que NÃO se pode prometer é que mudar o jeito de jogar no meio do ano traga os pontos do returno. Para decidir contratação e treinador isso basta; para decidir troca de treinador no meio da temporada, não basta.
- n: 80 clube-temporadas de 2022 a 2025, com o traço medido só nas 19 primeiras rodadas e os pontos somados das 19 últimas.
- Prova: A16_testes.csv; A16_resumo.json; _porta_temporal.json; A16.md


**A16-3 · A dividida no chão só paga ponto fora de casa**  *[provável]*

- O que vimos: Ganhar mais dividida no chão FORA vale +4,9 pontos a dinheiro igual. Em casa, +0,2, e some na correção. A conta do total, somando os dois mandos, dá +3,6 e esconde essa diferença.
- Para o Santa Cruz: Se a dividida no chão entrar na ficha de contratação, ela entra como exigência para o jogo FORA de casa — é lá que ela paga. Em casa o estudo não acha efeito nenhum depois do dinheiro, nos dois cortes. Isso muda o que se procura: não o zagueiro que ganha duelo em qualquer cenário, mas o time que sustenta a disputa quando joga sem o campo a favor. Vale como critério de modelo de jogo para o jogo fora e como desempate na contratação — o eixo principal continua sendo a qualidade da chance, que rende o dobro.
- n: 80 clube-temporadas de 2022 a 2025 (40 clubes); sem os times colados na linha, 52.
- Prova: A16_testes.csv; A16_indicadores.json; A16.md


*Em aberto (A16):* Duas. (1) O preço do traço. Esta parte mede o que o traço RENDE e não o que ele CUSTA: treinador, treino e jogador que sustentam a solidez têm preço, e sem ele a comparação com o elenco é de um lado só. A folha salarial por clube-temporada resolveria, e não está na base. (2) O instantâneo do Transfermarkt. O valor não tem data conhecida, então não dá para saber se ele foi medido antes ou depois do resultado — e é disso que depende a leitura da A16-2. Um valor por rodada, ou ao menos por turno, é a coleta que mais renderia a esta pergunta.


### A17 — Que jeito de jogar produz a chance boa, 2022 a 2025

*Pergunta:* Que jeito de jogar produz a chance boa: finalizar de perto e ceder chance ruim?


**A17-1 · Nenhum jeito de jogar medido produz a chance boa**  *[indício]*

- O que vimos: De 34 pares testados, 1 sobrevive aos dois cortes e 1 vem antes da chance boa — e não é o mesmo. Nenhum dos 17 jeitos de jogar cumpre os dois critérios.
- Para o Santa Cruz: A D13 diz o que o time tem de ENTREGAR e quanto isso paga. Esta parte foi procurar a alavanca que entrega, entre os 17 jeitos de jogar que a base mede — posse, passe longo, passe progressivo, ataque posicional, contra-ataque, cruzamento, pressão alta, recuperação, intensidade, dividida e bola parada — e não achou. Na prática: não dê ao treinador uma meta de estilo (“cruze mais”, “tenha mais a bola”, “pressione mais alto”) esperando que dali saia finalização de perto. O eixo não é escolha de estilo isolada; é o conjunto, e é por isso que ele se compra em treinador e treino, como a A16-1 mediu em ponto e em euro. O que esta parte NÃO diz é que a alavanca não existe — diz que ela não está entre estas 17.
- n: 80 clube-temporadas de 2022 a 2025 (40 clubes); sem os times colados na linha, 52. 17 preditores em 4 famílias contra 2 alvos. A leitura de jogo usa as 3.036 linhas clube-jogo.
- Prova: A17_testes.csv; A17_jogo.csv; A17_resumo.json; A17_indicadores.json; A17.md


**A17-2 · A dividida pelo alto anda com finalizar de perto, e some dentro do time**  *[provável]*

- O que vimos: Entre times, quem ganha mais dividida pelo alto finaliza de mais perto: +0,38, e +0,43 sem os colados na linha. Dentro do próprio time, jogo a jogo, sobra +0,06.
- Para o Santa Cruz: É o único candidato a alavanca que a parte achou, e ele não serve como meta de jogo. A diferença entre os dois números diz o porquê: entre times a relação é forte, dentro do mesmo time ela quase não existe — ou seja, times que ganham a bola alta também finalizam de perto, mas o time que ganhou mais bola alta NAQUELE jogo não finalizou de mais perto. Isso é perfil de elenco, não instrução de treino. Onde ele cabe: como característica a procurar no elenco, junto com o que o A06-1 já dizia da dividida no chão — e não como ordem para cruzar mais ou disputar mais bola alta.
- n: 80 clube-temporadas de 2022 a 2025; 52 sem os times colados na linha. A leitura de jogo usa 3.036 linhas clube-jogo, centradas no próprio clube e no mesmo mando.
- Prova: A17_testes.csv; A17_jogo.csv; A17.md


**A17-3 · O que parece receita entre times some dentro do time**  *[indício]*

- O que vimos: Entre times, cruzar mais anda com finalizar de perto: +0,33. Dentro do próprio time, jogo a jogo, +0,02. E cruzar anda +0,26 com o valor do elenco.
- Para o Santa Cruz: É a armadilha que esta parte existe para evitar, e ela vale para qualquer número de estilo que alguém traga numa reunião. Entre times, cruzar mais parece produzir finalização de perto; dentro do mesmo time, jogo a jogo, não produz nada — e a relação de fora anda junto com o dinheiro, ou seja, é em boa parte “times melhores fazem as duas coisas”. Regra prática para ler qualquer proposta de modelo de jogo: peça a conta DENTRO do time antes de aceitar a conta entre times. Se o número só existe comparando clubes diferentes, ele descreve que clube é aquele, não o que o seu pode fazer na segunda-feira.
- n: 80 clube-temporadas contra 3.036 clube-jogos, os mesmos 40 clubes.
- Prova: A17_testes.csv; A17_jogo.csv; A17_resumo.json; A17.md


*Em aberto (A17):* Duas. (1) A lista pode ser curta. São 17 os preditores que esta base mede por clube-temporada e por jogo; treino, comissão técnica, escalação por rodada e bola parada ensaiada não estão nela, e é ali que um treinador diria que a alavanca mora. (2) O contraste entre a conta da temporada e a do jogo pede um terceiro nível — o mesmo TREINADOR em clubes diferentes —, que o T03 tentou e a base não sustentou. Enquanto isso não existir, “o eixo se compra no treinador” fica sendo a leitura mais bem sustentada e não uma medida.


### A18 — A dividida no chão: o que ela mede no ano e o que mede no jogo, 2022 a 2025

*Pergunta:* A dividida no chão mede o time ou o adversário?


**A18-1 · No jogo a dividida mede o adversário; no ano, mede o time**  *[provável]*

- O que vimos: A dividida ganha pelo time e a perdida pelo adversário somam 100,0 no mesmo lance: é a mesma medida, contada dos dois lados. De um jogo para o outro, quem o time enfrentou explica 7,0% da variação e quem o time é explica 6,6%.
- Para o Santa Cruz: A tensão entre o A06-1 e a leitura de jogo do A15 se desfaz, e as duas ficam de pé — porque medem coisas diferentes. Num jogo, a fração de divididas ganhas é uma medida RELACIONAL: ela soma cem com a do adversário, e o que mais explica a variação de um jogo para o outro é quem estava do outro lado, não quem é o time. Na temporada, a média sobre trinta e oito adversários faz o adversário se cancelar, e o que sobra é o traço do time — que é o que o A06-1 mediu. Na prática: a dividida VOLTA a poder ser requisito de elenco e de contratação, medida na temporada; e NÃO serve como meta de jogo nem para julgar o desempenho de um jogo isolado. Quem disser “ganhamos pouca dividida sábado” está falando mais do adversário de sábado do que do time.
- n: 3.036 clube-jogos de Série B de 2022 a 2025, 40 clubes e 80 clube-temporadas, cada linha com a linha do adversário no mesmo jogo ao lado.
- Prova: A18_testes.csv; A18_resumo.json; A18_indicadores.json; A18.md


**A18-2 · No jogo que rende ponto o time disputa mais divididas**  *[provável]*

- O que vimos: Dentro do próprio time, o jogo em que ele pontua é o jogo em que DISPUTA mais dividida, +0,35 — efeito bem maior que o da fração ganha, -0,08. Pôr o adversário no centro não muda: -0,08.
- Para o Santa Cruz: O sinal negativo que assustava era pequeno e estava sozinho. Ao lado dele, o mesmo jogo traz um efeito muito maior no NÚMERO de divididas defensivas disputadas. Junto com o A15-1 — o time que pontua sofre a mesma quantidade de finalização, de mais longe — o retrato fecha: no jogo que rende ponto o time defende MAIS vezes, empurra a finalização para fora e ganha uma fração de dividida praticamente igual. Isso é administrar resultado, não perder a disputa. Para o modelo de jogo, a leitura é: não tratar “disputou muita dividida” como sinal de jogo ruim, e não pedir ao time que reduza o número de disputas.
- n: 3.036 clube-jogos de 2022 a 2025, 40 clubes, com o indicador centrado no próprio clube-temporada e no mesmo mando, e depois também na média do adversário.
- Prova: A18_testes.csv; A18_resumo.json; A18.md


**A18-3 · Ganhar dividida no chão não se compra com folha**  *[indício]*

- O que vimos: Na temporada, ganhar dividida no chão anda +0,11 com o valor do elenco, sobre 80 clube-temporadas — perto de zero. A pressão alta, para comparar, anda junto com elenco caro.
- Para o Santa Cruz: É a melhor notícia desta parte para um clube sem folha de top-5. O traço que o A06-1 aponta como o que mais separa quem sobe NÃO vem com o elenco caro — ao contrário da pressão alta, que o A06 mediu andando junto com o dinheiro. Isso fecha com a A16, que mediu quanto a dividida paga a dinheiro igual: o salto de um quarto de tabela vale pontos, e fora de casa vale mais. Traduzido: é um traço comprável por scouting e treino, não por folha — e por isso ele volta à ficha de contratação, medido na TEMPORADA, como o A18-1 estabelece.
- n: 80 clube-temporadas de 2022 a 2025, com valor de elenco do Transfermarkt.
- Prova: A18_resumo.json; A06.json; A16_testes.csv; A18.md


*Em aberto (A18):* Duas. (1) O estado do jogo. A explicação mais simples do A18-2 é o placar — quem está à frente recua e defende mais vezes —, e sem o minuto do gol não dá para separar isso do que o time escolheu fazer. É a mesma coleta que a A09, a A15 e a A17 já pediram. (2) Quem eram os defensores. A base NÃO tem escalação por jogo: serieb_jogos.csv não traz nome de jogador nenhum, só o sistema tático. Dá para saber quem eram os zagueiros do ano, não os do jogo — então ligar a dividida de um jogo aos jogadores que estavam em campo não roda com esta base.


### A19 — A formação do time muda o resultado do jogo, 2022 a 2025

*Pergunta:* A formação do time muda o resultado do jogo?


**A19-1 · Nenhuma formação muda o resultado do jogo**  *[indício]*

- O que vimos: Das 6 formações testadas, 0 separam o resultado entre times e 0 dentro do próprio clube, nos dois cortes. Em 2.638 jogos de 40 clubes, o desenho do time não aparece no placar.
- Para o Santa Cruz: Não escolher treinador pelo desenho que ele usa, e não tratar a mudança de sistema como decisão de peso. A pergunta mais comum de vestiário e de diretoria tem, nesta base, resposta seca: dos seis desenhos mais usados da Série B, nenhum rende mais ponto que os outros — nem comparando times, nem comparando o mesmo time consigo mesmo no mesmo mando. Isso fecha com o T03-2, que mediu que trocar de treinador não muda o jeito de jogar do time, e com a A17, que não achou jeito de jogar que produza a chance boa. O que decide continua sendo o que o D13 lista, e nenhum daqueles quatro itens é um desenho tático.
- n: 2.638 clube-jogos de Série B de 2022 a 2025 nas 6 formações com 150 jogos ou mais (40 clubes, 80 clube-temporadas). Ficaram fora 398 jogos em 11 formações, por número de jogos.
- Prova: A19_testes.csv; A19_resumo.json; A19_indicadores.json; A19.md


**A19-2 · O corte que parecia mais limpo é o que escolhe pelo resultado**  *[indício]*

- O que vimos: Quando o time ficou no mesmo desenho o jogo inteiro rendeu 1,39 ponto por jogo; quando trocou, 1,34. No desenho de cinco defensores a diferença é 1,75 contra 0,86 — quem troca é quem está perdendo.
- Para o Santa Cruz: É um aviso de leitura que vale muito além desta parte, e vale para qualquer número que alguém traga filtrado. Filtrar “só os jogos em que o time manteve o plano” parece limpar o dado e na verdade seleciona pelo desfecho: o time só mexe quando precisa mexer, e precisar mexer é estar perdendo. Qualquer sistema fica ótimo nesse filtro. Regra prática: antes de aceitar um recorte, pergunte se o que define o recorte poderia ter sido causado pelo resultado. Se puder, o recorte não limpa — ele escolhe.
- n: 1.531 jogos em que o time ficou o tempo todo numa formação e 1.107 em que trocou, dentro dos 2.638 clube-jogos da parte.
- Prova: A19_resumo.json; A19_testes.csv; A19.md


**A19-3 · O time da Série B não tem um sistema**  *[indício]*

- O que vimos: O clube usa a mediana de 4 formações diferentes na temporada, de 3 a 6, e a mais usada cobre 50,0% dos jogos. Isso contando só as 6 mais comuns; com as outras 11, sobe.
- Para o Santa Cruz: Contratar “o treinador do 4-3-3” é comprar uma coisa que quase não existe: na Série B o time muda de desenho o tempo todo, e o mais usado não chega a cobrir dois terços dos jogos. Isso ajuda a entender por que o A19-1 não acha diferença — não há times de um sistema para comparar — e casa com o T03-1, que mediu que o perfil de jogo não acompanha o treinador na troca de clube. Na entrevista com um candidato, a pergunta útil não é qual é o sistema dele, e sim o que ele faz das quatro coisas do D13.
- n: 80 clube-temporadas de 2022 a 2025, 40 clubes, 2.638 clube-jogos.
- Prova: A19_resumo.json; A19_testes.csv; A19.md


*Em aberto (A19):* Duas, e as duas são a mesma coleta que quatro partes já pediram. (1) A formação do ADVERSÁRIO não entra como controle, e o A18 mediu que num jogo o adversário explica mais da variação do que o próprio time — é o primeiro acréscimo se a parte voltar, e roda com a base que já existe. (2) O minuto do gol: sem ele não dá para saber se a formação veio antes ou depois do primeiro gol, e é disso que depende toda a leitura. Enquanto não houver, o A19-2 é o teto do que esta pergunta consegue responder.


### A20 — A forma do elenco: o onze médio, o melhor e a distância entre eles, 2022 a 2025

*Pergunta:* O que separa é o titular médio ou ter um ou dois muito acima?


**A20-1 · O onze médio é o que menos separa; a desigualdade é o que mais**  *[indício]*

- O que vimos: Na corrida, o onze médio de quem sobe está no percentil 43,2 e o do meio no 44,8 — igual. O melhor deles está em 89,4 contra 82,7, e o último em 4,6 contra 7,6.
- Para o Santa Cruz: Muda o que se olha ao montar elenco. Comparar o titular médio — que é o que o estudo vinha fazendo em seis partes — é comparar justamente a medida que menos separa: os onzes de quem sobe e do meio estão no mesmo lugar da régua de corrida. A diferença, tal como aparece, está nas PONTAS, e nas duas: o elenco de quem sobe tem alguém mais acima E alguém mais abaixo. Lido em português de vestiário, isso é especialização — um motor e alguém que não corre, mas faz outra coisa —, e não um elenco de onze atletas parecidos. A ressalva é dura e vem logo abaixo, no A20-2: isso não passa na régua da casa. Serve para mudar a PERGUNTA que se faz do dado físico, não para virar critério de contratação hoje.
- n: 80 clube-temporadas de 2022 a 2025 (40 clubes): 16 que subiram, 48 do meio e 16 que caíram, sobre 2.458 jogadores com físico. O onze é fixo em 11 por clube-temporada.
- Prova: A20_testes.csv; A20_resumo.json; A20_indicadores.json; A20.md


**A20-2 · A desigualdade passa no corte cheio, e o reduzido não tem tamanho**  *[indício]*

- O que vimos: A distância entre o melhor e o último do onze na corrida dá +0,80 com todos os times e +0,81 sem os colados na linha — o mesmo efeito. O que muda é o que o corte menor consegue ver: de 0,82 para 1,14.
- Para o Santa Cruz: Este é o achado mais promissor do bloco físico, e ele ainda não é critério. A diferença entre ele e os outros que falharam está no MOTIVO da falha: aqui o efeito não muda entre os cortes, só a capacidade de enxergá-lo. Um efeito desse tamanho não tinha como passar no corte reduzido, porque ali o desenho só vê a partir de um valor maior que ele. Isso não o promove — a regra da casa é firme nos dois cortes, e ela fica —, mas diz o que fazer: é a primeira coisa a rodar quando houver mais temporadas rastreadas, e não uma pista morta. Enquanto isso, entra como pergunta na avaliação de elenco, não como piso.
- n: 80 clube-temporadas: 16 que subiram contra 48 do meio; sem os times colados na linha, o desenho só enxerga a partir de 1,14.
- Prova: A20_testes.csv; A20_resumo.json; A20.md


**A20-3 · Ter o jogador mais rápido do campeonato não separa quem sobe**  *[indício]*

- O que vimos: O mais rápido do onze de quem sobe está no percentil 96,4 e o do meio no 92,5: efeito +0,57, que não passa na correção. Em velocidade, quem sobe está um pouco à frente nas três pontas.
- Para o Santa Cruz: Não pagar prêmio por ter o homem mais rápido. A velocidade de pico é a medida física mais vendida no mercado e a mais fácil de checar, e ela não distingue quem subiu — nem no melhor do elenco, nem no onze médio, nem no mais lento. O padrão dela é diferente do da corrida: em velocidade quem sobe está levemente à frente nas TRÊS pontas, o que é retrato de elenco um pouco melhor, não de elenco com forma diferente. Some isso ao J05-2, que já tinha medido que metade do perfil físico usado pelo app não sobrevive à correção, e ao J04-1: velocidade é descrição, não requisito.
- n: 80 clube-temporadas, 16 que subiram contra 48 do meio, onze fixo por clube.
- Prova: A20_testes.csv; A20_resumo.json; A20.md


*Em aberto (A20):* Duas, e a primeira é a mais importante do bloco físico inteiro. (1) A desigualdade do elenco tem efeito grande e idêntico nos dois cortes, e falha só porque o corte reduzido não tem tamanho para vê-lo. Isso se resolve com MAIS TEMPORADAS rastreadas, não com mais testes nas mesmas — e é a primeira coisa a rodar quando houver. (2) O onze físico é o mais usado com dado, não o onze tático. Com escalação por rodada daria para usar o onze que de fato jogou, e a base não tem: serieb_jogos.csv não traz nome de jogador nenhum.


## Bloco T — Que treinador buscar (4 partes)


### T01 — Quem comandou cada time da Série B, 2018 a 2026

*Pergunta:* Quem comandou cada time da Série B, em quais rodadas, de 2018 a 2026?


**T01-1 · Só 40 dos 160 times terminaram o ano com o treinador que começaram**  *[indício]*

- O que vimos: Nas 160 clube-temporadas fechadas de 2018 a 2025 a mediana é de 2 treinadores efetivos e a média é de 1,3 troca por ano. Só 40 times chegaram ao fim do ano com quem os abriu. 2026 fica fora da conta porque não acabou.
- Para o Santa Cruz: Orçar comissão técnica para um ano é orçar mais de uma: o clube mediano da Série B troca uma vez, 67 dos 160 (42%) trocaram duas vezes ou mais, e quem planeja a temporada com um nome só está planejando a exceção. A reserva de rescisão e de segunda comissão entra na conta desde o início, não como imprevisto. E o perfil de jogador de J05 não pode ficar amarrado a um modelo de jogo que tem uma chance em quatro de chegar inteiro em novembro.
- n: 160 clube-temporadas fechadas (2018–2025); 2026, com 20 clube-temporadas em curso, entra à parte e não na conta
- Prova: T01_rodada_treinador.csv; T01_numeros_novos.json; base_passagens_temporada.csv; T01.md, seção Prova


**T01-2 · 29 treinadores comandaram dez rodadas ou mais em três clubes ou mais**  *[indício]*

- O que vimos: Dos 193 treinadores da base, 29 tiveram dez rodadas ou mais em três clubes ou mais, e 29 é piso porque 62 rodadas ficaram sem treinador conhecido. Allan Aal chegou a 9. Na janela de 2022 a 2025, a única com régua técnica e física, restam 14 nomes, metade da lista.
- Para o Santa Cruz: Dá para julgar treinador pelo que ele repete em clubes diferentes, e não pela última campanha, que é o que o mercado vende. Mas a lista que chega em T03 e T04 é a de 2022 a 2025: 14 nomes, não 29 — é dessa lista curta que sai o treinador. Quem tem um clube só na Série B entra como aposta, e tem de ser pago como aposta.
- n: 193 treinadores; 113 chegaram a pelo menos uma passagem de dez rodadas ou mais, e 278 das 492 passagens-temporada cruzam esse corte
- Prova: T01_rodada_treinador.csv; T01_numeros_novos.json; base_passagens_temporada.csv; T01.md, seção Prova


**T01-3 · A coleta registrou 492 passagens de treinador em 180 clube-temporadas**  *[indício]*

- O que vimos: Na janela que a Protótipo estimava, a coleta entregou 276 passagens, dentro dos 250 a 400 previstos. Das 157 passagens de dez jogos ou mais que a segunda fonte tem de 2022 a 2026, 150 batem no mesmo clube e no mesmo ano; antes de 2022 não há conferência.
- Para o Santa Cruz: O clube passa a julgar treinador pelo histórico inteiro na Série B — quantas rodadas comandou, em quais clubes, com que elenco — e não pela última campanha. Quem aparece em três clubes é histórico conferível; quem aparece em um é aposta. T02, T03 e T04 ficam destravadas com essa base.
- n: 492 passagens-temporada em 180 clube-temporadas, 2018–2026 (era 506 em 188)
- Prova: T01_rodada_treinador.csv; T01_numeros_novos.json; dados/bola_parada.json; T01_lacunas.json; T01.md, seção Prova


*Em aberto (T01):* A conferência contra fonte independente foi feita e passa (150 das 157 passagens de dez jogos ou mais do Sofascore, em dados/bola_parada.json). Ficam em aberto duas coisas. Uma: o que o Sofascore tem e a coleta não — Claudinei Oliveira na Ferroviária de 2025 e Fábio Matias no CRB de 2026 —, dentro dos 29 clube-temporadas com buraco de T01_lacunas.json, que somam 62 das 6.608 rodadas jogadas sem treinador conhecido. Outra: scripts/T01_rodadas.py ainda tira a temporada de d.year e, rodado hoje, devolve 506 passagens em 188 clube-temporadas e reescreve base_passagens_temporada.csv com 506 linhas, contra os 492 em 180 publicados aqui; o T01.md também não é reescrito desde 17/09 e discorda destes números. Os dois são decisão do dono, e nenhum deles foi tocado nesta rodada.


### T02 — Rodadas no G4 por treinador, 2022 a 2026

*Pergunta:* Quais treinadores mantêm seus times mais rodadas no G4?


**T02-1 · O tempo no G4 acompanha o preço do elenco**  *[provável]*

- O que vimos: Clube com elenco entre os cinco mais caros passa, em média, 14,6 rodadas no G4 por temporada; do 11º elenco para baixo, 3,2. A distância que a conta sustenta é a dos cinco mais caros contra o 11º para baixo; contando todas as rodadas, o degrau do meio não se separa do acaso.
- Para o Santa Cruz: Currículo de treinador com muito tempo no G4 diz, antes de tudo, o caixa do clube em que ele estava: na lista curta, cada nome tem de vir com o valor do elenco que comandou em cada ano. Para o Santa Cruz, que não vai ter elenco do top-5, o alvo é quem fez tempo de G4 com elenco do 11º para baixo — grupo em que mais da metade dos clubes não passa uma rodada sequer no G4.
- n: 80 clubes-temporada de 2022 a 2025 (20 com elenco entre os 5 mais caros, 20 do 6º ao 10º, 40 do 11º para baixo); 2026 fica à parte, como teste
- Prova: T02_passagem.csv; classificacao_rodada.csv; T02_numeros_novos.json (testes); T02.md, seção Prova


**T02-2 · Eduardo Baptista teve o piso mais alto entre quem trocou de clube**  *[indício]*

- O que vimos: Nas 3 passagens de 2022 a 2025, a pior teve o time 12 rodadas no G4 em 32 e a melhor, 20 em 38. Mas um desses clubes, o Criciúma, tinha o 8º elenco mais caro, e não é clube sem dinheiro. O segundo piso mais alto é o de Jair Ventura, 5 em 27.
- Para o Santa Cruz: É o nome que sobra para a lista curta de T04, mas pelo piso e não pelo pico: o que ele mostrou foi não afundar em dois clubes diferentes. Na conversa, pedir o valor do elenco de cada ano ao lado — só as duas temporadas do Novorizontino foram com elenco barato, e a repetição “em clube sem dinheiro” não vale para o Criciúma. Disponibilidade e custo ficam para validação externa.
- n: 3 passagens, 2 clubes, 108 rodadas (2022–2025); a passagem no Criciúma de 2026 fica à parte — 26 rodadas de temporada em curso, com Vila Nova 0×2 Criciúma faltando na base
- Prova: T02_passagem.csv; T02_treinador.csv; T02_numeros_novos.json (numeros); T02.md, seção Prova


**T02-3 · O tempo no G4 no clube anterior não anuncia o do clube seguinte**  *[indício · **negativa**]*

- O que vimos: Dos 28 treinadores com dois clubes ou mais, 7 tiveram um ano zerado no G4 e outro quase todo lá. E o ano bom quase não foi melhor no placar, 0,12 ponto por jogo, e em 3 deles foi igual ou pior. Com 28 nomes só uma ligação forte apareceria, e isso não prova que nada se transfere.
- Para o Santa Cruz: Não contratar ninguém pelo melhor ano de G4: o pico não se repete no clube seguinte — e nem no mesmo clube, porque nos 8 casos de treinador que ficou mais de uma temporada no mesmo clube a oscilação é pelo menos tão grande quanto entre clubes. O que sobra para comparar nomes é o ponto por jogo de cada passagem, com o valor do elenco ao lado.
- n: 28 treinadores com dois clubes ou mais (2022–2025); 2026 fica à parte, como teste
- Prova: T02_passagem.csv; T02_numeros_novos.json (correlacao_T02_3); T02.md, seção Prova


*Em aberto (T02):* O recálculo que a proposta v2 pede ainda não rodou: o scripts/T02.py precisa passar a produzir o ranking de valor por temporada (T02_faixa_valor.csv), os testes pelo scripts/_metodo.py (T02_testes.csv) e as duas contagens em todos os marcadores. Hoje os números estão conferidos e reproduzíveis em T02_numeros_novos.json, mas o script da parte não os grava — e por isso o selo de provável da T02-1 não pode ir à tela. Falta também gravar em arquivo a contagem da 10ª rodada em diante na unidade clube-temporada e os quatro cortes da T02-2 e da T02-3, que só existem na conferência da proposta. A porta temporal não é passável nesta parte: o valor do elenco é instantâneo de temporada e não tem versão por turno, então o saldo de xG e o ponto por jogo entram como descrição, nunca como critério. Duas heranças a acertar fora daqui: o pedido do _cruzar de marcar a T02-1 como negativa morre na reescrita (a metade negativa “não o nome do treinador” saiu da manchete porque nunca foi testada, e a negativa da parte continua sendo a T02-3), e o T04-2 copia de T02 a frase “dos 34 multiclube, 9 variam 50 pontos ou mais”, que no recorte fechado vira 28 e 8 — arrumar T02 sem arrumar T04 deixa a aba com dois números que não existem mais.


### T03 — O perfil de jogo do treinador

*Pergunta:* Os times do treinador mostram os traços de quem sobe, em clubes diferentes?


**T03-1 · Só a distância do chute acompanha o treinador na troca de clube**  *[provável]*

- O que vimos: Comparei cada treinador consigo mesmo em dois clubes. Só a distância do chute o acompanha, do mesmo lado do meio da tabela em 6 de cada dez pares, contra quase cinco pelo acaso. O perfil inteiro se repete o dobro com o treinador do que com o clube, mas é o dobro de quase nada.
- Para o Santa Cruz: Na conversa com um treinador, a única coisa do histórico dele que vale perguntar é de onde os times dele chutam: é o único traço que ele leva de um clube para o outro, e é o mesmo que o A14 aponta como característica de quem sobe, e não como consequência do resultado. O resto do “estilo dele” não prevê nada — serve de desempate entre dois nomes parecidos, nunca de critério principal de contratação. E o estudo não separa o que é do treinador do que é do calibre do clube que costuma contratá-lo.
- n: 28 treinadores em dois clubes ou mais, dentro de 126 passagens de 10 rodadas ou mais (64 treinadores), 2022–2025; 10 deles entram com um único par de clubes, e são 102 os pares entre clubes distintos. Com a temporada em andamento dentro seriam 34 em 151. A base de comparação do acaso são as 126 passagens inteiras, e não só as dos que trabalharam em mais de um clube.
- Prova: T03_passagens.csv; T03_resumo.json; T03_numeros_novos.json, chave bh_familia_7


**T03-2 · Trocar de treinador não muda o jeito de jogar do time**  *[indício · **negativa**]*

- O que vimos: Em 66 trocas de treinador, nenhum dos 7 traços do jeito de jogar puxa o time para um lado só. Cada time anda de 4 a 7,5 posições na tabela, mas a passagem de um treinador só, cortada ao meio, anda o mesmo tanto. É janela curta oscilando, e não a chegada do treinador.
- Para o Santa Cruz: Trocar treinador no meio da temporada não compra um modelo de jogo novo: o placar sobe, de 1,15 para 1,32 ponto por jogo, e sobe em 43 das 66 trocas — mas a mesma conta feita sem troca nenhuma anda na direção oposta, de 1,55 para 1,33 em 75 passagens de um treinador só cortadas ao meio, e as duas terminam no mesmo lugar. Ou seja: quem troca troca no fundo do poço, e o que vem depois é o time voltando ao normal — se for para trocar, troque por gestão e por resultado, não esperando outro jeito de jogar. Esta conclusão pode ser efeito do placar: o xG criado e o xG sofrido mudam com ele, e a base não permite o recorte por estado do jogo.
- n: 66 trocas em 51 clube-temporadas (31 clubes), 2022–2025 — as janelas se sobrepõem, porque o “depois” de uma troca vira o “antes” da seguinte, e 14 clube-temporadas entram com duas ou três trocas. Com a temporada em andamento dentro seriam 73. O placebo são 75 passagens de um treinador só, cortadas ao meio com 8 jogos ou mais de cada lado.
- Prova: T03_antes_depois.csv; T03_numeros_novos.json, chave bh_ad


*Em aberto (T03):* O item em aberto de verdade é o conjunto de traços: os sete não são “o índice do A14” — o xG não entra em régua nenhuma do índice, o xG sofrido só entra numa régua que o A14 descartou, e dois traços calculáveis jogo a jogo (xG sofrido em casa e duelo defensivo ganho em casa) ficaram de fora mesmo havendo cobertura, com mediana de nove jogos em casa por passagem. Trocar os traços obriga a rodar scripts/T03.py de novo e muda de uma vez todos os números desta parte, então é pedido separado. Continuam por escrever resultados/T03_testes.csv, com os sete q de cada família (já calculados em T03_numeros_novos.json), e resultados/T03.md, que a seção Entrega de cada parte exige; e o antes-e-depois compara o treinador novo com o anterior no mesmo elenco, não com uma contrafactual do mesmo treinador.


### T04 — O treinador ideal: o que a base sustenta

*Pergunta:* Quais treinadores combinam resultado, perfil alinhado e consistência?


**T04-1 · O 3º da lista pela pior passagem nunca subiu**  *[indício]*

- O que vimos: Pela pior passagem, a lista de 30 treinadores aponta dois campeões de uma temporada só e, em 3º, Eduardo Baptista, que nunca subiu. Trocando a pior passagem pela média, ele vai de 37,5% a 47,2% do tempo no G4 e perde o lugar. E quem subiu com dois clubes ficou de fora.
- Para o Santa Cruz: Não dá para tirar um nome só desta lista: trocar a pior passagem pela média já muda o terceiro lugar, e o critério que produzia "um nome só" é o mesmo que zera todo treinador com quatro passagens ou mais. Eduardo Baptista segue o nome mais regular da base — três temporadas sem afundar, com elencos 10º, 16º e 8º mais caros do ano, ou seja meio de tabela em dinheiro, e não barato —, mas isso tem de ser dito na mesma frase em que se diz que ele parou três vezes em 5º. Para avaliar qualquer candidato, olhe as duas contas juntas e o que ele entregou de fato: dos 30, 14 já terminaram alguma vez no G4, 10 comandaram isso até a última rodada e só 2 fizeram em dois clubes; disponibilidade e custo ficam para validação externa, como o CLAUDE.md manda.
- n: 30 treinadores com 30 rodadas ou mais, em passagens de 10 rodadas ou mais e não interinas, nas quatro temporadas fechadas (2022–2025); Eduardo Baptista com 3 passagens, 2 clubes e 108 rodadas. 2026 entra só como teste.
- Prova: T02_passagem.csv, colunas pct_g4 e pct_g4_apos_10, recortadas para 2022–2025 pelas colunas em_curso e base_incompleta, que o scripts/T04.py não lê; A01_clube_temporada.csv, para a posição, os pontos e a distância ao 4º de cada temporada; T04_numeros_novos.json, chave numeros, com o de onde e o segundo caminho de cada valor; T04_resumo.json, chave lista_completa, que já traz o piso e a média lado a lado. O índice de perfil do T03 é percentil e fica só aqui, como descrição do clube-temporada nas 7 medidas do T03 — 73,6 na média das três passagens e 56,1 na pior —, nunca como perfil alinhado do treinador. Sensibilidade do corte de rodadas em _robustez_19_09.json, chave subamostras_rodadas, refeita só nas fechadas: em 20 rodadas a lista vai a 44 nomes e ele cai para o 5º; em 40 e em 60 rodadas ele é o 1º.


**T04-2 · Esta base não mostra o histórico do treinador reaparecendo no clube seguinte**  *[indício · **negativa**]*

- O que vimos: Entre os 28 treinadores que passaram por dois clubes ou mais, a diferença típica entre a melhor e a pior passagem dá 21,7 pontos percentuais no G4. O jeito de jogar também não acompanha. A base é pequena demais para fechar a conta: é falta de prova, não prova do contrário.
- Para o Santa Cruz: Não pague pelo currículo de G4 nem pelo modelo de jogo: nenhum dos dois reaparece no clube seguinte, e o estudo também não consegue afirmar que não reapareceriam. E, depois do T04-1, também não vale a regra de escolher pela pior temporada: ela põe na frente quem nunca subiu e deixa de fora os dois que subiram com dois clubes diferentes. O que sobra de prático é usar a lista só para reduzir a conversa e decidir por entrevista, comissão e projeto, que este dado não mede; investir na comissão técnica continua de pé.
- n: 126 passagens de 64 treinadores nas temporadas fechadas, 28 deles em dois clubes ou mais, e 66 trocas no meio da temporada (com 2026: 151 passagens, 69 treinadores, 34 multiclube e 73 trocas).
- Prova: T02_passagem.csv, coluna pct_g4, para a amplitude entre a melhor e a pior passagem de cada treinador; T03_passagens.csv e T03_resumo.json, chave nulo_dois_quaisquer, para a repetição do perfil entre clubes; T03_antes_depois.csv, colunas jogos_antes e jogos_depois, para as trocas no meio da temporada; T04_numeros_novos.json, chaves dmin_multi, dmin_antes_depois e conf_tracos: o desenho entre clubes só detecta 0,48 e mediu 0,27, o pareado do antes e depois só detecta 0,33, e 3 dos 7 traços ficam abaixo do piso de 0,40 de confiabilidade.


*Em aberto (T04):* Falta o T04.md com a lista de 3 a 5 nomes, pontos fortes, riscos e amostra de cada um — agora nas duas ordens (pior passagem e média) e com a coluna de acessos ao lado do tempo no G4. O perfil ideal descrito em réguas continua sendo o índice do A14, que só se sustenta em duas das quatro temporadas, e o scripts/T04.py não abre arquivo nenhum do A14. O script também não recorta a temporada em curso (não lê em_curso nem base_incompleta) e não grava T04_numeros.json: os valores desta rodada vêm de T04_numeros_novos.json, conferidos por dois caminhos, e o script precisa ser rerrodado para produzi-los. Alguns números do texto continuam escritos à mão por não haver marcador — 48,5% e os 5 clubes de Enderson Moreira, os 21 dos 30 e os 9 com quatro passagens ou mais, os 14, 10 e 2 dos acessos, e as 126 passagens de 64 nomes das temporadas fechadas no T04-2 —, e o 48,5% é decimal, então o portão vai reprovar a regra 1 até ele ganhar marcador. Disponibilidade e custo dos nomes ficam para validação externa.


## Bloco J — Quem contratar (11 partes)


### J10 — Corrida para a área: a ponte do eixo até o jogador, 2022 a 2025

*Pergunta:* A corrida para dentro da área vira requisito de contratação por posição?


**J10-1 · Correr para a área não separa o titular de quem sobe**  *[provável]*

- O que vimos: Nenhum dos 18 testes de corrida para a área separa o titular de quem sobe nos dois cortes. No volante o sinal aponta para o lado certo, +0,43, e ainda assim fica abaixo do que este desenho enxerga, 0,74.
- Para o Santa Cruz: Corrida para a área NÃO entra na ficha de contratação. A ideia era boa e a base existia — a tabela de corridas sem bola nunca tinha sido usada —, e a resposta é que ela não sustenta requisito por posição. Isso protege de um erro caro: montar a ficha em cima de um número de rastreamento que parece técnico, é vendido como diferencial e, nesta liga, não distingue o titular de quem subiu do titular do meio. O eixo da qualidade da chance continua valendo — ele só não se compra por aqui. Leia junto com o J10-3.
- n: 697 titulares com corrida medida, 2022 a 2025 (40 clubes): 141 de quem subiu, 414 do meio e 142 de quem caiu, em 6 setores. 0 titulares ficaram fora por não terem linha na tabela de corridas.
- Prova: J10_testes.csv; J10_resumo.json; J10_indicadores.json; J10.md


**J10-2 · Só o volante de quem sobe corre diferente, e é em volume**  *[provável]*

- O que vimos: O volante de quem sobe faz 3,23 corridas fortes por meia hora de posse, contra 1,88 do meio, e corre 12,44 metros por corrida contra 11,30. É volume e alcance, não destino.
- Para o Santa Cruz: É o único requisito de corrida que esta parte sustenta, e ele vale para UMA posição: o volante. O que se procura é o jogador que cobre mais chão por corrida e repete corrida forte quando o time tem a bola — não o que ataca a área. Entra como desempate na ficha do volante, abaixo da minutagem, que continua sendo o único corte eliminatório (J05-3). E combina com o J04-2, que já tinha achado sinal físico no volante e em nenhuma outra posição: é a mesma posição aparecendo de novo, em medida diferente, o que é mais forte do que um achado isolado.
- n: 21 volantes de quem subiu contra 50 do meio, dentro dos 697 titulares com corrida medida de 2022 a 2025.
- Prova: J10_testes.csv; J10_resumo.json; J10.md


**J10-3 · A qualidade da chance se compra no treinador, não no jogador**  *[indício]*

- O que vimos: O eixo da qualidade da chance é firme no TIME e não aparece no jogador: de 18 testes de corrida para a área, passam 0. Antes já não aparecia no número técnico nem na corrida por 90.
- Para o Santa Cruz: É a conclusão de orçamento desta parte, e ela fecha com a A16. O traço que mais rende ponto nesta liga é do time — modelo de jogo e treinador —, e quatro partes seguidas tentaram achá-lo no jogador e não acharam: nem no número técnico por setor, nem na corrida por 90, nem na ficha completa, nem agora na corrida para a área. Onde gastar, então: em treinador e em treino, que é onde o eixo mora; e, no jogador, em minutagem alta e regular, que é o único requisito que a base sustenta. O que NÃO fazer é pagar prêmio por um número de rastreamento apresentado como “ele ataca a área”: nesta base, esse número não distingue quem subiu.
- n: 697 titulares com corrida medida em 6 setores, mais as partes J03, J04 e J05 que a conclusão lê junto.
- Prova: J10_resumo.json; J03.json; J04.json; J05.json; J10.md


*Em aberto (J10):* Duas. (1) O poder. No volante os três indicadores de corrida para a área apontam para o lado certo e ficam abaixo do mínimo detectável; com mais temporadas rastreadas — ou com a Série B de anos anteriores no SkillCorner — a pergunta merece voltar, e a lista já está declarada de antes. (2) O corte por jogo. A tabela de corridas é por temporada fechada; a física por jogo existe (physical_match) e a de corrida não. Com corrida por jogo daria para rodar a anterioridade e para cruzar com o A15, que mediu o jogo. É a mesma compra que a A08 e a A09 já pediram, agora com um terceiro motivo.


### J11 — Correr com a bola e correr sem a bola: a razão entre as fases, 2022 a 2025

*Pergunta:* O titular de quem sobe corre proporcionalmente mais sem a bola?


**J11-1 · Nenhuma razão entre as fases sobrevive aos dois cortes**  *[indício]*

- O que vimos: Das 66 comparações de quem sobe contra o meio, 0 sobrevivem aos dois cortes. O que mais chegou perto foi o EXTREMO, e na direção esperada: quem sobe corre proporcionalmente mais sem a bola, +1,00 na alta intensidade — só que no corte reduzido.
- Para o Santa Cruz: A razão entre correr sem a bola e correr com a bola ainda não vira requisito de contratação, mas esta é a pista mais promissora que o físico deu no estudo inteiro, e ela é do extremo. A direção é a que se esperava — o extremo de quem sobe corre proporcionalmente mais na fase sem a bola —, o efeito é grande, e ele fica mais forte quando saem os clubes de cobertura de rastreamento baixa, que é justamente o corte que o método da casa manda rodar com dado físico. O que impede de usar é o n: são 17 extremos de quem sobe contra 53 do meio no corte cheio, e oito contra trinta e dois no reduzido. Na prática: não vira piso agora, e vira a primeira coisa a rodar quando houver mais temporadas rastreadas. O único requisito de elenco que a base sustenta continua sendo minutagem alta e regular.
- n: 697 titulares com físico, 2022 a 2025, 40 clubes: 141 de quem subiu, 414 do meio e 142 de quem caiu, em 6 setores. Cobertura de 697 em 697 nas três unidades da tabela física.
- Prova: J11_testes.csv; J11_resumo.json; J11_indicadores.json; J11.md


**J11-2 · O lateral de quem cai arranca menos sem a bola**  *[provável]*

- O que vimos: O lateral de quem caiu faz 3,16 arrancadas fortes por meia hora sem a bola, contra 3,35 do meio. Passa nos dois cortes, -0,62 e -0,64.
- Para o Santa Cruz: É o único achado desta parte que sobrevive aos dois cortes, e ele está do lado de BAIXO da tabela: serve para reconhecer risco, não para escolher alvo. Lateral que não arranca forte na fase defensiva é característica de quem caiu, e não o contrário — o mesmo indicador não distingue quem sobe do meio. Na prática entra como sinal de alerta na avaliação do elenco atual e como desempate para descartar, nunca como piso de contratação. Vale lembrar que o estudo inteiro mede pouco na linha de baixo: o A01-3 já mostrou que escapar do rebaixamento custa muito menos do que subir, e são decisões diferentes.
- n: 142 titulares de quem caiu contra 414 do meio, dentro dos 697 com físico; no lateral, 27 contra 79 na comparação de cima.
- Prova: J11_testes.csv; J11_resumo.json; J11.md


**J11-3 · Um quinto do jeito de correr é do time, não do jogador**  *[indício]*

- O que vimos: O clube em que o jogador estava explica 20,8% de quanto ele corre sem a bola em relação a com a bola. E a razão anda +0,28 com a posse do time. Nas outras medidas o clube explica de 6,4% a 13,8%.
- Para o Santa Cruz: É um aviso para ler ficha física de qualquer fornecedor. Número por FASE — com a bola, sem a bola — parece medir o jogador e mede, em parte, o time em que ele jogava: um time que fica pouco com a bola dá mais corrida sem bola a todo mundo. Isso não invalida o indicador; muda o que se pode concluir dele. Na prática: ao comparar dois jogadores por número de fase, pergunte primeiro se os times deles tinham a bola de forma parecida — e desconfie de diferença pequena entre jogadores de times com posse muito diferente. É a mesma ressalva que o J08-3 faz para quem vem de outra liga, agora dentro da própria Série B.
- n: 697 titulares com físico em 40 clubes, 2022 a 2025.
- Prova: J11_resumo.json; J11_testes.csv; J11.md


*Em aberto (J11):* Duas. (1) O volante. É a TERCEIRA parte seguida em que ele é a única posição a dar sinal físico (J04-2, J10-2 e J11-1), e nenhuma delas o sustenta nos dois cortes. Ou é característica real da posição, ou é o efeito de testá-la muitas vezes — e separar as duas coisas exige mais temporadas rastreadas, não mais testes nas mesmas. Antes de qualquer conclusão sobre volante, isso tem de ser resolvido. (2) O modelo de jogo dentro do indicador de fase. O J11-3 mede que o clube explica parte da razão; controlar por ele exigiria comparar jogadores dentro do mesmo clube, e aí o n por setor cai a dois ou três. Com a physical_match de 2025 daria para tentar por jogo, com uma temporada só.


### J01 — Base e minutagem: quem joga e por quê

*Pergunta:* Quem tem minutagem alta e regular em cada posição, e quanto é lesão?


**J01-1 · O corte único de minutagem passa 27,3% dos goleiros e só 7% dos atacantes**  *[indício]*

- O que vimos: Em 3.160 jogador-temporadas de 2022 a 2025, o corte de 60% dos minutos do time vale igual para todos, mas o goleiro mediano joga 21,7% e o atacante mediano, 16,5%. Quatro temporadas devolvem 90 jogadores de minutagem alta e repetida, e 215 quando o corte é o da própria posição.
- Para o Santa Cruz: O corte de minutagem passa a ser por posição, e J01 tem de fixar qual: com o corte único a busca por atacante começa sem candidatos e a de goleiro começa cheia, e o problema não é o mercado, é a régua. O corte dentro da posição já está calculado — Goleiro 64,7% · Zaga 56,8% · Volante 51,0% · Lateral 46,8% · Meia 42,5% · Atacante 34,2% · Extremo 32,4% — e é ele que J03 a J06 devem usar, lendo o jogador dentro da própria posição e temporada, que é a mesma normalização que o estudo já usa para clube.
- n: 3.160 jogador-temporadas (2022-2025)
- Prova: J01_numeros_novos.json, chave corte_por_posicao — o percentil 75 da fatia de minutos em cada posição, com o n de cada grupo (Extremo 653, Lateral 559, Meia 529, Zaga 485, Atacante 474, Volante 244, Goleiro 216) — e as chaves reg_gk, reg_zag, reg_atk, reg_ext, altos_pos e reg_pos; dados/minutagem_serieb.json (colunas ano, grupo e fatia_pct), recorte 2022-2025. No corte único ficam 457 linhas acima da régua e 90 regulares; no corte por posição, 795 e 215, e os dois pares usam o mesmo sinal (fatia maior ou igual ao corte).


**J01-2 · A ficha de lesão não distingue quem jogou pouco de quem jogou muito**  *[indício · **negativa**]*

- O que vimos: Entre 2022 e 2025, 7% dos 1.974 jogador-temporadas de minutagem baixa com ficha no Transfermarkt têm lesão registrada, contra 7,5% dos 348 de alta. Quando há lesão, quem jogou pouco fica 56 dias fora contra 33, em parte porque quem fez 60% dos minutos não ficou meio ano parado.
- Para o Santa Cruz: Diante de um alvo com pouco tempo de jogo, a hipótese padrão continua sendo que ele não era opção do treinador, e a ficha de lesão não desmente isso. Mas não risque o nome por aí: em pouco mais de um quarto das linhas (838 de 3.160) não há ficha nenhuma para consultar, a base só enxerga lesão grande, e quando há lesão em quem jogou pouco ela custa quase o dobro de dias — pergunte ao clube antes de decidir.
- n: 1.974 de minutagem baixa e 348 de minutagem alta, com ponte ao Transfermarkt (2022-2025)
- Prova: J01_numeros_novos.json, chaves les_alta_base, les_alta_n, les_alta_dias e les_dmin (o cálculo de poder da §6.7 aplicado a proporção, com o h de Cohen); recorte 2022-2025. A ponte de lesão liga dados/serieb_elencos.csv (colunas jogador, ano e id_jogador) a dados/serieb_lesoes.csv (colunas dias_2022 a dias_2025): 1.974 linhas de minutagem baixa e 348 de alta casam, 838 ficam sem ficha. Das 2.322 casadas, 43 casam só por nome e ano, sem o clube, e 5 delas têm ficha de lesão — o docstring do script promete nome, clube e ano, e o código casa só nome e ano.


**J01-3 · Time que cai roda o elenco, 45,6 jogadores em média contra 38,4 do meio**  *[provável]*

- O que vimos: Nas quatro temporadas fechadas, os clubes que caíram usaram 45,6 jogadores em média, contra 38,4 do meio; quem subiu não se distingue do meio. Pelo avesso, em quem caiu só 4,3 por temporada passaram de 60% dos minutos, contra 5,8. Sem os times de fronteira o degrau só cresce.
- Para o Santa Cruz: Minutagem se lê contra o elenco do time: 60% dos minutos num clube que usou 45,6 jogadores é bem mais raro do que a mesma fatia num clube que usou 38,4, e é assim que J03 a J06 têm de comparar. Não contrate por isto — quantos jogadores um time usou está na lista fixa do estudo como consequência de como o ano foi, nunca como característica de quem joga. E tire da tela a frase de que minutagem alta em time rebaixado é sinal mais forte: esta contagem não mede qualidade nenhuma, e a ressalva do CLAUDE.md sobre falta de opção continua de pé, esperando o J03.
- n: 80 clubes-temporada (2022-2025): 16 que subiram, 48 do meio e 16 que caíram; sem os times de fronteira, 8, 32 e 12
- Prova: J01_numeros_novos.json, chave rob_j01_3: jogadores usados Cai × Meio d +1,10 e q 0,0037 com os times de fronteira, d +1,18 e q 0,0120 sem; Sobe × Meio não separa em corte nenhum (p 0,1633 e 0,2237). Fatias altas Cai × Meio d -0,70 e q 0,0191 com, d -0,87 e q 0,0151 sem; fatias altas Sobe × Meio só separa com os times de fronteira (p 0,0143 contra 0,1138 sem) e sai pela regra 4 do _metodo_fronteira.md. Leitura que a prova fixa: as células sem fronteira só batem com o posto RECALCULADO depois de tirar as 28 linhas de fronteira; calculando sobre os 20 times do ano e filtrando depois, a leitura é a mesma e os quatro valores mudam (usados Cai × Meio d +1,09 e p 0,0034; altos Cai × Meio d -0,88 e p 0,0063; altos Sobe × Meio p 0,1601; usados Sobe × Meio p 0,2117). Menor efeito detectável do desenho: 0,82 em 16 × 48 e 0,97 em 12 × 32. Base: resultados/A01_clube_temporada.csv (coluna faixa e marca de fronteira) e dados/minutagem_serieb.json (colunas ano, time e fatia_pct), com o nome do clube passado pela ponte resultados/T01_ponte_clubes.json.


*Em aberto (J01):* A ponte com a base de lesões cobre 73% das linhas do recorte 2022-2025: das 3.160, 838 ficam sem ficha — 372 sem id do Transfermarkt e 466 com nome ambíguo (dois ou mais ids para o mesmo nome no mesmo ano), listados e nunca adivinhados. Resolver isso exige o módulo de identidade da §1.1, que não foi construído aqui. E o Wyscout corta o export em 500 linhas por temporada, então quem jogou muito pouco pode faltar na base — temporada sem dado não conta como minutagem baixa. Três dívidas de execução ficam abertas, todas fora deste arquivo: (1) scripts/J01.py continua rodando 2022-2026 e sem a ponte de clube, e não produz os números desta versão — eles vêm de J01_numeros_novos.json (19/09), e quem reexecutar a parte hoje regrava a prova com os valores antigos e entrega a J03-J06 uma base com 2026 dentro e o Athletico-PR 2025 sem faixa; (2) não existem a tabela de testes da parte nem a lista de indicadores pré-declarada, que é o que o esforço de reanálise de J01-3 tem de produzir; (3) o J01_resumo.json ainda está gravado em 2022-2026, e por isso saiu do campo prova das três conclusões até ser regravado no recorte que vale. Fica aberto também um conflito entre partes, que não cabe neste arquivo: a conciliação da v2 (J01-3, J02-3 e A07-2) decide que o dono da contagem de jogadores usados é o J02, que a mede com teste (47 contra 38, medianas), e que o par 45,6 contra 38,4 desta parte sai quando o J02-3 entrar, passando J01 a importá-lo por marcador. Aqui o texto foi aplicado como a v2 o escreveu em propostas.J01; a troca mexe em três arquivos e cabe ao fluxo principal.


### J02 — Rotação e continuidade do elenco

*Pergunta:* Quem sobe concentra os minutos em menos jogadores e mantém mais a base?


**J02-1 · Na Série B, 69,8% dos minutos são de jogador que chegou naquele ano**  *[indício]*

- O que vimos: Em quatro temporadas, 69,8% dos minutos identificáveis foram de jogador que chegou ao clube naquele mesmo ano. É contagem e não comparação: nenhum teste sustenta o número, e o Athletico-PR de 2025 ficou de fora por falta de minutos em comum.
- Para o Santa Cruz: A montagem anual não é ajuste de elenco, é construção de elenco: em um ano, a maior parte do time que entra em campo não estava lá. Isso muda o peso do planejamento de janela e o peso do erro, porque não há base herdada para diluir uma contratação ruim. Vale como retrato do campeonato, não como receita — é assim que a Série B inteira funciona, e não é o que diferencia quem sobe.
- n: 79 de 80 clube-temporadas, 2022–2025
- Prova: J02_resumo.json, chave quadro_por_faixa e o n da base. J02_testes.csv, familia continuidade: min_de_contratado_pct em Sobe × Meio dá q 0,48320 com fronteira e 0,25284 sem, selo “sem diferença clara” nos dois — nenhuma linha de teste sustenta a contagem geral, que não é comparação. J02_numeros_novos.json, chave contr_geral: o de_onde do nível geral (mediana das 79 linhas, conferida por três caminhos — 69,8478 no valor cheio, 68,5516 no agregado por minutos) e do mesmo corte sem os times de fronteira (69,6485). _porta_temporal.md, seção 4, para a medida de elenco não ser partível por turno.


**J02-2 · Manter a base do ano anterior não aparece como vantagem de quem sobe**  *[indício · **negativa**]*

- O que vimos: Entre os que subiram, quem já estava ficou com 27% dos minutos, contra 32,3% do meio; nos dois cortes a diferença cabe dentro do acaso. Caso a caso não há padrão: entre os 15 que subiram, de 13,9% a 70,1%. Não dá para dizer que a vantagem não existe, só que não apareceu.
- Para o Santa Cruz: O que este número não pode dizer é se manter ajuda ou atrapalha: permanência de elenco depende de como foi o ano anterior, então ela vem contaminada pelo resultado e descreve em vez de orientar. Para 2027 a decisão de manter ou trocar continua aberta e tem de ser tomada jogador a jogador, pelo que cada um entrega — que é a pergunta de J05 e J06. O que dá para dizer é que o Santa Cruz não precisa temer a troca grande: ela é a norma da Série B, inclusive entre os que sobem.
- n: 15 que subiram contra 48 do meio; sem os times de fronteira, 7 contra 32
- Prova: J02_testes.csv, familia continuidade: min_de_quem_ficou_pct em Sobe × Meio, com fronteira 27,017 contra 32,335 (d -0,328, q 0,32213) e sem fronteira 20,277 contra 31,218 (d -0,709, q 0,25284) — o cru e o efeito saem sempre da mesma linha, nunca de cortes trocados. Poder: a menor diferença detectável é d 0,84 com fronteira e 1,20 sem, contra um maior efeito observado de 0,709 na mesma família. Sobe × Trave da mesma medida, e do seu espelho min_de_contratado_pct, é firme só SEM os times de fronteira (20,277 contra 42,207, d -1,369, q 0,04002) e não com eles (d -0,708, q 0,09151); firme só num corte é suspeito e não é publicado, pela regra escrita em _metodo_fronteira.md.


**J02-3 · Quem sobe concentra 68,1% dos minutos nos onze mais usados, contra 63,1% do meio**  *[provável]*

- O que vimos: Os onze mais usados de quem sobe ficam com 68,1% dos minutos do time, contra 63,1% do meio da tabela e 60,2% de quem cai. Quem cai usa 47 jogadores na temporada, contra 38 do meio. Já o número de jogadores usados não separa quem sobe do meio (35 contra 38).
- Para o Santa Cruz: Isto descreve, não ensina: quem está ganhando repete a escalação e quem está perdendo roda o elenco, e o rótulo destes números já está decidido — não contrate para isto. O teste que separaria causa de consequência não é possível com o dado que existe, porque a minutagem é por temporada e não por rodada. Como retrato de fim de ano conversa com o J01 (4,3 jogadores de minutagem alta em quem cai contra 6,9 em quem sobe); a alavanca de montagem continua sendo quem se contrata, não quantos minutos os onze vão dividir.
- n: 15 que subiram e 16 rebaixados contra 48 do meio; sem os times de fronteira, 7 e 12 contra 32
- Prova: J02_testes.csv, familia concentracao: em Sobe × Meio, share_11 (q 0,00280 com fronteira e 0,01745 sem) e conc_hhi (0,00479 e 0,01745) são os dois únicos indicadores da parte com poder suficiente no corte cheio, e atletas usados não separa em corte nenhum (0,21439 e 0,28266), que é a última frase do texto. Em Cai × Meio são firmes nos dois cortes share_11 (0,01134 e 0,00116), atletas_usados (0,00268 e 0,00312), nucleo_300 (0,00268 e 0,00244) e min_de_quem_ficou_pct (0,03038 e 0,04028). Discordam entre os cortes, e por isso ficam fora do texto, nucleo_300 em Sobe × Meio — firme só com fronteira (d 0,672, q 0,02321) e não sem (d 0,656, q 0,12929) — e jogadores_que_ficaram_pct em Cai × Meio, também firme só com fronteira (d -0,579, q 0,04988) e não sem (d -0,57, q 0,12204). A inversão que tirou o superlativo da manchete: sem os times de fronteira quem menos mantém passa a ser o Sobe (20,277) e não o Cai (22,301), e o espelho vira junto (com fronteira, minutos de contratado dá Cai 75,911 contra Sobe 72,983; sem, Sobe 79,723 contra Cai 77,699). _porta_temporal.md, seção 4: a régua I não é partível por turno, e o número circular (valor da temporada inteira contra os pontos do 2º turno) dá parcial +0,202, p 0,0720. J01.json, chave numeros, para cai_altos e sobe_altos.


*Em aberto (J02):* Os sete indicadores da parte são consequência do resultado — a régua I e também a continuidade, que é pctFicou e novos na constante CONSEQUENCIA de ranking_gaps.py: a parte descreve o campeonato e nenhuma das três conclusões vira critério de contratação. Faltam duas rodadas de manutenção: a ponte de clube do T01 é aplicada só do lado dos elencos, então Athletico-PR 2025 some invisível no `if not js: continue` do J02.py em vez de sair por cobertura (mesmos números, descarte visível, e fora_por_cobertura deixaria de ser vazio); e a cobertura da ponte, declarada como subamostra, tem só um piso duro e nunca foi rodada com um piso mais alto. Falta ainda o resultados/J02.md que a seção Entrega de cada parte exige.


### J03 — O titular de quem sobe: técnico

*Pergunta:* Como os titulares de quem sobe se comparam aos do meio, no técnico?


**J03-1 · Por setor, nenhum número técnico separa o titular de quem sobe do meio**  *[indício · **negativa**]*

- O que vimos: Comparamos 723 titulares com 900 minutos ou mais em 12 números técnicos por setor. Nenhum dos 84 números separa os dois grupos nos dois recortes. Só contra a mesma posição exata sobra o lateral, um passe a mais em cada cem, e nada diz se vem antes do acesso ou depois.
- Para o Santa Cruz: O perfil técnico individual não é o que separa quem subiu: em nenhum dos 7 setores apareceu vantagem grande, e o único candidato que resiste aos dois recortes — e só quando a conta é refeita contra jogadores da mesma posição exata — é o lateral acertar cerca de um passe a mais em cada cem, pequeno demais para virar filtro. J05 e J06 podem exigir minutagem alta e regular e o encaixe no modelo de jogo, mas não devem pedir superioridade técnica geral como requisito de acesso. O que este desenho não autoriza é a frase contrária: ele não veria diferença menor do que a que consegue enxergar, então “não separa” não vira “não existe”.
- n: 723 titulares — 179 de quem sobe contra 544 do meio — em 7 setores, 2022–2025; sem os times colados na linha de acesso, 456 titulares (91 contra 365)
- Prova: J03_testes.csv; J03_resumo.json; J03_numeros_novos.json; _robustez_19_09.md; _metodo_fronteira.md


**J03-2 · O duelo defensivo separa no time e o estudo não o acha numa posição**  *[indício · **negativa**]*

- O que vimos: No time, quem sobe ganha 0,98 ponto percentual a mais de duelo que o meio. No volante a diferença é maior, 59,87% contra 58,06%, e ainda assim o estudo não tem tamanho para confirmá-la. No gol, e só sem os times de fronteira, o goleiro de quem sobe ganha menos.
- Para o Santa Cruz: Não transforme duelo defensivo em requisito de contratação por posição: a vantagem que aparece é do time, cerca de um ponto percentual por jogo, e nenhuma posição isolada mostra vantagem grande o bastante para virar filtro. Isso não prova que a vantagem venha de treino ou de organização — nada disso foi medido; prova só que ela não está localizada num contratado que J06 possa apontar. E o teste que pergunta se o duelo vem antes do resultado responde que não: o duelo do 1º turno não antecipa os pontos do 2º depois de descontar como o time já vinha pontuando.
- n: no time, 16 temporadas de quem sobe contra 48 do meio (8 contra 32 sem os times colados na linha); no jogador, 723 titulares em 7 setores (456 sem esses times)
- Prova: J03_testes.csv; A06_testes.csv; _porta_temporal.md; _robustez_19_09.md; J03_numeros_novos.json


**J03-3 · O goleiro de quem sobe ganha a mesma bola alta que o do meio**  *[indício · **negativa**]*

- O que vimos: Em porcentagem o goleiro de quem sobe aparece com 97,9% de bola alta ganha contra 87,9% do meio. Em bola ganha os dois empatam, 14,6 contra 14,5 por temporada. A diferença inteira é perder 0,5 contra 2 bolas altas no ano.
- Para o Santa Cruz: Este estudo não dá motivo técnico para pagar mais pelo goleiro: a única medida que apontava para lá é uma porcentagem sobre pouquíssimas bolas, ela some no recorte de controle e o mesmo recorte mostra o goleiro de quem sobe cortando menos bola. Não é o contrário — não estamos dizendo para economizar no gol; estamos dizendo que o J03 não mediu o que um goleiro faz: dos 12 números que medimos no gol, 7 são zero para quase todo goleiro. Antes de J05 fechar o perfil do gol, faltam testar defesas, gol sofrido contra o esperado, jogo sem sofrer e bola alta em número, que a base tem em dados/serieb_tecnico.csv e esta parte não usou.
- n: 16 goleiros de quem sobe contra 48 do meio no recorte cheio; 8 contra 32 sem os times colados na linha de acesso
- Prova: J03_testes.csv; J03_resumo.json; _robustez_19_09.md; _metodo_fronteira.md; J03_numeros_novos.json


*Em aberto (J03):* Dois indicadores foram declarados com nome que não existe na base e a emenda está datada em J03_indicadores.json: “Dribles bem sucedidos, %” virou “Dribles com sucesso, %” (mesma métrica) e “Perdas de bola/90” NÃO existe — foi substituído por “Acções atacantes com sucesso/90”, o que troca um indicador de erro por um de acerto. Não há medida de perda de bola nesta base. Falta o rerun que o próprio J03 nunca fez: acrescentar a coluna de fronteira e a opção de normalizar por posição, rodar os quatro cruzamentos e regravar J03_testes.csv com ic95 e poder. Enquanto ele não acontece, os números do corte sem fronteira citados no texto (456 titulares, 91 contra 365, 78,9/77,8 e 79,5/78,1 do lateral, 61,7/59,9 do time, 97,9/88,6 e 1,4/2,1/1,7 do goleiro) continuam escritos à mão, porque não existe marcador para eles em J03_numeros_novos.json nem em nenhuma saída de scripts/J03.py — estão registrados em _robustez_19_09.md e em _auditoria_18_09.json. Falta dado, também, para o selo algum dia subir: serieb_tecnico.csv é fechado por temporada, e sem export do Wyscout de jogador por turno (o Portal Ranking teria?) a porta temporal da §6.4 não roda em NENHUMA conclusão do J03 — o teto do bloco fica em “provável” para sempre.


### J04 — O titular de quem sobe: físico, 2022 a 2025

*Pergunta:* Em que posições os titulares de quem sobe se diferenciam fisicamente?


**J04-1 · Não achamos medida de corrida que separe o titular de quem sobe**  *[indício · **negativa**]*

- O que vimos: Comparei 697 titulares de 2022 a 2025 em 17 medidas de corrida, nas 6 posições de linha. Nenhuma das 204 comparações entre quem sobe e o meio sobrevive aos dois cortes. Não achar diferença não é achar que são iguais: com tão poucos por posição, só uma vantagem grande apareceria.
- Para o Santa Cruz: Requisito físico não é filtro de acesso: montar o elenco pela corrida não aproxima o clube do G4. O físico entra em J05 como exigência da posição — lateral tem de correr como lateral — e nunca como sinal de quem sobe; é a segunda vez que isto aparece, porque A07-1 já dizia o mesmo no clube. O que este desenho não autoriza é a frase contrária: ele não veria uma vantagem menor do que a que consegue enxergar, então quem quiser cravar “o físico não importa” precisa de mais titulares por posição, não deste estudo.
- n: 697 titulares com físico, de 907 no recorte 2022–2025; de 8 a 28 de quem sobe em cada posição, conforme o corte
- Prova: J04.md; J04_testes.csv; J04_resumo.json (nao_separa_nao_e_nao_existe); _robustez_19_09.json


**J04-2 · Cada um dos dois sinais físicos que sobraram existe num recorte só**  *[indício · **negativa**]*

- O que vimos: O volante de quem sobe alcança 27,9 km/h de pico contra 27,5 do meio, e só com os times colados na linha do acesso na conta. Na zaga o sinal é o contrário: aparece justamente quando esses times saem. Nenhum dos dois resiste à troca de recorte.
- Para o Santa Cruz: Nenhum dos dois vira requisito de contratação: não compre volante por velocidade de pico achando que é isso que leva ao acesso, e não leia “zagueiro que corre menos” como virtude. O zagueiro de quem CAI também corre menos que o do meio, nos dois recortes (8.736 contra 8.890 metros por jogo com todos os times, 8.769 contra 8.908 sem os colados na linha): correr menos na zaga marca as duas pontas da tabela, não o acesso. As duas observações vão para J05 como contexto de posição, nunca como filtro de perfil.
- n: volante: 21 contra 50 (quem sobe contra o meio); zaga: 13 contra 54 — 11 contra 51 sem as linhas de identidade marcada e 9 contra 43 sem os clubes de cobertura baixa
- Prova: J04_testes.csv; J04_resumo.json (achados_sobe_x_meio); _metodo_fronteira.md; _robustez_19_09.json


**J04-3 · O que o titular correu no primeiro turno se repete no segundo**  *[indício]*

- O que vimos: Em 2025, a única temporada com dado jogo a jogo, quem mais corria no primeiro turno seguiu entre os que mais correm no segundo; na velocidade de pico repete menos, mas repete. É repetição dentro da mesma temporada, o teste mais fácil: compara candidatos, não aponta acesso.
- Para o Santa Cruz: O dado físico é o requisito mais seguro de conferir num alvo: ele se repete, então o que o jogador correu não é ruído de medição e serve para comparar candidatos. Isso vale para J05 como exigência da posição — e não como aposta de acesso, que é justamente o que J04-1 e J04-2 negam. Onde a régua é mais frouxa é na velocidade de pico: ela repete menos, e um alvo escolhido só por PSV-99 é aposta mais arriscada do que um escolhido por volume de corrida.
- n: 180 titulares em 2025, só jogos de 60 minutos ou mais
- Prova: J04_resumo.json (porta_temporal); J04_resumo.json (sensibilidade_60_minutos); ESPECIFICACAO.md §4.3


*Em aberto (J04):* A porta temporal não roda: sem físico por jogo em 2022–2024 não há como dizer se o físico vem antes do resultado ou é consequência dele, e o buraco é do SkillCorner, não da cópia — só coleta resolve. A pergunta que decidiria: o Portal Ranking tem físico por jogo dessas três temporadas no skillcorner.db, ou o buraco é da própria coleta do fornecedor? Fica pendente também a unidade do BH: o cálculo rodou com a família partida por setor (pré-declarado, como em J03), e pela §6.3 da especificação, que vale onde diverge, zero dos 204 testes passam — é ela que decide se J04 tem 5 achados ou nenhum, e precisa ser resolvida antes de J05. Consequência para fora da parte: com J04-1 em indício e J03-1 também em indício, J05 recebe os dois pilares — técnico e físico — como resultado negativo fraco, não como fato assentado. E o que decidiria a zaga de J04-2 é prova de clube antes de 2025: 1.871 das 2.982 linhas (63%) não têm nenhuma, porque physical_match só existe de 2025 em diante e é o rótulo de clube que define Sobe, Meio ou Cai.


### J05 — Perfil ideal por posição, 2022 a 2025

*Pergunta:* Quais 4 a 6 métricas definem o jogador ideal em cada posição?


**J05-1 · O perfil por posição descreve quem subiu e não promete quem vai subir**  *[indício]*

- O que vimos: Rodamos 74 comparações entre o titular de quem subiu e o do meio, nas 7 posições, e nenhuma se sustentou. A ficha que sobra tem de 4 a 6 números por posição e só diz como esse titular era.
- Para o Santa Cruz: A ficha de cada posição vai para J06 como descrição, com três notas separadas — física, de duelo e de estilo —, que a especificação proíbe somar num número só. Ela serve para descartar quem está longe do que o titular de quem subiu era, nunca para prometer acesso a quem está perto. Das 39 métricas da ficha curta, 32 têm piso e 7 entram sem piso nenhum, porque quem subiu não estava acima da mediana da liga naquele número — e inventar exigência ali seria escrever número que o dado não tem.
- n: 907 titulares com dado técnico e 697 com dado físico, 2022 a 2025; 256 linhas de teste nos dois cortes
- Prova: J05.md; J05_testes.csv; J05_perfil.csv; J05_resumo.json


**J05-2 · Metade do perfil físico que o app já usa não sobrevive à correção**  *[indício · **negativa**]*

- O que vimos: Dos 18 números do perfil físico por setor que a tela mostra hoje, 9 passam na conta que corrige os muitos testes. Na zaga e no lateral não passa nenhum dos 4. E esse perfil compara quem sobe com quem cai, nunca com o meio.
- Para o Santa Cruz: O perfil físico por setor que a tela mostra hoje descreve quem subiu contra quem caiu, e não pode virar filtro de acesso. Na zaga e no lateral ele descansa em 4 números que a correção derruba, então ali a ficha entra com ressalva escrita e o peso da nota física cai. Nas outras posições ele continua servindo para descartar quem está longe do padrão de corrida da posição, que é o que o dado físico sabe fazer.
- n: 18 indicadores do perfil do app sobre 138 testes de sobe × cai por setor; 32 testes físicos Sobe × Meio e 18 Sobe × Cai nesta parte
- Prova: J05.md; J05_resumo.json; J05_testes.csv; prototipo.json


**J05-3 · O único requisito que a base sustenta é minutagem alta e regular por posição**  *[indício]*

- O que vimos: O corte de minutos muda com a posição, 64,7% no goleiro contra 34,2% no atacante. Com ele, as quatro temporadas devolvem 215 jogador-temporadas de minutagem alta e repetida. Um corte único reprovaria o atacante por ser atacante.
- Para o Santa Cruz: J06 aplica este corte antes de olhar qualquer número técnico ou físico, e ele elimina em vez de pontuar, como a §8.5 manda para viabilidade. Um corte único de minutos não mede minutagem, mede posição: reprova o atacante por ser atacante, como J01-1 mostrou. Com o corte por posição, a oferta de nomes regulares é curta, e é ela que vai dizer em quais posições J09 terá de procurar fora.
- n: 215 jogador-temporadas de minutagem alta e repetida entre 3.160, 2022 a 2025
- Prova: J05.md; J05_resumo.json; J05_numeros.json


*Em aberto (J05):* O perfil não foi validado contra desfecho: o backtest da §8.6 é de J06 e ainda não rodou, então nenhum piso desta ficha tem prova de que ordena certo. E a cláusula do CLAUDE.md sobre servir ao modelo do treinador escolhido ficou sem objeto, porque T04 não escolheu treinador.


### J06 — Alvos na Série B, e o teste que decide se eles podem ser publicados

*Pergunta:* Quais jogadores da Série B atendem o perfil de cada posição?


**J06-1 · Nenhum nome sai desta parte por falha da ficha**  *[indício · **negativa**]*

- O que vimos: Dos 297 que chegaram a um clube da Série B, a ficha aprovaria 17. Esses 17 jogaram menos no primeiro ano que os 280 reprovados, e esta conferência não tinha tamanho para confirmar nem isso.
- Para o Santa Cruz: Não contrate por esta ficha. Ela descreve como era o titular de quem subiu e serve para descartar quem está muito longe disso, mas não ordena candidatos: conferida contra o que aconteceu de verdade com 297 chegadas a clubes da Série B, ela aponta para o lado errado. Some-se a isto que exigir as 4 a 6 linhas da posição ao mesmo tempo esvazia o mercado: no elenco de hoje da Série B, 2 de 44 jogadores livres e rodados passam nas três notas juntas. A conta de contratação continua sendo a do olheiro, com a ficha ao lado como conversa, e o que o estudo entrega de útil aqui é a contagem da oferta, não a lista.
- n: 297 chegadas pontuáveis em 2023 a 2025, de 28 comparações por corte; 1.200 chegadas ficaram fora por não terem ano anterior na Série B e 246 por não chegarem a 900 minutos no ano anterior
- Prova: J06.md; J06_testes.csv; J06_backtest.csv; J06_resumo.json


**J06-2 · Quem chega já rodando joga mais no primeiro ano**  *[indício]*

- O que vimos: Quem chegou já jogando muito e sempre fez 473 minutos a mais no ano da chegada, 5,3 jogos inteiros. Sem os clubes colados na linha do acesso e da queda a diferença deixa de ser segura, então o corte serve para eliminar, nunca para ordenar.
- Para o Santa Cruz: Use minutagem alta e repetida como primeiro corte, e use-a para eliminar, nunca para pontuar. É o único requisito desta parte que aparece no dado do desfecho: entre 38 chegadas que já vinham rodando e 259 que não vinham, a diferença no primeiro ano foi de 473 minutos. Mas o mesmo dado diz para não esperar mais do que isso: quem chegou rodado NÃO ficou mais no clube no ano seguinte, e a diferença some quando se tiram os clubes de fronteira — então o corte serve para reduzir a lista, não para prometer titularidade.
- n: 38 chegadas com minutagem alta e repetida contra 259 sem, em 2023 a 2025; o corte por posição é o de J05 e bate número a número
- Prova: J06.md; J06_testes.csv; J06_backtest.csv; J06_resumo.json


**J06-3 · São só 51 livres com rodagem em toda a Série B**  *[indício]*

- O que vimos: Na Série B de hoje, 51 de 611 jogadores juntam contrato vencendo na virada e minutagem alta e repetida. Em 6 das 7 posições nenhum deles passa na ficha inteira.
- Para o Santa Cruz: É esta a lista de onde sai o elenco, e ela é curta: 51 nomes no mercado inteiro da Série B, sendo 1 no gol, 6 no volante e 6 no extremo. A ordem em que J09 deve procurar fora é Goleiro · Volante · Extremo. A meia, com 13, é a de maior oferta, e zaga, lateral e ataque ficam no meio da faixa que o estudo pede. E cuidado com o calendário: 347 dos 611 jogadores da Série B têm contrato vencendo nesta virada — estar livre em dezembro não seleciona ninguém, é o calendário brasileiro.
- n: 611 jogadores da Série B de 2026 depois da regra de homônimo, 239 nomes ambíguos descartados; 51 livres e rodados
- Prova: J06.md; J06_funil.csv; J06_resumo.json


*Em aberto (J06):* Não há lista de nomes: o backtest da §8.6 não autorizou, e J06_alvos.csv não foi escrito. Falta para ele passar: desfecho melhor que minuto jogado (nota de atuação por jogo não existe em base nenhuma), chegada de fora da Série B pontuável (hoje só se pontua quem vinha da própria Série B, o que perde 1.200 das 1.743 chegadas) e um perfil que não exija 4 a 6 pisos ao mesmo tempo. A porta temporal da §6.4 continua sem rodar. Não rodei gerar_estudo_serieb_js.py nem escrevi no _registro.md: os dois são do fluxo principal.


### J07 — Estrangeiros na Série B

*Pergunta:* Quantos estrangeiros jogaram a Série B, e como renderam?


**J07-1 · Quem sobe dá 10,5% dos minutos a estrangeiro, quase o triplo do meio**  *[indício]*

- O que vimos: 63 das 80 clube-temporadas já tiveram estrangeiro, e a liga usa 2,2 por clube, longe das 9 do regulamento. É retrato de agora, não das quatro temporadas: o uso quase triplicou desde 2022, até 10,2% dos minutos da liga, e em 2023 quem subiu usou menos estrangeiro que o meio.
- Para o Santa Cruz: A vaga de estrangeiro não está vazia: 63 de 80 clube-temporadas já usam pelo menos uma e 13 dos 16 clubes que subiram usaram — o Santa Cruz vai chegar num mercado com preço formado, e o que J08 e J09 fazem é escolher melhor dentro dele, não ocupar um espaço que ninguém viu. Quem subiu usa mais, mas isso é retrato de 2024-2025: em 2023 quem subiu usou menos que o meio. E nada aqui diz que estrangeiro faz subir — pode ser o contrário, clube que sobe é clube que tinha dinheiro para trazer.
- n: 180 casos de estrangeiro — 179 jogador-temporadas distintas, 146 jogadores — em 80 clube-temporadas de 2022 a 2025. Sobe: 58 casos em 16 clube-temporadas. Meio: 85 em 48. Cai: 37 em 16.
- Prova: J07_numeros_novos.json, sobe_min e sobe_sem; J07_resumo.json, por_faixa_do_time (cruzamento antigo, a regerar)


**J07-2 · Um ano depois, só 26,7% dos estrangeiros seguem na liga, contra 50,9% dos brasileiros**  *[indício]*

- O que vimos: Recortados igual, o estrangeiro não estreia jogando mais que o brasileiro: 16,6% contra 17,5% dos minutos. Isso depende de contar 2022, quando a liga inteira era estreante; sem ele a vantagem do estrangeiro volta. Seguir na liga é reaparecer na Série B, não ficar no clube.
- Para o Santa Cruz: O estrangeiro não chega com vantagem de minuto: recortado por quem entrou no clube naquele ano, ele estreia com fatia igual ou menor que a do brasileiro, e quem esperava que ele viesse para jogar mais está comprando uma diferença que não existe. O que pesa na conta é a saída — 1 em cada 4 segue na Série B no ano seguinte, contra 1 em cada 2 do brasileiro —, então contrato, janela de saída e custo de reposição têm de ser montados para uma temporada. Ressalva que muda o uso: sair da Série B inclui quem subiu para a Série A ou foi para fora do país, então parte dessa rotatividade é venda, não fracasso, e esta parte não sabe separar as duas.
- n: Estreia, os dois lados restritos a quem entrou no clube naquele ano: 113 estrangeiros contra 1.064 brasileiros (2022-2025). Sem 2022: 87 estrangeiros. Ano seguinte: 180 casos de estrangeiro contra 2.813 de brasileiro.
- Prova: J07_numeros_novos.json, pri_est_nc e perm_est; J07_resumo.json, permanencia (cruzamento antigo, a regerar)


**J07-3 · Quase todo estrangeiro da Série B é sul-americano, 155 dos 180 casos**  *[indício]*

- O que vimos: Sete em cada dez casos: Argentina 42, Colômbia 35, Uruguai 34, Paraguai 20. Por jogador, não por temporada, a Colômbia lidera, e a base traz a nacionalidade, não a liga. No mesmo cruzamento, brasileiro com segundo passaporte (187) quase empata com estrangeiro de fato (180).
- Para o Santa Cruz: Onde procurar é a vizinhança: Argentina, Colômbia, Uruguai e Paraguai. São essas as quatro ligas de que J08 precisa primeiro do fator de conversão, e é delas que J09 monta a lista — e, para montar lista de alvo, a contagem que vale é a de pessoas (146, com a Colômbia na frente), não a de temporadas. Ressalva que muda o uso: a base tem a nacionalidade, não a liga de onde o jogador veio — um argentino pode ter chegado de clube brasileiro —, então isso diz de que país é o mercado, não de que campeonato se compra.
- n: 180 casos de estrangeiro — 179 jogador-temporadas distintas, 146 jogadores — em 2022-2025, com 94,7% das linhas da janela cobertas por nacionalidade (Sobe 94,0% · Meio 95,2% · Cai 94,1%).
- Prova: J07_numeros_novos.json, ordem_por_linha e ordem_por_pessoa; J07_resumo.json, origem_por_nacionalidade (cruzamento antigo, a regerar)


*Em aberto (J07):* Os números desta parte passaram a ser os que o scripts/J07.py grava (decisão de 20/09: onde o publicado divergia da saída do script, vale o script). O que continua pendente é o CONSERTO do cruzamento de nomes: o script precisa do módulo de identidade da §1.1, da ponte de clube nos dois sentidos e da coluna fronteira de A01_clube_temporada.csv, que ele nunca leu — o laço que procura faixa=='Trave' cai vazio em silêncio, porque trave é coluna separada. Enquanto isso não for feito, os 180 registros de estrangeiro são o que o cruzamento atual enxerga, não necessariamente o que existiu.


### J08 — Conversão de ligas: como os números de outra liga se traduzem para a Série B

*Pergunta:* Como os números de um jogador de outra liga se traduzem para a Série B?


**J08-1 · Nenhum país de fora chega ao mínimo de casos com destino na Série B**  *[indício · **negativa**]*

- O que vimos: Das 310 chegadas à Série B, a maior origem de fora do Brasil tem 8 casos, e o mínimo para dar número a um país são 10. Mesmo somando Série A e Série C ao destino, o degrau muda de tamanho conforme o corte e não fecha número para país nenhum.
- Para o Santa Cruz: Nenhum alvo estrangeiro entra na lista com um número de conversão fechado ao lado. O J09 pode usar o degrau do grupo de países como ordem de grandeza apenas no volume, onde ele fica do mesmo lado nos dois cortes (grupo abaixo −3,2 e −5,2 lugares em cada 100; grupo acima +3,3 e +3,4); na eficiência ele troca de sinal entre os cortes (grupo pareado −1,3 e +1,9; grupo abaixo −0,3 e +2,2) e ali não serve nem como ordem de grandeza. O que resolve isto é coleta de mais temporadas das ligas de origem, não outra conta.
- n: 737 mudanças de liga, 591 jogadores; 249 delas com origem estrangeira, em 45 países; 310 chegadas à Série B, nenhuma origem estrangeira com mais de 8 casos
- Prova: fatores_liga.csv; J08_testes.csv (coluna corte: principal e so_900_no_destino); J08_resumo.json (chaves nulo_do_garimpo, poder e porta_de_coorte); J08.md, seção Prova; _robustez_19_09.md, seção J08


**J08-2 · O degrau da divisão de origem muda de tamanho conforme quem entra na conta**  *[indício · **negativa**]*

- O que vimos: Descontando onde o jogador já estava na própria liga, a perda de quem sobe da Série C some e o ganho de quem desce da Série A fica em 3.4 lugares em cada cem. Só com quem mudou de clube e jogou 900 minutos dos dois lados, o ganho cai para 1.0 e as duas margens passam pelo zero.
- Para o Santa Cruz: Nenhum número de conversão entre divisões brasileiras vai para a tela nesta parte. Em J06 e J09, jogador de Série A e jogador de Série C entram na mesma régua sem bônus nem desconto de divisão: o que separa os dois é onde cada um estava dentro da própria liga. Quem contratar da Série C pagando o desconto da divisão está pagando por uma queda que a base não sustenta, e quem pagar prêmio por Série A está pagando por 3.4 lugares em cada 100 que encolhem para 1.0 quando se conta só quem mudou mesmo de clube.
- n: 737 linhas no corte principal (Brasil A 156 casos, Brasil C 92), 238 no corte estrito com 228 jogadores; 189 das 737 não são transferência e 203 estão abaixo de 900 minutos na origem
- Prova: J08_base.csv (colunas clube_antes, clube_depois, menos_900_na_origem); fatores_liga.csv; J08_testes.csv (coluna corte, linhas de Brasil A e Brasil C); J08.md, seção Prova; _robustez_19_09.md, seção J08


**J08-3 · Quem chega de outra liga guarda menos da metade do destaque que tinha**  *[indício]*

- O que vimos: Em 737 mudanças de liga, quem era o 10º melhor de cada cem na posição aparece por volta do 33º no ano seguinte, e isso vale igual para quem vem de dentro e de fora do Brasil. No acerto o encolhimento é maior: o 10º vai para perto do 42º.
- Para o Santa Cruz: O maior risco de contratar de fora não é a liga: é comprar destaque que não viaja. O J09 não aplica um número de país como multiplicador — monta a conta inteira, com o lugar do jogador na liga dele, a idade e o degrau (fraco) do grupo de países, e prefere o alvo que continua bom depois do encolhimento. E como o encolhimento é o mesmo para todos, comparar dois estrangeiros entre si continua valendo mesmo sem número confiável de país.
- n: 737 mudanças de liga, 591 jogadores distintos; 222 chegadas até 2024 preveem as 515 de 2025 e 2026
- Prova: J08_resumo.json (chaves o_encolhimento_confere_com_tres_contas_independentes, sensibilidade_do_encolhimento e porta_de_coorte); J08_testes.csv (coluna corte); J08.md, seção Prova; _robustez_19_09.md, seção J08


*Em aberto (J08):* 1) O recálculo que as três conclusões pedem, e que o próprio em_aberto da parte já pedia: virar corte de script o corte estrito (só transferência real + 900 minutos dos dois lados, 238 linhas) e o de 900 minutos na ORIGEM (534), hoje feitos à mão (J08.md:233 admite), rodar o sorteio dentro de CADA corte com a mesma regra (alvo = os países que chegam ao piso naquele corte) e emitir a linha de base de quem só chutasse a média. Enquanto isso não rodar, J08-1 e J08-2 não vão para a tela com número fechado. 2) A remarcação ficou incompleta por falta de fonte: J08 não tem J08_numeros_novos.json, então os números que a v2 trouxe dos cortes calados continuam escritos no texto, sem marcador, e estão listados aqui com o de_onde de cada um — 10,1 e o IC −14,3 a −5,2 (Colômbia A, volume, corte so_900_no_destino: J08_testes.csv, fator_pp −10,05); o sorteio de cerca de 8 nesse corte (varredura de robustez, três sementes: 7,69 / 8,18 / 8,34); 9,5 e 8,3 (Uruguai no corte estrito e o p95 de 4 países: J08.md:265-269); 10,0 com 16 casos (J08.md:265-269); 2,5 a 9,5 (Uruguai nos cinco cortes: J08_testes.csv, de −2,52 em com_identidade_incoerente a −9,51 no estrito); 2,9 a 3,6 e 2,88 / 3,38 / 3,43 / 3,58 (Brasil A, volume, os quatro cortes do J08_testes.csv); os degraus de grupo −3,2, −5,2, +3,3, +3,4, −1,3, +1,9, −0,3 e +2,2 (J08_testes.csv, alvo FAMILIA, unidades FAIXA ABAIXO/ACIMA/PAREADO nos cortes principal e so_900_no_destino); −0,39 (coeficiente de Brasil C no modelo pareado); 0,40 a 0,47 e o corte estrito 0,46 / 0,25 (quanto o jogador guarda; J08.md e J08_resumo.json). O recálculo do item 1 é o que grava esses números num J08_numeros.json e fecha a remarcação. 3) Quatro valores do campo numeros foram corrigidos agora, conforme a v2, e conferidos por mim na base: n_para_serieb 321 → 310 e maior_estrangeira_serieb "Portugal A" → "Colômbia A e Uruguai" (321 e Portugal A eram contagem das 782 linhas, e a mesma frase cita o corte principal de 737: ali são 310 chegadas, Colômbia A e Uruguai com 8 e Portugal A com 7); acerto_efic 0,67 → 0,66 (o script dá 0,655); lugar_depois_efic 43 → 42 (a conta sem o termo de idade). 4) b_min (−0,60) e b_max (−0,50) continuam no campo numeros mas nenhum texto os cita mais: esse intervalo só fecha somando dois cortes que o script não roda. O recálculo deve regravá-los a partir dos quatro cortes do script (−0,598 a −0,526) ou removê-los. 5) Lacuna de dado, não de escrita: a porta temporal da §6.4 exige o indicador jogo a jogo e nenhuma liga de origem tem linha por rodada no repositório (o painel do Wyscout é fechado por temporada). Sem coleta por rodada nas ligas de origem, nenhuma conclusão do J08 pode chegar a firme.


### J09 — Alvos no exterior: quatro passam a ficha na origem, nenhum sobrevive ao desconto, e o gol segue sem nome

*Pergunta:* Quais estrangeiros atendem o perfil, depois do ajuste de liga?


**J09-1 · A rodagem na liga de origem não prevê os minutos do primeiro ano**  *[indício]*

- O que vimos: Das 79 chegadas do exterior à Série B, quem já vinha jogando muito na liga de origem fez 1.307 minutos no primeiro ano contra 1.073 de quem não vinha. A direção existe, o teste não a sustenta, e o intervalo passa pelo zero.
- Para o Santa Cruz: A rodagem continua sendo a porta de entrada da lista de fora, mas como CRITÉRIO PRÁTICO de triagem e não como achado medido — a diferença tem de ser dita, porque até 21/09 esta conclusão era citada na tela como a prova do filtro. Quem não joga na liga dele não é alvo: isso é regra da casa, e agora está sozinho. O que este número faz é marcar o tamanho do que se pode prometer: 234 minutos de diferença, 2,6 jogos, com o intervalo passando pelo zero. Não prometa titularidade a ninguém por causa da rodagem na origem.
- n: 79 chegadas do exterior à Série B em 2023 a 2026, 48 com minutagem alta na origem contra 31 sem; 28 testes entraram na tabela e 112 recortes por setor ficaram fora por não chegar a 8 de cada lado
- Prova: J09.md; J09_testes.csv (grupo minutagem_alta, setor Todos); J09_backtest.csv; J09_resumo.json


**J09-2 · Quatro nomes passam a ficha na origem, e nenhum sobrevive ao desconto**  *[indício · **negativa**]*

- O que vimos: 295 volantes e 307 extremos de fora jogam muito e sempre na liga deles. Pela leitura da ORIGEM, 2 volantes e 2 extremos atendem as 6 exigências ao mesmo tempo. Pela leitura AJUSTADA, que põe o percentil na escala da Série B, passam 0 e 0.
- Para o Santa Cruz: São 4 nomes, e o rótulo é `rastrear`, não `alvo`: nenhum deles sobrevive quando o percentil é convertido para a escala da Série B, e 1 vem de liga com fator forte — os outros três vêm de fator fraco, que é palpite mais frouxo. Nenhum é sul-americano: saem de Portugal, Romênia, Polônia e Eslováquia. Use para começar conversa, com vídeo e olho por cima, e não para fechar contratação.
- n: 3.572 elegíveis com dado em 39 das 62 ligas lidas; 295 volantes e 307 extremos nas posições prioritárias, dos quais 248 e 244 com linha física
- Prova: J09.md; J09_resumo.json (chave por_posicao); J09_base.csv; J09_rastreio.csv; J09_ligas.csv


**J09-3 · No gol a base não tem como apontar um nome**  *[indício · **negativa**]*

- O que vimos: Da ficha de goleiro sobram 2 exigências, as duas de passe, e a repetição na liga de origem não dá para conferir. Decida por olho e vídeo. 99 dos 584 passam esses dois números, e 44 deles têm contrato vencendo até 2027-06-30.
- Para o Santa Cruz: O gol é onde a Série B oferece menos — 1 livre com rodagem, em J06 — e é exatamente onde o estudo não ajuda. A decisão terá de ser tomada por olho e vídeo. Não peça outra conta: faltam as três pernas ao mesmo tempo e as três são de coleta, não de método. A contagem fica de pé e vale como mapa de onde procurar: 99 dos 584 passam os dois números de passe e 44 desses têm contrato vencendo na janela.
- n: 854 goleiros na base, 585 com minutagem alta e 18 com linha física, em 39 ligas
- Prova: J09.md (seção O goleiro); J09_resumo.json (por_posicao.Goleiro); J09_base.csv (colunas regularidade_verificavel e fisico_rastreado); J05_perfil.csv


*Em aberto (J09):* O ponteiro do físico: J05 e J06 marcaram o requisito físico do alvo estrangeiro como inverificável apoiados numa frase de J08 que vale para J08 e não para eles — o dado está em dados/jogadores.json, 36 ligas, e esta parte o usou com ponte medida em 99,0%. Quem refizer J05 ou J06 deve conferir. O teto de nível da J09-1, que pela régua mecânica seria provável e saiu indício por teto declarado. E três lacunas nomeáveis: 31 das 79 chegadas do exterior não têm foto na liga de origem e ficaram fora do backtest; o backtest testa 4 dos 20 pisos, porque não há físico histórico; e a regularidade na origem não pôde ser testada, com 8 aprovados contra um mínimo detectável de 1,11.


---

# 6. O QUE SABEMOS DO FÍSICO (oito partes, num lugar só)

Oito partes mediram corrida — quatro no time e quatro no jogador — e nenhuma responde sozinha se o físico importa. Cada bloco leva o selo da conclusão que o sustenta: juntar quatro indícios não faz uma conclusão firme.

### F1 · Correr mais não separa quem sobe — nem o time, nem o jogador  *[indício]*

O time mediano de quem subiu percorreu 9644 metros por jogo contra 9598 do meio, e 669 em alta intensidade contra 652: nenhum dos 12 indicadores físicos declarados separou quem sobe nos dois cortes. Entre times de nível TÉCNICO parecido também não: na faixa alta quem subiu correu 9614 metros contra 9620 do meio. No jogador, 204 comparações em 17 medidas de corrida e 6 posições, e nenhuma sobrevive aos dois cortes.

*De A07 · A11 · J04 · A07-1*

### F2 · Onde o físico aparece é na linha de BAIXO  *[provável]*

A cada trinta minutos sem a bola, o time mediano dos rebaixados correu 91,1 metros em sprint contra 100,0 do meio — descontado o rodízio de elenco, é o único número físico que continua separando quem cai. E não é cansaço: já no 1º turno de 2025 os rebaixados corriam 618 metros em alta intensidade contra 690 do meio. No jogador, o lateral de quem caiu faz 3,16 arrancadas fortes por meia hora sem a bola contra 3,35 do meio, e passa nos dois cortes. Serve para reconhecer risco no elenco que já se tem, não para escolher alvo.

*De A07 · A10 · J11 · A07-2*

### F3 · A única posição com sinal próprio é o volante  *[provável]*

O volante de quem sobe faz 3,23 corridas fortes por meia hora de posse contra 1,88 do meio, e cobre 12,44 metros por corrida contra 11,30 — 21 contra 50. É volume e alcance, não destino: das corridas PARA A ÁREA, 0 de 18 testes passam. O J04-2 já tinha achado pico de velocidade no volante (27,9 km/h contra 27,5) e em nenhuma outra posição, mas só num dos recortes.

*De J04 · J10 · J10-2*

### F4 · O que mais separa não é o nível do onze, é a DESIGUALDADE dentro dele  *[indício]*

O onze médio de quem sobe está no percentil 43,2 de corrida e o do meio no 44,8 — igual. A distância entre o melhor e o último do onze dá +0,80 com todos os times e +0,81 sem os colados na linha, o mesmo efeito nos dois cortes. Ele falha por TAMANHO, não por ausência: o mínimo que o desenho enxerga sobe de 0,82 para 1,14 quando o recorte encolhe. É a fila de coleta, não pista morta — e ter o jogador mais rápido do campeonato não é a resposta (+0,57, que não passa na correção).

*De A20 · A20-2*

### F5 · Correr com destino vira ação; correr muito, não  *[provável]*

O terço que mais corre PARA DENTRO DA ÁREA faz 23,4 entradas na área por jogo contra 20,4, e cria 1,3 de gol esperado contra 1,1. O terço que mais percorre METROS faz 21,9 entradas contra 21,6, e cria o mesmo xG. Correr sem a bola sobe a linha de pressão — o adversário dá 9,3 passes por ação defensiva contra 11,2 —, mas não aparece em bola recuperada (77,9 contra 77,6).

*De A11 · A11-1*

### F6 · Returno e semana de três jogos: não dá para montar elenco por isso  *[indício]*

Do 1º para o 2º turno o mesmo jogador perde 74 metros por noventa minutos, 0,8% do que corria — e a perda não separa quem subiu do meio. No jogo com menos de quatro dias de descanso, as duas temporadas medidas dizem o contrário uma da outra: em 2025 o jogador correu igual ou um pouco mais, em 2026 corre 174 metros por 90 a menos — e o ponto não cai (1,37 no jogo curto contra 1,36 no normal).

*De A10 · A10-2*

### F7 · Um quinto do jeito de correr é do clube, não do jogador  *[indício]*

O clube em que o jogador estava explica 20,8% de quanto ele corre sem a bola em relação a com a bola, e a razão anda +0,28 com a posse do time. Nas outras medidas o clube explica de 6,4% a 13,8%. Número físico de jogador carrega o time de onde ele veio: comparar dois candidatos de clubes diferentes pela corrida bruta compara também os dois clubes.

*De J11 · J11-3*

### F8 · O que isso muda na ficha de contratação  *[indício]*

Filtro eliminatório, um só: minutagem alta e regular, com o corte mudando por posição — 64,7% no goleiro contra 34,2% no atacante, o que devolve 215 jogador-temporadas em quatro anos. Físico entra como DESEMPATE, e só onde foi medido: corrida forte e corrida longa no volante, e arrancada sem a bola do lateral como sinal de alerta para descartar. E o perfil físico que a tela já mostrava não serve inteiro: dos 18 números por setor, 9 passam na correção para muitos testes, e na zaga e no lateral não passa nenhum dos 4.

*De J05 · J10 · J11 · J05-3*


### Os limites desta seção

- **O dado físico é o mais escasso do estudo.** O SkillCorner não rastreia goleiro, e o rastreamento cobre 2022 a 2025 — quatro temporadas, 16 promovidos contra 48 do meio. É desenho que só enxerga vantagem grande.
- **Duas partes falharam por falta de tamanho, não por ausência de efeito.** A desigualdade do elenco (A20) e o extremo (J11). Mais temporadas rastreadas destravam as duas, e é a compra de dado que mais renderia depois do minuto do gol.
- **Físico é o assunto em que a diferença entre "não separa" e "não importa" mais custa caro.** Nenhuma conclusão desta seção diz que preparação física não importa. Elas dizem que, nesta base, correr mais não é o que distingue quem sobe — e que pagar prêmio por volume de corrida não tem número que o sustente.


---

# 7. AS LISTAS DE JOGADORES, POR POSIÇÃO (três mercados)

**A regra da lista** (`J06_ordenacao.json`, decidida em 2026-09-21): Minutagem ELIMINA, o resto ORDENA. Só entra quem tem minutagem alta e repetida — o único requisito que a base sustenta por posição (J05-3) — e a ordem é o eixo da qualidade da chance, com físico e duelo como desempate. NÃO é probabilidade de dar certo: o perfil descreve quem subiu e não promete quem vai subir (J05-1), e o backtest da §8.6 não autorizou publicar nome como alvo.

**O teto do ajuste de liga (J08):** volume 76,4, eficiência 66,1. Quem vem de fora tem o percentil convertido para a escala da Série B e NÃO pode passar desse teto, enquanto a Série B chega a 100 — o topo de cada posição é da Série B por construção do ajuste, não por mérito. Por isso cada linha de fora traz o percentil de origem e o desconto.

**O corte:** minutagem alta e repetida (o selo `roda`) — na Série B, 175 saíram e 65 ficaram. Nos mercados de fora a rodagem na liga de origem elimina como **critério prático da casa**, não como achado medido: o J09-1 que a sustentava caiu em 22/09 quando a chave do painel temporal foi consertada.


## Lista — Série B (65 nomes)

O mercado de foco, inteiro — é aqui que a ficha foi medida.


**Goleiro** — 4 nomes · ficha de Goleiro, 2 critérios · Série B 4

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Paulo Vítor | Série B | Atlético-GO | 37 | 72,6 |  | 63,1 | 1/2 | vencendo |  |
| 2 | Victor Souza | Série B | Botafogo-SP | 34 | 70,2 |  | 63,1 | 1/2 | — |  |
| 3 | Tadeu | Série B | Goiás | 34 | 64,3 |  | 77,4 | 1/2 | — |  |
| 4 | Jordi | Série B | Novorizontino | 33 | 48,8 |  | 63,1 | 0/2 | — |  |

**Zaga** — 11 nomes · ficha de Zaga, 4 critérios · Série B 11

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | César Martins | Série B | Criciúma | 33 | 99 |  | 54,8 | 2/4 | vencendo |  |
| 2 | Luciano Castán | Série B | Criciúma | 36 | 89,4 |  | 40,7 | 2/4 | vencendo |  |
| 3 | Ricardo Silva | Série B | América-MG | 34 | 73,1 |  | 65,2 | 2/4 | vencendo |  |
| 4 | Tiago Pagnussat | Série B | Vila Nova | 36 | 70,7 |  | 78 | 3/4 | vencendo |  |
| 5 | Vilar | Série B | Botafogo-SP | 26 | 67,3 |  | 64,6 | 2/4 | vencendo |  |
| 6 | Rodrigo | Série B | Criciúma | 39 | 57,7 |  | 67 | 2/4 | — |  |
| 7 | Messias | Série B | Juventude | 31 | 45,2 |  | 78,9 | 3/4 | — |  |
| 8 | Lucas Ribeiro | Série B | Goiás | 27 | 43,2 |  | 60,5 | 3/4 | vencendo |  |

*… e mais 3 nesta posição, na aba.*

**Lateral esquerdo** — 5 nomes · ficha de Lateral, 4 critérios · Série B 5

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Sánchez | Série B | Ceará | 30 | 82,3 |  | 41,6 | 1/4 | vencendo |  |
| 2 | Felipinho | Série B | Sport | 29 | 81,8 |  | 73,3 | 3/4 | — |  |
| 3 | Patrick Brey | Série B | Botafogo-SP | 29 | 63,6 |  | 29,8 | 1/4 | vencendo |  |
| 4 | Pará | Série B | São Bernardo | 31 | 53,1 |  | 34,9 | 1/4 | — |  |
| 5 | Zeca | Série B | Athletic | 32 | 41,6 |  | 8,4 | 1/4 | vencendo |  |

**Lateral direito** — 4 nomes · ficha de Lateral, 4 critérios · Série B 4

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Willean Lepo | Série B | Criciúma | 29 | 95,3 |  | 46,1 | 1/4 | vencendo |  |
| 2 | Rodrigo Soares | Série B | Goiás | 33 | 79,2 |  | 39,1 | 2/4 | vencendo |  |
| 3 | Bryan | Série B | Ceará | 30 | 45,3 |  | 40,1 | 2/2 | — |  |
| 4 | Hereda | Série B | CRB | 27 | 40,1 |  | 54,6 | 3/4 | vencendo |  |

**Volante** — 7 nomes · ficha de Volante, 6 critérios · Série B 7

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Luís Oyama | Série B | Novorizontino | 29 | 77,2 |  | 37,5 | 2/6 | — |  |
| 2 | João Vieira | Série B | Vila Nova | 28 | 61,4 |  | 48,3 | 3/6 | — |  |
| 3 | Filipe Machado | Série B | Goiás | 30 | 47,8 |  | 59,1 | 4/6 | vencendo |  |
| 4 | Léo Naldi | Série B | Novorizontino | 25 | 43,1 |  | 44,9 | 1/6 | vencendo |  |
| 5 | Foguinho | Série B | São Bernardo | 34 | 42 |  | 34,1 | 2/6 | vencendo |  |
| 6 | Zé Ricardo | Série B | Avaí | 30 | 38,6 |  | 42,6 | 1/6 | vencendo |  |
| 7 | Matheus Trindade | Série B | Operário-PR | 30 | 9,1 |  | 53,4 | 1/6 | vencendo |  |

**Médio** — 9 nomes · ficha de Meia, 5 critérios · Série B 9

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Crystopher | Série B | CRB | 28 | 72,7 |  | 36,5 | 2/5 | vencendo |  |
| 2 | Danielzinho | Série B | CRB | 30 | 70,8 |  | 51,6 | 3/5 | vencendo |  |
| 3 | Pedro Castro | Série B | CRB | 33 | 59 |  | 48,9 | 3/5 | vencendo |  |
| 4 | Guilherme Lobo | Série B | Criciúma | 26 | 58,5 |  | 58,7 | 3/5 | — |  |
| 5 | Rafael Gava | Série B | Botafogo-SP | 33 | 54,2 |  | 38 | 2/5 | vencendo |  |
| 6 | Everton Morelli | Série B | Botafogo-SP | 28 | 50,9 |  | 49,2 | 0/5 | — |  |
| 7 | André Lima | Série B | Ponte Preta | 26 | 45,8 |  | 42,3 | 2/5 | vencendo |  |
| 8 | Kauan | Série B | Athletic | 21 | 42,5 |  | 42,9 | 2/5 | — |  |

*… e mais 1 nesta posição, na aba.*

**Meia ofensivo** — 10 nomes · ficha de Meia, 5 critérios · Série B 10

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Janderson | Série B | Vila Nova | 27 | 76,4 |  | 47,6 | 1/5 | — |  |
| 2 | Bruno José | Série B | Atlético-GO | 28 | 70,2 |  | 65,3 | 2/5 | vencendo |  |
| 3 | Élvis | Série B | Ponte Preta | 35 | 56,6 |  | 25,1 | 1/5 | vencendo |  |
| 4 | Chrystian Barletta | Série B | Sport | 25 | 56,2 |  | 65,1 | 3/5 | — |  |
| 5 | Vinícius Paiva | Série B | Novorizontino | 25 | 56,1 |  | 71,4 | 3/5 | vencendo |  |
| 6 | Gegé | Série B | Goiás | 32 | 55,6 |  | 36,6 | 2/5 | vencendo |  |
| 7 | Marquinhos Gabriel | Série B | Vila Nova | 36 | 51 |  | 37,9 | 2/5 | — |  |
| 8 | Lourenço | Série B | Goiás | 29 | 51 |  | 20,8 | 2/5 | vencendo |  |

*… e mais 2 nesta posição, na aba.*

**Extremo** — 4 nomes · ficha de Extremo, 6 critérios · Série B 4

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Dadá Belmonte | Série B | CRB | 29 | 86,3 |  | 44,3 | 2/6 | vencendo |  |
| 2 | Paulinho Moccelin | Série B | Londrina | 32 | 54,6 |  | 27,3 | 1/6 | vencendo |  |
| 3 | Rómulo Otero ⚑ | Série B | Criciúma | 33 | 40,9 |  | 54,9 | 4/6 | vencendo |  |
| 4 | Aylon | Série B | Operário-PR | 34 | 27,3 |  | 51,4 | 2/6 | vencendo |  |

**Atacante** — 11 nomes · ficha de Atacante, 4 critérios · Série B 11

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Robson | Série B | Novorizontino | 35 | 90,4 |  | 63,4 | 2/4 | vencendo |  |
| 2 | Willian | Série B | América-MG | 39 | 78,8 |  | 26,8 | 1/4 | vencendo |  |
| 3 | William Pottker | Série B | Londrina | 32 | 72,1 |  | 61,6 | 4/4 | vencendo |  |
| 4 | Rodrigo Rodrigues | Série B | Cuiabá | 26 | 67,3 |  | 32,7 | 2/2 | vencendo |  |
| 5 | Mikael | Série B | CRB | 27 | 64,5 |  | 71 | 2/4 | — |  |
| 6 | Alisson Safira | Série B | Juventude | 31 | 50 |  | 45,9 | 0/4 | — |  |
| 7 | Hygor | Série B | Botafogo-SP | 34 | 44,2 |  | 73,8 | 3/4 | vencendo |  |
| 8 | Anselmo Ramon | Série B | Goiás | 38 | 44,2 |  | 49,8 | 2/4 | vencendo |  |

*… e mais 3 nesta posição, na aba.*

## Lista — Demais campeonatos sul-americanos (156 nomes de 746 com rodagem)

Série A, Argentina, Uruguai, Colômbia, Chile, Paraguai, Peru, Equador, Bolívia e Venezuela. Todo jogador dessas ligas entra, seja qual for o passaporte. Teto de 10 por mercado, por posição.


**Zaga** — 20 nomes · ficha de Zaga, 4 critérios · Sul-americano 10 · Série A 10

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | L. Martínez Quarta ⚑ (Argentina) | Sul-americano | River Plate · Argentina A | 30 | 73,3 | 94→-20,4 | 55,7 | 1/4 | — |  |
| 2 | L. Di Lollo ⚑ (Argentina) | Sul-americano | Boca Juniors · Argentina A | 22 | 73 | 92→-19,2 | 47,7 | 2/4 | — |  |
| 3 | J. Galván ⚑ (Argentina) | Sul-americano | Instituto · Argentina A | 34 | 71,4 | 90→-18,7 | 36,1 | 2/4 | vencendo |  |
| 4 | Alexander Barboza ⚑ (Argentina) | Série A | Palmeiras · Brasil A | 31 | 71,3 | 93→-21,9 | 43,1 | 1/4 | — |  |
| 5 | F. Alarcón ⚑ (Argentina) | Sul-americano | Instituto · Argentina A | 32 | 70,7 | 88→-17,4 | 36,3 | 1/4 | vencendo |  |
| 6 | C. Izquierdoz ⚑ (Argentina) | Sul-americano | Lanús · Argentina A | 37 | 69,8 | 86→-16,1 | 48,9 | 2/4 | — |  |
| 7 | L. Quiñónez ⚑ (Ecuador) | Sul-americano | LDU Quito · Equador A | 33 | 69,3 | 96→-26,5 | 46,3 | 1/4 | — |  |
| 8 | G. Vargas ⚑ (Paraguay) | Sul-americano | Olimpia · Paraguai | 24 | 67,1 | 83→-16,2 | 62,9 | 3/4 | vencendo |  |

*… e mais 12 nesta posição, na aba.*

**Lateral esquerdo** — 20 nomes · ficha de Lateral, 4 critérios · Sul-americano 10 · Série A 10

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | M. Del Blanco ⚑ (Argentina) | Sul-americano | Unión Santa Fe · Argentina A | 22 | 74,4 | 95→-20,8 | 54 | 2/4 | — |  |
| 2 | J. Torrico ⚑ (Bolivia) | Sul-americano | Aurora · Bolivia | 39 | 70,2 | 97→-26,7 | 48,5 | 1/2 | vencendo |  |
| 3 | Juninho Capixaba (Brazil) | Série A | Red Bull Bragantino · Brasil A | 29 | 69 | 88→-19,3 | 54,2 | 1/4 | — |  |
| 4 | Cuiabano (Brazil) | Série A | Vasco da Gama · Brasil A | 23 | 66 | 80→-14,3 | 33 | 1/4 | — |  |
| 5 | Matheus Bidu (Brazil) | Série A | Corinthians · Brasil A | 27 | 65,8 | 81→-15 | 57,6 | 3/4 | — |  |
| 6 | M. Martinich ⚑ (Argentina) | Sul-americano | Cienciano · Peru | 30 | 65,8 | 82→-16 | 42 | 1/4 | — | ⚠ |
| 7 | Reinaldo (Brazil) | Série A | Mirassol · Brasil A | 36 | 65,5 | 80→-14,8 | 40,2 | 0/4 | — |  |
| 8 | Guilherme Arana (Brazil) | Série A | Fluminense · Brasil A | 29 | 65,2 | 80→-14,6 | 34,5 | 2/4 | — |  |

*… e mais 12 nesta posição, na aba.*

**Lateral direito** — 20 nomes · ficha de Lateral, 4 critérios · Sul-americano 10 · Série A 10

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | G. Cerato ⚑ (Argentina) | Sul-americano | Instituto · Argentina A | 28 | 74,2 | 95→-21 | 36,3 | 0/4 | — |  |
| 2 | G. Montiel ⚑ (Argentina) | Sul-americano | River Plate · Argentina A | 29 | 71,9 | 90→-18,6 | 53,9 | 3/4 | — |  |
| 3 | G. Cuellar ⚑ (Bolivia) | Sul-americano | Universitario de Vinto · Bolivia | 27 | 70 | 97→-26,9 | 52,9 | 1/2 | — |  |
| 4 | D. Romero ⚑ (Ecuador) | Sul-americano | Independiente del Valle · Equador A | 25 | 67,8 | 92→-23,9 | 54,8 | 2/4 | — |  |
| 5 | E. Mancuso ⚑ (Argentina) | Sul-americano | Estudiantes · Argentina A | 27 | 65,7 | 77→-10,9 | 28,6 | 2/4 | — |  |
| 6 | Cristian Pavón ⚑ (Argentina) | Série A | Grêmio · Brasil A | 30 | 64,2 | 78→-14 | 68,8 | 4/4 | — |  |
| 7 | J. Quintero ⚑ (Ecuador) | Sul-americano | LDU Quito · Equador A | 36 | 62,7 | 81→-18,3 | 45,4 | 1/4 | — |  |
| 8 | L. Lozano ⚑ (Uruguay) | Sul-americano | Boca Juniors · Argentina A | 27 | 62 | 68→-6,2 | 45,1 | 3/4 | — |  |

*… e mais 12 nesta posição, na aba.*

**Volante** — 17 nomes · ficha de Volante, 6 critérios · Sul-americano 10 · Série A 7

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | S. Vasquez ⚑ (Ecuador) | Sul-americano | Orense · Equador A | 22 | 70,2 | 97→-26,7 | 59,8 | 3/6 | — |  |
| 2 | Gerson (Brazil) | Série A | Cruzeiro · Brasil A | 29 | 67,5 | 85→-17,1 | 69,5 | 4/6 | — |  |
| 3 | R. Aliendro ⚑ (Argentina) | Sul-americano | Vélez Sarsfield · Argentina A | 35 | 65,8 | 78→-12,5 | 67,7 | 3/6 | — |  |
| 4 | Martinelli (Brazil) | Série A | Fluminense · Brasil A | 24 | 63,5 | 75→-11,5 | 45,5 | 2/6 | — |  |
| 5 | Hércules (Brazil) | Série A | Fluminense · Brasil A | 25 | 61,8 | 71→-9,4 | 53,5 | 2/6 | — |  |
| 6 | A. Medina ⚑ (Argentina) | Sul-americano | Lanús · Argentina A | 19 | 61,7 | 63→-1,6 | 58,5 | 3/6 | — |  |
| 7 | F. Fattori ⚑ (Argentina) | Sul-americano | Talleres Córdoba · Argentina A | 34 | 61,5 | 68→-6,8 | 41,5 | 2/6 | — |  |
| 8 | I. Marcone ⚑ (Argentina) | Sul-americano | Independiente · Argentina A | 36 | 58,9 | 62→-2,7 | 31,1 | 0/6 | vencendo |  |

*… e mais 9 nesta posição, na aba.*

**Médio** — 20 nomes · ficha de Meia, 5 critérios · Série A 10 · Sul-americano 10

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Éverton Ribeiro (Brazil) | Série A | Bahia · Brasil A | 37 | 65,5 | 80→-14,9 | 55,9 | 3/5 | — |  |
| 2 | G. Lódico ⚑ (Argentina) | Sul-americano | Racing Club · Argentina A | 28 | 65,3 | 76→-10,4 | 46 | 4/5 | — |  |
| 3 | F. Jara ⚑ (Paraguay) | Sul-americano | Nacional Asunción · Paraguai | 23 | 64,6 | 78→-12,9 | 68,9 | 5/5 | vencendo |  |
| 4 | A. Manzur ⚑ (Argentina) | Sul-americano | Club Libertad · Paraguai | 25 | 63 | 74→-11,2 | 31,4 | 2/5 | vencendo |  |
| 5 | V. Malcorra ⚑ (Argentina) | Sul-americano | Unión Santa Fe · Argentina A | 39 | 61,5 | 66→-4,7 | 52 | 1/5 | vencendo |  |
| 6 | L. Ursino ⚑ (Argentina) | Sul-americano | Guabirá · Bolivia | 37 | 60,7 | 77→-16 | 51,8 | 0/3 | vencendo |  |
| 7 | Marcos Antônio (Brazil) | Série A | São Paulo · Brasil A | 26 | 60,5 | 69→-8,3 | 26,3 | 2/5 | — |  |
| 8 | D. Bobadilla ⚑ (Paraguay) | Série A | São Paulo · Brasil A | 25 | 58,5 | 64→-5,1 | 46,3 | 2/5 | — |  |

*… e mais 12 nesta posição, na aba.*

**Meia ofensivo** — 20 nomes · ficha de Meia, 5 critérios · Sul-americano 10 · Série A 10

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | J. Campaz ⚑ (Colombia) | Sul-americano | Rosario Central · Argentina A | 26 | 71,5 | 89→-17,8 | 66,2 | 3/5 | vencendo |  |
| 2 | Á. Di María ⚑ (Argentina) | Sul-americano | Rosario Central · Argentina A | 38 | 68,7 | 82→-13,8 | 42,2 | 2/5 | vencendo |  |
| 3 | Giorgian de Arrascaeta ⚑ (Uruguay) | Série A | Flamengo · Brasil A | 32 | 66,8 | 84→-16,8 | 42,8 | 1/5 | — |  |
| 4 | Samuel Lino (Brazil) | Série A | Flamengo · Brasil A | 26 | 64,6 | 78→-13,6 | 59 | 3/5 | — |  |
| 5 | L. Mancinelli ⚑ (Argentina) | Sul-americano | Deportivo Cuenca · Equador A | 37 | 61,8 | 79→-17,3 | 69,2 | 3/5 | vencendo |  |
| 6 | E. Mejía ⚑ (Ecuador) | Sul-americano | Universidad Católica · Equador A | 26 | 61,2 | 78→-16,4 | 65,5 | 3/5 | — |  |
| 7 | I. Fernández ⚑ (Argentina) | Sul-americano | Gimnasia La Plata · Argentina A | 36 | 60,6 | 66→-5 | 55,2 | 3/5 | vencendo |  |
| 8 | Negueba (Brazil) | Série A | Mirassol · Brasil A | 26 | 60,5 | 69→-8,7 | 29,7 | 1/5 | — |  |

*… e mais 12 nesta posição, na aba.*

**Extremo** — 19 nomes · ficha de Extremo, 6 critérios · Sul-americano 10 · Série A 9

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | C. Domínguez ⚑ (Paraguay) | Sul-americano | Cerro Porteño · Paraguai | 31 | 69,2 | 89→-20 | 58,9 | 3/6 | — |  |
| 2 | J. Palacios ⚑ (Argentina) | Sul-americano | Unión Santa Fe · Argentina A | 27 | 69,1 | 84→-15 | 64,7 | 4/6 | vencendo |  |
| 3 | S. Solari ⚑ (Argentina) | Sul-americano | Racing Club · Argentina A | 28 | 69 | 84→-15,1 | 64 | 2/6 | — |  |
| 4 | A. Preciado ⚑ (Ecuador) | Sul-americano | Aucas · Equador A | 32 | 67,2 | 91→-24 | 30,3 | 2/6 | vencendo |  |
| 5 | E. Pata ⚑ (Ecuador) | Sul-americano | Independiente del Valle · Equador A | 22 | 66,4 | 88→-21,8 | 54,2 | 2/6 | — |  |
| 6 | T. Cuello ⚑ (Argentina) | Série A | Atlético Mineiro · Brasil A | 26 | 66,4 | 82→-15,8 | 50,5 | 1/6 | — |  |
| 7 | A. Gómez ⚑ (Colombia) | Série A | Vasco da Gama · Brasil A | 23 | 65,2 | 78→-13,3 | 53,7 | 2/6 | — |  |
| 8 | Á. Barreal ⚑ (Argentina) | Série A | Santos · Brasil A | 26 | 64,8 | 79→-13,8 | 45,9 | 1/6 | — |  |

*… e mais 11 nesta posição, na aba.*

**Atacante** — 20 nomes · ficha de Atacante, 4 critérios · Série A 10 · Sul-americano 10

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Neymar (Brazil) | Série A | Santos · Brasil A | 34 | 73,5 | 98→-24,6 | 36,8 | 1/4 | — |  |
| 2 | M. Merentiel ⚑ (Uruguay) | Sul-americano | Boca Juniors · Argentina A | 30 | 71,8 | 90→-18,6 | 39,7 | 2/4 | — |  |
| 3 | J. Carbonero ⚑ (Colombia) | Série A | Internacional · Brasil A | 27 | 70,1 | 90→-20,3 | 42,7 | 1/4 | — |  |
| 4 | M. Estigarribia ⚑ (Argentina) | Sul-americano | Unión Santa Fe · Argentina A | 31 | 69,1 | 84→-15,4 | 58,1 | 3/4 | — |  |
| 5 | E. Copetti ⚑ (Argentina) | Sul-americano | Rosario Central · Argentina A | 30 | 67,9 | 82→-14,3 | 76,3 | 4/4 | — |  |
| 6 | L. Melgarejo ⚑ (Paraguay) | Sul-americano | Club Libertad · Paraguai | 35 | 67 | 85→-17,6 | 49,6 | 2/4 | vencendo |  |
| 7 | F. Romero ⚑ (Paraguay) | Sul-americano | Sportivo Trinidense · Paraguai | 26 | 65,6 | 81→-15,2 | 49,3 | 3/4 | vencendo |  |
| 8 | Gabriel Barbosa (Brazil) | Série A | Santos · Brasil A | 29 | 63,9 | 77→-13 | 53,3 | 3/4 | — |  |

*… e mais 12 nesta posição, na aba.*

## Lista — Brasileiros e sul-americanos no resto do mundo (120 nomes de 410 com rodagem)

As demais ligas do planeta, e só quem tem passaporte brasileiro ou sul-americano — europeu jogando na Europa não é mercado deste clube e não aparece. Teto de 15 por mercado, por posição.


**Zaga** — 15 nomes · ficha de Zaga, 4 critérios · Exterior 15

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Renan (Brazil) | Exterior | Shabab Al Ahli Dubai · Emirados | 24 | 71,2 | 93→-21,6 | 57,8 | 2/4 | — | ⚠ |
| 2 | Fabiano (Brazil) | Exterior | Aris · Grecia | 34 | 69,2 | 90→-20,4 | 65,5 | 3/4 | vencendo |  |
| 3 | L. Cabrera ⚑ (Uruguay) | Exterior | Espanyol · Espanha A | 34 | 67,5 | 86→-18,7 | 54 | 2/4 | vencendo |  |
| 4 | R. Abascal ⚑ (Uruguay) | Exterior | Vitória Guimarães · Portugal A | 32 | 66,9 | 83→-15,8 | 46,5 | 1/4 | vencendo | ⚠ |
| 5 | J. Díaz ⚑ (Colombia) | Exterior | Minnesota United · EUA | 25 | 66,4 | 92→-25,8 | 55,3 | 1/4 | vencendo |  |
| 6 | C. Makoun ⚑ (Venezuela) | Exterior | Levski Sofia · Bulgaria | 26 | 66,2 | 96→-29,9 | 44 | 1/3 | vencendo |  |
| 7 | Roger Ibañez (Brazil) | Exterior | Al Ahli · Arabia Saudita A | 27 | 66 | 96→-29,6 | 62,1 | 2/4 | vencendo |  |
| 8 | Iago Maidana (Brazil) | Exterior | Henan · China | 30 | 65,8 | 82→-15,7 | 67,2 | 2/4 | vencendo |  |

*… e mais 7 nesta posição, na aba.*

**Lateral esquerdo** — 15 nomes · ficha de Lateral, 4 critérios · Exterior 15

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Mauro Júnior (Brazil) | Exterior | PSV · Holanda | 27 | 63,7 | 76→-12,8 | 54,8 | 3/4 | — |  |
| 2 | G. Olivera ⚑ (Uruguay) | Exterior | Muharraq · Bahrain | 25 | 62,5 | 88→-25 | 52,6 | 0/2 | — |  |
| 3 | Maicon (Brazil) | Exterior | Levski Sofia · Bulgaria | 26 | 61,8 | 86→-24,7 | 50,8 | 2/2 | vencendo |  |
| 4 | Paulo Otávio (Brazil) | Exterior | Al Sadd · Catar | 31 | 61,5 | 79→-17,1 | 73,5 | 3/4 | vencendo |  |
| 5 | L. Olaza ⚑ (Uruguay) | Exterior | Krasnodar · Russia | 31 | 61 | 78→-16,5 | 52,6 | 3/4 | vencendo |  |
| 6 | Erik (Brazil) | Exterior | Al Ain · Emirados | 25 | 60,1 | 68→-7,7 | 59,8 | 4/4 | — | ⚠ |
| 7 | Douglas Santos (Brazil) | Exterior | Zenit · Russia | 32 | 60,1 | 76→-15,5 | 36,2 | 2/4 | vencendo |  |
| 8 | M. Araújo ⚑ (Uruguay) | Exterior | Sporting CP · Portugal A | 26 | 60 | 67→-6,7 | 56,6 | 3/4 | — | ⚠ |

*… e mais 7 nesta posição, na aba.*

**Lateral direito** — 15 nomes · ficha de Lateral, 4 critérios · Exterior 15

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Gustavo Mantuan (Brazil) | Exterior | Zenit · Russia | 24 | 64,5 | 84→-19,9 | 63,1 | 3/4 | — |  |
| 2 | Dodô (Brazil) | Exterior | Fiorentina · Italia A | 27 | 64,2 | 78→-13,4 | 72,8 | 4/4 | vencendo |  |
| 3 | Rodinei (Brazil) | Exterior | Olympiacos Piraeus · Grecia | 34 | 62,2 | 75→-12,8 | 50,5 | 3/4 | vencendo |  |
| 4 | Anilson (Brazil) | Exterior | Paços de Ferreira · Portugal B | 24 | 58,4 | 67→-8,3 | 59,6 | 1/4 | vencendo |  |
| 5 | É. Ocampo ⚑ (Colombia) | Exterior | Vancouver Whitecaps · EUA | 22 | 57,6 | 72→-14,3 | 63,6 | 3/4 | — |  |
| 6 | Matheus Nunes (Brazil) | Exterior | Manchester City · Inglaterra A | 27 | 56,7 | 60→-3,8 | 75,5 | 4/4 | — |  |
| 7 | Heitor (Brazil) | Exterior | Portimonense · Portugal B | 25 | 54,8 | 58→-3,5 | 43,3 | 2/4 | — |  |
| 8 | N. Molina ⚑ (Argentina) | Exterior | Atlético Madrid · Espanha A | 28 | 54,5 | 56→-1 | 57,1 | 3/4 | — |  |

*… e mais 7 nesta posição, na aba.*

**Volante** — 15 nomes · ficha de Volante, 6 critérios · Exterior 15

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Gabriel Sara (Brazil) | Exterior | Galatasaray · Turquia | 26 | 70,2 | 91→-20,7 | 39 | 1/6 | — |  |
| 2 | Léo Azevedo (Brazil) | Exterior | Torreense · Portugal B | 22 | 63 | 76→-13,4 | 57,1 | 2/6 | vencendo |  |
| 3 | S. Hezze ⚑ (Argentina) | Exterior | Olympiacos Piraeus · Grecia | 24 | 62 | 72→-9,8 | 44,3 | 3/6 | — |  |
| 4 | Wendel (Brazil) | Exterior | Zenit · Russia | 28 | 61,4 | 78→-16,6 | 71,8 | 2/6 | — |  |
| 5 | Pedro Naressi (Brazil) | Exterior | Ludogorets · Bulgaria | 28 | 59,9 | 82→-22,3 | 49,5 | 1/4 | vencendo |  |
| 6 | A. Mac Allister ⚑ (Argentina) | Exterior | Liverpool · Inglaterra A | 27 | 58,2 | 64→-5,9 | 55,1 | 1/6 | — |  |
| 7 | M. Perrone ⚑ (Argentina) | Exterior | Como · Italia A | 23 | 56,2 | 58→-2,2 | 58,9 | 3/6 | — |  |
| 8 | F. Gorriarán ⚑ (Uruguay) | Exterior | Tigres UANL · Mexico | 31 | 54,8 | 72→-17 | 49,8 | 1/6 | vencendo | ⚠ |

*… e mais 7 nesta posição, na aba.*

**Médio** — 15 nomes · ficha de Meia, 5 critérios · Exterior 15

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Fred (Brazil) | Exterior | Fenerbahçe · Turquia | 33 | 64,2 | 78→-13,9 | 48,3 | 3/5 | vencendo |  |
| 2 | N. Nández ⚑ (Uruguay) | Exterior | Al Qadisiyah · Arabia Saudita A | 30 | 62,8 | 89→-26,4 | 70,2 | 2/5 | vencendo |  |
| 3 | Ângelo (Brazil) | Exterior | Al Nassr · Arabia Saudita A | 21 | 60,9 | 82→-21,6 | 53,4 | 1/5 | — |  |
| 4 | Pedrinho (Brazil) | Exterior | Shakhtar Donetsk · Ucrania | 28 | 60,5 | 84→-23,6 | 51 | 2/3 | — |  |
| 5 | M. Palacios ⚑ (Argentina) | Exterior | Al Ain · Emirados | 24 | 59,9 | 67→-7,3 | 52,9 | 2/5 | — | ⚠ |
| 6 | A. Palavecino ⚑ (Argentina) | Exterior | Cruz Azul · Mexico | 29 | 58,5 | 79→-20,8 | 60,5 | 3/5 | — | ⚠ |
| 7 | J. Elitim ⚑ (Colombia) | Exterior | Legia Warszawa · Polonia | 26 | 56,5 | 60→-3,7 | 57,1 | 3/3 | vencendo |  |
| 8 | Éderson (Brazil) | Exterior | Atalanta · Italia A | 26 | 55,1 | 57→-2,1 | 52,9 | 4/5 | vencendo |  |

*… e mais 7 nesta posição, na aba.*

**Meia ofensivo** — 15 nomes · ficha de Meia, 5 critérios · Exterior 15

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Serginho (Brazil) | Exterior | Beijing Guoan · China | 31 | 68,8 | 88→-19,4 | 56,6 | 2/3 | — |  |
| 2 | Antony (Brazil) | Exterior | Real Betis · Espanha A | 26 | 68,5 | 87→-18,7 | 67,7 | 4/5 | — |  |
| 3 | Raphinha (Brazil) | Exterior | Barcelona · Espanha A | 29 | 66,2 | 82→-15,9 | 66,5 | 3/5 | — |  |
| 4 | M. Soulé ⚑ (Argentina) | Exterior | Roma · Italia A | 23 | 65,2 | 79→-13,7 | 67,2 | 4/5 | — |  |
| 5 | Wellington Machado (Brazil) | Exterior | Al Riffa · Bahrain | 27 | 65 | 94→-28,5 | 52,7 | 0/3 | — |  |
| 6 | G. Lo Celso ⚑ (Argentina) | Exterior | Real Betis · Espanha A | 30 | 64,9 | 80→-15,3 | 38,5 | 3/5 | — |  |
| 7 | Marquinhos (Brazil) | Exterior | Spartak Moskva · Russia | 26 | 63,9 | 83→-19,4 | 47,9 | 2/5 | — |  |
| 8 | Maxi Moralez ⚑ (Argentina) | Exterior | New York City · EUA | 39 | 63 | 85→-21,6 | 40 | 1/5 | vencendo |  |

*… e mais 7 nesta posição, na aba.*

**Extremo** — 15 nomes · ficha de Extremo, 6 critérios · Exterior 15

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Tetê (Brazil) | Exterior | Panathinaikos · Grecia | 26 | 68 | 86→-18,1 | 47,2 | 3/6 | — |  |
| 2 | Euller (Brazil) | Exterior | Seoul E-Land · Coreia B | 31 | 66,2 | 83→-16,4 | 51,1 | 1/4 | — |  |
| 3 | G. Simeone ⚑ (Argentina) | Exterior | Atlético Madrid · Espanha A | 23 | 66,1 | 81→-14,8 | 71,9 | 4/6 | — |  |
| 4 | L. Messi ⚑ (Argentina) | Exterior | Inter Miami · EUA | 39 | 65,8 | 91→-24,9 | 39,8 | 1/6 | — |  |
| 5 | Rodrigo Zalazar ⚑ (Spain) | Exterior | Sporting Braga · Portugal A | 26 | 65,6 | 79→-13,7 | 50,4 | 2/6 | — | ⚠ |
| 6 | Werton (Brazil) | Exterior | Leixões · Portugal B | 22 | 65,4 | 82→-16,5 | 48,3 | 1/6 | — |  |
| 7 | D. Silva (Brazil) | Exterior | Chungnam Asan · Coreia B | 28 | 64,8 | 79→-14,5 | 63,8 | 2/4 | — |  |
| 8 | Fábio Lima (Brazil) | Exterior | Al Wasl · Emirados | 32 | 64,7 | 80→-14,9 | 33,6 | 1/6 | vencendo | ⚠ |

*… e mais 7 nesta posição, na aba.*

**Atacante** — 15 nomes · ficha de Atacante, 4 critérios · Exterior 15

| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Vinícius Júnior (Brazil) | Exterior | Real Madrid · Espanha A | 25 | 72,6 | 96→-23,2 | 68,7 | 4/4 | vencendo |  |
| 2 | P. Dybala ⚑ (Argentina) | Exterior | Roma · Italia A | 32 | 68,8 | 88→-19,4 | 34,7 | 2/4 | vencendo |  |
| 3 | L. Martínez ⚑ (Argentina) | Exterior | Internazionale · Italia A | 28 | 68,5 | 87→-18,7 | 57,2 | 3/4 | — |  |
| 4 | Gustavo Silva (Brazil) | Exterior | Vitória Guimarães · Portugal A | 26 | 67,5 | 83→-15,8 | 70 | 4/4 | — | ⚠ |
| 5 | M. Icardi ⚑ (Argentina) | Exterior | Galatasaray · Turquia | 33 | 67,3 | 85→-17,7 | 37 | 2/4 | vencendo |  |
| 6 | C. Hernández ⚑ (Colombia) | Exterior | Real Betis · Espanha A | 27 | 66,7 | 83→-16,6 | 56,7 | 3/4 | — |  |
| 7 | Richarlison (Brazil) | Exterior | Tottenham Hotspur · Inglaterra A | 29 | 66,2 | 82→-16,1 | 48,9 | 2/4 | vencendo |  |
| 8 | Zeca (Brazil) | Exterior | Shandong Taishan · China | 29 | 66,1 | 82→-16,1 | 52,2 | 2/4 | vencendo |  |

*… e mais 7 nesta posição, na aba.*


---

# 8. OS NOMES QUE O ESTUDO PUBLICA

A única lista NOMINAL que o estudo autoriza, com rótulo **rastrear** (nunca `alvo`): os que atravessam a ficha inteira da posição na leitura da liga de ORIGEM. Nenhum sobrevive ao desconto de conversão de liga.

| jogador | posição | clube · liga | idade | rodagem | contrato | ficha | conversão | passa ajustado |
|---|---|---|---|---|---|---|---|---|
| M. Hjulmand ⚑ (Denmark) | Volante RDMF | Sporting CP · Portugal A | 26 | 84% | 2028-06-30 | 6/6 | forte (13 casos) | não |
| M. Lixandru ⚑ (Romania) | Volante RDMF | FCS Bucureşti · Romenia | 24 | 62% | — | 4/6 | fraco (1 casos) | não |
| R. Kurzawa ⚑ (Poland) | Extremo RWF | Nieciecza · Polonia | 33 | 39% | 2027-06-30 | 4/6 | fraco (2 casos) | não |
| A. Ramadan ⚑ (Syria) | Extremo LW | DAC · Eslovaquia | 25 | 76% | 2028-06-30 | 4/6 | fraco (1 casos) | não |


---

# 9. TREINADORES (T04)

ordenado pelo PISO — a pior passagem do treinador —, porque é o único critério que sobreviveu a um teste de repetição (T02). A média premia quem teve uma passagem boa em clube rico.

| treinador | passagens | clubes | rodadas | % G4 pior | % G4 médio | pontos/jogo |
|---|---|---|---|---|---|---|
| Paulo Pezzolano | 1 | 1 | 38 | 89,5 | 89,5 | 2,05 |
| Fábio Carille | 1 | 1 | 37 | 89,2 | 89,2 | 1,84 |
| Eduardo Baptista | 4 | 2 | 134 | 37,5 | 47 | 1,69 |
| Thiago Carpini | 2 | 2 | 51 | 31,2 | 33,3 | 1,82 |
| Cauan de Almeida | 2 | 2 | 38 | 26,7 | 47,4 | 1,26 |
| Odair Hellmann | 1 | 1 | 30 | 20 | 20 | 1,83 |
| Jair Ventura | 2 | 2 | 46 | 18,5 | 23,9 | 1,61 |
| Claudio Tencati | 3 | 2 | 103 | 5,3 | 23,3 | 1,46 |
| Adilson Batista | 2 | 2 | 50 | 2,7 | 6 | 1,40 |
| Enderson Moreira | 6 | 5 | 122 | 0 | 46,7 | 1,52 |
| Vagner Mancini | 4 | 2 | 77 | 0 | 37,7 | 1,57 |
| Eduardo Barros | 2 | 1 | 40 | 0 | 0 | 1,42 |
| Marcinho | 1 | 1 | 30 | 0 | 0 | 1,17 |
| Alex | 2 | 2 | 53 | 0 | 1,9 | 1,34 |
| Alberto Valentim | 4 | 4 | 71 | 0 | 2,8 | 1,10 |

*33 treinadores na lista completa (`T04_resumo.json`). A D10 diz por que o piso NÃO vira critério de escolha: o T04-1 mediu que ele põe na frente quem nunca subiu.*


---

# 10. O PAINEL COM RÓTULO ERRADO (fora deste repositório)

As liga-temporada do painel temporal cujo rótulo não corresponde ao elenco, e as ligas que dependem delas. Gerado por scripts/conferir_painel.py. O conserto é no Portal Ranking, de onde o painel é copiado — aqui só se declara o que está comprometido, para a lista poder marcar a linha.

| liga | temporada | tipo | times | mediana da liga | sobreposição |
|---|---|---|---|---|---|
| Dinamarca | 2023 | divisões misturadas | 52 | 9 | 21% |
| Emirados | 2024 | divisões misturadas | 48 | 14 | 29% |
| Eslovaquia | 2023 | divisões misturadas | 39 | 12 | 33% |
| Mexico | 2023 | divisões misturadas | 38 | 18 | 47% |
| Peru | 2024 | troca de liga | 10 | 15 | 0% |
| Peru | 2025 | troca de liga | 12 | 15 | 0% |
| Portugal A | 2023 | divisões misturadas | 74 | 18 | 26% |

**Sensibilidade, medida em 2026-09-22:** J08_base.py e J08.py rodados num sandbox com o painel filtrado e os 11 casos removidos do J08_base.csv; fatores_liga.csv comparado com o publicado.

- Portugal A · volume: 3,91 → 0,58
- Portugal A · eficiencia: 2,59 → -0,16
- FAIXA ACIMA · eficiencia: 6,54 → 7,55
- FAIXA ACIMA · volume: 3,25 → 3,99
- Dinamarca · os dois: -0,80 → fica sem fator

As ligas sul-americanas com fator próprio não se movem: Argentina A, Uruguai, Chile e Brasil A mudam 0,03 ou menos. As conclusões do próprio J08 aguentam: dos 86 marcadores, 48 se movem e todos por pouco — o encolhimento, que é o achado firme da parte, vai de −0,601/−0,501 para −0,604/−0,505.

**Isto não é conserto:** Não é o fator correto. Remover o caso e rotular o caso direito são coisas diferentes, e só a segunda é conserto. Isto mede o quanto o fator publicado depende de temporada comprometida. O painel é copiado do Portal Ranking, e é lá que o rótulo precisa ser corrigido.


---

# 11. OS DADOS — de onde vem cada coisa

**Cópia do Wyscout** (de `Portal Ranking`, período ago26, copiada em 2026-09-19):

- `rankings_ago26.json` (28.3 MB) — a base por liga: jogador, liga, posicao, indicadores e primary_key
- `_temporal_movers.json` (1.7 MB) — quem trocou de liga: from_league/to_league, qz dos dois lados e dqz — o insumo do J08
- `_temporal_photos.json` (20.7 MB) — foto por temporada, 2018 a 2026, com qz normalizado dentro de liga+posicao
- `_temporal_aging.json` (0.0 MB) — curvas de envelhecimento e a confiabilidade do qz (0,471)
- `xlsx_ago26/` (9.7 MB) — 66 Excels crus, um por liga

**Ligas de origem que entram na base de fora:** 40 de 63 lidas (o resto sai por liga sem fator de J08, temporada curta ou elenco cortado no export).

- Exterior: Alemanha A, Alemanha B, Arabia Saudita A, Bahrain, Belgica A, Bulgaria, Catar, China, Coreia A, Coreia B, EUA, Emirados, Eslovaquia, Espanha A, Espanha B, França A, Grecia, Holanda, Inglaterra A, Inglaterra B, Italia A, Mexico, Polonia, Portugal A, Portugal B, Portugal C, Romenia, Russia, Tcheca, Turquia, Ucrania
- Sul-americano: Argentina A, Bolivia, Chile, Colombia A, Equador A, Paraguai, Peru, Uruguai
- Série A: Brasil A

## As bases (geradas por script, não versionadas à mão)

| Arquivo | Gerado por | Vem de |
|---|---|---|
| `dados/jogadores.json` (17,3 MB) | `preparar_base.py` | `fim_contrato_<per>.json` + `rankings_<per>.json` + `skillcorner_<per>.json` |
| `dados/kpis.json` (16,6 MB) | `preparar_kpis.py` | `kpis_detail_<per>.json` |
| `dados/kpis/<POS>.json` | `dividir_kpis.py` | quebra do anterior — **é o que a tela usa** |
| `dados/historico.json` (6,0 MB) | `preparar_historico.py` | os Excels do Wyscout de `dados/2024`, `dados/2025` e `dados/ago26` |

Origem: `Portal Ranking/output/` do Botafogo Analytics. Período atual: **ago26**.

**O cadastro vem do fim de contrato, não do ranking.** O ranking só enxerga quem tem
minutagem (18.281); o fim de contrato enxerga o elenco inteiro (40.059). Nas ligas
brasileiras isso é a diferença entre 984 e 3.613 jogadores. Quem não está no ranking
aparece com cadastro, contrato e salário estimado, e sem barras na ficha.

## Bases da Série B 2022-2026 — elencos e dados técnicos (set/26)

Duas coletas independentes, para duas perguntas diferentes. **Elenco** é quem estava no
clube; **técnico** é o que cada um fez em campo. Vieram de fontes distintas e têm
armadilhas distintas.

### Elencos, do Transfermarkt — `coletar_serieb_transfermarkt.py`

5.098 atletas-temporada, os 100 clube-temporada das tabelas, com data de nascimento,
altura, pé, clube anterior, contrato e valor de mercado.

**Por que NÃO reaproveitamos a base do `Portal Transfermarkt` (:5062).** Ela tem 80 mil
jogadores e cobre a Série B, mas nasceu da lista "os jogadores mais valiosos do mundo",
fatiada por confederação × posição × ano de nascimento. Duas consequências que a
inviabilizam: é um **retrato só**, do dia da coleta, sem coluna de temporada; e **não é
elenco, é ranking** — na Série B ela tem 490 jogadores em 20 clubes, com a Ponte Preta
aparecendo com 13 e o Náutico com 17. Quem ficou abaixo do corte de valor da fatia não
entrou.

**`saison_id = ano − 1`.** O `saison_id` do Transfermarkt é o ano de início da temporada
europeia; no Brasil, de ano civil, isso desloca tudo em um ano. Conferido de dois jeitos
antes da coleta: pelo `<title>` da página (`saison_id=2021` → "Série B 2022") e pelos 20
clubes, que batem com `SB_TABELAS`. O script grava o título em `_titulo` e **para** se ele
não falar do ano esperado.

**As colunas MUDAM entre a temporada corrente e as passadas.** A página antiga tem uma
coluna "Clube atual" que entra ANTES da altura, e não tem "Contrato". A primeira versão
lia por índice fixo e o estrago passou despercebido porque nada quebrou: a altura ia para
o campo do pé, o pé ia para "no clube desde", e os três saíam preenchidos com a coisa
errada. Agora a leitura é pelo **cabeçalho**. Lição: coluna fora de lugar não dá erro, dá
número plausível.

**A idade impressa é de outro ano.** Na página de temporada passada, a idade é a de 1º de
janeiro do `saison_id` — um ano inteiro antes da temporada brasileira. Brenno, nascido em
01/04/1999, aparece com 21 na página do Grêmio de 2022 (tinha 23). Conferido em dez
jogadores da mesma página. Por isso `idade` é calculada da data de nascimento, em 1º de
julho do ano; a do site fica em `idade_site` só para conferência.

O HTML cru fica em `dados/_serieb_html/` (fora do git). Consertar a leitura da tabela não
pode custar outra volta de 7 minutos no Transfermarkt — que foi o que a primeira versão
custou.

### Dados técnicos, do Wyscout — `preparar_serieb_tecnico.py`

3.866 jogador-temporada, 118 colunas, de dez exportações (duas por ano, porque a
exportação do Wyscout para em 500 linhas).

**O ano sai dos clubes.** As planilhas não dizem a que temporada pertencem. O script
compara os 20 clubes de cada arquivo com `SB_TABELAS` e só aceita 20 de 20 — as dez
bateram cheio, e o segundo palpite de cada uma ficou em 12 de 20. Se um dia bater 19, ele
para.

**Não sobrou buraco no meio.** Um arquivo é dos que mais jogaram para baixo, o outro dos
que menos jogaram para cima. Se as duas faixas de minutos não se tocassem, gente do meio
da tabela teria ficado de fora sem sintoma nenhum. O script confere em `cobertura()`: nos
cinco anos elas se sobrepõem.

**Três defeitos do material, tratados e escritos:**

- **`Idade` é a idade de HOJE.** Os dez arquivos saíram no mesmo dia, então Adriano
  Martins aparece com 29 anos nas linhas de 2023, 2025 e 2026. Usar isso como idade de
  época envelhece o elenco de 2022 em quatro anos. Entra `idade_na_temporada`, aproximada
  em ±1 — dá média de 26,4 a 27,0 por temporada, que é o número plausível.
- **Zero quer dizer "sem dado"** em Altura, Peso e Valor de mercado — e são **1.778
  valores de mercado zerados, 46% da base**. Uma média calculada sem tratar isso sai pela
  metade. Viram vazio.
- **`Emprestado` vem 'sim' em 100% das linhas.** Fica na base, marcada como inutilizável.

**Repetida é linha INTEIRA, não ano+jogador+clube.** Em 24 casos o mesmo nome aparece
duas vezes no mesmo clube e ano sendo gente diferente — dois Bruno Silva no Novorizontino
de 2022, de 26 e de 38 anos; dois Robinho no Sampaio Corrêa de 2023. Com a chave curta,
24 pessoas sumiriam sem deixar rastro. Pelo mesmo motivo os 232 que trocaram de clube no
meio do ano ficam com duas linhas: as duas passagens são coisas diferentes de se medir.

### O que o material do Wyscout por CLUBE (Team Stats) ainda não cobre

O zip de Team Stats (estatística de jogo, linha por partida) traz os 20 clubes da Série B
de **2026** nos cinco anos — 64 dos 100 clube-temporada das tabelas. **Faltam 36**, todos
de clubes que não estão na B de 2026, e o que falta é justamente quem subiu: os quatro
campeões (Cruzeiro 2022, Vitória 2023, Santos 2024, Coritiba 2025) e mais Grêmio e Bahia
2022, Mirassol 2024 e Athletico-PR 2025. Enquanto isso não for puxado, comparação "quem
sobe × quem fica" com essa fonte tem quase só o lado de baixo.

### Jogo a jogo, do Wyscout — `preparar_serieb_jogos.py` (set/26)

Os 136 "Team Stats" viram uma base de partidas: 9.318 linhas, 119 colunas, uma linha por
(jogo, equipe). Com a segunda leva de 36 arquivos, os **100 clube-temporada fecharam**.

**Cada jogo da Série B vinha quatro vezes.** O Cruzeiro × Grêmio está no arquivo do
Cruzeiro e no do Grêmio, e dentro de cada um ocupa duas linhas. Quem somar os 136 sem
tratar isso dobra o campeonato inteiro. A chave é (Data, Jogo, Competição, Equipa).

**As colunas sem nome ganharam nome.** O Wyscout escreve `Remates / à baliza` e deixa as
duas seguintes em branco; o pandas batiza de `Unnamed: 9`. Agora saem `Remates`,
`Remates à baliza`, `Remates à baliza, %`. Duas fogem do padrão e estão tratadas à mão
(`Perdas / curto/ médio / longo` tem três termos e nenhuma porcentagem; `Entradas na
grande área (corridas/cruzamentos)` tem a barra dentro do parêntese).

**O marcador de mata-mata muda de lugar.** "Azuriz - Bahia 1:1 (P)" e "Cruzeiro - Remo (P)
1:0" — e vem em duas letras, `(P)` e `(E)`. Sem prever os dois lugares e as duas letras,
174 jogos de copa saíam sem adversário nem resultado. Sobram 8 linhas sem casar, todas
fora da Série B, porque o Wyscout usa nomes diferentes para o mesmo clube dentro e fora do
texto (`Tolima` × `Deportes Tolima`, `Galo Maringá` × `Aruko Sports`).

**A conferência que prova a base.** `conferir()` recalcula J, V, E, D, GP e GC de cada
clube a partir das partidas e compara com a classificação de `SB_TABELAS`: **90 dos 100
clube-temporada fecham exatamente**. Os 10 restantes são cinco jogos que o Wyscout não
tem, e dá para saber que é isso porque a diferença sai coerente dos dois lados:

- **2022:** Londrina × Tombense (os dois com um empate a menos, 1-1)
- **2024:** Operário-PR × Chapecoense (um com vitória a menos, outro com derrota, 3-2)
- **2026:** três jogos da 27ª rodada — Criciúma 2-0 Vila Nova, Londrina 2-1 São Bernardo e
  Atlético-GO 2-1 Ceará

São 5 partidas em 1.785. Estão nos dois lados da fonte (falta no arquivo dos dois clubes),
então não é download incompleto: é buraco do Wyscout.

`Jogo` vem como texto ("Vila Nova - Goiás 2:0") e dele saem `casa`, `visitante`, `mando`,
`adversario`, `golos_pro`, `golos_contra` e `resultado` — perguntar "ganha mais em casa?"
não deveria exigir fórmula de texto em cada análise.



---

# 12. A INFRAESTRUTURA — onde mora cada coisa

**App:** Flask em `app.py` (porta 5090), tela em `templates/index.html`, lógica em `static/app.js`, aba Estudo em `static/estudo_serieb.js` + `estudo_serieb_dados.js` (gerado por `gerar_estudo_serieb_js.py`). Subir: `iniciar.sh`; derrubar: `parar.sh`.

**Site público:** GitHub Pages em `https://henriquesimoessilva3-png.github.io/santa-cruz-2027/`, montado por `publicar_site.py` na pasta `docs/`. O snapshot público carrega a folha salarial (decisão do dono em 22/09).

**Nuvem:** Firestore, projeto `santa-cruz-data-scout`, coleção `cenarios`, fechada na lista de e-mails de `firestore.rules`. O Salvar do app avisa antes de gravar por cima de quem salvou depois (22/09). `atualizar_listas.py` + `.github/workflows/atualizar-listas.yml` sincronizam a foto do site com a nuvem a cada 10 minutos, quando o secret `FIREBASE_KEY` existir.

## Arquivos

```
app.py               servidor Flask (porta 5090)
preparar_base.py     gera dados/jogadores.json a partir do ranking
preparar_kpis.py     gera dados/kpis.json (indicadores da ficha) do kpis_detail
iniciar.sh/parar.sh  sobe e derruba o app
dados/jogadores.json base enxuta, 18.460 jogadores (8,1 MB)
dados/kpis.json      82 indicadores por jogador, com média e melhor (15,8 MB)
dados/cenarios.json  grupos salvos
templates/index.html tela
static/app.js        lógica
static/style.css     visual
```

## Observação sobre salários

A base do ranking **não traz salário** — nem o Capology publica valores do futebol
brasileiro. Todo salário é digitado por você; a base entrega quem é o jogador
(posição, idade, overall, contrato, minutos, clube, liga e nacionalidade).


**Ordem de publicação do estudo** (do contexto da sessão):

## 8. A ordem de publicação, como comando

```bash
python3 _fonte/estudo_serieb/scripts/A17.py                # (~2 min: bootstrap de clube)
python3 _fonte/estudo_serieb/scripts/A18.py                # (idem, só se mexer nelas)
python3 _fonte/estudo_serieb/scripts/A19.py
python3 _fonte/estudo_serieb/scripts/A20.py
python3 _fonte/estudo_serieb/scripts/J11.py
python3 _fonte/estudo_serieb/scripts/J06_ranking.py      # 0. se mexer na lista por posição
python3 _fonte/estudo_serieb/scripts/gerar_decisoes.py   # 0b. se mexer nas decisões
python3 _fonte/estudo_serieb/scripts/gerar_regras.py     # 0b'. se mexer nas regras de leitura
python3 _fonte/estudo_serieb/scripts/gerar_fisico.py     # 0b''. se mexer na seção de físico
python3 gerar_valor_mercado.py                           # 0c. se mexer no valor de mercado
python3 gerar_estudo_serieb_js.py                        # 1. o dado da aba
python3 _fonte/estudo_serieb/scripts/gerar_registro.py   # 2. o registro
python3 _fonte/estudo_serieb/scripts/_portao.py          # 3. o portão (só lê)
python3 publicar_site.py                                 # 4. monta docs/ — SEM --push
python3 gerar_prompt_projeto.py                          # 4b. o prompt do projeto inteiro (_fonte/PROMPT_PROJETO.md)
git add -A && git commit                                 # 5. um commit só
git push origin main                                     # 6. e conferir:
git log --oneline origin/main..HEAD                      #    tem de sair vazio
```


**Portais do Botafogo Analytics** (fonte dos dados, fora deste repositório): hub em localhost:5555 e ~20 portas; ver a skill `portais-botafogo`. As skills `dados-wyscout`, `dados-skillcorner` e `analisar-campeonato` descrevem as bases e o método reutilizável.


**Estudo, por dentro:** `_fonte/estudo_serieb/` — `CLAUDE.md` (método), `PLANO.md`, `PLANO_FISICO.md`, `scripts/<ID>.py` (uma parte por script, todos importam `_metodo.py`), `resultados/<ID>.json|.md|_numeros.json|_testes.csv` (entregas), `_registro.md` (gerado), `_decisoes.json`, `_regras.json`, `_fisico.json`, `_painel_suspeito.json`, `J06_ranking_aderencia.json` (as listas).



---

# 13. O QUE ESTÁ PENDENTE, E O QUE APRENDER

### 7.2 O que analisar, em ordem de valor
1. **O primeiro gol de cada jogo.** Quatro partes pedindo (A09, A15, A17, A18). Fecha a ressalva
   do placar, que hoje limita toda conclusão de jogo. É a compra que mais renderia.
2. **Mais temporadas rastreadas.** Destrava os DOIS achados que falharam só por tamanho: a
   desigualdade do elenco (A20, efeito idêntico nos dois cortes) e o extremo (J11).
3. **O preço do traço.** A A16 mede o que o traço RENDE, não o que CUSTA. Falta folha salarial por
   clube-temporada.
4. **A formação do adversário como controle no A19.** Roda com a base que já existe.
5. **Valor de elenco com data** (o instantâneo do Transfermarkt não tem data, e a leitura do
   A16-2 depende disso).
6. **Onde a ação defensiva aconteceu.** Contado: das 118 colunas de jogador, 16 nomeiam zona do
   campo e **nenhuma das 6 defensivas** nomeia. Sem isso não há como achar o jogador que "protege a
   área em vez de bloquear chute de fora", que é a metade defensiva do eixo.

### 7.3 O que ficou proposto e não rodou
- **`_fonte/estudo_serieb/PLANO_FISICO.md`** — seis propostas de análise física. Duas rodaram
  (J11 e A20); ficaram a **combinação por eixos com nulo de permutação**, **idade × queda física**,
  **físico × disponibilidade** (que daria o mecanismo do J05-3 e é a única do bloco físico em que a
  porta temporal roda de verdade) e o **físico por jogo de 2025**.
- **Varrer as outras dezesseis decisões** atrás do defeito da D10 — decisão que contradiz a parte
  que cita. Duas foram achadas por leitura casual; ninguém olhou o resto.
- **Agrupar times por estilo** foi pedido e **não deve ser refeito como estava**: a §7.1 da
  ESPECIFICACAO.md já o rejeitou com o nulo de mesma covariância (p 0,195 a 0,955) e o Jaccard
  (0,48 a 0,67 contra a linha de 0,75 de Hennig). O que mudou e reabriria a pergunta é o nível do
  JOGO — 3.036 pontos em vez de 80 —, mas o agrupamento provável ali é o estado do placar, o que
  torna a pergunta circular para prever resultado.

### 7.5 O que a conferência da cobertura achou em 22/09 — e o que ficou para o Portal

A pergunta era por que só 66 sul-americanos tinham rodagem. **A cobertura das fotos está
completa** (as 12 ligas têm as três temporadas da janela). Eram dois defeitos:

1. **A chave do cruzamento, que discriminava por idioma.** O `_temporal_photos.json` guarda o
   nome sem pontuação (`i russo`, via `J08_base.nkey`) e o J09 procurava com o `nm()` dele,
   que mantém o ponto (`i. russo`). Só casava quem tem o nome escrito por extenso — o
   brasileiro. Argentina A casava **8 de 437**; Brasil A, 182 de 337. Consertado usando a mesma
   função dos dois lados. Sul-americanos com rodagem: 87 → **720**; exterior: 951 → 3.021.
   **Isto derrubou o J09-1**, que foi reescrito: o achado "estrangeiro que já rodava joga mais
   no primeiro ano" era artefato do recorte enviesado (q 0,0015 → 0,437; d 1,02 → 0,226 contra
   mínimo de 0,65; IC passou a incluir o zero). O filtro de rodagem nos mercados de fora
   **continua**, mas declarado como critério prático da casa, e não como achado medido — e a
   tela diz isso. O J09-2 também virou: 4 nomes passam a ficha na ORIGEM e nenhum sobrevive ao
   desconto de conversão (Portugal, Romênia, Polônia, Eslováquia — nenhum sul-americano).

2. **Rótulo de liga errado na fonte, fora deste repositório.** As fotos rotuladas `Peru` em
   2024 trazem times **equatorianos** e em 2025 trazem times **paraguaios**, idênticos aos do
   próprio Paraguai; só 2023 e jun26 são Peru. Por isso o Peru fica em 7 de 269 mesmo depois do
   conserto. A varredura achou **6 liga-temporada** assim: Peru 2024 e 2025, Sérvia 2024, e
   Dinamarca, Equador B e Portugal A em 2023 — dessas, só Peru e Sérvia caem na janela da
   regularidade. O arquivo é **copiado do Portal Ranking** (`_copiar_wyscout_ligas.py`), então o
   conserto é lá. **Vale conferir o J08 antes de confiar nos fatores de Peru, Paraguai e
   Equador**, porque os fatores de liga saem do mesmo painel.

**O padrão, pela terceira vez em dois dias:** os três defeitos (zagueiro, meio eixo e agora a
chave) são da mesma família — a tela afirmava um limite que era de CÓDIGO e não de dado. Vale
desconfiar de toda frase publicada que diga "essa base não tem".


## Na lista de jogadores, especificamente

1. **O goleiro não tem nome fora da Série B** (J09-3), e dentro dela são 4. Limite de dado: o SkillCorner não rastreia goleiro e a regularidade lá fora é inverificável.
2. **Peru em 7 de 269** — conserto no Portal Ranking (rótulo de liga errado nas fotos de 2024 e 2025).
3. **A lista mede semelhança, não acerto.** O backtest da §8.6 nunca passou; para passar falta desfecho melhor que minuto jogado e chegada de fora da Série B pontuável.
4. **Varrer as outras dezesseis decisões** atrás do defeito da D10 (decisão que contradiz a parte que cita).


## Lições que a sessão de 21–22/09 deixou

## 9. Três coisas para levar, e não repetir

- **Nenhuma das oito partes novas achou um traço FIRME.** O estudo continua com uma conclusão
  firme só (A02-1). O que a sessão produziu foi preço, instrução e ressalva — e quatro regras de
  leitura. Isso é o rendimento realista desta base, e vale dizer antes de prometer.
- **Duas partes falharam por falta de tamanho, não por ausência de efeito** (A20 e J11). Elas são
  a fila de coleta, não pistas mortas — e é a distinção que a regra 3 da seção 6 protege.
- **O dono leu a tela e achou dois defeitos e três buracos.** A leitura crítica do que está
  publicado rendeu mais que qualquer rodada planejada. Manter.


**A quarta lição, de 22/09:** três defeitos em dois dias eram da mesma família — a tela afirmava um limite que era de CÓDIGO e não de dado (o zagueiro sumido, o meio eixo, a chave do painel). Frase publicada que diz "essa base não tem" merece abrir o arquivo cru antes de repetir. E o terceiro derrubou um achado publicado (J09-1).
