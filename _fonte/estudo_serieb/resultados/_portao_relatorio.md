# Portão de entrega — a primeira rodada nas 22 partes

> Rodado em 19/09/2026: `python3 scripts/_portao.py`, as nove regras da etapa 6 do `PLANO.md`.  
> **Todo número daqui vem da saída do portão** (`--json`), transcrito por script; nenhum foi
> digitado à mão. O detalhe máquina a máquina está no `_portao_relatorio.json`, ao lado.  
> A rodada não alterou nada: o portão só lê, e este relatório e o JSON são os dois únicos
> arquivos que ela escreveu.

## O veredito

**0 de 22 partes passam.** São 131 reprovações
regra×parte, 4 pedidos de revisão à mão, 51 aprovações e
12 não-se-aplica, nas 22×9 = 198 conferências.

Nenhuma parte reprova por pouco: a que está mais perto de passar falha em
4 das nove regras, e a mais distante em 7.

| regra | o que ela cobra | reprova | revisar | passa | n/a |
|---|---|---|---|---|---|
| 1 | todo marcador consta na saída do próprio script | 22 | 0 | 0 | 0 |
| 2 | a confiança recalculada do testes.csv | 20 | 1 | 1 | 0 |
| 3 | os dois cortes de fronteira, e citar os dois quando discordam | 20 | 1 | 0 | 1 |
| 4 | a prova existe e não está vazia | 2 | 0 | 20 | 0 |
| 5 | o script importa o _metodo.py | 9 | 2 | 11 | 0 |
| 6 | nenhuma palavra proibida na manchete e no que vimos | 11 | 0 | 11 | 0 |
| 7 | nenhum indicador publicado com dois q | 3 | 0 | 8 | 11 |
| 8 | o _registro.md é gerado, não editado | 22 | 0 | 0 | 0 |
| 9 | o gerado_por é verdade ou não existe | 22 | 0 | 0 | 0 |

## Três consertos valem 66 das 131 reprovações

Dois terços do que o portão recusa não é defeito de uma parte: é máquina que não existe.
Enquanto ela não existir, nenhuma das 22 passa, por mais que o texto melhore.

1. **O `<ID>_numeros.json` que nenhum script grava** (regras 1 e 9, 44 reprovações).
   As partes publicam 676 marcadores e **nenhum** é conferível hoje; a auditoria
   de 19/09 já tinha provado que 191 deles foram digitados à mão. Fazer cada script
   gravar a própria saída fecha as duas regras de uma vez — e a 9 cai junto porque o `gerado_por`
   passa a apontar um script que produz mesmo o que a parte publica.
2. **O `_registro.md` gerado** (regra 8, 22 reprovações). Um gerador e uma linha-sentinela
   no topo. De quebra, o portão já achou o que o registro escrito à mão custou: três selos
   trocados e 16 conclusões publicadas que não estão lá.
3. **A porta temporal da §6.4** (regra 2). Ela é o que separa *provável* de *firme*, e nenhuma
   parte a registra em condições: hoje o estudo tem 35 conclusões “firme” e
   43 conclusões acima do teto que o portão recalcula.

## A lista de trabalho, parte por parte

Ordenada de quem está mais perto de ser aceita para quem está mais longe. Dentro de cada parte,
da tarefa mais barata para a mais cara. **comum** é o conserto de máquina acima: vale para as 22
e não precisa ser refeito parte a parte.

### J04 — reprova em 4 regra(s)

Falta nas regras 1, 3, 8, 9.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 3 | citar os dois cortes em 6 discordância(s) (de 79 discordâncias em 357 comparações emparelhadas) |
| 2 | médio · rodar o script de novo | 3 | rodar o corte sem fronteira nas linhas que só existem no corte com — 136 linhas do corte com e 0 do corte sem NÃO emparelharam: os dois cortes não rodaram a mesma tabela |
| 3 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/J04_numeros.json com os 37 marcadores publicados (a auditoria provou 1 digitado(s) à mão) |
| 4 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 5 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |

### J08 — reprova em 4 regra(s)

