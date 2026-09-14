/* ================= aba Protótipo — etapas 5, 6, 7 e 8 =================

   O miolo do estudo: o que os dezesseis que subiram tinham (5), se aquilo se repete no ano
   seguinte (6), se veio antes do desfecho ou junto com ele (7), e o que acontece quando se
   tenta transformar isso em grupos de times (8).

   A regra é a da casa e não tem exceção aqui: **o dado é a fonte, o texto é consequência.**
   Nenhum número deste arquivo foi digitado. Onde o `prototipo.json` não traz o que a
   ESPECIFICACAO pede, a tela escreve a ausência e o motivo, em vez de calar ou imputar —
   e há três casos assim, todos marcados no lugar em que o leitor sentiria falta.

   Contrato: static/proto_contrato.md. Os helpers `pt…` são de proto.js e NÃO são
   redefinidos aqui; o que é só destas quatro etapas leva o prefixo `pb`.

   Por que quase tudo nesta parte da aba é matriz e dispersão, e não um número grande: as
   quatro etapas existem para mostrar VARIAÇÃO — entre clubes, entre anos, entre o bruto e o
   parcial, entre o observado e o nulo. Um número grande no meio da tela diria "é isto", e o
   assunto destas etapas é justamente que não é. */
'use strict';

/* ---------------- pedaços comuns às quatro etapas ----------------

   Os identificadores curtos (`ppda`, `fis_distance_p90`) são a chave do dado em toda parte;
   o nome legível mora só no catálogo da etapa 2. Ler de lá é o que evita um segundo
   dicionário de nomes escrito à mão neste arquivo — que é como um app passa a ter dois
   nomes para a mesma coluna e ninguém sabe qual está certo. */
let PB_NOMES = null;
function pbNomes() {
  if (PB_NOMES) return PB_NOMES;
  PB_NOMES = {};
  const linhas = (typeof PROTO !== 'undefined' && PROTO.etapa_2 && PROTO.etapa_2.linhas) || [];
  linhas.forEach(l => { if (l && l.indicador) PB_NOMES[l.indicador] = l.nome || l.indicador; });
  return PB_NOMES;
}
function pbNome(id) {
  const m = pbNomes();
  /* O nome popular sai do dicionário único da casca (ptNomeIndicador), para que a etapa 6 e a 11
     não chamem a mesma medida de dois jeitos. Fora do catálogo, a chave traduzida. */
  return Object.prototype.hasOwnProperty.call(m, id) ? ptNomeIndicador(id) : ptNomeMedida(id);
}
/* Quando o catálogo não conhece a coluna, a tela mostra o id cru — e diz que é id cru, em
   vez de fingir que aquilo é o nome do indicador. */
function pbSemNome(id) { return !Object.prototype.hasOwnProperty.call(pbNomes(), id); }

/* Rótulo a partir da própria chave do JSON. Usado onde a coluna tem um corte embutido no
   nome (`passam5_SM`, `bh5_SM`): inventar um título em português significaria digitar o
   corte — "passam a 5%" — e corte digitado é número escrito à mão. O nome da chave é o
   número, e ele vem do arquivo. */
function pbRotChave(k) { return String(k).replace(/_/g, ' '); }

/* A paleta é a que existe dentro de #pgProto; quatro categorias precisam de quatro tons e
   não há mais do que estes quatro semânticos no CSS da aba. A ordem é a ordem do dado. */
const PB_CORES = ['var(--pt-alto)', 'var(--pt-baixo)', 'var(--pt-ok)', 'var(--coral)'];
function pbCor(i) { return PB_CORES[i % PB_CORES.length]; }

/* O corte de significância NÃO é digitado aqui. Ele é o `poder.alfa` da etapa 0 — o mesmo
   alfa com que o estudo calculou o d mínimo detectável —, e vem de lá para que, no dia em
   que o pipeline mudar de corte, estas contagens mudem junto em vez de continuarem contando
   pelo corte de ontem. Quando o alfa não vier, a tela não conta nada e diz por quê: um
   "passam 9" calculado com corte inventado seria pior que nenhum número. */
function pbAlfa() {
  const p = (typeof PROTO !== 'undefined' && PROTO.etapa_0 && PROTO.etapa_0.poder) || {};
  return (p.alfa === undefined || p.alfa === null) ? null : Number(p.alfa);
}
function pbPassa(p) {
  const a = pbAlfa();
  return a !== null && p !== null && p !== undefined && p < a;
}
function pbConta(v) {
  return v === null
    ? ptFalta('o arquivo não diz qual é a linha de corte da sorte (etapa_0.poder.alfa) — sem ela a tela não conta quem passou')
    : ptInt(v);
}

/* Passou / não passou com cor, e com a palavra escrita: cor sozinha não é lida por quem
   não distingue os dois tons, e nesta aba metade dos testes não passou. */
function pbSelo(passou) {
  return passou
    ? '<b style="color:var(--pt-ok)">passou</b>'
    : '<b style="color:var(--pt-nao)">não passou</b>';
}

function pbSvg(w, h, conteudo, maxLarg) {
  return '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" ' +
    'style="width:100%;height:auto;display:block' + (maxLarg ? ';max-width:' + maxLarg + 'px' : '') + '">' +
    conteudo + '</svg>';
}
function pbTxt(x, y, texto, opts) {
  const o = opts || {};
  return '<text x="' + x + '" y="' + y + '"' +
    (o.anc ? ' text-anchor="' + o.anc + '"' : '') +
    ' style="font-size:' + (o.tam || 10) + 'px;fill:' + (o.cor || 'var(--tinta3)') +
    (o.peso ? ';font-weight:' + o.peso : '') + ';font-variant-numeric:tabular-nums">' +
    esc(texto) + '</text>';
}

/* Faixa de desfecho como cor. Os três valores são categorias do próprio dado; o mapa existe
   para dar cor a categoria conhecida e tem saída para a desconhecida, porque se um dia
   aparecer uma quarta faixa o gráfico precisa desenhá-la em vez de sumir com ela. */
const PB_FAIXA_COR = { sobe: 'var(--pt-alto)', cai: 'var(--pt-baixo)', meio: 'var(--tinta3)' };
function pbCorFaixa(f) { return PB_FAIXA_COR[f] || 'var(--tinta2)'; }

/* ---------------- a tradução dos RÓTULOS que vêm do dado ----------------

   O vocabulário de estatística mora em proto.js (ptTamanho, ptAcaso, ptSorte, ptJunto,
   ptAcerto, ptTecnico) e não é redefinido aqui. O que segue é outra coisa: nomes de chave e
   de coluna que o arquivo escreve em sigla (`psv99`, `p30tip`, `clube-temporada`,
   `passam5_liq_SM`) e que chegavam à tela crus. A tradução é por pedaço de palavra, e todo
   número que aparece no rótulo continua saindo do próprio nome da chave — nada é digitado. */
function pbPopular(nome) {
  /* A tradução por pedaço deixava uma terceira língua ("corrida em alta velocidade distance").
     Agora é o dicionário único da casca. */
  return ptNomeMedida(nome);
}
/* A unidade em que o n foi contado, dita como se fala. */
function pbUnid(u) {
  return String(u === null || u === undefined ? '' : u)
    .replace(/clube-temporada/g, 'temporadas de clube')
    .replace(/\batleta\b/g, 'jogadores');
}
/* Como cada faixa de desfecho se diz numa frase. Faixa desconhecida sai com o nome cru. */
const PB_FAIXA_TXT = { sobe: 'subiu', cai: 'caiu', meio: 'ficou no meio' };
function pbFaixaTxt(f) { return PB_FAIXA_TXT[f] || String(f === undefined ? 'sem faixa no arquivo' : f); }
/* `tecnico_ind_zaga` → "técnico · por jogador · zaga". */
const PB_PEDACOS = { tecnico: 'técnico', fisico: 'físico', col: 'do time', ind: 'por jogador',
  elenco: 'elenco', zaga: 'zaga', lateral: 'lateral', meio: 'meio-campo', ataque: 'ataque' };
function pbRotPilar(k) {
  return String(k).split('_').map(p => PB_PEDACOS[p] || p).join(' · ');
}
/* Colunas da sensibilidade: o corte está no nome (`passam5`, `bh5`) e sai de lá. */
function pbRotSens(k) {
  const s = String(k);
  if (s === 'testes') return 'números testados';
  const m = /^(passam|bh)(\d+)(_liq)?_SM$/.exec(s);
  if (!m) return pbRotChave(s);
  /* O corte (o "5" de `passam5`) saiu do cabeçalho: repetido em quatro colunas ele não dizia o
     que era. Uma frase acima da tabela diz, uma vez, que "separam" é "dificilmente é sorte". */
  return (m[1] === 'passam' ? 'separam quem subiu do meio' : 'sobram, descontada a sorte de testar muito') +
    (m[3] ? ', descontado o dinheiro' : '');
}
/* Colunas de `vazios_por_setor`, com os números do próprio nome da chave. */
function pbRotVazio(k) {
  return String(k)
    .replace(/^clube_temporada_sem_(\d+)_atletas$/, 'temporadas de clube com menos de $1 jogadores no setor')
    .replace(/^minimo_de_atletas$/, 'menor número de jogadores num setor')
    .replace(/^marca_baixa_confianca_(\d+)_a_(\d+)$/, 'células marcadas por pouca gente ($1 a $2 jogadores)')
    .replace(/_/g, ' ');
}
/* "Quanto o grupo explica", em porcentagem — eta² é a fração da variação explicada. */
function pbExplica(eta2) {
  return eta2 === null || eta2 === undefined ? ptFalta('sem medida no arquivo') : ptPct(Number(eta2) * 100, 0);
}
/* Texto técnico LONGO: o `ptTecnico` não quebra linha (é feito para um número ao lado), e uma
   frase inteira nele estouraria a coluna. Mesma cor apagada, com quebra. */
function pbMiudo(html) {
  return html ? '<span class="pt-tec" style="white-space:normal;margin-left:0">' + html + '</span>' : '';
}
/* Os critérios da tipologia chegam como chave em caixa alta e sem acento (`TERRITORIO`, `ROTA`).
   O nome curto vai no gráfico; o longo diz o que o critério pergunta em campo. Critério novo, que
   o mapa não conhece, sai com o nome da chave. */
const PB_EIXOS = {
  TERRITORIO: ['território', 'território — o time joga no campo do adversário?'],
  ROTA: ['rota', 'rota — a bola chega pelo chão, com passe curto e certo, ou pelo alto?'],
};
/* O conjunto de uma tentativa de agrupar chega escrito "16 que subiram, 9 eixos" ou
   "80 clube-temporada, 9 eixos". Os números saem da própria string; "eixos" vira "grupos de
   números", que é o que eles são. Conjunto em outro formato sai como veio, com a unidade traduzida. */
function pb8Conjunto(s) {
  const t = String(s === null || s === undefined ? '' : s);
  let m = /^(\d+) que subiram, (\d+) eixos/.exec(t);
  if (m) return { quem: 'os ' + m[1] + ' que subiram', olhando: Number(m[2]) };
  m = /^(\d+) clube-temporada, (\d+) eixos/.exec(t);
  if (m) return { quem: 'as ' + m[1] + ' temporadas', olhando: Number(m[2]) };
  return { quem: pbUnid(t), olhando: null };
}
function pb8ConjuntoTxt(s) {
  const c = pb8Conjunto(s);
  return c.quem + (c.olhando !== null ? ', ' + ptInt(c.olhando) + ' grupos de números' : '');
}
/* Cada linha da lista de testes da tipologia chega com o nome técnico que o gerador escreveu
   ("bateria LIMPA (|rho|<0,50 contra os eixos) contra o NULO PLACEBO"). Na tela, a pergunta que
   o teste responde; o nome cru vai embaixo, em letra miúda. Teste que o mapa não reconhece
   aparece com o nome cru, porque inventar a pergunta seria pior. */
const PB8_PERGUNTAS = [
  [/bateria LIMPA/i, 'Só com números que não andam junto com os critérios, e contra o sorteio mais duro, as caixas ainda aparecem?'],
  [/bateria de fora contra o NULO PLACEBO/i, 'Com um sorteio de comparação mais duro, as caixas ainda aparecem em números de fora?'],
  [/bateria de fora.*rótulo sorteado/i, 'As caixas aparecem em números que não as construíram?'],
  [/silhueta/i, 'As caixas ficam separadas de verdade, ou é um mapa contínuo cortado?'],
  [/Jaccard/i, 'Um programa de agrupar acha grupos que saem iguais ao refazer a conta? (não são estas caixas)'],
  [/f[íi]sico.*sobrevive/i, 'Sobra algum número físico, descontada a sorte de testar muito?'],
  [/formação separa/i, 'A formação tática separa as caixas?'],
  [/dinheiro distingue/i, 'O dinheiro sozinho separa as caixas?'],
  [/partição rival/i, 'Uma divisão feita só com dinheiro explica o mesmo que as caixas?'],
  [/ROTA dentro do território alto/i, 'Entre os times que jogam no campo do adversário, o jeito de a bola chegar separa?'],
  [/ROTA dentro do território baixo/i, 'Entre os times que jogam mais atrás, o jeito de a bola chegar separa?'],
  [/tirar um time/i, 'Tirando um time da conta, as caixas continuam iguais?'],
  [/tirar um indicador/i, 'Tirando um número da montagem, as caixas continuam iguais?'],
];
function pb8Pergunta(teste) {
  const t = String(teste === null || teste === undefined ? '' : teste);
  const par = PB8_PERGUNTAS.find(p => p[0].test(t));
  return par ? par[1] : null;
}
function pbEixoCurto(k) { return (PB_EIXOS[k] || [String(k).toLowerCase()])[0]; }
function pbEixoNome(k) { return (PB_EIXOS[k] || [null, String(k).toLowerCase()])[1]; }

/* ---------------- o que estas etapas precisam e o helper compartilhado nao entrega ----

   Nada daqui e redefinicao de helper `pt*`: sao pecas so destas quatro etapas, com o
   prefixo do arquivo, para resolver tres casos em que a tela vinha AFIRMANDO o que ela
   mesma nao fazia. A casca nao foi tocada porque tres arquivos editando o mesmo proto.js
   ao mesmo tempo perdem trabalho um do outro. */

/* Concordancia de numero so na PALAVRA — o `ptCascaConcorda` devolve o numero junto, e
   aqui o numero precisa sair em negrito separado do verbo que concorda com ele. O comentario
   da casca ja avisa: cada um dos tres arquivos resolve o seu plural no seu arquivo. */
function pbPl(n, sing, plur) { return Math.abs(Number(n)) === 1 ? sing : plur; }

/* Cinza italico para o que esta no arquivo e NAO se sustenta. Nao e ausencia — para isso ha
   `ptFalta` —, e presenca contraditoria, e a diferenca entre as duas precisa ser visivel.
   O texto chega montado por quem chama: todo pedaco variavel passa por esc/ptInt antes. */
function pbCinza(html, dica) {
  return '<span class="pt-falta"' + (dica ? ' title="' + esc(dica) + '"' : '') + '>' + html + '</span>';
}

/* Casas decimais que o proprio numero tem. Serve para um title carregar o valor cheio sem
   inventar precisao que o dado nao tem nem perder a que ele tem. */
function pbCasas(v, max) {
  const s = String(v);
  const i = s.indexOf('.');
  return Math.min(i < 0 ? 0 : s.length - i - 1, max === undefined ? 4 : max);
}
function pbCheio(v) { return ptNum(v, pbCasas(v)); }

/* A faixa de baixa confianca nao vem num campo de valor: ela esta escrita no NOME da coluna
   de `vazios_por_setor` (`marca_baixa_confianca_3_a_4`). Ler os inteiros de dentro da chave
   — o mesmo caminho que `pbRotChave` usa para o corte de `passam5_SM` — e o que evita
   digitar "3 a 4" aqui, porque corte digitado sobrevive a mudanca do gerador e continua
   marcando pela faixa de ontem. Sem a chave nao ha faixa, e sem faixa a tela nao marca nada
   e DIZ que nao marca, em vez de prometer a marca no texto e entregar celula limpa. */
function pb5FaixaBaixa(d) {
  const v = (d && d.vazios_por_setor) || [];
  const chave = v.length ? Object.keys(v[0]).find(k => /baixa_confianca/.test(k)) : null;
  const nums = chave ? (String(chave).match(/\d+/g) || []).map(Number) : [];
  if (!nums.length) return null;
  return { chave: chave, min: nums[0], max: nums[nums.length - 1] };
}
function pb5Baixa(faixa, n) {
  return !!faixa && n !== null && n !== undefined && Number(n) >= faixa.min && Number(n) <= faixa.max;
}
/* A marca vai POR CIMA do `<td>` que o `ptCel` devolveu: o helper e compartilhado e nao pode
   ser alterado daqui, e nao existe classe de CSS para isto (e este arquivo nao escreve CSS).
   Contorno tracejado para o olho que varre, triangulo para quem nao distingue o tracejado,
   e o motivo somado ao title que o ptCel ja tinha montado. */
