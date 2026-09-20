# Sessão de 20/09/2026, tarde — o estudo fechou

> Escrito para quem abrir amanhã sem ter visto nada. Lê-se de cima para baixo: o estado primeiro,
> o que sobrou depois, e só então o relato do que aconteceu e por quê.
>
> Continua o `_fonte/CONTEXTO_sessao_20_09.md` (a manhã). Onde os dois divergirem, vale este.
> Subordinado ao `_fonte/estudo_serieb/CLAUDE.md` (método) e ao `PLANO.md` (ordem).

---

## 1. O estado

| | manhã de 20/09 | fim do dia |
|---|---|---|
| perguntas respondidas | 25 de 27 | **27 de 27** |
| conclusões validadas | 61 de 70 | **74 de 74** |
| em rascunho | 9 | **0** |
| pendentes | 2 | **0** |
| portão | 14 de 22 aceitas | **27 de 27** |
| tarefas de tela (E00, R01) | 1 de 2 | **2 de 2** |

`main` limpa e empurrada. Site no ar em `henriquesimoessilva3-png.github.io/santa-cruz-2027`.
Commits do dia, na ordem: `a07edde`, `7099be4`, `8243b49`, `c6190b6`, `1c0019f`.

**O estudo está fechado.** Não há parte pendente, rascunho nem reprovação.

## 2. O que sobrou, e não é trabalho

As duas são **compra**, não análise por fazer — e é exatamente essa distinção que a A08 existe
para deixar escrita.

1. **O físico dentro do jogo (A08).** Fechada como conclusão negativa, com a ausência **medida**:
   zero coluna de período em 88, zero chave de tempo em 31 da API. Só coleta nova resolve, e não
   há atalho — a A09 foi salva porque o oGol publicava a soma por faixa de minuto de graça, e não
   existe equivalente para dado físico. É pergunta para o fornecedor, com custo.

2. **Como cada faixa reage ao placar (metade da A09).** O dono decidiu em 20/09 **não** fazer o
   levantamento jogo a jogo. O coletor está pronto e testado (`coletar_serieb_primeiro_gol.py`,
   12 de 12 jogos fechando com o próprio placar), o bloco de análise está escrito e ligado no
   `A09.py` — e falha aberto, então sem o CSV a parte responde só a primeira metade — e a
   declaração das duas famílias está marcada como **DECLARADA, NÃO RODADA**. São ~1.780 páginas,
   cerca de duas horas.

   **O que se perdeu, dito para quem for decidir de novo:** com dado por jogo a porta temporal da
   §6.4 rodaria, e a A09 poderia ter conclusão **firme**. Sem ela o teto continua provável — e
   isso é limite da forma da tabela agregada, não do mundo.

Para retomar qualquer uma: rodar o coletor e depois o `A09.py`. Nada precisa ser reescrito.

## 3. O que foi feito, e por quê

### 3.1 O portão, de 14 para 27 de 27

Nada aqui afrouxou régua. Onde o portão passou a aceitar, ou o defeito foi consertado na fonte, ou
**o próprio portão estava procurando a coisa errada** — e isso está dito, caso a caso, nos
comentários de cada mudança.

- **regra 9 (A05, A07):** os scripts gravam os números e o `gerado_por` mentia, apontando o
  executor genérico. Rodei os dois: reproduzem byte a byte.
- **regra 2 (A02, A06):** as duas chamavam de "porta temporal" uma conta que é **persistência** —
  o `_porta_temporal.md` de 19/09 já tinha apontado, e ninguém tinha consertado. Agora cada conta
  é gravada com o nome dela, e a porta da §6.4 entrou ao lado. No A02 ela passa (parcial +0,289,
  p 0,0094); no A06 ela **reprova** nos quatro indicadores, e é isso que prende a parte no
  provável, corretamente.
- **regra 3 (J03):** o corte sem fronteira rodava desde sempre e não era publicado.
- **regra 3 (A10, J04):** discordância entre cortes sem ressalva no texto. A10-1 e A10-3 foram
  reescritas com a ressalva, e o detalhe saiu para o uso prático — a regra da casa é essa.
- **regra 7 (A02, A04, A06)**, decisão do dono: **o indicador mora na família cuja pergunta ele
  responde**. `xg_por_remate_contra` ficou no A02 (família `cede`); `duelos_aereos_pct` ficou no
  A06 (família `duelo`). A parte que só empresta mede, mas cita o q do dono. Não é etiqueta:
  tirar um indicador da correção **muda o q dos vizinhos**, e dois marcadores do A06 mudaram de
  valor (nenhum selo virou).
