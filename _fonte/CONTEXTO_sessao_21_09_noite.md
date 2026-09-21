# Sessão de 21/09/2026, noite — a fila inteira, e o que veio depois dela

> Escrito para quem abrir sem ter visto nada. Estado primeiro, o que mudou depois, o relato no fim.
> Continua o `_fonte/CONTEXTO_sessao_21_09.md`, que deixou a fila de cinco itens escrita.
> A fila saiu inteira, e três partes a mais nasceram de observação do dono lendo a tela —
> a seção 3 conta cada uma.
> Subordinado ao `_fonte/estudo_serieb/CLAUDE.md` (método).

---

## 1. O estado

| | |
|---|---|
| perguntas | **32 de 32** respondidas e validadas (eram 27) |
| conclusões | **89** — 1 firme, 30 prováveis, 58 indícios |
| portão | **32 de 32 aceitas** |
| página de decisões | **18 decisões** (eram 10) |
| partes novas | **A15**, **A16**, **A17**, **A18**, **J10** |

`main` limpa. O estudo deixou de estar "fechado": a fila de 21/09 acrescentou três perguntas e
todas foram respondidas e publicadas.

## 2. A fila, na ordem que o dono pediu, e o que cada item deu

O dono confirmou a ordem: **1 página de decisões · 2 nível do jogo · 3 filtro por minutagem ·
4 ponto por real · 5 corridas para a área**, e pediu tudo nesta sessão, sem worktree separada.

### 1. Página de decisões — feita de manhã, ver o contexto anterior.

### 2. Nível do jogo → **A15**
A unidade desce a clube-jogo: 3.036 linhas, 40 clubes, **sem coleta nenhuma**. Três coisas que a
unidade obriga e que foram escritas:
- **O p sai do bootstrap de CLUBE**, não do t de Welch sobre linhas — 3.036 linhas são 40 clubes
  reaparecendo 76 vezes. `scripts/_metodo_jogo.py` (importa o `_metodo.py`, não altera nada dele).
- **Duas leituras:** entre times e DENTRO do clube (centrado no próprio clube naquela temporada e
  naquele mando). Conclusão só sobe nas duas.
- **Sem corte de fronteira** — não há 4º colocado dentro de um jogo. No lugar, **sem os empates**.

Teto declarado antes de rodar: provável. Não há anterioridade dentro de um jogo.

O que saiu: o time pontua **cedendo chute pior, não cedendo menos chute** (o eixo do A02
confirmado dentro do próprio time); no jogo em que pontua ele tem **menos bola**, com a ressalva
do placar por inteiro; e **descer ao jogo mede melhor sem provar mais** — o teste de linha e o de
clube dão quase a mesma resposta, e o que morre de vez é a anterioridade.

### 3. Filtro só por minutagem nas listas
Produto, não análise. A regra agora é a que o J05-3 sustenta: **minutagem elimina, o resto
ORDENA**, pelo eixo da qualidade da chance (toques na área e passes progressivos), com físico e
duelo como desempate. Série B: 175 saíram no corte, 65 ficaram.
A regra mora em `resultados/J06_ordenacao.json`, versionada, **não** dentro do script.
Dois cuidados escritos: `Toques na área/90` entra MEDIDO e sem piso (se virasse exigência,
quebraria a conferência contra o funil do J06); e quem jogou pouco por LESÃO cai junto com quem
jogou pouco por escolha, porque o J01-2 mediu que a base não distingue os dois.

### 4. Ponto por real → **A16**
O dinheiro entra como **controle**, nunca como desconto. A lista **não é escolhida ali**: são os
candidatos do A14, menos o `H_dinheiro` (o controle) e o `I_estabilidade_11` (consequência) — e o
script confere isso contra o `A14_resumo.json` e para se não bater.

O número de reunião: **a dinheiro igual, subir do quarto de baixo para o quarto de cima em solidez
vale 8,9 pontos** — mais do que os 7,0 que o mesmo salto de elenco paga, e esse salto custa
€ 9,9 mi. Jogar assim equivale a € 12,6 mi de elenco.

E o freio, que vai colado: a porta da §6.4 rodada **com o dinheiro no controle** derruba tudo. A
anterioridade da distância do chute cai de +0,289 para +0,198 e nenhum dos 8 traços passa. A
coluna sem dinheiro reproduz o `_porta_temporal.json` número a número — é a conferência de que a
conta é a da casa.

