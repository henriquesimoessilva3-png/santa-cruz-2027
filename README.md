# Santa Cruz 2027 — Montagem de Elenco

App próprio para planejar o elenco e o custo mensal do futebol do Santa Cruz em 2027,
mirando o acesso à Série B. **Roda em `http://localhost:5090`** — independente do hub
do Botafogo (`:5555`), sem qualquer ligação com os portais de lá.

## Como abrir

```bash
~/projetos/santa-cruz-2027/iniciar.sh
```

Sobe o servidor e abre o navegador. Para derrubar: `~/projetos/santa-cruz-2027/parar.sh`.

## A conta do orçamento

Os R$ 2,8 MM são o **custo total mensal** do clube com futebol — já com encargos e já
com a comissão técnica. O app desmonta esse número até chegar no que dá para oferecer
de salário aos jogadores:

```
Custo total máximo          R$ 2.800.000
− Comissão técnica          R$   300.000      (editável, ou montada cargo a cargo)
= Disponível para atletas   R$ 2.500.000
÷ Encargos                          1,25      (editável)
= Massa salarial            R$ 2.000.000      ← é isso que se distribui no campograma
```

### Comissão técnica

Dá para digitar o valor direto na barra do topo **ou** clicar em `detalhar` e montar
cargo a cargo — técnico, auxiliar, PF, preparador de goleiros, analista, médico,
fisios, massagista, nutricionista, roupeiro. Cada salário é editável, dá para
acrescentar e remover cargos, e há a opção de aplicar os mesmos encargos (×1,25)
sobre a folha da comissão. Com "montar cargo a cargo" ligado, o total passa a valer
no custo total e o campo da barra fica travado; desligado, volta a valer o que você
digita. A lista que vem pronta soma R$ 257.000 de salários — R$ 321.250 de custo com
encargos.

O salário digitado em cada card é o **valor oferecido ao jogador**. O app mostra ao
lado o **custo do elenco** (salário × 1,25) e o **custo total** (custo do elenco +
comissão), que é o número que precisa caber nos R$ 2,8 MM. Os três campos com `✎`
são editáveis — mude o custo máximo, a comissão ou o fator de encargos e tudo
recalcula na hora.

## O campograma

11 posições da formação padrão — GOL, LE, ZE, ZD, LD, VOL, MED, MEI, EE, ED, CA —
espalhadas pelo gramado como num campograma de verdade, com **3 vagas em cada uma**
(33 no total; o alvo de elenco fica sinalizado em 26–30). Clique no `3/3` do cabeçalho
para mudar as vagas daquela posição.

O campo se dimensiona sozinho conforme os cards crescem: nenhum card encosta no outro
nem vaza pela lateral, seja com 1 ou com 5 nomes na posição.

- **Somas automáticas**: por posição, por setor (painel da direita) e total.
- **Horizontal (padrão) ou vertical**: botão `↻` — o horizontal é o campograma deitado,
  gol à esquerda e ataque à direita.
- **Compacto / Normal**: densidade dos cards, para ver o elenco todo sem rolar.
- **★ titular** · **⬤ estrangeiro** · **● status** (Alvo → Negociando → Fechado → Elenco atual)
  · **✕ remover** — botões que aparecem ao passar o mouse no jogador.

### Como ler um card

O **fundo vermelho com a estrela** é o titular daquela posição (um por posição). A
**barra colorida à esquerda** de cada jogador é o status: âmbar = alvo, roxo =
negociando, verde = fechado, azul = já é do elenco. O **selo âmbar** com a sigla do
país marca estrangeiro, e **salário em âmbar** quer dizer que ainda não foi definido.
Essa legenda também fica no pé do painel da direita.

## Estrangeiros

O selo âmbar (`ARG`, `COL`, `URU`…) marca **quem é estrangeiro entre as suas escolhas**,
no card do jogador, no cabeçalho da posição (`2⬤`) e na lista de busca. O painel
**Estrangeiros nas escolhas** conta quantos são, quantos são brasileiros, quanto pesam
na massa salarial e avisa quando passa do limite (**9** — clique no número para mudar).

Critério: estrangeiro é quem **não nasceu no Brasil e não tem passaporte brasileiro** —
quem tem passaporte BR não ocupa vaga de estrangeiro. Dá para corrigir caso a caso no
botão `⬤` do jogador (naturalizado, dupla cidadania etc.).

## Escolher jogador

`+` no cabeçalho do card (ou `+ adicionar`) abre a base do ranking com **18.460 jogadores
de 65 ligas**. Filtros: nome/clube, posição, faixa de idade, overall mínimo, minutos
jogados, ano de fim de contrato e atalhos de liga (Brasil A/B/C, Brasil B+C, América
do Sul, Europa, todas). O filtro de **nacionalidade** tem cinco modos: qualquer uma,
só brasileiros, só sul-americanos (com Brasil), sul-americanos estrangeiros e só
estrangeiros — repare que ele é por nacionalidade do jogador, enquanto os atalhos de
liga são por onde ele joga hoje. Clique na linha para adicionar e digite o
salário direto no card — aceita `45000`, `45.000`, `45k` ou `45 mil`.

**+ Jogador fora da base**: para quem não está no ranking (comum na Série C) — nome,
clube, idade, salário e marcação de estrangeiro na mão.

