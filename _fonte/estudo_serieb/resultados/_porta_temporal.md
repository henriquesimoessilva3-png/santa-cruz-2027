# A porta temporal sobre os oito componentes do índice do A14

**19/09/2026.** Gerado por `scripts/_porta_temporal.py`; a tabela em campos está em
`_porta_temporal.json`. **Isto é evidência, não correção:** nenhuma conclusão, nenhum `<ID>.json`
e nenhum script existente foi tocado.

A cascata de 19/09 pediu este teste como "o mais barato que resta, e o único que decide se a régua
descreve o que o time fez ou o que o time é". Ele foi rodado. O resultado é pior do que a cascata
supunha, por um motivo que só aparece lendo o código das três partes que diziam ter rodado a porta.

---

## 1. Achado zero: nenhuma das três partes rodou a porta da §6.4

A cascata disse que a porta temporal foi rodada em 3 das 19 partes (A02, A06 e A13). Lendo o código,
as três fazem coisas diferentes, e **nenhuma faz o que a §6.4 define**:

| parte | o que o código realmente calcula | é a porta? |
|---|---|---|
| **A02** | indicador da 1ª metade × **o próprio indicador** da 2ª metade, Spearman, e chama de `se_repete` quando p<0,05 e rho>0,30 | não — é **persistência** dentro da temporada |
| **A06** | idêntico ao A02, nos mesmos moldes | não — persistência |
| **A13** | pontos / posição / saldo de xG do 1º turno × **posição final** (que contém o 1º turno), Spearman, **sem a parcial** | não — é a porta sem o desconto, e com o desfecho contaminado |
| **§6.4** | média do indicador nas **19 primeiras** rodadas × **pontos somados das 19 últimas**, em posto dentro do ano, com **parcial dada a pontuação do 1º turno** | é esta |

O limiar `rho > 0,30` que A02 e A06 usam é o `rho_persist ≥ 0,30` que a §6.5 **aposentou em
15/09**. Ou seja: as duas partes marcam como aprovado num critério que o dono retirou, com o nome
de um critério que ele manteve.

**Escolhi a §6.4**, por duas razões: o `CLAUDE.md` do estudo manda que, onde ele e a especificação
divergirem no método, valha a especificação; e é a §6.4 que a §6.5 lê nos campos `p_1T_2T` e
`rho_1T_2T` para decidir a porta A. A conta de A02/A06 fica na saída, com o nome certo
(`persistencia_conta_do_a02_a06`), para comparação.

**Consequência do achado zero:** das 19 partes, **zero** rodaram a porta como a especificação a
define. A frase da cascata "só 3 das 19" era generosa.

## 2. A receita, conferida célula a célula

A §6.4 publica uma tabela de nove indicadores. Reproduzi-la exigiu fixar três detalhes que o texto
não escreve, e que ficaram travados no script porque só assim a tabela bate:

1. **Posto dentro do ano** para o indicador, para os pontos do 1º turno e para os do 2º.
2. **ρ = Spearman sobre esses postos.** Pearson dá −0,443 onde a §6.4 tem −0,439.
3. **Parcial = resíduo por MQO contra o posto dos pontos do 1º turno, e Spearman entre os dois
   resíduos.** A fórmula fechada de parcial de Pearson dá −0,343 onde a §6.4 tem −0,289.

Com isso as **nove linhas saem idênticas**, inclusive `Distância média do remate` −0,439 / parcial
−0,289 (p 0,009) e a referência "pontos do 1º turno" +0,496. A conferência roda junto do script e
vai para o JSON em `conferencia_6_4`: 9 de 9 batem. É a garantia de que o método aqui é o da casa,
não uma reimplementação minha.

**Base:** 3.036 linhas de Série B em 2022–2025, 80 clube-temporadas (76 com 38 jogos, 4 com 37),
corte na rodada 19. A temporada sai dos blocos de meses com jogo (a armadilha registrada do A01,
função copiada de lá) — neste recorte ela coincide com o ano da data em 100% das linhas, mas a
função fica. Os pontos por turno batem com `classificacao_rodada.csv` em **80 de 80**.

**Critério de passar:** parcial com p < 0,05 **e** sinal positivo na escala alinhada (alto = melhor),
que é exatamente a porta A da §6.5. O BH não entra: a §6.5 lê `p_1T_2T` bruto, porque o BH é do
teste de separação, não da porta.

