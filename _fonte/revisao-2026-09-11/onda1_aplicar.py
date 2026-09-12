# -*- coding: utf-8 -*-
"""Onda 1: aplica os 63 patches + os ajustes que os ceticos pediram.
   python3 aplicar.py          -> so confere (nao escreve)
   python3 aplicar.py --real   -> escreve nos arquivos"""
import json, io, os, sys

RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
SCR = os.path.dirname(os.path.abspath(__file__))
REAL = '--real' in sys.argv
P = json.load(io.open(os.path.join(SCR, 'patches.json'), encoding='utf-8'))

SBMARGEM_NOVO = u"""/* Margem de 95% da diferenca sobe x cai, em pontos percentuais, por Welch — que e o certo
   quando as duas faixas tem dispersoes diferentes, e tem. O t NAO pode ser fixo em 2,04:
   `pctFicou` so existe em 6 clubes que subiram e 8 que cairam (44 dos 100 clube-temporada
   nao estavam na Serie B no ano anterior), ali o df de Welch e 8 e o t e 2,31. Com 2,04 a
   margem sai um ponto menor e a linha passa por achado sem ser. */
function sbT95(df) {
  const T = [[1, 12.71], [2, 4.30], [3, 3.18], [4, 2.78], [5, 2.57], [6, 2.45], [7, 2.36], [8, 2.31],
             [9, 2.26], [10, 2.23], [12, 2.18], [14, 2.14], [16, 2.12], [18, 2.10], [20, 2.09],
             [25, 2.06], [30, 2.04], [40, 2.02], [60, 2.00]];
  for (let i = 0; i < T.length; i++) if (df <= T[i][0]) return T[i][1];
  return 1.96;
}
function sbMargem(campo) {
  const gr = { sobe: [], meio: [], cai: [] };
  sbComp().forEach(x => {
    const v = x[campo];
    if (v !== null && v !== undefined && !isNaN(v)) gr[x.faixa].push(v);
  });
  if (gr.sobe.length < 3 || gr.cai.length < 3) return NaN;
  const va = a => { const m = sbMedia(a); return a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - 1); };
  const a = va(gr.sobe) / gr.sobe.length, b = va(gr.cai) / gr.cai.length;
  const df = (a + b) * (a + b) / (a * a / (gr.sobe.length - 1) + b * b / (gr.cai.length - 1));
  return sbT95(df) * Math.sqrt(a + b);
}
"""

SBMARGEM_VELHO = u"""/* Margem de 95% da diferenca sobe x cai, em pontos percentuais, por Welch — que e o certo
   quando as duas faixas tem dispersoes diferentes, e tem. 2,04 e o t de Student a 95% com
   ~30 graus de liberdade (16 de cada lado); usar o 1,96 da normal encolheria a margem em 4%
   justamente onde ela decide se a frase sai ou nao. */
function sbMargem(campo) {
  const g = { sobe: [], meio: [], cai: [] };
  sbComp().forEach(x => {
    const v = x[campo];
    if (v !== null && v !== undefined && !isNaN(v)) g[x.faixa].push(v);
  });
  if (g.sobe.length < 3 || g.cai.length < 3) return NaN;
  const va = a => { const m = sbMedia(a); return a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - 1); };
  return 2.04 * Math.sqrt(va(g.sobe) / g.sobe.length + va(g.cai) / g.cai.length);
}
"""

