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
