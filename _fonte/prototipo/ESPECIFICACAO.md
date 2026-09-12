# Especificação — aba Protótipo

> Escrita para quem vai programar. Tudo que está marcado **(conferido)** foi recalculado hoje nos arquivos do repositório, não copiado dos planos. Onde os cinco planos discordaram, a decisão está escrita com o motivo. Onde o dado não existe, está escrito que não existe.
>
> **Ambiente conferido:** `numpy`, `pandas`, `scipy`, `sklearn`, `matplotlib` instalados. **`statsmodels`, `pulp` e `ortools` NÃO estão instalados** — nenhum método da especificação pode depender deles (isso derruba "modelo misto" e "programação inteira" que três planos pediram; as substituições estão nas seções 7 e 9).

---

## 0. O que esta análise pode e o que NÃO pode responder (inclusive treinador)

**Pode responder:**
1. Quais indicadores separam quem subiu de quem ficou no meio, **depois** de descontar o valor do elenco, com correção para comparações múltiplas.
2. Quais desses indicadores **se repetem de um ano para o outro** (característica) e quais são retrato de um ano (episódio).
3. Quais deles, medidos no **1º turno**, ainda preveem o **2º turno** — ou seja, quais são causa plausível e não consequência do resultado.
4. Qual perfil **físico** os clubes que subiram tinham, por setor — e esse é o único pilar que o clube consegue engenheirar comprando jogador (justificativa no item 5 abaixo).
5. Quem, entre os livres de dez/26, chega mais perto desse perfil, por posição e dentro da própria liga.

**NÃO pode responder:**
- **Treinador.** Não há nome de técnico em base nenhuma (`serieb_clube_temporada.csv` 288 colunas, `serieb_jogos.csv` 119 colunas — **conferido: são 119, não 145 como diz o briefing** —, `serieb_tecnico.csv` 118, `serieb_elencos.csv`, `jogadores.json` 78 campos). O único proxy possível é a troca de `Sistema`, e ele não distingue quem sobe de quem fica no meio em nenhuma métrica testada pelos planos (p de 0,23 a 0,88). **A aba mostra o card de treinador vazio, com o motivo e o custo da coleta escritos.** Ver seção 13.
- **"Quais são os modelos de time que sobe".** Não existem grupos. Ver seção 7 — essa é a decisão mais dura da especificação e está provada, não opinada.
- **Causalidade.** Mesmo o teste temporal do 1º→2º turno é associação dentro da mesma temporada, com o mesmo elenco. A aba nunca escreve "faça X e você sobe".
- **Nota de encaixe validada contra desfecho.** Hoje não está validada; a seção 8.6 especifica o backtest que a valida, e ele é obrigatório antes de a aba publicar ranking.

---

## 1. As bases, e o que sai de cada uma

| Arquivo | Tamanho conferido | O que sai daqui | Cobertura / n |
|---|---|---|---|
| `dados/serieb_clube_temporada.csv` | 100 linhas × 288 colunas | Pilar técnico coletivo (31 col.) e pilar físico coletivo (166 col. `fis_*`, sendo 34 de elenco + 33×4 por setor) | 2022-2025 = **80 linhas: 16 sobe / 48 meio / 16 cai** (conferido, 4/12/4 por ano). 2026 tem J=27 e **sai de toda média** |
| `dados/serieb_jogos.csv` | 9.318 × **119** | Recomputo jogo a jogo: split 1º/2º turno, split-half de confiabilidade, proxy de `Sistema` | `Competição == 'Brazil. Serie B'` → 3.570; em 2022-2025 → **3.036 linhas, 76 clube-temporada com 38 jogos e 4 com 37** (conferido). Sem esse filtro entram Série A (1.348), Paulista (550), Copa do Brasil (548) |
| `dados/serieb_tecnico.csv` | 3.866 × 118 | Pilar técnico individual (calibração histórica) e teste de transferência | Clube vem de **`Equipa dentro de um período de tempo seleccionado`** (42 valores distintos) — **`Equipa` tem 530 valores distintos e está errada** (conferido). Minutos em `Minutos jogados:` |
| `dados/serieb_elencos.csv` | 5.098 × 21 | `valor_eur` por temporada; conferência cruzada de contrato | `contrato_ate` só existe em 2026 (99,8%) e é **zero em 2022-2025** — é snapshot, não histórico |
| `dados/jogadores.json` | 40.059 jogadores, período **ago26** | Universo de livres, físico e resumo técnico do candidato | `ct` em 32.039; `ctc`: baixa 19.570, alta 11.273, sem_fonte 8.020, conflito 1.051, contestada 133, manual 12 (conferido) |
| `dados/kpis.json` | 82 KPIs, 18.460 jogadores | KPI técnico do candidato | Chave `"Nome - Clube - Liga"`; registro = `[id_kpi, valor, média_da_coorte, máximo_da_coorte]` (conferido em `preparar_kpis.py`) |
| `dados/raio_ref.json` → `sobecai` | 137 testes físicos sobe×cai por setor, 16 sobrevivem a BH | **Vetor-alvo físico do encaixe** | n é de **ATLETA** (zaga 56×75, lateral 68×90, meio 94×98, ataque 110×140) vindo de 16 e 16 clubes — pseudorreplicação, ver 4.4 |
| `skillcorner.db` (fora do repo) | tabela `physical`, edições 335/446/773/1061 = 2022-25 | Só para regerar o raio e para o teste de persistência física | **2.927 atleta-edição** (conferido) |

**Código que se reaproveita, por nome e linha (conferido):**
- `analisar_serieb.py`: `media_pond()` **linha 390** (piso de 60% de não-nulos já resolvido), `fisico()` **431**, `fisico_por_posicao()` **494**, `chave_nome()` **425**.
- `gerar_raio_serieb.py`: `SC_EDICOES` linha 48, `POSICOES` linha 90, `MIN_RASTREADOS = 300` linha 101, `chave_nome()` 105, `carregar()` 119.

---

### 1.1 Módulo de identidade — a única ponte, e ela já existe

Um dos três juízes apontou que nenhum plano especificou como um registro de uma base vira o registro da outra. **Conferi, e o problema é menor do que ele supõe, mas a regra precisa ser escrita:**

- **Lado do mercado (candidato → KPI):** `jogadores.json` e `kpis.json` são **do mesmo período `ago26` e do mesmo pipeline**. A chave é `f"{j['n']} - {j['t']} - {j['l']}"`. **Taxa de casamento no pool operacional: 599 de 603 = 99,3% (conferido).** Não há problema aqui, e não se deve inventar fuzzy matching.
- **Lado do alvo (perfil do time que subiu → candidato):** **não há casamento de jogador nenhum.** O vetor-alvo físico vem de `raio_ref.json['sobecai']`, cujas chaves (`psv5`, `obr`, `obr_rec`, `spn_s`, `hi_s`, `expl`, `t505_90`, `t_spr`, `t_hsr_cod`…) **são exatamente os campos de `jogadores.json`**. A ponte é por **nome de métrica**, não por nome de pessoa. Isso elimina a classe inteira de erro.
- **Lado histórico (SkillCorner → Wyscout):** já resolvido em `gerar_raio_serieb.py::carregar()`, e a implementação é boa: `min_tot = minutes_played * matches`, casamento por `chave_nome` + janela de idade `-2 ≤ Δ ≤ +3`, e **descarte automático quando o nome aparece com dois clubes ou duas posições no mesmo ano**. É o módulo canônico; reusar, não reescrever.
- **Único ponto que exige código novo:** o backtest do jogador (8.6) precisa casar `serieb_tecnico.csv` consigo mesmo entre anos. Ali o `Jogador` duplica: **o merge ingênuo devolve 4.216 linhas a partir de 3.866 (conferido)** — homônimos e atletas em dois clubes no mesmo ano. Aplicar a mesma regra de descarte do `carregar()`.
- **Regra de tela:** todo funil exibe um contador **"excluídos por falta de casamento"**. Nunca imputar.

