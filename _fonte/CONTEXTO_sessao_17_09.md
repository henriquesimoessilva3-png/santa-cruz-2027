# Contexto — sessão de 17/09/2026: o Estudo Série B, de zero a 19 partes

> Escrito a pedido do dono no fim da sessão. **Este é o estado mais recente e manda onde discordar
> do `_fonte/CONTEXTO_sessao_15_16_09.md` e do `_fonte/prototipo/CONTINUAR.md`.**
> ~~O detalhe de cada parte está em `<ID>.md`~~ — **falso, conferido em 19/09: 12 das 19 partes
> nunca entregaram o `.md`.** Só existem A01, A02, A03, A04, A06, T01 e T02. Ver §17.

## 1. O que aconteceu nesta sessão

O dono trouxe um arquivo novo, escrito fora do repositório, e decidiu tocar por ele em vez de
implantar a fila do contexto anterior. O arquivo está em **`_fonte/estudo_serieb/CLAUDE.md`** e é a
direção atual.

De zero a **19 das 27 perguntas** respondidas, com **53 conclusões** (33 firmes, 13 prováveis,
7 indícios) — sendo **14 negativas**, na seção "Parece, mas não é". Mais a aba no ar e duas coletas
novas.

Nada foi commitado e nada foi publicado. **`git status` está sujo de propósito**: o trabalho todo
está no disco, esperando a decisão do dono.

## 2. O que está no disco, e não estava

```
_fonte/estudo_serieb/
  CLAUDE.md                   o arquivo do dono, com 12 correções de ponteiro (§5)
  scripts/  20 scripts        A01–A14, T01–T04, J01–J07, mais _metodo.py e _rodar.py
  resultados/ 85 arquivos     <ID>.md e <ID>.json de cada parte, bases e conferências
static/estudo_serieb.js       a aba
static/estudo_serieb.css
static/estudo_serieb_dados.js gerado; nunca editar à mão
gerar_estudo_serieb_js.py     o gerador
templates/index.html          + botão e seção da aba (MODIFICADO)
static/style.css              + o @media da barra de abas subiu para 1.300px (MODIFICADO)
```

**A aba está no ar no Flask local** (`santa-cruz-app`, porta 5090) com as 27 perguntas, o status de
cada uma e as 53 conclusões. Não foi publicada em `docs/`.

## 3. A resposta do estudo, em três linhas

**O que separa quem sobe do meio:** a qualidade da chance que se **cede** (xG por finalização
sofrida) e o **duelo defensivo ganho** — mais a distância da finalização, a qualidade da chance
criada, a estabilidade do onze e o valor do elenco, que não se escolhe.

**O que NÃO separa:** estilo com bola (A05), pressão (A06), bola parada (A04), físico (A07), a
vantagem de mando (A03) e a qualidade técnica individual do titular (J03). **Cinco das nove réguas
da Protótipo ficam sem sustentação** como separadoras: A, B, C, D e G.

**E o mais duro:** o duelo defensivo separa o TIME (d +1,59) mas **não o titular em nenhum setor**
(d de −0,11 a +0,54). A vantagem é coletiva, de uns dois pontos percentuais espalhados pelo elenco.
**Não se compra o duelo; organiza-se.**

## 4. As oito partes que faltam — todas bloqueadas

Nenhuma delas depende de mais trabalho neste repositório.

| parte | o que falta | onde resolver |
|---|---|---|
| **A08** | físico por tempo de jogo não existe: o SkillCorner só guarda o período `full_all` | coleta nova, ou o `skillcorner.db` do Portal Ranking |
| **A09** | minuto do gol não existe em base nenhuma | coleta |
| **A10** | a tabela física por jogo tem zero linhas em 2022–2024; só 2025 | Portal Ranking |
| **J04** | físico **por jogador** não está neste repositório (`raio_ref.json` só tem médias de sobe e cai, sem "meio") | `skillcorner.db`, no Portal Ranking |
| **J05** | depende de J03 (feita, negativa) e J04 (bloqueada) | destrava com J04 |
| **J06** | depende de J05, do funil da §8 e do backtest da §8.6 | destrava com J05 |
| **J08** | não há base de nenhuma liga fora a Série B | as 53 ligas do Wyscout no Portal Ranking |
| **J09** | depende de J05, J06 e J08 | destrava com os três |
| **R01** | precisa da lista de arquivos aprovada pelo dono | decisão |

### O portal que resolve cinco delas

**Portal Ranking do Botafogo Analytics** — porta 5053, `portal_ranking_botafogo.py`, pasta
`fut/BOTA/Analytics/Portal Ranking`, com `CLAUDE.md` próprio. Tem os Excels do Wyscout de **53
ligas** (`dados/abr26/`, 14 mil jogadores) e o **`skillcorner.db`** com físico por jogador e por
jogo. É outro projeto e outro repositório: nada de lá se altera, e o que for usado entra aqui como
base copiada, com a data da cópia no `_registro.md`.

## 5. Doze correções no CLAUDE.md do dono

Conferi ponteiro por ponteiro contra a base antes de rodar qualquer coisa. Doze estavam trocados e
foram corrigidos no arquivo (o de 292 linhas foi a 357). Os que mais custariam:

- **"etapa 14 = funil dos livres"** — o funil é a `etapa_12`; a 14 são as propostas de elenco.
- **"etapas 12–13 = perfil físico por setor"** — está em `sobecai_corrigido_por_clube` e
  `raio_ref.json`, não na §8.
- **"etapa 10 = a lista de consequência"** — a lista é a constante `CONSEQUENCIA` de
  `ranking_gaps.py` (7 nomes); das 22 linhas da etapa 10, 17 são tipo `resultado`.
- **oito réguas** — são **nove**: falta `H_dinheiro`, de que o A12 depende.
- **§6.8 = corte de 500 linhas do Wyscout** — a §6.8 é sobre truncamento de n.
- **E00 "registrado em `app.js`"** — o molde da Minutagem **não** toca o `app.js`.

Mais uma seção nova no fim do arquivo, **"O que a base não tem"**, com as oito lacunas.

## 6. O método da casa, num lugar só

`scripts/_metodo.py`, apurado lendo `gerar_prototipo.py` e a §6:

- **posto dentro da temporada** (percentil), nunca valor bruto;
- **t de Welch** e **d de Cohen** no mesmo percentil;
- **BH a 5% dentro de cada família × cada comparação**;
- **IC95 por bootstrap de CLUBE** — as 80 linhas são 40 clubes (§6.6);
- **poder por desenho**: o menor d detectável a 80%.

