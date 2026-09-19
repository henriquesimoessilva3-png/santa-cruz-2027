# Auditoria das 53 conclusões — estado em 18/09/2026

> Gerado dos journals dos runs `wf_5e6cb475-6e4` (refutação + 45 julgamentos) e `wf_71eac84b-6af` (as 8 restantes).
> Dado cru completo, com os pareceres de cada cético: `_auditoria_18_09.json`.

## Como ler

Cada conclusão foi atacada por um refutador (postura adversarial: mandado derrubar a frase).
O que ele marcou foi a três céticos independentes — um refaz a conta, outro confere se a regra
citada existe mesmo, o terceiro pergunta se muda algo na prática. **Maioria de 2 em 3 confirma.**

**O rótulo de gravidade do refutador está inflado** (ele pôs 47 das 53 na gravidade máxima) —
ignore-o. O que vale é o achado confirmado, um a um.

| | |
|---|---|
| conclusões refutadas | 53 de 53 |
| conclusões julgadas pelos céticos | **53** |
| falta julgar | **nenhuma** |
| achados confirmados | **350** |
| achados derrubados pelos céticos | 128 (27%) |
| achados ainda crus | 0 |

## Os padrões que se repetem

| tipo de defeito | confirmados |
|---|---|
| `prova_nao_sustenta` | 63 |
| `outro` | 44 |
| `excesso_de_alcance` | 40 |
| `numero_errado` | 38 |
| `n_errado` | 32 |
| `palavra_proibida` | 28 |
| `confianca_alta_demais` | 24 |
| `poder_nao_calculado` | 21 |
| `fronteira` | 18 |
| `efeito_do_placar` | 15 |
| `marcador_sem_valor` | 11 |
| `consequencia_como_caracteristica` | 9 |
| `porta_temporal` | 6 |
| `sem_uso_pratico` | 1 |

## Conclusão por conclusão

| ID | julgada | achados confirmados | tipos |
|---|---|---|---|
| **A01-1** | sim | 3 | excesso_de_alcance, numero_errado, prova_nao_sustenta |
| **A01-2** | sim | 5 | numero_errado, outro, prova_nao_sustenta |
| **A01-3** | sim | 4 | excesso_de_alcance, numero_errado, prova_nao_sustenta |
| **A02-1** | sim | 6 | efeito_do_placar, excesso_de_alcance, fronteira, n_errado, numero_errado, poder_nao_calculado |
| **A02-2** | sim | 7 | efeito_do_placar, fronteira, n_errado, palavra_proibida, poder_nao_calculado, prova_nao_sustenta |
| **A02-3** | sim | 6 | efeito_do_placar, fronteira, n_errado, palavra_proibida, poder_nao_calculado, prova_nao_sustenta |
| **A03-1** | sim | 10 | confianca_alta_demais, consequencia_como_caracteristica, efeito_do_placar, excesso_de_alcance, palavra_proibida, poder_nao_calculado, porta_temporal, prova_nao_sustenta |
| **A03-2** | sim | 7 | efeito_do_placar, excesso_de_alcance, fronteira, outro, palavra_proibida, poder_nao_calculado, porta_temporal |
| **A03-3** | sim | 5 | efeito_do_placar, fronteira, n_errado, palavra_proibida, prova_nao_sustenta |
| **A04-1** | sim | 2 | fronteira, outro |
| **A04-2** | sim | 5 | confianca_alta_demais, excesso_de_alcance, n_errado, poder_nao_calculado, prova_nao_sustenta |
| **A04-3** | sim | 8 | consequencia_como_caracteristica, fronteira, marcador_sem_valor, n_errado, numero_errado, palavra_proibida, porta_temporal, prova_nao_sustenta |
| **A05-1** | sim | 6 | efeito_do_placar, excesso_de_alcance, numero_errado, poder_nao_calculado, prova_nao_sustenta |
| **A05-2** | sim | 9 | confianca_alta_demais, efeito_do_placar, numero_errado, outro, palavra_proibida, poder_nao_calculado, prova_nao_sustenta |
| **A06-1** | sim | 8 | efeito_do_placar, excesso_de_alcance, fronteira, numero_errado, palavra_proibida, poder_nao_calculado, porta_temporal |
| **A06-2** | sim | 7 | numero_errado, outro, palavra_proibida, prova_nao_sustenta |
| **A06-3** | sim | 6 | confianca_alta_demais, efeito_do_placar, excesso_de_alcance, palavra_proibida, prova_nao_sustenta |
| **A07-1** | sim | 8 | confianca_alta_demais, efeito_do_placar, excesso_de_alcance, fronteira, n_errado, outro, poder_nao_calculado, prova_nao_sustenta |
| **A07-2** | sim | 10 | excesso_de_alcance, fronteira, n_errado, numero_errado, palavra_proibida, poder_nao_calculado, porta_temporal, prova_nao_sustenta |
| **A11-1** | sim | 7 | confianca_alta_demais, efeito_do_placar, outro, palavra_proibida, poder_nao_calculado |
| **A11-2** | sim | 5 | outro, palavra_proibida, poder_nao_calculado, prova_nao_sustenta |
| **A11-3** | sim | 7 | confianca_alta_demais, efeito_do_placar, excesso_de_alcance, fronteira, n_errado, palavra_proibida, prova_nao_sustenta |
| **A12-1** | sim | 9 | confianca_alta_demais, consequencia_como_caracteristica, n_errado, numero_errado, outro, palavra_proibida, prova_nao_sustenta |
| **A12-2** | sim | 7 | efeito_do_placar, excesso_de_alcance, numero_errado, outro, prova_nao_sustenta |
| **A12-3** | sim | 3 | excesso_de_alcance, marcador_sem_valor, prova_nao_sustenta |
| **A13-1** | sim | 9 | confianca_alta_demais, excesso_de_alcance, fronteira, numero_errado, outro, palavra_proibida, poder_nao_calculado, prova_nao_sustenta |
| **A13-2** | sim | 4 | numero_errado, outro |
| **A13-3** | sim | 7 | confianca_alta_demais, excesso_de_alcance, outro, palavra_proibida, prova_nao_sustenta |
| **A14-1** | sim | 5 | consequencia_como_caracteristica, excesso_de_alcance, outro, palavra_proibida, prova_nao_sustenta |
| **A14-2** | sim | 7 | confianca_alta_demais, consequencia_como_caracteristica, fronteira, outro, palavra_proibida, prova_nao_sustenta |
| **A14-3** | sim | 8 | consequencia_como_caracteristica, excesso_de_alcance, outro, palavra_proibida, prova_nao_sustenta, sem_uso_pratico |
| **J01-1** | sim | 3 | n_errado, numero_errado |
| **J01-2** | sim | 6 | n_errado, outro, poder_nao_calculado, prova_nao_sustenta |
| **J01-3** | sim | 8 | confianca_alta_demais, consequencia_como_caracteristica, fronteira, marcador_sem_valor, n_errado, numero_errado, outro, prova_nao_sustenta |
| **J02-1** | sim | 4 | excesso_de_alcance, marcador_sem_valor, n_errado, outro |
| **J02-2** | sim | 7 | confianca_alta_demais, consequencia_como_caracteristica, n_errado, outro, palavra_proibida, poder_nao_calculado, prova_nao_sustenta |
| **J02-3** | sim | 6 | excesso_de_alcance, n_errado, numero_errado, outro, palavra_proibida, prova_nao_sustenta |
| **J03-1** | sim | 9 | confianca_alta_demais, excesso_de_alcance, fronteira, marcador_sem_valor, n_errado, poder_nao_calculado, prova_nao_sustenta |
| **J03-2** | sim | 11 | confianca_alta_demais, excesso_de_alcance, fronteira, n_errado, numero_errado, outro, palavra_proibida, prova_nao_sustenta |
| **J03-3** | sim | 7 | excesso_de_alcance, fronteira, marcador_sem_valor, palavra_proibida, prova_nao_sustenta |
| **J07-1** | sim | 9 | fronteira, marcador_sem_valor, n_errado, numero_errado, outro, prova_nao_sustenta |
| **J07-2** | sim | 5 | excesso_de_alcance, n_errado, numero_errado, prova_nao_sustenta |
| **J07-3** | sim | 8 | confianca_alta_demais, excesso_de_alcance, n_errado, numero_errado, porta_temporal, prova_nao_sustenta |
| **T01-1** | sim | 6 | confianca_alta_demais, marcador_sem_valor, n_errado, numero_errado, prova_nao_sustenta |
| **T01-2** | sim | 4 | excesso_de_alcance, numero_errado, outro, prova_nao_sustenta |
| **T01-3** | sim | 4 | excesso_de_alcance, n_errado, outro, prova_nao_sustenta |
| **T02-1** | sim | 7 | confianca_alta_demais, excesso_de_alcance, marcador_sem_valor, numero_errado, outro, prova_nao_sustenta |
| **T02-2** | sim | 6 | confianca_alta_demais, excesso_de_alcance, n_errado, numero_errado, prova_nao_sustenta |
| **T02-3** | sim | 6 | confianca_alta_demais, excesso_de_alcance, n_errado, numero_errado, prova_nao_sustenta |
| **T03-1** | sim | 12 | confianca_alta_demais, excesso_de_alcance, n_errado, numero_errado, outro, palavra_proibida, poder_nao_calculado, prova_nao_sustenta |
| **T03-2** | sim | 9 | efeito_do_placar, excesso_de_alcance, n_errado, outro, palavra_proibida, poder_nao_calculado, prova_nao_sustenta |
| **T04-1** | sim | 7 | confianca_alta_demais, consequencia_como_caracteristica, excesso_de_alcance, n_errado, palavra_proibida, prova_nao_sustenta |
| **T04-2** | sim | 6 | confianca_alta_demais, marcador_sem_valor, outro, poder_nao_calculado |

## O detalhe

### A01-1  (3 confirmados)

- **excesso_de_alcance** (2/3) em `para_o_santa_cruz` — "O alvo é um número, não um intervalo" é exatamente o que quatro observações não sustentam — é a promessa mais forte da conclusão e a menos amparada.
  - **correção:** "O alvo é uma faixa estreita: entre 60 e 66 pontos, com 62–63 no meio." Montar o elenco contra 63 sem folga é planejar para o meio de uma distribuição como se fosse o teto dela.
- **prova_nao_sustenta** (3/3) em `prova` — A tabela "A régua, ano a ano" do A01.md, citada como prova desta conclusão, tem 11 de 32 células que não batem com o SB_TABELAS nem com a reconstrução — foram digitadas à mão, o que a regra 4 proíbe.
  - **correção:** Gerar a tabela do A01.md a partir de A01_regua.csv, como os demais números, em vez de digitá-la.
- **numero_errado** (2/3) em `prova` — corte_z4_mediana no bloco numeros de A01.json está errado em relação ao arquivo que o gerou.
  - **correção:** 39,5.

### A01-2  (5 confirmados)

- **prova_nao_sustenta** (3/3) em `o_que_vimos` — A terceira frase diz que o acesso de 2024 saiu no saldo de gols, e a base do proprio estudo mostra que o empate se desfez nas vitorias, antes de chegar ao saldo.
  - **correção:** Trocar por 'e o acesso saiu na contagem de vitorias' com os valores por marcador ({v_4o_2024}=19 e {v_5o_2024}=18), ou cortar a frase. O mesmo erro esta em A01.md:25, onde o '18 contra 12' reforca a atribuicao errada com os saldos certos.
- **numero_errado** (3/3) em `prova` — A tabela 'A regua, ano a ano' de A01.md, citada no campo prova, tem 11 das 32 celulas divergentes do A01_regua.csv e do SB_TABELAS.
  - **correção:** Regerar a tabela de A01.md a partir de A01_regua.csv. A substancia do A01-2 nao muda, mas a prova que ele cita esta com numero errado em um terco das celulas, e A01-1 e A01-3 dependem justamente das colunas erradas.
- **outro** (2/3) em `para_o_santa_cruz` — O uso pratico manda o criterio de contratacao valer para bola parada e fim de jogo -- uma das tres alavancas e desmentida por uma conclusao firme do proprio estudo, e a outra nao tem dado em base nenhuma.
  - **correção:** Tirar bola parada e fim de jogo, ou apontar para o que o Bloco A de fato encontrou (qualidade da chance criada e cedida, distancia da finalizacao, duelo defensivo, estabilidade do onze). A margem apertada justifica cuidar de detalhes; nao justifica nomear estes detalhes.
- **outro** (2/3) em `o_que_vimos` — O numero 64 esta digitado a mao dentro do texto, sem marcador, contra a regra de que todo numero vem por marcador e o valor mora em 'numeros'.
  - **correção:** Criar {pontos_4o_2024} em 'numeros' e usar o marcador, como a regra manda.
- **outro** (3/3) em `o_que_vimos` — A primeira frase sai quebrada na tela: o marcador {margens} guarda uma lista com rotulos, e entra no meio de uma frase que pedia so os valores.
  - **correção:** Guardar em 'numeros' uma segunda chave ja no formato da frase (ex.: {margens_frase} = '4 (2022), 1 (2023), 0 (2024) e 1 (2025)'), ou quatro marcadores separados.

### A01-3  (4 confirmados)

- **excesso_de_alcance** (3/3) em `para_o_santa_cruz` — A frase afirma equivalência entre Trave e Sobe ("não é um time diferente de quem subiu") — um "não separa" que a contagem de pontos não mede, que A01 não testa e para o qual o poder nunca foi calculado.
  - **correção:** Dizer só o que a contagem sustenta: "9 das 16 equipes da Trave fecharam a 3 pontos ou menos do G4, e na mediana a 2,5 — perto o bastante para o acaso pesar, e por isso toda comparação roda com e sem esses times." Se a Trave tem ou não característica diferente é pergunta de A02/A03/A06, cujo desenho só pega d ≥ 1,02.
- **numero_errado** (3/3) em `o_que_vimos` — "mediana {trave_mediana} — a {trave_dist_mediana} do G4" rende "mediana 60 — a -2 do G4": o -2 está errado nas duas leituras possíveis e contradiz os próprios números do arquivo.
  - **correção:** "mediana 60,5 — a 2,5 pontos do corte do G4" (ou "3 pontos abaixo dos 63 do 4º"). Nunca 2, e sem o sinal cru: escrever "a X pontos do G4", não "a -X do G4".
- **prova_nao_sustenta** (3/3) em `prova` — A prova citada ("A01.md, seção Prova") traz a tabela "A régua, ano a ano" com 11 das 32 células divergindo do SB_TABELAS — inclusive a coluna do 8º inteira, que é justamente o piso da Trave afirmado na conclusão.
  - **correção:** Reescrever a tabela a partir de A01_regua.csv (que está certa) ou citar A01_regua.csv como prova. Quem for conferir a Trave pelo 8º hoje encontra 58/59/60 e não fecha com "entre 56 e 64, mediana 60,5".
- **numero_errado** (3/3) em `para_o_santa_cruz` — Números digitados à mão onde a regra manda marcador — e os seis valores da Trave/Sobe em "numeros" não saem de script nenhum, o que é como 60,5 virou 60 e -2,5 virou -2.
  - **correção:** Trocar "dois pontos a menos" por {trave_dist_mediana} com o valor certo (2,5) e {sobe_fronteira} de {sobe_de} na manchete; e fazer A01.py calcular e gravar os seis valores em A01_resumo.json, como já faz com corte_g4 e fronteira.

### A02-1  (6 confirmados)

- **fronteira** (3/3) em `o_que_vimos` — A frase apresenta como "o que separa" tres medidas que so separam no corte sem os times de fronteira, sem dizer que dependem do corte — e cita os numeros do corte enviesado.
  - **correção:** Tirar toques na area, entradas na area e xG sofrido total da frase "o que separa", ou dizer na propria frase que so aparecem quando se tiram os times perto da linha. Sobrevivem aos dois cortes apenas a distancia da finalizacao e o xG por finalizacao sofrida; e, se a frase ficar, os numeros tem de ser os do corte com fronteira.
- **excesso_de_alcance** (2/3) em `manchete` — "Finaliza e sofre de outro lugar" afirma posicao dos dois lados, mas do lado defensivo nenhum indicador mede lugar: o que foi medido e xG por finalizacao sofrida, que e qualidade da chance, nao distancia.
  - **correção:** Trocar a metade defensiva por aquilo que foi medido: "cede chance de qualidade pior" / "a finalizacao que o adversario tem vale menos". Se a leitura de lugar for para ficar, ela tem de entrar na lista pre-declarada e ser testada — a base permite, e hoje ela nao passa.
- **efeito_do_placar** (3/3) em `o_que_vimos` — A conclusao apoia-se em xG sofrido e em volume de jogo dentro da area sem a marca "pode ser efeito do placar", que a propria lista pre-declarada da parte tornou obrigatoria.
  - **correção:** Acrescentar "pode ser efeito do placar" ao o_que_vimos (ou ao confianca_motivo) de A02-1, dizendo que quem lidera mais tempo cede menos xG, e que o recorte por estado do jogo nao existe em base nenhuma.
- **poder_nao_calculado** (3/3) em `manchete` — "Nao finaliza mais nem sofre menos finalizacao" e dito como fato justamente no corte que menos enxerga: o desenho so detecta d >= 1,14 e as diferencas observadas sao d 0,66 e 0,63.
  - **correção:** Dizer "nao da para ver diferenca de volume com este numero de times" e citar o d minimo no confianca_motivo; ou apoiar a negativa no corte com fronteira (16x48, d minimo 0,82), onde finalizacoes fica em d 0,24 (q 0,42) e finalizacoes sofridas em d 0,25 (q 0,43) — la a negativa e muito mais defensavel.
- **n_errado** (3/3) em `n` — O n declara "sem a fronteira" mas usa o tamanho do Meio COM a fronteira: le-se "8 promovidos contra 48 do meio, sem a fronteira", e o teste rodou com 32.
  - **correção:** n: "{n_sobe_sf} promovidos contra {n_meio_sf} do meio, sem a fronteira", com n_meio_sf = 32 acrescentado a `numeros` (e meio_sem_fronteira ao bloco n de A02_resumo.json). O mesmo erro esta no n de A02-2.
- **numero_errado** (3/3) em `o_que_vimos` — Os numeros chegam a tela com ponto decimal e tres casas — "13.026 vezes por jogo", "23.618 entradas na area" —, que em portugues se leem como treze mil e vinte e tres mil.
  - **correção:** Guardar em `numeros` o float ja arredondado (13.0, 12.2, 19.7, 20.5, 15.7, 13.7, 23.6, 21.5, 11.3, 12.1, 1.0, 1.19) para o gerador formatar com virgula. Atinge tambem A03, A06, A07 e A11, que guardam string do mesmo jeito.

### A02-2  (7 confirmados)

- **fronteira** (3/3) em `manchete` — A manchete se inverte no corte COM fronteira: lá o maior efeito que separa não é defensivo, é de ataque — a conclusão só existe no corte sem fronteira, que o método da casa declara enviesado.
  - **correção:** Cair para indício e reescrever: nos dois cortes o que sobrevive é um indicador de cada lado (distância da finalização e qualidade da chance cedida), e qual dos dois é maior depende do corte. Se a frase 'o lado que mais separa é o defensivo' for mantida, ela tem de dizer que vale só sem os times de fronteira.
- **prova_nao_sustenta** (3/3) em `confianca` — O confianca_motivo afirma que o indicador defensivo que sobrevive aos dois cortes 'é maior que qualquer indicador de ataque que sobreviva aos dois' — isso é falso num dos dois cortes, e a frase usa números dos dois cortes misturados.
  - **correção:** Dizer os dois pares: sem fronteira 1,30 (defesa) contra 1,08 (ataque); com fronteira 0,81 (defesa) contra 1,20 (ataque) — e concluir que a comparação não é robusta ao corte.
- **n_errado** (3/3) em `n` — O n declarado ('8 contra 48') não corresponde a nenhum teste rodado: o corte sem fronteira que produziu todos os d citados usou 8 contra 32.
  - **correção:** n = '8 contra 32, sem os times de fronteira' — e criar o marcador que falta (n_meio_sf = 32) em 'numeros', já que nenhum marcador existente vale 32.
- **palavra_proibida** (3/3) em `o_que_vimos` — O 'o que vimos' é inteiro feito de d de Cohen: usa a palavra proibida 'd' quatro vezes e não traz um único número em unidade de jogo.
  - **correção:** Reescrever em unidade de jogo, por exemplo: 'quem sobe cede 1,00 de xG por jogo contra 1,19 do meio, e a chance que cede é pior: 0,086 de xG por finalização contra 0,100'. Os d ficam só na prova e no confianca_motivo.
