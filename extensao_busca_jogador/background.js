// BFR Busca Jogador — Wyscout e SkillCorner (app Santa Cruz, 24/10/2026).
// Ponte entre o app e os dois sites JÁ LOGADOS neste Chrome: faz, dentro de uma aba de cada site,
// as mesmas consultas que as telas fazem (busca avançada do Wyscout e Physical do SkillCorner).
// Não guarda senha nem dado. Não baixa PDF nem Excel. Fonte: Santa Cruz/extensao_busca_jogador/.
const VERSAO = '1.4.0';  // 08/11: comparativo 12 meses (wy_12m: técnico jogo a jogo somado + minutagem por clube)
const VERSAO_ANT = '1.3.1';  // 24/10: corridas sem bola (Game Intelligence) · 25/10: minutagem e bola parada (Wyscout jogo a jogo)
const WY = 'https://wyscout.hudl.com/app/';
const SC = 'https://skillcorner.com/app/physical';
const dorme = (ms) => new Promise((r) => setTimeout(r, ms));

/* Colunas do esquema "ALL" da busca avançada (as mesmas 119 que a tela pede) + identificação. */
const WY_COLS = 'name,id,image,current_team_logo,current_team_color,birth_country_name,passport_country_names,current_team_name,market_value,total_matches,minutes_on_field,last_club_name,positions,age,contract_expires,goals,xg_shot,assists,xg_assist,duels_avg,duels_won,foot,height,weight,on_loan,successful_defensive_actions_avg,defensive_duels_avg,defensive_duels_won,aerial_duels_avg,aerial_duels_won,tackle_avg,possession_adjusted_tackle,shot_block_avg,interceptions_avg,possession_adjusted_interceptions,fouls_avg,yellow_cards,yellow_cards_avg,red_cards,red_cards_avg,successful_attacking_actions_avg,goals_avg,non_penalty_goal,non_penalty_goal_avg,xg_shot_avg,head_goals,head_goals_avg,shots,shots_avg,shots_on_target_percent,goal_conversion_percent,assists_avg,crosses_avg,accurate_crosses_percent,cross_from_left_avg,successful_cross_from_left_percent,cross_from_right_avg,successful_cross_from_right_percent,cross_to_goalie_box_avg,dribbles_avg,successful_dribbles_percent,offensive_duels_avg,offensive_duels_won,touch_in_box_avg,progressive_run_avg,accelerations_avg,received_pass_avg,received_long_pass_avg,foul_suffered_avg,passes_avg,accurate_passes_percent,forward_passes_avg,successful_forward_passes_percent,back_passes_avg,successful_back_passes_percent,vertical_passes_avg,successful_vertical_passes_percent,short_medium_pass_avg,accurate_short_medium_pass_percent,long_passes_avg,successful_long_passes_percent,average_pass_length,average_long_pass_length,xg_assist_avg,shot_assists_avg,pre_assist_avg,pre_pre_assist_avg,smart_passes_avg,accurate_smart_passes_percent,key_passes_avg,passes_to_final_third_avg,accurate_passes_to_final_third_percent,pass_to_penalty_area_avg,accurate_pass_to_penalty_area_percent,through_passes_avg,successful_through_passes_percent,deep_completed_pass_avg,deep_completed_cross_avg,progressive_pass_avg,successful_progressive_pass_percent,conceded_goals,conceded_goals_avg,shots_against,shots_against_avg,clean_sheets,save_percent,xg_save,xg_save_avg,prevented_goals,prevented_goals_avg,back_pass_to_gk_avg,goalkeeper_exits_avg,gk_aerial_duels_avg,free_kicks_taken_avg,direct_free_kicks_taken_avg,direct_free_kicks_on_target_percent,corners_taken_avg,penalties_taken,penalties_conversion_percent,full_name,birth_date,domestic_competition_name';

/* Coluna da API → nome da coluna no Excel exportado pelo Wyscout (em inglês). Conferido em 24/10:
   as 93 colunas de estatística saem na mesma ordem do Excel. gk_aerial_duels_avg não vira coluna
   (no Excel ela é o "Aerial duels per 90" repetido do goleiro). vertical_passes = "Lateral passes". */
