# Contrato da aba Protótipo

**Este é o único documento que você precisa ler de quem escreveu a casca.** Quem o escreveu
não estará disponível para responder pergunta: o que não estiver aqui, decida você — e
escreva na tela o motivo da decisão.

---

## 0. A regra que manda em tudo

**O dado é a fonte, o texto é consequência.**

- Nenhum número digitado no seu arquivo. Nenhum. Se a frase tem número dentro, o número saiu
  do `PROTO` naquela chamada.
- Se o JSON mudar, a sua tela muda sozinha. Nada de `if (clube === 'Cruzeiro')`.
- Onde o dado não existe, a tela **escreve a ausência e o motivo** (`ptFalta` / `ptFaltaBloco`).
  Um `—` pelado é defeito, não estilo.
- Comentário em português, em prosa, explicando **por que** — nunca o que a linha faz.
  Escreva a armadilha, não a obviedade. O tom é o do `static/app.js`.
- Texto de tela em português com acento. Comentário de código sem acento é aceito (o resto
  do app é assim), mas prefira escrever com acento em strings que vão para a tela.

## 1. O que é seu e o que não é

| Você escreve | Etapas |
|---|---|
| `static/proto_a.js` | 0, 1, 2, 3, 4 |
| `static/proto_b.js` | 5, 6, 7, 8 |
| `static/proto_c.js` | 9, 10, 11, 12, 13, 14, 15 |

**Você NÃO toca em:** `templates/index.html`, `static/app.js`, `static/style.css`,
`static/proto.js`, `static/prototipo.js`, `gerar_prototipo_js.py`, `app.py`. Já estão
prontos e ligados. Se precisar de uma classe CSS que não existe, **não crie CSS**: monte com
as classes deste contrato e com `style=""` inline quando for geometria de SVG. Se faltar
mesmo uma classe, diga isso no seu relatório final — não edite o `style.css`, porque três
arquivos editando o mesmo CSS ao mesmo tempo perdem trabalho um do outro.

**Não redefina nenhum helper `pt…`.** Eles existem em `proto.js` e são globais. Redefinir
`ptNum` no seu arquivo quebra as etapas dos outros dois, porque o último script carregado
ganha. Se precisar de uma função só sua, prefixe com o seu arquivo: `paMatriz…`,
`pbDispersao…`, `pcElenco…`.

## 2. A assinatura, igual para as dezesseis

```js
function ptEtapa7(alvo, dados) {
  // alvo  = o elemento container, já na tela (HTMLElement)
  // dados = PROTO.etapa_7 (o objeto inteiro, já conferido: não chega undefined aqui)
  alvo.innerHTML = '…';
}
```

- **Declare com `function`**, não `const ptEtapa7 = …`. A casca procura pelo nome no `window`
  (há um segundo caminho para o caso do `const`, mas não conte com ele).
- Escreva em `alvo.innerHTML`. Não procure outro lugar na página, não crie `<section>` fora
  do seu container, não mexa em nada que esteja fora do `alvo`.
- **Não retorne HTML** — quem escreve é você, dentro do `alvo`.
- Se a sua etapa tiver interação que reescreve o próprio container (seletor de indicador,
  troca de painel, abrir/fechar), no fim da reescrita chame `ptLigarTabelas(alvo)` de novo,
  senão as tabelas novas nascem sem ordenação.
- Você **pode** quebrar: a casca chama dentro de um `try` e, se estourar, desenha o erro no
  lugar da etapa sem derrubar as outras quinze. Isso é rede de segurança, não permissão.
- O cabeçalho da etapa (número, título, subtítulo) **já está desenhado** pela casca. Não
  repita o título dentro do `alvo`.

### Mapa das dezesseis