Falta nas regras 1, 2, 8, 9.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 2 | rebaixar ao teto recalculado 2 conclusão(ões): J08-1, J08-3 |
| 2 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/J08_numeros.json com os 86 marcadores publicados (a auditoria provou 21 digitado(s) à mão) |
| 3 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 4 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 5 | caro · análise nova | 2 | para qualquer conclusão voltar a firme: rodar e registrar a porta da §6.4 no J08_resumo.json — porta temporal: há bloco `porta_*`, mas nenhuma entrada com parcial numérica e `passa` verdadeiro — registrar a porta não é passar nela |

### A10 — reprova em 4 regra(s), 1 a conferir à mão

Falta nas regras 1, 3, 8, 9. A conferir: 2.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 2 | rebaixar ao teto recalculado 1 conclusão(ões): A10-3 |
| 2 | barato · texto | 3 | citar os dois cortes em 23 discordância(s) (de 123 discordâncias em 516 comparações emparelhadas) |
| 3 | médio · rodar o script de novo | 3 | rodar o corte sem fronteira nas linhas que só existem no corte com — 228 linhas do corte com e 0 do corte sem NÃO emparelharam: os dois cortes não rodaram a mesma tabela |
| 4 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/A10_numeros.json com os 43 marcadores publicados (a auditoria provou 7 digitado(s) à mão) |
| 5 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 6 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 7 | caro · análise nova | 2 | para qualquer conclusão voltar a firme: rodar e registrar a porta da §6.4 no A10_resumo.json — porta temporal: há bloco `porta_*`, mas nenhuma entrada com parcial numérica e `passa` verdadeiro — registrar a porta não é passar nela |

### A12 — reprova em 5 regra(s)

Falta nas regras 1, 2, 3, 8, 9.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 1 | trocar por marcador 4 número(s) cravado(s) no texto: o_que_vimos: 10,0; o_que_vimos: 13,2; o_que_vimos: 52,0153; o_que_vimos: 14,0858 |
| 2 | barato · texto | 2 | rebaixar para indício 2 conclusão(ões) — A12-1, A12-3 — enquanto não houver A12_testes.csv |
| 3 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/A12_numeros.json com os 29 marcadores publicados (a auditoria provou 7 digitado(s) à mão) |
| 4 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 5 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 6 | caro · análise nova | 3 | não existe A12_testes.csv: rodar a tabela de testes nos dois cortes, ou assumir que a parte é descritiva e nenhuma conclusão dela passa de indício |

### A01 — reprova em 6 regra(s)

Falta nas regras 1, 2, 3, 5, 8, 9.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 2 | rebaixar para indício 3 conclusão(ões) — A01-1, A01-2, A01-3 — enquanto não houver A01_testes.csv |
| 2 | médio · rodar o script de novo | 5 | reescrever scripts/A01.py para importar scripts/_metodo.py em vez de reimplementar o teste (A01.py importa: collections, csv, datetime, json, os, re, statistics) |
| 3 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/A01_numeros.json com os 32 marcadores publicados (a auditoria provou 17 digitado(s) à mão) |
| 4 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 5 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 6 | caro · análise nova | 3 | não existe A01_testes.csv: rodar a tabela de testes nos dois cortes, ou assumir que a parte é descritiva e nenhuma conclusão dela passa de indício |

### A03 — reprova em 6 regra(s)

Falta nas regras 1, 2, 3, 6, 8, 9.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 2 | rebaixar ao teto recalculado 2 conclusão(ões): A03-1, A03-2 |
| 2 | barato · texto | 3 | citar os dois cortes em 1 discordância(s) (de 6 discordâncias em 36 comparações emparelhadas) |
| 3 | barato · texto | 6 | reescrever 4 trecho(s) em A03-1, A03-2, A03-3: o número técnico (d, q, p, rho) sai da manchete e do que vimos e vai para a prova |
| 4 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/A03_numeros.json com os 28 marcadores publicados (a auditoria provou 7 digitado(s) à mão) |
| 5 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 6 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 7 | caro · análise nova | 2 | para qualquer conclusão voltar a firme: rodar e registrar a porta da §6.4 no A03_resumo.json — porta temporal: não há bloco `porta_*` no resumo nem registro da parte em _porta_temporal.json |

### A11 — reprova em 6 regra(s)

