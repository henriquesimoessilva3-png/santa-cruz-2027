# A tipologia dos 16 que subiram

**A resposta curta.** Os 16 clube-temporada que subiram entre 2022 e 2025 se organizam em **dois eixos táticos, não em cinco**: (1) de quem é o campo e a área — *território*; (2) como a bola chega lá — *rota*: saindo jogando pelo chão ou mandando para a frente. Cruzando os dois na mediana dos 16 saem **quatro grupos (5 / 3 / 3 / 5)**, e três deles passam no teste de fora. O quarto (o cerco de bola direta, n=3) não passa e vai marcado como **DESCRITIVO**.

Nenhuma das cinco tipologias entregues foi adotada inteira. Esta é uma **fusão**: o eixo de posse/construção veio da Tipologia 1, o eixo de ocupação de área veio da Tipologia 3, e os dois foram recortados juntos e revalidados do zero. Por que a fusão e não uma delas: no mesmo teste, com a mesma bateria e o mesmo nulo duro, a fusão de 2 eixos com 4 grupos bate todas as cinco originais (detalhe abaixo).

---

## O que foi testado, e o que cada teste disse

**A construção, declarada antes do teste (5 colunas, e só elas):**

- **EIXO 1 — TERRITÓRIO** (*de quem é o campo e a área*): média dos percentis **dentro do ano** de `posse`, `entradas_area` e `toques_area`. Corte: mediana dos 16 = **72,5**.
- **EIXO 2 — ROTA** (*como a bola anda até lá*): média dos percentis de `passes_pct` e de `passe_longo_pct` invertido. Corte: mediana dos 16 = **66,25**.

Tudo em posto dentro da temporada (20 clubes por ano, 80 linhas em 2022-2025), método da casa. Nada de k-means: são duas medianas.

**O que ficou de fora e virou teste:** 38 indicadores técnicos coletivos, as 166 colunas `fis_*`, a formação de cada jogo (`serieb_jogos.csv`), o dinheiro (`tm_valor_total`) e o resultado.

| Teste | Resultado |
|---|---|
| **Teste de fora, 38 indicadores** | eta² médio observado **0,410** contra 0,196 de rótulo sorteado, **p=0,0002**. Por indicador, **11 sobrevivem a Benjamini-Hochberg com q<0,05** e 15 com q<0,10. |
| **Nulo duro (placebo)** — a crítica que derrubou as análises anteriores | Gerei partições ordenando os 16 por **qualquer indicador real de futebol** e cortando nos mesmos tamanhos (o nulo que respeita a correlação entre indicadores, ao contrário de embaralhar rótulo). Nulo 0,238; observado 0,410; **p=0,0012**. |
| **Bateria limpa** (só os 23 validadores com \|r\|<0,50 contra os dois eixos nas 80 linhas) | eta² 0,253 contra 0,205, **p=0,099**. **Não passa.** Metade do sinal é a família do passe re-embalada. Está dito aqui, não no rodapé. |
| **Corte de TERRITÓRIO (8 x 8)** | p=0,0002 |
| **Corte de ROTA (8 x 8)** | p=0,0077 |
| **Físico (166 `fis_*`)** | 17 de 166 a p<0,05 (acaso esperaria 8,3), global **p=0,072**, menor q de BH 0,301. Indício, não achado — e o topo da lista é corrida **com a bola** para dentro da área (`fis_runs_penalty_area_p30tip`, p=0,003), coerente com o eixo de território. |
| **Formação** (608 jogos, 16 × 38, `Sistema`) | **Não separa nada**: % de jogos com linha de três p=0,82; formações distintas p=0,84; % na formação principal p=0,83. O 4-2-3-1 é de todo mundo. |
| **Estabilidade — tira um time** (medianas recalculadas nos 15) | 1,00 troca por remoção, e **só dois times se mexem**: Vitória 2023 e Sport 2024. Os outros 14 nunca mudam. |
| **Estabilidade — tira um indicador** | máximo 2 trocas em 16; tirando `passes_pct` **ou** `passe_longo_pct`, **zero** trocas. |
| **Jaccard de bootstrap (Hennig, 1.000)** | 0,55 / 0,41 / 0,48 / 0,50 — **abaixo dos 0,60 de dissolução**. Ressalva honesta: rodando o mesmo código na Tipologia 1 dá 0,41-0,55. Esse número é propriedade de n=16 com corte na mediana, não desta partição. |
| **Nulo no espaço reduzido** (silhueta nos 2 eixos contra gaussiana de mesma covariância, 500 réplicas) | observada 0,345, nulo 0,217, **p=0,084**. **Não passa.** Os 16 são um plano contínuo cortado em quatro, não quatro ilhas. |

