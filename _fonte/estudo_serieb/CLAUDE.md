# Estudo Série B: times, treinadores e jogadores

## Onde este estudo mora
Repositório do app Santa Cruz 2027, em `_fonte/estudo_serieb/`. Da aba Protótipo aproveitam-se as análises, os dados e o método (`_fonte/prototipo/ESPECIFICACAO.md`): onde este arquivo e a especificação divergirem no método, vale a especificação, e o que ela marca como decidido não é reaberto. A apresentação não segue a da Protótipo: segue a seção Didática.

> **Correções de 17/09/2026.** Os ponteiros deste arquivo foram conferidos um a um contra a base e
> oito estavam trocados (etapas, seções e contagem de réguas). Só os ponteiros mudaram — nenhum método
> e nenhuma decisão da especificação foi reaberta. As partes **A08** e **A09** não rodam como estão
> escritas por falta de dado, e **A10** só cobre 2025; ver "O que a base não tem" no fim.

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

## Execução com ultracode
O estudo é construído no Claude Code com `/effort ultracode`, que planeja fluxos com vários subagentes em paralelo. Estas regras impedem que isso recrie um estudo denso e sem direção:
- **Um pedido, uma parte** (ou uma tarefa E00/R01). O plano do fluxo não inclui outra parte nem adianta dependências; se faltar uma, pare e diga qual.
- **Paralelismo só dentro da parte.** Ex.: um subagente calcula, outro confere os números contra a base, outro revisa o texto contra a seção Didática.
- **Convergência escolhe, não empilha.** Se subagentes chegarem a análises ou versões diferentes, a entrega continua com no máximo 3 conclusões; o resto vai para a prova ou para o que ficou em aberto.
- **Um dono por arquivo.** Numa parte, subagentes escrevem só `_fonte/estudo_serieb/scripts/<ID>*` e `_fonte/estudo_serieb/resultados/<ID>*`; `_registro.md` é escrito só no fim, pelo fluxo principal; os arquivos da tela (`templates/index.html`, `static/app.js`, `static/estudo_serieb*`, `gerar_estudo_serieb_js.py`) só em E00, R01 ou em pedido sobre a tela.
- **Verificação antes de entregar.** Todo número das conclusões bate com o campo `numeros` do JSON e com a base; nenhuma palavra da lista proibida aparece na manchete ou no que vimos.

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

## A aba
Uma aba única, "Estudo Série B", nesta ordem:
1. **O que decidimos:** até 7 conclusões validadas, só com manchete, uso prático e confiança.
2. **Que time montar:** conclusões do Bloco A.
3. **Que treinador buscar:** conclusões do Bloco T.
4. **Quem contratar:** por posição, o perfil em poucas linhas e os alvos do Bloco J, prontos para ir ao campograma com status "alvo".
5. **Parece, mas não é:** os resultados negativos.
6. **Como sabemos:** as provas, com a linguagem técnica (partes do estudo e o que for aproveitado da Protótipo e da Análise Série B).

A aba é criada em E00, antes das análises, e mostra desde o início todas as perguntas com status (pendente, rascunho, validada). As abas Análise Série B e Protótipo saem do menu em R01, depois que o conteúdo delas tiver migrado para cá.

## Pastas
```
_fonte/estudo_serieb/
  CLAUDE.md      este arquivo
  scripts/       A01.py, T01.py, J01.py ...
  resultados/    <ID>.md, <ID>.json, _registro.md e tabelas geradas
                 (classificacao_rodada.csv, base_passagens.csv,
                  base_jogador_temporada.csv, fatores_liga.csv)
dados/           bases do app: ler, não alterar
gerar_estudo_serieb_js.py        junta resultados/*.json para a tela (E00)
static/estudo_serieb.js e .css   a aba (E00)
static/estudo_serieb_dados.js    gerado; nunca editar à mão
```

## Ordem e dependências
- E00 (criar a aba) e A01 vêm primeiro; A01 é pré-requisito de todas as análises.
- T01 e J01–J02 podem rodar logo depois de A01; T02 logo depois de T01.
- A12 depende das réguas da Protótipo (§7.2) e de A05–A07.
- A14 só depois de A02–A13. A15 depende de A02, A05 e A06, com que dialoga, e de mais
  nada. A16 depende de A14 (herda a lista) e do `_porta_temporal.py`. A17 depende de
  A02 e A16 (o alvo dela é o que a A16 precificou) e usa a máquina da A15. A18 resolve uma
  tensão entre A06 e A15. A19 não depende de nenhuma e usa a máquina da A15.
