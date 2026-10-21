/* Blob Arcade — shared UI: cards/celebrations, effects, toast, press-and-hold gear + grown-up check, boot. */
(function (A) {
  'use strict';
  var STAR = '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>';
  var COLORS = ['#ff8fb1', '#ffd23c', '#8fe3c0', '#9fd2ff', '#c9b2ff', '#ffb36b'];
  var GEAR = '<svg viewBox="0 0 24 24"><path d="M19.4 13a7.7 7.7 0 0 0 0-2l2.1-1.6-2-3.4-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3.3h-4l-.3 2.7a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.4L6.6 11a7.7 7.7 0 0 0 0 2l-2.1 1.6 2 3.4 2.5-1a7.4 7.4 0 0 0 1.7 1l.3 2.7h4l.3-2.7a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.4zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" transform="translate(-1 0)"/></svg>';
  var UI = A.UI = { STAR: STAR, GEAR: GEAR, COLORS: COLORS };

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
    var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; fxAdd(t, ms || 2600);
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
        '<span class="kh">' + (A.isTouchOnly() ? '' : 'Press <kbd class="wide">Space</kbd> or <kbd class="wide">Enter</kbd>') + '</span>' + (A.Pad ? '<span class="ph">Press ' + A.Pad.g('a') + '</span>' : '') + '</div></div>');
      document.body.appendChild(ov); UI.cardOpen = true;
      var btn = ov.querySelector('.bigbtn'), t0 = Date.now(), done = false;
      function close() {
        if (done || Date.now() - t0 < (o.minMs || 450)) return; done = true;
        document.removeEventListener('keydown', onKey, true); A.Audio.sfx('tap');
        ov.remove(); UI.cardOpen = !!document.querySelector('.overlay.on'); resolve();
      }
      function onKey(e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape' || e.key === 'f' || e.key === 'F') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) { btn.classList.add('pressed'); setTimeout(close, 90); } }
      }
      document.addEventListener('keydown', onKey, true);
      btn.addEventListener('click', close);
      setTimeout(function () { try { btn.focus({ preventScroll: true }); } catch (e) {} }, 50);
      if (o.sfx) A.Audio.sfx(o.sfx);
      if (o.confetti) UI.rain(50);
      if (o.voice) A.Voice.say(o.voice);
    });
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
  UI.gate = function () {
    return new Promise(function (resolve) {
      A.Voice.stop();
      var ov = A.el('<div class="overlay on" id="gate" role="dialog" aria-modal="true"><div class="card"><h3>Grown-ups only</h3><div class="muted" style="color:var(--ink2)">Answer to open the grown-up area.</div><div class="q"></div><div class="opts"></div><div class="row"><button class="pill" data-x>Cancel</button></div></div></div>');
      document.body.appendChild(ov);
      function ask() {
        var a = A.rnd(4, 9), b = A.rnd(3, 9), ans = a * b, opts = [ans];
        while (opts.length < 4) { var w = ans + A.pick([-a, a, -b, b, -1, 1, 10, -10, b * 2]); if (w > 0 && opts.indexOf(w) < 0) opts.push(w); }
        A.shuffle(opts);
        ov.querySelector('.q').textContent = a + ' × ' + b + ' = ?';
        var box = ov.querySelector('.opts'); box.innerHTML = '';
        opts.forEach(function (v) {
          var bt = A.el('<button>' + v + '</button>');
          bt.addEventListener('click', function () {
            if (v === ans) { done(true); }
            else { bt.classList.add('no'); A.Audio.sfx('locked'); setTimeout(ask, 500); }
          });
          box.appendChild(bt);
        });
      }
      function done(ok) { document.removeEventListener('keydown', onKey, true); ov.remove(); resolve(ok); }
      function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); done(false); } e.stopPropagation(); }
      document.addEventListener('keydown', onKey, true);
      ov.querySelector('[data-x]').addEventListener('click', function () { done(false); });
      ask();
      A.Voice.say(['hub_grownups']);
    });
  };

  /* ---------- yes / no question (e.g. "Delete this player?"). Esc = no. Resolves true / false. ---------- */
  // o: {title, sub, art, yes, no, danger}
  UI.confirm = function (o) {
    return new Promise(function (resolve) {
      var ov = A.el('<div class="overlay on confirm' + (o.cls ? ' ' + o.cls : '') + '" role="alertdialog" aria-modal="true"><div class="card">' + (o.art ? '<div class="art">' + o.art + '</div>' : '') +
        '<h2>' + A.esc(o.title) + '</h2>' + (o.sub ? '<p>' + A.esc(o.sub) + '</p>' : '') +
        '<div class="row2"><button class="bigbtn ' + (o.danger ? 'danger' : 'mint') + '" data-yes>' + A.esc(o.yes || 'Yes') + '</button><button class="bigbtn plain" data-no>' + A.esc(o.no || 'No') + '</button></div>' +
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
  };
})(window.Arcade);
