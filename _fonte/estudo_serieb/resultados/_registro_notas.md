<!-- As seções abaixo são CURADAS: escritas à mão e preservadas pelo gerador.
     As tabelas de conclusões e de status NÃO ficam aqui — são geradas dos <ID>.json. -->

## Recorte do estudo

**2022 a 2026.** Decisão do dono em 17/09: 2018–2021 fica para uma segunda parte, por não ter dado
físico — e é também a janela em que o `SB_TABELAS` não existe. As conclusões usam as quatro
temporadas fechadas (2022–2025); 2026 entra como teste.

## O Bloco A está fechado

11 das 14 partes do Bloco A estão entregues. Três não rodam com a base atual e estão documentadas:
**A08** (não existe físico por tempo de jogo — o SkillCorner só guarda o período `full_all`),
**A09** (não existe minuto do gol em base nenhuma) e **A10**, que só cobre 2025 porque a tabela
física por jogo tem zero linhas em 2022–2024.

**O que separa quem sobe, depois de 11 partes:** qualidade da chance criada e cedida, distância da
finalização, duelo defensivo (dentro e fora de casa), estabilidade do onze — e o valor do elenco,
que não se escolhe. **O que não separa:** estilo com bola (A05), pressão (A06), bola parada (A04),
físico (A07) e a vantagem de mando (A03). Cinco das nove réguas da Protótipo ficam sem sustentação.

## O que ficou em aberto

- **A01:** 2018–2021 (segunda parte) e cinco jogos que faltam na base de 2022–2026 — Londrina×
  Tombense (2022), Operário-PR×Chapecoense (2024) e três de 2026, listados em `A01_resumo.json`.
  A tabela final não sofre (vem do `SB_TABELAS`); a campanha rodada a rodada de 10 clube-temporadas
  vai marcada com `base_incompleta = 1`.
- **A04:** o gol de bola parada não tem versão jogo a jogo, então não passa pela porta temporal.
  O xG de bola parada só existe em 2025 e 2026.
- **A03:** a conclusão sobre a trave foi retirada (ver A03.md). Falta o recorte por estado do jogo:
  parte do "sofre mais fora" pode ser "passa mais tempo perdendo fora".
- **A06:** não existe recuperação por altura do campo nem contra-ataque sofrido; só coleta resolve.
  A altura da recuperação é a que faria mais falta.
- **A02:** Sobe × Trave fica sem resposta — sem a fronteira sobram 8 contra 7 e o teste só pegaria
  d ≥ 1,57. Falta o recorte por estado do jogo, que não existe em base nenhuma.
- **T02:** o xG entra como descrição, não como critério — falta a porta temporal. 2026 está em curso.
- **T01:** falta a conferência contra fonte independente. A cobertura feita é prova interna
  (Transfermarkt contra Wyscout) e não pega erro que o Transfermarkt cometa sozinho. Os 29 buracos de
  `T01_lacunas.json` são onde procurar primeiro.

## A aba (E00, 17/09)

No ar no Flask local, com as 29 perguntas e o status de cada uma. Arquivos:

| arquivo | o que é |
|---|---|
| `gerar_estudo_serieb_js.py` (raiz) | lê `resultados/*.json` → `static/estudo_serieb_dados.js` |
| `static/estudo_serieb.js` | a aba; autocontida, não encosta no `app.js` nem no `proto.js` |
| `static/estudo_serieb.css` | estilo, escopado em `#pgEstudo` |
| `static/estudo_serieb_dados.js` | **gerado; nunca editar à mão** |

**Rode o gerador toda vez que uma parte terminar** — ele para com erro se um marcador de número
não tiver valor em `numeros`, que é a regra de não digitar número à mão.

Três armadilhas que apareceram ao construir:

- **O prefixo `es-` já é do app.** `.es-barra` existe em `style.css` com `width:70px` e achatou a
  barra do topo. As classes da aba usam **`esb-`**. Antes de criar classe nova, confira colisão.
- **A barra de abas.** O corte do `@media` subiu de 1.190px para **1.300px**. Medido: as 12 abas
  ocupam até 1.152px, mas quem fecha a barra é o aviso da direita, que termina em 1.289px.
