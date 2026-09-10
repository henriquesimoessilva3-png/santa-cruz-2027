# Santa Cruz 2027 — contexto

App de montagem de elenco e folha salarial. Roda em `localhost:5090`; o portal do
clube, em `localhost:5091` (`hub/`). Nada a ver com o hub do Botafogo (`:5555`) —
ambientes separados, a pedido.

Repositório **privado**: `henriquesimoessilva3-png/santa-cruz-2027`.

## A conta do orçamento (definida pelo usuário)

Os R$ 2,8 MM são o **custo total mensal**, não a folha:

```
custo total máximo          2.800.000
− comissão técnica            300.000   (editável; pode ser montada cargo a cargo)
= disponível para atletas   2.500.000
÷ encargos                       1,25   (editável)
= massa salarial            2.000.000   ← é isto que se distribui no campograma
```

O salário digitado no card é o que vai para o jogador. Elenco alvo: 26 a 30 atletas,
3 vagas por posição. **Limite de estrangeiros: 9** (nasceu 5 e foi corrigido; há
migração `v<4` para os grupos gravados com o valor antigo).

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

## Armadilhas que custaram tempo

- **`primary_key` é nula para quem não tem minutagem** (19.072 registros). Deduplicar
  por ela joga fora metade da base. A chave é `primary_key` ou, na falta,
  `"<Player> - <Team> - <league>"`.
- **O `id` do jogador muda a cada regeração da base.** Os elencos gravados guardam a
  `pk`; o `id` só é aceito se o nome bater. Há `reancorar()` no carregamento. Sem
  isso, o "+" de um jogador abria a ficha de outro.
- **O navegador guardava o JSON antigo por uma hora** (`max_age=3600`), e colunas
  novas vinham vazias. Bases e estáticos são versionados pelo mtime.
- **Cabeçalho e células da tabela em lugares diferentes** desalinham a qualquer coluna
  nova. Hoje `COLUNAS` e `FC_COLUNAS` geram os dois.
- **Uma data URI de SVG dentro de `<link rel="icon">` não sobrevive a um replace por
  regex** — o corte no primeiro `>` deixou um `<rect>` solto que engoliu a página
  inteira (o `<main>` ficou dentro dele, e a área do campo caiu de 826 para 572px).
- **O salário do TransferRoom é faixa ANUAL em euros** ("150K - 220K"). A tela
  converte para reais por mês com a cotação do modal Orçamento (padrão 6,30).
- **Jogador entra com salário 0, sem sugestão.** Havia preenchimento com o piso da
  faixa do TransferRoom (azul itálico, `sugerido`); o usuário pediu para não sugerir.
  A faixa segue na ficha e na aba Fim de contrato.
- **Capology não publica salário do futebol brasileiro** — o campo vem nulo. Todo
  salário é digitado, exceto a estimativa do TransferRoom (766 brasileiros).

## Campograma — por que o código é o que é

Sete colunas: goleiro, zagueiros, **laterais**, volante/médio, meia, **extremos**,
atacante (CA — o rótulo é "Atacante", não "Centroavante", a pedido). Laterais e extremos são colunas "abertas": ficam no topo e na base,
enquanto as vizinhas ficam centradas — foi assim que se descasaram dos zagueiros e
do meia, a pedido.

- **A largura do card vem da REFERÊNCIA, não do elenco real.** `medirAlturas()` monta
  a altura que cada posição teria com exatamente as vagas previstas (`metaPos`) e o
  card médio; `larguraReferencia()` simula o entrelaçado com isso. Assim o card não
  encolhe quando entram mais jogadores do que as vagas — pedido literal: "mantenha
  sempre o tamanho do card igual estava antes". Quando o elenco real não cabe mais
  no entrelaçado sem encolher, `planejarHorizontal()` troca para o desenho **reto**
  (`.campo.reto`): sete colunas lado a lado, espalhadas pela largura toda, sem
  sobreposição horizontal — mesma largura de card em tela larga (268px a 2016px de
  viewport, que é o zoom 75% que o usuário usa) e a maior que couber lado a lado em
  tela estreita. O critério entre os dois é o tamanho VISUAL (largura × escala).
