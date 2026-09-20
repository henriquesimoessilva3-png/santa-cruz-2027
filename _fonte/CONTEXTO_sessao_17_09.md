# Estudo Série B — contexto, estado e como retomar

> **Consolidado em 20/09/2026.** Este arquivo foi reescrito do zero, com cada número conferido
> contra o disco, porque a versão anterior tinha crescido em 27 seções escritas em momentos
> diferentes e as antigas contradiziam as novas. **Onde este arquivo divergir de qualquer outro,
> vale este** — e onde ele divergir do disco, vale o disco.
>
> Cobre as sessões de **17, 18, 19 e 20 de setembro de 2026**.
> A direção do estudo é o `_fonte/estudo_serieb/CLAUDE.md`. O plano de trabalho é o
> `_fonte/estudo_serieb/PLANO.md`. Este arquivo é o estado.

---

## 1. O estado, hoje

| | |
|---|---|
| perguntas respondidas | **25 de 27** — faltam só A08 e A09 |
| conclusões | **71** |
| confiança | **1 firme** · 19 provável · 51 indício |
| status | 61 validadas · 9 rascunho (as de J05, J06 e J09) · 1 removida (A10-2) |
| marcadores publicados | **1.462**, todos saindo de um cálculo do próprio script |
| portão de entrega | **40 reprovações** (eram 131) · **J02 aceita** |
| aba | **no ar**, em `docs/`, publicada no GitHub Pages |
| git | branch `main`, último commit `7d2ca99`, **86 pendências não commitadas** |

**A resposta do estudo, em três linhas.** Uma coisa só passa nos dois testes da casa: quem sobe
**finaliza de mais perto** — 19,5 m contra 20,5 do meio, e já finalizava assim no 1º turno. Três
separam nos dois cortes mas sem prova de virem antes do placar: ceder finalização de pior
qualidade, ganhar ~1 ponto percentual da dividida no chão, e sofrer menos perigo em casa. A peça
que mais separa é o **valor do elenco**, que o clube não escolhe.

**E a pergunta central — quem contratar — não tem resposta com esta base.** J06 rodou o backtest
obrigatório da §8.6 e ele **não passou**; nenhum nome foi publicado, nem na Série B nem no exterior.

---

## 2. Como retomar

1. **Ler este arquivo e o `_fonte/estudo_serieb/PLANO.md`.** O `CLAUDE.md` da pasta é a direção;
   as tabelas do `_registro.md` são **geradas** e sempre valem contra qualquer prosa.
2. **A próxima rodada é a etapa 8 do `PLANO.md`** — os gráficos e a passada de texto. Está
   especificada para rodar a frio: o formato do campo `grafico`, as quatro formas, a régua medível
   do texto e as duas regras novas do portão. **O renderizador, o CSS, o carregamento e a resolução
   no gerador já estão prontos**; falta só o campo `grafico` nos JSON.
3. Antes de dar qualquer número, **conferir no disco**. Esta sessão errou duas vezes afirmando de
   memória o que os arquivos contradiziam.

---

## 3. O que existe no disco

