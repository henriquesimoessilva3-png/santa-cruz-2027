# Contexto para análise — a aba Físico refeita com o estudo V2 (23/09/2026)

> Para quem vai analisar no Cowork. Escrito pelo Claude Code que executou o
> `PROMPT_ABA_FISICO.md`. A primeira parte diz **o que foi feito**, com os números. A segunda parte
> é o que interessa revisar: **o que achei incoerente, diferente do esperado ou decidido por mim** —
> cada ponto com o que vi, por que importa e o que eu proporia. Nada de `resultados/` foi alterado.

---

## Parte 1 — O que foi feito

Seis itens do prompt, sete commits, tudo publicado no site
(`henriquesimoessilva3-png.github.io/santa-cruz-2027`).

| commit | item |
|---|---|
| `139bf17` | 1 e 2 — ficha física V2 no lugar do índice geral + matriz reorganizada |
| `6904040` | 3 — forma de ver "Onze físico" |
| `7c2c468` | 4 — raio ⚡ do card pela ficha V2 |
| `35d2feb` | 5 — físico que faltava, pela base do V2 |
| `30ad4c4` | 6 — premissa "Time rápido e explosivo" |
| (último) | `docs/` remontado e publicado |

### 1–2. A ficha e a matriz

- Arquivo novo **`gerar_ficha_fisica.py`** (raiz), que gera **`dados/ficha_fisica_v2.json`**. Ele lê
  `posicao_faixas.csv`, `base_fisico.csv` e o `jogadores.json`, faz a conferência de definição e a
  validação sobe × cai, e grava as duas no próprio JSON.
- A ficha de cada jogador de linha com ≥ 5 jogos rastreados tem:
  - **Piso:** PSV-99 ≥ 27 passa, 26,5–27 no limite, abaixo reprova.
  - **Intensidade:** percentil médio de `spr_n` e `hi_n` na coorte.
  - **Traço da posição:** os indicadores do prompt, com a faixa P25/P50/P75 na linha.
  - **Nota:** 50% traço + 50% intensidade. O piso não entra na nota.
- Na matriz, a ordem ficou: Nota → Piso (selo) → Intensidade → Traço, sempre abertos. Depois vêm
  Velocidade, Uso da velocidade e Corridas sem bola, como antes. No fim fica o bloco recolhido
  **"Detalhe — não rende ponto"**, com Volume, Arranque, Giro, Com/sem bola e o índice geral antigo.
- Os "5 melhores de cada série" agora são escolhidos pela nota.

**Conferência de definição** (mediana dos jogadores da Série B no app contra o V2 na temporada 2026):

| campo do app | coluna do V2 | diferença | caminho |
|---|---|---|---|
| `psv` | psv99 | +0,5% | faixa do V2 direto |
| `spr_n` | sprint_count_p90 | −6,6% | direto |
| `expl` | expl_accel_sprint_p90 | +1,7% | direto |
| `obr_area` | runs_penalty_area_p30tip | **−17,2%** | percentil (mesma medida, outro nível) |
| `obr_per` | runs_dangerous_p30tip | **−23,5%** | percentil |
| `spn_c` | sprint_distance_p30tip | −95,8% | recalculada com sprint_count_p30tip (−3,2%) |
| `spn_s` | sprint_distance_p30otip | −95,2% | recalculada com sprint_count_p30otip (0,0%) |
| `hi_c` | hsr_distance_p30tip | +33,6% | recalculada com hi_distance_p30tip (−3,7%) |

**Validação** — as colunas "Quem SOBE / Quem CAI" da matriz vêm do `raio_ref.json` (clubes 1º–4º
contra 17º–20º, 2022–2025):

| pos | antes, sobe / cai | depois, sobe / cai | resultado |
|---|---|---|---|
| ZD | 48 / 49 | 42 / 42 | **não passa** |
| ZE | 59 / 43 | 54 / 39 | passa |
| LD | 59 / 47 | 53 / 36 | passa |
| LE | 48 / 42 | 42 / 34 | passa |
| VOL | 63 / 46 | 66 / 39 | passa |
| MED | 61 / 49 | 60 / 43 | passa |
| MEI | 46 / 54 | 33 / 43 | **não passa** |
| ED | 52 / 42 | 51 / 41 | passa |
| EE | 56 / 49 | 57 / 45 | passa |
| CA | 56 / 44 | 57 / 36 | passa |

### 3. Onze físico
- Pega os 10 titulares de linha (★) do cenário aberto e mostra as barras em km/h com a linha em 27.
- Mostra a amplitude contra as referências de 2,7 e 4,0, destaca o elo lento e lista quem não tem
  dado físico.
- Cenário 1 **antes** do item 5: amplitude **3,5 km/h**, elo lento Eduardo (MEI, 26,6), **1,3 sem
  ele**. Bateu com o que o prompt previa.

### 4. Raio ⚡
- **Vermelho:** reprova o piso.
- **Amarelo:** no limite do piso, traço abaixo do P25, ou passa o piso sem chegar ao P50.
- **Verde:** passa o piso e o traço está no P50 da referência ou acima.
- **"?" cinza:** sem rastreio ou com menos de 5 jogos. A régua antiga ficou no código, como reserva.
- No Cenário 1, depois do item 5: 6 vermelhos, 124 amarelos, 108 verdes, 58 com "?".

