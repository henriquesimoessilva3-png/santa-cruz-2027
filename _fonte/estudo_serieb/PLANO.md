# Plano de trabalho — Estudo Série B

> Escrito em 18/09/2026, a pedido do dono, para dar ordem ao que falta.
> **Subordinado ao `CLAUDE.md` desta pasta**: onde os dois divergirem no método, vale o CLAUDE.md.
> Este arquivo só diz **em que ordem** e **de quem é cada passo**.
> Estado detalhado: `_fonte/CONTEXTO_sessao_17_09.md`.

## Onde parar de ler e começar a trabalhar

> **Estado de 20/09/2026, fim do dia.** O portão aceita **14 de 22** partes (eram 1 de manhã) e
> restam **10 reprovações** (eram 40). As etapas 6, 6b e 8 estão fechadas. A sequência do que fazer
> está em `_fonte/CONTEXTO_sessao_20_09.md`, seção 2 — comece por lá, não por este quadro.
>
> **O primeiro item é uma dívida:** o `confianca_motivo` é hoje o `title=` de um selo, que não
> rola, não copia e não abre no celular; o de J08-1 tem 4.020 caracteres. Vira um bloco que abre e
> fecha, e conserta as 70 conclusões de uma vez.

## A regra de ordem

**Correto e menor antes de grande e duvidoso.**

Hoje o estudo tem 19 partes respondidas e 53 conclusões — e uma auditoria que confirmou 350
defeitos nelas, incluindo 18 casos da armadilha da fronteira e 23 de confiança alta demais.
Acrescentar as 8 partes que faltam antes de consertar essas 53 é construir em cima de chão que
ainda não se sabe se é firme. Por isso o conserto vem antes da expansão.

## O quadro

| # | etapa | depende de | de quem | estimativa | pronto quando |
|---|---|---|---|---|---|
| ~~**0**~~ | ~~Fechar o diagnóstico~~ | — | — | gasto: 0,89M | **FEITA em 19/09** — 4 lentes + a porta temporal; ver §16 e §17 do contexto |
| **1** | Consertar as 53 conclusões | etapa 0 | **dono decide**, máquina executa | 2–5M | nada mais em rascunho; espelhos batendo |
| **2a** | ~~Copiar o SkillCorner~~ | — | — | feito | **FEITA em 19/09** — fatia da Série B, 22 MB, em `dados_copiados/`; ver `_registro.md` |
| **2b** | ~~Copiar as ligas do Wyscout~~ | — | — | feito | **FEITA em 19/09** — período ago26, 65 ligas, 60,4 MB; ver `_registro.md` |
| **3** | As 6 partes destravadas pela cópia | etapa 2 | máquina | 3–9M | cada uma com `<ID>.json`, `<ID>.md` e linha no registro |
| **4** | As 2 que precisam de coleta nova | decisão do dono | dono decide, máquina coleta | 1–3M | ou a coleta existe, ou a parte é fechada como sem base |
| **5** | R01 e a publicação | etapas 1 e 3 | **dono aprova** | < 0,5M | abas antigas aposentadas, `docs/` no ar |

Já gastos até aqui: **≈ 19,7M**. O que falta soma **6M a 17M**, e atravessa mais de uma renovação
semanal (o limite reseta às 5h, horário de Brasília).

---

## Etapa 0 — Fechar o diagnóstico

As 4 varreduras transversais, a única parte da auditoria que nunca rodou. Foram disparadas em 18/09
e as 4 morreram no limite do plano.

- **Script pronto, é só re-disparar:**
  `~/.claude/projects/.../workflows/scripts/cruzar-estudo-serieb-wf_47b60a2b-ea4.js`
- As lentes: **cascata**, **contradição**, **completude**, **espelhos** (o que cada uma procura está
  na §14 do contexto).
### Decidido em 18/09: abre pela cascata, sozinha

O dono aprovou começar **só pela cascata**, ~0,3M, antes de gastar o resto. Ela é a única das quatro
que pode mudar a resposta de topo do estudo; as outras três são higiene.

- **Script pronto, no repositório:** `_fonte/estudo_serieb/_cruzar_cascata.js`. Um agente.
  **Atenção:** o `Workflow` recusa `scriptPath` apontando para o repositório — ele só aceita caminho
  que ele mesmo devolveu, dentro da pasta da sessão. **Cole o conteúdo do arquivo no campo `script`.**
  O arquivo no repositório é a cópia durável, não o ponto de invocação.
