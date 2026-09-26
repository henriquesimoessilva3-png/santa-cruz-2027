# Santa Cruz V2 — Recomendação de treinador e jogadores para a Série B 2027

*Escrito em 20/09 · revisão 25/09/2026.*

Estudo novo, do zero: nenhuma conclusão do estudo anterior entra aqui — só as armadilhas de dado e de desenho que ele revelou (`ARMADILHAS.md`). Objetivo único: **nomes** — o treinador e 26 a 30 jogadores, por posição,
para o Santa Cruz disputar a Série B de 2027. Tudo que não termina em nome é etapa intermediária.

## Premissas (herdadas do projeto, não do estudo anterior)

- Passe zero; massa salarial de R$ 2,0 MM/mês (R$ 2,8 MM de custo total); até 9 estrangeiros.
- 4-2-3-1, três níveis de elenco: N1 pilares e desempenho (26–33), N2 jovens de base de clube grande (≤23), N3 empréstimos e base própria.
- Mercados, em ordem de foco: Série B → Série A → sul-americanos no exterior → ligas sul-americanas (Argentina, Uruguai, Colômbia, Chile, Equador, Paraguai, Peru, Bolívia, Venezuela).

## Definições fixas

- **Unidade de análise:** clube-temporada (80 fechadas, 2022–2025, + 2026 em curso) e clube-jogo (~3.000). A régua é contínua: pontos, distância ao 4º (`dist_g4`) e rendimento acima do esperado pelo valor do elenco. Faixas Sobe/Meio/Cai só para descrever, nunca como teste principal.
- **Times de referência:** os que renderam acima do que o elenco custava (resíduo pontos × valor de elenco). São eles, e não só os 16 promovidos, que definem o perfil por posição.
- **Titular:** jogador com ≥ 60% dos minutos do clube na temporada. Percentis dentro de posição × temporada, só com ≥ 900 minutos.
- **Posições do campograma:** GOL, LD, ZD, ZE, LE, VOL (×2), MEI, ED, EE, CA.
- **Conclusão publicável:** diz o número em unidade de jogo, o n, e o que muda na contratação. Sem uso prático não sobe.

## Os cinco blocos

Cada bloco responde: (a) o que rende ponto, (b) o que isso exige de cada posição, (c) que
métricas entram na ficha de contratação e em que faixa. A ficha ordena; só minutagem regular elimina.

### Bloco 1 — Físico
Base: `skillcorner_serieb.db` (2022–2026) cruzada com minutagem e posição do Wyscout.
1. **No time:** volume, intensidade, velocidade e corridas sem bola rendem ponto, a dinheiro igual? Contínuo, 80 clube-temporadas, com e sem os clubes de cobertura baixa.
2. **Forma do elenco:** o que rende mais — um onze homogêneo ou um onze com "motores" e especialistas? Dispersão física dentro do onze contra pontos.
3. **Por posição:** perfil físico dos titulares dos times de referência, em faixas (P25–P75), nas três unidades (por 90, com posse, sem posse). Quanto do perfil de fase é do clube e não do jogador.
4. **Físico × disponibilidade:** quem corre mais joga mais minutos e se lesiona menos no ano seguinte?
5. **Desgaste:** returno e semana de três jogos (2025–2026), por posição.
**Entrega:** perfil físico por posição em faixas, os requisitos que se sustentam, e lista de quem está na faixa na Série B 2025–2026.

### Bloco 2 — Técnico
Base: `serieb_tecnico.csv` e `serieb_jogos.csv`.
1. **No time:** que indicadores técnicos rendem ponto a dinheiro igual (criação, finalização, defesa, duelos, progressão, pressão), na temporada e dentro do mesmo clube jogo a jogo.
2. **Perfil por posição dos titulares desses times:** faixas de 4–6 indicadores ligados ao eixo (toques na área, passes progressivos, xG por finalização, duelos defensivos e aéreos, passes ao terço final), como descrição, não como piso.
3. **Estabilidade:** quais indicadores o mesmo jogador repete de um ano para outro (valem para prever) e quais mudam com o clube (efeito do time).
4. **Goleiro à parte:** defesas %, gols sofridos contra esperados, jogos sem sofrer, saídas, bola alta.
**Entrega:** perfil técnico por posição em faixas e ranking de aderência (ordena, não elimina) de todos os jogadores da Série B 2024–2026 com minutagem regular.

### Bloco 3 — Bola parada
Base: `serieb_jogos.csv` (bolas paradas, cantos, livres, pênaltis com remate; gols pró e contra), `serieb_tecnico.csv` (livres/90, cantos/90, gols de cabeça, duelos aéreos), altura dos elencos.
1. **Quanto vale em pontos** um saldo de bola parada positivo, a dinheiro igual — e quanto custa (salário dos cobradores e finalizadores dos times que mais produzem).
2. **Quem produz:** cobradores (xA de bola parada, escanteios com remate) e finalizadores (gols de cabeça, toques na área em bola parada) da Série B, por temporada, com repetição entre anos.
3. **Quem defende:** os times que menos sofrem de bola parada — altura, duelo aéreo da zaga e do volante, e goleiro nas saídas.
**Entrega:** requisito de bola parada por posição (1 cobrador no MEI ou lateral, 3 finalizadores em ZD/ZE/VOL/CA) e lista de nomes com custo.

