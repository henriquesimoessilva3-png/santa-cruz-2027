/* 08/11/2026 — Comparativo de 12 meses na comparação de jogadores (Henrique: "coloca como padrão esse comparativo de
   jogadores lá no aplicativo, sempre os últimos 12 meses… deixa lá em comparativo já padrão, com possibilidade de gerar
   um PDF"). Modelo: o PDF Neris × Ricardo Silva de 08/11 (Santa Cruz V2/listas).

   Ao abrir "⇆ comparar com jogador" na ficha, a comparação abre neste modo (o botão "base da ficha" volta à comparação
   antiga, de 23/10). Os números vêm na hora, pela extensão BFR Busca Jogador (1.4.0+), do Wyscout e do SkillCorner
   logados neste Chrome:
     • técnico — Wyscout, match_stats jogo a jogo desde hoje − 12 meses, só jogos oficiais (sem amistoso, seleção e base),
       por 90 sobre todos os minutos; e o mesmo só na liga atual de cada um;
     • físico — SkillCorner Physical, por 90, mínimo 60 min por jogo, desde hoje − 12 meses;
     • minutagem — minutos dele ÷ minutos dos jogos oficiais do clube no período em que esteve lá (por clube).
   As réguas (SOBE / MÉDIA / MELHOR) e os indicadores de cada grupo são os da ficha do jogador aberto (fisicoSerieBHtml e
   subidaFicha, posição dele, Série B). O melhor dos dois em cada indicador fica numa caixa com ▲.
   O jogador do Wyscout é conferido por clube e idade (Henrique: "esse check é fundamental, a gente não pode errar qual
   jogador é"); na dúvida, o app mostra as opções para escolher. O do SkillCorner, pela data de nascimento. */