Terceira: **a dividida no chão só paga ponto fora de casa** (4,9 pontos contra 0,2).

### 5. Corridas para a área → **J10**
A ponte que nunca tinha sido usada (`off_ball_runs`, 3.876 linhas) foi usada, e **não paga**: de
18 testes por setor, ZERO separa o titular de quem sobe nos dois cortes. É a quarta medida de
jogador a dar negativo (J03-1, J04-1, J05-3 e agora esta).

O que passou foi a família de **CONTROLE** — a que existia para testar se o achado era "para onde
ele corre" ou "quanto ele corre". Deu **quanto**, e só no volante, que é a mesma posição do J04-2.

Ressalva que muda a leitura: no volante os três indicadores de corrida para a área apontam para o
lado **certo** (+0,39 a +0,43) e ficam abaixo do mínimo detectável (0,74). "Não separa" aqui é
"este desenho não veria" — com mais temporadas rastreadas a pergunta merece voltar, e a lista já
está declarada de antes.

## 3. O que veio DEPOIS da fila, lendo a tela

Três observações do dono sobre o que estava publicado. Vale registrar o padrão: **as duas melhores
perguntas da sessão saíram de alguém lendo a página de decisões e achando-a vaga.**

### 3.1 "Qual modelo de jogo? Está muito vago" → D13 reescrita, e daí a **A17**

A D13 dizia "gastar em modelo de jogo" e explicava com nome de régua — "solidez", "qualidade da
chance". Nome de régua não é instrução. Agora ela diz o que o time FAZ, na unidade do jogo, e em
ordem de quanto paga a dinheiro igual:

| o que o time faz | de | para | vale |
|---|---|---|---|
| encurtar a distância média da própria finalização | 20,8 m | 20,0 m | 8,0 pontos |
| baixar o gol esperado sofrido em casa | 1,09 | 0,86 por jogo | 7,1 |
| baixar o gol esperado por finalização sofrida | 0,10 | 0,09 | 6,2 |
| ganhar a dividida no chão FORA | 58,2% | 61,0% | 4,9 |

Para comparar: o mesmo salto de um quarto de tabela no VALOR DO ELENCO paga 6,5 pontos e custa
€ 9,9 mi. O A16 passou a publicar o quartil pior e o melhor de cada traço — é o que transforma
"subir 50 postos" em instrução.

**A pergunta seguinte do dono:** "teve alguma forma de jogar em que isso ficou mais evidente? que
consegue chegar nisso?" — e o estudo nunca tinha medido. O A05 testou se o estilo separa quem
SOBE; ninguém tinha testado se o estilo PRODUZ o eixo. Virou a **A17**.

### 3.2 A17 — que jeito de jogar produz a chance boa

17 preditores em 4 famílias contra 2 alvos (distância da própria finalização e gol esperado por
finalização sofrida), lista fechada antes de rodar. Fora da lista, e escrito: toques e entradas na
área, finalizações e gols — não são jeito de jogar, são a própria chegada.

**Três contas:** a correlação com IC95 e p por bootstrap de clube; a **porta do eixo**, que é a
receita da §6.4 com o alvo trocado; e a leitura do jogo, dentro do próprio clube e do mesmo mando,
**sem q** — ela confirma direção e não testa de novo (regra 7).

**Resposta: 1 de 34 pares sobrevive aos dois cortes, 1 passa na porta, e não é o mesmo par.**
Nenhum cumpre os dois. O achado útil é o padrão que atravessa a tabela:

> cruzar mais anda **+0,33** com finalizar de perto ENTRE times, **+0,02** dentro do mesmo time, e
> **+0,26** com o valor do elenco.

O que parece receita entre clubes some quando o time é comparado com ele mesmo. Virou a D17 e uma
regra de leitura: **peça a conta dentro do time antes de aceitar a conta entre times.**

### 3.3 "Quais treinadores?" → D10 reescrita

