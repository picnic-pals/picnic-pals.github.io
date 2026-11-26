/* Picnic Pals Set B presentation kit: shared layout, Home, intro, question reveal, celebration, and forgiving tap/drag.
   Locked Avatar art lives in art/ui/. Swap points are CSS variables and those files (see _plans/pass1-kit.md). */
(function (A) {
  'use strict';
  var REDUCED = false;
  try { REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) {}

  var HOME_SEL = '#homeBtn, .homebtn, #fxHome, #ffHome, #pkHome, #pcHome, #srHome, #bsHome, #gdHome';
  var TITLE_SEL = 'h1[data-title], [data-title], .mlogo b, .ff-header h1, .pc-header h1, .fx-header h1, .pk-header h1, .sr-header h1, .bs-header h1, .gd-header h1';
  var TAP_SLOP = 28;
  var INTRO_MS = 1100;
  var REVEAL_MS = 550;
  var CONFETTI = ['curl_blue', 'curl_mint', 'curl_red', 'dot_butter', 'dot_grape', 'gingham_square', 'gingham_triangle', 'petal_frosting', 'strip_orange'];
  var SPARKLES = ['butter4', 'cream4', 'plus', 'star5'];

  function reduced() { return REDUCED; }
  function stageRoot() {
    return (A.Stage && A.Stage.root && A.Stage.root()) || document.querySelector('[data-stage-root]') || document.body;
  }
  function asset(path) {
    var root = (A.ROOT != null && A.ROOT !== '') ? A.ROOT : '';
    return root + path;
  }

  /* ---------- layout helper (CSS classes; does not wrap existing games automatically) ---------- */
  function layoutHTML(opt) {
    opt = opt || {};
    var title = opt.title ? '<h1 class="pp-kit-title">' + (A.esc ? A.esc(opt.title) : String(opt.title)) + '</h1>' : '';
    var card = opt.card ? '<div class="pp-kit-card" data-pp-kit-q="1">' + opt.card + '</div>' : '<div class="pp-kit-card" data-pp-kit-q="1"></div>';
    var scene = opt.scene || '';
    var tray = opt.tray || '';
    return '<div class="pp-kit-shell">' +
      '<div class="pp-kit-bar">' + homeHTML(opt.home) + title + '</div>' +
      '<div class="pp-kit-scene">' + scene + '</div>' +
      card +
      '<div class="pp-kit-tray">' + tray + '</div>' +
      '</div>';
  }
  function mountLayout(root, opt) {
    if (!root) return null;
    root.innerHTML = layoutHTML(opt);
    var shell = root.querySelector('.pp-kit-shell');
    var home = root.querySelector('.pp-kit-home');
    if (home && opt && typeof opt.goHome === 'function') {
      if (A.UI && A.UI.bindHome) A.UI.bindHome(home, opt.goHome);
      else onPointer(home, opt.goHome);
    }
    return {
      shell: shell,
      scene: root.querySelector('.pp-kit-scene'),
      tray: root.querySelector('.pp-kit-tray'),
      card: root.querySelector('.pp-kit-card'),
      title: root.querySelector('.pp-kit-title'),
      home: home
    };
  }

  /* ---------- Home button ---------- */
  function homeHTML(opt) {
    opt = opt || {};
    var id = opt.id ? ' id="' + String(opt.id).replace(/"/g, '') + '"' : '';
    var cls = 'pp-kit-home' + (opt.cls ? ' ' + opt.cls : '');
    return '<button type="button" class="' + cls + '"' + id + ' aria-label="Home"><span class="pp-kit-home-art" aria-hidden="true"></span></button>';
  }
  function adoptHome(el) {
    if (!el || el.getAttribute('data-pp-kit-home') === '1') return el;
    el.setAttribute('data-pp-kit-home', '1');
    el.classList.add('pp-kit-home');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', 'Home');
    el.setAttribute('type', el.getAttribute('type') || 'button');
    var art = el.querySelector('.pp-kit-home-art');
    if (!art) {
      art = document.createElement('span');
      art.className = 'pp-kit-home-art';
      art.setAttribute('aria-hidden', 'true');
      el.insertBefore(art, el.firstChild);
    }
    return el;
  }
  function adoptHomes(root) {
    root = root || document;
    var nodes = root.querySelectorAll(HOME_SEL);
    for (var i = 0; i < nodes.length; i++) adoptHome(nodes[i]);
    return nodes.length;
  }

  /* ---------- titles ---------- */
  function isPortrait() {
    var root = document.documentElement;
    var stage = root && root.getAttribute('data-stage');
    if (stage === 'portrait') return true;
    if (stage === 'landscape') return false;
    try { return window.innerWidth <= window.innerHeight; } catch (e) { return false; }
  }
  function stackTitles(root) {
    root = root || document;
    var portrait = isPortrait();
    var titles = root.querySelectorAll ? root.querySelectorAll('.pp-kit-title') : [];
    var i, el, host;
    for (i = 0; i < titles.length; i++) {
      el = titles[i];
      host = (el.closest && el.closest('header, .pc-header, .ff-header, .fx-header, .pk-header, .gd-header, .sr-header, .bs-header, .pp-kit-bar')) || el.parentElement;
      if (!host) continue;
      if (portrait) host.classList.add('pp-kit-stack');
      else host.classList.remove('pp-kit-stack');
    }
  }
  function adoptTitles(root) {
    root = root || document;
    var nodes = root.querySelectorAll(TITLE_SEL);
    var n = 0;
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.closest && el.closest('script, style, .overlay, .card')) continue;
      if (el.classList && el.classList.contains('logo')) continue;
      if (el.id === 'ppLogo' || (el.querySelector && el.querySelector('img'))) continue;
      el.classList.add('pp-kit-title');
      n++;
    }
    stackTitles(root);
    return n;
  }

  /* ---------- intro + question reveal ---------- */
  function isAuto() { try { return !!navigator.webdriver; } catch (e) { return false; } }
  function intro(opt) {
    opt = opt || {};
    var hold = opt.ms != null ? opt.ms : INTRO_MS;
    var skip = reduced() || (!opt.force && (/[?&]nointro=1(?:&|$)/.test(location.search || '') || isAuto()));
    if (skip) return Promise.resolve('skip');
    var host = opt.root || stageRoot();
    if (!host) return Promise.resolve('skip');
    var layer = document.createElement('div');
    layer.className = 'pp-kit-intro-layer';
    layer.setAttribute('aria-hidden', 'true');
    var stageH = host.clientHeight || 720;
    layer.style.setProperty('--pp-kit-stage-h', stageH + 'px');
    var basket = document.createElement('div');
    basket.className = 'pp-kit-basket';
    var body = document.createElement('img');
    body.className = 'pp-kit-basket-body';
    body.src = asset('art/ui/basket-body.webp');
    body.alt = '';
    var lid = document.createElement('img');
    lid.className = 'pp-kit-basket-lid';
    lid.src = asset('art/ui/basket-lid.webp');
    lid.alt = '';
    basket.appendChild(body);
    basket.appendChild(lid);
    layer.appendChild(basket);
    host.appendChild(layer);
    if (hold >= 500 && !reduced()) {
      setTimeout(function () {
        if (!layer.parentNode) return;
        addSparkles(layer, { count: 4, around: basket });
      }, 500);
    }
    return new Promise(function (resolve) {
      var done = function () {
        if (layer.parentNode) layer.parentNode.removeChild(layer);
        resolve('ok');
      };
      setTimeout(done, Math.min(Math.max(hold, 0), 2000));
    });
  }
  function reveal(el, opt) {
    if (!el) return el;
    opt = opt || {};
    if (reduced()) return el;
    el.classList.remove('pp-kit-reveal');
    var old = el.querySelector('.pp-kit-reveal-bow');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var cs = window.getComputedStyle ? window.getComputedStyle(el) : null;
    if (cs && cs.position === 'static') el.style.position = 'relative';
    var bow = document.createElement('img');
    bow.className = 'pp-kit-reveal-bow';
    bow.src = asset('art/ui/reveal-bow.webp');
    bow.alt = '';
    bow.setAttribute('aria-hidden', 'true');
    el.appendChild(bow);
    void el.offsetWidth;
    el.classList.add('pp-kit-reveal');
    var ms = opt.ms != null ? opt.ms : REVEAL_MS;
    setTimeout(function () {
      el.classList.remove('pp-kit-reveal');
      if (bow.parentNode) bow.parentNode.removeChild(bow);
    }, Math.min(ms, 1200) + 50);
    return el;
  }

  /* ---------- celebration ---------- */
  function celebrate(opt) {
    opt = opt || {};
    var sound = opt.sfx;
    if (sound !== false && A.Audio && A.Audio.sfx) A.Audio.sfx(typeof sound === 'string' ? sound : 'yay');
    if (reduced()) return;
    var host = opt.root || stageRoot() || document.body;
    var n = opt.count != null ? opt.count : (24 + Math.floor(Math.random() * 17));
    var i, kind, sz, c;
    for (i = 0; i < n; i++) {
      c = document.createElement('img');
      c.className = 'pp-kit-confetti';
      c.alt = '';
      c.setAttribute('aria-hidden', 'true');
      kind = CONFETTI[Math.floor(Math.random() * CONFETTI.length)];
      sz = 24 + Math.floor(Math.random() * 13);
      c.src = asset('art/ui/confetti/' + kind + '-64.webp');
      c.style.left = (Math.random() * 100) + '%';
      c.style.width = sz + 'px';
      c.style.height = sz + 'px';
      c.style.setProperty('--t', (1.2 + Math.random() * 0.6) + 's');
      c.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      c.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px');
      c.style.animationDelay = (Math.random() * 0.4) + 's';
      host.appendChild(c);
      (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 2800); })(c);
    }
    burst(host, opt);
    addSparkles(host, { count: 3 + Math.floor(Math.random() * 3), x: opt.x, y: opt.y });
  }
  function burst(host, opt) {
    opt = opt || {};
    host = host || stageRoot() || document.body;
    if (reduced() || !host) return null;
    var b = document.createElement('img');
    b.className = 'pp-kit-burst';
    b.src = asset('art/ui/burst-ring-256.webp');
    b.alt = '';
    b.setAttribute('aria-hidden', 'true');
    if (opt.x != null) b.style.setProperty('--x', typeof opt.x === 'number' ? opt.x + 'px' : String(opt.x));
    if (opt.y != null) b.style.setProperty('--y', typeof opt.y === 'number' ? opt.y + 'px' : String(opt.y));
    host.appendChild(b);
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 1200);
    return b;
  }
  function addSparkles(host, opt) {
    opt = opt || {};
    host = host || stageRoot();
    if (!host || reduced()) return;
    var count = opt.count != null ? opt.count : 4;
    var i, s, name, box, left, top;
    box = opt.around && opt.around.getBoundingClientRect ? opt.around.getBoundingClientRect() : null;
    var hostBox = host.getBoundingClientRect ? host.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
    for (i = 0; i < count; i++) {
      s = document.createElement('img');
      s.className = 'pp-kit-sparkle';
      name = SPARKLES[i % SPARKLES.length];
      s.src = asset('art/ui/sparkle/' + name + '-64.webp');
      s.alt = '';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--d', (Math.random() * 0.2) + 's');
      if (box) {
        left = (box.left - hostBox.left) + box.width * (0.25 + Math.random() * 0.5);
        top = (box.top - hostBox.top) + box.height * (0.05 + Math.random() * 0.35);
        s.style.left = left + 'px';
        s.style.top = top + 'px';
      } else if (opt.x != null && opt.y != null) {
        s.style.left = (typeof opt.x === 'number' ? opt.x + (Math.random() * 80 - 40) : opt.x);
        s.style.top = (typeof opt.y === 'number' ? opt.y + (Math.random() * 80 - 40) : opt.y);
        if (typeof opt.x === 'number') s.style.left = parseFloat(s.style.left) + 'px';
        if (typeof opt.y === 'number') s.style.top = parseFloat(s.style.top) + 'px';
      } else {
        s.style.left = (20 + Math.random() * 60) + '%';
        s.style.top = (20 + Math.random() * 50) + '%';
      }
      host.appendChild(s);
      (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 900); })(s);
    }
  }

  /* ---------- forgiving tap / drag ---------- */
  function tapSlop() { return TAP_SLOP; }
  function nearest(x, y, targets) {
    var best = null, bestD = Infinity, i, t, d, r;
    if (!targets || !targets.length) return null;
    for (i = 0; i < targets.length; i++) {
      t = targets[i];
      d = Math.hypot(x - t.x, y - t.y);
      r = (t.r != null ? t.r : TAP_SLOP);
      if (d <= r && d < bestD) { best = t; bestD = d; }
    }
    return best;
  }
  function padHit(el, pad) {
    if (!el) return el;
    pad = pad == null ? 12 : pad;
    el.classList.add('pp-kit-hit');
    el.style.setProperty('--pp-kit-hit-pad', pad + 'px');
    return el;
  }
  function onPointer(el, fn, opt) {
    opt = opt || {};
    if (!el || typeof fn !== 'function') return el;
    if (el.getAttribute('data-pp-kit-pointer') === '1') return el;
    el.setAttribute('data-pp-kit-pointer', '1');
    var move = opt.move || 16, armed = null, last = 0;
    function go(e) {
      var now = Date.now();
      if (now - last < 160) return;
      last = now;
      fn.call(el, e);
    }
    el.addEventListener('pointerdown', function (e) {
      if (e.isPrimary === false) return;
      if (e.button != null && e.button !== 0) return;
      armed = { id: e.pointerId, x: e.clientX, y: e.clientY };
    });
    el.addEventListener('pointerup', function (e) {
      if (!armed || armed.id !== e.pointerId) return;
      var moved = Math.abs(e.clientX - armed.x) + Math.abs(e.clientY - armed.y) > move;
      armed = null;
      if (moved) return;
      go(e);
    });
    el.addEventListener('pointercancel', function () { armed = null; });
    el.addEventListener('click', function (e) {
      if (Date.now() - last < 500) { e.preventDefault(); e.stopPropagation(); return; }
      go(e);
    });
    try { if (!el.style.touchAction) el.style.touchAction = 'manipulation'; } catch (err) {}
    return el;
  }
  function onDrag(el, opt) {
    opt = opt || {};
    if (!el) return el;
    var start = null, dragging = false, slop = opt.slop != null ? opt.slop : 8;
    function point(e) { return { x: e.clientX, y: e.clientY }; }
    el.addEventListener('pointerdown', function (e) {
      if (e.isPrimary === false) return;
      if (e.button != null && e.button !== 0) return;
      start = point(e); dragging = false;
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
      if (opt.onStart) opt.onStart(e, start);
    });
    el.addEventListener('pointermove', function (e) {
      if (!start) return;
      var p = point(e);
      if (!dragging && Math.hypot(p.x - start.x, p.y - start.y) > slop) dragging = true;
      if (dragging && opt.onMove) opt.onMove(e, p, start);
    });
    function end(e) {
      if (!start) return;
      var p = point(e), was = dragging;
      start = null; dragging = false;
      if (was && opt.onEnd) opt.onEnd(e, p);
      else if (!was && opt.onTap) opt.onTap(e, p);
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', function (e) { start = null; dragging = false; if (opt.onCancel) opt.onCancel(e); });
    try { if (!el.style.touchAction) el.style.touchAction = 'none'; } catch (err) {}
    return el;
  }

  function boot() {
    adoptHomes();
    adoptTitles();
    intro();
    try {
      window.addEventListener('resize', function () { stackTitles(); });
      window.addEventListener('orientationchange', function () { setTimeout(stackTitles, 80); });
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  A.Kit = {
    version: 'setB-1125',
    TAP_SLOP: TAP_SLOP,
    INTRO_MS: INTRO_MS,
    REVEAL_MS: REVEAL_MS,
    reduced: reduced,
    asset: asset,
    layoutHTML: layoutHTML,
    mountLayout: mountLayout,
    homeHTML: homeHTML,
    adoptHome: adoptHome,
    adoptHomes: adoptHomes,
    adoptTitles: adoptTitles,
    intro: intro,
    reveal: reveal,
    celebrate: celebrate,
    burst: burst,
    tapSlop: tapSlop,
    nearest: nearest,
    padHit: padHit,
    onPointer: onPointer,
    onDrag: onDrag
  };
})(window.Arcade = window.Arcade || {});
