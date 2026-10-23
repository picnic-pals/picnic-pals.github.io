/* Mochi Munch — Picnic Island story map (story mode). A.MunchMap.open(profile, {from, to}) resolves with the chosen stop index.
   Keys: ←/→ (or ↑/↓, A/D) move between unlocked stops · Space/Enter play · H high scores · Esc back to the menu. Click/tap works too. */
(function (A) {
  'use strict';
  var $ = A.$, ST = A.Story, B = A.Blobs, V = A.Voice, SFX = A.Audio.SFX, UI = A.UI;
  var W = 160, H = 100, sec = null, P = null, sel = 0, resolveFn = null, busy = false, pre = null, firstOpen = true;

  // Picnic Island art (art/theme/map/stops.json, map_units on the same 160x100 grid). Game areas keep their order (saves are by
  // stop index) and take the art's trail markers in trail order; mu = marker, lb = label (from the stops.json label px).
  var ART = { meadow: { mu: [28.6, 80.8], lb: [2, 93.5, "start"] }, cliffs: { mu: [24.0, 56.7], lb: [2, 70.5, "start"] }, beach: { mu: [38.3, 34.2], lb: [2, 44.6, "start"] },
    woods: { mu: [60.6, 27.5], lb: [61, 38.2] }, grove: { mu: [85.9, 26.2], lb: [87.5, 42.8] }, town: { mu: [111.2, 27.9], lb: [113, 38.2] },
    caves: { mu: [134.3, 35.8], lb: [159, 47.4, "end"] }, bay: { mu: [137.7, 58.3], lb: [159, 71.5, "end"] }, volcano: { mu: [130.5, 81.7], lb: [159, 94, "end"] },
    // bottom row: Cookie Caves sits a little right so the two side trips get room; labels share one line under the stops
    lighthouse: { mu: [112, 86], lb: [113, 98.2] }, lagoon: { mu: [81.5, 85], lb: [81.5, 98.2] }, wordwoods: { mu: [50.5, 85], lb: [50.5, 98.2] } };
  function apos(a) { var m = ART[a.id]; return m ? { x: m.mu[0], y: m.mu[1] } : { x: 10 + a.x * 1.4, y: 9 + a.y * .8 }; }
  var MAINA = ST.AREAS.filter(function (a) { return !a.side; }), MAIN = ST.mainCount();
  // side trips (Letter Lagoon): hand-placed stops around a little pond, in map units (160 x 100)
  // two rows (y 80 / 90), 5 units apart side to side, so neighbours never touch (a stop is ~7 units wide)
  var SIDE_XY = (function () { function row(x0) { var o = []; for (var k = 0; k < 6; k++) o.push([x0 + k * 5, k % 2 ? 90 : 80]); return o; }
    return { wordwoods: row(38), lagoon: row(69) }; })();
  var POS = (function () {
    var out = [];
    MAINA.forEach(function (a, i) {
      var c = apos(a), pv = apos(MAINA[Math.max(0, i - 1)]), nx = apos(MAINA[Math.min(MAINA.length - 1, i + 1)]);
      var dx = nx.x - pv.x, dy = nx.y - pv.y, L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
      out.push({ x: c.x - dx * 5.2, y: c.y - dy * 5.2 }, { x: c.x + dx * 5.2, y: c.y + dy * 5.2 });
    });
    ST.STOPS.forEach(function (st) {
      if (!st.side) return; var xy = (SIDE_XY[st.area.id] || [])[st.k], c = apos(st.area);
      out.push(xy ? { x: xy[0], y: xy[1] } : { x: c.x + (st.k - 2.5) * 6.5, y: c.y + (st.k % 2 ? 3 : -3) });
    });
    return out;
  })();
  var SIDE_ICON = { colors: '🎨', shapes: '🔺', letters: '🔤', begsound: '🐝', rhymes: '🎵', sight: '👀', cvc: '🐱', digraph: '🚢', sight2: '📖', opposites: '🔥', nounverb: '🏃', longvowel: '🎂', sight3: '📚', homophones: '👂', affixes: '🧩', comprehension: '📜' };
  // which game a stop plays (story.js gameOf: seeded per player, never picked by the kid)
  function gameName(id) { return id === 'slugger' ? A.TITLES.baseball : A.TITLES.munch; }
  function stopFace(st) { return st.side ? (SIDE_ICON[st.skill] || st.n) : st.n; }
  var FEST = { x: 80.6, y: 49.2 }; // the big basket on the blanket
  // put each area's emoji + name beside the trail (the side farthest from every stop)
  // hand-placed area labels (emoji + name), beside the trail rather than on it
  var INLINE = { lagoon: true };
  var LABELS = {}; Object.keys(ART).forEach(function (k) { LABELS[k] = ART[k].lb; });
  function labelPos(i) { var l = LABELS[ST.AREAS[i].id]; return l ? { x: l[0], y: l[1] } : apos(ST.AREAS[i]); }
  function smooth(pts) { // Catmull-Rom -> cubic bezier path
    var d = 'M' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      d += ' C' + (p1.x + (p2.x - p0.x) / 6).toFixed(1) + ' ' + (p1.y + (p2.y - p0.y) / 6).toFixed(1) + ' ' + (p2.x - (p3.x - p1.x) / 6).toFixed(1) + ' ' + (p2.y - (p3.y - p1.y) / 6).toFixed(1) + ' ' + p2.x.toFixed(1) + ' ' + p2.y.toFixed(1);
    }
    return d;
  }
  function islandSVG() {
    var s = '<svg class="isle" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<defs><radialGradient id="sea" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#bfe9ff"/><stop offset="1" stop-color="#7cc8f2"/></radialGradient>' +
      '<filter id="soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation=".6"/></filter></defs>' +
      '';
    var LP = ST.AREAS.map(function (a, i) { return labelPos(i); });
    var pts = POS.slice(0, MAIN).concat([FEST]);
    // the stitched trail is in the art; only the progress (walked) part is drawn on top
    s += '<path id="trailDone" d="' + smooth(pts) + '" fill="none" stroke="#ffb84d" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="0 9999" opacity=".85"/>';
    return s + '</svg>';
  }
  // area names in their own layer ABOVE the stops and the walking friend, so the friend never hides a name
  function labelsSVG() {
    var LP = ST.AREAS.map(function (a, i) { return labelPos(i); }), s = '<svg class="mlabels" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">';
    // the landmarks are in the art, so each area only gets its name (under its landmark, from stops.json)
    ST.AREAS.forEach(function (a, i) { var c = LP[i];
      var an = (ART[a.id] && ART[a.id].lb[2]) || 'middle';
      s += '<text class="aname' + (a.side ? ' sidelbl' : '') + '" x="' + c.x.toFixed(1) + '" y="' + c.y.toFixed(1) + '" font-size="2.7" text-anchor="' + an + '">' + A.esc(a.name) + '</text>'; });
    s += '<text class="aname fest" x="' + FEST.x + '" y="' + (FEST.y + 9.5) + '" font-size="3" text-anchor="middle">' + A.esc(ST.FESTIVAL) + '</text>';
    return s + '</svg>';
  }
  // everything you can pick on the map, in trail order: the 20 stops plus a friend-challenge after its area's second stop
  var ITEMS = [];
  ST.STOPS.forEach(function (st) { ITEMS.push({ t: 's', i: st.i }); if (st.lv === 1 && !st.side) ST.CH.forEach(function (c, k) { if (c.ai === st.ai) ITEMS.push({ t: 'c', k: k }); }); });
  function sideItem(first) { // the side trip's next stop to play (or its first / last)
    var js = []; ITEMS.forEach(function (it, j) { if (it.t === 's' && ST.isSide(it.i)) js.push(j); }); if (!js.length) return -1;
    if (first) return js[0];
    for (var k = 0; k < js.length; k++) { var inf = ST.stopInfo(P, ITEMS[js[k]].i); if (playable(js[k]) && !(inf && inf.passed)) return js[k]; }
    var pl = js.filter(playable); return pl.length ? pl[pl.length - 1] : js[0];
  }
  // ↓ again while on a side trip: the next side trip (Letter Lagoon -> Word Woods -> Letter Lagoon ...)
  function nextSideItem() {
    var cur = ST.STOPS[ITEMS[sel].i].ai, ais = []; ST.STOPS.forEach(function (st) { if (st.side && ais.indexOf(st.ai) < 0) ais.push(st.ai); });
    if (ais.length < 2) return -1; var ai = ais[(ais.indexOf(cur) + 1) % ais.length], js = [];
    ITEMS.forEach(function (it, j) { if (it.t === 's' && ST.STOPS[it.i].side && ST.STOPS[it.i].ai === ai) js.push(j); });
    for (var k = 0; k < js.length; k++) { var inf = ST.stopInfo(P, ITEMS[js[k]].i); if (playable(js[k]) && !(inf && inf.passed)) return js[k]; }
    var pl = js.filter(playable); return pl.length ? pl[pl.length - 1] : js[0];
  }
  function itemOf(stop) { for (var j = 0; j < ITEMS.length; j++) if (ITEMS[j].t === 's' && ITEMS[j].i === stop) return j; return 0; }
  // hand-placed friend-challenge spots (next to the area's last stop, clear of stops and labels); other areas fall back to a nearby offset
  var CHXY = { cliffs: [38, 60], beach: [50, 50.2], woods: [66, 50.2], grove: [98, 50.2] };
  function chPos(k) { var c = ST.CH[k], id = ST.AREAS[c.ai].id; if (CHXY[id]) return { x: CHXY[id][0], y: CHXY[id][1] }; var a = POS[c.ai * 2 + 1], l = labelPos(c.ai); return { x: a.x + (l.x - a.x) * .5 + 4, y: a.y + (l.y - a.y) * .5 - 2 }; }
  function playable(j) { var it = ITEMS[j]; return it.t === 's' ? ST.playable(P, it.i) : ST.chOpen(P, it.k); }
  function pct(p) { return 'left:' + (p.x / W * 100).toFixed(2) + '%;top:' + (p.y / H * 100).toFixed(2) + '%'; }

  function build() {
    sec = A.el('<section class="screen" id="map">' +
      '<div class="mtop"><button class="iconbtn" id="mapHome" aria-label="Back to the Munch menu">◀</button>' +
      '<div class="mtitle"><b>' + A.esc(ST.WORLD) + '</b><span id="mapRun"></span></div>' +
      '<button class="chipbtn" id="mapPath" data-mnav></button><button class="chipbtn book" id="mapBook" data-mnav aria-label="Read the story again (B)">📖 Story</button>' +
      // design1: High scores + New journey live in one small ⋯ menu (a calmer top bar)
      '<span class="mmore"><button class="chipbtn more" id="mapMore" data-mnav aria-label="More: high scores, new journey" aria-expanded="false">⋯</button>' +
      '<span class="mmenu" id="mapMenu" hidden><button class="chipbtn gold" id="mapScores">🏆 High scores <kbd>H</kbd></button><button class="chipbtn" id="mapNew">↻ New journey</button></span></span></div>' +
      '<div class="mwrap"><div class="mbox">' + islandSVG() + '<div class="stops"></div><div class="hero" id="mapHero"></div>' + labelsSVG() + '</div></div>' +
      '<div class="mbot"><div class="info" id="mapInfo"></div><button class="bigbtn mint" id="mapPlay">▶ Play</button></div>' +
      '<div class="keys mkeys"><span class="grp"><kbd>←</kbd><kbd>→</kbd> pick a stop</span>' + (MAIN < ST.STOPS.length ? '<span class="grp"><kbd>↓</kbd> ' + A.esc(ST.AREAS.filter(function (a) { return a.side; }).map(function (a) { return a.name; }).join(' / ')) + ' <kbd>↑</kbd> trail</span>' : '') + '<span class="grp"><kbd class="wide">Space</kbd> play</span><span class="grp"><kbd>H</kbd> high scores</span><span class="grp"><kbd>B</kbd> story</span><span class="grp"><kbd>Esc</kbd> menu</span></div></section>');
    document.body.insertBefore(sec, document.body.firstChild);
    $('#mapHome').addEventListener('click', function () { SFX.tap(); location.href = 'index.html'; });
    $('#mapPlay').addEventListener('click', function () { play(sel); });
    window.__map = { items: ITEMS, sel: function () { return sel; }, select: function (j) { sel = j; render(); }, play: function (j) { play(j); } };
    $('#mapScores').addEventListener('click', function () { menu(false); scores(P); });
    $('#mapMore').addEventListener('click', function (e) { e.stopPropagation(); SFX.tap(); menu($('#mapMenu').hidden); });
    document.addEventListener('click', function (e) { if (!e.target.closest || !e.target.closest('.mmore')) menu(false); });
    $('#mapPath').addEventListener('click', togglePath);
    $('#mapBook').addEventListener('click', function () { if (busy || !A.StoryBook) return; SFX.pop(); V.stop(); A.StoryBook.open(P); });
    $('#mapNew').addEventListener('click', function () {
      menu(false); if (busy) return; var R = ST.run(P);
      if (R.stop === 0 && !R.done) { UI.toast('Your journey is just starting!'); return; }
      UI.confirm({ title: 'Start a new journey?', sub: 'Your high score stays on the board. The new journey starts at stop 1, and every unlocked stop stays open for practice.', yes: 'New journey', no: 'Keep going' }).then(function (ok) {
        if (!ok) return; ST.newRun(P); A.Store.save(); sel = itemOf(0); render(); V.say(['story_new_journey']);
      });
    });
    document.addEventListener('keydown', onKey);
  }
  function menu(on) { var m = $('#mapMenu'); if (!m) return; m.hidden = !on; $('#mapMore').setAttribute('aria-expanded', on ? 'true' : 'false'); }
  // design1: side trips sit behind one signpost; their stops show only while the signpost is open or a side stop is picked
  var sideOpen = false, SIGN = { x: 66, y: 88 };
  function sideShown() { return (ITEMS[sel] && ITEMS[sel].t === 's' && ST.isSide(ITEMS[sel].i)); }
  function togglePath() {
    if (busy) return; var cur = ST.path(P), nx = cur === 'big' ? 'little' : 'big';
    ST.setPath(P, nx); A.Store.save(); sel = itemOf(ST.run(P).done ? 0 : ST.run(P).stop); render(); SFX.pop(); V.say([nx === 'big' ? 'story_big' : 'story_little']);
  }
  function render() {
    var R = ST.run(P), top = ST.unlockedTo(P), box = sec.querySelector('.stops'), path = ST.PATHS[ST.path(P)];
    $('#mapRun').innerHTML = 'Journey <b>' + R.score + '</b> · Stop ' + Math.min(R.stop + 1, MAIN) + ' of ' + MAIN + (ST.data(P).bestRun ? ' · Best <b>' + ST.data(P).bestRun + '</b>' : '');
    $('#mapPath').innerHTML = path.emoji + ' ' + path.name;
    $('#mapPath').title = ST.path(P) === 'little' ? 'Little Steps: easier levels, fewer snacks. Click for Big Steps.' : 'Big Steps: every level. Click for Little Steps.';
    box.innerHTML = '';
    ST.STOPS.forEach(function (s, i) {
      var info = ST.stopInfo(P, i) || {}, locked = !ST.playable(P, i), cur = !R.done && i === R.stop, gm = ST.GAMES[ST.gameOf(P, i)];
      if (s.side && !sideShown()) return;   // design1: side trips collapsed behind the signpost
      var b = A.el('<button class="stop' + (s.side ? ' side' : '') + ' g-' + gm.id + (locked ? ' locked' : '') + (info.passed ? ' passed' : '') + (cur ? ' cur' : '') + (ITEMS[sel].t === 's' && i === ITEMS[sel].i ? ' sel' : '') + '" style="' + pct(POS[i]) + '" data-i="' + i + '" data-game="' + gm.id + '" aria-label="' + (s.side ? A.esc(A.Curriculum.byId[s.skill].name) : 'Stop ' + s.n) + ', ' + A.esc(s.area.name) + ', ' + A.esc(gameName(gm.id)) + (locked ? ', locked' : '') + '">' +
        '<span class="n">' + (locked ? (s.side ? '' : s.n) : stopFace(s)) + '</span>' + (locked ? '' : '<span class="gm g-' + gm.id + '" title="' + A.esc(gameName(gm.id)) + '">' + gm.icon + '</span>') + (info.stars ? '<span class="ss">' + '★★★'.slice(0, info.stars) + '</span>' : '') + '</button>');
      b.addEventListener('click', function () { if (busy) return; if (locked) { lockedNudge(b); return; } var j = itemOf(i); if (sel === j) play(j); else { sel = j; if (!s.side) sideOpen = false; render(); SFX.step(); } });
      box.appendChild(b);
    });
    ST.CH.forEach(function (c, k) {
      var j = ITEMS.findIndex(function (it) { return it.t === 'c' && it.k === k; }), open = ST.chOpen(P, k), got = A.Rewards.unlocked(P, 'blob', c.blob), x = ST.data(P).challenges[c.area] || {};
      if (!open) return;   // design1: a challenge appears on the map only once it is open (no hints about what is ahead)
      var b = A.el('<button class="chal' + (open ? ' open' : ' locked') + (got ? ' got' : '') + (j === sel ? ' sel' : '') + '" style="' + pct(chPos(k)) + '" data-c="' + k + '" aria-label="Challenge, ' + A.esc(c.a.name) + (open ? '' : ', locked') + '">' +
        '<span class="cb' + (got ? '' : ' star') + '">' + (got ? B.svg({ blob: c.blob, expr: 'happy' }) : '⭐') + '</span><span class="cl">' + (got ? (x.best ? '⏱ ' + Math.round(x.best) + 's' : '✓') : open ? '⏱ Challenge' : '🔒') + '</span></button>');
      b.addEventListener('click', function () { if (busy) return; if (!open) { lockedNudge(b, true); return; } if (sel === j) play(j); else { sel = j; render(); SFX.step(); } });
      box.appendChild(b);
    });
    sec.classList.toggle('sideopen', !!sideShown());
    if (MAIN < ST.STOPS.length && !sideShown()) {
      var sp = A.el('<button class="signpost" style="' + pct(SIGN) + '" aria-label="Side trips: ' + A.esc(ST.AREAS.filter(function (a) { return a.side; }).map(function (a) { return a.name; }).join(', ')) + '"><span>🪧</span><b>Side trips</b></button>');
      sp.addEventListener('click', function () { if (busy) return; sideOpen = true; var ns = sideItem(); if (ns >= 0) sel = ns; render(); SFX.step(); });
      box.appendChild(sp);
    }
    var done = ST.unlockedTo(P), tr = sec.querySelector('#trailDone'), L = tr.getTotalLength ? tr.getTotalLength() : 0;
    if (L) tr.setAttribute('stroke-dasharray', (L * (done / MAIN)).toFixed(1) + ' 9999');
    placeHero(R.done ? FEST : POS[Math.min(R.stop, POS.length - 1)], false);
    info(); centerSel();
  }
  // portrait: the island scrolls sideways (munch.css); keep the picked stop / challenge in view
  function centerSel() {
    var w = sec.querySelector('.mwrap'), el = sec.querySelector('.stops .sel'); if (!w || !el || w.scrollWidth <= w.clientWidth + 2) return;
    var wr = w.getBoundingClientRect(), er = el.getBoundingClientRect(); w.scrollLeft += (er.left + er.width / 2) - (wr.left + wr.width / 2);
  }
  function info() {
    var it = ITEMS[sel];
    if (it.t === 'c') {
      var c = ST.CH[it.k], cc = ST.chConfig(P, it.k), got = A.Rewards.unlocked(P, 'blob', c.blob), x = ST.data(P).challenges[c.area] || {}, nm = B.byId[c.blob].name;
      $('#mapInfo').innerHTML = '<span class="ie' + (got ? ' chb">' + B.svg({ blob: c.blob, expr: 'happy' }) : '">⭐') + '</span><span class="it"><b>⭐ Challenge · ' + A.esc(c.a.name) + '</b>' +
        '<small>Munch all ' + cc.nOk + ' in under <b>' + cc.target + ' seconds</b>, with at most 1 oops</small>' +   // design1: never names a friend still to meet
        '<small>' + (ST.chOpen(P, it.k) ? (x.best ? 'Best time: <b>' + x.best + 's</b>' : got ? nm + ' is on your team' : 'A speedy snack race!') : 'Keep going on the trail!') + '</small></span>';
      return;
    }
    var s = ST.STOPS[it.i], cfg = ST.config(P, it.i), gid = ST.gameOf(P, it.i), inf = ST.stopInfo(P, it.i) || {}, R = ST.run(P), skill = A.Curriculum.byId[cfg.skill];
    var tag = s.side ? 'Side trip' : R.done ? 'Practice' : it.i === R.stop ? 'Journey stop' : it.i < R.stop ? 'Practice' : '';
    $('#mapInfo').innerHTML = '<span class="ie">' + s.area.emoji + '</span><span class="it"><b>' + (s.side ? stopFace(s) + ' ' + A.esc(skill.name) : 'Stop ' + s.n) + ' · ' + A.esc(s.area.name) + '</b>' +
      '<small class="game g-' + gid + '">' + ST.GAMES[gid].icon + ' <b>' + A.esc(gameName(gid)) + '</b>' + (gid === 'slugger' ? ' · ' + A.esc(ST.sluggerConfig(P, it.i).goalText) : '') + '</small>' +
      '<small>' + A.esc(skill.name) + ' · ' + A.esc(skill.levels[cfg.level]) + (cfg.helper ? ' · a little easier' : '') + (tag ? ' · ' + tag : '') + '</small>' +
      '<small>' + (inf.best ? 'Best here: <b>' + inf.best + '</b> ' + '★★★'.slice(0, inf.stars || 0) : 'Not played yet') + '</small></span>';
  }
  function lockedNudge(b) { if (b) { b.classList.remove('nudge'); void b.offsetWidth; b.classList.add('nudge'); } SFX.locked(); V.say(['story_locked']); }
  function placeHero(p, anim) {
    var h = $('#mapHero'); if (!anim) h.style.transition = 'none';
    h.style.left = (p.x / W * 100) + '%'; h.style.top = (p.y / H * 100) + '%';
    if (!anim) { void h.offsetWidth; h.style.transition = ''; }
  }
  // the blob bounces along the trail to the next stop
  function bounce(from, to) {
    return new Promise(function (res) {
      var pts = [], a = POS[from], b = to >= POS.length ? FEST : POS[to], hops = 4;
      for (var k = 1; k <= hops; k++) pts.push({ x: a.x + (b.x - a.x) * k / hops, y: a.y + (b.y - a.y) * k / hops });
      placeHero(a, false); var h = $('#mapHero'), k2 = 0;
      (function hop() {
        if (k2 >= pts.length) { h.classList.remove('hopping'); res(); return; }
        h.classList.remove('hopping'); void h.offsetWidth; h.classList.add('hopping'); SFX.step();
        placeHero(pts[k2++], true); setTimeout(hop, 380);
      })();
    });
  }
  function play(j) {
    if (busy || !resolveFn) return;
    var it = ITEMS[j];
    if (!playable(j)) { lockedNudge(sec.querySelector(it.t === 's' ? '.stop[data-i="' + it.i + '"]' : '.chal[data-c="' + it.k + '"]')); return; }
    busy = true; SFX.pop(); V.stop();
    var h = $('#mapHero'); placeHero(it.t === 's' ? POS[it.i] : chPos(it.k), true); h.classList.add('hopping');
    setTimeout(function () { busy = false; sec.classList.remove('on'); var f = resolveFn; resolveFn = null; f(it.t === 's' ? it.i : 'c' + it.k); }, 520);
  }
  function onKey(e) {
    if (!sec || !sec.classList.contains('on') || UI.cardOpen || A.Parent.isOpen() || A.$('#gate') || busy) return;
    var k = e.key;
    if (/^(ArrowDown|s|S)$/.test(k) && MAIN < ST.STOPS.length) { // jump to the side trip (Letter Lagoon) / back to the trail
      e.preventDefault(); var inSide = ITEMS[sel].t === 's' && ST.isSide(ITEMS[sel].i);
      var ns = inSide ? nextSideItem() : sideItem();
      if (ns >= 0) { sel = ns; sideOpen = true; render(); SFX.step(); V.say(['area_' + ST.STOPS[ITEMS[sel].i].area.id]); } else lockedNudge();
    }
    else if (/^(ArrowUp|w|W)$/.test(k) && MAIN < ST.STOPS.length && ITEMS[sel].t === 's' && ST.isSide(ITEMS[sel].i)) {
      e.preventDefault(); var R0 = ST.run(P); sideOpen = false; sel = itemOf(R0.done ? ST.unlockedTo(P) : R0.stop); render(); SFX.step();
    }
    else if (/^(ArrowRight|ArrowDown|d|D|s|S)$/.test(k)) { e.preventDefault(); var n = sel + 1; while (n < ITEMS.length && !playable(n) && ITEMS[n].t === 'c') n++; if (n < ITEMS.length && playable(n)) { sel = n; render(); SFX.step(); } else lockedNudge(); }
    else if (/^(ArrowLeft|ArrowUp|a|A|w|W)$/.test(k)) { e.preventDefault(); var m = sel - 1; while (m >= 0 && !playable(m)) m--; if (m >= 0) { sel = m; render(); SFX.step(); } }
    else if (k === ' ' || k === 'Enter' || k === 'f' || k === 'F') { e.preventDefault(); if (!e.repeat) play(sel); }
    else if (k === 'h' || k === 'H') { e.preventDefault(); scores(P); }
    else if ((k === 'b' || k === 'B') && A.StoryBook) { e.preventDefault(); V.stop(); A.StoryBook.open(P); }
    else if (k === 'Escape') { e.preventDefault(); location.href = 'index.html'; }
    else if (k === 'm' || k === 'M') { A.Music.toggle(); }
  }
  function open(p, o) {
    P = p; o = o || {}; if (!sec) build();
    $('#mapHero').innerHTML = B.forProfile(P, { expr: 'happy' });
    var R = ST.run(P); A.Store.save();
    sel = pre != null ? pre : itemOf(R.done ? Math.min(ST.unlockedTo(P), ST.STOPS.length - 1) : R.stop); pre = null;
    if (o.from != null && o.to != null && o.to !== o.from) sel = itemOf(o.to);
    if (o.selectItem != null) sel = o.selectItem;
    A.$$('.screen').forEach(function (s) { s.classList.toggle('on', s === sec); });
    render();
    return new Promise(function (res) {
      resolveFn = res;
      if (o.from != null && o.to != null && o.to !== o.from) {
        busy = true;
        bounce(o.from, o.to).then(function () { busy = false; var newArea = ST.STOPS[o.to].ai !== ST.STOPS[o.from].ai; V.say([ST.isSide(o.to) ? 'story_next' : newArea ? 'story_area_done' : 'story_one_more']); render(); });
      } else if (o.from != null && R.done) {
        busy = true; bounce(MAIN - 1, POS.length + 1).then(function () { busy = false; render(); });
      } else if (A.StoryBook && !A.StoryBook.seen(P)) { A.StoryBook.maybeAuto(P); }   // the intro picture book, once per player (no extra voice lines)
      else if (firstOpen) { V.say(['story_title']); }   // 2026-10-22 voice: short intro ("Pick a stop" is on screen)
      firstOpen = false;
    });
  }
  function scores(p) {
    if (UI.cardOpen) return;
    var all = A.Store.profiles(), rows = ST.board(all), medals = ['🥇', '🥈', '🥉'], s = ST.data(p), R = ST.run(p);
    var fam = rows.map(function (r, i) {
      return '<tr class="' + (r.p.id === p.id ? 'me' : '') + '"><td class="rk">' + (r.score ? medals[i] || i + 1 : '') + '</td><td class="av">' + B.forProfile(r.p) + '</td><td class="nm">' + A.esc(r.p.name) + '</td>' +
        '<td class="sc">' + (r.score || '—') + '</td><td class="st">' + (r.score ? (r.finished ? '🏁 ' : '') + r.stops + '/' + MAIN + ' ' + ST.PATHS[r.path].emoji : 'not yet') + '</td></tr>';
    }).join('');
    var mine = ST.AREAS.map(function (a, ai) {
      var sum = 0; ST.STOPS.forEach(function (st) { if (st.ai === ai) sum += (ST.stopInfo(p, st.i) || {}).best || 0; });
      return '<div class="ab"><span>' + a.emoji + '</span><b>' + (sum || '—') + '</b></div>';
    }).join('');
    var html = '<div class="hs"><div class="col"><h3>Family board</h3><table class="fam">' + fam + '</table><p class="note">Best journey score for each player · 🐣 Little Steps · 🚀 Big Steps</p></div>' +
      '<div class="col"><h3>' + A.esc(p.name) + "'s best</h3><div class=\"pb\"><div><small>Best journey</small><b>" + (s.bestRun || 0) + '</b></div><div><small>This journey</small><b>' + R.score + '</b></div><div><small>Journeys finished</small><b>' + (s.finished || 0) + '</b></div></div>' +
      '<div class="areas">' + mine + '</div><p class="note">Best stop scores in each area (' + ST.PATHS[ST.path(p)].name + ')</p></div></div>';
    return UI.card({ cls: 'scores', tag: A.TITLES.munch + ' · Story', title: '🏆 High scores', html: html, btn: 'OK', voice: ['story_high_scores'], minMs: 300 });
  }
  A.MunchMap = { MAIN: MAIN, sideItem: function () { return sideItem(); }, open: open, scores: scores, preselect: function (i) { pre = typeof i === 'string' ? ITEMS.findIndex(function (it) { return it.t === 'c' && 'c' + it.k === i; }) : itemOf(i); }, chPos: chPos, POS: POS, isOpen: function () { return !!sec && sec.classList.contains('on'); } };
})(window.Arcade);
