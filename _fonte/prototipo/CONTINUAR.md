# CONTINUAR — aba Protótipo, aba por pontos e aba de conclusões

> Estado em **14/09/2026, ~18h**, fim da sessão `3b480dcb`. Substitui a versão do meio-dia de 14/09.
> Leia nesta ordem: **este arquivo** → `PENDENTE_RODADA.md` (os 18 pedidos de 13/09) →
> `CONCLUSOES.md` → `static/proto_contrato.md` (a API da tela). O mapa geral do projeto está em
> `_fonte/CONTEXTO.md`.

## 1. O que está no ar, o que está só no disco

- **Site publicado** (GitHub Pages, commit `1fc3245`, 14/09 17:49), no ar em
  https://henriquesimoessilva3-png.github.io/santa-cruz-2027/. Conferido antes de enviar (16 etapas,
  zero erro, zero arquivo faltando, nada rolando de lado a 1.785 px). Tem: Protótipo em linguagem
  simples, glossário, filtros de liga e idade, etapa 1 por jogador com a tabela dos 80 elencos, etapa 5
  com a linha de quem subiu e as colunas ordenadas pela diferença, etapa 6 com cores, etapa 14 com
  empate técnico. Ainda SEM: aba por pontos, aba de conclusões, tabela de gaps, botão percentil/cru.
- **Local, porta 5090** (servidor do dono — não derrube, não use a 5090 nem a 5091).
- **Git: tudo empurrado** até `1fc3245` (mais o commit deste pacote). O `40fc8d7` (empurrado por um
  agente em 12/09) espera a decisão do dono de reverter ou não.
- **OUTRA SESSÃO TRABALHA NO MESMO REPOSITÓRIO** ("Gols de bola parada por treinador": aba Bola
  parada, Financeiro, Orçamento). Ela escreve `static/app.js`, `app.py`, `templates/index.html`,
  `dados/premissas.json`, `dados/cenarios.json` e `docs/`, commita e publica. Os arquivos não rastreados
  `Squad and Budget.xlsx` e `dados/cenarios.json.bak_pre_orcamento_1409` são dela. Ver regra no §4.
- **Publicar de novo está AUTORIZADO** pelo dono "depois de pronto e conferido".

## 2. O que ficou pronto nesta sessão

| obra | estado | relato |
|---|---|---|
| base da aba por pontos (`gerar_pontos.py`, `ranking_gaps.py`, `dados/pontos.json`) | **APROVADA** (4 rodadas + fecho). **Gerada com o gerador de ANTES do bloco 1**: tem de ser regerada (trava 2) | `sessao_14_09/pontos_journal.json`, `pontos_r3_journal.json` |
| tela: casca, glossário, etapas migradas, largura, limpeza de texto | **APROVADA e publicada** | `sessao_14_09/tela1_journal.json`, `tela2_journal.json`, `tela_limpeza_journal.json` |
| origem dos clubes (`dados/serieb_origem_2018_2026.csv`) | **PRONTA**, com fonte pública | `sessao_14_09/conclusoes_journal.json` |
| gerador, bloco 1 (B0-B8) | **APROVADO e GRAVADO** no `dados/prototipo.json` | `sessao_14_09/gerador1_journal.json`, `sessao_14_09/gerador/` |
| conclusões (`CONCLUSOES.md`, `conclusoes_spec.json`) | **FECHADAS com ressalva** (56: 3 fortes · 11 moderadas · 24 fracas · 13 sem sinal · 5 não dá para afirmar); o conserto final não teve reconferência; e o dado novo mexe em algumas (§2.3) | `sessao_14_09/conclusoes_journal.json`, `conclusoes_fecho_journal.json` |
| etapa 1: valor por jogador em cada setor + tabela aberta dos 80 elencos + Controle 2 corrigido | **APROVADA e publicada** | `sessao_14_09/setores_journal.json` |
| etapa 14 lendo empate técnico e contagem por posição (trava 1) | **APROVADA e publicada** | idem |
| etapa 5: linha de quem subiu nas 11 matrizes + colunas pela diferença sobe × cai | **APROVADA e publicada** | `sessao_14_09/fecho15_journal.json` |
| etapa 6: cores azul claro / laranja pelo desfecho do ano seguinte | publicada, mas **o dono pediu outro desenho** (§2.4, item 1) | — |

