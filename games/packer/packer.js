/* Picnic Packer v1 — pack a friend's order; decorations pop onto the meadow. Optional timer. */
(function (A) {
  'use strict';
  A.UI.boot();
  var P = A.Store.active();
  if (!P) { location.replace(A.ROOT + 'index.html#players'); return; }
  var K = A.Packer, $ = A.$, I = A.Icons;
  var stats = P.games.packer = P.games.packer || { sessions: 0, orders: 0, timer: false };
  var G = K.newSession(P);
  G.timerOn = !!stats.timer;
  var pose = 'front', nudgeText = '', idleT = null, timerIv = null, timerLeft = 0, timerLimit = 0, busy = false;
  var drag = null, cheerT = null;

  function icon(key, size, cls) {
    return I ? I.html(key, { size: size || 48, decorative: true, cls: 'pp-pic' + (cls ? ' ' + cls : ''), slot: 'packer:' + key + ':' + (cls || '') }) : '';
  }
  function fname(id) {
    var c = (A.FoodData && A.FoodData.cast || []).filter(function (f) { return f.id === id; })[0];
    return (c && c.name) || (A.Blobs && A.Blobs.byId && A.Blobs.byId[id] && A.Blobs.byId[id].name) || 'Friend';
  }
  function friendImg(id, ex) {
    return A.ROOT + 'assets/picnic/friends/' + id + '/' + (ex || 'front') + '_256.webp';
  }
  function say(text, kind) {
    if (!text) return;
    A.Voice.say([{ text: text }], { kind: kind || 'tap', bubble: false });
  }
  function orderText() { return (G.order && G.order.say) || ''; }
  function foodIcon(id, size) { var f = K.BY[id]; return icon(f ? f.icon : id, size || 48, 'food-' + id); }
  function decoIcon(id, size) {
    var d, i;
    for (i = 0; i < K.DECOS.length; i++) if (K.DECOS[i].id === id) d = K.DECOS[i];
    return icon(d ? d.icon : id, size || 64, 'deco-' + id);
  }
  function decoName(id) {
    for (var i = 0; i < K.DECOS.length; i++) if (K.DECOS[i].id === id) return K.DECOS[i].name;
    return 'decoration';
  }

  function headerIcons() {
    var t = $('#pkTimer'), s = $('#pkSpeak');
    if (t && !t.querySelector('.pp-icon')) t.innerHTML = icon('ui.timer', 32, 'timer');
    if (s && !s.querySelector('.pp-icon')) s.innerHTML = icon('ui.speaker', 32, 'speak');
    syncTimerBtn();
  }
  function syncTimerBtn() {
    var t = $('#pkTimer');
    if (!t) return;
    t.classList.toggle('on', !!G.timerOn);
    t.setAttribute('aria-pressed', G.timerOn ? 'true' : 'false');
    t.setAttribute('aria-label', G.timerOn ? 'Turn the optional timer off' : 'Turn the optional timer on');
    var mark = t.querySelector('.pk-off-mark');
    if (!G.timerOn && !mark) { mark = document.createElement('span'); mark.className = 'pk-off-mark'; mark.setAttribute('aria-hidden', 'true'); t.appendChild(mark); }
    if (G.timerOn && mark) mark.remove();
  }

  function orderPics(o) {
    if (!o || !o.want) return '';
    var have = K.countsOf(G.basket || []);
    var h = '<div class="pk-pics">';
    Object.keys(o.want).forEach(function (id) {
      var need = o.want[id], got = have[id] || 0, k, slots = '';
      var packed = Math.min(got, need), extra = Math.max(0, got - need);
      var done = packed >= need && extra === 0;
      var showNum = o.kind !== 'picture' || need > 5;
      var cls = 'pk-group' + (done ? ' pk-done' : '') + (extra ? ' pk-over' : '') + (packed < need ? ' pk-short' : '');
      if (need <= 8) {
        for (k = 0; k < need; k++) {
          slots += '<span class="pk-slot' + (k < packed ? ' packed' : ' empty') + '">' + foodIcon(id, 48) +
            (k < packed ? '<i class="pk-slot-ok" aria-hidden="true"></i>' : '') + '</span>';
        }
      } else {
        slots += foodIcon(id, 48) + '<span class="pk-pips" aria-hidden="true">';
        for (k = 0; k < need; k++) slots += '<i class="pk-pip' + (k < packed ? ' on' : '') + '"></i>';
        slots += '</span>';
      }
      for (k = 0; k < Math.min(extra, 3); k++) {
        slots += '<span class="pk-slot extra">' + foodIcon(id, 48) + '</span>';
      }
      h += '<span class="' + cls + '" data-id="' + A.esc(id) + '" data-need="' + need + '" data-have="' + got + '" aria-label="' + A.esc(K.phrase(id, need)) + '">';
      if (showNum) h += '<b class="pk-num">' + packed + '<span class="pk-needn">/' + need + '</span></b>';
      h += slots;
      if (done) h += icon('ui.check', 28, 'done');
      h += '</span>';
    });
    return h + '</div>';
  }

  /* Locked art is 512x384. Front lip at center is y=210. JS seats a staggered
     pile in the mouth so each food stays large and countable. */
  var RIM_CURVE = [
    [0.19, 0.438], [0.22, 0.445], [0.25, 0.469], [0.28, 0.492],
    [0.31, 0.513], [0.34, 0.526], [0.38, 0.536], [0.44, 0.547],
    [0.50, 0.547], [0.53, 0.544], [0.56, 0.539], [0.59, 0.531],
    [0.62, 0.521], [0.66, 0.464], [0.75, 0.440]
  ];
  function rimAt(xf) {
    var c = RIM_CURVE, i;
    if (xf <= c[0][0]) return c[0][1];
    for (i = 1; i < c.length; i++) {
      if (xf <= c[i][0]) {
        var t = (xf - c[i - 1][0]) / (c[i][0] - c[i - 1][0]);
        return c[i - 1][1] + t * (c[i][1] - c[i - 1][1]);
      }
    }
    return c[c.length - 1][1];
  }
  function rowPlan(n) {
    if (n <= 0) return [];
    if (n <= 3) return [n];
    if (n === 4) return [2, 2];
    if (n === 5) return [3, 2];
    if (n === 6) return [3, 3];
    if (n === 7) return [3, 2, 2];
    if (n === 8) return [3, 3, 2];
    if (n === 9) return [3, 3, 3];
    if (n === 10) return [3, 4, 3];
    if (n === 11) return [4, 4, 3];
    return [4, 4, n - 8];
  }
  function layoutBasket() {
    var art = document.querySelector('#pkBasket.has-art .pk-basket-art');
    var box = $('#pkItems');
    if (!art || !box) return;
    var items = A.$$('#pkItems .pk-item');
    var W = art.clientWidth, H = art.clientHeight;
    if (!W || !H) return;
    var n = items.length;
    if (!n) return;
    var base = 56;
    var mouth0 = 0.26, mouth1 = 0.58;
    var mouthW = (mouth1 - mouth0) * W;
    var plan = rowPlan(n);
    var frontN = plan[0] || 1;
    var size = Math.min(base * 1.65, Math.max(base, mouthW / Math.max(1, frontN + 0.15)));
    if (frontN > 1) {
      var fit = mouthW / (frontN - 0.12 * (frontN - 1));
      if (fit < size) size = Math.max(48, fit);
    }
    var tuck = -0.02;  // bottoms just under or at the rim; most of each food stays visible above the wall
    var rise = size / H * 0.88;  // rise enough that back rows are not buried under the front row
    var i, r, row, count, span, start, step, k, xf, yb, el;
    var idx = 0;
    for (r = 0; r < plan.length; r++) {
      count = plan[r];
      // Back rows sit in a slightly narrower band (handle / cloth).
      var x0 = mouth0 + r * 0.02;
      var x1 = mouth1 - r * 0.015;
      // Stagger odd rows toward the gaps of the row in front.
      if (r % 2 === 1) {
        var inset = (x1 - x0) / (Math.max(plan[r - 1], count) * 2);
        x0 += inset;
        x1 -= inset;
      }
      if (count === 1) { start = (x0 + x1) / 2; step = 0; }
      else { start = x0; step = (x1 - x0) / (count - 1); }
      for (k = 0; k < count && idx < n; k++, idx++) {
        xf = count === 1 ? start : start + step * k;
        // Front row tucks under the local rim; back rows rise from that floor.
        yb = rimAt(xf) + (size / H) * tuck - r * rise;
        el = items[idx];
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        el.style.left = (xf * 100) + '%';
        el.style.top = (yb * 100) + '%';
        el.style.transform = 'translate(-50%, -100%)';
        el.style.zIndex = String(20 - r);
        var ic = el.querySelector('.pp-icon, .pp-emoji');
        if (ic) { ic.style.width = '100%'; ic.style.height = '100%'; }
      }
    }
  }

  function renderOrder() {
    var o = G.order;
    if (!o) return;
    hideHand();
    var who = (o.boss ? 'Picnic Boss ' : '') + fname(o.friend) + (o.boss ? ' has a big order!' : ' says:');
    var crown = o.boss ? '<span class="pk-crown">' + icon('gaps.crown', 48, 'crown') + '</span>' : '';
    var extras = extraUidSet(G.basket, o.want);
    var items = G.basket.map(function (it) {
      return '<button class="pk-item' + (it.pre ? ' pre' : '') + (extras[it.uid] ? ' extra' : '') + '" data-uid="' + A.esc(it.uid) + '" data-id="' + A.esc(it.id) + '" aria-label="Take out ' + A.esc(K.noun(it.id, 1)) + '">' + foodIcon(it.id, 96) + '</button>';
    }).join('');
    var bins = o.bins.map(function (id) {
      return '<button class="pk-bin" data-id="' + id + '" aria-label="Add ' + A.esc(K.noun(id, 1)) + '">' + foodIcon(id, 128) + '</button>';
    }).join('');
    var bar = (G.timerOn && !G.band.toddler) ? '<div class="pk-timerbar' + (timerLeft / Math.max(1, timerLimit) <= 0.25 ? ' low' : '') + '" id="pkTimerBar" aria-hidden="true"><i style="transform:scaleX(' + (timerLimit ? timerLeft / timerLimit : 0) + ')"></i></div>' : '';
    $('#pkContent').innerHTML =
      '<div class="pk-card' + (o.boss ? ' boss' : '') + '" id="pkCard">' +
        '<div class="pk-who">' + A.esc(who) + '</div>' +
        '<button class="pk-cardspeak" id="pkCardSpeak" aria-label="Read the order aloud">' + icon('ui.speaker', 32, 'cardspeak') + '</button>' +
        '<p class="pk-ask" id="pkAsk">' + A.esc(o.text) + '</p>' +
        orderPics(o) +
      '</div>' +
      bar +
      '<div class="pk-play">' +
        '<div class="pk-row">' +
          '<div class="pk-friend">' + crown + '<img src="' + friendImg(o.friend, pose) + '" alt="" draggable="false">' +
            '<span class="pk-fname">' + A.esc(fname(o.friend)) + '</span></div>' +
          '<div class="pk-basket has-art" id="pkBasket" role="region" aria-label="Basket">' +
            '<div class="pk-basket-art">' +
              '<div class="pk-basket-handle" aria-hidden="true"></div>' +
              '<div class="pk-basket-back" aria-hidden="true"></div>' +
              '<div class="pk-items" id="pkItems">' + items + '</div>' +
              '<div class="pk-basket-front" aria-hidden="true"></div>' +
            '</div>' +
            '<span class="pk-count" title="' + A.esc(K.countLabel ? K.countLabel(G.basket) : String(G.basket.length)) + '" aria-label="' + A.esc(K.countLabel ? K.countLabel(G.basket) : (G.basket.length + ' items')) + '">' + A.esc(K.countLabel ? K.countLabel(G.basket) : String(G.basket.length)) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="pk-shelf" id="pkShelf">' + bins + '</div>' +
      '</div>' +
      '<p class="pk-nudge" id="pkNudge" role="status">' + A.esc(nudgeText) + '</p>';
    bindOrder();
    renderFestoon();
    layoutBasket();
    requestAnimationFrame(layoutBasket);
  }

  function bindOrder() {
    var speak = $('#pkCardSpeak'); if (speak) speak.onclick = function () { say(orderText(), 'tap'); };
    A.$$('.pk-bin').forEach(function (el) {
      el.addEventListener('pointerdown', onBinDown);
      el.addEventListener('click', function (e) { e.preventDefault(); });
    });
    A.$$('.pk-item').forEach(function (el) {
      el.addEventListener('click', function () { takeOut(el.getAttribute('data-uid')); });
    });
  }

  function onBinDown(e) {
    if (busy || G.phase !== 'order') return;
    e.preventDefault();
    var id = e.currentTarget.getAttribute('data-id');
    var startX = e.clientX, startY = e.clientY, moved = false;
    drag = { id: id, pointer: e.pointerId, ghost: null };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    function move(ev) {
      if (!drag || ev.pointerId !== drag.pointer) return;
      if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 8) return;
      moved = true;
      if (!drag.ghost) {
        drag.ghost = A.el('<div class="pk-ghost-drag" aria-hidden="true">' + foodIcon(id, 56) + '</div>');
        document.body.appendChild(drag.ghost);
      }
      drag.ghost.style.left = ev.clientX + 'px';
      drag.ghost.style.top = ev.clientY + 'px';
      var b = $('#pkBasket');
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
      var over = false, b = $('#pkBasket');
      if (b && moved) {
        var r = b.getBoundingClientRect();
        over = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
        b.classList.remove('drop');
      }
      if (drag.ghost) drag.ghost.remove();
      var add = !moved || over;
      drag = null;
      if (add) addToBasket(id, { juice: true });
    }
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
  }

  function addToBasket(id, opt) {
    if (busy || G.phase !== 'order' || !K.BY[id]) return;
    G.basket = K.addItem(G.basket, id);
    A.Audio.sfx('tap');
    afterChange(opt && opt.juice ? 'in' : '', id);
  }
  function takeOut(uid) {
    if (busy || G.phase !== 'order') return;
    G.basket = K.takeOut(G.basket, uid);
    A.Audio.sfx('tap');
    afterChange();
  }

  function extraUidSet(basket, want) {
    var counts = {}, extra = {}, i, it;
    for (i = 0; i < (basket || []).length; i++) {
      it = basket[i];
      counts[it.id] = (counts[it.id] || 0) + 1;
      if (counts[it.id] > ((want && want[it.id]) || 0)) extra[it.uid] = true;
    }
    return extra;
  }
  function issueNudge() {
    if (!G.order) return '';
    var extras = K.extraKinds ? K.extraKinds(G.basket, G.order.want) : [];
    if (extras.length) {
      var nm = K.noun(extras[0], 1), wantIds = Object.keys(G.order.want || {}), instead = wantIds.length === 1 ? K.noun(wantIds[0], 1) : null;
      return instead ? ('The ' + nm + ' is not a ' + instead + '. Take the ' + nm + ' out.') : ('The ' + nm + ' is not on the order. Take the ' + nm + ' out.');
    }
    if (K.overfilled(G.basket, G.order.want)) {
      var too = K.overfilledId ? K.overfilledId(G.basket, G.order.want) : null;
      return too ? ('That is too many ' + K.noun(too, 2) + '. Take one out.') : 'That looks like a little too much. Tap a food in the basket to take it out.';
    }
    return '';
  }
  function flashWrong(id) {
    var item = document.querySelector('#pkItems .pk-item.extra[data-id="' + id + '"]') ||
      document.querySelector('#pkItems .pk-item.extra:last-child') ||
      document.querySelector('#pkItems .pk-item:last-child');
    var bin = document.querySelector('.pk-bin[data-id="' + id + '"]');
    var group = document.querySelector('.pk-group[data-id="' + id + '"]');
    [item, bin, group].forEach(function (el) {
      if (!el) return;
      el.classList.remove('pk-wrong');
      void el.offsetWidth;
      el.classList.add('pk-wrong');
    });
  }
  var HAND_SVG = '<svg class="pk-hand-svg" viewBox="0 0 64 64" width="64" height="64" aria-hidden="true" focusable="false"><path fill="#ffe0b0" stroke="#5a3d1c" stroke-width="2.4" stroke-linejoin="round" d="M28 8c2.4-1 5.4.4 6.2 3.2l3.2 12.2 1.2-6.2c.7-3 4-4.2 6.4-2.6 2 1.3 2.6 4 1.6 6.3l-3.4 8.2 6.4-3c2.6-1.2 5.8.2 6.6 3 .8 2.8-.8 5.6-3.6 6.5L38 40.2l1.2 14.4c.2 2.6-1.8 4.8-4.4 4.8h-8.2c-2.2 0-4-1.6-4.4-3.8L19.6 40.6c-3.6-2.2-5.8-6.2-5.8-10.5V22c0-2.8 2.4-5 5.2-4.8 2.2.2 4 2 4.4 4.2l1.2 6.2V12.4C24.6 10 26.2 8.4 28 8z"/><circle cx="24.5" cy="18.5" r="1.6" fill="#5a3d1c"/><circle cx="31.5" cy="17.5" r="1.6" fill="#5a3d1c"/><path d="M24 23.5c2 2 6.6 2 8.4 0" fill="none" stroke="#5a3d1c" stroke-width="1.8" stroke-linecap="round"/></svg>';
  function hideHand() {
    var h = $('#pkHand');
    if (h && h.parentNode) h.parentNode.removeChild(h);
  }
  function hostLocal(host, clientX, clientY) {
    var r = host.getBoundingClientRect();
    var scale = host.offsetWidth ? (r.width / host.offsetWidth) : 1;
    if (!scale) scale = 1;
    return { x: (clientX - r.left) / scale, y: (clientY - r.top) / scale };
  }
  function placeHand(target) {
    if (!target) return;
    var host = document.getElementById('packer') || document.body;
    hideHand();
    var hand = A.el('<div class="pk-hand" id="pkHand" aria-hidden="true">' + HAND_SVG + '</div>');
    host.appendChild(hand);
    var r = target.getBoundingClientRect();
    var pt = hostLocal(host, r.left + r.width * 0.65, r.top + r.height * 0.15);
    hand.style.left = pt.x + 'px';
    hand.style.top = pt.y + 'px';
  }
  function nextIdleTarget() {
    if (!G.order || G.phase !== 'order') return null;
    var extraEl = document.querySelector('#pkItems .pk-item.extra');
    if (extraEl) return extraEl;
    if (K.overfilled(G.basket, G.order.want)) {
      var too = K.overfilledId(G.basket, G.order.want);
      var over = too && document.querySelector('#pkItems .pk-item[data-id="' + too + '"]:last-of-type');
      if (over) return over;
      return document.querySelector('#pkItems .pk-item');
    }
    var miss = K.missing(G.basket, G.order.want);
    var id = Object.keys(miss)[0];
    if (id) return document.querySelector('.pk-bin[data-id="' + id + '"]');
    return document.querySelector('.pk-bin');
  }
  function showIdleHand() {
    if (G.phase !== 'order' || busy) return null;
    var t = nextIdleTarget();
    if (t) placeHand(t);
    return t;
  }

  function juiceDrop() {
    var b = $('#pkBasket');
    if (!b) return;
    b.classList.remove('sag'); void b.offsetWidth; b.classList.add('sag');
    var last = b.querySelector('.pk-item:last-child');
    if (last) { last.classList.remove('pk-flyin'); void last.offsetWidth; last.classList.add('pk-flyin'); }
    var badge = b.querySelector('.pk-count');
    if (badge) { badge.classList.remove('tick'); void badge.offsetWidth; badge.classList.add('tick'); }
  }
  function afterChange(juice, lastId) {
    pokeIdle();
    hideHand();
    if (K.matches(G.basket, G.order.want)) {
      busy = true; nudgeText = '';
      renderOrder();
      if (juice === 'in') juiceDrop();
      setTimeout(function () { finishOrder(); }, 450);
    } else {
      nudgeText = issueNudge() || '';
      var wrong = !!(lastId && (K.extraKinds(G.basket, G.order.want).indexOf(lastId) >= 0 ||
        ((K.countsOf(G.basket)[lastId] || 0) > ((G.order.want && G.order.want[lastId]) || 0))));
      renderOrder();
      if (juice === 'in') juiceDrop();
      if (wrong) flashWrong(lastId);
    }
  }
  function renderFestoon(popNewest) {
    var el = $('#pkFestoon');
    if (!el) return;
    var newest = popNewest && G.scene && G.scene.length ? G.scene.length - 1 : -1;
    el.innerHTML = (G.scene || []).map(function (d, i) {
      var size = d.id === 'bunting' ? 256 : (d.id === 'rainbow' ? 120 : 80);
      return '<span class="pk-deco' + (i === newest ? ' pop' : '') + (d.slot ? ' slot-' + d.slot : '') + '" data-id="' + A.esc(d.id) + '"' +
        (d.slot ? '' : ' style="left:' + d.x + '%;top:' + d.y + '%"') + '>' +
        decoIcon(d.id, d.id === 'bunting' ? 256 : 128) + '</span>';
    }).join('');
  }

  function finishOrder() {
    if (!K.complete(G)) { busy = false; return; }
    pose = 'cheering';
    A.Audio.sfx('pop');
    stats.orders = (stats.orders || 0) + 1;
    K.saveState(P, G); A.Store.save();
    nudgeText = '';
    stopTimer();
    renderOrder();
    renderFestoon(true);
    say(G.order.boss ? 'What a picnic! You packed the big order!' : 'Packed!', 'chatter');
    clearTimeout(cheerT);
    var delay = (window.__packer && typeof window.__packer.cheerMs === 'number') ? window.__packer.cheerMs : 2500;
    cheerT = setTimeout(function () {
      busy = false;
      if (G.done || G.phase === 'win') renderWin();
      else startOrder();
    }, delay);
  }

  function renderWin() {
    hideHand();
    stopTimer();
    if (!stats.wonThis) { stats.sessions = (stats.sessions || 0) + 1; A.Store.earnStars(P, 1, 'packer'); stats.wonThis = true; }
    K.saveState(P, G); A.Store.save();
    A.Audio.sfx('win');
    var last = G.friend || (G.order && G.order.friend) || P.blob;
    document.body.classList.add('pk-won');
    $('#pkContent').innerHTML =
      '<div class="pk-win pk-win-card card">' +
        '<img class="pk-winart" src="' + friendImg(last, 'cheering') + '" alt="">' +
        '<h2>What a picnic!</h2>' +
        '<p>You packed every order, even the big one. Your picnic looks wonderful.</p>' +
        '<div class="pk-winbtns"><button class="pk-action" id="pkAgain">Play again</button>' +
        '<button class="pk-secondary" id="pkWinHome">Home</button></div>' +
      '</div>';
    renderFestoon();
    $('#pkAgain').onclick = function () {
      document.body.classList.remove('pk-won');
      stats.wonThis = false;
      G = K.newSession(P);
      G.timerOn = !!stats.timer;
      window.__packer.G = G;
      startOrder();
    };
    $('#pkWinHome').onclick = home;
    say('What a picnic! You packed every order.', 'chatter');
  }

  function timerSecs() {
    if (G.band.toddler) return 0;
    return G.order && G.order.boss ? 75 : (G.band.words ? 60 : 50);
  }
  function startTimer() {
    stopTimer();
    if (!G.timerOn || G.band.toddler || G.phase !== 'order') return;
    timerLimit = timerLeft = timerSecs();
    timerIv = setInterval(function () {
      if (G.phase !== 'order' || busy || document.hidden) return;
      timerLeft = Math.max(0, timerLeft - 1);
      var bar = A.$('#pkTimerBar > i');
      if (bar) bar.style.transform = 'scaleX(' + (timerLimit ? timerLeft / timerLimit : 0) + ')';
      var wrap = $('#pkTimerBar'); if (wrap) wrap.classList.toggle('low', timerLeft / Math.max(1, timerLimit) <= 0.25);
      if (timerLeft <= 0) {
        stopTimer();
        nudgeText = 'Keep packing. No rush!';
        K.failNudge(G);
        var n = $('#pkNudge'); if (n) n.textContent = nudgeText;
        say(nudgeText, 'chatter');
      }
    }, 1000);
  }
  function stopTimer() { clearInterval(timerIv); timerIv = null; }

  var idleMs = 7000;
  function pokeIdle() {
    clearTimeout(idleT);
    hideHand();
    if (G.phase !== 'order') return;
    idleT = setTimeout(function () {
      if (G.phase !== 'order' || busy) return;
      K.failNudge(G);
      var miss = K.missing(G.basket, G.order.want);
      var id = Object.keys(miss)[0];
      var extras2 = K.extraKinds ? K.extraKinds(G.basket, G.order.want) : [];
      if (K.overfilled(G.basket, G.order.want) || extras2.length) {
        nudgeText = issueNudge() || 'You can tap a food in the basket to take it out.';
      } else {
        nudgeText = id ? 'Look for ' + K.noun(id, 2) + ' on the shelf.' : 'Almost there. Check the order again.';
        A.$$('.pk-bin').forEach(function (el) { if (el.getAttribute('data-id') === id) el.classList.add('hint'); });
      }
      var n = $('#pkNudge'); if (n) n.textContent = nudgeText;
      showIdleHand();
      say(nudgeText, 'chatter');
    }, idleMs);
  }

  function startOrder(opt) {
    document.body.classList.remove('pk-won');
    clearTimeout(cheerT);
    busy = false; pose = G.i >= G.nFriend ? 'thinking' : 'front'; nudgeText = '';
    if (G.phase === 'win') { renderWin(); return; }
    K.nextOrder(G, P, opt || {});
    renderOrder();
    startTimer();
    pokeIdle();
    say(orderText(), 'prompt');
  }

  function home() {
    A.Voice.stop();
    K.saveState(P, G); A.Store.save();
    location.href = A.ROOT + 'index.html?from=game#games';
  }

  function toggleTimer() {
    G.timerOn = !G.timerOn;
    stats.timer = G.timerOn;
    A.Store.save();
    syncTimerBtn();
    if (G.phase === 'order') {
      if (G.timerOn) startTimer(); else stopTimer();
      renderOrder();
    }
  }

  window.addEventListener('resize', function () { layoutBasket(); });
  $('#pkHome').onclick = home;
  $('#pkSpeak').onclick = function () { say(orderText() || 'Let\'s pack a picnic!', 'tap'); };
  $('#pkTimer').onclick = toggleTimer;
  headerIcons();
  if (A.HowTo) A.HowTo.button('packer', '#pkHome');

  window.__packer = {
    G: G, render: renderOrder, renderWin: renderWin, renderFestoon: renderFestoon,
    addToBasket: addToBasket, takeOut: takeOut, startOrder: startOrder,
    cheerMs: 2500, showIdleHand: showIdleHand, pokeIdle: pokeIdle, hideHand: hideHand,
    get idleMs() { return idleMs; }, set idleMs(v) { idleMs = v; },
    setOrder: function (opt) { G.phase = 'ready'; G.done = false; startOrder(opt || {}); },
    setFestoon: function (scene) {
      G.scene = scene || [];
      renderFestoon();
    },
    finishOrder: finishOrder,
    showOrder: function (order, basket) {
      G.order = order; G.basket = basket || K.fillPre(order.pre || {});
      G.phase = 'order'; G.friend = order.friend; G.done = !!order.boss;
      pose = order.boss ? 'thinking' : 'front'; nudgeText = '';
      renderOrder();
    },
    layoutBasket: layoutBasket
  };

  (A.HowTo && A.HowTo.first ? A.HowTo.first('packer') : Promise.resolve()).then(function () { startOrder(); });
})(window.Arcade);