const WY_EXCEL = {
  current_team_name: 'Team', last_club_name: 'Team within selected timeframe', positions: 'Position', age: 'Age',
  market_value: 'Market value', contract_expires: 'Contract expires', total_matches: 'Matches played', minutes_on_field: 'Minutes played',
  goals: 'Goals', xg_shot: 'xG', assists: 'Assists', xg_assist: 'xA', duels_avg: 'Duels per 90', duels_won: 'Duels won, %',
  birth_country_name: 'Birth country', passport_country_names: 'Passport country', foot: 'Foot', height: 'Height', weight: 'Weight', on_loan: 'On loan',
  successful_defensive_actions_avg: 'Successful defensive actions per 90', defensive_duels_avg: 'Defensive duels per 90', defensive_duels_won: 'Defensive duels won, %',
  aerial_duels_avg: 'Aerial duels per 90', aerial_duels_won: 'Aerial duels won, %', tackle_avg: 'Sliding tackles per 90', possession_adjusted_tackle: 'PAdj Sliding tackles',
  shot_block_avg: 'Shots blocked per 90', interceptions_avg: 'Interceptions per 90', possession_adjusted_interceptions: 'PAdj Interceptions', fouls_avg: 'Fouls per 90',
  yellow_cards: 'Yellow cards', yellow_cards_avg: 'Yellow cards per 90', red_cards: 'Red cards', red_cards_avg: 'Red cards per 90',
  successful_attacking_actions_avg: 'Successful attacking actions per 90', goals_avg: 'Goals per 90', non_penalty_goal: 'Non-penalty goals', non_penalty_goal_avg: 'Non-penalty goals per 90',
  xg_shot_avg: 'xG per 90', head_goals: 'Head goals', head_goals_avg: 'Head goals per 90', shots: 'Shots', shots_avg: 'Shots per 90', shots_on_target_percent: 'Shots on target, %',
  goal_conversion_percent: 'Goal conversion, %', assists_avg: 'Assists per 90', crosses_avg: 'Crosses per 90', accurate_crosses_percent: 'Accurate crosses, %',
  cross_from_left_avg: 'Crosses from left flank per 90', successful_cross_from_left_percent: 'Accurate crosses from left flank, %',
  cross_from_right_avg: 'Crosses from right flank per 90', successful_cross_from_right_percent: 'Accurate crosses from right flank, %',
  cross_to_goalie_box_avg: 'Crosses to goalie box per 90', dribbles_avg: 'Dribbles per 90', successful_dribbles_percent: 'Successful dribbles, %',
  offensive_duels_avg: 'Offensive duels per 90', offensive_duels_won: 'Offensive duels won, %', touch_in_box_avg: 'Touches in box per 90',
  progressive_run_avg: 'Progressive runs per 90', accelerations_avg: 'Accelerations per 90', received_pass_avg: 'Received passes per 90',
  received_long_pass_avg: 'Received long passes per 90', foul_suffered_avg: 'Fouls suffered per 90', passes_avg: 'Passes per 90', accurate_passes_percent: 'Accurate passes, %',
  forward_passes_avg: 'Forward passes per 90', successful_forward_passes_percent: 'Accurate forward passes, %', back_passes_avg: 'Back passes per 90',
  successful_back_passes_percent: 'Accurate back passes, %', vertical_passes_avg: 'Lateral passes per 90', successful_vertical_passes_percent: 'Accurate lateral passes, %',
  short_medium_pass_avg: 'Short / medium passes per 90', accurate_short_medium_pass_percent: 'Accurate short / medium passes, %', long_passes_avg: 'Long passes per 90',
  successful_long_passes_percent: 'Accurate long passes, %', average_pass_length: 'Average pass length, m', average_long_pass_length: 'Average long pass length, m',
  xg_assist_avg: 'xA per 90', shot_assists_avg: 'Shot assists per 90', pre_assist_avg: 'Second assists per 90', pre_pre_assist_avg: 'Third assists per 90',
  smart_passes_avg: 'Smart passes per 90', accurate_smart_passes_percent: 'Accurate smart passes, %', key_passes_avg: 'Key passes per 90',
  passes_to_final_third_avg: 'Passes to final third per 90', accurate_passes_to_final_third_percent: 'Accurate passes to final third, %',
  pass_to_penalty_area_avg: 'Passes to penalty area per 90', accurate_pass_to_penalty_area_percent: 'Accurate passes to penalty area, %',
  through_passes_avg: 'Through passes per 90', successful_through_passes_percent: 'Accurate through passes, %', deep_completed_pass_avg: 'Deep completions per 90',
  deep_completed_cross_avg: 'Deep completed crosses per 90', progressive_pass_avg: 'Progressive passes per 90', successful_progressive_pass_percent: 'Accurate progressive passes, %',
  conceded_goals: 'Conceded goals', conceded_goals_avg: 'Conceded goals per 90', shots_against: 'Shots against', shots_against_avg: 'Shots against per 90',
  clean_sheets: 'Clean sheets', save_percent: 'Save rate, %', xg_save: 'xG against', xg_save_avg: 'xG against per 90', prevented_goals: 'Prevented goals',
  prevented_goals_avg: 'Prevented goals per 90', back_pass_to_gk_avg: 'Back passes received as GK per 90', goalkeeper_exits_avg: 'Exits per 90',
  free_kicks_taken_avg: 'Free kicks per 90', direct_free_kicks_taken_avg: 'Direct free kicks per 90', direct_free_kicks_on_target_percent: 'Direct free kicks on target, %',
  corners_taken_avg: 'Corners per 90', penalties_taken: 'Penalties taken', penalties_conversion_percent: 'Penalty conversion, %',
};
/* SkillCorner (API) → nome da coluna no CSV do site (o mesmo que o app lê quando você cola). */
const SC_CSV = {
  player_name: 'Player', player_short_name: 'Short Name', player_id: 'Player ID', player_birthdate: 'Birthdate', minutes_full_all: 'Minutes',
  count_match: 'Count Performances (Physical Check passed)', psv99: 'PSV-99', psv99_top5: 'TOP 5 PSV-99', peak_velocity: 'Peak Velocity',
  peak_velocity_top3: 'TOP 3 Peak Velocity', timetohsr_top3: 'TOP 3 Time to HSR', timetohsrpostcod_top3: 'TOP 3 Time to HSR post COD',
  timetosprint_top3: 'TOP 3 Time to Sprint', timetosprintpostcod_top3: 'TOP 3 Time to Sprint post COD',
  timeto505around90_top3: 'TOP 3 Time to 505 around 90', timeto505around180_top3: 'TOP 3 Time to 505 around 180',
  total_distance_full_all_p90: 'Distance P90', total_metersperminute_full_all_p90: 'M/min P90', running_distance_full_all_p90: 'Running Distance P90',
  hsr_distance_full_all_p90: 'HSR Distance P90', hsr_count_full_all_p90: 'HSR Count P90', sprint_distance_full_all_p90: 'Sprint Distance P90',
  sprint_count_full_all_p90: 'Sprint Count P90', hi_distance_full_all_p90: 'HI Distance P90', hi_count_full_all_p90: 'HI Count P90',
  medaccel_count_full_all_p90: 'Medium Acceleration Count P90', highaccel_count_full_all_p90: 'High Acceleration Count P90',
  meddecel_count_full_all_p90: 'Medium Deceleration Count P90', highdecel_count_full_all_p90: 'High Deceleration Count P90',
  explacceltohsr_count_full_all_p90: 'Explosive Acceleration to HSR Count P90', explacceltosprint_count_full_all_p90: 'Explosive Acceleration to Sprint Count P90',
  cod_count_full_all_p90: 'Change of Direction Count P90',
};

