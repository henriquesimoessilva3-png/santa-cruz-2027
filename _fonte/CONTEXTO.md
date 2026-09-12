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

**No ar hoje: GitHub Pages**, em `henriquesimoessilva3-png.github.io/santa-cruz-2027`,
gerado por `publicar_site.py` a partir de `docs/`. O endereço já está no card do portal
(`hub/hub_santacruz.py`, chave `web`). É público — quem tem o link entra. O que fica de
fora por não haver servidor: o comparativo entre grupos e o Excel; salvar, trocar,
renomear e excluir grupos funcionam no navegador de quem abre (seção "Salvamento de
grupos no site publicado", no fim deste arquivo).

**Render continua preparado, e não foi usado** (`render.yaml`): Flask com senha
(`SC_SENHA`, HTTP Basic), bases servidas como arquivo (nada na memória — o plano gratuito
tem 512 MB) e disco de 1 GB para os grupos salvos. É o caminho para o que o Pages não dá:
acesso restrito e grupos compartilhados entre pessoas. Falta o usuário criar a conta —
não é algo que eu faça por ele; passo a passo em `PUBLICAR.md`.

## Pendências

Vazio por ora. As duas que estavam aqui saíram em set/26 — ver "Comparativo no site,
salário médio e as duas pendências".

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

Clique na barra do topo da coluna (ou na lupa ⤢) e as **outras colunas somem**: a escolhida
fica sozinha no meio do gramado, em tamanho de leitura. **O elemento é o mesmo e continua
no mesmo lugar do DOM** — nada é clonado —, então arrastar, editar salário, ⋯, × e a ficha
seguem funcionando, e a edição atualiza o rodapé da coluna e os KPIs do topo. Esc, a barra
de novo ou um clique no gramado fecham.

**A primeira tentativa foi um flutuante `position:fixed` por cima do campo, e não podia dar
certo:** o `#campo` leva `transform:scale()` para caber na tela, e dentro de elemento
transformado o `fixed` se ancora nele, não na janela. A coluna saía na escala do campo,
recortada pelo `overflow:hidden` e por baixo do véu. A versão atual não usa `fixed` — a
coluna fica no fluxo e o `ajustarCampo()` sai cedo enquanto há zoom, sem escalar nem
distribuir. Os `!important` seguem necessários porque `ajustarCampo()` escreve
left/top/width inline em cada coluna.

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

**Selo de país legível (set/26)**: o selo (ALE, COL, URU…) era âmbar translúcido com texto
`--txt-ambar`, que é um âmbar CLARO feito para fundo escuro. O card de estrangeiro tem
fundo creme — dava amarelo sobre amarelo. Virou âmbar sólido com texto escuro, o mesmo
tratamento do `.pos-qtd.falta`, que já resolvia isso. Contraste do texto: 7,1:1. O override
de tema claro saiu junto, porque a regra agora serve aos dois.

**Centralização do zoom (set/26)**: o campo tem largura própria, calculada para
distribuir as onze colunas — costuma ser bem maior que a tela, e o `ajustarCampo`
compensa com `transform:scale`. Com o zoom o scale sai; se a largura ficasse, o card
centralizaria dentro do **campo** e não da **tela**, aparecendo colado à direita e
cortado. Foi o que aconteceu com o `app.js` em cache. Os `!important` de
`width/min-width/max-width/height/min-height/transform` em `body.com-zoom .campo`
amarram isso pelo CSS, que vale mesmo com JS antigo; o `posZoom()` ainda zera a rolagem
da área por garantia.

**Cabeçalho do Físico em uma linha (set/26)**: clube, idade e contrato tinham uma linha
cada — "Athletico Paranaense" sozinho quebrava em três — e com dez colunas o cabeçalho
comia meia tela. Viraram uma linha só (`.fs-meta`): 93px de altura contra ~140px. Só o
clube encolhe, com reticências e sem caixa alta (a caixa alta custava ~20% de largura); o
nome inteiro fica no balão do `<th>`. O contrato virou badge curto (`dez/28`), verde cheio
para quem vence até jan/27.

**"Todos os campeonatos" na lista por liga (set/26)**: além de escolher um campeonato, dá
para pedir os 511 da posição de uma vez, ordenados pelo índice físico, com bandeira por
jogador. É a pergunta "quem são os melhores do mundo nesta posição?", que campeonato a
campeonato não dá para responder.

**Correções de posição (set/26)**: `dados/posicao_overrides.json`. A posição vem do Wyscout
pela primeira sigla do campo `Position`, e nem sempre é o que o jogador faz — o F. Nicola
do Atlético Tucumán entrava como Médio sendo centroavante (oGol: Centroavante / Ponta
Esquerda). A correção fica escrita com a fonte e a data, e sobrevive à regeração da base.
**Cuidado**: a chave é a primary_key (`Nome - Clube - Liga`), então ela quebra quando o
jogador troca de clube — `aplicarOverridesPosicao()` avisa no console quais não casaram,
em vez de falhar em silêncio.

**Trocar de posição recomeça a comparação (set/26)**: os escolhidos a mão (`fsExtras`) e os
tirados (`fsOcultos`) são de OUTRA posição — carregá-los adiante mostrava volantes na régua
de médio. Pior: o `fsCongelar()` desliga os Top 5 quando se tira alguém da tela, então a
lista ficava travada nos antigos e a nova posição abria vazia. Agora a troca limpa os dois
e religa Top 5 A e B.

**As referências do raio não são parelhas — e isso importa muito.** Percentil médio da
referência na própria posição, e quanto verde sai:

| pos | referência | pctl | % verde |
|---|---|---|---|
| CM | Cristian Medina | 91 | **2,9%** |
| DM | Gregore — 2024 | 88 | 4,6% |
| RB | Vitinho | 83 | 7,8% |
| CB | Jemmes | 70 | 15% |
| AM | J. Carrascal | 57 | 24,6% |
| CF | Arthur Cabral | 39 | 45,8% |
| RW/LW | Matheus Martins | 27 | ~59% |
| LB | Alex Telles | 25 | **64,8%** |

Um médio precisa estar entre os 3% melhores para ficar verde; um lateral esquerdo basta ser
mediano. O raio **não compara posições entre si** — só o atleta contra a referência dele.
Isso é herdado do :5053 (a config de lá diz "ref forte ⇒ verde raro; ref modesta ⇒ verde
comum"), não foi introduzido aqui. O balão do raio passou a dizer o percentil da referência
para que a leitura não engane.

## O raio passou a ser MÉDIA DE REFERÊNCIAS, não um jogador (set/26)

Decisão do usuário, depois de eu mostrar que a régua de jogador único era desigual demais.
`_fonte/gerar_raio_ref.py` monta `dados/raio_ref.json` com duas médias por posição:

- **Referências Brasil** — lista curada de mar/25 (`config/refs_brasil.json` do Portal Ranking)
- **Referências Mundo** — elite mundial (`config/fisico_refs.json`, as mesmas do Scanner/Carreira TOP)

De cada grupo sai a média dos 25 indicadores, com os valores desta base. **O raio julga
contra a média BRASIL**: abaixo vermelho, similar laranja, acima verde. As duas médias
também viraram colunas na matriz do Físico (checkbox "Referências BR e mundo").

Cobertura: Mundo casou 43/43. Brasil casou 12 de 29 — a lista é de mar/25 e vários mudaram
de nome ou de clube. Um mapa de apelidos em `gerar_raio_ref.py` resolveu a maioria; ficaram
de fora por não ter SkillCorner nesta base: Gustavo Gómez, Mayke, Wesley, Aníbal Moreno,
Villasanti, N. de la Cruz, Estêvão e Lucas Moura. **RW e LW ficaram com um jogador só
(J. Arias)** — média de um não é média, e é o buraco mais sério da lista.

Ficou mais parelho, mas não parelho: o percentil médio da referência ia de 25 a 91 e agora
vai de 25 a 83.

| pos | refs | pctl | verde | laranja | vermelho |
|---|---|---|---|---|---|
| DM | 2 | 83 | 7,3% | 21,8% | 70,9% |
| RB | 2 | 81 | 8,8% | 24,1% | 67,1% |
| CM | 3 | 77 | 9,6% | 30,6% | 59,8% |
| LB | 3 | 54 | 26,5% | 41,3% | 32,3% |
| RCB/LCB | 2 | 49 | ~31% | ~45% | ~24% |
| CF | 5 | 43 | 36,8% | 39,6% | 23,5% |
| RW/LW | 1 | ~41 | 40,8% | ~39% | ~20% |
| AM | 3 | 25 | 54,2% | 34,9% | 10,9% |

A causa é real, não é defeito: as listas são curadas por qualidade de futebol, não por
paridade física. Os volantes de referência (Gregore, Pulgar) são atletas; os meias
(Alan Patrick, Savarino, Garro) são técnicos.

**Cache-buster consertado de vez**: `versao_dados()` só olhava `jogadores.json` e
`historico.json`, então o navegador servia `raio_ref.json` velho com `app.js` novo — as
colunas simplesmente não apareciam, sem erro nenhum. Agora a assinatura cobre todos os
arquivos que o app busca em `/dados`, e o `publicar_site.py` usa o maior mtime entre eles.

**Por que jogadores da lista ficam de fora (set/26)** — duas causas, e só uma tem conserto:

1. **Wyscout abrevia o primeiro nome.** "Gustavo Gómez" está na base como `G. Gómez`,
   "Aníbal Moreno" como `A. Moreno`. Sem apelido eles somem da lista **sem aviso** e a
   média da posição fica com um jogador a menos. Resolvido com o mapa `APELIDOS` em
   `gerar_raio_ref.py` — recuperou 3 (Gustavo Gómez, Aníbal Moreno e o Wesley, que saiu
   do Flamengo para a Roma). O `CLUBE` desempata homônimos: sem ele, "A. Moreno" pegava o
   da Bolívia e "Wesley" o do Catar. Homônimo é o jeito mais silencioso de botar o
   jogador errado na régua.
2. **Sem tracking do SkillCorner nesta base** — não tem conserto do nosso lado. A
   cobertura do Brasil A é de **18%** (297 de 1.669); a da Série B, 25%; a Espanha A tem
   55%. Ficaram de fora por isso: Mayke, Villasanti, N. de la Cruz, Estêvão e Lucas Moura.

Depois da recuperação, a lista Brasil tem 3 jogadores em quase todas as posições — **menos
RW e LW, que seguem com um só (J. Arias)**, porque Estêvão e Lucas Moura são justamente os
dois sem tracking. Média de um não é média: é o buraco que resta.

**Pontas acrescentados pelo usuário (set/26)**: a lista curada tinha um grupo "EXT" só,
sem separar ponta direita de esquerda, e depois do corte por falta de tracking sobrava
**um jogador** nos dois lados. O usuário nomeou quatro, agora por lado (`EXTRA_BR` em
`gerar_raio_ref.py`):

- **LW**: Samuel Lino (Flamengo, 26a, 23 jogos) e Andrés Gómez — na base como `A. Gómez`
  (Vasco, 23a, colombiano, 21 jogos)
- **RW**: Gonzalo Plata (Flamengo, 25a, 14 jogos) e Canobbio — `A. Canobbio` (Fluminense,
  27a, uruguaio, 18 jogos)

O Plata tem uma segunda linha no Dynamo Moscow sem físico; o desempate por clube resolve.
Agora **toda posição tem 3+ referências** e os dois lados deixaram de ser idênticos: RW
subiu do percentil 43 para 66 e LW para 60 — os pontas ficaram uma régua séria, como já
eram volante e lateral-direito.

## A barra da matriz: terceira tentativa, e a que presta (set/26)

1. **Percentil na coorte** — satura. Qualquer valor acima do melhor brasileiro virava
   100%, então a Ref. Mundo (quase sempre fora da faixa daqui) ficava do tamanho de um
   jogador bom qualquer.
2. **Proporcional ao maior (v ÷ máx)** — não discrimina. Velocidade de pico vai de 31 a
   33 km/h: todas as barras davam 95%, porque a escala começava no zero e o zero não diz
   nada nesse indicador.
3. **A que vale**: cada linha define o próprio intervalo, do pior ao melhor entre TUDO que
   ela desenha — médias, referências e jogadores — e a barra é a posição dentro dele. Nos
   tempos (`menor`) inverte. Piso de 8% para o último ainda aparecer. O percentil na
   coorte segue no balão.

## Quatro níveis de contorno (set/26)

Vale o **maior** que o jogador alcança, e a mesma cor pinta contorno e preenchimento:

| cor | significa |
|---|---|
| roxo `#a855f7` | acima da média das referências do **mundo** |
| bonina `#b0143c` | acima da média das referências do **Brasil** |
| azul `#3b9dff` | acima das médias da Série A **e** da B |
| âmbar `#e2a51f` | acima só da mais fraca das duas |

As duas primeiras são as cores das próprias colunas de referência, para o olho ligar a
célula marcada à barra que ela superou.

**O contorno tem quatro cores; o preenchimento continua com duas.** Bonina e roxo no
miolo das células dos jogadores faziam a matriz inteira parecer bonina e roxa, e as
colunas de referência deixavam de saltar. A barra do jogador segue verde acima das duas
médias da liga, âmbar acima só da mais fraca, cinza abaixo — `fsCorBarra()` compara com
as médias, `fsGanho()` decide o contorno.

**Barra de rolagem horizontal**: `nCols` não contava as colunas de referência nem a coluna
"ganha", então a largura sobrava por quase três colunas. Além disso `FS_COL_MIN` (92px) era
um piso rígido — com dez jogadores em tela de 1440px não cabia. Entrou `FS_COL_ABS = 70`:
espremer até 70 é melhor do que rolar de lado, e o nome cortado está inteiro no balão.

**Bug antigo na legenda**: `.rk-legenda i` é uma bolinha de 7×7 com `border-radius:50%` e
ganhava dos chips por especificidade (classe+elemento contra classe). As barrinhas viravam
pontos e o card "dez/26" era espremido num círculo de 7px, com o texto vazando por cima da
linha ao lado. Resolvido com `.fs-legenda i.<classe>`.

**Cabeçalho embolando com a tabela (set/26)**: as células com contorno usam
`position:relative` + `z-index` 1..4 para a moldura de uma não ser cortada pela vizinha.
O cabeçalho sticky estava em `z-index:3` — as células roxas (4) passavam **por cima** dele
ao rolar. Cabeçalho foi para 30, a primeira coluna para 20 e o canto para 40.

## Resumo primeiro, detalhe ao clicar (set/26)

O usuário reclamou de excesso de informação — com razão: 25 indicadores × 15 colunas são
quase 400 células, quase todas marcadas, e quando tudo se destaca nada se destaca.

A matriz passou a abrir com **sete linhas**: Temporadas (fechado, mostrando os minutos
somados das três), Índice físico geral e os cinco grupos. Cada grupo abre ao clique e
mostra os indicadores dele. Nada foi removido — mudou quem decide o que aparece. O estado
fica em `localStorage` (`sc2027_fs_abertos`), então a tela volta como foi deixada.

**As médias e as referências ganharam índice**: `fsIndices()` lê um mapa
indicador→valor, e `co.A.m`, `co.B.m` e `refs[pos].brasil.valores` são exatamente isso.
Sem esses chips a linha de resumo falaria só dos jogadores e não daria contra o que
comparar.

Foram oferecidos quatro layouts (resumo por grupo, mapa de calor sem números, "só o que
diferencia" escondendo indicadores sem dispersão, e ficha por jogador com radar). O
usuário deixou a escolha comigo. Escolhi o resumo por grupo por cortar mais ruído sem
tirar nada do alcance — os outros três seguem valendo como caminho, principalmente o
"só o que diferencia", que resolveria o mesmo problema por outro ângulo.

## Destaque das referências: tarja em vez de contorno (set/26)

O contorno da célula inteira marcava quase tudo — e o que marca tudo não marca nada. Pior,
era uma **escada**: quem batia o mundo mostrava só roxo, e não dava para ver que também
tinha batido o Brasil.

Agora são duas perguntas **independentes**, numa tarja fina na borda esquerda partida ao
meio: metade de cima roxa quando está acima da referência do mundo, metade de baixo bonina
quando está acima da do Brasil. As duas acendem juntas, a célula que não bate nada fica
limpa, e o custo de espaço é zero (a tarja é absoluta). O preenchimento da barra continua
dizendo outra coisa: verde acima das duas médias da liga, âmbar acima só da mais fraca.

No resumo de cada grupo, o balão do chip diz **em quantos indicadores** o jogador passa de
cada referência ("passa da ref. Brasil em 6 de 6 e da ref. mundo em 5 de 6") — a mesma
pergunta da tarja, respondida sem precisar abrir o grupo.

Um achado dos dados: nenhum jogador passa da referência do **mundo** sem passar também da
do **Brasil**. A tarja roxa sozinha, na prática, não aparece.

## Físico: três formas de ver além da matriz (set/26)

O usuário achou a matriz carregada, recusou o resumo por grupo como resposta única e pediu
"lógica totalmente diferente". Foram gerados dez desenhos de marcação de célula e depois
cinco layouts que abandonam a matriz (agentes sob paradigmas distintos, juízes rodando o
código contra os dados reais; ver `_fonte/propostas-marcacao/`). Ele escolheu três para
entrar no app como **formas de ver**, trocáveis num seletor ao lado de "Limpar comparação":

- **Matriz** — a tabela de sempre (continua sendo o padrão)
- **Mapa** — mapa de quadrantes: cada jogador é um ponto; direita = passa da ref. Brasil em
  mais indicadores, cima = passa da do mundo; painel lateral abre os cinco grupos
- **Réguas** — cinco réguas 0–100, uma por grupo; os 42 são traços, os comparados têm nome,
  as referências são marcas grossas; à direita da roxa = acima do mundo
- **Tiras** — por indicador, a coorte inteira como pontos, corredor sombreado entre as
  referências; mostra onde o jogador cai *na população*

**Como está montado.** `static/fs_visoes.js` traz os três renderizadores como vieram das
propostas — cada um é `function(D, el)` — e injeta o CSS deles escopado por
`.fs-vis-mapa/.fs-vis-reguas/.fs-vis-tiras`. `fsPacote(co, colunas)` em `app.js` monta o
pacote `D` ao vivo (coorte + comparados de fora dela, sem repetir; médias; as duas
referências com índice e percentil na régua de sempre). `fsDesenharVisao()` decide o que
fica visível: a matriz continua sendo montada sempre (é ela que alimenta o rodapé e os
botões das colunas), o palco `#fsPalco` só aparece nas outras três. A escolha fica em
`localStorage` (`sc2027_fs_visao`).

**Tokens.** Os layouts nasceram com uma paleta própria (`--ink`, `--sup`, `--bonina`...).
Em vez de reescrever o CSS deles, `.fs-palco` define esses nomes como apelidos dos tokens
do app — trocam com o tema claro sem regra duplicada.

**Goleiro.** O raio não tem referência para goleiro (é régua de jogador de linha), então as
três formas mostram um aviso e mandam para a Matriz — antes de descobrir isso com uma
exceção.

Testado por Playwright contra o servidor real: 3 posições × 4 formas, zero erro de
console. Uma revisão adversarial (adaptador, Tiras, tema claro) roda depois.

**Fechamento das três formas (set/26).** Revisão adversarial em dois fluxos de agentes,
com verificador tentando refutar cada achado contra o servidor real:

- **Destaque casava por nome** — grave. Com homônimos (4 pares reais na mesma posição: dois
  Juninho, dois Vitinho, dois Marlon, dois Wallace) o gráfico destacava o errado ou
  duplicava. Agora `fsPacote()` entrega `destaquePks` e os três layouts casam por chave;
  o nome é só rótulo. Contra-prova: os dois Juninhos juntos na comparação aparecem como
  dois, cada um no seu lugar.
- **`data-pk` em todo elemento que representa um jogador** (pontos, traços, nomes, chips
  das três formas). É o que liga o balão genérico, o clique-para-comparar, o painel de
  foco e a classe `.foco`. Balão: o genérico cede ao do layout sempre que ele existir —
  um `MutationObserver` no palco vê o balão do layout aparecer (abre no mousemove, depois
  do mouseover) e esconde o genérico; listeners em fase de captura porque as réguas
  interrompem a propagação no traço.
- **Painel de foco** (`#fsFoco`, acima do gráfico): clicar num jogador abre os cinco grupos
  com régua 0–100 e as marcas das duas referências, e os 25 indicadores com valor,
  percentil e as tarjas Brasil/mundo. Fecha no ×, na troca de posição ou clicando outro.
- **Tirar da comparação**: chips com × acima do palco (`#fsChips`) e um × genérico
  (`data-tirar`) nos chips de cada gráfico — o app resolve os dois com `fsTirar()`, o mesmo
  do × da matriz (congela as receitas do Top 5 no primeiro uso, como sempre).
- **Mapa**: o painel lateral ganhou os valores dos indicadores sob cada grupo (com
  percentil e as marcas Brasil/mundo); o rótulo do ponto mais à direita não corta mais.
- **Tiras**: o cabeçalho embolado era o JS gerando classes `lN-*` que o CSS (escopado em
  `.fs-vis-tiras-*`) nunca casava. Corrigido no JS.
- **Tema claro**: `--ambar`/`--verde`/`--roxo` davam 1,8–3,4:1 sobre o palco claro. Dentro
  do palco, no claro, apontam para `--txt-ambar`/`--txt-verde`/`#7e22ce`; halo dos pontos
  virou `--halo` (fundo no escuro, tinta no claro).
- **`raio_ref.json` ainda não carregado**: aviso próprio ("carregando…" / "indisponível")
  em vez da mensagem de goleiro, e `iniciar()` redesenha a aba quando o arquivo chega.
- **Comparado de fora da coorte** conta como "+1 de fora", não como 43º da população.
  Ressalva conhecida: no mapa, a contagem por quadrante inclui o de fora se ele cair ali.
- Cabeçalho da matriz: "Média A / Média B" com a série na linha de baixo — o "SÉRIE"
  cortava e escondia justamente a série.

Regressão final: 11 posições × 4 formas × 2 temas = 88 combinações, zero erro de
console; homônimos certos nas três formas.

## Salvamento de grupos no site publicado (set/26)

O site do GitHub Pages não tem servidor, e até aqui `prepararEstatico()` simplesmente
escondia o seletor de cenários, o Salvar, o Renomear e o Excluir — quem abria o site
podia mexer no campograma mas não guardar nada com nome. O usuário pediu "essa visão de
salvamento" na web.

**Como ficou.** As quatro funções de cenário (`listarCenarios`, `salvarCenario`,
`abrirCenario`, excluir) ganharam um segundo backend, escolhido por `ESTATICO`:

- **Publicados** — `dados/cenarios_publicados.json`, gerado pelo `publicar_site.py` a partir
  de `dados/cenarios.json` na hora de publicar, sem os vazios (sem nome ou sem atleta),
  com o elenco completo. São **só leitura**: modelos de partida iguais para todo mundo.
  Hoje: MODELO A (33), MODELO B (28) e Cenário 1 2027 (118).
- **Salvos neste navegador** — `localStorage` (`sc2027_cenarios`). Salvar grava por cima
  se o grupo já tem id — inclusive um publicado: a cópia do navegador passa a valer para
  aquela pessoa, e o publicado continua para os outros. Excluir tira só a cópia local.
- O seletor mostra os dois blocos em `optgroup`, e o rótulo "· publicado" no segundo.
- O que continua fora no site: o comparativo entre grupos (`api/comparativo`) e o Excel.

**O que isso não é**: sincronização. O que se salva no site fica naquele navegador,
naquele aparelho. O jeito de "publicar" um grupo continua sendo salvar no app local
(`:5090`) e rodar o `publicar_site.py`, que leva os cenários gravados junto.

Testado no build servido localmente (`python -m http.server` em `docs/`): lista com os
três publicados, salvar cria a cópia e sobrevive ao recarregar, abrir o MODELO A carrega
os 33, excluir remove só a cópia; o Flask segue igual. O `elenco_inicial.json` do site
passou a ser o Cenário 1 2027 com 118 atletas (salvo hoje às 16:47).

Conferido no ar em 10/set: seletor com os três publicados em `optgroup`, Salvar visível,
o Cenário 1 2027 abre com 118 atletas, salvar por cima do publicado move o grupo para
"Salvos neste navegador" (o publicado some da lista, porque a cópia vence), excluir
devolve o publicado com o aviso "Sua cópia foi excluída; o publicado continua na lista".
Zero erro de console no carregamento.

## Levar para o campograma, escolhendo a posição (set/26)

O ↗ que sobe um jogador para o campograma existia **só no cabeçalho da matriz** — e
Mapa, Réguas e Tiras escondem esse cabeçalho. Nessas três formas dava para comparar e
analisar, mas não para trazer ninguém: era preciso voltar à matriz, achar a coluna e
clicar lá. O ↗ agora está em **três lugares**, todos chamando o mesmo código:

- no **chip** de cada comparado (acima do palco), que é o que vale nas três formas novas;
- no **cabeçalho da matriz**, onde já estava;
- no **painel de foco**, como `↗ campograma` ao lado do `+ comparar`.

**A posição virou escolha.** O ↗ jogava direto na posição que o jogador tem na base: um
CF que você quer experimentar de EE ia para o lugar errado e só dava para arrumar
depois, no menu do card. Agora ele abre uma grade com as onze posições — a dele com
contorno verde, a que ele já ocupa apagada, e o balão de cada uma dizendo quantos já
estão ali. Mesmo desenho do "Mover para" do card, para não existirem dois jeitos de
fazer a mesma coisa. O `posOrig` continua guardando a posição de origem.

**Dois detalhes que custariam tempo depois:**

1. O `.menu` nasceu ancorado a um botão do cabeçalho e traz `right:0`. Somado ao `left`
   que o JS calcula para menus soltos, o menu **estica de ponta a ponta**: medi 1582px
   numa tela de 1512. Valia para o menu do card **desde sempre** — `right:auto` nos dois.
2. O `.menu-jog` põe `" ✓"` no item marcado. Num botão de sigla de 10px em grade de
   cinco colunas isso empurra o texto e desalinha a grade; na grade o marcador é o
   contorno verde, e o ✓ fica suprimido.

A busca do jogador passou de `id` para **chave** (as duas identificam sem ambiguidade —
conferi que as 40.059 chaves da base são únicas), com varredura na BASE de rede porque
o mapa da aba só tem os ~9 mil com tracking.

Regressão: 4 posições × 2 formas, menu abrindo com a posição certa marcada nas oito,
zero erro de console; tema claro conferido; e levar um AM para LW pôs o jogador em LW
com `posOrig` MEI, com a segunda tentativa recusada.

**O mesmo menu na aba Fim de contrato (set/26).** Ali a linha já levava ao campograma,
mas sempre na posição da base. Agora a linha **e** o botão (`levar p/ RCB ▾`) abrem a
mesma grade, ancorada na célula clicada, com `fcRender` depois para a linha ganhar a
marca de "já está no elenco". As três funções perderam o prefixo `fs` — `basePorPk`,
`levarAoCampograma`, `menuLevar` — porque servem duas abas, e prefixo errado é o começo
de alguém duplicar a função na outra aba. A varredura na BASE deixou de ser rede e
virou o caminho principal: a Fim de contrato lista a base inteira, e o mapa da aba
Físico só tem os ~9 mil com tracking.

**O defeito que quase passou, e como quase passou.** Existe um fechador global de menus
no clique do documento (`$$('.menu').forEach(m => m.classList.remove('aberto'))`). Quem
abre um menu sem barrar a propagação vê o **próprio clique** apagar o `aberto` do menu
recém-criado: ele nasce montado, com os onze botões, e **invisível**. Três dos quatro
pontos de entrada tinham isso — só o chip barrava, por acaso. E o primeiro teste não
pegou porque perguntava `!!menu`, que dá verdadeiro para um elemento `display:none`:
**existir não é aparecer**. O `menuLevar` passou a receber o EVENTO em vez do botão e
barra a propagação ele mesmo, que é o que impede o quarto ponto de entrada de repetir
o erro. Daí em diante a regressão passou a medir `display` e largura, não existência.

**A mesma grade na aba Análise do elenco (set/26).** Ali o pedido não cabia como estava:
os dois blocos com jogadores — Maiores salários e Estrangeiros nas escolhas — listam
quem **já está no elenco**, então "levar ao campograma" não quer dizer nada. O que faz
sentido é **mover de posição**, que é a ação equivalente. As linhas viraram clicáveis e
abrem a mesma grade, com o cabeçalho dizendo `Mover Fulano para` em vez de `Levar`, e a
posição atual apagada — mover para onde já está é um clique que não faz nada.

Para não haver duas grades, o menu virou `menuPosicao(ev, cfg)`, e `menuLevar` e
`menuMover` são dois usos dela: mudam o verbo, o que bloqueia cada botão e o que o
clique faz (`adicionarDaBase` contra `moverJogador`). O desenho é um só de propósito —
quem aprende a grade numa aba a usa nas outras.

Os handlers são **delegados no `#pgAnalise`**: os dois blocos se redesenham a cada
`render()`, e handler preso ao elemento morreria no primeiro redesenho.

O balão da posição atual saía com `é a posição dele · já é a posição dele`. O motivo do
bloqueio passou a mandar no texto quando existe.

Regressão dos **sete pontos de entrada** — Análise (dois blocos), Fim de contrato (linha
e botão), Físico (matriz, chip, painel de foco): menu visível, dentro da tela e com o
verbo certo nos sete, zero erro de console. Mover um meia para goleiro tirou um de MEI,
pôs um em GOL e manteve o total em 118, com o card aparecendo no campograma.

## Comparativo no site, salário médio e as duas pendências (set/26)

**1. O comparativo entre grupos voltou para o site.** Era a última tela que faltava lá, e
a razão de faltar tinha prazo de validade: a conta vivia no `api/comparativo`, mas é
**pura** — soma salário, aplica o fator, junta por setor — e desde o salvamento na web os
grupos já estão no navegador (publicados + `localStorage`). `comparativoLocal()` faz a
mesma conta do lado de cá; `abrirComparativo()` escolhe a fonte pelo `ESTATICO`. Só o
**Excel** continua de fora, porque é o servidor que monta o xlsx com openpyxl.

**E o comparativo nunca esteve escondido de verdade.** O `prepararEstatico()` escondia
`#btComparativo` — um id que **não existe**. O botão real é `#btComparar` e mora dentro do
menu Grupo. Como `$()` devolve null e o guarda `if (e)` pula em silêncio, esconder por id
errado não dá erro nenhum: durante todo o tempo em que o comparativo "estava fora" do site,
o botão continuou lá, visível e clicável, buscando um `api/comparativo` que no Pages é 404.
Clicar não fazia nada, sem aviso. Quem mexer naquela lista tem que conferir se o seletor
casa com algo — é o tipo de engano que não aparece em teste que pergunta "escondeu?", só em
teste que pergunta "esse seletor acha alguma coisa?".

Os dois lados **têm que dar o mesmo número**, então os campos e a ordem são os do endpoint,
um a um. Conferido plantando os três grupos reais no `localStorage` e rodando as duas
contas: **3 grupos × 18 campos = 54 comparações, zero divergência**, incluindo `idadeMedia`
até a última casa decimal. Quatro casos de borda (grupo vazio, listas vazias, atletas sem
salário nem idade, um atleta só) sem NaN nem Infinity.

**2. O "Médio" do cabeçalho dividia pelo elenco inteiro.** Com 97 de 118 ainda sem salário
lançado, o tile dizia **R$ 16,2 mil** quando a média de quem tem salário era **R$ 91,2 mil**
— 5,6 vezes menor, e é o tipo de número que alguém repete numa reunião. Passou a ser a
média de **quem tem salário**, com a base no rótulo (`Médio de 21`) no mesmo molde do
`de 9` dos estrangeiros, e o balão dizendo quantos ficam de fora.

A mesma definição foi para os **três** lugares que respondem essa pergunta — o tile, o
`api/comparativo` e o `comparativoLocal()` — porque "salário médio" não pode querer dizer
duas coisas no mesmo app. Nos grupos onde todo mundo tem salário (MODELO A e B) o número
não mudou; só mudou onde estava errado.

**3. A pendência da ficha virou aviso de amostra curta.** Toda a leitura da ficha — barra,
média, melhor, radar — sai da coorte da posição na liga do jogador. Das **724 combinações
liga×posição** da base, **39 têm 20 jogadores ou menos** e uma tem **4**; são 566 jogadores
em coorte de até 20. Aí "acima da média" quer dizer "acima de outros seis", e um único nome
puxa o "melhor" da régua. O número sempre esteve no rodapé, mas em letra miúda, no pé,
depois de toda a leitura — tarde demais para mudar a conclusão de quem já leu. Agora há uma
tarja no **topo**, colada no seletor de com-quem-comparar, que é justamente a saída: âmbar
abaixo de 30, coral abaixo de 12. Trocar para Brasil A/B/C ou todas as ligas apaga o aviso
(conferido: 4 → 248 → 3.026 num ED do Footlink).

**4. A pendência dos nomes não reproduz mais.** Ela dizia que ~8 de 44 cortavam com
reticências em telas estreitas. Medi `scrollWidth` contra `clientWidth` nos 118 nomes, em
900, 1180 e 1512px, nas quatro combinações de orientação × denso: **zero reticências em
todas**. O `limiteNome()` + `nomeCurto()` abreviam ANTES de o CSS precisar cortar — em
900px, 67 dos 118 aparecem como "P. Vítor", e **todos** têm o nome inteiro no balão. O
sintoma descrito acabou junto com o trabalho de layout do campograma; a pendência era
registro velho, não bug vivo.

## "Salvar na web tem que valer para todos" — Firebase (set/26)

O usuário salvou um grupo no site, viu aparecer em "Salvos neste navegador" e perguntou
por que não estava publicando. **Não era defeito**: o Pages não tem servidor, então o
`localStorage` é o único lugar possível, e ele é por aparelho. O pedido — *toda vez que
salvar na web deve ficar disponível para todos* — exige um lugar fora do navegador.

**Firebase, não Render.** Os dois resolvem. O Firestore ganha em dois pontos: o site
continua no Pages, e nada dorme (no Render gratuito a primeira abertura leva ~50 s). O
Render ganharia só no Excel, que precisa do Python. Plano gratuito do Firestore: 1 GiB,
50 mil leituras e 20 mil gravações por dia, sem cartão — um grupo ocupa ~19 KB.

**Projeto SEPARADO do `ranking-botafogo`, e a razão não é organização.** O Portal Ranking
grava no Firestore **sem nenhuma autenticação** — `grep firebase.auth` no
`portal_ranking_botafogo.py` dá **zero**. Isso só funciona com regra aberta. Se o Santa
Cruz entrasse no mesmo projeto: ou herdava a regra aberta, e aí a **folha salarial** ficava
world-writable num site **público**; ou as regras eram fechadas e **as estrelas do Ranking
paravam de salvar na hora, sem erro na tela**. Projeto novo evita os dois. Foi o usuário
quem propôs a separação, pelo argumento certo: é outro clube.

**Config fora do código.** `dados/firebase.json`, buscado em tempo de execução. Motivo
técnico: `projectId` vazio = nuvem desligada, e o site é exatamente o de antes — dá para
subir a canalização inteira sem ligar nada. Motivo prático: ligar depois é colar seis
valores num JSON, sem tocar em `app.js`. (Ao escrever a config direto no código, o
classificador de segurança do Claude Code bloqueou a ação, lendo a `apiKey` como
credencial; ela é pública por desenho do Firebase, mas o arquivo separado é melhor de
qualquer jeito.)

**Precedência das três origens: nuvem > navegador > publicado.** A nuvem vem primeiro
porque é a única compartilhada — se um grupo existe lá, é ele que todos têm de ver, senão
duas pessoas olhariam números diferentes sob o mesmo nome.

**Salvar logado NÃO cai para o `localStorage` se a nuvem recusar.** Seria o pior dos
mundos: a pessoa acreditando que compartilhou quando só guardou no próprio aparelho. Falhou,
para, e o toast diz o motivo. O erro mais provável é `permission-denied`, que quer dizer
"entrou, mas o e-mail não está na lista das regras" — por isso ele tem texto próprio.

**O aviso saiu do balão para a barra.** Antes o "salva no seu navegador" vivia só no
`title`, escondido atrás do mouse — foi exatamente por isso que a expectativa quebrou.
Agora o estado está escrito na barra das abas: `salva só neste navegador` ou
`salvando para todos`.

Testado com a nuvem **desligada** (o estado em que o arquivo nasce): site idêntico ao de
hoje, salvar grava em `nav-…` no navegador, comparativo com as 4 colunas, zero erro; e o
app local do `:5090` sem SDK, sem botão, Excel visível, zero erro. O caminho **com** nuvem
só dá para testar depois que o projeto existir.

**Projeto criado e nuvem ligada (11/set/26).** `Santa Cruz - Data Scout`, id
`santa-cruz-data-scout`, plano Spark, Firestore `(default)` em `southamerica-east1`,
login do Google ativo e `henriquesimoessilva3-png.github.io` na lista de domínios
autorizados. A config foi para `dados/firebase.json`.

Regras conferidas **contra o banco real**, sem login: leitura da coleção `cenarios`
recusada, leitura de `selecionados`, `usuarios` e de um nome inventado recusadas, e
escrita anônima recusada — todas com `permission-denied`. É a prova de que a regra
final fechada (`match /{document=**}`) está pegando, e não só a específica.

## Escala do campo: cards maiores, com rolagem (set/26)

Pedido: "cards maiores, mesmo que tenha scroll vertical e horizontal". Os dois modos que
existiam **não davam isso** — `k = Math.min(1, disp / alt)` nunca passa de 1, então os
dois ENCOLHIAM e a diferença entre eles era só a fonte. Medindo: "caber na tela" dava
card de 141px e **"tamanho real" dava 194px em scale(0,77)** — ou seja, o rótulo dizia
"tamanho real" mostrando 77%. Com 118 atletas o card virava carimbo.

Virou uma roda de cinco, no mesmo botão: `caber na tela · tamanho real · 125% · 150% ·
200%`. Da segunda em diante a escala é FIXA e quem rola é a área. Card medido: 141 → 194
→ 243 → 291 → 388px.

**Por que `transform: scale` e não card mais largo**: `--fz` mexe só nas fontes (a largura
de `.pos` é fixa em 224px) e `distribuir()` calcula as posições das medidas reais.
Escalar por transform deixa a conta de layout intacta — é o mesmo caminho já usado para
encolher, do outro lado. `transform-origin: top left`, senão metade do campo cresce para
fora à esquerda e acima, onde não há rolagem que alcance. Em 100% não se aplica transform
nenhum: `scale(1)` cria camada de composição à toa e borra texto de graça.

**Dois defeitos que só apareceram medindo:**

1. **rAF atropelando modo.** O caminho "caber" reaplica a escala dentro de um
   `requestAnimationFrame`. Trocando para 150% antes dele rodar, ele punha o `scale(0,77)`
   por cima do `scale(1,5)` recém-aplicado: o campo voltava ao tamanho antigo e o botão
   dizia 150%. Cada rAF agora confere se o modo ainda é o dele (`escalaAtual() !== zoom`)
   antes de tocar em qualquer coisa.
2. **Rodapé preso no modo anterior.** O texto só era escrito dentro do rAF; quando o
   guarda acima barrava, ficava a frase velha — dizia "campo em 200%" com o campo em 72%.
   Agora `escreverInfo()` roda síncrono logo após aplicar, e o rAF só refina.

`estado.zoom` é novo; grupo salvo sem ele cai no antigo `estado.ajustar` (booleano), que
continua sendo gravado porque a impressão ainda o lê. No papel a escala fixa é ignorada —
a folha tem tamanho fixo e ampliar só cortaria o campo.

## Aba Empresários (set/26)

Quem negocia não é o jogador, é quem cuida dele. Telefone do empresário, quanto o atleta
ganha hoje, quanto está pedindo — isso vivia em conversa de WhatsApp e caderno. Agora fica
ao lado do elenco, e **gravado dentro do cenário**, então viaja junto no Salvar.

Uma linha por jogador do campograma, **agrupada pela posição** e na ordem do campo, com
nome, clube, idade e fim de contrato vindos do elenco. Campos editáveis: **Status**
(Main · Squad · Youth), empresário, empresa, IG da empresa, IG do jogador, telefone,
salário atual, pedida e faixa para o clube.

**A chave é `pk`, não `uid`.** Isso decide se o trabalho se perde: `pk` (nome-clube-liga)
é estável entre grupos, então anotar o empresário do Fulano no Cenário 1 aproveita no
Cenário 2; `uid` é por linha do elenco e morreria na primeira troca de grupo.

**Jogadores de fora** entram pelo "＋ jogador de fora", com nome, clube, idade, contrato e
posição editáveis — porque conversa com empresário quase sempre traz nome que ainda não
está no elenco, e perder isso obrigaria a anotar noutro lugar, que é o que a aba veio
resolver.

Detalhes que valem: os campos de dinheiro passam pelo `paraNumero()`, então "150 mil" e
"130k" viram 150000 e 130000. O `@perfil` do Instagram vira link clicável dentro do próprio
campo, e o ↗ some quando não há perfil. A tarja âmbar à esquerda marca quem ainda não tem
nada anotado — é a fila de trabalho — e apaga **na hora** em que se digita, não no próximo
render. O CSV sai com `;` e BOM, que é o que faz o Excel em português abrir em colunas sem
embaralhar acento.

**Dois erros de layout que só a tela mostrou:**

1. **Seção no pai errado.** Colei o `<section>` antes do `#ficha`, que é filho do
   `#pgCampo` — então a aba nova nascia dentro do Campograma e ficava com **0×0 px**
   quando o Campograma era escondido. O DOM tinha as 119 linhas e a tela estava em branco:
   medir `querySelectorAll` dizia que estava tudo certo. O `getBoundingClientRect` é que
   denunciou.
2. **Flex-column estica os filhos.** `.emp-c-jog` é coluna, e o padrão `align-items` é
   `stretch`: o botão "+" da ficha e o selo de estrangeiro viravam uma barra atravessando
   a linha inteira. `align-items:flex-start` e o nome numa linha própria.

**Atalho do card para a aba (set/26).** Cada card do campograma ganhou um ☎ que abre a
aba Empresários **na linha daquele jogador**: limpa os filtros (senão a linha pode estar
escondida por um filtro esquecido), rola até ela, acende por um instante e põe o cursor
no campo do empresário. O botão fica verde quando já há empresário anotado — dá para
varrer o campograma e ver de quem já se sabe o contato, sem trocar de aba. A mesma ação
está no menu ⋯, para quem procurar por lá.

**A armadilha do seletor:** a chave é `pk:Paulo Vítor - Atlético GO - Brasil B`, com
acento, espaço e hífen. Montar `input[data-ch="…"]` com ela e passar por `CSS.escape`
**não casa** — `CSS.escape` serve para IDENT, não para o miolo de um valor entre aspas.
O foco simplesmente não acontecia, sem erro nenhum no console. Comparar `dataset.ch` num
`find` é exato e imune.

## Aba Indicados, e dois defeitos que ela destapou (set/26)

Mesma ideia do Indicados do Scout System: a fila do que chega de fora. Empresário liga,
manda nome, e aquilo precisa de um lugar antes de virar (ou não virar) alvo. Dez colunas
— Atleta, Posição, Geração, País, Clube, Data, Responsável, Recepção, Indicação,
Avaliação — com inclusão dentro da própria aba, filtro por avaliação **com a contagem de
cada uma** (é o resumo da fila) e CSV.

Sete avaliações: Aprovado Main · Squad · Youth · sub20 · Em avaliação · Monitorar ·
Descartado. Coloridas de propósito: verde cheio no Main, verde nos outros aprovados,
âmbar no que segue em aberto, coral no descartado — a coluna tem de se ler de relance.

É **lista própria**, não visão do elenco: o indicado normalmente não está no campograma,
é justamente o candidato a entrar. Por isso cada linha é registro solto com `uid`, e não
chaveada por jogador como na aba Empresários.

**1. ID ganha de duas classes, e a página nunca escondia.** `#pgEmpresarios{display:flex}`
tem peso 100; `.pagina.oculta{display:none}` tem 20. O ID ganhava, então as duas abas
novas ficavam SEMPRE visíveis — e como o `<main>` é flex-row, elas dividiam a largura com
a aba aberta. O campograma aparecia espremido com a tabela de empresários ao lado, em
todas as abas. O sintoma não parece de CSS, parece de JS: dá vontade de procurar no
`irParaAba()`, que estava certo o tempo todo. `#pg…:not(.oculta)` resolve.

**2. Ler criava registro.** `empDados()` fazia `estado.emp[ch] = {}` para devolver algo, e
a tela chama isso uma vez por jogador para desenhar. Só ABRIR a aba enchia o cenário com
118 objetos vazios, que iam para o Salvar, para a nuvem e para o `cenarios.json` sem nada
dentro. Separado em `empDados()` (lê, nunca cria) e `empGravar()` (cria só quando há o quê),
com `empLimpar()` sumindo com o registro que ficou vazio depois de apagar o texto.

## Ampliar é acrescentar, não trocar (set/26)

O usuário reclamou: *"vc mexeu na visualização do campograma que estava ótima. não era
para substituir a que dava pra ver todos em um campo só"*. Estava certo, e a lição vale
mais que o conserto: **modo que já existe não muda de comportamento porque um novo
chegou.** Eu tinha transformado "tamanho real" (que cabia na tela) em 100% com rolagem —
isso é troca disfarçada de acréscimo.

Os dois modos originais voltaram idênticos: os dois CABEM na tela e a diferença entre eles
é só a fonte. As escalas 125/150/200% são entradas NOVAS na mesma roda.

**E ampliar estava comendo o conteúdo do card.** A primeira versão replanejava o layout do
zero com a escala fixa, e sem a largura compensada que o modo normal usa o planejador caía
em cards de **194px em vez de 343px**: 61 nomes abreviados contra 12. Ampliar piorava a
leitura, que é o oposto do pedido. Agora a ampliação é um **fator sobre a mesma conta de
sempre** — layout idêntico ao de "tamanho real", só a escala final multiplicada.

**Texto e botões do card cresceram.** O card tinha espaço sobrando com letra pequena
dentro. Nome e salário de 11,5 para 13; clube, idade e contrato de 8,5 para 10,5. Os
botões (+ ⋯ × ☎) foram de 15/16px para 20px e **deixaram de depender do hover** — botão
que só aparece no hover não se descobre. Como `--fz` controla a largura de `.pos` junto
com a fonte, o card acompanha e nada fica apertado.

**O ☎ virou ficha, não salto.** Mandar para a aba com 118 linhas só para anotar um contato
era desproporcional: a aba serve para varrer a lista, a ficha serve para preencher um.
Clicar abre um modal com os nove campos daquele jogador, com "ver todos na aba" no rodapé
para quem quiser o outro caminho. Grava no mesmo lugar — mesma informação, outra porta.

**As três barrinhas do card** (pergunta que apareceu) são a minutagem das três últimas
temporadas, uma barra por ano: a altura do preenchimento é quanto de uma temporada inteira
o atleta jogou. Barra vazada = o dado veio do oGol, que dá jogos e não minutos. O balão
diz temporada por temporada.

**"Sem acesso" e "salvando para todos" ao mesmo tempo (set/26).** Apareceu numa tela real,
com um segundo e-mail logado antes de as regras serem publicadas. As duas frases se
contradizem: entrou, mas o e-mail não está na lista, então **nada** vai para a nuvem.
Dizer "salvando para todos" nesse estado promete o que não acontece, e é o pior tipo de
erro de interface — o usuário só descobre quando o outro não vê o grupo. Agora, com
`FB.erro`, o aviso diz *"sem acesso — salva só neste navegador"*, o e-mail perde o verde,
e o `salvarCenario()` nem tenta a nuvem (`FB.usuario && !FB.erro`).

**Faixa de status mais larga, e um conflito que ela revelou (set/26).** A tarja de status
à esquerda do card tinha 3px e, num card que cresceu de texto, virou um fio. Foi para 7px
(6 no denso), e a legenda acompanhou na mesma medida — legenda que não bate com o card é
pior que não ter legenda. Quem ainda não tem status continua com o fio fino: faixa larga e
apagada chamaria atenção para o que ainda não foi decidido.

**O conflito:** `.jog.titular` usa o atalho `border-color`, que pinta os QUATRO lados,
inclusive o esquerdo. Um titular marcado como Alvo exibia a tarja ROSA do titular no lugar
do âmbar do status. Com 3px ninguém via; com 7px vira informação errada bem visível. As
quatro regras de status foram reafirmadas depois, e o titular segue identificado pelo
fundo rosa e pela estrela.

**Dois telefones na aba Empresários.** `Telefone empresário` e `Telefone jogador`, campos
separados: falar com o jogador direto e falar com quem o representa são conversas
diferentes, e trocar uma pela outra numa negociação custa caro. Como a tabela, a ficha do
☎ e o CSV leem todos o mesmo `EMP_CAMPOS`, acrescentar uma linha ali apareceu nos três.

**"Tamanho real saindo todo torto" (set/26).** O campo aparecia jogado para baixo e para a
direita, com um vazio enorme em cima e à esquerda. Causa: o CSS punha
`transform-origin:top left` só em `.campo-area.ajustado` — ou seja, só no modo "caber na
tela". Em "tamanho real" a escala partia do **centro**, e a compensação (`compensarEscala`)
usa margem negativa à DIREITA e EMBAIXO, que só fecha a conta se o encolhimento andar para
o canto superior esquerdo. Com origem central sobra folga de todos os lados: medi **250px
à esquerda e 136px acima**, contra os 10px normais.

O defeito era **antigo e discreto**. Aumentar a fonte do card deixou os cards mais altos,
`k` menor, e a folga cresceu o bastante para saltar aos olhos. A origem passou a ser o
canto em TODOS os modos, no JS, em vez de depender de uma classe que só um deles tem.
Conferido: 10px de folga nos cinco modos, e nas idas e voltas entre eles.

## Dois status no menu do card, e Main = titular (set/26)

O menu do ⋯ tinha "Marcar como titular" e uma seção "Status" com Alvo/Negociando/Fechado/
Elenco atual. Agora tem **duas seções**, porque são duas perguntas diferentes e um jogador
responde as duas ao mesmo tempo:

- **Status** — o nível no elenco: **Main** (titular da posição), **Squad** (reserva),
  **Youth** (jovem).
- **Status negociação** — onde a conversa está: Alvo, Negociando, Fechado, Elenco atual.

**Main É o titular**, decisão do usuário, e isso resolveu um problema em vez de criar um:
havia `j.titular` (a estrela) e o status Main/Squad/Youth da aba Empresários dizendo a
mesma coisa em lugares diferentes — dois campos com o mesmo significado é como garantir
que um dia se contradigam. `definirNivel()` é o **único** lugar que mexe em qualquer um
dos dois. Regras, todas escolhidas: só um Main por posição (titular é um por posição);
quem perde o posto **vira Squad**, que é o que ele passou a ser (deixar em branco perderia
a informação de que segue no elenco principal); tirar o Main tira a estrela e vice-versa.

**A ★ virou botão.** A legenda do app sempre disse "clique no ★ para trocar", mas a
estrela só era desenhada para quem JÁ era titular — não havia onde clicar para promover
outro, e o único caminho era o item do menu que agora saiu. Agora existe em todos: verde
e cheia no Main, apagada nos demais, acendendo no hover.

**Cores, as mesmas de sempre.** Verde o Main, âmbar o Squad, azul o Youth — idênticas às
da aba Empresários e às da avaliação dos Indicados. Cor que muda de significado entre
telas é pior que não ter cor. No card, só Squad e Youth ganham etiqueta: o Main já tem a
estrela e o fundo rosa, e repetir três vezes a mesma coisa num card denso é ruído.

**Migração v5:** quem já era titular ficaria com a estrela de Main e o Status em branco —
exatamente a contradição que a unificação veio evitar. A migração marca os existentes como
Main (conferido: 10 titulares, 10 Main, nenhum sem nível).

## `const` não sobe como função sobe — e o site abriu vazio (set/26)

Publiquei a migração v5 e o site abriu com o **campo vazio e tudo zerado**. Console:
`Cannot access 'EMP_VAZIO' before initialization`, dentro de uma promise.

`empDados()` devolvia `… || EMP_VAZIO`, uma `const` declarada lá no fim do arquivo, na
seção da aba Empresários. A `migrar()` roda na CARGA e chama `empDados()` — antes de o fim
do arquivo ter sido avaliado. Declaração de função sobe; `const` não: fica na zona morta
temporal e **lança**. A exceção derrubou a carga inteira, e o que sobrou na tela foi o
estado zerado.

**Por que os meus testes não pegaram, e é a parte que importa.** Eu testava chamando
`abrirCenario()` à mão no console, depois de o arquivo já ter sido todo avaliado — nesse
momento a `const` já existe e tudo funciona. O erro só acontece no **caminho de
inicialização, com algo já gravado no navegador**, que é exatamente o caminho do usuário e
nunca o do meu teste. Testar pela porta dos fundos não testa a porta da frente.

Conserto: `empDados()` devolve `{}` novo em vez da constante compartilhada. E a reprodução
passou a ser feita como o usuário faz — forçando `estado.v = 4` no `localStorage` e
recarregando a página do build estático, não chamando função no console.

## Salvar grava por cima; criar grupo virou ato explícito (set/26)

O Salvar **já** sobrescrevia quando havia `id` — a queixa vinha de outro lugar: o elenco de
partida do site publicado entra com `id: null` de propósito (para ninguém sobrescrever o
modelo sem querer), então o primeiro Salvar de quem abria o site **criava um grupo novo em
silêncio** em vez de atualizar o que estava na tela. Daí a sensação de que não dava para
gravar por cima.

Agora:

- **Salvar** sobrescreve o grupo aberto, sem perguntar nada. O balão do botão diz de quem:
  *"Grava por cima de «Cenário 1 2027»"*. O que vai acontecer tem de estar claro ANTES do
  clique, não só no resultado.
- **Sem `id`**, o Salvar PERGUNTA o nome. Fica explícito que um grupo está nascendo, em vez
  de aparecer um duplicado na lista sem ninguém ter pedido.
- **Salvar como novo grupo…**, no menu Grupo, cria outro e mantém o atual intacto.

`gravarCenario()` foi separada de `salvarCenario()` porque o "Duplicar grupo" já pede o
nome antes de chamar — sem a separação, ele perguntaria duas vezes seguidas.

**Cuidado que este trabalho ensinou:** testar o Salvar com o cenário REAL aberto grava por
cima do cenário real. Aconteceu — o `dados/cenarios.json` foi reescrito durante o teste.
Teste de gravação tem de nascer e morrer num grupo descartável.

## O nível pinta o card (set/26)

A etiqueta SQUAD/YOUTH na linha do meta saiu: num campo com cem cards a cor se lê de longe
e a etiqueta exige parar e ler cada um. Agora o **fundo do card** é o nível —
**verde** o Main, **amarelo** o Squad, **azul claro** o Youth.

O rosa do titular acabou junto, e é coerente: Main É o titular, então a cor do Main é a
cor do titular. Verde no lugar do vermelho foi escolha do usuário.

**O estrangeiro parou de pintar o fundo.** Tinha um creme próprio (`#fdf4e4`), e com o
nível pintando também, duas cores disputavam o mesmo card — o resultado é que o nível
sumia justamente nos estrangeiros. O selo do país já diz o que precisa ser dito; o fundo
ficou reservado para uma informação só. É a mesma regra da faixa de status: um canal
visual, um significado.

As regras do nível vêm DEPOIS de `.jog.titular` e `.jog.estrangeiro` no arquivo, para
ganhar das duas. E a legenda ("Como ler os cards") foi reescrita junto: ela dizia "fundo
vermelho" para o titular, e legenda que ensina a cor errada é pior que não ter legenda.

**A estrela saiu do card (set/26).** Ela dizia "este é o Main" — a mesma coisa que o fundo
verde passou a dizer. Duas marcas para uma informação, gastando espaço do nome no card
mais disputado da tela. Quem define o nível é o menu ⋯, em Status, então nada ficou sem
caminho. O `PX_ESTRELA` saiu junto da conta do `limiteNome()`: o nome ganhou os 9px de
volta.

Vale registrar a sequência, porque ela se explica sozinha ao contrário: a estrela virou
botão quando o item "Marcar como titular" saiu do menu e ela era o único caminho; depois o
nível passou a pintar o card; e aí a estrela deixou de ter função. Cada passo foi certo no
momento, e o último tornou o primeiro desnecessário.

## Exportar PNG: o html2canvas não dá conta deste campograma (set/26)

A imagem saía **sem nenhum nome**, com os cards deslocados e cortados. Investiguei até o
fim e a conclusão é que a ferramenta não serve para este layout:

1. **Escala.** O campo está com `transform: scale(k)` na tela. O html2canvas desenha a
   caixa de LAYOUT e ignora a transformação: media pelo retângulo reduzido e desenhava em
   tamanho natural. Resolvido tirando o transform antes de capturar.
2. **CSS Grid.** O card é `display:grid` com `1fr auto 20px…`, e o **html2canvas não
   implementa Grid**. A coluna `1fr` do nome colapsa — daí a imagem sem nomes. Uma classe
   `exportando` troca o card por bloco + posicionamento absoluto e melhora, mas não
   resolve.
3. **Variáveis CSS.** A largura do card é `width: var(--pos-max)`, posta pelo
   `distribuir()`. O html2canvas não propaga a variável para os descendentes no clone, e
   os cards saem estreitos. Congelar as medidas em px antes de capturar também não
   resolveu.

**A via fiel existe e está bloqueada.** Pôr o campo dentro de um `<foreignObject>` de SVG
faz o PRÓPRIO navegador desenhar — grade, variáveis, tudo idêntico à tela. Testei e
funciona: a imagem carrega em 2066×1091. Mas o Chrome marca o canvas como "sujo" ao
desenhar SVG com foreignObject e proíbe exportar (`Tainted canvases may not be exported`).
Serve para mostrar na tela, não para gerar arquivo.

**O que ficou:** os itens 1 e 2 acima (imagem melhor que antes, ainda não fiel) e uma
saída por tempo em todos os `await` — `requestAnimationFrame` não dispara em aba
escondida, e exportar trocando de aba travava sem erro e sem imagem.

**O caminho fiel é o PDF**, que usa o motor de impressão do navegador. Lá o campograma sai
com a grade, as variáveis e as cores certas. Ajustado junto: o nível pinta o card no papel
com as mesmas cores da tela, e as fontes **pararam de encolher** — o campo já é reduzido a
~50% pelo `--k-print`, e reduzir a fonte por cima disso levava o nome a ~1mm.

**Campo livre na aba Empresários (set/26).** Uma coluna `Descrição`, texto solto, para o
que não cabe em campo nenhum: *"pai é o empresário"*, *"só sai por empréstimo com opção"*,
*"falei em janeiro e pediu 200"*. Fica por último e é a mais larga.

Na tabela é um campo de uma linha; na **ficha do ☎** vira caixa de três linhas ocupando a
largura inteira, porque ali há espaço e é onde se escreve de verdade. Os dois gravam no
mesmo lugar — conferido escrevendo pela tabela e completando pela ficha, com o texto
inteiro num só registro.

Como `EMP_CAMPOS` alimenta a tabela, a ficha e o CSV, acrescentar uma linha ali apareceu
nos três sem mais nada.

**A aba Empresários deixou de rolar de lado (set/26).** Somadas, as larguras fixas das 14
colunas passavam de 1700px, e `min-width:max-content` na linha obrigava a barra horizontal.
As colunas passaram a DIVIDIR a largura disponível (`flex: peso 1 0`), com o peso mantendo
a proporção que tinham. Em 1512px elas somam 1405 e cabem inteiras.

O cabeçalho ganhou `title`, porque agora ele corta: "Telefone empresário" vira "Telefone
empre…", e sem o balão não dá para saber de quem é o telefone — que é exatamente a
distinção que os dois campos existem para fazer.

A aba Indicados usa as mesmas classes e foi conferida junto: 1158px, sem rolagem.

## Aba Análise Série B — o estudo do acesso (set/26)

Pedido: entender o que é preciso para subir, a partir das tabelas. O estudo vive numa aba
do app, ao lado do campograma, porque "quantos pontos precisamos" e "que elenco montamos"
são a mesma conversa — trocar de janela no meio dela é o jeito mais rápido de uma das duas
ser esquecida.

**As tabelas são o dado; o texto é consequência.** `SB_TABELAS` guarda as classificações
transcritas (2022 a 2025 completas, 2026 parcial após 27 rodadas) como `pos, clube, J, V,
E, D, GP, GC`. **Pontos e saldo são calculados**, nunca digitados — e tudo o que a tela
afirma sai de `sbResumo()`. Corrigir uma tabela corrige o estudo inteiro; não há número
solto no meio do texto para esquecer de atualizar.

A transcrição foi conferida antes de entrar: nos 100 clubes, V+E+D fecha com os jogos e
3V+E fecha com os pontos.

### A regra mudou em 2026 — e a primeira versão desta aba estava errada

A aba nasceu ensinando o G4. **Em 2026 não há G4.** Sobem direto o 1º e o 2º; do 3º ao 6º
entram num playoff de ida e volta (21 e 28 de novembro de 2026), com o time melhor
colocado jogando a volta em casa e avançando no empate do placar agregado — **não há
pênaltis**. Ou seja, são duas linhas em vez de uma, e a de baixo é bem mais barata:

- **Subir direto (2º):** 65, 65, 67, 65 nos quatro anos completos — média **66**.
- **Entrar no playoff (6º):** 57, 63, 63, 61 — média **61**.
- A distância entre as duas é de **4,5 pontos**, cerca de um jogo e meio.

O histórico de 2022-2025 foi jogado sob a regra velha, então ele **não** diz quem teria
subido pelo playoff. O que ele diz, e é o que a aba usa, é quantos pontos custava chegar
em 2º e em 6º. Isso vale, porque a classificação não mudou — só o que acontece depois.

### O que os números dizem

- **Empatar é o jeito mais caro de não perder.** Dos 20 clubes que menos empataram nos
  quatro anos, **8 subiram**; dos 20 que mais empataram, **2**. É a mesma coisa que a
  correlação dizia, contada em clubes em vez de em coeficiente — a versão anterior mostrava
  uma régua de correlações e o próprio pedido foi "isso ficou confuso, não entendi".
- Nenhum dos 16 que subiram perdeu mais de **12** jogos em 38.
- **Ataque e defesa não pesam igual em cima e embaixo.** Em cima empatam: o melhor ataque
  subiu 3 vezes em 4, a melhor defesa também 3 em 4. Embaixo, não: o pior ataque caiu 3 em
  4, a **pior defesa caiu 4 em 4**. E nenhum clube foi rebaixado tendo defesa entre as dez
  melhores. Nos postos médios dentro de cada temporada (1 = melhor da liga): quem sobe é
  **4,1º de ataque e 5,4º de defesa**; quem cai é **16,1º e 16,9º**.
- **Utilização de atletas não explica nada** — e isso está dito na tela. Nos dez primeiros
  de 2026 até a 25ª rodada, a correlação entre pontos e total de atletas usados é **+0,15**,
  e entre pontos e tamanho do núcleo (quem passou de 300 min), **−0,16**. A ressalva é do
  tamanho da amostra: são só os dez primeiros, sem os dez de baixo, então a faixa de
  resultados é estreita por construção e uma relação real poderia não aparecer.

### Decisões de desenho que valem registro

A cor carrega o dado (subiu / playoff / resto), e verde-vermelho é justamente o par que
some no daltonismo mais comum — ficou **azul e laranja**, validados nos dois temas, e os
pontos vêm rotulados, então a cor nunca é a única pista. O gráfico da faixa que decide
desenha uma **barra do 6º ao 2º** em cada ano, em vez de um ponto só: é a forma de a regra
nova aparecer no desenho, não só no texto. A escala começa em 54, não no mínimo dos dados,
porque o rótulo do 6º é escrito à esquerda da barra e encostava no ano. O ano parcial
(2026) sai com opacidade menor e um asterisco, e fica fora de todas as médias
(`SB_COMPLETAS`).

**Armadilha que custou tempo:** ao reescrever o `sbRender` por script, o `b.onclick` dos
botões de ano foi perdido no meio da emenda e a tela entrou em recursão infinita
(`Maximum call stack size exceeded`). O handler é uma linha só —
`b.onclick = () => { sbAno = +b.dataset.ano; sbRender(); };` — e é fácil de não notar
sumindo. Emendar arquivo grande por script pede conferir o resultado no navegador, não só
o Python rodar sem erro.

Versão para circular (ESTÁ DESATUALIZADA — foi escrita sob a regra velha do G4 e com a
régua de correlações que confundiu):
https://claude.ai/code/artifact/a2472cc1-565c-49cf-a7a8-8a615ffa6046

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

## Análise ofensiva e defensiva da Série B (set/26)

`analisar_serieb.py` cruza as três bases num clube-temporada só e responde o que separa quem
sobe de quem cai. Versão para circular: https://claude.ai/code/artifact/ea51c41a-489e-4abf-b394-e39118368d95

**O achado central, e ele é desconfortável.** Decompondo a cadeia finalização → qualidade da
chance → xG → gol, quem sobe supera quem cai em **+3,1% de remates**, **+12,6% de xG por
remate**, **+16,4% de xG** — e **+54% de gols**. Ou seja: **dois terços da vantagem ofensiva
é finalização, não criação.** Na defesa a mesma forma: −9,7% de remates sofridos, −19,9% de xG
sofrido, −34,4% de gols sofridos.

**E aí vem o teste que muda a conclusão.** Em 36 pares de temporadas consecutivas do mesmo
clube, a finalização (gols − xG) tem correlação de **−0,17** com a do ano seguinte, e a defesa
além do xG, **−0,02**. O saldo de xG, **+0,37**. A parte que mais pesou na tabela é justamente
a que não se pode contratar para o ano seguinte. O que resta como plano é ser tão melhor nas
chances que um ano ruim de pontaria ainda termine no G6.

**Onde o dinheiro rende.** Valor parado na defesa correlaciona **+0,56** com a posição final;
no ataque, **+0,29**. E a FATIA do valor no ataque correlaciona **−0,29**: quem cai coloca
43,8% do elenco no ataque, quem sobe 30,8%. A leitura provável não é que atacante caro seja
ruim — é que time ameaçado compra atacante, e o gasto aparece onde o problema não estava.

**Correção de uma leitura anterior desta mesma aba.** Com dez clubes de 2026 até a 25ª rodada,
a utilização de atletas não mostrava relação com pontos. Com 80 clube-temporada completas,
mostra: **+0,54** para a concentração de minutos nos onze mais usados, mais forte que valor do
elenco (0,50). Quem sobe usa 36,6 atletas; quem cai, 45,6. O tamanho do plantel registrado,
esse sim, não importa (0,11).

**O que não vale.** Posse de bola 0,26 e precisão de passe 0,14 — os dois números que mais
abrem apresentação de análise. Idade do time, −0,04.

**Armadilha paga no caminho:** o Transfermarkt escreve valor com vírgula decimal numa página e
com ponto em outra (`€ 3,00 mi.` e `€ 5.40 mi.`). Tratar o ponto como milhar fazia 5,4 milhões
virarem 540 milhões. Só apareceu porque a mediana de valor de um elenco saiu em € 14 milhões —
número absurdo o bastante para não passar. Conferir ordem de grandeza depois de todo parser.

### A análise entrou na aba — `static/sb_clubes.js` (set/26)

O estudo inteiro passou a morar na **Análise Série B**, não num documento à parte.

**Como o dado chega lá sem levar 10 MB junto.** `gerar_sb_clubes.py` escreve
`static/sb_clubes.js` — 20 KB, 100 clube-temporada, 34 campos cada, só o que foi **medido**
em cada um. As três bases somam quase 10 MB e não têm por que viajar até o navegador de
quem só quer ver a aba. E o princípio da aba continua valendo: **nenhuma média, correlação
ou percentual da tela vem pronto do arquivo** — tudo é calculado em `sbResumo()` e nos
`sbBloco*()`. Se uma partida for corrigida numa base, roda-se o gerador e a tela se corrige.

O arquivo entra por `<script>` em `templates/index.html`, antes do `app.js`, do mesmo jeito
que o `fs_visoes.js`. O `publicar_site.py` copia `static/` inteiro, então o site estático
pega de graça.

**Duas armadilhas pagas na integração:**

- **Empate em posto tem de virar média, não ordem de chegada.** A primeira versão ordenava
  e numerava 1, 2, 3…: dois clubes com os mesmos gols sofridos recebiam 7 e 8 por sorteio, e
  o sorteio entrava na correlação como se fosse dado. As correlações davam 0,79 onde o
  Python dava 0,77. Com média nos empates (o que o `rank()` do pandas faz), as onze
  correlações conferidas batem na segunda casa.
- **`valor` e `valTot` são duas contas diferentes do mesmo elenco.** `valor` é o total do
  Transfermarkt (€ 27,3 mi na média de quem sobe); `valTot` é a soma dos setores medida no
  Wyscout (€ 17,3 mi), que só cobre quem entrou em campo. A primeira versão usou `valTot`
  como "valor do elenco" e a aba passou a discordar do relatório. `valTot` existe só para as
  **fatias** por setor, onde o que importa é a proporção dentro da mesma medida.

**E uma correção que a aba precisou engolir sobre si mesma.** O bloco de utilização de
atletas dizia, com todas as letras, que não havia relação com pontos. Estava errado: a
amostra eram dez clubes de 2026 até a 25ª rodada, truncada no topo da tabela — e é embaixo
que a rotatividade aparece. Com 80 clube-temporada a relação é forte (+0,54 para a
concentração de minutos nos onze mais usados). A `SB_USO` foi removida e o bloco agora diz o
que mudou e por quê, em vez de trocar o texto em silêncio.

### Aba Físico ganha "Quem sobe" e "Quem cai" (set/26)

Duas colunas de referência novas ao lado de Brasil e Mundo, desligadas por padrão
(`Quem sobe e quem cai (Série B)` no bloco **Quem aparece**). Elas respondem uma pergunta
diferente das outras duas: não "ele é bom no padrão da elite", e sim **"ele está no nível
físico de quem sobe desta divisão, ou no de quem cai?"** — que é a pergunta do planejamento.

`gerar_raio_serieb.py` acrescenta `refs[POSIÇÃO].sobe` e `.cai` ao `dados/raio_ref.json`,
médias do SkillCorner das quatro temporadas completas (2022-2025) ponderadas por minuto
rastreado, por posição. **Roda DEPOIS do `_fonte/gerar_raio_ref.py`** — ele acrescenta, não
gera; na ordem inversa apaga o trabalho do outro.

Dez posições, 14 a 68 atletas em cada, 22 a 23 dos 25 indicadores. Faltam de propósito
`vmax` e `vmax3`: neste banco eles só têm cobertura de 2025 em diante.

**Duas escolhas de mapeamento que valem registro.** `CB` (zagueiro sem lado) entra nos
**dois** lados — deixar de fora tiraria 36 atletas-temporada da conta de zaga, e escolher
um lado seria cara ou coroa. E `LAMF`/`RAMF` vão para **ED/EE**, não para MEI: no Wyscout
são a mesma função dos pontas.

O que as colunas mostram bate com o estudo do clube inteiro, agora posição a posição — o
centroavante de quem sobe dá **11,3 sprints** contra 9,3 e corre **207 m em sprint** contra
170, com **distância praticamente igual** (9.519 contra 9.458). Volume não separa,
intensidade separa, e isso vale dentro de cada posição.

A exceção é o **MEI**, a menor amostra (17 e 14): ali quem cai aparece à frente em alguns
indicadores. Com essa amostra, não é achado.

## O estudo da Série B — mapa de tudo (set/26)

Esta seção existe para quem abrir o projeto sem ter visto nada do que veio antes. As
seções acima contam **por que** cada peça é como é; esta conta **o que existe e em que
ordem roda**.

### A ordem importa

```
1. coletar_serieb_transfermarkt.py   → dados/serieb_elencos.{json,csv,xlsx}
2. preparar_serieb_tecnico.py        → dados/serieb_tecnico.{csv,xlsx}     (lê _fonte/serie_b_tecnico/)
3. preparar_serieb_jogos.py          → dados/serieb_jogos.{csv,xlsx}       (lê _fonte/serie_b_jogos/)
4. analisar_serieb.py --csv          → dados/serieb_clube_temporada.csv    (cruza os três + SkillCorner)
5. gerar_sb_clubes.py                → static/sb_clubes.js                 (importa o base() do passo 4)
6. _fonte/gerar_raio_ref.py          → dados/raio_ref.json                 (refs Brasil e Mundo)
7. gerar_raio_serieb.py              → ACRESCENTA sobe/cai ao raio_ref.json
8. publicar_site.py                  → docs/
```

**O 7 depois do 6, sempre.** O `gerar_raio_serieb.py` acrescenta, não gera; na ordem
inversa apaga as refs de Brasil e Mundo.

Os passos 2 e 3 leem a `SB_TABELAS` do `static/app.js` para descobrir de que ano é cada
planilha. Se as tabelas forem corrigidas lá, refazer do passo 2 em diante.

Fora dessa cadeia, e sem dependentes: `coletar_serieb_lesoes.py` → `dados/serieb_lesoes.csv`.

### O que cada base sabe

| Base | Linhas | Responde |
|---|---|---|
| `serieb_elencos` (Transfermarkt) | 5.098 atleta-temporada | quem estava no clube, quanto valia |
| `serieb_tecnico` (Wyscout, por atleta) | 3.866 jogador-temporada | o que cada um fez em campo |
| `serieb_jogos` (Wyscout, por clube) | 9.318 linhas, 3.570 de Série B | como o time jogou, partida a partida |
| `skillcorner.db` (fora do repo) | 100 clube-temporada | o físico |
| `serieb_clube_temporada.csv` | 100 × 258 colunas | **as quatro anteriores cruzadas** |
| `static/sb_clubes.js` | 100 × 191 campos, 127 KB | o recorte que a aba carrega |

As três primeiras cobrem **100 de 100 clube-temporada** de 2022 a 2026.

### A aba, por dentro

`sbRender()` monta dez seções (`SB_SECOES`), com índice grudento no topo montado da mesma
lista. Os blocos são funções `sbBloco*()` independentes — acrescentar um é escrever a
função e pôr o nome dentro da `sbSecao()` certa.

O princípio que rege tudo: **o dado é a fonte, o texto é consequência.** Nenhuma média,
correlação ou percentual da tela vem pronto do `sb_clubes.js` — ele traz só o que foi
medido. Corrigir uma partida numa base e rodar a cadeia corrige a tela inteira.

### Armadilhas pagas nesta etapa (as anteriores estão nas seções acima)

- **`.sb` é o container da aba Série B — e já mordeu duas vezes.** Primeiro um
  `<i class="cq sb">` de 8px no painel de filtros da aba Físico, que herdou
  `max-width:1020px; display:flex; padding:22px 4px 60px` e virou uma barra de 82px.
  Depois o `<th class="fs-media sb">` da coluna **Média B** na matriz do Físico, que pelo
  mesmo caminho virou `display:flex` com `gap:30px` e vazou por cima das linhas de cima —
  só a coluna B, porque `.sa` global não existe. As colunas de referência ao lado
  (`ref-br`, `ref-mu`, `ref-sb`) escaparam por já usarem nome hifenizado, e foi o que deu
  a pista. Hoje a matriz usa `fs-sa`/`fs-sb`. **Regra: nome de duas letras não vira
  modificador de classe.** Ao criar um, `grep -n "^\.xx[,{ ]" static/style.css` antes.
- **`.rk-campo-f>label` é `display:block` e ganha do `.chk{display:flex}`** (0,2,1 contra
  0,1,0). Flex aninhado ali dentro não se comporta como flex.
- **Âncora de parser some.** Três scripts liam a `SB_TABELAS` até `const SB_USO`; quando a
  `SB_USO` saiu do app.js, os três quebraram juntos. Hoje a âncora é `SB_COMPLETAS`.
- **Empate em posto tem de virar média**, como o `rank()` do pandas faz. Numerar 1,2,3 por
  ordem de chegada mete o desempate na correlação: dava 0,79 onde o Python dava 0,77.
- **`valor` e `valTot` são duas contas do mesmo elenco** — Transfermarkt (€ 27,3 mi na
  média de quem sobe) e soma dos setores do Wyscout (€ 17,3 mi, só quem entrou em campo).
  `valTot` serve só para as **fatias** por setor.
- **Relação e explicação são réguas diferentes**, e uma é a outra ao quadrado: 0,54 de
  relação = 0,29 de explicação. Dois gráficos lado a lado com a mesma cara e escalas
  diferentes confundem — está escrito na tela.
- **Euro e porcentagem não são a mesma medida.** "€ parados no ataque" dá +0,29 e "% do
  orçamento no ataque" dá −0,29: a primeira anda a 0,53 com o valor total (é só "clube rico
  tem atacante caro"), a segunda a −0,28 (é o clube pobre que concentra no ataque). Os
  rótulos passaram a dizer a unidade.
- **Casar SkillCorner com Wyscout por nome sozinho é o erro conhecido da casa.** A guarda de
  idade (2 anos abaixo, 3 acima) leva a conferência de 98,0% para 98,2% e corta uma classe
  inteira de homônimo.
- **`overflow:hidden` trava a roda do usuário, mas NÃO o scroll por script.** Era esta a
  causa de a barra de links do topo sumir. O `body` é `overflow:hidden; height:100vh`, o
  que esconde a barra de rolagem e impede a pessoa de rolar a página — mas
  `documentElement.scrollHeight` era **15.847** contra 700 de janela, e um
  `window.scrollTo(0,400)` levava a viewport embora numerinho. E aí vem o pior: **a barra
  não voltava**, porque a roda que a traria de volta é justamente a que está bloqueada.
  Porta de mão única. Qualquer um dos **cinco `scrollIntoView` do app.js** (ficha, estudo,
  jogador, linha — dois deles com `block:'center'`) abria essa porta; o índice de seções,
  que levou a culpa, estava certo. O conserto é no `body`, não em cada chamada:
  `position:fixed; inset:0` tira o conteúdo do fluxo do `html`, que passa a não ter o que
  rolar (`scrollHeight` cai para a altura da janela) e prende a viewport em 0 mesmo
  chamada por script. As caixas internas (`.emp-rolagem`) seguem rolando igual. O
  `@media print` devolve `position:static`, senão sai uma página só.
- **`scrollIntoView` rola TODOS os ancestrais roláveis, inclusive o documento.** O índice de
  seções fazia a faixa do topo (escudo, KPIs e abas) sumir em janelas onde o body ficava um
  fio mais alto que a viewport. A rolagem agora é explícita: acha a caixa que rola de
  verdade (`.emp-rolagem`) e move só ela, descontando a altura do índice grudento para o
  título da seção não nascer escondido embaixo dos próprios botões.

### O físico por posição: onde ele separa, e onde não separa

A média do clube inteiro escondia **de quem** vinha a diferença. Rodando a mesma
correlação dentro de cada grupo de posição (`fisico_por_posicao()` no `analisar_serieb.py`,
`sbBlocoFisicoPosicao()` no `app.js`), o resultado é desigual:

| Posição | Indicadores que separam, de 32 | O mais forte | Relação |
|---|---|---|---|
| Zaga | **4** | PSV-99, 5 melhores partidas | 0,41 |
| Lateral | **3** | Corridas sem bola que quebram linha | 0,27 |
| Meio | **17** | Arranques até o sprint | 0,39 |
| Ataque | **10** | Corridas sem bola que entram na área | 0,30 |

**O meio é onde o físico separa** — 17 de 32 indicadores, contra 3 e 4 na defesa.

E as **corridas sem bola** entraram em 11/09/2026 e reescreveram a tabela: lideram no
lateral e no ataque, e passam da régua nas quatro posições. Antes delas a leitura era
"atrás é teto, da frente é volume", com o PSV-99 como único indicador da defesa. Ficou
errado no mesmo dia.

> **Por isso o texto do bloco é DERIVADO, não escrito.** O parágrafo que dizia "o único
> indicador que passa na zaga e no lateral é o PSV-99" era verdade quando foi escrito e
> mentira duas horas depois. Hoje a frase monta do próprio ranking (`rotFrase`, `obrTop`):
> mudou o dado, muda o texto. É a mesma regra da aba — o dado é a fonte, o texto é
> consequência — aplicada à prosa, não só aos números.

Três decisões de método que sustentam a tabela:

- **Goleiro não entra.** O SkillCorner não rastreia goleiro; os 44 GK que aparecem no
  `physical` (de 3.610) são homônimo de jogador de linha.
- **Zaga e lateral vão separados**, ao contrário do `SETORES` do valor por setor, que junta
  os dois em "defesa". Para dinheiro juntar faz sentido; para físico apaga a maior
  diferença que existe em campo.
- **O limiar sai da amostra, não do dedo.** `tanh(1,96/√(n−3))` dá 0,22 para os 80
  clube-temporada completos. Sem régua, numa tabela de 104 correlações sempre há algum 0,15
  com cara de achado.

A amostra por grupo é pequena — mediana de 3,5 atletas por clube na zaga contra 6,9 no
ataque —, então vale a direção, não a casa decimal.

### A matriz do Físico ganhou "com a bola / sem a bola"

Dois grupos novos no `FS_GRUPOS` do `app.js`, e eles são coisas **diferentes** apesar do
nome parecido:

- **"Com a bola e sem a bola"** — TIP/OTIP, o time COM ou SEM a posse. Três pares
  (metros por minuto, alta intensidade, sprints), régua por 30 min de cada fase.
  Cobertura de 98,1% de quem tem tracking.
- **"Corridas sem bola"** — Off Ball Runs: o time TEM a bola e o **jogador** não (ataque
  da profundidade, apoio, sobreposição). Por isso são todas `p30tip`. Seis métricas,
  cobertura de 27%; fora do Brasil, Argentina e copas sul-americanas a célula vem vazia.

**A armadilha que isso quase criou, e como está barrada.** O `fsIndices()` fazia a média
de TODOS os grupos do `FS_GRUPOS` — então acrescentar grupo mudava o índice físico geral
sem ninguém pedir. Estaria errado por dois motivos independentes: régua diferente (média
de percentil de `p30tip` com `p90` não quer dizer nada) e cobertura desigual (o índice de
quem tem Off Ball Runs seria média de 7 grupos e o dos outros, de 5 — dois números com o
mesmo nome na mesma coluna). Hoje os dois grupos levam `fora: true` e o `fsIndices()` os
ignora no geral. **Conferido**: os índices batem número a número com os da versão
anterior (85, 81, 75, 72, 68, 82...). O `KP` do `gerar_raio_ref.py`, que decide o raio,
também ficou intocado.

O rótulo "média dos cinco grupos" estava escrito à mão em dois lugares e continuaria
dizendo cinco com sete grupos na tela. Virou `FS_ROT_IDX`, contado do próprio `FS_GRUPOS`.

As colunas de referência precisam dos dois geradores: `gerar_raio_ref.py` (Brasil e Mundo,
lê o `jogadores.json`) e `gerar_raio_serieb.py` (sobe e cai, lê o banco). No segundo só
entram os pares TIP/OTIP — a tabela `off_ball_runs` só tem Série B de 2026, e 2026 fica
fora por ser temporada incompleta.

### A tabela detalhada: 32 indicadores × 4 posições

A tabela resumida responde "qual é o mais forte de cada posição". A detalhada responde a
pergunta inversa, que é a que se faz montando elenco: **deste indicador, em que posição ele
importa?** Mesmas contas, direção de leitura diferente.

Duas regras de exibição que fazem ela ser lida:

- **Sai da tabela o indicador que não separa em nenhuma das quatro.** Sem isso são 32 linhas
  e a maioria cinza — o que interessa se perde na parede.
- **Apagado não é ausente.** Célula apagada quer dizer "medimos aqui e não separa", que é
  uma resposta; ausente aparece como `—`. Misturar os dois faria falta de dado parecer
  desempenho ruim.

**O achado que só ela deixa ver:** o *volume* de corridas sem bola não separa (0,21, −0,01,
0,22, −0,03 — passa em 1 das 4), mas as *que entram na área* passam em **4 de 4** (0,25,
0,25, 0,30, 0,30). Correr muito sem a bola não separa ninguém; correr para o lugar certo,
sim. O parágrafo que diz isso na tela também é derivado — se um dia o volume passar a
separar, ele **desaparece sozinho** em vez de virar mentira.

### O filtro "cumpre o perfil de quem sobe"

No painel de filtros do Físico. Responde: **este jogador bate, nos indicadores que de fato
separam quem sobe de quem cai na posição dele, a média de quem subiu na Série B de
2022 a 2025?** A barra vai de 50% a 100% dos fundamentais.

A lista sai do `gerar_raio_serieb.py` (bloco `fundamentais` no `raio_ref.json`) e é
**calculada, não escolhida a dedo**: entra o indicador com t ≥ 1,96 entre as duas médias.

| setor | fundamentais | sobe | cai |
|---|---|---|---|
| Zaga | 15 | 56 | 75 |
| Lateral | 10 | 68 | 90 |
| Meio | 12 | 94 | 98 |
| Ataque | 12 | 110 | 140 |

**Por setor e não por lado, e isso foi medido antes de decidir.** Partindo por lado, o
zagueiro direito dava 3 fundamentais e o esquerdo 26; o lateral direito 13 e o esquerdo 3.
Não há futebol que explique — é a amostra cortada ao meio virando ruído. Juntando os lados,
os quatro setores ficam entre 10 e 15, com 56 a 140 atletas de cada lado.

Três detalhes que fazem o filtro valer:

- **Tempo é ao contrário.** Nos seis indicadores de tempo (`menor: true`) cumprir é ser
  MAIS RÁPIDO. Errar o sinal premiaria o mais lento, e passaria despercebido porque o
  filtro continuaria "funcionando".
- **Ausência de dado não reprova.** O placar conta só o que dá para medir, e o jogador só é
  julgado se der para medir 60% da lista. Exigir cobertura cheia reprovaria por falta de
  dado, que não é a mesma coisa que reprovar por desempenho.
- **A nota embaixo do controle diz quantos passam agora.** Sem ela a barra é caixa preta: a
  pessoa arrasta e não sabe o que mudou.

Na posição MEI: 511 jogadores viram 393 (50%), 261 (70%), 141 (90%) e **68 (100%)**.

### "Contrato até" também no painel do Físico

O mesmo campo da aba Fim de contrato, com **uma diferença deliberada**: aqui ele nasce
**vazio, e vazio quer dizer todos**. Na aba Fim de contrato ele nasce em dez/26 e vale
sempre — lá a tela inteira é sobre contrato. Aqui a tela é sobre físico, e um filtro ligado
por padrão esconderia meia base sem ninguém ter pedido. Com uma data preenchida, a regra é
a mesma de lá: quem não tem `ct` sai (não dá para afirmar que o contrato acaba até a data
se não há data).

Compõe com o filtro de perfil, e é aí que fica útil: contrato até dez/26 **e** cumpre o
perfil de quem sobe dá uma lista de alvos em dois cliques. Na posição MEI, 511 viram 89 por
contrato, 53 exigindo confirmação, e 3 somando o perfil.

> **`fsPool` recebe opções nomeadas, não um booleano.** Era `fsPool(semPerfil)`; com dois
> filtros opcionais, `fsPool(true)` deixa de dizer QUAL está sendo pulado — e a nota do
> contrato chegou a comparar a coisa errada por isso. Hoje é `fsPool({perfil:1})` ou
> `{contrato:1}`.

### O painel do Físico: menos filtro à vista, mais indicador

Três mudanças no mesmo lugar, todas medidas antes e depois.

**1. As listas obedecem aos filtros.** Marcar "cumpre o perfil", ler "68 de 511 passam" na
tela e a lista da Série A continuar oferecendo os mesmos 25 nomes era incoerente. Agora as
quatro listas (Série A, Série B, SA no exterior, liga escolhida) passam pelo mesmo teste —
menos o filtro de liga, porque cada lista **já é** de um campeonato e aplicá-lo por cima ou
seria redundante ou zeraria a lista. Com o perfil em 100%: Série A 25 → **1**, Série B
17 → **1**, SA no exterior 16 → **3**.

> **A COORTE não é filtrada.** `co` é a régua de todos os percentis; filtrá-la mudaria o
> significado de cada número da tela — o percentil viraria "entre os que sobraram do
> filtro". A lista encolhe, a régua fica. O teste virou `fsPassaFiltros(j, ctx, pular)`,
> separado do laço, justamente para as listas usarem o mesmo sem tocar em `co`.

**2. O painel encolheu.** A fileira de baixo virou grade de **oito** colunas (4 faixas +
"Quem aparece" em 3 + "Perfil" em 1). Com sete, o "Quem aparece" cabia em duas colunas, as
caixas empilhavam em três fileiras e o bloco ia a **137px** — era ele, sozinho, que definia
a altura do painel. Deitado em três colunas caiu para **57px**.

Saíram duas faixas: `sc_n` ("Jogos c/ tracking") era **duplicata** do "Jogos rastreados ≥"
do rodapé; `ov` ("Overall") saiu por **espaço**, não por ser ruim — tinha 99,7% de
cobertura, e devolver é uma linha em `RANGES_FS`.

**3. Dá para recolher.** O botão `filtros` no rodapé esconde os filtros e a legenda, e
grava a escolha. Recolhido ele **conta** quantos passam (`filtros 511`), senão a pessoa
esquece que deixou filtro ligado e lê a matriz achando que é a base inteira.

| | matriz começa em |
|---|---|
| Antes | 397px |
| Compactado | 336px |
| Recolhido | **216px** — 7 linhas de indicador a mais |

> **A classe do recolhido vai em `.rk-filtros`, não em `.rk-col`.** A legenda da TARJA vive
> na coluna IRMÃ (a do campinho) e sozinha tem **99px**, quase o tamanho do campinho. Com a
> classe no `.rk-col` o painel sumia e a linha continuava alta, porque quem mandava na
> altura era a esquerda: recolher ganhava 25px de 254. O campinho fica — é como se escolhe
> a posição.

**"Quem sobe e quem cai" agora vem ligado** por padrão, junto dos dois Top 5. Não há
persistência dessas caixas: é o atributo `checked` do HTML e ponto.

### Gravar comparativo: por cima é o caminho normal

Antes, todo `Gravar` criava entrada nova. Ajustar o mesmo comparativo três vezes num dia
deixava três linhas com **o mesmo nome e a mesma data** ("Volante — 11/09/2026 · 6 atletas"),
impossíveis de distinguir, e limpar as velhas virava faxina manual. Agora:

- com um comparativo **aberto**, o botão vira **"Regravar"** e o nome já vem preenchido com
  o dele — confirmar escreve por cima **mantendo o mesmo id**;
- **mudar o nome** no prompt cria um novo, que é o jeito natural de dizer "salvar como";
- nome digitado que bata com outro **da mesma posição** pergunta antes de sobrescrever, em
  vez de criar o homônimo em silêncio;
- o rótulo na lista leva **hora**, não só data, então duas gravações do mesmo dia se
  distinguem.

> **`compMontarLista(selecionar)` recebe o id a selecionar.** Atribuir `sel.value` a um id
> cuja `<option>` ainda não foi criada **não faz nada e não avisa** — o combo voltava para
> vazio e o botão continuava dizendo "Gravar" logo depois de gravar. Quem monta as opções
> tem de ser quem escolhe.

### Armadilha de publicação: o `--push` que não publica

`publicar_site.py --push` faz `git add docs`, e **se o `docs/` já estiver commitado ele
imprime "nada mudou em docs/" e sai sem dar push**. Quem commitou o código com `git add -A`
(que leva o `docs/` junto) acha que publicou e não publicou. Custou três relatos de bug já
consertado nesta sessão. Enquanto o script não mudar: **conferir com
`git log --oneline origin/main..HEAD`** — se listar commit, falta `git push origin main`.

### Revisão especialista em andamento (11/09/2026) — como continuar

Uma revisão geral da aba, com pesquisa na web (Sumpter, Liverpool, físico, elenco, bola
parada, método) e um workflow de ~100 agentes, está em andamento. **Tudo que uma sessão nova
precisa está em `_fonte/revisao-2026-09-11/CONTINUAR.md`**: o pedido, as decisões já
tomadas (lesão descartada), os cinco achados já testados (quarteto fora da amostra 0,77;
minutos do núcleo; quando o acesso se decide — top-8 na rodada 19; casa × fora por processo),
o plano de design do relatório, o script do workflow e como retomar se a sessão morrer.

### Pendências

- **Coleta de lesões rodando** (`coletar_serieb_lesoes.py`), 2.850 atletas, ~2,5 h. Ao
  terminar: rodar `python3 coletar_serieb_lesoes.py --reparsar` para reler o HTML em cache
  com o leitor corrigido, e então cruzar com quem subiu e quem caiu — por setor, que é onde
  deve ficar interessante, já que defesa e ataque são onde quem cai mais rodou gente.
- **`peak_velocity` e `peak_velocity_top3` têm 0% de cobertura na Série B de 2022 a 2024**
  neste banco. São as melhores medidas de velocidade máxima e ficam de fora por isso. O
  `Portal Skillcorner/backfill_peak_velocity.py` é quem fecharia esse buraco.
- **As corridas sem bola de 2022 a 2025 foram destravadas em 11/09/2026.** Era buraco de
  SINCRONIZAÇÃO, não limite da fonte: a tabela `off_ball_runs` tinha zero linha nas quatro
  edições, mas a API devolveu 800, 776, 765 e 800 quando foi perguntada. Gravadas com o
  `upsert_offball_row()` do próprio `db.py`. Rollback, se precisar:
  `DELETE FROM off_ball_runs WHERE sc_competition_edition_id IN (335,446,773,1061);`
  **Ainda não entraram no estudo da Série B** (`SC_METRICAS` do `analisar_serieb.py`), só
  nas colunas Quem sobe / Quem cai da matriz do Físico. Entrar é uma linha de código e
  abriria seis indicadores novos para o painel por posição.
- **`t_spr_cod` (tempo até o sprint após girar) fica de fora de propósito.** Tem 41–43% de
  cobertura contra os 60% que o `gerar_raio_serieb.py` exige — e a régua existe justamente
  para não fabricar média de amostra fina. O vizinho `t_hsr_cod` tem 72% e passa. Não é
  bug, e baixar a régua para preencher a célula seria trocar um traço honesto por um
  número ruim.
- **Gol de bola parada não existe em nenhuma base.** O que há é o teto "gol de cabeça +
  pênalti". A exportação de **eventos por tipo de jogada** do Wyscout resolveria.
- A versão para circular (https://claude.ai/code/artifact/ea51c41a-489e-4abf-b394-e39118368d95)
  cobre até a análise ofensiva/defensiva, idade e bola parada. **Não tem** o painel físico
  completo, as seções novas nem o bloco de relação entre indicadores.