- T03–T04 dependem de A14.
- J03–J04 dependem de J01. J05–J06 dependem de A14, J03, J04 e das notas de encaixe da Protótipo (§8 — a §8.2 proíbe somar as três num número único; são três notas, nunca uma); se T04 já existir, o perfil de jogador deve servir ao modelo do treinador escolhido.
- J07 depende de J01. J08 depende de J01 e da base das ligas de origem. J09 depende de J05, J06 e J08.
- R01 só depois que a aba tiver substituído o conteúdo das duas abas antigas (no mínimo A01–A07, A12 e A14) e com a lista de arquivos aprovada pelo usuário.

## Tarefas da tela

### E00 — Criar a aba Estudo Série B
**Objetivo:** a aba existe desde o início e mostra o estudo como roteiro, com cada pergunta e o seu status, antes mesmo de haver respostas.
**Como:**
- Seguir o molde da aba Minutagem Série B (`static/minutagem_serieb.js`, `.css`, `_dados.js`), que é
  autocontida. Atenção: o "gerador" dela é o próprio `gerar_minutagem_serieb.py`, que lê o zip do
  Wyscout e escreve o JSON e o JS juntos — **não existe `gerar_minutagem_serieb_js.py`**. O molde de
  um gerador só de tela é `gerar_bola_parada_js.py`.
- Botão `data-aba="estudo"`, com o nome "Estudo Série B", em `templates/index.html`. **Não mexer no
  `static/app.js`:** o molde da Minutagem não é registrado em `irParaAba` (`app.js:5835`) — quem mostra
  e esconde a página é um MutationObserver dentro do próprio arquivo da aba. Seguir esse caminho, e não
  o das abas antigas (a frase antiga, "registrado em `static/app.js` como as demais abas", contradizia
  o molde).
- **Antes de a aba entrar, subir o `@media` da barra de abas.** Hoje são 11 abas, e o `static/style.css`
  (≈805) só quebra a barra em duas linhas abaixo de 1.190px. Com a 12ª, entre 1.190px e ~1.290px o botão
  fica fora da tela e sem rolagem.
- Seções na ordem de "A aba". Pergunta validada mostra a manchete; pendente mostra "ainda não respondida" e o ID da parte.
- `gerar_estudo_serieb_js.py` lê `_fonte/estudo_serieb/resultados/*.json` e escreve `static/estudo_serieb_dados.js`, carregado por `<script>` antes do `app.js`.
- Os helpers de número e de ausência de que precisar ficam copiados em `static/estudo_serieb.js`, sem depender de `proto.js`, que sai com a Protótipo.
- Funcionar no Flask local e no site publicado (`docs/`, conforme `PUBLICAR.md`).
**Não faz:** nenhuma análise, e não mexe nas abas antigas.

### R01 — Aposentar Análise Série B e Protótipo
**Quando:** conforme "Ordem e dependências".
**Como:** tirar os botões e as seções das duas abas; listar, com `grep`, os arquivos usados só por elas e mostrar a lista ao usuário antes de apagar qualquer coisa. Ficam sempre: `SB_TABELAS` em `static/app.js` (fonte da classificação), as bases de `dados/` que o estudo lê, `dados/prototipo.json`, `dados/prototipo_indicadores.json`, `_fonte/prototipo/ESPECIFICACAO.md` e tudo que outra aba ainda usar. Publicar conforme `PUBLICAR.md` e conferir que nenhuma aba restante quebrou.

## Bloco A — Times

### A01 — Base e régua
**Pergunta:** quantos pontos, vitórias e saldo de gols separam as faixas em cada temporada de 2018 a 2025, e quão estável é esse corte?
**Também:** partir do que já existe (etapa 0 da Protótipo, `sb_clubes.js`) e gerar só o que falta: fronteira, `dist_g4`, Trave e `classificacao_rodada.csv`.

### A02 — Ataque ou defesa
**Pergunta:** a distância entre Sobe e Meio, e entre Sobe e Trave, está mais no que o time cria ou no que cede?
**Partir de:** réguas E_qualidade_chance e F_solidez (§7.2) e etapa 5.
**Métricas:** gols e xG pró e contra; remates pró e contra; xG por remate; gols − xG (finalização); xG contra − gols contra (goleiro e defesa).
**Apoio:** quem sobe cria mais ou converte melhor? A sobra de gols sobre o xG passa na porta temporal?

### A03 — Casa e fora
**Pergunta:** quem sobe se diferencia ganhando fora ou dominando em casa? Quem cai perde pontos onde?
**Métricas:** `pontos_casa`, `pontos_fora` e saldo de xG por mando; diferença casa − fora. Temporadas sem público ficam à parte.

### A04 — Bola parada
**Pergunta:** quanto da produção pró e contra vem de bola parada em cada faixa, e isso separa Sobe de Meio?
**Métricas:** o Wyscout não marca a origem do gol, então usar `bolas_paradas`, `bp_remates`, `cantos_remates`, `livres_remates`, pênaltis e a régua G_bola_aerea_parada. Gol de bola parada só com a base do estudo de bola parada por treinador, se ela cobrir a Série B.