/* ── funções injetadas nas páginas (rodam lá, com o login de quem usa) ── */
function pgWyLogado() { return !!(window.uidirectives && window.uidirectives.access_key); }
async function pgWyBusca(nome, tf, cols) {
  const tok = window.uidirectives && window.uidirectives.access_key;
  if (!tok) return { __erro: 'login' };
  const p = { 'search[women_mode]': 'false', 'search[time_frame]': tf, 'search[name]': nome, 'search[youth_stats]': 'false',
    count: 100, page: 0, sort: 'minutes_on_field desc', language: 'pt', columns: cols, token: tok, groupId: 396, subgroupId: 1752 };
  const qs = Object.entries(p).map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&');
  for (let t = 0; t < 3; t++) {
    try {
      const r = await fetch('https://searchapi.wyscout.com/api/v1/search/results.json?' + qs);
      if (r.ok) { const j = await r.json(); return { players: j.players || [] }; }
      if (r.status === 401 || r.status === 403) return { __erro: 'login' };
    } catch (e) { /* tenta de novo */ }
    await new Promise((ok) => setTimeout(ok, 800 * (t + 1)));
  }
  return { __erro: 'rede' };
}
async function pgScGet(caminho) {
  for (let t = 0; t < 3; t++) {
    try {
      const r = await fetch(caminho, { credentials: 'include' });
      if (r.ok) return { json: await r.json() };
      if (r.status === 401 || r.status === 403) return { __erro: 'login' };
      if (r.status === 400) return { __erro: 'pedido', txt: (await r.text()).slice(0, 300) };
    } catch (e) { /* tenta de novo */ }
    await new Promise((ok) => setTimeout(ok, 800 * (t + 1)));
  }
  return { __erro: 'rede' };
}
function pgScPronto() { return document.readyState === 'complete' && location.host === 'skillcorner.com'; }