Falta nas regras 1, 2, 3, 6, 8, 9.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 2 | rebaixar para indício 3 conclusão(ões) — A11-1, A11-2, A11-3 — enquanto não houver A11_testes.csv |
| 2 | barato · texto | 6 | reescrever 4 trecho(s) em A11-1, A11-2: o número técnico (d, q, p, rho) sai da manchete e do que vimos e vai para a prova |
| 3 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/A11_numeros.json com os 20 marcadores publicados (a auditoria provou 4 digitado(s) à mão) |
| 4 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 5 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 6 | caro · análise nova | 3 | não existe A11_testes.csv: rodar a tabela de testes nos dois cortes, ou assumir que a parte é descritiva e nenhuma conclusão dela passa de indício |

### A14 — reprova em 6 regra(s)

Falta nas regras 1, 2, 3, 6, 8, 9.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 2 | rebaixar para indício 2 conclusão(ões) — A14-1, A14-2 — enquanto não houver A14_testes.csv |
| 2 | barato · texto | 6 | reescrever 6 trecho(s) em A14-1, A14-2, A14-3: o número técnico (d, q, p, rho) sai da manchete e do que vimos e vai para a prova |
| 3 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/A14_numeros.json com os 31 marcadores publicados (a auditoria provou 1 digitado(s) à mão) |
| 4 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 5 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 6 | caro · análise nova | 3 | não existe A14_testes.csv: rodar a tabela de testes nos dois cortes, ou assumir que a parte é descritiva e nenhuma conclusão dela passa de indício |

### J01 — reprova em 6 regra(s)

Falta nas regras 1, 2, 3, 5, 8, 9.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 1 | trocar por marcador 2 número(s) cravado(s) no texto: o_que_vimos: 25,5; o_que_vimos: 22,0 |
| 2 | barato · texto | 2 | rebaixar para indício 2 conclusão(ões) — J01-1, J01-3 — enquanto não houver J01_testes.csv |
| 3 | médio · rodar o script de novo | 5 | reescrever scripts/J01.py para importar scripts/_metodo.py em vez de reimplementar o teste (J01.py importa: collections, csv, json, numpy, os, re, statistics, unicodedata) |
| 4 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/J01_numeros.json com os 24 marcadores publicados (a auditoria provou 22 digitado(s) à mão) |
| 5 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 6 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 7 | caro · análise nova | 3 | não existe J01_testes.csv: rodar a tabela de testes nos dois cortes, ou assumir que a parte é descritiva e nenhuma conclusão dela passa de indício |

### J02 — reprova em 6 regra(s)

Falta nas regras 1, 2, 3, 6, 8, 9.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 2 | rebaixar ao teto recalculado 1 conclusão(ões): J02-1 |
| 2 | barato · texto | 3 | citar os dois cortes em 4 discordância(s) (de 4 discordâncias em 21 comparações emparelhadas) |
| 3 | barato · texto | 6 | reescrever 5 trecho(s) em J02-2, J02-3: o número técnico (d, q, p, rho) sai da manchete e do que vimos e vai para a prova |
| 4 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/J02_numeros.json com os 24 marcadores publicados (a auditoria provou 4 digitado(s) à mão) |
| 5 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 6 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 7 | caro · análise nova | 2 | para qualquer conclusão voltar a firme: rodar e registrar a porta da §6.4 no J02_resumo.json — porta temporal: não há bloco `porta_*` no resumo nem registro da parte em _porta_temporal.json |

### J03 — reprova em 6 regra(s)

Falta nas regras 1, 2, 3, 6, 8, 9.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 2 | rebaixar ao teto recalculado 2 conclusão(ões): J03-1, J03-2 |
| 2 | barato · texto | 6 | reescrever 5 trecho(s) em J03-2, J03-3: o número técnico (d, q, p, rho) sai da manchete e do que vimos e vai para a prova |
| 3 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/J03_numeros.json com os 20 marcadores publicados (a auditoria provou 1 digitado(s) à mão) |
| 4 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 5 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 6 | caro · análise nova | 2 | para qualquer conclusão voltar a firme: rodar e registrar a porta da §6.4 no J03_resumo.json — porta temporal: não há bloco `porta_*` no resumo nem registro da parte em _porta_temporal.json |
| 7 | caro · análise nova | 3 | a tabela de testes não tem coluna de corte: rodar a parte também sem os times de fronteira |