---

## 2. Pilar 1 — técnico individual

**Indicadores** (de `serieb_tecnico.csv`, todos com `/90` ou `%`): `Duelos aéreos/90`, `Duelos/90`, `Duelos aéreos ganhos, %`, `Duelos defensivos ganhos, %`, `Duelos ofensivos ganhos, %`, `Ações defensivas com êxito/90`, `Interceções ajust. à posse`, `Cortes de carrinho ajust. à posse`, `Passes certos, %`, `Passes progressivos/90`, `Passes progressivos certos, %`, `Passes para terço final/90`, `Passes chave/90`, `Dribles/90`, `Dribles com sucesso, %`, `Corridas progressivas/90`, `Acelerações/90`, `Toques na área/90`, `Remates/90`, `Golos esperados/90`, `Assistências esperadas/90`, `Comprimento médio de passes, m`, `Faltas/90`.

**Agregação.** Filtro: `Minutos jogados: >= 600` e `posicao_1 != 'GK'`. Média **ponderada por minuto dentro do SETOR** (nunca no elenco inteiro — senão o número mede quantos atacantes o time usou), reusando `media_pond()`. Setores pelo mapa `POSICOES` de `gerar_raio_serieb.py` (CB entra nos dois lados da zaga; LAMF/RAMF vão para EE/ED). Saída: matriz clube-temporada × (indicador × 4 setores).

**Teste de sensibilidade obrigatório (enxerto do Plano 5, a única ideia de método que ninguém mais teve):** rodar as três agregações — ponderada por minuto, mediana do elenco, média dos 5 melhores — e publicar quantos sobreviventes cada uma produz. Se a conclusão muda com a regra de agregação, ela é da regra, não do futebol. O Plano 5 mediu 4 e 3 sobreviventes na ponderada contra 4 e 0 na mediana e 0 e 1 no top-5; reproduzir e publicar.

**Comparação.** Posto percentual dentro do ano sobre o valor já agregado; `sobe×meio` (primária) e `sobe×cai` (secundária); BH dentro de cada família.

**Armadilha.** (a) **Dupla contagem** com o pilar coletivo — `Toques na área/90` agregado e a coluna `toques_area` são a mesma medida por dois caminhos; derrubar um dos dois quando `|rho| > 0,85`. (b) `Valor de mercado` e `Contrato termina` deste arquivo são **snapshot do Wyscout**; valor por temporada é `valor_eur`/`tm_valor_total`, contrato é `ct`+`ctc`+`ctf`. (c) Volume por 90 é, em boa parte, o sistema do clube — é por isso que este pilar **não vira peso de contratação**, ver seção 8.

---

## 3. Pilar 2 — técnico coletivo

**Indicadores** (`serieb_clube_temporada.csv`, cobertura 80/80): `posse`, `ppda`, `intensidade`, `passes`, `passes_pct`, `passe_longo_pct`, `compr_passe`, `passes_frente_pct`, `passes_terco_final`, `passes_progressivos`, `dist_remate`, `remates`, `remates_baliza_pct`, `xg_por_remate`, `toques_area`, `entradas_area`, `atq_posicional`, `contra_ataques`, `cruzamentos`, `cruz_certos_pct`, `bolas_paradas`, `cantos`, `duelos_pct`, `duelos_aereos_pct`, `recuperacoes`, `perdas`, `faltas`, `amarelos`, `xg_contra`, `remates_contra`, `xg_por_remate_contra`.
**Bloco de elenco** (entra, mas com rótulo próprio): `atletas_usados`, `share_11`, `conc_hhi`, `nucleo_300`, `nucleo_1000`, `plantel`, `min_estrangeiros`, `idade_11`, `formacoes`, `formPrincipalPct`.

**Agregação.** Já está pronto no CSV; **não recalcular**. O que se acrescenta é jogo a jogo, a partir de `serieb_jogos.csv` **com o filtro de competição**: (a) média do **1º turno** e do **2º turno** separadas (seção 6.4), (b) desvio-padrão entre jogos, (c) split-half de confiabilidade.

**Confiabilidade (split-half, Spearman-Brown).** Ordenar os jogos por `Data`, índice 0..37, média das rodadas pares contra ímpares, posto dentro do ano, Spearman, corrigir por `2ρ/(1+ρ)`. Valores medidos pelo Plano 1, a reproduzir na tela: Passes 0,78 · Passes certos % 0,78 · Passes frente 0,73 · Passes longos 0,70 · Duelos ganhos % 0,70 · Posse 0,69 · Recuperações 0,66 · Toques na área 0,63 · Cruzamentos 0,52 · Remates 0,50 · Contra-ataques 0,36 · **xG 0,30**. **Regra visual dura: indicador com teto < 0,40 sai da tela hachurado — o efeito nunca pode ser maior que a régua.**

**Lista branca de RESULTADO — mostrar e desqualificar** (enxerto do Plano 2). Estas colunas separam sobe de cai com `d` até 2,95 e **são o placar redescrito**: `gp_jogo`, `gc_jogo`, `golos_sem_penalti`, `golos_tec`, `clean_sheets`, `brancos`, `xg_saldo`, `finalizacao`, `goleadas_pro`, `maxVitorias`, `maxSemVencer`, `pontos_casa`, `pontos_fora`, `pts1t`, `pts2t`, `aprovZ6`, `aprovG6`. Vão para um bloco próprio rotulado **"isto é o placar, não é característica"**, e **nunca** entram em eixo, agrupamento ou score de encaixe.

**Armadilha.** `ppda` é dinheiro disfarçado (cai de `d=-1,23` bruto para `-0,08` líquido de valor) **e** tem persistência 0,129 (conferido). `share_11`/`conc_hhi` sobrevivem ao dinheiro mas têm persistência 0,049 e 0,050 (conferido) — ver a decisão na seção 6.5.

---

## 4. Pilar 3 — físico individual

**Fonte.** `raio_ref.json['sobecai']` já pronto (137 testes, 16 BH). Para persistência e para regerar, `skillcorner.db`.

**4.1 Dois bugs que fazem qualquer implementação devolver lixo em silêncio (conferidos hoje):**
- `physical.minutes_played` é **minuto MÉDIO por partida** (média 59,0; máximo 112,0). O corte `minutes_played >= 450` devolve **exatamente ZERO linhas**. Os cortes válidos são `matches >= 8` (deixa **1.997 de 2.927**) ou `minutes_played * matches >= 300`, que é o que `gerar_raio_serieb.py` já faz.
- `players.posicao` está **vazia em 29.920 de 29.920 linhas**. A posição tem de vir do `posicao_1` do Wyscout pela ponte de nome+idade. Quem confiar nessa coluna ranqueia zagueiro contra ponta em sprint.

**4.2 Cobertura.** ~15 partidas rastreadas por atleta, não 38. **Exibir `sc_n` ao lado de todo número físico; barrar do ranking quem tem `sc_n < 8`.** Goleiro **não é rastreado** — não é zero, é buraco, e a tela diz isso.

**4.3 O achado que sustenta a aba inteira (conferido hoje).** 614 pares atleta t/t+1 com `matches>=8` nos dois anos, posto dentro do ano: **mediana de ρ = 0,853**. Por métrica: `sprint_count_p90` 0,895 · `high_decel_p90` 0,887 · `cod_count_p90` 0,877 · `sprint_distance_p90` 0,876 · `high_accel_p90` 0,861 · `hsr_distance_p90` 0,844 · `distance_p90` e `m_per_min` 0,834 · `psv99` 0,826 · `psv99_top5` 0,722. **Compare com o técnico individual (conferido, 624 pares, ≥900 min nos dois anos, posto dentro de ano+posição): mediana 0,277 para quem MUDOU de clube e 0,473 para quem FICOU.** Detalhe: `Duelos/90` 0,461 (mudou) · `Duelos aéreos/90` 0,442 · `Dribles/90` 0,342 · `Acelerações/90` 0,340 · `Remates/90` 0,300 · `Passes progressivos/90` 0,253 · `Passes recebidos/90` 0,238 · `Toques na área/90` 0,238 · `Golos esperados/90` 0,202 · `Passes chave/90` 0,162.