- Ele devolve os achados **e** um campo `veredito_sintese`: em até 5 linhas, se a resposta de topo
  do estudo sobrevive, muda ou cai.
- **Só depois de ler esse veredito** se decide se vale rodar as outras três (0,6–1,2M).

**Por que ela vem antes de consertar:** a cascata responde se A14 (a síntese) e T04 (o treinador
ideal) ainda têm pé depois dos 350 achados. Sem essa resposta, as decisões da etapa 1 podem ser
tomadas uma a uma e depois viradas em bloco.

## Etapa 1 — Consertar as 53

Cinco passos, nesta ordem:

1. **Decidir, conclusão por conclusão** — o que cai, o que vira indício, o que só precisa de texto
   novo. São 53 decisões e **são do dono**; a auditoria instrui, não decide.
   Material: `resultados/_auditoria_18_09.md` para ler, `_auditoria_18_09.json` para o detalhe.
   **Leia o campo `pareceres` antes de aceitar uma `correcao`** — o cético às vezes corrige o
   auditor (§13.7 do contexto).
2. **Reescrever os `<ID>.json`** conforme decidido. Número sempre por marcador, nunca à mão.
3. **Rodar `gerar_estudo_serieb_js.py`** para a aba refletir. Ele para com erro se algum marcador
   ficar sem valor — isso é proposital.
4. **Sincronizar as duas tabelas do `_registro.md`** (§12.1 do contexto). Só agora, não antes.
5. **Validar** — o passo que move conclusão de rascunho para "O que decidimos". Só o dono dá.

**Sugestão de fatiamento:** por bloco, não tudo de uma vez. Bloco A (11 partes, 31 conclusões),
depois T (4 partes, 10), depois J (4 partes, 12). Relato a cada bloco entregue.

## Etapa 2 — As cópias · **FEITA em 19/09** (era o caminho crítico)

Copiar do Portal Ranking (:5053) as **53 ligas do Wyscout** e o **`skillcorner.db`** com físico por
jogador. Destrava sozinha **6 das 8** partes que faltam: J04, J05, J06, A10, J08, J09.

Custa quase nada em token — é decisão e movimentação de arquivo. **É a coisa de maior alavanca no
plano inteiro, e não depende da máquina.** Enquanto não acontecer, nenhum orçamento resolve essas 6.

Ao copiar, registrar a data da cópia no `_registro.md`, como manda a §4 do contexto.

## Etapa 3 — As 6 destravadas · **fatiada em 19/09**

**Decisão do dono, 19/09:** as seis não rodam juntas. **J04 → J08 → A10** primeiro, porque nenhuma
delas depende do A14. **J05, J06 e J09 ficam seguradas** até o A14 e o J03 estarem consertados e
validados — a auditoria condenou os dois (o A14 perdeu a manchete e metade da validação; o J03 tem
11 achados confirmados e o número do duelo comparando dois cortes diferentes), e J05/J06/J09
dependem deles. Construir agora é construir em chão condenado, e obrigaria a refazer depois.

### A ordem original


Uma parte por pedido, como manda o CLAUDE.md. Ordem sugerida, seguindo as dependências:

`J04` (titular físico) → `J05` (perfil por posição) → `J06` (alvos na B) · `A10` (físico na
temporada) · `J08` (conversão de ligas) → `J09` (alvos no exterior)

J04 primeiro porque J05 e J06 dependem dele. J08 antes de J09 pelo mesmo motivo. A10 é independente
e pode entrar em qualquer ponto.

## Etapa 4 — As 2 sem base

- **A09 (minuto do gol)** — a mais barata das duas. Coleta no molde dos coletores existentes.
- **A08 (físico por tempo de jogo)** — o SkillCorner só guarda `full_all`. **Pode não ter fonte
  nenhuma**; se não tiver, a saída honesta é fechar a parte como "não responde com esta base",
  que é conclusão legítima pela regra da casa.

## Etapa 5 — R01 e a publicação

