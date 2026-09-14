# CONTINUAR — aba Protótipo, aba por pontos e aba de conclusões

> Estado em **14/09/2026**, fim da sessão `3b480dcb`. Substitui a versão de 13/09.
> Leia nesta ordem: **este arquivo** → `PENDENTE_RODADA.md` (os 18 pedidos do dono) →
> `CONCLUSOES.md` → `static/proto_contrato.md` (a API da tela). O mapa geral do projeto está em
> `_fonte/CONTEXTO.md`.

## 1. O que está no ar, o que está só no disco

- **Site publicado em 14/09** (GitHub Pages, commit `c738109`, a pedido do dono): o Protótipo em
  linguagem simples, sem rolagem lateral, com glossário e filtros de liga e idade. Conferido antes
  de enviar (16 etapas, zero erro, zero arquivo faltando) e no ar em
  https://henriquesimoessilva3-png.github.io/santa-cruz-2027/. Ainda SEM a aba por pontos, a aba de
  conclusões e a etapa 14 com empate técnico.
- **Local, porta 5090** (servidor do dono — não derrube, não use a 5090 nem a 5091).
- **Git: tudo empurrado** (`origin/main` = `main`). Commits de 14/09: `d491147` base da aba por
  pontos · `6ebdf5a` tela do Protótipo · `e960a74` origem dos clubes · `d5856fc` primeiro bloco do
  gerador · `e2b12b7` pacote · `4563c56` conclusões · `c738109` site. O `40fc8d7` (empurrado por um
  agente em 12/09) espera a decisão do dono de reverter ou não.
- **Publicar de novo está AUTORIZADO** pelo dono "depois de tudo pronto" — ver §3, passo 8.

## 2. O que ficou pronto nesta sessão, e o que não

| obra | estado | onde está o relato |
|---|---|---|
| base da aba por pontos (`gerar_pontos.py`, `ranking_gaps.py`, `dados/pontos.json`) | **APROVADA** depois de 4 rodadas + fecho: números conferidos, zero achado circular, linha da sorte independente da ordem das linhas, limites da guarda escritos no módulo. **Gerada com o gerador de ANTES do bloco 1**: tem de ser regerada (§3, passo 5) | `sessao_14_09/pontos_journal.json`, `pontos_r3_journal.json` |
| tela, passos 1 e 2 + limpeza (`static/proto*.js`, `style.css`, `proto_glossario.js`, `proto_contrato.md`) | **APROVADA** no navegador sem janela: 16/16 etapas, zero erro, zero caixa rolando de lado a 1.785 px (eram 31), nada cortado a 400 px, nenhum número mudou; a mesma casca desenha o PONTOS sem erro | `sessao_14_09/tela1_journal.json`, `tela2_journal.json`, `tela_limpeza_journal.json` |
| origem dos clubes (`dados/serieb_origem_2018_2026.csv`) | **PRONTA**, com fonte pública ano a ano, conferida contra os CSVs e o jogo a jogo | `sessao_14_09/conclusoes_journal.json` (retorno "origem") |
| gerador, bloco 1 (`gerar_prototipo.py`, degraus B0 a B8) | **CÓDIGO APROVADO**; `dados/prototipo.json` **NÃO REGRAVADO** (trava §2.1) | `sessao_14_09/gerador1_journal.json`, `sessao_14_09/gerador/` |
| conclusões (`CONCLUSOES.md`, `conclusoes_spec.json`) | **FECHADAS com uma ressalva**: 56 conclusões — 3 fortes · 11 moderadas · 24 fracas · 13 sem sinal · 5 não dá para afirmar. Documento e spec saem da mesma fonte e batem campo a campo (prova por script). O conserto final (12 itens, entre eles J17 voltando a FRACO) **não passou por reconferência** | `sessao_14_09/conclusoes_journal.json`, `conclusoes_fecho_journal.json`; ver §2.3 |

### 2.1 Travas (não pular)

1. **Não gravar `dados/prototipo.json` nem `static/prototipo.js` antes de o `proto_c.js` trocar a
   condição de "vaga sem nome"** (hoje ~linha 2460, pela presença das chaves e `alternativas`
   vazio) para `recomendacao`, `empate_tecnico` e `alternativas` vazios, e passar a ler
   `empate_tecnico`, `ic95_pct` e as chaves novas da etapa 14. Medido no B8: 7 posições completas
   apareceriam como vazias.
2. **Antes de regerar o `pontos.json`**: em `gerar_pontos.py` (~linha 2506), a declaração do
   gerador do erro da margem da etapa 13 tem de virar `[7, 13, id]`, um por atleta, criado dentro
   da etapa 13 (o gerador do Protótipo não usa mais o sorteio global ali), tirando o
   `with rng_do_gerador`; mapear as chaves novas da etapa 14 (`vagas_sem_recomendacao`,
   `empate_tecnico`, `ic95_pct`, `contagem_por`...) e a `efeito_de_retirar_2026` da etapa 11.