Pior que vaga: a D10 mandava escolher treinador pelo PISO das passagens, e o próprio T04-1 mede
que esse critério põe em 3º quem nunca subiu e deixa de fora os dois que subiram com clubes
diferentes. **A decisão contradizia a parte que citava.** Agora ela é a que o T04-2 sustenta — não
pagar por currículo de G4 nem por modelo de jogo, e usar a lista só para reduzir a conversa — e
traz OS NOMES com o que eles são: Pezzolano e Carille lideram com uma passagem cada, em clube de
elenco 3º e 1º mais caro do ano, que é o viés medido logo acima; Eduardo Baptista é o mais regular
da base e nunca subiu.

### 3.4 "Resolve a tensão da dividida" → **A18**

O dono mandou resolver e sugeriu o caminho: cruzar contra quem esses times jogaram. Era o
cruzamento certo.

- **Soma zero, confirmada e não por pouco.** A dividida defensiva ganha pelo time e a ofensiva
  ganha pelo adversário somam **100,0** no mesmo lance, desvio 0,08, correlação −0,9999. Não é
  achado estatístico: são a MESMA medida contada dos dois lados.
- **Quem manda na variação de um jogo para o outro:** quem o time enfrentou explica **7,0%**,
  quem o time é explica **6,6%**, o mando 0,4%. O adversário pesa mais que o próprio time.
- **A hipótese do controle do adversário REPROVOU** (−0,08 com e sem), e está escrita como
  reprovada.
- **Não é dinheiro:** a dividida anda +0,11 com o valor do elenco, contra o PPDA, que o A06 mediu
  andando junto com elenco caro.
- **O que o sinal isolado escondia:** no jogo que rende ponto o time DISPUTA mais dividida
  (+0,35), quatro vezes o efeito da fração ganha, e ganha fração praticamente igual.

**A tensão se desfaz sem derrubar nenhuma das duas.** Num jogo a fração é relacional; na
temporada, a média sobre 38 adversários cancela o adversário e sobra o traço do time. A dividida
volta à ficha, medida na TEMPORADA (D18), e não serve para julgar um jogo. O `em_aberto` do A15
foi atualizado.

### 3.5 O que a base não tem, contado em vez de alegado

"Como descobrir cada jogador que faz isso?" A metade ofensiva do eixo se identifica e virou a
ordem da lista por posição. A defensiva não: das **118 colunas** de jogador do Wyscout, **16**
nomeiam uma zona do campo e, das **6 defensivas**, **nenhuma** nomeia. A base mede quanto o
jogador defende, não onde. Entrou em "O que a base não tem" do CLAUDE.md.

E a escalação por jogo também não existe: `serieb_jogos.csv` não traz nome de jogador nenhum, só o
sistema tático. Dá para saber quem eram os zagueiros do ano, não os do jogo.

## 4. O que mudou no método da casa

- **`scripts/_metodo_jogo.py`** — o método da casa na unidade clube-jogo. Importa o `_metodo.py` e
  troca só de onde sai o p. A conta fechada do bootstrap é conferida contra a concatenação, no
  mesmo sorteio, antes de qualquer teste. Ganhou depois o `correlacionar_por_clube`, que é a
  mesma reamostragem para pergunta de correlação em vez de comparação de grupos (A17, A18).
- **A porta com o alvo trocado.** A §6.4 pergunta se o indicador vem antes dos PONTOS. A A17
  precisava perguntar se ele vem antes do EIXO, e a A16 precisava da §6.4 com o dinheiro no
  controle. As duas usam a `_porta_temporal.parcial`, conferida contra a original.
- **A parcial com mais de um controle** (dentro do `A16.py`) é conferida contra a
  `_porta_temporal.parcial` com um controle só: diferença 0,0e+00.
- **`J06_ordenacao.json`** — a regra da lista virou dado versionado.
- As três listas de partes (`_portao.py`, `gerar_registro.py` e o ROTEIRO do
  `gerar_estudo_serieb_js.py`) foram atualizadas juntas. **São a mesma lista em três lugares** —
  parte fora de uma delas fica publicada sem conferência, que foi o que aconteceu com J05, J06 e
  J09 até 20/09.

## 5. Os defeitos de desenho achados e consertados

- **Marcador com sinal `+` virava 0 no gráfico**, em silêncio: o `num()` do
  `static/estudo_serieb_grafico.js` só aceitava `-`, e `parseFloat("+0,85")` devolve 0. Número
  errado na tela e plausível, que é o pior tipo. Consertado nos dois lados: a regra do `num()` e
  os marcadores de gráfico passando a sair como NÚMERO, não como texto pt-BR.
