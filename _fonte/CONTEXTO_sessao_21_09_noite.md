# Sessão de 21/09/2026, noite — a fila inteira, e o que cada item respondeu

> Escrito para quem abrir sem ter visto nada. Estado primeiro, o que mudou depois, o relato no fim.
> Continua o `_fonte/CONTEXTO_sessao_21_09.md`, que deixou a fila de cinco itens escrita.
> Subordinado ao `_fonte/estudo_serieb/CLAUDE.md` (método).

---

## 1. O estado

| | |
|---|---|
| perguntas | **30 de 30** respondidas e validadas (eram 27) |
| conclusões | **83** — 1 firme, 27 prováveis, 55 indícios |
| portão | **30 de 30 aceitas** |
| página de decisões | **16 decisões** (eram 10) |
| partes novas | **A15**, **A16**, **J10** |

`main` limpa. O estudo deixou de estar "fechado": a fila de 21/09 acrescentou três perguntas e
todas foram respondidas e publicadas.

## 2. A fila, na ordem que o dono pediu, e o que cada item deu

O dono confirmou a ordem: **1 página de decisões · 2 nível do jogo · 3 filtro por minutagem ·
4 ponto por real · 5 corridas para a área**, e pediu tudo nesta sessão, sem worktree separada.

### 1. Página de decisões — feita de manhã, ver o contexto anterior.

### 2. Nível do jogo → **A15**
A unidade desce a clube-jogo: 3.036 linhas, 40 clubes, **sem coleta nenhuma**. Três coisas que a
unidade obriga e que foram escritas:
- **O p sai do bootstrap de CLUBE**, não do t de Welch sobre linhas — 3.036 linhas são 40 clubes
  reaparecendo 76 vezes. `scripts/_metodo_jogo.py` (importa o `_metodo.py`, não altera nada dele).
- **Duas leituras:** entre times e DENTRO do clube (centrado no próprio clube naquela temporada e
  naquele mando). Conclusão só sobe nas duas.
- **Sem corte de fronteira** — não há 4º colocado dentro de um jogo. No lugar, **sem os empates**.

Teto declarado antes de rodar: provável. Não há anterioridade dentro de um jogo.

O que saiu: o time pontua **cedendo chute pior, não cedendo menos chute** (o eixo do A02
confirmado dentro do próprio time); no jogo em que pontua ele tem **menos bola**, com a ressalva
do placar por inteiro; e **descer ao jogo mede melhor sem provar mais** — o teste de linha e o de
clube dão quase a mesma resposta, e o que morre de vez é a anterioridade.

### 3. Filtro só por minutagem nas listas
Produto, não análise. A regra agora é a que o J05-3 sustenta: **minutagem elimina, o resto
ORDENA**, pelo eixo da qualidade da chance (toques na área e passes progressivos), com físico e
duelo como desempate. Série B: 175 saíram no corte, 65 ficaram.
A regra mora em `resultados/J06_ordenacao.json`, versionada, **não** dentro do script.
Dois cuidados escritos: `Toques na área/90` entra MEDIDO e sem piso (se virasse exigência,
quebraria a conferência contra o funil do J06); e quem jogou pouco por LESÃO cai junto com quem
jogou pouco por escolha, porque o J01-2 mediu que a base não distingue os dois.

### 4. Ponto por real → **A16**
O dinheiro entra como **controle**, nunca como desconto. A lista **não é escolhida ali**: são os
candidatos do A14, menos o `H_dinheiro` (o controle) e o `I_estabilidade_11` (consequência) — e o
script confere isso contra o `A14_resumo.json` e para se não bater.

O número de reunião: **a dinheiro igual, subir do quarto de baixo para o quarto de cima em solidez
vale 8,9 pontos** — mais do que os 7,0 que o mesmo salto de elenco paga, e esse salto custa
€ 9,9 mi. Jogar assim equivale a € 12,6 mi de elenco.

E o freio, que vai colado: a porta da §6.4 rodada **com o dinheiro no controle** derruba tudo. A
anterioridade da distância do chute cai de +0,289 para +0,198 e nenhum dos 8 traços passa. A
coluna sem dinheiro reproduz o `_porta_temporal.json` número a número — é a conferência de que a
conta é a da casa.

Terceira: **a dividida no chão só paga ponto fora de casa** (4,9 pontos contra 0,2).

### 5. Corridas para a área → **J10**
A ponte que nunca tinha sido usada (`off_ball_runs`, 3.876 linhas) foi usada, e **não paga**: de
18 testes por setor, ZERO separa o titular de quem sobe nos dois cortes. É a quarta medida de
jogador a dar negativo (J03-1, J04-1, J05-3 e agora esta).

