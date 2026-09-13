# CONGELADO — o que vai ser aplicado cego em 2018-2021

Escrito ANTES de abrir `dados/serieb_clube_temporada_2018_2021.csv`.
Tudo aqui vem SÓ de 2022-2025 (80 linhas, 16 que subiram), de
`_fonte/prototipo/TIPOLOGIA.md` e de `dados/prototipo.json` (etapa_2, etapa_8).
Nenhum número deste arquivo pode ser tocado depois de ver o resultado antigo.

## 0. A conta de percentil (a mesma da casa)

```
pct_ano(col) = pandas.Series(col).groupby(ano).rank(pct=True) * 100
```
Posto médio em empate, dentro da temporada, 20 clubes por ano. Máximo = 100.
Fonte: `gerar_prototipo.py` linhas 388-392.

## 1. OS DOIS EIXOS (fórmula fechada)

```
TERRITORIO = mean( pct_ano(posse), pct_ano(entradas_area), pct_ano(toques_area) )
ROTA       = mean( pct_ano(passes_pct), 100 - pct_ano(passe_longo_pct) )
```
Cinco colunas, e só elas. O sinal negativo entra como `100 - p`, não como `-p`
(fonte: `eixo_tip()`, gerar_prototipo.py ~1085).

## 2. OS DOIS CORTES (medianas dos 16 de 2022-2025 — CONSTANTES, não se recalculam)

```
CORTE_TERRITORIO = 72.5
CORTE_ROTA       = 66.25
```

## 3. OS QUATRO GRUPOS

```
G1  T >= 72.5  e  R >= 66.25   DONO DO JOGO (sai jogando e cerca)        TIPO
G2  T >= 72.5  e  R <  66.25   CERCO DE BOLA DIRETA                      DESCRITIVO
G3  T <  72.5  e  R >= 66.25   CONTROLADOR PACIENTE                      TIPO
G4  T <  72.5  e  R <  66.25   REATIVO DE BOLA DIRETA                    TIPO
```

**Proporção de referência nos 16 de 2022-2025: G1=5, G2=3, G3=3, G4=5.**
Eixos médios de referência: G1 (87,3 / 87,0) · G2 (81,7 / 37,5) ·
G3 (57,8 / 88,3) · G4 (45,0 / 38,0).

Teste de proporção pré-declarado: qui-quadrado / multinomial exato dos 16 novos
contra o vetor esperado (5,3,3,5)/16, com p por Monte Carlo de 10.000 réplicas,
`rng = np.random.default_rng(7)`.

## 4. A BATERIA DE FORA (38 indicadores pré-declarados, etapa_8)

passes, passes_certos, xg, remates, remates_baliza, remates_baliza_pct,
dist_remate, ppda, intensidade, compr_passe, duelos_pct, duelos_aereos_pct,
duelos_aereos, cruzamentos, cruz_certos_pct, bolas_paradas, bp_remates, cantos,
cantos_remates, livres, livres_remates, atq_posicional, atq_pos_remates,
contra_ataques, ca_remates, faltas, amarelos, recuperacoes, perdas,
passes_frente_pct, passes_frente, passes_terco_final, passes_progressivos,
xg_contra, remates_contra, xg_por_remate, xg_por_remate_contra, golos_cabeca.

Referência 2022-2025: eta² médio observado **0,410**; nulo de rótulo sorteado
0,196 (p=0,0002); nulo placebo 0,238 (p=0,0012).
Teste em 2018-2021: mesmo eta², mesmo nulo placebo (ordenar os 16 por qualquer
coluna real do painel e cortar nos mesmos tamanhos observados), 200 réplicas.

## 5. OS INDICADORES DE PORTA (etapa_2, campo `porta`)

Comparação primária **sobe × meio**; secundária sobe × cai.
`d` = Cohen's d sobre o **percentil dentro do ano**; `p` = Welch.
Só entram os que existem no painel 2018-2021 (técnicos coletivos).
Os 12 congelados, com o valor de 2022-2025 que eles têm de replicar:

| porta | indicador | sinal | d_SM 22-25 | p_SM 22-25 | d_SC 22-25 | p_SC 22-25 |
|---|---|---|---|---|---|---|
| A | dist_remate | -1 | -1,203 | 0,00003 | -2,022 | 0,00001 |
| B | remates_baliza_pct | +1 | +1,060 | 0,00013 | +1,791 | 0,00003 |
| B | duelos_pct | +1 | +0,643 | 0,02080 | +0,539 | 0,13861 |
| B | faltas | -1 | -0,937 | 0,00169 | -0,739 | 0,04530 |
| B | xg_por_remate_contra | -1 | -0,805 | 0,01038 | -1,249 | 0,00137 |
| C | posse | +1 | +0,521 | 0,05612 | +1,005 | 0,00798 |
| C | passes | +1 | +0,520 | 0,08018 | +0,867 | 0,02032 |
| C | passes_pct | +1 | +0,526 | 0,07065 | +0,726 | 0,04901 |
| C | xg_por_remate | +1 | +0,584 | 0,06032 | +1,364 | 0,00057 |
| C | toques_area | +1 | +0,587 | 0,04385 | +1,319 | 0,00083 |
| C | entradas_area | +1 | +0,517 | 0,09396 | +0,991 | 0,00896 |
| C | xg_contra | -1 | -0,623 | 0,04878 | -1,531 | 0,00017 |

Critério de replicação declarado agora: **sinal igual e p<0,05** = replica;
sinal igual e 0,05<=p<0,20 = direção mantida sem potência; sinal invertido
(qualquer p) = NÃO replica. BH dentro da família técnico-coletiva (12 testes).

**53 indicadores de porta A/B/C ficam de fora por falta de coluna**: os físicos
`fis_*` (não existem antes de 2022, confirmado na API SkillCorner), os técnicos
individuais `ti_*`, e os de elenco (`share_11`, `conc_hhi`, `nucleo_300`,
`nucleo_1000`, `min_estrangeiros`). Ausência com motivo, não imputação.

## 6. O QUE NÃO DÁ PARA TESTAR — DECLARADO ANTES

`tm_valor_total` **não existe** no painel 2018-2021 (conferido na lista de
colunas: 141 colunas, nenhuma `tm_*` nem `valor_*`). Logo:
- o **AUC do posto de valor de mercado NÃO pode ser testado**;
- a coluna **líquida de valor** (`d_liq`, `p_liq`) não pode ser recalculada —
  em 2018-2021 só existe o **bruto**. Uma porta C de 2022-2025 que replique em
  2018-2021 replica no bruto, e isso NÃO é prova de que sobreviveria ao
  dinheiro. Está dito aqui, antes de ver o resultado.
Nada será imputado.

## 7. O TESTE DE REGIME (antes de juntar os oito anos)

Vantagem de mando por ano, 2018-2026, nos jogos de Série B:
(a) % de pontos conquistados em casa sobre o total; (b) diferença de gols
casa − fora por jogo; (c) % de vitórias do mandante.
Critério declarado: se 2020 ficar fora do intervalo formado pelos outros sete
anos em (a) e (c), 2020 é **regime diferente** e todo teste principal roda duas
vezes — com e sem 2020.

## 8. SEMENTE

`rng = np.random.default_rng(7)` em tudo que sorteia. 200 réplicas na bateria,
10.000 no teste de proporção.
