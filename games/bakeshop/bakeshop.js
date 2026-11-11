/* Bake Shop Clock v1 — set the oven clock so a friend's treat comes out on time. */
(function (A) {
  'use strict';
  var K = A.BakeShop, Art = A.BakeShopArt, $ = A.$, P = A.Store && A.Store.active();
  if (!P) { location.replace(A.ROOT + 'index.html#players'); return; }

  var G = K.newSession(P);
  var stats = P.games.bakeshop = P.games.bakeshop || { sessions: 0 };
  var pose = 'front', nudge = '', drag = null, lastSay = '';

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

  function decorate() {
    var box = $('#bsDecos'); if (!box) return;
    box.innerHTML = (G.scene || []).map(function (d, i) {
      var newest = i === G.scene.length - 1;
      return '<span class="bs-deco' + (newest ? ' pop' : '') + '" data-id="' + A.esc(d.id) + '">' + Art.deco(d.id, 80) + '</span>';
    }).join('');
  }

  function hideMinuteHand() {
    if (G.band && G.band.toddler) return true;
    if (G.band && G.band.oclock && !(G.order && G.order.grain && G.order.grain < 60)) return true;
    return false;
  }
  function clockHtml(t, opt) {
    opt = opt || {};
    if (hideMinuteHand()) opt.minute = false;
    return Art.clock(t, opt);
  }
  function timePromptHtml(t) {
    var label = A.esc(K.formatTime(t));
    var num = '<span class="bs-time-num">' + A.esc(String(t.h)) + '</span>';
    var words;
    if (!t.m) words = '<span class="bs-time-words">o\'clock</span>';
    else if (t.m === 30) words = '<span class="bs-time-words">half past</span>';
    else words = '<span class="bs-time-words">' + label + '</span>';
    var inner = (!t.m) ? (num + words) : (t.m === 30 ? (words + num) : words);
    return '<div class="bs-time-prompt" aria-label="' + label + '">' + inner + '</div>';
  }
  function promptSpeech() {
    var o = G.order;
    if (!o) return lastSay;
    if (G.phase === 'set') {
      if (o.kind === 'elapsed') return o.say || o.text;
      return 'Set the oven to ' + K.formatTime(o.target) + '.';
    }
    return o.say || o.text || lastSay;
  }
  function sizeClockHits() {
    var svg = $('#bsOvenClock');
    if (!svg) return;
    var w = svg.getBoundingClientRect().width;
    if (w < 8) return;
    var stroke = Math.max(52, (62 * 200) / w);
    var hits = svg.querySelectorAll('.bs-hit');
    for (var i = 0; i < hits.length; i++) hits[i].setAttribute('stroke-width', stroke.toFixed(2));
  }

  function renderWin() {
    if (!stats.wonThis) { stats.sessions = (stats.sessions || 0) + 1; A.Store.earnStars(P, 1, 'bakeshop'); stats.wonThis = true; }
    persist();
    A.Audio.sfx('win');
    var last = G.friend || P.blob;
    document.body.classList.add('bs-won');
    $('#bsCardHost').innerHTML =
      '<div class="bs-win-card" id="bsWin">' +
        '<img class="bs-winart" src="' + friendImg(last, 'cheering') + '" alt="">' +
        '<h2>The bakery is buzzing!</h2>' +
        '<p>You filled every order, even the tricky one. Your shop looks wonderful.</p>' +
        '<div class="bs-winbtns"><button class="bs-action" id="bsAgain">Play again</button>' +
        '<button class="bs-secondary" id="bsWinHome">Home</button></div></div>';
    decorate();
    $('#bsAgain').onclick = function () {
      document.body.classList.remove('bs-won');
      stats.wonThis = false;
      G = K.newSession(P);
      window.__bakeshop.G = G;
      startOrder();
    };
    $('#bsWinHome').onclick = home;
    say('The bakery is buzzing! You filled every order.', 'chatter');
  }

  function render() {
    if (G.phase === 'win' || G.done) { renderShop(); renderWin(); return; }
    document.body.classList.remove('bs-won');
    renderShop();
    renderCard();
  }

  function renderShop() {
    var o = G.order || {};
    var who = o.friend || G.friend || P.blob;
    var t = G.set || { h: 12, m: 0 };
    var interactive = G.phase === 'set';
    var ovenClock = clockHtml(t, { size: 240, interactive: interactive, id: 'bsOvenClock', numbers: true });
    $('#bsShop').innerHTML =
      '<div class="bs-shop-window" aria-hidden="true"></div>' +
      '<div id="bsDecos"></div>' +
      '<div class="bs-friend' + (o.boss ? ' boss' : '') + '"><img src="' + friendImg(who, pose) + '" alt="">' +
        (o.boss && Art.src('boss_hat') ? '<img class="bs-hat" src="' + Art.src('boss_hat') + '" alt="">' : '') +
      '</div>' +
      Art.oven(ovenClock);
    decorate();
    if (interactive) bindClock($('#bsOvenClock'));
    sizeClockHits();
    requestAnimationFrame(sizeClockHits);
  }

  function renderCard() {
    var o = G.order; if (!o) { $('#bsCardHost').innerHTML = ''; return; }
    var host = $('#bsCardHost');
    var picture = o.kind === 'match';
    var who = (o.boss ? 'Picnic Boss ' : '') + fname(o.friend) + (o.boss ? ' has a big order!' : ' would like a treat.');
    var html = '<div class="bs-card' + (o.boss ? ' boss' : '') + (picture ? ' picture' : '') + '" id="bsCard">';
    if (o.kind === 'match' || o.kind === 'oclock') {
      html += '<p class="bs-ask" id="bsAsk">' + A.esc(o.kind === 'match' ? (nudge || 'Find the matching clock.') : (G.phase === 'set' ? 'Now set the oven to ' + K.formatTime(o.target) + '.' : (o.text || ''))) + '</p>';
      if (G.phase === 'pick') {
        var tagTreat = '<div class="bs-tag-treat">' + Art.treat(o.treat, 56) + '</div>';
        var tagFace = (o.kind === 'match')
          ? clockHtml(o.target, { size: 88, numbers: false, label: 'tag clock' })
          : timePromptHtml(o.target);
        if (Art.src('treat_tag')) {
          html += '<div class="bs-tag has-art" id="bsTag">' + tagTreat +
            '<div class="bs-tag-board"><img class="bs-tag-bg" src="' + Art.src('treat_tag') + '" alt="">' +
            '<div class="bs-tag-face">' + tagFace + '</div></div></div>';
        } else {
          html += '<div class="bs-tag" id="bsTag">' + Art.treat(o.treat, 56) + tagFace + '</div>';
        }
        html += '<div class="bs-choices" id="bsChoices">';
        (o.choices || []).forEach(function (c, i) {
          html += '<button type="button" class="bs-choice' + (G.pick === i ? ' sel' : '') + '" data-i="' + i + '">' +
            clockHtml(c, { size: 84, numbers: o.kind !== 'match', label: o.kind === 'match' ? 'choice clock' : K.formatTime(c) }) + '</button>';
        });
        html += '</div>';
      } else {
        html += '<div class="bs-set"><button type="button" class="bs-ready" id="bsReady">It\'s ready!</button></div>';
      }
    } else {
      html += '<p class="bs-ask" id="bsAsk">' + A.esc(nudge || o.text) + '</p>';
      html += '<div class="bs-tag' + (Art.src('treat_tag') ? ' has-art' : '') + '">' +
        (Art.src('treat_tag') ? '<div class="bs-tag-board"><img class="bs-tag-bg" src="' + Art.src('treat_tag') + '" alt=""><div class="bs-tag-face">' + Art.treat(o.treat, 56) + '</div></div>'
          : Art.treat(o.treat, 56)) + '</div>';
      html += '<div class="bs-set"><button type="button" class="bs-ready" id="bsReady">It\'s ready!</button></div>';
    }
    html += '</div>';
    host.innerHTML = html;
    if ($('#bsChoices')) {
      $('#bsChoices').addEventListener('click', function (e) {
        var b = e.target.closest('.bs-choice'); if (!b) return;
        onPick(+b.dataset.i, b);
      });
    }
    if ($('#bsReady')) $('#bsReady').onclick = onReady;
  }

  function onPick(i, el) {
    if (G.phase !== 'pick') return;
    G.pick = i;
    A.Audio.sfx('tap');
    if (K.checkPick(G.order, i)) {
      var step = K.complete(G);
      if (step === 'set') {
        pose = 'happy'; nudge = '';
        say('Now set the oven to ' + K.formatTime(G.order.target) + '.', 'prompt');
        persist(); render();
        return;
      }
      onSuccess();
    } else {
      K.failNudge(G);
      if (el) { el.classList.add('wrong'); setTimeout(function () { el.classList.remove('wrong'); }, 400); }
      A.Audio.sfx('locked');
      nudge = 'Let\'s look again.';
      say('Let\'s look again.', 'chatter');
      pose = 'thinking';
      render();
    }
  }

  function onReady() {
    if (G.phase !== 'set') return;
    if (K.checkSet(G.order, G.set)) {
      K.complete(G);
      onSuccess();
    } else {
      K.failNudge(G);
      A.Audio.sfx('locked');
      nudge = 'Not quite. Try moving the hands again.';
      say(nudge, 'chatter');
      pose = 'thinking';
      render();
    }
  }

  function onSuccess() {
    A.Audio.sfx('ok');
    pose = 'cheering';
    nudge = '';
    persist();
    say(G.order && G.order.boss ? 'What a bakery! You filled the big order!' : 'Hot out of the oven!', 'chatter');
    var delay = (window.__bakeshop && typeof window.__bakeshop.cheerMs === 'number') ? window.__bakeshop.cheerMs : 1600;
    render();
    setTimeout(function () {
      if (G.done || G.phase === 'win') renderWin();
      else startOrder();
    }, delay);
  }

  function angleOf(svg, ev) {
    var r = svg.getBoundingClientRect();
    var pt = ev.touches && ev.touches[0] ? ev.touches[0] : ev;
    var x = pt.clientX - (r.left + r.width / 2);
    var y = pt.clientY - (r.top + r.height / 2);
    var deg = Math.atan2(x, -y) * 180 / Math.PI;
    if (deg < 0) deg += 360;
    return deg;
  }
  function closerHand(svg, ev) {
    if (hideMinuteHand()) return 'hour';
    var deg = angleOf(svg, ev);
    var t = G.set, ha = K.hourAngle(t), ma = K.minuteAngle(t);
    function d(a, b) { var x = Math.abs(a - b) % 360; return Math.min(x, 360 - x); }
    var r = svg.getBoundingClientRect();
    var pt = ev.touches && ev.touches[0] ? ev.touches[0] : ev;
    var x = pt.clientX - (r.left + r.width / 2);
    var y = pt.clientY - (r.top + r.height / 2);
    var dist = Math.sqrt(x * x + y * y);
    /* Numerals sit in the outer ring; a tap near a number should move the hour hand. Ties also prefer hour. */
    var nearNumber = dist > r.width * 0.28;
    if (nearNumber && d(deg, ha) <= d(deg, ma) + 25) return 'hour';
    return d(deg, ma) < d(deg, ha) ? 'minute' : 'hour';
  }
  function applyDrag(svg, ev) {
    if (!drag) return;
    var deg = angleOf(svg, ev);
    var grain = (G.order && G.order.grain) || 5;
    if (drag.hand === 'hour') G.set = K.timeFromHourAngle(deg, grain);
    else G.set = K.timeFromMinuteAngle(G.set, deg, grain);
    var hour = svg.querySelector('.bs-hand-hour');
    var min = svg.querySelector('.bs-hand-min');
    if (hour) hour.setAttribute('transform', 'rotate(' + K.hourAngle(G.set) + ' 100 100)');
    if (min) min.setAttribute('transform', 'rotate(' + K.minuteAngle(G.set) + ' 100 100)');
  }
  function bindClock(svg) {
    if (!svg) return;
    var up = function () { drag = null; };
    svg.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      var hit = e.target.closest && e.target.closest('[data-hand]');
      drag = { hand: (hit && hit.getAttribute('data-hand')) || closerHand(svg, e) };
      try { svg.setPointerCapture(e.pointerId); } catch (err) {}
      applyDrag(svg, e);
    });
    svg.addEventListener('pointermove', function (e) { if (drag) { e.preventDefault(); applyDrag(svg, e); } });
    svg.addEventListener('pointerup', up);
    svg.addEventListener('pointercancel', up);
  }

  function startOrder() {
    pose = 'front'; nudge = '';
    K.nextOrder(G, P);
    window.__bakeshop.G = G;
    persist();
    render();
    if (G.order) say(promptSpeech(), 'prompt');
  }

  function home() {
    A.Voice.stop(); persist();
    if (!window.__noNav) location.href = A.ROOT + 'index.html?from=game#games';
  }

  $('#bsHome').onclick = home;
  $('#bsSpeak').onclick = function () {
    say(promptSpeech(), 'tap');
  };
  window.addEventListener('resize', function () { if (G.phase !== 'win') render(); });

  window.__bakeshop = {
    G: G, startOrder: startOrder, render: render,
    lastSay: function () { return lastSay; },
    setHands: function (t) { G.set = { h: t.h, m: t.m }; render(); },
    showOrder: function (o) {
      G.order = o; G.phase = (o.kind === 'match' || o.kind === 'oclock') ? 'pick' : 'set';
      G.set = K.startSet(o); G.pick = -1; G.done = false; G.friend = o.friend;
      render();
    },
    cheerMs: 1600
  };

  startOrder();
})(window.Arcade);
