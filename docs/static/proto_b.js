/* ================= aba Protótipo — etapas 5, 6, 7 e 8 =================

   O miolo do estudo: o que os dezesseis que subiram tinham (5), o quanto cada número anda junto
   com os pontos do próprio ano, nas temporadas do painel (6), se veio antes do desfecho ou junto
   com ele (7), e o que acontece quando se tenta transformar isso em grupos de times (8).

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

/* A cor por faixa (subiu/meio/caiu no mesmo ano) mora na etapa 6 (PB6_CORES), o único lugar que a
   usa; o texto de faixa vem do vocabulário da casca (ptFxRot). */

/* ---------------- a tradução dos RÓTULOS que vêm do dado ----------------

   O vocabulário de estatística mora em proto.js (ptTamanho, ptAcaso, ptSorte, ptJunto,
   ptAcerto, ptTecnico) e não é redefinido aqui. O que segue é outra coisa: nomes de chave e
   de coluna que o arquivo escreve em sigla (`psv99`, `p30tip`, `clube-temporada`,
   `passam5_SM`) e que chegavam à tela crus. A tradução é por pedaço de palavra, e todo
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
  const m = /^(passam|bh)(\d+)_([A-Z]{2})$/.exec(s);
  if (!m || m[3] !== ptFx('SM')) return pbRotChave(s);
  /* O corte (o "5" de `passam5`) sai do nome da chave. "Separam" é só o p abaixo do corte (pode ser
     sorte ou firme); "firmes" é o vocabulário único da aba: passam contando os muitos testes (q). */
  return m[1] === 'passam'
    ? 'separam ' + ptFxRot('sobe', { forma: 'quem' }) + ' de ' + ptFxRot('meio', { forma: 'quem' }) +
      ' (p abaixo de ' + m[2] + '%)'
    : 'firmes, contando os muitos testes';
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
  [/f[íi]sico.*sobrevive/i, 'Algum número físico é firme, contando os muitos testes?'],
  [/formação separa/i, 'A formação tática separa as caixas?'],
  [/dinheiro distingue/i, 'O valor do elenco sozinho separa as caixas?'],
  [/partição rival/i, 'Uma divisão feita só com o valor do elenco explica o mesmo que as caixas?'],
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
      '<sup style="color:var(--tinta);font-size:9px;margin-left:2px">&#9651;</sup></span></td>');
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

/* A diferença no cabeçalho: o tamanho da diferença e o lado dito em português. Sem sinal, porque a
   palavra já diz o lado — "−53 abaixo" dizia duas vezes. "Acima" e "abaixo" são na escala das
   células (posição no ranking do ano), não "melhor" e "pior": o lado bom de cada número é outra
   informação, que já está na dica da coluna. Diferença que some no arredondamento sem ser zero sai
   com as casas que ela precisa, para não virar "0 acima".
   A frase precisa de sujeito ("quem subiu"), de verbo de posição ("fica") e de unidade: o número
   é de posições no ranking de 0 a 100, não de xG nem de metros. A versão com "subiu" no lugar do
   sujeito ("subiu 68 abaixo de quem caiu") não se lia. O "de 0 a 100" e o "típico contra típico"
   vão na dica da coluna, porque o cabeçalho deitado não comporta a frase inteira.
   A unidade NÃO é "posições" (revisão de 14/09, noite): a escala vai de 0 a 100 e a Série B tem 20
   times, então "33 posições" lia-se como colocação na tabela, que não existe. Diz-se a escala.
   `casas` (opcional): o exemplo da abertura mostra 27,5 e 60 ao lado, e ali a diferença sai com as
   mesmas casas das posições, para a conta de cabeça (60 − 27,5) bater com o texto. */
function pb5DifTexto(v, casas) {
  const quem = ptFxRot('sobe', { forma: 'quem' }), outro = ptFxRot('cai', { forma: 'quem' });
  const n = Number(v);
  if (n === 0) return quem + ' e ' + outro + ' ficam empatados, na escala de 0 a 100';
  const a = Math.abs(n);
  const c = casas === undefined ? 0 : casas;
  const txt = ptNum(a, c) === ptNum(0, c) ? pbCheio(a) : ptNum(a, c);
  return 'na escala de 0 a 100, ' + quem + ' fica ' + txt + ' ' + (n > 0 ? 'acima' : 'abaixo') + ' de ' + outro;
}

/* ---------------- ETAPA 5, o resumo por grupos (pedido do dono, 14/09, noite) ----------------

   O dono achou a matriz por time "confusa, pouco visual e difícil de chegar a conclusão" e aprovou a
   prévia (sessao_14_09/etapa5_previa): cada número numa linha, os três grupos nas colunas, o valor
   típico de cada grupo na unidade do próprio número, a diferença de quem subiu e de quem caiu contra
   o meio, e se essa diferença é firme. A matriz não sai: fica embaixo de cada painel, como detalhe.

   Tudo o que é conta mora no gerador (`paineis[k].resumo_grupos` e `etapa_5.regra_do_resumo`): o
   valor típico, a diferença e o tipo dela, o lado, a firmeza, a contagem e a ordem. A tela lê e
   escreve. O único "cálculo" daqui é de desenho — onde cada barra cai dentro da caixinha da linha —,
   e o que a tela escreve sobre a escala são os próprios números do arquivo, não a folga do desenho.

   As cores dos grupos são as da etapa 6 (PB6_CORES), para "azul claro = quem subiu" querer dizer a
   mesma coisa nas duas etapas. Cor só em bolinha e barra; texto fica nas tintas da casca, porque
   azul claro e laranja escritos sobre o fundo escuro ou claro não chegam ao contraste de leitura.
   Melhor e pior que o meio usam verde e vermelho de texto da casca (--txt-verde, --txt-vermelho),
   que são outra coisa que a cor do grupo e passam do contraste nos dois temas. */

const PB5_GRUPOS = ['sobe', 'meio', 'cai'];
/* As duas comparações que o catálogo da etapa 2 testou. Quem caiu contra o meio não tem teste lá,
   e por isso não ganha selo — a tabela mostra a diferença dele, mas não diz se é firme. */
const PB5_COMP = [['sobe_meio', 'sobe', 'meio'], ['sobe_cai', 'sobe', 'cai']];

