# Prompt para o Claude Code — refazer a aba Físico com o estudo V2

Projeto Santa Cruz 2027. Antes de mexer, leia `Santa Cruz V2/CLAUDE.md`, `ARMADILHAS.md`,
`resultados/b1/B1.md`, `resultados/b1/B1_perfis.md` e `resultados/b1/posicao_faixas.csv`.
O app fica na raiz: `static/app.js` (aba Físico começa em "aba Físico (SkillCorner)", ~linha 3699;
raio ⚡ em "raio físico", ~linha 5981), `preparar_base.py` monta `dados/jogadores.json`,
`publicar_site.py` gera `docs/`.

## Por que mudar
O "Índice físico geral" é a média de 8 grupos, com volume, acelerações e giro dentro. No meia, ele
dá 46 para quem subiu e 54 para quem caiu: ordena ao contrário. O estudo V2 (B1) concluiu:
1. **Piso de velocidade**: nenhum titular de linha abaixo de ~27 km/h de PSV-99. É o achado mais
   forte (a amplitude do onze anda contra o rendimento nas 5 temporadas; quartil mais estreito
   2,7 km/h = 55 pts; quem cai 4,0–4,35 km/h). O elo lento costuma ser meia ou volante.
2. **Intensidade** (sprints, ações de alta intensidade) acima da mediana: quem sobe P60–68, quem
   cai P33–41; a dinheiro igual vale 4–6 pontos. Efeito fraco, serve para ordenar.
3. **Traço da posição**: o titular dos times que rendem se diferencia em arrancadas explosivas e
   corridas para a área — não em distância nem em velocidade de pico.
4. Distância, acelerações/desacelerações, giro e "aguenta o returno": não rendem ponto.

## O que fazer

### 1. Ficha física V2 (substitui o índice geral como linha de cima da matriz)
Três selos, na ordem, para jogador de linha com ≥ 5 jogos rastreados (`sc_n`); goleiro fica fora:
- **Piso** (`psv`, PSV-99 por partida): ≥ 27,0 passa · 26,5–27,0 no limite · < 26,5 reprova.
- **Intensidade**: percentil médio de `spr_n` e `hi_n` na coorte da posição (a mesma da aba).
- **Traço da posição**, contra a faixa P25/P50/P75 dos titulares de referência de
  `posicao_faixas.csv` (setor: ZD/ZE→Zaga, LD/LE→Lateral, VOL→Volante, MED/MEI→Meia,
  ED/EE→Extremo, CA→Atacante):
  - ZD, ZE: arrancadas explosivas (`expl`) e corridas para a área (`obr_area`).
  - LD: sprints/90 e sprint com bola. LE: corridas para a área e alta velocidade com bola.
  - VOL: `expl` e alta velocidade com bola. MED: `expl`, `obr_area`, alta velocidade com bola.
  - MEI, ED, EE: `obr_area`. NÃO premiar sprint sem bola no extremo (aponta para baixo, r −0,39).
  - CA: sprint/90, sprint sem bola, `obr_area`, corridas perigosas (`obr_per`).
  **Confira a definição antes de usar a faixa**: só compare direto com `posicao_faixas.csv` o
  indicador cuja mediana dos jogadores de Série B no `jogadores.json` fique a ±10% da mediana do
  V2 (`perfis/jogadores.csv`) para o mesmo recorte. Se não bater (m × n, por 90 × por 30 TIP),
  recalcule a faixa com a definição do app a partir de `perfis/jogadores.csv`/`base_fisico.csv`,
  ou use percentil na coorte. Diga no código qual caminho cada indicador tomou.
- **Nota da ficha** (só para ordenar): 50% traço + 50% intensidade; o piso não entra na nota, é
  selo à parte (reprova fica marcado, não some da lista).
- **Validação obrigatória antes de publicar**: em cada posição, as colunas "Quem sobe" e
  "Quem cai" da matriz têm de sair com a nota de quem sobe ACIMA da de quem cai. Traga a tabela
  por posição (antes × depois). Onde não passar, não force: me diga qual posição e por quê.

### 2. Matriz reorganizada
Abertos por padrão: Piso, Intensidade, Traço da posição. Volume, Arranque e frenagem, Giro e
Com/sem bola vão para um bloco recolhido "Detalhe — não rende ponto (estudo V2, B1)". Nada é
apagado. Legenda curta no topo com as quatro conclusões acima, em uma linha cada.

### 3. Nova forma de ver: "Onze físico"
Ao lado de Matriz/Mapa/Réguas/Tiras. Pega os 10 titulares de linha (★) do cenário aberto no
campograma, ordena por `psv`, barras em km/h com linha em 27, mostra a amplitude (mais rápido −
mais lento) com as referências 2,7 km/h (quartil que mais pontuou) e 4,0 km/h (quem cai), destaca
o elo lento e lista quem não tem dado como "físico não verificado". Hoje, no Cenário 1, deve dar
amplitude 3,5 com o Eduardo (MEI, 26,6 km/h) como elo lento; sem ele, 1,3.

### 4. Raio ⚡ do card
Trocar a régua de 5 KPIs pela ficha V2: vermelho = reprova o piso; amarelo = no limite ou traço
abaixo do P25 da referência; verde = passa o piso e traço ≥ P50. Sem rastreio: ícone cinza "?"
com o texto "físico não verificado". Balão explica a régua em uma frase.

### 5. Completar o físico que falta com a base do V2
117 alvos do campograma estão sem físico (`Santa Cruz V2/listas/ALVOS_SEM_FISICO.csv`), 4 deles
titulares (Jonathan Costa, Kauã Diniz, Fabinho, Derik Lacerda). Muitos jogaram a Série B
2022–2026 e estão em `Santa Cruz V2/bases/skillcorner/skillcorner_serieb.db` (Kauã Diniz e
Fabinho no América-MG 2025, Derik Lacerda no Cuiabá 2025, entre outros).
- Em `preparar_base.py` (não à mão no JSON), para quem não tem físico, buscar a temporada mais
  recente com ≥ 5 jogos no banco do V2 e preencher os mesmos campos.
- Casar pelo nome sem pontuação E conferir clube de passagem e posição (ARMADILHAS: homônimos —
  Ronald, Luan, Guilherme, David têm mais de um). Na dúvida, não casa.
- Marcar a origem no jogador (ex.: `fis_src: "Série B 2025 · América-MG"`) e mostrar isso na
  ficha e no card: é físico de outra temporada/clube, não do atual.
- Regravar `ALVOS_SEM_FISICO.csv` só com quem continuar sem dado — essa é a lista que o Henrique
  vai levantar.

### 6. Premissa da Análise do elenco
Trocar o texto da premissa 1 "Time físico" por: "Time rápido e explosivo: nenhum titular de
linha abaixo de 27 km/h; intensidade acima da mediana da Série B; por posição, arrancadas e
corridas para a área. Não pagar por distância percorrida."

## Regras
- Não mude conclusão do estudo nem arquivos de `resultados/`.
- Comentário no código em português, dizendo de onde vem cada régua (arquivo do V2).
- Rode `python3 preparar_base.py` e `python3 publicar_site.py`; abra a aba e confira.
- Git: `git add` só dos arquivos que mexeu (nunca `git add .`), um commit por item acima.
- Antes de começar, rode `git push`: há dois commits locais meus ainda não enviados (subabas do
  Estudo Série B V2/V1 e este prompt). No fim, `git push` de novo para o site no ar receber tudo.
- Ao terminar, me traga: a tabela sobe × cai por posição, o Onze físico do Cenário 1, quantos
  alvos ganharam físico pela base do V2 e quantos ficaram na lista para levantar.
