# Contexto — sessão de 14/09 (noite) a 16/09/2026

> Escrito a pedido do dono em 16/09. Cobre o que foi feito, o que está no ar, o que ficou parado e
> como retomar. O detalhe do Protótipo continua em `_fonte/prototipo/CONTINUAR.md`; este arquivo é o
> estado mais recente e manda onde os dois discordarem.

## 1. O que está no ar

Site publicado em https://henriquesimoessilva3-png.github.io/santa-cruz-2027/ (commit `6bb49bd`,
16/09 10:30, conferido no ar). O `main` local e o do GitHub estão iguais.

| commit | o que entrou |
|---|---|
| `50f7dfa` | Etapa 6 no mesmo ano; etapa 5 com os grupos lado a lado; pacote dos desmarques |
| `0fb4c80` | Sai o desconto do dinheiro e a repetição "ano seguinte"; um vocabulário só de sorte |
| `e0af947` | Registro do bloco 2 parado, com a integração incompleta guardada |
| `eeaf498` | Publicação da versão estática (etapas 5 e 6, rodada do dinheiro) |
| `6772dc2` | Aba **Minutagem Série B** (3.864 linhas, 2022 a 2026) |
| `6bb49bd` | Publicação da versão estática com a aba nova |

## 2. O que foi feito, e os números que ficam

**Etapa 6 — o número contra os pontos do MESMO ano.** Cada miniatura passou a ser a posição do time
no indicador contra o aproveitamento de pontos daquele ano, com azul claro para quem subiu e laranja
para quem caiu. Saiu a pergunta "se repete no ano seguinte", inclusive como número pequeno. Medido:
41 de 73 números andam com o aproveitamento (o sorteio daria 3; p do excesso 0,0001); os mais fortes
são xG sofrido (−0,58), distância do chute (−0,56) e três de uso do elenco, marcados como
consequência do resultado.

**Etapa 5 — grupos lado a lado.** Cada painel abre com o valor típico de quem subiu, de quem ficou no
meio e de quem caiu, a diferença de cada ponta contra o meio (em % do meio, ou em pontos percentuais
quando o número já é %) e um selo de firmeza por comparação. A matriz por time ficou embaixo, aberta,
como detalhe — decisão do dono. Título: "Quem subiu, quem ficou no meio, quem caiu". Contagem:
32 comparações firmes, 73 que podem ser sorte, 481 sem diferença clara.

**Rodada do dinheiro.** Saíram dos critérios o desconto pelo valor do elenco e a repetição "mesmo
clube no ano seguinte"; ficaram o 1º turno prevendo o 2º e a checagem em 2018-2021. Portas do
catálogo: A 2 (nome novo, "firme e reaparece por outro caminho", só leitura), B 27, C extinta, 264
sem diferença. Etapa 10 com 22 linhas; etapa 9 sem réguas apagadas; etapa 13 igual. Vocabulário de
sorte com um sentido só na aba (firme / pode ser sorte / sem diferença clara). Conclusões: 57
(3 fortes, 17 moderadas, 17 fracas, 15 sem sinal, 5 não dá para afirmar); as cinco mais firmes
seguem DIN-02, J1, J2, ELE-01 e J6.

**Aba Minutagem Série B.** 3.864 linhas (jogador + clube + temporada, 2022 a 2026), com filtros de
temporada, time, posição, idade e busca, e todas as colunas ordenáveis. Gerada por
`gerar_minutagem_serieb.py` a partir do zip `bases wyscout - serie B/`.

## 3. Decisões do dono nesta sessão

- **Repetição como critério:** sai só "o mesmo clube repete no ano seguinte". Ficam o 1º→2º turno e
  2018-2021. As conclusões cujo assunto é a repetição (FIS-07, M1, M6, M7, ELE-06) ficam com o selo.
- **J17:** moderada, pela regra geral "firme por pouco (q entre 0,025 e 0,05) com uma conferência só".
- **Aba mais afirmativa:** aceita, com a ressalva "elenco valioso tende a ter isso; o estudo não
  separa as duas coisas" nas que sobem (J19, ELE-03, A2 e as outras).
- **Porta A:** só leitura, sem prometer uso em contratação; a nota da etapa 13 não muda.
- **M4:** zaga e lateral ficam fracas; o ataque virou conclusão própria (M8, moderada) — 57 no total.
- **Etapa 5:** a matriz por time fica embaixo como detalhe.
- **Forma de trabalhar (15/09):** "o caminho melhor vai ser fazer perguntas e você responder do que
  fazer uma análise muito ampla de uma só vez", no molde da aba de bola parada. Ele encerrou duas
  rodadas longas no meio ("tá muito demorado"). A fila grande do `CONTINUAR.md` fica parada até ele
  pedir um item.

