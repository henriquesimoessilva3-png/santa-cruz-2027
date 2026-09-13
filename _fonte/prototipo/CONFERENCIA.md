# Conferência de 12/09/2026 — o que foi recalculado e o que caiu

> 13 agentes, caminho próprio em tudo. Três blocos: a conferência do `prototipo.json`
> (a fila que tinha ficado no meio), o perfil FÍSICO dos que subiram em 2022-2025, e a
> base técnica de 2018-2021 com o teste cego.
>
> **Veredito curto: os números do `prototipo.json` batem; dois bugs de CÓDIGO não.**

---

## 1. A conferência do `prototipo.json` — três blocos, três "ajustar"

### 1.1 O que bate, e bate forte

O bloco do dinheiro e do catálogo foi recalculado **campo a campo**: 293 linhas × 19 campos
numéricos, **5.567 comparações, zero divergências**. O BH foi conferido contra
`scipy.stats.false_discovery_control` com diferença máxima de q de 2,2e-16.

A etapa 1 inteira bate: quartis 1/1/3/11, top-4 acertando 10 de 16, AUC 0,8281 / 0,7930 /
0,9336, LOSO 0,8076, caliper 14/15/16. A etapa 3 bate: 29 / 8 / 76 / 24 / 18 / 0.

### 1.2 Dois bugs de código, e um deles muda o produto

**(a) Bug de SINAL na etapa 13 — a nota de encaixe.** Em `gerar_prototipo.py::etapa_13`, a
função `pct()` inverte o percentil para os indicadores "menor é melhor" (`100 - p`), mas o
alvo `pct_{cen}` já está em escala bruta. As duas pontas de `1 - abs(p - alvo)/100` vivem em
escalas diferentes. **422 das 586 notas mudam quando se corrige, e a lista publicada de 15
nomes por proposta não sobrevive.** Este é o bug caro: a saída que iria virar recomendação
de contratação está errada.

**(b) Bug de PERMUTAÇÃO na etapa 8 — o nulo da tipologia.** Nas linhas 1265-1266 e 1301-1302,
`rng.permutation(bin_)` está DENTRO da compreensão interna: sorteia uma permutação nova por
coluna em vez de uma por réplica. O padrão correto já existe no próprio arquivo, alguns
blocos acima.

**(c) `porta_motivo` MENTE em 5 linhas.** `fis_zaga_distance_p90`, `fis_zaga_m_per_min`,
`fis_zaga_m_per_min_tip`, `fis_zaga_distance_p30tip` e `fis_lateral_runs_dangerous_p30tip`
recebem porta B com o motivo "falha na porta temporal" — e os cinco têm `rho_1T_2T = null`:
nunca passaram por porta temporal nenhuma. O motivo real é `q_SM = 0,584`. É frase escrita à
mão passando por medida, exatamente o que a regra da casa proíbe.

### 1.3 Armadilha latente que ninguém tinha visto

O portão `ok_temporal` é **vacuosamente verdadeiro para 265 dos 293 indicadores** — só 28 têm
`rho_1T_2T`. Hoje a única Porta A é `dist_remate`, que passou de verdade. Mas
`fis_zaga_distance_p90` chegou a p_liq 0,021 com rho 0,643 e só não virou A porque o q segurou.
Se virasse, sairia na tela com o selo "sobrevive ao dinheiro, se repete e PREVÊ O 2º TURNO"
**sem nunca ter sido testado contra o 2º turno.**

### 1.4 Buracos menores, todos com conserto escrito

- `p_cobertura_x_valor = 0.0` — o valor real é 5,17e-08, arredondado para zero literal.
- **Porta D é código morto:** as 17 colunas de resultado nunca entram na matriz de 293, então
  nenhuma linha recebe o selo D. A coluna declara quatro valores e mostra três.
- O garimpo precifica **229** indicadores e o cabeçalho anuncia **293** — os 64 físicos de
  zaga e lateral ficaram fora por cobertura (0,891 e 0,875). A conclusão se sustenta; o número
  do cabeçalho está descasado.
