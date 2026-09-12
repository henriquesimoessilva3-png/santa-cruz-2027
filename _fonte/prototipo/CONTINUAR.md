# CONTINUAR — aba Protótipo e a expansão 2018-2021

> Estado em 12/09/2026, fim da sessão. Leia este arquivo inteiro antes de agir.
> O mapa geral do projeto está em `_fonte/CONTEXTO.md` (seções de 12/09/2026 no fim).

## 1. O que JÁ está pronto

| arquivo | o que é |
|---|---|
| `_fonte/prototipo/LEVANTAMENTO.md` | o terreno medido antes de projetar |
| `_fonte/prototipo/ESPECIFICACAO.md` | **o método** — 13 seções, escrito por 5 planos + 3 juízes |
| `_fonte/prototipo/TIPOLOGIA.md` | os 4 grupos dos 16 que subiram, com os testes que passou e os que não passou |
| `_fonte/prototipo/tabelas_2018_2021.json` | as 4 tabelas de classificação, transcritas do Flashscore |
| `_fonte/prototipo/extrair_2018_2021.json` | 36 clubes, 80 clube-temporada, 16 acessos |
| `gerar_prototipo.py` | **o gerador, escrito e RODADO** (135 KB) |
| `dados/prototipo.json` | **1,08 MB, 24 chaves — etapas 0 a 15 completas** |

## 2. O que estava rodando quando a sessão acabou

**Workflow `wf_d046db62-f21`** — três céticos recalculando blocos diferentes do
`prototipo.json` por caminho próprio (dinheiro-e-catálogo · pilares-e-tipologia ·
livres-e-elencos). O gerador já devolveu; **os três céticos ficaram no meio**.

Os retornos de quem terminou estão em:
`~/.claude/projects/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-Santa-Cruz/d04c10c6-3785-4e71-a494-989fd871831f/subagents/workflows/wf_d046db62-f21/journal.jsonl`

**`resumeFromRunId` só funciona na sessão de origem.** Numa sessão nova, relance a
conferência do zero: o script está em `_fonte/prototipo/workflow_gerador.js` (cópia do que
rodou). O gerador vai voltar do zero também, mas ele é determinístico (semente 7), então
produz o mesmo JSON — ou, se preferir economizar, edite o script deixando só a fase
`Conferir`, já que o `prototipo.json` está no disco.

**Não publique a aba antes da conferência.** O JSON tem número que ninguém recalculou ainda.

## 3. O que FALTA, em ordem

1. **Conferir o `prototipo.json`** (os três céticos acima).
2. **Construir a tela.** Aba no `templates/index.html`, renderer no `static/app.js`, CSS no
   `static/style.css`. O desenho etapa por etapa está na **seção 10 da ESPECIFICACAO** — o
   dono pediu a construção explícita, não só o fim. Siga o padrão da casa: botão + modal como
   o "Série A × Série B" e o "Sobe × Cai", ou aba própria se for grande demais para modal.
3. **Integrar 2018-2021** (seção 4 abaixo).
4. **Treinador**, por coleta web — decisão do dono: etapa POSTERIOR, não desenhe assumindo.

## 4. Os dados de 2018-2021 que chegaram

### 4.1 Técnico de EQUIPE — `bases wyscout - serie B/bases times serie B - 2021 a 2018.zip`

**76 arquivos de 80.** Um por clube-temporada, no formato `Team Stats <Clube> (N).xlsx` —
o `(N)` é contador de download, **não o ano**.

Estrutura (conferida no Fortaleza 2018): **uma linha por partida**, 109 colunas, com
`Data`, `Jogo`, `Competição`, `Duração`, `Equipa`, `Sistema` e o resto dos indicadores.
É o mesmo formato do `serieb_jogos.csv` (que tem 119 colunas — confira o de-para).