| Etapa | Função | Container (id) | Arquivo dono | Dado |
|---|---|---|---|---|
| 0 | `ptEtapa0(alvo, dados)` | `#ptEt-0-corpo` | `proto_a.js` | `PROTO.etapa_0` |
| 1 | `ptEtapa1(alvo, dados)` | `#ptEt-1-corpo` | `proto_a.js` | `PROTO.etapa_1` |
| 2 | `ptEtapa2(alvo, dados)` | `#ptEt-2-corpo` | `proto_a.js` | `PROTO.etapa_2` |
| 3 | `ptEtapa3(alvo, dados)` | `#ptEt-3-corpo` | `proto_a.js` | `PROTO.etapa_3` |
| 4 | `ptEtapa4(alvo, dados)` | `#ptEt-4-corpo` | `proto_a.js` | `PROTO.etapa_4` |
| 5 | `ptEtapa5(alvo, dados)` | `#ptEt-5-corpo` | `proto_b.js` | `PROTO.etapa_5` |
| 6 | `ptEtapa6(alvo, dados)` | `#ptEt-6-corpo` | `proto_b.js` | `PROTO.etapa_6` |
| 7 | `ptEtapa7(alvo, dados)` | `#ptEt-7-corpo` | `proto_b.js` | `PROTO.etapa_7` |
| 8 | `ptEtapa8(alvo, dados)` | `#ptEt-8-corpo` | `proto_b.js` | `PROTO.etapa_8` |
| 9 | `ptEtapa9(alvo, dados)` | `#ptEt-9-corpo` | `proto_c.js` | `PROTO.etapa_9` |
| 10 | `ptEtapa10(alvo, dados)` | `#ptEt-10-corpo` | `proto_c.js` | `PROTO.etapa_10` |
| 11 | `ptEtapa11(alvo, dados)` | `#ptEt-11-corpo` | `proto_c.js` | `PROTO.etapa_11` |
| 12 | `ptEtapa12(alvo, dados)` | `#ptEt-12-corpo` | `proto_c.js` | `PROTO.etapa_12` |
| 13 | `ptEtapa13(alvo, dados)` | `#ptEt-13-corpo` | `proto_c.js` | `PROTO.etapa_13` |
| 14 | `ptEtapa14(alvo, dados)` | `#ptEt-14-corpo` | `proto_c.js` | `PROTO.etapa_14` |
| 15 | `ptEtapa15(alvo, dados)` | `#ptEt-15-corpo` | `proto_c.js` | `PROTO.etapa_15` |

Você quase nunca precisa do id do container (o `alvo` já chega pronto). Ele está aqui para
quando você quiser um id interno único: use o prefixo do seu container, por exemplo
`id="ptEt-7-tab"`, porque **ids repetidos entre etapas quebram as tabelas** (o registro de
`ptTabela` é por id).

---

## 3. Os helpers compartilhados

Todos globais, definidos em `static/proto.js`. Além deles você tem `esc(s)`, `$(sel)` e
`$$(sel)` do `app.js`.

### Número

| Helper | Assinatura | Devolve | Exemplo |
|---|---|---|---|
| `ptNum` | `ptNum(v, casas = 2)` | `'0,828'` — vírgula decimal, milhar com ponto, menos tipográfico (−) | `ptNum(d.auc_posto_de_valor.sobe_x_resto, 3)` → `0,828` |
| `ptInt` | `ptInt(v)` | `'40.059'` | `ptInt(d.degraus[0].n)` → `40.059` |
| `ptPct` | `ptPct(v, casas = 1)` | `'55,0%'` | `ptPct(q.taxa_pct)` → `55,0%` |
| `ptEur` | `ptEur(v)` | `'<span title="29.750.000 €">€ 29,8 mi</span>'` | `ptEur(g.valor_medio_eur)` |
| `ptP` | `ptP(p)` | `'p = 0,056'` ou `'p < 0,001'` — **já traz o "p"** | `ptP(l.p_bruto_SM)` |
| `ptPv` | `ptPv(p)` | `'0,056'` / `'< 0,001'` — sem o "p", para célula cuja coluna já se chama p | `ptPv(l.q_SM)` |
| `ptD` | `ptD(d)` | `'+0,521'` / `'−1,024'` — sinal sempre explícito | `ptD(l.d_bruto_SM)` |
| `ptAno` | `ptAno(v)` | `'2025'` — sem separador de milhar | `ptAno(par.ano_t)` |
| `ptMotivos` | `ptMotivos(motivos[])` | legenda dos vazios de uma matriz, agrupada por motivo | ver "Célula de percentil" |
| `ptN` | `ptN(n, unidade)` | `'<span class="pt-n">n = 16 clube-temporada</span>'` | `ptN(d.n, 'clube-temporada')` |

**Ano não é quantidade:** `ptInt(2025)` devolve `2.025`, que não é ano nenhum. Use `ptAno`
para `ano`, `ano_t`, `ano_t1`, `assert_ano_max` e qualquer identificador numérico.

`ptNum`, `ptPct`, `ptP` e `ptD` devolvem `'—'` quando recebem `null`. **Isso é rede, não é o
comportamento desejado:** se você sabe que aquele `null` tem motivo (e no `prototipo.json`
quase todo `null` tem), use `ptFalta` com o motivo em vez de deixar o traço.

