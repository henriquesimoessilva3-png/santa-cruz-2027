export const meta = {
  name: 'desmarques-jogadores-que-subiram',
  description: 'Lista dos jogadores dos 16 times que subiram (2022-2025) com os seis numeros de desmarque do SkillCorner e a posicao de cada um entre os jogadores do mesmo setor na Serie B do ano, conferida por caminho independente',
  phases: [
    { title: 'Extrair', detail: 'um agente monta o JSON a partir da base fisica' },
    { title: 'Conferir', detail: 'recalculo independente e fechamento com o numero do time' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/scratchpad'
const W = S + '/desmarques'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Estudo da Serie B. PEDIDO DO DONO (14/09): "montar a lista dos jogadores dos times que subiram" com os numeros de DESMARQUE (corridas sem bola, Off Ball Runs do SkillCorner), para ver quem puxa o time para cima. Contexto: no estudo, os desmarques do time inteiro e por setor (colunas fis_runs_*_p30tip e fis_<setor>_runs_*_p30tip de dados/serieb_clube_temporada.csv / dados/prototipo.json) ficam quase sempre acima em quem subiu, por pouco, e nenhum passa na conta dos muitos testes.
OS SEIS NUMEROS (a cada 30 min com a bola do time, "p30tip"): corridas sem bola (runs), acima da corrida rapida (runs_above_hsr), que entram na area (runs_penalty_area), que quebram linha / perigosas (runs_dangerous), que receberam a bola (runs_received), que viraram remate em 10 s (runs_shot_within_10s). Confira os nomes exatos das colunas e o de-para no codigo: analisar_serieb.py (SC_OBR ~linha 487, fisico ~534, corte de 300+ min ~685, media ponderada por minuto, grupos de setor GRUPOS_FIS ~586) e gerar_raio_serieb.py (DE_PARA_OBR, carregar()). Use a MESMA base por jogador e temporada que o estudo usa para montar os numeros do time (a de ~1.780 atletas-temporada da Serie B 2022-2025) e as MESMAS regras (quem conta, corte de minutos, setor de cada posicao). Nao use dados/jogadores.json (e o periodo atual, nao a temporada historica).
REGRAS: nenhum numero inventado; ausencia com motivo (liga/temporada sem desmarque, jogador abaixo do corte); cuidado com homonimos (ligue por id do SkillCorner, nunca so por nome); 2026 fora. Nenhum arquivo do projeto e escrito: tudo em ${W}. PROIBIDO qualquer git. NAO use as portas 5090/5091. Outra sessao do Claude esta mexendo em app.js/app.py/templates/dados de cenarios: nao toque.`

const LISTA = { type: 'object', properties: {
  arquivo_json: { type: 'string' },
  fonte_e_regras: { type: 'string' },
  cobertura: { type: 'string' },
  destaques_por_time: { type: 'string' },
  fecha_com_o_numero_do_time: { type: 'string' },
  riscos: { type: 'array', items: { type: 'string' } },
}, required: ['arquivo_json', 'fonte_e_regras', 'cobertura', 'destaques_por_time', 'fecha_com_o_numero_do_time', 'riscos'] }
const CONF = { type: 'object', properties: {
  conferidos: { type: 'integer' }, medidas: { type: 'string' },
  problemas: { type: 'array', items: { type: 'object', properties: { onde: { type: 'string' }, o_que_vi: { type: 'string' }, conserto: { type: 'string' }, gravidade: { type: 'string', enum: ['quebra', 'mente', 'falta', 'detalhe'] } }, required: ['onde', 'o_que_vi', 'conserto', 'gravidade'] } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['conferidos', 'medidas', 'problemas', 'veredito'] }

const P_EXTRAIR = `SUA TAREFA: montar ${W}/lista.json com:
- regra: texto curto com a fonte, a unidade, o corte de minutos, como o setor foi decidido e como o percentil foi calculado;
- times: os 16 clube-temporadas que subiram em 2022-2025 (posicao final 1-4), cada um com ano, clube, posicao_final, pontos, e a mediana do time (os seis numeros do time inteiro como o estudo grava) e por setor;
- em cada time, jogadores: nome (como o SkillCorner escreve, e o nome curto do Wyscout/Transfermarkt se casar por id), id_skillcorner, setor (zaga/lateral/meio/ataque; goleiro fora com motivo), posicao, minutos rastreados, partidas, os seis numeros, e para cada numero o PERCENTIL dentro da Serie B daquele ano, entre os jogadores do MESMO SETOR com o mesmo corte de minutos (0 a 100, 100 = o maior), e se o jogador entra na conta do time (corte de minutos);
- referencia: por ano e setor, a mediana da Serie B inteira e a dos times do meio e dos que cairam, nos seis numeros.
Depois, FECHAMENTO: para 4 times, refaca o numero do time inteiro a partir dos jogadores (com a regra do estudo, media ponderada por minuto) e compare com fis_runs_*_p30tip do CSV do clube-temporada; tem de bater (diga a tolerancia). Em destaques_por_time, os 2 jogadores de cada time com o maior percentil medio nos seis numeros, e os de desmarque para a area acima do percentil 80.`

phase('Extrair')
const lista = await agent(`${CASA}\n\n${P_EXTRAIR}`, { label: 'extrai', phase: 'Extrair', schema: LISTA, effort: 'high' })

phase('Conferir')
const conf = lista ? await agent(`${CASA}\n\nO extrator relatou:\n${JSON.stringify(lista, null, 1).slice(0, 20000)}\n\nVOCE CONFERE, e a sua inclinacao e achar erro. Voce so le e escreve em ${W}/conferencia. Por caminho proprio (sem importar os scripts do extrator): (1) os 16 times certos (posicao 1-4, 2022-2025) e ninguem faltando nem sobrando do elenco rastreado de cada um, respeitando o corte; (2) 20 jogadores sorteados: os seis numeros batem com a fonte e o setor com o de-para do estudo; (3) o percentil de 10 desses 20 recalculado dentro do ano e do setor; (4) o fechamento com o numero do time em 6 times (nao so os 4 do extrator); (5) homonimos: algum jogador ligado ao time errado ou contado duas vezes? (6) as referencias por setor (Serie B, meio, cairam) em 2 anos.`,
  { label: 'confere', phase: 'Conferir', schema: CONF, effort: 'high' }) : null

let fix = null
if (conf && conf.problemas.some(p => p.gravidade !== 'detalhe')) {
  phase('Conferir')
  fix = await agent(`${CASA}\n\nRODADA DE CONSERTO do ${W}/lista.json. Problemas:\n${JSON.stringify(conf.problemas, null, 1).slice(0, 15000)}\nConfirme cada um, conserte, refaca o fechamento com o numero do time e devolva o relato.`,
    { label: 'conserta', phase: 'Conferir', schema: LISTA, effort: 'high' })
}
return { lista, conferencia: conf, conserto: fix }