### J07 — reprova em 6 regra(s)

Falta nas regras 1, 2, 3, 5, 8, 9.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 2 | rebaixar para indício 1 conclusão(ões) — J07-3 — enquanto não houver J07_testes.csv |
| 2 | médio · rodar o script de novo | 5 | reescrever scripts/J07.py para importar scripts/_metodo.py em vez de reimplementar o teste (J07.py importa: collections, csv, json, numpy, os, re, statistics, unicodedata) |
| 3 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/J07_numeros.json com os 26 marcadores publicados (a auditoria provou 25 digitado(s) à mão) |
| 4 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 5 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 6 | caro · análise nova | 3 | não existe J07_testes.csv: rodar a tabela de testes nos dois cortes, ou assumir que a parte é descritiva e nenhuma conclusão dela passa de indício |

### T01 — reprova em 6 regra(s)

Falta nas regras 1, 2, 3, 5, 8, 9.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 2 | rebaixar para indício 3 conclusão(ões) — T01-1, T01-2, T01-3 — enquanto não houver T01_testes.csv |
| 2 | médio · rodar o script de novo | 5 | reescrever scripts/T01.py para importar scripts/_metodo.py em vez de reimplementar o teste (T01.py importa: bs4, csv, datetime, json, os, random, re, requests, sys, time) |
| 3 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/T01_numeros.json com os 22 marcadores publicados (a auditoria provou 23 digitado(s) à mão) |
| 4 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 5 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 6 | caro · análise nova | 3 | não existe T01_testes.csv: rodar a tabela de testes nos dois cortes, ou assumir que a parte é descritiva e nenhuma conclusão dela passa de indício |

### T02 — reprova em 6 regra(s)

Falta nas regras 1, 2, 3, 5, 8, 9.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 2 | rebaixar para indício 3 conclusão(ões) — T02-1, T02-2, T02-3 — enquanto não houver T02_testes.csv |
| 2 | médio · rodar o script de novo | 5 | reescrever scripts/T02.py para importar scripts/_metodo.py em vez de reimplementar o teste (T02.py importa: collections, csv, json, os, re, statistics) |
| 3 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/T02_numeros.json com os 28 marcadores publicados (a auditoria provou 17 digitado(s) à mão) |
| 4 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 5 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 6 | caro · análise nova | 3 | não existe T02_testes.csv: rodar a tabela de testes nos dois cortes, ou assumir que a parte é descritiva e nenhuma conclusão dela passa de indício |

### T04 — reprova em 6 regra(s)

Falta nas regras 1, 2, 3, 5, 8, 9.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 2 | rebaixar para indício 2 conclusão(ões) — T04-1, T04-2 — enquanto não houver T04_testes.csv |
| 2 | médio · rodar o script de novo | 5 | reescrever scripts/T04.py para importar scripts/_metodo.py em vez de reimplementar o teste (T04.py importa: collections, csv, json, numpy, os, statistics) |
| 3 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/T04_numeros.json com os 19 marcadores publicados (a auditoria provou 1 digitado(s) à mão) |
| 4 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 5 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 6 | caro · análise nova | 3 | não existe T04_testes.csv: rodar a tabela de testes nos dois cortes, ou assumir que a parte é descritiva e nenhuma conclusão dela passa de indício |

### A05 — reprova em 6 regra(s), 1 a conferir à mão

Falta nas regras 1, 2, 3, 4, 8, 9. A conferir: 5.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 2 | rebaixar ao teto recalculado 2 conclusão(ões): A05-1, A05-2 |
| 2 | barato · texto | 3 | citar os dois cortes em 1 discordância(s) (de 3 discordâncias em 30 comparações emparelhadas) |
| 3 | barato · texto | 4 | a prova citada não existe — A05-1: “A05.md” não existe em resultados/, no estudo nem na raiz: escrever o arquivo com a prova de verdade, ou apontar o campo para o que sustenta a conclusão |
| 4 | barato · texto | 5 | não há scripts/A05.py: conferir à mão que o scripts/_rodar.py A05 roda mesmo esta parte, e dizer isso no gerado_por |
| 5 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/A05_numeros.json com os 16 marcadores publicados (a auditoria provou 7 digitado(s) à mão) |
| 6 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 7 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 8 | caro · análise nova | 2 | para qualquer conclusão voltar a firme: rodar e registrar a porta da §6.4 no A05_resumo.json — porta temporal: não há bloco `porta_*` no resumo nem registro da parte em _porta_temporal.json |