function pbMaiusc(s) { const t = String(s === null || s === undefined ? '' : s); return t.charAt(0).toUpperCase() + t.slice(1); }
function pb5Norm(s) {
  return String(s === null || s === undefined ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
/* O bloco grava as chaves internas (sobe/meio/cai); uma aba que um dia grave as dela (alta/media/baixa)
   também é lida, pelo vocabulário da casca. */
function pb5G(obj, g) {
  if (!obj) return undefined;
  return obj[g] !== undefined ? obj[g] : obj[ptFx(g)];
}

/* O resumo de um painel, conferido contra o próprio painel antes de desenhar. Uma lista mais curta
   ou mais longa que `indicadores` poria o valor de um número na linha de outro — então o painel
   inteiro é recusado, com o motivo, em vez de remendado. */
function pb5Resumo(p) {
  const n = (p.indicadores || []).length;
  const r = p.resumo_grupos;
  if (!r) {
    return { r: null, motivo: 'o ' + ptArquivoDado() + ' foi gravado antes do resumo por grupos e não traz, neste ' +
      'painel, o valor típico de cada grupo, a diferença contra o meio nem a firmeza' };
  }
  if (r.ausente) {
    return { r: null, motivo: r.motivo || 'o estudo marcou o resumo por grupos deste painel como ausente, sem dizer o motivo' };
  }
  const tam = a => Array.isArray(a) && a.length === n;
  const ok = tam(r.tipo_diferenca) &&
    PB5_GRUPOS.every(g => tam(pb5G(r.valor_tipico, g))) &&
    ['sobe', 'cai'].every(g => tam(pb5G(r.diferenca_contra_meio, g))) &&
    PB5_COMP.every(c => tam((r.firmeza || {})[c[0]]));
  if (!ok) {
    return { r: null, motivo: 'o resumo por grupos deste painel não casa com os ' + ptInt(n) + ' números do painel; ' +
      'a tela não o desenha, para nenhum valor cair na linha de outro número' };
  }
  return { r: r, motivo: null };
}

/* A ordem pela firmeza é a gravada. Se ela não for uma permutação das linhas, a tabela fica na ordem
   do estudo e diz isso — reordenar com uma lista torta embaralharia os números em silêncio. */
function pb5OrdemResumo(r, n) {
  const orig = Array.from({ length: n }, (_, i) => i);
  const o = r.ordem_por_firmeza;
  const visto = {};
  const ok = Array.isArray(o) && o.length === n &&
    o.every(i => Number.isInteger(i) && i >= 0 && i < n && !visto[i] && (visto[i] = true));
  return ok ? { idx: o.slice(), motivo: null }
    : { idx: orig, motivo: 'a ordem pela firmeza gravada não casa com os números deste painel; as linhas ficam na ordem do estudo' };
}

/* Casas para caber na coluna sem perder o que distingue um grupo do outro: número grande perde as
   casas que não mudam a leitura, número pequeno (xG por jogador, 0,05) guarda as que mudam. São
   limiares de escrita, não de dado; o valor cheio vai sempre no title. */
function pb5CasasValor(v) {
  const a = Math.abs(Number(v));
  return a >= 100 ? 0 : a >= 10 ? 1 : a >= 1 ? 2 : a >= 0.1 ? 3 : 4;
}
function pb5EhPct(r, j) { return !!r.unidade && r.unidade[j] === '%'; }
/* O "%" colado ao valor sai da unidade que o gerador declarou para aquele número; as outras
   unidades (metros, km/h, por 90) vão na coluna do número, não em cada célula. */
function pb5Valor(v, pct) {
  if (v === null || v === undefined || isNaN(Number(v))) return null;
  return ptNum(v, pb5CasasValor(v)) + (pct ? '%' : '');
}
function pb5ValorCheio(v, pct) {
  return v === null || v === undefined ? 'sem valor' : pbCheio(v) + (pct ? '%' : '');
}

/* A dica de cada grupo junta o que a prévia deixou fora da coluna: média, faixa do 1º ao 3º quarto e a
   posição típica no ranking do ano — a mesma escala do detalhe por time embaixo. */
function pb5DicaGrupo(p, r, j, g) {
  const pct = pb5EhPct(r, j);
  const fb = (p[ptK('faixa_', g) + '_bruto'] || [])[j] || [];
  const fp = (p[ptK('faixa_', g)] || [])[j] || [];
  const media = (pb5G(r.media_crua, g) || [])[j];
  const nn = (pb5G(r.n_por_grupo, g) || [])[j];
  return ptFxRot(g, { forma: 'quem' }) + ': típico ' + pb5ValorCheio(pb5G(r.valor_tipico, g)[j], pct) +
    ' · média ' + pb5ValorCheio(media, pct) +
    ' · metade dos times entre ' + pb5ValorCheio(fb[0], pct) + ' e ' + pb5ValorCheio(fb[2], pct) +
    ' · posição típica no ranking do ano ' + (fp[1] === null || fp[1] === undefined ? 'sem valor' : pbCheio(fp[1])) +
    ' (a escala do detalhe por time)' +
    ' · ' + (nn === null || nn === undefined ? 'o arquivo não grava de quantas temporadas' : 'medido em ' + ptInt(nn) + ' temporadas');
}

/* As três faixas finas (do 1º ao 3º quarto) com a bolinha do típico. A escala é a da própria linha:
   um número em metros e outro em % não cabem na mesma régua, e é por isso que a comparação é dentro
   da linha, nunca entre linhas. A folga das pontas é só para a bolinha não sair da caixa. */
function pb5FaixaSvg(p, r, j) {
  const fx = PB5_GRUPOS.map(g => (p[ptK('faixa_', g) + '_bruto'] || [])[j]);
  const valida = f => Array.isArray(f) && f[0] !== null && f[0] !== undefined && f[2] !== null && f[2] !== undefined;
  const boas = fx.filter(valida);
  if (!boas.length) return ptFalta('o arquivo não traz a faixa crua deste número');
  const pct = pb5EhPct(r, j);
  const minQ1 = Math.min.apply(null, boas.map(f => Number(f[0])));
  const maxQ3 = Math.max.apply(null, boas.map(f => Number(f[2])));
  let lo = minQ1, hi = maxQ3;
  if (hi === lo) { lo -= 1; hi += 1; }
  const folga = (hi - lo) * 0.06;
  lo -= folga; hi += folga;
  const W = 140, H = 30;
  const x = v => ((Number(v) - lo) / (hi - lo) * W).toFixed(1);
  let s = '';
  fx.forEach((f, i) => {
    if (!valida(f)) return;
    const c = PB6_CORES[PB5_GRUPOS[i]];
    const y = 6 + i * 9;
    s += '<line x1="' + x(f[0]) + '" x2="' + x(f[2]) + '" y1="' + y + '" y2="' + y + '" stroke="' + c.miolo +
      '" stroke-width="3" stroke-linecap="round" stroke-opacity="0.6"/>';
    if (f[1] !== null && f[1] !== undefined) {
      s += '<circle cx="' + x(f[1]) + '" cy="' + y + '" r="3.6" fill="' + c.miolo + '" stroke="' + c.contorno +
        '" stroke-width="1.2"/>';
    }
  });
  const faltam = fx.length - boas.length;
  const dica = 'Barra fina: onde está a metade dos times de cada grupo (do 1º ao 3º quarto). Bolinha: o típico. ' +
    'De cima para baixo: ' + PB5_GRUPOS.map(g => ptFxRot(g, { forma: 'quem' })).join(', ') + '. ' +
    'Escala desta linha: de ' + pb5ValorCheio(minQ1, pct) + ' a ' + pb5ValorCheio(maxQ3, pct) + '.' +
    (faltam ? ' Um grupo não tem faixa no arquivo e não aparece.' : '');
  return '<div title="' + esc(dica) + '" style="width:' + W + 'px"><svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W +
    '" height="' + H + '" role="img" aria-label="' + esc(dica) + '" style="display:block;overflow:visible">' + s + '</svg></div>';
}

/* A diferença contra o meio, na forma que o gerador decidiu: em pontos percentuais quando o número já é
   porcentagem ("pp"), em % do meio nos outros ("rel"). O sinal vai escrito e o lado vai embaixo, em
   palavras: "melhor/pior que o meio" só onde o gerador gravou o lado; sem ele, só "acima/abaixo". */
function pb5DifCel(p, r, j, g) {
  const v = pb5G(r.diferenca_contra_meio, g)[j];
  const tipo = r.tipo_diferenca[j];
  const motivo = ((r.motivos || {})['diferenca_' + g] || [])[j];
  if (v === null || v === undefined || isNaN(Number(v))) {
    return '<td class="txt" style="min-width:7em">' + ptFalta(motivo || 'o arquivo não grava esta diferença') + '</td>';
  }
  if (tipo !== 'pp' && tipo !== 'rel') {
    return '<td class="txt" style="min-width:7em">' + ptFalta('o arquivo grava a diferença com um tipo que a tela não conhece (' +
      String(tipo) + '); sem saber se é % do meio ou pontos percentuais, a tela não a escreve') + '</td>';
  }
  const casas = tipo === 'pp' ? 2 : 1;
  const txt = ptNum(Math.abs(Number(v)), casas);
  const zero = txt === ptNum(0, casas);
  const num = (zero ? '' : Number(v) > 0 ? '+' : '−') + txt + (tipo === 'pp' ? ' p.p.' : '%');
  const lado = (pb5G(r.lado_contra_meio, g) || [])[j];
  const motLado = (((r.motivos || {}).lado) || [])[j];
  let ladoTxt, cor = 'var(--tinta)', corLado = 'var(--tinta2)';
  if (lado) {
    ladoTxt = lado;
    if (/^melhor/.test(lado)) { cor = corLado = 'var(--txt-verde)'; }
    else if (/^pior/.test(lado)) { cor = corLado = 'var(--txt-vermelho)'; }
  } else {
    ladoTxt = zero ? 'igual ao meio' : Number(v) > 0 ? 'acima do meio' : 'abaixo do meio';
  }
  const pct = pb5EhPct(r, j);
  const dica = ptFxRot(g, { forma: 'quem' }) + ': típico ' + pb5ValorCheio(pb5G(r.valor_tipico, g)[j], pct) + ' contra ' +
    pb5ValorCheio(pb5G(r.valor_tipico, 'meio')[j], pct) + ' de ' + ptFxRot('meio', { forma: 'quem' }) + ' · diferença ' +
    pbCheio(v) + (tipo === 'pp' ? ' pontos percentuais' : '% do valor do meio') + (motLado ? ' · ' + motLado : '');
  return '<td class="num" title="' + esc(dica) + '"><b style="color:' + cor + ';font-size:13px">' + esc(num) + '</b>' +
    '<span style="display:block;font-size:11px;color:' + corLado + '">' + esc(ladoTxt) + '</span></td>';
}

/* Um selo por comparação. O texto é a frase da CHAVE gravada pelo gerador, dita pelo vocabulário único
   da casca (ptSorte: firme / pode ser sorte / sem diferença clara); p e q ficam no title. */
/* Se o gerador leu algum teste de quem caiu contra o meio (hoje não: o catálogo não tem). */
function pb5TemTesteCaiMeio(d) {
  const t = (d && d.regra_do_resumo && d.regra_do_resumo.testes_lidos) || null;
  return !!t && Object.keys(t).some(k => /cai_meio|meio_cai/.test(k));
}

/* (15/09) Saiu o pb5RelacaoEtapa2: a etapa 2 dizia "dificilmente é sorte" com outro corte, e a caixa
   de regras avisava do cruzamento. Com a chave única gravada nas duas etapas, as três palavras querem
   dizer o mesmo na aba inteira, e não há mais o que avisar. */

function pb5Selo(f, rot) {
  if (!f) return '<div style="margin:2px 0">' + ptFalta('o arquivo não traz o teste de ' + rot) + '</div>';
  const ch = ptChaveSorte({ chave: f.chave, p: f.p, q: f.q });
  const chave = ch.chave;
  const est = chave === 'firme' ? 'background:var(--tinta);color:var(--fundo2);border-color:var(--tinta)'
    : chave === 'pode_ser_sorte' ? 'color:var(--txt-ambar);border-color:var(--txt-ambar)'
      : 'color:var(--tinta2);border-color:var(--borda2)';
  if (!chave) {
    return '<div style="margin:2px 0">' + ptFalta((f.motivo || ch.motivo || 'o catálogo não tem o teste desta comparação') + ' (' + rot + ')') + '</div>';
  }
  const frase = ptSorte({ chave: f.chave, p: f.p, q: f.q });
  const dica = rot + ': ' + frase + ' · p ' + pb6P(f.p) + ' · q, contando os muitos testes feitos ao mesmo tempo, ' + pb6P(f.q);
  return '<div style="display:flex;align-items:center;gap:6px;white-space:nowrap;margin:2px 0" title="' + esc(dica) + '">' +
    '<span style="display:inline-block;min-width:9.5em;text-align:center;font-size:11px;font-weight:650;border:1px solid;' +
    'border-radius:999px;padding:1px 7px;' + est + '">' + esc(frase) + '</span>' +
    '<span style="font-size:11px;color:var(--tinta2)">' + esc(rot) + '</span></div>';
}

/* O nome inteiro do número, sem repetir o setor que o painel já diz. */
function pb5NomeLinha(ind, setor) {
  if (!ind.id) return pbPopular(ind.nome);
  let nome = ptNomeIndicador(ind.id);
  if (setor && PT_SETOR_NOME[setor]) {
    const suf = ' (' + PT_SETOR_NOME[setor] + ')';
    if (nome.slice(-suf.length).toLowerCase() === suf.toLowerCase()) nome = nome.slice(0, -suf.length);
  }
  return nome;
}

function pb5LinhaResumo(p, r, j, setor, posFirmeza) {
  const ind = (p.indicadores || [])[j] || {};
  const nome = pb5NomeLinha(ind, setor);
  const info = ind.id ? (ptInfoMedida(ind.id) || {}) : {};
  const uniGlos = info.unidade && info.unidade !== 'nao_achei_fonte' ? info.unidade : null;
  const unidade = (r.unidade && r.unidade[j]) || uniGlos;
  const lado = ind.sinal === 1 ? 'ter mais é melhor' : ind.sinal === -1 ? 'ter menos é melhor'
    : ((((r.motivos || {}).lado) || [])[j] || 'sem lado bom declarado');
  /* A marca só onde a ordem dos grupos no valor cru é outra que a da posição DE VERDADE — não por um
     empate de arredondamento, que o gerador lista à parte. */
  const difere = Array.isArray(p.ordem_das_medianas_difere_no_cru) && p.ordem_das_medianas_difere_no_cru[j] === true &&
    (p.ordem_das_medianas_difere_no_cru_so_por_empate || []).indexOf(ind.id) < 0;
  const f1 = r.firmeza.sobe_meio[j], f2 = r.firmeza.sobe_cai[j];
  const mostra = [f1, f2].some(f => {
    const ch = f ? ptChaveSorte({ chave: f.chave, p: f.p, q: f.q }).chave : null;
    return ch === 'firme' || ch === 'pode_ser_sorte';
  });
  const rotComp = c => ptFxRot(c[1], { forma: 'nome' }) + ' × ' + ptFxRot(c[2], { forma: 'nome' });
  const pct = pb5EhPct(r, j);
  return '<tr data-pb5-busca="' + esc(pb5Norm(nome + ' ' + (ind.id || ''))) + '" data-pb5-of="' + posFirmeza +
      '" data-pb5-oe="' + j + '" data-pb5-mostra="' + (mostra ? '1' : '0') + '">' +
    '<td class="txt" style="min-width:13em">' +
      '<b title="' + esc(ind.id ? ptDicaMedida(ind.id) : nome) + '" style="font-weight:600">' + esc(nome) + '</b>' +
      '<span style="display:block;font-size:11px;color:var(--tinta2);margin-top:2px">' +
        (unidade ? esc(unidade) : 'unidade não declarada') + ' · ' + esc(lado) + '</span>' +
      (difere
        ? '<span style="display:block;font-size:11px;color:var(--txt-ambar);margin-top:2px" title="' +
          esc('O valor típico junta os anos; a firmeza compara a posição do time dentro de cada ano. Neste número as ' +
            'duas leituras põem os grupos em ordens diferentes: parte da diferença do valor vem de a liga não ser igual ' +
            'em todos os anos.') + '">na posição de cada ano, a ordem dos grupos é outra</span>'
        : '') +
    '</td>' +
    PB5_GRUPOS.map(g => {
      const t = pb5Valor(pb5G(r.valor_tipico, g)[j], pct);
      return '<td class="num" title="' + esc(pb5DicaGrupo(p, r, j, g)) + '" style="font-size:13px;color:' +
        (g === 'meio' ? 'var(--tinta2)' : 'var(--tinta)') + ';font-weight:' + (g === 'meio' ? '500' : '600') + '">' +
        (t === null ? ptFalta('o grupo não tem valor típico neste número') : esc(t)) + '</td>';
    }).join('') +
    '<td class="txt">' + pb5FaixaSvg(p, r, j) + '</td>' +
    pb5DifCel(p, r, j, 'sobe') +
    pb5DifCel(p, r, j, 'cai') +
    '<td class="txt">' + pb5Selo(f1, rotComp(PB5_COMP[0])) + pb5Selo(f2, rotComp(PB5_COMP[1])) + '</td>' +
    '</tr>';
}

/* O aviso do setor com pouca gente vai no painel em que o número foi contado com aquela gente: o
   físico do setor. O gerador põe `aplica: false` no técnico do setor, e diz por quê. */
function pb5AvisoSetor(r) {
  const a = r.aviso_do_setor;
  if (!a) return '';
  /* Aviso de que um aviso não vale é ruído acima da tabela, e o motivo gravado traz nome de chave.
     A base de cada valor típico (de quantas temporadas ele saiu) já está na dica de cada célula; o
     motivo inteiro fica só no número técnico pequeno, para quem quiser conferir. */
  if (a.aplica === false) {
    return '<p class="pt-nota" style="margin-top:2px">Quantas temporadas entram em cada grupo está na dica de cada valor.' +
      ptTecnico('aviso do setor não aplicado: ' + esc(String(a.motivo || 'sem motivo gravado').replace(/`/g, ''))) + '</p>';
  }
  const kPoucos = Object.keys(a).find(k => /^marca_baixa_confianca_\d+_a_\d+$/.test(k));
  const kSem = Object.keys(a).find(k => /^clube_temporada_sem_\d+_atletas$/.test(k));
  if (!kPoucos && !kSem) return '<p class="pt-nota">' + ptFalta('o aviso do setor veio sem as contagens de pouca gente') + '</p>';
  const faixa = kPoucos ? kPoucos.match(/\d+/g).map(Number) : null;
  const corte = kSem ? Number(kSem.match(/\d+/)[0]) : null;
  /* Contagem zero não vira frase: "em 0, de menos de 3 (essas ficam vazias)" prometia vazios que não
     existem. Com as duas contagens em zero, não há aviso a dar. */
  const partes = [];
  if (kPoucos && Number(a[kPoucos]) > 0) partes.push('em <b>' + ptInt(a[kPoucos]) + '</b> ' + pbPl(a[kPoucos], 'temporada de clube', 'temporadas de clube') +
    ' o número do setor saiu de só ' + ptInt(faixa[0]) + ' a ' + ptInt(faixa[faixa.length - 1]) + ' jogadores rastreados');
  if (kSem && Number(a[kSem]) > 0) partes.push('em <b>' + ptInt(a[kSem]) + '</b>, de menos de ' + ptInt(corte) + ' (essas ficam vazias no detalhe por time)');
  if (!partes.length) return '';
  return '<p class="pt-nota" style="margin-top:4px;padding:6px 10px;border:1px solid var(--txt-ambar);border-radius:6px;' +
    'max-width:none"><b style="color:var(--tinta)">Setor com pouca gente:</b> ' + partes.join(', e ') +
    '. É pouca gente para uma média confiável, e o valor típico deste painel carrega isso.' +
    ptTecnico('vazios_por_setor, setor ' + esc(a.setor || '')) + '</p>';
}

/* Nomes de reunião para os painéis e os pilares desta etapa, os da prévia aprovada ("Zagueiros:
   técnico", "Físico do time inteiro"). `pbRotPilar` monta o nome pedaço a pedaço ("físico · do time ·
   elenco") e serve às outras etapas, que não mudaram; aqui ele fica só de reserva, para uma chave que
   o gerador venha a criar e esta lista ainda não conheça — ela aparece, com o nome montado. */
const PB5_SETOR_NOME = { zaga: 'Zagueiros', lateral: 'Laterais', meio: 'Meio-campo', ataque: 'Ataque' };
const PB5_PAINEL_NOME = { tecnico_col: 'Jogo do time', elenco: 'Elenco e uso dos jogadores',
  fisico_col_elenco: 'Físico do time inteiro' };
const PB5_PILAR_NOME = { tecnico_col: 'Jogo do time e elenco', tecnico_ind: 'Técnico, por setor (média dos jogadores)',
  fisico_col: 'Físico do time e por setor' };
function pb5RotPainel(k) {
  const s = String(k);
  if (PB5_PAINEL_NOME[s]) return PB5_PAINEL_NOME[s];
  const m = /^(tecnico_ind|fisico_col)_(zaga|lateral|meio|ataque)$/.exec(s);
  if (m) return PB5_SETOR_NOME[m[2]] + ': ' + (m[1] === 'tecnico_ind' ? 'técnico' : 'físico');
  return pbMaiusc(pbRotPilar(s));
}
function pb5RotPilarE5(pilar) {
  return PB5_PILAR_NOME[String(pilar)] || pbMaiusc(pbRotPilar(pilar));
}

function pb5PainelResumo(d, k, setor) {
  const p = d.paineis[k];
  const inds = p.indicadores || [];
  const R = pb5Resumo(p);
  if (!R.r) return '<p class="pt-nota" data-pb5-sem-resumo>' + ptFalta(R.motivo) + '</p>';
  const r = R.r;
  const ord = pb5OrdemResumo(r, inds.length);
  const posF = {};
  ord.idx.forEach((j, i) => { posF[j] = i; });
  const c = r.contagem || {};
  const pi = c.por_indicador;
  const resumo = pi
    ? '<p class="pt-nota" style="margin-top:4px"><b>' + ptInt(inds.length) + '</b> números: <b>' + ptInt(pi.firme) +
      '</b> com diferença firme em pelo menos uma das duas comparações, <b>' + ptInt(pi.pode_ser_sorte) +
      '</b> ' + pbPl(pi.pode_ser_sorte, 'que pode', 'que podem') + ' ser sorte e <b>' + ptInt(pi.sem_diferenca) +
      '</b> sem diferença clara' + (pi.sem_teste ? ', <b>' + ptInt(pi.sem_teste) + '</b> sem teste' : '') + '.' +
      ptTecnico('nas ' + ptInt(c.comparacoes) + ' comparações: ' + ptInt(c.firme) + ' firmes · ' + ptInt(c.pode_ser_sorte) +
        ' pode ser sorte · ' + ptInt(c.sem_diferenca) + ' sem diferença') + '</p>'
    : '<p class="pt-nota">' + ptFalta('o resumo deste painel não traz a contagem') + '</p>';
  const primeiro = (inds[0] || {}).id;
  const info = primeiro ? (ptInfoMedida(primeiro) || {}) : {};
  const fonte = info.fonte && info.fonte !== 'nao_achei_fonte' ? info.fonte : null;
  const quem = g => ptFxRot(g, { forma: 'quem' });
  const th = (html, estilo, dica) => '<th class="txt"' + (dica ? ' title="' + esc(dica) + '"' : '') +
    ' style="cursor:default;vertical-align:bottom;color:var(--tinta2);' + (estilo || '') + '">' + html + '</th>';
  const sub = t => '<span style="display:block;font-weight:400;text-transform:none;letter-spacing:0;color:var(--tinta2)">' + t + '</span>';
  const cab = '<thead><tr>' +
    th('Número' + sub('unidade · lado bom'), 'min-width:13em') +
    PB5_GRUPOS.map(g => th(pb6Bola(g) + ' ' + esc(pbMaiusc(ptFxRot(g, { forma: 'verbo' }))) + sub('típico'),
      'text-align:right', 'o valor típico (a mediana) de ' + quem(g) + ', na unidade do número; passe o mouse na célula para a média, a faixa e a posição')).join('') +
    th('Onde fica cada grupo' + sub('metade dos times e o típico'), '', 'barra fina do 1º ao 3º quarto e bolinha do típico, na escala da própria linha') +
    th(esc(pbMaiusc(quem('sobe'))) + sub('contra ' + esc(quem('meio'))), 'text-align:right') +
    /* O selo ao lado não é desta coluna: quem caiu contra o meio não tem teste no catálogo. Sem esta
       legenda o leitor lia o "pode ser sorte" de subiu × caiu como a firmeza do número de quem caiu. */
    th(esc(pbMaiusc(quem('cai'))) + sub('contra ' + esc(quem('meio'))) +
      (pb5TemTesteCaiMeio(d) ? '' : sub('sem teste de firmeza')), 'text-align:right',
      pb5TemTesteCaiMeio(d) ? '' : quem('cai') + ' contra ' + quem('meio') + ' não tem teste no catálogo da etapa 2; os selos ao lado são das outras duas comparações') +
    th('A diferença é firme?' + sub('só as duas comparações testadas'), '') +
    '</tr></thead>';
  const corpo = ord.idx.map((j, i) => pb5LinhaResumo(p, r, j, setor, i)).join('');
  return '<div class="pt-card-cab" style="margin-top:4px"><h4 style="font-size:15px">' + esc(pb5RotPainel(k)) + '</h4>' +
      '<span style="color:var(--tinta2)"' + (p.origem_das_colunas ? ' title="' + esc(String(p.origem_das_colunas).replace(/`/g, '')) + '"' : '') + '>' +
      (fonte ? 'de onde vem: ' + esc(fonte) : 'o glossário não diz a fonte deste painel') + '</span></div>' +
    resumo +
    pb5AvisoSetor(r) +
    (ord.motivo ? '<p class="pt-nota">' + ptFalta(ord.motivo) + '</p>' : '') +
    '<div class="pt-tab-rola" style="margin-top:8px"><table class="pt-tab" data-pb5-tabela style="min-width:1060px">' + cab +
      '<tbody data-pb5-resumo>' + corpo + '</tbody></table></div>';
}

/* A abertura da etapa, com o exemplo que o dono apontou no print nos dois formatos. Sem o exemplo
   gravado, ou com ele ausente, a tela escreve a ausência — e não escolhe outro número por conta própria. */
function pb5Exemplo(d) {
  const ex = d.exemplo;
  if (!ex) return '';
  const titulo = 'O mesmo número nos dois formatos';
  if (ex.ausente) {
    return '<div class="pt-controle"><span class="pt-rot">' + esc(titulo) + '</span><p class="pt-nota">' +
      ptFalta(ex.motivo || 'o exemplo escolhido não está no arquivo') + '</p></div>';
  }
  const pct = ex.unidade === '%';
  const nome = ex.id ? ptNomeIndicador(ex.id) : String(ex.nome || '');
  const trio = (fmt) => '<div style="display:flex;gap:18px;flex-wrap:wrap;margin-top:6px">' +
    PB5_GRUPOS.map(g => '<div style="display:flex;flex-direction:column"><span style="font-size:11.5px;color:var(--tinta2)">' +
      pb6Bola(g) + ' ' + esc(pbMaiusc(ptFxRot(g, { forma: 'verbo' }))) + '</span><b style="font-size:20px;font-variant-numeric:tabular-nums">' +
      fmt(g) + '</b></div>').join('') + '</div>';
  const posFmt = g => {
    const v = pb5G(ex.posicao_tipica, g);
    return v === null || v === undefined ? ptFalta('sem posição') : esc(ptNum(v, Number(v) % 1 ? 1 : 0));
  };
  const dp = ex.diferenca_sobe_cai_na_posicao;
  /* A diferença sai com uma casa quando não é inteira — as posições ao lado aparecem assim (27,5), e
     arredondar só a diferença fazia 60 − 27,5 virar "33" no texto. */
  const casasDp = dp === null || dp === undefined ? 0 : (Number(dp) % 1 ? 1 : 0);
  const antes = '<div style="flex:1 1 20em;min-width:0"><b style="font-size:13px">Como era: a posição no ranking do ano (0 a 100)</b>' +
    trio(posFmt) +
    '<p class="pt-nota">' + (dp === null || dp === undefined ? ptFalta('o exemplo não grava a diferença na posição')
      : pbMaiusc(esc(pb5DifTexto(dp, casasDp))) + '.') +
    ' Olhando só a posição, parece uma distância enorme entre os grupos. Mas a posição só diz quem está na frente de ' +
    'quem, não por quanto: com os times muito perto uns dos outros, um pouco a mais já muda muito a posição.</p></div>';
  let depois;
  if (ex.resumo_ausente || !ex.valor_tipico) {
    depois = '<div style="flex:1 1 20em;min-width:0"><b style="font-size:13px">No valor medido</b><p class="pt-nota">' +
      ptFalta(typeof ex.resumo_ausente === 'string' ? ex.resumo_ausente : (ex.motivo || 'o exemplo não traz o valor típico de cada grupo')) +
      '</p></div>';
  } else {
    const valFmt = g => { const t = pb5Valor(pb5G(ex.valor_tipico, g), pct); return t === null ? ptFalta('sem valor') : esc(t); };
    const dm = ex.diferenca_contra_meio || {};
    const quemX = g => esc(ptFxRot(g, { forma: 'quem' }));
    /* Frase de reunião, como na prévia: o tamanho sem sinal e o lado em palavra ("2,47 p.p. abaixo"),
       em vez de "+0,29 p.p." solto. O "p.p." fica, porque é a unidade do número. */
    const difTxt = g => {
      const v = pb5G(dm, g);
      if (v === null || v === undefined) return quemX(g) + ' ' + ptFalta('sem diferença gravada');
      const casas = ex.tipo_diferenca === 'pp' ? 2 : 1;
      const t = ptNum(Math.abs(Number(v)), casas);
      if (t === ptNum(0, casas)) return quemX(g) + ' fica igual a ' + quemX('meio');
      return quemX(g) + ' fica <b>' + esc(t + (ex.tipo_diferenca === 'pp' ? ' p.p.' : '%')) + ' ' +
        (Number(v) > 0 ? 'acima' : 'abaixo') + '</b> de ' + quemX('meio');
    };
    const fz = ex.firmeza || {};
    const entre = (f, a, b) => {
      const par = 'entre ' + quemX(a) + ' e ' + quemX(b);
      const ch = f ? ptChaveSorte({ chave: f.chave, p: f.p, q: f.q }) : null;
      if (!ch || !ch.chave) return par + ', ' + ptFalta((f && f.motivo) || (ch && ch.motivo) || 'sem teste gravado');
      const frase = esc(ptSorte({ chave: f.chave, p: f.p, q: f.q }));
      return ch.chave === 'firme' ? par + ', a diferença é <b>' + frase + '</b>'
        : ch.chave === 'pode_ser_sorte' ? par + ', a diferença <b>' + frase + '</b>'
          : par + ', <b>' + frase + '</b>';
    };
    const tecs = [['sobe_meio', fz.sobe_meio], ['sobe_cai', fz.sobe_cai]].filter(x => x[1] && (x[1].chave || x[1].p !== undefined))
      .map(x => ptFxRot('sobe', { forma: 'nome' }) + ' × ' + ptFxRot(x[0] === 'sobe_meio' ? 'meio' : 'cai', { forma: 'nome' }) +
        ': p ' + pb6P(x[1].p) + ' · q ' + pb6P(x[1].q));
    depois = '<div style="flex:1 1 20em;min-width:0"><b style="font-size:13px">Como fica: o valor medido' +
      (ex.unidade ? ' (' + esc(ex.unidade) + ')' : '') + '</b>' + trio(valFmt) +
      '<p class="pt-nota">' + pbMaiusc(difTxt('cai')) + ', e ' + difTxt('sobe') + '. ' +
      pbMaiusc(entre(fz.sobe_meio, 'sobe', 'meio')) + '; ' + entre(fz.sobe_cai, 'sobe', 'cai') + '.' +
      (tecs.length ? ' ' + ptTecnico(tecs.join(' · ')) : '') + '</p></div>';
  }
  return '<div class="pt-controle"><span class="pt-rot">' + esc(titulo) + ': ' + esc(nome) + '</span>' +
    (ex.escolhido_por ? pbMiudo(' escolhido: ' + esc(ex.escolhido_por)) : '') +
    '<div style="display:flex;flex-wrap:wrap;gap:14px 28px;margin-top:8px">' + antes + depois + '</div></div>';
}

/* Contraste de leitura (>= 4,5:1 nos dois temas). A casca pinta de --tinta3 o cabeçalho das tabelas,
   o `ptFalta`, o `.pt-rot` e o subtítulo dos cards, e a 9-12px isso fica abaixo do mínimo no escuro e no
   claro. O CSS da casca não é deste arquivo; então, só dentro da etapa 5, esses textos ganham --tinta2
   inline. É cor e nada mais: nenhuma célula, cabeçalho ou texto muda. Onde o elemento já tem `style`, a
   cor foi posta à mão no próprio lugar, porque um segundo atributo `style` seria ignorado. */
function pb5Legivel(html) {
  const cor = 'color:var(--tinta2)';
  return String(html)
    .replace(/<th(?=[\s>])(?![^>]*\sstyle=)/g, '<th style="' + cor + '"')
    .replace(/class="pt-falta"(?![^>]*\sstyle=)/g, 'class="pt-falta" style="' + cor + '"')
    .replace(/class="pt-rot"(?![^>]*\sstyle=)/g, 'class="pt-rot" style="' + cor + '"')
    .replace(/class="pt-cel pt-cel-vazio"(?![^>]*\sstyle=)/g, 'class="pt-cel pt-cel-vazio" style="' + cor + '"')
    .replace(/(<div class="pt-card-cab"[^>]*>\s*<h4[^>]*>[\s\S]*?<\/h4>)<span>/g, '$1<span style="' + cor + '">');
}

/* Contraste de leitura nas etapas deste arquivo (revisão de 14/09, noite). A casca pinta de --tinta3 o
   `.pt-rot`, o cabeçalho das tabelas, o subtítulo dos cards e o `ptFalta`, e a 9,5-12px isso fica abaixo de
   4,5:1 nos dois temas (medido na etapa 6: 3,03 e 2,77 no claro). A marca "efeito do resultado" usa o
   laranja da faixa baixa, que também não chega. O style.css não é deste arquivo; então uma folha pequena,
   escopada nas etapas que ESTE arquivo desenha (o atributo `data-pb-legivel` no alvo), dá --tinta2 a esses
   textos e o âmbar de texto da casca à marca. Folha em vez de cor inline porque a tabela da etapa 6 se
   redesenha ao ordenar, e o cabeçalho ativo (`th.on`) mantém a cor dele. Só cor: nada muda de lugar. */
function pbLegivel(alvo) {
  if (alvo && alvo.setAttribute) alvo.setAttribute('data-pb-legivel', '');
  if (typeof document === 'undefined' || document.getElementById('pbLegivelFolha')) return;
  const st = document.createElement('style');
  st.id = 'pbLegivelFolha';
  st.textContent =
    '[data-pb-legivel] .pt-rot,[data-pb-legivel] .pt-card-cab>span,[data-pb-legivel] .pt-falta,' +
    '[data-pb-legivel] .pt-tab thead th:not(.on){color:var(--tinta2)}' +
    '[data-pb-legivel] .pt-tab thead th:not(.on):hover{color:var(--tinta)}' +
    '[data-pb-legivel] .pt-marca.alerta{color:var(--txt-ambar);border-color:var(--txt-ambar)}';
  document.head.appendChild(st);
}

function ptEtapa5(alvo, d) {
  pbLegivel(alvo);
  const chaves = Object.keys(d.paineis || {});
  if (!chaves.length) {
    alvo.innerHTML = ptFaltaBloco('Nenhum painel nesta etapa',
      'o ' + ptArquivoDado() + ' traz `etapa_5` sem a chave `paineis` — sem ela não há tabela para desenhar');
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
    : ptFaltaBloco('O físico de cada jogador não aparece nesta etapa',
        'o estudo previa estes olhares: técnico do jogador, técnico do time, físico do jogador e físico ' +
        'do time. O arquivo traz ' + ptInt(pilares.length) + ' (' +
        pilares.map(g => pb5RotPilarE5(g.pilar).toLowerCase()).join('; ') + '), e nenhum é o físico de cada jogador. ' +
        'Jogador a jogador, ele não vem aqui como time × número: o que existe dele no arquivo já está ' +
        'somado por clube antes do teste — para não contar o mesmo time uma vez por jogador — e é ' +
        'assunto da etapa 13. Esta etapa não desenha esse olhar, e não o ' +
        'inventa a partir dos setores físicos, que já são números do time.');

  const regra = d.regra_do_resumo;
  const algumResumo = chaves.some(k => pb5Resumo(d.paineis[k]).r);
  const quem = g => esc(ptFxRot(g, { forma: 'quem' }));
  const tg = (regra && regra.temporadas_por_grupo) || {};
  const temTg = g => pb5G(tg, g) !== undefined && pb5G(tg, g) !== null;

  /* A ORDEM é a da prévia aprovada (revisão de 14/09, noite): uma frase, as três contagens, o exemplo,
     os controles e já a primeira tabela. O dono pediu "de relance"; abrir com três parágrafos de regra
     escondia a tabela aprovada atrás de 1.700 px de texto. As regras de cada coluna, a firmeza, a
     contagem geral e "o que isto não quer dizer" descem para a caixa "Como os números foram feitos",
     depois do último painel, como no rodapé da prévia. Os números dela vêm da regra gravada; o texto só
     diz do que se trata, nunca o que se achou. */
  let abertura, comoFeito = '';
  if (!regra || !algumResumo) {
    /* Ausência discreta: a matriz continua embaixo, e ela é o conteúdo que existe. Não promete que a
       tabela "aparece quando o estudo for gerado de novo": na aba por pontos o gerador chama a etapa sem
       o catálogo e, gerado de novo, grava a ausência, não a tabela. */
    abertura = '<p class="pt-nota" data-pb5-sem-resumo-geral><b>A tabela por grupos (' +
      PB5_GRUPOS.map(g => quem(g)).join(', ') + ') não está no arquivo.</b> ' +
      ptFalta(!regra
        ? 'o ' + ptArquivoDado() + ' não traz o resumo por grupos (nem a regra dele, nem o valor típico de cada grupo)'
        : 'o ' + ptArquivoDado() + ' traz a regra do resumo, mas nenhum painel com o resumo desenhável') +
      '. O detalhe por time continua abaixo, igual.</p>';
  } else {
    const cg = regra.contagem_geral;
    const cortes = regra.cortes || {};
    const e7 = pb6EtapaDe('etapa_7');
    const rotSub = t => '<b style="display:block;margin-top:10px;font-size:12.5px;color:var(--tinta)">' + t + '</b>';
    abertura =
      '<p class="pt-nota">Cada linha é um <b>número do jogo</b>. As três colunas mostram o <b>valor típico</b> de cada ' +
        'grupo, na unidade do próprio número. Depois vem quanto ' + quem('sobe') + ' e ' + quem('cai') + ' ficam acima ' +
        'ou abaixo de ' + quem('meio') + ', e se essa diferença é firme ou pode ser sorte. As regras de cada coluna ' +
        'estão no fim da etapa, em «Como os números foram feitos».</p>' +
      '<p class="pt-nota" style="display:flex;flex-wrap:wrap;gap:4px 18px">' +
        PB5_GRUPOS.map(g => '<span>' + pb6Bola(g) + ' ' +
          (temTg(g) ? '<b>' + ptInt(pb5G(tg, g)) + '</b> temporadas de ' + quem(g)
            : quem(g) + ' ' + ptFalta('a regra não grava quantas temporadas')) + '</span>').join('') +
      '</p>' +
      pb5Exemplo(d);

    comoFeito =
      '<div class="pt-controle" data-pb5-como style="margin-top:22px"><span class="pt-rot">Como os números foram feitos</span>' +
        rotSub('Valor típico') +
        '<p class="pt-nota">É o time do meio do grupo, com metade acima e metade abaixo. Com poucos times nas pontas, ' +
          'um fora da curva puxa a média; por isso a média, a faixa em que fica a metade dos times e a posição típica ' +
          'no ranking do ano ficam na dica de cada célula. Os valores juntam os anos, sem ajuste de ano. ' +
          '<b>Onde fica cada grupo</b> desenha essa faixa: a barra fina é a metade dos times, a bolinha é o típico, e a ' +
          'escala é a da própria linha.' + ptTecnico('mediana crua do grupo') + '</p>' +
        rotSub('A diferença') +
        '<p class="pt-nota">Sempre contra ' + quem('meio') + ', o time típico que fica na Série B: em % do valor do meio; ' +
          'quando o número já é uma porcentagem, em <b>pontos percentuais (p.p.)</b>, porque porcentagem de porcentagem ' +
          'confunde. <b>Melhor</b> ou <b>pior que o meio</b> só aparece onde o estudo declarou o lado bom do número; nos ' +
          'outros, a tabela diz só acima ou abaixo.</p>' +
        rotSub('Firme ou sorte') +
        '<p class="pt-nota">São os testes que o estudo já fez no catálogo, comparando a posição do time no ranking de ' +
          'cada ano. <b>Firme</b>: passa na conta dos muitos testes feitos ao mesmo tempo. <b>Pode ser sorte</b>: a ' +
          'diferença aparece, mas, com tantos números testados, uma assim pode sair por acaso. <b>Sem diferença clara</b>: ' +
          'nem isso. São as mesmas três palavras, com os mesmos cortes, em toda a aba.' +
          (pb5TemTesteCaiMeio(d) ? '' : ' ' + pbMaiusc(quem('cai')) + ' contra ' + quem('meio') + ' não tem teste no ' +
            'catálogo e fica sem selo: os dois selos de cada linha são das outras duas comparações.') +
          ptTecnico('firme: q < ' + ptNum(cortes.q_firme, 2) + ' · pode ser sorte: p < ' + ptNum(cortes.p_pode_ser_sorte, 2) +
            ' sem passar no q') + '</p>' +
        rotSub('A ordem das linhas') +
        '<p class="pt-nota">Da diferença <b>mais firme para a menos firme</b>, ou na ordem em que o estudo lista os ' +
          'números; <b>nunca pelo tamanho da diferença</b>, porque números de unidades diferentes não se comparam entre ' +
          'si. O detalhe por time embaixo de cada tabela segue outra ordem: a da distância na posição entre ' +
          quem('sobe') + ' e ' + quem('cai') + '.</p>' +
        (cg
          ? '<p class="pt-nota">No estudo inteiro: <b>' + ptInt(cg.paineis) + '</b> painéis, <b>' + ptInt(cg.indicadores) +
            '</b> números e <b>' + ptInt(cg.comparacoes) + '</b> comparações — <b>' + ptInt(cg.firme) + '</b> firmes, <b>' +
            ptInt(cg.pode_ser_sorte) + '</b> que podem ser sorte e <b>' + ptInt(cg.sem_diferenca) + '</b> sem diferença clara' +
            (cg.sem_teste ? ', <b>' + ptInt(cg.sem_teste) + '</b> sem teste' : '') + '.</p>'
          : '<p class="pt-nota">' + ptFalta('a regra do resumo não traz a contagem geral') + '</p>') +
        rotSub('O que isto não quer dizer') +
        '<p class="pt-nota"><b>Poucos times nas pontas.</b> ' +
          (temTg('sobe') && temTg('cai')
            ? 'São ' + ptInt(pb5G(tg, 'sobe')) + ' temporadas de ' + quem('sobe') + ' e ' + ptInt(pb5G(tg, 'cai')) + ' de ' +
              quem('cai') + ': '
            : ptFalta('a regra não grava quantas temporadas há em cada grupo') + ' ') +
          'uma diferença firme ainda é de poucos times.</p>' +
        '<p class="pt-nota"><b>Andar junto no mesmo ano não é causa.</b> O número e os pontos saem dos mesmos jogos, e o ' +
          'time que está ganhando joga diferente. Quem separa o que vem antes do resultado é a ' +
          (e7.n === null ? ptFalta('o arquivo não diz o número dessa etapa') : '<b>etapa ' + ptInt(e7.n) + '</b>') +
          '. Não é receita: fazer mais daquilo não garante subir.</p>' +
        '<p class="pt-nota"><b>Duas escalas.</b> A firmeza é da posição do time dentro de cada ano; o valor típico junta os ' +
          'anos. Onde as duas leituras põem os grupos em ordens diferentes, a linha avisa em amarelo.' +
          (regra.declarada_antes_de_medir === true ? ptTecnico('regra declarada antes de medir') : '') + '</p>' +
      '</div>';
  }

  const controles = !algumResumo ? ''
    : '<div class="pt-filtros" data-pb5-controles style="margin-top:12px">' +
        '<label title="' + esc('o detalhe por time, embaixo de cada tabela, segue outra ordem: a da distância na posição entre ' +
          ptFxRot('sobe', { forma: 'quem' }) + ' e ' + ptFxRot('cai', { forma: 'quem' })) + '">Ordem das linhas ' +
          '<select data-pb5-ordem aria-label="ordem das linhas">' +
          '<option value="firmeza">a diferença mais firme primeiro</option>' +
          '<option value="estudo">na ordem em que o estudo lista os números</option></select></label>' +
        '<label>Buscar número <input type="search" data-pb5-busca placeholder="ex.: duelos" autocomplete="off" ' +
          'style="width:11em"></label>' +
        '<label style="cursor:pointer"><input type="checkbox" data-pb5-so> esconder o que não mostra diferença</label>' +
        '<span class="pt-filtros-conta" style="color:var(--tinta2)">Ir para o painel:</span>' +
        '<div class="pt-filtro-grupo">' + chaves.map(k =>
          '<button type="button" class="pt-chip" data-pb5-salto="' + esc(k) + '" style="color:var(--tinta2)">' +
            esc(pb5RotPainel(k)) + '</button>').join('') + '</div>' +
      '</div>';

  /* O que vale para todos os detalhes por time, dito uma vez, depois dos painéis. Embaixo de cada h5 fica
     só uma linha dizendo que ali o número é a posição. */
  const detalheRodape =
    '<div class="pt-controle" style="margin-top:22px"><span class="pt-rot">Sobre o detalhe por time</span>' +
    '<p class="pt-nota">Cada detalhe mostra os <b>' + ptInt(nClubes) + '</b> ' + esc(ptFxRot('sobe', { forma: 'times' })) +
      ', um por linha, e a cor de cada quadradinho é a <b>posição do time no ranking daquele ano</b>, comparado só com ' +
      'os outros clubes da mesma Série B. Clicar num quadradinho abre, logo abaixo daquela tabela, o número medido, a ' +
      'posição, de quantos jogadores ou jogos ele saiu e a temporada. O detalhe <b>não se reordena com clique</b>: as ' +
      'três linhas de baixo precisam ficar embaixo de cada coluna.' + ptTecnico('percentil dentro do ano') + '</p>' +
    (semLado
      ? '<p class="pt-nota">Em <b>' + ptInt(semLado) + '</b> dos ' + ptInt(totalInd) + ' números o estudo ' +
        '<b>não disse se ter mais é bom ou ruim</b>. No detalhe, a cor mostra só a posição no ranking, e ler o tom ' +
        'forte como "melhor" seria invenção da tela.' + ptTecnico('sinal: 0') + '</p>'
      : '') +
    '</div>';

  /* Tudo aberto, um painel embaixo do outro (pedido do dono). Em cada painel: a tabela por grupos
     primeiro, e o detalhe por time embaixo, com a caixa do clique logo depois dele. */
  const paineis = pilares.map(g =>
    '<span class="pt-rot" style="display:block;margin-top:22px;color:var(--tinta2)">' + esc(pb5RotPilarE5(g.pilar)) + ' · ' +
      ptInt(g.chaves.length) + ' ' + pbPl(g.chaves.length, 'painel', 'painéis') + '</span>' +
    g.chaves.map(k => {
      const mSetor = /_(zaga|lateral|meio|ataque)$/.exec(String(k));
      return '<section data-pb5-painel="' + esc(k) + '" style="margin-top:12px;padding-top:10px;border-top:1px solid var(--borda)">' +
        (algumResumo ? pb5PainelResumo(d, k, mSetor ? mSetor[1] : null)
          : '<div class="pt-card-cab" style="margin-top:4px"><h4 style="font-size:15px">' + esc(pb5RotPainel(k)) + '</h4></div>') +
        '<h5 style="margin:16px 0 0;font-size:13px;font-weight:650;color:var(--tinta)">' +
          'Detalhe por time: posição no ranking do ano (0 a 100)</h5>' +
        '<p class="pt-nota" style="margin-top:2px">Aqui o número de cada quadradinho é a posição do time naquele ano, ' +
          'não o valor medido; clique num quadradinho para ver o valor.</p>' +
          '<div style="margin-top:8px">' + pb5Matriz(d, k) + '</div>' +
          '<div class="pt-controle" data-pb5-lupa id="' + esc(ptId('5-lupa-' + k)) + '" hidden></div>' +
      '</section>';
    }).join('')).join('');

  alvo.innerHTML = pb5Legivel(
    abertura +
    controles +
    paineis +
    detalheRodape +
    comoFeito +
    falta4 +
    pb5Sensibilidade(d) +
    pb5Vazios(d));

  pb5Ligar(alvo);
  pb5LigarResumo(alvo);
}

/* Os controles só mexem na ordem e na visibilidade das linhas que já estão desenhadas: a ordem é a do
   gerador (posição na `ordem_por_firmeza`, guardada na linha) ou a do estudo (o índice do número), e a
   busca e o "esconder" só leem o que a linha já traz. Nada é recalculado num clique. */
function pb5LigarResumo(alvo) {
  const box = alvo.querySelector('[data-pb5-controles]');
  if (!box) return;
  const selO = box.querySelector('[data-pb5-ordem]');
  const inB = box.querySelector('[data-pb5-busca]');
  const chS = box.querySelector('[data-pb5-so]');
  const aplicar = () => {
    const chave = selO.value === 'estudo' ? 'pb5Oe' : 'pb5Of';
    const b = pb5Norm(inB.value.trim());
    const so = chS.checked;
    alvo.querySelectorAll('tbody[data-pb5-resumo]').forEach(tb => {
      const trs = Array.from(tb.children);
      trs.sort((a, c) => Number(a.dataset[chave]) - Number(c.dataset[chave])).forEach(tr => tb.appendChild(tr));
      trs.forEach(tr => {
        tr.hidden = !((!b || tr.dataset.pb5Busca.indexOf(b) >= 0) && (!so || tr.dataset.pb5Mostra === '1'));
      });
    });
  };
  selO.onchange = aplicar;
  inB.oninput = aplicar;
  chS.onchange = aplicar;
  box.querySelectorAll('[data-pb5-salto]').forEach(bt => {
    bt.onclick = () => {
      const sec = alvo.querySelector('[data-pb5-painel="' + bt.dataset.pb5Salto + '"]');
      if (sec) sec.scrollIntoView({ block: 'start', behavior: 'smooth' });
    };
  });
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
        : ' · ' + pb5DifTexto(v) + ', na mediana (típico contra típico, na posição no ranking do ano: ' +
            pbCheio(v) + ')';
      const difHtml = !ord.dif ? ''
        /* --tinta2, não --tinta3: a 9px o --tinta3 dava 3,4:1 no escuro e 2,8:1 no claro, abaixo dos
           4,5:1 que texto pequeno pede. */
        : '<small style="display:block;font-weight:400;color:var(--tinta2);font-size:9px;margin-top:2px">' +
          (motivoDif ? esc('sem diferença') : esc(pb5DifTexto(v))) + '</small>';
      return '<th class="num' + (deitado ? ' pt-th-vertical" style="white-space:normal;color:var(--tinta2)' : '') + '" title="' +
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
      '<small style="display:block;color:var(--tinta2);font-size:10px;line-height:1.3">' +
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
  const estiloFx = 'color:var(--tinta2);font-size:10px;line-height:1.25;background:var(--fundo3)';
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
      '<small style="display:block;color:var(--tinta2);font-size:10px;line-height:1.3">de cima para baixo: ' +
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

  /* Sem h4: o nome do painel já está no título da tabela por grupos, logo acima, e o h5 "Detalhe por
     time" diz o que é esta matriz. Repeti-lo aqui era o terceiro título seguido. */
  return '<div class="pt-card-cab" style="margin-bottom:8px">' +
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
          ' <b style="color:var(--txt-ambar)">&#9651;</b> e contorno tracejado: o número saiu de só <b>' +
          ptInt(fbaixa.min) + '</b> a <b>' + ptInt(fbaixa.max) + '</b> ' + esc(pbUnid(unid)) + '. É pouca ' +
          'gente para uma média confiável. ' +
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
  /* (15/09) O desconto pelo valor do elenco saiu do estudo. Um arquivo antigo (ou a aba de pontos antes
     de ser regerada) ainda pode trazer as colunas `*_liq_*`; elas não entram na tabela. */
  const campos = Object.keys(s[regras[0]] || {}).filter(c => !/_liq_/.test(c));
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
    ': primeiro olhando um número de cada vez (o p abaixo do corte, que <b>pode ser sorte ou firme</b>); ' +
    'depois só os <b>firmes</b>, os que continuam de pé contando os muitos testes feitos ao mesmo tempo — ' +
    'quando se testa muita coisa, alguma dá certo por sorte.' +
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
      ' · bh = firmes, contando os muitos testes' + ptTecnico('Benjamini-Hochberg') +
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
        'o quadradinho aparece, mas <b>marcado</b> com <b style="color:var(--txt-ambar)">&#9651;</b> e ' +
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
   ETAPA 6 — o que anda junto com os pontos no próprio ano
   ================================================================================

   Pedido do dono (14/09): o foco é a subida NO ANO — "a construção é sempre para o ano". Cada
   miniatura põe, na horizontal, a posição do time no ranking do ano naquele número (a mesma escala
   das células da etapa 5) e, na vertical, o aproveitamento de pontos daquele MESMO ano, nas
   temporadas do bloco `etapa_6.mesmo_ano`. A cor é a faixa do próprio ano. A força, o p, o q e a
   ordem das miniaturas vêm gravados pelo gerador, declarados antes de medir: a tela não ordena nem
   calcula força — só conta, pelo corte de sorte do estudo, para dizer a lista inteira em palavras.

   Anda junto no mesmo ano não diz o que veio antes: o número e os pontos saem dos mesmos jogos, e o
   time que está ganhando joga diferente. Quem separa isso é a etapa 7, e a tela aponta para ela pelo
   número que a casca dá à etapa, não por um número escrito aqui.

   As chaves antigas desta etapa continuam no arquivo, porque o gerador por pontos, o catálogo e a
   etapa 10 as leem; só deixaram de aparecer nesta tela, a pedido do dono.

   Mesma escala em todas as miniaturas: os eixos vão do menor ao maior valor de TODOS os pontos do
   bloco. Reescalar por número faria a nuvem mais solta parecer tão arrumada quanto a mais firme. */

/* Cores novas (não há variável de "subiu/caiu" na casca nem no style.css que seja azul claro e
   laranja nos dois temas). Miolo claro + contorno escuro do mesmo tom: lê no fundo claro e no
   escuro, e o contorno separa pontos sobrepostos. As MESMAS no ponto e na legenda. */
const PB6_CORES = {
  sobe: { miolo: '#5cb8ee', contorno: '#1f6ea3' },   /* azul claro */
  cai:  { miolo: '#f39a3e', contorno: '#a3530f' },   /* laranja */
  meio: { miolo: 'var(--tinta3)', contorno: 'var(--tinta2)' },
};
/* A faixa de uma temporada, lida pelo vocabulário da casca. O bloco grava a faixa interna
   (sobe/meio/cai); a aba de pontos pode gravar a chave dela (alta/media/baixa) — as duas valem. */
function pb6Faixa(v) {
  if (v === null || v === undefined) return null;
  return ['sobe', 'cai', 'meio'].find(k => v === k || v === ptFx(k)) || null;
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
function pb6NomeCor(k) { return k === 'sobe' ? 'azul claro' : k === 'cai' ? 'laranja' : 'cinza'; }

/* O sentido em palavras. A posição no ranking cresce com o número cru (quanto maior o número
   naquele ano, mais para a direita), então ρ positivo quer dizer que os times com mais disto
   fizeram mais pontos. Duas travas:
   - só quando a CHAVE de sorte da linha é "firme". Dar direção a uma relação que a própria linha diz
     que "pode ser sorte" afirma mais do que o dado mostra;
   - a frase DESCREVE o que foi visto naquele ano ("os times com mais disto fizeram mais pontos"),
     em vez da forma condicional "quanto mais disto, mais pontos", que se lê como receita. */
function pb6Chave(r) {
  return ptChaveSorte({ chave: r && r.sorte, p: r && r.p, q: r && r.q });
}
function pb6Sentido(rho, r) {
  if (rho === null || rho === undefined || isNaN(Number(rho))) return '';
  if (/^não/.test(ptJunto(rho))) return '';
  if (pb6Chave(r).chave !== 'firme') return '';
  return Number(rho) > 0 ? 'os times com mais disto fizeram mais pontos naquele ano'
    : 'os times com mais disto fizeram menos pontos naquele ano';
}
/* p e q do bloco saem por algarismo significativo; `ptPv` cortaria tudo abaixo do milésimo em
   "< 0,001". O rótulo gravado pelo gerador vence; sem ele, casas suficientes para o número aparecer. */
function pb6P(v, rotulo) {
  if (rotulo) return String(rotulo);
  if (v === null || v === undefined || isNaN(Number(v))) return '—';
  const n = Number(v);
  const casas = n > 0 && n < 0.001 ? Math.min(8, Math.ceil(-Math.log10(n)) + 1) : 3;
  return ptNum(n, casas);
}

/* Um número de etapa lido do dado ativo (`titulo_chave`) e o título dele no sumário da casca
   (PT_ETAPAS), para o aviso apontar para o lugar certo sem número escrito aqui. */
function pb6EtapaDe(chave) {
  const dd = ptDado();
  const bloco = (dd && dd[chave]) || {};
  const linhas = {};
  (bloco.linhas || []).forEach(l => { if (l && l.indicador) linhas[l.indicador] = l; });
  const n = (String(bloco.titulo_chave || '').match(/\d+/) || [])[0];
  const numero = n !== undefined ? Number(n) : null;
  const et = typeof PT_ETAPAS !== 'undefined' && numero !== null ? PT_ETAPAS.find(e => e[0] === numero) : null;
  return { linhas: linhas, n: numero, titulo: et ? et[1] : null };
}
/* A marca de quem passou na prova do 1º turno contra o 2º. Sem a COR da outra etapa: aqui o azul
   claro é "quem subiu", e escrever "é azul" embaixo de bolinhas azuis que querem dizer outra coisa
   dava duas leituras à mesma cor. Diz a prova pelo nome e aponta a etapa pelo número que o dado dá. */
function pb6RotE7(e7) {
  return 'passou na prova de vir antes do resultado (1º turno contra os pontos do 2º' +
    (e7 && e7.n !== null ? ', etapa ' + ptInt(e7.n) : '') + ')';
}
/* Números que passaram na prova da etapa 7, lidos do dado: medidos no 1º turno, continuam de pé
   contra os pontos do 2º descontados os pontos do 1º. */
function pb6Azuis7() {
  const dd = ptDado();
  const out = {};
  ((dd && dd.etapa_7 && dd.etapa_7.linhas) || []).forEach(l => {
    if (l && l.indicador && l.sinal_certo && pbPassa(l.p_parcial)) out[l.indicador] = true;
  });
  return out;
}
/* A marca da etapa 10 SAIU desta etapa (14/09) e NÃO volta (15/09). A etapa 10 passou a ser a lista
   fixa de resultado + consequência do resultado; dos números desta etapa, os que estão nela são
   exatamente os cinco que já levam a marca "efeito do resultado" (`consequencia_do_resultado`, lida da
   mesma lista do estudo). Um segundo selo diria a mesma coisa duas vezes. */

/* Números que dão EXATAMENTE a mesma ordem dos times no ano (distância por 90 min e metros por minuto,
   e as versões com e sem a bola): o gerador grava o par em `mesmo_posto_que`. Lado a lado, com os
   mesmos pontos, eles pareceriam dois achados independentes; são um só com dois nomes. A tela diz isso
   no quadradinho e na tabela, e a lista inteira conta os distintos, que o gerador também grava. */
function pb6Gemeos(r) {
  const g = r && Array.isArray(r.mesmo_posto_que) ? r.mesmo_posto_que.filter(Boolean) : [];
  if (!g.length) return '';
  return '<span title="' + esc('mesmo_posto_que: ' + g.join(', ')) + '"><b style="color:var(--tinta)">é o mesmo número que ' +
    g.map(k => esc(pbNome(k))).join(' e ') + '</b>: os times ficam na mesma ordem, então os quadradinhos são um achado só</span>';
}

/* A marca é um julgamento declarado pelo estudo antes de medir (efeito conhecido de estar ganhando
   ou perdendo), não uma probabilidade medida. */
function pb6MarcaConseq(r) {
  if (!r || r.consequencia_do_resultado !== true) return '';
  return '<span class="pt-marca alerta" title="' + esc('o estudo marca este número como efeito conhecido de ' +
      'estar ganhando ou perdendo' + (r.motivo_consequencia ? ': ' + r.motivo_consequencia : '')) +
    '">efeito do resultado</span>' + (r.motivo_consequencia ? ' ' + esc(r.motivo_consequencia) : '');
}

function ptEtapa6(alvo, d) {
  pbLegivel(alvo);
  const m = d && d.mesmo_ano;
  const semBloco = !m
    ? 'o ' + ptArquivoDado() + ' foi gravado antes deste desenho e não traz as temporadas com a posição em ' +
      'cada número e o aproveitamento do mesmo ano; a etapa aparece quando o estudo for gerado de novo'
    : m.ausente
      ? (m.motivo || 'o estudo marcou o bloco do mesmo ano como ausente, sem dizer o motivo')
      : (!Array.isArray(m.temporadas) || !m.temporadas.length || !m.pontos || !m.rho_mesmo_ano)
        ? 'o bloco do mesmo ano veio sem as temporadas, os pontos ou a força de cada número'
        : null;
  if (semBloco) {
    alvo.innerHTML = ptFaltaBloco('Os números contra os pontos do ano não estão no arquivo', semBloco);
    return;
  }
  const temps = m.temporadas;
  const rho = m.rho_mesmo_ano;
  const pontos = m.pontos;
  const temPontos = k => Array.isArray(pontos[k]);

  /* A ordem é a gravada. O que tiver pontos e ficar fora dela vai para o fim, na ordem das colunas
     do arquivo, e a tela diz quantos — não some e não é encaixado por conta própria. */
  const gravada = Array.isArray(m.ordem_por_forca) ? m.ordem_por_forca.filter(temPontos) : null;
  const base = (Array.isArray(m.indicadores) ? m.indicadores : Object.keys(pontos).sort()).filter(temPontos);
  const ids = gravada ? gravada.concat(base.filter(k => gravada.indexOf(k) < 0)) : base;
  const foraDaOrdem = gravada ? ids.length - gravada.length : null;
  if (!ids.length) {
    alvo.innerHTML = ptFaltaBloco('Sem pontos para desenhar', 'o bloco do mesmo ano não traz pontos de nenhum número');
    return;
  }

  /* Escala comum: todos os pontos de todos os números na horizontal, todas as temporadas na vertical. */
  let xlo = Infinity, xhi = -Infinity, ylo = Infinity, yhi = -Infinity;
  ids.forEach(k => pontos[k].forEach(v => {
    if (v !== null && v !== undefined) { xlo = Math.min(xlo, v); xhi = Math.max(xhi, v); }
  }));
  temps.forEach(t => {
    const y = t && t.aproveitamento_pct;
    if (y !== null && y !== undefined) { ylo = Math.min(ylo, y); yhi = Math.max(yhi, y); }
  });
  const escala = { xlo: xlo, xhi: xhi, ylo: ylo, yhi: yhi };
  if (!isFinite(xlo) || !isFinite(ylo)) {
    alvo.innerHTML = ptFaltaBloco('Sem pontos para desenhar',
      'o bloco do mesmo ano não traz nenhuma posição ou nenhum aproveitamento com valor');
    return;
  }
  if (xhi === xlo) { escala.xlo = xlo - 1; escala.xhi = xhi + 1; }
  if (yhi === ylo) { escala.ylo = ylo - 1; escala.yhi = yhi + 1; }

  const contaFx = { sobe: 0, cai: 0, meio: 0, sem: 0 };
  temps.forEach(t => { contaFx[pb6Faixa(t && t.faixa) || 'sem']++; });
  const anos = temps.map(t => t && t.ano).filter(a => a !== null && a !== undefined);
  const anoMin = anos.length ? Math.min.apply(null, anos) : null;
  const anoMax = anos.length ? Math.max.apply(null, anos) : null;
  const periodo = anoMin === null ? ptFalta('o bloco não diz os anos das temporadas')
    : anoMin === anoMax ? ptAno(anoMin) : ptAno(anoMin) + ' a ' + ptAno(anoMax);

  const e7 = pb6EtapaDe('etapa_7');
  const azuis7 = pb6Azuis7();
  const etapa7Txt = e7.n === null
    ? ptFalta('o arquivo não diz o número da etapa que mede o número antes do resultado')
    : '<b>etapa ' + ptInt(e7.n) + '</b>' + (e7.titulo ? ' («' + esc(e7.titulo) + '»)' : '');

  const comRho = ids.filter(k => rho[k] && rho[k].rho !== null && rho[k].rho !== undefined);
  const semRho = ids.length - comRho.length;
  const li = m.lista_inteira || {};
  const nTestes = li.n_testes !== undefined && li.n_testes !== null ? Number(li.n_testes) : comRho.length;
  const alfa = pbAlfa();
  const passaP = alfa === null ? null : comRho.filter(k => pbPassa(rho[k].p)).length;
  /* A contagem por CHAVE (a gravada; sem ela, a casca aplica os mesmos cortes): firme · pode ser sorte · sem relação clara. */
  const porChave = { firme: 0, pode_ser_sorte: 0, sem_diferenca: 0, sem: 0 };
  comRho.forEach(k => { const ch = pb6Chave(rho[k]).chave; porChave[ch || 'sem']++; });
  const passaQ = alfa === null ? null : porChave.firme;
  const fortes = comRho.filter(k => /com força$/.test(ptJunto(rho[k].rho)));
  const fortesConseq = fortes.filter(k => rho[k].consequencia_do_resultado === true);
  const nsRho = comRho.map(k => Number(rho[k].n)).filter(v => isFinite(v));
  const nMin = nsRho.length ? Math.min.apply(null, nsRho) : null;
  const nMax = nsRho.length ? Math.max.apply(null, nsRho) : null;
  /* Quantas vezes o mesmo clube aparece, contado nas temporadas — o limite "o mesmo clube conta
     várias vezes" sai com o número do arquivo, não com o que a declaração escreveu. */
  const porClube = {};
  temps.forEach(t => { if (t && t.clube) porClube[t.clube] = (porClube[t.clube] || 0) + 1; });
  const maxPorClube = Object.keys(porClube).length ? Math.max.apply(null, Object.values(porClube)) : null;
  const nClubes = Object.keys(porClube).length;
  /* Se algum número desenhado é do físico, pela família que o catálogo da etapa 2 grava. */
  const familia = {};
  ((ptDado() || {}).etapa_2 || { linhas: [] }).linhas.forEach(l => { if (l && l.indicador) familia[l.indicador] = l.familia; });
  const temFisico = ids.some(k => /^fisico/.test(String(familia[k] || '')));

  const abertura =
    '<p class="pt-nota">Cada quadradinho é um número medido. Cada bolinha dentro dele é <b>um time num ano</b> — ' +
      'são <b>' + ptInt(temps.length) + '</b> temporadas da Série B, de ' + periodo + '. <b>Na horizontal</b>, a ' +
      'posição do time naquele número, comparado com os outros times do mesmo ano (quanto mais para a direita, ' +
      '<b>maior o número naquele ano</b>, de ' + ptNum(escala.xlo, 0) + ' a ' + ptNum(escala.xhi, 0) +
      '; maior não quer dizer melhor: em xG contra ou cartões, mais à direita é sofrer mais ou levar mais). ' +
      '<b>Na vertical</b>, o aproveitamento de ' +
      'pontos <b>no mesmo ano</b> (de ' + ptNum(escala.ylo, 1) + '% a ' + ptNum(escala.yhi, 1) + '%). A escala é a ' +
      'mesma em todos os quadradinhos.' + (m.declaracao && m.declaracao.temporadas ? ptTecnico(esc(m.declaracao.temporadas)) : '') + '</p>' +
    '<p class="pt-nota"><b>A cor é o que o time fez naquele ano</b>: ' +
      ['sobe', 'cai', 'meio'].map(k => pb6NomeCor(k) + ', ' + esc(ptFxRot(k, { forma: 'quem' }))).join('; ') +
      '. Os quadradinhos vão <b>do número que mais anda junto com os pontos para o que menos</b>, e embaixo de ' +
      'cada um vai essa força escrita e se ela pode ser sorte.</p>';

  const legenda = '<div class="pt-controle pb6-legenda"><span class="pt-rot">As cores</span>' +
    '<p class="pt-nota">' +
    ['sobe', 'cai', 'meio'].map(k => '<span style="display:block">' + pb6Bola(k) + ' <b>' + pb6NomeCor(k) +
      '</b>: ' + esc(ptFxRot(k, { forma: 'quem' })) + ' — <b>' + ptInt(contaFx[k]) + '</b> ' +
      pbPl(contaFx[k], 'temporada', 'temporadas') + '</span>').join('') +
    (contaFx.sem
      ? ptFalta(ptInt(contaFx.sem) + ' ' + pbPl(contaFx.sem, 'temporada sem', 'temporadas sem') +
          ' faixa no arquivo: ' + pbPl(contaFx.sem, 'fica', 'ficam') + ' fora das cores')
      : '') +
    'As bolinhas têm contorno, para dois times no mesmo lugar não virarem um só. Embaixo de cada quadradinho, ' +
    'quantas bolinhas de cada cor ele desenha (número sem valor numa temporada tem menos bolinhas).</p></div>';

  const listaInteira = (function () {
    const x = li.com_p_menor_005;
    if (x === null || x === undefined || passaP === null) {
      return ptFaltaBloco('A lista inteira contra a sorte',
        alfa === null ? ((ptAlfaInfo() || {}).motivo || 'o arquivo não declara o corte de sorte do estudo')
          : 'o bloco do mesmo ano não grava quantos números passam do corte de sorte');
    }
    if (Number(x) !== passaP) {
      return ptFaltaBloco('A lista inteira contra a sorte',
        'a contagem gravada (' + ptInt(x) + ') não bate com a contagem pelo corte de sorte do estudo (' +
        ptInt(passaP) + '); a tela não diz qual das duas vale');
    }
    const s = li.sorteios, med = li.mediana_sorteio, ge = li.sorteios_com_contagem_maior_ou_igual, pe = li.p_excesso;
    const nDist = li.n_testes_distintos, xDist = li.com_p_menor_005_distintos;
    const temDist = nDist !== undefined && nDist !== null && xDist !== undefined && xDist !== null;
    const gruposMP = Array.isArray(m.grupos_mesmo_posto) ? m.grupos_mesmo_posto.filter(g => Array.isArray(g) && g.length > 1) : [];
    /* A frase principal conta os números DISTINTOS quando o gerador grava a conta: um par que dá a mesma
       ordem dos times é um teste só. O sorteio foi feito na lista com os repetidos, e por isso a frase do
       sorteio continua falando dela, com o tamanho dela dito. */
    const frasePrincipal = temDist
      ? 'Olhando um número de cada vez, <b>' + ptInt(xDist) + ' dos ' + ptInt(nDist) + '</b> números distintos ' +
        'andam junto com os pontos do ano com o p abaixo do corte.' +
        (gruposMP.length
          ? ' Alguns números aparecem com dois nomes e dão exatamente a mesma ordem dos times (' +
            gruposMP.map(g => g.map(k => esc(pbNome(k))).join(' e ')).join('; ') + '): cada grupo desses conta uma vez só. ' +
            'Com os nomes repetidos, a lista tem ' + ptInt(nTestes) + ' números, e ' + ptInt(x) + ' passam.'
          : '')
      : 'Olhando um número de cada vez, <b>' + ptInt(x) + ' dos ' + ptInt(nTestes) + '</b> ' +
        'andam junto com os pontos do ano com o p abaixo do corte.';
    const temSorteio = s !== undefined && s !== null && med !== undefined && med !== null;
    /* A lista pela CHAVE gravada (`lista`); sem ela, a casca usa o p do excesso. */
    const chLista = ptChaveLista(li);
    const excesso = chLista.chave === 'tem_mais_achados_que_a_sorte' ? true
      : chLista.chave === 'nao_tem_mais_achados_que_a_sorte' ? false : null;
    return '<div class="pt-controle"><span class="pt-rot">A lista inteira, dita uma vez</span>' +
      '<p class="pt-nota">' + frasePrincipal +
      (temSorteio
        ? ' Mas quando se testam muitos números, alguns passam por acaso. Para saber quantos, o estudo ' +
          'refez a conta <b>' + ptInt(s) + '</b> vezes trocando o aproveitamento entre os times do mesmo ano, ' +
          'como se os pontos não tivessem nada a ver com os números: o normal foi passarem <b>' + pbCheio(med) +
          '</b>' + (temDist ? ' (na lista de ' + ptInt(nTestes) + ', com os repetidos)' : '') + '. ' +
          (ge === 0
            ? 'Em nenhuma dessas vezes chegou a ' + ptInt(x) + '.'
            : ge !== undefined && ge !== null
              ? 'Chegou a ' + ptInt(x) + ' ou mais em ' + ptInt(ge) + ' ' + pbPl(ge, 'vez', 'vezes') + '.'
              : '') +
          (excesso === true
            ? ' <b>' + esc(pbMaiusc(ptListaSorte(li))) + '</b>: há relação de verdade entre boa parte destes ' +
              'números e os pontos do mesmo ano. Isso não diz de que lado a relação veio (ver o aviso abaixo).'
            : excesso === false
              ? ' <b>' + esc(pbMaiusc(ptListaSorte(li))) + '</b>: não dá para dizer que estes números andam ' +
                'junto com os pontos além do acaso.'
              : ' ' + ptFalta(chLista.motivo || 'o bloco não grava o p do excesso da lista'))
        : ' ' + ptFalta('o bloco não grava o sorteio da lista inteira')) +
      (passaQ !== null
        ? ' Contando que foram ' + ptInt(nTestes) + ' testes, <b>' + ptInt(porChave.firme) + '</b> ' +
          pbPl(porChave.firme, 'é firme', 'são firmes') + ', <b>' + ptInt(porChave.pode_ser_sorte) + '</b> ' +
          pbPl(porChave.pode_ser_sorte, 'pode ser sorte', 'podem ser sorte') + ' e <b>' + ptInt(porChave.sem_diferenca) +
          '</b> ' + pbPl(porChave.sem_diferenca, 'fica', 'ficam') + ' sem relação clara' +
          (porChave.sem ? ' (' + ptInt(porChave.sem) + ' sem medida de sorte)' : '') + '.'
        : '') +
      ptTecnico('p < ' + ptNum(alfa, 2) + ' em ' + ptInt(x) + ' de ' + ptInt(nTestes) +
        (temDist ? ' (distintos: ' + ptInt(xDist) + ' de ' + ptInt(nDist) + ')' : '') +
        (temSorteio ? ' · mediana do sorteio ' + ptNum(med, 1) + ' em ' + ptInt(s) + ' sorteios' : '') +
        (pe !== null && pe !== undefined ? ' · p do excesso ' + pb6P(pe) +
          (ge === 0 && s ? ' (o menor que ' + ptInt(s) + ' sorteios conseguem medir)' : '') : '') +
        (passaQ !== null ? ' · q < ' + ptNum(alfa, 2) + ' em ' + ptInt(passaQ) : '')) +
      '</p></div>';
  })();

  const limites = Array.isArray(m.declaracao && m.declaracao.limites) ? m.declaracao.limites : [];
  /* O aviso diz, em português de reunião, as ideias que o estudo declarou antes de medir. A lista
     crua da declaração vai junto, pequena, para quem quiser conferir: ela tem jargão ("p", "n",
     "independentes") que não pode estar no texto de leitura. Os números do aviso (quantas vezes o
     mesmo clube aparece, quantas temporadas cada número tem) saem do bloco, não da declaração. */
  const aviso = '<div class="pt-controle"><span class="pt-rot">Andar junto não diz o que veio antes</span>' +
    '<p class="pt-nota"><b>1. Não se sabe o que veio antes.</b> No mesmo ano, o número e os pontos saem ' +
      '<b>dos mesmos jogos</b>, e o time que está ganhando joga diferente (administra o placar, fica menos com a ' +
      'bola, sofre menos chutes). Então <b>todos</b> os números desta etapa misturam causa e consequência: não ' +
      'dá para saber se o número trouxe os pontos ou se os pontos trouxeram o número. Quem olha o que vem antes ' +
      'dos pontos é a ' + etapa7Txt + ', que mede o número no 1º turno contra os pontos do 2º; o quadradinho ' +
      'que passou nessa prova diz isso embaixo.</p>' +
    (fortes.length && fortesConseq.length
      ? '<p class="pt-nota">Em alguns deles o estudo já conhece o caminho do resultado para o número, e os marca ' +
        'como <b>efeito de estar ganhando ou perdendo</b>. Dos <b>' + ptInt(fortes.length) + '</b> ' +
        pbPl(fortes.length, 'número', 'números') + ' que andam junto com força, ' +
        pbPl(fortesConseq.length, 'este tem a marca', 'estes têm a marca') + ': ' +
        fortesConseq.map(k => esc(pbNome(k)) +
          (rho[k].motivo_consequencia ? ' (' + esc(rho[k].motivo_consequencia) + ')' : '')).join(', ') +
        '. A marca é um julgamento declarado antes de medir, não uma medida, e os que ficam sem ela não estão ' +
        'livres da mistura.</p>'
      : '') +
    '<p class="pt-nota"><b>2. O mesmo clube conta mais de uma vez.</b> ' +
      (maxPorClube !== null
        ? 'As ' + ptInt(temps.length) + ' temporadas são de ' + ptInt(nClubes) + ' ' + pbPl(nClubes, 'clube', 'clubes') +
          ', e um mesmo clube aparece em até <b>' + ptInt(maxPorClube) + '</b>. '
        : ptFalta('o bloco não diz o clube de cada temporada') + ' ') +
      'As temporadas de um mesmo clube se parecem entre si no jeito de jogar e no valor do elenco, então ' +
      ptInt(temps.length) + ' temporadas valem menos do que ' + ptInt(temps.length) + ' times diferentes, e o ' +
      '"firme" de cada quadradinho sai <b>otimista</b>.</p>' +
    '<p class="pt-nota"><b>3. Não é receita.</b> Os times que andaram mais alto num número fizeram mais ' +
      '(ou menos) pontos naquele ano; isso não garante que subir nesse número traga pontos.</p>' +
    (nMin !== null
      ? '<p class="pt-nota">' + (nMin === nMax
          ? 'Todos os números têm valor nas mesmas <b>' + ptInt(nMin) + '</b> temporadas' +
            (temFisico ? ', físico incluído' : '') + '.'
          : 'O número com menos temporadas tem <b>' + ptInt(nMin) + '</b> e o com mais, <b>' + ptInt(nMax) +
            '</b>; quanto menos temporadas, mais incerta a força.') + '</p>'
      : '') +
    (limites.length
      ? '<p class="pt-nota">' + ptTecnico('declarado antes de medir: ' + limites.map(t => esc(t)).join(' · ')) + '</p>'
      : '<p class="pt-nota">' + ptFalta('o bloco não grava os limites declarados') + '</p>') +
    '</div>';

  const minis = '<div class="pt-minis">' + ids.map(k => pb6Mini(m, k, escala, azuis7, nTestes, e7)).join('') + '</div>';

  const linhas = ids.map((k, i) => {
    const r = rho[k] || {};
    return {
      ordem: i + 1, nome: pbNome(k), id: k, rho: r.rho, q: r.q, n: r.n, r: r,
      _dica: pbSemNome(k) ? 'o catálogo da etapa 2 não conhece esta coluna — o que aparece é o id cru' : '',
    };
  });
  const fixa = 'a ordem por força é a da coluna "ordem", a ordem do estudo; esta coluna é frase e não se reordena';

  alvo.innerHTML =
    abertura +
    listaInteira +
    aviso +
    ptCard('Cada número contra os pontos do ano',
      ptInt(ids.length) + ' números · do que mais anda junto com os pontos para o que menos · a mesma escala em todos',
      legenda +
      (foraDaOrdem
        ? '<p class="pt-nota">' + ptFalta(ptInt(foraDaOrdem) + ' ' + pbPl(foraDaOrdem, 'número tem', 'números têm') +
            ' pontos mas não está na ordem gravada; ' + pbPl(foraDaOrdem, 'vai', 'vão') + ' no fim, na ordem das colunas do arquivo') + '</p>'
        : '') +
      (gravada ? '' : '<p class="pt-nota">' + ptFalta('o bloco não grava a ordem por força; as miniaturas seguem a ' +
          'ordem das colunas do arquivo') + '</p>') +
      minis,
      (semRho
        ? ptFalta(ptInt(semRho) + ' ' + pbPl(semRho, 'número fica', 'números ficam') + ' sem força medida; o ' +
            'motivo vai embaixo de cada quadradinho')
        : 'Todos os ' + ptInt(ids.length) + ' números têm a força medida.') +
      (m.regra_da_ordem ? ptTecnico(esc(m.regra_da_ordem)) : '')) +
    ptCard('Os ' + ptInt(ids.length) + ' números, um por linha',
      'na ordem gravada, do que mais anda junto com os pontos do ano para o que menos',
      ptTabela({
        id: 'ptEt-6-tab',
        el: alvo,
        colunas: [
          { k: 'ordem', rot: 'ordem', casas: 0, dica: 'posição na ordem por força do estudo' },
          { k: 'nome', rot: 'o que se mede', tipo: 'texto', dica: 'nome como aparece no catálogo da etapa 2' },
          { k: 'rho', rot: 'força com os pontos do ano', tipo: 'texto', ordenavel: false, motivoFixa: fixa,
            fmt: (v, l) => (v === null || v === undefined)
              ? ptFalta(l.r.motivo || 'sem força medida no arquivo')
              : esc(ptJunto(v)) + (pb6Sentido(v, l.r) ? ': ' + esc(pb6Sentido(v, l.r)) : '') + ptTecnico('ρ ' + ptNum(v, 3)) },
          { k: 'q', rot: 'firme ou sorte?', tipo: 'texto', ordenavel: false, motivoFixa: fixa,
            dica: 'firme: passa contando os muitos testes (q de Benjamini-Hochberg) · pode ser sorte: só o p passa',
            fmt: (v, l) => !pb6Chave(l.r).chave
              ? ptFalta(l.r.motivo || pb6Chave(l.r).motivo || 'sem medida de sorte no arquivo')
              : esc(ptSorte({ chave: l.r.sorte, p: l.r.p, q: l.r.q }, { objeto: 'relacao' })) +
                ptTecnico('q ' + pb6P(v) + ' · p ' + pb6P(l.r.p, l.r.p_rotulo)) },
          { k: 'n', rot: 'temporadas', casas: 0 },
          { k: 'id', rot: 'aviso', tipo: 'texto', ordenavel: false, motivoFixa: fixa,
            fmt: (v, l) => [pb6MarcaConseq(l.r), azuis7[v] ? '<b>' + esc(pb6RotE7(e7)) + '</b>' : '', pb6Gemeos(l.r)]
              .filter(Boolean).join(' · ') },
        ],
        linhas: linhas,
        vazio: 'o bloco do mesmo ano não traz nenhum número',
      }),
      'A coluna “ordem” guarda a ordem do estudo, para ela não se perder quando a tabela for reordenada por outra coluna.');
}

/* Rodapé da miniatura em --tinta2 (inline, sem mexer no style.css), como no cabeçalho da etapa 5:
   a 10px o --tinta3 do .pt-mini-num dava 3,4:1 no escuro e 2,8:1 no claro, e é justamente ali que
   estão a força escrita e o "pode ser sorte" que o dono pediu. O .pt-tec segue apagado. */
const PB6_RODAPE = ' style="color:var(--tinta2)"';
function pb6Mini(m, id, e, azuis7, nTestes, e7) {
  const temps = m.temporadas || [];
  const pts = (m.pontos || {})[id] || [];
  const r = (m.rho_mesmo_ano || {})[id] || {};
  const LADO = 100, M = 4, W = LADO + 2 * M;
  const px = v => M + (v - e.xlo) / (e.xhi - e.xlo) * LADO;
  const py = v => M + LADO - (v - e.ylo) / (e.yhi - e.ylo) * LADO;
  /* `pontos[id]` está alinhado com `temporadas`. Os cinzas vão por baixo e os coloridos por cima,
     para a cor não sumir atrás de um cinza no mesmo lugar. */
  const conta = { sobe: 0, cai: 0, meio: 0, sem: 0 };
  const camadas = { meio: [], sem: [], sobe: [], cai: [] };
  pts.forEach((x, i) => {
    const t = temps[i] || {};
    const y = t.aproveitamento_pct;
    if (x === null || x === undefined || y === null || y === undefined) return;
    const fx = pb6Faixa(t.faixa);
    const k = fx || 'sem';
    conta[k]++;
    const c = PB6_CORES[fx || 'meio'];
    const cor = fx === 'sobe' || fx === 'cai';
    camadas[k].push('<circle class="pb6-ponto" data-faixa="' + k + '" cx="' + px(x).toFixed(1) +
      '" cy="' + py(y).toFixed(1) + '" r="' + (cor ? '2.6' : '2.2') + '" fill="' + c.miolo +
      '" fill-opacity="' + (cor ? '0.85' : '0.45') + '" stroke="' + c.contorno + '" stroke-width="0.7"><title>' +
      esc((t.clube || 'clube não identificado') + ' ' + ptAno(t.ano) + ' · posição no ranking do ano ' +
        ptNum(x, 0) + ' · aproveitamento ' + ptNum(y, 1) + '% · ' +
        (fx ? ptFxRot(fx, { forma: 'verbo' }) : 'sem faixa no arquivo')) + '</title></circle>');
  });
  const bolas = camadas.meio.join('') + camadas.sem.join('') + camadas.sobe.join('') + camadas.cai.join('');
  const linhaCores = '<div class="pt-mini-num pb6-conta"' + PB6_RODAPE + '>' +
    ['sobe', 'cai', 'meio'].map(k => '<span data-faixa="' + k + '" title="' +
      esc('temporadas de ' + ptFxRot(k, { forma: 'quem' })) + '">' + pb6Bola(k, 8) + ' ' +
      ptInt(conta[k]) + '</span>').join(' · ') +
    (conta.sem ? ' · ' + ptFalta(ptInt(conta.sem) + ' sem faixa') : '') + '</div>';
  const svg = '<svg viewBox="0 0 ' + W + ' ' + W + '" role="img" aria-label="' +
      esc(pbNome(id) + ': posição no ranking do ano contra o aproveitamento do mesmo ano') + '">' +
    '<rect x="' + M + '" y="' + M + '" width="' + LADO + '" height="' + LADO + '" fill="none" stroke="var(--borda)"/>' +
    bolas + '</svg>';
  const temRho = r.rho !== null && r.rho !== undefined;
  const sentido = temRho ? pb6Sentido(r.rho, r) : '';
  return '<div class="pt-mini" data-ind="' + esc(id) + '" title="' + esc(ptDicaMedida(id)) + '">' +
    '<div class="pt-mini-tit">' + esc(pbNome(id)) + '</div>' +
    svg + linhaCores +
    '<div class="pt-mini-num"' + PB6_RODAPE + '>' +
      (temRho
        ? '<b style="color:var(--tinta)">' + esc(ptJunto(r.rho)) + '</b>' + (sentido ? ': ' + esc(sentido) : '') +
          ' · contando os ' + ptInt(nTestes) + ' testes, ' +
          (pb6Chave(r).chave ? esc(ptSorte({ chave: r.sorte, p: r.p, q: r.q }, { objeto: 'relacao' }))
            : ptFalta(pb6Chave(r).motivo || 'sem medida de sorte')) +
          ptTecnico('ρ ' + ptNum(r.rho, 2) + ' · p ' + pb6P(r.p, r.p_rotulo) + ' · q ' + pb6P(r.q) + ' · ' +
            ptInt(r.n) + ' temporadas')
        : ptFalta(r.motivo || 'o arquivo não traz a força deste número')) +
    '</div>' +
    (r.consequencia_do_resultado === true || azuis7[id]
      ? '<div class="pt-mini-num"' + PB6_RODAPE + '>' + [pb6MarcaConseq(r),
          azuis7[id] ? '<b>' + esc(pb6RotE7(e7)) + '</b>' : ''].filter(Boolean).join(' · ') + '</div>'
      : '') +
    (pb6Gemeos(r) ? '<div class="pt-mini-num" data-pb6-gemeo' + PB6_RODAPE + '>' + pb6Gemeos(r) + '</div>' : '') +
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
  pbLegivel(alvo);
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
  /* A família são os números medidos por turno. O q gravado (`q_parcial`) e a chave (`sorte`) valem para
     o parcial; o bruto não tem q, e sai "pode ser sorte, sem a conta dos N testes" quando o p passa. */
  const nT = linhas.length;
  const ch7 = pb7Chaves(linhas);

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
        esc(ptSorte(ref.p, null, { unico: true, objeto: 'relacao' })) + ', um teste só).' +
        ptTecnico('ρ = ' + ptNum(ref.rho, 3) + ' · ' + ptP(ref.p)) +
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
            ' (' + esc(ptJunto(maior.rho_parcial)) + ', ' + esc(pb7Sorte(maior, nT)) + ').' +
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
        ' passam no corte sem descontar os pontos do 1º turno, ' + pbConta(passaParcial) + ' descontando · ' +
        ptInt(ch7.firme) + ' ' + pbPl(ch7.firme, 'firme', 'firmes') + ' contando os ' + ptInt(nT) + ' testes',
      ptTabela({
        id: 'ptEt-7-tab',
        ordem: { col: 'abs', dir: 'desc' },
        colunas: [
          { k: 'nome', rot: 'número (média do 1º turno)', tipo: 'texto' },
          { k: 'n', rot: 'times', casas: 0 },
          { k: 'rho_bruto', rot: 'com os pontos do 2º turno', dica: 'ρ bruto',
            fmt: v => esc(ptJunto(v)) + ptTecnico('ρ ' + ptNum(v, 3)) },
          { k: 'p_bruto', rot: 'firme ou sorte?', dica: 'p-valor do ρ bruto; sem q gravado, não passa de "pode ser sorte"',
            fmt: v => ptSorteHtml(v, null, { nTestes: nT, objeto: 'relacao' }) },
          { k: 'rho_parcial', rot: 'descontados os pontos do 1º turno', dica: 'ρ parcial',
            fmt: v => esc(ptJunto(v)) + ptTecnico('ρ ' + ptNum(v, 3)) },
          { k: 'p_parcial', rot: 'firme ou sorte? (descontados os pontos do 1º turno)',
            dica: 'firme: q do ρ parcial, contando os testes por turno · pode ser sorte: só o p passa',
            fmt: (v, l) => pb7SorteHtml(l, nT) },
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
      'Dos <b>' + ptInt(linhas.length) + '</b>, <b>' + pbConta(passaBruto) + '</b> passam no corte olhando um ' +
      'de cada vez, e <b>' + pbConta(passaParcial) + '</b> continuam passando depois de descontar os pontos do ' +
      '1º turno. A queda de uma conta para a outra é o assunto desta etapa. Contando os ' + ptInt(nT) + ' testes, ' +
      'descontados os pontos do 1º turno: <b>' + ptInt(ch7.firme) + '</b> ' + pbPl(ch7.firme, 'é firme', 'são firmes') +
      ', <b>' + ptInt(ch7.pode_ser_sorte) + '</b> ' + pbPl(ch7.pode_ser_sorte, 'pode ser sorte', 'podem ser sorte') +
      ' e <b>' + ptInt(ch7.sem_diferenca) + '</b> ' + pbPl(ch7.sem_diferenca, 'fica', 'ficam') + ' sem relação clara' +
      (ch7.sem ? ' (' + ptInt(ch7.sem) + ' sem medida de sorte)' : '') + '.' +
      ptTecnico('corte: p < α = ' + (alfa === null ? '?' : ptNum(alfa, 2)) + ' · firme: q < α') +
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
              : ': nenhum deles passa no corte depois do desconto, então fica sem relação clara, para lado nenhum.')
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

/* A chave de sorte do ρ parcial: a gravada (`sorte`, com `q_parcial`); sem ela, a casca aplica os
   mesmos cortes, e sem q o "pode ser sorte" leva a nota "sem a conta dos N testes". */
function pb7ArgSorte(l) {
  const o = { chave: l && l.sorte, p: l && l.p_parcial };
  if (l && l.q_parcial !== undefined && l.q_parcial !== null) o.q = l.q_parcial;
  return o;
}
function pb7Sorte(l, nT) { return ptSorte(pb7ArgSorte(l), { nTestes: nT, objeto: 'relacao' }); }
function pb7SorteHtml(l, nT) { return ptSorteHtml(pb7ArgSorte(l), { nTestes: nT, objeto: 'relacao' }); }
function pb7Chaves(linhas) {
  const c = { firme: 0, pode_ser_sorte: 0, sem_diferenca: 0, sem: 0 };
  linhas.forEach(l => { const k = ptChaveSorte(pb7ArgSorte(l), { nTestes: linhas.length }).chave; c[k || 'sem']++; });
  return c;
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
      '<title>' + esc(l.nome + ' · 1º turno com os pontos do 2º: ' + ptJunto(l.rho_bruto) + ', ' +
        ptSorte(l.p_bruto, null, { nTestes: linhas.length, objeto: 'relacao' }) +
        ' · só entre times com pontos parecidos no 1º turno: ' + ptJunto(l.rho_parcial) + ', ' + pb7Sorte(l, linhas.length) +
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
      '<b style="color:var(--pt-alto)">azul</b> (' + ptInt(azuis) + '): na direção esperada, e continua abaixo do ' +
      'corte depois do desconto' + (function () {
        const az = pb7Chaves(linhas.filter(l => l.sinal_certo && pbPassa(l.p_parcial)));
        return azuis ? ' (contando os ' + ptInt(linhas.length) + ' testes: ' + ptInt(az.firme) + ' ' +
          pbPl(az.firme, 'firme', 'firmes') + ', ' + ptInt(az.pode_ser_sorte) + ' ' +
          pbPl(az.pode_ser_sorte, 'pode ser sorte', 'podem ser sorte') + ')' : '';
      })() + ' · <b style="color:var(--tinta3)">cinza</b> (' + ptInt(cinzas) + '): na direção ' +
      'esperada, mas descontados os pontos do 1º turno fica sem relação clara · <b style="color:var(--pt-baixo)">laranja</b> (' +
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
  pbLegivel(alvo);
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
        ' · sorteio fácil ' + ptNum(l.emb_med, 3) + ' (' + ptSorte(l.emb_p, null, { unico: true, objeto: 'separacao' }) +
        ', ' + ptP(l.emb_p) + ')' +
        ' · sorteio justo ' + ptNum(l.cov_med, 3) + ' (' + ptSorte(l.cov_p, null, { unico: true, objeto: 'separacao' }) +
        ', ' + ptP(l.cov_p) + ')' +
        ' · silhueta; nulos de colunas embaralhadas e de mesma covariância') + '</title>';
  }).join('');
  const fim = T + linhas.length * ALT;
  const svg = pbSvg(L + LARG + 24, fim + 20,
    pbTxt(L, T - 12, 'separação real ●   sorteio fácil ▏ (laranja)   sorteio justo ▏ (verde)',
      { tam: 9.5, cor: 'var(--tinta3)' }) + barras +
    pbTxt(px(lo), fim + 14, ptNum(lo, 2), { anc: 'middle', tam: 9 }) +
    pbTxt(px(hi), fim + 14, ptNum(hi, 2), { anc: 'middle', tam: 9 }), 470);

  /* Cada linha é um teste único declarado (a tentativa contra um sorteio): q = p, e a frase é
     "firme" ou "sem separação clara". A cor lê a CHAVE, não o texto. */
  const sepUnico = v => ptSorte(v, null, { unico: true, objeto: 'separacao' });
  const sorteNaCel = v => (ptChaveSorte(v, null, { unico: true }).chave === 'firme'
    ? '<b style="color:var(--pt-baixo)">' + esc(sepUnico(v)) + '</b>'
    : esc(sepUnico(v))) + ptTecnico(ptP(v));
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
        { k: 'emb_p', rot: 'contra o fácil, a separação é firme?', dica: 'p do nulo de colunas embaralhadas (teste único)', fmt: sorteNaCel },
        { k: 'cov_med', rot: 'sorteio justo: separação típica', dica: 'mediana do nulo de mesma covariância',
          fmt: v => ptNum(v, 3) },
        { k: 'cov_p', rot: 'contra o justo, a separação é firme?', dica: 'p do nulo de mesma covariância (teste único)',
          fmt: v => '<b>' + sorteNaCel(v) + '</b>' },
        { k: 'replicas', rot: 'sorteios', casas: 0 },
      ],
      linhas: linhas,
      vazio: 'nenhuma tentativa registrada',
    }),
    'Os dois sorteios ficam lado a lado porque a diferença entre eles <b>é</b> o resultado. Contra o ' +
    'sorteio fácil, <b>' + pbConta(rejEmb) + ' das ' + ptInt(linhas.length) + '</b> tentativas parecem ter ' +
    'grupo (firme contra o sorteio fácil). Contra o justo, <b>' + pbConta(rejCov) + '</b>. O sorteio fácil não ' +
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
      extra: v >= estavel ? 'estável' : (v < dissolve ? 'se desfaz' : 'entre as duas linhas'),
    })).join('')).join('');
  /* "estável" e não "firme": aqui é estabilidade de grupo (linhas de Hennig), sem nada a ver com sorte;
     "firme" fica reservado para a chave de sorte da aba. */
  return ptCard('O segundo teste: o grupo sai igual quando se refaz a conta?',
    'estável: reaparece pelo menos ' + ptPct(estavel * 100, 0) + ' igual · se desfaz: abaixo de ' +
      ptPct(dissolve * 100, 0) + ptTecnico('Jaccard de bootstrap · linhas de Hennig ' + ptNum(estavel, 2) +
      ' e ' + ptNum(dissolve, 2)),
    '<p class="pt-nota">Refaz-se a conta muitas vezes, com os dados sorteados de novo, e vê-se quanto ' +
    'cada grupo reaparece igual. A barra é essa porcentagem.</p>' + corpo,
    'De <b>' + ptInt(todos.length) + '</b> ' +
    pbPl(todos.length, 'grupo testado', 'grupos testados') + ' em todas as tentativas, <b>' +
    ptInt(acima) + '</b> ' + pbPl(acima, 'chega', 'chegam') + ' à linha de estável e <b>' + ptInt(abaixo) +
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

/* Se a caixa é tipo é o que o gerador GRAVOU em `status`, no vocabulário do próprio
   arquivo (`TIPO` = passa no teste contra as outras caixas; `DESCRITIVO` = só descrição). A tela
   não refaz a conta com p e corte. Status fora desse vocabulário devolve null, e quem chama
   escreve que não reconhece — em vez de encaixá-lo num dos dois lados. */
function pb8EhTipo(g) {
  const s = String((g && g.status) || '').toUpperCase();
  if (s === 'TIPO') return true;
  if (s === 'DESCRITIVO') return false;
  return null;
}
/* Quando o p gravado e o corte gravado dariam o contrário do status, a tela mostra a discordância
   e diz qual vale. Não arbitra: vale o status, porque é ele que o gerador publicou. */
function pb8ContaDiscorda(g) {
  const f = pb8EhTipo(g);
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
  const firmes = grupos.filter(g => pb8EhTipo(g) === true);
  const soDescricao = grupos.filter(g => pb8EhTipo(g) === false);
  const desconhecidos = grupos.filter(g => pb8EhTipo(g) === null);
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
            'contra as outras (firme, num teste só por caixa)'
          : 'nenhuma passa no teste de cada caixa contra as outras') +
        (soDescricao.length
          ? '; ' + nomesDe(soDescricao) + ' ' + pbPl(soDescricao.length, 'é', 'são') + ' <b>só descrição</b> — ' +
            soDescricao.map(g => 'com ' + ptInt(g.n) + ' times, ' +
              esc(ptSorte(g.p_um_contra_o_resto, null, { unico: true, objeto: 'separacao' })))
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
            ? ' A separação das caixas passa no sorteio justo (' +
              esc(ptSorte(sil.p, null, { unico: true, objeto: 'separacao' })) + '): veja o teste e a ' +
              'lista do que não passou, mais abaixo.'
            : ' E a separação das caixas não passa no sorteio justo (' +
              esc(ptSorte(sil.p, null, { unico: true, objeto: 'separacao' })) + '): a divisão ' +
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

  const firme = pb8EhTipo(g);
  const discorda = pb8ContaDiscorda(g);
  const veredito = firme === true
    ? 'passa no teste contra as outras caixas'
    : firme === false
      ? 'só descrição: ' + ptSorte(g.p_um_contra_o_resto, null, { unico: true, objeto: 'separacao' })
      : 'status gravado que a tela não reconhece: ' + String(g.status);
  /* Um teste único por caixa (esta contra as outras): q = p, frase "firme" ou "sem separação clara". */
  const sorteCaixa = esc(ptSorte(g.p_um_contra_o_resto, null, { unico: true, objeto: 'separacao' }));

  const nota =
    '<b>Esta caixa contra todas as outras juntas:</b> ' + esc(ptAcaso(g.p_um_contra_o_resto)) + ' — ' +
    (firme === true
      ? '<b>' + sorteCaixa + '</b>, e o estudo a registrou como tipo. Por isso conta ' +
        'como tipo, dentro das ressalvas desta etapa: a separação das caixas e a lista do que não passou.'
      : firme === false
        ? '<b>' + sorteCaixa + '</b>, e o estudo a registrou como <b>só descrição</b>: ' +
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
    /* Uma coluna só, pela chave única: firme (q < α, contando os números testados) · pode ser sorte
       (só o p passa) · sem separação clara. O p e o q ficam no número técnico. */
    { k: 'q', rot: 'firme ou sorte? (contando os ' + ptInt(porInd.length) + ' testes)',
      dica: 'q de Benjamini-Hochberg; o p vai ao lado',
      fmt: (v, l) => ptSorteHtml(l.p, l.q, { objeto: 'separacao' }) },
  ].concat(gs.map(g => ({
    k: 'g_' + g, rot: 'posição de ' + g + ' no ranking',
    cel: (v, l) => ptCel(v, { casas: 1, sinal: 0, texto: ptNum(v, 0),
      motivo: 'sem posição para ' + g + ' em ' + l.col }),
  })));

  return ptCard('O teste de fora: as caixas aparecem em números que não as construíram?',
    ptInt(f.indicadores) + ' números testados · ' + ptInt(f.sobrevivem_bh5) + ' ' +
      pbPl(f.sobrevivem_bh5, 'firme', 'firmes') + ', contando os muitos testes',
    '<p class="pt-nota">Pega-se cada número que ficou de fora da montagem e pergunta-se: saber a caixa do ' +
      'time ajuda a adivinhar esse número? Em média, a caixa <b>explica ' + pbExplica(f.eta2_medio_obs) +
      '</b> da diferença entre os times. Com caixas sorteadas ao acaso, explicaria ' +
      pbExplica(f.eta2_medio_nulo_rotulo) + ' (' + esc(ptSorte(f.p_rotulo, null, { unico: true, objeto: 'separacao' })) + ').' +
      ptTecnico('eta² ' + ptNum(f.eta2_medio_obs, 3) + ' contra ' + ptNum(f.eta2_medio_nulo_rotulo, 3) +
        ' · ' + ptP(f.p_rotulo)) +
      ' Com o <b>sorteio de comparação mais duro</b> — ' + ptInt(f.placebo_particoes) + ' divisões feitas ' +
      'ordenando os times por outros números reais de futebol —, explicaria ' +
      pbExplica(f.eta2_medio_nulo_placebo) + ' (' + esc(ptSorte(f.p_placebo, null, { unico: true, objeto: 'separacao' })) + ').' +
      ptTecnico('nulo placebo ' + ptNum(f.eta2_medio_nulo_placebo, 3) + ' · ' + ptP(f.p_placebo)) +
      ' O duro é o que importa: ele respeita a ligação natural entre os números, que o sorteio fácil ' +
      'apaga. E quando se testa muita coisa, alguma dá certo por sorte; contando os muitos testes, <b>' +
      ptInt(f.sobrevivem_bh5) + '</b> ' + pbPl(f.sobrevivem_bh5, 'número é firme', 'números são firmes') +
      ', e <b>' + ptInt(f.sobrevivem_bh10) + '</b> passariam se o corte fosse o mais frouxo' +
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
            esc(ptSorte(pJulga, null, { unico: true, objeto: 'separacao' })) + ')' +
            (peloPlacebo
              ? '; contra o sorteio fácil, ' + pbExplica(limpa.eta2_medio_nulo) + ' (' +
                esc(ptSorte(limpa.p, null, { unico: true, objeto: 'separacao' })) + ')'
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
  /* (15/09) O recorte "descontado o dinheiro" (`dinheiro.residualizado`) saiu do estudo e da tela. Ficam
     os dois testes do valor do elenco contra as caixas e a divisão rival: descrevem o valor, não descontam. */
  const rival = din.particao_rival_so_dinheiro || {};
  const sepU = v => ptSorte(v, null, { unico: true, objeto: 'separacao' });
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
  const sortePerm = sepU(din.p_permutacao), sorteKrus = sepU(din.p_kruskal);
  const chPerm = ptChaveSorte(din.p_permutacao, null, { unico: true }).chave;
  const chKrus = ptChaveSorte(din.p_kruskal, null, { unico: true }).chave;
  const dinheiroHtml =
    '<div class="pt-cf-grade">' +
      '<div class="pt-cf-l"><span>quanto a caixa explica do ranking de valor do elenco</span><b>' +
        pbExplica(din.eta2_posto_valor) + ptTecnico('eta² ' + ptNum(din.eta2_posto_valor, 3)) + '</b></div>' +
      '<div class="pt-cf-l"><span>a separação pelo valor é firme? (sorteio de comparação)</span><b>' + esc(sortePerm) +
        ptTecnico('permutação ' + ptP(din.p_permutacao)) + '</b></div>' +
      '<div class="pt-cf-l"><span>a separação pelo valor é firme? (segundo teste)</span><b>' + esc(sorteKrus) +
        ptTecnico('Kruskal ' + ptP(din.p_kruskal)) + '</b></div>' +
      '<div class="pt-cf-l"><span>divisão rival feita só com o valor do elenco: quanto explica dos números de fora</span><b>' +
        pbExplica(rival.eta2_medio) + ' contra ' + pbExplica(rival.eta2_medio_nulo) + ' do sorteio · ' +
        esc(sepU(rival.p)) + ptTecnico('eta² ' + ptNum(rival.eta2_medio, 3) + ' · ' + ptP(rival.p)) +
        '</b></div>' +
    '</div>' +
    '<p class="pt-nota">Os dois testes do valor do elenco ' +
      (chPerm !== chKrus
        ? '<b>discordam</b>: um diz "' + esc(sortePerm) + '", o outro diz "' + esc(sorteKrus) + '". Os dois ' +
          'estão na tela. Com ' + nPlano + ' times, a diferença entre eles é a amostra pequena falando. '
        : 'dizem o mesmo: "' + esc(sortePerm) + '". ') +
      'O teste que decide é outro: uma divisão rival montada <b>só</b> com o ranking de valor explica os ' +
      'números de fora em ' + pbExplica(rival.eta2_medio) + ', contra ' + pbExplica(rival.eta2_medio_nulo) +
      ' do sorteio (' + esc(sepU(rival.p)) + ')' +
      (pbPassa(rival.p) ? '.' : ' — não se viu o valor do elenco sozinho reproduzir estas caixas.') + '</p>' +
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
              ? 'Pressão e valor do elenco: <b>elenco mais caro pressiona ' + (rho > 0 ? 'mais' : 'menos') +
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
          ' · ' + esc(sepU((sil.nulo_mesma_covariancia || {}).p)) +
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
      ? '<p class="pt-nota">Estes ' + ptInt(jacN) + ' números <b>não medem a estabilidade das ' +
        ptInt(nGrupos.length) + ' caixas</b>, e ler o menor deles como "a caixa tal se desfaz" é trocar uma ' +
        'coisa pela outra. A conta é refeita ' + ptInt(jac.replicas) + ' vezes pedindo ' + ptInt(jac.k) +
        ' grupos a um programa de agrupar, e mede os grupos que ele mesmo encontrou: os dele têm tamanhos <b>' +
        jacT.map(v => ptInt(v)).join('/') + '</b>, as caixas têm <b>' + nGrupos.map(v => ptInt(v)).join('/') +
        '</b> — não são as mesmas. O que estes números dizem é que um agrupamento assim mal sobrevive a ' +
        'refazer a conta; a estabilidade das caixas é a das linhas acima, tirar um time e tirar um número.</p>'
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
            esc(sepU((sil.nulo_mesma_covariancia || {}).p)) + ').</p>'
          : 'A separação das caixas é o teste que <b>não passa</b> (' +
            esc(sepU((sil.nulo_mesma_covariancia || {}).p)) + ')' +
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
          '<div class="pt-cf-l"><span>físico: firmes, contando os muitos testes</span><b>' +
            ptInt(fis.sobrevivem_bh5) + ptTecnico('Benjamini-Hochberg · menor q ' + ptNum(fis.menor_q_bh, 3)) +
            '</b></div>'
        : '') +
      /* `formacao.n` é o tamanho da amostra (clubes, jogos, fonte), não um teste: sem eta² a
         chave não é linha de achado negativo e não vira uma célula "sem medida" que não existe. */
      Object.keys(form).filter(k => form[k] && form[k].eta2 !== undefined)
        .map(k => '<div class="pt-cf-l"><span title="' + esc(k) + '">formação · ' + esc(ptNomeMedida(k)) +
        ': quanto a caixa explica</span><b>' + pbExplica(form[k].eta2) + ' · ' + esc(sepU(form[k].p)) +
        ptTecnico('eta² ' + ptNum(form[k].eta2, 3) + ' · ' + ptP(form[k].p)) + '</b></div>').join('') +
      andares.map(k => '<div class="pt-cf-l"><span title="' + esc(k) + '">' + esc(andarNome(k)) +
        ': quanto o jeito de a bola chegar explica</span><b>' +
        pbExplica(and[k].eta2_medio) + ' · ' + esc(sepU(and[k].p)) + ' · ' + ptInt(and[k].n) + ' times' +
        ptTecnico('eta² ' + ptNum(and[k].eta2_medio, 3) + ' · ' + ptP(and[k].p)) + '</b></div>').join('') +
    '</div>' +
    '<p class="pt-nota">' +
      (fis.sobrevivem_bh5 === 0
        ? '<b>Nenhum</b> dos ' + ptInt(fis.colunas) + ' números físicos é firme contando os muitos testes: ' +
          'não se viu diferença física entre as caixas, e a tela não pode ser usada para ' +
          'dizer "a caixa tal corre mais". '
        : fis.sobrevivem_bh5 === undefined
          ? ptFalta('o arquivo não diz quantos números físicos são firmes contando os muitos testes (fisico.sobrevivem_bh5)') + ' '
          : '<b>' + ptInt(fis.sobrevivem_bh5) + '</b> dos ' + ptInt(fis.colunas) + ' números físicos são firmes ' +
            'contando os muitos testes. ') +
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
            '</b> (' + esc(sepU(and[k].p)) + ', ' + ptInt(and[k].n) + ' times)').join('; ') + '.'
        : ptFalta('o arquivo não traz o teste da rota dentro de cada faixa de território (andares)')) + '</p>';

  return ptCard('As caixas são só o valor do elenco com nome de tática?', 'com o número, não com o adjetivo',
    dinheiroHtml) +
    ptCard('Estabilidade: quanto as caixas mudam quando se mexe na amostra',
      ptInt(tirarTime.length) + ' testes tirando um time · ' + ptInt(tirarInd.length) + ' tirando um número',
      estabHtml) +
    ptCard('O que estas caixas não deixam dizer', 'os achados negativos, em número',
      negativos);
}