/* ── abas ── */
async function roda(tabId, func, args = []) {
  const [r] = await chrome.scripting.executeScript({ target: { tabId }, world: 'MAIN', func, args: args.map((x) => (x === undefined ? null : x)) });
  return r ? r.result : undefined;
}
async function aba(padrao, abrir, pronto) {
  /* 26/10 (Henrique: "o Wyscout pediu login", com o Wyscout logado e duas abas abertas): pegava a 1ª aba do site, que podia
     ser uma aba antiga com a sessão vencida. Agora tenta as abas do site da mais recente para a mais antiga e usa a primeira
     que estiver logada; se nenhuma estiver, recarrega a mais recente (a sessão do site renova) e espera. */
  const tabs = (await chrome.tabs.query({ url: padrao })).sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
  for (const t of tabs) { try { if (await roda(t.id, pronto)) return t; } catch (e) { /* carregando */ } }
  let tab = tabs[0];
  if (tab) { try { await chrome.tabs.reload(tab.id); } catch (e) {} await dorme(1500); }
  else tab = await chrome.tabs.create({ url: abrir, active: false });
  const t0 = Date.now();
  while (Date.now() - t0 < 40000) {
    try { if (await roda(tab.id, pronto)) return tab; } catch (e) { /* carregando */ }
    await dorme(1000);
  }
  return null;
}
/* a chave de acesso da página pode vencer com a aba aberta (401): recarrega a aba e tenta mais uma vez */
async function rodaWy(tab, func, args) {
  let r = await roda(tab.id, func, args);
  if (r && r.__erro === 'login') {
    try { await chrome.tabs.reload(tab.id); } catch (e) {}
    await dorme(1500);
    const t0 = Date.now(); while (Date.now() - t0 < 40000) { try { if (await roda(tab.id, pgWyLogado)) break; } catch (e) {} await dorme(1000); }
    r = await roda(tab.id, func, args);
  }
  return r;
}
const abaWy = () => aba('https://wyscout.hudl.com/*', WY, pgWyLogado);
const abaSc = () => aba('https://skillcorner.com/*', SC, pgScPronto);

/* ── pedidos ── */
const TFS = [['default', 'últimos 12 meses (último ano civil)'], ['current_season', 'época atual'], ['last_season', 'época anterior']];

function wyLinha(p) {
  const o = {};
  Object.entries(WY_EXCEL).forEach(([k, nome]) => { let v = p[k]; if (Array.isArray(v)) v = v.join(', '); if (v != null && v !== '') o[nome] = v; });
  o.Player = p.name;
  return o;
}

// Wyscout: busca pelo nome nos três períodos (uma chamada cada) e junta por jogador.
async function wyBuscar(nome) {
  const tab = await abaWy(); if (!tab) return { erro: 'Não consegui abrir o Wyscout logado. Entre no Wyscout neste Chrome e tente de novo.' };
  const por = {};
  for (const [tf, rot] of TFS) {
    const r = await rodaWy(tab, pgWyBusca, [nome, tf, WY_COLS]);
    if (r && r.__erro) return { erro: r.__erro === 'login' ? 'O Wyscout pediu login de novo. Entre no Wyscout e tente outra vez.' : 'O Wyscout não respondeu (' + r.__erro + ').' };
    (r.players || []).forEach((p) => {
      const c = por[p.id] || (por[p.id] = { id: p.id, nome: p.name, completo: p.full_name || '', clube: p.current_team_name || '', nasc: p.birth_date || '',
        idade: p.age, pos: (p.positions || []).join(', '), liga: p.domestic_competition_name || '', foto: p.image || '', escudo: p.current_team_logo || '', periodos: {} });
      c.periodos[tf] = { rotulo: rot, jogos: p.total_matches || 0, min: p.minutes_on_field || 0, clube: p.last_club_name || '', linha: wyLinha(p) };
    });
  }
  return { ok: true, candidatos: Object.values(por) };
}

// SkillCorner: jogadores pelo(s) nome(s); devolve id, nomes e nascimento.
async function scBuscar(nomes) {
  const tab = await abaSc(); if (!tab) return { erro: 'Não consegui abrir o SkillCorner. Entre no SkillCorner neste Chrome e tente de novo.' };
  const por = {};
  for (const n of nomes.filter(Boolean)) {
    const r = await roda(tab.id, pgScGet, ['/api/players/?search=' + encodeURIComponent(n)]);
    if (r && r.__erro) return { erro: r.__erro === 'login' ? 'O SkillCorner pediu login de novo. Entre no SkillCorner e tente outra vez.' : 'O SkillCorner não respondeu (' + r.__erro + ').' };
    ((r.json && r.json.results) || []).forEach((p) => { por[p.id] = { id: p.id, nome: p.short_name || '', completo: ((p.first_name || '') + ' ' + (p.last_name || '')).trim(), nasc: p.birthday || '' }; });
  }
  return { ok: true, candidatos: Object.values(por) };
}

