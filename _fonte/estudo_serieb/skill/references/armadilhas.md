# Catálogo de armadilhas

Cada entrada aconteceu de verdade, no Estudo Série B (Santa Cruz 2027, setembro de 2026). O
formato é sempre o mesmo: **o que é**, **como aparece** (o sinal de que ela está presente) e **o
que fazer**. Quase todas passam caladas — é por isso que elas estão escritas.

---

## A. Procedência do número

### A1. `gerado_por` falso
**O que é.** O campo diz que tal script produziu aqueles números. O script existe, importa o que
deve, roda — e **não grava** a saída que assina.
**Como aparece.** Não aparece. Só um portão que exija "o script citado escreve aquele arquivo"
pega. Em duas partes o campo apontava o executor genérico, que gravava a tabela de testes e nada
mais; os números publicados não saíam de arquivo nenhum.
**O que fazer.** Regra de portão: o script nomeado tem de mencionar aquele arquivo junto de uma
escrita. E rode o script: se ele reproduz byte a byte o que está no disco, a procedência é real.

### A2. Número digitado à mão no texto
**O que é.** O texto de leitura traz "19,5 metros" escrito, em vez de um marcador resolvido pelo
dado.
**Como aparece.** O número envelhece: o cálculo muda e a frase não. Num caso o texto dizia
"estrangeiro e brasileiro estreiam jogando o mesmo, 16,6% contra 16,5%" e o script devolvia 17,5 —
não era empate, e a direção invertia. Havia um comentário no próprio script admitindo a
divergência, sem corrigi-la.
**O que fazer.** Todo número por marcador. E **inclua os campos que ninguém lembra**: o motivo da
confiança, o texto da premissa, o campo "em aberto" e o **título do gráfico**. Foi exatamente por
não passarem pelo resolvedor que eles seguiram anunciando um empate já corrigido no texto
principal.

### A3. Trocar o número sem reler a frase
**O que é.** A correção vira substituição mecânica: entra o valor novo, fica a frase velha.
**Como aparece.** "Empatam em 16,6% contra 16,5%" vira "empatam em 17,5% contra 16,5%".
**O que fazer.** Toda troca de marcador pede releitura da frase inteira. Se a frase afirma
*direção* ou *empate*, ela pode ter deixado de ser verdade.

### A4. O código do item publicado como se fosse o nome
**O que é.** O campo guarda o id (`m2`, `p20`) e a tela imprime o id.
**Como aparece.** 23 conclusões chegaram à tela dizendo "Premissa: m2".
**O que fazer.** Resolver id para título na geração, e deixar o código acessível para quem for
procurar.

---

## B. Teste e critério

### B1. Persistência com nome de porta temporal
**O que é.** A porta temporal é *indicador do 1º turno × pontos do 2º*, com parcial. Persistência
é *o indicador × ele mesmo na outra metade*. São perguntas diferentes: a primeira separa causa
plausível de consequência, a segunda só diz que a medida se repete.
**Como aparece.** O nome fica certo e a conta fica errada. Três partes declaravam ter rodado a
porta; lendo o código, **nenhuma** tinha. Duas faziam persistência com um limiar que a própria
especificação já tinha aposentado; a terceira usava a posição **final** como desfecho — que contém
o 1º turno.
**O que fazer.** Grave as duas contas com o nome de cada uma, no mesmo arquivo. E exija do portão
que a "porta" tenha **parcial com número** e um `passa` verdadeiro: registrar a porta não é passar
nela.

### B2. O mesmo indicador em duas famílias, com dois q
**O que é.** BH divide o crédito entre os testes corrigidos juntos. O mesmo indicador, com o
**mesmo p**, sai com q diferente em famílias diferentes.
**Como aparece.** Duas partes publicam a mesma medida com números diferentes, e quem confere
conclui que uma está errada. As duas estão certas — e é o desenho que está.
**O que fazer.** Uma parte é **dona** (aquela cuja pergunta o indicador responde) e a outra
**cita** o q do dono, ficando fora da correção local. Onde a dona não roda aquela comparação, não
há duplicata e a linha é de quem a mede. Atenção: tirar um indicador de uma família **muda o q dos
vizinhos** — é recálculo, não etiqueta.

