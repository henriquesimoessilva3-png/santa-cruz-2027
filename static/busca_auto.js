/* 24/10/2026 — Busca automática do físico e do técnico (pedido do Henrique).
   Na janela "Físico e técnico" (e pelos atalhos da ficha e do "Jogador fora da base"), procura o jogador
   no Wyscout e no SkillCorner logados neste Chrome, pela extensão BFR Busca Jogador (Santa Cruz/extensao_busca_jogador).
   Ordem combinada:
     Wyscout — busca avançada, esquema ALL: últimos 12 meses ("último ano civil") → época atual → época anterior.
     SkillCorner — Player, por 90 min, mínimo 60 min por jogo: desde 01/06/2025 → desde 01/01/2025 → avisa (fica o manual).
   O jogador do SkillCorner é ligado ao do Wyscout pela DATA DE NASCIMENTO (não só pelo nome).
   Nada é salvo sozinho: os números caem nos mesmos campos da colagem manual e valem só depois do "Salvar". */
(function () {
  const EXT = 'fcononaeoamnokalfgbedngkbddmiljj';
  const SC_DATAS = ['2025-06-01', '2025-01-01'];
  const TFS = ['default', 'current_season', 'last_season'];
  const CURTO = { default: '12 meses', current_season: 'época atual', last_season: 'época anterior' };
  const $q = s => document.querySelector(s);
  const br = s => { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '/' + m[2] + '/' + m[1] : String(s || ''); };
  const mil = n => (n == null ? '—' : Number(n).toLocaleString('pt-BR'));
  const ok = t => '<div style="color:#7fd19b">✔ ' + t + '</div>';
  const aviso = t => '<div style="color:#f0b85a">⚠ ' + t + '</div>';
  const erro = t => '<div style="color:#e57373">✖ ' + t + '</div>';
  const SEM_EXT = erro('A extensão <b>BFR Busca Jogador</b> não está carregada neste Chrome. Em <code>chrome://extensions</code> (modo do desenvolvedor) use “Carregar sem compactação” na pasta <code>Santa Cruz/extensao_busca_jogador</code> e recarregue esta página. Enquanto isso, a colagem manual abaixo continua valendo.');
  let ctx = { clube: '', idade: null }, CANDS = [];
  const PEND = new WeakMap();   /* 02/11: promessas da carreira e das corridas de cada busca (o modo automático espera por elas) */

  function ext(msg) {
    return new Promise(res => {
      if (!(window.chrome && chrome.runtime && chrome.runtime.sendMessage)) return res({ erro: 'semext' });
      try { chrome.runtime.sendMessage(EXT, msg, r => { if (chrome.runtime.lastError || !r) res({ erro: 'semext' }); else res(r); }); }
      catch (e) { res({ erro: 'semext' }); }
    });
  }
  function semClube(s) { return tipoNorm(s || '').replace(/\b(ec|fc|sc|ac|cf|cd|ca|esporte clube|futebol clube|clube)\b/g, ' ').replace(/\s+/g, ' ').trim(); }
  function mesmoClube(a, b) { const x = semClube(a), y = semClube(b); return !!(x && y && (x === y || x.includes(y) || y.includes(x))); }
  function nota(c, nome) {
    let n = 0;
    const clubes = [c.clube].concat(Object.values(c.periodos).map(p => p.clube));
    if (ctx.clube && clubes.some(k => mesmoClube(k, ctx.clube))) n += 2;
    if (ctx.idade && c.idade && Math.abs(c.idade - ctx.idade) <= 1) n += 1;
    if (tipoNorm(c.nome) === tipoNorm(nome) || tipoNorm(c.completo) === tipoNorm(nome)) n += 1;
    return n;
  }
  const minTot = c => TFS.reduce((s, t) => s + ((c.periodos[t] && c.periodos[t].min) || 0), 0);

  function montarPainel() {
    if ($q('#baPainel')) return;
    const alvo = $q('#modalDados .filtros'); if (!alvo) return;
    const d = document.createElement('div'); d.id = 'baPainel';
    d.style.cssText = 'border:1px solid #2f6f4f;border-radius:8px;padding:9px;background:rgba(46,160,90,.06);box-sizing:border-box;max-width:100%;min-width:0;overflow:hidden';
    d.innerHTML = '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b>🔎 Buscar no Wyscout e no SkillCorner</b>' +
      '<input type="text" id="baNome" style="flex:1;min-width:120px;width:auto" placeholder="nome do jogador">' +
      '<button class="bt primario mini" id="baBuscar">Buscar</button></div>' +
      '<div class="fraco" style="font-size:11px;margin-top:4px">Wyscout (ALL): últimos 12 meses → época atual → época anterior. SkillCorner (Player, por 90, 60+ min por jogo): desde 01/06/2025 → desde 01/01/2025. Os números entram nos campos abaixo — confira e clique em Salvar.</div>' +
      '<div id="baRes" style="margin-top:6px;font-size:12px;max-height:340px;overflow:auto"></div>';
    alvo.insertBefore(d, alvo.firstChild);
    const cx = $q('#modalDados .modal-cx'); if (cx) { cx.style.width = 'min(1000px, 96vw)'; cx.style.maxHeight = '94vh'; cx.style.overflowY = 'auto'; }   /* 24/10: janela larga — a lista cortava a direita */
    $q('#baBuscar').onclick = () => buscar();
    $q('#baNome').onkeydown = e => { if (e.key === 'Enter') buscar(); };
  }

  /* chamado pelo abrirDados (app.js) toda vez que a janela abre */
  window.buscaAutoReset = function (j) {
    montarPainel(); window.MD_AUTO = null; CANDS = [];
    if (!$q('#baNome')) return;
    $q('#baNome').value = (j && j.nome) || ''; $q('#baRes').innerHTML = '';
    const b = j && j.pk && typeof fsJogadorPk === 'function' ? fsJogadorPk(j.pk) : null;
    ctx = { clube: (j && j.clube && j.clube !== 'sem clube' ? j.clube : '') || (b && b.t) || '', idade: (j && j.idade) || (b && b.id_) || null };
  };
  window.buscaAutoIniciar = () => buscar();

  async function buscar() {
    const nome = ($q('#baNome').value || '').trim(); if (!nome) return;
    const res = $q('#baRes');
    res.innerHTML = '⏳ procurando “' + esc(nome) + '” no Wyscout (três períodos)…';
    const r = await ext({ tipo: 'wy_buscar', nome });
    if (r.erro === 'semext') { res.innerHTML = SEM_EXT; return; }
    if (r.erro) { res.innerHTML = erro(esc(r.erro)); return; }
    const C = r.candidatos || [];
    if (!C.length) { res.innerHTML = aviso('Nenhum jogador com esse nome no Wyscout. Tente outra grafia (o nome completo costuma achar) ou cole à mão abaixo.'); return; }
    C.forEach(c => { c.nota = nota(c, nome); });
    C.sort((a, b) => b.nota - a.nota || minTot(b) - minTot(a));
    CANDS = C;
    const sug = C[0].nota >= 2 && (C.length === 1 || C[1].nota < C[0].nota) ? C[0] : null;
    const linhas = C.slice(0, 15).map(c => {
      const per = TFS.filter(t => c.periodos[t]).map(t => CURTO[t] + ': <b>' + c.periodos[t].jogos + '</b> j · ' + mil(c.periodos[t].min) + ' min').join('<br>');
      return '<tr data-wy="' + esc(String(c.id)) + '" title="clique para usar este jogador" style="cursor:pointer;border-top:1px solid #2a2a2a;' + (c === sug ? 'background:rgba(46,160,90,.2)' : '') + '">' +
        '<td style="width:74px"><button class="bt mini' + (c === sug ? ' primario' : '') + '">usar este</button></td>' +
        '<td style="width:34px">' + (c.foto ? '<img src="' + esc(c.foto) + '" alt="" style="width:28px;height:28px;border-radius:50%;object-fit:cover" referrerpolicy="no-referrer" onerror="this.remove()">' : '') + '</td>' +
        '<td><b>' + esc(c.nome) + '</b>' + (c === sug ? ' <small style="color:#7fd19b">sugerido</small>' : '') + '<br><small class="fraco">' + esc(c.completo) + '</small></td>' +
        '<td>' + esc(c.clube) + '<br><small class="fraco">' + esc(c.liga) + '</small></td>' +
        '<td>' + esc(c.pos) + '</td>' +
        '<td>' + (c.idade || '—') + ' anos<br><small class="fraco">nasc. ' + br(c.nasc) + '</small></td>' +
        '<td style="font-size:11px">' + per + '</td></tr>';
    }).join('');
    res.innerHTML = '<div style="margin-bottom:4px">' + (sug ? 'Sugestão em verde (mesmo clube do cadastro). Confira posição e nascimento antes de usar.' : 'Escolha o jogador certo — confira clube, posição e nascimento.') +
      (C.length > 15 ? ' <span class="fraco">(' + C.length + ' achados, mostrando 15 — refine o nome)</span>' : '') + '</div>' +
      '<table style="width:100%;table-layout:fixed;border-collapse:collapse;font-size:12px;word-break:break-word">' + linhas + '</table>';
    res.querySelectorAll('[data-wy]').forEach(b => { b.onclick = () => escolher(CANDS.find(c => String(c.id) === b.dataset.wy)); });
  }

  async function escolher(c) {
    if (!c) return;
    const res = $q('#baRes');
    const tf = TFS.find(t => c.periodos[t] && c.periodos[t].min > 0);
    const info = { fonte: 'busca automática', wy_id: c.id, wy_nome: c.nome, wy_clube: c.clube, nasc: c.nasc, foto: c.foto && !/not-found/.test(c.foto) ? c.foto : null };
    let html = '<div style="margin-bottom:3px"><b>' + esc(c.nome) + '</b> · ' + esc(c.clube) + ' · ' + esc(c.pos) + ' · nasc. ' + br(c.nasc) + '</div>';
    if (!tf) html += aviso('Wyscout: sem minutos nos últimos 12 meses, na época atual nem na época anterior — o técnico ficou de fora.');
    else {
      const P = c.periodos[tf], L = P.linha, cab = Object.keys(L);
      mdTec = mdMapear(cab, cab.map(k => String(L[k])), MD_TEC);
      mdPrevia(mdTec, MD_TEC, $q('#mdTecPrev'), 'Técnico do Wyscout (' + P.rotulo + ')');
      Object.assign(info, { wy_periodo: P.rotulo, wy_jogos: P.jogos, wy_min: P.min });
      const t = 'Wyscout: <b>' + esc(P.rotulo) + '</b> · ' + P.jogos + ' jogos · ' + mil(P.min) + ' min' + (P.clube && !mesmoClube(P.clube, c.clube) ? ' (por ' + esc(P.clube) + ')' : '');
      html += tf === 'default' ? ok(t) : aviso(t + ' — sem minutos ' + (tf === 'current_season' ? 'nos últimos 12 meses' : 'nos últimos 12 meses nem na época atual'));
    }
    res.innerHTML = html + '<div id="baCar">⏳ minutagem e bola parada no Wyscout, jogo a jogo (leva uns 30 s)…</div><div id="baSc">⏳ procurando no SkillCorner…</div>';
    const pCar = carreira(c, info); PEND.set(info, [pCar]);
    const s = await ext({ tipo: 'sc_buscar', nomes: [c.completo, c.nome].filter(Boolean) });
    const el = $q('#baSc');
    if (s.erro) { el.innerHTML = erro(esc(s.erro)); return fim(info); }
    const todos = s.candidatos || [], mesmos = todos.filter(x => x.nasc && x.nasc === c.nasc);
    if (mesmos.length === 1) return fisico(mesmos[0], info);
    if (!todos.length) { el.innerHTML = aviso('SkillCorner: não achei “' + esc(c.completo || c.nome) + '”. Se tiver o CSV, cole abaixo.'); return fim(info); }
    const lista = (mesmos.length > 1 ? mesmos : todos).slice(0, 10);
    el.innerHTML = aviso(mesmos.length > 1 ? 'SkillCorner: mais de um com o mesmo nascimento — escolha:' : 'SkillCorner: nenhum com nascimento ' + br(c.nasc) + '. Só use um destes se tiver certeza que é ele:') +
      lista.map(x => '<div style="margin:2px 0">' + esc(x.completo || x.nome) + ' <span class="fraco">· nasc. ' + br(x.nasc) + '</span> <button class="bt mini" data-sc="' + x.id + '">usar</button></div>').join('');
    el.querySelectorAll('[data-sc]').forEach(b => { b.onclick = () => fisico(lista.find(x => String(x.id) === b.dataset.sc), info); });
    fim(info);
  }

  async function fisico(x, info) {
    const el = $q('#baSc'); if (!x || !el) return;
    el.innerHTML = '⏳ puxando o físico de ' + esc(x.completo || x.nome) + '…';
    const f = await ext({ tipo: 'sc_fisico', id: x.id, datas: SC_DATAS });
    if (f.erro) { el.innerHTML = erro(esc(f.erro)); return fim(info); }
    info.sc_id = x.id;
    const pObr = corridas(x, info); (PEND.get(info) || PEND.set(info, []).get(info)).push(pObr);
    if (f.vazio) {
      el.innerHTML = aviso('SkillCorner: ' + esc(x.completo || x.nome) + ' (nasc. ' + br(x.nasc) + ') não tem jogo com 60+ min desde 01/06/2025 nem desde 01/01/2025. Cole à mão abaixo — ou vemos outra forma de puxar.');
      return fim(info);
    }
    const cab = Object.keys(f.linha);
    mdFis = mdMapear(cab, cab.map(k => String(f.linha[k])), MD_FIS);
    mdPrevia(mdFis, MD_FIS, $q('#mdFisPrev'), 'Físico do SkillCorner (desde ' + br(f.de) + ')');
    Object.assign(info, { sc_desde: f.de, sc_jogos: f.jogos });
    const t = 'SkillCorner: ' + esc(x.completo || x.nome) + ' · desde <b>' + br(f.de) + '</b> · ' + f.jogos + ' jogos';
    el.innerHTML = f.de === SC_DATAS[0] ? ok(t) : aviso(t + ' — desde 01/06/2025 não havia jogo');
    fim(info);
  }

  /* 25/10: minutagem (3 anos) e bola parada pelo Wyscout jogo a jogo — os quadros de baixo da ficha (Minutagem, Cobrador,
     Finalizador). Vão no MD_AUTO e são salvos junto com o resto (d.auto.hist e d.auto.bp). */
  async function carreira(c, info) {
    const el = () => $q('#baCar');
    const o = await ext({ tipo: 'wy_carreira', id: c.id });
    if (!el()) return;
    if (!o || o.erro) { const velha = !o || /desconhecido|semext/.test(o.erro || ''); el().innerHTML = aviso('Minutagem e bola parada: ' + (velha ? 'recarregue a extensão BFR Busca Jogador (versão 1.3.0) em chrome://extensions e busque de novo' : esc(o.erro))); return; }
    info.hist = o.hist || {}; info.bp = o.bp || {};
    const anos = Object.keys(info.hist).sort();
    if (!anos.length) { el().innerHTML = aviso('Minutagem: o Wyscout não tem jogo de liga dele em 2024–2026.'); return; }
    const pc = x => (x.tmin ? Math.round(100 * x.min / x.tmin) + '%' : '—');
    const cob = Object.values(info.bp).reduce((s, b) => s + (b.c || 0) + (b.fc || 0) + (b.fd || 0) + (b.pe || 0), 0);
    const gbp = Object.values(info.bp).reduce((s, b) => s + (b.ge || 0) + (b.gf || 0) + (b.gd || 0) + (b.gl || 0), 0);
    el().innerHTML = ok('Minutagem (Wyscout, liga): ' + anos.map(a => a + ' <b>' + pc(info.hist[a]) + '</b> (' + esc(info.hist[a].tm) + ')').join(' · ') +
      ' — bola parada em 3 anos: <b>' + cob + '</b> cobranças, <b>' + gbp + '</b> gols');
    if (window.MD_AUTO === info) window.MD_AUTO = info;
  }

  /* 24/10: corridas sem bola /30 e para a área /30 (Game Intelligence do SkillCorner) — vão nos campos do formulário */
  async function corridas(x, info) {
    const res = $q('#baRes'); if (!res) return;
    res.insertAdjacentHTML('beforeend', '<div id="baObr">⏳ corridas sem bola no SkillCorner…</div>');
    const el = $q('#baObr');
    const o = await ext({ tipo: 'sc_obr', id: x.id, desde: SC_DATAS[SC_DATAS.length - 1] });
    if (!o || o.erro) { el.innerHTML = aviso('Corridas sem bola: ' + (!o || /desconhecido|semext/.test(o.erro || '') ? 'recarregue a extensão BFR Busca Jogador (versão 1.3.0) em chrome://extensions' : esc(o.erro))); return; }
    if (o.vazio) { el.innerHTML = aviso('Corridas sem bola: o SkillCorner não tem essa métrica para ' + esc(x.completo || x.nome) + (o.eds && o.eds.length ? ' em ' + esc(o.eds.join(', ')) : '') + ' (nem toda liga tem).'); return; }
    const a = $q('#mdObr'), b = $q('#mdObrArea');
    if (a) a.value = String(o.obr).replace('.', ','); if (b && o.obr_area != null) b.value = String(o.obr_area).replace('.', ',');
    Object.assign(info, { obr_ed: o.ed_nome, obr_jogos: o.jogos, obr_extra: { obr_hsr: o.obr_hsr, obr_per: o.obr_per, obr_rec: o.obr_rec, obr_rem: o.obr_rem } });
    el.innerHTML = ok('Corridas sem bola: <b>' + o.obr + '</b> /30 · para a área <b>' + o.obr_area + '</b> /30 · ' + esc(o.ed_nome) + ' · ' + o.jogos + ' jogos');
  }

  function fim(info) {
    info.em = new Date().toISOString().slice(0, 10);
    window.MD_AUTO = info;
    const res = $q('#baRes'); if (res && !$q('#baFim')) res.insertAdjacentHTML('beforeend', '<div id="baFim" style="margin-top:6px"><b>Confira os números abaixo e clique em Salvar.</b></div>');
  }


  /* 02/11/2026 — pedido de atualização vindo do celular (app Consulta de Jogadores): roda a mesma busca, mas só segue
     sozinho quando o jogador do Wyscout é inequívoco (mesmo clube do cadastro + idade ±1, e nenhum outro com a mesma
     nota) e o do SkillCorner tem o MESMO nascimento — senão devolve "conferir" e não salva nada. */
  window.buscaAutoPedido = async function (j) {
    try {
      if (typeof abrirDadosBase !== 'function') return { estado: 'erro', msg: 'app sem a janela de dados' };
      abrirDadosBase(j);
      const nome = (j.nc || j.n || '').replace(/\s*\(.*?\)\s*/g, ' ').trim(); if ($q('#baNome')) $q('#baNome').value = nome;
      const r = await ext({ tipo: 'wy_buscar', nome });
      if (r.erro === 'semext') return { estado: 'erro', msg: 'extensão BFR Busca Jogador desligada' };
      if (r.erro) return { estado: 'erro', msg: String(r.erro) };
      const C = r.candidatos || []; if (!C.length) return { estado: 'nao_achou', msg: 'não está no Wyscout com esse nome' };
      C.forEach(c => { c.nota = nota(c, nome); }); C.sort((a, b) => b.nota - a.nota || minTot(b) - minTot(a)); CANDS = C;
      const top = C[0];
      if (!(top.nota >= 3 && (C.length === 1 || C[1].nota < top.nota))) return { estado: 'conferir', msg: C.length + ' jogadores com esse nome no Wyscout — escolha na ficha' };
      await escolher(top);
      const info = window.MD_AUTO; const pend = (info && PEND.get(info)) || [];
      await Promise.all(pend.map(p => Promise.resolve(p).catch(() => {})));
      const temF = !!(typeof mdFis !== 'undefined' && mdFis), temT = !!(typeof mdTec !== 'undefined' && mdTec);
      if (!temF && !temT) { const x = $q('#modalDados'); if (x) x.classList.remove('aberto'); return { estado: 'sem_dado', msg: 'Wyscout e SkillCorner sem dado recente' }; }
      const bt = $q('#mdOk'); if (!bt) return { estado: 'erro', msg: 'botão salvar não achado' };
      bt.click();
      return { estado: temF && temT ? 'ok' : 'parcial', msg: (temT ? 'técnico' : '') + (temF && temT ? ' e ' : '') + (temF ? 'físico' : '') + ' atualizados', wy: top.nome + ' · ' + top.clube };
    } catch (e) { return { estado: 'erro', msg: (e && e.message) || String(e) }; }
  };

  /* ficha do jogador: botão ao lado do "+ físico/técnico" (chamado pelo abrirFicha do app.js) */
  window.buscaAutoFicha = function (j) {
    let b = $q('#fiBusca');
    const ref = $q('#fiDados'); if (!ref) return;
    if (!b) { b = document.createElement('button'); b.id = 'fiBusca'; b.className = 'bt mini'; ref.insertAdjacentElement('afterend', b); }
    b.textContent = '↻ Wyscout + SkillCorner';
    b.title = 'Busca o jogador no Wyscout e no SkillCorner e traz o técnico e o físico atualizados (você confere antes de salvar)';
    b.onclick = () => { abrirDadosBase(j); buscar(); };
  };

  /* "Jogador fora da base": adiciona e já busca */
  function botaoManual() {
    const base = $q('#btManualDados'); if (!base || $q('#btManualBusca')) return;
    const b = document.createElement('button'); b.id = 'btManualBusca'; b.className = 'bt';
    b.textContent = 'Adicionar e buscar no Wyscout/SkillCorner';
    b.title = 'Adiciona e já procura o jogador no Wyscout e no SkillCorner';
    base.insertAdjacentElement('beforebegin', b);
    b.onclick = () => { base.click(); if ($q('#modalDados').classList.contains('aberto')) buscar(); };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', botaoManual); else botaoManual();

  /* 07/11/2026 — Salvar ESPERA a minutagem e a bola parada (Henrique, caso Lucas Crispim): a carreira jogo a jogo leva
     ~30 s; quem clicava em Salvar antes disso gravava o técnico e o físico sem os quadros de Minutagem e Cobrador.
     Agora o clique fica segurado até a busca terminar e o Salvar segue sozinho. */
  let esperando = false;
  document.addEventListener('click', async ev => {
    const bt = ev.target && ev.target.closest && ev.target.closest('#mdOk');
    if (!bt || esperando) return;
    const info = window.MD_AUTO, pend = (info && PEND.get(info)) || [];
    if (!pend.length || info._pronto) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    esperando = true; const txt = bt.textContent; bt.disabled = true; bt.textContent = '⏳ esperando minutagem e bola parada…';
    try { await Promise.race([Promise.all(pend.map(p => Promise.resolve(p).catch(() => {}))), new Promise(r => setTimeout(r, 90000))]); } catch (e) {}
    info._pronto = 1; bt.disabled = false; bt.textContent = txt; esperando = false;
    bt.click();
  }, true);
})();