// SkillCorner: físico do jogador — Player, por 90 min, mínimo 60 min por jogo, a partir de cada data da lista (para na 1ª que tiver jogo).
async function scFisico(id, datas) {
  const tab = await abaSc(); if (!tab) return { erro: 'Não consegui abrir o SkillCorner.' };
  const tentou = [];
  for (const de of datas) {
    const q = { player: id, results: 'win,lose,draw', venue: 'home,away', period: 'full', possession: 'all', group_by: 'player',
      average_per: 'p90', playing_time__gte: 60, response_format: 'json', date__gte: de };
    const r = await roda(tab.id, pgScGet, ['/api/physical/?' + new URLSearchParams(q).toString()]);
    if (r && r.__erro) return { erro: r.__erro === 'login' ? 'O SkillCorner pediu login de novo.' : 'O SkillCorner não respondeu (' + r.__erro + (r.txt ? ': ' + r.txt : '') + ').' };
    const x = ((r.json && r.json.results) || [])[0];
    tentou.push(de);
    if (x && x.count_match > 0) {
      const linha = {}; Object.entries(SC_CSV).forEach(([k, nome]) => { if (x[k] != null) linha[nome] = x[k]; });
      return { ok: true, de, tentou, jogos: x.count_match, linha };
    }
  }
  return { ok: true, vazio: true, tentou };
}

// SkillCorner: corridas sem bola (Game Intelligence · off-ball runs, por 30 min com a bola).
// Acha as edições em que o jogador jogou (jogos desde a 1ª data) e pega a mais recente que tiver a métrica.
async function scObr(id, desde) {
  const tab = await abaSc(); if (!tab) return { erro: 'Não consegui abrir o SkillCorner.' };
  const q = { player: id, date__gte: desde || '2025-01-01', count_match__gte: 1, response_format: 'json' };
  const r = await roda(tab.id, pgScGet, ['/api/physical/?' + new URLSearchParams(q).toString()]);
  if (r && r.__erro) return { erro: r.__erro === 'login' ? 'O SkillCorner pediu login de novo.' : 'O SkillCorner não respondeu (' + r.__erro + ').' };
  const ult = {};
  (((r.json && r.json.results) || r.json || [])).forEach((x) => { const e = x.competition_edition_id; if (e && (!ult[e] || x.match_date > ult[e].d)) ult[e] = { d: x.match_date, nome: x.competition_name + ' ' + (x.season_name || '') }; });
  const eds = Object.keys(ult).sort((a, b) => (ult[b].d > ult[a].d ? 1 : -1)).slice(0, 4);
  for (const e of eds) {
    const q2 = { competition_edition: e, result: 'win,lose,draw', venue: 'home,away', group_by: 'player', average_per: 'p30tip', player: id };
    const g = await roda(tab.id, pgScGet, ['/api/metrics/game_intelligence/in_possession/off_ball_runs/?' + new URLSearchParams(q2).toString()]);
    if (g && g.__erro) continue;
    const lst = Array.isArray(g.json) ? g.json : ((g.json && (g.json.results || g.json.data)) || []);
    const x = lst.find((y) => String(y.player_id) === String(id)) || null;
    if (x && x.offballrun_count_p30tip != null) return { ok: true, ed: +e, ed_nome: ult[e].nome.trim(), jogos: x.performance_included_count, min_tip: Math.round(x.minutes_tip || 0),
      obr: x.offballrun_count_p30tip, obr_area: x.offballrun_count_penaltyarea_p30tip, obr_hsr: x.offballrun_count_abovehsr_p30tip,
      obr_per: x.offballrun_count_dangerous_p30tip, obr_rec: x.offballrun_count_received_p30tip, obr_rem: x.offballrun_count_shotwithin10s_p30tip };
  }
  return { ok: true, vazio: true, eds: eds.map((e) => ult[e].nome) };
}

/* 25/10 — carreira do jogador no Wyscout, jogo a jogo, ano a ano (2024–2026): a MINUTAGEM (minutos dele na liga ÷ minutos
   do time na liga, como o resto do app) e a BOLA PARADA (cobranças, assistência e gols de bola parada, todas as competições
   oficiais — sem amistoso, seleção e base). match_stats/players dá os jogos em que ele entrou; team_stats/teams dá os jogos do
   time. O time dele em cada jogo = o lado que mais se repete no ano. Se trocou de clube no ano, o total do time conta só do
   primeiro ao último jogo dele por aquele clube. */