## 3. A tabela

Tudo na escala alinhada do A14 (alto = melhor). `dist_remate`, `xg_por_remate_contra` e `xgc_casa`
têm sinal −1 e entram invertidos.

| componente | n | ρ | p | **parcial** | **p** | passa |
|---|---:|---:|---:|---:|---:|---|
| H_dinheiro | — | — | — | — | — | **não calculável por turno** |
| **dist_remate** | 80 | +0,439 | 0,0001 | **+0,289** | **0,0094** | **SIM** |
| **E_qualidade_chance** | 80 | +0,411 | 0,0001 | **+0,254** | **0,0228** | **SIM** (ver §5) |
| xg_por_remate_contra | 80 | +0,208 | 0,0635 | −0,026 | 0,8213 | não |
| duelos_def_pct | 80 | +0,121 | 0,2858 | +0,092 | 0,4160 | não |
| I_estabilidade_11 | — | — | — | — | — | **não calculável por turno** |
| xgc_casa | 80 | +0,282 | 0,0112 | +0,134 | 0,2363 | não |
| dd_casa | 80 | −0,027 | 0,8139 | −0,026 | 0,8183 | não |

**Placar: 2 de 8 passam, 4 reprovam, 2 não são testáveis.**

### Leitura, sem jargão

| componente | característica ou consequência? |
|---|---|
| H_dinheiro | Não dá para saber: elenco caro só existe medido na temporada inteira. |
| dist_remate | **É característica.** O time que já chuta de perto nas 19 primeiras rodadas pontua mais nas 19 seguintes mesmo comparado com quem vinha pontuando igual. |
| E_qualidade_chance | **É característica** — mas só por causa do chute de perto que está dentro dela (§5). |
| xg_por_remate_contra | Parece consequência. Saber quem só cede chute ruim no 1º turno não acrescenta nada sobre o 2º depois de saber quantos pontos o time já tinha. |
| duelos_def_pct | Parece consequência. Idem. |
| I_estabilidade_11 | Não dá para saber: time repetido só existe medido na temporada inteira. |
| xgc_casa | Parece consequência. Idem. |
| dd_casa | Parece consequência — e nem separa: ρ bruto −0,027. |

## 4. Os dois que não são calculáveis por turno — e por que os dois casos não são iguais

**`H_dinheiro`** (`tm_valor_total`, `tm_valor_mediana`) é um instantâneo por temporada do
Transfermarkt. Não existe por rodada: não há como medir "só no 1º turno". Pela regra da casa
("quem não tem versão por jogo não chega à A"), ele não passa a porta.

**`I_estabilidade_11`** (`share_11`, `conc_hhi`, `atletas_usados`, `nucleo_300`) sai de
`dados/minutagem_serieb.json`, que guarda minutos por jogador-clube-**temporada**; `serieb_jogos.csv`
tem 119 colunas e nenhuma é escalação (só `Sistema`, a formação). A §6.5 **já registra** este teste
como impossível com o dado atual. Confirmado: continua impossível.

A diferença entre os dois, que importa: o dinheiro é um **valor** que não se acumula jogo a jogo,
enquanto a estabilidade do onze é **medida sobre os jogos — inclusive os do 2º turno**, que é o
próprio desfecho. Por isso o JSON registra um complemento honesto para cada um, o valor da
temporada inteira contra os pontos do 2º turno, com ressalvas diferentes:

| | ρ | parcial | p | ressalva |
|---|---:|---:|---:|---|
| H_dinheiro (valor da temporada) | +0,514 | **+0,405** | 0,0002 | instantâneo de mercado sem data conhecida: pode ter sido atualizado no meio da temporada |
| I_estabilidade_11 (valor da temporada) | +0,424 | +0,202 | 0,0720 | **circular**: a janela de medida invade a janela do desfecho |

**Nenhum dos dois conta como passar** — não é a porta. Mas o contraste é informativo: o dinheiro,
que é a única coisa do índice plausivelmente anterior à temporada, é de longe o previsor mais forte
do 2º turno depois de descontar o 1º (+0,405); e a estabilidade do onze não alcança 0,05 **nem**
no número circular que a favorece.

