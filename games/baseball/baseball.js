/* Blob Baseball — offense-only math baseball on the Blob Arcade core.
   Every pitch is a question from the kid's own skill & level (A.Questions, built on the shared curriculum registry).
   Right answer = a hit: the faster the answer (scaled to skill, level and age), the bigger the hit
   (single → double → triple → home run). Wrong answer = a strike (and the right answer is said); three strikes
   is an out (struck out, or a pop fly the friendly fielder catches). 3 innings; a half-inning ends at 3 outs or when
   the whole lineup has batted (6 batters; 4 for age 4 and under, 5 each in 2 players). Runners advance, runs score.
   Controls: tap/click a big answer card, or keys 1–4, or arrows + Space/Enter (F works too). R repeats the question,
   M music. 2 players (same device): alternating half-innings, each kid with their own questions. */
(function (A) {
  'use strict';
  var $ = A.$, C = A.Curriculum, Q = A.Questions, V = A.Voice, SFX = A.Audio.SFX, UI = A.UI, M = A.Music, B = A.Blobs;
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
    var g = A.Store.blank('Guest', 'clem'); g.id = 'guest'; g.color = 'sky'; g.guest = true; g.age = kind === 'easy' ? 4 : null; C.ensure(g);
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
  function sayWait(parts, cap) { return Promise.race([V.say(parts), wait(cap || 4000)]); }

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
  function capFor(p) { if (TWO) return 5; return p.age != null && p.age <= 4 ? 4 : p.age === 5 ? 5 : 6; }
  function nChoices(p) { return p.age != null && p.age <= 5 ? 3 : 4; }
  // the four swings: the batter picks one before every pitch. The question's difficulty follows the swing (Questions.step);
  // a right answer gives exactly that hit, a wrong one is a strike — so a bigger swing is a bigger risk.
  var SWINGS = [
    { k: 'sg', name: 'Single', sub: 'easy', icon: '⚾', bases: 1, off: -1, line: 'bb_sw_single', short: 'bb_single' },
    { k: 'db', name: 'Double', sub: 'just right', icon: '⚾⚾', bases: 2, off: 0, line: 'bb_sw_double', short: 'bb_double' },
    { k: 'tr', name: 'Triple', sub: 'tricky', icon: '🔥', bases: 3, off: .5, line: 'bb_sw_triple', short: 'bb_triple' },
    { k: 'hr', name: 'Home Run', sub: 'challenge!', icon: '💥', bases: 4, off: 1, line: 'bb_sw_homer', short: 'bb_home_run' }
  ];

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
        box.innerHTML = tile('one', '1 Player', '3 innings · answer fast for big hits!', '<span class="one bat">' + B.forProfile(P1, { expr: 'happy', outfit: 'helmet', helmet: COLORS[0].c, helmetDark: COLORS[0].d }) + '</span>', 'onep') +
          tile('two', '2 Players', 'Take turns at bat, each with your own questions', '<span class="pair">' + B.forProfile(P1, { expr: 'happy', outfit: 'helmet', helmet: COLORS[0].c, helmetDark: COLORS[0].d }) + B.svg({ blob: P1.blob === 'poppy' ? 'mochi' : 'poppy', expr: 'happy', outfit: 'helmet', helmet: COLORS[1].c, helmetDark: COLORS[1].d }) + '</span>', 'two');
        fns = { one: function () { go('mode=solo'); }, two: function () { V.say(['hub_pick_friend']); render('partner'); } };
      } else {
        $('#menuQ').textContent = 'Who is playing with ' + P1.name + '?';
        var h = '';
        A.Store.profiles().filter(function (p) { return p.id !== P1.id; }).forEach(function (p) {
          h += tile('p:' + p.id, p.name, '⭐ ' + p.stars + ' · best ' + (bb(p).best || 0), '<span class="one">' + B.forProfile(p, { expr: 'happy' }) + '</span>', 'kidt');
          fns['p:' + p.id] = function () { V.say([nameParts(p)]); go('mode=two&p2=' + encodeURIComponent(p.id)); };
        });
        [['easy', 'Guest · Easy', 'Counting'], ['medium', 'Guest · Medium', 'Adding to 10'], ['hard', 'Guest · Hard', 'Adding to 20']].forEach(function (g) {
          h += tile('g:' + g[0], g[1], g[2], '<span class="one">' + B.svg({ blob: 'clem', color: 'sky', expr: 'happy' }) + '</span>', 'guest');
          fns['g:' + g[0]] = function () { go('mode=two&p2=guest-' + g[0]); };
        });
        box.innerHTML = h + '<button class="mtile backt" data-nav data-id="back"><span class="mt">◀ Back</span></button>'; fns.back = back;
      }
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
  function scores() { V.say(['bb_high_scores']); return UI.card({ tag: 'Family', title: 'High scores', html: boardHTML([P1.id]) + '<p class="small">Most runs in one game. Home runs = answers that were super fast!</p>', btn: 'OK', cls: 'scores', minMs: 300 }); }

  /* ================= the game ================= */
  var sec = $('#game'); A.$$('.screen').forEach(function (s) { s.classList.toggle('on', s === sec); });
  document.body.classList.toggle('two', TWO);
  function mkPlayer(P, i) { return { i: i, P: P, name: P.name, col: COLORS[i], runsBy: [], hits: 0, homers: 0, right: 0, wrong: 0, pitches: 0, outs: 0, round: null, hr: 0, hw: 0, sw: {}, sgRun: 0, lastSwing: null, log: [], t0: 0, cap: capFor(P), times: [] }; }
  var PL = [mkPlayer(P1, 0)]; if (TWO) PL.push(mkPlayer(P2, 1));
  var G = { phase: 'intro', swing: null, swSel: 1, inning: 1, half: 0, outs: 0, strikes: 0, pa: 0, bases: [null, null, null], q: null, accept: false, busy: false, sel: 0, qT0: 0, voiceDone: false, over: false, t0: Date.now(), recent: [], pitchN: 0, clockT: null, timer: null };
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
    s += '<g id="fielders"></g><g id="runners"></g><g id="pitcherG"></g><g id="batterG"></g><g id="ballG"><ellipse id="ballShadow" rx="12" ry="5" fill="#2d2547" opacity="0"/><g id="ball" opacity="0"><circle r="13" fill="#fff" stroke="#d9d2c4" stroke-width="2"/><path d="M-7 -10 Q-2 0 -7 10 M7 -10 Q2 0 7 10" stroke="#ff5a6e" stroke-width="2.2" fill="none"/></g></g>';
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
  var rival = P1.blob === 'pickle' || (P2 && P2.blob === 'pickle') ? 'clem' : 'pickle';
  var pitcher = actor($('#pitcherG'), B.svg({ blob: rival, color: 'grape', outfit: 'cap', expr: 'happy' }), 118, { cls: 'pitcher' }); place(pitcher, MOUND.x, MOUND.y - 4);
  var fielders = FIELDERS.map(function (f, k) { var g = actor($('#fielders'), B.svg({ blob: ['dewdrop', 'nova', 'poppy'][k], color: 'grape', outfit: 'cap', expr: 'happy' }), 70, { cls: 'fielder' }); place(g, f.x, f.y); return g; });
  var batter = null, batEl = null;
  function newBatter(walkIn) {
    if (batter) batter.remove();
    var pl = bat();
    batter = actor($('#batterG'), blobOf(pl), 180, { cls: 'batter' });
    batEl = document.createElementNS(NS, 'g'); batEl.setAttribute('class', 'bat');
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
  function fly(to, peak, ms, endScale, keep) {
    var a = { x: 790, y: 660 };
    return tween(ms, function (t) {
      var x = lerp(a.x, to.x, t), gy = lerp(706, to.y, t), y = gy - Math.sin(t * Math.PI) * peak - (1 - t) * 46, s = lerp(1.1, endScale, t);
      ballAt(x, y, s); shadowAt(x, gy, .22 * (1 - t * .5), lerp(1, endScale, t));
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
  // advance everybody n bases (batter included). Returns the number of runs.
  function advance(n, msPerBase) {
    var pl = bat(), moves = [], runs = 0, nb = [null, null, null];
    for (var b = 2; b >= 0; b--) {
      var r = G.bases[b]; if (!r) continue;
      var to = b + 1 + n;
      if (to >= 4) { runs++; moves.push(runTo(r, b + 1, 4, msPerBase).then(scoreRun.bind(null, pl, r))); }
      else { nb[to - 1] = r; moves.push(runTo(r, b + 1, to, msPerBase)); }
    }
    // the batter drops the bat and becomes a runner
    var br = runnerEl(pl); var p0 = posOnPath(0); place(br, p0.x - 60, p0.y + 14);
    batter.setAttribute('opacity', 0);
    if (n >= 4) { runs++; moves.push(runTo(br, 0, 4, msPerBase).then(scoreRun.bind(null, pl, br))); }
    else { nb[n - 1] = br; moves.push(runTo(br, 0, n, msPerBase)); }
    G.bases = nb;
    return { runs: runs, done: Promise.all(moves) };
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
    var h = '<div class="sbt">BLOB BASEBALL</div><table><tr><th></th>';
    for (var i = 1; i <= INNINGS; i++) h += '<th class="' + (i === G.inning ? 'cur' : '') + '">' + i + '</th>';
    h += '<th class="tot">R</th><th>H</th></tr>';
    PL.forEach(function (pl, k) {
      var tot = pl.runsBy.reduce(function (a, b) { return a + (b || 0); }, 0);
      h += '<tr class="' + (k === G.half && !G.over ? 'up' : '') + '"><td class="nm"><i style="background:' + pl.col.c + '"></i>' + A.esc(pl.name) + '</td>';
      for (var j = 0; j < INNINGS; j++) h += '<td>' + (pl.runsBy[j] != null ? pl.runsBy[j] : '') + '</td>';
      h += '<td class="tot">' + tot + '</td><td>' + pl.hits + '</td></tr>';
    });
    h += '</table><div class="sbf"><span>BATTER <b>' + Math.min(G.pa + 1, bat().cap) + '</b>/' + bat().cap + '</span><span class="lt">OUT ' + [0, 1, 2].map(function (i) { return '<i class="' + (i < G.outs ? 'on o' : '') + '"></i>'; }).join('') + '</span>' +
      '<span class="lt">STRIKE ' + [0, 1].map(function (i) { return '<i class="' + (i < G.strikes ? 'on s' : '') + '"></i>'; }).join('') + '</span></div>';
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
    var pl = bat(), r = pl.round, q, g = 0, st = Q.step(pl.P, r, (G.swing || SWINGS[1]).off), n = nChoices(pl.P);
    if (st.easy) n = Math.max(2, n - 1);                       // very first step: "easier" = fewer choices
    else if (st.hard && st.offset === 1) n = 4;                  // a challenge that can't climb (little ones / the very top): bigger numbers, all 4 choices
    do { q = Q.make(st.skill, st.level, { choices: n, hard: st.hard }); } while (G.recent.indexOf(q.key) >= 0 && g++ < 20);
    q.atLevel = st.atLevel; q.offset = st.offset;
    G.recent.push(q.key); if (G.recent.length > 12) G.recent.shift();
    return q;
  }
  function renderQuestion(q) {
    $('#qTxt').innerHTML = q.text; $('#qPic').innerHTML = q.pic || ''; $('#qPic').classList.toggle('on', !!q.pic);
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
    if (say && G.q && G.q.choices[G.sel].say) V.say(G.q.choices[G.sel].say);
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
  /* ---------- pick a swing ---------- */
  function markSwing(say) {
    A.$$('#cards .swbtn').forEach(function (b, i) { b.classList.toggle('sel', i === G.swSel); });
    if (say) V.say([SWINGS[G.swSel].short]);
  }
  function pickSwing() {
    if (G.over) return;
    var pl = bat(); G.phase = 'swing'; G.q = null; G.swing = null; G.accept = false; G.busy = false; clearInterval(G.timer);
    renderBoard(); if (batEl) setBat(-118); $('#pitcherG').classList.remove('set');
    $('#qTxt').innerHTML = (TWO ? '<b style="color:' + pl.col.d + '">' + A.esc(pl.name) + '</b>, pick' : 'Pick') + ' your swing!';
    $('#qPic').innerHTML = ''; $('#qPic').classList.remove('on'); $('#swingTag').innerHTML = ''; $('#swingTag').className = 'swingtag'; $('#shot').textContent = '';
    $('#sign').classList.remove('done'); B.anim($('#sign'), 'signpop', 400);
    var box = $('#cards'); box.innerHTML = ''; box.classList.remove('n3'); box.classList.add('swings'); box.setAttribute('aria-label', 'Pick your swing');
    SWINGS.forEach(function (w, i) {
      var b = A.el('<button class="swbtn sw-' + w.k + '" data-i="' + i + '" aria-label="' + (i + 1) + ': ' + w.name + ', ' + w.sub + '"><span class="kk">' + (i + 1) + '</span><span class="si">' + w.icon + '</span><span class="sn">' + w.name + '</span><span class="ss">' + w.sub + '</span></button>');
      b.addEventListener('click', function () { if (G.phase === 'swing' && !G.busy && !UI.cardOpen) { G.swSel = i; markSwing(false); chooseSwing(i, 'click'); } });
      box.appendChild(b);
    });
    G.swSel = pl.lastSwing != null ? pl.lastSwing : 1; markSwing(false);
    // a gentle nudge: after three Singles in a row the crowd cheers for a bigger swing (never required, never a penalty)
    var line = G.strikes === 0 ? ['bb_pick_swing'] : [];
    if (pl.sgRun >= 3) { pl.sgRun = 0; G.nudges = (G.nudges || 0) + 1; line = ['bb_nudge']; crowd(true, false); A.$$('#cards .sw-db, #cards .sw-tr, #cards .sw-hr').forEach(function (b) { B.anim(b, 'nudge', 1400); }); }
    if (line.length) V.say(line);
  }
  function chooseSwing(i, how) {
    if (G.phase !== 'swing' || G.busy || G.over) return;
    var pl = bat(), w = SWINGS[i]; G.busy = true; G.swing = w; G.phase = 'pitch'; pl.lastSwing = i;
    pl.sgRun = i === 0 ? pl.sgRun + 1 : 0;
    var box = $('#cards'); box.classList.remove('swings'); box.setAttribute('aria-label', 'Answer choices');
    A.$$('#cards .swbtn').forEach(function (b, k) { b.disabled = true; b.classList.toggle('picked', k === i); b.classList.toggle('dim', k !== i); });
    $('#swingTag').innerHTML = w.icon + ' ' + w.name + ' swing'; $('#swingTag').className = 'swingtag on ' + w.k;
    SFX.pop(); if (w.k === 'hr') { crowd(true, false); M.charge(); }
    V.stop();
    return sayWait([w.line], 3200).then(startPitch);
  }
  function startPitch() {
    if (G.over) return;
    G.phase = 'pitch'; $('#cards').classList.remove('swings');
    var q = G.q = newQuestion(); G.pitchN++;
    renderQuestion(q); renderBoard(); if (batEl) setBat(-118);
    $('#sign').classList.remove('done'); B.anim($('#sign'), 'signpop', 400);
    // the pitcher gets set; the voice reads the question; the clock starts when it has been read
    $('#pitcherG').classList.add('set');
    G.accept = true; G.busy = false; G.voiceDone = false; G.qT0 = Date.now(); $('#shot').textContent = S.bbClock > 0 ? '⏱ ' + S.bbClock : '';
    var my = G.pitchN;
    Promise.race([V.say(q.say), wait(6000)]).then(function () { if (G.pitchN === my && !G.voiceDone) { G.voiceDone = true; G.qT0 = Date.now(); } });
    clearInterval(G.timer); G.timer = setInterval(tick, 100); tick();
  }
  function lockCards(ok, i, q) {
    A.$$('#cards .bcard').forEach(function (b, k) { b.disabled = true; if (k === q.answer) b.classList.add('right'); else if (k === i) b.classList.add('wrong'); else b.classList.add('dim'); });
    $('#sign').classList.add('done');
  }
  function answer(i, how) {
    if (!G.q || !G.accept || G.busy || G.over || UI.cardOpen) return;
    G.accept = false; G.busy = true; clearInterval(G.timer);
    var q = G.q, pl = bat(), ok = i === q.answer, e = elapsed(), w = G.swing || SWINGS[1];
    // logged against the skill actually asked (a Single may be the step below, a Home Run the next step up)…
    pl.pitches++; C.recordAnswer(pl.P, q.skill, ok);
    // …and only pitches at her own level count toward this half-inning's level-up round, so easier/harder swings don't skew it
    if (q.atLevel) { if (ok) pl.hr++; else pl.hw++; }
    if (ok) { pl.right++; pl.times.push(e); var rt = bb(pl.P).rt; if (!pl.P.guest) rt[q.skill] = rt[q.skill] ? +(rt[q.skill] * .8 + e * .2).toFixed(2) : +e.toFixed(2); }
    else pl.wrong++;
    var sw = pl.sw[w.k] || (pl.sw[w.k] = { n: 0, ok: 0 }); sw.n++; if (ok) sw.ok++;
    pl.log.push({ swing: w.k, skill: q.skill, level: q.level, hard: !!q.hard, atLevel: q.atLevel, ok: ok });
    lockCards(ok, i, q); V.stop();
    G.last = { ok: ok, sec: +e.toFixed(2), how: how, swing: w.k, zone: ok ? w.k : null, skill: q.skill, level: q.level, hard: !!q.hard, atLevel: q.atLevel, offset: q.offset };
    var p = ok ? doHit(w, q) : doMiss(q, false, w.k === 'hr');
    p.then(afterPitch);
  }
  function timeout() { // optional shot clock ran out: a strike (not counted as a wrong answer for the skill)
    if (!G.accept || G.busy) return;
    G.accept = false; G.busy = true; clearInterval(G.timer); bat().pitches++;
    lockCards(false, -1, G.q); V.stop(); G.last = { ok: false, timeout: true };
    doMiss(G.q, true).then(afterPitch);
  }

  /* ---------- outcomes ---------- */
  var HITLINE = { sg: 'bb_single', db: 'bb_double', tr: 'bb_triple', hr: 'bb_home_run' };
  var HITNAME = { sg: 'SINGLE!', db: 'DOUBLE!', tr: 'TRIPLE!', hr: 'HOME RUN!' };
  function doHit(z, q) {
    var pl = bat(); pl.hits++; if (z.k === 'hr') pl.homers++;
    var loaded = G.bases.every(Boolean);
    return throwPitch().then(function () {
      FX.crack(); swing(true);
      var side = Math.random() < .5 ? -1 : 1, to, peak, ms, sc;
      if (z.k === 'sg') { to = { x: 800 + side * A.pick([150, 260, 0]), y: 470 }; peak = 70; ms = 700; sc = .7; }
      else if (z.k === 'db') { to = { x: 800 + side * 420, y: 418 }; peak = 260; ms = 900; sc = .55; }
      else if (z.k === 'tr') { to = { x: 800 + side * 640, y: 380 }; peak = 320; ms = 1000; sc = .5; }
      else { to = { x: 800 + side * A.rnd(80, 420), y: 120 }; peak = 560; ms = 1300; sc = .3; }
      banner(HITNAME[z.k], 'hit ' + z.k, z.k === 'hr' ? 2600 : 1400);
      var flight = fly(to, peak, ms, sc);
      if (z.k !== 'hr') flight = flight.then(function () { // a fielder runs over and tosses it back in
        var f = fielders[to.x < 700 ? 0 : to.x > 900 ? 2 : 1]; B.anim(f.firstChild, 'hop', 500);
      });
      var ad = advance(z.bases, z.k === 'hr' ? 560 : 380);
      var voice = [HITLINE[z.k]];
      if (z.k === 'hr' && loaded) voice = ['bb_grand_slam'];
      if (ad.runs === 1 && z.k !== 'hr') voice.push('bb_run_scores'); else if (ad.runs >= 2) voice.push(ad.runs, 'bb_runs_score');
      var vp = sayWait(voice, 4500);
      if (z.k === 'hr') { crowd(true, true); fireworks(6); M.charge(); UI.rain(40); A.Pad.rumble(G.half, 'big'); } else if (z.k !== 'sg' || ad.runs) crowd(true, false);
      return Promise.all([flight, ad.done, vp]).then(function () { return wait(250); }).then(function () { G.strikes = 0; return endPA(); });
    });
  }
  function doMiss(q, isTimeout, whiff) {
    var pl = bat(); G.strikes++;
    var out = G.strikes >= 3, caught = out && Math.random() < .5;
    return throwPitch().then(function () {
      if (caught) { // a pop fly: up, up… and the friendly fielder catches it
        FX.crack(); swing(true); var f = fielders[A.rnd(0, 2)], fp = { x: f._x, y: f._y - 60 };
        banner('CAUGHT!', 'out', 1500);
        return fly({ x: fp.x, y: f._y }, 520, 1200, .45, true).then(function () { hideBall(); FX.mitt(); B.anim(f.firstChild, 'jump', 600); });
      }
      swing(false); if (whiff) { B.anim(batter.firstChild, 'whiff', 800); FX.whoosh(); }
      return tween(220, function (t) { ballAt(lerp(790, 812, t), lerp(666, 760, t), lerp(1.15, 1.3, t), 1 - t); }).then(function () { FX.mitt(); hideBall(); banner(whiff && !out ? 'BIG WHIFF!' : out ? 'STRIKE THREE!' : 'STRIKE ' + G.strikes + '!', 'strike', 1300); });
    }).then(function () {
      FX.aww(); B.anim(batter.firstChild, 'wobble', 600);
      var voice = isTimeout ? ['bb_time_strike'] : [out ? (caught ? 'bb_caught' : 'bb_strike_three') : whiff ? 'bb_big_whiff' : G.strikes === 2 ? 'bb_strike_two' : 'bb_strike'];
      voice = voice.concat(q.fact || []);
      renderBoard();
      return sayWait(voice, 6500).then(function () { return wait(350); });
    }).then(function () {
      if (!out) return 'again';
      G.outs++; pl.outs++; G.strikes = 0; renderBoard();
      return tween(420, function (t) { batter.setAttribute('opacity', 1 - t); place(batter, lerp(712, 600, t), 720 + 30 * t); }).then(endPA);
    });
  }
  function endPA() { G.pa++; renderBoard(); A.Store.save(); return G.outs >= 3 || G.pa >= bat().cap ? 'half' : 'next'; }
  function afterPitch(what) {
    if (G.over) return;
    if (what === 'again') return pickSwing();
    if (what === 'next') return newBatter(true).then(pickSwing);
    return endHalf();
  }

  /* ---------- innings ---------- */
  function startHalf() {
    var pl = bat(); G.outs = 0; G.strikes = 0; G.pa = 0;
    pl.round = C.pickRound(pl.P); pl.hr = 0; pl.hw = 0; pl.t0 = Date.now();
    if (pl.runsBy[G.inning - 1] == null) pl.runsBy[G.inning - 1] = 0;
    renderTurn(); renderBoard();
    clearBases(); hideBall();
    $('#qTxt').innerHTML = ''; $('#qPic').innerHTML = ''; $('#cards').innerHTML = '';
    var last = G.inning === INNINGS && (!TWO || G.half === 0);
    banner((last ? 'Last inning!' : 'Inning ' + G.inning) + (TWO ? '<small>' + A.esc(pl.name) + ' up to bat</small>' : ''), 'inning', 2000);
    var voice = last && !TWO ? ['bb_last_inning'] : ['bb_inning', G.inning];
    if (TWO || G.inning === 1) voice = voice.concat(['bb_batter_up', nameParts(pl.P)]);
    if (G.inning === 1 && G.half === 0 && !G.tipped) { G.tipped = true; voice.push('bb_swing_tip'); }
    if (G.inning === 1 || TWO) M.charge();
    return Promise.all([newBatter(true), sayWait(voice, 7000)]).then(function () { return wait(200); }).then(pickSwing);
  }
  function endHalf() {
    var pl = bat(), threeOuts = G.outs >= 3;
    $('#cards').innerHTML = ''; $('#qTxt').innerHTML = ''; $('#qPic').innerHTML = '';
    var ms = Date.now() - pl.t0, out = pl.hr + pl.hw ? C.finishRound(pl.P, pl.round, { correct: pl.hr, wrong: pl.hw, ms: ms }) : { say: [], events: {} };
    if (!pl.P.guest) A.Store.addTime(pl.P, 'baseball', ms);
    A.Store.save();
    banner(threeOuts ? 'THREE OUTS!' : 'INNING OVER', 'inning', 1700);
    var line = threeOuts ? (TWO ? 'bb_three_outs' : 'bb_three_outs_next') : 'bb_inning_over';
    var lastHalf = G.inning === INNINGS && (!TWO || G.half === 1);
    if (lastHalf) line = threeOuts ? 'bb_out' : 'bb_inning_over';
    var chain = sayWait([line], 4000).then(function () { return wait(300); });
    // new skill reached? show the shared "New skill!" card between innings (same mastery data as Mochi Munch)
    if (!pl.P.guest && out.events.newSkill) chain = chain.then(function () { return A.Rewards.celebrate(pl.P, [{ kind: 'skill', id: out.events.newSkill }], TWO ? pl.name : null); });
    else if (out.events.levelUp) chain = chain.then(function () { UI.toast((TWO ? pl.name + ': ' : '') + 'Level up! The next ones are a little trickier.'); });
    return chain.then(function () {
      if (lastHalf) return endGame();
      if (TWO && G.half === 0) G.half = 1; else { G.half = 0; G.inning++; }
      return startHalf();
    });
  }

  /* ---------- game over ---------- */
  function starsFor(pl) {
    var acc = pl.right + pl.wrong ? pl.right / (pl.right + pl.wrong) : 1, goal = pl.cap;
    var big = ((pl.sw.tr || {}).ok || 0) + ((pl.sw.hr || {}).ok || 0);   // a kind nudge: one big hit also earns the third star
    return 1 + (acc >= .7 ? 1 : 0) + (totalRuns(pl) >= goal || big > 0 ? 1 : 0);
  }
  function endGame() {
    G.over = true; clearInterval(G.timer); renderBoard(); clearBases();
    var res = PL.map(function (pl) {
      var P = pl.P, runs = totalRuns(pl), st = starsFor(pl), x = bb(P), newBest = !P.guest && runs > (x.best || 0);
      if (!P.guest) {
        A.Store.earnStars(P, st, 'baseball'); x.games++; x.runs += runs; x.hits += pl.hits; x.homers += pl.homers; x.outs += pl.outs; x.pitches += pl.pitches; x.right += pl.right;
        x.swings = x.swings || {}; Object.keys(pl.sw).forEach(function (k) { var a = x.swings[k] || (x.swings[k] = { n: 0, ok: 0 }); a.n += pl.sw[k].n; a.ok += pl.sw[k].ok; });
        if (newBest) { x.best = runs; x.bestAt = Date.now(); }
        x.last = { at: Date.now(), runs: runs, hits: pl.hits, homers: pl.homers, byInning: pl.runsBy.slice(), right: pl.right, wrong: pl.wrong, swings: pl.sw, two: TWO, vs: TWO ? PL[1 - pl.i].name : null };
        if (TWO) x.twoGames++;
        A.Store.markPlayed(P);
      }
      return { pl: pl, runs: runs, stars: st, newBest: newBest };
    });
    var winner = null;
    if (TWO) { winner = res[0].runs > res[1].runs ? 0 : res[1].runs > res[0].runs ? 1 : null; if (winner != null && !PL[winner].P.guest) bb(PL[winner].P).twoWins++; }
    var rewards = res.map(function (r) { return r.pl.P.guest ? [] : A.Rewards.check(r.pl.P); });
    A.Store.save(); $('#starCount').textContent = P1.stars;
    M.jingle(); crowd(true, true); fireworks(5);
    var title, voice, sub;
    if (!TWO) {
      var r0 = res[0]; title = r0.runs + (r0.runs === 1 ? ' run!' : ' runs!');
      voice = ['bb_you_scored', r0.runs, r0.runs === 1 ? 'bb_run' : 'bb_runs'].concat(r0.newBest ? ['bb_new_high'] : ['bb_good_game']);
      sub = r0.newBest ? 'A new high score!' : 'Good game, ' + P1.name + '!';
    } else if (winner != null) { title = PL[winner].name + ' wins!'; voice = [nameParts(PL[winner].P), 'bb_wins_game', 'bb_good_game']; sub = 'Great batting, both of you!'; }
    else { title = 'Tie game!'; voice = ['bb_tie_game']; sub = 'You both did great!'; }
    var html = '<div class="final">' + $('#sboard').innerHTML + '</div><div class="fcols">' + res.map(function (r, k) {
      return '<div class="fcol' + (winner === k ? ' win' : '') + '" style="--pc:' + r.pl.col.c + '"><div class="fa dance">' + blobOf(r.pl) + '</div>' + (winner === k ? '<span class="crownb">🏆</span>' : '') +
        '<div class="fi"><b>' + A.esc(r.pl.name) + '</b><span>' + r.runs + ' runs · ' + r.pl.hits + ' hits' + (r.pl.homers ? ' · ' + r.pl.homers + ' HR' : '') + '</span>' +
        '<span class="stars">' + [0, 1, 2].map(function (i) { return '<svg viewBox="0 0 24 24" class="' + (i < r.stars ? 'got' : '') + '" style="animation-delay:' + (.3 + i * .35 + k * .9) + 's"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>'; }).join('') + '</span>' + (r.newBest ? '<span class="nb">New best!</span>' : '') + '</div></div>';
    }).join('') + '</div><h4>🏆 Family high scores</h4>' + boardHTML(PL.map(function (p) { return p.P.id; }));
    for (var s1 = 0; s1 < res[0].stars + (res[1] ? res[1].stars : 0); s1++) setTimeout(SFX.star, 400 + s1 * 300);
    G.result = { res: res.map(function (r) { return { name: r.pl.name, runs: r.runs, stars: r.stars, newBest: r.newBest }; }), winner: winner };
    return wait(1200).then(function () {
      return UI.card({ tag: 'Final score', title: title, html: html, sub: sub, btn: 'Play again ▶', voice: voice, cls: 'celebrate bbend', confetti: true, minMs: 900 });
    }).then(function () {
      var chain = Promise.resolve();
      res.forEach(function (r, k) { chain = chain.then(function () { return A.Rewards.celebrate(r.pl.P, rewards[k], TWO ? r.pl.name : null); }); });
      return chain;
    }).then(function () { location.reload(); });
  }

  /* ---------- input ---------- */
  document.addEventListener('keydown', function (e) {
    if (UI.cardOpen || A.Parent.isOpen() || A.$('#gate') || A.$('.overlay.on')) return;
    var k = e.key;
    if (k === 'm' || k === 'M') { M.toggle(); musicBtn(); return; }
    if (k === 'r' || k === 'R') { if (G.phase === 'swing') V.say(['bb_pick_swing']); else if (G.q) V.say(G.q.say); return; }
    if (k === 'Escape') { e.preventDefault(); UI.confirm({ title: 'Stop this game?', sub: 'You can play again any time.', yes: 'Stop', no: 'Keep playing' }).then(function (y) { if (y) { V.stop(); M.stop(); location.href = 'index.html'; } }); return; }
    if (G.phase === 'swing' && !G.busy) {
      if (/^[1-4]$/.test(k)) { e.preventDefault(); G.swSel = +k - 1; markSwing(false); chooseSwing(G.swSel, 'key'); return; }
      if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'a' || k === 'A' || k === 'w' || k === 'W') { e.preventDefault(); G.swSel = (G.swSel + 3) % 4; markSwing(true); SFX.step(); return; }
      if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'd' || k === 'D' || k === 's' || k === 'S') { e.preventDefault(); G.swSel = (G.swSel + 1) % 4; markSwing(true); SFX.step(); return; }
      if (k === ' ' || k === 'Enter' || k === 'f' || k === 'F') { e.preventDefault(); if (!e.repeat) chooseSwing(G.swSel, 'key'); }
      return;
    }
    if (!G.q || !G.accept) { if (k === ' ' || k === 'Enter') e.preventDefault(); return; }
    var n = G.q.choices.length;
    if (/^[1-4]$/.test(k) && +k <= n) { e.preventDefault(); G.sel = +k - 1; markSel(); answer(G.sel, 'key'); return; }
    if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'a' || k === 'A' || k === 'w' || k === 'W') { e.preventDefault(); G.sel = (G.sel + n - 1) % n; markSel(true); SFX.step(); return; }
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'd' || k === 'D' || k === 's' || k === 'S') { e.preventDefault(); G.sel = (G.sel + 1) % n; markSel(true); SFX.step(); return; }
    if (k === ' ' || k === 'Enter' || k === 'f' || k === 'F') { e.preventDefault(); if (!e.repeat) answer(G.sel, 'key'); }
  });
  function musicBtn() { var b = $('#musicBtn'); b.classList.toggle('off', S.music === false); b.setAttribute('aria-label', S.music === false ? 'Music is off (M)' : 'Music is on (M)'); }
  $('#musicBtn').addEventListener('click', function () { M.toggle(); musicBtn(); });
  $('#speakBtn').addEventListener('click', function () { if (G.q) V.say(G.q.say); });
  $('#homeBtn').addEventListener('click', function () { V.stop(); M.stop(); SFX.tap(); A.Store.save(); location.href = A.ROOT + 'index.html#games'; });
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
    G: G, PL: PL, two: TWO, SWINGS: SWINGS, chooseSwing: function (i) { G.swSel = i; markSwing(false); return chooseSwing(i, 'test'); },
    swingReady: function () { return G.phase === 'swing' && !G.busy && !G.over && !UI.cardOpen; },
    answer: answer, right: function () { return G.q ? G.q.answer : -1; }, wrongIdx: function () { return G.q ? (G.q.answer + 1) % G.q.choices.length : -1; },
    setElapsed: function (sec) { G.voiceDone = true; G.qT0 = Date.now() - sec * 1000; },
    ready: function () { return !!(G.phase === 'pitch' && G.q && G.accept && !G.busy); },
    set speed(v) { SPEED = v; }, get speed() { return SPEED; },
    total: totalRuns, endGame: endGame, bases: function () { return G.bases.map(Boolean); }
  };
  wait(400).then(function () { return UI.card({ tag: TWO ? PL[0].name + ' vs ' + PL[1].name : 'Batter up!', title: 'Blob Baseball', art: '<div class="dance">' + blobOf(PL[0]) + '</div>',
    html: '<p class="howto">Pick your swing, then answer the pitch!<br><span class="zchip sg">⚾ single · easy</span> <span class="zchip db">⚾⚾ double</span> <span class="zchip tr">🔥 triple · tricky</span> <span class="zchip hr">💥 home run · challenge</span><br>Get it right and you hit it!</p>' + (TWO && (A.Pad.seats()[0] || A.Pad.seats()[1]) ? '<p class="small">' + A.esc(PL[0].name) + ': ' + A.Pad.label(0, '⌨ keyboard') + ' · ' + A.esc(PL[1].name) + ': ' + A.Pad.label(1, '⌨ keyboard') + '</p>' : ''),
    sub: INNINGS + ' innings · 3 outs or ' + PL[0].cap + ' batters each inning', btn: 'Play ball! ▶', voice: ['bb_title'], cls: 'bbintro', minMs: 500 }); }).then(startHalf);
})(window.Arcade);