- **A largura é única e calculada, nunca por tentativa.** Uma versão anterior reduzia
  ao detectar encosto, redesenhava, via que cabia, voltava ao tamanho cheio e colidia
  de novo — o vai-e-vem parava num valor pequeno e os nomes viravam "G...". Como a
  altura do card não depende da largura (o nome sempre cabe numa linha), `maiorLargura
  QueCabe()` simula as posições e escolhe de uma vez.
- **Existe uma altura mínima que separa as pontas do miolo.** Sem ela, em tela baixa
  os cards dos laterais alcançam os do meio e a largura despenca (150px contra 376px).
- **O nome é abreviado como na súmula** quando não cabe: "Matheus Trindade" vira
  "M. Trindade". O limite sai da largura real do card em pixels, descontando a estrela
  de titular (9px) e o selo de estrangeiro (29px) — a conta por caractere superestimava.
- **`transform: scale` não encolhe a caixa no fluxo**: sem descontar as margens,
  sobra espaço e aparece barra de rolagem à toa (`compensarEscala`).
- No modo **caber na tela** (padrão) a área não rola. Em **tamanho real** ela rola —
  preferível a esconder parte do elenco atrás de `overflow:hidden`.
- **O tremor era um ciclo de re-render por causa dos nomes.** `distribuir()` roda mais
  de uma vez por ajuste (fonte 1, depois fonte compensada), com alturas diferentes e
  larguras diferentes (294 e 265px no rastro capturado em `/api/diagnostico`), e
  pedia `renderCampo()` sempre que a largura mudava mais de 12px — nove ajustes em
  300ms com área, escala e fonte constantes. Guardas de "alternância" não seguram
  porque as variáveis são sobrescritas entre as passadas. A regra que ficou:
  **`distribuir()` nunca redesenha**; os nomes são abreviados por `atualizarNomes()`
  ao fim de `ajustarCampo()`, trocando só o texto do span (o nome completo fica em
  `data-nome`). Nada é reconstruído, a altura não muda, nenhum observador acorda.
  O detector (`diagRegistrar`, >8 ajustes em 2s → POST) continua ligado e barato.
- **O × do card tira do elenco na hora** (mesma coisa que "Tirar do elenco" no ⋯).
  Ele ocupa uma coluna a mais do grid, então `NAO_NOME` subiu 19px e mais nomes
  viram "C. Miguel".

## Histórico de três temporadas

`preparar_historico.py` lê os **mesmos Excels do Wyscout** que alimentam o ranking
(`Portal Ranking/dados/<periodo>/*.xlsx`, aba BASE) para 2024, 2025 e ago26, e grava
minutagem, jogos, gols, assistências, gols de cabeça e bola parada por temporada.

Três armadilhas resolvidas ali, todas custosas se descobertas depois:

- **O `multiseason_candidates.parquet` da Base Unificada não serve para bola parada.**
  Ele já é multi-temporada e casa por `player_uid`, mas chega com o bloco embaralhado
  (H. Kane com "Penalties taken" 0,03 e "Corners per 90" 25,00). Minutagem e gols batem
  nos dois; bola parada, só no Excel.
- **O cabeçalho do Wyscout está deslocado uma casa no bloco de bola parada.** No template
  novo a coluna duplicada de duelos aéreos do goleiro perdeu o rótulo e os sete últimos
  rótulos escorregam sobre os dados: "Corners per 90" passa a devolver porcentagem (chega
  a 100) e "Penalties taken" devolve escanteios. Quem conserta é o
  `normalizar_schema_wyscout` do próprio `ranking_engine`, **importado** em vez de
  reescrito — se o Wyscout mudar de novo, conserta-se num lugar só.