**As cinco tipologias entregues, medidas na mesma bateria e no mesmo nulo placebo:** Tipologia 1 (posse) eta² 0,411, p=0,0036 — a melhor das cinco; Tipologia 3 (cadeia do gol) 0,375, p=0,064; Tipologia 2 (defesa) 0,301, p=0,478; Tipologia 4 (físico) 0,214, p=0,956; Tipologia 5 (elenco) 0,129, p=0,999. **As tipologias 4 e 5 não são tipologias de jogo** e foram descartadas. Também testei o **consenso** das três táticas (os times que as três colocaram juntas: 4 grupos de 6/4/3/3) — eta² 0,271, p placebo 0,265: **perde** para o recorte de dois eixos e foi descartado. O que sobreviveu do consenso e vale registrar: **Bahia 2022 + Sport 2024 + Ceará 2024 ficaram no mesmo grupo nas três tipologias táticas, e Chapecoense 2025 + Remo 2025 também.**

---

## Os grupos

### G1 — O DONO DO JOGO: sai jogando e cerca (n=5) — **TIPO**
> *Tem a bola, sai jogando pelo chão, empurra o adversário para trás e vive dentro da área dele: pressiona alto, entra 25,6 vezes na área por jogo e bate 5,8 escanteios — e do outro lado quase não deixa finalizar (11,0 remates contra).*

| Clube | Ano | Posição | Posto de valor no ano |
|---|---|---|---|
| Cruzeiro | 2022 | 1º | 3º de 20 (R$ 29,8 mi) |
| Grêmio | 2022 | 2º | 1º de 20 (R$ 49,8 mi) |
| Atlético-GO | 2023 | 4º | 2º de 20 (R$ 24,5 mi) |
| Santos | 2024 | 1º | 1º de 20 (R$ 64,1 mi) |
| Athletico-PR | 2025 | 2º | 1º de 20 (R$ 50,5 mi) |

**Assinatura.** Eixos: território **92** / rota **88** (percentis médios no ano). Brutos: posse 53,9% · acerto de passe 83,1% · passe longo 10,6% · entradas na área 25,6 · toques na área 16,9 · ataques posicionais 32,1 · PPDA 8,76 · recuperações 80,4 · passes no terço final 60,1 · 11,0 remates contra. **Validadores que não entraram na construção:** `passes_frente_pct` percentil 87 · `passes_terco_final` 88 · `cantos` 82 · `intensidade` 91 (o maior dos quatro) · `atq_pos_remates` 89 · `amarelos` 14 (o menor — cerca sem parar o jogo). Um-contra-o-resto: **p=0,0034**. Posição final média 2,0; 68,0 pontos.
**Formação:** 4-2-3-1 em 35,8% dos jogos, 3-4-3 16,8%, 4-4-2 14,2%; 30,0% dos jogos com três ou cinco atrás — mas isso é Cruzeiro 2022 (78,9%) e Athletico-PR 2025 (50,0%); Santos jogou 0%. **A formação não é assinatura de grupo nenhum** (p=0,82).
**Dinheiro:** posto médio **1,60**. Os cinco estavam entre os **três** elencos mais valiosos do seu ano. Isto é achado, não nota de rodapé (ver a seção do dinheiro).