- A **ESPECIFICACAO está velha em três pontos** conferidos: a linha de `min_estrangeiros` na
  tabela 6.5 (é a única das 17 que não bate), o "40 passam contra quem caiu" (são **24**), e o
  "2,7 controles em média" do caliper 0,15 (são **3,25**).
- `conf` é null em 265 das 293 linhas, e `rho_1T_2T` nas mesmas 265. A regra do teto < 0,40 só
  se aplica a 28 linhas; a tela precisa dizer por quê, não deixar a célula em branco.

---

## 2. O FÍSICO dos que subiram, 2022-2025 — a pergunta do dono

Três analistas em recortes independentes (elenco inteiro · com bola × sem bola · por setor),
depois dois céticos com lentes diferentes (confundimento · multiplicidade e poder).
**332 testes brutos no total.**

### 2.1 A resposta em uma linha

**Quem sobe não corre mais. Corre mais rápido — e quase só contra quem cai.**

`fis_distance_p90`: d=+0,18 contra o meio (p=0,52), +0,32 contra o rebaixado (p=0,41),
+0,04 líquido de dinheiro. É o indicador de **menor** correlação com a posição final de todo
o catálogo físico.

### 2.2 O que sobrevive à refutação

**O achado do MEIO-CAMPO — `fis_meio_expl_accel_sprint_p90`.** Arrancada explosiva que termina
em sprint. Única coisa em todo o material que sobrevive às duas lentes:

| | sobe | meio | cai |
|---|---|---|---|
| arrancadas/90 | 0,85 | 0,72 | 0,64 |
| posto médio no ano | 72,6 | 50,3 | 39,1 |

- separa nas **duas** comparações: d=+0,807 (p=0,0085) e d=+1,388 (p=0,0013)
- sobrevive ao dinheiro nas duas: d líquido +0,632 (p=0,037) e +1,043 (p=0,005)
- limpo de situação de jogo: não é posse, não é placar, não é nº de atletas

**A ZAGA INVERTIDA, como hipótese.** A zaga de quem sobe corre **menos**:
`fis_zaga_distance_p90` d=−0,884 contra o meio (p=0,0119), intacto no líquido (−0,893,
p=0,0112), e limpo de situação (rho com posse = +0,041). Censura de <3 zagueiros derruba
n_sobe de 16 para 12 — a ressalva está registrada e não altera o sinal.

**"O dinheiro come quase tudo"** — a conclusão mais sólida dos três trabalhos juntos.
Recorte do elenco: 9 p brutos < 0,05 viram **1** no líquido. Com/sem bola: 8 viram **0**.
Por setor: 39 viram **10**.

**O ataque separa só de quem CAI** — bloco de oito métricas de alta intensidade com d≈1,0 a
1,1 contra o rebaixado e **nada** contra o meio-tabela. Correr no ataque é piso de
sobrevivência, não teto de acesso.

### 2.3 O que a refutação DERRUBOU

**O PSV-99 do top-5 não sobrevive ao dinheiro — porque o dinheiro era o controle errado.**
A métrica está colada no **número de atletas rastreados** (rho=−0,333, p=0,003), e o nº de
atletas é um separador mais forte que quase todo o físico: `fis_atletas` vai de 20,50 (sobe) a
21,90 (meio) a 25,25 (cai), **d=−1,442, p=0,00084**, rho=+0,486 com a posição final.
Descontando dinheiro **e** nº de atletas: d=+0,47, p=0,158 — não +0,86, p=0,026.

> **Quem sobe usa menos gente.** Esse é um achado por si só, e contamina toda média física
> por atleta. Nenhum dos três controlava por ele. Precisa entrar no catálogo.

O mesmo confundimento derruba o bloco do ataque: 6,88 atacantes rastreados nos que subiram
contra 8,75 nos rebaixados (d=−1,083, p=0,0044).