- **R01** (aposentar Análise Série B e Protótipo) espera **a lista de arquivos aprovada pelo dono**.
- **Publicar em `docs/`** só depois do passo 1.5. Publicar 53 rascunhos com defeito confirmado numa
  página pública é o tipo de coisa que não se desfaz bem.

---

## Etapa 6 — O portão de entrega: nove regras · **aprovado pelo dono em 19/09**

### Por que existe

O problema não é "números digitados". É uma **classe**: o estudo afirma coisas sobre si mesmo que
não são verdade, e nada confere. Todas as falhas de 18–19/09 são alegações de procedência — "isto
veio do script", "isto passou no critério", "esta é a prova", "isto é robusto" — que nenhum
mecanismo verificou. **Disciplina foi a única trava, e disciplina falha.**

O portão roda **antes** de a parte ser aceita e **recusa** o que não prova o que alega.
Parte que não passa não entra na aba.

### As nove regras, com o custo medido em 19/09

| # | regra | reprova hoje |
|---|---|---|
| **1** | Todo marcador de `numeros` consta na saída do próprio `<ID>.py` | **191 marcadores**, 21 das 22 partes |
| **2** | A `confianca` é **recalculada** do `testes.csv`: "firme" exige BH **e** porta temporal | **as 35 firmes** — zero partes rodaram a porta |
| **3** | Os dois cortes de fronteira existem, e **quando discordam** o texto cita os dois | **81 casos**, todas as 22 partes |
| **4** | O campo `prova` aponta para algo que **existe e contém a prova** | **2**: A05-1 e A07-1 citam `.md` inexistente |
| **5** | O script importa o `_metodo.py` — nada de teste reimplementado | **9 de 22** |
| **6** | Nenhuma palavra proibida na manchete e no que vimos | **6**: A02-3, A11-1, A11-2, A13-3, T03-1, A14-2 |
| **7** | Nenhum indicador publicado duas vezes com `q` diferente — **mesmo indicador × mesma unidade × mesma comparação** | **2**: `xg_por_remate_contra` (A02/A06), `duelos_aereos_pct` (A04/A06) |
| **8** | O `_registro.md` é **gerado** dos JSON, nunca editado à mão | ele inteiro |
| **9** | O `gerado_por` é verificado ou removido | **as 22 partes** |

### Duas regras que mudaram no desenho, e por quê

**A 4 era "o `<ID>.md` existe"** — reprovaria 12 partes e pegaria 2 problemas reais, porque 59 das
62 conclusões citam o `_testes.csv` como prova, não o `.md`. Burocracia com aparência de rigor faz
verificador ser ignorado. A versão nova é mais estreita e mais dura: pega as duas de verdade **e**
pega o `.md` criado vazio só para satisfazer a regra.

**A 7 acusaria A10 e J04** por compartilharem 8 indicadores físicos — mas ali é legítimo: unidades
diferentes (clube-jogo contra jogador-temporada), perguntas diferentes. Por isso a regra é mesmo
indicador **× mesma unidade × mesma comparação**.

### O que o portão NÃO pega
Se a conclusão é interessante, se a interpretação está certa, se a pergunta valia a pena.
Ele pega **alegação sobre si mesma** — que é onde tudo falhou.

### Nota de regra
O `CLAUDE.md` só permite mexer no `gerar_estudo_serieb_js.py` em E00, R01 ou **"em pedido sobre a
tela"**. Este é pedido do dono, de 19/09 — autorizado.

## Etapa 6b — Os 12 `.md` que faltam · **pedido do dono em 19/09**

Dívida com a regra de entrega do `CLAUDE.md`, que pede dois arquivos por parte: o `<ID>.json` para
a tela e o **`<ID>.md` com a prova** — o que já existia e o que foi acrescentado, arquivos, colunas,
n, lacunas, tabela, testes, e o que ficou em aberto em até 2 linhas.

**Faltam 12 de 22:** A05, A07, A11, A12, A13, A14, J01, J02, J03, J07, T03, T04.
Têm: A01, A02, A03, A04, A06, T01, T02 (de 17/09) e A10, J04, J08 (de 19/09).

**Não é análise nova** — é redação sobre dado que já existe: os `_testes.csv`, os `_resumo.json` e
os scripts estão todos no disco. É a diferença entre conferir uma parte lendo um documento e
conferir lendo Python.