### Bloco 4 — Treinador
Base: `coletas/T01_rodada_treinador.csv` + `classificacao_rodada.csv` + `serieb_jogos.csv` + valor de elenco + web.
1. **Rendimento acima do esperado:** pontos por jogo de cada passagem descontado o valor do elenco e a posição ao assumir, 2018–2026 — quem entrega mais do que o elenco pagava, e repete em mais de um clube.
2. **O que os times dele fazem durante a passagem** (indicadores dos blocos 1–3) — e o que acompanha o treinador quando muda de clube.
3. **Estabilidade e contexto:** rodadas por passagem, elenco barato ou caro, promoção ou queda, interinos.
4. **Validação externa (web):** situação atual, contrato, comissão fixa, projetos anteriores com SAF ou clube em reconstrução.
**Entrega:** 5 a 8 nomes com o que cada um é, custo e disponibilidade, e 2–3 recomendados — decisão final por entrevista, comissão e projeto.

### Bloco 5 — Padrão de equipes
Base: tudo acima, no clube-temporada (80 fechadas + 2026).
1. **Os times que renderam acima do dinheiro** (o resíduo do Bloco 2): o que tinham em comum em idade, minutos concentrados, estrangeiros, bola parada, físico e treinador — e quantos subiram.
2. **A régua de 2027:** quantos pontos o G4 exige e os 6–8 números de time que o Santa Cruz precisa entregar, saídos dos blocos 1–3.
3. **Custo do traço:** com a folha estimada dos titulares (Transfermarkt como proxy), quanto custa o onze dos times de referência contra os R$ 2,0 MM.
**Entrega:** o modelo de jogo alvo em números, e a ficha final por posição (física + técnica + bola parada) que fecha os blocos 1–3.

## As três listas por posição

Com a ficha final e o perfil de treinador definidos, três listas, uma por mercado, cada uma com
titular + 2 opções por posição, custo estimado, contrato, nível N1/N2/N3, físico verificado ou não:

1. **Série B** (e Série A, para nomes que não podem ser descartados) — ficha completa, físico verificado, contrato vencendo.
2. **Ligas sul-americanas** — Argentina, Uruguai, Colômbia, Chile, Paraguai, Equador, Peru, Bolívia, Venezuela; ficha técnica com desconto de conversão de liga explícito, físico "não verificado" até export da API.
3. **Sul-americanos no exterior** — Europa, Ásia, México, EUA; mesmo tratamento, com risco de adaptação e custo de repatriação.

Goleiro é tratado à parte nas três listas: dados de goleiro do Bloco 2 + vídeo.

Fecho: elenco de 26–30 dentro dos R$ 2,0 MM, com o treinador, no campograma do app.

## Ordem de trabalho

1. Bloco 1 Físico → 2. Bloco 2 Técnico → 3. Bloco 3 Bola parada → 4. Bloco 5 Padrão (fecha a ficha)
→ 5. Bloco 4 Treinador → 6. Listas 1, 2 e 3 → 7. Elenco final e orçamento.

Um bloco por vez, validado antes do seguinte. Scripts em `scripts/`, resultados em
`resultados/<bloco>/`, listas em `listas/`.

## Pendências de dado (ver `bases/INVENTARIO.md`)

- Exports Wyscout por temporada (2024–2026) das ligas sul-americanas — para as listas 2 e 3.
- Export da API física para ligas de fora — quando o Bloco 1 fixar as métricas.


## Estado em 25/09/2026
Blocos 1–13 rodados (`resultados/b*/B*.md`): 8 físico × técnico, 9 duelos e posse, 10 sugestões pelo tipo
físico, 11 treinador e modelo de jogo, 12 conversão de liga revista (reta em vez de desconto fixo), 13 sorte × mérito
dos treinadores (xPts), 14 patamar de Série A (físico e técnico por posição, B × A × 5 grandes × Argentina).
15 Sofascore jogo a jogo (escalações, grandes chances, momentum, desfalques; xG e físico em 2025–26). Lista única ordenada nos três mercados em `listas/IDEAL_2027.md`. Listas por posição nos mercados Série B, sul-americanas e exterior
(`listas/`), sem Série A e sem os nomes vetados (`EXCLUIDOS.csv`), teto de € 2 MM e idade ≤ 35. Bola parada por
jogador com Sofascore (Série B). Conclusões em `DIFERENCIAIS.md`; régua e filtros em `SINTESE.md`.
Pendente: bola parada Sofascore das ligas sul-americanas (coleta bloqueada); físico das ligas de fora vem do
Portal (SkillCorner) e cobre parte dos nomes.
