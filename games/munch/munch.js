/* Mochi Munch v3 — Number Munchers-style math grid on the Blob Arcade core.
   1 player: arrows (or W/A/S/D) move, Space/Enter (or F) munch, R repeats the rule, M music on/off. Mouse/touch: tap to walk, tap your blob to munch.
   2 players (same keyboard): Player 1 = arrows + Space/Enter, Player 2 = W/A/S/D + F. Each player gets their OWN color-coded
   cells on a shared grid, with a rule matched to their own skill level. Modes: Team (shared goal & stars) or Race (friendly).
   A friendly countdown (on by default) ends the round kindly; sparkly bonus stars bring a bonus question worth extra time. */
(function (A) {
  'use strict';
  var $ = A.$, C = A.Curriculum, V = A.Voice, SFX = A.Audio.SFX, UI = A.UI, M = A.Music;
  UI.boot();
  var P1 = A.Store.active();
  if (!P1) { location.replace(A.ROOT + 'index.html#players'); return; }
  C.ensure(P1);
  var S = A.Store.settings;
  var GENTLE = A.gentleMunch(P1);   // little ones: no hearts, no countdown (grown-up setting per player)
  // design2 (2026-10-22): the countdown is OFF by default at age 5 and under (timer pace "Auto"); a grown-up can still turn it
  // on per player by picking a pace (Relaxed / Normal / Speedy) in Players. Gentle Munch never has a clock.
  function timerFor(p) { return S.timer !== false && !A.gentleMunch(p) && !(A.Age.preReader(p) && (!p.timerPace || p.timerPace === 'auto')); }
  function timerWanted() { return timerFor(P1) && (!P2 || timerFor(P2)); }

  /* ---------- who is playing ---------- */
  var qs = {}; location.search.replace(/^\?/, '').split('&').forEach(function (kv) { var p = kv.split('='); if (p[0]) qs[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ''); });
  if (!qs.mode) { A.MunchMenu.show(P1); return; }          // no mode yet: the start menu (Story / Free Play / 2 Players)
  var STORY = qs.mode === 'story', MODE = qs.mode === 'team' || qs.mode === 'versus' ? qs.mode : null, P2 = null;
  var GUEST = { easy: ['count10', 1], medium: ['add10', 1], hard: ['add20', 1] };
  function makeGuest(kind) {
    var g = A.Store.blank('Guest', 'carrot'); g.id = 'guest'; g.color = 'sky'; g.guest = true; g.age = kind === 'easy' ? 4 : null; C.ensure(g);
    var lv = GUEST[kind] || GUEST.medium; C.place(g, lv[0]); C.state(g, lv[0]).level = lv[1]; C.state(g, lv[0]).introduced = true; return g;
  }
  if (MODE && qs.p2) { P2 = /^guest/.test(qs.p2) ? makeGuest(qs.p2.split('-')[1]) : A.Store.get(qs.p2); if (P2 && P2.id === P1.id) P2 = null; if (P2) C.ensure(P2); }
  var TWO = !!(MODE && P2); if (!TWO) MODE = null;
  // game controllers: every button acts like its key (see js/core/gamepad.js); in 2P seat 2 is W A S D + F
  A.Pad.context({ game: true, two: TWO, names: [P1.name, P2 ? P2.name : ''] });
  var ST = A.Story, SR = null;  // SR: the story stop being played {i, cfg, practice}
  var LEVELN = 0;               // rounds played this visit ("Round N!" intro; not the skill level, which the chip shows)

  var COLS = TWO ? 6 : 5, ROWS = 4, N = COLS * ROWS;
  // Guided Munch: PreK/K use a 3x3 grid centered in the same fixed stage (bigger tiles, no reflow).
  function littleGrid() { return !TWO && !!(A.MunchRules && A.MunchRules.littleReader && A.MunchRules.littleReader(P1)); }
  function applyGrid() {
    if (TWO) { COLS = 6; ROWS = 4; }
    else if (littleGrid()) { COLS = 3; ROWS = 3; }
    else { COLS = 5; ROWS = 4; }
    N = COLS * ROWS;
    document.body.classList.toggle('little-grid', littleGrid());
    if (window.__munch) window.__munch.COLS = COLS;
  }
  applyGrid();
  var HEART = '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3.3 5 6.8 5c2 0 3.6 1.1 5.2 3 1.6-1.9 3.2-3 5.2-3 3.5 0 5.6 3.6 4.3 6.8C19.5 16.4 12 21 12 21z"/></svg>';
  // 2026-10-22 voice: the 8 rotating spoken praise lines are gone; a right munch shows one of these short words in the bubble (no voice)
  var YUM_TEXT = ['Yum!', 'Nom nom!', 'Yummy!'];
  var COLORS = [{ c: '#3d8ef0', soft: '#d9e9ff', name: 'blue' }, { c: '#ff8a2a', soft: '#ffe5cf', name: 'orange' }];
  // a player's name (browser voice); without speech: "Player 1" / "Player 2"
  function nameParts(p) { var i = PL.findIndex(function (pl) { return pl.P === p; }); return A.Voice.name(p, [i === 1 ? 'pl_two' : 'pl_one']); }

  function mkPlayer(P, i) { return { i: i, P: P, name: P.name, col: COLORS[i], pos: { r: 0, c: 0 }, target: null, walkT: null, lastMove: 0, busy: false, el: null, round: null, rule: null, nOk: 0, remaining: 0, correct: 0, wrong: 0, done: false, doneAt: 0 }; }
  var PL = [mkPlayer(P1, 0)]; if (TWO) PL.push(mkPlayer(P2, 1));
  var G = { lastStars: null, active: false, cells: [], hearts: 3, grum: null, grumT: null, t0: 0, first: true, team: { done: false } };
  var DEMO = { on: false, skipOk: false, close: null, walkT: null };
  var T = { on: timerWanted(), limit: 0, left: 0, low: false, lastSec: -1, iv: null, said: false, bonusAdd: 0 };
  var B = { cell: -1, shown: false, plannedAt: 0, open: false, q: null, sel: 0, el: null, used: false };
  var board = $('#board'), wrap = $('#boardWrap'), cellEls = [], grumEl, starEl, CS = 100, CW = 100, GAP = 8;
  document.body.classList.toggle('two', TWO); document.body.classList.toggle('notimer', !T.on); document.body.classList.toggle('gentle', GENTLE && !TWO);

  /* ---------- timer ---------- */
  // seconds per target cell, by skill and level (walking + thinking time); generous on purpose
  var PER = { count10: [9, 10], compare: [10, 11], add10: [11, 12], sub10: [12, 13], make10: [12, 13], teen: [10, 11], missing: [13, 14], add20: [13, 14], sub20: [14, 15], evenodd: [9, 10] };
  var PACE = { relaxed: 1.4, normal: 1, speedy: 0.75 };
  function paceOf(p) { var x = p.timerPace; if (!x || x === 'auto') x = A.Age.preReader(p) ? 'relaxed' : 'normal'; return x; }
  function boostOf(p, sid) { var b = p.math.timeBoost || (p.math.timeBoost = {}); return b[sid] || 1; }
  function secondsFor(pl) {
    var sid = pl.round.skill.id, per = (PER[sid] || pl.round.skill.secs || [11, 12])[Math.min(pl.round.level, 1)];
    var s = (12 + per * pl.nOk) * PACE[paceOf(pl.P)] * (pl.round.story ? 1 : boostOf(pl.P, sid)) * (pl.round.timeX || 1);
    if (A.Age.little(pl.P)) s *= 1.15;
    return s;
  }
  function startTimer() {
    clearInterval(T.iv); T.low = false; T.said = false; T.lastSec = -1; T.bonusAdd = 0;
    var lim = Math.max.apply(null, PL.map(secondsFor)); if (TWO) lim *= 1.1;
    var chal = PL[0].round && PL[0].round.challenge;
    T.on = chal ? true : timerWanted(); document.body.classList.toggle('notimer', !T.on); document.body.classList.toggle('challenge', !!chal);
    if (chal) lim = chal.target;
    T.limit = T.left = Math.round(lim); renderTimer(); M.setFast(false);
    if (!T.on) return;
    var last = Date.now();
    T.iv = setInterval(function () {
      var now = Date.now(), dt = (now - last) / 1000; last = now;
      if (!G.active || blocked() || document.hidden) return;
      T.left = Math.max(0, T.left - dt); renderTimer(); maybeBonus();
      if (T.left <= 0) { clearInterval(T.iv); timeUp(); }
    }, 100);
  }
  function stopTimer() { clearInterval(T.iv); T.iv = null; M.setFast(false); $('#timer').classList.remove('low', 'last'); }
  function renderTimer() {
    var el = $('#timer'); if (!T.on) { el.style.display = 'none'; return; } el.style.display = '';
    var f = T.limit ? T.left / T.limit : 1, secs = Math.ceil(T.left);
    $('#timerFill').style.transform = 'scaleX(' + Math.max(0, Math.min(1, f)).toFixed(4) + ')';
    $('#timerTxt').textContent = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
    var low = G.active && (T.left <= Math.max(10, T.limit * .2));
    // design2: no "a little time left" voice line and no ticking in the last seconds (no pressure); the bar just turns warm
    if (low !== T.low) { T.low = low; el.classList.toggle('low', low); M.setFast(low); }
    el.classList.toggle('last', G.active && T.left <= 5);
  }
  function addTime(s) { T.left += s; T.limit = Math.max(T.limit, T.left); renderTimer(); var tm = $('#timer'), r = tm.getBoundingClientRect(); UI.plusText(r.right - 50, r.top + 6, '+' + s + 's'); tm.classList.remove('boost'); void tm.offsetWidth; tm.classList.add('boost'); }

  /* ---------- level building ---------- */
  // Boss harder tier: stay on the same skill, but prefer bigger numbers and closer distractors.
  function ruleSize(R) {
    var s = (R && (R.plain || R.text) || '').replace(/<[^>]+>/g, ' '), n = 0, m;
    var re = /-?\d+/g; while ((m = re.exec(s))) n = Math.max(n, Math.abs(+m[0]));
    if (R && R.target != null && isFinite(+R.target)) n = Math.max(n, Math.abs(+R.target));
    return n;
  }
  function cellNum(c) {
    if (!c) return null;
    if (typeof c.value === 'number' && isFinite(c.value)) return c.value;
    if (c.f && typeof c.f.v === 'number') return c.f.v;
    var m = String(c.k || c.label || '').match(/-?\d+/);
    return m ? +m[0] : null;
  }
  function harderRule(skill, level) {
    if (!skill || !skill.gen) return skill && skill.gen ? skill.gen(level) : null;
    var best = null, bestN = -1, t;
    for (t = 0; t < 8; t++) {
      var r = skill.gen(level), n = ruleSize(r);
      if (!best || n > bestN) { best = r; bestN = n; }
    }
    if (best && best.bad) {
      var orig = best.bad, tgt = best.target;
      best.bad = function () {
        var i, c, n, d, pick = orig(), bestC = pick, bestD = 99;
        if (tgt == null || !isFinite(+tgt)) return pick;
        n = cellNum(pick); if (n != null) bestD = Math.abs(n - tgt);
        for (i = 0; i < 5; i++) {
          c = orig(); n = cellNum(c);
          if (n == null) continue;
          d = Math.abs(n - tgt);
          if (d > 0 && d < bestD) { bestC = c; bestD = d; }
        }
        return bestC;
      };
    }
    return best;
  }
  // ladder1121: an easy tier of a level (the small steps into a new skill): 1 = the smallest of 8 rules, 2 = + wrong snacks far
  // from the answer, 3 = + the strategy hint shown from the start
  function easierRule(skill, level, tier) {
    if (!skill || !skill.gen) return null;
    var best = null, bestN = 1e9, t;
    for (t = 0; t < 8; t++) { var r = skill.gen(level), n = ruleSize(r); if (!best || n < bestN) { best = r; bestN = n; } }
    if (best && best.bad && tier >= 2) {
      var orig = best.bad, tgt = best.target;
      best.bad = function () {
        var i, c, n, pick = orig(), bestC = pick, bestD = -1;
        if (tgt == null || !isFinite(+tgt)) return pick;
        n = cellNum(pick); if (n != null) bestD = Math.abs(n - tgt);
        for (i = 0; i < 5; i++) { c = orig(); n = cellNum(c); if (n == null) continue; if (Math.abs(n - tgt) > bestD) { bestC = c; bestD = Math.abs(n - tgt); } }
        return bestC;
      };
    }
    return best;
  }
  function buildLevel(cont) {
    var cells = [];
    PL.forEach(function (pl) {
      if (A.Steps) A.Steps.ctx.p = pl.P;
      var hard = !!(pl.round.hard || (SR && SR.cfg && SR.cfg.bossHarder)), R, mine = TWO ? N / 2 : N, cpb = A.Age.cellsPerBoard(pl.P), nOk = TWO ? A.rnd(5, 6) : pl.round.nOk || A.rnd(cpb[0], cpb[1]), i;
      if (littleGrid()) nOk = Math.max(3, Math.min(nOk, 4));
      if (nOk > mine) nOk = mine;
      if (A.MunchRules && A.MunchRules.ruleFor) R = A.MunchRules.ruleFor(pl, { hard: hard, tier: pl.round.tier });
      if (!R) R = hard ? harderRule(pl.round.skill, pl.round.level) : (pl.round.tier && easierRule(pl.round.skill, pl.round.level, pl.round.tier)) || pl.round.skill.gen(pl.round.level);
      if (R && R.maxOk != null && nOk > R.maxOk) nOk = Math.max(1, R.maxOk);
      if (nOk > mine) nOk = mine;
      var pickable = A.Coach && A.Coach.pickItem && !R.rc && R.hom == null && typeof R.target !== 'string' && !pl.P.guest;
      var seen = {}, ck = function (c) { return String((c.k || c.label || '') + (R && R.rhymes ? '' : '|' + (c.html || ''))); };
      var fresh = function (fn) { var c, t = 0; do { c = fn(); } while (seen[ck(c)] && ++t < 12); seen[ck(c)] = 1; return c; };
      for (i = 0; i < nOk; i++) {
        var g = fresh(R.good);
        if (pickable) { var cands = [g, R.good(), R.good()].filter(function (c, k) { return !k || !seen[ck(c)]; }).map(function (c) { return { key: c.label, cell: c }; }); g = A.Coach.pickItem(pl.P, pl.round.skill.id, cands).cell; }   // coach v2: expected success near 80-85%
        g.ok = true; g.owner = pl.i; cells.push(g);
      }
      for (i = nOk; i < mine; i++) { var b = fresh(R.bad); b.ok = false; b.owner = pl.i; cells.push(b); }
      pl.workedShown = false; pl.easedOff = false; pl.workedOpen = false; pl.lastAns = 0; pl.diag = null; pl.diagSeen = {}; pl.lastMiss = null;
      pl.rule = R; pl.nOk = nOk; pl.remaining = nOk; pl.correct = 0; pl.wrong = 0; pl.done = false; pl.doneAt = 0; pl.busy = false;
      pl.target = null; clearTimeout(pl.walkT); pl.walkT = null; if (!cont) pl.bonusStar = false;
    });
    A.shuffle(cells);
    G.cells = cells; if (!cont) { G.hearts = 3; G.t0 = Date.now(); } G.team = { done: false };
    var fsj = null; try { fsj = A.Curriculum.subjectOf(PL[0].round.skill); } catch (e) { fsj = null; }
    G.freeMax = TWO ? 0 : A.munchFreeMisses(P1, PL[0].nOk, fsj); G.noRegen = false; G.lastFact = [];
    if (!TWO && STORY && SR && SR.cfg && SR.cfg.boss) {
      if (SR.cfg.bossFree != null) G.freeMax = SR.cfg.bossFree;
      if (SR.cfg.bossNoRegen) G.noRegen = true;
    }
    G.free = G.freeMax; G.run = 0;   // after9 hint-before-heart; batch1: 1 per 4 snacks, fresh on every board. Bramble: 1 free, no regen.
    PL[0].pos = TWO ? { r: ROWS - 1, c: COLS - 1 } : { r: 0, c: 0 };   // P1 (arrow keys, right hand) starts on the right
    if (TWO) PL[1].pos = { r: 0, c: 0 };                                 // P2 (WASD, left hand) starts on the left
    B.cell = -1; B.shown = false; B.used = false;
    B.chance = TWO ? .75 : .6;
    B.plannedAt = Math.random() < B.chance ? .2 + Math.random() * .35 : -1; // fraction of the time used when the star appears
  }
  function renderBoard() {
    board.innerHTML = ''; cellEls = [];
    G.cells.forEach(function (c, i) {
      var eq = eqLabelOf(c);
      var d = document.createElement('div'); d.className = 'cell in c' + ((i * 3 + Math.floor(i / COLS)) % 5) + (!eq && c.long ? ' long' : '') + (eq ? ' eq' : '') + (TWO ? ' own p' + (c.owner + 1) : '');
      d.style.animationDelay = (Math.floor(i / COLS) * 70 + (i % COLS) * 45) + 'ms';
      d.setAttribute('role', 'button'); d.setAttribute('aria-label', (TWO ? PL[c.owner].name + ': ' : '') + c.label);
      d.innerHTML = '<span class="lbl">' + (eq ? '<span class="st-eq">' + A.esc(eq) + '</span>' : (c.html || A.esc(c.label))) + '</span><span class="crumb">' + (A.Icons ? A.Icons.html('🌼', { size: 32, decorative: true, cls: 'pp-pic', slot: 'munch:crumb' }) : '') + '</span>' + (TWO ? '<span class="tagdot">' + A.esc(PL[c.owner].name.charAt(0).toUpperCase()) + '</span>' : '');
      if (A.Kit && A.Kit.padHit && CS < 60) A.Kit.padHit(d, Math.ceil((60 - CS) / 2));
      board.appendChild(d); cellEls.push(d);
    });
    PL.forEach(function (pl) {
      if (!pl.el) { pl.el = document.createElement('div'); pl.el.className = 'actor p' + (pl.i + 1); pl.el.id = pl.i ? 'me2' : 'me'; }
      pl.el.innerHTML = '<div class="ring"></div><div class="holder">' + A.Blobs.forProfile(pl.P) + '</div>' + (TWO ? '<span class="ntag">' + A.esc(pl.name) + '</span>' : '');
      board.appendChild(pl.el);
    });
    if (!grumEl) { grumEl = document.createElement('div'); grumEl.className = 'actor'; grumEl.id = 'grumbly'; grumEl.innerHTML = '<div class="holder">' + A.Blobs.grumbly() + '</div>'; }
    board.appendChild(grumEl); grumEl.style.display = G.grum ? 'block' : 'none';
    starEl = document.createElement('div'); starEl.className = 'bonusStar'; starEl.innerHTML = '<span class="glow"></span>' + UI.STAR + '<span class="tw t1">✦</span><span class="tw t2">✦</span>'; board.appendChild(starEl);
    renderRule(); renderSide(); $('#starCount').textContent = P1.stars;
    layout(); place(false);
  }
  function renderRule() {
    if (!TWO) {
      var pl = PL[0];
      // strategy hint only after a mistake (never up front)
      var parts = (A.CountVisual && A.CountVisual.display) ? A.CountVisual.display(pl.rule) : { text: pl.rule.text, pic: pl.rule.pic || '' };
      var hintHtml = (pl.rule.stepHint && (pl.wrong > 0 || pl.round.tier >= 3) ? '<span class="hint st">' + pl.rule.stepHint(pl.lastMiss, pl.wrong >= 2 ? 2 : 1) + '</span>' : pl.rule.hint && (pl.wrong > 0 || pl.round.tier >= 3) ? '<span class="hint">' + pl.rule.hint + '</span>' : '');
      // One picture copy, in a slot the panel can scale. v2p2a: a step shows a picture hint after a miss.
      $('#ruleTxt').innerHTML = parts.text + (parts.pic ? '<span class="st-pic">' + parts.pic + '</span>' : '') + hintHtml;
      layoutRuleAsk($('#ruleTxt'));
      if (A.CountVisual && A.CountVisual.fit) A.CountVisual.fit($('#ruleTxt'));
      fitRulePic();
      var chip = $('#levelChip'), s = pl.round.skill;
      chip.textContent = pl.round.story ? ((ST.placeName && ST.placeName(pl.round.stop)) || pl.round.stop.area.name) + ' · Stop ' + pl.round.stop.n : pl.round.review ? 'Review: ' + s.name : pl.round.testOut ? 'Test-out: ' + s.name + ' · 5 to skip ahead' : s.name + (s.isStep ? '' : ' · Level ' + (pl.round.level + 1)) + (pl.round.boards > 1 ? ' · Board ' + pl.round.board + ' of ' + pl.round.boards : '');
      if (pl.round.story && SR && SR.cfg && SR.cfg.boss && A.Story2.PLACES[A.Story2.placeOfStop(SR.i)].art) chip.textContent = 'Mini boss: ' + SR.cfg.bossName;
      chip.classList.toggle('review', !!pl.round.review);
      return;
    }
    $('#ruleTxt').innerHTML = PL.map(function (pl) {
      return '<div class="prule p' + (pl.i + 1) + (pl.done ? ' done' : '') + '"><span class="mini">' + A.Blobs.forProfile(pl.P) + '</span><span class="who">' + A.esc(pl.name) + '</span><span class="rt">' + pl.rule.text + '</span>' +
        '<span class="cnt">' + (pl.done ? '✓ All done!' : pl.correct + ' / ' + pl.nOk) + '</span></div>';
    }).join('');
    $('#levelChip').textContent = MODE === 'team' ? 'Team munch' : 'Munch race'; $('#levelChip').classList.remove('review');
    if (A.CountVisual && A.CountVisual.fit) A.CountVisual.fit($('#ruleTxt'));
    fitRulePic();
  }
  function layoutRuleAsk(el) {
    if (!el) return;
    el.innerHTML = el.innerHTML.replace(/(that equal\s*)(<b class="hl">[\s\S]*?<\/b>)/i, '<span class="eq-tail">$1$2</span>');
    var pics = el.querySelectorAll(':scope > .st-pic, :scope > .pb-target, :scope > .pb-qpic');
    for (var i = 0; i < pics.length; i++) {
      var pic = pics[i];
      if (pic.parentNode !== el) continue;
      var wrap = document.createElement('span');
      wrap.className = 'rule-pic';
      el.insertBefore(wrap, pic);
      wrap.appendChild(pic);
    }
  }
  function fitRulePic() {
    var top = document.querySelector('#game .top') || document.querySelector('.top');
    var set = document.querySelector('#ruleTxt .cv-set');
    var txt = $('#ruleTxt');
    if (!top || !txt) return;
    top.classList.toggle('has-cv', !!set);
    void top.offsetHeight;
    if (set) {
      var frames = set.querySelectorAll('.cv-frame, .cv-framewrap').length;
      set.style.flexWrap = (frames > 2) ? 'wrap' : 'nowrap';
    }
    var d = 16;
    if (set) set.style.setProperty('--cv-d', d + 'px');
    var guard = 0, floor = 14;
    function overflows() { return top.scrollHeight > top.clientHeight + 1; }
    while (guard++ < 24 && overflows()) {
      if (set && d > floor) {
        d -= 1;
        set.style.setProperty('--cv-d', d + 'px');
      } else {
        var fs = parseFloat(window.getComputedStyle(txt).fontSize) || 20;
        if (fs > 14) txt.style.fontSize = (fs - 1) + 'px';
        else if (set && d > 10) {   // only shrink dots below 14 when the panel still overflows
          d -= 1;
          set.style.setProperty('--cv-d', d + 'px');
        } else {
          var rule = document.querySelector('#game .rule') || document.querySelector('.rule');
          if (rule) rule.style.padding = '4px 8px';
          break;
        }
      }
    }
  }
  function renderSide() {
    if (!TWO) { renderHearts(); return; }
    var h = $('#hearts'); h.className = 'hearts score';
    if (MODE === 'team') { var c = PL[0].correct + PL[1].correct, n = PL[0].nOk + PL[1].nOk; h.innerHTML = '<span class="tm">Team</span><b>' + c + '</b><span class="of">/ ' + n + '</span>'; }
    else h.innerHTML = PL.map(function (pl) { return '<span class="sc p' + (pl.i + 1) + '">' + A.esc(pl.name) + ' <b>' + pl.correct + '</b></span>'; }).join('');
  }
  function layout() {
    var W = wrap.clientWidth - 8, H = wrap.clientHeight - 8; if (!W || !H) return;
    GAP = Math.max(6, Math.round(Math.min(W, H) * .016));
    // Solo 20-cell boards: pick 5×4 or 4×5, whichever yields larger square tiles that still fit with no scroll.
    // PreK/K stay on a 3×3 in the same wrap (centered, bigger tiles).
    if (!TWO && littleGrid()) {
      COLS = 3; ROWS = 3; N = 9;
      if (window.__munch) window.__munch.COLS = COLS;
      CS = Math.floor(Math.min((W - GAP * (COLS - 1)) / COLS, (H - GAP * (ROWS - 1)) / ROWS, 260));
    } else if (!TWO) {
      function tileSize(cols, rows, gap) {
        return Math.floor(Math.min((W - gap * (cols - 1)) / cols, (H - gap * (rows - 1)) / rows, 260));
      }
      var s54 = tileSize(5, 4, GAP), s45 = tileSize(4, 5, GAP), nextCols = s45 > s54 ? 4 : 5, nextRows = s45 > s54 ? 5 : 4, nextCS = Math.max(s45, s54);
      if (nextCols !== COLS) {
        var oldCols = COLS;
        COLS = nextCols; ROWS = nextRows;
        if (window.__munch) window.__munch.COLS = COLS;
        PL.forEach(function (pl) {
          if (!pl.pos) return;
          var idx = pl.pos.r * oldCols + pl.pos.c;
          pl.pos = { r: Math.floor(idx / COLS), c: idx % COLS };
        });
        if (G.grum) {
          var gi = G.grum.r * oldCols + G.grum.c;
          G.grum = { r: Math.floor(gi / COLS), c: gi % COLS };
        }
      }
      CS = nextCS;
    } else {
      CS = Math.floor(Math.min((W - GAP * (COLS - 1)) / COLS, (H - GAP * (ROWS - 1)) / ROWS, 260));
    }
    // Never grow past the wrap (the old 44px floor overflowed short landscape screens and covered the question card).
    var fitCS = Math.floor(Math.min((W - GAP * (COLS - 1)) / COLS, (H - GAP * (ROWS - 1)) / ROWS));
    // Official stages have room for 60px tiles; never go below that unless the wrap is smaller.
    CS = Math.max(Math.min(60, fitCS), Math.min(CS, fitCS));
    CS = Math.max(20, CS);
    // skills with phrase answers (stories) get wider tiles when there is room (same rows, so the walk/munch grid is unchanged)
    var wide = PL.some(function (pl) { return pl.round && pl.round.skill && pl.round.skill.wideCells; });
    CW = wide ? Math.max(CS, Math.min(Math.floor((W - GAP * (COLS - 1)) / COLS), Math.round(CS * 1.7))) : CS;
    board.style.gridTemplateColumns = 'repeat(' + COLS + ', ' + CW + 'px)';
    board.style.gridTemplateRows = 'repeat(' + ROWS + ', ' + CS + 'px)';
    board.style.gridAutoRows = CS + 'px';
    board.style.gap = GAP + 'px';
    var bw = COLS * CW + GAP * (COLS - 1), bh = ROWS * CS + GAP * (ROWS - 1);
    board.style.width = bw + 'px';
    board.style.height = bh + 'px';
    board.style.minWidth = bw + 'px';
    board.style.minHeight = bh + 'px';
    board.style.maxWidth = bw + 'px';
    board.style.maxHeight = bh + 'px';
    board.style.flexShrink = '0';
    board.style.setProperty('--cs', CS + 'px');
    board.style.setProperty('--icon-cs', CS + 'px');  // artswap: icon/emoji size ignores fitCells label shrink
    PL.map(function (p) { return p.el; }).concat([grumEl, starEl]).forEach(function (e) { if (e) { e.style.width = CS + 'px'; e.style.height = CS + 'px'; } });
    place(false); fitCells();
    if (A.Kit && A.Kit.padHit) {
      var pad = CS < TAP_MIN ? Math.ceil((TAP_MIN - CS) / 2) : 8;
      cellEls.forEach(function (el) { A.Kit.padHit(el, pad); });
    }
    if (layout._fitT) cancelAnimationFrame(layout._fitT);
    layout._fitT = requestAnimationFrame(function () {
      fitCells();
      var h0 = wrap.clientHeight;
      fitRulePic();
      fitBubble();
      // Growing .has-cv / .has-longmsg changes wrap height after the first layout, which
      // can leave the top row of tiles under the timer. Relayout once when the wrap moves.
      if (!layout._didRelayout && Math.abs(wrap.clientHeight - h0) > 2) {
        layout._didRelayout = true;
        layout();
      } else {
        layout._didRelayout = false;
      }
    });
  }
  // a + b / a − b tiles: show the equation only, large and unclipped (teaching ten-frame is on the prompt card)
  function eqLabelOf(c) {
    var s = String((c && c.label) || '');
    if (!/^\s*\d+\s*[+−\-]\s*\d+\s*$/.test(s)) return null;
    return s.replace(/\s*-\s*/g, ' − ').replace(/\s+/g, ' ').trim();
  }
  // Make every tile label fit inside its tile: first shrink on one line (a little), then wrap at spaces and shrink again,
  // never below MIN_FONT px for the label's text. Shrinking sets the label's own --cs, so pictures/frames scale with the text.
  var MIN_FONT = 13, MIN_WORD = 20;
  function over(l) { return l.scrollWidth > l.clientWidth || l.scrollHeight > l.clientHeight; }
  function textPx(l) { var t = l.querySelector('.ea-word,.ea-cap,.tp-w') || l; return parseFloat(getComputedStyle(t).fontSize) || 16; }
  function minFontFor(l) {
    var el = l.querySelector('.tp-w, .ea-word, .ea-cap') || l;
    var letters = String((el.innerText || el.textContent || '')).replace(/[^A-Za-z]/g, '');
    return letters.length >= 6 ? MIN_WORD : MIN_FONT;
  }
  function fitCell(d) {
    var l = d.querySelector('.lbl'); if (!l) return;
    l.style.removeProperty('--cs'); d.classList.remove('wrap', 'tight');
    l.style.maxWidth = Math.floor(d.clientWidth * .92) + 'px';
    l.style.setProperty('max-height', d.clientHeight + 'px', 'important');   // full tile height (css max-height:100% can undershoot by a few px)
    if (l.querySelector('.st-ansnum')) {
      l.style.maxWidth = Math.floor(d.clientWidth * .88) + 'px';
      return;   // How-many numerals are sized from --icon-cs (~48% of the tile); do not shrink them
    }
    if (l.querySelector('.st-eq')) {
      l.style.removeProperty('--icon-cs');
      l.style.maxWidth = Math.floor(d.clientWidth * .92) + 'px';
      l.style.fontSize = '0';   // kill the label strut so it cannot shrink the equation
      l.style.lineHeight = '1';
      l.style.overflow = 'visible';
      var eq = l.querySelector('.st-eq');
      eq.style.removeProperty('font-size');
      eq.style.letterSpacing = /\d{2}/.test(eq.textContent || '') ? '0' : '';
      function eqOver() {
        // Use bounding rects on both sides so a stage scale does not look like overflow.
        var er = eq.getBoundingClientRect(), cr = d.getBoundingClientRect(), pad = 2;
        return er.width > cr.width * .92 || er.height > cr.height * .92 ||
          er.left < cr.left - pad || er.right > cr.right + pad || er.top < cr.top - pad || er.bottom > cr.bottom + pad;
      }
      var kEq = 1, minEq = 20;
      l.style.setProperty('--icon-cs', (CS * kEq) + 'px');
      eq.style.fontSize = (CS * 0.42 * kEq) + 'px';
      while (eqOver() && CS * 0.42 * kEq * .94 >= minEq) {
        kEq *= .94;
        l.style.setProperty('--icon-cs', (CS * kEq) + 'px');
        eq.style.fontSize = (CS * 0.42 * kEq) + 'px';
      }
      // Never clip a long fact; shrink below 20px only if it still will not fit.
      while (eqOver() && kEq > .4) {
        kEq *= .94;
        l.style.setProperty('--icon-cs', (CS * kEq) + 'px');
        eq.style.fontSize = (CS * 0.42 * kEq) + 'px';
      }
      return;
    }
    if (A.CountVisual && A.CountVisual.fit && l.querySelector('.cv-set')) A.CountVisual.fit(d);
    if (!over(l)) return;
    var k = 1, f0 = textPx(l), minF = minFontFor(l);
    while (over(l) && k > .72 && f0 * k * .92 >= minF) { k *= .92; l.style.setProperty('--cs', (CS * k) + 'px'); }
    if (!over(l)) return;
    d.classList.add('wrap'); k = 1; l.style.removeProperty('--cs');
    while (over(l) && f0 * k * .94 >= minF) { k *= .94; l.style.setProperty('--cs', (CS * k) + 'px'); }
    if (over(l)) {
      d.classList.add('wrap');
      l.style.overflowWrap = 'anywhere';
    }
    if (over(l) && minF > MIN_FONT) {
      minF = MIN_FONT;
      while (over(l) && f0 * k * .94 >= minF) { k *= .94; l.style.setProperty('--cs', (CS * k) + 'px'); }
    }
    if (over(l)) d.classList.add('tight');   // still too big at the minimum size (caller can test for .tight)
    // Subpixel / line-box can report 1–2px of scroll overflow even when the
    // phrase fits in the tile. Grow the label box (capped to the cell) so
    // scrollWidth/Height <= clientWidth/Height.
    if (l.scrollHeight > l.clientHeight && l.scrollHeight <= l.clientHeight + 2 && l.scrollHeight <= d.clientHeight) {
      l.style.minHeight = l.scrollHeight + 'px';
    }
    if (l.scrollWidth > l.clientWidth && l.scrollWidth <= l.clientWidth + 2 && l.scrollWidth <= d.clientWidth) {
      l.style.minWidth = l.scrollWidth + 'px';
    }
    if (!over(l)) d.classList.remove('tight');
  }
  function fitCells() { cellEls.forEach(fitCell); }
  function xy(p, dx) { return 'translate(' + (p.c * (CW + GAP) + (CW - CS) / 2 + (dx || 0)) + 'px,' + (p.r * (CS + GAP)) + 'px)'; }
  function place(anim) {
    var els = PL.map(function (p) { return p.el; }).concat([grumEl, starEl]).filter(Boolean);
    if (!anim) els.forEach(function (e) { e.style.transition = 'none'; });
    var same = TWO && PL[0].pos.r === PL[1].pos.r && PL[0].pos.c === PL[1].pos.c;
    PL.forEach(function (pl) { if (!pl.el) return; pl.el.style.transform = xy(pl.pos, same ? (pl.i ? -1 : 1) * CS * .2 : 0); pl.el.classList.toggle('shared', same); });
    if (G.grum && grumEl) grumEl.style.transform = xy(G.grum);
    if (starEl) { starEl.style.display = B.cell >= 0 ? 'block' : 'none'; if (B.cell >= 0) starEl.style.transform = xy({ r: Math.floor(B.cell / COLS), c: B.cell % COLS }); }
    cellEls.forEach(function (e, i) { e.classList.toggle('here', PL.some(function (pl) { return i === pl.pos.r * COLS + pl.pos.c; })); });
    if (!anim) { void board.offsetWidth; els.forEach(function (e) { e.style.transition = ''; }); }
  }
  function anim(pl, cls, ms) { A.Blobs.anim(pl.el, cls, ms); }
  function renderHearts(lost, gained) {
    var h = $('#hearts'); h.className = 'hearts'; h.innerHTML = '';
    if (GENTLE && !TWO) { h.classList.add('gentle'); h.setAttribute('aria-hidden', 'true'); return; }   // gentle: no hearts to lose
    for (var i = 0; i < 3; i++) { var s = document.createElement('span'); s.innerHTML = HEART; var sv = s.firstChild; if (i >= G.hearts) sv.classList.add('gone'); if (lost && i === G.hearts) sv.classList.add('pop'); if (gained && i === G.hearts - 1) sv.classList.add('gainone'); h.appendChild(sv); }
    if (G.freeMax && !TWO) for (var f = 0; f < G.freeMax; f++) { var fb = document.createElement('i'); fb.className = 'freetry' + (f < G.free ? '' : ' used'); fb.innerHTML = document.body.classList.contains('s2-fighting') ? '?' : (A.Icons ? A.Icons.html('💡', { size: 32, decorative: true, cls: 'pp-pic', slot: 'munch:freetry' }) : ''); fb.title = 'Free tries: an oops gives a hint and keeps your hearts'; h.appendChild(fb); }
  }
  // after9 hint-before-heart: the first oops on a board keeps the hearts and makes a right snack near the player glow
  function freeHint(pl) {
    pl.freeHinted = true; var best = -1, bd = 1e9;
    G.cells.forEach(function (c, i) { if (!c.ok || c.eaten || (TWO && c.owner !== pl.i)) return; var d = Math.abs(Math.floor(i / COLS) - pl.pos.r) + Math.abs(i % COLS - pl.pos.c); if (d < bd) { bd = d; best = i; } });
    cellEls.forEach(function (e) { e.classList.remove('nudge'); }); if (best >= 0) cellEls[best].classList.add('nudge');
    setTimeout(function () { if (!G.active) return; bubble('Free try! No heart lost. Try the glowing one!'); fbSay(talk(['coach_easy_one'], false)); }, 1500);
  }
  function bubble(t) { var b = $('#bubble'); $('#bubbleMsg').textContent = t; b.classList.remove('say'); void b.offsetWidth; b.classList.add('say'); fitBubble(); }
  function fitBubble() {
    var bottom = document.querySelector('#game .bottom') || document.querySelector('.bottom');
    var msg = $('#bubbleMsg');
    var box = $('#bubble') || document.querySelector('.bubble');
    if (!bottom || !msg || !box) return;
    var wrapH0 = wrap ? wrap.clientHeight : 0;
    var long = (msg.textContent || '').length > 32 || msg.scrollHeight > msg.clientHeight + 1 || bottom.scrollHeight > bottom.clientHeight + 1;
    bottom.classList.toggle('has-longmsg', !!long);
    void bottom.offsetHeight;
    var fs = parseFloat(window.getComputedStyle(box).fontSize) || 16, guard = 0;
    while (guard++ < 10 && bottom.scrollHeight > bottom.clientHeight + 1 && fs > 13) {
      fs -= 1;
      box.style.fontSize = fs + 'px';
    }
    // A long hint can shrink #boardWrap after the first layout; size tiles again.
    if (wrap && !fitBubble._relayout && wrapH0 && Math.abs(wrap.clientHeight - wrapH0) > 2) {
      fitBubble._relayout = true;
      layout();
      fitBubble._relayout = false;
    }
  }
  // talk(): the bubble always shows the words; the voice follows the player's "How much talking" setting (A.Talk). kind defaults to chatter (Full only).
  function talk(parts, show, kind) { if (show !== false) bubble(V.text(parts)); return V.say(parts, { kind: kind || 'chatter' }); }
  V.ownBubble = true;   // Munch has its own food-friend bubble (#bubble): no extra friendBubble
  var skipGuard = 0;
  function armSkipGuard() { skipGuard = Date.now() + 500; }
  function blocked() {
    // Stage may move/remove a body-appended overlay without going through close(); don't let a stale flag eat movement keys.
    if (UI.cardOpen && !document.querySelector('.overlay.on, .cutscene')) UI.cardOpen = false;
    return UI.cardOpen || B.open || A.Parent.isOpen() || !!A.$('#gate') || !!A.$('.cutscene') || !!(DEMO && DEMO.on);
  }

  /* ---------- movement & munching ---------- */
  /* munch1122: feedback speech is short (a word tile just says its word: "go", not "That word says go") and a new tap cuts off
     any feedback still playing, so the game never talks over the next choice. Prompts are left alone. */
  var FB = { tok: 0, on: false };
  function fbSay(p) { var t = ++FB.tok; FB.on = true; function end() { if (FB.tok === t) FB.on = false; } if (p && p.then) p.then(end, end); else end(); return p; }
  function cutFb() { if (FB.on) { FB.on = false; FB.tok++; V.stop(); } }
  function shortFact(f) { f = f || []; return f.length > 1 && (f[0] === 'sw_that_says' || f[0] === 'w_thats') ? f.slice(1) : f; }
  var TAP_MIN = 60;
  function pressCell(el) {
    if (!el) return;
    cellEls.forEach(function (x) { x.classList.remove('press'); });
    el.classList.add('press');
    setTimeout(function () { if (el) el.classList.remove('press'); }, 160);
  }
  function cellTargets() {
    var slop = (A.Kit && A.Kit.tapSlop) ? A.Kit.tapSlop() : 28;
    return cellEls.map(function (el, i) {
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return null;
      return { i: i, el: el, x: r.left + r.width / 2, y: r.top + r.height / 2, r: Math.max(Math.max(r.width, r.height) / 2 + slop, TAP_MIN / 2) };
    }).filter(Boolean);
  }
  function pickCellAt(x, y) {
    var t = (A.Kit && A.Kit.nearest) ? A.Kit.nearest(x, y, cellTargets()) : null;
    if (t) return t;
    var n = document.elementFromPoint(x, y);
    var el = n && n.closest ? n.closest('#board .cell') : null;
    var i = el ? cellEls.indexOf(el) : -1;
    return i >= 0 ? { i: i, el: el } : null;
  }
  function onBoardPointer(e) {
    if (!G.active || blocked()) return;
    var t = pickCellAt(e.clientX, e.clientY);
    if (!t) return;
    pressCell(t.el);
    onCellTap(t.i);
  }
  function onCellTap(i) { // mouse / touch: Player 1 only
    var pl = PL[0];
    if (!G.active || blocked()) return;
    cutFb();
    var r = Math.floor(i / COLS), c = i % COLS;
    if (r === pl.pos.r && c === pl.pos.c) { if (!pl.target) munch(0); return; }
    pl.target = { r: r, c: c }; if (!pl.walkT) step(pl);
  }
  function step(pl) {
    pl.walkT = null; var t = pl.target; if (!t || !G.active || blocked()) return;
    var p = pl.pos;
    if (p.c !== t.c) p.c += (t.c > p.c ? 1 : -1); else if (p.r !== t.r) p.r += (t.r > p.r ? 1 : -1);
    moved(pl);
    if (p.r === t.r && p.c === t.c) pl.target = null; else pl.walkT = setTimeout(function () { step(pl); }, 200);
  }
  function moveBy(i, dr, dc) {
    var pl = PL[i]; if (!pl || !G.active || blocked()) return;
    pl.target = null; clearTimeout(pl.walkT); pl.walkT = null;
    var r = pl.pos.r + dr, c = pl.pos.c + dc;
    if (r < 0 || c < 0 || r >= ROWS || c >= COLS) { anim(pl, 'squish', 400); SFX.bump(); return; }
    pl.pos.r = r; pl.pos.c = c; moved(pl);
  }
  function moved(pl) { place(true); anim(pl, 'hop', 230); SFX.step(); checkBump(); checkStar(pl); poke(); }
  // Idle pointing hand (same art as Packer) after a few quiet seconds, aimed at a matching tile.
  var IDLE_MS = 6000;
  var HAND_SVG = '<svg class="mm-hand-svg" viewBox="0 0 64 64" width="64" height="64" aria-hidden="true" focusable="false"><path fill="#ffe0b0" stroke="#5a3d1c" stroke-width="2.4" stroke-linejoin="round" d="M28 8c2.4-1 5.4.4 6.2 3.2l3.2 12.2 1.2-6.2c.7-3 4-4.2 6.4-2.6 2 1.3 2.6 4 1.6 6.3l-3.4 8.2 6.4-3c2.6-1.2 5.8.2 6.6 3 .8 2.8-.8 5.6-3.6 6.5L38 40.2l1.2 14.4c.2 2.6-1.8 4.8-4.4 4.8h-8.2c-2.2 0-4-1.6-4.4-3.8L19.6 40.6c-3.6-2.2-5.8-6.2-5.8-10.5V22c0-2.8 2.4-5 5.2-4.8 2.2.2 4 2 4.4 4.2l1.2 6.2V12.4C24.6 10 26.2 8.4 28 8z"/><circle cx="24.5" cy="18.5" r="1.6" fill="#5a3d1c"/><circle cx="31.5" cy="17.5" r="1.6" fill="#5a3d1c"/><path d="M24 23.5c2 2 6.6 2 8.4 0" fill="none" stroke="#5a3d1c" stroke-width="1.8" stroke-linecap="round"/></svg>';
  function hideHand() { var h = document.getElementById('mmHand'); if (h && h.parentNode) h.parentNode.removeChild(h); }
  function nearestGood(pl) {
    var best = -1, bd = 1e9;
    G.cells.forEach(function (c, i) { if (!c.ok || c.eaten || (TWO && c.owner !== pl.i)) return; var d = Math.abs(Math.floor(i / COLS) - pl.pos.r) + Math.abs(i % COLS - pl.pos.c); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  function showIdleHand() {
    if (!G.active || blocked()) return null;
    hideHand();
    var pl = PL[0], best = nearestGood(pl);
    if (best < 0 || !cellEls[best]) return null;
    var host = wrap || board;
    var hand = A.el('<div class="mm-hand" id="mmHand" aria-hidden="true">' + HAND_SVG + '</div>');
    host.appendChild(hand);
    var t = cellEls[best].getBoundingClientRect(), hr = host.getBoundingClientRect();
    var scale = host.offsetWidth ? (hr.width / host.offsetWidth) : 1; if (!scale) scale = 1;
    hand.style.left = ((t.left + t.width * 0.65) - hr.left) / scale + 'px';
    hand.style.top = ((t.top + t.height * 0.15) - hr.top) / scale + 'px';
    return cellEls[best];
  }
  function poke() { clearTimeout(G.idleT); G.idleT = null; hideHand(); if (!G.active) return; G.idleT = setTimeout(function () { if (G.active && !blocked()) showIdleHand(); }, IDLE_MS); }

  function munch(i) {
    var pl = PL[i || 0];
    if (!pl || !G.active || pl.busy || blocked()) return;
    var idx = pl.pos.r * COLS + pl.pos.c, cell = G.cells[idx], el = cellEls[idx];
    poke(); cutFb();
    if (cell.eaten) { fbSay(talk(['munch_already'])); anim(pl, 'hop', 230); return; }
    if (TWO && cell.owner !== pl.i) { SFX.soft(); anim(pl, 'squish', 400); fbSay(talk(['munch_not_yours', nameParts(PL[cell.owner].P)])); return; }
    if (pl.done) return;
    var sid = pl.round.skill.id, P = pl.P;
    pl.busy = true; setTimeout(function () { pl.busy = false; }, 460);
    pl.el.classList.remove('happy', 'wobble');
    anim(pl, 'chomp', 460); SFX.chomp();
    if (cell.ok) {
      cell.eaten = true; pl.correct++; pl.remaining--; var sig = C.recordAnswer(P, sid, true, ansOpt(pl, cell)); A.Pad.rumble(pl.i, 'light');
      // batch1: 3 right munches in a row give a lost heart back (max 3)
      if (!TWO && !GENTLE && !G.noRegen) { G.run = (G.run || 0) + 1; if (G.run >= (A.MUNCH_REGEN || 3)) { G.run = 0; if (G.hearts < 3) { G.hearts++; renderHearts(false, true); } } }
      setTimeout(function () { el.classList.add('eaten'); }, 160);
      setTimeout(function () { anim(pl, 'happy', 1000); }, 200); SFX.yay();
      var rc = el.getBoundingClientRect(); UI.sparkle(rc.left + rc.width / 2, rc.top + rc.height / 2); UI.plusText(rc.left + rc.width / 2, rc.top + rc.height * .3, '+1');
      el.classList.add('yum'); setHost('happy');
      // 2026-10-22 voice: no spoken praise after a right answer (the chomp + yay sounds and a short text bubble instead).
      // Word-reading skills still say the word: sight-word "listen" rounds in every mode but Off, other word skills where a pre-reader needs it.
      var praise = praiseFor(pl, cell) || YUM_TEXT[(pl.correct + pl.i) % YUM_TEXT.length];
      G.lastFact = cell.fact || [];   // the number fact stays behind the Hear button (not spoken mid-choice)
      // Word-reading (cloze, picture, or listen): say the word after a right munch. Speech is optional; the prompt stays visual.
      // Pre-readers also hear the word on a right munch (and again on Hear) for rhyme / start / sight / letter boards.
      var pre = A.MunchRules && A.MunchRules.littleReader ? A.MunchRules.littleReader(pl.P) : (A.Age && A.Age.of && A.Age.of(pl.P) < 6);
      var wordSay = (cell.name && cell.name.length) ? cell.name : (cell.fact && cell.fact.length ? shortFact(cell.fact) : null);
      if (wordSay && (pl.rule.listen || pl.rule.cloze || pl.rule.pic || (pre && (pl.rule.reading || pl.rule.sayWord)))) {
        G.lastFact = wordSay;
        fbSay(V.say(shortFact(wordSay), { kind: 'listen', bubble: false }));
      }
      if (pl.remaining <= 0) {
        pl.done = true; pl.doneAt = Date.now();
        if (TWO) { if (MODE === 'versus' && !PL.some(function (o) { return o !== pl && o.done; })) G.winner = pl.i; praise = V.text(['munch_all_done']); setTimeout(function () { anim(pl, 'dance', 1600); }, 500); }
      }
      bubble(praise);
      renderRule(); renderSide(); coachAfter(pl, sig, cell);
      if (PL.every(function (p) { return p.done; })) { endRound('done'); } else maybeBonus();
    } else {
      var wsig = null;
      G.run = 0;
      if (!cell.tried) { cell.tried = true; pl.wrong++; wsig = C.recordAnswer(P, sid, false, ansOpt(pl, cell)); if (!TWO) { if (!GENTLE) { if (G.free > 0) { G.free--; renderHearts(); freeHint(pl); } else { G.hearts--; renderHearts(true); } } pl.lastMiss = cell; if (pl.wrong === 1 || pl.rule.stepHint) renderRule(); } diagnoseMiss(pl, cell); }
      el.classList.add('tried'); el.classList.remove('nope'); void el.offsetWidth; el.classList.add('nope');
      markWhy(el, pl, cell); setHost(pl.wrong >= 2 ? 'think' : 'oops');
      setTimeout(function () { pl.el.classList.remove('chomp'); anim(pl, 'wobble', 800); }, 140); SFX.oops();
      // word-reading rules: say the re-prompt, but don't print it (the bubble would show the answer's spelling)
      // the oops sound + bubble always; the fact / right word is spoken where the setting allows it ("listen" rounds: every mode but Off)
      G.lastFact = cell.fact || [];   // fact is available on Hear only, so it does not talk while the kid is still choosing
      if (pl.rule.listen || pl.rule.noPrint) { fbSay(V.sayMix([[['fb_oops'], 'chatter']])); bubble('Oops! Listen again, then try another one.'); }
      else { var oo = [nearMiss(pl, cell) ? 'fb_so_close' : 'fb_oops']; bubble(V.text(oo)); fbSay(V.sayMix([[oo, 'chatter']])); }
      if (!TWO && !GENTLE && G.hearts <= 0) { G.active = false; stopTimer(); stopGrumbly(); setTimeout(function () { (wsig && wsig.worked ? workedExample(pl) : Promise.resolve()).then(outOfHearts); }, 2400); }
      else coachAfter(pl, wsig, cell);
    }
    A.Store.save();
  }
  /* coach v2 error diagnosis: tag the wrong answer (teen reversal, off by one, b/d, wrong operation, look-alike word…),
     record it, and show its mini-lesson (non-blocking, once per type per round); the worked example then uses it too */
  function diagnoseMiss(pl, cell) {
    if (!A.Coach || !A.Coach.diagnose || pl.P.guest) return null;
    var r = pl.rule, say = r.say || [], nums = say.filter(function (x) { return typeof x === 'number'; }), good = G.cells.filter(function (c) { return c.ok && (!TWO || c.owner === pl.i); })[0] || {};
    var ctx = { chosen: cell.label, answer: typeof r.target === 'string' ? r.target : r.wp ? String(r.wp.ans) : nums.length ? String(nums[nums.length - 1]) : good.label };
    if (r.wp) { ctx.op = r.wp.op; ctx.a = r.wp.a; ctx.b = r.wp.b; ctx.target = r.wp.ans; ctx.em = r.wp.em; }
    var d = A.Coach.diagnose(pl.P, pl.round.skill.id, ctx); if (!d) return null;
    pl.diag = d; pl.diagSeen = pl.diagSeen || {};
    if (!TWO && !pl.diagSeen[d.type]) { pl.diagSeen[d.type] = 1; setTimeout(function () { if (G.active) { UI.diagHint(d); if (d.hint.say) talk(d.hint.say, false); } }, 1300); }
    return d;
  }
  /* ---------- coaching (js/core/coach.js) ----------
     item ids: a story passage, a homophone sentence, a word-reading target, else the cell itself (a fact like "3 + 4" or a number) */
  function itemKey(pl, cell) {
    var r = pl.rule;
    if (r.rc) return r.rc;
    if (r.hom != null) return 'hom_' + r.hom;
    if (typeof r.target === 'string' && !/^(verb|noun)$/.test(r.target)) return r.target;
    return cell.label;
  }
  function ansOpt(pl, cell) {
    var t = Date.now(), ms = t - (pl.lastAns || G.t0); pl.lastAns = t;
    var timed = !A.Age.little(pl.P);   // no fluency timing at 4 and under (A.Age)
    var o = { key: itemKey(pl, cell), hint: pl.wrong > 0 || !!pl.workedShown, ms: ms, fast: timed && ms < FAST_MS };
    var f = pl.round && pl.round.first; if (f && f.length < 10) f.push({ ok: !!cell.ok, ms: ms, help: !!pl.workedShown || !!pl.easedOff, timed: timed });   // fast-track evidence
    return o;
  }
  /* ---------- several boards per level (ux3a) ----------
     A Free Play level is A.Age.boards() boards in a row (2 at ages 4-5, 2-3 at 6-7, 3 at 8+), each with A.Age.cellsPerBoard() snacks.
     A cleared board slides in a fresh grid ("Board 2 of 3"); hearts refill to 3 on every new board (design2) and the clock gets the
     new board's time added. The level is scored once, over all boards (curriculum-math.js finishRound: 12+ answers at 85%+, or fast track). */
  function setupBoards(pl) {
    var r = pl.round; if (!r) return;
    var multi = !TWO && !STORY && !r.review && !r.testOut && !r.placement && !r.dropBack && !r.check && !r.topic && !r.story && !r.challenge && !pl.P.guest;
    r.boards = multi ? A.Age.boards(pl.P, r.level, r.skill.levels.length - 1) : 1; r.board = 1;
    r.tot = { correct: 0, wrong: 0, nOk: 0, hinted: false }; r.first = []; r.folded = false; r.fastTrack = false;
  }
  // 8 of the first 10 right, no worked example / ease-off help, quick answers (median under FAST_MS; never at 4 and under)
  function first10(pl) {
    var f = (pl.round && pl.round.first) || [], ms = f.map(function (x) { return x.ms; }).sort(function (a, b) { return a - b; });
    var med = ms.length ? (ms[(ms.length - 1) >> 1] + ms[ms.length >> 1]) / 2 : 1e9;
    return { n: f.length, right: f.filter(function (x) { return x.ok; }).length, hinted: f.some(function (x) { return x.help; }), fast: f.length > 0 && f.every(function (x) { return x.timed; }) && med < FAST_MS };
  }
  function fastNow(pl) { var f = first10(pl); return f.n >= 10 && f.right >= C.LEVEL_RULE.fastRight && !f.hinted && f.fast && C.state(pl.P, pl.round.skill.id).level === pl.round.level && !C.state(pl.P, pl.round.skill.id).lvN && C.fastOk(pl.P, pl.round.skill.id); }
  // fold the earlier boards into the player's counts, so the level is scored (and starred) as a whole
  function foldBoards(pl) { var r = pl.round, t = r && r.tot; if (!t || r.folded) return; r.folded = true; pl.correct += t.correct; pl.wrong += t.wrong; pl.nOk += t.nOk; }
  function nextBoard() {
    var pl = PL[0], r = pl.round;
    G.active = false; stopGrumbly(); clearTimeout(G.idleT);
    r.tot.correct += pl.correct; r.tot.wrong += pl.wrong; r.tot.nOk += pl.nOk; r.tot.hinted = r.tot.hinted || pl.wrong > 0 || !!pl.workedShown;
    r.board++;
    var hearts = 3;   // design2: every new board starts with all 3 hearts again
    SFX.yay(); var doneSaid = talk(['munch_all_done']), bn = r.board;
    var t = A.el('<div class="boardToast" role="status">Board ' + r.board + ' of ' + r.boards + '</div>'); document.body.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 500); }, 1700);
    setTimeout(function () {
      buildLevel(true); G.hearts = hearts;
      wrap.classList.remove('slidein'); void wrap.offsetWidth; wrap.classList.add('slidein');
      renderBoard(); renderHearts(); G.active = true;
      // the bubble still says "All done!" from the board that just ended: reset it for the new board, and say its new rule
      bubble('Board ' + r.board + ' of ' + r.boards + '!');
      var rule = $('#rule'); rule.classList.remove('pop'); void rule.offsetWidth; rule.classList.add('pop');
      Promise.resolve(doneSaid).then(function () {
        if (!(G.active && r.board === bn && PL[0].round === r)) return;
        speakBoardRule(true);
        if (shouldDemo(PL[0])) return runDemo(PL[0]);
      }).then(function () { if (G.active && r.board === bn && PL[0].round === r) poke(); });
      if (T.on) { var add = Math.round(secondsFor(pl)); T.left += add; T.limit = Math.max(T.limit, T.left); T.low = false; renderTimer(); }
    }, 900);
  }
  var FAST_MS = 4500;   // walk + munch: a "fast" answer in Munch
  function coachAfter(pl, sig, cell) {
    if (!sig || TWO || !G.active) return;
    var P = pl.P, sid = pl.round.skill.id;
    // batch1 (plan P1): no "N in a row" celebrations (a run you can lose is pressure); hearts come back after 3 right instead
    if (sig.easeOff) easeOff(pl);
    if (sig.worked) { workedExample(pl); return; }
    if (sig.speedy) { UI.rain(50); SFX.yay(); fbSay(talk(['st_speedy'])); }
    if (sig.speedUp && !pl.round.testOut && !pl.round.review) { C.state(P, sid).offerTestOut = true; talk(['coach_test_out']); }
    // re-ask: a cell munched by mistake comes back 2-3 munches later (judge it again: leaving it is the right answer)
    var k = A.Coach && A.Coach.reaskDue(P, sid);
    if (k != null) {
      A.Coach.reaskTake(P, k);
      G.cells.forEach(function (c, i) { if (c.tried && !c.eaten && itemKey(pl, c) === k) { c.tried = false; c.again = true; cellEls[i].classList.remove('tried'); cellEls[i].classList.add('again'); } });
    }
  }
  function celebrateStreak(n) {
    UI.rain(40); SFX.yay();
    var b = $('#bubble'), r = b.getBoundingClientRect(); UI.plusText(r.left + r.width / 2, r.top, '⭐ ' + n + ' in a row!');
    talk([n >= 10 ? 'coach_streak10' : 'coach_streak5']); $('#bubble').classList.add('streak'); setTimeout(function () { $('#bubble').classList.remove('streak'); }, 2600);
  }
  // 2 misses in a row: show the strategy hint and make an easy / already-known snack glow next to the player
  function easeOff(pl) {
    pl.easedOff = true; renderRule();
    var K = A.Coach, sid = pl.round.skill.id, best = -1, bd = 1e9;
    G.cells.forEach(function (c, i) {
      if (!c.ok || c.eaten) return;
      var known = K && K.item(pl.P, sid, itemKey(pl, c)).b >= 3, d = Math.abs(Math.floor(i / COLS) - pl.pos.r) + Math.abs(i % COLS - pl.pos.c) - (known ? 3 : 0);
      if (d < bd) { bd = d; best = i; }
    });
    cellEls.forEach(function (e) { e.classList.remove('nudge'); });
    if (best >= 0) cellEls[best].classList.add('nudge');
    setTimeout(function () { fbSay(talk(['coach_easy_one'], false)); bubble(pl.rule.hint ? 'Hint: ' + pl.rule.hint.replace(/<[^>]+>/g, '') : 'Try the glowing one!'); }, 1500);
  }
  // 3 misses in a row: a short worked example (number line / count-on dots, sound it out, or the answer sentence highlighted)
  function workedHtml(pl) {
    if (pl.rule.worked) return pl.rule.worked(pl.lastMiss);   // v2p2a: a fresh, similar fact walked through (strategy, then the answer)
    var dg = pl.diag && pl.diag.hint ? pl.diag.hint.html(pl.diag.ctx) : '';
    if (pl.rule.wp) { var w = pl.rule.wp; return dg + '<div class="worked story-math">' + A.Coach.HINTS.story_picture.html({ op: w.op, a: w.a, b: w.b, em: w.em }) + '<p class="wa">' + w.a + (w.op === '+' ? ' + ' : ' − ') + w.b + ' = <b>' + w.ans + '</b></p></div>'; }
    if (dg) return dg + workedHtml0(pl);
    return workedHtml0(pl);
  }
  // Prefer an adding / take-away tile for the walkthrough so mixed "equals N" boards
  // (which also show the numeral) still get a number line and count-on dots.
  function exampleCell() {
    var goods = G.cells.filter(function (c) { return c.ok; });
    var eq = goods.filter(function (c) { return /^\d+\s*[+−]\s*\d+$/.test(String(c.label || '')); });
    return eq[0] || goods[0] || {};
  }
  function workedHtml0(pl) {
    var r = pl.rule, good = exampleCell(), lab = String(good.label || ''), m;
    if (r.rc) {
      var pass = (r.text.match(/<span class="ea-story">([\s\S]*?)<\/span>/) || [])[1] || '', sents = pass.match(/[^.!?]+[.!?]+/g) || [pass];
      var aw = String(r.target).toLowerCase().match(/[a-z']+/g) || [], qw = String(r.q || '').toLowerCase().match(/[a-z']+/g) || [];
      var score = function (t) { var w = t.toLowerCase(); return aw.filter(function (x) { return x.length > 2 && w.indexOf(x) >= 0; }).length * 2 + qw.filter(function (x) { return x.length > 3 && w.indexOf(x) >= 0; }).length; };
      var bi = 0; sents.forEach(function (t, i) { if (score(t) > score(sents[bi])) bi = i; });
      return '<div class="worked story"><p>' + sents.map(function (t, i) { return i === bi ? '<mark>' + t.trim() + '</mark>' : t.trim(); }).join(' ') + '</p>' +
        '<p class="wq">' + A.esc(r.q || '') + '</p><p class="wa">The clue is in the <mark>yellow</mark> sentence → <b>' + A.esc(r.target) + '</b></p></div>';
    }
    if ((m = /^(\d+) ([+−]) (\d+)$/.exec(lab))) {
      var a = +m[1], b = +m[3], plus = m[2] === '+', res = plus ? a + b : a - b, hi = Math.max(a, res), dots = '';
      for (var i = 0; i < (plus ? a + b : a); i++) dots += '<i class="' + (plus ? (i < a ? 'a' : 'b') : (i < res ? 'a' : 'x')) + '"></i>';
      var line = ''; for (var n = 0; n <= Math.max(10, hi); n++) line += '<span class="' + (n === a ? 'st' : '') + (plus ? (n > a && n <= res ? ' hop' : '') : (n < a && n >= res ? ' hop' : '')) + (n === res ? ' end' : '') + '">' + n + '</span>';
      return '<div class="worked math"><div class="wdots">' + dots + '</div><div class="nline">' + line + '</div><p class="wa">Start at <b>' + a + '</b>, ' + (plus ? 'count on' : 'hop back') + ' <b>' + b + '</b>: ' +
        (function () { var o = []; for (var j = 1; j <= b; j++) o.push(plus ? a + j : a - j); return o.join(', '); })() + ' → <b>' + lab + ' = ' + res + '</b></p></div>';
    }
    if (/^\d+$/.test(lab)) return '<div class="worked math"><div class="wbig">' + lab + '</div><div>' + C.frame(Math.min(+lab, 10)) + (+lab > 10 ? C.frame(+lab - 10) : '') + '</div><p class="wa">Look for <b>' + lab + '</b>!</p></div>';
    if (/^[a-z']+$/i.test(lab)) return '<div class="worked word"><div class="sound">' + lab.split('').map(function (ch) { return '<span>' + A.esc(ch) + '</span>'; }).join('<i>·</i>') + '</div><p class="wa">Sound it out, then say it fast: <b>' + A.esc(lab) + '</b></p></div>';
    return '<div class="worked"><div class="wbig">' + (good.html || A.esc(lab)) + '</div><p class="wa">This one fits: <b>' + A.esc(lab) + '</b></p></div>';
  }
  function workedExample(pl) {
    if (pl.workedOpen) return Promise.resolve(); pl.workedOpen = true; pl.workedShown = true;
    var good = exampleCell(), voice = ['coach_watch_me'].concat(pl.rule.rc ? pl.rule.say : (good.fact || []));
    return showBoardHint({
      tag: "Let's do one together",
      html: workedHtml(pl),
      btn: 'Got it!',
      voice: voice,
      cell: good
    }).then(function () { pl.workedOpen = false; });
  }
  function nearMiss(pl, cell) {
    var say = pl.rule.say, t = say[say.length - 1], f = cell.fact, v = f[f.length - 1];
    return (say[0] === 'munch_rule_make' || say[0] === 'munch_rule_number' || say[0] === 'munch_rule_missing') && typeof t === 'number' && typeof v === 'number' && Math.abs(v - t) === 1 && f.indexOf('w_not') < 0;
  }

  /* ---------- bonus star + question ---------- */
  function maybeBonus() {
    if (B.shown || B.used || B.plannedAt < 0 || !G.active || (PL[0].round && PL[0].round.challenge) || (window.__munch && window.__munch.noBonus)) return;
    var used = T.on ? 1 - T.left / T.limit : 0, munched = PL.reduce(function (s, p) { return s + p.correct; }, 0);
    if (T.on ? (used >= B.plannedAt && munched >= 1) : munched >= 2) showStar();
  }
  function showStar(at) {
    var free = []; G.cells.forEach(function (c, i) { if (!PL.some(function (pl) { return pl.pos.r * COLS + pl.pos.c === i; })) free.push(i); });
    if (!free.length) return;
    B.cell = at != null ? at : A.pick(free); B.shown = true; place(false); SFX.sparkle();
    starEl.classList.remove('pop'); void starEl.offsetWidth; starEl.classList.add('pop');
    if (!V.isSpeaking()) fbSay(talk(['munch_bonus_star'])); else bubble('Ooh, a bonus star! Walk onto it!');
  }
  function checkStar(pl) { if (B.cell >= 0 && !B.open && pl.pos.r * COLS + pl.pos.c === B.cell) { B.cell = -1; B.used = true; place(true); openBonus(pl); } }
  function openBonus(pl) {
    var q = A.BonusQ.pick(pl.P), order = A.shuffle(q.choices.map(function (c, i) { return i; }));
    B.open = true; B.q = q; B.order = order; B.sel = -1; B.pl = pl; B.answered = false; B.t0 = Date.now();
    V.stop(); SFX.bonus(); A.Store.save();
    var keys = TWO ? (pl.i ? '<kbd>A</kbd><kbd>D</kbd> choose · <kbd>F</kbd> pick' : '<kbd>←</kbd><kbd>→</kbd> choose · <kbd class="wide">Space</kbd> pick') : '<kbd>←</kbd><kbd>→</kbd> choose · <kbd class="wide">Space</kbd> pick · <kbd>R</kbd> hear again';
    var ov = A.el('<div class="overlay on bonusq" role="dialog" aria-modal="true"><div class="card">' +
      '<span class="tag">✨ Bonus question' + (TWO ? ' for ' + A.esc(pl.name) : '') + '</span>' +
      (TWO ? '<span class="mini who p' + (pl.i + 1) + '">' + A.Blobs.forProfile(pl.P) + '</span>' : '') +
      '<h2 class="qq">' + A.esc(q.q) + ' <button class="speak sm" data-again aria-label="Hear it again">🔊</button></h2>' +
      '<div class="choices n' + order.length + '">' + order.map(function (ci, k) { var c = q.choices[ci]; var em = A.Icons ? A.Icons.html(c.emoji, { size: 64, decorative: true, cls: 'pp-pic', context: 'quiz', word: c.text }) : c.emoji; return '<button class="choice" data-k="' + k + '"><span class="em"' + (c.size ? ' style="font-size:' + c.size + 'em"' : '') + '>' + em + '</span><span class="lb">' + A.esc(c.hideText ? '' : c.text) + '</span></button>'; }).join('') + '</div>' +
      '<div class="res" aria-live="polite"></div><span class="kh">' + (A.isTouchOnly() ? 'Tap your answer' : keys) + '</span><span class="ph">' + A.Pad.g('dpad') + ' choose · ' + A.Pad.g('a') + ' answer</span></div></div>');
    document.body.appendChild(ov); B.el = ov; UI.cardOpen = true;
    A.$$('.choice', ov).forEach(function (b) { b.addEventListener('click', function () { answer(+b.dataset.k); }); b.addEventListener('pointerenter', function () { if (!B.answered) select(+b.dataset.k); }); });
    ov.querySelector('[data-again]').addEventListener('click', function (e) { e.stopPropagation(); readQuestion(true); });
    // batch-1107c: tap outside the card to skip the bonus question (nothing recorded)
    UI.skipOutside(ov, function () { if (!B.open || B.answered) return; B.answered = true; B.readTok++; V.stop(); ov.remove(); B.el = null; B.open = false; UI.cardOpen = !!document.querySelector('.overlay.on'); poke(); });
    readQuestion();   // no choice highlighted until a tap / arrow / hover
  }
  function readQuestion(all) {
    var q = B.q, tok = (B.readTok = (B.readTok || 0) + 1);
    var qk = all ? 'tap' : q.listen ? 'listen' : 'prompt';
    V.sayMix([[['bonus_title'], 'chatter'], [(all && q.partsAll) || q.parts || [q.line], qk]]).then(function () {
      var chain = Promise.resolve();
      B.order.forEach(function (ci, k) {
        chain = chain.then(function () { if (tok !== B.readTok || B.answered || !B.open) return; B.el.querySelectorAll('.choice')[k].classList.add('reading'); return V.say(q.choices[ci].parts || [q.choices[ci].line], { kind: all ? 'tap' : 'target', bubble: false }).then(function () { var b = B.el && B.el.querySelectorAll('.choice')[k]; if (b) b.classList.remove('reading'); }); });
      });
    });
  }
  function select(k) { if (!B.el) return; B.sel = (k + B.order.length) % B.order.length; A.$$('.choice', B.el).forEach(function (b, i) { b.classList.toggle('sel', i === B.sel); }); }
  function answer(k) {
    if (!B.open || B.answered || Date.now() - (B.t0 || 0) < A.Pace.CFG.FRESH_Q) return; B.answered = true; B.readTok++; V.stop();
    var q = B.q, ci = B.order[k], right = ci === q.answer, btns = A.$$('.choice', B.el), pl = B.pl, b = pl.P.bonus;
    if (q.skill && !pl.P.guest) C.recordAnswer(pl.P, q.skill, right);   // a skill question also counts toward that skill
    btns.forEach(function (x, i) { x.classList.remove('reading'); x.classList.toggle('right', B.order[i] === q.answer); x.classList.toggle('picked', i === k); x.disabled = true; });
    var res = B.el.querySelector('.res'), voice;
    if (right) {
      b.right = (b.right || 0) + 1; SFX.win(); UI.rain(28);
      var rb = btns[k].getBoundingClientRect(); UI.sparkle(rb.left + rb.width / 2, rb.top + rb.height / 2);
      if (T.on) { res.textContent = 'You got it! +15 seconds!'; voice = ['bonus_right']; B.bonusTime = 15; }
      else { res.textContent = 'You got it! A bonus star!'; voice = ['bonus_right_star']; B.bonusTime = 0; if (!pl.P.guest) pl.bonusStar = true; }   // design2: added to the round's stars at the end (capped at 3, needs 1+ earned star)
      voice = [[voice, 'chatter']];   // no spoken praise unless Full (the card shows it)
      if (q.fact && q.fact.length && (q.listen || q.cloze || q.pic || q.fact[0] === 'sw_that_says' || q.fact[0] === 'w_thats')) voice.unshift([shortFact(q.fact), 'listen']);
      res.className = 'res good';
    } else {
      SFX.soft(); btns[k].classList.add('nope'); B.bonusTime = 0;
      res.textContent = 'Good try! The answer is ' + q.choices[q.answer].text + '.'; res.className = 'res gentle';
      // a skill question says its fact ("That says said"), never the (silent) answer choices themselves
      voice = [[['bonus_wrong'], 'chatter'], [q.cat === 'skill' ? q.fact || [] : q.choices[q.answer].parts || [q.choices[q.answer].line], q.listen ? 'listen' : 'answer']];
    }
    A.Store.save();
    var closed = false, nb = A.el('<button class="bigbtn mint pace-next" data-next>Next ▶</button>');
    res.insertAdjacentElement('afterend', nb);
    // the beat: a right answer shows a moment, a "good try" (with the answer) long enough to read (js/core/pace.js)
    var L = A.Pace.lock(nb, right ? A.Pace.ms('RESULT') : A.Pace.ms('HINT', res.textContent), 'munch:bonus'); B.el.__pace = L;
    function close(auto) { if (closed || !B.el || (!auto && !L.ready())) return; closed = true; clearTimeout(L.timer); document.removeEventListener('keydown', onKeyAfter, true); B.el.remove(); B.el = null; B.open = false; UI.cardOpen = !!document.querySelector('.overlay.on'); if (B.bonusTime) addTime(B.bonusTime); poke(); }
    function onKeyAfter(e) { if (/^( |Enter|f|F|Escape)$/.test(e.key)) { e.preventDefault(); e.stopPropagation(); if (L.press(e)) close(); } }
    document.addEventListener('keydown', onKeyAfter, true);
    B.el.addEventListener('click', function () { if (L.press(null)) close(); });
    function autoClose() { if (L.ready()) close(true); else setTimeout(autoClose, L.ms - (Date.now() - L.t0) + 400); }
    V.sayMix(voice).then(function () { setTimeout(autoClose, 700); });
    setTimeout(function () { close(true); }, Math.max(6000, L.ms + 1500));
  }
  function bonusKey(e) {
    if (!B.open || B.answered) return false;
    var k = e.key, who = TWO ? B.pl.i : -1;
    var p1 = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }, p2 = { a: -1, A: -1, w: -1, W: -1, d: 1, D: 1, s: 1, S: 1 };
    var mv = (who !== 1 ? p1[k] : undefined) || (who !== 0 ? p2[k] : undefined);
    if (mv) { select(B.sel < 0 ? (mv < 0 ? B.order.length - 1 : 0) : B.sel + mv); SFX.tap(); }
    else if ((who !== 1 && (k === ' ' || k === 'Enter')) || (who !== 0 && (k === 'f' || k === 'F'))) { if (!e.repeat && B.sel >= 0) answer(B.sel); }
    else if (k >= '1' && k <= '4') { if (!e.repeat) answer(Math.min(+k - 1, B.order.length - 1)); }
    else if (k === 'r' || k === 'R') readQuestion();
    else return true;
    e.preventDefault(); return true;
  }

  /* ---------- round end ---------- */
  function timeUp() { if (!G.active) return; SFX.timeup(); endRound('time'); }
  // design2: Gentle Munch (no hearts, no clock) always "finishes", so its stars come from the misses: 0 misses = 3, up to half the
  // snacks = 2, up to one miss per snack = 1, more = 0 (a calm "Nice try!", never a failure screen). A random tapper lands at 0-1.
  function gentleStars(wrong, nOk) { return wrong === 0 ? 3 : wrong <= nOk / 2 ? 2 : wrong <= nOk ? 1 : 0; }
  // the bonus-question star joins the round's stars: only when the round earned 1+ star itself, and never past 3
  function withBonus(st, pl) { var b = pl && pl.bonusStar; if (pl) pl.bonusStar = false; return b && st >= 1 ? Math.min(3, st + 1) : st; }
  function starsFor(correct, wrong, nOk, finished, gentle) {
    if (gentle) return gentleStars(wrong, nOk);
    if (finished) return wrong === 0 ? 3 : wrong <= 2 ? 2 : 1;
    var frac = nOk ? correct / nOk : 0;            // time ran out: stars for what was munched, never zero
    return frac >= .75 && wrong <= 1 ? 2 : 1;
  }
  function endRound(why) {
    if (!G.active) return;
    var r1 = PL[0].round;
    if (!TWO && !STORY && why === 'done' && r1 && r1.boards > 1 && r1.board < r1.boards && !fastNow(PL[0])) return nextBoard();
    if (!TWO && !STORY && r1 && r1.boards > 1) { if (why === 'done' && r1.board < r1.boards) r1.fastTrack = true; foldBoards(PL[0]); }
    G.active = false; stopTimer(); stopGrumbly(); clearTimeout(G.idleT);
    if (STORY) return endStory(false);
    G.lastStars = PL.map(function (pl) { return pl.P.stars; });
    var ms = Math.min(Date.now() - G.t0, 15 * 60000), timeLeftFrac = T.on && T.limit ? T.left / T.limit : 0;
    PL.forEach(function (pl) { pl.target = null; clearTimeout(pl.walkT); });
    // race: nobody finished first -> whoever munched more of their snacks wins (decided before results are saved)
    if (TWO && MODE === 'versus' && G.winner == null) { var f0 = PL[0].nOk ? PL[0].correct / PL[0].nOk : 0, f1 = PL[1].nOk ? PL[1].correct / PL[1].nOk : 0; G.winner = f0 > f1 ? 0 : f1 > f0 ? 1 : null; }
    var res = PL.map(function (pl) {
      var P = pl.P, fin = pl.done, frac = pl.nOk ? pl.correct / pl.nOk : 0, m = P.games.munch;
      G.cells.forEach(function (c) { if (c.again && !c.tried && !c.eaten && (!TWO || c.owner === pl.i)) C.recordAnswer(P, pl.round.skill.id, true, { key: itemKey(pl, c), hint: true }); });
      var out = C.finishRound(P, pl.round, { correct: pl.correct, wrong: pl.wrong, ms: ms, timedOut: !fin, frac: frac, hinted: pl.wrong > 0 || !!pl.workedShown || !!(pl.round.tot && pl.round.tot.hinted), first10: first10(pl), boards: pl.round.board || 1 });
      // adapt the clock: slow-but-accurate gets more time next round; very fast finishes slowly give some back
      var sid = pl.round.skill.id, tb = P.math.timeBoost || (P.math.timeBoost = {}), acc = pl.correct + pl.wrong ? pl.correct / (pl.correct + pl.wrong) : 1;
      if (T.on && !fin && acc >= .8) tb[sid] = Math.min(1.6, (tb[sid] || 1) * 1.15);
      else if (T.on && fin && timeLeftFrac > .5) tb[sid] = Math.max(1, (tb[sid] || 1) * .95);
      if (!P.guest) {
        A.Store.addTime(P, 'munch', ms); m.rounds++; if (!fin) m.timeUps = (m.timeUps || 0) + 1;
        if (fin && pl.wrong === 0) { m.perfect++; m.streak++; m.best = Math.max(m.best || 0, m.streak); } else m.streak = 0;
        if (G.grum && fin) m.grumblyWins = (m.grumblyWins || 0) + 1;
        if (TWO) { if (MODE === 'team') m.teamRounds = (m.teamRounds || 0) + 1; else { m.raceRounds = (m.raceRounds || 0) + 1; if (G.winner === pl.i) m.raceWins = (m.raceWins || 0) + 1; } }
        A.Store.markPlayed(P);
      }
      return { pl: pl, out: out, fin: fin, frac: frac };
    });
    if (MODE === 'team') { // shared stars from the team total
      var c = PL[0].correct + PL[1].correct, w = PL[0].wrong + PL[1].wrong, n = PL[0].nOk + PL[1].nOk, ts = starsFor(c, w, n, PL.every(function (p) { return p.done; }));
      res.forEach(function (r) { r.stars = withBonus(ts, r.pl); });
    } else res.forEach(function (r) { r.stars = withBonus(starsFor(r.pl.correct, r.pl.wrong, r.pl.nOk, r.fin, GENTLE && !TWO), r.pl); });
    var rewards = res.map(function (r) { A.Store.earnStars(r.pl.P, r.stars, 'munch'); return r.pl.P.guest ? [] : A.Rewards.check(r.pl.P); });
    A.Store.save();
    $('#starCount').textContent = P1.stars; var tl = $('.tally'); tl.classList.remove('bump'); void tl.offsetWidth; tl.classList.add('bump');
    M.jingle();
    function starRow(n, d0) { var h = '<div class="stars">'; for (var i = 0; i < 3; i++) h += '<span>' + UI.STAR.replace('<svg', '<svg class="' + (i < n ? 'got' : '') + '" style="animation-delay:' + (d0 + i * .3).toFixed(2) + 's"') + '</span>'; return h + '</div>'; }
    var card;
    if (!TWO) {
      var r0 = res[0], pl = r0.pl, timed = !r0.fin;
      for (var j = 0; j < r0.stars; j++) setTimeout(SFX.star, 300 + j * 350);
      var calm = GENTLE && r0.stars <= 2, nice = calm;   // design2: Gentle Munch with misses: calm words, no fanfare
      var say = (timed ? ['munch_times_up'] : calm ? [{ id: nice ? 'munch_nice_try' : 'munch_good_munching', text: nice ? 'Nice try!' : 'Good munching!' }] : ['fb_hooray']).concat(r0.stars ? ['fb_you_got', r0.stars, r0.stars === 1 ? 'fb_star' : 'fb_stars'] : []).concat(!timed && pl.wrong === 0 ? ['fb_perfect'] : []).concat(r0.out.say);
      var tag = r0.out.events.speedy ? 'Speedy! Skipped ahead!' : r0.out.events.dropBack ? 'Great warm-up!' : r0.out.events.mastered && r0.out.events.step ? 'Step done! ⭐' : r0.out.events.mastered ? 'Skill mastered!' : r0.out.events.fastTrack && r0.out.events.levelUp ? 'Fast track! Level up!' : r0.out.events.levelUp ? 'Level up!' : pl.round.review ? 'Review' : '';
      card = UI.card({ tag: tag, title: timed ? "Time's up!" : nice ? 'Nice try!' : calm ? 'Good munching!' : 'Hooray!', html: (timed || calm ? '<p class="munched">You munched <b>' + pl.correct + '</b> snack' + (pl.correct === 1 ? '' : 's') + '!' + (calm ? ' Fewer oopsies = more stars.' : '') + '</p>' : '') + starRow(r0.stars, .3),
        art: '<div class="dance">' + A.Blobs.forProfile(pl.P) + '</div>', sub: V.text(r0.out.say), btn: 'Next ▶', sfx: timed ? null : 'win', confetti: true, voice: say, cls: 'celebrate' + (timed ? ' timeup' : ''), minMs: 700 });
    } else {
      var title, voice, sub = 'Great munching, both of you!';
      if (MODE === 'team') { var all = PL.every(function (p) { return p.done; }); title = all ? 'Teamwork!' : "Time's up!"; voice = [all ? 'munch_team_win' : 'munch_team_time', 'fb_you_got', res[0].stars, res[0].stars === 1 ? 'fb_star' : 'fb_stars']; sub = all ? 'You did it together!' : 'Look how much you munched together!'; }
      else {
        var wi = G.winner;
        if (wi == null) { var f0 = res[0].frac, f1 = res[1].frac; wi = f0 > f1 ? 0 : f1 > f0 ? 1 : null; }
        G.winner = wi;
        if (wi != null) { title = PL[wi].name + ' wins the race!'; voice = [nameParts(PL[wi].P), 'munch_wins_race', 'munch_both_great']; res[wi].win = true; }
        else { title = "It's a tie!"; voice = ['munch_tie']; sub = 'You both did great!'; }
      }
      var html = '<div class="duo">' + res.map(function (r, k) {
        return '<div class="pcol p' + (k + 1) + (r.win ? ' win' : '') + '"><div class="pa dance">' + A.Blobs.forProfile(r.pl.P, { expr: 'happy' }) + '</div>' + (r.win ? '<span class="crownb">' + (A.Icons ? A.Icons.html('🏆', { size: 32, decorative: true, cls: 'pp-pic', slot: 'munch:crown' }) : '') + '</span>' : '') +
          '<b class="pn">' + A.esc(r.pl.name) + '</b><span class="pm">' + r.pl.correct + ' of ' + r.pl.nOk + ' munched</span>' + starRow(r.stars, .3 + k * .9) + '</div>';
      }).join('') + '</div>';
      for (var s1 = 0; s1 < res[0].stars + res[1].stars; s1++) setTimeout(SFX.star, 300 + s1 * 300);
      card = UI.card({ tag: MODE === 'team' ? 'Team' : 'Race', title: title, html: html, sub: sub, btn: 'Next ▶', sfx: 'win', confetti: true, voice: voice, cls: 'celebrate duo-card', minMs: 900 });
    }
    card.then(function () {
      var chain = Promise.resolve();
      res.forEach(function (r, k) { chain = chain.then(function () { return A.Rewards.celebrate(r.pl.P, rewards[k], TWO ? r.pl.name : null); }); });
      return chain;
    }).then(ptGate).then(nextRound);
  }
  // play-time limit / stretch break: only ever between rounds (never mid-question); a stopped game waits on the gentle stop screen
  function ptGate() { return A.PlayTime ? A.PlayTime.checkpoint().then(function (ok) { if (!ok) return new Promise(function () {}); }) : null; }
  function outOfHearts() {
    if (STORY) return endStory(true);
    var pl = PL[0], ms = Math.min(Date.now() - G.t0, 15 * 60000), P = pl.P;
    foldBoards(pl);
    C.finishRound(P, pl.round, { correct: pl.correct, wrong: pl.wrong, ms: ms, gaveUp: true, boards: (pl.round && pl.round.board) || 1 });
    A.Store.addTime(P, 'munch', ms); A.Store.markPlayed(P); P.games.munch.streak = 0; A.Store.save();
    UI.card({ title: 'Snack break!', art: '<div>' + A.Blobs.forProfile(P, { expr: 'idle' }) + '</div>', sub: "That's okay! Let's try again!", btn: 'Try again ▶', sfx: 'soft', voice: ['munch_snack'], cls: 'tryagain', minMs: 700 })
      .then(ptGate).then(retryRound);
  }
  // "Try again": the same round again, straight away (no level card)
  function retryRound() { if (!PL[0].round) return nextRound(); M.play('game'); startLevel();
  }

  /* ---------- round start ---------- */
  var PRE = null;   // a round picked before the ready card (Free Play)
  function nextRound() {
    if (STORY) return storyMap();
    var intros = [];
    PL.forEach(function (pl) {
      pl.round = PRE && pl.i === 0 ? PRE : C.pickRound(pl.P, { placement: !TWO }); if (pl.i === 0) PRE = null;
      var st = C.state(pl.P, pl.round.skill.id);
      if (!pl.round.review && !st.introduced) intros.push({ pl: pl, st: st });
    });
    A.Store.save();
    var chain = Promise.resolve();
    // coach v2 placement check (5 quick questions), then the real round (the skill may now be skipped or start higher)
    if (!TWO && PL[0].round.placement) {
      var pp = PL[0]; intros.length = 0;
      var subj0 = C.subjectOf(pp.round.skill);
      var check = function (sk) { return UI.placement(pp.P, sk).then(function (r) {   // 5/5 chains on to the next skill's check (coach.js PLACE_CHAIN)
        var nx = r && r.result === 'skip' && C.track(pp.P, subj0).current; if (nx && A.Coach.wantsPlacement(pp.P, nx) && A.Store.settings.placement !== false) return check(C.byId[nx]); }); };
      chain = check(pp.round.skill).then(function () {
        pp.round = C.pickRound(pp.P, { subject: subj0 }); var st2 = C.state(pp.P, pp.round.skill.id);
        if (!pp.round.review && !st2.introduced) intros.push({ pl: pp, st: st2 });
        A.Store.save();
      });
    }
    chain = chain.then(function () { var c2 = Promise.resolve(); intros.forEach(function (x) { c2 = c2.then(function () { return A.Rewards.celebrate(x.pl.P, [{ kind: 'skill', id: x.pl.round.skill.id }], TWO ? x.pl.name : null).then(function () { x.st.introduced = true; A.Store.save(); }); }); }); return c2; });
    return chain.then(function () { return levelIntro(); }).then(startLevel);
  }
  function levelIntro() {
    LEVELN++;
    var from = G.lastStars, blobs = PL.map(function (pl) { return pl.P; });
    G.lastStars = null;
    // Guided Munch: a one-beat nod instead of the long path cutscene. 2-player still gets a short title card.
    if (!TWO) {
      setHost('happy');
      bubble(LEVELN === 1 ? 'Here we go!' : 'Next board!');
      return new Promise(function (resolve) { setTimeout(resolve, 700); });
    }
    return cutscene({ title: 'Round ' + LEVELN + '!', sub: MODE === 'team' ? 'Team munch' : 'Munch race',
      voice: ['lvl_ready'], heroes: blobs, starsFrom: from ? from[0] : null, starsTo: from ? PL[0].P.stars : null, ms: 1000 });
  }
  // auto: what is said by itself at the start of a round (a story question only, when "Read stories aloud" is off);
  // the speaker button / R key always say the whole rule (story + question)
  function ruleSay(pl, auto) { return auto && A.ReadAloud ? A.ReadAloud.auto(pl.P, pl.rule) : pl.rule.say; }
  function ruleParts(auto) {
    if (!TWO) return ruleSay(PL[0], auto);
    return PL.reduce(function (a, pl) { return a.concat([nameParts(pl.P)]).concat(ruleSay(pl, auto)); }, []);
  }
  function voiceOn() { return !!(S.voice && A.Talk.mode() !== 'off'); }
  function ruleKind() { return PL.some(function (pl) { return pl.rule && pl.rule.listen; }) ? 'listen' : 'prompt'; }
  // Auto-speak the board rule whenever talking isn't Off, even in Tap-to-hear (the rule is how you play).
  // Replay (button / R / bubble) always uses kind 'tap'. V.say stops any clip already playing, so lines never overlap.
  function speakBoardRule(auto) {
    if (!PL[0] || !PL[0].rule || !voiceOn()) return;
    var parts = ruleParts(!!auto);
    if (!parts || !parts.length) return;
    var kind = auto ? ((A.Talk.allows('prompt') || A.Talk.allows(ruleKind())) ? ruleKind() : 'tap') : 'tap';
    V.say(parts, { kind: kind });
  }

  function setHost(expr) {
    var btn = document.querySelector('#bubble .bfriend') || $('#hostBtn');
    if (!btn) return;
    btn.innerHTML = A.Blobs.forProfile(P1, { expr: expr || 'happy' });
    btn.dataset.expr = expr || 'happy';
  }
  function praiseFor(pl, cell) {
    var r = pl && pl.rule, raw = r && r.text ? String(r.text).replace(/<[^>]+>/g, '') : '';
    var n = r && r.target != null && !isNaN(+r.target) ? String(r.target) : '';
    if (n && /equal/i.test(raw)) return 'You found one that equals ' + n + '.';
    if (n && /number/i.test(raw)) return 'You found the number ' + n + '.';
    if (/even/i.test(raw)) return 'You found an even number.';
    if (/odd/i.test(raw)) return 'You found an odd number.';
    if (cell && cell.label && r && r.reading) return 'You found ' + String(cell.label) + '.';
    return '';
  }
  function markWhy(el, pl, cell) {
    if (!el || el.querySelector('.why')) return;
    var why = 'Not this one.';
    if (cell && cell.fact && cell.fact.length && V.text) {
      var t = V.text(cell.fact);
      if (t && !/undefined/i.test(t)) why = t;
    } else if (pl && pl.rule && pl.rule.hint) why = String(pl.rule.hint).replace(/<[^>]+>/g, '');
    var s = document.createElement('span'); s.className = 'why'; s.textContent = why;
    el.appendChild(s);
  }
  function hideBoardHint() {
    var el = $('#boardHint'); if (!el) return;
    el.hidden = true; el.innerHTML = ''; el.classList.remove('on', 'work', 'demo');
  }
  function showBoardHint(o) {
    o = o || {};
    return new Promise(function (resolve) {
      var el = $('#boardHint'); if (!el) { resolve(); return; }
      el.hidden = false; el.className = 'board-hint on' + (o.cls ? ' ' + o.cls : '');
      el.innerHTML = '<p class="bh-tag">' + A.esc(o.tag || '') + '</p><div class="bh-body">' + (o.html || '') + '</div>' +
        (o.btn !== false ? '<button type="button" class="bh-go">' + A.esc(o.btn || 'Your turn') + '</button>' : '');
      var done = false;
      function close() {
        if (done) return; done = true;
        if (el._hintClose === close) el._hintClose = null;
        hideBoardHint(); resolve();
      }
      el._hintClose = close;
      var go = el.querySelector('.bh-go');
      if (go) go.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); close(); });
      if (o.voice && o.voice.length && voiceOn()) {
        V.say(o.voice, { kind: o.kind || 'chatter' });
      }
      if (o.cell && cellEls && G.cells) {
        var idx = G.cells.indexOf(o.cell);
        if (idx >= 0 && cellEls[idx]) cellEls[idx].classList.add('nudge');
      }
    });
  }
  function nointroOn() {
    try { return /[?&]nointro=1(?:&|$)/.test(location.search || ''); } catch (e) { return false; }
  }
  function shouldDemo(pl) {
    if (TWO || !pl || !pl.rule) return false;
    if (window.__munch && window.__munch.forceDemo) return true;
    if (window.__munch && window.__munch.noDemo) return false;
    if (nointroOn()) return false;
    return true;
  }
  function skipDemo() {
    if (!DEMO.on || !DEMO.skipOk) return;
    if (typeof DEMO.close === 'function') DEMO.close();
  }
  function demoWalk(pl, idx, done) {
    clearTimeout(DEMO.walkT);
    function tick() {
      var tr = Math.floor(idx / COLS), tc = idx % COLS, p = pl.pos;
      if (p.c !== tc) p.c += (tc > p.c ? 1 : -1);
      else if (p.r !== tr) p.r += (tr > p.r ? 1 : -1);
      else { place(true); done(); return; }
      place(true); anim(pl, 'hop', 230); if (SFX.step) SFX.step();
      DEMO.walkT = setTimeout(tick, 200);
    }
    tick();
  }
  function demoHtml(pl, cell) {
    var little = littleGrid() || (A.MunchRules && A.MunchRules.littleReader && A.MunchRules.littleReader(pl.P));
    var lab = String((cell && (cell.label || '')) || '');
    var pic = (cell && cell.html) ? cell.html : A.esc(lab);
    if (little) return '<div class="worked demo-lit"><div class="wbig">' + pic + '</div><p class="wa">This one fits' + (lab ? ': <b>' + A.esc(lab) + '</b>' : '') + '.</p></div>';
    return workedHtml0(pl);
  }
  function runDemo(pl) {
    if (!pl || DEMO.on) return Promise.resolve();
    var good = exampleCell();
    var idx = G.cells.indexOf(good);
    if (idx < 0) idx = nearestGood(pl);
    if (idx < 0) return Promise.resolve();
    var st = pl.round && pl.round.skill && C.state ? C.state(pl.P, pl.round.skill.id) : null;
    DEMO.on = true; DEMO.skipOk = !!(st && st.demoSeen);
    DEMO.close = null;
    document.body.classList.add('demo-on');
    setHost('think');
    bubble(DEMO.skipOk ? 'Watch one, or skip.' : 'Watch this one.');
    return new Promise(function (resolve) {
      var finished = false;
      function finish(txt) {
        if (finished) return; finished = true;
        clearTimeout(DEMO.walkT); DEMO.walkT = null;
        hideBoardHint();
        cellEls.forEach(function (e) { e.classList.remove('nudge'); });
        // Step off the demo snack so the child can try it.
        if (pl.pos && (pl.pos.r * COLS + pl.pos.c) === idx) {
          var back = { r: 0, c: 0 };
          if (idx === 0 && COLS > 1) back.c = 1;
          pl.pos = back; place(true);
        }
        DEMO.on = false; DEMO.close = null; DEMO.skipOk = false;
        document.body.classList.remove('demo-on');
        if (st) { st.demoSeen = true; try { A.Store.save(); } catch (e2) {} }
        setHost('happy');
        bubble(txt || 'Your turn.');
        resolve();
      }
      DEMO.close = function () { finish('Your turn.'); };
      if (DEMO.skipOk) {
        // Already seen this skill: skip is available right away.
      } else {
        setTimeout(function () { if (DEMO.on) DEMO.skipOk = true; }, 1200);
      }
      demoWalk(pl, idx, function () {
        if (finished) return;
        if (cellEls[idx]) cellEls[idx].classList.add('nudge');
        setHost('happy');
        // Same auto-speak as speakBoardRule(true). Story cells store the passage id in fact, so do not use fact
        // for story demos — that would read the passage even when Read stories aloud is off.
        var voice = (pl.rule && pl.rule.story) ? ruleSay(pl, true)
          : ((good && good.fact && good.fact.length) ? good.fact : (pl.rule ? ruleSay(pl, true) : []) || []);
        showBoardHint({
          tag: 'Watch me',
          html: demoHtml(pl, good),
          btn: 'Your turn',
          cls: 'demo',
          voice: voice,
          kind: pl.rule && pl.rule.listen ? 'listen' : 'prompt',
          cell: good
        }).then(function () { finish('Your turn.'); });
      });
    });
  }
  function hostTip() {
    if (DEMO && DEMO.on) { skipDemo(); return; }
    speakRule();
  }
  function toggleMore(on) {
    var open = on == null ? !document.body.classList.contains('munch-more') : !!on;
    document.body.classList.toggle('munch-more', open);
    var b = $('#moreBtn'), tray = $('#moreTray');
    if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (tray) tray.hidden = !open;
  }
  function wireMore() {
    var more = $('#moreBtn'), howto = $('#moreHowto'), gear = $('#moreGear'), scores = $('#moreScores');
    if (more) more.addEventListener('click', function (e) { e.stopPropagation(); toggleMore(); });
    if (scores) scores.addEventListener('click', function (e) {
      e.stopPropagation(); toggleMore(false);
      if (A.MunchMap && A.MunchMap.scores) A.MunchMap.scores(P1);
    });
    if (howto) howto.addEventListener('click', function (e) {
      e.stopPropagation(); toggleMore(false);
      if (A.HowTo && A.HowTo.show) A.HowTo.show(STORY && !G.active ? 'story' : 'munch');
    });
    if (gear) gear.addEventListener('click', function (e) {
      e.stopPropagation(); toggleMore(false);
      var g = document.querySelector('.gear'); if (g) g.click();
    });
    document.addEventListener('pointerdown', function (e) {
      if (!document.body.classList.contains('munch-more')) return;
      var t = e.target;
      if (t && t.closest && t.closest('.more-wrap, .gear, .overlay, #gate')) return;
      toggleMore(false);
    });
    setHost('happy');
  }

  function startLevel() {
    applyGrid();
    PL.forEach(setupBoards);
    buildLevel();
    G.grum = !TWO && !STORY && P1.games && P1.games.munch && P1.games.munch.grumbly ? { r: ROWS - 1, c: COLS - 1 } : null;
    renderBoard(); setHost('happy'); G.active = true; G.winner = null;
    var rule = $('#rule'); rule.classList.remove('pop'); void rule.offsetWidth; rule.classList.add('pop');
    if (TWO) bubble(MODE === 'team' ? 'Munch your own color — together!' : 'Munch your own color — go!');
    else if (G.first) bubble(A.isTouchOnly() ? 'Tap a square to walk. Tap your friend to munch!' : 'Arrow keys to move · Space to munch!');
    else bubble('Your turn.');
    // How-to lives in the bubble only on the first demo/turn, not every board.
    G.first = false;
    speakBoardRule(true);
    function goPlay() { if (!G.active) return; startTimer(); startGrumbly(); poke(); }
    if (!TWO && shouldDemo(PL[0])) runDemo(PL[0]).then(goPlay);
    else goPlay();
    M.play('game');
  }
  // Hear-it-again button, R key, tapping the rule or the friend's bubble: the kid asked, so it plays at every setting but Off
  function speakRule() {
    if (!PL[0] || !PL[0].rule) return;
    if (A.Talk.mode() === 'off' || !S.voice) { bubble(S.voice ? 'Talking is off. Read the question at the top!' : 'Voice is off (grown-up settings).'); return; }
    var parts = ruleParts() || [];
    if (G.lastFact && G.lastFact.length) parts = parts.concat(G.lastFact);
    V.say(parts, { kind: 'tap' });
  }


  /* ---------- level transitions: a short, skippable cutscene ----------
     o: {title, sub, voice, heroes:[profiles], starsFrom, starsTo, ms, finale, friends} — about 3.5 s; Space / Enter / F / tap skips. */
  function cutscene(o) {
    return new Promise(function (resolve) {
      var heroes = (o.heroes || [P1]).map(function (p, k) { return '<div class="cs-hero h' + k + '"><div class="hb">' + A.Blobs.forProfile(p, { expr: 'happy' }) + '</div></div>'; }).join('');
      var starters = (A.Store && A.Store.STARTER_BLOBS) || ['strawberry', 'apple', 'corn', 'blueberry'];
      var cast = met(o.friends || starters).filter(function (b) { return !(o.heroes || [P1]).some(function (h) { return h.blob === b; }); }).slice(0, 4);
      var friends = cast.map(function (b, k) { return '<div class="cs-friend" style="animation-delay:' + (k * .12) + 's">' + A.Blobs.svg({ blob: b, expr: 'happy' }) + '</div>'; }).join('');
      var hasStars = o.starsFrom != null && o.starsTo != null;
      var ov = A.el('<div class="cutscene' + (o.finale ? ' finale' : '') + '" role="dialog" aria-label="' + A.esc(o.title) + '">' +
        '<div class="cs-sky"></div><div class="cs-hills"></div>' +
        (hasStars ? '<div class="cs-stars">' + UI.STAR + '<b>' + o.starsFrom + '</b></div>' : '') +
        '<div class="cs-path"><svg viewBox="0 0 400 120" preserveAspectRatio="none"><path d="M10 100 Q100 10 200 70 T390 40" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="2 16" stroke-linecap="round"/></svg>' + heroes + '<div class="cs-flag">' + (A.Icons ? A.Icons.html('🏁', { size: 48, decorative: true, cls: 'pp-pic', slot: 'munch:flag' }) : '') + '</div></div>' +
        '<h2 class="cs-title">' + A.esc(o.title) + '</h2>' + (o.sub ? '<div class="cs-sub">' + A.esc(o.sub) + (o.subHtml || '') + '</div>' : '') +
        '<div class="cs-friends">' + friends + '</div>' +
        '<span class="kh">' + (A.isTouchOnly() ? 'Tap to skip' : 'Press <kbd class="wide">Space</kbd> to skip') + '</span><span class="ph">Press ' + A.Pad.g('a') + ' to skip</span></div>');
      document.body.appendChild(ov); UI.cardOpen = true; window.__munch && (window.__munch.cutscenes = (window.__munch.cutscenes || 0) + 1);
      var timers = [], done = false, t0 = Date.now(), dur = o.ms || (o.finale ? 6500 : 3600);
      function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
      function boom() { if (done) return; var x = innerWidth * (.15 + Math.random() * .7), y = innerHeight * (.12 + Math.random() * .3); fireworks(ov, x, y); SFX.pop(); }
      for (var k = 0; k < (o.finale ? 10 : 4); k++) later(boom, 250 + k * (o.finale ? 550 : 650));
      if (hasStars && o.starsTo > o.starsFrom) {
        var n = o.starsFrom, b = ov.querySelector('.cs-stars b'), steps = Math.min(o.starsTo - o.starsFrom, 6);
        for (var j = 1; j <= steps; j++) (function (j) { later(function () { n = j === steps ? o.starsTo : n + 1; b.textContent = n; SFX.star(); ov.querySelector('.cs-stars').classList.remove('bump'); void ov.offsetWidth; ov.querySelector('.cs-stars').classList.add('bump'); }, 500 + j * 260); })(j);
      }
      later(function () { ov.classList.add('titled'); SFX.yay(); if (o.voice) V.say(o.voice); }, o.finale ? 400 : 1300);
      if (o.finale) { later(function () { UI.rain(60); SFX.win(); }, 300); }
      var csLock = A.Pace.lock(ov.querySelector('.kh'), Math.min(dur, A.Pace.ms('LEVEL_UP')), 'munch:cutscene'); ov.__pace = csLock;
      later(function () { close('auto'); }, dur);
      // heroes bounce along the dotted trail to the flag
      (function walk() {
        var path = ov.querySelector('.cs-path path'), box = ov.querySelector('.cs-path'), L = path.getTotalLength(), hs = A.$$('.cs-hero', ov), t1 = Date.now(), span = o.finale ? 3000 : 2500;
        (function frame() {
          if (done) return;
          var bw = box.clientWidth, bh = box.clientHeight;
          hs.forEach(function (h, k) {
            var f = Math.min(1, Math.max(0, (Date.now() - t1 - k * 250) / span)), e = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
            var pt = path.getPointAtLength(L * e * .94);
            h.style.transform = 'translate(' + (pt.x / 400 * bw) + 'px,' + (pt.y / 120 * bh) + 'px)';
          });
          requestAnimationFrame(frame);
        })();
      })();
      function close(e) {
        if (done || (e && e !== 'auto' && e.repeat === true) || (e !== 'auto' && !csLock.ready())) { if (!done && e !== 'auto') csLock.dropped++; return; } done = true;
        timers.forEach(clearTimeout); document.removeEventListener('keydown', onKey, true);
        ov.classList.add('bye'); if (e !== 'auto') armSkipGuard(); setTimeout(function () { ov.remove(); UI.cardOpen = !!document.querySelector('.overlay.on'); resolve(); }, 220);
      }
      function onKey(e) { if (/^( |Enter|f|F|Escape)$/.test(e.key)) { e.preventDefault(); e.stopPropagation(); close(e); } }
      document.addEventListener('keydown', onKey, true);
      ov.addEventListener('pointerdown', function () { close(null); });
    });
  }
  function fireworks(host, x, y) {
    var cols = ['#ff8fb1', '#ffd23c', '#8fe3c0', '#9fd2ff', '#c9b2ff', '#ffb36b'], c = A.pick(cols), n = 22;
    for (var i = 0; i < n; i++) {
      var d = document.createElement('i'); d.className = 'fwp'; var a = Math.PI * 2 * i / n, r = 90 + Math.random() * 70;
      d.style.left = x + 'px'; d.style.top = y + 'px'; d.style.background = i % 3 ? c : A.pick(cols);
      d.style.setProperty('--dx', Math.cos(a) * r + 'px'); d.style.setProperty('--dy', Math.sin(a) * r + 'px');
      host.appendChild(d); (function (d) { setTimeout(function () { d.remove(); }, 1300); })(d);
    }
  }

  /* ---------- story mode ---------- */
  // design1: cutscenes only show friends the player has already met (a locked friend never shows up early)
  function met(list) { var P = P1, out = list.filter(function (b, i) { return list.indexOf(b) === i && (A.Store.STARTER_BLOBS.indexOf(b) >= 0 || A.Rewards.unlocked(P, 'blob', b)); }); return out.length ? out : [A.Store.STARTER_BLOBS[0]]; }
  function storyMap(from, to) {
    stopTimer(); G.active = false; M.play('hub');
    var banner = document.querySelector('.s2-fight-banner'); if (banner) banner.remove(); document.body.classList.remove('s2-fighting');
    $('#game').classList.remove('on');
    if (ST.placeAtLevel(P1)) { A.Store.save(); if (from == null) { from = to = ST.unlockedTo(P1); } }   // story starts at the player's level
    // story2: the world map + place maps (games/munch/story2-map.js); ?map=1 keeps the old single island map (tests, comparisons)
    // ?map=1 is remembered for this tab (sessionStorage) so trips to Slugger/Stand/Bubble stops come back to the same map; ?map=2 clears it
    var OLDMAP = false; try { if (/[?&]map=1\b/.test(location.search)) sessionStorage.setItem('blobArcade.map1', '1'); if (/[?&]map=2\b/.test(location.search)) sessionStorage.removeItem('blobArcade.map1'); OLDMAP = sessionStorage.getItem('blobArcade.map1') === '1'; } catch (e) { OLDMAP = /[?&]map=1\b/.test(location.search); }
    var MAP = A.StoryMap2 && !OLDMAP ? A.StoryMap2 : A.MunchMap;
    return MAP.open(P1, { from: from, to: to }).then(function (i) {
      if (i === 'back') { location.href = A.ROOT + 'index.html' + (A.toddler && A.toddler(P1) ? '#games' : '#mode'); return; }   // toddlers have no Story / Free Play screen
      $('#game').classList.add('on');
      if (typeof i === 'string') return startChallenge(+i.slice(1));
      return playStop(i);
    });
  }
  // play story stop i. retry: "Try again" straight back in (no story cards, no map)
  function playStop(i, retry) {
    {
      var cfg = ST.config(P1, i), R = ST.run(P1), stop = ST.STOPS[i], practice = !stop.side && (R.done || i !== R.stop);
      SR = { i: i, cfg: cfg, practice: practice };
      PL[0].round = { skill: C.byId[cfg.skill], level: cfg.level, nOk: cfg.nOk, timeX: cfg.timeX, story: true, stop: stop, review: false, hard: !!(cfg.hard || cfg.bossHarder), tier: cfg.tier || 0 };
      var artBoss = cfg.boss && A.Story2 && A.Story2.PLACES[A.Story2.placeOfStop(i)].art;
      var oldBanner = document.querySelector('.s2-fight-banner'); if (oldBanner) oldBanner.remove(); document.body.classList.toggle('s2-fighting', !!artBoss);
      if (artBoss) { var place = A.Story2.PLACES[A.Story2.placeOfStop(i)];
        var banner = A.el('<div class="s2-fight-banner"><img alt="" src="' + A.Story2.artURL(place, A.Story2.bossBeaten(P1, place.ix) ? 'portrait_rematch' : 'portrait') + '"><b>Mini boss: ' + A.esc(place.boss) + '</b></div>');
        $('#game .top').insertAdjacentElement('afterend', banner);
      }
      var chain = artBoss && !retry ? A.StoryMap2.encounter(P1, i) : Promise.resolve(), sd0 = ST.data(P1); sd0.seen = sd0.seen || {};
      var slug = ST.gameOf(P1, i) === 'slugger';   // game mix: this stop is a Snack Slugger game (story.js gameOf)
      var stand = ST.gameOf(P1, i) === 'stand', bub = ST.gameOf(P1, i) === 'bubble';   // stand1: a Lemonade Stand stop (games/stand, ?mode=story&stop=i)
      if (retry) { if (bub) return goBubble(i); if (stand) return goStand(i); if (slug) return goSlugger(i); M.play('game'); startLevel(); return Promise.resolve(); }
      if (!practice && !sd0.seen.prologue && (i === 0 || (ST.stopInfo(P1, i - 1) || {}).placed)) chain = chain.then(function () { sd0.seen.prologue = Date.now(); A.Store.save();
        return UI.card({ cls: 'storycard', tag: ST.WORLD, title: 'The Missing Star-Snacks', art: '<div class="jump">' + A.Blobs.svg({ blob: 'strawberry', expr: 'sad' }) + '</div>', sub: ST.PROLOGUE, btn: "Let's go ▶", voice: ['story_prologue'], minMs: 600 });
      });
      var sd = ST.data(P1), firstSide = stop.side && !sd.seen['area:' + stop.area.id];
      if (firstSide) sd.seen['area:' + stop.area.id] = Date.now();
      var beatSeen = sd0.seen['beat:' + stop.area.id];   // each area's story card plays once
      // batch-1107c: the old island map's area card (e.g. "Counting Cornfield") showed before Berry Meadow level 1 on the new world map; story2 places have their own intro
      var s2place = A.Story2 && A.StoryMap2 && A.Story2.placeOfStop(i) >= 0 && !(function () { try { return sessionStorage.getItem('blobArcade.map1') === '1'; } catch (e) { return false; } })();
      if (!artBoss && !s2place && ((!practice && stop.lv === 0 && !stop.side && !beatSeen) || firstSide)) chain = chain.then(function () {
        var a = stop.area; sd0.seen['beat:' + a.id] = Date.now(); A.Store.save();
        // design1: an area guide the player hasn't met yet (e.g. Crunch, Vinnie) stays a surprise: Jammy tells that area's story
        // instead, without the guide's name (read by the browser voice; the recorded beat line names the guide)
        var gf = met([a.friend])[0] === a.friend ? a.friend : (A.Story2 ? A.Story2.hero(P1) : 'strawberry'), gName = A.Blobs.byId[a.friend].name, beat = a.beat, bv = ['area_' + a.id, 'beat_' + a.id];
        if (gf !== a.friend) { beat = (beat.match(/[^.!?]+[.!?]*\s*/g) || [beat]).map(function (x) { return x.trim(); }).filter(function (x) { return x.indexOf(gName) < 0 && !/^(Hi|Hello)\b/.test(x); }).join(' ') || 'Let\'s find the star-snacks here!'; bv = ['area_' + a.id, { text: beat }]; }
        return UI.card({ cls: 'storycard beat', tag: a.emoji + ' ' + a.name, title: A.Blobs.byId[gf].name + ' says…', art: '<div class="jump">' + A.Blobs.svg({ blob: gf, expr: 'happy' }) + '</div>', sub: beat, btn: 'OK ▶', voice: bv, minMs: 600 });
      });
      // quality1 (rule 2): the very first Munch stop of a subject runs the same quick check as free Munch (UI.placement), so a
      // strong kid is never kept on below-band stops just because Story came first. The stop then re-reads its skill.
      if (!artBoss && !slug && !stand && !bub && !(A.toddler && A.toddler(P1)) && A.Coach && A.Store.settings.placement !== false) chain = chain.then(function () {
        var sk0 = C.byId[cfg.skill], subj0 = sk0 && C.subjectOf(sk0), cur0 = subj0 && C.current(P1, subj0);
        if (!cur0 || !A.Coach.wantsPlacement(P1, cur0.id)) return;
        return UI.placement(P1, cur0).then(function () { A.Store.save(); cfg = ST.config(P1, i); SR.cfg = cfg;
          PL[0].round = { skill: C.byId[cfg.skill], level: cfg.level, nOk: cfg.nOk, timeX: cfg.timeX, story: true, stop: stop, review: false, hard: !!(cfg.hard || cfg.bossHarder), tier: cfg.tier || 0 }; });
      });
      return chain.then(function () {
        if (artBoss) return;
        var parts = stop.side ? ['area_' + stop.area.id].concat(cfg.helper ? ['story_helper'] : []) : ['story_stop', stop.n].concat(cfg.helper ? ['story_helper'] : practice ? ['story_practice'] : []);
        var where = (ST.placeName && ST.placeName(stop)) || stop.area.name;
        if (stop.side && cfg.boss) return cutscene({ title: where + '!', sub: 'Mini boss' + (C.byId[cfg.skill] ? ' · ' + C.byId[cfg.skill].name : ''), voice: ['s2_boss'], heroes: [P1], friends: met(A.Story2 ? [A.Story2.hero(P1)] : ['strawberry']) });
        if (stop.side) return cutscene({ title: where + '!', sub: (C.byId[cfg.skill] ? C.byId[cfg.skill].name : 'Next stop') + (cfg.helper ? ' · a little easier' : ''), voice: parts, heroes: [P1], friends: met([stop.area.friend, 'mochi', 'strawberry', 'carrot', 'grapes']) });
        return cutscene({ title: where + '!', sub: (slug ? A.TITLES.baseball + ' · ' : stand ? A.TITLES.stand + ' · ' : bub ? A.TITLES.bubble + ' · ' : '') + ((ST.placeLevelLabel && ST.placeLevelLabel(stop)) || ('Stop ' + stop.n)) + (cfg.helper ? ' · a little easier' : practice ? ' · practice' : ''), voice: parts, heroes: [P1], friends: met([stop.area.friend, 'mochi', 'strawberry', 'carrot', 'grapes']) });
      }).then(function () { if (bub) return goBubble(i); if (stand) return goStand(i); if (slug) return goSlugger(i); M.play('game'); startLevel(); });
    }
  }
  // a Snack Slugger stop: the short story game lives on the Slugger page (games/baseball, ?mode=story&stop=i); it records the
  // stop with Story.record like a Munch stop and comes back here with ?mode=story&from=i&to=next
  function goBubble(i) { A.Store.save(); M.stop(); if (window.__munch) window.__munch.bubbleGo = i; if (!window.__noNav) location.href = '../bubble/index.html?mode=story&stop=' + i; return Promise.resolve(); }
  function goStand(i) { A.Store.save(); M.stop(); if (window.__munch) window.__munch.standGo = i; if (!window.__noNav) location.href = '../stand/index.html?mode=story&stop=' + i; return Promise.resolve(); }
  function goSlugger(i) { A.Store.save(); M.stop(); if (window.__munch) window.__munch.sluggerGo = i; if (!window.__noNav) location.href = '../baseball/index.html?mode=story&stop=' + i; return Promise.resolve(); }
  /* ---------- friend challenges (unlock a new blob) ---------- */
  function startChallenge(k) {
    var cc = ST.chConfig(P1, k), c = cc.ch, stop = ST.STOPS[c.ai * 2 + 1], got = A.Rewards.unlocked(P1, 'blob', c.blob), nm = A.Blobs.byId[c.blob].name;
    SR = { i: stop.i, ch: cc, practice: true };
    PL[0].round = { skill: C.byId[cc.skill], level: cc.level, nOk: cc.nOk, story: true, stop: stop, challenge: cc, review: false };
    // design1: no hint of a friend still to meet (no silhouette, no name, no "meet a new friend"): the player's own friend on the card
    return UI.card({ cls: 'storycard chcard', tag: '⭐ Challenge · ' + c.a.name, title: 'Challenge time!',
      art: '<div class="jump">' + (got ? A.Blobs.svg({ blob: c.blob, expr: 'happy' }) : A.Blobs.forProfile(P1, { expr: 'happy' })) + '</div>',
      html: '<p class="chgoal">Munch all <b>' + cc.nOk + '</b> in under <b>' + cc.target + ' seconds</b><br>with at most 1 oops</p>',
      btn: 'Go! ▶', voice: got ? ['ch_again'] : ['ch_title'], minMs: 600 })
      .then(function () { return cutscene({ title: 'Challenge!', sub: (A.Icons ? A.Icons.html('⏱', { size: 28, decorative: true, cls: 'pp-pic', slot: 'munch:challenge' }) : '⏱') + ' ' + cc.target + ' seconds · ' + c.a.name, voice: ['lvl_ready'], heroes: [P1], friends: met([c.blob === 'mochi' ? 'strawberry' : 'mochi', 'strawberry', 'carrot', 'grapes'].filter(function (b) { return b !== c.blob; })), ms: 2600 }); })
      .then(function () { M.play('game'); startLevel(); });
  }
  function endChallenge(gaveUp) {
    var pl = PL[0], P = P1, cc = SR.ch, c = cc.ch, fin = pl.done, secs = Math.round((T.limit - T.left) * 10) / 10, nm = A.Blobs.byId[c.blob].name;
    stopTimer(); G.active = false;
    var out = ST.chRecord(P, cc.k, { finished: fin, wrong: pl.wrong, secs: secs });
    A.Store.addTime(P, 'munch', Math.min(Date.now() - G.t0, 15 * 60000)); A.Store.markPlayed(P); P.games.munch.rounds++;
    var stars = out.won ? 3 : fin ? 1 : 0; A.Store.earnStars(P, stars, 'challenge'); var rewards = A.Rewards.check(P); A.Store.save(); $('#starCount').textContent = P.stars;
    T.on = timerWanted(); document.body.classList.remove('challenge');
    var chain;
    if (out.won && (out.firstWin || rewards.some(function (r) { return r.kind === 'blob' && r.id === c.blob; }))) chain = unlockScene(c);
    else chain = UI.card({ cls: 'celebrate storyres' + (out.won ? '' : ' tryagain'), tag: '⭐ Challenge · ' + c.a.name,
      title: out.won ? 'Challenge won!' : !fin ? (gaveUp ? 'Snack break!' : "Time's up!") : 'So close!',
      art: '<div class="' + (out.won ? 'dance' : '') + '">' + A.Blobs.forProfile(P, { expr: out.won ? 'happy' : 'idle' }) + '</div>',
      html: '<p class="chgoal">' + (fin ? 'Your time: <b>' + secs + 's</b> (goal ' + cc.target + 's)' : 'You munched <b>' + pl.correct + '</b> of ' + pl.nOk) + (fin && pl.wrong > cc.maxWrong ? '<br>Oops: ' + pl.wrong + ' (1 is OK)' : '') + (out.newBest ? '<br>' + (A.Icons ? A.Icons.html('🏅', { size: 24, decorative: true, cls: 'pp-pic', slot: 'munch:besttime' }) : '') + ' New best time!' : '') + '</p>',
      sub: out.won ? '' : (A.Rewards.unlocked(P, 'blob', c.blob) ? 'Try again for a faster time!' : 'Good try! You can race again any time.'),
      btn: 'Map ▶', sfx: out.won ? 'win' : 'soft', confetti: out.won, voice: out.won ? (out.wins > 1 ? ['ch_won_again'] : ['fb_great_job']) : fin && pl.wrong > cc.maxWrong ? ['ch_fail_acc'] : ['fb_so_close', 'fb_try_again'], minMs: 800 });   // design1: not ch_fail_time (its clip says "…to meet your new friend")
    chain.then(function () { return A.Rewards.celebrate(P, rewards); }).then(ptGate).then(function () { A.MunchMap.preselect('c' + cc.k); storyMap(); });
  }
  // the big moment: a new blob joins the team
  function unlockScene(c) {
    var b = A.Blobs.byId[c.blob];
    window.__munch && (window.__munch.unlocks = (window.__munch.unlocks || 0) + 1);
    return new Promise(function (resolve) {
      var ov = A.el('<div class="cutscene unlock" role="dialog" aria-label="' + A.esc(b.name) + ' joined the team"><div class="cs-sky"></div><div class="rays"></div>' +
        '<div class="un-blob sil">' + A.Blobs.svg({ blob: c.blob, expr: 'happy' }) + '</div><h2 class="cs-title">' + A.esc(b.name) + ' joined the team!</h2>' +
        '<div class="cs-sub">' + A.esc(b.personality) + '</div><div class="cs-friends">' + A.Store.STARTER_BLOBS.concat([P1.blob]).filter(function (x, i, a) { return a.indexOf(x) === i && x !== c.blob; }).map(function (x) { return '<div class="cs-friend">' + A.Blobs.svg({ blob: x, expr: 'happy' }) + '</div>'; }).join('') + '</div>' +
        '<span class="kh">' + (A.isTouchOnly() ? 'Tap to continue' : 'Press <kbd class="wide">Space</kbd> to continue') + '</span><span class="ph">Press ' + A.Pad.g('a') + ' to continue</span></div>');
      document.body.appendChild(ov); UI.cardOpen = true; SFX.unlock();
      var done = false, timers = [], unLock = A.Pace.lock(ov.querySelector('.kh'), Math.max(1600, A.Pace.ms('UNLOCK')), 'munch:unlock'); ov.__pace = unLock;
      timers.push(setTimeout(function () { ov.querySelector('.un-blob').classList.remove('sil'); ov.classList.add('titled'); UI.rain(50); SFX.win(); for (var k = 0; k < 3; k++) fireworks(ov, innerWidth * (.2 + .3 * k), innerHeight * .25); }, 1200));
      timers.push(setTimeout(function () { V.say(['unlock_' + c.blob, 'hi_' + c.blob, 'unlock_pick'], { bubble: false }); }, 1500));
      function close() {
        if (done || !unLock.ready()) { if (!done) unLock.dropped++; return; } done = true; timers.forEach(clearTimeout); document.removeEventListener('keydown', onKey, true); V.stop();
        ov.remove(); UI.cardOpen = !!document.querySelector('.overlay.on');
        UI.confirm({ title: 'Be ' + b.name + ' now?', sub: 'You can switch any time in Dress Up.', art: A.Blobs.svg({ blob: c.blob, color: P1.color, outfit: P1.outfit, expr: 'happy' }), yes: 'Yes!', no: 'Not now' })
          .then(function (yes) { if (yes) { P1.blob = c.blob; if (A.Story2 && A.Story2.switchHero) A.Story2.switchHero(P1, c.blob); A.Store.save(); PL[0].el = null; } resolve(); });
      }
      function onKey(e) { if (/^( |Enter|f|F|Escape)$/.test(e.key)) { e.preventDefault(); e.stopPropagation(); if (!e.repeat) close(); } }
      document.addEventListener('keydown', onKey, true); ov.addEventListener('pointerdown', close);
      timers.push(setTimeout(close, 9000));
    });
  }
  function endStory(gaveUp) {
    if (SR && SR.ch) return endChallenge(gaveUp);
    var pl = PL[0], P = P1, m = P.games.munch, ms = Math.min(Date.now() - G.t0, 15 * 60000), fin = pl.done, frac = pl.nOk ? pl.correct / pl.nOk : 0;
    stopTimer(); stopGrumbly(); G.active = false;
    var stars = gaveUp ? 0 : withBonus(starsFor(pl.correct, pl.wrong, pl.nOk, fin, GENTLE), pl);
    var runBefore = ST.run(P).score;
    var out = ST.record(P, SR.i, { correct: pl.correct, wrong: pl.wrong, finished: fin, frac: frac, gaveUp: gaveUp, secsLeft: T.left, timerOn: T.on, stars: stars, gentle: GENTLE, nOk: pl.nOk });
    A.Store.addTime(P, 'munch', ms); m.rounds++; if (!fin && !gaveUp) m.timeUps = (m.timeUps || 0) + 1; A.Store.markPlayed(P);
    if (fin && pl.wrong === 0) m.perfect++;
    A.Store.earnStars(P, stars, 'story'); var rewards = A.Rewards.check(P); A.Store.save();
    $('#starCount').textContent = P.stars;
    if (out.passed) M.jingle();
    if (SR.cfg.boss && A.Story2.PLACES[A.Story2.placeOfStop(SR.i)].art && A.StoryMap2) {
      var bossI = SR.i;
      $('#game').classList.remove('on');
      var resultPanel = out.rescue ? A.StoryMap2.victory(P, bossI, out.rescue) : A.StoryMap2.retryBoss(P, bossI);
      return resultPanel.then(function (action) {
        return Promise.resolve(ptGate()).then(function () {
          if (action === 'retry') { $('#game').classList.add('on'); return playStop(bossI, true); }
          if (action === 'rematch') { $('#game').classList.add('on'); return playStop(bossI); }
          return storyMap(null, bossI);
        });
      });
    }
    var R = ST.run(P), pts = out.pts, stop = ST.STOPS[SR.i];
    var rows = [['🍪 Snacks', pts.snacks], ['🎯 Accuracy', pts.accuracy], [(A.Icons ? A.Icons.html('⏱', { size: 24, decorative: true, cls: 'pp-pic', slot: 'munch:timebonus' }) + ' Time bonus' : '⏱ Time bonus'), pts.time], ['✨ Perfect', pts.perfect]].filter(function (r) { return r[1] > 0 || r[0].indexOf('Snacks') >= 0; });
    var html = (gaveUp ? '' : '<div class="stars">' + [0, 1, 2].map(function (i) { return '<span>' + UI.STAR.replace('<svg', '<svg class="' + (i < stars ? 'got' : '') + '" style="animation-delay:' + (.3 + i * .3).toFixed(2) + 's"') + '</span>'; }).join('') + '</div>') +
      '<div class="score"><table>' + rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td class="v" data-v="' + r[1] + '">0</td></tr>'; }).join('') +
      '<tr class="tot"><td>Stop score</td><td class="v" data-v="' + pts.total + '">0</td></tr></table>' +
      (out.runAdded ? '<div class="journey">Journey score <b data-v="' + R.score + '" data-from="' + runBefore + '">' + runBefore + '</b></div>' : SR.practice ? '<div class="journey soft">Practice round · best here ' + (ST.stopInfo(P, SR.i) || {}).best + '</div>' : '') +
      (out.newBestRun ? '<div class="newbest">' + (A.Icons ? A.Icons.html('🏆', { size: 28, decorative: true, cls: 'pp-pic', slot: 'munch:high' }) : '') + ' New high score!</div>' : out.newBestStop ? '<div class="newbest">' + (A.Icons ? A.Icons.html('🏅', { size: 28, decorative: true, cls: 'pp-pic', slot: 'munch:best' }) : '') + ' New best for this stop!</div>' : '') + '</div>';
    var soft = GENTLE && !out.passed;   // design2: a gentle stop with too many oopsies: a calm "Nice try!" and play it again
    var title = soft ? 'Nice try!' : fin ? 'Stop cleared!' : out.passed ? 'You made it!' : gaveUp ? 'Snack break!' : "Time's up!";
    var voice = soft ? [{ id: 'munch_nice_try_stop', text: "Nice try! Let's play this stop again." }] : fin ? ['fb_hooray', 'fb_you_got', stars, stars === 1 ? 'fb_star' : 'fb_stars'] : out.passed ? ['munch_times_up', 'story_next'] : ['story_try_again'];
    if (out.newBestRun || out.newBestStop) voice.push('story_new_best'); else if (out.passed && pts.total >= 900) voice.push('story_great_score');
    var card = UI.card({ tag: ((ST.placeName && ST.placeName(stop)) || stop.area.name) + (stop.side ? ' · ' + C.byId[SR.cfg.skill].name : ' · Stop ' + stop.n), title: title, html: html, art: '<div class="' + (out.passed ? 'dance' : '') + '">' + A.Blobs.forProfile(P, { expr: out.passed || soft ? 'happy' : 'idle' }) + '</div>',
      btn: out.passed ? 'Map ▶' : 'Try again ▶', sfx: out.passed ? 'win' : 'soft', confetti: out.passed, voice: voice, cls: 'celebrate storyres' + (out.passed ? '' : ' tryagain'), minMs: 900 });
    countUp(document.querySelector('.overlay.storyres'));
    card.then(function () { return A.Rewards.celebrate(P, rewards); }).then(function () {
      if (out.finale) return cutscene({ finale: true, title: ST.FESTIVAL + '!', sub: 'Journey score ' + R.score, voice: ['story_finale'], heroes: [P], friends: met(['mochi', 'strawberry', 'carrot', 'blueberry', 'corn', 'grapes']) });
    }).then(ptGate).then(function () {
      if (!out.passed) return storyRetry();
      storyMap(SR.i, out.runAdded ? Math.min(SR.i + 1, ST.mainCount() - 1) : out.sideNext != null ? out.sideNext : SR.i);
    });
  }
  function storyRetry() { // straight back into the same stop (with "helper" settings after two misses), no map or story cards
    var i = SR.i; SR = null; return playStop(i, true);
  }
  function countUp(ov) {
    if (!ov) return;
    var els = A.$$('[data-v]', ov), t0 = Date.now() + 500, last = 0;
    var iv = setInterval(function () {
      var f = Math.min(1, Math.max(0, (Date.now() - t0) / 1200)), e = 1 - Math.pow(1 - f, 3);
      els.forEach(function (el) { var a = +(el.dataset.from || 0), b = +el.dataset.v; el.textContent = Math.round(a + (b - a) * e); });
      if (f > 0 && Date.now() - last > 90 && f < 1) { last = Date.now(); SFX.tick(); }
      if (f >= 1 || !document.body.contains(ov)) { clearInterval(iv); els.forEach(function (el) { el.textContent = el.dataset.v; }); }
    }, 40);
  }

  /* ---------- Grumbly (optional, 1 player) ---------- */
  function startGrumbly() { stopGrumbly(); if (!G.grum) return; G.grumT = setInterval(grumbleStep, 2800); }
  function stopGrumbly() { clearInterval(G.grumT); G.grumT = null; }
  function grumbleStep() {
    if (!G.active || blocked() || !G.grum) return;
    var opts = [[0, 1], [0, -1], [1, 0], [-1, 0]].map(function (d) { return { r: G.grum.r + d[0], c: G.grum.c + d[1] }; })
      .filter(function (p) { return p.r >= 0 && p.c >= 0 && p.r < ROWS && p.c < COLS && !(p.r === 0 && p.c === 0); });
    G.grum = A.pick(opts); place(true); setTimeout(checkBump, 1100);
  }
  function checkBump() {
    var pl = PL[0];
    if (!G.grum || !G.active) return;
    if (G.grum.r === pl.pos.r && G.grum.c === pl.pos.c) {
      pl.target = null; clearTimeout(pl.walkT); pl.walkT = null;
      SFX.boing(); talk(['munch_boing']);
      pl.pos = { r: 0, c: 0 }; anim(pl, 'hop', 230); setTimeout(function () { place(true); }, 150);
    }
  }

  /* ---------- input ---------- */
  var KEYS1 = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
  var KEYS2 = { w: [-1, 0], s: [1, 0], a: [0, -1], d: [0, 1] };
  function flashKey(sel) { var el = A.$('#keys kbd[data-k="' + sel + '"]'); if (!el) return; el.classList.add('hit'); setTimeout(function () { el.classList.remove('hit'); }, 140); }
  document.addEventListener('keydown', function (e) {
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (DEMO && DEMO.on) {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape' || (e.key && e.key.toLowerCase() === 'f')) {
        e.preventDefault(); skipDemo();
      }
      return;
    }
    if (B.open) { if (bonusKey(e)) return; }
    if (blocked()) return;
    var k = e.key, lk = k.length === 1 ? k.toLowerCase() : k, now = Date.now(), who = -1, mv = null, mu = false;
    if (KEYS1[k]) { who = 0; mv = KEYS1[k]; }
    else if (KEYS2[lk] && !e.ctrlKey && !e.metaKey) { who = TWO ? 1 : 0; mv = KEYS2[lk]; }
    else if (k === ' ' || k === 'Enter') { who = 0; mu = true; }
    else if (lk === 'f') { who = TWO ? 1 : 0; mu = true; }
    else if (lk === 'r') { flashKey('r'); speakRule(); return; }
    else if (lk === 'm') { toggleMusic(); return; }
    else return;
    e.preventDefault();
    var pl = PL[who]; flashKey(mv ? (KEYS1[k] ? k : lk) : (lk === 'f' ? 'f' : ' '));
    if (mv) { if (e.repeat && now - pl.lastMove < 150) return; pl.lastMove = now; moveBy(who, mv[0], mv[1]); }
    else if (mu) { if (e.repeat || now < skipGuard) return; if (who === 0) { var mb = $('#munchBtn'); mb.classList.add('pressed'); setTimeout(function () { mb.classList.remove('pressed'); }, 120); } munch(who); }
  }, true);
  function onMunchBtn(e) { if (e && e.type === 'click' && e.detail === 0) return; munch(0); }
  function hearAgain(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!S.voice) { bubble('Voice is off (grown-up settings).'); return; }
    speakRule();
  }
  if (A.Kit && A.Kit.onPointer) {
    A.Kit.onPointer($('#munchBtn'), onMunchBtn);
    A.Kit.onPointer($('#speakBtn'), hearAgain);
    A.Kit.onPointer($('#rule'), function (e) {
      if (e && e.target && e.target.closest && e.target.closest('#speakBtn')) return;
      hearAgain(e);
    });
    A.Kit.onPointer($('#bubble'), hearAgain);
    if (wrap) A.Kit.onPointer(wrap, onBoardPointer, { move: 20 });
  } else {
    $('#munchBtn').addEventListener('click', onMunchBtn);
    $('#speakBtn').addEventListener('click', hearAgain);
    $('#rule').addEventListener('click', function (e) { if (e.target && e.target.closest && e.target.closest('#speakBtn')) return; speakRule(); });
    $('#bubble').addEventListener('click', function (e) { e.stopPropagation(); hearAgain(e); });
    if (wrap) wrap.addEventListener('click', onBoardPointer);
  }
  // the bubble is the food friend talking: their face at its left (2026-10-22 voice)
  (function () { var bb = $('#bubble'); if (!bb || bb.querySelector('.bfriend') || !P1) return; var f = document.createElement('button'); f.type = 'button'; f.className = 'bfriend'; f.setAttribute('aria-label', 'Hear a tip'); try { f.innerHTML = A.Blobs.forProfile(P1, { expr: 'happy' }); } catch (e) {} bb.insertBefore(f, bb.firstChild); f.addEventListener('click', function (e) { e.stopPropagation(); hostTip(); }); })();
  $('#bubble').classList.add('tappable'); $('#bubble').setAttribute('title', 'Tap to hear the question');
  function toggleMusic() { var on = M.toggle(); renderMusicBtn(); bubble(on ? 'Music on' : 'Music off'); }
  function renderMusicBtn() { var b = $('#musicBtn'); b.classList.toggle('off', S.music === false); b.setAttribute('aria-label', S.music === false ? 'Music is off (M)' : 'Music is on (M)'); }
  $('#musicBtn').addEventListener('click', function (e) { e.stopPropagation(); toggleMusic(); });
  wireMore();
  (function () {
    function goMunchHome() {
      V.stop(); M.stop(); A.Store.save();
      if (STORY && SR && $('#game').classList.contains('on')) { location.href = 'index.html?mode=story&from=' + SR.i + '&to=' + SR.i; return; }
      location.href = A.ROOT + 'index.html' + (STORY && !(A.toddler && A.toddler(P1)) ? '#mode' : '#games');
    }
    if (A.UI && A.UI.bindHome) A.UI.bindHome($('#homeBtn'), goMunchHome);
    else $('#homeBtn').addEventListener('click', function () { SFX.tap(); goMunchHome(); });
  })();
  A.on('voice:start', function () { $('#speakBtn').classList.add('talking'); });
  A.on('voice:end', function () { $('#speakBtn').classList.remove('talking'); });
  window.addEventListener('resize', layout);
  window.addEventListener('orientationchange', function () { setTimeout(layout, 250); });
  window.addEventListener('pagehide', function () { A.Store.save(); });
  document.addEventListener('mouseup', function (e) { var b = e.target.closest && e.target.closest('#game button'); if (b) b.blur(); });

  // key hints
  function kb(k, label, cls) { return '<kbd data-k="' + k + '"' + (cls ? ' class="' + cls + '"' : '') + '>' + label + '</kbd>'; }
  function arrowsHtml() { return '<span class="arrows">' + kb('ArrowUp', '↑', 'up') + kb('ArrowLeft', '←') + kb('ArrowDown', '↓') + kb('ArrowRight', '→') + '</span>'; }
  function wasdHtml() { return '<span class="arrows">' + kb('w', 'W', 'up') + kb('a', 'A') + kb('s', 'S') + kb('d', 'D') + '</span>'; }
  if (TWO) {
    $('#keys').innerHTML = '<span class="grp pk p2"><span class="mini">' + A.Blobs.forProfile(P2) + '</span><b>' + A.esc(P2.name) + '</b>' + wasdHtml() + ' move ' + kb('f', 'F') + ' munch</span>' +
      '<span class="grp"><kbd data-k="r">R</kbd> rules</span>' +
      '<span class="grp pk p1"><span class="mini">' + A.Blobs.forProfile(P1) + '</span><b>' + A.esc(P1.name) + '</b>' + arrowsHtml() + ' move ' + kb(' ', 'Space', 'wide') + ' munch</span>';
    $('#munchBtn').style.display = 'none';
  }
  // controller hints (shown instead of the key hints while a controller is in use)
  function padKeys() {
    var old = A.$('#padKeys'); if (old) old.remove();
    var h;
    if (!TWO) h = A.Pad.keys([['dpad', 'move'], ['a', 'munch'], ['y', 'hear it again'], ['b', 'pause']]);
    else { var who = function (k, pl) { var s = A.Pad.seats()[k]; return '<span class="grp pk p' + (k + 1) + '"><span class="mini">' + A.Blobs.forProfile(pl) + '</span><b>' + A.esc(pl.name) + '</b> ' + (s ? '🎮 ' + A.Pad.g('dpad') + ' move ' + A.Pad.g('a') + ' munch' : (k ? 'W A S D + F' : 'Arrows + Space') + ' (keyboard)') + '</span>'; };
      h = '<div class="keys padkeys">' + who(1, P2) + '<span class="grp">' + A.Pad.g('y') + ' rules</span>' + who(0, P1) + '</div>'; }
    var el = A.el(h); el.id = 'padKeys'; $('#keys').after(el);
  }
  padKeys(); A.on('pad:seats', padKeys);
  renderMusicBtn();

  UI.gear({ onClose: function (changed) {
    $('#starCount').textContent = P1.stars; T.on = timerWanted(); document.body.classList.toggle('notimer', !T.on); M.apply(); renderMusicBtn();
    if (changed && G.active) { stopGrumbly(); stopTimer(); G.active = false; nextRound(); }
  } });

  /* ---------- start ---------- */
  A.HowTo.button(function () { return STORY && !G.active ? 'story' : 'munch'; }, '#homeBtn');   // quality1 (C3): the "?" how-to card
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (cellEls.length) fitCells(); });
  if (STORY) { document.body.classList.add('story');   // back from a Snack Slugger stop: ?from=i&to=j hops the friend along
    var qf = qs.from != null && qs.from !== '' && ST.STOPS[+qs.from] ? +qs.from : null, qt = qs.to != null && qs.to !== '' && ST.STOPS[+qs.to] ? +qs.to : qf;
    if (qf != null) { try { history.replaceState(null, '', 'index.html?mode=story'); } catch (e) {} if (qt === qf) A.MunchMap.preselect(qf); }
    A.HowTo.first('story').then(function () { storyMap(qf, qt); }); }
  else if (!TWO) {
    M.play('game');
    PRE = C.pickRound(P1, { placement: true }); A.Store.save();
    var fs = PRE.skill, fl = PRE.level;
    A.HowTo.first('munch').then(function () { return UI.card({ cls: 'ready', tag: fs.name + ' · Level ' + (fl + 1), title: A.TITLES.munch, art: '<div class="jump">' + A.Blobs.forProfile(P1, { expr: 'happy' }) + '</div>',
      sub: A.isTouchOnly() ? 'Tap a square to walk. Tap your friend to munch!' : (A.Pad.inUse() ? 'D-pad to move. ' + A.Pad.name('a') + ' to munch!' : 'Arrow keys to move. Space to munch!') + (T.on ? ' Beat the clock!' : ''), btn: '▶ Play', voice: ['munch_title', A.isTouchOnly() ? 'munch_ready_touch' : 'munch_ready'] })
      ; }).then(nextRound);
  } else {
    M.play('game');
    var art = '<div class="duo mini2"><div class="pcol p2"><div class="pa jump">' + A.Blobs.forProfile(P2, { expr: 'happy' }) + '</div><b class="pn">' + A.esc(P2.name) + '</b><span class="kk">' + A.Pad.label(1, 'W A S D + F') + '</span></div>' +
      '<div class="pcol p1"><div class="pa jump">' + A.Blobs.forProfile(P1, { expr: 'happy' }) + '</div><b class="pn">' + A.esc(P1.name) + '</b><span class="kk">' + A.Pad.label(0, 'Arrows + Space') + '</span></div></div>';
    UI.card({ cls: 'ready two', tag: MODE === 'team' ? 'Team munch' : 'Munch race', title: A.TITLES.munch, html: art,
      sub: MODE === 'team' ? 'Munch your own color. Work together to beat the clock!' : 'Munch your own color. Who finishes first?', btn: '▶ Play', voice: ['munch_title', MODE === 'team' ? 'munch_2p_team' : 'munch_2p_race'] })
      .then(nextRound);
  }

  if (wrap && !wrap._munchRO && typeof ResizeObserver === 'function') {
    var roT = 0;
    wrap._munchRO = new ResizeObserver(function () { clearTimeout(roT); roT = setTimeout(function () { if (G.active) layout(); }, 50); });
    wrap._munchRO.observe(wrap);
  }
  var clockEl = document.querySelector('#timer .clock'); if (clockEl && A.Icons && !clockEl.querySelector('svg')) clockEl.innerHTML = A.Icons.html('ui.clock', { size: 28, decorative: true, cls: 'pp-pic', slot: 'munch:timer', fallback: '' });
  window.__munch = { showIdleHand: showIdleHand, shortFact: shortFact, fbOn: function () { return FB.on; }, cellTap: function (i) { onCellTap(i); }, hideHand: hideHand, poke: poke, IDLE_MS: IDLE_MS, nearestGood: nearestGood, renderRule: renderRule, fitRulePic: fitRulePic, fitBubble: fitBubble, layout: layout, cutscene: cutscene, gentleStars: gentleStars, withBonus: withBonus, timerFor: timerFor, G: G, PL: PL, T: T, B: B, openBonus: openBonus, gentle: GENTLE, retryRound: retryRound, P: function () { return P1; }, two: TWO, mode: MODE, munch: munch, moveBy: function (a, b, c) { if (c === undefined) return moveBy(0, a, b); return moveBy(a, b, c); },
    onCellTap: onCellTap, pickCellAt: pickCellAt, onBoardPointer: onBoardPointer, speakRule: speakRule, speakBoardRule: speakBoardRule, ruleParts: ruleParts, TAP_MIN: TAP_MIN,
    nextRound: nextRound, unlockScene: unlockScene, story: STORY, SR: function () { return SR; }, cutscene: cutscene, endRound: endRound, showStar: showStar, fitCells: fitCells, workedExample: workedExample, coachAfter: coachAfter, celebrateStreak: celebrateStreak, renderBoard: renderBoard, setTimeLeft: function (s) { T.left = s; renderTimer(); }, COLS: COLS,
    goTo: function (i, cell) { if (cell === undefined) { cell = i; i = 0; } var pl = PL[i]; pl.target = null; clearTimeout(pl.walkT); pl.walkT = null; pl.pos = { r: Math.floor(cell / COLS), c: cell % COLS }; place(true); checkStar(pl); }, playStop: playStop,
    DEMO: DEMO, shouldDemo: shouldDemo, runDemo: runDemo, skipDemo: skipDemo, setHost: setHost, showBoardHint: showBoardHint, hideBoardHint: hideBoardHint, littleGrid: littleGrid, applyGrid: applyGrid, markWhy: markWhy, praiseFor: praiseFor, toggleMore: toggleMore };
})(window.Arcade);