**Depois da etapa 1**, para o `.md` já nascer com o texto validado em vez de documentar o que vai
mudar.

## Etapa 7 — A skill: analisar qualquer campeonato · **FEITA em 20/09**

> Instalada em `~/.claude/skills/analisar-campeonato/`, com cópia versionada em
> `_fonte/estudo_serieb/skill/` (ver o `LEIA.md` de lá: ao mexer numa, sincronize a outra).
> São o `SKILL.md` (189 linhas: viabilidade da base, desenho, critério, entrega, o portão de 11
> regras) e o `references/armadilhas.md` (300 linhas, ~25 entradas em seis grupos — procedência do
> número, teste e critério, cruzar bases, raspar página, texto e desenho, processo). Cada entrada
> traz o que é, **como aparece** e o que fazer; quase todas passam caladas, e é por isso que estão
> escritas.

### O pedido original, de 19/09

**Quando:** no fim do estudo, e a ordem importa. Metade do método *como foi praticado* está sendo
corrigida agora; uma skill escrita antes congelaria os erros em vez do método.

**O que transfere e o que não.** As conclusões do Estudo Série B **não** transferem — a qualidade da
chance cedida e o duelo defensivo são resposta desta liga, destas temporadas. O que transfere é o
**método**, e principalmente o **catálogo do que dá errado**, que esta sessão levantou a duro custo.

### O que a skill precisa carregar

**1. O desenho.** Unidade clube-temporada; posto dentro da temporada, nunca bruto entre anos;
faixas e a comparação padrão; a régua da fronteira **como teste de robustez** — com o aviso de que o
corte reduzido é enviesado entre faixas vizinhas (`_metodo_fronteira.md`).

**2. O critério de conclusão.** BH a 5% **por família** (uma família = um pilar × uma comparação),
lista pré-declarada **antes** de rodar, poder calculado para que "não separa" não vire "não existe",
e porta temporal. Os três níveis, e o que cada um exige.

**3. A forma da entrega.** Manchete / o que vimos / para o clube / premissa / confiança com n /
prova. Número por marcador. Resultado negativo é conclusão.

**4. O portão de entrega** — as nove regras da etapa 6, que é o que impede a classe de erro inteira.

**5. O catálogo de armadilhas**, que é a parte mais valiosa e só existe porque esta sessão apanhou:
robustez citada de um lado só · número digitado com `gerado_por` falso · o mesmo teste publicado em
duas famílias com dois `q` · viés do sobrevivente (o corte de minutos aplicado só no destino) ·
envelhecimento confundido com nível de liga · regressão à média lida como efeito · casamento por
nome e o homônimo · data UTC contra local · a temporada que não sai do ano da data · o `saison_id`
do Transfermarkt · export cortado em 500 linhas · consequência do resultado tratada como
característica · "não separa" sem poder · promovido/rebaixado contado como transferência.

**6. O teste de viabilidade da liga.** Antes de prometer resposta, dizer o que a base **tem**: sem
físico por jogo não há A08 nem A10; sem minuto do gol não há A09; sem 10 casos por liga de origem
não há fator de conversão; sem nome de treinador não há bloco T. Esta sessão mapeou isso — vira
checklist.

### Como ela se chamaria e onde mora
Skill nova, no molde das que já existem (`dados-wyscout`, `dados-skillcorner`, `portais-botafogo`).
Nome sugerido: **`analisar-campeonato`**. O `CLAUDE.md` do Estudo Série B vira o exemplo trabalhado.

## Etapa 8 — Os gráficos e a passada de texto · **FEITA em 20/09**

As duas mexiam nos mesmos `<ID>.json`, então foram juntas, um agente por parte (25, e não 22:
J05, J06 e J09 entraram).

### O que saiu, medido

| | antes | depois |
|---|---|---|
| `o_que_vimos`, mediana | 767 caracteres | **266** (maior: 279) |
| manchetes fora da régua | 51 de 70 | **0** (mediana 13 palavras) |
| conclusões com gráfico | 0 | **58 de 70** |
| portão, regra 1 | PASSA 3 · REPROVA 12 · REVISAR 7 | **PASSA 16** · REPROVA 5 · REVISAR 1 |
| portão, reprovações | 40 | **33**, com as regras 10 e 11 a mais |