### Ausência

```js
ptFalta(motivo)                 // inline, dentro de frase ou célula
ptFaltaBloco(titulo, motivo)    // no lugar de um bloco inteiro
```

```js
// etapa 7 — quatro indicadores não têm versão por turno
ptFaltaBloco('Quatro indicadores não entram nesta tabela',
  d.nao_testaveis.join(', ') + ' — ' + d.motivo_nao_testaveis);
```

### Célula de percentil (matriz da etapa 5)

```js
ptCel(percentil, {
  bruto,      // valor cru, vai para o title
  casas,      // casas do bruto no title (padrão 3)
  n,          // n de atletas ou de jogos daquela célula
  unidade,    // 'atletas', 'jogos'…
  ano,        // vai para o title
  sinal,      // 1 = mais é melhor, -1 = menos é melhor (inverte a cor), 0 = sem lado declarado
  texto,      // o que aparece escrito na célula (padrão: o percentil arredondado)
  motivo,     // OBRIGATÓRIO quando percentil é null: é o que a célula escreve
  dados,      // vira data-pt="…", se você quiser tratar clique
})
```

**Devolve o `<td>` inteiro**, já com classe e title. A cor é a distância ao percentil 50: o
meio fica lavado e as duas pontas acendem em cores opostas. Célula sem valor vira
`pt-cel-vazio` com o motivo escrito dentro — a etapa 5 tem setor inteiro assim
(`"menos de 3 atletas rastreados no setor"`), e ele **precisa** aparecer.

```js
const [bruto, pct, n, motivo] = clube.celulas[j];   // legenda_celula do próprio JSON
ptCel(pct, { bruto, n, unidade: ind.unidade_n, ano: clube.ano, sinal: ind.sinal, motivo });
```

**Toda matriz que tenha célula vazia fecha com a legenda dos vazios** — o motivo mora no
`title` da célula, e `title` ninguém lê passando o olho:

```js
ptMotivos(motivos)   // motivos = array de strings (os motivos das células vazias, com repetição)
// imprime "49 células vazias — menos de 3 atletas rastreados no setor", um motivo por linha
```

### Barra

```js
ptBarra(valor, max, { rot, texto, hachura, cor, extra, dica, motivo })
```

`max` é sempre seu: a barra não se normaliza sozinha (normalizar pelo maior da lista faria o
pior de uma lista curta parecer bom). `hachura: true` desenha listrado — use quando o valor
está **abaixo de um corte lido do JSON**, nunca por gosto.

```js
// etapa 4 — confiabilidade, com hachura abaixo do corte que o próprio dado declara
d.linhas.map(l => ptBarra(l.conf, 1, {
  rot: l.indicador,
  texto: ptNum(l.conf, 2),
  hachura: l.hachura,                      // o JSON já diz quem fica abaixo de corte_hachura
  extra: ptN(l.n, 'clube-temporada'),
})).join('')
```

### Tabela ordenável

```js
ptTabela({
  id: 'ptEt-2-tab',          // único na página inteira
  classe: '',                // opcional
  vazio: 'texto quando não há linha',
  ordem: { col: 'd_bruto_SM', dir: 'desc' },   // opcional; sem isso abre na ordem do array
  colunas: [
    { k: 'nome', rot: 'indicador', tipo: 'texto', dica: 'nome como aparece na base' },
    { k: 'n', rot: 'n', casas: 0 },
    { k: 'd_bruto_SM', rot: 'd bruto', fmt: v => ptD(v) },
    { k: 'p_bruto_SM', rot: 'p', fmt: v => ptPv(v) },
    { k: 'pct', rot: 'percentil', cel: (v, l) => ptCel(v, { bruto: l.bruto }) },
  ],
  linhas: d.linhas,          // array de objetos — os do JSON servem direto
})
```

- `tipo`: `'texto'` (alinha à esquerda, ordena por `localeCompare` pt-BR) ou nada/`'num'`
  (alinha à direita, tabular, ordena numérico).
- `fmt(valor, linha)` devolve o **conteúdo** da célula; `cel(valor, linha)` devolve o
  **`<td>` inteiro** (é assim que `ptCel` entra numa tabela). Use um ou outro, nunca os dois.
- `classe(valor, linha)` opcional, devolve classe extra do `<td>`.
- Campos especiais na linha: `_classe` (classe do `<tr>`) e `_dica` (title do `<tr>`).
- Valor ausente vai **sempre para o fim**, nas duas direções de ordenação.
- A ordenação se liga sozinha; você não registra listener nenhum. Só chame
  `ptLigarTabelas(alvo)` se reescrever o container depois.

