/* Picnic Pals — Story mode v2 maps (story2). A.StoryMap2.open(profile, {from, to}) resolves with the stop index to play
   (same contract as A.MunchMap.open). World map: only the places reached so far (the rest is fog, no names, no icons).
   Place map: that place's levels on a little trail, the mini boss last, themed art (CSS + emoji), a guide who hops you along,
   tap the scenery for its sound. Your friend is the hero (Friend button: switch any time; each friend keeps their own story).
   Keys: ←/→ move · Enter/Space play/open · Esc back (place → world → menu) · F friend · B book. */
(function (A) {
  'use strict';
  var S2 = A.Story2, ST = A.Story, V = A.Voice, UI = A.UI;
  var P = null, resolveFn = null, view = 'world', placeK = 0, sel = 0, root = null, busy = false;
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

  function build() {
    root = A.el('<section class="s2" id="s2map" aria-label="Story map"><div class="s2-top"><button class="s2-back" id="s2Back" aria-label="Back">◀</button>' +
      '<div class="s2-title" id="s2Title"></div><button class="s2-book" id="s2Book" aria-label="Read the story book">📖</button>' +
      '<button class="s2-hero" id="s2Hero" aria-label="Switch friend"><img alt=""><span class="nm"></span><span class="sw">🔄 Friend</span></button></div>' +
      '<div class="s2-stage" id="s2Stage"></div></section>');
    document.body.appendChild(root);
    root.querySelector('#s2Back').addEventListener('click', back);
    root.querySelector('#s2Hero').addEventListener('click', function () { if (!busy) friendPanel(); });
    root.querySelector('#s2Book').addEventListener('click', function () { if (!busy && A.StoryBook) { V.stop(); A.StoryBook.open(P); } });
    document.addEventListener('keydown', onKey, true);
  }
  function isOpen() { return !!root && root.classList.contains('on'); }
  function heroChip() { var h = S2.hero(P), b = root.querySelector('#s2Hero'); b.querySelector('img').src = img(h); b.querySelector('.nm').textContent = S2.heroName(h); b.dataset.hero = h; }
  function render() {
    heroChip(); var stg = root.querySelector('#s2Stage'); stg.innerHTML = ''; root.dataset.view = view;
    if (view === 'world') return renderWorld(stg);
    renderPlace(stg);
  }
  function renderWorld(stg) {
    var R = S2.reachedList(P), cur = S2.currentPlace(P); root.querySelector('#s2Title').textContent = '🗺️ Picnic World'; root.style.removeProperty('--s2a'); root.style.removeProperty('--s2b'); root.dataset.place = '';
    var svg = '<svg class="s2-trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="' + R.map(function (k) { return WXY[k].join(','); }).join(' ') + '"/></svg>';
    stg.insertAdjacentHTML('beforeend', svg);
    R.forEach(function (k, j) { var pl = S2.PLACES[k], pr = S2.progress(P, k), b = A.el('<button class="s2-place' + (k === cur ? ' cur' : '') + (S2.done(P, k) ? ' done' : '') + '" data-k="' + k + '" style="left:' + WXY[k][0] + '%;top:' + WXY[k][1] + '%;--a:' + pl.theme[0] + ';--b:' + pl.theme[1] + '">' +
      '<span class="em">' + pl.emoji + '</span><span class="nm">' + A.esc(pl.name) + '</span><span class="pr">' + '⭐'.repeat(Math.min(pr.n, 6)) + '<i>' + pr.n + '/' + pr.of + '</i></span></button>');
      b.addEventListener('click', function () { if (!busy) openPlace(k); }); stg.appendChild(b); });
    var nx = R[R.length - 1] + 1; if (nx < S2.PLACES.length) { var f = A.el('<div class="s2-fog" aria-hidden="true" style="left:' + WXY[nx][0] + '%;top:' + WXY[nx][1] + '%"><span>☁️</span><span>☁️</span><span>☁️</span></div>'); stg.appendChild(f); }
    if (S2.waiting(P)) stg.appendChild(A.el('<div class="s2-note">🌙 A new path opens next time. Replay a place or pick a friend!</div>'));
    var hx = WXY[cur]; stg.appendChild(A.el('<img class="s2-me" alt="" src="' + img(S2.hero(P), 'happy') + '" style="left:' + hx[0] + '%;top:' + (hx[1] - 11) + '%">'));
    sel = Math.max(0, R.indexOf(cur)); focusSel();
  }
  function renderPlace(stg) {
    var k = placeK, pl = S2.PLACES[k], L = S2.levels(P, k), cur = S2.current(P, k);
    root.querySelector('#s2Title').textContent = pl.emoji + ' ' + pl.name; root.style.setProperty('--s2a', pl.theme[0]); root.style.setProperty('--s2b', pl.theme[1]); root.dataset.place = pl.id;
    pl.deco.forEach(function (d, j) { var e = A.el('<button class="s2-deco" aria-label="scenery" style="left:' + (6 + j * 16 + (j % 2) * 4) + '%;top:' + (j % 2 ? 84 : 14 + (j % 3) * 4) + '%;animation-delay:' + (j * .7) + 's">' + d + '</button>');
      e.addEventListener('click', function () { e.classList.remove('wig'); void e.offsetWidth; e.classList.add('wig'); sound(pl.sound); }); stg.appendChild(e); });
    var xy = L.map(function (i, j) { return j === L.length - 1 ? [Math.min(90, LXY[j][0] + (L.length < 4 ? 30 : 0)), L.length < 4 ? 40 : LXY[j][1]] : (L.length < 4 ? [16 + j * 26, j % 2 ? 50 : 66] : LXY[j]); });
    stg.insertAdjacentHTML('beforeend', '<svg class="s2-trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="' + xy.map(function (q) { return q.join(','); }).join(' ') + '"/></svg>');
    L.forEach(function (i, j) {
      var boss = S2.isBoss(i), ok = S2.playable(P, i), pass = S2.passed(P, i), r = ST.stopInfo(P, i) || {}, g = ST.gameOf(P, i), gi = ST.GAMES[g] ? ST.GAMES[g].icon : '';
      var b = A.el('<button class="s2-lv' + (boss ? ' boss' : '') + (i === cur ? ' cur' : '') + (pass ? ' pass' : '') + (ok ? '' : ' off') + '" data-i="' + i + '" style="left:' + xy[j][0] + '%;top:' + xy[j][1] + '%"' + (ok ? '' : ' aria-disabled="true"') + '>' +
        '<span class="n">' + (boss ? '👑' : (j + 1)) + '</span>' + (ok && !boss ? '<span class="g">' + gi + '</span>' : '') + (pass ? '<span class="st">' + '⭐'.repeat(Math.max(1, Math.min(3, r.stars || 1))) + '</span>' : '') +
        (boss ? '<span class="bl">Mini boss</span>' : '') + '</button>');
      b.addEventListener('click', function () { if (busy) return; if (!ok) { sound('pop'); b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); return; } choose(i); });
      stg.appendChild(b);
    });
    var cj = Math.max(0, L.indexOf(cur)), cx = xy[cj];
    stg.appendChild(A.el('<img class="s2-me" alt="" src="' + img(S2.hero(P), 'happy') + '" style="left:' + cx[0] + '%;top:' + (cx[1] - 13) + '%">'));
    stg.appendChild(A.el('<div class="s2-guide" aria-hidden="true" style="left:' + (cx[0] + 7) + '%;top:' + (cx[1] - 4) + '%">' + pl.guide + '</div>'));
    sel = cj; focusSel();
  }
  function items() { return A.$$(view === 'world' ? '.s2-place' : '.s2-lv', root); }
  function focusSel() { var it = items(); it.forEach(function (b, j) { b.classList.toggle('sel', j === sel); }); }
  function openPlace(k, quiet) {
    placeK = k; view = 'place'; sound(S2.PLACES[k].sound); render();
    var m = S2.meta(P), seenKey = S2.hero(P) + ':' + S2.PLACES[k].id, sd = ST.data(P); sd.seen = sd.seen || {};
    if (!quiet) { var first = !sd.seen['place2:' + S2.PLACES[k].id]; sd.seen['place2:' + S2.PLACES[k].id] = Date.now(); A.Store.save();
      say(['s2_place_' + S2.PLACES[k].id].concat(first ? [{ id: 's2_tag_' + (S2.FLAVOR[S2.hero(P)] ? S2.hero(P) : 'other'), text: S2.flavor(P).tag }] : [])); }
    A.StoryMap2.lastPlace = k; void m; void seenKey;
  }
  function choose(i) {
    busy = true; sound('pop'); var boss = S2.isBoss(i), pl = S2.PLACES[S2.placeOfStop(i)];
    var go = function () { busy = false; close(); var f = resolveFn; resolveFn = null; if (f) f(i); };
    if (!boss) return go();
    // the mini boss: a bigger fun challenge, never scary, no pressure (any result is fine; try again any time)
    UI.card({ cls: 'storycard s2boss', tag: pl.emoji + ' ' + pl.name, title: 'Mini boss: ' + pl.boss + '!', art: '<div class="jump"><img src="' + img(S2.hero(P), 'happy') + '" alt="" style="width:150px"></div><div class="s2-bossart">' + pl.bossEmoji + '</div>',
      sub: 'A big, fun challenge. ' + S2.flavor(P).boss + ' Take your time.', btn: "Let's try ▶", voice: ['s2_boss', { id: 's2_bosscheer_' + (S2.FLAVOR[S2.hero(P)] ? S2.hero(P) : 'other'), text: S2.flavor(P).boss }], minMs: 500 }).then(go);
  }
  function back() {
    if (busy) return; sound('pop'); V.stop();
    if (view === 'place' && !TOD()) { view = 'world'; render(); return; }   // toddlers: back goes straight home
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
  function close() { if (root) root.classList.remove('on'); }
  function TOD() { return !!(P && A.toddler && A.toddler(P)); }   // toddler mode: straight to the current place, big buttons
  function open(p, o) {
    o = o || {}; P = p; S2.migrate(p); if (!root) build(); busy = false; root.classList.toggle('s2-tod', TOD());
    var sd = ST.data(p); sd.seen = sd.seen || {}; sd.seen.prologue = sd.seen.prologue || Date.now();   // the picture book is the prologue in v2
    root.classList.add('on'); var to = o.to != null ? +o.to : null, k = to != null ? S2.placeOfStop(to) : -1;
    if (k >= 0 && S2.reached(p, k)) { placeK = S2.done(p, k) && S2.reached(p, k + 1) && o.from != null && S2.isBoss(+o.from) ? k + 1 : k; view = 'place'; openPlace(placeK, true); if (placeK !== k) say(['s2_new_place', 's2_place_' + S2.PLACES[placeK].id]); }
    else if (TOD() && S2.currentPlace(p) >= 0) { openPlace(S2.currentPlace(p), true); say(['s2_place_' + S2.PLACES[S2.currentPlace(p)].id]); }
    else { view = 'world'; render(); say(['s2_world']); }
    if (o.from != null && S2.isBoss(+o.from) && S2.waiting(p)) say(['s2_tomorrow']);
    A.Store.save();
    var chain = Promise.resolve();
    if (A.StoryBook && !A.StoryBook.seen(p)) chain = chain.then(function () { return A.StoryBook.maybeAuto(p); });
    chain.then(askNew);
    return new Promise(function (res) { resolveFn = res; });
  }
  A.StoryMap2 = { open: open, close: close, isOpen: isOpen, render: function () { render(); }, openPlace: openPlace, friendPanel: friendPanel, back: back, choose: choose, sound: sound, view: function () { return view; }, place: function () { return placeK; }, lastSound: null, lastPlace: null, lastSwitch: null };
})(window.Arcade);
