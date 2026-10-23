/* Picnic Pals — the gentle "beat": how long a screen stays up before it takes its Continue / Next press.
   Little kids mash Space / Enter / A and fly past results, hints and prizes without seeing them. Every
   advance-able screen gets a short minimum display time; presses during it are simply dropped (never
   queued to fire later), key auto-repeat / held keys never advance anything (release, then press again),
   and the Continue button shows the wait: dimmed with a filling bar, then a soft pulse when it's ready.
   No scolding text. Answering a fresh question stays snappy (FRESH_Q only stops a held-over press).
   Grown-up screens, settings, menus, high scores and shop cards are NOT paced.
   All times in ms. Tune here. (Tests can read A.Pace.CFG; nothing else should hard-code these.) */
(function (A) {
  'use strict';
  var CFG = {
    FRESH_Q: 300,         // a brand-new question ignores presses for this long (stops a press from the last screen landing on it)
    RESULT: 1400,         // result / feedback after an answer (a hit, an out, "Yes!")
    HINT: 2500,           // hint / explanation after a mistake: at least this…
    HINT_PER_CHAR: 40,    // …plus this much per character of text…
    HINT_MAX: 5000,       // …up to this
    LEVEL_UP: 2000,       // level up, board complete, mastery, new skill, warm-up result
    UNLOCK: 2800,         // new sticker / friend / outfit / prize: the celebration plays first
    WIN: 2800,            // end-of-game / stop-cleared win screens
    LOSS: 2500,           // "so close" / try-again screens
    INTRO: 700,           // story beats and "ready?" intro cards (short: they are just a doorway)
    BOOK_SELF: 1500,      // storybook page turn in "I'll read"
    BOOK_READ: 0.85,      // storybook page turn in "Read to me": until this share of the narration has played…
    BOOK_READ_MAX: 9000,  // …but never longer than this
    TINY: 1200,           // Tiny Picnic (toddler): only its celebration is paced, and briefly
    TAP_DEBOUNCE: 250     // taps closer together than this on the same button count once
  };
  var Pace = A.Pace = { CFG: CFG, scale: 1, log: [] };
  try { var s = parseFloat(sessionStorage.getItem('blobArcade.paceScale')); if (s >= 0) Pace.scale = s; } catch (e) {}   // test hook only
  /* ms for a kind of beat; text (optional) lengthens hints */
  Pace.ms = function (kind, text) {
    var v = CFG[kind]; if (v == null) v = +kind || 0;
    if (kind === 'HINT' && text) v = Math.min(CFG.HINT_MAX, Math.max(CFG.HINT, 1200 + String(text).replace(/<[^>]+>/g, '').length * CFG.HINT_PER_CHAR));
    return Math.round(v * Pace.scale);
  };
  /* a lock on one screen: L.ready() true once ms have passed. btn (optional) shows the dim → fill → pulse cue. */
  Pace.lock = function (btn, ms, tag) {
    var t0 = Date.now(), L = { t0: t0, ms: ms, tag: tag || '', dropped: 0 };
    L.ready = function () { return Date.now() - t0 >= ms; };
    // a press: true if it may advance now. Key repeat never advances; presses inside the lock are dropped (counted for tests).
    L.press = function (e) {
      if (e && e.repeat) { L.dropped++; return false; }
      if (!L.ready()) { L.dropped++; Pace.log.push({ tag: L.tag, at: Date.now() - t0, dropped: true }); return false; }
      return true;
    };
    if (btn && ms > 0) {
      btn.classList.add('pace-wait'); btn.classList.remove('pace-ready'); btn.style.setProperty('--pace-ms', ms + 'ms'); btn.setAttribute('aria-disabled', 'true');
      L.timer = setTimeout(function () { btn.classList.remove('pace-wait'); btn.classList.add('pace-ready'); btn.removeAttribute('aria-disabled'); }, ms);
    } else if (btn) btn.classList.add('pace-ready');
    Pace.last = L;
    return L;
  };
  /* the beat for a UI.card, from its look (cls) unless the caller says o.pace */
  Pace.forCard = function (o) {
    if (o.pace != null) return typeof o.pace === 'number' ? Math.round(o.pace * Pace.scale) : Pace.ms(o.pace);
    var c = ' ' + (o.cls || '') + ' ';
    if (/ (scores|shopcard|padlost|biocard|confirm) /.test(c)) return 0;                // menus / info: not paced
    if (/ tinydone /.test(c)) return Pace.ms('TINY');
    if (/ (reward|newfriend|friendup) /.test(c)) return Pace.ms('UNLOCK');
    if (/ (skillcard|placement-done) /.test(c)) return Pace.ms('LEVEL_UP');
    if (/ tryagain /.test(c) || / loss /.test(c)) return Pace.ms('LOSS');
    if (/ (celebrate|storyres|bbend) /.test(c)) return Pace.ms('WIN');
    if (/ (storycard|worked-card) /.test(c)) return Pace.ms('INTRO');
    return 0;
  };
})(window.Arcade);