# ---- ajustes dentro do new_string: (item, marcador, velho, novo) ----
AJUSTES = [
 ('grafico2026', 'const p38 =',
  "    const p38 = p => parcial ? p / j * 38 : p;",
  "    const p38 = x => parcial ? x.pts / x.j * 38 : x.pts;   /* cada clube pelos SEUS jogos */"),
 ('grafico2026', 'xSeis:',
  "xSeis: p38(t[5].pts), xDois: p38(t[1].pts) }",
  "xSeis: p38(t[5]), xDois: p38(t[1]) }"),

 ('razoes', 'é maior em casa',
  "<b>A vantagem de quem sobe não é maior fora — é maior em casa.</b>",
  "<b>A vantagem de quem sobe não é maior fora de casa.</b>"),
 ('razoes', 'é a mesma contra os fortes',
  "<b>A vantagem de quem sobe é a mesma contra os fortes e contra os fracos.</b>",
  "<b>A vantagem de quem sobe não é maior contra os fortes.</b>"),
 ('razoes', 'a menor delas é justamente',
  "e a menor delas é justamente a dos jogos grandes.",
  "e a dos jogos grandes não é a maior."),
 ('razoes', 'reage mais',
  "<b>quem cai ' +\n    'reage mais</b>, não menos.",
  "<b>quem cai ' +\n    'não reage menos</b> que quem sobe."),
 ('razoes', "sbN2(sbRho('reacaoD'))",
  "sbN2(sbRho('reacaoD'))", "sbN2s(sbRho('reacaoD'))"),

 ('empates', 'empateCorte:',
  "empateCorte: { baixo: corteBaixo, alto: corteAlto }, empateFaixa, desempate,",
  "empateCorte: { baixo: corteBaixo, alto: corteAlto }, empateFaixa, desempate, nTodos: todos.length,"),
 ('empates', 'const corte = (frente.pos',
  "        const corte = (frente.pos <= 4 && atras.pos > 4) ? 4\n                    : (frente.pos <= 6 && atras.pos > 6) ? 6 : 0;",
  "        const corte = (frente.pos <= 2 && atras.pos > 2) ? 2\n                    : (frente.pos <= 4 && atras.pos > 4) ? 4\n                    : (frente.pos <= 6 && atras.pos > 6) ? 6 : 0;"),
 ('empates', "dos 80</b> clube-temporada",
  "R.desempate.clubes + ' dos 80</b> clube-temporada terminaram empatados em pontos com um rival do mesmo ' +",
  "R.desempate.clubes + ' dos ' + R.nTodos + '</b> clube-temporada terminaram empatados em pontos com um ' +\n      'rival do mesmo ' +"),

 ('maoSecao3', 'const cita =',
  "  const cita = L => L.length ? L.map(x => esc(x.clube) + ' em ' + x.ano).join(', ') : '—';",
  "  const cita = L => L.length ? L.map(x => esc(x.clube) + ' em ' + x.ano).join(', ') : '—';\n"
  "  /* 'apenas' so pode sair quando o caso for mesmo unico — senao a prosa mente sozinha. */\n"
  "  const casos = L => !L.length ? '<b>nenhum</b>'\n"
  "    : (L.length === 1 ? 'apenas <b>' : '<b>') + cita(L) + '</b>';"),
 ('maoSecao3', 'melhorAtqSubiu',
  "'</b> vezes; a melhor ' +\n      'defesa, <b>' + P.melhorDefSubiu + '</b>.",
  "'</b> ' +\n      (P.melhorAtqSubiu === 1 ? 'vez' : 'vezes') + '; a melhor defesa, <b>' + P.melhorDefSubiu + '</b>."),
 ('maoSecao3', 'subiuSemAtaque',
  "fora do top 10 apenas <b>' + cita(P.subiuSemAtaque) +\n      '</b>, e com defesa fora do top 10 apenas <b>' + cita(P.subiuSemDefesa) + '</b>.",
  "fora do top 10 ' + casos(P.subiuSemAtaque) +\n      ', e com defesa fora do top 10 ' + casos(P.subiuSemDefesa) + '."),

 ('fisicoFaixas', 'td.sb-meia',
  ".sb-tab-det td.sb-meia{color:var(--sb-sobe);font-weight:500;opacity:.58}",
  ".sb-tab-det td.sb-meia{color:var(--sb-sobe);font-weight:500;opacity:.85}"),
 ('fisicoFaixas', '.sb-leg-5',
  "/* a legenda do cabecalho usa a mesma tinta das celulas que ela explica */\n.sb-leg-5{color:var(--sb-sobe);opacity:.58;font-weight:500}\n.sb-leg-1{color:var(--sb-sobe);font-weight:700}",
  "/* a legenda do cabecalho usa a mesma tinta das celulas que ela explica. Sem opacidade: a\n   .sb-rot e 9,5px em caixa alta com letter-spacing, e ali so o peso separa sem apagar. */\n.sb-leg-5{color:var(--sb-sobe);font-weight:500}\n.sb-leg-1{color:var(--sb-sobe);font-weight:800}"),
 ('fisicoFaixas', 'mudando peso e opacidade',
  "mudando peso e opacidade, para a rampa\n   apagado -> 5% -> 1% ser lida de relance sem inventar uma terceira tinta. Apagado NAO\n   some:",
  "mudando peso e um toque de opacidade, para\n   a rampa apagado -> 5% -> 1% ser lida de relance sem inventar uma terceira tinta. A\n   opacidade e .85 e nao menos porque abaixo disso a celula ACESA fica com menos contraste\n   que a APAGADA e a rampa se inverte. Apagado NAO some:"),
 ('fisicoFaixas', 'mediana de ', "mediana de ", "média de "),

 ('achadoNitido', 'das quatro medidas fora',
  "das quatro medidas fora ' +\n    'de posse só os",
  "das três medidas ' +\n    'distintas fora de posse (metros por minuto e distância são a mesma) só os"),
 ('achadoNitido', 'correr rápido sem a bola',
  "<b>Correr mais sem a bola não separa; correr rápido sem a bola, ' +\n    'sim.</b>",
  "<b>Correr mais sem a bola não separa; esprintar sem a bola, ' +\n    'sim.</b>"),

 ('metodo', 'Por isso os dois quadros',
  "'nada tivesse relação com nada. Por isso os dois quadros passam por <b>Benjamini-Hochberg a 5%</b>, ' +\n      'que controla a proporção de falsos achados no conjunto em vez de julgar cada linha como se fosse a ' +\n      'única pergunta do dia.</p>' +",
  "'nada tivesse relação com nada. Por isso <b>esta seção</b> passa os dois quadros por ' +\n      '<b>Benjamini-Hochberg a 5%</b>, que controla a proporção de falsos achados no conjunto em vez de ' +\n      'julgar cada linha como se fosse a única pergunta do dia. A correção mora aqui, não nas tabelas: ' +\n      'lá elas continuam mostrando tudo o que foi medido, e é aqui que se lê quanto disso resiste.</p>' +"),
 ('metodo', 'não cai nenhum, porque ali',
  "— não cai nenhum, porque ali quem passa passa por muito.",
  "— não cai nenhum."),
 ('metodo', "['minutos de estrangeiros', 'minEstr'],",
  "  ['minutos de estrangeiros', 'minEstr'],\n];",
  "  ['minutos de estrangeiros', 'minEstr'],\n  ['acertar o alvo no chute', 'remBal'], ['ganhar duelo aéreo', 'aereos'],\n];"),
 ('metodo', 'function sbMargem', SBMARGEM_VELHO, SBMARGEM_NOVO),
 ('metodo', 'clubes de cada lado',
  "'sentidos. São ' + F.sobe + ' clubes de cada lado, e a margem de 95% da diferença entre eles sai da ' +",
  "'sentidos. São ' + F.sobe + ' clubes de cada lado na maioria das linhas — e menos onde a base não ' +\n      'cobre o ano anterior —, e a margem de 95% da diferença entre eles sai da ' +"),
]