Também caíram: um analista usou o **nulo proibido** (embaralhar coluna) que o `CONTINUAR.md`
§5 já declarou inválido — com o nulo de rótulo dá empate técnico, não derrota; um "resíduo
duplo (dinheiro + posse)" que era resíduo de posse sozinha (0,74 → 0,53); e três contagens de
família de BH inconsistentes.

### 2.4 O achado que nenhum dos três viu

**Não há sobrevivente individual ao BH, mas há sinal coletivo.** Nos 332 testes brutos há
**56 com p < 0,05 contra mediana 15** sob o nulo válido de permutação de rótulo:
**p do excesso = 0,019**. Storey π₀ = 0,584 — cerca de 40% dos testes carregam efeito real.

E a **hierarquia das famílias** sobrevive por permutação de rótulo (4.000 réplicas):

    meio 0,018  >  elenco 0,030  >  com/sem bola 0,058  >  ataque 0,086  >  lateral 0,197  >  zaga 0,265

O físico separa. Ele só não separa **por um indicador só** — e com 16 contra 48 nunca poderia:
o piso detectável a 80% de poder é d=0,822 (0,867 corrigindo o n efetivo do meio, que são 25
clubes distintos, não 48) e d=1,024 em 16 contra 16.

---

## 3. A base de 2018-2021 e o TESTE CEGO

### 3.1 A base

`preparar_serieb_jogos_2018_2021.py` → `dados/serieb_jogos_2018_2021.csv` (3.038 linhas) e
`dados/serieb_clube_temporada_2018_2021.csv` (80 × 141). **80 de 80 clube-temporada**,
classificação derivada dos jogos batendo com as tabelas do Flashscore nos quatro anos.

Três divergências de ordem em 2019 (Cuiabá, Botafogo-SP, Operário-PR) vêm da partida que
falta no Wyscout — Cuiabá × Figueirense. Cruzeiro 2020 tem punição de pontos (55 medidos,
49 oficiais). Recomendação do conferente: gravar `pos_medida` e `pts_oficial` ao lado, para a
divergência viver no dado e não num stdout que ninguém relê.

**O que o painel novo NÃO tem: nenhuma coluna `tm_*` ou `valor_*`.** Não existe valor de
mercado antes de 2022 e nada foi imputado.

### 3.2 O teste cego — o congelamento foi real

Os dois eixos e os dois cortes foram gravados em `_fonte/prototipo/CONGELADO_2022_2025.md`.
O cético reconstruiu do zero: os cortes 72,5 e 66,25 **são exatamente** as medianas de
TERRITÓRIO e ROTA dos 16 que subiram em 2022-2025. Zero grau de liberdade.

> **Mas uma coisa precisa ficar escrita:** o arquivo congelado nasceu às 13:45:51 e o painel
> de 2018-2021 às 13:41:00 — **quatro minutos e meio antes**. A afirmação "escrito ANTES de
> abrir o painel" é literalmente falsa. Os limiares continuam limpos (são quantidades do bloco
> antigo), mas a frase não se sustenta e não deve ir para a tela.

### 3.3 O que replica

| | 2018-2021 |
|---|---|
| **TERRITÓRIO** separa sobe de meio | d=+0,914, p=0,0030 |
| `entradas_area` | d=+1,259, p=0,00012 (BH q=0,0014) |
| `duelos_pct` | d=+1,085, p=0,0010 |
| `toques_area` | d=+0,930, p=0,0020 |
| `xg_contra` | d=−0,934, p=0,0035 |
| **12 de 12 indicadores mantêm o sinal** | Spearman dos 12 d = 0,657 (p=0,0202) |
| **Bateria de fora** (37 indicadores que não construíram os eixos) | eta² 0,263 vs placebo 0,158, p=0,0238 |

O 12-de-12 é a evidência mais forte, e sobrevive ao ataque de não-independência: o primeiro
componente explica só 32,7% e o número efetivo de testes independentes é **10,72 de 12**.

### 3.4 O que o cético DERRUBOU — e é quase todo o resto