- **J05, J06 e J09** entraram na lista do portão. Estavam publicadas como decididas e nunca
  tinham sido conferidas — com tabela de testes e saída de números prontas desde sempre. Faltava
  a linha. **Um portão só confere quem está na lista dele.**

### 3.2 A A09 saiu de "não roda"

O `CLAUDE.md` dizia, desde 17/09, que a A09 não rodava: nenhuma das 119 colunas da base traz
minuto. Estava certo sobre a base e certo sobre o remédio. A coleta custou **18 páginas**, e não
1.782, porque o oGol já publica a soma por faixa de minuto por edição.

**O achado:** entre 30 e 45 minutos quem sobe sofre **0,08 gol por jogo contra 0,16 do meio —
metade**, firme nos dois cortes (q 0,00001 e 0,00017), o mais forte das 120 comparações da parte.
É a única faixa em que quem sobe se separa dos dois lados, e quem cai não se distingue nela.

### 3.3 A A08 fechada com prova

"Não responde com esta base" é conclusão legítima pela regra da casa — mas só se for **medida**.
Até hoje era uma frase num arquivo de método. O `scripts/A08.py` abre o banco e conta: zero coluna
de período em 88, zero chave de tempo em 31 da API (toda métrica vem com sufixo `_full_all_`),
e a busca foi generosa de propósito. O **TIP/OTIP engana** — são 34 colunas de recorte abaixo do
jogo, mas por **posse**, não por tempo.

E o que a contagem **não** prova está escrito junto, porque a manchete é negativa.

### 3.4 Tela

- **As listas de jogadores** passaram a separar lateral esquerdo/direito e médio/meia ofensivo,
  nas duas listas e nas duas origens. Decisão do dono: **a ficha continua uma por setor**, e a
  tela diz isso em cada bloco — senão "Lateral esquerdo · ficha de 4 critérios" faria supor que a
  ficha distingue o lado.
- **O bloco "por que esta confiança"** saiu do `title=` e virou bloco que abre e fecha, nas 74
  conclusões. O maior tem 8.387 caracteres.
- **R01**, com escopo mudado pelo dono: as abas Análise Série B e Protótipo saíram da barra (12
  para 10) mas **não** do app — viraram material auxiliar do Estudo, com link no alto. Nada foi
  apagado: elas são a prova de onde muita conclusão veio.

### 3.5 A skill `analisar-campeonato` (etapa 7, a última)

Instalada em `~/.claude/skills/analisar-campeonato/`, com cópia versionada em
`_fonte/estudo_serieb/skill/`. O `LEIA.md` de lá diz como sincronizar — **ao mexer numa,
sincronize a outra**.

`SKILL.md` (209 linhas) tem a viabilidade da base, o desenho, o critério, a entrega, o portão de
11 regras e a seção sobre fechar pergunta sem resposta. `references/armadilhas.md` (375 linhas,
~32 entradas em sete grupos) é a parte cara: cada entrada traz **o que é**, **como aparece** e
**o que fazer**.

O que NÃO entrou, de propósito: as conclusões do Estudo Série B. Elas são resposta daquela liga,
daquelas temporadas.

## 4. Três lições do dia que não são sobre este estudo

1. **Um portão só confere quem está na lista dele.** Ele dizia "22 de 22" e as 22 eram as que ele
   conhecia, não as que existiam. Derive a lista dos arquivos, ou compare as duas.
2. **O `q` depende da companhia.** O mesmo indicador, com o mesmo `p`, sai com `q` diferente em
   famílias diferentes, porque a correção divide o crédito entre os testes feitos juntos. Dois
   números para a mesma medida não é erro de conta — é erro de desenho.
3. **Afirmar ausência de dado é alegação, como afirmar achado sem teste.** A diferença entre a
   A08 de ontem e a de hoje é um script que conta.

E uma de processo: **roteiro que descreve errado o que foi feito é pior que roteiro desatualizado**
— o desatualizado a gente desconfia, o errado a gente acredita. Foi por isso que a pergunta do R01
foi reescrita junto com o status.

## 5. A ordem de publicação, como comando

Inalterada, e continua valendo. Pular um passo põe o site no ar com dado velho.

```bash
python3 gerar_estudo_serieb_js.py                        # 1. o dado da aba
python3 _fonte/estudo_serieb/scripts/gerar_registro.py   # 2. o registro
python3 _fonte/estudo_serieb/scripts/_portao.py          # 3. o portão (só lê)
python3 publicar_site.py                                 # 4. monta docs/ — SEM --push
git add -A && git commit                                 # 5. um commit só, fonte e docs juntos
git push origin main                                     # 6. e conferir:
git log --oneline origin/main..HEAD                      #    tem de sair vazio
```

Se mexer em `J06_livres.py` ou `J06_ranking.py`, rode os dois **antes** do passo 1.