- **poder_nao_calculado** (3/3) em `para_o_santa_cruz` — 'Não aumentar a que se cria' transforma um não-detectado em não-existe: o xG criado tem d abaixo do d mínimo detectável do desenho, e a conclusão não diz isso.
  - **correção:** O 'para o Santa Cruz' não pode dizer 'não aumentar a que se cria'. Trocar por 'reduzir a qualidade da chance cedida é a alavanca que este estudo consegue medir; sobre criar, com 8 contra 32 o teste só pegaria uma diferença muito grande e não dá para concluir'.
- **efeito_do_placar** (3/3) em `o_que_vimos` — A conclusão é construída sobre xG sofrido e xG por finalização sofrida e não traz a marca 'pode ser efeito do placar', que a própria parte declarou obrigatória antes de rodar.
  - **correção:** Acrescentar a marca 'pode ser efeito do placar' — um time que vence recua e passa a ceder finalização de fora, o que empurra na mesma direção o xG sofrido e o xG por finalização sofrida.
- **prova_nao_sustenta** (2/3) em `o_que_vimos` — 'Os dois maiores efeitos de toda a lista são defensivos' é falso: o maior efeito da lista é de ataque (gols por jogo).
  - **correção:** 'Dos indicadores que não são o placar redescrito, os dois maiores são defensivos' — dizendo qual exclusão foi feita.

### A02-3  (6 confirmados)

- **poder_nao_calculado** (3/3) em `confianca` — Conclusão negativa ("não se repetem") selada como firme sem nenhum poder calculado para a porta temporal — é exatamente o caso em que "não se repete" vira "não existe" indevidamente.
  - **correção:** confianca: "indício", com a frase dizendo que o teste não tem poder — o menor sinal que ele pegaria é maior que o sinal encontrado.
- **prova_nao_sustenta** (3/3) em `o_que_vimos` — A frase lê repetição em réguas mais curtas que o próprio efeito lido, e não traz a ressalva de régua curta que a A02-2 traz — embora esta conclusão seja inteiramente feita de xG.
  - **correção:** Marcar a régua curta e trocar o sentido: a sobra de gols sobre o xG medida em meia temporada é quase toda ruído (teto 0,07), então o estudo não sabe se ela se repete — não que ela não se repita.
- **fronteira** (3/3) em `o_que_vimos` — Os números da frase são os do corte SEM fronteira — o corte que o próprio estudo documentou como enviesado e mandou não usar como manchete — e a troca de corte inverte o sinal do número do promovido.
  - **correção:** Usar o corte com fronteira (+0,053 contra -0,169, 16 contra 48) e dizer que o achado sobrevive aos dois cortes.
- **n_errado** (2/3) em `n` — O n declarado não é o n de metade dos números da frase.
  - **correção:** Declarar os dois: "8 contra 32 no corte sem fronteira (16 contra 48 com); 80 clube-temporadas na repetição".
- **palavra_proibida** (3/3) em `o_que_vimos` — Seis termos proibidos e três números em unidade proibida no "o que vimos".
  - **correção:** Reescrever em unidade de jogo, por exemplo "na 2ª metade do ano a sobra do time quase não tem relação com a da 1ª metade", e deixar rho, IC, p e d só na prova.
- **efeito_do_placar** (3/3) em `para_o_santa_cruz` — Recomenda comprar chance criada e chance cedida sem a marca "pode ser efeito do placar" que o próprio A02.md diz que todas as conclusões da parte levam.
  - **correção:** Acrescentar "pode ser efeito do placar" à conclusão.

### A03-1  (10 confirmados)

- **confianca_alta_demais** (3/3) em `confianca` — Conclusao negativa selada como "firme" sem nenhum dos dois criterios exigidos: nenhum teste tem poder suficiente e a porta temporal nao rodou.
  - **correção:** Rebaixar para "indicio" (ou "provavel" se a porta temporal for rodada e passar) e dizer no motivo que nenhum dos 24 testes tinha poder para ver o efeito procurado.
- **poder_nao_calculado** (2/3) em `manchete` — "Nao separa" virou "nao existe": a manchete afirma ausencia de efeito onde o desenho so enxergaria efeitos enormes, e a frase fixa que a especificacao manda nao aparece.
  - **correção:** "Nenhum dos testes conseguiu ver diferenca de dependencia de casa entre as faixas - e este desenho so enxergaria diferenca grande", com o d minimo dito na prova.
- **excesso_de_alcance** (3/3) em `manchete` — A manchete fala de TIME (unidade individual) enquanto o teste compara medias de FAIXA; no nivel do clube-temporada a dependencia de casa varia muito.
  - **correção:** Falar do que foi testado: "a dependencia de casa nao separa quem sobe de quem fica no meio" - nunca "nenhum time".
- **porta_temporal** (3/3) em `confianca` — A porta temporal foi pre-declarada nesta parte e nunca foi calculada, mas a conclusao e selada como firme mesmo assim.
  - **correção:** Rodar a porta temporal declarada, ou retirar "firme" e registrar em aberto que ela nao rodou.
- **consequencia_como_caracteristica** (3/3) em `o_que_vimos` — Todos os numeros citados para sustentar uma afirmacao sobre caracteristica vem de dif_pj/pontos por mando, que a propria parte declara como placar redescrito e desqualifica para isso.
  - **correção:** Citar dif_xg, dif_xgc e dif_dd como prova da ausencia e deixar os pontos por mando apenas como descricao do tamanho da vantagem da liga.
- **excesso_de_alcance** (3/3) em `para_o_santa_cruz` — "Quem sobe e melhor em casa E fora, na mesma proporcao que todo mundo" afirma igualdade que os proprios numeros da parte contradizem.
  - **correção:** "Nao da para escolher elenco por 'forte fora': a diferenca de mando entre as faixas nao apareceu no teste" - sem afirmar proporcao igual.
- **palavra_proibida** (3/3) em `o_que_vimos` — A palavra proibida "p" aparece no o que vimos, e com ela dois numeros em unidade de p em vez de unidade de jogo.
  - **correção:** Tirar a frase inteira do o que vimos e mandar os dois p para a prova; no lugar, dizer em unidade de jogo (ex.: "a diferenca casa-fora e de 0,9 ponto por jogo em qualquer faixa").
- **prova_nao_sustenta** (3/3) em `confianca` — O motivo apoia o selo firme em "Mann-Whitney no bruto", teste que nenhum script calcula, que nao esta na prova citada e que a casa proibe.
  - **correção:** Ou tirar o Mann-Whitney do motivo, ou calcula-lo no script, grava-lo em A03_testes.csv e rodar no posto - e, de todo modo, nao usar teste no bruto como sustentacao.
- **prova_nao_sustenta** (2/3) em `confianca` — A ressalva atribui ao corte sem fronteira uma inversao da ordem que ja existe no corte com fronteira.
  - **correção:** "A ordem entre as faixas depende de usar mediana ou media, nos dois cortes" - a fragilidade e da estatistica escolhida, nao do filtro de fronteira.
- **efeito_do_placar** (2/3) em `o_que_vimos` — A conclusao e uma leitura de mando e nao traz a marca "pode ser efeito do placar" que a propria parte declarou obrigatoria.
  - **correção:** Acrescentar a marca: sem recorte por estado do jogo, parte da simetria observada pode vir de quem passa mais tempo a frente em casa e atras fora.

### A03-2  (7 confirmados)

- **excesso_de_alcance** (3/3) em `manchete` — A manchete diz que a vantagem defensiva aparece IGUAL dentro e fora, mas no corte principal a vantagem em xG sofrido e tres vezes maior em casa do que fora, e fora ela nem passa no criterio.
  - **correção:** Trocar 'aparece igual dentro e fora de casa' por algo como 'quem sobe ganha mais dividida dentro e fora, mas so cede chance pior em casa' — o 'igual' tem de sair.
- **poder_nao_calculado** (2/3) em `manchete` — 'Igual dentro e fora' e uma afirmacao de ausencia de diferenca entre mandos; o teste direto disso e a familia assimetria, que nao passa e esta sem poder — o desenho nao enxerga diferenca de mando abaixo de d 0,82.
  - **correção:** Ou a frase deixa de afirmar igualdade, ou a confianca cai e o texto passa a dizer que a diferenca entre mandos nao foi detectada com um desenho que so detecta d a partir de 0,82.
- **porta_temporal** (3/3) em `confianca` — Declarada 'firme' sem porta temporal: o script de A03 nao roda nenhuma, e o confianca_motivo cita so os dois cortes de fronteira, que sao teste de robustez e nao a porta.
  - **correção:** Confianca 'provavel' (passou so no BH, nos dois cortes), ou rodar a porta temporal por mando antes de manter 'firme'.
- **efeito_do_placar** (3/3) em `confianca` — A ressalva de placar que a propria parte declarou antes de rodar nao aparece em nenhum campo da conclusao — e o 'para o Santa Cruz' afirma justamente o contrario dela.
  - **correção:** Acrescentar 'pode ser efeito do placar' a conclusao e retirar do para_o_santa_cruz a negativa causal 'nao sao efeito de jogar em casa', que e exatamente o que o dado nao pode separar.
- **palavra_proibida** (3/3) em `o_que_vimos` — A letra 'd' aparece no que vimos, e os quatro numeros do duelo defensivo estao em d de Cohen em vez de unidade de jogo.
  - **correção:** 'ganha 60,9% das divididas defensivas em casa contra 60,1% do meio, e 60,6% contra 59,6% fora' — e tirar a letra d.
- **fronteira** (3/3) em `o_que_vimos` — O par de xG sofrido em casa citado no texto e o do corte SEM fronteira (8x32), sem dizer, enquanto o n abre com 16 contra 48; no corte principal os numeros sao outros.
  - **correção:** Usar 0,798 contra 1,024 (corte principal, 16x48) ou dizer de que corte vem o par, como o texto faz com o duelo.
- **outro** (3/3) em `o_que_vimos` — Uma das tres pernas e xG, que tem confiabilidade 0,30 — abaixo do piso de 0,40 que manda ressalvar — e o numero e apresentado com tres casas decimais e sem ressalva nenhuma.
  - **correção:** Marcar o xG como hachurado/ressalvado na conclusao e arredondar para duas casas com virgula (0,74 contra 1,03).

### A03-3  (5 confirmados)

- **efeito_do_placar** (2/3) em `o_que_vimos` — A conclusao nao vem marcada como 'pode ser efeito do placar', embora a propria parte tenha declarado ANTES de rodar que a leitura de mando sairia marcada assim.
  - **correção:** Acrescentar a marca no o_que_vimos ou no para_o_santa_cruz: 'pode ser efeito do placar — time que cai passa mais tempo perdendo fora, e xG sofrido sobe quando se esta atras'.
- **fronteira** (3/3) em `o_que_vimos` — Os numeros brutos citados sao do corte SEM os times de fronteira (12 x 32) mas aparecem como se fossem o valor geral; so os d vem rotulados por corte. E o erro que o _metodo_fronteira.md registrou como o mais caro do estudo.
  - **correção:** Citar o bruto do corte com fronteira (1,26 x 1,39 e 1,56 x 1,36) e usar o corte sem fronteira so como teste de robustez, dizendo que o achado se repete la.
- **n_errado** (3/3) em `n` — O n declarado (12 contra 32) e so o do corte sem fronteira, mas a conclusao se apoia nos DOIS cortes; o teste principal usou 16 do Cai contra 48 do Meio.
  - **correção:** n = '16 contra 48, e 12 contra 32 sem os times de fronteira' — com marcadores novos para o 16 e o 48, que hoje nem existem no campo numeros.
- **palavra_proibida** (3/3) em `o_que_vimos` — O 'o que vimos' usa quatro vezes a letra d (d de Cohen) e traz quatro numeros em unidade de d, duas proibicoes da secao Didatica na mesma frase.
  - **correção:** Tirar os quatro d do texto e deixar so unidade de jogo, com os d indo para o confianca_motivo/prova: 'Em casa, quem cai cria 1,26 de xG por jogo contra 1,39 do meio. Fora, sofre 1,56 contra 1,36. Os dois valem com e sem os times de fronteira.'
- **prova_nao_sustenta** (3/3) em `prova` — A prova por extenso fecha a tabela Cai x Meio afirmando sem ressalva exatamente a assimetria que o confianca_motivo diz nao se sustentar.
  - **correção:** Trocar por: 'As duas celulas que passam sao casa-criar e fora-ceder, mas as outras duas apontam na mesma direcao e os testes diretos de assimetria nao passam: o cruzamento e o padrao de quais testes cruzaram a linha, nao um achado.'

### A04-1  (2 confirmados)

- **fronteira** (2/3) em `o_que_vimos` — A perna Sobe x Trave da conclusao e zerada por um corte que o proprio metodo da casa declara enviesado E incapaz; em A02 esse mesmo desenho foi declarado "sem resposta", e em A06 valeu no maximo "provavel".
  - **correção:** Retirar {st_firmes_dois} da frase e declarar Sobe x Trave "sem resposta" nesta parte, como foi feito em A02 — a conclusao passa a falar so de Sobe x Meio.
- **outro** (2/3) em `o_que_vimos` — A frase promete enumerar os {n_ind} = 13 indicadores declarados, mas lista no maximo 12: falta "bolas paradas por jogo", o indicador de volume da familia processo.
  - **correção:** Acrescentar "bolas paradas por jogo" a enumeracao, ou trocar a lista por "os 13 indicadores declarados em A04_indicadores.json".

### A04-2  (5 confirmados)

- **confianca_alta_demais** (2/3) em `confianca` — Selo "firme" numa conclusão que não passa em nenhum dos dois critérios da regra da casa — nem BH por família, nem porta temporal — e cujo próprio motivo admite isso ao dizer "Descrição, não teste".
  - **correção:** Rebaixar para "indício" (não passa em nenhum dos dois) e dizer na própria frase por quê, como manda a seção Didática. Se o dono quiser manter um selo de contagem, ele tem de ser um rótulo próprio e visível na tela, não a mesma palavra usada por A06-1 e A06-3, que passaram no critério.
- **poder_nao_calculado** (3/3) em `manchete` — "essa fatia é igual para todos" é um "não separa", e o poder do desenho foi calculado e deu INSUFICIENTE — nem o número nem a frase fixa da §6.7 aparecem na conclusão.
  - **correção:** Trocar "é igual para todos" por algo como "e não achamos diferença entre as faixas", com a ressalva do §6.7 no o_que_vimos: este desenho só enxergaria uma diferença muito grande (d 0,82 com fronteira, 1,14 sem). Sem isso, "não conseguimos ver" virou "não existe".
- **excesso_de_alcance** (2/3) em `manchete` — "igual para todos" só vale para a mediana de quatro faixas; entre clubes, que é a unidade que o Santa Cruz é, a fatia varia de 16% a 61%.
  - **correção:** "a fatia não muda de uma faixa para outra" — que é o que o quadro mostra — e não "é igual para todos". Ou acrescentar a dispersão ao o_que_vimos: metade dos clubes fica entre 27% e 40%.
- **prova_nao_sustenta** (3/3) em `para_o_santa_cruz` — "o escanteio sozinho vale mais que a falta e o pênalti" é falso na leitura que a palavra "sozinho" convida (escanteio contra os dois somados): 438 contra 606.
  - **correção:** Repor a forma do md: "vale mais que a falta e que o pênalti", cada um de per si — ou, melhor, usar os totais em vez das medianas, que não somam.
- **n_errado** (2/3) em `o_que_vimos` — As quatro faixas são listadas como se repartissem a liga, mas a Trave (5º-8º) está DENTRO do Meio (5º-16º): 16+16+48+16 = 96 linhas para um n declarado de 80, e o número do meio já contém o da trave.
  - **correção:** Dizer o n de cada grupo na frase (16 que sobem, 16 da trave, 48 do meio, 16 que caem) e avisar que a trave é um recorte de dentro do meio — ou tirar a trave da enumeração, já que ela não é uma quarta faixa.

### A04-3  (8 confirmados)

- **consequencia_como_caracteristica** (3/3) em `manchete` — O "dos dois lados" é o saldo de gols do time redescrito como bola parada: os indicadores que isolariam a bola parada (a fatia dos gols) não separam nada.
  - **correção:** A manchete tem de cair para o que sobra de característica, só o jogo aéreo: algo como "Quem cai ganha menos duelo aéreo". A parte de gols vira descrição no quadro por faixa, com a ressalva de que a fatia dos gols vinda de bola parada é a mesma em todas as faixas.
- **fronteira** (3/3) em `o_que_vimos` — Todos os números do texto vêm do corte SEM fronteira — o corte que o _metodo_fronteira.md manda nunca reportar como manchete —, e ele infla a diferença.
  - **correção:** Reportar os valores da base inteira, que é o corte não enviesado: 0,276 contra 0,342 de gol pró; 0,447 contra 0,355 de sofrido; saldo -0,132 contra 0,000; duelo aéreo 44,3% contra 46,1%. O corte sem fronteira fica na prova, como teste de robustez.
- **n_errado** (2/3) em `n` — O n declarado não é o das linhas que produziram os números do texto.
  - **correção:** Ou os números passam a ser os do corte com fronteira (e o n 16 × 48 fica correto), ou o n tem de dizer 12 rebaixados contra 32 do meio. Como os números devem vir da base inteira, o certo é o primeiro.
- **palavra_proibida** (3/3) em `o_que_vimos` — O que vimos usa "d" quatro vezes e "q" uma, e mostra os valores de d e de q como números do texto — as duas coisas proibidas pela regra de linguagem.
  - **correção:** Tirar os seis trechos entre parênteses do o_que_vimos. d e q só na prova e no confianca_motivo; no texto ficam apenas os valores por jogo e a % de duelo aéreo.
- **prova_nao_sustenta** (3/3) em `para_o_santa_cruz` — "Bola parada é seguro contra o rebaixamento" não tem nenhuma evidência de processo: nenhum indicador de trabalho de bola parada separa quem cai.
  - **correção:** Trocar por algo do tipo: "treinar bola parada não aparece como proteção contra a queda — quem cai bate o mesmo tanto de bola parada e cobra os mesmos escanteios que o meio; o que separa é ganhar o duelo aéreo". A frase atual promete um uso que o dado não sustenta.
- **marcador_sem_valor** (3/3) em `n` — Os números do campo n foram digitados à mão, sem marcador e sem valor em "numeros".
  - **correção:** Criar n_cai e n_meio em "numeros" (16 e 48 pelo corte com fronteira) e escrever "{n_cai} rebaixados contra {n_meio} do meio"; o mesmo para a contagem de indicadores que passam.
- **numero_errado** (3/3) em `prova` — A prova por extenso e o JSON dão números diferentes para a mesma frase.
  - **correção:** Alinhar md e JSON no corte com fronteira: 0,28 contra 0,34 de gol pró, 0,45 contra 0,36 de sofrido, saldo −0,13 contra 0,00, duelo aéreo 44,3% contra 46,1%.
- **porta_temporal** (2/3) em `confianca` — O confianca_motivo não mostra os dois critérios da régua: não cita a correção para múltiplos testes nem a porta temporal, e justifica o "provável" por outro motivo.
  - **correção:** Reescrever o motivo mostrando os dois: passa na correção para múltiplos testes nos dois cortes de fronteira, mas a base de bola parada é agregada por trabalho e não tem jogo a jogo, então não há porta temporal — por isso provável. O argumento do placar entra depois, como segunda ressalva.

### A05-1  (6 confirmados)

- **poder_nao_calculado** (3/3) em `confianca` — Conclusao negativa selada como "firme" quando NENHUM dos testes tinha poder para detectar o que ela declara ausente: o menor efeito detectavel do desenho e maior que qualquer efeito observado.
  - **correção:** A regra 9 da casa existe exatamente para este caso. Com zero testes bem alimentados, o selo maximo e "indicio", e a frase tem de dizer que o desenho so enxerga efeito grande: com 16 promovidos contra 48 do meio nada abaixo de d 0,82 seria detectado, e no corte sem fronteira (8 contra 32) nada abaixo de 1,14.
- **prova_nao_sustenta** (3/3) em `o_que_vimos` — A frase "e nenhum sobrevive" e falsa contra o proprio arquivo de prova: um teste passa na correcao para multiplos testes, e e justamente posse — o eixo que a manchete nega.
  - **correção:** Trocar "nenhum sobrevive" por nomear o resultado: posse separa Sobe do Meio no corte sem os times de fronteira (mediana 51,7% contra 50,2%) e fica no limite no corte com eles (51,4% contra 49,8%), o que pela regra da fronteira vale como indicio que depende do corte — nunca como ausencia.
- **excesso_de_alcance** (3/3) em `manchete` — "Nao existe estilo com bola que separe quem sobe" afirma ausencia onde o teste so mostra que nenhum indicador sozinho passou no corte — enquanto os 10 indicadores apontam todos para o mesmo lado, e ordenam as tres faixas.
  - **correção:** A manchete tem de cair ou mudar de sentido: o que o dado sustenta e "nenhum indicador de estilo com bola separa sozinho quem sobe, e a amostra so enxergaria diferenca grande" — nao "nao existe estilo que separe". Se a direcao comum aos 10 for para ficar de fora da conclusao, ela tem de aparecer no que ficou em aberto.
