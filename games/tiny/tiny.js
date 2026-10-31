/* Picnic Pals — Tiny Picnic: the no-fail toddler game (about age 2).
   A few BIG picture tiles and one spoken prompt ("Find the strawberry!", "Which one is red?", "Find two!").
   Every tap is happy: the right one cheers; any other one giggles and says its name, then the prompt comes again.
   No timer, no hearts, nothing lost, no reading needed. A round is 6 prompts, then a calm celebration and back to the friend. */
(function (A) {
  'use strict';
  var $ = A.$, UI = A.UI, V = A.Voice, T = A.Tiny;
  UI.boot();
  var P = A.Store.active();
  if (!P) { location.replace(A.ROOT + 'index.html#players'); return; }
  var g = P.games.tiny || (P.games.tiny = { rounds: 0, taps: 0 });
  var st = { i: 0, q: null, busy: false, kinds: [], t0: Date.now() };
  function img(id, pose) { return A.ROOT + 'assets/picnic/friends/' + id + '/' + (pose || 'front') + '_256.webp'; }
  function foodArt(id) { return '<img src="' + img(id) + '" alt="" draggable="false">'; }
  function shapeArt(s, hex) { return '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="' + hex + '" stroke="#ffffff" stroke-width="5">' + s.d + '</g></svg>'; }
  function pick(arr, n, not) { return A.shuffle(arr.filter(function (x) { return !not || not.indexOf(x) < 0; })).slice(0, n); }
  var byColor = {}; T.COLORS.forEach(function (c) { byColor[c.id] = c; });

  /* ---------- prompts ---------- */
  function make(kind, n) {
    var tiles = [], ans = 0, say, cue = '';
    if (kind === 'food' || kind === 'match') {
      var fs = pick(T.FOODS, n); ans = A.rnd(0, n - 1);
      tiles = fs.map(function (f) { return { art: foodArt(f.id), name: 'tp_is_' + f.id, label: f.w }; });
      if (kind === 'food') say = ['tp_find_' + fs[ans].id];
      else { say = ['tp_match']; cue = '<span class="cuepic">' + foodArt(fs[ans].id) + '</span>'; }
    } else if (kind === 'shape') {
      var ss = pick(T.SHAPES, n), cs = pick(T.COLORS, n); ans = A.rnd(0, n - 1);
      tiles = ss.map(function (s, k) { return { art: shapeArt(s, cs[k].hex), name: 'tp_is_' + s.id, label: s.id }; });
      say = ['tp_find_' + ss[ans].id];
    } else if (kind === 'color') {
      var cols = pick(T.COLORS, n); ans = A.rnd(0, n - 1);
      tiles = cols.map(function (c) {
        var f = A.shuffle(T.FOODS.filter(function (x) { return x.c === c.id; }))[0];
        if (f && Math.random() < .7) return { art: foodArt(f.id), name: 'tp_is_' + f.id, label: f.w };
        var s = A.pick(T.SHAPES); return { art: shapeArt(s, c.hex), name: 'tp_c_' + c.id, label: c.id + ' ' + s.id };
      });
      say = ['tp_color_' + cols[ans].id]; cue = '<span class="cueswatch" style="background:' + cols[ans].hex + '"></span>';
    } else { // count 1-3
      var f2 = A.pick(T.FOODS), nums = A.shuffle([1, 2, 3]); ans = A.rnd(0, 2);
      tiles = nums.map(function (k) { var h = ''; for (var j = 0; j < k; j++) h += foodArt(f2.id); return { art: '<span class="grp g' + k + '">' + h + '</span>', name: 'tp_n_' + k, label: T.NUM[k] }; });
      say = ['tp_count_' + nums[ans]];
    }
    return { kind: kind, tiles: tiles, ans: ans, say: say, cue: cue };
  }
  function kindsFor() { // a gentle mix: easy food finds first, one of each other kind
    var rest = A.shuffle(['color', 'shape', 'match', 'count']);
    return ['food'].concat(rest.slice(0, 2), ['food'], rest.slice(2));
  }
  function pal(pose) { $('#pal').innerHTML = '<img src="' + img(P.blob, pose) + '" alt="" draggable="false">'; }
  function dots() { var h = ''; for (var k = 0; k < T.ROUND; k++) h += '<i class="' + (k < st.i ? 'on' : '') + '"></i>'; $('#dots').innerHTML = h; }
  function ask() {
    var kind = st.kinds[st.i], n = kind === 'count' ? 3 : st.i >= 3 && (kind === 'food' || kind === 'shape') ? 4 : 3;
    var q = st.q = make(kind, n); st.busy = false;
    $('#cue').innerHTML = q.cue; $('#askTxt').textContent = V.text(q.say); pal('front'); dots();
    var grid = $('#grid'); grid.innerHTML = ''; grid.className = 'tgrid n' + q.tiles.length;
    q.tiles.forEach(function (t, k) {
      var b = A.el('<button class="ttile" data-k="' + k + '" aria-label="' + A.esc(t.label) + '"><span class="tart">' + t.art + '</span></button>');
      b.addEventListener('click', function () { tap(k, b); });
      grid.appendChild(b);
    });
    V.say(q.say, { kind: 'prompt', bubble: false });
  }
  function tap(k, b) {
    if (st.busy) return; var q = st.q; g.taps = (g.taps || 0) + 1;
    if (k === q.ans) {
      st.busy = true; b.classList.add('yay'); A.Audio.sfx('pop'); pal('cheering'); st.i++; dots();
      A.$$('.ttile').forEach(function (x) { if (x !== b) x.classList.add('rest'); });
      // 2026-10-22 voice: no spoken praise; a happy sound + the friend's text bubble
      A.Audio.sfx('yay'); if (A.UI.friendBubble) A.UI.friendBubble(V.text(['tp_yay_1']), 1700);
      setTimeout(function () { if (st.i >= T.ROUND) finish(); else ask(); }, 1900);
    } else {
      // a giggle and its name, then the same prompt again; nothing is lost
      st.busy = true; b.classList.remove('giggle'); void b.offsetWidth; b.classList.add('giggle'); A.Audio.sfx('boing'); pal('happy');
      V.say([q.tiles[k].name], { kind: 'name' }).then(function () { if (st.q === q && A.Talk.allows('name')) V.say(q.say, { kind: 'prompt', bubble: false }); });
      setTimeout(function () { if (st.q === q) st.busy = false; }, 700);
    }
  }
  function finish() {
    g.rounds = (g.rounds || 0) + 1; P.stars += 1;   // modest: one star a round; a sticker every few rounds (rewards.js tiny_*)
    var ms = Math.min(Date.now() - st.t0, 15 * 60000); try { A.Store.addTime(P, 'tiny', ms); } catch (e) {}
    A.Store.markPlayed(P); A.Rewards.check(P); A.Store.save();
    $('#grid').innerHTML = ''; $('#cue').innerHTML = ''; $('#askTxt').textContent = '';
    UI.card({ title: 'Hooray!', cls: 'celebrate tinydone', art: '<div class="tinyhero"><img src="' + img(P.blob, 'cheering') + '" alt="" draggable="false"></div>',
      sub: 'What a great picnic!', btn: '🏠 Back home', voice: ['tp_done'], sfx: 'win', minMs: 1200 })
      .then(function () { return A.PlayTime ? A.PlayTime.checkpoint().then(function (ok) { if (!ok) return new Promise(function () {}); }) : null; })
      .then(goHome);
  }
  function goHome() { V.stop(); A.Store.save(); location.href = A.ROOT + 'index.html?from=game#games'; }
  // design2: the Home button is small, in the top-left corner, and needs a press-and-hold (HOLD_MS) so a toddler's stray tap
  // doesn't end the game; a quick tap just shows "Hold to go home". Grown-ups: hold it, press Escape, or use the keyboard (Enter).
  var HOLD_MS = 800, hb = $('#homeBtn'), holdT = null, hintT = null;
  function holdStart(e) { if (e.button > 0) return; e.preventDefault(); clearTimeout(holdT); hb.classList.remove('hint'); hb.classList.add('holding'); holdT = setTimeout(function () { holdT = null; hb.classList.remove('holding'); A.Audio.sfx('tap'); goHome(); }, HOLD_MS); }
  function holdEnd() { if (!holdT) return; clearTimeout(holdT); holdT = null; hb.classList.remove('holding'); hb.classList.add('hint'); clearTimeout(hintT); hintT = setTimeout(function () { hb.classList.remove('hint'); }, 1800); }
  hb.addEventListener('pointerdown', holdStart); hb.addEventListener('pointerup', holdEnd); hb.addEventListener('pointerleave', holdEnd); hb.addEventListener('pointercancel', holdEnd);
  hb.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  hb.addEventListener('click', function (e) { if (e.detail === 0) { A.Audio.sfx('tap'); goHome(); } });   // keyboard Enter / Space only (a tap is handled by the hold)
  $('#sayBtn').addEventListener('click', function () { if (st.q) V.say(st.q.say, { kind: 'tap' }); });
  var askEl = $('#askTxt'); if (askEl) { askEl.style.cursor = 'pointer'; askEl.addEventListener('click', function () { if (st.q) V.say(st.q.say, { kind: 'tap' }); }); }
  document.addEventListener('keydown', function (e) {
    if (UI.cardOpen || A.Parent.isOpen()) return;
    var n = +e.key; if (n >= 1 && n <= 4) { var b = A.$('.ttile[data-k="' + (n - 1) + '"]'); if (b) b.click(); }
    if (e.key === 'r' || e.key === 'R') $('#sayBtn').click();
    if (e.key === 'Escape') goHome();
  });
  UI.arrowNav && UI.arrowNav(function () { return A.$$('#tiny button'); });
  UI.gear({ onClose: function () { if (A.Music) A.Music.apply(); } });
  if (A.Music) A.Music.play('hub');
  function start() { st.kinds = kindsFor(); st.i = 0; st.t0 = Date.now(); ask(); }
  A.HowTo.button('tiny', '#sayBtn');   // quality1 (C3)
  // play-time limit: check before the first prompt (never mid-round)
  (A.PlayTime ? A.PlayTime.checkpoint() : Promise.resolve(true)).then(function (ok) { if (ok) { A.HowTo.first('tiny').then(function () { return V.say(['tp_hello']); }).then(function () { start(); }); } });
  window.__tiny = { HOLD_MS: HOLD_MS, st: st, P: function () { return P; }, ask: ask, start: start, finish: finish };
})(window.Arcade);