# ---- patches novos que os ceticos pediram ----
EXTRA = [
 ('euros', {'arquivo': RAIZ + '/static/app.js',
   'old_string': "/* Onde o dinheiro esta — e a unica linha em que quem cai investe mais. */",
   'new_string': "/* Onde o dinheiro esta. A \"unica linha em que quem cai investe mais\" era o ataque, e era\n"
                 "   artefato do snapshot do Wyscout: com o valor por temporada do Transfermarkt a diferenca\n"
                 "   de fatia no ataque caiu de 13 pontos para 2. So a defesa sobra, com 5. */",
   'justificativa': 'CETICO: o cabecalho da funcao repetia a conclusao que morreu.'}),
 ('achadoNitido', {'arquivo': RAIZ + '/static/style.css',
   'old_string': ".sbx-fam .sb-rot i{font-style:normal;font-weight:600;text-transform:none;letter-spacing:0;",
   'new_string': ".sb-rot i{font-style:normal;font-weight:600;text-transform:none;letter-spacing:0;",
   'justificativa': 'CETICO: o <i> do cabecalho novo esta fora de .sbx-fam e nao pegaria a regra.'}),
]

# ---- ajustes dentro do new_string do patch 9 de euros (PATCH 15 do cetico) ----
AJUSTES += [
 ('euros', 'em volta do',
  "'</b> — os três em volta do ", "'</b> — nenhum acima do "),
 ('euros', 'faixa em que esta aba não afirma nada',
  "pontos: <b>a ' +\n    'faixa em que esta aba não afirma nada</b>, porque dois ou três pontos percentuais entre 16 clubes e ' +\n    '16 são ruído.",
  "pontos: <b>na ' +\n    'borda do que esta aba chama de ruído</b>, porque entre 16 clubes e 16 dois ou três pontos ' +\n    'percentuais não são achado."),
]