### Card

```js
ptCard(titulo, subtitulo, corpo, nota)   // devolve string HTML
```

O subtítulo é o lugar da ressalva (`'n = 4'`, `'não testável'`, `'o goleiro não é rastreado'`).
Aceita HTML nos três últimos parâmetros; o `titulo` é escapado.

```js
ptCard('O nulo do garimpo',
  ptN(g.replicas, 'réplicas') + ' · ' + esc(g.metodo),
  corpoHtml,
  'Ganho real de AUC ' + ptNum(g.ganho_auc_real_melhor, 4) + ' contra p95 do nulo ' +
  ptNum(g.ganho_auc_nulo_p95, 4) + ' — ' + ptP(g.p_do_melhor) + '.')
```

### Os três controles obrigatórios (seção 11 da ESPECIFICACAO)

Os três **já aparecem no topo da aba**, montados pela casca. Mas dois deles são componentes
que **você precisa repetir dentro das etapas**, colados na afirmação que eles controlam —
essa é a exigência, e é por isso que existem como função.

```js
ptBaseline({ rotulo, auc, acertos, de, motivo })
```

Imprime o AUC 0,828 do posto de valor ao lado do número da sua proposta. Se a sua proposta
**não tem** AUC fora da amostra, passe `auc: null` e escreva o motivo — o componente imprime
o motivo, e isso é informação sobre a proposta, não um vazio.

```js
// etapa 13 — índice de encaixe contra a régua do dinheiro
ptBaseline({ rotulo: 'a nota de encaixe', auc: null,
  motivo: 'o backtest da nota mede permanência e minutos do atleta, não subida do clube: ' +
          'não existe AUC comparável, e o que existe está na tabela abaixo' })
```

**Onde ele é obrigatório:** etapa 9 (as réguas), etapa 13 (a nota) e etapa 14 (cada uma das
propostas de elenco). Em qualquer outro ponto em que a tela sugerir "contrate por isto",
repita.

```js
ptLiquida({ d_bruto, p_bruto, d_liq, p_liq })
```

Bruto e líquido na mesma linha, sempre juntos. Use em **toda** linha de indicador que
mostrar efeito — etapas 2, 9 e 10. Acende quando o líquido sobrevive a 5%.

```js
ptContrafactual(cf)   // cf = proposta.contrafactual, da etapa 14
```

Obrigatório ao pé de **cada** proposta da etapa 14. Já trata chave ausente.

### Navegação

`ptIrParaEtapa(n)` rola até a etapa `n` (rola a caixa certa, não a página — não use
`scrollIntoView`, que leva embora a faixa do topo com o escudo e as abas).

---

## 4. Classes de CSS que já existem

Monte com estas; não invente classe nova (não haveria CSS para ela).

- `pt-rot` — rótulo pequeno em caixa alta acima de um bloco.
- `pt-nota` — parágrafo de nota/prosa (é onde vai a maior parte do seu texto).
- `pt-n` — o rótulo de n (já sai do `ptN`).
- `pt-card`, `pt-card-cab`, `pt-card-corpo` — já saem do `ptCard`.
- `pt-tab`, `pt-tab-rola` — já saem do `ptTabela`.
- `pt-cel`, `pt-barra*` — já saem dos helpers.
- `pt-falta`, `pt-falta-bloco`, `pt-espera`, `pt-erro` — os estados sem conteúdo.
- `pt-controle` — caixa com fundo e borda, para um bloco solto que não é card.
- `pt-liq`, `pt-cf` — já saem dos componentes de controle.

Cores disponíveis dentro de `#pgProto` (use `var(--…)`, não hex):
`--pt-alto` (azul, acima), `--pt-baixo` (laranja, abaixo), `--pt-ok` (verde, passou),
`--pt-nao` (cinza, não passou), mais as globais `--tinta`, `--tinta2`, `--tinta3`, `--fundo2`,
`--fundo3`, `--borda`, `--borda2`, `--veu1`, `--veu2`, `--coral`, `--coral-cl`.

**SVG montado à mão**, como no `sbRender()` — não há biblioteca de gráfico no projeto e não
se deve adicionar uma. Para texto dentro de SVG use `fill:var(--tinta2)` etc. via atributo
`style`, e mantenha `viewBox` + `width:100%` para o desenho acompanhar a caixa.

---

## 5. O que cada etapa tem que mostrar, e onde está o dado