### A05 — Estilo com bola
**Pergunta:** existe estilo com bola que separa Sobe de Meio, ou há times subindo com estilos opostos?
**Partir de:** régua A_posse_construcao e seus itens crus.
**Regra:** mostrar a dispersão dentro de cada faixa (mínimo, mediana, máximo) e os promovidos um a um na régua.

### A06 — Sem bola
**Pergunta:** quem sobe pressiona mais alto ou apenas cede menos finalização de qualidade?
**Partir de:** réguas B_pressao_ritmo e F_solidez.
**Métricas:** PPDA; recuperações por altura; duelos defensivos e aéreos; remates e xG cedidos ajustados pela posse adversária; contra-ataques sofridos.

### A07 — Físico: volume ou intensidade
**Pergunta:** quem sobe corre mais no total ou corre mais forte? A diferença está com bola ou sem bola?
**Partir de:** réguas C_volume_fisico e D_explosao.
**Métricas:** distância total, alta intensidade, sprints (distância e número), acelerações e velocidade máxima, separando com e sem posse quando a base trouxer.

### A08 — Físico dentro do jogo
**Pergunta:** quem sobe perde menos intensidade do 1º para o 2º tempo e no fim do jogo?
**Métricas:** as de A07 por tempo e, se houver, por faixa de 15 min; queda relativa entre o início e o fim do jogo.
**Estado em 20/09: FECHADA como "esta base não responde"** (A08-1, resultado negativo). A lista de
indicadores está declarada em `A08_indicadores.json`, de antes — se um dia a coleta trouxer
período, a parte roda com ela, e a data prova que ninguém escolheu indicador vendo resultado.

### A09 — Momentos do jogo
**Pergunta:** em que faixas de minutos cada faixa de classificação marca e sofre, e como reage ao placar?
**Métricas:** gols pró e contra por faixa de 15 min; aproveitamento quando marca primeiro e quando sofre primeiro. Exige minuto do gol: se a base não trouxer, pare e diga que coleta resolveria. Se A08 já foi feita, cruzar a queda física com os gols sofridos no fim.
**Estado em 20/09:** a primeira metade foi respondida com a coleta do oGol (ver "O que a base não tem"). A segunda — o aproveitamento por quem marca primeiro — e o cruzamento com A08 continuam em aberto, e estão escritos como tal no `A09.json`.

### A10 — Físico ao longo da temporada
**Pergunta:** quem sobe sustenta a intensidade no returno e em sequências de jogos?
**Métricas:** métricas de A07 no turno e no returno; pontos e métricas físicas em jogos com menos de 4 dias de descanso, com o descanso calculado sobre todas as competições de `serieb_jogos.csv`.

### A11 — Físico e técnico
**Pergunta:** a intensidade vira ação e resultado? O físico separa as faixas mesmo entre times com nível técnico parecido?
**Métricas:** relação entre corrida sem bola e PPDA, recuperações e xG cedido; entre corrida com bola e entradas na área e xG criado; comparação das faixas dentro de postos técnicos semelhantes.

### A12 — Estilos de jogo e destino
**Já decidido:** a Protótipo testou agrupamento por estilo contra o nulo de mesma covariância e não há grupos (§7.1). Não refazer clusters nem escolher número de grupos.
**Pergunta:** em quais réguas contínuas (§7.2, item (a)) os promovidos se concentram, e o perfil do Cenário Barato (§7.2, item (b): os que subiram fora do top-8 de valor) se sustenta com mais casos?
**Método:** posição de cada clube-temporada nas réguas, por faixa; repetir em 2018–2021 só as réguas que a base de lá sustenta — conferido em 17/09:
`serieb_clube_temporada_2018_2021.csv` não tem nenhuma coluna `fis_`, nem `tm_altura`/`tm_valor_*`, nem
`share_11`/`conc_hhi`/`atletas_usados`/`nucleo_300`, então caem C, D, G, H e I inteiras e B em parte;
sobram A, E e F; ampliar o Cenário Barato se houver valor de elenco para 2018–2021 (a coleta atual do Transfermarkt cobre 2022–2026; se faltar, dizer que coleta resolveria). n de cada afirmação no cabeçalho.
**Teste:** posicionar os times de 2026 nas mesmas réguas.

### A13 — Trajetória
**Pergunta:** quem cai já estava mal no 1º turno ou despencou no 2º? A partir de qual rodada o destino fica previsível?
**Partir de:** porta temporal (§6.4).
**Métricas:** pontos por turno em cada faixa; rodada a rodada, % dos times que já estavam na faixa final ou a até 3 pontos dela; saldo de xG e pontos do 1º turno como previsores da faixa final.