### B3. Robustez citada de um lado só
**O que é.** O corte de robustez roda, o resultado discorda do principal, e o texto afirma como se
os dois concordassem.
**Como aparece.** Numa parte o corte reduzido rodava desde sempre e simplesmente **não era
publicado**: a tabela saía sem coluna de corte. Noutra, 16 discordâncias sem nenhuma menção.
**O que fazer.** Publique os dois cortes na mesma tabela, com coluna de corte. Regra de portão:
quando os dois discordam, o texto cita os dois — e "citar" é o indicador e a ressalva **na mesma
conclusão**, não uma frase de praxe solta.

### B4. Firme só no corte reduzido
**O que é.** O achado aparece apenas sem os times de fronteira.
**Como aparece.** Parece robustez confirmando; é o contrário. O corte reduzido afasta faixas
vizinhas por construção.
**O que fazer.** Firme é firme **nos dois**. Firme só sem fronteira é suspeito, não promovido — e
some sem fronteira também é suspeito.

### B5. "Não separa" sem poder
**O que é.** Publicar ausência de diferença como se fosse ausência de efeito.
**Como aparece.** n pequeno e efeito mínimo detectável maior que qualquer diferença plausível.
**O que fazer.** Calcule o efeito mínimo detectável e escreva a frase: *"este desenho não veria
diferença menor que X"*.

### B6. Garimpo com correção de fachada
**O que é.** Testar 16 coisas, escolher a melhor, corrigir como se fosse uma.
**Como aparece.** Família partida por setor, por faixa de minuto, por qualquer eixo que "faça
caber".
**O que fazer.** Família = um pilar × uma comparação, declarada antes. Se o recorte fino for
mesmo necessário, ele é **leitura secundária**, rotulada como tal.

### B7. Consequência tratada como característica
**O que é.** Gols, pontos, saldo — o resultado contado de outro jeito — entram como se fossem
traço do time.
**Como aparece.** A conclusão vira "quem sobe faz mais gols", que é a definição de subir.
**O que fazer.** Lista fixa de consequências, fechada antes. E cuidado com o oposto: tratar uma
etapa inteira como consequência tira das análises indicadores de que elas precisam. Separe
*resultado* de *consequência do resultado*.

### B8. Sobrevivente no destino
**O que é.** Aplicar o corte de minutos só onde o jogador chegou.
**Como aparece.** Todo transferido "deu certo": quem não jogou 900 minutos no destino sumiu da
conta.
**O que fazer.** Inclua quem não atingiu o corte, reportado à parte.

### B9. Regressão à média lida como efeito
**O que é.** Quem teve ano extremo tende ao meio no ano seguinte, sem causa nenhuma.
**Como aparece.** "O jogador caiu depois da transferência" — quando o ano anterior é justamente o
que o fez ser comprado.
**O que fazer.** Compare com um grupo de controle de desempenho parecido que **não** se
transferiu.

---

## C. Cruzar bases

### C1. Casamento por nome e o homônimo
**O que é.** Dois jogadores com o mesmo nome, às vezes a mesma idade.
**Como aparece.** Números de um colados no outro, em silêncio, porque os dois nomes são plausíveis.
**O que fazer.** Descarte quem aparece com dois clubes ou duas posições no mesmo ano, e **conte**
os descartes. Antes de listar como ambíguo, **pesquise fora da base**: no futebol brasileiro o
Transfermarkt, o BID da CBF e a imprensa local resolvem quase tudo com data de nascimento e clube
de formação. Num caso, de 12 pares de mesmo nome e idade, oito eram a mesma pessoa registrada duas
vezes (o sinal: posição igual ou vizinha **e a mesma data exata de fim de contrato**) e quatro
eram pessoas diferentes (posição distante, datas diferentes).

### C2. A coluna de clube errada
**O que é.** O export traz duas colunas de clube: o clube **atual** do atleta e o clube **no
período selecionado**.
**Como aparece.** A errada tinha 531 valores distintos onde a certa tinha 42. Atribui o atleta ao
clube errado em boa parte das linhas, calado, porque os dois nomes são de clube.
**O que fazer.** Confira a cardinalidade antes de usar: número de clubes distintos tem de bater
com o número de clubes da liga.

### C3. Export cortado
**O que é.** A extração devolve no máximo N linhas por liga, ordenadas por minutagem.
**Como aparece.** Quem jogou pouco **não existe** na base — e isso não é minutagem baixa, é
ausência. Numa liga o corte caiu em 207 minutos.
**O que fazer.** Registre o corte real por temporada. Temporada sem dado **não** conta como
minutagem baixa. Use um elenco independente para saber quem existia.