> **Correção a um dos planos, e ela muda a fórmula:** o Plano 1 reportou 0,129 (mudou) contra 0,450 (ficou) com **52** pares que mudaram. Eu obtive **397** pares que mudaram e mediana 0,277. **A ordenação é robusta (físico ≫ duelo > volume técnico; mudou < ficou), a magnitude não é.** Portanto os ρ **não podem virar multiplicadores literais** na nota de encaixe — entram como **faixa/gate**, ver seção 8.2.

**4.4 Pseudorreplicação, e a correção que roda sem `statsmodels`** (enxerto do Plano 4). Os 137 testes do `sobecai` usam n de **atleta** (zaga 56×75 — conferido) vindo de 16 e 16 **clubes**: quatro zagueiros do mesmo clube dividem treinador, calendário e placar. **Correção obrigatória: agregar por clube-temporada (média ponderada por minuto rastreado) ANTES do teste e refazer com 16×16.** A aba publica **as duas colunas lado a lado** (n de atleta e n de clube) e usa a de clube para decidir. Os 16 sobreviventes de BH vão cair; é para caírem. Custa um `groupby` e não precisa de biblioteca nova.

---

## 5. Pilar 4 — físico coletivo

**Indicadores.** As 166 colunas `fis_*` do CSV — 34 de elenco e 33 replicadas em `fis_zaga_`, `fis_lateral_`, `fis_meio_`, `fis_ataque_` — mais os denominadores `fis_atletas`, `fis_minutos`, `fis_<setor>_atletas`. Cobertura 80/80.

**Como se juntam os atletas do clube naquele ano.** Média ponderada por **minuto rastreado** dos atletas do clube naquela edição, só quem tem `min_tot >= 300`; é o que `fisico()` (linha 431) e `fisico_por_posicao()` (linha 494) já fazem. **Não reconstruir, e não abrir o `skillcorner.db` no pipeline da aba.**

**O que falta e é o ponto do pedido do dono:** a média joga fora a forma da distribuição. Acrescentar, por indicador e setor, **p25, p75 e máximo do elenco**. "Time com um ponta de 32 km/h" e "time com onze de 30 km/h" têm a mesma média e são modelos opostos.

**Regras de exibição (conferidas hoje):** `fis_atletas` mediana 22, mínimo 16; `fis_minutos` mediana 30.217. Clube-temporada com **menos de 3 atletas rastreados no setor: zaga 7 (um deles com 1 atleta), lateral 8 (mínimo 1), meio 3, ataque 0.** **Nenhum número de setor vai à tela com `fis_<setor>_atletas < 3`; entre 3 e 4 vai com marca de baixa confiança.**

**Por que este é o pilar que importa.** O Plano 1 mediu o ICC do posto físico individual por clube-temporada (47 clube-temporada, 572 atletas) e achou entre −0,039 e +0,008, com F ≤ 1,10 em todas as métricas. Traduzindo: **dentro do mesmo ano, o clube quase não explica o físico do atleta** — o agregado coletivo é aritmética de quem foi contratado. Somado ao ρ=0,85 de persistência do atleta (4.3), isto faz do físico **o único dos quatro pilares que o clube engenheira pelo mercado**. Reproduzir o ICC no pipeline (só `scipy`/`numpy`) e publicá-lo na tela.

**Armadilhas.** (a) `fis_m_per_min_otip` e `fis_hi_distance_p90` andam com o PPDA — **correr sem a bola é a face física de pressionar alto, escolha do time**, já derrubado na revisão desta semana; descrevem o plano, não a qualidade do atleta, e **não podem virar critério de compra**. (b) `fis_distance_p90` e `fis_m_per_min` têm ρ≈1 entre si — **contar os dois num índice é contar duas vezes**; escolher um. (c) 2026 tem os `fis_*` preenchidos e vai entrar sem querer se o filtro `ano <= 2025` não estiver em cada função.

---

## 6. A comparação sobe × meio × cai, ano a ano, indicador por indicador

### 6.1 A forma exata da tabela que vai à tela

Uma linha por indicador. Colunas, nesta ordem:

| coluna | conteúdo |
|---|---|
| `indicador` | nome legível |
| `coluna_csv` | nome real da coluna, para auditoria |
| `pilar` | tecnico_ind / tecnico_col / fisico_ind / fisico_col |
| `n` | clube-temporada com valor |
| `conf` | teto split-half (Spearman-Brown); hachura se < 0,40 |
| `m_sobe`, `m_meio`, `m_cai` | média do **valor bruto** (é o que o dono lê) |
| `r_sobe`, `r_meio`, `r_cai` | média do **posto dentro do ano** |
| `d_bruto_SM`, `p_bruto_SM`, `q_SM` | sobe×MEIO, `d` de Cohen, p de Welch, q de Benjamini-Hochberg |
| `d_liq_SM`, `p_liq_SM` | **os mesmos, residualizados no posto de `tm_valor_total`** |
| `d_bruto_SC`, `q_SC` | sobe×cai (secundário) |
| `rho_persist` | ρ de Spearman t→t+1 nos 36 pares |
| `rho_1T_2T` | correlação parcial do indicador no 1º turno com os pontos do 2º turno, dado os pontos do 1º turno (só indicadores jogo a jogo) |
| `porta` | **A / B / C / D** — ver 6.5 |

**Nenhuma linha existe só no bruto.** A coluna líquida é a análise, não um refinamento (enxerto do Plano 2).

### 6.2 A comparação padrão é sobe × MEIO

`sobe × cai` é quase tautológica: 40 dos 79 indicadores sobrevivem a BH ali, porque mede "time bom contra time ruim". `sobe × meio` é a que define característica: só **8** sobrevivem. A aba abre em `sobe × meio`; `sobe × cai` é uma aba secundária.

### 6.3 Correção para comparações múltiplas — três camadas, não uma

1. **Benjamini-Hochberg a 5% dentro de cada família** (uma família = um pilar × uma comparação). Nunca no bolo, nunca por indicador isolado.
2. **Lista de indicadores pré-declarada e versionada no repositório antes de rodar** (`dados/prototipo_indicadores.json`). Varrendo as 258 colunas numéricas passam 104 a 5% onde o acaso previa 12,9; se a lista for escolhida depois de ver o resultado, todo p exibido é decorativo.
3. **Nulo do garimpo** (enxerto do Plano 3, a melhor ideia isolada do conjunto e a única que precifica a *busca* em vez do teste): permutar o indicador dentro do ano mantendo a base de valor intacta, refazer a seleção do melhor entre N, e medir quanto o **melhor de N** ganha de AUC por puro sorteio. Medido pelo Plano 3 em 243 indicadores: **+0,043 em média, +0,059 no p95, +0,078 no máximo**, contra +0,066 do melhor real. **Bloco fixo no topo da tabela**, com os números da rodada corrente.

Texto obrigatório no topo: *"foram feitos N testes por comparação; a 5%, cerca de N/20 passariam por acaso."*

### 6.4 A porta temporal — o teste que nenhum dos cinco planos fez, e que roda hoje

