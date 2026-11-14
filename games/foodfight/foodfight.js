/* Food Fight v1 — visual table, touch/keyboard buttons, optional device voice. */
(function (A) {
  'use strict';
  A.UI.boot();
  var P = A.Store.active(); if (!P) { location.replace(A.ROOT + 'index.html#players'); return; }
  var F = A.FoodFight, $ = A.$, ART = A.ROOT + 'art/food-fight/', G = F.newMatch(P), example = '', returning = false, firstSpoken = false, saved = false;
  var stats = P.games.foodfight = P.games.foodfight || { matches: 0, best: 0, rules: false, less: false };
  var pose = ['thinking', 'thinking'];
  function img(src, cls) { return '<img class="' + (cls || '') + '" src="' + src + '" alt="" draggable="false">'; }
  function pip(suit) { return img(ART + suit + '-pip.png'); }
  // Familiar mirrored playing-card positions; corners show numerals only so kids count center pips.
  /* 1-5: dice / five-frame style. 6-10: one ten-frame (top row of 5, then the rest), never loose scatter. */
  function pipLayout(n) {
    var i, r, c, out = [];
    if (n <= 5) {
      var dice = { 1:[[50,50]], 2:[[26,18],[74,82]], 3:[[26,18],[50,50],[74,82]], 4:[[26,18],[74,18],[26,82],[74,82]], 5:[[26,18],[74,18],[50,50],[26,82],[74,82]] };
      return dice[n] || dice[1];
    }
    for (i = 0; i < n && i < 10; i++) { r = i < 5 ? 0 : 1; c = i % 5; out.push([18 + c * 16, 28 + r * 40]); }
    return out;
  }
  var layouts = {}; for (var n = 1; n <= 10; n++) layouts[n] = pipLayout(n);
  function card(c, side, glow, wild) {
    var suit = side ? 'strawberry' : 'lemon', label = c.label || String(c.value), solve = label !== String(c.value);
    var shown = !solve || !!G.result;
    var h = '<button class="ff-card ' + (glow ? 'ff-glow ' : '') + (wild ? 'ff-wild ' : '') + (solve && G.result ? 'ff-solved ' : '') + '" data-side="' + side + '" aria-label="' + (side ? 'Your' : 'Sunny’s') + ' card: ' + (wild ? 'Picnic Basket wild' : A.esc(shown ? String(c.value) : label)) + '"' + (example || G.phase !== 'choose' ? ' disabled' : '') + '>';
    if (wild) return h + img(ART + 'wild.png') + '</button>';
    h += '<span class="ff-corner" aria-hidden="true"><b>' + (shown ? c.value : '?') + '</b></span><span class="ff-corner ff-invert" aria-hidden="true"><b>' + (shown ? c.value : '?') + '</b></span>';
    if (c.value <= 10 && shown) h += '<span class="ff-pips" aria-hidden="true">' + layouts[c.value].map(function (p) { return '<i style="left:' + p[0] + '%;top:' + p[1] + '%">' + pip(suit) + '</i>'; }).join('') + '</span>';
    if (solve && !G.result) h += '<span class="ff-equation">' + A.esc(label) + '<small>Solve first</small></span>';
    else if (solve && G.result) h += '<span class="ff-number">' + c.value + '</span><span class="ff-equation ff-revealed">' + A.esc(label) + '</span>';
    else if (!solve && c.value > 10) h += '<span class="ff-number">' + c.value + '</span><span class="ff-model" aria-hidden="true">' + A.PV100.blocks3(Math.floor(c.value / 100), Math.floor(c.value % 100 / 10), c.value % 10) + '</span>';
    return h + '</button>';
  }
  function friend(side) {
    var art = side ? (P.blob && A.FoodData.cast.some(function (f) { return f.id === P.blob; }) ? A.Blobs.forProfile(P, { expr: pose[1] === 'cheering' ? 'cheer' : pose[1] === 'oops' ? 'oops' : 'think' }) : img(ART + 'muffin.png')) : img(A.ROOT + 'assets/picnic/friends/lemon/' + pose[0] + '_256.webp');
    var taker = G.result && (G.result.taker != null ? G.result.taker : G.result.winner);
    return '<div class="ff-friend-row ' + (side ? 'ff-you' : 'ff-sunny') + '"><div class="ff-friend ' + (G.result && taker === side ? 'ff-cheer' : '') + '">' + art + (G.result && taker != null && taker !== side && taker >= 0 ? '<span class="ff-splat" aria-hidden="true"></span>' : '') + '</div><b class="ff-name">' + (side ? 'You' : 'Sunny') + '</b><span class="ff-pile">' + img(ART + 'back.png') + '</span><span class="ff-total"><b>' + G.score[side] + '</b><small>cards won</small></span></div>';
  }
  function say(text, kind) { A.Voice.say([{ text: text }], { kind: kind || 'tap', bubble: false }); }
  function instruction() { return example === 'more' ? 'More means a bigger amount. Sunny has 3. You have 5. 5 is more than 3. Tap the card with more.' : example === 'less' ? 'Less means a smaller amount. Sunny has 3. You have 5. 3 is less than 5. Tap the card with less.' : G.phase === 'wild' ? 'Wild! Pick a number ' + G.rule + ' than ' + G.cards[0].value + '.' : 'Tap who has ' + G.rule + '.'; }
  function footer() {
    if (example) return '<div class="ff-footer"><p class="ff-example-line">' + (example === 'more' ? '5 is MORE! More means a bigger amount.' : '3 is LESS! Less means a smaller amount.') + '</p><button class="ff-action" id="' + (example === 'less' ? 'lessStart' : 'ruleStart') + '">' + (returning ? 'Back to play' : "Let's play!") + '</button></div>';
    if (G.phase === 'tie') return '<div class="ff-footer"><p>Same amount! Three down, one up.</p><button class="ff-action" id="splatFlip">Flip Splat-Off!</button></div>';
    if (G.phase === 'wild') return '<div class="ff-footer"><p id="wildHint">Pick a number ' + G.rule.toUpperCase() + ' than ' + G.cards[0].value + '.</p><div class="ff-picker">' + F.wildOptions(G).map(function (n) { return '<button class="ff-pick" data-pick="' + n + '">' + n + '</button>'; }).join('') + '</div></div>';
    if (G.result) return '<div class="ff-footer"><p role="status">' + G.result.message + (G.result.taker === 1 ? '<small class="ff-award">You take ' + G.result.pot + ' cards!</small>' : (G.result.taker === 0 ? '<small class="ff-award">Sunny takes ' + G.result.pot + ' cards!</small>' : '')) + '</p><button class="ff-action" id="nextRound">' + (G.phase === 'done' ? 'See our picnic!' : 'Next flip') + '</button></div>';
    return '<div class="ff-footer"><p>' + (G.pot === 10 ? 'Splat-Off! All 10 cards go to the winner.' : G.band.toddler ? 'Tap either card. Let’s splat!' : 'Both cards are up. Take your time.') + '</p><span class="ff-progress">Flip ' + G.flips + ' of 10</span></div>';
  }
  function render() {
    if (!G.band.supported) { $('#ffContent').innerHTML = '<div class="ff-results"><h2>A bigger deck is growing!</h2><p>This first deck stops at second-grade math. Your level stays just where it is.</p><button class="ff-action" id="resultsHome">Home</button></div>'; $('#resultsHome').onclick = home; return; }
    var cards = example ? [{ value: 3, suit: 'lemon' }, { value: 5, suit: 'strawberry' }] : G.cards;
    var rule = example || G.rule, tie = !example && G.phase === 'tie';
    var winning = example ? (example === 'less' ? 0 : 1) : G.result ? G.result.winner : -1;
    var war = tie ? '<span class="ff-war" aria-label="Three face-down cards">' + [1,2,3].map(function () { return img(ART + 'back.png', 'ff-back'); }).join('') + '</span>' : '';
    $('#ffContent').innerHTML = '<div class="ff-table ' + (example ? 'ff-example ' : '') + (rule === 'less' ? 'ff-less' : '') + '">' + friend(0) + '<div class="ff-mat ff-yellow">' + war + card(cards[0], 0, winning === 0, false) + '</div><div class="ff-banner" role="status">' + (tie ? 'Splat-Off!' : 'Tap who has <strong>' + rule.toUpperCase() + '</strong>') + '</div><div class="ff-mat ff-pink">' + war + card(cards[1], 1, winning === 1, !example && G.wild && G.phase === 'wild') + '</div>' + friend(1) + footer() + '</div>';
    function bindTap(el, fn) { if (!el) return; if (A.UI && A.UI.onTap) A.UI.onTap(el, fn); else el.onclick = fn; }
    A.$$('.ff-mat').forEach(function (mat) {
      var card = mat.querySelector('.ff-card'); if (!card) return;
      mat.setAttribute('data-side', card.getAttribute('data-side'));
      bindTap(mat, function () { tap(+card.dataset.side); });
    });
    A.$$('.ff-pick').forEach(function (el) { bindTap(el, function () { if (F.wildPick(G, +el.dataset.pick)) { render(); if (G.band.toddler) tap(1); } else { $('#wildHint').textContent = 'Look for ' + G.rule.toUpperCase() + ' than ' + G.cards[0].value + '.'; el.classList.add('ff-try'); var right = F.wildOptions(G).filter(function (n) { return G.rule === 'more' ? n > G.cards[0].value : n < G.cards[0].value; })[0]; $('[data-pick="' + right + '"]').classList.add('ff-glow'); } }); });
    var start = $('#ruleStart') || $('#lessStart'); if (start) bindTap(start, closeExample);
    if ($('#splatFlip')) bindTap($('#splatFlip'), function () { F.splatOff(G); A.Audio.sfx('pop'); render(); reveal(); });
    if ($('#nextRound')) bindTap($('#nextRound'), function () { if (G.phase === 'done') results(); else next(); });
  }
  function closeExample() {
    if (example === 'more') stats.rules = true; else stats.less = true;
    example = ''; A.Store.save();
    if (returning) { returning = false; render(); } else if (!G.flips) next(); else { render(); speakFirst(); }
  }
  function speakFirst() { if (!firstSpoken) { firstSpoken = true; say(instruction(), 'prompt'); } }
  function next() {
    pose = ['thinking', 'thinking']; F.deal(G);
    if (G.rule === 'less' && !stats.less) { example = 'less'; returning = false; }
    render(); if (!example) { reveal(); speakFirst(); }
    // Toddler wild is a celebration, never a number quiz.
    if (G.wild && G.band.toddler && !example) { F.wildPick(G, G.cards[0].value + 1); tap(1); }
  }
  function reveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    A.$$('.ff-card').forEach(function (el) { if (el.animate) el.animate([{ transform: 'rotateY(90deg)' }, { transform: 'rotateY(0)' }], { duration: 350, easing: 'ease-out' }); });
  }
  function tap(side) {
    if (example) return;
    var r = F.choose(G, side); if (!r) { render(); return; }
    pose = ['happy', 'happy'];
    if (r.correct) { pose[r.winner] = 'cheering'; pose[1 - r.winner] = 'oops'; A.Audio.sfx('pop'); [660, 880, 700, 940].forEach(function (f, i) { A.Audio.tone(f, .11, { vol: .09, to: f * .8, when: .18 + i * .12 }); }); }
    render();
    if (r.correct) { toss(r.winner); collect(r.winner); if (G.wild && G.band.toddler) confetti(); }
    if (G.phase === 'done') saveMatch();
  }
  function toss(winner) {
    var table = $('.ff-table'), tr = table.getBoundingClientRect();
    var from = A.$$('.ff-friend')[winner].getBoundingClientRect(), to = A.$$('.ff-friend')[1 - winner].getBoundingClientRect();
    var el = A.el('<span class="ff-toss" aria-hidden="true">' + pip(winner ? 'strawberry' : 'lemon') + '</span>'); table.appendChild(el);
    el.style.left = (from.left - tr.left + from.width / 2 - 20) + 'px'; el.style.top = (from.top - tr.top + from.height / 2 - 20) + 'px';
    if (el.animate) el.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: 'translate(' + (to.left - from.left) + 'px,' + (to.top - from.top) + 'px) rotate(340deg)', opacity: 0 }], { duration: 650, easing: 'ease-in' });
    setTimeout(function () { el.remove(); }, 650);
  }
  function collect(winner) {
    var table = $('.ff-table'), tr = table.getBoundingClientRect(), dest = A.$$('.ff-pile')[winner].getBoundingClientRect();
    A.$$('.ff-card').forEach(function (card) {
      var from = card.getBoundingClientRect(), el = A.el('<span class="ff-collect" aria-hidden="true">' + img(ART + 'back.png') + '</span>');
      el.style.left = (from.left - tr.left + from.width / 2 - 18) + 'px'; el.style.top = (from.top - tr.top + from.height / 2 - 26) + 'px'; table.appendChild(el);
      if (el.animate) el.animate([{ transform: 'translate(0,0) scale(1)', opacity: 0 }, { transform: 'translate(0,0) scale(1)', opacity: 1, offset: .1 }, { transform: 'translate(' + (dest.left - from.left - from.width / 2 + 18) + 'px,' + (dest.top - from.top - from.height / 2 + 26) + 'px) scale(.65)', opacity: 0 }], { duration: 900, delay: 250, fill: 'both', easing: 'ease-in-out' });
      setTimeout(function () { el.remove(); }, 1200);
    });
  }
  function confetti() {
    var el = A.el('<span class="ff-confetti" aria-hidden="true">' + Array.from({ length: 16 }, function (_, i) { return '<i style="left:' + (i * 6) + '%;--r:' + (i % 2 ? 25 : -30) + 'deg;--c:' + ['#e87699','#74b99c','#eac74c'][i % 3] + '"></i>'; }).join('') + '</span>'); $('.ff-table').appendChild(el); setTimeout(function () { el.remove(); }, 1300);
  }
  function saveMatch() {
    if (saved) return;
    stats.matches++;
    stats.best = Math.max(stats.best, G.score[1]);
    stats.correct = Math.max(stats.correct || 0, G.correctN || 0);
    var stars = F.matchStars(G);
    stats.lastStars = stars;
    if (stars) A.Store.earnStars(P, stars, 'foodfight');
    A.Store.save();
    saved = true;
    return stars;
  }
  function results() {
    var stars = saveMatch();
    if (stars == null) stars = F.matchStars(G);
    A.Audio.sfx('win');
    var judged = G.judged || 0, right = G.correctN || 0;
    var ruleWord = 'MORE/LESS';
    var spot = judged ? ('You spotted ' + ruleWord + ' on ' + right + ' of ' + judged + ' flips.') : 'Ten flips. A picnic full of splats.';
    var starLine = stars > 0
      ? ('You earned ' + stars + (stars === 1 ? ' star' : ' stars') + '.')
      : 'Nice picnic. Want to try more and less again?';
    $('#ffContent').innerHTML = '<div class="ff-results">' + img(A.ROOT + 'assets/picnic/friends/lemon/cheering_256.webp') +
      '<h2>What a food fight!</h2><p>' + A.esc(spot) + '</p>' +
      '<div class="ff-result-scores"><span>You spotted<b>' + right + '</b>of ' + judged + '</span>' +
      '<span>You<b>' + G.score[1] + '</b>cards won</span><span>Sunny<b>' + G.score[0] + '</b>cards won</span></div>' +
      '<p>' + A.esc(starLine) + ' Thanks for playing together!</p>' +
      '<button class="ff-action" id="playAgain">Play again</button><button class="ff-secondary" id="resultsHome">Home</button></div>';
    if (A.UI && A.UI.onTap) { A.UI.onTap($('#playAgain'), function () { G = F.newMatch(P); window.__foodfight.G = G; saved = false; firstSpoken = false; next(); }); A.UI.onTap($('#resultsHome'), home); } else { $('#playAgain').onclick = function () { G = F.newMatch(P); window.__foodfight.G = G; saved = false; firstSpoken = false; next(); }; $('#resultsHome').onclick = home; }
  }
  function home() { A.Voice.stop(); A.Store.save(); location.href = A.ROOT + 'index.html?from=game#games'; }
  if (A.UI && A.UI.bindHome) A.UI.bindHome($('#ffHome'), home); else $('#ffHome').onclick = home;
  if (A.UI && A.UI.onTap) { A.UI.onTap($('#ffSpeak'), function () { say(instruction()); }); A.UI.onTap($('#ffHelp'), function () { if (!G.band.supported) return; returning = G.flips > 0; example = 'more'; render(); }); }
  else { $('#ffSpeak').onclick = function () { say(instruction()); }; $('#ffHelp').onclick = function () { if (!G.band.supported) return; returning = G.flips > 0; example = 'more'; render(); }; }
  window.__foodfight = { G: G, render: render }; // same local inspection pattern as the other arcade games
  if (!stats.rules) { example = 'more'; render(); } else next();
})(window.Arcade);
