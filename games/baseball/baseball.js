/* Blob Baseball — math baseball on the Blob Arcade core.
   SLUGGER 2 (2026-10-22, parent: "more variation and less automatic success"); the rules live in rules.js (A.SluggerRules):
   · a wrong answer is an OUT (pop-up / foul tip / grounder caught by a friendly fielder; gentle text + the coach's fact);
     a right answer is a hit most of the time, but a slow answer on an easy pitch can be a long fly ball that is caught.
   · a half-inning ends at 3 outs (4 outs at age 4 and under) or the mercy rule (5 runs; 4 at age 4 and under). No lineup cap.
   · solo games: the friendly rival Sprout Squad bats the top half (simulated, modest), real score by inning, win / tie /
     loss cards (a loss is "Good game! Rematch?"); a walk-off ends the last inning once she's ahead. Once per inning when
     behind or tied: a text-only scoreboard question (runs to tie / to win; age 4 and under count the runs as dots).
   · about 1 in 4 hits: a text-only base-running question (where does the runner end up / how many runs / how many bases).
     Bonus questions never change the score and are not coach answers.
   · stretch pitches come from the coach (the hardest of several at-level facts, or a next-level item) and come more often
     when she's cruising, less when it is hard (R.stretchRate). Stars: 1 + win + (win with the run goal and 2 stretch hits).
   · occasional walks; hits go left / center / right; runners sometimes take an extra base.
   Below is the older (ux3b) note, still true for the hit odds.
   Every pitch is ONE question at the kid's coached level (A.Questions + the coach's item pick; now and then a "stretch"
   pitch with bigger numbers at the same level). No swing picking (owner, ux3b): a right answer is always a hit and the
   kind of hit is a surprise, like real baseball — single, double, triple or (rarely) a home run. The odds lean toward
   bigger hits for a quick answer (scaled to age and her own usual time) and a harder question (stretch / tougher item /
   higher level); age 4 and under get friendlier odds (more doubles). See HIT ODDS below. Stars do not use the dice:
   stars and outs are now set by SLUGGER 2 above (no more strikes, no lineup cap).
   Controls: tap/click a big answer card, or keys 1–4, or arrows + Space/Enter (F works too). R repeats the question,
   M music. 2 players (same device): alternating half-innings, each kid with their own questions. */
