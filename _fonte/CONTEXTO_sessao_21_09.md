# Sessão de 21/09/2026 — o estudo virou produto, e a próxima rodada de análise

> Escrito para quem abrir sem ter visto nada. Estado primeiro, a fila depois, o relato no fim.
> Continua o `_fonte/CONTEXTO_sessao_20_09_tarde.md`. Subordinado ao
> `_fonte/estudo_serieb/CLAUDE.md` (método).

---

## 1. O estado

| | |
|---|---|
| perguntas | **27 de 27** respondidas e validadas |
| portão | **27 de 27 aceitas** |
| rascunho / pendente | 0 / 0 |
| skill `analisar-campeonato` | pronta, instalada, versionada |
| site | no ar, `henriquesimoessilva3-png.github.io/santa-cruz-2027` |

`main` limpa. Último commit: `45dfb46`.

**O estudo está fechado.** O que entrou depois disso é produto, não análise.

## 2. O que entrou em 21/09

- **Valor de mercado** no campograma (cartão e pé de cada posição), na barra de cima e nas duas
  listas da aba Estudo. Em EURO, do Transfermarkt, com o Wyscout como segunda fonte marcada.
- **A ficha do estudo virou colunas** — uma por critério, com o piso no cabeçalho.
- **A página de decisões**, no topo da aba: 10 decisões, com selo de força e ressalva em cada.

## 3. A FILA DA PRÓXIMA RODADA

Saiu de uma conversa do dono com o Thairo (prints na sessão de 21/09). A análise dessas ideias
contra o que o estudo já mediu está no relato, seção 4. Em ordem de valor:

### 3.1 Ir para o NÍVEL DO JOGO — a de maior impacto

A pergunta vira "o que um time faz **num jogo** que aumenta a chance de pontuar", e o n sai de
**80 clube-temporadas para 3.036 linhas clube-jogo**. Muito indício pode virar firme — ou morrer
de vez, que também é resposta.

**Não precisa de coleta.** O `dados/serieb_jogos.csv` já tem 3.036 linhas de 2022–2025 com 119
colunas técnicas. (O Thairo supôs que faltava coletar; falta só o FÍSICO por jogo, que é a A08 e
está fechada como "esta base não responde".)

Dois cuidados que têm de ir escritos:
1. **Jogo não é unidade independente** — o mesmo clube reaparece 38 vezes. O erro tem de ser
   reamostrado por CLUBE, que é o que o `ic_por_clube()` do `_metodo.py` já faz.
2. **A pergunta muda.** "O que aumenta a chance de pontuar neste jogo" ≠ "o que separa quem sobe
   na temporada". Um time pode pontuar com o que não o faz subir. As duas valem; não são a mesma,
   e a parte nova não substitui as antigas.

### 3.2 Filtro só por minutagem nas listas

Hoje a ficha é conjunção de pisos e o J06-1 diz que **nenhum nome sai por falha da ficha** — ela
reprova todo mundo. O J05-3 já concluiu que **o único requisito que a base sustenta é minutagem
alta e regular por posição**. Então: minutagem elimina, o resto ORDENA (pelo eixo da qualidade da
chance, com físico e duelo como desempate). Metade já foi feita — a lista já ordena por aderência.

### 3.3 Ponto por real

"Dentro do que o dinheiro compra, qual traço dá mais ponto por real?" É a pergunta certa para
quem não vai ter folha de top-5. Técnica: medir o traço **controlando pelo valor do elenco** —
mesma parcial que a porta temporal usa com os pontos do 1º turno.

Aviso que vem do próprio estudo: o **A12-2** já achou que *"quem jogou como os que subiram sem
dinheiro caiu mais do que subiu"*. A resposta pode ser desconfortável.

### 3.4 Corridas para a área como requisito de contratação

O eixo firme é a qualidade da chance. A ponte para o jogador existe e **nunca foi usada**: a
tabela `off_ball_runs` do `skillcorner_serieb.db` tem 3.876 linhas com `runs_penalty_area`,
`runs_dangerous`, `runs_shot_within_10s`.

### 3.5 Gap analysis: Santa Cruz × perfil de quem subiu

Temos as duas metades — a ficha por posição (J05/J06) e o elenco no campograma — e nunca ligamos
uma na outra. Sairiam as 2–3 posições prioritárias.
Ressalva já medida: o **J08-3** diz que quem chega de outra liga guarda **menos da metade** do
destaque que tinha, e o **J08-1** que nenhum país chega ao mínimo de casos — então o ajuste de
nível é fraco e tem de ir escrito.

## 4. O relato: as ideias do Thairo contra o que o estudo mediu

**Onde ele acertou, e vale registrar:** a estrutura que ele propôs (unidade clube-temporada,
pontos por jogo como contínua, normalizar por temporada, tamanho do efeito, separar estilo de
qualidade, traduzir em perfil por posição) **é o método que o estudo já usa** — em alguns pontos
o estudo é mais rigoroso (posto em vez de z-score; os dois cortes de fronteira; correção por
família).

**As oito hipóteses que ele listou para testar: sete já foram testadas**, e quase todas voltaram
negativas — bola parada (A04-1), pressão (A06-2), correr mais (A07-1), depender de casa (A03-1),
construção com bola (A05-1), manter a base (J02-2). A única não testada como ele descreve é
**transição (xG depois de recuperação)**: temos contra-ataques (A05) e recuperações (A06), que não
separaram, mas não xG da transição.

**A convergência mais forte:** ele disse "construir tudo em cima da qualidade da chance, que é o
único traço que acompanha o treinador na troca de clube". Três partes independentes dizem isso —
A02-1 (firme), T03-1 (*"só a distância do chute acompanha o treinador na troca de clube"*) e A12-1
(*"só a qualidade da chance dá para treinar"*).
**Precisão que muda o que se compra:** o eixo é a **distância do chute**, não a régua inteira —
sem ela a régua perde a porta temporal (parcial +0,191, p 0,0895).

**O que NÃO fazer, e por quê:** a árvore de decisão rasa para a diretoria. Com 80 clube-temporadas
e 16 acessos, ela vai achar regras do tipo "xG contra < X e bola parada > Y" — e bola parada já
foi medida e **não** separa. A árvore escolheria o corte que melhor divide ESTES 80, que é a
definição de garimpo. O A14 já faz o papel dela, e o próprio A14-2 avisa que um ano sozinho não
tem times para validar, e o A14-3 que em 2026 a régua troca a ordem e erra times do G4.

## 5. A ordem de publicação, como comando

```bash
python3 _fonte/estudo_serieb/scripts/gerar_decisoes.py   # 0. se mexer nas decisões
python3 gerar_valor_mercado.py                           # 0b. se mexer no valor de mercado
python3 gerar_estudo_serieb_js.py                        # 1. o dado da aba
python3 _fonte/estudo_serieb/scripts/gerar_registro.py   # 2. o registro
python3 _fonte/estudo_serieb/scripts/_portao.py          # 3. o portão (só lê)
python3 publicar_site.py                                 # 4. monta docs/ — SEM --push
git add -A && git commit                                 # 5. um commit só
git push origin main                                     # 6. e conferir:
git log --oneline origin/main..HEAD                      #    tem de sair vazio
```