Três coisas que o processador precisa saber:
- **O ano sai da coluna `Data`** (formato `2018-11-23`). Não precisa inferir por elenco.
- **Filtrar `Competição == 'Brazil. Serie B'`** — os arquivos trazem estadual junto
  (o Fortaleza 2018 tem 112 linhas, das quais 76 são Série B).
- **Cada partida aparece DUAS vezes**: a linha do próprio clube e a do adversário. A coluna
  `Equipa` distingue. São 38 jogos × 2 = 76 linhas. O `serieb_jogos.csv` guarda as duas,
  então provavelmente é só concatenar — mas confira antes de assumir.

**FALTAM 4 CLUBE-TEMPORADA, e três subiram:**

| clube | anos que faltam |
|---|---|
| **Atlético-GO** | 2018 (6º) e **2019 (4º — subiu)** |
| **Chapecoense** | **2020 (1º — subiu)** |
| **Paysandu** | 2018 (17º) |

Sem esses três acessos a amostra nova fica em 13, não 16. **Peça ao dono antes de rodar.**

### 4.2 Técnico por JOGADOR — `~/Downloads/serie B - indicadores tecnicos wyscout - jogadores - 2018 a 2021.zip`

8 Excels de 500 linhas × 115 colunas. Mesmo formato do `serieb_tecnico.csv` (118 colunas).

**ARMADILHA: não têm coluna de temporada.** O ano precisa ser inferido cruzando o conjunto de
clubes da coluna `Equipa dentro de um período de tempo seleccionado` com as quatro tabelas do
`tabelas_2018_2021.json`. (A coluna `Equipa` é o clube ATUAL, de 2026 — não serve.)

### 4.3 De-para de nomes

Nove clubes o projeto nunca viu: Boa, Botafogo, Bragantino, Brasil de Pelotas, Confiança,
Figueirense, Oeste, Paraná, São Bento.

Nomes que divergem entre fontes, já conferidos nos arquivos de equipe:
`Red Bull Bragantino`→Bragantino · `Vasco da Gama`→Vasco · `Sport Recife`→Sport ·
`Operário PR`→Operário-PR · `América Mineiro`→América-MG · `Botafogo SP`→Botafogo-SP ·
`Atlético GO`→Atlético-GO. No Flashscore o Oeste aparece como **"Osasco Sporting"** e o
Botafogo como **"Botafogo RJ"**.

**E normalize Unicode antes de comparar nome.** O macOS grava nome de arquivo em NFD e o
JSON está em NFC: `"Avaí" != "Avaí"` e 12 clubes "somem" silenciosamente. Custou um
diagnóstico errado nesta sessão.

## 5. As decisões que NÃO se refazem

- **Não existe agrupamento cego.** Sob o nulo de mesma covariância, k=2 nos 16 dá p=0,555.
  O nulo de embaralhar coluna é INVÁLIDO (destrói a correlação entre indicadores; qualquer
  dado correlacionado o bate). Não reabra isso.
- **A tipologia é em eixos declarados**, e vale porque foi validada em 38 indicadores que
  NÃO a construíram (eta² 0,410 contra 0,238 do nulo placebo, p=0,0012).
- **Físico não existe antes de 2022.** Confirmado NA API, não no banco local: o catálogo tem
  `BRA - Série B - 2019` (id=120) e ela volta com 0 jogadores. Todas as 12 edições mais
  recentes do catálogo com ano ≤ 2021 voltam vazias. Não gaste tempo procurando.
- **Quando 2018-2021 entrar, a aba terá dois universos** — técnico 2018-2025, físico
  2022-2025. Cada número na tela precisa dizer de qual veio.
- **O melhor uso dos anos novos é TESTE, não treino:** congelar os dois eixos e os dois
  cortes nos times de 2022-2025 e aplicá-los cegamente em 2018-2021. Os dois eixos são
  técnicos coletivos, então roda sem físico.
- **Antes de juntar, testar regime:** 2020 foi sem torcida (mando é um dos eixos) e as SAFs
  chegaram por volta de 2021-22.