function pb5Marcar(td, dica) {
  const m = td
    .replace('<td class="', '<td style="outline:1px dashed var(--pt-baixo);outline-offset:-2px" class="')
    .replace('title="', 'title="' + esc(dica) + ' · ')
    .replace('</span></td>',
      '<sup style="color:var(--pt-baixo);font-size:9px;margin-left:2px">&#9651;</sup></span></td>');
  /* Se a marca nao pegou, o `ptCel` mudou de forma — ele e de outro arquivo e pode mudar sem
     aviso. Devolver null faz quem chama CONTAR a falha e escreve-la na legenda; devolver a
     celula limpa por baixo de um texto que promete marca seria repetir o defeito que este
     conserto veio corrigir, so que mais dificil de achar. */
  return m.indexOf('&#9651;') < 0 ? null : m;
}

/* `unidade_n` e rotulo escrito pelo gerador, e em dois paineis ele nao fecha com o proprio
   arquivo: a etapa 0 registra 20 clubes em cada ano da Serie B e a celula chega com n = 38
   dizendo "clube-temporada" — 38 e a contagem de rodadas (`J`) do mesmo ano. Quem conserta
   isso e o gerador; o que esta tela nao pode e imprimir a contradicao como fato. Devolve
   null quando o rotulo e plausivel e a MEDIDA da contradicao quando nao e. */
function pb5UnidadeSuspeita(n, unidade, ano) {
  if (String(unidade) !== 'clube-temporada' || n === null || n === undefined) return null;
  const anos = (typeof PROTO !== 'undefined' && PROTO.etapa_0 && PROTO.etapa_0.por_ano) || [];
  if (!anos.length) return null;
  const linha = anos.find(a => Number(a.ano) === Number(ano)) || null;
  const limite = linha ? Number(linha.n) : Math.max.apply(null, anos.map(a => Number(a.n)));
  if (!isFinite(limite) || !(Number(n) > limite)) return null;
  return {
    limite: limite,
    ano: linha ? linha.ano : null,
    jogos: linha ? Number(linha.J) : null,
    ehRodadas: !!linha && Number(linha.J) === Number(n),
  };
}
/* O maior n da etapa inteira contado na MESMA unidade. Serve para dar tamanho ao contraste
   que a rampa de cor esconde: dentro de um painel so, o maior n pode ser 5 e a frase fica
   sem forca; a rampa, porem, e a mesma em todos os paineis que contam na mesma unidade. */
function pb5MaxN(d, unidade) {
  let max = null;
  Object.keys((d && d.paineis) || {}).forEach(k => {
    const pa = d.paineis[k];
    if (String(((pa.indicadores || [])[0] || {}).unidade_n) !== String(unidade)) return;
    (pa.clubes || []).forEach(c => (c.celulas || []).forEach(x => {
      if (!x || x[2] === null || x[2] === undefined) return;
      if (max === null || Number(x[2]) > max) max = Number(x[2]);
    }));
  });
  return max;
}

/* A mesma ressalva, encurtada para caber no title da celula e no bloco que o clique abre —
   os dois lugares em que o rotulo cru tambem aparecia, e onde ele tambem era afirmacao. */
function pb5UnidadeCel(n, unidade, ano) {
  return pb5UnidadeSuspeita(n, unidade, ano)
    ? 'de unidade não confirmada (o arquivo diz "' + pbUnid(unidade) + '", mas isso não fecha com a etapa 0 — ' +
      'ver o aviso embaixo da tabela)'
    : pbUnid(unidade);
}

/* O teto de clubes que a propria aba declara, ano a ano. Vai para a ressalva da matriz em
   vez de um "20" digitado: se a Serie B mudar de tamanho, a frase muda junto. */
function pb5MaxClubes() {
  const anos = (typeof PROTO !== 'undefined' && PROTO.etapa_0 && PROTO.etapa_0.por_ano) || [];
  if (!anos.length) return null;
  return Math.max.apply(null, anos.map(a => Number(a.n)));
}
function pb5RotN(n, unidade, ano) {
  const s = pb5UnidadeSuspeita(n, unidade, ano);
  if (!s) return 'medido sobre ' + ptInt(n) + ' ' + esc(unidade ? pbUnid(unidade) : 'unidade não declarada');
  const conta = s.ano === null
    ? 'nenhum ano da etapa 0 passa de ' + ptInt(s.limite) + ' clubes'
    : ptAno(s.ano) + ' teve ' + ptInt(s.limite) + ' clubes na Série B' +
      (s.ehRodadas ? ' e ' + ptInt(s.jogos) + ' rodadas, e este número é o das rodadas' : '');
  /* Curto na linha porque ela se repete dezesseis vezes; a conta inteira vai no title e, uma
     vez so, no paragrafo ao pe da matriz. Repetir o paragrafo inteiro em cada linha faria o
     leitor parar de ler a ressalva — que e o mesmo efeito de nao escreve-la. */
  return 'medido sobre ' + ptInt(n) + ' ' + pbCinza('— não são ' + esc(pbUnid(unidade)) +
    (s.ano === null ? '' : ': ' + ptAno(s.ano) + ' teve ' + ptInt(s.limite) + ' clubes'),
    conta + ' (conferido contra etapa_0.por_ano do mesmo arquivo)');
}

/* O inteiro cabe na coluna da matriz, o valor cheio nao — e e o cheio que distingue 28,8 de
   29,4, que arredondados viram o mesmo "29". Ele sobrevive no title, que e o unico lugar
   desta linha onde ainda cabe. */
function pb5Q(v, rot) {
  if (v === null || v === undefined) return ptFalta('faixa ausente no arquivo');
  return '<span title="' + esc(rot + ' ' + pbCheio(v)) + '">' + ptNum(v, 0) + '</span>';
}

/* ================================================================================
   ETAPA 5 — os pilares, time a time, ano a ano
   ================================================================================

   Onze painéis, e é o próprio JSON que diz a que pilar cada um pertence. A ESPECIFICACAO
   pede QUATRO pilares (técnico individual, técnico coletivo, físico individual, físico
   coletivo); o arquivo entrega três valores em `pilar`, e o físico individual não vem como
   matriz clube × indicador em lugar nenhum desta chave. Isso não é arredondado aqui: a tela
   monta os grupos a partir do que existe e escreve, no lugar onde faltaria o quarto, o que
   falta e onde o que sobrou dele está.

   A matriz é montada à mão em vez de sair do `ptTabela` porque ela tem duas linhas de rodapé
   (a faixa do meio e a de quem caiu) que precisam ficar coladas em cada coluna de indicador.
   O preço é conhecido e está dito na tela: esta tabela não ordena por clique. */

function ptEtapa5(alvo, d) {
  const chaves = Object.keys(d.paineis || {});
  if (!chaves.length) {
    alvo.innerHTML = ptFaltaBloco('Nenhum painel nesta etapa',
      'o prototipo.json traz `etapa_5` sem a chave `paineis` — sem ela não há matriz para desenhar');
    return;
  }

  /* Os pilares saem do dado, na ordem em que aparecem. Escrever a lista à mão faria a tela
     mentir no dia em que o pipeline acrescentar ou tirar um painel. */
  const pilares = [];
  chaves.forEach(k => {
    const p = d.paineis[k].pilar;
    let g = pilares.find(x => x.pilar === p);
    if (!g) { g = { pilar: p, chaves: [] }; pilares.push(g); }
    g.chaves.push(k);
  });

  const totalInd = chaves.reduce((s, k) => s + (d.paineis[k].indicadores || []).length, 0);
  const nClubes = (d.paineis[chaves[0]].clubes || []).length;
  const semLado = chaves.reduce((s, k) =>
    s + (d.paineis[k].indicadores || []).filter(i => i.sinal === 0).length, 0);

  const seletor = pilares.map(g =>
    '<div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-top:7px">' +
      '<span class="pt-rot" style="min-width:112px">' + esc(pbRotPilar(g.pilar)) + '</span>' +
      g.chaves.map(k => {
        const p = d.paineis[k];
        return '<button class="bt mini" data-pb5="' + esc(k) + '">' + esc(pbRotPilar(k)) +
          ' <span style="color:var(--tinta3)">' + ptInt((p.indicadores || []).length) + '</span></button>';
      }).join('') +
    '</div>').join('');

  /* O que a ESPECIFICACAO pede e o JSON não tem: o pilar do físico INDIVIDUAL. A tela não
     procura um número de pilares (contar seria repetir aqui o que o documento diz); ela
     pergunta ao dado se existe painel de físico individual, e escreve a ausência quando não
     existe — que é o caso, porque o individual foi agregado no clube antes de ser testado. */
  const temFisicoInd = pilares.some(g => /fisico_ind/.test(String(g.pilar)));
  const falta4 = temFisicoInd ? ''
    : ptFaltaBloco('O físico de cada jogador não aparece nesta tabela',
        'o estudo previa estes olhares: técnico do jogador, técnico do time, físico do jogador e físico ' +
        'do time. O arquivo traz ' + ptInt(pilares.length) + ' (' +
        pilares.map(g => pbRotPilar(g.pilar)).join(', ') + '), e nenhum é o físico de cada jogador. ' +
        'Jogador a jogador, ele não vem aqui como time × número: o que existe dele no arquivo já está ' +
        'somado por clube antes do teste — para não contar o mesmo time uma vez por jogador — e é ' +
        'assunto da etapa 13. Esta etapa não desenha esse olhar, e não o ' +
        'inventa a partir dos setores físicos, que já são números do time.');

  alvo.innerHTML =
    '<p class="pt-nota">Aqui estão os <b>' + ptInt(nClubes) + '</b> times que subiram, um por linha, ' +
      'com <b>' + ptInt(totalInd) + '</b> números sobre eles, divididos em painéis. A cor de cada ' +
      'quadradinho é a <b>posição do time no ranking daquele ano</b>: ele foi comparado só com os outros ' +
      'clubes da mesma Série B, nunca com outra temporada. Cor forte numa ponta: estava entre os primeiros ' +
      'do ano. Na outra ponta: entre os últimos. Cor apagada: no meio do ranking, nem bem nem mal. Embaixo ' +
      'de cada coluna ficam a faixa dos times que terminaram no meio da tabela e a dos que caíram — é a ' +
      'comparação que interessa.' + ptTecnico('percentil dentro do ano') + '</p>' +
    (semLado
      ? '<p class="pt-nota">Em <b>' + ptInt(semLado) + '</b> das ' + ptInt(totalInd) + ' colunas o estudo ' +
        '<b>não disse se ter mais é bom ou ruim</b>. Ali a cor mostra só a posição no ranking, e ler o tom ' +
        'forte como "melhor" seria invenção da tela. Ao passar o mouse na célula, o aviso aparece.' +
        ptTecnico('sinal: 0') + '</p>'
      : '') +
    '<div class="pt-controle">' +
      '<span class="pt-rot">Escolha o painel</span>' + seletor +
    '</div>' +
    falta4 +
    '<div id="ptEt-5-painel"></div>' +
    '<div class="pt-controle" id="ptEt-5-lupa">' +
      '<span class="pt-rot">A célula aberta</span>' +
      '<p class="pt-nota">Clique em qualquer quadradinho da tabela: aqui aparecem o número medido, a ' +
      'posição no ranking do ano, de quantos jogadores ou jogos ele saiu e a temporada. A cor mostra a ' +
      'posição; a decisão se toma olhando o número medido.</p>' +
    '</div>' +
    pb5Sensibilidade(d) +
    pb5Vazios(d);

  pb5Pintar(alvo, d, chaves[0]);
}

/* Desenha um painel e volta a ligar o que o redesenho apaga. Fica fora de `ptEtapa5` porque
   é chamado de novo a cada troca de painel. */
function pb5Pintar(alvo, d, chave) {
  const caixa = alvo.querySelector('#ptEt-5-painel');
  if (!caixa) return;
  caixa.innerHTML = pb5Matriz(d, chave);
  alvo.querySelectorAll('[data-pb5]').forEach(b => {
    b.className = 'bt mini' + (b.dataset.pb5 === chave ? ' primario' : '');
    b.onclick = () => pb5Pintar(alvo, d, b.dataset.pb5);
  });
  /* O clique na célula escreve no bloco fixo abaixo da matriz em vez de abrir um balão: a
     matriz rola na horizontal, e um balão ancorado na célula sai da tela junto com ela. */
  const lupa = alvo.querySelector('#ptEt-5-lupa');
  caixa.querySelectorAll('td[data-pt]').forEach(td => {
    td.style.cursor = 'pointer';
    td.onclick = () => {
      let x = null;
      try { x = JSON.parse(td.dataset.pt); } catch (err) { x = null; }
      if (!x || !lupa) return;
      caixa.querySelectorAll('td[data-pt]').forEach(o => { o.style.outline = ''; });
      td.style.outline = '1px solid var(--tinta)';
      lupa.innerHTML =
        '<span class="pt-rot">A célula aberta</span>' +
        '<div class="pt-cf-grade" style="margin-top:9px">' +
          '<div class="pt-cf-l"><span>time e ano</span><b>' + esc(x.c) + ' · ' + ptAno(x.a) + '</b></div>' +
          '<div class="pt-cf-l"><span>o que se mede</span><b style="font-size:13px">' + esc(x.i) + '</b></div>' +
          '<div class="pt-cf-l"><span>o número medido</span><b>' + ptNum(x.b, 3) + '</b></div>' +
          '<div class="pt-cf-l"><span>posição no ranking do ano (quanto maior, mais alto)</span><b>' +
            ptNum(x.p, 1) + '</b></div>' +
          '<div class="pt-cf-l"><span>medido sobre</span><b>' + ptInt(x.n) + ' <span style="font-size:11px;' +
            'font-weight:400;color:var(--tinta3)">' + esc(x.u || '') + '</span></b></div>' +
          '<div class="pt-cf-l"><span>nome na base</span><b style="font-size:12px">' + esc(x.k) + '</b></div>' +
        '</div>' +
        '<p class="pt-nota">A posição vale <b>só para aquele ano</b>: este time foi comparado com os outros ' +
        'clubes da Série B de ' + ptAno(x.a) + ', e com mais ninguém. O mesmo número em outra temporada ' +
        'daria outra posição.</p>';
    };
  });
  if (typeof ptLigarTabelas === 'function') ptLigarTabelas(alvo);
}

