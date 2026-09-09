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
