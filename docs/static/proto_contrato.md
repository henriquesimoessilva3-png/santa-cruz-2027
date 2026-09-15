# Contrato da aba Protótipo (e das abas que reusam a casca)

**Este é o único documento que você precisa ler de quem escreveu a casca.** Quem o escreveu
não estará disponível para responder pergunta: o que não estiver aqui, decida você — e
escreva na tela o motivo da decisão.

> **Mudou em 14/09/2026 (casca de dado ativo).** Leia a seção **8** antes de tudo: a casca
> passou a desenhar o dado que recebe (não mais o `PROTO` direto), cada aba tem prefixo de id
> e estado próprios, e há helpers novos de faixa, escala, legenda, conclusões e glossário.
> A seção **9** lista, com arquivo:linha, o que ainda lê `PROTO` direto nos arquivos de etapa
> e o que cada dono tem de trocar. A seção **10** traz as classes de CSS novas.
>
> **Acréscimos do degrau 2 da tela (14/09, só aditivos — nenhum nome publicado mudou):**
> elemento opcional em `ptTabela({el})`, `ptNomeIndicador(id, el)`, `ptNomeMedida(s, el)`,
> `ptNomeCurto(id, el)`, `ptInfoMedida(id, dado|el)`, `ptDicaMedida(id, dado|el)`,
> `ptSorte(p, universo?, el?)`, `ptRegistrarEtapaComEscala(n, el?)`, `ptAoMudarEscala(fn, chave?, el?)`
> (§3, §8.1, §8.5) · `ptUniverso(dado, n)` = o slot de universo da etapa (§8.8) · nomes corrigidos
> nos três campos, no glossário e na guarda da casca (§8.7) · texto do selo lido da régua do dado
> (§8.6) · conclusões ausentes: uma linha no topo, nada nas etapas (§8.6) · porta A dita pelo
> motivo medido (§3, "Vocabulário simples").
>
> **Acréscimos da limpeza de 14/09 (só aditivos — nenhum nome publicado mudou):**
> `ptPortaMotivo(indicador, letra?, el?)` = o motivo gravado DA LINHA, e o resumo da letra só sem ele
> (§3) · `ptInfoColuna(k)` / `ptDicaColuna(k)` = as colunas das tabelas pelo glossário (§8.7) ·
> `ptNum`/`ptInt`/`ptD` nunca mais escrevem "−0" · classes `.pt-rola-vertical` e `.pt-td-frase` (§10) ·
> `.pt-th-vertical` quebra linha e não corta · 25 nomes curtos encurtados no glossário (§8.7) ·
> subtítulos das etapas 8 e 10 e três frases fixas da casca deixaram de afirmar resultado (§11).
>
> **Etapa 6 no mesmo ano (14/09, noite):** título e subtítulo novos em `PT_ETAPAS[6]` ("Anda junto com
> os pontos do ano?") · chaves de `etapa_6.mesmo_ano` documentadas (§5.1) · `rho`, `pares`,
> `dispersao`, `referencia_dinheiro` e `truncamento` ficam no JSON, fora da tela da 6 · verbetes novos
> no glossário (§5.1).

---

## 0. A regra que manda em tudo

**O dado é a fonte, o texto é consequência.**

- Nenhum número digitado no seu arquivo. Nenhum. Se a frase tem número dentro, o número saiu
  do dado ativo (`ptDado()`) naquela chamada.
- Se o JSON mudar, a sua tela muda sozinha. Nada de `if (clube === 'Cruzeiro')`.
- Onde o dado não existe, a tela **escreve a ausência e o motivo** (`ptFalta` / `ptFaltaBloco`).
  Um `—` pelado é defeito, não estilo.
- Texto de tela em português de reunião de clube (diretor, treinador), com o vocabulário único
  de `proto.js` (`ptTamanho`, `ptAcaso`, `ptSorte`, `ptJunto`, `ptAcerto`, `ptTecnico`); o
  número técnico vai ao lado, menor, em `ptTecnico`. **Simplificar nunca é afirmar mais.**
- Comentário em português, em prosa, explicando **por que** — nunca o que a linha faz.

## 1. O que é seu e o que não é

| Você escreve | Etapas |
|---|---|
| `static/proto_a.js` | 0, 1, 2, 3, 4 |
| `static/proto_b.js` | 5, 6, 7, 8 |
| `static/proto_c.js` | 9, 10, 11, 12, 13, 14, 15 |
| `static/proto.js` + `static/style.css` + este contrato | a casca (dono único) |
| `static/proto_glossario.js` | o glossário (dono único; carregado ANTES de `proto.js`) |

**Você NÃO toca em:** `templates/index.html`, `static/app.js`, `static/style.css`,
`static/proto.js`, `static/prototipo.js`, `static/pontos.js`, `gerar_*.py`, `app.py`. Se
precisar de uma classe CSS que não existe, **não crie CSS**: use as da seção 4 e da seção 10,
e `style=""` inline só para geometria de SVG. Se faltar mesmo, diga no relatório final.

**Não redefina nenhum helper `pt…`.** Eles existem em `proto.js` e são globais. Se precisar de
uma função só sua, prefixe com o seu arquivo: `pa…`, `pb…`, `pc…`.

## 2. A assinatura, igual para as dezesseis

```js
function ptEtapa7(alvo, dados) {
  // alvo  = o elemento container, já na tela (HTMLElement)
  // dados = (dado ativo).etapa_7 — na aba Protótipo é PROTO.etapa_7; em outra aba, o bloco dela
  alvo.innerHTML = '…';
}
```

- **Declare com `function`**, não `const ptEtapa7 = …`.
- Escreva em `alvo.innerHTML`. Procure elementos com `alvo.querySelector`, **nunca** com
  `document.getElementById` — duas abas podem ter a mesma etapa na página.
- **Não retorne HTML.** Se reescrever o próprio container depois, chame `ptLigarTabelas(alvo)`.
- A casca chama dentro de um `try`; se estourar, desenha o erro no lugar da etapa.
- O cabeçalho da etapa **e o slot da conclusão da etapa** já estão desenhados pela casca, FORA
  do seu `alvo`. Não repita o título nem desenhe a conclusão.
- Precisa de outro bloco do dado (ex.: a etapa 14 lendo `etapa_13.backtest`)? **`ptDado()`**,
  nunca `PROTO` (seção 8.1).

### Mapa das dezesseis

Na aba Protótipo o prefixo é `ptEt`; em outra aba é o prefixo dela (ex.: `poEt`). O container é
`#<prefixo>-N-corpo`. Você quase nunca precisa dele (o `alvo` já chega pronto).

| Etapa | Função | Arquivo dono |
|---|---|---|
| 0–4 | `ptEtapa0` … `ptEtapa4` | `proto_a.js` |
| 5–8 | `ptEtapa5` … `ptEtapa8` | `proto_b.js` |
| 9–15 | `ptEtapa9` … `ptEtapa15` | `proto_c.js` |

**Id interno:** use `ptId('7-tab')` (→ `ptEt-7-tab` na Protótipo, `poEt-7-tab` na outra). Ids
repetidos entre etapas ou entre abas quebram tabelas e seletores. `ptTabela` já troca o prefixo
de `ptEt-` sozinho no id da TABELA; os outros ids (caixa, seletor, lupa) são responsabilidade sua.

---

## 3. Os helpers compartilhados (de antes de 14/09, todos continuam)

Todos globais, em `static/proto.js`. Além deles: `esc(s)`, `$(sel)`, `$$(sel)` do `app.js`.

### Número

| Helper | Assinatura | Devolve |
|---|---|---|
| `ptNum` | `ptNum(v, casas = 2)` | `'0,828'` — vírgula decimal, milhar com ponto, menos tipográfico (−). Negativo que arredonda para zero sai **sem sinal** (`ptInt(-0.2)` = `'0'`, não `'−0'`). **Não cole `'−'` à mão antes de `ptInt(n)`**: com n = 0 a tela escreve "−0" (era o caso da etapa 12); use `ptInt(-n)` ou teste o zero. |
| `ptInt` | `ptInt(v)` | `'40.059'` |
| `ptPct` | `ptPct(v, casas = 1)` | `'55,0%'` |
| `ptEur` | `ptEur(v)` | `'<span title="29.750.000 €">€ 29,8 mi</span>'` |
| `ptP` / `ptPv` | `ptP(p)` | `'p = 0,056'` / `'0,056'` (sem o "p") |
| `ptD` | `ptD(d)` | `'+0,521'` — sinal sempre explícito (o que arredonda para zero sai `'0,000'`, sem sinal) |
| `ptAno` | `ptAno(v)` | `'2025'` — ano não passa por `ptInt` |
| `ptN` | `ptN(n, unidade)` | o rótulo de n com a unidade |
| `ptMotivos` | `ptMotivos(motivos[])` | legenda dos vazios de uma matriz |

### Vocabulário simples

`ptTamanho(d)`, `ptAcaso(p)`, `ptSorte(p, universo?, el?)`, `ptJunto(rho)`, `ptAcerto(auc)`,
`ptTecnico(html)`, `ptPortaTxt(letra)`, `ptPoucaBase(auc)`, `ptCascaConcorda(n, sing, plur)`.

`ptSorte` aceita o elemento como 3º argumento (ou como 2º, no lugar do universo): o α sai do dado
da aba daquele elemento. Use em redesenho fora de evento.

**`ptPortaTxt('A')`** (14/09, item 17a) = *"resiste ao dinheiro, se repete de um ano para o outro e
vem antes do resultado"* — o motivo que o gerador grava em `porta_motivo` ("sobrevive ao dinheiro,
se repete e prevê o 2º turno"), em português de reunião. **Nunca** "serve para contratar": isso é
receita. Se o seu arquivo tiver texto próprio para a porta A, troque por `ptPortaTxt`.

**`ptPortaTxt('B')`** (14/09, rodada de conserto) = *"separa, mas ou não se repete de um ano para o
outro, ou pode ser sorte de testar muitos parecidos"*. A letra B junta DOIS motivos no dado: 12 dos
17 indicadores B têm `porta_motivo` "não se repete de um ano para o outro" e 5 têm "sobrevive ao
dinheiro mas não sobrevive à família" (esses se repetem). O texto antigo ("não se repete no ano
seguinte") era falso para os 5. Quando a linha tiver `porta_motivo`, ele continua mandando; o resumo
da letra é só para quando não houver motivo da linha.

**`ptPortaMotivo(indicador, letra?, el?)`** (NOVO, limpeza de 14/09) faz essa escolha por você: procura
o `porta_motivo` do indicador em `etapa_2.linhas` do dado da aba e só cai no `ptPortaTxt(letra)` sem ele.
Devolve `{texto, de: 'linha' | 'letra' | null, letra}`. Medido: `ptPortaMotivo('remates_baliza_pct')` =
"não se repete de um ano para o outro (rho=0,097 em 36 pares)", `de: 'linha'`. **Onde a tela mostra o
motivo de UM indicador (célula da etapa 10), use este, não `ptPortaTxt`** — o
resumo da letra B diz "ou não se repete, ou pode ser sorte" de uma medida cujo ρ o catálogo já tem.
Se passar `letra` e a linha tiver outra porta, o motivo da linha NÃO é usado (seria de outra régua).
`de: 'letra'` = a tela está mostrando o resumo; diga isso no `title` se importar.

**O corte de sorte (α) — mudou na rodada de conserto de 14/09.** Não existe mais α de reserva
digitado (o `|| 0.05` saiu).

| Helper | Devolve |
|---|---|
| `ptAlfa(universo?)` | o α. Protótipo: `etapa_0.poder.alfa`. Pontos: o poder é **por universo** (`poder.fisico_tecnico_individual_valor_2022_2025.alfa`, `poder.tecnico_coletivo_2018_2025.alfa`…): com `universo`, o α dele; sem, o α único — **se os universos declararem α diferentes, devolve `null`** (a tela não escolhe um). Hoje os três universos dizem 0,05. |
| `ptAlfaInfo(universo?)` | `{alfa, universos?, motivo?}` — `motivo` é a frase para o `ptFalta` quando `alfa` é null. |
| `ptSorte(p, universo?)` | texto simples (continua passando por `esc`). Sem α: `'sem corte de sorte declarado no arquivo de dados'`. |
| `ptLiquida({…, universo?})` | a linha só acende "de pé" com α declarado; sem ele o `title` diz o motivo. |

Quem conta sobreviventes com um α próprio (`paAlfa`, `pbPassa`…) deve passar a usar `ptAlfa()`.

### Nomes

`ptNomeMedida(s, el?)`, `ptNomeIndicador(id, el?)`, `ptNomeRegua(k)` — e os novos da seção 8.7
(`ptInfoMedida`, `ptDicaMedida`, `ptNomeCurto`). O `el` opcional faz o nome sair do dado da aba
daquele elemento.

### Ausência

```js
ptFalta(motivo)                 // inline, dentro de frase ou célula
ptFaltaBloco(titulo, motivo)    // no lugar de um bloco inteiro
```

### Célula de percentil

```js
ptCel(percentil, { bruto, casas, n, unidade, ano, sinal, texto, motivo, dados })
```

Devolve o `<td>` inteiro. A cor é a distância ao percentil 50 (`sinal: -1` inverte). **No
valor cru (seção 8.5), passe `texto` com o bruto e continue passando o percentil como primeiro
argumento: a cor não muda de escala.** Toda matriz com célula vazia fecha com `ptMotivos`, e
toda matriz de posição fecha com **`ptLegendaPosto()`** (seção 8.4).

### Barra

```js
ptBarra(valor, max, { rot, texto, hachura, cor, extra, dica, motivo })
```

### Tabela ordenável

```js
ptTabela({
  id: 'ptEt-2-tab',            // o prefixo troca sozinho em outra aba
  el: alvo,                    // NOVO, opcional: a aba do elemento decide o prefixo (redesenho fora de evento)
  classe: '',                  // ex.: 'pt-matriz' (seção 10)
  vazio: 'texto quando não há linha',
  ordem: { col: 'gap', dir: 'desc' },
  separadorFora: 'texto',      // NOVO, opcional: o que dizer quando a tabela sai da ordem original
  colunas: [
    { k: 'nome', rot: 'indicador', tipo: 'texto', dica: '…' },
    { k: 'gap', rot: 'gap', casas: 1, cabClasse: 'pt-th-vertical' },   // cabClasse: NOVO
    { k: 'pct', rot: 'posição', cel: (v, l) => ptCel(v, { bruto: l.bruto }) },
  ],
  linhas: d.linhas,
})
```

- **NOVO: `ordenavel: false`** na tabela inteira (`ptTabela({ordenavel:false, motivoFixa:'…'})`) ou
  numa coluna (`{k, rot, ordenavel:false, motivoFixa:'…'}`): o `<th>` sai sem `data-col`, sem clique,
  e o motivo vai no `title`. Exemplo obrigatório: **a tabela de gaps em valor cru** — a mediana crua
  mistura m/min, % e contagem, e unidades diferentes não se ordenam; ali as colunas cruas levam
  `ordenavel:false` e a tabela continua na ordem do gap em percentil.
- `tipo: 'texto'` alinha à esquerda e **quebra linha**; sem tipo é número e **não quebra**.
  **Coluna de frase (ptLiquida, ptTamanho + ptSorte, motivo) tem de ser `tipo: 'texto'`**, senão
  a coluna fica na largura da frase inteira — é o que ainda faz a etapa 9 rolar para o lado.
- `fmt(valor, linha)` devolve o conteúdo; `cel(valor, linha)` devolve o `<td>` inteiro.
- Campos da linha: `_classe` (classe do `<tr>`), `_dica` (title do `<tr>`) e, NOVO,
  **`_separadorAntes: 'html'`** — uma faixa de largura inteira desenhada ANTES desta linha
  (é a **linha da sorte** da tabela de gaps). A faixa só aparece na ordem original; reordenada,
  a tabela diz isso no topo e oferece "voltar à ordem original".
- Ausente vai sempre para o fim.

### Card, controles e navegação

`ptCard(titulo, subtitulo, corpo, nota)`, `ptBaseline({rotulo, auc, acertos, de, motivo})`,
`ptLiquida({d_bruto, p_bruto, d_liq, p_liq})`, `ptContrafactual(cf)` — iguais a antes, agora
lendo o dado ativo. Onde são obrigatórios: `ptBaseline` nas etapas 9, 13 e 14 (cada proposta);
`ptLiquida` em toda linha de efeito (2, 9, 10); `ptContrafactual` ao pé de cada proposta da 14.

`ptIrParaEtapa(n, prefixo?)` rola até a etapa `n` da aba ativa (ou da aba do prefixo).

---

## 4. Classes de CSS que já existiam

`pt-rot`, `pt-nota`, `pt-n`, `pt-card*`, `pt-tab`, `pt-tab-rola`, `pt-cel`, `pt-barra*`,
`pt-falta`, `pt-falta-bloco`, `pt-espera`, `pt-erro`, `pt-controle`, `pt-liq`, `pt-cf`, `pt-tec`.

Cores dentro de `#pgProto` (use `var(--…)`): `--pt-alto` (azul), `--pt-baixo` (laranja),
`--pt-ok` (verde), `--pt-nao` (cinza), e as globais `--tinta*`, `--fundo*`, `--borda*`,
`--veu*`, `--coral*`. SVG à mão, com `viewBox` + `width:100%`.

**Não ponha `max-width:none` em `.pt-nota`** (proto_a.js faz isso em três lugares: ~l.605,
~l.729, ~l.895). A aba agora ocupa a tela inteira; a prosa sem teto vira linha de 200 caracteres.

---

## 5. O que cada etapa tem que mostrar, e onde está o dado

Continua valendo o mapa de chaves da versão de 12/09 (etapas 0 a 15 do `prototipo.json`), que
está no histórico deste arquivo e na `_fonte/prototipo/ESPECIFICACAO.md` (seção 10). Os pedidos
desta rodada estão em `_fonte/prototipo/PENDENTE_RODADA.md`. Na aba de pontos, as chaves com
faixa mudam de nome: use a seção 8.3, nunca a chave digitada.

### 5.1 Etapa 6 — o MESMO ano (pedido do dono, 14/09, noite; decidido, não reabrir)

A etapa 6 deixou de perguntar "isso se repete no ano seguinte?". Cada miniatura é **posição do time
no indicador (horizontal, 0 a 100) × aproveitamento de pontos no MESMO ano (vertical, %)**, nas 80
temporadas 2022-2025, com a cor pela faixa daquele mesmo ano (azul claro subiu, laranja caiu, cinza
o meio), a força escrita e a chance de ser sorte, **da mais forte para a mais fraca**. Nada de ano
seguinte na tela da etapa 6 — nem número pequeno: a diagonal, o ρ de um ano para o outro, a régua do
dinheiro de um ano para o outro e o card dos pares saem de lá.

**O que continua no JSON e não aparece na tela da 6:** `etapa_6.rho`, `pares`, `n_pares`, `dispersao`,
`referencia_dinheiro`, `truncamento`. Não são lixo: o catálogo (etapa 2, persistência), o
`ranking_gaps.py` e o `pcRhoDaEtapa6` do proto_c leem `etapa_6.rho`. A saída da repetição dos
critérios (régua, porta A, frases) é outra rodada — até lá, as outras etapas seguem falando dela.

**O bloco novo, `etapa_6.mesmo_ano`** (grava `gerar_prototipo.py`, função `mesmo_ano`, chamada dentro
de `etapa_6` sem mudar a assinatura; declaração em `MESMO_ANO_DECL`, escrita antes de medir):

| Chave | O que é |
|---|---|
| `declarada_antes_de_medir`, `pedido_do_dono_em` | `true` e a data do pedido |
| `declaracao` | a declaração inteira: `pergunta`, `universo`, `temporadas`, `indicadores`, `eixo_horizontal`, `eixo_vertical`, `cores`, `forca`, `minimo`, `muitos_testes`, `ordem`, `limites` (lista de frases), `fora_do_bloco` |
| `regra` | a declaração em uma frase corrida, pronta para a nota da etapa (os números dela saem do gerador) |
| `temporadas` | lista de `{ano, clube, faixa, pts, jogos, aproveitamento_pct}`, na ordem (ano, clube); `faixa` é `sobe`/`meio`/`cai` do próprio ano; `aproveitamento_pct` = 100 × pts ÷ (3 × jogos) |
| `indicadores` | ids desenhados (famílias `tecnico_col`, `elenco`, `fisico_col_elenco`), na ordem das colunas da matriz |
| `pontos[id]` | lista ALINHADA a `temporadas`: a posição no ranking do ano (0-100, a das células da etapa 5), `null` onde falta |
| `rho_mesmo_ano[id]` | `{rho, p, p_rotulo, q, n}` — Spearman posição × aproveitamento nas temporadas com valor, p bilateral, q de Benjamini-Hochberg entre os indicadores com ρ; com menos de 20 temporadas, `{rho:null, p:null, q:null, n, motivo}`; indicador de uso do elenco traz também `consequencia_do_resultado: true` e `motivo_consequencia` |
| `marca_consequencia` | `{id: motivo}` dos indicadores marcados como consequência do resultado (ex.: "time que ganha repete o XI") |
| `lista_inteira` | `{n_testes, com_p_menor_005, mediana_sorteio, p_excesso, sorteios_com_contagem_maior_ou_igual, p_excesso_formula, sorteios, semente, gerador, embaralha}` — quantos têm p < 0,05 contra 10.000 sorteios do aproveitamento dentro de cada ano (gerador próprio) |
| `ordem_por_forca` | ids por \|ρ\| decrescente, empate pelo id, `null` no fim. **A tela só lê esta ordem**, não reordena |
| `regra_da_ordem` | a regra da ordem escrita |

**Ausência:** se o painel de quem chama não tiver `pts`/`V`/`E`/`D`, o bloco vem
`{ausente: true, motivo, declaracao}`; nos `prototipo.json` e `pontos.json` gravados antes de 14/09,
noite, ele nem existe. A tela escreve a ausência com o motivo, discreta, sem erro.

**Limites que a tela tem de dizer** (estão em `declaracao.limites`, leia de lá): associação no mesmo
ano mistura causa e consequência (quem separa é a etapa 7); o mesmo clube aparece em até 4 temporadas;
o físico do elenco é média só dos atletas rastreados; associação não é receita.

**Glossário:** `ptGlossarioColuna('aproveitamento_pct' | 'rho_mesmo_ano' | 'ordem_por_forca' |
'lista_inteira' | 'mesmo_ano')`. A coluna `rho` do glossário continua sendo o ρ de UM ANO PARA O
OUTRO: não use o verbete dela para rotular o ρ do mesmo ano.

## 6. Dado fora das etapas

`gerado_em`, `gerado_por`, `semente`, `replicas`, `bases`, `controles_obrigatorios`,
`sobecai_corrigido_por_clube` (nos pontos: `alta_baixa_corrigido_por_clube` — use
`ptLer('sobecai_corrigido_por_clube')`, seção 8.3). Sempre por `ptDado()`.

## 7. Antes de entregar

1. `node --check static/proto_X.js`.
2. Abra a aba: nenhuma etapa sua com `pt-erro`, **zero erro no console**.
3. `grep -nE "[0-9]{2,}" static/proto_X.js` e confira número a número.
4. Todo `null` que você tocou virou motivo escrito.
5. **NOVO:** `grep -n "PROTO" static/proto_X.js` só pode achar comentário (seção 9).

---

## 8. A casca de 14/09 — a API nova

### 8.1 Dado ativo

| Helper | O que faz |
|---|---|
| `ptRender()` | **atalho da aba Protótipo**, igual a antes (é o que o `app.js` chama). |
| `ptRender(cfg)` | desenha qualquer dado com a forma do Protótipo (ver abaixo). |
| `ptDado(el?)` | o dado da aba ativa; com um elemento, o da aba daquele elemento. Sem aba desenhada, `PROTO`. |
| `ptPrefixo(el?)` | `'ptEt'` na Protótipo; o prefixo da outra aba. |
| `ptId(sufixo, el?)` | `ptId('13-cand')` → `'ptEt-13-cand'` / `'poEt-13-cand'`. |
| `ptArquivoDado(el?)` | `'prototipo.json'` / o arquivo da outra aba — para frases "o … não traz". |
| `ptAtivarAba(prefixo)` | a casca chama sozinha (render, clique, foco, tecla dentro da aba). |

```js
ptRender({
  dado: PONTOS,                 // obrigatório fora do atalho
  alvo: '#poCorpo',             // elemento ou seletor (padrão '#ptCorpo')
  prefixo: 'poEt',              // prefixo de TODO id da aba (padrão 'ptEt')
  rotulos: { aba, titulo, sub, arquivo: 'pontos.json', global: 'PONTOS',
             script: 'static/pontos.js', gerador: 'gerar_pontos_js.py', nomeAba: 'A aba de pontos' },
  etapas: [...],                // opcional: lista no formato de PT_ETAPAS com títulos da aba
  conferida: false,             // padrão: só o PROTO é conferido; outra aba diz que não foi
  escala: 'percentil',          // escala inicial
});
```

**Como a aba ativa é decidida:** durante o render, é a aba que está sendo desenhada. Depois,
um gancho de `pointerdown`/`focusin`/`keydown` (fase de captura) no documento ativa a aba do
elemento ANTES do seu `onclick`/`oninput` rodar. Então um redesenho disparado por clique
dentro da aba lê o dado certo com `ptDado()`.

**Redesenho fora de evento de usuário** (timer, `requestAnimationFrame`, `IntersectionObserver`,
montagem sob demanda do "tudo aberto"): `ptDado(alvo)` sozinho NÃO basta — `ptTabela` (prefixo do
id), `ptNomeIndicador`, `ptSorte`, `ptBaseline`, `ptRegistrarEtapaComEscala` e `ptAoMudarEscala`
usam a aba ativa. **Embrulhe o redesenho:** `ptComAba(alvo, () => { … })` — ativa a aba do alvo,
roda e devolve a aba que estava ativa. Ou passe o elemento a cada chamada: `ptTabela({el: alvo, …})`,
`ptNomeIndicador(id, alvo)`, `ptNomeCurto(id, alvo)`, `ptSorte(p, universo, alvo)`,
`ptRegistrarEtapaComEscala(n, alvo)`, `ptAoMudarEscala(fn, chave, alvo)`. `ptBaseline`,
`ptLiquida` e `ptContrafactual` não aceitam elemento: para eles, `ptComAba`.

A tarja do topo em aba com `conferida: false` diz "ainda não foram refeitos por outras mãos",
porque o laudo `_fonte/prototipo/CONFERENCIA.md` cobre só o `prototipo.json`.

### 8.2 Estado por aba e caches de módulo

Cada `ptRender` refaz o estado daquela aba: tabelas registradas com o prefixo, observador do
sumário, etapas que usam escala e ouvintes. **Os caches dos arquivos de etapa não são da casca**
— o dono de cada arquivo registra o reset no gancho:

```js
ptAoTrocarDado(function (dadoNovo, dadoAnterior) { … })
// roda quando o dado ativo muda de objeto: no começo de um render e ao passar de uma aba para a outra
```

Registre no **nível de cima** do seu arquivo (proto.js carrega antes). Os caches de hoje:

| Arquivo:linha | Cache | O que registrar |
|---|---|---|
| `proto_b.js:27-30` | `PB_NOMES` (nomes a partir de `etapa_2.linhas`) | `ptAoTrocarDado(() => { PB_NOMES = null; });` |
| `proto_c.js:40-44` | `PC.catalogo` | `PC.catalogo = null` |
| `proto_c.js:57-78` | `PC.clubes`, `PC.clubesMotivo` (o teste é `!== undefined`) | `PC.clubes = undefined; PC.clubesMotivo = undefined` |
| `proto_c.js:30` | `PC.et12`, `PC.et13`, `PC.et14` (estado de tela) | com "tudo aberto" (pedido 4) devem sumir; se ficarem, chaveie por `ptPrefixo()` |
| `proto_a.js:1031` | `PA_ET2` (filtros da etapa 2) | é estado de tela: chaveie por `ptPrefixo()` (`PA_ET2[ptPrefixo()]`) ou zere no gancho |

### 8.3 Vocabulário de faixa

A Protótipo separa por desfecho (`sobe · meio · cai`); a aba de pontos, por aproveitamento
(`alta · media · baixa`). A regra sai do dado: `faixas.chave_interna` (alta ↔ sobe…) e
`faixas.rotulos`. Dado sem bloco `faixas` = Protótipo.

| Helper | Protótipo | Pontos |
|---|---|---|
| `ptFx('sobe')` | `'sobe'` | `'alta'` |
| `ptFx('SM')` / `ptFx('SC')` | `'SM'` / `'SC'` | `'AM'` / `'AB'` (iniciais; confere com `tela.mapa_de_caminhos`) |
| `ptK('m_', 'sobe')` | `'m_sobe'` | `'m_alta'` |
| `ptK('d_bruto_{SM}')` | `'d_bruto_SM'` | `'d_bruto_AM'` |
| `ptFxRot('cai')` (aceita `'baixa'` também) | `'quem caiu'` | `'faixa baixa'` |
| `ptFxRot(f, {forma})` | ver a tabela de formas abaixo | idem |
| `ptDesfechoRot('sobe', forma?)` | `'quem subiu'` | **`'quem subiu'`** — ignora `faixas` sempre |
| `ptFxLista()` | `[{interna, chave, rot, nome, definicao}, …]` na ordem de leitura | idem com alta/media/baixa |
| `ptCaminho(caminho)` | o mesmo caminho | o caminho no dado ativo (ver "Caminhos" abaixo) |
| `ptLer(caminho)` | o valor no dado ativo, pelo caminho traduzido; entende `lista[3]` | idem |
| `ptCampo(lista, campo)` | `campo` | o nome do campo de item de lista no dado ativo |
| `ptRemovida(caminho)` | `null` | `{motivo, caminho}` quando a chave **não existe mais** nesta aba |

**Formas do texto de faixa (mudou na rodada de conserto).** `ptFxRot(f)` sem forma continua
dizendo o que a Protótipo sempre disse. Com dado que tem `faixas`, o nome **não** é mais a
definição com o corte (`'aproveitamento ≥ média do 6º colocado (53,5%)'` — essa é a forma
`definicao`, para `title`).

| `forma` | Protótipo (`sobe` / `meio` / `cai`) | Pontos (`alta` / `media` / `baixa`) |
|---|---|---|
| `padrao` (sem forma) | quem subiu / meio da tabela / quem caiu | faixa alta / faixa média / faixa baixa |
| `quem` | quem subiu / quem ficou no meio / quem caiu | quem ficou na faixa alta … |
| `verbo` | subiu / ficou no meio da tabela / caiu | ficou na faixa alta … |
| `verbos` | subiram / ficaram no meio da tabela / caíram | ficaram na faixa alta … |
| `times` | times que subiram / times do meio da tabela / times que caíram | times da faixa alta … |
| `nome` (cabeçalho; `{curto:true}` é sinônimo) | subiu / meio / caiu | faixa alta … |
| `definicao` | = padrão | `faixas.rotulos[chave]` (com o número do corte) |

De onde sai o nome na aba de pontos, nesta ordem: `faixas.rotulos_formas[chave][forma]` (se o
gerador gravar) → `faixas.rotulos_curtos[chave]` usado como substantivo feminino ("faixa alta") →
a **chave** que o gerador deu à faixa (`'alta'` → "faixa alta"; `media` ganha o acento). A chave é
nome gravado pelo gerador, não palavra inventada na tela.

**Desfecho real não é faixa.** Na aba de pontos, `etapa_5…subiu_de_fato`, `pares[].faixa_posicao_t1`
e `quartis[].subiram_de_fato` falam de quem **subiu e caiu de verdade**. Para esses, use
`ptDesfechoRot('sobe', 'verbos')` — `ptFxRot` trocaria "subiu de fato" por "faixa alta".

**Caminhos (mudou na rodada de conserto).** O mapa é `tela.mapa_de_caminhos.mapa` do próprio dado
(893 entradas hoje, `{prototipo, aqui, troca, nota}`).

- `ptCaminho` tenta a entrada exata e, se não houver, o **prefixo mais longo** que casar, anexando
  o resto: `ptCaminho('etapa_1.top4_de_valor.por_ano')` → `'etapa_1.top_k_de_valor.por_ano'`.
- **Lista:** o mapa escreve `lista[].campo`. Caminho com índice casa com essa entrada e o índice é
  devolvido: `ptCaminho('etapa_1.quartis[2].subiram')` → `'etapa_1.quartis[2].na_alta'`, e
  `ptLer('etapa_1.quartis[2].subiram')` lê o valor. Para ler o campo **dentro de um laço**, pegue o
  nome uma vez: `const cSub = ptCampo('etapa_1.quartis', 'subiram'); quartis.forEach(q => q[cSub])`.
  Outros exemplos medidos: `ptCampo('etapa_1.curva_top_k.curva', 'promovidos_acumulados')` →
  `'alta_acumulados'`; `ptCampo('etapa_1.top4_de_valor.por_ano', 'top4')` → `'top_k'`.
- Campo de objeto que se repete em vários caminhos (o `contrafactual` de cada proposta):
  `ptCampo('*', 'taxa_historica_de_subida_do_quartil_pct')` → `'taxa_historica_de_alta_do_quartil_pct'`
  (só devolve se todas as entradas concordarem; senão o nome original).
- **Chave removida:** 24 entradas têm `aqui: null` (ex.: `etapa_10.linhas[].nome`,
  `etapa_1.curva_top_k.palpite_do_dono.*`). `ptLer` devolve `undefined` e `ptRemovida(c)` devolve
  `{motivo: 'não existe no pontos.json: <nota do mapa>'}`. **Escreva `ptFalta(ptRemovida(c).motivo)`**,
  nunca a ausência muda.

**Só o mecanismo está pronto.** O mapeamento das ~200 leituras com `sobe/meio/cai/SM/SC` e das
~198 frases com "subiu/caiu" em proto_a/b/c é trabalho de cada dono, depois que o `pontos.json`
fechar a conferência. Códigos `CM`/`CR` viram `BM`/`BR` pela mesma regra de iniciais, mas o
gerador dos pontos ainda não conhece esses sufixos — confira antes de usar.

### 8.4 Legenda das matrizes de posição

```js
ptLegendaPosto({ escala?, unidade?, el?, comBotao? })   // devolve <p class="pt-nota pt-legenda-posto">
// sem `unidade`, no valor medido a legenda diz que o arquivo de dados não declara a unidade de todas as colunas
```

Em percentil, diz com todas as letras: **o número da célula não é o valor medido, é a posição
do time no ranking daquele ano, de 0 a 100**. No valor cru, avisa que **o valor mistura anos** e
que **a cor e a ordem continuam as da posição**. Quando a aba tem o botão da escala, a legenda
aponta para ele. **Obrigatória embaixo de toda matriz de posição**, nas duas abas.

### 8.5 Escala: posição no ano × valor medido

| Helper | O que faz |
|---|---|
| `ptRegistrarEtapaComEscala(n, el?)` | chame **na PRIMEIRA linha** de `ptEtapaN`, **a cada desenho**, se a etapa sabe desenhar nas duas escalas. Primeira linha porque `ptLegendaPosto` pergunta se a aba tem botão; a cada desenho porque o registro é refeito a cada `ptRender`. (Ou passe `ptLegendaPosto({comBotao:true})`.) |
| `ptEscala(el?)` | `'percentil'` ou `'cru'` da aba. |
| `ptAoMudarEscala(fn, chave?, el?)` | para o que mora FORA de uma etapa registrada; `chave` evita acumular. |

O botão é **um por aba**, no alto do sumário, e **só aparece quando alguma etapa se registrou**
(botão que não faz nada não aparece) — **ou quando a aba está no valor medido**: aí ele nunca some,
para ninguém ficar preso numa escala que mistura anos. A troca de escala não apaga o registro das
etapas antes de redesenhá-las. Ao trocar, a casca redesenha **inteiras** as etapas
registradas (e só elas); cada uma lê `ptEscala()`. Regras para quem desenha no cru:
texto = bruto na unidade do indicador (`ptInfoMedida(id).unidade`; sem unidade conhecida, diga);
cor = continua o percentil; faixas = `faixa_<g>_bruto` quando existir, senão `ptFalta`;
ordenação = continua pelo percentil. Na tabela de gaps, o cru mostra `mediana_crua`.

### 8.6 Conclusões — um componente só

| Helper | Onde |
|---|---|
| `ptConclusao(c, {prefixo?, dado?, semLink?})` | o bloco de UMA conclusão — use também na aba de conclusões. |
| `ptConclusoesTopo(dado, opts?)` | a casca já põe no topo da aba (depois da procedência, antes dos controles). |
| `ptConclusaoDaEtapa(dado, n, opts?)` | a casca já põe no começo de cada etapa, fora do `alvo`. |
| `ptConclusoesDo(dado)` | **público**: `{itens, cinco, regua, temas, descartadas}` — a aba de conclusões monta "por tema" e "o que parecia conclusão e não é" com isto. |
| `ptAoIrParaEtapa(fn(prefixo, n))` | roda ANTES de rolar até a etapa. **O app.js registra aqui o `irParaAba`** da aba daquele prefixo; também sai o evento `pt-ir` no `document` (`ev.detail = {prefixo, n}`). Sem isso, o link clicado dentro da aba de conclusões rolaria uma seção escondida. |

O bloco de uma conclusão: **selo com todas as letras antes da frase** ("Força da conclusão:
moderado" + o que o selo quer dizer), o tema, o aviso de divergência com o documento (quando
houver), título, frase, número simples, **"O que isto não quer dizer:"** + ressalva, técnico em
`ptTecnico`, e o link "ver a prova na etapa N · título" (`data-pt-ir` + `data-pt-prefixo`).

**O FORMATO, fechado nesta rodada (o gerador ainda não rodou — é aqui que ele tem de bater).**
A tela aceita os DOIS caminhos, item a item:

```js
conclusoes = {
  versao_spec, regua: { selos: {forte:'…'}, selos_simples?: {forte:'frase de reunião'} },
  cinco_que_precisa_ler | cinco: ['DIN-01', …],
  temas: { dinheiro_e_elenco: 'Dinheiro e elenco', … },
  itens | conclusoes: [{
    id, tema, etapa: 'etapa_1' | 1, principal?,
    selo | selo_calculado: 'forte' | 'moderado' | 'fraco' | 'sem_sinal' | 'nao_da_para_afirmar',
    criterios_do_selo?: [{criterio, numero, passou}],          // vai no title do selo
    forca_do_documento?, divergencia_com_o_documento?: true | 'texto',
    // CAMINHO 1 — textos prontos:
    titulo?, frase?, numero?, ressalva?, tecnico?,
    // CAMINHO 2 — molde + lacunas já formatadas:
    molde?: { titulo, frase, numero, ressalva, tecnico },        // com {nome_da_lacuna}
    lacunas?: { nome: { valor, formatado, caminho, motivo_se_null } },
  }],
  descartadas: …
}
```

- **Caminho 1** vale quando o campo pronto existe; senão, **caminho 2**: a tela troca cada
  `{nome}` do `molde` pelo `lacunas[nome].formatado` **gravado pelo gerador**. Isto é troca de
  texto, não conta: a tela não formata, não arredonda e não lê `valor` — por isso o gerador
  TEM de gravar `formatado` (no formato de `spec.formatos`). A regra de antes ("a tela não preenche
  molde") foi trocada por esta, mais estreita: **a tela não formata nem calcula; só troca a lacuna
  pelo texto já formatado.** Se o dono preferir o caminho 1, basta o gerador gravar os textos.
- Lacuna com `formatado` null → `ptFalta(motivo_se_null)`; lacuna pedida pelo molde e ausente em
  `lacunas` → `ptFalta('o gerador não gravou o pedaço “nome” desta frase')`.
- **Selo:** `selo` ou `selo_calculado` (o calculado pela régua). `forca_esperada_hoje` do spec nunca
  é lido. **O que o selo quer dizer sai da régua do dado**, nesta ordem: `regua.selos_simples[selo]`
  (frase de reunião) → `regua.selos[selo]` quando for objeto `{simples | frase | texto, tecnico | regra}`
  → a reserva escrita na casca (`PT_SELOS`, com a condição "lista inteira" de 14/09 no moderado), e
  aí o `title` diz que é reserva. A regra técnica do dado (`regua.selos[selo]` em texto — é assim no
  `conclusoes_spec.json` de hoje, com q, p e BH) vai **ao lado, em `ptTecnico`** e no `title` do selo,
  nunca no lugar da frase. Pedido ao gerador: gravar `regua.selos_simples`.
- Selo desconhecido aparece como veio, com aviso; selo ausente = "não calculada" + motivo; frase
  ausente nos dois caminhos = `ptFalta`. **Hoje o dado não tem o bloco:** o topo escreve UMA linha
  discreta (`.pt-concl-ausente`, 75ch), sem nome de chave nem crase, e **as etapas não escrevem nada**
  (`ptConclusaoDaEtapa` devolve `''`; o slot `.pt-etapa-concl:empty` some). Com o bloco presente e
  nenhuma conclusão daquela etapa, a etapa diz "nenhuma das conclusões do estudo tem a prova aqui".

### 8.7 Glossário e nomes

`ptNomeMedida` / `ptNomeIndicador` procuram, nesta ordem e campo a campo:

1. o que o **gerador** gravou no indicador (`indicadores[]`, `etapa_2.linhas[]`,
   `etapa_5.paineis[*].indicadores[]`): `nome_simples`, `nome_curto`, `unidade`, `definicao`,
   `fonte`, `lado_bom`, `escala`, `fase`;
2. **`ptGlossario(id)`** (`static/proto_glossario.js`): `nome_longo` (o nome da frase),
   `nome` (a forma curta), `mede`, `unidade`, `fonte`, `lado`, `fase`, `por`,
   `compara_com_por_90` — se o arquivo não existir, é pulado sem erro;
3. o nome que a casca já dava (`PT_MEDIDA_CHAVE`, pedaços).

| Helper | Devolve |
|---|---|
| `ptInfoMedida(id, dado?\|el?)` | `{nome, curto, nome_longo, mede, unidade, fonte, lado, escala, fase, compara_com_por_90, origem_nome, aviso_nome}` — campo sem fonte é `null` (escreva a ausência; não chute unidade). |
| `ptDicaMedida(id, dado?\|el?)` | texto para `title`: o que mede · unidade · régua · fase · fonte · lado bom · chave. |
| `ptNomeCurto(id, el?)` | forma curta para **cabeçalho de matriz** (com `ptDicaMedida` no `title`). |
| `ptNomeIndicador(id, el?)` | nome inteiro; medida de setor sempre com o setor. |

Corrigidos em `PT_MEDIDA_CHAVE` (medido no código): `finalizacao` = **gols acima do esperado por
jogo (gols menos xG)** — a conta é `GP/J − xG`, não "aproveitamento das finalizações";
`aprovZ6` = **aproveitamento contra quem terminou do 15º para baixo** — a conta é
`aprov(posAdv >= 15)`, com `posAdv` a posição final do adversário, não "Z4-Z6".

**Rodada de conserto — nomes que afirmavam mais do que a conta:**

| chave | antes | agora | por quê |
|---|---|---|---|
| `defesa_vs_xg` | gols evitados pelo goleiro (contra o xG) | **gols sofridos abaixo do esperado (xG), por jogo** | a conta é do TIME: `xg_contra − GC/J` (analisar_serieb.py:257) |
| `ppda` | pressão (passes do adversário por desarme) | **pressão (passes do adversário por ação defensiva)** | PPDA do Wyscout é por ação defensiva (o pedaço que reescrevia para "por desarme" saiu) |
| `psv`, `psv99` (e `fis_<setor>_psv99`) | velocidade máxima | **pico de velocidade (média dos jogos)** | é a média, entre os jogos, do pico de cada jogo (skill dados-skillcorner; correção de 28/08) |
| `psv5`, `psv99_top5` | velocidade máxima (média das 5 maiores) | **pico de velocidade (média dos 5 jogos mais rápidos)** | idem |
| `gk_def` | defesas | **% de defesas** | é a porcentagem (`gk_save_rate_pct`), não a contagem |

**Degrau 2 (14/09): a correção vale nos TRÊS campos.** Antes só `nome` era trocado, e medido na aba
`ptNomeCurto('fis_zaga_psv99')` devolvia "Velocidade máxima" e `ptNomeCurto('gk_def')`, "Defesas".
Agora:

- **O glossário foi regravado** (`nome`, `nome_longo`, `nome_simples`), com o nome antigo e o motivo
  em `nome_corrigido` em cada entrada trocada — 50 entradas: as 14 de pico de velocidade (psv, psv5,
  psv99, psv99_top5, fis_psv99, fis_psv99_top5 e as 8 de setor), gk_def, defesa_vs_xg, ppda, e as
  33 colunas com unidade % cujo nome se lia como contagem (as 24 `ti_<setor>_…_ganhos/certos/
  com_sucesso` — o catálogo escreve ", %" nelas —, gk_pas, aprovTop6/Mio7/Bot6, bp_conv, pctFicou,
  pctArtilheiro, pctTop3, fidelidade_media).
- **A casca continua de guarda campo a campo**: para as chaves de `PT_NOME_CORRIGIDO` (e as de setor),
  se o glossário marcar `aviso_nome` ou trouxer em `nome`, `nome_longo` ou `nome_simples` um nome da
  lista `PT_NOME_ERRADO` ("velocidade máx…", "por desarme", "pelo goleiro", "defesas"), vale o nome
  da casca — o inteiro em `nome`/`nome_longo`, o curto (`PT_NOME_CORRIGIDO_CURTO`) em `curto`. O do
  gerador continua vencendo tudo.
- Nomes de hoje: `ptNomeCurto('fis_zaga_psv99')` = **Pico de velocidade**; `ptNomeIndicador` =
  "pico de velocidade (média dos jogos) (zaga)"; top 5 = **Pico veloc. 5 jogos** / "pico de velocidade
  (média dos 5 jogos mais rápidos)"; `gk_def` = **% de defesas** nos três; `ti_meio_passes_certos` =
  "% passes certos" / "% de passes certos (meio-campo)".
- `aviso_nome` só sobra onde o nome não é errado mas confunde (`expl` e `fis_*expl_accel_sprint_p90`,
  a mesma coluna com dois nomes); `ptDicaMedida` põe no `title` ("atenção ao nome: …").
- Conferência por script (`conserto_r5_nomes.js --checar`), nas 633 entradas: nome_simples = nome_longo;
  unidade % aparece no nome; régua "pico" diz pico no curto e média no longo e no `mede`; nenhum nome
  da lista de errados; setor na chave = setor no nome. Resultado: 0 problemas (antes, 93). Ficavam 76
  nomes curtos com mais de 22 caracteres (52 de indicador + 24 de coluna).

**Limpeza de 14/09 — nomes curtos encurtados (só o campo `nome`; `nome_longo` e `nome_simples` iguais).**
25 entradas, as que caem em cabeçalho de matriz (painéis da etapa 5) ou de tabela estreita (etapa 13):

| antes | agora | entradas |
|---|---|---|
| Dist. em piques c/ bola · s/ bola | **Dist. piques c/ bola** · **s/ bola** | 10 (time + 4 setores) |
| Dist. alta veloc. c/ bola · s/ bola | **Dist. alta vel. c/bola** · **s/bola** | 10 |
| Dist. alta intens. c/ bola · s/ bola (`hi_c`, `hi_s`) | **Dist. alta int. c/bola** · **s/bola** | 2 |
| Concentração de minutos (`conc_hhi`; o HHI já tinha saído do nome) | **Minutos concentrados** | 1 |
| Após vencer / perder, jogo a jogo | **Pontos após vencer** / **após perder** | 2 |

A fase continua no nome curto; o setor vem da chave. Conferido por script: nenhum nome novo repete o de
outra medida (36 grupos de nome repetido entre medidas diferentes antes, 36 depois — são os de setor).
**Ficam 51 acima de 22, de propósito:** as 27 de "Esperado: / Sorte: … (mando e adv.)" só caberiam com
letra de código (M, M+A), que é jargão, e nenhuma delas está no `prototipo.json`; e as 24 colunas
"… (subiu×meio)", que sem a faixa teriam o mesmo nome para SM, SC, AM e AB.

**Colunas das tabelas pelo glossário (NOVO).** `ptInfoMedida` só lê os indicadores; as colunas
(`m_sobe`, `d_bruto_SM`, `rho_persist`, `porta`, `gap`… — 143 chaves em `PT_GLOSSARIO_COLUNAS`) ficavam
nulas, e o catálogo escrevia os cabeçalhos à mão.

| Helper | Devolve |
|---|---|
| `ptInfoColuna(k)` | `{id, nome, curto, nome_longo, mede, unidade, fonte, lado, escala, existe}`. `curto` traz a faixa ("Tamanho sem dinheiro (subiu×meio)"); `nome` é o `nome_simples` e pode NÃO trazer ("Diferença descontado o dinheiro") — num cabeçalho que não diz a faixa em outro lugar, use `curto`. Na aba de pontos, a chave de coluna já vem com AM/AB: passe `ptK(…)`. |
| `ptDicaColuna(k)` | texto para `title`: o que mede · unidade · régua · chave. Coluna fora do glossário: "o glossário não descreve a coluna k". |

### 8.8 De que universo vem cada número (NOVO na rodada de conserto)

A aba de pontos grava em cada etapa `universo`, `estado_nesta_aba` ('adaptada'/'completa') e
`o_que_mudou`. **A casca desenha isso sozinha**, no cabeçalho da etapa, antes da conclusão
(`.pt-etapa-universo`); na Protótipo as chaves não existem e nada aparece. Não repita no seu `alvo`.

| Helper | Devolve |
|---|---|
| `ptUniverso(texto)` | `<span class="pt-universo">de onde: …</span>` — para ir **ao lado de um número** que vem de um universo diferente do da etapa (ex.: a coluna 2018-2025 dentro da etapa 2). |
| `ptUniverso(dado, n)` | **NOVO (degrau 2): o slot inteiro** "de onde vêm os números desta etapa / nesta aba: o que mudou", lido de `etapa_N.universo`, `estado_nesta_aba` e `o_que_mudou`. É o mesmo bloco que a casca já põe no cabeçalho — use quando precisar dele fora do cabeçalho (aba de conclusões, card). **Na aba Protótipo devolve `''`** (as chaves não existem). |
| `ptUniversoEtapa(dado, n)` | o bloco do cabeçalho (a casca já chama; `ptUniverso(dado, n)` é o mesmo). |

### 8.9 A casca na aba de pontos (medido nesta rodada)

`ptBaseline`, `ptControles`, `ptContrafactual` e a tarja passaram a ler por `ptLer`/`ptCampo`. Rodados
com o `PONTOS`: **zero `ptFalta`** onde a chave renomeada existe (antes: "não traz a contagem por ano
dos elencos mais caros" e "não traz a taxa de subida por faixa de orçamento"). Na aba de pontos o
Controle 1 diz "Dos 24 times da faixa alta, 15 estavam entre os elencos mais caros do seu ano (a lista
muda de tamanho de um ano para o outro: de 4 a 8 elencos)", e o Controle 3 mostra a taxa de faixa
alta **e** a de subida real, com rótulos distintos. `ptAlfa()` = 0,05 nos três universos.

---

## 9. O que ainda lê `PROTO` direto nos arquivos de etapa (trocar por `ptDado()`)

Nenhum destes foi editado pela casca: são dos donos. Na aba Protótipo continuam funcionando; na
outra aba desenham o número do Protótipo sem erro nenhum.

| Arquivo:linha | Lê | Trocar por |
|---|---|---|
| `proto_a.js:164` | `PROTO.etapa_0.poder` | `(ptDado() || {}).etapa_0` |
| `proto_a.js:218` | `PROTO.controles_obrigatorios` | `ptDado().controles_obrigatorios` |
| `proto_a.js:338` | `PROTO.etapa_8.tipologia` | `ptDado().etapa_8` |
| `proto_a.js:929` | `PROTO.etapa_0.por_ano` | `ptDado().etapa_0` |
| `proto_a.js:1277` | `PROTO.etapa_3` | `ptDado().etapa_3` |
| `proto_a.js:1528` | `PROTO.etapa_0.indicadores_pre_declarados` | `ptDado().etapa_0` |
| `proto_b.js:31` | `PROTO.etapa_2.linhas` (cache `PB_NOMES`) | `ptDado()` + reset no `ptAoTrocarDado` |
| `proto_b.js:62` | `PROTO.etapa_0.poder` | `ptDado()` |
| `proto_b.js:275` | `PROTO.etapa_0.por_ano` | `ptDado()` |
| `proto_b.js:315` | `PROTO.etapa_0.por_ano` | `ptDado()` |
| `proto_c.js:42` | `PROTO.etapa_2` (cache `PC.catalogo`) | `ptDado()` + reset |
| `proto_c.js` `pcRhoDaEtapa6` (l.72 em 14/09, noite) | já lê `pcEtapa(6).rho`, não o `PROTO` cru — fica na tabela só para registrar que depende de `etapa_6.rho`, o ρ de um ano para o outro, que continua no JSON mesmo sem aparecer na tela da etapa 6 (§5.1) | — |
| `proto_c.js:58-59` | `PROTO.etapa_5`, `PROTO.etapa_8` (cache `PC.clubes`) | `ptDado()` + reset |
| `proto_c.js:85` | `PROTO.etapa_0.poder` | `ptDado()` |
| `proto_c.js:1235-1236` | `PROTO.etapa_12.ligas_sem_cobertura_fisica` | `ptDado()` |
| `proto_c.js:1485-1486` | `PROTO.etapa_12.ligas_sem_cobertura_fisica` | `ptDado()` |

**Frases de tela que citam "PROTO"** (trocar por `ptArquivoDado()`): `proto_a.js:367`, `:580`,
`:716`, `:1279`.

**Ids fixos fora de tabela** (repetem quando duas abas estão na página — medido: 11 ids) —
trocar o literal por `ptId(…)`: `proto_a.js` `ptEt-2-busca/-pilar/-familia/-setor/-porta/
-limpar/-caixa` (l.1239, 1300, 1311-1333; o `<style>#ptEt-2-caixa …>` inline da l.1300 também
precisa do prefixo); `proto_b.js` `ptEt-5-painel`, `ptEt-5-lupa` (l.423-424, 439, 448) e
`ptEt-6-sel`, `ptEt-6-graf` (l.776, 780, 816, 818 — em 14/09, noite, já não existem no proto_b, e a
etapa 6 do mesmo ano não tem seletor). As buscas já são por `alvo.querySelector`,
então funcionam; o id repetido é HTML inválido e confunde quem ligar evento por id.

**Mapas de texto com faixa**, para trocar por `ptFxRot`: `proto_b.js:100` `PB_FAIXA_COR`,
`proto_b.js:122` `PB_FAIXA_TXT`, `proto_c.js:248` `PC_GRUPOS`, e `PA_ROTULOS` (`proto_a.js:41`).

---

## 10. Classes de CSS novas (14/09)

| Classe | Para quê | Onde |
|---|---|---|
| `pt-matriz` (em `ptTabela({classe:'pt-matriz'})` ou na `<table class="pt-tab pt-matriz">`) | matriz compacta: célula de 3-5 px de respiro, cabeçalho em 2-3 linhas, sem caixa alta | etapa 5 e toda matriz de posição |
| `pt-th-vertical` (em `cabClasse` ou no `<th>`) | cabeçalho de lado, quando nem 3 linhas cabem | matriz com muitas colunas |
| `pt-col-fixa` (no `<td>`/`<th>` da 1ª coluna) | coluna grudada ao rolar ("time e ano") | matrizes |
| `pt-minis` > `pt-mini` > `pt-mini-tit`, `svg`, `pt-mini-num` | grade de miniaturas (~150 px cada) | etapa 6: posição no ano × aproveitamento do mesmo ano, uma miniatura por indicador, da relação mais forte para a mais fraca (ordem de `etapa_6.mesmo_ano.ordem_por_forca`, §5.1) |
| `pt-filtros` > `label`, `select`, `input[type=number]`, `pt-filtro-grupo` > `pt-chip` (`.on`, `.zero`) com `pt-chip-n`; `pt-filtros-conta` | barra de filtros de liga, nacionalidade e idade; chip com 0 fica visível e apagado, com o motivo no `title` | etapas 13 e 14 (fora da área que se redesenha) |
| `_separadorAntes` na linha do `ptTabela` → `pt-linha-sorte` / `pt-linha-sorte-rot` | a linha da sorte, faixa de largura inteira | tabela de gaps (etapa 2) |
| `pt-empate` | marca "empate técnico" ao lado do nome | etapa 14 |
| `pt-marca` (e `pt-marca alerta`) | marca curta numa célula: "consequência do resultado", "descontado o dinheiro", "se repete em 2018-2021" | tabela de gaps, etapa 10 |
| `pt-legenda-posto` (`.cru`) | sai pronta de `ptLegendaPosto()` | toda matriz |
| `pt-concls`, `pt-concl`, `pt-concl-selo` (`.forte .moderado .fraco .sem_sinal .nao_da_para_afirmar .sem`), `pt-concl-frase`, `pt-concl-numero`, `pt-concl-ressalva`, `pt-concl-link`, `pt-concl-ausente` | saem prontas de `ptConclusao` e dos slots | topo, etapas, aba de conclusões |
| `pt-escala` | o botão da escala | a casca desenha |
| `pt-concl-tema`, `pt-concl-diverge` | tema da conclusão; aviso de força diferente do documento | saem de `ptConclusao` |
| `pt-etapa-universo`, `pt-universo` | universo da etapa (cabeçalho) e marca curta ao lado de um número | `ptUniversoEtapa` / `ptUniverso` |
| `pt-th-fixa` | cabeçalho de coluna que não se reordena | sai de `ptTabela` com `ordenavel:false` |
| `pt-rola-vertical` (junto de `pt-tab-rola`: `<div class="pt-tab-rola pt-rola-vertical">`) | NOVO: tabela longa que rola para baixo dentro da própria caixa (34em de altura), com o cabeçalho grudado no topo | candidatos e goleiros da etapa 13 — troca o `style="max-height:34em;overflow-y:auto"` inline |
| `pt-td-frase` (no `<td>`, ou num `<div>` dentro de `td.txt`) | NOVO: célula de frase com largura mínima de 9em, alinhada à esquerda e quebrando linha | troca o `<div style="min-width:9em">` inline de `pcTdTxt` |

**`pt-th-vertical` mudou (limpeza de 14/09):** quebra linha (`white-space:normal`) e não tem mais teto de
altura; cada linha deitada vai até 12em. Antes, `nowrap` + `max-height:11em` cortava nome comprido. O
`style="white-space:normal"` inline do proto_b pode sair. Medido a 1.785 e a 400 px: 283 cabeçalhos
deitados, 0 com texto fora da caixa, o mais alto com 114 px.

**`.pt-liq-par` dentro de célula de tabela quebra linha** (fora de tabela continua inteiro): a coluna do
`ptLiquida` no catálogo não fica mais presa em ~360 px.

**Celular (400 px), rodada de conserto:** abaixo de 1.080 px o número técnico (`.pt-tec`), o
complemento da barra, `.pt-n`, `.pt-liq-par`, as marcas e os chips **quebram linha**; abaixo de 720 px
a linha de `ptBarra` empilha (rótulo, barra e número) e as grades de controle viram uma coluna.
`.pt-tec` agora quebra entre palavras em qualquer largura (menos em `td.num`). Medido a 400 px:
**0 elementos da aba passam da borda fora de uma caixa com rolagem** (antes, 145 cortados em
silêncio pelo `.emp-rolagem`). As tabelas continuam rolando dentro da própria caixa, que é o
permitido. **Não ponha `white-space:nowrap` inline** em texto de frase: é o que volta a cortar.

**Largura (pedido 14):** a aba não tem mais teto de 1.240 px (respiro lateral de 10 a 28 px);
sumário de 172 px, fixo; cabeçalho de tabela e célula `txt` **quebram linha**; célula `num`
**não quebra**; `.pt-sub` e `.pt-nota` com ~75 caracteres. Medido a 1.785 px, com a aba
Protótipo de hoje: **de 44 caixas de tabela, 31 rolavam para o lado; agora 5**, e as 5 pedem
redesenho de quem é dono da etapa:

| Caixa | Largura do conteúdo / da caixa | Por quê | Dono |
|---|---|---|---|
| `ptEt-2-tab` (catálogo) | 5.586 / 1.509 px, 31 colunas | colunas demais: juntar pares numa célula (alvo ~12) | proto_a.js |
| matriz da etapa 5 | 2.673 / 1.509 px, 32 colunas | usar `pt-matriz` + `ptNomeCurto` no cabeçalho | proto_b.js |
| `ptEt-9-crus-3`, `-6`, `-7` | 1.531 a 2.347 / 1.475 px, 6 colunas | frase em coluna sem `tipo:'texto'` não quebra | proto_c.js |

**Remedido no degrau 2 (14/09, porta 5104, com os arquivos de etapa no meio da reescrita dos donos —
é retrato, não laudo):** a 1.785 px rolam **4**: `ptEt-2-tab` 1.778 / 1.509, e `ptEt-9-crus-3/-6/-7`
1.530, 2.347 e 2.221 / 1.475. A matriz da etapa 5 já não rola. A 400 px: 0 elementos cortados fora
de caixa com rolagem, página sem rolagem lateral, zero erro no console nas duas larguras.

**Remedido na limpeza de 14/09 (porta 5121, os arquivos de etapa ainda sendo escritos pelos donos —
retrato):** a 1.785 px, **0 caixas rolam para o lado** e a página não rola; a 400 px, 0 elementos cortados
fora de caixa com rolagem (61 tabelas rolam dentro da própria caixa, o que é permitido); 16 etapas, 0
`pt-erro`, zero erro no console nas duas larguras; `ptRender()` em ~650 ms só de JS.

---

## 11. Texto fixo da casca: o que ele pode dizer (limpeza de 14/09)

Frase que nenhum campo do dado controla só diz **do que se trata**, nunca **o que se achou**. Três
casos trocados na casca:

| Onde | Antes | Agora |
|---|---|---|
| `PT_ETAPAS[8]` | "Os padrões que não pararam de pé" / "por que esta aba não separa os times em grupos — e o pouco que sobrou" | "Os padrões de jogo, testados" / "os times se separam em grupos de estilo? o que o teste mostrou, grupo por grupo" |
| `PT_ETAPAS[10]` | "… é o próprio resultado dito de outro jeito: não contrate para isto" (falso para as linhas B, e imperativo) | "o que separa os times, mas não passou em todas as provas — e o motivo de cada um" |
| subtítulo do topo | "A maior parte não passou — …" | "O que não passou continua na tela, com o número que o reprovou ao lado." |
| Controle 2 | "Time mais caro tende a ter mais de quase tudo." · "**Time pobre tem mais jogador sem preço.**" (fixo, com qualquer ρ) | "pode ter mais de quase tudo só por ser mais caro" · a conclusão só aparece com ρ > 0 e p abaixo de `ptAlfa()`; fora disso, "Não se viu, com segurança, …" |
| `PT_MEDIDA_CHAVE.nucleo_300` | "jogadores com 300 minutos ou mais" digitado | o corte sai do nome da chave (`nucleo_<N>`) em `ptNomeMedida` |
| tarja `pt-tarja-ok` (`ptTarja`) | a conclusão da revisão em texto fixo: "bateu item a item, sem nenhuma diferença", "etapas 1 e 3 bateram número a número", "**a lista de antes estava errada**", "o que está na tela já é o resultado corrigido" | "passaram por uma conferência independente"; a conclusão fica no laudo (`_fonte/prototipo/CONFERENCIA.md`), com o motivo dito: o resultado da revisão não é gravado no dado, e a tela não tem como saber se a conta já é a posterior aos consertos |
| tarja, parágrafo do nº de atletas | "ninguém estava descontando: **quem sobe usa menos jogadores**" e "isso não é o dinheiro disfarçado" (fixos) | o negrito sai do sinal de `media_sobe − media_cai` com `p_SC` abaixo de `ptAlfa()`; fora disso, "Não se viu, com segurança, …". Sobre o dinheiro: `p_atletas_x_valor` abaixo do corte → "Parte disso pode ser o dinheiro"; acima do corte e ρ nas faixas fracas de `ptJunto` → "Não se viu o dinheiro por trás disso"; resto → "Não se viu, com segurança, …" |
| Controle 3, nota da soma | "Quem fica sem preço costuma ser jogador pouco conhecido — a falta não é por acaso" (nenhum campo mede quem são os sem preço) | só a conta: o preço que falta não entra na soma, então o total é um piso |

A mesma regra vale nos arquivos de etapa (abertura da etapa 10 em proto_c, nota do mapa físico da etapa 8
em proto_b): monte a oração a partir do campo que a sustenta, ou diga só do que se trata.