A regra 1 melhorou sozinha: tirar do texto o inteiro cravado à mão era metade do que ela cobrava.

### O que custou quatro rodadas, e por quê

Encurtar de 767 para 266 caracteres **come ressalva**, e a régua das regras 10 e 11 não pega isso
— está escrito nas limitações do próprio `_portao.py`. A primeira rodada entregou texto dentro da
régua e perdeu escopo: "nenhuma **dessas** diferenças" virou "nenhuma diferença", caiu "em média",
caiu "por 90", caiu "pode ser efeito do placar" (que o `A06_indicadores.json` declara obrigatória).
Um cético novo, lendo só o resultado final contra o HEAD, achou **7 graves e 35 médias**; uma
terceira rodada devolveu ressalva e escopo ao texto visível; um fecho consertou as 5 regressões que
a devolução criou.

**A regra que ficou:** quando não couber em 280 caracteres, sai o detalhe do achado, nunca a
ressalva. E `confianca_motivo` **não é texto de leitura** — na tela é o `title` do selo de
confiança. Ressalva que muda o que o leitor faz não pode morar só ali.

### O desenho também afirma, e por isso ganhou régua

Três defeitos do renderizador só apareceram com gráfico de verdade na tela:

- **A régua começava no menor ponto do próprio gráfico**, com 35% de folga. 9.582 contra 9.607
  metros — 0,26%, publicado como "sem diferença clara", com quatro clubes de um lado — ocupava 40%
  da largura. O desenho afirmava o que a manchete negava. Agora a régua **começa no zero**, as
  pontas dela são escritas, e o zero vira linha tracejada quando há valor negativo.
- **A forma `turno` não desenhava**: o gerador resolve o marcador em valor e o renderizador ainda
  procurava o valor pela chave. Devolvia `null`, e o `montarGraficos` removia o encaixe — sumia da
  tela sem erro.
- **A paleta seguia o sistema operacional**, e o app tem tema próprio (`body.claro`, padrão
  escuro). App no escuro com sistema no claro pintava a tinta do rótulo em `#0b0b0b` sobre fundo
  escuro: o número sumia, e é ele a regra de alívio do contraste. O `estudo_serieb.css` tinha o
  mesmo buraco.

E fora do estudo: o `?v=` do site vinha do mtime do `app.js` só, então mexer em arquivo de aba não
trocava a versão e o navegador servia o arquivo velho. Agora é o maior mtime de todo `.js` e `.css`
de `static/`, no `publicar_site.py` e no `versao_estatica()` do `app.py`.

### O que ficou em aberto

- **12 conclusões sem gráfico**, cada uma com o motivo no próprio relatório da parte. O padrão é um
  só: falta par de marcadores na mesma unidade, ou o script grava o valor em módulo (A02-3:
  `fin_m_cf` sem sinal inverteria a leitura). **Resolver é mexer nos `<ID>.py`, não no texto.**
- **Marcadores que os scripts precisam gravar** para fechar o resto: A01 pede o corte por ano
  (`corte_2022`…`corte_2025`) e a janela 2018–2021; A03 pede o `dif_pj` do Meio e do Cai no corte
  sem fronteira; A02 pede `fin_m_cf` com sinal.
- **O `confianca_motivo` de J08-1 e J08-2** está em 4.020 e 3.497 caracteres na tela. O mecanismo
  foi consertado (edição no lugar, não errata anexada) e nada de substância saiu, mas um tooltip
  desse tamanho não se lê. Decidir o que sai dali é do dono.
- **A07-1** continua com a ressalva do corte reduzido fora do texto de leitura; ganhou o gráfico de
  dois cortes da distância, que é a proteção que o plano desenhou para isso.
- **O `PARTES` do `_portao.py` ainda lista 22** e não inclui J05, J06 e J09 — por isso os três
  `<ID>_portao.py` avulsos, e por isso a regra 7 passa por vacuidade neles. As regras 10 e 11 os
  alcançam pelos atalhos.

### 8.1 O que JÁ ESTÁ PRONTO e não precisa ser refeito