- **numero_errado** (2/3) em `o_que_vimos` — O marcador {n_testes} vale 30, mas o texto que o usa diz explicitamente que ele cobre os dois cortes de fronteira — e com os dois cortes sao 60 testes.
  - **correção:** n_testes = 60, ou reescrever a frase para "30 pares de indicador e comparacao, cada um rodado nos dois cortes". Do jeito que esta, o numero e a frase se contradizem no mesmo periodo.
- **efeito_do_placar** (2/3) em `o_que_vimos` — A ressalva de placar que a propria parte declarou obrigatoria para TODA conclusao nao aparece na conclusao — e a lista de indicadores afetados nunca foi preenchida, entao nenhum indicador saiu marcado.
  - **correção:** O argumento de afastamento esta pela metade e o proprio em_aberto o contradiz ("poderia estar escondendo uma diferenca real"). Time que vence mais cede bola: o efeito do placar empurra a posse dos promovidos para BAIXO, ou seja, atenua justamente a diferenca que a conclusao declara inexistente. A marca "pode ser efeito do placar" tem de estar na conclusao, nao so no motivo.
- **prova_nao_sustenta** (3/3) em `prova` — Metade da prova citada nao existe no disco.
  - **correção:** Escrever A05.md com a prova por extenso, ou tirar a citacao. Enquanto nao existir, a camada "para quem quer conferir" da conclusao esta vazia — o que agrava tudo acima, porque o leitor nao tem onde ver que um teste deu firme.

### A05-2  (9 confirmados)

- **prova_nao_sustenta** (2/3) em `para_o_santa_cruz` — A frase "O estilo e escolha livre do clube, nao requisito de acesso" e contradita por quatro medicoes independentes que apontam a posse para cima entre os promovidos, uma delas da propria tabela da parte.
  - **correção:** A frase tem de mudar de sentido: "nenhum traco de estilo separa quem sobe, com uma excecao — a posse, que aparece firme so no corte sem fronteira e por isso vale como indicio". O estudo pode dizer que estilo nao e requisito PROVADO; nao pode dizer que e escolha livre, e muito menos no nivel firme.
- **confianca_alta_demais** (3/3) em `confianca (confianca_motivo)` — "firme" sem nenhum dos dois criterios: o confianca_motivo nao traz q de BH por familia nem porta temporal — traz uma comparacao de amplitudes.
  - **correção:** Rebaixar para "indicio", dizendo por que: nenhum teste passou na correcao por familia nos dois cortes e a parte nao rodou a porta temporal.
- **poder_nao_calculado** (2/3) em `para_o_santa_cruz` — A afirmacao de ausencia ("nao e requisito") e feita sem invocar o poder, e o poder que existe nao a autoriza: o desenho so enxerga efeito grande.
  - **correção:** A frase de ausencia tem de carregar o d minimo em linguagem de jogo ("com 16 times que subiram, so uma diferenca grande apareceria; a que existe na posse e media e ficou abaixo do que este numero de times permite ver") e nao pode ser firme.
- **efeito_do_placar** (3/3) em `confianca (confianca_motivo)` — A conclusao e inteira sobre posse e volume de passes e nao traz a marca "pode ser efeito do placar" que a propria declaracao da parte manda por em toda conclusao.
  - **correção:** Acrescentar "pode ser efeito do placar" ao texto de A05-2. O argumento de A05-1 (o vies nao cria uma ausencia) nao vale aqui: A05-2 afirma a dispersao, nao a ausencia.
- **numero_errado** (2/3) em `o_que_vimos` — {topo_posse}=8 nao e o terco de cima: com o terco de 20 times sao 10. E o "so" antes do numero inverte o sentido — 10 (ou mesmo 8) esta acima do acaso, nao abaixo.
  - **correção:** {topo_posse} = 10, e a frase perde o "so": "10 dos 16 promovidos estao no terco de cima de posse do proprio ano e 3 no de baixo" — o que ja nao sustenta a manchete.
- **prova_nao_sustenta** (2/3) em `confianca (confianca_motivo)` — A prova da confianca compara a amplitude de 16 linhas com a de 48 linhas; amplitude cresce com o n, e a igualdade depende de um unico clube-temporada.
  - **correção:** Trocar amplitude por desvio-padrao ou IQR e dizer o que eles mostram: pelo IQR o meio e mais variado em posse do que quem sobe, o que enfraquece "estilo nao e o eixo" em vez de sustenta-lo.
- **palavra_proibida** (3/3) em `o_que_vimos` — Seis numeros em percentil na camada de 2 minutos, que a regra da linguagem proibe expressamente.
  - **correção:** Reescrever em unidade de jogo, com os valores brutos da base: Coritiba com 52,3% de posse e 84,8% de passe certo; Chapecoense com 47,4% de posse e 14,1% dos passes longos.
- **outro** (2/3) em `o_que_vimos e n` — Oito numeros digitados a mao, fora do sistema de marcadores (regra 4).
  - **correção:** Criar marcadores com valor em numeros ({n_promovidos}=16 e um por valor de clube). Os oito valores conferidos batem com a base — o defeito e de forma, nao de conta.
- **outro** (3/3) em `o_que_vimos` — O numero de contra-ataques entra sem ressalva, mas a confiabilidade medida do indicador e 0,36, abaixo do corte de 0,40 — e a declaracao da parte afirma o contrario.
  - **correção:** Hachurar/ressalvar o numero de contra-ataque, ou trocar o exemplo por um indicador acima do corte (passe longo, 0,70), e corrigir a ressalva da A05_indicadores.json para cobrir os 10 indicadores.

### A06-1  (8 confirmados)

- **porta_temporal** (3/3) em `confianca` — O selo firme e o argumento central do confianca_motivo dependem de uma "porta temporal" que nao e a porta temporal da casa: A06 mede a auto-repeticao do indicador entre as duas metades da temporada, e nao o 1o turno prevendo o resultado do 2o. Pela definicao da especificacao, nem o duelo defensivo nem os tres indicadores de pressao passam.
  - **correção:** A confianca cai para "provavel": passa no BH por familia, nao passa na porta temporal. Apagar do confianca_motivo a frase "Os tres indicadores de pressao passam na porta temporal ... ou seja sao medidas reais que simplesmente nao distinguem quem sobe — nao e falha de medida" e substituir por: "Nenhum destes indicadores preve o 2o turno (duelo defensivo parcial +0,10, p 0,36; PPDA parcial -0,11, p 0,34); o que existe e repeticao dentro da temporada, que a especificacao aposentou como criterio em 15/09."
- **poder_nao_calculado** (3/3) em `manchete` — A metade negativa da manchete ("Quem sobe nao pressiona mais alto") e um nulo sem poder apresentado como achado. O poder foi calculado e diz que o desenho nao enxerga nada abaixo de d 1,14 — e os tres efeitos de pressao sao menores que isso e apontam para o lado CONTRARIO ao da manchete.
  - **correção:** A manchete nao pode afirmar o negativo. Trocar por algo como "Quem sobe ganha mais duelo no chao; sobre pressao alta este desenho nao consegue decidir", e o o_que_vimos tem de citar o minimo detectavel: "com 8 contra 32 so um efeito grande ({dmin_SM}) seria visivel, e os de pressao ficam abaixo disso — e todos apontam para quem sobe pressionar mais, nao menos".
- **fronteira** (3/3) em `o_que_vimos` — Todos os nove numeros do o_que_vimos vem do corte SEM os times de fronteira — o corte que a propria casa classificou como enviesado — e isso quase dobra a diferenca do duelo defensivo em relacao ao corte robusto. O confianca_motivo abre declarando so esse corte ("Sem os times de fronteira"), enquanto a regra exige firme nos dois.
  - **correção:** Os numeros do o_que_vimos passam a ser os do corte COM fronteira (duelo 60,8% contra 59,8%; PPDA 9,69 contra 10,13), com o corte sem fronteira citado so como teste de robustez no confianca_motivo. O confianca_motivo tem de dizer "firme nos dois cortes (q 0,026 com fronteira, 0,00006 sem)" em vez de abrir por "Sem os times de fronteira".
- **excesso_de_alcance** (3/3) em `o_que_vimos` — "o maior efeito de todo o estudo ate aqui" e falso — e e falso ja dentro do proprio arquivo.
  - **correção:** Cortar "— o maior efeito de todo o estudo ate aqui". Se quiser manter ordem de grandeza, dizer apenas "e a maior diferenca entre os oito indicadores desta parte", que e verdade nos dois cortes.
- **palavra_proibida** (3/3) em `o_que_vimos` — O o_que_vimos usa quatro vezes a palavra "d" e duas vezes "q", ambas na lista proibida, e traz seis numeros que sao valores de d e de q — justamente as unidades que a regra proibe fora da prova.
  - **correção:** Reescrever sem d e sem q, so em unidade de jogo, por exemplo: "Nenhum indicador de pressao separa: quem sobe cede {ppda_s} passes do adversario por acao defensiva contra {ppda_m} do meio, e recuperacoes e intensidade ficam iguais. O que separa e o duelo defensivo ganho: {dd_s}% contra {dd_m}% — cerca de um duelo a mais ganho a cada cem disputados." Os d e q ficam no confianca_motivo e na prova.
- **efeito_do_placar** (3/3) em `o_que_vimos` — A conclusao e sobre pressao (PPDA e intensidade), que muda com o resultado corrente, e nao ha recorte por estado do jogo em base nenhuma — mas A06-1 nao carrega a marca "pode ser efeito do placar" em campo algum. A ressalva foi declarada e depois perdida na passagem para o JSON, que e o que vai a tela.
  - **correção:** Acrescentar ao o_que_vimos ou ao confianca_motivo: "pode ser efeito do placar — PPDA e intensidade mudam conforme o time esta ganhando ou perdendo, e a base nao permite o recorte por estado do jogo", mais a ressalva do elenco: "elenco valioso tende a pressionar alto; o estudo nao separa as duas coisas".
- **excesso_de_alcance** (3/3) em `para_o_santa_cruz` — Salto do clube para o jogador: o indicador medido e uma taxa do TIME na temporada, e o uso pratico o converte em requisito individual de contratacao, posicao por posicao, sem nenhum teste de jogador.
  - **correção:** "Para o Santa Cruz" nao pode prometer requisito por jogador a partir deste numero. Trocar por: "O time que sobe ganha mais a divisao no chao; se isso e do jogador ou do sistema, A06 nao decide — J03 tem de testar duelo defensivo no percentil por posicao antes de virar requisito de contratacao em J05."
- **numero_errado** (3/3) em `prova` — A prova citada contradiz o numero da propria conclusao: A06.md publica um IC95 do d diferente do que esta em "numeros" e no CSV para o mesmo teste. Quem for conferir encontra outro intervalo.
  - **correção:** Corrigir A06.md:22 para [+0,99, +2,37], o valor do CSV, e regravar a linha de confianca da conclusao 2 como "indicio", para o .md voltar a sustentar o que o .json afirma.

### A06-2  (7 confirmados)

- **prova_nao_sustenta** (3/3) em `o_que_vimos` — A 3ª frase — "Nenhum indicador do A02 ou do A06 separa essas duas faixas nos dois cortes" — é contrariada pelo próprio A02: a pontaria (gols menos xG) é firme nos DOIS cortes contra a trave.
  - **correção:** "Nenhum indicador que possa ser característica separa essas duas faixas nos dois cortes: o único que separa nos dois é a pontaria, que é o placar redescrito e não se repete de um turno para o outro."
- **numero_errado** (3/3) em `o_que_vimos` — A 2ª frase diz que, COM os times de fronteira, o mesmo teste dá "pode ser sorte" — o selo real é "sem diferença clara", um degrau abaixo. A frase faz o corte completo parecer mais favorável do que é.
  - **correção:** "COM os times de fronteira o mesmo teste dá 'sem diferença clara'."
- **palavra_proibida** (3/3) em `o_que_vimos` — O "o que vimos" traz "(d {ddt_d}, q {ddt_q})", que na tela vira "(d 2.23, q 0.00379)": duas palavras da lista proibida e dois números que a regra proíbe expressamente fora da prova.
  - **correção:** Cortar o parêntese inteiro; d e q ficam no confianca_motivo e no A06_testes.csv. Se algo tiver de ficar, use unidade de jogo (ex.: "7 dos 8 promovidos ganham mais duelo defensivo que a mediana da trave").
- **numero_errado** (3/3) em `confianca` — As duas medianas citadas para justificar o rebaixamento não são as do recorte do A06: elas vêm da tabela de _metodo_fronteira.md, que conta 20 clube-temporadas de trave (inclui 2026) enquanto o A06 roda com 16 (2022–2025). A mesma frase mistura os dois: "9 dos 16" é do recorte certo, "62 / 56,5" não.
  - **correção:** "mediana 63 pontos nos que saem contra 57 nos que ficam" — e por marcador, com os valores medidos no recorte 2022–2025 do próprio A06.
- **outro** (3/3) em `n` — Número digitado à mão: o "7" do n não vem por marcador e não tem valor em "numeros" (só existem n_sobe_sf e n_meio_sf; não há n_trave_sf). O mesmo no confianca_motivo, com 9, 16, 62 e 56,5.
  - **correção:** Acrescentar n_trave_sf (e as contagens/medianas do corte) a "numeros" e escrever "{n_sobe_sf} contra {n_trave_sf}, sem a fronteira".
- **prova_nao_sustenta** (3/3) em `prova` — A prova por extenso da parte (A06.md) ainda traz a versão anterior ao rebaixamento e contradiz a conclusão em confiança e em uso prático — e é ela que vai para "Como sabemos".
  - **correção:** Reescrever a conclusão 2 do A06.md com o mesmo texto e a mesma confiança do JSON (indício, depende do corte), e descrever o rho 0,319 como estabilidade do indicador, não como porta temporal.
- **numero_errado** (3/3) em `o_que_vimos` — Na tela os números saem com ponto e três casas — "61.672%", "59.791%", "1.57" — porque os valores estão gravados como texto em "numeros" e o formatador do gerador só converte float. Em português "61.672%" se lê como sessenta e um mil.
  - **correção:** Gravar dd_s, ddt_t e dmin_ST como float (61.67, 59.79, 1.57) para saírem "61,67%" e "59,79%" — duas casas bastam para um percentual de duelo.

### A06-3  (6 confirmados)

- **confianca_alta_demais** (3/3) em `confianca` — "firme" declarado sem a porta temporal — que nunca rodou para nenhum dos três indicadores desta conclusão e que, quando eu rodo, reprova com o sinal invertido.
  - **correção:** Confiança "provável" (passa no BH nos dois cortes, reprova na porta temporal), com o confianca_motivo carregando os números da porta (parcial +0,06, p 0,61) e a prova citando o arquivo onde ela pode ser conferida.
- **prova_nao_sustenta** (3/3) em `o_que_vimos` — O xG sofrido ajustado entra em "o que fica" sem nenhuma marca, mas reprova nos dois cortes.
  - **correção:** Tirar o xG sofrido ajustado da frase, ou dizer explicitamente que ele não passou no critério.
- **excesso_de_alcance** (2/3) em `para_o_santa_cruz` — A frase inventa um mecanismo (distância e ângulo do chute cedido) que a base não mede, e nega uma coisa ("não vem de ter mais a bola") que nunca foi testada e que no dado bruto aponta ao contrário.
  - **correção:** Cortar "para longe e para o ângulo ruim" (fica só "cede finalização de menor valor esperado") e cortar "não vem de ter mais a bola", ou declarar posse na lista e testá-la antes.
- **confianca_alta_demais** (3/3) em `o_que_vimos` — O efeito reportado é quatro vezes maior que a régua do próprio indicador, e a ressalva do xG — que o A02 carrega para este mesmo número — sumiu.
  - **correção:** Acrescentar a ressalva da régua curta (confiabilidade medida 0,36) e alinhar o nível ao do A02-2.
- **efeito_do_placar** (2/3) em `o_que_vimos` — A conclusão inteira é construída sobre um ajuste pela posse do adversário e não vem marcada como "pode ser efeito do placar".
  - **correção:** Marcar o A06-3 com "pode ser efeito do placar", como as conclusões de pressão do A06-1.
- **palavra_proibida** (3/3) em `o_que_vimos` — Quatro "d" e um "q" na camada de 2 minutos, com os números em unidade de efeito em vez de unidade de jogo.
  - **correção:** Trocar por unidade de jogo com os valores que já existem na base: "cada finalização que sofre vale {xgpr_s} gol esperado contra {xgpr_m} do meio" (0,086 × 0,100, precisa de dois marcadores novos em numeros) e mandar d e q para o confianca_motivo e a prova.

### A07-1  (8 confirmados)

- **poder_nao_calculado** (3/3) em `manchete / o_que_vimos / confianca` — O poder foi calculado e diz o contrario do texto: nenhum teste que sustenta a conclusao tinha poder para ver nem um efeito grande, e a frase fixa que a especificacao manda escrever nesse caso nao aparece em lugar nenhum.
  - **correção:** Trocar 'diferencas pequenas que nao sobrevivem ao teste' por 'este desenho so enxergaria diferenca grande: com 16 contra 48 o menor efeito visivel ja e enorme, e sem os times de fronteira (8 contra 32) e maior ainda'. A manchete tem de dizer que nao se viu diferenca, nao que nao ha diferenca.
- **confianca_alta_demais** (2/3) em `confianca` — 'firme' sem nenhum dos dois criterios: o confianca_motivo so invoca cobertura de dado, a porta temporal nunca rodou nesta parte e um resultado negativo nao 'passa' em BH.
  - **correção:** Rebaixar para 'indicio' (nao passou em nenhum dos dois criterios, e a frase tem de dizer por que: o desenho nao tem poder). Se o dono quiser 'provavel', tem de rodar antes a porta temporal com os dados fisicos, como A02 e A06 fizeram.
- **excesso_de_alcance** (2/3) em `manchete / para_o_santa_cruz` — A frase afirma inexistencia e depois causa ('nao e o que decide o acesso') onde os intervalos ainda admitem efeito grande.
  - **correção:** Manchete: 'Correr nao aparece como diferenca entre quem sobe e o resto — e o estudo so veria diferenca grande'. Para o Santa Cruz: trocar 'Preparacao fisica nao e o que decide o acesso' por 'nao ha base aqui para contratar pensando em 'time que corre mais sobe'; tambem nao ha base para dizer que correr nao importa'.
- **fronteira** (3/3) em `o_que_vimos` — Os quatro numeros mostrados sao do corte SEM fronteira — exatamente a pratica que _metodo_fronteira.md registra como o erro do A03 — e e o corte que faz a diferenca parecer menor, favorecendo a conclusao negativa.
  - **correção:** Mostrar os numeros do grupo inteiro (corte COM fronteira, 16 contra 48): 9.644 m contra 9.598 m e 669 m contra 652 m — e dizer que sem os times de fronteira a diferenca continua invisivel. O corte sem fronteira serve de teste de robustez, nao de vitrine.
- **n_errado** (2/3) em `n` — O n declarado (80 clube-temporadas) nao e o n de nenhum teste da conclusao, nem o das linhas de onde saem os numeros citados.
  - **correção:** n: '16 que subiram contra 48 do meio (8 contra 32 sem os times de fronteira); contra a Trave, 16 contra 16 e 8 contra 7'.
- **efeito_do_placar** (3/3) em `o_que_vimos / confianca` — A parte declarou por escrito, antes de rodar, que a conclusao sairia marcada como 'pode ser efeito do placar' — e A07-1 nao tem a marca, embora corrida seja o caso tipico da regra.
  - **correção:** Acrescentar ao o_que_vimos ou ao confianca_motivo: 'pode ser efeito do placar — quem sobe passa mais tempo na frente e quem esta atras corre mais; a base nao permite recorte por estado do jogo (A08 nao roda).'
- **prova_nao_sustenta** (3/3) em `prova` — A prova aponta para um arquivo que nao existe, entao a terceira camada de leitura (quem quer conferir) nao tem para onde ir.
  - **correção:** Ou escrever A07.md, ou trocar a prova por 'A07_testes.csv (comparacoes SM e ST, cortes com e sem fronteira) e A07_resumo.json (poder por desenho)'.
- **outro** (2/3) em `o_que_vimos` — Os quatro numeros de metros estao gravados como texto em 'numeros', escapam do formatador do gerador e chegam a tela com tres casas decimais e ponto no lugar da virgula — precisao de milimetro numa frase de reuniao de clube.
  - **correção:** Gravar os quatro como numero (float) e arredondar para metro inteiro: 9.644 e 9.598 m por 90 min; 669 e 652 m em alta intensidade.

### A07-2  (10 confirmados)