(function () {
  'use strict';
  const EXT = 'fcononaeoamnokalfgbedngkbddmiljj';
  const VERSAO_MIN = '1.4.0';
  const LS = 'sc_cmp12_v1', LS_MODO = 'sc_cmp12_modo';
  const CSS_DOC = "\n@page{size:A4 landscape;margin:0}\n*{box-sizing:border-box}\nbody{margin:0;background:#11151c;color:#e6e9ee;font-family:Arial,\"Liberation Sans\",\"DejaVu Sans\",sans-serif;font-size:10px;-webkit-print-color-adjust:exact;print-color-adjust:exact}\n.pg{width:1440px;height:1018px;padding:14px 20px;overflow:hidden;position:relative;page-break-after:always}\n.cab0{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px} .cab0 h1{margin:0;font-size:22px} .cab0 span{font-size:12px;color:#9aa3af}\n.jgs{display:grid;grid-template-columns:1fr 1fr;gap:14px}\n.jg{display:flex;gap:12px;background:#151a22;border-left:4px solid;border-radius:8px;padding:10px 12px}\n.jg .fo{width:70px;height:91px;border-radius:7px;object-fit:cover;object-position:center 15%;background:#fff}\n.jd{flex:1;min-width:0} .jd h2{margin:0;font-size:22px} .s{font-size:12.5px;color:#c3c9d2;display:flex;align-items:center;gap:6px;margin-top:3px} .s img{width:20px;height:20px;background:#fff;border-radius:4px;padding:1px}\n.s2{font-size:12px;color:#b9c0ca;margin-top:3px} .s2 b{color:#fff;font-size:14px}\n.kv{display:grid;grid-template-columns:repeat(3,1fr);gap:4px 10px;margin-top:6px} .kv span{display:block;font-size:8.5px;letter-spacing:.6px;color:#8a93a0;text-transform:uppercase} .kv b{font-size:12px}\n.tg{font-style:normal;display:inline-block;padding:0 6px;border-radius:4px;color:#fff;font-weight:700;margin-right:4px;font-size:11px}\n.pc{font-style:normal;font-size:14px;font-weight:800;margin-right:4px} .pc.v{color:#4fd18b} .pc.a{color:#f0b429} .pc.r{color:#ff6b6b}\n.leg{display:flex;gap:16px;font-size:9.5px;color:#9aa3af;margin:8px 0 5px;flex-wrap:wrap}\n.lay{display:grid;grid-template-columns:540px minmax(0,1fr);gap:16px;align-items:start}\n.gh{margin:0 0 3px;padding:5px 9px;border-radius:5px;font-size:11px;letter-spacing:1px;color:#fff;display:flex;align-items:center;gap:8px} .gh small{letter-spacing:0;font-weight:400;font-size:9px;color:#e4e4e4} .gh.fis{background:#5b2a91}\n.sub{background:#3a1f61;border-radius:4px;padding:3px 8px;margin:4px 0 2px;font-weight:700;font-size:10.5px}\n.ln{display:grid;align-items:center;gap:6px;padding:2.5px 0;border-bottom:1px solid #1b212b}\n.ln.f{grid-template-columns:minmax(0,1fr) 112px 112px 36px 36px 42px}\n.ln.cab{font-size:8px;text-transform:uppercase;color:#7b8390;border-bottom:1px solid #2a313c;align-items:end}\n.ln.cab>span:not(.rot):not(.ref){font-size:11.5px;font-weight:700;text-transform:none} .ln.cab small{display:block;font-size:8px;font-weight:400;color:#7b8390}\n.rot{min-width:0;color:#c3c9d2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:10.8px} .ln.fund .rot{color:#fff;font-weight:700} .dot{color:#b9a7ff;font-style:normal;margin-right:3px;font-size:8px}\n.v{display:flex;align-items:center;gap:5px;min-width:0} .v b{width:46px;flex:none;text-align:right;font-size:12.5px} .br{flex:1;height:7px;background:#2a313c;border-radius:3px;overflow:hidden;display:block} .br i{display:block;height:100%;border-radius:3px}\n.w.g{background:#ffffff0d;border-radius:4px}\n.v.v b{color:#4fd18b} .v.a b{color:#f0b429} .v.r b{color:#ff6b6b} .v.n b{color:#e6e9ee}\n.br i.v{background:#2fb36b} .br i.a{background:#d99a00} .br i.r{background:#d64545} .br i.n{background:#6f7b8b}\n.ref{text-align:right;color:#8a93a0;font-size:9.5px} .ref.s{color:#b9a7ff;font-weight:700} .ref.mx{color:#7fb0ff}\n.tec{display:grid;grid-template-columns:1fr 1fr;gap:8px 12px} .tec .bloco:first-child{grid-row:span 1}\n.ln.t{grid-template-columns:minmax(0,1fr) repeat(4,42px) 25px 25px 27px;gap:3px;padding:2px 0}\n.ln.t .v{display:block} .ln.t .v b{width:auto;display:block;font-size:11.5px;text-align:right} .ln.t .v .br{height:4px;margin-top:1px}\n.ln.t .rot{font-size:10px} .ln.t .ref{font-size:8.8px}\n.duo{display:grid;grid-template-columns:1.3fr 1fr;gap:14px;margin-top:8px}\ntable.mt{width:100%;border-collapse:collapse;font-size:11px} .mt th{text-align:left;font-size:8.5px;color:#7b8390;text-transform:uppercase;padding:3px 6px;background:#1a2029} .mt td{padding:3px 6px;border-bottom:1px solid #1f2630} .mt small{color:#8a93a0} .mt tr.sep td{border-top:2px solid #2a313c} .obs{color:#f0b429}\n.leit{display:grid;grid-template-columns:1fr;gap:6px} .li{background:#161c25;border-left:3px solid #2fb36b;border-radius:5px;padding:6px 10px} .li>b{font-size:12px} .li p{margin:3px 0 0;line-height:1.45;font-size:10.8px;color:#cfd5dd} .li p b{font-size:11.5px;color:#fff}\n.fonte{font-size:8.6px;color:#7b8390;position:absolute;left:20px;right:20px;bottom:10px;line-height:1.4}\n.ln.t{grid-template-columns:minmax(0,1fr) repeat(4,40px) 29px 29px 31px;gap:3px} .ln.t .rot{font-size:9.8px} .li p{font-size:10.5px;line-height:1.4} .ln.t.cab>span:not(.rot):not(.ref){font-size:10px} .ln.t{grid-template-columns:minmax(0,1fr) 46px 46px 9px 46px 46px 27px 27px 29px;gap:2px} .ln.t .sp{align-self:stretch;border-left:2px solid #3a4250;margin-left:3px} .ln.t.gcab{border-bottom:none;padding:2px 0 0} .ln.t.gcab .grp{grid-column:span 2;text-align:center;font-size:8.5px;font-weight:700;letter-spacing:.6px;color:#c3c9d2;background:#232a35;border-radius:3px;padding:2px 0} .ln.t .w{padding:1px 3px;border-radius:4px} .ln.t .w.g{background:#ffffff1f;box-shadow:inset 0 0 0 1px #ffffff40} .ln.t .w.g .v b:after{content:\"▲\";font-size:7px;color:#fff} .ln.t.cab>span:not(.rot):not(.ref){text-align:right;padding-right:3px} .ln.f .w{padding:1px 4px;border-radius:4px} .ln.f .w.g{background:#ffffff1f;box-shadow:inset 0 0 0 1px #ffffff40} .ln.f .w.g .v b:after{content:\"▲\";font-size:8px;color:#fff;margin-left:1px}";
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nk = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[◆●↓~]/g, '').replace(/\s+/g, ' ').trim();
  const numPt = t => { const m = String(t == null ? '' : t).replace(/\./g, '').replace(',', '.').match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : null; };
  const f = (v, d) => v == null || !isFinite(v) ? '—' : Number(v).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const br = s => { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '/' + m[2] + '/' + m[1] : String(s || ''); };
  const mesAno = s => { const m = String(s || '').match(/^(\d{4})-(\d{2})/); return m ? ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][+m[2] - 1] + '/' + m[1] : ''; };
  const hojeISO = () => new Date().toISOString().slice(0, 10);
  const de12 = () => { const d = new Date(); d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0, 10); };
  const pkDe = j => { try { return primaryKey(j); } catch (e) { return (j.n || '') + ' - ' + (j.t || ''); } };
  const lsGet = () => { try { return JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) { return {}; } };
  const lsSet = (k, v) => { try { const o = lsGet(); o[k] = v; localStorage.setItem(LS, JSON.stringify(o)); } catch (e) { /* cheio */ } };
  let modo = (() => { try { return localStorage.getItem(LS_MODO) || '12m'; } catch (e) { return '12m'; } })();
  const EST = {};   /* par → { st: 'busca'|'ok'|'erro'|'escolher', doc, msg, opcoes } */

  function ext(msg) {
    return new Promise(res => {
      if (!(window.chrome && chrome.runtime && chrome.runtime.sendMessage)) return res({ erro: 'semext' });
      try { chrome.runtime.sendMessage(EXT, msg, r => { if (chrome.runtime.lastError || !r) res({ erro: 'semext' }); else res(r); }); }
      catch (e) { res({ erro: 'semext' }); }
    });
  }
  const verMaior = (a, b) => { const x = String(a || '0').split('.').map(Number), y = String(b).split('.').map(Number); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return true; };
  const semClube = s => nk(s).replace(/\b(ec|fc|sc|ac|cf|cd|ca|esporte clube|futebol clube|clube|saf)\b/g, ' ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const mesmoClube = (a, b) => { const x = semClube(a), y = semClube(b); return !!(x && y && (x === y || x.includes(y) || y.includes(x))); };

  /* ---------- quem é quem: Wyscout (clube + idade) e SkillCorner (nascimento) ---------- */
  async function idWy(j) {
    const pk = pkDe(j), c0 = lsGet()['wy:' + pk]; if (c0) return c0;
    const r = await ext({ tipo: 'wy_buscar', nome: j.nc || j.n });
    if (r.erro) throw new Error(r.erro === 'semext' ? 'semext' : r.erro);
    const cs = r.candidatos || [];
    const clubeOk = c => [c.clube].concat(Object.values(c.periodos || {}).map(p => p.clube)).some(k => mesmoClube(k, j.t));
    const idadeOk = c => !j.id_ || !c.idade || Math.abs(c.idade - j.id_) <= 1;
    let ok = cs.filter(c => clubeOk(c) && idadeOk(c));
    if (ok.length > 1) { const xs = ok.filter(c => nk(c.nome) === nk(j.n) || nk(c.completo) === nk(j.nc || '')); if (xs.length) ok = xs; }
    if (ok.length === 1) { const v = { id: ok[0].id, nasc: ok[0].nasc, nome: ok[0].nome, completo: ok[0].completo, clube: ok[0].clube, foto: ok[0].foto, escudo: ok[0].escudo }; lsSet('wy:' + pk, v); return v; }
    return { escolher: (ok.length ? ok : cs.filter(idadeOk)).slice(0, 8) };
  }
  async function idSc(wy, j) {
    const pk = pkDe(j), c0 = lsGet()['sc:' + pk]; if (c0) return c0;
    const r = await ext({ tipo: 'sc_buscar', nomes: [wy.completo, wy.nome, j.nc, j.n].filter(Boolean) });
    if (r.erro) return null;
    const ok = (r.candidatos || []).filter(c => wy.nasc && c.nasc === wy.nasc);
    if (ok.length !== 1) return null;
    lsSet('sc:' + pk, ok[0]); return ok[0];
  }
  async function dados(j) {
    const wy = await idWy(j); if (wy.escolher) return wy;
    const de = de12(), chave = 'd:' + pkDe(j) + ':' + hojeISO(), c0 = lsGet()[chave]; if (c0) return Object.assign({ wyId: wy }, c0);
    const tec = await ext({ tipo: 'wy_12m', id: wy.id, de });
    if (tec.erro) throw new Error(tec.erro);
    const sc = await idSc(wy, j);
    let fis = null;
    if (sc) { const r = await ext({ tipo: 'sc_fisico', id: sc.id, datas: [de] }); if (r && r.ok && !r.vazio) fis = { jogos: r.jogos, linha: r.linha }; }
    const o = { de, tec, fis, sc: !!sc };
    /* guarda só o dia de hoje (o Wyscout muda a cada rodada) */
    try { const all = lsGet(); Object.keys(all).filter(k => k.startsWith('d:') && !k.endsWith(hojeISO())).forEach(k => delete all[k]); all[chave] = o; localStorage.setItem(LS, JSON.stringify(all)); } catch (e) { /* cheio */ }
    return Object.assign({ wyId: wy }, o);
  }

  /* ---------- réguas da ficha do jogador aberto ---------- */
  function linhas(el) {
    const rot = el.querySelector('.rot'); if (!rot) return null;
    const r = rot.cloneNode(true); r.querySelectorAll('.sf-faixa,i').forEach(x => x.remove());
    const g = s => numPt((el.querySelector(s) || {}).textContent);
    return { rot: r.textContent.replace(/[◆●]/g, '').trim(), fund: el.classList.contains('fund'), sobe: g('.sf-sobe'), med: g('.med'), mx: g('.mx'), menor: /↓/.test(rot.textContent) || (typeof menorMelhorInd === 'function' && menorMelhorInd(r.textContent.replace(/[↓~◆●]/g, '').trim())) };
  }
  function refsFis(j) {
    const d = document.createElement('div'); try { d.innerHTML = fisicoSerieBHtml(j) || ''; } catch (e) { return []; }
    const gr = []; let g = null;
    d.querySelectorAll('.sf-sub, .fi-linha.sf6:not(.cab)').forEach(el => {
      if (el.classList.contains('sf-sub')) { g = { nome: (el.querySelector('span') || el).textContent.trim(), ls: [] }; gr.push(g); return; }
      const l = linhas(el); if (!l) return; if (!g) { g = { nome: 'Físico', ls: [] }; gr.push(g); } g.ls.push(l);
    });
    return gr;
  }
  function refsTec(j) {
    const d = document.createElement('div'); try { const h = subidaFicha(j); d.innerHTML = typeof h === 'string' ? h : (h && h.html) || ''; } catch (e) { return []; }
    const gr = [];
    d.querySelectorAll('.fi-grupo').forEach(gp => {
      const h = gp.querySelector('h4'); const nome = h ? (h.childNodes[0] ? h.childNodes[0].textContent : h.textContent).trim() : '';
      if (/^f[ií]sico/i.test(nome)) return;
      const ls = [...gp.querySelectorAll('.fi-linha:not(.cab)')].map(linhas).filter(Boolean);
      if (ls.length) gr.push({ nome, ls });
    });
    return gr;
  }

  /* ---------- valores ---------- */
  const p9 = (a, k) => a && a.min ? (a.s[k] || 0) / a.min * 90 : null;
  const pc = (a, k) => a && a.s[k] ? 100 * (a.s[k + '_success'] || 0) / a.s[k] : null;
  const TEC = [
    [/^passes recebidos/, a => p9(a, 'received_pass')], [/^passes certos/, a => pc(a, 'pass')], [/^passes \/90/, a => p9(a, 'pass')],
    [/^passes terco final certos/, a => pc(a, 'pass_to_final_third')], [/^passes terco final/, a => p9(a, 'pass_to_final_third')],
    [/^passes p\/ frente certos/, a => pc(a, 'forward_pass')], [/^passes p\/ frente/, a => p9(a, 'forward_pass')],
    [/^passes progr\. certos/, a => pc(a, 'progressive_pass')], [/^passes progr/, a => p9(a, 'progressive_pass')],
    [/^passes longos certos/, a => pc(a, 'long_pass')], [/^passes longos/, a => p9(a, 'long_pass')],
    [/^conducoes progr/, a => p9(a, 'progressive_run')], [/^passes p\/ area/, a => p9(a, 'pass_to_penalty_area')],
    [/^xg /, a => p9(a, 'xg_shot')], [/^xa /, a => p9(a, 'xg_assist')], [/^gols de cabeca/, a => p9(a, 'head_goal')], [/^gols /, a => p9(a, 'goal')],
    [/^final\. no gol/, a => a && a.s.shot ? 100 * (a.s.shot_on_goal || 0) / a.s.shot : null], [/^final\. bloqueadas/, a => p9(a, 'shot_block')], [/^finalizacoes/, a => p9(a, 'shot')],
    [/^toques na area/, a => p9(a, 'touch_in_penalty_area')], [/^assistencias/, a => p9(a, 'assist')], [/^passes-chave/, a => p9(a, 'key_pass')],
    [/^cruzamentos certos/, a => pc(a, 'cross')], [/^cruzamentos/, a => p9(a, 'cross')], [/^dribles certos/, a => pc(a, 'dribble')], [/^dribles/, a => p9(a, 'dribble')],
    [/^duelos of\. ganhos/, a => pc(a, 'offensive_duel')], [/^faltas sofridas/, a => p9(a, 'foul_suffered')],
    [/^duelos aereos ganhos/, a => pc(a, 'aerial_duel')], [/^duelos aereos/, a => p9(a, 'aerial_duel')],
    [/^cartoes amarelos/, a => a && a.min ? a.yc / a.min * 90 : null], [/^duelos def\. ganhos/, a => pc(a, 'defensive_duel')], [/^duelos def/, a => p9(a, 'defensive_duel')],
    [/^duelos ganhos/, a => pc(a, 'duel')], [/^duelos \/90/, a => p9(a, 'duel')], [/^faltas \/90/, a => p9(a, 'foul')],
  ];
  /* indicadores do Wyscout sem régua na ficha, úteis para todos (entram no grupo da defesa, sem SOBE/MÉDIA) */
  const EXTRA = [['Intercept. /90', a => p9(a, 'interception'), 0], ['Recuper. /90', a => p9(a, 'recovery'), 0], ['Cortes /90', a => p9(a, 'clearance'), 0],
    ['Driblado /90 ↓', a => a && a.min ? ((a.s.dribble_against || 0) - (a.s.dribble_against_success || 0)) / a.min * 90 : null, 1],
    ['Perdas /90 ↓', a => p9(a, 'loss'), 1], ['Perdas no próprio campo ↓', a => p9(a, 'own_half_loss'), 1]];
  const FIS = [['psv-99 (top 5)', 'TOP 5 PSV-99'], ['psv-99', 'PSV-99'], ['veloc. de pico', 'Peak Velocity'], ['sprints', 'Sprint Count P90'], ['acoes alta intens', 'HI Count P90'],
    ['arranc. explosivas', 'Explosive Acceleration to Sprint Count P90'], ['dist. sprint', 'Sprint Distance P90'], ['corridas hsr', 'HSR Count P90'], ['dist. hsr', 'HSR Distance P90'],
    ['dist. alta intens', 'HI Distance P90'], ['acel. fortes', 'High Acceleration Count P90'], ['acel. medias', 'Medium Acceleration Count P90'], ['desacel. fortes', 'High Deceleration Count P90'],
    ['desacel. medias', 'Medium Deceleration Count P90'], ['mud. de direcao', 'Change of Direction Count P90'], ['distancia', 'Distance P90'], ['metros por minuto', 'M/min P90'], ['dist. corrida', 'Running Distance P90']];
  const vTec = (rot, a) => { const k = nk(rot); const m = TEC.find(([re]) => re.test(k)); return m ? m[1](a) : null; };
  const vFis = (rot, d) => { if (!d || !d.linha) return null; const k = nk(rot); const m = FIS.find(([p]) => k.startsWith(p)); if (!m) return null; const v = parseFloat(d.linha[m[1]]); return isFinite(v) ? v : null; };
  const casas = (v, rot) => { if (v == null) return 1; const a = Math.abs(v); return /%/.test(rot) ? 1 : a >= 100 ? 0 : a >= 10 ? 1 : 2; };

  /* ---------- o documento (mesmo desenho do PDF) ---------- */
  const cor = (x, sobe, med, inv) => { const r = sobe != null ? sobe : med; if (x == null || r == null) return 'n'; if (inv) return x <= r ? 'v' : x <= r * 1.1 ? 'a' : 'r'; return x >= r ? 'v' : x >= r * 0.9 ? 'a' : 'r'; };
  const cel = (x, d, top, c, inv) => { if (x == null) return '<span class="v n"><b>—</b><i class="br"></i></span>'; const w = Math.max(3, Math.min(100, (inv ? 1 - x / (top * 1.15) : x / top) * 100));
    return '<span class="v ' + c + '"><b>' + f(x, d) + '</b><i class="br"><i class="' + c + '" style="width:' + w.toFixed(0) + '%"></i></i></span>'; };
  const melhor = (a, b, inv) => a == null || b == null || Math.abs(a - b) < 1e-9 ? [false, false] : inv ? [a < b, b < a] : [a > b, b > a];
  const refs = (l, d) => '<span class="ref s">' + (l.sobe != null ? f(l.sobe, d) : '') + '</span><span class="ref">' + (l.med != null ? f(l.med, d) : '') + '</span><span class="ref mx">' + (l.mx != null ? f(l.mx, d) : '') + '</span>';

  function doc(A, B, pa, pb, da, db) {
    const CA = '#3fa3e6', CB = '#e0a82e', nA = A.nc && A.nc.length < 18 ? A.nc : A.n, nB = B.nc && B.nc.length < 18 ? B.nc : B.n;
    const cA = { fis: 0, tec: 0 }, cB = { fis: 0, tec: 0 }, fund = { a: [0, 0], b: [0, 0], fa: [0, 0], fb: [0, 0] };
    /* físico */
    const gf = refsFis(A);
    const fisH = gf.map(g => {
      const ls = g.ls.map(l => {
        const a = vFis(l.rot, da.fis), b = vFis(l.rot, db.fis); if (a == null && b == null) return '';
        const d = casas(a != null ? a : b, l.rot), top = Math.max(...[a, b, l.sobe, l.med, l.mx].filter(x => x != null), 1e-6);
        const [ga, gb] = melhor(a, b, l.menor); if (ga) cA.fis++; if (gb) cB.fis++;
        if (l.fund && l.sobe != null) { fund.fa[1]++; fund.fb[1]++; if (cor(a, l.sobe, l.med, l.menor) === 'v') fund.fa[0]++; if (cor(b, l.sobe, l.med, l.menor) === 'v') fund.fb[0]++; }
        return '<div class="ln f' + (l.fund ? ' fund' : '') + '"><span class="rot">' + (l.fund ? '<i class=dot>◆</i>' : '') + esc(l.rot) + '</span>' +
          '<span class="w' + (ga ? ' g' : '') + '">' + cel(a, d, top, cor(a, l.sobe, l.med, l.menor), l.menor) + '</span><span class="w' + (gb ? ' g' : '') + '">' + cel(b, d, top, cor(b, l.sobe, l.med, l.menor), l.menor) + '</span>' + refs(l, d) + '</div>';
      }).join('');
      return ls ? '<div class="sub"><span>' + esc(g.nome) + '</span></div>' + ls : '';
    }).join('');
    const jfA = da.fis ? da.fis.jogos : 0, jfB = db.fis ? db.fis.jogos : 0;
    const fisBloco = '<div class="bloco"><h4 class="gh fis">FÍSICO <small>SkillCorner · por 90 · jogos com 60+ min desde ' + br(da.de) + '</small></h4>' +
      '<div class="ln f cab"><span class="rot">indicador</span><span style="color:' + CA + '">' + esc(nA) + '<small>' + jfA + ' jogos</small></span><span style="color:' + CB + '">' + esc(nB) + '<small>' + jfB + ' jogos</small></span><span class="ref s">sobe</span><span class="ref">média</span><span class="ref mx">melhor</span></div>' +
      (fisH || '<div class="vazio">sem dado do SkillCorner nos 12 meses' + (!da.sc || !db.sc ? ' (jogador não achado no SkillCorner pela data de nascimento)' : '') + '</div>') + '</div>';
    /* técnico */
    const ta = da.tec.tudo, tb = db.tec.tudo, la = da.tec.liga, lb = db.tec.liga;
    const ligaA = la ? la.nome.replace(/^[^.]*\.\s*/, '') : '', ligaB = lb ? lb.nome.replace(/^[^.]*\.\s*/, '') : '';
    const gt = refsTec(A);
    const def = gt.find(g => /defesa|duelo/i.test(g.nome)) || gt[gt.length - 1];
    const cabT = '<div class="ln t gcab"><span class="rot"></span><span class="grp">12 MESES</span><span class="sp"></span><span class="grp">SÓ A LIGA' + (ligaA && ligaA === ligaB ? ' (' + esc(ligaA.toUpperCase()) + ')' : '') + '</span><span class="ref s"></span><span class="ref"></span><span class="ref mx"></span></div>' +
      '<div class="ln t cab"><span class="rot">indicador</span><span style="color:' + CA + '">' + esc(nA) + '</span><span style="color:' + CB + '">' + esc(nB) + '</span><span class="sp"></span><span style="color:' + CA + '">' + esc(nA) + '</span><span style="color:' + CB + '">' + esc(nB) + '</span><span class="ref s">sobe</span><span class="ref">média</span><span class="ref mx">melhor</span></div>';
    const linT = (rot, fn, l) => {
      const vs = [fn(ta), fn(tb), fn(la), fn(lb)]; if (vs.every(v => v == null)) return '';
      const d = casas(vs.find(v => v != null), rot), top = Math.max(...vs.concat([l.sobe, l.med, l.mx]).filter(x => x != null), 1e-6);
      const par = (a, b, conta) => { const [ga, gb] = melhor(a, b, l.menor); if (conta) { if (ga) cA.tec++; if (gb) cB.tec++; }
        return '<span class="w' + (ga ? ' g' : '') + '">' + cel(a, d, top, cor(a, l.sobe, l.med, l.menor), l.menor) + '</span><span class="w' + (gb ? ' g' : '') + '">' + cel(b, d, top, cor(b, l.sobe, l.med, l.menor), l.menor) + '</span>'; };
      if (l.fund && l.sobe != null && vs[0] != null && vs[1] != null) { fund.a[1]++; fund.b[1]++; if (cor(vs[0], l.sobe, l.med, l.menor) === 'v') fund.a[0]++; if (cor(vs[1], l.sobe, l.med, l.menor) === 'v') fund.b[0]++; }
      return '<div class="ln t' + (l.fund ? ' fund' : '') + '"><span class="rot">' + (l.fund ? '<i class=dot>◆</i>' : '') + esc(rot) + '</span>' + par(vs[0], vs[1], true) + '<span class="sp"></span>' + par(vs[2], vs[3], false) + refs(l, d) + '</div>';
    };
    const COR_G = ['#b8740f', '#2f5fb3', '#b3263a'];
    const tecH = gt.map((g, i) => {
      let ls = g.ls.map(l => linT(l.rot, a => vTec(l.rot, a), l)).join('');
      if (g === def) ls += EXTRA.map(([rot, fn, inv]) => linT(rot, fn, { menor: !!inv })).join('');
      return ls ? '<div class="bloco"><h4 class="gh" style="background:' + (/defesa/i.test(g.nome) ? COR_G[2] : /ataque/i.test(g.nome) ? COR_G[1] : COR_G[0]) + '">' + esc(g.nome.toUpperCase()) + '</h4>' + cabT + ls + '</div>' : '';
    }).join('');
    /* minutagem */
    const minL = (j, d, c) => (d.tec.clubes || []).map((k, i) => { const p = k.cmin ? Math.round(100 * k.min / k.cmin) : null, cl = p == null ? '' : p >= 60 ? 'v' : p >= 40 ? 'a' : 'r';
      return '<tr' + (i === 0 ? ' class="sep"' : '') + '><td style="color:' + c + '">' + (i === 0 ? '<b>' + esc(j) + '</b>' : '') + '</td><td>' + esc(k.nome) + '</td><td>' + mesAno(k.de) + '–' + mesAno(k.ate) + '</td><td><b>' + k.j + '</b></td><td><b>' + k.j80 + '</b></td><td><b>' + f(k.min, 0) + '</b> <small>de ' + f(k.cmin, 0) + '</small></td><td><b class="pc ' + cl + '">' + (p == null ? '—' : p + '%') + '</b> <small class="obs">' + k.j + ' de ' + k.cj + ' jogos</small></td></tr>'; }).join('');
    const MIN = '<table class="mt"><thead><tr><th></th><th>Clube</th><th>Período</th><th>Jogos</th><th>80+ min</th><th>Minutos</th><th>% do clube</th></tr></thead><tbody>' + minL(nA, da, CA) + minL(nB, db, CB) + '</tbody></table>';
    const minTot = d => { const k = d.tec.clubes || []; const m = k.reduce((s, x) => s + x.min, 0), c = k.reduce((s, x) => s + x.cmin, 0); return { m, c, p: c ? Math.round(100 * m / c) : null }; };
    /* cabeçalhos */
    const tg = (c, t) => '<i class="tg" style="background:' + c + '">' + t + '</i>';
    const corP = (x, y) => !y ? '#6f7b8b' : x / y >= 0.6 ? '#1f9d55' : x / y >= 0.4 ? '#c98a00' : '#d64545';
    const corMin = p => p == null ? 'n' : p >= 60 ? 'v' : p >= 40 ? 'a' : 'r';
    const cab = (j, p, d, c, fu) => {
      let tipo = null, seg = null; try { tipo = tipoResolvido(j); } catch (e) {} try { seg = segTempoDe(j); } catch (e) {}
      let letra = ''; try { letra = tipoLetra(j) || ''; } catch (e) {}
      const corL = { A: '#1f9d55', B: '#c98a00', C: '#d64545' }[letra] || '#6f7b8b';
      const corS = seg ? ({ verde: '#1f9d55', amarelo: '#c98a00', vermelho: '#d64545' }[seg.c] || '#6f7b8b') : '#6f7b8b';
      const nasc = (p && p.nasc) || (d.wyId && d.wyId.nasc) || '', id = j.id_ || (nasc ? Math.floor((Date.now() - Date.parse(nasc)) / 31557600000) : null);
      const ct = j.ct || (p && p.contrato) || '', mt = minTot(d);
      const foto = (p && p.foto) || (d.wyId && d.wyId.foto) || '';
      const escudo = p && p.clubeId ? 'https://tmssl.akamaized.net/images/wappen/normquad/' + p.clubeId + '.png' : (d.wyId && d.wyId.escudo) || '';
      const kv = pares => pares.map(([k, v]) => '<div><span>' + k + '</span><b>' + v + '</b></div>').join('');
      return '<div class="jg" style="border-color:' + c + '">' + (foto ? '<img class="fo" src="' + esc(foto) + '" referrerpolicy="no-referrer" onerror="this.style.visibility=\'hidden\'">' : '<span class="fo"></span>') +
        '<div class="jd"><h2 style="color:' + c + '">' + esc(j.nc || j.n) + '</h2><div class="s">' + (escudo ? '<img src="' + esc(escudo) + '" referrerpolicy="no-referrer" onerror="this.remove()">' : '') + esc([j.t, j.l, j.p].filter(Boolean).join(' · ')) + '</div>' +
        '<div class="s2">' + (id ? '<b>' + id + '</b> anos' : '') + (nasc ? ' · nasc. ' + br(nasc) : '') + ((p && p.alt) || j.alt ? ' · ' + ((p && p.alt) || j.alt) + (String((p && p.alt) || j.alt).includes('m') ? '' : ' cm') : '') + ((p && p.pe) || j.pe ? ' · ' + esc((p && p.pe) || j.pe) : '') + '</div>' +
        '<div class="kv">' + kv([['Contrato', ct ? br(ct) : '—'], ['Valor de mercado', p && p.valor ? esc(p.valor) : '—'], ['Tipo físico', letra ? tg(corL, letra) + esc((tipo && tipo.tipo) || '').toLowerCase() : '—'],
          ['2º tempo', seg ? tg(corS, esc(String(seg.nome || '').toUpperCase())) + (seg.manut ? Math.round(seg.manut * 100) + '%' : '') : '—'],
          ['Técnico (fundamentais)', fu[1] ? tg(corP(fu[0], fu[1]), fu[0] + '/' + fu[1]) + 'no nível de quem sobe' : '—'],
          ['Minutagem 12 meses', mt.p != null ? '<i class="pc ' + corMin(mt.p) + '">' + mt.p + '%</i> ' + f(mt.m, 0) + ' de ' + f(mt.c, 0) + ' min' : '—']]) + '</div></div></div>';
    };
    const leg = '<div class="leg"><span>Cor: <b style="color:#4fd18b">na régua ou acima</b> · <b style="color:#f0b429">até 10% abaixo</b> · <b style="color:#ff6b6b">abaixo</b></span><span>◆ fundamental: régua = <b style="color:#b9a7ff">sobe</b> (titulares dos times que subiram da Série B); nos demais, a <b>média</b> da Série B</span><span>média e <b style="color:#7fb0ff">melhor</b> = ' + esc(A.p || '') + ' da Série B · ↓ menor é melhor · <b style="color:#fff">caixa e ▲ = o melhor dos dois</b></span></div>';
    const mA = minTot(da), mB = minTot(db);
    const quem = (x, y) => x > y ? '<b style="color:' + CA + '">' + esc(nA) + '</b>' : y > x ? '<b style="color:' + CB + '">' + esc(nB) + '</b>' : 'empate';
    const LEIT = [
      ['Físico', fisH ? 'Melhor nos indicadores físicos: ' + quem(cA.fis, cB.fis) + ' (<b>' + cA.fis + '</b> × <b>' + cB.fis + '</b>). Fundamentais (◆) no nível de quem sobe: ' + esc(nA) + ' <b>' + fund.fa[0] + '/' + fund.fa[1] + '</b>, ' + esc(nB) + ' <b>' + fund.fb[0] + '/' + fund.fb[1] + '</b>.' : 'Sem físico do SkillCorner para os dois.'],
      ['Técnico', 'Nos 12 meses, melhor em mais indicadores: ' + quem(cA.tec, cB.tec) + ' (<b>' + cA.tec + '</b> × <b>' + cB.tec + '</b>). Fundamentais (◆) no nível de quem sobe: ' + esc(nA) + ' <b>' + fund.a[0] + '/' + fund.a[1] + '</b>, ' + esc(nB) + ' <b>' + fund.b[0] + '/' + fund.b[1] + '</b>.'],
      ['Disponibilidade', esc(nA) + ' jogou <b>' + (mA.p == null ? '—' : mA.p + '%') + '</b> dos minutos do clube (' + f(mA.m, 0) + ' min, <b>' + ta.j + '</b> jogos, <b>' + ta.j80 + '</b> com 80+); ' + esc(nB) + ' <b>' + (mB.p == null ? '—' : mB.p + '%') + '</b> (' + f(mB.m, 0) + ' min, <b>' + tb.j + '</b> jogos, <b>' + tb.j80 + '</b> com 80+).'],
    ];
    const box = ([t, x]) => '<div class="li"><b>' + t + '</b><p>' + x + '</p></div>';
    const CSS_APP = '.pg{height:auto;min-height:1018px;overflow:visible} .fonte{position:static;margin-top:10px} .vazio{padding:10px;color:#8a93a0;font-size:11px} span.fo{display:inline-block;background:#1b212b}' +
      '@media print{html,body{background:#11151c} .pg{zoom:.78}}';
    return '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(nA + ' x ' + nB + ' - ultimos 12 meses') + '</title><style>' + CSS_DOC + CSS_APP + '</style></head><body><div class="pg">' +
      '<div class="cab0"><h1>' + esc(nA) + ' × ' + esc(nB) + (A.p ? ' · ' + esc(A.p) : '') + '</h1><span>Últimos 12 meses · ' + br(da.de) + ' a ' + br(da.tec.ate || hojeISO()) + ' · Wyscout (técnico, jogos oficiais) e SkillCorner (físico)</span></div>' +
      '<div class="jgs">' + cab(A, pa, da, CA, fund.a) + cab(B, pb, db, CB, fund.b) + '</div>' + leg +
      '<div class="lay"><div>' + fisBloco + '<div style="margin-top:8px">' + MIN + '</div><div class="leit" style="margin-top:8px">' + box(LEIT[0]) + '</div></div><div><div class="tec">' + tecH + '</div><div class="leit" style="margin-top:8px">' + box(LEIT[1]) + box(LEIT[2]) + '</div></div></div>' +
      '<div class="fonte">Técnico: Wyscout, estatísticas por jogo, jogos oficiais (sem amistosos, seleção e base), por 90 sobre todos os minutos desde ' + br(da.de) + '. "Só a liga" = a liga do jogo de liga mais recente de cada um (' + esc(ligaA || '—') + ' · ' + esc(ligaB || '—') + '). "% do clube" = minutos dele ÷ minutos dos jogos oficiais do clube no período em que esteve lá. Físico: SkillCorner, jogos com 60+ min. Réguas (sobe, média, melhor), indicadores, tipo físico e 2º tempo: ficha de ' + esc(nA) + ' no app Santa Cruz 2027. Gerado em ' + br(hojeISO()) + '.</div>' +
      '</div></body></html>';
  }

  /* ---------- na ficha ---------- */
  function barra(corpo, par) {
    let bx = document.getElementById('cmp12Box');
    if (!bx) { bx = document.createElement('div'); bx.id = 'cmp12Box'; corpo.prepend(bx); }
    const e = EST[par] || {};
    bx.innerHTML = '<div class="c12-bar"><b>Comparativo</b><button type="button" class="bt mini' + (modo === '12m' ? ' on' : '') + '" data-m="12m">📅 últimos 12 meses</button>' +
      '<button type="button" class="bt mini' + (modo === 'base' ? ' on' : '') + '" data-m="base">📋 base da ficha</button>' +
      (modo === '12m' ? '<button type="button" class="bt mini" id="c12Pdf"' + (e.st === 'ok' ? '' : ' disabled') + '>📄 Gerar PDF</button><button type="button" class="bt mini" id="c12Re" title="Busca de novo no Wyscout e no SkillCorner">↻</button>' : '') +
      '<span class="c12-st">' + (modo === '12m' ? (e.st === 'busca' ? '⏳ buscando no Wyscout e no SkillCorner…' : e.st === 'erro' ? '✖ ' + e.msg : e.st === 'ok' ? 'Wyscout e SkillCorner · ' + br(de12()) + ' a ' + br(hojeISO()) : '') : '') + '</span></div>' +
      (modo === '12m' && e.st === 'escolher' ? e.html : '') +
      (modo === '12m' && e.st === 'ok' ? '<div class="c12-fr"><iframe id="c12If" title="comparativo 12 meses"></iframe></div>' : '');
    bx.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { modo = b.dataset.m; try { localStorage.setItem(LS_MODO, modo); } catch (e) {} aplicar(); });
    const pdf = bx.querySelector('#c12Pdf'); if (pdf) pdf.onclick = () => { const w = bx.querySelector('#c12If'); if (w && w.contentWindow) { w.contentWindow.focus(); w.contentWindow.print(); } };
    const re = bx.querySelector('#c12Re'); if (re) re.onclick = () => { const c = window.cmpAtual && window.cmpAtual(); if (!c) return;
      const all = lsGet(); [c.a, c.b].forEach(j => { delete all['d:' + pkDe(j) + ':' + hojeISO()]; }); try { localStorage.setItem(LS, JSON.stringify(all)); } catch (e) {} delete EST[par]; aplicar(); };
    bx.querySelectorAll('.c12-op').forEach(b => b.onclick = () => { lsSet('wy:' + b.dataset.pk, JSON.parse(b.dataset.v)); delete EST[par]; aplicar(); });
    const ifr = bx.querySelector('#c12If');
    if (ifr && e.doc) {
      ifr.srcdoc = e.doc;
      const ajusta = () => { const w = ifr.parentElement.clientWidth || 1200, z = Math.min(1, w / 1440); const d = ifr.contentDocument; const h = d && d.body ? d.body.scrollHeight : 1018;
        ifr.style.transform = 'scale(' + z + ')'; ifr.style.height = h + 'px'; ifr.parentElement.style.height = Math.ceil(h * z) + 'px'; };
      ifr.onload = () => { ajusta(); setTimeout(ajusta, 400); };
      if (!barra._rs) { barra._rs = true; window.addEventListener('resize', () => { const i = document.getElementById('c12If'); if (i && i.onload) i.onload(); }); }
    }
  }
  function escolhaHtml(j, ops) {
    return '<div class="c12-esc"><b>Qual é o ' + esc(j.nc || j.n) + ' (' + esc(j.t) + (j.id_ ? ', ' + j.id_ + ' anos' : '') + ') no Wyscout?</b> O app não teve certeza pelo clube e pela idade:' +
      ops.map(o => '<button type="button" class="bt mini c12-op" data-pk="' + esc(pkDe(j)) + '" data-v="' + esc(JSON.stringify({ id: o.id, nasc: o.nasc, nome: o.nome, completo: o.completo, clube: o.clube, foto: o.foto, escudo: o.escudo })) + '">' +
        esc(o.nome) + ' · ' + esc(o.clube || '—') + ' · ' + esc(br(o.nasc) || '?') + ' · ' + esc(o.pos || '') + '</button>').join('') + '</div>';
  }
  async function carregar(par, A, B) {
    EST[par] = { st: 'busca' }; aplicar();
    try {
      const v = await ext({ tipo: 'ping' });
      if (v.erro) throw new Error('semext');
      if (!verMaior(v.versao, VERSAO_MIN)) throw new Error('A extensão BFR Busca Jogador está na versão ' + v.versao + '; o comparativo pede a ' + VERSAO_MIN + ' (clique no ↻ dela em chrome://extensions).');
      const [da, db] = [await dados(A), await dados(B)];
      if (da.escolher || db.escolher) { EST[par] = { st: 'escolher', html: (da.escolher ? escolhaHtml(A, da.escolher) : '') + (db.escolher ? escolhaHtml(B, db.escolher) : '') }; aplicar(); return; }
      let pa = null, pb = null; try { pa = await perfilExtraDe(A); } catch (e) {} try { pb = await perfilExtraDe(B); } catch (e) {}
      EST[par] = { st: 'ok', doc: doc(A, B, pa, pb, da, db) };
    } catch (e) {
      const m = String(e && e.message || e);
      EST[par] = { st: 'erro', msg: m === 'semext' ? 'A extensão BFR Busca Jogador não respondeu neste Chrome (Santa Cruz/extensao_busca_jogador, versão ' + VERSAO_MIN + '+). Sem ela, use "base da ficha".' : m };
    }
    aplicar();
  }
  function aplicar() {
    const c = window.cmpAtual && window.cmpAtual();
    const corpo = document.getElementById('fiCorpo');
    if (!c || !corpo) { const bx = document.getElementById('cmp12Box'); if (bx) bx.remove(); if (corpo) corpo.classList.remove('cmp12-on'); return; }
    const par = pkDe(c.a) + '|' + pkDe(c.b);
    corpo.classList.toggle('cmp12-on', modo === '12m');
    barra(corpo, par);
    if (modo === '12m' && !EST[par]) carregar(par, c.a, c.b);
  }
  document.addEventListener('cmp:render', aplicar);
})();
