# A regra da fronteira, e como eu a apliquei errado

> Escrito em 17/09/2026, depois de uma rodada de refutação adversarial derrubar as três conclusões
> do A03. Vale para A02, A03, A06 e tudo que comparar faixas daqui em diante.

## O que o CLAUDE.md manda

> "Toda comparação entre faixas roda **também** sem esses times. Conclusão que só aparece com eles
> é ruído."

A regra é um **teste de robustez**: a conclusão tem de sobreviver aos dois cortes. O que ela descarta
é o achado que só existe **com** os times de fronteira.

## O que eu fiz

Tratei o recorte **sem** fronteira como o verdadeiro, e reportei os números dele como manchete. Isso
inverte a regra: promove justamente o corte mais frágil.

## Por que o corte sem fronteira é enviesado, e não neutro

O filtro tira de cada grupo os times **mais próximos da linha**. Como a linha fica entre os grupos,
ele tira lados opostos de cada um:

| grupo | total | fica | sai | pontos medianos: fica | sai | efeito |
|---|---|---|---|---|---|---|
| Sobe | 20 | 8 | 12 | 66,5 | 63,0 | fica **mais forte** |
| Trave | 20 | 10 | 10 | 56,5 | 62,0 | fica **mais fraca** |
| Meio | 60 | 41 | 19 | 50 | 47 | fica mais forte |
| Cai | 20 | 15 | 5 | 33 | 39 | fica **mais fraco** |

Na Sobe o filtro tira os 4ºs fracos; na Trave tira os 5ºs fortes — inclusive Novorizontino 2024
(64 pts), Novorizontino 2023, Mirassol 2023 e Sport 2023 (63 cada). **Comparar "Sobe sem fronteira"
com "Trave sem fronteira" é comparar um grupo reforçado com um enfraquecido**, e isso infla qualquer
diferença por construção.

Em Sobe × Meio o viés é menor, porque os dois lados ficam mais fortes na mesma direção (+3,5 e +3,0).

## A regra corrigida

1. Rodar **com** e **sem** fronteira, sempre.
2. **Firme = firme nos dois cortes.**
3. Firme só **com** fronteira → descartar, como o CLAUDE.md manda.
4. Firme só **sem** fronteira → **suspeito**, não promovido: em Sobe × Trave e Sobe × Cai o corte
   compara grupos desequilibrados de propósito. Vale no máximo como indício, e a frase tem de dizer
   que depende do corte.

## O que isso muda nas partes já entregues

| parte | o que sobrevive aos dois cortes | o que caiu para suspeito |
|---|---|---|
| **A02** Sobe × Meio | `dist_remate`, `xg_por_remate_contra` | `toques_area`, `entradas_area`, `xg_contra` |
| **A03** Sobe × Meio | `xgc_casa`, `dd_casa`, `dd_fora` | `xgc_fora` |
| **A03** Cai × Meio | `xg_casa`, `xgc_fora` | — |
| **A03** Sobe × Trave | nada que não seja placar | `dd_casa` |
| **A06** Sobe × Meio | `duelos_def_pct`, `xg_por_remate_contra` | — |
| **A06** Sobe × Trave | **nada** | `duelos_def_pct` |

O A06 sai quase intacto: as duas conclusões principais dele são firmes nos dois cortes. O que cai é a
conclusão sobre a **trave**, nas três partes — e é justamente onde o viés do filtro é maior.
