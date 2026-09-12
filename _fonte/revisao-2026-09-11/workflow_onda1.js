export const meta = {
  name: 'onda1-serieb',
  description: 'Onda 1 da revisao da aba Analise Serie B: diagnosticar e especificar o patch exato de cada um dos 8 erros que estao no ar, e verificar cada patch antes de aplicar',
  phases: [
    { title: 'Diagnosticar', detail: 'um agente por item: achar o codigo, recalcular no dado real, escrever o patch exato' },
    { title: 'Conferir', detail: 'um cetico por patch: os numeros batem? o old_string e unico? o patch quebra outra coisa?' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const DADOS = RAIZ + '/dados'
const APPJS = RAIZ + '/static/app.js'
const PACOTE = RAIZ + '/_fonte/revisao-2026-09-11'

const CONTEXTO = `CONTEXTO (leia antes de agir):
App "Santa Cruz — Montagem de Elenco" (Flask + JS, publicado em GitHub Pages). A aba "Analise Serie B" estuda O DIFERENCIAL DE QUEM SOBE, com as 100 clube-temporada da Serie B de 2022 a 2026 (2026 em andamento, 27 de 38 rodadas).

ARQUITETURA — importa para o patch:
- ${DADOS}/serieb_elencos.csv (Transfermarkt, 5.098 atleta-temporada): colunas ano, clube, jogador, posicao, idade, valor_eur. VALOR POR TEMPORADA, se for mesmo por temporada — confira.
- ${DADOS}/serieb_tecnico.csv (Wyscout, por atleta, ~120 colunas). A coluna "Valor de mercado" daqui e um SNAPSHOT do momento da exportacao (2026) — nao e o valor da temporada.
- ${DADOS}/serieb_jogos.csv (Wyscout, por clube e partida, 3.570 linhas de Serie B).
- ${DADOS}/serieb_clube_temporada.csv (100 x 288) — o cruzamento no nivel clube-temporada.
- ${RAIZ}/analisar_serieb.py — monta o clube_temporada a partir das bases.
- ${RAIZ}/gerar_sb_clubes.py — escreve ${RAIZ}/static/sb_clubes.js (GERADO, nao editar a mao) com o que foi MEDIDO em cada clube-temporada.
- ${APPJS} — a aba. TODA media e correlacao e calculada NO NAVEGADOR a partir de sb_clubes.js. Principio do projeto: "o dado e a fonte, o texto e consequencia" — numero escrito a mao na prosa e bug.
- ${RAIZ}/docs/static/ e o espelho publicado de ${RAIZ}/static/ (hoje identicos byte a byte). Quem aplica o patch sincroniza depois; NAO se preocupe com o espelho.

METODO DA ABA: "sobe" = top 4; "cai" = 17o ou pior. Correlacao = posto DENTRO do ano (empate vira media) x posto final, Pearson nos postos. So temporadas COMPLETAS (2022-2025, n=80) entram nas medias.

VOCE NAO EDITA ARQUIVO NENHUM. Voce diagnostica no dado real (use Bash/python/grep) e devolve o PATCH EXATO para outra pessoa aplicar. Responda em portugues do Brasil.`

const DIAG = { type: 'object', properties: {
  item: { type: 'string' },
  problema_confirmado: { type: 'boolean' },
  onde_esta: { type: 'array', items: { type: 'object', properties: {
    arquivo: { type: 'string' }, linhas: { type: 'string' }, o_que_esta_la: { type: 'string' },
  }, required: ['arquivo', 'linhas', 'o_que_esta_la'] } },
  evidencia: { type: 'string' },
  numeros_novos: { type: 'array', items: { type: 'object', properties: {
    nome: { type: 'string' }, valor: { type: 'string' }, como_calculei: { type: 'string' },
  }, required: ['nome', 'valor', 'como_calculei'] } },
  patches: { type: 'array', items: { type: 'object', properties: {
    arquivo: { type: 'string' },
    old_string: { type: 'string' },
    new_string: { type: 'string' },
    unico_no_arquivo: { type: 'boolean' },
    justificativa: { type: 'string' },
  }, required: ['arquivo', 'old_string', 'new_string', 'unico_no_arquivo', 'justificativa'] } },
  precisa_regerar_sb_clubes: { type: 'boolean' },
  ordem_de_aplicacao: { type: 'string' },
  ressalva_que_tem_de_aparecer_na_tela: { type: 'string' },
  risco: { type: 'string' },
  o_que_nao_consegui: { type: 'string' },
}, required: ['item', 'problema_confirmado', 'onde_esta', 'evidencia', 'numeros_novos', 'patches', 'precisa_regerar_sb_clubes', 'ordem_de_aplicacao', 'ressalva_que_tem_de_aparecer_na_tela', 'risco', 'o_que_nao_consegui'] }

const CHECK = { type: 'object', properties: {
  item: { type: 'string' },
  numeros_conferem: { type: 'boolean' }, numeros_problemas: { type: 'array', items: { type: 'string' } },
  old_strings_unicos: { type: 'boolean' }, old_strings_problemas: { type: 'array', items: { type: 'string' } },
  quebra_outra_coisa: { type: 'string' },
  texto_honesto: { type: 'boolean' }, texto_problemas: { type: 'array', items: { type: 'string' } },
  correcao_concreta: { type: 'string' },
  veredito: { type: 'string', enum: ['aplicar', 'ajustar', 'rejeitar'] },
}, required: ['item', 'numeros_conferem', 'numeros_problemas', 'old_strings_unicos', 'old_strings_problemas', 'quebra_outra_coisa', 'texto_honesto', 'texto_problemas', 'correcao_concreta', 'veredito'] }

const ITENS = [
  { key: 'euros', titulo: 'As cinco barras de euros por setor',
    tarefa: `O ERRO MAIS GRAVE DA ABA. O valor por setor (val_defesa, val_meio, val_ataque, sh_ataque, sh_defesa) e somado da coluna "Valor de mercado" do serieb_tecnico.csv (veja analisar_serieb.py por volta das linhas 139, 151, 227 e da lista de indicadores nas linhas 578-590 e 640-643). Essa coluna e um SNAPSHOT do Wyscout no momento da exportacao (2026): o retrato de 2026 esta sendo aplicado a 2022. Isso contamina pelo menos 5 numeros publicados: "EUR parados na DEFESA" 0,56 (7a barra do grafico da Secao 8, marcada como forte), "EUR no MEIO" 0,40, "EUR no ATAQUE" 0,29, e "% do orcamento na DEFESA / no ATAQUE"; mais o bloco "Onde o dinheiro rende" da Secao 5.

PRIMEIRO, A PERGUNTA QUE DECIDE TUDO: o ${DADOS}/serieb_elencos.csv (Transfermarkt) tem ano, posicao e valor_eur. O valor_eur VARIA por temporada para o mesmo jogador, ou e o mesmo numero repetido em todos os anos (ou seja, outro snapshot)? TESTE de verdade: pegue jogadores presentes em 2022 e em 2025/2026 e compare; olhe a distribuicao de valor_eur por ano; veja se a mediana por ano cresce com o tempo como um snapshot unico faria.
- SE FOR POR TEMPORADA: especifique a CORRECAO DE FUNDO — reconstruir val_defesa/val_meio/val_ataque/sh_* a partir do serieb_elencos.csv, com o mapeamento de "posicao" (que e texto do Transfermarkt) para setor (goleiro/defesa/meio/ataque) escrito explicitamente. Recalcule as 5 correlacoes com o valor certo e diga quanto cada uma MUDOU. Se uma barra deixar de ser "forte", isso e o achado.
- SE FOR SNAPSHOT TAMBEM: especifique a correcao possivel — tirar as cinco barras do grafico, ou marca-las com a ressalva do snapshot em cima da propria barra, e dizer no texto que o dado de valor por temporada nao existe hoje.
Em qualquer dos dois casos: cubra TAMBEM o bloco "Onde o dinheiro rende" da Secao 5 e diga o que a Secao 10 (metodo e ressalvas) tem de passar a dizer sobre isso.` },

  { key: 'grafico2026', titulo: 'O grafico de 2026 na Secao 1 esta vazio',
    tarefa: `Na Secao 1 (A linha do acesso), a linha de 2026 do grafico nao aparece. O eixo vai de 54 a 69 pontos (procure X0=54 e X1=69 em ${APPJS}, por volta da linha 8257), mas 2026 tem so 27 rodadas: o 6o tem 43 pontos e o 2o tem 49 — fora do eixo. Ache o codigo, decida a correcao mais honesta (escala propria para 2026? projetar para 38 jogos com a ressalva? separar 2026 num painel a parte com o rotulo "27 de 38 rodadas"?) e escreva o patch. A regra nova de 2026 (1o e 2o sobem direto, 3o ao 6o fazem playoff) tem de ficar legivel no grafico. Confira os pontos reais de 2026 no dado antes de escrever qualquer numero.` },

  { key: 'razoes', titulo: 'As tres razoes da Secao 7, reescritas em pontos',
    tarefa: `Na Secao 7 (O jogo), tres conclusoes vem de RAZOES, e razao infla quando a base e pequena:
(a) "Fora de casa e onde o acesso se decide": 2,3x fora contra 1,7x em casa.
(b) "Quem sobe nao faz seus pontos batendo os fracos — bate os fortes" / "E nos jogos grandes que a temporada se separa".
(c) "A reacao e o numero mais direto do estudo": 1,80 x 1,08 pontos no jogo seguinte a uma derrota — que e o ritmo base disfarcado (quem ganha mais, ganha mais depois de perder tambem).
Recalcule as tres em DIFERENCA DE PONTOS (nao em razao) a partir de ${DADOS}/serieb_jogos.csv, com a diferenca em pontos por jogo entre sobe e cai, e para (c) descontando a media de pontos do proprio clube (ou seja, o residuo sobre o ritmo base). Para (b), lembre da armadilha de um clube nao jogar contra si mesmo. Escreva o patch com o texto novo e os numeros novos.` },

  { key: 'empates', titulo: 'O corte dos empates cai em cima de um empate',
    tarefa: `Na Secao 1, o bloco dos empates usa "os 20 que mais empataram" com um slice(-20) que cai em cima de um empate: 23 clubes tem 13 ou mais empates, e o corte descarta 3 deles so pela ordem do array. Pior: empates nao sao monotonicos com a posicao — o corte nos extremos fabrica um contraste que a relacao nao tem (medias por faixa: sobe 9,8 ...). Ache o codigo em ${APPJS}, conserte o corte (criterio por valor, com empate tratado) e TROQUE A TESE: a tese honesta e o desempate por vitorias (na Serie B o primeiro criterio de desempate e numero de vitorias, entao empatar custa mais do que a tabela de pontos sugere). Recalcule tudo no dado e escreva o patch com o texto novo.` },

  { key: 'maoSecao3', titulo: 'Os numeros escritos a mao no codigo da Secao 3',
    tarefa: `Na Secao 3 (Ataque e defesa), os postos medios estao escritos A MAO na prosa: "Quem sobe e, em media, 4,1o ataque e 5,4o defesa", "Quem cai e 16,1o e 16,9o", "tres vezes em quatro", "cairam do...". Isso viola o principio do projeto ("o dado e a fonte"): se o dado mudar, o texto mente. Ache TODOS os numeros escritos a mao dessa secao em ${APPJS}, confira cada um contra o que sb_clubes.js realmente da (recalcule), e escreva o patch que os substitui por interpolacao calculada no navegador (no mesmo padrao que o resto da aba ja usa — leia o codigo vizinho e siga o estilo dele). Se algum numero escrito a mao estiver ERRADO, esse e o achado: diga qual e o valor certo.` },

  { key: 'fisicoFaixas', titulo: 'Duas faixas de acesso na tabela fisica, e o "17 de 32"',
    tarefa: `Na Secao 6 (Fisico), a tabela de 128 correlacoes (32 metricas x 4 posicoes) e a frase "zaga 4, lateral 3, meio 17, ataque 10" tratam 34 acesos a 0,22 como 34 achados. Recalculado com Bonferroni, quase nada sobrevive. Duas correcoes: (1) trocar "17 de 32" (e as outras contagens) por "passam a 5% / passam a 1%" com a correcao para comparacoes multiplas explicita — decida entre Bonferroni e Benjamini-Hochberg e justifique; (2) marcar na tabela DUAS faixas de aceso em vez de uma. Refaca a conta no dado (o painel fisico vem do SkillCorner, via sb_clubes.js; o SkillCorner NAO rastreia goleiro e cobre ~15 jogos por atleta, nao 38) e escreva o patch com os numeros certos.` },

  { key: 'achadoNitido', titulo: 'Rebaixar "o achado mais nitido do painel fisico"',
    tarefa: `Na Secao 6, o bloco rotulado "o achado mais nitido do painel fisico" (sem a bola 0,22 / 0,22 / sprint sem bola 0,29) e, nos dados, a face fisica do PPDA e da posse — nao um achado independente. Confirme isso no dado (correlacione as tres metricas com ppda e com posse em sb_clubes.js / serieb_clube_temporada.csv; mostre os numeros) e escreva o patch que rebaixa o bloco a "a confirmacao fisica do PPDA", com o texto novo dizendo o que ele de fato acrescenta. BONUS, se couber no mesmo patch: o grafico "Corridas sem bola" esta dentro de um painel cujo cabecalho diz "por 90 minutos, ponderado por minuto rastreado", mas os seis campos sao por 30 minutos de posse (TIP/OTIP) — o cabecalho mente. Conserte o rotulo.` },

  { key: 'metodo', titulo: 'Reescrever a Secao 10 com o metodo que a aba realmente usa',
    tarefa: `A Secao 10 se chama "Metodo e ressalvas" e nao descreve o metodo. Nenhum dos quatro paragrafos diz o que a aba inteira assume. Escreva a secao nova, que TEM de conter, cada uma com o numero real conferido no dado:
(1) as definicoes: sobe = top 4, cai = 17o ou pior, correlacao = posto dentro do ano x posto final (Pearson nos postos), so temporadas completas (2022-2025, n=80) nas medias, 2026 fora das medias por estar em 27 de 38 rodadas;
(2) comparacoes multiplas: a aba testa ~30 indicadores no quadro geral e 128 no painel fisico x posicao — diga quantos sobrevivem a uma correcao e qual correcao;
(3) a regua honesta para diferencas de porcentagem (a atual, "dois ou tres pontos percentuais e ruido", erra nas duas direcoes — calcule o erro-padrao real e diga a regua certa);
(4) a ressalva do "Valor de mercado" do Wyscout ser um snapshot de 2026 aplicado a 2022 (a ressalva mais grave da aba, que hoje nao aparece em NENHUMA secao);
(5) desfazer a contradicao "aqui se usa a ordem, nunca o nivel" — a Secao 2 usa gols menos xG em NIVEL bruto;
(6) as lacunas: troca de treinador (a que mais incomoda), gol de bola parada por tipo de jogada, e a base de lesoes (que mede cobertura, nao lesao — ela fica FORA do estudo, decisao ja tomada pelo dono).
Ache a secao em ${APPJS}, leia o estilo do resto da aba e escreva o patch com o texto completo.` },
]

phase('Diagnosticar')
log(`Onda 1: ${ITENS.length} itens, cada um diagnosticado no dado real e depois conferido por um cetico`)

const resultados = await pipeline(ITENS,
  (it) => agent(`${CONTEXTO}

ITEM DA ONDA 1: ${it.titulo}

${it.tarefa}

COMO TRABALHAR:
1. Ache o codigo de verdade (grep em ${APPJS}, que tem ~448 KB; e nos geradores em ${RAIZ} quando o patch for de dado).
2. Recalcule no DADO REAL com python/pandas sobre ${DADOS}. Nao aceite nenhum numero da descricao acima sem conferir — ela vem de uma revisao anterior e pode estar errada. Se estiver, diga.
3. Escreva o patch como pares old_string -> new_string LITERAIS, copiados do arquivo, com contexto suficiente para serem UNICOS (confira a unicidade com grep -c). Quem aplica vai usar uma ferramenta de substituicao exata: se o old_string nao bater caractere a caractere, o patch falha.
4. Respeite o estilo do codigo vizinho e a voz da aba (direta, concreta, com numero, ressalva explicita).
5. Numero na tela tem de ser CALCULADO a partir de sb_clubes.js, nao escrito a mao — a menos que o proprio codigo vizinho ja faca diferente por um motivo que voce entenda.`,
    { label: 'diag:' + it.key, phase: 'Diagnosticar', schema: DIAG, effort: 'high' }),

  (diag, it) => diag ? agent(`${CONTEXTO}

VOCE E UM CETICO. Outro agente diagnosticou um item da Onda 1 e escreveu um patch. Seu trabalho e tentar DERRUBAR o patch ANTES de ele ser aplicado no que esta no ar. Padrao: na duvida, "ajustar".

CONFIRA, cada um no arquivo e no dado real:
1. NUMEROS: refaca as contas dele por um caminho diferente do que ele usou. Batem? Se nao batem, diga o valor certo.
2. OLD_STRINGS: cada old_string existe EXATAMENTE assim no arquivo e aparece UMA vez so? Use grep -c com a string literal. Um old_string que aparece duas vezes, ou que nao bate por um espaco, quebra a aplicacao.
3. EFEITO COLATERAL: o new_string quebra alguma outra parte da aba? Usa variavel que nao existe naquele escopo? Muda um id/classe que outro trecho procura?
4. HONESTIDADE DO TEXTO: o texto novo promete mais do que o dado sustenta? A ressalva obrigatoria esta la? Ele troca um erro por outro?

ITEM: ${it.titulo}

DIAGNOSTICO E PATCH PROPOSTOS:
${JSON.stringify(diag, null, 1).slice(0, 60000)}`,
    { label: 'check:' + it.key, phase: 'Conferir', schema: CHECK, effort: 'high' }).then(chk => ({ item: it, diag, chk }))
    : { item: it, diag: null, chk: null },
)

const ok = resultados.filter(Boolean)
const aplicar = ok.filter(r => r.chk && r.chk.veredito === 'aplicar')
const ajustar = ok.filter(r => r.chk && r.chk.veredito === 'ajustar')
const rejeitar = ok.filter(r => r.chk && r.chk.veredito === 'rejeitar')
log(`Onda 1 diagnosticada: ${aplicar.length} para aplicar, ${ajustar.length} para ajustar, ${rejeitar.length} rejeitados`)

return {
  resumo: { total: ITENS.length, aplicar: aplicar.length, ajustar: ajustar.length, rejeitar: rejeitar.length },
  itens: ok.map(r => ({
    key: r.item.key, titulo: r.item.titulo,
    veredito: r.chk ? r.chk.veredito : 'sem_verificacao',
    confirmado: r.diag ? r.diag.problema_confirmado : null,
    evidencia: r.diag ? r.diag.evidencia : null,
    numeros_novos: r.diag ? r.diag.numeros_novos : [],
    patches: r.diag ? r.diag.patches : [],
    precisa_regerar_sb_clubes: r.diag ? r.diag.precisa_regerar_sb_clubes : null,
    ressalva: r.diag ? r.diag.ressalva_que_tem_de_aparecer_na_tela : null,
    risco: r.diag ? r.diag.risco : null,
    o_que_nao_consegui: r.diag ? r.diag.o_que_nao_consegui : null,
    conferencia: r.chk,
  })),
}
