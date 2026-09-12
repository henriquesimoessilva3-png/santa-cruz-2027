# Estado do workflow no fechamento — 11/09/2026 23:42

Run `wf_a4d4de27-3cf`. Journal copiado para `journal_snapshot.jsonl` nesta pasta (45 entradas).
Chaves presentes em cada entrada do journal: ['agentId', 'key', 'label', 'phase', 'result', 'type']

## Agentes concluídos (na ordem do journal)

| # | rótulo | tamanho do retorno (chars) |
|---|---|---|
| 1 | (sem rotulo) | 0 |
| 2 | mapa:aba | 0 |
| 3 | pesquisa:sumpter | 0 |
| 4 | mapa:conhecimento | 0 |
| 5 | mapa:dados | 0 |
| 6 | pesquisa:fisico | 0 |
| 7 | pesquisa:promocao | 0 |
| 8 | pesquisa:liverpool | 0 |
| 9 | mapa:metodos | 0 |
| 10 | (sem rotulo) | 34381 |
| 11 | pesquisa:elenco | 0 |
| 12 | (sem rotulo) | 29304 |
| 13 | pesquisa:bolaparada | 0 |
| 14 | (sem rotulo) | 43477 |
| 15 | pesquisa:metodo | 0 |
| 16 | (sem rotulo) | 50896 |
| 17 | pesquisa:pressao | 0 |
| 18 | (sem rotulo) | 41850 |
| 19 | (sem rotulo) | 52216 |
| 20 | (sem rotulo) | 34146 |
| 21 | (sem rotulo) | 57156 |
| 22 | (sem rotulo) | 38245 |
| 23 | (sem rotulo) | 36542 |
| 24 | (sem rotulo) | 38101 |
| 25 | (sem rotulo) | 39691 |
| 26 | brief:literatura | 0 |
| 27 | (sem rotulo) | 39617 |
| 28 | revisao:linha | 0 |
| 29 | revisao:quadro | 0 |
| 30 | revisao:vantagem | 0 |
| 31 | revisao:elenco | 0 |
| 32 | revisao:parada | 0 |
| 33 | revisao:fisico | 0 |
| 34 | revisao:ataque | 0 |
| 35 | revisao:jogo | 0 |
| 36 | (sem rotulo) | 12847 |
| 37 | revisao:ano | 0 |
| 38 | (sem rotulo) | 18041 |
| 39 | revisao:metodo | 0 |
| 40 | (sem rotulo) | 13959 |
| 41 | (sem rotulo) | 17879 |
| 42 | (sem rotulo) | 20540 |
| 43 | (sem rotulo) | 16343 |
| 44 | (sem rotulo) | 16396 |
| 45 | (sem rotulo) | 18133 |

## Como ler um retorno

```python
import json
ents=[json.loads(l) for l in open('journal_snapshot.jsonl',encoding='utf-8') if l.strip()]
for e in ents: print(e.keys())   # ache a chave do rótulo e a do retorno
```

Os retornos com schema (mapa da aba, mapa dos dados, conhecimento, métodos, as 8 pesquisas, o brief, as revisões) são JSON já validado — dá para colar direto nas constantes iniciais de um novo script e rodar só as fases que faltam (ver `workflow_revisao_serieb.js`, fases 'Propor', 'Verificar', 'Sintetizar').

## O que faltava no fechamento

Pela ordem do script: Mapear (4) e Pesquisar (8) completos; brief provavelmente completo; Revisar (10) em andamento; Propor (7), Verificar (~70) e Sintetizar (1) NÃO começaram — a menos que o journal mostre mais entradas que as contadas acima.