function pb5Matriz(d, chave) {
  const p = d.paineis[chave];
  const inds = p.indicadores || [];
  const clubes = p.clubes || [];
  const leg = p.legenda_celula || [];
  const motivos = [];
  const unid = (inds[0] || {}).unidade_n || '';
  /* A faixa nao e escolha de tela: vem do nome da coluna do proprio arquivo. Se ela sumir do
     JSON, nada e marcado e o texto ao pe diz que nada foi marcado — o contrario do que esta
     tela fazia, que era prometer a marca no card dos vazios e desenhar a celula limpa. */
  const fbaixa = pb5FaixaBaixa(d);
  let marcadas = 0;                 /* celulas deste painel dentro da faixa */
  let suspeitas = 0;                /* linhas cujo rotulo de unidade nao fecha com a etapa 0 */
  let suspeitasJ = 0;               /* destas, as em que o n e exatamente o J (rodadas) do ano */
  let naoMarcadas = 0;              /* celulas na faixa que a marca nao alcancou (ptCel mudou) */
  const maxN = pb5MaxN(d, unid);    /* maior n na mesma unidade, para dar tamanho ao contraste */

  const cab = '<thead><tr><th class="txt" style="position:sticky;left:0;z-index:3;background:var(--fundo3)">' +
    'time e ano</th>' +
    inds.map(i => '<th class="num" title="' + esc(pbPopular(i.nome) + ' · nome na base ' + (i.origem || i.coluna_csv) +
      ' · medido sobre ' + pbUnid(i.unidade_n) + (i.sinal === 1 ? ' · ter mais é melhor' : i.sinal === -1
        ? ' · ter menos é melhor' : ' · o estudo não disse se ter mais é bom ou ruim')) + '">' +
      esc(pbPopular(i.nome)) + '</th>').join('') + '</tr></thead>';

  const corpo = clubes.map(c => {
    const cels = c.celulas || [];
    const nLinha = (cels.find(x => x && x[2] !== null && x[2] !== undefined) || [])[2];
    const vazia = cels.length && cels.every(x => x[1] === null || x[1] === undefined);
    const susp = pb5UnidadeSuspeita(nLinha, unid, c.ano);
    if (susp) { suspeitas++; if (susp.ehRodadas) suspeitasJ++; }
    const motivoLinha = vazia ? (cels[0][3] || 'sem motivo declarado no JSON') : '';
    return '<tr><td class="txt" style="position:sticky;left:0;z-index:1;background:var(--fundo2)">' +
      '<b>' + esc(c.clube) + '</b> ' + ptAno(c.ano) +
      '<small style="display:block;color:var(--tinta3);font-size:10.5px">' +
        ptInt(c.pos) + 'º · ' + ptInt(c.pts) + ' pontos · ' +
        (nLinha === undefined
          ? '<i>' + esc(motivoLinha) + '</i>'
          : pb5RotN(nLinha, unid, c.ano)) +
      '</small></td>' +
      cels.map((cel, j) => {
        const ind = inds[j] || {};
        const bruto = cel[0], pct = cel[1], n = cel[2], motivo = cel.length > 3 ? cel[3] : null;
        if (pct === null || pct === undefined) motivos.push(motivo || 'sem motivo declarado no JSON');
        /* O title e o bloco do clique levavam o mesmo rotulo cru que a linha levava; os tres
           saem agora pelo mesmo caminho, senao a contradicao sumiria da tela e continuaria
           inteira no lugar em que alguem vai conferir de perto. */
        const uniCel = pb5UnidadeCel(n, ind.unidade_n, c.ano);
        const td = ptCel(pct, {
          bruto: bruto, n: n, unidade: uniCel, ano: c.ano, sinal: ind.sinal, motivo: motivo,
          dados: (pct === null || pct === undefined) ? '' : JSON.stringify({
            c: c.clube, a: c.ano, i: ind.nome, k: (ind.origem || ind.coluna_csv),
            b: bruto, p: pct, n: n, u: uniCel,
          }),
        });
        /* Aqui a promessa vira marca. Uma celula de 3 atletas e uma de 20 saem do `ptCel` com
           a mesma rampa de cor — a cor e o percentil, nao a confianca —, e sem esta marca as
           duas se leem igual. */
        if (!pb5Baixa(fbaixa, n)) return td;
        const marcado = pb5Marcar(td, 'pouca gente — saiu de só ' + ptInt(fbaixa.min) + ' a ' +
          ptInt(fbaixa.max) + ' ' + pbUnid(ind.unidade_n || ''));
        if (marcado === null) { naoMarcadas++; return td; }
        marcadas++;
        return marcado;
      }).join('') + '</tr>';
  }).join('');

  /* As duas faixas ao pé. Elas são o que transforma a matriz de "lista de postos" em
     comparação: sem a faixa de quem caiu, um posto acima do meio parece bom sozinho. */
  const faixa = (arr, rot, dica) => '<tr><td class="txt" style="position:sticky;left:0;z-index:1;' +
    'background:var(--fundo3)" title="' + esc(dica) + '"><b>' + esc(rot) + '</b>' +
    '<small style="display:block;color:var(--tinta3);font-size:10.5px">faixa da metade central · típico em negrito</small></td>' +
    (arr || []).map(f => '<td class="num" style="color:var(--tinta3);font-size:10.5px">' +
      (!f ? ptFalta('faixa ausente no arquivo')
          : pb5Q(f[0], 'q1') + ' · <b style="color:var(--tinta2)">' + pb5Q(f[1], 'mediana') +
            '</b> · ' + pb5Q(f[2], 'q3')) +
      '</td>').join('') + '</tr>';

  const rodape = '<tfoot>' +
    faixa(p.faixa_meio, 'times que ficaram no meio', 'metade dos times que terminaram no meio da tabela ficou entre o primeiro e o último número; o do meio, em negrito, é o time típico — tudo em posição no ranking daquele ano (q1 · mediana · q3)') +
    faixa(p.faixa_cai, 'times que caíram', 'metade dos rebaixados ficou entre o primeiro e o último número; o do meio, em negrito, é o rebaixado típico — tudo em posição no ranking daquele ano (q1 · mediana · q3)') +
    '</tfoot>';

  return '<div class="pt-card-cab" style="margin-bottom:8px">' +
      '<h4>' + esc(pbRotPilar(chave)) + '</h4>' +
      '<span>' + ptInt(inds.length) + ' números · ' + ptInt(clubes.length) + ' times que subiram · ' +
      'cada número medido sobre ' + esc(unid ? pbUnid(unid) : 'unidade não declarada') +
      (suspeitas ? ' · ' + pbCinza('essa unidade não fecha com a etapa 0 — ver o aviso embaixo',
        'comparado com etapa_0.por_ano') : '') + '</span></div>' +
    '<div class="pt-tab-rola"><table class="pt-tab">' + cab + '<tbody>' + corpo + '</tbody>' + rodape +
    '</table></div>' +
    (leg.length
      ? '<p class="pt-nota">' + pbMiudo('ordem de cada célula no arquivo: ' + leg.map(esc).join(', ')) + '</p>'
      : '') +
    (motivos.length ? ptMotivos(motivos) : '') +
    (!fbaixa
      ? '<p class="pt-nota">' + ptFalta('o arquivo não diz a partir de quantos jogadores a média é fraca ' +
          '(coluna de baixa confiança em vazios_por_setor) — sem isso a tela não sabe o que marcar, e não ' +
          'marca célula nenhuma') + '</p>'
      : marcadas
        ? '<p class="pt-nota"><b>' + ptInt(marcadas) + '</b> ' +
          pbPl(marcadas, 'quadradinho deste painel tem', 'quadradinhos deste painel têm') +
          ' <b style="color:var(--pt-baixo)">&#9651;</b> e contorno tracejado: o número saiu de só <b>' +
          ptInt(fbaixa.min) + '</b> a <b>' + ptInt(fbaixa.max) + '</b> ' + esc(pbUnid(unid)) + '. É pouca ' +
          'gente para uma média firme. ' +
          (maxN !== null && maxN > fbaixa.max
            ? 'A cor não mostra isso: nesta etapa, um quadradinho feito com ' + ptInt(fbaixa.min) +
              ' jogadores sai com o mesmo tom de um feito com ' + ptInt(maxN) + '. '
            : '') +
          'A marca não muda o número — ela avisa de quantos ele saiu.' +
          pbMiudo(' faixa lida do nome da coluna ' + esc(fbaixa.chave) + ' de vazios_por_setor') +
          (naoMarcadas
            ? ' ' + ptFalta('outros ' + ptInt(naoMarcadas) + ' quadradinhos desta faixa ficaram SEM a marca: ' +
                'o `ptCel` da casca mudou de forma e a marca não achou onde entrar')
            : '') + '</p>'
        : '<p class="pt-nota">Nenhum quadradinho deste painel saiu de tão pouca gente (' +
          ptInt(fbaixa.min) + ' a ' + ptInt(fbaixa.max) + ' jogadores)' +
          (suspeitas
            ? ' — aqui o número não é contado em jogadores do setor, e o que ele conta é o aviso do ' +
              'parágrafo seguinte.</p>'
            : ': aqui cada número é medido sobre ' + esc(unid ? pbUnid(unid) : 'unidade não declarada') + '.</p>')) +
    (suspeitas
      ? '<p class="pt-nota"><b>Atenção:</b> ' +
        (suspeitasJ === suspeitas
          ? 'nesta tabela, a contagem que aparece como "' + esc(pbUnid(unid)) + '" na verdade é o <b>número ' +
            'de rodadas</b>' + (suspeitas === clubes.length ? '' : ', em ' + ptInt(suspeitas) + ' das ' +
            ptInt(clubes.length) + ' linhas') + '. '
          : 'nesta tabela, a contagem que aparece como "' + esc(pbUnid(unid)) + '" não pode ser isso' +
            (suspeitas === clubes.length ? '' : ', em ' + ptInt(suspeitas) + ' das ' + ptInt(clubes.length) +
            ' linhas') + ': passa do número de clubes da Série B. ') +
        'Está sendo corrigida. O número aparece como veio, com o aviso ao lado.' +
        pbMiudo(' a etapa 0 registra no máximo ' + ptInt(pb5MaxClubes()) + ' clubes por ano; ' +
          (suspeitasJ ? ptInt(suspeitasJ) + ' linhas batem exatamente com J (rodadas) do ano; ' : '') +
          'unidade_n = ' + esc(unid) + ' · comparado com n e J de etapa_0.por_ano · a correção é no gerador') + '</p>'
      : '') +
    '<p class="pt-nota">Esta tabela <b>não se reordena com clique</b>: as duas linhas de baixo precisam ' +
    'ficar embaixo de cada coluna, e reordenar as descolaria. Para ordenar por qualquer número, use a ' +
    'etapa 2, onde cada número é uma linha.</p>';
}

function pb5Sensibilidade(d) {
  const s = d.sensibilidade_da_agregacao;
  if (!s) return ptFaltaBloco('Mudar o jeito de somar os jogadores muda o resultado?',
    'o estudo exige refazer a conta com cada jeito de juntar os jogadores num número do time e mostrar ' +
    'quantos números passam em cada um; o arquivo não trouxe sensibilidade_da_agregacao');
  const regras = Object.keys(s);
  const campos = Object.keys(s[regras[0]] || {});
  const linhas = regras.map(r => Object.assign({ regra: r }, s[r]));
  const colunas = [{ k: 'regra', rot: 'jeito de juntar os jogadores', tipo: 'texto',
    dica: 'nome da regra como está no arquivo' }].concat(
    campos.map(c => ({ k: c, rot: pbRotSens(c), casas: 0,
      dica: 'coluna `' + c + '` do prototipo.json' })));
  /* Quantas conclusões mudam de uma regra para a outra: é o número que dá sentido ao bloco.
     Comparado contra a primeira regra listada, que é a que o pipeline usa como padrão. */
  const base = s[regras[0]];
  const divergem = campos.filter(c => regras.some(r => s[r][c] !== base[c]));
  return ptCard('Mudar o jeito de somar os jogadores muda o resultado',
    ptInt(regras.length) + ' jeitos de somar · ' + ptInt(campos.length) + ' contagens em cada um',
    '<p class="pt-nota">Para um número de jogador virar número do time, é preciso juntar os jogadores ' +
    'de algum jeito. Cada linha é um jeito. As colunas contam quantos números separam quem sobe de quem ' +
    'fica no meio: primeiro sem desconto nenhum; depois descontada a sorte — quando se testa muita coisa, ' +
    'alguma dá certo por sorte —; depois descontado também o dinheiro. Nesta tabela, <b>"separam" quer ' +
    'dizer "dificilmente é sorte"</b>.' +
    pbMiudo(' corte de ' + esc(campos.map(c => (/^(?:passam|bh)(\d+)/.exec(c) || [])[1]).filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i).join(' e ')) + '%') + '</p>' +
    ptTabela({
      id: 'ptEt-5-tab-sens',
      ordem: null,
      colunas: colunas,
      linhas: linhas,
      vazio: 'o arquivo não trouxe nenhum jeito de somar os jogadores',
    }),
    (divergem.length
      ? 'Entre os ' + ptInt(regras.length) + ' jeitos, <b>' + ptInt(divergem.length) + ' das ' +
        ptInt(campos.length) + '</b> contagens mudam. Resultado que muda quando só se muda a conta é da ' +
        'conta, não do futebol — por isso os ' + ptInt(regras.length) + ' jeitos ficam na tela, e não só ' +
        'o que o estudo usa por padrão.'
      : 'Nenhuma contagem muda entre os jeitos de somar — o que, aqui, é uma rara boa notícia desta aba.') +
    pbMiudo(' Colunas no arquivo: ' + campos.map(esc).join(', ') + ' · SM = sobe × meio · bh = Benjamini-Hochberg · ' +
      'liq = líquido do posto de valor do elenco' +
      (divergem.length ? ' · mudam: ' + esc(divergem.join(', ')) : '')));
}

function pb5Vazios(d) {
  const v = d.vazios_por_setor || [];
  const fis = d.fis_atletas || {};
  /* A mesma faixa que a matriz marca, contada sobre TODOS os paineis: sem esta conta o card
     falaria de uma marca sem dizer quanta tela ela cobre. */
  const fb = pb5FaixaBaixa(d);
  let naFaixa = 0, comN = 0;
  Object.keys(d.paineis || {}).forEach(k => (d.paineis[k].clubes || []).forEach(c =>
    (c.celulas || []).forEach(x => {
      if (!x || x[2] === null || x[2] === undefined) return;
      comN++;
      if (pb5Baixa(fb, x[2])) naFaixa++;
    })));
  const campos = v.length ? Object.keys(v[0]) : [];
  const tab = v.length
    ? ptTabela({
        id: 'ptEt-5-tab-vazios',
        colunas: campos.map((c, i) => ({ k: c, rot: pbRotVazio(c), tipo: i === 0 ? 'texto' : undefined,
          casas: 0, dica: 'coluna `' + c + '` do prototipo.json' })),
        linhas: v,
        vazio: 'o arquivo não trouxe a contagem de vazios por setor',
      })
    : ptFaltaBloco('Vazios por setor', 'o arquivo não trouxe vazios_por_setor — sem isso não dá para ' +
        'dizer quantas temporadas de clube ficaram sem gente no setor, e a tabela sozinha só mostra os que subiram');
  return ptCard('Onde faltou jogador para fazer a média do setor',
    'a contagem vale para todos os times da base, não só para os ' +
      ptInt((d.paineis[Object.keys(d.paineis)[0]].clubes || []).length) + ' que subiram',
    tab +
    '<p class="pt-nota">Quando um setor tem jogadores de menos, o quadradinho sai <b>vazio, com o motivo ' +
    'escrito</b> — nunca com zero, nunca com a média dos poucos que sobraram. Um punhado de jogadores não ' +
    'faz média: faz um caso isolado com cara de média. E um caso isolado pintado de cor forte na ' +
    'tabela vira "perfil do setor" na reunião seguinte. ' +
    (fb
      ? 'Logo acima desse mínimo, com <b>' + ptInt(fb.min) + '</b> a <b>' + ptInt(fb.max) + '</b> jogadores, ' +
        'o quadradinho aparece, mas <b>marcado</b> com <b style="color:var(--pt-baixo)">&#9651;</b> e ' +
        'contorno tracejado: são <b>' + ptInt(naFaixa) + '</b> dos ' + ptInt(comN) + ' quadradinhos com ' +
        'contagem nesta etapa. Marcar é o mínimo: a cor mostra a posição no ranking e não sabe de quantos ' +
        'jogadores ela saiu.' + pbMiudo(' faixa lida do nome da coluna ' + esc(fb.chave))
      : ptFalta('o arquivo não diz a partir de quantos jogadores a média é fraca (coluna de baixa confiança ' +
          'em vazios_por_setor) — sem isso nenhum quadradinho da tabela sai marcado')) + '</p>' +
    (fis.mediana !== undefined
      ? '<p class="pt-nota">Para dar escala: um time típico tem <b>' + ptInt(fis.mediana) + '</b> jogadores ' +
        'rastreados por temporada (o que menos tem, <b>' + ptInt(fis.minimo) + '</b>), com <b>' +
        ptInt(fis.minutos_mediana) + '</b> minutos rastreados. O buraco não está no elenco; está no setor, ' +
        'quando o rastreamento pegou poucos jogadores daquela função.' + ptTecnico('medianas') + '</p>'
      : '') +
    (d.goleiro
      ? ptFaltaBloco('O goleiro', String(d.goleiro) + '. Não entra em nenhuma tabela desta etapa; o que ' +
          'aparece por setor é o resto do elenco. A coluna do goleiro não é zero nem média baixa: é falta ' +
          'de medida.')
      : ''));
}

/* ================================================================================
   ETAPA 6 — isso se repete?
   ================================================================================

   A pergunta que desfaz metade da etapa 5: o clube que estava alto num indicador em t está
   alto em t+1? Se não está, aquilo era retrato de um ano.

   A dispersão é desenhada com a MESMA escala para todos os indicadores — os dois eixos vão
   do mínimo ao máximo de todos os pontos do arquivo, não do mínimo ao máximo do indicador
   escolhido. Reescalar por indicador faria a nuvem do ppda ocupar a tela inteira e parecer
   tão organizada quanto a do físico, que é exatamente o engano que esta etapa existe para
   impedir. */

