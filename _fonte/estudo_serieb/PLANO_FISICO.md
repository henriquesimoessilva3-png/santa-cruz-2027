# Sessão de dados físicos — o que propor, e por quê

> Escrito em 21/09/2026 a pedido do dono: "queria fazer uma sessão só de dados físicos, olhando um
> por um, ou uma combinação deles, dentro dos jogadores das equipes que sobem, por posição — acredito
> que tenha algum padrão ali dentro".
>
> Este arquivo é **proposta**, não análise. Nenhum número dele foi testado. A ordem é de chance de
> achar alguma coisa, e cada item diz o que o mataria.

## 1. O que já foi medido, para não remedir

| parte | o que fez | o que achou |
|---|---|---|
| **A07** | físico no TIME, volume × intensidade | correr mais não separa quem sobe do meio |
| **A10** | físico no returno e em sequência de jogos | só 2025 tem físico por jogo; queda igual à do meio |
| **A11** | físico × técnico no time | correr PARA DENTRO da área liga com entrar na área; correr mais, não |
| **J04** | 20 medidas físicas por 90, por posição, uma a uma | nenhuma separa o titular de quem sobe; sobram dois sinais, um no volante e um na zaga, cada um num recorte só |
| **J05-2** | o perfil físico que o app usa | metade não sobrevive à correção |
| **J10** | corrida sem bola, por 30 min de posse | 0 de 18 na corrida para a área; passa o VOLUME, e só no volante |

**O padrão que já aparece e ninguém perseguiu: o volante.** Ele é a única posição que dá sinal em
duas medidas independentes (J04-2 e J10-2). Qualquer sessão de físico devia começar perguntando se
isso é real ou se é a posição que sobrou de tanto testar.

## 2. O que a base tem, contado

- **`physical`** — 3.616 jogador-temporada, 2022 a 2026, **60 colunas**. E o ponto que interessa:
  cada métrica vem em **três unidades** — por 90 minutos, por 30 min **com** o time em posse (TIP)
  e por 30 min **sem** a posse (OTIP). Cobertura de 3.576 a 3.613 nas três. A exceção é
  `peak_velocity`, com 1.348 (o PSV-99 cobre a janela inteira).
- **Titulares com físico, 2022–2025: 697** — Zaga 134, Lateral 133, Meia 130, Atacante 123,
  Volante 89, Extremo 88. Goleiro não é rastreado.
- **`physical_match`** — 17.075 jogador-jogo, mas **só 2025 (11.027) e 2026 (6.048)**. É a única
  tabela física por jogo. Traz `position` e `position_group` do próprio SkillCorner, independentes
  da ponte do Wyscout.
- **`off_ball_runs`** — todas as temporadas (é a do J10).
- **`possessions` e `passes`** — **só 2026**, 726 e 735 linhas. Fora do recorte fechado: servem
  para a temporada em curso, não para o estudo.
- **Idade** em 2.459 de 2.460 linhas; **lesões** em `serieb_lesoes.csv`, 2.724 linhas.

## 3. As propostas, em ordem de chance

### 3.1 Correr COM a bola e correr SEM a bola (TIP × OTIP) — a mais promissora

**A pergunta.** O J04 mediu tudo **por 90**. Dois jogadores com a mesma distância por 90 podem ser
coisas opostas: um corre quando o time tem a bola (ataca), o outro corre quando não tem (persegue).
Por 90 isso é invisível — e são modelos de jogo diferentes.

**O que é novo.** A razão **OTIP ÷ TIP** de cada métrica é um indicador que o estudo nunca montou, e
existe pronto para 18 métricas. No time, o A11-2 já achou que correr sem a bola sobe a linha de
pressão — no jogador, ninguém olhou.

**Desenho.** Titular, por posição, Sobe × Meio, dois cortes de fronteira, lista pré-declarada com
a razão de cada métrica. n de 88 a 134 por posição.

**O que a mataria.** Se a razão for quase constante entre jogadores (todo mundo corre na mesma
proporção), não há o que separar — e isso se vê antes de testar, olhando a dispersão.

### 3.2 A dispersão dentro do elenco, não a média — a mais original

**A pergunta.** Todo o estudo compara o titular **médio**. Mas montar elenco não é ter onze médios:
talvez o que separe seja ter **um ou dois muito acima** e o resto normal.

**O que é novo.** Ninguém mediu o máximo, o desvio-padrão nem a distância entre o 1º e o 11º do
elenco em cada métrica física. A07 e A11 usaram média de time; J04 usou jogador contra jogador.

