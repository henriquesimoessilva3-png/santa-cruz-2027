# Santa Cruz 2027 — contexto

App de montagem de elenco e folha salarial. Roda em `localhost:5090`; o portal do
clube, em `localhost:5091` (`hub/`). Nada a ver com o hub do Botafogo (`:5555`) —
ambientes separados, a pedido.

Repositório **privado**: `henriquesimoessilva3-png/santa-cruz-2027`.

## A conta do orçamento (definida pelo usuário)

Os R$ 2,8 MM são o **custo total mensal**, não a folha:

```
custo total máximo          2.800.000
− comissão técnica            300.000   (editável; pode ser montada cargo a cargo)
= disponível para atletas   2.500.000
÷ encargos                       1,25   (editável)
= massa salarial            2.000.000   ← é isto que se distribui no campograma
```

O salário digitado no card é o que vai para o jogador. Elenco alvo: 26 a 30 atletas,
3 vagas por posição. **Limite de estrangeiros: 9** (nasceu 5 e foi corrigido; há
migração `v<4` para os grupos gravados com o valor antigo).

## As bases (geradas por script, não versionadas à mão)

| Arquivo | Gerado por | Vem de |
|---|---|---|
| `dados/jogadores.json` (14,8 MB) | `preparar_base.py` | `fim_contrato_<per>.json` + `rankings_<per>.json` + `skillcorner_<per>.json` |
| `dados/kpis.json` (16,6 MB) | `preparar_kpis.py` | `kpis_detail_<per>.json` |
| `dados/kpis/<POS>.json` | `dividir_kpis.py` | quebra do anterior — **é o que a tela usa** |

Origem: `Portal Ranking/output/` do Botafogo Analytics. Período atual: **ago26**.

**O cadastro vem do fim de contrato, não do ranking.** O ranking só enxerga quem tem
minutagem (18.281); o fim de contrato enxerga o elenco inteiro (40.059). Nas ligas
brasileiras isso é a diferença entre 984 e 3.613 jogadores. Quem não está no ranking
aparece com cadastro, contrato e salário estimado, e sem barras na ficha.

## Armadilhas que custaram tempo

- **`primary_key` é nula para quem não tem minutagem** (19.072 registros). Deduplicar
  por ela joga fora metade da base. A chave é `primary_key` ou, na falta,
  `"<Player> - <Team> - <league>"`.
- **O `id` do jogador muda a cada regeração da base.** Os elencos gravados guardam a
  `pk`; o `id` só é aceito se o nome bater. Há `reancorar()` no carregamento. Sem
  isso, o "+" de um jogador abria a ficha de outro.
- **O navegador guardava o JSON antigo por uma hora** (`max_age=3600`), e colunas
  novas vinham vazias. Bases e estáticos são versionados pelo mtime.
- **Cabeçalho e células da tabela em lugares diferentes** desalinham a qualquer coluna
  nova. Hoje `COLUNAS` e `FC_COLUNAS` geram os dois.
- **Uma data URI de SVG dentro de `<link rel="icon">` não sobrevive a um replace por
  regex** — o corte no primeiro `>` deixou um `<rect>` solto que engoliu a página
  inteira (o `<main>` ficou dentro dele, e a área do campo caiu de 826 para 572px).
- **O salário do TransferRoom é faixa ANUAL em euros** ("150K - 220K"). A tela
  converte para reais por mês com a cotação do modal Orçamento (padrão 6,30).
- **Capology não publica salário do futebol brasileiro** — o campo vem nulo. Todo
  salário é digitado, exceto a estimativa do TransferRoom (766 brasileiros).

## Campograma — por que o código é o que é

Sete colunas: goleiro, zagueiros, **laterais**, volante/médio, meia, **extremos**,
centroavante. Laterais e extremos são colunas "abertas": ficam no topo e na base,
enquanto as vizinhas ficam centradas — foi assim que se descasaram dos zagueiros e
do meia, a pedido.

- **A largura é única e calculada, nunca por tentativa.** Uma versão anterior reduzia
  ao detectar encosto, redesenhava, via que cabia, voltava ao tamanho cheio e colidia
  de novo — o vai-e-vem parava num valor pequeno e os nomes viravam "G...". Como a
  altura do card não depende da largura (o nome sempre cabe numa linha), `maiorLargura
  QueCabe()` simula as posições e escolhe de uma vez.
- **Existe uma altura mínima que separa as pontas do miolo.** Sem ela, em tela baixa
  os cards dos laterais alcançam os do meio e a largura despenca (150px contra 376px).
- **O nome é abreviado como na súmula** quando não cabe: "Matheus Trindade" vira
  "M. Trindade". O limite sai da largura real do card em pixels, descontando a estrela
  de titular (9px) e o selo de estrangeiro (29px) — a conta por caractere superestimava.
- **`transform: scale` não encolhe a caixa no fluxo**: sem descontar as margens,
  sobra espaço e aparece barra de rolagem à toa (`compensarEscala`).
- No modo **caber na tela** (padrão) a área não rola. Em **tamanho real** ela rola —
  preferível a esconder parte do elenco atrás de `overflow:hidden`.

## Publicação

Preparado para **Render** (`render.yaml`): Flask com senha (`SC_SENHA`, HTTP Basic),
bases servidas como arquivo (nada na memória — o plano gratuito tem 512 MB) e disco
de 1 GB para os grupos salvos. GitHub Pages não serve: é sempre público e não roda
backend, e o usuário quis acesso restrito com grupos compartilhados.

**Falta o usuário criar a conta no Render** — não é algo que eu faça por ele. Passo a
passo em `PUBLICAR.md`. Depois, pôr o endereço no card do portal (`hub/hub_santacruz.py`,
chave `web`, hoje comentada).

## Pendências

- **Rename do CA** — pedido em outra sessão, sem detalhe do que muda. Perguntar.
- ~8 nomes de 44 ainda cortam com reticências em telas estreitas (o completo está no
  tooltip e na ficha).
- A ficha compara com a coorte da liga; para ligas pequenas a amostra fica curta e
  isso não aparece na tela.