Os cinco planos medem a característica na **mesma temporada** do desfecho, o que torna causa e consequência indistinguíveis. Três planos reconhecem o problema e concluem que o teste é impossível por falta de escalação por rodada. **A conclusão é uma generalização indevida:** falta escalação, então `share_11` e `conc_hhi` realmente não podem ser partidos por turno — mas `serieb_jogos.csv` tem `Data` e todos os indicadores de jogo.

**Rodei o teste (conferido).** 3.036 linhas de Série B em 2022-2025, índice de rodada 0..37 por `(ano, Equipa)`, média das 19 primeiras rodadas contra os pontos somados das 19 últimas, tudo em posto dentro do ano, com correlação parcial dada a pontuação do 1º turno:

| indicador (média do 1º turno) | ρ → pontos do 2º turno | parcial, dado pts do 1º turno |
|---|---|---|
| **Distância média do remate** | **−0,439** (p<0,001) | **−0,289 (p=0,009)** |
| Golos esperados | +0,372 (p=0,001) | +0,248 (p=0,027) |
| Remates à baliza, % | +0,328 (p=0,003) | +0,215 (p=0,056) |
| Posse, % | +0,247 (p=0,027) | +0,227 (p=0,043) |
| Intensidade de jogo | +0,190 (p=0,091) | +0,204 (p=0,070) |
| PPDA | −0,195 (p=0,083) | −0,103 (p=0,363) |
| % de passe longo | −0,130 | −0,152 (p=0,179) |
| Passes certos, % | +0,177 | +0,173 (p=0,125) |
| Duelos ganhos, % | +0,041 | −0,030 (p=0,790) |
| *(referência)* pontos do 1º turno | +0,496 | — |

Leitura: **`dist_remate` é o único indicador de estilo que sobrevive a tudo** — sobrevive ao dinheiro contra o meio (6.5), tem persistência 0,357, e prevê o 2º turno **depois** de descontar como o time já vinha pontuando. PPDA não passa nem aqui. Esta tabela é uma etapa de tela própria e é a resposta à pergunta que o dono vai fazer: *"isso é o que eles fizeram para subir ou é o que aconteceu com quem estava subindo?"*

### 6.5 As quatro portas, e o que cada indicador pode fazer

Cada indicador recebe um selo:

- **Porta A — critério de contratação.** Passa em: `q_SM < 0,10` **e** `p_liq_SM < 0,05` **e** `rho_persist ≥ 0,30` **e** (se for jogo a jogo) parcial do 1º→2º turno com o sinal certo. Só quem tem selo A entra no score de encaixe.
- **Porta B — característica descritiva.** Passa no líquido de valor mas falha na persistência. Vai à tela, com o rótulo *"não se repete de um ano para o outro"*.
- **Porta C — dinheiro.** Passa no bruto e morre no líquido. Vai à tela, com o rótulo *"explicado pelo valor do elenco"*.
- **Porta D — placar.** Lista branca de resultado. Vai à tela, desqualificado.

**Resultados conferidos hoje** (posto dentro do ano, sobe×meio, residualizado no posto de `tm_valor_total`):

| indicador | d bruto | p bruto | **d líquido** | **p líquido** | ρ persist. | porta |
|---|---|---|---|---|---|---|
| `dist_remate` | −1,203 | 0,0000 | **−0,759** | **0,0056** | 0,357 | **A** |
| `faltas` | −0,937 | 0,0017 | **−0,855** | **0,0042** | 0,233 | B |
| `remates_baliza_pct` | +1,060 | 0,0001 | **+0,709** | **0,0064** | 0,097 | B |
| `share_11` | +0,827 | 0,0045 | **+0,687** | **0,0171** | **0,049** | B |
| `xg_por_remate_contra` | −0,805 | 0,0104 | **−0,677** | **0,0292** | 0,214 | B |
| `conc_hhi` | +0,724 | 0,0115 | **+0,597** | **0,0349** | **0,050** | B |
| `min_estrangeiros` | +0,790 | 0,0153 | +0,450 | 0,133 | — | C |
| `toques_area` | +0,587 | 0,0439 | +0,118 | 0,693 | — | C |
| `posse` | +0,521 | 0,0561 | +0,007 | 0,980 | 0,272 | C |
| `entradas_area` | +0,517 | 0,0940 | +0,075 | 0,813 | — | C |
| `fis_psv99_top5` | +0,510 | 0,0804 | +0,316 | 0,255 | 0,377 | C |
| `passe_longo_pct` | −0,476 | 0,1115 | −0,044 | 0,880 | — | C |
| `fis_m_per_min_otip` | +0,430 | 0,1232 | +0,030 | 0,913 | — | C |
| `nucleo_300` | −0,500 | 0,0893 | −0,433 | 0,141 | −0,090 | — |
| `ppda` | −0,152 | 0,5974 | +0,405 | 0,134 | 0,129 | C |
| `atletas_usados` | −0,371 | 0,1868 | −0,307 | 0,276 | 0,154 | — |
| `fis_distance_p90` | +0,178 | 0,5407 | +0,018 | 0,951 | 0,722 | C |

**Decisão onde os planos discordaram.** O Plano 1 concluiu que *"depois de tirar o dinheiro nenhum eixo separa sobe de meio a p<0,05"* e mandou escrever isso na tela. **Isso é falso, e é artefato de ter composto eixos antes de testar** (o eixo `I_estabilidade_11` diluiu `share_11` e `conc_hhi` com `atletas_usados` e `nucleo_300`, que não separam). A tabela acima é a prova. **Regra dura: a unidade de teste é o INDICADOR CRU. Eixo composto serve para desenhar régua na tela, nunca como única unidade de teste; quando os itens de um eixo discordam, publica-se o item.**

**Decisão sobre concentração de minutos.** `share_11` e `conc_hhi` sobrevivem ao dinheiro contra o meio (d≈0,6-0,7, p<0,05) **e** têm persistência 0,049 e 0,050. O Plano 2 fez deles a espinha da aba; **isto é rejeitado**. Um traço com ρ=0,05 não é plano de clube — é o que sobrou de uma temporada em que deu certo: quem ganha não mexe no time, quem perde roda 45 atletas. E o teste que resolveria (recalcular só no 1º turno) **é impossível**: `minutagem.json` guarda minutos por temporada, não por rodada, e `serieb_jogos.csv` não traz escalação. **Ficam na Porta B, com o rótulo "não contrate para isto", e a aba diz que o teste não é possível com o dado atual.**

### 6.6 Independência que não existe

As 80 linhas são **40 clubes** (16 aparecem uma vez, 12 duas, 8 três, 4 quatro). Todo Welch e todo BH aqui assumem independência que não existe. **Correção obrigatória e barata: bootstrap por CLUBE (reamostrar clubes com reposição, 2.000 réplicas) para o intervalo de cada `d`.** O p de Welch fica na tabela, o intervalo do bootstrap fica ao lado.

### 6.7 Poder, para que "não separa" não vire "não existe"

Com 16×16 o menor `d` detectável a 80% de poder e α=5% é **1,02**; sob Bonferroni de 191 testes, 1,79; com 16×64, **0,79**. **Frase fixa na tela:** *"não separa" significa "este desenho não conseguiria ver".*

### 6.8 Truncamento

Dos 36 pares clube-ano consecutivos, **só 6 terminaram em subida**, e metade das 16 promoções vem de clube que não estava na Série B no ano anterior. **Todo desenho preditivo t→t+1 tem n=6 e precisa dizer n=6 na tela.**

---

## 7. Os padrões: método, quantos, o teste que prova, e o plano B

### 7.1 A decisão: ZERO grupos. Não é opinião, é o resultado do nulo certo.

Os planos se dividiram: três disseram "não há grupos" com um nulo inválido, um disse "há dois grupos nos 80 clube-temporada com p=0,000". **Rodei os dois nulos na mesma matriz, mesmos eixos, mesmo k, 200 réplicas cada (conferido hoje):**