Resumo da seção 10 da `_fonte/prototipo/ESPECIFICACAO.md` com as chaves conferidas do JSON.
**Leia a seção 10 inteira** (linhas 396-433) antes de escrever a sua parte; aqui está só o
mapa do dado.

### Etapa 0 — O que está sendo medido
`linhas_no_arquivo` 100, `linhas_completas` 80, `sobe`/`meio`/`cai`, `por_ano[]`
(`{ano, n, J, completa, sobe, meio, cai, entra_nas_medias}`), `rodadas_2026`,
`rodadas_completa`, `clubes_distintos`, `aparicoes_por_clube` (mapa "vezes"→"quantos clubes"),
`poder` (`d_minimo_16x16`, `d_minimo_16x48`, `d_minimo_16x64`,
`d_minimo_16x16_bonferroni`, `testes_na_correcao_bonferroni`, `alfa`, `poder`),
`indicadores_pre_declarados`, `indicadores_por_familia`, `funil_candidatos[]`.
O ano com `entra_nas_medias: false` vai **em cinza, com as rodadas escritas**. Ao lado: o que
esse n permite (comparar médias — `poder.d_minimo_*`) e o que não permite (recortar
subgrupos). O funil aqui é resumo; o detalhe é a etapa 12.

### Etapa 1 — A linha de base do dinheiro
`quartis[]` (`quartil, n, subiram, taxa_pct, valor_mediano_eur`), `top4_de_valor`
(`acertos, de, esperado_por_acaso, por_ano[]`), `auc_posto_de_valor`
(`sobe_x_resto, sobe_x_meio, sobe_x_cai, loso_sobe_x_resto, eventos_por_parametro,
regra_pratica`), `cobertura_do_valor`, `caliper[]`.
É o **primeiro parágrafo** do estudo, não o rodapé: o dinheiro explica antes de qualquer
pilar. `loso_sobe_x_resto` (deixando um ano de fora) fica ao lado do AUC cheio, e
`eventos_por_parametro` contra `regra_pratica` diz o quanto a própria baseline é frágil.

### Etapa 2 — O catálogo dos indicadores
`colunas[]` (as 26 colunas que a especificação pede na tabela) e `linhas[]` com 293 objetos.
Cada linha: `indicador, nome, coluna_csv, pilar, familia, setor, sinal, n, conf, auc_SM,
m_sobe, m_meio, m_cai, r_sobe, r_meio, r_cai, d_bruto_SM, p_bruto_SM, d_liq_SM, p_liq_SM,
d_bruto_SC, p_bruto_SC, d_liq_SC, p_liq_SC, rho_persist, n_persist, rho_1T_2T, p_1T_2T,
resultado, q_SM, q_SC, q_liq_SM, porta, porta_motivo, ic_bruto, ic_liq, replicas`.
Tabela ordenável por qualquer coluna (`ptTabela`), com filtro por família/pilar se couber.
`porta_motivo` é prosa já escrita pelo pipeline — mostre-a (é ela que explica por que o
indicador caiu). Toda linha carrega bruto **e** líquido: `ptLiquida`.

### Etapa 3 — O aviso do sorteio, em número
`testes_por_comparacao` 293, `esperados_por_acaso_5pct`, `por_familia` (mesmo conjunto por
família), `passam5_SM`, `bh5_SM`, `passam5_SC`, `bh5_SC`, `passam5_liq_SM`, `bh5_liq_SM`,
`nulo_do_garimpo` (`replicas, indicadores, semente,
excluidos_por_cobertura_abaixo_de_90pct, metodo, ganho_auc_real_melhor,
indicador_real_melhor, ganho_auc_nulo_media, ganho_auc_nulo_p95, ganho_auc_nulo_max,
p_do_melhor`).
A especificação pede este bloco **no topo da etapa 2** — desenhe-o no container da 3 (é o
lugar dele no sumário) e, se quiser, repita um resumo curto no topo da 2. `bh5_liq_SM = 0` é
o número mais duro da aba: nenhum indicador sobrevive a BH depois do desconto do dinheiro.
Ele não pode ficar escondido numa célula.

### Etapa 4 — Confiabilidade de cada medida
`corte_hachura` 0,40, `metodo` (string), `linhas[]`
(`indicador, coluna_jogo, n, rho_meias, conf, hachura`), `sem_versao_por_jogo` 265.
Barra por indicador (`ptBarra` com `hachura: l.hachura`). E diga o `sem_versao_por_jogo`:
a maior parte dos indicadores **não tem** versão por jogo, logo não tem confiabilidade
medida — ausência declarada, não lista curta disfarçada de completa.

