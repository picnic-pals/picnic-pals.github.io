/* Food Fight v1 — visual table, touch/keyboard buttons, optional device voice. */
(function (A) {
  'use strict';
  A.UI.boot();
  var P = A.Store.active(); if (!P) { location.replace(A.ROOT + 'index.html#players'); return; }
  var F = A.FoodFight, $ = A.$, ART = A.ROOT + 'art/food-fight/', G = F.newMatch(P), example = '', returning = false, firstSpoken = false, saved = false;
  var stats = P.games.foodfight = P.games.foodfight || { matches: 0, best: 0, rules: false, less: false };
  var pose = ['thinking', 'thinking'];
  var advanceT = null, advanceGen = 0, celebrating = false;
  var facedown = false, wildCelebrated = false, pendingLessTip = false, started = false;
  var CORRECT_WAIT = 1500, MISS_WAIT = 2500, TIE_WAIT = 1200, GIANT_WAIT = 1500, PARTY_WAIT = 2000, VOICE_POLL = 200, VOICE_CAP = 2500;
  var METER = F.METER || 5;
  function cancelAdvance() {
    if (advanceT) { clearTimeout(advanceT); advanceT = null; }
    advanceGen++;
  }
  function voiceQuiet() { return !(A.Voice && A.Voice.isSpeaking && A.Voice.isSpeaking()); }
  function afterFeedback(ms, fn) {
    cancelAdvance();
    var gen = advanceGen, waited = 0;
    function tick() {
      advanceT = null;
      if (gen !== advanceGen) return;
      if (!voiceQuiet() && waited < VOICE_CAP) {
        waited += VOICE_POLL;
        advanceT = setTimeout(tick, VOICE_POLL);
        return;
      }
      fn();
    }
    advanceT = setTimeout(tick, ms);
  }
  function goForward() {
    celebrating = false;
    if (G.phase === 'done') results();
    else next();
  }
  function continueTie() {
    if (example || G.phase !== 'tie') return;
    F.tieNext(G);
    pose = ['thinking', 'thinking'];
    render();
    if (!example) reveal();
  }
  function startParty() {
    if (celebrating) return;
    celebrating = true;
    pose[1] = 'cheering';
    var you = $('.ff-you .ff-friend');
    if (you) you.classList.add('ff-dance', 'ff-cheer');
    var meter = $('.ff-meter');
    if (meter) meter.classList.add('ff-meter-party');
    fillMeter(METER);
    A.Audio.sfx('bonus');
    confetti();
  }
  function afterJudged() {
    var r = G.result;
    if (!r) return;
    if (r.party && r.correct) {
      afterFeedback(r.giant ? GIANT_WAIT : 400, function () {
        startParty();
        afterFeedback(PARTY_WAIT, goForward);
      });
      return;
    }
    var ms = r.giant ? GIANT_WAIT : (r.correct ? CORRECT_WAIT : MISS_WAIT);
    if (!r.correct && r.giant) ms = Math.max(MISS_WAIT, GIANT_WAIT);
    afterFeedback(ms, goForward);
  }
  function scheduleAdvance() {
    if (example) return;
    if (G.phase === 'tie' && !G.result) { afterFeedback(TIE_WAIT, continueTie); return; }
    if (!G.result) return;
    if (G.phase !== 'feedback' && G.phase !== 'done') return;
    afterJudged();
  }
  function img(src, cls) { return '<img class="' + (cls || '') + '" src="' + src + '" alt="" draggable="false">'; }
  function pip(suit) { return img(ART + suit + '-pip.png'); }
  function splatArt(filled) {
    return '<svg class="ff-splat-icon" viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3c3 0 4 3 6 4 3 1 6 0 7 3 1 3-1 5 0 8 1 3 3 5 1 8-2 3-5 2-8 3-2 1-3 4-6 4s-4-3-6-4c-3-1-6 0-8-3-2-3 0-5 1-8 1-3-1-5 0-8 1-3 4-2 7-3 2-1 3-4 6-4z"/><ellipse cx="12" cy="11" rx="4" ry="2.8" fill="#fff" opacity=".45"/>' +
      (filled ? '<g fill="#6b2a3a"><circle cx="12.5" cy="15" r="1.25"/><circle cx="19.5" cy="15" r="1.25"/><path d="M13 19c2 2 4 2 6 0" fill="none" stroke="#6b2a3a" stroke-width="1.25" stroke-linecap="round"/></g>' : '') + '</svg>';
  }
  function meterShow() {
    var r = G.result, n = G.splats || 0;
    if (celebrating || (r && r.party && r.correct)) n = METER;
    return n;
  }
  function meter() {
    var n = meterShow(), i, slots = '', r = G.result;
    var add = (r && r.correct && !celebrating && r.splatAdd) ? r.splatAdd : 0;
    for (i = 0; i < METER; i++) {
      var filled = i < n;
      var just = add > 0 && filled && i >= n - add;
      slots += '<span class="ff-slot' + (filled ? ' ff-slot-full' : '') + (just ? ' ff-slot-pop' : '') + '">' + splatArt(filled) + '</span>';
    }
    var bonus = add > 1 ? '<span class="ff-meter-add" aria-hidden="true">+' + add + '</span>' : '';
    return '<div class="ff-meter' + (celebrating ? ' ff-meter-party' : '') + '" role="status" aria-label="' + n + ' of ' + METER + ' splats' + (add > 1 ? ', plus ' + add : '') + '">' + slots + bonus + '</div>';
  }
  function fillMeter(n) {
    var el = $('.ff-meter'), i, slots;
    if (!el) return;
    el.setAttribute('aria-label', n + ' of ' + METER + ' splats');
    slots = el.querySelectorAll('.ff-slot');
    for (i = 0; i < slots.length; i++) {
      slots[i].className = 'ff-slot' + (i < n ? ' ff-slot-full' : '');
      slots[i].innerHTML = splatArt(i < n);
    }
    var lab = el.querySelector('small');
    if (lab) lab.textContent = n + ' of ' + METER;
  }
  // Familiar mirrored playing-card positions; corners show numerals only so kids count center pips.
  /* 1-5: dice / five-frame style. 6-10: one ten-frame (top row of 5, then the rest), never loose scatter. */
  function pipLayout(n) {
    var L = 24, R = 76, M = 50, i, out = [];
    /* Classic playing-card layouts. Numerals stay in the corners only. */
    if (n === 1) return [[M, 50]];
    if (n === 2) return [[M, 22], [M, 78]];
    if (n === 3) return [[M, 22], [M, 50], [M, 78]];
    if (n === 4) return [[L, 22], [R, 22], [L, 78], [R, 78]];
    if (n === 5) return [[L, 22], [R, 22], [M, 50], [L, 78], [R, 78]];
    if (n === 6) return [[L, 20], [R, 20], [L, 50], [R, 50], [L, 80], [R, 80]];
    if (n === 7) return [[L, 18], [R, 18], [L, 50], [M, 50], [R, 50], [L, 82], [R, 82]]; /* 2-3-2, never a crammed 5+2 that looks like 8 */
    if (n === 8) return [[L, 18], [M, 18], [R, 18], [L, 50], [R, 50], [L, 82], [M, 82], [R, 82]];
    if (n === 9) return [[L, 18], [M, 18], [R, 18], [L, 50], [M, 50], [R, 50], [L, 82], [M, 82], [R, 82]];
    if (n === 10) { for (i = 0; i < 10; i++) out.push([14 + (i % 5) * 18, i < 5 ? 28 : 72]); return out; }
    return [[M, 50]];
  }
  var layouts = {}; for (var n = 1; n <= 10; n++) layouts[n] = pipLayout(n);
  function card(c, side, glow, wild) {
    var down = !example && facedown;
    if (down) {
      return '<button class="ff-card ff-back" data-side="' + side + '" disabled aria-label="' + (side ? 'Your' : 'Sunny’s') + ' card, face down">' + img(ART + 'back.png') + '</button>';
    }
    var suit = side ? 'strawberry' : 'lemon', label = c.label || String(c.value), solve = label !== String(c.value);
    var shown = !solve || !!G.result;
    var h = '<button class="ff-card ' + (glow ? 'ff-glow ' : '') + (wild ? 'ff-wild ' : '') + (solve && G.result ? 'ff-solved ' : '') + '" data-side="' + side + '" aria-label="' + (side ? 'Your' : 'Sunny’s') + ' card: ' + (wild ? 'Picnic Basket wild' : A.esc(shown ? String(c.value) : label)) + '"' + (example || G.phase !== 'choose' ? ' disabled' : '') + '>';
    if (wild) return h + img(ART + 'wild.png') + '</button>';
    h += '<span class="ff-corner" aria-hidden="true"><b>' + (shown ? c.value : '?') + '</b></span><span class="ff-corner ff-invert" aria-hidden="true"><b>' + (shown ? c.value : '?') + '</b></span>';
    if (c.value <= 10 && shown) h += '<span class="ff-pips" data-pips="' + c.value + '" aria-hidden="true">' + layouts[c.value].map(function (p) { return '<i style="left:' + p[0] + '%;top:' + p[1] + '%">' + pip(suit) + '</i>'; }).join('') + '</span>';
    if (solve && !G.result) h += '<span class="ff-equation">' + A.esc(label) + '<small>Solve first</small></span>';
    else if (solve && G.result) h += '<span class="ff-number">' + c.value + '</span><span class="ff-equation ff-revealed">' + A.esc(label) + '</span>';
    else if (!solve && c.value > 10) h += '<span class="ff-number">' + c.value + '</span><span class="ff-model" aria-hidden="true">' + A.PV100.blocks3(Math.floor(c.value / 100), Math.floor(c.value % 100 / 10), c.value % 10) + '</span>';
    return h + '</button>';
  }
  function friend(side) {
    var art = side ? (P.blob && A.FoodData.cast.some(function (f) { return f.id === P.blob; }) ? A.Blobs.forProfile(P, { expr: pose[1] === 'cheering' ? 'cheer' : pose[1] === 'oops' ? 'oops' : 'think' }) : img(ART + 'muffin.png')) : img(A.ROOT + 'assets/picnic/friends/lemon/' + pose[0] + '_256.webp');
    var r = G.result, taker = r && (r.taker != null ? r.taker : r.winner);
    var cheer = celebrating && side === 1 || (r && ((r.correct && side === 1) || (r.giant && taker === side)));
    var hit = r && taker != null && taker !== side && taker >= 0 && (r.correct || r.giant);
    var cls = 'ff-friend' + (cheer ? ' ff-cheer' : '') + (celebrating && side === 1 ? ' ff-dance' : '');
    var extra = side ? meter() : '<span class="ff-progress">Flip ' + (example ? '—' : (G.flips || 0)) + ' of 10</span>';
    return '<div class="ff-friend-row ' + (side ? 'ff-you' : 'ff-sunny') + '"><div class="' + cls + '">' + art + (hit ? '<span class="ff-splat' + (r && r.giant ? ' ff-splat-lg' : '') + '" aria-hidden="true"></span>' : '') + '</div><b class="ff-name">' + (side ? 'You' : 'Sunny') + '</b>' + extra + '</div>';
  }
  function say(text, kind) { A.Voice.say([{ text: text }], { kind: kind || 'tap', bubble: false }); }
  function instruction() {
    if (!example && G.result && G.result.message) return G.result.message;
    if (!example && G.phase === 'tie') return "It's a tie! The next flip is for a giant splat.";
    if (!example && G.giant && G.phase === 'choose') return 'Tap who has ' + G.rule + '. This flip is for a giant splat.';
    return example === 'more' ? 'More means a bigger amount. Sunny has 3. You have 5. 5 is more than 3. Tap the card with more.' : example === 'less' ? 'Less means a smaller amount. Sunny has 3. You have 5. 3 is less than 5. Tap the card with less.' : G.phase === 'wild' ? wildSpeech() : 'Tap who has ' + G.rule + '.';
  }
  function wildSpeech() {
    var n = (G.cards && G.cards[0] && G.cards[0].value) || 0;
    return 'A Wild is your pick! Choose a number ' + G.rule + ' than ' + n + '.';
  }
  function wildChoices() {
    var opts = F.wildOptions(G);
    if (G.band && G.band.toddler) {
      opts = opts.filter(function (n) { return G.rule === 'more' ? n > G.cards[0].value : n < G.cards[0].value; });
      if (!opts.length) opts = [G.rule === 'less' ? G.cards[0].value - 1 : G.cards[0].value + 1];
    }
    return opts;
  }
  function wildPopup() {
    if (example || facedown || G.phase !== 'wild') return '';
    var n = G.cards[0].value;
    var line = 'Choose a number that is ' + G.rule.toUpperCase() + ' than ' + n + '. That number goes on your card.';
    var picks = wildChoices().map(function (v) { return '<button type="button" class="ff-pick" data-pick="' + v + '">' + v + '</button>'; }).join('');
    return '<div class="ff-wild-pop" id="ffWildPop" role="dialog" aria-labelledby="ffWildTitle" aria-describedby="wildHint">' +
      '<div class="ff-wild-card">' +
      '<h2 id="ffWildTitle">Wild card!</h2>' +
      '<p id="wildHint">' + line + '</p>' +
      '<div class="ff-picker">' + picks + '</div>' +
      '</div></div>';
  }
  function footer() {
    if (example) return '<div class="ff-footer"><p class="ff-example-line">' + (example === 'more' ? '5 is MORE! More means a bigger amount.' : '3 is LESS! Less means a smaller amount.') + '</p><button class="ff-action" id="' + (example === 'less' ? 'lessStart' : 'ruleStart') + '">Back to play</button></div>';
    if (G.phase === 'tie') return '<div class="ff-footer"><p>The next flip is for a giant splat.</p></div>';
    if (G.phase === 'wild') return '<div class="ff-footer"><p id="wildHintLine">A Wild is your pick.</p></div>';
    if (G.result) return '<div class="ff-footer"><p role="status">' + G.result.message + '</p></div>';
    if (facedown) return '<div class="ff-footer"><p>Here come the cards.</p></div>';
    return '<div class="ff-footer"><p>' + (G.giant ? 'This flip is for a giant splat!' : G.band.toddler ? 'Tap either card. Let’s splat!' : 'Both cards are up. Take your time.') + '</p></div>';
  }
  function bannerText(rule, tie) {
    if (tie) return "It's a tie!";
    if (celebrating) return 'Splat party!';
    if (G.result && G.result.party && G.result.correct) return 'Splat party!';
    if (G.result && G.result.correct && G.result.giant) return 'Giant splat!';
    if (G.result && G.result.correct) return 'Splat!';
    if (!example && facedown) return 'Get ready!';
    if (!example && G.phase === 'wild') return 'Wild card!';
    return 'Tap who has <strong>' + rule.toUpperCase() + '</strong>';
  }
  function render() {
    cancelAdvance();
    if (!G.band.supported) { $('#ffContent').innerHTML = '<div class="ff-results"><h2>A bigger deck is growing!</h2><p>This first deck stops at second-grade math. Your level stays just where it is.</p><button class="ff-action" id="resultsHome">Home</button></div>'; $('#resultsHome').onclick = home; return; }
    var cards = example ? [{ value: 3, suit: 'lemon' }, { value: 5, suit: 'strawberry' }] : G.cards;
    var rule = example || G.rule, tie = !example && G.phase === 'tie';
    var winning = example ? (example === 'less' ? 0 : 1) : G.result ? G.result.winner : -1;
    $('#ffContent').innerHTML = '<div class="ff-table ' + (example ? 'ff-example ' : '') + (rule === 'less' ? 'ff-less' : '') + (G.giant && !G.result ? ' ff-giant-ready' : '') + '">' + friend(0) + '<div class="ff-mat ff-yellow">' + card(cards[0], 0, winning === 0, false) + '</div><div class="ff-banner" role="status">' + bannerText(rule, tie) + '</div><div class="ff-mat ff-pink">' + card(cards[1], 1, winning === 1, !example && !facedown && G.wild && G.phase === 'wild') + '</div>' + friend(1) + footer() + wildPopup() + '</div>';
    function bindTap(el, fn) { if (!el) return; if (A.UI && A.UI.onTap) A.UI.onTap(el, fn); else el.onclick = fn; }
    A.$$('.ff-mat').forEach(function (mat) {
      var cardEl = mat.querySelector('.ff-card'); if (!cardEl) return;
      mat.setAttribute('data-side', cardEl.getAttribute('data-side'));
      bindTap(mat, function () { tap(+cardEl.dataset.side); });
    });
    A.$$('.ff-pick').forEach(function (el) { bindTap(el, function () { pickWild(+el.dataset.pick, el); }); });
    var start = $('#ruleStart') || $('#lessStart'); if (start) bindTap(start, closeExample);
    if (!example && !facedown && G.phase === 'wild') onWildShown();
    scheduleAdvance();
  }
  function pickWild(n, el) {
    if (G.phase !== 'wild') return;
    if (F.wildPick(G, n)) {
      wildCelebrated = false;
      facedown = false;
      render();
      tap(1);
      return;
    }
    var hint = $('#wildHint');
    if (hint) hint.textContent = 'Look for ' + G.rule.toUpperCase() + ' than ' + G.cards[0].value + '.';
    if (el) el.classList.add('ff-try');
    var right = F.wildOptions(G).filter(function (n) { return G.rule === 'more' ? n > G.cards[0].value : n < G.cards[0].value; })[0];
    var good = $('[data-pick="' + right + '"]');
    if (good) good.classList.add('ff-glow');
  }
  function skipMotion() {
    try { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true; } catch (e) {}
    try { if (navigator.webdriver) return true; } catch (e2) {}
    try { if (/[?&]nointro=1(?:&|$)/.test(location.search || '')) return true; } catch (e3) {}
    return false;
  }
  function onWildShown() {
    if (wildCelebrated) return;
    wildCelebrated = true;
    if (A.Kit && A.Kit.celebrate) A.Kit.celebrate({ root: $('.ff-table') || $('#foodfight') || document.body, sfx: 'yay' });
    else { A.Audio.sfx('bonus'); confetti(); }
    say(wildSpeech(), 'prompt');
  }
  function kitRevealCards() {
    if (A.Kit && A.Kit.reveal) {
      A.$$('.ff-card').forEach(function (el) { A.Kit.reveal(el); });
    }
    flipCards();
  }
  function closeExample() {
    if (example === 'more') stats.rules = true; else stats.less = true;
    example = ''; A.Store.save();
    if (returning) { returning = false; render(); } else if (!G.flips) next(); else { render(); speakFirst(); }
  }
  function speakFirst() { if (!firstSpoken) { firstSpoken = true; say(instruction(), 'prompt'); } }
  function flipUp() {
    facedown = false;
    render();
    if (example) return;
    kitRevealCards();
    if (G.phase === 'wild') return; // spoken with the pop-up
    speakFirst();
    if (pendingLessTip && G.rule === 'less') {
      pendingLessTip = false;
      say('Less means a smaller amount. Tap the card with less.', 'prompt');
    }
    if (G.phase === 'tie') say("It's a tie!", 'prompt');
  }
  function next() {
    cancelAdvance();
    celebrating = false;
    wildCelebrated = false;
    pose = ['thinking', 'thinking'];
    F.deal(G);
    if (G.rule === 'less' && !stats.less) { stats.less = true; pendingLessTip = true; A.Store.save(); }
    facedown = true;
    render();
    if (skipMotion()) flipUp();
    else setTimeout(flipUp, started ? 320 : 50);
    started = true;
  }
  function beginPlay() {
    stats.rules = true;
    facedown = true;
    if (!G.cards || !G.cards.length) {
      G.cards = [{ value: 0, suit: 'lemon', label: '' }, { value: 0, suit: 'strawberry', label: '' }];
      G.phase = 'ready';
    }
    render();
    function go() { if (!G.flips) next(); }
    if (skipMotion()) go();
    else setTimeout(go, (A.Kit && A.Kit.INTRO_MS) ? A.Kit.INTRO_MS + 40 : 1140);
  }
  function flipCards() {
    if (skipMotion()) return;
    A.$$('.ff-card').forEach(function (el) { if (el.animate) el.animate([{ transform: 'rotateY(90deg)' }, { transform: 'rotateY(0)' }], { duration: 350, easing: 'ease-out' }); });
  }
  function reveal() { kitRevealCards(); }
  function tap(side) {
    if (example || G.phase !== 'choose') return;
    var r = F.choose(G, side); if (!r) { render(); return; }
    pose = ['thinking', 'thinking'];
    if (r.correct) { pose[1] = 'cheering'; pose[0] = 'oops'; A.Audio.sfx('pop'); [660, 880, 700, 940].forEach(function (f, i) { A.Audio.tone(f, .11, { vol: .09, to: f * .8, when: .18 + i * .12 }); }); }
    else { pose[1] = 'oops'; if (r.giant) pose[0] = 'cheering'; }
    render();
    if (r.giant) giantSplat(r.taker);
    else if (r.correct) toss(1);
    if (G.phase === 'done') saveMatch();
  }
  function toss(fromSide) {
    var table = $('.ff-table'); if (!table) return;
    var tr = table.getBoundingClientRect();
    var friends = A.$$('.ff-friend');
    if (friends.length < 2) return;
    var from = friends[fromSide].getBoundingClientRect(), to = friends[1 - fromSide].getBoundingClientRect();
    var el = A.el('<span class="ff-toss ff-toss-splat" aria-hidden="true">' + splatArt(true) + '</span>');
    table.appendChild(el);
    el.style.left = (from.left - tr.left + from.width / 2 - 18) + 'px'; el.style.top = (from.top - tr.top + from.height / 2 - 18) + 'px';
    if (el.animate) el.animate([{ transform: 'translate(0,0) rotate(0) scale(1)', opacity: 1 }, { transform: 'translate(' + (to.left - from.left) + 'px,' + (to.top - from.top) + 'px) rotate(340deg) scale(1.2)', opacity: 0 }], { duration: 650, easing: 'ease-in' });
    setTimeout(function () { el.remove(); }, 650);
  }
  function giantSplat(fromSide) {
    var table = $('.ff-table'); if (!table) return;
    var tr = table.getBoundingClientRect();
    var friends = A.$$('.ff-friend');
    if (friends.length < 2) return;
    var from = friends[fromSide].getBoundingClientRect(), to = friends[1 - fromSide].getBoundingClientRect();
    var el = A.el('<span class="ff-giant-fly" aria-hidden="true">' + splatArt(true) + '</span>');
    table.appendChild(el);
    el.style.left = (from.left - tr.left + from.width / 2 - 36) + 'px'; el.style.top = (from.top - tr.top + from.height / 2 - 36) + 'px';
    A.Audio.sfx('boing');
    if (el.animate) el.animate([
      { transform: 'translate(0,0) rotate(0) scale(.4)', opacity: 1 },
      { transform: 'translate(' + ((to.left - from.left) * .55) + 'px,' + ((to.top - from.top) * .55) + 'px) rotate(200deg) scale(1.6)', opacity: 1, offset: .45 },
      { transform: 'translate(' + (to.left - from.left) + 'px,' + (to.top - from.top) + 'px) rotate(400deg) scale(2.2)', opacity: 0 }
    ], { duration: 1400, easing: 'ease-in' });
    setTimeout(function () { el.remove(); }, 1500);
  }
  function confetti() {
    var colors = ['#e87699','#74b99c','#eac74c','#ef799d'];
    var bits = Array.from({ length: 22 }, function (_, i) {
      var edge = i % 2 === 0;
      var left = edge ? (i % 4 === 0 ? 3 + (i % 10) : 86 + (i % 10)) : (8 + (i * 7) % 84);
      var top = edge ? (6 + (i * 5) % 70) : (4 + (i % 5) * 3);
      return '<i style="left:' + left + '%;--y:' + top + '%;--r:' + (i % 2 ? 25 : -30) + 'deg;--c:' + colors[i % 4] + '"></i>';
    }).join('');
    var el = A.el('<span class="ff-confetti" aria-hidden="true">' + bits + '</span>');
    var table = $('.ff-table'); if (table) table.appendChild(el);
    setTimeout(function () { el.remove(); }, 2000);
  }
  function saveMatch() {
    if (saved) return;
    stats.matches++;
    stats.best = Math.max(stats.best || 0, G.splatTotal || 0);
    stats.correct = Math.max(stats.correct || 0, G.correctN || 0);
    stats.parties = Math.max(stats.parties || 0, G.parties || 0);
    var stars = F.matchStars(G);
    stats.lastStars = stars;
    if (stars) A.Store.earnStars(P, stars, 'foodfight');
    A.Store.save();
    saved = true;
    return stars;
  }
  function results() {
    cancelAdvance();
    celebrating = false;
    var stars = saveMatch();
    if (stars == null) stars = F.matchStars(G);
    A.Audio.sfx('win');
    var judged = G.judged || 0, right = G.correctN || 0, splats = G.splatTotal || 0, parties = G.parties || 0;
    var ruleWord = 'MORE/LESS';
    var spot = judged ? ('You spotted ' + ruleWord + ' on ' + right + ' of ' + judged + ' flips.') : 'Ten flips. A picnic full of splats.';
    var splatLine = splats ? ('You landed ' + splats + (splats === 1 ? ' splat' : ' splats') + (parties ? ' and had ' + parties + (parties === 1 ? ' splat party' : ' splat parties') : '') + '.') : 'No splat parties this time. Want to try again?';
    var starLine = stars > 0
      ? ('You earned ' + stars + (stars === 1 ? ' star' : ' stars') + '.')
      : 'Nice picnic. Want to try more and less again?';
    $('#ffContent').innerHTML = '<div class="ff-results">' + img(A.ROOT + 'assets/picnic/friends/lemon/cheering_256.webp') +
      '<h2>What a food fight!</h2><p>' + A.esc(spot) + '</p>' +
      '<div class="ff-result-scores"><span>You spotted<b>' + right + '</b>of ' + judged + '</span>' +
      '<span>Splats<b>' + splats + '</b>landed</span><span>Parties<b>' + parties + '</b>celebrations</span></div>' +
      '<p>' + A.esc(splatLine) + ' ' + A.esc(starLine) + ' Thanks for playing together!</p>' +
      '<button class="ff-action" id="playAgain">Play again</button><button class="ff-secondary" id="resultsHome">Home</button></div>';
    if (A.UI && A.UI.onTap) { A.UI.onTap($('#playAgain'), function () { G = F.newMatch(P); window.__foodfight.G = G; saved = false; firstSpoken = false; celebrating = false; next(); }); A.UI.onTap($('#resultsHome'), home); } else { $('#playAgain').onclick = function () { G = F.newMatch(P); window.__foodfight.G = G; saved = false; firstSpoken = false; celebrating = false; next(); }; $('#resultsHome').onclick = home; }
  }
  function home() { cancelAdvance(); A.Voice.stop(); A.Store.save(); location.href = A.ROOT + 'index.html?from=game#games'; }
  if (A.UI && A.UI.bindHome) A.UI.bindHome($('#ffHome'), home); else $('#ffHome').onclick = home;
  if (A.UI && A.UI.onTap) { A.UI.onTap($('#ffSpeak'), function () { say(instruction()); }); A.UI.onTap($('#ffHelp'), function () { if (!G.band.supported) return; cancelAdvance(); returning = G.flips > 0; example = 'more'; render(); }); }
  else { $('#ffSpeak').onclick = function () { say(instruction()); }; $('#ffHelp').onclick = function () { if (!G.band.supported) return; cancelAdvance(); returning = G.flips > 0; example = 'more'; render(); }; }
  window.__foodfight = { G: G, render: render, next: next, results: results, cancelAdvance: cancelAdvance, continueTie: continueTie, pipLayout: pipLayout, forceFlip: function (a, b) { example = false; facedown = false; wildCelebrated = false; if (!G) { G = F.newMatch(P); window.__foodfight.G = G; } G.cards = [{ value: a, suit: 'lemon', label: String(a) }, { value: b, suit: 'strawberry', label: String(b) }]; G.phase = 'choose'; G.result = null; G.wild = false; G.giant = false; if (G.band && G.band.supported === false) G.band = { id: 'pk', min: 1, max: 10, supported: true, toddler: false }; render(); }, forceWild: function (v, rule) { example = false; facedown = false; wildCelebrated = false; if (!G) { G = F.newMatch(P); window.__foodfight.G = G; } v = v == null ? 6 : v; G.rule = rule || 'more'; G.cards = [{ value: v, suit: 'lemon', label: String(v) }, { value: v, suit: 'strawberry', label: 'wild' }]; G.phase = 'wild'; G.wild = true; G.result = null; G.giant = false; if (G.band && G.band.supported === false) G.band = { id: 'pk', min: 1, max: 10, supported: true, toddler: false }; render(); }, showFacedown: function () { example = false; facedown = true; if (!G.cards || !G.cards.length) { G.cards = [{ value: 0, suit: 'lemon', label: '' }, { value: 0, suit: 'strawberry', label: '' }]; G.phase = 'ready'; } G.result = null; render(); }, CORRECT_WAIT: CORRECT_WAIT, MISS_WAIT: MISS_WAIT, TIE_WAIT: TIE_WAIT, GIANT_WAIT: GIANT_WAIT, PARTY_WAIT: PARTY_WAIT }; // same local inspection pattern as the other arcade games
  beginPlay();
})(window.Arcade);