- **excesso_de_alcance** (3/3) em `manchete` — A segunda metade da manchete ('e o sprint que falta e sem a bola') localiza o buraco numa fase do jogo que o estudo nunca testou: ela nasce so de um teste cruzar q<0,05 e o outro nao.
  - **correção:** Cortar a localizacao da manchete ('Quem cai sprinta menos') ou rebaixar a conclusao a indicio dizendo que o deficit aparece com e sem bola e que o estudo nao consegue dizer onde e maior. Pelo mesmo motivo cai 'sprint de recomposicao, nao de ataque' no para_o_santa_cruz.
- **prova_nao_sustenta** (3/3) em `o_que_vimos` — Os dois numeros de sprint da primeira frase nao sobrevivem ao desconto do rodizio que a especificacao torna obrigatorio em TODA linha fisica, e o A07 pulou esse desconto alegando, erradamente, que ele nao existe mais.
  - **correção:** Tirar os numeros de sprint por 90 da frase, ou marca-los como nao-firmes; a conclusao que resta e so a do sprint sem bola. E o confianca_motivo tem de dizer o contrario do que diz: com o desconto prescrito o rodizio derruba o sprint por 90.
- **poder_nao_calculado** (3/3) em `o_que_vimos` — 'com a bola nao separa' e afirmada num teste que o proprio arquivo marca como sem poder para o tamanho observado — 'nao detectamos' virou 'nao existe'.
  - **correção:** 'com a bola a amostra nao permite dizer' em vez de 'com a bola nao separa', citando que o desenho so enxerga diferenca a partir de d 0,97 e a observada e 0,54.
- **palavra_proibida** (3/3) em `o_que_vimos` — O que vimos usa cinco vezes as palavras proibidas 'd' e 'q' e traz numeros em unidade de d e de q, que a regra so admite na prova.
  - **correção:** Mover todo d e q para o confianca_motivo/prova e deixar no que vimos so metro, sprint e 'x em cada y'.
- **n_errado** (2/3) em `n` — O n e digitado a mao e nao bate com as linhas que produziram os numeros do texto: o texto vem de 12 contra 32, o n declara 16 contra 48.
  - **correção:** '{n_cai_sf} rebaixados contra {n_meio_sf} do meio' com os valores 12 e 32 em numeros (ja estao em A07_resumo.json, chave n), ou trocar o texto para os numeros do corte com fronteira e declarar 16 contra 48.
- **fronteira** (3/3) em `o_que_vimos` — Os numeros de manchete sao os do corte SEM fronteira — exatamente o erro que o _metodo_fronteira.md registra como o mais caro do estudo —, e eles sao sistematicamente maiores que os do corte padrao.
  - **correção:** Publicar os numeros do corte COM fronteira (156,2 contra 168,1 m; 91,1 contra 100,0 m) e deixar o corte sem fronteira so como teste de robustez, na prova.
- **porta_temporal** (3/3) em `confianca` — A porta temporal nao foi rodada nesta parte, o confianca_motivo nao diz isso, e o para_o_santa_cruz usa linguagem de prevencao ('seguro contra o rebaixamento') que e justamente o que a porta existe para autorizar.
  - **correção:** Dizer no confianca_motivo que a porta temporal nao roda no fisico (nao ha fisico por jogo antes de 2025, CLAUDE.md 'O que a base nao tem') e trocar 'seguro contra o rebaixamento' por uma frase de associacao — time que cai sprinta menos, sem afirmar que sprintar mais evita a queda.
- **numero_errado** (3/3) em `o_que_vimos` — Na tela os numeros saem com ponto decimal ingles e viram milhar em portugues: o leitor le 8.202 sprints e 154.423 metros.
  - **correção:** Guardar os valores em numeros como float arredondado na unidade de jogo (154 e 170 m; 8,2 e 8,8 sprints; 91 e 101 m) e escrever o p do rodizio como texto ('p abaixo de 0,001').
- **prova_nao_sustenta** (3/3) em `prova` — A prova citada nao contem os numeros que sustentam a confianca, e a parte nao tem script nem .md: os rho do rodizio nao sao conferiveis por nenhum arquivo entregue.
  - **correção:** Escrever scripts/A07.py com a conta do rodizio e o A07.md, e apontar a prova para eles.
- **prova_nao_sustenta** (3/3) em `para_o_santa_cruz` — O reforco tirado do A06 nao existe na comparacao usada: o A06 nunca testou Cai contra Meio.
  - **correção:** Tirar o A06 da soma, ou dizer explicitamente que o duelo defensivo do A06 e um achado de quem SOBE contra o meio, nao de quem nao cai.

### A11-1  (7 confirmados)

- **confianca_alta_demais** (3/3) em `confianca` — Declarada "firme" tendo passado em so um dos dois criterios: houve BH por familia, mas a porta temporal nunca rodou — e nao pode rodar, porque nao existe fisico por turno na base.
  - **correção:** confianca: "provavel", com o motivo dizendo que passa no BH por familia mas nao tem porta temporal, e que a base nao permite roda-la (fisico so em periodo unico). Tirar tambem "as duas firmes" do o_que_vimos.
- **efeito_do_placar** (3/3) em `confianca` — Conclusao feita so de corrida e volume ofensivo, sem recorte por estado do jogo, e nao vem marcada como "pode ser efeito do placar" — enquanto a A11-2, com a mesma base e o mesmo problema, vem marcada e por isso foi rebaixada.
  - **correção:** Acrescentar ao confianca_motivo: "pode ser efeito do placar — correr para a area e entrar na area sobem juntos em quem esta atras, e a base nao permite o recorte por estado do jogo".
- **poder_nao_calculado** (2/3) em `o_que_vimos` — "Nao explicam nada" e "tambem nao" sao ausencias declaradas sem poder calculado: o arquivo nao guarda rho minimo detectavel nenhum para as correlacoes, e o intervalo que existe nao exclui um efeito que o proprio estudo chama de firme.
  - **correção:** Trocar "nao explicam nada" por "nao aparecem" / "nao achamos relacao", e dizer o tamanho que ficou de fora ("o dado so descarta relacao acima de cerca de 0,3"), ou acrescentar ao CSV o minimo detectavel por correlacao, como a A11-3 faz com dmin.
- **palavra_proibida** (3/3) em `o_que_vimos` — A palavra "rho" aparece cinco vezes no o_que_vimos, e ela esta na lista de termos que so podem aparecer na prova.
  - **correção:** Substituir por linguagem de reuniao: "anda junto", "nao anda", "a relacao mais forte do estudo". O "rho" fica no confianca_motivo e no A11_correlacoes.csv.
- **outro** (3/3) em `o_que_vimos` — Os numeros do o_que_vimos sao coeficientes de correlacao calculados sobre percentil dentro da temporada, e a regra exige numero em unidade de jogo.
  - **correção:** Trocar os coeficientes por numero de jogo, ex.: "entre os 10 times que mais correm para a area, X entraram na area acima da media" ou "3 em cada 4 dos que mais correm para a area estao no terco de cima em xG" — com os rho migrando para o confianca_motivo.
- **outro** (3/3) em `confianca` — Usa o xG como um dos dois efeitos principais sem a ressalva de confiabilidade obrigatoria — e o efeito reportado e maior que o teto da propria regua.
  - **correção:** Acrescentar ao confianca_motivo: "o xG tem confiabilidade medida 0,30, abaixo de 0,40 — a relacao com ele entra com a regua curta"; e apoiar a frase preferencialmente em entradas na area, que tem regua melhor.
- **outro** (2/3) em `prova` — O IC95 da prova foi feito por Fisher-z supondo 80 linhas independentes, quando a regra da casa manda bootstrap por clube — as 80 linhas sao 40 clubes, 24 deles repetidos.
  - **correção:** Rodar o IC com `ic_por_clube` (ou bootstrap de clube equivalente para rho) e republicar A11_correlacoes.csv. A substancia sobrevive — as duas correlacoes de manchete continuam com IC longe de zero —, mas a prova hoje esta mais estreita do que o painel permite.

### A11-2  (5 confirmados)

- **prova_nao_sustenta** (2/3) em `manchete` — A segunda metade da manchete ("mas não vira bola recuperada") e a frase do uso prático ("pressão não produz posse recuperada") são inferidas por transitividade a partir de dois testes de corrida, e o teste direto na mesma base diz o contrário: pressão anda forte com recuperações.
  - **correção:** A conclusão tem de cair ou mudar de sentido. O que a prova sustenta é apenas: "correr sem a bola anda com a pressão, mas não anda com as recuperações". Dizer que a PRESSÃO não produz bola recuperada exige o par ppda×recuperacoes, que não foi testado e que, testado, contradiz a frase. Se o par for acrescentado à lista pré-declarada e rodado, a manchete inverte.
- **prova_nao_sustenta** (2/3) em `para_o_santa_cruz` — "O que recupera a bola é ganhar a disputa, não chegar perto dela" inverte a ordem real dos dois efeitos na própria base, e nenhum dos dois foi testado em A11.
  - **correção:** Retirar a frase. A prova citada (A11_correlacoes.csv, família sem_bola) não contém nenhum teste de duelo nem de pressão contra recuperações; a leitura de A06 ("ganhar o duelo separa Sobe de Meio") é sobre separar faixas, não sobre recuperar bola, e não pode ser reescrita como mecanismo.
- **poder_nao_calculado** (3/3) em `confianca` — A metade negativa da conclusão é afirmada como ausência "clara" sem nenhum mínimo detectável calculado, e o intervalo não exclui um efeito do mesmo tamanho que a própria conclusão trata como real.
  - **correção:** Gravar o rho mínimo detectável no A11_resumo.json e trocar "as duas ausências com recuperações são claras" por algo como "não achamos relação, e o teste só pegaria uma relação de 0,31 para cima". Com o IC chegando a 0,34, a ausência de fis_m_per_min_otip×recuperacoes não é clara.
- **palavra_proibida** (2/3) em `o_que_vimos` — A palavra "rho" aparece duas vezes no o_que_vimos, e ela está na lista proibida da manchete e do que vimos.
  - **correção:** Tirar as duas ocorrências de "rho" do o_que_vimos. O termo só vale na prova e no confianca_motivo.
- **outro** (3/3) em `o_que_vimos` — Nenhum dos cinco números do o_que_vimos está em unidade de jogo: todos são coeficientes de correlação.
  - **correção:** Reescrever com números de jogo: por exemplo, quantos passes o adversário dá por ação defensiva nos times que mais correm sem a bola contra os que menos correm, ou quantas recuperações por jogo separam os dois extremos. O rho fica na prova.

### A11-3  (7 confirmados)

- **confianca_alta_demais** (3/3) em `confianca` — Declarada "provável" sem passar em nenhum dos dois critérios: nenhum dos 10 testes passou no BH por família e a porta temporal nunca foi rodada nesta parte.
  - **correção:** indício — o próprio confianca_motivo já traz a receita de indício da regra 1 ("n pequeno", "É 'não achamos', não 'não existe'").
- **n_errado** (3/3) em `n` — O n declarado (80 clube-temporadas) não é o das linhas que o teste usou, e a frase ainda afirma que esses 80 estão nas faixas alta e média.
  - **correção:** "4 contra 18 na faixa técnica média e 12 contra 15 na alta — 49 dos 80 clube-temporadas".
- **excesso_de_alcance** (3/3) em `para_o_santa_cruz` — "O físico é um traço estável do clube que não anda com o desfecho" é desmentido pela própria prova do A11 e pela frase seguinte do mesmo parágrafo.
  - **correção:** "não anda com o acesso" em vez de "não anda com o desfecho" — o resto do campo (seguro contra a queda sim, alavanca de acesso não) é exatamente o que o dado mostra.
- **efeito_do_placar** (2/3) em `confianca` — A conclusão é inteiramente sobre corrida e não traz a marca "pode ser efeito do placar", que o CLAUDE.md torna obrigatória quando não há recorte por estado do jogo.
  - **correção:** acrescentar ao confianca_motivo "pode ser efeito do placar: quem sobe joga mais tempo em vantagem e a base não permite o recorte".
- **fronteira** (2/3) em `confianca` — É comparação Sobe x Meio e o corte sem os times de fronteira nunca foi rodado, embora o CLAUDE.md mande rodar os dois sempre.
  - **correção:** rodar e reportar os dois cortes; a substância não muda, mas sem fronteira a parte testável encolhe para uma faixa só, o que reforça o rebaixamento para indício.
- **prova_nao_sustenta** (3/3) em `prova` — A prova aponta só para A11_estratificado.csv, que não contém metade do que a conclusão afirma; e o _registro.md manda ler um A11.md que não existe.
  - **correção:** "A11_estratificado.csv; A11_resumo.json (persistência §7.3 da ESPECIFICACAO); A07-2" — e escrever o A11.md que a seção Entrega exige.
- **palavra_proibida** (3/3) em `o_que_vimos` — Os quatro números da segunda frase são coeficientes de correlação ano a ano, não unidade de jogo — a palavra rho foi evitada, o valor de rho não.
  - **correção:** dizer em linguagem de jogo, por exemplo "o time que mais corre num ano é quase sempre o que mais corre no ano seguinte — só o valor do elenco se repete tanto quanto", deixando os coeficientes para a prova.

### A12-1  (9 confirmados)

- **consequencia_como_caracteristica** (3/3) em `para_o_santa_cruz` — A régua I_estabilidade_11 é feita inteira de indicadores que a casa classifica como consequência do resultado, e a frase os oferece como coisa que o Santa Cruz pode escolher.
  - **correção:** Tirar 'a estabilidade do onze' do que 'dá para escolher': sobra uma coisa, a qualidade da chance criada e cedida. I entra como descrição com o rótulo 'não contrate para isto', e a manchete deixa de contar quatro réguas como se fossem quatro alavancas.
- **confianca_alta_demais** (3/3) em `confianca` — 'firme' declarado sem a porta temporal — o confianca_motivo só mostra um dos dois critérios (BH e fronteira).
  - **correção:** Rebaixar A12-1 para 'provável' (passa em só um dos dois critérios) ou rodar o 1º→2º turno das réguas como A02 e A06 fizeram; para I a própria especificação diz que esse teste é impossível, logo I nunca pode ser firme.
- **prova_nao_sustenta** (2/3) em `manchete` — O teste rodou só no eixo composto, que a especificação proíbe como unidade única de teste; no indicador cru, F_solidez não tem nenhum item firme nos dois cortes e I_estabilidade_11 não tem nenhum no corte sem fronteira.
  - **correção:** Publicar o item, como manda a §6.5: o que separa quem sobe é chutar de mais perto (dist_remate), o valor do elenco (tm_valor_total e tm_valor_mediana) e, com ressalva, o xG por chute cedido — não 'quatro réguas'.
- **numero_errado** (3/3) em `o_que_vimos` — O marcador {nao_separam} lista A_posse_construcao entre as que 'não separam', quando ela é firme no corte sem fronteira.
  - **correção:** Tirar A_posse_construcao da lista das cinco e tratá-la como indício que depende do corte; corrigir junto o 'estilo — posse, pressão, volume físico, bola aérea — não separa' do para_o_santa_cruz.
- **prova_nao_sustenta** (2/3) em `o_que_vimos` — As duas réguas de jogo que sustentam a manchete são construídas sobre xG, cuja confiabilidade medida é 0,30, e não há ressalva em lugar nenhum da conclusão.
  - **correção:** Marcar a ressalva do xG em E e F no confianca_motivo e no texto, como o A02 faz, ou apoiar E em dist_remate, que tem versão por jogo e passou na porta A.
- **n_errado** (3/3) em `n` — O n declarado (80) é o da base, não o das linhas que o teste usou; e a metade 'sem fronteira' do selo firme se apoia em 8 promovidos.
  - **correção:** n = '16 promovidos contra 48 do meio, e 8 contra 32 sem a fronteira', por marcador.
- **palavra_proibida** (3/3) em `o_que_vimos` — Dez números em percentil e a própria palavra 'percentil' no que vimos, onde a regra manda unidade de jogo.
  - **correção:** Reescrever em unidade de jogo: distância média do chute em metros, xG cedido por jogo, valor de elenco em reais, ou contagem do tipo 'X em cada 16 promovidos'.
- **outro** (2/3) em `o_que_vimos` — O que vimos tem 4 frases; o máximo é 3.
  - **correção:** Cortar para 3 frases — a primeira, que é linguagem de método ('firmes nos dois cortes de fronteira'), pertence ao confianca_motivo.
- **outro** (2/3) em `manchete` — Números digitados à mão na manchete e no que vimos, com os marcadores já medidos e não usados.
  - **correção:** Usar {n_reguas} e {sm_n}, criar marcador para as cinco que não separam e para o n.

### A12-2  (7 confirmados)

- **numero_errado** (3/3) em `o_que_vimos` — Os tres numeros que sustentam a primeira frase (14 cabem, 4 subiram, 28,6%) nao saem do perfil publicado: com o perfil da §7.2(b), que e o que o proprio script fixa, sao 13, 2 e 15,4%.
  - **correção:** Ou 13, 2 e 15,4% com o perfil publicado, ou dizer no texto que "o perfil" aqui e o envelope real de A12-3. Hoje A12-2 e A12-3 chamam de "perfil" duas faixas diferentes dentro do mesmo arquivo.
- **efeito_do_placar** (3/3) em `confianca` — O perfil e posse, PPDA e passe longo — os tres itens que a regra do Placar manda ressalvar — e a conclusao nao traz a marca "pode ser efeito do placar".
  - **correção:** Marcar "pode ser efeito do placar" e acrescentar a ressalva de que elenco valioso tende a ter esse ppda e o estudo nao separa as duas coisas.
- **excesso_de_alcance** (3/3) em `para_o_santa_cruz` — "Em 2026 ele esta produzindo 6º a 8º lugar entre os clubes sem dinheiro" descreve 3 dos 5 times e contradiz o o_que_vimos da propria conclusao.
  - **correção:** "esta produzindo de 6º a 15º", ou "tres dos cinco entre 6º e 8º, dois no meio da tabela" — e ai "perfil de trave" nao se sustenta como descricao.
- **excesso_de_alcance** (3/3) em `o_que_vimos` — A frase julga 2026 pelo G4, que nao e a faixa de acesso naquele ano, e nao diz que a foto e da rodada 27 de 38.
  - **correção:** Usar a faixa de acesso de 2026 (1º-2º direto, 3º-6º playoff) em vez do G4, declarar a rodada e dizer que a diferenca para a faixa e de 4 pontos.
- **prova_nao_sustenta** (3/3) em `prova` — Os dois arquivos citados na prova nao sao gerados por script nenhum, e o arquivo que o script gera diz outra coisa.
  - **correção:** Fazer o A12.py gravar os dois arquivos com o envelope que a frase de fato usa, corrigir a chave duplicada e escrever o A12.md. Prova que nenhum script reproduz nao e prova.
- **outro** (3/3) em `o_que_vimos` — O "o que vimos" tem 4 frases; o limite da casa e 3.
  - **correção:** Juntar "Nenhum no G4" a frase anterior, ou cortar a primeira frase, que e a que esta com o numero errado.
- **outro** (3/3) em `o_que_vimos` — Seis numeros medidos estao digitados a mao, sem marcador, e todos envelhecem a cada rodada de 2026.
  - **correção:** Criar marcadores (por exemplo n_times26 e pos_baratos26) e tirar os numeros do texto, como manda a secao "Texto e numero".

### A12-3  (3 confirmados)

- **excesso_de_alcance** (3/3) em `para_o_santa_cruz` — Prescreve como "envelope real" a caixa minima que encerra exatamente os 4 casos, em valor bruto e cruzando temporadas — contra a regra de posto dentro da temporada.
  - **correção:** Dizer que sao min e max de 4 casos (envelope sem margem, nao uma faixa estimada) e, para uso em 2027, dar a faixa em posto dentro da temporada, nao em valor bruto.
- **marcador_sem_valor** (3/3) em `manchete / o_que_vimos / para_o_santa_cruz / n` — A conclusao nao tem nenhum marcador: os 14 numeros medidos estao digitados a mao, exatamente o que a regra 4 proibe.
  - **correção:** Levar os 14 valores para "numeros" (ex.: {faixa_posse_topo}, {vitoria_posse}, {chape_longo}, {env_posse_topo}...) e trocar os numeros do texto por marcadores; se a precisao de 4 casas for necessaria, ela tem de vir do campo, nao da mao.
- **prova_nao_sustenta** (2/3) em `prova` — A prova citada aponta para um arquivo que nenhum script do estudo gera e que contradiz o resumo gerado pelo A12.py.
  - **correção:** Gerar o envelope dentro de scripts/A12.py (ou citar A12_resumo.json + dados/serieb_clube_temporada.csv como prova) e acertar a chave duplicada, para que o numero citado tenha um script que o produza.

### A13-1  (9 confirmados)

