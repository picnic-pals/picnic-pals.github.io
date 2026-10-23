/* Picnic Pals — "The Picnic Storm" intro picture book (5 pages), shown before the Munch story map.
   A.StoryBook.open(profile, { auto }) -> Promise (resolves when the book closes). A.StoryBook.maybeAuto(profile) opens it once
   per player (p.story.introSeen) the first time story mode is opened; the 📖 Story button on the map replays it.
   Modes: 'read' = Read to me (calm narration clip + each word highlighted as it is read), 'self' = I'll read (no narration;
   tap a word to hear it). Default: I'll read for 1st-grade readers and up, Read to me otherwise (A.StoryBook.isReader).
   Text: simple version for pre-readers / K, rich version for readers. Art: assets/story/intro/intro_0N.webp (web copies of the
   approved static pages, 1280x800); text sits in the art's text-safe box (x140 y858 w1320 h104 of 1600x1000), auto-fitted.
   Keys: ←/→ turn · Space/Enter next · Esc skip (controllers map onto these keys). Swipe on touch. Word timings: pause-anchored,
   letter-weighted estimates made when the clips were generated (/tmp/gen_story_intro.py). */
(function (A) {
  'use strict';
  var PAGES = [{"simple":{"id":"story_intro_1_simple","text":"The sun is out. Jammy and the friends have a big picnic.","sec":3.665,"w":[[0.05,0.28],[0.28,0.51],[0.51,0.7],[0.7,0.93],[1.26,1.59],[1.59,1.82],[1.82,2.06],[2.06,2.48],[2.48,2.76],[2.76,2.9],[2.9,3.14],[3.14,3.51]]},"rich":{"id":"story_intro_1_rich","text":"It was a bright, sunny morning, and Jammy the strawberry had planned the biggest picnic ever.","sec":5.935,"w":[[0.06,0.23],[0.23,0.43],[0.43,0.56],[0.56,0.89],[1.08,1.46],[1.46,1.96],[2.42,2.66],[2.66,2.99],[2.99,3.22],[3.22,3.79],[3.79,4.03],[4.03,4.45],[4.45,4.69],[4.69,5.12],[5.12,5.5],[5.5,5.78]]}},{"simple":{"id":"story_intro_2_simple","text":"We eat and we play. It is so fun!","sec":2.416,"w":[[0.06,0.24],[0.24,0.46],[0.46,0.68],[0.68,0.86],[0.86,1.13],[1.35,1.57],[1.57,1.78],[1.78,2.0],[2.0,2.27]]},"rich":{"id":"story_intro_2_rich","text":"The food friends munched, giggled, and played games on the checkered blanket. Niblet told a corny joke, and Bloop bounced with delight.","sec":9.049,"w":[[0.05,0.34],[0.34,0.69],[0.69,1.21],[1.21,1.74],[1.74,2.26],[2.26,2.55],[2.55,3.02],[3.02,3.42],[3.42,3.66],[3.66,3.95],[3.95,4.59],[4.59,5.11],[5.11,5.58],[5.58,5.93],[5.93,6.1],[6.1,6.51],[6.51,6.86],[6.86,7.15],[7.15,7.55],[7.55,8.08],[8.08,8.43],[8.43,8.95]]}},{"simple":{"id":"story_intro_3_simple","text":"Oh no! The sun went away. The sky is gray.","sec":3.298,"w":[[0.06,0.31],[0.31,0.56],[0.56,0.87],[0.87,1.18],[1.18,1.55],[1.55,1.93],[1.93,2.24],[2.24,2.55],[2.55,2.8],[2.8,3.17]]},"rich":{"id":"story_intro_3_rich","text":"Then the sky turned gloomy and gray. A big whoosh tugged at hats and napkins.","sec":5.337,"w":[[0.06,0.36],[0.36,0.61],[0.61,0.86],[0.86,1.25],[1.25,1.65],[1.65,1.9],[1.9,2.2],[2.76,2.92],[2.92,3.17],[3.17,3.59],[3.59,4.0],[4.0,4.21],[4.21,4.52],[4.52,4.78],[4.78,5.24]]}},{"simple":{"id":"story_intro_4_simple","text":"Whoosh! Away go the friends and the picnic things!","sec":3.135,"w":[[0.06,0.57],[0.79,1.06],[1.06,1.24],[1.24,1.46],[1.46,1.87],[1.87,2.1],[2.1,2.32],[2.32,2.68],[2.68,3.04]]},"rich":{"id":"story_intro_4_rich","text":"Whoosh! Balloons, books, and the picnic basket swirled into the air, and the friends tumbled away like dandelion fluff.","sec":8.857,"w":[[0.07,0.59],[0.59,1.23],[1.23,1.69],[1.69,2.01],[2.01,2.33],[2.33,2.85],[2.85,3.37],[3.37,3.95],[3.95,4.34],[4.34,4.66],[4.66,4.99],[4.99,5.31],[5.31,5.63],[5.63,6.22],[6.22,6.8],[6.8,7.19],[7.19,7.58],[7.58,8.29],[8.29,8.74]]}},{"simple":{"id":"story_intro_5_simple","text":"\"Come on! We can find them,\" said Jammy. \"Let's go!\"","sec":3.69,"w":[[0.06,0.45],[0.45,0.71],[0.71,0.97],[0.97,1.3],[1.3,1.69],[1.69,2.08],[2.08,2.47],[2.47,2.92],[2.92,3.31],[3.31,3.57]]},"rich":{"id":"story_intro_5_rich","text":"\"Let's go!\" said Jammy. \"We will follow the paths and find every single friend.\"","sec":5.543,"w":[[0.06,0.55],[0.55,0.87],[1.08,1.44],[1.44,1.86],[2.33,2.52],[2.52,2.82],[2.82,3.2],[3.2,3.45],[3.45,3.79],[3.79,4.03],[4.03,4.32],[4.32,4.66],[4.66,5.05],[5.05,5.44]]}}];
  var SAFE = { x: 140, y: 858, w: 1320, h: 104 }, CW = 1600, CH = 1000;
  var FONT_MAX = 58, FONT_MIN = 24;   // px at 1600 wide (the art mock uses ~42px; short simple lines go bigger)
  var ov = null, P = null, page = 0, mode = 'self', ver = 'simple', resolveFn = null, prevCard = false, audio = null, raf = 0, timers = [], narrTok = 0;

  function ageReader(p) { var b = A.Age.band(p); return b === 'g1' || b === 'g2' || b === 'g3'; }
  // reader = reading at 1st grade or higher: a grown-up's reading level first, then the current reading skill, then age
  function isReader(p) {
    if (!p) return false;
    if (A.toddler && A.toddler(p)) return false;
    var g = p.levels && p.levels.reading;
    if (g && g !== 'auto' && g !== 'off') return !(g === 'pk' || g === 'k');
    var C = A.Curriculum;
    if (C && C.track && C.byId) {
      try { var cur = (C.track(p, 'reading') || {}).current, sk = cur && C.byId[cur]; if (sk && sk.grade) return /^[1-9]/.test(String(sk.grade)); } catch (e) {}
    }
    return ageReader(p);
  }
  function textVersion(p) { return isReader(p) ? 'rich' : 'simple'; }
  function defaultMode(p) { return isReader(p) ? 'self' : 'read'; }
  function sd(p) { var s = p.story = p.story || {}; return s; }
  function seen(p) { return !!(p && p.story && p.story.introSeen); }
  function modeFor(p) { var m = sd(p).bookMode; return m === 'read' || m === 'self' ? m : defaultMode(p); }
  function clean(w) { return String(w).toLowerCase().replace(/[^a-z']/g, '').replace(/^'+|'+$/g, ''); }
  // sight words this player knows (coach: answered right on 2+ days) or has mastered (the whole sight skill)
  function knownWords(p) {
    var out = {}, K = A.Coach, C = A.Curriculum;
    ['sight', 'sight2', 'sight3'].forEach(function (sid) {
      try {
        var st = p.skills && p.skills[sid];
        if (st && st.status === 'mastered' && !st.placed && st.attempts && C && C.byId[sid] && A.EarlyWords && sid === 'sight') (A.EarlyWords.SIGHT_LEVELS || []).forEach(function (L) { L.forEach(function (w) { out[w.toLowerCase()] = 1; }); });
        var it = K && p.coach && p.coach.items && p.coach.items[sid];
        if (it) Object.keys(it).forEach(function (k) { var r = it[k]; if (r && (r.d || []).length >= 2 && r.c >= 2) out[String(k).toLowerCase()] = 1; });
      } catch (e) {}
    });
    return out;
  }
  function wordClip(w) { var id = A.SightWords ? A.SightWords.lineId(w) : 'word_' + w; return A.Voice.ttsFor(id) || A.Voice.fileFor(id) ? id : null; }
  function speakWord(w) {
    var c = clean(w); if (!c) return null;
    stopNarr();
    var id = wordClip(c), part = id ? { id: id, text: c } : { id: 'sbw_' + c, text: c };
    var r = { word: c, clip: id };
    A.StoryBook.lastWord = r;
    // tapping is the kid asking, so it plays even when the narration mode is off; Web Speech when there is no clip
    if (id) A.Voice.say([part], { kind: 'tap', bubble: false }); else if (!A.Talk || A.Talk.allows('tap')) speakNow(c);
    return r;
  }
  function speakNow(t) {
    A.Voice.stop();
    try { if (window.speechSynthesis) { var u = new SpeechSynthesisUtterance(t); u.rate = .85; u.lang = 'en-US'; speechSynthesis.speak(u); } } catch (e) {}
  }

  function build() {
    ov = A.el('<div class="sbk" id="storybook" role="dialog" aria-modal="true" aria-label="The Picnic Storm, a picture book">' +
      '<div class="sbk-top"><div class="sbk-mode" role="group" aria-label="Reading mode"><button class="sbk-mb" data-mode="read" aria-pressed="false">🔊 Read to me</button><button class="sbk-mb" data-mode="self" aria-pressed="false">📖 I\'ll read</button></div>' +
      '<button class="sbk-skip" id="sbkSkip" aria-label="Skip the story (Esc)">Skip ⏭</button></div>' +
      '<div class="sbk-stage" id="sbkStage"><img class="sbk-img" id="sbkImg" alt="" draggable="false"><div class="sbk-txt" id="sbkTxt" aria-live="polite"></div>' +
      '<button class="sbk-arrow prev" id="sbkPrev" aria-label="Previous page (left arrow)">◀</button><button class="sbk-arrow next" id="sbkNext" aria-label="Next page (right arrow)">▶</button></div>' +
      '<div class="sbk-dots" id="sbkDots"></div></div>');
    document.body.appendChild(ov);
    for (var i = 0; i < PAGES.length; i++) { var d = A.el('<button class="sbk-dot" data-p="' + i + '" aria-label="Page ' + (i + 1) + '"></button>'); ov.querySelector('#sbkDots').appendChild(d); }
    ov.querySelector('#sbkDots').addEventListener('click', function (e) { var b = e.target.closest('.sbk-dot'); if (b) go(+b.dataset.p); });
    ov.querySelector('#sbkPrev').addEventListener('click', function () { go(page - 1); });
    ov.querySelector('#sbkNext').addEventListener('click', next);
    ov.querySelector('#sbkSkip').addEventListener('click', function () { close('skip'); });
    A.$$('.sbk-mb', ov).forEach(function (b) { b.addEventListener('click', function () { setMode(b.dataset.mode, true); }); });
    ov.querySelector('#sbkTxt').addEventListener('click', function (e) { var w = e.target.closest('.w'); if (w) { tapWord(w); } });
    // swipe
    var st = ov.querySelector('#sbkStage'), x0 = null, y0 = 0;
    st.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; });
    st.addEventListener('pointerup', function (e) { if (x0 == null) return; var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) { if (dx < 0) next(); else go(page - 1); } });
    st.addEventListener('pointercancel', function () { x0 = null; });
    window.addEventListener('resize', function () { if (isOpen()) layout(); });
    document.addEventListener('keydown', onKey, true);
  }
  function tapWord(el) {
    A.$$('.w.tap', ov).forEach(function (x) { x.classList.remove('tap'); }); el.classList.add('tap');
    setTimeout(function () { el.classList.remove('tap'); }, 700);
    return speakWord(el.textContent);
  }
  function onKey(e) {
    if (!isOpen()) return;
    var k = e.key, used = true;
    if (k === 'ArrowRight' || k === 'd' || k === 'D' || k === ' ' || k === 'Enter' || k === 'f' || k === 'F') { if (!e.repeat) next(); else turnDropped++; }
    else if (k === 'ArrowLeft' || k === 'a' || k === 'A') go(page - 1);
    else if (k === 'Escape' || k === 'Backspace') { if (!e.repeat) close('skip'); }   // Skip book stays, but a held key never skips
    else if (k === 'ArrowUp' || k === 'ArrowDown' || k === 'h' || k === 'H' || k === 'm' || k === 'M' || k === 'w' || k === 'W' || k === 's' || k === 'S') { /* swallow so the map underneath does not move */ }
    else used = false;
    if (used) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); }
  }
  function isOpen() { return !!ov && ov.classList.contains('on'); }
  function setMode(m, user) {
    mode = m === 'read' ? 'read' : 'self';
    if (user && P) { sd(P).bookMode = mode; try { A.Store.save(); } catch (e) {} }
    ov.classList.toggle('reading', mode === 'read');
    A.$$('.sbk-mb', ov).forEach(function (b) { var on = b.dataset.mode === mode; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    stopNarr(); if (mode === 'read') narrate(); else A.Voice.stop();
    if (ov.classList.contains('on')) { var pc = PAGES[page][ver]; lockTurn(mode === 'read' ? Math.min(A.Pace.CFG.BOOK_READ_MAX, Math.max(A.Pace.CFG.BOOK_SELF, (pc.sec || 0) * 1000 * A.Pace.CFG.BOOK_READ)) * A.Pace.scale : user ? 0 : A.Pace.ms('BOOK_SELF')); }
  }
  // fit the text inside the art's text-safe box (scaled to the stage), biggest font that fits
  function layout() {
    var st = ov.querySelector('#sbkStage'), top = ov.querySelector('.sbk-top'), dots = ov.querySelector('#sbkDots');
    var vw = window.innerWidth, vh = window.innerHeight, avH = vh - top.offsetHeight - dots.offsetHeight - 28, avW = vw - 16;
    var w = Math.min(avW, avH * CW / CH), h = w * CH / CW; st.style.width = Math.round(w) + 'px'; st.style.height = Math.round(h) + 'px';
    var s = w / CW, tx = ov.querySelector('#sbkTxt');
    tx.style.left = (SAFE.x * s) + 'px'; tx.style.top = (SAFE.y * s) + 'px'; tx.style.width = (SAFE.w * s) + 'px'; tx.style.height = (SAFE.h * s) + 'px';
    tx.style.padding = '0 ' + Math.round(14 * s) + 'px';
    var f = FONT_MAX;
    var ln = tx.querySelector('.sbk-line'), pad = 2 * Math.round(14 * s);
    for (; f >= FONT_MIN; f -= 1) { tx.style.fontSize = (f * s) + 'px'; if (ln.offsetHeight <= tx.clientHeight - 2 && ln.scrollWidth <= tx.clientWidth - pad + 1) break; }
    ov.dataset.font = f;
  }
  function render() {
    var pg = PAGES[page][ver], tx = ov.querySelector('#sbkTxt'), known = knownWords(P);
    ov.querySelector('#sbkImg').src = A.ROOT + 'assets/story/intro/intro_0' + (page + 1) + '.webp';
    ov.querySelector('#sbkImg').alt = 'Picture ' + (page + 1) + ' of ' + PAGES.length;
    tx.innerHTML = '<span class="sbk-line">' + pg.text.split(' ').map(function (w, i) { return '<span class="w' + (known[clean(w)] ? ' known' : '') + '" data-i="' + i + '" role="button" tabindex="-1">' + A.esc(w) + '</span>'; }).join(' ') + '</span>';
    A.$$('.sbk-dot', ov).forEach(function (d, i) { d.classList.toggle('on', i === page); d.setAttribute('aria-current', i === page ? 'page' : 'false'); });
    ov.querySelector('#sbkPrev').classList.toggle('off', page === 0);
    var nb = ov.querySelector('#sbkNext'); nb.classList.toggle('last', page === PAGES.length - 1); nb.classList.remove('pulse');
    nb.innerHTML = page === PAGES.length - 1 ? "Let's go! ▶" : '▶'; nb.setAttribute('aria-label', page === PAGES.length - 1 ? "Let's go! Close the story" : 'Next page (right arrow)');
    ov.dataset.page = page + 1;
    layout();
    stopNarr(); if (mode === 'read') narrate();
    var pc = PAGES[page][ver]; lockTurn(mode === 'read' ? Math.min(A.Pace.CFG.BOOK_READ_MAX, Math.max(A.Pace.CFG.BOOK_SELF, (pc.sec || 0) * 1000 * A.Pace.CFG.BOOK_READ)) * A.Pace.scale : A.Pace.ms('BOOK_SELF'));
  }
  function go(i) { if (!isOpen() || i < 0 || i >= PAGES.length || i === page) return; page = i; A.Audio.sfx('step'); render(); }
  /* the beat (js/core/pace.js): a page turn waits ~1.5 s in "I'll read", and until most of the narration has played in "Read to me".
     Presses before that are dropped (never queued). Going back a page, the dots and Skip are not locked. */
  var turnAt = 0, turnDropped = 0, nextLock = null;
  function lockTurn(ms) {
    var nb = ov.querySelector('#sbkNext'); if (nextLock) clearTimeout(nextLock.timer);
    nextLock = A.Pace.lock(nb, ms, 'book'); turnAt = Date.now() + ms;
  }
  function turnReady() { return Date.now() >= turnAt; }
  function next() { if (!isOpen()) return; if (!turnReady()) { turnDropped++; return; } if (page >= PAGES.length - 1) close('done'); else go(page + 1); }

  /* ---- narration + word highlight (Read to me only) ---- */
  function hl(i) { A.$$('.w', ov).forEach(function (w) { var n = +w.dataset.i; w.classList.toggle('hl', n === i); w.classList.toggle('read', n < i); }); ov.dataset.word = i; }
  function stopNarr() {
    narrTok++; cancelAnimationFrame(raf); timers.forEach(clearTimeout); timers = [];
    if (audio) { try { audio.pause(); } catch (e) {} audio = null; }
    if (ov) { A.$$('.w', ov).forEach(function (w) { w.classList.remove('hl', 'read'); }); ov.dataset.word = -1; }
  }
  function doneNarr() { if (turnAt > Date.now()) { turnAt = Date.now(); if (nextLock) { clearTimeout(nextLock.timer); var b = ov.querySelector('#sbkNext'); b.classList.remove('pace-wait'); b.classList.add('pace-ready'); b.removeAttribute('aria-disabled'); } } hl(-1); A.$$('.w', ov).forEach(function (w) { w.classList.remove('read'); }); var nb = ov.querySelector('#sbkNext'); nb.classList.add('pulse'); A.StoryBook.narrations++; }
  function narrate() {
    var pg = PAGES[page][ver], tok = ++narrTok, W = pg.w;
    A.StoryBook.lastNarration = pg.id;
    var silent = (A.Store.settings && A.Store.settings.voice === false) || (A.Talk && A.Talk.mode() === 'off');   // "How much talking: Off" = no voice
    var f = !silent && A.Voice.ttsFor(pg.id), url = f ? A.Voice.ttsUrl(f) : null;
    function follow(tnow) { var i = -1; for (var k = 0; k < W.length; k++) if (tnow >= W[k][0] - .02) i = k; hl(i); }
    function byClock(scale) {   // no clip (or voice off): the same timings on a clock
      var t0 = performance.now();
      (function tick() { if (tok !== narrTok) return; var t = (performance.now() - t0) / 1000 / scale; if (t >= pg.sec) { doneNarr(); return; } follow(t); raf = requestAnimationFrame(tick); })();
    }
    A.Voice.stop();
    if (url) {
      var a = audio = new Audio(url); a.volume = 1;
      var started = false;
      a.onended = function () { if (tok === narrTok) { audio = null; doneNarr(); } };
      a.onerror = function () { if (tok === narrTok && !started) { audio = null; speech(); } };
      var p = a.play(); if (p && p.catch) p.catch(function () { if (tok === narrTok && !started) { audio = null; speech(); } });
      (function tick() { if (tok !== narrTok || !audio) return; if (!a.paused && a.currentTime > 0) started = true; follow(a.currentTime); raf = requestAnimationFrame(tick); })();
    } else if (!silent) speech(); else byClock(1);
    function speech() {   // browser voice: word boundaries when the browser gives them, else the clip timings on a clock
      if (!window.speechSynthesis) return byClock(1);
      try {
        var u = new SpeechSynthesisUtterance(pg.text), starts = [], c = 0; u.rate = .85; u.lang = 'en-US';
        pg.text.split(' ').forEach(function (w) { starts.push(c); c += w.length + 1; });
        var gotB = false;
        u.onboundary = function (e) { if (tok !== narrTok || e.name === 'sentence') return; gotB = true; var i = 0; for (var k = 0; k < starts.length; k++) if (e.charIndex >= starts[k]) i = k; hl(i); };
        u.onend = function () { if (tok === narrTok) doneNarr(); };
        speechSynthesis.cancel(); speechSynthesis.speak(u);
        timers.push(setTimeout(function () { if (tok === narrTok && !gotB) { /* no boundary events: estimate */ var t0 = performance.now(); (function tick() { if (tok !== narrTok || gotB) return; var t = (performance.now() - t0) / 1000 * .9; if (t < pg.sec) follow(t); raf = requestAnimationFrame(tick); })(); } }, 400));
      } catch (e) { byClock(1); }
    }
  }

  function open(p, o) {
    o = o || {}; if (!p) return Promise.resolve('none');
    if (!ov) build();
    if (isOpen()) return Promise.resolve('busy');
    P = p; page = o.page || 0; ver = o.version || textVersion(p);
    sd(p).introSeen = sd(p).introSeen || Date.now(); try { A.Store.save(); } catch (e) {}
    prevCard = !!(A.UI && A.UI.cardOpen); if (A.UI) A.UI.cardOpen = true;
    A.Voice.stop();
    ov.classList.add('on'); ov.dataset.auto = o.auto ? '1' : '0'; ov.dataset.version = ver;
    mode = 'self'; render(); setMode(o.mode || modeFor(p), false);
    A.StoryBook.opens++;
    return new Promise(function (res) { resolveFn = res; });
  }
  function close(how) {
    if (!isOpen()) return;
    stopNarr(); A.Voice.stop(); try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
    ov.classList.remove('on'); if (A.UI) A.UI.cardOpen = prevCard || !!document.querySelector('.overlay.on');
    A.Audio.sfx(how === 'done' ? 'pop' : 'tap');
    var f = resolveFn; resolveFn = null; if (f) f(how || 'skip');
  }
  function maybeAuto(p) { if (!p || seen(p)) return null; return open(p, { auto: true }); }

  A.StoryBook = { PAGES: PAGES, SAFE: SAFE, open: open, close: close, maybeAuto: maybeAuto, seen: seen, isOpen: isOpen, isReader: isReader, textVersion: textVersion, defaultMode: defaultMode,
    knownWords: knownWords, speakWord: speakWord, page: function () { return page; }, turnReady: function () { return turnReady(); }, turnLeft: function () { return Math.max(0, turnAt - Date.now()); }, turnDropped: function () { return turnDropped; }, mode: function () { return mode; }, version: function () { return ver; },
    opens: 0, narrations: 0, lastWord: null, lastNarration: null };
})(window.Arcade);