### G2 — O CERCO DE BOLA DIRETA: afoga a área (n=3) — **DESCRITIVO, não modelo**
> *Também vive na área do adversário, mas não constrói pelo chão: manda para a frente, cruza 18,0 vezes por jogo, disputa a segunda bola e faz falta — o maior xG dos quatro (1,43) e o maior número de duelos aéreos.*

| Clube | Ano | Posição | Posto de valor no ano |
|---|---|---|---|
| Bahia | 2022 | 3º | 4º de 20 (R$ 21,7 mi) |
| Sport | 2024 | 3º | 6º de 20 (R$ 21,0 mi) |
| Ceará | 2024 | 4º | 4º de 20 (R$ 24,7 mi) |

**Assinatura.** Eixos: território **85** / rota **37**. Brutos: posse 51,5% · acerto de passe 80,9% (percentil 37) · passe longo 12,3% (percentil 62) · toques na área 17,1 (percentil 92) · cruzamentos 18,0 (percentil 88) · escanteios 6,13 (percentil 87) · faltas 14,26 (percentil 67) · PPDA 9,00 · xG 1,43 (percentil 96). Contra o G1, os indicadores **de fora** que o separam: `duelos_aereos` 77 contra 40 (p=0,082), `amarelos` 62 contra 14 (p=0,025), `faltas` 67 contra 34 (p=0,060), `intensidade` 47 contra 91 (p=0,008).
**POR QUE ESTÁ MARCADO.** Um-contra-o-resto na bateria de fora: **p=0,160 — não passa**. E o corte que o separa do G1 (a rota, dentro dos 8 times de território alto) dá **p=0,070**, contra p=0,035 do mesmo corte no andar de baixo. Ele existe como **descrição dos três**, com o argumento de autoridade de que as três tipologias táticas anteriores puseram exatamente esses três juntos, 3 de 3 — mas não como modelo que se possa mandar copiar.
**Formação:** 4-2-3-1 39,5%, 4-4-2 26,3%, 4-1-4-1 11,4%; 13,2% de linha de três. **n=3**: os três subiram pela terceira e quarta vaga (3º, 3º, 4º), o que é observação de três casos, não lei.

### G3 — O CONTROLADOR PACIENTE: passa curto, não pressiona, não invade (n=3) — **TIPO**
> *O melhor passe dos quatro (84,1% de acerto, percentil 93) e a menor vontade de ir buscar: PPDA 11,24, 72,0 recuperações por jogo — o menor número da amostra — e só 21,8 entradas na área. Fica com a bola, não sobe a linha, e não toma gol: 21,3 jogos sem sofrer, o maior de todos.*

| Clube | Ano | Posição | Posto de valor no ano |
|---|---|---|---|
| Vitória | 2023 | 1º | 9º de 20 (R$ 14,0 mi) |
| Mirassol | 2024 | 2º | 9º de 20 (R$ 17,0 mi) |
| Coritiba | 2025 | 1º | 4º de 20 (R$ 23,5 mi) |

**Assinatura.** Eixos: território **53** / rota **93** (a rota mais alta dos quatro). Brutos: posse 51,9% · acerto de passe 84,1% · passe longo 10,7% · comprimento do passe 19,84 m (o mais curto) · entradas na área 21,8 · ataques posicionais 26,5 · PPDA 11,24 · recuperações 72,0 · faltas 11,96 (o menor) · 12,3 remates contra. **Validadores de fora:** `passes_frente_pct` 87 · `duelos_aereos` percentil 17 (o menor — não disputa bola alta) · `xg_contra` percentil 15 · `xg_por_remate_contra` percentil 7 (só leva chute ruim) · `clean_sheets` percentil **100** (20, 23 e 21 jogos sem sofrer gol) · `defesa_vs_xg` +0,29. Um-contra-o-resto: **p=0,0267**.
**Formação:** 4-2-3-1 34,2%, 4-1-4-1 19,3%, 4-4-2 16,7%; 9,6% de linha de três — o grupo mais ortodoxo.
**Dinheiro e desfecho:** posto médio 7,33 com **as melhores posições da amostra (1º, 2º, 1º)**. É o grupo barato que ganhou o campeonato — e o alerta que vem junto: `defesa_vs_xg` +0,29 significa que sofreram menos gols do que o xG cedido previa; parte disso é goleiro e pontaria alheia, não desenho. **n=3.**