- **fronteira** (3/3) em `confianca` — A regra da fronteira nunca foi rodada nesta parte, e quando se roda a frase se inverte: sem os times de fronteira quem SOBE também piora no returno.
  - **correção:** Rodar A13 nos dois cortes. Como a afirmação central troca de sinal entre eles, 'firme' está fora por _metodo_fronteira.md (item 2: firme = firme nos dois cortes); vale no máximo indício, e a frase tem de dizer que depende do corte.
- **prova_nao_sustenta** (3/3) em `o_que_vimos` — A queda do 2º turno de quem cai não se distingue de acaso por nenhum teste — a prova citada é uma mediana sem teste algum.
  - **correção:** Retirar 'afundou depois', 'uma piora de X ponto' e 'É a ÚNICA faixa que piora no returno'. O que a base sustenta é só a primeira metade: quem cai já fazia menos pontos no 1º turno.
- **confianca_alta_demais** (3/3) em `confianca` — 'firme' declarado sem nenhum dos dois critérios: não há correção para múltiplos testes nem porta temporal — não há teste nenhum.
  - **correção:** Rebaixar para indício e dizer no confianca_motivo que é contagem descritiva de 4 temporadas, sem teste — ou rodar o método da casa (posto na temporada, Welch, d, BH por família, IC por clube) e reportar o q.
- **numero_errado** (3/3) em `o_que_vimos` — A frase mistura duas estatísticas: cita duas medianas e chama de 'piora' um número que não é a diferença entre elas — e ainda com o sinal invertido.
  - **correção:** Escolher uma só estatística e fechar o sinal: ou 'uma piora de 2,5 pontos' (diferença das medianas) ou 'a mediana da variação é uma perda de 1,5 ponto'. Nunca as duas na mesma frase.
- **numero_errado** (3/3) em `o_que_vimos` — A trave é apresentada como quem 'cai um pouco' com dois números que sobem — e o −0,5 é um empate exato, não uma queda.
  - **correção:** Tirar a frase da trave. Se ficar, dizer que a trave empata: metade sobe, metade cai.
- **outro** (3/3) em `o_que_vimos` — Contradição dentro do mesmo parágrafo: a frase 3 diz que Cai é a ÚNICA que piora e a frase 4 diz que a trave também cai.
  - **correção:** Apagar 'ÚNICA'. Se quiser manter a comparação entre faixas, ela precisa de teste — e o teste dá p = 0,28 (Cai × Meio).
- **excesso_de_alcance** (3/3) em `para_o_santa_cruz` — 'um primeiro turno ruim que não se corrige' é contradito pela própria base e pela conclusão A13-2 do mesmo arquivo.
  - **correção:** Trocar por algo que a base sustente: 'o déficit de quem cai já existe na metade' — sem afirmar que não se corrige, porque em 4 temporadas ele se corrigiu 6 vezes.
- **poder_nao_calculado** (2/3) em `confianca` — A manchete afirma uma negativa ('Quem cai NÃO despenca') sem nenhum d mínimo calculado — o desenho não enxerga o efeito que descreve.
  - **correção:** Registrar dmin no confianca_motivo. Com dmin 0,82 e d observado 0,32, 'não despenca' é 'não dá para ver', não 'não acontece'.
- **palavra_proibida** (3/3) em `o_que_vimos` — O que vimos tem 4 frases; o limite é 3.
  - **correção:** Cortar a frase da trave (que já está errada) e o parágrafo volta a 3.

### A13-2  (4 confirmados)

- **numero_errado** (3/3) em `para_o_santa_cruz` — "Um em cada quatro promovidos veio de tras" contradiz os proprios marcadores da conclusao: sao 6 de 16, ou seja 3 em cada 8 (37,5%), nao 1 em cada 4 (25%).
  - **correção:** "{n_viraram} em cada {sobe_total} promovidos vieram de tras" — 3 em cada 8 — e por marcador, nunca escrito a mao.
- **numero_errado** (3/3) em `o_que_vimos` — "{r19_perto}% estao nela ou a ate 3 pontos" descreve uma regra que o script nao calculou: a folga de 3 pontos so vale para quem termina no Sobe ou no Cai; quem termina no Meio nao recebe folga nenhuma.
  - **correção:** Ou descrever a metrica como ela e ("na faixa, e, para quem termina no G4 ou no Z4, a ate 3 pontos da linha"), ou recalcular a regra simetrica e usar 95,0%.
- **outro** (3/3) em `o_que_vimos` — Numeros digitados a mao, contra a regra de que todo numero do texto vem por marcador — e o o_que_vimos tem 4 frases, uma acima do limite de 3.
  - **correção:** Criar marcadores para cada numero citado (pos_19 e pts_1t dos tres clubes, r19_faixa na manchete) e cortar o o_que_vimos para 3 frases, passando os exemplos nomeados para a prova.
- **outro** (3/3) em `n` — O n = 80 esta certo, mas a robustez que o proprio script promete — "O numero sai com e sem" os clube-temporadas de base incompleta — nunca foi calculada, e o em_aberto conta dez incompletos quando no recorte da parte sao quatro.
  - **correção:** Corrigir o em_aberto para quatro clube-temporadas e ou rodar de fato a versao sem eles, ou tirar a promessa "o numero sai com e sem" do cabecalho do script.

### A13-3  (7 confirmados)

- **confianca_alta_demais** (3/3) em `confianca` — "firme" declarado sem nenhum dos dois criterios: nao ha correcao BH por familia em parte alguma do A13, e a diferenca entre os dois rho — que e a propria conclusao — nunca foi testada.
  - **correção:** provavel (passa na porta temporal, nao passa na correcao para multiplos testes), com o confianca_motivo dizendo que nao houve BH e que a diferenca entre os dois rho nao foi testada
- **prova_nao_sustenta** (3/3) em `prova` — A prova citada nao contem o numero que sustenta a manchete: rho_1t_2t = 0,484 nao existe em A13_resumo.json nem e calculado por A13.py.
  - **correção:** calcular o par pts_1t x pts_2t dentro de A13.py e grava-lo em previsores_do_1o_turno, ou trocar a prova para "A13_turnos.csv, colunas pts_1t e pts_2t"
- **excesso_de_alcance** (3/3) em `para_o_santa_cruz` — A frase nega o que o proprio teste mede: transforma uma associacao positiva e significativa em ausencia de previsao.
  - **correção:** algo como "a tabela da metade ja da uma vantagem grande em pontos, mas so uma parte do desempenho do 2o turno; a maior parte da campanha que vem ainda esta em aberto", com a fracao por marcador se for para citar numero
- **palavra_proibida** (3/3) em `manchete` — A manchete usa "rho", palavra da lista proibida, e e um titulo de estatistica, nao a conclusao dita numa reuniao de clube.
  - **correção:** manchete sem termo tecnico e sem coeficiente, por exemplo "A tabela da metade da vantagem, nao garante a segunda metade"
- **outro** (3/3) em `manchete` — Os dois numeros da manchete estao digitados a mao, sem marcador — quebra a regra de que nenhum numero e digitado.
  - **correção:** se o numero tiver de ficar, escrever {rho_1t_2t} e {rho_1t_final}; o melhor e manchete sem numero
- **palavra_proibida** (3/3) em `o_que_vimos` — Duas ocorrencias de "rho" e os tres numeros do paragrafo sao coeficientes de correlacao — nenhum em unidade de jogo.
  - **correção:** reescrever em unidade de jogo, por exemplo com pontos: 'quem fez X pontos no 1o turno fez em media Y no 2o', ou 'dos 16 que subiram, 6 nao estavam no G4 na metade' — e levar os rho para a prova
- **prova_nao_sustenta** (3/3) em `o_que_vimos` — A terceira frase apresenta, logo depois do teste limpo, justamente o par contaminado que as duas frases anteriores condenam — e nos mesmos 0,48, o que faz o xG parecer sobreviver ao teste limpo.
  - **correção:** trocar por "o saldo de xG do 1o turno preve o 2o turno a {rho_xg_2t}" (= 0,422), calculado em A13.py, ou tirar a frase

### A14-1  (5 confirmados)

- **consequencia_como_caracteristica** (3/3) em `o_que_vimos` — Um dos oito componentes do índice, I_estabilidade_11, é feito só de indicadores da lista fixa de consequência do resultado — exatamente o que a regra proíbe virar característica — e a frase ainda afirma que "só entra o que ... não é placar redescrito".
  - **correção:** Tirar I_estabilidade_11 do índice. Manchete "Sete indicadores..."; numeros: n_ind 7, i_sobe 78.1, i_trave 56.6, i_meio 47.8, i_cai 31.9->33.0, d_sm 1.59, e tirar o nome da lista {indice}. No para_o_santa_cruz cai "e, em parte, a estabilidade do onze" e "as outras seis" vira cinco.
- **palavra_proibida** (3/3) em `o_que_vimos` — A frase usa a palavra proibida "d" e traz cinco números que são percentil/d, os dois formatos que a regra barra no que vimos.
  - **correção:** Tirar a oração "com d {d_sm} entre Sobe e Meio" — ela vive na prova e no confianca_motivo. Os quatro valores por faixa saem do que vimos ou vêm traduzidos em unidade de jogo (ex.: "3 em cada 4 dos que subiram ficaram no quarto de cima da régua").
- **excesso_de_alcance** (3/3) em `o_que_vimos` — "Por faixa: Sobe, trave, meio, cai" e "a ordem das quatro faixas" tratam a Trave como uma quarta faixa, mas ela está inteira dentro do Meio — os mesmos 16 clube-temporadas são contados duas vezes.
  - **correção:** "três faixas, com a trave (5º-8º) como recorte dentro do meio". Se o número da trave ficar, dizer que ele está dentro do meio, ou usar o meio sem a trave (44.5).
- **prova_nao_sustenta** (3/3) em `prova` — Dos dois itens citados como prova, o script não roda mais e, se rodasse, devolveria outro índice; e não existe a prova por extenso que a entrega exige.
  - **correção:** Prender a varredura aos arquivos do Bloco A (ou proteger a coluna ausente), escrever A14.md, e enquanto isso a prova dizer que o índice é o da execução de 17/09 14:12.
- **outro** (2/3) em `o_que_vimos` — O corte de redundância é só por rho e deixou passar duas continências literais: dist_remate está dentro de E_qualidade_chance e os jogos de dd_casa são metade dos de duelos_def_pct — então o índice não são oito coisas independentes, e a frase "Saíram por redundância: ..." dá a triagem por completa.
  - **correção:** Dizer que o corte é por rho e não pega continência, ou tirar um de cada par (dist_remate ou E_qualidade_chance; dd_casa ou duelos_def_pct) e recalcular os cinco números.

### A14-2  (7 confirmados)

- **fronteira** (3/3) em `confianca` — A conclusao nunca foi rodada no segundo corte de fronteira, e no corte que falta ela se inverte em 2025 — logo "firme" e insustentavel pela regra da casa.
  - **correção:** Confianca no maximo "indicio", e o texto tem de dizer que a fraqueza de 2025 vem dos dois promovidos colados na linha e que em 2023 e 2024 o corte sem fronteira deixa so 1 promovido, sem teste possivel. Se o dono quiser manter a frase, ela precisa ser rodada nos dois cortes, como manda resultados/_metodo_fronteira.md.
- **confianca_alta_demais** (3/3) em `confianca` — "firme" declarada sem nenhum dos dois criterios: nao ha correcao para multiplos testes por familia nem porta temporal.
  - **correção:** "provavel" seria o teto se so faltasse um criterio; como faltam os dois e o corte de fronteira nao foi rodado, o nivel correto e "indicio". O confianca_motivo tem de mostrar os dois criterios ou dizer que nao foram rodados.
- **prova_nao_sustenta** (3/3) em `o_que_vimos` — "Deixando uma temporada de fora e aplicando o indice nela" nao e o que o script fez: nada foi deixado de fora.
  - **correção:** Ou rodar a selecao de indicadores dentro de cada treino (validacao de verdade, que e o que o CLAUDE.md pede para A14), ou trocar a frase por "temporada a temporada, com o indice montado sobre as quatro" e dizer no confianca_motivo que a validacao pedida nao foi feita.
- **prova_nao_sustenta** (3/3) em `para_o_santa_cruz` — "Em duas das quatro temporadas medidas, quem subiu nao estava no topo dela" e contrariado pelo proprio indice: metade dos promovidos estava no topo nas duas temporadas citadas.
  - **correção:** "Nessas duas temporadas o indice pegou parte dos promovidos no topo e errou os que entraram pela porta estreita" — e nao que quem subiu nao estava no topo.
- **consequencia_como_caracteristica** (3/3) em `para_o_santa_cruz` — "Um time alto no indice esta fazendo as coisas que quem sobe faz" nao vale para 2 dos 8 componentes: um e o valor do elenco e o outro e feito so de consequencias de ganhar.
  - **correção:** Ou tirar I_estabilidade_11 do indice, ou escrever que duas das oito pecas nao sao coisas que o time faz — o valor do elenco e a estabilidade do onze, que e resultado de ganhar —, como A14-1 ja escreve.
- **palavra_proibida** (3/3) em `o_que_vimos` — O "o que vimos" usa as palavras proibidas "d" e "p" e traz os numeros em d e em p, e nao em unidade de jogo.
  - **correção:** Reescrever em unidade de jogo ou de contagem, por exemplo "em 2022 e 2024 os quatro promovidos ficaram acima de todo o meio da tabela; em 2023 e 2025 ficaram misturados com ele", e mandar d, p e minimo detectavel para a prova e para o confianca_motivo.
- **outro** (3/3) em `prova` — A prova nao e reproduzivel hoje e a prova por extenso nao existe.
  - **correção:** Fixar a lista de arquivos-fonte de `candidatos()` (ou filtrar por bloco A) para o indice deixar de depender de quais partes ja rodaram, e escrever A14.md com a prova por extenso antes de o dono validar o texto.

### A14-3  (8 confirmados)

- **prova_nao_sustenta** (3/3) em `manchete` — O backtest da propria frase existe na base e da 1 acerto em 4: nas temporadas fechadas o indice quase nunca poe o 1o e o 2o da tabela como seus dois primeiros, e a conclusao nao reporta isso.
  - **correção:** A manchete nao pode dizer "acerta em cheio": tem de dizer que isso aconteceu em 1 das 5 temporadas medidas. Ex.: "Em 2026 a regua poe no topo os dois primeiros da tabela — o que so tinha acontecido em 2025". E o o_que_vimos tem de trazer o 1 em 4, nao so o erro do Vila Nova.
- **excesso_de_alcance** (3/3) em `manchete` — A manchete afirma um resultado que ainda nao existe: chama o 1o e o 2o da rodada 27 de "os dois que sobem direto" numa temporada com 11 rodadas por jogar.
  - **correção:** Trocar "os dois que sobem direto" por "os dois primeiros da tabela na rodada {rodada26}", que e o que o dado mostra. A frase sobre o regulamento novo pode ficar no o_que_vimos como contexto, nao como resultado.
- **consequencia_como_caracteristica** (3/3) em `confianca` — Um dos 8 componentes do indice (I_estabilidade_11) e feito inteiro de indicadores da lista fixa de consequencia do resultado, e o confianca_motivo so admite a circularidade do dinheiro.
  - **correção:** Ou tirar I_estabilidade_11 do indice, ou o confianca_motivo tem de dizer, alem do dinheiro, que o indice carrega um componente que e consequencia do resultado. Sensibilidade que rodei: sem I_estabilidade_11 o par Juventude/Novorizontino continua no topo de 2026, mas a ordem entre os dois inverte — ou seja, o "1o e 2o na ordem exata" nao e robusto.
- **palavra_proibida** (3/3) em `o_que_vimos` — A terceira frase usa "d" e "p" e numeros em d, em p e em percentil — tudo proibido fora da prova.
  - **correção:** Reescrever em unidade de jogo ou de posicao. Ex.: "Nas quatro temporadas fechadas, os dois primeiros ficaram acima da media da regua em 6 dos 8 casos, contra 8 dos 16 do 3o ao 6o". Os numeros de d, p, minimo detectavel e percentil descem para a prova e para o confianca_motivo.
- **outro** (3/3) em `o_que_vimos` — Numeros medidos digitados a mao onde o valor por marcador existe: a regra da casa e que nenhum numero do texto seja digitado.
  - **correção:** Usar {top1_pos} e {top2_pos}, criar {vn_pos} (= 3) e {vn} (= "Vila Nova") em "numeros" e referencia-los. Numa temporada em curso isso importa: se a tabela mexer, o texto envelhece em silencio.
- **outro** (2/3) em `para_o_santa_cruz` — Mesmo defeito no uso pratico e no n: "8 times-temporada" e "20 times" digitados a mao.
  - **correção:** Escrever "{pp_n12} times-temporada" e criar um {n26} = 20 para o campo n.
- **prova_nao_sustenta** (3/3) em `prova` — A prova aponta para a chave errada, o arquivo de prova por extenso nao existe, e o script citado nao roda mais.
  - **correção:** Citar tambem primeiro_segundo_contra_terceiro_sexto; escrever o A14.md; e fixar em A14.py a lista de arquivos de origem (ou filtrar por comparacao ausente e por bloco), senao o indice muda sozinho conforme a pasta cresce.
- **sem_uso_pratico** (2/3) em `para_o_santa_cruz` — O uso pratico nao diz o que muda na montagem do elenco, no treinador ou no modelo de jogo — descreve a regua — e ainda leva o metodo para a camada do leitor.
  - **correção:** Dizer o que fazer com a regua (ex.: usar como leitura de rodada para saber se o time esta fazendo as coisas de quem sobe, e nao como aposta de acesso) e tirar a mencao ao CLAUDE.md, que pertence a prova.

### J01-1  (3 confirmados)

- **n_errado** (3/3) em `n` — O n de 3.864 inclui 704 linhas de 2026, temporada em curso que as regras da casa reservam para teste, nunca para conclusao.
  - **correção:** n = "3.160 jogador-temporadas" (2022-2025), com 2026 mostrado a parte como teste. Se o dono quiser manter as cinco temporadas, isso precisa ser decisao dele e vir escrito no confianca_motivo.
- **numero_errado** (3/3) em `o_que_vimos` — Sete dos valores de "numeros" mudam quando a base e restringida as temporadas fechadas que a regra manda usar — e os que mais mudam sao justamente os do goleiro, que carregam a manchete.
  - **correção:** Regravar "numeros" sobre 2022-2025: gk_60=27,3 · zag_60=22,5 · ext_60=7,8 · atk_60=7,0 · gk_med=21,6 · atk_med=16,5 · gk_p75=64,7 · atk_p75=34,2 · n=3160.
- **numero_errado** (3/3) em `manchete` — Os dois numeros da manchete estao digitados a mao, fora do sistema de marcadores — e um deles esta errado na base que a regra manda usar.
  - **correção:** "Um corte unico de minutagem distorce por posicao: {gk_60}% dos goleiros passam, {atk_60}% dos atacantes", com gk_60 e atk_60 recalculados em 2022-2025 (27,3 e 7,0).

### J01-2  (6 confirmados)

- **poder_nao_calculado** (3/3) em `confianca` — Conclusão negativa ("lesão não explica") sem nenhum cálculo de poder: o desenho não conseguiria ver uma diferença de até ~3,7 pontos percentuais, e o texto apresenta a igualdade como achado.
  - **correção:** "A diferença é de décimos" tem de virar a frase da §6.7: com 436 linhas de minutagem alta, este desenho só enxergaria a lesão se ela aparecesse em mais de ~10,5% do grupo de minutagem baixa contra 6,7% do outro; abaixo disso ele não distingue. Sem esse número, a frase afirma ausência onde só há falta de poder.
- **prova_nao_sustenta** (2/3) em `prova` — A prova citada mede só a FREQUÊNCIA de lesão e nunca a DOSE; a mesma base mostra que o lesionado de minutagem baixa perde quase o dobro de dias, o que contradiz a manchete como ela está escrita.
  - **correção:** A frase tem de separar as duas coisas: lesão é igualmente COMUM nos dois grupos (~7%), mas quando existe custa cerca do dobro de dias em quem jogou pouco (mediana 56 contra 32 dias). "Quando há lesão, a mediana é de 53 dias" não pode ser apresentado como detalhe neutro — é o número que trabalha contra a manchete, e precisa vir com o par do grupo de minutagem alta.
- **n_errado** (3/3) em `n` — A base do teste inclui 2026, que o CLAUDE.md declara ser só teste; retirando-a, os quatro números publicados mudam e o sinal da diferença inverte.
  - **correção:** Rodar a conclusão na base declarada (2022-2025) e publicar esses valores: 138 de 1.974 (7,0%) contra 7,5% no grupo de minutagem alta, mediana de 56 dias. Se 2026 for mantido, a frase precisa dizer que 18% das linhas vêm de uma temporada em andamento, que o md reserva para teste.
