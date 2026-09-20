# Sessão de 20/09/2026 — o que foi feito, e o que vem a seguir

> Escrito para quem abrir o projeto amanhã sem ter visto nada disto. Lê-se de cima para baixo: o
> estado primeiro, a lista do que fazer depois, e só então o relato do que aconteceu e por quê.
>
> **Subordinado ao `_fonte/estudo_serieb/CLAUDE.md`** (método) e ao `PLANO.md` (ordem). Onde este
> arquivo divergir de um dos dois, valem eles.

---

## 1. O estado, em números

| | manhã de 20/09 | fim de 20/09 |
|---|---|---|
| partes aceitas no portão | 1 de 22 | **14 de 22** |
| reprovações | 40 | **10** |
| partes sem `<ID>_testes.csv` | 11 | 0 |
| partes sem `<ID>.md` | 12 | 0 |
| conclusões com gráfico | 0 | 58 de 70 |
| `o_que_vimos`, mediana | 767 caracteres | 266 (maior: 279) |
| manchetes fora da régua | 51 de 70 | 0 |

**O que ainda reprova, parte por parte:**

| regra | o que ela cobra | partes |
|---|---|---|
| 2 | a confiança recalculada do `testes.csv` | A02, A05 |
| 3 | os dois cortes de fronteira, e citar os dois quando discordam | A10, J03, J04 |
| 7 | mesmo indicador publicado com dois `q` diferentes | A02, A04, A06 |
| 9 | o `gerado_por` aponta script que grava a saída | A05, A07 |

`main` limpa e empurrada. Último commit: `a07db92`. Site no ar em
`henriquesimoessilva3-png.github.io/santa-cruz-2027`.

**Três partes seguem em rascunho** — J05, J06 e J09 — e esperam validação do dono. A etapa 1 do
PLANO só fecha quando não sobrar rascunho.

---

## 2. A lista da próxima sequência, em ordem

**1. O bloco “por que esta confiança”.** *(prometido em 20/09 e não feito — começa por aqui.)*
O `confianca_motivo` é hoje o `title=` de um selo, que o navegador mostra como tooltip: não rola,
não copia e não abre no celular. O de J08-1 tem 4.020 caracteres e o de J08-2, 3.497 — nada ali é
supérfluo, é prova. Vira um `<details>` que abre e fecha, no molde do “ver os números” do gráfico.
Conserta as 70 conclusões de uma vez, e é só tela (`static/estudo_serieb.js` e `.css`).

**2. As 10 reprovações que sobraram.** Duas são decisão do dono, oito são trabalho:
- **regra 7 (A02, A04, A06)** — **decisão do dono**: o mesmo indicador está publicado em duas
  partes com `q` diferente (`xg_por_remate_contra` em A02/A06, `duelos_aereos_pct` em A04/A06).
  Qual família vale? Sem essa resposta não dá para mexer.
- **regra 9 (A05, A07)** — o `<ID>.py` não grava o `<ID>_numeros.json` que assina. Trabalho.
- **regra 2 (A02, A05)** e **regra 3 (A10, J03, J04)** — texto e tabela de testes. Trabalho.

**3. Os marcadores que faltam, para fechar as 12 conclusões sem gráfico.** Três são nomeados e
bastam para a maioria:
- `A01.py` — o corte do G4 por ano (`corte_2022`…`corte_2025`) e a janela 2018–2021;
- `A03.py` — o `dif_pj` do Meio e do Cai no corte sem fronteira;
- `A02.py` — regravar `fin_m_cf` **com sinal** (hoje em módulo, e por isso o gráfico de dois cortes
  do A02-3 inverteria a leitura).

**4. Validar J05, J06 e J09.** É do dono. Move as três de rascunho para “O que decidimos”.

**5. Etapa 4 — A08 e A09.** Decisão do dono: coletar o minuto do gol (A09, barato) ou fechar as
duas como “não responde com esta base”, que é conclusão legítima pela regra da casa.

**6. Etapa 5 — R01.** Aposentar as abas Análise Série B e Protótipo. Trava na lista de arquivos
aprovada pelo dono.

**7. Etapa 7 — a skill `analisar-campeonato`.** O PLANO manda ser a última, e hoje ficou mais
verdade: o catálogo de armadilhas ganhou quatro entradas que só apareceram com gráfico na tela.

---

## 3. O que mudou hoje, e por quê

### 3.1 Etapa 8: os gráficos e a passada de texto

58 conclusões ganharam o campo `grafico`; o texto caiu de 767 para 266 caracteres de mediana e as
70 manchetes passaram a caber em 14 palavras. As **regras 10 e 11** entraram no portão (manchete
≤ 14 palavras numa oração; `o_que_vimos` ≤ 280 caracteres e ≤ 3 frases), contadas **como a tela
mostra** — o formatador espelha o do gerador.