### A regra da fronteira, que eu apliquei errado e corrigi

Está em `resultados/_metodo_fronteira.md`, com a tabela. Em resumo: o md manda rodar **também** sem
os times de fronteira, como **teste de robustez**. Eu tratei esse recorte como verdade e reportei os
números dele como manchete. Ele é **enviesado por construção** — tira de cada grupo os times mais
perto da linha, o que na Sobe tira os 4ºs fracos (mediana 63 sai, 66,5 fica) e na Trave tira os 5ºs
fortes (62 sai, 56,5 fica). **Firme passou a exigir firme nos dois cortes.** Isso derrubou a
conclusão da trave no A03 e rebaixou a do A06.

## 7. Armadilhas da base, achadas e registradas

- **`saison_id` do Transfermarkt é o ano menos um.** A página de `saison_id=2021` é a temporada 2022.
  Pedir 2018–2026 perde 2018 inteira — foi assim que o Boa Esporte ficou fora do T01.
- **A temporada não sai do ano da data.** A Série B de 2020 terminou em **janeiro de 2021**; pelo ano
  da data, 2021 aparecia com 28 times, de 6 a 45 jogos. A temporada sai dos blocos de meses com jogo.
- **`serieb_tecnico.csv` tem DUAS colunas de clube.** `Equipa` traz o clube ATUAL (531 valores) e
  está errada; a certa é `Equipa dentro de um período de tempo seleccionado` (42). O erro é
  silencioso porque os dois nomes são de clube.
- **Não existia ponte de nome de CLUBE** entre as bases (a que havia é de jogador). Agora existem
  duas, as duas decididas **pelas temporadas** e não pelo nome: `T01_ponte_clubes.json`
  (Transfermarkt → Wyscout, 51 de 51) e `A04_ponte_clubes.json` (Sofascore → Wyscout, 42 de 42).
  Pelo nome, "Grêmio Novorizontino" e "Athletico" são ambíguos.
- **Faltam 5 jogos na base de 2022–2026** (A01): Londrina 1×1 Tombense (2022), Operário-PR 3×2
  Chapecoense (2024) e três de 2026. Deduzidos da diferença contra o `SB_TABELAS`.
- **O prefixo `es-` já é do app.** `.es-barra` existe no `style.css` com `width:70px`. As classes da
  aba nova usam `esb-`.
- **A barra de abas** com a 12ª aba: o `@media` subiu de 1.190px para **1.300px**. Medido — as abas
  ocupam 1.152px, mas quem fecha a barra é o aviso da direita, que termina em 1.289px.

## 8. Três bugs meus, e como apareceram

Valem mais que as correções, porque os três eram silenciosos:

1. **Testei no valor bruto** em vez do posto dentro da temporada (A02). Apareceu porque um subagente
   foi ler como a casa faz.
2. **`passes` + `_pct` = `passes_pct`**, que também é indicador — o percentil de um sobrescrevia o
   valor bruto do outro. Apareceu porque o A05 devolveu `d` e `q` **idênticos** para os dois.
   A chave do percentil virou `::pct`.
3. **Índice do A14 sem alinhar o sinal** — três dos oito componentes entravam invertidos, e o índice
   apontava **ao contrário** em 2025. Apareceu num diagnóstico componente a componente.

## 9. Duas coletas novas

- **T01 — treinadores.** Não havia nome de treinador em base nenhuma (a §0 estava certa).
  `scripts/T01.py` coletou do Transfermarkt: **1.160 passagens, 394 treinadores, 51 clubes,
  2018–2026**, e `T01_rodadas.py` as cruzou com a tabela do A01 → **506 passagens-temporada** com
  rodadas de Série B. Cobertura conferida: exata em 159 de 188 clube-temporadas, **zero** com jogo
  contado duas vezes.
- **Bola parada.** O md supunha que talvez não houvesse gol de bola parada para a Série B.
  **Há**: `dados/bola_parada.json` cobre 2022–2026 com escanteio, falta direta, indireta, lateral e
  pênalti, pró e contra.

## 10. Como retomar

1. Ler este arquivo — **inclusive a seção 12, escrita depois das outras** — e depois
   `_fonte/estudo_serieb/resultados/_registro.md`, sabendo que **as duas tabelas dele estão
   fora de dia** (§12.1). A fonte de verdade de cada parte é o `resultados/<ID>.json`.
2. **Nada está validado.** As 53 conclusões são rascunho: o md manda que conclusão só suba para
   "O que decidimos" depois de o dono validar o texto. **É o primeiro pedido natural da próxima
   sessão.**
3. Para destravar cinco das oito partes que faltam, a decisão é: **copiar do Portal Ranking** as
   ligas do Wyscout (J08, J09) e o físico por jogador do `skillcorner.db` (J04, J05, J06, A10).
4. A08 e A09 só saem com coleta nova, e A09 (minuto do gol) é a mais barata das duas.
5. `R01` — aposentar as abas antigas — espera a lista de arquivos aprovada pelo dono.

## 11. O que o dono decidiu nesta sessão

- Tocar pelo arquivo novo, **sem implantar a fila do contexto anterior**.
- **Recorte 2022–2026**; 2018–2021 fica para uma segunda parte, por não ter dado físico.
- **Aba por pontos: encerrada.**
- **Coluna de valor na Minutagem: revertida** (diff guardado em
  `_fonte/prototipo/sessao_14_09/parados_17_09/`).
- Corrigir as referências do md: autorizado e feito.
- Fazer a coleta de treinadores: autorizado e feito.
- **Rodar tudo em sequência**, passando por cima da regra "uma parte por pedido" do próprio arquivo.

## 12. Depois deste contexto: o registro fora de dia e a auditoria parada

Escrito no fim da sessão, **depois** das seções 1 a 11. Onde discordar delas, manda esta.

### 12.1 O `_registro.md` está fora de dia — a verdade são os JSON

A seção 10 manda ler o `_registro.md` logo depois deste arquivo. Leia, mas sabendo disto: **o
cabeçalho dele foi atualizado e as duas tabelas não.** Conferido arquivo por arquivo em 17/09:

| o que o `_registro.md` diz | o que os `resultados/<ID>.json` dizem |
|---|---|
| tabela de conclusões com **36 linhas** | são **53** conclusões em 19 partes |
| J01, J02, J03, J07, T03, T04 = *pendente* | as seis têm `<ID>.json` com conclusões prontas |
| A02-1 e A02-2 = *firme* | os dois são **provável** |
| A06-2 = *provável* | é **indício** (rebaixado em 17/09 pela regra da fronteira) |

**A fonte de verdade é o `<ID>.json` de cada parte**, que é também o que alimenta a aba pelo
`gerar_estudo_serieb_js.py`. Sincronizar as duas tabelas do `_registro.md` é tarefa aberta — e vale
esperar a validação do dono, porque ela pode mudar confiança e aí o retrabalho seria duplo.

**Correção ao que este arquivo dizia:** a seção 1 conta que ficou "o estado final no alto do
`_registro.md`". Ficou o cabeçalho, sim; as tabelas não foram sincronizadas. É o que está acima.

### 12.2 A auditoria das 53 conclusões  →  **desatualizada, ver §13**

Ainda em 17/09, depois de escrito o contexto, foi montada uma auditoria adversarial das 53
conclusões — um agente por conclusão, refazendo cada `{marcador}` a partir da base e tentando
**derrubar** a frase; o que fosse marcado iria a três céticos independentes.

- **A fase 1 fechou inteira: as 53 conclusões foram auditadas.** A fase 2 (céticos) parou no meio,
  a pedido do dono.
- Os 53 pareceres estão em disco, fora do repositório:
  `~/.claude/projects/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-Santa-Cruz/4950a7f5-653b-478e-8152-dd0c3fb42622/subagents/workflows/wf_5e6cb475-6e4/journal.jsonl`
  (131 entradas). Retomar o run por `resumeFromRunId` só funciona **dentro da mesma sessão**; de
  outra sessão, o journal se lê como arquivo — não é preciso rodar de novo para aproveitar.
- **Nada foi escrito no repositório.** Os auditores eram só de leitura e cumpriram: o `git status`
  ficou idêntico, 20 entradas, zero arquivo do estudo modificado.

### 12.3 Dois defeitos de texto vistos a olho, ainda não julgados

Achados na conferência manual, **sem** passar pelos céticos — conferir antes de agir:

- **A06-1:** o `o_que_vimos` traz "d {ppda_d}, q {ppda_q}" e "d {dd_d}". A regra de linguagem do
  CLAUDE.md proíbe `d` e `q` na manchete e no que vimos, e manda número em unidade de jogo.
- **A13-3:** a manchete é "*O 1º turno prevê menos do que parece: rho 0,48, não 0,82*" — `rho` está
  na lista proibida, e na manchete.

Nos dois casos é **defeito de forma, não de substância**: o achado continua de pé, o texto é que
não está no formato da seção Didática.

## 13. A auditoria das 53 conclusões — 85% feita, salva no repositório

> Escrito em **18/09/2026**, com o plano semanal perto do fim. **Esta seção substitui a §12.2**,
> que ficou curta demais. O resultado não está mais só no journal da sessão: **está no repositório.**

### 13.1 Onde está

| arquivo | o que é |
|---|---|
| `_fonte/estudo_serieb/resultados/_auditoria_18_09.json` | tudo: cada achado, o voto de cada cético e o porquê |
| `_fonte/estudo_serieb/resultados/_auditoria_18_09.md` | o legível: padrões, tabela por conclusão e o detalhe das julgadas |

Não depende mais da sessão nem do run. O run era `wf_5e6cb475-6e4`; retomá-lo só funciona dentro
da mesma sessão, e **não é mais preciso** — o que ele produziu já está nos dois arquivos acima.

### 13.2 O estado

**A auditoria está completa POR CONCLUSÃO — e só.** Fechada em 18/09, em dois runs
(`wf_5e6cb475-6e4` e `wf_71eac84b-6af`). **A terceira fase, a transversal, nunca rodou** (§13.8).

- **53 de 53** conclusões refutadas — um agente por conclusão, recalculando os números na base.
- **53 de 53** julgadas por três céticos independentes. Maioria de 2 em 3 confirma.
- **350 achados confirmados · 128 derrubados pelos céticos (27%) · nenhum cru.**
- Nenhuma conclusão passou limpa: as 53 têm ao menos um achado confirmado. Isso **não** quer dizer
  que as 53 caiam — a maioria dos achados é de texto, número ou nível de confiança, não de mérito.

**Ignore o campo `gravidade_do_refutador`.** O refutador pôs 47 das 53 na gravidade máxima — foi
instrução minha ("na dúvida, marque problema") e inflou o rótulo. O que vale é o achado confirmado,
um a um. A substância resistiu: os céticos mataram 26% e o que morreu foi o desleixado.

### 13.3 Os dois padrões sistêmicos

**A armadilha da fronteira voltou, em 18 conclusões.** Confirmada em A02-1, A02-2, A02-3, A03-2,
A03-3, A04-1, A04-3, A06-1, A07-1, A07-2, A11-3, A13-1, A14-2, J01-3, J03-1, J03-2, J03-3, J07-1.
O `_registro.md` já a registrava como "a mais cara até agora" e ela seguiu passando: **firme exige
firme nos dois cortes**, e boa parte das conclusões só existe em um. Este é o item nº 1 da revisão.

**Confiança alta demais, em 23 conclusões.** A03-1, A04-2, A05-2, A06-3, A07-1, A11-1, A11-3,
A12-1, A13-1, A13-3, A14-2, J01-3, J02-2, J03-1, J03-2, J07-3, T01-1, T02-1, T02-2, T02-3, T03-1,
T04-1, T04-2 — **o bloco do treinador inteiro caiu aqui.** Em geral por "firme" declarado
sem os dois critérios (BH **e** porta temporal), ou por "não separa" afirmado sem poder calculado.

Tipos mais frequentes entre os 293: `prova_nao_sustenta` 54, `outro` 34, `numero_errado` 32,
`excesso_de_alcance` 31, `n_errado` 26, `palavra_proibida` 25.

### 13.4 O exemplo que mostra o padrão: A02-2

*"O lado que mais separa é o defensivo"*, hoje provável. Oito dos nove achados confirmados, seis por
unanimidade:

- **Inverte no outro corte.** Sem fronteira: 1,30 defesa contra 1,08 ataque. Com fronteira: 0,81
  defesa contra **1,20 ataque** — o lado se inverte. A frase só existe em um dos cortes.