O que passou foi a família de **CONTROLE** — a que existia para testar se o achado era "para onde
ele corre" ou "quanto ele corre". Deu **quanto**, e só no volante, que é a mesma posição do J04-2.

Ressalva que muda a leitura: no volante os três indicadores de corrida para a área apontam para o
lado **certo** (+0,39 a +0,43) e ficam abaixo do mínimo detectável (0,74). "Não separa" aqui é
"este desenho não veria" — com mais temporadas rastreadas a pergunta merece voltar, e a lista já
está declarada de antes.

## 3. O que mudou no método da casa

- **`scripts/_metodo_jogo.py`** — o método da casa na unidade clube-jogo. Importa o `_metodo.py` e
  troca só de onde sai o p. A conta fechada do bootstrap é conferida contra a concatenação, no
  mesmo sorteio, antes de qualquer teste.
- **A parcial com mais de um controle** (dentro do `A16.py`) é conferida contra a
  `_porta_temporal.parcial` com um controle só: diferença 0,0e+00.
- **`J06_ordenacao.json`** — a regra da lista virou dado versionado.
- As três listas de partes (`_portao.py`, `gerar_registro.py` e o ROTEIRO do
  `gerar_estudo_serieb_js.py`) foram atualizadas juntas. **São a mesma lista em três lugares** —
  parte fora de uma delas fica publicada sem conferência, que foi o que aconteceu com J05, J06 e
  J09 até 20/09.

## 4. Dois defeitos de desenho achados e consertados

- **Marcador com sinal `+` virava 0 no gráfico**, em silêncio: o `num()` do
  `static/estudo_serieb_grafico.js` só aceitava `-`, e `parseFloat("+0,85")` devolve 0. Número
  errado na tela e plausível, que é o pior tipo. Consertado nos dois lados: a regra do `num()` e
  os marcadores de gráfico passando a sair como NÚMERO, não como texto pt-BR.
- **Duas unidades numa régua só** no J10-2 (3,23 corridas e 12,4 metros): a régua ia a 13,9 e a
  diferença real de corrida forte aparecia como nada. Uma unidade por gráfico.

## 5. A fila da próxima rodada

Sai do "em aberto" das três partes novas. Em ordem de valor:

1. **O primeiro gol de cada jogo.** É a mesma coleta que a A09 deixou pendente, e agora com três
   motivos: fecha a ressalva do placar do A15 inteiro, resolve a tensão da dividida no chão entre
   A06-1 e A15, e permite o recorte por estado do jogo que a seção Placar do CLAUDE.md pede. É a
   compra que mais renderia ao estudo.
2. **O preço do traço.** O A16 mede o que o traço RENDE e não o que ele CUSTA. Folha salarial por
   clube-temporada resolveria, e não está na base.
3. **Valor de elenco com data.** O instantâneo do Transfermarkt não tem data conhecida, e é disso
   que depende a leitura do A16-2. Um valor por turno já ajudaria.
4. **Corrida por jogo.** A `physical_match` existe por jogo; a `off_ball_runs` não. Com ela
   rodaria a anterioridade do J10 e daria para cruzar com o A15.
5. **Mais temporadas rastreadas**, para o poder do J10 no volante.
6. **Onde a ação defensiva aconteceu.** Contado em 21/09: das 118 colunas de jogador do Wyscout,
   16 nomeiam uma zona do campo e **nenhuma das 6 defensivas** nomeia. Sem isso não há como achar
   o jogador que "protege a área em vez de bloquear chute de fora", que é a metade defensiva do
   eixo (A15-1, D11). O lado ofensivo já se identifica e virou a ordem da lista em 21/09; o
   defensivo depende de evento com coordenada ou do posicionamento defensivo do SkillCorner.

## 6. A ordem de publicação, como comando

```bash
python3 _fonte/estudo_serieb/scripts/J06_ranking.py      # 0. se mexer na lista por posição
python3 _fonte/estudo_serieb/scripts/gerar_decisoes.py   # 0b. se mexer nas decisões
python3 gerar_valor_mercado.py                           # 0c. se mexer no valor de mercado
python3 gerar_estudo_serieb_js.py                        # 1. o dado da aba
python3 _fonte/estudo_serieb/scripts/gerar_registro.py   # 2. o registro
python3 _fonte/estudo_serieb/scripts/_portao.py          # 3. o portão (só lê)
python3 publicar_site.py                                 # 4. monta docs/ — SEM --push
git add -A && git commit                                 # 5. um commit só
git push origin main                                     # 6. e conferir:
git log --oneline origin/main..HEAD                      #    tem de sair vazio
```
