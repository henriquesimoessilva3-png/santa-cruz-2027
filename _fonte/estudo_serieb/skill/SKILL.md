---
name: analisar-campeonato
description: Metodo para responder, com dado de campeonato, o que separa quem sobe de quem fica no meio — e quem contratar. O desenho (clube-temporada, posto dentro do ano, faixas, corte de fronteira), o criterio de conclusao (BH por familia, lista pre-declarada, poder, porta temporal), a forma da entrega (manchete/o que vimos/uso pratico/confianca com n), o portao de 11 regras que barra a classe de erro inteira, o teste de viabilidade da base e o catalogo de armadilhas. Use quando o pedido for analisar uma liga ou campeonato (Serie A, B, C, estadual, liga estrangeira), descobrir o que diferencia quem sobe ou quem cai, montar perfil de contratacao por posicao, avaliar treinador por dado, ou quando alguem perguntar se um achado de campeonato "se sustenta". Use tambem para revisar analise de campeonato ja escrita — o portao e o catalogo servem de checklist.
---

# Analisar um campeonato

Este é o método do **Estudo Série B** (repositório Santa Cruz 2027, `_fonte/estudo_serieb/`),
generalizado. Ele responde três decisões de clube: que time montar, que treinador buscar, quem
contratar por posição.

**O que transfere e o que não.** As *conclusões* daquele estudo não transferem — que o acesso se
decide na qualidade da chance cedida e no duelo defensivo ganho é resposta daquela liga, daquelas
temporadas. O que transfere é o **desenho**, o **critério**, o **portão** e, principalmente, o
**catálogo de armadilhas**: ver `references/armadilhas.md`, que é a parte mais cara deste
material — cada entrada custou um erro real.

**A ordem importa.** Viabilidade → lista pré-declarada → cálculo → texto → portão. Pular a
primeira produz promessa que a base não paga; pular a segunda produz garimpo.

---

## 1. Antes de prometer: o que a base tem

Escreva isto **antes** de aceitar a pergunta. Cada linha que falhar apaga uma pergunta inteira, e
é muito mais barato dizer isso no começo.

| Se a base não tem | Cai |
|---|---|
| físico por **jogo** (só por temporada) | intensidade dentro do jogo; físico em sequência de jogos |
| minuto do gol | momentos do jogo; reação ao placar |
| 1º e 2º tempo separados no físico | queda de rendimento no jogo; recorte por estado do jogo |
| nome de treinador | o bloco de treinador inteiro (quase nenhuma base de evento traz) |
| 10+ casos por liga de origem | fator de conversão entre ligas |
| escalação por rodada | estabilidade do time medida por turno |

**Duas descobertas que valem tempo:**

- **Dado agregado pode já existir pronto.** Antes de raspar 1.780 páginas de jogo para somar gol
  por faixa de 15 minutos, veja se a fonte publica a soma por temporada. No oGol publica: foram
  **18 páginas** em vez de 1.782. O que o agregado *não* dá — evento, autor, mando, quem marcou
  primeiro — decide se ele basta.
- **"Não roda" envelhece.** Uma pergunta marcada como impossível por falta de dado deve ser
  relida quando alguém propuser coleta: o veredito era sobre a base, não sobre o mundo.

## 2. O desenho

- **Unidade:** clube-temporada (ou jogador-temporada no bloco de contratação).
- **Normalização:** **posto dentro da temporada**, nunca número bruto entre anos. Liga muda de
  ritmo, de arbitragem e de bola; comparar 2022 com 2025 em valor absoluto compara campeonatos.
- **Faixas:** Sobe (1º–4º) | Meio (5º–16º) | Cai (17º–20º). Comparação padrão: **Sobe × Meio**.
  Sobe × Cai mede time bom contra time ruim e diz pouco. Um recorte de "quase" (5º–8º) ajuda, com
  o n sempre no cabeçalho — ele é pequeno.
- **Métricas:** por 90 min; defensivas ajustadas pela posse quando fizer sentido; desempenho com
  sinal alinhado (alto = melhor), estilo sem inversão.