- **Tarefa de tela não tem `<ID>.json`.** O status de E00 e R01 vive em `TAREFAS_FEITAS`, dentro do
  gerador.

**Ainda não publicado** em `docs/` — publicar é pedido do dono.

## Bases geradas por este estudo

| arquivo | parte | o que é | n |
|---|---|---|---|
| `A04_indicadores.json` | A04 | lista pré-declarada: 13 indicadores, 3 famílias | 13 |
| `A04_testes.csv` | A04 | inclui os gols de bola parada de verdade, da base por treinador | 78 |
| `A04_ponte_clubes.json` | A04 | nome Sofascore → Wyscout, decidido pelas temporadas | 42 |
| `A03_indicadores.json` | A03 | lista pré-declarada: 12 indicadores, 3 famílias, 3 comparações | 12 |
| `A03_testes.csv` | A03 | inclui Cai × Meio, que não existe no catálogo da Protótipo | 72 |
| `_metodo_fronteira.md` | método | a regra da fronteira, e como foi aplicada errado até 17/09 | — |
| `A06_indicadores.json` | A06 | lista pré-declarada: 8 indicadores, 3 famílias, 3 lacunas da base | 8 |
| `A06_testes.csv` | A06 | mesmo método do A02, via scripts/_metodo.py | 32 |
| `A06_resumo.json` | A06 | porta temporal e PPDA × valor do elenco | — |
| `A02_indicadores.json` | A02 | a lista pré-declarada: 13 indicadores, 3 famílias, 2 emendas datadas | 13 |
| `A02_testes.csv` | A02 | Welch no posto, d de Cohen, IC por bootstrap de clube, BH por família | 104 |
| `A02_resumo.json` | A02 | porta temporal e poder por desenho | — |
| `T02_passagem.csv` | T02 | passagem-temporada: %G4, ppj, xG, posição ao assumir/sair, valor do elenco | 276 |
| `T02_treinador.csv` | T02 | o treinador somando as passagens do ranking | 69 |
| `T01_rodada_treinador.csv` | T01 | de quem é cada rodada (a regra do interino mora aqui) | 6.546 |
| `classificacao_rodada.csv` | A01 | a tabela recalculada a cada rodada, com `dist_g4` e faixa | 3.580 |
| `A01_clube_temporada.csv` | A01 | clube-temporada: faixa, Trave, `dist_g4`, fronteira | 100 |
| `A01_regua.csv` | A01 | os cortes de cada temporada | 5 |
| `base_passagens.csv` | T01 | uma linha por passagem, como o Transfermarkt entrega | 1.160 |
| `base_passagens_temporada.csv` | T01 | uma linha por passagem **e temporada**, com rodadas de Série B | 506 |
| `T01_ponte_clubes.json` | T01 | nome Transfermarkt → nome Wyscout, conferido pelas temporadas | 51 |
| `T01_clubes.json` | T01 | clubes da Série B por temporada, com id | 9 anos |
| `T01_lacunas.json` | T01 | os 29 buracos de cobertura e as 58 passagens sem jogo | — |

**Ponte de clube:** não existia no repositório (a de `_fonte/gerar_raio_ref.py` é de jogador). Quem
precisar cruzar nome de clube entre Transfermarkt e Wyscout usa `T01_ponte_clubes.json`.

**Achado registrado (A04):** ao contrário do que o CLAUDE.md supunha, **existe gol de bola parada
para a Série B** — `dados/bola_parada.json` cobre 2022 a 2026, com escanteio, falta direta, indireta,
lateral e pênalti, pró e contra. A ponte de nome com o Wyscout é decidida pelas temporadas
(`A04_ponte_clubes.json`): pelo nome, "Grêmio Novorizontino" e "Athletico" são ambíguos.