- **O `primary_key` embute o clube**, então não atravessa temporadas. A ligação é em
  duas passadas: primeiro por **id** (`player_uid` do `multiseason_candidates.parquet`),
  que é o único jeito seguro; depois **por nome**, e só quando o nome é único na
  temporada de hoje e na de lá, ainda conferindo país de nascimento, altura e idade.

  **Nome repetido não casa de jeito nenhum**, e isso custou caro para descobrir: o
  "Luiz Henrique" do Avaí recebeu 35 jogos e 7 gols na Série A do Luiz Henrique do
  Botafogo; o "Pedro" do Flamengo recebeu a temporada de um Pedro do Guabirá, na
  Bolívia — com país, altura e idade todos dentro da tolerância. Dois brasileiros de
  mesma idade e altura são indistinguíveis por esses campos. O usuário achou os dois
  na tela. Ficar sem a temporada é melhor do que mostrar a de outra pessoa.

  Contraprova de que a regra estreita não é exagerada: o Helton Leite, com Antalyaspor
  2024 → Deportivo La Coruña 2025 → Vila Nova 2026, **passa e está certo** — nome único
  nas três temporadas, 196 cm nas três, brasileiro nas três.

  Cobertura: 2.209 (2024) e 4.414 (2025) por id, mais 3.957 e 6.783 por nome; 5.243 com
  as três temporadas. O `preparar_ogol.py` existe para cobrir o resto por id de jogador.

**O oGol tapou os buracos** (`preparar_ogol.py`, coleta de 09/09): 3.847 carreiras
conferidas, 235 recusadas porque o clube da temporada corrente não batia — a conferência
funcionando — e 7.235 temporadas acrescentadas. Cobertura das três temporadas: de 5.243
para **8.006** jogadores. Ele dá **jogos**, não minutos: essas temporadas ficam marcadas
com `fonte: "ogol"`, a barrinha do card é vazada e o número no Fim de contrato vem com
"j". Nada é convertido em minutagem — seria inventar dado.

Onde aparece: as três barrinhas de minutagem no card do campograma (`barraMinutos`, com
margem negativa para não engordar o card em 1px — a altura do card é o que decide a
largura de todos), o bloco **Temporadas** no topo da matriz do Físico, e as colunas
**Gols · 3 temp.** e **Bola parada** no Fim de contrato, com os atalhos "Artilheiros
recorrentes" (EE/ED/CA, 12+ gols, marcando em 2 das 3) e "Bola parada" (2+ cobranças/90).

**O Wyscout não marca a origem do gol** — não existe "gol de bola parada" na base. O que
existe são os dois lados: quem **cobra** (escanteios + faltas por 90, pênaltis) e quem
**cabeceia** (gols de cabeça). A tela mostra os dois com esse nome, sem inventar o número
que não existe.

## Aba Físico (SkillCorner) — leitura do estudo Montoro

Matriz, não tabela: **linhas são os indicadores**, em cinco grupos (Velocidade, Uso da
velocidade, Arranque e frenagem, Giro e mudança de direção, Volume — `FS_GRUPOS`), e
**colunas são jogadores**. A régua de tudo é a coorte da posição escolhida nas Séries
A e B com ≥ N jogos rastreados (`fsCoorteAB`): cada célula mostra a barrinha do
percentil do jogador nessa coorte e o valor; nos tempos (`t_*`, segundos) menor é
melhor e o percentil é invertido. Índice do grupo = média dos percentis; índice geral
= média dos grupos — é ele que escolhe os **5 melhores de cada série**, que entram por
padrão junto com as **médias da Série A e da Série B**. Qualquer jogador com tracking
(de qualquer liga, ou do campograma) pode ser acrescentado como coluna e é lido na
mesma régua. Moldura dourada = líder da linha entre os exibidos. A primeira versão
(tabela larga com 12 métricas e índice único) foi descartada a pedido: o usuário
queria todos os indicadores, separados por grupo, com as médias A/B e os 5 de cada.

Campos novos na base para isso (`preparar_base.py`): `psv5, hsr_n, hi_n, expl, run,
acel_m, desa_m, t_spr, t_hsr, t_spr_cod, t_hsr_cod, t505_90, t505_180`, além de
`sc_n`/`sc_min` (jogos com tracking e média de minutos por jogo — o `minutes` do
SkillCorner é média por jogo, não total). Só 579 jogadores das Séries A e B têm
tracking (GOL: 5), então a régua de goleiro não vale nada.

## As abas de lista não têm cabeçalho de texto

