/* Blob Arcade — game controllers (Gamepad API, "standard" mapping: Xbox, PlayStation, Switch Pro, most generic pads in Chrome/Edge).

   How it works: the controller becomes a "virtual keyboard". Every page already speaks keyboard
   (arrows + Space for Player 1, W A S D + F for Player 2, Esc = back/pause, R = hear it again),
   so a controller press is turned into the same key event. Menus, cards, cutscenes, unlock scenes,
   bonus questions, the story map, high scores, Mochi Munch and Blob Baseball all just work, and
   there is a single place to tune the feel for little kids.

     D-pad / left stick  → arrows (Player 2: W A S D)     big deadzone, slow repeat-on-hold
     A  (✕ on PlayStation, bottom button on Switch)       → munch / pick / answer   (P1 Space, P2 F)
     B  (○)                                                → back / pause            (Esc)
     Y  (△)                                                → hear the rule again     (R)
     X  (□)                                                → high scores in menus (H); "swap" on the 2-player setup screen
     Start / Options                                       → pause menu              (Esc)
     Back / View / Share                                   → music on/off            (M)

   Seats: controllers sit in Player 1 / Player 2 seats (remembered for this browser tab, so they survive
   the jump from menu to game). The first controller pressed takes Player 1, the next one Player 2. With one
   controller and a keyboard, the keyboard plays the free seat; X on the 2-player setup screen swaps them.
   In 1-player games every controller drives Player 1.

   Kid-proofing: controllers never open or operate the grown-up area (the gear needs a press-and-hold with a
   mouse/finger, and the gate question needs a click/tap). While the gate or grown-up panel is open,
   controller input is ignored. */