### 2.1 Travas (não pular)

1. ~~Trava 1 (tela da etapa 14 antes de regravar o prototipo.json)~~ — **resolvida e publicada**.
2. **Antes de regerar o `pontos.json`**: em `gerar_pontos.py` (~linha 2506), a declaração do gerador
   do erro da margem da etapa 13 tem de virar `[7, 13, id]`, um por atleta, criado dentro da etapa 13,
   tirando o `with rng_do_gerador`; mapear as chaves novas da etapa 14 (`vagas_sem_recomendacao`,
   `empate_tecnico`, `ic95_pct`, `contagem_por`...), a `efeito_de_retirar_2026` da etapa 11, o bloco
   por jogador da etapa 1 e a diferença/ordem da etapa 5 (alta × baixa).
3. **Um dono por arquivo, e nenhum agente faz git que escreva.**
4. **Não tocar nos arquivos da outra sessão** (§1) sem o dono dizer que ela terminou.

### 2.2 Decisões pendentes do dono

- **Cenário B (barato) da etapa 14: exigir valor de mercado maior que zero?** Hoje admite atleta sem
  valor (`admite_sem_valor: true`). Medido (`sessao_14_09/gerador/exp_b8_mv.json`): exigindo valor, a
  Série B troca 7 nomes e o núcleo vai de € 5,4 mi para € 8,75 mi; o sul-americano passa de 0 para 3
  recomendados.