```
_fonte/estudo_serieb/
  CLAUDE.md          a direção do dono (357 linhas)
  PLANO.md           o plano de trabalho, etapas 1 a 8
  scripts/           25 scripts de parte + a infraestrutura:
                       _metodo.py           percentil_no_ano, cohen_d, ic_por_clube, d_minimo, bh
                       _porta_temporal.py   a porta da §6.4
                       _portao.py           o portão de nove regras
                       gerar_registro.py    gera o _registro.md dos JSON
                       _copiar_*.py         as três cópias de base, reproduzíveis
  resultados/        <ID>.json e <ID>.md de cada parte, mais:
                       _registro.md         GERADO. Não editar à mão.
                       _registro_notas.md   a prosa curada que o gerador copia
                       <ID>_numeros.json    o que o script calcula (a prova da regra 1)
                     e o diagnóstico, todo em _*.md + _*.json:
                       _auditoria_18_09     350 achados, conclusão por conclusão
                       _cascata_19_09       8 achados de conjunto
                       _cruzar_19_09        27: contradição, completude, espelhos
                       _porta_temporal      o teste da §6.4 sobre o índice do A14
                       _robustez_19_09      81 casos de robustez de um lado só
                       _proposta_destino    a v1
                       _proposta_destino_v2 a v2, validada pelo dono
                       _numeros_novos       646 marcadores calculados, com o de_onde
                       _numeros_do_script   o que cada script passou a gravar
                       _portao_relatorio    a linha de base do portão
  dados_copiados/    157 MB de base copiada (ver §5)
gerar_estudo_serieb_js.py    junta resultados/*.json para a tela; resolve marcadores
static/estudo_serieb.js      a aba
static/estudo_serieb_grafico.js  o renderizador de gráficos (pronto, sem uso ainda)
static/estudo_serieb.css     o estilo
static/estudo_serieb_dados.js    GERADO. Nunca editar à mão.
```

---

## 4. As regras que valem (e como elas foram quebradas)

O `CLAUDE.md` do dono manda. O que mais importa, e onde o estudo falhou:

**Confiança em três níveis, e só três.** firme = passa em BH a 5% por família **E** na porta
temporal. provável = só um. indício = nenhum, e a frase diz por quê.
*Como falhou:* 35 conclusões diziam firme e **zero das 19 partes tinham rodado a porta**.

**A fronteira é teste de robustez.** Toda comparação roda também sem os times colados na linha, e
"conclusão que só aparece COM eles é ruído". O corte **sem** fronteira é enviesado por construção
entre faixas vizinhas (`_metodo_fronteira.md`).
*Como falhou:* 81 casos de rodar os dois cortes e publicar só o que favorece — em **todas** as 22
partes de então, 20 deles mudando a conclusão.

**Nenhum número digitado à mão.** Todo número do texto vem por marcador, com o valor em `numeros`.
*Como falhou:* 191 marcadores que script nenhum produzia, e 98 deles estavam errados. **Consertado
em 20/09:** os 1.462 saem do script, que grava `<ID>_numeros.json`.

**Um gráfico por conclusão, o mais simples que mostre o achado.**
*Como falhou:* **zero gráficos** até hoje. O renderizador existe desde 20/09; falta o campo.

**Entrega de cada parte: `<ID>.md` (a prova) e `<ID>.json` (a tela).**
*Como falhou:* **12 das 25 partes ainda não têm `.md`** — A05, A07, A11, A12, A13, A14, J01, J02,
J03, J07, T03, T04.

**Uma parte por pedido.** *Como falhou:* rodadas foram sobrepostas várias vezes em 19 e 20/09, o que
custou auditabilidade (a conferência do J04 reclamou, com razão, que não dava para separar quem
escreveu o quê).

---

## 5. As bases copiadas (19/09)

O `CLAUDE.md` permite: *"o que for usado entra aqui como base copiada, com a data da cópia
registrada no `_registro.md`"*. Três cópias, todas com script reproduzível em `scripts/_copiar_*.py`
e a fonte aberta em modo somente-leitura.

| o quê | onde | tamanho | destrava |
|---|---|---|---|
| SkillCorner, fatia Série B | `dados_copiados/skillcorner_serieb.db` | 22 MB | J04, J05, J06 |
| Wyscout, 65 ligas (`ago26`) | `dados_copiados/wyscout/` | 60 MB | J08, J09 |
| Wyscout histórico 2018–`jun26` | `dados_copiados/wyscout/historico/` | 69 MB | o "antes" das transferências do J08 |

**Nenhuma credencial foi copiada** — o `config.py` do Portal Skillcorner, que tem as chaves da API
em texto, ficou de fora de propósito.