### C4. A temporada que não sai do ano da data
**O que é.** Campeonato que cruza o ano civil, ou formato europeu ("25/26") numa liga de calendário
brasileiro.
**Como aparece.** Um evento de fevereiro a março de 2024 aparece como 23/24, que para o
calendário local é 2024.
**O que fazer.** Derive a temporada das **datas** e da janela do campeonato, nunca do rótulo da
fonte. E confira quantas linhas discordam entre as duas leituras — se for zero, ótimo; se não,
está escrito.

### C5. Data UTC contra data local
**O que é.** Jogo da noite vira o dia seguinte.
**Como aparece.** Rodada trocada, jogo fora da janela.
**O que fazer.** Fixe o fuso na leitura e confira o número de jogos por rodada.

### C6. Promovido ou rebaixado contado como transferência
**O que é.** O clube muda de divisão e o jogador aparece como se tivesse mudado de clube.
**Como aparece.** Fator de conversão entre ligas inflado por gente que não se transferiu.
**O que fazer.** Compare o **id do clube**, não o nome da liga.

### C7. Idade e país de nascimento do cadastro
**O que é.** Campos de cadastro vêm errados com frequência, e país de nascimento não é
nacionalidade esportiva.
**O que fazer.** Cruze com uma segunda fonte antes de usar como critério; dupla nacionalidade é
sinalizada, não decidida.

---

## D. Raspar página

### D1. A classe que parece marcar lado e não marca
**O que é.** Você deduz que `fl-l-cen`/`fl-r-cen` são esquerda e direita, casa e fora.
**Como aparece.** Numa página havia **zero** `fl-l-cen` e 46 `fl-r-cen`. Todo gol caía no mesmo
lado, e um jogo de 1-2 saía como 0-3.
**O que fazer.** Nunca confie na semântica de uma classe CSS. Ache o **container** de cada time
(no caso, as duas colunas de cada linha de escalação, a primeira sendo a casa) e **valide contra
o placar** (D5).

### D2. O bloco repetido que você leu só uma vez
**O que é.** A estrutura aparece várias vezes — titulares numa linha, reservas noutra, com uma
classe a mais.
**Como aparece.** 5 de 12 jogos de teste não fechavam com o próprio placar: sumia todo gol de
quem entrou do banco.
**O que fazer.** Itere sobre **todos** os blocos, não o primeiro. E note que este defeito passa
calado em qualquer conferência visual por amostragem — só a validação numérica pega.

### D3. Vários valores num campo só
**O que é.** Dois gols do mesmo jogador vêm como `13' 48'` num `<div>` só.
**O que fazer.** Extraia com expressão regular que encontre **todas** as ocorrências, não a
primeira. Idem para acréscimo: `90+7'` é o minuto 97.

### D4. O evento que conta para o outro lado
**O que é.** Gol contra. O bloco diz de que time é o **jogador**, não para quem o gol valeu.
**O que fazer.** Detecte a marcação (`g.c.`) e inverta o lado. Sem isso o placar não fecha — o que
é justamente o sinal.

### D5. A trava do placar
**O que é.** A defesa contra D1–D4, e contra as que ainda não conhecemos.
**O que fazer.** Cada jogo só entra se os eventos lidos **baterem com o placar** que outra página
já dá. O que não bater vai para um relatório, contado e nomeado, e fica **de fora** — nunca
gravado como se estivesse certo. As quatro armadilhas acima foram achadas por esta trava, em
minutos, e nenhuma delas teria aparecido lendo o HTML com atenção.

### D6. Links que não são do que você pediu
**O que é.** A página do calendário traz links de jogos de outras competições (barra lateral,
"outros jogos").
**Como aparece.** Fulham × Manchester United no meio de uma coleta de Série B.
**O que fazer.** Tire as linhas da **tabela** de calendário, não de todo `href` da página.

### D7. Cache e ritmo
**O que fazer.** Uma conexão, pausa de 2,5 a 4 s, HTML em cache no disco, coleta retomável.
Consertar a **leitura** não pode custar outra volta no site. E não versione o cache.

---

## E. Texto e desenho

### E1. Encurtar come ressalva
**O que é.** Ao reduzir texto, a condição ("quando", "exceto", "só sem os times de fronteira") sai
antes do resto.
**Como aparece.** Não aparece: a frase continua gramatical e mais confiante do que os dados
sustentam. Uma rodada de encurtamento perdeu **42 ressalvas**, e a régua de tamanho aprovou todas
— porque volume é exatamente o que ela queria reduzir.
**O que fazer.** Regra: quando não couber, sai o **detalhe do achado**, nunca a ressalva. E a
conferência é um leitor **cético que nunca leu o original**, comparando final com original, item a
item. Nenhuma métrica substitui isso.

