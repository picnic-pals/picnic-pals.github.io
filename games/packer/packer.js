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
    if (t && !t.querySelector('.pp-icon')) t.innerHTML = icon('⏱️', 32, 'timer');
    if (s && !s.querySelector('.pp-icon')) s.innerHTML = icon('🔊', 32, 'speak');
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
    if (o.kind !== 'picture' && o.kind !== 'count') return '';
    var h = '<div class="pk-pics">';
    Object.keys(o.want).forEach(function (id) {
      var n = o.want[id], pics = '', k;
      if (o.kind === 'picture') {
        if (n > 5 && A.CountVisual) {
          h += '<span class="pk-group pk-frame" aria-label="' + A.esc(K.phrase(id, n)) + '">' + foodIcon(id, 56) + A.CountVisual.html(n) + '</span>';
        } else {
          for (k = 0; k < n; k++) pics += foodIcon(id, 56);
          h += '<span class="pk-group pk-repeat" aria-label="' + A.esc(K.phrase(id, n)) + '">' + pics + '</span>';
        }
      } else {
        h += '<span class="pk-group" aria-label="' + A.esc(K.phrase(id, n)) + '"><b class="pk-num">' + n + '</b>' + foodIcon(id, 56) + '</span>';
      }
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
    var base = window.innerWidth <= 400 ? 28 : 44;
    var mouth0 = 0.26, mouth1 = 0.58;
    var mouthW = (mouth1 - mouth0) * W;
    var plan = rowPlan(n);
    var frontN = plan[0] || 1;
    var size = Math.min(base * 2, Math.max(base * 1.6, mouthW / Math.max(1, frontN + 0.15)));
    if (frontN > 1) {
      var fit = mouthW / (frontN - 0.12 * (frontN - 1));
      if (fit < size) size = Math.max(base * 1.5, fit);
    }
    var tuck = 0.32;
    var rise = size / H * 0.52;
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
        el.style.zIndex = String(20 - r);
      }
    }
  }

  function renderOrder() {
    var o = G.order;
    if (!o) return;
    var who = (o.boss ? 'Picnic Boss ' : '') + fname(o.friend) + (o.boss ? ' has a big order!' : ' says:');
    var crown = o.boss ? '<span class="pk-crown">' + icon('👑', 48, 'crown') + '</span>' : '';
    var items = G.basket.map(function (it) {
      return '<button class="pk-item' + (it.pre ? ' pre' : '') + '" data-uid="' + A.esc(it.uid) + '" aria-label="Take out ' + A.esc(K.noun(it.id, 1)) + '">' + foodIcon(it.id, 96) + '</button>';
    }).join('');
    var bins = o.bins.map(function (id) {
      return '<button class="pk-bin" data-id="' + id + '" aria-label="Add ' + A.esc(K.noun(id, 1)) + '">' + foodIcon(id, 128) + '</button>';
    }).join('');
    var bar = (G.timerOn && !G.band.toddler) ? '<div class="pk-timerbar' + (timerLeft / Math.max(1, timerLimit) <= 0.25 ? ' low' : '') + '" id="pkTimerBar" aria-hidden="true"><i style="transform:scaleX(' + (timerLimit ? timerLeft / timerLimit : 0) + ')"></i></div>' : '';
    $('#pkContent').innerHTML =
      '<div class="pk-card' + (o.boss ? ' boss' : '') + '" id="pkCard">' +
        '<div class="pk-who">' + A.esc(who) + '</div>' +
        '<button class="pk-cardspeak" id="pkCardSpeak" aria-label="Read the order aloud">' + icon('🔊', 32, 'cardspeak') + '</button>' +
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
            '<span class="pk-count" aria-hidden="true">' + G.basket.length + '</span>' +
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
    afterChange(opt && opt.juice ? 'in' : '');
  }
  function takeOut(uid) {
    if (busy || G.phase !== 'order') return;
    G.basket = K.takeOut(G.basket, uid);
    A.Audio.sfx('tap');
    afterChange();
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
  function afterChange(juice) {
    pokeIdle();
    if (K.matches(G.basket, G.order.want)) {
      busy = true; nudgeText = '';
      renderOrder();
      if (juice === 'in') juiceDrop();
      setTimeout(function () { finishOrder(); }, 450);
    } else {
      if (K.overfilled(G.basket, G.order.want) && !nudgeText) {
        nudgeText = 'That looks like a little too much. Tap a food in the basket to take it out.';
      }
      renderOrder();
      if (juice === 'in') juiceDrop();
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

  function pokeIdle() {
    clearTimeout(idleT);
    if (G.phase !== 'order') return;
    idleT = setTimeout(function () {
      if (G.phase !== 'order' || busy) return;
      K.failNudge(G);
      if (K.overfilled(G.basket, G.order.want)) nudgeText = 'You can tap a food in the basket to take it out.';
      else {
        var miss = K.missing(G.basket, G.order.want);
        var id = Object.keys(miss)[0];
        nudgeText = id ? 'Look for ' + K.noun(id, 2) + ' on the shelf.' : 'Almost there. Check the order again.';
        A.$$('.pk-bin').forEach(function (el) { if (el.getAttribute('data-id') === id) el.classList.add('hint'); });
      }
      var n = $('#pkNudge'); if (n) n.textContent = nudgeText;
      say(nudgeText, 'chatter');
    }, 14000);
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

  window.__packer = {
    G: G, render: renderOrder, renderWin: renderWin, renderFestoon: renderFestoon,
    addToBasket: addToBasket, takeOut: takeOut, startOrder: startOrder,
    cheerMs: 2500,
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

  startOrder();
})(window.Arcade);
