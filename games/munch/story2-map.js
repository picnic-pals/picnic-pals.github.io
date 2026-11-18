/* Picnic Pals — Story mode v2 maps (story2). A.StoryMap2.open(profile, {from, to}) resolves with the stop index to play
   (same contract as A.MunchMap.open). World map: only the places reached so far (the rest is fog, no names, no icons).
   Place map: that place's levels on a little trail, the mini boss last, themed art (CSS + emoji), a guide who hops you along,
   tap the scenery for its sound. Your friend is the hero (Friend button: switch any time; each friend keeps their own story).
   Keys: ←/→ move · Enter/Space play/open · Esc back (place → world → menu) · F friend · B book. */
(function (A) {
  // quality1 polish: a node never hangs off the map's edge on a narrow screen (its half-width comes from CSS --hw)
  function LX(x) { return 'left:clamp(var(--hw, 0px), ' + x + '%, calc(100% - var(--hw, 0px)))'; }
  'use strict';
  var S2 = A.Story2, ST = A.Story, V = A.Voice, UI = A.UI;
  var P = null, resolveFn = null, view = 'world', placeK = 0, sel = 0, root = null, busy = false;
  var zoomTimer = 0, zooming = false;
  var ZOOM_MS = 350, SWITCH_PAN_MS = 520, SWITCH_ZOOM_MS = 400, REVEAL_MS = 900;
  var lastOrient = null;
  // world map slots (percent of the stage), a winding trail; only reached ones are drawn
  var WXY = [[12, 72], [30, 50], [50, 70], [66, 44], [84, 62], [72, 22], [46, 22]];
  var LXY = [[12, 70], [28, 46], [44, 68], [60, 42], [76, 64], [90, 36]];
  function img(id, pose) { return A.Blobs.art(id, pose || 'front', 256); }
  function say(parts, kind) { try { return V.say(parts, { kind: kind || 'name' }); } catch (e) { return Promise.resolve(); } }
  /* tiny place sounds (WebAudio, no files) */
  var AC = null;
  function tone(f0, f1, dur, type, vol, at) { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); var t = AC.currentTime + (at || 0), o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || .15, t + .02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + dur + .05); } catch (e) {} }
  var SOUNDS = {
    chirp: function () { tone(2400, 3200, .08, 'sine', .08); tone(2600, 3600, .08, 'sine', .08, .12); },
    ribbit: function () { tone(220, 160, .12, 'square', .06); tone(240, 170, .14, 'square', .06, .16); },
    bell: function () { tone(1320, 1300, .6, 'triangle', .1); },
    hoot: function () { tone(420, 380, .28, 'sine', .14); tone(400, 360, .4, 'sine', .14, .36); },
    whoosh: function () { tone(300, 900, .5, 'sawtooth', .025); },
    wave: function () { tone(180, 90, .9, 'triangle', .07); },
    drip: function () { tone(900, 1800, .09, 'sine', .1); tone(700, 1400, .09, 'sine', .06, .25); },
    pop: function () { tone(500, 900, .07, 'sine', .1); } };
  function sound(k) { if (A.Store.settings && A.Store.settings.sfx === false) return; (SOUNDS[k] || SOUNDS.pop)(); A.StoryMap2.lastSound = k; }

  function reduceMotion() { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } }
  function setPhase(ph) { A.StoryMap2.lastZoomPhase = ph; if (root) { var z = root.querySelector('.s2-zoom'); if (z) z.dataset.phase = ph; } }
  function cam(x, y, sc) { return 'translate(' + (50 - x * sc) + '%, ' + (50 - y * sc) + '%) scale(' + sc + ')'; }
  function clearZoom() {
    if (zoomTimer) { clearTimeout(zoomTimer); zoomTimer = 0; }
    if (root) {
      root.classList.remove('s2-zooming');
      var z = root.querySelector('.s2-zoom'); if (z) z.remove();
      var cam = root.querySelector('.s2-cam');
      if (cam) { cam.style.transform = ''; cam.style.transition = ''; }
    }
    zooming = false; setPhase('done'); A.StoryMap2._resume = null;
  }
  function placeOverlay(z) {
    var stg = root.querySelector('#s2Stage'); if (!z || !stg) return;
    // Use layout (unscaled) box so the overlay stays on the stage at every --stage-scale.
    z.style.left = stg.offsetLeft + 'px';
    z.style.top = stg.offsetTop + 'px';
    z.style.width = stg.offsetWidth + 'px';
    z.style.height = stg.offsetHeight + 'px';
  }
  function ensureCam() {
    var stg = root.querySelector('#s2Stage'); if (!stg) return null;
    var cam = stg.querySelector('.s2-cam');
    if (cam) return cam;
    cam = document.createElement('div'); cam.className = 's2-cam';
    while (stg.firstChild) cam.appendChild(stg.firstChild);
    stg.appendChild(cam);
    return cam;
  }
  function startZoomOverlay(kind, pl) {
    var old = root.querySelector('.s2-zoom'); if (old) old.remove();
    var z = A.el('<div class="s2-zoom" data-kind="' + kind + '" data-place="' + pl.id + '" data-phase="start" aria-hidden="true">' +
      '<div class="s2-zoom-banner"><b>' + A.esc(pl.name) + '</b></div><span class="s2-zoom-spark"></span></div>');
    root.appendChild(z); placeOverlay(z); return z;
  }
  function worldCam() {
    return (root && root.querySelector('.s2-overview-board')) || ensureCam();
  }
  function zoomTo(id, sc, ms) {
    var layer = worldCam(), p = A.StoryArt && A.StoryArt.regionPct(id);
    if (!layer || !p) return;
    var scale = sc != null ? sc : (A.StoryArt.zoomScale(id) || 2);
    layer.style.transition = ms ? ('transform ' + ms + 'ms ease') : 'none';
    layer.style.transformOrigin = '0 0';
    layer.style.transform = cam(p.x, p.y, scale);
  }
  function finishIntoPlace(k) {
    clearZoom();
    placeK = k; view = 'place';
    render();
    busy = false;
    A.StoryMap2.lastPlace = k;
  }
  function zoomIntoPlace(k, o) {
    o = o || {};
    var pl = S2.PLACES[k];
    A.StoryMap2.lastZoom = o.switchFrom != null ? 'switch' : 'in';
    if (o.skip || reduceMotion()) { view = 'place'; placeK = k; render(); setPhase('done'); A.StoryMap2.lastPlace = k; busy = false; return Promise.resolve(); }
    if (view !== 'world') { view = 'world'; render(); }
    zooming = true; busy = true; root.classList.add('s2-zooming');
    var z = startZoomOverlay('in', pl);
    setPhase('zoom');
    zoomTo(pl.id, A.StoryArt && A.StoryArt.zoomScale(pl.id), ZOOM_MS);
    requestAnimationFrame(function () { if (z) { placeOverlay(z); z.classList.add('on'); } });
    return new Promise(function (res) {
      var done = function () { finishIntoPlace(k); res(); };
      if (o.holdAt === 'zoom') { A.StoryMap2._resume = done; return; }
      zoomTimer = setTimeout(done, ZOOM_MS);
    });
  }
  function switchWorld(fromK, toK, o) {
    o = o || {};
    var dest = S2.PLACES[toK];
    A.StoryMap2.lastZoom = 'switch';
    if (o.skip || reduceMotion()) { placeK = toK; view = 'place'; render(); setPhase('done'); A.StoryMap2.lastPlace = toK; busy = false; return Promise.resolve(); }
    view = 'world'; placeK = toK; render();
    zooming = true; busy = true; root.classList.add('s2-zooming');
    var fromPl = S2.PLACES[fromK], mid = 1.35;
    var z = startZoomOverlay('switch', dest);
    zoomTo(fromPl.id, mid, 0);
    setPhase('pan');
    requestAnimationFrame(function () {
      if (z) { placeOverlay(z); z.classList.add('on', 'pan'); }
      zoomTo(dest.id, mid, SWITCH_PAN_MS);
      var destBtn = root.querySelector('.s2-place[data-k="' + toK + '"]'); if (destBtn) destBtn.classList.add('s2-arrive');
    });
    return new Promise(function (res) {
      var goZoom = function () {
        setPhase('zoom');
        if (z) { z.classList.add('zoom'); z.classList.remove('pan'); }
        zoomTo(dest.id, A.StoryArt && A.StoryArt.zoomScale(dest.id), SWITCH_ZOOM_MS);
      };
      var end = function () { finishIntoPlace(toK); res(); };
      if (o.holdAt === 'pan') { A.StoryMap2._resume = function () { goZoom(); zoomTimer = setTimeout(end, SWITCH_ZOOM_MS); }; return; }
      zoomTimer = setTimeout(function () {
        goZoom();
        if (o.holdAt === 'zoom') { A.StoryMap2._resume = end; return; }
        zoomTimer = setTimeout(end, SWITCH_ZOOM_MS);
      }, SWITCH_PAN_MS);
    });
  }


  function build() {
    root = A.el('<section class="s2" id="s2map" aria-label="Story map"><div class="s2-top"><button class="s2-back" id="s2Back" aria-label="Back">←</button>' +
      '<div class="s2-title" id="s2Title"></div><button class="s2-book" id="s2Book" aria-label="Read the story book">Book</button><button class="q1help" id="s2Help" aria-label="How to play" title="How to play">?</button>' +
      '<button class="s2-hero" id="s2Hero" aria-label="Switch friend"><img alt=""><span class="nm"></span><span class="sw"><i>F</i> <b>Friend</b></span></button></div>' +
      '<div class="s2-stage" id="s2Stage"></div></section>');
    document.body.appendChild(root);
    root.querySelector('#s2Back').addEventListener('click', back);
    root.querySelector('#s2Hero').addEventListener('click', function () { if (!busy) friendPanel(); });
    var reGuide = function () {
      var stage = root.querySelector('.s2-art-stage'); if (stage) stage.style.setProperty('--s2-map-width', Math.max(900, stage.clientHeight * 1.6) + 'px');
      var gd = root.querySelector('.s2-guide'), nb = root.querySelector('.s2-lv.cur'); if (gd && nb) placeGuide(gd, nb, gd.parentNode);
      if (isOpen() && view === 'world' && !zooming) {
        if (A.StoryArt && A.StoryArt.orient() !== lastOrient) render();
        else { var b = root.querySelector('.s2-overview-board'); if (b) fitOverview(root.querySelector('#s2Stage'), b, lastOrient); }
      }
      var reveal = document.querySelector('.s2-story.s2-reveal'); if (reveal) fitFaceoff(reveal);
    };
    window.addEventListener('resize', reGuide);
    root.querySelector('#s2Help').addEventListener('click', function () { if (!busy && A.HowTo && !document.querySelector('.overlay.on')) { V.stop(); A.HowTo.show('story'); } });   // quality1 (C3)
    root.querySelector('#s2Book').addEventListener('click', function () { if (!busy && A.StoryBook) { V.stop(); A.StoryBook.open(P); } });
    document.addEventListener('keydown', onKey, true);
  }
  function isOpen() { return !!root && root.classList.contains('on'); }
  function heroChip() { var h = S2.hero(P), b = root.querySelector('#s2Hero'); b.querySelector('img').src = img(h); b.querySelector('.nm').textContent = S2.heroName(h); b.dataset.hero = h; }
  function render() {
    var note = root.querySelector('.s2-pan-note'); if (note) note.remove();
    heroChip(); var stg = root.querySelector('#s2Stage'); stg.innerHTML = ''; stg.classList.remove('s2-art-stage'); root.dataset.view = view;
    if (view === 'world') return renderWorld(stg);
    renderPlace(stg);
  }
  function fitOverview(stg, board, orient) {
    if (!stg || !board) return;
    var sw = stg.clientWidth, sh = stg.clientHeight;
    var iw = orient === 'landscape' ? 2048 : 800, ih = orient === 'landscape' ? 1280 : 1440;
    var s = Math.min(sw / iw, sh / ih);
    board.style.width = Math.max(1, Math.round(iw * s)) + 'px';
    board.style.height = Math.max(1, Math.round(ih * s)) + 'px';
  }
  function fitFaceoff(ov) {
    ov = ov || document.querySelector('.s2-story.s2-reveal');
    var frame = ov && ov.querySelector('.s2-reveal-frame');
    var board = ov && ov.querySelector('.s2-faceoff');
    if (!frame || !board || getComputedStyle(board).display === 'none') return;
    var sw = frame.clientWidth, sh = frame.clientHeight;
    if (!sw || !sh) return;
    var o = board.getAttribute('data-orient') || (A.StoryArt && A.StoryArt.orient()) || 'portrait';
    var iw = o === 'landscape' ? 2048 : 800, ih = o === 'landscape' ? 1280 : 1440;
    var s = Math.min(sw / iw, sh / ih);
    board.style.width = Math.max(1, Math.round(iw * s)) + 'px';
    board.style.height = Math.max(1, Math.round(ih * s)) + 'px';
  }
  function renderWorld(stg) {
    var R = S2.reachedList(P), cur = S2.currentPlace(P);
    root.querySelector('#s2Title').textContent = 'Picnic World';
    root.style.removeProperty('--s2a'); root.style.removeProperty('--s2b'); root.dataset.place = '';
    lastOrient = (A.StoryArt && A.StoryArt.orient()) || 'portrait';
    var wrap = A.el('<div class="s2-overview-wrap"></div>');
    var board = A.el('<div class="s2-cam s2-overview-board" data-orient="' + lastOrient + '"><img class="s2-overview" alt="Picnic World" src="' + (A.StoryArt ? A.StoryArt.overviewURL(lastOrient) : '') + '"></div>');
    wrap.appendChild(board); stg.appendChild(wrap);
    fitOverview(stg, board, lastOrient);
    // reached places: the island bbox is the hit target; the name sits on a small chip so the plate art stays visible
    R.forEach(function (k) {
      var pl = S2.PLACES[k], pr = S2.progress(P, k), pct = A.StoryArt && A.StoryArt.regionPct(pl.id);
      var style = pct ? ('left:' + pct.l + '%;top:' + pct.t + '%;width:' + pct.w + '%;height:' + pct.h + '%') : (LX(WXY[k][0]) + ';top:' + WXY[k][1] + '%');
      var b = A.el('<button class="s2-place' + (k === cur ? ' cur' : '') + (S2.done(P, k) ? ' done' : '') + '" data-k="' + k + '" style="' + style + ';--a:' + pl.theme[0] + ';--b:' + pl.theme[1] + '">' +
        '<span class="nm">' + A.esc(pl.name) + '</span><span class="pr">' + Array(Math.min(pr.n, 6) + 1).join('<span class="s2-world-star">' + UI.STAR + '</span>') + '<i>' + pr.n + '/' + pr.of + '</i></span></button>');
      b.addEventListener('click', function () { if (!busy) openPlace(k); });
      board.appendChild(b);
    });
    // unreached worlds stay fogged plates — no name, no icon
    S2.PLACES.forEach(function (pl, k) {
      if (R.indexOf(k) >= 0) return;
      var pct = A.StoryArt && A.StoryArt.regionPct(pl.id);
      var style = pct ? ('left:' + pct.l + '%;top:' + pct.t + '%;width:' + pct.w + '%;height:' + pct.h + '%') : ('left:' + WXY[k][0] + '%;top:' + WXY[k][1] + '%');
      board.appendChild(A.el('<div class="s2-fog" aria-hidden="true" style="' + style + '"><span class="s2-cloud"></span><span class="s2-cloud"></span><span class="s2-cloud"></span></div>'));
    });
    if (S2.waiting(P)) stg.appendChild(A.el('<div class="s2-note">A new path opens next time. Replay a place or pick a friend!</div>'));
    var here = A.StoryArt && A.StoryArt.regionPct(S2.PLACES[cur].id);
    var hx = here ? { x: here.x, y: here.y } : { x: WXY[cur][0], y: WXY[cur][1] };
    board.appendChild(A.el('<img class="s2-me" alt="" src="' + img(S2.hero(P), 'happy') + '" style="left:' + hx.x + '%;top:' + hx.y + '%">'));
    sel = Math.max(0, R.indexOf(cur)); focusSel();
  }
  function placeGuide(gd, nb, stg) {
    var r = nb.getBoundingClientRect(), s = stg.getBoundingClientRect(), g = gd.getBoundingClientRect(), gw = g.width || 60; if (!s.width || !r.width) return;
    var right = r.right - s.left + gw / 2 + 10, left = r.left - s.left - gw / 2 - 10;
    gd.style.left = (right + gw / 2 <= s.width ? right : left >= gw / 2 ? left : right) + 'px'; gd.style.top = (r.top - s.top + r.height * .35) + 'px';
  }
  function renderPlace(stg) {
    var k = placeK, pl = S2.PLACES[k], L = S2.levels(P, k), cur = S2.current(P, k);
    if (pl.art) return renderArtPlace(stg, pl, L, cur);
    root.querySelector('#s2Title').textContent = pl.emoji + ' ' + pl.name; root.style.setProperty('--s2a', pl.theme[0]); root.style.setProperty('--s2b', pl.theme[1]); root.dataset.place = pl.id;
    pl.deco.forEach(function (d, j) { var e = A.el('<button class="s2-deco" aria-label="scenery" style="left:' + (6 + j * 16 + (j % 2) * 4) + '%;top:' + (j % 2 ? 84 : 14 + (j % 3) * 4) + '%;animation-delay:' + (j * .7) + 's">' + d + '</button>');
      e.addEventListener('click', function () { e.classList.remove('wig'); void e.offsetWidth; e.classList.add('wig'); sound(pl.sound); }); stg.appendChild(e); });
    var xy = L.map(function (i, j) { return j === L.length - 1 ? [Math.min(90, LXY[j][0] + (L.length < 4 ? 30 : 0)), L.length < 4 ? 40 : LXY[j][1]] : (L.length < 4 ? [16 + j * 26, j % 2 ? 50 : 66] : LXY[j]); });
    stg.insertAdjacentHTML('beforeend', '<svg class="s2-trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="' + xy.map(function (q) { return q.join(','); }).join(' ') + '"/></svg>');
    L.forEach(function (i, j) {
      var boss = S2.isBoss(i), ok = S2.playable(P, i), pass = S2.passed(P, i), r = ST.stopInfo(P, i) || {}, g = ST.gameOf(P, i), gi = ST.GAMES[g] ? ST.GAMES[g].icon : '';
      var b = A.el('<button class="s2-lv' + (boss ? ' boss' : '') + (boss && !ok ? ' s2-boss-hid' : '') + (i === cur ? ' cur' : '') + (pass ? ' pass' : '') + (ok ? '' : ' off') + '" data-i="' + i + '" style="' + LX(xy[j][0]) + ';top:' + xy[j][1] + '%"' + (ok ? '' : ' aria-disabled="true"') + (pass && ok ? ' aria-label="Play again"' : '') + (boss && !ok ? ' aria-label="Keep going to open this stop"' : '') + '>' +
        '<span class="n">' + (boss && !ok ? '<span class="s2-boss-cover" aria-hidden="true"><span class="s2-cloud"></span></span>' : (boss ? (A.Icons ? A.Icons.html('👑', { size: 32, decorative: true, cls: 'pp-pic', slot: 'story2:boss:' + i }) : '👑') : (j + 1))) + '</span>' + (ok && !boss ? '<span class="g">' + gi + '</span>' : '') + (pass ? '<span class="st">' + '⭐'.repeat(Math.max(1, Math.min(3, r.stars || 1))) + '</span>' : '') +
        (boss && ok ? '<span class="bl">Mini boss</span>' : '') + (pass && ok ? '<span class="rp" aria-hidden="true">↻</span>' : '') + '</button>');
      b.addEventListener('click', function () { if (busy) return; if (!ok) { sound('pop'); b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); return; } choose(i); });
      stg.appendChild(b);
    });
    var cj = Math.max(0, L.indexOf(cur)), cx = xy[cj];
    stg.appendChild(A.el('<img class="s2-me" alt="" src="' + img(S2.hero(P), 'happy') + '" style="left:' + cx[0] + '%;top:' + (cx[1] - 13) + '%">'));
    var gd = A.el('<div class="s2-guide" aria-hidden="true" style="left:' + (cx[0] + 7) + '%;top:' + (cx[1] - 4) + '%">' + pl.guide + '</div>'); stg.appendChild(gd);
    // quality1 polish: the guide stands BESIDE the current level (it sat on the node's number on phones, where nodes are wider than 7%)
    var curB = stg.querySelector('.s2-lv[data-i="' + cur + '"]'); if (curB) { placeGuide(gd, curB, stg); if (window.requestAnimationFrame) requestAnimationFrame(function () { placeGuide(gd, curB, stg); }); }
    sel = cj; focusSel();
  }
  // Keep the 1600:1000 art and its marker centres together. Small screens pan rather than crop/stretch the map.
  function renderArtPlace(stg, pl, L, cur) {
    root.querySelector('#s2Title').textContent = pl.name;
    root.dataset.place = pl.id; stg.classList.add('s2-art-stage');
    stg.style.setProperty('--s2-map-width', Math.max(900, stg.clientHeight * 1.6) + 'px');
    root.appendChild(A.el('<div class="s2-pan-note">Swipe sideways to explore</div>'));
    var board = A.el('<div class="s2-art-board"><img class="s2-map-paint" alt="" src="' + S2.artURL(pl, 'map') + '"></div>');
    stg.appendChild(board);
    L.forEach(function (i, j) {
      var boss = S2.isBoss(i), mark = pl.art.markers[boss ? 5 : S2.LEVELS[pl.ix].indexOf(i)], ok = S2.playable(P, i), pass = S2.passed(P, i), r = ST.stopInfo(P, i) || {};
      var portrait = S2.artURL(pl, S2.bossBeaten(P, pl.ix) ? 'portrait_rematch' : 'portrait');
      var stars = pass ? '<span class="s2-drawn-stars">' + Array(Math.max(1, Math.min(3, r.stars || 1)) + 1).join(UI.STAR) + '</span>' : '';
      var hid = boss && !ok;
      var seenBoss = !!(ST.data(P).seen && ST.data(P).seen['bossnode:' + pl.id]);
      var pop = boss && ok && !seenBoss;
      if (pop) { ST.data(P).seen = ST.data(P).seen || {}; ST.data(P).seen['bossnode:' + pl.id] = Date.now(); }
      var b = A.el('<button class="s2-lv s2-art-lv' + (boss ? ' boss' : '') + (hid ? ' s2-boss-hid' : '') + (pop ? ' s2-boss-pop' : '') + (i === cur ? ' cur' : '') + (pass ? ' pass' : '') + (ok ? '' : ' off') + '" data-i="' + i + '" style="left:' + (mark.x / pl.art.size[0] * 100) + '%;top:' + (mark.y / pl.art.size[1] * 100) + '%"' + (ok ? '' : ' aria-disabled="true"') + ' aria-label="' + A.esc(hid ? 'Keep going to open this stop' : (mark.landmark_name + (boss ? ', mini boss ' + pl.boss : ', level ' + (j + 1)) + (pass ? ', play again' : ''))) + '">' +
        (hid ? '<span class="s2-boss-cover" aria-hidden="true"><span class="s2-cloud"></span></span>' : (boss ? '<img class="s2-marker-boss" alt="" src="' + portrait + '">' : '<span class="n">' + (j + 1) + '</span>')) +
        (hid ? '' : '<span class="s2-stop-label">' + A.esc(mark.landmark_name) + stars + '</span>') + (pass && ok ? '<span class="rp" aria-hidden="true">↻</span>' : '') + '</button>');
      b.addEventListener('click', function () { if (!busy && ok) choose(i); else if (!busy) { sound('pop'); lockedNudge(board, cur); } }); board.appendChild(b);
    });
    var currentB = board.querySelector('[data-i="' + cur + '"]');
    if (currentB) {
      var me = A.el('<img class="s2-art-hero" alt="Your friend is here" src="' + img(S2.hero(P), 'happy') + '">');
      me.style.left = currentB.style.left; me.style.top = currentB.style.top; board.appendChild(me);
      requestAnimationFrame(function () { stg.scrollLeft = Math.max(0, currentB.offsetLeft - stg.clientWidth / 2); });
    }
    sel = Math.max(0, L.indexOf(cur)); focusSel();
  }
  function items() { return A.$$(view === 'world' ? '.s2-place' : '.s2-lv', root); }
  function focusSel() { var it = items(); it.forEach(function (b, j) { b.classList.toggle('sel', j === sel); }); if (view === 'place' && S2.PLACES[placeK].art && it[sel]) it[sel].scrollIntoView({ block: 'nearest', inline: 'center' }); }
  function openPlace(k, quiet) {
    var fromWorld = view === 'world' && isOpen() && !zooming;
    placeK = k; sound(S2.PLACES[k].sound);
    var m = S2.meta(P), seenKey = S2.hero(P) + ':' + S2.PLACES[k].id, sd = ST.data(P); sd.seen = sd.seen || {};
    if (!quiet) { var first = !sd.seen['place2:' + S2.PLACES[k].id]; sd.seen['place2:' + S2.PLACES[k].id] = Date.now(); A.Store.save();
      say([{ text: S2.PLACES[k].name + '!' }].concat(first ? [{ id: 's2_tag_' + (S2.FLAVOR[S2.hero(P)] ? S2.hero(P) : 'other'), text: S2.flavor(P).tag }] : [])); }
    A.StoryMap2.lastPlace = k; void m; void seenKey;
    if (!quiet && fromWorld && !reduceMotion()) { return zoomIntoPlace(k); }
    view = 'place'; render();
  }
  // batch-1107c: a locked level used to look almost like an open one and a tap did nothing (felt frozen to a 4-year-old):
  // now the open level bounces and a short note says where to go
  function lockedNudge(board, cur) {
    var c = board.querySelector('[data-i="' + cur + '"]'); if (c) { c.classList.remove('nudge'); void c.offsetWidth; c.classList.add('nudge'); }
    var old = root.querySelector('.s2-lock-note'); if (old) old.remove();
    var n = A.el('<div class="s2-lock-note" role="status">Play the bouncing level first!</div>'); root.appendChild(n); setTimeout(function () { n.remove(); }, 2200);
  }
  function choose(i) {
    busy = true; sound('pop'); var boss = S2.isBoss(i), pl = S2.PLACES[S2.placeOfStop(i)];
    var go = function () { busy = false; close(); var f = resolveFn; resolveFn = null; if (f) f(i); };
    if (!boss || pl.art) return go();
    // the mini boss: a bigger fun challenge, never scary, no pressure (any result is fine; try again any time)
    UI.card({ cls: 'storycard s2boss', tag: pl.emoji + ' ' + pl.name, title: 'Mini boss: ' + pl.boss + '!', art: '<div class="jump"><img src="' + img(S2.hero(P), 'happy') + '" alt="" style="width:150px"></div><div class="s2-bossart">' + pl.bossEmoji + '</div>',
      sub: 'A big, fun challenge. ' + S2.flavor(P).boss + ' Take your time.', btn: "Let's try ▶", voice: ['s2_boss', { id: 's2_bosscheer_' + (S2.FLAVOR[S2.hero(P)] ? S2.hero(P) : 'other'), text: S2.flavor(P).boss }], minMs: 500 }).then(go);
  }
  function back() {
    if (busy) return; sound('pop'); V.stop();
    // quality1 (C4): Back from a place goes to the world map, toddlers too once they have reached a 2nd place (so an earlier
    // place can always be replayed); a toddler with one place goes straight home
    if (view === 'place' && (!TOD() || S2.reachedList(P).length > 1)) { view = 'world'; render(); return; }
    close(); var f = resolveFn; resolveFn = null; if (f) f('back');
  }
  function friendPanel() {
    busy = true; var list = S2.heroes(P);
    var ov = A.el('<div class="overlay on s2-friends" role="dialog" aria-modal="true" aria-label="Pick your friend"><div class="card"><h2>Who is the hero?</h2><p class="sub">Each friend keeps their own story.</p><div class="s2-fl"></div><button class="bigbtn" data-keep>Keep going ▶</button></div></div>');
    list.forEach(function (h) { var b = A.el('<button class="s2-fr' + (h.active ? ' on' : '') + '" data-id="' + h.id + '"><img alt="" src="' + img(h.id, 'happy') + '"><span>' + A.esc(h.name) + '</span>' + (h.active ? '<i>playing</i>' : '') + '</button>');
      b.addEventListener('click', function () { pick(h.id); }); ov.querySelector('.s2-fl').appendChild(b); });
    var shut = function () { ov.remove(); busy = false; if (A.UI) A.UI.cardOpen = !!document.querySelector('.overlay.on'); };
    function pick(id) { var was = S2.hero(P); S2.switchHero(P, id); A.Store.save(); shut(); sound('pop'); if (view === 'place' && !S2.reached(P, placeK)) view = 'world'; render();
      if (id !== was) say(['s2_switched', { text: S2.heroName(id) }]); A.StoryMap2.lastSwitch = id; }
    ov.querySelector('[data-keep]').addEventListener('click', shut);
    document.body.appendChild(ov); if (A.UI) A.UI.cardOpen = true; say(['s2_who']);
    A.StoryMap2.panel = ov;
  }
  function askNew() {
    var id = S2.askHero(P); if (!id) return Promise.resolve();
    var m = S2.meta(P); m.asked[id] = 1; A.Store.save(); var nm = S2.heroName(id), cur = S2.heroName(S2.hero(P));
    return UI.confirm({ title: 'Play as ' + nm + '?', sub: nm + ' wants to join the story! Play as ' + nm + ', or keep going with ' + cur + '?', yes: 'Play as ' + nm, no: 'Keep going', art: '<img src="' + img(id, 'happy') + '" alt="" style="width:140px">', cls: 's2ask' })
      .then(function (yes) { if (yes) { S2.switchHero(P, id); A.Store.save(); render(); } });
  }
  function onKey(e) {
    if (!isOpen() || busy || (A.StoryBook && A.StoryBook.isOpen && A.StoryBook.isOpen()) || document.querySelector('.overlay.on')) return;
    var k = e.key, it = items(), used = true;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'd' || k === 'D') { sel = Math.min(it.length - 1, sel + 1); focusSel(); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'a' || k === 'A') { sel = Math.max(0, sel - 1); focusSel(); }
    else if (k === 'Enter' || k === ' ') { if (it[sel]) it[sel].click(); }
    else if (k === 'Escape' || k === 'Backspace') back();
    else if (k === 'f' || k === 'F') friendPanel();
    else if ((k === 'b' || k === 'B') && A.StoryBook) A.StoryBook.open(P);
    else used = false;
    if (used) { e.preventDefault(); e.stopPropagation(); }
  }
  function close() { clearZoom(); if (root) root.classList.remove('on'); }
  function TOD() { return !!(P && A.toddler && A.toddler(P)); }   // toddler mode: straight to the current place, big buttons
  function open(p, o) {
    o = o || {}; P = p; S2.migrate(p); if (!root) build(); busy = false; root.classList.toggle('s2-tod', TOD());
    var sd = ST.data(p); sd.seen = sd.seen || {}; sd.seen.prologue = sd.seen.prologue || Date.now();   // the picture book is the prologue in v2
    root.classList.add('on'); var to = o.to != null ? +o.to : null, k = to != null ? S2.placeOfStop(to) : -1;
    if (k >= 0 && S2.reached(p, k)) {
      var dest = S2.done(p, k) && S2.reached(p, k + 1) && o.from != null && S2.isBoss(+o.from) ? k + 1 : k;
      if (dest !== k) { view = 'world'; render(); say(['s2_new_place', { text: S2.PLACES[dest].name + '!' }]); switchWorld(k, dest); }
      else { placeK = dest; view = 'place'; openPlace(placeK, true); }
    }
    else if (TOD() && S2.currentPlace(p) >= 0) { openPlace(S2.currentPlace(p), true); say([{ text: S2.PLACES[S2.currentPlace(p)].name + '!' }]); }
    else { view = 'world'; render(); say(['s2_world']); }
    if (o.from != null && S2.isBoss(+o.from) && S2.waiting(p)) say(['s2_tomorrow']);
    A.Store.save();
    var chain = Promise.resolve();
    if (A.StoryBook && !A.StoryBook.seen(p)) chain = chain.then(function () { return A.StoryBook.maybeAuto(p); });
    chain.then(askNew);
    return new Promise(function (res) { resolveFn = res; });
  }
  /* Art boss panels: explicit buttons, optional narration, keyboard/touch parity. Locked art is never composited with a face. */
  function bossPanel(o) {
    return new Promise(function (resolve) {
      var prior = document.activeElement;
      var cls = 'overlay on s2-story' + (o.cls ? ' ' + o.cls : '');
      var btns = o.buttons.map(function (b) {
        var hit = (b[0] === 'next' || b[0] === 'retry' || b[0] === 'rematch' || b[0] === 'skip' || b[0] === 'map') ? ' s2-hit' : '';
        var go = (b[0] === 'next' || b[0] === 'retry' || b[0] === 'rematch') ? ' s2-go' : (b[0] === 'skip' ? ' s2-skip' : '');
        return '<button class="bigbtn' + go + hit + '" data-action="' + b[0] + '">' + A.esc(b[1]) + '</button>';
      }).join('');
      var ov = A.el('<div class="' + cls + '" role="dialog" aria-modal="true" aria-label="' + A.esc(o.title) + '"><div class="s2-story-card"><h2>' + A.esc(o.silTitle || o.title) + '</h2>' + o.art + '<p>' + A.esc(o.text) + '</p><div class="s2-story-actions">' + btns + '<button class="s2-read s2-hit" data-action="read">Hear again</button></div></div></div>');
      var done = false, unveiled = !o.reveal || reduceMotion(), revealTimer = 0;
      function setTitle(s) { var h = ov.querySelector('h2'); if (h) h.textContent = s; ov.setAttribute('aria-label', s); }
      function unveil() {
        if (unveiled) return;
        unveiled = true;
        if (revealTimer) { clearTimeout(revealTimer); revealTimer = 0; }
        ov.classList.remove('is-sil'); ov.classList.add('is-on');
        if (o.title) setTitle(o.title);
        A.StoryMap2.revealState = 'on';
        requestAnimationFrame(function () { fitFaceoff(ov); });
        var go = ov.querySelector('.s2-go'); if (go) go.focus();
        read();
      }
      function read() { V.stop(); say([{ text: (unveiled ? o.title : (o.silTitle || o.title)) + '. ' + o.text }], 'name'); }
      function finish(value) { if (done) return; done = true; unveiled = true; if (revealTimer) { clearTimeout(revealTimer); revealTimer = 0; } V.stop(); if (o.reveal) A.StoryMap2.revealState = null; document.removeEventListener('keydown', key, true); ov.remove(); UI.cardOpen = !!document.querySelector('.overlay.on'); if (prior && prior.isConnected) prior.focus({ preventScroll: true }); resolve(value); }
      function key(e) {
        if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); return finish(o.buttons.some(function (b) { return b[0] === 'skip'; }) ? 'skip' : o.buttons.some(function (b) { return b[0] === 'map'; }) ? 'map' : o.buttons[0][0]); }
        if (e.key === 'Tab') { var bs = A.$$('button', ov), at = bs.indexOf(document.activeElement); e.preventDefault(); e.stopImmediatePropagation(); bs[(at + (e.shiftKey ? bs.length - 1 : 1)) % bs.length].focus(); }
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat && document.activeElement && ov.contains(document.activeElement)) document.activeElement.click(); }
      }
      ov.addEventListener('click', function (e) {
        var b = e.target.closest('[data-action]');
        if (b) {
          if (b.dataset.action === 'read') { if (o.reveal && !unveiled) unveil(); else read(); return; }
          if (o.reveal && !unveiled && b.dataset.action !== 'skip') { unveil(); return; }
          finish(b.dataset.action);
          return;
        }
        if (o.reveal && !unveiled) unveil();
      });
      if (o.reveal && !reduceMotion()) {
        ov.classList.add('is-sil'); A.StoryMap2.revealState = 'sil';
        revealTimer = setTimeout(unveil, REVEAL_MS);
      } else if (o.reveal) { ov.classList.add('is-on'); A.StoryMap2.revealState = 'on'; }
      document.body.appendChild(ov); UI.cardOpen = true; document.addEventListener('keydown', key, true);
      if (ov.classList.contains('is-on')) requestAnimationFrame(function () { fitFaceoff(ov); });
      var focusBtn = ov.querySelector(o.reveal && !unveiled ? '.s2-skip' : 'button'); if (focusBtn) focusBtn.focus();
      if (!o.reveal || reduceMotion()) read();
    });
  }
  function sceneArt(pl, which, freed) {
    var html = '<div class="s2-scene"><img alt="' + (which === 'locked_scene' ? 'A friend waits as a faceless silhouette' : 'The way is open') + '" src="' + S2.artURL(pl, which) + '">';
    if (freed) { var q = pl.art.freedSlot; html += '<img class="s2-freed" alt="' + A.esc(S2.heroName(pl.art.friend)) + '" src="' + img(pl.art.friend, 'happy') + '" style="left:' + (q.x / 16) + '%;top:' + ((q.ground_y - q.h) / 10) + '%;width:' + (q.w / 16) + '%;height:' + (q.h / 10) + '%">'; }
    return html + '</div>';
  }
  function faceoffArt(pl, heroId) {
    var o = (A.StoryArt && A.StoryArt.orient()) || 'portrait';
    var pack = A.StoryArt && A.StoryArt.face(pl.id, o);
    var src = A.StoryArt ? A.StoryArt.faceoffURL(pl.id, o) : S2.artURL(pl, 'portrait');
    var heroStyle = '';
    if (pack && pack.hero && pack.size) {
      var W = pack.size[0], H = pack.size[1], h = pack.hero, b = pack.boss;
      var ground = h.ground_y != null ? h.ground_y : h.anchor[1];
      var rec = h.recommended_height || (h.bbox && h.bbox[3]) || 340;
      var ax0 = h.anchor[0], VIS = 0.4, margin = W * 0.025;
      var bossLeft = (b && b.bbox) ? b.bbox[0] : W * 0.55;
      var bossH = (b && (b.height || (b.bbox && b.bbox[3]))) || rec * 1.2;
      var maxH = Math.min(rec * 1.2, ground - H * 0.06, bossH);
      var preferGap = Math.max(rec * 0.16, W * 0.04), minGap = Math.max(32, W * 0.035);
      function fit(sz, g) {
        var a = Math.min(ax0, bossLeft - g - VIS * sz);
        if (a < VIS * sz + margin) { sz = (bossLeft - g - margin) / (2 * VIS); a = VIS * sz + margin; }
        return { a: a, s: sz };
      }
      var p = fit(maxH, preferGap);
      if (p.s < rec) p = fit(maxH, minGap);
      if (p.s < rec) p = fit(rec, minGap);
      heroStyle = 'left:' + (p.a / W * 100) + '%;top:' + (ground / H * 100) + '%;height:' + (Math.max(p.s, 80) / H * 100) + '%';
    }
    return '<div class="s2-faceoff" data-orient="' + o + '" data-place="' + pl.id + '">' +
      '<img class="s2-faceoff-bg" alt="" src="' + src + '">' +
      '<img class="s2-faceoff-hero" alt="" src="' + img(heroId, 'happy') + '" style="' + heroStyle + '"></div>';
  }
  function revealArt(pl, heroId, rematch) {
    // rematch and win keep the existing portrait / defeat flow
    if (rematch) return '<img class="s2-portrait" alt="' + A.esc(pl.boss) + ' is ready for a rematch" src="' + S2.artURL(pl, 'portrait_rematch') + '"><div class="s2-vs"><img class="s2-reveal-hero" alt="" src="' + img(heroId, 'happy') + '"><img class="s2-reveal-boss" alt="' + A.esc(pl.boss) + '" src="' + S2.artURL(pl, 'portrait_rematch') + '"></div>';
    var sil = A.StoryArt ? A.StoryArt.silhouetteURL(pl.id) : S2.artURL(pl, 'locked_scene');
    return '<div class="s2-reveal-frame">' +
      '<div class="s2-sil-wrap"><img class="s2-reveal-sil" alt="A silhouette is waiting" src="' + sil + '"></div>' +
      faceoffArt(pl, heroId) +
      '</div>';
  }
  function encounter(p, i) {
    var k = S2.placeOfStop(i), pl = S2.PLACES[k], rematch = S2.bossBeaten(p, k), heroId = S2.hero(p);
    if (rematch) {
      return bossPanel({ cls: 's2-reveal s2-reveal-on s2-rematch', title: 'Rematch: ' + pl.boss,
        art: revealArt(pl, heroId, true),
        text: pl.boss + ' is ready to play again! Same skills, a few more snacks. Take your time.',
        buttons: [['next', 'Go']] });
    }
    return bossPanel({ cls: 's2-reveal', reveal: true, silTitle: 'Look!', title: pl.boss,
      art: revealArt(pl, heroId, false),
      text: 'A picnic friend is waiting. Take your time, then tap Go!',
      buttons: [['next', 'Go'], ['skip', 'Skip']] });
  }
  function retryBoss(p, i) {
    var pl = S2.PLACES[S2.placeOfStop(i)];
    return bossPanel({ title: 'Nice try with ' + pl.boss + '!', art: '<img class="s2-portrait" alt="' + pl.boss + '" src="' + S2.artURL(pl, S2.bossBeaten(p, pl.ix) ? 'portrait_rematch' : 'portrait') + '">',
      text: 'Every try is practice. Play again or explore the map!', buttons: [['retry', 'Try again'], ['map', 'Back to map']] });
  }
  function victory(p, i, rescue) {
    var pl = S2.PLACES[S2.placeOfStop(i)], name = S2.heroName(pl.art.friend), chain = Promise.resolve();
    if (rescue.first) {
      chain = bossPanel({ cls: 's2-win', title: pl.boss + ' steps aside!', art: sceneArt(pl, 'defeat'), text: 'You did it! The way is open. Our picnic friend can come out!', buttons: [['next', 'Continue']] }).then(function () {
        if (rescue.fresh) return A.Rewards.celebrateRescue(p, rescue.friend);
        return bossPanel({ cls: 's2-win', title: name + ' is safe!', art: sceneArt(pl, 'defeat', true), text: name + ' is safe and says thanks!', buttons: [['next', 'Hooray!']] });
      });
    }
    return chain.then(function () { return bossPanel({ cls: 's2-win', title: rescue.first ? 'Back together!' : 'You did it!', art: sceneArt(pl, 'defeat', true),
      text: name + ' is safe. Play ' + pl.boss + ' again or explore the map.', buttons: [['map', 'Back to map'], ['rematch', 'Rematch']] }); });
  }
  function resumeZoom() { var f = A.StoryMap2._resume; A.StoryMap2._resume = null; if (f) f(); }
  A.StoryMap2 = { retryBoss: retryBoss, encounter: encounter, victory: victory, open: open, close: close, isOpen: isOpen, render: function () { render(); }, openPlace: openPlace, friendPanel: friendPanel, back: back, choose: choose, sound: sound, view: function () { return view; }, place: function () { return placeK; }, lastSound: null, lastPlace: null, lastSwitch: null, lastZoom: null, lastZoomPhase: null, revealState: null, _resume: null, zooming: function () { return zooming; }, zoomIntoPlace: function (k, o) { return zoomIntoPlace(k, o); }, switchWorld: function (a, b, o) { return switchWorld(a, b, o); }, resumeZoom: resumeZoom, reduceMotion: reduceMotion };
})(window.Arcade);