- **n_errado** (3/3) em `n` — O n do grupo de comparação nunca é declarado: os 6,7% de minutagem alta repousam sobre 436 linhas e 29 lesionados, e nenhum dos dois números existe no JSON, no texto ou na prova.
  - **correção:** Declarar os dois lados: n = "2.296 de minutagem baixa e 436 de minutagem alta, com ponte", e acrescentar marcadores para 436 e 29 em "numeros" e o denominador no bloco lesao do resumo.
- **outro** (3/3) em `o_que_vimos` — O "o que vimos" tem 4 frases; a regra da casa é no máximo 3.
  - **correção:** Fundir as frases 2 e 3, ou cortar a frase 3, que é a que não carrega número e é justamente a que afirma mais do que o teste mede.
- **outro** (2/3) em `prova` — A ponte com o Transfermarkt casa por nome + ano SEM o clube, ao contrário do que o próprio script documenta, e atribui id de outro clube em 81 linhas — adivinhação que o CLAUDE.md proíbe.
  - **correção:** Pôr o clube na chave da ponte (com T01_ponte_clubes.json, que já existe) e mandar para a lista de ambíguos quem só casar por nome; ou, no mínimo, corrigir o docstring e declarar na prova que 3% das linhas casadas podem estar com a ficha de lesão de outro jogador.

### J01-3  (8 confirmados)

- **prova_nao_sustenta** (3/3) em `manchete + para_o_santa_cruz` — A prova e uma CONTAGEM de quantos jogadores passam de 60% de fatia por clube-temporada; dela nao se deduz nada sobre a QUALIDADE de quem jogou muito num time rebaixado, que e exatamente do que trata a ressalva da falta de opcao.
  - **correção:** A manchete tem de cair para o que foi medido: 'Quem cai espalha os minutos: 45 jogadores por temporada contra 37 de quem sobe'. Tirar 'a ressalva da falta de opcao se inverte' e refazer o para_o_santa_cruz: a contagem nao autoriza dizer que minutagem alta em time rebaixado e 'sinal mais forte'. Se a frase for mantida, ela precisa de J03 (tecnico por posicao) ligando fatia alta no Cai a percentil bom.
- **confianca_alta_demais** (3/3) em `confianca + confianca_motivo` — 'provavel' exige passar em UM dos dois criterios (BH por familia ou porta temporal). O confianca_motivo nao cita nenhum dos dois, e J01 nao rodou teste nenhum: nao ha J01_testes.csv, nem q, nem porta temporal, nem poder, nem posto dentro da temporada.
  - **correção:** Rebaixar para 'indicio', com a frase dizendo por que (contagem descritiva, sem teste, sem porta temporal). Alternativa: rodar o metodo da casa e reportar. Eu rodei: no posto dentro da temporada, Cai x Meio da d=-0,87 p=0,0007 (com fronteira) e d=-1,07 p=0,0002 (sem), dmin80 = 0,73/0,86 — isso sustentaria 'provavel', mas so depois de estar no arquivo.
- **n_errado** (3/3) em `n ("100 clube-temporadas")` — O n nao bate com as linhas usadas e fura a definicao fixa de temporada: as contagens rodaram sobre 99 clube-temporadas (19 Sobe + 60 Meio + 20 Cai), e 20 delas sao de 2026, temporada EM ANDAMENTO (27 de 38 rodadas), cuja faixa e um retrato provisorio.
  - **correção:** Rodar o recorte 2022-2025 e publicar esses valores, com n por marcador = 80 clube-temporadas; 2026 entra a parte, como teste, se a parte quiser mostra-lo.
- **numero_errado** (3/3) em `o_que_vimos, marcador {sobe_altos}` — O 7,1 de quem sobe foi calculado sobre 19 clube-temporadas do Sobe, e nao 20: o Athletico-PR de 2025 (que subiu) some do calculo por divergencia de nome entre as bases, e some so do lado do Sobe.
  - **correção:** {sobe_altos} = 6,9. A diferenca Sobe-Cai cai de 3,0 para 2,8 (e para 2,6 no recorte 2022-2025).
- **marcador_sem_valor** (3/3) em `o_que_vimos e n` — Tres numeros digitados a mao, sem marcador, contra a regra 'nenhum numero e digitado a mao': '25,5', '22,0' e o '100' do campo n. Alem disso {cai_altos} (4,1, jogadores de fatia alta) e usado numa frase sobre atletas rastreados, onde nao cabe.
  - **correção:** Criar marcadores com valor em numeros (ex.: {at_c}, {at_m}, {n_ct}) ou tirar a frase. E o n vira marcador, com o numero de clube-temporadas realmente usadas.
- **fronteira** (3/3) em `confianca_motivo / prova` — Comparacao entre faixas sem o corte de robustez: J01 nunca roda sem os times de fronteira, como o CLAUDE.md exige de toda comparacao entre faixas. Quando se roda, a perna do Sobe morre.
  - **correção:** A frase pode citar Cai contra Meio; o 7,1 do Sobe e dependente do corte e tem de sair da comparacao ou vir marcado como tal, junto com o aviso de que em uma das quatro temporadas completas (2024) a diferenca desaparece.
- **consequencia_como_caracteristica** (3/3) em `o_que_vimos ("porque roda mais") e para_o_santa_cruz ("isso dilui a minutagem de todos")` — 'Tem menos jogadores de fatia alta' e 'roda mais' nao sao um fato e a sua explicacao: sao duas leituras do mesmo numero, porque a soma das fatias de cada clube-temporada e fixa por construcao. E a direcao causal e afirmada no para_o_santa_cruz depois de o confianca_motivo admitir que ela nao e separavel.
  - **correção:** Trocar a contagem de fatias altas pelo tamanho do elenco usado (45,0 no Cai contra 37,5 no Meio e 35,6 no Sobe), que e a mesma coisa dita sem parecer explicacao, e levar para o texto do leitor a ressalva de direcao que hoje so aparece no confianca_motivo (pode ser efeito de ir mal, nao causa).
- **outro** (3/3) em `o_que_vimos` — Quatro frases, contra o limite de tres — e a terceira ficou pela metade, com reticencias e uma auto-correcao de rascunho ('contra... na verdade'), publicada assim na tela.
  - **correção:** Reescrever em ate 3 frases, sem reticencias, sem 'na verdade' e sem citar o CLAUDE.md; se a ponte com o A07 ficar, ela vira marcador com valor e diz que sao atletas rastreados pelo SkillCorner (22-25), populacao diferente do elenco usado no Wyscout (37-45).

### J02-1  (4 confirmados)

- **excesso_de_alcance** (2/3) em `para_o_santa_cruz` — "E explica por que o perfil de jogo do clube nao segue o treinador (T03) — o elenco tambem nao segue" e linguagem de causa sobre um mecanismo que o J02 nao mediu, e aponta para o lado contrario do T03.
  - **correção:** Apagar a clausula. Se ficar, tem de virar pergunta em aberto, sem "explica": "o elenco tambem se refaz todo ano; se isso tem relacao com a estabilidade de perfil do T03, o estudo ainda nao mediu".
- **marcador_sem_valor** (2/3) em `manchete` — "Sete de cada dez" e numero digitado a mao, por extenso, sem marcador — e nao existe chave em "numeros" para o nivel geral.
  - **correção:** Criar em "numeros" a chave do nivel geral (ex.: contr_geral = 69.9, ou o par que forma "{a} em cada {b}") e escrever a manchete com marcador.
- **n_errado** (3/3) em `n` — Falta um clube-temporada de quem sobe, perdido por divergencia de nome de clube, e a prova registra zero exclusoes — o n virou 79 sem motivo declarado.
  - **correção:** Aplicar T01_ponte_clubes.json tambem no lado da minutagem, registrar Athletico-PR 2025 em fora_por_cobertura e declarar no campo n "79 de 80 clube-temporadas", com o motivo da que saiu.
- **outro** (2/3) em `o_que_vimos` — "O elenco da Serie B se refaz praticamente inteiro todo ano" exagera e briga com o numero da propria frase.
  - **correção:** "O elenco da Serie B se refaz em cerca de dois tercos dos minutos todo ano".

### J02-2  (7 confirmados)

- **consequencia_como_caracteristica** (3/3) em `para_o_santa_cruz` — A continuidade de elenco está na lista fixa de consequência do resultado, então não pode sustentar a afirmação de característica que a conclusão faz — e a premissa da parte que diz o contrário é falsa contra o arquivo que ela cita.
  - **correção:** A continuidade entra como descrição, com a marca de consequência, exatamente como J02-3 fez com a régua I. "Continuidade de elenco não é caminho de acesso na Série B" tem de cair: o motivo da própria lista ("permanência depende de como foi o ano") é a direção contrária da que a frase infere.
- **prova_nao_sustenta** (2/3) em `manchete` — "— mantém menos" afirma uma diferença invertida que nenhum dos dois cortes mede; a prova citada diz "sem diferença clara" nos dois.
  - **correção:** "Manter a base do ano anterior não aparece como vantagem de quem sobe" — e parar aí. A segunda metade da manchete não tem teste atrás.
- **confianca_alta_demais** (3/3) em `confianca` — "provável" exige passar em um dos dois critérios; esta conclusão não passa em nenhum, e o confianca_motivo não menciona nenhum dos dois.
  - **correção:** Rebaixar para indício, com a frase dizendo por quê: não passa na correção para múltiplos testes e não tem versão por turno para conferir se vem antes do resultado.
- **poder_nao_calculado** (2/3) em `confianca` — A negativa é dita sem o poder, que foi calculado e diz que o desenho não pegaria a vantagem que ela declara ausente.
  - **correção:** Acrescentar o número: "o desenho só pegaria diferença de d >= 0,84 — não dá para dizer que não existe, só que não apareceu".
- **palavra_proibida** (3/3) em `o_que_vimos` — A terceira frase usa duas palavras da lista proibida e põe número em d e em q dentro do que vimos.
  - **correção:** Tirar a frase inteira do que vimos e levar d e q para a prova. Se algo tiver de ficar, em português de reunião: "a diferença cabe dentro do que o acaso produz numa amostra deste tamanho".
- **n_errado** (3/3) em `n` — O n declarado é o da base inteira da parte, não o das linhas que o teste desta conclusão usou.
  - **correção:** "15 que subiram contra 48 do meio (7 contra 32 sem os times de fronteira)".
- **outro** (2/3) em `n` — Falta um dos 16 clube-temporadas do Sobe, e o descarte não está registrado em lugar nenhum — o resumo afirma que nada caiu por cobertura.
  - **correção:** Registrar Athletico-PR 2025 em fora_por_cobertura e dizer que o Sobe são 15 de 16 clube-temporadas onde a conclusão fala de quem sobe.

### J02-3  (6 confirmados)

- **excesso_de_alcance** (3/3) em `manchete` — A manchete afirma um superlativo entre faixas ("o que menos mantém") que nunca foi testado, e que se inverte contra a Sobe no corte sem fronteira.
  - **correção:** Trocar o superlativo pela comparação que foi de fato medida: "Quem cai mantém menos que o meio da tabela e roda mais". "O que menos mantém" tem de cair — contra a Sobe a diferença não existe e muda de sinal entre os cortes.
- **prova_nao_sustenta** (3/3) em `para_o_santa_cruz` — "e ele aparece cedo" não é medido em lugar nenhum do J02 — não há recorte por rodada nem porta temporal.
  - **correção:** Apagar "e ele aparece cedo". Se a afirmação interessa, é outra análise: atletas_usados/share_11 por turno, com o 1º turno prevendo a faixa final (a porta temporal do A13).
- **palavra_proibida** (3/3) em `o_que_vimos` — O que vimos usa "d" e "q" (duas vezes cada) e traz números em d e em q, que a regra de linguagem proíbe fora da prova.
  - **correção:** Retirar as quatro citações do que vimos e deixá-las no confianca_motivo/prova. O que vimos fica só com as unidades de jogo, que já estão lá: 47 atletas contra 38, 30,5 contra 27, 60,2% contra 63,1%, 24,1% contra 32,3%.
- **numero_errado** (3/3) em `o_que_vimos` — Os valores brutos vêm do corte COM fronteira e os d/q colados a eles vêm do corte SEM fronteira, sem que o texto diga isso.
  - **correção:** Se os brutos são do corte com fronteira, os pares certos são d -1,108 / q 0,00268 (atletas) e d -0,670 / q 0,03038 (continuidade). Como a regra manda tirar d e q do que vimos, o conserto natural é deixar só os brutos e declarar o corte no confianca_motivo.
- **n_errado** (2/3) em `n` — O n declarado (16 contra 48) é o do corte com fronteira, mas os d e q citados no texto foram calculados com 12 contra 32.
  - **correção:** Declarar os dois n, um por corte, e por marcador com valor em "numeros" (ex.: "{n_cai} rebaixados contra {n_meio} do meio; sem os times de fronteira, {n_cai_sem} contra {n_meio_sem}").
- **outro** (3/3) em `para_o_santa_cruz` — Quatro números digitados à mão, sem marcador e sem valor em "numeros", contra a regra de que nenhum número é escrito à mão.
  - **correção:** Criar marcadores próprios no J02 (ex.: {a07_at_c}, {a07_at_m}, {j01_cai_altos}, {j01_sobe_altos}) com os valores copiados para "numeros" — é o que o gerador da aba confere.

### J03-1  (9 confirmados)

- **poder_nao_calculado** (3/3) em `confianca` — O d minimo foi calculado contando jogador-temporada como unidade independente; pela unidade da casa (clube) o desenho so enxerga efeito grande, e 0,58 ja nao e "efeito medio".
  - **correção:** confianca_motivo: "Os minimos detectaveis ficam entre 0,82 e 1,00 contando clube-temporada, que e a unidade da casa — o desenho so veria diferenca grande, e nao viu nenhuma fora do gol." Com isso a confianca cai de firme.
- **excesso_de_alcance** (3/3) em `manchete` — "tecnicamente indistinguivel" transforma "nao separa" em "nao existe diferenca", e e desmentida pela propria parte no goleiro.
  - **correção:** Manchete do tipo: "Fora do gol, nao achamos diferenca tecnica grande entre o titular de quem sobe e o do meio" — e o o_que_vimos tem de dizer que o desenho so enxergaria diferenca grande.
- **fronteira** (3/3) em `confianca` — A comparacao entre faixas nunca rodou sem os times de fronteira, e "firme" exige firme nos dois cortes.
  - **correção:** Rodar os dois cortes e reportar {firmes} em cada um. Enquanto so um corte existe, a confianca e no maximo "provavel", e a frase tem de dizer de que corte os numeros saem.
- **n_errado** (3/3) em `n` — O n declarado (907) inclui 184 titulares de times do Cai, que nao entram em nenhum dos 84 testes.
  - **correção:** n: "723 titulares — 179 de quem sobe contra 544 do meio — em 7 setores", com um marcador novo (ex.: {n_usado}) em numeros. Se 907 for mantido, tem de ser dito que e a base antes do recorte Sobe x Meio.
- **excesso_de_alcance** (3/3) em `para_o_santa_cruz` — "Nao existe 'jogador de time que sobe'" e o veto a J05/J06 sao prescricao dura em cima de um nulo subpotente, e contradizem o uso pratico da J03-3 no mesmo arquivo.
  - **correção:** "O perfil tecnico individual nao e o que separa quem subiu: em 6 dos 7 setores nao achamos diferenca grande. J05 e J06 podem exigir minutagem e o requisito do gol, mas nao devem pedir superioridade tecnica geral — este desenho nao veria diferenca menor que a faixa 0,82-1,00."
- **prova_nao_sustenta** (3/3) em `o_que_vimos` — O texto diz que o percentil e "dentro da posicao e da temporada", mas o codigo normaliza dentro do SETOR — e pela normalizacao declarada a frase "lateral: zero em 12" cai.
  - **correção:** Ou trocar a frase para "no percentil dentro do setor e da temporada" e registrar a troca como emenda datada em J03_indicadores.json, ou rodar pela posicao declarada — nos dois casos, "zero em 12 cada" tem de ser recontado, porque o lateral deixa de ser zero.
- **confianca_alta_demais** (3/3) em `confianca` — O confianca_motivo nao mostra nenhum dos dois criterios de "firme": nao cita o BH por familia nem a porta temporal, que nao rodou.
  - **correção:** confianca_motivo tem de dizer: BH rodado por familia de 4 dentro de cada setor; porta temporal nao roda nesta base (serieb_tecnico.csv nao tem jogo a jogo); poder por clube 0,82-1,00. Com so um dos dois criterios, a regra 1 da "provavel", nao "firme".
- **marcador_sem_valor** (3/3) em `o_que_vimos` — O numero 12 aparece duas vezes digitado a mao, sem marcador e sem valor em "numeros" (o outro lado da mesma regra 4).
  - **correção:** Criar {n_ind_setor}: 12 em numeros (len dos indicadores das 3 familias) e usa-lo nas duas frases.
- **prova_nao_sustenta** (3/3) em `prova` — A prova citada nao contem os dois itens de que o selo "firme" depende — o corte sem fronteira e o IC por clube — e a prova por extenso da parte nao existe.
  - **correção:** Gerar J03.md e regerar J03_testes.csv pelo _metodo.comparar, com a coluna fronteira (com e sem) e ic95_d por bootstrap de clube, antes de qualquer selo "firme".

### J03-2  (11 confirmados)

- **fronteira** (2/3) em `o_que_vimos` — O corte sem os times de fronteira nunca foi rodado em J03, e quando se roda a frase 'nenhum passa no criterio' deixa de valer: o goleiro passa.
  - **correção:** Rodar os dois cortes. Como o achado (o negativo) so vale no corte COM fronteira, 'firme' cai; no maximo 'indicio', e a frase tem de dizer que o goleiro inverte o sinal e passa quando se tiram os times de fronteira.
- **numero_errado** (3/3) em `o_que_vimos` — O d de 1,59 atribuido ao A06 e o numero do corte SEM fronteira — exatamente o erro que _metodo_fronteira.md documenta. O valor que sobrevive aos dois cortes e 0,805.
  - **correção:** Usar 0,805 (o corte com fronteira), com a ressalva de que o IC vai de 0,18 a 1,52 e o poder e insuficiente. Com 0,805 o contraste com o titular (ate 0,535) praticamente desaparece.
- **prova_nao_sustenta** (3/3) em `o_que_vimos` — 'o maior separador do estudo no nivel do time' e falso nos dois cortes.
  - **correção:** Tirar 'o maior separador do estudo'. No corte que vale, o duelo defensivo empata com xg_por_remate_contra (0,805 os dois) e fica atras de dist_remate e do saldo de bola parada.
- **numero_errado** (3/3) em `para_o_santa_cruz` — 'cerca de dois pontos percentuais' e numero digitado a mao, sem marcador e sem valor em `numeros`, e dobra o numero robusto.
  - **correção:** Marcador com valor em `numeros`, e o valor do corte robusto: cerca de um ponto percentual (0,98 pp).
- **n_errado** (3/3) em `n` — O n declarado (907 titulares) nao e o n que o teste usou: 184 desses titulares sao de times do Cai e nunca entraram em teste nenhum.
  - **correção:** n = 723 titulares (179 de quem sobe contra 544 do meio), em 7 setores. Criar o marcador correspondente em `numeros`.
- **n_errado** (3/3) em `n` — '80 clube-temporadas no A06' e numero a mao e e o tamanho da base, nao o do teste que produziu o d citado.
  - **correção:** Declarar 64 clube-temporadas (16 contra 48) se o numero usado for o do corte com fronteira, por marcador.
- **confianca_alta_demais** (3/3) em `confianca` — 'firme' sem nenhum dos dois criterios: o confianca_motivo nao mostra BH por familia nem porta temporal, e J03 nao roda porta temporal nenhuma.
  - **correção:** Rebaixar para indicio enquanto nao houver porta temporal no nivel do jogador e os dois cortes de fronteira; o motivo tem de citar os dois criterios explicitamente.
- **prova_nao_sustenta** (3/3) em `manchete` — 'separa o time, mas nao o jogador' e diferenca de significancia, nao significancia da diferenca: os intervalos se sobrepoem. Falta o IC por clube que a regra 7 exige.
  - **correção:** Ou publicar o IC por clube de cada setor e admitir que time e jogador nao se distinguem, ou reescrever a manchete sem a oposicao (ex.: 'o duelo defensivo aparece no time e some quando se olha posicao por posicao, mas a amostra nao decide').
- **palavra_proibida** (3/3) em `o_que_vimos` — A palavra 'd' aparece duas vezes e quatro numeros estao em unidade de d, que a regra proibe no 'o que vimos'.
  - **correção:** Reescrever so com unidade de jogo (pontos percentuais de duelo ganho por setor) e deixar todo d na prova e no confianca_motivo.
- **outro** (2/3) em `o_que_vimos` — Quatro frases onde o maximo sao tres.
  - **correção:** Cortar para tres frases.
