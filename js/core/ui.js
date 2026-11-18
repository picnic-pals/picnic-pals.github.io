/* Blob Arcade — shared UI: cards/celebrations, effects, toast, press-and-hold gear + grown-up check, boot. */
(function (A) {
  'use strict';
  var STAR = '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>';
  var COLORS = ['#ff8fb1', '#ffd23c', '#8fe3c0', '#9fd2ff', '#c9b2ff', '#ffb36b'];
  var GEAR = '<svg viewBox="0 0 24 24"><path d="M19.4 13a7.7 7.7 0 0 0 0-2l2.1-1.6-2-3.4-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3.3h-4l-.3 2.7a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.4L6.6 11a7.7 7.7 0 0 0 0 2l-2.1 1.6 2 3.4 2.5-1a7.4 7.4 0 0 0 1.7 1l.3 2.7h4l.3-2.7a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.4zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" transform="translate(-1 0)"/></svg>';
  var UI = A.UI = { STAR: STAR, GEAR: GEAR, COLORS: COLORS };
  UI.MIN_TAP = 48;
  /* Immediate tap for touch and mouse. pointerup fires the action once; the following
     click is ignored so we do not double-fire. Keyboard still uses click (detail 0). */
  UI.onTap = function (el, fn) {
    if (!el || typeof fn !== 'function') return el;
    if (el.getAttribute('data-ontap') === '1') return el;
    el.setAttribute('data-ontap', '1');
    var armed = null, last = 0, lock = 0;
    function blocked() { return !!(el.disabled || el.getAttribute('aria-disabled') === 'true'); }
    function go(e) {
      if (blocked()) return;
      var now = Date.now();
      if (now - last < ((A.Pace && A.Pace.CFG && A.Pace.CFG.TAP_DEBOUNCE) || 180)) return;
      last = now; lock = now + 500; fn.call(el, e);
    }
    el.addEventListener('pointerdown', function (e) {
      if (e.isPrimary === false) return;
      if (e.button != null && e.button !== 0) return;
      armed = { id: e.pointerId, x: e.clientX, y: e.clientY };
    });
    el.addEventListener('pointerup', function (e) {
      if (!armed || armed.id !== e.pointerId) return;
      var moved = Math.abs(e.clientX - armed.x) + Math.abs(e.clientY - armed.y) > 16;
      armed = null;
      if (moved) return;
      e.preventDefault();
      go(e);
    });
    el.addEventListener('pointercancel', function () { armed = null; });
    el.addEventListener('click', function (e) {
      if (Date.now() < lock) { e.preventDefault(); e.stopPropagation(); return; }
      go(e);
    });
    try { if (!el.style.touchAction) el.style.touchAction = 'manipulation'; } catch (err) {}
    return el;
  };
  UI.bindHome = function (el, go) {
    if (!el || typeof go !== 'function') return el;
    el.setAttribute('aria-label', 'Home');
    el.removeAttribute('title');
    var tip = el.querySelector && el.querySelector('.holdtip'); if (tip) tip.remove();
    el.classList.remove('holding', 'hint');
    try { el.style.touchAction = 'manipulation'; } catch (err) {}
    return UI.onTap(el, function () { if (A.Audio && A.Audio.sfx) A.Audio.sfx('tap'); go(); });
  };


  UI.askHtml = function (q) {
    var p = (A.CountVisual && A.CountVisual.display) ? A.CountVisual.display(q) : { text: (q && q.text) || '', pic: (q && q.pic) || '' };
    return '<div class="pc-q">' + p.text + '</div>' + (p.pic ? '<div class="pc-pic">' + p.pic + '</div>' : '');
  };

  /* ---------- effects ---------- */
  function fxAdd(el, ms) { document.body.appendChild(el); setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, ms); }
  UI.sparkle = function (x, y, n) {
    n = n || 10;
    for (var i = 0; i < n; i++) {
      var s = document.createElement('div'); s.className = 'spark'; s.innerHTML = STAR;
      var a = Math.PI * 2 * i / n, d = 40 + Math.random() * 50; s.style.left = x + 'px'; s.style.top = y + 'px';
      s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d + 'px');
      s.firstChild.style.fill = A.pick(COLORS); fxAdd(s, 900);
    }
    for (var j = 0; j < 14; j++) {
      var c = document.createElement('div'); c.className = 'conf'; c.style.left = x + 'px'; c.style.top = y + 'px'; c.style.background = A.pick(COLORS);
      c.style.setProperty('--dx', (Math.random() * 240 - 120) + 'px'); c.style.setProperty('--dy', (Math.random() * -160 + 30) + 'px'); c.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      fxAdd(c, 1100);
    }
  };
  UI.plusText = function (x, y, t) { var p = document.createElement('div'); p.className = 'plus'; p.textContent = t || '+1'; p.style.left = x + 'px'; p.style.top = y + 'px'; fxAdd(p, 1100); };
  UI.rain = function (n) {
    for (var i = 0; i < n; i++) {
      var c = document.createElement('div'); c.className = 'rain';
      if (i % 4 === 0) { c.innerHTML = STAR; c.style.width = c.style.height = '26px'; c.firstChild.style.fill = A.pick(COLORS); }
      else { c.style.width = '12px'; c.style.height = '16px'; c.style.borderRadius = '3px'; c.style.background = A.pick(COLORS); }
      c.style.left = (Math.random() * 100) + 'vw'; var t = 1.8 + Math.random() * 1.8; c.style.setProperty('--t', t + 's'); c.style.setProperty('--r', (Math.random() * 900 - 450) + 'deg');
      c.style.animationDelay = (Math.random() * .8) + 's'; fxAdd(c, (t + 1) * 1000);
    }
  };
  UI.toast = function (msg, ms) {
    var t = document.createElement('div'); t.className = 'toast';
    if (A.Icons && A.Icons.embed) t.innerHTML = A.Icons.embed(String(msg || ''), { size: 28, decorative: true, cls: 'pp-pic toast-ico', slot: 'toast' });
    else t.textContent = msg;
    fxAdd(t, ms || 2600);
  };

  /* ---------- modal cards (celebrations, intros) ---------- */
  // opts: {tag, title, art, glow, html, sub, btn, btnCls, voice:[parts], sfx, confetti, cls, minMs}
  UI.cardOpen = false;
  UI.card = function (o) {
    return new Promise(function (resolve) {
      var ov = A.el('<div class="overlay on ' + (o.cls || '') + '" role="dialog" aria-modal="true"><div class="card">' +
        (o.tag ? '<span class="tag">' + A.esc(o.tag) + '</span>' : '') +
        (o.title ? '<h2>' + A.esc(o.title) + '</h2>' : '') +
        (o.art ? '<div class="art' + (o.glow ? ' glow' : '') + '">' + (o.glow ? '<div class="rays"></div>' : '') + o.art + '</div>' : '') +
        (o.html || '') + (o.sub ? '<p>' + A.esc(o.sub) + '</p>' : '') +
        '<button class="bigbtn ' + (o.btnCls || 'mint') + '">' + A.esc(o.btn || 'OK') + '</button>' +
        '<span class="kh">' + (A.isTouchOnly() ? ((A.Icons && A.Icons.has('👆')) ? A.Icons.html('👆', { size: 28, decorative: true, cls: 'pp-pic', slot: 'ui:tap' }) : '<svg class="pp-tap-hand" viewBox="0 0 64 64" width="28" height="28" aria-hidden="true" focusable="false"><path fill="#ffe0b0" stroke="#5a3d1c" stroke-width="2.4" stroke-linejoin="round" d="M28 8c2.4-1 5.4.4 6.2 3.2l3.2 12.2 1.2-6.2c.7-3 4-4.2 6.4-2.6 2 1.3 2.6 4 1.6 6.3l-3.4 8.2 6.4-3c2.6-1.2 5.8.2 6.6 3 .8 2.8-.8 5.6-3.6 6.5L38 40.2l1.2 14.4c.2 2.6-1.8 4.8-4.4 4.8h-8.2c-2.2 0-4-1.6-4.4-3.8L19.6 40.6c-3.6-2.2-5.8-6.2-5.8-10.5V22c0-2.8 2.4-5 5.2-4.8 2.2.2 4 2 4.4 4.2l1.2 6.2V12.4C24.6 10 26.2 8.4 28 8z"/></svg>') + ' Tap' : 'Press <kbd class="wide">Space</kbd> or <kbd class="wide">Enter</kbd>') + '</span>' + (A.Pad ? '<span class="ph">Press ' + A.Pad.g('a') + '</span>' : '') + '</div></div>');
      document.body.appendChild(ov); UI.cardOpen = true;
      var btn = ov.querySelector('.bigbtn'), done = false, lastTap = 0;
      // the beat (js/core/pace.js): celebrations / results hold a moment; presses in the lock are dropped, never queued
      var pm = A.Pace.forCard(o), L = A.Pace.lock(pm ? btn : null, Math.max(o.minMs || 450, pm), 'card:' + (o.cls || o.title || ''));   // menus/info cards: no cue, just the old short guard
      ov.__pace = L;
      function close() {
        if (done || !L.ready()) return; done = true; clearTimeout(L.timer);
        document.removeEventListener('keydown', onKey, true); A.Audio.sfx('tap');
        ov.remove(); UI.cardOpen = !!document.querySelector('.overlay.on'); resolve();
      }
      function onKey(e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape' || e.key === 'f' || e.key === 'F') { e.preventDefault(); e.stopPropagation(); if (!done && L.press(e)) { btn.classList.add('pressed'); setTimeout(close, 90); } }
      }
      document.addEventListener('keydown', onKey, true);
      btn.addEventListener('click', function (e) { var now = Date.now(); if (now - lastTap < A.Pace.CFG.TAP_DEBOUNCE) return; lastTap = now; if (L.press(null)) close(); });
      setTimeout(function () { try { btn.focus({ preventScroll: true }); } catch (e) {} }, 50);
      if (o.sfx) A.Audio.sfx(o.sfx);
      if (o.confetti) UI.rain(50);
      if (o.voiceMix) A.Voice.sayMix(o.voiceMix, { bubble: false }); else if (o.voice) A.Voice.say(o.voice, { kind: o.voiceKind || 'chatter', bubble: false });
    });
  };


  /* ---------- placement check (coach v2): 5 quick, low-stakes questions when a skill first opens ----------
     Resolves { score, result: 'skip' | 'higher' | 'normal' }. No hearts, no timer, no "wrong" sound: a missed one just glows the answer. */
  // Shared question overlays get one replay control, outside the prompt's layout.
  function promptReplay(ov, q) {
    var button = A.el('<button class="pc-replay" aria-label="Hear the prompt again">' + (A.Icons ? A.Icons.html('ui.speaker', { size: 32, decorative: true, cls: 'pp-pic' }) : '🔊') + '</button>');
    button.addEventListener('click', function () { if (q.say) A.Voice.say(q.say, { kind: 'tap' }); });
    ov.appendChild(button);
  }
  // batch-1107c: tap outside a question card to skip it; a small note says so
  function skipOutside(ov, fn) {
    var card = ov.querySelector('.card'); if (card) card.appendChild(A.el('<span class="pc-skipnote">Tap outside to skip</span>'));
    ov.addEventListener('click', function (e) { if (card && !card.contains(e.target) && !e.target.closest('.pc-replay')) fn(); });
  }
  UI.skipOutside = skipOutside;
  UI.placement = function (P, skill) {
    var api = A.Learn && A.Learn.placementApi ? A.Learn.placementApi(P, skill) : null;   // quality1: step warm-up, reading probe or place-value test-out
    if (api || (skill && skill.isStep && A.Steps)) return UI.warmup(P, skill, api);
    var C = A.Curriculum, K = A.Coach, Q = A.Questions, top = skill.levels.length - 1, n = K.PLACE_N, score = 0, i = 0;
    function one() {
      return new Promise(function (resolve) {
        var q = Q.make(skill, top, { choices: 3, profile: P });
        var ov = A.el('<div class="overlay on placement-card" role="dialog" aria-modal="true" aria-label="Quick check"><div class="card">' +
          '<span class="tag">Warm-up game · ' + (i + 1) + ' of ' + n + '</span><div class="pc-dots">' + Array.apply(null, Array(n)).map(function (_, k) { return '<i class="' + (k < i ? 'done' : k === i ? 'now' : '') + '"></i>'; }).join('') + '</div>' +
          UI.askHtml(q) +
          '<div class="pc-opts">' + q.choices.map(function (c, k) { return '<button class="pc-opt" data-i="' + k + '"><kbd>' + (k + 1) + '</kbd>' + (c.html || A.esc(c.label)) + '</button>'; }).join('') + '</div></div></div>');
        document.body.appendChild(ov); ov.__q = q; UI.cardOpen = true; promptReplay(ov, q);
        var btns = A.$$('.pc-opt', ov), done = false, t0 = Date.now();
        function pickIt(k) {
          if (done || Date.now() - t0 < A.Pace.CFG.FRESH_Q) return; done = true; var ok = k === q.answer;
          if (ok) score++;
          var key = String(q.text).replace(/<[^>]+>/g, '').replace(/^What’s /, '').replace(/\?$/, '').trim();
          C.recordAnswer(P, skill.id, ok, { key: key });
          btns[q.answer].classList.add('right'); if (!ok) btns[k].classList.add('picked'); A.Audio.sfx('tap');
          document.removeEventListener('keydown', onKey, true);
          setTimeout(function () { ov.remove(); UI.cardOpen = !!document.querySelector('.overlay.on'); resolve(); }, ok ? 700 : Math.max(1100, A.Pace.ms('RESULT')));
        }
        function onKey(e) {
          var k = +e.key; if (k >= 1 && k <= btns.length) { e.preventDefault(); e.stopPropagation(); return pickIt(k - 1); }
          var at = btns.indexOf(document.activeElement);
          if (/Arrow(Right|Down)/.test(e.key)) { e.preventDefault(); e.stopPropagation(); btns[(at + 1) % btns.length].focus(); }
          else if (/Arrow(Left|Up)/.test(e.key)) { e.preventDefault(); e.stopPropagation(); btns[(at - 1 + btns.length) % btns.length].focus(); }
          else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) pickIt(at < 0 ? 0 : at); }
        }
        document.addEventListener('keydown', onKey, true);
        btns.forEach(function (b, k) { b.addEventListener('click', function () { pickIt(k); }); });
        setTimeout(function () { try { btns[0].focus({ preventScroll: true }); } catch (e) {} }, 50);
        // batch-1107c: a tap outside the question card skips it (not counted)
        skipOutside(ov, function () { if (done) return; done = true; document.removeEventListener('keydown', onKey, true); ov.remove(); UI.cardOpen = !!document.querySelector('.overlay.on'); resolve(); });
        if (q.say) A.Voice.say(q.say, { kind: q.listen ? 'listen' : 'prompt' });
      });
    }
    function loop() { if (i >= n) return Promise.resolve(); return one().then(function () { i++; return loop(); }); }
    return UI.card({ cls: 'placement-intro', tag: 'Warm-up game: ' + skill.name, title: 'Let’s see what you already know!', html: '<p class="pc-sub">5 quick picks. No hearts, no clock. Just have fun!</p>', btn: 'Let’s go! ▶', voice: ['place_intro'], minMs: 500 })
      .then(loop).then(function () {
        var res = K.placementResult(P, skill.id, score); A.Store.save();
        var nx = C.nextSkill(skill.id), msg = res === 'skip' ? 'You already know ' + skill.name + '! We’ll skip ahead' + (nx ? ' to ' + nx.name : '') + ' and check back on it later.' : res === 'higher' ? 'Great job! You’ll start ' + skill.name + ' a little higher.' : res === 'back' ? 'Thanks! Let’s learn ' + C.current(P, C.subjectOf(skill)).name + ' together first.' : 'Thanks! Let’s learn ' + skill.name + ' together.';
        return UI.card({ cls: 'placement-done', tag: 'Warm-up: ' + score + ' of ' + n + ' yum!', title: res === 'skip' ? 'Wow, you know this!' : res === 'higher' ? 'Great job!' : 'Let’s learn it together!', html: '<p>' + A.esc(msg) + '</p>', btn: '▶ Play', voice: [res === 'skip' ? 'place_skip' : res === 'higher' ? 'place_higher' : 'place_normal'], sfx: res === 'skip' ? 'fanfare' : null, confetti: res === 'skip', minMs: 500 })
          .then(function () { return { score: score, result: res }; });
      });
  };
  /* v2p2a warm-up probe for a step ladder (js/core/steps-math.js): about 6 picks, one per step (a long ladder strides),
     easiest first; it stops at the first miss. No hearts, no clock, no "wrong" sound. Resolves { result: 'skip' | 'normal' }. */
  UI.warmup = function (P, skill, api) {
    var S = A.Steps, Q = A.Questions, i = 0;
    if (!api) { var pr = S.probePlan(P, skill.id); api = { n: pr.plan.length, next: function () { var st = S.probeNext(pr); return st ? { skill: st, level: 0 } : null; }, answer: function (ok) { S.probeAnswer(pr, ok); }, finish: function () { var o = S.probeFinish(P, pr); o.asked = pr.asked; return o; } }; }
    var n = api.n;
    function one(it) {
      return new Promise(function (resolve) {
        if (S) S.ctx.p = P; var q = Q.make(it.skill, it.level || 0, { choices: 3, profile: P });
        var ov = A.el('<div class="overlay on placement-card" role="dialog" aria-modal="true" aria-label="Warm-up"><div class="card">' +
          '<span class="tag">Warm-up</span><div class="pc-dots">' + Array.apply(null, Array(n)).map(function (_, k) { return '<i class="' + (k < i ? 'done' : k === i ? 'now' : '') + '"></i>'; }).join('') + '</div>' +
          UI.askHtml(q) +
          '<div class="pc-opts">' + q.choices.map(function (c, k) { return '<button class="pc-opt" data-i="' + k + '"><kbd>' + (k + 1) + '</kbd>' + (c.html || A.esc(c.label)) + '</button>'; }).join('') + '</div></div></div>');
        document.body.appendChild(ov); ov.__q = q; UI.cardOpen = true; promptReplay(ov, q);
        var btns = A.$$('.pc-opt', ov), done = false, t0 = Date.now();
        function pickIt(k) {
          if (done || Date.now() - t0 < A.Pace.CFG.FRESH_Q) return; done = true; var ok = k === q.answer;
          api.answer(ok); A.Audio.sfx('tap');
          if (ok) btns[k].classList.add('right'); else btns[k].classList.add('picked', 'fade');   // a miss just fades (no red, the answer is not shown)
          document.removeEventListener('keydown', onKey, true);
          setTimeout(function () { ov.remove(); UI.cardOpen = !!document.querySelector('.overlay.on'); resolve(); }, ok ? 650 : 900);
        }
        function onKey(e) {
          var k = +e.key; if (k >= 1 && k <= btns.length) { e.preventDefault(); e.stopPropagation(); return pickIt(k - 1); }
          var at = btns.indexOf(document.activeElement);
          if (/Arrow(Right|Down)/.test(e.key)) { e.preventDefault(); e.stopPropagation(); btns[(at + 1) % btns.length].focus(); }
          else if (/Arrow(Left|Up)/.test(e.key)) { e.preventDefault(); e.stopPropagation(); btns[(at - 1 + btns.length) % btns.length].focus(); }
          else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) pickIt(at < 0 ? 0 : at); }
        }
        document.addEventListener('keydown', onKey, true);
        btns.forEach(function (b, k) { b.addEventListener('click', function () { pickIt(k); }); });
        setTimeout(function () { try { btns[0].focus({ preventScroll: true }); } catch (e) {} }, 50);
        // batch-1107c: a tap outside the question card skips it (an "I don't know": the warm-up stops here, never places higher)
        skipOutside(ov, function () { if (done) return; done = true; api.answer(false); document.removeEventListener('keydown', onKey, true); ov.remove(); UI.cardOpen = !!document.querySelector('.overlay.on'); resolve(); });
        if (q.say) A.Voice.say(q.say, { kind: q.listen ? 'listen' : 'prompt' });
      });
    }
    function loop() { if (i >= n) return Promise.resolve(); var it = api.next(); if (!it) return Promise.resolve(); return one(it).then(function () { i++; return loop(); }); }
    return UI.card({ cls: 'placement-intro', tag: api.pv ? 'Quick check' : 'Warm-up', title: api.pv ? 'Tens and ones: quick check!' : 'Warm-up time!', html: '<p class="pc-sub">' + (api.pv ? 'A few quick picks about tens and ones. If you know them, we skip ahead.' : 'A few quick picks. No hearts, no clock. Just have fun!') + '</p>', btn: 'Let’s go! ▶', voice: [api.pv ? 'q1_pv_check' : 'st_warmup'], minMs: 500 })
      .then(loop).then(function () {
        var out = api.finish(); A.Store.save();
        var many = out.placed.length > 0;
        return UI.card({ cls: 'placement-done', tag: 'Warm-up done', title: many ? 'Wow, you know lots!' : 'Great warm-up!', html: '<p>' + (many ? 'You can skip ahead. Let’s play!' : 'Let’s play together!') + '</p>', btn: '▶ Play', voice: [many ? 'place_skip' : 'place_normal'], sfx: many ? 'fanfare' : null, confetti: many, minMs: 500 })
          .then(function () { return { score: out.asked, result: api.v2 || api.pv ? 'done' : many ? 'skip' : 'normal', start: out.start }; });
      });
  };
  /* a small, non-blocking mini-lesson for a diagnosed mistake (coach v2 ERRORS/HINTS): shows over the game for a few seconds */
  UI.diagHint = function (d, ms) {
    if (!d || !d.hint) return;
    var old = document.querySelector('.diag-hint'); if (old) old.remove();
    var el = A.el('<div class="diag-hint" role="status" data-type="' + d.type + '"><b class="dh-t">💡 ' + A.esc(d.hint.title) + '</b>' + d.hint.html(d.ctx) + '</div>');
    document.body.appendChild(el); clearTimeout(UI._dhT);
    UI._dhT = setTimeout(function () { el.classList.add('out'); setTimeout(function () { el.remove(); }, 400); }, ms || 6500);
  };

  /* ---------- gear: press & hold, then a grown-up check ---------- */
  UI.gear = function (opts) {
    opts = opts || {};
    var g = A.el('<button class="gear" id="gear" aria-label="Grown-up area (press and hold)"><span class="ring"></span>' + GEAR + '<span class="tip">Grown-ups: press and hold</span></button>');
    document.body.appendChild(g);
    var holdT = null, start = 0, raf = 0, tip = g.querySelector('.tip'), tipT;
    function tick() { var p = Math.min(100, (Date.now() - start) / 12); g.style.setProperty('--p', p); if (p < 100) raf = requestAnimationFrame(tick); }
    function cancel(showTip) {
      cancelAnimationFrame(raf); g.style.setProperty('--p', 0);
      if (holdT) { clearTimeout(holdT); holdT = null; if (showTip) { tip.classList.add('on'); clearTimeout(tipT); tipT = setTimeout(function () { tip.classList.remove('on'); }, 2200); } }
    }
    g.addEventListener('pointerdown', function (e) {
      e.preventDefault(); start = Date.now(); tick();
      holdT = setTimeout(function () { holdT = null; cancel(); UI.gate().then(function (ok) { if (ok) A.Parent.open(opts); }); }, 1200);
    });
    g.addEventListener('pointerup', function () { cancel(true); });
    g.addEventListener('pointerleave', function () { cancel(false); });
    g.addEventListener('pointercancel', function () { cancel(false); });
    g.addEventListener('click', function (e) { e.preventDefault(); });
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); UI.gate().then(function (ok) { if (ok) A.Parent.open(opts); }); } });
    return g;
  };
  UI.GATE_COOLDOWN = 10000;
  UI.gate = function () {
    return new Promise(function (resolve) {
      A.Voice.stop();
      var ov = A.el('<div class="overlay on" id="gate" role="dialog" aria-modal="true"><div class="card"><h3>Grown-ups only</h3><div class="muted" style="color:var(--ink2)">Answer to open the grown-up area.</div><div class="q"></div><div class="opts"></div><div class="row"><button class="pill" data-x>Cancel</button></div></div></div>');
      document.body.appendChild(ov);
      // a 2-digit times 1-digit question with 6 close choices (easy for an adult, hard to guess); a wrong answer = 10 s "Ask a grown-up" pause
      var tmr = null;
      function ask() {
        if (Date.now() < (UI.gateUntil || 0)) return wait();
        var a = A.rnd(12, 19), b = A.rnd(3, 9), ans = a * b, opts = [ans];
        while (opts.length < 6) { var w = ans + A.pick([-a, a, -b, b, -10, 10, -1, 1, 2 * b, -2 * b, 20, -20]); if (w > 0 && opts.indexOf(w) < 0) opts.push(w); }
        A.shuffle(opts);
        ov.querySelector('.q').textContent = a + ' × ' + b + ' = ?';
        var box = ov.querySelector('.opts'); box.innerHTML = ''; box.classList.add('six');
        opts.forEach(function (v) {
          var bt = A.el('<button>' + v + '</button>');
          bt.addEventListener('click', function () {
            if (v === ans) { done(true); }
            else { bt.classList.add('no'); A.Audio.sfx('locked'); UI.gateUntil = Date.now() + UI.GATE_COOLDOWN; setTimeout(wait, 400); }
          });
          box.appendChild(bt);
        });
      }
      function wait() {
        var box = ov.querySelector('.opts'); box.innerHTML = ''; var q = ov.querySelector('.q');
        A.Voice.say(['hub_ask_grownup'], { bubble: false });
        (function tick() {
          var left = Math.ceil(((UI.gateUntil || 0) - Date.now()) / 1000);
          if (left <= 0) { tmr = null; ov.classList.remove('cooling'); return ask(); }
          ov.classList.add('cooling'); q.innerHTML = '<span class="gwait">Ask a grown-up</span><small class="gsec">Try again in ' + left + '</small>';
          tmr = setTimeout(tick, 250);
        })();
      }
      function done(ok) { clearTimeout(tmr); document.removeEventListener('keydown', onKey, true); ov.remove(); resolve(ok); }
      function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); done(false); } e.stopPropagation(); }
      document.addEventListener('keydown', onKey, true);
      ov.querySelector('[data-x]').addEventListener('click', function () { done(false); });
      ask();
      A.Voice.say(['hub_grownups'], { bubble: false });
    });
  };

  /* ---------- yes / no question (e.g. "Delete this player?"). Esc = no. Resolves true / false. ---------- */
  // o: {title, sub, art, yes, no, danger}
  UI.confirm = function (o) {
    return new Promise(function (resolve) {
      var ov = A.el('<div class="overlay on confirm' + (o.cls ? ' ' + o.cls : '') + '" role="alertdialog" aria-modal="true"><div class="card">' + (o.art ? '<div class="art">' + o.art + '</div>' : '') +
        '<h2>' + A.esc(o.title) + '</h2>' + (o.sub ? '<p>' + A.esc(o.sub) + '</p>' : '') +
        (o.yesSmall ? '<div class="row2"><button class="bigbtn mint" data-no>' + A.esc(o.no || 'No') + '</button></div><div class="row2"><button class="pill dellink" data-yes>' + A.esc(o.yes || 'Yes') + '</button></div>'   // the risky choice is small and plain
          : '<div class="row2"><button class="bigbtn ' + (o.danger ? 'danger' : 'mint') + '" data-yes>' + A.esc(o.yes || 'Yes') + '</button><button class="bigbtn plain" data-no>' + A.esc(o.no || 'No') + '</button></div>') +
        '<span class="kh">' + (A.isTouchOnly() ? '' : '<kbd>←</kbd><kbd>→</kbd> choose · <kbd class="wide">Enter</kbd> · <kbd>Esc</kbd> = ' + A.esc(o.no || 'No')) + '</span>' + (A.Pad ? '<span class="ph">' + A.Pad.g('dpad') + ' choose · ' + A.Pad.g('a') + ' pick · ' + A.Pad.g('b') + ' = ' + A.esc(o.no || 'No') + '</span>' : '') + '</div></div>');
      document.body.appendChild(ov); UI.cardOpen = true;
      var yes = ov.querySelector('[data-yes]'), no = ov.querySelector('[data-no]'), t0 = Date.now();
      function done(v) { if (Date.now() - t0 < 250) return; document.removeEventListener('keydown', onKey, true); ov.remove(); UI.cardOpen = !!document.querySelector('.overlay.on'); A.Audio.sfx('tap'); resolve(v); }
      function onKey(e) {
        e.stopPropagation();
        if (e.key === 'Escape') { e.preventDefault(); done(false); }
        else if (/^Arrow/.test(e.key)) { e.preventDefault(); (document.activeElement === yes ? no : yes).focus(); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!e.repeat) done(document.activeElement === yes); }
      }
      document.addEventListener('keydown', onKey, true);
      yes.addEventListener('click', function () { done(true); }); no.addEventListener('click', function () { done(false); });
      setTimeout(function () { try { (o.danger ? no : yes).focus({ preventScroll: true }); } catch (e) {} }, 30);
      if (o.voice) A.Voice.say(o.voice, { kind: o.voiceKind || 'chatter', bubble: false });
    });
  };

  /* ---------- arrow-key focus navigation for menus (hub) ---------- */
  UI.arrowNav = function (getItems) {
    document.addEventListener('keydown', function (e) {
      if (UI.cardOpen || document.querySelector('#parent.on, #gate')) return;
      var k = e.key; if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(k) < 0) return;
      var ae = document.activeElement; if (ae && ae.tagName === 'INPUT' && (k === 'ArrowLeft' || k === 'ArrowRight') && ae.value) return;
      var items = getItems().filter(function (el) { return el.offsetParent !== null; }); if (!items.length) return;
      e.preventDefault();
      var cur = items.indexOf(document.activeElement);
      if (cur < 0) { items[0].focus(); return; }
      var r0 = items[cur].getBoundingClientRect(), cx = r0.left + r0.width / 2, cy = r0.top + r0.height / 2, best = null, bd = 1e9;
      items.forEach(function (el, i) {
        if (i === cur) return; var r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, dx = x - cx, dy = y - cy;
        var ok = k === 'ArrowLeft' ? dx < -5 : k === 'ArrowRight' ? dx > 5 : k === 'ArrowUp' ? dy < -5 : dy > 5; if (!ok) return;
        var d = (k === 'ArrowLeft' || k === 'ArrowRight') ? Math.abs(dx) + Math.abs(dy) * 2.5 : Math.abs(dy) + Math.abs(dx) * 2.5;
        if (d < bd) { bd = d; best = el; }
      });
      if (best) { best.focus(); A.Audio.sfx('step'); }
    });
  };

  /* ---------- gentle notice when this browser can't keep progress (storage blocked, or file:// outside Chrome/Edge) ---------- */
  UI.saveNotice = function () {
    var st = A.Store.persistence(); A.saveState = st;
    if (st === 'ok' || document.querySelector('.savenote')) return;
    try { if (sessionStorage.getItem('blobArcade.noticeHidden')) return; } catch (e) {}
    var n = A.el('<div class="savenote" role="status"><span>🌧️ Progress may not save in this browser. For saved players and stars, use <b>Chrome</b> or <b>Edge</b>, or the web link.</span><button aria-label="Hide this notice">OK</button></div>');
    n.querySelector('button').addEventListener('click', function () { n.remove(); try { sessionStorage.setItem('blobArcade.noticeHidden', '1'); } catch (e) {} });
    document.body.appendChild(n);
  };

  /* ---------- boot (call once per page) ---------- */
  UI.boot = function () {
    A.Store.load();
    setTimeout(UI.saveNotice, 0);
    var unlocked = false;
    function unlock() { if (unlocked) return; unlocked = true; A.Audio.unlock(); }
    document.addEventListener('pointerdown', unlock, true); document.addEventListener('keydown', unlock, true);
    // kid-proofing: no pinch-zoom / double-tap zoom / long-press menus (except in the grown-up area & inputs)
    function inPanel(e) { return e.target.closest && e.target.closest('#parent, input, textarea, select'); }
    document.addEventListener('dblclick', function (e) { if (!inPanel(e)) e.preventDefault(); }, { passive: false });
    document.addEventListener('gesturestart', function (e) { e.preventDefault(); }, { passive: false });
    document.addEventListener('contextmenu', function (e) { if (!inPanel(e)) e.preventDefault(); });
    document.addEventListener('touchmove', function (e) { if (!(e.target.closest && e.target.closest('.scroll, #parent'))) e.preventDefault(); }, { passive: false });
    document.addEventListener('visibilitychange', function () { if (document.hidden) A.Voice.stop(); });
    // keyboard / controller focus speaks the focused tile, card or menu button (pre-readers), debounced so fast arrowing doesn't stack
    var lastKey = 0;
    document.addEventListener('keydown', function (e) { if (/^(Arrow|Tab)/.test(e.key)) { UI.navByKey = true; lastKey = Date.now(); } }, true);
    document.addEventListener('pointerdown', function () { UI.navByKey = false; }, true);
    document.addEventListener('focusin', function (e) {
      var el = e.target; if (!UI.navByKey || Date.now() - lastKey > 600 || !el || !el.closest) return;
      if (el.closest('.overlay, #parent, #gate') || el.tagName === 'INPUT' || el.tagName === 'SELECT') return;
      if (!el.matches('[data-nav], .tile, .kid, .mtile, .opt, .actbtn, .backbtn, .rbtn')) return;
      UI.focusSay(el);
    });
  };
  // what a focused element says: el._say (voice parts set by the page), else its aria-label / visible name (browser voice)
  UI.sayFor = function (el) {
    if (el._say) return el._say;
    var t = el.getAttribute('aria-label') || (el.querySelector('.tn, .nm, .on2, b') || el).textContent || '';
    t = t.replace(/[▶◀✓✏️🔒]/g, '').replace(/\s+/g, ' ').trim(); return t ? [{ text: t }] : null;
  };
  var fsT = null;
  UI.focusSay = function (el) {
    clearTimeout(fsT);
    // focus speech only at "Full" talking (2026-10-22 voice); the tooltip bubble shows the words instead
    if (!A.Talk || !A.Talk.allows('focus')) return;
    fsT = setTimeout(function () { if (document.activeElement !== el) return; var parts = UI.sayFor(el); if (parts) { UI.focusSaid = parts; A.Voice.say(parts, { kind: 'focus' }); } }, UI.FOCUS_SAY_MS);
  };
  UI.FOCUS_SAY_MS = 380;

  /* ---------- food-friend speech bubble (2026-10-22 voice): the words a line would have said, for pages without their own bubble ---------- */
  var fbT = null;
  UI.friendBubble = function (text, ms) {
    text = String(text || '').trim(); if (!text || !document.body) return null;
    var el = document.getElementById('friendBubble');
    if (!el) {
      el = A.el('<div id="friendBubble" class="friend-bubble" role="status" aria-live="polite"><span class="fb-friend" aria-hidden="true"></span><span class="fb-say"><span class="fb-msg"></span></span></div>');
      document.body.appendChild(el);
      el.addEventListener('click', function () { el.classList.remove('on'); });
    }
    var p = A.Store && A.Store.active && A.Store.active();
    try { el.querySelector('.fb-friend').innerHTML = p && A.Blobs ? A.Blobs.forProfile(p, { expr: 'happy' }) : ''; } catch (e) {}
    el.querySelector('.fb-msg').textContent = text; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
    clearTimeout(fbT); fbT = setTimeout(function () { el.classList.remove('on'); }, ms || Math.max(2600, Math.min(6000, text.length * 70)));
    UI.lastBubble = text; return el;
  };

  /* ---------- tooltips: short descriptions on hover, keyboard focus and long-press (touch), never spoken ----------
     UI.tip(el, text) sets data-tip + aria-label/title. One shared bubble follows the element. A long-press (about 500 ms) shows
     the tip and swallows the click that follows, so it never launches the game. (The context menu is already blocked in boot.) */
  UI.LONG_PRESS_MS = 500;
  UI.tip = function (el, text, opt) {
    if (!el || !text) return el; opt = opt || {};
    el.setAttribute('data-tip', text);
    if (opt.label !== false) { var nm = opt.name || ''; el.setAttribute('aria-label', nm ? nm + '. ' + text : (el.getAttribute('aria-label') || text)); }
    if (!el.hasAttribute('title') || opt.title !== false) el.setAttribute('title', text);
    return el;
  };
  UI.tipAll = function (root, sel, fn) { A.$$(sel, root || document).forEach(function (el) { var t = fn(el); if (t) UI.tip(el, t.text || t, t.text ? t : {}); }); };
  var tipEl = null, tipFor = null, tipT = null;
  function tipBox() {
    if (!tipEl) { tipEl = A.el('<div id="tipBubble" class="tip-bubble" role="tooltip" aria-hidden="true"></div>'); document.body.appendChild(tipEl); }
    return tipEl;
  }
  function tipHitsPlay(b, el) {
    var br = b.getBoundingClientRect();
    var nodes = document.querySelectorAll('.tile .play');
    var i, p, n;
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      if (n === el || (el && el.contains && el.contains(n))) continue;
      p = n.getBoundingClientRect();
      if (p.width < 8 || p.height < 8) continue;
      if (br.right > p.left + 4 && br.left < p.right - 4 && br.bottom > p.top + 4 && br.top < p.bottom - 4) return true;
    }
    return false;
  }
  UI.showTip = function (el, how) {
    var t = el && el.getAttribute && el.getAttribute('data-tip'); if (!t) return;
    /* Touch screens: only long-press shows a tip, so a first tap never leaves a bubble on a Play button. */
    if (how === 'hover' && window.matchMedia && window.matchMedia('(hover: none)').matches) return;
    if (el.hasAttribute('title')) { el.setAttribute('data-title', el.getAttribute('title')); el.removeAttribute('title'); }
    var b = tipBox(); b.textContent = t; b.className = 'tip-bubble on ' + (how || ''); tipFor = el;
    var r = el.getBoundingClientRect(), bw = Math.min(280, innerWidth - 16); b.style.maxWidth = bw + 'px';
    var w = b.offsetWidth, h = b.offsetHeight;
    var x = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2));
    var y = r.top - h - 12, below = false;
    if (y < 6) { y = r.bottom + 12; below = true; }
    b.style.left = x + 'px'; b.style.top = y + 'px'; b.classList.toggle('below', below);
    if (tipHitsPlay(b, el)) {
      if (!below) { y = r.bottom + 12; below = true; }
      else { y = Math.max(8, r.top - h - 12); below = false; }
      b.style.top = y + 'px'; b.classList.toggle('below', below);
    }
    if (tipHitsPlay(b, el)) {
      x = Math.min(innerWidth - w - 8, Math.max(8, r.right + 8));
      y = Math.max(8, Math.min(innerHeight - h - 8, r.top));
      b.style.left = x + 'px'; b.style.top = y + 'px'; b.classList.remove('below');
    }
    if (tipHitsPlay(b, el)) {
      /* Last resort: park in a chrome gap, shrink if needed, or hide rather than cover a Play button. */
      function clampTip(px, py) {
        return {
          x: Math.max(4, Math.min(innerWidth - w - 4, px)),
          y: Math.max(4, Math.min(innerHeight - h - 4, py))
        };
      }
      function tipSpots() {
        var list = [], bar = document.querySelector('#games .topbar, .topbar'), acts = document.querySelector('#games .actions');
        var br = bar && bar.getBoundingClientRect(), ar = acts && acts.getBoundingClientRect();
        if (ar) {
          list.push([8, ar.bottom + 6], [(innerWidth - w) / 2, ar.bottom + 6], [innerWidth - w - 8, ar.bottom + 6]);
          list.push([8, ar.top - h - 6], [(innerWidth - w) / 2, ar.top - h - 6]);
        }
        if (br) list.push([8, br.bottom + 4], [(innerWidth - w) / 2, br.bottom + 4], [innerWidth - w - 8, br.bottom + 4]);
        list.push(
          [8, innerHeight - h - 8], [innerWidth - w - 8, innerHeight - h - 8],
          [innerWidth - w - 8, 8], [(innerWidth - w) / 2, innerHeight - h - 8],
          [(innerWidth - w) / 2, 8], [8, (innerHeight - h) / 2], [innerWidth - w - 8, (innerHeight - h) / 2]
        );
        return list;
      }
      function trySpots() {
        var spots = tipSpots(), i, s, pos;
        for (i = 0; i < spots.length; i++) {
          pos = clampTip(spots[i][0], spots[i][1]);
          b.style.left = pos.x + 'px'; b.style.top = pos.y + 'px'; b.classList.add('below');
          if (!tipHitsPlay(b, el)) { x = pos.x; y = pos.y; return true; }
        }
        return false;
      }
      if (!trySpots()) {
        b.classList.add('compact');
        b.style.maxWidth = Math.min(180, innerWidth - 16) + 'px';
        w = b.offsetWidth; h = b.offsetHeight;
        if (!trySpots()) { UI.hideTip(); return; }
      }
    }
    b.style.setProperty('--ax', Math.max(14, Math.min(w - 14, r.left + r.width / 2 - x)) + 'px');
    clearTimeout(tipT); if (how === 'press') tipT = setTimeout(UI.hideTip, 1800);
    UI.tipShown = { text: t, how: how || '' };
  };
  UI.hideTip = function () {
    clearTimeout(tipT); if (tipEl) tipEl.classList.remove('on');
    if (tipFor && tipFor.hasAttribute('data-title')) { tipFor.setAttribute('title', tipFor.getAttribute('data-title')); tipFor.removeAttribute('data-title'); }
    tipFor = null;
  };
  function tipTarget(e) { return e.target && e.target.closest ? e.target.closest('[data-tip]') : null; }
  document.addEventListener('mouseover', function (e) { var el = tipTarget(e); if (el && el !== tipFor) UI.showTip(el, 'hover'); else if (!el && tipFor && !UI.pressTip) UI.hideTip(); });
  document.addEventListener('mouseout', function (e) { var el = tipTarget(e); if (el && el === tipFor && !(e.relatedTarget && el.contains(e.relatedTarget)) && !UI.pressTip) UI.hideTip(); });
  document.addEventListener('focusin', function (e) { var el = tipTarget(e); if (el && el === e.target && UI.navByKey) UI.showTip(el, 'focus'); });
  document.addEventListener('focusout', function (e) { if (tipFor && tipFor === e.target && !UI.pressTip) UI.hideTip(); });
  document.addEventListener('scroll', function () { if (!UI.pressTip) UI.hideTip(); }, true);
  // long-press (touch / pen, and a held mouse button): ~500 ms shows the tip; the click after it is cancelled
  var lp = null;
  document.addEventListener('pointerdown', function (e) {
    var el = tipTarget(e); if (!el || (e.pointerType === 'mouse' && e.button !== 0)) return;
    var x0 = e.clientX, y0 = e.clientY;
    lp = { el: el, x: x0, y: y0, fired: false, t: setTimeout(function () { if (!lp || lp.el !== el) return; lp.fired = true; UI.pressTip = true; UI.showTip(el, 'press'); UI.longPressed = el; A.emit && A.emit('tip:longpress', el); }, UI.LONG_PRESS_MS) };
  }, true);
  document.addEventListener('pointermove', function (e) { if (lp && !lp.fired && Math.abs(e.clientX - lp.x) + Math.abs(e.clientY - lp.y) > 12) { clearTimeout(lp.t); lp = null; } }, true);
  function lpEnd() { if (!lp) return; clearTimeout(lp.t); if (lp.fired) { var el = lp.el; UI.swallowClickUntil = Date.now() + 700; UI.swallowFor = el; setTimeout(function () { UI.pressTip = false; }, 2600); } lp = null; }
  document.addEventListener('pointerup', lpEnd, true); document.addEventListener('pointercancel', function () { if (lp) { clearTimeout(lp.t); if (lp.fired) setTimeout(function () { UI.pressTip = false; }, 2600); lp = null; } }, true);
  // the click (and Enter-free) activation after a long-press is swallowed in the capture phase, before any tile handler runs
  function tipIsControl(el) {
    if (!el || !el.closest) return false;
    return !!(el.closest('button, a, [data-nav], [data-game], .tile, .opt, .kid, .homebtn, #homeBtn, [role="button"]'));
  }
  document.addEventListener('click', function (e) {
    /* Long-press tips must not cancel the tap on real buttons (game tiles, Home, cards). Kids often press a little longer than a mouse click. */
    if (UI.swallowClickUntil && Date.now() < UI.swallowClickUntil && UI.swallowFor && UI.swallowFor.contains(e.target)) {
      if (tipIsControl(e.target) || tipIsControl(UI.swallowFor)) { UI.swallowClickUntil = 0; UI.swallowFor = null; return; }
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); UI.swallowClickUntil = 0; UI.swallowFor = null;
    }
  }, true);

  /* ---------- quality1 (C3): how-to-play card for Munch, Bubble Pop, Lemonade Stand, Tiny Picnic and Story ----------
     1-2 short lines + a picture; readable on mute (text), read aloud with sound (one recorded line each, js/core/learn.js Q1_LINES).
     Shown once on a player's first play of that game (P.howto[game]) and any time behind the "?" button. Automated browsers
     skip the first-play card (like breaks.js) unless localStorage blobArcade.howto = '1'. */
  var HOWTO = {
    munch: { e: '😋', title: 'Picnic Munch', art: 'munch',
      caps: ['Look at the picture or words at the top.', 'Walk your friend to a matching square.', 'Munch it!'],
      steps: [{ e: '👀', t: 'Look at the top' }, { e: '🚶', t: 'Walk to a match' }, { e: '😋', t: 'Munch it!' }],
      lines: ['Look at the picture or words at the top.', 'Walk your friend to a right answer and munch it!'] },
    bubble: { e: '🫧', title: 'Bubble Pop', art: 'bubble',
      caps: ['Listen, or look at the card.', 'Pop the matching bubble.', 'Get stars!'],
      steps: [{ e: '👂', t: 'Listen' }, { e: '👆', t: 'Pop match' }, { e: '⭐', t: 'Stars!' }],
      lines: ['Listen, or look at the card.', 'Pop the matching bubble.', 'Get stars!'] },
    stand: { e: '🍋', title: 'Lemonade Stand', art: 'lemonade',
      caps: ['Read the recipe.', 'Tap the ingredients into the pitcher.', 'Serve!'],
      steps: [{ e: '📋', t: 'Recipe' }, { e: '👆', t: 'Tap in' }, { e: '🥤', t: 'Serve!' }],
      lines: ['Read the recipe.', 'Tap ingredients into the pitcher.', 'Serve!'] },
    baseball: { e: '⚾', title: 'Snack Slugger', art: 'slugger',
      caps: ['Read the pitch question.', 'Tap your answer to swing.', 'Hits are runs. Misses are outs.'] },
    racers: { e: '🏎️', title: 'Snack Racers', art: 'racers',
      caps: ['Pick your snack car.', 'Answer the question to zoom ahead.', 'Race to the finish!'] },
    packer: { e: '🧺', title: 'Picnic Packer', art: 'packer',
      caps: ['The ticket shows 3 strawberries.', 'Tap a food on the shelf to put it in the basket.', 'Too many? Tap the extra food to take it out.'] },
    garden: { e: '🌱', title: 'Garden', art: 'garden',
      caps: ['Tap a seed packet.', 'Tap a patch of soil to plant it.', 'Answer to water and grow a friend!'] },
    pancake: { e: '🥞', title: 'Pancake Place', art: 'pancake',
      caps: ['Look at the order.', 'Tap pancakes onto the plate.', 'Check with syrup when the stack is right.'] },
    tiny: { e: '🧺', title: 'Tiny Picnic', lines: ['Listen for what to find.', 'Tap the picture. Every tap is OK!'] },
    story: { e: '🗺️', title: 'Story', lines: ['Walk the path with your friends.', 'Play each stop to find the missing star-snacks!'] }
  };
  // Style A composites are 400×720 / 1024×640. Caption + Go boxes are in those pixels.
  var HOWTO_BOX = {
    portrait: { W: 400, H: 720, cap: [30, 606, 340, 27], go: [174, 645, 52, 53] },
    landscape: {
      lemonade: [935, 509], munch: [935, 439], slugger: [935, 378], racers: [935, 391],
      packer: [935, 418], bubble: [935, 393], garden: [935, 396], pancake: [935, 373]
    }
  };
  function howtoAuto() { try { var v = localStorage.getItem('blobArcade.howto'); if (v === '1') return true; if (v === '0') return false; } catch (e) {} return !(typeof navigator !== 'undefined' && navigator.webdriver); }
  function howtoBody(h) {
    if (h.steps && h.steps.length) {
      return '<div class="howto-steps" role="list">' + h.steps.map(function (s, i) {
        return '<div class="howto-step" role="listitem"><span class="hs-e" aria-hidden="true">' + (A.Icons ? A.Icons.html(s.e, { size: 48, decorative: true, cls: 'pp-pic' }) : s.e) + '</span><span class="hs-t">' + A.esc(s.t) + '</span>' +
          (i < h.steps.length - 1 ? '<span class="hs-arrow" aria-hidden="true">→</span>' : '') + '</div>';
      }).join('') + '</div>';
    }
    return '<p class="howto-lines">' + h.lines.map(A.esc).join('<br>') + '</p>';
  }
  function howtoKind() { return (document.documentElement.getAttribute('data-stage') === 'landscape') ? 'landscape' : 'portrait'; }
  function howtoStageScale() { var s = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stage-scale')); return s > 0 ? s : 1; }
  function howtoPct(box, W, H, minHit) {
    var x = box[0], y = box[1], w = box[2], h = box[3];
    if (minHit) {
      var nw = Math.max(w, minHit), nh = Math.max(h, minHit);
      x -= (nw - w) / 2; y -= (nh - h) / 2; w = nw; h = nh;
    }
    return 'left:' + (x / W * 100).toFixed(3) + '%;top:' + (y / H * 100).toFixed(3) + '%;width:' + (w / W * 100).toFixed(3) + '%;height:' + (h / H * 100).toFixed(3) + '%;';
  }
  function howtoBoxes(h, kind) {
    if (kind === 'portrait') return HOWTO_BOX.portrait;
    var goXY = HOWTO_BOX.landscape[h.art] || [935, 400];
    var go = [goXY[0], goXY[1], 58, 59];
    var capH = 32, capY = go[1] + (go[3] - capH) / 2;
    return { W: 1024, H: 640, cap: [40, capY, go[0] - 8 - 40, capH], go: go };
  }
  function showArt(g, h) {
    return new Promise(function (resolve) {
      var host = document.querySelector('html.stage-on .stage-scale') || document.body;
      var caps = h.caps || h.lines || [];
      var step = 0, done = false, ov, talkTok = 0;
      function src(kind) { return A.ROOT + 'art/howto/howto_' + h.art + '_' + kind + '.png'; }
      function paint() {
        var kind = howtoKind();
        var box = howtoBoxes(h, kind);
        var img = ov.querySelector('.howto-shot');
        var cap = ov.querySelector('.howto-cap');
        var go = ov.querySelector('.howto-go');
        img.src = src(kind);
        cap.setAttribute('style', howtoPct(box.cap, box.W, box.H));
        go.setAttribute('style', howtoPct(box.go, box.W, box.H, Math.ceil(60 / howtoStageScale())));
        cap.textContent = caps[step] || caps[0] || '';
        var size = kind === 'landscape' ? 22 : 15;
        cap.style.fontSize = size + 'px';
        while (size > 12 && (cap.scrollHeight > cap.clientHeight + 1 || cap.scrollWidth > cap.clientWidth + 1)) {
          size -= 0.5; cap.style.fontSize = size + 'px';
        }
      }
      function waitMs(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
      function sayStep(i) {
        if (done || i == null || !caps[i]) return Promise.resolve();
        var my = ++talkTok;
        if (A.Voice && A.Voice.stop) A.Voice.stop();
        var spoken = (A.Voice && A.Voice.say) ? A.Voice.say([{ text: caps[i] }], { kind: 'prompt', bubble: false }) : Promise.resolve();
        /* Hold long enough to read even when voice is off (say() resolves immediately). */
        return Promise.all([spoken, waitMs(2400)]).then(function () {
          if (done || my !== talkTok) return;
          if (i === step && step < caps.length - 1) { step += 1; paint(); return sayStep(step); }
        });
      }
      function close() {
        if (done) return; done = true;
        talkTok += 1;
        if (A.Voice && A.Voice.stop) A.Voice.stop();
        window.removeEventListener('resize', paint);
        document.removeEventListener('keydown', onKey, true);
        if (ov && ov.parentNode) ov.remove();
        UI.cardOpen = !!document.querySelector('.overlay.on');
        resolve();
      }
      function onKey(e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape' || e.key === 'f' || e.key === 'F') {
          e.preventDefault(); e.stopPropagation(); close();
        }
      }
      ov = A.el('<div class="overlay on howto howto-a" role="dialog" aria-modal="true" aria-label="How to play">' +
        '<img class="howto-shot" alt="">' +
        '<button type="button" class="howto-cap" aria-label="Hear this step again"></button>' +
        '<button type="button" class="howto-go" aria-label="Start the game"></button>' +
        '</div>');
      host.appendChild(ov); UI.cardOpen = true;
      paint();
      ov.querySelector('.howto-go').addEventListener('click', function (e) { e.stopPropagation(); if (A.Audio && A.Audio.sfx) A.Audio.sfx('tap'); close(); });
      ov.querySelector('.howto-cap').addEventListener('click', function (e) { e.stopPropagation(); sayStep(step); });
      document.addEventListener('keydown', onKey, true);
      window.addEventListener('resize', paint);
      sayStep(0);
    });
  }
  var HowTo = A.HowTo = { DATA: HOWTO,
    show: function (g) {
      var h = HOWTO[g]; if (!h || document.querySelector('.overlay.howto')) return Promise.resolve();
      if (h.art) return showArt(g, h);
      var P = A.Store && A.Store.active && A.Store.active(), friend = P && A.Blobs && A.Blobs.forProfile ? A.Blobs.forProfile(P, { expr: 'happy' }) : '';
      var pic = h.steps ? '' : '<div class="howto-art"><span class="he" aria-hidden="true">' + (A.Icons ? A.Icons.html(h.e, { size: 64, decorative: true, cls: 'pp-pic' }) : h.e) + '</span>' + (friend ? '<span class="hf">' + friend + '</span>' : '') + '</div>';
      return UI.card({ cls: 'howto' + (h.steps ? ' howto-pic' : ''), tag: 'How to play', title: h.title, art: pic,
        html: howtoBody(h), btn: "Let's go!", voice: ['q1_howto_' + g], minMs: 500 });
    },
    seen: function (g) { var P = A.Store && A.Store.active && A.Store.active(); return !!(P && P.howto && P.howto[g]); },
    // first play: the card once, then the game starts. Resolves right away when already seen (or under automation).
    first: function (g) {
      var P = A.Store && A.Store.active && A.Store.active(); if (!P || !HOWTO[g] || HowTo.seen(g) || !howtoAuto()) return Promise.resolve(false);
      (P.howto || (P.howto = {}))[g] = Date.now(); try { A.Store.save(); } catch (e) {}
      return HowTo.show(g).then(function () { return true; });
    },
    // the "?" button: placed right after `after` (an element or selector) in the game's top bar
    button: function (g, after) {
      var a = typeof after === 'string' ? document.querySelector(after) : after; if (!a || !a.parentNode || document.getElementById('howtoBtn')) return null;
      var b = A.el('<button class="q1help" id="howtoBtn" aria-label="How to play" title="How to play">?</button>');
      a.parentNode.insertBefore(b, a.nextSibling);
      b.addEventListener('click', function (e) { e.stopPropagation(); if (document.querySelector('.overlay.on')) return;   /* UI.cardOpen can be left stale by a game's own card */ A.Audio && A.Audio.sfx && A.Audio.sfx('tap'); HowTo.show(typeof g === 'function' ? g() : g); });
      return b;
    } };
})(window.Arcade);
