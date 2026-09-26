# Armadilhas conhecidas dos dados (do estudo anterior)

*Escrito em 20/09 · revisão 25/09/2026.*

Este arquivo NÃO traz conclusões do estudo anterior. Só o que ele descobriu sobre os próprios
dados e sobre desenho de análise — para o V2 não pisar no mesmo buraco. Fonte: `../_fonte/PROMPT_PROJETO.md`.

## Defeitos de dado

- `_temporal_photos.json`: rótulo **Peru** em 2024 traz times equatorianos e em 2025 paraguaios;
  Sérvia 2024 e Dinamarca / Equador B / Portugal A 2023 misturam divisões. Conserto é no Portal Ranking.
- Cruzamento de nome: casar sempre com o nome sem pontuação dos dois lados (`i russo`, não `i. russo`).
  Só o nome com ponto derrubava 98% dos argentinos.
- Homônimos na Série B: mesma posição + mesma data de fim de contrato = mesma pessoa registrada
  duas vezes; posição distante + contrato diferente = pessoas diferentes.
- Export Wyscout corta em 500 linhas por temporada: quem jogou pouco pode faltar. Temporada sem
  dado não é minutagem baixa.
- `serieb_jogos.csv` traz estaduais e copas (filtrar Série B), não traz escalação nem minuto de gol.
  Faltam 5 jogos em 2022–2026; a tabela remontada difere da oficial em 8 de 100 clube-temporadas.
- SkillCorner: não rastreia goleiro; sem recorte por tempo de jogo; `physical_match` cobre 2022–2026
  desde 22/09/2026 (antes só 2025–2026) e não tem TIP/OTIP; `possessions`/`passes` só 2026. Cobertura por clube-temporada vai de 62% a 97%.
- Wyscout conta acréscimos: minutos do time = soma dos minutos do elenco ÷ 11.
- Ficha de lesão do Transfermarkt cobre 73% das linhas e só enxerga lesão grande.
- Valor de elenco do Transfermarkt é instantâneo sem data.

## Armadilhas de desenho

- **Sobe (16) × Meio (48) não tem poder.** Por posição são 8 a 28 titulares. Só diferença enorme
  aparece; "não separa" ali significa "não dá para ver". O V2 mede contra pontos e rendimento,
  contínuo, com todos os 80 clube-temporadas e 3.036 jogos.
- **Times de fronteira** (a até 3 pontos da linha do G4 ou do Z4) viram o resultado conforme entram
  ou saem. Rodar com e sem.
- **Conta entre times ≠ conta dentro do time.** Entre clubes, muita coisa anda junto com o dinheiro
  (cruzar mais anda +0,26 com valor do elenco). Antes de virar meta, conferir jogo a jogo no mesmo clube.
- **Recorte que pode ser consequência do resultado é seleção**, não robustez (ex.: "só os jogos em
  que manteve o sistema" seleciona quem estava ganhando).
- **Ficha como conjunção de pisos reprova todo mundo** (13 de 240) e aponta para o lado errado no
  backtest. Ficha ordena; só minutagem elimina.
- **Posse, passes, corrida e xG mudam com o placar.** Sem minuto de gol, marcar "pode ser efeito do placar".
- **Indicador de fase (com/sem bola) carrega o clube** (~20% da variação). Comparar jogadores de
  times de posse muito diferente com cuidado.
- **Quem chega de outra liga guarda menos da metade do destaque** (10º → ~33º de cada 100). O
  desconto tem de aparecer na lista.
- **Frase "essa base não tem X" merece abrir o arquivo cru**: três vezes era defeito de código.
