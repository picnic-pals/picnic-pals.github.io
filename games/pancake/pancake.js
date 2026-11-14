/* Pancake Stack Race v1 — stack pancakes to finish a breakfast order, racing a friend. */
(function (A) {
  'use strict';
  var K = A.Pancake, Art = A.PancakeArt, $ = A.$, P = A.Store && A.Store.active();
  if (!P) { location.replace(A.ROOT + 'index.html#players'); return; }

  var G = K.newSession(P);
  var stats = P.games.pancake = P.games.pancake || { sessions: 0 };
  var pose = 'front', nudge = '', drag = null, lastSay = '', busy = false, cheerT = null, raceT = null, pourT = null, resultT = null;
  var CHECK_LINE = 'When your stack is right, pour the syrup to check it!';
  var ordersStarted = 0;
  var hearTapped = 0;

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
  function resultMs() {
    if (window.__pancake && typeof window.__pancake.resultMs === 'number') return window.__pancake.resultMs;
    return 900;
  }
  function speakOrder(kind, withCheck) {
    var line = promptSpeech() || '';
    if (withCheck) {
      if (line && !/[.!?]$/.test(line)) line += '.';
      line = (line ? line + ' ' : '') + CHECK_LINE;
    }
    say(line, kind || 'prompt');
  }
  function syrupCheckSvg(cls, w) {
    w = w || 28;
    return '<svg class="' + (cls || 'pc-syrup-check') + '" viewBox="0 0 24 24" width="' + w + '" height="' + w + '" aria-hidden="true"><path d="M20.3 6.3a1.5 1.5 0 0 0-2.1 0L10 14.5 5.8 10.3a1.5 1.5 0 0 0-2.1 2.1l5.3 5.3a1.5 1.5 0 0 0 2.1 0l9.2-9.2a1.5 1.5 0 0 0 0-2.2z" fill="#1b8a54"/></svg>';
  }

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


  function bottleSvg(h) {
    h = h || 80;
    var w = Math.round(h * 0.72);
    return '<svg class="pc-pour-bottle" viewBox="0 0 72 100" width="' + w + '" height="' + h + '" aria-hidden="true">' +
      '<rect x="26" y="2" width="20" height="11" rx="3" fill="#8a3a12" stroke="#5a3d1c" stroke-width="2.5"/>' +
      '<rect x="23" y="10" width="26" height="7" rx="2" fill="#c45c14" stroke="#5a3d1c" stroke-width="2"/>' +
      '<path d="M30 17 h12 v9 c0 3 4 6 4 10 v5 H26 V36 c0-4 4-7 4-10z" fill="#fff3e0" stroke="#5a3d1c" stroke-width="2.5"/>' +
      '<path d="M22 41 c0-6 6-10 14-10 h0 c8 0 14 4 14 10 v42 c0 10-6 16-14 16 s-14-6-14-16z" fill="#fff8ee" stroke="#5a3d1c" stroke-width="2.5"/>' +
      '<path d="M25 58 c2 0 22-2 22 2 v23 c0 8-5 13-11 13 s-11-5-11-13z" fill="#e07a22" opacity=".95"/>' +
      '<path d="M25 60 c8 4 16 0 22 3" fill="none" stroke="#ffcc66" stroke-width="2" opacity=".75"/>' +
      '<path d="M28 48 c0 14 0 26 0 34" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>' +
      '<ellipse cx="36" cy="8" rx="5" ry="3" fill="#5a2208"/>' +
      '<rect x="29" y="68" width="14" height="11" rx="2" fill="#fff3c4" stroke="#5a3d1c" stroke-width="1.3"/>' +
      '</svg>';
  }
  function artSrc(id, file) {
    var s = Art && Art.src && Art.src(id);
    return s || ('../../art/pancake/' + (file || (id + '.webp')));
  }
  function pourMarkup() {
    var puddle = artSrc('topping_syrup', 'topping_syrup.webp');
    var up = artSrc('syrup_bottle_upright', 'syrup_bottle_upright.webp');
    var pour = artSrc('syrup_bottle_pour', 'syrup_bottle_pour.webp');
    var stream = artSrc('syrup_stream', 'syrup_stream.webp');
    var cork = artSrc('syrup_cork', 'syrup_cork.webp');
    /* Locked v2 jug. Pour sprite 463x374, spout_tip (48,305), stream dest (-16,305). */
    return '<div class="pc-pour" id="pcPour" hidden aria-hidden="true">' +
      '<div class="pc-pour-fx">' +
        '<div class="pc-pour-stream"><div class="pc-stream-line" style="background-image:url(\'' + stream + '\')"></div></div>' +
        '<span class="pc-pour-spout"></span>' +
        '<img class="pc-pour-bottle pc-pour-jug-pour" src="' + pour + '" alt="" draggable="false">' +
        '<img class="pc-pour-jug-up" src="' + up + '" alt="" draggable="false">' +
        '<img class="pc-pour-cork" src="' + cork + '" alt="" draggable="false">' +
      '</div>' +
      '<div class="pc-pour-coat">' +
        '<div class="pc-pour-puddle"><img src="' + puddle + '" alt="" draggable="false"></div>' +
        '<svg class="pc-pour-drips" viewBox="0 0 100 160" preserveAspectRatio="none" aria-hidden="true">' +
          '<path class="drip d1" d="M28 4 C 22 34 32 62 24 94 C 18 122 30 142 26 158" fill="none" stroke="#c45c14" stroke-width="8" stroke-linecap="round"/>' +
          '<path class="drip d2" d="M72 6 C 80 38 66 70 74 102 C 80 126 68 146 72 158" fill="none" stroke="#d96a18" stroke-width="9" stroke-linecap="round"/>' +
          '<path class="drip d3" d="M50 2 C 46 48 56 96 50 140" fill="none" stroke="#e07a22" stroke-width="5" stroke-linecap="round" opacity=".8"/>' +
          '<ellipse class="pool p1" cx="24" cy="100" rx="11" ry="6" fill="#c45c14"/>' +
          '<ellipse class="pool p2" cx="76" cy="126" rx="13" ry="7" fill="#d96a18"/>' +
          '<ellipse class="pool p3" cx="50" cy="152" rx="18" ry="8" fill="#b84a0c"/>' +
        '</svg>' +
      '</div>' +
    '</div>';
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
    var over = K.overBy ? K.overBy(o, G.plate) : 0;
    var wlv = K.wobbleLevel ? K.wobbleLevel(over) : 0;
    html += '<div class="pc-plate-col">';
    html += '<div class="pc-plate-wrap' + (wlv ? ' wobble wobble-' + wlv : '') + '" id="pcPlate" role="region" aria-label="Your plate">' + plateCakesHtml() + '</div>';
    html += '<div class="pc-pour-fb" id="pcPourFb" hidden></div>';
    html += pourMarkup() + '</div>';
    html += '<button type="button" class="pc-syrup' + (ordersStarted > 0 && ordersStarted <= 2 ? ' hint' : '') + '" id="pcReady" aria-label="Check with syrup. Pour when you think the stack is right.">' +
      syrupCheckSvg() +
      '<img class="pc-syrup-art" src="' + artSrc('syrup_bottle_upright', 'syrup_bottle_upright.webp') + '" alt="" width="22" height="32" draggable="false">' +
      '<span>Check with syrup</span></button>';
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
    var syr = $('#pcReady');
    if (syr) {
      if (A.UI && A.UI.onTap) A.UI.onTap(syr, onReady);
      else syr.onclick = onReady;
    }
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

  function pourMs() {
    if (window.__pancake && typeof window.__pancake.pourMs === 'number') return window.__pancake.pourMs;
    return 1300;
  }
  function visBox(el) {
    if (!el) return null;
    var hit = el.querySelector && el.querySelector('.pc-hit');
    if (hit) {
      var r = hit.getBoundingClientRect();
      if (r.width >= 8 && r.height >= 8) return r;
    }
    return el.getBoundingClientRect();
  }
  function aimPour(opts) {
    var wrap = $('#pcPlate'), pour = $('#pcPour'), col = wrap && wrap.parentNode;
    if (!wrap || !pour || !col || !col.getBoundingClientRect) return null;
    var colR = col.getBoundingClientRect();
    var cakes = [].slice.call(wrap.querySelectorAll('.pc-cake'));
    var aimX, aimY, stackW, stackH;
    if (!cakes.length) {
      var stage = wrap.querySelector('.pc-stack-stage, .pc-stack') || wrap;
      var r = stage.getBoundingClientRect();
      aimX = r.left + r.width / 2 - colR.left;
      aimY = r.top + Math.min(r.height * 0.22, 28) - colR.top;
      stackW = Math.max(64, Math.min(r.width * 0.4, 140));
      stackH = Math.max(40, r.height * 0.35);
    } else {
      var best = cakes[0], br = visBox(best);
      cakes.forEach(function (c) {
        var cr = visBox(c);
        if (cr.top < br.top - 1) { best = c; br = cr; }
        else if (Math.abs(cr.top - br.top) <= 1 && cr.width > br.width) { best = c; br = cr; }
      });
      var group = best.getAttribute('data-group');
      var set = group ? cakes.filter(function (c) { return c.getAttribute('data-group') === group; }) : [best];
      var u = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
      set.forEach(function (c) {
        var cr = visBox(c);
        u.left = Math.min(u.left, cr.left); u.top = Math.min(u.top, cr.top);
        u.right = Math.max(u.right, cr.right); u.bottom = Math.max(u.bottom, cr.bottom);
      });
      var topR = br;
      aimX = topR.left + topR.width * 0.62 - colR.left;
      aimY = topR.top + Math.max(4, topR.height * 0.12) - colR.top;
      stackW = Math.max(56, Math.min(u.right - u.left, topR.width * 1.15));
      stackH = Math.max(40, u.bottom - u.top);
    }
    pour.style.setProperty('--aim-x', aimX + 'px');
    pour.style.setProperty('--aim-y', aimY + 'px');
    pour.style.setProperty('--stack-w', stackW + 'px');
    pour.style.setProperty('--stack-h', stackH + 'px');
    void pour.offsetWidth;
    if (!opts || opts.nudge !== false) nudgeBottle(pour);
    return { aimX: aimX, aimY: aimY, stackW: stackW, stackH: stackH };
  }
  function rectsOverlap(a, b, pad) {
    pad = pad == null ? 4 : pad;
    return !!a && !!b && a.right > b.left + pad && a.left < b.right - pad && a.bottom > b.top + pad && a.top < b.bottom - pad;
  }
  function tightBottleBox(el) {
    var r = el.getBoundingClientRect();
    var insetL = r.width * 0.08, insetT = r.height * 0.12, insetR = r.width * 0.06, insetB = r.height * 0.1;
    return { left: r.left + insetL, top: r.top + insetT, right: r.right - insetR, bottom: r.bottom - insetB };
  }
  function nudgeBottle(pour) {
    if (!pour) return;
    var bottle = pour.querySelector('.pc-pour-bottle');
    if (!bottle) return;
    var nums = A.$$('#pcAsk, .pc-ask, .pc-num');
    var bins = A.$$('.pc-bin');
    var cakes = A.$$('#pcPlate .pc-cake');
    var topR = null;
    cakes.forEach(function (c) {
      var r = visBox(c);
      if (!topR || r.top < topR.top - 1) topR = r;
    });
    var viewR = (window.innerWidth || 412) - 4;
    var dx = 0, dy = 0, i, raw, tight, hit, j, p, stream, sr, mid;
    function bottleHits() {
      raw = bottle.getBoundingClientRect();
      tight = tightBottleBox(bottle);
      for (j = 0; j < nums.length; j++) {
        p = nums[j].getBoundingClientRect();
        /* Negative pad keeps a few pixels of air around Make N. / the order number. */
        if (p.width >= 4 && rectsOverlap(raw, p, -6)) return 'num';
      }
      for (j = 0; j < bins.length; j++) {
        p = bins[j].getBoundingClientRect();
        if (p.width >= 4 && rectsOverlap(tight, p, 2)) return 'bin';
      }
      return null;
    }
    function streamOk() {
      stream = pour.querySelector('.pc-stream-line, .pc-pour-stream');
      sr = stream && stream.getBoundingClientRect();
      if (!sr || sr.width + sr.height <= 0) return true;
      mid = (sr.left + sr.right) / 2;
      if (topR && mid > topR.right - 4) return false;
      if (topR && sr.bottom > topR.top + 40) return false;
      return true;
    }
    pour.classList.add('measure');
    void pour.offsetWidth;
    for (i = 0; i < 16; i++) {
      pour.style.setProperty('--pour-dx', dx + 'px');
      void pour.offsetWidth;
      raw = bottle.getBoundingClientRect();
      if (i > 0 && raw.right > viewR) {
        dx -= 8;
        pour.style.setProperty('--pour-dx', dx + 'px');
        break;
      }
      hit = bottleHits();
      if (!hit) break;
      if (!streamOk()) {
        dx -= 8;
        pour.style.setProperty('--pour-dx', Math.max(0, dx) + 'px');
        break;
      }
      dx += 8;
    }
    /* If a horizontal shift would pull the stream off the stack, drop the jug instead. */
    void pour.offsetWidth;
    if (bottleHits()) {
      for (i = 0; i < 8; i++) {
        dy += 4;
        pour.style.setProperty('--pour-dy', dy + 'px');
        void pour.offsetWidth;
        if (!streamOk()) {
          dy -= 4;
          pour.style.setProperty('--pour-dy', Math.max(0, dy) + 'px');
          break;
        }
        if (!bottleHits()) break;
      }
    }
    pour.classList.remove('measure');
  }
  function playPour(then) {
    var wrap = $('#pcPlate'), pour = $('#pcPour'), col = wrap && wrap.parentNode;
    if (wrap) {
      wrap.classList.add('pouring');
      wrap.classList.remove('wobble', 'wobble-1', 'wobble-2', 'wobble-3');
    }
    if (col && col.classList) col.classList.add('pouring');
    if (pour) {
      pour.hidden = false;
      pour.setAttribute('aria-hidden', 'false');
      pour.classList.remove('on');
      aimPour({ nudge: false });
      void pour.offsetWidth;
      pour.classList.add('on');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          nudgeBottle(pour);
        });
      });
    }
    A.Audio.sfx('soft');
    var ms = pourMs();
    if (ms <= 0) { if (then) then(); return; }
    clearTimeout(pourT);
    pourT = setTimeout(function () { pourT = null; if (then) then(); }, ms);
  }
  function onReady() {
    if (busy || G.phase !== 'stack' || !G.order) return;
    A.Audio.sfx('tap');
    busy = true;
    playPour(function () {
      var wrap = $('#pcPlate'), pour = $('#pcPour');
      if (pour) { pour.hidden = true; pour.setAttribute('aria-hidden', 'true'); }
      if (wrap) wrap.classList.remove('pouring');
      if (wrap && wrap.parentNode && wrap.parentNode.classList) wrap.parentNode.classList.remove('pouring');
      var ok = K.checkPlate(G.order, G.plate);
      showPourFeedback(ok, function () {
        if (ok) {
          busy = false;
          finishOrder();
        } else {
          K.failNudge(G);
          var over = K.overBy ? K.overBy(G.order, G.plate) : 0;
          nudge = 'Not yet, try again';
          var wlv = K.wobbleLevel ? K.wobbleLevel(Math.max(over, 1)) : 1;
          if (wrap) {
            wrap.classList.remove('wobble-1', 'wobble-2', 'wobble-3');
            wrap.classList.add('wobble', 'wobble-' + wlv);
          }
          var nEl = $('#pcNudge'); if (nEl) nEl.textContent = nudge;
          say(nudge, 'chatter');
          busy = false;
        }
      });
    });
  }

  function showPourFeedback(ok, then) {
    var fb = $('#pcPourFb');
    if (fb) {
      fb.hidden = false;
      fb.setAttribute('aria-hidden', 'false');
      fb.className = 'pc-pour-fb on ' + (ok ? 'ok' : 'miss');
      fb.innerHTML = ok
        ? '<span class="pc-pour-check" role="img" aria-label="Right">' + syrupCheckSvg('pc-pour-check-mark', 120) + '</span>'
        : '<span class="pc-pour-miss">Not yet, try again</span>';
    }
    var ms = resultMs();
    if (ms <= 0) { if (then) then(); return; }
    clearTimeout(resultT);
    resultT = setTimeout(function () { resultT = null; if (then) then(); }, ms);
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
    return 'Tap a pancake to add it to your plate. Tap a pancake on the plate to take it off. Tap Check with syrup when you think the stack is right.';
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
    ordersStarted++;
    render();
    if (G.order) speakOrder('prompt', ordersStarted === 1);
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
  $('#pcSpeak').onclick = function () { hearTapped += 1; speakOrder('tap', hearTapped === 1); };
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
      clearTimeout(pourT); pourT = null;
      clearTimeout(resultT); resultT = null;
      clearTimeout(cheerT); cheerT = null;
      busy = false; pose = 'front';
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
    pourMs: 1300,
    resultMs: 900,
    CHECK_LINE: CHECK_LINE,
    aimPour: aimPour, nudgeBottle: nudgeBottle,
    freezeRace: false,
    skipHowTo: false
  };

  boot();
})(window.Arcade);