async function pgWyCarreira(id, anos) {
  const tok = window.uidirectives && window.uidirectives.access_key;
  if (!tok) return { __erro: 'login' };
  const get = async (u) => { for (let t = 0; t < 3; t++) { try { const r = await fetch(u + (u.includes('?') ? '&' : '?') + 'access_token=' + tok); if (r.ok) return await r.json(); if (r.status === 401 || r.status === 403) return { __erro: 'login' }; } catch (e) {} await new Promise((ok) => setTimeout(ok, 800 * (t + 1))); } return { __erro: 'rede' }; };
  const fora = (m) => /friendly|national/i.test(m.competitionFormat || '') || /\bU-?1\d\b|\bU-?2[0-3]\b|youth|junior|sub-?\d\d|reserve|amistos|friendl/i.test(m.competition || '');
  const BP = { c: 'corner', fc: 'free_kick_cross', fd: 'direct_free_kick', ti: 'throw_in', pe: 'penalty', abp: 'assist_from_set_piece', ge: 'goal_after_corner', gf: 'goal_after_free_kick', gl: 'goal_after_throw_in', gd: 'free_kick_goal', cs: 'corner_with_shot', fs: 'free_kick_with_shot', gp: 'penalty_goal', gh: 'head_goal', sc: 'shot_after_corner', sf: 'shot_after_free_kick', st: 'shot_after_throw_in' };
  const out = { hist: {}, bp: {} };
  for (const ano of anos) {
    const ms = await get('https://searchapi.wyscout.com/api/v1/match_stats/players/' + id + '?from=' + ano + '-01-01&to=' + ano + '-12-31');
    if (ms && ms.__erro) return ms;
    const jogos = (Array.isArray(ms) ? ms : []).filter((x) => x && x.match && !fora(x.match) && x.playerStats && x.playerStats.minutes_on_field > 0);
    if (!jogos.length) continue;
    const conta = {}; jogos.forEach((x) => { [x.match.teamAId, x.match.teamBId].forEach((t) => { conta[t] = (conta[t] || 0) + 1; }); });
    const por = {};   /* time → { nome, jogos[] } */
    jogos.forEach((x) => { const m = x.match; const meu = (conta[m.teamAId] || 0) >= (conta[m.teamBId] || 0) ? m.teamAId : m.teamBId; const nm = meu === m.teamAId ? m.teamA : m.teamB; (por[meu] || (por[meu] = { nome: nm, jogos: [] })).jogos.push(x); });
    const bp = { j: 0 }; Object.keys(BP).forEach((k) => { bp[k] = 0; });
    let min = 0, j = 0, g = 0, a = 0, tj = 0, tmin = 0, ligas = new Set(), times = [];
    const varios = Object.keys(por).length > 1;
    for (const [tid, T] of Object.entries(por)) {
      T.jogos.forEach((x) => { bp.j++; bp.g = (bp.g || 0) + (x.playerStats.goal || 0); bp.a = (bp.a || 0) + (x.playerStats.assist || 0); Object.entries(BP).forEach(([k, n]) => { bp[k] += x.playerStats[n] || 0; }); });
      const liga = T.jogos.filter((x) => x.match.competitionFormat === 'domestic_league');
      if (!liga.length) continue;
      const comps = new Set(liga.map((x) => x.match.competitionId));
      liga.forEach((x) => { min += x.playerStats.minutes_on_field || 0; j++; g += x.playerStats.goal || 0; a += x.playerStats.assist || 0; ligas.add(x.match.competition); });
      const ds = liga.map((x) => x.match.date).sort(); const de = varios ? ds[0] : ano + '-01-01', ate = varios ? ds[ds.length - 1] : ano + '-12-31';
      const ts = await get('https://searchapi.wyscout.com/api/v1/team_stats/teams/' + tid + '/stats?from=' + de + '&to=' + ate + '&columns=name,team,minutesOnField');
      const tm = ((ts && ts.matches) || []).filter((x) => x.match && comps.has(x.match.competitionId));
      tj += tm.length; tmin += tm.reduce((s, x) => s + ((x.teamStats && x.teamStats.minutesOnField) || x.match.duration || 0), 0);
      times.push(T.nome);
      await new Promise((ok) => setTimeout(ok, 400));
    }
    out.bp[ano] = bp;
    if (j) out.hist[ano] = { tm: times.join(' / '), l: [...ligas].join(' / '), j, min, tj, tmin, g, a };
    await new Promise((ok) => setTimeout(ok, 400));
  }
  return out;
}
async function wyCarreira(id, anos) {
  const tab = await abaWy(); if (!tab) return { erro: 'Não consegui abrir o Wyscout logado.' };
  const r = await rodaWy(tab, pgWyCarreira, [id, anos && anos.length ? anos : ['2024', '2025', '2026']]);
  if (r && r.__erro) return { erro: r.__erro === 'login' ? 'O Wyscout pediu login de novo.' : 'O Wyscout não respondeu (' + r.__erro + ').' };
  return Object.assign({ ok: true }, r || {});
}

