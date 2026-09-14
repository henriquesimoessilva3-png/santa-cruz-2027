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
  const dd = ptDado();
  const linhas = (dd && dd.etapa_2 && dd.etapa_2.linhas) || [];
  linhas.forEach(l => { if (l && l.indicador) PB_NOMES[l.indicador] = l.nome || l.indicador; });
  return PB_NOMES;
}
/* O cache é do dado que estava ativo quando foi montado. Duas abas com dados diferentes na
   mesma página herdariam o catálogo uma da outra sem este reset. */
ptAoTrocarDado(function () { PB_NOMES = null; });
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
  /* O α é da casca (ptAlfa): na aba de pontos ele é por universo, e só a casca sabe quando os
     universos concordam. */
  const a = ptAlfa();
  return (a === undefined || a === null) ? null : Number(a);
}
function pbPassa(p) {
  const a = pbAlfa();
  return a !== null && p !== null && p !== undefined && p < a;
}
function pbConta(v) {
  const info = ptAlfaInfo() || {};
  return v === null
    ? ptFalta((info.motivo || 'o arquivo não diz qual é a linha de corte da sorte') +
        ' — sem ela a tela não conta quem passou')
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

/* A cor por faixa de desfecho saiu desta parte da aba: na etapa 6 ela respondia outra pergunta
   (ver ptEtapa6) e era o único uso. O texto de faixa vem do vocabulário da casca (ptFxRot). */

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
/* As regras de juntar jogadores num número do time (`ponderada`, `mediana`, `top5`) chegam como
   chave. O nome e a frase saem do glossário, que os tirou do código que agrega
   (gerar_prototipo.py, agrega_tecnico_individual). Só vale a entrada do grupo das regras: a chave
   `mediana` também poderia ser outra coisa num glossário de 12 mil linhas. */
function pbRegra(k) {
  const g = typeof ptGlossario === 'function' ? ptGlossario(k) : null;
  if (!g || g.grupo !== 'regras_de_juntar_jogadores') return null;
  return { nome: g.nome_simples || g.nome_longo || g.nome || String(k), mede: g.mede || null, nota: g.nota || null };
}
/* Cabeçalho curto de matriz: a forma curta da casca. Desde o degrau 2 ela já sai corrigida nos
   três campos (pico de velocidade, % de defesas…), então não há mais contorno aqui — um segundo
   caminho de nome era o jeito de a matriz e o resto da aba voltarem a divergir. O setor sai do
   nome quando o painel inteiro é daquele setor. */
function pbCurto(id, setorDoPainel) {
  let nome = ptNomeCurto(id);
  if (setorDoPainel && PT_SETOR_NOME[setorDoPainel]) {
    const suf = ' (' + PT_SETOR_NOME[setorDoPainel] + ')';
    if (nome.slice(-suf.length).toLowerCase() === suf.toLowerCase()) nome = nome.slice(0, -suf.length);
  }
  return nome;
}
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
  /* O código da comparação vem do dado ativo (SM na Protótipo, AM na aba de pontos). */
  const m = /^(passam|bh)(\d+)(_liq)?_([A-Z]{2})$/.exec(s);
  if (!m || m[4] !== ptFx('SM')) return pbRotChave(s);
  /* O corte (o "5" de `passam5`) saiu do cabeçalho: repetido em quatro colunas ele não dizia o
     que era. Uma frase acima da tabela diz, uma vez, que "separam" é "dificilmente é sorte". */
  return (m[1] === 'passam'
      ? 'separam ' + ptFxRot('sobe', { forma: 'quem' }) + ' de ' + ptFxRot('meio', { forma: 'quem' })
      : 'sobram, descontada a sorte de testar muito') +
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
  const dd = ptDado();
  const anos = (dd && dd.etapa_0 && dd.etapa_0.por_ano) || [];
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
  const dd = ptDado();
  const anos = (dd && dd.etapa_0 && dd.etapa_0.por_ano) || [];
  if (!anos.length) return null;
  return Math.max.apply(null, anos.map(a => Number(a.n)));
}
function pb5RotN(n, unidade, ano) {
  const s = pb5UnidadeSuspeita(n, unidade, ano);
  const uni = unidade ? pbUnid(unidade) : 'unidade não declarada';
  if (!s) return '<span title="' + esc('medido sobre ' + ptInt(n) + ' ' + uni) + '">base ' + ptInt(n) + '</span>';
  const conta = s.ano === null
    ? 'nenhum ano da etapa 0 passa de ' + ptInt(s.limite) + ' clubes'
    : ptAno(s.ano) + ' teve ' + ptInt(s.limite) + ' clubes na Série B' +
      (s.ehRodadas ? ' e ' + ptInt(s.jogos) + ' rodadas, e este número é o das rodadas' : '');
  /* Curtíssimo na linha: as onze matrizes ficam abertas, e a coluna do time precisa ser estreita
     para as trinta e poucas colunas caberem sem rolar. A conta inteira vai no title e, uma vez só,
     no parágrafo ao pé da matriz. Repetir o parágrafo em cada linha faria o leitor parar de ler a
     ressalva — que é o mesmo efeito de não escrevê-la. */
  return 'base ' + ptInt(n) + ' ' + pbCinza('(não são ' + esc(uni) + ')',
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

   A matriz é montada à mão em vez de sair do `ptTabela` porque ela tem três linhas de rodapé
   (a faixa de quem subiu, a do meio e a de quem caiu) que precisam ficar coladas em cada coluna
   de indicador. O preço é conhecido e está dito na tela: esta tabela não ordena por clique.

   A ORDEM das colunas (pedido do dono, 14/09) é a que o gerador gravou em `ordem_por_diferenca`:
   da maior para a menor diferença, em módulo, entre o time típico que subiu e o típico que caiu.
   A tela não calcula a diferença nem a ordem — só as lê. Com dado sem essas chaves (a aba por
   pontos antes de ser regerada, um prototipo.js antigo), a ordem é a do arquivo e a tela diz isso. */

/* A ordem de leitura das colunas de um painel, lida do dado. Devolve os índices de `indicadores`
   na ordem de desenho e, quando não há ordem gravada (ou ela não é uma permutação dos índices), a
   ordem original com o motivo. Uma permutação torta aplicada em silêncio trocaria a célula de
   coluna — o pior erro possível numa matriz —, então ela é recusada inteira, não remendada. */
function pb5Ordem(p, nInd) {
  const kOrdem = 'ordem_por_diferenca';
  const kDif = ptK('diferenca_{sobe}_{cai}');
  const orig = Array.from({ length: nInd }, (_, i) => i);
  const ordem = p[kOrdem], dif = p[kDif];
  const semValor = p[kDif + '_sem_valor'] || {};
  if (!Array.isArray(ordem) || !Array.isArray(dif)) {
    return { idx: orig, dif: null, semValor: semValor, kOrdem: kOrdem, kDif: kDif,
      motivo: 'o ' + ptArquivoDado() + ' não traz a ordem por diferença neste painel (chaves ' + kOrdem +
        ' e ' + kDif + '); as colunas seguem a ordem do arquivo' };
  }
  const visto = {};
  const ok = ordem.length === nInd && dif.length === nInd &&
    ordem.every(i => Number.isInteger(i) && i >= 0 && i < nInd && !visto[i] && (visto[i] = true));
  if (!ok) {
    return { idx: orig, dif: null, semValor: semValor, kOrdem: kOrdem, kDif: kDif,
      motivo: 'a ordem gravada em ' + kOrdem + ' não casa com as ' + nInd + ' colunas deste painel; as ' +
        'colunas seguem a ordem do arquivo, para nenhuma célula mudar de coluna' };
  }
  return { idx: ordem.slice(), dif: dif, semValor: semValor, kOrdem: kOrdem, kDif: kDif, motivo: null };
}

/* A diferença no cabeçalho: número pequeno com sinal e o lado dito em português. "Acima" e
   "abaixo" são na escala das células (posição no ranking do ano), não "melhor" e "pior": o lado
   bom de cada número é outra informação, que já está na dica da coluna. */
function pb5DifTexto(v) {
  const quem = ptFxRot('sobe', { forma: 'verbo' }), outro = ptFxRot('cai', { forma: 'quem' });
  if (Number(v) === 0) return quem + ' empatado com ' + outro;
  return quem + ' ' + (v > 0 ? '+' : '') + ptNum(v, 0) + ' ' + (v > 0 ? 'acima' : 'abaixo') + ' de ' + outro;
}

function ptEtapa5(alvo, d) {
  const chaves = Object.keys(d.paineis || {});
  if (!chaves.length) {
    alvo.innerHTML = ptFaltaBloco('Nenhum painel nesta etapa',
      'o ' + ptArquivoDado() + ' traz `etapa_5` sem a chave `paineis` — sem ela não há matriz para desenhar');
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

  /* Tudo aberto, um painel embaixo do outro (pedido do dono): nada de escolher painel num botão.
     Cada painel leva a sua caixa de detalhe logo abaixo, escondida até o primeiro clique — uma
     caixa só no fim da etapa ficaria a dez tabelas de distância do quadradinho clicado. */
  const paineis = pilares.map(g =>
    '<span class="pt-rot" style="display:block;margin-top:18px">' + esc(pbRotPilar(g.pilar)) + ' · ' +
      ptInt(g.chaves.length) + ' ' + pbPl(g.chaves.length, 'painel', 'painéis') + '</span>' +
    g.chaves.map(k =>
      '<div data-pb5-painel="' + esc(k) + '" style="margin-top:10px">' +
        pb5Matriz(d, k) +
        '<div class="pt-controle" data-pb5-lupa id="' + esc(ptId('5-lupa-' + k)) + '" hidden></div>' +
      '</div>').join('')).join('');

  alvo.innerHTML =
    '<p class="pt-nota">Aqui estão os <b>' + ptInt(nClubes) + '</b> ' + esc(ptFxRot('sobe', { forma: 'times' })) +
      ', um por linha, com <b>' + ptInt(totalInd) + '</b> números sobre eles, em <b>' + ptInt(chaves.length) +
      '</b> painéis — todos abertos, um embaixo do outro. A cor de cada quadradinho é a <b>posição do time no ' +
      'ranking daquele ano</b>: ele foi comparado só com os outros clubes da mesma Série B, nunca com outra ' +
      'temporada. Cor forte numa ponta: estava entre os primeiros do ano. Na outra ponta: entre os últimos. ' +
      'Cor apagada: no meio do ranking, nem bem nem mal. Embaixo de cada coluna ficam os ' +
      esc(ptFxRot('sobe', { forma: 'times' })) + ', os ' + esc(ptFxRot('meio', { forma: 'times' })) +
      ' e os ' + esc(ptFxRot('cai', { forma: 'times' })) +
      ' — é a comparação que interessa.' + ptTecnico('percentil dentro do ano') + '</p>' +
    (semLado
      ? '<p class="pt-nota">Em <b>' + ptInt(semLado) + '</b> das ' + ptInt(totalInd) + ' colunas o estudo ' +
        '<b>não disse se ter mais é bom ou ruim</b>. Ali a cor mostra só a posição no ranking, e ler o tom ' +
        'forte como "melhor" seria invenção da tela. Ao passar o mouse na célula, o aviso aparece.' +
        ptTecnico('sinal: 0') + '</p>'
      : '') +
    '<p class="pt-nota">Passe o mouse no nome de uma coluna para ver o que ela mede, em que unidade e de ' +
      'onde vem. Clique num quadradinho para abrir, logo abaixo daquela tabela, o número medido, a posição, ' +
      'de quantos jogadores ou jogos ele saiu e a temporada. As tabelas <b>não se reordenam com clique</b>: ' +
      'as três linhas de baixo precisam ficar embaixo de cada coluna, e reordenar as descolaria. Para ordenar ' +
      'por qualquer número, use a etapa 2, onde cada número é uma linha.</p>' +
    falta4 +
    paineis +
    pb5Sensibilidade(d) +
    pb5Vazios(d);

  pb5Ligar(alvo);
}

/* O clique numa célula escreve na caixa de detalhe do PRÓPRIO painel. A busca é sempre dentro do
   painel (não por id), porque há onze caixas iguais na etapa e duas abas podem estar na página. */
function pb5Ligar(alvo) {
  alvo.querySelectorAll('[data-pb5-painel]').forEach(painel => {
    const lupa = painel.querySelector('[data-pb5-lupa]');
    painel.querySelectorAll('td[data-pt]').forEach(td => {
      td.style.cursor = 'pointer';
      td.onclick = () => {
        let x = null;
        try { x = JSON.parse(td.dataset.pt); } catch (err) { x = null; }
        if (!x || !lupa) return;
        painel.querySelectorAll('td[data-pt]').forEach(o => { o.style.outline = ''; });
        td.style.outline = '1px solid var(--tinta)';
        lupa.hidden = false;
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
          'daria outra posição. A cor mostra a posição; a decisão se toma olhando o número medido.</p>';
      };
    });
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
  /* O painel de um setor só (`tecnico_ind_zaga`) não precisa repetir "(zaga)" em cada coluna. */
  const mSetor = /_(zaga|lateral|meio|ataque)$/.exec(String(chave));
  const setor = mSetor ? mSetor[1] : null;
  /* Com muitas colunas o nome deita: é o que faz as trinta e poucas colunas caberem na largura da
     tela sem rolar para o lado. Com poucas, o nome em pé, quebrado em linhas, lê melhor. O corte é
     de desenho, não de dado — não aparece na tela. */
  const deitado = inds.length > 16;
  /* A faixa nao e escolha de tela: vem do nome da coluna do proprio arquivo. Se ela sumir do
     JSON, nada e marcado e o texto ao pe diz que nada foi marcado — o contrario do que esta
     tela fazia, que era prometer a marca no card dos vazios e desenhar a celula limpa. */
  const fbaixa = pb5FaixaBaixa(d);
  let marcadas = 0;                 /* celulas deste painel dentro da faixa */
  let suspeitas = 0;                /* linhas cujo rotulo de unidade nao fecha com a etapa 0 */
  let suspeitasJ = 0;               /* destas, as em que o n e exatamente o J (rodadas) do ano */
  let naoMarcadas = 0;              /* celulas na faixa que a marca nao alcancou (ptCel mudou) */
  const maxN = pb5MaxN(d, unid);    /* maior n na mesma unidade, para dar tamanho ao contraste */
  /* A ordem das colunas vem do gerador; tudo o que é "por coluna" (cabeçalho, célula, faixas)
     passa por `ord.idx`, para nada se descolar da sua coluna. */
  const ord = pb5Ordem(p, inds.length);

  const cab = '<thead><tr><th class="txt pt-col-fixa">time e ano</th>' +
    /* `white-space:normal` no deitado: a classe da casca não quebra linha e corta o nome na altura
       máxima ("pico de velocidade (" sumia no meio). Deitado, o nome quebra em duas ou três linhas
       dentro da largura que a coluna já tem por causa dos números. */
    ord.idx.map(j => {
      const i = inds[j] || {};
      const v = ord.dif ? ord.dif[j] : undefined;
      const motivoDif = ord.dif && (v === null || v === undefined)
        ? (ord.semValor[i.id] || 'sem motivo declarado no arquivo') : null;
      const difDica = !ord.dif ? ''
        : motivoDif ? ' · sem diferença entre ' + ptFxRot('sobe', { forma: 'quem' }) + ' e ' +
            ptFxRot('cai', { forma: 'quem' }) + ': ' + motivoDif
        : ' · ' + pb5DifTexto(v) + ' (típico contra típico, em posição no ranking do ano: ' + pbCheio(v) + ')';
      const difHtml = !ord.dif ? ''
        : '<small style="display:block;font-weight:400;color:var(--tinta3);font-size:9px;margin-top:2px">' +
          (motivoDif ? esc('sem diferença') : esc(pb5DifTexto(v))) + '</small>';
      return '<th class="num' + (deitado ? ' pt-th-vertical" style="white-space:normal' : '') + '" title="' +
        esc(ptDicaMedida(i.id || i.nome) + ' · nome na base ' + (i.origem || i.coluna_csv || i.id) +
          ' · medido sobre ' + pbUnid(i.unidade_n) + (i.sinal === 1 ? ' · ter mais é melhor' : i.sinal === -1
            ? ' · ter menos é melhor' : ' · o estudo não disse se ter mais é bom ou ruim') + difDica) + '">' +
        esc(i.id ? pbCurto(i.id, setor) : pbPopular(i.nome)) + difHtml + '</th>';
    }).join('') + '</tr></thead>';

  const corpo = clubes.map(c => {
    const cels = c.celulas || [];
    const nLinha = (cels.find(x => x && x[2] !== null && x[2] !== undefined) || [])[2];
    const vazia = cels.length && cels.every(x => x[1] === null || x[1] === undefined);
    const susp = pb5UnidadeSuspeita(nLinha, unid, c.ano);
    if (susp) { suspeitas++; if (susp.ehRodadas) suspeitasJ++; }
    const motivoLinha = vazia ? (cels[0][3] || 'sem motivo declarado no JSON') : '';
    return '<tr><td class="txt pt-col-fixa">' +
      '<b>' + esc(c.clube) + '</b> ' + ptAno(c.ano) +
      '<small style="display:block;color:var(--tinta3);font-size:10px;line-height:1.3">' +
        ptInt(c.pos) + 'º · ' + ptInt(c.pts) + ' pontos · ' +
        (nLinha === undefined
          ? '<i>' + esc(motivoLinha) + '</i>'
          : pb5RotN(nLinha, unid, c.ano)) +
      '</small></td>' +
      ord.idx.map(j => {
        const ind = inds[j] || {};
        const cel = cels[j] || [];
        const bruto = cel[0], pct = cel[1], n = cel[2], motivo = cel.length > 3 ? cel[3] : null;
        if (pct === null || pct === undefined) motivos.push(motivo || 'sem motivo declarado no JSON');
        /* O title e o bloco do clique levavam o mesmo rotulo cru que a linha levava; os tres
           saem agora pelo mesmo caminho, senao a contradicao sumiria da tela e continuaria
           inteira no lugar em que alguem vai conferir de perto. */
        const uniCel = pb5UnidadeCel(n, ind.unidade_n, c.ano);
        const td = ptCel(pct, {
          bruto: bruto, n: n, unidade: uniCel, ano: c.ano, sinal: ind.sinal, motivo: motivo,
          dados: (pct === null || pct === undefined) ? '' : JSON.stringify({
            c: c.clube, a: c.ano, i: ind.id ? ptNomeIndicador(ind.id) : pbPopular(ind.nome),
            k: (ind.origem || ind.coluna_csv || ind.id), b: bruto, p: pct, n: n, u: uniCel,
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

  /* As três faixas ao pé, na ordem subiram · meio · caíram (pedido do dono, 14/09: a de quem
     subiu no mesmo formato das outras duas). Elas são o que transforma a matriz de "lista de
     postos" em comparação: sem a faixa de quem caiu, um posto acima do meio parece bom sozinho.
     Os três números vão EMPILHADOS na célula: lado a lado eles alargavam cada coluna para o
     triplo, e a matriz voltava a rolar para o lado. Faixa que não veio no dado não some: a linha
     fica, com a ausência escrita numa célula só, para o leitor não achar que o grupo foi esquecido. */
  const estiloFx = 'color:var(--tinta3);font-size:10px;line-height:1.25;background:var(--fundo3)';
  const faixa = fx => {
    const k = ptK('faixa_', fx), arr = p[k], times = ptFxRot(fx, { forma: 'times' });
    const cabLinha = '<tr><td class="txt pt-col-fixa" style="background:var(--fundo3)" title="' +
      esc('metade dos ' + times + ' ficou entre o primeiro e o terceiro número; o do meio, em negrito, é o ' +
        'time típico — tudo em posição no ranking daquele ano (q1 · mediana · q3) · chave ' + k) + '"><b>' +
      esc(times) + '</b>';
    if (!Array.isArray(arr)) {
      return cabLinha + '</td><td class="txt" colspan="' + Math.max(ord.idx.length, 1) + '" style="' + estiloFx + '">' +
        pbMiudo(esc('o ' + ptArquivoDado() + ' não traz a faixa dos ' + times + ' neste painel (chave ' + k + ')')) +
        '</td></tr>';
    }
    return cabLinha +
      '<small style="display:block;color:var(--tinta3);font-size:10px;line-height:1.3">de cima para baixo: ' +
        '1º número · típico · 3º número</small></td>' +
      ord.idx.map(j => {
        const f = arr[j];
        return '<td class="num" style="' + estiloFx + '">' +
          (!f ? ptFalta('faixa ausente no arquivo')
              : pb5Q(f[0], 'q1') + '<br><b style="color:var(--tinta2)">' + pb5Q(f[1], 'mediana') +
                '</b><br>' + pb5Q(f[2], 'q3')) +
          '</td>';
      }).join('') + '</tr>';
  };
  const rodape = '<tfoot>' + ['sobe', 'meio', 'cai'].map(faixa).join('') + '</tfoot>';

  /* A regra da ordem numa linha acima da matriz, com as palavras da tela; a regra inteira do
     gerador (`etapa_5.regra_da_ordem`) vai no title, para quem quiser conferir. Sem ordem gravada,
     a mesma linha diz que a ordem é a do arquivo, discreta, com o motivo. */
  const regraOrdem = d.regra_da_ordem || {};
  const linhaOrdem = '<p class="pt-nota" style="margin:0 0 6px">' + (ord.motivo
    ? pbMiudo(esc('colunas na ordem do arquivo — ' + ord.motivo))
    : '<span title="' + esc(['o_que_e', 'diferenca', 'ordem', 'sem_diferenca', 'sem_teste']
        .filter(x => regraOrdem[x]).map(x => regraOrdem[x]).join(' · ') ||
        'o arquivo não traz etapa_5.regra_da_ordem') + '">Colunas da maior para a menor diferença entre o ' +
      'time típico que ' + esc(ptFxRot('sobe', { forma: 'verbo' })) + ' e o que ' +
      esc(ptFxRot('cai', { forma: 'verbo' })) + ', em posição no ranking do ano; o número pequeno embaixo ' +
      'do nome diz de que lado ficou quem ' + esc(ptFxRot('sobe', { forma: 'verbo' })) + '.</span>' +
      ptTecnico('ordem por |mediana ' + esc(ptFx('sobe')) + ' − mediana ' + esc(ptFx('cai')) + '|') +
      (regraOrdem.sem_teste ? pbMiudo(' É ordem de leitura, não teste: se a diferença passa da sorte está na etapa 2.') : '')) +
    '</p>';

  return '<div class="pt-card-cab" style="margin-bottom:8px">' +
      '<h4>' + esc(pbRotPilar(chave)) + '</h4>' +
      '<span>' + ptInt(inds.length) + ' números · ' + ptInt(clubes.length) + ' ' +
      esc(ptFxRot('sobe', { forma: 'times' })) + ' · cada número medido sobre ' +
      esc(unid ? pbUnid(unid) : 'unidade não declarada') +
      (suspeitas ? ' · ' + pbCinza('essa unidade não fecha com a etapa 0 — ver o aviso embaixo',
        'comparado com etapa_0.por_ano') : '') + '</span></div>' +
    linhaOrdem +
    '<div class="pt-tab-rola"><table class="pt-tab pt-matriz" id="' + esc(ptId('5-mat-' + chave)) + '">' +
      cab + '<tbody>' + corpo + '</tbody>' + rodape + '</table></div>' +
    ptLegendaPosto() +
    '<p class="pt-nota">Nas três linhas de baixo, cada coluna traz três números. <b>Não são o pior e o ' +
      'melhor do grupo:</b> metade dos times do grupo fica entre o primeiro e o terceiro número; o do meio, ' +
      'em negrito, é o time típico.' + ptTecnico('quartis: q1 · mediana · q3') + '</p>' +
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
        'O número aparece como veio, com o aviso ao lado; quem corrige a contagem é o gerador.' +
        pbMiudo(' a etapa 0 registra no máximo ' + ptInt(pb5MaxClubes()) + ' clubes por ano; ' +
          (suspeitasJ ? ptInt(suspeitasJ) + ' linhas batem exatamente com J (rodadas) do ano; ' : '') +
          'unidade_n = ' + esc(unid) + ' · comparado com n e J de etapa_0.por_ano · a correção é no gerador') + '</p>'
      : '');
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
    dica: 'nome e frase do glossário, tirados do código que junta os jogadores (agrega_tecnico_individual)',
    fmt: v => {
      const r = pbRegra(v);
      if (!r) return esc(pbRotChave(v)) + ' ' + ptFalta('o glossário não descreve esta regra; aparece a chave do arquivo');
      /* só a parte da frase que diz COMO se junta; o resto do texto do glossário fala da etapa */
      const mede = r.mede ? String(r.mede).split(' Vale para')[0] : null;
      return '<b>' + esc(r.nome) + '</b>' + (mede ? '<br>' + esc(mede) : '') +
        pbMiudo('<br>chave ' + esc(v) + (r.nota ? ' · ' + esc(String(r.nota).replace(/^Trecho do código que agrega:\s*/, 'no código: ')) : ''));
    } }].concat(
    campos.map(c => ({ k: c, rot: pbRotSens(c), casas: 0,
      dica: 'coluna `' + c + '` do ' + ptArquivoDado() })));
  /* Quantas conclusões mudam de uma regra para a outra: é o número que dá sentido ao bloco.
     Comparado contra a primeira regra listada, que é a que o pipeline usa como padrão. */
  const base = s[regras[0]];
  const divergem = campos.filter(c => regras.some(r => s[r][c] !== base[c]));
  return ptCard('Mudar o jeito de somar os jogadores muda o resultado',
    ptInt(regras.length) + ' jeitos de somar · ' + ptInt(campos.length) + ' contagens em cada um',
    '<p class="pt-nota">Para um número de jogador virar número do time, é preciso juntar os jogadores ' +
    'de algum jeito. Cada linha é um jeito. As colunas contam quantos números separam ' +
    esc(ptFxRot('sobe', { forma: 'quem' })) + ' de ' + esc(ptFxRot('meio', { forma: 'quem' })) +
    ': primeiro sem desconto nenhum; depois descontada a sorte — quando se testa muita coisa, ' +
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
      : 'Nenhuma contagem muda entre os jeitos de somar: nesta tabela, o resultado não depende do jeito de juntar os jogadores.') +
    pbMiudo(' Colunas no arquivo: ' + campos.map(esc).join(', ') + ' · ' + esc(ptFx('SM')) + ' = ' +
      esc(ptFxRot('sobe', { forma: 'nome' })) + ' × ' + esc(ptFxRot('meio', { forma: 'nome' })) +
      ' · bh = descontada a sorte de testar muito' + ptTecnico('Benjamini-Hochberg') +
      ' · liq = descontado o dinheiro' +
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
          casas: 0, dica: 'coluna `' + c + '` do ' + ptArquivoDado() })),
        linhas: v,
        vazio: 'o arquivo não trouxe a contagem de vazios por setor',
      })
    : ptFaltaBloco('Vazios por setor', 'o arquivo não trouxe vazios_por_setor — sem isso não dá para ' +
        'dizer quantas temporadas de clube ficaram sem gente no setor, e a tabela sozinha só mostra os que subiram');
  return ptCard('Onde faltou jogador para fazer a média do setor',
    'a contagem vale para todos os times da base, não só para os ' +
      ptInt((d.paineis[Object.keys(d.paineis)[0]].clubes || []).length) + ' ' +
      esc(ptFxRot('sobe', { forma: 'times' })),
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
        ptInt(fis.minutos_mediana) + '</b> minutos rastreados.' +
        /* A frase do "buraco no setor" só vale se até o elenco mais curto tiver mais gente que a faixa
           marcada; senão o buraco também pode ser do elenco, e a tela não afirma lado nenhum. */
        (fb && fis.minimo !== undefined && fis.minimo !== null && Number(fis.minimo) > fb.max
          ? ' Até o que menos tem passa de ' + ptInt(fb.max) + ' jogadores: o buraco não está no elenco, está ' +
            'no setor, quando o rastreamento pegou poucos jogadores daquela função.'
          : '') + ptTecnico('medianas') + '</p>'
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

   Todas as dispersões ficam abertas, em miniatura, com a MESMA escala — os dois eixos vão do
   mínimo ao máximo de todos os pontos do arquivo, não de cada indicador. Reescalar por
   indicador faria a nuvem do ppda ocupar o quadro inteiro e parecer tão organizada quanto a
   do físico, que é exatamente o engano que esta etapa existe para impedir.

   COR DOS PONTOS (pedido do dono, 14/09, substitui a cor neutra do item 10 de PENDENTE_RODADA):
   azul claro = no ano seguinte subiu; laranja = no ano seguinte caiu; cinza = meio. Na aba de
   pontos, as mesmas três cores leem a faixa de pontos do ano seguinte (ptFx/ptFxRot).
   A cor é o desfecho do ANO SEGUINTE (`pares[i].faixa_t1`), não do primeiro ano, porque quem
   subiu ou caiu no primeiro ano não tem par: no ano seguinte estava na A ou na C. O ano seguinte
   é o do eixo vertical — então cor separada em cima/embaixo quer dizer que o número daquele ano
   anda junto com o resultado daquele MESMO ano, e não que o número se repete. A pergunta da
   etapa continua sendo a diagonal; a tela diz as duas coisas com todas as letras. */

/* Cores novas (não há variável de "subiu/caiu" na casca nem no style.css que seja azul claro e
   laranja nos dois temas). Miolo claro + contorno escuro do mesmo tom: lê no fundo claro e no
   escuro, e o contorno separa pontos sobrepostos. As MESMAS no ponto e na legenda. */
const PB6_CORES = {
  sobe: { miolo: '#5cb8ee', contorno: '#1f6ea3' },   /* azul claro */
  cai:  { miolo: '#f39a3e', contorno: '#a3530f' },   /* laranja */
  meio: { miolo: 'var(--tinta3)', contorno: 'var(--tinta2)' },
};
/* A faixa interna (sobe/meio/cai) do ano seguinte de um par, lida pelo vocabulário da casca. */
function pb6Faixa(par, campo) {
  const v = par && par[campo || 'faixa_t1'];
  if (v === null || v === undefined) return null;
  const k = ptFx('sobe') === v ? 'sobe' : ptFx('cai') === v ? 'cai' : ptFx('meio') === v ? 'meio' : null;
  return k;
}
/* A bolinha da legenda é um <span>, não <svg>: `.pt-mini svg{width:100%}` esticaria um svg
   dentro da miniatura até a largura inteira. */
function pb6Bola(k, lado) {
  const c = PB6_CORES[k];
  const l = lado || 9;
  return '<span class="pb6-leg-bola" aria-hidden="true" style="display:inline-block;width:' + l + 'px;height:' + l +
    'px;border-radius:50%;box-sizing:border-box;vertical-align:-1px;background:' + c.miolo +
    ';border:1.5px solid ' + c.contorno + '"></span>';
}

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
  /* Do que mais se repete para o que menos. Número sem ρ vai para o fim, não some. */
  const rhoDe = k => { const v = (rho[k] || {}).rho; return v === null || v === undefined ? null : Number(v); };
  const ordenados = ids.slice().sort((a, b) => {
    const ra = rhoDe(a), rb = rhoDe(b);
    if (ra === null) return rb === null ? 0 : 1;
    if (rb === null) return -1;
    return rb - ra;
  });
  const ref = d.referencia_dinheiro || {};
  const tr = d.truncamento || {};
  const e10 = pb6Etapa10();
  const marcados = ordenados.filter(k => e10.linhas[k]);
  /* Azuis da etapa 7, lidos do dado: número marcado na etapa 10 que ali vem ANTES do resultado. */
  const azuis7 = pb6Azuis7();
  const marcadosAzuis = marcados.filter(k => azuis7[k]);
  const marcadosConseq = marcados.filter(k => {
    const l = e10.linhas[k];
    return l.consequencia_do_resultado === true || /consequ/i.test(String(l.tipo || ''));
  });
  /* Os indicadores de elenco que o pedido (item 10) quer com aviso de consequência do resultado.
     São ids de coluna, não números; a tela só diz quais deles o arquivo ainda não marca. */
  const pedidosSemMarca = PB6_PEDIDO_CONSEQ.filter(k => ids.indexOf(k) >= 0 && !e10.linhas[k]);

  /* A escala sai de TODOS os pontos do arquivo, não dos de cada número: é o que mantém as nuvens
     comparáveis entre si. Reescalar por número faria a nuvem mais espalhada parecer tão arrumada
     quanto a do valor do elenco. */
  let lo = Infinity, hi = -Infinity;
  ids.forEach(k => (disp[k] || []).forEach(pp => {
    if (!pp) return;
    [pp[0], pp[1]].forEach(v => { if (v !== null && v !== undefined) { lo = Math.min(lo, v); hi = Math.max(hi, v); } });
  }));
  if (!isFinite(lo) || hi === lo) { lo = isFinite(lo) ? lo - 1 : 0; hi = isFinite(hi) ? hi + 1 : 1; }

  /* A tabela com TODOS os ρ: a dispersão só existe para uma parte deles, e a diferença entre
     "ρ baixo" e "ρ que nem tem pontos guardados" precisa estar visível linha a linha. */
  const linhas = todos.map(k => ({
    nome: pbNome(k), id: k, rho: (rho[k] || {}).rho, p: (rho[k] || {}).p, n: (rho[k] || {}).n,
    pontos: Object.prototype.hasOwnProperty.call(disp, k) ? 1 : 0,
    e10: e10.linhas[k] ? 1 : 0,
    _dica: pbSemNome(k) ? 'o catálogo da etapa 2 não conhece esta coluna — o que aparece é o id cru' : '',
  }));
  const semPontos = linhas.filter(l => !l.pontos).length;
  const acimaDoDinheiro = ref.rho === undefined || ref.rho === null ? null
    : ordenados.filter(k => rhoDe(k) !== null && rhoDe(k) >= Number(ref.rho)).length;
  /* A legenda com o total de pares de cada cor, contado do dado (cada par é um ponto em cada
     quadradinho que tem os dois valores; a contagem de cada quadradinho vai embaixo dele). */
  const contaPares = { sobe: 0, cai: 0, meio: 0, sem: 0 };
  (d.pares || []).forEach(par => { contaPares[pb6Faixa(par) || 'sem']++; });
  /* Por que a cor é o ano seguinte. "O primeiro ano não separaria ninguém" só é verdade quando
     todos os pares têm a MESMA faixa no primeiro ano (por posição: todos no meio, porque quem subiu
     ou caiu não tem par). Na aba de pontos a faixa do primeiro ano varia, e a frase não entra. */
  const fxPrimeiro = {};
  (d.pares || []).forEach(par => { const f = pb6Faixa(par, 'faixa_t'); fxPrimeiro[f || 'sem'] = 1; });
  const unicaPrimeiro = Object.keys(fxPrimeiro).length === 1 && !fxPrimeiro.sem ? Object.keys(fxPrimeiro)[0] : null;
  const porQueCor = unicaPrimeiro
    ? ' Ela vem desse ano porque o primeiro não separaria ninguém: nos ' + ptInt((d.pares || []).length) +
      ' pares, no primeiro ano, todos ' + esc(ptFxRot(unicaPrimeiro, { forma: 'verbos' })) +
      (unicaPrimeiro === 'meio' && !d.faixas
        ? ' — quem subiu ou caiu naquele ano não tem par, porque no ano seguinte já não estava na Série B.'
        : '.')
    : ' Aqui o primeiro ano também tem faixa; a cor fica com o ano seguinte por escolha, para ler junto com ' +
      'o eixo vertical.';
  const legenda = '<div class="pt-controle pb6-legenda"><span class="pt-rot">As cores</span>' +
    '<p class="pt-nota">' +
    ['sobe', 'cai', 'meio'].map(k => '<span style="display:block">' + pb6Bola(k) + ' ' +
      (k === 'sobe' ? '<b>azul claro</b>' : k === 'cai' ? '<b>laranja</b>' : '<b>cinza</b>') + ': no ano seguinte, ' +
      esc(ptFxRot(k, { forma: 'verbo' })) + ' — <b>' + ptInt(contaPares[k]) + '</b> ' +
      pbPl(contaPares[k], 'par', 'pares') + '</span>').join(' ') +
    (contaPares.sem
      ? ' ' + ptFalta(ptInt(contaPares.sem) + ' ' + pbPl(contaPares.sem, 'par sem', 'pares sem') +
          ' a faixa do ano seguinte no arquivo: ' + pbPl(contaPares.sem, 'fica', 'ficam') + ' fora da contagem de cor')
      : '') +
    ' São ' + ptInt((d.pares || []).length) + ' pares ao todo. Embaixo de cada quadradinho, quantos pontos de cada cor ' +
    'ele desenha (quadradinho sem um dos dois valores de um par tem menos pontos).</p></div>';

  const minis = '<div class="pt-minis">' +
    ordenados.map(k => pb6Mini(d, k, lo, hi, e10)).join('') + '</div>';

  alvo.innerHTML =
    '<p class="pt-nota">São <b>' + ptInt(d.n_pares) + '</b> pares: o mesmo clube em dois anos seguidos ' +
      'na Série B. <b>Característica que não se repete no ano seguinte é retrato de um ano, não modelo de ' +
      'jogo.</b></p>' +

    (ref.rho !== undefined
      ? '<div class="pt-controle"><span class="pt-rot">A comparação: o que de fato se repete</span>' +
        '<p class="pt-nota">O <b>valor do elenco</b> de um ano e o do ano seguinte <b>' + esc(ptJunto(ref.rho)) +
        '</b> — em ' + ptInt(ref.n) + ' pares, e ' + esc(ptSorte(ref.p)) + '.' +
        ptTecnico(esc(ref.indicador) + ' · ρ = ' + ptNum(ref.rho, 3) + ' · ' + ptP(ref.p)) +
        ' Todo número desta etapa se lê contra este' +
        /* "é principalmente o bolso" só se nenhum número se repete tanto quanto o valor do elenco. */
        (acimaDoDinheiro === 0
          ? ': nenhum dos ' + ptInt(ids.length) + ' se repete tanto quanto ele, então o que o clube carrega de ' +
            'um ano para o outro, nesta amostra, é principalmente o tamanho do bolso.'
          : '.') + '</p></div>'
      : ptFaltaBloco('Sem o número de comparação',
          'o arquivo não trouxe referencia_dinheiro; sem ele cada resultado fica solto, sem nada que diga ' +
          'o que é "se repete muito" nesta liga')) +

    ptCard('O time que estava alto num ano continua alto no outro?',
      'a pergunta é a DIAGONAL · ' + ptInt(ids.length) + ' números, do que mais se repete para o que menos · ' +
        'a mesma escala em todos',
      '<p class="pt-nota">Cada quadradinho é um número. Cada ponto dentro dele é um clube: na horizontal, a ' +
        'posição dele no ranking do primeiro ano; na vertical, a posição no ano seguinte. Os dois eixos vão de ' +
        ptNum(lo, 0) + ' a ' + ptNum(hi, 0) + ' em todos os quadradinhos. <b>A pergunta desta etapa é a ' +
        'diagonal</b> (a linha tracejada): se o time que estava alto num ano continua alto no outro, os pontos ' +
        'sobem por ela; se não continua, viram uma mancha sem direção.</p>' +
      '<p class="pt-nota"><b>A cor mostra outra coisa: o que o time fez no ano seguinte</b> — o ano do eixo ' +
        'vertical: ' + ['sobe', 'cai', 'meio'].map(k => esc(ptFxRot(k, { forma: 'quem' }))).join(', ') + '.' +
        porQueCor + ' <b>Pontos de uma cor em cima e de outra embaixo querem ' +
        'dizer que o número daquele ano anda junto com o resultado daquele mesmo ano — não que o número se ' +
        'repete.</b> Se o número se repete, quem diz é só a diagonal.</p>' +
      legenda +
      minis,
      (acimaDoDinheiro === null
        ? ptFalta('sem o valor do elenco para comparar, a tela não diz quantos se repetem tanto quanto ele')
        : acimaDoDinheiro === 0
          ? '<b>Nenhum</b> dos ' + ptInt(ids.length) + ' números se repete tanto quanto o valor do elenco.'
          : '<b>' + ptInt(acimaDoDinheiro) + '</b> dos ' + ptInt(ids.length) + ' ' +
            pbPl(acimaDoDinheiro, 'número se repete', 'números se repetem') + ' tanto quanto o valor do elenco ou mais.') +
      (marcados.length
        ? ' <b>' + ptInt(marcados.length) + '</b> ' + pbPl(marcados.length, 'quadradinho leva', 'quadradinhos levam') +
          ' a marca <span class="pt-marca alerta">etapa ' + ptInt(e10.n) + '</span>: ' +
          pbPl(marcados.length, 'está', 'estão') + ' na lista da etapa ' + ptInt(e10.n) +
          (e10.titulo ? ' («' + esc(e10.titulo) + '»)' : '') + ', e embaixo de cada um vai só o motivo ' +
          'gravado para aquele número (o do catálogo da etapa 2, quando a letra é a mesma; sem ele, o resumo ' +
          'da letra). ' +
          (marcadosConseq.length
            ? 'Em <b>' + ptInt(marcadosConseq.length) + '</b> deles a linha grava que é <b>consequência do ' +
              'resultado</b>: ' + marcadosConseq.map(k => esc(pbNome(k))).join(', ') + '.'
            : 'A marca não diz que o número é consequência do resultado: nenhuma linha deste arquivo grava isso.') +
          (marcadosAzuis.length
            ? ' <b>Atenção:</b> ' + marcadosAzuis.map(k => '<b>' + esc(pbNome(k)) + '</b>').join(', ') + ' ' +
              pbPl(marcadosAzuis.length, 'leva', 'levam') + ' a marca e, na etapa 7, ' +
              pbPl(marcadosAzuis.length, 'é azul', 'são azuis') + ': o número do 1º turno ajuda a prever os ' +
              'pontos do 2º, descontados os pontos do 1º. As duas coisas estão no dado; uma não apaga a outra.'
            : '') +
          (pedidosSemMarca.length
            ? ' ' + ptFalta(pedidosSemMarca.map(k => pbNome(k)).join(', ') + ' ' +
                pbPl(pedidosSemMarca.length, 'tem quadradinho mas não leva marca', 'têm quadradinho mas não levam marca') +
                ': ' + pbPl(pedidosSemMarca.length, 'não está', 'não estão') + ' na lista da etapa ' +
                (e10.n === null ? '?' : ptInt(e10.n)) + ' deste arquivo, e o aviso de "consequência do resultado" ' +
                'só entra quando o gerador gravar esse campo') +
              pedidosSemMarca.map(k => pb6MotivoCatalogo(k)
                ? ' ' + ptTecnico(esc(pbNome(k)) + ', no catálogo da etapa 2: ' + esc(pb6MotivoCatalogo(k).texto))
                : '').join('')
            : '')
        : '')) +

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
          { k: 'rho', rot: 'um ano e o seguinte', tipo: 'texto', dica: 'ρ de Spearman entre a posição no ano e no ano seguinte',
            fmt: v => esc(ptJunto(v)) + ptTecnico('ρ ' + ptNum(v, 3)) },
          { k: 'p', rot: 'é sorte?', tipo: 'texto', dica: 'p-valor', fmt: v => esc(ptSorte(v)) + ptTecnico(ptP(v)) },
          { k: 'n', rot: 'pares', casas: 0 },
          { k: 'pontos', rot: 'no gráfico', tipo: 'texto',
            fmt: v => v ? 'tem quadradinho' : '<span style="color:var(--tinta3)">só o resultado</span>' },
          { k: 'e10', rot: 'na lista da etapa ' + ptInt(e10.n), tipo: 'texto',
            fmt: (v, l) => v ? pb6Marca(e10, l.id, true) : '' },
        ],
        linhas: linhas,
        vazio: 'o arquivo não trouxe nenhum resultado de ano para ano',
      }),
      'O arquivo guarda os pontos de <b>' + ptInt(ids.length) + '</b> números e, para os outros <b>' +
      ptInt(semPontos) + '</b>, o estudo só guardou o resultado final. Esses não têm quadradinho, e ' +
      'estão marcados linha a linha em vez de sumir da lista.');
}

/* A lista da etapa 10 lida do dado ativo — nunca uma lista de nomes digitada aqui. O número e o
   título da etapa saem do sumário da casca (PT_ETAPAS), para o aviso apontar para o lugar certo. */
const PB6_PEDIDO_CONSEQ = ['share_11', 'conc_hhi', 'atletas_usados', 'nucleo_300'];
function pb6Azuis7() {
  const dd = ptDado();
  const out = {};
  ((dd && dd.etapa_7 && dd.etapa_7.linhas) || []).forEach(l => {
    if (l && l.indicador && l.sinal_certo && pbPassa(l.p_parcial)) out[l.indicador] = true;
  });
  return out;
}
function pb6Etapa10() {
  const dd = ptDado();
  const bloco = (dd && dd.etapa_10) || {};
  const linhas = {};
  (bloco.linhas || []).forEach(l => { if (l && l.indicador) linhas[l.indicador] = l; });
  const n = (String(bloco.titulo_chave || '').match(/\d+/) || [])[0];
  const numero = n !== undefined ? Number(n) : null;
  const et = typeof PT_ETAPAS !== 'undefined' && numero !== null ? PT_ETAPAS.find(e => e[0] === numero) : null;
  return { linhas: linhas, n: numero, titulo: et ? et[1] : null };
}
/* O motivo que o catálogo da etapa 2 grava para a coluna (`porta_motivo`). É o motivo daquele
   número, e não o resumo da letra: a letra B junta "não se repete" e "pode ser sorte de testar
   muitos parecidos", e numa etapa que pergunta justamente "isso se repete?" o resumo esconderia a
   resposta que o dado tem. O parêntese técnico do motivo ("rho=0,097 em 36 pares") vai para o
   número pequeno. */
function pb6MotivoCatalogo(id) {
  const dd = ptDado();
  const l = ((dd && dd.etapa_2 && dd.etapa_2.linhas) || []).find(x => x && x.indicador === id);
  if (!l || !l.porta_motivo) return null;
  const s = String(l.porta_motivo);
  const m = /^(.*?)\s*\(([^()]*)\)\s*$/.exec(s);
  return { texto: s, frase: m ? m[1] : s, tecnico: m ? m[2] : null, porta: l.porta };
}
/* Por que aquele número está na lista, do mais específico para o mais genérico: o motivo próprio
   da linha (aba de pontos) → o do catálogo, se a letra do catálogo é a mesma da linha → o resumo
   da letra (ptPortaTxt) → o tipo. Sem nenhum, a ausência dita. Devolve {frase, tecnico, origem}. */
function pb6Motivo10(l) {
  const porta = l.porta || l.porta_no_catalogo;
  if (l.motivo) return { frase: String(l.motivo), tecnico: null, origem: 'motivo gravado na linha' };
  const cat = pb6MotivoCatalogo(l.indicador);
  if (cat && (!porta || !cat.porta || cat.porta === porta)) {
    return { frase: cat.frase, tecnico: cat.tecnico, origem: 'motivo gravado no catálogo da etapa 2' };
  }
  if (porta && ptPortaTxt(porta)) return { frase: ptPortaTxt(porta), tecnico: null, origem: 'resumo da letra ' + porta };
  if (l.tipo) return { frase: pbRotChave(l.tipo), tecnico: null, origem: 'tipo gravado na linha' };
  return null;
}
function pb6Marca(e10, id, comTexto) {
  const l = e10.linhas[id];
  if (!l) return '';
  const motivo = pb6Motivo10(l);
  const titulo = 'na lista da etapa ' + (e10.n === null ? '?' : e10.n) + (e10.titulo ? ' (' + e10.titulo + ')' : '') +
    ': ' + (motivo ? motivo.frase + (motivo.tecnico ? ' (' + motivo.tecnico + ')' : '') + ' · ' + motivo.origem
      : 'sem motivo gravado na linha');
  return '<span class="pt-marca alerta" title="' + esc(titulo) + '">etapa ' +
      (e10.n === null ? ptFalta('sem número de etapa no dado') : ptInt(e10.n)) + '</span>' +
    (comTexto ? ' ' + (motivo ? esc(motivo.frase) + (motivo.tecnico ? ptTecnico(esc(motivo.tecnico)) : '')
      : ptFalta('a linha desta etapa no arquivo não diz o motivo')) : '');
}

function pb6Mini(d, id, lo, hi, e10) {
  const pares = d.pares || [];
  const pontos = (d.dispersao || {})[id] || [];
  const r = (d.rho || {})[id] || {};
  const LADO = 100, M = 4, W = LADO + 2 * M;
  const px = v => M + (v - lo) / (hi - lo) * LADO;
  const py = v => M + LADO - (v - lo) / (hi - lo) * LADO;
  /* Conferido antes de desenhar: a ordem de `dispersao[ind]` é a ordem de `pares`. A cor é a
     faixa do ano seguinte do par (pb6Faixa). Os cinzas vão por baixo e os coloridos por cima,
     para a cor não sumir atrás de um cinza no mesmo lugar. */
  const conta = { sobe: 0, cai: 0, meio: 0, sem: 0 };
  const camadas = { meio: [], sem: [], sobe: [], cai: [] };
  pontos.forEach((pp, i) => {
    if (!pp || pp[0] === null || pp[0] === undefined || pp[1] === null || pp[1] === undefined) return;
    const par = pares[i] || {};
    const fx = pb6Faixa(par);
    const k = fx || 'sem';
    conta[k]++;
    const c = PB6_CORES[fx || 'meio'];
    camadas[k].push('<circle class="pb6-ponto" data-faixa="' + k + '" cx="' + px(pp[0]).toFixed(1) +
      '" cy="' + py(pp[1]).toFixed(1) + '" r="' + (fx === 'sobe' || fx === 'cai' ? '2.6' : '2.2') + '" ' +
      'fill="' + c.miolo + '" fill-opacity="' + (fx === 'sobe' || fx === 'cai' ? '0.85' : '0.45') + '" ' +
      'stroke="' + c.contorno + '" stroke-width="0.7"><title>' +
      esc((par.clube || 'clube não identificado') + ' · ' + ptAno(par.ano_t) + ' → ' + ptAno(par.ano_t1) +
        ' · posição no ranking ' + ptNum(pp[0], 0) + ' → ' + ptNum(pp[1], 0) + ' · no ano seguinte, ' +
        (fx ? ptFxRot(fx, { forma: 'verbo' }) : 'sem faixa no arquivo')) + '</title></circle>');
  });
  const bolas = camadas.meio.join('') + camadas.sem.join('') + camadas.sobe.join('') + camadas.cai.join('');
  const linhaCores = '<div class="pt-mini-num pb6-conta">' +
    ['sobe', 'cai', 'meio'].map(k => '<span data-faixa="' + k + '" title="' +
      esc('pontos de quem, no ano seguinte, ' + ptFxRot(k, { forma: 'verbo' })) + '">' + pb6Bola(k, 8) + ' ' +
      ptInt(conta[k]) + '</span>').join(' · ') +
    (conta.sem ? ' · ' + ptFalta(ptInt(conta.sem) + ' sem faixa') : '') + '</div>';
  const svg = '<svg viewBox="0 0 ' + W + ' ' + W + '" role="img" aria-label="' +
      esc(pbNome(id) + ': posição num ano contra a do ano seguinte') + '">' +
    '<rect x="' + M + '" y="' + M + '" width="' + LADO + '" height="' + LADO + '" fill="none" stroke="var(--borda)"/>' +
    '<line x1="' + px(lo) + '" y1="' + py(lo) + '" x2="' + px(hi) + '" y2="' + py(hi) +
      '" stroke="var(--tinta3)" stroke-dasharray="3 3" stroke-width="1"/>' +
    bolas + '</svg>';
  const temRho = r.rho !== null && r.rho !== undefined;
  return '<div class="pt-mini" data-ind="' + esc(id) + '" title="' + esc(ptDicaMedida(id)) + '">' +
    '<div class="pt-mini-tit">' + esc(pbNome(id)) + '</div>' +
    svg + linhaCores +
    '<div class="pt-mini-num">' +
      (temRho
        ? '<b style="color:var(--tinta)">' + esc(ptJunto(r.rho)) + '</b> · ' + esc(ptSorte(r.p)) +
          ptTecnico('ρ ' + ptNum(r.rho, 2) + ' · ' + ptInt(r.n) + ' pares')
        : ptFalta('sem o resultado de um ano para o outro no arquivo')) +
    '</div>' +
    (e10.linhas[id] ? '<div class="pt-mini-num">' + pb6Marca(e10, id, true) +
      (pb6Azuis7()[id] ? ' · <b>na etapa 7 é azul</b>: vem antes do resultado' : '') + '</div>'
      : PB6_PEDIDO_CONSEQ.indexOf(id) >= 0
        ? '<div class="pt-mini-num">' + ptFalta('fora da lista da etapa ' + (e10.n === null ? '?' : ptInt(e10.n)) +
            ' deste arquivo: sem aviso de consequência do resultado até o gerador gravar esse campo') +
            (pb6MotivoCatalogo(id) ? ptTecnico('no catálogo: ' + esc(pb6MotivoCatalogo(id).texto)) : '') + '</div>'
        : '') +
  '</div>';
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
  const ref = ptLer('etapa_7.referencia_pts1t_x_pts2t') || d.referencia_pts1t_x_pts2t || {};
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
          erradoSinal.map(l => esc(l.nome)).join(', ') + '). Sentido virado não se lê como achado ao contrário' +
          /* "é ruído" só se nenhum deles passa no corte depois do desconto; o que passa fica nomeado. */
          (alfa === null
            ? '.'
            : erradoSinal.some(l => pbPassa(l.p_parcial))
              ? ': ' + erradoSinal.filter(l => pbPassa(l.p_parcial)).map(l => '<b>' + esc(l.nome) + '</b>').join(', ') +
                ' ' + pbPl(erradoSinal.filter(l => pbPassa(l.p_parcial)).length, 'passa', 'passam') +
                ' no corte mesmo com o desconto, e merece leitura linha a linha.'
              : ': nenhum deles passa no corte depois do desconto, então pode ser sorte apontando para um lado qualquer.')
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
  /* Pelo caminho da casca: na aba de pontos a chave tem outro nome, e o mapa do dado traduz. */
  const ref = ptLer('etapa_7.referencia_pts1t_x_pts2t') || d.referencia_pts1t_x_pts2t || {};
  const temRef = ref.rho !== undefined && ref.rho !== null;
  const alfa = pbAlfa();
  const vals = [];
  linhas.forEach(l => { vals.push(l.rho_bruto, l.rho_parcial); });
  if (temRef) vals.push(ref.rho);
  const lo = Math.min.apply(null, vals.concat([0])), hi = Math.max.apply(null, vals.concat([0]));
  const pad = (hi - lo) * 0.08;
  /* A coluna dos nomes cresce com o nome mais comprido (texto de SVG não quebra linha): com uma
     largura fixa, "pressão (passes do adversário…)" perdia o começo na borda esquerda. */
  const maiorNome = Math.max.apply(null, linhas.map(l => String(l.nome || '').length).concat([0]));
  const L = Math.max(214, Math.ceil(maiorNome * 5.4) + 14), LARG = 250, T = 64, ALT = 17;
  const px = v => L + (v - (lo - pad)) / ((hi + pad) - (lo - pad)) * LARG;
  const ordem = linhas.slice().sort((a, b) => b.rho_bruto - a.rho_bruto);

  /* As três cores, contadas do dado: é a mesma regra que pinta cada traço. */
  const corDe = l => l.sinal_certo ? (pbPassa(l.p_parcial) ? 'var(--pt-alto)' : 'var(--tinta3)') : 'var(--pt-baixo)';
  const azuis = linhas.filter(l => l.sinal_certo && pbPassa(l.p_parcial)).length;
  const cinzas = linhas.filter(l => l.sinal_certo && !pbPassa(l.p_parcial)).length;
  const laranjas = linhas.filter(l => !l.sinal_certo).length;
  const passaram = alfa === null ? null : linhas.filter(l => pbPassa(l.p_parcial)).length;
  const porSorte = alfa === null ? null : linhas.length * alfa;
  const passaramContra = alfa === null ? null : linhas.filter(l => pbPassa(l.p_parcial) && !l.sinal_certo).length;
  /* "Chega na linha verde" = força, sem o sentido, igual ou maior que a dos pontos do 1º turno. */
  const chegam = temRef ? linhas.filter(l => Math.abs(l.rho_bruto) >= Math.abs(ref.rho)).length : null;

  const zero = px(0);
  const corpo = ordem.map((l, i) => {
    const y = T + i * ALT;
    const a = px(l.rho_bruto), b = px(l.rho_parcial);
    const forte = pbPassa(l.p_parcial);
    const cor = corDe(l);
    return '<line x1="' + a.toFixed(1) + '" y1="' + y + '" x2="' + b.toFixed(1) + '" y2="' + y +
        '" stroke="' + cor + '" stroke-width="1.5" stroke-opacity="0.5"/>' +
      '<circle cx="' + a.toFixed(1) + '" cy="' + y + '" r="3.4" fill="none" stroke="' + cor + '" stroke-width="1.4"/>' +
      '<circle cx="' + b.toFixed(1) + '" cy="' + y + '" r="4" fill="' + cor + '"/>' +
      pbTxt(L - 9, y + 3.5, l.nome, { anc: 'end', tam: 10, cor: forte ? 'var(--tinta)' : 'var(--tinta2)' }) +
      '<title>' + esc(l.nome + ' · 1º turno com os pontos do 2º: ' + ptJunto(l.rho_bruto) + ', ' + ptSorte(l.p_bruto) +
        ' · só entre times com pontos parecidos no 1º turno: ' + ptJunto(l.rho_parcial) + ', ' + ptSorte(l.p_parcial) +
        ' · ρ ' + ptNum(l.rho_bruto, 3) + ' (' + ptP(l.p_bruto) + ') → ' + ptNum(l.rho_parcial, 3) +
        ' (' + ptP(l.p_parcial) + ')') + '</title>';
  }).join('');

  const alturaFim = T + ordem.length * ALT;
  /* A régua é o maior ρ da tela, então a linha dela cai na borda direita: o rótulo centrado
     sairia pela metade do viewBox. Ancorado ao fim, encosta na linha e continua legível. */
  const marcaRef = !temRef ? '' :
    '<line x1="' + px(ref.rho).toFixed(1) + '" y1="' + (T - 14) + '" x2="' + px(ref.rho).toFixed(1) +
      '" y2="' + alturaFim + '" stroke="var(--pt-ok)" stroke-width="1.5" stroke-dasharray="3 3"/>' +
    pbTxt(px(ref.rho).toFixed(1), T - 18, 'pontos do 1º turno',
      { anc: px(ref.rho) > L + LARG * 0.7 ? 'end' : 'middle', tam: 9, cor: 'var(--pt-ok)', peso: 700 });
  /* A legenda dos dois círculos mora DENTRO do desenho: é o que o dono não achou ao olhar o gráfico. */
  const legSvg =
    '<circle cx="8" cy="10" r="3.4" fill="none" stroke="var(--tinta2)" stroke-width="1.4"/>' +
    pbTxt(16, 13.5, 'vazado: o número do 1º turno com os pontos do 2º', { tam: 9, cor: 'var(--tinta2)' }) +
    '<circle cx="8" cy="24" r="4" fill="var(--tinta2)"/>' +
    pbTxt(16, 27.5, 'cheio: o mesmo, só entre times com pontos parecidos no 1º turno', { tam: 9, cor: 'var(--tinta2)' });

  const r1 = d.rodadas_1t, r2 = d.rodadas_2t;
  const temRodadas = typeof r1 === 'number' && typeof r2 === 'number';
  const bloco = (rot, html) => '<div class="pt-cf-l"><span>' + rot + '</span>' +
    '<b style="font-size:12.5px;font-weight:400;line-height:1.5">' + html + '</b></div>';

  const respostas = '<div class="pt-cf-grade" style="margin-bottom:12px">' +
    bloco('1 · Por que dividir o turno',
      'É a <b>única etapa em que o número é medido ANTES dos pontos</b> com que se compara: ' +
      (temRodadas
        ? 'a média das rodadas <b>1 a ' + ptInt(r1) + '</b> contra os pontos das rodadas <b>' + ptInt(r1 + 1) +
          ' a ' + ptInt(r1 + r2) + '</b>.'
        : ptFalta('o ' + ptArquivoDado() + ' não diz quantas rodadas tem cada turno (rodadas_1t, rodadas_2t)') + '.') +
      ' Nas outras etapas, número e pontos saem dos mesmos jogos — e time que está ganhando joga diferente.') +
    bloco('2 · Os dois círculos e o traço',
      '<b>Vazado</b>: o número do 1º turno junto com os pontos do 2º. <b>Cheio</b>: o mesmo, comparando só ' +
      'times que tinham feito pontos parecidos no 1º turno. <b>O traço entre eles</b> é quanto da relação ' +
      'era só "time bom continua bom".' + ptTecnico('ρ bruto → ρ parcial')) +
    bloco('3 · A linha verde',
      temRef
        ? 'Os <b>próprios pontos do 1º turno</b> com os do 2º: ' + esc(ptJunto(ref.rho)) + '.' +
          ptTecnico('ρ ' + ptNum(ref.rho, 3)) + ' ' +
          (chegam === 0
            ? '<b>Nenhum</b> dos ' + ptInt(linhas.length) + ' números chega nela: a melhor previsão do 2º turno ' +
              'continua sendo a tabela do 1º.'
            : '<b>' + ptInt(chegam) + '</b> dos ' + ptInt(linhas.length) + ' ' +
              pbPl(chegam, 'número chega', 'números chegam') + ' nela ou passa: leia esses linha a linha.')
        : ptFalta('o arquivo não traz os pontos do 1º turno contra os do 2º (referencia_pts1t_x_pts2t)')) +
    bloco('4 · As cores',
      '<b style="color:var(--pt-alto)">azul</b> (' + ptInt(azuis) + '): na direção esperada, e continua de pé ' +
      'depois do desconto · <b style="color:var(--tinta3)">cinza</b> (' + ptInt(cinzas) + '): na direção ' +
      'esperada, mas descontado pode ser sorte · <b style="color:var(--pt-baixo)">laranja</b> (' +
      ptInt(laranjas) + '): na direção contrária ao esperado. ' +
      (porSorte === null
        ? ptFalta('sem a linha de corte da sorte no arquivo, a tela não conta quantos passariam por sorte')
        : 'Entre os <b>' + ptInt(linhas.length) + '</b> testados, com a conta abaixo do corte, <b>em qualquer ' +
          'direção</b>, passariam cerca de <b>' + ptNum(porSorte, 1) + '</b> só por sorte; passaram <b>' +
          ptInt(passaram) + '</b>' +
          (passaram
            ? (passaramContra === 0
                ? ', ' + pbPl(passaram, 'na direção esperada', 'todos na direção esperada')
                : ': <b>' + ptInt(passaram - passaramContra) + '</b> na direção esperada e <b>' +
                  ptInt(passaramContra) + '</b> na contrária')
            : '') + '.' +
          ptTecnico(ptInt(linhas.length) + ' × α ' + ptNum(alfa, 2) + ' · p parcial < α'))) +
    '</div>';

  return ptCard('O 1º turno prevê o 2º? O gráfico e as quatro respostas para lê-lo',
    'um traço por número · à direita do zero, andam juntos; à esquerda, em sentido contrário',
    respostas +
    pbSvg(L + LARG + 20, alturaFim + 22,
      legSvg +
      '<line x1="' + zero.toFixed(1) + '" y1="' + (T - 14) + '" x2="' + zero.toFixed(1) + '" y2="' +
        alturaFim + '" stroke="var(--borda2)"/>' +
      pbTxt(zero.toFixed(1), alturaFim + 16, ptNum(0, 1), { anc: 'middle', tam: 9 }) +
      pbTxt(px(lo - pad / 2).toFixed(1), alturaFim + 16, ptNum(lo, 2), { anc: 'middle', tam: 9 }) +
      pbTxt(px(hi + pad / 2).toFixed(1), alturaFim + 16, ptNum(hi, 2), { anc: 'middle', tam: 9 }) +
      marcaRef + corpo, Math.round((L + LARG + 20) * 1.08)),
    'Traço curto: o número quase não muda quando se comparam só times de pontos parecidos. Traço longo: ' +
    'boa parte do número era o time já estar bem.');
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
    'testa se existe grupo; testa se os números andam juntos.' +
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

/* "Mapa contínuo, não ilhas" é o que o teste de separação diz quando NÃO passa no sorteio justo.
   A frase só vai para a tela com esse teste gravado e reprovado; aprovado, a tela diz o contrário;
   ausente, diz que falta. Um lugar só decide, para as três frases da etapa falarem igual. */
function pb8Silhueta(t) {
  const sil = (((t || {}).estabilidade || {}).silhueta_espaco_reduzido || [])[0];
  const nulo = sil && sil.nulo_mesma_covariancia;
  if (!sil || !nulo || nulo.p === null || nulo.p === undefined || pbAlfa() === null) return { tem: false };
  return { tem: true, passa: pbPassa(nulo.p), p: nulo.p,
    menos: Number(sil.silhueta_obs) < Number(nulo.mediana) };
}
/* O status declarado no documento só serve de comparação quando o arquivo o grava. Na aba de
   pontos ele vem null: comparar null com "DESCRITIVO" daria "não bate com o estudo original" em
   todas as caixas, sem estudo original nenhum. */
function pb8TemDeclarado(g) {
  return g && g.status_declarado_no_documento !== null && g.status_declarado_no_documento !== undefined;
}
function pb8DivergeStatus(g) { return pb8TemDeclarado(g) && g.status !== g.status_declarado_no_documento; }
function pb8DivergeP(g) {
  return g.p_um_contra_o_resto !== null && g.p_um_contra_o_resto !== undefined &&
    g.p_declarado_no_documento !== null && g.p_declarado_no_documento !== undefined &&
    Math.abs(g.p_um_contra_o_resto - g.p_declarado_no_documento) > 0.001;
}
/* O corte do ruído da fronteira está no NOME do campo (`troca_sob_ruido_10pt_pct`), e sai de lá. */
function pb8CampoTroca(fronteira) {
  const k = Object.keys((fronteira || [])[0] || {}).find(c => /^troca_sob_ruido_\d+pt_pct$/.test(c));
  return k ? { campo: k, pontos: Number(/(\d+)pt/.exec(k)[1]) } : null;
}

/* A firmeza de cada caixa é a que o gerador GRAVOU em `status`, no vocabulário do próprio
   arquivo (`TIPO` = passa no teste contra as outras caixas; `DESCRITIVO` = só descrição). A tela
   não refaz a conta com p e corte. Status fora desse vocabulário devolve null, e quem chama
   escreve que não reconhece — em vez de encaixá-lo num dos dois lados. */
function pb8Firme(g) {
  const s = String((g && g.status) || '').toUpperCase();
  if (s === 'TIPO') return true;
  if (s === 'DESCRITIVO') return false;
  return null;
}
/* Quando o p gravado e o corte gravado dariam o contrário do status, a tela mostra a discordância
   e diz qual vale. Não arbitra: vale o status, porque é ele que o gerador publicou. */
function pb8ContaDiscorda(g) {
  const f = pb8Firme(g);
  if (f === null || g.p_um_contra_o_resto === null || g.p_um_contra_o_resto === undefined ||
      g.corte_do_status === null || g.corte_do_status === undefined) return false;
  return (Number(g.p_um_contra_o_resto) < Number(g.corte_do_status)) !== f;
}

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
  const divergentes = grupos.filter(g => pb8DivergeStatus(g) || pb8DivergeP(g));
  const sil = pb8Silhueta(t);

  /* A ressalva que não pode ficar só no card de cada grupo: quais caixas passaram no teste de
     cada uma contra o resto e quais são só descrição. Sai do STATUS gravado pelo gerador, não de
     uma conta refeita aqui com p e corte — refazer a firmeza na tela é o jeito de a tela e o
     arquivo discordarem em silêncio. Status fora do vocabulário conhecido fica em lista própria. */
  const firmes = grupos.filter(g => pb8Firme(g) === true);
  const soDescricao = grupos.filter(g => pb8Firme(g) === false);
  const desconhecidos = grupos.filter(g => pb8Firme(g) === null);
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
        '; as fronteiras entre elas são escolha' + (sil.tem && !sil.passa ? ', não ilhas' : '') + '.</b> ' +
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
        (desconhecidos.length
          ? ' ' + ptFalta(nomesDe(desconhecidos).replace(/<[^>]+>/g, '') + ': status gravado que a tela não ' +
              'reconhece (' + desconhecidos.map(g => String(g.status)).join(', ') + '); não conta para nenhum lado')
          : '') +
        (!sil.tem
          ? ' ' + ptFalta('o arquivo não traz o teste de separação das caixas contra o sorteio justo; sem ele a ' +
              'tela não diz se a divisão é um mapa contínuo ou grupos separados')
          : sil.passa
            ? ' A separação das caixas passa no sorteio justo (' + esc(ptSorte(sil.p)) + '): veja o teste e a ' +
              'lista do que não passou, mais abaixo.'
            : ' E a separação das caixas não passa no sorteio justo (' + esc(ptSorte(sil.p)) + '): a divisão ' +
              'inteira se lê como um mapa contínuo cortado ao meio, não como ilhas separadas. Veja o teste e a ' +
              'lista do que não passou, mais abaixo.') +
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
  const ct = pb8CampoTroca(fronteira);
  const trocaDeF = f => (ct && f && f[ct.campo] !== null && f[ct.campo] !== undefined) ? Number(f[ct.campo]) : null;
  const maxTroca = Math.max.apply(null, fronteira.map(trocaDeF).filter(v => v !== null).concat([1]));
  const sil = pb8Silhueta(t);
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
    const troca = trocaDeF(f);
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

  const maisTrocam = ct
    ? fronteira.filter(f => trocaDeF(f) !== null).sort((a, b) => trocaDeF(b) - trocaDeF(a)).slice(0, 3)
    : [];

  return ptCard('O mapa, não a lista',
    ptInt(plano.length) + ' times que subiram · na horizontal, ' + esc(pbEixoCurto(eixoX)) +
      ' · na vertical, ' + esc(pbEixoCurto(eixoY)),
    pbSvg(L + LADO + 120, T + LADO + 34,
      cruz + pontos +
      pbTxt(L + LADO / 2, T + LADO + 28, pbEixoCurto(eixoX) + ' →', { anc: 'middle', tam: 10 }) +
      '<g transform="translate(15,' + (T + LADO / 2) + ') rotate(-90)">' +
        pbTxt(0, 0, pbEixoCurto(eixoY) + ' →', { anc: 'middle', tam: 10 }) + '</g>', 560) +
    '<p class="pt-nota">' + legenda + '</p>',
    (sil.tem && !sil.passa
      ? 'As caixas são <b>pedaços de um mapa contínuo</b>, não ilhas (a separação delas não passa no sorteio ' +
        'justo) — por isso a tela mostra o mapa, e não só a lista de nomes. '
      : 'A tela mostra o mapa, e não só a lista de nomes, porque as caixas saem de linhas traçadas no meio. ') +
    (ct
      ? 'O anel tracejado é a chance de o clube mudar de caixa quando se mexe um pouco nos números; ' +
        (maisTrocam.length
          ? 'os que mais mudam são ' + maisTrocam.map(f => '<b>' + esc(f.clube) + ' ' + ptAno(f.ano) +
              '</b> (' + ptPct(trocaDeF(f)) + ' das vezes)').join(', ') + '. '
          : '') +
        'Quem está colado na linha está colado na linha: a linha é uma escolha, e a tela diz quanto ela custa.' +
        ptTecnico('ruído de ' + ptInt(ct.pontos) + ' pontos na posição do ranking')
      : ptFalta('o arquivo não traz a chance de cada clube mudar de caixa sob ruído (estabilidade.fronteira); ' +
          'sem ela o mapa sai sem anéis')));
}

function pb8Grupo(g, i, t) {
  const cor = pbCor(i);
  const temDeclarado = pb8TemDeclarado(g);
  const divergeStatus = pb8DivergeStatus(g);
  const divergeP = pb8DivergeP(g);
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

  const firme = pb8Firme(g);
  const discorda = pb8ContaDiscorda(g);
  const veredito = firme === true
    ? 'passa no teste contra as outras caixas'
    : firme === false
      ? 'só descrição: ' + ptSorte(g.p_um_contra_o_resto)
      : 'status gravado que a tela não reconhece: ' + String(g.status);

  const nota =
    '<b>Esta caixa contra todas as outras juntas:</b> ' + esc(ptAcaso(g.p_um_contra_o_resto)) + ' — ' +
    (firme === true
      ? '<b>' + esc(ptSorte(g.p_um_contra_o_resto)) + '</b>, e o estudo a registrou como tipo. Por isso conta ' +
        'como tipo, dentro das ressalvas desta etapa: a separação das caixas e a lista do que não passou.'
      : firme === false
        ? '<b>' + esc(ptSorte(g.p_um_contra_o_resto)) + '</b>, e o estudo a registrou como <b>só descrição</b>: ' +
          'serve para contar o que estes ' + ptInt(g.n) + ' times fizeram, não para dizer que existe um tipo ' +
          'de time assim.'
        : ptFalta('o arquivo grava o status "' + String(g.status) + '", que esta tela não sabe ler; a caixa não ' +
            'é contada nem como tipo nem como descrição')) +
    (discorda
      ? ' <b style="color:var(--pt-baixo)">Atenção:</b> o p e o corte gravados dariam o resultado contrário ' +
        'ao status; vale o status que o estudo gravou, e a discordância fica aqui para ser conferida.'
      : '') +
    ptTecnico(ptP(g.p_um_contra_o_resto) +
    /* O nulo deixou de ser Monte Carlo: com dezesseis, as partições cabem todas e o campo passou a
       trazer texto ("exato (4368 partições)") no lugar de uma contagem. Quem é número ganha a palavra
       "réplicas"; quem é texto já se descreve, e a palavra sobrava — saía "em exato (4368 partições)
       réplicas". */
    ' em ' + (typeof g.replicas_um_contra_o_resto === 'number'
      ? ptInt(g.replicas_um_contra_o_resto) + ' réplicas'
      : esc(String(g.replicas_um_contra_o_resto))) + ' · ' +
    (g.corte_do_status === null || g.corte_do_status === undefined
      ? 'sem corte gravado para o status' : 'corte ' + ptNum(g.corte_do_status, 2)) +
    ' → ' + esc(g.status)) + ' ' +
    /* Sem status declarado no arquivo não há estudo original com que comparar (é o caso da aba de
       pontos). Com ele e divergente, a tela mostra os dois e não conta história de causa: o que o
       arquivo grava é o status e o p, não o porquê da diferença. */
    (!temDeclarado
      ? '<span style="color:var(--tinta3)">Sem comparação com o estudo original: o ' + esc(ptArquivoDado()) +
        ' não grava o status declarado no documento para esta caixa.</span>'
      : divergeStatus
      ? '<b style="color:var(--pt-baixo)">O resultado não bate com o estudo original</b>, que chamou esta ' +
        'caixa de outra coisa' + ptTecnico('TIPOLOGIA.md: ' + esc(g.status_declarado_no_documento) + ' · ' +
        ptP(g.p_declarado_no_documento)) + '. Os dois ficam na tela; vale o status que o arquivo grava.'
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
      ? (function () {
          /* O arquivo diz por qual sorteio esta bateria é julgada (`julgada_por`); hoje é o placebo, o
             duro. A frase usa esse, e mostra o fácil ao lado — antes a tela julgava pelo fácil sem dizer. */
          const peloPlacebo = limpa.julgada_por === 'p_placebo' && limpa.p_placebo !== undefined;
          const pJulga = peloPlacebo ? limpa.p_placebo : limpa.p;
          const nuloJulga = peloPlacebo ? limpa.eta2_medio_nulo_placebo : limpa.eta2_medio_nulo;
          const caiu = f.eta2_medio_obs !== undefined && Number(limpa.eta2_medio_obs) < Number(f.eta2_medio_obs);
          return '<b>O aviso que dá valor ao teste:</b> ficando só com os <b>' +
            ptInt(limpa.validadores) + '</b> números de fora que <b>não andam junto</b> com os critérios da ' +
            'montagem, a caixa explica ' + pbExplica(limpa.eta2_medio_obs) +
            (caiu ? ' (com todos, explicava ' + pbExplica(f.eta2_medio_obs) + ')' : '') + ', contra ' +
            pbExplica(nuloJulga) + ' do ' + (peloPlacebo ? 'sorteio mais duro' : 'sorteio') + ' (' +
            esc(ptSorte(pJulga)) + ')' +
            (peloPlacebo
              ? '; contra o sorteio fácil, ' + pbExplica(limpa.eta2_medio_nulo) + ' (' + esc(ptSorte(limpa.p)) + ')'
              : '') + '.' +
            ptTecnico('eta² ' + ptNum(limpa.eta2_medio_obs, 3) + ' contra ' + ptNum(nuloJulga, 3) + ' · ' + ptP(pJulga) +
              (peloPlacebo ? ' · nulo de rótulo ' + ptNum(limpa.eta2_medio_nulo, 3) + ' · ' + ptP(limpa.p) : '')) +
            pbMiudo(' critério: ' + esc(limpa.criterio) +
              (limpa.julgada_por ? ' · julgada por ' + esc(limpa.julgada_por) : '') +
              (limpa.motivo_do_julgamento ? ' · ' + esc(limpa.motivo_do_julgamento) : '')) +
            (caiu
              ? ' Ou seja: parte do sinal do teste de fora vem de números que andam junto com os próprios ' +
                'critérios da montagem. Isto está aqui, e não no rodapé.'
              : '');
        })()
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
      (pbPassa(rival.p) ? '.' : ' — não se viu o dinheiro sozinho reproduzir estas caixas.') + '</p>' +
    (res.de !== undefined
      ? '<p class="pt-nota">E quando se <b>desconta o dinheiro</b> — comparando times de orçamento ' +
        'parecido e traçando as linhas de novo —, a rota ' +
        (res.muda_rota === 0 ? 'não tira <b>nenhum</b>' : 'tira <b>' + ptInt(res.muda_rota) + '</b>') +
        ' dos ' + ptInt(res.de) + ' times da sua caixa, e o território tira <b>' +
        ptInt(res.muda_territorio) + '</b> (' +
        (res.trocaram || []).map(esc).join(', ') + ').' + ptTecnico('residualizado no percentil de valor') +
        /* Só a comparação que a linha grava: quantos times cada critério muda. Sem "o que o dinheiro
           compra" — isso seria receita, e o estudo mediu troca de caixa, não compra. */
        (Number(res.muda_territorio) !== Number(res.muda_rota)
          ? ' Nesta amostra, o <b>' + (Number(res.muda_territorio) > Number(res.muda_rota) ? 'território' : 'jeito de a bola chegar (a rota)') +
            '</b> anda mais junto com o valor do elenco do que ' +
            (Number(res.muda_territorio) > Number(res.muda_rota) ? 'o jeito de a bola chegar (a rota)' : 'o território') + '.'
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
  const formTestes = Object.keys(form).filter(k => form[k] && form[k].eta2 !== undefined);
  const formPassam = formTestes.filter(k => pbPassa(form[k].p));
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
          'testar muito: não se viu diferença física entre as caixas, e a tela não pode ser usada para ' +
          'dizer "a caixa tal corre mais". '
        : fis.sobrevivem_bh5 === undefined
          ? ptFalta('o arquivo não diz quantos números físicos sobram descontada a sorte (fisico.sobrevivem_bh5)') + ' '
          : '<b>' + ptInt(fis.sobrevivem_bh5) + '</b> dos ' + ptInt(fis.colunas) + ' números físicos sobram ' +
            'depois de descontar a sorte de testar muito. ') +
      (formTestes.length === 0
        ? ptFalta('o arquivo não traz o teste da formação (formacao com eta²)') + ' '
        : formPassam.length === 0
          ? 'Pela formação, <b>não se viu diferença</b> entre as caixas: nenhum dos ' + ptInt(formTestes.length) +
            ' testes passa no corte, e com ' + ptInt(((form.n || {}).clube_temporada)) + ' clubes-temporada ' +
            'isso não prova que ela não importa. '
          : '<b>' + ptInt(formPassam.length) + '</b> dos ' + ptInt(formTestes.length) + ' testes da formação ' +
            'passam no corte: ' + formPassam.map(k => esc(ptNomeMedida(k))).join(', ') + '. ') +
      (andares.length
        ? 'Dentro de cada faixa de território, o jeito de a bola chegar (a rota): ' + andares.map(k =>
            esc(andarNome(k)) + ', <b>' + (pbPassa(and[k].p) ? 'passa no corte' : 'não passa no corte') +
            '</b> (' + esc(ptSorte(and[k].p)) + ', ' + ptInt(and[k].n) + ' times)').join('; ') + '.'
        : ptFalta('o arquivo não traz o teste da rota dentro de cada faixa de território (andares)')) + '</p>';

  return ptCard('As caixas são só dinheiro com nome de tática?', 'com o número, não com o adjetivo',
    dinheiroHtml) +
    ptCard('Firmeza: quanto as caixas mudam quando se mexe na amostra',
      ptInt(tirarTime.length) + ' testes tirando um time · ' + ptInt(tirarInd.length) + ' tirando um número',
      estabHtml) +
    ptCard('O que estas caixas não deixam dizer', 'os achados negativos, em número',
      negativos);
}
