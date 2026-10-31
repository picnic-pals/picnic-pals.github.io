/* Blob Arcade — shared math curriculum.
   Mastery-based progression. Each skill has explicit levels; within a skill the level steps up/down
   automatically from round accuracy. A skill is MASTERED after 2 strong rounds (>=80%) at its top level,
   which unlocks the next skill (with a short "New skill!" intro).
   Spoken parts are arrays of voice-line ids / numbers (see voice-lines.js), so sentences are composed
   from a small set of recordings. */
(function (A) {
  'use strict';
  var rnd = A.rnd, pick = A.pick;
  function em(n) { return '<b class="hl">' + n + '</b>'; }
  var BOX = '<span class="box">?</span>';
  function frame(v) { var n = v > 5 ? 10 : 5, h = '<span class="frame">'; for (var i = 0; i < n; i++) h += '<i class="' + (i < v ? 'on' : '') + '"></i>'; return h + '</span>'; }
  function frames2(v) { return '<span class="frames2">' + frame(10) + frame(v - 10) + '</span>'; }
  function near(T, lo, hi, offs) { var s, g = 0; do { s = T + pick(offs); g++; } while ((s < lo || s > hi || s === T) && g < 200); if (s < lo || s > hi || s === T) s = (T + 1 <= hi) ? T + 1 : T - 1; return s; }
  function plus(a, b) { return { label: a + ' + ' + b, fact: [a, 'w_plus', b, 'w_is', a + b] }; }
  function minus(a, b) { return { label: a + ' − ' + b, fact: [a, 'w_minus', b, 'w_is', a - b] }; }

  /* ---------- picnic story problems (word problems) ----------
     Food friends, the picnic basket and the family pet. The pet's name is a grown-up setting kept only on this device
     (A.Store.settings.pet = { name, type: 'dog' | 'cat' | 'other' }, default Biscuit the dog). The default name has a built-in
     clip (pet_biscuit); any other name is said by the browser's speech voice, like player names (alt: "your pet"). */
  var PET_EMOJI = { dog: '🐶', cat: '🐱', other: '🐾' };
  var WP_FOODS = [{ id: 'apples', em: '🍎' }, { id: 'strawberries', em: '🍓' }, { id: 'blueberries', em: '🫐' }, { id: 'carrots', em: '🥕' }];
  function pet() {
    var s = (A.Store && A.Store.data && A.Store.settings && A.Store.settings.pet) || {}, nm = String(s.name || '').trim().slice(0, 16) || 'Biscuit', type = PET_EMOJI[s.type] ? s.type : 'dog';
    var part = /^biscuit$/i.test(nm) ? 'pet_biscuit' : { id: 'petname_' + nm.toLowerCase().replace(/[^a-z0-9]/g, ''), text: nm, alt: ['wp_your_pet'] };
    return { name: nm, type: type, em: PET_EMOJI[type], part: part };
  }
  // L: 0 = within 10, 1 = within 20. Returns a Munch rule (good cells = the answer) with .wp = { a, b, op, ans, food, em, text }
  function wordProblem(L, forceOp) {
    var P = pet(), f = pick(WP_FOODS), op = forceOp || (Math.random() < .5 ? '+' : '-'), max = L ? 20 : 10, a, b, ans, text, say, kind = rnd(0, 1);
    if (op === '+') { ans = L ? rnd(11, 20) : rnd(3, 10); a = rnd(Math.max(1, ans - (L ? 10 : 9)), Math.min(L ? 10 : 9, ans - 1)); b = ans - a; }
    else { a = L ? rnd(11, 20) : rnd(3, 10); b = rnd(1, L ? Math.min(10, a - 1) : a - 1); ans = a - b; }
    var food = f.id;
    if (op === '+' && kind === 0) { text = P.name + ' found ' + a + ' ' + food + ' in the picnic basket and ' + b + ' more under the blanket. How many ' + food + '?';
      say = [P.part, 'wp_found', a, 'wp_f_' + food, 'wp_in_basket_and', b, 'wp_more_blanket', 'wp_how_many', 'wp_f_' + food]; }
    else if (op === '+') { text = a + ' food friends sat on the picnic blanket. ' + b + ' more came to the picnic. How many food friends are there now?'; f = { id: 'friends', em: '🍓' };
      say = [a, 'wp_friends_sat', b, 'wp_more_came', 'wp_how_many_friends']; }
    else if (kind === 0) { text = P.name + ' had ' + a + ' ' + food + ' in the picnic basket. ' + P.name + ' ate ' + b + '. How many ' + food + ' are left?';
      say = [P.part, 'wp_had', a, 'wp_f_' + food, 'wp_in_basket', P.part, 'wp_ate', b, 'wp_how_many', 'wp_f_' + food, 'wp_left']; }
    else { text = 'There were ' + a + ' ' + food + ' on the blanket. ' + P.name + ' took ' + b + ' away. How many are left?';
      say = ['wp_there_were', a, 'wp_f_' + food, 'wp_on_blanket', P.part, 'wp_took', b, 'wp_away', 'wp_how_many_left']; }
    var wrongOp = op === '+' ? Math.abs(a - b) : a + b;
    function mk(v) { return { label: String(v), fact: v === ans ? ['w_thats', v] : ['w_thats', v, 'w_not', ans] }; }
    var pic = '<span class="wp-pic" aria-hidden="true"><span class="pet">' + P.em + '</span>' + (op === '+' ? Array(Math.min(a, 20) + 1).join(f.em) + ' + ' + Array(Math.min(b, 20) + 1).join(f.em) : Array(Math.min(a, 20) + 1).join(f.em)) + '</span>';
    return { text: '<span class="wp-text">' + A.esc(text) + '</span>', plain: text, pic: pic, hint: 'Draw the story: make a dot for each one, then ' + (op === '+' ? 'put them together.' : 'cross out the ones that go away.'), say: say, story: true,
      wp: { a: a, b: b, op: op, ans: ans, food: f.id, em: f.em, text: text, pet: P.name },
      good: function () { return mk(ans); },
      bad: function () { var r = Math.random(), v; if (r < .3 && wrongOp !== ans && wrongOp <= max + 10 && wrongOp >= 0) return mk(wrongOp); do { v = ans + pick([-2, -1, 1, 2, 3]); } while (v < 0 || v === ans); return mk(v); } };
  }

  /* ---------- skill catalogue ----------
     status 'active' = playable now; 'later' = designed but not yet built (shown locked in the dashboard). */
  var SKILLS = [
    { id: 'count10', name: 'Find the number', short: 'Numbers & counting to 10', strand: 'Counting', std: 'K.CC', grade: 'K', sayFact: false,
      levels: ['Numbers 1–5 with dots', 'Numbers 0–10 with ten-frames'],
      intro: { line: 'skill_count10', example: '<b>7</b> &nbsp;=&nbsp; ' + frame(7) },
      gen: function (L) {
        var N = L ? rnd(4, 10) : rnd(1, 5), max = L ? 10 : 6;
        function mk(v) { var dots = v > 0 && Math.random() < (L ? .35 : .5); return { label: String(v), html: dots ? frame(v) : null, fact: v !== N ? ['w_thats', v, 'w_not', N] : ['w_thats', v] }; }
        return { text: 'Munch the number ' + em(N), hint: 'Look for ' + N + ' dots too!', say: ['munch_rule_number', N],
          good: function () { return mk(N); }, bad: function () { var v; do { v = rnd(0, max); } while (v === N); return mk(v); } };
      } },
    { id: 'compare', name: 'Bigger & smaller', short: 'Compare numbers to 20', strand: 'Counting', std: 'K.CC.7 / 1.NBT.3', grade: '1', sayFact: true,
      levels: ['Numbers to 10', 'Numbers to 20'],
      intro: { line: 'skill_compare', example: '<b>8</b> is bigger than <b>5</b>' },
      gen: function (L) {
        var max = L ? 20 : 10, N = L ? rnd(6, 14) : rnd(3, 7), big = Math.random() < .5;
        function mk(v) { return { label: String(v), fact: [v, v > N ? 'w_bigger_than' : v < N ? 'w_smaller_than' : 'w_same_as', N] }; }
        return { text: 'Munch numbers ' + (big ? 'bigger' : 'smaller') + ' than ' + em(N), hint: big ? 'More than ' + N : 'Less than ' + N,
          say: [big ? 'munch_rule_bigger' : 'munch_rule_smaller', N],
          good: function () { return mk(big ? rnd(N + 1, max) : rnd(0, N - 1)); },
          bad: function () { return mk(Math.random() < .2 ? N : (big ? rnd(0, N - 1) : rnd(N + 1, max))); } };
      } },
    { id: 'add10', name: 'Adding to 10', short: 'Addition facts within 10', strand: 'Add & subtract', std: '1.OA.6', grade: '1', sayFact: true,
      levels: ['Sums 3–6', 'Sums 5–10'],
      intro: { line: 'skill_add10', example: '<b>3 + 2</b> makes <b>5</b>' },
      gen: function (L) {
        var T = L ? rnd(5, 10) : rnd(3, 6);
        function sum(s) { var a = (s >= 2 && !(L && Math.random() < .12)) ? rnd(1, s - 1) : rnd(0, s); return plus(a, s - a); }
        return { text: 'Munch the ones that make ' + em(T), hint: 'Start with the bigger number, then count on.', say: ['munch_rule_make', T],
          good: function () { return sum(T); }, bad: function () { return sum(near(T, 1, 10, [-2, -1, 1, 2])); } };
      } },
    { id: 'sub10', name: 'Take away to 10', short: 'Subtraction within 10', strand: 'Add & subtract', std: '1.OA.6', grade: '1', sayFact: true,
      levels: ['Small take-aways', 'Take away within 10'],
      intro: { line: 'skill_sub10', example: '<b>5 − 2</b> makes <b>3</b>' },
      gen: function (L) {
        var T = L ? rnd(0, 7) : rnd(1, 4), maxA = L ? 10 : 6;
        function diff(d) { var a = d < maxA ? rnd(d + 1, maxA) : d; return minus(a, a - d); }
        return { text: 'Munch the ones that make ' + em(T), hint: 'Start at the first number, then count back.', say: ['munch_rule_make', T],
          good: function () { return diff(T); }, bad: function () { return diff(near(T, 0, L ? 9 : 5, [-2, -1, 1, 2])); } };
      } },
    { id: 'make10', name: 'Make 10', short: 'Pairs that make ten', strand: 'Add & subtract', std: '1.OA.6', grade: '1', sayFact: true,
      levels: ['Ten vs. far-off sums', 'Ten vs. 9 and 11'],
      intro: { line: 'skill_make10', example: '<b>6 + 4</b> makes <b>10</b>' },
      gen: function (L) {
        function pair(s) { var a = rnd(Math.max(1, s - 9), Math.min(9, s - 1)); return plus(a, s - a); }
        return { text: 'Make ' + em(10) + '! Munch pairs that make 10', hint: 'Use your 10 fingers! 🖐🖐', say: ['munch_rule_make10'],
          good: function () { return pair(10); }, bad: function () { return pair(L ? pick([9, 11]) : pick([7, 8, 12, 13])); } };
      } },
    { id: 'teen', name: 'Teen numbers', short: 'Ten and some more (11–20)', strand: 'Place value', std: '1.NBT.2b', grade: '1', sayFact: true,
      levels: ['Numbers 11–15', 'Numbers 11–20'],
      intro: { line: 'skill_teen', example: '<b>13</b> = 10 + 3' },
      gen: function (L) {
        var hi = L ? 20 : 15, N = rnd(11, hi);
        function mk(v) {
          var r = Math.random();
          if (r < .3) return { label: '10 + ' + (v - 10), fact: [10, 'w_plus', v - 10, 'w_is', v] };
          if (r < .5) return { label: String(v), html: frames2(v), long: true, fact: ['w_thats', v] };
          return { label: String(v), fact: v === N ? ['w_thats', v] : ['w_thats', v, 'w_not', N] };
        }
        return { text: 'Munch the number ' + em(N), hint: N + ' is 10 and ' + (N - 10) + ' more', say: ['munch_rule_number', N],
          good: function () { return mk(N); }, bad: function () { var rv = +String(N).split('').reverse().join(''); if (rv !== N && rv > 20 && Math.random() < .2) return { label: String(rv), fact: ['w_thats', rv, 'w_not', N] }; var v; do { v = rnd(Math.max(10, N - 4), Math.min(20, N + 4)); } while (v === N || v < 11); return mk(v); } };
      } },
    { id: 'missing', name: 'Missing number', short: 'Missing addends', strand: 'Add & subtract', std: '1.OA.8', grade: '1', sayFact: true,
      levels: ['Box is 1–4', 'Box is 1–9'],
      intro: { line: 'skill_missing', example: '2 + ' + BOX + ' = 5' },
      gen: function (L) {
        var N = L ? rnd(1, 9) : rnd(1, 4), max = L ? 10 : 6;
        function mk(m) { var a = rnd(1, Math.max(1, max - m)); return { label: a + ' + ? = ' + (a + m), html: a + '&nbsp;+&nbsp;' + BOX + '&nbsp;=&nbsp;' + (a + m), long: true, fact: [a, 'w_plus', m, 'w_makes', a + m, 'w_so_box_is', m] }; }
        return { text: 'Munch where ' + BOX + ' is ' + em(N), hint: 'What number is hiding in the box?', say: ['munch_rule_missing', N],
          good: function () { return mk(N); }, bad: function () { return mk(near(N, 0, L ? 9 : 5, [-2, -1, 1, 2])); } };
      } },
    { id: 'add20', name: 'Adding to 20', short: 'Addition within 20', strand: 'Add & subtract', std: '1.OA.6', grade: '1', sayFact: true,
      levels: ['Sums 11–14', 'Sums 13–18'],
      intro: { line: 'skill_add20', example: '<b>9 + 4</b>: make 10, then 3 more = <b>13</b>' },
      gen: function (L) {
        var T = L ? rnd(13, 18) : rnd(11, 14);
        function sum(s) { var a = rnd(Math.max(1, s - 10), Math.min(10, s - 1)); return plus(a, s - a); }
        return { text: 'Munch the ones that make ' + em(T), hint: 'Tip: make 10 first!', say: ['munch_rule_make', T],
          good: function () { return sum(T); }, bad: function () { return sum(near(T, 10, 20, [-2, -1, 1, 2])); } };
      } },
    { id: 'sub20', name: 'Take away to 20', short: 'Subtraction within 20', strand: 'Add & subtract', std: '1.OA.6', grade: '1', sayFact: true,
      levels: ['Teens take away a little', 'Take away across 10'],
      intro: { line: 'skill_sub20', example: '<b>14 − 4</b> makes <b>10</b>' },
      gen: function (L) {
        var T = L ? rnd(3, 9) : rnd(10, 14);
        function diff(d) {
          var a;
          if (d >= 10) { a = rnd(d + 1, Math.min(20, d + 6)); }
          else { a = rnd(Math.max(11, d + 1), Math.min(18, d + 9)); }
          return minus(a, a - d);
        }
        return { text: 'Munch the ones that make ' + em(T), hint: L ? 'Tip: take away to 10 first!' : 'Count back!', say: ['munch_rule_make', T],
          good: function () { return diff(T); }, bad: function () { return diff(near(T, L ? 1 : 8, L ? 11 : 16, [-2, -1, 1, 2])); } };
      } },
    { id: 'wordprob', name: 'Picnic story problems', short: 'Add & subtract word problems (within 10, then 20)', strand: 'Add & subtract', std: '1.OA.1', grade: '1', sayFact: true,
      levels: ['Stories within 10', 'Stories within 20'],
      intro: { line: 'skill_wordprob', example: '3 🍎 + 4 🍎 = <b>7</b> apples' },
      gen: function (L) { return wordProblem(L); } },
    { id: 'evenodd', name: 'Even & odd', short: 'Even and odd numbers', strand: 'Patterns', std: '2.OA.3 (early)', grade: '1–2', sayFact: true,
      levels: ['Numbers to 10', 'Numbers to 20'],
      intro: { line: 'skill_evenodd', example: '2, 4, 6 are even · 1, 3, 5 are odd' },
      gen: function (L) {
        var max = L ? 20 : 10, even = Math.random() < .5;
        function num(par) { var v; do { v = rnd(1, max); } while ((v % 2 === 0) !== par); return v; }
        function mk(v) { return { label: String(v), fact: [v, v % 2 ? 'w_is_odd' : 'w_is_even'] }; }
        return { text: 'Munch the ' + em(even ? 'even' : 'odd') + ' numbers', hint: even ? '2, 4, 6, 8, 10 … they make pairs!' : '1, 3, 5, 7, 9 … one is left over!',
          say: [even ? 'munch_rule_even' : 'munch_rule_odd'],
          good: function () { return mk(num(even)); }, bad: function () { return mk(num(!even)); } };
      } },

    /* ----- designed for later (beyond 20 / 2nd grade). Data only; no generator yet. ----- */
    { id: 'count100', name: 'Counting to 100', short: 'Count, read and write to 120', strand: 'Counting', std: '1.NBT.1', grade: '1', status: 'later', levels: ['To 50', 'To 100', 'To 120'] },
    { id: 'placevalue', name: 'Tens and ones', short: 'Place value to 99', strand: 'Place value', std: '1.NBT.2', grade: '1', status: 'later', levels: ['Tens only', 'Tens and ones'] },
    { id: 'compare100', name: 'Compare to 100', short: '>, =, < with two-digit numbers', strand: 'Place value', std: '1.NBT.3', grade: '1', status: 'later', levels: ['Different tens', 'Same tens'] },
    { id: 'tens', name: '10 more, 10 less', short: 'Add/subtract 10 in your head', strand: 'Place value', std: '1.NBT.5', grade: '1', status: 'later', levels: ['Decade numbers', 'Any two-digit'] },
    { id: 'skip', name: 'Skip counting', short: 'Count by 2s, 5s and 10s', strand: 'Patterns', std: '2.NBT.2', grade: '2', status: 'later', levels: ['By 10s', 'By 5s', 'By 2s'] },
    { id: 'addsub100', name: 'Add & subtract to 100', short: 'Two-digit add/subtract', strand: 'Add & subtract', std: '2.NBT.5', grade: '2', status: 'later', levels: ['No regrouping', 'With regrouping'] }
  ];
  SKILLS.forEach(function (s, i) { s.order = i; if (!s.status) s.status = 'active'; if (!s.subject) s.subject = 'math'; });
  var ACTIVE = SKILLS.filter(function (s) { return s.status === 'active'; });
  var BY = {}; SKILLS.forEach(function (s) { BY[s.id] = s; });

  /* ---------- subjects ----------
     Every skill has a subject. Each subject is its own ladder with its own "current skill" (a track): math uses p.math
     (as before), the others p.tracks[subject]. Free Play / 2 Players / Baseball pick the subject of each round from the
     kid's mix (p.mix: 'mixed' = by age, or one subject id = only that subject). */
  var SUBJECTS = [{ id: 'math', name: 'Math', emoji: '🔢' }, { id: 'reading', name: 'Reading & Words', emoji: '🔤' }, { id: 'concepts', name: 'Early Concepts', emoji: '🎨' }];
  function subjOf(s) { if (typeof s === 'string') s = BY[s]; return (s && s.subject) || 'math'; }   // a skill or a skill id
  function list(subj) { return ACTIVE.filter(function (s) { return subjOf(s) === subj; }); }
  function track(p, subj) {
    if (!subj || subj === 'math') return p.math;
    var t = p.tracks || (p.tracks = {});
    if (!t[subj]) t[subj] = { current: null, rounds: 0, returnTo: null };
    return t[subj];
  }
  function live() { return SUBJECTS.filter(function (x) { return list(x.id).length; }); }
  // the subject mix: 'mixed' -> weights by age band (3 and under: 40% concepts / 30% reading / 30% math; 4: 45/40/15 math/reading/concepts; 5: 50/45/5; 6+ and no age: 60/30/10)
  function mixWeights(p) {
    var m = p.mix || 'mixed', w = {}, have = live().map(function (x) { return x.id; });
    if (m !== 'mixed' && have.indexOf(m) >= 0) { w[m] = 1; return w; }
    // by age band (A.Age): 3 and under the toddler mix; 4 more math & reading; 5 their own (school-ready) mix; 6+ (and no age) mostly math
    var band = A.Age ? A.Age.band(p) : (p.age != null && p.age <= 5 ? 'pre' : 'g1');
    var base = band === 'toddler' || band === 'pre' ? { concepts: .4, reading: .3, math: .3 } : band === 'pk' ? { math: .45, reading: .4, concepts: .15 } : band === 'k' ? { math: .5, reading: .45, concepts: .05 } : { math: .6, reading: .3, concepts: .1 };
    if (p.levels && p.levels.concepts === 'off') base.concepts = 0;   // grown-up setting: Early Concepts off
    if (A.Learn && A.Learn.mixBase) base = A.Learn.mixBase(p, base);   // quality1 (A2): a subject leaves the mix once the child is past it
    var tot = 0; have.forEach(function (id) { w[id] = base[id] || 0; tot += w[id]; });
    if (!tot) { w.math = 1; return w; }
    Object.keys(w).forEach(function (id) { w[id] /= tot; });
    return w;
  }
  // smooth weighted round-robin (deterministic, so the mix comes out right even over a short session)
  function chooseSubject(p) {
    var w = mixWeights(p), c = p.mixCredit || (p.mixCredit = {}), best = null;
    Object.keys(c).forEach(function (k) { if (!(k in w)) delete c[k]; });
    Object.keys(w).forEach(function (k) { c[k] = (c[k] || 0) + w[k]; if (best == null || c[k] > c[best] + 1e-9) best = k; });
    c[best] -= 1;
    return best;
  }

  function blankState() { return { status: 'locked', level: 0, lvN: 0, lvC: 0, pending: false, topPasses: 0, struggles: 0, attempts: 0, correct: 0, hist: [], timeMs: 0, introduced: false, placed: false, last: 0, needsPractice: false, offerTestOut: false }; }

  function ensure(p) {
    p.skills = p.skills || {};
    ACTIVE.forEach(function (s) { if (!p.skills[s.id]) p.skills[s.id] = blankState(); else A.Store && fillState(p.skills[s.id]); });
    if (!p.mix) p.mix = 'mixed';
    if (A.Coach) A.Coach.data(p);   // per-item coaching data (added 2026-10-21; old saves get an empty one)
    live().forEach(function (x) {
      var T = track(p, x.id), L = list(x.id);
      if (!T.current || !BY[T.current] || BY[T.current].status !== 'active' || subjOf(BY[T.current]) !== x.id) T.current = L[0].id;
      var st = p.skills[T.current]; if (st.status === 'locked') st.status = 'open';
    });
    return p;
  }
  function offerPlace(st) { if (st && !st.attempts && !st.placeDone && st.status !== 'mastered') st.placeOffer = true; }
  function fillState(st) { var b = blankState(); for (var k in b) if (!(k in st)) st[k] = b[k]; }
  function state(p, id) { ensure(p); return p.skills[id]; }

  // Start a kid at a given skill: earlier skills count as mastered ("placed" — not earned in-game).
  function place(p, id) {
    ensure(p);
    var L = list(subjOf(BY[id])), idx = L.findIndex(function (s) { return s.id === id; }); if (idx < 0) return;
    L.forEach(function (s, i) {
      var st = p.skills[s.id];
      if (i < idx) { st.status = 'mastered'; st.placed = true; st.level = Math.max(s.levels.length, s.subLevels || 0) - 1; st.introduced = true; }
    });
    var cur = p.skills[id]; if (cur.status !== 'mastered') cur.status = 'open';
    var T = track(p, subjOf(BY[id])); T.current = id; T.returnTo = null;
  }

  // Parent override: practice this skill (and optionally a level) now.
  function setCurrent(p, id, level) {
    var s = BY[id]; if (!s || s.status !== 'active') return;
    var st = state(p, id); if (st.status === 'locked') st.status = 'open';
    if (level != null) st.level = A.clamp(level, 0, Math.max(s.levels.length, s.subLevels || 0) - 1);   // v2p2b: an old two-level skill is one step with sub-levels; keep its level
    var T = track(p, subjOf(s)); T.current = id; T.returnTo = null;
    p.nextSubject = subjOf(s);   // the very next round practices it (then the mix carries on)
  }
  function markMastered(p, id) { if (!BY[id]) return;   // v2p2b: unknown or retired id: ignore
    var st = state(p, id); st.status = 'mastered'; st.introduced = true; st.level = Math.max(BY[id].levels.length, BY[id].subLevels || 0) - 1; st.placed = st.attempts === 0;
    var T = track(p, subjOf(BY[id])), nx = nextSkill(id); if (nx) { var ns = state(p, nx.id); if (ns.status === 'locked') ns.status = 'open'; if (T.current === id && !p.math.pin) T.current = nx.id; }
  }
  function resetSkill(p, id) { var T = track(p, subjOf(BY[id])), L = list(subjOf(BY[id])); p.skills[id] = blankState(); p.skills[id].status = T.current === id ? 'open' : 'locked'; if (L[0] && L[0].id === id) p.skills[id].status = 'open'; }
  // the next / previous skill in the same subject's ladder
  function nextSkill(id) { var L = list(subjOf(BY[id])), i = L.findIndex(function (s) { return s.id === id; }); return i >= 0 ? L[i + 1] || null : null; }
  function prevSkill(id) { var L = list(subjOf(BY[id])), i = L.findIndex(function (s) { return s.id === id; }); return i > 0 ? L[i - 1] : null; }

  // What should the next round be?  The session mix (coach.js): about 65% the current skill, 20% recently mastered skills and
  // 15% older mastered ones (skills with review items due first). The first 2 rounds of a subject warm up on the current skill.
  // A grown-up pin keeps to the current skill. A "test-out" offer (5 fast right answers in a row) makes the next round a 5-question probe.
  // opt.subject: force a subject (else the kid's mix decides)
  function pickRound(p, opt) {
    ensure(p);
    var subj = (opt && opt.subject) || p.nextSubject || chooseSubject(p); p.nextSubject = null;
    if (!list(subj).length) subj = 'math';
    var T = track(p, subj), K = A.Coach;
    var opened = openPendingNextDay(p, T);   // design2: a "mastery pending" skill opens the next one on the NEXT play day
    var cur = T.current, st = p.skills[cur], top = BY[cur].levels.length - 1;
    T.rounds = (T.rounds || 0) + 1;
    // placement check: the first time a newly opened skill comes up, a 5-question "what do you already know?" check (coach.js; only callers that can run it ask: opt.placement)
    if (K && K.wantsPlacement && K.wantsPlacement(p, cur) && opt && opt.placement && !(A.Store && A.Store.data && A.Store.settings.placement === false)) return { skill: BY[cur], level: top, review: false, placement: true, nQ: K.PLACE_N };
    if (st.offerTestOut) { st.offerTestOut = false; return { skill: BY[cur], level: A.clamp(st.level, 0, top), review: false, testOut: true, nOk: 5 }; }
    var mastered = list(subj).filter(function (s) { return (p.skills[s.id].status === 'mastered' || p.skills[s.id].pending) && s.id !== cur; });
    if (!p.math.pin && mastered.length && st.introduced && T.rounds > 2) {
      var have = { recent: [], older: [] };
      mastered.forEach(function (s) { have[K ? K.bucket(p, s.id) : 'recent'].push(s); });
      var slot = K ? K.chooseSlot(p, { recent: have.recent.length > 0, older: have.older.length > 0 }) : (T.rounds % 4 === 0 ? 'recent' : 'current');
      if (slot !== 'current' && have[slot] && have[slot].length) {
        var pool = have[slot], due = K ? pool.filter(function (s) { return K.dueItems(p, s.id).length; }) : [];
        var r = pick(due.length ? due : pool); return { skill: r, level: r.levels.length - 1, review: true, slot: slot };
      }
    }
    var lv = A.clamp(st.level, 0, top), eased = false;
    if (K && lv > 0 && K.winnable(p, cur) < 0) { lv--; eased = true; }   // keep ~75-85% winnable: one easier round, the level itself stays
    return { skill: BY[cur], level: lv, review: false, eased: eased, opened: opened || undefined };
  }
  // design2: strong on the top level with only the separate-days rule left (finishRound marks st.pendDay): the next skill opens
  // at the first round of a later play day, never in the same session
  function openPendingNextDay(p, T) {
    var id = T.current, st = p.skills[id]; if (!st || !st.pendDay || st.pendDay === A.today() || st.pending || st.status === 'mastered' || p.math.pin) return null;
    var nx = nextSkill(id); st.pendDay = null; if (!nx) return null;
    st.pending = true; var ns = state(p, nx.id); if (ns.status === 'locked') ns.status = 'open';
    T.current = nx.id; return nx.id;
  }
  // design2: no fast track on the day a skill is first played (its first session); later days may fast-track a fresh level
  function fastOk(p, id) { var st = state(p, id); return !!st.day0 && st.day0 !== A.today(); }

  // one answer. opt (optional): { key: item id, hint: bool, fast: bool } -> coaching signals from coach.js (or null)
  function recordAnswer(p, id, ok, opt) {
    if (!BY[id] || !p || !p.skills) return null;   // v2p2b: an unknown or retired skill id (old save) is ignored, never a crash
    var st = state(p, id); if (!st) return null; st.attempts++; if (ok) st.correct++; st.last = Date.now();
    if (A.Coach && opt && opt.key != null) return A.Coach.answer(p, id, opt.key, ok, opt);
    return null;
  }

  /* Level-up rule (ux3a, Learning Coach §3): at least 12 answers on the level at 85%+ (and the latest round/board at 80%+).
     Fast track: on a fresh level, 8 of the first 10 right with no hints and quick answers (res.first10 = {n, right, hinted, fast},
     from the game) moves up straight away. */
  // design2 (2026-10-22): 24 answers (was 12) spread over 2+ rounds; no fast track in the skill's first session
  var LEVEL_RULE = { min: 24, rounds: 2, acc: .85, fastRight: 8 };
  // a placed skill is earned in play once the coach's mastery check passes on the kid's own played answers (needs answers in the log)
  function earnedInPlay(p, id) { if (!A.Coach) return false; var lg = (A.Coach.data(p).log || {})[id] || []; return lg.length > 0 && A.Coach.ready(p, id).ok; }
  // Coach.ready said "not yet" only because of the separate-days requirement
  function daysOnly(rd) { return !!(rd && rd.why && rd.why.length) && rd.why.every(function (w) { return /separate days|right on \d+ days/.test(w); }); }
  // Call when a round ends. Returns {say:[parts], events:{...}}
  function finishRound(p, round, res) {
    var s = round.skill, st = state(p, s.id), top = s.levels.length - 1, T = track(p, subjOf(s));
    var tot = res.correct + res.wrong, acc = tot ? res.correct / tot : 1;
    st.hist.push({ t: Date.now(), c: res.correct, w: res.wrong, l: round.level, r: round.review ? 1 : 0, ms: res.ms || 0 });
    if (st.hist.length > 60) st.hist = st.hist.slice(-60);
    st.timeMs += res.ms || 0; st.introduced = true; if (!st.day0) st.day0 = A.today();
    var ev = { acc: acc }, say;
    if (round.review) {
      if (acc >= .8) {
        if (st.pending && st.status !== 'mastered' && (!A.Coach || A.Coach.ready(p, s.id).ok)) { st.pending = false; st.status = 'mastered'; st.placed = false; st.level = top; ev.mastered = s.id; return { say: ['fb_mastered'], events: ev }; }
        // a placed skill (age start / warm-up skip) the kid then proves in PLAYED spaced reviews (coach.js ready(): accuracy over enough
        // answers on separate days; warm-up answers are not in that log) counts as earned from now on: friends come from played mastery
        if (st.placed && st.status === 'mastered' && earnedInPlay(p, s.id)) { st.placed = false; st.earnedBy = 'review'; ev.mastered = s.id; return { say: ['fb_mastered'], events: ev }; }
        return { say: ['fb_review_good'], events: ev };
      }
      if (st.pending) return { say: ['fb_keep_going'], events: ev };   // a pending skill just stays in review
      // a failed spaced review reopens the skill: "needs practice" at its top level, practiced next, then back to the current skill
      // quality1 (A3): one slip lowers the items' boxes (recordAnswer did that) but never reopens the skill; 2 reviews in a row under 70% do
      if (st.status === 'mastered' && A.Learn && A.Learn.softSlip(p, s.id, acc)) { ev.slip = s.id; return { say: ['fb_keep_going'], events: ev }; }
      if (st.status === 'mastered') {
        st.status = 'open'; st.needsPractice = true; st.topPasses = 0; st.level = top; ev.reopened = s.id;
        if (!p.math.pin && T.current !== s.id) { T.returnTo = T.returnTo || T.current; T.current = s.id; }
      }
      return { say: ['fb_keep_going'], events: ev };
    }
    if (round.testOut) {   // 5-question test-out probe: all right, no hint -> skip the level, or (at the top level) the whole skill
      ev.testOut = true;
      if (res.correct >= 5 && !res.wrong && !res.hinted) {
        if (A.Coach) A.Coach.bumpItems(p, s.id, 3);
        if (st.level < top) { st.level++; st.topPasses = 0; ev.levelUp = true; ev.testedOut = 'level'; return { say: ['fb_level_up', 'fb_trickier'], events: ev }; }
        ev.testedOut = 'skill'; st.topPasses = 2; st.needsPractice = false;
        st.status = 'mastered'; st.placed = false; st.testedOut = true; ev.mastered = s.id;
        var tn = nextSkill(s.id);
        if (tn && !p.math.pin) { var ts = state(p, tn.id); if (ts.status === 'locked') ts.status = 'open'; T.current = tn.id; ev.newSkill = tn.id; offerPlace(ts); }
        return { say: ['fb_mastered'], events: ev };
      }
      // otherwise: scored like a normal round below
    }
    if (res.timedOut) { // the timer ran out: slow-but-accurate is never punished
      ev.timedOut = true; ev.frac = res.frac;
      if (acc >= .8 && (res.frac || 0) < .75) { st.struggles = 0; return { say: ['fb_careful'], events: ev }; } // same level again (and the game adds time)
      // otherwise: >= 75% munched and accurate counts like a finished round; low accuracy uses the normal rules below
    }
    if (acc < .8 || res.gaveUp) st.topPasses = 0;   // the pass streak resets on any weak round
    // level evidence (ux3a): answers on the kid's own level add up across rounds/boards; reset whenever the level changes
    if (st.lvL !== st.level || st.lvS !== s.id) { st.lvL = st.level; st.lvS = s.id; st.lvN = 0; st.lvC = 0; st.lvR = 0; }
    var fresh = !st.lvN, onLevel = round.level === st.level && !round.eased;
    if (onLevel) { st.lvN += tot; st.lvC += res.correct; if (tot) st.lvR = (st.lvR || 0) + 1; }
    var evidence = onLevel && st.lvN >= LEVEL_RULE.min && (st.lvR || 0) >= LEVEL_RULE.rounds && st.lvC / st.lvN >= LEVEL_RULE.acc && acc >= .8;
    var f10 = res.first10, fast = onLevel && (fresh || (A.Learn && st.lvN <= 2 * tot)) && !!f10 && f10.n >= 10 && f10.right >= LEVEL_RULE.fastRight && !f10.hinted && !!f10.fast && fastOk(p, s.id);
    if (fast) ev.fastTrack = true;
    var earned = evidence || fast;
    if (res.gaveUp) { // ran out of hearts: design2: only the 2nd Snack break in a row drops a level
      st.breaks = (st.breaks || 0) + 1;
      if (st.breaks >= 2) { st.breaks = 0; if (st.level > 0) { st.level--; ev.levelDown = true; } else st.struggles++; }
      else ev.snackBreak = 1;
    } else if (acc >= .8) {
      st.breaks = 0;
      st.struggles = 0;
      if (st.needsPractice && st.level >= top) { st.needsPractice = false; st.status = 'mastered'; ev.remastered = s.id; if (st.placed && earnedInPlay(p, s.id)) { st.placed = false; st.earnedBy = 'practice'; } }
      if (T.returnTo && T.returnTo !== s.id) { // back from a confidence-building detour
        T.current = T.returnTo; T.returnTo = null; ev.back = true; say = ['fb_back_now'];
      } else if (st.level < top) { if (earned) { st.level++; ev.levelUp = true; say = ['fb_level_up', 'fb_trickier']; } else say = ['fb_one_more']; }
      else {
        if (earned) st.topPasses = Math.max(st.topPasses + 1, 2); else st.topPasses = Math.min(st.topPasses + 1, 1);
        var rd = A.Coach ? A.Coach.ready(p, s.id) : { ok: true };
        if (st.status !== 'mastered' && st.topPasses >= 2 && !rd.ok && daysOnly(rd) && !st.pending && nextSkill(s.id) && !p.math.pin) {
          // strong on the top level and only the separate-days rule says "not yet": open the next skill now (mastery pending),
          // this one stays in the review slots until its days are met (then it is mastered from a review round)
          // design2: not in the same session: mark the day; pickRound opens the next skill on a later play day
          if (!st.pendDay) st.pendDay = A.today();
          ev.notYet = rd.why; ev.pendingNextDay = s.id; say = ['fb_great_job'];
        }
        else if (st.status !== 'mastered' && st.topPasses >= 2 && !rd.ok) { ev.notYet = rd.why; say = ['fb_great_job']; }   // strong rounds, but not enough items / days yet
        else if (st.status !== 'mastered' && st.topPasses >= 2) {
          st.status = 'mastered'; st.placed = false; st.pending = false; ev.mastered = s.id;
          var nx = nextSkill(s.id);
          if (nx && !p.math.pin) {
            var ns = state(p, nx.id); if (ns.status === 'locked') ns.status = 'open';
            T.current = nx.id; ev.newSkill = nx.id; offerPlace(ns); say = ['fb_mastered'];
          } else if (nx) { var ns2 = state(p, nx.id); if (ns2.status === 'locked') ns2.status = 'open'; say = ['fb_mastered']; }
          else say = [subjOf(s) === 'math' ? 'fb_champion' : 'fb_star_learner'];
        } else if (st.status === 'mastered') {
          var n2 = nextSkill(s.id);
          if (n2 && !p.math.pin) { var s2 = state(p, n2.id); if (s2.status === 'locked') s2.status = 'open'; T.current = n2.id; if (!s2.introduced) ev.newSkill = n2.id; say = ['fb_great_job']; }
          else say = n2 ? ['fb_great_job'] : [subjOf(s) === 'math' ? 'fb_champion' : 'fb_star_learner'];
        } else say = ['fb_one_more'];
      }
    } else if (acc >= .55) { st.breaks = 0; st.struggles = 0; say = ['fb_practice_again']; }
    else {
      st.breaks = 0;
      if (st.level > 0) { st.level--; ev.levelDown = true; say = ['fb_easier']; }
      else st.struggles++;
    }
    if (!say) {
      var pv = prevSkill(s.id);
      if (st.struggles >= 2 && pv && !p.math.pin) {
        st.struggles = 0; T.returnTo = s.id; T.current = pv.id;
        var ps = state(p, pv.id); ps.level = Math.max(pv.levels.length, pv.subLevels || 0) - 1; if (ps.status === 'locked') ps.status = 'open';
        ev.detour = pv.id; say = ['fb_detour'];
      } else say = ev.levelDown ? ['fb_easier'] : ['fb_practice_more'];
    }
    return { say: say, events: ev };
  }

  // Dashboard helpers
  function summary(p, id) {
    var s = BY[id];
    if (s.status !== 'active') return { label: 'Later', cls: 'later' };
    var st = state(p, id);
    var recent = st.hist.slice(-8).map(function (h) { var t = h.c + h.w; return t ? h.c / t : 1; });
    // status: Learning (below the top level) / Practicing (top level, building up items and days) / Mastered / Needs review
    var K = A.Coach, top = s.levels.length - 1;
    var label = st.needsPractice ? 'Needs review' : st.status === 'mastered' ? (st.placed ? 'Mastered (placed)' : st.testedOut ? 'Mastered (tested out)' : 'Mastered') : st.attempts > 0 ? (st.level < top ? 'Learning' : 'Practicing') : 'Not started';
    var cls = st.needsPractice ? 'review' : st.status === 'mastered' ? 'mastered' : st.attempts > 0 ? (st.level < top ? 'learning' : 'practicing') : 'none';
    var acc = st.attempts ? st.correct / st.attempts : null;
    var trend = null;
    if (recent.length >= 4) { var h = Math.floor(recent.length / 2); var a1 = avg(recent.slice(0, h)), a2 = avg(recent.slice(h)); trend = a2 - a1 > .07 ? 'up' : a1 - a2 > .07 ? 'down' : 'flat'; }
    return { label: label, cls: cls, acc: acc, recent: recent, trend: trend, level: st.level, levels: s.levels.length, attempts: st.attempts, timeMs: st.timeMs, rounds: st.hist.length, current: track(p, subjOf(s)).current === id,
      missed: K ? K.mostMissed(p, id, 3) : [], lastPracticed: (K && K.lastSeen(p, id)) || st.last || null, nextReview: K ? K.nextDue(p, id) : null, ready: K && st.attempts ? K.ready(p, id) : null, rule: K ? K.rule(id).label : '' };
  }
  function avg(a) { return a.reduce(function (x, y) { return x + y; }, 0) / (a.length || 1); }

  /* Plug-in point for new skills (any subject). A skill is
       { id, name, short, strand, grade, levels: ['Level 1 name', 'Level 2 name'], status: 'active', sayFact: bool,
         intro: { line: voiceLineId, example: html },
         gen: function (level) -> { text: rule html, hint: html, say: [voice parts], good: () => cell, bad: () => cell } }
     and a cell is { label: plain text, html: optional rich HTML (emoji, <svg> picture, color swatch, shape…), fact: [voice parts],
     long: bool (smaller font) }. Correctness is decided by the generator: good() cells are right, bad() cells are wrong.
     register() adds it to the adaptive order (after `after`, default: the end) so Free Play, 2 Players and the story map can use it. */
  function register(skill, after) {
    if (BY[skill.id]) return BY[skill.id];
    skill.status = skill.status || 'active'; skill.subject = skill.subject || 'math'; skill.order = SKILLS.length; BY[skill.id] = skill; SKILLS.push(skill);
    if (skill.status === 'active') { var at = after ? ACTIVE.findIndex(function (s) { return s.id === after; }) + 1 : ACTIVE.length; ACTIVE.splice(at > 0 ? at : ACTIVE.length, 0, skill); }
    return skill;
  }
  A.Curriculum = {
    register: register, wordProblem: wordProblem, pet: pet, PET_EMOJI: PET_EMOJI, SUBJECTS: SUBJECTS, subjectOf: subjOf, list: list, track: track, mixWeights: mixWeights, chooseSubject: chooseSubject,
    current: function (p, subj) { ensure(p); return BY[track(p, subj || 'math').current]; },
    SKILLS: SKILLS, ACTIVE: ACTIVE, byId: BY, frame: frame,
    ensure: ensure, state: state, place: place, setCurrent: setCurrent, markMastered: markMastered, resetSkill: resetSkill,
    pickRound: pickRound, recordAnswer: recordAnswer, finishRound: finishRound, LEVEL_RULE: LEVEL_RULE, fastOk: fastOk, openPendingNextDay: openPendingNextDay, daysOnly: daysOnly, summary: summary, nextSkill: nextSkill, prevSkill: prevSkill,
    // (math stickers: these count math skills; subj gives another subject)
    masteredCount: function (p, subj) { ensure(p); return list(subj || 'math').filter(function (s) { return p.skills[s.id].status === 'mastered' && !p.skills[s.id].placed; }).length; },
    masteredAll: function (p, subj) { ensure(p); return list(subj || 'math').every(function (s) { return p.skills[s.id].status === 'mastered'; }); }
  };
})(window.Arcade);