- **excesso_de_alcance** (2/3) em `para_o_santa_cruz` — 'O duelo nao se compra: organiza-se' e 'espalhados pelo elenco inteiro' afirmam mecanismo e cobertura que nem J03 nem A06 mediram.
  - **correção:** Trocar por associacao e pelo que foi medido: 'entre os titulares, nenhuma posicao isolada mostra vantagem de duelo grande o bastante para virar requisito — o que nao prova que a vantagem do time venha de organizacao'.

### J03-3  (7 confirmados)

- **fronteira** (3/3) em `confianca` — J03 nunca rodou o corte sem os times de fronteira, e quando eu rodo o achado do goleiro nao se reproduz.
  - **correção:** Rodar os dois cortes e reportar os dois. Como o achado so aparece com os times de fronteira, o _metodo_fronteira.md (item 3) e o CLAUDE.md mandam descartar; no maximo vira indicio, e a frase tem de dizer que o corte sem fronteira deixa 8 goleiros de quem sobe (d minimo 1,14) e nao reproduz o efeito.
- **prova_nao_sustenta** (3/3) em `o_que_vimos` — Em unidade de jogo os dois goleiros ganham o mesmo numero de duelos aereos; os 97,9% contra 87,9% sao 1,4 duelo perdido a menos por temporada.
  - **correção:** Trocar o percentual pelo numero de jogo, como o CLAUDE.md exige: 'o goleiro de quem sobe perde cerca de 1 duelo aereo a menos por temporada — ganha os mesmos ~15'. Dito assim a frase deixa de ser 'o maior efeito individual do estudo'.
- **excesso_de_alcance** (3/3) em `manchete` — A manchete diz 'a unica posicao' e a propria segunda frase da conclusao nomeia outra posicao que passou.
  - **correção:** 'O goleiro e onde o titular de quem sobe mais se destaca' — e dizer que no mesmo setor ele aparece abaixo do meio em interceces e em duelo defensivo.
- **prova_nao_sustenta** (3/3) em `para_o_santa_cruz` — 'a metrica e a bola aerea disputada, nao a defesa' afirma um negativo sobre algo que o estudo nunca mediu.
  - **correção:** Tirar 'nao a defesa'. O que o estudo pode dizer e que nenhuma metrica de goleiro foi testada — e registrar isso em em_aberto, porque a base as tem.
- **palavra_proibida** (3/3) em `o_que_vimos` — Palavras e unidades proibidas na camada de leitura: 'd', 'q' e 'percentil'.
  - **correção:** Deixar so a unidade de jogo no o_que_vimos e mover d, q e percentil para o confianca_motivo/prova.
- **marcador_sem_valor** (2/3) em `o_que_vimos` — 'percentil 71 contra 35' sao numeros digitados a mao, sem marcador e sem valor em 'numeros'.
  - **correção:** Como a linha tem de sair por ser percentil, o problema se resolve removendo-a; se ficar em algum lugar, criar {gk_pct_s} e {gk_pct_m} em 'numeros'.
- **marcador_sem_valor** (2/3) em `n` — O campo n e inteiramente digitado a mao, ao contrario das outras duas conclusoes da mesma parte.
  - **correção:** Criar {gk_n_s} e {gk_n_m} em 'numeros' e escrever '{gk_n_s} goleiros contra {gk_n_m}'.

### J07-1  (9 confirmados)

- **numero_errado** (3/3) em `o_que_vimos` — O casamento de nacionalidade quebra para todo jogador cujo nome no Wyscout vem abreviado ("M. Villasanti"), e o Wyscout abrevia justamente o estrangeiro. Os 12 numeros do o_que_vimos e do n estao todos subestimados por um fator de 2 a 8.
  - **correção:** pct_jog_min/max 0,3–3,7 -> 2,3–10,3; pct_min_min/max 0,1–4,2 -> 1,0–10,2; clubes_min/max 2–10 -> 12–19; sobe_min 4,3 -> 10,7; meio_min 1,0 -> 3,8; cai_min 2,2 -> 4,4; sobe_por 1,1 -> 3,7; meio_por 0,4 -> 1,8; sobe_n 17 -> 59; total_est 57 -> 215 (177 em 2022-2025). Refazer o cruzamento pelo modulo de identidade da ESPECIFICACAO.md §1.1 (chave_nome + janela de idade + descarte de ambiguo), que J07.py nao usa.
- **prova_nao_sustenta** (3/3) em `manchete` — "O clube pode usar nove estrangeiros e usa um" e falso. A liga usa 2,2 por clube-temporada, e a maioria dos clubes ja usa pelo menos um. A premissa da conclusao inteira e artefato do casamento quebrado.
  - **correção:** A manchete tem de cair ou mudar de sentido. O numero certo e "usa dois", com marcador, e a frase da liga passa a ser "quase todo clube ja usa".
- **prova_nao_sustenta** (3/3) em `para_o_santa_cruz` — "A vaga de estrangeiro esta sobrando na liga inteira, e e o recurso mais subusado do mercado (...) ha espaco de arbitragem" nao se sustenta na base corrigida — e "mais subusado do mercado" e um superlativo que J07 nunca mediu contra recurso nenhum.
  - **correção:** Tirar "esta sobrando", "o recurso mais subusado do mercado" e "espaco de arbitragem". O uso pratico que a base sustenta e outro: o mercado vizinho ja esta precificado pela liga, e J08/J09 servem para escolher melhor dentro dele, nao para explorar uma vaga vazia.
- **n_errado** (3/3) em `prova` — Athletico-PR 2025 — 2o colocado, faixa Sobe, 36 jogador-temporadas — esta inteiramente fora do grupo Sobe. A ponte de clube e aplicada no sentido errado e o clube-temporada some da faixa e da nacionalidade ao mesmo tempo.
  - **correção:** Casar pelos dois sentidos da ponte. Com Athletico-PR dentro, Sobe = 16 clube-temporadas e o grupo passa a ser o caso mais estrangeiro da amostra inteira, nao um buraco.
- **marcador_sem_valor** (2/3) em `manchete` — Tres numeros digitados a mao na manchete — "nove", "um" e "quatro vezes" — nenhum por marcador, nenhum com valor no campo "numeros".
  - **correção:** Criar vagas_estrangeiro, liga_por_ct e razao_sobe_meio em "numeros" e escrever a manchete com {}.
- **prova_nao_sustenta** (3/3) em `o_que_vimos` — Os 4,3% da Sobe sao dois clubes, nao uma caracteristica da faixa: Santos 2024 e Remo 2025 carregam 11 dos 17 estrangeiros, e 9 das 15 clube-temporadas contadas tinham zero.
  - **correção:** A frase tem de dizer em quantas clube-temporadas o padrao aparece. Corrigido o casamento a concentracao afrouxa (13 das 16 tem algum), mas a frase publicada descreve uma amostra que nao existe.
- **fronteira** (2/3) em `prova` — E uma comparacao entre faixas (Sobe x Meio x Cai) e o corte sem os times de fronteira nunca foi rodado, embora o CLAUDE.md mande rodar sempre e o _metodo_fronteira.md tenha sido escrito nesta mesma sessao por causa disso.
  - **correção:** Publicar os dois cortes. A direcao sobrevive, entao isto nao derruba a conclusao — mas sem o corte ela tambem nao pode subir de "indicio".
- **n_errado** (2/3) em `n` — O n declarado nao bate com as linhas que a conclusao usa, em duas contas ao mesmo tempo: temporadas a mais e pessoas a menos.
  - **correção:** n do J07-1 = "44 clube-temporadas de estrangeiro, 2022-2025" (177 depois do conserto), nao 57 em 5 temporadas.
- **outro** (2/3) em `prova` — A fatia de minutos e somada crua entre 2022 e 2025, contra a regra "posto dentro da temporada, nunca numero bruto entre anos" — e o ano manda muito: em 2023 a direcao se inverte.
  - **correção:** Reportar por temporada, ou pelo posto dentro do ano, e dizer que em uma das quatro temporadas quem subiu usou menos que o meio.

### J07-2  (5 confirmados)

- **excesso_de_alcance** (3/3) em `para_o_santa_cruz` — A frase "O risco nao e adaptacao ao jogo" nega um risco que esta parte nao mediu em lugar nenhum.
  - **correção:** Cortar a frase, ou trocar por: "Sobre o rendimento dentro de campo esta parte nao diz nada - ela so mede quanto ele jogou."
- **numero_errado** (3/3) em `o_que_vimos` — perm_est e perm_br estao deprimidos por um buraco de cobertura: quem ficou mas nao casou com o Transfermarkt no ano seguinte foi contado como saida.
  - **correção:** perm_est = 29,5 e perm_br = 50,7 (alvo = todas as linhas da base); ou dizer na prova que a medida e "seguiu na Serie B e foi reencontrado na base de elencos".
- **excesso_de_alcance** (3/3) em `manchete` — "o brasileiro que chega" nao e o grupo medido: o comparativo e todo brasileiro que estreia na janela, incluindo moleque de base e fim de banco.
  - **correção:** Refazer os dois grupos com `no_clube_desde`, ou escrever "o brasileiro que estreia na Serie B" na manchete e no o_que_vimos.
- **n_errado** (2/3) em `n` — O n declarado (44) cobre so a segunda das tres frases, e dentro do texto ele aparece colado tambem ao numero do brasileiro, que tem n 60 vezes maior.
  - **correção:** Um n por frase: 40 x 1.472 na primeira, 44 x 2.657 na segunda, 6 a 12 por posicao na terceira.
- **prova_nao_sustenta** (3/3) em `o_que_vimos` — A terceira frase ("menos no volante e na zaga") sai de 6 e 7 casos, exatamente o tamanho de amostra que a parte usou para recusar outra analise.
  - **correção:** Dizer o n de cada posicao e que sao punhados de casos, ou tirar a frase e deixa-la na prova.

### J07-3  (8 confirmados)

- **n_errado** (3/3) em `n` — O cruzamento de nomes derruba 72% dos estrangeiros: o estudo conta 57 linhas quando a base tem ~204, porque a base de minutos escreve o nome abreviado ("J. Quintero") e a de elencos escreve inteiro ("Juan Quintero"), e J07.py casa por nome exato.
  - **correção:** {total_est} = ~204 linhas de jogador-temporada (166 nas quatro temporadas fechadas), nao 57 — e a parte tem de rodar de novo com o casamento corrigido antes de qualquer frase sobre composicao.
- **prova_nao_sustenta** (3/3) em `manchete` — A segunda metade da manchete ("o passaporte europeu e usado ao contrario") cai: o contraste 40 dupla-nacionalidade contra 11 estrangeiros vira 41 contra 41 quando os dois lados sao contados no mesmo cruzamento corrigido.
  - **correção:** Tirar a segunda oracao da manchete e a segunda frase do "o que vimos", ou reescreve-las com os dois lados no mesmo cruzamento: passaporte europeu de descendente e estrangeiro de fato aparecem em numero parecido.
- **confianca_alta_demais** (3/3) em `confianca` — "Firme" sem nenhum dos dois criterios: nao ha correcao para multiplos testes nem porta temporal, e a propria parte se declara descritiva.
  - **correção:** confianca = "indicio", com a frase dizendo por que (contagem descritiva, sem teste, e dependente de um cruzamento de nomes incompleto).
- **numero_errado** (2/3) em `o_que_vimos` — {sulamer}=40 nao fecha nem com a tabela que a propria conclusao cita como prova: a soma dos sul-americanos ali e 41.
  - **correção:** 41 sobre a base atual; ~179 de 204 (88%) com o cruzamento corrigido.
- **numero_errado** (3/3) em `o_que_vimos` — A ordem dos paises esta invertida e o quarto mercado real some: nao e Colombia > Argentina > Uruguai, e o Paraguai e tres vezes maior que Portugal.
  - **correção:** {col}/{arg}/{uru} recalculados e a ordem trocada (Argentina, Uruguai, Colombia), com Paraguai citado entre os vizinhos em "para o Santa Cruz".
- **excesso_de_alcance** (3/3) em `para_o_santa_cruz` — "Europa nao e o mercado — nem de saida nem de entrada" afirma duas coisas que o estudo nao mediu, e a de entrada e contrariada pela propria base.
  - **correção:** Cortar "nem de saida nem de entrada". No maximo: a maioria dos estrangeiros e sul-americana, mas boa parte chega de clube brasileiro e uma parcela chega da Europa.
- **n_errado** (3/3) em `n` — O n conta jogador-temporada e o texto le como pessoas; na base atual sao 41 pessoas para 57 linhas, e a repeticao muda a composicao.
  - **correção:** Dizer a unidade no n ("X jogador-temporadas, Y jogadores") e fazer a contagem de origem por pessoa, que e o que a pergunta do CLAUDE.md pede ("quantos estrangeiros jogaram a Serie B").
- **porta_temporal** (3/3) em `confianca` — "Contagem completa das cinco temporadas" e falso duas vezes: 2026 esta em andamento e nao entra em conclusao, e 18,3% das linhas ficaram sem nacionalidade — perda que nao e aleatoria.
  - **correção:** Recalcular so com 2022-2025 e trocar "contagem completa" por "contagem incompleta, com o cruzamento de nome falhando mais no estrangeiro".

### T01-1  (6 confirmados)

- **numero_errado** (3/3) em `manchete` — "Troca de treinador duas vezes por ano" dobra a rotatividade que o proprio texto mede: dois treinadores efetivos por clube-temporada sao UMA troca, nao duas.
  - **correção:** "Time da Serie B tem dois treinadores por ano" ou "troca de treinador uma vez por ano" (mediana 1 troca, media 1,3 nas temporadas fechadas). O "para o Santa Cruz" ("contratar duas vezes") so fica de pe lido como duas contratacoes, que e a mesma coisa que uma troca.
- **n_errado** (3/3) em `n` — O n de 188 clube-temporadas esta inflado: a temporada foi tirada do ANO DA DATA do jogo, que e exatamente a armadilha registrada em A01. Nove temporadas x 20 clubes = 180.
  - **correção:** n = 180 clube-temporadas (2018-2026), ou 160 se a contagem se limitar as temporadas fechadas.
- **numero_errado** (3/3) em `o_que_vimos` — Os 54 de 188 (29%) com um treinador so estao inflados por duas vias: as 8 clube-temporadas fantasmas de 6-7 rodadas e a temporada de 2026 em curso, com so 27 das 38 rodadas jogadas e metade dos clubes ainda com o treinador do inicio.
  - **correção:** um_efetivo_so = 39 de 160 e pct = 24 nas temporadas fechadas; a manchete vira "so 2 em cada 10 terminam a temporada com quem comecou" (conferido: 40 de 160 = 25,0% terminam com quem comecou). Temporada em curso nao entra numa conta por temporada, ou entra a parte.
- **prova_nao_sustenta** (2/3) em `o_que_vimos` — A frase "um treinador so comandou o ano inteiro" e falsa para pelo menos 13 dos 54 casos contados: uns nao tem ano inteiro (fragmentos de 6-7 rodadas) e outros tem rodadas sem dono conhecido.
  - **correção:** Contar so clube-temporadas com cobertura exata (159 das 188 pela chave atual), ou dizer que 54 e teto: onde ha buraco, o treinador que falta nao entra na conta.
- **marcador_sem_valor** (3/3) em `manchete` — Os dois numeros da manchete estao digitados a mao, sem marcador e sem valor em "numeros" — a regra de nenhum numero digitado a mao foi quebrada no campo mais lido.
  - **correção:** Criar os campos em "numeros" (ex.: {trocas_medianas}, {termina_com_quem_comecou_em_10}), calculados no script, e usa-los na manchete. O gerador so para em marcador sem valor, nao em numero digitado a mao.
- **confianca_alta_demais** (2/3) em `confianca` — O "firme" se apoia inteiramente em "contagem completa dos nove anos", e a contagem nao e completa nem esta na unidade certa.
  - **correção:** "provavel": contagem quase completa (159 de 180 clube-temporadas com a conta exata), fonte unica nao conferida contra terceiro. Ou manter "firme (contagem)" so depois de corrigir a temporada e fechar os 29 buracos.

### T01-2  (4 confirmados)

- **excesso_de_alcance** (3/3) em `para_o_santa_cruz` — A frase promete a T03 uma amostra de 29 treinadores, mas dentro da janela em que T03 consegue rodar (2022-2025) sobram 14.
  - **correção:** Dar o número da janela do estudo: 'há 14 treinadores com passagem de 10 rodadas ou mais em três clubes ou mais dentro de 2022-2025, que é onde T03 tem régua técnica e física; em 2018-2026 são 29.'
- **numero_errado** (3/3) em `o_que_vimos` — Marcelo Cabo aparece com seis clubes; pelo critério que produziu o 29 ele tem sete, e Guto Ferreira (seis) ficou fora da lista de cinco.
  - **correção:** 'Marcelo Cabo, sete' (mesmo critério do 29) — ou dizer explicitamente que a lista de nomes conta só passagens efetivas, e então citar os três empatados em seis.
- **outro** (3/3) em `prova` — A base citada como prova caiu na armadilha já registrada pelo A01: a temporada sai do ano da data.
  - **correção:** O 29 fica; a base tem de ser corrigida antes de T02/T03, que consomem rodada_1a, rodada_ultima e rodadas_no_ano — e o n de 188 clube-temporadas de T01-1 vira 180.
- **prova_nao_sustenta** (3/3) em `confianca` — O motivo 'Contagem completa.' afirma uma completude que a própria parte desmente.
  - **correção:** Manter 'firme', porque os dois desvios só podem somar clubes (o 29 é piso), mas trocar o motivo por: 'contagem quase completa — 62 de 6.608 rodadas ficaram sem treinador conhecido e não houve conferência externa; o número é piso.'

### T01-3  (4 confirmados)

- **n_errado** (3/3) em `n / confianca_motivo` — O n (506 passagens-temporada) e o denominador da cobertura (188 clube-temporadas) estao inflados porque T01 atribui a temporada pelo ANO DA DATA — exatamente a armadilha registrada do A01.
  - **correção:** n = 497 passagens-temporada (506 - 9) e clube_temporadas = 180 (188 - 8), depois de a temporada sair dos blocos de meses com jogo, como em A01.py:blocos_de_temporada. Enquanto o script nao for refeito, o n declarado nao pode ser 506.
- **prova_nao_sustenta** (3/3) em `confianca_motivo` — O '{cobertura_sobra} com jogo contado duas vezes' = 0 e garantido por construcao: nao e uma conferencia que poderia ter falhado.
  - **correção:** Tirar o zero-sobra do motivo da confianca, ou dize-lo como o que e — propriedade do algoritmo, nao evidencia. A prova que falta e a conferencia contra fonte independente, que o proprio T01.md lista como em aberto.
- **outro** (3/3) em `o_que_vimos` — Numero digitado a mao: 'estimando de 250 a 400 passagens' esta no texto em vez de vir por marcador, embora o valor exista em 'numeros'.
  - **correção:** Trocar por {etapa15_estimativa} (ou dois marcadores), como ja se faz com os outros sete numeros da conclusao.
- **excesso_de_alcance** (2/3) em `o_que_vimos` — Poe lado a lado a estimativa de 250-400 e as 506 passagens coletadas sem dizer que sao janelas diferentes — a estimativa era para 100 clube-temporadas, a coleta cobre 188.
  - **correção:** Repor a ressalva da janela no o_que_vimos, ou comparar 276 com 250-400 em vez de 506.

### T02-1  (7 confirmados)

- **confianca_alta_demais** (2/3) em `confianca` — Declarada "firme" sem nenhum dos dois criterios — o proprio confianca_motivo admite que nao houve teste.
  - **correção:** indicio (nao passa em BH nem na porta temporal), com a frase dizendo que e contagem sem teste. So passa a provavel se um dos dois criterios for de fato rodado.
- **prova_nao_sustenta** (3/3) em `o_que_vimos` — O primeiro degrau da escada (34,4% -> 22,5%) esta dentro do ruido: o IC por clube cruza o zero. A escada de tres degraus e o argumento inteiro da manchete, e um dos dois degraus nao existe.
  - **correção:** Tirar o degrau do meio ou dizer que entre o top-5 e o 6o-10o elenco a diferenca nao se distingue do acaso; a unica separacao que o dado mostra e a do 11o para baixo.
- **excesso_de_alcance** (3/3) em `manchete` — "nao o nome do treinador" e uma afirmacao negativa ("treinador nao separa") que nenhum teste desta parte mediu, e sem d minimo calculado.
  - **correção:** "Elenco caro ocupa muito mais o G4 do que elenco barato" — e dizer que esta parte nao mede quanto o treinador soma por cima do elenco, porque isso nao foi testado.
- **numero_errado** (2/3) em `o_que_vimos` — "a maioria dos times de elenco na metade de baixo nao passa uma rodada sequer no G4" e falsa na unidade que a propria frase nomeia (times). A mediana zero so existe porque a contagem e por passagem de treinador, nao por clube-temporada.
  - **correção:** Dizer "passagens", nao "times", e limitar a frase ao grupo do 11o para baixo (26 de 50 clube-temporadas sem uma rodada no G4). Para o 6o-10o a mediana e 15,8%.