**Armadilha registrada (A03) — a mais cara até agora:** a regra da fronteira é **teste de robustez**,
não um recorte melhor. Firme = firme **nos dois** cortes. O corte sem fronteira é enviesado por
construção: tira de cada grupo os times perto da linha, o que na Sobe tira os fracos e na Trave tira os
fortes (mediana 62 sai, 56,5 fica). Comparar "Sobe sem fronteira" com "Trave sem fronteira" compara um
grupo reforçado com um enfraquecido. Isso derrubou a conclusão da trave em A03 e rebaixou a do A06;
detalhe e tabela em `_metodo_fronteira.md`.

**Armadilha registrada (A02):** o teste da casa roda no **posto dentro da temporada** (percentil),
com **t de Welch** e **d de Cohen**, nunca no valor bruto — e o IC é bootstrap por **clube**, porque
as 80 linhas são 40 clubes. A primeira versão do A02 testou no bruto e estava errada. Além disso, a
lista branca da §6 (ESPECIFICACAO.md:82) proíbe `gp_jogo`, `gc_jogo`, `xg_saldo` e `finalizacao` de
virarem característica — `xg` e `xg_contra` **não** estão nela. E o xG tem confiabilidade medida de
0,30: abaixo de 0,40 a regra manda hachurar.

**Armadilha registrada (A01):** a temporada NÃO sai do ano da data. A Série B de 2020 terminou em
janeiro de 2021; pelo ano da data, 2021 aparecia com 28 times, de 6 a 45 jogos. A temporada sai dos
blocos de meses com jogo separados por meses vazios.

**Armadilha registrada (T01):** no Transfermarkt o `saison_id` das competições brasileiras é o ano **menos
um** — `saison_id=2021` é a temporada 2022. Pedir 2018–2026 perde a temporada de 2018 inteira.

## Base copiada de outro projeto — SkillCorner, 19/09/2026

`_fonte/estudo_serieb/dados_copiados/skillcorner_serieb.db` · **22 MB** · copiado em **19/09/2026**
Script reproduzível: `scripts/_copiar_skillcorner.py`.

**Fonte:** `fut/BOTA/Analytics/**Portal Skillcorner**/dados/skillcorner.db` (329 MB, 112 edições).
Aberta em modo somente-leitura; nada lá foi alterado. O `config.py` do Portal **não** foi copiado:
ele tem as credenciais da API em texto.

> **Correção de ponteiro:** o `CLAUDE.md` diz que o `skillcorner.db` está no **Portal Ranking**.
> Está no **Portal Skillcorner**. O Portal Ranking tem os Excels do Wyscout das 53 ligas.

**O que veio** (só Série B, edições 335/446/773/1061/1399 = 2022 a 2026):

| tabela | linhas | serve a |
|---|---|---|
| `physical` | 3.616 | físico por jogador-temporada — **é o que destrava J04** |
| `physical_match` | 17.075 | físico por jogo — **só 2025 e 2026** |
| `off_ball_runs` | 3.876 | movimentação sem bola |
| `players` | 2.105 | cadastro, com id Wyscout (faltam 3 dos 2.108 ids da fatia) |
| `passes` · `possessions` | 735 · 726 | leitura de tracking |

**O QUE NÃO VEIO, PORQUE NÃO EXISTE.** O `physical_match` da Série B tem **zero linhas em 2022,
2023 e 2024** — na fonte também. O buraco que o estudo registrou não é deste repositório: é do
SkillCorner. **A07-2, A08 e A10 continuam bloqueadas para 2022–2024**, e nenhuma cópia resolve.

| ano | `physical` (agregado) | `physical_match` (por jogo) |
|---|---|---|
| 2022 | 736 | **0** |
| 2023 | 725 | **0** |
| 2024 | 719 | **0** |
| 2025 | 747 | 11.027 (374 jogos) |
| 2026 | 689 | 6.048 (207 jogos) |

**Antes de usar, a armadilha do homônimo.** SkillCorner e Wyscout são bases separadas e o casamento
é por nome: o Pedro do Flamengo já recebeu o físico do Pedro Rodríguez, o Rony do Santos o do Rony
Lopes, o Vitinho do Botafogo o do Vitinho do Fortaleza. A `players` tem id Wyscout, e o Portal
Ranking mantém `config/skillcorner_overrides.json` e `scripts/auditar_matches_sc.py`. **J04 tem de
auditar identidade antes de publicar qualquer número por jogador.**

