# Sessão de 21/09/2026, noite — a fila inteira, e as cinco perguntas que nasceram lendo a tela

> Escrito para quem abrir sem ter visto nada. Estado primeiro, o que entrou depois, o que aprender
> no fim. Continua o `_fonte/CONTEXTO_sessao_21_09.md`, que deixou a fila de cinco itens escrita.
> Subordinado ao `_fonte/estudo_serieb/CLAUDE.md` (método).
>
> **O padrão desta sessão, e o mais importante para a próxima:** a fila de cinco itens saiu
> inteira, mas **as melhores perguntas do dia vieram do dono lendo a página publicada e achando-a
> vaga ou errada**. Cinco das oito partes novas nasceram assim. Vale reservar tempo para essa
> leitura em vez de tratá-la como interrupção.

---

## 1. O estado

| | |
|---|---|
| perguntas | **35 de 35** respondidas e validadas (eram 27) |
| conclusões | **98** — 1 firme, 31 prováveis, 66 indícios |
| portão | **35 de 35 aceitas** |
| página de decisões | **18 decisões** (eram 10) |
| partes novas | **A15, A16, A17, A18, A19, A20, J10, J11** |
| lista por posição | 65 na Série B · 120 no exterior |
| commits | 14, todos publicados |

`main` limpa e no ar. O estudo deixou de estar "fechado" em 21/09 e não voltou a estar.

## 2. As oito partes novas, uma linha cada

| parte | o que perguntou | o que achou |
|---|---|---|
| **A15** | o que o time faz NUM JOGO que rende ponto | pontua cedendo chute **pior**, não menos chute; e descer ao jogo mede melhor sem provar mais |
| **A16** | qual traço dá mais ponto por real | a dinheiro igual, solidez vale 8,9 pontos contra 7,0 do mesmo salto de elenco (€ 9,9 mi) |
| **A17** | que jeito de jogar PRODUZ a chance boa | 1 de 34 pares sobrevive, e o que passa na anterioridade é outro. Não há alavanca de estilo |
| **A18** | a dividida no chão mede o time ou o adversário | mede o adversário no jogo (soma 100 com ele) e o time no ano. Tensão resolvida |
| **A19** | a formação muda o resultado | nenhuma das seis. E o corte de robustez que eu declarei escolhia pelo desfecho |
| **A20** | é o titular médio ou ter um ou dois muito acima | o nível é o que menos separa; a desigualdade é o que mais, e falha só por falta de tamanho |
| **J10** | corrida para a área vira requisito | 0 de 18. Passou a família de CONTROLE, e só no volante |
| **J11** | correr sem a bola contra correr com a bola | 0 de 66. O candidato é o extremo, e some no corte cheio |

## 3. O que veio da leitura da tela

1. **"Qual modelo de jogo? Está muito vago"** → a **D13** reescrita com o que o time FAZ, na unidade
   do jogo (20,8 m para 20,0 m na finalização vale 8,0 pontos; 1,09 para 0,86 de gol esperado
   sofrido em casa vale 7,1; e assim por diante) → e daí nasceu a **A17**.
2. **"Que forma de jogar chega nisso?"** → a **A17** inteira.
3. **"Quais treinadores?"** → a **D10**, que era pior que vaga: mandava escolher pelo PISO das
   passagens, e o próprio T04-1 mede que esse critério põe em 3º quem nunca subiu. Reescrita, e
   agora com os nomes e o que eles são.
4. **"Resolve a tensão da dividida"**, com a sugestão de cruzar contra o adversário → a **A18**.
   A sugestão era o cruzamento certo.
5. **"Por que não tem zagueiro na lista de estrangeiros?"** → um **defeito**, não falta de dado.
   Ver a seção 5.

## 4. O que mudou no método da casa

- **`scripts/_metodo_jogo.py`** — o método na unidade clube-jogo. Importa o `_metodo.py` e troca só
  de onde sai o p (bootstrap de CLUBE em vez do t de linha, porque 3.036 linhas são 40 clubes).
  Ganhou depois o `correlacionar_por_clube`, para pergunta de correlação em vez de comparação.