- **Duas unidades numa régua só** no J10-2 (3,23 corridas e 12,4 metros): a régua ia a 13,9 e a
  diferença real de corrida forte aparecia como nada. Uma unidade por gráfico.
- **Um número que parecia grande e era artefato**, na A18. A decomposição da variância por par
  time × adversário deu 52,3% — e tem **duas linhas por célula**, ou seja ajusta ruído. Ficou
  publicada com o número de células e de linhas por célula ao lado, e não sustenta conclusão
  nenhuma. Publicar com a inflação à vista é melhor que apagar.

## 6. A fila da próxima rodada

Sai do "em aberto" das cinco partes novas. Em ordem de valor:

1. **O primeiro gol de cada jogo.** É a mesma coleta que a A09 deixou pendente, e agora com
   QUATRO partes pedindo: fecha a ressalva do placar do A15 inteiro, da A17 e da A18, e permite o
   recorte por estado do jogo que a seção Placar do CLAUDE.md pede. A tensão da dividida já foi
   resolvida sem ela (A18), mas a explicação mais simples do A18-2 continua sendo o placar. É a
   compra que mais renderia ao estudo.
2. **O preço do traço.** O A16 mede o que o traço RENDE e não o que ele CUSTA. Folha salarial por
   clube-temporada resolveria, e não está na base.
3. **Valor de elenco com data.** O instantâneo do Transfermarkt não tem data conhecida, e é disso
   que depende a leitura do A16-2. Um valor por turno já ajudaria.
4. **Corrida por jogo.** A `physical_match` existe por jogo; a `off_ball_runs` não. Com ela
   rodaria a anterioridade do J10 e daria para cruzar com o A15.
5. **Mais temporadas rastreadas**, para o poder do J10 no volante.
6. **Onde a ação defensiva aconteceu.** Contado em 21/09: das 118 colunas de jogador do Wyscout,
   16 nomeiam uma zona do campo e **nenhuma das 6 defensivas** nomeia. Sem isso não há como achar
   o jogador que "protege a área em vez de bloquear chute de fora", que é a metade defensiva do
   eixo (A15-1, D11). O lado ofensivo já se identifica e virou a ordem da lista em 21/09; o
   defensivo depende de evento com coordenada ou do posicionamento defensivo do SkillCorner.

## 7. A ordem de publicação, como comando

```bash
python3 _fonte/estudo_serieb/scripts/A17.py               # (~2 min: bootstrap de clube)
python3 _fonte/estudo_serieb/scripts/A18.py               # (idem, só se mexer nelas)
python3 _fonte/estudo_serieb/scripts/J06_ranking.py      # 0. se mexer na lista por posição
python3 _fonte/estudo_serieb/scripts/gerar_decisoes.py   # 0b. se mexer nas decisões
python3 gerar_valor_mercado.py                           # 0c. se mexer no valor de mercado
python3 gerar_estudo_serieb_js.py                        # 1. o dado da aba
python3 _fonte/estudo_serieb/scripts/gerar_registro.py   # 2. o registro
python3 _fonte/estudo_serieb/scripts/_portao.py          # 3. o portão (só lê)
python3 publicar_site.py                                 # 4. monta docs/ — SEM --push
git add -A && git commit                                 # 5. um commit só
git push origin main                                     # 6. e conferir:
git log --oneline origin/main..HEAD                      #    tem de sair vazio
```

## 8. O que aprender desta sessão, para a próxima

- **Decisão com nome de régua é decisão vaga.** "Solidez" e "qualidade da chance" são nomes de
  método; a diretoria precisa de "encurtar a finalização de 20,8 m para 20,0 m". Toda decisão da
  página tem de passar por essa régua antes de subir.
- **Decisão que contradiz a parte que cita é pior que vaga.** A D10 sobreviveu meses dizendo o
  contrário do T04-1. Vale conferir as outras uma a uma.
- **A conta dentro do time é a que separa descrição de receita.** Foi ela que matou o cruzamento
  como alavanca (A17) e que fez a dividida voltar à ficha no nível certo (A18).
- **O portão pagou de novo.** Nesta sessão ele pegou um marcador com sinal `+` virando 0 no
  gráfico, um quase-achado não citado na A17 e a célula com dois q na A18 — esta última é
  exatamente a classe de erro que ele existe para barrar.