/* 25/10 — foto do jogador pelo Wyscout (quando o Transfermarkt não tem: 8 mil fichas do banco vêm sem foto).
   Busca pelo nome e só aceita o mesmo nascimento; sem nascimento, só se houver um único do mesmo clube. */
async function pgWyFoto(nome, nasc, clube, idade) {
  const tok = window.uidirectives && window.uidirectives.access_key;
  if (!tok) return { __erro: 'login' };
  const p = { 'search[women_mode]': 'false', 'search[time_frame]': 'default', 'search[name]': nome, 'search[youth_stats]': 'true',
    count: 40, page: 0, sort: 'minutes_on_field desc', language: 'pt', columns: 'name,id,image,birth_date,current_team_name,full_name', token: tok, groupId: 396, subgroupId: 1752 };
  const qs = Object.entries(p).map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&');
  try {
    const r = await fetch('https://searchapi.wyscout.com/api/v1/search/results.json?' + qs); if (!r.ok) return { __erro: 'rede' };
    const ps = ((await r.json()).players || []).filter((x) => x.image && !/not-found/.test(x.image));
    const nk = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\b(fc|sc|ec|cf|cd|ac|club|clube|esporte|futebol)\b/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
    let ok = nasc ? ps.filter((x) => x.birth_date === nasc) : [];
    if (!ok.length && !nasc && clube) { const c = nk(clube); ok = ps.filter((x) => { const t = nk(x.current_team_name); return t && c && (t.includes(c) || c.includes(t)); });
      /* sem nascimento: o clube sozinho erra (João Vitor do Londrina 28a × João Vitor 2004 do mesmo clube) — confere a idade */
      ok = idade ? ok.filter((x) => x.birth_date && Math.abs((Date.now() - Date.parse(x.birth_date)) / 31557600000 - idade) <= 1.5) : []; }
    if (ok.length !== 1) return { vazio: true, n: ok.length };
    return { foto: ok[0].image, wy_id: ok[0].id };
  } catch (e) { return { __erro: 'rede' }; }
}
async function wyFoto(m) {
  const tab = await abaWy(); if (!tab) return { erro: 'Wyscout fora' };
  const r = await rodaWy(tab, pgWyFoto, [String(m.nome || ''), m.nasc || '', m.clube || '', m.idade || 0]);
  if (r && r.__erro) return { erro: r.__erro };
  return Object.assign({ ok: true }, r || {});
}

/* 08/11/2026 — comparativo de 12 meses (Henrique: "coloca como padrão esse comparativo de jogadores lá no aplicativo,
   sempre os últimos 12 meses"). match_stats do jogador desde `de`, só jogos oficiais (sem amistoso, seleção e base),
   SOMA de todos os campos (o app calcula por 90 e %), o mesmo só na liga atual (a liga do jogo de liga mais recente) e a
   minutagem por clube: minutos dele ÷ minutos dos jogos oficiais do clube no período em que esteve lá (team_stats). */
