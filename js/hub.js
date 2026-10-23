/* Picnic Pals (was Blob Arcade) — hub: who's playing, game picker, sticker book, friend collection, dress up. */
(function (A) {
  'use strict';
  var $ = A.$, B = A.Blobs, R = A.Rewards;
  A.UI.boot();
  var me = null, editing = false;

  // games registry: future games plug in here
  var GAMES = [
    { id: 'tiny', name: 'Tiny Picnic', sub: 'Find, tap and giggle', cls: 'tiny', href: 'games/tiny/index.html', ready: true, toddler: true, voice: ['tp_title'], say: ['tp_title'], tip: 'Tap the picture that matches. Big pictures, no wrong answers!' },
    { id: 'munch', name: A.TITLES.munch, sub: 'Number munching math', cls: 'munch', href: 'games/munch/index.html', ready: true, voice: ['hub_lets_go'], say: ['munch_title'], tip: 'Walk around the picnic and munch the right answers. Math and words!' },
    { id: 'baseball', name: A.TITLES.baseball, sub: 'Math at the ballpark', cls: 'base', href: 'games/baseball/index.html', ready: true, voice: ['bb_play_ball'], say: ['bb_title'], tip: 'Beat the Sprout Squad! Right answers are hits, misses are outs. Score more runs to win.' },
    { id: 'room', name: A.TITLES.room, sub: 'Decorate & picnic friends', cls: 'room', href: 'games/room/index.html', ready: true, voice: ['rm_title'], say: ['rm_title'], tip: 'Your own picnic spot. Buy fun things with star bits and decorate!' },
    // design1 (2026-10-22): no "Coming soon" tiles (Penalty Kicks, Sight Words): only games that are ready are shown
  ];

  // "Hi, <name>!" is spoken by the browser voice (names have no clips); without one: "Welcome back!"
  function greet(p, tail, without) { return A.Voice.named(['hub_hi', A.Voice.name(p)], without.slice(0, 1)); }   // 2026-10-22 voice: short intro (no "What do you want to play?" tail)

  /* ---------- scenes for tiles ---------- */
  function scene(g, p) {
    if (g.id === 'tiny') {   // big, simple: three food friends on the picnic blanket
      var R0 = A.ROOT + 'assets/picnic/friends/';
      return '<div class="tinysc">' + ['strawberry', 'banana', 'blueberry'].map(function (id) { return '<img src="' + R0 + id + '/happy_256.webp" alt="" draggable="false">'; }).join('') + '</div>' +
        '<div class="who2">' + B.forProfile(p, { expr: 'happy' }) + '</div>';
    }
    if (g.id === 'munch') {
      var cells = [[8, 10, '7', '#fff6cf'], [72, 8, '3+4', '#d4f7e8'], [6, 56, '5', '#dcefff'], [78, 54, '9', '#ffd6e3']];
      return '<svg class="sc" viewBox="0 0 100 75">' + cells.map(function (c) { return '<g transform="translate(' + c[0] + ' ' + c[1] + ') rotate(' + (c[0] > 50 ? 8 : -8) + ')"><rect width="20" height="16" rx="4" fill="' + c[3] + '" stroke="#fff" stroke-width="1.5"/><text x="10" y="11.5" font-size="' + (c[2].length > 1 ? 5.6 : 9) + '" text-anchor="middle" fill="#4a3b6b" font-weight="700" font-family="sans-serif">' + c[2] + '</text></g>'; }).join('') + '</svg>' +
        '<div class="who2 chomp-loop">' + B.forProfile(p, { expr: 'chomp' }) + '</div>';
    }
    if (g.id === 'baseball') {
      return '<svg class="sc" viewBox="0 0 100 75"><path d="M0 60 Q50 46 100 60 V75 H0Z" fill="#9fe0a8"/><path d="M50 50 L66 60 L50 70 L34 60Z" fill="#f2d6a2"/><rect x="47" y="58" width="6" height="4" fill="#fff"/>' +
        '<g transform="translate(80 18) rotate(20)"><circle r="7" fill="#fff" stroke="#ddd" stroke-width="1"/><path d="M-4 -5 Q-1 0 -4 5 M4 -5 Q1 0 4 5" stroke="#ff5a6e" stroke-width="1.1" fill="none"/></g>' +
        '</svg><div class="who2">' + B.forProfile(p, { outfit: 'helmet', expr: 'bat' }) + '</div>';
    }
    if (g.id === 'room') {
      // the Picnic Spot scene (same painted room as games/room) with the blanket, basket and parasol
      return '<svg class="sc" viewBox="0 0 100 75" preserveAspectRatio="xMidYMid slice"><image href="assets/picnic/room/room_bg_tile.webp" x="-10" y="0" width="120" height="75" preserveAspectRatio="none"/>' +
        '<image href="assets/picnic/room/picnic_blanket.webp" x="22" y="52" width="56" height="24"/><image href="assets/picnic/room/parasol.webp" x="2" y="22" width="30" height="37"/>' +
        '<image href="assets/picnic/room/picnic_basket.webp" x="76" y="44" width="20" height="18"/></svg>' +
        '<div class="who2">' + B.forProfile(p, { expr: 'love' }) + '</div><span class="bitchip">✦ ' + ((p.wallet && p.wallet.bits) || 0) + '</span>';
    }
    if (g.id === 'kicks') {
      var net = ''; for (var i = 0; i <= 10; i++) net += '<path d="M' + (14 + i * 7.2) + ' 10 V44" stroke="#fff" stroke-width=".7" opacity=".8"/>';
      for (var j = 0; j <= 5; j++) net += '<path d="M14 ' + (10 + j * 6.8) + ' H86" stroke="#fff" stroke-width=".7" opacity=".8"/>';
      return '<svg class="sc" viewBox="0 0 100 75"><path d="M0 44 H100 V75 H0Z" fill="#8fdc9e"/>' + net + '<path d="M12 46 V8 H88 V46" stroke="#fff" stroke-width="3" fill="none" stroke-linejoin="round"/>' +
        '<g transform="translate(82 64)"><circle r="7" fill="#fff" stroke="#4a3b6b" stroke-width="1"/><path d="M0 -3 L3 -1 L2 3 L-2 3 L-3 -1Z" fill="#4a3b6b"/></g></svg><div class="who2">' + B.svg({ blob: 'corn', outfit: 'cap', expr: 'kick' }) + '</div>';
    }
    return '<svg class="sc" viewBox="0 0 100 75"><g transform="translate(64 10) rotate(10)"><rect width="30" height="22" rx="4" fill="#fff" stroke="#c9b2ff" stroke-width="1.5"/><text x="15" y="15.5" font-size="11" text-anchor="middle" fill="#4a3b6b" font-weight="700" font-family="sans-serif">the</text></g>' +
      '<g transform="translate(6 14) rotate(-10)"><rect width="26" height="20" rx="4" fill="#fff" stroke="#ff9fc0" stroke-width="1.5"/><text x="13" y="14" font-size="10" text-anchor="middle" fill="#4a3b6b" font-weight="700" font-family="sans-serif">see</text></g></svg>' +
      '<div class="who2">' + B.svg({ blob: 'blueberry', outfit: 'flower', expr: 'think' }) + '</div>';
  }

  /* ---------- screens ---------- */
  function show(id) {
    A.$$('.screen').forEach(function (s) { s.classList.toggle('on', s.id === id); });
    if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    var first = A.$('#' + id + ' [data-nav], #' + id + ' .kid, #' + id + ' .tile');
    setTimeout(function () { if (first && !A.Parent.isOpen()) try { first.focus({ preventScroll: true }); } catch (e) {} }, 30);
  }

  function renderPlayers() {
    // the Picnic Pals logo image is in index.html (#ppLogo)
    var who = $('#who'); who.innerHTML = ''; who.classList.toggle('editing', editing);
    // big "Continue" for the last player on this device: one tap straight to their games
    var cw = $('#contWrap'), last = !editing && A.Store.last && A.Store.last(); cw.innerHTML = '';
    if (last) {
      var cb = A.el('<button class="contbtn" data-nav id="contBtn"><span class="ca bd" style="' + B.backdrop(last.color) + '">' + B.forProfile(last, { expr: 'happy' }) + '</span><span class="ct"><b>▶ Continue</b><small>' + A.esc(last.name) + ' · ⭐ ' + last.stars + '</small></span></button>');
      cb.setAttribute('aria-label', 'Continue as ' + last.name);
      cb.addEventListener('click', function () { A.Audio.sfx('pop'); A.Store.setActive(last.id); go('games'); A.Voice.say(greet(last, 'hub_continue', ['hub_welcome_back', 'hub_continue'])); });
      cb._say = [{ text: 'Continue, ' + last.name }];
      cw.appendChild(cb);
    }
    A.Store.profiles().forEach(function (p) {
      var sv = saveInfo(p);
      var b = A.el('<button class="kid save" data-nav data-id="' + p.id + '"><span class="av bd" style="' + B.backdrop(p.color) + '">' + B.forProfile(p) + '</span><span class="nm">' + A.esc(p.name) + '</span><span class="st">⭐ ' + p.stars + '</span>' +
        '<span class="sv"><span class="svl" data-k="math">🔢 ' + A.esc(sv.math) + '</span><span class="svl" data-k="reading">📖 ' + A.esc(sv.reading) + '</span>' +
        '<span class="svl" data-k="story">🗺️ ' + A.esc(sv.story) + '</span><span class="svl" data-k="friends">💛 ' + sv.friends + ' friend' + (sv.friends === 1 ? '' : 's') + '</span>' +
        (sv.goal ? '<span class="svg2" data-k="goal"><span class="gt2">' + sv.goal.icon + ' ' + A.esc(sv.goal.name) + ' ' + sv.goal.have + '/' + sv.goal.need + '</span><span class="gb"><i style="width:' + sv.goal.pct + '%"></i></span></span>' : '') + '</span>' +
        '<span class="del" aria-hidden="true">✏️ Edit</span></button>');
      b.setAttribute('aria-label', editing ? 'Edit ' + p.name : p.name + ', ' + p.stars + ' stars. ' + sv.say);
      b.addEventListener('click', function () {
        if (editing) { editPlayer(p); return; }
        A.Blobs.anim(b, 'jump', 600); A.Audio.sfx('pop'); A.Store.setActive(p.id); setTimeout(function () { go('games'); A.Voice.say(greet(p, 'hub_pick_game', ['hub_welcome_back', 'hub_pick_game'])); }, 260);
      });
      b.addEventListener('pointerenter', function () { A.Blobs.anim(b, 'squish', 420); });
      b._say = [{ text: editing ? 'Edit ' + p.name : p.name }];
      who.appendChild(b);
    });
    if (!editing) {
      var add = A.el('<button class="kid add" data-nav id="addKid" aria-label="Make a new player"><span class="av"><span class="addplus" aria-hidden="true"><svg viewBox="0 0 100 100"><path d="M50 18 V82 M18 50 H82" stroke="currentColor" stroke-width="16" stroke-linecap="round"/></svg></span></span><span class="nm">New player</span><span class="st">Pick your food friend</span></button>');
      add.addEventListener('click', function () { A.Audio.sfx('pop'); openNew(); }); add._say = [{ text: 'New player' }];
      who.appendChild(add);
    }
    var eb = $('#editKids'); eb.textContent = editing ? '✓ Done editing' : '🔒 Edit players'; eb.setAttribute('aria-pressed', editing ? 'true' : 'false'); eb.classList.toggle('on', editing);
    eb.style.display = A.Store.profiles().length ? '' : 'none';
    $('#whoHint').textContent = editing ? 'Grown-ups: pick a player to rename or delete, or press Done.' : A.isTouchOnly() ? '' : 'Use the arrow keys and Enter, or click your friend!';
  }

  // what a player's save slot shows: levels, story, friends, next goal
  function saveInfo(p) {
    var C = A.Curriculum, cur = function (subj) { try { if (!C.list(subj).length) return ''; var sk = C.current(p, subj); return sk ? sk.name : 'All done!'; } catch (e) { return ''; } };
    var ST = A.Story, sd = ST.data(p), stopN = 0; Object.keys(sd.stops || {}).forEach(function (k) { var i = +k.split(':')[1]; if (sd.stops[k].passed && !sd.stops[k].placed && !ST.isSide(i)) stopN++; });
    var at = ST.STOPS[ST.unlockedTo(p)], story = sd.finished ? 'Story finished!' : stopN ? at.area.name + ' · ' + stopN + ' stops' : 'Story not started';
    var x = R.stats(p), g = weekGoal(p), m = cur('math') || '—', rd = cur('reading') || '—';
    return { math: m, reading: rd, story: story, friends: x.friends, friendsAll: x.friendsAll, goal: g,
      say: 'Math: ' + m + '. Reading: ' + rd + '. ' + story + '. ' + x.friends + ' friend' + (x.friends === 1 ? '' : 's') + '.' + (g ? ' ' + g.name + ', ' + g.have + ' of ' + g.need + '.' : '') };
  }
  // design1: the only goal bar left is the weekly play-days goal (about playing, never about a prize or a friend to unlock)
  function weekGoal(p) { var W = (R.CONFIG && R.CONFIG.weekly) || { days: 3 }, have = Math.min(R.weekDays ? R.weekDays(p) : (R.stats(p).weekDays || 0), W.days);
    return { id: 'week', icon: '📅', name: 'Play days this week', have: have, need: W.days, pct: Math.round(100 * have / W.days), done: have >= W.days }; }
  // Edit players (rename / delete) is behind the grown-up gate; delete asks the grown-up again
  function editPlayer(p) {
    A.Audio.sfx('tap'); A.UI.cardOpen = true;
    var ov = A.el('<div class="overlay on confirm editp" id="editP" role="dialog" aria-modal="true"><div class="card"><div class="art">' + B.forProfile(p, { expr: 'happy' }) + '</div>' +
      '<h2>Edit ' + A.esc(p.name) + '</h2><label class="nkl small" for="epName">Name</label><input id="epName" class="nkin" maxlength="16" autocomplete="off" spellcheck="false" value="' + A.esc(p.name) + '">' +
      '<div class="row2"><button class="bigbtn mint" data-save>✓ Save name</button><button class="bigbtn plain" data-done>Done</button></div>' +
      '<button class="pill dellink" data-del>Delete this player…</button></div></div>');
    document.body.appendChild(ov);
    var inp = ov.querySelector('#epName');
    function close(then) { document.removeEventListener('keydown', onKey, true); ov.remove(); A.UI.cardOpen = !!document.querySelector('.overlay.on'); if (then) then(); else { renderPlayers(); var f = A.$('#who .kid[data-id="' + p.id + '"]') || A.$('#who .kid'); if (f) f.focus({ preventScroll: true }); } }
    function saveName() { var nm = inp.value.trim().replace(/\s+/g, ' '); if (nm && nm !== p.name) { A.Store.rename(p.id, nm); A.UI.toast('Renamed to ' + nm); } close(); }
    function onKey(e) { e.stopPropagation(); if (e.key === 'Escape') { e.preventDefault(); close(); } else if (e.key === 'Enter' && e.target === inp) { e.preventDefault(); saveName(); } }
    document.addEventListener('keydown', onKey, true);
    ov.querySelector('[data-save]').addEventListener('click', saveName);
    ov.querySelector('[data-done]').addEventListener('click', function () { close(); });
    ov.querySelector('[data-del]').addEventListener('click', function () { close(function () { askDelete(p); }); });
    setTimeout(function () { try { inp.focus({ preventScroll: true }); } catch (e) {} }, 40);
  }
  function askDelete(p) {
    A.Audio.sfx('tap');
    A.UI.confirm({ title: 'Delete ' + p.name + '?', sub: p.name + "'s stars, stickers and progress will be gone from this device. This can't be undone. A grown-up needs to answer one more question.", art: '<div>' + B.forProfile(p, { expr: 'sad' }) + '</div>', yes: 'Delete for good', no: '✓ Keep ' + p.name, danger: true, yesSmall: true, cls: 'delconfirm' })
      .then(function (yes) { return yes ? A.UI.gate() : false; })
      .then(function (yes) {
        if (yes) { A.Store.remove(p.id); A.UI.toast(p.name + ' was deleted.'); if (!A.Store.profiles().length) editing = false; }
        renderPlayers(); var f = A.$('#who .kid'); if (f) f.focus({ preventScroll: true });
      });
  }
  /* ---------- new player: name, blob, color (+ optional age) ---------- */
  var nk = { blob: 'mochi', color: 'classic', age: null, levels: {} };
  var START_COLORS = ['classic', 'berry', 'mint', 'sunny', 'sky', 'grape', 'cocoa']; // a new player picks one starting color for free
  function openNew() {
    nk = { blob: A.pick(A.Store.STARTER_BLOBS), color: 'classic', age: null, levels: {} };
    $('#nkName').value = ''; renderNew(); show('newkid');
    function fx() { if (A.$('#newkid').classList.contains('on') && !A.Parent.isOpen()) $('#nkName').focus(); }
    setTimeout(fx, 60);
    if (document.readyState !== 'complete') window.addEventListener('load', function () { setTimeout(fx, 80); }, { once: true }); // first visit: the page finishing loading can drop focus
    A.Voice.say(['hub_new_player']);
  }
  function renderNew() {
    var nm = $('#nkName').value.trim();
    $('#nkPrev').innerHTML = B.svg({ blob: nk.blob, color: nk.color, expr: 'happy', hi: true }); $('#nkPrev').setAttribute('style', B.backdrop(nk.color)); $('#nkPrev').classList.add('bd'); $('#nkShow').textContent = nm || '?';
    function opts(box, items, kind) {
      box.innerHTML = '';
      items.forEach(function (it) {
        if (kind === 'blob' && A.Store.STARTER_BLOBS.indexOf(it.id) < 0) return;   // design1: no locked "???" friends to hint at
        if (false) {
          var lb = A.el('<button class="opt blocked" data-nav data-k="blob" data-v="' + it.id + '" aria-label="Locked friend"><span class="oa still">' + B.svg({ blob: it.id }) + '</span><span class="on2">???</span><span class="lock">🔒</span><span class="hintx">Master skills to meet</span></button>');
          lb.addEventListener('click', function () { lb.classList.remove('nudge'); void lb.offsetWidth; lb.classList.add('nudge'); A.Audio.sfx('locked'); A.Voice.say(['hub_locked_blob']); });
          box.appendChild(lb); return;
        }
        var sel = nk[kind] === it.id, art = kind === 'blob' ? B.svg({ blob: it.id }) : B.svg({ blob: nk.blob, color: it.id });
        var b = A.el('<button class="opt' + (sel ? ' sel' : '') + '" data-nav data-k="' + kind + '" data-v="' + it.id + '"><span class="oa still' + (kind === 'color' ? ' bd" style="' + B.backdrop(it.id) : '') + '">' + art + '</span><span class="on2">' + A.esc(it.name) + '</span></button>');
        b.addEventListener('click', function () { nk[kind] = it.id; A.Audio.sfx('pop'); renderNew(); A.Blobs.anim($('#nkPrev'), 'jump', 600);
          if (kind === 'blob') A.Voice.say(['hub_im', 'blob_' + it.id]); var f = A.$('#newkid .opt.sel[data-k="' + kind + '"]'); if (f) f.focus({ preventScroll: true }); });
        box.appendChild(b);
      });
    }
    opts($('#nkBlob'), B.CAST.filter(function (c) { return c.starter; }).concat(B.CAST.filter(function (c) { return !c.starter; }).slice(0, 2)), 'blob');
    opts($('#nkColor'), START_COLORS.map(function (id) { return B.colorById[id]; }), 'color');
    var lv = $('#nkLv'); if (lv && A.Levels) { lv.innerHTML = '';   // per-subject start levels (Auto = by age)
      [['math', 'Math'], ['reading', 'Reading'], ['concepts', 'Early Concepts']].forEach(function (x) {
        if (!A.Curriculum.list(x[0]).length) return;
        var cur = nk.levels[x[0]] || 'auto', opts = [['auto', 'Auto: ' + A.Levels.autoName({ age: nk.age }, x[0])]].concat(A.Levels.GRADES).concat(x[0] === 'concepts' ? [['off', 'Off']] : []);
        var sel = A.el('<label class="lvsel">' + x[1] + ' <select data-nav data-nklv="' + x[0] + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === cur ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label>');
        A.UI.tip(sel.querySelector('select'), { math: 'Where Math starts. Auto picks by age.', reading: 'Where Reading starts. Auto picks by age.', concepts: 'Colors and shapes. Auto picks by age, or turn them off.' }[x[0]], { name: x[1] + ' level' });
        sel.querySelector('select').addEventListener('change', function (e) { nk.levels[x[0]] = e.target.value; A.Audio.sfx('tap'); });
        lv.appendChild(sel);
      });
      var st = $('#nkStart'); if (st && A.Levels.ageText) st.textContent = 'Auto (by age): ' + (nk.age == null ? 'no age picked starts like age 5' : 'age ' + (nk.age >= 8 ? '8+' : nk.age) + ' starts at') + ' ' + A.Levels.ageText(nk.age) + '. A quick 5-question check fine-tunes it.'; }
    var ag = $('#nkAge'); ag.innerHTML = '';
    [null, 2, 3, 4, 5, 6, 7, 8].forEach(function (a) {
      var b = A.el('<button class="agechip' + (nk.age === a ? ' sel' : '') + '" data-nav>' + (a == null ? 'Skip' : a === 8 ? '8+' : a) + '</button>');
      A.UI.tip(b, a == null ? 'Skip the age. The games start like for a 5-year-old.' : (a === 2 ? 'Age 2: Tiny Picnic, with big pictures and no wrong answers.' : 'Age ' + (a === 8 ? '8 and up' : a) + ': starts at ' + (A.Levels && A.Levels.ageText ? A.Levels.ageText(a) : 'the right level') + '.'), { name: a == null ? 'Skip age' : 'Age ' + (a === 8 ? '8 and up' : a) });
      b.addEventListener('click', function () { nk.age = a; A.Audio.sfx('tap'); renderNew(); var f = A.$('#nkAge .sel'); if (f) f.focus({ preventScroll: true }); });
      ag.appendChild(b);
    });
  }
  function createNew() {
    var nm = $('#nkName').value.trim().replace(/\s+/g, ' ');
    if (!nm) { var i = $('#nkName'); i.classList.remove('nudge'); void i.offsetWidth; i.classList.add('nudge'); A.Audio.sfx('locked'); A.Voice.say(['hub_new_player']); i.focus(); return; }
    var p = A.Store.add(nm, nk.blob); p.color = nk.color; if (nk.color !== 'classic') p.unlocks.colors[nk.color] = Date.now(); p.age = nk.age; p.levels = Object.assign({}, nk.levels); p.flags.madeByKid = true; A.Store.startByAge(p);
    A.Store.setActive(p.id); A.Store.save(); A.Audio.sfx('unlock');
    go('games'); A.UI.rain(30); A.Voice.say(greet(p, 'hub_welcome', ['hub_welcome']));
  }
  $('#nkName').addEventListener('input', function () { $('#nkShow').textContent = $('#nkName').value.trim() || '?'; });
  $('#nkName').addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === 'ArrowDown') { e.preventDefault(); var f = A.$('#nkBlob .opt.sel') || A.$('#nkBlob .opt'); if (f) f.focus(); } e.stopPropagation(); if (e.key === 'Escape') go('players'); });
  $('#nkGo').addEventListener('click', createNew);
  $('#nkBack').addEventListener('click', function () { A.Audio.sfx('tap'); go('players'); });
  $('#editKids').addEventListener('click', function () {
    A.Audio.sfx('tap');
    function apply(on) { editing = on; renderPlayers(); var f = A.$('#who .kid'); if (f) f.focus({ preventScroll: true }); }
    if (editing) return apply(false);
    A.UI.gate().then(function (ok) { if (ok) apply(true); else { var e = $('#editKids'); if (e) e.focus({ preventScroll: true }); } });   // grown-ups only
  });

  function renderGames() {
    me = A.Store.active(); if (!me) return go('players');
    $('#meAv').innerHTML = B.forProfile(me); $('#meAv').setAttribute('style', B.backdrop(me.color)); $('#meAv').classList.add('bd'); $('#meHi').textContent = 'Hi, ' + me.name + '!'; $('#meStars').textContent = me.stars;
    // design1 (2026-10-22): no "Next friend" / "Next prize" bars (unlocks are a surprise). Only the weekly play-days goal stays.
    var gl = $('#goal'), lg = weekGoal(me), ng = $('#nextGoal');
    if (ng) { ng.innerHTML = '<div class="ngrow lg" aria-label="' + A.esc(lg.name) + ', ' + lg.have + ' of ' + lg.need + '"><span class="gi gic">' + lg.icon + '</span><span><span class="gt">' + A.esc(lg.name) + ' (' + lg.have + '/' + lg.need + ')</span><div class="gb"><i style="width:' + lg.pct + '%"></i></div></span></div>';
      var lgr = ng.querySelector('.lg'); if (lgr) { lgr.setAttribute('tabindex', '-1'); A.UI.tip(lgr, lg.done ? 'You played ' + lg.need + ' days this week. Hooray!' : 'Days you played this week: ' + lg.have + ' of ' + lg.need + '.', { label: false }); } }
    if (gl) { gl.innerHTML = ''; gl.style.display = 'none'; }
    var tiles = $('#tiles'); tiles.innerHTML = '';
    // toddler mode (age 2, or the grown-up setting): Tiny Picnic is the big first tile; grade-level games are tucked away
    var tod = A.toddler(me); $('#games').classList.toggle('toddler', tod); tiles.classList.toggle('toddler', tod);
    GAMES.filter(function (gm) { return tod ? gm.toddler || gm.id === 'room' : !gm.toddler; }).forEach(function (gm) {
      var t = A.el('<button class="tile ' + gm.cls + (tod && gm.toddler ? ' big' : '') + (gm.ready ? '' : ' soon') + '" data-nav data-game="' + gm.id + '"><div class="scene">' + scene(gm, me) + '</div>' +
        (gm.ready ? '<span class="play">▶ Play</span>' : '<span class="ribbon">COMING SOON</span>') + '<span class="tn">' + gm.name + '</span><span class="tsub">' + gm.sub + '</span></button>');
      t.addEventListener('click', function () {
        if (gm.ready) { A.Audio.sfx('pop'); A.Voice.say(gm.voice); setTimeout(function () { location.href = gm.href; }, 350); }
        else { t.classList.remove('nudge'); void t.offsetWidth; t.classList.add('nudge'); A.Audio.sfx('locked'); A.Voice.say(gm.voice); }
      });
      t._say = gm.ready ? gm.say : [{ text: gm.name + ', coming soon' }];
      A.UI.tip(t, gm.tip, { name: gm.name });
      tiles.appendChild(t);
    });
    $('#stickIc').innerHTML = R.stickerSVG('star');
    $('#closetIc').innerHTML = B.svg({ blob: me.blob, color: me.color, outfit: 'bow' });
    $('#friendsIc').innerHTML = B.svg({ blob: 'strawberry', expr: 'happy' });   // design1: a starter friend (Mochi is still to meet)
    // play-time limit / stretch break: the hub is always a safe stopping point (between rounds)
    if (A.PlayTime) hubCheckpoint(0);
  }
  function hubCheckpoint(n) {   // waits for any open card (e.g. today's prizes) to close first
    clearTimeout(hubCheckpoint.t);
    hubCheckpoint.t = setTimeout(function () {
      if (!A.$('#games').classList.contains('on') || A.PlayTime.showing()) return;
      if ((A.UI.cardOpen || A.Parent.isOpen() || A.$('#gate')) && n < 60) return hubCheckpoint(n + 1);
      A.PlayTime.checkpoint({ home: function () { A.$$('.ptcard').forEach(function (x) { x.remove(); }); A.UI.cardOpen = false; go('players'); } });
    }, n ? 700 : 400);
  }

  function renderStickers() {
    me = A.Store.active(); if (!me) return go('players');
    var n = Object.keys(me.stickers).length;
    $('#bookTitle').textContent = me.name + "'s Sticker Book";
    // design1: only earned stickers (no empty "???" slots or hints for the rest), plus a friendly line
    $('#bookCnt').textContent = n ? n + ' sticker' + (n === 1 ? '' : 's') + ' · Keep playing to find more!' : 'Keep playing to find stickers!';
    var sl = $('#slots'); sl.innerHTML = '';
    R.STICKERS.forEach(function (s) {
      var got = !!me.stickers[s.id]; if (!got) return;
      var d = A.el('<div class="slot' + (got ? ' got' : '') + '"><div class="sk">' + (got ? R.stickerSVG(s.art) : '<div class="empty">?</div>') + '</div><div class="sn">' + (got ? A.esc(s.name) : '???') + '</div><div class="sh">' + A.esc(s.hint) + '</div></div>');
      d.addEventListener('click', function () { A.Blobs.anim(d, 'wig', 420); A.Audio.sfx(got ? 'pop' : 'locked'); });
      sl.appendChild(d);
    });
  }

  function renderCloset() {
    me = A.Store.active(); if (!me) return go('players');
    if ((B.outfitById[me.outfit] || {}).held) { me.held = me.outfit; me.outfit = 'none'; A.Store.save(); } // the bow/sweatband became held items
    var c = B.byId[me.blob] || B.CAST[0];
    $('#prevBig').innerHTML = B.forProfile(me, { hi: true }); $('#prevBig').setAttribute('style', B.backdrop(me.color)); $('#prevBig').classList.add('bd'); $('#prevName').textContent = c.name; $('#prevLooks').textContent = c.personality;
    function opt(box, items, kind) {
      box.innerHTML = '';
      items.forEach(function (it) {
        var bl = kind === 'blob' && !R.unlocked(me, 'blob', it.id);
        var uk = kind === 'held' ? 'outfit' : kind; // held items are outfit unlocks (same ids, stars and pacing)
        var locked = bl || (kind !== 'blob' && !R.unlocked(me, uk, it.id)), cost = uk === 'outfit' ? R.OUTFIT_COST[it.id] : R.COLOR_COST[it.id];
        var earn = locked && uk === 'outfit' && R.OUTFIT_EARN && R.OUTFIT_EARN[it.id] ? R.earnHint(me, it.id) : '';   // earn-rule hat/item: plain hint
        var sel = (kind === 'blob' ? me.blob : kind === 'color' ? me.color : kind === 'held' ? me.held || 'none' : me.outfit) === it.id;
        if ((bl || locked) && !sel) return;   // design1: Dress Up shows only friends and things already earned (no "???", prices or hints)
        var art = kind === 'blob' ? B.svg({ blob: it.id, color: 'classic', outfit: 'none' }) : kind === 'color' ? B.svg({ blob: me.blob, color: it.id })
          : kind === 'held' ? B.svg({ blob: me.blob, color: me.color, held: it.id, balloon: me.balloon, heldZoom: ['balloon', 'kite', 'umbrella', 'net'].indexOf(it.id) >= 0 ? 1.3 : 1.6 })   // Dress Up tiles: the item drawn bigger (grows from the paw) so it reads at tile size
          : B.svg({ blob: me.blob, color: me.color, outfit: it.id });
        var b = bl ? A.el('<button class="opt blocked" data-nav data-v="' + it.id + '" aria-label="' + A.esc(it.name) + ', locked. ' + A.esc(R.charHint(me, it.id)) + '"><span class="oa still">' + art + '</span><span class="on2">???</span><span class="lock">🔒</span><span class="hintx">' + A.esc(R.charHint(me, it.id)) + '</span></button>')
          : earn ? A.el('<button class="opt locked earn" data-nav data-v="' + it.id + '" aria-label="' + A.esc(it.name) + ', locked. ' + A.esc(earn) + '"><span class="oa still">' + art + '</span><span class="on2">' + A.esc(it.name) + '</span><span class="lock">🔒</span><span class="hintx">' + A.esc(R.earnShort ? R.earnShort(me, it.id) : earn) + '</span></button>')
          : A.el('<button class="opt' + (sel ? ' sel' : '') + (locked ? ' locked' : '') + '" data-nav data-v="' + it.id + '"' + (locked ? ' aria-label="' + A.esc(it.name) + ', ' + cost + ' stars"' : '') + '><span class="oa still' + (kind === 'color' ? ' bd" style="' + B.backdrop(it.id) : '') + '">' + art + '</span><span class="on2">' + A.esc(it.name) + '</span>' + (locked ? '<span class="lock">⭐ ' + cost + '</span>' : '') + '</button>');
        b.addEventListener('click', function () {
          if (bl) { b.classList.remove('nudge'); void b.offsetWidth; b.classList.add('nudge'); A.Audio.sfx('locked'); A.Voice.say(['hub_locked_blob']); A.UI.toast('🔒 ' + R.charHint(me, it.id)); return; }
          if (earn) { b.classList.remove('nudge'); void b.offsetWidth; b.classList.add('nudge'); A.Audio.sfx('locked'); A.Voice.say([{ id: 'ow_' + it.id + '_hint', text: R.earnHint({ stars: 0, days: {}, skills: {}, unlocks: { outfits: {}, colors: {}, blobs: {} }, story: { stops: {}, challenges: {} } }, it.id) }]); A.UI.toast('🔒 ' + earn); return; }
          if (locked) { b.classList.remove('nudge'); void b.offsetWidth; b.classList.add('nudge'); A.Audio.sfx('locked');
            var short = Math.max(1, (cost || 0) - me.stars);   // how many more stars (stars are never spent; the prize opens at that total)
            A.Voice.say(cost ? ['hub_you_need', short, short === 1 ? 'hub_more_star' : 'hub_more_stars'] : ['hub_locked']); if (cost) A.UI.toast('⭐ ' + short + ' more star' + (short === 1 ? '' : 's') + ' to go!'); return; }
          if (kind === 'blob') me.blob = it.id; else if (kind === 'color') me.color = it.id; else if (kind === 'held') me.held = it.id; else me.outfit = it.id;
          me.flags.dressed = true; A.Store.save(); A.Audio.sfx('pop');
          renderCloset(); A.Blobs.anim($('#prevBig'), 'jump', 600);
          A.Voice.say(kind === 'blob' ? ['hub_im', 'blob_' + it.id] : (kind === 'outfit' || kind === 'held') && it.id !== 'none' ? ['ow_' + it.id] : ['hub_looking_good']);
          var f = A.$('#closet .opt.sel[data-k="' + kind + '"]'); if (f) f.focus({ preventScroll: true });
        });
        b.dataset.k = kind;
        box.appendChild(b);
      });
    }
    opt($('#optBlob'), B.CAST, 'blob');
    opt($('#optColor'), B.COLORS, 'color');
    opt($('#optOutfit'), B.HATS, 'outfit');
    opt($('#optHeld'), B.HELD, 'held');
    // balloon colour choices: shown while the balloon is held (free once the balloon is earned)
    var bc = $('#optBalloon'), holdingBalloon = me.held === 'bow' && R.unlocked(me, 'outfit', 'bow');
    $('#rackBalloon').hidden = !holdingBalloon; bc.innerHTML = '';
    if (holdingBalloon) (B.BALLOON_COLORS || []).forEach(function (bcol) {
      var sel = (me.balloon || 'red') === bcol.id, src = B.wearUrl('held', bcol.id === 'red' ? 'balloon' : 'balloon_' + bcol.id, 256);
      var b = A.el('<button class="opt bcol' + (sel ? ' sel' : '') + '" data-nav data-k="balloon" data-v="' + bcol.id + '" aria-label="' + A.esc(bcol.name) + ' balloon"><span class="oa still"><img src="' + src + '" alt="" draggable="false"></span><span class="on2">' + A.esc(bcol.name) + '</span></button>');
      b.addEventListener('click', function () {
        me.balloon = bcol.id === 'red' ? undefined : bcol.id; if (!me.balloon) delete me.balloon; me.flags.dressed = true; A.Store.save(); A.Audio.sfx('pop');
        renderCloset(); A.Blobs.anim($('#prevBig'), 'jump', 600); A.Voice.say(['ow_bow']);
        var f = A.$('#closet .opt.sel[data-k="balloon"]'); if (f) f.focus({ preventScroll: true });
      });
      bc.appendChild(b);
    });
  }

  /* ---------- friend collection: every food friend, with their bio (read aloud by the browser voice) ---------- */
  function bioText(c) { return c.name + '! ' + c.personality + ' Favorite thing: ' + c.favorite + '. ' + c.name + ' says: ' + c.catchphrase; }
  function renderFriends() {
    me = A.Store.active(); if (!me) return go('players');
    var ids = A.Store.STARTER_BLOBS.concat(B.ORDER || []), got = ids.filter(function (id) { return R.unlocked(me, 'blob', id); }).length;
    // design1: only friends already met, and just a count (no total, no locked "???" cards or hints)
    $('#frTitle').textContent = me.name + "'s Picnic Pals"; $('#frCnt').textContent = got + ' friend' + (got === 1 ? '' : 's');
    var box = $('#frCards'); box.innerHTML = '';
    ids.forEach(function (id) {
      var c = B.byId[id]; if (!c) return; var has = R.unlocked(me, 'blob', id), hint = ''; if (!has) return;
      var d = A.el('<button class="frcard' + (has ? ' got' : ' locked') + '" data-nav data-id="' + id + '" aria-label="' + A.esc(has ? c.name + '. ' + c.personality : 'Locked friend. ' + hint) + '">' +
        (has || !R.lockedArt(id) ? '<span class="fa' + (has ? '' : ' sil') + '">' + B.svg({ blob: id, expr: has ? 'happy' : 'idle' }) + '</span>'
          : '<span class="fa lockart"><img src="' + R.lockedArt(id) + '" alt="" draggable="false"></span>') +   // basket-badge silhouette (art/theme/unlock)
        '<span class="fn">' + (has ? A.esc(c.name) : '???') + '</span>' +
        (has ? '<span class="fb">' + A.esc(c.personality) + '</span><span class="ff">💛 ' + A.esc(c.favorite) + '</span><span class="fq">' + A.esc(c.catchphrase) + '</span><span class="fs" aria-hidden="true">🔊</span>'
          : '<span class="fb">🔒 ' + A.esc(hint || 'Keep learning to meet this friend!') + '</span>') + '</button>');
      d.addEventListener('click', function () {
        if (!has) { d.classList.remove('nudge'); void d.offsetWidth; d.classList.add('nudge'); A.Audio.sfx('locked'); A.Voice.say(['hub_locked_blob']); return; }
        A.Audio.sfx('pop'); A.Blobs.anim(d.querySelector('.fa'), 'jump', 600); A.Voice.say([{ text: bioText(c) }]);
      });
      box.appendChild(d);
    });
  }

  function go(id) {
    if (id !== 'players') editing = false;
    if (id === 'friends') renderFriends();
    if (id === 'players') renderPlayers();
    if (id === 'games') renderGames();
    if (id === 'stickers') renderStickers();
    if (id === 'closet') renderCloset();
    show(id);
  }
  function leaveCloset() {
    // check rewards (e.g. the Dress Up sticker) when leaving dress-up
    var p = A.Store.active(); var items = p ? R.check(p) : []; A.Store.save();
    go('games'); if (items.length) R.celebrateSession(p).then(function () { go('games'); });   // already in the hub: show today's prizes now
  }

  $('#meBtn').addEventListener('click', function () { A.Audio.sfx('tap'); go('players'); A.Voice.say(['hub_whos_playing']); });
  $('#stickBtn')._say = [{ text: 'Sticker Book' }]; $('#closetBtn')._say = [{ text: 'Dress Up' }]; $('#friendsBtn')._say = [{ text: 'Friends' }]; $('#meBtn')._say = [{ text: 'Switch player' }];
  $('#editKids')._say = [{ text: 'Edit players. For grown-ups.' }];
  A.UI.tip($('#stickBtn'), 'See all the stickers you earned!', { name: 'Sticker Book' }); A.UI.tip($('#closetBtn'), 'Pick a friend, a color and fun things to wear.', { name: 'Dress Up' });
  A.UI.tip($('#friendsBtn'), 'Meet your food friends!', { name: 'Friends' }); A.UI.tip($('#meBtn'), 'Pick a different player.', { name: 'Switch player' });
  A.UI.tip($('#editKids'), 'For grown-ups: change a name or delete a player.', { name: 'Edit players' });
  $('#stickBtn').addEventListener('click', function () { A.Audio.sfx('pop'); go('stickers'); A.Voice.say(['hub_stickers']); });
  $('#friendsBtn').addEventListener('click', function () { A.Audio.sfx('pop'); go('friends'); A.Voice.say(['rm_friends']); });
  $('#closetBtn').addEventListener('click', function () { A.Audio.sfx('pop'); go('closet'); A.Voice.say(['hub_closet']); });
  A.$$('[data-back]').forEach(function (b) { b.addEventListener('click', function () { A.Audio.sfx('tap'); if (A.$('#closet').classList.contains('on')) leaveCloset(); else go('games'); }); });
  document.addEventListener('keydown', function (e) {
    if (A.UI.cardOpen || A.Parent.isOpen() || A.$('#gate')) return;
    if (e.key === 'Escape' || e.key === 'Backspace') {
      if (e.target && e.target.tagName === 'INPUT') return;
      if (A.$('#newkid').classList.contains('on')) go('players');
      else if (editing && A.$('#players').classList.contains('on')) { editing = false; renderPlayers(); }
      else if (A.$('#stickers').classList.contains('on') || A.$('#friends').classList.contains('on')) go('games');
      else if (A.$('#closet').classList.contains('on')) leaveCloset();
      else if (A.$('#games').classList.contains('on')) go('players');
    }
  });
  A.UI.arrowNav(function () { return A.$$('.screen.on [data-nav]'); });
  A.UI.gear({ onClose: function () { var cur = (A.$('.screen.on') || {}).id || 'players'; if (!A.Store.active() && cur !== 'players') cur = 'players'; go(cur); } });

  // back from a game: "Saved ✓", then today's prizes in one card (capped; extras wait for next session)
  function backFromGame() {
    var ref = document.referrer || '', fromGame = /\/games\//.test(ref) || /[?&]from=game/.test(location.search);
    var p = A.Store.active(); if (!fromGame || !p) return;
    A.Store.save(); setTimeout(function () { A.UI.toast('Saved ✓', 1800); var t = A.$$('.toast').slice(-1)[0]; if (t) t.classList.add('saved'); A.Voice.say(['rw_saved']); }, 250);
    setTimeout(function () { if (A.UI.cardOpen) return; R.celebrateSession(p).then(function (shown) { if (shown) go((A.$('.screen.on') || {}).id || 'games'); }); }, 1500);
  }
  window.__hubSession = function () { var p = A.Store.active(); return R.celebrateSession(p); };
  // first screen
  var h = (location.hash || '').slice(1);
  if (['games', 'stickers', 'closet', 'friends'].indexOf(h) >= 0 && A.Store.active()) go(h);
  else if (!A.Store.profiles().length) { go('players'); openNew(); } // first visit: no players yet -> make one
  else go('players');
  window.__hub = { go: go, openNew: openNew, saveInfo: saveInfo };
  backFromGame();
  A.Music.play('hub');
  $('#hubMusic').addEventListener('click', function () { A.Music.toggle(); hubMusic(); });
  function hubMusic() { $('#hubMusic').classList.toggle('off', A.Store.settings.music === false); }
  hubMusic();
})(window.Arcade);