**Sufixos das métricas:** `_p90` = por 90 min; `_p30tip` = por 30 min **com** bola; `_p30otip` = por
30 min **sem** bola; sem sufixo já é média. **Nunca comparar `_p30tip` com `_p90`** — são réguas
diferentes. Métricas de pico (`psv99`, `peak_velocity`) só existem no jogo inteiro.

## Base copiada de outro projeto — Wyscout, as ligas, 19/09/2026

`_fonte/estudo_serieb/dados_copiados/wyscout/` · **60,4 MB** · copiado em **19/09/2026**
Script reproduzível: `scripts/_copiar_wyscout_ligas.py`. Manifesto: `wyscout/_manifesto.json`.
Fonte: `fut/BOTA/Analytics/Portal Ranking`, só leitura. Nenhuma credencial copiada.

**Período escolhido: `ago26`** — 18.460 jogadores, **65 ligas**. O `CLAUDE.md` do estudo aponta
`abr26`, que é anterior e menor (15.544 / 55 ligas); ele também diz "53 ligas, 14 mil jogadores",
que não corresponde a nenhum período em disco. Mais um ponteiro a corrigir.

| arquivo | tamanho | o que é |
|---|---|---|
| `rankings_ago26.json` | 28,3 MB | a base por liga, com `primary_key`, posição e indicadores |
| `_temporal_movers.json` | 1,7 MB | **7.400 trocas de liga**, com `dqz` — o insumo do J08 |
| `_temporal_photos.json` | 20,7 MB | foto por temporada, 2018 a 2026, `qz` normalizado |
| `_temporal_aging.json` | 9 KB | curvas de envelhecimento; confiabilidade do `qz` = 0,471 |
| `xlsx_ago26/` | 9,7 MB | 66 Excels crus, um por liga, aba `BASE` |

### O J08 não é o que a pergunta supõe — e isso já está medido

O `_temporal_movers.json` responde direto a pergunta do J08, e a resposta é limitante:
**das 321 transferências para a Série B, só duas origens chegam ao piso de 10 casos que o próprio
J08 exige — e as duas são brasileiras.**

| origem → Série B | casos | `dqz` médio |
|---|---|---|
| **Brasil A** | 152 | **+0,640** |
| **Brasil C** | 90 | **−0,587** |
| Portugal A · Colômbia A · Uruguai | 8 cada | — |
| Japão A · Paraguai | 5 cada | — |
| Emirados · Coreia A | 4 cada | — |

Nenhuma liga estrangeira passa de 8 casos. Pela regra do próprio J08 — *"estimar um fator por liga
quando houver casos suficientes (ex.: 10 ou mais); abaixo disso, agrupar ligas de nível parecido e
marcar o fator como fraco"* — **o fator por liga estrangeira não existe e não vai existir**: J08
terá de agrupar por nível e declarar o fator fraco. **J09 herda essa fraqueza**, e a entrega de
alvos no exterior tem de dizer isso em cada nome.

**O que veio de graça:** a escada brasileira está medida. Quem sobe da Série C para a B perde
0,59 de nível; quem desce da A para a B ganha 0,64. É a conta que o Santa Cruz faz de verdade ao
contratar, e não estava em lugar nenhum do estudo.

### Antes de usar (armadilhas do Wyscout)

- **A chave é `primary_key` = `<Player> - <Team within selected timeframe> - <Liga>`.** Use
  `Team within selected timeframe`, nunca `Team`: o segundo é o clube de hoje e quebra o cruzamento.
- **A idade é a de hoje, não a da temporada.** Real na temporada = `idade − (ano_extração − ano_temporada)`.
- **Região é `Birth country`, nunca `Passport country`** (passaporte vem múltiplo e quebra filtro).
- **Homônimos no mesmo time** ganham sufixo (`"Nome (ZAG)"`); tirar o sufixo antes de cruzar.
- **Minutagem baixa polui a régua da liga** — há filtro que roda antes do engine.