**Custou quatro rodadas, e o motivo é a lição da etapa.** Encurtar come ressalva, e a régua nova
não pega isso — está escrito nas limitações do próprio `_portao.py`. A primeira rodada entregou 70
textos dentro da régua e perdeu escopo: *“nenhuma **dessas** diferenças”* virou *“nenhuma
diferença”*, caiu *“em média”*, caiu *“por 90”*, caiu *“pode ser efeito do placar”* — que o
`A06_indicadores.json` declara obrigatória. Um cético novo, lendo só o resultado final contra o
HEAD, achou 7 graves e 35 médias. A terceira rodada devolveu ressalva e escopo ao texto visível; um
fecho consertou as 5 regressões que a devolução criou.

**A regra que ficou:** quando não couber em 280 caracteres, sai o detalhe do achado, **nunca a
ressalva**. E `confianca_motivo` não é texto de leitura — é tooltip.

### 3.2 O desenho também afirma

Três defeitos do renderizador que só apareceram com gráfico de verdade na tela:

- **A régua começava no menor ponto do próprio gráfico**, com 35% de folga. 9.582 contra 9.607
  metros — 0,26%, publicado como “sem diferença clara”, com quatro clubes de um lado — ocupava 40%
  da largura. O desenho afirmava o que a manchete negava. Agora **começa no zero**, as pontas são
  escritas e o zero vira linha tracejada quando há negativo. O mesmo par: 40% → 0,2%.
- **A forma `turno` não desenhava.** O gerador resolve o marcador em valor e o renderizador ainda
  procurava o valor pela chave; devolvia `null` e o `montarGraficos` removia o encaixe — sumia da
  tela sem erro.
- **A paleta seguia o sistema operacional**, e o app tem tema próprio (`body.claro`, padrão
  escuro). App no escuro com sistema no claro pintava a tinta do rótulo em `#0b0b0b` sobre fundo
  escuro: o número sumia, e é ele a regra de alívio do contraste.

E fora do estudo: o `?v=` do site vinha do mtime do `app.js` só, então mexer em arquivo de aba não
trocava a versão e o navegador servia o arquivo velho. Agora é o maior mtime de todo `.js` e `.css`
de `static/`, no `publicar_site.py` e no `versao_estatica()` do `app.py`.

### 3.3 O script virou a verdade

Decisão do dono: onde o número publicado divergia do que o `<ID>.py` grava, vale o script. Foram
**85 marcadores em 7 partes**, e a regra 1 zerou as reprovações (PASSA 3 → 20).

Não foi troca mecânica. Trocar número sem reler a frase é como o estudo já se enganou: o
`o_que_vimos` do J07-2 dizia *“estrangeiro e brasileiro estreiam jogando o mesmo, 16,6% contra
16,5%”* e o script devolve **17,5** — não era empate, e a direção invertia. 28 dos 39 marcadores da
parte divergiam, com um comentário de 19/09 no próprio script admitindo a divergência sem
corrigi-la.

E criar as tabelas de teste desenterrou alegação que nada conferia: o **T02-1** dizia *“em todas as
versões, só os 5 mais caros contra o 11º-para-baixo passa”*, e a linha 6 do `T02_testes.csv` mostra
o 6º-10º passando também, selo firme, q 0,01588. O portão existe para isso.

### 3.4 Três campos visíveis não passavam pelo `trocar()`

`premissa_motivo`, `em_aberto` e o **título do gráfico**. Todo número dentro deles era digitado à
mão por construção — foi por isso que o J07-2 seguiu anunciando o empate velho no bloco
“Premissa:” depois de o texto principal já estar corrigido. Agora resolvem marcador.

E o campo `premissa` guarda o **id** de `dados/premissas.json` (`m2`, `p20`): 23 conclusões
chegavam à tela dizendo “Premissa: m2”. Agora mostra o título.

### 3.5 As listas, abertas

O dono pediu, quatro vezes e de quatro ângulos, que o material parasse de esconder o detalhe:

- **Os 51 livres com rodagem**, por posição, com contrato confirmado ou não e o que cada um viola
  da ficha (`scripts/J06_livres.py`).
- **Os 33 treinadores**, do melhor para o pior, com os dois critérios lado a lado — trocar a média
  pelo piso troca o 3º lugar de Guto Ferreira por Eduardo Baptista, e essa instabilidade é o achado
  do T04. A seção abre dizendo que a lista **ordena o que aconteceu e não quem é melhor**: as duas
  premissas que permitiriam lê-la como previsão falharam (T02 e T03).
- **A régua do A14, peça por peça**, com o peso de cada uma e a mais forte marcada (valor do
  elenco, d 1,15).
- **O ranking por aderência** (`scripts/J06_ranking.py`) — ver 3.6.

E a **navegação**: sumário das 27 perguntas com salto, busca, filtro por estado e âncora por
conclusão (`#esb-A02-1`).

### 3.6 O ranking por aderência, e por que o exterior ficou de fora

A ficha de J05 é uma **conjunção** de 4 a 6 pisos: responde “quem é perfeito” e joga fora a
informação de quão perto cada um está. Dos 611 da Série B, **240 têm dois ou mais critérios
medidos** e a maioria tem a ficha inteira. A distribuição é um gradiente: **13 não violam nenhum
piso**, 46 violam 1, 65 violam 2, 74 violam 3, 30 violam 4, 9 violam 5, 3 violam 6.