### Etapa 5 — Os pilares, time a time, ano a ano
`paineis` é um mapa com 11 painéis: `tecnico_col`, `elenco`, `tecnico_ind_{zaga,lateral,
meio,ataque}`, `fisico_col_{elenco,zaga,lateral,meio,ataque}`. Cada painel:
`pilar`, `indicadores[]` (`{id, nome, coluna_csv, sinal, unidade_n}`), `clubes[]` (16, com
`{clube, ano, pos, pts, celulas[]}`), `faixa_meio[]` e `faixa_cai[]` (um `[q1, mediana, q3]`
por indicador, na mesma ordem das colunas), `legenda_celula`
(`["bruto","posto_no_ano","n","motivo_se_vazia"]` — a ordem dentro de cada célula).
Mais `vazios_por_setor[]`, `sensibilidade_da_agregacao`, `fis_atletas`, `goleiro` (string:
*"não rastreado pelo SkillCorner — buraco, não zero"*).
Matriz 16 linhas × N colunas com `ptCel`; faixa do meio e de quem caiu ao pé de cada coluna;
célula com `motivo_se_vazia` **escrito**. `sensibilidade_da_agregacao` mostra que trocar a
regra de agregação (ponderada/mediana/top5) muda o que passa — é ressalva de método, vai na
tela.

### Etapa 6 — Isso se repete?
`n_pares` 36, `referencia_dinheiro` (`indicador, rho, p, n` — o valor do elenco é a régua:
ρ 0,724), `pares[]` (`clube, ano_t, ano_t1, faixa_t, faixa_t1`), `rho` (mapa indicador →
`{rho, p, n}`, 293 chaves), `dispersao` (mapa indicador → array de pares `[posto_t,
posto_t1]`, 73 chaves — só os que têm dispersão pronta), `truncamento`
(`pares, terminaram_em_subida, subidas_totais, subidas_sem_ano_anterior_na_serie_b`).
Dispersão com seletor por indicador, ρ no canto, mesma escala para todos. `truncamento` é a
armadilha: 10 das 16 subidas **não têm** ano anterior na Série B, então estes 36 pares são um
recorte de quem ficou — diga isso perto do gráfico.

### Etapa 7 — A porta temporal
`n`, `rodadas_1t`, `rodadas_2t`, `referencia_pts1t_x_pts2t` (`rho, p`), `linhas[]`
(`indicador, n, rho_bruto, p_bruto, rho_parcial, p_parcial, sinal, sinal_certo`),
`nao_testaveis[]` (4 indicadores) e `motivo_nao_testaveis`.
Título da especificação: *"o que eles fizeram, ou o que aconteceu com quem estava subindo?"*.
`sinal_certo: false` é linha que anda para o lado contrário do esperado — marque.

### Etapa 8 — O cemitério dos padrões
Duas metades, e a ordem importa.
`cemiterio`: `linhas[]` (`conjunto, n, dimensoes, k, silhueta_obs, nulo_colunas_embaralhadas
{mediana,p}, nulo_mesma_covariancia {mediana,p}, replicas`), `jaccard[]`
(`k, replicas, linha_hennig_estavel, linha_hennig_dissolve, jaccard_por_grupo[], tamanhos[]`),
`eixos_usados` (9 eixos → lista de colunas), `observacoes_por_dimensao`.
**Os dois nulos lado a lado, sempre** — é o assunto: o nulo embaralhado dá p pequeno e o de
mesma covariância não. Jaccard contra a linha de 0,75 (`linha_hennig_estavel`) e a de
dissolução (0,60).
`tipologia` (o que sobreviveu, documentado em `_fonte/prototipo/TIPOLOGIA.md`): `eixos`
(TERRITORIO e ROTA, com `[coluna, sinal]`), `cortes`, `plano[]` (os 16 com `grupo`,
`territorio`, `rota`), `grupos[]` (4, com `n, territorio, rota, status, p_um_contra_o_resto,
times[], posto_valor_medio, valor_medio_eur, brutos{}`), `veredito[]`
(`teste, numero, corte, passou`), `teste_de_fora`, `bateria_limpa`, `fisico`, `formacao`,
`dinheiro`, `estabilidade`, `andares`.
**Atenção:** os grupos trazem `status_declarado_no_documento` e `p_declarado_no_documento` ao
lado de `status` e `p_um_contra_o_resto` recalculados. Quando os dois **divergirem**, mostre
os dois e diga que divergem — não escolha um.

