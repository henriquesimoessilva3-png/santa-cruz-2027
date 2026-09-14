# Pendente para a próxima rodada da aba Protótipo (13/09/2026)

> Pedidos do dono feitos enquanto a reescrita em linguagem simples e o levantamento das
> conclusões rodavam. Nada aqui foi para a tela ainda, porque os arquivos estavam com outros
> redatores. A rodada de implementação lê este arquivo inteiro.

## 1. Etapa 1 — a tabela dos mais caros e os dois que vieram de longe
- Tabela no molde que o dono aprovou: 4 · 6 · 8 · 9 mais caros → 10 · 12 · 12 · 14 dos 16,
  contra 3 · 5 · 6 · 7 num sorteio. Tudo de `etapa_1.curva_top_k.curva` (já no JSON).
- Depois da tabela, os que ficaram FORA dos 9 mais caros, citados pelo nome, lidos de
  `curva_top_k.promovidos` com `posto_valor > 9`: Criciúma 2023 (12º, € 10,9 mi) e
  Chapecoense 2025 (18º de 20, € 10,0 mi).

## 2. Etapa 5 — a faixa de quem SUBIU
- `gerar_prototipo.py` já calcula `faixa_sobe` pelo mesmo método de `faixa_meio`/`faixa_cai`
  (código pronto e compilando, AINDA NÃO RODADO). Rodar o gerador e o `gerar_prototipo_js.py`.
- Na tela: uma linha "faixa de quem subiu" junto das outras duas, nas 11 matrizes.
- A legenda das faixas precisa dizer em português simples que são QUARTIS, não extremos:
  "metade dos times do grupo fica entre o primeiro e o terceiro número; o do meio é o time
  típico". O dono perguntou se eram os extremos.

## 3. Conclusão nova para o CONCLUSOES.md e para a tela — duelo aéreo de quem cai
Pergunta do dono: "quem cai geralmente tem uma taxa ruim de duelos aéreos ganhos?"

| | 2022-2025 | 2018-2021 |
|---|---|---|
| time inteiro (`duelos_aereos_pct`), posição média no ano | subiu 55,9 · meio 57,4 · **caiu 34,4** | subiu 73,1 · meio 47,0 · **caiu 48,4** |
| caiu x resto | tamanho −0,82 · p 0,0053 | tamanho −0,17 · p 0,54 |
| dos 16 que caíram | 14 na metade de baixo · 8 entre os 5 piores · 1 entre os 5 melhores (Tombense 2023) | 9 na metade de baixo · 2 entre os 5 melhores (Remo 2021 1º, Criciúma 2019 3º) |
| descontado o dinheiro | tamanho −0,62 · p 0,022 | sem valor de mercado |
| zagueiros com 600+ min (`ti_zaga_duelos_aereos_ganhos`) | caiu 35,0 · caiu x resto −0,79 · p 0,0071 · 12/16 metade de baixo · 0 entre os 5 melhores · descontado o dinheiro p 0,039 | não processado |

Os oito anos juntos (time inteiro): caiu x resto p 0,015; 23 de 32 na metade de baixo.

**Selo pela régua: MODERADO nos últimos quatro anos, e NÃO SE REPETIU em 2018-2021.** É sinal
real em 2022-2025 e sobrevive ao dinheiro, mas não é regra da Série B: nos quatro anos
anteriores, quem caiu ganhava duelo aéreo como qualquer outro time. Não passa no desconto dos
muitos testes (a comparação caiu x resto não é uma das duas declaradas no catálogo). Os
zagueiros têm de 3 a 5 atletas por time: medida frágil, e a própria etapa 5 marca essas células.

## 4. Tudo aberto, sem clicar
Etapa 5 (11 painéis empilhados) · 6 (as 73 dispersões em miniatura) · 12 (degraus abertos) ·
13 (setores empilhados) · 14 (as seis propostas empilhadas). Filtros da tabela da etapa 2 ficam.

## 5. Conclusões na tela
Das `_fonte/prototipo/CONCLUSOES.md` e `conclusoes_spec.json`: um bloco "O que o estudo conclui"
no topo e a conclusão principal no começo de cada etapa, com o selo de força.

## 6. A tabela de todas as diferenças, do maior gap para o menor (pedido do dono)
"talvez seja interessante fazermos uma tabela compilada de todos os indicadores, mostrando
organizadamente do maior gap para o menor gap entre as 3 faixas: quem sobe, quem fica no meio
de tabela, quem cai".