**Nenhuma comparação entre blocos foi medida.** O executor escreveu "TERRITÓRIO ficou mais
forte", "ROTA não replica", "entradas_area mais que dobra", "a família da posse encolhe
inteira" — e o cético rodou o teste de diferença entre os dois d, um a um, nos 12 indicadores:
**nenhum p de diferença abaixo de 0,05** (o menor é 0,082).

- **"ROTA não replica"** cai: z=−0,677, p=0,4986, e o IC95 do d de 18-21 ([−0,326; +0,809])
  **contém** o valor de 22-25 (+0,520). Leitura certa: **a ROTA é um eixo NÃO ESTABELECIDO nos
  dois blocos**, não um eixo que falhou no teste.
- **"TERRITÓRIO mais forte"** cai pela mesma aritmética com o sinal trocado.
- **"A tipologia não sobrevive"** (bateria limpa, p=0,3492) cai porque a bateria limpa **já era
  não-significativa na origem** (p=0,0627 em 2022-2025). Dois não-resultados não fazem uma
  refutação.
- O p do G3 era **unilateral**: 0,0361 vira 0,0551 bilateral.
- Os 16 acessos de 2018-2021 são **13 clubes distintos** (Avaí, Goiás e Coritiba sobem duas
  vezes). Em 2022-2025 são 16 distintos. A assimetria não foi reportada e torna os p do bloco
  antigo otimistas.

### 3.5 Duas coisas sobre regime, e uma contraria o que estava decidido

**2020 NÃO é regime à parte.** O critério pré-declarado não disparou: o ano sem torcida teve
**61,18% dos pontos em casa**, dentro do intervalo dos outros sete anos [58,02; 67,55], e
indistinguível deles (p=0,9273). **O portão fechado não apagou o mando na Série B.**
Isso contraria a suposição registrada no `CONTINUAR.md` §5 e libera 2020 para a mesma conta.

**Mas a quebra de mando é de BLOCO.** 2018-2021 teve 59,28% dos pontos em casa contra 64,49%
em 2022-2025 — +5,21 pontos percentuais, e com o **ano** como unidade (n=4 contra n=4, que é a
unidade certa para uma afirmação sobre blocos) dá t=−3,264, **p=0,0172**.
**Conta em valor bruto sensível a mando não pode juntar os dois blocos.**

### 3.6 A ressalva que vale mais que os achados positivos

Sem valor de mercado em 2018-2021, **todo resultado daquele bloco é BRUTO**. E
`entradas_area` e `toques_area` — os dois que mais brilham lá — são **porta C**: indicadores
que em 2022-2025 **morreram no líquido de dinheiro**. Replicar no bruto não prova ter
sobrevivido ao dinheiro. Isso estava escrito no arquivo congelado antes de qualquer resultado,
e precisa estar na tela ao lado dos dois.

---

## 4. O que fazer com isto, em ordem

1. **Corrigir o bug de sinal da etapa 13** e re-rodar. A lista de livres de hoje está errada.
2. **Corrigir o bug de permutação da etapa 8** (duas linhas).
3. **Corrigir os 5 `porta_motivo`** e vedar a Porta A para indicador sem porta temporal.
4. **Acrescentar `fis_atletas` ao catálogo como controle**, não como indicador: quem sobe usa
   menos gente, e isso contamina toda média física por atleta.
5. Atualizar as três linhas velhas da ESPECIFICACAO (min_estrangeiros, o "40", o "2,7").
6. Re-rodar `gerar_prototipo.py` e depois `gerar_prototipo_js.py`, nesta ordem.

---

## 5. Depois da correção — o que fechou, o que abriu (12/09, fim do dia)

As 23 correções foram aplicadas, o gerador rodou de novo (`prototipo.json` de 1.057 para
**1.527 KB**) e três céticos novos conferiram o resultado contra o JSON de antes.

### 5.1 As duas correções que mudam o produto, confirmadas

**O bug de sinal:** 422 das 586 notas mudaram — **o número exato que a conferência previu.**
Por setor: lateral 133 de 145, meio 147 de 148, ataque 142 de 142, **zaga 0 de 151** — e o
zero da zaga está certo, porque a zaga pontua com um indicador só.