- **Fronteira:** time do G4 a até 3 pontos do 5º, ou fora do G4 a até 3 pontos do 4º (mesma lógica
  na linha de baixo). **Toda comparação entre faixas roda também sem esses times.**

**A fronteira é teste de robustez, não recorte melhor.** O corte reduzido é enviesado por
construção: tirar os times colados na linha afasta artificialmente as faixas vizinhas. Então:

> **Firme = firme nos DOIS cortes.** Achado que só aparece sem os times de fronteira é suspeito,
> não promovido. E achado que some sem eles também é suspeito.

## 3. O critério de conclusão

**Lista pré-declarada.** Todo indicador entra numa lista versionada **antes** de rodar, com
família, sinal e nome de leitura. Indicador que aparece depois do resultado é garimpo.

**Correção para múltiplos testes.** Benjamini-Hochberg a 5%, **por família**, e uma família é
**um pilar × uma comparação**. Não parta a família por setor nem por faixa de minuto para
"caber" — testar 16 e corrigir 1 é o garimpo com outro nome.

> **O q depende da companhia.** O mesmo indicador, com o mesmo p, sai com q diferente em famílias
> diferentes, porque o BH divide o crédito entre os testes feitos juntos. Se duas partes medem o
> mesmo indicador, **uma é dona e a outra cita** — nunca as duas corrigem. O dono é a parte cuja
> pergunta o indicador responde.

**Poder.** Calcule o efeito mínimo detectável do desenho. Sem isso, "não separa" vira "não
existe", que é afirmação diferente e mais forte. Escreva: *"este desenho não veria diferença menor
que X"*.

**Porta temporal.** O indicador medido no 1º turno prevê os **pontos** do 2º, com a parcial dada à
pontuação do 1º turno. É o que separa característica de consequência.

> **Persistência NÃO é porta temporal.** O indicador prevendo *a si mesmo* na outra metade mede só
> que ele se repete. Chamar isso de porta temporal é o erro mais fácil de cometer e o mais difícil
> de ver, porque o nome fica certo e a conta fica errada.

**Os três níveis:**

| | exige |
|---|---|
| **firme** | passa no BH **e** na porta temporal |
| **provável** | passa em um dos dois |
| **indício** | não passa em nenhum, mas é coerente e tem uso prático — e a frase diz por quê |

Se a porta **não é calculável** na base (indicador que só existe por temporada fechada), o teto é
provável, e isso é limite de dado, não reprovação. Declare antes de rodar.

## 4. A forma da entrega

Três camadas: manchete para 10 segundos, texto e uso prático para 2 minutos, prova para quem
confere.

- **Manchete:** a conclusão numa frase de reunião, ≤14 palavras, uma oração. É conclusão, nunca
  tema — *"Quem sobe finaliza de mais perto"*, não *"Qualidade de chance"*.
- **O que vimos:** ≤3 frases, ≤280 caracteres, em unidade de jogo (chutes por jogo, pontos,
  "3 em cada 8"). Nunca percentil, d, q, p.
- **Para o clube:** o que muda na montagem, no treinador ou no modelo. Conclusão sem uso prático
  não sobe.
- **Confiança:** firme / provável / indício, **sempre com o n**.
- **Resultado negativo é conclusão**, no mesmo formato.

**Números por marcador.** Nenhum número é digitado no texto: ele vem do dado, por marcador
(`{n_barato}`), resolvido por um gerador. Isso inclui o motivo da confiança, o texto da premissa e
o **título do gráfico** — campo visível que não passa pelo gerador é campo que envelhece calado.

> **Encurtar come ressalva.** Quando o texto não couber na régua, sai o **detalhe do achado**,
> nunca a ressalva. E medir tamanho não detecta a perda: a frase continua gramatical e mais
> confiante do que os dados permitem. A única checagem que pega é um leitor **cético que nunca leu
> o original**, comparando final com original.