**O desenho (prévia medida em /tmp/gap_ranking_previa.csv, 293 indicadores, 2022-2025):**
- Uma linha por indicador, TODAS abertas, ordenadas pelo gap = maior menos menor posição média
  no ranking do ano entre as três faixas.
- Colunas: nome simples · posição típica de quem sobe, fica no meio, cai · o gap · quem destoa
  e para que lado ("quem sobe acima", "quem cai abaixo") · tamanho (ptTamanho) · o selo de força.
- **A LINHA DA SORTE.** Ordenar 293 junta no topo os vencedores do acaso. Sorteando os rótulos
  dentro do ano (1.000 vezes, gerador próprio [7, 23]), o MAIOR gap que o acaso produz tem
  mediana 30,4 e passa de 37,6 em só 5% dos sorteios. A tabela desenha essa linha: acima dela,
  o gap dificilmente é sorte mesmo olhando os 293; abaixo, só vale com o desconto dos muitos
  testes. E o conjunto tem sinal de verdade: 18 gaps >= 30 contra 1 no sorteio (95% até 5);
  46 gaps >= 25 contra 5 (até 17). Isso vai escrito no cabeçalho da tabela.
- Três marcas por linha, porque o gap bruto engana de três jeitos já medidos neste estudo:
  (a) **"consequência do resultado"** para o que a etapa 10 marca como placar redescrito
      (share_11, conc_hhi, nucleo_300, atletas_usados estão no top 7 — time que ganha repete
      o time; não é receita);
  (b) **"descontado o dinheiro"** e, nas linhas físicas, **"descontado o dinheiro e o tamanho do
      elenco"** (os oito físicos do ataque no top 20 são exatamente os que a refutação derrubou
      pelo número de atletas rastreados);
  (c) **"se repete em 2018-2021?"** nas colunas técnicas do time que existem nos dois períodos
      (139 em comum) — sim / não / não dá para testar.
- Top da prévia: dist_remate 48,8 · remates_baliza_pct 42,8 · share_11 41,9 · conc_hhi 41,2 ·
  nucleo_300 40,0 · xg_contra 39,7 · atletas_usados 38,6. Sobrevivem ao desconto dos 293
  testes: 24; também ao dinheiro: 20.
- Onde: primeiro bloco da etapa 2 (o catálogo), antes da tabela filtrável que já existe.

## 7. Duelo defensivo do meio-campo (o dono: "quem cai é bem pior que os demais")
`ti_meio_duelos_defensivos_ganhos` é o 18º maior gap dos 293: subiu 71,2 · meio 50,1 · caiu 40,9.
Quem mais destoa é QUEM SOBE, PARA CIMA — não quem cai para baixo. q 0,048 nos 293 testes,
descontado o dinheiro p 0,016. Números de caiu x resto e a checagem em 2018-2021: ver a
resposta de 13/09 e medir de novo na rodada.

### 7 (medido em 13/09) — os duelos, com caiu x resto e a checagem em 2018-2021
- `ti_meio_duelos_defensivos_ganhos`: caiu x resto tamanho −0,51, p 0,076 (caiu x meio p 0,21);
  descontado o dinheiro p 0,16 → a frase "quem cai é bem pior" é PODE SER SORTE. O firme é
  subiu x resto: +0,85, p 0,0039, descontado o dinheiro p 0,016; 13 dos 16 na metade de cima.
- `ti_meio_duelos_ofensivos_ganhos`: quem cai fica ACIMA (65,9 contra 47,5 do meio), p 0,039,
  descontado o dinheiro p 0,076 — fraco, e com cara de situação de jogo.
- Time inteiro, `duelos_pct`: subiu x resto p 0,035 (2022-25) e p 0,0003 (2018-21) — SE REPETE.
  Caiu x resto: p 0,85 e 0,31 — quem cai não difere em nenhum período.
- Time inteiro, `duelos_aereos_pct`: caiu x resto p 0,0053 (2022-25) e 0,54 (2018-21) — só no
  período recente; em 2018-21 quem destoa é quem sobe (p 0,0015).

## 8. ABA NOVA — aproveitamento de pontos em 3 faixas (ideia do dono, 13/09)
"ao invés de pensar somente nos times que subiram, ficaram no meio ou caíram, não seria melhor
pensar em faixa de pontos? às vezes um time que subiu fez menos pontos que o 5º de outro ano".
NÃO jogar o Protótipo fora: aba nova, "aproveitamento de pontos x todas as análises".

