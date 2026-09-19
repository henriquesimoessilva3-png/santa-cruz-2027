# Parado em 17/09/2026, por decisão do dono

## coluna_valor_minutagem.diff
A edição de `gerar_minutagem_serieb.py` que gravava `valor_eur` na aba Minutagem Série B.
Estava no disco sem commit desde 15/09. **Revertida em 17/09**, quando o dono decidiu
tocar direto o `_fonte/estudo_serieb/CLAUDE.md` e não implantar a fila antiga.

O que a edição fazia: acrescentava a coluna `valor_eur` (do Wyscout, "Valor de mercado")
às linhas e ao cabeçalho `colunas`, e escrevia na `regra` a ressalva medida antes de parar —
o valor é **o de hoje**, não o da temporada (o mesmo jogador tem o mesmo valor em todos os
anos em 83% dos casos) e **45% dos valores são zero**, que é preço baixo ou nenhum, não
dado faltando.

Para retomar: `git apply _fonte/prototipo/sessao_14_09/parados_17_09/coluna_valor_minutagem.diff`,
rodar o gerador, pôr a coluna em `static/minutagem_serieb.js`.

Atenção: o estudo novo usa valor de elenco por **clube-temporada** (etapa 1 / Transfermarkt),
não esta coluna por jogador. Esta era item de tela.