### G4 — O REATIVO DE BOLA DIRETA: entrega o campo e vive da segunda bola (n=5) — **TIPO**
> *O grupo que o diretor reconhece na hora: a menor posse (49,6%), o passe mais longo, 20,9 entradas na área, quase nada de ataque posicional (26,3) e o maior volume concedido (13,2 remates contra, 1,23 de xG contra). Ataca no espaço e defende com o campo curto.*

| Clube | Ano | Posição | Posto de valor no ano |
|---|---|---|---|
| Vasco | 2022 | 4º | 2º de 20 (R$ 31,1 mi) |
| Juventude | 2023 | 2º | 5º de 20 (R$ 16,8 mi) |
| Criciúma | 2023 | 3º | 12º de 20 (R$ 10,9 mi) |
| Chapecoense | 2025 | 3º | 18º de 20 (R$ 10,0 mi) |
| Remo | 2025 | 4º | 3º de 20 (R$ 27,6 mi) |

**Assinatura.** Eixos: território **39** / rota **44**. Brutos: posse 49,6% · acerto de passe 80,9% · passe longo 12,8% (o maior) · comprimento do passe 20,63 m · entradas na área 20,9 · ataques posicionais 26,3 · PPDA 10,55 · 13,2 remates contra · xG contra 1,23. **Validadores de fora:** `passes_frente_pct` percentil **28** (o menor — troca passe em segurança e vai longo quando vai) · `passes_terco_final` 32 · `contra_ataques` percentil 66 (o maior) · `cantos` 33 · `cruzamentos` 30 · `duelos_aereos` 53 · `defesa_vs_xg` +0,31 (o maior — subiram com a defesa rendendo acima do previsto). Um-contra-o-resto: **p=0,0009 — o grupo mais sólido da tipologia**.
**Formação:** 4-2-3-1 27,4%, 4-4-2 20,5%, 4-3-3 11,1%, 4-3-1-2 9,5%; 21,6% de linha de três, quase toda da Chapecoense 2025 (81,6%). De novo: a formação não separa.
**Dinheiro:** posto médio 8,00, mas com a maior dispersão da amostra — Vasco 2º e Remo 3º do seu ano ao lado da Chapecoense, 18ª de 20. **Este grupo não é "o grupo dos baratos".**

---

## Os times de fronteira, nominalmente

1. **Vitória 2023 — o caso crítico da tipologia inteira.** Território 71,7 contra um corte em 72,5: **0,8 ponto de percentil**. Com ruído de ±10 pontos nos eixos, muda de grupo em **57% dos sorteios** (vira G1, dono do jogo). É também um dos dois únicos times que se mexem quando se tira qualquer outro time da amostra. Se ele subir, **o G3 fica com n=2 e o G1 com n=6**. Leia o Vitória 2023 como o ponto exato onde "dono do jogo" vira "controlador paciente".
2. **Ceará 2024 — o espelho.** Território 73,3, a **0,8 ponto do corte pelo outro lado**; troca em 35% dos sorteios e cairia no G4 (reativo). Se cair, **o G2 fica com n=2**. Vitória e Ceará estão colados na mesma linha, em lados opostos, e são o par que define onde a fronteira de território realmente passa.
3. **Bahia 2022** — território 76,7 (+4,2); troca em 16% dos sorteios, indo para o G4.
4. **Sport 2024** — o mais perto do corte de **rota**: 57,5 contra 66,25 (−8,8). Com o corte um pouco mais baixo, o Sport vira G1 (dono do jogo) e o G2 fica com dois times. É o segundo dos dois times que se movem no teste de tirar um time.
5. **Santos 2024 e Athletico-PR 2025** — território 80,0, a 7,5 do corte; trocam em 5% e 6% dos sorteios.
6. **Núcleo duro, que não se move em teste nenhum:** Cruzeiro 2022 e Atlético-GO 2023 (G1), Mirassol 2024 e Coritiba 2025 (G3), Vasco 2022, Juventude 2023, Chapecoense 2025 e Remo 2025 (G4). Oito dos dezesseis são inamovíveis.

