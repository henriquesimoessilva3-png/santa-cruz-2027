# Levantamento do terreno — aba Protótipo (12/09/2026)

Medido antes de projetar o método. Todo número aqui foi conferido no dado, não lembrado.

## O que existe, e dá para os quatro pilares

| pilar | fonte | o que tem |
|---|---|---|
| técnico individual | `dados/kpis.json` | 82 KPIs, 18.460 jogadores, **todas as ligas** (chave `Nome - Clube - Liga`) |
| | `dados/serieb_tecnico.csv` | 3.866 jogador-temporada da Série B, 118 colunas, 2022-2026 |
| técnico coletivo | `dados/serieb_clube_temporada.csv` | 100 clube-temporada × 288 colunas, com `faixa` (sobe 20 / meio 60 / cai 20) |
| | `dados/serieb_jogos.csv` | 3.570 partidas, 145 colunas por clube e jogo, inclusive `Sistema` (formação) |
| físico individual | `skillcorner.db` + ponte pronta em `gerar_raio_serieb.py` | 1.780 atleta-temporada com clube, posição e 300+ min rastreados |
| físico coletivo | idem, agregando por clube-temporada | **mediana de 22 atletas por clube-temporada; mínimo 16; nenhum abaixo de 8** |

**A cobertura física não enviesa a comparação** — mediana por faixa e por ano: cai 24-27,
meio 21-22, sobe 20-22. Ou seja, dá para juntar o físico dos atletas de um clube naquele ano
sem que "quem sobe" seja o mais bem medido.

## O universo de livres em dez/2026 (`dados/jogadores.json`, período ago26)

| grupo | livres até 31/12/2026 | contrato de alta confiança | com 900+ minutos |
|---|---|---|---|
| Série B | 356 | 202 | 108 |
| Série A | 202 | 85 | 41 |
| sul-americanos (12 ligas) | 3.597 | 1.194 | 1.525 |

A base traz `ctc` (confiança) e `ctf` (quais fontes concordam) — em sul-americano, **2.321 dos
3.597 são de confiança baixa**, e isso tem de aparecer na tela, não ser escondido numa média.

## O que NÃO existe: treinador

Não há nome de treinador em base nenhuma do projeto — procurei em `dados/*.csv`, `dados/*.json`
e nos arquivos do ogol. O que existe é `Sistema` (a formação de cada jogo) em
`serieb_jogos.csv`, que a revisão da Série B já apontou como **proxy da troca de treinador**,
não como o treinador.

### Decisão do dono (12/09/2026)

> "dá para pesquisarmos o treinador na web, de cada time em cada ano. pode ser até que tenhamos
> alguns durante o período do time no campeonato. mas vamos focar primeiro na análise dos times,
> seus padrões e formas de jogar. a parte do treinador a gente ajusta depois."

Ou seja: **a coleta por web está aprovada, mas é uma etapa POSTERIOR.** A análise dos times não
espera por ela, e não deve ser desenhada assumindo que o treinador vai existir — quando ele
chegar, entra como uma camada a mais sobre os padrões já construídos. Aceita-se mais de um
treinador por clube-temporada (com o intervalo de jogos de cada um), que é o caso real.

Então, do pedido do dono, "quais treinadores mais sobem" e "qual treinador contratar"
**exigem coleta nova**. O que dá para entregar sem coletar:
- padrão de formação de cada clube que subiu (qual `Sistema`, quantas trocas no ano);
- quantas quebras de formação houve, como proxy de instabilidade de comando;
- e a lista do que a coleta precisaria trazer, se for feita.