3. **Um dono por arquivo, e nenhum agente faz git que escreva** (continua valendo).

### 2.2 Decisão pendente do dono

**Cenário B (barato) da etapa 14: exigir valor de mercado maior que zero?** Hoje o filtro admite
atleta sem valor (`admite_sem_valor: true`, declarado em `propostas[].filtro_do_cenario`), e no B
sul-americano 223 dos 575 candidatos e os 2 empatados do VOL não têm valor. Medido no rascunho
(`sessao_14_09/gerador/exp_b8_mv.json`): exigindo valor, a Série B troca 7 nomes e o núcleo vai de
€ 5,4 mi para € 8,75 mi; o sul-americano passa de 0 para 3 recomendados. Na tela, mostrar
`admite_sem_valor` ao lado da regra, seja qual for a decisão.

### 2.3 Conclusões — o que ficou

O fecho (`_fonte/prototipo/workflows/conclusoes-fecho-wf_c5352b61-ab8.js`) terminou: aplicou a
reconferência de três lentes e as decisões do dono de 14/09 (§5), passou por duas lentes e um
conserto final. Gravou a **ordem de serviço do segundo bloco do gerador** em
`sessao_14_09/ordem_gerador_bloco2.json` (98 campos, cada caminho não gravado do spec com campo
nela) e as declarações em `sessao_14_09/declaracoes_novas.json`.

- **As cinco hoje, com o que já está gravado:** DIN-02 (forte), J1, J2, ELE-01 e J6 (moderadas).
  DIN-01 e FIS-07 (fortes) só entram quando o gerador gravar os campos que decidem o selo delas.
- **Antes do bloco 2 do gerador, rode uma lente rápida** sobre o conserto final (retorno
  "conserta" em `conclusoes_fecho_journal.json`): ele não teve reconferência. Pontos que as lentes
  levantaram e o conserto disse ter tratado: selo como algoritmo (operador e limiar em cada
  critério, não em prosa), semente [SEMENTE, 13, i] do excesso por setor colidindo com o gerador
  por atleta da etapa 13, regra da comparação declarada antes para o que não é linha do catálogo,
  definição do resíduo por ano da FIS-06/FIS-11, as 10 métricas da FIS-07, título da DIN-05,
  FIS-10 apoiada numa medida só e no limite, título da ORI-01 afirmando ausência.

Journals desta sessão ficam em
`~/.claude/projects/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/subagents/workflows/<run>/journal.jsonl`
(a sessão rodou com a pasta do Portal Análise de Performance como diretório; os scripts de todos
os fluxos estão copiados em `_fonte/prototipo/workflows/`). `resumeFromRunId` não atravessa sessão.

## 3. A ordem da próxima rodada

1. **Conclusões**: uma lente rápida sobre o conserto final (§2.3) e a decisão pendente do cenário
   barato (§2.2).
2. **Gerador, bloco 2** (`gerar_prototipo.py`, um agente só, saída no rascunho): aplicar
   `declaracoes_novas.json` em `dados/prototipo_indicadores.json` ANTES de medir; gravar os campos
   de `ordem_gerador_bloco2.json` (análises novas declaradas: comparações escolhidas depois de ver,
   `etapa_6.mesmo_ano`, excesso por família com 10.000 sorteios, comparação físico × técnico com a
   mesma régua, `curva_top_k.ks_da_tabela` com 4·6·8·9, valor do k-ésimo elenco, unidade e
   definição dos derivados, `regua.selos_simples`); o bloco `conclusoes` por último, com selo
   calculado e as cinco mais firmes; e o que o bloco 1 deixou: gerador próprio para o bootstrap e o
   cemitério da etapa 8 (muda números das etapas 2 e 8), a porta da etapa 2 sobre o rho cru, marcar
   nas etapas as 38 colunas de resultado e as 54 de consequência que a guarda acusa, ligar o físico
   da etapa 11 por nome + nascimento (20 pares de homônimos), e gravar junto da faixa do
   contrafactual quantos nomes do núcleo são alternativa e a distância até o próximo.
3. **Tela, passo 3** (um dono por arquivo; lê o JSON novo do rascunho): `proto_c.js` (trava 1,
   empate técnico, filtro de nacionalidade), `proto_b.js` (linha da faixa de quem subiu, botão
   percentil/valor cru, relação do mesmo ano na etapa 6), `proto_a.js` (tabela 4·6·8·9 e os dois
   fora do top 9; tabela de gaps com a linha da sorte e as três marcas), `proto.js` (conclusões nos
   slots já prontos).
