/* ============================================================
   MOTOR DO JOGO — estado, matemática e regras
   ============================================================ */
var Game = (function () {
  'use strict';

  var S = null;
  var rngState = 123456789;

  function seed(n) { rngState = n >>> 0 || 1; }
  function rnd() {
    rngState |= 0; rngState = (rngState + 0x6D2B79F5) | 0;
    var t = Math.imul(rngState ^ (rngState >>> 15), 1 | rngState);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function rr(a, b) { return a + rnd() * (b - a); }
  function ri(a, b) { return Math.floor(rr(a, b + 1)); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function round1(v) { return Math.round(v * 10) / 10; }

  function partyOf(id) { for (var i = 0; i < PARTIES.length; i++) if (PARTIES[i].id === id) return PARTIES[i]; return PARTIES[0]; }
  function bgOf(id) { for (var i = 0; i < BACKGROUNDS.length; i++) if (BACKGROUNDS[i].id === id) return BACKGROUNDS[i]; return BACKGROUNDS[0]; }

  /* ---------------- campanha ---------------- */

  function national(camp) {
    var t = 0;
    for (var i = 0; i < GROUPS.length; i++) t += camp.groups[GROUPS[i]] * GROUP_WEIGHT[GROUPS[i]];
    return clamp(t, 0, 100);
  }

  function rivalShares(camp) {
    var nat = national(camp);
    var rest = Math.max(0, 100 - nat);
    var wsum = 0, i;
    for (i = 0; i < camp.rivals.length; i++) wsum += camp.rivals[i].w;
    var out = [];
    for (i = 0; i < camp.rivals.length; i++) {
      out.push({ id: camp.rivals[i].id, share: rest * camp.rivals[i].w / wsum });
    }
    return out;
  }

  function rankOf(camp) {
    var nat = national(camp), rs = rivalShares(camp), rank = 1;
    for (var i = 0; i < rs.length; i++) if (rs[i].share > nat) rank++;
    return rank;
  }

  function applyGroupEffects(camp, g, mul) {
    if (!g) return;
    var f = (typeof mul === 'number') ? mul : 1;
    for (var i = 0; i < GROUPS.length; i++) {
      var k = GROUPS[i];
      if (typeof g[k] === 'number') camp.groups[k] = clamp(camp.groups[k] + g[k] * f, 2, 92);
    }
  }

  function applyEventOption(camp, opt) {
    applyGroupEffects(camp, opt.g);
    if (opt.m) camp.money = round1(camp.money + opt.m);
    if (opt.money) camp.money = round1(camp.money + opt.money);
    camp.money = Math.max(0, camp.money);
  }

  var API = {};

  API.newState = function () {
    return {
      v: 1, phase: 'setup', seed: 1,
      candidate: { name: 'Candidato', partyId: 'mdb', bgId: 'gov' },
      camp: null, elec: null, gov: null, end: null, log: []
    };
  };

  API.setup = function (name, partyId, bgId) {
    var p = partyOf(partyId), b = bgOf(bgId);
    seed(Date.now() % 2147483647);
    var groups = {};
    for (var i = 0; i < GROUPS.length; i++) {
      var k = GROUPS[i];
      groups[k] = clamp(9 + (p.mods[k] || 0) * 0.6 + (b.mods[k] || 0) * 0.5 + rr(-1, 1.5), 3, 40);
    }
    var rivals = RIVALS.map(function (r) {
      return { id: r.id, w: r.base / 100 + rr(-0.02, 0.02) };
    });
    var pool = [];
    for (var d = 0; d < DEBATES.length; d++) pool.push(d);
    var evPool = [];
    for (var e = 0; e < CAMPAIGN_EVENTS.length; e++) evPool.push(e);

    S = API.newState();
    S.seed = rngState;
    S.phase = 'campaign';
    S.candidate = { name: (name || 'Candidato').substring(0, 24), partyId: partyId, bgId: bgId };
    S.camp = {
      week: 1, money: round1(p.money + b.money), pa: 2, maxPa: 2,
      groups: groups, states: {}, allies: [],
      rivals: rivals, debatePool: pool, eventPool: evPool,
      currentEvent: null, lastSurvey: null, log: [],
      debateCount: 0, runoffWeeks: 0
    };
    S.log.push('Campanha iniciada por ' + S.candidate.name + ' (' + p.sigla + ').');
    return S;
  };

  API.state = function () { return S; };
  API.set = function (st) { S = st; };
  API.national = function () { return S && S.camp ? national(S.camp) : 0; };
  API.rivalShares = function () { return S && S.camp ? rivalShares(S.camp) : []; };
  API.rank = function () { return S && S.camp ? rankOf(S.camp) : 1; };

  API.survey = function () {
    var nat = national(S.camp);
    var list = rivalShares(S.camp).map(function (r) {
      var base = null;
      for (var i = 0; i < RIVALS.length; i++) if (RIVALS[i].id === r.id) base = RIVALS[i];
      return { id: r.id, name: base.name, party: base.party, share: round1(r.share) };
    });
    list.sort(function (a, b) { return b.share - a.share; });
    var out = {
      week: S.camp.week,
      player: round1(nat),
      margin: round1(rr(1.2, 2.4)),
      rivals: list,
      rank: rankOf(S.camp)
    };
    S.camp.lastSurvey = out;
    return out;
  };

  API.doDebate = function (debateIdx, optIdx) {
    var c = S.camp;
    if (c.pa <= 0) return { ok: false, msg: 'Sem pontos de ação.' };
    var q = DEBATES[debateIdx];
    if (!q) return { ok: false, msg: 'Debate não encontrado.' };
    var opt = q.opts[optIdx];
    applyGroupEffects(c, opt.g, 0.62);
    c.pa--; c.debateCount++;
    /* remove do pool */
    var pos = c.debatePool.indexOf(debateIdx);
    if (pos >= 0) c.debatePool.splice(pos, 1);
    c.log.push({ t: 'Debate', d: opt.l });
    return { ok: true, msg: 'Resposta registrada.', effects: opt.g };
  };

  API.nextDebate = function () {
    var c = S.camp;
    if (c.debatePool.length === 0) {
      c.debatePool = [];
      for (var i = 0; i < DEBATES.length; i++) c.debatePool.push(i);
    }
    return c.debatePool[0];
  };

  API.doComicio = function (uf) {
    var c = S.camp;
    if (c.pa <= 0) return { ok: false, msg: 'Sem pontos de ação.' };
    var st = null;
    for (var i = 0; i < STATES.length; i++) if (STATES[i].uf === uf) st = STATES[i];
    if (!st) return { ok: false, msg: 'Estado inválido.' };
    var cost = 0.45;
    if (c.money < cost) return { ok: false, msg: 'Caixa insuficiente para o comício.' };
    c.money = round1(c.money - cost);
    var power = 0.55 + st.votes / 240 + rr(-0.1, 0.25);
    var boost = { tr: 2.4, em: 2.0, jo: 2.2, ev: 2.6 };
    if (st.reg === 0) boost = { tr: 4.2, em: 1.2, jo: 2.0, ev: 2.2 };
    if (st.reg === 2) boost = { tr: 1.8, em: 4.2, jo: 1.6, ev: 3.2 };
    for (var k in boost) boost[k] = round1(boost[k] * power);
    applyGroupEffects(c, boost, 0.62);
    c.states[uf] = round1((c.states[uf] || 0) + rr(2.5, 5.5));
    c.pa--;
    c.log.push({ t: 'Comício em ' + uf, d: 'Multidão e discurso regional.' });
    return { ok: true, msg: 'Comício em ' + uf + ' realizado.', effects: boost };
  };

  API.doMarketing = function (tier) {
    var c = S.camp;
    if (c.pa <= 0) return { ok: false, msg: 'Sem pontos de ação.' };
    var tiers = [
      { name: 'Redes sociais', cost: 0.8, gain: 2.2 },
      { name: 'TV regional', cost: 2.0, gain: 4.0 },
      { name: 'Campanha nacional', cost: 4.2, gain: 6.6 }
    ];
    var t = tiers[tier];
    if (!t) return { ok: false, msg: 'Opção inválida.' };
    if (c.money < t.cost) return { ok: false, msg: 'Caixa insuficiente.' };
    c.money = round1(c.money - t.cost);
    var g = { tr: t.gain, em: t.gain * 0.9, jo: t.gain * 1.15, ev: t.gain * 0.95 };
    if (tier === 0) g = { tr: 1.2, em: 1.0, jo: 4.4, ev: 1.2 };
    applyGroupEffects(c, g, 0.62);
    c.pa--;
    c.log.push({ t: 'Marketing: ' + t.name, d: 'R$ ' + t.cost.toFixed(1) + ' mi investidos.' });
    return { ok: true, msg: t.name + ' no ar.', effects: g };
  };

  API.doAlly = function (partyId) {
    var c = S.camp;
    if (c.pa <= 0) return { ok: false, msg: 'Sem pontos de ação.' };
    if (c.allies.indexOf(partyId) >= 0) return { ok: false, msg: 'Aliança já firmada.' };
    var p = partyOf(partyId);
    if (!p) return { ok: false, msg: 'Partido inválido.' };
    if (c.money < 1.4) return { ok: false, msg: 'Caixa insuficiente para o acordo.' };
    c.money = round1(c.money - 1.4);
    c.allies.push(partyId);
    var g = {
      tr: (p.mods.tr || 0) * 0.35, em: (p.mods.em || 0) * 0.35,
      jo: (p.mods.jo || 0) * 0.35, ev: (p.mods.ev || 0) * 0.35
    };
    applyGroupEffects(c, g, 0.7);
    c.pa--;
    c.log.push({ t: 'Aliança com ' + p.sigla, d: 'Tempo de TV e palanque ampliados.' });
    return { ok: true, msg: 'Aliança com ' + p.sigla + ' firmada.', effects: g };
  };

  API.maybeEvent = function () {
    var c = S.camp;
    if (c.currentEvent) return c.currentEvent;
    if (c.eventPool.length === 0) return null;
    if (rnd() > 0.62) return null;
    var i = ri(0, c.eventPool.length - 1);
    var idx = c.eventPool.splice(i, 1)[0];
    c.currentEvent = { idx: idx, ev: CAMPAIGN_EVENTS[idx] };
    return c.currentEvent;
  };

  API.resolveEvent = function (optIdx) {
    var c = S.camp;
    if (!c.currentEvent) return { ok: false, msg: 'Nenhum evento ativo.' };
    var ev = c.currentEvent.ev;
    var opt = ev.opts[optIdx];
    if (!opt) return { ok: false, msg: 'Opção inválida.' };
    applyEventOption(c, opt);
    c.currentEvent = null;
    c.log.push({ t: ev.t, d: opt.r });
    return { ok: true, msg: opt.r, effects: opt.g };
  };

  API.endWeek = function () {
    var c = S.camp;
    c.pa = c.maxPa;
    /* decadência natural da intenção */
    for (var i = 0; i < GROUPS.length; i++) {
      c.groups[GROUPS[i]] = clamp(c.groups[GROUPS[i]] - rr(0.5, 1.1), 2, 92);
    }
    /* rivais disputam entre si */
    var shift = rr(-0.03, 0.035);
    for (var j = 0; j < c.rivals.length; j++) {
      c.rivals[j].w = clamp(c.rivals[j].w + rr(-0.02, 0.02) + shift, 0.05, 0.6);
    }
    c.week++;
    /* efeito onda: quem lidera com folga cresce com o voto útil */
    var natW = national(c), rsW = rivalShares(c);
    var best = 0;
    for (var q = 0; q < rsW.length; q++) if (rsW[q].share > best) best = rsW[q].share;
    if (natW > best + 8) applyGroupEffects(c, { tr: 1.2, em: 1.0, jo: 1.1, ev: 1.0 });
    var s = API.survey();
    if (c.week > 6) return { finished: true, survey: s };
    return { finished: false, survey: s };
  };

  API.election = function () {
    var c = S.camp;
    var nat = round1(national(c));
    var list = rivalShares(c);
    list.sort(function (a, b) { return b.share - a.share; });
    var res = {
      player: nat,
      rivals: list.map(function (r) {
        var base = null;
        for (var i = 0; i < RIVALS.length; i++) if (RIVALS[i].id === r.id) base = RIVALS[i];
        return { id: r.id, name: base.name, party: base.party, share: round1(r.share) };
      })
    };
    res.rank = 1;
    for (var k = 0; k < res.rivals.length; k++) if (res.rivals[k].share > res.player) res.rank++;
    if (res.rank === 1 && res.player >= 50) {
      res.outcome = 'win_first';
    } else if (res.rank <= 2) {
      res.outcome = 'runoff';
      res.opponent = res.rivals[0].id === undefined ? null : null;
      /* oponente = rival mais votado */
      res.opponent = res.rivals[0];
    } else {
      res.outcome = 'lost';
    }
    S.elec = res;
    if (res.outcome === 'runoff') {
      S.phase = 'runoff';
      S.camp.runoff = { round: 1, weeks: 2, oppShare: res.opponent.share, allyBonus: 0 };
    }
    return res;
  };

  /* 2º turno: 2 escolhas estratégicas */
  API.RUNOFF_OPTS = [
    { l: 'Atacar o adversário sem trégua', g: { tr: 3, em: -5, jo: 5, ev: -2 }, d: 'Ataque direto mobiliza a militância, repele o centro.' },
    { l: 'Debate técnico sobre economia e propostas', g: { tr: 1, em: 6, jo: 1, ev: 2 }, d: 'Conquistou o eleitor informado e o mercado.' },
    { l: 'Frente ampla: abraçar todos os partidos derrotados', g: { tr: 4, em: 3, jo: 2, ev: 4 }, d: 'Alianças somam tempo de TV e palanques.' },
    { l: 'Caravana nas periferias e no interior', g: { tr: 6, em: -1, jo: 3, ev: 3 }, d: 'O corpo a corpo virou onda nas periferias.' }
  ];

  API.runoffChoice = function (i) {
    var c = S.camp;
    var o = API.RUNOFF_OPTS[i];
    if (!o) return { ok: false };
    applyGroupEffects(c, o.g);
    c.runoff.weeks--;
    c.log.push({ t: '2º turno', d: o.l });
    if (c.runoff.weeks <= 0) {
      var nat = national(c);
      var total = nat + c.runoff.oppShare;
      var share = nat / total * 100;
      var win = share >= 50;
      S.elec.runoffResult = { share: round1(share), opp: round1(100 - share), win: win };
      return { ok: true, done: true, win: win, share: round1(share) };
    }
    return { ok: true, done: false, weeksLeft: c.runoff.weeks };
  };

  /* ---------------- governo ---------------- */

  API.startGov = function (won) {
    var nat = S.elec ? S.elec.player : 40;
    var effMin = {};
    for (var i = 0; i < MINISTRIES.length; i++) {
      var m = MINISTRIES[i];
      effMin[m.id] = { b: m.def, e: m.eff };
    }
    S.phase = 'gov';
    S.gov = {
      q: 1, maxQ: 16,
      pop: clamp(44 + nat * 0.22 + rr(-2, 3), 35, 72),
      infl: round1(rr(4.1, 5.2)),
      unemp: round1(rr(7.2, 8.6)),
      debt: round1(rr(76, 80)),
      cash: 180,
      cap: 55,
      min: effMin,
      scandal: 0,
      lowPop: 0,
      pending: [],
      events: (function () {
        var a = [];
        for (var j = 0; j < GOV_EVENTS.length; j++) a.push(j);
        return a;
      })(),
      current: null,
      vote: null,
      log: [],
      bills: 0, approved: 0,
      budgetDone: false
    };
    return S.gov;
  };

  API.govTick = function () {
    var g = S.gov, i;
    /* eficiência dos ministérios */
    for (i = 0; i < MINISTRIES.length; i++) {
      var k = MINISTRIES[i].id;
      g.min[k].e = clamp(g.min[k].e + (g.min[k].b - 20) * 0.34 - 0.55 + rr(-0.4, 0.4), 15, 96);
    }
    var eff = function (k) { return g.min[k].e; };
    var socialScore = (eff('saude') + eff('educ') + eff('seg') + eff('meio')) / 4;

    var growth = 1 + (eff('infra') - 50) / 130 + (eff('educ') - 50) / 240 - Math.max(0, g.infl - 5) * 0.05;

    var unempTarget = clamp(13.6 - 7 * growth, 3.4, 17.5);
    g.unemp = clamp(g.unemp + (unempTarget - g.unemp) * 0.34 + rr(-0.1, 0.1), 3.2, 20);

    var inflDrift = (growth - 1) * 1.1 - (g.unemp - 8) * 0.11 + (g.debt - 80) * 0.006;
    g.infl = clamp(g.infl + inflDrift + (4.5 - g.infl) * 0.12 + rr(-0.15, 0.15), 0.5, 22);

    g.debt = clamp(g.debt + 0.42 + (g.unemp - 8) * 0.02 - (g.infl - 4) * 0.10 + (1 - growth) * 0.15 + (g.cash < 0 ? 1.6 : 0), 30, 160);

    g.cash += 5 + (growth - 1) * 16;

    var econPain = Math.max(0, g.infl - 5.5) * 1.9
      + Math.max(0, g.unemp - 9) * 1.5
      + Math.max(0, g.debt - 88) * 0.42
      + Math.max(0, 50 - socialScore) * 0.05;

    g.pop = clamp(g.pop + 1.0 + 0.10 * (socialScore - 55) + 1.6 * (growth - 1) - econPain * 0.50 + (50 - g.pop) * 0.05 + rr(-0.7, 0.7), 0, 100);

    g.cap = clamp(g.cap + 6 + (g.pop > 60 ? 3 : 0) + (g.pop < 30 ? -3 : 0), 0, 100);
    g.cash = Math.round(g.cash);

    /* efeitos atrasados */
    for (i = g.pending.length - 1; i >= 0; i--) {
      if (g.pending[i].q <= g.q) {
        applyEffects(g.pending[i].e);
        g.pending.splice(i, 1);
      }
    }

    if (g.pop < 15) g.lowPop++; else g.lowPop = 0;
  };

  function applyEffects(g, e) {
    if (!e) return;
    if (e.pop) {
      var dp = e.pop;
      if (dp > 0 && g.pop > 60) dp *= 0.55;
      if (dp > 0 && g.pop > 75) dp *= 0.4;
      g.pop = clamp(g.pop + dp, 0, 100);
    }
    if (e.infl) g.infl = clamp(g.infl + e.infl, 0.2, 25);
    if (e.unemp) g.unemp = clamp(g.unemp + e.unemp, 2.5, 22);
    if (e.debt) g.debt = clamp(g.debt + e.debt, 25, 170);
    if (e.cash) g.cash += e.cash;
    if (e.cap) g.cap = clamp(g.cap + e.cap, 0, 100);
  }

  API.currentDecision = function () {
    var g = S.gov;
    if (g.current) return g.current;
    if (g.events.length === 0) {
      for (var j = 0; j < GOV_EVENTS.length; j++) g.events.push(j);
    }
    var i = ri(0, g.events.length - 1);
    var idx = g.events.splice(i, 1)[0];
    g.current = { idx: idx, ev: GOV_EVENTS[idx] };
    return g.current;
  };

  API.budgetTotal = function () {
    var g = S.gov, t = 0;
    for (var i = 0; i < MINISTRIES.length; i++) t += g.min[MINISTRIES[i].id].b;
    return t;
  };

  API.adjustBudget = function (id, delta) {
    var g = S.gov;
    if (!g.min[id]) return false;
    var cur = g.min[id].b;
    var nv = clamp(cur + delta, 4, 60);
    var total = API.budgetTotal();
    if (total - cur + nv > 100) return false;
    g.min[id].b = nv;
    return true;
  };

  API.voteBill = function (type, capSpent) {
    var g = S.gov;
    var p = partyOf(S.candidate.partyId);
    var rule = BILL_RULES[type];
    if (!rule || rule.need === 0) return { need: 0, seats: 513, passed: true, blocks: [] };
    var cap = Math.min(capSpent || 0, g.cap);
    var hard = type === 'pec' ? 0.12 : (type === 'mp' ? 0.14 : 0.04);
    var blocks = [], total = 0;
    for (var i = 0; i < BLOCS.length; i++) {
      var b = BLOCS[i];
      var ide = 1 - Math.abs(b.ide - p.ide) / 4;
      var prob = 0.40 + 0.17 * b.rel + 0.24 * ide - hard
        + 0.38 * (cap / 100) * b.greedy
        + 0.18 * (g.pop - 50) / 50
        + rr(-0.05, 0.05);
      prob = clamp(prob, 0.04, 0.95);
      var yes = Math.round(b.seats * prob);
      blocks.push({ id: b.id, name: b.name, seats: b.seats, yes: yes, prob: round1(prob * 100) });
      total += yes;
    }
    g.cap = clamp(g.cap - cap, 0, 100);
    var passed = total >= rule.need;
    g.bills++;
    if (passed) g.approved++;
    return { need: rule.need, seats: total, passed: passed, blocks: blocks, capSpent: cap };
  };

  API.decide = function (optIdx, capSpent) {
    var g = S.gov;
    if (!g.current) return { ok: false };
    var ev = g.current.ev;
    var opt = ev.opts[optIdx];
    if (!opt) return { ok: false };
    var type = opt.type || 'dec';
    var vote = API.voteBill(type, capSpent || 0);
    var result = { ok: true, type: type, vote: vote, opt: opt, applied: false, reversed: false };

    if (!vote.passed) {
      /* decreto nunca precisa de votação */
      applyEffects(g, { pop: -3.5 });
      result.applied = false;
      result.msg = 'A proposta foi derrotada no Congresso (' + vote.seats + '/' + vote.need + '). Desgaste político.';
      if (type === 'dec') { applyEffects(g, opt.e); result.applied = true; result.msg = 'Decreto publicado.'; }
    } else {
      applyEffects(g, opt.e);
      result.applied = true;
      if (type === 'dec') applyEffects(g, { pop: -1.5 });
      result.msg = opt.r;
      if (opt.scandal) { g.scandal++; }
      if (opt.late) g.pending.push({ q: g.q + opt.late.q, e: opt.late.e });
    }
    /* só eventos e opções com scandal contam */
    g.log.push({ q: g.q, t: ev.t, d: opt.l, ok: vote.passed });
    g.current = null;
    return result;
  };

  API.nextQuarter = function () {
    var g = S.gov;
    API.govTick();
    g.budgetDone = false;
    g.q++;
    /* impeachment por popularidade */
    if (g.lowPop >= 3) return { impeachment: true, reason: 'popularidade' };
    if (g.scandal >= 2 && g.pop < 35) return { impeachment: true, reason: 'escandalo' };
    if (g.q > g.maxQ) return { ended: true };
    return {};
  };

  API.impeachmentVote = function () {
    var g = S.gov;
    var total = 0;
    for (var i = 0; i < BLOCS.length; i++) {
      var b = BLOCS[i];
      var prob = clamp(0.35 + 0.30 * (1 - g.pop / 100) + 0.12 * (g.scandal >= 2 ? 1 : 0) - 0.20 * (g.cap / 100) + rr(-0.06, 0.06), 0.05, 0.97);
      total += Math.round(b.seats * prob);
    }
    return { seats: total, need: 342, approved: total >= 342 };
  };

  API.score = function (outcome) {
    var g = S.gov;
    var effAvg = (g.min.saude.e + g.min.educ.e + g.min.infra.e + g.min.seg.e + g.min.meio.e) / 5;
    var econ = clamp(10 - Math.max(0, g.infl - 4) * 0.9 - Math.max(0, g.unemp - 8) * 0.7 - Math.max(0, g.debt - 80) * 0.09, 0, 10);
    var social = clamp(g.pop / 10 * 0.6 + effAvg / 10 * 0.4, 0, 10);
    var inst = clamp(10 - g.scandal * 2.2 - (outcome === 'impeachment' ? 4 : 0), 0, 10);
    var nota = round1(econ * 0.4 + social * 0.4 + inst * 0.2);
    return { econ: round1(econ), social: round1(social), inst: round1(inst), nota: nota };
  };

  /* ---------------- persistência ---------------- */
  API.save = function () {
    try {
      if (!S) return false;
      localStorage.setItem('spb_save', JSON.stringify(S));
      return true;
    } catch (e) { return false; }
  };
  API.load = function () {
    try {
      var raw = localStorage.getItem('spb_save');
      if (!raw) return false;
      var st = JSON.parse(raw);
      if (!st || !st.v) return false;
      S = st;
      return true;
    } catch (e) { return false; }
  };
  API.wipe = function () {
    try { localStorage.removeItem('spb_save'); } catch (e) {}
    S = null;
  };

  return API;
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Game; }
