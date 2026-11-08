/* 08/11/2026 — aba 6 "Decisão": pergunte ao modelo e ele responde com nome, porquê, alternativas e o que ficou de fora.
   Junta, numa conta só e ao vivo no navegador, tudo o que o app já calcula para cada jogador:
     - técnico: a nota do estudo V2 (aderência convertida pela reta de liga + nível), e a seta técnica contra a régua de quem sobe;
     - físico: a letra A+/A/B/C (SkillCorner) e o piso de velocidade (PSV-99 ≥ 27 km/h);
     - 2º tempo (SkillCorner 1º × 2º tempo), minutagem dos últimos 3 anos (Wyscout), bola parada (índices + jogo a jogo),
       xT, SofaScore, Transfermarkt (contrato, valor, foto), TransferRoom Scout (listas), indicados, vetados;
     - a força de cada liga (Portal Ranking/Peso Ligas.xlsx) e as premissas do clube (massa salarial, 9 estrangeiros, vagas por posição).
   Duas perguntas principais: "quem contratar para <posição>" e "qual o melhor elenco com R$ X por mês" (otimizador com orçamento).
   Dados fixos: static/decisao_dados.js (gerar_decisao_js.py). Tudo o que é escolha do modelo está em PREM (editável na tela). */
(function () {
  'use strict';
  const REF = window.DECISAO_REF || { forca: {}, conversao: {}, excluidos: [], grandes: [], alcancaveis: [], sulam: [], fracas: [], crivo: {}, teto_valor: 2000000 };
  const LS_PREM = 'sc2027_decisao_prem', LS_SAL = 'sc2027_decisao_sal', LS_ULT = 'sc2027_decisao_ultima';
  const $q = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (x, d) => (x == null || !isFinite(x)) ? '—' : Number(x).toLocaleString('pt-BR', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  const R0 = x => (x == null || !isFinite(x)) ? '—' : String(Math.round(x));
  const brl = n => (n == null || !isFinite(n)) ? '—' : 'R$ ' + Math.round(n).toLocaleString('pt-BR');
  const brlk = n => (n == null || !isFinite(n)) ? '—' : (Math.abs(n) >= 1e6 ? 'R$ ' + (n / 1e6).toFixed(2).replace('.', ',') + ' mi' : 'R$ ' + Math.round(n / 1000) + ' mil');
  const nz = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const ma = s => (s && s.length >= 7) ? MES[+s.slice(5, 7) - 1] + '/' + s.slice(0, 4) : '—';
  const br = s => (s && s.length >= 10) ? s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4) : '';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const POSN = { GOL: 'Goleiro', LD: 'Lateral direito', LE: 'Lateral esquerdo', ZD: 'Zagueiro direito', ZE: 'Zagueiro esquerdo', VOL: 'Volante', MED: 'Médio', MEI: 'Meia', ED: 'Extremo direito', EE: 'Extremo esquerdo', CA: 'Centroavante' };
  const ORDEM = ['GOL', 'LD', 'ZD', 'ZE', 'LE', 'VOL', 'MED', 'MEI', 'ED', 'EE', 'CA'];
  const FIS_PESA = { LD: 1, LE: 1, EE: 1, VOL: 1, MED: 1 };          /* a mesma regra do farol do app */
  const BP_COBR = { MEI: 1, ED: 1, EE: 1, MED: 1, LD: 1, LE: 1 }, BP_AER = { ZD: 1, ZE: 1, CA: 1 }, GOL_DEF = { ZD: 1, ZE: 1, VOL: 1, LD: 1, LE: 1 }, AREA = { LD: 1, LE: 1, VOL: 1, MEI: 1, ED: 1, EE: 1, MED: 1 };
  const LIVRE_ATE = '2027-01-31';
  const SIGP = c => (typeof sig === 'function' ? sig(c) : c);
  const LETRA_PTS = { 'A+': 100, A: 85, B: 55, C: 20 }, T2_PTS = { azul: 100, verde: 75, amarelo: 40, vermelho: 10 };
  const BR_LIGAS = ['Brasil A', 'Brasil B', 'Brasil C'];
  const forcaB = (REF.forca && REF.forca['Brasil B']) || 52.8;
  const forcaDe = l => { const f = REF.forca && REF.forca[l]; if (f != null) return f; if (/^Brasil/.test(l || '') || l === 'Manual' || l === '(Footlink BR)') return forcaB; return 45; };

  /* ---------------- premissas do modelo (editáveis na tela; ficam no navegador) ---------------- */
  const PREM0 = {
    pesos: { tec: 45, fis: 15, t2: 10, min: 10, idade: 10, liga: 10 },
    pesosFis: { tec: 35, fis: 25, t2: 10, min: 10, idade: 10, liga: 10 },     /* onde o físico pesa: LD, LE, EE, VOL, MED */
    pesosGol: { tec: 55, fis: 0, t2: 0, min: 20, idade: 10, liga: 15 },
    bonus: { cob: 4, aer: 3, golDef: 2, area: 2, semFis: -3, parcial: -3 },
    filtros: { minMin: 900, psvPiso: 27, tetoValor: REF.teto_valor || 2000000, semSerieA: false, soAlcancaveis: true, semGrandes: true, vetados: true, duplicatas: true },
    salario: { cotacao: 6.3, fatorTR: 1.4, tetoPadrao: 200000, liga: { 'Brasil A': 170000, 'Brasil B': 90000, 'Brasil C': 40000, sulamA: 90000, sulamB: 40000, exterior: 90000, outras: 350000 } },
    slots: [1, 0.6, 0.4, 0.3, 0.25],
    idade: { titular: [[20, 70], [22, 82], [30, 100], [31, 92], [32, 85], [33, 72], [34, 60], [99, 45]], aposta: [[20, 100], [23, 95], [26, 80], [29, 65], [32, 45], [99, 25]] },
  };
  let PREM = JSON.parse(JSON.stringify(PREM0));
  try { const g = JSON.parse(localStorage.getItem(LS_PREM) || 'null'); if (g) { ['pesos', 'pesosFis', 'pesosGol', 'bonus', 'filtros'].forEach(k => Object.assign(PREM[k], g[k] || {})); if (g.salario) { Object.assign(PREM.salario, g.salario); PREM.salario.liga = Object.assign({}, PREM0.salario.liga, (g.salario && g.salario.liga) || {}); } } } catch (e) {}
  const premGrava = () => { try { localStorage.setItem(LS_PREM, JSON.stringify(PREM)); } catch (e) {} };
  let SALX = {}; try { SALX = JSON.parse(localStorage.getItem(LS_SAL) || '{}') || {}; } catch (e) {}
  const salxGrava = () => { try { localStorage.setItem(LS_SAL, JSON.stringify(SALX)); } catch (e) {} };

  /* ---------------- bases auxiliares (índices montados uma vez) ---------------- */
  let VET = null, AMX = null, TRX = null, INDX = null, SOFX = null;
  function vetados() {
    if (VET) return VET;
    VET = { nome: new Map(), clube: new Set() };
    (REF.excluidos || []).forEach(([j, c, m]) => { if (j === '*') VET.clube.add(nz(c)); else { const k = nz(j); (VET.nome.get(k) || VET.nome.set(k, []).get(k)).push({ c: nz(c), m }); } });
    return VET;
  }
  function vetadoDe(b) {
    const V = vetados(), l = V.nome.get(nz(b.n)) || [];
    for (const x of l) if (!x.c || x.c === nz(b.t) || (typeof clubeParecido === 'function' && clubeParecido(b.t, x.c))) return x.m || 'vetado pelo clube';
    if (V.clube.has(nz(b.t))) return 'clube inteiro fora (inalcançável)';
    return null;
  }
  function ameacaDe(b) {
    if (!window.AMEACA) return null;
    if (!AMX) { AMX = new Map(); AMEACA.jog.forEach(x => { AMX.set(nz(x.n) + '|' + nz(x.c), x); }); }
    return AMX.get(nz(b.n) + '|' + nz(b.t)) || null;
  }
  function listasTR(b) {
    const D = window.DESTAQUES_TR; if (!D || !D.jogadores) return [];
    if (!TRX) { TRX = new Map(); Object.keys(D.jogadores).forEach(id => { const x = D.jogadores[id]; const k = nz(x.n); (TRX.get(k) || TRX.set(k, []).get(k)).push(x); }); }
    const c = TRX.get(nz(b.n)) || [], c2 = c.filter(x => typeof clubeParecido === 'function' ? clubeParecido(x.c, b.t) : nz(x.c) === nz(b.t));
    const x = c2[0] || (c.length === 1 ? c[0] : null);
    return x ? (x.l || []) : [];
  }
  function indicadoDe(b) {
    const L = (typeof INDICADOS !== 'undefined' && Array.isArray(INDICADOS)) ? INDICADOS : null; if (!L) return null;
    if (!INDX || INDX.n !== L.length) { INDX = { n: L.length, m: new Map() }; L.forEach(x => { const k = nz(x.nome || x.n || ''); if (k) (INDX.m.get(k) || INDX.m.set(k, []).get(k)).push(x); }); }
    const c = INDX.m.get(nz(b.n)) || []; return c.length ? c[0] : null;
  }
  function sofaDe(b, pk) {
    const S = window.SOFA; if (!S || !S.jog) return null;
    const r = S.jog[pk]; if (!r) return null;
    const i = S.campos.indexOf('rating'); return { nota: i >= 0 ? r[i] : null, min: r[S.campos.indexOf('minutesPlayed')] };
  }
  function cardDe(pk) {
    if (typeof estado === 'undefined' || !estado || !estado.elenco) return null;
    for (const p of POSICOES) { const c = (estado.elenco[p.c] || []).find(x => x.pk === pk); if (c) return Object.assign({ pos: p.c }, c); }
    return null;
  }
  const kpiCache = {};
  async function kpisPos(pos) {
    if (kpiCache[pos] !== undefined) return kpiCache[pos];
    try {
      if (typeof cachePosKpis !== 'undefined') {
        if (!cachePosKpis[pos]) cachePosKpis[pos] = fetch('dados/kpis/' + pos + '.json' + (window.__verDados ? '?v=' + window.__verDados : '')).then(r => (r.ok ? r.json() : null)).catch(() => null);
        kpiCache[pos] = await cachePosKpis[pos];
      } else kpiCache[pos] = await fetch('dados/kpis/' + pos + '.json').then(r => (r.ok ? r.json() : null)).catch(() => null);
    } catch (e) { kpiCache[pos] = null; }
    return kpiCache[pos];
  }
  function mercadoDe(l) { if (l === 'Brasil B') return 'Série B'; if (l === 'Brasil A') return 'Série A'; if ((REF.sulam || []).includes(l)) return 'Sul-americano'; if (l === 'Brasil C') return 'Série C'; return 'Exterior'; }
  function converter(merc, p) { const c = (REF.conversao || {})[merc === 'Série C' ? 'Série B' : merc]; if (!c) return p; return merc === 'Série C' ? 46 + 0.12 * p : c[0] + c[1] * p; }
  function ligaPermitida(l, f) {
    if (!l) return true;
    if (BR_LIGAS.includes(l) || l === 'Manual' || l === '(Footlink BR)') return !(f.semSerieA && l === 'Brasil A');
    if (!f.soAlcancaveis) return true;
    return (REF.sulam || []).includes(l) || (REF.alcancaveis || []).includes(l);
  }
  function curvaIdade(tab, a) { for (const [lim, s] of tab) if (a <= lim) return s; return tab[tab.length - 1][1]; }
  function idadeScore(a, papel) { if (a == null) return 60; return curvaIdade(PREM.idade[papel === 'aposta' ? 'aposta' : 'titular'], a); }

  /* ---------------- salário estimado (R$/mês, o que o jogador recebe) ----------------
     1) o do campograma (digitado pelo Henrique) · 2) o digitado nesta aba · 3) faixa anual do TransferRoom (€) × cotação ÷ 12 × fator
     (calibrado nos salários já digitados: o TransferRoom fica ~40% abaixo) · 4) estimativa pela liga e pela nota técnica. */
  function trMid(s) {
    const m = /([\d.,]+)\s*([KM])\s*-\s*([\d.,]+)\s*([KM])/i.exec(String(s || '')); if (!m) return null;
    const v = (x, u) => parseFloat(x.replace(',', '.')) * (u.toUpperCase() === 'M' ? 1e6 : 1e3);
    return (v(m[1], m[2]) + v(m[3], m[4])) / 2;
  }
  function salarioDe(b, card, tec) {
    const pk = typeof primaryKey === 'function' ? primaryKey(b) : b.n;
    if (card && Number(card.salario) > 0) return { v: Number(card.salario), f: 'campograma' };
    if (SALX[pk] > 0) return { v: SALX[pk], f: 'digitado' };
    const S = PREM.salario, mid = trMid(b.sal);
    if (mid) return { v: Math.round(mid * S.cotacao / 12 * S.fatorTR / 1000) * 1000, f: 'TransferRoom' };
    const l = b.l || '', L = S.liga;
    let base = L[l] != null ? L[l] : (REF.sulam || []).includes(l) ? (/ B$| RESERVAS$/.test(l) ? L.sulamB : L.sulamA) : (REF.alcancaveis || []).includes(l) ? L.exterior : L.outras;
    const t = tec == null ? 50 : tec;
    return { v: Math.round(base * (0.55 + 0.9 * t / 100) / 1000) * 1000, f: 'estimado pela liga' };
  }

  /* ---------------- a avaliação de um jogador numa posição ---------------- */
  function avaliar(b, pos, kp, Q) {
    const pk = primaryKey(b);
    let o = b; try { const od = objDoRaio(pk, null, b); if (od && od.obj) o = od.obj; } catch (e) {}
    let js = o; try { js = comPosCampo(o) || o; } catch (e) {}
    if (js.p !== pos) js = Object.assign({}, js, { p: pos, _posBase: js._posBase || js.p });
    const card = cardDe(pk);
    let cs = null; try { cs = csRegistro(b); } catch (e) {}
    const ls = kp && kp.jogadores ? kp.jogadores[pk] : null;
    const dados = ls ? { ok: true, periodo: kp.periodo, nomes: kp.kpis, linhas: ls } : null;
    let s = null; try { s = (typeof window.subidaSeloInfo === 'function') ? window.subidaSeloInfo(js, dados) : null; } catch (e) {}
    let L0 = null, mais = false, tipo = null; try { L0 = pos === 'GOL' ? null : tipoLetra(js); mais = !!(L0 && tipoMais(js)); tipo = L0 ? tipoNome(js) : null; } catch (e) {}
    const letra = L0 ? (mais ? 'A+' : L0) : null;
    const psv = typeof js.psv === 'number' ? js.psv : (cs && cs.sofa && cs.sofa.vmax ? null : null);
    let t2 = null; try { t2 = pos === 'GOL' ? null : segTempoDe(js); } catch (e) {}
    let mi = null, h = null; try { mi = minutagemDe(b); h = histDe(b, pk); } catch (e) {}
    const h26 = h && h[2] && (h[2].min || h[2].j) ? h[2] : null;
    const min26 = (h26 && h26.min) || b.min || null;
    let bpw = null; try { bpw = window.bpWyRegistro ? window.bpWyRegistro(b) : null; } catch (e) {}
    let cobW = 0, gbpW = 0; if (bpw && bpw.a) Object.values(bpw.a).forEach(x => { cobW += (x.c || 0) + (x.fc || 0) + (x.fd || 0) + (x.pe || 0); gbpW += (x.ge || 0) + (x.gf || 0) + (x.gd || 0) + (x.gl || 0); });
    const am = ameacaDe(b), sofa = (cs && cs.sofa) ? { nota: cs.sofa.nota, min: null } : sofaDe(b, pk);
    const listas = listasTR(b), ind = indicadoDe(b);
    const idade = b.id_ != null ? Number(b.id_) : null, idade27 = idade != null ? idade + 1 : null;
    const estr = typeof ehEstrangeiroBase === 'function' ? ehEstrangeiroBase(b) : false;
    const ct = b.ct || '', livre = !ct || /^livre|sem contrato/i.test(b.t || '') || ct <= LIVRE_ATE;
    const mv = Number(b.mv) || 0;
    /* ---- técnico: a nota do estudo quando existe; senão, ao vivo (seta contra a régua + nível da liga) ---- */
    let tec = null, ader = null, niv = null, tecFonte = '';
    if (cs && cs.nota != null) { tec = cs.nota; ader = cs.adc; niv = cs.niv; tecFonte = 'estudo'; }
    else if (s && s.c !== 'n' && s.pontos != null) {
      const p = clamp(50 + 50 * s.pontos, 0, 100), merc = mercadoDe(b.l);
      ader = clamp(converter(merc, p), 0, 100);
      const fator = clamp(0.7 + 0.3 * forcaDe(b.l) / forcaB, 0.75, 1.25);
      niv = b.ov != null ? clamp(b.ov * fator, 0, 100) : null;
      tec = niv != null ? (ader + niv) / 2 : ader; tecFonte = 'ao vivo';
    }
    const ligaScore = clamp(100 * forcaDe(b.l) / forcaB, 30, 100) + ((REF.crivo || {})[b.l] || 0);
    const fisScore = pos === 'GOL' ? null : (letra ? LETRA_PTS[letra] : null);
    const t2Score = t2 ? T2_PTS[t2.c] : null;
    const minScore = mi ? clamp(100 * mi.pct / 0.75, 0, 100) : (min26 ? clamp(100 * min26 / 2500, 0, 100) : null);
    const idadeScoreT = idadeScore(idade27, 'titular'), idadeScoreA = idadeScore(idade27, 'aposta');
    const cob = cs ? cs.cob : null, aer = cs ? cs.aer : null, xgp = cs ? cs.xg_p : null, areap = cs ? cs.area_p : null;
    const bonus = [];
    if (BP_COBR[pos] && ((cob != null && cob >= 80) || cobW >= 90)) bonus.push(['cobrador de bola parada', PREM.bonus.cob]);
    if (BP_AER[pos] && aer != null && aer >= 80) bonus.push(['finalizador aéreo', PREM.bonus.aer]);
    if (GOL_DEF[pos] && xgp != null && xgp >= 90) bonus.push(['gol de defesa (xG no decil de cima)', PREM.bonus.golDef]);
    if (AREA[pos] && areap != null && areap >= 90) bonus.push(['corrida para a área (decil de cima)', PREM.bonus.area]);
    if (pos !== 'GOL' && fisScore == null) bonus.push(['sem físico rastreado', PREM.bonus.semFis]);
    if (s && s.parcial) bonus.push(['técnico parcial (faltam indicadores)', PREM.bonus.parcial]);
    const W = pos === 'GOL' ? PREM.pesosGol : (FIS_PESA[pos] ? PREM.pesosFis : PREM.pesos);
    const comp = { tec, fis: fisScore, t2: t2Score, min: minScore, idade: idadeScoreT, liga: ligaScore };
    const nota = k => { let s2 = 0, w = 0; for (const c in W) { if (!W[c]) continue; let v = comp[c]; if (c === 'idade' && k === 'aposta') v = idadeScoreA; if (v == null) v = (c === 'tec' ? null : 50); if (v == null) continue; s2 += v * W[c]; w += W[c]; } return w ? s2 / w : null; };
    const nT = nota('titular'), nA = nota('aposta'), bsum = bonus.reduce((a, x) => a + x[1], 0);
    const notaT = nT == null ? null : clamp(nT + bsum, 0, 100), notaA = nA == null ? null : clamp(nA + bsum, 0, 100);
    const sal = salarioDe(b, card, tec);
    /* ---- o que tira da lista (com o motivo) ---- */
    const fora = [], F = PREM.filtros;
    const vet = (cs && cs.vet) ? 'vetado pelo clube' : (F.vetados ? vetadoDe(b) : null);
    if (vet) fora.push(vet);
    if (F.semGrandes && (REF.grandes || []).some(g => nz(g) === nz(b.t))) fora.push('clube fora do alcance');
    if (card && card.status === 'encerrada') fora.push('negociação encerrada');
    if (!ligaPermitida(b.l, F)) fora.push(F.semSerieA && b.l === 'Brasil A' ? 'Série A fora (premissa)' : 'liga fora do alcance');
    if (mv > F.tetoValor || (cs && cs.caro)) fora.push('valor acima de € ' + num(F.tetoValor / 1e6, 1) + ' mi');
    if (tec == null) fora.push('sem indicadores técnicos');
    else if ((min26 || 0) < F.minMin && !(card && card.dados && card.dados.tec)) fora.push('menos de ' + num(F.minMin) + ' min em 2026' + (min26 ? ' (' + num(min26) + ')' : ''));
    if (pos !== 'GOL' && psv != null && psv < F.psvPiso) fora.push('abaixo do piso de velocidade (' + num(psv, 1) + ' km/h)');
    if (Q) {
      if (Q.nac === 'br' && estr) fora.push('estrangeiro');
      if (Q.nac === 'ex' && !estr) fora.push('brasileiro');
      if (Q.nac === 'sul' && !(!estr || /Argentina|Uruguay|Colombia|Paraguay|Chile|Ecuador|Peru|Bolivia|Venezuela/.test(b.nac || ''))) fora.push('não é sul-americano');
      if (Q.paises && Q.paises.length && !Q.paises.some(p => (b.nac || '').toLowerCase().startsWith(p))) fora.push('nacionalidade fora do pedido');
      if (Q.idadeMax != null && idade != null && idade > Q.idadeMax) fora.push('acima de ' + Q.idadeMax + ' anos');
      if (Q.idadeMin != null && idade != null && idade < Q.idadeMin) fora.push('abaixo de ' + Q.idadeMin + ' anos');
      if (Q.livre && !livre) fora.push('contrato além de jan/2027');
      if (Q.pe && b.pe && !new RegExp(Q.pe, 'i').test(b.pe)) fora.push('pé ' + b.pe);
      if (Q.ligas && Q.ligas.length && !Q.ligas.includes(b.l)) fora.push('liga fora do pedido');
      if (Q.letra && pos !== 'GOL' && !(letra && (Q.letra === 'A' ? (letra === 'A' || letra === 'A+') : letra === Q.letra))) fora.push('tipo físico ' + (letra || 'sem dado'));
      if (Q.t2 && !(t2 && (t2.c === 'azul' || t2.c === 'verde'))) fora.push('não mantém no 2º tempo');
      if (Q.bp === 'cobr' && !((cob != null && cob >= 65) || cobW >= 60)) fora.push('não é cobrador');
      if (Q.bp === 'aer' && !(aer != null && aer >= 65)) fora.push('não é finalizador aéreo');
      const tetoQ = Q.salMax != null ? Q.salMax : (Q.intent === 'contratar' && PREM.salario.tetoPadrao > 0 ? PREM.salario.tetoPadrao : null);
      if (tetoQ != null && sal.v > tetoQ) fora.push('salário estimado (' + brlk(sal.v) + ') acima de ' + brlk(tetoQ) + (Q.salMax == null ? ' — teto padrão do clube' : ''));
      if (Q.altMin != null && !(Number(b.alt) >= Q.altMin)) fora.push('abaixo de ' + Q.altMin + ' cm');
      if (Q.minMin != null && (min26 || 0) < Q.minMin) fora.push('menos de ' + num(Q.minMin) + ' min em 2026');
    }
    return { b, pk, pos, posBase: b.p, nome: b.n, clube: b.t, liga: b.l, idade, idade27, nasc: null, estr, ct, livre, mv, card, cs, s, letra, mais, tipo, psv, t2, mi, min26, h26, cobW, gbpW, cob, aer, am, sofa, listas, ind,
      tec, ader, niv, tecFonte, comp, bonus, nota: notaT, notaA, sal, fora, W };
  }

  /* ---------------- o conjunto de candidatos de uma posição (em lotes, sem travar a tela) ---------------- */
  const POOL = {};   /* pos|assinatura das premissas → lista avaliada */
  function assinatura() { return JSON.stringify([PREM.pesos, PREM.pesosFis, PREM.pesosGol, PREM.bonus, PREM.filtros, PREM.salario, Object.keys(SALX).length]); }
  async function pool(pos, Q, aviso) {
    const ch = pos + '|' + assinatura() + '|' + JSON.stringify(Q || null);
    if (POOL[ch]) return POOL[ch];
    const kp = await kpisPos(pos);
    const fonte = BASE.filter(b => b && b.p === pos && !b.manual);
    const out = []; let i = 0;
    await new Promise(res => {
      const passo = () => {
        const fim = Math.min(fonte.length, i + 400);
        for (; i < fim; i++) { try { out.push(avaliar(fonte[i], pos, kp, Q)); } catch (e) {} }
        if (aviso) aviso(pos, i, fonte.length);
        if (i < fonte.length) setTimeout(passo, 0); else res();
      };
      passo();
    });
    /* o mesmo atleta em dois clubes (duplicata conferida): fica a linha com mais minutos em 2026 */
    if (PREM.filtros.duplicatas && typeof chaveDuplicata === 'function') {
      const melhor = new Map();
      out.forEach(c => { const k = chaveDuplicata(c.b); const a = melhor.get(k); if (!a || (c.min26 || 0) > (a.min26 || 0)) melhor.set(k, c); });
      out.forEach(c => { const a = melhor.get(chaveDuplicata(c.b)); if (a && a !== c && typeof ehDuplicata === 'function' && ehDuplicata(c.b)) c.fora.push('mesmo atleta em outro clube (' + a.clube + ')'); });
    }
    out.sort((a, b) => (b.nota || -1) - (a.nota || -1));
    POOL[ch] = out; return out;
  }
  const dentro = L => L.filter(c => !c.fora.length && c.nota != null);

  /* ---------------- a pergunta em português → o pedido estruturado ---------------- */
  const POS_TERMS = [
    [/\bgoleir|\barqueir|\bgk\b/, ['GOL'], 0],
    [/\blateral[- ]?direit|\bala direit|\blaterais? direit|\bld\b|\brb\b/, ['LD'], 1],
    [/\blateral[- ]?esquerd|\bala esquerd|\blaterais? esquerd|\ble\b|\blb\b/, ['LE'], 1],
    [/\blatera(l|is)\b|\balas?\b/, ['LD', 'LE'], 0],
    [/\bzagueir\w*\s+(direit|destro|pela direita)|\bzd\b|\brcb\b/, ['ZD'], 1],
    [/\bzagueir\w*\s+(esquerd|canhot|pela esquerda)|\bze\b|\blcb\b/, ['ZE'], 1],
    [/\bzagueir|\bzaga\b|\bbeque|\bdefensor(es)? centra/, ['ZD', 'ZE'], 0],
    [/\bsegundo volante|\bbox[- ]to[- ]box|\bmeio[- ]campista|\bmedio|\bmedios\b|\binterior\b|\bcm\b|\bcamisa 8\b/, ['MED'], 1],
    [/\bvolante|\bprimeiro volante|\bcabeca de area|\bpivo defensivo|\bdm\b|\bcamisa 5\b/, ['VOL'], 1],
    [/\bmeia\b|\bmeias\b|\bmeia[- ]atacante|\barmador|\bcamisa 10\b|\bam\b|\bmeia ofensivo/, ['MEI'], 1],
    [/\bextremo[s]? direit|\bponta[s]? direit|\bed\b|\brw\b/, ['ED'], 1],
    [/\bextremo[s]? esquerd|\bponta[s]? esquerd|\bee\b|\blw\b/, ['EE'], 1],
    [/\bextremo|\bponta[s]?\b|\bwinger|\bjogador(es)? de lado/, ['ED', 'EE'], 0],
    [/\bcentroavante|\bcentro[- ]avante|\batacante|\bcamisa 9\b|\bartilheir|\bhomem de area|\bcf\b|\bgoleador/, ['CA'], 1],
  ];
  const PAISES = [['argentin', 'argentina'], ['uruguai', 'uruguay'], ['colombian', 'colombia'], ['paraguai', 'paraguay'], ['chilen', 'chile'], ['equatorian', 'ecuador'], ['peruan', 'peru'], ['bolivian', 'bolivia'], ['venezuelan', 'venezuela']];
  const LIGA_TERMS = [
    [/\bserie b\b|\bsegunda divisao\b/, ['Brasil B']], [/\bserie a\b|\bbrasileirao\b|\bprimeira divisao\b/, ['Brasil A']], [/\bserie c\b/, ['Brasil C']],
    [/\bargentina\b|\bliga argentina/, ['Argentina A', 'Argentina B']], [/\bportugal|\bportugues/, ['Portugal A', 'Portugal B', 'Portugal C']],
    [/\bmls\b|\bestados unidos\b/, ['EUA']], [/\bmexic/, ['Mexico']], [/\bjapao\b|\bj[- ]league/, ['Japao A', 'Japao B']], [/\bcoreia\b|\bk[- ]league/, ['Coreia A', 'Coreia B']],
    [/\buruguai\b/, ['Uruguai']], [/\bcolombia\b/, ['Colombia A', 'Colombia B']], [/\bchile\b/, ['Chile']], [/\bparaguai\b/, ['Paraguai']], [/\bequador\b/, ['Equador A', 'Equador B']], [/\bperu\b/, ['Peru']],
    [/\bamerica do sul\b|\bsul[- ]american(a|o)s?\b(?! estrangeir)/, (REF.sulam || [])],
    [/\bexterior\b|\beuropa\b|\bfora do brasil\b/, (REF.alcancaveis || [])],
  ];
  function dinheiro(t) {
    const m = /(?:r\$\s*)?(\d+(?:[.,]\d+)?)\s*(mm|milh(?:ao|oes)|mi\b|m\b|mil\b|k\b)/.exec(t);
    if (!m) { const m2 = /r\$\s*([\d.]{5,})/.exec(t); return m2 ? Number(m2[1].replace(/\./g, '')) : null; }
    const v = parseFloat(m[1].replace(',', '.')), u = m[2];
    return Math.round(v * (/^mil$|^k$/.test(u) ? 1e3 : 1e6));
  }
  function interpretar(texto) {
    const t = ' ' + nz(texto) + ' ';
    const Q = { texto, intent: 'contratar', pos: [], nac: '', paises: [], ligas: [], livre: false, pe: null, letra: null, t2: false, bp: null, idadeMin: null, idadeMax: null, salMax: null, massa: null, altMin: null, minMin: null, n: null, papel: null, nomes: [] };
    let temLado = { LD: 0, LE: 0, ZD: 0, ZE: 0, ED: 0, EE: 0 };
    POS_TERMS.forEach(([rx, ps, esp]) => { if (!rx.test(t)) return; if (!esp && ps.some(p => temLado[p])) return; ps.forEach(p => { if (!Q.pos.includes(p)) Q.pos.push(p); if (esp) temLado[p] = 1; }); });
    if (/\belenco|\btime inteiro|\bmontar o time|\bmontar um time|\bescalac|\bonze\b|\bplantel|\bsquad|\bmelhor time\b|\bo time todo/.test(t)) Q.intent = 'elenco';
    if (/\bcompar|\bversus\b|\bvs\b|\bx\b.*\bou\b/.test(t)) Q.intent = 'comparar';
    if (/\bquem e\b|\bficha d[oe]\b|\brelatorio d[oe]\b|\bperfil d[oe]\b|\bcomo (esta|e) o\b/.test(t) && !Q.pos.length) Q.intent = 'ficha';
    if (/\bbrasileir/.test(t)) Q.nac = 'br';
    if (/\bestrangeir/.test(t)) Q.nac = 'ex';
    if (/\bsul[- ]american(a|o)s? estrangeir|\bgringo/.test(t)) Q.nac = 'ex';
    PAISES.forEach(([rx, p]) => { if (new RegExp('\\b' + rx).test(t)) Q.paises.push(p); });
    if (Q.paises.length) Q.nac = '';
    LIGA_TERMS.forEach(([rx, ls]) => { if (rx.test(t)) ls.forEach(l => { if (!Q.ligas.includes(l)) Q.ligas.push(l); }); });
    if (Q.paises.length && Q.ligas.length && !/\bliga|\bcampeonato|\bque joga/.test(t)) Q.ligas = [];   /* "argentino" é nacionalidade, não a liga */
    /* "elenco para a Série B de 2027", "disputar a Série B", "subir para a Série A": é a competição que vamos jogar, não a liga de origem */
    [['Brasil B', /\b(para|pra|disputar|jogar|vencer|ganhar|subir|montar|encarar)\s+(a\s+|o\s+|na\s+|no\s+)?(serie b|segunda divisao)\b|\b(serie b|segunda divisao) (de|em) 20\d\d/], ['Brasil A', /\b(para|pra|disputar|jogar|vencer|ganhar|subir|montar|encarar)\s+(a\s+|o\s+|na\s+|no\s+)?(serie a|brasileirao|primeira divisao)\b|\b(serie a|brasileirao|primeira divisao) (de|em) 20\d\d/], ['Brasil C', /\b(para|pra|disputar|jogar|vencer|ganhar|subir|montar|encarar)\s+(a\s+|o\s+|na\s+|no\s+)?serie c\b|\bserie c (de|em) 20\d\d/]]
      .forEach(([l, rx]) => { if (rx.test(t) && !/\b(da|do|na|no|que joga|jogadores da|nomes da|atletas da)\s+(serie|brasileirao|segunda|primeira)/.test(t)) Q.ligas = Q.ligas.filter(x => x !== l); });
    if (/\blivre|\bsem contrato|\bfim de contrato|\bacab(a|ando) o contrato|\bvence(ndo)? (em|o)|\bde graca|\bcusto zero/.test(t)) Q.livre = true;
    if (/\bcanhot|\bpe esquerd/.test(t)) Q.pe = 'esq|left|canh';
    if (/\bdestro|\bpe direit/.test(t)) Q.pe = 'dir|right';
    if (/\ba\+|\bmais explosiv|\bexplosiv|\brapid|\bveloz|\bvelocidade|\bmotor\b/.test(t)) Q.letra = 'A';
    if (/\bletra a\b|\btipo a\b|\bfisico a\b/.test(t)) Q.letra = 'A';
    if (/\bmantem|\bsegundo tempo|\b2o tempo|\b2 tempo|\bnao cai no fim/.test(t)) Q.t2 = true;
    if (/\bcobrador|\bbola parada|\bescanteio|\bfalta\b|\bcobra/.test(t)) Q.bp = 'cobr';
    if (/\bcabece|\baereo|\bcabeca\b|\balto\b|\bjogo aereo/.test(t)) Q.bp = Q.bp || 'aer';
    let m;
    if ((m = /\bate (\d\d) anos/.exec(t))) Q.idadeMax = +m[1];
    if ((m = /(\d\d) anos ou menos|\bno maximo (\d\d) anos|\bmenos de (\d\d) anos/.exec(t))) Q.idadeMax = +(m[1] || m[2] || m[3]);
    if ((m = /\bmais de (\d\d) anos|\bacima de (\d\d) anos|\bno minimo (\d\d) anos|(\d\d) anos ou mais/.exec(t))) Q.idadeMin = +(m[1] || m[2] || m[3] || m[4]);
    if ((m = /\bentre (\d\d) e (\d\d) anos/.exec(t))) { Q.idadeMin = +m[1]; Q.idadeMax = +m[2]; }
    if (/\bjovem|\bjovens|\bpromessa|\bpotencial/.test(t)) { Q.idadeMax = Q.idadeMax || 23; Q.papel = 'aposta'; }
    if (/\bexperiente|\brodado|\bveteran/.test(t)) Q.idadeMin = Q.idadeMin || 28;
    if (/\breserva|\baposta|\bbanco\b/.test(t)) Q.papel = 'aposta';
    if (/\btitular/.test(t)) Q.papel = 'titular';
    if ((m = /(\d[.,]\d\d) ?m\b|(\d{3}) ?cm/.exec(t))) Q.altMin = m[1] ? Math.round(parseFloat(m[1].replace(',', '.')) * 100) : +m[2];
    if ((m = /(\d{3,4}) ?min/.exec(t))) Q.minMin = +m[1];
    if ((m = /\b(\d{1,2}) (opcoes|nomes|jogadores|candidatos|alternativas)/.exec(t))) Q.n = +m[1];
    const din = dinheiro(t);
    if (din) { if (Q.intent === 'elenco' || /\bfolha|\bmassa|\bpor mes (de|em) salari|\bem salarios/.test(t) && din >= 500000) { Q.intent = 'elenco'; Q.massa = din; } else Q.salMax = din; }
    if (Q.intent === 'elenco' && !Q.massa) Q.massa = (typeof dispSalarios === 'function') ? Math.round(dispSalarios()) : 2000000;
    if (Q.intent === 'comparar' || Q.intent === 'ficha') Q.nomes = nomesNoTexto(texto);
    if (Q.intent === 'contratar' && !Q.pos.length) { const ns = nomesNoTexto(texto); if (ns.length >= 2) { Q.intent = 'comparar'; Q.nomes = ns; } else if (ns.length === 1 && /\b(quem e|ficha|perfil|relatorio|como esta|vale|serve)\b/.test(t)) { Q.intent = 'ficha'; Q.nomes = ns; } }
    return Q;
  }
  /* nomes de jogadores no texto: casa contra a base (nome ou nome completo), por trechos de 1 a 3 palavras com inicial maiúscula */
  function nomesNoTexto(texto) {
    if (typeof BASE === 'undefined' || !BASE || !BASE.length) return [];
    const toks = texto.replace(/[?!.,;:()]/g, ' ').split(/\s+/).filter(Boolean);
    const stop = /^(quem|qual|o|a|os|as|e|ou|vs|x|versus|comparar|compare|comparando|com|do|da|de|para|entre|melhor|contratar|santa|cruz|serie|ficha|perfil|relatorio|elenco|time)$/i;
    const idx = window.__dcNomes || (window.__dcNomes = (() => { const m = new Map(); BASE.forEach(b => { if (!b) return; [b.n, b.nc].forEach(n => { if (!n) return; const k = nz(n); if (k.length < 4) return; (m.get(k) || m.set(k, []).get(k)).push(b); }); }); return m; })());
    const out = [], usados = new Set();
    for (let i = 0; i < toks.length; i++) {
      if (usados.has(i)) continue;
      for (let len = 3; len >= 1; len--) {
        const parte = toks.slice(i, i + len); if (parte.length < len) continue;
        if (parte.some(p => stop.test(p)) || !/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(parte[0])) continue;
        const k = nz(parte.join(' ')), c = idx.get(k);
        if (c && c.length) { out.push({ nome: parte.join(' '), cands: c }); for (let j = i; j < i + len; j++) usados.add(j); break; }
      }
    }
    return out;
  }
  function leitura(Q) {
    const p = [];
    p.push(Q.intent === 'elenco' ? 'Montar o elenco' : Q.intent === 'comparar' ? 'Comparar' : Q.intent === 'ficha' ? 'Ficha' : 'Quem contratar');
    if (Q.pos.length) p.push(Q.pos.map(x => POSN[x]).join(' / '));
    if (Q.massa) p.push('massa salarial ' + brlk(Q.massa) + '/mês');
    if (Q.salMax) p.push('salário até ' + brlk(Q.salMax) + '/mês'); else if (Q.intent === 'contratar' && PREM.salario.tetoPadrao > 0) p.push('salário até ' + brlk(PREM.salario.tetoPadrao) + '/mês (teto padrão do clube — mude no pedido ou nas premissas)');
    if (Q.nac === 'br') p.push('só brasileiros'); if (Q.nac === 'ex') p.push('só estrangeiros'); if (Q.nac === 'sul') p.push('sul-americanos');
    if (Q.paises.length) p.push(Q.paises.join(', '));
    if (Q.ligas.length) p.push(Q.ligas.length > 4 ? Q.ligas.length + ' ligas' : Q.ligas.join(', '));
    if (Q.livre) p.push('pode vir livre (contrato até jan/2027)');
    if (Q.pe) p.push(/esq/.test(Q.pe) ? 'canhoto' : 'destro');
    if (Q.letra) p.push('tipo físico A ou A+'); if (Q.t2) p.push('mantém no 2º tempo');
    if (Q.bp === 'cobr') p.push('cobrador'); if (Q.bp === 'aer') p.push('finalizador aéreo');
    if (Q.idadeMin != null || Q.idadeMax != null) p.push('idade ' + (Q.idadeMin != null ? 'de ' + Q.idadeMin : '') + (Q.idadeMax != null ? ' até ' + Q.idadeMax : '') + ' anos');
    if (Q.altMin) p.push('≥ ' + Q.altMin + ' cm'); if (Q.minMin) p.push('≥ ' + num(Q.minMin) + ' min');
    if (Q.papel) p.push(Q.papel === 'aposta' ? 'reserva/aposta (idade conta a favor do jovem)' : 'titular');
    return p;
  }

  /* ---------------- o otimizador do elenco (orçamento, vagas por posição, estrangeiros) ----------------
     Escolhe, posição a posição, quem maximiza a nota do time (titular pesa 1, 2ª opção 0,6, 3ª 0,4) sem passar da massa
     salarial nem do limite de estrangeiros. Método: preço-sombra do real (λ) — cada candidato vale nota − λ × salário; o λ é
     achado por busca até o elenco caber no orçamento; depois trocas locais melhoram o que der. Os "fechados" do campograma
     entram travados, com o salário digitado. */
  function otimizar(cands, cfg) {
    const { porPos, massa, limEstr, travados } = cfg, SL = PREM.slots;
    const wSlot = i => SL[Math.min(i, SL.length - 1)];
    const fixos = {}; let custoFixo = 0, estrFixo = 0;
    ORDEM.forEach(p => { fixos[p] = (travados[p] || []); fixos[p].forEach(c => { custoFixo += c.sal.v; if (c.estr) estrFixo++; }); });
    const livres = {}; ORDEM.forEach(p => { const tr = new Set(fixos[p].map(c => c.pk)); livres[p] = (cands[p] || []).filter(c => !tr.has(c.pk)); });
    function montar(lambda) {
      const esc_ = {}; let custo = custoFixo, estr = estrFixo;
      ORDEM.forEach(p => {
        const need = Math.max(0, (porPos[p] || 0) - fixos[p].length);
        const ord = livres[p].slice().sort((a, b) => (valor(b, lambda) - valor(a, lambda)));
        esc_[p] = ord.slice(0, need);
        esc_[p].forEach(c => { custo += c.sal.v; if (c.estr) estr++; });
      });
      /* estrangeiros além do limite: troca o que menos perde pela melhor opção brasileira da mesma posição */
      let guarda = 40;
      while (estr > limEstr && guarda-- > 0) {
        let melhor = null;
        ORDEM.forEach(p => {
          const esc2 = esc_[p]; const dentro_ = new Set(esc2.map(c => c.pk));
          esc2.forEach((c, i) => { if (!c.estr) return;
            const alt = livres[p].filter(x => !x.estr && !dentro_.has(x.pk)).sort((a, b) => valor(b, lambda) - valor(a, lambda))[0];
            if (!alt) return; const perda = valor(c, lambda) - valor(alt, lambda);
            if (!melhor || perda < melhor.perda) melhor = { p, i, alt, perda, c }; });
        });
        if (!melhor) break;
        esc_[melhor.p][melhor.i] = melhor.alt; custo += melhor.alt.sal.v - melhor.c.sal.v; estr--;
      }
      return { esc: esc_, custo, estr };
    }
    function valor(c, lambda) { return (c.notaA != null && c.nota != null ? 0.5 * (c.nota + c.notaA) : c.nota) - lambda * c.sal.v / 1e5; }
    function objetivo(esc_) {
      let s = 0, w = 0;
      ORDEM.forEach(p => { const L = fixos[p].concat(esc_[p]).slice().sort((a, b) => b.nota - a.nota); L.forEach((c, i) => { const ww = wSlot(i); s += ww * (i === 0 ? c.nota : 0.5 * (c.nota + (c.notaA != null ? c.notaA : c.nota))); w += ww; }); });
      return w ? s / w : 0;
    }
    /* λ por busca: custo cai quando λ sobe */
    let lo = 0, hi = 400, best = null;
    const m0 = montar(0); if (m0.custo <= massa) best = m0;
    if (!best) {
      for (let k = 0; k < 40; k++) { const mid = (lo + hi) / 2, m = montar(mid); if (m.custo <= massa) { best = m; hi = mid; } else lo = mid; }
      if (!best) best = montar(hi);
    }
    /* trocas locais: dentro da posição, troca um escolhido por um de fora se a nota sobe e o orçamento (e o limite) seguram */
    let melhorou = true, rodadas = 0;
    while (melhorou && rodadas++ < 6) {
      melhorou = false;
      for (const p of ORDEM) {
        const esc2 = best.esc[p], dentro_ = new Set(esc2.map(c => c.pk));
        for (let i = 0; i < esc2.length; i++) {
          const c = esc2[i];
          const cand = livres[p].filter(x => !dentro_.has(x.pk) && x.nota > c.nota && best.custo - c.sal.v + x.sal.v <= massa && (best.estr - (c.estr ? 1 : 0) + (x.estr ? 1 : 0)) <= limEstr).sort((a, b) => b.nota - a.nota)[0];
          if (cand) { best.custo += cand.sal.v - c.sal.v; best.estr += (cand.estr ? 1 : 0) - (c.estr ? 1 : 0); esc2[i] = cand; dentro_.delete(c.pk); dentro_.add(cand.pk); melhorou = true; }
        }
      }
    }
    const final = {}; ORDEM.forEach(p => { final[p] = fixos[p].map(c => Object.assign({ travado: true }, c)).concat(best.esc[p]).sort((a, b) => b.nota - a.nota); });
    const n = ORDEM.reduce((s, p) => s + final[p].length, 0);
    return { elenco: final, custo: best.custo, estr: best.estr, nota: objetivo(best.esc), n, massa, lambda: null };
  }
  function fronteira(cands, cfg, pontos) {
    return pontos.map(m => { const r = otimizar(cands, Object.assign({}, cfg, { massa: m })); return { massa: m, nota: r.nota, custo: r.custo }; });
  }

  /* ---------------- textos: por quê / riscos ---------------- */
  function porque(c) {
    const pros = [], contras = [];
    const s = c.s;
    if (c.tec != null) {
      const det = [];
      if (c.ader != null) det.push('aderência ' + R0(c.ader) + (c.cs && c.cs.ad != null && c.cs.ad !== c.ader && c.liga !== 'Brasil B' ? ' (era ' + R0(c.cs.ad) + ' na liga dele, convertida)' : ''));
      if (c.niv != null) det.push('nível ' + R0(c.niv));
      if (s && s.conta) det.push(s.verde + ' de ' + s.com + ' fundamentais no nível de quem sobe');
      (c.tec >= 55 ? pros : contras).push('Técnico ' + R0(c.tec) + (c.tecFonte === 'ao vivo' ? ' (calculado ao vivo, sem a nota do estudo)' : '') + (det.length ? ' — ' + det.join(' · ') : ''));
      if (s && s.inds && s.inds.length) {
        const v = s.inds.filter(x => x.c === 'v').map(x => abrev(x.rot)).slice(0, 3), r = s.inds.filter(x => x.c === 'r').map(x => abrev(x.rot)).slice(0, 3);
        if (v.length) pros.push('Acima da régua em ' + v.join(', ')); if (r.length) contras.push('Abaixo da régua em ' + r.join(', '));
      }
    } else contras.push('Sem nota técnica');
    if (c.pos !== 'GOL') {
      if (c.letra === 'A+' || c.letra === 'A') pros.push('Tipo físico ' + c.letra + (c.tipo ? ' — ' + c.tipo : '') + (c.psv != null ? ' · PSV-99 ' + num(c.psv, 1) + ' km/h' : ''));
      else if (c.letra) contras.push('Tipo físico ' + c.letra + (c.tipo ? ' — ' + c.tipo : '') + (c.psv != null ? ' · ' + num(c.psv, 1) + ' km/h' : ''));
      else contras.push('Sem físico rastreado (SkillCorner não cobre a liga ou o jogador)');
      if (c.t2) (c.t2.c === 'azul' || c.t2.c === 'verde' ? pros : contras).push('2º tempo: ' + c.t2.nome + ' (mantém ' + Math.round(c.t2.manut * 100) + '% da intensidade)');
    }
    if (c.mi) (c.mi.pct >= 0.6 ? pros : contras).push('Jogou ' + Math.round(c.mi.pct * 100) + '% dos minutos do time nos últimos 3 anos' + (c.min26 ? ' · ' + num(c.min26) + ' min em 2026' : ''));
    else if (c.min26) (c.min26 >= 1800 ? pros : contras).push(num(c.min26) + ' min em 2026 (sem histórico de 3 anos)');
    c.bonus.forEach(([t, v]) => (v > 0 ? pros : contras).push((v > 0 ? '+' : '') + v + ' · ' + t));
    if (c.livre) pros.push('Contrato ' + (c.ct ? 'até ' + ma(c.ct) : 'livre') + ' — pode vir livre');
    else if (c.ct) contras.push('Contrato até ' + ma(c.ct) + (c.mv ? ' · valor € ' + num(c.mv / 1e6, 2) + ' mi' : ''));
    if (c.estr) contras.push('Estrangeiro' + (c.b.psp && /Brazil|Italy|Spain|Portugal/i.test(c.b.psp) ? ' (passaporte ' + c.b.psp + ')' : '') + ' — ocupa uma das 9 vagas');
    if (c.idade27 != null && c.idade27 >= 33) contras.push(c.idade27 + ' anos em 2027 — contrato de 1 ano');
    if (c.idade27 != null && c.idade27 <= 22) pros.push(c.idade27 + ' anos em 2027 — margem para crescer e revender');
    if (c.listas.length) pros.push('Nas listas do TransferRoom Scout: ' + c.listas.slice(0, 3).join(', '));
    if (c.ind) pros.push('Indicado' + (c.ind.por || c.ind.quem ? ' por ' + (c.ind.por || c.ind.quem) : '') + ' (aba Indicados)');
    if (c.sofa && c.sofa.nota) pros.push('SofaScore ' + num(c.sofa.nota, 2) + ' (referência externa)');
    if (c.am && c.am.pl != null && c.am.pl >= 70) pros.push('Ameaça (xT) no percentil ' + R0(c.am.pl) + ' da liga');
    if (c.card) pros.push('Já está no campograma (' + (STATUS_ROT[c.card.status] || c.card.status) + (c.card.salario ? ', ' + brlk(c.card.salario) + '/mês' : '') + ')');
    return { pros, contras };
  }
  const abrev = r => (typeof window.abrevInd === 'function' ? window.abrevInd(r) : r);

  /* ---------------- fotos e escudos (Transfermarkt / Wyscout), resolvidas depois de desenhar ---------------- */
  async function perfilDe(c) {
    let pf = null; try { pf = await perfilExtraDe(c.b); } catch (e) {}
    let foto = pf && pf.foto; let dc = null; try { dc = dadosColados(c.pk, null); } catch (e) {}
    if (!foto && dc && dc.auto && dc.auto.foto) foto = dc.auto.foto;
    if (!foto && typeof window.fotoExtra === 'function') foto = window.fotoExtra(c.pk);
    const nasc = (pf && pf.nasc) || (dc && dc.auto && dc.auto.nasc) || null;
    return { foto, escudo: pf && pf.clubeId ? 'https://tmssl.akamaized.net/images/wappen/normquad/' + pf.clubeId + '.png' : null, nasc, alt: pf && pf.alt, pe: pf && pf.pe, valor: pf && pf.valor, clubeTM: pf && pf.clube };
  }
  function pintarPerfis(raiz, cands) {
    cands.forEach(async c => {
      const p = await perfilDe(c); c.perfil = p;
      raiz.querySelectorAll('[data-pk="' + CSS.escape(c.pk) + '"]').forEach(el => {
        const f = el.querySelector('.dc-foto'); if (f && p.foto) { const img = new Image(); img.className = 'dc-foto'; img.referrerPolicy = 'no-referrer'; img.onload = () => f.replaceWith(img); img.src = p.foto; }
        const e = el.querySelector('.dc-escudo'); if (e && p.escudo) { const img = new Image(); img.className = 'dc-escudo'; img.referrerPolicy = 'no-referrer'; img.onload = () => e.replaceWith(img); img.src = p.escudo; }
        const n = el.querySelector('.dc-nasc'); if (n && p.nasc) n.textContent = 'nasc. ' + br(p.nasc);
        const a = el.querySelector('.dc-altura'); if (a && p.alt && !a.textContent) a.textContent = p.alt + ' cm';
      });
    });
  }

  /* ---------------- pedaços de HTML ---------------- */
  const corNota = v => v == null ? 'n' : v >= 70 ? 'v' : v >= 58 ? 'a' : 'r';
  const chipLetra = c => c.pos === 'GOL' ? '' : '<span class="dc-chip l-' + (c.letra ? c.letra.replace('+', 'p') : 'n') + '" title="tipo físico' + (c.tipo ? ': ' + esc(c.tipo) : '') + '">' + (c.letra || '?') + '</span>';
  const chipSeta = c => { const s = c.s, k = s ? s.c : 'n', sin = { v: '▲', a: '↔', r: '▼', n: '?' }[k]; return '<span class="dc-chip s-' + k + '" title="' + esc(s && s.conta ? s.verde + ' de ' + s.com + ' fundamentais no nível de quem sobe' : 'seta técnica') + '">' + sin + '</span>'; };
  const chipT2 = c => c.pos === 'GOL' ? '' : '<span class="dc-chip t-' + (c.t2 ? c.t2.c : 'n') + '" title="' + esc(c.t2 ? c.t2.txt : '2º tempo: sem dado') + '">2T</span>';
  const chipMin = c => '<span class="dc-chip m-' + (c.mi ? c.mi.c : 'n') + '" title="' + esc(c.mi ? c.mi.txt : 'minutagem: sem histórico') + '">' + (c.mi ? Math.round(c.mi.pct * 100) + '%' : '—') + '</span>';
  const barra = (v, rot, w) => '<div class="dc-barra" title="' + esc(rot + ': ' + (v == null ? 'sem dado' : R0(v)) + (w ? ' · peso ' + w : '')) + '"><span>' + esc(rot) + '</span><i><b style="width:' + (v == null ? 0 : clamp(v, 0, 100)) + '%" class="c-' + corNota(v) + '"></b></i><em>' + (v == null ? '—' : R0(v)) + '</em></div>';
  function cardGrande(c, i, melhor) {
    const pq = porque(c), dif = melhor && c !== melhor && melhor.nota != null && c.nota != null ? c.nota - melhor.nota : null;
    const W = c.W;
    return '<article class="dc-card' + (i === 0 ? ' top' : '') + '" data-pk="' + esc(c.pk) + '">' +
      '<div class="dc-card-topo"><span class="dc-ordem">' + (i + 1) + 'º</span><span class="dc-foto"></span><div class="dc-id">' +
        '<b class="dc-nome" data-id="' + c.b.id + '">' + esc(c.nome) + '</b><small>' + (c.b.nc && c.b.nc !== c.nome ? esc(c.b.nc) : '') + '</small>' +
        '<div class="dc-clube"><span class="dc-escudo"></span>' + esc(c.clube) + ' · ' + esc(c.liga) + '</div>' +
        '<div class="dc-meta"><b>' + (c.idade != null ? c.idade + ' anos' : '—') + '</b> <span class="dc-nasc"></span>' + (c.idade27 != null ? ' · ' + c.idade27 + ' em 2027' : '') + ' · ' + esc(POSN[c.posBase] || c.posBase) + (c.posBase !== c.pos ? ' → ' + esc(SIGP(c.pos)) : '') + ' · <span class="dc-altura">' + (c.b.alt ? c.b.alt + ' cm' : '') + '</span>' + (c.b.pe ? ' · ' + esc(c.b.pe) : '') + (c.estr ? ' · <i class="dc-estr">' + esc(c.b.nac) + '</i>' : '') + '</div>' +
      '</div><div class="dc-nota ' + corNota(c.nota) + '"><b>' + R0(c.nota) + '</b><small>Nota 2027</small>' + (dif != null ? '<em>' + (dif >= 0 ? '+' : '') + num(dif, 1) + ' vs 1º</em>' : '') + '</div></div>' +
      '<div class="dc-chips">' + chipLetra(c) + chipSeta(c) + chipT2(c) + chipMin(c) + '<span class="dc-chip ct' + (c.livre ? ' livre' : '') + '" title="contrato' + (c.b.ctc ? ' (' + esc(c.b.ctc) + ')' : '') + '">' + (c.ct ? ma(c.ct) : 'livre') + '</span>' + (c.mv ? '<span class="dc-chip vm">€ ' + num(c.mv / 1e6, 2) + ' mi</span>' : '') +
        '<span class="dc-chip sal" title="' + esc('salário: ' + c.sal.f) + '">' + brlk(c.sal.v) + '/mês<small>' + (c.sal.f === 'campograma' || c.sal.f === 'digitado' ? '' : '~') + '</small></span></div>' +
      '<div class="dc-barras">' + barra(c.comp.tec, 'Técnico', W.tec) + (c.pos === 'GOL' ? '' : barra(c.comp.fis, 'Físico', W.fis) + barra(c.comp.t2, '2º tempo', W.t2)) + barra(c.comp.min, 'Minutagem', W.min) + barra(c.comp.idade, 'Idade', W.idade) + barra(c.comp.liga, 'Liga', W.liga) + '</div>' +
      '<div class="dc-pq"><b>Por quê</b><ul>' + pq.pros.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' + (pq.contras.length ? '<b class="r">Atenção</b><ul class="r">' + pq.contras.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') + '</div>' +
      '<div class="dc-acoes"><button class="bt mini dc-ficha" data-id="' + c.b.id + '">ficha</button>' + (c.card ? '<span class="dc-ja">no campograma · ' + esc(STATUS_ROT[c.card.status] || c.card.status) + '</span>' : '<button class="bt mini dc-add" data-id="' + c.b.id + '" data-pos="' + c.pos + '" data-sal="' + c.sal.v + '">+ campograma</button>') + '</div></article>';
  }
  function linhaTab(c, i, melhor) {
    const dif = melhor && c.nota != null && melhor.nota != null ? c.nota - melhor.nota : null;
    return '<tr data-pk="' + esc(c.pk) + '" data-id="' + c.b.id + '"><td class="n">' + (i + 1) + '</td><td><b class="dc-nome" data-id="' + c.b.id + '">' + esc(c.nome) + '</b>' + (c.card ? ' <i class="dc-ja mini" title="' + esc(STATUS_ROT[c.card.status] || '') + '">⬤</i>' : '') + '<small>' + esc(c.clube) + ' · ' + esc(c.liga) + '</small></td>' +
      '<td class="n">' + (c.idade != null ? c.idade : '—') + '</td><td>' + (c.ct ? ma(c.ct) : 'livre') + (c.livre ? ' <i class="dc-livre">livre</i>' : '') + '</td>' +
      '<td>' + chipLetra(c) + '</td><td>' + chipSeta(c) + '</td><td>' + chipT2(c) + '</td><td>' + chipMin(c) + '</td>' +
      '<td class="n">' + R0(c.tec) + (c.tecFonte === 'ao vivo' ? '<small>*</small>' : '') + '</td><td class="n">' + (c.bonus.length ? c.bonus.reduce((a, x) => a + x[1], 0) : '') + '</td>' +
      '<td class="n nota ' + corNota(c.nota) + '"><b>' + R0(c.nota) + '</b>' + (dif != null && i > 0 ? '<small>' + num(dif, 1) + '</small>' : '') + '</td>' +
      '<td class="n"><input class="dc-sal" value="' + Math.round(c.sal.v / 1000) + '" data-pk="' + esc(c.pk) + '" title="' + esc('salário estimado — ' + c.sal.f + '. Digite para corrigir (R$ mil/mês)') + '"><small>' + (c.sal.f === 'campograma' ? 'campo' : c.sal.f === 'digitado' ? 'você' : c.sal.f === 'TransferRoom' ? 'TR' : 'liga') + '</small></td>' +
      '<td class="dc-acoes-td"><button class="bt mini dc-ficha" data-id="' + c.b.id + '" title="abrir a ficha">ficha</button>' + (c.card ? '' : '<button class="bt mini dc-add" data-id="' + c.b.id + '" data-pos="' + c.pos + '" data-sal="' + c.sal.v + '" title="adicionar ao campograma, nesta posição, com o salário estimado">+</button>') + '</td></tr>';
  }

  /* ---------------- réguas: uma linha por fundamental, os candidatos em cima e o nosso time embaixo ---------------- */
  const CORES = ['#f5a524', '#3b82f6', '#22c55e', '#a855f7', '#ef3f5c', '#14b8a6', '#eab308', '#fb7185'];
  function reguas(top, pool_, nossos, pos) {
    const ref = top.find(c => c.s && c.s.inds && c.s.inds.length); if (!ref) return '';
    const inds = ref.s.inds.filter(x => x.ref != null).slice(0, 8);
    const vals = {}; pool_.forEach(c => { if (!c.s || !c.s.inds) return; c.s.inds.forEach(x => { if (x.v != null) (vals[x.k] || (vals[x.k] = [])).push(x.v); }); });
    const out = inds.map(ind => {
      const arr = (vals[ind.k] || []).slice().sort((a, b) => a - b); if (arr.length < 10) return '';
      const q = p => arr[Math.min(arr.length - 1, Math.floor(p * arr.length))];
      let lo = q(0.03), hi = q(0.97); const med = q(0.5);
      const pts = c => { const x = c.s && c.s.inds && c.s.inds.find(y => y.k === ind.k); return x && x.v != null ? x.v : null; };
      top.forEach(c => { const v = pts(c); if (v != null) { lo = Math.min(lo, v); hi = Math.max(hi, v); } });
      nossos.forEach(c => { const v = pts(c); if (v != null) { lo = Math.min(lo, v); hi = Math.max(hi, v); } });
      lo = Math.min(lo, ind.ref); hi = Math.max(hi, ind.ref); if (hi <= lo) hi = lo + 1;
      const W = 1400, pad = 70, y0 = 108;
      const X = v => pad + (W - 2 * pad) * (v - lo) / (hi - lo);
      const cas = /%/.test(ind.rot) ? 1 : 2;
      const pts2 = (lista, dist) => { const usados = [], out2 = []; lista.forEach((c, i) => { const v = pts(c); if (v == null) return; const x = X(v); let row = 0; while (usados.some(u => u.row === row && Math.abs(u.x - x) < dist)) row++; usados.push({ x, row }); out2.push({ c, i, v, x, row }); }); return out2; };
      const T = pts2(top, 170), N = pts2(nossos, 150);
      const rowsT = T.reduce((m, p) => Math.max(m, p.row), -1) + 1, rowsN = N.reduce((m, p) => Math.max(m, p.row), -1) + 1;
      const topo = Math.max(y0 - 26 - (rowsT - 1) * 17 - 14, 4), H = y0 + 62 + Math.max(rowsN, 1) * 15 + 4;
      let svg = '<svg viewBox="0 ' + topo + ' ' + W + ' ' + (H - topo) + '" class="dc-regua-svg">';
      svg += '<line x1="' + pad + '" x2="' + (W - pad) + '" y1="' + y0 + '" y2="' + y0 + '" class="eixo"/>';
      const xr = X(ind.ref), xm = X(med);
      const juntos = Math.abs(xr - xm) < 150;
      svg += '<line x1="' + xm + '" x2="' + xm + '" y1="' + (y0 - 10) + '" y2="' + (y0 + 10) + '" class="med"/><text x="' + xm + '" y="' + (y0 + (juntos ? 46 : 30)) + '" class="rot med" text-anchor="middle">mediana ' + num(med, cas) + '</text>';
      svg += '<line x1="' + xr + '" x2="' + xr + '" y1="' + (y0 - 16) + '" y2="' + (y0 + 16) + '" class="regua"/><text x="' + xr + '" y="' + (y0 + 30) + '" class="rot regua" text-anchor="middle">régua (sobe) ' + num(ind.ref, cas) + '</text>';
      N.forEach(p => { const y = y0 + 62 + p.row * 15; svg += '<circle cx="' + p.x + '" cy="' + y0 + '" r="5" class="nosso"/><text x="' + p.x + '" y="' + y + '" class="rot nosso" text-anchor="middle">' + esc(p.c.nome) + ' ' + num(p.v, cas) + '</text>'; });
      T.forEach(p => { const cor = CORES[p.i % CORES.length], y = y0 - 26 - p.row * 17; svg += '<line x1="' + p.x + '" x2="' + p.x + '" y1="' + (y + 4) + '" y2="' + (y0 - 8) + '" stroke="' + cor + '" stroke-width="1" opacity=".6"/><circle cx="' + p.x + '" cy="' + y0 + '" r="7" fill="' + cor + '" stroke="#0d0f13" stroke-width="2"/><text x="' + p.x + '" y="' + y + '" class="rot cand" fill="' + cor + '" text-anchor="middle">' + esc(p.c.nome) + ' <tspan class="v">' + num(p.v, cas) + '</tspan></text>'; });
      svg += '</svg>';
      const menor = ind.menor ? ' <small>(menor é melhor)</small>' : '';
      return '<div class="dc-regua"><h4>' + esc(ind.rot) + menor + '</h4>' + svg + '</div>';
    }).filter(Boolean);
    return out.length ? '<section class="dc-sec"><h3>Réguas dos fundamentais de ' + esc(POSN[pos]) + '<small>os candidatos em cima, na cor de cada um · o nosso time embaixo, em cinza · a marca vermelha é a régua de quem sobe (média dos titulares dos times promovidos) · escala: 3% a 97% da posição em todas as ligas</small></h3><div class="dc-reguas">' + out.join('') + '</div></section>' : '';
  }

  /* ---------------- dispersão: técnico × custo, com o conjunto inteiro atrás ---------------- */
  function dispersao(pool_, top, nossos) {
    const pts = pool_.filter(c => c.tec != null && c.sal && c.sal.v > 0);
    if (pts.length < 10) return '';
    const ys = pts.map(c => c.sal.v).sort((a, b) => a - b);
    const xlo = 20, xhi = 100, yhi = Math.max(50000, ys[Math.floor(ys.length * 0.97)] * 1.05);
    const W = 1000, H = 360, L = 70, R = 20, T = 20, B = 44;
    const X = v => L + (W - L - R) * (clamp(v, xlo, xhi) - xlo) / (xhi - xlo), Y = v => T + (H - T - B) * (1 - clamp(v, 0, yhi) / yhi);
    let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="dc-disp-svg">';
    for (let g = 0; g <= 4; g++) { const yv = yhi * g / 4, xv = xlo + (xhi - xlo) * g / 4; svg += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(yv) + '" y2="' + Y(yv) + '" class="grade"/><text x="' + (L - 8) + '" y="' + (Y(yv) + 4) + '" class="rot eixo" text-anchor="end">' + Math.round(yv / 1000) + ' mil</text><text x="' + X(xv) + '" y="' + (H - B + 18) + '" class="rot eixo" text-anchor="middle">' + Math.round(xv) + '</text>'; }
    svg += '<text x="' + (W / 2) + '" y="' + (H - 6) + '" class="rot titulo" text-anchor="middle">Técnico (nota do estudo) →</text><text transform="translate(14 ' + (H / 2) + ') rotate(-90)" class="rot titulo" text-anchor="middle">Salário estimado (R$ mil/mês) →</text>';
    pts.forEach(c => { if (top.includes(c) || nossos.includes(c)) return; svg += '<circle cx="' + X(c.tec) + '" cy="' + Y(c.sal.v) + '" r="3" class="todos"><title>' + esc(c.nome + ' · ' + c.clube + ' · técnico ' + R0(c.tec) + ' · ' + brlk(c.sal.v)) + '</title></circle>'; });
    nossos.forEach(c => { if (c.tec == null || !c.sal.v) return; svg += '<rect x="' + (X(c.tec) - 6) + '" y="' + (Y(c.sal.v) - 6) + '" width="12" height="12" class="nosso"><title>' + esc(c.nome + ' (nosso) · técnico ' + R0(c.tec) + ' · ' + brlk(c.sal.v)) + '</title></rect><text x="' + (X(c.tec) + 9) + '" y="' + (Y(c.sal.v) + 4) + '" class="rot nosso">' + esc(c.nome) + '</text>'; });
    top.forEach((c, i) => { svg += '<circle cx="' + X(c.tec) + '" cy="' + Y(c.sal.v) + '" r="9" fill="' + CORES[i % CORES.length] + '" stroke="#0d0f13" stroke-width="2"><title>' + esc(c.nome + ' · técnico ' + R0(c.tec) + ' · ' + brlk(c.sal.v) + ' · Nota 2027 ' + R0(c.nota)) + '</title></circle><text x="' + (X(c.tec) + 12) + '" y="' + (Y(c.sal.v) - 8) + '" class="rot cand" fill="' + CORES[i % CORES.length] + '">' + esc(c.nome) + '</text>'; });
    svg += '</svg>';
    return '<section class="dc-sec"><h3>Qualidade × custo<small>todos os candidatos da posição em cinza · os recomendados em cor · o nosso time em quadrado · quanto mais à direita e mais baixo, mais entrega por real</small></h3>' + svg + '</section>';
  }

  /* ---------------- resposta: quem contratar ---------------- */
  function nossosDa(pos, poolAll) {
    const L = (typeof estado !== 'undefined' && estado.elenco && estado.elenco[pos]) || [];
    const out = [];
    L.forEach(card => { const c = poolAll.find(x => x.pk === card.pk); if (c) out.push(c); });
    return out;
  }
  function blocoFora(L, titulo) {
    const f = L.filter(c => c.fora.length && c.tec != null).sort((a, b) => (b.nota || 0) - (a.nota || 0)).slice(0, 40);
    if (!f.length) return '';
    const cont = {}; L.forEach(c => c.fora.forEach(m => { const k = m.replace(/\(.*?\)/g, '').trim(); cont[k] = (cont[k] || 0) + 1; }));
    const res = Object.keys(cont).sort((a, b) => cont[b] - cont[a]).map(k => '<span class="dc-chip fora">' + esc(k) + ' <b>' + cont[k] + '</b></span>').join('');
    return '<details class="dc-sec dc-fora"><summary><h3>' + esc(titulo || 'Quem ficou de fora, e por quê') + '<small>os filtros do modelo e do pedido — os 40 de nota mais alta entre os excluídos</small></h3></summary><div class="dc-fora-res">' + res + '</div><table class="dc-tab mini"><tbody>' +
      f.map(c => '<tr data-id="' + c.b.id + '"><td><b class="dc-nome" data-id="' + c.b.id + '">' + esc(c.nome) + '</b><small>' + esc(c.clube) + ' · ' + esc(c.liga) + (c.idade != null ? ' · ' + c.idade + ' anos' : '') + '</small></td><td class="n nota ' + corNota(c.nota) + '"><b>' + R0(c.nota) + '</b></td><td>' + c.fora.map(m => '<span class="dc-motivo">' + esc(m) + '</span>').join(' ') + '</td></tr>').join('') + '</tbody></table></details>';
  }
  function blocoNossos(nossos, melhor, pos) {
    if (!nossos.length) return '<section class="dc-sec"><h3>O que temos hoje em ' + esc(POSN[pos]) + '<small>ninguém no campograma nesta posição</small></h3></section>';
    const med = nossos.filter(c => c.nota != null); const media = med.length ? med.reduce((s, c) => s + c.nota, 0) / med.length : null;
    return '<section class="dc-sec"><h3>O que temos hoje em ' + esc(POSN[pos]) + '<small>os jogadores do campograma nesta posição, pela mesma régua · média do grupo <b>' + R0(media) + '</b>' + (melhor && media != null ? ' · o 1º recomendado fica <b>' + (melhor.nota - media >= 0 ? '+' : '') + num(melhor.nota - media, 1) + '</b> acima da média do que temos' : '') + '</small></h3>' +
      '<div class="dc-nossos">' + nossos.sort((a, b) => (b.nota || 0) - (a.nota || 0)).map(c => '<div class="dc-nosso" data-pk="' + esc(c.pk) + '"><span class="dc-foto"></span><div><b class="dc-nome" data-id="' + c.b.id + '">' + esc(c.nome) + '</b><small>' + esc(c.clube) + ' · ' + (c.idade != null ? c.idade + ' a · ' : '') + esc(STATUS_ROT[c.card.status] || c.card.status) + (c.card.salario ? ' · ' + brlk(c.card.salario) : '') + '</small><div class="dc-chips">' + chipLetra(c) + chipSeta(c) + chipT2(c) + chipMin(c) + '</div></div><div class="dc-nota mini ' + corNota(c.nota) + '"><b>' + R0(c.nota) + '</b></div></div>').join('') + '</div></section>';
  }
  function tabelaTop(L, melhor, n) {
    return '<section class="dc-sec"><h3>Os ' + n + ' melhores pela Nota 2027<small>clique no nome para abrir a ficha · ⬤ = já está no campograma · * = técnico calculado ao vivo (sem a nota do estudo) · o salário é editável: digite e a lista refaz a conta</small></h3>' +
      '<div class="dc-tab-rol"><table class="dc-tab"><thead><tr><th>#</th><th>Jogador</th><th>Idade</th><th>Contrato</th><th title="tipo físico">Fís.</th><th title="seta técnica">Téc.</th><th title="2º tempo">2T</th><th title="minutagem 3 anos">Min.</th><th title="nota técnica do estudo (0-100)">Técnico</th><th title="bônus do estudo">Bônus</th><th>Nota 2027</th><th>Salário R$ mil</th><th></th></tr></thead><tbody>' +
      L.slice(0, n).map((c, i) => linhaTab(c, i, melhor)).join('') + '</tbody></table></div></section>';
  }
  async function responderContratar(Q, raiz) {
    const poss = Q.pos.length ? Q.pos : ['CA'];
    raiz.innerHTML = '<div class="dc-espera">⏳ avaliando ' + poss.map(p => POSN[p]).join(' e ') + '…<span id="dcProg"></span></div>';
    const prog = (p, i, n) => { const e = $q('#dcProg'); if (e) e.textContent = ' ' + POSN[p] + ' ' + Math.round(100 * i / n) + '%'; };
    const Qf = Object.assign({}, Q); let html = '';
    for (const pos of poss) {
      const L = await pool(pos, Qf, prog);
      const ok = dentro(L), n = Q.n || 3, papel = Q.papel;
      if (papel === 'aposta') ok.sort((a, b) => (b.notaA || 0) - (a.notaA || 0));
      const top = ok.slice(0, Math.max(3, Math.min(n, 5))), melhor = top[0];
      const nossos = nossosDa(pos, L);
      if (!ok.length) { html += '<section class="dc-sec"><h3>' + esc(POSN[pos]) + ': ninguém passou nos filtros</h3><p class="dc-txt">Afrouxe o pedido (idade, liga, salário) ou os filtros nas premissas.</p></section>' + blocoFora(L); continue; }
      const empate = top.length > 1 && (melhor.nota - top[1].nota) < 3;
      html += '<section class="dc-sec dc-veredito"><h2>' + esc(POSN[pos]) + ' · ' + (papel === 'aposta' ? 'aposta para o banco' : 'quem contratar') + '<small>' + num(ok.length) + ' candidatos passaram nos filtros, de ' + num(L.length) + ' na posição' + (empate ? ' · <b>empate técnico</b> entre os primeiros (menos de 3 pontos de diferença): decide a visão do scout e a negociação' : '') + '</small></h2>' +
        '<div class="dc-cards">' + top.slice(0, 3).map((c, i) => cardGrande(c, i, melhor)).join('') + '</div></section>';
      html += blocoNossos(nossos, melhor, pos);
      html += reguas(top.slice(0, 5), ok, nossos, pos);
      html += dispersao(ok, top.slice(0, 5), nossos);
      html += tabelaTop(ok, melhor, Math.max(15, n));
      html += blocoFora(L);
      raiz.innerHTML = html;
    }
    raiz.innerHTML = html + comoFunciona();
    ultimaResposta = { Q };
    /* fotos e escudos dos cards grandes e do nosso time (os da tabela ficam sem foto, de propósito: são muitos) */
    const cands = [], todos = Object.values(POOL).flat();
    raiz.querySelectorAll('.dc-card[data-pk], .dc-nosso[data-pk]').forEach(el => { const c = todos.find(x => x.pk === el.dataset.pk); if (c && !cands.includes(c)) cands.push(c); });
    pintarPerfis(raiz, cands.slice(0, 40));
  }

  /* ---------------- resposta: o melhor elenco com R$ X por mês ---------------- */
  function cfgElenco(Q) {
    const porPos = {}; ORDEM.forEach(p => { porPos[p] = (typeof metaPos === 'function') ? metaPos(p) : 3; });
    const massa = Q.massa || ((typeof dispSalarios === 'function') ? Math.round(dispSalarios()) : 2000000);
    const limEstr = (typeof estado !== 'undefined' && estado.limiteEstrangeiros) || 9;
    return { porPos, massa, limEstr, manterFechados: Q.manterFechados !== false, manterNegociando: !!Q.manterNegociando };
  }
  function travadosDe(cfg, pools) {
    const t = {}; ORDEM.forEach(p => { t[p] = []; });
    if (typeof estado === 'undefined' || !estado.elenco) return t;
    ORDEM.forEach(p => (estado.elenco[p] || []).forEach(card => {
      const trava = (cfg.manterFechados && (card.status === 'fechado' || card.status === 'elenco')) || (cfg.manterNegociando && card.status === 'negociando');
      if (!trava) return;
      let c = (pools[p] || []).find(x => x.pk === card.pk);
      if (!c) c = { pk: card.pk, nome: card.nome, clube: card.clube, liga: card.liga, idade: card.idade, estr: !!card.estrangeiro, nota: card.ov != null ? Number(card.ov) : 55, notaFonte: card.ov != null ? 'ov' : 'padrão', notaA: null, sal: { v: Number(card.salario) || 0, f: 'campograma' }, card, pos: p, b: { id: card.jid }, fora: [], bonus: [], comp: {}, s: null, letra: null, t2: null, mi: null, semNota: true };
      else c = Object.assign({}, c, { sal: Number(card.salario) > 0 ? { v: Number(card.salario), f: 'campograma' } : c.sal });
      if (c.nota == null) c.nota = 55;
      t[p].push(c);
    }));
    return t;
  }
  function graficoFronteira(F, massa, notaAtual) {
    if (!F || F.length < 2) return '';
    const W = 1400, H = 330, L = 80, R = 30, T = 26, B = 48;
    const xs = F.map(f => f.massa), ys = F.map(f => f.nota);
    const xlo = Math.min(...xs), xhi = Math.max(...xs), ylo = Math.floor(Math.min(...ys) - 2), yhi = Math.ceil(Math.max(...ys) + 2);
    const X = v => L + (W - L - R) * (v - xlo) / (xhi - xlo || 1), Y = v => T + (H - T - B) * (1 - (v - ylo) / (yhi - ylo || 1));
    let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="dc-disp-svg">';
    for (let g = 0; g <= 4; g++) { const yv = ylo + (yhi - ylo) * g / 4; svg += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(yv) + '" y2="' + Y(yv) + '" class="grade"/><text x="' + (L - 8) + '" y="' + (Y(yv) + 4) + '" class="rot eixo" text-anchor="end">' + num(yv, 1) + '</text>'; }
    F.forEach((f, i) => { if (i % 2 === 0) svg += '<text x="' + X(f.massa) + '" y="' + (H - B + 18) + '" class="rot eixo" text-anchor="middle">' + num(f.massa / 1e6, 1) + ' mi</text>'; });
    svg += '<polyline points="' + F.map(f => X(f.massa) + ',' + Y(f.nota)).join(' ') + '" class="linha"/>';
    F.forEach(f => { svg += '<circle cx="' + X(f.massa) + '" cy="' + Y(f.nota) + '" r="4" class="pt"><title>' + esc('massa ' + brlk(f.massa) + ' → nota do time ' + num(f.nota, 1) + ' (custo ' + brlk(f.custo) + ')') + '</title></circle>'; });
    svg += '<line x1="' + X(massa) + '" x2="' + X(massa) + '" y1="' + T + '" y2="' + (H - B) + '" class="regua"/><text x="' + X(massa) + '" y="' + (T - 6) + '" class="rot regua" text-anchor="middle">orçamento ' + brlk(massa) + ' → ' + num(notaAtual, 1) + '</text>';
    svg += '<text x="' + (W / 2) + '" y="' + (H - 4) + '" class="rot titulo" text-anchor="middle">Massa salarial por mês →</text><text transform="translate(14 ' + (H / 2) + ') rotate(-90)" class="rot titulo" text-anchor="middle">Nota do time →</text></svg>';
    return svg;
  }
  async function responderElenco(Q, raiz) {
    raiz.innerHTML = '<div class="dc-espera">⏳ avaliando as 11 posições (uma vez por sessão)…<span id="dcProg"></span></div>';
    const prog = (p, i, n) => { const e = $q('#dcProg'); if (e) e.textContent = ' ' + POSN[p] + ' ' + Math.round(100 * i / n) + '%'; };
    const Qf = Object.assign({}, Q, { pos: [] }); const pools = {}, cands = {};
    for (const p of ORDEM) { pools[p] = await pool(p, Qf, prog); cands[p] = dentro(pools[p]); }
    const cfg = cfgElenco(Q), travados = travadosDe(cfg, pools);
    const res = otimizar(cands, Object.assign({}, cfg, { travados }));
    const passos = []; for (let m = 1.0e6; m <= 3.0e6 + 1; m += 2.0e5) passos.push(Math.round(m));
    if (!passos.includes(cfg.massa)) passos.push(cfg.massa); passos.sort((a, b) => a - b);
    const F = fronteira(cands, Object.assign({}, cfg, { travados }), passos);
    const fAt = F.find(f => f.massa === cfg.massa), fMais = F.find(f => f.massa > cfg.massa), fMenos = F.slice().reverse().find(f => f.massa < cfg.massa);
    const fator = (typeof estado !== 'undefined' && estado.fator) || 1.2269;
    const idades = ORDEM.flatMap(p => res.elenco[p]).map(c => c.idade).filter(x => x != null);
    const idadeMed = idades.length ? idades.reduce((a, b) => a + b, 0) / idades.length : null;
    const nTrav = ORDEM.reduce((s, p) => s + travados[p].length, 0);
    let html = '<section class="dc-sec dc-veredito"><h2>O melhor elenco com ' + brlk(cfg.massa) + '/mês de salários<small>' + res.n + ' atletas (' + ORDEM.map(p => cfg.porPos[p]).join('+') + ' por posição, as vagas do grupo atual) · custo do clube com encargos ' + brlk(res.custo * fator) + '/mês' + (nTrav ? ' · ' + nTrav + ' do campograma travados (fechados' + (cfg.manterNegociando ? ' e negociando' : '') + ')' : '') + '</small></h2>' +
      '<div class="dc-kpis"><div class="dc-kpi"><b>' + num(res.nota, 1) + '</b><small>Nota do time<br>(titular pesa 1, 2ª opção 0,6, 3ª 0,4)</small></div><div class="dc-kpi"><b>' + brlk(res.custo) + '</b><small>salários/mês<br>' + Math.round(100 * res.custo / cfg.massa) + '% do orçamento</small></div><div class="dc-kpi"><b>' + res.estr + ' <span>de ' + cfg.limEstr + '</span></b><small>estrangeiros</small></div><div class="dc-kpi"><b>' + num(idadeMed, 1) + '</b><small>idade média</small></div>' +
      (fMais ? '<div class="dc-kpi"><b>' + (fMais.nota - res.nota >= 0 ? '+' : '') + num(fMais.nota - res.nota, 1) + '</b><small>na nota do time se a massa fosse ' + brlk(fMais.massa) + '</small></div>' : '') + (fMenos ? '<div class="dc-kpi"><b>' + num(fMenos.nota - res.nota, 1) + '</b><small>se fosse ' + brlk(fMenos.massa) + '</small></div>' : '') + '</div>' +
      '<div class="dc-elenco-acoes"><button class="bt dc-levar">Criar grupo no campograma com este elenco</button><label class="dc-opc"><input type="checkbox" id="dcManterFech"' + (cfg.manterFechados ? ' checked' : '') + '> manter os fechados</label><label class="dc-opc"><input type="checkbox" id="dcManterNeg"' + (cfg.manterNegociando ? ' checked' : '') + '> manter também os "negociando"</label></div></section>';
    /* o campograma do elenco */
    const POSG = [['GOL'], ['LD', 'ZD', 'ZE', 'LE'], ['VOL', 'MED', 'MEI'], ['ED', 'CA', 'EE']];
    html += '<section class="dc-sec"><h3>O elenco, posição a posição<small>1ª linha de cada posição = titular pelo modelo · salário entre parênteses é estimado (~) · clique no nome para a ficha</small></h3><div class="dc-grid">' +
      POSG.map(g => '<div class="dc-linha-pos">' + g.map(p => { const L = res.elenco[p]; const tot = L.reduce((s, c) => s + c.sal.v, 0);
        return '<div class="dc-pos"><h4>' + esc(SIGP(p)) + ' <span>' + esc(POSN[p]) + '</span><em>' + brlk(tot) + '</em></h4>' + L.map((c, i) => '<div class="dc-pj' + (i === 0 ? ' tit' : '') + (c.travado ? ' trav' : '') + '" data-pk="' + esc(c.pk) + '"><span class="dc-foto"></span><div><b class="dc-nome" data-id="' + (c.b ? c.b.id : '') + '">' + esc(c.nome) + '</b><small>' + esc(c.clube || '') + (c.idade != null ? ' · ' + c.idade + ' a' : '') + (c.estr ? ' · <i class="dc-estr">estr.</i>' : '') + (c.travado ? ' · <i class="dc-trav">' + esc(STATUS_ROT[c.card.status] || 'travado') + '</i>' : '') + '</small><div class="dc-chips">' + (c.semNota ? '' : chipLetra(c) + chipSeta(c) + chipT2(c) + chipMin(c)) + '<span class="dc-chip sal">' + brlk(c.sal.v) + (c.sal.f === 'campograma' || c.sal.f === 'digitado' ? '' : '~') + '</span></div></div>' + (c.semNota && c.notaFonte !== 'ov' ? '<div class="dc-nota mini n" title="fechado no campograma, sem nota do modelo (entra com 55 na conta do time)"><b>—</b></div>' : '<div class="dc-nota mini ' + corNota(c.nota) + '"' + (c.semNota ? ' title="nota do campograma (não avaliado pelo modelo: sem indicadores ou fora dos filtros)"' : '') + '><b>' + R0(c.nota) + '</b></div>') + '</div>').join('') + '</div>'; }).join('') + '</div>').join('') + '</div></section>';
    /* fronteira */
    html += '<section class="dc-sec"><h3>Quanto cada real compra<small>a nota do melhor elenco que cabe em cada massa salarial (mesmas vagas, mesmos travados) — a curva achata onde pagar mais já não melhora o time</small></h3>' + graficoFronteira(F, cfg.massa, res.nota) + '</section>';
    /* alternativas por posição */
    html += '<section class="dc-sec"><h3>A próxima opção em cada posição<small>quem entraria se o escolhido não vier: o melhor de fora do elenco, com a diferença de nota e de salário</small></h3><div class="dc-alts">' +
      ORDEM.map(p => { const esc_ = new Set(res.elenco[p].map(c => c.pk)); const alt = cands[p].filter(c => !esc_.has(c.pk)).slice(0, 3); const ref = res.elenco[p][res.elenco[p].length - 1];
        return '<div class="dc-alt"><h4>' + esc(SIGP(p)) + '</h4>' + alt.map(c => '<div class="dc-alt-l" data-pk="' + esc(c.pk) + '"><b class="dc-nome" data-id="' + c.b.id + '">' + esc(c.nome) + '</b><small>' + esc(c.clube) + '</small><span class="dc-nota mini ' + corNota(c.nota) + '"><b>' + R0(c.nota) + '</b></span><em>' + (ref ? (c.nota - ref.nota >= 0 ? '+' : '') + num(c.nota - ref.nota, 1) + ' · ' + (c.sal.v - ref.sal.v >= 0 ? '+' : '−') + brlk(Math.abs(c.sal.v - ref.sal.v)) : '') + '</em></div>').join('') + '</div>'; }).join('') + '</div></section>';
    html += comoFunciona();
    raiz.innerHTML = html;
    ultimaResposta = { Q, res, cfg };
    const todos = ORDEM.flatMap(p => res.elenco[p]).filter(c => c.b && c.b.id != null && !c.semNota);
    pintarPerfis(raiz, todos);
    $q('#dcManterFech').onchange = e => { Q.manterFechados = e.target.checked; responderElenco(Q, raiz); };
    $q('#dcManterNeg').onchange = e => { Q.manterNegociando = e.target.checked; responderElenco(Q, raiz); };
    raiz.querySelector('.dc-levar').onclick = () => levarParaCampograma(res, cfg);
  }
  function levarParaCampograma(res, cfg) {
    if (typeof estado === 'undefined' || typeof novoEstado !== 'function') { toast('O campograma não está carregado', 'ruim'); return; }
    const nome = prompt('Nome do novo grupo (o grupo atual continua salvo se você já clicou em Salvar):', 'Decisão ' + brlk(cfg.massa) + ' · ' + new Date().toLocaleDateString('pt-BR'));
    if (nome === null) return;
    const velho = estado;
    const novo = novoEstado(); novo.nome = nome || 'Decisão'; novo.alvoAtletas = Object.assign({}, velho.alvoAtletas || {}); novo.teto = velho.teto; novo.comissao = velho.comissao; novo.fator = velho.fator; novo.limiteEstrangeiros = velho.limiteEstrangeiros; novo.cotacaoEuro = velho.cotacaoEuro;
    ORDEM.forEach(p => res.elenco[p].forEach((c, i) => {
      const j = c.b && c.b.id != null ? BASE.find(x => x.id === c.b.id) : null;
      if (c.travado && c.card) { novo.elenco[p].push(Object.assign({}, c.card, { uid: uid(), titular: i === 0 })); return; }
      if (!j) return;
      novo.elenco[p].push({ uid: uid(), jid: j.id, pk: primaryKey(j), nome: j.n, nomeCompleto: j.nc || '', clube: j.t, liga: j.l, idade: j.id_, ov: j.ov, contrato: j.ct, posOrig: j.p, salario: Math.round(c.sal.v), sugerido: c.sal.f === 'campograma' || c.sal.f === 'digitado' ? 0 : 1, nac: j.nac || '', psp: j.psp || '', estrangeiro: typeof ehEstrangeiroBase === 'function' ? ehEstrangeiroBase(j) : false, status: 'alvo', titular: i === 0 });
    }));
    estado = novo;
    try { salvarLocal(); render(); if (typeof sincronizarBotoes === 'function') sincronizarBotoes(); if (typeof listarCenarios === 'function') listarCenarios(); } catch (e) { console.warn(e); }
    if (typeof gravarCenario === 'function') gravarCenario();
    toast('Grupo "' + (nome || 'Decisão') + '" criado com ' + res.n + ' atletas — salários estimados ficam marcados', 'bom');
    try { window.irParaAba && window.irParaAba('campo'); } catch (e) {}
  }

  /* ---------------- resposta: comparar dois ou três nomes ---------------- */
  function escolherCand(n, Q) {
    const c = n.cands || []; if (c.length === 1) return c[0];
    const pts = b => { let s2 = 0; try { if (cardDe(primaryKey(b))) s2 += 1000; } catch (e) {} if (Q && Q.pos && Q.pos.length && Q.pos.includes(b.p)) s2 += 500; return s2 + Math.min(b.min || 0, 400) / 400 * 100; };
    return c.slice().sort((a, b) => pts(b) - pts(a))[0] || null;
  }
  const motivoEscolha = (n, Q) => { const b = escolherCand(n, Q); if (!b) return ''; let m = 'mais minutos'; try { if (cardDe(primaryKey(b))) m = 'o que está no campograma'; else if (Q && Q.pos && Q.pos.includes(b.p)) m = 'o da posição pedida'; } catch (e) {} return 'usei ' + m + ': ' + b.t; };
  async function responderComparar(Q, raiz) {
    const nomes = (Q.nomes || []).slice(0, 4);
    if (nomes.length < 2) { raiz.innerHTML = '<section class="dc-sec"><h3>Comparar: não achei dois nomes na base</h3><p class="dc-txt">Escreva como no app, por exemplo: "comparar Carlão e Raniel".' + (nomes.length === 1 ? ' Achei só ' + esc(nomes[0].nome) + '.' : '') + '</p></section>'; return; }
    raiz.innerHTML = '<div class="dc-espera">⏳ comparando…</div>';
    const cs = [];
    for (const n of nomes) { const b = escolherCand(n, Q); if (!b) continue; const pos = Q.pos[0] || b.p; const kp = await kpisPos(pos); cs.push(avaliar(b, pos, kp, null)); }
    if (cs.length < 2) { raiz.innerHTML = '<section class="dc-sec"><h3>Não consegui montar a comparação</h3></section>'; return; }
    const melhor = cs.slice().sort((a, b) => (b.nota || 0) - (a.nota || 0))[0];
    const amb = nomes.filter(n => (n.cands || []).length > 1).map(n => n.nome + ' (' + n.cands.length + ' na base — ' + motivoEscolha(n, Q) + ')');
    const pos = cs[0].pos; const L = await pool(pos, null, null);
    let html = '<section class="dc-sec dc-veredito"><h2>Comparação · ' + cs.map(c => esc(c.nome)).join(' × ') + '<small>na posição ' + esc(POSN[pos]) + (amb.length ? ' · ' + esc(amb.join('; ')) : '') + (cs.length > 1 && Math.abs(cs[0].nota - cs[1].nota) < 3 ? ' · <b>empate técnico</b>' : '') + '</small></h2><div class="dc-cards">' + cs.map((c, i) => cardGrande(c, i, melhor)).join('') + '</div></section>';
    html += reguas(cs, dentro(L).length ? dentro(L) : L, nossosDa(pos, L).filter(x => !cs.some(y => y.pk === x.pk)), pos);
    html += comoFunciona();
    raiz.innerHTML = html; pintarPerfis(raiz, cs); ultimaResposta = { Q };
  }
  async function responderFicha(Q, raiz) {
    const n = (Q.nomes || [])[0]; const b = n && escolherCand(n, Q);
    if (!b) { raiz.innerHTML = '<section class="dc-sec"><h3>Não achei esse nome na base</h3></section>'; return; }
    const kp = await kpisPos(b.p); const c = avaliar(b, b.p, kp, null);
    raiz.innerHTML = '<section class="dc-sec dc-veredito"><h2>' + esc(c.nome) + '<small>' + esc(POSN[c.pos]) + ' · a leitura do modelo; a ficha completa abre no botão</small></h2><div class="dc-cards um">' + cardGrande(c, 0, null) + '</div></section>' + comoFunciona();
    pintarPerfis(raiz, [c]); ultimaResposta = { Q };
    try { if (typeof abrirFicha === 'function') abrirFicha(b.id); } catch (e) {}
  }

  /* ---------------- como o modelo funciona ---------------- */
  function comoFunciona() {
    const P = PREM;
    return '<details class="dc-sec dc-como"><summary><h3>Como a Nota 2027 é calculada<small>tudo o que entra na conta, com os pesos em uso — edite nas premissas</small></h3></summary><div class="dc-como-c">' +
      '<p><b>Técnico</b> = a nota do estudo Santa Cruz V2: média da <b>aderência</b> (percentil, dentro da liga e da posição, nos 4 a 7 indicadores da ficha da posição; quem vem de fora passa pela reta de conversão de liga — Série A: 48 + 0,28 × p; fora do Brasil: 31 + 0,30 × p) com o <b>nível</b> (overall do Portal). Quem não tem a nota do estudo ganha uma conta ao vivo (seta contra a régua de quem sobe + nível ajustado pela força da liga), marcada com *.</p>' +
      '<p><b>Físico</b> = a letra do app: A+ 100 · A 85 · B 55 · C 20. <b>2º tempo</b> = elite 100 · mantém 75 · cai um pouco 40 · cai muito 10. <b>Minutagem</b> = % dos minutos do time nos últimos 3 anos (75% = 100). <b>Idade</b> = curva do titular (23 a 30 anos em 2027 = 100; cai a partir de 31; o jovem conta a favor no modo "aposta"). <b>Liga</b> = força da liga ÷ força da Série B (tabela do Portal Ranking; Série A, Argentina A e Portugal B valem 100; Série C 51).</p>' +
      '<p><b>Pesos</b>: ' + ['pesos', 'pesosFis', 'pesosGol'].map(k => (k === 'pesos' ? 'demais posições' : k === 'pesosFis' ? 'onde o físico pesa (LD, LE, EE, VOL, MED)' : 'goleiro') + ': ' + Object.keys(P[k]).filter(x => P[k][x]).map(x => x + ' ' + P[k][x]).join(', ')).join(' · ') + '.</p>' +
      '<p><b>Bônus</b> (do estudo): cobrador de bola parada +' + P.bonus.cob + ' (MEI, ED, EE, MED, laterais) · finalizador aéreo +' + P.bonus.aer + ' (zagueiros e CA) · gol de defesa +' + P.bonus.golDef + ' · corrida para a área +' + P.bonus.area + ' · sem físico ' + P.bonus.semFis + ' · técnico parcial ' + P.bonus.parcial + '.</p>' +
      '<p><b>Filtros</b> (tiram da lista, com o motivo mostrado): menos de ' + num(P.filtros.minMin) + ' min em 2026 · PSV-99 abaixo de ' + P.filtros.psvPiso + ' km/h · valor acima de € ' + num(P.filtros.tetoValor / 1e6, 1) + ' mi · vetados pelo clube (EXCLUIDOS) · clubes fora do alcance · ' + (P.filtros.soAlcancaveis ? 'só ligas alcançáveis (Brasil, América do Sul e as ligas do estudo)' : 'todas as ligas') + (P.filtros.semSerieA ? ' · sem Série A' : '') + '.</p>' +
      '<p><b>Salário</b> (R$/mês, o que o jogador recebe): o do campograma; senão o digitado aqui; senão a faixa do TransferRoom (€/ano × ' + P.salario.cotacao + ' ÷ 12 × ' + P.salario.fatorTR + ', calibrado nos salários já digitados); senão uma estimativa pela liga e pela nota. O custo do clube é o salário × encargos (' + num((typeof estado !== 'undefined' && estado.fator) || 1.2269, 4) + ').</p>' +
      '<p><b>Elenco</b>: maximiza a nota do time (titular 1 · 2ª opção 0,6 · 3ª 0,4) dentro da massa salarial, das vagas por posição do grupo atual e do limite de estrangeiros; os "fechados" entram travados. O método é o preço-sombra do real: cada candidato vale nota − λ × salário, e o λ sobe até o elenco caber; depois, trocas locais.</p>' +
      '<p class="dc-fontes"><b>Fontes</b>: Wyscout (técnico, minutagem, bola parada jogo a jogo) · SkillCorner (físico, 2º tempo) · Transfermarkt (contrato, valor, altura, pé, foto) · TransferRoom (faixa salarial, listas do Scout) · SofaScore (nota, referência) · Footlink/FotMob (contrato) · estudo Santa Cruz V2 (régua de quem sobe, aderência, nível, conversão de liga) · Portal Ranking (força das ligas) · Indicados e vetados do clube.</p></div></details>';
  }

  /* ---------------- a página ---------------- */
  let ultimaResposta = null, Qatual = null;
  const EXEMPLOS = ['Quem devo contratar para ser o centroavante do Santa Cruz em 2027?', 'Qual o melhor elenco para a Série B de 2027 com até 2 milhões por mês em salários?', 'Zagueiro esquerdo canhoto até 29 anos que pode vir livre', 'Lateral direito A+ da Série B que mantém no 2º tempo', 'Meia cobrador de bola parada, brasileiro, até R$ 120 mil por mês', 'Goleiro até 32 anos, Série B ou Série C', 'Comparar Carlão e Raniel', 'Volante argentino até 27 anos'];
  function montarPagina(el) {
    el.innerHTML = '<div class="dc"><header class="dc-topo"><div class="dc-titulo"><b>Decisão 2027</b><small>pergunte ao modelo: ele junta o estudo, o campograma e todas as bases do app e responde com nome, porquê, alternativas e quem ficou de fora</small></div>' +
      '<form class="dc-perg" id="dcForm"><input id="dcPerg" autocomplete="off" placeholder="Ex.: quem devo contratar para ser o centroavante do Santa Cruz em 2027?"><button class="bt" type="submit">Responder</button></form>' +
      '<div class="dc-ex">' + EXEMPLOS.map(e => '<button type="button" class="dc-exb">' + esc(e) + '</button>').join('') + '</div></header>' +
      '<div class="dc-leitura" id="dcLeitura"></div><div class="dc-corpo" id="dcCorpo"><div class="dc-vazio">Escreva a pergunta em português, ou clique num exemplo. A resposta sai com os 3 melhores, o que temos hoje na posição, as réguas, a dispersão qualidade × custo, a lista completa e quem ficou de fora.</div></div>' +
      '<details class="dc-prem" id="dcPrem"><summary>Premissas do modelo (pesos, filtros, salários)</summary><div id="dcPremC"></div></details></div>';
    $q('#dcForm').onsubmit = ev => { ev.preventDefault(); perguntar($q('#dcPerg').value); };
    el.querySelectorAll('.dc-exb').forEach(b => { b.onclick = () => { $q('#dcPerg').value = b.textContent; perguntar(b.textContent); }; });
    montarPremissas();
    el.addEventListener('click', ev => {
      const n = ev.target.closest('.dc-nome, .dc-ficha'); if (n && n.dataset.id) { ev.preventDefault(); const id = isNaN(+n.dataset.id) ? n.dataset.id : +n.dataset.id; try { abrirFicha(id); } catch (e) {} return; }
      const a = ev.target.closest('.dc-add'); if (a) { adicionar(+a.dataset.id, a.dataset.pos, +a.dataset.sal, a); return; }
    });
    el.addEventListener('change', ev => {
      const s = ev.target.closest('.dc-sal'); if (!s) return;
      const v = Math.round(parseFloat(String(s.value).replace(',', '.')) * 1000);
      if (v > 0) SALX[s.dataset.pk] = v; else delete SALX[s.dataset.pk];
      salxGrava(); Object.keys(POOL).forEach(k => delete POOL[k]);
      if (Qatual) responder(Qatual);
    });
    try { const u = JSON.parse(localStorage.getItem(LS_ULT) || 'null'); if (u && u.texto) $q('#dcPerg').value = u.texto; } catch (e) {}
  }
  function adicionar(id, pos, sal, bt) {
    if (typeof estado === 'undefined' || typeof adicionarDaBase !== 'function') return;
    const j = BASE.find(x => x.id === id); if (!j) return;
    if (!estado.elenco[pos]) estado.elenco[pos] = [];
    if (estado.elenco[pos].some(x => x.jid === id)) { toast(j.n + ' já está em ' + SIGP(pos)); return; }
    const antes = posAtual; try { posAtual = pos; adicionarDaBase(id); } finally { posAtual = antes; }
    const card = estado.elenco[pos].find(x => x.jid === id);
    if (card && sal > 0 && !card.salario) { card.salario = Math.round(sal); card.sugerido = 1; salvarLocal(); render(); }
    if (bt) { bt.replaceWith(Object.assign(document.createElement('span'), { className: 'dc-ja', textContent: 'no campograma' })); }
  }
  function perguntar(texto) {
    texto = String(texto || '').trim(); if (!texto) return;
    const Q = interpretar(texto); Qatual = Q;
    try { localStorage.setItem(LS_ULT, JSON.stringify({ texto })); } catch (e) {}
    montarLeitura(Q); responder(Q);
  }
  /* o índice de ameaça (xT) carrega sob demanda, como na aba Ameaça */
  function carregarAmeaca() {
    if (window.AMEACA) return Promise.resolve();
    if (window.__dcAmeacaP) return window.__dcAmeacaP;
    window.__dcAmeacaP = new Promise(res => { const s = document.createElement('script'); s.src = (window.__estatico ? '' : '/') + 'static/ameaca_dados.js?v=' + (window.__verDados || Date.now()); s.onload = () => res(); s.onerror = () => res(); document.head.appendChild(s); });
    return window.__dcAmeacaP;
  }
  async function responder(Q) {
    const raiz = $q('#dcCorpo'); if (!raiz) return;
    if (!window.AMEACA) { raiz.innerHTML = '<div class="dc-espera">⏳ carregando o índice de ameaça…</div>'; await carregarAmeaca(); }
    if (Q.intent === 'elenco') return responderElenco(Q, raiz);
    if (Q.intent === 'comparar') return responderComparar(Q, raiz);
    if (Q.intent === 'ficha') return responderFicha(Q, raiz);
    return responderContratar(Q, raiz);
  }
  /* a leitura do pedido, com os controles para ajustar sem reescrever */
  function montarLeitura(Q) {
    const el = $q('#dcLeitura'); if (!el) return;
    const sel = (id, ops, v) => '<select id="' + id + '">' + ops.map(o => '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(v) ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select>';
    el.innerHTML = '<div class="dc-leit-txt"><b>Entendi:</b> ' + leitura(Q).map(x => '<span class="dc-chip leit">' + esc(x) + '</span>').join('') + '</div>' +
      '<div class="dc-leit-ctl">' +
      '<label>Pergunta ' + sel('dlInt', [['contratar', 'quem contratar'], ['elenco', 'melhor elenco'], ['comparar', 'comparar'], ['ficha', 'ficha']], Q.intent) + '</label>' +
      '<label>Posição ' + sel('dlPos', [['', 'todas / do pedido']].concat(ORDEM.map(p => [p, POSN[p]])), Q.pos.length === 1 ? Q.pos[0] : '') + '</label>' +
      '<label>Nacionalidade ' + sel('dlNac', [['', 'qualquer'], ['br', 'só brasileiros'], ['sul', 'sul-americanos'], ['ex', 'só estrangeiros']], Q.nac) + '</label>' +
      '<label>Idade <input id="dlImin" type="number" min="16" max="45" placeholder="de" value="' + (Q.idadeMin != null ? Q.idadeMin : '') + '"> a <input id="dlImax" type="number" min="16" max="45" placeholder="até" value="' + (Q.idadeMax != null ? Q.idadeMax : '') + '"></label>' +
      '<label><input type="checkbox" id="dlLivre"' + (Q.livre ? ' checked' : '') + '> pode vir livre</label>' +
      '<label>Salário máx. (R$ mil/mês) <input id="dlSal" type="number" min="0" step="10" value="' + (Q.salMax ? Math.round(Q.salMax / 1000) : '') + '"></label>' +
      '<label>Massa salarial (R$ mil/mês) <input id="dlMassa" type="number" min="500" step="100" value="' + (Q.massa ? Math.round(Q.massa / 1000) : '') + '"></label>' +
      '<label>Papel ' + sel('dlPapel', [['', 'titular'], ['aposta', 'reserva / aposta']], Q.papel || '') + '</label>' +
      '<label>Mostrar <input id="dlN" type="number" min="3" max="50" value="' + (Q.n || 3) + '"></label>' +
      '<button class="bt mini" id="dlOk">Refazer</button></div>';
    $q('#dlOk').onclick = () => {
      Q.intent = $q('#dlInt').value; const p = $q('#dlPos').value; if (p) Q.pos = [p];
      Q.nac = $q('#dlNac').value; Q.idadeMin = $q('#dlImin').value ? +$q('#dlImin').value : null; Q.idadeMax = $q('#dlImax').value ? +$q('#dlImax').value : null;
      Q.livre = $q('#dlLivre').checked; Q.salMax = $q('#dlSal').value ? +$q('#dlSal').value * 1000 : null; Q.massa = $q('#dlMassa').value ? +$q('#dlMassa').value * 1000 : Q.massa;
      Q.papel = $q('#dlPapel').value || null; Q.n = +$q('#dlN').value || 3;
      montarLeitura(Q); responder(Q);
    };
  }
  /* premissas */
  function montarPremissas() {
    const el = $q('#dcPremC'); if (!el) return;
    const campo = (k, sub, rot, v, step) => '<label>' + esc(rot) + ' <input type="number" step="' + (step || 1) + '" data-k="' + k + '" data-sub="' + sub + '" value="' + v + '"></label>';
    const grupo = (k, tit) => '<div class="dc-prem-g"><h4>' + tit + '</h4>' + Object.keys(PREM[k]).map(s => campo(k, s, { tec: 'técnico', fis: 'físico', t2: '2º tempo', min: 'minutagem', idade: 'idade', liga: 'liga' }[s] || s, PREM[k][s])).join('') + '</div>';
    el.innerHTML = grupo('pesos', 'Pesos · demais posições') + grupo('pesosFis', 'Pesos · onde o físico pesa (LD, LE, EE, VOL, MED)') + grupo('pesosGol', 'Pesos · goleiro') +
      '<div class="dc-prem-g"><h4>Bônus</h4>' + [['cob', 'cobrador'], ['aer', 'finalizador aéreo'], ['golDef', 'gol de defesa'], ['area', 'corrida p/ área'], ['semFis', 'sem físico'], ['parcial', 'técnico parcial']].map(([s, r]) => campo('bonus', s, r, PREM.bonus[s])).join('') + '</div>' +
      '<div class="dc-prem-g"><h4>Filtros</h4>' + campo('filtros', 'minMin', 'mín. minutos 2026', PREM.filtros.minMin, 50) + campo('filtros', 'psvPiso', 'piso PSV-99 (km/h)', PREM.filtros.psvPiso, 0.5) + campo('filtros', 'tetoValor', 'teto de valor (€)', PREM.filtros.tetoValor, 100000) +
        [['semSerieA', 'sem Série A'], ['soAlcancaveis', 'só ligas alcançáveis'], ['semGrandes', 'sem clubes grandes'], ['vetados', 'tirar os vetados'], ['duplicatas', 'juntar duplicatas']].map(([s, r]) => '<label><input type="checkbox" data-k="filtros" data-sub="' + s + '"' + (PREM.filtros[s] ? ' checked' : '') + '> ' + r + '</label>').join('') + '</div>' +
      '<div class="dc-prem-g"><h4>Salário</h4>' + campo('salario', 'cotacao', 'cotação €', PREM.salario.cotacao, 0.1) + campo('salario', 'fatorTR', 'fator sobre o TransferRoom', PREM.salario.fatorTR, 0.1) + campo('salario', 'tetoPadrao', 'teto padrão por jogador (R$/mês; 0 = sem teto)', PREM.salario.tetoPadrao, 10000) +
        ['Brasil A', 'Brasil B', 'Brasil C', 'sulamA', 'sulamB', 'exterior', 'outras'].map(s => '<label>' + esc({ sulamA: 'Sul-am. 1ª div.', sulamB: 'Sul-am. 2ª div.', exterior: 'exterior alcançável', outras: 'outras ligas' }[s] || s) + ' (R$/mês base) <input type="number" step="5000" data-k="salario.liga" data-sub="' + esc(s) + '" value="' + PREM.salario.liga[s] + '"></label>').join('') + '</div>' +
      '<div class="dc-prem-acoes"><button class="bt mini" id="dcPremOk">Aplicar</button><button class="bt mini" id="dcPremReset">Restaurar o padrão</button><small>as premissas ficam neste navegador</small></div>';
    $q('#dcPremOk').onclick = () => {
      el.querySelectorAll('input[data-k]').forEach(i => { const k = i.dataset.k, s = i.dataset.sub; const alvo = k === 'salario.liga' ? PREM.salario.liga : PREM[k]; if (i.type === 'checkbox') alvo[s] = i.checked; else { const v = parseFloat(i.value); if (isFinite(v)) alvo[s] = v; } });
      premGrava(); Object.keys(POOL).forEach(k => delete POOL[k]); toast('Premissas aplicadas', 'bom'); if (Qatual) responder(Qatual);
    };
    $q('#dcPremReset').onclick = () => { PREM = JSON.parse(JSON.stringify(PREM0)); premGrava(); Object.keys(POOL).forEach(k => delete POOL[k]); montarPremissas(); toast('Premissas no padrão'); if (Qatual) responder(Qatual); };
  }

  /* ---------------- ligar à aba ---------------- */
  function ligar() {
    const bt = document.querySelector('.aba[data-aba="decisao"]'), pg = document.getElementById('pgDecisao'), el = document.getElementById('dcRaiz');
    if (!bt || !pg || !el) return;
    let feito = false;
    const sync = () => { const on = bt.classList.contains('on'); pg.classList.toggle('oculta', !on); if (on && !feito) { feito = true; montarPagina(el); } };
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    /* dados colados, grupo trocado ou KPIs que chegaram: a conta é refeita na próxima pergunta */
    window.addEventListener('subida-kpis', () => { Object.keys(POOL).forEach(k => delete POOL[k]); });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
  window.DECISAO = { perguntar, interpretar, avaliar, pool, otimizar, PREM: () => PREM };
})();