## J04 — O titular de quem sobe: físico (19/09/2026, rascunho)


**Zero de 204 testes** Sobe × Meio sobrevivem aos dois cortes de fronteira, em nenhuma das seis
posições de linha. Cinco passaram no BH, nenhum nos dois cortes: o `psv99` do volante (27,92 contra
27,49 km/h) some sem os times de fronteira **e** some ao tirar os clubes de cobertura baixa; o
zagueiro que corre menos só aparece no corte sem fronteira, que é enviesado por construção.

Teto **provável**: a porta temporal não roda. Sem físico por jogo em 2022–2024 não há como dizer se
o físico vem antes do resultado — o buraco é do SkillCorner, não da cópia.

**Entregues:** `J04.md` (a 8ª parte a ter `.md`), `J04.json`, `J04_base.csv`, `J04_indicadores.json`,
`J04_ponte_clubes.json`, `J04_identidade.json`, `J04_testes.csv`, `J04_resumo.json`,
`scripts/J04.py`, `J04_base.py`, `J04_identidade.py`.

### O que a conferência achou, e fica em aberto

A aritmética bate inteira — o conferidor refez do banco para cima e chegou à mesma saída, titular a
titular. Mas achou quatro coisas:

1. **A unidade do BH diverge da especificação.** A §6.3 escreve "uma família = um pilar × uma
   comparação"; J04 rodou família × **setor** × comparação × corte (a mesma prática do J03). Pela
   §6.3, que vale onde diverge, **zero dos 204 passam** — o que torna a conclusão mais forte, não
   mais fraca. **Corrigir a unidade em J03 e J04 é tarefa aberta.**
2. A robustez foi apresentada de um lado só: há uma segunda subamostra que vai na direção contrária.
3. `q = 0,267` saiu truncado como 0,26 numa frase de conclusão.
4. A família `velocidade_maxima` tem só dois indicadores, e os dois medem a mesma coisa (rho 0,916).

### Três coisas que a base contradisse

- **`players.team_name` está vazia** nas 2.105 linhas. A ponte de clube veio do `physical_match`, que
  só existe em 2025–2026; em 2022–2024 o clube vem do Wyscout.
- **Nenhuma linha casou por `wyscout_player_id`.** O id existe do lado SkillCorner (2.079 de 2.105),
  mas **nenhuma base do lado Wyscout neste repositório o carrega**. As 2.982 casaram por nome, pela
  canônica da §1.1. Se algum dia o id entrar no lado Wyscout, ~15 pontos de cobertura voltam.
- **105 goleiros com 900+ min não têm uma única linha física** — o SkillCorner não os rastreia.

## J08 — Conversão de ligas (19/09/2026, rascunho)


Entregues: `J08.md`, `J08.json`, **`fatores_liga.csv`** (o entregável nomeado no CLAUDE.md, 57 KB),
`J08_base.csv`, `J08_indicadores.json`, `J08_testes.csv`, `J08_resumo.json`, `scripts/J08.py`,
`J08_base.py`.

### A cópia que esta parte exigiu

`dados_copiados/wyscout/historico/` · **318 Excels, 69 MB** · copiado em **19/09/2026** ·
script `scripts/_copiar_wyscout_historico.py`. São os períodos 2018–2025 e `jun26` do Portal
Ranking, que o J08 leu para montar o **antes** de cada transferência. **`jun26` leva também o
`_pre_filtro/`**, o export cru: o arquivo do período está filtrado por minutos (Brasil A de `jun26`
tem 292 linhas contra 500 no cru). Sem esta cópia o `J08_base.py` só rodava nesta máquina.
`abr26` e `mai26` não são necessários — o painel temporal usa `jun26` como 2026.

### A família física não é montável, e isso é conclusão

**Não existe dado físico por temporada para liga de origem nenhuma.** O Wyscout não tem tracking; o
`skillcorner_serieb.db` copiado é só Série B; o `phy_score` do `rankings_ago26` é uma foto só, sem
antes. **O fator do J08 é TÉCNICO.** A lista física fica pré-declarada para quando o dado existir.
**J09 tem de marcar o requisito físico como "não verificado" em todo alvo estrangeiro.**

