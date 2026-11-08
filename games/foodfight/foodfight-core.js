/* Food Fight: pure match rules. rng injection supports reproducible decks; no storage or DOM here. */
(function (A) {
  'use strict';
  function bandFor(p) {
    var age = A.Age.band(p), explicit = p.levels && p.levels.math, floor = A.Learn ? A.Learn.floor(p, 'math') : 0;
    var id = age === 'toddler' || age === 'pre' ? 'toddler' : age === 'g1' ? 'g1' : age === 'g2' || age === 'g3' ? 'g2' : 'pk';
    if (explicit && explicit !== 'auto') id = +explicit >= 2 ? 'g2' : explicit === '1' ? 'g1' : 'pk';
    if (floor >= 4) id = 'g2'; else if (floor >= 3 && id !== 'g2') id = 'g1';
    // An explicit higher math band wins over toddler-by-age (no easier scored questions).
    return { id: id, toddler: id === 'toddler', min: id === 'g2' ? 21 : id === 'g1' ? 11 : 1, max: id === 'g2' || id === 'g1' ? 120 : id === 'toddler' ? 5 : 10,
      supported: !(floor > 4 || (explicit && +explicit > 2)) };
  }
  function num(g, lo, hi) { return lo + Math.floor(g.rng() * (hi - lo + 1)); }
  function newMatch(p, rng) {
    var g = { band: bandFor(p), rng: rng || Math.random, flips: 0, score: [0, 0], streak: 0, wildUsed: 0, wild: false, phase: 'ready', cards: [], rule: 'more', pot: 2, recent: [] };
    g.wildAt = g.rng() < .25 ? num(g, 3, 8) : -1; return g;
  }
  function card(v, suit, label) { return { value: v, suit: suit, label: label || String(v) }; }
  function solveCard(g) {
    var q, v, label, b;
    if (g.band.id === 'g1') {
      // ASK may return a hidden-part or true-equation variant; its choice is not necessarily the sum.
      if (A.Questions && A.Questions.ASK.add20) { q = A.Questions.ASK.add20(1, 3); if (q.fact && q.fact[1] === 'w_plus') { v = q.fact[4]; label = q.fact[0] + ' + ' + q.fact[2]; } }
      if (!label || !(v >= 11 && v <= 20)) { v = num(g, 11, 19); b = num(g, v - 10, 9); label = b + ' + ' + (v - b); }
    } else {
      var s = A.Curriculum && A.Curriculum.byId[g.rng() < .5 ? 'a2_add' : 's2_sub'];
      if (s && s.ask) { q = s.ask(0, 3); if (q.f && q.f.v >= g.band.min) { v = q.f.v; label = q.f.label; } }
      if (!label) { v = num(g, 31, 89); b = num(g, 11, v - 11); label = b + ' + ' + (v - b); }
    }
    return card(v, 'strawberry', label);
  }
  function pair(g, allowTie) {
    var b = g.band, gap = b.toddler ? num(g, 3, 4) : b.id === 'pk' ? (g.streak >= 3 ? 1 : num(g, 2, 4)) : num(g, 1, Math.max(2, 12 - g.streak * 2));
    var a = num(g, b.min, b.max - gap), c = a + gap, left = card(a, 'lemon'), right = card(c, 'strawberry');
    if (!b.toddler && b.id !== 'pk' && g.rng() < .35) {
      right = solveCard(g); left = card(Math.max(b.min, Math.min(b.max, right.value + (g.rng() < .5 ? gap : -gap))), 'lemon');
      if (left.value === right.value) left.value = right.value + gap <= b.max ? right.value + gap : right.value - gap;
      left.label = String(left.value);
    }
    if (g.rng() < .5) { var t = left; left = right; right = t; }
    if (allowTie && !b.toddler && g.rng() < .09) right = card(left.value, 'strawberry');
    // Ownership suits: Sunny (side 0) is always lemon, the player (side 1) always strawberry.
    left.suit = 'lemon'; right.suit = 'strawberry';
    return [left, right];
  }
  function deal(g) {
    if (!g.band.supported || (g.phase !== 'ready' && g.phase !== 'feedback') || g.flips >= 10) return false;
    g.flips++; g.pot = 2; g.result = null;
    g.rule = !g.band.toddler && (g.band.id !== 'pk' || g.streak >= 4) && g.rng() < (g.band.id === 'pk' ? .2 : .3) ? 'less' : 'more';
    var cards, key;
    for (var i = 0; i < 12; i++) { cards = pair(g, true); key = g.rule + ':' + cards.map(function (c) { return c.label; }).join(':'); if (g.recent.indexOf(key) < 0) break; }
    g.cards = cards; g.recent.push(key); if (g.recent.length > 20) g.recent.shift();
    g.wild = g.flips === g.wildAt && !g.wildUsed;
    if (g.wild) { g.wildUsed++; // Never put a wild against an endpoint it cannot beat inside the band.
      var lo = g.band.min + 1, hi = g.band.max - 1;
      g.cards[0] = card(Math.max(lo, Math.min(hi, g.cards[0].value)), 'lemon');
    }
    g.phase = g.wild ? 'wild' : g.cards[0].value === g.cards[1].value ? 'tie' : 'choose'; return true;
  }
  function winner(g) { if (g.band.toddler) return 1; var a = g.cards[0].value, b = g.cards[1].value; if (a === b) return -1; return (g.rule === 'more' ? a > b : a < b) ? 0 : 1; }
  function wildOptions(g) { var v = g.cards[0].value; return [v - 1, v, v + 1]; }
  function wildPick(g, n) {
    if (g.phase !== 'wild' || wildOptions(g).indexOf(n) < 0) return false;
    if (!g.band.toddler && !(g.rule === 'more' ? n > g.cards[0].value : n < g.cards[0].value)) return false;
    g.cards[1] = card(n, 'strawberry'); g.phase = 'choose'; return true;
  }
  function splatOff(g) { if (g.phase !== 'tie') return false; g.cards = pair(g, false); g.pot = 10; g.phase = 'choose'; return true; }
  function choose(g, side) {
    if (g.phase !== 'choose' || (side !== 0 && side !== 1)) return null;
    var w = winner(g), ok = g.band.toddler || side === w;
    if (w < 0) { g.phase = 'tie'; return null; }
    if (ok) { g.score[w] += g.pot; g.streak++; } else g.streak = 0;
    var a = g.cards[w].value, b = g.cards[1 - w].value;
    g.result = { correct: ok, winner: w, pot: ok ? g.pot : 0, message: g.band.toddler ? 'Splat! What a picnic!' : a + ' is ' + g.rule + ' than ' + b + (ok ? '!' : '. Take a look!') };
    g.phase = g.flips === 10 ? 'done' : 'feedback'; return g.result;
  }
  A.FoodFight = { bandFor: bandFor, newMatch: newMatch, deal: deal, winner: winner, choose: choose, splatOff: splatOff, wildOptions: wildOptions, wildPick: wildPick };
})(window.Arcade);
