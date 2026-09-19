# CONTINUAR — aba Protótipo, aba por pontos e aba de conclusões

> **DEPOIS DESTE ARQUIVO veio a sessão de 17/09, que construiu o Estudo Série B de zero a 19 partes: leia antes `_fonte/CONTEXTO_sessao_17_09.md`.** Ele manda onde discordar deste.

> **DEPOIS DESTE ARQUIVO veio a sessão de 14/09 (noite) a 16/09: leia antes
> `_fonte/CONTEXTO_sessao_15_16_09.md`.** Ele traz o que está no ar, as decisões do dono e o
> que ficou parado; onde os dois discordarem, vale o mais novo.

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
- ~~A REPETIÇÃO como critério~~ — **respondida em 14/09, noite** (ver §5, "Em 14/09, noite"): sai só
  "o mesmo clube no ano seguinte"; 1º→2º turno e 2018-2021 ficam; FIS-07, M1, M6, M7 e ELE-06 ficam.
  Entra na rodada do §3, item 3.

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
   do mesmo setor na Série B daquele ano, conferida, numa página (artifact) com filtro. **FEITA
   (noite de 14/09)**: o fluxo `wf_6f778c23-fdb` terminou (extração + conferência por outro caminho
   + conserto) e tudo foi para `sessao_14_09/desmarques/` (`lista.json`, `montar.py`,
   `conferencia/`, journals). `avisar_e_montar.py` refaz os avisos (2 clubes: Jacy e N. Pessôa, só
   visível em 2025; xará: Zé Vitor e Marquinhos; setor com 1-3 na conta), para com erro se não
   baterem com os do conserto, traduz os motivos e grava `lista_final.json`, `dados_pagina.json` e
   `desmarques_de_quem_subiu.html` (modelo em `pagina_modelo.html`). 459 jogadores, 328 na conta.
   Página publicada (privada): https://claude.ai/artifact/KAfb3pUeMjQjXRwZr17Ps5 — republicar
   pela mesma URL (`url`) se mudar. Nada commitado.
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
7. **Etapa 5 REDESENHADA (pedido do dono, noite de 14/09):** achou a matriz por time "confusa, pouco
   visual e difícil de chegar a conclusão". Quer indicador na linha, os 3 grupos (sobe, meio, cai)
   nas colunas, o valor bruto típico de cada grupo e a diferença em %. Prévia com os números reais
   publicada em https://claude.ai/artifact/LFnQ4QWbTuAsHatuyuGLKY (fonte e script em
   `sessao_14_09/etapa5_previa/`). A prévia usa: mediana crua; diferença contra o meio (% do meio, ou
   pontos percentuais quando o número já é %); firmeza pelos testes do catálogo da etapa 2 (q < 0,05
   firme; p < 0,05 pode ser sorte); ordem pela firmeza ou pela do estudo, nunca pelo tamanho da diferença
   (unidades diferentes). **APROVADO pelo dono (14/09, noite): "pode seguir assim e a matriz fica
   embaixo como detalhe".** A etapa 5 abre com a tabela da prévia, painel a painel, e a matriz por
   time (com linhas das faixas, ordem pela diferença e marcas de base) continua embaixo de cada
   painel, aberta. Especificação para o gerador: por painel, alinhado a `indicadores`, gravar
   `diferenca_contra_meio` {sobe, cai, tipo: "pp" | "rel"} a partir das medianas cruas
   (`faixa_*_bruto[1]`), com o tipo decidido pela unidade declarada do indicador e conferido contra o
   glossário; `firmeza` {sobe_meio, sobe_cai} com p, q e o rótulo (firme / pode ser sorte / sem
   diferença clara) lidos do catálogo da etapa 2; `ordem_por_firmeza` (menor q das duas comparações,
   empate pela ordem do estudo); `regra_do_resumo`. A tela não calcula nada disso. Na aba por pontos,
   ausência escrita até o `gerar_pontos.py` ser regerado. **FEITO E GRAVADO, SEM PUBLICAR (20:24)**: `dados/prototipo.json` md5
   2859ed76 com `etapa_5.paineis[*].resumo_grupos`, `etapa_5.regra_do_resumo` e `etapa_5.exemplo`
   (32 firmes · 73 pode ser sorte · 481 sem diferença, igual à prévia); `proto_b.js` com a tabela antes
   da matriz, nomes de painel da prévia, exemplo nos dois formatos; `style.css` levou o texto técnico
   pequeno da aba a >= 4,5:1 (#pgProto); restos da etapa 6 resolvidos (pares de mesmo posto, texto do
   share_11). Aceita pelo coordenador: chave de registro
   `ranking_gaps.guardas_no_json_inteiro.consequencia_sem_marca_depois_da_troca_do_texto`. Relato:
   `sessao_14_09/etapa5_grupos_*`. Fechamento FEITO (fluxo `wf_e7fc94ca-7c2`, relato
   `sessao_14_09/fecho_etapa5_*`): título da etapa 5 = "Quem subiu, quem ficou no meio, quem caiu";
   conferência independente no app real com o dado gravado: diff só com as chaves permitidas, 87
   linhas sorteadas batendo célula a célula, contagem 32·73·481 refeita, 4.864 células da matriz iguais
   ao HEAD, etapa 6 sem "repete/ano seguinte/diagonal", contraste mínimo 5,05:1, 16/16 sem erro nas duas
   larguras e temas, só os 10 arquivos esperados modificados. Dois detalhes ACEITOS pelo coordenador e
   registrados aqui: o cabeçalho da matriz passou a dizer "na escala de 0 a 100, quem subiu fica 68 abaixo
   de quem caiu" (sem o sinal repetido, pedido do §2.4 item 6) e as células "vazio" ganharam cor
   `--tinta2` por contraste. Pontas soltas listadas pelo dono do `proto.js`: `proto_contrato.md` e
   `ESPECIFICACAO.md` podem ainda dizer "Cada time, cada ano"; o glossário (~5875) cita a sensibilidade
   por regra da etapa 5 — conferir se a tela ainda mostra; a 400 px o chip "Tudo o que foi medido →"
   cobre a barra do sumário (pré-existente). ABERTOS: (a) "pode ser sorte" quer dizer p < 0,05 sem passar no q
   na etapa 5 e p >= 0,10 no `ptSorte` da etapa 2 — unificar o vocabulário na rodada da régua (§3,
   item 3); (b) PARA O ITEM 6: com os caminhos novos no prototipo.json, a rodada completa do
   `gerar_pontos.py` para no assert "caminho do Protótipo sem par" — tratar antes de regerar pontos;
   (c) contraste abaixo de 4,5:1 em rótulos das etapas 0-4 e 9-15 (fora desta rodada). Histórico: fluxo `wf_7fafb52f-575`
   (sessão `1abbf5c7`), lançado depois do da etapa 6; script em
   `workflows/etapa5-grupos-lado-a-lado-wf_7fafb52f-575.js`; rascunho em `.../scratchpad/etapa5`. Leva
   junto os restos da etapa 6 e o contraste do número técnico (`style.css`, só `#pgProto`). Grava
   `dados/prototipo.json` e `static/prototipo.js` no passo 5. Se cair: journal + `git diff` de
   `gerar_prototipo.py`, `proto_b.js` e `style.css` antes de relançar. Medido: 32 comparações firmes, 73 que podem ser sorte e 481 sem diferença
   clara, em 586 (293 números × subiu×meio e subiu×caiu).