### ⚠️ A conferência: aprovado na aritmética, reprovado no recorte

Ela refez tudo sem reusar o `J08.py`. **A conclusão 1 resiste e fica mais forte. A conclusão 2 não
resiste** — por isso J08-2 saiu como indício e não pode ir para a tela como "escada medida".

**O erro que derruba a escada brasileira: 189 das 737 linhas não são transferência.** O jogador
ficou no **mesmo clube** e foi o **clube** que mudou de divisão. Os números que circularam em 19/09
— Brasil A→B `dqz` +0,640 (n=152) e Brasil C→B −0,587 (n=90) — **estão contaminados por isso** e não
descrevem quem trocou de clube. No corte estrito sobram 238 casos.

Mais cinco, todas graves ou perto disso:
- **O corte de 900 minutos rodou só no DESTINO.** Na origem, 203 das 737 linhas (28%) estão abaixo
  de 900 — e é o percentil de origem que vira o "antes".
- O selo `firme` de 5 linhas do `fatores_liga.csv` vem de uma diferença de erro fora da amostra
  **indistinguível de zero**.
- A generalização sobre viés do sobrevivente **é falsa exatamente nos três fatores de faixa**, que
  são os que cobrem as 38 ligas abaixo do piso — ou seja, os que o J09 mais vai usar.
- `dqz_esperado_idade` **não é** a curva do `_temporal_aging.json`: é recalculada dentro do
  `J08_base.py`. Atribuição de fonte errada.
- Brasil C → Brasil B, volume: fator **+0,07 com IC95 [−1,3; +1,5]** — um nulo — e ainda recebeu
  nível de confiança.

### O que ficou de pé

**Sete ligas estrangeiras** passam do piso de 10 casos, e só porque o destino inclui Brasil A e C
(o J08 autoriza): Argentina A 29, Uruguai 24, Portugal A 16, Colômbia A 16, EUA 15, Portugal B 13,
Chile 10. **Com destino só Série B, a maior é Portugal A com 8.** As outras 38 ligas recebem fator
de faixa, marcado fraco; **18 ligas não têm um caso sequer e ficam sem fator.**

E o método do agrupamento, que o agente escolheu por medida e não por opinião: o `qz` médio da liga
**não serve** (é normalizado dentro da liga, mediana ~0 em todas), e o degrau cru **também não**
(retrata a seleção na origem). O critério usado foi o contrafactual de **quem ficou** — 23.943 pares
de jogadores que permaneceram na mesma liga em temporadas seguidas.

**J08-3 é o achado que sobra e vale:** quem chega guarda **menos da metade** do destaque que tinha.

## A10 — Físico ao longo da temporada (19/09/2026, rascunho)

**Uma temporada só: 2025.** O `physical_match` tem zero linhas em 2022–2024 — na fonte também.
Nada aqui é "quem sobe": é **"quem subiu em 2025"**.


**Sobe × Meio: ZERO indicadores físicos** passam no BH — nos dois níveis, nas 4 medidas
(turno, returno, delta de turno, delta de descanso) e nos dois cortes. A única coisa que separa quem
sobe é **ponto**, que é o placar redescrito (porta D).

**Não há queda de returno para medir:** a Série B inteira perde **74 metros por 90** do 1º para o 2º
turno — 0,8% do que o jogador já corria. A mediana da queda é −100,4 m no Sobe e −100,8 m no Meio.

**O calendário curto não tira corrida: tira ponto.** Em jogos com menos de 4 dias o time faz
**1,10 ponto contra 1,37** nos normais, enquanto a corrida *sobe* — e a corrida a mais some quando
se segura o resultado, porque jogo curto é mais perdido.

**A nuance do A10-3:** o Cai sprinta menos no returno, mas **dentro do jogador ele não desacelera —
sobe** (+20,7 m de alta intensidade contra −8,0 do Meio). O nível cai porque entra outra gente: os
4 clubes do Cai usaram **36,0 atletas distintos** por meia temporada contra 29,8 do Sobe.
**É composição de elenco, não fadiga.**