### E2. O desenho afirma tanto quanto o texto
**O que é.** Eixo que não começa no zero.
**Como aparece.** Uma diferença de **0,26%** ocupou 40% da largura, logo abaixo de uma manchete
que dizia que a diferença era irrelevante.
**O que fazer.** Barra e régua começam no zero; quando houver negativo, o zero vira linha marcada.
E antes de publicar, leia manchete e desenho **juntos**, perguntando se contam a mesma história.

### E3. Módulo que inverte a leitura
**O que é.** Publicar um valor em módulo "porque a frase já diz abaixo".
**Como aparece.** No corte cheio, um grupo estava **acima** do esperado (+0,05) e o outro
**abaixo** (−0,17). Publicado como 0,17, o gráfico mostrava o segundo grupo melhor que o primeiro
— o contrário do dado.
**O que fazer.** Módulo é decisão de **frase**, não de dado. O marcador vai com sinal; quem tira o
sinal é a redação, se quiser.

### E4. Prova escondida em tooltip
**O que é.** Texto longo de justificativa no atributo `title=`.
**Como aparece.** Não rola, não copia, some ao mover o mouse e no celular não abre. O maior tinha
**8.387 caracteres**.
**O que fazer.** Bloco que abre e fecha. E o texto vai inteiro e literal — se for preciso quebrar
em parágrafos, quebre onde o próprio autor já marcou seção, nunca a cada N frases.

### E5. Vocabulário que a régua não conhece
**O que é.** O texto adota, de propósito, uma palavra de reunião ("times colados na linha") no
lugar do termo de método ("times de fronteira"), e a verificação automática procura só o termo
antigo.
**O que fazer.** A ponte entre o nome da tabela e o nome de reunião mora na **lista pré-declarada**
de cada parte, auditável linha a linha — nunca escondida dentro do verificador. Mudar o
verificador para aceitar a grafia nova é correção; mudar o texto para agradar o verificador é
regressão.

### E6. A contagem que engana no gráfico
**O que é.** Desenhar o par de barras que existe, e não o par que o texto discute.
**Como aparece.** A contagem crua "4 subiram com pouca posse contra 12 com muita" parece provar
que ter a bola faz subir — quando o mesmo vale para quem caiu.
**O que fazer.** Conclusão sem gráfico honesto fica **sem gráfico**, e o motivo é escrito.

---

## G. Dizer que a base não responde

### G1. Alegar a falta em vez de medir
**O que é.** Escrever "esta base não tem X" a partir de memória, de um comentário antigo ou de uma
olhada no schema.
**Como aparece.** A frase fica num arquivo de método por semanas e ninguém confere. É a mesma
falha de afirmar achado sem rodar teste — os dois são alegação —, só que ninguém a trata assim,
porque ausência parece barata de verificar.
**O que fazer.** Um script que **conta**. No caso real: 0 colunas de período em 88, e 0 chaves com
recorte de tempo em 31 da resposta crua da API, lidas sobre 3.616 linhas. Aí "não responde" vira
conclusão, com número e com n.

### G2. A busca que foi feita para não achar
**O que é.** Procurar o recorte ausente com uma lista curta de nomes.
**O que fazer.** A lista de busca é **generosa de propósito** — no caso: `period`, `half`, `1st`,
`2nd`, `phase`, `segment`, `window`, `quarter`, `tempo` e as faixas de 15 min. Ela existe para
**achar** o recorte. Se achar, ótimo: a pergunta roda. Escreva a lista no script, para quem
revisar poder julgar se ela era honesta.

### G3. O recorte que existe e não é o que você precisa
**O que é.** A base desce abaixo da unidade principal, mas por outro eixo.
**Como aparece.** Havia 34 colunas de recorte dentro do jogo — com bola e sem bola. Dá a impressão
de granularidade, e quem cruzar as duas coisas conclui que "a base tem detalhe dentro do jogo". Tem
— por **posse**, não por **tempo**, e a pergunta era sobre tempo.
**O que fazer.** Nomeie o eixo do recorte que existe, no texto, ao lado do que falta. Sem isso a
próxima pessoa refaz a busca e chega à conclusão errada.