- **marcador_sem_valor** (3/3) em `o_que_vimos` — "a mediana e ZERO" e um numero medido escrito a mao, sem marcador e sem valor no campo numeros.
  - **correção:** Acrescentar meio_mediana = 0.0 e baixo_mediana = 0.0 a "numeros" e escrever "a mediana e {meio_mediana}%" (ou, na unidade corrigida por clube-temporada, 15,8 e 0,0).
- **outro** (2/3) em `prova` — A prova citada nao contem os numeros da conclusao, e o script declarado nao os produz — a conclusao principal de T02 nao e reproduzivel pelo caminho que ela declara.
  - **correção:** Pôr o agrupamento por posicao de valor dentro de T02.py e gravar um T02_faixa_valor.csv (ou equivalente), citando-o em "prova" — o CLAUDE.md exige script reproduzivel por parte.
- **outro** (3/3) em `manchete` — "tamanho do elenco" nomeia a coisa errada: o dado e o VALOR de mercado do elenco, nao quantos jogadores ele tem. E "quem manda" e linguagem de causa sobre uma associacao descritiva com confundidor obvio.
  - **correção:** "No G4 o que pesa e o preco do elenco" (ou "o dinheiro do clube"), e sem "quem manda": e associacao, nao causa medida.

### T02-2  (6 confirmados)

- **prova_nao_sustenta** (3/3) em `manchete` — A unicidade é falsa: pelo critério do próprio script, 26 treinadores repetem G4 em clubes diferentes, e dois deles têm %G4 maior que o de Baptista.
  - **correção:** A manchete tem de declarar o critério que realmente separa Baptista (piso entre passagens), não a repetição em si. Algo como "Só um treinador nunca teve um ano ruim no G4 em dois clubes: Eduardo Baptista" — e, mesmo assim, ver os achados de fronteira e de contagem de passagens abaixo.
- **prova_nao_sustenta** (3/3) em `o_que_vimos` — "Todos os outros treinadores estáveis são estáveis em zero" é falso; há pelo menos três multiclube com piso bem acima de zero, nenhum citado.
  - **correção:** Trocar por uma frase conferível, com o critério e os casos próximos: "o segundo piso mais alto é o de Thiago Carpini, 31% em dois clubes" — o que já derruba a força de "um treinador só".
- **excesso_de_alcance** (3/3) em `para_o_santa_cruz` — "Em clube sem dinheiro" é falso para quase metade da amostra: duas das quatro passagens são em elenco do top-8, uma delas no top-5.
  - **correção:** Ou restringir a frase às duas temporadas do Novorizontino (e então o n cai para 76 rodadas, um clube só, e a repetição entre clubes some), ou tirar "em clube sem dinheiro".
- **n_errado** (3/3) em `n` — O n de 134 rodadas inclui 26 rodadas de 2026, que é temporada em curso e com a tabela rodada a rodada marcada como incompleta.
  - **correção:** n = 108 rodadas (2022–2025), com 2026 só como teste; ou manter 134 e dizer na frase que 26 delas são de temporada em curso e com jogo faltando na base.
- **numero_errado** (3/3) em `o_que_vimos` — O ppj e o saldo de xG da frase 3 estão atribuídos ao Novorizontino, mas são os totais das 4 passagens, incluindo o Criciúma.
  - **correção:** Criar marcadores próprios do recorte Novorizontino (ppj 1,67 e saldo de xG 0,56), ou reescrever a frase deixando claro que 1,69 e 0,41 são das quatro passagens.
- **confianca_alta_demais** (3/3) em `confianca` — "Provável" exige passar em um dos dois critérios; esta conclusão não passa em nenhum e ainda é escolha do melhor entre muitos sem o nulo do garimpo.
  - **correção:** Rebaixar para indício, com a frase dizendo por quê (escolha do melhor entre 34 multiclube, 2 contratos, sem porta temporal).

### T02-3  (6 confirmados)

- **confianca_alta_demais** (3/3) em `confianca` — 'firme' sem nenhum dos dois critérios e sem poder, numa conclusão marcada negativa=true, que vai para 'Parece, mas não é'.
  - **correção:** confianca: "indício", com o motivo dizendo por quê — contagem descritiva, sem correção para múltiplos testes, sem porta temporal e sem poder calculado. 'Contagem completa' não é um terceiro caminho para firme: o CLAUDE.md (seção Didática) exige os dois.
- **excesso_de_alcance** (3/3) em `para_o_santa_cruz` — 'é o clube em que ele estava' atribui ao clube uma variação que aparece igual DENTRO do mesmo clube — o desenho não consegue separar clube de temporada.
  - **correção:** Tirar a atribuição ao clube. No máximo: 'o pico não se repete — nem em outro clube, nem no mesmo'. E o exemplo de Mancini não pode sustentar uma frase sobre transferência entre clubes.
- **prova_nao_sustenta** (2/3) em `o_que_vimos` — A amplitude de 50+ pontos não é variação de desempenho: é o efeito de limiar do 4º lugar. Os mesmos nove treinadores variam quase nada em ponto por jogo.
  - **correção:** Dizer no o_que_vimos que %G4 é posição na tabela, não trabalho do treinador, e mostrar a amplitude em ponto por jogo ao lado — que é a unidade de jogo que a Didática pede. Sem isso a frase vende como oscilação do treinador um artefato do corte no 4º lugar e da tabela que ele herdou.
- **numero_errado** (2/3) em `o_que_vimos` — amp_mediana=16,2 vem do jeito de contar que o próprio script chama de ruidoso; pelo segundo jeito, que o CLAUDE.md manda calcular junto, o número é 5,7.
  - **correção:** Publicar os dois cortes ou usar o de 10ª rodada em diante. Uma frase 'firme' não pode depender de qual das duas contagens obrigatórias foi escolhida, e 16,2 contra 5,7 é diferença de quase três vezes.
- **n_errado** (3/3) em `n` — O n=34 inclui 6 técnicos que só existem por causa de 2026, temporada em curso que o CLAUDE.md declara 'só teste' e em que o G4 nem é mais a zona de acesso.
  - **correção:** n = 28 treinadores (2022–2025), com 2026 reportado à parte como teste. E dizer que em 2026 'estar no G4' não significa a mesma coisa que em 2022–2025.
- **numero_errado** (3/3) em `o_que_vimos` — A lista {oscilam} está incompleta pelo critério que a própria frase enuncia: são 7 treinadores, não 6.
  - **correção:** Incluir Claudinei Oliveira ou fechar o critério (ex.: 'acima de 86%'), e acrescentar ao T02.py o trecho que calcula os quatro números, para que o marcador tenha código e não só valor digitado no JSON.

### T03-1  (12 confirmados)

- **prova_nao_sustenta** (3/3) em `o_que_vimos` — A frase central — "a semelhanca entre os proprios perfis e indistinguivel do acaso" — e desmentida pela propria base quando o nulo e calculado com a estrutura certa: o teste correto REJEITA o acaso.
  - **correção:** A conclusao nao se sustenta como esta. Ou vira o contrario ("ha repeticao fraca, mas ela pode ser do calibre de clube que contrata o treinador, nao do treinador"), ou vira uma nao-resposta: "a base nao consegue dizer se o perfil repete". Em nenhum dos casos pode ser "firme".
- **poder_nao_calculado** (3/3) em `confianca` — Conclusao negativa sem poder calculado — e o instrumento nao tem confiabilidade para sustentar um "nao repete". O perfil de 7 tracos nao repete nem consigo mesmo, no mesmo clube e na mesma temporada.
  - **correção:** Calcular e declarar o teto de medida antes de afirmar o negativo. Com teto ~0,31, "nao repete" nao e um achado: e o limite do instrumento. No maximo "indicio", com a frase dizendo que o perfil por passagem e ruidoso demais para responder.
- **numero_errado** (3/3) em `o_que_vimos` — {esperado_por_acaso} = 3,4 esta errado por um fator de 2. Ele foi obtido como 34 x 10%, tratando o rho_medio de cada treinador como um sorteio unico do nulo de pares — mas 19 dos 34 treinadores tem de 2 a 20 pares, e a media de varios pares quase nunca passa de 0,609.
  - **correção:** esperado_por_acaso = 1,7 (e nao 3,4). Com esse valor a propria frase se inverte: 5 observados contra 1,7 esperados nao e "o acaso previa", e o dobro do triplo do acaso.
- **confianca_alta_demais** (3/3) em `confianca` — "firme" declarado sem nenhum dos dois criterios da casa: nao ha correcao de Benjamini-Hochberg por familia e nao ha porta temporal (1o turno prevendo o 2o). O confianca_motivo nao menciona nem um nem outro.
  - **correção:** Sem BH e sem porta temporal, o teto e "indicio" — e, somado ao poder nao calculado e ao teto de medida de 0,31, e onde esta conclusao tem de ficar se sobreviver.
- **palavra_proibida** (3/3) em `o_que_vimos` — A palavra "rho" aparece no o_que_vimos, e todos os numeros da frase sao coeficientes de correlacao — nao ha um unico numero em unidade de jogo.
  - **correção:** Tirar "rho" e os coeficientes do o_que_vimos (eles cabem na prova e no confianca_motivo) e trocar por contagem em unidade de gente de futebol: "de cada 10 treinadores que passaram por dois clubes, X repetiram o perfil".
- **excesso_de_alcance** (3/3) em `para_o_santa_cruz` — "O que ele fez no clube anterior nao e previsao do que fara aqui" afirma o nulo como fato estabelecido — exatamente o "nao separa virou nao existe" que a regra 9 proibe, e ainda por cima contra o que o dado corrigido mostra.
  - **correção:** Trocar por uso pratico honesto: "o perfil do clube anterior e um sinal fraco e medido com muito ruido; nao serve de criterio isolado de contratacao, e o estudo nao separa o que e do treinador do que e do calibre do clube que o contrata".
- **prova_nao_sustenta** (3/3) em `o_que_vimos` — "{n_tracos} tracos do indice do A14" nao e verdade: 2 dos 7 nao pertencem ao indice do A14, e 3 componentes do indice foram deixados de fora sem que o texto diga — o em_aberto so admite 2 exclusoes.
  - **correção:** Dizer 5 tracos do indice do A14 (dist_remate, entradas_area, duelo_def, xg_por_remate, xg_por_remate_contra) mais 2 de fora dele, e listar no em_aberto os tres componentes do indice que cairam — ou refazer com os componentes que o A14 de fato escolheu.
- **n_errado** (2/3) em `n` — O n declarado, "34 treinadores multiclube, 151 passagens", da a entender que os 34 treinadores somam 151 passagens. Somam 115. As 151 sao a base inteira, que so entra no nulo.
  - **correção:** n = "34 treinadores multiclube, 115 passagens deles (base de comparacao: 151); 15 deles tem so um par entre clubes".
- **numero_errado** (3/3) em `confianca` — O confianca_motivo diz "Os quatro que passam tem so duas passagens cada" — mas {n_acima} = 5, e o quinto (Marcio Fernandes) tem 3 passagens. Numero digitado a mao contradizendo o marcador.
  - **correção:** "Os {n_acima} que passam tem 2 ou 3 passagens cada", com os numeros vindo por marcador, como manda a regra 4.
- **outro** (3/3) em `o_que_vimos` — O "o que vimos" tem 4 frases; o maximo da casa e 3.
  - **correção:** Cortar para 3 frases; a lista de nomes (Mozart, Claudinei, Eduardo Baptista) pertence a prova.
- **outro** (3/3) em `o_que_vimos` — A conclusao usa 2026, que esta em andamento e que a regra da casa reserva para teste. E sao justamente as linhas de 2026 que enfraquecem o sinal do treinador.
  - **correção:** Rodar a conclusao em 2022-2025 e mostrar 2026 a parte, como teste — e reportar que, feito assim, o resultado vai na direcao oposta a manchete.
- **outro** (3/3) em `prova` — Nao existe T03.md. A prova por extenso, que a entrega de cada parte exige, nao foi escrita: o campo prova aponta so para dois arquivos de maquina.
  - **correção:** Escrever T03.md com o nulo, o teto de medida, o poder e as duas exclusoes de traco — e cita-lo no campo prova.

### T03-2  (9 confirmados)

- **poder_nao_calculado** (3/3) em `confianca` — Conclusao negativa selada como "firme" sem nenhum calculo de poder: o script nao mede a mudanca minima detectavel, entao "nao muda" virou "nao existe".
  - **correção:** confianca no maximo "indicio", com o d minimo no confianca_motivo: "o desenho so enxerga mudanca sistematica acima de ~13 pontos de percentil; abaixo disso nao ha resposta".
- **excesso_de_alcance** (2/3) em `manchete` — "E o time nao muda quando o treinador chega" afirma imobilidade provada; o teste so mediu se ha direcao comum entre os 73 casos, nao se cada time mudou.
  - **correção:** "Quando o treinador chega, o time nao anda para um lado so" — ou, fiel ao que foi medido, "nao da para ver mudanca comum a todas as trocas".
- **palavra_proibida** (3/3) em `o_que_vimos` — O "o que vimos" usa a palavra proibida "p" e traz numero em p e em percentil, os dois vetados fora da prova.
  - **correção:** Tirar o p do texto (fica no confianca_motivo/prova) e trocar o percentil por unidade de jogo, do tipo "em X de cada 73 trocas o numero sobe e em Y desce".
- **n_errado** (3/3) em `n` — "73 trocas de treinador" e tratado como 73 observacoes independentes; sao 58 clube-temporadas e 31 clubes, com janelas que se sobrepoem entre casos.
  - **correção:** Declarar "73 trocas em 58 clube-temporadas (31 clubes)" e reamostrar por clube, ou ficar com um caso por clube-temporada.
- **excesso_de_alcance** (2/3) em `para_o_santa_cruz` — "ao menos nao nos tracos que separam quem sobe" nao se sustenta: os 7 tracos nao sao o indice do A14 — dois itens do indice que existem jogo a jogo nunca foram testados.
  - **correção:** Ou rodar xgc_casa e dd_casa e fechar o indice, ou escrever "em 5 dos 8 itens do indice do A14 (dois nao foram medidos)" e tirar xg_contra, ou marca-lo como suspeito pela regra da fronteira.
- **outro** (3/3) em `o_que_vimos` — Quatro dos sete tracos sao de xG, cuja confiabilidade medida e 0,30, e a conclusao nula nao traz a ressalva que a regra manda.
  - **correção:** Acrescentar a ressalva: "os numeros de xG tem confiabilidade 0,30, abaixo do minimo da casa; nesses quatro tracos o nulo pode ser da regua, nao do time".
- **efeito_do_placar** (3/3) em `para_o_santa_cruz` — Falta a marca "pode ser efeito do placar", e a afirmacao de que a troca "resolve por outro caminho que este dado nao ve" e desmentida pelo mesmo arquivo.
  - **correção:** Marcar a conclusao como "pode ser efeito do placar" e trocar a ultima frase por "o placar melhora depois da troca (+10 pontos de percentil), mas a mesma conta mostra que isso e o time voltando ao normal depois do fundo do poco".
- **outro** (3/3) em `n` — Sete dos 73 casos sao de 2026, temporada em andamento que o metodo reserva so para teste, e entram no n principal.
  - **correção:** Rodar com 2022-2025 (n=66) e reportar 2026 a parte, como teste; ajustar o marcador ad_n.
- **prova_nao_sustenta** (2/3) em `prova` — A prova aponta so para T03_antes_depois.csv, que nao contem nenhum dos dois numeros citados no texto, e nao existe T03.md.
  - **correção:** prova: "T03_antes_depois.csv; T03_resumo.json (antes_depois.por_traco); T03.md", e escrever o T03.md.

### T04-1  (7 confirmados)

- **consequencia_como_caracteristica** (2/3) em `para_o_santa_cruz` — O "perfil alinhado" nao e uma terceira coisa: e o resultado da temporada recontado, e nao e traco do treinador.
  - **correção:** Tirar "perfil alinhado a regua do A14" das "tres coisas". O indice 70,1 descreve Novorizontino e Criciuma naquelas temporadas, nao o treinador — e anda junto com o resultado que ja e contado no %G4. Sobra uma coisa (resultado repetido), nao tres.
- **excesso_de_alcance** (2/3) em `manchete, para_o_santa_cruz` — O nome indicado nunca subiu: em quatro temporadas foram quatro quintos lugares, e o texto nao diz isso.
  - **correção:** A frase tem de trazer o 0 de 4: "em quatro temporadas terminou quatro vezes em 5o, sempre a um ponto do G4". Sem isso a manchete vende como aposta de acesso quem nunca fechou uma.
- **excesso_de_alcance** (3/3) em `para_o_santa_cruz` — "Elenco barato" e falso em metade da amostra, e contradiz o numero que o proprio o_que_vimos publica.
  - **correção:** Trocar "elenco barato" por "elenco na metade de baixo em 2023 e 2024 (10o e 16o), mas 8o e 5o no Criciuma" — ou simplesmente repetir "elenco mediano 9o".
- **confianca_alta_demais** (3/3) em `confianca, confianca_motivo` — "Provavel" sem nenhum dos dois criterios: o T04 nao roda BH por familia nem porta temporal.
  - **correção:** Baixar para "indicio", com a frase dizendo por que: e uma ordenacao descritiva de 33 treinadores, sem teste, apoiada em 4 passagens em 2 clubes.
- **prova_nao_sustenta** (2/3) em `confianca_motivo` — "O criterio do piso e o unico que sobreviveu a um teste de repeticao" — esse teste nao existe.
  - **correção:** "O piso e a escolha mais conservadora entre as disponiveis; nao foi testado contra a media." A palavra "teste" tem de sair.
- **n_errado** (3/3) em `n, o_que_vimos` — O n inclui uma temporada em curso que a regra da casa manda usar so como teste, e o script ignora a marca que a propria base traz.
  - **correção:** n = "108 rodadas em 3 passagens e 2 clubes", ou manter 134 dizendo, no proprio texto, que 26 rodadas sao de temporada em curso e nao entram como conclusao.
- **palavra_proibida** (3/3) em `o_que_vimos` — Numero em percentil no "o que vimos", onde so pode entrar unidade de jogo — e sem unidade nenhuma no texto.
  - **correção:** Tirar o indice do "o que vimos" (ele vive na prova) ou traduzi-lo em unidade de jogo (ex.: metros da finalizacao, entradas na area por jogo).

### T04-2  (6 confirmados)

- **poder_nao_calculado** (3/3) em `o_que_vimos` — "A semelhança do próprio perfil em clubes diferentes é indistinguível do acaso" é falta de poder apresentada como negativa firme — e o ponto estimado aponta para o lado oposto da frase.
  - **correção:** "Não deu para ver" em vez de "é acaso": com 34 treinadores o desenho só detectaria um efeito de 0,48 e o observado é 0,27, na direção de haver alguma repetição. A §6.7 da ESPECIFICACAO.md manda a frase fixa "não separa" significa "este desenho não conseguiria ver".
- **confianca_alta_demais** (3/3) em `confianca` — Declarada "firme" sem nenhum dos dois critérios que definem firme na casa: BH a 5% por família e porta temporal.
  - **correção:** Rebaixar para "indício", com a frase dizendo por quê: são três negativas sem correção para múltiplos testes, sem porta temporal e sem poder calculado.
- **poder_nao_calculado** (2/3) em `o_que_vimos` — "O time não muda quando ele chega" é um "não separa" declarado sem d mínimo, como a regra 9 proíbe.
  - **correção:** Acrescentar o d mínimo detectável e dizer o que o desenho conseguiria ver, em vez de afirmar que nada muda.
- **marcador_sem_valor** (3/3) em `o_que_vimos` — Cinco números digitados à mão e nenhum marcador — a regra do texto e número foi ignorada nesta conclusão.
  - **correção:** Criar as chaves em numeros (ex.: {t02_multi}=34, {t02_amp50}=9, {t03_pass}=151, {t03_tec}=69) e substituir os dígitos pelos marcadores.
- **outro** (2/3) em `o_que_vimos` — Quatro dos sete traços do perfil são de xG, cuja confiabilidade medida é 0,30 — abaixo do piso de 0,40 que manda ressalvar — e a baixa confiabilidade é justamente o que fabrica a negativa.
  - **correção:** Marcar a ressalva: mais da metade do perfil é xG com confiabilidade 0,30, e um perfil medido com essa régua não conseguiria mostrar repetição mesmo que ela existisse.
- **outro** (3/3) em `o_que_vimos` — "9 variam 50 pontos ou mais" fica sem referente: numa reunião de clube, "50 pontos" lê-se como pontos de campeonato.
  - **correção:** Dizer em unidade de jogo e com referente: "9 deles tiveram uma passagem quase sempre no G4 e outra quase nunca", ou repetir "pontos percentuais do tempo no G4".