A premissa, medida (2022-2025): 5 times que não subiram fizeram mais pontos que o Bahia 2022
(62, subiu) — Novorizontino 2024 (64, 5º), Novorizontino 2023, Mirassol 2023, Sport 2023, Goiás
2024 (63). Em 2024 o 5º empatou com o 4º (64). Embaixo: 1 time que ficou com menos pontos que
o rebaixado de mais pontos (42).

Três cortes medidos (aproveitamento = pts / 3J; pontos em 38 jogos):
| corte | alta | baixa | tamanhos | alta = subiu + meio | baixa = caiu + meio | menor diferença detectável |
|---|---|---|---|---|---|---|
| ritmo do 6º e do 15º | >= 53,5% (61) | < 38,4% (44) | 24/35/21 | 16 + 8 | 16 + 5 | 0,76 |
| terços iguais | >= 50,9% (58) | < 39,5% (45) | 28/27/25 | 16 + 12 | 16 + 9 | 0,77 |
| linha G4/Z4 | >= 54,6% (62) | < 36,0% (41) | 17/47/16 | 12 + 5 (4 que subiram vão ao meio) | 15 + 1 | 0,81 |
A régua é estável entre períodos: 4º típico 55,3% (2022-25) e 54,2% (2018-21); 17º 34,9% e
36,0%. 2026 tem 27 rodadas (4º hoje em 58,0%): pode aparecer por ritmo, nunca em média.
Complemento recomendado aos cortes: a relação CONTÍNUA de cada indicador com o aproveitamento
(sem corte nenhum, todas as temporadas) — ordena a tabela sem depender da fronteira escolhida.
**DECIDIDO pelo dono em 13/09:**
- **Corte: RITMO DE BRIGA** — alta = aproveitamento >= a média do 6º colocado em 2022-2025;
  baixa = abaixo da média do 15º. Cortes calculados e declarados uma vez, não digitados.
- **Escopo: TUDO, espelhando as 16 etapas** do Protótipo, com as faixas de pontos no lugar de
  sobe/meio/cai — inclusive mercado (livres, nota de encaixe, elencos).
- **Períodos: 2018-2021 entra no técnico** (técnico coletivo; o individual de 2018-21 não foi
  processado). Físico e dinheiro seguem só 2022-2025. Cada número diz de que universo veio.
- O Protótipo NÃO sai do ar: a aba nova é outra aba.


## 9. Botão PERCENTIL · VALOR CRU (pedido do dono, 13/09) — nas duas abas
"é legal a visão por percentil, mas eu gosto muito da visão do indicador cru também, para
termos uma noção de qual a elasticidade dele. então deixe a opção de trocar para indicador cru,
além de percentil. um botão que troque isso".
- As células já trazem as duas escalas no JSON (`celulas[i] = [bruto, posto_no_ano, n, ...]`).
- As FAIXAS agora também: `gerar_prototipo.py` grava `faixa_{sobe,meio,cai}_bruto` ao lado das
  faixas em percentil (código pronto e compilando em 13/09, AINDA NÃO RODADO).
- Um botão só por aba, que troca TODAS as matrizes de uma vez (não um por painel).
- No cru: o número na unidade do indicador (m/min, %, por 90), cor ainda pelo percentil (para a
  leitura de quem está na frente não mudar ao trocar), e a legenda avisando que o valor cru
  mistura anos e que a ordem continua sendo a do percentil.
- Na tabela de gaps (item 6), o cru mostra a mediana de cada faixa na unidade do indicador; a
  ordenação continua pelo gap em percentil — unidades diferentes não se ordenam entre si.

## 10. O gráfico da etapa 6 engana — redesenhar (13/09)
O dono leu três dispersões da etapa 6 ("isso se repete?") como relação forte: `share_11`
(ρ 0,049), `remates_baliza_pct` (ρ 0,097) e `ppda` (ρ 0,129). Os três NÃO se repetem de um ano
para o outro. O que ele viu é outra coisa: a COR de cada ponto é o desfecho no ano t+1 e o eixo
vertical é o indicador no ano t+1 — então a separação vertical por cor é a relação do indicador
com o resultado NO MESMO ANO, não a persistência. O gráfico mistura duas perguntas num desenho só.
Conserto:
- Título e legenda dizendo com todas as letras: "a pergunta aqui é a diagonal — o time que
  estava alto num ano continua alto no outro? A cor não responde isso".
- Separar as duas perguntas: a dispersão t -> t+1 SEM cor de desfecho (ou com cor neutra), e ao
  lado a relação do mesmo ano (posição no ranking contra pontos), com o seu próprio número.