**Conferência de consequência:** trocando os dois fronteiriços de uma vez (Vitória → G1 e Ceará → G4), o teste de fora **continua passando** (eta² 0,376, p=0,0002). A tipologia não depende de acertar esses dois.

**Uma subdivisão que eu testei e recusei.** Dentro do G4 há um abismo real de posse: Juventude 2023 (percentil 85) e Vasco 2022 (75) contra Criciúma 2023 (25), Remo 2025 (30) e Chapecoense 2025 (20) — 45 pontos de percentil sem ninguém no meio. É a divisão "tem a bola e não faz nada com ela" contra "abre mão da bola". **Não virou grupo** porque não paga: o excesso sobre o nulo cai de 0,172 para 0,166, e Vasco+Juventude num-contra-o-resto dá p=0,157. Fica como observação sobre dois times, não como quinto grupo.

---

## O que separa os grupos ALÉM do que os construiu (o teste de fora, com número)

Construção: 5 colunas. Fora dela: 38 indicadores técnicos coletivos, 166 colunas físicas, a formação, o dinheiro e o resultado.

**Os 11 que sobrevivem à correção de Benjamini-Hochberg (q<0,05), com o percentil médio no ano por grupo (G1 / G2 / G3 / G4):**

| Indicador (nenhum entrou na construção) | eta² | p | G1 | G2 | G3 | G4 |
|---|---|---|---|---|---|---|
| `atq_posicional` | 0,854 | 0,00003 | 89 | 92 | 33 | 31 |
| `passes_frente_pct` | 0,845 | 0,00004 | 87 | 47 | 87 | 28 |
| `passes_certos` | 0,813 | 0,0001 | 92 | 52 | 88 | 34 |
| `passes` | 0,785 | 0,0003 | 92 | 53 | 87 | 36 |
| `cantos` | 0,774 | 0,0003 | 82 | 87 | 42 | 33 |
| `passes_terco_final` | 0,750 | 0,0006 | 88 | 80 | 62 | 32 |
| `cruzamentos` | 0,693 | 0,0021 | 74 | 88 | 42 | 30 |
| `passes_frente` | 0,671 | 0,0031 | 90 | 60 | 89 | 38 |
| `xg` | 0,664 | 0,0036 | 85 | 96 | 55 | 44 |
| `atq_pos_remates` | 0,651 | 0,0044 | 89 | 64 | 27 | 34 |
| `recuperacoes` | 0,607 | 0,0088 | 70 | 73 | 13 | 39 |

Mais quatro a q<0,10: `intensidade` (91/47/57/42), `remates`, `ppda` (26/22/70/60) e `faltas` (34/67/17/22).

**Global:** eta² médio 0,410 contra 0,196 de rótulo sorteado (p=0,0002) e contra **0,238 do nulo placebo** — partições feitas cortando qualquer outro indicador real de futebol nos mesmos tamanhos — **p=0,0012**. Esse é o nulo que reprovou as análises anteriores; esta passa.

**O que NÃO separa, e delimita o alcance:** `contra_ataques` (p=0,86), `ca_remates` (0,88), `duelos_pct` (0,98), `bolas_paradas` (0,29), `bp_remates` (0,64), `dist_remate` (0,47), `golos_cabeca` (0,69), `cruz_certos_pct` (0,43). **E a formação não separa em nenhum recorte** (linha de três p=0,82; formações distintas p=0,84; fidelidade ao desenho p=0,83). **O físico é quase silêncio**: 17 de 166 a p<0,05 contra 8,3 esperados, global p=0,072, nenhum sobrevive à correção.