- **Reverter ou não o `40fc8d7`.**
- **A REPETIÇÃO ("se repete de um ano para o outro") como critério — perguntar ao dono no início da
  próxima sessão.** Ele disse, sobre a etapa 6, que não quer o foco de construir e sim a subida no ano.
  A repetição também pesa fora da etapa 6: na porta A do catálogo ("se repete e vem antes do
  resultado"), no desempate dos selos (repetição no clube, 2018-2021) e em conclusões como a FIS-07
  ("o físico se repete"). Confirmar se ela sai desses lugares também (como o desconto do dinheiro) ou
  se a decisão vale só para a etapa 6. Não mexer antes da resposta.

### 2.3 Conclusões — o que ficou

- Ordem de serviço do bloco 2 do gerador: `sessao_14_09/ordem_gerador_bloco2.json` (98 campos) e
  declarações em `sessao_14_09/declaracoes_novas.json`. **Precisam ser revistas** depois de tirar o
  desconto do dinheiro (§2.4, item 3).
- **As cinco hoje, com o que já está gravado:** DIN-02 (forte), J1, J2, ELE-01 e J6 (moderadas).
- **Rodar uma lente rápida sobre o conserto final** (retorno "conserta" em `conclusoes_fecho_journal.json`).
- **O dado novo mexe em conclusões** (conferência de 14/09, `fecho15_journal.json`,
  "confere:efeito-nas-conclusoes"): **DIN-04 e DIN-05** (valor por setor) precisam ser relidas com a
  leitura por jogador — por jogador a defesa não se destaca como na fatia em euros; **DIN-01** usa o
  controle da cobertura (jogadores com preço), que trata o sem preço como dado faltando, contra a
  decisão do dono; nas **físicas**, o desconto hoje junta dinheiro e rodízio de elenco — sem o dinheiro
  falta a conta só com o rodízio (decide o selo de FIS-04 e M4); várias `regra_maquina` fazem coisa
  errada quando o dinheiro sai (ORI-01, A4, ELE-03, J15, A1, DIN-04, DIN-05).

### 2.4 Pedidos em aberto do dono (fim de 14/09)

1. **Etapa 6: o foco é o desempenho do ANO.** Decidido: cada miniatura vira *posição do time no
   indicador (horizontal) × aproveitamento de pontos no MESMO ano (vertical)*, as 80 temporadas
   2022-2025, azul claro quem subiu e laranja quem caiu NAQUELE ano, com a força da relação escrita
   (e se pode ser sorte) e as miniaturas ordenadas da mais forte para a mais fraca. **SEM a pergunta
   "se repete no ano seguinte"**: o dono esclareceu ao fechar ("não quero esse foco de construir; quero
   foco em subida para o ano; a construção é sempre para o ano") — nem o número pequeno fica. O gerador
   grava `etapa_6.mesmo_ano` (rho, p, n e os pontos) declarado antes de medir; `proto_b.js` desenha.
2. **Lista dos jogadores dos 16 times que subiram com os seis números de desmarque** (corridas sem
   bola, a cada 30 min com a bola: total, acima da corrida rápida, para a área, perigosas/quebram
   linha, que receberam a bola, que viraram chute em 10 s), cada um com o percentil entre os jogadores
   do mesmo setor na Série B daquele ano, conferida, numa página (artifact) com filtro. **Estava
   rodando ao fechar** (run `wf_6f778c23-fdb`, só no rascunho): relançar pelo script
   `workflows/desmarques-jogadores-que-subiram-*.js` e montar a página.
3. **Tirar de vez o "descontado o dinheiro"** — rodada própria: régua reescrita, selos das 56
   conclusões e as cinco recalculados, spec, ordem do bloco 2, gerador (portas do catálogo e marcas do
   `ranking_gaps`), textos de todas as etapas, e os pontos do §2.3.
4. **Aba Físico: arrastar os jogadores entre as colunas** — ESPERANDO a outra sessão liberar o
   `static/app.js`; script pronto em `workflows/fisico-arrastar-jogadores-*.js`.
5. **Ideia: caracterizar os TIMES por um conjunto de indicadores** (modelo de jogo) e achar padrão entre
   os de aproveitamento alto, em vez de indicador isolado. A etapa 8 já fez parte disso nos 16 que
   subiram (4 estilos, descritivos). A desenhar com as 80 (ou 160) temporadas, perfis declarados antes.
6. **Ajustes pequenos da etapa 5:** contraste baixo do número da diferença no cabeçalho; "−53 abaixo"
   repete sinal e palavra; a frase dos dois clubes conta jogador-ano (são 204 pessoas distintas).

## 3. A ordem da próxima rodada

1. **Lista dos desmarques** (§2.4, 2): relançar, conferir, montar a página.
2. **Etapa 6 no mesmo ano** (§2.4, 1) + ajustes pequenos da etapa 5 (§2.4, 6).
3. **Tirar o desconto do dinheiro** (§2.4, 3), com a lente rápida do conserto das conclusões e as
   conclusões afetadas pelo dado novo (§2.3).
4. **Gerador, bloco 2** com a ordem de serviço revista; bloco `conclusoes` por último.
5. **Tela, passo 3**: tabela 4·6·8·9 e os dois fora do top 9 (proto_a), tabela de gaps com a linha da
   sorte (proto_a), botão percentil/valor cru (proto_b), conclusões nos slots (proto.js).
6. **`gerar_pontos.py`**: trava 2, regerar `pontos.json`/`pontos.js`.
7. **Aba por pontos na tela** (registro em `index.html`/`app.js` — combinar com a outra sessão).
8. **Aba de conclusões.**
9. **Conferência final** e **publicar** (`publicar_site.py` sem `--push`, conferir no navegador, commit
   só dos próprios arquivos, push).

## 4. Regras de trabalho que custaram caro

- **Nenhum agente faz git que escreva.** Um empurrou o `40fc8d7` para o repositório público.
- **Um dono por arquivo** em escrita paralela. Quem importa o gerador trava o gerador.
- **Outra sessão pode estar no mesmo repositório** (14/09): antes de escrever, olhar `git log`,
  `git status` e as sessões abertas; commitar SÓ os próprios arquivos (`git add` por caminho, nunca
  `-A`); o `publicar_site.py` copia o `static/` inteiro, então a publicação de uma sessão leva o
  trabalho em andamento da outra — conferir o site no ar depois.
- **Não afirmar como a tela vai ficar sem conferir no navegador.** Em 14/09 foi dito que a linha de quem
  subiu apareceria sozinha com o dado novo; não aparecia (a tela só lia meio e caiu).
- **Queda do processo derruba os fluxos** (14/09): os retornos dos agentes ficam no journal da sessão,
  mas o rascunho some; copiar para `_fonte/prototipo/sessao_14_09/` o que importa.
- **Fora do `main`, carregue `G.DECL = G.carregar_declaracao()`** antes de `montar_matriz`; para rodar o
  `main` sem gravar no projeto, troque `G.SAIDA` e use `python3 -B`.
- **O gerador não era determinístico:** `set` de strings muda de ordem a cada execução
  (PYTHONHASHSEED). Qualquer `set` iterado novo → `sorted` ou `dict.fromkeys`.
- **Sorteio global:** etapa nova que sorteia antes desloca as seguintes. Dê gerador próprio.
- **Sorteio depende da ordem das linhas:** semente fixa só vale com ordem fixa; o `ranking_gaps.py`
  ordena por (ano, clube) antes de sortear.
- `etapa_14.propostas[].vagas_detalhe[].recomendacao` é uma LISTA.
- **O número da célula das matrizes é a POSIÇÃO no ranking do ano (0-100), não o valor.**
- **O dono aponta indicadores a olho nas matrizes e nas miniaturas.** Responder com a família de
  testes, a faixa de pontos e a checagem em 2018-2021, e dizer o que o gráfico mostra e o que não mostra.
- **Caça adversarial a uma guarda de texto não converge:** limite o número de rodadas.
- **Queda de rede derruba o fluxo inteiro sem escrever nada** (ENOTFOUND): conferir o journal e relançar.

Journals desta sessão: `~/.claude/projects/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/subagents/workflows/<run>/journal.jsonl`
(a sessão rodou com a pasta do Portal Análise de Performance como diretório). Scripts de todos os
fluxos em `_fonte/prototipo/workflows/`. `resumeFromRunId` não atravessa sessão.

## 5. Decisões do dono (não refazer)

### Em 13/09

Tela em **português de reunião de clube**, vocabulário único em `proto.js` (`ptTamanho`,
`ptAcaso`, `ptSorte`, `ptJunto`, `ptAcerto`, `ptTecnico`) · **toda conclusão com o selo de força**
dito com todas as letras, inclusive fraco e sem sinal · **aba nova por faixa de aproveitamento**
(ritmo do 6º e do 15º: alta >= 53,509%, baixa < 38,377%; espelha as 16 etapas; 2018-2021 entra no
técnico coletivo; Protótipo continua) · **faixa de quem subiu numa linha só** junto das outras
duas · **botão percentil / valor cru** · **tudo aberto, sem clicar** · **filtros de liga,
nacionalidade e idade** · **sem rolagem lateral** · **aba de conclusões no fim**.

### Em 14/09

- **Régua de selos, desempate MODERADO × FRACO: "olhar a lista inteira".** Uma medida só pode ser
  MODERADA se a família de onde saiu tem mais achados do que a sorte produz (p do excesso < 0,05,
  sorteio dos rótulos dentro do ano, semente fixa, 10.000 sorteios).
- **Comparação escolhida DEPOIS de ver os números pode ser MODERADA só se a lista dela tiver mais
  achados que a sorte** (e, enquanto o desconto do dinheiro existir, se sobreviver a ele); senão, teto
  FRACO. J5 (duelo aéreo de quem cai) MODERADO nos últimos quatro anos, com "não se repetiu em
  2018-2021"; A4 e os zagueiros FRACOS.
- **J10: SEM SINAL** pela régua escrita, com "não se viu" e o grupo "dono do jogo" nomeado.
- **"As cinco que você precisa ler" = as cinco MAIS FIRMES**, de qualquer tema.
- **FIS-07 FORTE, apoiada no teste declarado de cada par de anos**; o corte de 0,5 só descreve.
- **Etapa 14: contar por POSIÇÃO, 2.000 réplicas, sorteio próprio por proposta, empate técnico.** (Feito.)
- **Origem dos clubes com fonte pública.** (Feito.)
- **Jogador sem preço no Transfermarkt = valor baixo ou nenhum, não dado faltando.** Conta como
  jogador do elenco; a soma do elenco não fica "por baixo". (Aplicado na etapa 1 e no Controle 2;
  falta a DIN-01, §2.3.)
- **Etapa 1:** tabela aberta dos 80 elencos com valor, jogadores e valor por jogador por setor; valor
  por jogador e fatia do valor ao lado da fatia de jogadores, testes refeitos por jogador; jogador em
  dois clubes na mesma temporada conta nos dois elencos. (Feito.)
- **Etapa 5:** linha de quem subiu nas 11 matrizes no formato das outras (quartis); colunas pela
  diferença entre o time típico que subiu e o que caiu, maior primeiro em módulo, com a diferença no
  cabeçalho; o gerador grava diferença e ordem. (Feito.)
- **Etapa 6:** primeiro, cores pelo desfecho do ano seguinte (feito); depois, **o foco na subida no
  ano** (§2.4, item 1) — só o mesmo ano, sem a repetição ("a construção é sempre para o ano").
- **Desconto pelo valor do elenco ("descontado o dinheiro"): SAI DE VEZ**, dos selos, das portas e da
  tela ("dá para montar elenco valioso gastando pouco"), como rodada própria. As conclusões sobre o
  próprio valor do elenco (DIN-*) continuam.
- **Aba Físico: arrastar jogadores entre as colunas** — esperar a outra sessão liberar o `app.js`.
- **Publicar:** autorizado depois de pronto e conferido; commit só dos próprios arquivos.
- Decididos por regra da casa: corte de 2026 na etapa 11 (bug); os k da tabela da etapa 1 são 4·6·8·9;
  botão Europa com 0 e o motivo, padrão "Todas as ligas"; unidade/definição dos derivados vêm do
  gerador; proposta refeita com outro escopo (16.4) fica para outra rodada.

## 6. O que se mediu

### Em 14/09

- **Desmarques (time inteiro, 2022-2025, a cada 30 min com a bola; subiu · meio · caiu):** para a área
  3,3 · 3,0 · 2,8 (subiu × caiu p 0,03, q 0,09 — pode ser sorte contando os 32 testes); que receberam
  a bola 6,5 · 6,2 · 6,3 (p 0,19); que viraram chute em 10 s 0,91 · 0,85 · 0,82 (p 0,21). Meio-campo
  para a área 2,7 · 2,1 · 1,9 (maior diferença entre os desmarques, 29ª de 293, q 0,15). Laterais
  perigosos 4,8 · 3,9 · 4,0 (FIS-11, fraco). Nenhum acima da linha da sorte; repetição ano a ano
  ρ 0,22 a 0,46. Por jogador: app, aba Físico, grupo "Corridas sem bola" (`obr*` do `jogadores.json`).
- **Etapa 1 por jogador (medianas; subiu · meio · caiu):** defesa € 428 mil · 250 mil · 155 mil por
  jogador; na defesa do time típico que subiu, 34% do valor com 33% dos jogadores; na do que caiu, 28%
  com 32%. 216 jogadores-ano (204 pessoas) aparecem em dois clubes na mesma temporada: 433 linhas,
  € 175,3 mi, dos quais € 87,8 mi são a segunda contagem.
- **Etapa 5, maiores diferenças (técnico do time, posição no ano, subiu − caiu):** distância do chute
  −67,5; chutes no gol % +57,5; xG sofrido −57,5; xG por chute +52,5. Elenco: concentração de minutos
  +52,5; atletas com 300+ min −52,5; atletas usados −51,3.
- **Origem 2019-2025:** quem caiu da Série A subiu 11 de 28 e caiu 0; já na B 13 e 23 de 84; da C
  4 e 5 de 28. Selo FRACO (A) e SEM SINAL (C).
- **Tabela de gaps:** por posição, linha da sorte 37,78 (7 acima); por faixa de pontos, 32,17.
- **Valor cru × percentil:** em 91 dos 293 indicadores a ordem das faixas no valor cru difere da do
  percentil.
- **Etapa 11 sem 2026:** pares de quem mudou de clube 233 → 176; de quem ficou 178 → 144.
- **Nacionalidade:** dos 603 candidatos, 63 brasileiros; 16 dos 126 goleiros.

### Em 13/09 (detalhe e fontes no `PENDENTE_RODADA.md`)

- **Os mais caros:** dos 16 que subiram, 10 no top 4 do valor, 12 no top 6 e no top 8, 14 no top 9.
  Fora do top 9: Criciúma 2023 (12º) e Chapecoense 2025 (18º de 20).
- **Quem cai finaliza pior, nos dois períodos:** finalizações no alvo e chance por finalização.
- **Quem sobe ganha mais duelos** (time inteiro, repete em 2018-21).
- **Físico:** quem cai quase nunca tem intensidade boa (1 de 16 no top 5), mas pode ser sorte.
- **XI mais usado:** forte no mesmo ano (ρ 0,55 com os pontos), zero de um ano para o outro.
- **Etapa 7:** 4 de 28 números do 1º turno preveem o 2º além dos pontos; nenhum chega aos próprios
  pontos (0,50).
- **Nomes da etapa 14:** lista para observar, não recomendação (a nota não previu quem rendeu).