async function pgWy12m(id, de) {
  const tok = window.uidirectives && window.uidirectives.access_key;
  if (!tok) return { __erro: 'login' };
  const get = async (u) => { for (let t = 0; t < 3; t++) { try { const r = await fetch(u + (u.includes('?') ? '&' : '?') + 'access_token=' + tok); if (r.ok) return await r.json(); if (r.status === 401 || r.status === 403) return { __erro: 'login' }; } catch (e) { /* de novo */ } await new Promise((ok) => setTimeout(ok, 800 * (t + 1))); } return { __erro: 'rede' }; };
  const fora = (m) => /friendly|national/i.test(m.competitionFormat || '') || /\bU-?1\d\b|\bU-?2[0-3]\b|youth|junior|sub-?\d\d|reserve|amistos|friendl/i.test(m.competition || '');
  const hoje = new Date().toISOString().slice(0, 10);
  const ms = await get('https://searchapi.wyscout.com/api/v1/match_stats/players/' + id + '?from=' + de + '&to=' + hoje);
  if (ms && ms.__erro) return ms;
  const jogos = (Array.isArray(ms) ? ms : []).filter((x) => x && x.match && !fora(x.match) && x.playerStats && x.playerStats.minutes_on_field > 0);
  const soma = (lst) => { const s = {}; let yc = 0, rc = 0, j80 = 0;
    lst.forEach((x) => { const p = x.playerStats; Object.keys(p).forEach((k) => { const v = p[k]; if (typeof v === 'number' && isFinite(v)) s[k] = (s[k] || 0) + v; });
      if (p.yellow_cards || p.yellow_card_minute) yc++; if (p.red_card_minute || p.red_cards) rc++; if (p.minutes_on_field >= 80) j80++; });
    return { j: lst.length, min: s.minutes_on_field || 0, j80, yc, rc, s }; };
  const conta = {}; jogos.forEach((x) => { [x.match.teamAId, x.match.teamBId].forEach((t) => { conta[t] = (conta[t] || 0) + 1; }); });
  const por = {};
  jogos.forEach((x) => { const m = x.match; const meu = (conta[m.teamAId] || 0) >= (conta[m.teamBId] || 0) ? m.teamAId : m.teamBId; x._t = meu; (por[meu] || (por[meu] = { id: meu, nome: meu === m.teamAId ? m.teamA : m.teamB, jogos: [] })).jogos.push(x); });
  const ligaJ = jogos.filter((x) => x.match.competitionFormat === 'domestic_league').sort((a, b) => (a.match.date < b.match.date ? 1 : -1));
  const lig = ligaJ[0] ? { id: ligaJ[0].match.competitionId, nome: ligaJ[0].match.competition } : null;
  const clubes = Object.values(por).map((T) => { const ds = T.jogos.map((x) => x.match.date).sort(); return Object.assign(T, { pri: ds[0], ult: ds[ds.length - 1] }); }).sort((a, b) => (a.pri < b.pri ? -1 : 1));
  const out = [];
  for (let i = 0; i < clubes.length; i++) {
    const T = clubes[i];
    const ini = i === 0 ? de : T.pri, fim = i === clubes.length - 1 ? hoje : T.ult;
    const ts = await get('https://searchapi.wyscout.com/api/v1/team_stats/teams/' + T.id + '/stats?from=' + ini + '&to=' + fim + '&columns=name,team,minutesOnField');
    const tm = ((ts && ts.matches) || []).filter((x) => x.match && !fora(x.match));
    const t = soma(T.jogos);
    out.push({ nome: T.nome, de: ini, ate: fim, j: t.j, j80: t.j80, min: t.min, cj: tm.length, cmin: tm.reduce((s, x) => s + (x.match.duration || (x.teamStats && x.teamStats.minutesOnField) || 0), 0) });
    await new Promise((ok) => setTimeout(ok, 300));
  }
  return { de, ate: hoje, tudo: soma(jogos), liga: lig ? Object.assign({ nome: lig.nome }, soma(jogos.filter((x) => x.match.competitionId === lig.id))) : null, clubes: out };
}
async function wy12m(id, de) {
  const tab = await abaWy(); if (!tab) return { erro: 'Não consegui abrir o Wyscout logado.' };
  const r = await rodaWy(tab, pgWy12m, [id, de]);
  if (r && r.__erro) return { erro: r.__erro === 'login' ? 'O Wyscout pediu login de novo.' : 'O Wyscout não respondeu (' + r.__erro + ').' };
  return Object.assign({ ok: true }, r || {});
}

const PEDIDOS = {
  ping: async () => ({ ok: true, versao: VERSAO }),
  wy_buscar: (m) => wyBuscar(String(m.nome || '').trim()),
  sc_buscar: (m) => scBuscar(Array.isArray(m.nomes) ? m.nomes : [m.nome]),
  sc_obr: (m) => scObr(m.id, m.desde),
  wy_carreira: (m) => wyCarreira(m.id, m.anos),
  wy_foto: (m) => wyFoto(m),
  wy_12m: (m) => wy12m(m.id, m.de),
  sc_fisico: (m) => scFisico(m.id, Array.isArray(m.datas) && m.datas.length ? m.datas : ['2025-06-01', '2025-01-01']),
};
chrome.runtime.onMessageExternal.addListener((msg, _s, responde) => {
  const f = msg && PEDIDOS[msg.tipo];
  if (!f) { responde({ erro: 'pedido desconhecido' }); return false; }
  Promise.resolve(f(msg)).then(responde, (e) => responde({ erro: String(e && e.message || e) }));
  return true;
});
