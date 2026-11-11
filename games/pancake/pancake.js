/* Pancake Stack Race v1 — stack pancakes to finish a breakfast order, racing a friend. */
(function (A) {
  'use strict';
  var K = A.Pancake, Art = A.PancakeArt, $ = A.$, P = A.Store && A.Store.active();
  if (!P) { location.replace(A.ROOT + 'index.html#players'); return; }

  var G = K.newSession(P);
  var stats = P.games.pancake = P.games.pancake || { sessions: 0 };
  var pose = 'front', nudge = '', drag = null, lastSay = '', busy = false, cheerT = null, raceT = null;

  function fname(id) {
    var c = (A.FoodData && A.FoodData.cast || []).filter(function (f) { return f.id === id; })[0];
    return (c && c.name) || 'friend';
  }
  function friendImg(id, ex) {
    return A.ROOT + 'assets/picnic/friends/' + id + '/' + (ex || 'front') + '_256.webp';
  }
  function say(text, kind) {
    if (!text) return;
    lastSay = text;
    A.Voice.say([{ text: text }], { kind: kind || 'tap', bubble: false });
  }
  function persist() { K.saveState(P, G); A.Store.save(); }
  function promptSpeech() { return (G.order && (G.order.say || G.order.text)) || lastSay || ''; }

  function stopRace() { if (raceT) { clearInterval(raceT); raceT = null; } }
  function startRaceTick() { stopRace(); }

  function stackHtml(n, color, size) {
    var i, h = '';
    for (i = 0; i < n; i++) h += Art.cake('one', color, size || 40);
    return h;
  }
  function raceCakes(n, color) {
    var out = [], i;
    for (i = 0; i < n; i++) out.push({ uid: 'r' + color + i, kind: 'one', color: color });
    return out;
  }
  function paintRace() {
    var you = $('#pcYouStack'), they = $('#pcFriendStack');
    if (!you || !they) return;
    var vis = K.raceVisual(G);
    var yn = vis.player, fn = vis.friend;
    if (Art.has && Art.has('plate') && Art.stackStage) {
      var yTrack = you.parentNode, fTrack = they.parentNode;
      you.innerHTML = Art.stackStage(raceCakes(Math.max(yn, 0), 'gold'), {
        plateId: 'plate', interactive: false, cls: 'race',
        fitW: (yTrack && yTrack.clientWidth) || 120,
        fitH: (yTrack && yTrack.clientHeight) || 80
      });
      they.innerHTML = Art.stackStage(raceCakes(Math.max(fn, 0), 'berry'), {
        plateId: 'friend_plate', interactive: false, cls: 'race',
        fitW: (fTrack && fTrack.clientWidth) || 120,
        fitH: (fTrack && fTrack.clientHeight) || 80
      });
    } else {
      you.innerHTML = stackHtml(Math.max(yn, 0), 'gold', 36);
      they.innerHTML = stackHtml(Math.max(fn, 0), 'berry', 36);
    }
  }
  function syncStandBg() {
    var el = $('#pcStand');
    if (!el) return;
    el.classList.toggle('tall', el.clientHeight > el.clientWidth + 8);
  }

  function renderDecos(popNewest) {
    var box = $('#pcDecos'); if (!box) return;
    var newest = popNewest && G.scene && G.scene.length ? G.scene.length - 1 : -1;
    box.innerHTML = (G.scene || []).map(function (d, i) {
      return '<span class="pc-deco' + (i === newest ? ' pop' : '') + '" data-id="' + A.esc(d.id) + '">' + Art.deco(d.id, 72) + '</span>';
    }).join('');
  }

  function renderStand() {
    var who = (G.order && G.order.friend) || G.friend || P.blob;
    var boss = G.order && G.order.boss;
    $('#pcStand').innerHTML =
      '<div class="pc-awning" aria-hidden="true"></div>' +
      '<div class="pc-counter" aria-hidden="true"></div>' +
      (Art.src('griddle') ? '<div class="pc-griddle" aria-hidden="true"><img src="' + Art.src('griddle') + '" alt="">' +
        (Art.src('spatula') ? '<img class="pc-spatula" src="' + Art.src('spatula') + '" alt="">' : '') +
      '</div>' : '') +
      (boss ? '<div class="pc-banner" aria-hidden="true">' + (Art.src('boss_banner') ? '<img class="pc-banner-art" src="' + Art.src('boss_banner') + '" alt="">' : Art.deco('bunting', 120)) + '</div>' : '') +
      '<div class="pc-decos" id="pcDecos"></div>' +
      '<div class="pc-stand-inner">' +
        '<div class="pc-race you">' +
          '<div class="pc-race-label">You</div>' +
          '<div class="pc-race-track"><div class="pc-race-stack" id="pcYouStack"></div></div>' +
        '</div>' +
        '<div class="pc-race friend">' +
          '<img class="pc-friend-img" src="' + friendImg(who, pose) + '" alt="">' +
          '<div class="pc-race-label">' + A.esc(fname(who)) + '</div>' +
          '<div class="pc-race-track"><div class="pc-race-stack" id="pcFriendStack"></div></div>' +
        '</div>' +
      '</div>';
    renderDecos(false);
    syncStandBg();
    paintRace();
  }

  function orderVisual() {
    var o = G.order; if (!o) return '';
    if (o.kind === 'picture') {
      var cname = (A.Pancake.COLOR_BY[o.color] || {}).name || 'golden';
      var cakeWord = o.n === 1 ? 'pancake' : 'pancakes';
      return '<div class="pc-pic" aria-label="Picture of ' + o.n + ' ' + A.esc(cname) + ' ' + cakeWord + '">' +
        stackHtml(o.n, o.color, 48) + '</div>';
    }
    if (o.kind === 'shift10') {
      var op = o.dir === 'sub' ? 'Take away 10' : 'Add 10';
      return '<div class="pc-shift"><span class="pc-num" aria-label="Start with ' + o.start + '">' + A.esc(String(o.start)) + '</span>' +
        '<span class="pc-op">' + A.esc(op) + '</span></div>';
    }
    var num = '<div class="pc-num">' + A.esc(String(o.target)) + '</div>';
    if (o.kind === 'count' && A.CountVisual && A.CountVisual.html) {
      return num + A.CountVisual.html(o.n);
    }
    return num;
  }

  function binsFor(o) {
    if (!o) return [];
    if (o.kind === 'picture') {
      return A.Pancake.COLORS.map(function (c) { return { kind: 'one', color: c.id, label: c.name }; });
    }
    if (o.kind === 'count') {
      return [{ kind: 'one', color: 'gold', label: 'pancake' }];
    }
    var bins = [
      { kind: 'one', color: 'gold', label: 'one' },
      { kind: 'ten', color: 'gold', label: 'ten' }
    ];
    if (o.kind === 'hundreds' || (o.target >= 100 && o.kind !== 'twoway' && o.kind !== 'shift10')) {
      bins.push({ kind: 'hundred', color: 'gold', label: 'hundred' });
    }
    return bins;
  }

  function plateOpts() {
    var o = G.order;
    return {
      plateId: 'plate',
      mode: (o && o.kind === 'count') ? 'tenframe' : 'groups',
      topping: G.placedThis && G.placedThis.topping,
      pop: !!(G.placedThis && G.placedThis.topping),
      badges: !(G.plate && G.plate.length) ? false : (G.phase === 'stack' ? 'live' : true),
      interactive: G.phase === 'stack',
      fitW: 280, fitH: 200
    };
  }
  function plateCakesHtml() {
    if (Art.has && Art.has('plate') && Art.stackStage) {
      return Art.stackStage(G.plate || [], plateOpts());
    }
    var tenframe = G.order && G.order.kind === 'count';
    var html = '<div class="pc-stack' + (tenframe ? ' tenframe' : '') + '" id="pcStack">';
    (G.plate || []).forEach(function (c) {
      html += '<button type="button" class="pc-cake" data-uid="' + A.esc(c.uid) + '" data-kind="' + A.esc(c.kind) + '" aria-label="Take off a pancake">' +
        Art.cake(c.kind, c.color, c.kind === 'hundred' ? 72 : (c.kind === 'ten' ? 68 : 52)) + '</button>';
    });
    html += '</div>';
    var tops = '';
    if (G.placedThis && G.placedThis.topping) {
      tops = '<div class="pc-tops pop">' + Art.topping(G.placedThis.topping, 40) + '</div>';
    }
    return html + tops + Art.plate(240);
  }
  function layoutPlate() {
    var wrap = $('#pcPlate');
    if (!wrap || !G.order) return;
    if (!(Art.has && Art.has('plate') && Art.fitWrap)) return;
    Art.fitWrap(wrap, G.plate || [], plateOpts());
    A.$$('#pcPlate .pc-cake').forEach(function (el) {
      el.addEventListener('click', function () { takeOff(el.getAttribute('data-uid')); });
    });
  }

  function renderCard() {
    var o = G.order;
    var host = $('#pcCardHost');
    if (!o) { host.innerHTML = ''; return; }
    var ask = nudge || o.text || (o.kind === 'picture' ? 'Make a stack like the picture.' : 'Make the number.');
    var bins = binsFor(o);
    function binAria(b) {
      if (b.kind === 'hundred') return 'Add a hundred waffle';
      if (b.kind === 'ten') return 'Add a ten pancake';
      if (b.label === 'pancake') return 'Add a pancake';
      return 'Add a ' + b.label + ' pancake';
    }
    var html = '<div class="pc-card' + (o.boss ? ' boss' : '') + ((o.kind === 'count' && (o.n >= 11 || (G.plate && G.plate.length >= 11))) ? ' is-tenframe is-tenframe-wide' : (o.kind === 'count' ? ' is-tenframe' : '')) + '" id="pcCard">';
    html += '<p class="pc-ask" id="pcAsk">' + A.esc(ask) + '</p>';
    html += orderVisual();
    html += '<div class="pc-work">';
    html += '<div class="pc-bins" id="pcBins">';
    bins.forEach(function (b) {
      var artW = b.kind === 'hundred' ? 56 : (b.kind === 'ten' ? 72 : 40);
      html += '<button type="button" class="pc-bin" data-kind="' + A.esc(b.kind) + '" data-color="' + A.esc(b.color) + '" aria-label="' + A.esc(binAria(b)) + '">' +
        Art.cake(b.kind, b.color, artW) +
        '<span>' + A.esc(b.label) + '</span></button>';
    });
    html += '</div>';
    html += '<div class="pc-plate-wrap" id="pcPlate" role="region" aria-label="Your plate">' + plateCakesHtml() + '</div>';
    html += '<button type="button" class="pc-ready" id="pcReady">It\'s ready!</button>';
    html += '</div>';
    html += '<p class="pc-nudge" id="pcNudge" role="status">' + A.esc(nudge) + '</p>';
    html += '</div>';
    host.innerHTML = html;
    bindCard();
    requestAnimationFrame(function () { layoutPlate(); paintRace(); syncStandBg(); });
  }

  function bindCard() {
    A.$$('.pc-bin').forEach(function (el) {
      el.addEventListener('pointerdown', onBinDown);
      el.addEventListener('click', function (e) { e.preventDefault(); });
    });
    A.$$('.pc-cake').forEach(function (el) {
      el.addEventListener('click', function () { takeOff(el.getAttribute('data-uid')); });
    });
    if ($('#pcReady')) $('#pcReady').onclick = onReady;
  }

  function onBinDown(e) {
    if (busy || G.phase !== 'stack') return;
    e.preventDefault();
    var kind = e.currentTarget.getAttribute('data-kind');
    var color = e.currentTarget.getAttribute('data-color');
    var startX = e.clientX, startY = e.clientY, moved = false;
    drag = { kind: kind, color: color, pointer: e.pointerId, ghost: null };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    function move(ev) {
      if (!drag || ev.pointerId !== drag.pointer) return;
      if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 8) return;
      moved = true;
      if (!drag.ghost) {
        drag.ghost = A.el('<div class="pc-ghost-drag" aria-hidden="true">' + Art.cake(kind, color, 56) + '</div>');
        document.body.appendChild(drag.ghost);
      }
      drag.ghost.style.left = ev.clientX + 'px';
      drag.ghost.style.top = ev.clientY + 'px';
      var b = $('#pcPlate');
      if (b) {
        var r = b.getBoundingClientRect();
        b.classList.toggle('drop', ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom);
      }
    }
    function up(ev) {
      if (!drag || ev.pointerId !== drag.pointer) return;
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
      var over = false, b = $('#pcPlate');
      if (b && moved) {
        var r = b.getBoundingClientRect();
        over = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
        b.classList.remove('drop');
      }
      if (drag.ghost) drag.ghost.remove();
      var add = !moved || over;
      drag = null;
      if (add) addToPlate(kind, color);
    }
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
  }

  function addToPlate(kind, color) {
    if (busy || G.phase !== 'stack') return;
    G.plate = K.addCake(G.plate, kind, color);
    A.Audio.sfx('tap');
    renderCard();
  }
  function takeOff(uid) {
    if (busy || G.phase !== 'stack') return;
    G.plate = K.takeCake(G.plate, uid);
    A.Audio.sfx('tap');
    renderCard();
  }

  function onReady() {
    if (busy || G.phase !== 'stack' || !G.order) return;
    A.Audio.sfx('tap');
    if (K.checkPlate(G.order, G.plate)) {
      finishOrder();
    } else {
      K.failNudge(G);
      busy = true;
      nudge = 'That stack isn\'t quite right. Try again.';
      var wrap = $('#pcPlate');
      if (wrap) wrap.classList.add('wobble', 'slideoff');
      var nEl = $('#pcNudge'); if (nEl) nEl.textContent = nudge;
      say(nudge, 'chatter');
      var delay = (window.__pancake && typeof window.__pancake.cheerMs === 'number') ? window.__pancake.cheerMs : 600;
      setTimeout(function () {
        G.plate = K.startPlate(G.order);
        busy = false;
        renderCard();
      }, delay);
    }
  }

  function finishOrder() {
    if (!K.complete(G)) return;
    busy = true; pose = 'cheering'; nudge = '';
    G.placedThis = (G.scene && G.scene[G.scene.length - 1]) || null;
    A.Audio.sfx('pop');
    stats.orders = (stats.orders || 0) + 1;
    persist();
    renderStand();
    renderDecos(true);
    renderCard();
    say(G.order.boss ? 'What a breakfast party!' : 'Yum! Order up!', 'chatter');
    clearTimeout(cheerT);
    var delay = (window.__pancake && typeof window.__pancake.cheerMs === 'number') ? window.__pancake.cheerMs : 1600;
    cheerT = setTimeout(function () {
      busy = false;
      G.placedThis = null;
      if (G.done || G.phase === 'win') renderWin();
      else startOrder();
    }, delay);
  }

  function awardFirstDeco() {
    G.scene = (G.scene || []).slice();
    if (G.scene.some(function (d) { return d.id === 'boss_banner' && d.slot === 'first'; })) return;
    G.scene.push({ id: 'boss_banner', slot: 'first', topping: 'syrup' });
  }
  function renderWin() {
    stopRace();
    var raced = K.winsRace(G.firstTries, G.band);
    if (!stats.wonThis) {
      stats.sessions = (stats.sessions || 0) + 1;
      A.Store.earnStars(P, raced ? 2 : 1, 'pancake');
      stats.wonThis = true;
      if (raced) awardFirstDeco();
    }
    persist();
    A.Audio.sfx('win');
    var last = G.friend || (G.order && G.order.friend) || P.blob;
    var title = raced ? 'You finished first!' : 'What a breakfast party!';
    var body = raced
      ? 'You made every order and finished first. You earned an extra star!'
      : 'You made every order, even the big one. The stand looks wonderful.';
    document.body.classList.add('pc-won');
    renderStand();
    $('#pcCardHost').innerHTML =
      '<div class="pc-win-card" id="pcWin">' +
        '<img class="pc-winart" src="' + friendImg(last, 'cheering') + '" alt="">' +
        '<h2>' + A.esc(title) + '</h2>' +
        '<p>' + A.esc(body) + '</p>' +
        '<div class="pc-winbtns"><button class="pc-action" id="pcAgain">Play again</button>' +
        '<button class="pc-secondary" id="pcWinHome">Home</button></div></div>';
    renderDecos(false);
    requestAnimationFrame(function () { syncStandBg(); paintRace(); });
    $('#pcAgain').onclick = function () {
      document.body.classList.remove('pc-won');
      stats.wonThis = false;
      G = K.newSession(P);
      window.__pancake.G = G;
      startOrder();
    };
    $('#pcWinHome').onclick = home;
    say(title + ' ' + body, 'chatter');
  }

  function render() {
    if (G.phase === 'win' || G.done) { renderStand(); renderWin(); return; }
    document.body.classList.remove('pc-won');
    renderStand();
    renderCard();
  }

  function howToSeen() {
    return !!(P.howto && P.howto.pancake) || !!(P.games && P.games.pancake && P.games.pancake.howTo);
  }
  function markHowTo() {
    (P.howto || (P.howto = {})).pancake = Date.now();
    var st = P.games.pancake = P.games.pancake || {};
    st.howTo = true;
    A.Store.save();
  }
  function howToText() {
    return 'Tap a pancake to add it to your plate. Tap a pancake on the plate to take it off. Press It\'s ready when your stack matches the order.';
  }
  function renderHowTo() {
    document.body.classList.remove('pc-won');
    renderStand();
    var art = (Art.has && Art.has('pancake_gold') ? Art.cake('one', 'gold', 56) : '') +
      (Art.has && Art.has('plate') ? Art.cake('ten', 'gold', 72) : '');
    $('#pcCardHost').innerHTML =
      '<div class="pc-how" id="pcHow">' +
        '<h2>How to play</h2>' +
        '<div class="pc-how-art" aria-hidden="true">' + art + '</div>' +
        '<p id="pcHowText">' + A.esc(howToText()) + '</p>' +
        '<button type="button" class="pc-ready" id="pcHowGo">Let\'s play</button>' +
      '</div>';
    say(howToText(), 'prompt');
    $('#pcHowGo').onclick = function () {
      markHowTo();
      startOrder();
    };
  }
  function startOrder() {
    pose = 'front'; nudge = ''; busy = false;
    K.nextOrder(G, P);
    window.__pancake.G = G;
    persist();
    render();
    if (G.order) say(promptSpeech(), 'prompt');
    startRaceTick();
  }
  function boot() {
    var skip = window.__pancake && window.__pancake.skipHowTo;
    if (!skip && !howToSeen()) { renderHowTo(); return; }
    startOrder();
  }

  function home() {
    A.Voice.stop(); stopRace(); persist();
    if (!window.__noNav) location.href = A.ROOT + 'index.html?from=game#games';
  }

  $('#pcHome').onclick = home;
  $('#pcSpeak').onclick = function () { say(promptSpeech(), 'tap'); };
  window.addEventListener('resize', function () { if (G.phase !== 'win') render(); });

  window.__pancake = {
    G: G, startOrder: startOrder, render: render,
    lastSay: function () { return lastSay; },
    addCake: function (kind, color) { addToPlate(kind, color || 'gold'); },
    takeCake: function (uid) { takeOff(uid); },
    setPlate: function (plate) { G.plate = plate || []; render(); },
    serve: function () { onReady(); },
    showOrder: function (o) {
      stopRace();
      G.order = o; G.phase = 'stack'; G.done = false; G.friend = o.friend || G.friend;
      G.plate = K.startPlate(o); G.firstTry = true; G.nudged = false; nudge = '';
      document.body.classList.remove('pc-won');
      render();
    },
    jumpWin: function () {
      G.done = true; G.phase = 'win'; renderWin();
    },
    showHowTo: function () { renderHowTo(); },
    cheerMs: 1600,
    freezeRace: false,
    skipHowTo: false
  };

  boot();
})(window.Arcade);