## 5. A ressalva que derruba metade do placar: E passa por causa de dist_remate

`E_qualidade_chance` é a média de quatro itens alinhados, e **um deles é `dist_remate`** — que é
componente separado do índice. Os dois "SIM" da tabela não são independentes. Abrindo a régua:

| item da régua E | ρ | parcial | p | passa |
|---|---:|---:|---:|---|
| dist_remate | +0,439 | +0,289 | 0,0094 | **sim** |
| xg_por_remate | +0,274 | +0,093 | 0,4130 | não |
| toques_area | +0,219 | +0,136 | 0,2305 | não |
| entradas_area | +0,293 | +0,211 | 0,0599 | não |
| **E sem dist_remate (3 itens)** | +0,353 | **+0,191** | **0,0895** | **não** |

A §6.5 tem regra dura para este caso: *"a unidade de teste é o INDICADOR CRU. Eixo composto serve
para desenhar régua na tela, nunca como única unidade de teste; quando os itens de um eixo
discordam, publica-se o item."* Os itens discordam. **O que passa a porta é `dist_remate`, uma
coisa só, contada duas vezes no índice.**

## 6. E o duelo defensivo, o único que a cascata dava como aprovado?

A cascata escreveu: *"dos 8 componentes do índice do A14 só um passou (duelos_def_pct), e com o rho
mais fraco dos seis que o A06 mediu."* **Isso precisa ser corrigido, e para pior.** O que o A06
mediu em `duelos_def_pct` foi persistência (+0,319, p 0,004 — o indicador é estável de uma metade
para a outra), não a porta. Rodando a porta de verdade: ρ +0,121 (p 0,286), parcial +0,092
(p 0,416). **`duelos_def_pct` não passa, e nem separa no bruto.**

Ou seja, o cruzamento da cascata ("sobra UM") estava certo no número e errado no nome: o
componente que sobrevive não é o duelo defensivo — é a distância do remate, que nunca tinha sido
cruzada porque o A02 e o A06 não a mediram por esta régua.

## 7. Uma checagem extra nos dois componentes de mando

`xgc_casa` e `dd_casa` são medidos só em casa mas foram testados contra os pontos **totais** do 2º
turno, o que dilui. Refazendo contra os pontos **de casa** do 2º turno:

| | ρ | p | parcial | p | passa |
|---|---:|---:|---:|---:|---|
| xgc_casa | +0,226 | 0,0435 | +0,082 | 0,4682 | não |
| dd_casa | −0,026 | 0,8213 | −0,009 | 0,9393 | não |

Não muda nada. Os dois continuam do lado da consequência.

## 8. O que isso faz com o índice do A14 — dito, não aplicado

Nenhuma correção foi feita neste trabalho. O que a evidência sustenta, para quem for decidir:

- Dos oito componentes, **um** (`dist_remate`) tem prova de que vem antes do resultado. Um segundo
  (`E_qualidade_chance`) só passa porque contém o primeiro. Quatro ficam do lado da consequência.
  Dois não são testáveis — e um deles, a estabilidade do onze, a §6.5 já mandava não usar para
  contratar.
- A regra da casa define **firme** como BH a 5% **E** porta temporal. Nenhuma conclusão apoiada no
  índice inteiro pode carregar esse selo: seis dos oito componentes não têm a segunda metade do
  critério, e quatro deles foram testados e reprovaram.
- A cascata já propunha aceitar "provável" como teto do índice. Esta medição sustenta a proposta e
  aperta o argumento em dois pontos: o componente que se acreditava aprovado não está, e o mais
  forte previsor do que vem depois é o dinheiro — que não é característica de jogo, é ponto de
  partida.

## 9. Limitação

n = 80 clube-temporadas em todas as linhas: é pouco para a parcial, e um "não passa" aqui não é
prova de que o efeito não existe. Com n=80 e uma covariável, a parcial detectável a 80% de poder
fica em torno de 0,31 — acima de quatro das seis parciais medidas. A porta separa quem tem prova
de anterioridade de quem não tem; ela não produz prova de ausência.

Além disso, a própria §6.4 avisa: mesmo o teste do 1º→2º turno é associação dentro da mesma
temporada, com o mesmo elenco. Passar a porta não autoriza escrever "faça X e você sobe".