### A04 — reprova em 7 regra(s)

Falta nas regras 1, 2, 3, 6, 7, 8, 9.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 2 | rebaixar ao teto recalculado 3 conclusão(ões): A04-1, A04-2, A04-3 |
| 2 | barato · texto | 3 | citar os dois cortes em 4 discordância(s) (de 8 discordâncias em 39 comparações emparelhadas) |
| 3 | barato · texto | 6 | reescrever 4 trecho(s) em A04-3: o número técnico (d, q, p, rho) sai da manchete e do que vimos e vai para a prova |
| 4 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/A04_numeros.json com os 30 marcadores publicados (a auditoria provou 3 digitado(s) à mão) |
| 5 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 6 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 7 | caro · análise nova | 2 | para qualquer conclusão voltar a firme: rodar e registrar a porta da §6.4 no A04_resumo.json — porta temporal: não há bloco `porta_*` no resumo nem registro da parte em _porta_temporal.json |
| 8 | caro · análise nova | 7 | decidir de qual família sai o q publicado — duelos_aereos_pct × clube-temporada × ST: A04 publica q [0.01861] e A06 publica q [0.01241] |

### A06 — reprova em 7 regra(s)

Falta nas regras 1, 2, 3, 6, 7, 8, 9.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 2 | rebaixar ao teto recalculado 2 conclusão(ões): A06-1, A06-3 |
| 2 | barato · texto | 3 | citar os dois cortes em 1 discordância(s) (de 8 discordâncias em 16 comparações emparelhadas) |
| 3 | barato · texto | 6 | reescrever 12 trecho(s) em A06-1, A06-2, A06-3: o número técnico (d, q, p, rho) sai da manchete e do que vimos e vai para a prova |
| 4 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/A06_numeros.json com os 38 marcadores publicados (a auditoria provou 6 digitado(s) à mão) |
| 5 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 6 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 7 | caro · análise nova | 2 | para qualquer conclusão voltar a firme: rodar e registrar a porta da §6.4 no A06_resumo.json — porta temporal: a porta que a parte rodou não é a da §6.4: idem A02 |
| 8 | caro · análise nova | 7 | decidir de qual família sai o q publicado — duelos_aereos_pct × clube-temporada × ST: A06 publica q [0.01241] e A04 publica q [0.01861]; xg_por_remate_contra × clube-temporada × SM: A06 publica q [0.03113] e A02 publica q [0.02076]; xg_por_remate_contra × clube-temporada × ST: A06 publica q [0.28712] e A02 publica q [0.76566] |

### A13 — reprova em 7 regra(s)

Falta nas regras 1, 2, 3, 5, 6, 8, 9.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 1 | trocar por marcador 2 número(s) cravado(s) no texto: manchete: 0,48; manchete: 0,82 |
| 2 | barato · texto | 2 | rebaixar para indício 3 conclusão(ões) — A13-1, A13-2, A13-3 — enquanto não houver A13_testes.csv |
| 3 | barato · texto | 6 | reescrever 3 trecho(s) em A13-3: o número técnico (d, q, p, rho) sai da manchete e do que vimos e vai para a prova |
| 4 | médio · rodar o script de novo | 5 | reescrever scripts/A13.py para importar scripts/_metodo.py em vez de reimplementar o teste (A13.py importa: collections, csv, json, math, numpy, os, re, scipy, statistics) |
| 5 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/A13_numeros.json com os 26 marcadores publicados (a auditoria provou 4 digitado(s) à mão) |
| 6 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 7 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 8 | caro · análise nova | 3 | não existe A13_testes.csv: rodar a tabela de testes nos dois cortes, ou assumir que a parte é descritiva e nenhuma conclusão dela passa de indício |

### T03 — reprova em 7 regra(s)