- **O n não bate com teste nenhum.** Diz "8 contra 48"; o corte que gerou os números usou **8 contra
  32**. Falta o marcador `n_meio_sf` — o 48 foi digitado à mão, contra a regra da casa.
- **"Não aumentar a que se cria"** transforma não-detectado em não-existe: o xG criado tem efeito
  abaixo do mínimo detectável e a frase não diz isso.
- **As réguas não são a mesma:** confiabilidade 0,30 no xG criado contra 0,53 no xG sofrido — parte
  da vantagem defensiva é atenuação de medida, não futebol.
- Falta a marca "pode ser efeito do placar"; e o *o que vimos* usa "d" quatro vezes sem um número em
  unidade de jogo.

O único derrubado foi o mais desleixado ("os dois maiores efeitos são defensivos" — falso, o maior
é de ataque). É assim que o filtro se comporta quando funciona.

### 13.5 Como terminar

1. **Ler `_auditoria_18_09.md`** — é o mapa. O JSON só quando quiser o parecer de cada cético.
2. ~~Julgar as 8 que faltam~~ — **feito em 18/09.** Nada mais a rodar.
3. **Rodar a fase transversal, se valer a pena** (§13.8) — 4 agentes, nunca executada.
4. **Decidir conclusão por conclusão** o que cai, o que vira indício e o que só precisa de texto
   novo. Isso é do dono; a auditoria só instrui.
5. **Só então** sincronizar as tabelas do `_registro.md` (§12.1) — depois da revisão, não antes, para
   não fazer o trabalho duas vezes.

### 13.6 O que não mudou

Nenhum `<ID>.json` foi tocado. As 53 conclusões continuam exatamente como estavam, todas rascunho,
nenhuma validada. A auditoria é um parecer ao lado, não uma correção aplicada. **Os auditores eram
só de leitura e cumpriram** — nenhum arquivo do estudo foi modificado por agente.

### 13.7 Os céticos também corrigiram o auditor

Vale saber, antes de aplicar qualquer correção proposta: **o parecer do cético às vezes é melhor que
o achado e melhor que a correção sugerida.** Em T01-3 o auditor acusou o n de estar inflado por causa
da armadilha da temporada (o ano da data, em vez dos blocos de meses) — procede, e os três céticos
confirmaram. Mas a correção que ele propôs, 497 passagens-temporada, está errada: a lente do número
refez a conta pela regra do A01 e deu **492**. Dois outros achados da mesma conclusão foram derrubados
porque a evidência citada era falsa — T02 não consome as colunas que o auditor acusou.

Ou seja: **leia o campo `pareceres` do JSON antes de aplicar uma `correcao`.** O número certo costuma
estar no parecer, não no achado.

## 14. O que a auditoria NÃO olhou: a fase transversal

A auditoria de 18/09 é toda **por conclusão**: cada frase foi atacada e julgada isoladamente.
**O olhar de conjunto foi desenhado e nunca rodou** — o run foi parado antes dela. Estas quatro
varreduras continuam em aberto, e são 4 agentes (o script está em
`~/.claude/projects/.../workflows/scripts/auditar-conclusoes-estudo-serieb-wf_5e6cb475-6e4.js`,
fase `Cruzar`):

| lente | o que procuraria |
|---|---|
| **contradição** | pares de conclusões que não podem ser ambas verdadeiras, ou o mesmo indicador com sinais opostos entre partes |
| **cascata** | A14 sintetiza A02–A13, A12 depende das réguas, T04 depende de A14/T02/T03 — que conclusão a jusante cai junto com cada achado confirmado |
| **completude** | conclusão que o dado já sustenta e não foi escrita; lacuna declarada que a base na verdade cobre (como o gol de bola parada em A04); ressalva obrigatória faltando |
| **espelhos** | `_registro.md`, este contexto e `static/estudo_serieb_dados.js` contra os `<ID>.json` — o resto do que a §12.1 começou |

**A cascata é a que mais faria falta**, porque 18 conclusões caíram na armadilha da fronteira e
A14 é síntese de quase todas — ninguém conferiu o que a síntese vira depois disso.

### Tentada em 18/09 e falhou no limite do plano

As 4 foram disparadas (run `wf_47b60a2b-ea4`) e **as 4 morreram no limite mensal de gasto**, sem
devolver nada — `agents_error: 4`, retorno `{"lentes":[]}`. O limite semanal reseta às 5h de
Brasília. O script está pronto e é só re-disparar:
`~/.claude/projects/.../workflows/scripts/cruzar-estudo-serieb-wf_47b60a2b-ea4.js`
(ele já recebe os 18 da fronteira e os 23 de confiança alta demais como insumo, e a lente da
cascata já vem com as quatro perguntas (a)-(d) formuladas).

### O custo, para dimensionar
O run principal gastou **16,7 milhões de tokens em 212 agentes**; o dos 24 céticos finais, mais
2,7 milhões. A fase transversal são só 4 agentes, mas cada um lê as 19 partes inteiras.

## 15. A ordem de trabalho daqui para a frente

**A ordem está em `_fonte/estudo_serieb/PLANO.md`** (escrito em 18/09, a pedido do dono): seis
etapas, de quem é cada uma, o que destrava o quê e o custo estimado. O caminho crítico é a **cópia
do Portal Ranking**, que destrava 6 das 8 partes que faltam e não depende da máquina.

### "Pronto" não é o que a auditoria entrega

Para não se enganar ao retomar: **quando a fase transversal rodar, a AUDITORIA estará pronta — o
ESTUDO não.** São coisas diferentes.

A auditoria é **parecer ao lado**. Nenhum `<ID>.json` foi tocado; as 53 conclusões estão exatamente
como estavam, todas rascunho. Os 350 achados confirmados são acusações conferidas, não correções
aplicadas.

Depois da transversal, o que falta é o trabalho de verdade, e a maior parte é decisão do dono:

1. **Decidir, conclusão por conclusão** (são 53): o que cai, o que vira indício, o que só precisa de
   texto novo. A auditoria instrui; quem decide é o dono.
2. **Reescrever os textos** que ficarem, nos `<ID>.json` — e aí valem as correções, lidas junto com
   o campo `pareceres` (§13.7).
3. **Rodar `gerar_estudo_serieb_js.py`** para a aba refletir o que mudou.
4. **Sincronizar as duas tabelas do `_registro.md`** (§12.1), que só então param de mentir.
5. **Validar** — é o passo que transforma rascunho em "O que decidimos", e só o dono dá.

