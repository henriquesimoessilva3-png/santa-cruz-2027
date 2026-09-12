# O "quarteto de alavancas" fora da amostra — teste de 11/09/2026

A aba diz: quatro alavancas separadas (concentração de minutos `conc_hhi`, elenco caro
`valor_total`, goleiro que defende `gkDefesas`, gols de cabeça `golos_cabeca`) explicam 0,65
da posição final juntas; e ressalva que "com outras quatro temporadas o quarteto
provavelmente muda de composição". Testado.

## 1. A capacidade preditiva sobrevive (leave-one-season-out)

Regressão nos postos dentro do ano, treinada em 3 temporadas, prevendo a 4ª:

| conjunto | 2022 | 2023 | 2024 | 2025 | média fora | dentro (80) |
|---|---|---|---|---|---|---|
| **quarteto** | +0,71 | +0,88 | +0,79 | +0,69 | **+0,77** | +0,80 |
| só valor_total | +0,51 | +0,65 | +0,65 | +0,29 | +0,52 | |
| só conc_hhi | +0,55 | +0,65 | +0,57 | +0,40 | +0,54 | |
| só gkDefesas | +0,27 | +0,53 | +0,51 | +0,63 | +0,49 | |
| só golos_cabeca | +0,31 | +0,62 | +0,49 | +0,36 | +0,45 | |

Queda de 0,80 para 0,77: **não está sobreajustado**. O conjunto prevê a temporada que não
viu quase tão bem quanto a que viu, e muito melhor que qualquer alavanca sozinha. Vale
escrever na tela: hoje a aba só tem o número dentro da amostra.

## 2. A composição: os CONCEITOS são estáveis, as colunas não

Re-garimpando o melhor quarteto em cada subconjunto de 3 temporadas, com a regra da aba
(20 candidatas sem gol, xG, remates, pontos — "nenhuma delas é gol"):

| sem o ano | melhor quarteto | R² |
|---|---|---|
| 2022 | atletas_usados · valor_total · gkDefesas · runs_penalty_area | 0,69 |
| 2023 | atletas_usados · conc_hhi · val_defesa · gkDefesas | 0,62 |
| 2024 | atletas_usados · conc_hhi · val_defesa · gkDefesas | 0,68 |
| 2025 | conc_hhi · valor_total · gkDefesas · bp_conv | 0,67 |

Frequência: **gkDefesas 4/4**; grupo curto (`atletas_usados` 3 + `conc_hhi` 3 — medem a
mesma coisa) **6 das 8 vagas**; elenco caro (`valor_total` 2 + `val_defesa` 2) **4 das 8**;
a quarta vaga varia (corridas na área, conversão de bola parada). `golos_cabeca` ficou fora
desta busca por causa do filtro "golos" — não é evidência contra ele; a aba o permite.

## Consequência

- Manter o quarteto, mas apresentar a validação fora da amostra (**0,77**) ao lado do 0,65
  — é o número que responde "isto é achado ou garimpo?". Hoje a aba só tem o de dentro.
- Reescrever a leitura: não "são ESTAS quatro colunas", e sim **três alavancas conceituais
  estáveis** — goleiro que defende, confiar num grupo curto, elenco caro (sobretudo na
  defesa) — **mais uma quarta que a amostra escolhe**. É mais honesto e mais forte que a
  versão atual, porque sobrevive à troca de temporada.