function ptEtapa6(alvo, d) {
  const disp = d.dispersao || {};
  const rho = d.rho || {};
  const ids = Object.keys(disp);
  const todos = Object.keys(rho);
  if (!ids.length) {
    alvo.innerHTML = ptFaltaBloco('Sem pontos para desenhar',
      'o arquivo não trouxe os pontos (dispersao); sem os pares de anos seguidos não há gráfico, só o resultado da tabela');
    return;
  }
  const ordenados = ids.slice().sort((a, b) => (rho[b] || {}).rho - (rho[a] || {}).rho);
  const alto = ordenados[0], baixo = ordenados[ordenados.length - 1];
  const ref = d.referencia_dinheiro || {};
  const tr = d.truncamento || {};

  const opcoes = ordenados.map(k =>
    '<option value="' + esc(k) + '">' + esc(pbNome(k)) + ' — ' + esc(ptJunto((rho[k] || {}).rho)) +
    '</option>').join('');

  /* A tabela com TODOS os ρ: a dispersão só existe para uma parte deles, e a diferença entre
     "ρ baixo" e "ρ que nem dá para abrir de perto" precisa estar visível linha a linha. */
  const linhas = todos.map(k => ({
    nome: pbNome(k), id: k, rho: (rho[k] || {}).rho, p: (rho[k] || {}).p, n: (rho[k] || {}).n,
    pontos: Object.prototype.hasOwnProperty.call(disp, k) ? 1 : 0,
    _dica: pbSemNome(k) ? 'o catálogo da etapa 2 não conhece esta coluna — o que aparece é o id cru' : '',
  }));
  const semPontos = linhas.filter(l => !l.pontos).length;

  alvo.innerHTML =
    '<p class="pt-nota">São <b>' + ptInt(d.n_pares) + '</b> pares: o mesmo clube em dois anos seguidos ' +
      'na Série B. Cada ponto é um clube. Na horizontal, a posição dele no ranking do primeiro ano; na ' +
      'vertical, a posição no ano seguinte. Se a característica fosse do clube, os pontos subiriam pela ' +
      'diagonal. Se fosse só daquele ano, virariam uma mancha sem direção. ' +
      '<b>Característica que não se repete no ano seguinte é retrato de um ano, não modelo de jogo.</b></p>' +

    (ref.rho !== undefined
      ? '<div class="pt-controle"><span class="pt-rot">A comparação: o que de fato se repete</span>' +
        '<p class="pt-nota">O <b>valor do elenco</b> de um ano e o do ano seguinte <b>' + esc(ptJunto(ref.rho)) +
        '</b> — em ' + ptInt(ref.n) + ' pares, e ' + esc(ptSorte(ref.p)) + '.' +
        ptTecnico(esc(ref.indicador) + ' · ρ = ' + ptNum(ref.rho, 3) + ' · ' + ptP(ref.p)) +
        ' Todo número desta etapa se lê contra este: o que o clube carrega de um ano para o outro, nesta ' +
        'amostra, é principalmente o tamanho do bolso.</p></div>'
      : ptFaltaBloco('Sem o número de comparação',
          'o arquivo não trouxe referencia_dinheiro; sem ele cada resultado fica solto, sem nada que diga ' +
          'o que é "se repete muito" nesta liga')) +

    '<div class="pt-card"><div class="pt-card-cab">' +
      '<h4>Ano a ano, número por número</h4>' +
      '<span>a mesma escala para todos · ' + ptInt(ids.length) + ' números com pontos no arquivo</span>' +
    '</div><div class="pt-card-corpo">' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
        '<select class="bt" id="ptEt-6-sel">' + opcoes + '</select>' +
        '<button class="bt mini" data-pb6="' + esc(alto) + '">o que mais se repete: ' + esc(pbNome(alto)) + '</button>' +
        '<button class="bt mini" data-pb6="' + esc(baixo) + '">o que menos se repete: ' + esc(pbNome(baixo)) + '</button>' +
      '</div>' +
      '<div id="ptEt-6-graf"></div>' +
    '</div></div>' +

    ptCard('O que este gráfico não consegue mostrar',
      ptInt(tr.pares) + ' pares · só ' + ptInt(tr.terminaram_em_subida) + ' terminaram em subida',
      '<p class="pt-nota">Dos <b>' + ptInt(tr.pares) + '</b> pares, só <b>' +
      ptInt(tr.terminaram_em_subida) + '</b> terminaram em subida. E <b>' +
      ptInt(tr.subidas_sem_ano_anterior_na_serie_b) + '</b> das <b>' + ptInt(tr.subidas_totais) +
      '</b> subidas são de clubes que <b>não estavam na Série B no ano anterior</b> — caíram da Série A ' +
      'ou subiram da C. Esses não têm par, e por isso não aparecem em ponto nenhum. Então estes pares ' +
      'falam de <b>quem ficou na Série B</b>, e qualquer tentativa de prever a subida pelo ano anterior, ' +
      'com esta base, se apoia em só <b>' + ptInt(tr.terminaram_em_subida) + '</b> subidas.</p>',
      'A frase certa não é "isto não se repete". É "isto não se repete <i>entre os clubes que ficaram ' +
      'na divisão</i>" — é só essa que o dado sustenta.') +

    ptCard('Os ' + ptInt(todos.length) + ' números, um por linha',
      ptInt(semPontos) + ' deles sem pontos para desenhar',
      ptTabela({
        id: 'ptEt-6-tab-rho',
        ordem: { col: 'rho', dir: 'desc' },
        colunas: [
          { k: 'nome', rot: 'o que se mede', tipo: 'texto', dica: 'nome como aparece no catálogo da etapa 2' },
          { k: 'id', rot: 'nome na base', tipo: 'texto', fmt: v => ptTecnico(esc(v)) },
          { k: 'rho', rot: 'um ano e o seguinte', dica: 'ρ de Spearman entre a posição no ano e no ano seguinte',
            fmt: v => esc(ptJunto(v)) + ptTecnico('ρ ' + ptNum(v, 3)) },
          { k: 'p', rot: 'é sorte?', dica: 'p-valor', fmt: v => esc(ptSorte(v)) + ptTecnico(ptP(v)) },
          { k: 'n', rot: 'pares', casas: 0 },
          { k: 'pontos', rot: 'no gráfico', fmt: v => v ? 'dá para abrir' : '<span style="color:var(--tinta3)">só o resultado</span>' },
        ],
        linhas: linhas,
        vazio: 'o arquivo não trouxe nenhum resultado de ano para ano',
      }),
      'O arquivo guarda os pontos de <b>' + ptInt(ids.length) + '</b> números e, para os outros <b>' +
      ptInt(semPontos) + '</b>, o estudo só guardou o resultado final. Esses não abrem no gráfico, e ' +
      'estão marcados linha a linha em vez de sumir da lista.');

  const sel = alvo.querySelector('#ptEt-6-sel');
  const pinta = () => {
    const caixa = alvo.querySelector('#ptEt-6-graf');
    if (caixa) caixa.innerHTML = pb6Grafico(d, sel.value);
  };
  sel.onchange = pinta;
  alvo.querySelectorAll('[data-pb6]').forEach(b => {
    b.onclick = () => { sel.value = b.dataset.pb6; pinta(); };
  });
  pinta();
}

function pb6Grafico(d, id) {
  const pares = d.pares || [];
  const pontos = (d.dispersao || {})[id] || [];
  const r = (d.rho || {})[id] || {};
  const ref = d.referencia_dinheiro || {};
  /* A escala sai de TODOS os pontos do arquivo, não dos do indicador escolhido: é o que
     mantém as nuvens comparáveis entre um indicador e outro ao trocar no seletor. */
  let lo = Infinity, hi = -Infinity;
  Object.keys(d.dispersao || {}).forEach(k => d.dispersao[k].forEach(pp => {
    lo = Math.min(lo, pp[0], pp[1]); hi = Math.max(hi, pp[0], pp[1]);
  }));
  if (!isFinite(lo)) { lo = 0; hi = 1; }
  const L = 46, T = 14, LADO = 330, FIM = L + LADO;
  const px = v => L + (v - lo) / (hi - lo) * LADO;
  const py = v => T + LADO - (v - lo) / (hi - lo) * LADO;

  const marcas = [];
  for (let i = 0; i <= 4; i++) marcas.push(lo + (hi - lo) * i / 4);
  const grade = marcas.map(m =>
    '<line x1="' + px(m).toFixed(1) + '" y1="' + T + '" x2="' + px(m).toFixed(1) + '" y2="' + (T + LADO) +
      '" stroke="var(--borda)"/>' +
    '<line x1="' + L + '" y1="' + py(m).toFixed(1) + '" x2="' + FIM + '" y2="' + py(m).toFixed(1) +
      '" stroke="var(--borda)"/>' +
    pbTxt(px(m).toFixed(1), T + LADO + 14, ptNum(m, 0), { anc: 'middle', tam: 9 }) +
    pbTxt(L - 7, py(m).toFixed(1) + 3, ptNum(m, 0), { anc: 'end', tam: 9 })).join('');

  const diagonal = '<line x1="' + px(lo) + '" y1="' + py(lo) + '" x2="' + px(hi) + '" y2="' + py(hi) +
    '" stroke="var(--tinta3)" stroke-dasharray="4 4" stroke-width="1"/>';

  /* Conferido antes de desenhar: a ordem de `dispersao[ind]` é a ordem de `pares`. Para os
     pares que terminaram em subida, o posto em t+1 de cada ponto bate com a célula do
     mesmo clube-ano na matriz da etapa 5. Sem essa checagem o rótulo do ponto seria chute. */
  const bolas = pontos.map((pp, i) => {
    const par = pares[i] || {};
    const cor = pbCorFaixa(par.faixa_t1);
    return '<circle cx="' + px(pp[0]).toFixed(1) + '" cy="' + py(pp[1]).toFixed(1) + '" r="5" ' +
      'fill="' + cor + '" fill-opacity="0.68" stroke="' + cor + '" stroke-width="1">' +
      '<title>' + esc((par.clube || 'clube não identificado') + ' · ' + ptAno(par.ano_t) + ' → ' +
        ptAno(par.ano_t1) + ' · posição no ranking ' + ptNum(pp[0], 0) + ' → ' + ptNum(pp[1], 0) +
        ' · no ano seguinte ' + pbFaixaTxt(par.faixa_t1)) + '</title></circle>';
  }).join('');

  const faixas = [];
  pares.forEach(p => { if (faixas.indexOf(p.faixa_t1) < 0) faixas.push(p.faixa_t1); });
  const legenda = faixas.map(f =>
    '<span style="display:inline-flex;align-items:center;gap:5px;margin-right:12px">' +
    '<i style="width:9px;height:9px;border-radius:50%;background:' + pbCorFaixa(f) + ';display:inline-block"></i>' +
    'no ano seguinte, <b>' + esc(pbFaixaTxt(f)) + '</b></span>').join('');

  const canto =
    pbTxt(FIM - 6, T + 16, ptJunto(r.rho), { anc: 'end', tam: 12, cor: 'var(--tinta)', peso: 800 }) +
    pbTxt(FIM - 6, T + 31, ptSorte(r.p) + ' · ' + ptInt(r.n) + ' pares', { anc: 'end', tam: 10 });
  /* O ρ e o p saíram do canto do gráfico: texto de SVG não tem letra miúda, e o número técnico
     já está logo abaixo, na frase, em ptTecnico. */

  const svg = pbSvg(FIM + 16, T + LADO + 30,
    grade + diagonal + canto + bolas +
    pbTxt((L + FIM) / 2, T + LADO + 27, 'posição no ranking do primeiro ano', { anc: 'middle', tam: 10 }) +
    '<g transform="translate(13,' + (T + LADO / 2) + ') rotate(-90)">' +
      pbTxt(0, 0, 'posição no ranking do ano seguinte', { anc: 'middle', tam: 10 }) + '</g>', 430);

  /* A régua de persistência: onde o indicador escolhido cai entre todos os outros. É o que
     permite ver, sem trocar de tela, que o físico está numa ponta e o ppda na outra. */
  const rhos = Object.keys(d.rho || {}).map(k => d.rho[k].rho).filter(v => v !== null && v !== undefined);
  const rlo = Math.min.apply(null, rhos), rhi = Math.max.apply(null, rhos);
  const RL = 10, RW = 400;
  const rx = v => RL + (v - rlo) / (rhi - rlo) * RW;
  const tiques = rhos.map(v => '<line x1="' + rx(v).toFixed(1) + '" y1="16" x2="' + rx(v).toFixed(1) +
    '" y2="26" stroke="var(--borda2)"/>').join('');
  /* O rótulo perto da ponta da régua não pode ficar centrado: quando o indicador escolhido é
     o mais persistente de todos — e ele é escolhível pelo botão ao lado do gráfico — o texto
     centrado sai pela borda do viewBox e some pela metade. */
  const marcaRegua = (v, cor, rot, cima) => {
    if (v === undefined || v === null) return '';
    const x = rx(v);
    const anc = x > RL + RW * 0.82 ? 'end' : (x < RL + RW * 0.18 ? 'start' : 'middle');
    return '<line x1="' + x.toFixed(1) + '" y1="' + (cima ? 8 : 16) + '" x2="' + x.toFixed(1) +
      '" y2="' + (cima ? 26 : 34) + '" stroke="' + cor + '" stroke-width="2.5"/>' +
      pbTxt(x.toFixed(1), cima ? 6 : 45, rot, { anc: anc, tam: 10, cor: cor, peso: 700 });
  };
  const regua = pbSvg(RW + 20, 52,
    '<line x1="' + RL + '" y1="21" x2="' + (RL + RW) + '" y2="21" stroke="var(--borda2)"/>' + tiques +
    marcaRegua(ref.rho, 'var(--pt-ok)', 'valor do elenco', false) +
    marcaRegua(r.rho, 'var(--pt-alto)', pbNome(id), true), 460);

  return svg +
    '<p class="pt-nota" style="margin-top:2px">' + legenda + '</p>' +
    '<p class="pt-nota"><b>' + esc(pbNome(id)) + '</b>: de um ano para o outro, <b>' + esc(ptJunto(r.rho)) +
      '</b> — em ' + ptInt(r.n) + ' pares, e ' + esc(ptSorte(r.p)) + '.' +
      ptTecnico(esc(id) + ' · ρ = ' + ptNum(r.rho, 3) + ' · ' + ptP(r.p)) +
      ' A linha tracejada é onde o clube ficaria se repetisse exatamente a mesma posição; quanto mais ' +
      'longe dela os pontos, menos o clube leva aquilo consigo.' +
      (ref.rho !== undefined && r.rho !== undefined && r.rho !== null
        ? ' Comparado com o valor do elenco, este número se repete <b>' +
          (r.rho >= ref.rho ? 'tanto quanto ou mais' : 'menos') + '</b>.'
        : '') + '</p>' +
    '<span class="pt-rot" style="margin-top:9px">Onde este número cai entre os ' +
      ptInt(rhos.length) + ' do estudo — à esquerda o que menos se repete, à direita o que mais</span>' + regua;
}

/* ================================================================================
   ETAPA 7 — a porta temporal
   ================================================================================

   A única etapa em que a característica é medida ANTES do desfecho: média do 1º turno
   contra pontos somados no 2º. É a resposta à pergunta que o dono faria de qualquer jeito,
   e a tabela é a da seção 6.4 da especificação.

   O desenho mostra bruto e parcial ligados pelo mesmo traço, porque o assunto é o encolhimento
   entre os dois: o parcial já desconta como o time vinha pontuando, e o que sobra depois
   disso é o que se pode chamar de característica. */

function ptEtapa7(alvo, d) {
  const linhas = (d.linhas || []).map(l => Object.assign({}, l, {
    nome: pbNome(l.indicador),
    abs: Math.abs(l.rho_bruto),
    _classe: '',
    _dica: l.sinal_certo ? '' : 'o número vai para o lado contrário do que o estudo esperava antes de testar',
  }));
  if (!linhas.length) {
    alvo.innerHTML = ptFaltaBloco('Sem linhas nesta etapa',
      'o arquivo não trouxe as linhas da etapa 7 — sem elas não há tabela de 1º turno contra 2º turno');
    return;
  }
  const ref = d.referencia_pts1t_x_pts2t || {};
  const alfa = pbAlfa();
  const passaBruto = alfa === null ? null : linhas.filter(l => pbPassa(l.p_bruto)).length;
  const passaParcial = alfa === null ? null : linhas.filter(l => pbPassa(l.p_parcial)).length;
  const erradoSinal = linhas.filter(l => !l.sinal_certo);
  const maior = linhas.slice().sort((a, b) => b.abs - a.abs)[0];

  alvo.innerHTML =
    '<p class="pt-nota">As etapas 5 e 6 medem tudo na <b>mesma temporada</b> do resultado — e aí não dá ' +
      'para saber o que é causa e o que é consequência. Aqui dá: o número é a média das <b>' +
      ptInt(d.rodadas_1t) + '</b> primeiras rodadas, e o resultado são os pontos somados nas <b>' +
      ptInt(d.rodadas_2t) + '</b> últimas, em <b>' + ptInt(d.n) + '</b> temporadas de clube. A segunda ' +
      'medida <b>desconta os pontos que o time já tinha feito no 1º turno</b>. É ela que separa "fizeram ' +
      'isto e passaram a pontuar" de "já estavam pontuando, e isto veio junto".' +
      ptTecnico('ρ bruto e ρ parcial') + '</p>' +

    (ref.rho !== undefined
      ? '<div class="pt-controle"><span class="pt-rot">O que já se sabe sem olhar estilo nenhum</span>' +
        '<p class="pt-nota">Os <b>pontos do 1º turno</b> e os do 2º <b>' + esc(ptJunto(ref.rho)) + '</b> (' +
        esc(ptSorte(ref.p)) + ').' + ptTecnico('ρ = ' + ptNum(ref.rho, 3) + ' · ' + ptP(ref.p)) +
        /* A frase sai do SINAL ("quanto mais X, menos pontos") e da ORDEM dos números: com três
           "moderada" iguais na tela, o leitor não tinha como ver que o 1º turno prevê melhor. A
           conclusão "a melhor previsão continua sendo o 1º turno" só é escrita se o número de
           estilo mais forte ficar, de fato, abaixo dos pontos do 1º turno. */
        (maior
          ? ' O número de estilo mais forte é <b>' + esc(maior.nome) + '</b>: quanto maior ele no 1º turno, <b>' +
            (maior.rho_bruto < 0 ? 'menos' : 'mais') + '</b> pontos o time fez no 2º (' +
            esc(ptJunto(maior.rho_bruto)) + ')' +
            (Math.abs(maior.rho_bruto) < Math.abs(ref.rho)
              ? ', menos forte que os próprios pontos do 1º turno' : ', tão forte ou mais que os pontos do 1º turno') +
            '. Descontados os pontos que o time já tinha, ' +
            ((maior.rho_parcial < 0) === (maior.rho_bruto < 0)
              ? 'continua no mesmo sentido' + (Math.abs(maior.rho_parcial) < Math.abs(maior.rho_bruto) ? ', um pouco mais fraco' : '')
              : 'muda de sentido') +
            ' (' + esc(ptJunto(maior.rho_parcial)) + ', ' + esc(ptSorte(maior.p_parcial)) + ').' +
            ptTecnico('ρ ' + ptNum(maior.rho_bruto, 3) + ' → ' + ptNum(maior.rho_parcial, 3) + ' · ' + ptP(maior.p_parcial))
          : '') +
        (!maior || Math.abs(maior.rho_bruto) < Math.abs(ref.rho)
          ? ' Leia a tabela toda contra isso: a melhor previsão do 2º turno continua sendo o próprio 1º turno.'
          : ' Aqui há número de estilo tão forte quanto os pontos do 1º turno: leia a tabela linha a linha.') +
        '</p></div>'
      : '') +

    pb7Grafico(d, linhas) +

    ptCard('O 1º turno prevê o 2º? Número por número',
      ptInt(linhas.length) + ' números medidos por turno · ' + pbConta(passaBruto) +
        ' dificilmente são sorte sem desconto, ' + pbConta(passaParcial) + ' com o desconto',
      ptTabela({
        id: 'ptEt-7-tab',
        ordem: { col: 'abs', dir: 'desc' },
        colunas: [
          { k: 'nome', rot: 'número (média do 1º turno)', tipo: 'texto' },
          { k: 'n', rot: 'times', casas: 0 },
          { k: 'rho_bruto', rot: 'com os pontos do 2º turno', dica: 'ρ bruto',
            fmt: v => esc(ptJunto(v)) + ptTecnico('ρ ' + ptNum(v, 3)) },
          { k: 'p_bruto', rot: 'é sorte?', dica: 'p-valor do ρ bruto', fmt: v => esc(ptSorte(v)) + ptTecnico(ptP(v)) },
          { k: 'rho_parcial', rot: 'descontados os pontos do 1º turno', dica: 'ρ parcial',
            fmt: v => esc(ptJunto(v)) + ptTecnico('ρ ' + ptNum(v, 3)) },
          { k: 'p_parcial', rot: 'é sorte? (com desconto)', dica: 'p-valor do ρ parcial',
            fmt: v => esc(ptSorte(v)) + ptTecnico(ptP(v)) },
          { k: 'abs', rot: 'força, sem o sentido', fmt: v => ptTecnico(ptNum(v, 3)),
            dica: '|ρ| bruto — coluna calculada na tela só para ordenar' },
          { k: 'sinal_certo', rot: 'sentido',
            fmt: (v, l) => v
              ? '<span style="color:var(--tinta3)">como o estudo esperava (' + (l.sinal > 0 ? '+' : '−') + ')</span>'
              : '<b style="color:var(--pt-baixo)">contrário ao esperado</b>' },
        ],
        linhas: linhas,
        vazio: 'nenhum número tem versão por turno',
      }),
      'Dos <b>' + ptInt(linhas.length) + '</b>, <b>' + pbConta(passaBruto) + '</b> dificilmente são sorte sem ' +
      'desconto, e <b>' + pbConta(passaParcial) + '</b> continuam assim depois de descontar os pontos do ' +
      '1º turno. A queda de uma conta para a outra é o assunto desta etapa.' +
      ptTecnico('corte: p < α = ' + (alfa === null ? '?' : ptNum(alfa, 2))) +
      (erradoSinal.length
        ? ' E <b>' + ptInt(erradoSinal.length) + '</b> ' + pbPl(erradoSinal.length, 'vai', 'vão') +
          ' para o lado <b>contrário</b> do que o estudo tinha dito antes de testar (' +
          erradoSinal.map(l => esc(l.nome)).join(', ') + '): quando o sentido vira, não é um achado ao ' +
          'contrário — é ruído apontando para um lado qualquer.'
        : '')) +

    (d.nao_testaveis && d.nao_testaveis.length
      ? '<div class="pt-falta-bloco"><b>' + ptInt(d.nao_testaveis.length) + ' ' +
          pbPl(d.nao_testaveis.length, 'número não entra', 'números não entram') +
          ' nesta tabela — e não é porque falharam</b><p>' +
          esc(d.nao_testaveis.map(x => pbNome(x)).join(', ')) + '. ' +
          (d.motivo_nao_testaveis
            ? 'O estudo tem os minutos da temporada inteira, mas não a escalação de cada rodada; sem ela não dá ' +
              'para dividir esses números em dois turnos.' + pbMiudo(' ' + esc(d.motivo_nao_testaveis))
            : ptFalta('sem motivo declarado no arquivo')) +
          ' Eles ficam sem este teste, o que é diferente de terem sido testados e reprovados.</p></div>'
      : '');
}