Ou seja: a fase transversal fecha a fase de DIAGNÓSTICO. O conserto é outro trabalho, maior, e
nenhuma linha dele foi feita.

## 16. A cascata rodou (19/09) — a síntese muda, mas não cai

Etapa 0 do `PLANO.md`, feita. Um agente, run `wf_48a4e3f8-e44`. **Oito achados**, em
`_fonte/estudo_serieb/resultados/_cascata_19_09.md` (legível) e `_cascata_19_09.json` (cru).
Ela achou o que a auditoria de 18/09 **não tinha como achar**, porque olhava uma conclusão por vez.

### O veredito, nas palavras dele

A resposta de topo muda, mas não cai. Continua de pé o essencial: quem sobe chuta de mais perto, cede chute de pior qualidade e ganha um pouquinho mais de duelo no chão — e tem elenco mais caro, que não se escolhe. Cai a estabilidade do onze: ela é resultado de ganhar, não causa, e é a única peça sem poder em nenhum dos dois cortes. E há um erro para o outro lado: a bola parada, que o estudo pôs na lista das que não separam, é a que mais separa na base inteira — quem sobe tem cinco gols e meio de saldo de bola parada por temporada contra zero do meio. Já a pergunta do treinador não tem resposta: o bloco T inteiro rodou sem o método da casa e nenhuma conclusão dele pode passar de indício.

### Os quatro que mudam decisão

**1. A porta temporal quase não foi rodada.** Só 3 das 19 partes a rodaram (A02, A06, A13). Dos oito
componentes do índice do A14, **um** passou por ela: o duelo defensivo — e com o rho mais fraco dos
seis que A06 mediu. **27 das 33 conclusões marcadas "firme" estão em partes que nunca rodaram o
teste.** A auditoria pegou 12; escaparam **A03-2, A04-1, A04-2, A05-1, A07-1 e T03-2**.
→ Rodar a porta temporal sobre os oito componentes é **o teste mais barato que resta** (só precisa do
1º e 2º turno que A01 já tem) e é o que decide se a régua descreve o que o time fez ou o que ele é.

**2. A bola parada foi contada errada, para o lado errado.** A04-1 diz "não separa" e está firme.
Mas na base inteira o saldo de bola parada por jogo é firme com folga e **com poder**: mediana
+0,145 contra 0,000 do meio — **cinco gols e meio de saldo por temporada**. Só morre no corte de
8×32, e mesmo lá o efeito é MAIOR (1,231), reprovando por q 0,053 contra a linha de 0,05.
→ "Bola parada" tem de **sair dos cinco "não separa"** da resposta de topo.

**3. A frase mais citada do estudo compara dois cortes diferentes.** "O duelo separa o time (d 1,59)
mas não o titular" — o 1,59 é 8×32 (sem fronteira) e os números do jogador são 16×48 (`J03.py` não
tem uma ocorrência de "fronteira"). **No mesmo corte é 0,805 do time contra 0,535 do volante, e o
intervalo do volante contém o 0,805: a diferença que a frase explica não existe.**
→ Trocar pelos 0,98 ponto percentual (60,8% contra 59,8%) nos **quatro** lugares onde o 1,59 já
está, inclusive `static/estudo_serieb_dados.js`, que é a aba no ar. E tirar "não se compra o duelo;
organiza-se" — a base não mediu treino nem organização.

**4. O bloco do treinador roda fora do método da casa.** Os cinco scripts de T não importam
`_metodo.py` e não conhecem o corte de fronteira; **não existe `T02_testes.csv`, `T03_testes.csv`
nem `T04_testes.csv`**. "Firme" é inalcançável por construção. E `T04.py` nunca abre um arquivo do
A14 — **consertar o A14 não move um número do T04.**
→ Ou o bloco T é reescrito importando o método, ou nenhuma conclusão sobre treinador passa de
indício. É decisão do dono.

### O que isso muda no plano

A etapa 1 (consertar as 53) continua, mas ganha uma tarefa **antes** dela: rodar a porta temporal
sobre os oito componentes do índice. É barata, e sem ela metade das etiquetas de confiança do estudo
é indefensável.

As outras três lentes (contradição, completude, espelhos) **continuam sem rodar**. Depois do que a
cascata achou sozinha, elas ficaram mais interessantes, não menos — mas são higiene perto disto.

## 17. Diagnóstico fechado (19/09): as 3 lentes e a porta temporal

Etapa 0 do `PLANO.md` **completa**. Run `wf_f1f816f5-ac8`, 4 agentes, 687k tokens.
Arquivos: `resultados/_cruzar_19_09.md` e `.json` (as 3 lentes, **27 achados**),
`resultados/_porta_temporal.md`, `.json` e `scripts/_porta_temporal.py` (o teste novo).

### 17.1 A porta temporal — e ela corrige a cascata

**Dois dos oito componentes do índice do A14 passam** — e os dois são a mesma coisa: `dist_remate`,
contado também dentro da régua E. O índice tem **um** componente com prova de anterioridade.

| componente | rho parcial | passa |
|---|---|---|
| `dist_remate` | 0,289 | **sim** |
| `E_qualidade_chance` | 0,254 | **sim** (mas cai para p 0,089 sem o `dist_remate`) |
| `xgc_casa` | 0,134 | não |
| `duelos_def_pct` | 0,092 | não |
| `dd_casa` | −0,026 | não |
| `xg_por_remate_contra` | −0,026 | não |
| `H_dinheiro` | — | não calculável por turno |
| `I_estabilidade_11` | — | não calculável por turno |

**Correção à §16:** a cascata disse que o duelo defensivo era o único que tinha passado. **Não
passou** (parcial +0,092, p 0,416). O que A06 e A02 mediram foi a *persistência do próprio
indicador*, não a porta temporal como a §6.4 a define. **Zero das 19 partes rodaram a porta como a
especificação manda.**

**Ressalva do próprio agente, que vale registrar:** com n = 80 e uma covariável, a parcial
detectável a 80% de poder é ~0,31 — acima de quatro das seis medidas. "Não passa" aqui **não é prova
de ausência**: a porta separa quem tem prova de anterioridade de quem não tem.

### 17.2 As 3 lentes — 27 achados