| conjunto | k | silhueta obs. | nulo **colunas embaralhadas** | nulo **mesma covariância** |
|---|---|---|---|---|
| 16 que subiram | 2 | 0,230 | mediana 0,106 → **p=0,000** | mediana 0,237 → **p=0,555** |
| 16 que subiram | 3 | 0,156 | 0,103 → p=0,010 | 0,208 → **p=0,955** |
| 16 que subiram | 4 | 0,143 | 0,102 → p=0,045 | 0,197 → **p=0,955** |
| 80 clube-temporada | 2 | 0,197 | 0,072 → **p=0,000** | 0,179 → **p=0,195** |
| 80 clube-temporada | 3 | 0,142 | 0,069 → p=0,000 | 0,138 → **p=0,400** |
| 80 clube-temporada | 4 | 0,137 | 0,069 → p=0,000 | 0,127 → **p=0,210** |

**Embaralhar coluna destrói a correlação entre indicadores; qualquer dado correlacionado bate esse nulo. Ele não testa agrupamento, testa correlação.** O nulo válido é a gaussiana multivariada de **mesma covariância**, e sob ele **não há grupo em lugar nenhum** — nem nos 16, nem nos 80. A proposta de "dois modelos de jogo, 28% contra 7% de taxa de subida" está **rejeitada**: é uma reta cortada ao meio, e os eixos que a definem (posse, ppda, entradas_area, toques_area) são justamente os que morrem sob controle de valor (Porta C na tabela 6.5) — os 28%×7% são, em boa parte, caro contra barato com nome tático.

**Segundo teste, que confirma:** Jaccard de bootstrap de indicadores (300 réplicas, critério de Hennig: ≥0,75 estável, <0,60 dissolve) deu 0,48 a 0,67 em todas as configurações testadas pelos planos. Nenhuma chega a 0,60.

**Por que não aguenta.** 16 pontos em 63 dimensões (ou 16 em 16) dá menos observações que dimensões; k-means acha fronteira em qualquer nuvem convexa. A pergunta certa nunca é *"qual o melhor k"* (essa sempre devolve um número) e sim *"o agrupamento observado é melhor que o de ruído com a mesma covariância"*.

**O que o n=16 aguenta:** comparar a média de UM indicador entre 16 e 48 com correção de família (é assim que a tabela 6.5 existe) e descrever caso a caso, nominalmente. Não aguenta recortar subgrupos.

### 7.2 O que entra no lugar dos grupos

**(a) Nove réguas contínuas** — eixos declarados, exibidos como escala com os 16 promovidos plotados um a um e nomeados, e a faixa interquartil do meio e de quem caiu ao fundo. Eixos (média dos postos dentro do ano, sinal alinhado, depois padronizado):

```
A_posse_construcao  = +posse +passes +passes_pct −passe_longo_pct +atq_posicional −compr_passe
B_pressao_ritmo     = −ppda +intensidade +recuperacoes +fis_m_per_min_otip +fis_hi_distance_p90
C_volume_fisico     = +fis_distance_p90 +fis_running_distance_p90            (NÃO somar fis_m_per_min: ρ≈1 com distance)
D_explosao          = +fis_psv99_top5 +fis_sprint_distance_p90 +fis_sprint_count_p90 +fis_high_accel_p90
E_qualidade_chance  = −dist_remate +xg_por_remate +toques_area +entradas_area
F_solidez           = −xg_contra −remates_contra −xg_por_remate_contra
G_bola_aerea_parada = +duelos_aereos_pct +cruzamentos +bolas_paradas +tm_altura
H_dinheiro          = +tm_valor_total +tm_valor_mediana
I_estabilidade_11   = +share_11 +conc_hhi −atletas_usados −nucleo_300
```

Cada régua exibe **quatro números**: `d` sobe×meio, `q` de BH, `d` líquido de valor e **ρ de persistência**. Réguas com ρ<0,30 aparecem esmaecidas. **E, ao lado de cada eixo, os itens crus que o compõem, com seus próprios p** — porque foi compondo que o Plano 1 perdeu o achado.

**(b) Dois cenários de projeto, rotulados como ESCOLHA do clube e não como achado estatístico:**
- **Cenário Caro** — mediana dos 12 promovidos do top-8 de valor.
- **Cenário Barato** — os **4 que subiram fora do top-8 de valor**, que é o único material honesto para um clube que não vai ser o mais rico da liga (conferido hoje):

| ano | clube | pts | posto de valor | ppda | posse | passe longo % | dist. remate | share_11 |
|---|---|---|---|---|---|---|---|---|
| 2023 | Vitória | 72 | 9º | 10,02 | 52,0% | 11,5% | 20,03 | 60,9 |
| 2023 | Criciúma | 64 | 12º | 10,93 | 48,6% | 13,5% | 19,48 | 71,0 |
| 2024 | Mirassol | 67 | 9º | 13,17 | 51,5% | 10,0% | 18,43 | 75,5 |
| 2025 | Chapecoense | 62 | 18º | 12,45 | 47,4% | 14,1% | 20,36 | 70,6 |

Perfil coerente entre si: **PPDA 10,0-13,2, posse 47-52%, passe longo 10-14%** — pressão baixa, bola direta, transição. **`n=4` impresso no cabeçalho e repetido em cada afirmação derivada**, com a base de comparação (2 sucessos em 60 clube-temporada fora do top-10 de valor).

**(c) Um índice contínuo**, média dos postos dos indicadores de Porta A e B com sinal alinhado, publicado **sempre** ao lado do baseline de dinheiro (seção 11) e sempre com a marca "em amostra" quando for em amostra.

### 7.3 O teste de estabilidade, na forma que vai à tela

Três, todos publicados com o número, não com o adjetivo:
1. **Silhueta contra nulo de mesma covariância** (500 réplicas, semente fixa). Os p da tabela 7.1.
2. **Jaccard de bootstrap de indicadores** (300 réplicas), contra a linha de 0,75 de Hennig.
3. **Persistência ano a ano** dos eixos e dos indicadores crus (36 pares). Valores conferidos hoje: `tm_valor_total` **0,724** · `fis_distance_p90` e `fis_m_per_min` **0,722** · `fis_psv99_top5` 0,377 · `dist_remate` 0,357 · `posse` 0,272 · `fis_sprint_count_p90` 0,235 · `faltas` 0,233 · `intensidade` 0,226 · `xg_por_remate_contra` 0,214 · `atletas_usados` 0,154 · `xg` 0,144 · `ppda` 0,129 · `remates_baliza_pct` 0,097 · `recuperacoes` 0,067 · `conc_hhi` 0,050 · `share_11` 0,049 · `nucleo_300` −0,090.

Título da seção na tela: **"por que esta aba não tem grupos de times"**. O teste negativo é mostrado falhando, não escondido.

### 7.4 Plano B (que é o caso real)

Já está descrito em 7.2 — réguas + dois cenários nominais + índice contínuo com o baseline ao lado. A frase honesta é: **o estilo explica cerca de metade de quem sobe; a outra metade é dinheiro e não está neste dado.** Melhor entregar meio modelo rotulado como meio modelo do que cinco arquétipos inventados.

---

## 8. O encaixe dos livres em dez/26

### 8.1 Universo e funil (conferido hoje, `jogadores.json`, período `ago26`)

```
40.059  jogadores no arquivo
10.984  nas 15 ligas alvo (Brasil A/B/C + 12 sul-americanas)
 4.333  com `ct` entre 2026-11 e 2027-01   (3.950 exatamente em 2026-12)
 2.728  com confiança de contrato: ctc=='alta' OU len(ctf)>=2
   603  POOL OPERACIONAL: + min>=900 + psv presente + rk_ok + id_<=32
```