function pb7Grafico(d, linhas) {
  const ref = d.referencia_pts1t_x_pts2t || {};
  const vals = [];
  linhas.forEach(l => { vals.push(l.rho_bruto, l.rho_parcial); });
  if (ref.rho !== undefined && ref.rho !== null) vals.push(ref.rho);
  const lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
  const pad = (hi - lo) * 0.08;
  const L = 214, LARG = 250, T = 26, ALT = 17;
  const px = v => L + (v - (lo - pad)) / ((hi + pad) - (lo - pad)) * LARG;
  const ordem = linhas.slice().sort((a, b) => b.rho_bruto - a.rho_bruto);

  const zero = px(0);
  const corpo = ordem.map((l, i) => {
    const y = T + i * ALT;
    const a = px(l.rho_bruto), b = px(l.rho_parcial);
    const forte = pbPassa(l.p_parcial);
    const cor = l.sinal_certo ? (forte ? 'var(--pt-alto)' : 'var(--tinta3)') : 'var(--pt-baixo)';
    return '<line x1="' + a.toFixed(1) + '" y1="' + y + '" x2="' + b.toFixed(1) + '" y2="' + y +
        '" stroke="' + cor + '" stroke-width="1.5" stroke-opacity="0.5"/>' +
      '<circle cx="' + a.toFixed(1) + '" cy="' + y + '" r="3.4" fill="none" stroke="' + cor + '" stroke-width="1.4"/>' +
      '<circle cx="' + b.toFixed(1) + '" cy="' + y + '" r="4" fill="' + cor + '"/>' +
      pbTxt(L - 9, y + 3.5, l.nome, { anc: 'end', tam: 10, cor: forte ? 'var(--tinta)' : 'var(--tinta2)' }) +
      '<title>' + esc(l.nome + ' · sem desconto: ' + ptJunto(l.rho_bruto) + ', ' + ptSorte(l.p_bruto) +
        ' · descontado o 1º turno: ' + ptJunto(l.rho_parcial) + ', ' + ptSorte(l.p_parcial) +
        ' · ρ ' + ptNum(l.rho_bruto, 3) + ' (' + ptP(l.p_bruto) + ') → ' + ptNum(l.rho_parcial, 3) +
        ' (' + ptP(l.p_parcial) + ')') + '</title>';
  }).join('');

  const alturaFim = T + ordem.length * ALT;
  /* A régua é o maior ρ da tela, então a linha dela cai na borda direita: o rótulo centrado
     sairia pela metade do viewBox. Ancorado ao fim, encosta na linha e continua legível. */
  const marcaRef = (ref.rho === undefined || ref.rho === null) ? '' :
    '<line x1="' + px(ref.rho).toFixed(1) + '" y1="' + (T - 14) + '" x2="' + px(ref.rho).toFixed(1) +
      '" y2="' + alturaFim + '" stroke="var(--pt-ok)" stroke-width="1.5" stroke-dasharray="3 3"/>' +
    pbTxt(px(ref.rho).toFixed(1), T - 18, 'pontos do 1º turno',
      { anc: px(ref.rho) > L + LARG * 0.7 ? 'end' : 'middle', tam: 9, cor: 'var(--pt-ok)', peso: 700 });

  return ptCard('Sem desconto e com desconto, no mesmo traço',
    'círculo vazado = sem desconto · círculo cheio = descontados os pontos do 1º turno · à direita do zero, ' +
    'andam juntos; à esquerda, em sentido contrário',
    pbSvg(L + LARG + 20, alturaFim + 22,
      '<line x1="' + zero.toFixed(1) + '" y1="' + (T - 14) + '" x2="' + zero.toFixed(1) + '" y2="' +
        alturaFim + '" stroke="var(--borda2)"/>' +
      pbTxt(zero.toFixed(1), alturaFim + 16, ptNum(0, 1), { anc: 'middle', tam: 9 }) +
      pbTxt(px(lo - pad / 2).toFixed(1), alturaFim + 16, ptNum(lo, 2), { anc: 'middle', tam: 9 }) +
      pbTxt(px(hi + pad / 2).toFixed(1), alturaFim + 16, ptNum(hi, 2), { anc: 'middle', tam: 9 }) +
      marcaRef + corpo, 520),
    'Traço curto: o número quase não muda quando se descontam os pontos do 1º turno. Traço longo: boa ' +
    'parte do número era o time já estar bem. Laranja: vai para o lado contrário do que o estudo esperava. ' +
    'Azul escuro: mesmo com o desconto, dificilmente é sorte' + (pbAlfa() === null
      ? ' — mas o arquivo não diz a linha de corte da sorte (etapa_0.poder.alfa), e nenhum ponto pôde ser destacado.'
      : '.' + ptTecnico('ρ parcial com p < α = ' + ptNum(pbAlfa(), 2))));
}

/* ================================================================================
   ETAPA 8 — o cemitério dos padrões, e a tipologia que sobrou
   ================================================================================

   A ordem importa e é esta: primeiro o enterro, depois o que sobreviveu. Invertida, a tela
   apresentaria quatro grupos e depois pediria desculpa — que é exatamente como um
   agrupamento cego vira "os cinco perfis de time que sobe" numa apresentação.

   Os dois nulos ficam lado a lado em toda linha da tabela. Embaralhar coluna destrói a
   correlação entre indicadores, então qualquer dado correlacionado bate esse nulo: ele não
   testa agrupamento, testa correlação. O nulo que vale é a gaussiana de mesma covariância. */

function ptEtapa8(alvo, d) {
  const c = d.cemiterio || {};
  const t = d.tipologia || {};
  alvo.innerHTML =
    pb8Cemiterio(c) +
    pb8Jaccard(c) +
    pb8Eixos(c) +
    (t.eixos ? pb8Tipologia(t)
      : ptFaltaBloco('A divisão em caixas não veio no arquivo',
          'falta a chave tipologia da etapa 8; sem ela a etapa termina no enterro, e o que sobreviveu aos ' +
          'testes fica sem tela'));
}

function pb8Cemiterio(c) {
  const linhas = (c.linhas || []).map(l => Object.assign({}, l, {
    emb_med: (l.nulo_colunas_embaralhadas || {}).mediana,
    emb_p: (l.nulo_colunas_embaralhadas || {}).p,
    cov_med: (l.nulo_mesma_covariancia || {}).mediana,
    cov_p: (l.nulo_mesma_covariancia || {}).p,
  }));
  if (!linhas.length) return ptFaltaBloco('Sem a tabela dos dois sorteios de comparação',
    'o arquivo não trouxe cemiterio.linhas — e é ela que sustenta a decisão de não ter grupos');
  const alfa = pbAlfa();
  const rejEmb = alfa === null ? null : linhas.filter(l => pbPassa(l.emb_p)).length;
  const rejCov = alfa === null ? null : linhas.filter(l => pbPassa(l.cov_p)).length;
  const conjuntos = [];
  linhas.forEach(l => { if (conjuntos.indexOf(l.conjunto) < 0) conjuntos.push(l.conjunto); });
  const obs = c.observacoes_por_dimensao || {};

  /* O desenho: a silhueta observada contra as duas medianas de nulo, na mesma linha. É aqui
     que se vê de olho que a observada encosta na mediana do nulo certo e dispara sobre a do
     nulo errado — a tabela diz o mesmo, mas a tabela exige que o leitor faça a subtração. */
  const vals = [];
  linhas.forEach(l => vals.push(l.silhueta_obs, l.emb_med, l.cov_med));
  const lo = 0, hi = Math.max.apply(null, vals.filter(v => v !== null && v !== undefined));
  const L = 215, LARG = 250, T = 24, ALT = 30;
  const px = v => L + (v - lo) / (hi - lo) * LARG;
  const barras = linhas.map((l, i) => {
    const y = T + i * ALT;
    l = Object.assign({}, l, { conjunto: pb8Conjunto(l.conjunto).quem });
    return '<line x1="' + px(l.emb_med).toFixed(1) + '" y1="' + (y - 6) + '" x2="' + px(l.emb_med).toFixed(1) +
        '" y2="' + (y + 6) + '" stroke="var(--pt-baixo)" stroke-width="2"/>' +
      '<line x1="' + px(l.cov_med).toFixed(1) + '" y1="' + (y - 6) + '" x2="' + px(l.cov_med).toFixed(1) +
        '" y2="' + (y + 6) + '" stroke="var(--pt-ok)" stroke-width="2"/>' +
      '<circle cx="' + px(l.silhueta_obs).toFixed(1) + '" cy="' + y + '" r="4.6" fill="var(--pt-alto)"/>' +
      pbTxt(L - 9, y + 3.5, l.conjunto + ' · ' + ptInt(l.k) + ' grupos', { anc: 'end', tam: 9.5, cor: 'var(--tinta2)' }) +
      '<title>' + esc(l.conjunto + ' · ' + l.k + ' grupos · separação real ' + ptNum(l.silhueta_obs, 3) +
        ' · sorteio fácil ' + ptNum(l.emb_med, 3) + ' (' + ptSorte(l.emb_p) + ', ' + ptP(l.emb_p) + ')' +
        ' · sorteio justo ' + ptNum(l.cov_med, 3) + ' (' + ptSorte(l.cov_p) + ', ' + ptP(l.cov_p) + ')' +
        ' · silhueta; nulos de colunas embaralhadas e de mesma covariância') + '</title>';
  }).join('');
  const fim = T + linhas.length * ALT;
  const svg = pbSvg(L + LARG + 24, fim + 20,
    pbTxt(L, T - 12, 'separação real ●   sorteio fácil ▏ (laranja)   sorteio justo ▏ (verde)',
      { tam: 9.5, cor: 'var(--tinta3)' }) + barras +
    pbTxt(px(lo), fim + 14, ptNum(lo, 2), { anc: 'middle', tam: 9 }) +
    pbTxt(px(hi), fim + 14, ptNum(hi, 2), { anc: 'middle', tam: 9 }), 470);

  const sorteNaCel = v => (pbPassa(v) ? '<b style="color:var(--pt-baixo)">' + esc(ptSorte(v)) + '</b>'
    : esc(ptSorte(v))) + ptTecnico(ptP(v));
  return ptCard('Por que esta aba não tem grupos de times',
    ptInt(linhas.length) + ' tentativas · cada uma contra ' + ptInt(linhas[0].replicas) + ' sorteios de comparação',
    '<p class="pt-nota">A pergunta: os times se dividem em tipos de verdade, ou qualquer nuvem de números ' +
    'se deixa cortar em grupos? Para saber, mede-se o quanto os grupos reais ficam separados e compara-se ' +
    'com grupos feitos em dados sorteados. Há <b>dois sorteios de comparação</b>. O <b>fácil</b> embaralha ' +
    'cada número por conta própria — e isso apaga a ligação natural entre eles (quem tem mais posse ' +
    'também troca mais passes). Contra ele, qualquer dado real parece ter grupo. O <b>justo</b> cria dados ' +
    'falsos que mantêm essa ligação. Só o justo diz se o grupo existe.' +
    pbMiudo(' silhueta · nulo de colunas embaralhadas · nulo gaussiano de mesma covariância · k-means') + '</p>' +
    svg +
    ptTabela({
      id: 'ptEt-8-tab-cem',
      ordem: null,
      colunas: [
        { k: 'conjunto', rot: 'tentativa', tipo: 'texto', fmt: v => esc(pb8ConjuntoTxt(v)) },
        { k: 'n', rot: 'times', casas: 0 },
        { k: 'dimensoes', rot: 'números usados', casas: 0 },
        { k: 'k', rot: 'grupos', casas: 0 },
        { k: 'silhueta_obs', rot: 'separação real', dica: 'silhueta observada',
          fmt: v => '<b>' + ptNum(v, 3) + '</b>' },
        { k: 'emb_med', rot: 'sorteio fácil: separação típica', dica: 'mediana do nulo de colunas embaralhadas',
          fmt: v => ptNum(v, 3) },
        { k: 'emb_p', rot: 'contra o fácil, é sorte?', dica: 'p do nulo de colunas embaralhadas', fmt: sorteNaCel },
        { k: 'cov_med', rot: 'sorteio justo: separação típica', dica: 'mediana do nulo de mesma covariância',
          fmt: v => ptNum(v, 3) },
        { k: 'cov_p', rot: 'contra o justo, é sorte?', dica: 'p do nulo de mesma covariância',
          fmt: v => '<b>' + sorteNaCel(v) + '</b>' },
        { k: 'replicas', rot: 'sorteios', casas: 0 },
      ],
      linhas: linhas,
      vazio: 'nenhuma tentativa registrada',
    }),
    'Os dois sorteios ficam lado a lado porque a diferença entre eles <b>é</b> o resultado. Contra o ' +
    'sorteio fácil, <b>' + pbConta(rejEmb) + ' das ' + ptInt(linhas.length) + '</b> tentativas parecem ter ' +
    'grupo (dificilmente seria sorte). Contra o justo, <b>' + pbConta(rejCov) + '</b>. O sorteio fácil não ' +
    'testa se existe grupo; testa se os números andam juntos — e eles andam. Foi com ele que uma análise ' +
    'anterior anunciou dois modelos de jogo.' +
    ptTecnico('corte: p < α = ' + (alfa === null ? '?' : ptNum(alfa, 2))) + ' ' +
    (obs.n !== undefined
      ? 'E o tamanho do problema é este: <b>' + ptInt(obs.n) + '</b> times para <b>' + ptInt(obs.dimensoes) +
        '</b> números, ' + ptNum(obs.n / obs.dimensoes, 1) + ' time por número. Um programa de agrupar ' +
        'sempre acha fronteira em qualquer nuvem. A pergunta certa nunca é "quantos grupos ficam melhor" — ' +
        'essa sempre devolve uma resposta —, e sim se os grupos reais ficam mais separados que os de dados ' +
        'falsos com a mesma ligação entre os números. ' : '') +
    (function () {
      const cs = conjuntos.map(pb8Conjunto);
      const olhando = cs.map(c => c.olhando).filter(v => v !== null);
      const mesmo = olhando.length === cs.length && olhando.every(v => v === olhando[0]);
      return 'As tentativas foram feitas com ' + cs.map(c => esc(c.quem)).join(' e com ') +
        (mesmo ? ', olhando ' + ptInt(olhando[0]) + ' grupos de números' : '') + '.' +
        pbMiudo(' ' + conjuntos.map(esc).join(' · '));
    })());
}