## Escudo

O escudo oficial está em `static/escudo.svg` (vetorial, não perde qualidade). Para
trocar, é só substituir esse arquivo — também aceita `escudo.png`, `.jpg` ou `.webp`.
Sem arquivo nenhum, a tela cai num brasão tricolor desenhado em código.

## Grupos de opções

Cada montagem é um **grupo**, salvo no servidor e listado no seletor do topo:

- **Salvar** grava o grupo atual (Ctrl+S).
- **Duplicar** copia o grupo para você testar uma variação sem perder o original.
- **Novo** começa um grupo do zero.
- **Comparar** abre todos os grupos salvos lado a lado — atletas, estrangeiros, folha,
  custo do elenco, custo total, sobra, salário médio e maior salário, idade média e o
  peso de cada setor. O melhor valor de cada linha sai em verde, o menor em azul, e
  estouro de orçamento em vermelho. Clicar no nome de um grupo abre ele no campograma.
- **Renomear** e **Excluir** agem sobre o grupo aberto.

O trabalho em andamento também fica no navegador, então fechar a aba não perde nada.

## Grupos prontos

| Cenário | Atletas | Salário médio | Fecha em |
|---|---|---|---|
| **MODELO A** · 3 vagas por posição | 33 | R$ 60.606 | R$ 2.800.000 |
| **MODELO B** · elenco enxuto | 28 | R$ 71.429 | R$ 2.800.000 |

Os dois distribuem a mesma massa de R$ 2.000.000 assim: goleiros 8%, defesa 27%,
meio 30%, ataque 35%. **Use `Duplicar` antes de editar** para preservar o modelo.

## Ficha do jogador

Clique no **nome** ou no **+** de um jogador no campograma (ou no **+** da lista de
busca, que abre o detalhe na própria linha) e a ficha aparece logo abaixo do campo,
na mesma tela.

Cinco colunas, na mesma leitura do Ranking: **Defesa**, **Ataque**, **Passe**,
**Decisão (DGP)** e **Físico (SkillCorner)** — esta última com PSV-99, velocidade
máxima (e TOP3), m/min, distância, alta intensidade, KM 15–20, KM +20, sprints,
acelerações e desacelerações fortes e mudanças de direção, tudo por 90 minutos.

Cada linha traz valor, barra, **média** e **melhor** da coorte: **verde** acima da
média, **vermelho** abaixo, **azul** quando o jogador é o líder, e o **traço laranja**
marcando a média. A comparação é, por padrão, **contra a mesma posição na liga dele**
— o seletor no topo troca para Brasil A/B/C ou para todas as ligas.

No cabeçalho: idade, contrato (com as fontes que o confirmam), salário estimado,
altura e peso, pé, nacionalidade, jogos e minutos, valor de mercado e xTV.

## Ver tudo numa tela só

O campograma segue as proporções do squad view do TransferRoom: cards de ~220 px com
cabeçalho (sigla, overall médio da posição e contador verde de atletas) e os jogadores
empilhados em pílulas claras.

As posições **não** ficam em coordenadas fixas: o campo mede os cards de verdade e
distribui — no campo deitado cada coluna empilha suas posições e fica centrada na
vertical; no campo em pé cada linha se espalha na horizontal. Assim não sobra vão
entre as linhas nem um card encosta no outro, com 1 ou com 6 nomes na posição.

Com **Escala: caber na tela** o campo encolhe até caber inteiro — e as **fontes sobem
na proporção inversa** (até 1,45×), de modo que reduzir não deixa a letra pequena.
Há um piso de 72%: abaixo disso ele prefere rolar a virar ilegível. A faixa ao lado
das abas diz o que aconteceu ("campo em 73% — cabe tudo na tela").

Na prática, um elenco de 38 atletas cabe inteiro numa tela mesmo em **cards completos**,
com clube, idade, contrato e overall de cada jogador.

A aba **Análise do elenco** tira os números de cima do campo e libera a largura toda
para o campograma.

## Tema claro

Em **Visual ▾ · Tema**. A escolha fica guardada. O PDF sai sempre em versão clara,
independentemente do tema da tela.

## Exportar

- **Excel** — todos os atletas com salário, custo com encargos, nacionalidade,
  estrangeiro sim/não, % da massa e o fechamento do orçamento.
- **PNG** — imagem do campograma.
- **PDF** — botão `PDF` (ou Cmd+P) monta um documento em A4 paisagem: cabeçalho com
  escudo, nome do grupo, contagem de atletas e estrangeiros e o fechamento do
  orçamento; o campograma inteiro, encolhido para caber na folha; e, na página
  seguinte, a tabela do elenco agrupada por posição com salário, custo com encargos,
  contrato, nacionalidade e status — com subtotal por posição e total geral.

## Atualizar a base de jogadores

```bash
cd ~/projetos/santa-cruz-2027
/Library/Frameworks/Python.framework/Versions/3.13/bin/python3 preparar_base.py set26
```

E os indicadores da ficha:

```bash
/Library/Frameworks/Python.framework/Versions/3.13/bin/python3 preparar_kpis.py set26
```

O primeiro lê `rankings_<periodo>.json`, o segundo `kpis_detail_<periodo>.json`
(arquivo grande, leva cerca de um minuto). Período atual: **ago26**.

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