(function (A) {
  'use strict';
  var R = A.SluggerRules, $ = A.$, C = A.Curriculum, Q = A.Questions, V = A.Voice, SFX = A.Audio.SFX, UI = A.UI, M = A.Music, B = A.Blobs;
  UI.boot();
  var P1 = A.Store.active();
  if (!P1) { location.replace(A.ROOT + 'index.html#players'); return; }
  C.ensure(P1);
  var S = A.Store.settings;
  var qs = {}; location.search.replace(/^\?/, '').split('&').forEach(function (kv) { var p = kv.split('='); if (p[0]) qs[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ''); });
  // a player's name (browser voice); without speech: "Player 1" / "Player 2" in a 2-player game, nothing otherwise
  function nameParts(p, alt) { var i = (typeof PL !== 'undefined' && PL) ? PL.findIndex(function (pl) { return pl.P === p; }) : -1; return A.Voice.name(p, alt || (TWO && i >= 0 ? [i === 1 ? 'pl_two' : 'pl_one'] : [])); }
  function bb(p) { return p.games.baseball; }
  var GUEST = { easy: ['count10', 1], medium: ['add10', 1], hard: ['add20', 1] };
  function makeGuest(kind) {
    var g = A.Store.blank('Guest', 'carrot'); g.id = 'guest'; g.color = 'sky'; g.guest = true; g.age = kind === 'easy' ? 4 : null; C.ensure(g);
    var lv = GUEST[kind] || GUEST.medium; C.place(g, lv[0]); C.state(g, lv[0]).level = lv[1]; C.state(g, lv[0]).introduced = true; return g;
  }
  var SPEED = 1;                      // tests speed the animations up
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms / SPEED); }); }
  function tween(ms, fn, ease) {
    ms = ms / SPEED;
    return new Promise(function (res) {
      var t0 = performance.now();
      function f(now) { var t = Math.min(1, (now - t0) / ms); fn(ease ? ease(t) : t); if (t < 1) requestAnimationFrame(f); else res(); }
      if (ms <= 0) { fn(1); res(); } else requestAnimationFrame(f);
    });
  }
  function eio(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function eout(t) { return 1 - Math.pow(1 - t, 3); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function sayWait(parts, cap) { return Promise.race([V.say(parts, { bubble: false }), wait(cap || 4000)]); }
  function sayWaitMix(list, cap, o) { return Promise.race([V.sayMix(list, o), wait(cap || 4000)]); }

  /* ================= sound effects (Web Audio, made on the fly) ================= */
  function ac() { if (!S.sound) return null; return A.Audio.context(); }
  function noiseBuf(a, sec) { var n = Math.floor(a.sampleRate * sec), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0); for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return b; }
  function noise(sec, type, freq, q, vol, attack, when) {
    var a = ac(); if (!a) return; var t = a.currentTime + (when || 0), s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    s.buffer = noiseBuf(a, sec + .05); f.type = type; f.frequency.value = freq; f.Q.value = q || 1;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (attack || .005)); g.gain.exponentialRampToValueAtTime(0.0001, t + sec);
    s.connect(f); f.connect(g); g.connect(a.destination); s.start(t); s.stop(t + sec + .05);
  }
  var FX = {
    crack: function () { noise(.09, 'highpass', 1800, .7, .5, .002); A.Audio.tone(2300, .05, { vol: .12, type: 'square', to: 900 }); A.Audio.tone(140, .08, { vol: .18, type: 'triangle', to: 70 }); },
    whoosh: function () { var a = ac(); if (!a) return; var t = a.currentTime, s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = noiseBuf(a, .35);
      f.type = 'bandpass'; f.Q.value = 1.4; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(2600, t + .25);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.22, t + .12); g.gain.exponentialRampToValueAtTime(0.0001, t + .3); s.connect(f); f.connect(g); g.connect(a.destination); s.start(t); s.stop(t + .35); },
    mitt: function () { noise(.12, 'lowpass', 500, .8, .35, .003); A.Audio.tone(110, .1, { vol: .14, type: 'triangle', to: 70 }); },
    pitch: function () { A.Audio.tone(520, .18, { vol: .05, to: 760 }); },
    cheer: function (big) { // a crowd: a bed of filtered noise that swells, plus little "yay" chirps
      noise(big ? 2.6 : 1.4, 'bandpass', 1100, .5, big ? .26 : .16, big ? .35 : .2);
      noise(big ? 2.2 : 1.2, 'bandpass', 2400, .9, big ? .12 : .07, .3);
      for (var i = 0; i < (big ? 14 : 6); i++) A.Audio.tone(600 + Math.random() * 700, .12, { vol: .03, type: 'triangle', to: 900 + Math.random() * 700, when: .1 + Math.random() * (big ? 1.8 : .9) });
    },
    aww: function () { A.Audio.tone(420, .5, { vol: .05, to: 300, type: 'triangle' }); },
    step: function () { A.Audio.tone(300 + Math.random() * 60, .05, { vol: .05, type: 'triangle' }); },
    boom: function () { noise(.5, 'lowpass', 300, .7, .3, .01); A.Audio.tone(1500 + Math.random() * 800, .25, { vol: .03, to: 400 }); }
  };

  /* ================= who's playing ================= */
  var TWO = qs.mode === 'two', P2 = null;
  if (TWO && qs.p2) { P2 = /^guest/.test(qs.p2) ? makeGuest(qs.p2.split('-')[1]) : A.Store.get(qs.p2); if (P2 && P2.id === P1.id) P2 = null; if (P2) C.ensure(P2); }
  if (TWO && !P2) TWO = false;
  var COLORS = [{ c: '#3d8ef0', d: '#2a6cc4', soft: '#e3efff', name: 'blue' }, { c: '#ff8a2a', d: '#d96a10', soft: '#ffeedd', name: 'orange' }];
  var INNINGS = 3;
  /* story mode (game mix, 2026-10-22): a Picnic Island stop that plays Snack Slugger (?mode=story&stop=i, from the Munch map).
     The stop's skill and level (Story.sluggerConfig), 2 short innings, goal = hits (3; 2 at age 4 and under via A.Age; one
     fewer on a "helper" stop after two misses). Reaching the goal clears the stop at once. The stop is saved with
     Story.record, the same as a Munch stop (journey score, stars, rewards, challenge unlocks). Every answer goes to the coach
     (C.recordAnswer), as in Munch story stops, which also skip the free-play round scoring. Then back to the map. */
  var ST = A.Story, STORYB = qs.mode === 'story', SI = STORYB ? +qs.stop : -1, SC = null;
  if (STORYB) {
    if (!ST || !ST.STOPS[SI] || ST.gameOf(P1, SI) !== 'slugger' || !ST.playable(P1, SI)) { location.replace('../munch/index.html?mode=story'); return; }
    SC = ST.sluggerConfig(P1, SI); INNINGS = SC.innings; TWO = false; P2 = null;
  }
  var MAPURL = '../munch/index.html?mode=story';
  function capFor(p) { if (TWO) return 5; return A.Age.little(p) ? 4 : A.Age.preReader(p) ? 5 : 6; }
  function nChoices(p) { return A.Age.choices(p); }   // 3 choices at 4 and under (A.Age)
  /* ================= HIT ODDS (ux3b) =================
     A right answer is always a hit; WHICH hit is gameplay randomness (never a reward drop — stars/stickers don't roll dice).
     power (0..1) = 0.55 × speed + 0.45 × difficulty
       speed: 1 when the answer comes within "quick" seconds (2.5 s; 3.5 s age 5; 4.5 s age 4 and under — nudged toward her
              own usual time on this skill), sliding to 0 at 3 × quick. Answering before the question is read out counts as quick.
       difficulty: 1 for a stretch pitch (bigger numbers); otherwise from the coach's expected success for the item
              (82.5 % target → 0, 60 % → 1), plus a little for higher levels (+0.15 per level, up to +0.3).
     odds = blend of SLOW_EASY and FAST_HARD by power. Age 4 and under: 14 points move from singles to doubles. */
  var HITS = R.HITS, ORDER = R.ORDER;
  function quickSec(p, sid) {
    var base = A.Age.little(p) ? 4.5 : A.Age.preReader(p) ? 3.5 : 2.5, rt = p && !p.guest && p.games && p.games.baseball && p.games.baseball.rt ? p.games.baseball.rt[sid] : null;
    return rt ? Math.min(base * 1.6, Math.max(base * .6, rt * .85)) : base;
  }
  var speedOf = R.speedOf, hitOdds = R.hitOdds, rollHit = R.rollHit;
  function diffOf(q) {
    var d = q.hard || q.offset > 0 ? 1 : q.coachP != null ? Math.min(1, Math.max(0, (.825 - q.coachP) / .225)) : 0;
    return Math.min(1, d + Math.min(.3, .15 * (q.level || 0)));
  }

  /* ================= menu (1 player / 2 players / high scores) ================= */
  if (!qs.mode) return showMenu();
  function tile(id, title, sub, art, cls) { return '<button class="mtile ' + (cls || '') + '" data-nav data-id="' + id + '"><span class="ma">' + art + '</span><span class="mt">' + A.esc(title) + '</span>' + (sub ? '<span class="ms">' + sub + '</span>' : '') + '</button>'; }
  function showMenu() {
    var sec = $('#menu'), step = 'main';
    A.$$('.screen').forEach(function (s) { s.classList.toggle('on', s === sec); }); document.body.classList.add('menu');
    $('#menuAv').innerHTML = B.forProfile(P1, { expr: 'happy', outfit: 'helmet', helmet: COLORS[0].c, helmetDark: COLORS[0].d });
    $('#menuHi').textContent = 'Hi, ' + P1.name + '! Best: ' + (bb(P1).best || 0) + ' runs';
    function mus() { $('#menuMusic').classList.toggle('off', S.music === false); }
    function go(q) { SFX.pop(); V.say(['bb_play_ball']); setTimeout(function () { location.href = 'index.html?' + q; }, 420); }
    function back() { SFX.tap(); if (step === 'partner') render('main'); else location.href = A.ROOT + 'index.html#games'; }
    function render(s) {
      step = s; var box = $('#menuTiles'), fns = {};
      if (s === 'main') {
        $('#menuQ').textContent = 'One player, or two players?';
        box.innerHTML = tile('one', '1 Player', '3 innings vs the Sprout Squad · Right answers hit, misses are outs!', '<span class="one bat">' + B.forProfile(P1, { expr: 'bat', outfit: 'helmet', helmet: COLORS[0].c, helmetDark: COLORS[0].d }) + '</span>', 'onep') +
          tile('two', '2 Players', 'Take turns at bat, each with your own questions', '<span class="pair">' + B.forProfile(P1, { expr: 'happy', outfit: 'helmet', helmet: COLORS[0].c, helmetDark: COLORS[0].d }) + B.svg({ blob: P1.blob === 'apple' ? 'strawberry' : 'apple', expr: 'happy', outfit: 'helmet', helmet: COLORS[1].c, helmetDark: COLORS[1].d }) + '</span>', 'two');
        fns = { one: function () { go('mode=solo'); }, two: function () { V.say(['hub_pick_friend']); render('partner'); } };
      } else {
        $('#menuQ').textContent = 'Who is playing with ' + P1.name + '?';
        var h = '';
        A.Store.profiles().filter(function (p) { return p.id !== P1.id; }).forEach(function (p) {
          h += tile('p:' + p.id, p.name, '⭐ ' + p.stars + ' · best ' + (bb(p).best || 0), '<span class="one">' + B.forProfile(p, { expr: 'happy' }) + '</span>', 'kidt');
          fns['p:' + p.id] = function () { V.say([nameParts(p)]); go('mode=two&p2=' + encodeURIComponent(p.id)); };
        });
        [['easy', 'Guest · Easy', 'Counting'], ['medium', 'Guest · Medium', 'Adding to 10'], ['hard', 'Guest · Hard', 'Adding to 20']].forEach(function (g) {
          h += tile('g:' + g[0], g[1], g[2], '<span class="one">' + B.svg({ blob: 'corn', color: 'sky', expr: 'happy' }) + '</span>', 'guest');
          fns['g:' + g[0]] = function () { go('mode=two&p2=guest-' + g[0]); };
        });
        box.innerHTML = h + '<button class="mtile backt" data-nav data-id="back"><span class="mt">◀ Back</span></button>'; fns.back = back;
      }
      var one = A.$('#menuTiles .mtile[data-id=one]'); if (one) one._say = ['hub_one_player', 'bb_one_player_sub'];   // keyboard focus reads the tile
      // short descriptions on hover / focus / long-press (never spoken; 2026-10-22)
      var BTIPS = { one: 'Play the Sprout Squad! Right answers are hits, wrong ones are outs. Score more runs to win.', two: 'Take turns at bat with a friend.', back: 'Go back one step.', 'g:easy': 'Play with a guest who is learning to count.', 'g:medium': 'Play with a guest who adds to 10.', 'g:hard': 'Play with a guest who adds to 20.' };
      A.$$('#menuTiles .mtile').forEach(function (b) { var id = b.dataset.id, nm = (b.querySelector('.mt') || b).textContent.trim(), t = BTIPS[id] || (/^p:/.test(id) ? 'Take turns at bat with ' + nm + '.' : ''); if (t) UI.tip(b, t, { name: nm }); });
      A.$$('#menuTiles .mtile').forEach(function (b) { b.addEventListener('click', function () { var f = fns[b.dataset.id]; if (f) f(); }); b.addEventListener('pointerenter', function () { B.anim(b, 'squish', 420); }); });
      // 2-player setup: controllers join with A, X swaps seats (js/core/gamepad.js)
      A.Pad.context({ setup: s === 'partner' });
      if (s === 'partner') A.Pad.mountSeats($('#menuSeats'), function () { return [P1.name, 'friend']; }); else $('#menuSeats').innerHTML = '';
      $('#menuPadKeys').innerHTML = A.Pad.keys([['dpad', 'choose'], ['a', 'pick'], ['b', 'back'], ['x', s === 'partner' ? 'swap controllers' : 'high scores']], 'mk');
      var first = box.querySelector('[data-nav]'); setTimeout(function () { try { first.focus({ preventScroll: true }); } catch (e) {} }, 30);
    }
    $('#menuHome').addEventListener('click', function () { SFX.tap(); M.stop(); location.href = A.ROOT + 'index.html#games'; });
    $('#menuScores').addEventListener('click', function () { SFX.pop(); scores(); });
    $('#menuMusic').addEventListener('click', function () { M.toggle(); mus(); });
    document.addEventListener('keydown', function (e) {
      if (UI.cardOpen || A.Parent.isOpen() || A.$('#gate')) return;
      if (e.key === 'Escape' || e.key === 'Backspace') { e.preventDefault(); back(); }
      else if (e.key === 'm' || e.key === 'M') { M.toggle(); mus(); }
      else if (e.key === 'h' || e.key === 'H') scores();
      else if ((e.key === 'f' || e.key === 'F') && document.activeElement && document.activeElement.matches('#menu button')) { e.preventDefault(); if (!e.repeat) document.activeElement.click(); }
    });
    UI.arrowNav(function () { return A.$$('#menu [data-nav]'); });
    UI.gear({ onClose: function () { mus(); M.apply(); render(step); } });
    render('main'); mus(); V.say(['bb_title']); M.play('ballpark');
    window.__bbMenu = { render: render, step: function () { return step; } };
  }

  /* ---------- family leaderboard (best runs in one game, per profile) ---------- */
  function boardHTML(hiIds) {
    var rows = A.Store.profiles().slice().sort(function (a, b) { return (bb(b).best || 0) - (bb(a).best || 0) || (bb(b).homers || 0) - (bb(a).homers || 0); });
    return '<div class="lboard">' + rows.map(function (p, i) {
      var x = bb(p);
      return '<div class="lrow' + (hiIds && hiIds.indexOf(p.id) >= 0 ? ' me' : '') + '"><span class="lr">' + (x.games ? ['🥇', '🥈', '🥉'][i] || (i + 1) : '·') + '</span><span class="la">' + B.forProfile(p, { expr: 'happy' }) + '</span>' +
        '<span class="ln">' + A.esc(p.name) + '</span><span class="lb"><b>' + (x.best || 0) + '</b> runs</span><span class="lh">⚾ ' + (x.homers || 0) + ' HR · ' + (x.games ? x.games + (x.games === 1 ? ' game' : ' games') : 'no games yet') + '</span></div>';
    }).join('') + '</div>';
  }
  function scores() { V.say(['bb_high_scores']); return UI.card({ tag: 'Family', title: 'High scores', html: boardHTML([P1.id]) + '<p class="small">Most runs in one game. Fast, tricky answers hit the most home runs!</p>', btn: 'OK', cls: 'scores', minMs: 300 }); }

  /* ================= the game ================= */
  var sec = $('#game'); A.$$('.screen').forEach(function (s) { s.classList.toggle('on', s === sec); });
  document.body.classList.toggle('two', TWO);
  function mkPlayer(P, i) { return { i: i, P: P, name: P.name, col: COLORS[i], runsBy: [], hits: 0, homers: 0, right: 0, wrong: 0, pitches: 0, outs: 0, round: null, hr: 0, hw: 0, sw: {}, tricky: 0, log: [], t0: 0, cap: capFor(P), times: [] }; }
  var PL = [mkPlayer(P1, 0)]; if (TWO) PL.push(mkPlayer(P2, 1));
  // the friendly rival team (solo free play only; story stops and 2-player games have no rival)
  var RIVALON = !TWO && !STORYB, RIV = { name: R.RIVAL.name, icon: R.RIVAL.icon, runsBy: [], hits: 0, col: { c: '#4caf50', d: '#2e7d32' } };
  var LITTLE = A.Age.little(P1);
  function maxOuts() { return STORYB && SC && SC.outs ? SC.outs : R.outsFor(A.Age.little(bat().P)); }   // after9: a story stop is one big inning with SC.outs (4) outs
  function mercy() { return STORYB ? 99 : R.mercyFor(A.Age.little(bat().P)); }
  var G = { phase: 'intro', inning: 1, half: 0, outs: 0, strikes: 0, pa: 0, halfRuns: 0, missLast: false, recentAt: [], scoreQ: {}, bonusN: 0, hitN: 0, walkoff: false, bases: [null, null, null], q: null, accept: false, busy: false, sel: 0, qT0: 0, voiceDone: false, over: false, t0: Date.now(), recent: [], pitchN: 0, clockT: null, timer: null };
  function bat() { return PL[G.half]; }

  /* ---------- the ballpark (one SVG, 1600 × 900; extends past its box so wide/tall screens show more sky and grass) ---------- */
  var VB = { x: 120, y: 66, w: 1360, h: 765 };   // the camera: a slightly zoomed-in view of the 1600 × 900 scene
  var W = 1600, H = 900, HOME = { x: 800, y: 700 }, BASES = [{ x: 1085, y: 560 }, { x: 800, y: 432 }, { x: 515, y: 560 }], MOUND = { x: 800, y: 556 };
  var PATH = [HOME, BASES[0], BASES[1], BASES[2], HOME];
  var FIELDERS = [{ x: 430, y: 408 }, { x: 800, y: 378 }, { x: 1170, y: 408 }];
  var FANCOL = ['#ffd6e3', '#d4f7e8', '#dcefff', '#fff6cf', '#eee6ff', '#ffe1cc', '#c9f2ff', '#ffc9d9'];
  function parkSVG() {
    var s = '<svg id="parkSvg" viewBox="' + VB.x + ' ' + VB.y + ' ' + VB.w + ' ' + VB.h + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs>' +
      '<linearGradient id="gSky" x1="0" y1="0" x2="0" y2="330" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6fc2ff"/><stop offset="1" stop-color="#d4f0ff"/></linearGradient>' +
      '<linearGradient id="gGrass" x1="0" y1="350" x2="0" y2="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6fcf73"/><stop offset="1" stop-color="#4fb85a"/></linearGradient>' +
      '<radialGradient id="gDirt" cx="50%" cy="70%" r="70%"><stop offset="0" stop-color="#f6d4a0"/><stop offset="1" stop-color="#e5b77c"/></radialGradient>' +
      '<radialGradient id="gSun"><stop offset="0" stop-color="#fffbd1"/><stop offset=".7" stop-color="#ffe066"/><stop offset="1" stop-color="#ffc93c"/></radialGradient></defs>';
    s += '<rect x="-3000" y="-3000" width="7600" height="3001" fill="#6fc2ff"/><rect x="-3000" y="0" width="7600" height="340" fill="url(#gSky)"/>';
    // sun + clouds
    s += '<g class="sun" transform="translate(1440 92)"><g class="rays">';
    for (var i = 0; i < 12; i++) s += '<rect x="-7" y="-92" width="14" height="30" rx="7" fill="#ffd23c" opacity=".8" transform="rotate(' + i * 30 + ')"/>';
    s += '</g><circle r="54" fill="url(#gSun)"/><circle cx="-17" cy="-6" r="5" fill="#4a3b6b"/><circle cx="17" cy="-6" r="5" fill="#4a3b6b"/><path d="M-16 12 Q0 26 16 12" stroke="#4a3b6b" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="-30" cy="10" rx="9" ry="5" fill="#ff9fb8" opacity=".7"/><ellipse cx="30" cy="10" rx="9" ry="5" fill="#ff9fb8" opacity=".7"/></g>';
    [[150, 70, 1], [520, 40, .8], [1120, 60, .9], [-260, 90, .9], [1850, 50, 1]].forEach(function (c, k) {
      s += '<g class="cloud c' + k + '" transform="translate(' + c[0] + ' ' + c[1] + ') scale(' + c[2] + ')"><ellipse cx="0" cy="20" rx="80" ry="26" fill="#fff"/><ellipse cx="-36" cy="6" rx="38" ry="30" fill="#fff"/><ellipse cx="22" cy="-4" rx="46" ry="38" fill="#fff"/></g>';
    });
    // pennants + stands + crowd of tiny blobs
    s += '<path d="M-3000 150 H4600" stroke="#fff" stroke-width="3" opacity=".8"/>';
    for (var px = -400; px < 2000; px += 60) s += '<path d="M' + px + ' 150 l30 0 l-15 26z" fill="' + ['#ff8fb1', '#ffd23c', '#8fe3c0', '#9fd2ff', '#c9b2ff'][((px + 400) / 60) % 5] + '"/>';
    s += '<rect x="-3000" y="176" width="7600" height="150" fill="#6f7fd0"/>';
    for (var r = 0; r < 4; r++) s += '<rect x="-3000" y="' + (184 + r * 36) + '" width="7600" height="6" fill="#8796e0"/>';
    s += '<g id="crowd">';
    for (var row = 0; row < 3; row++) for (var fx = -380 + (row % 2) * 18; fx < 1990; fx += 36) {
      var col = FANCOL[(Math.abs(fx * 7 + row * 13)) % FANCOL.length], y = 204 + row * 38, d = ((fx * 13 + row * 7) % 100) / 100;
      s += '<g class="fan" style="--d:' + (d * 1.6).toFixed(2) + 's"><g transform="translate(' + fx + ' ' + y + ')"><path d="M-14 12 C-16 -10 16 -10 14 12Z" fill="' + col + '" stroke="#00000014" stroke-width="2"/><circle cx="-5" cy="0" r="2.3" fill="#4a3b6b"/><circle cx="5" cy="0" r="2.3" fill="#4a3b6b"/><path d="M-4 5 Q0 8 4 5" stroke="#4a3b6b" stroke-width="1.6" fill="none"/></g></g>';
    }
    s += '</g>';
    // outfield wall + foul poles
    s += '<rect x="-3000" y="318" width="7600" height="36" fill="#2f8f5b"/><rect x="-3000" y="316" width="7600" height="6" fill="#ffd23c"/>';
    [[300, '330'], [800, '400'], [1300, '330']].forEach(function (m) { s += '<text x="' + m[0] + '" y="345" font-size="20" font-weight="700" fill="#fff" opacity=".85" text-anchor="middle" font-family="sans-serif">' + m[1] + '</text>'; });
    s += '<rect x="-3000" y="354" width="7600" height="3000" fill="url(#gGrass)"/>';
    for (var st = 0; st < 10; st++) s += '<rect x="-3000" y="' + (354 + st * 60) + '" width="7600" height="30" fill="#fff" opacity=".05"/>';
    s += '<rect x="86" y="200" width="10" height="154" fill="#ffd23c"/><rect x="1504" y="200" width="10" height="154" fill="#ffd23c"/>';
    // infield
    s += '<path d="M800 790 L1190 556 Q800 300 410 556 Z" fill="url(#gDirt)"/>';
    s += '<path d="M800 668 L1036 556 L800 466 L564 556 Z" fill="#62c46a"/><path d="M800 668 L1036 556 L800 466 L564 556 Z" fill="#fff" opacity=".06"/>';
    s += '<path d="M800 700 L1508 354 M800 700 L92 354" stroke="#fff" stroke-width="5" opacity=".9"/>';
    s += '<ellipse cx="800" cy="556" rx="56" ry="22" fill="#e9bd83"/><rect x="784" y="550" width="32" height="7" rx="2" fill="#fff"/>';
    s += '<ellipse cx="800" cy="704" rx="110" ry="44" fill="#ecc28a"/>';
    s += '<rect x="712" y="684" width="60" height="44" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/><rect x="828" y="684" width="60" height="44" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>';
    s += '<path d="M786 696 H814 V706 L800 714 L786 706 Z" fill="#fff" stroke="#d8c7a8" stroke-width="2"/>';
    BASES.forEach(function (b, k) { s += '<rect class="base b' + k + '" x="' + (b.x - 15) + '" y="' + (b.y - 15) + '" width="30" height="30" rx="4" fill="#fff" stroke="#d8c7a8" stroke-width="2" transform="rotate(45 ' + b.x + ' ' + b.y + ') scale(1)" style="transform-origin:' + b.x + 'px ' + b.y + 'px"/>'; });
    s += '<g id="fielders"></g><g id="runners"></g><g id="pitcherG"></g><g id="batterG"></g><g id="trailG"></g><g id="ballG"><ellipse id="ballShadow" rx="12" ry="5" fill="#2d2547" opacity="0"/><g id="ball" opacity="0"><circle r="13" fill="#fff" stroke="#d9d2c4" stroke-width="2"/><path d="M-7 -10 Q-2 0 -7 10 M7 -10 Q2 0 7 10" stroke="#ff5a6e" stroke-width="2.2" fill="none"/></g></g>';
    return s + '</svg>';
  }
  var NS = 'http://www.w3.org/2000/svg';
  function actor(parent, html, w, opts) { // a blob inside the park SVG, feet at (0,0) of its <g>
    opts = opts || {};
    var g = document.createElementNS(NS, 'g'), inner = document.createElementNS(NS, 'g'); inner.setAttribute('class', 'aw ' + (opts.cls || ''));
    inner.innerHTML = html; var sv = inner.querySelector('svg'), h = w * 128 / 120;
    sv.setAttribute('x', -w / 2); sv.setAttribute('y', -h + w * .1); sv.setAttribute('width', w); sv.setAttribute('height', h);
    g.appendChild(inner); parent.appendChild(g); g._w = w; return g;
  }
  function place(g, x, y, s) { g._x = x; g._y = y; g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')' + (s && s !== 1 ? ' scale(' + s.toFixed(3) + ')' : '')); }
  function blobOf(pl, extra) { var o = { expr: 'happy', outfit: 'helmet', helmet: pl.col.c, helmetDark: pl.col.d }; for (var k in extra || {}) o[k] = extra[k]; return B.forProfile(pl.P, o); }

  var park = $('#park'); park.insertAdjacentHTML('afterbegin', parkSVG());
  var svg = $('#parkSvg'), ball = $('#ball'), shadow = $('#ballShadow');
  var rival = P1.blob === 'corn' || (P2 && P2.blob === 'corn') ? 'carrot' : 'corn';
  var pitcher = actor($('#pitcherG'), B.svg({ blob: rival, color: 'grape', outfit: 'cap', expr: 'happy' }), 118, { cls: 'pitcher' }); place(pitcher, MOUND.x, MOUND.y - 4);
  var fielders = FIELDERS.map(function (f, k) { var g = actor($('#fielders'), B.svg({ blob: ['blueberry', 'apple', 'corn'][k], color: 'grape', outfit: 'cap', expr: 'happy' }), 70, { cls: 'fielder' }); place(g, f.x, f.y); return g; });
  var batter = null, batEl = null;
  function newBatter(walkIn) {
    if (batter) batter.remove();
    var pl = bat();
    batter = actor($('#batterG'), blobOf(pl, { expr: 'bat' }), 180, { cls: 'batter' });   // food friends hold their own bat in the 'batting' pose
    batEl = document.createElementNS(NS, 'g'); batEl.setAttribute('class', 'bat'); batEl.style.display = 'none';
    batEl.innerHTML = '<path d="M-6 -4 L10 -5 L112 -11 Q124 -10 124 0 Q124 10 112 11 L10 5 L-6 4 Z" fill="#e0a868" stroke="#a8743a" stroke-width="2.5"/><rect x="-10" y="-6" width="20" height="12" rx="4" fill="#4a3b6b"/><path d="M30 -5 L100 -9" stroke="#fff" stroke-width="2" opacity=".5"/>';
    batter.appendChild(batEl); setBat(-118);
    if (walkIn) { place(batter, 560, 760); return tween(520, function (t) { place(batter, lerp(560, 712, t), 760 - 40 * t - Math.abs(Math.sin(t * Math.PI * 3)) * 12); }); }
    place(batter, 712, 720); return Promise.resolve();
  }
  function setBat(a) { batEl._a = a; batEl.setAttribute('transform', 'translate(50 -66) rotate(' + a.toFixed(1) + ')'); }
  function swing(hit) {
    FX.whoosh(); B.anim(batter.firstChild, 'swing', 420);
    return tween(170, function (t) { setBat(lerp(-118, hit ? 8 : 40, t)); }, eout).then(function () { return wait(hit ? 120 : 260); })
      .then(function () { return tween(260, function (t) { setBat(lerp(hit ? 8 : 40, 70, t)); }); });
  }
  function ballAt(x, y, s, op) { ball.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + (s || 1).toFixed(3) + ')'); ball.setAttribute('opacity', op == null ? 1 : op); }
  function shadowAt(x, y, op, s) { shadow.setAttribute('cx', x); shadow.setAttribute('cy', y); shadow.setAttribute('opacity', op); shadow.setAttribute('rx', 12 * (s || 1)); shadow.setAttribute('ry', 5 * (s || 1)); }
  function throwPitch() {
    B.anim(pitcher.firstChild, 'windup', 560); FX.pitch();
    return wait(330).then(function () {
      var a = { x: 818, y: 494 }, b = { x: 790, y: 666 };
      return tween(360, function (t) { ballAt(lerp(a.x, b.x, t), lerp(a.y, b.y, t) - Math.sin(t * Math.PI) * 26, lerp(.55, 1.15, t)); shadowAt(lerp(a.x, b.x, t), lerp(560, 706, t), .18 * t); });
    });
  }
  // ball flight after contact: quadratic arc with a ground shadow; size shrinks with distance
  var TRAIL = { sg: '#8fe3c0', db: '#9fd2ff', tr: '#ffb08a', hr: '#ffd23c' };
  function fly(to, peak, ms, endScale, keep, kind) {
    var a = { x: 790, y: 660 }, lastT = -1, tg = $('#trailG');
    return tween(ms, function (t) {
      var x = lerp(a.x, to.x, t), gy = lerp(706, to.y, t), y = gy - Math.sin(t * Math.PI) * peak - (1 - t) * 46, s = lerp(1.1, endScale, t);
      ballAt(x, y, s); shadowAt(x, gy, .22 * (1 - t * .5), lerp(1, endScale, t));
      // a sparkly comet trail behind a hit (bigger hits = bigger, brighter trail)
      if (kind && tg && t - lastT > .045 && t < .97) { lastT = t; var c = document.createElementNS(NS, 'circle'), rr = (kind === 'hr' ? 11 : kind === 'tr' ? 9 : 7) * s;
        c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1)); c.setAttribute('r', rr.toFixed(1)); c.setAttribute('fill', TRAIL[kind]); c.setAttribute('class', 'trail'); tg.appendChild(c); setTimeout(function () { c.remove(); }, 900 / SPEED); }
    }).then(function () { if (!keep) { ball.setAttribute('opacity', 0); shadow.setAttribute('opacity', 0); } });
  }
  function hideBall() { ball.setAttribute('opacity', 0); shadow.setAttribute('opacity', 0); }

  /* ---------- runners ---------- */
  function runnerEl(pl) { var g = actor($('#runners'), blobOf(pl), 96, { cls: 'runner' }); return g; }
  function posOnPath(p) { // p in bases: 0 = home, 1 = first … 4 = home again
    var i = Math.min(3, Math.floor(p)), f = p - i, a = PATH[i], b = PATH[i + 1];
    return { x: lerp(a.x, b.x, f) + 28, y: lerp(a.y, b.y, f) + 6 };
  }
  function runTo(r, from, to, msPerBase) {
    var n = to - from; if (n <= 0) return Promise.resolve();
    return tween(msPerBase * n, function (t) { var p = from + n * t, q = posOnPath(p); place(r, q.x, q.y - Math.abs(Math.sin(p * Math.PI * 2.5)) * 14); if (Math.random() < .05) FX.step(); }, eio);
  }
  function scoreRun(pl, r) {
    pl.runsBy[G.inning - 1] = (pl.runsBy[G.inning - 1] || 0) + 1; renderBoard();
    SFX.star(); popText('+1 run', HOME.x, HOME.y - 120, 'run');
    B.anim(r.firstChild, 'jump', 600);
    return wait(380).then(function () { return tween(320, function (t) { r.setAttribute('opacity', 1 - t); }); }).then(function () { r.remove(); });
  }
  // advance runners with the rules (R.advance: extra bases now and then, walks force runners). Returns { runs, done }.
  function advance(n, msPerBase, opt) {
    var pl = bat(), moves = [], plan = R.advance(G.bases, n, G.rnd || Math.random, opt), br = null;
    if (plan.moves.some(function (m) { return m.r === 'B'; })) { br = runnerEl(pl); var p0 = posOnPath(0); place(br, p0.x - 60, p0.y + 14); batter.setAttribute('opacity', 0); }
    plan.moves.forEach(function (m) {
      var r = m.r === 'B' ? br : m.r;
      if (m.to >= 4) moves.push(runTo(r, m.from, 4, msPerBase).then(scoreRun.bind(null, pl, r)));
      else moves.push(runTo(r, m.from, m.to, msPerBase));
    });
    G.bases = plan.bases.map(function (r) { return r === 'B' ? br : r || null; });
    G.halfRuns += plan.runs;
    return { runs: plan.runs, done: Promise.all(moves), plan: plan };
  }
  function clearBases() { G.bases.forEach(function (r) { if (r) { tween(300, function (t) { r.setAttribute('opacity', 1 - t); }).then(function () { r.remove(); }); } }); G.bases = [null, null, null]; }

  /* ---------- effects: banner, pop text, fireworks, crowd ---------- */
  function banner(text, cls, ms) {
    var b = $('#banner'); b.className = 'on ' + (cls || ''); b.innerHTML = '<span>' + text + '</span>';
    clearTimeout(b._t); b._t = setTimeout(function () { b.className = ''; }, (ms || 1300) / SPEED);
  }
  function pct(x, y) { return 'left:' + ((x - VB.x) / VB.w * 100).toFixed(2) + '%;top:' + ((y - VB.y) / VB.h * 100).toFixed(2) + '%'; }
  function popText(t, x, y, cls) { var e = A.el('<span class="pop ' + (cls || '') + '" style="' + pct(x, y) + '">' + A.esc(t) + '</span>'); $('#fx').appendChild(e); setTimeout(function () { e.remove(); }, 1400); }
  function fireworks(n) {
    for (var k = 0; k < n; k++) (function (k) {
      setTimeout(function () {
        var x = 200 + Math.random() * 1200, y = 60 + Math.random() * 180, col = ['#ffd23c', '#ff8fb1', '#8fe3c0', '#9fd2ff', '#c9b2ff', '#ff9f4a'][k % 6], box = A.el('<div class="fw" style="' + pct(x, y) + '"></div>');
        for (var i = 0; i < 18; i++) { var a = i / 18 * Math.PI * 2, d = 50 + Math.random() * 60; box.insertAdjacentHTML('beforeend', '<i style="--dx:' + (Math.cos(a) * d).toFixed(0) + 'px;--dy:' + (Math.sin(a) * d).toFixed(0) + 'px;background:' + col + '"></i>'); }
        $('#fx').appendChild(box); FX.boom(); setTimeout(function () { box.remove(); }, 1500);
      }, k * 380 / SPEED);
    })(k);
  }
  function crowd(on, big) { var c = $('#crowd'); c.classList.toggle('cheer', on); if (on) { FX.cheer(big); clearTimeout(c._t); c._t = setTimeout(function () { c.classList.remove('cheer'); }, (big ? 3200 : 1800) / SPEED); } }

  /* ---------- scoreboard ---------- */
  function renderBoard() {
    var h = '<div class="sbt">' + A.TITLES.baseball.toUpperCase() + '</div><table><tr><th></th>';
    for (var i = 1; i <= INNINGS; i++) h += '<th class="' + (i === G.inning ? 'cur' : '') + '">' + i + '</th>';
    h += '<th class="tot">R</th><th>H</th></tr>';
    var rows = (RIVALON ? [RIV] : []).concat(PL);
    rows.forEach(function (pl) {
      var tot = totalRuns(pl), up = !G.over && (pl === RIV ? G.top : !G.top && pl === bat());
      h += '<tr class="' + (up ? 'up' : '') + (pl === RIV ? ' riv' : '') + '"><td class="nm"><i style="background:' + pl.col.c + '"></i>' + (pl === RIV ? pl.icon + ' ' : '') + A.esc(pl.name) + '</td>';
      for (var j = 0; j < INNINGS; j++) h += '<td>' + (pl.runsBy[j] != null ? pl.runsBy[j] : '') + '</td>';
      h += '<td class="tot">' + tot + '</td><td>' + pl.hits + '</td></tr>';
    });
    var mo = maxOuts(), mc = mercy();
    h += '</table>' + (STORYB ? '<div class="sgoal">🎯 ' + A.esc(SC.goalText) + ': <b>' + Math.min(totalRuns(PL[0]), SC.goal) + '</b>/' + SC.goal + '</div>' : '') + '<div class="sbf"><span class="lt">OUT ' + Array.apply(null, Array(mo)).map(function (_, i) { return '<i class="' + (i < G.outs ? 'on o' : '') + '"></i>'; }).join('') + '</span>' +
      (mc < 99 ? '<span class="mercy" title="An inning ends at ' + mc + ' runs">max ' + mc + ' runs</span>' : '') + '</div>';
    $('#sboard').innerHTML = h;
  }
  function totalRuns(pl) { return pl.runsBy.reduce(function (a, b) { return a + (b || 0); }, 0); }
  function renderTurn() {
    var pl = bat();
    $('#turn').innerHTML = '<span class="tav">' + blobOf(pl) + '</span><span class="tn" style="color:' + pl.col.d + '">' + A.esc(pl.name) + '<small>at bat</small></span>';
    $('#turn').style.setProperty('--pc', pl.col.c); document.body.style.setProperty('--pc', pl.col.c); document.body.style.setProperty('--pcs', pl.col.soft);
  }
  $('#starCount').textContent = P1.stars;

  /* ---------- the pitch: question + answer cards ---------- */
  function newQuestion() {
    // her coached level; now and then (never right after a miss) a STRETCH pitch. Stretch odds follow her recent at-level
    // answers (R.stretchRate: more when cruising, fewer when it's hard). A stretch is the coach's idea of "tricky": the
    // hardest of several at-level facts by the coach's expected success (e.g. 7 + 5 over 10 + 4), or 1 time in 3 an item
    // from the next level / skill (Q.step +1). Without a coach model it falls back to the old bigger-numbers step.
    var pl = bat(), r = pl.round, q, g = 0, n = nChoices(pl.P);
    // v2p2b: after a miss on a step, the same pitch comes back once with its picture hint (strategy first), choices reshuffled
    if (G.retry && G.retry.who === pl) { q = G.retry.q; var hl = G.retry.lvl; G.retry = null; var right = q.choices[q.answer]; q.choices = A.shuffle ? A.shuffle(q.choices.slice()) : q.choices.slice().sort(function () { return Math.random() - .5; }); q.answer = q.choices.indexOf(right); q.retry = true; q.hard = false; q.hintHtml = hl >= 2 ? q.hint2 || q.hint : q.hint; q.stretch = false; return q; }
    var stretch = !G.missLast && (G.forceStretch != null ? !!G.forceStretch : Math.random() < R.stretchRate(G.recentAt.slice(-6)));
    if (r.review) { var cs = C.current(pl.P, (r.skill && r.skill.subject) || 'math'); if (cs) r = { skill: cs, level: C.state(pl.P, cs.id).level, review: false }; }
    var coach = A.Coach && A.Coach.pickItem && !pl.P.guest, st;
    if (stretch && coach && G.forceStretch == null && Math.random() < 1 / 3) { st = Q.step(pl.P, r, 1); if (st.offset !== 1 || st.hard) st = Q.step(pl.P, r, .5); }
    else st = Q.step(pl.P, r, stretch && !coach ? .5 : 0);
    do { q = Q.make(st.skill, st.level, { choices: n, hard: st.hard }); } while (G.recent.indexOf(q.key) >= 0 && g++ < 20);
    if (!st.hard && coach) {
      var cands = [q]; for (var k = 0; k < (stretch ? 8 : 4); k++) { var c2 = Q.make(st.skill, st.level, { choices: n }); if (G.recent.indexOf(c2.key) < 0) cands.push(c2); }
      if (stretch && st.offset === 0) {   // the hardest fact by the coach's model
        var best = null; cands.forEach(function (c) { var pr = A.Coach.prob(pl.P, st.skill.id, itemKey(c), factPrior(itemKey(c))); if (pr != null && (!best || pr < best.p)) best = { q: c, p: pr }; });
        if (best) { q = best.q; q.coachP = best.p; } q.hard = true;
      } else {
        var pick = A.Coach.pickItem(pl.P, st.skill.id, cands.map(function (c) { return { key: itemKey(c), q: c }; }), G.missLast ? { easeOff: true } : undefined);   // after a miss the coach eases off
        q = pick.q; if (pick.p != null) q.coachP = pick.p;
        if (stretch) q.hard = true;
      }
    }
    q.atLevel = st.atLevel; q.offset = stretch ? Math.max(st.offset, .5) : st.offset; q.stretch = stretch;
    G.recent.push(q.key); if (G.recent.length > 12) G.recent.shift();
    return q;
  }
  // a difficulty guess for a fact the coach hasn't seen yet (0 = average; bigger = harder): crossing ten / borrowing and
  // bigger small-numbers are harder, doubles and +0/+1 are easier. Only used to rank stretch candidates.
  function factPrior(key) {
    var m = String(key).match(/^(\d+) ([+−]) (\d+)$/); if (!m) return 0;
    var a = +m[1], b = +m[3], lo = Math.min(a, b);
    if (m[2] === '+') return (a + b > 10 && a < 10 && b < 10 ? .8 : 0) + lo * .08 - (a === b ? .3 : 0) - (lo <= 1 ? .5 : 0);
    return (a > 10 && b > a - 10 && b < 10 ? .8 : 0) + Math.min(b, a - b) * .07 - (b <= 1 ? .5 : 0) - (b === a - b ? .2 : 0);
  }
  // the coach's item id for a pitch: the fact / word (e.g. "3 + 4"), like Picnic Munch's cells
  function itemKey(q) { var t = String(q.text || '').replace(/<[^>]*>/g, ' '), m = t.match(/(\d+)\s*([+−-])\s*(\d+)/); return m ? m[1] + ' ' + (m[2] === '-' ? '−' : m[2]) + ' ' + m[3] : (t.replace(/\s+/g, ' ').trim() || q.key); }
  // hint for a step pitch whose generator has none (the old two-level skills): the strategy picture for its fact
  function bbHint(q) { var f = A.Steps.parseFact(itemKey(q)); if (f) { q.hint = A.Steps.factHint(f, 1, q.skill); q.hint2 = A.Steps.factHint(f, 2, q.skill); } }
  function renderQuestion(q) {
    $('#qTxt').innerHTML = q.text; var hh = q.retry && q.hintHtml ? '<div class="bb-hint">' + q.hintHtml + '</div>' : ''; $('#qPic').innerHTML = (q.pic || '') + hh; $('#qPic').classList.toggle('on', !!(q.pic || hh));
    var box = $('#cards'); box.innerHTML = ''; box.classList.toggle('n3', q.choices.length === 3);
    q.choices.forEach(function (c, i) {
      var b = A.el('<button class="bcard c' + i + (c.html ? ' rich' : '') + '" data-i="' + i + '" aria-label="Answer ' + (i + 1) + ': ' + A.esc(c.label) + '"><span class="kk">' + (i + 1) + '</span><span class="cv">' + (c.html || A.esc(c.label)) + '</span></button>');
      b.addEventListener('click', function () { if (G.accept) { G.sel = i; markSel(); answer(i, 'click'); } });
      box.appendChild(b);
    });
    G.sel = 0; markSel(false);
  }
  function markSel(say) {
    A.$$('#cards .bcard').forEach(function (b, i) { b.classList.toggle('sel', i === G.sel); });
    if (say && G.q && G.q.choices[G.sel].say) V.say(G.q.choices[G.sel].say, { kind: 'name', bubble: false });
  }
  function elapsed() { return G.voiceDone ? (Date.now() - G.qT0) / 1000 : 0; }
  function tick() {
    if (!G.q || !G.accept) return;
    if (UI.cardOpen) { var nowP = Date.now(); G.qT0 += nowP - (G.lastTick || nowP); G.lastTick = nowP; return; }  // paused (e.g. a controller came unplugged): the clock waits
    G.lastTick = Date.now();
    var e = elapsed();
    if (S.bbClock > 0 && G.voiceDone) {
      var left = Math.max(0, Math.ceil(S.bbClock - e)); $('#shot').textContent = '⏱ ' + left; $('#shot').classList.toggle('low', left <= 5);
      if (e >= S.bbClock) timeout();
    }
  }
  /* ---------- next pitch (no swing picking: straight to the question) ---------- */
  function nextPitch() {
    if (G.over) return;
    G.q = null; G.accept = false; G.busy = false; clearInterval(G.timer);
    $('#shot').textContent = '';
    // a new batter: now and then a walk (never the first batter of a half; tests can force it with G.forceWalk)
    if (G.pa > 0 && !G.walkedPA && (G.forceWalk != null ? G.forceWalk : Math.random() < R.WALK)) { G.walkedPA = true; G.phase = 'walk'; return doWalk().then(afterPitch); }
    G.walkedPA = false;
    return startPitch();
  }
  function startPitch() {
    if (G.over) return;
    G.phase = 'pitch';
    var q = G.q = newQuestion(); G.pitchN++;
    if (!G.keepTag) { $('#swingTag').innerHTML = q.stretch ? '<small>🔥 Tricky pitch!</small>' : ''; $('#swingTag').className = 'swingtag' + (q.stretch ? ' on tricky' : ''); }
    renderQuestion(q); renderBoard(); if (batEl) setBat(-118);
    $('#sign').classList.remove('done'); B.anim($('#sign'), 'signpop', 400);
    // the pitcher gets set; the voice reads the question; the clock starts when it has been read
    $('#pitcherG').classList.add('set');
    G.accept = true; G.busy = false; G.voiceDone = false; G.qT0 = G.qShown = Date.now(); $('#shot').textContent = S.bbClock > 0 ? '⏱ ' + S.bbClock : '';
    var my = G.pitchN;
    Promise.race([V.say(A.ReadAloud ? A.ReadAloud.auto(bat().P, q) : q.say, { kind: q.listen ? 'listen' : 'prompt' }), wait(6000)]).then(function () { if (G.pitchN === my && !G.voiceDone) { G.voiceDone = true; G.qT0 = Date.now(); } });
    clearInterval(G.timer); G.timer = setInterval(tick, 100); tick();
  }
  function lockCards(ok, i, q) {
    A.$$('#cards .bcard').forEach(function (b, k) { b.disabled = true; if (k === q.answer) b.classList.add('right'); else if (k === i) b.classList.add('wrong'); else b.classList.add('dim'); });
    $('#sign').classList.add('done');
  }
  function answer(i, how) {
    if (!G.q || !G.accept || G.busy || G.over || UI.cardOpen) return;
    if (Date.now() - (G.qShown || 0) < A.Pace.CFG.FRESH_Q * A.Pace.scale) { A.Pace.log.push({ tag: 'bb:fresh', dropped: true }); return; }   // a press left over from the last pitch (js/core/pace.js)
    if (G.q.bonus) return bonusAnswer(i);
    G.accept = false; G.busy = true; clearInterval(G.timer);
    var q = G.q, pl = bat(), ok = i === q.answer, e = elapsed();
    // v2p2b: answer time (from when the question finished being read) feeds the step fast-skip; a retry after a hint is hinted
    pl.pitches++; var sig = C.recordAnswer(pl.P, q.skill, ok, { key: itemKey(q), ms: G.voiceDone ? Math.round(e * 1000) : null, hint: !!q.retry });
    if (sig && sig.speedy) pl.speedy = true;
    if (!ok && !q.retry && !q.bonus && A.Steps && A.Steps.STEPS[q.skill] && !pl.P.guest) { if (!q.hint) bbHint(q); if (q.hint) G.retry = { q: q, who: pl, lvl: (G.missRun = (G.missRun || 0) + 1) >= 2 ? 2 : 1 }; }
    if (ok) G.missRun = 0;
    if (q.atLevel) { if (ok) pl.hr++; else pl.hw++; }
    if (!q.stretch) { G.recentAt.push(ok); if (G.recentAt.length > 10) G.recentAt.shift(); }
    G.missLast = !ok;
    if (ok) { pl.right++; pl.times.push(e); var rt = bb(pl.P).rt; if (!pl.P.guest) rt[q.skill] = rt[q.skill] ? +(rt[q.skill] * .8 + e * .2).toFixed(2) : +e.toFixed(2); }
    else pl.wrong++;
    var tricky = !!q.hard;
    if (ok && tricky) pl.tricky++;
    // the surprise: which hit? (gameplay odds only — see HIT ODDS); a slow answer on an easy pitch is sometimes a caught fly
    var odds = ok ? { sec: G.voiceDone ? e : 0, quick: quickSec(pl.P, q.skill), diff: diffOf(q), little: A.Age.little(pl.P), stretch: tricky, noFly: R.noFly(A.Age.of(pl.P)) } : null;   // design2: no fly-outs on right answers at 5 and under
    var caught = ok && G.forceCatch == null ? (G.rnd || Math.random)() < R.caughtChance(odds) : ok && !!G.forceCatch;
    var z = ok && !caught ? rollHit(odds, G.rnd) : null;
    var key = z ? z.k : ok ? 'fly' : 'miss', sw = pl.sw[key] || (pl.sw[key] = { n: 0, ok: 0 }); sw.n++; if (ok) sw.ok++;
    pl.log.push({ hit: key, skill: q.skill, level: q.level, hard: tricky, atLevel: q.atLevel, ok: ok });
    lockCards(ok, i, q); V.stop();
    G.last = { ok: ok, sec: +e.toFixed(2), how: how, zone: z ? z.k : null, caught: caught, odds: ok ? hitOdds(odds) : null, skill: q.skill, level: q.level, hard: tricky, atLevel: q.atLevel, offset: q.offset, coachP: q.coachP };
    var p = z ? doHit(z, q, odds) : doOut(q, false, caught);
    p.then(afterPitch);
  }
  function timeout() { // optional shot clock ran out: an out (not counted as a wrong answer for the skill)
    if (!G.accept || G.busy || (G.q && G.q.bonus)) return;
    G.accept = false; G.busy = true; clearInterval(G.timer); bat().pitches++;
    lockCards(false, -1, G.q); V.stop(); G.last = { ok: false, timeout: true };
    doOut(G.q, true, false).then(afterPitch);
  }

  /* ---------- bonus questions (text only, never change the score, not coach answers) ---------- */
  function choiceSet(ans, n, lo, hi) {
    var c = [ans], d = 1; while (c.length < n && d < 30) { [ans + d, ans - d].forEach(function (v) { if (c.length < n && v >= lo && v <= hi && c.indexOf(v) < 0) c.push(v); }); d++; }
    c.sort(function (a, b) { return a - b; }); return c;
  }
  function dots(n, cls) { var h = ''; for (var i = 0; i < n; i++) h += '<i class="rdot ' + (cls || '') + '"></i>'; return '<span class="rdots">' + h + '</span>'; }
  function ask(bq) {
    // bq: { text, pic, choices: [labels], answer, explain, kind }
    return new Promise(function (res) {
      G.phase = 'pitch'; G.bonusN++;
      // the question is read like a pitch: one unclipped line (the browser voice says it) when "How much talking" allows prompts;
      // otherwise the friend's bubble shows these words (A.Voice.say), replacing the last pitch's words
      var spoken = String(bq.spoken || bq.text).replace(/<[^>]*>/g, ' ').replace(/ = /g, ' is ').replace(/\s+/g, ' ').trim();
      var q = G.q = { bonus: true, kind: bq.kind, text: bq.text, pic: bq.pic || '', answer: bq.answer, explain: bq.explain, choices: bq.choices.map(function (l) { return { label: String(l) }; }), say: [{ id: 'bbq_' + bq.kind, text: spoken }] };
      $('#swingTag').innerHTML = '<small>' + (bq.tag || '⚾ Baseball question!') + '</small>'; $('#swingTag').className = 'swingtag on bonusq';
      renderQuestion(q); document.body.classList.add('bonusing'); $('#sign').classList.remove('done');
      G._bonusRes = res; G.accept = true; G.busy = false; G.voiceDone = false; G.qT0 = G.qShown = Date.now();
      var fb = A.$('#friendBubble'); if (fb) fb.classList.remove('on');   // never leave the last pitch's words up
      V.say(q.say, { kind: 'prompt' });
    });
  }
  function bonusAnswer(i) {
    var q = G.q, ok = i === q.answer; G.accept = false; G.busy = true;
    lockCards(ok, i, q); (ok ? SFX.star : SFX.tap)();
    G.bonusLog = G.bonusLog || []; G.bonusLog.push({ kind: q.kind, ok: ok });
    $('#swingTag').innerHTML = ok ? '✅ Yes! ' + A.esc(q.explain || '') : '💡 ' + A.esc(q.explain || ('It was ' + q.choices[q.answer].label + '.'));
    $('#swingTag').className = 'swingtag on bonusq ' + (ok ? 'yes' : 'hint');
    var res = G._bonusRes; G._bonusRes = null;
    if (A.Age.preReader(bat().P) && q.explain) V.say([{ id: 'bbq_explain', text: (ok ? 'Yes! ' : '') + String(q.explain).replace(/<[^>]*>/g, ' ') }], { kind: ok ? 'chatter' : 'answer' });   // design2: read the answer aloud too
    G.bonusWait = ok ? A.Pace.ms('RESULT') : A.Pace.ms('HINT', q.explain || ''); return wait(G.bonusWait).then(function () {   // the beat: long enough to read the explanation
 document.body.classList.remove('bonusing'); G.q = null; G.busy = false; $('#cards').innerHTML = ''; $('#qTxt').innerHTML = ''; $('#qPic').innerHTML = ''; if (res) res(ok); });
  }
  var BASEN = ['home', '1st', '2nd', '3rd', 'home'];
  function whereChoices(from) { return [1, 2, 3, 4].filter(function (x) { return x !== from; }); }   // 1st / 2nd / 3rd / Home minus the runner's base
  // a base-running question about the hit that just happened (before the runners move for "where", after for the others)
  function runQuestion(z, plan, before, little) {
    var n = nChoices(bat().P);
    if (before) {   // "where does the runner end up?" — a runner on base, plain rule (no extra base)
      var lead = -1; for (var b = 2; b >= 0; b--) if (G.bases[b]) { lead = b; break; }
      // always 1st / 2nd / 3rd / Home minus the base the runner starts on (3 cards, so a runner on 3rd never gets a lone "Home")
      var from = lead + 1, to = Math.min(4, from + z.bases), ch = whereChoices(from);
      return ask({ kind: 'where', text: 'A runner is on ' + BASEN[from] + '. ' + z.name + ' = ' + z.bases + (z.bases === 1 ? ' base' : ' bases') + '! Where does the runner end up?', choices: ch.map(function (x) { return x === 4 ? 'Home 🏠' : BASEN[x]; }), answer: ch.indexOf(to), explain: BASEN[from] + ' + ' + z.bases + ' = ' + (to === 4 ? 'home: a run!' : BASEN[to] + ' base.'), tag: '🏃 Base-running question!' });
    }
    var onb = G.bases.filter(Boolean).length;
    if (little || (plan.runs === 0 && Math.random() < .5)) {
      var ans = little && plan.runs > 0 && Math.random() < .5 ? plan.runs : onb, isRuns = little && plan.runs > 0 && ans === plan.runs;
      if (isRuns) return ask({ kind: 'runs', text: 'How many runs scored? Count the stars!', pic: dots(plan.runs, 'run'), choices: choiceSet(plan.runs, n, 0, 8), answer: choiceSet(plan.runs, n, 0, 8).indexOf(plan.runs), explain: plan.runs + (plan.runs === 1 ? ' run!' : ' runs!'), tag: '⭐ Count the runs!' });
      return ask({ kind: 'onbase', text: 'How many runners are on base now?', pic: dots(onb, 'runner'), choices: choiceSet(onb, n, 0, 3), answer: choiceSet(onb, n, 0, 3).indexOf(onb), explain: onb + (onb === 1 ? ' runner' : ' runners') + ' on base.', tag: '🏃 Count the runners!' });
    }
    if (plan.runs > 0) { var cs = choiceSet(plan.runs, n, 0, 4); return ask({ kind: 'runs', text: 'How many runs scored on that ' + z.name.toLowerCase() + '?', choices: cs, answer: cs.indexOf(plan.runs), explain: plan.runs + (plan.runs === 1 ? ' run scored.' : ' runs scored.'), tag: '🏃 Base-running question!' }); }
    var left = 4 - z.bases, cl = choiceSet(left, n, 1, 4);
    return ask({ kind: 'left', text: 'You hit a ' + z.name.toLowerCase() + ' and stand on ' + BASEN[z.bases] + '. How many more bases to get home?', choices: cl, answer: cl.indexOf(left), explain: z.bases + ' + ' + left + ' = 4 bases all the way around.', tag: '🏃 Base-running question!' });
  }
  // once per inning, behind or tied: a scoreboard question at her level (age 4 and under: count the rival's runs as dots)
  function scoreQuestion() {
    if (!RIVALON || G.scoreQ[G.inning]) return Promise.resolve();
    var me = totalRuns(PL[0]), them = totalRuns(RIV), n = nChoices(P1);
    if (them < me || them === 0) return Promise.resolve();
    G.scoreQ[G.inning] = 1; renderBoard();   // v2p1a: the stadium board and the question's picture always show the same score (both use totalRuns)
    var tag = '📋 Scoreboard question!';
    // v2p1a: every scoreboard question shows the score as a picture (a dot per run, in rows of 5 next to the number) and uses short words
    if (A.Age.preReader(P1)) {   // design2: 5 and under: count the dots (no "runs to tie / to win" arithmetic)
      if (them > 10) return Promise.resolve();
      var c0 = choiceSet(them, n, 0, 12); return ask({ kind: 'count', text: 'How many runs do the Sprouts have?', pic: sbPic([['riv', them, true]]), choices: c0, answer: c0.indexOf(them), explain: 'The Sprouts have ' + them + '.', tag: tag });
    }
    if (them === me) { var add = A.rnd(1, 3), c1 = choiceSet(me + add, n, 0, 30); return ask({ kind: 'tied', text: 'You have ' + me + '. You get ' + add + ' more. How many now?', pic: sbPic([['me', me, false, add]]), choices: c1, answer: c1.indexOf(me + add), explain: me + ' + ' + add + ' = ' + (me + add) + '.', tag: tag }); }
    var win = Math.random() < .5, need = them - me + (win ? 1 : 0), c2 = choiceSet(need, n, 1, 30);
    return ask({ kind: win ? 'towin' : 'totie', text: 'How many more runs to ' + (win ? '<b>win</b>' : '<b>tie</b>') + '?', pic: sbPic([['riv', them], ['me', me]]), spoken: 'The Sprouts have ' + them + '. You have ' + me + '. How many more runs to ' + (win ? 'win' : 'tie') + '?', choices: c2, answer: c2.indexOf(need), explain: win ? (them - me) + ' more ties it. 1 more wins: ' + need + '.' : me + ' + ' + need + ' = ' + them + '. A tie!', tag: tag });
  }
  // v2p1a: a little scoreboard picture. rows: [who ('riv' | 'me'), runs, hideNumber, extra runs drawn as new dots]
  function sbPic(rows) {
    return '<span class="sbpic">' + rows.map(function (r) {
      var who = r[0], k = r[1], extra = r[3] || 0, h = '', i;
      for (i = 0; i < k + extra; i++) h += (i && i % 5 === 0 ? '<i class="gap"></i>' : '') + '<i class="rdot ' + (who === 'riv' ? 'riv' : 'me') + (i >= k ? ' new' : '') + '"></i>';
      return '<span class="sbrow ' + who + '"><span class="sbn">' + (who === 'riv' ? '🌱 Sprouts' : '⚾ You') + '</span><span class="sbd">' + (k + extra > 24 ? '' : h) + '</span>' + (r[2] ? '' : '<b class="sbv">' + k + (extra ? ' <span class="plus">+ ' + extra + '</span>' : '') + '</b>') + '</span>';
    }).join('') + '</span>';
  }

  /* ---------- outcomes ---------- */
  var HITLINE = { sg: 'bb_single', db: 'bb_double', tr: 'bb_triple', hr: 'bb_home_run' };
  var HITNAME = { sg: 'SINGLE!', db: 'DOUBLE!', tr: 'TRIPLE!', hr: 'HOME RUN!' };
  var FIELD = ['left field', 'center field', 'right field'];
  function doHit(z, q, o) {
    var pl = bat(); pl.hits++; if (z.k === 'hr') pl.homers++; G.hitN++;
    var why = o ? [speedOf(o.sec, o.quick) >= 1 ? '⚡ Fast!' : '', o.diff >= .7 ? '🔥 Tricky!' : ''].filter(Boolean).join(' ') : '';
    $('#swingTag').innerHTML = z.icon + ' ' + z.name + ' = ' + z.bases + (z.bases === 1 ? ' base' : ' bases') + '!' + (why ? ' <small>' + why + '</small>' : ''); $('#swingTag').className = 'swingtag on ' + z.k;
    var loaded = G.bases.every(Boolean), anyOn = G.bases.some(Boolean);
    // about 1 in 4 hits gets a base-running question ("where" needs a runner on base and no home run)
    var pre = A.Age.preReader(pl.P);   // design2: 5 and under: no "where does the runner end up?", only count-the-dots questions
    var bq = G.forceBonus != null ? G.forceBonus : (STORYB ? .2 : .25) > Math.random() ? (anyOn && z.k !== 'hr' && !pre && Math.random() < .5 ? 'where' : 'after') : null;
    if (bq === 'where' && (!anyOn || z.k === 'hr' || pre)) bq = 'after';
    return throwPitch().then(function () {
      FX.crack(); swing(true);
      var dir = A.rnd(0, 2), side = dir - 1, to, peak, ms, sc;
      if (z.k === 'sg') { var gr = Math.random() < .5; to = { x: 800 + side * A.pick([200, 300]), y: gr ? 480 : 455 }; peak = gr ? 20 : 90; ms = gr ? 650 : 720; sc = .7; }
      else if (z.k === 'db') { to = { x: 800 + side * (side ? 470 : 0) + (side ? 0 : A.pick([-120, 120])), y: 400 }; peak = 260; ms = 900; sc = .55; }
      else if (z.k === 'tr') { to = { x: 800 + (side || A.pick([-1, 1])) * 640, y: 375 }; peak = 320; ms = 1000; sc = .5; }
      else { to = { x: 800 + side * A.rnd(80, 420), y: 120 }; peak = 560; ms = 1300; sc = .3; }
      banner(HITNAME[z.k], 'hit ' + z.k, z.k === 'hr' ? 2600 : 1400);
      popText(z.k === 'hr' ? 'Over the wall!' : 'To ' + FIELD[to.x < 700 ? 0 : to.x > 900 ? 2 : 1] + '!', to.x, Math.max(200, to.y - 40), 'dir');
      var flight = fly(to, peak, ms, sc, false, z.k);
      if (z.k !== 'hr') flight = flight.then(function () { var f = fielders[to.x < 700 ? 0 : to.x > 900 ? 2 : 1]; B.anim(f.firstChild, 'hop', 500); });
      var pre = bq === 'where' ? flight.then(function () { return runQuestion(z, null, true); }) : Promise.resolve();
      return pre.then(function () {
        var ad = advance(z.bases, z.k === 'hr' ? 560 : 380, bq === 'where' ? { extra: false } : null);
        var voice = [HITLINE[z.k]];
        if (z.k === 'hr' && loaded) voice = ['bb_grand_slam'];
        if (ad.runs === 1 && z.k !== 'hr') voice.push('bb_run_scores'); else if (ad.runs >= 2) voice.push(ad.runs, 'bb_runs_score');
        var vp = bq === 'where' ? Promise.resolve() : sayWaitMix([[q && q.listen && q.fact ? q.fact : [], 'listen'], [voice, 'chatter']], 4500, { bubble: false });
        if (z.k === 'hr') { crowd(true, true); fireworks(6); M.charge(); UI.rain(40); A.Pad.rumble(G.half, 'big'); } else if (z.k !== 'sg' || ad.runs) crowd(true, false);
        return Promise.all([flight, ad.done, vp]).then(function () { return wait(250); }).then(function () {
          if (bq === 'after' && !G.over) return runQuestion(z, ad.plan, false, pre);
        });
      }).then(function () { return endPA(); });
    });
  }
  function doWalk() {
    var pl = bat(); G.walks = (G.walks || 0) + 1; pl.walks = (pl.walks || 0) + 1;
    banner('BALL FOUR!', 'hit walk', 1500);
    $('#swingTag').innerHTML = '🚶 A walk! The pitch was too wide. Take your base!'; $('#swingTag').className = 'swingtag on walk';
    return throwPitch().then(function () {
      return tween(260, function (t) { ballAt(lerp(790, 690, t), lerp(666, 720, t), 1.15, 1 - t); });
    }).then(function () { hideBall(); var ad = advance(1, 420, { walk: true }); if (ad.runs) crowd(true, false); return ad.done; }).then(function () { return wait(500); }).then(endPA);
  }
  // an out: wrong answer (pop-up / foul tip / grounder) or a right answer hit softly and caught (a long fly ball)
  var OUTKIND = ['pop', 'foul', 'ground'];
  function doOut(q, isTimeout, rightCaught) {
    var pl = bat(), kind = rightCaught ? 'deep' : isTimeout ? 'k' : A.pick(OUTKIND);
    G.outs++; pl.outs++; G.lastOut = kind;
    var f = fielders[A.rnd(0, 2)];
    return throwPitch().then(function () {
      if (kind === 'k') { swing(false); return tween(220, function (t) { ballAt(lerp(790, 812, t), lerp(666, 760, t), lerp(1.15, 1.3, t), 1 - t); }).then(function () { FX.mitt(); hideBall(); banner('STRIKE!', 'strike', 1300); }); }
      FX.crack(); swing(true);
      if (kind === 'deep') { banner('WHAT A CATCH!', 'out', 1600); B.anim(f.firstChild, 'hop', 400); return fly({ x: f._x, y: f._y - 20 }, 380, 1200, .45, true).then(function () { hideBall(); FX.mitt(); B.anim(f.firstChild, 'jump', 600); crowd(true, false); }); }
      if (kind === 'pop') { var inf = { x: A.pick([700, 900]), y: 600 }; banner('POP-UP… CAUGHT!', 'out', 1500); return fly(inf, 560, 1200, .7, true).then(function () { hideBall(); FX.mitt(); B.anim(pitcher.firstChild, 'jump', 600); }); }
      if (kind === 'foul') { banner('FOUL TIP… CAUGHT!', 'out', 1500); return tween(500, function (t) { ballAt(lerp(790, 760, t), lerp(660, 560, t) - Math.sin(t * Math.PI) * 140, lerp(1.1, 1.4, t)); }).then(function () { hideBall(); FX.mitt(); }); }
      banner('GROUNDER… OUT!', 'out', 1500); return tween(600, function (t) { ballAt(lerp(790, MOUND.x + 20, t), lerp(690, MOUND.y + 10, t) - Math.abs(Math.sin(t * Math.PI * 3)) * 18 * (1 - t), lerp(1.1, .8, t)); }).then(function () { hideBall(); FX.mitt(); B.anim(pitcher.firstChild, 'hop', 500); });
    }).then(function () {
      FX.aww(); B.anim(batter.firstChild, rightCaught ? 'jump' : 'wobble', 600);
      var outTxt = 'Out ' + G.outs + (G.outs >= maxOuts() ? '' : ' of ' + maxOuts());
      var right = q && !q.bonus && q.choices && q.choices[q.answer] ? q.choices[q.answer].label : '';
      $('#swingTag').innerHTML = rightCaught ? '🧤 Right answer! It flew far, but the fielder caught it. <small>' + outTxt + '</small>' : isTimeout ? '⏱ Time ran out. <small>' + outTxt + '</small>' : '🙂 Nice try!' + (right ? ' It was <b>' + A.esc(right) + '</b>.' : '') + ' <small>' + outTxt + '</small>';
      $('#swingTag').className = 'swingtag on outtag';
      var voice = isTimeout ? ['bb_time_strike'] : ['bb_caught'];
      renderBoard();
      return sayWaitMix([[voice, 'chatter'], [rightCaught ? [] : (q && q.fact) || [], q && q.listen ? 'listen' : 'answer']], 6500).then(function () { return wait(rightCaught ? 900 : 650); });
    }).then(function () {
      return tween(420, function (t) { batter.setAttribute('opacity', 1 - t); place(batter, lerp(712, 600, t), 720 + 30 * t); }).then(endPA);
    });
  }
  function endPA() {
    G.pa++; renderBoard(); A.Store.save();
    if (G.walkoffOn && totalRuns(PL[0]) > totalRuns(RIV)) { G.walkoff = true; return 'half'; }
    return G.outs >= maxOuts() || G.halfRuns >= mercy() ? 'half' : 'next';
  }
  function afterPitch(what) {
    if (G.over) return;
    if (STORYB && totalRuns(PL[0]) >= SC.goal) return endStory();   // story goal reached: the stop is cleared right away
    if (what === 'next') return newBatter(true).then(nextPitch);
    return endHalf();
  }

  /* ---------- innings ---------- */
  // the rival's top half: simulated with the same rules, shown as a quick count-up on the scoreboard (no questions)
  function rivalHalf() {
    G.top = true; G.outs = 0; RIV.runsBy[G.inning - 1] = 0; renderBoard(); clearBases(); hideBall();
    $('#qTxt').innerHTML = ''; $('#qPic').innerHTML = ''; $('#cards').innerHTML = '';
    var sim = G.forceRival != null ? { runs: G.forceRival, hits: G.forceRival, events: [] } : R.simHalf({ acc: R.rivalAcc(LITTLE, A.Age.of(P1)), little: LITTLE });
    RIV.hits += sim.hits;
    banner('Inning ' + G.inning + '<small>' + RIV.icon + ' ' + A.esc(RIV.name) + ' at bat</small>', 'inning rivalb', 1800);
    $('#swingTag').innerHTML = RIV.icon + ' The ' + A.esc(RIV.name) + ' are batting…'; $('#swingTag').className = 'swingtag on rival';
    var chain = wait(1500);
    for (var k = 0; k < sim.runs; k++) chain = chain.then(function () { RIV.runsBy[G.inning - 1]++; renderBoard(); SFX.tap(); popText('+1 Sprouts', HOME.x, HOME.y - 120, 'run riv'); B.anim(fielders[A.rnd(0, 2)].firstChild, 'hop', 400); return wait(420); });
    return chain.then(function () {
      var r = sim.runs;
      $('#swingTag').innerHTML = RIV.icon + ' The ' + A.esc(RIV.name) + (r === 0 ? ' got no runs. Your turn!' : ' scored ' + r + (r === 1 ? ' run' : ' runs') + '. Your turn to bat!');
      return wait(1400);
    }).then(function () { G.top = false; });
  }
  function startHalf() {
    var pl = bat(); G.outs = 0; G.strikes = 0; G.pa = 0; G.halfRuns = 0; G.walkoffOn = false;
    var pre = RIVALON && G.half === 0 ? rivalHalf() : Promise.resolve();
    return pre.then(function () {
      pl.round = STORYB ? { skill: C.byId[SC.skill], level: SC.level, story: true, review: false } : C.pickRound(pl.P); pl.hr = 0; pl.hw = 0; pl.t0 = Date.now();
      if (pl.runsBy[G.inning - 1] == null) pl.runsBy[G.inning - 1] = 0;
      G.walkoffOn = RIVALON && G.inning === INNINGS && totalRuns(PL[0]) <= totalRuns(RIV);
      renderTurn(); renderBoard();
      clearBases(); hideBall();
      $('#qTxt').innerHTML = ''; $('#qPic').innerHTML = ''; $('#cards').innerHTML = ''; $('#swingTag').innerHTML = ''; $('#swingTag').className = 'swingtag';
      var last = G.inning === INNINGS && (!TWO || G.half === 0);
      banner((last ? 'Last inning!' : 'Inning ' + G.inning) + (TWO ? '<small>' + A.esc(pl.name) + ' up to bat</small>' : RIVALON ? '<small>' + A.esc(pl.name) + ' at bat</small>' : ''), 'inning', 2000);
      var voice = last && !TWO ? ['bb_last_inning'] : ['bb_inning', G.inning];
      if (TWO || G.inning === 1) voice = voice.concat(['bb_batter_up', nameParts(pl.P)]);
      if (G.inning === 1 || TWO) M.charge();
      return Promise.all([newBatter(true), sayWait(voice, 7000)]).then(function () { return wait(200); }).then(scoreQuestion).then(nextPitch);
    });
  }
  function endHalf() {
    var pl = bat(), threeOuts = G.outs >= maxOuts();
    $('#cards').innerHTML = ''; $('#qTxt').innerHTML = ''; $('#qPic').innerHTML = '';
    var ms = Date.now() - pl.t0, out = !STORYB && pl.hr + pl.hw ? C.finishRound(pl.P, pl.round, { correct: pl.hr, wrong: pl.hw, ms: ms }) : { say: [], events: {} };
    if (!pl.P.guest) A.Store.addTime(pl.P, 'baseball', ms);
    A.Store.save();
    banner(G.walkoff ? 'WALK-OFF WIN!' : threeOuts ? (maxOuts() === 3 ? 'THREE OUTS!' : 'FOUR OUTS!') : G.halfRuns >= mercy() ? 'WHAT AN INNING!<small>' + mercy() + ' runs, switch sides</small>' : 'INNING OVER', 'inning', 1700);
    var line = threeOuts ? (TWO ? 'bb_three_outs' : 'bb_three_outs_next') : 'bb_inning_over';
    var lastHalf = G.walkoff || (G.inning === INNINGS && (!TWO || G.half === 1));
    if (lastHalf) line = 'bb_inning_over';
    if (G.walkoff) { crowd(true, true); fireworks(4); }
    var chain = sayWait([line], 4000).then(function () { return wait(300); });
    if (!pl.P.guest && out.events.newSkill) chain = chain.then(function () { return A.Rewards.celebrate(pl.P, [{ kind: 'skill', id: out.events.newSkill }], TWO ? pl.name : null); });
    else if (out.events.levelUp) chain = chain.then(function () { UI.toast((TWO ? pl.name + ': ' : '') + 'Level up! The next ones are a little trickier.'); });
    return chain.then(function () {
      if (lastHalf) return STORYB ? endStory() : endGame();
      if (TWO && G.half === 0) G.half = 1; else { G.half = 0; G.inning++; }
      return startHalf();
    });
  }

  /* ---------- game over ---------- */
  // stars (R.stars): 1 for playing, +1 for a win, +1 more for a win that also reaches the run goal with 2+ right stretch
  // pitches. In 2 players "win" = more runs than the other player (a tie counts for both). The hit dice never decide stars.
  function wonBy(pl) { var other = RIVALON ? RIV : TWO ? PL[1 - pl.i] : null; return other ? totalRuns(pl) > totalRuns(other) || (TWO && totalRuns(pl) === totalRuns(other)) : true; }
  function starsFor(pl) { return R.stars({ won: wonBy(pl), runs: totalRuns(pl), goal: R.runGoal(A.Age.little(pl.P), A.Age.of(pl.P)), tricky: pl.tricky }); }
  function endGame() {
    G.over = true; clearInterval(G.timer); renderBoard(); clearBases();
    var res = PL.map(function (pl) {
      var P = pl.P, runs = totalRuns(pl), st = starsFor(pl), x = bb(P), newBest = !P.guest && runs > (x.best || 0);
      if (!P.guest) {
        A.Store.earnStars(P, st, 'baseball'); x.games++; x.runs += runs; x.hits += pl.hits; x.homers += pl.homers; x.outs += pl.outs; x.pitches += pl.pitches; x.right += pl.right;
        x.swings = x.swings || {}; Object.keys(pl.sw).forEach(function (k) { var a = x.swings[k] || (x.swings[k] = { n: 0, ok: 0 }); a.n += pl.sw[k].n; a.ok += pl.sw[k].ok; });
        if (newBest) { x.best = runs; x.bestAt = Date.now(); }
        if (RIVALON) { x.vsGames = (x.vsGames || 0) + 1; if (runs > totalRuns(RIV)) x.vsWins = (x.vsWins || 0) + 1; }
        x.last = { at: Date.now(), runs: runs, them: RIVALON ? totalRuns(RIV) : null, hits: pl.hits, homers: pl.homers, byInning: pl.runsBy.slice(), right: pl.right, wrong: pl.wrong, swings: pl.sw, tricky: pl.tricky, two: TWO, vs: TWO ? PL[1 - pl.i].name : null };
        if (TWO) x.twoGames++;
        A.Store.markPlayed(P);
      }
      return { pl: pl, runs: runs, stars: st, newBest: newBest };
    });
    var winner = null;
    if (TWO) { winner = res[0].runs > res[1].runs ? 0 : res[1].runs > res[0].runs ? 1 : null; if (winner != null && !PL[winner].P.guest) bb(PL[winner].P).twoWins++; }
    var rewards = res.map(function (r) { return r.pl.P.guest ? [] : A.Rewards.check(r.pl.P); });
    A.Store.save(); $('#starCount').textContent = P1.stars;
    var them = RIVALON ? totalRuns(RIV) : 0, soloRes = RIVALON ? (res[0].runs > them ? 'win' : res[0].runs === them ? 'tie' : 'loss') : null;
    if (soloRes !== 'loss') { M.jingle(); crowd(true, true); fireworks(soloRes === 'win' || !RIVALON ? 5 : 2); } else crowd(true, false);
    var title, voice, sub, btn = 'Play again ▶';
    if (!TWO) {
      var r0 = res[0];
      if (soloRes === 'win') { title = 'You win! ' + r0.runs + ' to ' + them; sub = (G.walkoff ? 'A walk-off win! ' : '') + (r0.newBest ? 'And a new high score!' : 'Great game, ' + P1.name + '!'); }
      else if (soloRes === 'tie') { title = 'Tie game! ' + r0.runs + ' to ' + them; sub = 'So close! The Sprout Squad says: rematch?'; btn = 'Rematch ▶'; }
      else { title = 'Good game! ' + r0.runs + ' to ' + them; sub = 'The Sprout Squad won this time. Rematch?'; btn = 'Rematch ▶'; }
      voice = ['bb_you_scored', r0.runs, r0.runs === 1 ? 'bb_run' : 'bb_runs'].concat(r0.newBest ? ['bb_new_high'] : ['bb_good_game']);
    } else if (winner != null) { title = PL[winner].name + ' wins!'; voice = [nameParts(PL[winner].P), 'bb_wins_game', 'bb_good_game']; sub = 'Great batting, both of you!'; }
    else { title = 'Tie game!'; voice = ['bb_tie_game']; sub = 'You both did great!'; }
    var html = '<div class="final">' + $('#sboard').innerHTML + '</div>' + (RIVALON ? '<p class="vsline">' + A.esc(P1.name) + ' <b>' + res[0].runs + '</b> · ' + RIV.icon + ' ' + A.esc(RIV.name) + ' <b>' + them + '</b></p>' : '') + '<div class="fcols">' + res.map(function (r, k) {
      return '<div class="fcol' + (winner === k ? ' win' : '') + '" style="--pc:' + r.pl.col.c + '"><div class="fa dance">' + blobOf(r.pl) + '</div>' + (winner === k ? '<span class="crownb">🏆</span>' : '') +
        '<div class="fi"><b>' + A.esc(r.pl.name) + '</b><span>' + r.runs + ' runs · ' + r.pl.hits + ' hits' + (r.pl.homers ? ' · ' + r.pl.homers + ' HR' : '') + '</span>' +
        '<span class="stars">' + [0, 1, 2].map(function (i) { return '<svg viewBox="0 0 24 24" class="' + (i < r.stars ? 'got' : '') + '" style="animation-delay:' + (.3 + i * .35 + k * .9) + 's"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>'; }).join('') + '</span>' + (r.newBest ? '<span class="nb">New best!</span>' : '') + '</div></div>';
    }).join('') + '</div><h4>🏆 Family high scores</h4>' + boardHTML(PL.map(function (p) { return p.P.id; }));
    for (var s1 = 0; s1 < res[0].stars + (res[1] ? res[1].stars : 0); s1++) setTimeout(SFX.star, 400 + s1 * 300);
    G.result = { res: res.map(function (r) { return { name: r.pl.name, runs: r.runs, stars: r.stars, newBest: r.newBest }; }), winner: winner, them: RIVALON ? them : null, outcome: soloRes, walkoff: G.walkoff };
    return wait(1200).then(function () {
      return UI.card({ tag: 'Final score', title: title, html: html, sub: sub, btn: btn, voice: voice, cls: 'celebrate bbend' + (soloRes ? ' ' + soloRes : ''), confetti: soloRes !== 'loss', sfx: soloRes === 'loss' ? 'soft' : undefined, minMs: 900 });
    }).then(function () {
      var chain = Promise.resolve();
      res.forEach(function (r, k) { chain = chain.then(function () { return A.Rewards.celebrate(r.pl.P, rewards[k], TWO ? r.pl.name : null); }); });
      return chain;
    }).then(function () { return A.PlayTime ? A.PlayTime.checkpoint().then(function (ok) { if (!ok) return new Promise(function () {}); }) : null; }).then(function () { location.reload(); });   // play-time limit: only after the game's end card
  }

  /* ---------- story stop: result -> Story.record (same as a Munch stop) -> back to the map ---------- */
  function endStory() {
    if (G.over) return; G.over = true; clearInterval(G.timer); renderBoard(); clearBases();
    var pl = PL[0], P = P1, st = ST.STOPS[SI], ms = Math.min(Date.now() - G.t0, 15 * 60000), fin = totalRuns(pl) >= SC.goal, frac = Math.min(1, totalRuns(pl) / SC.goal);
    var R0 = ST.run(P), practice = !st.side && (R0.done || SI !== R0.stop), runBefore = R0.score;
    // stars like a Munch stop: cleared = 3 (no misses) / 2 (1-2 misses) / 1; not cleared = 2 if close, else 1
    var stars = fin ? (pl.wrong <= 1 ? 3 : pl.wrong <= 3 ? 2 : 1) : (frac >= .75 && pl.wrong <= 1 ? 2 : 1);
    // score on the same scale as a Munch stop: the goal counts as the stop's snacks (6-7), so a Slugger stop is worth about the same
    var out = ST.record(P, SI, { correct: Math.round(SC.nOk * frac), wrong: pl.wrong, finished: fin, frac: frac, gaveUp: false, secsLeft: 0, timerOn: false, stars: stars });
    var x = bb(P); x.storyGames = (x.storyGames || 0) + 1; x.hits += pl.hits; x.homers += pl.homers; x.runs += totalRuns(pl); x.outs += pl.outs; x.pitches += pl.pitches; x.right += pl.right;
    A.Store.addTime(P, 'baseball', ms); A.Store.markPlayed(P);
    A.Store.earnStars(P, stars, 'story'); var rewards = A.Rewards.check(P); A.Store.save(); $('#starCount').textContent = P.stars;
    if (out.passed) { M.jingle(); crowd(true, true); }
    var R = ST.run(P), pts = out.pts, next = out.runAdded ? Math.min(SI + 1, ST.mainCount() - 1) : out.sideNext != null ? out.sideNext : SI;
    G.result = { story: true, stop: SI, passed: out.passed, hits: pl.hits, runs: totalRuns(pl), goal: SC.goal, stars: stars, pts: pts.total, next: next, out: out };
    var rows = [['⚾ Runs', pts.snacks], ['🎯 Accuracy', pts.accuracy], ['🏟️ Game bonus', pts.time], ['✨ Perfect', pts.perfect]].filter(function (r) { return r[1] > 0 || r[0].indexOf('Runs') >= 0; });
    var html = '<p class="chgoal">' + A.esc(SC.goalText) + ': <b>' + Math.min(totalRuns(pl), SC.goal) + '</b> of ' + SC.goal + ' · ' + pl.hits + (pl.hits === 1 ? ' hit' : ' hits') + '</p>' +
      '<div class="stars">' + [0, 1, 2].map(function (i) { return '<span>' + UI.STAR.replace('<svg', '<svg class="' + (i < stars ? 'got' : '') + '" style="animation-delay:' + (.3 + i * .3).toFixed(2) + 's"') + '</span>'; }).join('') + '</div>' +
      '<div class="score"><table>' + rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td class="v">' + r[1] + '</td></tr>'; }).join('') + '<tr class="tot"><td>Stop score</td><td class="v" data-v="' + pts.total + '">' + pts.total + '</td></tr></table>' +
      (out.runAdded ? '<div class="journey">Journey score <b>' + R.score + '</b> <small>(+' + (R.score - runBefore) + ')</small></div>' : practice ? '<div class="journey soft">Practice round · best here ' + (ST.stopInfo(P, SI) || {}).best + '</div>' : '') +
      (out.newBestRun ? '<div class="newbest">🏆 New high score!</div>' : out.newBestStop ? '<div class="newbest">🏅 New best for this stop!</div>' : '') + '</div>';
    for (var s1 = 0; s1 < stars; s1++) setTimeout(SFX.star, 400 + s1 * 300);
    var voice = out.passed ? ['fb_hooray', 'fb_you_got', stars, stars === 1 ? 'fb_star' : 'fb_stars'] : ['story_try_again'];   // existing lines only
    return wait(900).then(function () {
      return UI.card({ tag: st.area.emoji + (st.side ? ' ' + C.byId[SC.skill].name : ' Stop ' + st.n) + ' · ' + st.area.name, title: out.passed ? 'Stop cleared!' : 'So close!', html: html,
        art: '<div class="' + (out.passed ? 'dance' : '') + '">' + blobOf(pl, { expr: out.passed ? 'happy' : 'sad' }) + '</div>', sub: out.passed ? '' : 'Try again! ' + SC.goalText + '.',
        btn: out.passed ? 'Map ▶' : 'Try again ▶', sfx: out.passed ? 'win' : 'soft', confetti: out.passed, voice: voice, cls: 'celebrate storyres bbstory' + (out.passed ? '' : ' tryagain'), minMs: 900 });
    }).then(function () { return A.Rewards.celebrate(P, rewards); })
      .then(function () { return A.PlayTime ? A.PlayTime.checkpoint().then(function (ok) { if (!ok) return new Promise(function () {}); }) : null; })
      .then(function () {
        M.stop(); G.left = out.passed ? 'map' : 'retry';
        if (window.__noNav) return;
        if (!out.passed) { location.reload(); return; }   // "Try again": the same stop (a helper stop after two misses)
        location.href = MAPURL + '&from=' + SI + '&to=' + next;
      });
  }

  /* ---------- input ---------- */
  document.addEventListener('keydown', function (e) {
    if (UI.cardOpen || A.Parent.isOpen() || A.$('#gate') || A.$('.overlay.on')) return;
    var k = e.key;
    if (k === 'm' || k === 'M') { M.toggle(); musicBtn(); return; }
    if (k === 'r' || k === 'R') { if (G.q) V.say(G.q.say, { kind: 'tap' }); return; }
    if (k === 'Escape') { e.preventDefault(); UI.confirm({ title: 'Stop this game?', sub: 'You can play again any time.', yes: 'Stop', no: 'Keep playing' }).then(function (y) { if (y) { V.stop(); M.stop(); location.href = STORYB ? MAPURL : 'index.html'; } }); return; }
    if (!G.q || !G.accept) { if (k === ' ' || k === 'Enter') e.preventDefault(); return; }
    var n = G.q.choices.length;
    if (/^[1-4]$/.test(k) && +k <= n) { e.preventDefault(); G.sel = +k - 1; markSel(); answer(G.sel, 'key'); return; }
    if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'a' || k === 'A' || k === 'w' || k === 'W') { e.preventDefault(); G.sel = (G.sel + n - 1) % n; markSel(true); SFX.step(); return; }
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'd' || k === 'D' || k === 's' || k === 'S') { e.preventDefault(); G.sel = (G.sel + 1) % n; markSel(true); SFX.step(); return; }
    if (k === ' ' || k === 'Enter' || k === 'f' || k === 'F') { e.preventDefault(); if (!e.repeat) answer(G.sel, 'key'); }
  });
  function musicBtn() { var b = $('#musicBtn'); b.classList.toggle('off', S.music === false); b.setAttribute('aria-label', S.music === false ? 'Music is off (M)' : 'Music is on (M)'); }
  $('#musicBtn').addEventListener('click', function () { M.toggle(); musicBtn(); });
  $('#speakBtn').addEventListener('click', function () { if (G.q) V.say(G.q.say, { kind: 'tap' }); });
  $('#homeBtn').addEventListener('click', function () { V.stop(); M.stop(); SFX.tap(); A.Store.save(); location.href = STORYB ? MAPURL : A.ROOT + 'index.html#games'; });
  UI.gear({ onClose: function () { musicBtn(); M.apply(); } });
  musicBtn();

  /* ---------- go! ---------- */
  // game controllers: D-pad picks a card, A swings (= Space / F). In 2P only the batter's controller works.
  A.Pad.context({ game: true, two: TWO, names: PL.map(function (p) { return p.name; }), only: TWO ? function (slot) { return slot === G.half; } : null });
  function padKeys() {
    var old = A.$('#padKeys'); if (old) old.remove();
    var el = A.el(A.Pad.keys([['dpad', 'pick'], ['a', 'choose / swing!'], ['y', 'hear again'], ['b', 'pause']])); el.id = 'padKeys'; $('#keys').after(el);
  }
  padKeys();
  renderTurn(); renderBoard(); newBatter(false);
  M.play('ballpark');
  window.__bb = {
    G: G, PL: PL, two: TWO, HITS: HITS, hitOdds: hitOdds, rollHit: rollHit, speedOf: speedOf, diffOf: diffOf, quickSec: quickSec,
    swingReady: function () { return false; },   // there is no swing picker any more (ux3b); kept so older tests' helpers still run
    answer: answer, right: function () { return G.q ? G.q.answer : -1; }, wrongIdx: function () { return G.q ? (G.q.answer + 1) % G.q.choices.length : -1; },
    setElapsed: function (sec) { G.voiceDone = true; G.qT0 = Date.now() - sec * 1000; },
    ready: function () { return !!(G.phase === 'pitch' && G.q && G.accept && !G.busy); },
    set speed(v) { SPEED = v; }, get speed() { return SPEED; },
    scoreQ: scoreQuestion, sbPic: sbPic,   // v2p1a test hooks
    total: totalRuns, endGame: endGame, R: R, RIV: RIV, rival: RIVALON, maxOuts: maxOuts, mercy: mercy, isBonus: function () { return !!(G.q && G.q.bonus); }, whereChoices: function (from) { return whereChoices(from).map(function (x) { return x === 4 ? 'Home 🏠' : BASEN[x]; }); }, story: STORYB ? { stop: SI, cfg: SC, end: endStory } : null, bases: function () { return G.bases.map(Boolean); }
  };
  if (STORYB) {
    document.body.classList.add('story');
    var sst = ST.STOPS[SI], ssk = C.byId[SC.skill];
    wait(400).then(function () { return UI.card({ tag: sst.area.emoji + (sst.side ? ' ' + ssk.name : ' Stop ' + sst.n) + ' · ' + sst.area.name, title: A.TITLES.baseball, art: '<div class="dance">' + blobOf(PL[0]) + '</div>',
      html: '<p class="howto"><b class="sgoalbig">🎯 ' + A.esc(SC.goalText) + '!</b><br>Answer the pitch to swing. Right answers are hits, misses are outs. ' + (SC.outs || R.outsFor(LITTLE)) + ' outs and the inning is over.</p><p class="small">' + A.esc(ssk.name) + ' · ' + A.esc(ssk.levels[SC.level]) + (SC.helper ? ' · a little easier' : '') + '</p>',
      sub: SC.innings === 1 ? 'One big inning' : SC.innings + ' short innings', btn: 'Play ball! ▶', voice: ['bb_title'], cls: 'bbintro bbstory', minMs: 500 }); }).then(startHalf);
  } else
  wait(400).then(function () { return UI.card({ tag: TWO ? PL[0].name + ' vs ' + PL[1].name : 'Batter up!', title: A.TITLES.baseball, art: '<div class="dance">' + blobOf(PL[0]) + '</div>',
    html: '<p class="howto">' + (RIVALON ? 'Beat the ' + RIV.icon + ' <b>' + A.esc(RIV.name) + '</b>! They bat first, then you.<br>' : '') + 'Answer the pitch to swing! Get it right and you hit it:<br><span class="zchip sg">⚾ single</span> <span class="zchip db">⚾⚾ double</span> <span class="zchip tr">🔥 triple</span> <span class="zchip hr">💥 home run</span><br>Fast, tricky answers hit farther! A miss is an out.</p>' + (TWO && (A.Pad.seats()[0] || A.Pad.seats()[1]) ? '<p class="small">' + A.esc(PL[0].name) + ': ' + A.Pad.label(0, '⌨ keyboard') + ' · ' + A.esc(PL[1].name) + ': ' + A.Pad.label(1, '⌨ keyboard') + '</p>' : ''),
    sub: INNINGS + ' innings · ' + R.outsFor(LITTLE) + ' outs (or ' + R.mercyFor(LITTLE) + ' runs) each inning', btn: 'Play ball! ▶', voice: ['bb_title'], cls: 'bbintro', minMs: 500 }); }).then(startHalf);
  // design1: keep the friend's speech bubble above the answer cards in landscape (baseball.css uses --bbCardsTop)
  (function () { var cs = document.getElementById('cards'); if (!cs) return;
    function upd() { var t = cs.getBoundingClientRect().top; if (t > 0) document.documentElement.style.setProperty('--bbCardsTop', Math.round(t) + 'px'); }
    upd(); window.addEventListener('resize', upd); if (window.ResizeObserver) new ResizeObserver(upd).observe(cs); setInterval(upd, 1000); })();
})(window.Arcade);
