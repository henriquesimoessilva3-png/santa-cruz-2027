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

## 2. A CONFERÊNCIA DO JSON TERMINOU — e reprovou. NÃO PUBLIQUE A TELA.

Os três céticos do `wf_d046db62-f21` fecharam depois deste pacote ser escrito. **Os três
disseram `ajustar`: 28 divergências e 40 buracos.** Os vereditos completos estão em
`_fonte/prototipo/conferencia_do_json.json` (chave `confs`). O `dados/prototipo.json` como
está **não pode virar tela** — e o que reprova não é detalhe de formatação.

### O que reprova de verdade, em ordem de gravidade

1. **São TRÊS pilares, não quatro.** A etapa 5 se chama "os quatro pilares" e os painéis são
   só `tecnico_col`, `tecnico_ind` e `fisico_col`. **O físico individual não tem painel.** É
   exatamente o que o dono pediu, e não está lá.
2. **A nota de encaixe tem a orientação INVERTIDA nos indicadores de tempo.** O candidato é
   medido em percentil invertido (100−p) e o alvo em percentil cru de segundos. Quem sobe é
   MAIS RÁPIDO, então a nota está premiando o mais lento nesses indicadores. Isso recomenda o
   jogador errado — é o defeito mais caro do arquivo.
3. **O portão de persistência (ρ ≥ 0,30) não é aplicado**, e `t505_90` reprova nele (0,205).
   Ou seja, entra no score um indicador que a própria regra manda excluir.
4. **O backtest não testou a nota publicada** — esqueceu o filtro `campos_fis`. E **169 das
   716 chegadas pontuadas são de 2026** (24%), violando a regra da casa de que 2026 não entra
   em média nenhuma.
5. **`coluna_csv` dos 92 indicadores técnicos individuais não existe em arquivo nenhum.**
   Conferido nas 346 colunas do painel e nas 118 do técnico. São referências quebradas.
6. **151 dos 603 candidatos (25%) carregam um critério que a própria tabela do JSON
   contradiz** ("nenhum indicador do bloco sobreviveu", quando `psv5` na zaga sobrevive com
   p=0,0074).
7. **Elenco sul-americano: 4 a 6 das 15 vagas voltam vazias** — nenhum nome chega a 10% nas
   200 réplicas.
8. **Imputação escondida de zero** no contrafactual do dinheiro (7 a 10 dos 15 nomes do núcleo
   entram sem valor), e o contrafactual **compara duas réguas diferentes** (`mv` do
   jogadores.json ago26 contra `valor_eur` do Transfermarkt 2025).
9. **A largura da faixa do elenco é uma constante inventada e não publicada**
   (`erro = max(0,02; 0,30/√sc_n)`), e vale 65% do desvio-padrão real da nota.
10. **`remates_baliza_pct` tem confiabilidade −0,021** e mesmo assim sobrevive ao BH e ganha
    selo de Porta B. Medida sem sinal nenhum passando por achado.

### O que a conferência APROVOU, e não precisa refazer

- **Os painéis da etapa 5** (4.688 células) — reimplementados do zero e batem: "este é o bloco
  mais sólido do arquivo".
- **A tipologia da etapa 8** — filiação e cortes reproduzem sem exceção.
- E dois achados a favor: o `TIPOLOGIA.md` tem as **médias de eixo erradas nos quatro grupos**
  (o JSON está certo, o documento é que está errado), e a **ESPECIFICACAO erra** em pelo menos
  dois pontos (a tabela da §6.5 sobre `min_estrangeiros` e a promessa da §11.2 sobre o caliper).

### Por onde continuar

Use a mesma máquina das Ondas 1 e 2, que funcionou duas vezes: **um agente por bloco corrige,
um cético confere, e só então o JSON é regerado.** Os dez itens acima são a lista de trabalho.
Depois disso, e só depois, a tela.

## 2b. O que estava rodando quando a sessão acabou

**Workflow `wf_d046db62-f21` — TERMINOU** (4 de 4 agentes, nenhum erro). O resultado está na
seção 2 acima e o arquivo completo em `_fonte/prototipo/conferencia_do_json.json`.

Os retornos de quem terminou estão em:
`~/.claude/projects/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-Santa-Cruz/d04c10c6-3785-4e71-a494-989fd871831f/subagents/workflows/wf_d046db62-f21/journal.jsonl`