### A14 — Síntese e teste 2026
**Pergunta:** quais indicadores e réguas mais separam Sobe de Meio, e onde os times de 2026 estão nessa régua?
**Método:** partir do índice contínuo da §7.2, item (c), e do que as partes acrescentaram ao `_registro.md`; descartar redundâncias; validar deixando uma temporada de fora; aplicar a 2026 informando a rodada. Como em 2026 só 1º–2º sobem direto, verificar também se a régua separa 1º–2º de 3º–6º; com só 8 times-temporada em 1º–2º, tratar como indicativo.

### A15 — O que o time faz num jogo que rende ponto
**Pergunta:** o que um time faz **num jogo** que aumenta a chance de pontuar?
**Unidade:** clube-jogo — 3.036 linhas de `dados/serieb_jogos.csv` (só Série B, 2022–2025), 40
clubes. **Não precisa de coleta:** o técnico por jogo já está na base; o que falta por jogo é o
físico, que é a A08 e está fechada.
**A pergunta é OUTRA, e isso vale escrito:** "o que aumenta a chance de pontuar neste jogo" não é
"o que separa quem sobe na temporada". Um time pode pontuar com o que não o faz subir. A15 não
substitui nenhuma conclusão de A02 a A14.
**Duas leituras, e conclusão só sobe nas duas:** entre times (PD) e dentro do clube (PDC, com o
indicador centrado na média do próprio clube naquela temporada **e naquele mando**).
**Duas trocas que a unidade obriga**, em `scripts/_metodo_jogo.py` (que importa o `_metodo.py` e
não altera nada dele):
1. O **p** sai do bootstrap de clube, não do t de Welch sobre linhas — 3.036 linhas são 40 clubes,
   e o t de linha trata pseudorréplica como prova. Régua mais apertada, nunca mais frouxa.
2. O **corte de fronteira não existe** nesta unidade; no lugar dele, o corte de robustez é **sem
   os empates** (o empate é o jogo colado na linha).
**Teto: provável**, declarado antes de rodar. A porta temporal da §6.4 não é calculável dentro de
um jogo — indicador e pontos são simultâneos. É limite de dado, não reprovação.
**Ressalva principal:** efeito do placar, aqui muito pior que no clube-temporada, e sem minuto do
gol para recortar por estado do jogo (a mesma lacuna que a A09 mediu).

### A16 — Ponto por real
**Pergunta:** dentro do que o dinheiro compra, qual traço dá mais ponto por real?
**Unidade:** clube-temporada, 80 linhas de 2022–2025.
**A lista NÃO é escolhida aqui:** são os candidatos do A14 (firmes nos dois cortes em Sobe × Meio,
sem placar redescrito), menos o `H_dinheiro`, que aqui é o CONTROLE, e o `I_estabilidade_11`, que
o A14 tirou por ser consequência do resultado. O script confere isso contra o `A14_resumo.json` e
para se não bater — escolher indicador depois de ver qual dá mais ponto por real é garimpo.
**O dinheiro é controle, nunca desconto** (decisão de 15/09 na especificação): ele não desconta
conclusão nenhuma; a pergunta É o que sobra depois dele.
**Duas contas:** (a) correlação PARCIAL entre o posto do traço e o posto dos pontos, dado o posto
do dinheiro, pela receita da §6.4 (`_porta_temporal.parcial`), com BH a 5% por família; (b) a
porta da §6.4 **com um controle a mais**, o dinheiro — sem ele, a porta não distingue "este traço
vem antes" de "quem tem este traço é rico".
**O número de decisão:** uma regressão dos pontos sobre os dois postos, para responder em PONTOS e
em EURO (a moeda da base do Transfermarkt; converter para real exigiria taxa e data que a base não
tem).
**Ressalva que vem do próprio estudo:** o A12-2 já achou que quem jogou como os que subiram sem
dinheiro caiu mais do que subiu. A resposta podia ser desconfortável, e em parte foi: a
anterioridade some quando o dinheiro entra no controle.