## 3. A ordem da próxima rodada

> **MUDANÇA DE FORMA DE TRABALHAR (dono, 15/09):** "o caminho melhor vai ser fazer perguntas e você
> responder do que fazer uma análise muito ampla de uma só vez". Daqui em diante: ele pergunta, a resposta
> é uma análise focada com o material já colhido, no molde da "bola parada por treinador". A lista
> abaixo fica PARADA até ele pedir um item. **PUBLICADO em 15/09 (commit `eeaf498`, enviado):** etapas
> 5 e 6 novas e a rodada do dinheiro; conferido antes em docs/ (16/16, claro/escuro, 1.785/400, sem erro).
> No ar, a aba ainda diz "O que o estudo concluiu: sem dado" (o bloco `conclusoes` é o bloco 2, parado).

1. ~~**Lista dos desmarques** (§2.4, 2)~~ — feita e publicada na noite de 14/09.
2. **Etapa 6 no mesmo ano** (§2.4, 1) + ajustes pequenos da etapa 5 (§2.4, 6). **FEITO E GRAVADO, SEM PUBLICAR
   (noite de 14/09)**: `dados/prototipo.json` e `static/prototipo.js` gravados às 19:05 (diff: só
   `gerado_em`, a regra da etapa 1 com 216 jogadores-ano e 204 pessoas, e `etapa_6.mesmo_ano`);
   `gerar_prototipo.py`, `proto_b.js`, `proto.js`, `proto_a.js`, `proto_c.js`, contrato e glossário
   mexidos (publicar leva TODOS juntos). Medido: 41 de 73 números andam com o aproveitamento no mesmo
   ano (p < 0,05; o sorteio daria 3; p do excesso 0,0001); os mais fortes são xG contra (−0,58),
   distância do chute (−0,56) e três de uso do elenco marcados como consequência do resultado.
   Restos (entram no fluxo da etapa 5): tela não lê `grupos_mesmo_posto` (distância e m/min com
   pontos idênticos aparecem duas vezes; 70 testes distintos, 40 com p < 0,05); motivo do share_11
   escrito de dois jeitos; número técnico pequeno com contraste 2,77-3,38. PARA O ITEM 6: no d80 do
   `gerar_pontos` a faixa é a de PONTOS (24·35·21) e a declaração diria "quem subiu" — ajustar lá.
   PARA O ITEM 3: a lista de onde a repetição "ano seguinte" é critério está em
   `sessao_14_09/pendente_rodada_repeticao.json`; o chip "etapa 10" saiu da etapa 6 porque os motivos
   de lá falam de repetição. Relato: `sessao_14_09/etapa6_mesmo_ano_*`. Histórico do lançamento: fluxo `wf_bc517137-a69` (sessão `1abbf5c7`, aberta com a pasta do Portal Ranking),
   script em `workflows/etapa6-mesmo-ano-wf_bc517137-a69.js`, rascunho em
   `/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Ranking/1abbf5c7-a19a-4f3a-89c2-26d0445cdbba/scratchpad/etapa6`.
   Ele GRAVA `dados/prototipo.json` e `static/prototipo.js` no passo 5 (só `etapa_6.mesmo_ano`, a
   frase dos dois clubes e a declaração podem mudar) e escreve `gerar_prototipo.py` e `static/proto_b.js`
   (e, se o mapa apontar, `proto.js`/`proto_a.js`/`proto_c.js`/contrato). Se cair: conferir o
   journal e o `git diff` desses arquivos antes de relançar.
