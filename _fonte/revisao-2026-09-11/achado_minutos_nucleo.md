# Quem joga, joga: os minutos do núcleo — hipótese do dono do projeto, testada em 11/09/2026

Hipótese: "os times que sobem têm jogadores com minutagem mais alta no ano da subida e
historicamente". É o caminho honesto para a pergunta que a base de lesões não respondia:
em vez de "quem se machucou", **quem jogou**.

Fonte: `serieb_tecnico.csv` (minutos por atleta-temporada na Série B, 2022–2026), cruzado
com sobe/cai. Máximo por atleta = 38 × 90 = 3.420.

## A) No ano — confirmado, e forte

| | sobe | meio | cai | rho c/ posição |
|---|---|---|---|---|
| Minutos médios dos 11 mais usados | **2.545** | 2.412 | 2.219 | **+0,52** |
| Minutos médios dos 16 mais usados | 2.137 | 2.066 | 1.914 | +0,53 |
| Minutos do 11º mais usado | 1.658 | 1.656 | 1.507 | +0,30 |
| Atletas acima de 2.500 min | **6** | 4 | 3 | +0,48 |
| Atletas acima de 3.000 min | 3 | 2 | 1 | +0,42 |

O titular de quem sobe joga **326 minutos a mais** que o de quem cai — quase quatro jogos
inteiros. Quem sobe tem o dobro de atletas acima de 2.500 minutos.

## B) Histórico — existe, mais fraco

Para o núcleo (16 mais usados) de cada clube-temporada 2023–2025, os minutos que cada atleta
tinha feito na Série B do **ano anterior** (casamento por nome único + idade avançando 0–2
anos, a guarda de homônimo do projeto):

| | sobe | meio | cai |
|---|---|---|---|
| Cobertura (% do núcleo que estava na B no ano anterior) | 42,2 | 44,6 | 40,1 |
| Minutos no ano anterior, média do núcleo coberto | **1.569** | 1.641 | 1.327 |
| Atletas do núcleo com 2.000+ min no ano anterior | 2,8 | 2,5 | 2,0 |
| % do núcleo que já estava no mesmo clube | 34,0 | 32,9 | 32,3 |

rho de `min_ant_nucleo` com a posição: **+0,28** (passa do limiar 0,25 para n=59). A cobertura
é igual entre sobe e cai (rho +0,01), então não é viés de quem veio da A ou da C. Leitura:
quem sobe contrata quem já jogava — uns 240 minutos a mais por atleta no ano anterior.

Ressalva obrigatória: só ~42% do núcleo tem registro no ano anterior (o resto veio de outra
divisão ou do exterior). Vale a direção; para o nível seria preciso o histórico
multi-competição.

## É repetição do que já está na aba? A parte A, SIM; a parte B, NÃO

| par | rho (postos no ano) |
|---|---|
| min_top11 × conc_hhi (concentração nos 11, já na aba) | **+0,94** |
| n_acima_2500 × conc_hhi | +0,84 |
| min_top11 × atletas_usados | −0,47 |
| min_top11 × valor_total | +0,08 |

Pela régua do próprio estudo (acima de 0,70 = "a mesma história"), **os minutos do núcleo
no ano SÃO a concentração de minutos** dita em minutos em vez de porcentagem. Fora da
amostra: quarteto 0,77; quarteto + min_top11 0,74; trocando conc_hhi por min_top11 0,75 —
não acrescenta nada.

**Veredito:**
- **Parte A não entra como achado novo.** Entra como REFORMULAÇÃO do bloco "Time que sobe é
  time que se repete": trocar (ou acompanhar) "66,6% dos minutos nos 11" por "2.545 minutos
  por titular contra 2.219 — quase quatro jogos a mais cada; 6 atletas acima de 2.500 contra
  3". Mesma alavanca, unidade que um diretor entende.
- **Parte B é o achado novo**: o histórico do ano anterior (+0,28) não existe na aba. Vira
  bloco próprio — "Quem sobe contrata quem já jogava" — com a ressalva da cobertura de 42%
  escrita na tela e a nota de que só cobre quem estava na Série B no ano anterior.