**Espelhos (10).** O maior: **12 das 19 partes nunca entregaram o `.md`** que três espelhos juram
existir — conferido, só há A01, A02, A03, A04, A06, T01 e T02. Também: T03 aparece na tela como
respondida e não mostra conclusão nenhuma; 107 números chegam à tela com ponto inglês; a aba tem 27
perguntas e três lugares dizem 29; o gerador só olha para um lado e por isso nunca pega número
digitado à mão.

**Completude (10).** A12 mediu o Cai contra o meio nas nove réguas e não publicou uma linha. O A06
disse que a base não tem contra-ataque sofrido, e tem. Cinco conclusões que são puro resultado
negativo ficaram fora de "Parece, mas não é". A cobertura física declarada não bate com a base.
⚠️ **Um achado não confirmado:** "o nome do treinador estava dentro de `dados/` desde 14/09". Conferi
o `serieb_tecnico.csv` e ele tem coluna `Jogador` e 118 colunas — é o export de **jogadores** do
Wyscout, como o próprio CLAUDE.md diz. **Conferir antes de agir**; se procede, muda o sentido do T01.

**Contradição (7).** O A04 manda **não** contratar por duelo aéreo e o J03 manda **pagar** por duelo
aéreo no gol — mesma coluna do Wyscout, e nenhum cita o outro. Um teste só virou três conclusões:
`xg_por_remate_contra` sai **bit a bit igual** em A02 e A06, e o A06-3 diz "confirma o A02 com o
ajuste que faltava" — não houve ajuste, é o mesmo número, e agora o indicador tem **dois q
publicados**. As três conclusões do A13 não podem ser as três verdadeiras. E a premissa do T03 está
de cabeça para baixo: o perfil de jogo não é do clube (rho 0,063) nem do treinador (0,265) — não é
de ninguém.

### 17.3 O estado do diagnóstico

Fechado. Em três rodadas: 53 refutações, 159 julgamentos, 4 lentes transversais e a porta temporal.
**Total de achados: 350 confirmados por conclusão + 8 da cascata + 27 das lentes.**
Nenhum `<ID>.json` foi tocado em nenhuma delas. A etapa 1 do `PLANO.md` — decidir e consertar — é a
próxima, e começa por você.

## 18. A proposta de destino das 53 (19/09) — pronta para validar

Etapa 1.1 do `PLANO.md` instruída. Run `wf_b360eada-8b2`, 20 agentes, 3,13M tokens.
**`resultados/_proposta_destino.md`** (o legível, ordenado pelo peso da mudança) e `.json` (o cru,
com o texto completo de cada conclusão). **Nenhum `<ID>.json` foi tocado.**

Feita **aplicando a régua do CLAUDE.md**, não escolhendo método — correção pedida pelo dono em
19/09, ver a memória `nao-devolver-decisao-ja-escrita`. Só os três níveis dele.

### O que a régua faz com as 53

| | hoje | proposta |
|---|---|---|
| firme | 33 | **2** |
| provável | 13 | **14** |
| indício | 7 | **38** |

**Nenhuma conclusão sai ilesa, e nenhuma cai inteira.** Destino: 43 reescreve, 6 rebaixa,
**4 invertem** (o dado diz o contrário do publicado), 1 só texto. Zero "mantém", zero "cai".

Esforço de cada sim: **39 recálculo**, 13 reanálise, 2 só texto.

### As duas que sobrevivem como firmes

Só o que passou nos dois critérios. A distância da finalização é a única peça da régua com prova de
vir antes do resultado — 19,5 m contra 20,5 m do meio, e já era assim no 1º turno.

### Os quatro pontos de falta de dado — e esses são do dono

O arquivo manda perguntar quando falta dado. Faltou em quatro:

1. **A06-1** — recuperação por altura do campo não existe. Abrir coleta por terço do campo?
2. **A07-2** — falta físico por jogo em 2022–2024; existe no `skillcorner.db` do Portal Ranking.
   Copiar a base para cá? Sem isso A07-2 não passa de provável.
3. **J07-3** — não existe tabela clube → país/liga. Aprovar uma lista montada uma vez, ou a frase
   sobre a Europa cai? Isso também trava J08.
4. **J03-1** — existe export do Wyscout por turno em algum lugar? Sem dado por turno a porta
   temporal não roda em nenhuma conclusão de J03, e o teto do bloco J fica em provável para sempre.

### A conciliação resolveu 13 conflitos entre partes

E escreveu a resposta do estudo em três linhas como ela fica, mais as conclusões que mereceriam
"O que decidimos" depois da validação. Estão no alto do `_proposta_destino.md`.

### Um defeito da própria proposta

Ela devolveu **54** conclusões, não 53: a parte A05 emitiu uma linha extra rotulada
"firme (dentro de A05-1)". Conferir e descartar a duplicata antes de aplicar.

## 19. As bases chegaram e as partes voltaram a rodar (19/09)

### 19.1 As duas cópias — etapa 2 do `PLANO.md`, fechada

O detalhe completo, com data e armadilhas, está em **duas seções novas do `_registro.md`**.
O essencial:

| | onde | o que destravou |
|---|---|---|
| **SkillCorner** | `dados_copiados/skillcorner_serieb.db`, 22 MB | `physical` 3.616 jogador-temporada → **J04, J05, J06** |
| **Wyscout** | `dados_copiados/wyscout/`, 60,4 MB, período `ago26` | 65 ligas + `_temporal_movers` → **J08, J09** |

**Fatiadas, não copiadas inteiras.** A fonte do SkillCorner tem 329 MB e o GitHub recusa arquivo
acima de 100 MB; o estudo usa 4% dela. Scripts reprodutíveis em `scripts/_copiar_*.py`. Nenhuma
credencial copiada; as fontes foram abertas em modo somente-leitura.

**Dois ponteiros do `CLAUDE.md` estavam errados** (somam-se aos 12 de 17/09):
o `skillcorner.db` está no **Portal Skillcorner**, não no Portal Ranking; e o período de ligas não é
`abr26` com "53 ligas, 14 mil jogadores" — nenhum período tem isso. `ago26` tem 65 ligas e 18.460.

**Duas perguntas de "falta dado" da §18 já estão respondidas, e as duas são "não":**
- **A07-2 / A08 / A10 em 2022–2024** — o `physical_match` tem **zero linhas** na fonte também. O
  buraco é do SkillCorner. Nenhuma cópia resolve; só coleta.