4. **Gravar `dados/prototipo.json`** e rodar `gerar_prototipo_js.py`, só depois do passo 3.
5. **`gerar_pontos.py`**: trava 2, regerar `pontos.json` e `pontos.js`, diff limitado ao esperado.
6. **Aba por pontos na tela**: frases próprias (hoje dizem "quem subiu"), etapa 0 por universo
   (`ptCascaContagemFaixas` ainda lê `etapa_0.alta`), registro da aba em `index.html`/`app.js`.
7. **Aba de conclusões** (item 18), a última da barra, com o mesmo componente dos slots.
8. **Conferência final** a 1.785 e a 400 px nas três abas; montar `docs/` com
   `python3 publicar_site.py` (sem `--push`), abrir no navegador; commit; **publicar** com
   `python3 publicar_site.py --push` (autorizado; empurra também os commits locais).

## 4. Regras de trabalho que custaram caro

- **Nenhum agente faz git que escreva.** Um empurrou o `40fc8d7` para o repositório público.
  Escreva a proibição em todo prompt.
- **Um dono por arquivo** em escrita paralela. Quem importa o gerador trava o gerador.
- **Fora do `main`, carregue `G.DECL = G.carregar_declaracao()`** antes de `montar_matriz`; para
  rodar o `main` sem gravar no projeto, troque `G.SAIDA` e use `python3 -B`.
- **O gerador não era determinístico:** `set` de strings muda de ordem a cada execução
  (PYTHONHASHSEED). Qualquer `set` iterado novo → `sorted` ou `dict.fromkeys`.
- **Sorteio global:** etapa nova que sorteia antes desloca as seguintes. Dê gerador próprio.
- **Sorteio depende da ordem das linhas** (achado em 14/09): semente fixa só vale com ordem fixa;
  o `ranking_gaps.py` ordena por (ano, clube) antes de sortear.
- `etapa_14.propostas[].vagas_detalhe[].recomendacao` é uma LISTA.
- **O número da célula das matrizes é a POSIÇÃO no ranking do ano (0-100), não o valor.**
- **O dono aponta indicadores a olho nas matrizes.** É garimpo: responder com a família de testes,
  o desconto do dinheiro, a faixa de pontos e a checagem em 2018-2021.
- **Caça adversarial a uma guarda de texto não converge** (14/09, quatro rodadas na guarda de
  circularidade): a proteção principal é tirar a coluna antes do teste; a guarda é rede de
  segurança, com os limites escritos. Limite o número de rodadas.
- **Queda de rede derruba o fluxo inteiro sem escrever nada** (ENOTFOUND em 14/09): conferir o
  journal e relançar.

## 5. Decisões do dono (não refazer)

### Em 13/09

Tela em **português de reunião de clube**, vocabulário único em `proto.js` (`ptTamanho`,
`ptAcaso`, `ptSorte`, `ptJunto`, `ptAcerto`, `ptTecnico`) · **toda conclusão com o selo de força**
dito com todas as letras, inclusive fraco e sem sinal · **aba nova por faixa de aproveitamento**
(ritmo do 6º e do 15º: alta >= 53,509%, baixa < 38,377%; espelha as 16 etapas; 2018-2021 entra no
técnico coletivo; Protótipo continua) · **faixa de quem subiu numa linha só** junto das outras
duas · **botão percentil / valor cru** · **tudo aberto, sem clicar** · **filtros de liga,
nacionalidade e idade** · **sem rolagem lateral** · **aba de conclusões no fim**.

### Em 14/09 (sessão `3b480dcb`)

- **Régua de selos, desempate MODERADO × FRACO: "olhar a lista inteira".** Uma medida só pode ser
  MODERADA se a família de onde saiu tem mais achados do que a sorte produz (p do excesso < 0,05,
  sorteio dos rótulos dentro do ano, semente fixa, 10.000 sorteios; o elenco está na fronteira,
  0,045 a 0,052). Efeito medido: J4 segue moderado; J7, FIS-06, FIS-08 e FIS-11 viram fracos.
- **Comparação escolhida DEPOIS de ver os números pode ser MODERADA só se a lista dela tiver mais
  achados que a sorte E se ela sobreviver ao desconto do dinheiro**; senão, teto FRACO. Efeito:
  J5 (duelo aéreo de quem cai) fica MODERADO nos últimos quatro anos, com "não se repetiu em
  2018-2021" escrito; A4 (vantagem de casa entre períodos) e os zagueiros seguem FRACOS.
- **J10: segue a régua escrita — SEM SINAL**, com a frase "não se viu" e o grupo "dono do jogo"
  nomeado (os 5 entre os 3 elencos mais caros do ano).
- **"As cinco que você precisa ler" = as cinco MAIS FIRMES**, de qualquer tema (selo mais forte,
  desempate pelo número mais firme). Fracas e sem sinal continuam no documento e na aba, por tema.