3. **Tirar o desconto do dinheiro** (§2.4, 3) — junto sai a repetição "ano seguinte" dos critérios
   (§5, "Repetição como critério") e o "pode ser sorte" passa a ter um sentido só na aba. **PARTE 1
   FEITA (noite de 14/09)**: plano em `sessao_14_09/dinheiro_parte1_resultado.json` (journal ao lado).
   Régua final = proposta "contra a sorte" (4 perguntas: declarada antes? firme pelo q? conferida por
   outro caminho — 1º→2º turno ou 2018-2021? a lista tem mais achados que a sorte? — e, no físico,
   continua descontado SÓ o rodízio; "sem conferência testável = moderado, nunca forte"). Portas: A 1→2
   (dist_remate, remates_baliza_pct), B 17→27, C 31→0 (some), "-" 244→264; o nome "critério de
   contratação" não se sustenta (a etapa 13 nunca leu a porta). Selos 3·11·24·13·5 → 4·15·17·15·5
   (sobem J17, ELE-03, FIS-04, J19, A2; descem DIN-04, DIN-05). Físico sobe×cai: 41 no cru, 34 só com o
   rodízio, 2 com o dinheiro. Etapa 9: réguas apagadas 3→0. Etapa 13: nada muda. Vocabulário único
   (chave gravada): firme (q<0,05) / pode ser sorte (p<0,05, q>=0,05) / sem diferença clara; saem
   "dificilmente é sorte" e "no limite" como rótulo de sorte. DECIDIDOS PELA REGRA DA CASA (coordenador):
   A1 na família dos 2 eixos (fraco, registrado como escolhido depois); DIN-04/05 lidas por jogador (sem
   sinal), como a decisão da etapa 1; etapa 13 só ganha marca da lista por setor (zaga e lateral), sem
   filtro; etapa 10 com a lista fixa resultado + consequência (25→22), igual à aba por pontos.
   RESPOSTAS DO DONO (noite de 14/09, as 4 recomendações): (a) J17 MODERADA, pela regra geral "firme
   por pouco (q entre 0,025 e 0,05) com uma conferência só = moderado"; (b) aba mais afirmativa ACEITA,
   com a ressalva "elenco valioso tende a ter isso; o estudo não separa as duas coisas" (J19, ELE-03, A2
   e as que subirem), sem desconto; (c) porta A SÓ LEITURA, nome "firme e reaparece por outro caminho",
   a nota da etapa 13 não muda; (d) M4 = zaga e lateral (fraco) e o ATAQUE vira conclusão própria
   (moderado) — 57 conclusões. PARTE 2A FEITA (15/09; relato `sessao_14_09/dinheiro_parte2a_*`; fontes que conferem as conclusões
   copiadas para `sessao_14_09/conclusoes_src_15_09/`): portas A 2 · B 27 · C 0 · – 264; etapa 10 =
   22; etapa 9 sem réguas apagadas; chaves de sorte gravadas em todas as etapas; físico sobe×cai 41 cru
   / 34 só com o rodízio; 57 conclusões = 3 fortes · 17 moderadas · 17 fracas · 15 sem sinal · 5 não dá
   (J17 moderada, M8 = ataque por clube, DIN-04/05 sem sinal, ELE-03/FIS-04/J19/A2 moderadas com a
   ressalva); as cinco seguem DIN-02, J1, J2, ELE-01, J6 (depois do bloco 2: FIS-07, DIN-01, DIN-02, J1,
   J2). Registrado: DIN-01/02 fortes dependem de aceitar "acerto acima de 0,5 em cada ano e deixando um
   de fora" como conferência (escrito na régua); M4 também foi partida depois de olhar (selo não muda);
   lista do elenco sobe×meio com p do excesso 0,0502, colada no corte, marcada como fronteira;
   `etapa_14.justificativa_no_dado.porta` virou dicionário (share_11 B, atletas_usados –). ITEM 6:
   `recontar_etapa_3` do gerar_pontos grava passam5_liq=0 e ele ainda usa rho_persist/liq. O dado novo
   conferido está em `.../scratchpad/dinheiro2/prototipo_novo.json` (o gerador o refaz se sumir).
   PARTE 2B (15/09, autorizada pelo dono): o fluxo completo `wf_cc8b841b-608` fez a casca e as três telas
   (proto.js, proto_a/b/c, relatos em `sessao_14_09/dinheiro_parte2b_telas_journal.jsonl`) e foi PARADO
   às 12:18 a pedido do dono ("tá muito demorado"), antes do glossário (que não chegou a mexer em nada).
   CAMINHO CURTO FEITO (15/09, 12:28; `workflows/dinheiro-parte2b-curta.js`, relato
   `sessao_14_09/dinheiro_parte2b_resultado.json`): conferência APROVOU (16/16 sem erro nos 4 casos; 50
   linhas sorteadas das etapas 2, 7, 9, 10, 13 e 14 batendo com o JSON e a chave; varredura da aba sem
   nenhum "descontado o dinheiro"/"ano seguinte"/"dificilmente"/"porta C" como critério — o que sobrou
   é descrição legítima: PSV-99 "descontado o 1% mais alto", 1º turno, rodízio, etapa 4 ímpares×pares,
   etapa 11 repetição do atleta, backtest das 13/14); nada quebrava nem mentia, então não houve
   conserto. GRAVADO: `dados/prototipo.json` (md5 83e8aa2b, gerado_em 2026-09-15 12:28) igual ao
   rascunho conferido da 2A tirando gerado_em; `static/prototipo.js` igual; portas A 2 · B 27 · C 0 ·
   – 264; etapa 10 com 22. SEM COMMIT E SEM PUBLICAR. Detalhes em aberto: a etapa 9 escreve "sem
   diferença que se possa afirmar" (30×) ao lado de "sem diferença clara" — unificar no proto_c.js; o
   dado não tem o bloco `conclusoes`, então a tela ainda não mostra M8 nem J17 (é o item 4, bloco 2 do
   gerador).
   FICAM PARA DEPOIS: `proto_glossario.js` e `proto_contrato.md` (ainda descrevem rho_persist, porta
   C, liquido, ptSorte de três faixas, PT_PORTA_TXT antigo, ptBaseline/ptLiquida) — a conferência do
   caminho curto lista as entradas falsas. Avisos dos donos das telas para rever: etapa 1 com "pode ser
   sorte · sem a conta dos 20/4 testes" em p < 0,001 (família sem q gravado); coluna do rodízio no
   catálogo decidida por corte na tela (o gerador não grava chave do rodízio); etapa 8 com testes do
   valor contra as caixas que discordam (permutação 0,124 x Kruskal 0,033); contraste de .pt-rot,
   .pt-falta e .pt-marca abaixo de 4,5:1 nas etapas 9-15 (style.css). Sem commit e sem publicar. O que foi a 2A: declarações, `ranking_gaps.py`,
   `gerar_prototipo.py` (dado novo só no rascunho `.../scratchpad/dinheiro2/prototipo_novo.json`),
   conferência dos números, conserto, e `conclusoes_spec.json`/`CONCLUSOES.md`/`ESPECIFICACAO.md`
   reescritos e conferidos. NÃO grava `dados/prototipo.json` nem mexe em `static/` — isso é a parte 2B
   (telas, gravação, conferência final). Entre as duas, o código novo já está no projeto, mas o dado e
   as telas continuam os de antes, coerentes entre si. O DONO AUTORIZOU (15/09) seguir direto para a
   parte 2B quando a 2A terminar (sem publicar e sem commit: commit só com pedido dele). Histórico da parte 1: fluxo
   `wf_19689286-ad6` (sessão `1abbf5c7`), script em
   `workflows/dinheiro-e-repeticao-mapa-e-regua-wf_19689286-ad6.js`, rascunho em `.../scratchpad/dinheiro`;
   devolve os mapas, 3 propostas de régua medidas, 2 juízes e o plano por dono de arquivo. A parte 2
   (implementação) só depois de ler o plano e levar ao dono o que for decisão dele. Mesma rodada: com a lente rápida do conserto das conclusões e as
   conclusões afetadas pelo dado novo (§2.3).
