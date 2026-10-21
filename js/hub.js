/* Blob Arcade — hub: who's playing, game picker, sticker book, dress up. */
(function (A) {
  'use strict';
  var $ = A.$, B = A.Blobs, R = A.Rewards;
  A.UI.boot();
  var me = null, editing = false;

  // games registry: future games plug in here
  var GAMES = [
    { id: 'munch', name: 'Mochi Munch', sub: 'Number munching math', cls: 'munch', href: 'games/munch/index.html', ready: true, voice: ['hub_lets_go'] },
    { id: 'baseball', name: 'Blob Baseball', sub: 'Math at the ballpark', cls: 'base', href: 'games/baseball/index.html', ready: true, voice: ['bb_play_ball'] },
    { id: 'room', name: 'My Room', sub: 'Decorate & blob friends', cls: 'room', href: 'games/room/index.html', ready: true, voice: ['rm_title'] },
    { id: 'kicks', name: 'Penalty Kicks', sub: 'Coming soon', cls: 'kick', ready: false, voice: ['hub_coming_soon'] },
    { id: 'words', name: 'Sight Words', sub: 'Coming soon', cls: 'words', ready: false, voice: ['hub_coming_soon'] }
  ];

  // "Hi, <name>!" is spoken by the browser voice (names have no clips); without one: "Welcome back!"
  function greet(p, tail, without) { return A.Voice.named(['hub_hi', A.Voice.name(p), tail], without); }

  /* ---------- scenes for tiles ---------- */
  function scene(g, p) {
    if (g.id === 'munch') {
      var cells = [[8, 10, '7', '#fff6cf'], [72, 8, '3+4', '#d4f7e8'], [6, 56, '5', '#dcefff'], [78, 54, '9', '#ffd6e3']];
      return '<svg class="sc" viewBox="0 0 100 75">' + cells.map(function (c) { return '<g transform="translate(' + c[0] + ' ' + c[1] + ') rotate(' + (c[0] > 50 ? 8 : -8) + ')"><rect width="20" height="16" rx="4" fill="' + c[3] + '" stroke="#fff" stroke-width="1.5"/><text x="10" y="11.5" font-size="' + (c[2].length > 1 ? 5.6 : 9) + '" text-anchor="middle" fill="#4a3b6b" font-weight="700" font-family="sans-serif">' + c[2] + '</text></g>'; }).join('') + '</svg>' +
        '<div class="who2 chomp-loop">' + B.forProfile(p, { expr: 'chomp' }) + '</div>';
    }
    if (g.id === 'baseball') {
      return '<svg class="sc" viewBox="0 0 100 75"><path d="M0 60 Q50 46 100 60 V75 H0Z" fill="#9fe0a8"/><path d="M50 50 L66 60 L50 70 L34 60Z" fill="#f2d6a2"/><rect x="47" y="58" width="6" height="4" fill="#fff"/>' +
        '<g transform="translate(80 18) rotate(20)"><circle r="7" fill="#fff" stroke="#ddd" stroke-width="1"/><path d="M-4 -5 Q-1 0 -4 5 M4 -5 Q1 0 4 5" stroke="#ff5a6e" stroke-width="1.1" fill="none"/></g>' +
        '<rect x="15" y="12" width="5" height="34" rx="2.5" fill="#d9a066" transform="rotate(-35 17 30)"/></svg><div class="who2">' + B.forProfile(p, { outfit: 'helmet', expr: 'happy' }) + '</div>';
    }
    if (g.id === 'room') {
      return '<svg class="sc" viewBox="0 0 100 75"><path d="M0 0 H100 V48 H0Z" fill="#ffe9cf"/><path d="M0 48 H100 V75 H0Z" fill="#e8b987"/><path d="M0 56 H100 M0 65 H100" stroke="#d9a06c" stroke-width="1.2"/>' +
        '<rect x="66" y="8" width="22" height="18" rx="2" fill="#9fd8ff" stroke="#fff" stroke-width="2.5"/><path d="M77 8 V26 M66 17 H88" stroke="#fff" stroke-width="1.5"/>' +
        '<rect x="8" y="34" width="30" height="16" rx="4" fill="#9fd2ff" stroke="#4a3b6b" stroke-width="1.2"/><rect x="8" y="28" width="7" height="22" rx="3" fill="#c98b5e" stroke="#4a3b6b" stroke-width="1.2"/><ellipse cx="14" cy="34" rx="5" ry="3" fill="#ffe0ec"/>' +
        '<ellipse cx="54" cy="64" rx="22" ry="6" fill="#ffb3cf"/><rect x="18" y="8" width="16" height="18" rx="2" fill="#2d2a5a" stroke="#4a3b6b" stroke-width="1"/><circle cx="26" cy="17" r="4" fill="#ff8fb1"/></svg>' +
        '<div class="who2">' + B.forProfile(p, { expr: 'love' }) + '</div><span class="bitchip">✦ ' + ((p.wallet && p.wallet.bits) || 0) + '</span>';
    }
    if (g.id === 'kicks') {
      var net = ''; for (var i = 0; i <= 10; i++) net += '<path d="M' + (14 + i * 7.2) + ' 10 V44" stroke="#fff" stroke-width=".7" opacity=".8"/>';
      for (var j = 0; j <= 5; j++) net += '<path d="M14 ' + (10 + j * 6.8) + ' H86" stroke="#fff" stroke-width=".7" opacity=".8"/>';
      return '<svg class="sc" viewBox="0 0 100 75"><path d="M0 44 H100 V75 H0Z" fill="#8fdc9e"/>' + net + '<path d="M12 46 V8 H88 V46" stroke="#fff" stroke-width="3" fill="none" stroke-linejoin="round"/>' +
        '<g transform="translate(82 64)"><circle r="7" fill="#fff" stroke="#4a3b6b" stroke-width="1"/><path d="M0 -3 L3 -1 L2 3 L-2 3 L-3 -1Z" fill="#4a3b6b"/></g></svg><div class="who2">' + B.svg({ blob: 'pickle', outfit: 'headband', expr: 'happy' }) + '</div>';
    }
    return '<svg class="sc" viewBox="0 0 100 75"><g transform="translate(64 10) rotate(10)"><rect width="30" height="22" rx="4" fill="#fff" stroke="#c9b2ff" stroke-width="1.5"/><text x="15" y="15.5" font-size="11" text-anchor="middle" fill="#4a3b6b" font-weight="700" font-family="sans-serif">the</text></g>' +
      '<g transform="translate(6 14) rotate(-10)"><rect width="26" height="20" rx="4" fill="#fff" stroke="#ff9fc0" stroke-width="1.5"/><text x="13" y="14" font-size="10" text-anchor="middle" fill="#4a3b6b" font-weight="700" font-family="sans-serif">see</text></g></svg>' +
      '<div class="who2">' + B.svg({ blob: 'poppy', outfit: 'flower', expr: 'happy' }) + '</div>';
  }

  /* ---------- screens ---------- */
  function show(id) {
    A.$$('.screen').forEach(function (s) { s.classList.toggle('on', s.id === id); });
    if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    var first = A.$('#' + id + ' [data-nav], #' + id + ' .kid, #' + id + ' .tile');
    setTimeout(function () { if (first && !A.Parent.isOpen()) try { first.focus({ preventScroll: true }); } catch (e) {} }, 30);
  }

  function renderPlayers() {
    var logo = 'Blob Arcade', h = ''; for (var i = 0; i < logo.length; i++) h += logo[i] === ' ' ? ' ' : '<span style="animation-delay:' + (i * .09).toFixed(2) + 's">' + logo[i] + '</span>';
    $('#players .logo').innerHTML = h;
    var who = $('#who'); who.innerHTML = ''; who.classList.toggle('editing', editing);
    A.Store.profiles().forEach(function (p) {
      var b = A.el('<button class="kid" data-nav data-id="' + p.id + '"><span class="av">' + B.forProfile(p) + '</span><span class="nm">' + A.esc(p.name) + '</span><span class="st">⭐ ' + p.stars + '</span>' +
        '<span class="del" aria-hidden="true">✕ Delete</span></button>');
      b.setAttribute('aria-label', editing ? 'Delete ' + p.name : p.name);
      b.addEventListener('click', function () {
        if (editing) { askDelete(p); return; }
        A.Blobs.anim(b, 'jump', 600); A.Audio.sfx('pop'); A.Store.setActive(p.id); setTimeout(function () { go('games'); A.Voice.say(greet(p, 'hub_pick_game', ['hub_welcome_back', 'hub_pick_game'])); }, 260);
      });
      b.addEventListener('pointerenter', function () { A.Blobs.anim(b, 'squish', 420); });
      who.appendChild(b);
    });
    if (!editing) {
      var add = A.el('<button class="kid add" data-nav id="addKid" aria-label="Make a new player"><span class="av"><span class="plus">+</span></span><span class="nm">New player</span><span class="st">Make your own blob</span></button>');
      add.addEventListener('click', function () { A.Audio.sfx('pop'); openNew(); });
      who.appendChild(add);
    }
    var eb = $('#editKids'); eb.textContent = editing ? '✓ Done editing' : '✏️ Edit players'; eb.setAttribute('aria-pressed', editing ? 'true' : 'false'); eb.classList.toggle('on', editing);
    eb.style.display = A.Store.profiles().length ? '' : 'none';
    $('#whoHint').textContent = editing ? 'Pick a player to delete, or press Done.' : A.isTouchOnly() ? '' : 'Use the arrow keys and Enter, or click your blob!';
  }

  function askDelete(p) {
    A.Audio.sfx('tap');
    A.UI.confirm({ title: 'Delete ' + p.name + '?', sub: p.name + "'s stars, stickers and progress will be gone from this device. This can't be undone.", art: '<div>' + B.forProfile(p, { expr: 'sad' }) + '</div>', yes: '🗑 Delete', no: 'Keep ' + p.name, danger: true })
      .then(function (yes) {
        if (yes) { A.Store.remove(p.id); A.UI.toast(p.name + ' was deleted.'); if (!A.Store.profiles().length) editing = false; }
        renderPlayers(); var f = A.$('#who .kid'); if (f) f.focus({ preventScroll: true });
      });
  }
  /* ---------- new player: name, blob, color (+ optional age) ---------- */
  var nk = { blob: 'mochi', color: 'classic', age: null };
  var START_COLORS = ['classic', 'berry', 'mint', 'sunny', 'sky', 'grape', 'cocoa']; // a new player picks one starting color for free
  function openNew() {
    nk = { blob: A.pick(A.Store.STARTER_BLOBS), color: 'classic', age: null };
    $('#nkName').value = ''; renderNew(); show('newkid');
    function fx() { if (A.$('#newkid').classList.contains('on') && !A.Parent.isOpen()) $('#nkName').focus(); }
    setTimeout(fx, 60);
    if (document.readyState !== 'complete') window.addEventListener('load', function () { setTimeout(fx, 80); }, { once: true }); // first visit: the page finishing loading can drop focus
    A.Voice.say(['hub_new_player']);
  }
  function renderNew() {
    var nm = $('#nkName').value.trim();
    $('#nkPrev').innerHTML = B.svg({ blob: nk.blob, color: nk.color, expr: 'happy' }); $('#nkShow').textContent = nm || '?';
    function opts(box, items, kind) {
      box.innerHTML = '';
      items.forEach(function (it) {
        if (kind === 'blob' && A.Store.STARTER_BLOBS.indexOf(it.id) < 0) {
          var lb = A.el('<button class="opt blocked" data-nav data-k="blob" data-v="' + it.id + '" aria-label="Locked friend"><span class="oa still">' + B.svg({ blob: it.id }) + '</span><span class="on2">???</span><span class="lock">🔒</span><span class="hintx">Win in Story mode</span></button>');
          lb.addEventListener('click', function () { lb.classList.remove('nudge'); void lb.offsetWidth; lb.classList.add('nudge'); A.Audio.sfx('locked'); A.Voice.say(['hub_locked_blob']); });
          box.appendChild(lb); return;
        }
        var sel = nk[kind] === it.id, art = kind === 'blob' ? B.svg({ blob: it.id }) : B.svg({ blob: nk.blob, color: it.id });
        var b = A.el('<button class="opt' + (sel ? ' sel' : '') + '" data-nav data-k="' + kind + '" data-v="' + it.id + '"><span class="oa still">' + art + '</span><span class="on2">' + A.esc(it.name) + '</span></button>');
        b.addEventListener('click', function () { nk[kind] = it.id; A.Audio.sfx('pop'); renderNew(); A.Blobs.anim($('#nkPrev'), 'jump', 600);
          if (kind === 'blob') A.Voice.say(['hub_im', 'blob_' + it.id]); var f = A.$('#newkid .opt.sel[data-k="' + kind + '"]'); if (f) f.focus({ preventScroll: true }); });
        box.appendChild(b);
      });
    }
    opts($('#nkBlob'), B.CAST, 'blob');
    opts($('#nkColor'), START_COLORS.map(function (id) { return B.colorById[id]; }), 'color');
    var ag = $('#nkAge'); ag.innerHTML = '';
    [null, 3, 4, 5, 6, 7, 8].forEach(function (a) {
      var b = A.el('<button class="agechip' + (nk.age === a ? ' sel' : '') + '" data-nav>' + (a == null ? 'Skip' : a === 8 ? '8+' : a) + '</button>');
      b.addEventListener('click', function () { nk.age = a; A.Audio.sfx('tap'); renderNew(); var f = A.$('#nkAge .sel'); if (f) f.focus({ preventScroll: true }); });
      ag.appendChild(b);
    });
  }
  function createNew() {
    var nm = $('#nkName').value.trim().replace(/\s+/g, ' ');
    if (!nm) { var i = $('#nkName'); i.classList.remove('nudge'); void i.offsetWidth; i.classList.add('nudge'); A.Audio.sfx('locked'); A.Voice.say(['hub_new_player']); i.focus(); return; }
    var p = A.Store.add(nm, nk.blob); p.color = nk.color; if (nk.color !== 'classic') p.unlocks.colors[nk.color] = Date.now(); p.age = nk.age; p.flags.madeByKid = true; A.Store.startByAge(p);
    A.Store.setActive(p.id); A.Store.save(); A.Audio.sfx('unlock');
    go('games'); A.UI.rain(30); A.Voice.say(greet(p, 'hub_welcome', ['hub_welcome']));
  }
  $('#nkName').addEventListener('input', function () { $('#nkShow').textContent = $('#nkName').value.trim() || '?'; });
  $('#nkName').addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === 'ArrowDown') { e.preventDefault(); var f = A.$('#nkBlob .opt.sel') || A.$('#nkBlob .opt'); if (f) f.focus(); } e.stopPropagation(); if (e.key === 'Escape') go('players'); });
  $('#nkGo').addEventListener('click', createNew);
  $('#nkBack').addEventListener('click', function () { A.Audio.sfx('tap'); go('players'); });
  $('#editKids').addEventListener('click', function () { editing = !editing; A.Audio.sfx('tap'); renderPlayers(); var f = A.$('#who .kid') ; if (f) f.focus({ preventScroll: true }); });

  function renderGames() {
    me = A.Store.active(); if (!me) return go('players');
    $('#meAv').innerHTML = B.forProfile(me); $('#meHi').textContent = 'Hi, ' + me.name + '!'; $('#meStars').textContent = me.stars;
    var g = R.nextGoal(me), gl = $('#goal');
    if (g) {
      var art = g.kind === 'outfit' ? B.svg({ blob: me.blob, color: me.color, outfit: g.id }) : B.svg({ blob: me.blob, color: g.id, outfit: me.outfit });
      var name = g.kind === 'outfit' ? B.outfitById[g.id].name : B.colorById[g.id].name + ' color';
      gl.innerHTML = '<span class="gi">' + art + '</span><span><span class="gt">Next prize: ' + A.esc(name) + ' at ⭐' + g.cost + '</span><div class="gb"><i style="width:' + Math.round(100 * me.stars / g.cost) + '%"></i></div></span>';
      gl.style.display = '';
    } else gl.style.display = 'none';
    var tiles = $('#tiles'); tiles.innerHTML = '';
    GAMES.forEach(function (gm) {
      var t = A.el('<button class="tile ' + gm.cls + (gm.ready ? '' : ' soon') + '" data-nav data-game="' + gm.id + '"><div class="scene">' + scene(gm, me) + '</div>' +
        (gm.ready ? '<span class="play">▶ Play</span>' : '<span class="ribbon">COMING SOON</span>') + '<span class="tn">' + gm.name + '</span><span class="tsub">' + gm.sub + '</span></button>');
      t.addEventListener('click', function () {
        if (gm.ready) { A.Audio.sfx('pop'); A.Voice.say(gm.voice); setTimeout(function () { location.href = gm.href; }, 350); }
        else { t.classList.remove('nudge'); void t.offsetWidth; t.classList.add('nudge'); A.Audio.sfx('locked'); A.Voice.say(gm.voice); }
      });
      tiles.appendChild(t);
    });
    $('#stickIc').innerHTML = R.stickerSVG('star');
    $('#closetIc').innerHTML = B.svg({ blob: me.blob, color: me.color, outfit: 'bow' });
  }

  function renderStickers() {
    me = A.Store.active(); if (!me) return go('players');
    var n = Object.keys(me.stickers).length;
    $('#bookTitle').textContent = me.name + "'s Sticker Book";
    $('#bookCnt').textContent = n + ' of ' + R.STICKERS.length + ' stickers';
    var sl = $('#slots'); sl.innerHTML = '';
    R.STICKERS.forEach(function (s) {
      var got = !!me.stickers[s.id];
      var d = A.el('<div class="slot' + (got ? ' got' : '') + '"><div class="sk">' + (got ? R.stickerSVG(s.art) : '<div class="empty">?</div>') + '</div><div class="sn">' + (got ? A.esc(s.name) : '???') + '</div><div class="sh">' + A.esc(s.hint) + '</div></div>');
      d.addEventListener('click', function () { A.Blobs.anim(d, 'wig', 420); A.Audio.sfx(got ? 'pop' : 'locked'); });
      sl.appendChild(d);
    });
  }

  function renderCloset() {
    me = A.Store.active(); if (!me) return go('players');
    var c = B.byId[me.blob] || B.CAST[0];
    $('#prevBig').innerHTML = B.forProfile(me); $('#prevName').textContent = c.name; $('#prevLooks').textContent = c.personality;
    function opt(box, items, kind) {
      box.innerHTML = '';
      items.forEach(function (it) {
        var bl = kind === 'blob' && !R.unlocked(me, 'blob', it.id);
        var locked = bl || (kind !== 'blob' && !R.unlocked(me, kind, it.id)), cost = kind === 'outfit' ? R.OUTFIT_COST[it.id] : R.COLOR_COST[it.id];
        var sel = (kind === 'blob' ? me.blob : kind === 'color' ? me.color : me.outfit) === it.id;
        var art = kind === 'blob' ? B.svg({ blob: it.id, color: 'classic', outfit: 'none' }) : kind === 'color' ? B.svg({ blob: me.blob, color: it.id }) : B.svg({ blob: me.blob, color: me.color, outfit: it.id });
        var b = bl ? A.el('<button class="opt blocked" data-nav data-v="' + it.id + '" aria-label="' + A.esc(it.name) + ', locked. ' + A.esc(A.Story.chHint(me, it.id)) + '"><span class="oa still">' + art + '</span><span class="on2">???</span><span class="lock">🔒</span><span class="hintx">' + A.esc(A.Story.chHint(me, it.id)) + '</span></button>')
          : A.el('<button class="opt' + (sel ? ' sel' : '') + (locked ? ' locked' : '') + '" data-nav data-v="' + it.id + '"><span class="oa still">' + art + '</span><span class="on2">' + A.esc(it.name) + '</span>' + (locked ? '<span class="lock">⭐ ' + cost + '</span>' : '') + '</button>');
        b.addEventListener('click', function () {
          if (bl) { b.classList.remove('nudge'); void b.offsetWidth; b.classList.add('nudge'); A.Audio.sfx('locked'); A.Voice.say(['hub_locked_blob']); A.UI.toast('🔒 ' + A.Story.chHint(me, it.id)); return; }
          if (locked) { b.classList.remove('nudge'); void b.offsetWidth; b.classList.add('nudge'); A.Audio.sfx('locked'); A.Voice.say(['hub_locked']); return; }
          if (kind === 'blob') me.blob = it.id; else if (kind === 'color') me.color = it.id; else me.outfit = it.id;
          me.flags.dressed = true; A.Store.save(); A.Audio.sfx('pop');
          renderCloset(); A.Blobs.anim($('#prevBig'), 'jump', 600);
          A.Voice.say(kind === 'blob' ? ['hub_im', 'blob_' + it.id] : ['hub_looking_good']);
          var f = A.$('#closet .opt.sel[data-k="' + kind + '"]'); if (f) f.focus({ preventScroll: true });
        });
        b.dataset.k = kind;
        box.appendChild(b);
      });
    }
    opt($('#optBlob'), B.CAST, 'blob');
    opt($('#optColor'), B.COLORS, 'color');
    opt($('#optOutfit'), B.OUTFITS, 'outfit');
  }

  function go(id) {
    if (id !== 'players') editing = false;
    if (id === 'players') renderPlayers();
    if (id === 'games') renderGames();
    if (id === 'stickers') renderStickers();
    if (id === 'closet') renderCloset();
    show(id);
  }
  function leaveCloset() {
    // check rewards (e.g. the Dress Up sticker) when leaving dress-up
    var p = A.Store.active(); var items = p ? R.check(p) : []; A.Store.save();
    go('games'); if (items.length) R.celebrate(p, items).then(function () { go('games'); });
  }

  $('#meBtn').addEventListener('click', function () { A.Audio.sfx('tap'); go('players'); A.Voice.say(['hub_whos_playing']); });
  $('#stickBtn').addEventListener('click', function () { A.Audio.sfx('pop'); go('stickers'); A.Voice.say(['hub_stickers']); });
  $('#closetBtn').addEventListener('click', function () { A.Audio.sfx('pop'); go('closet'); A.Voice.say(['hub_closet']); });
  A.$$('[data-back]').forEach(function (b) { b.addEventListener('click', function () { A.Audio.sfx('tap'); if (A.$('#closet').classList.contains('on')) leaveCloset(); else go('games'); }); });
  document.addEventListener('keydown', function (e) {
    if (A.UI.cardOpen || A.Parent.isOpen() || A.$('#gate')) return;
    if (e.key === 'Escape' || e.key === 'Backspace') {
      if (e.target && e.target.tagName === 'INPUT') return;
      if (A.$('#newkid').classList.contains('on')) go('players');
      else if (editing && A.$('#players').classList.contains('on')) { editing = false; renderPlayers(); }
      else if (A.$('#stickers').classList.contains('on')) go('games');
      else if (A.$('#closet').classList.contains('on')) leaveCloset();
      else if (A.$('#games').classList.contains('on')) go('players');
    }
  });
  A.UI.arrowNav(function () { return A.$$('.screen.on [data-nav]'); });
  A.UI.gear({ onClose: function () { var cur = (A.$('.screen.on') || {}).id || 'players'; if (!A.Store.active() && cur !== 'players') cur = 'players'; go(cur); } });

  // first screen
  var h = (location.hash || '').slice(1);
  if (['games', 'stickers', 'closet'].indexOf(h) >= 0 && A.Store.active()) go(h);
  else if (!A.Store.profiles().length) { go('players'); openNew(); } // first visit: no players yet -> make one
  else go('players');
  window.__hub = { go: go, openNew: openNew };
  A.Music.play('hub');
  $('#hubMusic').addEventListener('click', function () { A.Music.toggle(); hubMusic(); });
  function hubMusic() { $('#hubMusic').classList.toggle('off', A.Store.settings.music === false); }
  hubMusic();
})(window.Arcade);