Por liga no pool: Equador A 109 · Paraguai 93 · Peru 86 · Argentina A 83 · Uruguai 79 · **Brasil B 60** · Chile 52 · Colombia A 29 · Brasil A 12.
Por posição: ZD 87 · MED 82 · LE 74 · LD 71 · ZE 64 · CA 62 · VOL 56 · ED 44 · EE 36 · MEI 25 · **GOL 2**.

**Seis ligas com ZERO cobertura física (conferido, campo `psv`): Brasil C (0 de 808), Argentina B (0 de 1.021), Bolívia (0 de 599), Equador B (0 de 429), Colombia B (0 de 683), Venezuela (0 de 525).** Nessas ligas a nota cairia inteira no bloco técnico, que é o que não viaja — **marcá-las como "sem base para pontuar", nunca emitir nota fraca com cara de nota.**

**Ressalvas obrigatórias na tela:**
- **Dezembro de 2026 não é filtro seletivo** — 3.950 dos 4.333 livres vencem exatamente ali; é o calendário brasileiro. **A seletividade da lista vem da nota, não do contrato.**
- Aceitar fonte única de contrato é aceitar ~14,5 mil registros sem confirmação; o filtro `ctc alta ou 2+ fontes` derruba 4.333 → 2.728, e **essa diferença de 1.605 nomes é exatamente onde um erro de contrato vira uma proposta errada**.
- **Conferência cruzada obrigatória, uma vez e versionada** (enxerto do Plano 3): `serieb_elencos.csv` ano 2026 é a única fonte independente (`contrato_ate` 99,8% preenchido só ali). Concordância de data medida pelos planos: ~51% no geral, **84% quando `ctc=='alta'`, 1 em 168 quando `ctc=='conflito'`**. Publicar o número da rodada corrente.
- Contador **"excluídos por dado ausente"** ao lado de cada degrau do funil.

### 8.2 Como pontua — três notas, nunca uma só

**Princípio:** cada bloco entra com o peso do que **comprovadamente acompanha o atleta quando ele troca de clube** (4.3). Mas — correção ao Plano 1 — **os ρ entram como FAIXA, não como coeficiente**, porque a magnitude não replica (0,277 aqui contra 0,129 lá, com 397 pares contra 52).

| bloco | conteúdo | ρ medido ao trocar de clube | peso |
|---|---|---|---|
| **Nota Física** | `psv5`, `psv99`, `sprint_count`, `sprint_distance`, `hsr`, `high_accel`, `high_decel`, `cod`, `m_per_min`, `expl`, e os tempos `t_spr`, `t_hsr_cod`, `t505_90`, `t505_180` (**menor é melhor**) | **0,72 – 0,90** | **alto** |
| **Nota de Duelo/Corpo** | `Duelos/90`, `Duelos aéreos/90`, `Acelerações/90`, `Dribles/90`, `Duelos aéreos ganhos %` | **0,34 – 0,46** | **médio** |
| **Nota de Estilo Técnico** | volume de passe, progressão, toque na área, xG/90, passes chave | **0,16 – 0,30** | **baixo, com aviso** |

O aviso do terceiro bloco, literal na tela: *"este número mede em boa parte o time anterior do atleta"*. **Nunca somar as três num número único** — as coberturas são diferentes e a soma esconde justamente a informação que custou mais caro para descobrir.

**Só entra no score indicador de Porta A** (6.5). Isso **expulsa `ppda` (ρ=0,129) apesar do `d` alto**, expulsa `share_11` e `conc_hhi` (ρ≈0,05), e expulsa **todas as métricas OTIP e `obr_*` condicionadas à posse** — são escolha tática do clube, não motor do atleta, e o jogador vai reproduzir o OTIP do time novo.

**Fórmula, por bloco `b`, atleta `j`, cenário `c`:**

```
Nota_b(j,c) = Σ_i w_i · (1 − |posto_i(j) − alvo_i(c)|) / Σ_i w_i     (só sobre os i PRESENTES)
```

- `posto_i(j)` = percentil **dentro de (liga, posição)** — nunca valor bruto, nunca percentil entre ligas. Justificativa medida: o `m_por_min` mediano vai de 99,2 (Peru) a 110,0 (Uruguai), 11% que é da liga, não do atleta.
- `alvo_i(c)` = percentil que o cenário pede, vindo de `raio_ref.json['sobecai']['setores'][setor]` **na versão corrigida por clube** (4.4), na forma `(distância ao vetor cai − distância ao vetor sobe)`: o que interessa é estar do lado certo da fronteira, e a fronteira precisa dos dois lados.
- **Distância ao alvo, não "quanto mais melhor"**: se o cenário pede percentil 40 de `m_per_min` e 90 de `psv5`, quem tem 95 nos dois não encaixa melhor, encaixa diferente.
- **Nunca imputar zero nem média.** Indicador ausente sai da conta e a tela mostra o denominador: *"7 de 9 indicadores tinham dado"*.

### 8.3 Por posição

Usar o campo `p` de `jogadores.json` (11 códigos: GOL, ZD, ZE, LD, LE, VOL, MED, MEI, ED, EE, CA), que é o **mesmo vocabulário** do `raio_ref` — ponte direta, sem tradução. `posicao_1` do Wyscout (21 códigos) só na calibração histórica, pelo mapa `POSICOES`. `dados/posicao_overrides.json` para os casos que o mapa erra.

**Goleiro sai da esteira principal por regra, não por olho:** SkillCorner não rastreia goleiro, e **no pool sobram 2 GOL contra 87 ZD (conferido)**. Trilha separada, só técnica: `gk_def`, `gk_evi`, `gk_sai`, `gk_pas`, `cs` e `Golos expectáveis defendidos por 90´`, com o card explicando por quê.

### 8.4 Nota de confiança (multiplica e é visível, nunca entra no ranking)

`min`, `sc_n` (partidas rastreadas), `ctc`, `ctf`, e quantos indicadores do bloco entraram. Um atleta com `sc_n=8` e `ctc='baixa'` não pode aparecer com a mesma tipografia de um com `sc_n=30` e `ctc='alta'`.

### 8.5 Viabilidade é FILTRO, não nota

`id_`, `mv`, `sal`, `emp` (emprestado não fica livre do mesmo jeito). **Elimina, não pontua** — para que ninguém suba no ranking por ser barato.

### 8.6 O backtest da nota — obrigatório antes de publicar ranking

Os cinco planos validaram o modelo de time à exaustão e entregaram a **nota do jogador sem validação nenhuma**. O único número que o clube vai usar para assinar contrato é o único que ninguém testou. **Ele é testável com o que existe:**

1. Em `serieb_tecnico.csv`, identificar quem **chegou** a cada clube em cada ano: jogador presente no clube X no ano t e ausente de X no ano t−1. **Conferido: 2.222 chegadas e 389 permanências em 2023-2025** (aplicando antes a regra de descarte de homônimo de 1.1 — o merge ingênuo infla 3.866 para 4.216 linhas).
2. Pontuar cada chegada **com o dado do ano anterior** (o dado que o clube teria na mesa).
3. Medir o que aconteceu: minutos no ano da chegada, permanência no ano seguinte, posto do clube.
4. Pergunta: **os jogadores que a fórmula teria recomendado jogaram mais que os que ela teria reprovado?**

Sem essa resposta, a aba publica um ranking cuja **ordenação nunca foi conferida**, protegido por uma parede de estatística que é toda sobre outra coisa. O resultado do backtest vai para a tela, positivo ou negativo.

---

## 9. As propostas de elenco

**Forma.** **Núcleo de 16 (XI + 5)**, não plantel de 56 nem grade de 25. Justificativa no dado: quem subiu usou 36,6 atletas contra 45,6 de quem caiu e concentrou 66,6% dos minutos no XI contra 58,2% — **com a ressalva escrita de que isso é Porta B (ρ≈0,05) e portanto uma aposta declarada, não uma característica comprável**. Completar com preenchimento de plantel explicitamente rotulado *"não é para jogar"*.