> **O desenho afirma tanto quanto o texto.** Barra e régua começam no zero. Um eixo cortado fez
> 0,26% ocupar 40% da largura embaixo de uma manchete que dizia "sem diferença clara". E valor
> publicado em módulo inverte a leitura do gráfico: módulo é decisão de frase, não de dado.

## 5. O portão de entrega

Um script que lê as saídas e recusa a parte. **Ele é o que barra a classe de erro inteira** — sem
ele, cada defeito precisa ser achado à mão, uma vez por parte. As regras que valeram a pena:

1. todo número publicado consta da saída do próprio script, com o mesmo valor;
2. a confiança recalculada da tabela de testes (firme = BH **e** porta);
3. os dois cortes de fronteira existem, e quando discordam o texto cita os dois;
4. o campo "prova" aponta para algo que existe e sustenta o que alega;
5. o script importa o módulo de método da casa (nada de teste reimplementado ao lado);
6. nenhuma palavra de jargão na manchete e no texto de leitura;
7. nenhum indicador publicado duas vezes com q diferente;
8. o registro é gerado das saídas, nunca editado à mão;
9. o campo "gerado por" é verdade — o script citado **grava** aquela saída;
10. a manchete cabe em 14 palavras, numa oração;
11. o texto de leitura cabe em 280 caracteres e 3 frases.

**Três coisas sobre portão, aprendidas apanhando:**

- **Escreva o que ele NÃO prova.** O portão confere que o número publicado é igual ao que o script
  declara — não que esse número saiu do dado. Saída escrita à mão com script de fachada ainda
  passa. Essa lista de limites vale tanto quanto as regras.
- **Um portão só confere quem está na lista dele.** Três partes ficaram publicadas como decididas
  e fora da lista; o portão dizia "22 de 22" e as 22 eram as que ele conhecia. Confira a lista
  contra os arquivos que existem, não contra si mesma.
- **REVISAR não é REPROVA.** Discordância fraca (troca de sinal onde nenhum dos cortes separa, ou
  perto de zero) continua impressa no relatório, mas não derruba a parte. Sem esse degrau, ou o
  portão vira ruído ou alguém afrouxa a régua.

**Nunca afrouxe a régua para passar.** Quando o portão reprovar, as saídas honestas são duas:
consertar na fonte, ou descobrir que **o portão estava procurando a coisa errada** — e aí a
mudança é nele, escrita e justificada. Um caso real: a regra procurava a palavra "fronteira" e o
texto, de propósito, dizia "times colados na linha". A ressalva estava lá; a régua é que não
enxergava. O vocabulário que liga o nome da tabela ao nome de reunião mora na **lista
pré-declarada**, auditável, nunca escondido no portão.

## 6. As armadilhas

**Leia `references/armadilhas.md` antes de cruzar bases, antes de publicar número e antes de
encurtar texto.** São ~25 entradas, cada uma de um erro que aconteceu de verdade, com o sinal de
que ela está presente e o que fazer.

As cinco que mais custaram:

1. **`gerado por` falso** — o script existe, importa o que deve, e **não grava** a saída que
   assina. Existir não é produzir.
2. **Persistência com nome de porta temporal** (§3).
3. **O mesmo indicador em duas famílias, com dois q** (§3).
4. **Robustez citada de um lado só** — o corte reduzido roda, não é publicado, e o texto afirma
   como se os dois concordassem.
5. **Casamento por nome** — homônimo de futebol brasileiro se resolve com busca externa (data de
   nascimento, clube de formação), não com heurística. Antes de listar como ambíguo, pesquise.

---

## O exemplo trabalhado

`_fonte/estudo_serieb/CLAUDE.md` no repositório Santa Cruz 2027 é este método aplicado a uma liga
real, com 27 perguntas, 26 respondidas e o portão em 26 de 26. `scripts/_portao.py` é o portão,
`scripts/_metodo.py` é o módulo de teste, `resultados/_metodo_fronteira.md` é a regra do corte e
`resultados/_porta_temporal.md` é o que aconteceu quando alguém foi conferir se a porta temporal
tinha mesmo sido rodada. A resposta era não, em todas as partes que diziam tê-la rodado.