Fim de contrato e Físico começam direto no painel de filtros. O `<h2>` repetia o nome
que já está na barra de abas e o parágrafo explicativo comia ~90px de altura; o rodapé
já diz que clicar na linha leva ao campograma. Na matriz do Físico, clube, liga e
amostra saíram do cabeçalho da coluna e foram para o balão: com dez colunas, quatro
linhas de texto por coluna empurravam a matriz para fora da tela (7 linhas visíveis
contra 14 depois).

## Duas armadilhas de CSS que já custaram tempo

- **`.rk-legenda span{display:flex}` vence `.rk-prem-cx{display:none}`** por especificidade
  (0,1,1 contra 0,1,0). O balão das premissas ficava aberto o tempo todo e achatado em
  colunas pelo flex herdado. Qualquer coisa nova dentro da legenda precisa de dois
  seletores: `.rk-legenda .minha-classe`.
- **Texto por extenso na legenda empurra a tabela.** As premissas escritas ali comiam
  quatro linhas e derrubavam de 11 para 9 as linhas visíveis. Ficaram atrás do marcador
  `ⓘ premissas`, num balão absoluto — custo de altura zero.

## Estudo Série A × Série B

Link **Série A × Série B** no rodapé dos filtros da aba Físico. Para cada posição e cada
indicador do SkillCorner, a média dos jogadores com tracking de cada série, a diferença
em % sobre a Série B e quem lidera. **Nos tempos (`t_*`) liderar é ter o número menor** —
sem essa inversão o estudo diria que a série mais lenta é a melhor. Só entram posições
com pelo menos três de cada lado, o que exclui o goleiro (5 com tracking nas duas séries).

## O coletor do oGol rende pouco, e o motivo não é o parser

`preparar_ogol.py` funciona: acha o link, lê a tabela `TEMPORADA | EQUIPE | J | G | ASS`
e **confere pelo clube da temporada corrente** — sem essa conferência ele trouxe um
"A. Moreno" do Oriente Petrolero para o A. Moreno do River Plate. O problema é a busca:
de 25 jogadores, 19 não acharam link e 4 foram recusados; sobraram 2. A busca do
zerozero.pt não lida bem com nome abreviado ("S. Beltrán", "F. Cambeses").

O caminho melhor, não implementado: buscar pela **página de elenco do clube** em vez de
pelo nome do jogador. São ~300 clubes contra 11 mil jogadores, e dentro de um elenco o
nome é único. O `elencos_ogol.py` do Portal-Botafogo já tem o parser dessa página
(`<div id="team_squad">`, não é `<table>`).

## Painel de filtros no formato do Ranking

A aba Fim de contrato usa o mesmo desenho do Ranking do hub (`:5555`): campinho
clicável para a posição (`campinhoInit`, Cmd/Ctrl combina), combos de multi-seleção
com abas de região (`mselInit`: Liga com Todos/BR/B+C/SA/EU, País com Todos/BR/SA/
Demais), botões "No exterior" (brasileiros = país Brasil + ligas não brasileiras;
sul-americanos = países SA sem Brasil + ligas fora da América do Sul), Time, Pé,
busca e sliders duplos (`rangesInit`: altura, idade, valor de mercado, overall,
minutos — só filtram quando saem de ponta a ponta, e aí excluem quem não tem o dado).
**"Contrato até" ficou como seletor de mês de propósito**: o usuário quer levar esse
modelo para o Ranking, não o contrário. Cores são as do app (coral), não o dourado
do Botafogo. A aba Físico reaproveita o campinho em modo de seleção única.

## Publicação

Preparado para **Render** (`render.yaml`): Flask com senha (`SC_SENHA`, HTTP Basic),
bases servidas como arquivo (nada na memória — o plano gratuito tem 512 MB) e disco
de 1 GB para os grupos salvos. GitHub Pages não serve: é sempre público e não roda
backend, e o usuário quis acesso restrito com grupos compartilhados.

**Falta o usuário criar a conta no Render** — não é algo que eu faça por ele. Passo a
passo em `PUBLICAR.md`. Depois, pôr o endereço no card do portal (`hub/hub_santacruz.py`,
chave `web`, hoje comentada).