function pb8Jaccard(c) {
  const js = c.jaccard || [];
  if (!js.length) return ptFaltaBloco('Sem o teste de refazer a conta',
    'o arquivo não trouxe cemiterio.jaccard; sem ele falta o segundo teste, o de ver se os grupos saem iguais');
  const estavel = js[0].linha_hennig_estavel, dissolve = js[0].linha_hennig_dissolve;
  const todos = js.reduce((a, j) => a.concat(j.jaccard_por_grupo), []);
  const acima = todos.filter(v => v >= estavel).length;
  const abaixo = todos.filter(v => v < dissolve).length;
  const corpo = js.map(j =>
    '<span class="pt-rot" style="margin-top:8px">dividindo em ' + ptInt(j.k) + ' grupos · conta refeita ' +
      ptInt(j.replicas) + ' vezes</span>' +
    j.jaccard_por_grupo.map((v, i) => ptBarra(v, 1, {
      rot: 'grupo ' + ptInt(i + 1) + ' (' + ptInt((j.tamanhos || [])[i]) + ' ' +
        pbPl((j.tamanhos || [])[i], 'time', 'times') + ')',
      texto: ptPct(v * 100, 0),
      dica: 'Jaccard de bootstrap ' + ptNum(v, 3),
      hachura: v < dissolve,
      cor: v >= estavel ? 'alto' : 'baixo',
      extra: v >= estavel ? 'firme' : (v < dissolve ? 'se desfaz' : 'entre as duas linhas'),
    })).join('')).join('');
  return ptCard('O segundo teste: o grupo sai igual quando se refaz a conta?',
    'firme: reaparece pelo menos ' + ptPct(estavel * 100, 0) + ' igual · se desfaz: abaixo de ' +
      ptPct(dissolve * 100, 0) + ptTecnico('Jaccard de bootstrap · linhas de Hennig ' + ptNum(estavel, 2) +
      ' e ' + ptNum(dissolve, 2)),
    '<p class="pt-nota">Refaz-se a conta muitas vezes, com os dados sorteados de novo, e vê-se quanto ' +
    'cada grupo reaparece igual. A barra é essa porcentagem.</p>' + corpo,
    'De <b>' + ptInt(todos.length) + '</b> ' +
    pbPl(todos.length, 'grupo testado', 'grupos testados') + ' em todas as tentativas, <b>' +
    ptInt(acima) + '</b> ' + pbPl(acima, 'chega', 'chegam') + ' à linha de firme e <b>' + ptInt(abaixo) +
    '</b> ' + pbPl(abaixo, 'fica', 'ficam') + ' abaixo da linha de "se desfaz" — ' +
    pbPl(abaixo, 'desenhado', 'desenhados') +
    ' com hachura, porque uma barra cheia ali enganaria por omissão. Grupo que se desfaz quando se ' +
    'refaz a conta não é um tipo de time: é um corte que valeu para aquele sorteio.');
}

function pb8Eixos(c) {
  const e = c.eixos_usados || {};
  const nomes = Object.keys(e);
  if (!nomes.length) return '';
  const total = nomes.reduce((s, k) => s + e[k].length, 0);
  return ptCard('Os olhares em que se tentou achar grupos',
    ptInt(nomes.length) + ' olhares · ' + ptInt(total) + ' números ao todo',
    '<div class="pt-cf-grade">' + nomes.map(k =>
      '<div class="pt-cf-l"><span title="' + esc(k) + '">' + esc(ptNomeRegua(k)) + '</span>' +
      '<b style="font-size:12px;font-weight:400;line-height:1.5">' +
        e[k].map(col => esc(pbNome(col))).join('<br>') + '</b></div>').join('') + '</div>',
    'A lista foi <b>escrita antes</b> do teste, não descoberta depois. Por isso o fracasso conta: não dá ' +
    'para dizer que faltou procurar em outro lugar, porque o lugar estava escrito antes.');
}

/* ---------------- a tipologia que sobreviveu ---------------- */

function pb8Tipologia(t) {
  const grupos = t.grupos || [];
  const cortes = t.cortes || {};
  const ver = t.veredito || [];
  const passaram = ver.filter(v => v.passou).length;
  const eixos = t.eixos || {};
  const nomesEixo = Object.keys(eixos);

  /* Divergência entre o que o documento declarou e o que o pipeline recalculou. Quando os
     dois discordam, a tela mostra os dois e diz que discordam — escolher um seria a tela
     decidindo no lugar de quem vai auditar. */
  const divergentes = grupos.filter(g =>
    g.status !== g.status_declarado_no_documento ||
    (g.p_um_contra_o_resto !== null && g.p_declarado_no_documento !== null &&
     Math.abs(g.p_um_contra_o_resto - g.p_declarado_no_documento) > 0.001));

  /* A ressalva que não pode ficar só no card de cada grupo: quais caixas passaram no teste de
     cada uma contra o resto e quais são só descrição. Sai do p e do corte de cada grupo. */
  const passaGrupo = g => g.p_um_contra_o_resto !== null && g.p_um_contra_o_resto !== undefined &&
    g.corte_do_status !== null && g.corte_do_status !== undefined &&
    Number(g.p_um_contra_o_resto) < Number(g.corte_do_status);
  const firmes = grupos.filter(passaGrupo), soDescricao = grupos.filter(g => !passaGrupo(g));
  const nomesDe = gs => gs.map(g => '<b>' + esc(g.grupo) + '</b>').join(', ');

  return '<div class="pt-etapa-cab" style="border-top-width:1px;margin-top:6px">' +
      '<div><h3 style="font-size:17px">O que sobrou: os que subiram, em ' + ptInt(grupos.length) + ' caixas</h3>' +
      '<span>' + ptInt(nomesEixo.length) + ' critérios escritos antes, cada um cortado ao meio — ' +
      'e a lista do que as caixas não passaram</span></div></div>' +

    '<p class="pt-nota">A diferença para o que acabou de ser enterrado não é de grau. Lá, os grupos eram ' +
      'procurados <b>dentro</b> dos mesmos números que os definiam. Aqui, os critérios foram <b>escritos ' +
      'antes</b>, com ' + ptInt(nomesEixo.reduce((s, k) => s + eixos[k].length, 0)) + ' números ao todo, ' +
      'e a conferência foi feita com números que <b>não entraram na montagem</b>. É esse teste de fora que ' +
      'separa um tipo de time de um agrupamento às cegas — e ele está medido abaixo, com o que passou ' +
      '<b>e</b> o que não passou.' + ptTecnico('tipologia · validação fora da construção') + '</p>' +

    (grupos.length
      ? '<div class="pt-controle"><span class="pt-rot">Em uma frase, para a reunião</span>' +
        /* A ressalva vem na PRIMEIRA frase. Antes o bloco abria com "estas caixas valem porque...",
           e o leitor apressado levava isso e não o fim da etapa, onde a separação é o teste que
           não passa. */
        '<p class="pt-nota"><b>Estas caixas servem para descrever' +
        (firmes.length < grupos.length
          ? ', e só ' + ptInt(firmes.length) + ' de ' + ptInt(grupos.length) + ' passam no teste contra as outras'
          : '') +
        '; as fronteiras entre elas são escolha, não ilhas.</b> ' +
        'O que elas têm de melhor que um agrupamento às cegas é que foram testadas com números que não as ' +
        'construíram. Caixa por caixa: ' +
        (firmes.length
          ? nomesDe(firmes) + ' ' + pbPl(firmes.length, 'passa', 'passam') + ' no teste de cada caixa ' +
            'contra as outras (dificilmente é sorte)'
          : 'nenhuma passa no teste de cada caixa contra as outras') +
        (soDescricao.length
          ? '; ' + nomesDe(soDescricao) + ' ' + pbPl(soDescricao.length, 'é', 'são') + ' <b>só descrição</b> — ' +
            soDescricao.map(g => 'com ' + ptInt(g.n) + ' times, ' + esc(ptSorte(g.p_um_contra_o_resto)))
              .join('; ') + '. Serve para contar o que aconteceu, não para dizer que é um tipo de time.'
          : '.') +
        ' E a divisão inteira é um mapa contínuo cortado ao meio, não ilhas separadas: veja a separação ' +
        'das caixas e a lista do que não passou, mais abaixo.' +
        ptTecnico('status: ' + grupos.map(g => esc(g.grupo) + ' ' + esc(g.status)).join(' · ')) + '</p></div>'
      : '') +

    '<div class="pt-controle">' +
      '<span class="pt-rot">Os critérios, como foram escritos</span>' +
      '<div class="pt-cf-grade" style="margin-top:9px">' +
        nomesEixo.map(k => '<div class="pt-cf-l"><span>' + esc(pbEixoNome(k)) +
          (cortes[k] !== undefined ? ' · linha no meio dos ' + ptInt((t.plano || []).length) +
            ' (metade acima, metade abaixo): ' + ptNum(cortes[k], 1) : '') +
          '</span><b style="font-size:12px;font-weight:400;line-height:1.5">' +
          eixos[k].map(par => (par[1] < 0 ? '− ' : '+ ') + esc(pbNome(par[0]))).join('<br>') +
          '</b></div>').join('') +
      '</div>' +
      '<p class="pt-nota">Cada critério é a média das posições no ranking do ano (o sinal − quer dizer que ' +
      'ter menos conta a favor), cortada no meio. Não há programa de agrupar: são linhas traçadas no ' +
      'meio. Isso também quer dizer que as caixas existem porque a linha foi posta ali — e times perto ' +
      'da linha trocam de lado com pouca coisa.' + ptTecnico('média de percentis · corte na mediana · sem k-means') +
      '</p>' +
    '</div>' +

    pb8Plano(t) +
    grupos.map((g, i) => pb8Grupo(g, i, t)).join('') +
    pb8Veredito(t, ver, passaram, divergentes) +
    pb8TesteDeFora(t) +
    pb8DinheiroEstabilidade(t);
}

function pb8Plano(t) {
  const plano = t.plano || [];
  const cortes = t.cortes || {};
  const grupos = t.grupos || [];
  const nomesEixo = Object.keys(t.eixos || {});
  if (!plano.length || nomesEixo.length < 2) return ptFaltaBloco('Sem o mapa dos critérios',
    'faltam tipologia.plano ou tipologia.eixos no arquivo — sem eles não há como desenhar os times no ' +
    'mapa, e a lista de caixas sozinha esconderia que elas são pedaços de um contínuo');
  const eixoX = nomesEixo[1], eixoY = nomesEixo[0];
  const kx = 'rota', ky = 'territorio';   /* nomes dos campos em `plano`, não texto de tela */
  const fronteira = (t.estabilidade || {}).fronteira || [];
  const trocaDe = {};
  fronteira.forEach(f => { trocaDe[f.clube + f.ano] = f; });

  const xs = plano.map(p => p[kx]), ys = plano.map(p => p[ky]);
  const lo = Math.min(Math.min.apply(null, xs), Math.min.apply(null, ys));
  const hi = Math.max(Math.max.apply(null, xs), Math.max.apply(null, ys));
  const pad = (hi - lo) * 0.08;
  const L = 52, T = 18, LADO = 330;
  const px = v => L + (v - (lo - pad)) / ((hi + pad) - (lo - pad)) * LADO;
  const py = v => T + LADO - (v - (lo - pad)) / ((hi + pad) - (lo - pad)) * LADO;
  const idx = {};
  grupos.forEach((g, i) => { idx[g.grupo] = i; });

  const cruz =
    '<line x1="' + px(cortes[eixoX]).toFixed(1) + '" y1="' + T + '" x2="' + px(cortes[eixoX]).toFixed(1) +
      '" y2="' + (T + LADO) + '" stroke="var(--tinta2)" stroke-dasharray="5 4"/>' +
    '<line x1="' + L + '" y1="' + py(cortes[eixoY]).toFixed(1) + '" x2="' + (L + LADO) + '" y2="' +
      py(cortes[eixoY]).toFixed(1) + '" stroke="var(--tinta2)" stroke-dasharray="5 4"/>' +
    pbTxt(px(cortes[eixoX]) + 4, T + 10, 'meio da ' + pbEixoCurto(eixoX) + ' ' + ptNum(cortes[eixoX], 1), { tam: 9 }) +
    pbTxt(L + LADO - 3, py(cortes[eixoY]) - 4, 'meio do ' + pbEixoCurto(eixoY) + ' ' + ptNum(cortes[eixoY], 1),
      { tam: 9, anc: 'end' });

  /* O tamanho do halo é a chance de o time trocar de grupo sob ruído: quem está colado na
     linha aparece com um anel largo, e o leitor vê a fronteira sem precisar da tabela. */
  const maxTroca = Math.max.apply(null, fronteira.map(f => f.troca_sob_ruido_10pt_pct).concat([1]));
  /* Dois clube-temporada colados no plano escreveriam um rótulo por cima do outro — e é
     justamente nos pares colados (os que dividem quadrante por pouco) que o leitor precisa
     ler o nome. Cada rótulo procura a primeira altura livre entre as tentativas abaixo. */
  const postos = [];
  const desvio = [3.5, -7.5, 13.5, -17.5, 23.5];
  const alturaLivre = (x, y) => {
    for (let i = 0; i < desvio.length; i++) {
      const yy = y + desvio[i];
      if (!postos.some(o => Math.abs(o.x - x) < 78 && Math.abs(o.y - yy) < 10)) {
        postos.push({ x: x, y: yy });
        return yy;
      }
    }
    return y + desvio[desvio.length - 1];
  };
  const pontos = plano.map(p => {
    const cor = pbCor(idx[p.grupo] === undefined ? 0 : idx[p.grupo]);
    const f = trocaDe[p.clube + p.ano];
    const troca = f ? f.troca_sob_ruido_10pt_pct : null;
    const halo = troca === null ? 0 : 5 + troca / maxTroca * 9;
    return (halo > 5
      ? '<circle cx="' + px(p[kx]).toFixed(1) + '" cy="' + py(p[ky]).toFixed(1) + '" r="' + halo.toFixed(1) +
        '" fill="' + cor + '" fill-opacity="0.14" stroke="' + cor + '" stroke-opacity="0.4" stroke-dasharray="2 2"/>'
      : '') +
      '<circle cx="' + px(p[kx]).toFixed(1) + '" cy="' + py(p[ky]).toFixed(1) + '" r="4.4" fill="' + cor + '"/>' +
      pbTxt(px(p[kx]) + 7, alturaLivre(px(p[kx]) + 7, py(p[ky])), p.clube + ' ' + ptAno(p.ano),
        { tam: 9, cor: 'var(--tinta2)' }) +
      '<title>' + esc(p.clube + ' ' + p.ano + ' · ' + p.pos + 'º · caixa ' + p.grupo + ' · ' +
        pbEixoCurto(eixoY) + ' ' + ptNum(p[ky], 1) + ' · ' + pbEixoCurto(eixoX) + ' ' + ptNum(p[kx], 1) +
        (troca === null ? '' : ' · muda de caixa em ' + ptPct(troca) + ' das vezes em que se mexe um pouco nos números')) +
        '</title>';
  }).join('');

  const legenda = grupos.map((g, i) =>
    '<span style="display:inline-flex;align-items:center;gap:5px;margin-right:14px">' +
    '<i style="width:9px;height:9px;border-radius:50%;background:' + pbCor(i) + ';display:inline-block"></i>' +
    esc(g.grupo) + ' · ' + ptInt(g.n) + ' times</span>').join('');

  const maisTrocam = fronteira.slice().sort((a, b) => b.troca_sob_ruido_10pt_pct - a.troca_sob_ruido_10pt_pct).slice(0, 3);

  return ptCard('O mapa, não a lista',
    ptInt(plano.length) + ' times que subiram · na horizontal, ' + esc(pbEixoCurto(eixoX)) +
      ' · na vertical, ' + esc(pbEixoCurto(eixoY)),
    pbSvg(L + LADO + 120, T + LADO + 34,
      cruz + pontos +
      pbTxt(L + LADO / 2, T + LADO + 28, pbEixoCurto(eixoX) + ' →', { anc: 'middle', tam: 10 }) +
      '<g transform="translate(15,' + (T + LADO / 2) + ') rotate(-90)">' +
        pbTxt(0, 0, pbEixoCurto(eixoY) + ' →', { anc: 'middle', tam: 10 }) + '</g>', 560) +
    '<p class="pt-nota">' + legenda + '</p>',
    'As caixas são <b>pedaços de um mapa contínuo</b>, não ilhas — por isso a tela mostra o mapa, e não ' +
    'só a lista de nomes. O anel tracejado é a chance de o clube mudar de caixa quando se mexe um pouco ' +
    'nos números; ' +
    (maisTrocam.length
      ? 'os que mais mudam são ' + maisTrocam.map(f => '<b>' + esc(f.clube) + ' ' + ptAno(f.ano) +
          '</b> (' + ptPct(f.troca_sob_ruido_10pt_pct) + ' das vezes)').join(', ') + '. '
      : '') +
    'Quem está colado na linha está colado na linha: a linha é uma escolha, e a tela diz quanto ela custa.' +
    ptTecnico('ruído de 10 pontos de percentil'));
}