### 5. Físico pela base do V2
- O `preparar_base.py` passou a buscar no `skillcorner_serieb.db` a temporada mais recente com ≥ 5
  jogos, para quem não tem físico. O resultado é marcado em `fis_src`.
- A identidade é conferida em cadeia:
  1. nome sem pontuação;
  2. idade a ±1 ano;
  3. clube de passagem confirmado no elenco do Transfermarkt, com a mesma data de nascimento;
  4. posição compatível;
  5. um candidato só.
- **611 jogadores ganharam físico** e 78 ficaram de fora por dúvida.
- Dos 117 alvos da lista, **34 ganharam** físico, incluindo os 4 titulares: Kauã Diniz e Fabinho
  (América-MG 2025), Derik Lacerda (Cuiabá 2025), Jonathan Costa (Avaí 2025).
- **Ficam 83** na lista `listas/ALVOS_SEM_FISICO.csv`, nenhum deles titular.
- Quem tem `fis_src` fica fora da régua. O card mostra a marca "B25" e a ficha do jogador diz a
  origem do dado.

### 6. Premissa
A premissa m1 passou de "Time físico" para "Time rápido e explosivo", com o texto que o prompt pediu.

---

## Parte 2 — O que achei incoerente, diferente ou decidido por mim

### A. A validação falha em MEI e ZD, e o motivo é de desenho, não de código

**MEI (33 × 43).**
- Na coluna "Quem cai", o meia tem **mais** corrida para a área (5,10 × 4,33) e mais sprint (7,96 ×
  7,41). O prompt define o traço do MEI só pela corrida para a área, então o traço aponta para o lado
  de quem cai.
- Isso **bate com o próprio `B1_perfis.md` §2**: o meia e o extremo dos times que rendem correm
  *menos* (sprint −10/−13%, arrancadas −10/−26%). Ou seja, o prompt pede um traço que o próprio B1
  diz não ser o do MEI.
- O que o meia de quem sobe tem a mais é **arrancada** (1,02 × 0,82).
- **Não troquei o traço**: escolhê-lo depois de ver o resultado da validação é seleção.
- **Proposta:** decidir o traço do MEI pelo B1, antes de olhar a validação. Talvez o MEI não deva
  ter traço físico nenhum, e sim técnico (Bloco 2).

**ZD (42 × 42).**
- Sobe e cai são iguais em sprint (5,25 × 5,23) e em corrida para a área (0,197 × 0,190). Em
  arrancada, quem cai tem até um pouco mais (0,892 × 0,855).
- O +44% em arrancada do V2 existe, mas é contra os **times de referência em rendimento a dinheiro
  igual**.

**O ponto de fundo: a validação compara duas perguntas diferentes.**
- As faixas do V2 vêm dos titulares do **quartil de cima em rendimento acima do dinheiro**.
- As colunas "Quem sobe / cai" do app separam por **posição na tabela** (1º–4º contra 17º–20º), sem
  descontar o dinheiro.
- É normal que as duas discordem nas posições em que o dinheiro compra o traço.
- **Proposta:** validar contra os times de referência do próprio V2 (`time_referencia` em
  `perfis/jogadores.csv`), e não contra o `raio_ref.json`.

### B. "Mediana da Série B" no texto, coorte das Séries A e B na conta

- A premissa nova e o B1 falam em intensidade "acima da **mediana da Série B**".
- A ficha, porém, calcula o percentil na **coorte da aba, que é Séries A + B**. No MEI, por exemplo,
  são 25 da Série A e 17 da B. O percentil 50 dessa coorte não é a mediana da Série B.
- Mantive a coorte da aba porque o prompt pedia "na coorte da posição (a mesma da aba)".
- O texto e a conta hoje não dizem a mesma coisa. **Proposta:** ou a coorte da ficha passa a ser só
  a Série B, ou o texto diz "das Séries A e B".

### C. O Onze físico mudou depois do item 5, e para pior

- Com o físico novo dos 4 titulares, a amplitude do Cenário 1 foi de **3,5 para 4,7 km/h**. O Derik
  Lacerda (31,3) virou o mais rápido; o Eduardo (26,6) continua o elo lento. Sem o Eduardo, a
  amplitude fica em 3,0.
- **4,7 está acima da faixa de quem caiu** (4,0–4,35).
- Pela conclusão 2 do B1, o critério é o piso e não o teto — ter um jogador rápido não ajuda.
  Então o que pesa aqui é o Eduardo, o único titular abaixo de 27 km/h. O Derik alarga a amplitude
  sem mudar isso.
- A conta de amplitude pune ter um jogador muito rápido. Se a regra é o piso, talvez o Onze devesse
  mostrar como número principal "quantos abaixo de 27", e a amplitude só como leitura secundária.
- **Ressalva:** 4 dos 10 valores vêm de outra temporada e de outro clube (`fis_src`), e 3 são de
  jogadores que hoje estão no Japão ou na Série A.

### D. Diferenças de definição entre o app e o V2

