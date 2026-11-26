/* Bake Shop Clock v2 (rework 1122): a friend brings an order ticket, the kid sets the big shop clock, taps "It's ready!",
   and the treat goes onto today's order board. Four clock levels (o'clock, half past, quarters, 5 minutes). Grade 1 mixes in
   "What time is it?" reads at o'clock / half past; quarters and 5 minutes are a bonus held until half past is solid on 2 days.
   Pre-K: picture tickets, pick the clock from 3, then copy the clock (short hand only). Toddlers: match one of 2 clocks.
   Each mastered level adds a cake layer and a treat on the menu. */
(function (A) {
  'use strict';
  var K = A.BakeShop, Art = A.BakeShopArt, $ = A.$, P = A.Store && A.Store.active();
  if (!P) { location.replace(A.ROOT + 'index.html#players'); return; }

  var G = K.newSession(P);
  var st = G.st;
  var drag = null, lastSay = '', pose = 'front', busy = false, overlay = null, boardStarred = false;

  function fname(id) {
    var c = (A.FoodData && A.FoodData.cast || []).filter(function (f) { return f.id === id; })[0];
    return (c && c.name) || 'Friend';
  }
  function friendImg(id, ex) { return A.ROOT + 'assets/picnic/friends/' + id + '/' + (ex || 'front') + '_256.webp'; }
  function say(text, kind) {
    if (!text) return;
    lastSay = text;
    try { A.Voice.say([{ text: text }], { kind: kind || 'tap', bubble: false }); } catch (e) {}
  }
  function sfx(n) { try { A.Audio.sfx(n); } catch (e) {} }
  function persist() { try { A.Store.save(); } catch (e) {} }
  function L() { return K.LEVELS[G.order ? G.order.lv : st.lv] || K.LEVELS[0]; }
  function esc(s) { return A.esc ? A.esc(String(s)) : String(s); }
  function dots(i) {
    var n = Math.min(K.NEED, st.prog[i] || 0), out = '';
    for (var k = 0; k < K.NEED; k++) out += '<i class="' + (k < n ? 'on' : '') + '"></i>';
    return '<span class="bs-dots" aria-hidden="true">' + out + '</span>';
  }

  /* ---------- ticket ---------- */
  function renderTicket() {
    var o = G.order; if (!o) return;
    var treatImg = '<img class="bs-tk-treat" src="' + Art.treatSrc(o.treat) + '" alt="' + esc(o.treatPlural) + '">';
    var who = '<img class="bs-tk-friend" src="' + friendImg(o.friend, pose) + '" alt="' + esc(fname(o.friend)) + '">';
    var mid, Tn0 = o.treatPlural.charAt(0).toUpperCase() + o.treatPlural.slice(1);
    if (o.prek) {
      /* pre-K: a picture clock and a big number, no sentence to read */
      mid = '<div class="bs-tk-text bs-tk-pk" role="img" aria-label="' + esc(Tn0 + ' at ' + o.target.h + " o'clock") + '">' +
        '<span class="bs-tk-clock bs-tk-pkclock">' + Art.bigClock(o.target, { cls: G.hint && G.hint.hand === 'hour' ? 'bs-pulse-hour' : '' }) + '</span>' +
        '<span class="bs-tk-num" aria-hidden="true">' + o.target.h + '</span></div>';
    } else if (o.kind === 'read') {
      mid = '<div class="bs-tk-text"><span class="bs-tk-small">Read the shop clock</span><span class="bs-tk-big bs-tk-q">What time is it?</span></div>';
    } else if (o.kind === 'match') {
      mid = '<div class="bs-tk-text"><span class="bs-tk-small">' + esc(o.treatPlural.charAt(0).toUpperCase() + o.treatPlural.slice(1)) + ' at</span>' +
        '<span class="bs-tk-clock">' + Art.bigClock(o.target, { label: K.formatTime(o.target) }) + '</span></div>';
    } else {
      var tp = K.ticketParts(o.target), Tn = o.treatPlural.charAt(0).toUpperCase() + o.treatPlural.slice(1);
      mid = '<div class="bs-tk-text"><span class="bs-tk-small">' + esc(Tn) + ', please, at</span>' +
        '<span class="bs-tk-big">' + esc(tp.big) + (tp.small ? ' <em>(' + esc(tp.small) + ')</em>' : '') + '</span></div>';
    }
    $('#bsTicket').innerHTML = who + mid + treatImg;
  }

  /* ---------- clock panel ---------- */
  function clockOpts() {
    var o = G.order || {};
    var pulse = G.hint && G.hint.hand ? (G.hint.hand === 'hour' ? 'bs-pulse-hour' : 'bs-pulse-min') : '';
    if (o.kind === 'read') return { id: 'bsClock', knobs: {}, glow: (G.hint && G.hint.glow) || [], cls: 'bs-readclock ' + pulse, label: 'Shop clock' };
    return { id: 'bsClock', knobs: { hour: true, minute: !!o.minute }, glow: (G.hint && G.hint.glow) || [], active: G.active, cls: pulse, label: 'Shop clock showing ' + K.formatTime(G.set) };
  }
  function renderPanel() {
    var o = G.order || {}, toddler = o.kind === 'match', read = o.kind === 'read';
    var lvl = $('#bsLevel'), show = $('#bsShow');
    lvl.hidden = toddler || !!o.prek;
    show.hidden = toddler;
    lvl.innerHTML = '<span class="bs-pill-t">' + esc(L().short) + '</span>' + dots(o.lv || 0);
    lvl.setAttribute('aria-label', 'Clock level: ' + L().name + '. Tap to change.');
    $('#bsSteps').hidden = toddler;
    $('#bsTip').hidden = toddler && !o.prek;
    $('#bsReady').hidden = toddler || read;
    $('#bsCake').hidden = !!(o.prek || o.toddler);
    document.body.classList.toggle('bs-toddler', toddler);
    document.body.classList.toggle('bs-prek', !!o.prek);
    document.body.classList.toggle('bs-read', read);
    if (toddler) {
      var pulseC = o.prek && G.hint && G.hint.hand === 'hour' ? 'bs-pulse-hour' : '';
      $('#bsClockWrap').innerHTML = '<div class="bs-choices' + (o.choices.length > 2 ? ' three' : '') + '" id="bsChoices">' + o.choices.map(function (c, i) {
        var out = G.wrong && G.wrong.indexOf(i) >= 0;
        return '<button type="button" class="bs-choice' + (out ? ' out' : '') + '" data-i="' + i + '" aria-label="Clock ' + (i + 1) + '"' + (out ? ' disabled' : '') + '>' +
          Art.bigClock(c, { cls: pulseC, glow: (G.hint && G.hint.glow) || [] }) + '</button>';
      }).join('') + '</div>';
      if (o.prek) renderTip();
      $('#bsChoices').onclick = function (e) { var b = e.target.closest('.bs-choice'); if (b) onPick(+b.dataset.i, b); };
      return;
    }
    if (read) {
      $('#bsClockWrap').innerHTML = Art.bigClock(o.target, clockOpts());
      renderTip(); renderReadChoices();
      return;
    }
    $('#bsClockWrap').innerHTML = Art.bigClock(G.set, clockOpts());
    bindClock($('#bsClock'));
    renderTip();
    renderSteps();
  }
  /* "What time is it?": four time cards (digital big, words small). A wrong card shakes and greys out. */
  function renderReadChoices() {
    var o = G.order, box = $('#bsSteps');
    box.classList.remove('two'); box.classList.add('read');
    box.innerHTML = o.choices.map(function (c, i) {
      var out = G.wrong.indexOf(i) >= 0;
      return '<button type="button" class="bs-tchoice' + (out ? ' out' : '') + '" data-i="' + i + '"' + (out ? ' disabled' : '') + ' aria-label="' + esc(K.formatTime(c)) + '">' +
        '<b>' + esc(K.formatDigital(c)) + '</b><small>' + esc(K.formatTime(c)) + '</small></button>';
    }).join('');
  }
  function renderTip() {
    var tip = $('#bsTip');
    var o = G.order || {};
    var base = o.kind === 'read' ? 'Short hand: hour. Long hand: minutes.' : o.prek ? (o.kind === 'copy' ? 'Make it look like the ticket clock' : 'Find the clock that matches') : L().tip;
    tip.textContent = (G.hint && G.hint.say) || base;
    tip.classList.toggle('hint', !!G.hint);
    tip.classList.remove('yay');
  }
  function renderSteps() {
    var o = G.order || {};
    var row = function (hand, label) {
      return '<div class="bs-pair' + (G.active === hand ? ' on' : '') + '" data-pair="' + hand + '">' +
        '<button type="button" class="bs-step" data-hand="' + hand + '" data-d="-1" aria-label="' + label + ' back">&minus;</button>' +
        '<span class="bs-lab">' + label + '</span>' +
        '<button type="button" class="bs-step" data-hand="' + hand + '" data-d="1" aria-label="' + label + ' forward">+</button></div>';
    };
    $('#bsSteps').classList.remove('read');
    $('#bsSteps').innerHTML = row('hour', 'Hour') + (o.minute ? row('minute', 'Minute') : '');
    if (G.hint && G.hint.hand) { var pr = $('#bsSteps').querySelector('[data-pair="' + G.hint.hand + '"]'); if (pr) pr.classList.add('pulse'); }
    $('#bsSteps').classList.toggle('two', !!o.minute);
  }
  function updateHands() {
    var svg = $('#bsClock'); if (!svg) return;
    var ha = K.hourAngle(G.set), ma = K.minuteAngle(G.set);
    var hh = svg.querySelector('.bs-hand-hour'), mh = svg.querySelector('.bs-hand-min');
    if (hh) hh.setAttribute('transform', 'rotate(' + ha + ' 100 100)');
    if (mh) mh.setAttribute('transform', 'rotate(' + ma + ' 100 100)');
    var ks = svg.querySelectorAll('.bs-knob-g');
    ks.forEach(function (g) {
      var hand = g.querySelector('.bs-pad').getAttribute('data-hand');
      g.setAttribute('transform', 'rotate(' + (hand === 'hour' ? ha : ma) + ' 100 100)');
      g.querySelector('.bs-knob').classList.toggle('on', G.active === hand);
    });
    svg.setAttribute('aria-label', 'Shop clock showing ' + K.formatTime(G.set));
    document.querySelectorAll('.bs-pair').forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-pair') === G.active); });
  }
  function setTime(t, hand) {
    var changed = !K.sameTime(t, G.set);
    G.set = { h: t.h, m: t.m || 0 };
    if (hand) G.active = hand;
    if (changed) sfx('tick');
    updateHands();
  }

  /* pointer: knob pads first (nearest knob within the pad), then a tapped number, then the nearer hand */
  function unitsOf(svg, ev) {
    var r = svg.getBoundingClientRect();
    return { x: (ev.clientX - r.left) / r.width * 200, y: (ev.clientY - r.top) / r.height * 200, ppu: r.width / 200 };
  }
  function hitR(ppu) { return Math.max(Art.KNOB.hit, 31 / Math.max(0.01, ppu)); }   /* >= 62px across on screen */
  function knobXY(hand) {
    var a = (hand === 'hour' ? K.hourAngle(G.set) : K.minuteAngle(G.set)) * Math.PI / 180, r = hand === 'hour' ? Art.KNOB.hourR : Art.KNOB.minR;
    return { x: 100 + Math.sin(a) * r, y: 100 - Math.cos(a) * r };
  }
  function hands() { return (G.order && G.order.minute) ? ['hour', 'minute'] : ['hour']; }
  function grabAt(u) {
    var hits = [], R = hitR(u.ppu);
    hands().forEach(function (h) {
      var k = knobXY(h), d = Math.hypot(u.x - k.x, u.y - k.y);
      if (d <= R) hits.push({ hand: h, d: d });
    });
    if (!hits.length) return null;
    if (hits.length === 1) return hits[0].hand;
    /* Both pads overlap (hands on the same number): pick by which end was grabbed.
       Inner / closer to the hub is the short hour hand; the outer tip is the long minute hand.
       Right at the midpoint, keep the hand the kid already has selected. */
    var r = Math.hypot(u.x - 100, u.y - 100), mid = (Art.KNOB.hourR + Art.KNOB.minR) / 2;
    if (Math.abs(r - mid) < 3 && G.active && hands().indexOf(G.active) >= 0) return G.active;
    return r < mid ? 'hour' : 'minute';
  }
  function angleAt(u) { var a = Math.atan2(u.x - 100, -(u.y - 100)) * 180 / Math.PI; return a < 0 ? a + 360 : a; }
  function nearerHand(u) {
    var hs = hands(); if (hs.length < 2) return 'hour';
    var a = angleAt(u), d = function (x, y) { var z = Math.abs(x - y) % 360; return Math.min(z, 360 - z); };
    return d(a, K.minuteAngle(G.set)) < d(a, K.hourAngle(G.set)) ? 'minute' : 'hour';
  }
  function dragTo(u, hand) {
    var a = angleAt(u), grain = (G.order && G.order.grain) || 60;
    if (hand === 'hour') setTime({ h: K.hourFromAngle(a, G.set), m: G.set.m }, 'hour');
    else setTime({ h: G.set.h, m: K.minuteFromAngle(a, grain) }, 'minute');
  }
  function bindClock(svg) {
    if (!svg) return;
    svg.addEventListener('pointerdown', function (e) {
      if (G.phase !== 'set' || busy) return;
      e.preventDefault();
      var u = unitsOf(svg, e), r = Math.hypot(u.x - 100, u.y - 100), hand = grabAt(u);
      if (!hand && r >= Art.KNOB.numIn - 4 && r <= 100) {
        /* a number on the face: jump the active hand there */
        var n = Math.round(angleAt(u) / 30) % 12; if (n === 0) n = 12;
        var use = (G.active === 'minute' && G.order.minute) ? 'minute' : 'hour';
        setTime(K.tapNumber(G.set, n, use, G.order.grain), use);
        return;
      }
      if (!hand && r > 100) return;
      drag = { hand: hand || nearerHand(u), id: e.pointerId };
      try { svg.setPointerCapture(e.pointerId); } catch (err) {}
      if (!hand) dragTo(u, drag.hand); else { G.active = hand; updateHands(); }
    });
    svg.addEventListener('pointermove', function (e) { if (drag && drag.id === e.pointerId) { e.preventDefault(); dragTo(unitsOf(svg, e), drag.hand); } });
    var up = function () { drag = null; };
    svg.addEventListener('pointerup', up);
    svg.addEventListener('pointercancel', up);
    svg.addEventListener('lostpointercapture', up);
  }

  /* ---------- board ---------- */
  function renderBoard(popLast) {
    var b = st.board, html = '<h2>Today\'s orders &middot; ' + Math.min(b.length, K.BOARD) + ' of ' + K.BOARD + '</h2><div class="bs-plates">';
    for (var i = 0; i < K.BOARD; i++) {
      html += '<div class="bs-plate' + (b[i] ? ' filled' : '') + (popLast && i === b.length - 1 ? ' pop' : '') + '">' +
        (b[i] ? '<img src="' + Art.treatSrc(b[i]) + '" alt="">' : '') + '</div>';
    }
    html += '</div>';
    $('#bsBoardMain').innerHTML = html;
    $('#bsCake').innerHTML = Art.cake(st.layers, 58) + '<span class="bs-cakecap">Cake: ' + st.layers + ' of 4 layers</span>';
    $('#bsCake').setAttribute('aria-label', 'Celebration cake: ' + st.layers + ' of 4 layers');
  }


  function isLand() {
    var stage = document.documentElement.getAttribute('data-stage');
    if (stage === 'landscape') return true;
    if (stage === 'portrait') return false;
    return window.innerWidth > window.innerHeight;
  }
  function layoutScene() {
    var scene = $('#bsScene');
    if (!scene || !Art || !Art.pack) return;
    var land = isLand();
    var pack = Art.pack(land);
    var bg = Art.src(land ? 'shop_bg_landscape' : 'shop_bg_portrait');
    var root = document.getElementById('bakeshop');
    if (root && bg) root.style.backgroundImage = 'url("' + bg + '")';
    var oven = $('#bsOven');
    if (oven) {
      var oh = pack.oven_height;
      var oc = pack.oven_bottom_center;
      oven.src = Art.src('oven') || (A.ROOT + 'art/bakeshop/oven.webp');
      oven.style.position = 'absolute';
      oven.style.height = oh + 'px';
      oven.style.width = oh + 'px';
      oven.style.left = (oc[0] - oh / 2) + 'px';
      oven.style.top = (oc[1] - oh) + 'px';
      oven.style.zIndex = '2';
    }
    var clock = $('#bsSceneClock');
    if (clock) {
      var cc = pack.clock_center;
      var r = pack.clock_outer_r;
      var tset = (G.order && G.order.kind === 'read' && G.order.target) ? G.order.target : (G.set || { h: 3, m: 0 });
      clock.style.position = 'absolute';
      clock.style.left = (cc[0] - r) + 'px';
      clock.style.top = (cc[1] - r) + 'px';
      clock.style.width = (2 * r) + 'px';
      clock.style.height = (2 * r) + 'px';
      clock.style.zIndex = '1';
      clock.innerHTML = Art.clock(tset, { size: Math.round(2 * r), interactive: false, numbers: true, label: '' });
    }
    var box = $('#bsCusts');
    if (box) {
      var who = (G.order && G.order.friend) || (P && P.blob) || 'strawberry';
      var you = (P && (P.blob || P.friend)) || 'blueberry';
      if (you === who) you = 'strawberry';
      var ids = [who, you];
      box.innerHTML = (pack.customers || []).map(function (c, i) {
        var fh = c[2], fx = c[0], fy = c[1];
        var fw = Math.round(fh * 0.75);
        var sw = Math.round(fw * 1.05), sh = Math.round(sw * 0.28);
        var src = friendImg(ids[i] || who, 'front');
        return '<span class="bs-cust-shadow" style="left:' + Math.round(fx - sw / 2) + 'px;top:' + Math.round(fy - sh * 0.45) + 'px;width:' + sw + 'px;height:' + sh + 'px"></span>' +
          '<img class="bs-cust" src="' + src + '" alt="" style="left:' + Math.round(fx - fw / 2) + 'px;top:' + Math.round(fy - fh) + 'px;width:' + fw + 'px;height:' + fh + 'px">';
      }).join('');
    }
  }

  function render() {
    renderTicket();
    renderPanel();
    renderBoard(false);
    layoutScene();
  }

  /* ---------- answers ---------- */
  function feedLadder(o, ok) {
    /* Smart levels on: grade-1 first tries also go to the rated ladder, by the time asked (:00 / :30 -> time_hour_half; else time_5min).
       Pre-K and toddler play is never logged (o.skill is null). */
    try {
      if (!o.skill || P.guest || !A.Ladder || !A.Ladder.on(P) || !A.Curriculum || !A.Curriculum.recordAnswer) return;
      A.Curriculum.recordAnswer(P, o.skill, ok, { choices: K.ladderChoices(o) });
    } catch (e) {}
  }
  function onReady() {
    if (G.phase !== 'set' || busy) return;
    var o = G.order, first = G.firstTry, res = K.submit(G);
    if (first) feedLadder(o, res.ok);
    if (res.ok) return onRight(res);
    sfx('soft');
    pose = 'thinking';
    if (G.hint && G.hint.show && G.hint.hand) {
      /* third miss: the hand moves to the right spot; the kid taps It's ready! */
      G.set = G.hint.hand === 'hour' ? { h: o.target.h, m: G.set.m } : { h: G.set.h, m: o.target.m || 0 };
    }
    renderTicket();
    $('#bsClockWrap').innerHTML = Art.bigClock(G.set, clockOpts());
    bindClock($('#bsClock'));
    renderTip(); renderSteps();
    say(G.hint.say, 'prompt');
    persist();
  }
  function onPick(i, el) {
    if (G.phase !== 'pick' || busy) return;
    if (G.wrong && G.wrong.indexOf(i) >= 0) return;
    G.pick = i;
    var o = G.order, first = G.firstTry, res = K.submit(G);
    if (first && o.kind === 'read') feedLadder(o, res.ok);
    if (res.ok) return onRight(res);
    sfx('soft');
    if (o.toddler) {
      if (el) { el.classList.add('wrong'); setTimeout(function () { el.classList.remove('wrong'); }, 450); }
      say('Look at the ticket clock.', 'prompt');
      return;
    }
    /* pre-K and reads: the wrong one greys out, the hand to look at pulses, and one short line says what to look for */
    pose = 'thinking';
    renderTicket(); renderPanel();
    var b = document.querySelector('[data-i="' + i + '"]');
    if (b) { b.classList.add('wrong'); setTimeout(function () { b.classList.remove('wrong'); }, 450); }
    say(G.hint.say, 'prompt');
    persist();
  }
  function onRight(res) {
    busy = true;
    sfx('yay');
    pose = 'cheering';
    renderTicket();
    document.body.classList.add('bs-right');
    var cheer = ['Hot out of the oven!', 'Right on time!', 'Yum, just in time!'][st.board.length % 3];
    say(cheer, 'chatter');
    var tip = $('#bsTip'); if (tip && G.order.kind !== 'match') { tip.textContent = cheer; tip.classList.remove('hint'); tip.classList.add('yay'); }
    renderBoard(true);
    if (G.order.kind !== 'match' && !G.order.prek) $('#bsLevel').innerHTML = '<span class="bs-pill-t">' + esc(L().short) + '</span>' + dots(G.order.lv);
    persist();
    var delay = (typeof window.__bakeshop.cheerMs === 'number') ? window.__bakeshop.cheerMs : 1500;
    setTimeout(function () {
      document.body.classList.remove('bs-right');
      var steps = [];
      if (res.mastered || res.unlocked >= 0 || (res.solidDay && G.order.lv >= 1)) steps.push(function (next) { masteryFlow(res, next); });
      if (res.pkCopy) steps.push(function (next) { pkCopyCard(next); });
      if (res.boardFull) steps.push(function () { endOfDay(); });
      else steps.push(function () { busy = false; startOrder(); });
      runSteps(steps);
    }, delay);
  }
  function runSteps(list) { var i = 0; (function go() { var f = list[i++]; if (f) f(go); })(); }

  /* ---------- overlays (lesson cards, level picker, mastery, end of day) ---------- */
  function openCard(html, speak, cls) {
    var host = $('#bsOverlay');
    host.innerHTML = '<div class="bs-ov-back"></div><div class="bs-card ' + (cls || '') + '" role="dialog" aria-modal="true">' + html + '</div>';
    host.hidden = false;
    overlay = { speak: speak };
    if (speak) say(speak, 'prompt');
    return host;
  }
  function closeCard() { var host = $('#bsOverlay'); host.hidden = true; host.innerHTML = ''; overlay = null; }

  function lessonPic(id) {
    var c = K.LESSONS[id];
    if (c.clocks) {
      return '<div class="bs-ls-two">' + c.clocks.map(function (t, i) {
        return '<figure>' + Art.bigClock(t, { glow: c.glows[i], label: c.caps[i] }) + '<figcaption>' + esc(c.caps[i]) + '</figcaption></figure>';
      }).join('') + '</div>';
    }
    var legend = c.label === 'hands'
      ? '<div class="bs-legend"><span class="bs-lg-h"><i></i>Short hand: hour</span><span class="bs-lg-m"><i></i>Long hand: minutes</span></div>' : '';
    return '<div class="bs-ls-one">' + Art.bigClock(c.clock, { glow: c.glow || [], label: c.title }) + '</div>' + legend;
  }
  /* cards: a list of lesson ids; Skip closes the rest; Got it moves on. Every shown card is marked seen. */
  function showLessons(ids, done) {
    ids = ids.slice();
    var total = ids.length, k = 0;
    (function one() {
      var id = ids.shift();
      if (!id) { closeCard(); if (done) done(); return; }
      k++;
      var c = K.LESSONS[id];
      st.seen[id] = 1; persist();
      var host = openCard(
        '<h2>' + esc(c.title) + '</h2>' + lessonPic(id) + '<p class="bs-ls-text">' + esc(c.text) + '</p>' +
        '<div class="bs-cardbtns"><button type="button" class="bs-btn2" id="bsLsSkip">Skip</button>' +
        '<button type="button" class="bs-btn2" id="bsLsHear" aria-label="Hear it again">Hear</button>' +
        '<button type="button" class="bs-btn1" id="bsLsNext">' + (k < total ? 'Next' : 'Got it!') + '</button></div>',
        c.text, 'bs-lesson');
      host.setAttribute('data-lesson', id);
      $('#bsLsNext').onclick = function () { sfx('tap'); one(); };
      $('#bsLsSkip').onclick = function () { sfx('tap'); ids.forEach(function (x) { st.seen[x] = 1; }); persist(); ids = []; one(); };
      $('#bsLsHear').onclick = function () { say(c.text, 'tap'); };
    })();
  }
  function lessonsFor(lv) {
    var ids = K.LEVELS[lv].lessons.slice();
    if (ids.indexOf('hands') < 0) ids.unshift('hands');
    return ids;
  }
  function unseenLessons(lv) { return lessonsFor(lv).filter(function (id) { return !st.seen[id]; }); }

  function levelPicker() {
    if (busy) return;
    var rows = K.LEVELS.map(function (Lv, i) {
      var open = i <= st.top, doneL = st.layers > i, info = K.levelInfo(st, i), prev = i > 0 ? K.levelInfo(st, i - 1) : null, sub;
      if (!open && i === 1) sub = 'Opens after ' + K.NEED + ' of ' + K.WIN + ' right on the first try at o\u2019clock, plus ' + K.READS_NEED + ' clock reads';
      else if (!open) sub = 'Opens when ' + K.LEVELS[i - 1].short.toLowerCase() + ' is solid on ' + K.SOLID_DAYS + ' different days (' + prev.days + ' of ' + K.SOLID_DAYS + ')';
      else if (doneL && info.solid) sub = 'Cake layer earned';
      else sub = 'Right on the first try: ' + info.prog + ' of ' + K.NEED + (info.readsNeed ? ' \u00b7 Clock reads: ' + info.reads + ' of ' + info.readsNeed : '');
      return '<button type="button" class="bs-lvrow' + (i === st.lv ? ' cur' : '') + (info.bonus ? ' bonus' : '') + '" data-lv="' + i + '"' + (open ? '' : ' disabled') + '>' +
        '<span class="bs-lvname">' + esc(Lv.name) + (info.bonus ? ' <em class="bs-bonus">Bonus</em>' : '') + '</span><span class="bs-lvsub">' + esc(sub) + '</span>' + (open ? dots(i) : '') + '</button>';
    }).join('');
    openCard('<h2>Clock levels</h2><div class="bs-lvlist">' + rows + '</div>' +
      '<div class="bs-cardbtns"><button type="button" class="bs-btn2" id="bsLvClose">Close</button></div>', 'Pick a clock level.', 'bs-levels');
    $('#bsLvClose').onclick = closeCard;
    document.querySelectorAll('.bs-lvrow').forEach(function (b) {
      b.onclick = function () {
        var i = +b.dataset.lv; if (i > st.top) return;
        closeCard(); sfx('tap');
        if (i !== st.lv) { st.lv = i; persist(); startOrder(); }
      };
    });
  }

  function masteryFlow(res, next) {
    sfx('unlock');
    var lvDone = K.LEVELS[G.order.lv], nt = res.newTreat ? K.TREAT_BY[res.newTreat] : null;
    var finished = st.layers >= 4;
    var line = finished ? 'Your cake is finished! You can read every clock time.' : 'Your cake got a new layer! You learned ' + lvDone.short.toLowerCase() + '.';
    var title = finished ? 'Cake finished!' : 'New cake layer!';
    if (!res.mastered) {
      title = res.unlocked >= 0 ? 'Bonus level open!' : 'Solid ' + lvDone.short.toLowerCase() + '!';
      line = res.unlocked >= 0 ? 'You know ' + lvDone.short.toLowerCase() + ' really well, two days in a row.' : 'Great clock reading today!';
    }
    if (res.unlocked < 0 && G.order.lv >= 1 && G.order.lv === st.top && st.top < 3) line += ' Play ' + lvDone.short.toLowerCase() + ' again on another day to open a bonus level.';
    var treatLine = nt ? 'New on the menu: ' + nt.plural + '!' : '';
    openCard('<h2>' + title + '</h2><div class="bs-mst-cake">' + Art.cake(st.layers, 150) + '</div>' +
      '<p class="bs-ls-text">' + esc(line) + '</p>' +
      (nt ? '<p class="bs-newtreat"><img src="' + Art.treatSrc(nt.id) + '" alt="">' + esc(treatLine) + '</p>' : '') +
      '<div class="bs-cardbtns"><button type="button" class="bs-btn1" id="bsMstNext">' + (res.unlocked >= 0 ? 'Next' : 'Yay!') + '</button></div>',
      line + (treatLine ? ' ' + treatLine : ''), 'bs-mastery');
    $('#bsMstNext').onclick = function () {
      sfx('tap');
      if (res.unlocked < 0) { closeCard(); next(); return; }
      var nl = K.LEVELS[res.unlocked];
      showLessons(nl.lessons.slice(), function () {
        var prev = K.LEVELS[st.lv];
        openCard('<h2>Want to try ' + esc(nl.short.toLowerCase()) + '?</h2><div class="bs-mst-cake">' + Art.bigClock(K.LESSONS[nl.lessons[0]].clock || K.LESSONS[nl.lessons[0]].clocks[0], { glow: [] }) + '</div>' +
          '<div class="bs-cardbtns"><button type="button" class="bs-btn2" id="bsAskStay">More ' + esc(prev.short.toLowerCase()) + '</button>' +
          '<button type="button" class="bs-btn1" id="bsAskGo">Yes!</button></div>', 'Want to try ' + nl.short.toLowerCase() + '?', 'bs-ask');
        $('#bsAskGo').onclick = function () { sfx('tap'); st.lv = res.unlocked; persist(); closeCard(); next(); };
        $('#bsAskStay').onclick = function () { sfx('tap'); closeCard(); next(); };
      });
    };
  }

  /* pre-K: 5 of the last 6 picks right -> a new job, copy the ticket clock with the short hand */
  function pkCopyCard(next) {
    sfx('unlock');
    openCard('<h2>New job!</h2><div class="bs-mst-cake">' + Art.bigClock({ h: 3, m: 0 }, { glow: [3] }) + '</div>' +
      '<p class="bs-ls-text">Now you can move the short hand. Make the shop clock look like the ticket clock.</p>' +
      '<div class="bs-cardbtns"><button type="button" class="bs-btn1" id="bsPkGo">Yay!</button></div>',
      'New job! Now you can move the short hand. Make the shop clock look like the ticket clock.', 'bs-mastery');
    $('#bsPkGo').onclick = function () { sfx('tap'); closeCard(); next(); };
  }
  function endOfDay() {
    busy = true;
    sfx('win');
    if (!boardStarred) { boardStarred = true; st.sessions = (st.sessions || 0) + 1; try { A.Store.earnStars(P, 1, 'bakeshop'); } catch (e) {} }
    persist();
    var plates = st.board.slice(0, K.BOARD).map(function (id) { return '<div class="bs-plate filled"><img src="' + Art.treatSrc(id) + '" alt=""></div>'; }).join('');
    openCard('<img class="bs-win-friend" src="' + friendImg((G.order && G.order.friend) || P.blob, 'cheering') + '" alt="">' +
      '<h2>The bakery made every treat!</h2><div class="bs-plates">' + plates + '</div>' +
      '<p class="bs-ls-text">Every friend got their order on time.</p>' +
      '<div class="bs-cardbtns"><button type="button" class="bs-btn2" id="bsWinHome">Home</button>' +
      '<button type="button" class="bs-btn1" id="bsAgain">Bake more</button></div>', 'The bakery made every treat! Every friend got their order on time.', 'bs-win');
    $('#bsAgain').onclick = function () { sfx('tap'); st.board = []; boardStarred = false; persist(); closeCard(); busy = false; renderBoard(false); startOrder(); };
    $('#bsWinHome').onclick = home;
  }

  function speakOrder() { if (G.order && G.order.say) say(G.order.say, 'prompt'); }
  function startOrder() {
    pose = 'front';
    K.nextOrder(G, P);
    persist();
    render();
    speakOrder();
  }

  function home() {
    try { A.Voice.stop(); } catch (e) {}
    persist();
    if (!window.__noNav) location.href = A.ROOT + 'index.html?from=game#games';
  }

  $('#bsHome').onclick = home;
  $('#bsSpeak').onclick = function () { say(overlay && overlay.speak ? overlay.speak : (G.order && G.order.say) || lastSay, 'tap'); };
  $('#bsReady').onclick = onReady;
  $('#bsLevel').onclick = levelPicker;
  $('#bsShow').onclick = function () { if (!busy) { sfx('tap'); showLessons(lessonsFor(G.prek ? 0 : st.lv), speakOrder); } };
  $('#bsCake').onclick = function () {
    var n = st.layers, nx = K.LEVELS[Math.min(3, n)];
    say(n >= 4 ? 'Your cake is finished!' : 'Your cake has ' + n + (n === 1 ? ' layer' : ' layers') + '. Get ' + K.NEED + ' right at ' + nx.short.toLowerCase() + ' for the next one.', 'tap');
  };
  $('#bsSteps').addEventListener('click', function (e) {
    var tc = e.target.closest('.bs-tchoice'); if (tc) { onPick(+tc.dataset.i, tc); return; }
    var b = e.target.closest('.bs-step'); if (!b || G.phase !== 'set' || busy) return;
    var hand = b.dataset.hand, d = +b.dataset.d;
    setTime(hand === 'hour' ? K.stepHour(G.set, d) : K.stepMinute(G.set, d, G.order.grain), hand);
  });

  function syncTapClass() {
    var tap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tap')) || 60;
    document.documentElement.classList.toggle('bs-tap-lg', tap > 72);
  }
  syncTapClass();
  window.addEventListener('resize', syncTapClass);

  window.__bakeshop = {
    G: G, K: K, startOrder: startOrder, render: render,
    lastSay: function () { return lastSay; },
    setHands: function (t) { G.set = { h: t.h, m: t.m || 0 }; updateHands(); },
    ready: onReady, pick: onPick, levelPicker: levelPicker,
    hitR: function () { var s = $('#bsClock'); if (!s) return 0; var r = s.getBoundingClientRect(); return hitR(r.width / 200) * r.width / 200; },
    knobXY: knobXY, showLessons: showLessons, lessonsFor: lessonsFor, nextKind: function (kind, target) { K.nextOrder(G, P, { kind: kind, target: target }); persist(); render(); speakOrder(); },
    pickHand: function (x, y, ppu) { return grabAt({ x: x, y: y, ppu: ppu || 1 }); },
    overlayOpen: function () { return !$('#bsOverlay').hidden; },
    cheerMs: 1500
  };

  /* first visit to a level: its lesson cards (skippable) before the first order */
  startOrder();
  var first = G.toddler ? [] : unseenLessons(G.prek ? 0 : st.lv);
  if (first.length) showLessons(first, speakOrder);
})(window.Arcade);