function pb8Grupo(g, i, t) {
  const cor = pbCor(i);
  const divergeStatus = g.status !== g.status_declarado_no_documento;
  const divergeP = g.p_um_contra_o_resto !== null && g.p_declarado_no_documento !== null &&
    Math.abs(g.p_um_contra_o_resto - g.p_declarado_no_documento) > 0.001;
  const diverge = divergeStatus || divergeP;
  const nomesEixo = Object.keys(t.eixos || {});
  const times = g.times || [];
  const perc = g.percentis || {};
  const chavesPerc = Object.keys(perc);
  const forma = g.formacao || {};

  const tabTimes = ptTabela({
    id: 'ptEt-8-tab-' + g.grupo,
    ordem: null,
    colunas: [
      { k: 'clube', rot: 'clube', tipo: 'texto' },
      { k: 'ano', rot: 'ano', fmt: v => ptAno(v) },
      { k: 'pos', rot: 'posição', fmt: v => ptInt(v) + 'º' },
      { k: 'pts', rot: 'pontos', casas: 0 },
      { k: 'posto_valor', rot: 'ranking de valor do elenco no ano', fmt: v => ptInt(v) + 'º' },
      { k: 'valor_eur', rot: 'valor do elenco', fmt: v => ptEur(v) },
    ],
    linhas: times,
    vazio: 'nenhum time nesta caixa',
  });

  const validadores = chavesPerc.length
    ? '<span class="pt-rot" style="margin-top:4px">Números de fora da montagem: posição média no ranking do ano</span>' +
      '<div class="pt-tab-rola"><table class="pt-tab"><thead><tr>' +
        chavesPerc.map(k => '<th class="num" title="' + esc(k) + '">' +
          esc(pbNome(k)) + '</th>').join('') +
      '</tr></thead><tbody><tr>' +
        chavesPerc.map(k => ptCel(perc[k], { casas: 1, sinal: 0, ano: null,
          motivo: 'percentil ausente para esta coluna' })).join('') +
      '</tr></tbody></table></div>'
    : ptFalta('o arquivo não trouxe os números de fora da montagem para esta caixa');

  const corpo =
    '<div class="pt-cf-grade">' +
      nomesEixo.map(k => {
        const campo = k.toLowerCase();
        const v = g[campo];
        return '<div class="pt-cf-l"><span>' + esc(pbEixoCurto(k)) + ' (média no ranking do ano)</span><b>' +
          (v === undefined ? ptFalta('a caixa não traz o valor deste critério') : ptNum(v, 1)) + '</b></div>';
      }).join('') +
      '<div class="pt-cf-l"><span>posição média no ranking de valor do elenco</span><b>' +
        ptNum(g.posto_valor_medio, 1) + 'º</b></div>' +
      '<div class="pt-cf-l"><span>valor médio do elenco</span><b>' + ptEur(g.valor_medio_eur) + '</b></div>' +
      (forma.linha3_pct !== undefined
        ? '<div class="pt-cf-l"><span>jogos com três atrás</span><b>' + ptPct(forma.linha3_pct) + '</b></div>' +
          '<div class="pt-cf-l"><span>formações distintas</span><b>' + ptNum(forma.distintas, 1) + '</b></div>' +
          '<div class="pt-cf-l"><span>jogos na formação principal</span><b>' + ptPct(forma.principal_pct) + '</b></div>'
        : '') +
    '</div>' +
    tabTimes +
    validadores;

  const firme = g.p_um_contra_o_resto !== null && g.p_um_contra_o_resto !== undefined &&
    Number(g.p_um_contra_o_resto) < Number(g.corte_do_status);
  const veredito = firme
    ? 'passa no teste contra as outras caixas'
    : 'só descrição: ' + ptSorte(g.p_um_contra_o_resto);

  const nota =
    '<b>Esta caixa contra todas as outras juntas:</b> ' + esc(ptAcaso(g.p_um_contra_o_resto)) + ' — ' +
    (firme
      ? '<b>dificilmente é sorte</b>. Por isso conta como tipo, dentro das ressalvas do mapa contínuo ' +
        'e da lista do que não passou.'
      : '<b>' + esc(ptSorte(g.p_um_contra_o_resto)) + '</b>, e por isso fica como <b>só descrição</b>: ' +
        'serve para contar o que estes ' + ptInt(g.n) + ' times fizeram, não para dizer que existe um tipo ' +
        'de time assim.') +
    ptTecnico(ptP(g.p_um_contra_o_resto) +
    /* O nulo deixou de ser Monte Carlo: com dezesseis, as partições cabem todas e o campo passou a
       trazer texto ("exato (4368 partições)") no lugar de uma contagem. Quem é número ganha a palavra
       "réplicas"; quem é texto já se descreve, e a palavra sobrava — saía "em exato (4368 partições)
       réplicas". */
    ' em ' + (typeof g.replicas_um_contra_o_resto === 'number'
      ? ptInt(g.replicas_um_contra_o_resto) + ' réplicas'
      : esc(String(g.replicas_um_contra_o_resto))) + ' · corte ' +
    ptNum(g.corte_do_status, 2) + ' → ' + esc(g.status)) + ' ' +
    (divergeStatus
      ? '<b style="color:var(--pt-baixo)">O resultado não bate com o estudo original</b>, que chamou esta ' +
        'caixa de outra coisa' + ptTecnico('TIPOLOGIA.md: ' + esc(g.status_declarado_no_documento) + ' · ' +
        ptP(g.p_declarado_no_documento)) + '. Os dois ficam na tela — e é justamente esta caixa a mais frágil ' +
        'da divisão. A revisão achou a causa: o sorteio de comparação antigo sorteava de um jeito errado. A ' +
        'correção passa a contar todas as divisões possíveis — com ' + ptInt((t.plano || []).length) + ' times, ' +
        'cabem todas —, e aí os dois números viram um. Enquanto a conta não for refeita, o que está nesta ' +
        'tela é o de antes da correção.'
      : divergeP
        ? 'O estudo original deu um número um pouco diferente; <b>a conclusão é a mesma</b>.' +
          ptTecnico('TIPOLOGIA.md ' + esc(g.status_declarado_no_documento) + ' · ' +
            ptP(g.p_declarado_no_documento) + ' → ' + ptP(g.p_um_contra_o_resto))
        : 'Bate com o estudo original.' +
          ptTecnico('TIPOLOGIA.md ' + esc(g.status_declarado_no_documento) + ' · ' + ptP(g.p_declarado_no_documento)));

  return ptCard(g.grupo + ' — ' + ptInt(g.n) + ' times',
    '<span style="color:' + cor + ';font-weight:700">' + esc(veredito) + '</span>' +
      (divergeStatus ? ' · <span style="color:var(--pt-baixo)">o estudo original diz outra coisa</span>'
        : diverge ? ' · <span style="color:var(--tinta3)">número um pouco diferente do estudo original</span>' : '') +
      ptTecnico(esc(g.status) + ' · n = ' + ptInt(g.n)),
    corpo, nota);
}

function pb8Veredito(t, ver, passaram, divergentes) {
  if (!ver.length) return ptFaltaBloco('Sem a lista de testes',
    'o arquivo não trouxe tipologia.veredito; sem ela a tela mostraria as caixas sem dizer em que ' +
    'testes elas falharam, que é justamente o que a etapa acabou de enterrar');
  const naoPassaram = ver.length - passaram;
  const linhas = ver.map(v => Object.assign({}, v));

  /* A tabela imprime numero, corte e veredito lado a lado, e o leitor le o terceiro como
     consequencia dos dois primeiros. Nao e: o campo `corte` nao tem a mesma direcao em todas
     as linhas — ha linha em que o numero precisa ficar ABAIXO dele e linha em que nao —, e
     por isso duas linhas com o mesmo par (numero, corte) podem sair com vereditos opostos.
     Quem decide e o campo `passou`, escrito pelo pipeline. A tela nao arbitra: marca onde a
     conta nao fecha e diz de onde o veredito veio. */
  const incoerentes = linhas.filter(v => (Number(v.numero) < Number(v.corte)) !== !!v.passou);

  /* Duas contagens para a MESMA coisa dentro da mesma etapa: o inteiro que o pipeline
     escreveu dentro da string do teste e o campo `tipologia.fisico.colunas`. O inteiro sai
     daqui por regex, nunca digitado, e so e comparado nas linhas que falam do fisico. */
  const fis = t.fisico || {};
  const naString = ver.map(v => {
    const m = /(\d+)\s+colunas/.exec(String(v.teste));
    return (m && /f[íi]sic|fis_/i.test(String(v.teste))) ? { teste: v.teste, n: Number(m[1]) } : null;
  }).filter(x => x && fis.colunas !== undefined && fis.colunas !== null &&
    x.n !== Number(fis.colunas));
  const alfa = pbAlfa();
  const contaFecha = alfa !== null && fis.esperados_por_acaso !== undefined &&
    Math.abs(Number(fis.colunas) * alfa - Number(fis.esperados_por_acaso)) < 0.05;

  return ptCard('O que as caixas passaram, e o que NÃO passaram',
    ptInt(passaram) + ' de ' + ptInt(ver.length) + ' testes passaram',
    '<p class="pt-nota">Cada teste está escrito como a pergunta que ele responde. O nome original e os ' +
    'números da conta ficam embaixo, em letra miúda.</p>' +
    ptTabela({
      id: 'ptEt-8-tab-veredito',
      ordem: null,
      colunas: [
        { k: 'teste', rot: 'a pergunta', tipo: 'texto',
          fmt: v => (pb8Pergunta(v) ? '<b>' + esc(pb8Pergunta(v)) + '</b>' : esc(v)) +
            (pb8Pergunta(v) ? pbMiudo('<br>' + esc(v)) : '') },
        { k: 'passou', rot: 'resultado', fmt: (v, l) => pbSelo(v) +
            (l.julga_a_tipologia === false ? pbMiudo(' — não julga estas caixas: mede outra divisão') : '') },
        { k: 'numero', rot: 'a conta', tipo: 'texto', cel: (v, l) => {
            const coerente = (Number(l.numero) < Number(l.corte)) === !!l.passou;
            return '<td class="num"' + (coerente ? '' : ' title="' + esc(
              'aqui a linha de corte não funciona como teto: ' + pbCheio(l.numero) + ' contra ' + pbCheio(l.corte) +
              ' daria o resultado contrário ao que está escrito. O resultado desta linha é o que o estudo ' +
              'registrou no campo `passou`, não a comparação entre os dois números.') + '"') + '>' +
              ptTecnico('número ' + ptNum(v, 4) + ' · corte ' + ptNum(l.corte, 2)) +
              (coerente ? '' : ' <b style="color:var(--pt-baixo)">&#9888;</b>') + '</td>';
          } },
      ],
      linhas: linhas,
      vazio: 'nenhum teste registrado',
    }),
    '<b>' + ptInt(naoPassaram) + ' dos ' + ptInt(ver.length) + ' testes não passaram</b>, e estão na mesma ' +
    'tabela, com a mesma letra, na ordem em que foram feitos. A divisão vale porque foi testada <b>fora</b> ' +
    'do que a construiu — e o preço de dizer isso é mostrar também onde o teste falhou. Sem esta tabela, ' +
    'as ' + ptInt((t.grupos || []).length) + ' caixas acima seriam exatamente o agrupamento às cegas que ' +
    'a primeira metade desta etapa enterrou. ' +
    (divergentes.length
      ? '<br><b style="color:var(--pt-baixo)">Atenção:</b> em ' + ptInt(divergentes.length) +
        pbPl(divergentes.length, ' caixa', ' caixas') + ' o número do estudo original e o da conta refeita ' +
        'não são iguais (' + divergentes.map(g => esc(g.grupo)).join(', ') + '). ' +
        'A diferença está escrita no card de cada uma.'
      : '') +
    (incoerentes.length
      ? '<br><b style="color:var(--pt-baixo)">&#9888;</b> Em ' + ptInt(incoerentes.length) + ' ' +
        pbPl(incoerentes.length, 'linha', 'linhas') + ', a linha de corte se lê ao contrário das outras; o ' +
        'resultado mostrado é o que o estudo registrou.' +
        pbMiudo(' Lendo o corte como teto, ' + incoerentes.map(v => esc(v.teste) + ' (' + pbCheio(v.numero) +
          ' contra ' + pbCheio(v.corte) + ')').join('; ') + ' ' + pbPl(incoerentes.length, 'teria', 'teriam') +
          ' o resultado contrário; o resultado vem do campo passou do gerador (a linha de Hennig, no Jaccard, ' +
          'é piso e não teto).')
      : '') +
    (naString.length
      ? '<br><b>Duas contagens para a mesma coisa:</b> o nome do teste fala em ' +
        naString.map(x => ptInt(x.n)).join(' e ') + ' números físicos; a contagem usada nas contas é <b>' +
        ptInt(fis.colunas) + '</b>, e é dela que sai quantos passariam só por sorte (' +
        ptNum(fis.esperados_por_acaso, 1) + ').' +
        pbMiudo(' tipologia.fisico.colunas' + (contaFecha
          ? ' · ' + ptInt(fis.colunas) + ' × ' + ptNum(alfa, 2) + ' = ' + ptNum(fis.esperados_por_acaso, 1) : '') +
          ' · o número dentro do nome do teste é de quando ele rodou')
      : ''));
}

function pb8TesteDeFora(t) {
  const f = t.teste_de_fora || {};
  const limpa = t.bateria_limpa || {};
  const porInd = (f.por_indicador || []).map(x => {
    const l = { col: x.col, nome: pbNome(x.col), eta2: x.eta2, p: x.p, q: x.q };
    Object.keys(x.percentil_por_grupo || {}).forEach(g => { l['g_' + g] = x.percentil_por_grupo[g]; });
    return l;
  });
  if (!porInd.length) return ptFaltaBloco('Sem o teste de fora',
    'o arquivo não trouxe tipologia.teste_de_fora.por_indicador — e é ele que diz se as caixas ' +
    'aparecem em números que não as construíram');
  const gs = Object.keys((f.por_indicador[0] || {}).percentil_por_grupo || {});
  const pre = (t.bateria_pre_declarada || []).length;

  const colunas = [
    { k: 'nome', rot: 'número (nenhum entrou na montagem)', tipo: 'texto' },
    { k: 'eta2', rot: 'quanto a caixa explica', dica: 'eta²',
      fmt: v => pbExplica(v) + ptTecnico('eta² ' + ptNum(v, 3)) },
    { k: 'p', rot: 'é sorte?', dica: 'p-valor', fmt: v => esc(ptSorte(v)) + ptTecnico(ptP(v)) },
    { k: 'q', rot: 'descontada a sorte de testar muito', dica: 'q de Benjamini-Hochberg',
      fmt: v => esc(ptSorte(v)) + ptTecnico('q ' + ptPv(v)) },
  ].concat(gs.map(g => ({
    k: 'g_' + g, rot: 'posição de ' + g + ' no ranking',
    cel: (v, l) => ptCel(v, { casas: 1, sinal: 0, texto: ptNum(v, 0),
      motivo: 'sem posição para ' + g + ' em ' + l.col }),
  })));

  return ptCard('O teste de fora: as caixas aparecem em números que não as construíram?',
    ptInt(f.indicadores) + ' números testados · ' + ptInt(f.sobrevivem_bh5) +
      ' sobram descontada a sorte de testar muito, no corte mais duro',
    '<p class="pt-nota">Pega-se cada número que ficou de fora da montagem e pergunta-se: saber a caixa do ' +
      'time ajuda a adivinhar esse número? Em média, a caixa <b>explica ' + pbExplica(f.eta2_medio_obs) +
      '</b> da diferença entre os times. Com caixas sorteadas ao acaso, explicaria ' +
      pbExplica(f.eta2_medio_nulo_rotulo) + ' (' + esc(ptSorte(f.p_rotulo)) + ').' +
      ptTecnico('eta² ' + ptNum(f.eta2_medio_obs, 3) + ' contra ' + ptNum(f.eta2_medio_nulo_rotulo, 3) +
        ' · ' + ptP(f.p_rotulo)) +
      ' Com o <b>sorteio de comparação mais duro</b> — ' + ptInt(f.placebo_particoes) + ' divisões feitas ' +
      'ordenando os times por outros números reais de futebol —, explicaria ' +
      pbExplica(f.eta2_medio_nulo_placebo) + ' (' + esc(ptSorte(f.p_placebo)) + ').' +
      ptTecnico('nulo placebo ' + ptNum(f.eta2_medio_nulo_placebo, 3) + ' · ' + ptP(f.p_placebo)) +
      ' O duro é o que importa: ele respeita a ligação natural entre os números, que o sorteio fácil ' +
      'apaga. E quando se testa muita coisa, alguma dá certo por sorte; descontada essa sorte, sobram <b>' +
      ptInt(f.sobrevivem_bh5) + '</b> números no corte mais duro e <b>' + ptInt(f.sobrevivem_bh10) +
      '</b> no mais frouxo' +
      (pre ? ', de uma lista de ' + ptInt(pre) + ' números escrita antes de rodar' : '') + '.' +
      /* os cortes saem do nome das chaves (`sobrevivem_bh5`, `sobrevivem_bh10`), não de memória */
      ptTecnico('Benjamini-Hochberg a ' + Object.keys(f).map(k => (/^sobrevivem_bh(\d+)$/.exec(k) || [])[1])
        .filter(Boolean).map(v => v + '%').join(' e ')) + '</p>' +
    ptTabela({
      id: 'ptEt-8-tab-fora',
      ordem: { col: 'eta2', dir: 'desc' },
      colunas: colunas,
      linhas: porInd,
      vazio: 'nenhum número de fora foi testado',
    }),
    (limpa.p !== undefined
      ? '<b>O aviso que dá valor ao teste, e ele é grande:</b> ficando só com os <b>' +
        ptInt(limpa.validadores) + '</b> números de fora que <b>não andam junto</b> com os critérios da ' +
        'montagem, a caixa passa a explicar só ' + pbExplica(limpa.eta2_medio_obs) + ', contra ' +
        pbExplica(limpa.eta2_medio_nulo) + ' do sorteio (' + esc(ptSorte(limpa.p)) + ').' +
        ptTecnico('eta² ' + ptNum(limpa.eta2_medio_obs, 3) + ' contra ' + ptNum(limpa.eta2_medio_nulo, 3) +
          ' · ' + ptP(limpa.p)) +
        pbMiudo(' critério: ' + esc(limpa.criterio)) +
        ' Ou seja: boa parte do sinal do teste de fora é a família do passe dita com outras palavras — a ' +
        'rota reaparecendo com outro nome. Isto está aqui, e não no rodapé.'
      : ptFalta('a lista limpa de números de fora não veio no arquivo')));
}

