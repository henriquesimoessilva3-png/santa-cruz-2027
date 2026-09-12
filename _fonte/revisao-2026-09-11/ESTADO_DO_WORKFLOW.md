# Estado em 12/09/2026 00:07 — workflow RETOMADO e rodando

O `resumeFromRunId` funcionou: os 23 agentes do primeiro run voltaram do cache (custo zero) e as
fases que tinham falhado por limite do Fable rodaram de novo no **Opus**.

| fase | estado |
|---|---|
| Mapear · Pesquisar · Revisar | **23 do cache** |
| **Propor** | **6 de 6 concluídos** — 34 propostas individuais + a reorganização |
| **Verificar** | **rodando** — 2 agentes por proposta (~68 no total) |
| Sintetizar | entra depois |

## As 34 propostas, por ângulo

| ângulo | propostas |
|---|---|
| elenco | 7 |
| fisico | 7 |
| jogo | 7 |
| preditivo | 7 |
| tecnico | 6 |

Títulos (para não repropor o que já foi proposto):

**elenco**
- Disponibilidade dos 11 mais usados — a cara honesta da concentração de minutos — *SEÇÃO 5 — Elenco, dinheiro e idade (bloco 'Time que sobe é time que se repete')*, esforço baixo
- A armadilha da cobertura: por que a base de lesões produziria o indicador MAIS FORTE da aba, e ele seria falso — *SEÇÃO 10 (método, lacunas e armadilhas) — com um ponteiro a partir da SEÇÃO 5*, esforço baixo
- O único teste que a base de lesões suporta: dentro do mesmo clube, jogo a jogo, com as datas — *SEÇÃO 5 — Elenco, dinheiro e idade (bloco novo, logo depois da disponibilidade)*, esforço alto
- O resíduo sobre o dinheiro: o que o Santa Cruz pode comprar quando não pode comprar elenco — *SEÇÃO 5 — Elenco, dinheiro e idade (bloco novo, fechando a seção; é a resposta que a seção promete e não dá)*, esforço medio
- Estrangeiro é dinheiro, não política de montagem — *SEÇÃO 8 ('Tudo o que medimos' / o que não vale), com uma linha de correção no retrato sobe × cai*, esforço baixo
- Anatomia da lesão na Série B: o joelho leva os dias, e quem se machuca é o veterano — *SEÇÃO 5 — Elenco, dinheiro e idade (fechando o bloco de idade, que hoje termina em 'goleiro é velho para todo mundo')*, esforço medio
- Continuidade: o que a aba mede cobre 36 de 80, e a alternativa que parecia salvar não salva — *SEÇÃO 5 (bloco 'Quanto do elenco sobrou do ano passado') + uma linha na lista de lacunas da SEÇÃO 10*, esforço medio

**fisico**
- O físico depois do dinheiro, da posse e do processo — e o fim do "sem a bola" — *Seção 6 — Físico (substitui o bloco "Com a bola e sem a bola" e abre o painel)*, esforço baixo
- O que o atleta leva na mala e o que é do sistema — *Seção 6 — Físico, bloco novo no fim; com um link explícito do bloco de persistência da Seção 2*, esforço medio
- Minutos para atleta lento — o físico como decisão de elenco — *Seção 6 — Físico, bloco novo; com ponte para a Seção 5 (utilização de atletas e concentração de minutos)*, esforço medio
- Três números por posição, com a faixa de incerteza que a média de quatro anos esconde — *Seção 6 — Físico, substituindo o cabeçalho da tabela por posição; a frase de 2026 pode ecoar na Seção 10*, esforço baixo
- Disponibilidade medida no campo — e o veredito sobre a base de lesões — *Seção 6 — Físico (bloco de fechamento, carga e disponibilidade), com o veredito de lesões repetido na Seção 10 (o que ficou de fora e por quê)*, esforço baixo
- Quantos jogos um número físico precisa para querer dizer algo (e o que muda do 1º para o 2º turno) — *Seção 6 — Físico, bloco de método no fim (e a correção da ressalva de cobertura entra aqui)*, esforço alto
- Corrida sem bola: do intermediário ao desfecho, e as contagens que nunca foram carregadas — *Seção 6 — Físico, ampliando o bloco de corridas sem bola; o link com passes em profundidade aponta para a Seção 3 (ataque)*, esforço medio