### A17 — Que jeito de jogar produz a chance boa
**Pergunta:** o que um time faz que o leva a finalizar de mais perto e a ceder finalização pior?
**Não é a pergunta do A05.** Ali o alvo é o acesso; aqui o alvo é o próprio eixo. O A05 responde
"o estilo separa quem sobe?"; a A17 responde "o estilo PRODUZ a chance boa?".
**Unidade:** clube-temporada, 80 linhas, com uma segunda leitura em clube-jogo (3.036), dentro do
próprio clube e do mesmo mando — a máquina da A15.
**Fora da lista, e escrito:** toques e entradas na área, finalizações e gols. Não são jeito de
jogar; são a própria chegada, e predizer a distância da finalização com o número de toques na
área é medir a mesma coisa duas vezes (é a ressalva que o D3 já carrega).
**Três contas:** (a) correlação de posto com IC95 e p por bootstrap de CLUBE, BH por família ×
alvo, nos dois cortes; (b) a **porta do eixo** — a receita da §6.4 com o alvo trocado: o preditor
das 19 primeiras rodadas contra o ALVO das 19 últimas, com parcial dada ao alvo do 1º turno;
(c) a leitura do jogo, **sem q**, que confirma direção e não testa de novo (regra 7 do portão).
**Firme = BH nos dois cortes E porta do eixo.** Nenhum par cumpriu os dois.
**O dinheiro entra ao lado de cada preditor**, medido, como ressalva e nunca como desconto.

### A18 — A dividida no chão mede o time ou o adversário?
**Pergunta:** por que a dividida no chão separa quem sobe na temporada (A06-1) e anda para o lado
contrário dentro do próprio time, jogo a jogo (A15)?
**Existe para resolver uma tensão**, não para achar coisa nova. Enquanto ela durasse, a dividida
não podia virar requisito de contratação.
**As quatro hipóteses vão declaradas ANTES de rodar**, com o teste de cada uma escrito ao lado
— é o molde para qualquer parte que nasça de uma contradição entre duas outras.
**O achado que fecha a conta:** a dividida ganha pelo time e a perdida pelo adversário somam cem
no mesmo lance. Não é correlação, é identidade — são a mesma medida contada dos dois lados. Por
isso um indicador de PORCENTAGEM de duelo é relacional por construção, e só vira traço de time
depois de médio sobre muitos adversários.
**Regra 7 na prática:** a célula que o A15 já tinha publicado é CITADA daqui, com o q do dono. O
que é desta parte é a comparação com o adversário no centro e os dois indicadores novos.
**Teto: provável** — unidade jogo, sem anterioridade, como a A15 declarou.
**A base NÃO tem escalação por jogo:** `serieb_jogos.csv` não traz nome de jogador nenhum, só o
sistema tático. Dá para saber quem eram os zagueiros do ano, não os do jogo.

### A19 — A formação do time muda o resultado do jogo?
**Pergunta:** a pergunta mais comum de vestiário e de diretoria, e o estudo não tinha número para
ela. A coluna `Sistema` de `serieb_jogos.csv` traz a formação dominante de cada jogo, com a fatia
de tempo, e nunca tinha sido usada.
**Unidade:** clube-jogo. Seis formações (as com 150 jogos ou mais, 86,9% dos jogos), duas leituras
(entre times e dentro do clube, no mesmo mando) e dois cortes.
**A RESSALVA MANDA NESTA PARTE, e por isso vem antes do método:** a formação é ESCOLHIDA, com
informação que o teste não tem — o adversário, o elenco do dia e o PLACAR. O dado é do jogo
inteiro, então o time que virou três na defesa perdendo entra com o desenho novo. É seleção, não
tratamento.
**O corte de robustez desta parte é ele mesmo suspeito, e isso foi MEDIDO.** Deixar só os jogos em
que o time ficou 100% do tempo numa formação parece limpar e na verdade seleciona pelo desfecho: o
time só troca quando precisa, e precisar é estar perdendo. Medido: 1,75 ponto por jogo contra 0,86
no desenho de cinco defensores. **Regra que sai daqui e vale para o estudo inteiro:** recorte cujo
critério pode ser consequência do desfecho não é robustez, é seleção.
**Teto: indício** — nada passa em critério nenhum, e a anterioridade não é calculável (formação e
resultado são do mesmo jogo).
**Limite escrito:** a formação do ADVERSÁRIO não entra como controle, e o A18 mediu que num jogo o
adversário explica mais da variação do que o próprio time. É o primeiro acréscimo se a parte
voltar, e roda com a base que já existe.

## Bloco T — Treinadores

### T01 — Coleta de passagens
**Pergunta:** quem comandou cada time da Série B, em quais rodadas, de 2018 a 2026?
**Método:** coleta conforme as definições; gerar `resultados/base_passagens.csv` (treinador, clube, início, fim, rodadas, interino); conferir uma amostra contra fonte independente; ao final, dizer o que muda na etapa 15 da Protótipo ("Treinador: o que não dá").

### T02 — Rodadas no G4
**Pergunta:** quais treinadores mantêm seus times mais rodadas no G4?
**Métricas:** rodadas no G4 em número e em % das rodadas comandadas, contando todas as rodadas e só a partir da 10ª (antes disso a tabela oscila demais); pontos por jogo e saldo de xG por jogo na passagem; pontos por jogo do mesmo time com outros treinadores na mesma temporada, quando houver; contexto conforme as definições.
**Apoio:** quem repete G4 em clubes diferentes?