| arquivo | o que é |
|---|---|
| `static/estudo_serieb_grafico.js` | o renderizador, 250 linhas, SVG inline, 4 formas |
| `static/estudo_serieb.css` | o estilo (`.esb-graf`), claro e escuro |
| `templates/index.html` | já carrega o renderizador antes da aba |
| `static/estudo_serieb.js` | já põe o encaixe e monta os gráficos depois do HTML |
| `gerar_estudo_serieb_js.py` | já **resolve os marcadores do gráfico** e falha se faltar valor |

**Falta só uma coisa: o campo `grafico` em cada conclusão dos `<ID>.json`.**

### 8.2 O formato do campo `grafico`

Vai dentro de cada conclusão, ao lado de `manchete`. Os valores vêm **por marcador**, nunca
escritos — o gerador resolve, e para com erro se o marcador não existir em `numeros`.

```json
"grafico": {
  "tipo": "dois_cortes",
  "titulo": "Distância da finalização",
  "unidade": "metros",
  "cortes": [
    {"rotulo": "com todos os times",        "series": [
      {"nome": "Sobe", "marcador": "dist_s_cf"}, {"nome": "Meio", "marcador": "dist_m_cf"}]},
    {"rotulo": "sem os times de fronteira", "series": [
      {"nome": "Sobe", "marcador": "dist_s"},    {"nome": "Meio", "marcador": "dist_m"}]}
  ]
}
```

As quatro formas, e quando usar cada uma:

| `tipo` | campos | quando |
|---|---|---|
| **`dois_cortes`** | `cortes: [{rotulo, series:[{nome,marcador}]}]` | **o padrão deste estudo.** Sempre que a conclusão depender do corte de fronteira — mostra os dois, e a fragilidade fica visível |
| `grupos` | `series: [{nome, marcador}]` | Sobe × Meio (× Cai) num indicador, num corte só |
| `turno` | `linhas: [{nome, turno, returno}]` | 1º → 2º turno, uma linha por faixa |
| `barras` | `barras: [{nome, marcador}]`, `linha_de_corte` | contagem por temporada ou categoria |

O `nome` da série pinta a cor: começa com "Sobe" → azul, "Cai"/"Trave" → aqua, resto → laranja.

### 8.3 A régua do texto, medível

Medido em 20/09: a regra das 3 frases **está cumprida (0 de 62 passam) e burlada pelo tamanho** —
mediana de **767 caracteres**, a maior com 1.258. **48 de 62 manchetes passam de 14 palavras.**

- **manchete:** ≤ 14 palavras, **uma oração**, sem dois-pontos e sem travessão
- **o_que_vimos:** ≤ 3 frases **E ≤ 280 caracteres**
- **os dois cortes saem do texto** — agora estão no gráfico
- **poder, placar e confiabilidade saem para o `confianca_motivo`**, onde o jargão é permitido
- **"colados na linha" no máximo uma vez** por conclusão (aparece 26× hoje); idem "desenho" (9×),
  "clube-temporada" (8×), "a régua" (7×)
- **os inteiros cravados no texto viram marcador** — são as 12 que faltam para a regra 1 zerar
  ("20 times", "a cada 100 finalizações", "3 pontos"). Onde for contagem legítima e não medida,
  escrever por extenso ("vinte times") resolve sem inventar marcador.

Depois: `python3 gerar_estudo_serieb_js.py` e `python3 scripts/_portao.py`.

### 8.4 As duas regras novas do portão

Manchete ≤ 14 palavras e `o_que_vimos` ≤ 280 caracteres viram as **regras 10 e 11**. São as duas
únicas coisas do texto que dão para checar por máquina, e é justamente onde a régua foi burlada.

## O que este plano NÃO cobre

Ficaram fora por decisão ou por falta de base, e continuam em aberto:

- **2018–2021** — segunda parte, sem dado físico e sem `SB_TABELAS`.
- **O recorte por estado do jogo** — não existe em base nenhuma; afeta A02, A03 e A06.
- **A altura da recuperação e o contra-ataque sofrido** — não existem; é o que faria mais falta em A06.
- **A conferência do T01 contra fonte independente** — a cobertura feita é prova interna.

## Uma regra de trabalho que veio da sessão de 18/09

**Extrair para o repositório a cada pedaço, não no fim.** A auditoria quase se perdeu por ficar só
no journal da sessão quando o plano acabou. Rodada longa agora grava resultado parcial em
`resultados/` assim que cada pedaço fecha.