Falta nas regras 1, 2, 3, 5, 6, 8, 9.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 2 | rebaixar para indício 2 conclusão(ões) — T03-1, T03-2 — enquanto não houver T03_testes.csv |
| 2 | barato · texto | 6 | reescrever 1 trecho(s) em T03-1: o número técnico (d, q, p, rho) sai da manchete e do que vimos e vai para a prova |
| 3 | médio · rodar o script de novo | 5 | reescrever scripts/T03.py para importar scripts/_metodo.py em vez de reimplementar o teste (T03.py importa: collections, csv, json, numpy, os, re, scipy, sys) |
| 4 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/T03_numeros.json com os 17 marcadores publicados (a auditoria provou 6 digitado(s) à mão) |
| 5 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 6 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 7 | caro · análise nova | 3 | não existe T03_testes.csv: rodar a tabela de testes nos dois cortes, ou assumir que a parte é descritiva e nenhuma conclusão dela passa de indício |

### A02 — reprova em 7 regra(s), 1 a conferir à mão

Falta nas regras 1, 2, 5, 6, 7, 8, 9. A conferir: 3.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 2 | rebaixar ao teto recalculado 1 conclusão(ões): A02-3 |
| 2 | barato · texto | 3 | citar os dois cortes em 8 discordância(s) (de 8 discordâncias em 26 comparações emparelhadas) |
| 3 | barato · texto | 6 | reescrever 11 trecho(s) em A02-2, A02-3: o número técnico (d, q, p, rho) sai da manchete e do que vimos e vai para a prova |
| 4 | médio · rodar o script de novo | 5 | reescrever scripts/A02.py para importar scripts/_metodo.py em vez de reimplementar o teste (A02.py importa: collections, csv, json, math, numpy, os, re, scipy, statistics) |
| 5 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/A02_numeros.json com os 50 marcadores publicados (a auditoria provou 1 digitado(s) à mão) |
| 6 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 7 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 8 | caro · análise nova | 2 | para qualquer conclusão voltar a firme: rodar e registrar a porta da §6.4 no A02_resumo.json — porta temporal: a porta que a parte rodou não é a da §6.4: indicador da 1ª metade × o PRÓPRIO indicador da 2ª (persistência), com limiar rho>0,30 — o rho_persist que a §6.5 aposentou em 15/09 |
| 9 | caro · análise nova | 7 | decidir de qual família sai o q publicado — xg_por_remate_contra × clube-temporada × SM: A02 publica q [0.02076] e A06 publica q [0.03113]; xg_por_remate_contra × clube-temporada × ST: A02 publica q [0.76566] e A06 publica q [0.28712] |

### A07 — reprova em 7 regra(s), 1 a conferir à mão

Falta nas regras 1, 2, 3, 4, 6, 8, 9. A conferir: 5.

| # | esforço | regra | o que precisa acontecer para a parte ser aceita |
|---|---|---|---|
| 1 | barato · texto | 2 | rebaixar ao teto recalculado 1 conclusão(ões): A07-1 |
| 2 | barato · texto | 3 | citar os dois cortes em 1 discordância(s) (de 10 discordâncias em 39 comparações emparelhadas) |
| 3 | barato · texto | 4 | a prova citada não existe — A07-1: “A07.md” não existe em resultados/, no estudo nem na raiz: escrever o arquivo com a prova de verdade, ou apontar o campo para o que sustenta a conclusão |
| 4 | barato · texto | 5 | não há scripts/A07.py: conferir à mão que o scripts/_rodar.py A07 roda mesmo esta parte, e dizer isso no gerado_por |
| 5 | barato · texto | 6 | reescrever 5 trecho(s) em A07-2: o número técnico (d, q, p, rho) sai da manchete e do que vimos e vai para a prova |
| 6 | comum · uma vez para as 22 | 1 | fazer o script gravar resultados/A07_numeros.json com os 30 marcadores publicados (a auditoria provou 6 digitado(s) à mão) |
| 7 | comum · uma vez para as 22 | 8 | gerar o _registro.md dos <ID>.json, com a linha-sentinela no topo |
| 8 | comum · uma vez para as 22 | 9 | com o arquivo da regra 1 no lugar, o gerado_por passa a ser verdade; sem ele, tirar o campo |
| 9 | caro · análise nova | 2 | para qualquer conclusão voltar a firme: rodar e registrar a porta da §6.4 no A07_resumo.json — porta temporal: não há bloco `porta_*` no resumo nem registro da parte em _porta_temporal.json |