### T03 — Perfil de jogo do treinador
**Pergunta:** os times do treinador mostram os traços que separam quem sobe (A14) e repetem esse perfil em clubes diferentes?
**Métricas:** posição do time nas réguas contínuas durante a passagem, técnicas e físicas; comparação antes e depois da chegada no mesmo time, com pelo menos 8 jogos de cada lado.

### T04 — Treinador ideal
**Pergunta:** quais treinadores combinam resultado (T02), perfil alinhado ao que separa quem sobe (T03) e consistência entre clubes?
**Entrega:** lista curta (3–5 nomes) com pontos fortes, riscos e tamanho da amostra de cada um, mais o perfil ideal descrito em réguas, para avaliar nomes fora da base. Disponibilidade e custo ficam para validação externa.

## Bloco J — Jogadores

### J01 — Base e minutagem
**Pergunta:** quem tem minutagem alta e regular em cada posição, e quanto da minutagem baixa é lesão?
**Partir de:** aba Minutagem Série B (`dados/minutagem_serieb.json`).
**Também:** acrescentar lesões, regularidade e a faixa do time; gerar `resultados/base_jogador_temporada.csv`; mostrar a distribuição da minutagem por posição antes de fixar o corte. Minutagem alta em time do Cai pode ser falta de opção.

### J02 — Rotação e continuidade do elenco
**Pergunta:** quem sobe concentra os minutos em menos jogadores e mantém mais a base da temporada anterior?
**Partir de:** régua I_estabilidade_11 (`share_11`, `conc_hhi`, `atletas_usados`, `nucleo_300`).
**Métricas:** acrescentar continuidade com `no_clube_desde` e `clube_anterior` de `serieb_elencos.csv`: % dos minutos de quem já estava no clube no ano anterior e % dos minutos de contratados da temporada.

### J03 — O titular de quem sobe: técnico
**Pergunta:** em cada posição, como os titulares (1 ou 2 jogadores de mais minutos, conforme a posição) dos times que sobem se comparam aos do Meio nas métricas técnicas?
**Regra:** percentis por posição e temporada; critério de conclusão da especificação.

### J04 — O titular de quem sobe: físico
**Pergunta:** em que posições os titulares de quem sobe se diferenciam fisicamente, e em quê: volume, alta intensidade, sprints ou velocidade máxima?
**Partir de:** `dados/raio_ref.json` (referências sobe e cai por posição). A referência atual da aba Físico é Sobe × Cai; aqui a comparação padrão é Sobe × Meio.

### J05 — Perfil ideal por posição
**Pergunta:** quais 4–6 métricas, técnicas e físicas, definem o jogador ideal em cada posição?
**Partir de:** o perfil físico por setor, que **não** está na §8 — está em `prototipo.json`, nas chaves
`sobecai_corrigido_por_clube` e `etapa_13.criterio_por_setor`, e em `dados/raio_ref.json`
(`sobecai.setores`); e as notas de encaixe da §8 (`etapa_13`), que não podem virar um número só.
**Método:** usar só o que passou em J03 e J04 e se conecta a A14 (e ao modelo do treinador de T04, se existir); definir um percentil mínimo para cada métrica; incluir minutagem regular como requisito.

### J06 — Alvos na Série B
**Pergunta:** quais jogadores da base atendem o perfil de cada posição e têm minutagem alta e regular?
**Partir de:** o funil dos livres, que é a **`etapa_12`** (`etapa_12.degraus`) — e **não** a etapa 14,
que são as propostas de elenco; e as notas de encaixe da `etapa_13`. O backtest da §8.6 é obrigatório antes de publicar nomes.
**Entrega:** 5–10 nomes por posição, livres primeiro, com idade, time, contrato, minutagem, lesões, percentis nas métricas do perfil, pontos fortes e riscos; sinalizar quem é estrangeiro, porque ocupa vaga. Apontar as posições com poucos nomes (oferta escassa), que orientam J09. Custo e disponibilidade ficam para validação externa.
**Apoio:** partir da etapa 11 (o que o jogador leva na mala) para dizer se esse perfil se mantém quando o jogador troca de clube.

### J07 — Estrangeiros na Série B
**Pergunta:** quantos estrangeiros jogaram a Série B, de onde vieram, quanto jogaram e como renderam em relação aos brasileiros da mesma posição?
**Métricas:** estrangeiros por temporada e por faixa do time; % dos minutos do time jogados por estrangeiros, por faixa; liga de origem; fatia de minutos na primeira temporada; percentis em relação aos brasileiros da mesma posição; permanência na temporada seguinte. Se houver base da Série A, repetir para comparação, porque a amostra é maior.