**Desenho.** Unidade clube-temporada (80 linhas, 40 clubes): para cada métrica, a média, o máximo,
o desvio e o corte do 3º melhor do elenco. Sobe × Meio, dois cortes, BH por família.

**O que a mataria.** O máximo de uma amostra cresce com o tamanho dela — time que rodou mais
jogadores tem máximo maior por construção. Tem de entrar com o número de jogadores rastreados como
controle, senão o achado é artefato. **Esta é a armadilha principal da proposta.**

### 3.3 A combinação, e não a métrica — responde direto o que o dono pediu

**A pergunta.** "Ou uma combinação deles." O J04 testou um a um e corrigiu por família: por
construção, esse desenho não vê um padrão que só existe na combinação.

**Desenho honesto, em duas partes.**
1. **Eixos declarados antes.** Reduzir as ~20 métricas a 3 eixos por posição (volume, explosão,
   resistência), com a composição declarada ANTES de rodar, e testar 3 coisas em vez de 20 — menos
   testes, mais poder.
2. **Distância ao tipo.** Para cada posição, o centroide físico dos titulares de quem subiu, e a
   distância de cada jogador a ele. Testa "existe um TIPO físico", que é outra pergunta.

**O que a mataria, e o cuidado obrigatório.** Combinação é onde o garimpo mora: com 20 métricas há
milhares de combinações e alguma sempre separa. O antídoto é o **nulo de permutação** — embaralhar
o rótulo de quem subiu mil vezes e ver quantas vezes um padrão tão bom aparece por acaso. Sem isso,
esta proposta não deve rodar.

### 3.4 Físico × disponibilidade — daria MECANISMO ao único requisito que sobrevive

**A pergunta.** O J05-3 diz que minutagem alta e regular é o único requisito que a base sustenta, e
não explica por quê. E se a ligação for física — quem corre de um certo jeito se machuca menos e
joga mais?

**Desenho.** Cruzar `physical` com `serieb_lesoes.csv` (2.724 linhas) e com a minutagem: o físico do
ano prevê jogos perdidos e minutagem do ano seguinte? Aqui a **porta temporal roda de verdade**, o
que nenhuma parte física conseguiu até hoje.

**O que a mataria.** Lesão é rara e mal registrada; se a cobertura do Transfermarkt for irregular
entre clubes, o teste mede o registro e não o corpo. Conferir cobertura por clube antes.

### 3.5 Idade e queda física — decisão de contratação, e sai número de qualquer jeito

**A pergunta.** A que idade a explosão cai na Série B, por posição? Até que idade vale pagar por
velocidade?

**Desenho.** 2.459 linhas com idade e físico, curva por posição, e o mesmo jogador ao longo dos
anos (o que separa "os velhos são mais lentos" de "o jogador fica mais lento").

**Por que entra mesmo sem separar quem sobe.** Ela não precisa achar diferença entre faixas para
ser útil: a curva já é decisão. É a proposta de menor risco da lista.

### 3.6 O físico por JOGO de 2025 — a única que liga físico a resultado

**A pergunta.** No jogo em que o time pontuou, o jogador correu diferente? É a máquina da A15
aplicada ao corpo, dentro do próprio jogador.

**Desenho.** `physical_match`, 11.027 linhas de 2025, dentro do jogador e do mando.

**O que a mataria.** **Uma temporada só**, com 4 promovidos. O n de linhas é grande e o n de provas
independentes é minúsculo — é exatamente o engano que a A15-3 mediu. Entra como leitura de apoio,
nunca como parte própria.

## 4. Por onde eu começaria

**3.1 e 3.5 na mesma rodada.** A primeira é a que tem mais chance de achar o padrão que o dono
suspeita, e a segunda dá número útil mesmo se não achar nada — o que protege a sessão de terminar
só com negativas.

**3.2 logo depois**, com o controle do número de jogadores rastreados escrito antes de rodar.

**3.3 só com o nulo de permutação pronto.** Sem ele, é a proposta que mais provavelmente produz um
achado bonito e falso.

## 5. O que dizer antes de começar

Seis partes de jogador já deram negativo no físico (J03, J04, J05, J10 e as duas leituras do A11).
Isso **não** quer dizer que não há padrão: quer dizer que ele não está nas médias por 90, uma
métrica de cada vez. As propostas acima mudam exatamente isso — a unidade (TIP/OTIP), a estatística
(dispersão em vez de média), a forma (combinação em vez de uma a uma) e o desfecho (disponibilidade
em vez de acesso). Se depois destas quatro não houver nada, aí sim a frase muda de "não achamos"
para "esta base não tem".