**Esqueleto tático.** 4-2-3-1 é o sistema principal de 47 dos 80 clube-temporada — e também de quem caiu; **a formação não distingue nada**. O elenco é listado por **função com dupla cobertura**, capaz de jogar dois desenhos (4-2-3-1 e 4-4-2), nunca como um 11 fixo.

**Otimização, e ela roda hoje.** `pulp` e `ortools` **não estão instalados** — programação inteira está fora. Usar **`scipy.optimize.linear_sum_assignment`** (Hungarian) para a alocação ótima jogador×vaga sob a grade de posição, com as restrições aplicadas como pré-filtro e como penalidade na matriz de custo:
- (i) mínimo por posição da grade;
- (ii) teto de folha somando `sal` (faixa; os sem faixa entram com o valor imputado da liga **e marcados**) — **como banda, nunca como número exato**;
- (iii) teto de idade média via `id_`;
- (iv) no máximo 6 atletas da mesma liga estrangeira;
- (v) pelo menos 5 atletas com `min >= 1.800`, porque elenco novo inteiro é risco de integração que o dado não mede.

**Entrega como FAIXA, não como time.** 200 elencos por reamostragem das notas dentro do erro-padrão de cada atleta; por vaga, os nomes que aparecem em **mais de 50%** das soluções (recomendação) e os de **10% a 50%** (alternativas equivalentes dentro do ruído). Um XI único calibrado em n=16 seria precisão falsa.

**Quantas propostas — e o dimensionamento honesto, antes de montar.** Com **60 candidatos completos só da Série B** e 603 no pool sul-americano, a promessa de "mais de uma proposta" só é honesta na versão sul-americana ou aceitando a lista ampliada. **Imprimir o denominador ao lado de cada vaga** (na Série B sobram poucos ED/EE e **zero goleiro com dado completo**). Três propostas, deliberadamente contrastadas:
- **(A) Cenário Caro** — replica o perfil dos 12 promovidos do top-8 de valor, honesto sobre custar o patamar de €24-27 mi de elenco.
- **(B) Cenário Barato / Transição** — calibrado nos 4 de n=4 (PPDA 10-13, posse 47-52%, passe longo 10-14%), com `n=4` impresso.
- **(C) Anti-queda** — montado só para ficar **acima do perfil de quem cai** em cada setor. É a recomendação por eliminação, e é a única que o n sustenta com folga.

**Validação de volta.** Recalcular os eixos do cenário a partir do elenco proposto (média ponderada pelos minutos previstos) e mostrar a distância ao alvo. Se não bate, a tela diz **qual eixo ficou de fora** — o problema é o mercado, não o método.

---

## 10. O que vai na tela, etapa por etapa

O dono pediu a construção explícita, não só o fim. Quinze etapas é obra; **as etapas 0 a 8 são o MVP e entregam o pedido inteiro; 9 a 12 são a segunda leva.**

**ETAPA 0 — O que está sendo medido.** 100 clube-temporada; 80 completos (16/48/16); 2026 em cinza com *"27 de 38 rodadas — não entra em média nenhuma"*. Ao lado: o que 16 permite (comparar médias) e o que não permite (recortar subgrupos). Mais o funil dos candidatos.

**ETAPA 1 — A linha de base do dinheiro, ANTES de qualquer pilar.** Quartil de valor × taxa de subida: **55,0% (11 de 20) no quartil mais caro, 15,8% (3/19), 4,8% (1/21), 5,0% (1/20)** (conferido). O top-4 de valor de cada ano **acerta 10 das 16 subidas** (acaso 3,2) e o **AUC usando só o posto de valor é 0,828** (conferido). Quem lê a aba encontra o dinheiro no primeiro parágrafo, não no rodapé.

**ETAPA 2 — O catálogo dos indicadores, um por linha.** A tabela da seção 6.1, ordenável por qualquer coluna. É aqui que "indicador por indicador" fica auditável, e é aqui que se vê que 40 passam contra quem caiu e 8 contra o meio.

**ETAPA 3 — O aviso do sorteio, em número.** Bloco fixo no topo da Etapa 2 com a contagem de testes, o esperado por acaso, os sobreviventes de BH e o **nulo do garimpo**.

**ETAPA 4 — Confiabilidade de cada medida.** Barra por indicador com o split-half corrigido, de 0,78 (Passes) a 0,30 (xG). Hachura abaixo de 0,40.

**ETAPA 5 — Os quatro pilares, time a time, ano a ano.** Quatro painéis; em cada um, matriz de 16 linhas (clube-ano promovido) × N colunas (indicadores), célula colorida pelo percentil dentro do ano, faixa do meio e de quem caiu ao fundo. Clique abre valor bruto, posto, n de atletas ou de jogos, e o ano. **Setor com menos de 3 atletas sai vazio com o motivo escrito.**

**ETAPA 6 — Isso se repete?** Dispersão do posto em t contra t+1, 36 pares, com o ρ no canto e seletor por indicador. Visível de imediato: `fis_distance_p90` em 0,722 e `ppda` em 0,129 na mesma escala. Legenda: *"característica que não se repete de um ano para o outro é retrato de um ano, não modelo de jogo"*.

**ETAPA 7 — A porta temporal.** A tabela de 6.4: indicador do 1º turno contra pontos do 2º turno, bruto e parcial. Título: *"o que eles fizeram, ou o que aconteceu com quem estava subindo?"*

**ETAPA 8 — O cemitério dos padrões.** A tabela 7.1 com os **dois** nulos lado a lado, mostrando que o nulo embaralhado dá p=0,000 e o de mesma covariância dá p=0,20 a 0,96. Mais o Jaccard contra a linha de 0,75. Título: **"por que esta aba não tem grupos de times"**.

**ETAPA 9 — As nove réguas** + os itens crus de cada eixo com seus próprios p.

**ETAPA 10 — Causa ou consequência.** Lista curta do que separa forte e é o resultado redescrito (`pontos_fora` 25,4×18,3; `maxSemVencer` 4,19×6,62; `share_11` e `conc_hhi` com ρ≈0,05). Rótulo: **"não contrate para isto"**.

**ETAPA 11 — O teste da mala.** Barras pareadas: ρ de cada indicador técnico quando o atleta **muda** de clube (mediana 0,277) contra quando **fica** (0,473); e o físico ao lado (0,853). Frase que a tela sustenta: *"o que você compra num jogador é o físico e o duelo; o volume de passe dele era do time anterior"*.

**ETAPA 12 — O funil dos livres.** Cascata clicável (40.059 → 10.984 → 4.333 → 2.728 → 603), com quem saiu e por quê em cada degrau, e o aviso de que dez/26 é calendário, não oportunidade.

**ETAPA 13 — Nota de encaixe em três pedaços**, com o peso de cada bloco e o `sc_n` ao lado do número físico. Ligas sem cobertura física marcadas como "sem base para pontuar". **E o resultado do backtest (8.6) no cabeçalho da tela.**

**ETAPA 14 — Elenco como faixa**, com o contrafactual do dinheiro ao pé (seção 11).

**ETAPA 15 — Treinador: o que não dá.** Card vazio, com o motivo, os p do proxy de `Sistema`, e a lista do que exigiria coletar.

---

## 11. Os controles obrigatórios

Três, e nenhum é opcional:

1. **Baseline de dinheiro impresso ao lado de TODA proposta**, não em rodapé: **AUC 0,828 e 10 de 16 acertos só com o posto de valor** (conferido). *Qualquer eixo, índice ou elenco que não bata isso fora da amostra é descrição, não recomendação.*
2. **Coluna líquida de valor em toda linha de indicador** (seção 6.1), mais o **pareamento por caliper** como checagem que não impõe linearidade: controles do mesmo ano dentro de ±0,20 de posto de valor cobrem 16/16 das subidas; ±0,15 cobre 15/16 com 2,7 controles em média. **O achado que sobrevive ao pareamento é o que se leva ao dono.** Exibir também `tm_com_valor`, porque a cobertura do valor por temporada varia de 47% a 77% e **não falta ao acaso** (quem não tem valor é jogador obscuro, e time pobre tem mais deles).
3. **Contrafactual da proposta de elenco:** a folha implícita e o valor somado do elenco proposto, colocados no **posto de valor** que ocupariam na Série B, com a taxa histórica de subida daquele quartil escrita em voz alta. Se a proposta cai no segundo quartil, a tela diz que a taxa histórica foi **4,8%**.

Mais dois controles de integridade que rodam a cada execução e **quebram o pipeline se falharem**:
- `assert` de que nenhuma função viu `ano > 2025`;
- `assert` de que `serieb_jogos.csv` foi filtrado por `Competição == 'Brazil. Serie B'` (sem o filtro a mediana de jogos por clube-temporada deixa de ser 38).

---

## 12. O pipeline: que script lê o que, escreve o quê, nesta ordem

Um script principal, um JSON de saída, sem abrir o `skillcorner.db` no caminho quente (o físico coletivo já está no CSV e o individual já está no `raio_ref`).

```
dados/prototipo_indicadores.json      ← ESCRITO À MÃO E VERSIONADO ANTES DE RODAR
                                         (lista pré-declarada + lista branca de resultado
                                          + sinais + famílias)  -- seção 6.3

gerar_prototipo.py                    ← O script único
  lê:
    dados/serieb_clube_temporada.csv     (filtra ano<=2025)
    dados/serieb_jogos.csv               (filtra Competição=='Brazil. Serie B')
    dados/serieb_tecnico.csv             (col. 'Equipa dentro de um período...', min>=600)
    dados/serieb_elencos.csv             (valor_eur; conferência de contrato 2026)
    dados/raio_ref.json                  (bloco sobecai)
    dados/jogadores.json                 (universo de livres, período ago26)
    dados/kpis.json                      (chave "Nome - Clube - Liga")
    dados/posicao_overrides.json
  reusa:
    analisar_serieb.py::media_pond (390), chave_nome (425)
    gerar_raio_serieb.py::POSICOES (90), chave_nome (105)
  faz, nesta ordem:
    1  painel 80 linhas + postos dentro do ano
    2  baseline de valor (AUC LOSO, quartis, top-4) .................. ETAPA 1
    3  split-half de confiabilidade a partir dos jogos ............... ETAPA 4
    4  agregação do técnico individual por setor (3 variantes) ....... seção 2
    5  testes sobe×meio e sobe×cai, bruto e líquido, BH por família .. ETAPA 2
    6  nulo do garimpo (permutação dentro do ano) .................... ETAPA 3
    7  bootstrap por CLUBE para o IC de cada d ....................... seção 6.6
    8  persistência t→t+1 (36 pares) .................................. ETAPA 6
    9  porta temporal 1º→2º turno (parcial dado pts do 1º turno) ..... ETAPA 7
   10  selo de porta A/B/C/D por indicador ........................... seção 6.5
   11  9 eixos + silhueta contra DOIS nulos + Jaccard ................ ETAPA 8/9
   12  correção de pseudorreplicação do sobecai (agregar por clube) .. seção 4.4
   13  funil dos livres + conferência cruzada de contrato ............ ETAPA 12
   14  notas de encaixe (3 blocos, só Porta A, posto por liga+posição) ETAPA 13
   15  elencos via linear_sum_assignment + reamostragem de 200 ....... ETAPA 14
   16  proxy de Sistema (achado negativo) ............................ ETAPA 15
  escreve:
    dados/prototipo.json      (tudo que a tela lê; nenhuma frase escrita à mão)

prototipo_backtest.py                 ← roda separado, resultado entra no prototipo.json
    identifica chegadas em serieb_tecnico.csv, pontua com o dado de t-1,
    mede minutos/permanência em t e t+1                          -- seção 8.6

app.py / templates/                   ← consomem dados/prototipo.json
```

**Regras de implementação:**
- Semente fixa em tudo que sorteia (`rng = np.random.default_rng(7)`).
- Residualização com `np.linalg.lstsq` (não há `statsmodels`); logit com `sklearn.linear_model.LogisticRegression` e validação **deixando um ano inteiro de fora**, com a contagem de **eventos por parâmetro** impressa (com 16 eventos e 2 preditores são 8,0, abaixo da regra prática de 10 — **nunca ajustar com 4 ou 5 eixos**).
- `Sistema` vem como `'4-2-3-1 (70.73%)'` — extrair com regex `^([\d-]+)` e `\(([\d.]+)%\)`; sem isso `nunique()` devolve milhares de sistemas e qualquer contagem de trocas vira lixo.
- Nada de frase escrita à mão no JSON: cada afirmação carrega seu n, seu p líquido e seu ρ.

---

## 13. O que fica de fora, e por quê

1. **Treinador.** Não existe em base nenhuma. O proxy de `Sistema` é publicado como **achado negativo** (nenhuma métrica de estabilidade tática separa sobe de meio; e um clube troca de desenho ~20 vezes em 38 jogos, o que é ajuste de partida, não assinatura de comissão). **A coleta que resolveria:** tabela `(ano, clube, treinador, data_início, data_fim)` para as 100 clube-temporada, ~250 a 400 passagens; a fonte viável é o ogol, e o raspador já existe no repositório (`preparar_ogol.py`, `ogol_clubes.json`). Com ela, três perguntas passam a ser respondíveis: pontos por jogo antes/depois da troca controlado por adversário e mando; se os indicadores que hoje não persistem (`ppda` 0,129, `posse` 0,272) passam a persistir quando se condiciona a permanência do técnico — **se passarem, o modelo de jogo é do treinador e não do clube, e isso muda a política de contratação inteira**; e quais técnicos aparecem em mais de uma promoção. **Nenhum nome de treinador aparece na aba até essa coleta existir.**
2. **Agrupamento de times.** Rejeitado pelo nulo de mesma covariância (7.1).
3. **Eixo composto como unidade de teste.** Rejeitado: foi assim que o achado real se perdeu (6.5).
4. **Concentração de minutos como recomendação.** Fica na Porta B, com "não contrate para isto" — ρ≈0,05 e o teste que a resolveria é impossível (falta escalação por rodada em `minutagem.json`).
5. **Goleiro no pilar físico.** SkillCorner não rastreia. Trilha técnica separada.
6. **Nota para as seis ligas sem cobertura física.** "Sem base para pontuar" em vez de nota fraca.
7. **Métricas OTIP e `obr_*` como critério de compra.** Descrevem o plano do time, não o motor do atleta.
8. **2026 em qualquer média.** 27 de 38 rodadas. Entra só como "temporada em curso", com contador de rodadas ao lado, e serve como teste fora da amostra do baseline de valor.
9. **`Equipa` do Wyscout, `Valor de mercado` do Wyscout, `Contrato termina` do Wyscout, `contrato_ate` de 2022-2025.** Colunas erradas ou snapshot. As certas estão na seção 1.
10. **Ranking comparável entre ligas sem ajuste de nível.** Enquanto não houver fator de conversão declarado, a versão sul-americana é **lista de candidatos**, não ranking comparável com a brasileira.
11. **Extensão para 2018-2021.** Dobraria o n de promovidos de 16 para 32 e é o único ganho real de potência — mas exige conferir antes se o SkillCorner cobre aqueles anos; se não cobrir, quebra dois dos quatro pilares no painel estendido. **Conferir antes de prometer.**