E a correção **não inverteu o problema**: no lateral, o ρ entre o percentil cru de sprint e a
margem era +0,038 (p=0,659) antes e passou a **−0,823 (p=9,4e-36)**, que é a direção que o
alvo exige — quem sobe é rápido, então margem alta tem de vir de tempo baixo. Os "maior é
melhor" não foram estragados no caminho: zaga/psv5 +0,921 → +0,921, ataque/spr_n +0,844 →
+0,895.

**A tipologia virou enumeração exata** e os seis p batem casa a casa com a enumeração
independente do cético: G1 9/4368 = 0,00206 · G2 84/560 = 0,15000 · G3 12/560 = 0,02143 ·
G4 5/4368 = 0,00114 · andar alto 3/56 = 0,05357 · andar baixo 1/56 = 0,01786.
**O p deixou de depender de semente** e o G2 voltou a ser descritivo, concordando com o
TIPOLOGIA.md.

### 5.2 Nenhuma regressão no que já estava conferido

A etapa 2 foi refeita do zero — matriz 80×293 reconstruída dos CSV, posto próprio, `pinv` no
lugar do `lstsq` — em **6.739 comparações campo a campo, zero divergências**. Os selos de
porta continuam 244 `-` · 31 C · 17 B · 1 A, e **nenhum indicador trocou de selo**. A etapa 1
inteira e os seis números da etapa 3 reproduzem.

### 5.3 O controle novo, e o que ele derruba

`fis_atletas` entrou como **controle, não como indicador**: 20,50 (sobe) · 21,90 (meio) ·
25,25 (cai), d_SC −1,525 (p=1,7e-04), ρ +0,486 com a posição final. **E não é dinheiro
disfarçado** — contra o valor do elenco o ρ dos postos é −0,099 (p=0,380), o que quer dizer
que residualizar só em valor deixava o confundidor inteiro em pé.

Com o segundo líquido nas 160 linhas físicas, **o PSV-99 do top-5 morre**: d_liq 0,316
(p=0,255) → **d_liq2 0,244 (p=0,394)**. É a conclusão do laudo, agora medida no pipeline.

### 5.4 Quatro coisas ficaram abertas — e uma delas é o laudo que estava errado

1. **`bateria_limpa.passou` continua `True`, e está certo assim.** O laudo pediu `False` com
   base em p_placebo 0,066. O cético refez: o 23º validador é `duelos_aereos`, que **em posto
   dentro do ano** (a regra da casa, e a que o código usa) tem ρ −0,574 contra a ROTA e é
   corretamente expulso — só em valor bruto ele entra. Logo **22 é a lista certa** e o
   p_placebo medido é 0,035. Gravar `passou: False` por cima de um p de 0,035 seria veredito
   escrito à mão, que é o que esta conferência existe para impedir. **Item fechado contra o
   laudo.**
2. **`erro_padrao.no_piso` publica 151 e o código pisa 272.** O contador só incrementa quando
   o erro é ausente, e os erros *medidos* abaixo de 0,02 são elevados ao piso em silêncio. No
   cenário A_caro, 46% dos 586 carregam a constante declarada e o JSON diz 26%. É a fronteira
   declarado-contra-medido escrita errada no próprio campo que existe para declará-la.
3. **Todo o top-50 da etapa 13 está dentro de um empate.** 88 candidatos saturam a margem
   normalizada em 1,0 e outros 125 em −1,0: **213 dos 586**. A composição publicada do top-50
   é consequência da ordem dentro do empate, não de mérito medido.
4. **O cemitério da etapa 8 mudou sem ter sido declarado.** O garimpo passou a sortear de um
   gerador próprio para não deslocar o stream global — e isso mesmo assim moveu os nulos do
   cemitério (p de 0,006→0,002 e 0,018→0,010 no embaralhado; 0,3513→0,3693 no de mesma
   covariância). A conclusão não muda em nada; a declaração de que não mudaria é que era falsa.
