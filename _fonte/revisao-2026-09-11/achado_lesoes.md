# A base de lesões mede cobertura, não lesão — achado do cruzamento de 11/09/2026

> **DECISÃO DO DONO DO PROJETO (11/09/2026): lesão fica FORA do estudo.** "A base não está
> boa." Este arquivo fica como registro do porquê, para ninguém repropor. Qualquer proposta
> de análise de lesão que o workflow aprovar deve ser marcada como DESCARTADA no relatório.

Primeiro cruzamento da base nova (2.724 lesões, 975 atletas) com quem sobe e quem cai,
usando a ponte `TM` do projeto para casar o nome do clube (sem ela, só 11 de 80 casavam).

## O resultado bruto — e por que ele é uma armadilha

| faixa | dias de lesão por clube | atletas lesionados | % do elenco com lesão |
|---|---|---|---|
| sobe | 450 | 5,6 | 10,2% |
| meio | 226 | 3,0 | 5,7% |
| cai | 134 | 1,9 | 3,4% |

Relação com a posição final: +0,27 a +0,35 em cinco indicadores, **todos passando** do limiar
de 0,22. Lido ingenuamente: "quem sobe se lesiona 3,4× mais". É o 0,3 com cara de achado.

## Os três testes que mostram que é cobertura

1. **Lesão registrada anda com o tamanho do clube.** N de lesionados × valor do elenco:
   rho +0,38 (dentro do ano). Dias × valor: +0,26.
2. **Dentro da base de atletas, o caro tem 2,3× mais lesão registrada que o barato.**
   Por quartil de valor de mercado: Q1 (mais baratos) 18,5% com lesão registrada; Q2 27,5%;
   Q3 30,4%; Q4 (mais caros) **43,3%**. Não há fisiologia para isso; há usuários do
   Transfermarkt registrando quem é notável.
3. **"Lesão desconhecida" (registro pobre) é mais comum em quem cai**: 18,6% das lesões de
   quem cai contra 10,6% de quem sobe. O clube pequeno tem lesão pior documentada.

Some-se a isso o que já estava anotado: 2024–2025 têm quase o dobro de lesões de 2022–2023
(o recente é mais bem registrado). O posto dentro do ano neutraliza ESSE viés, mas não o
de tamanho de clube.

## Consequência para o estudo

- **Comparar clube com clube por lesão total é inválido** com esta base. Qualquer "quem sobe
  tem mais/menos lesão" será cobertura.
- **O teste dentro de cada quartil de valor foi rodado e é inconclusivo a favor da base.**
  A diferença sobe × cai persiste em todos os quartis (Q1 6,4% × 5,1%; Q2 11,0% × 4,1%;
  Q3 13,3% × 4,9%; Q4 21,4% × 5,9%), o que descarta "cobertura por valor do atleta" como
  explicação ÚNICA — mas não descarta cobertura por notoriedade do CLUBE, que a
  estratificação por atleta não controla (o Q4 tem 206 atletas de quem sobe contra 51 de
  quem cai: o caro está no clube grande). E o sinal decisivo: entre os atletas caros de quem
  cai, **0% com lesão registrada em 2023 e em 2024 inteiros** — quatro clubes, uma temporada,
  nenhuma lesão de atleta de ponta. Isso não é saúde; é ausência de registro.
- Conclusão: **a base não separa lesão real de registro**, e comparar clube com clube por
  ela é inválido. Não entra na aba como está.
- Para lesão de verdade seria preciso outra fonte. A ideia de inferir disponibilidade dos
  minutos (titular que some da escalação por 4+ jogos = provável lesão) **foi conferida e
  NÃO é derivável hoje**: `serieb_tecnico` só tem o total de minutos da temporada, e
  `serieb_jogos` é por clube-partida, sem escalação. Precisaria de (a) exportação Wyscout
  por jogador × partida, (b) a `physical_match` do SkillCorner (só 2025–2026), ou
  (c) escalações do Transfermarkt/Sofascore por partida. Vira pendência de coleta, não de
  análise.
