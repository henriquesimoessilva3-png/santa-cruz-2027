# CONTINUAR — aba Protótipo, aba nova por pontos e aba de conclusões

> Estado em **13/09/2026**, fim da sessão `86429f10`. Substitui a versão de 12/09.
> Leia nesta ordem: **este arquivo** → `PENDENTE_RODADA.md` (18 pedidos do dono, com números
> medidos) → `CONCLUSOES.md` → `CONFERENCIA.md` (laudo de 12/09). O mapa geral do projeto está em
> `_fonte/CONTEXTO.md`.

## 1. O que está no ar, o que está só no disco

- **Site publicado** (GitHub Pages, commit `f9bf866`): o Protótipo ANTES da linguagem simples.
- **Local, na porta 5090** (servidor do dono — não derrube, não use a 5090 nem a 5091): a aba
  Protótipo reescrita em linguagem simples, 16 etapas, zero erro, etapa 1 já com a curva dos mais
  caros, a resposta ao palpite e o valor por setor.
- **Git:** 3 commits locais NÃO empurrados — `3bf9aa4` (base 2018-2021), `d423103` (gerador e
  conferência), `29272c4` (aba). O `40fc8d7` foi commitado E empurrado por um agente sem
  autorização em 12/09; o dono ainda não decidiu se reverte (`git revert --no-edit 40fc8d7`).
- **Não commitado** (commit/push só com pedido do dono): `gerar_prototipo.py` (faixa de quem subiu,
  faixas no valor cru, conserto de determinismo, blocos novos da etapa 1), `dados/prototipo.json`,
  `static/prototipo.js`, `static/proto*.js` reescritos, `static/style.css` (vocabulário `.pt-tec`),
  `_fonte/prototipo/{CONCLUSOES.md, conclusoes_spec.json, PENDENTE_RODADA.md}`,
  `ranking_gaps.py`, `gerar_pontos.py` (em construção).

## 2. Dois fluxos estavam rodando quando a sessão fechou

`resumeFromRunId` não funciona em sessão nova. Os scripts de TODOS os fluxos desta sessão estão
copiados em `_fonte/prototipo/workflows/`. Os retornos de cada agente concluído ficam no journal:
`~/.claude/projects/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-Santa-Cruz/86429f10-6359-4758-b9ee-f9cba02f2bf9/subagents/workflows/<run>/journal.jsonl`

| fluxo | run | estado ao fechar | o que fazer |
|---|---|---|---|
| conclusões do estudo | `wf_5faaea6d-ae8` | **COMPLETO** (11 de 11). `CONCLUSOES.md` (41 conclusões), `conclusoes_spec.json` e o retorno do crítico de completude em `conclusoes_critico.json` | antes de pôr as conclusões na tela, tratar o que o crítico apontou (conclusões que faltam, selos suspeitos, frases que soam como receita) |
| base da aba por pontos | `wf_15b47fcf-686` | **INTERROMPIDA às 22h28 de 13/09** (parada de propósito para a sessão nova não escrever em paralelo). A auditoria do gerador está PRONTA no journal. O construtor NÃO devolveu relatório; as três conferências NÃO rodaram. No disco e commitados como rascunho: `ranking_gaps.py`, `gerar_pontos.py`, `gerar_pontos_js.py`, `dados/pontos.json` (2 MB), `static/pontos.js` | **não confie no `pontos.json`**: ler a auditoria no journal, ler o `gerar_pontos.py` inteiro, rodá-lo de novo, e rodar as três conferências (lentes no script `aba-pontos-dados-*.js`: circularidade e faixas · números · espelho completo) antes de qualquer tela |

**Não edite `gerar_prototipo.py` enquanto a base de pontos estiver sendo construída ou rodada**:
ela importa o gerador como biblioteca.

## 3. A ordem da próxima rodada (os itens são do `PENDENTE_RODADA.md`)

1. **Fechar a base por pontos** (item 8): o construtor foi interrompido — terminar, rodar e conferir (ver a tabela da seção 2).
2. **Metade gerador** (`gerar_prototipo.py`, um agente só):
   rodar com `faixa_sobe` e `faixa_*_bruto` (itens 2 e 9 — código pronto, nunca rodado) ·
   bloco `conclusoes` pelo `conclusoes_spec.json` (item 5) · `ranking_gaps` chamando
   `ranking_gaps.tabela_de_gaps` (item 6) · `nac` nos candidatos e goleiros, gravado na montagem do
   pool, que já nasce de `jogadores.json` (item 15) · etapa 14 com gerador próprio
   `default_rng([SEMENTE, 14])`, mais réplicas e "empate técnico" (item 16) · provar determinismo
   (`PYTHONHASHSEED=1` contra `=2`: zero diferença) · diff contra o JSON anterior ·
   `gerar_prototipo_js.py`.
