# Plano de design — relatório "Revisão do estudo de acesso"

Tratamento: documento utilitário com craft editorial — é lido de cima a baixo por um
analista que vai implementar; não é landing page. Honra o sistema visual do app (dark-first,
o par sobe/cai azul × laranja, números tabulares, rótulos em caixa alta espaçada).

## Cor (tokens)
- ground   #0f1218  (preto com viés azul — o mesmo fundo da aba)
- surface  #161b24
- ink      #e6e9ee
- muted    #8b94a5
- rule     #262d39
- sobe     #3f9fcc  (o azul do estudo — quem sobe)
- cai      #c08420  (o laranja do estudo — quem cai)
- alerta   #d24a43  (só para "gravidade alta" e "descartado")
Tema claro: ground #f4f5f7, surface #ffffff, ink #171c26, muted #5b6473, rule #dfe3ea;
sobe #0f6f9e, cai #b0640c, alerta #b8302a.

## Tipo
- Display: **Barlow Condensed** 600/700 — condensado como placar de estádio, sem ser
  Oswald; letter-spacing leve em caixa alta para eyebrows.
- Corpo: **Source Serif 4** 400/600 — relatório se lê; serifa dá fôlego a parágrafos longos.
- Utilitário: **JetBrains Mono** 400/600 para todo número, tabela e código de coluna
  (`conc_hhi`, `gkDefesas`), tabular-nums.
Fallbacks: "Arial Narrow", sans-serif / Georgia, serif / ui-monospace, monospace.
Escala: 13 / 15 (corpo) / 18 / 24 / 34 / 48.

## Layout
Coluna única de ~68ch para texto; tabelas e o mapa de calor rodada × posição em container
próprio com overflow-x. Índice fixo à esquerda em telas largas (≥1100px), com as nove
partes do relatório. Cada seção revisada abre com a linha de veredito e as três notas
(rigor · clareza · organização) como chips. Uma única marca recorrente: a régua de 0,22 —
aparece como fio pontilhado onde uma correlação é julgada.

## O detalhe só deste assunto
O mapa de calor "rodada × posição → chance de subir" desenhado como tabela de campeonato
(rodadas nas colunas, faixas de posição nas linhas), com a linha de 2026 destacada; e os
vereditos usam o vocabulário do estudo: sobe/cai, posto, régua, "passa/não passa".