4. **Gerador, bloco 2** com a ordem de serviço revista; bloco `conclusoes` por último. **PARADO A PEDIDO DO
   DONO (15/09, 13:17, "demorando muito")**: os 5 módulos TERMINARAM e ficaram na raiz, sem ninguém
   importar (untracked; relatos em `sessao_14_09/bloco2_parado_15_09/bloco2_journal.jsonl`); a integração
   parou no meio — as 75 linhas dela estão em `sessao_14_09/bloco2_parado_15_09/integracao_incompleta_gerar_prototipo.diff`
   e o `gerar_prototipo.py` voltou ao commit `0fb4c80`. Dado e telas intactos. Para retomar: só a
   integração, a conferência e a gravação (os módulos estão prontos; conferir antes se o gerador mudou).
   Plano como foi lançado: 85 campos "bloco_2" da
   ordem em 5 MÓDULOS NOVOS na raiz, um dono cada, em paralelo — `gerar_prototipo_b2_bases.py` (bases,
   etapas 0/6/7/8/13/15), `_etapa1.py`, `_etapa2.py`, `_etapa11.py`, `_conclusoes.py` (conclusoes_base e
   o bloco `conclusoes`, por último) — cada um com CAMPOS, aplicar(saida, ctx) e ctx_de_teste(); depois
   um só dono do `gerar_prototipo.py` liga os módulos no main (import dentro do main, para o gerar_pontos
   não carregar nada novo), roda no rascunho (`.../scratchpad/bloco2/prototipo_b2.json`) e compara os
   selos calculados com o spec. Conferência (números por fora; aba com as conclusões), conserto, gravação.
   Script em `workflows/gerador-bloco2-*.js`. Sem commit e sem publicar.
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
- **Repetição como critério (respondido na noite de 14/09):** sai só **"o mesmo clube repete o número
  no ano seguinte"** — da régua dos selos (o FORTE deixa de pedir essa repetição e ela não entra mais
  no desempate), da porta A do catálogo (`rho_persist >= 0,30` sai; o placar da etapa 13 vai admitir
  mais indicadores) e das frases "não se viu o mesmo clube repetir o número". **Ficam** o 1º turno
  prevendo o 2º (é o mesmo ano) e a checagem em 2018-2021 (protege contra sorte). **As conclusões
  cujo assunto é a repetição ficam, com o selo** (FIS-07, M1, M6, M7, ELE-06): são achado, não
  critério. Executar junto com a retirada do dinheiro (§3, item 3).
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