3. **Metade tela**, um dono por arquivo: `proto.js`+`style.css` (largura, botão da escala, bloco de
   conclusões, ajudantes) · `proto_a.js` (tabela dos mais caros com os dois fora do top 9, tabela
   de gaps, "serve para contratar", catálogo compacto) · `proto_b.js` (linha da faixa de quem subiu,
   tudo aberto nas etapas 5-6, botão cru nas matrizes, gráfico da etapa 6 redesenhado, etapa 7
   explicada) · `proto_c.js` (tudo aberto em 12-14, nomes físicos da 13, filtros de liga,
   nacionalidade e idade, empate técnico e teste de volta ao lado dos nomes) · e um arquivo NOVO
   `static/proto_glossario.js` (nome simples, o que mede, unidade, fonte, lado bom de cada
   indicador — tirado de `analisar_serieb.py::do_tecnico`, `gerar_raio_serieb.py::DE_PARA*` e das
   skills dados-wyscout e dados-skillcorner, nunca inventado).
4. **Aba nova por pontos na tela** (item 8): reusar o renderer do Protótipo lendo `PONTOS`, com
   os rótulos de `faixas.rotulos`; cada número diz de que universo veio.
5. **Aba de conclusões** (item 18), por último.
6. Conferir a 1.785 px sem rolagem lateral (item 14). **Publicar só com ok do dono.**

## 4. Regras de trabalho que custaram caro nesta sessão

- **Nenhum agente faz git que escreva.** Um empurrou o `40fc8d7` para o repositório público.
  Escreva a proibição em todo prompt.
- **Um dono por arquivo** em escrita paralela. Quem importa o gerador trava o gerador.
- **Fora do `main`, carregue `G.DECL = G.carregar_declaracao()`** antes de `montar_matriz`.
- **O gerador não era determinístico:** `set` de strings muda de ordem a cada execução
  (PYTHONHASHSEED) e decidia qual atleta recebia qual sorteio na etapa 14. Consertado. Qualquer
  `set` iterado novo → `sorted` ou `dict.fromkeys`.
- **Sorteio global:** etapa nova que sorteia antes desloca as seguintes. Dê gerador próprio.
- `etapa_14.propostas[].vagas_detalhe[].recomendacao` é uma LISTA (uma leitura como campo único
  deu "0 de 90 mudaram" falso nesta sessão).
- **O número da célula das matrizes é a POSIÇÃO no ranking do ano (0-100), não o valor.** O dono
  leu como valor; a legenda e o botão cru (item 9) existem para isso.
- **O dono aponta indicadores a olho nas matrizes.** É garimpo: responder sempre com a família de
  testes, o desconto do dinheiro, a faixa de pontos e a checagem em 2018-2021, e lembrar da tabela
  de gaps com a linha da sorte.
- Os gráficos das etapas 6 e 7 foram lidos errado (cor = desfecho do ano seguinte; o turno 1
  prevê o 2). Itens 10 e 12.

## 5. Decisões do dono em 13/09 (não refazer)

Tela em **português de reunião de clube**, vocabulário único em `proto.js` (`ptTamanho`,
`ptAcaso`, `ptSorte`, `ptJunto`, `ptAcerto`, `ptTecnico`) · **toda conclusão com o selo de força**
dito com todas as letras, inclusive fraco e sem sinal · **aba nova por faixa de aproveitamento**
(ritmo do 6º e do 15º: alta >= 53,509%, baixa < 38,377%; espelha as 16 etapas; 2018-2021 entra no
técnico coletivo; Protótipo continua) · **faixa de quem subiu numa linha só** junto das outras
duas · **botão percentil / valor cru** · **tudo aberto, sem clicar** · **filtros de liga,
nacionalidade e idade** · **sem rolagem lateral** · **aba de conclusões no fim**.

## 6. O que se mediu em 13/09 (detalhe e fontes no `PENDENTE_RODADA.md`)

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
- **Tabela de gaps (prévia):** 18 gaps >= 30 contra 1 do sorteio; o maior gap do sorteio tem mediana
  30,4 e 95% até 37,6; 24 sobrevivem ao desconto dos 293 testes, 20 também ao dinheiro.
- **Nomes da etapa 14:** a correção do sinal trocou 6, 10 e 7 de 15 vagas; o não-determinismo
  trocava 1-2 por rodada; as propostas sul-americanas nunca tiveram nome acima de metade das
  réplicas; a nota não previu quem rendeu (teste de volta). Lista para observar, não recomendação.