**jogo**
- A curva de decisão: quanto da tabela final já está escrita na rodada k — *Seção 7 (O jogo) — substitui a frase 'Dos 16 acessos, 10 já estavam no G4 na metade'; ou, se virar bloco grande, uma seção nova 'Quando se decide' logo depois da Seção 1*, esforço medio
- O playoff, medido: quanto vale terminar em 3º em vez de 5º — *TOPO (bloco da regra nova) e Seção 1 — hoje a 'vantagem dupla' é afirmada sem número*, esforço alto
- Sequência e reação são aritmética da taxa de vitória — o teste de permutação — *Seção 7 (bloco 'Regularidade · o que a média esconde') — reescreve o bloco inteiro*, esforço baixo
- Contra fortes e fracos, sem a armadilha de não jogar contra si mesmo — *Seção 7 (bloco 'Contra quem se fazem os pontos')*, esforço baixo
- Quebra de formação como proxy da troca de treinador — e o que ela muda no jogo seguinte — *Seção 7 (bloco das formações) e Seção 10 (a lacuna da troca de treinador passa de 'falta' a 'medida pelo que dá')*, esforço alto
- O campeonato mais comprimido do mundo: quantos clubes ainda têm o que disputar na rodada k — *Seção 1 (a linha do acesso) como contraprova do piso de 61; e Seção 7 como retrato da compressão do campeonato*, esforço medio
- O calendário como adversário: descanso, sequência de viagens e o custo da Copa do Brasil — *Seção 7 (O jogo) como bloco novo, com gancho para a Seção 5 (utilização de elenco)*, esforço alto

**preditivo**
- O teto de previsibilidade: até onde qualquer modelo pode chegar nesta liga — *Seção 8 (O quadro geral) como régua do gráfico principal, com a explicação do método na Seção 10*, esforço medio
- O quarteto é garimpo: a busca refeita fora da amostra, ano por ano — *Seção 8, logo abaixo do gráfico 'Quatro alavancas separadas' (substitui a ressalva genérica por um número)*, esforço alto
- Três blocos, três modelos: desfecho, processo e ex-ante — e o que cada um tem direito de dizer — *Seção 8 (reorganiza o gráfico principal), com nota de método na Seção 10*, esforço alto
- Probabilidade de subir em 2026, com leque de incerteza e encolhimento das forças — *Seção 9 (A temporada), substituindo o bloco de metas determinísticas*, esforço medio
- A previsão vale alguma coisa? Backtest e calibração nas rodadas 19 e 27 de 2022-2025 — *Seção 9 (logo abaixo da probabilidade de 2026) e o método na Seção 10*, esforço medio
- O resíduo sobre o preço: o único alvo que serve para um clube pobre — *Seção 5 (Elenco, dinheiro e idade) como fecho, com o gráfico pareado remetendo à Seção 8*, esforço alto
- Registro de previsão de 2026: a aba aposta antes, e depois mostra o boletim — *Seção 9 (A temporada) com o vocabulário replicado na Seção 10 (Método e ressalvas)*, esforço baixo

**tecnico**
- Os dois elos depois do chute (fechar a cadeia com o chute no alvo) — *Seção 2 — De onde vem a vantagem (substitui o bloco da cadeia)*, esforço baixo
- O que é medida e o que é ruído — repetibilidade dentro da própria temporada — *Seção 2 (como primeiro painel, antes do teste ano-a-ano, que fica como segundo com a ressalva da amostra) e referência cruzada na Seção 8*, esforço medio
- O processo contra cada faixa: contra o G6, quem sobe empata e ganha assim mesmo — *Seção 7 — O jogo (substitui a leitura do bloco 'Contra quem se fazem os pontos')*, esforço medio
- Metade dos pontos sai de jogo de um gol — e essa metade não se repete — *Seção 7 — O jogo (bloco novo 'A distribuição que a média esconde'), com o KPI de pontos ecoado na Seção 1*, esforço medio
- Game state: a posse é consequência do placar (por que 0,26 não quer dizer o que parece) — *Seção 8 — O quadro geral (colado ao parágrafo de posse e precisão de passe), com eco na Seção 10*, esforço baixo
- Identidade de jogo: apoiado ou em transição, e a pressão que não cede fora de casa nem contra os grandes — *Seção 3 — Ataque e defesa (bloco novo de identidade, colado ao bloco de defesa/PPDA), com eco na Seção 7*, esforço medio

## Se esta sessão morrer agora

1. **O relatório já publicado não se perde** — está no ar e em `relatorio.html` nesta pasta.
   Ele foi escrito à mão a partir das 10 revisões e das 5 análises próprias, e **não depende**
   destas 34 propostas.
2. As propostas e tudo o mais concluído estão em `resultados_agentes.json`.
3. Se a fase Verificar não tiver terminado, as propostas estão **sem o crivo adversarial** —
   leia-as como sugestões, não como aprovadas. O relatório publicado já traz 11 propostas
   verificadas por mim contra os dados reais.
4. Para terminar: `Workflow({scriptPath: '<este script>', resumeFromRunId: 'wf_a4d4de27-3cf'})`
   **só funciona na mesma sessão**. Numa sessão nova, edite o script colando os JSONs de
   `resultados_agentes.json` e rode só Verificar → Sintetizar.

## O que fazer com o resultado quando chegar

Comparar as 34 propostas com as 11 do relatório publicado, ficar com o que for novo ou melhor,
e **republicar a MESMA URL** do artefato (`url: https://claude.ai/code/artifact/9efe03c4-69e9-49f9-b3c1-016c285865c6`)
— não criar um artefato novo.