### Coisas de método que esta parte fez certo, e que as outras devem copiar

- **Família pela §6.3** — um pilar × uma comparação, sem partir por setor. É a correção do defeito
  que a conferência apontou em J03 e J04.
- **A regra de cobertura foi fixada no código ANTES de medir.**
- **O corte de sensibilidade do descanso foi declarado junto**, não depois de ver o resultado.

### Limites que a parte declarou, e são duros

- **No nível clube-temporada o corte de fronteira não roda:** sem os 7 times de fronteira sobram
  **2 clubes no Sobe**, abaixo do piso. Isso cortou 36 dos 136 testes.
- **O `physical_match` não tem nenhuma coluna tip/otip** — a família "com bola ou sem bola" do A07
  **não existe por jogo e cai inteira**. A10 responde volume e intensidade, não com/sem bola.
- **Data UTC contra data local:** 505 de 1.156 clube-jogo diferem em exatamente 1 dia entre as duas
  bases, e 164 dos 746 jogos de 2025 estão na borda de 3–4 dias. Daí o corte de sensibilidade.
- **Dois clubes (Amazonas, Cuiabá) não têm nenhum jogo fora da Série B** em `serieb_jogos.csv`, então
  o descanso deles é, na prática, só de Série B.

### A conferência: aritmética inteira, texto com dois pesos

Refez do banco para cima, em pandas, sem rodar script do estudo — **bate linha a linha** com as
17.046 linhas do `A10_base.csv`. Mas apontou, entre outras:

- **A manchete da pergunta B afirma a metade mais fraca e descarta a mais forte** — o efeito nos
  pontos nunca cruza a régua.
- **Dois pesos na mesma frase:** a queda de 74 m é afirmada pelo p (que trata jogador como
  independente) e as outras medidas são negadas pelo IC de clube.
- **Robustez de um lado só** — o mesmo defeito que a conferência do J04 apontou. O recorte por
  placar produz achados Sobe × Meio que não foram mostrados.

## Correções de número aplicadas (19/09/2026)

**79 números errados corrigidos** nos `<ID>.json`, das 98 que o passo dos marcadores achou.
Detalhe de cada um, com `de_onde`: `_numeros_novos.md` e `_numeros_novos.json`.
**Backup do estado anterior:** `resultados/_backup_pre_correcoes_19_09/` (89 arquivos).

**Como foram aplicadas, com segurança:** o valor atual foi conferido contra o que o agente disse
que estava lá **antes** de trocar. **Zero divergências** — os 79 batiam exatamente. O **tipo** de
cada campo foi preservado (string continua string): o conserto dos 107 números com ponto inglês é
no **gerador**, não aqui, como a própria auditoria apontou.

**Nenhum texto, nenhuma etiqueta de confiança e nenhuma conclusão foram tocados.**

Os maiores: `J07.total_est` 57 → **184** · `J01.n` 3.864 → **3.160** · `J01.altos` 577 → 457 ·
`T01.passagens_temporada` 506 → **492** · `J03.dd_time` **1,59 → 0,805** · `A12.subiram` 6 → **4** ·
`A06.porta_dd` 0,319 → **+0,092**.

**3 não eram erro** (`A05.topo_posse`, `T01.rodadas_total`, `T01.cobertura_sobra` — o valor atual
está certo; num deles o defeito é o *nome* do marcador, não o número).

**15 ficaram seguradas** porque o valor depende de qual texto o dono aprovar — entre elas
`A07.psv_m`, `J07.cob`, `T01.media_efetivos`, `T03.esperado_por_acaso` e os blocos de formato de
A03, A07 e A11. Estão listadas em `_numeros_novos.md`.

**O gerador rodou limpo depois:** 27 perguntas, 22 em rascunho, 5 pendentes; `estudo_serieb_dados.js`
regerado. Sem erro no gerador quer dizer que **todo marcador tem valor**.

> **Nota.** As confianças e as manchetes NÃO vivem aqui: elas são geradas dos `<ID>.json`
> nas tabelas do alto do `_registro.md`. Esta seção guarda só o que não se deriva do dado.