- **FIS-07 continua FORTE, apoiada no teste declarado de cada par de anos**; o corte de 0,5 fica só
  como descrição do tamanho (foi escrito depois de olhar).
- **Etapa 14: contar por POSIÇÃO (não por vaga), 2.000 réplicas, sorteio próprio por proposta e
  marca de empate técnico.** Os nomes mudam; o motivo fica gravado no JSON. (Feito no bloco 1: de
  60 posições, 1 mudou de recomendado para empate entre B7 e B8.)
- **Origem (veio da A / da C / já estava na B): montar a lista pública com fonte**, ano a ano,
  conferida contra o jogo a jogo, gravada como base; a conclusão só vai para a tela depois. (Feito.)
- **Publicar na web: AUTORIZADO pelo dono em 14/09, "depois de tudo pronto".** Só depois de a
  rodada inteira fechar e de o `docs/` montado pelo `publicar_site.py` abrir no navegador sem erro.
  Publicar = commitar o trabalho e rodar `python3 publicar_site.py --push`, que empurra também os
  commits locais. O `40fc8d7` continua sendo decisão separada do dono.
- Decididos na rodada sem pergunta, por regra da casa: corte de 2026 na etapa 11 (bug); os k da
  tabela da etapa 1 são os aprovados (4 · 6 · 8 · 9), gravados como lista declarada; botão Europa
  aparece com 0 e o motivo, padrão "Todas as ligas"; unidade/definição dos derivados vêm do
  gerador, o glossário estático cobre as colunas brutas; proposta refeita com outro escopo (16.4)
  fica para outra rodada.

## 6. O que se mediu

### Em 14/09

- **Origem 2019-2025:** quem caiu da Série A subiu 11 de 28 e caiu 0; quem já estava na B subiu 13
  de 84 e caiu 23; quem subiu da C, 4 e 5 de 28. Pelo valor do elenco (2022-2025) era esperado
  quase isso (6 subidas contra ~7): selo FRACO; da C, SEM SINAL. As 39 origens que vinham de
  memória estavam certas.
- **Tabela de gaps:** por posição, linha da sorte 37,78 (7 acima); por faixa de pontos, 32,17;
  sobrevivem ao desconto dos testes 24 (por posição), 19 também ao dinheiro, 5 são consequência do
  resultado.
- **Valor cru × percentil:** em 91 dos 293 indicadores a ordem das faixas no valor cru difere da do
  percentil (3 só por empate) — a legenda do botão cru tem de dizer isso.
- **Etapa 11 sem 2026:** pares de quem mudou de clube 233 → 176; de quem ficou 178 → 144; rho
  mediano 0,399 → 0,396. O físico (SkillCorner) não tinha 2026.
- **Nacionalidade:** dos 603 candidatos, 63 brasileiros, nenhum com passaporte brasileiro e outra
  nacionalidade; 16 dos 126 goleiros brasileiros.

### Em 13/09 (detalhe e fontes no `PENDENTE_RODADA.md`)

- **Os mais caros:** dos 16 que subiram, 10 no top 4 do valor, 12 no top 6 e no top 8, 14 no top 9
  (palpite do dono: 14 no top 8 — não se confirma). Fora do top 9: Criciúma 2023 (12º) e
  Chapecoense 2025 (18º de 20).
- **Valor por setor:** quem sobe gasta mais em todos; a defesa sozinha separa tanto quanto o total
  (84 contra 83 pares, intervalo cruza zero — empate); % do elenco na defesa é sinal fraco.
- **Quem cai finaliza pior, nos dois períodos:** finalizações no alvo (repete em 2018-21 e prevê o
  2º turno) e chance por finalização (repete pela faixa de pontos). **Só em 2022-25:** xG sofrido,
  finalizações sofridas, PPDA, duelo aéreo. **Sem diferença:** recuperações, entradas na área,
  cruzamentos.
- **Quem sobe ganha mais duelos** (time inteiro, repete em 2018-21); no duelo defensivo do meio,
  quem destoa é quem sobe.
- **Físico:** quem cai quase nunca tem intensidade boa (1 de 16 no top 5), mas descontados dinheiro
  e tamanho do elenco pode ser sorte; distância total não separa.
- **XI mais usado:** forte no mesmo ano (ρ 0,55 com os pontos), zero de um ano para o outro —
  consequência de resultado.
- **Etapa 7:** 4 de 28 números do 1º turno preveem o 2º além dos pontos (distância do chute,
  finalizações no alvo, passes ao terço final, cruzamentos); nenhum chega aos próprios pontos (0,50).
- **Nomes da etapa 14:** a correção do sinal trocou 6, 10 e 7 de 15 vagas; o não-determinismo
  trocava 1-2 por rodada; a nota não previu quem rendeu (teste de volta). Lista para observar, não
  recomendação.