### J08 — Conversão de ligas
**Pergunta:** como os números de um jogador de outra liga se traduzem para a Série B?
**Método:** usar jogadores que se transferiram da liga de origem para o futebol brasileiro (Série B e, se houver base, Série A), comparando percentis antes e depois, separados em métricas técnicas de volume, técnicas de eficiência e físicas; aproveitar o método da etapa 11. Incluir quem não chegou a 900 minutos no destino, reportado à parte, para não olhar só os casos que deram certo. Estimar um fator por liga quando houver casos suficientes (ex.: 10 ou mais); abaixo disso, agrupar ligas de nível parecido e marcar o fator como fraco. Gerar `resultados/fatores_liga.csv` com liga, fator, número de casos e força da estimativa. O mesmo método vale para a Série C.

### J09 — Alvos no exterior
**Pergunta:** quais estrangeiros atendem o perfil de J05, com minutagem alta e regular na liga de origem, depois do ajuste de J08?
**Regra:** como as vagas são limitadas, priorizar as posições de oferta escassa apontadas em J06.
**Entrega:** 3–5 nomes por posição priorizada, com liga, idade, contrato, minutagem, percentis ajustados, força do fator da liga, se o físico foi verificado e riscos de adaptação (ex.: primeira saída do país, idade). Custo e disponibilidade ficam para validação externa.

### J10 — Corrida para a área como requisito de contratação
**Pergunta:** a corrida para dentro da área separa o titular de quem sobe, e vira requisito por
posição?
**Por que existe:** o eixo firme é a qualidade da chance (A02-1) e, no time, o A11-1 ligou correr
para dentro da área a entrar na área. A ponte para o jogador estava na base e nunca tinha sido
usada: a tabela `off_ball_runs` do `skillcorner_serieb.db`.
**Unidade:** jogador-temporada, titulares de 2022–2025, pela ponte do `J04_base.csv`. Goleiro
fora: a tabela não traz corrida sem bola de goleiro.
**A unidade da métrica é p30tip** — por 30 min de bola com o TIME em posse, e não por 90 de jogo,
que é a do J04. Os números das duas partes não se comparam um a um.
**A família de controle é parte do desenho:** `volume_de_corrida` existe para testar se o achado
é "para onde ele corre" ou "quanto ele corre". Sem ela, o resultado não seria interpretável.
**Teto: provável**, declarado antes de rodar. A `off_ball_runs` tem uma linha por
jogador-temporada, sem recorte por rodada — ao contrário da `physical_match` —, então não há 1º
turno e não há anterioridade.
**Depende de:** J04 (a base e a ponte de identidade) e A11.

### J11 — Correr com a bola e correr sem a bola
**Pergunta:** o titular de quem sobe corre proporcionalmente mais SEM a bola do que COM a bola?
**O que o J04 já fez, e esta parte não refaz:** ele testou 20 medidas por posição, entre elas SEIS
já em TIP/OTIP. O que ele nunca fez foi a RAZÃO entre as duas fases — testou o nível de cada uma
como indicador separado. Os seis dele ficam FORA desta lista, para que nenhum saia com dois q.
**Unidade:** jogador-temporada, 697 titulares de 2022–2025, pela ponte do `J04_base.csv`.
Cobertura de 697 em 697 nas três unidades da tabela `physical`.
**A ressalva é MEDIDA, não alegada:** a razão pode ser do TIME. O clube-temporada explica 20,8% da
variação da razão de distância, e ela anda +0,28 com a posse do time. Descreve ao lado, nunca
desconta.
**Teto: provável** — a tabela `physical` tem uma linha por jogador-temporada, sem recorte por
rodada, então não há anterioridade.
**O padrão das discordâncias entre cortes vale como aviso geral:** em todas as posições em que a
razão discorda, o efeito é MAIOR no corte reduzido. É o que o método prevê dele (tirar os times
colados na linha afasta as faixas por construção), e é por isso que achado que só aparece ali não
sobe.

## O que a base não tem

Conferido contra o repositório em 17/09/2026, antes de qualquer parte rodar. São lacunas de **dado**,
não de método: nenhuma delas se resolve escrevendo melhor a pergunta.

**A09 rodava pela metade, e a metade que faltava foi coletada em 20/09.** Continua verdade que
não existe minuto do gol em `dados/serieb_jogos.csv` nem em `serieb_jogos_2018_2021.csv` — nenhuma
das 119 colunas traz minuto ou tempo. O que mudou foi o remédio: `coletar_serieb_gols_por_minuto.py`
traz do oGol os gols marcados e sofridos por faixa de 15 minutos, por clube e temporada, de 2018 a
2026, em **18 páginas** (a conta já vem agregada por edição, então não foi preciso ler as 1.782
páginas de jogo). **A metade "como reage ao placar" continua sem dado:** o aproveitamento de quem
marca primeiro e de quem sofre primeiro exige o primeiro gol de cada jogo, e a tabela agregada não
traz evento nenhum. O caminho para essa coleta está escrito no cabeçalho do coletor. E a **porta
temporal não roda** na A09, porque o oGol publica a conta da temporada fechada, sem corte por
rodada: nenhuma conclusão da parte passa de provável.

