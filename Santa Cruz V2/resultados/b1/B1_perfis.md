# Bloco 1 — Camada descritiva: jogadores, posições e equipes

*Dado: SkillCorner 2022–2026 · revisão 25/09/2026.*

Arquivos em `perfis/` (e `perfis/perfis.xlsx`, uma aba por tabela):
- `jogadores.csv` — 2.994 jogador-temporadas (2022–2026) com físico, minutos, fatia, posição do
  campograma, ordem de minutagem no clube, percentil dentro de temporada × posição e o
  rendimento do clube. 418 titulares (≥ 60% dos minutos).
- `onze.csv` — o mais usado de cada posição em cada clube-temporada, com seu físico.
- `posicoes.csv` — perfil de cada posição: liga (P25/mediana/P75), titulares, titulares dos
  times de referência (quartil de cima em rendimento acima do dinheiro) e demais titulares.
- `posicao_vs_liga.csv` — quanto cada posição difere da mediana dos jogadores de linha.
- `equipes.csv` — perfil físico de cada clube-temporada, com percentil na temporada, pontos,
  posição e rendimento.

Posições: GOL (sem físico — SkillCorner não rastreia), LD, ZD, ZE, LE, VOL, MED, MEI, ED, EE, CA.
Lado do zagueiro pela posição do Wyscout (RCB → ZD, LCB → ZE).

## 1. O que cada posição pede (todos os titulares, 2022–2025)

Distância e velocidade de pico quase não mudam entre posições (±5% e ±4%). O que muda é o
tipo de esforço:
- **Extremos (ED/EE):** o perfil mais explosivo — arrancadas +64/+66%, sprint com bola +70/+79%,
  corridas para a área +112/+135% sobre a mediana de linha.
- **Centroavante:** corrida para a área +267% e corridas perigosas +187%; arrancadas +33%.
- **Laterais (LD/LE):** sprint +24/+19%, arrancadas +44/+29% — o LD é mais explosivo que o LE
  na Série B; sem bola os dois sprintam +18/+13%.
- **Zagueiros (ZD/ZE):** o perfil mais baixo em tudo que é intensidade (−40% alta velocidade,
  −92% corrida para a área), mas com a mesma velocidade de pico da liga. ZD e ZE são iguais.
- **Volante:** −31% sprint, −50% arrancadas; é a posição que mais corre em alta velocidade SEM a
  bola (+14%) — a única, com o MED (+12%), acima da média nessa fase.
- **MED:** distância +5%, mudanças de direção +7%, sem bola +12%; com bola, abaixo da média.
- **MEI:** o mais próximo do extremo nas corridas para a área (+73%), mas abaixo em sprint.

## 2. Onde o titular dos times que rendem difere do titular comum (n de referência entre 5 e 18 por posição)

- **Centroavante:** o maior contraste de todas as posições — sprint/90 +51%, sprints +49%,
  sprint sem bola +34%, corridas perigosas +41%, mudanças de direção +31%. O CA dos times que
  rendem é um atacante que corre forte, com e sem bola.
- **Zagueiros:** arrancadas explosivas +38% (ZD) e +48% (ZE), sprint com bola +49% (ZD),
  corridas perigosas +47% (ZD). Não é distância: é explosão e sair jogando com corrida.
- **Volante e MED:** arrancadas +37% / +26%, alta velocidade com bola +11% / +34%, corridas
  para a área do MED +72%. O meio dos times que rendem acelera mais com a bola.
- **Laterais:** LD com sprint com bola +20% e sprint/90 +14%; LE com corridas para a área +37%
  e alta velocidade com bola +17%. Sem bola, nenhum dos dois se destaca.
- **Extremos e MEI:** os únicos em que o titular dos times que rendem corre MENOS — sprint
  −10/−13%, arrancadas −10/−26%, sem bola −18/−17%. O extremo dos times de referência não é o
  mais explosivo da liga; provavelmente é mais técnico (a conferir no Bloco 2).

Leitura: em nenhuma posição a diferença está na distância (0 a 3%) nem na velocidade de pico
(±3%). Está em arrancada, sprint com bola e corrida para a área — e no ataque, em correr forte
nas duas fases.

## 3. Perfil da equipe (percentil médio na temporada, 2022–2025)

| | Cai | Meio | Sobe |
|---|---|---|---|
| Distância/90 | 48 | 52 | 58 |
| Alta velocidade/90 | 39 | 54 | 63 |
| Sprints/90 | 33 | 56 | 62 |
| Arrancadas explosivas/90 | 41 | 52 | 66 |
| PSV-99 top5 | 34 | 54 | 68 |
| Sprint sem bola/30min | 34 | 56 | 61 |
| Corridas para a área/30min | 41 | 52 | 64 |

Quem sobe está no percentil 60–68 em intensidade, velocidade e corridas para a área; quem cai,
no 33–41. Distância separa pouco (48 → 58). Acelerações e desacelerações fortes não separam nada — por equipe o indicador
chega a aparecer ao contrário e por posição não diz nada (B8-5); ficou fora da tabela e da ficha.
Ressalva do `B1.md`: parte dessa vantagem de quem sobe é dinheiro; descontado o elenco, o que
sobra é intensidade (4–6 pontos) e o piso de velocidade do onze.

## 4. O que a equipe precisa ter em vantagem
Pelo que a base sustenta, em ordem:
1. **Nenhum titular de linha lento** — piso de PSV-99 na faixa de 27 km/h (o achado 2 do B1.md).
2. **Intensidade acima da mediana da liga** (sprints, ações de alta intensidade, arrancadas):
   quem sobe está no percentil 60+; a dinheiro igual ainda vale 4–6 pontos.
3. **Corrida para a área acima da mediana** — no time e, por posição, no CA, MED, ZD/ZE e LE.
4. Distância total, acelerações e desacelerações: irrelevantes. Não pagar por isso.