function pb8DinheiroEstabilidade(t) {
  const din = t.dinheiro || {};
  const est = t.estabilidade || {};
  const fis = t.fisico || {};
  const form = t.formacao || {};
  const and = t.andares || {};
  const res = din.residualizado || {};
  const rival = din.particao_rival_so_dinheiro || {};
  const tirarTime = est.tirar_um_time || [];
  const tirarInd = est.tirar_um_indicador || [];
  const sil = (est.silhueta_espaco_reduzido || [])[0];
  const jac = est.jaccard;

  /* O Jaccard deste bloco NAO e o dos quadrantes, e a tela vinha sugerindo que era: o
     bootstrap refaz o agrupamento a cada replica e mede os grupos que ele mesmo encontrou.
     O proprio arquivo desmente a leitura — `tamanhos` nao bate com o n dos grupos da
     tipologia —, e e o arquivo que decide o rotulo aqui, nao a redacao. */
  const jacT = (jac && jac.tamanhos) || [];
  const nGrupos = (t.grupos || []).map(g => Number(g.n));
  const jacBate = !!jac && jacT.length > 0 && jacT.length === nGrupos.length &&
    jacT.every((v, i) => Number(v) === nGrupos[i]);
  const jacN = jac ? (jac.jaccard_por_grupo || []).length : 0;

  const maxTrocaTime = tirarTime.length ? Math.max.apply(null, tirarTime.map(x => x.trocas)) : null;
  const maxTrocaInd = tirarInd.length ? Math.max.apply(null, tirarInd.map(x => x.trocas)) : null;
  const semTroca = tirarInd.filter(x => x.trocas === 0);

  const nPlano = ptInt((t.plano || []).length);
  const sortePerm = ptSorte(din.p_permutacao), sorteKrus = ptSorte(din.p_kruskal);
  const dinheiroHtml =
    '<div class="pt-cf-grade">' +
      '<div class="pt-cf-l"><span>quanto a caixa explica do ranking de valor do elenco</span><b>' +
        pbExplica(din.eta2_posto_valor) + ptTecnico('eta² ' + ptNum(din.eta2_posto_valor, 3)) + '</b></div>' +
      '<div class="pt-cf-l"><span>é sorte? (sorteio de comparação)</span><b>' + esc(sortePerm) +
        ptTecnico('permutação ' + ptP(din.p_permutacao)) + '</b></div>' +
      '<div class="pt-cf-l"><span>é sorte? (segundo teste)</span><b>' + esc(sorteKrus) +
        ptTecnico('Kruskal ' + ptP(din.p_kruskal)) + '</b></div>' +
      '<div class="pt-cf-l"><span>divisão rival feita só com dinheiro: quanto explica dos números de fora</span><b>' +
        pbExplica(rival.eta2_medio) + ' contra ' + pbExplica(rival.eta2_medio_nulo) + ' do sorteio · ' +
        esc(ptSorte(rival.p)) + ptTecnico('eta² ' + ptNum(rival.eta2_medio, 3) + ' · ' + ptP(rival.p)) +
        '</b></div>' +
    '</div>' +
    '<p class="pt-nota">Os dois testes do dinheiro ' +
      (sortePerm !== sorteKrus
        ? '<b>discordam</b>: um diz "' + esc(sortePerm) + '", o outro diz "' + esc(sorteKrus) + '". Os dois ' +
          'estão na tela. Com ' + nPlano + ' times, a diferença entre eles é a amostra pequena falando. '
        : 'dizem o mesmo: "' + esc(sortePerm) + '". ') +
      'O teste que decide é outro: uma divisão rival montada <b>só</b> com o ranking de valor explica os ' +
      'números de fora em ' + pbExplica(rival.eta2_medio) + ', contra ' + pbExplica(rival.eta2_medio_nulo) +
      ' do sorteio (' + esc(ptSorte(rival.p)) + ')' +
      (pbPassa(rival.p) ? '.' : ' — dinheiro sozinho não reproduz estas caixas.') + '</p>' +
    (res.de !== undefined
      ? '<p class="pt-nota">E quando se <b>desconta o dinheiro</b> — comparando times de orçamento ' +
        'parecido e traçando as linhas de novo —, a rota ' +
        (res.muda_rota === 0 ? 'não tira <b>nenhum</b>' : 'tira <b>' + ptInt(res.muda_rota) + '</b>') +
        ' dos ' + ptInt(res.de) + ' times da sua caixa, e o território tira <b>' +
        ptInt(res.muda_territorio) + '</b> (' +
        (res.trocaram || []).map(esc).join(', ') + ').' + ptTecnico('residualizado no percentil de valor') +
        (res.muda_rota === 0 && res.muda_territorio > 0
          ? ' Para quem decide orçamento: <b>um dos dois critérios é meio bolso, e o outro não é bolso ' +
            'nenhum</b> — ocupar o campo do adversário é, em boa parte, o que o dinheiro compra; escolher ' +
            'se a bola chega lá pelo chão ou pelo alto, não.'
          : '') + '</p>'
      : '') +
    (din.rho_posto_valor_x_percentil_ppda !== undefined
      ? (function () {
          /* O sentido depende de duas escalas invertidas, e só a convenção gravada pelo estudo diz
             qual é: "rho positivo significa elenco caro pressiona alto". A frase sai dela e do sinal;
             sem convenção reconhecível, a tela não afirma lado nenhum. */
          const rho = Number(din.rho_posto_valor_x_percentil_ppda);
          const conv = String(din.convencao_ppda || '');
          const forca = ptJunto(rho).replace(/^andam (juntos|em sentido contrário) /, '');
          const sabeLado = /rho positivo significa elenco caro pressiona alto/.test(conv);
          return '<p class="pt-nota">' +
            (sabeLado && Math.abs(rho) >= 0.1
              ? 'Pressão e dinheiro: <b>elenco mais caro pressiona ' + (rho > 0 ? 'mais' : 'menos') +
                ' alto</b> — ' + esc(forca) + '.'
              : 'Ranking de valor do elenco e pressão: <b>' + esc(ptJunto(rho)) + '</b>; o sentido não é dito aqui.') +
            ptTecnico('ρ ' + ptNum(rho, 3)) +
            (conv ? pbMiudo(' Como ler o sentido: ' + esc(conv)) : '') + '</p>';
        })()
      : '');

  const estabHtml =
    '<div class="pt-cf-grade">' +
      '<div class="pt-cf-l"><span>tirando um time da conta: no máximo, quantos mudam de caixa</span><b>' +
        (maxTrocaTime === null ? ptFalta('teste ausente no arquivo') : ptInt(maxTrocaTime)) + ' de ' +
        nPlano + '</b></div>' +
      '<div class="pt-cf-l"><span>times que nunca mudam de caixa</span><b>' +
        ptInt((est.times_que_nunca_se_movem || []).length) + ' de ' + nPlano + '</b></div>' +
      '<div class="pt-cf-l"><span>tirando um número da montagem: no máximo, quantos mudam</span><b>' +
        (maxTrocaInd === null ? ptFalta('teste ausente no arquivo') : ptInt(maxTrocaInd)) + '</b></div>' +
      (sil
        ? '<div class="pt-cf-l"><span>as caixas ficam separadas, comparadas com dados falsos parecidos?</span><b>' +
          (Number(sil.silhueta_obs) < Number((sil.nulo_mesma_covariancia || {}).mediana)
            ? 'MENOS separadas que nos dados falsos'
            : 'mais separadas que nos dados falsos') +
          ' · ' + esc(ptSorte((sil.nulo_mesma_covariancia || {}).p)) +
          ptTecnico('silhueta ' + ptNum(sil.silhueta_obs, 2) + ' contra ' +
            ptNum((sil.nulo_mesma_covariancia || {}).mediana, 2) + ' · ' + ptP((sil.nulo_mesma_covariancia || {}).p)) +
          '</b></div>'
        : '') +
      (jac
        ? '<div class="pt-cf-l"><span>' +
          (jacBate
            ? 'quanto cada caixa reaparece igual ao refazer a conta (' + ptInt(jac.replicas) + ' vezes)'
            : 'quanto reaparecem iguais ' + ptInt(jacN) + ' grupos <b>de outra divisão</b> — tamanhos ' +
              jacT.map(v => ptInt(v)).join('/') + ', que <b>NÃO</b> são as caixas ' +
              nGrupos.map(v => ptInt(v)).join('/') + ' (' + ptInt(jac.replicas) + ' vezes)') +
          ptTecnico('Jaccard de bootstrap') + '</span><b>' +
          (jac.jaccard_por_grupo || []).map((v, i) => ptPct(v * 100, 0) +
            '<span style="font-weight:400;color:var(--tinta3)"> (' +
            (jacT[i] === undefined
              ? ptFalta('o arquivo não traz o tamanho deste grupo')
              : ptInt(jacT[i])) + ')</span>').join(' · ') + '</b></div>'
        : '') +
    '</div>' +
    (jac && !jacBate
      ? '<p class="pt-nota">Estes ' + ptInt(jacN) + ' números <b>não medem a firmeza das ' +
        ptInt(nGrupos.length) + ' caixas</b>, e ler o menor deles como "a caixa tal se desfaz" é trocar uma ' +
        'coisa pela outra. A conta é refeita ' + ptInt(jac.replicas) + ' vezes pedindo ' + ptInt(jac.k) +
        ' grupos a um programa de agrupar, e mede os grupos que ele mesmo encontrou: os dele têm tamanhos <b>' +
        jacT.map(v => ptInt(v)).join('/') + '</b>, as caixas têm <b>' + nGrupos.map(v => ptInt(v)).join('/') +
        '</b> — não são as mesmas. O que estes números dizem é que um agrupamento assim mal sobrevive a ' +
        'refazer a conta; a firmeza das caixas é a das linhas acima, tirar um time e tirar um número.</p>'
      : '') +
    '<p class="pt-nota">' +
      ((est.times_que_nunca_se_movem || []).length
        ? '<b>' + ptInt(est.times_que_nunca_se_movem.length) + '</b> dos ' + nPlano +
          ' times não mudam de caixa em teste nenhum: ' +
          est.times_que_nunca_se_movem.map(esc).join(', ') + '. '
        : '') +
      (semTroca.length
        ? 'E tirar <b>' + semTroca.map(x => esc(pbNome(x.removido))).join('</b> ou <b>') +
          '</b> da montagem não move um único time — ou seja, esse critério está sendo sustentado pelos ' +
          'outros números, não por aquele.'
        : '') +
    '</p>' +
    (sil
      ? '<p class="pt-nota">' +
        (pbPassa((sil.nulo_mesma_covariancia || {}).p)
          ? 'A separação das caixas <b>passa</b> no sorteio justo (' +
            esc(ptSorte((sil.nulo_mesma_covariancia || {}).p)) + ').</p>'
          : 'A separação das caixas é o teste que <b>não passa</b> (' +
            esc(ptSorte((sil.nulo_mesma_covariancia || {}).p)) + ')' +
            (Number(sil.silhueta_obs) < Number((sil.nulo_mesma_covariancia || {}).mediana)
              ? ' — as caixas ficam até <b>menos</b> separadas do que em dados falsos parecidos' : '') +
            ': mesmo olhando só os critérios da ' +
            'divisão, o que existe é <b>um mapa contínuo cortado em ' + ptInt((t.grupos || []).length) +
            '</b>, não ' + ptInt((t.grupos || []).length) + ' ilhas. As caixas são faixas, e os times de ' +
            'fronteira existem porque a linha é uma escolha.</p>')
      : '');

  const andares = Object.keys(and);
  /* `territorio_alto_G1_x_G2` dito como se fala; os nomes das caixas saem da própria chave. */
  const andarNome = k => {
    const m = /^territorio_(alto|baixo)_(\w+?)_x_(\w+)$/.exec(String(k));
    if (!m) return pbRotChave(k);
    return (m[1] === 'alto' ? 'entre os que jogam no campo do adversário' : 'entre os que jogam mais atrás') +
      ' (' + m[2] + ' × ' + m[3] + ')';
  };
  const negativos =
    '<div class="pt-cf-grade">' +
      (fis.colunas !== undefined
        ? '<div class="pt-cf-l"><span>físico: números testados</span><b>' + ptInt(fis.colunas) + '</b></div>' +
          '<div class="pt-cf-l"><span>físico: passam no corte simples</span><b>' + ptInt(fis.passam5) +
            ' contra ' + ptNum(fis.esperados_por_acaso, 1) + ' que passariam só por sorte</b></div>' +
          '<div class="pt-cf-l"><span>físico: sobram, descontada a sorte de testar muito</span><b>' +
            ptInt(fis.sobrevivem_bh5) + ptTecnico('Benjamini-Hochberg · menor q ' + ptNum(fis.menor_q_bh, 3)) +
            '</b></div>'
        : '') +
      /* `formacao.n` é o tamanho da amostra (clubes, jogos, fonte), não um teste: sem eta² a
         chave não é linha de achado negativo e não vira uma célula "sem medida" que não existe. */
      Object.keys(form).filter(k => form[k] && form[k].eta2 !== undefined)
        .map(k => '<div class="pt-cf-l"><span title="' + esc(k) + '">formação · ' + esc(ptNomeMedida(k)) +
        ': quanto a caixa explica</span><b>' + pbExplica(form[k].eta2) + ' · ' + esc(ptSorte(form[k].p)) +
        ptTecnico('eta² ' + ptNum(form[k].eta2, 3) + ' · ' + ptP(form[k].p)) + '</b></div>').join('') +
      andares.map(k => '<div class="pt-cf-l"><span title="' + esc(k) + '">' + esc(andarNome(k)) +
        ': quanto o jeito de a bola chegar explica</span><b>' +
        pbExplica(and[k].eta2_medio) + ' · ' + esc(ptSorte(and[k].p)) + ' · ' + ptInt(and[k].n) + ' times' +
        ptTecnico('eta² ' + ptNum(and[k].eta2_medio, 3) + ' · ' + ptP(and[k].p)) + '</b></div>').join('') +
    '</div>' +
    '<p class="pt-nota">' +
      (fis.sobrevivem_bh5 === 0
        ? '<b>Nenhum</b> dos ' + ptInt(fis.colunas) + ' números físicos sobra depois de descontar a sorte de ' +
          'testar muito: estes são tipos <b>táticos</b>, não atléticos, e a tela não pode ser usada para ' +
          'dizer "a caixa tal corre mais". '
        : '') +
      'A formação também não separa nada — e as linhas de três que aparecem nas médias das caixas são um ' +
      'time puxando a caixa inteira. O que separa é o corte de rota dentro de cada faixa de território' +
      (andares.length
        ? ', e mesmo ele com uma diferença entre os dois andares: ' + andares.map(k =>
            esc(andarNome(k)) + ', <b>' + esc(ptSorte(and[k].p)) + '</b>').join('; ') + '.'
        : '.') + '</p>';

  return ptCard('As caixas são só dinheiro com nome de tática?', 'com o número, não com o adjetivo',
    dinheiroHtml) +
    ptCard('Firmeza: quanto as caixas mudam quando se mexe na amostra',
      ptInt(tirarTime.length) + ' testes tirando um time · ' + ptInt(tirarInd.length) + ' tirando um número',
      estabHtml) +
    ptCard('O que estas caixas não deixam dizer', 'os achados negativos, em número',
      negativos);
}