Três medidas por jogador: `atende`/`com_dado`, `aderencia` (média do percentil nos critérios da
posição, na escala dos pisos) e `folga` (média de percentil − piso).

**O exterior não é ranqueável pela ficha, e isso é um achado.** A base das ligas de origem mede no
máximo **2 dos 4 a 6** critérios com piso — 1 de 4 na zaga — porque o dado físico quase não existe
fora daqui e o fator de J08 só traduz parte do técnico. É por isso que o J09 concluiu que nenhum
volante e nenhum extremo de fora passa nos pisos juntos: **eles nunca chegam a ser medidos**.
Ordenar por aderência ali seria ordenar por um terço do perfil, e quem é medido em menos coisa erra
menos. A lista de fora vai separada, ordenada pela **rodagem na liga de origem**, que é o que o J09
estabeleceu.

**A ordem nunca é a nota pura.** Ordenar só por aderência punha Gabriel Fuentes (90,4, medido em 2
critérios) acima de Jemerson (82,5, medido em 4). Tanto a aba quanto a coluna do app ordenam por
critérios cruzados primeiro, nota para desempatar.

### 3.7 Na ferramenta

Aba **Fim de contrato**: coluna “Estudo” com a nota e o denominador (`82,5 · 4/4`), ordenável, para
229 dos 240; filtro “só os do estudo”; e de lá o botão “levar p/” já manda o jogador ao campograma,
onde ele entra com status `alvo`.

**A chave não pode ser nome nem id do Transfermarkt.** Dos 1.136 jogadores da Série B na base do
app, só **31** têm `tm`, e o mesmo clube aparece como “Botafogo-SP”, “Botafogo SP” e “Botafogo FC”.
O estudo resolve a `primaryKey` do app e a grava; quem não resolve de forma única fica **listado**,
nunca adivinhado.

### 3.8 As duplicatas de jogador

12 pares de mesmo nome e mesma idade na Série B. Conferidos um a um contra fonte externa: **8 são a
mesma pessoa**, 4 são pessoas diferentes. O sinal que separa: posição igual ou vizinha + **a mesma
data exata de fim de contrato** = transferência gravada duas vezes; posição distante (volante ×
goleiro, atacante × goleiro) com datas diferentes = duas pessoas. O app **marca** (selo `2x`) e
avisa antes de levar o segundo registro ao campograma; **não funde**. Detalhe caso a caso na seção
de armadilhas do `_fonte/CONTEXTO.md`.

**Regra nova, autorizada pelo dono:** caso ambíguo continua sendo listado e nunca adivinhado, mas
**antes de virar dúvida ele é pesquisado fora da base** — Transfermarkt, BID da CBF e imprensa
local trazem data de nascimento e clube de formação, que é o que falta aqui dentro.

---

## 4. Arquivos novos desta sessão

| arquivo | o que é |
|---|---|
| `scripts/J06_livres.py` | os 51 livres com rodagem, com a `primaryKey` do app resolvida |
| `scripts/J06_ranking.py` | o ranking por aderência; reaproveita `julgar()` do J06 e confere contra o funil |
| `resultados/J06_livres_regulares.{csv,json}` | a lista dos 51 |
| `resultados/J06_ranking_aderencia.{csv,json}` | o ranking, Série B e exterior separados |
| `resultados/<ID>_testes.csv` | 7 novas (A11, A12, A13, A14, J01, T02, T03) |
| `resultados/<ID>.md` | 12 novas (A05, A07, A11, A12, A13, A14, J01, J02, J03, J07, T03, T04) |

**Regra nova no portão:** a parte pode declarar `sem_testes` no topo do `<ID>.json` quando não roda
comparação nenhuma (base, coleta, descritiva). A regra 3 aceita a declaração e só a aceita se a
parte não se contradisser — selo firme ou provável derruba, e tabela de teste existindo derruba. A
primeira versão casava palavras na prosa e reprovou as quatro partes que declararam, porque as
frases delas dizem justamente que aquilo *não* se aplica: é a armadilha que a regra 6 já tinha
aprendido com “BH”.

---

## 5. A ordem de publicação, como comando

Pular um passo põe o site no ar com dado velho. Aconteceu duas vezes hoje.

```bash
python3 gerar_estudo_serieb_js.py                        # 1. o dado da aba
python3 _fonte/estudo_serieb/scripts/gerar_registro.py   # 2. o registro
python3 _fonte/estudo_serieb/scripts/_portao.py          # 3. o portão (só lê)
python3 publicar_site.py                                 # 4. monta docs/ — SEM --push
git add -A && git commit                                 # 5. um commit só, fonte e docs juntos
git push origin main                                     # 6. e conferir:
git log --oneline origin/main..HEAD                      #    tem de sair vazio
```

Se mexer em `J06_livres.py` ou `J06_ranking.py`, rode os dois **antes** do passo 1 — o gerador lê o
JSON que eles escrevem.

**Por que `publicar_site.py` sem `--push`:** com `--push` ele faz `git add docs` e, se o `docs/` já
estiver commitado, imprime “nada mudou em docs/” e sai **sem empurrar**. Está registrado no
`_fonte/CONTEXTO.md`, seção “Armadilha de publicação”.