- **A porta com o alvo trocado.** A §6.4 pergunta se o indicador vem antes dos PONTOS. A A17
  precisou perguntar se vem antes do EIXO; a A16, a §6.4 **com o dinheiro no controle**. As duas
  usam a `_porta_temporal.parcial`, conferida contra a original (diferença 0,0e+00).
- **`J06_ordenacao.json`** — a regra da lista por posição virou dado versionado.
- As três listas de partes (`_portao.py`, `gerar_registro.py`, ROTEIRO do
  `gerar_estudo_serieb_js.py`) são a **mesma lista em três lugares**. Parte fora de uma delas fica
  publicada sem conferência — foi o que aconteceu com J05, J06 e J09 até 20/09.

## 5. Os defeitos achados e consertados

- **Marcador com sinal `+` virava 0 no gráfico**, em silêncio: o `num()` do
  `estudo_serieb_grafico.js` só aceitava `-`. Número errado e plausível, que é o pior tipo.
- **Duas unidades numa régua só** no J10-2 (3,23 corridas e 12,4 metros, régua até 13,9): a
  diferença real aparecia como nada.
- **Um número que parecia grande e era artefato** (A18): variância por par time × adversário com
  duas linhas por célula. Ficou publicado com a inflação à vista.
- **O zagueiro que sumia da lista de fora.** O `exterior()` procurava a coluna do `J09_base` pelo
  NOME do indicador e o arquivo guarda pelo ID, então só o FÍSICO era encontrado — e a ficha do
  zagueiro tem um físico só. Efeitos: nenhum zagueiro publicado (2.317 linhas, 191 com minutagem
  regular), o resto julgado só pelo físico (que é o dado RARO lá fora: 9.833 das 11.023 linhas têm
  o técnico e 2.892 têm o psv5), e a tela anunciando o oposto do que acontecia. Consertado com o
  `NOME2ID` que o próprio J09 já declarava: 966 candidatos em vez de 625, 4 a 6 critérios por
  posição em vez de 2, e a ordem de fora passou a ser a mesma da Série B.

**O portão pagou seis vezes nesta sessão:** os quatro acima mais um quase-achado não citado (A17),
uma célula que sairia com dois q (A18), um teto acima do permitido (A19) e uma conclusão que não
nomeava o indicador que a sustenta (J11).

## 6. As quatro regras de leitura que a sessão produziu

Estão no `CLAUDE.md` e, desde 21/09, **na aba Estudo** — seção "Como ler um número daqui", gerada por `scripts/gerar_regras.py` com o número de cada uma preso à parte de origem.

1. **Peça a conta DENTRO do time antes de aceitar a conta entre times.** Cruzar mais anda +0,33
   com finalizar de perto entre times e +0,02 dentro do mesmo time, e +0,26 com o dinheiro. Se o
   número só existe comparando clubes diferentes, ele descreve que clube é aquele.
2. **Recorte cujo critério pode ser consequência do desfecho não é robustez, é seleção.** Medido:
   filtrar "só os jogos em que o time manteve o plano" dá 1,75 ponto contra 0,86.
3. **Falhar o segundo corte porque o efeito some ≠ falhar porque o corte não tem tamanho.** J11 e
   A20 falharam pelo mesmo critério por motivos opostos; o IC95 e o d mínimo são o que os separa.
4. **Decisão com nome de régua é decisão vaga; decisão que contradiz a parte que cita é pior.**

## 7. A fila da próxima sessão

### 7.1 Subir o aprendizado para o app — FEITO em 21/09
As quatro regras da seção 6 viraram a seção **"Como ler um número daqui"**
(`scripts/gerar_regras.py` → `_regras.json`), e o que oito partes sabem de físico (A07, A10, A11,
A20, J04, J05, J10, J11) virou **"O que sabemos do físico"** (`scripts/gerar_fisico.py` →
`_fisico.json`), em oito blocos que terminam na ficha de contratação, mais três limites. As duas
seguem o contrato da página de decisões: texto da casa, número vindo dos `<ID>_numeros.json`, e o
gerador FALHA se um marcador sumir. O resolvedor de marcador saiu do `gerar_decisoes.py` para o
`scripts/_texto.py`, usado pelos três (saída das decisões conferida idêntica antes e depois).