- Para os indicadores que a etapa 10 marca como consequência do resultado (`share_11`, `conc_hhi`,
  `atletas_usados`, `nucleo_300`), o aviso no próprio gráfico: forte no mesmo ano (share_11 anda
  com os pontos, ρ +0,551), zero de um ano para o outro, e os que caíram em t+1 tinham o XI MAIS
  estável no ano anterior (60,6 contra 47,5) — trocaram de time no ano ruim. Não é traço de
  elenco: é o que acontece com quem perde.

## 11. O que é cada indicador — glossário na tela (13/09)
O dono perguntou o que é "duelos aéreos pct" e pediu explicação do grupo elenco. Os cabeçalhos
das matrizes mostram ids crus (`ti_zaga_duelos_ofensivos_ganhos`, `cruz_certos_pct`). Cada
indicador precisa de: nome simples · o que mede em uma frase · unidade · de onde vem (Wyscout time,
Wyscout jogador com 600+ min, SkillCorner, Transfermarkt) · lado bom (ou "sem lado bom") — tirado
do código que o calcula (`analisar_serieb.py`, `gerar_prototipo.py`) e da documentação das fontes
(skills dados-wyscout e dados-skillcorner), nunca inventado. E a legenda de TODA matriz dizendo que
o número da célula é a POSIÇÃO NO RANKING DO ANO (0 a 100), não o valor — com o botão do item 9
para ver o valor.

## 12. O gráfico da etapa 7 precisa se explicar sozinho (13/09)
O dono perguntou "não entendi esse gráfico. por que está medindo só o primeiro turno?" — o
desenho "bruto e parcial no mesmo traço" não diz por que o turno é dividido. A reescrita em
linguagem simples já trocou o texto da etapa ("O 1º turno prevê o 2º?"); conferir, na rodada,
que o PRÓPRIO GRÁFICO carrega as quatro respostas, montadas do dado:
1. Por que dividir: é a única etapa em que o número é medido ANTES dos pontos com que se compara
   (média das rodadas 1-19 contra pontos das rodadas 20-38). Nas outras, número e pontos saem dos
   mesmos jogos, e time que está ganhando joga diferente.
2. Os dois círculos: vazado = o número do 1º turno junto com os pontos do 2º; cheio = o mesmo,
   comparando só times que tinham feito pontos parecidos no 1º turno. O traço entre eles é quanto
   da relação era só "time bom continua bom".
3. A linha verde: os próprios pontos do 1º turno andam com os do 2º a ρ 0,496 — nenhum número
   chega nela. A melhor previsão do 2º turno continua sendo a tabela do 1º.
4. As cores: azul = direção esperada e continua de pé depois do desconto; cinza = direção
   esperada mas, descontado, pode ser sorte; laranja = direção contrária ao esperado. E quantos
   passariam por sorte entre os 28 testados (~1,4) contra quantos passaram (4).

## 13. Etapa 13 — os códigos físicos viram nome e frase (13/09)
O dono pediu "explicar melhor esses indicadores" na tabela "O alvo de cada setor, medido com o
clube como unidade": a tela mostra os apelidos internos (`spn_s`, `obr_area`, `psv5`, `hi_s`...).
O dicionário apelido -> coluna do SkillCorner está em `gerar_raio_serieb.py` (`DE_PARA`,
`DE_PARA_OBR`, `DE_PARA_JSON`); a leitura de cada métrica, na skill dados-skillcorner. Na tela:
- nome simples no lugar do apelido, e a frase do que mede (com bola / sem bola / jogo inteiro;
  por 90 min ou por 30 min daquela fase) — as de fase NÃO se comparam com as de 90 min;
- as colunas explicadas: "d por clube" -> tamanho da diferença entre quem subiu e quem caiu,
  contando o CLUBE como um caso (não cada atleta); "passa por atleta" -> o teste antigo que
  contava cada atleta como independente e por isso passa mais fácil — fica só como comparação;
  "quem subiu 63,8%" -> em que ponto da Série B inteira fica o atleta típico dos clubes que
  subiram (63,8 = acima de 64% dos atacantes rastreados);
- o aviso de amostra no cabeçalho, montado de `_n_clube_por_cenario`: o cenário "barato" tem 4
  clubes — número de referência frágil.

