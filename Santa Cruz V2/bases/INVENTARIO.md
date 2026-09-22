# Inventário das bases — Santa Cruz V2

Copiado em 22/09/2026 da pasta `Santa Cruz` (estudo anterior). Só dado bruto ou coletado entrou;
nenhuma conclusão do estudo anterior foi trazida.

## 1. Série B — técnico (Wyscout)

| arquivo | unidade | linhas | temporadas | o que traz |
|---|---|---|---|---|
| `serieb_tecnico.csv` | jogador-temporada | 3.866 | 2022–2026 | 118 indicadores Wyscout por 90 (duelos, passes, progressão, finalização, cruzamento, goleiro, bola parada: livres/90, cantos/90, gols de cabeça), idade, contrato, valor, nacionalidade, altura, pé |
| `wyscout_serie_b/dados tecnicos - serie B 2022 a 2026.zip` | idem, cru | 10 xlsx × 500 | 2022–2026 | o export original (corte de 500 linhas por export — quem jogou pouco pode faltar) |
| `wyscout_serie_b/serie B - indicadores ... 2018 a 2021.zip` | idem, cru | 8 xlsx | 2018–2021 | mesmo formato, só para conferência histórica |
| `serieb_jogos.csv` | clube-jogo | 9.318 | 2022–2026 | Team Stats por jogo: xG, remates dentro/fora, posse, PPDA, bolas paradas / cantos / livres / pênaltis com remate, entradas na área, cruzamentos, duelos; inclui estaduais e copas (filtrar Série B) |
| `serieb_jogos_2018_2021.csv` | clube-jogo | — | 2018–2021 | idem |
| `wyscout_serie_b/bases times serie B*.zip` | clube-jogo, cru | 3 zips, ~190 xlsx | 2018–2026 | Team Stats originais |
| `serieb_elencos.csv` | jogador-temporada | 5.098 | 2022–2026 | Transfermarkt: posição, nascimento, nacionalidades, altura, pé, contrato, valor, clube anterior |
| `serieb_lesoes.csv` | lesão | 2.724 | 2018–2026 | Transfermarkt: dias e jogos perdidos por ano |

## 2. Série B — físico (SkillCorner) — `skillcorner/skillcorner_serieb.db`

Cópia refeita em **22/09/2026** por `scripts/copiar_skillcorner.py` (fonte: `skillcorner.db` do Portal
Skillcorner, aberto só para leitura; rodar de novo o script refaz a cópia). Nesse dia o Portal coletou
na API o físico **por jogo** da Série B de 2022, 2023 e 2024, que antes só existia para 2025–2026.

| tabela | linhas | temporadas | o que traz |
|---|---|---|---|
| `physical` | 3.628 jogador-temporada (~720/ano) | 2022–2026 | 20 métricas × 3 unidades: por 90, por 30 min com posse (TIP), por 30 min sem posse (OTIP): distância, HSR, sprint, alta intensidade, acel/desacel, arrancadas explosivas, mudanças de direção, PSV-99, peak velocity |
| `physical_match` | 49.731 jogador-jogo | **2022–2026** | as mesmas métricas por jogo, só por 90 (sem TIP/OTIP), com data, partida, clube e posição SkillCorner. Por temporada: 2022 10.812 · 2023 11.012 · 2024 10.832 · 2025 11.027 · 2026 6.048 (até 11/08). Cerca de 370 das 380 partidas de cada temporada têm dado |
| `off_ball_runs` | 3.892 jogador-temporada | 2022–2026 | corridas sem bola: total, para a área, perigosas, recebidas, com finalização em 10 s |
| `passes`, `possessions` | 751 / 742 jogador-temporada | só 2026 | passes e posses individuais, por 30 min com posse |
| `players` | 2.112 | — | ponte SkillCorner ↔ Wyscout (`wyscout_player_id`), nascimento, posição |

Goleiro não é rastreado. Não há físico de nenhuma liga fora da Série B nesta cópia.

## 3. Mercados de fora (Wyscout, Portal Ranking) — `wyscout_ligas/`

| arquivo | o que traz | limite |
|---|---|---|
| `xlsx_ago26/` — 66 xlsx | foto de ago/2026, 115 indicadores por jogador, uma liga por arquivo. Sul-americanas: Argentina A/B/Reservas, Bolívia, Chile, Colômbia A/B, Equador A/B, Paraguai, Peru, Uruguai, Venezuela; Brasil A/B/C; Europa, Ásia, EUA, México | **uma temporada só** |
| `_temporal_photos.json` | 2018–2026, por temporada: jogador, liga, posição, minutos, nota de qualidade normalizada (qz) | só a nota, não os indicadores |
| `_temporal_movers.json` | quem trocou de liga, com a nota antes e depois | insumo para ajustar nível entre ligas |

## 4. Coletas (não são Wyscout) — `coletas/`

| arquivo | o que traz |
|---|---|
| `T01_rodada_treinador.csv` | treinador de cada clube em cada rodada da Série B, 2018–2026 (6.546 linhas), com interino, início e fim |
| `classificacao_rodada.csv` | classificação rodada a rodada, 2022–2026, com faixa (Sobe/Meio/Cai) e distância ao G4 |
| `serieb_gols_por_minuto.csv` | gols marcados e sofridos por faixa de 15 min, por clube-temporada, 2018–2026 |
| `serieb_origem_2018_2026.csv` | de onde veio cada clube (A, B ou C) em cada ano |

## 5. O que falta e como resolver

1. **Indicadores por temporada nas ligas sul-americanas** — só há a foto de ago/26. Para minutagem regular e tendência nos três mercados de fora, precisa de exports Wyscout por temporada (2024, 2025, 2026) das ligas sul-americanas, ou das pastas `dados/<periodo>` do Portal Ranking.
2. **Físico fora da Série B** — a API local (`localhost:5058`) não é alcançável daqui; quando o Bloco 1 fixar as métricas, um export da API para `bases/skillcorner/` cobre as ligas que ela tiver.
3. **Bola parada por jogador** — o Wyscout dá cobrador (livres/90, cantos/90) e finalizador (gols de cabeça, duelos aéreos); quem defende bem bola parada só aparece no nível do time (gols sofridos de bola parada em `serieb_jogos.csv`). Vídeo fica como validação.
4. **Sul-americanos no exterior** — identificáveis pelas colunas `Birth country` / `Passport country` dos 66 xlsx; ligas asiáticas e europeias já estão na foto.