(function (A) {
  'use strict';
  var P = A.Pad = {};
  var DEAD = 0.55, RELEASE = 0.35;          // stick must be pushed past 55% to count, and back under 35% to let go
  var FIRST = 450, REPEAT = 240;            // hold a direction: first repeat after 0.45 s, then ~4 steps a second
  var B = { a: 0, b: 1, x: 2, y: 3, back: 8, start: 9, up: 12, down: 13, left: 14, right: 15 };
  var NAMES = ['a', 'b', 'x', 'y', 'back', 'start', 'up', 'down', 'left', 'right'];
  var K1 = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', a: ' ', b: 'Escape', y: 'r', x: 'h', start: 'Escape', back: 'm' };
  var K2 = { up: 'w', down: 's', left: 'a', right: 'd', a: 'f', b: 'Escape', y: 'r', x: 'h', start: 'Escape', back: 'm' };
  var SKEY = 'blobArcade.pads';
  var st = {}, ctx = {}, known = {}, seats = [null, null], lastUse = -1, lostCard = null, lastFam = null;
  P.log = [];                                  // test hook: [{pad, slot, name, key}]
  P.lastRumble = null;

  function ss(k, v) { try { if (v === undefined) return JSON.parse(sessionStorage.getItem(k) || 'null'); sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  (function () { var s = ss(SKEY); if (s) { seats = s.seats || seats; known = s.known || {}; } })();
  function save() { ss(SKEY, { seats: seats, known: known }); }
  function list() { var g = []; try { g = navigator.getGamepads ? navigator.getGamepads() : []; } catch (e) {} var out = []; for (var i = 0; i < (g ? g.length : 0); i++) if (g[i] && g[i].connected !== false) out.push(g[i]); return out; }
  P.supported = !!navigator.getGamepads;
  P.pads = list;
  P.family = function (pad) {
    if (!pad && lastFam) return lastFam;
    var id = ((pad || list()[0] || {}).id || '').toLowerCase();
    if (/054c|playstation|dualsense|dualshock/.test(id)) return 'ps';
    if (/057e|nintendo|pro controller|joy-con/.test(id)) return 'nin';
    return 'xbox';
  };
  var LABEL = { xbox: { a: 'A', b: 'B', x: 'X', y: 'Y' }, ps: { a: '✕', b: '○', x: '□', y: '△' }, nin: { a: 'B', b: 'A', x: 'Y', y: 'X' } };  // by position: bottom/right/left/top
  /* a button glyph: <i class="pg pg-a">A</i>; the label follows the controller in use (A on Xbox, ✕ on PlayStation…) */
  P.name = function (b) { return LABEL[P.family()][b]; };
  P.g = function (b) {
    if (b === 'dpad') return '<i class="pg pg-dpad" aria-label="D-pad">✛</i>';
    if (b === 'start') return '<i class="pg pg-start" aria-label="Start">☰</i>';
    if (b === 'back') return '<i class="pg pg-start" aria-label="Back / View button">⧉</i>';
    return '<i class="pg pg-' + b + '" data-b="' + b + '" aria-label="' + b.toUpperCase() + ' button">' + LABEL[P.family()][b] + '</i>';
  };
  function relabel() { var L = LABEL[P.family()]; A.$$('.pg[data-b]').forEach(function (e) { e.textContent = L[e.dataset.b]; }); }

  /* ---------- seats ---------- */
  function seatOf(pad) { for (var s = 0; s < 2; s++) if (seats[s] && seats[s].i === pad.index && seats[s].id === pad.id) return s; return -1; }
  function seat(pad) {
    var s = seatOf(pad); if (s >= 0) return s;
    for (s = 0; s < 2; s++) if (!seats[s] || !connected(seats[s])) { seats[s] = { i: pad.index, id: pad.id }; save(); A.emit('pad:seats'); return s; }
    return -1;
  }
  function connected(seatInfo) { return list().some(function (p) { return p.index === seatInfo.i && p.id === seatInfo.id; }); }
  P.seats = function () { return seats.map(function (s) { return s && connected(s) ? { i: s.i, id: s.id, n: s.i + 1 } : null; }); };
  P.swap = function () { seats = [seats[1], seats[0]]; save(); A.emit('pad:seats'); A.Audio.sfx('pop'); };
  P.resetSeats = function () { seats = [null, null]; save(); A.emit('pad:seats'); };
  /* hint text for a seat in 2-player games: controller or keys */
  // (uses the remembered seat even before the browser shows the controller on this page — Chrome reveals it on its first press)
  P.label = function (slot, keysText) { var s = seats[slot]; return s ? '🎮 Controller ' + (s.i + 1) : keysText; };
  /* the 2-player setup panel ("Press A to join") — names: [p1, p2] */
  P.seatPanel = function (names) {
    var s = P.seats(), keys = ['⌨ Arrows + Space', '⌨ W A S D + F'];
    function chip(k) {
      return '<span class="seat s' + (k + 1) + (s[k] ? ' on' : '') + '"><b>Player ' + (k + 1) + (names && names[k] ? ' · ' + A.esc(names[k]) : '') + '</b>' +
        (s[k] ? '<span>🎮 Controller ' + s[k].n + '</span>' : '<span>' + keys[k] + '</span><small>or press ' + P.g('a') + ' on a controller to join</small>') + '</span>';
    }
    return '<div class="padseats" id="padSeats">' + chip(0) + '<button class="pill swap" data-padswap' + (s[0] || s[1] ? '' : ' hidden') + '>⇄ Swap ' + P.g('x') + '</button>' + chip(1) + '</div>';
  };

  /* ---------- context (set by each page) ----------
     {game: true}  in a game screen: every button is a key (A = Space/F).  Off (menus): A clicks the focused tile/button.
     {two: true}   2-player game: seat 2 sends W A S D + F.
     {only(slot)}  e.g. baseball 2P: only the batter's controller works.
     {setup: true} 2-player setup screen: an unseated controller's first press only joins (and X swaps).
     {names:[..]}  player names for messages. */
  P.context = function (c) { ctx = c || {}; };
  P.ctx = function () { return ctx; };

  function blockedForPads() { return !!(A.$('#gate') || (A.Parent && A.Parent.isOpen && A.Parent.isOpen())); }
  function key(k) {
    var o = { key: k, code: k.length === 1 ? 'Key' + k.toUpperCase() : k, bubbles: true, cancelable: true };
    if (k === ' ') o.code = 'Space';
    document.dispatchEvent(new KeyboardEvent('keydown', o)); document.dispatchEvent(new KeyboardEvent('keyup', o));
  }
  function visible(el) { return el.offsetParent !== null; }
  function press(pad, name) {
    if (blockedForPads()) return;
    lastUse = pad.index; usePad(pad);
    var wasSeated = seatOf(pad) >= 0, slot = seat(pad);
    if (!wasSeated && slot >= 0 && ctx.setup) { A.Audio.sfx('pop'); UI().toast('🎮 Controller ' + (pad.index + 1) + ' joined as Player ' + (slot + 1) + '!'); return; }
    if (ctx.setup && name === 'x') { P.swap(); return; }
    var useSlot = ctx.two ? slot : 0;
    if (ctx.two && slot < 0) return;                          // a third controller in a 2-player game: ignored
    var overlay = (A.UI && A.UI.cardOpen) || document.querySelector('.overlay.on, .cutscene');
    if (ctx.only && !overlay && !ctx.only(useSlot)) { P.log.push({ pad: pad.index, slot: useSlot, name: name, key: null }); return; }  // not your turn
    var map = useSlot === 1 && ctx.two ? K2 : K1, k = map[name];
    if (name === 'a' && !ctx.game && !overlay) {
      var ae = document.activeElement;
      if (ae && ae !== document.body && ae.matches && ae.matches('button, a[href], [data-nav]') && !ae.closest('#gear, #parent')) { P.log.push({ pad: pad.index, slot: useSlot, name: name, key: 'click' }); ae.click(); return; }
      var first = A.$$('.screen.on [data-nav], #menu [data-nav]').filter(visible)[0];
      if (first && (!ae || ae === document.body)) { first.focus(); P.log.push({ pad: pad.index, slot: useSlot, name: name, key: 'focus' }); return; }
    }
    if (overlay && name === 'a') k = useSlot === 1 && ctx.two ? 'f' : ' ';
    if (!k) return;
    P.log.push({ pad: pad.index, slot: useSlot, name: name, key: k });
    key(k);
  }

  /* ---------- hints: controller glyphs while a controller is in use, key hints after keyboard use ---------- */
  function usePad(pad) {
    var b = document.body; if (!b) return;
    var fam = lastFam = P.family(pad);
    if (!b.classList.contains('pad') || !b.classList.contains('pad-' + fam)) { b.classList.add('pad'); b.classList.remove('pad-xbox', 'pad-ps', 'pad-nin'); b.classList.add('pad-' + fam); relabel(); A.emit('pad:mode', true); }
  }
  function useKeys(e) { if (!e.isTrusted) return; if (document.body.classList.contains('pad')) { document.body.classList.remove('pad'); A.emit('pad:mode', false); } }
  document.addEventListener('keydown', useKeys, true);
  document.addEventListener('pointerdown', useKeys, true);
  P.inUse = function () { return document.body.classList.contains('pad'); };

  /* ---------- rumble (optional, parent toggle) ---------- */
  P.rumble = function (slot, kind) {
    if (A.Store.settings.padRumble === false) return false;
    var pads = list().filter(function (p) { return ctx.two ? seatOf(p) === slot : (p.index === lastUse || list().length === 1); });
    var big = kind === 'big', done = false;
    pads.forEach(function (p) {
      var v = p.vibrationActuator; if (!v || !v.playEffect) return;
      try { var r = v.playEffect(v.type || 'dual-rumble', { startDelay: 0, duration: big ? 260 : 90, weakMagnitude: big ? .7 : .4, strongMagnitude: big ? .5 : .1 }); if (r && r.catch) r.catch(function () {}); done = true; P.lastRumble = { pad: p.index, kind: kind || 'light', t: Date.now() }; } catch (e) {}
    });
    return done;
  };

  /* ---------- hot-plug ---------- */
  function UI() { return A.UI; }
  function onConnect(pad) {
    if (!pad) return;
    var k = pad.index + '|' + pad.id, fresh = !known[k]; known[k] = 1; save();
    if (fresh) { A.Audio.sfx('pop'); UI().toast('🎮 Controller connected!'); }
    usePad(pad); relabel(); A.emit('pad:seats');
    if (lostCard && lostCard.slot === seatOf(pad)) { var bt = A.$('.overlay.padlost .bigbtn'); lostCard = null; if (bt) setTimeout(function () { bt.click(); }, 500); UI().toast('🎮 Welcome back!'); }
  }
  function onDisconnect(pad) {
    var k = pad.index + '|' + pad.id; delete known[k]; save();
    var slot = -1; for (var s = 0; s < 2; s++) if (seats[s] && seats[s].i === pad.index && seats[s].id === pad.id) slot = s;
    A.emit('pad:seats');
    var inUse = ctx.game && (ctx.two ? slot >= 0 : list().length === 0 && (slot >= 0 || lastUse === pad.index));
    if (!inUse || lostCard) { UI().toast('🎮 Controller disconnected'); return; }
    // pause gently: the card stops the clock (Munch timer, baseball shot clock) until it is closed or the controller is back
    var who = ctx.two && ctx.names ? ctx.names[slot] + '’s controller' : 'The controller';
    lostCard = { slot: slot };
    A.Audio.sfx('soft');
    UI().card({ cls: 'padlost', tag: 'Paused', title: 'Controller unplugged', art: '<div class="padart">🎮</div>', sub: who + ' disconnected. Plug it back in, or press OK to keep playing with the keyboard or mouse.', btn: 'OK, keep playing', minMs: 400 })
      .then(function () { lostCard = null; if (ctx.resume) ctx.resume(); });
    if (ctx.pause) ctx.pause();
    P.lost = (P.lost || 0) + 1;
  }
  window.addEventListener('gamepadconnected', function (e) { setTimeout(function () { var p = list().filter(function (q) { return q.index === e.gamepad.index; })[0] || e.gamepad; seen[p.index] = p.id; onConnect(p); }, 0); });
  window.addEventListener('gamepaddisconnected', function (e) { if (seen[e.gamepad.index] != null) { delete seen[e.gamepad.index]; delete st[e.gamepad.index]; onDisconnect(e.gamepad); } });

  /* ---------- polling ---------- */
  var seen = {};
  function dirOf(p) {
    var bt = p.buttons || [], ax = p.axes || [];
    function on(i) { var b = bt[i]; return !!(b && (b.pressed || b.value > .5)); }
    if (on(B.up)) return 'up'; if (on(B.down)) return 'down'; if (on(B.left)) return 'left'; if (on(B.right)) return 'right';
    var x = ax[0] || 0, y = ax[1] || 0, s = st[p.index], held = s && s.stick, lim = held ? RELEASE : DEAD;
    if (Math.max(Math.abs(x), Math.abs(y)) < lim) { if (s) s.stick = false; return null; }
    if (s) s.stick = true;
    return Math.abs(x) > Math.abs(y) ? (x > 0 ? 'right' : 'left') : (y > 0 ? 'down' : 'up');
  }
  function poll() {
    var pads = list(), now = Date.now(), here = {};
    pads.forEach(function (p) {
      here[p.index] = 1;
      if (seen[p.index] !== p.id) { seen[p.index] = p.id; onConnect(p); }
      if (p.mapping && p.mapping !== 'standard' && !st[p.index]) P.nonStandard = true;
      var s = st[p.index] || (st[p.index] = { b: {}, dir: null, next: 0, stick: false });
      if (document.hidden) return;
      ['a', 'b', 'x', 'y', 'back', 'start'].forEach(function (n) {
        var b = p.buttons[B[n]], down = !!(b && (b.pressed || b.value > .5));
        if (down && !s.b[n]) press(p, n);
        s.b[n] = down;
      });
      var d = dirOf(p);
      if (d !== s.dir) { s.dir = d; if (d) { press(p, d); s.next = now + FIRST; } }
      else if (d && now >= s.next) { press(p, d); s.next = now + REPEAT; }
    });
    Object.keys(seen).forEach(function (i) { if (!here[i]) { var id = seen[i]; delete seen[i]; delete st[i]; onDisconnect({ index: +i, id: id }); } });
  }
  if (P.supported) setInterval(poll, 33);
  P.poll = poll;

  /* ---------- page helpers ---------- */
  /* controller hint bar, e.g. P.keys([['dpad', 'move'], ['a', 'munch']]) — shown instead of the key hints while a controller is in use */
  P.keys = function (items, cls) { return '<div class="keys padkeys ' + (cls || '') + '">' + items.map(function (it) { return '<span class="grp">' + it[0].split('+').map(P.g).join('') + ' ' + it[1] + '</span>'; }).join('') + '</div>'; };
  /* the 2-player seat panel inside el; re-rendered when controllers join, leave or swap. names() -> [p1, p2] */
  P.mountSeats = function (el, names) {
    if (el._padDraw) A.off('pad:seats', el._padDraw);
    function draw() { if (!el.isConnected) { A.off('pad:seats', draw); return; } el.innerHTML = P.seatPanel(names()); var sw = el.querySelector('[data-padswap]'); if (sw) sw.addEventListener('click', function (e) { e.stopPropagation(); P.swap(); }); }
    el._padDraw = draw; draw(); A.on('pad:seats', draw); return draw;
  };
  P.TUNING = { DEAD: DEAD, RELEASE: RELEASE, FIRST: FIRST, REPEAT: REPEAT };
})(window.Arcade);