### Etapa 9 — As réguas
`reguas[]` (9) com `eixo, itens[], d_SM, p_SM, d_liq_SM, p_liq_SM, q_SM, rho_persist,
esmaecido, sobe[], itens_crus[]`. Cada `itens_crus[i]`: `{col, d_SM, p_SM, d_liq_SM,
p_liq_SM, rho_persist}`. Mais `aviso_composicao`: *"a unidade de teste é o indicador cru; o
eixo é régua de tela"* — essa frase precisa estar visível, não em title.
`esmaecido: true` é eixo que o próprio pipeline mandou apagar; respeite visualmente.
`sobe[]` são 16 números, um por clube-temporada que subiu, **na mesma ordem** de
`etapa_5.paineis[*].clubes` e de `etapa_8.tipologia.plano` (conferido: as duas listas batem
entre si). Não consegui reconstruir a fórmula do `sobe` a partir dos percentis brutos — a
média simples dos itens não reproduz o valor. Trate como a escala do eixo: mostre a
distribuição, não afirme unidade que você não confirmou.
`ptBaseline` obrigatório aqui.

### Etapa 10 — Causa ou consequência
`linhas[]` (25) com `indicador, nome, porta, m_sobe, m_meio, m_cai, d_bruto_SM, d_bruto_SC,
rho_persist`. `porta` é `'B'` ou `'D'`. Rótulo da seção, exigido: **"não contrate para isto"**.
`rho_persist: null` existe e tem significado (não há par t/t+1 para aquele item) — escreva o
motivo, não deixe traço.

### Etapa 11 — O teste da mala
`fisico` (`pares` 499, `corte`, `metricas[]` com `{metrica, n, rho}`, `rho_mediano`) e
`tecnico` (`pares_mudou`, `pares_ficou`, `corte`, `metricas[]` com `{metrica, rho_mudou,
n_mudou, rho_ficou, n_ficou}`, `rho_mediano_mudou`, `rho_mediano_ficou`), mais `uso`.
Barras pareadas mudou × ficou, com o físico ao lado. A frase que a tela sustenta está na
especificação; escreva-a com os números vindos daqui.

### Etapa 12 — O funil dos livres
`periodo_da_base`, `degraus[]` (`degrau, n, saiu, serie_b, sul_americanos, brasil`),
`vencem_exatamente_em_dez26`, `vencem_na_janela`, `pct_da_janela_em_dez26`, `por_liga` (mapa
liga → `{n, com_psv, pool}`), `ligas_sem_cobertura_fisica[]`, `pool` (`n, por_liga,
por_posicao, serie_b, sul_americanos`), `conferencia_cruzada` (`fonte, por_confianca,
geral, por_ponte, homonimos_descartados, contrato_ate_2022_2025`).
Cascata clicável com quem saiu e por quê em cada degrau. E o aviso: **dez/26 é calendário,
não oportunidade** — `pct_da_janela_em_dez26` é o número que prova isso. A
`conferencia_cruzada` diz o quanto a data de contrato bate com a outra fonte; é baixa, e
precisa estar na tela.

### Etapa 13 — Nota de encaixe em três pedaços
`n` 603, `pesos` (`fisica`/`duelo`/`estilo`, cada um com `rho_ao_trocar_de_clube: [min,max]`
e `peso`), `nunca_somar: true`, `alvos_por_setor` (`zaga/lateral/meio/ataque` → indicador →
`{d_clube, p_clube, q_clube, bh_clube, bh_atleta, menor, n_atletas_serie_b, pct_sobe,
n_clubes_sobe, pct_caro, pct_barato, pct_cai, …}`; mais `_n_clube_por_cenario`),
`casamento_kpis`, `goleiros_no_pool` 2, `barrados_sc_n_menor_8`, `backtest` (vai **no
cabeçalho** da etapa, por exigência da especificação), `candidatos[]` (603, com `nome, clube,
liga, pos, setor, idade, min, sc_n, sc_min, ctc, ctf, ct, mv, sal, emp, nota_fisica{},
nota_duelo{}, nota_estilo{}, confianca{}`), `trilha_goleiro`
(`motivo_fora_da_esteira, no_pool_operacional, referencia_ZD_no_pool, indicadores[],
candidatos[]`).
`nunca_somar: true` é regra de tela: os três pedaços aparecem **separados**, nunca somados
num número único. O `sc_n` vai ao lado de todo número físico. Liga sem cobertura física
(cruze com `etapa_12.ligas_sem_cobertura_fisica`) é marcada **"sem base para pontuar"**, não
zero. `ptBaseline` obrigatório.