- **`obr_area` e `obr_per`** têm o mesmo nome de coluna no SkillCorner dos dois lados, mas o nível
  difere em −17% e −23%. Não investiguei a causa; pode ser janela de temporada ou filtro de
  minutagem do Portal. Contornei por percentil.
  - **Proposta:** descobrir a causa. Se for filtro, a faixa por percentil está certa; se for bug de
    uma das bases, não está.
- **Sprint com e sem bola:** o V2 mede metros; o app mede contagem. Recalculei a faixa com a
  contagem, que bate a −3% e 0%.
- **"Alta velocidade com bola":** o app **não tem** HSR por fase. O mais próximo é `hi_c`, alta
  intensidade (HSR + sprint). O traço de LE, VOL e MED usa esse primo, e não a métrica que o B1
  mediu. Fica declarado no código e no JSON.
- **Nomes:** o prompt fala em `obr_area` e `obr_per`; o `posicao_faixas.csv` chama os mesmos
  indicadores de `runs_area` e `runs_per`. A tradução está no gerador.

### E. Decisões minhas que valem revisão

1. **O que ficou fora do bloco recolhido.** O prompt mandava recolher Volume, Arranque, Giro e
   Com/sem bola, e não disse nada sobre Velocidade, Uso da velocidade e Corridas sem bola. Deixei
   esses três como grupos normais, fechados.
2. **O "degrau" do traço, usado no raio.** Cada indicador ganha 0 (abaixo do P25), 1, 2 ou 3 (acima
   do P75), e o degrau é a média. Verde exige média ≥ 2, amarelo abaixo disso. O prompt dizia
   "traço ≥ P50" sem dizer como juntar vários indicadores.
3. **A nota usa percentil na coorte, e não a posição na faixa.** A faixa dá o selo e o degrau; a
   nota fica numa escala comparável à intensidade.
4. **O verde fica difícil para quem joga fora do Brasil.** A cobertura de corrida para a área é
   completa nas Séries A e B, mas de só 28,8% no geral. Para MEI, ED e EE, que só têm esse traço, o
   jogador de liga sem esse dado nunca chega ao verde: fica amarelo.
5. **A regra de homônimo.** Quando duas entradas do app pedem a mesma pessoa do SkillCorner e têm a
   mesma data de fim de contrato, tratei como a mesma pessoa registrada duas vezes (regra do
   `ARMADILHAS.md`).
   - Caso real: dois "Ronald", volantes de 29 anos, um no Criciúma e outro no Vitória, os dois com
     contrato até 30/06/2028, ficaram com o físico do Criciúma 2026.
   - O mesmo aconteceu com o Jonathan Costa (Guarani e Vila Nova). **Vale olhar a olho.**
6. **A variante de nome primeiro + último.** O SkillCorner guarda "J. Costa" / "Jonathan Aparecido de
   Oliveira da Costa". Sem a variante, o Jonathan Costa não casava. Ela só é segura porque o resto
   da cadeia é exigido.

### F. Coisas do ambiente que mudaram por baixo

- **O Portal Ranking foi atualizado** (`rankings_ago26.json` de 21/09), e o `jogadores.json` estava
  de 10/09. Rodar o `preparar_base.py`, como o prompt pedia, trouxe a atualização: 1.233 jogadores
  saem, 1.402 entram, 30.764 mudam algum campo.
  - **Dois atletas do Cenário 1 perderam o vínculo: Rodrigo Gelado e Luan** (mudaram de clube na
    base). Precisam ser religados no campograma.
- **O `B1.md` e o `desgaste.csv` estão modificados e não commitados** na árvore, por outra sessão.
  O `CLAUDE.md` do V2 diz que os resultados do B1 foram calculados antes do `physical_match` cobrir
  as 5 temporadas e que é preciso "refazer o que usa physical_match".
  - As faixas que usei (`posicao_faixas.csv`) vêm da tabela `physical`, não do `physical_match`, e
    não devem mudar.
  - Se o B1 for refeito, rodar de novo `python3 gerar_ficha_fisica.py` e `publicar_site.py`.
- **Outra sessão commita na mesma árvore ao mesmo tempo.** O commit `e83fcb1` (Estudo V2 vira aba
  própria) entrou no meio dos meus. Não houve conflito, mas vale combinar quem publica o `docs/`.

### G. O que ficou de fora e não foi pedido
- Goleiro: sem ficha (o SkillCorner não rastreia).
- O Estudo Série B antigo (V1) não foi tocado. Ele ainda descreve o físico com a régua antiga.

---

## Onde está cada coisa

- `gerar_ficha_fisica.py` → `dados/ficha_fisica_v2.json`: faixas, caminho de cada indicador,
  validação.
- `static/app.js`: funções `fichaV2`, `fsOnzeFisico`, `raioIconeV2` e a matriz em `fsRender`.
- `preparar_base.py`: função `completar_fisico_v2`.
- `Santa Cruz V2/listas/ALVOS_SEM_FISICO.csv`: os 83 para levantar.
- Para refazer: `python3 preparar_base.py && python3 gerar_ficha_fisica.py && python3 publicar_site.py`.
