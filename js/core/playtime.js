/* Picnic Pals — grown-up play-time limit and stretch-break reminder.
   Per player, per day, kept ONLY on this device (its own localStorage key: never in saves, save codes or exports).
   Time counts while a player is picked and the page is visible. The "Great stopping point!" screen only appears at a
   checkpoint (the hub, or a game's end-of-round screen), so a child is never cut off mid-question and keeps every reward.
   Only a grown-up (behind the gate) can add more time. */
(function (A) {
  'use strict';
  var KEY = 'picnicpals-playtime', TICK = 5000, BREAK_MS = 20 * 60000;
  var LIMITS = [0, 15, 20, 30, 45];
  function load() { var d; try { d = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { d = {}; } d.limits = d.limits || {}; if (d.day !== A.today()) { d.day = A.today(); d.kids = {}; } d.kids = d.kids || {}; return d; }
  function store(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function kid(d, id) { return d.kids[id] || (d.kids[id] = { ms: 0, extra: 0, brk: 0 }); }
  var PT = A.PlayTime = {
    LIMITS: LIMITS, BREAK_MS: BREAK_MS,
    limit: function (id) { return +load().limits[id] || 0; },
    setLimit: function (id, m) { var d = load(); if (+m) d.limits[id] = +m; else delete d.limits[id]; store(d); },
    used: function (id) { return kid(load(), id).ms; },
    extra: function (id) { return kid(load(), id).extra; },
    addTime: function (id, min) { var d = load(), k = kid(d, id); k.extra += min; store(d); },
    left: function (id) { var L = PT.limit(id); if (!L) return Infinity; var d = load(), k = kid(d, id); return (L + k.extra) * 60000 - k.ms; },
    isUp: function (id) { return PT.left(id) <= 0; },
    breakDue: function (id) { if (!A.Store.settings.breakReminder) return false; var k = kid(load(), id); return k.ms - k.brk >= BREAK_MS; },
    _set: function (id, ms) { var d = load(), k = kid(d, id); k.ms = ms; if (k.brk > ms) k.brk = 0; store(d); },   // tests
    showing: function () { return !!document.querySelector('#ptStop, #ptBreak'); }
  };
  function tick() {
    var p = A.Store && A.Store.active && A.Store.active(); if (!p || document.hidden) return;
    var d = load(), k = kid(d, p.id); k.ms += TICK; store(d);
  }
  setInterval(tick, TICK);

  function art(p, expr) { return A.Blobs ? A.Blobs.forProfile(p, { expr: expr }) : ''; }
  // the gentle stop screen; resolves when a grown-up adds time (true). "Home" leaves to the player picker.
  function stopScreen(p, opts) {
    return new Promise(function (resolve) {
      if (A.$('#ptStop')) return;
      A.Voice.stop();
      var ov = A.el('<div class="overlay on ptcard" id="ptStop" role="dialog" aria-modal="true" aria-label="Great stopping point"><div class="card">' +
        '<div class="art ptart">' + art(p, 'sleepy') + '</div><h2>Great stopping point!</h2><p>You played so well today. ' + A.esc(p.name) + ', it’s time to rest. Your stars and prizes are all saved.</p>' +
        '<div class="row2"><button class="bigbtn mint" data-home>🏠 All done</button></div>' +
        '<div class="row2"><button class="pill dellink" data-more>Grown-ups: add more time</button></div></div></div>');
      document.body.appendChild(ov); A.UI.cardOpen = true;
      function onKey(e) { e.stopPropagation(); if (e.key === 'Enter' && document.activeElement && document.activeElement.click) { e.preventDefault(); document.activeElement.click(); } }
      document.addEventListener('keydown', onKey, true);
      function close() { document.removeEventListener('keydown', onKey, true); ov.remove(); A.UI.cardOpen = !!document.querySelector('.overlay.on'); }
      ov.querySelector('[data-home]').addEventListener('click', function () { A.Audio.sfx('tap'); A.Voice.say([{ id: 'pt_bye', text: 'Bye bye! See you next time!' }]); setTimeout(function () { if (opts && opts.home) opts.home(); else location.href = A.ROOT + 'index.html#players'; }, 900); });
      ov.querySelector('[data-more]').addEventListener('click', function () {
        A.UI.gate().then(function (ok) {
          if (!ok) return;
          var box = ov.querySelector('.card'); box.innerHTML = '<h2 style="font-size:32px">Add play time for ' + A.esc(p.name) + '</h2><p>Today only. The daily limit stays the same tomorrow.</p><div class="row2 ptadd">' +
            [10, 15, 30].map(function (m) { return '<button class="bigbtn mint" data-add="' + m + '">+' + m + ' minutes</button>'; }).join('') + '</div><div class="row2"><button class="pill" data-cancel>Cancel</button></div>';
          A.$$('[data-add]', box).forEach(function (b) { b.addEventListener('click', function () { PT.addTime(p.id, +b.dataset.add); close(); A.UI.toast('+' + b.dataset.add + ' minutes for ' + p.name); resolve(true); }); });
          box.querySelector('[data-cancel]').addEventListener('click', function () { close(); stopScreen(p, opts).then(resolve); });
          var f = box.querySelector('[data-add]'); if (f) f.focus();
        });
      });
      setTimeout(function () { var f = ov.querySelector('[data-home]'); if (f) f.focus({ preventScroll: true }); }, 40);
      A.Voice.say([{ id: 'pt_stop', text: 'Great stopping point! You played so well today. Time to rest.' }]);
    });
  }
  function breakScreen(p) {
    return new Promise(function (resolve) {
      var d = load(); kid(d, p.id).brk = kid(d, p.id).ms; store(d);
      var ov = A.el('<div class="overlay on ptcard" id="ptBreak" role="dialog" aria-modal="true" aria-label="Time for a stretch"><div class="card">' +
        '<div class="art ptart stretch">' + art(p, 'cheer') + '</div><h2>Time for a stretch!</h2><p>Reach up high, wiggle your fingers, and take a big breath.</p>' +
        '<div class="row2"><button class="bigbtn mint" data-ok>✓ All stretched!</button></div></div></div>');
      document.body.appendChild(ov); A.UI.cardOpen = true;
      function onKey(e) { e.stopPropagation(); if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') { e.preventDefault(); done(); } }
      function done() { document.removeEventListener('keydown', onKey, true); ov.remove(); A.UI.cardOpen = !!document.querySelector('.overlay.on'); A.Audio.sfx('pop'); resolve(false); }
      document.addEventListener('keydown', onKey, true);
      ov.querySelector('[data-ok]').addEventListener('click', done);
      setTimeout(function () { var f = ov.querySelector('[data-ok]'); if (f) f.focus({ preventScroll: true }); }, 40);
      A.Voice.say([{ id: 'pt_stretch', text: 'Time for a stretch! Reach up high, wiggle your fingers, and take a big breath.' }]);
    });
  }
  /* Call ONLY between rounds (hub, end-of-round screens). Resolves true if play may go on, false if it stopped. */
  PT.checkpoint = function (opts) {
    var p = A.Store.active(); if (!p || p.guest || PT.showing()) return Promise.resolve(!PT.showing());
    if (PT.isUp(p.id)) return stopScreen(p, opts);
    if (PT.breakDue(p.id)) return breakScreen(p).then(function () { return true; });
    return Promise.resolve(true);
  };
  PT.stopScreen = stopScreen;
})(window.Arcade);