- **J08, fator por liga estrangeira** — das 321 transferências para a Série B, só **Brasil A (152)**
  e **Brasil C (90)** passam do piso de 10 casos que o próprio J08 exige. Nenhuma liga estrangeira
  chega a 10. O fator por liga estrangeira **não existe com esta base**.

**De graça:** a escada brasileira está medida. Série C → B perde 0,59 de nível; Série A → B ganha
0,64. É a conta que o clube faz de verdade, e não estava em lugar nenhum do estudo.

### 19.2 J04 entregue — e o par com J03 fecha

**Zero de 204 testes** sobrevivem aos dois cortes de fronteira. O titular de quem sobe é
**fisicamente indistinguível** do titular do meio, em nenhuma das seis posições de linha.
Com o J03 (que já dizia o mesmo do lado técnico), fica: **a vantagem de quem sobe não está no
titular — nem com bola, nem no corpo.** Teto provável (a porta temporal não roda).
Três conclusões, oito arquivos, e o **`.md` que 12 das 19 partes não têm**. Detalhe no `_registro.md`.

### 19.3 Um defeito de método aberto, em duas partes

A conferência do J04 apontou: a **unidade do BH diverge da especificação**. A §6.3 escreve
*"uma família = um pilar × uma comparação"*; **J03 e J04** rodaram família × **setor** × comparação
× corte. Pela §6.3, que vale onde diverge, zero dos 204 passam — a conclusão fica mais forte, mas o
método está errado nas duas partes. **A10 já foi instruída a seguir a §6.3.** Corrigir J03 e J04 é
tarefa aberta.

### 19.4 Três coisas que a base contradisse — valem para J05, J06 e J09

- **`players.team_name` está vazia** nas 2.105 linhas. O nome do clube vem do `physical_match`, que
  só existe em 2025–2026; antes disso, do Wyscout.
- **Nenhuma linha casou por `wyscout_player_id`.** O id existe no SkillCorner (2.079 de 2.105), mas
  **nenhuma base do lado Wyscout neste repositório o carrega**. O casamento é por nome, pela §1.1.
  Se o id entrar do lado Wyscout, ~15 pontos de cobertura voltam.
- **105 goleiros com 900+ minutos não têm uma única linha física** — o SkillCorner não os rastreia.

### 19.5 A ordem, decidida em 19/09

**J04 → J08 → A10**, uma de cada vez. **J05, J06 e J09 seguradas** até A14 e J03 estarem consertados
e validados: as três dependem deles, e a auditoria condenou os dois. Está no `PLANO.md`, etapa 3.

### 19.6 J08 e A10 fecharam — ver §20

⚠️ **Falha minha, registrada:** disparei J08 com o J04 ainda rodando, e depois A10 com o J08 rodando
— contra a regra "uma parte por pedido", que eu mesmo tinha acabado de citar. Os arquivos não
colidiram (cada parte escreve só os seus), mas a conferência do J04 reclamou, com razão, que não deu
para separar quem escreveu o quê dentro da janela.

## 20. J08 e A10 entregues (19/09) — 22 das 27

Com J04, são **três partes novas no mesmo dia**. Detalhe de cada uma no `_registro.md`.

### 20.1 ⚠️ Correção: a escada brasileira que circulou em 19/09 está errada

Eu reportei duas vezes, como achado sólido, que **Série C → B perde 0,59** de nível e
**Série A → B ganha 0,64**. **Está contaminado.** A conferência do J08 mostrou que **189 das 737
linhas não são transferência**: o jogador ficou no **mesmo clube** e foi o **clube** que mudou de
divisão. Os números saíram do `_temporal_movers.json` sem esse filtro. No corte estrito sobram 238
casos, e a conclusão virou **indício** (J08-2), não achado medido.

**Lição para quem usar o `_temporal_movers.json`:** ele mistura quem trocou de clube com quem foi
promovido/rebaixado junto com o clube. Filtre por clube de origem ≠ clube de destino.

### 20.2 J08 — o que resistiu

Veredito da conferência: **"aprovado na aritmética, reprovado no recorte"**.

- **J08-1, firme:** *não existe conversão por liga estrangeira, e não vai existir com esta base.*
  Sete ligas passam do piso de 10 casos, e só porque o destino inclui Série A e C; com destino só
  Série B a maior é Portugal A com 8. O maior fator estrangeiro fica **abaixo do que o sorteio entre
  as sete produz**, e no volume o termo de liga **piora** a previsão fora da amostra. 38 ligas ficam
  com fator de faixa; **18 não têm um caso sequer**.
- **J08-3, firme:** *quem chega guarda menos da metade do destaque que tinha, venha de onde vier.*
  É o achado que sobra e o mais útil para contratar.
- **A família física não é montável** — não há dado físico por temporada em liga de origem nenhuma.
  O fator é **técnico**. **J09 marca "não verificado" em todo alvo estrangeiro.**

**Cópia extra que ele exigiu:** `dados_copiados/wyscout/historico/`, **318 Excels, 69 MB**, períodos
2018–2025 e `jun26` **com o `_pre_filtro/` cru** (o arquivo do período está filtrado por minutos:
Brasil A de `jun26` tem 292 linhas contra 500 no cru). Sem ela o `J08_base.py` não era reprodutível.

### 20.3 A10 — e a nuance que salvou a conclusão

**Zero indicadores físicos** separam Sobe × Meio em 2025, nos dois níveis, nas 4 medidas, nos dois
cortes. **Não existe queda de returno para medir:** a liga inteira perde 74 m por 90, 0,8%.
**O calendário curto não tira corrida — tira ponto:** 1,10 contra 1,37 por jogo, enquanto a corrida
sobe.

**A10-3 é o exemplo de por que se olha dentro do jogador.** O Cai sprinta menos no returno, mas
**dentro do jogador ele sobe** (+20,7 m de alta intensidade contra −8,0 do Meio). O nível cai porque
entra outra gente: 36,0 atletas distintos por meia temporada contra 29,8 do Sobe. **É composição de
elenco, não fadiga.** Sem esse recorte, viraria uma conclusão sobre preparo físico que o dado nega.

### 20.4 Duas lições de método, uma boa e uma ruim

**A boa — A10 fez certo e serve de molde:** família pela §6.3 (um pilar × uma comparação, **sem**
partir por setor), regra de cobertura fixada no código **antes** de medir, e corte de sensibilidade
declarado **junto**, não depois de ver o resultado.

