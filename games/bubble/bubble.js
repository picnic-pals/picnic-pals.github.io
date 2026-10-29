/* Picnic Pals — Bubble Pop (bubble1). A met food friend blows bubbles that float up slowly; a spoken target ("Pop the 7!")
   says which ones to pop. Big bubbles (100px+), pointer events (touch and mouse), keyboard 1-9 pops the n-th bubble.
   A wrong pop bounces away with a giggle (no penalty); the shiny hint only shows after a miss. Ages 2-3: every bubble pops.
   A round is about 10 right pops (8 at a story stop) → 1-3 stars. A rare golden bubble is a surprise. Bubble storm: an
   optional speed bonus for ages 6+ only (no timers under 6). Rules: js/core/bubble-core.js (A.Bubble). */
(function (A) {
  'use strict';
  var $ = A.$, UI = A.UI, V = A.Voice, B = A.Bubble;
  UI.boot();
  var P = A.Store.active();
  if (!P) { location.replace(A.ROOT + 'index.html#players'); return; }
  var qs = {}; location.search.replace(/^\?/, '').split('&').forEach(function (kv) { var q = kv.split('='); if (q[0]) qs[decodeURIComponent(q[0])] = decodeURIComponent(q[1] || ''); });
  var ST = A.Story, STORY = qs.mode === 'story' && ST && ST.STOPS[+qs.stop] && ST.gameOf(P, +qs.stop) === 'bubble' && ST.playable(P, +qs.stop), SI = STORY ? +qs.stop : -1;
  var MAPURL = '../munch/index.html?mode=story';
  var TOD = B.toddler(P), FRIENDS = B.friends(P), HOST = FRIENDS[Math.floor(Math.random() * FRIENDS.length)];
  var G = { R: null, t: null, bubbles: [], uid: 0, res: { pops: 0, first: 0, golden: false, stormTried: false, stormWon: false }, busy: false, over: false, phase: '', t0: 0, last: 0,
    goldenAt: -1, goldenShown: false, storm: { on: false, n: 0, left: 0 }, tst: Date.now(), raf: 0, spawnT: 0 };
  function img(id, pose) { return A.ROOT + 'assets/picnic/friends/' + id + '/' + (pose || 'front') + '_256.webp'; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function say(parts, kind) { return V.say(parts, { kind: kind || 'prompt', bubble: false }); }
  /* ---------- art ---------- */
  function shapeSvg(s, c) { var f = B.COLORS[c] || c || '#ff8ab3', d = { circle: '<circle cx="50" cy="50" r="34"/>', square: '<rect x="18" y="18" width="64" height="64" rx="8"/>', triangle: '<path d="M50 14 L86 82 H14 Z" stroke-linejoin="round"/>',
      star: '<path d="M50 10 L61 38 L91 39 L67 57 L76 87 L50 70 L24 87 L33 57 L9 39 L39 38 Z" stroke-linejoin="round"/>', heart: '<path d="M50 84 C20 62 10 46 18 30 C26 16 44 18 50 32 C56 18 74 16 82 30 C90 46 80 62 50 84 Z"/>' }[s];
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="' + f + '" stroke="#ffffff" stroke-width="5">' + d + '</g></svg>'; }
  function inner(c) {
    if (c.cls === 'shape') return shapeSvg(c.shape, c.col);
    if (c.cls === 'animal') return '<span class="emo">' + c.e + '</span>';
    if (c.cls === 'peek') return '<span class="emo q">🫧</span>';
    if (c.cls === 'sound') return '<span class="snd">' + A.esc(c.t) + '</span>';
    if (c.cls === 'color') return '';
    return '<span class="tx' + (String(c.t).length > 3 ? ' long' : '') + '">' + A.esc(c.t) + '</span>';
  }
  function tint(c) { return c.col ? B.COLORS[c.col] : null; }
  /* ---------- the target card ---------- */
  function showTarget() {
    var t = G.t, s = t.show || {}, h = '';
    if (s.col && !s.e) h += '<span class="sw" style="background:' + B.COLORS[s.col] + '"></span>';
    if (s.shape) h += '<span class="shp">' + shapeSvg(s.shape, '#ff8ab3') + '</span>';
    if (s.size) h += '<span class="sz ' + s.size + '"></span>';
    if (s.e) h += '<span class="emo' + (s.col ? ' tinted' : '') + '"' + (s.col ? ' style="background:' + B.COLORS[s.col] + '55"' : '') + '>' + s.e + '</span>';
    if (s.text) h += '<b class="' + (s.text.length > 6 ? 'long' : '') + '">' + A.esc(s.text) + '</b>';
    if (t.seq) h += '<span class="seq">' + t.seq.map(function (c, k) { return '<i class="' + (k < t.got ? 'on' : k === t.got ? 'now' : '') + '">' + (k < t.got || !t.word ? A.esc(c.t) : '_') + '</i>'; }).join('') + '</span>';
    else if (t.need > 1) h += '<span class="need">' + Array.from({ length: t.need }, function (_, k) { return '<i class="' + (k < t.got ? 'on' : '') + '"></i>'; }).join('') + '</span>';
    $('#target').innerHTML = h + '<span class="spk">🔊</span>';
  }
  function dots() { var n = G.R.goal, h = ''; for (var k = 0; k < n; k++) h += '<i class="' + (k < G.res.pops ? 'on' : '') + '"></i>'; $('#dots').innerHTML = h; }
  /* ---------- bubbles ---------- */
  var field = $('#field');
  function fw() { return field.clientWidth || 1000; } function fh() { return field.clientHeight || 600; }
  function size(c) { var base = TOD ? 150 : 124; if (c.sz === 'big') return 184; if (c.sz === 'little') return 100; return base; }
  function spawn(c, o) {
    o = o || {}; var d = size(c), lo = 150, hi = Math.max(lo + 1, fw() - d - 20), x0 = lo, best = -1;
    for (var k = 0; k < 10; k++) {   // spread out: pick the spot farthest from bubbles still near the bottom (no stacked bubbles)
      var cx = lo + Math.random() * (hi - lo), near = G.bubbles.filter(function (q) { return !q.gone && q.y > fh() - 2.2 * Math.max(d, q.d); }), m = 1e9;
      near.forEach(function (q) { m = Math.min(m, Math.abs(q.x - cx)); }); if (m > best) { best = m; x0 = cx; } }
    var el = A.el('<button class="bub' + (c.cls ? ' ' + c.cls.split(' ').map(function (x) { return 'k-' + x; }).join(' ') : '') + (o.golden ? ' golden' : '') + '" style="width:' + d + 'px;height:' + d + 'px" aria-label="' + A.esc(o.golden ? 'golden bubble' : V.text(c.say || [])) + '">' + (o.golden ? '<span class="emo">✨</span>' : inner(c)) + '<i class="shine"></i></button>');
    var tc = tint(c); if (tc && !o.golden) el.style.setProperty('--tint', tc);
    var b = { id: ++G.uid, c: c, el: el, d: d, x: x0, y: fh() + 10, vy: (TOD ? 40 : 50) * (G.storm.on ? 1.7 : 1) * (.85 + Math.random() * .3), ph: Math.random() * 6, amp: 6 + Math.random() * 18, fr: .7 + Math.random() * 1.1, ph2: Math.random() * 6, fr2: .25 + Math.random() * .5, vx: (Math.random() - .5) * 16, golden: !!o.golden, gone: false };
    el.addEventListener('pointerdown', function (e) { e.preventDefault(); pop(b); });
    if (G.t && B.matches(G.t, c)) el.classList.add('match');
    field.appendChild(el); G.bubbles.push(b); place(b); return b;
  }
  function place(b) { b.el.style.transform = 'translate(' + Math.round(b.x + Math.sin(b.ph) * (b.amp || 14) + Math.sin(b.ph2 || 0) * 8) + 'px,' + Math.round(b.y) + 'px)'; }
  function remove(b) { b.gone = true; G.bubbles = G.bubbles.filter(function (x) { return x !== b; }); setTimeout(function () { b.el.remove(); }, 450); }
  function refreshMatch() { G.bubbles.forEach(function (b) { b.el.classList.toggle('match', !b.golden && !!G.t && B.matches(G.t, b.c)); }); }
  function goods() { return G.bubbles.filter(function (b) { return !b.golden && !b.gone && B.matches(G.t, b.c); }).length; }
  function nextContent() {
    var t = G.t; if (!t) return null;
    if (t.seq) { var left = t.seq.slice(t.got), onScreen = G.bubbles.map(function (b) { return b.c.key; }); var miss = left.filter(function (c) { return onScreen.indexOf(c.key) < 0; }); if (miss.length && Math.random() < .75) return miss[0]; var pool = t.seq.concat(t.bad); return pool[Math.floor(Math.random() * pool.length)]; }
    var gn = goods(), wantGood = gn < 2 || !t.bad.length || (gn < 3 && Math.random() < .35);
    var pool = wantGood ? t.good : t.bad; return pool[Math.floor(Math.random() * pool.length)];
  }
  function TOPY() { var r = $('#target').getBoundingClientRect(), f = field.getBoundingClientRect(); return Math.max(0, r.bottom - f.top - 10); }
  function tick(ts) {
    var dt = Math.min(.05, ((ts - (G.last || ts)) / 1000)); G.last = ts; var top = TOPY();
    G.bubbles.forEach(function (b) { if (b.gone) return; if (b.bounce) { b.x += b.bounce * dt * 240; b.bounce *= .96; } b.y -= b.vy * dt; b.ph += dt * (b.fr || 1.2); b.ph2 = (b.ph2 || 0) + dt * (b.fr2 || 0); if (b.vx) { b.x += b.vx * dt; var mx = fw() - b.d - 20; if (b.x < 150 || b.x > mx) { b.vx = -b.vx; b.x = Math.max(150, Math.min(mx, b.x)); } } place(b); if (b.y < top + 40) b.el.style.opacity = Math.max(0, (b.y - top + 20) / 60); if (b.y < top - 20) remove(b); });   // drift away before the target card (nothing hides behind it)
    G.spawnT -= dt;
    var max = G.storm.on ? 10 : TOD ? 5 : 7;
    if (G.phase === 'play' && G.spawnT <= 0 && G.bubbles.length < max) { var c = nextContent(); if (c) spawn(c); G.spawnT = G.storm.on ? .45 : TOD ? 1.6 : 1.25; $('#blower').classList.remove('blow'); void $('#blower').offsetWidth; $('#blower').classList.add('blow'); }
    if (G.phase === 'play' && !G.goldenShown && G.goldenAt >= 0 && G.res.pops >= G.goldenAt) { G.goldenShown = true; spawn({ key: 'gold', cls: 'gold', say: ['bp_golden'] }, { golden: true }); }
    G.raf = requestAnimationFrame(tick);
  }
  /* ---------- popping ---------- */
  function burst(b, cls) { b.el.classList.add(cls || 'popped'); remove(b); }
  function pop(b) {
    if (b.gone || G.phase !== 'play' || G.busy && !G.storm.on) return;
    if (b.golden) { burst(b); A.Audio.sfx('star'); G.res.golden = true; say(['bp_golden'], 'chatter'); friendPose('cheering', 'hop'); return; }
    var t = G.t, ok = B.matches(t, b.c), ms = Date.now() - G.t0;
    if (G.storm.on) { if (ok) { burst(b); A.Audio.sfx('pop'); G.storm.n++; $('#stormBar b').textContent = '🌪️ ' + G.storm.n; } else { b.bounce = (b.x > fw() / 2 ? 1 : -1); b.el.classList.add('boing'); } return; }
    if (TOD && !ok) {   // ages 2-3: every bubble pops; it just says what it was
      burst(b); A.Audio.sfx('pop'); B.record(P, t, { ok: false, ms: ms }, G.R); say(b.c.say || ['bp_yay'], 'name').then(function () { if (G.t === t && A.Talk.allows('name')) say(t.say); }); return;
    }
    if (!ok) {
      b.bounce = (b.x > fw() / 2 ? 1 : -1) * 1.2; b.vy *= .6; b.el.classList.remove('boing'); void b.el.offsetWidth; b.el.classList.add('boing');
      A.Audio.sfx('boing'); friendPose('happy', 'giggle'); var ev = B.record(P, t, { ok: false, ms: ms }, G.R); field.classList.add('hint');
      say(['bp_giggle'], 'chatter').then(function () { if (G.t === t) say(t.say); });
      if (ev.warmupDone) {} return;
    }
    burst(b, b.c.cls === 'peek' ? 'peekpop' : 'popped'); A.Audio.sfx('pop');
    var ev2 = B.record(P, t, { ok: true, ms: ms }, G.R); G.t0 = Date.now();
    G.res.pops++; if (!t.miss) G.res.first++; dots(); showTarget(); refreshMatch();
    if (b.c.cls === 'peek') peekaboo(b); else if (b.c.cls === 'sound') popOut(b, b.c.e);
    if (t.countAloud || (TOD && t.any)) V.say([t.got], { kind: 'tap' }); else if (t.seq) V.say(b.c.say, { kind: 'tap' });
    if (ev2.speedy) { UI.toast && UI.toast('⚡ Speedy!'); }
    if (G.res.pops >= G.R.goal) return roundDone();
    if (t.got >= t.need) { G.busy = true; field.classList.remove('hint'); friendPose('cheering', 'hop'); wait(500).then(nextTarget); }
  }
  function popOut(b, e) { var o = A.el('<span class="popout" style="left:' + (b.x + b.d / 2) + 'px;top:' + (b.y + b.d / 2) + 'px">' + e + '</span>'); field.appendChild(o); setTimeout(function () { o.remove(); }, 1400); }
  function peekaboo(b) { var o = A.el('<span class="popout peekf" style="left:' + (b.x + b.d / 2) + 'px;top:' + (b.y + b.d / 2) + 'px"><img src="' + img(b.c.friend, 'happy') + '" alt=""><b>Boo!</b></span>'); field.appendChild(o); setTimeout(function () { o.remove(); }, 1500); }
  function friendPose(pose, cls) { var f = $('#friend'); f.innerHTML = '<img src="' + img(HOST, pose) + '" alt="" draggable="false">'; if (cls) { f.classList.remove(cls); void f.offsetWidth; f.classList.add(cls); } }
  /* ---------- the round ---------- */
  function nextTarget() {
    G.t = B.makeTarget(P, G.R); G.busy = false; G.t0 = Date.now(); field.classList.remove('hint');
    // bubbles that no longer match drift on; clear the screen a little for the new target
    G.bubbles.slice(0, Math.max(0, G.bubbles.length - 3)).forEach(function (b) { if (!b.golden) burst(b, 'fade'); });
    showTarget(); refreshMatch(); var pre = G.t.why === 'easy' ? ['bp_easy'] : []; say(pre.concat(G.t.say));
  }
  function start() {
    G.R = B.makeRound(P, { goal: STORY ? 8 : 10, story: STORY, friends: FRIENDS }); if (G.R.golden) G.goldenAt = 2 + Math.floor(Math.random() * (G.R.goal - 4));
    friendPose('front', 'arrive'); dots(); G.phase = 'play';
    G.t = B.makeTarget(P, G.R); showTarget(); G.t0 = Date.now();
    var pre = G.R.why === 'warmup' ? ['bp_warmup'] : B.data(P).rounds === 0 ? ['bp_hello'] : [];
    // a few bubbles are already floating when the round starts (so the sky is never empty)
    for (var k = 0; k < (TOD ? 3 : 4); k++) { var c0 = nextContent(), b0 = c0 && spawn(c0); if (b0) { b0.y = fh() * (.36 + .13 * k); b0.x = 160 + (fw() - 320) * (k / 3); place(b0); } }
    say(pre.concat(G.t.say)); G.raf = requestAnimationFrame(tick);
  }
  function roundDone() {
    G.phase = 'done'; G.busy = true; A.Audio.sfx('yay'); friendPose('cheering', 'hop');
    G.bubbles.forEach(function (b) { burst(b, 'fade'); });
    if (G.R.storm && B.stormOk(P) && !STORY) return wait(700).then(offerStorm);
    return wait(800).then(endRound);
  }
  function offerStorm() {
    say(['bp_storm_ask']);
    return UI.confirm({ title: 'Bubble storm!', sub: 'Want to pop as many as you can, super fast? No stress: it is just a bonus.', yes: "Let's pop! 🌪️", no: 'No thanks', cls: 'rushask', art: '<div class="rushart">🌪️🫧</div>' }).then(function (yes) {
      if (!yes) return endRound();
      G.res.stormTried = true; G.storm = { on: true, n: 0, left: 15000 }; G.t = B.makeTarget(P, G.R); G.t.need = 99; showTarget(); say(['bp_storm_go'].concat(G.t.say));
      var bar = $('#stormBar'); bar.classList.add('on'); var i = bar.querySelector('i'); i.style.transition = 'none'; i.style.width = '100%'; void i.offsetWidth; i.style.transition = 'width 15s linear'; i.style.width = '0%';
      G.phase = 'play'; G.busy = false;
      return wait(15000).then(function () { G.storm.on = false; G.phase = 'done'; bar.classList.remove('on'); G.bubbles.forEach(function (b) { burst(b, 'fade'); }); G.res.stormWon = G.storm.n >= 8; return say([G.res.stormWon ? 'bp_storm_win' : 'bp_storm_done']); }).then(endRound);
    });
  }
  function endRound() {
    if (G.over) return; G.over = true; cancelAnimationFrame(G.raf);
    var stars = B.finishRound(P, G.res), ms = Math.min(Date.now() - G.tst, 15 * 60000);
    try { A.Store.addTime(P, 'bubble', ms); } catch (e) {}
    A.Store.markPlayed(P); A.Store.earnStars(P, stars, STORY ? 'story' : 'bubble');
    var out = null;
    if (STORY) out = ST.record(P, SI, { correct: G.res.first, wrong: G.res.pops - G.res.first, finished: true, frac: 1, gaveUp: false, secsLeft: 0, timerOn: false, stars: stars });
    var rewards = A.Rewards.check(P); A.Store.save();
    var html = '<div class="stars">' + [0, 1, 2].map(function (i) { return '<span>' + UI.STAR.replace('<svg', '<svg class="' + (i < stars ? 'got' : '') + '" style="animation-delay:' + (.3 + i * .3).toFixed(2) + 's"') + '</span>'; }).join('') + '</div>' +
      '<p class="daysum">🫧 ' + G.res.pops + ' bubbles popped' + (G.res.golden ? ' · ✨ golden bubble' : '') + (G.res.stormWon ? ' · 🌪️ storm bonus' : '') + '</p>';
    for (var s1 = 0; s1 < stars; s1++) setTimeout(function () { A.Audio.sfx('star'); }, 400 + s1 * 300);
    G.result = { stars: stars, res: G.res, out: out };
    return wait(400).then(function () {
      return UI.card({ tag: STORY ? (ST.STOPS[SI].area.emoji + ' Stop ' + ST.STOPS[SI].n + ' · ' + ST.STOPS[SI].area.name) : '🫧 Bubble Pop', title: 'Pop-tastic!', cls: 'celebrate bubbledone', html: html,
        art: '<div class="dance"><img class="hero" src="' + img(P.blob, 'cheering') + '" alt="" draggable="false"></div>', btn: STORY ? 'Map ▶' : '🏠 Back home', voice: ['bp_round_done', 'fb_you_got', stars, stars === 1 ? 'fb_star' : 'fb_stars'], sfx: 'win', confetti: true, minMs: 1000 });
    }).then(function () { return A.Rewards.celebrate(P, rewards); })
      .then(function () { return A.PlayTime ? A.PlayTime.checkpoint().then(function (ok) { if (!ok) return new Promise(function () {}); }) : null; })
      .then(function () { if (window.__noNav) return; if (STORY) { var next = out && out.runAdded ? Math.min(SI + 1, ST.mainCount() - 1) : SI; location.href = MAPURL + '&from=' + SI + '&to=' + next; } else goHome(); });
  }
  function goHome() { V.stop(); A.Store.save(); location.href = STORY ? MAPURL : A.ROOT + 'index.html?from=game#games'; }
  var HOLD_MS = 800, hb = $('#homeBtn'), holdT = null, hintT = null;
  function holdStart(e) { if (e.button > 0) return; e.preventDefault(); clearTimeout(holdT); hb.classList.remove('hint'); hb.classList.add('holding'); holdT = setTimeout(function () { holdT = null; hb.classList.remove('holding'); A.Audio.sfx('tap'); goHome(); }, HOLD_MS); }
  function holdEnd() { if (!holdT) return; clearTimeout(holdT); holdT = null; hb.classList.remove('holding'); hb.classList.add('hint'); clearTimeout(hintT); hintT = setTimeout(function () { hb.classList.remove('hint'); }, 1800); }
  hb.addEventListener('pointerdown', holdStart); hb.addEventListener('pointerup', holdEnd); hb.addEventListener('pointerleave', holdEnd); hb.addEventListener('pointercancel', holdEnd);
  hb.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  hb.addEventListener('click', function (e) { if (e.detail === 0) { A.Audio.sfx('tap'); goHome(); } });
  function sayAgain() { if (G.t && G.phase === 'play') say(G.t.say, 'tap'); }
  $('#sayBtn').addEventListener('click', sayAgain); $('#target').addEventListener('click', sayAgain);
  document.addEventListener('keydown', function (e) {
    if (UI.cardOpen || A.Parent.isOpen()) return;
    var n = +e.key; if (n >= 1 && n <= 9) { var bs = G.bubbles.filter(function (b) { return !b.gone; }).sort(function (a, b) { return a.x - b.x; }); if (bs[n - 1]) pop(bs[n - 1]); }
    if (e.key === 'r' || e.key === 'R') sayAgain();
    if (e.key === 'Escape') goHome();
  });
  UI.gear({ onClose: function () { if (A.Music) A.Music.apply(); } });
  // test / debug hooks (no UI)
  window.__bubble = { G: G, P: function () { return P; }, B: B, pop: pop,
    popGood: function () { var b = G.bubbles.find(function (x) { return !x.gone && !x.golden && B.matches(G.t, x.c); }); if (!b) { b = spawn(G.t.seq ? G.t.seq[G.t.got] : G.t.good[0]); } pop(b); return !!b; },
    popBad: function () { var b = G.bubbles.find(function (x) { return !x.gone && !x.golden && !B.matches(G.t, x.c); }); if (!b && G.t.bad && G.t.bad.length) b = spawn(G.t.bad[0]); if (b) pop(b); return !!b; },
    spawn: spawn, endRound: endRound, offerStorm: offerStorm };
  start();
})(window.Arcade);