**A ressalva que honra o teste:** restringindo a bateria aos 23 validadores fracamente correlacionados com os dois eixos (\|r\|<0,50 nas 80 linhas), o global cai para **p=0,099**. Quatro dos onze sobreviventes (`passes`, `passes_certos`, `passes_frente`, `passes_frente_pct`) são a família do passe, ou seja, o eixo de rota dito com outras palavras. O que resta genuinamente independente e continua separando: `atq_posicional`, `cantos`, `cruzamentos`, `recuperacoes`, `intensidade`, `faltas`, `duelos_aereos`, `amarelos`, `xg_contra`, `xg_por_remate_contra`.

---

## Os grupos são dinheiro com nome tático? (com o número)

**Posto médio de `tm_valor_total` dentro do ano (1 = elenco mais caro dos 20):**

| Grupo | Posto médio | Postos | Valor médio |
|---|---|---|---|
| **G1 — Dono do jogo (n=5)** | **1,60** | 3º, 1º, 2º, 1º, 1º | R$ 43,7 mi |
| **G2 — Cerco de bola direta (n=3)** | 4,67 | 4º, 6º, 4º | R$ 22,5 mi |
| **G3 — Controlador paciente (n=3)** | 7,33 | 9º, 9º, 4º | R$ 18,2 mi |
| **G4 — Reativo de bola direta (n=5)** | 8,00 | 2º, 5º, 12º, 18º, 3º | R$ 19,3 mi |

**Meia verdade, e é a metade que precisa ser dita primeiro: o G1 é o grupo dos ricos.** Os cinco estavam entre os três elencos mais valiosos do seu ano, sem exceção. Ser dono do jogo na Série B, nesta amostra, é coisa de quem pode. E a ligação mais forte entre bolso e jogo é a pressão: **corr(posto de valor, percentil de PPDA) = −0,69** nos 16 — elenco caro pressiona alto.

**A outra metade, medida e não argumentada:**

- **Formalmente, o dinheiro não distingue os quatro grupos:** eta² do posto de valor = 0,362, **p=0,111** por permutação (Kruskal p=0,033 — no limite; com n=16 isso é sugestão).
- **Uma partição rival feita só com dinheiro** (ordenar os 16 pelo posto de valor e cortar nos mesmos tamanhos 5/3/3/5) explica os mesmos 38 indicadores de fora com eta² **0,182 contra 0,197 do nulo — p=0,658**. Dinheiro sozinho é ruído.
- **Residualizando o dinheiro** (regredir cada coluna de construção no percentil de valor nas 80 linhas, re-ranquear o resíduo dentro do ano e refazer os cortes), o resultado é limpo e cirúrgico: **o corte de ROTA não muda um único time (0 de 16)**; **o corte de TERRITÓRIO muda 6 de 16** (Grêmio 2022, Vitória 2023, Criciúma 2023, Ceará 2024, Athletico-PR 2025, Chapecoense 2025), ARI 0,242.

**Tradução para a diretoria:** dos dois eixos, **um é meio bolso e o outro não é nenhum**. Ocupar o campo e a área do adversário (eixo 1) é, em boa parte, o que o orçamento compra. **Escolher se a bola chega lá pelo chão ou pelo alto (eixo 2) não custa dinheiro** e é onde mora a diferença entre G1 e G2, e entre G3 e G4. Os contraexemplos individuais confirmam: o G3, segundo grupo mais barato (9º, 9º, 4º), foi o de melhor desfecho (1º, 2º, 1º); o G4 junta o 2º e o 3º elenco mais caros de seus anos (Vasco 2022, Remo 2025) com o 18º (Chapecoense 2025) no mesmo perfil de jogo; e o G2 inteiro jogou entre o 4º e o 6º posto de valor, abaixo do G1 e acima do resto.

---

## O que esta tipologia NÃO autoriza a dizer