### 7.2 O que analisar, em ordem de valor
1. **O primeiro gol de cada jogo.** Quatro partes pedindo (A09, A15, A17, A18). Fecha a ressalva
   do placar, que hoje limita toda conclusão de jogo. É a compra que mais renderia.
2. **Mais temporadas rastreadas.** Destrava os DOIS achados que falharam só por tamanho: a
   desigualdade do elenco (A20, efeito idêntico nos dois cortes) e o extremo (J11).
3. **O preço do traço.** A A16 mede o que o traço RENDE, não o que CUSTA. Falta folha salarial por
   clube-temporada.
4. **A formação do adversário como controle no A19.** Roda com a base que já existe.
5. **Valor de elenco com data** (o instantâneo do Transfermarkt não tem data, e a leitura do
   A16-2 depende disso).
6. **Onde a ação defensiva aconteceu.** Contado: das 118 colunas de jogador, 16 nomeiam zona do
   campo e **nenhuma das 6 defensivas** nomeia. Sem isso não há como achar o jogador que "protege a
   área em vez de bloquear chute de fora", que é a metade defensiva do eixo.

### 7.3 O que ficou proposto e não rodou
- **`_fonte/estudo_serieb/PLANO_FISICO.md`** — seis propostas de análise física. Duas rodaram
  (J11 e A20); ficaram a **combinação por eixos com nulo de permutação**, **idade × queda física**,
  **físico × disponibilidade** (que daria o mecanismo do J05-3 e é a única do bloco físico em que a
  porta temporal roda de verdade) e o **físico por jogo de 2025**.
- **Varrer as outras dezesseis decisões** atrás do defeito da D10 — decisão que contradiz a parte
  que cita. Duas foram achadas por leitura casual; ninguém olhou o resto.
- **Agrupar times por estilo** foi pedido e **não deve ser refeito como estava**: a §7.1 da
  ESPECIFICACAO.md já o rejeitou com o nulo de mesma covariância (p 0,195 a 0,955) e o Jaccard
  (0,48 a 0,67 contra a linha de 0,75 de Hennig). O que mudou e reabriria a pergunta é o nível do
  JOGO — 3.036 pontos em vez de 80 —, mas o agrupamento provável ali é o estado do placar, o que
  torna a pergunta circular para prever resultado.

### 7.4 O alvo, dito pelo dono em 21/09 — e que reordena a fila
O fim de qualquer parte é sempre **treinador e jogador sugeridos para contratação**. Parte que
para no traço do time está na metade. O mercado, em ordem de foco: (1) Série B; (2) Série A, de
onde alguns nomes não podem ser descartados; (3) brasileiros e sul-americanos que jogam no
exterior; (4) campeonatos sul-americanos — Argentina, Uruguai, Colômbia e vizinhos, e este item
foi marcado como principal. A lista por posição hoje é 65 na Série B e 120 no exterior, e o
exterior ainda aparece como anexo — é o que muda.

### 7.5 O que a conferência da cobertura achou em 22/09 — e o que ficou para o Portal

A pergunta era por que só 66 sul-americanos tinham rodagem. **A cobertura das fotos está
completa** (as 12 ligas têm as três temporadas da janela). Eram dois defeitos:

1. **A chave do cruzamento, que discriminava por idioma.** O `_temporal_photos.json` guarda o
   nome sem pontuação (`i russo`, via `J08_base.nkey`) e o J09 procurava com o `nm()` dele,
   que mantém o ponto (`i. russo`). Só casava quem tem o nome escrito por extenso — o
   brasileiro. Argentina A casava **8 de 437**; Brasil A, 182 de 337. Consertado usando a mesma
   função dos dois lados. Sul-americanos com rodagem: 87 → **720**; exterior: 951 → 3.021.
   **Isto derrubou o J09-1**, que foi reescrito: o achado "estrangeiro que já rodava joga mais
   no primeiro ano" era artefato do recorte enviesado (q 0,0015 → 0,437; d 1,02 → 0,226 contra
   mínimo de 0,65; IC passou a incluir o zero). O filtro de rodagem nos mercados de fora
   **continua**, mas declarado como critério prático da casa, e não como achado medido — e a
   tela diz isso. O J09-2 também virou: 4 nomes passam a ficha na ORIGEM e nenhum sobrevive ao
   desconto de conversão (Portugal, Romênia, Polônia, Eslováquia — nenhum sul-americano).

2. **Rótulo de liga errado na fonte, fora deste repositório.** As fotos rotuladas `Peru` em
   2024 trazem times **equatorianos** e em 2025 trazem times **paraguaios**, idênticos aos do
   próprio Paraguai; só 2023 e jun26 são Peru. Por isso o Peru fica em 7 de 269 mesmo depois do
   conserto. A varredura achou **6 liga-temporada** assim: Peru 2024 e 2025, Sérvia 2024, e
   Dinamarca, Equador B e Portugal A em 2023 — dessas, só Peru e Sérvia caem na janela da
   regularidade. O arquivo é **copiado do Portal Ranking** (`_copiar_wyscout_ligas.py`), então o
   conserto é lá. **Vale conferir o J08 antes de confiar nos fatores de Peru, Paraguai e
   Equador**, porque os fatores de liga saem do mesmo painel.

**O padrão, pela terceira vez em dois dias:** os três defeitos (zagueiro, meio eixo e agora a
chave) são da mesma família — a tela afirmava um limite que era de CÓDIGO e não de dado. Vale
desconfiar de toda frase publicada que diga "essa base não tem".

## 8. A ordem de publicação, como comando

```bash
python3 _fonte/estudo_serieb/scripts/A17.py                # (~2 min: bootstrap de clube)
python3 _fonte/estudo_serieb/scripts/A18.py                # (idem, só se mexer nelas)
python3 _fonte/estudo_serieb/scripts/A19.py
python3 _fonte/estudo_serieb/scripts/A20.py
python3 _fonte/estudo_serieb/scripts/J11.py
python3 _fonte/estudo_serieb/scripts/J06_ranking.py      # 0. se mexer na lista por posição
python3 _fonte/estudo_serieb/scripts/gerar_decisoes.py   # 0b. se mexer nas decisões
python3 _fonte/estudo_serieb/scripts/gerar_regras.py     # 0b'. se mexer nas regras de leitura
python3 _fonte/estudo_serieb/scripts/gerar_fisico.py     # 0b''. se mexer na seção de físico
python3 gerar_valor_mercado.py                           # 0c. se mexer no valor de mercado
python3 gerar_estudo_serieb_js.py                        # 1. o dado da aba
python3 _fonte/estudo_serieb/scripts/gerar_registro.py   # 2. o registro
python3 _fonte/estudo_serieb/scripts/_portao.py          # 3. o portão (só lê)
python3 publicar_site.py                                 # 4. monta docs/ — SEM --push
git add -A && git commit                                 # 5. um commit só
git push origin main                                     # 6. e conferir:
git log --oneline origin/main..HEAD                      #    tem de sair vazio
```

## 9. Três coisas para levar, e não repetir

- **Nenhuma das oito partes novas achou um traço FIRME.** O estudo continua com uma conclusão
  firme só (A02-1). O que a sessão produziu foi preço, instrução e ressalva — e quatro regras de
  leitura. Isso é o rendimento realista desta base, e vale dizer antes de prometer.
- **Duas partes falharam por falta de tamanho, não por ausência de efeito** (A20 e J11). Elas são
  a fila de coleta, não pistas mortas — e é a distinção que a regra 3 da seção 6 protege.
- **O dono leu a tela e achou dois defeitos e três buracos.** A leitura crítica do que está
  publicado rendeu mais que qualquer rodada planejada. Manter.
