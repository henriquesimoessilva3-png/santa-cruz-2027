/* 19/10/2026 — Importar lista (Excel) → campograma novo. Pedido do Henrique: "subir um Excel e ele gerar um campograma
   completo com todos os jogadores", no modelo da lista de alvos (Santa Cruz V2/listas/Alvos Santa Cruz 2027 - v5).
   Colunas lidas pelo nome do cabeçalho (a ordem não importa): Posição (GK, RB, RCB, LCB, LB, DM, CM, AM, RW, LW, CF —
   as siglas do campograma), Prioridade, Jogador, Time, Salário (mil R$), Nascimento, Fim de contrato, Empresário, Comentário.
   Cada linha vira um card na posição: o jogador é procurado na base do app pelo nome (ou apelido) e conferido pelo
   clube, pela idade (nascimento) e pela posição — CHECK DE IDENTIDADE: só entra ligado à base quem bate no clube ou
   na idade; quem não bate entra como card manual (nome, clube, idade, contrato, salário) e aparece no relatório.
   O grupo novo abre na tela; fica gravado ao clicar em Salvar (como qualquer grupo). */
(function () {
  'use strict';
  const nz = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const STOP = new Set(['ec', 'fc', 'sc', 'aa', 'cr', 'club', 'clube', 'se', 'cd', 'cf', 'de', 'do', 'da', 'u20', 'u23', 'fec', 'ad', 'esporte', 'futebol', 'pelo', 'emprestado', 'vinculado', 'ao', 'com', 'sem', 'livre', 'por', 'e', 'pela', 'emp', 'atletico']);
  const tok = s => nz(s).split(' ').filter(t => t.length > 1 && !STOP.has(t));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const GEMEAS = { LD: ['LD', 'LE'], LE: ['LD', 'LE'], ZD: ['ZD', 'ZE'], ZE: ['ZD', 'ZE'], ED: ['ED', 'EE', 'CA'], EE: ['ED', 'EE', 'CA'], CA: ['CA', 'ED', 'EE'], VOL: ['VOL', 'MED'], MED: ['MED', 'VOL', 'MEI'], MEI: ['MEI', 'MED'], GOL: ['GOL'] };

  function dataISO(v) {
    if (v == null || v === '') return '';
    if (v instanceof Date && !isNaN(v)) return v.toISOString().slice(0, 10);
    if (typeof v === 'number' && v > 20000 && v < 80000) return new Date(Math.round((v - 25569) * 864e5)).toISOString().slice(0, 10);   /* serial do Excel */
    const s = String(v).trim();
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return m[0];
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); if (m) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
    return '';
  }
  const idadeDe = iso => { if (!iso) return null; const n = new Date(iso + 'T12:00:00'), h = new Date(); let a = h.getFullYear() - n.getFullYear(); if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) a--; return a; };

  /* acha o jogador na base: nome igual (nome curto ou completo); confere clube, idade e posição */
  function achar(nome, time, idade, pos) {
    if (typeof BASE === 'undefined' || !BASE.length) return { b: null, motivo: 'base não carregada' };
    const dica = (nome.match(/\(([^)]*)\)/) || [])[1] || '';            /* "Ronald (Criciúma)": o clube entre parênteses ajuda */
    const n0 = nz(nome.replace(/\(.*?\)|\?/g, ''));
    if (!n0) return { b: null, motivo: 'sem nome' };
    const ct = tok(time + ' ' + dica);
    const cands = BASE.filter(b => { const a = nz(b.n), c = nz(b.nc); return a === n0 || c === n0 || (n0.includes(' ') && (c.includes(n0) || a.includes(n0))); });
    if (!cands.length) return { b: null, motivo: 'nome não está na base' };
    const pts = cands.map(b => {
      const clube = tok(b.t).some(t => ct.includes(t));
      const idd = idade != null && b.id_ != null && Math.abs(b.id_ - idade) <= 1;
      const posOk = (GEMEAS[pos] || [pos]).includes(b.p);
      return { b, clube, idd, posOk, s: (clube ? 3 : 0) + (idd ? 2 : 0) + (posOk ? 1 : 0) + ((b.min || 0) > 0 ? 0.3 : 0) + Math.min(0.2, (b.min || 0) / 20000) };
    }).sort((x, y) => y.s - x.s);
    const t = pts[0];
    if (!(t.clube || (t.idd && t.posOk))) return { b: null, motivo: 'achei ' + cands.length + ' com esse nome, nenhum bate no clube nem na idade', cands: pts.slice(0, 3).map(x => x.b) };
    return { b: t.b, conf: [t.clube ? 'clube' : '', t.idd ? 'idade' : '', t.posOk ? 'posição' : ''].filter(Boolean).join(' + ') };
  }

  /* linhas = [{Posição, Prioridade, Jogador, ...}] (cabeçalho da planilha como chave) */
  function montar(linhas, nomeGrupo) {
    const SIG = {}; POSICOES.forEach(p => { SIG[p.sig] = p.c; SIG[p.c] = p.c; });
    const col = (l, ...nomes) => { for (const n of nomes) { const k = Object.keys(l).find(x => nz(x) === nz(n)); if (k != null && l[k] !== '' && l[k] != null) return l[k]; } return ''; };
    const novo = novoEstado(); novo.nome = nomeGrupo;
    ['teto', 'comissao', 'fator', 'limiteEstrangeiros', 'cotacaoEuro', 'metas', 'orientacao', 'denso', 'tema', 'zoom'].forEach(k => { if (estado && estado[k] != null) novo[k] = JSON.parse(JSON.stringify(estado[k])); });
    const rel = { ok: [], manual: [], semPos: [] };
    const porPos = {};
    linhas.forEach((l, i) => {
      const nome = String(col(l, 'Jogador', 'Nome', 'Atleta')).trim(); if (!nome) return;
      const pos = SIG[String(col(l, 'Posição', 'Posicao', 'Pos')).trim().toUpperCase()];
      if (!pos) { rel.semPos.push(nome); return; }
      const time = String(col(l, 'Time', 'Clube')).trim();
      const nasc = dataISO(col(l, 'Nascimento', 'Data de nascimento'));
      const idade = idadeDe(nasc) ?? (parseInt(col(l, 'Idade')) || null);
      const sal = parseFloat(String(col(l, 'Salário (mil R$)', 'Salario (mil R$)', 'Salário')).replace(',', '.')) || 0;
      const ctr = dataISO(col(l, 'Fim de contrato', 'Contrato'));
      const prio = parseFloat(col(l, 'Prioridade')) || 999;
      (porPos[pos] = porPos[pos] || []).push({ i, nome, pos, time, idade, sal, ctr, prio, emp: String(col(l, 'Empresário', 'Empresario')).trim(), com: String(col(l, 'Comentário', 'Comentario', 'Obs')).trim() });
    });
    Object.entries(porPos).forEach(([pos, xs]) => {
      xs.sort((a, b) => a.prio - b.prio || a.i - b.i);
      xs.forEach((x, k) => {
        const r = achar(x.nome, x.time, x.idade, pos), j = r.b;
        const salario = x.sal ? Math.round(x.sal * (x.sal < 2000 ? 1000 : 1)) : 0;
        const card = j ? {
          uid: uid(), jid: j.id, pk: primaryKey(j), nome: j.n, nomeCompleto: j.nc || '', clube: x.time || j.t, liga: j.l, idade: j.id_ ?? x.idade,
          ov: j.ov, contrato: x.ctr || j.ct, posOrig: j.p, salario, sugerido: 0, nac: j.nac || '', psp: j.psp || '', estrangeiro: ehEstrangeiroBase(j),
          status: 'alvo', titular: k === 0, ...(j.manual ? { manual: 1, muid: j.muid } : {}),
        } : {
          uid: uid(), jid: null, manual: 1, nome: x.nome.replace(/\s*\?$/, ''), clube: x.time || 'sem clube', liga: '', idade: x.idade, ov: null, contrato: x.ctr,
          posOrig: pos, salario, nac: 'Brazil', estrangeiro: false, psp: '', status: 'alvo', titular: k === 0,
        };
        if (x.com) card.obs = x.com;
        novo.elenco[pos].push(card);
        if (x.emp) { const ch = card.pk ? 'pk:' + card.pk : 'uid:' + card.uid; novo.emp[ch] = Object.assign(novo.emp[ch] || {}, { empresario: x.emp }); }
        (j ? rel.ok : rel.manual).push({ nome: x.nome, pos, time: x.time, base: j ? j.n + ' · ' + j.t + ' · ' + j.l : '', conf: r.conf || '', motivo: r.motivo || '', cands: (r.cands || []).map(b => b.n + ' · ' + b.t + ' · ' + b.l) });
      });
    });
    return { novo, rel };
  }

  function relatorio(rel, nome) {
    let m = document.getElementById('modalImport');
    if (!m) { m = document.createElement('div'); m.id = 'modalImport'; m.className = 'imp-modal'; document.body.appendChild(m); }
    const pos = c => (POSICOES.find(p => p.c === c) || {}).sig || c;
    m.innerHTML = '<div class="imp-caixa"><button class="imp-x" title="fechar">×</button><h3>Lista importada: ' + esc(nome) + '</h3>' +
      '<p><b>' + rel.ok.length + '</b> ligados à base do app · <b>' + rel.manual.length + '</b> entraram como card manual' + (rel.semPos.length ? ' · <b>' + rel.semPos.length + '</b> sem posição reconhecida (fora)' : '') +
      '. O grupo já está aberto no campograma — confira e clique em <b>Salvar</b> para gravar.</p>' +
      (rel.manual.length ? '<h4>Cards manuais (não achei com segurança na base)</h4><ul>' + rel.manual.map(x => '<li><b>' + esc(x.nome) + '</b> · ' + pos(x.pos) + ' · ' + esc(x.time || '—') + ' — ' + esc(x.motivo) + (x.cands.length ? ' <small>(candidatos: ' + esc(x.cands.join(' | ')) + ')</small>' : '') + '</li>').join('') + '</ul>' : '') +
      '<details><summary>Ligados à base — conferir a identidade (' + rel.ok.length + ')</summary><ul>' + rel.ok.map(x => '<li><b>' + esc(x.nome) + '</b> (' + pos(x.pos) + ', ' + esc(x.time || '—') + ') → ' + esc(x.base) + ' <small>· bateu ' + esc(x.conf) + '</small></li>').join('') + '</ul></details>' +
      (rel.semPos.length ? '<p class="imp-fora">Sem posição: ' + esc(rel.semPos.join(', ')) + '</p>' : '') + '</div>';
    m.classList.add('aberto');
    m.querySelector('.imp-x').onclick = () => m.classList.remove('aberto');
  }

  function aplicar(linhas, nome) {
    if (typeof todosJogadores === 'function' && todosJogadores().length && !confirm('Abrir o grupo novo "' + nome + '"? O grupo atual continua salvo se você já clicou em Salvar.')) return null;
    const { novo, rel } = montar(linhas, nome);
    estado = novo;
    salvarLocal(); render(); if (typeof sincronizarBotoes === 'function') sincronizarBotoes(); if (typeof listarCenarios === 'function') listarCenarios();
    const sel = document.getElementById('selCenario'); if (sel) sel.value = '';
    relatorio(rel, nome);
    return rel;
  }
  /* também chamável direto: importarListaLinhas([{Posição:'GK', Jogador:'...', ...}], 'Nome do grupo') */
  window.importarListaLinhas = aplicar;

  async function lerArquivo(arq) {
    if (!window.XLSX) await new Promise((ok, erro) => { const sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'; sc.onload = ok; sc.onerror = erro; document.head.appendChild(sc); });
    const wb = XLSX.read(await arq.arrayBuffer(), { type: 'array', cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws, { raw: true, defval: '' }).filter(l => Object.values(l).some(v => v !== ''));
  }
  function ligar() {
    const menu = document.getElementById('menuGrupo'); if (!menu || document.getElementById('btImportar')) return;
    const bt = document.createElement('button'); bt.id = 'btImportar'; bt.textContent = 'Importar lista (Excel)…';
    bt.title = 'Cria um campograma novo com os jogadores de uma planilha (modelo da lista de alvos: Posição, Prioridade, Jogador, Time, Salário, Nascimento, Fim de contrato, Empresário, Comentário)';
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.xlsx,.xls,.csv'; inp.style.display = 'none';
    const novoBt = document.getElementById('btNovo'); menu.insertBefore(bt, novoBt ? novoBt.nextSibling : null); document.body.appendChild(inp);
    bt.onclick = () => { inp.value = ''; inp.click(); };
    inp.onchange = async () => {
      const arq = inp.files && inp.files[0]; if (!arq) return;
      let linhas; try { linhas = await lerArquivo(arq); } catch (e) { if (typeof toast === 'function') toast('Não consegui ler a planilha', 'ruim'); return; }
      const sug = arq.name.replace(/\.(xlsx|xls|csv)$/i, '').replace(/[_]+/g, ' ').trim();
      const nome = prompt('Nome do campograma novo:', sug); if (nome === null) return;
      aplicar(linhas, nome.trim() || sug);
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
})();