1. **Não autoriza dizer que existem quatro tipos naturais de time que sobe.** No espaço dos dois eixos a silhueta observada é 0,345 contra 0,217 de uma nuvem gaussiana com a mesma correlação: **p=0,084**. Não há ilhas. Há um **plano contínuo** cortado em quatro quadrantes por duas medianas declaradas. Os grupos são faixas, e os fronteiriços existem porque a fronteira é escolha.
2. **Não autoriza dizer que o G2 é um modelo.** Ele não passa no teste de fora (p=0,160) e a linha que o separa do G1 é a mais frouxa da tipologia (p=0,070). É descrição de três clube-temporada.
3. **Não autoriza nenhuma afirmação de lei sobre G2 e G3 (n=3) nem sobre metades de grupo.** "O controlador paciente ganha o campeonato" é o que aconteceu com Vitória 2023, Mirassol 2024 e Coritiba 2025 — três casos, com `defesa_vs_xg` +0,29, isto é, com a defesa rendendo acima do previsto. Não é receita.
4. **Não autoriza falar de formação.** Nenhuma das três medidas de desenho separa os grupos (p entre 0,82 e 0,84). As linhas de três que aparecem nas médias são um time puxando o grupo: Cruzeiro 2022 no G1 (78,9%) e Chapecoense 2025 no G4 (81,6%).
5. **Não autoriza falar de perfil físico.** 17 de 166 colunas passam no p bruto contra 8,3 esperados ao acaso, nenhuma sobrevive à correção, global p=0,072. **Estes são tipos táticos, não tipos atléticos** — e este achado negativo é a única coisa que as cinco análises anteriores disseram em coro e que eu confirmo.
6. **Não autoriza dizer que isto prevê acesso.** Os 16 são 16 casos de quem subiu; a tipologia descreve **de quantos jeitos se sobe**, não a chance de subir. E metade do sinal do teste de fora é a família do passe re-embalada: com a bateria limpa, p=0,099.
7. **Não autoriza transportar a fronteira de território sem falar de orçamento.** Removido o dinheiro, seis dos dezesseis mudam de lado nesse eixo.

---

## Como isto entra na aba Protótipo

1. **A tela é o plano, não a lista.** Um gráfico único: eixo horizontal **ROTA** (bola pelo chão → bola direta), eixo vertical **TERRITÓRIO** (campo do adversário → campo próprio), as duas medianas desenhadas como cruz, os 16 pontos rotulados com clube, ano e posição final, e a cor por grupo. O contínuo aparece na hora, e os quadrantes são a leitura — é isso que impede a tela de mentir dizendo que existem quatro ilhas.
2. **Fronteira em destaque.** Vitória 2023 e Ceará 2024 entram com marcador de fronteira (estão a 0,8 ponto de percentil da linha) e uma legenda dizendo em que grupo caem se a linha se mover. Bahia 2022, Sport 2024, Santos 2024 e Athletico-PR 2025 entram com marcador leve.
3. **Etiqueta de status por grupo**, sempre visível: **TIPO** para G1, G3 e G4; **DESCRITIVO (n=3, não passou no teste de fora)** para o G2. Um grupo que não passou não pode aparecer na tela com a mesma tipografia de um que passou.
4. **Coluna de dinheiro obrigatória** em cada tabela de grupo (posto dentro do ano), com a frase do G1 escrita por extenso: *os cinco estavam entre os três elencos mais caros da sua Série B*.
5. **Régua para o Santa Cruz.** Como os dois eixos são só cinco colunas em percentil dentro do ano, qualquer clube-temporada da base — inclusive o próprio, inclusive Série C — pode ser plotado no mesmo plano com uma conta. A pergunta que a aba responde vira: *em que quadrante o nosso time está hoje, e a que distância da linha?* — e, pela residualização, a resposta honesta a dar junto: **subir no eixo vertical custa dinheiro; escolher o lado do eixo horizontal, não.**
6. **Rodapé com os três números que sustentam a tela:** p=0,0012 contra o nulo placebo nos 38 indicadores de fora; p=0,099 na bateria limpa; p=0,084 na silhueta. Quem abrir a aba tem de ver o que ela não prova.

**Arquivos de trabalho:** `/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-Santa-Cruz/d04c10c6-3785-4e71-a494-989fd871831f/scratchpad/base.py`, `parts.py`, `val.py`, `mine.py` (construção dos eixos, cortes, bateria de fora, nulo placebo e testes de estabilidade). Dados: `/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz/dados/serieb_clube_temporada.csv` e `serieb_jogos.csv`.