**A ruim — o mesmo defeito apareceu em duas partes:** **robustez mostrada de um lado só.** A
conferência apontou em **J04** e de novo em **A10**. Quando há duas subamostras de robustez e só uma
é citada, o texto vira advocacia. **Vale checar isso em toda parte daqui para a frente.**

### 20.5 O placar

**22 das 27 perguntas respondidas.** Faltam cinco:

| | por quê |
|---|---|
| **J05, J06, J09** | seguradas até A14 e J03 estarem consertados e validados (§19.5) |
| **A08, A09** | sem base em fonte nenhuma; só coleta resolve |

Nada commitado, nada publicado. A **etapa 1 do `PLANO.md`** — aplicar a proposta de destino às 53 e
validar — continua sendo o próximo passo, e começa pelo dono.

## 21. Os números da proposta — e 98 que já estão errados no ar (19/09)

Run `wf_c71fbc17-65c`, 20 agentes, 2,99M tokens.
**`resultados/_numeros_novos.md`** (legível) e `_numeros_novos.json` (cru, com `de_onde` de cada um).
**Nenhum `<ID>.json` foi tocado** — este passo prepara a validação, não a aplica.

| | |
|---|---|
| marcadores calculados | **646**, todos conferidos por **dois caminhos** |
| bloqueados (frase sem número possível) | 13 |
| **números JÁ PUBLICADOS que estão errados** | **98** |
| conflitos entre partes | 15 |
| números que viajam entre partes | 23 |

### 21.1 O achado que não era o objetivo: 98 números errados no ar

O passo era calcular o que faltava. De quebra, ao conferir o que já existia, os agentes acharam
**98 valores errados dentro dos `<ID>.json` — ou seja, na aba.** Não são números da proposta: são
números publicados.

| parte | erros | os piores |
|---|---|---|
| **J07** | 26 | `total_est` 57 → **184**; `cob` 81,7 → 92,9; `sobe_min` 4,3 → 10,6 |
| **J01** | 22 | `n` 3.864 → **3.160**; `gk_med` 25,9 → 21,7 |
| **T01** | 10 | `clube_temporadas` 188 → **180**; `passagens_temporada` 506 → **492** |
| **A07** | 7 | `dist_s` "9631.175" → 9.644 (string com ponto inglês) |
| **A03** | 6 | `xgc_casa_s` 0,736 → 0,80 |
| **A06** | 5 | `porta_dd` 0,319 → **+0,092** |
| **A12** | 5 | `subiram` 6 → **4**; `taxa_env` 27,3 → 18,2 |
| **A01** | 3 | `trave_mediana` 60 → 60,5; `corte_z4_mediana` 39 → 39,5 |
| J02 4 · A05 2 · A11 2 · T02 2 · A02 1 · A04 1 · **J03 1** · T03 1 | | **J03 `dd_time` 1,59 → 0,805** |

Três desses confirmam achados anteriores por um caminho independente: **`passagens_temporada` 492**
é exatamente o número que o cético do T01-3 tinha calculado contra os 497 do auditor;
**`porta_dd` +0,092** é o que a porta temporal mediu; e **`dd_time` 0,805** é o 1,59 corrigido.

**A causa raiz, no caso do A01:** o `A01.py` **não gera** os sete valores de Trave/Sobe — eles só
existem **digitados à mão** no `A01.json`. É a regra de "número por marcador" quebrada na origem.

### 21.2 Os 13 bloqueados

Frases da proposta que não têm como existir. Os dois grupos que importam: **A07 e A11** pedem a
porta temporal do físico e o recorte por estado do jogo — nenhum dos dois existe na base;
e **J07-3** pede a tabela clube → país, que não existe (o mesmo bloqueio do J08).

### 21.3 Quinze conflitos entre partes

O mesmo n com valores diferentes em até onze partes. O maior: **J02 usa `n_sobe` 15, `n_sobe_sf` 7 e
`n` 79** onde o resto do estudo usa **16, 8 e 80**. E 23 números "viajam" — o par 19,5/20,5 da
distância da finalização aparece em A02 e A12; o duelo com fronteira de A06 aparece em J03. Mudar
num lugar e não no outro deixa a tela mentindo.

### 21.4 O que isto muda no plano

A etapa 1.2 (reescrever os `<ID>.json`) agora tem **duas listas**, não uma: o texto novo da proposta
**e** as 98 correções de número. As 98 são independentes da sua decisão sobre o texto — um número
errado é errado em qualquer versão da frase.

## 22. As 79 correções aplicadas (19/09) — os `<ID>.json` mudaram pela primeira vez

Das 98 achadas: **79 aplicadas**, 3 não eram erro, **15 seguradas** por dependerem de decisão de
texto. Detalhe em `resultados/_numeros_novos.md`; registro em `_registro.md`.

**Backup antes de tudo:** `resultados/_backup_pre_correcoes_19_09/`, 89 arquivos. Importante porque
`_fonte/estudo_serieb/` está **untracked** — não há git para desfazer.

**Como foi feito com segurança:** cada valor atual foi conferido contra o que o agente disse que
estava lá **antes** de trocar. **Zero divergências nas 79.** O **tipo** do campo foi preservado
(string continua string): o conserto dos 107 números com ponto inglês é no **gerador**, como a
própria auditoria apontou, e não aqui.

**Nenhum texto, etiqueta de confiança ou conclusão foi tocado.**

**O gerador rodou limpo depois** — 27 perguntas, 22 em rascunho, 5 pendentes. Sem erro no gerador
quer dizer que todo marcador tem valor. Conferido no texto resolvido da aba: 60,5 · 3.160 · 184 · 492.

### 22.1 O que continua errado na tela, e por quê

**O `1,59` ainda está no ar** — mas no texto do **A06-1**, onde ele é o número legítimo do A06 no
corte dele (`d 1.593`, sem fronteira). O que a auditoria condenou foi o **J03** comparar aquele 8×32
com o seu próprio 16×48, e isso **foi corrigido na origem** (`J03.numeros.dd_time` 1,59 → 0,805).
Tirar o 1,59 do texto do A06 é **decisão de texto**, não correção de número.

Pela mesma razão, a aba ainda mostra `d 0.59`, `d 0.425` e `d 1.593` no "o que vimos" do A06-1 — as
palavras proibidas que a auditoria apontou. **Texto é do dono; número é da base.** Esta rodada só
mexeu no segundo.