## Pendências

- ~8 nomes de 44 ainda cortam com reticências em telas estreitas (o completo está no
  tooltip e na ficha).
- A ficha compara com a coorte da liga; para ligas pequenas a amostra fica curta e
  isso não aparece na tela.

## Físico: a barra e o contorno passaram a dizer a mesma coisa (set/26)

A célula tinha duas réguas ao mesmo tempo: a **cor** da barra era a faixa de percentil
(verde ≥ 75) e o **contorno** era a comparação com as médias das Séries A e B. Elas não
coincidem — a média cai perto do meio da distribuição, não no quarto superior. O caso que
levantou isso: **Bruninho, 33,40 km/h de Top 3 Peak Velocity**, batia as duas médias
(33,05 e 32,69) e ficava com contorno azul e barra cinza, porque estava no percentil 73 e
o verde começava em 75 (33,47). Coerente, mas a célula parecia se contradizer.

Agora a **cor** segue o contorno: verde bate as duas médias, âmbar bate só a mais fraca,
cinza abaixo das duas (`fsCorBarra()`, classes `cor-duas`/`cor-uma`). O **comprimento** da
barra continua sendo o percentil na posição — a informação de "quanto ele vale dentro do
grupo" não se perdeu, mudou de canal. O bloco **Temporadas** seguia uma terceira régua
("acima da média da coorte") e entrou na mesma.

`fsFaixa()` saiu. A legenda passou a ter um chip por nível (contorno + preenchimento
juntos) em vez de listar percentil e contorno separados.

## Fim de contrato marcado nas listas de escolha (set/26)

`FS_LIVRE_ATE` passou de `2026-12` para **`2027-01`**: a Série B de 2027 começa em abril,
então quem vence em janeiro está tão livre quanto quem vence em dezembro. Uma data só,
valendo para a bolinha da coluna e para o selo novo.

Nas listas (Série A, Série B, SA no exterior, campeonato, elenco do campograma e busca) o
jogador com contrato até jan/27 ganha **⏳ mês/ano**. Vai o mês, não só a marca, porque
dezembro e janeiro não valem a mesma coisa na hora de negociar. São 6.530 na base (6.387
até dez/26 + 143 só em jan/27); entre os 42 RW das Séries A e B com tracking, 11.

**Ordem dos grupos**: Volume subiu para logo depois de Uso da velocidade. Os dois falam
de terreno coberto — um na faixa alta, outro no total — e ler os dois juntos é o que
responde "ele corre muito ou corre rápido?". Arranque, frenagem e giro são outra conversa
e ficaram no fim. A ordem vale também para os eixos do radar.

## As listas de escolha deixaram de ser `<select>` (set/26)

O selo de fim de contrato entrou como texto (`⏳ dez/26`) atrás do nome e se perdia na
leitura — num `<option>` nativo não entra HTML, então não havia como desenhar nada.
Trocamos as cinco listas de jogador (Série A, Série B, SA no exterior, campeonato e
elenco do campograma) por um componente próprio, `fspPreencher()`, reaproveitando a casca
do `.msel-drop` dos filtros.

Cada linha é: colocação (ou a posição, na lista do campograma), chip do índice físico,
nome, clube e o **card da data de contrato**, encostado à direita. O alinhamento é o
ponto: os cards caem todos na mesma coluna de 44px, e dá para varrer a lista atrás de
quem vence sem ler nome nenhum. Cinza discreto para contrato longo, âmbar cheio para quem
vence até jan/27, tracejado para quem não tem data. A busca livre usa a mesma linha.

Lista com mais de 18 itens ganha campo de filtro. `fsSeloLivre()` saiu.

## Sétima premissa de montagem (set/26)

"Salário baixo, premiação alta por vitória e acesso" — contratar abaixo do mercado e
pendurar o dinheiro grande na premiação: bicho por vitória ao longo do campeonato e um
prêmio forte pelo acesso. Entrou em `PREMISSAS_INICIAIS`
(app.py) e em `dados/premissas.json` como `m7`. O texto registra que a premiação é
variável e **não entra no teto mensal de R$ 2,8 MM**, que é custo recorrente — se o
modelo passar a prever provisão de premiação, é aqui que a decisão fica escrita.

