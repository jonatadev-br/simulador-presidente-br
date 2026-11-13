/* ============================================================
   INTERFACE — telas, navegação e interação
   ============================================================ */
var UI = (function () {
  'use strict';

  var app, cur = 'menu', tmp = {}, hist = [];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(v) { return 'R$ ' + Number(v).toFixed(1).replace('.', ',') + ' mi'; }
  function pct(v) { return Number(v).toFixed(1).replace('.', ',') + '%'; }
  function n1(v) { return Number(v).toFixed(1).replace('.', ','); }
  function signClass(v, goodWhenLow) {
    if (Math.abs(v) < 0.05) return '';
    var good = goodWhenLow ? v < 0 : v > 0;
    return good ? 'g' : 'r';
  }
  function delta(v) {
    if (!v || Math.abs(v) < 0.05) return '';
    return '<span class="delta ' + (v > 0 ? 'up' : 'down') + '">' + (v > 0 ? '+' : '') + n1(v) + '</span>';
  }
  function vibe(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }

  function paint(html) {
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }
  function toast(msg) {
    var d = document.createElement('div');
    d.className = 'toast';
    d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 2200);
  }
  function bar(pctv, cls) {
    return '<div class="bar ' + (cls || '') + '"><i style="width:' + Math.max(0, Math.min(100, pctv)) + '%"></i></div>';
  }
  function topbar(title, backTo, right) {
    return '<div class="topbar">'
      + (backTo ? '<button class="ico-btn" data-act="back" data-to="' + backTo + '">‹</button>' : '<div style="width:42px"></div>')
      + '<div class="grow"><div class="overline">' + esc(title) + '</div></div>'
      + (right || '')
      + '</div>';
  }

  /* ---------------------- MENU ---------------------- */
  function menu() {
    cur = 'menu';
    var hasSave = false;
    try { hasSave = !!localStorage.getItem('spb_save'); } catch (e) {}
    paint(
      '<div class="flagline"></div>'
      + '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center;padding:12px 0">'
      + '<div style="font-size:54px;line-height:1">🏛️</div>'
      + '<div class="h1" style="margin-top:10px">Simulador<br>Presidente do Brasil</div>'
      + '<div class="muted small" style="margin-top:10px;max-width:300px;margin-left:auto;margin-right:auto">'
      + 'Vença a eleição. Assuma o Planalto. Sobreviva a 16 trimestres de crise.</div>'
      + '</div>'
      + '<div class="stack">'
      + '<button class="btn" data-act="novo">Nova campanha</button>'
      + (hasSave ? '<button class="btn ghost" data-act="continuar">Continuar jogo salvo</button>' : '')
      + '<div class="btn-row">'
      + '<button class="btn dark" data-act="ajuda">Como jogar</button>'
      + '<button class="btn dark" data-act="som">Som: ' + (Snd.enabled() ? 'ligado' : 'mudo') + '</button>'
      + '</div>'
      + '</div>'
      + '<div class="tiny muted center" style="margin-top:16px">Conteúdo de ficção. Partidos, adversários e fatos são inventados.</div>'
    );
  }

  function ajuda() {
    paint(
      topbar('Como jogar', 'menu')
      + '<div class="card"><div class="overline">Fase 1 · Campanha</div>'
      + '<div class="small" style="margin-top:8px">Você tem <b>6 semanas</b> e <b>2 pontos de ação</b> por semana. '
      + 'Debates, comícios, marketing e alianças mexem na intenção de voto de quatro grupos: trabalhadores, empresários, jovens e evangélicos. '
      + 'Cada semana sai uma pesquisa. Para se eleger no 1º turno precisa de <b>50%</b>; ficando entre os dois primeiros, vai ao <b>2º turno</b>.</div></div>'
      + '<div class="card"><div class="overline">Fase 2 · Governo</div>'
      + '<div class="small" style="margin-top:8px">São <b>16 trimestres</b>. A cada trimestre você define o orçamento dos 5 ministérios e resolve um problema. '
      + 'Ações podem ser <b>Decreto</b> (imediato), <b>MP</b> (vale na hora, Congresso ratifica), <b>PL</b> (257 votos) ou <b>PEC</b> (308 votos). '
      + 'Gaste <b>capital político</b> para comprar apoio — o Centrão cobra caro.</div></div>'
      + '<div class="card"><div class="overline">Fim de jogo</div>'
      + '<div class="small" style="margin-top:8px">Impeachment se a popularidade ficar abaixo de <b>15%</b> por 3 trimestres ou houver escândalo grave sem resposta. '
      + 'Com <b>55%</b> de popularidade no fim, você disputa a reeleição. No fim, recebe uma nota de 0 a 10.</div></div>'
      + '<button class="btn" data-act="back" data-to="menu">Entendi</button>'
    );
  }

  /* ---------------------- SETUP ---------------------- */
  function setup() {
    cur = 'setup';
    tmp = tmp.name ? tmp : { name: '', partyId: null, bgId: null };
    var partyHtml = PARTIES.map(function (p) {
      return '<button class="opt' + (tmp.partyId === p.id ? ' sel' : '') + '" data-act="pickParty" data-v="' + p.id + '">'
        + '<div class="grow"><div class="h3">' + esc(p.name) + '</div>'
        + '<div class="small muted" style="margin-top:3px">' + esc(p.desc) + '</div></div>'
        + '<span class="tag" style="color:' + p.color + '">' + esc(p.label) + '</span></button>';
    }).join('');
    var bgHtml = BACKGROUNDS.map(function (b) {
      return '<button class="opt' + (tmp.bgId === b.id ? ' sel' : '') + '" data-act="pickBg" data-v="' + b.id + '">'
        + '<div class="grow"><div class="h3">' + esc(b.name) + '</div>'
        + '<div class="small muted" style="margin-top:3px">' + esc(b.desc) + '</div>'
        + '<div class="tiny" style="margin-top:5px;color:var(--gold)">Caixa ' + money(b.money) + ' · Apoio inicial +' + b.sup + '</div></div></button>';
    }).join('');

    paint(
      topbar('Criar candidato', 'menu')
      + '<div class="card"><div class="overline">Seu nome</div>'
      + '<input id="iname" type="text" maxlength="22" placeholder="Ex.: Ana Ribeiro" value="' + esc(tmp.name) + '">'
      + '<div class="tiny muted" style="margin-top:8px">É o nome que vai aparecer nas pesquisas e nos noticiários.</div></div>'
      + '<div class="overline" style="margin:4px 0 8px">Partido</div>' + partyHtml
      + '<div class="overline" style="margin:14px 0 8px">Origem política</div>' + bgHtml
      + '<div class="spacer"></div>'
      + '<button class="btn" data-act="startGame">Iniciar campanha</button>'
      + '<div class="tiny muted center" style="margin-top:10px">Tudo é fictício — nenhum partido ou pessoa real.</div>'
    );
    var inp = document.getElementById('iname');
    inp.addEventListener('input', function () { tmp.name = inp.value; });
  }

  /* ---------------------- CAMPANHA ---------------------- */
  function hq() {
    cur = 'hq';
    var S = Game.state(), c = S.camp;
    var nat = Game.national(), rank = Game.rank();
    var p = null;
    for (var i = 0; i < PARTIES.length; i++) if (PARTIES[i].id === S.candidate.partyId) p = PARTIES[i];
    var dots = '';
    for (var d = 0; d < c.maxPa; d++) dots += '<span class="chip ' + (d < c.pa ? 'gold' : '') + '" style="padding:3px 9px">' + (d < c.pa ? '●' : '○') + '</span>';
    var groups = GROUPS.map(function (k) {
      return '<div style="margin-bottom:9px">'
        + '<div class="row between" style="margin-bottom:4px"><span class="small">' + GROUP_NAME[k] + '</span>'
        + '<span class="small num">' + n1(c.groups[k]) + '%</span></div>'
        + bar(c.groups[k], c.groups[k] > 50 ? '' : 'gold') + '</div>';
    }).join('');
    var survey = c.lastSurvey ? c.lastSurvey : { rivals: [], rank: rank, player: nat, margin: 2 };
    var rivalsHtml = survey.rivals.slice(0, 3).map(function (r) {
      return '<div class="row between small" style="padding:5px 0"><span class="muted">' + esc(r.name) + ' · ' + esc(r.party) + '</span><span class="num">' + n1(r.share) + '%</span></div>';
    }).join('') || '<div class="small muted">Primeira pesquisa sai ao fim da semana 1.</div>';

    var canAct = c.pa > 0;
    paint(
      '<div class="flagline"></div>'
      + '<div class="row between" style="margin-bottom:12px">'
      + '<div><div class="overline">Semana ' + c.week + ' de 6</div><div class="h2" style="margin-top:2px">' + esc(S.candidate.name) + '</div>'
      + '<div class="tiny muted">' + esc(p.name) + ' · ' + esc(p.label) + '</div></div>'
      + '<button class="ico-btn" data-act="menu2">☰</button></div>'

      + '<div class="card">'
      + '<div class="row between"><div class="overline">Intenção de voto</div>'
      + '<span class="chip ' + (rank <= 2 ? 'green' : 'red') + '">' + rank + 'º lugar</span></div>'
      + '<div class="row" style="align-items:flex-end;margin-top:6px"><div class="big-pop num">' + n1(nat) + '%</div>'
      + '<div class="grow" style="padding-bottom:8px"><div class="bar"><i style="width:' + nat + '%"></i></div></div></div>'
      + '<div class="grid2" style="margin-top:10px">'
      + '<div class="stat"><div class="k">Caixa</div><div class="v y">' + money(c.money) + '</div></div>'
      + '<div class="stat"><div class="k">Pontos de ação</div><div class="v">' + dots + '</div></div>'
      + '</div></div>'

      + '<div class="card"><div class="overline" style="margin-bottom:10px">Eleitorado por grupo</div>' + groups + '</div>'

      + '<div class="grid2" style="margin-bottom:12px">'
      + '<button class="tile ' + (canAct ? '' : 'off') + '" data-act="goDebate"><span class="ico">🎤</span><span class="tt">Debate</span><span class="sub">1 PA · mexe nos grupos</span></button>'
      + '<button class="tile ' + (canAct ? '' : 'off') + '" data-act="goComicio"><span class="ico">📣</span><span class="tt">Comício</span><span class="sub">1 PA · R$ 0,4 mi</span></button>'
      + '<button class="tile ' + (canAct ? '' : 'off') + '" data-act="goMarketing"><span class="ico">📺</span><span class="tt">Marketing</span><span class="sub">1 PA · R$ 0,8 a 4,2 mi</span></button>'
      + '<button class="tile ' + (canAct ? '' : 'off') + '" data-act="goAlly"><span class="ico">🤝</span><span class="tt">Aliança</span><span class="sub">1 PA · R$ 1,4 mi</span></button>'
      + '</div>'

      + '<div class="card"><div class="overline">Pesquisa da semana</div>'
      + '<div class="row between small" style="margin-top:6px"><span style="color:var(--gold);font-weight:700">Você</span><span class="num">' + n1(survey.player) + '%</span></div>'
      + rivalsHtml
      + '<div class="tiny muted" style="margin-top:6px">Margem de erro ±' + n1(survey.margin || 2) + ' pontos</div></div>'

      + (c.log.length ? '<div class="card"><div class="overline" style="margin-bottom:6px">Últimos lances</div><div class="scrollbox">'
        + c.log.slice(-6).reverse().map(function (l) { return '<div class="log"><b>' + esc(l.t) + '</b> — ' + esc(l.d) + '</div>'; }).join('')
        + '</div></div>' : '')

      + '<div class="spacer"></div>'
      + '<button class="btn ' + (c.pa > 0 ? 'green' : '') + '" data-act="endWeek">' + (c.pa > 0 ? 'Encerrar semana' : 'Encerrar semana (0 PA)') + '</button>'
    );
  }

  function debate() {
    var S = Game.state();
    var idx = Game.nextDebate();
    var q = DEBATES[idx];
    tmp.debateIdx = idx;
    var opts = q.opts.map(function (o, i) {
      return '<button class="opt" data-act="answer" data-v="' + i + '"><div class="grow">' + esc(o.l) + '</div></button>';
    }).join('');
    paint(
      topbar('Debate ao vivo', 'hq', '<span class="chip gold">1 PA</span>')
      + '<div class="card"><div class="overline">Pergunta do mediador</div>'
      + '<div class="h2" style="margin-top:8px;line-height:1.35">' + esc(q.q) + '</div></div>'
      + '<div class="overline" style="margin:4px 0 10px">Sua resposta</div>' + opts
    );
    Snd.startMusic();
  }

  function comicio() {
    var S = Game.state();
    var rows = STATES.slice().sort(function (a, b) { return b.votes - a.votes; }).map(function (s) {
      var bon = S.camp.states[s.uf] || 0;
      return '<button class="opt" data-act="doComicio" data-v="' + s.uf + '">'
        + '<div class="grow"><div class="h3">' + s.uf + '</div>'
        + '<div class="tiny muted">' + s.votes + ' votos no colégio · ' + (s.reg === 0 ? 'Norte/Nordeste' : s.reg === 2 ? 'Sul/Centro-Oeste' : 'Sudeste') + '</div></div>'
        + '<span class="tag">' + (bon > 0 ? '+' + n1(bon) : 'novo') + '</span></button>';
    }).join('');
    paint(
      topbar('Onde fazer comício', 'hq', '<span class="chip gold">1 PA</span>')
      + '<div class="card flat"><div class="small muted">O comício rende mais no estado escolhido, com efeito diferente por região. Custo: R$ 0,45 mi.</div></div>'
      + rows
    );
  }

  function marketing() {
    var S = Game.state();
    var tiers = [
      { n: 'Redes sociais', c: 0.8, d: 'Muito forte entre jovens, pouco alcance nacional.' },
      { n: 'TV regional', c: 2.0, d: 'Alcance equilibrado em todos os grupos.' },
      { n: 'Campanha nacional', c: 4.2, d: 'Maior ganho geral. Queima caixa rápido.' }
    ];
    paint(
      topbar('Marketing', 'hq', '<span class="chip gold">1 PA</span>')
      + '<div class="card flat"><div class="small muted">Caixa disponível: <b>' + money(S.camp.money) + '</b></div></div>'
      + tiers.map(function (t, i) {
        var off = S.camp.money < t.c;
        return '<button class="opt' + (off ? '' : '') + '" data-act="doMarketing" data-v="' + i + '" ' + (off ? 'disabled style="opacity:.45"' : '') + '>'
          + '<div class="grow"><div class="h3">' + t.n + '</div><div class="tiny muted">' + t.d + '</div></div>'
          + '<span class="tag">' + money(t.c) + '</span></button>';
      }).join('')
    );
  }

  function ally() {
    var S = Game.state();
    var rows = PARTIES.filter(function (p) {
      return p.id !== S.candidate.partyId && S.camp.allies.indexOf(p.id) < 0;
    }).map(function (p) {
      return '<button class="opt" data-act="doAlly" data-v="' + p.id + '">'
        + '<div class="grow"><div class="h3">' + esc(p.sigla) + ' · ' + esc(p.name) + '</div>'
        + '<div class="tiny muted">' + esc(p.desc) + '</div></div>'
        + '<span class="tag" style="color:' + p.color + '">' + esc(p.label) + '</span></button>';
    }).join('');
    paint(
      topbar('Alianças', 'hq', '<span class="chip gold">1 PA</span>')
      + '<div class="card flat"><div class="small muted">Cada aliança custa R$ 1,4 mi e 1 PA, e desloca o apoio entre os grupos. Alianças firmadas: <b>'
      + (S.camp.allies.length ? S.camp.allies.join(', ').toUpperCase() : 'nenhuma') + '</b></div></div>'
      + (rows || '<div class="card center muted">Todos os partidos já estão com você.</div>')
    );
  }

  function campEvent() {
    var S = Game.state(), ev = S.camp.currentEvent;
    if (!ev) { hq(); return; }
    cur = 'event';
    var opts = ev.ev.opts.map(function (o, i) {
      return '<button class="opt" data-act="resolveEvent" data-v="' + i + '"><div class="grow">' + esc(o.l) + '</div></button>';
    }).join('');
    paint(
      '<div class="flagline"></div>'
      + '<div class="card" style="border-color:rgba(245,185,35,.4)">'
      + '<div class="overline" style="color:var(--gold)">Fato novo na campanha</div>'
      + '<div class="h2" style="margin-top:6px">' + esc(ev.ev.t) + '</div>'
      + '<div class="small muted" style="margin-top:8px">' + esc(ev.ev.d) + '</div></div>'
      + '<div class="overline" style="margin:2px 0 10px">O que você faz?</div>' + opts
    );
    Snd.alert();
  }

  function surveyScreen(res, finished) {
    cur = 'survey';
    var s = res.survey;
    var list = s.rivals.map(function (r) {
      return '<div class="row between small" style="padding:6px 0;border-bottom:1px solid var(--line)">'
        + '<span class="muted">' + esc(r.name) + ' · ' + esc(r.party) + '</span><span class="num">' + n1(r.share) + '%</span></div>';
    }).join('');
    paint(
      '<div class="flagline"></div>'
      + '<div class="card"><div class="overline">Pesquisa · semana ' + s.week + '</div>'
      + '<div class="row" style="margin-top:8px;align-items:flex-end"><div class="big-pop num">' + n1(s.player) + '%</div>'
      + '<div class="grow" style="padding-bottom:8px"><div class="bar"><i style="width:' + s.player + '%"></i></div></div></div>'
      + '<div class="row between small" style="margin-top:6px"><span class="muted">Você · margem ±' + n1(s.margin) + '</span>'
      + '<span class="chip ' + (s.rank <= 2 ? 'green' : 'red') + '">' + s.rank + 'º</span></div></div>'
      + '<div class="card"><div class="overline" style="margin-bottom:6px">Adversários</div>' + list + '</div>'
      + (finished ? '<div class="card center"><div class="h3">Fim da campanha eleitoral</div><div class="small muted" style="margin-top:6px">O país vai às urnas.</div></div>' : '')
      + '<div class="spacer"></div>'
      + '<button class="btn" data-act="' + (finished ? 'apurar' : 'voltarHQ') + '">' + (finished ? 'Apurar resultado' : 'Voltar à campanha') + '</button>'
    );
  }

  function election() {
    cur = 'election';
    var e = Game.state().elec;
    var rows = '<div class="row between" style="padding:9px 0;border-bottom:1px solid var(--line)">'
      + '<span style="color:var(--gold);font-weight:700">' + esc(Game.state().candidate.name) + ' (você)</span>'
      + '<span class="num">' + n1(e.player) + '%</span></div>';
    e.rivals.forEach(function (r, i) {
      rows += '<div class="row between" style="padding:9px 0;border-bottom:1px solid var(--line)">'
        + '<span class="muted">' + (i + 1) + '. ' + esc(r.name) + ' · ' + esc(r.party) + '</span>'
        + '<span class="num">' + n1(r.share) + '%</span></div>';
    });
    var title, body, btn, act;
    if (e.outcome === 'win_first') {
      title = 'Eleito no 1º turno';
      body = 'Você venceu com ' + n1(e.player) + '% dos votos válidos. A faixa presidencial é sua.';
      btn = 'Assumir a presidência'; act = 'startGov';
      Snd.good();
    } else if (e.outcome === 'runoff') {
      title = 'Você está no 2º turno';
      body = 'Segundo lugar garantido. Agora é contra ' + esc(e.opponent.name) + ' (' + n1(e.opponent.share) + '%). Duas semanas para virar.';
      btn = 'Disputar o 2º turno'; act = 'toRunoff';
      Snd.alert();
    } else {
      title = 'Derrota eleitoral';
      body = 'Você terminou em ' + e.rank + 'º lugar com ' + n1(e.player) + '%. A campanha acaba aqui.';
      btn = 'Ver retrospecto'; act = 'endLose';
      Snd.bad();
    }
    paint(
      '<div class="flagline"></div>'
      + '<div class="card"><div class="overline" style="color:var(--gold)">Resultado · 1º turno</div>'
      + '<div class="h1" style="margin-top:6px">' + title + '</div>'
      + '<div class="small muted" style="margin-top:8px">' + body + '</div></div>'
      + '<div class="card">' + rows + '</div>'
      + '<div class="spacer"></div><button class="btn" data-act="' + act + '">' + btn + '</button>'
    );
  }

  function runoff() {
    cur = 'runoff';
    var S = Game.state(), r = S.camp.runoff, e = S.elec;
    var opts = Game.RUNOFF_OPTS.map(function (o, i) {
      return '<button class="opt" data-act="runoffChoice" data-v="' + i + '"><div class="grow"><div class="h3">' + esc(o.l) + '</div>'
        + '<div class="tiny muted" style="margin-top:3px">' + esc(o.d) + '</div></div></button>';
    }).join('');
    paint(
      '<div class="flagline"></div>'
      + '<div class="card"><div class="overline" style="color:var(--gold)">2º turno · ' + r.weeks + ' semana(s) restante(s)</div>'
      + '<div class="h2" style="margin-top:6px">' + esc(e.opponent.name) + '</div>'
      + '<div class="small muted" style="margin-top:4px">' + n1(e.opponent.share) + '% no 1º turno · ' + esc(e.opponent.party) + '</div>'
      + '<div class="row" style="margin-top:10px"><div class="grow"><div class="tiny muted">Você</div><div class="num" style="color:var(--gold)">' + n1(Game.national()) + '%</div></div>'
      + '<div class="grow"><div class="tiny muted">Adversário</div><div class="num">' + n1(r.oppShare) + '%</div></div></div></div>'
      + '<div class="overline" style="margin:2px 0 10px">Estratégia da semana</div>' + opts
    );
  }

  /* ---------------------- GOVERNO ---------------------- */
  function govDash() {
    cur = 'gov';
    var S = Game.state(), g = S.gov;
    var mins = MINISTRIES.map(function (m) {
      var e = g.min[m.id].e, b = g.min[m.id].b;
      return '<div style="margin-bottom:10px"><div class="row between" style="margin-bottom:4px">'
        + '<span class="small">' + m.ico + ' ' + m.name + '</span>'
        + '<span class="tiny muted">' + b + '% orç. · eficiência <b class="num">' + Math.round(e) + '</b></span></div>'
        + bar(e) + '</div>';
    }).join('');
    paint(
      '<div class="flagline"></div>'
      + '<div class="row between" style="margin-bottom:12px">'
      + '<div><div class="overline">Presidência · Trimestre ' + g.q + ' de 16</div>'
      + '<div class="h2" style="margin-top:2px">' + esc(S.candidate.name) + '</div></div>'
      + '<button class="ico-btn" data-act="menu2">☰</button></div>'

      + '<div class="card">'
      + '<div class="overline">Popularidade</div>'
      + '<div class="row" style="align-items:flex-end;margin-top:4px"><div class="big-pop num" style="color:' + (g.pop < 25 ? 'var(--red)' : g.pop > 55 ? 'var(--green)' : 'var(--gold)') + '">' + Math.round(g.pop) + '%</div>'
      + '<div class="grow" style="padding-bottom:8px">' + bar(g.pop, g.pop < 25 ? 'red' : g.pop > 55 ? '' : 'gold') + '</div></div>'
      + '<div class="grid3" style="margin-top:10px">'
      + '<div class="stat"><div class="k">Inflação</div><div class="v ' + (g.infl > 6 ? 'r' : 'g') + '">' + n1(g.infl) + '%</div></div>'
      + '<div class="stat"><div class="k">Desemprego</div><div class="v ' + (g.unemp > 10 ? 'r' : 'g') + '">' + n1(g.unemp) + '%</div></div>'
      + '<div class="stat"><div class="k">Dívida/PIB</div><div class="v ' + (g.debt > 90 ? 'r' : '') + '">' + n1(g.debt) + '%</div></div>'
      + '</div>'
      + '<div class="grid2" style="margin-top:10px">'
      + '<div class="stat"><div class="k">Caixa do governo</div><div class="v ' + (g.cash < 0 ? 'r' : 'y') + '">R$ ' + Math.round(g.cash) + ' bi</div></div>'
      + '<div class="stat"><div class="k">Capital político</div><div class="v">' + Math.round(g.cap) + '<span class="tiny muted">/100</span></div></div>'
      + '</div>'
      + (g.scandal ? '<div class="chip red" style="margin-top:10px">Escândalos sem resposta: ' + g.scandal + '</div>' : '')
      + (g.lowPop ? '<div class="chip red" style="margin-top:10px">Risco de impeachment: ' + g.lowPop + '/3</div>' : '')
      + '</div>'

      + '<div class="card"><div class="overline" style="margin-bottom:10px">Ministérios</div>' + mins + '</div>'

      + (g.log.length ? '<div class="card"><div class="overline" style="margin-bottom:6px">Histórico</div><div class="scrollbox">'
        + g.log.slice(-6).reverse().map(function (l) { return '<div class="log"><b>T' + l.q + '</b> ' + esc(l.t) + ' <span style="color:' + (l.ok ? '#3BD98F' : '#FF8589') + '">' + (l.ok ? '✓' : '✕') + '</span> — ' + esc(l.d) + '</div>'; }).join('')
        + '</div></div>' : '')

      + (!g.log.length ? '<div class="card flat"><div class="overline">Como funciona o trimestre</div><div class="small muted" style="margin-top:6px">1. Distribua o orçamento · 2. Resolva a pauta do país · 3. Os indicadores reagem. Popularidade abaixo de 15% por 3 trimestres seguidos abre impeachment.</div></div>' : '')
      + '<div class="spacer"></div>'
      + '<button class="btn" data-act="goBudget">Governar o trimestre ' + g.q + '</button>'
    );
  }

  function budget() {
    cur = 'budget';
    var g = Game.state().gov;
    var total = Game.budgetTotal();
    var rows = MINISTRIES.map(function (m) {
      var o = g.min[m.id];
      return '<div class="card" style="margin-bottom:10px">'
        + '<div class="row between"><div class="h3">' + m.ico + ' ' + m.name + '</div>'
        + '<div class="num" style="color:var(--gold)">' + o.b + '%</div></div>'
        + '<div style="margin:8px 0">' + bar(o.b * 1.6, 'gold') + '</div>'
        + '<div class="row between"><span class="tiny muted">Eficiência ' + Math.round(o.e) + '</span>'
        + '<div class="row" style="gap:8px">'
        + '<button class="btn dark sm" data-act="bud" data-v="' + m.id + '" data-d="-2">−</button>'
        + '<button class="btn dark sm" data-act="bud" data-v="' + m.id + '" data-d="2">+</button>'
        + '</div></div></div>';
    }).join('');
    var left = 100 - total;
    paint(
      topbar('Orçamento do trimestre', 'gov')
      + '<div class="card flat"><div class="row between"><span class="small muted">Distribuído</span>'
      + '<span class="num" style="color:' + (left === 0 ? 'var(--green)' : left < 0 ? 'var(--red)' : 'var(--gold)') + '">' + total + '/100%</span></div>'
      + '<div class="small muted" style="margin-top:6px">' + (left > 0 ? 'Sobram ' + left + ' pontos — pode confirmar, mas dinheiro parado não melhora indicador.' : left < 0 ? 'Você estourou o orçamento. Reduza alguma pasta.' : 'Orçamento equilibrado.') + '</div></div>'
      + rows
      + '<div class="spacer"></div>'
      + '<button class="btn" data-act="confirmBudget">Confirmar e ir à pauta</button>'
    );
  }

  function decision() {
    cur = 'decision';
    var g = Game.state().gov;
    var d = Game.currentDecision();
    var opts = d.ev.opts.map(function (o, i) {
      var t = o.type || 'dec';
      var rule = BILL_RULES[t];
      return '<button class="opt" data-act="pickAction" data-v="' + i + '">'
        + '<div class="grow"><div class="h3">' + esc(o.l) + '</div>'
        + '<div class="tiny muted" style="margin-top:4px">' + esc(rule.desc) + '</div></div>'
        + '<span class="tag ' + t + '">' + rule.label + (rule.need ? ' · ' + rule.need : '') + '</span></button>';
    }).join('');
    paint(
      '<div class="flagline"></div>'
      + '<div class="card" style="border-color:rgba(245,185,35,.4)">'
      + '<div class="overline" style="color:var(--gold)">Pauta do trimestre ' + g.q + '</div>'
      + '<div class="h2" style="margin-top:6px">' + esc(d.ev.t) + '</div>'
      + '<div class="small muted" style="margin-top:8px">' + esc(d.ev.d) + '</div></div>'
      + '<div class="row between" style="margin:0 2px 10px"><span class="overline">Sua decisão</span>'
      + '<span class="chip gold">Capital ' + Math.round(g.cap) + '</span></div>'
      + opts
    );
    Snd.alert();
  }

  function negotiation(optIdx) {
    cur = 'negotiation';
    var g = Game.state().gov;
    var d = Game.currentDecision();
    var opt = d.ev.opts[optIdx];
    tmp.optIdx = optIdx;
    tmp.capSpend = tmp.capSpend || 0;
    if (tmp.capSpend > g.cap) tmp.capSpend = Math.floor(g.cap / 10) * 10;
    var type = opt.type || 'dec';
    var rule = BILL_RULES[type];
    if (tmp.capSpend < 0) tmp.capSpend = 0;
    if (tmp.capSpend > g.cap) tmp.capSpend = Math.floor(g.cap / 10) * 10;
    var need = rule.need;
    paint(
      topbar('Negociação no Congresso', 'decision')
      + '<div class="card"><div class="overline">Proposta</div>'
      + '<div class="h3" style="margin-top:6px">' + esc(opt.l) + '</div>'
      + '<div class="small muted" style="margin-top:6px">' + esc(rule.desc) + '</div></div>'
      + '<div class="card"><div class="overline">Emendas e cargos oferecidos</div>'
      + '<div class="row between" style="margin-top:10px"><span class="h3">Capital político</span>'
      + '<div class="row" style="gap:10px">'
      + '<button class="btn dark sm" data-act="cap" data-v="-10">−10</button>'
      + '<span class="num" style="font-size:20px;color:var(--gold)">' + tmp.capSpend + '</span>'
      + '<button class="btn dark sm" data-act="cap" data-v="10">+10</button>'
      + '</div></div>'
      + '<div class="tiny muted" style="margin-top:10px">Disponível: ' + Math.round(g.cap) + '. Cada 10 pontos compram apoio, principalmente do Centrão (145 cadeiras).</div></div>'
      + '<div class="card flat"><div class="small muted">Precisa de <b>' + need + '</b> dos 513 votos. Se falhar, a proposta cai e sua popularidade sofre.</div></div>'
      + '<div class="spacer"></div>'
      + '<button class="btn" data-act="vote">Levar a voto</button>'
    );
  }

  function voteResult(res) {
    cur = 'voteResult';
    var blocks = res.vote.blocks ? res.vote.blocks.map(function (b) {
      return '<div style="margin-bottom:8px"><div class="row between small"><span>' + esc(b.name) + '</span><span class="num">' + b.yes + '/' + b.seats + '</span></div>'
        + bar(b.yes / b.seats * 100, b.yes / b.seats > 0.5 ? '' : 'red') + '</div>';
    }).join('') : '';
    paint(
      '<div class="flagline"></div>'
      + '<div class="card center">'
      + '<div class="trophy">' + (res.vote.passed ? '✅' : '❌') + '</div>'
      + '<div class="h1" style="margin-top:8px">' + (res.vote.passed ? 'Aprovado' : 'Rejeitado') + '</div>'
      + '<div class="small muted" style="margin-top:6px">' + res.vote.seats + ' votos a favor · precisava de ' + res.vote.need + '</div></div>'
      + '<div class="card"><div class="overline" style="margin-bottom:8px">Votação por bloco</div>' + blocks + '</div>'
      + '<div class="card flat"><div class="small muted">' + esc(res.msg) + '</div></div>'
      + '<div class="spacer"></div><button class="btn" data-act="afterVote">Continuar</button>'
    );
    if (res.vote.passed) Snd.good(); else Snd.bad();
  }

  function impeachment() {
    cur = 'impeachment';
    var v = Game.impeachmentVote();
    var g = Game.state().gov;
    tmp.impeach = v;
    paint(
      '<div class="flagline"></div>'
      + '<div class="card center" style="border-color:rgba(229,72,77,.5)"><div class="trophy">⚖️</div>'
      + '<div class="h1" style="margin-top:8px">Processo de impeachment</div>'
      + '<div class="small muted" style="margin-top:8px">A Câmara votou o parecer. '
      + v.seats + ' votos a favor · ' + v.need + ' necessários.</div></div>'
      + '<div class="card"><div class="row between"><span class="small">Popularidade</span><span class="num">' + Math.round(g.pop) + '%</span></div>'
      + '<div class="row between" style="margin-top:6px"><span class="small">Escândalos</span><span class="num">' + g.scandal + '</span></div></div>'
      + '<div class="spacer"></div><button class="btn ' + (v.approved ? '' : 'green') + '" data-act="afterImpeach">' + (v.approved ? 'Aceitar a decisão' : 'Sobrevivi — continuar') + '</button>'
    );
    Snd.bad();
  }

  function reelection() {
    cur = 'reelection';
    var S = Game.state(), g = S.gov;
    tmp.reelChoices = tmp.reelChoices || [];
    if (tmp.reelChoices.length < 2) {
      var opts = Game.RUNOFF_OPTS.map(function (o, i) {
        return '<button class="opt" data-act="reelChoice" data-v="' + i + '"><div class="grow"><div class="h3">' + esc(o.l) + '</div>'
          + '<div class="tiny muted" style="margin-top:3px">' + esc(o.d) + '</div></div></button>';
      }).join('');
      paint(
        '<div class="flagline"></div>'
        + '<div class="card"><div class="overline" style="color:var(--gold)">Fim do mandato</div>'
        + '<div class="h2" style="margin-top:6px">Você disputa a reeleição</div>'
        + '<div class="small muted" style="margin-top:6px">Popularidade de ' + Math.round(g.pop) + '% abre a porta. '
        + 'Escolha ' + (2 - tmp.reelChoices.length) + ' movimento(s) de campanha.</div></div>'
        + opts
      );
    } else {
      var score = Game.score('reelection');
      var chance = clamp((g.pop - 40) / 60 + (score.econ - 5) / 20 + (score.social - 5) / 20, 0.05, 0.95);
      var won = chance > 0.48;
      tmp.reelWon = won;
      paint(
        '<div class="flagline"></div>'
        + '<div class="card center"><div class="trophy">' + (won ? '🏆' : '🗳️') + '</div>'
        + '<div class="h1" style="margin-top:8px">' + (won ? 'Reeleito' : 'Não reeleito') + '</div>'
        + '<div class="small muted" style="margin-top:8px">' + (won
          ? 'O povo renovou o mandato. A faixa continua com você por mais 4 anos.'
          : 'A oposição venceu a eleição seguinte, mas seu legado foi medido.') + '</div>'
        + '<div class="tiny muted" style="margin-top:10px">Aprovação final: ' + Math.round(g.pop) + '%</div></div>'
        + '<div class="spacer"></div><button class="btn" data-act="endFinal" data-v="' + (won ? 'reeleito' : 'fim') + '">Ver nota do mandato</button>'
      );
      if (won) Snd.good(); else Snd.bad();
    }
  }

  function endScreen(outcome, extra) {
    cur = 'end';
    var S = Game.state(), g = S.gov;
    var sc = g ? Game.score(outcome) : { econ: 0, social: 0, inst: 0, nota: 0 };
    var title = {
      reeleito: 'Reeleito — 8 anos de governo',
      fim: 'Fim do mandato',
      impeachment: 'Impeachment',
      derrota: 'Derrota eleitoral'
    }[outcome] || 'Fim de jogo';
    if (extra) tmp.extra = extra;
    var body = '';
    if (g) {
      body = '<div class="grid2">'
        + '<div class="stat"><div class="k">Popularidade</div><div class="v ' + (g.pop > 50 ? 'g' : 'r') + '">' + Math.round(g.pop) + '%</div></div>'
        + '<div class="stat"><div class="k">Inflação</div><div class="v ' + (g.infl > 6 ? 'r' : 'g') + '">' + n1(g.infl) + '%</div></div>'
        + '<div class="stat"><div class="k">Desemprego</div><div class="v ' + (g.unemp > 10 ? 'r' : 'g') + '">' + n1(g.unemp) + '%</div></div>'
        + '<div class="stat"><div class="k">Dívida/PIB</div><div class="v ' + (g.debt > 90 ? 'r' : '') + '">' + n1(g.debt) + '%</div></div>'
        + '</div>';
    }
    var nota = sc.nota;
    paint(
      '<div class="flagline"></div>'
      + '<div class="card center"><div class="trophy">' + (outcome === 'impeachment' ? '⚖️' : nota >= 7 ? '🏆' : nota >= 5 ? '🎖️' : '📉') + '</div>'
      + '<div class="h1" style="margin-top:8px">' + title + '</div>'
      + '<div class="muted small" style="margin-top:6px">' + esc(S.candidate.name) + ' · ' + esc((function () { for (var i = 0; i < PARTIES.length; i++) if (PARTIES[i].id === S.candidate.partyId) return PARTIES[i].sigla; return ''; })()) + '</div></div>'
      + '<div class="card"><div class="overline">Nota do mandato</div>'
      + '<div class="row" style="align-items:flex-end;margin-top:6px"><div class="big-pop num" style="color:var(--gold)">' + n1(nota) + '</div>'
      + '<div class="small muted" style="padding-bottom:8px">/ 10</div></div>'
      + '<div style="margin-top:10px">'
      + '<div class="row between small"><span>Economia</span><span class="num">' + n1(sc.econ) + '</span></div>' + bar(sc.econ * 10, 'gold')
      + '<div class="row between small" style="margin-top:8px"><span>Social</span><span class="num">' + n1(sc.social) + '</span></div>' + bar(sc.social * 10)
      + '<div class="row between small" style="margin-top:8px"><span>Instituições</span><span class="num">' + n1(sc.inst) + '</span></div>' + bar(sc.inst * 10, sc.inst > 6 ? '' : 'red')
      + '</div></div>'
      + (body ? '<div class="card"><div class="overline" style="margin-bottom:10px">Indicadores finais</div>' + body + '</div>' : '')
      + '<div class="spacer"></div>'
      + '<button class="btn" data-act="novo">Nova campanha</button>'
      + '<button class="btn ghost" data-act="menu2" style="margin-top:10px">Menu principal</button>'
    );
    Snd.stopMusic();
    if (nota >= 7) Snd.good(); else Snd.bad();
  }

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* ---------------------- ROUTER ---------------------- */
  function go(name) {
    switch (name) {
      case 'menu': menu(); break;
      case 'ajuda': ajuda(); break;
      case 'setup': setup(); break;
      case 'hq': hq(); break;
      case 'debate': debate(); break;
      case 'comicio': comicio(); break;
      case 'marketing': marketing(); break;
      case 'ally': ally(); break;
      case 'event': campEvent(); break;
      case 'election': election(); break;
      case 'runoff': runoff(); break;
      case 'gov': govDash(); break;
      case 'budget': budget(); break;
      case 'decision': decision(); break;
      default: menu();
    }
  }

  function start() {
    app = document.getElementById('app');
    if (Game.load()) {
      var S = Game.state();
      if (S.phase === 'campaign') { menu(); return; }
    }
    menu();
  }

  document.addEventListener('click', function (e) {
    var el = e.target;
    while (el && el !== document.body) {
      if (el.getAttribute && el.getAttribute('data-act')) break;
      el = el.parentNode;
    }
    if (!el || !el.getAttribute || !el.getAttribute('data-act')) return;
    var act = el.getAttribute('data-act');
    var v = el.getAttribute('data-v');
    var d = el.getAttribute('data-d');
    Snd.tap(); vibe(8);

    switch (act) {
      case 'back': go(el.getAttribute('data-to') || 'menu'); break;
      case 'menu2':
        tmp = tmp; Game.save();
        Snd.stopMusic(); menu(); break;
      case 'novo': tmp = {}; Game.wipe(); go('setup'); break;
      case 'ajuda': go('ajuda'); break;
      case 'som':
        Snd.setEnabled(!Snd.enabled());
        try { localStorage.setItem('spb_som', Snd.enabled() ? '1' : '0'); } catch (er) {}
        menu(); break;
      case 'continuar':
        if (Game.load()) {
          var S = Game.state();
          if (S.phase === 'campaign') go(S.camp.currentEvent ? 'event' : 'hq');
          else if (S.phase === 'runoff') go('runoff');
          else if (S.phase === 'gov') go('gov');
          else go('menu');
        } else { toast('Nenhum jogo salvo.'); go('menu'); }
        break;
      case 'pickParty': tmp.partyId = v; setup(); break;
      case 'pickBg': tmp.bgId = v; setup(); break;
      case 'startGame':
        if (!tmp.partyId) { toast('Escolha um partido.'); return; }
        if (!tmp.bgId) { toast('Escolha sua origem política.'); return; }
        var nm = (tmp.name || '').trim() || 'Candidato';
        Game.setup(nm, tmp.partyId, tmp.bgId);
        Game.save();
        go('hq'); break;
      case 'goDebate': go('debate'); break;
      case 'goComicio': go('comicio'); break;
      case 'goMarketing': go('marketing'); break;
      case 'goAlly': go('ally'); break;
      case 'answer':
        var r = Game.doDebate(tmp.debateIdx, parseInt(v, 10));
        Snd.stopMusic();
        if (r.ok) { toast('Resposta registrada'); Game.save(); go('hq'); } else toast(r.msg);
        break;
      case 'doComicio':
        var rc = Game.doComicio(v);
        if (rc.ok) { toast(rc.msg); Game.save(); go('hq'); } else toast(rc.msg);
        break;
      case 'doMarketing':
        var rm = Game.doMarketing(parseInt(v, 10));
        if (rm.ok) { toast(rm.msg); Game.save(); go('hq'); } else toast(rm.msg);
        break;
      case 'doAlly':
        var ra = Game.doAlly(v);
        if (ra.ok) { toast(ra.msg); Game.save(); ally(); } else toast(ra.msg);
        break;
      case 'resolveEvent':
        Game.resolveEvent(parseInt(v, 10));
        Game.save(); go('hq'); break;
      case 'endWeek':
        var ev = Game.maybeEvent();
        if (ev) { Game.save(); go('event'); break; }
        var res = Game.endWeek();
        if (res.finished) { Game.election(); Game.save(); go('election'); }
        else { Game.save(); surveyScreen(res, false); }
        break;
      case 'voltarHQ': go('hq'); break;
      case 'apurar': go('election'); break;
      case 'toRunoff': go('runoff'); break;
      case 'runoffChoice':
        var rr = Game.runoffChoice(parseInt(v, 10));
        if (rr.done) {
          Game.save();
          if (rr.win) { Game.state().elec.outcome = 'win_first'; go('election'); }
          else { Game.state().elec.outcome = 'lost'; go('election'); }
        } else { Game.save(); runoff(); }
        break;
      case 'startGov':
        Game.startGov(true); Game.save(); go('gov'); break;
      case 'endLose':
        Game.state().gov = null; Game.save();
        endScreen('derrota'); break;
      case 'goBudget': go('budget'); break;
      case 'bud':
        if (Game.adjustBudget(v, parseInt(d, 10))) budget();
        else toast('Sem saldo para aumentar essa pasta.');
        break;
      case 'confirmBudget':
        Game.state().gov.budgetDone = true;
        Game.save(); go('decision'); break;
      case 'pickAction': negotiation(parseInt(v, 10)); break;
      case 'cap':
        var nv = tmp.capSpend + parseInt(v, 10);
        tmp.capSpend = Math.max(0, Math.min(Math.floor(Game.state().gov.cap / 10) * 10, nv));
        negotiation(tmp.optIdx);
        break;
      case 'vote':
        var res2 = Game.decide(tmp.optIdx, tmp.capSpend);
        Game.save();
        if (res2.ok) voteResult(res2); else go('gov');
        break;
      case 'afterVote':
        tmp.capSpend = 0;
        var nx = Game.nextQuarter();
        Game.save();
        if (nx.impeachment) { go('impeachment'); }
        else if (nx.ended) {
          var gv = Game.state().gov;
          if (gv.pop >= 55) { tmp.reelChoices = []; reelection(); }
          else { Game.state().phase = 'end'; Game.save(); endScreen('fim'); }
        } else go('gov');
        break;
      case 'afterImpeach':
        var vv = tmp.impeach;
        if (vv && vv.approved) { Game.state().phase = 'end'; Game.save(); endScreen('impeachment'); }
        else {
          Game.state().gov.scandal = 0;
          Game.state().gov.lowPop = 0;
          Game.save(); go('gov');
        }
        break;
      case 'reelChoice':
        tmp.reelChoices.push(parseInt(v, 10));
        reelection(); break;
      case 'endFinal':
        var won = v === 'reeleito';
        Game.state().phase = 'end'; Game.save();
        endScreen(won ? 'reeleito' : 'fim'); break;
    }
  });

  return {
    start: start,
    go: go,
    toast: toast
  };
})();

window.androidBack = function () {
  var s = Game.state();
  if (!s) return 'exit';
  if (s.phase === 'campaign' && s.camp) { UI.go(s.camp.currentEvent ? 'event' : 'hq'); return 'ok'; }
  if (s.phase === 'runoff') { UI.go('runoff'); return 'ok'; }
  if (s.phase === 'gov' && s.gov) { UI.go('gov'); return 'ok'; }
  return 'exit';
};
window.saveGame = function () { Game.save(); };