## 4. O que ficou parado, e como retomar

**(a) Coluna de valor de mercado na aba Minutagem — é o pedido em aberto.**
O `gerar_minutagem_serieb.py` já está editado para gravar `valor_eur` (modificado, sem commit).
Falta: rodar o gerador, pôr a coluna em `static/minutagem_serieb.js` (ordenável, o zero escrito como
preço baixo ou nenhum), testar, commitar e publicar. São uns 10 minutos.
Medido antes de parar: o valor da planilha é **o de hoje**, não o da temporada — o mesmo jogador tem
o mesmo valor em todos os anos em 83% dos casos; 45% dos valores são zero. A coluna tem de dizer isso.

**(b) Bloco 2 do gerador do Protótipo — parado no meio.** Os 5 módulos ficaram prontos na raiz, sem
ninguém importar: `gerar_prototipo_b2_bases.py`, `_etapa1.py`, `_etapa2.py`, `_etapa11.py`,
`_conclusoes.py` (untracked). A integração parou pela metade e as 75 linhas dela estão em
`_fonte/prototipo/sessao_14_09/bloco2_parado_15_09/integracao_incompleta_gerar_prototipo.diff`; o
`gerar_prototipo.py` voltou ao commit. Retomar = só integrar, conferir e gravar.
**Enquanto isso, a aba não mostra as 57 conclusões:** o dado não tem o bloco `conclusoes` e a tela
escreve a ausência no topo. É esperado, não é defeito.

**(c) Glossário e contrato** (`static/proto_glossario.js`, `static/proto_contrato.md`) ainda
descrevem o dinheiro, a porta C e a repetição. Não aparecem na tela da aba; a conferência listou as
entradas falsas.

**(d) Etapa 9** escreve "sem diferença que se possa afirmar" ao lado de "sem diferença clara" (30
vezes). É ajuste de texto no `proto_c.js`.

**(e) Aba por pontos (item 6 do CONTINUAR):** o `gerar_pontos.py` ainda usa chaves que saíram do
gerador (`p_liq_SM`, `rho_persist`) e vai gravar zeros se for rodado como está.

## 5. Regras que custaram tempo, e valem para a próxima

- **Fluxo longo o dono encerra.** Prefira responder à pergunta com a análise pronta; se precisar de
  agentes, que sejam poucos e com uma conferência só.
- **Um dono por arquivo** quando houver trabalho em paralelo; nenhum agente faz git que escreva;
  publicar e commitar só com pedido do dono.
- **Outra sessão do Claude** mexe no mesmo repositório (Financeiro, Orçamento, Bola parada). Ela está
  parada desde 14/09, mas confira `git log` e `git status` antes de escrever em `app.js`, `app.py`,
  `templates/index.html`, `dados/cenarios.json` ou `docs/`. Os arquivos soltos "Scout jogos/",
  "Squad and Budget.xlsx" e o `.bak` de cenários são dela.
- **Aba nova mexe na barra de abas:** com 11 abas ela não cabe abaixo de ~1.190 px e as últimas
  ficavam fora do alcance (já acontecia com 10). Agora quebra em duas linhas nessas larguras
  (`static/style.css`). Se acrescentar outra aba, meça de novo.
- **Wyscout:** conta os acréscimos (um titular faz ~102 min por jogo), e a exportação corta em 500
  linhas — cada temporada veio em duas planilhas que se sobrepõem.
- **Publicação:** `publicar_site.py` copia a pasta `static/` inteira. Nunca publique com arquivo de
  tela pela metade, porque a publicação leva o que estiver lá.

## 6. Onde estão os relatos

- Protótipo, estado detalhado: `_fonte/prototipo/CONTINUAR.md`.
- Rodada do dinheiro: `_fonte/prototipo/sessao_14_09/dinheiro_parte1_*`, `dinheiro_parte2a_*`,
  `dinheiro_parte2b_*` (plano, journals e resultados).
- Etapas 5 e 6: `sessao_14_09/etapa6_mesmo_ano_*`, `etapa5_grupos_*`, `fecho_etapa5_*`.
- Desmarques dos que subiram: `sessao_14_09/desmarques/` (+ página publicada como artifact).
- Prévia que originou a etapa 5 nova: `sessao_14_09/etapa5_previa/`.
- Scripts dos fluxos: `_fonte/prototipo/workflows/`.