## Conferência contra o diagnóstico

O diagnóstico de 19/09 mediu o custo esperado de cada regra. O portão bate com ele em cinco
regras, é mais duro em três e diverge de verdade em uma.

| regra | o diagnóstico esperava | o portão achou | bate? |
|---|---|---|---|
| 1 | 191 marcadores, 21 das 22 partes | 22 partes | sim, e mais duro |
| 2 | as 35 firmes | 43 conclusões (as 35 firmes + 8 prováveis) | sim, e mais amplo |
| 3 | 81 casos | 49 citações em falta · 249 discordâncias · 81 casos no diagnóstico | outra unidade de contagem |
| 4 | 2 (A05-1 e A07-1) | 2 (A05-1 e A07-1) | bate exatamente |
| 5 | 9 de 22 | 9 reprovam + 2 a conferir | bate exatamente |
| 6 | 6 conclusões | 21 conclusões, 60 trechos | **não bate — 3,5× mais** |
| 7 | 2 casos | 2 indicadores, 3 pares | bate exatamente |
| 8 | o arquivo inteiro | o arquivo inteiro + 3 espelhos trocados + 16 conclusões de fora | sim, e achou mais |
| 9 | as 22 | as 22 | bate exatamente |

**Regra 1 — 22 partes, não 21.** Investiguei antes de publicar: o `_robustez_19_09.json` lista
`digitados_a_mao` em **todas as 22** partes, somando 191 marcadores — as 22 têm pelo
menos um. O “21 das 22” do quadro do PLANO é que está errado. E o portão reprova por um motivo
mais forte que o do diagnóstico: não é que 191 números foram digitados, é que **nenhum dos**
**676 é conferível**, porque script nenhum grava a própria saída.

**Regra 2 — 43, não 35.** As 35 firmes estão todas lá; as outras 8 são conclusões que se dizem
*provável* em parte que não tem `_testes.csv` nenhum, ou cujo indicador não passou no BH. Pela
regra, provável também exige uma das duas travas: A04-3, A10-3, A11-2, A11-3, A14-1, J01-3, T02-2, T04-1.

**Regra 3 — 81 e 249 contam coisas diferentes.** Os 81 do diagnóstico são *conclusões* em que o
texto cita um corte só. O portão conta *indicadores*: encontrou
249 discordâncias entre os dois cortes e 49 em que o texto não
amarra o indicador ao corte. Não são números concorrentes; são a mesma doença medida por
conclusão e por linha de tabela.

**Regra 6 — 21 conclusões, não 6. É a única divergência que muda o tamanho do trabalho**, e está
no destaque abaixo.

*Nota de contagem:* o portão reprovou A12, A13 e J01 pelo número cravado no texto e por isso não
imprimiu a contagem de marcadores dessas três; os totais delas vêm do próprio `<ID>.json`
(A12: 29, A13: 26, J01: 24).

## O que o portão achou e o diagnóstico não tinha achado

**1. A regra 6 custa 3,5× o que o quadro dizia: 21 conclusões, 60 trechos.**
O diagnóstico listou 6 (A02-3, A11-1, A11-2, A13-3, T03-1, A14-2) — todas pegas por palavra
inteira: *rho*, *porta*. As outras 15 escapam porque o termo proibido está **colado no número**:
“d 1.459”, “q 0.00121”, “p 0.08957”. São elas:

> A02-2, A03-1, A03-2, A03-3, A04-3, A06-1, A06-2, A06-3, A07-2, A14-1, A14-3, J02-2, J02-3, J03-2, J03-3

Conferi se as correções de 19/09 introduziram isso: **não**. Rodei a mesma varredura no
`_backup_pre_correcoes_19_09/` e o resultado é idêntico, trecho por trecho. O texto sempre foi
assim; o que faltava era quem contasse.

**2. 8 números medidos estão cravados no texto sem marcador nenhum** — fora dos 191.
Em A12-3 (4), A13-3 (2, e na **manchete**) e J01-3 (2). Gerar o `<ID>_numeros.json` não conserta
esses: não há marcador para conferir, o texto tem de ser reescrito. Dois dos quatro de A12-3
(10,0 e 13,2) são citação da §7.2(b), não medida — o portão não sabe distinguir, e conferir isso
é trabalho de gente.