### Etapa 14 — Elenco como faixa
`grade[]` (11 pares `[posição, vagas]`), `forma`, `justificativa_no_dado`,
`taxa_de_subida_por_quartil_pct` (mapa quartil → %), `propostas` — seis chaves:
`A_caro__serie_b`, `A_caro__sul_americano`, `B_barato_transicao__serie_b`,
`B_barato_transicao__sul_americano`, `C_anti_queda__serie_b`, `C_anti_queda__sul_americano`.
Cada proposta: `possivel, cenario, escopo, replicas, alvo, alvo_significa, candidatos, vagas,
denominador_por_vaga{}, vagas_detalhe[]` (`vaga, denominador, recomendacao[{nome,freq_pct}],
alternativas[{nome,freq_pct}]`), `validacao_de_volta{}`, `restricoes{}`, `sem_goleiro`,
`contrafactual{}`.
**Faixa, nunca time:** recomendação é quem aparece em mais de 50% das réplicas, alternativa é
de 10% a 50%. Vaga com `recomendacao: []` acontece e significa que **nenhum nome passou de
50%** — escreva isso, não escolha o primeiro das alternativas. `denominador` ao lado de cada
vaga. `validacao_de_volta` mostra a distância ao alvo; se não bate, a tela diz qual eixo
ficou de fora. `restricoes.infracoes_nas_replicas` conta quantas réplicas violaram cada
restrição — é dado, aparece. `ptContrafactual(p.contrafactual)` e `ptBaseline` em cada
proposta.

### Etapa 15 — Treinador: o que não dá
`tem_nome_de_treinador: false`, `bases_conferidas{}`, `proxy_sistema` (`sistemas_reais`,
`sistemas_sem_regex`, `trocas_medianas_em_38_jogos`, `testes{}` com cinco proxies, cada um
`{m_sobe, m_meio, m_cai, d_SM, p_SM, d_SC, p_SC}`), `coleta_que_resolveria` (`tabela`,
`clube_temporada`, `passagens_estimadas[min,max]`, `fonte`, `raspador_existente`,
`perguntas_que_passariam_a_ser_respondiveis[]`).
Card vazio **com o motivo**, os p do proxy e a lista do que exigiria coletar. Esta etapa é o
melhor exemplo da regra da aba: a ausência é o conteúdo.

---

## 6. Dado que está fora das etapas (você pode precisar)

- `PROTO.gerado_em`, `PROTO.gerado_por` — a tarja de conferência já usa; não repita.
- `PROTO.semente`, `PROTO.replicas{bootstrap_clube, garimpo, nulo_silhueta, jaccard, elencos,
  rapido}` — quando citar um p de permutação, cite as réplicas daquele teste.
- `PROTO.bases{painel, jogos, tecnico, elencos, skillcorner, mercado, kpis}` — arquivo,
  linhas, filtros. Útil na etapa 0 e na 12.
- `PROTO.controles_obrigatorios{baseline_de_dinheiro{auc,acertos_top4,de},
  coluna_liquida_em_toda_linha, assert_ano_max, assert_filtro_competicao}`.
- `PROTO.sobecai_corrigido_por_clube{zaga,lateral,meio,ataque}` — cada setor com
  `n_clube_sobe, n_clube_cai, n_atleta_sobe, n_atleta_cai, testes, bh5_atleta, bh5_clube,
  p5_clube, itens[]`. Cada item: `k, menor, m_sobe_clube, m_cai_clube, d_clube, p_clube,
  q_clube, bh_clube, d_atleta, p_atleta, bh_atleta`. É a correção que trata o **clube** como
  unidade (16×16) em vez do atleta — o teste por atleta pseudorreplica. Pertence à
  etapa 13 (é a origem dos alvos por setor) e pode ser citado na 5.

---

## 7. Antes de entregar

1. `node --check static/proto_X.js` — sem isso, um erro de sintaxe seu apaga **os três**
   arquivos do navegador (scripts irmãos continuam, mas o seu não define nada e as suas
   etapas todas caem no aviso de "ainda não chegou").
2. Abra a aba e confira que **nenhuma** das suas etapas mostra o bloco `pt-erro`.
3. Procure no seu arquivo por número digitado: `grep -nE "[0-9]{2,}" static/proto_X.js` e
   confira um a um. Índice de array e coordenada de SVG podem; número que vira texto na tela,
   não.
4. Confira que todo `null` do JSON que você tocou virou motivo escrito, e não `—`.