**`resumeFromRunId` só funciona na sessão de origem.** Numa sessão nova, relance a
conferência do zero: o script está em `_fonte/prototipo/workflow_gerador.js` (cópia do que
rodou). O gerador vai voltar do zero também, mas ele é determinístico (semente 7), então
produz o mesmo JSON — ou, se preferir economizar, edite o script deixando só a fase
`Conferir`, já que o `prototipo.json` está no disco.

**Não publique a aba antes da conferência.** O JSON tem número que ninguém recalculou ainda.

## 3. O que FALTA, em ordem

1. **Corrigir os dez defeitos da seção 2** e regerar o `prototipo.json`. A conferência já foi
   feita e reprovou; não é preciso conferir de novo antes de corrigir.
2. **Construir a tela.** Aba no `templates/index.html`, renderer no `static/app.js`, CSS no
   `static/style.css`. O desenho etapa por etapa está na **seção 10 da ESPECIFICACAO** — o
   dono pediu a construção explícita, não só o fim. Siga o padrão da casa: botão + modal como
   o "Série A × Série B" e o "Sobe × Cai", ou aba própria se for grande demais para modal.
3. **Integrar 2018-2021** (seção 4 abaixo).
4. **Treinador**, por coleta web — decisão do dono: etapa POSTERIOR, não desenhe assumindo.

## 4. Os dados de 2018-2021 que chegaram

### 4.1 Técnico de EQUIPE — `bases wyscout - serie B/bases times serie B - 2021 a 2018.zip`

**80 de 80 — completo em 12/09, com os quatro que o dono mandou no fim da sessão.**
Os arquivos estão EXTRAÍDOS em `_fonte/serie_b_jogos_2018_2021/` (80 `.xlsx`) e o manifesto
conferido, em `_fonte/prototipo/manifesto_2018_2021.json`.

Formato `Team Stats <Clube> (N).xlsx` — o `(N)` é contador de download, **não o ano**.
Estrutura: **uma linha por (partida, equipe)**, 109 colunas, com `Data`, `Jogo`, `Competição`,
`Duração`, `Equipa`, `Sistema`. É o mesmo formato do `serieb_jogos.csv` (119 colunas —
o de-para é parte do trabalho).

#### O que o processador precisa saber

- **A TEMPORADA NÃO SAI DO ANO DA DATA.** Esta linha dizia o contrário e estava errada.
  Os **20 clubes de 2020** atravessam o ano civil: a Série B 2020 foi de 08/08/2020 a
  30/01/2021, por causa da covid. O Chapecoense tem 62 jogos datados em 2020 e **14 em 2021**.
  Quem filtrar por `Data.year` racha a temporada 2020 inteira — e justo o campeão daquele ano,
  que é o caso que o teste cego mais precisa. **A temporada sai do arquivo** (ano do primeiro
  jogo de Série B naquele arquivo), nunca da data da linha.
- **Filtrar `Competição == 'Brazil. Serie B'`** — os arquivos trazem estadual, Copa do Brasil,
  Copa Verde e amistoso junto.
- **Cada partida aparece DUAS vezes**: a linha do próprio clube e a do adversário, distinguidas
  pela coluna `Equipa`. São 38 × 2 = 76 linhas de Série B por arquivo. Depois da dedup por
  (temporada, Data, Jogo, Equipa): **3.038 linhas, 80 equipe-temporada** — contra 3.036 das 80
  temporadas completas de 2022-2025.

#### Dois buracos, um que custa e outro que não

- **`Team Stats Vila Nova (7).xlsx` saiu VAZIO** — duas linhas de rótulo ("Vila Nova" /
  "Adversários") e nenhuma partida. Era o Vila Nova 2019. **Não custa nada:** como cada jogo
  está no arquivo dos dois clubes, os 38 jogos do Vila Nova estão inteiros nos arquivos dos
  outros 19. Reconstruindo pela união, fecha 80 de 80. Já conferido.
- **Falta uma partida no Wyscout inteiro: Cuiabá × Figueirense de 2019.** Por isso esses dois
  têm 37 jogos naquele ano, e 2019 tem 379 partidas contra 380 dos outros três. É buraco da
  fonte. Registre, não conserte.

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