**A08 não roda, e em 20/09 isso passou a ser MEDIDO em vez de alegado.** O `scripts/A08.py` abre o
`skillcorner_serieb.db` e conta: **zero** coluna de período nas 88 colunas das duas tabelas físicas
e **zero** chave com recorte de tempo nas 31 da resposta crua da API — toda métrica vem com o
sufixo `_full_all_` (jogo inteiro, todas as fases). O único recorte abaixo do jogo é TIP/OTIP, que
é **posse e não tempo**, e engana: são 34 colunas, o que dá a impressão de que a base desce ao
detalhe. A parte foi fechada como conclusão negativa (A08-1), que é o que a regra da casa manda
fazer com "esta base não responde" — com a ressalva escrita de que isso não prova que o rendimento
não cai, nem que a queda não separaria, nem que o fornecedor não venda o recorte. Cai junto o
recorte por estado do jogo da seção **Placar**. Só coleta nova resolve, e aqui não há atalho: a
A09 foi salva porque o oGol publicava a soma por faixa de minuto de graça, e não existe
equivalente para dado físico.

**A10 só cobre 2025.** A única tabela física por jogo (`physical_match`) tem Série B 2025 (374 jogos)
e 2026 parcial (207); em 2022–2024 tem zero linhas. O calendário para o descanso existe
(`serieb_jogos.csv`, coluna `Data`), mas não há físico por jogo para cruzar com ele antes de 2025.

**A07 e J04, velocidade máxima.** `peak_velocity` tem cobertura zero em 2022, 2023 e 2024. Só o
PSV-99 (`fis_psv99`, `fis_psv99_top5`) cobre a janela inteira.

**J04, Sobe × Meio.** `dados/raio_ref.json` só guarda médias fechadas de **sobe** e **cai** — não há
"meio", e não há linha de jogador no repositório. O físico por jogador está no `skillcorner.db`, que
fica fora deste repositório (ver abaixo).

**J08 e J09, liga de origem.** Não há base de nenhuma liga fora a Série B neste repositório.
`dados/serieb_origem_2018_2026.csv` é a divisão de origem do **clube** (A/B/C), não a liga do jogador.

**T01 a T04.** Nenhuma base tem nome de treinador — `dados/serieb_tecnico.csv` é export do Wyscout de
**jogadores**. Por isso T01 é coleta (feita em 17/09; ver `scripts/T01.py`).

**A metade DEFENSIVA do eixo não tem como ser achada no jogador, e isso foi contado em 21/09.**
O A15-1 e o D11 dizem que defender bem é empurrar a finalização do adversário para fora da área,
e não reduzir o número dela. Para achar o jogador que faz isso seria preciso saber ONDE a ação
defensiva aconteceu — e o export do Wyscout não diz: das **118 colunas** de jogador, **16** nomeiam
alguma zona do campo (área, terço final, profundidade), e das **6 colunas defensivas** (ações
defensivas com êxito, duelos defensivos e %, cortes, cortes de carrinho ajustados à posse e
interseções) **nenhuma** nomeia zona nenhuma. A base mede QUANTO o jogador defende, não ONDE.

A metade OFENSIVA existe: `Toques na área/90`, `Passes para a área de penálti/90`, `Passes em
profundidade/90`, `Corridas progressivas/90` e `Cruzamentos em profundidade recebidos/90` dizem
quem leva a bola para dentro da área — e é com as duas primeiras que a lista por posição passou a
ser ordenada em 21/09 (`J06_ordenacao.json`). Fica desigual de propósito: o lado ofensivo se
identifica, o defensivo não, e a tela tem de dizer isso em vez de fingir simetria.

Só coleta resolve: evento com coordenada, ou o dado de posicionamento defensivo do SkillCorner,
que não está neste repositório.

### Onde está o que falta

O **Portal Ranking** do Botafogo Analytics (porta 5053, `portal_ranking_botafogo.py`, pasta
`Portal Ranking`, com `CLAUDE.md` próprio) tem as duas coisas que faltam aqui: os Excels do Wyscout de
**53 ligas** (`dados/abr26/`, 14 mil jogadores) e o `skillcorner.db` com físico **por jogador e por
jogo**. É a fonte de J08, J09 e do buraco de J04.

É outro projeto e outro repositório: nada de lá é alterado, e o que for usado entra aqui como base
copiada, com a data da cópia registrada no `_registro.md`.