**3. O J01-3 está publicado com uma cicatriz de edição no meio da frase:**
“…onde quem cai rastreia {cai_altos} contra… na verdade 25,5 atletas contra 22,0 do meio”. É o
marcador abandonado no meio da correção, com o número digitado logo depois.

**4. Os dois cortes não rodaram a mesma tabela em A10 e J04.** Não é só citar um lado: em A10,
228 das 744 linhas do corte com fronteira não têm par no corte sem (e existe um terceiro corte,
`sem_cobertura_baixa`); em J04, 136 das 493. Conferi na mão nos CSV e bate. O J03 é pior: a
tabela dele **não tem coluna de corte** — a robustez da fronteira nunca rodou.

**5. Registrar a porta temporal não é passar nela.** A10 e J08 gravam bloco de porta no
`_resumo.json`, e em todas as entradas `passa`/`passou` é **false**. No estudo inteiro, o
`_porta_temporal.json` diz que só dois indicadores passam a porta da §6.4: `dist_remate` e
`E_qualidade_chance`. Com o dado de hoje, é o teto do que pode voltar a ser firme.

**6. Os espelhos do registro.** Três selos divergem entre o `_registro.md` e o `<ID>.json`
(A06-2: o registro diz "provavel" e A06.json diz "indicio"; A02-1: o registro diz "firme" e A02.json diz "provavel"; A02-2: o registro diz "firme" e A02.json diz "provavel"), e 16
conclusões publicadas não aparecem no registro. A regra 8 era “o arquivo inteiro”; o portão diz
também **onde** ele mente.

**7. A05 e A07 não têm script próprio.** `scripts/A05.py` e `scripts/A07.py` não existem — as
duas saem do `scripts/_rodar.py`, que importa o `_metodo.py`. O portão marca REVISAR, não
reprovação: é alegação de procedência que só gente confere. E são exatamente as duas partes que
citam um `.md` que não existe (regra 4). A A05 ainda é a única parte com **0 de 30** indicadores
passando no BH — e publica duas conclusões “firme”.

## O que o portão ainda não prova

- O portão NÃO executa script nenhum e NÃO abre base nenhuma. Ele confere que o número publicado é igual ao que a saída do script declara — não que esse número saiu do dado. Uma saída escrita à mão, com um script de fachada que grave o mesmo arquivo, ainda passa. Fechar isso exige rodar o script em modo de conferência e comparar, e nenhum script do estudo aceita isso hoje.
- Regras 1 e 9 dependem de um resultados/<ID>_numeros.json que NENHUM script grava hoje: elas reprovam por ausência, que é o comportamento certo, mas até o gerador existir o portão não distingue “o número está errado” de “o número não é conferível”.
- Regra 5 lê o import pela árvore sintática, então docstring e comentário não enganam mais — mas ela não prova que o teste publicado veio do _metodo.py, só que o módulo foi importado. Script que importa e reimplementa ao lado sai como REVISAR, não como reprovado.
- Regra 2 amarra a conclusão ao indicador pelo NOME que o texto usa. Conclusão que não nomeia indicador nenhum fica em REVISAR quando a parte tem indicador reprovado — o portão não adivinha qual frase se apoia em qual linha.
- Regra 3 emparelha os cortes pelas colunas do CSV e relata o que não emparelhou; ela não sabe se as duas linhas mediram de fato a mesma coisa quando as colunas de identidade divergem.
- Regra 4 confere que o trecho citado aparece no arquivo, em qualquer lugar do texto — não que ele sustente a conclusão.
- Regra 7 usa a unidade declarada no CSV e, quando não há, a do mapa UNIDADE_INFERIDA no topo deste arquivo: duas partes que descrevem a mesma medida com unidades escritas de formas diferentes não colidem.
- Regra 8 confere sentinela, existência do gerador e coerência com os <ID>.json; ela não regenera o registro para comparar palavra por palavra.

Uma a mais, desta rodada: a **regra 2 confere a porta parte a parte**, no `<ID>_resumo.json`, e
ignora a lista global de quem passou no `_porta_temporal.json`. É falha fechada e está certo
assim — mas quer dizer que uma conclusão apoiada em `dist_remate` só volta a firme depois que a
própria parte registrar a porta na saída dela.
