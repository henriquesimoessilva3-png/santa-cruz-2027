# Quando o acesso se decide — curva reconstruída jogo a jogo, 11/09/2026

Fonte: `serieb_jogos.csv` (3.570 clube-partida da Série B), pontos acumulados após o
k-ésimo jogo de cada clube (proxy da rodada; jogo adiado desloca uma casa), posto dentro do
ano, 2022–2025 (80 clube-temporada). A aba hoje só diz "10 de 16 já estavam no G4 na metade".

## Chance de terminar no G4 dada a posição na rodada k

| rodada | 1º–4º | 5º–8º | 9º–12º | 13º+ | dos 16 já no G4 |
|---|---|---|---|---|---|
| 5 | 41% | 36% | 6% | 4% | 9 |
| 10 | 37% | 33% | 22% | 0% | 7 |
| 15 | 50% | 29% | 13% | 0% | 9 |
| 19 | 65% | 19% | 10% | 0% | 11 |
| 23 | 59% | 25% | 12% | 0% | 10 |
| 27 | 50% | **47%** | 0% | 0% | 9 |
| 30 | 69% | 26% | 0% | 0% | 11 |
| 34 | 78% | 12% | 0% | 0% | 14 |

**Leitura em três frases:**
1. Até a rodada 10 a tabela é quase ruído para o topo: estar no G4 dá 37%, do 5º ao 8º dá 33%.
2. **O corte é top-8, não G4.** Da rodada 19 em diante, do 9º para baixo a chance é 0–12%.
   O campo de candidatos se fecha na metade.
3. Dentro do top-8 fica aberto até tarde: na rodada 27, G4 50% contra 5º–8º **47%**. A ORDEM
   só se decide depois da 30ª.

## Regra nova (G6 = playoff)

| rodada | no G6, fica no G6 | 7º–10º, entra no G6 |
|---|---|---|
| 10 | 56% | 36% |
| 19 | 68% | 31% |
| 27 | 64% | 29% |
| 30 | 72% | 27% |
| 34 | 80% | 25% |

Na rodada 27, um terço do G6 ainda será substituído.

## O ritmo: pontos acumulados na rodada k por faixa final (a régua para ler 2026)

| faixa final | rod 10 | rod 19 | rod 27 | rod 30 | rod 34 | rod 38 |
|---|---|---|---|---|---|---|
| 1º–2º (direto) | 17,6 | 33,5 | 47,0 | 53,8 | 60,6 | 68,5 |
| 3º–4º | 17,5 | 31,5 | 43,4 | 48,5 | 56,9 | 63,4 |
| 5º–6º (playoff) | 15,6 | 29,9 | 42,2 | 46,6 | 53,8 | 61,2 |
| 7º–8º | 18,5 | 29,9 | 41,1 | 45,5 | 52,8 | 58,7 |
| 9º+ | 11,3 | 21,9 | 31,7 | 35,1 | 39,4 | 43,6 |

Mínimo que alguém que subiu tinha: rod 10 → 14; rod 19 → 25; rod 27 → **39**; rod 30 → 45;
rod 34 → 53. É o pior ritmo que ainda deu acesso.

**2026 na rodada 27:** sete clubes no ritmo do G4 (≥ 39): Juventude 50, Novorizontino 49,
Fortaleza 47, Operário-PR 43, CRB 42, Sport 41, Cuiabá 39. Athletic, Náutico e Goiás
(36–37) no ritmo do G6. Note que 7º–8º e 5º–6º têm o MESMO ritmo até a rodada 30 (41 × 42)
— o playoff se decide nas últimas oito.

## Uso na aba

Vira o bloco central de "O jogo" (ou de uma seção nova "Quando se decide"): a tabela
acima como mapa de calor rodada × posição, com a linha de 2026 marcada. Substitui a frase
"10 de 16 já estavam no G4" por uma curva, e dá ao diretor a resposta operacional: **na
metade do campeonato, estar no top-8 é condição; estar no G4 não é garantia.**

Ressalva na tela: rodada = k-ésimo jogo do clube, não a rodada oficial; n por célula é
pequeno (14–32), então os degraus de 5–10 pontos percentuais são ruído — vale o desenho
geral, não a casa decimal.