**Dois ponteiros do `CLAUDE.md` estavam errados:** o `skillcorner.db` está no **Portal Skillcorner**,
não no Portal Ranking; e o período de ligas não é `abr26` com "53 ligas, 14 mil jogadores" — nenhum
período tem isso (`ago26` tem 65 e 18.460).

⚠️ **O repositório é público** e essas bases são dado licenciado de SkillCorner e Wyscout. O dono foi
informado em 19/09, esclareceu que o Portal Ranking é dele, e autorizou a publicação. **Excluir só o
`dados_copiados/` é uma linha no `.gitignore`**, se um dia mudar de ideia.

---

## 6. O diagnóstico, e o que ele encontrou

Três rodadas em 18 e 19/09, tudo em `resultados/_*`:

**Por conclusão** — um refutador ataca cada uma das 53 de então, três céticos independentes julgam
cada achado, maioria de 2 em 3 confirma. **350 achados confirmados, 128 derrubados.**

**De conjunto** — quatro lentes. A cascata achou que a porta temporal quase não foi rodada, que a
bola parada foi contada errada e que o bloco do treinador roda fora do método. As outras três
acharam 27, entre elas as contradições A04×J03 (duelo aéreo) e A02×A06 (o mesmo teste publicado
duas vezes com dois `q`).

**A varredura de robustez** — **81 casos** de citar um corte só, **em todas as 22 partes**, 20 deles
mudando a conclusão. É o achado sistêmico: **o estudo publicava o corte que favorecia**.

**A causa raiz de tudo:** o estudo afirmava coisas sobre si mesmo que nada verificava —
`gerado_por` apontando script que não produz, "firme" sem a porta, "a prova" apontando arquivo
inexistente. Disciplina era a única trava.

---

## 7. O portão de entrega (`scripts/_portao.py`)

Nove regras, aprovadas pelo dono em 19/09. Roda antes de a parte ser aceita e **recusa o que não
prova o que alega**. Foi atacado de propósito: **81 partes falsas fabricadas, 23 passaram
indevidamente e 8 falsos positivos — todos fechados.**

| # | regra | início | hoje |
|---|---|---|---|
| 1 | todo marcador consta na saída do próprio script | 22 | **12** |
| 2 | a confiança é recalculada do `testes.csv` | 20 | **9** |
| 3 | os dois cortes existem, e quando discordam o texto cita os dois | 20 | **14** |
| 4 | a `prova` aponta para algo que existe e não está vazio | 2 | **0** |
| 5 | o script importa o `_metodo.py` | 9 | **0** |
| 6 | nenhuma palavra proibida na manchete e no o que vimos | 11 | **0** |
| 7 | nenhum indicador publicado 2× com `q` diferente | 3 | **3** |
| 8 | o `_registro.md` é gerado, nunca editado à mão | 22 | **0** |
| 9 | o `gerado_por` é verdade ou não existe | 22 | **2** |
| | **total** | **131** | **40** |

**O que ele não pega:** se a conclusão é interessante, se a interpretação está certa, se a pergunta
valia a pena. Ele pega alegação sobre si mesma.

**Ele já provou o valor duas vezes**, pegando defeitos que eu mesmo tinha acabado de criar: prosa
do `_registro.md` com confianças velhas depois da v2, e a A10-2 sumindo da tabela por estar
removida.

⚠️ **J05, J06 e J09 não estão na constante `PARTES`** e passam por um atalho que chama a mesma
função — **a regra 7 passou por vacuidade nelas**. Pôr as três em `PARTES` é tarefa aberta.

---

## 8. A proposta v2, validada pelo dono

A v1 perguntava "esta conclusão está certa?". A varredura trocou para **"os dois cortes dizem o
mesmo?"** — e **49 das 62 mudaram de destino**. A v2 está em `_proposta_destino_v2.md`, foi
**validada pelo dono em 19/09** e **aplicada**: 8 conclusões invertidas, 1 removida, o resto
reescrito. A confiança foi de 35 firmes para **1**.