## 14. Usar a tela inteira e acabar com a barra de rolagem lateral (13/09) — nas duas abas
"aproveitar mais da tela, para tirarmos as barras de rolagem". Tela do dono: ~1.785 px de largura.
Causa medida: `.pt{max-width:1240px;margin:0 auto}` em `static/style.css` — a aba inteira, com o
sumário lateral dentro, cabe em 1.240 px e sobra mais de 500 px vazios; e `.pt-tab th, td` com
`white-space:nowrap` e `padding:6px 11px` trava cada coluna numa linha só.
Conserto:
- a aba ocupa a largura disponível (sem teto de 1.240), com respiro lateral;
- sumário lateral estreito e fixo; o conteúdo toma o resto;
- cabeçalho de tabela QUEBRA LINHA (com os nomes simples do glossário, item 11, os cabeçalhos
  já encurtam); número continua sem quebrar;
- matrizes da etapa 5 com célula compacta (menos padding), para os 32 indicadores caberem;
- a prosa (`.pt-sub`, `.pt-nota`) mantém a largura de leitura (~75 caracteres) — linha de texto
  muito comprida cansa; é a tabela que ganha a largura, não o parágrafo;
- conferir no navegador a 1.785 px: nenhuma caixa com rolagem horizontal, ou, onde restar, dizer
  quantas e por quê (medição feita em 13/09 na mesma largura: ver a resposta daquele dia).

### 14 (medido em 13/09 a 1.785 px) — tirar o teto não basta
Aba em 1.240 px, sumário 216 px, caixa de conteúdo ~948 px. De 44 caixas com rolagem, 31
estouram. As que a largura sozinha resolve (sobra < ~500 px): etapa 1 (963 e 966 px), etapa 5
(1.117), etapa 8 (1.099), etapa 14 (1.267), etapa 15 (1.278), etapa 6 (1.450), etapa 9 (1.444).
As que pedem redesenho:
- etapa 2, catálogo: 31 colunas em 9.282 px → juntar pares numa célula (bruto→descontado;
  sobe·meio·cai), levar o técnico para ptTecnico/tooltip; alvo ~12 colunas;
- etapa 5, matrizes: 32 indicadores em 5.045 px → célula compacta (~40 px), cabeçalho vertical
  ou em 2-3 linhas com o nome simples; alvo ~1.500 px;
- etapa 9: tabelas de 6 colunas com 1.444 a 2.891 px → é TEXTO sem quebra de linha; liberar
  quebra nas colunas de texto;
- etapa 10 (9 col, 2.570), etapa 13 (11-12 col, 1.578 a 2.200), etapa 8 (15 col, 1.942),
  etapa 3 (9 col, 1.659), etapa 7 (8 col, 1.745) → quebra de linha no cabeçalho e no texto,
  padding menor, colunas técnicas recolhidas no número pequeno.

## 15. Filtros de LIGA, NACIONALIDADE e IDADE nas listas de jogadores (13/09)
"crie filtros de nacionalidade e liga, igual esses aqui. idade também" — com captura do filtro que
já existe no app: um seletor "Todas as ligas do grupo", um "Qualquer nacionalidade", e os botões
de região Brasil A/B/C · Brasil B+C · América do Sul · Europa · Todas as ligas.
- Reusar o componente e as regras do app.js (mesmos grupos de liga, mesma regra de
  nacionalidade — dupla com o Brasil conta como brasileiro), nada reinventado.
- Onde: as tabelas de candidatos da etapa 13 (os quatro setores e a trilha do goleiro) e as
  listas de nomes da etapa 14; e o mesmo na aba nova.
- Idade: faixa (mínimo e máximo), no molde do filtro de idade que o app já tiver.
- Com os filtros, os empates e a contagem do cabeçalho ("151 candidatos, 25 valores distintos")
  são recontados sobre o que ficou visível — senão o aviso fala de uma tabela e mostra outra.
- Se o candidato não tiver nacionalidade no JSON, o gerador passa a gravar (de jogadores.json).
- ONDE ESTÁ o componente de hoje: `templates/index.html` linhas ~594-597 (selects "Todas as ligas
  do grupo" e "Qualquer nacionalidade"); `static/app.js` ~5870 (grupos de região: `brasil` Brasil
  A/B/C, `brasilbc` Brasil B+C, `sulamerica` América do Sul, `europa` Europa) e ~6234 (como o
  `#fLiga` é preenchido). Ler antes de escrever; reusar as funções, não copiar a lógica.