RESSALVA1_NOVA = u"""      '<p><b>1. O valor por setor estava errado ate 12/09/2026, e a correcao derrubou uma ' +
      'conclusao.</b> As cinco linhas de dinheiro por setor — EUR parados na defesa, no meio e no ' +
      'ataque, e as duas fatias — somavam a coluna "Valor de mercado" do <b>Wyscout</b>, que traz o ' +
      'valor do dia da exportacao e nao o da temporada: dos 558 atletas que aparecem em duas ' +
      'temporadas ou mais, <b>489 carregam la o mesmo valor em todas</b>. O retrato de 2026 estava ' +
      'sendo aplicado ao elenco de 2022. Agora as cinco saem do <b>Transfermarkt</b>, que tem valor ' +
      'por temporada (dos 709 atletas com valor em dois anos ou mais, 591 mudam de valor entre eles). ' +
      'O que mudou na tela: "EUR parados na DEFESA" caiu de 0,56 para \' + sbN2(sbRho(\'valDef\')) + \' e ' +
      'deixou de ser uma das linhas destacadas do quadro geral; "EUR parados no ATAQUE" subiu de 0,29 ' +
      'para \' + sbN2(sbRho(\'valAtq\')) + \'; e a conclusao de que <b>quem cai concentra o orcamento no ' +
      'ataque nao sobreviveu</b> — a diferenca de fatia entre os dois grupos caiu de 13 pontos para ' +
      sbN1(Math.abs(sbPorFaixa(\'shAtq\').sobe - sbPorFaixa(\'shAtq\').cai)) + \'. A ressalva que fica e de ' +
      '<b>cobertura</b>: o Transfermarkt publica valor para \' + sbN1(sbCobValor()) + \'% dos atletas do ' +
      'plantel, e quem nao tem valor entra como zero — o valor de elenco desta aba, total e por setor, ' +
      'e <b>piso</b>, nao retrato completo.</p>' +
"""

def fundir_euros_metodo():
    """O item `metodo` reescreve a Secao 10 inteira e apagaria a ressalva que o item `euros`
       inseriu la. Pior: a ressalva 1 do `metodo` descreve como defeito VIVO exatamente o que
       o `euros` conserta, e cita 99,5% onde a medicao (conferida a mao) da 87,6%. Entao: o
       patch do euros na Secao 10 sai, e a ressalva 1 do metodo vira o texto do euros."""
    s = P['metodo'][0]['new_string']
    ini = s.find("      '<p><b>1. O dinheiro por setor")
    fim = s.find("daquela temporada.</p>' +", ini)
    assert ini > 0 and fim > ini, 'paragrafo da ressalva 1 nao encontrado'
    fim = s.find(chr(10), fim) + 1
    P['metodo'][0]['new_string'] = s[:ini] + RESSALVA1_NOVA + s[fim:]
    del P['euros'][11]   # o paragrafo da Secao 10 que o metodo apagaria
    print('FUSAO euros x metodo: ressalva 1 reescrita (%d -> %d chars), patch 12 do euros removido'
          % (fim - ini, len(RESSALVA1_NOVA)))


ORDEM = ['euros', 'razoes', 'grafico2026', 'empates', 'maoSecao3', 'fisicoFaixas', 'achadoNitido', 'metodo']

def main():
    fundir_euros_metodo()

    # 1) ajustes
    falhas = []
    for item, marc, velho, novo in AJUSTES:
        alvo = [i for i, p in enumerate(P[item]) if marc in p['new_string'] and velho in p['new_string']]
        if len(alvo) != 1:
            cand = [i for i, p in enumerate(P[item]) if marc in p['new_string']]
            falhas.append('%-13s %-34s -> %d alvos (marcador em %s)' % (item, marc[:34], len(alvo), cand)); continue
        p = P[item][alvo[0]]
        if p['new_string'].count(velho) != 1:
            falhas.append('%-13s %-34s -> fragmento %dx no mesmo patch' % (item, marc[:34], p['new_string'].count(velho))); continue
        p['new_string'] = p['new_string'].replace(velho, novo)
    print('AJUSTES: %d de %d aplicados' % (len(AJUSTES) - len(falhas), len(AJUSTES)))
    for f in falhas: print('   FALHA ' + f)
    if falhas: return 1

    for item, novo in EXTRA:
        P[item].append(novo)
    print('PATCHES EXTRA: %d acrescentados' % len(EXTRA))

    # 2) aplicacao
    total, erros = 0, []
    cache = {}
    for item in ORDEM:
        for i, p in enumerate(P[item]):
            arq = p['arquivo']
            if arq not in cache:
                cache[arq] = io.open(arq, encoding='utf-8').read()
            n = cache[arq].count(p['old_string'])
            if n != 1:
                erros.append('%-13s patch %2d  %-22s old_string aparece %dx' % (item, i, arq.split('/')[-1], n)); continue
            cache[arq] = cache[arq].replace(p['old_string'], p['new_string'])
            total += 1
    print('APLICADOS: %d de %d' % (total, sum(len(P[k]) for k in ORDEM)))
    for e in erros: print('   ERRO ' + e)
    if erros: return 1

    if REAL:
        for arq, txt in cache.items():
            io.open(arq, 'w', encoding='utf-8').write(txt)
            print('   escrito: %s (%d KB)' % (arq.split('/')[-1], len(txt.encode('utf-8')) / 1024))
    else:
        print('(dry-run — nada escrito; use --real)')
    return 0

sys.exit(main())