**Duas mudaram de lado.** A **bola parada** saiu do "não separa": o trabalho não separa em corte
nenhum, mas o **saldo de gols de bola parada** separa na base inteira — 0,145 por jogo contra zero,
cinco gols e meio por temporada. E **ter a bola** saiu pelo motivo oposto: só separa **depois** de
tirar quem subiu raspando, e é o único item de estilo cujo 1º turno antecipa o 2º.

---

## 9. As armadilhas da base (o catálogo)

Levantadas a duro custo. Este catálogo é o núcleo da futura skill `analisar-campeonato`.

**Do método**
- robustez citada de um lado só — rodar dois cortes e publicar o que favorece
- número digitado com `gerado_por` afirmando uma procedência falsa
- o mesmo teste publicado em duas famílias, com dois `q` válidos para a mesma coisa
- "não separa" sem poder calculado — vira "não existe", que a especificação proíbe
- viés do sobrevivente: no J08 o corte de minutos rodou só no destino, não na origem
- envelhecimento confundido com nível de liga; regressão à média lida como efeito
- promovido/rebaixado com o clube contado como **transferência** (189 de 737 no J08)

**Da base**
- a temporada NÃO sai do ano da data — sai dos blocos de meses com jogo (A01)
- no Transfermarkt o `saison_id` das competições brasileiras é o ano **menos um** (T01)
- SkillCorner e Wyscout casam **por nome**: o Pedro do Flamengo já recebeu o físico do Pedro
  Rodríguez; nenhuma base do lado Wyscout carrega o id do SkillCorner
- **105 goleiros** com 900+ min não têm uma única linha física — o SkillCorner não os rastreia
- `players.team_name` está **vazia** nas 2.105 linhas
- data UTC (Wyscout) contra local (SkillCorner): 505 de 1.156 jogos diferem em 1 dia
- o export do Wyscout corta em **500 linhas** por temporada
- a chave é `primary_key = "<Player> - <Team within selected timeframe> - <Liga>"` — nunca `Team`
- a idade do Wyscout é a de **hoje**, não a da temporada; região é `Birth country`

**O que a base não tem, e nenhuma cópia resolve**
- **minuto do gol** — A09 não roda
- **físico por tempo de jogo** — A08 não roda; o SkillCorner só guarda `full_all`
- **físico por jogo em 2022–2024** — zero linhas, na fonte também
- **recorte por estado do jogo** — afeta A02, A03, A06, A07, A10, A11

---

## 10. O que ficou aberto

**Etapa 8, a próxima:** os gráficos (0 de 71 conclusões) e a passada de texto. Especificada no
`PLANO.md` para rodar a frio.

**Depois:**
- pôr J05, J06 e J09 na constante `PARTES` do `_portao.py`
- as 40 reprovações restantes: 12 são inteiros cravados no texto, não marcador
- os **12 `.md`** que faltam (etapa 6b)
- o JSON guardar o valor **medido**, não o arredondado — 51 marcadores hoje guardam o exibido
- a skill **`analisar-campeonato`** (etapa 7), no fim do estudo, com o catálogo da §9 dentro
- **R01**, que espera a lista de arquivos aprovada pelo dono
- **A08 e A09**: só com coleta nova

**As 9 conclusões de J05, J06 e J09 estão em rascunho** — esperam validação do dono, como manda a
regra.

---

## 11. Duas coisas que esta sessão errou

**Afirmei números de memória que os arquivos contradiziam** — o "21 das 22" da regra 1, e a escada
brasileira do J08 (Série A→B +0,64, C→B −0,59), que repassei duas vezes como achado sólido antes de
a conferência mostrar que 189 das 737 linhas não eram transferência. **Conferir no disco antes de
afirmar.**

**Instruí a v2 a pôr os dois cortes dentro do texto**, e isso produziu as frases de 767 caracteres
que o dono reclamou com razão. **Ressalva vai para o `confianca_motivo` e para o gráfico, nunca
para o "o que vimos".**
