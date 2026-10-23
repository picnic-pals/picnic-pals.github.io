/* Snack Slugger rules (slugger2, 2026-10-22): the pure game math, shared by baseball.js and the headless sim
   (_test/slugger2-test.js). No DOM. Plain global: window.Arcade.SluggerRules (also module.exports under node).
   OUTS: every wrong answer is an out (pop-up / foul tip / grounder, all caught by a friendly fielder). A right answer is
   a hit MOST of the time; a slow answer on an easy pitch is now and then a long fly ball that gets caught
   (CAUGHT_SLOW_EASY → CAUGHT_FAST_HARD by the same "power" as the hit odds; halved at age 4 and under).
   Half-inning: 3 outs (age 4 and under: 4 outs — a gentler rule for preschoolers), or the mercy rule at MERCY runs.
   Occasionally (WALK) a batter walks before the pitch: ball four, take your base, no question. */
(function (root) {
  'use strict';
  var R = {};
  R.HITS = {
    sg: { k: 'sg', bases: 1, name: 'Single', icon: '⚾' }, db: { k: 'db', bases: 2, name: 'Double', icon: '⚾⚾' },
    tr: { k: 'tr', bases: 3, name: 'Triple', icon: '🔥' }, hr: { k: 'hr', bases: 4, name: 'Home Run', icon: '💥' }
  };
  R.ORDER = ['sg', 'db', 'tr', 'hr'];
  R.SLOW_EASY = [62, 27, 8, 3]; R.FAST_HARD = [26, 38, 24, 12]; R.LITTLE_SHIFT = 14;
  R.CAUGHT_SLOW_EASY = .10; R.CAUGHT_FAST_HARD = .06;   // design2: slow-easy was .26 (too many right answers caught)
  R.MERCY = 5; R.WALK = .05;
  R.mercyFor = function (little) { return little ? 4 : R.MERCY; };
  R.outsFor = function (little) { return little ? 4 : 3; };
  R.speedOf = function (sec, quick) { if (sec <= quick) return 1; if (sec >= 3 * quick) return 0; return (3 * quick - sec) / (2 * quick); };
  R.power = function (o) { var sp = o.speed != null ? o.speed : R.speedOf(o.sec || 0, o.quick || 2.5); return Math.max(0, Math.min(1, .55 * sp + .45 * (o.diff || 0))); };
  R.hitOdds = function (o) {
    var pw = R.power(o), w = R.SLOW_EASY.map(function (a, i) { return a + (R.FAST_HARD[i] - a) * pw; });
    if (o.little) { var mv = Math.min(R.LITTLE_SHIFT, w[0] - 10); w[0] -= mv; w[1] += mv; }
    var out = { power: +pw.toFixed(3) }; R.ORDER.forEach(function (k, i) { out[k] = +w[i].toFixed(2); }); return out;
  };
  R.rollHit = function (o, rnd) {
    var od = R.hitOdds(o), r = (rnd || Math.random)() * 100, acc = 0;
    for (var i = 0; i < R.ORDER.length; i++) { acc += od[R.ORDER[i]]; if (r < acc) return R.HITS[R.ORDER[i]]; }
    return R.HITS.sg;
  };
  // chance a RIGHT answer is still a caught fly ball (only weak contact: slow + easy); never on a stretch pitch
  R.caughtChance = function (o) { if (o.stretch || o.noFly) return 0;   // design2: noFly = age 5 and under (a right answer is always a hit)
    var c = R.CAUGHT_SLOW_EASY + (R.CAUGHT_FAST_HARD - R.CAUGHT_SLOW_EASY) * R.power(o); return o.little ? c / 2 : c; };
  /* runners: bases = [1st, 2nd, 3rd] (truthy = a runner). n = bases for the batter (4 = home run). Variety: on a single a
     runner on 2nd sometimes scores; on a double a runner on 1st sometimes scores (extra = false turns that off, used when a
     "where does the runner end up?" question needs the plain rule). walk: only forced runners move.
     Returns { bases, runs, moves: [{from, to}] } (from 0 = the batter; to 4 = scored). */
  R.advance = function (bases, n, rnd, opt) {
    opt = opt || {}; rnd = rnd || Math.random; var nb = [0, 0, 0], runs = 0, moves = [];
    if (opt.walk) {
      var force = [bases[0], bases[0] && bases[1], bases[0] && bases[1] && bases[2]];
      for (var b = 2; b >= 0; b--) if (bases[b]) { var to = force[b] ? b + 2 : b + 1; if (!force[b]) { nb[b] = bases[b]; continue; } if (to >= 4) { runs++; moves.push({ from: b + 1, to: 4, r: bases[b] }); } else { nb[to - 1] = bases[b]; moves.push({ from: b + 1, to: to, r: bases[b] }); } }
      nb[0] = 'B'; moves.push({ from: 0, to: 1, r: 'B' });
      return { bases: nb, runs: runs, moves: moves };
    }
    for (var c = 2; c >= 0; c--) {
      if (!bases[c]) continue;
      var t = c + 1 + n;
      if (opt.extra !== false && t < 4 && ((n === 1 && c === 1) || (n === 2 && c === 0)) && rnd() < .45) t = 4;
      if (t < 4 && nb[t - 1]) t = 4;
      if (t >= 4) { runs++; moves.push({ from: c + 1, to: 4, r: bases[c] }); } else { nb[t - 1] = bases[c]; moves.push({ from: c + 1, to: t, r: bases[c] }); }
    }
    if (n >= 4) { runs++; moves.push({ from: 0, to: 4, r: 'B' }); } else { nb[n - 1] = 'B'; moves.push({ from: 0, to: n, r: 'B' }); }
    return { bases: nb, runs: runs, moves: moves };
  };
  // stretch pitches: more when she is cruising, fewer when it is hard (recent = last at-level answers, true/false)
  R.stretchRate = function (recent) {
    if (!recent || recent.length < 3) return .2;
    var a = recent.filter(Boolean).length / recent.length;
    return a >= .85 ? .34 : a >= .7 ? .22 : a >= .55 ? .12 : .05;
  };
  /* the friendly rival team (solo games): it bats the top half, simulated with the same rules at a modest "accuracy"
     (RIVAL_ACC, a bit lower at 4 and under). Tuned with _test/slugger2-test.js so a kid at ~80% wins about 55-70%. */
  R.RIVAL = { name: 'Sprout Squad', short: 'SPROUTS', icon: '🥦' };
  R.RIVAL_ACC = { big: .74, pre: .79, little: .77 };   // design2: little was .72   // design2: 'pre' = age 5 (no fly-outs for her, so a slightly sharper rival)
  R.rivalAcc = function (little, age) { return little ? R.RIVAL_ACC.little : R.noFly(age) ? R.RIVAL_ACC.pre : R.RIVAL_ACC.big; };
  // one simulated half-inning. o: { acc, little, rnd, speed (0..1, default random), stretch, maxPA }
  R.simHalf = function (o) {
    var rnd = o.rnd || Math.random, outs = 0, runs = 0, hits = 0, pa = 0, pitches = 0, bases = [0, 0, 0], maxOuts = R.outsFor(o.little), mercy = o.mercy || R.mercyFor(o.little), events = [];
    while (outs < maxOuts && runs < mercy && pa < (o.maxPA || 40)) {
      pa++;
      if (rnd() < R.WALK) { var w = R.advance(bases, 1, rnd, { walk: true }); bases = w.bases; runs += w.runs; events.push('bb'); continue; }
      pitches++;
      var st = rnd() < (o.stretch != null ? o.stretch : .2), ok = rnd() < (st ? (o.accStretch != null ? o.accStretch : o.acc - .12) : o.acc);
      if (!ok) { outs++; events.push('out'); continue; }
      var sp = o.speed != null ? o.speed : rnd(), d = st ? 1 : rnd() * .5, info = { speed: sp, diff: d, little: o.little, stretch: st };
      if (rnd() < R.caughtChance(info)) { outs++; events.push('fly'); continue; }
      var z = R.rollHit(info, rnd), ad = R.advance(bases, z.bases, rnd); bases = ad.bases; runs += ad.runs; hits++; events.push(z.k);
    }
    return { runs: Math.min(runs, mercy), outs: outs, hits: hits, pa: pa, pitches: pitches, events: events };
  };
  // stars (solo): 1 for playing, +1 for winning, +1 for a win that also reaches the run goal with 2+ right tricky (stretch) pitches
  // design2: the 3-star run goal (was 9; 11 at 4 and under) is 13 (12 at 4 and under), tuned with _test/slugger2-test.js so a
  // 6-year-old at 80% gets 3 stars in ~30% of games (was 44%); 'age' is accepted for callers, all 5+ share the goal
  R.runGoal = function (little, age) { return little ? 12 : 13; };
  R.noFly = function (age) { return age != null && age <= 5; };
  R.stars = function (o) { return 1 + (o.won ? 1 : 0) + (o.won && o.runs >= o.goal && o.tricky >= 2 ? 1 : 0); };
  if (root && root.Arcade) root.Arcade.SluggerRules = R;
  if (typeof module !== 'undefined' && module.exports) module.exports = R;
})(typeof window !== 'undefined' ? window : null);