### G4. Escrever o que a ausência NÃO prova
**O que é.** Manchete negativa lida como resultado positivo ao contrário.
**Como aparece.** "Esta base não mede o desgaste dentro do jogo" vira, na boca de terceiros, "o
desgaste dentro do jogo não importa".
**O que fazer.** Liste explicitamente o que não foi medido: que o efeito não existe, que ele não
separaria os grupos, que o fornecedor não venda o recorte. Três frases, e elas impedem a leitura
errada.

### G5. Fechar em vez de deixar pendente
**O que é.** Deixar a pergunta sem resposta e sem explicação, para sempre.
**Como aparece.** Vira dívida invisível: ninguém sabe se está parada por falta de dado, de tempo
ou de interesse.
**O que fazer.** "Não responde com esta base" é **conclusão**, no mesmo formato das outras, com
uso prático. Escrita assim ela ganha preço e destinatário: vira uma **compra** (pergunta para o
fornecedor, com custo), e não uma análise por fazer.

### G6. Declarar a lista mesmo sem rodar
**O que fazer.** Declare os indicadores que a pergunta *exigiria*, com data, mesmo que ela não
rode. Se um dia a coleta acontecer, a lista é de antes e a data prova que ninguém escolheu
indicador vendo resultado. Custa cinco minutos e fecha a porta do garimpo futuro.

---

## F. Processo

### F1. O portão só confere quem está na lista dele
**O que é.** A lista de partes do verificador e a lista de partes que existem divergem.
**Como aparece.** O portão dizia "22 de 22 aceitas" e havia três partes publicadas como decididas,
fora da lista, sem conferência nenhuma — com tabela de testes e saída de números prontas desde
sempre. Faltava a linha.
**O que fazer.** Derive a lista dos arquivos que existem, ou compare as duas e reclame da
diferença. Um verificador que se mede por si mesmo sempre passa.

### F2. Escreva o que o portão não prova
**O que é.** Confiança no verificador além do que ele faz.
**O que fazer.** Publique a lista de limites junto do relatório. Exemplo real: *"o portão não
executa script nenhum e não abre base nenhuma; ele confere que o número publicado é igual ao que a
saída declara — não que esse número saiu do dado"*.

### F3. Publicar fora de ordem
**O que é.** Gerar a tela, commitar e empurrar em ordem trocada.
**Como aparece.** Site no ar com dado velho. Aconteceu duas vezes num dia.
**O que fazer.** Escreva a ordem como comando, com o motivo de cada passo, e siga sempre:
regenerar dados → regenerar registro → rodar o portão → montar a pasta publicada → **um** commit
com fonte e publicação juntas → empurrar → conferir que não sobrou nada por empurrar.

### F3b. Levantamento abandonado no meio
**O que é.** Parar uma coleta e deixar a saída parcial no repositório.
**Como aparece.** Meses depois alguém acha o CSV com 213 de 1.780 jogos e analisa, sem ver que
está pela metade. É a mesma armadilha do site no ar com dado velho.
**O que fazer.** Apague a saída parcial e o cache. Guarde o **coletor** (ele funciona) e marque a
declaração como **"declarada e NÃO rodada"**, com a decisão e a data. Sem essa marca, quem abrir
depois vai achar que foi medida.

### F3c. O roteiro que descreve errado o que foi feito
**O que é.** A tarefa foi cumprida com escopo mudado, e o roteiro continua com a redação antiga.
**Como aparece.** O item dizia "aposentar as abas" e o que foi feito foi transformá-las em
material auxiliar, sem apagar nada. Marcar como "feita" sem reescrever a frase deixa o registro
afirmando algo falso.
**O que fazer.** Reescreva a descrição junto com o status. Roteiro **desatualizado** a gente
desconfia; roteiro **errado** a gente acredita.

### F3d. Mudar módulo compartilhado
**O que é.** Consertar o módulo de método que todas as partes importam.
**Como aparece.** O conserto é legítimo e a regressão é silenciosa: números de outra parte mudam
sem ninguém olhar.
**O que fazer.** Rode **todas** as partes que o importam e compare **célula a célula** — q, d, p,
selo, n —, não só o arquivo. E cuide do ponto de comparação: uma vez o diff acusou mudança e era
a cópia de referência que estava velha, não o conserto. Baseline errada assusta à toa e, pior,
pode tranquilizar à toa.

### F4. Versão em cache do navegador
**O que é.** O parâmetro de versão do site deriva do mtime de um arquivo só.
**Como aparece.** Mexer em outro arquivo não troca a versão, e o navegador serve o antigo.
**O que fazer.** Derive a versão do maior mtime de **todos** os arquivos servidos.