- O QUE FALTA NO DADO (conferido em 13/09): `etapa_13.candidatos` (603) tem `liga` e `idade`, mas
  NÃO tem nacionalidade; a trilha do goleiro (126) também não. `dados/jogadores.json` tem `nac`.
  Como o pool da etapa 12/13 já NASCE de `jogadores.json`, o gerador grava `nac` no candidato na
  própria montagem — sem casamento por nome, sem risco de homônimo.

## 16. Os nomes da etapa 14 não podem mudar sozinhos (13/09)
Pergunta do dono: "com as revisões, os nomes mudam?". Medido comparando quatro versões do JSON:
- **A correção do erro de sinal trocou nomes, e devia:** 6 de 15 vagas no A_caro__serie_b, 10 no
  B_barato_transicao__serie_b, 7 no C_anti_queda__serie_b.
- **Os nomes também mudaram SEM mudança de método** (1, 2 e 2 vagas; Vilar 75% -> 71%; o 1º VOL
  de vazio para Luiz Felipe 52,5%). Causa achada pelo agente da rodada de 13/09: o gerador NÃO era
  determinístico — `etapa_14` montava a lista iterando `set(vagas)` e `eta2` somava sobre
  `set(g)`; a ordem de set de strings muda a cada execução (PYTHONHASHSEED) e decidia qual atleta
  recebia qual sorteio. JÁ CONSERTADO (`dict.fromkeys(vagas)`, `sorted(set(g))`), provado com zero
  diferença entre sementes de hash. As propostas que o dono viu antes eram uma das saídas possíveis.
- As três propostas sul-americanas: 15 de 15 vagas sem nenhum nome acima de metade das réplicas,
  em todas as versões.
O que ainda falta:
1. `etapa_14` sorteia do `rng` GLOBAL: qualquer sorteio novo acrescentado antes dela move os nomes.
   Dar gerador próprio, `np.random.default_rng([SEMENTE, 14])`, como já têm o garimpo e o setor.
2. 200 réplicas: um nome em 52% está dentro do ruído (erro-padrão de ~3,5 pontos). Subir as réplicas
   e marcar **empate técnico** quando o intervalo da fatia de réplicas cruzar 50% — "recomendado" só
   quando estiver claramente acima.
3. Na tela, ao lado dos nomes, o resultado do teste de volta: a nota não previu quem rendeu depois
   de chegar. Os nomes são lista para observar, não recomendação de contratação.
4. Os filtros do item 15 só escondem linhas; NÃO refazem a proposta. Se o dono quiser a proposta
   refeita só com Brasil B+C, por exemplo, é o gerador que tem de rodar com esse escopo.

## 17. Sobras da reescrita em linguagem simples (conferido na tela em 13/09)
A reescrita fechou: 16 etapas, zero erro, zero termo técnico fora do número pequeno, etapa 1 já com
a curva dos mais caros, a resposta ao palpite e o valor por setor. Ficaram:
- **"serve para contratar"** ainda aparece no filtro e na célula do selo da etapa 2 (a Porta A do
  `dist_remate`). O cético de honestidade marcou como frase que afirma mais que o dado: trocar pelo
  motivo medido ("se repete de um ano para o outro e vem antes do resultado"), nunca por receita.
- Etapa 13: os apelidos físicos viraram "spn s", "obr area" (só trocaram o sublinhado por espaço) —
  aplicar o dicionário do item 13.
- Etapa 5: as regras de juntar jogadores ("ponderada", "mediana", "top5") seguem com o nome da chave.

## 18. No fim: uma ABA DE CONCLUSÕES (pedido do dono, 13/09)
"você tem que criar no final uma aba de conclusões". Leitura assumida (confirmar com o dono se
divergir): uma aba própria, a ÚLTIMA da barra, depois do Protótipo e da aba de pontos, que junta
o que o estudo conclui — lendo o bloco `conclusoes` do gerador (molde em
`_fonte/prototipo/conclusoes_spec.json`, texto em `_fonte/prototipo/CONCLUSOES.md`):
- no topo, "As cinco que você precisa ler";
- depois, por tema (Dinheiro e elenco · Físico · Jogo e padrões · Os anos antigos · Mercado e
  contratação), cada conclusão com o SELO de força antes da frase, o número simples, o que ela
  não quer dizer, e o link para a etapa onde está a prova;
- por último, "O que parecia conclusão e não é" (as recusadas, com o motivo);
- quando a aba de pontos existir, cada conclusão diz se vale também pela faixa de pontos.
Vem DEPOIS das rodadas de tela e de gerador: a aba só monta frases do que o JSON já grava.