## A aba Premissas saiu (set/26)

Por pedido. As 7 premissas de montagem continuam no topo da Análise do elenco, e ali
ganharam o lápis de editar, que só existia na aba. Os outros grupos (Orçamento, Elenco,
Dados) continuam gravados em `dados/premissas.json` e valendo como registro, mas **não têm
mais tela**. Se um dia precisarem voltar, o caminho é um bloco recolhido embaixo da
Análise, não uma aba nova.

## Raio físico ⚡ (set/26)

A mesma régua do Ranking (:5053). O raio responde uma pergunta só: contra o **jogador-
referência da posição**, esse atleta é superior (verde), parecido (amarelo) ou abaixo
(vermelho)?

Referências e parâmetros vieram de `config/fisico_ref_posicao.json` do Portal Ranking para
`dados/raio_ref.json` — Jemmes (ZD/ZE), Vitinho (LD), Alex Telles (LE), Gregore-2024 (DM),
Cristian Medina (CM), J. Carrascal (AM), Matheus Martins (LW/RW), Arthur Cabral (CF).
Vitinho não tem SkillCorner nesta base: os cinco KPIs dele vieram do `skillcorner_jun26`
do Ranking. Gregore, Medina e Cabral usam os uploads manuais (56, 39 e 34 jogos), que é o
que o Ranking usa. Goleiro fica fora — o raio é de jogador de linha.

Conta: z de cada um dos 5 KPIs (PSV-99, metros em sprint, nº de sprints, metros e ações de
alta intensidade) = (jogador − referência) ÷ desvio da posição, cada z limitado a ±1 antes
da média. Média ≥ +0,75 verde, ≤ −0,75 vermelho, meio amarelo, mais os dois atalhos de
dominância do original. **O que muda em relação ao :5053 é a população que dá o desvio-
padrão** — aqui é esta base, lá é o ranking do período. Mesma pergunta, régua ligeiramente
diferente.

Aparece no card do campograma, no cabeçalho da matriz do Físico, nas listas de escolha e
na busca. 58 cards do cenário: 21 verdes, 11 amarelos, 18 vermelhos, 8 sem (goleiros e
quem não tem tracking).

## Fim de contrato no card: verde cheio (set/26)

Era texto ("até 2026"), passou a card âmbar e terminou em **verde cheio com fonte branca**,
por pedido — num campo com cem cards, quem está acabando tem de saltar sem ser procurado.
Mostra mês/ano (`dez/26`).

## Zoom por posição (set/26)

Clique na barra do topo da coluna (ou na lupa ⤢) e ela sai do campo para o meio da tela,
grande. **O elemento é o mesmo** — nada é clonado —, então arrastar, editar salário, ⋯, ×,
+ e a ficha seguem funcionando. Esc ou o fundo fecham. Os `!important` do `.pos.zoom` são
necessários porque `ajustarCampo()` escreve left/top/width inline em cada coluna.

## Aba Financeiro (set/26)

Estrutura salarial no formato do estudo que o usuário trouxe. O campograma diz *quem*; esta
aba diz *quanto custa de verdade* e *quanto o atleta leva para casa* — números diferentes, e
é aí que mora a confusão de toda negociação.

Por faixa salarial do campograma: custo efetivo (o do card) → pacote bruto = custo ÷
(1 + encargos) → divisão carteira/imagem → líquido mensal → custo do clube no período
(13 períodos: 12 meses + 13º, proporcional a contrato parcial) → líquido total (com 13º e
1/3 de férias sobre a carteira) → média líquida mensal.

**As duas alíquotas — IR+INSS na carteira e alíquota da PJ — são chute educado meu**, não
saem de lugar nenhum. Elas decidem sozinhas as colunas de líquido e dependem do
enquadramento da PJ e da faixa de IR do atleta. Estão editáveis no topo da aba e gravam com
o cenário. O estudo original tinha alíquotas progressivas por faixa (efetiva de 75% a 87%
no líquido da imagem); não as reproduzi porque não tenho a tabela, só o resultado impresso.
