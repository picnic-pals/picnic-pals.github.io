/* Picnic Pals v2 Phase 2a — step ladders (Learning Coach phase2-spec.md §0-3, §5).
   A "step" is a small one-level skill registered with A.Curriculum.register, so Munch, Baseball, bonus questions, the story
   map and the coach all work with it. Steps are grouped into LADDERS (A.Steps.ladder(def)); a topic ladder (spec §4, part b)
   plugs in the same way: { id, subject, band, after, groups, steps: [{ id, name, item() | facts() }] }.
   Rules here are general (by age band and by the kid's own answers), never by name:
   - §0.1 mastery: 12+ answers at 85%+ (a right answer after a hint counts half) on 2+ different days.
   - §0.2 warm-up probe when a ladder first opens (about 6 picks, stops at the first miss), in-step fast-skip (5 fast first-try
     right answers in a row; E 6 s, P 8 s; toddlers no skip), a 3-day check for placed steps (a miss reopens it for 2 short
     rounds), boredom guard (no 3rd round of the same step in a row when another subject can play), frustration guard (3 misses
     in 5: one 4-item round one step back, then return), gentle step-down after 2 weak rounds in a row.
   - §3 hints after a miss (strategy first, then to the answer), worked example after 3 misses in a row, missed-facts list with
     spaced review (next session, 1, 3, 7, 14 days; graduates after first-try right on 3 days), sprinkled into rounds (<= 30%).
   Old saves: migrated once in Curriculum.ensure (p.math.v2p2 = 1); the save schema stays 4. Load after skills-grade1.js. */
(function (A) {
  'use strict';
  var C = A.Curriculum, K = A.Coach; if (!C || !K || C.byId.a_dbl) return;
  var rnd = A.rnd, pick = A.pick, DAY = 864e5, BOX = '<span class="box">?</span>';
  function em(t) { return '<b class="hl">' + t + '</b>'; }
  function now() { return K.now(); }
  function uniq(a) { var o = []; a.forEach(function (x) { if (o.indexOf(x) < 0) o.push(x); }); return o; }

  /* ---------- pictures ---------- */
  // a ten-frame (n cells, default 10). o: { on, b (2nd colour, after on), x (crossed out, the LAST x of the dots), g (empty spots outlined) }
  function tf(o, cells) {
    cells = cells || 10; var h = '<span class="frame st-f' + (cells === 5 ? ' five' : '') + '">', on = o.on || 0, b = o.b || 0, x = o.x || 0;
    for (var i = 0; i < cells; i++) {
      var c = i < on ? 'on' : i < on + b ? 'on b' : o.g && i < on + b + o.g ? 'g' : '';
      if (x && i < on + b && i >= on + b - x) c += ' x';
      h += '<i class="' + c + '"></i>';
    }
    return h + '</span>';
  }
  function tens(n, o) { o = o || {}; var h = '<span class="st-tens">', full = Math.floor(n / 10), rest = n % 10; for (var i = 0; i < full; i++) h += tf({ on: 10, x: o.xTen && i === full - 1 ? 10 : 0 }); if (rest || !full) h += tf({ on: rest, x: o.xOnes || 0, g: o.g || 0 }); return h + '</span>'; }
  var FOODS = ['🍎', '🍓', '🫐', '🥕', '🍪', '🧁', '🍌', '🍇'];
  function objs(n, e) { var h = '<span class="st-objs">'; for (var i = 0; i < n; i++) h += (i && i % 5 === 0 ? '<br>' : '') + '<i>' + e + '</i>'; return h + '</span>'; }
  function plate(m) { var h = '<span class="st-plate" aria-hidden="true">'; for (var i = 0; i < m; i++) h += '<i></i>'; return h + '</span>'; }
  function track(nums) { return '<span class="st-track">' + nums.map(function (v) { return v == null ? '<b class="q">?</b>' : '<b>' + v + '</b>'; }).join('') + '</span>'; }
  // number line lo..hi; o: { st: start, hops: [[from, to], ...], end: show landing }
  function nline(lo, hi, o) {
    var h = '<span class="st-line">';
    for (var v = lo; v <= hi; v++) { var c = v === o.st ? 'st' : ''; (o.hops || []).forEach(function (hp) { var a = Math.min(hp[0], hp[1]), b = Math.max(hp[0], hp[1]); if (v > a && v < b || (v === hp[1] && v !== o.ans)) c += ' hop'; }); if (o.end && v === o.ans) c += ' end'; if (o.mark && o.mark.indexOf(v) >= 0) c += ' mk'; h += '<span class="' + c + '">' + (o.blank && v === o.ans && !o.end ? '?' : v) + '</span>'; }
    return h + '</span>';
  }
  function box(inner, p) { return '<div class="st-hint">' + inner + (p ? '<p>' + p + '</p>' : '') + '</div>'; }

  /* ---------- facts (E band) ---------- */
  function F(a, op, b) { var v = op === '+' ? a + b : a - b; return { a: a, b: b, op: op, v: v, label: a + (op === '+' ? ' + ' : ' − ') + b }; }
  function parseFact(s) { var m = /^(\d+) ([+−]) (\d+)$/.exec(String(s)); return m ? F(+m[1], m[2] === '+' ? '+' : '-', +m[3]) : null; }
  function both(a, b) { return a === b ? [F(a, '+', b)] : [F(a, '+', b), F(b, '+', a)]; }
  function range(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }
  var FAM = {
    a_dbl: function () { return range(1, 10).map(function (n) { return F(n, '+', n); }); },
    a_ndbl: function () { return [].concat.apply([], range(2, 9).map(function (n) { return both(n, n + 1); })); },
    a_ten: function () { return [].concat.apply([], range(1, 10).map(function (n) { return both(10, n); })); },
    s_teen1: function () { return range(1, 9).map(function (k) { return F(10 + k, '-', k); }); },
    s_teen10: function () { return range(1, 10).map(function (k) { return F(10 + k, '-', 10); }); },
    s_10: function () { return range(1, 9).map(function (n) { return F(10, '-', n); }); },
    a_9: function () { return [].concat.apply([], range(2, 9).map(function (n) { return both(9, n); })); },
    a_8: function () { return [].concat.apply([], range(3, 9).map(function (n) { return both(8, n); })); },
    s_noX: function () { var o = []; range(12, 19).forEach(function (a) { for (var b = 1; b < a - 10; b++) o.push(F(a, '-', b)); }); return o; },
    a_mk10: function () { var o = []; range(2, 9).forEach(function (a) { range(2, 9).forEach(function (b) { if (a !== b && a + b > 10) o.push(F(a, '+', b)); }); }); return o; },
    s_split: function () { var o = []; range(11, 18).forEach(function (a) { range(2, 9).forEach(function (b) { if (a - b < 10 && a - b > 0) o.push(F(a, '-', b)); }); }); return o; },
    s_think: function () { return FAM.s_split(); },
    a_mix: function () { var o = []; range(1, 10).forEach(function (a) { range(1, 10).forEach(function (b) { o.push(F(a, '+', b)); }); }); return o; },
    s_mix: function () { var o = []; range(2, 20).forEach(function (a) { range(1, 10).forEach(function (b) { if (b <= a && a - b <= 10) o.push(F(a, '-', b)); }); }); return o; }
  };
  // which strategy a fact's hint shows
  function modeOf(f, sid) {
    if (sid === 's_think') return 'think';
    if (f.op === '+') { if (f.a === f.b) return 'dbl'; if (Math.abs(f.a - f.b) === 1 && f.v > 4) return 'ndbl'; if (f.a === 10 || f.b === 10) return 'ten'; if (f.v > 10) return 'mk10'; return 'count'; }
    if (f.a > 10 && f.b === f.a - 10) return 'teen1'; if (f.b === 10 && f.a > 10) return 'teen10'; if (f.a === 10) return 'tenminus';
    if (f.a > 10 && f.v >= 10) return 'noX'; if (f.a > 10) return 'split'; return 'cback';
  }
  /* v2p2b: the hint on a board always lands on the board's target T (never on the missed cell's own value):
     a target fact that uses the same strategy as the miss, else a target fact (doubles / ten first), else a ten-frame 10 + (T - 10) */
  function hintFact(mf, goods, T, sid) {
    if (mf && mf.v === T) return mf;
    var mm = mf ? modeOf(mf, sid) : null, same = goods.filter(function (g) { return modeOf(g, sid) === mm; });
    if (same.length) return same[0];
    var ORD = ['dbl', 'ten', 'mk10', 'ndbl', 'teen10', 'teen1', 'tenminus', 'noX', 'split', 'think', 'count', 'cback'];
    if (goods.length) return goods.slice().sort(function (a, b) { return ORD.indexOf(modeOf(a, sid)) - ORD.indexOf(modeOf(b, sid)); })[0];   // the step's own strategy (its facts share it)
    var op = (mf || {}).op || '+';
    return op === '+' && sid !== 's_think' && T > 10 && T <= 20 ? F(10, '+', T - 10) : mf;
  }
  /* the hint for one fact. lvl 1 = the strategy (never the answer, no answer tile lit); lvl 2 = the strategy all the way to the answer */
  function factHint(f, lvl, sid) {
    var m = modeOf(f, sid), A2 = lvl >= 2, v = f.v;
    switch (m) {
      case 'dbl': return box('<span class="st-rows">' + tf({ on: f.a }) + tf({ on: 0, b: f.a }) + '</span>', A2 ? f.a + ' and ' + f.a + ' make <b>' + v + '</b>.' : 'Two rows of ' + f.a + '. Count both rows!');
      case 'ndbl': { var s = Math.min(f.a, f.b); return box('<span class="st-rows">' + tf({ on: s }) + tf({ on: 0, b: s + 1 }) + '</span>', s + ' + ' + s + ' is ' + (2 * s) + '. One more is ' + (A2 ? '<b>' + v + '</b>.' : '…?')); }
      case 'ten': { var n = f.a === 10 ? f.b : f.a; return box(tf({ on: 10 }) + ' ' + tf({ on: 0, b: n }), 'Ten and ' + n + ' is ' + (A2 ? '<b>' + v + '</b>.' : '…?')); }
      case 'mk10': { var big = Math.max(f.a, f.b), sm = Math.min(f.a, f.b), need = 10 - big;
        return box(A2 ? tf({ on: big, b: need }) + ' ' + tf({ on: 0, b: sm - need }) : tf({ on: big, g: need }) + ' ' + tf({ on: 0, b: sm }),
          A2 ? 'Watch: ' + big + ' and ' + need + ' make 10, and ' + (sm - need) + ' more is <b>' + v + '</b>.' : 'Move ' + need + ' dot' + (need > 1 ? 's' : '') + ' to fill the 10. How many are left over?'); }
      case 'teen1': return box(tf({ on: 10 }) + ' ' + tf({ on: f.b, x: f.b }), A2 ? 'The full ten is left: <b>10</b>.' : 'Cross out the loose dots. What is left?');
      case 'teen10': return box(tf({ on: 10, x: 10 }) + ' ' + tf({ on: f.a - 10 }), A2 ? 'Take away the ten: <b>' + v + '</b> left.' : 'Take away the whole ten-frame. What is left?');
      case 'tenminus': return box(tf({ on: 10, x: f.b }), A2 ? '10 take away ' + f.b + ' leaves <b>' + v + '</b>.' : 'Cross out ' + f.b + '. How many are not crossed out?');
      case 'noX': return box(tf({ on: 10 }) + ' ' + tf({ on: f.a - 10, x: f.b }), A2 ? '10 and ' + (f.a - 10 - f.b) + ' is <b>' + v + '</b>.' : 'Cross out ' + f.b + ' from the loose dots. The ten stays!');
      case 'split': { var h1 = f.a - 10, h2 = f.b - h1;
        return box(nline(Math.max(0, v - 1), f.a, { st: f.a, hops: [[f.a, 10], [10, v]], ans: v, end: A2, blank: !A2, mark: [10] }),
          A2 ? f.a + ' − ' + h1 + ' is 10, then − ' + h2 + ' is <b>' + v + '</b>.' : 'Hop ' + h1 + ' back to 10, then hop ' + h2 + ' more.'); }
      case 'think': return box('<p class="st-big">' + f.b + ' + ' + (A2 ? '<b>' + v + '</b>' : BOX) + ' = ' + f.a + '</p>', A2 ? f.b + ' and <b>' + v + '</b> make ' + f.a + ', so ' + f.label + ' = <b>' + v + '</b>.' : f.label + ' is the same as: ' + f.b + ' + what makes ' + f.a + '?');
      case 'count': return box(tf({ on: f.a }) + ' ' + tf({ on: 0, b: f.b }), A2 ? 'All together: <b>' + v + '</b>.' : 'Count all the dots.');
      default: return box(tens(f.a, { xOnes: Math.min(f.b, f.a % 10 || f.b) }), A2 ? f.label + ' = <b>' + v + '</b>' : 'Cross out ' + f.b + ' and count what is left.');
    }
  }

  /* ---------- items (P band): one question, one answer value ---------- */
  function within(vals, lo, hi, ans) { return uniq(vals.filter(function (v) { return v >= lo && v <= hi && v !== ans; })); }
  function numCell(v, o) { o = o || {}; return { label: String(v), html: o.dots && v <= 10 && Math.random() < .4 ? '<span class="st-numdot">' + v + tf({ on: v }, v > 5 ? 10 : 5) + '</span>' : null, fact: ['w_thats', v] }; }
  function cntItem(lo, hi, how) {
    var n = rnd(lo, hi), e = pick(FOODS), pic = how === 'tens' ? tens(n) : objs(n, e);
    return { key: 'cnt' + n, ans: n, wrong: within([n - 1, n + 1, n - 2, n + 2, n > 20 ? n - 10 : n + 10].concat(n > 10 ? [n - 10] : []), Math.max(1, lo - 2), hi + 2, n).slice(0, 5),
      text: 'How many?', pic: pic, say: ['st_how_many'], cell: function (v) { return numCell(v, { dots: how !== 'tens' }); },
      hint: function (l) { return how === 'tens' ? box(tens(n), l >= 2 ? Math.floor(n / 10) * 10 + ' and ' + (n % 10) + ' more is <b>' + n + '</b>.' : 'Count the full tens: 10, 20… then the rest.') : box(n > 10 ? tens(n) : tf({ on: n }), l >= 2 ? 'Count them: … <b>' + n + '</b>!' : 'Touch each one and count.'); } };
  }
  var LOOK = { 12: [21], 21: [12], 13: [31], 6: [9], 9: [6], 16: [19, 61], 19: [16], 17: [71], 15: [51], 14: [41], 18: [81], 11: [17], 10: [1] };
  function findItem(lo, hi) {
    var n = rnd(lo, hi), rv = +String(n).split('').reverse().join(''), w = [n - 1, n + 1].concat(LOOK[n] || []);
    if (rv !== n && rv > 9 && Math.random() < .25) w.push(rv); else w = w.filter(function (v) { return v !== rv || v < 10; });   // the reversal at most 1 in 4 items
    w = within(w.concat([n + 2, n - 2]), 1, 99, n);
    return { key: 'find' + n, ans: n, wrong: w, text: 'Find ' + em(n), say: ['st_find', n], cell: function (v) { return numCell(v); },
      hint: function (l) { return box(tens(n), l >= 2 ? Math.floor(n / 10) + ' ten' + (n >= 20 ? 's' : '') + ' and ' + (n % 10) + ': <b>' + n + '</b>' : n > 9 ? 'Look at the first number: how many tens?' : 'Count the dots.'); } };
  }
  function seqItem(lo, hi, kind, edge) {
    var gap = kind === 'next' ? 3 : kind === 'before' ? 0 : 1, s;
    if (edge && Math.random() < .4) { var e = pick([19, 20, 21, 29, 30]); s = e - gap; } else s = rnd(lo, hi - 2);
    s = Math.max(lo, Math.min(hi - 2 - (kind === 'next' ? 1 : 0), s)); if (kind === 'next' && s + 3 > hi) s = hi - 3;
    var nums = kind === 'next' ? [s, s + 1, s + 2, null] : kind === 'before' ? [null, s + 1, s + 2] : [s, null, s + 2], ans = kind === 'next' ? s + 3 : kind === 'before' ? s : s + 1;
    if (ans < 1) return seqItem(lo, hi, kind, edge);
    var shown = nums.filter(function (v) { return v != null; }), w = within(kind === 'next' ? [ans + 1, ans - 2, ans - 1] : [ans + 1, ans - 1, ans + 2, ans - 2], 0, hi + 2, ans).filter(function (v) { return v >= 1; });
    if (kind === 'next') w = within([ans + 1, ans - 2].concat(w), 1, hi + 2, ans);
    return { key: kind + ans, ans: ans, wrong: w, text: (kind === 'next' ? 'What comes next?' : kind === 'before' ? 'What comes before?' : 'Which number is missing?'), pic: track(nums),
      say: [kind === 'next' ? 'st_what_next' : kind === 'before' ? 'st_what_before' : 'st_whats_missing'].concat(shown.slice(0, 0)),
      cell: function (v) { return numCell(v); },
      hint: function (l) { var lo2 = Math.max(0, Math.min.apply(null, shown) - 2), hi2 = Math.max.apply(null, shown) + 2; return box(nline(lo2, hi2, { ans: ans, end: l >= 2, blank: true, mark: shown }), l >= 2 ? 'Say them in order: … <b>' + ans + '</b>!' : 'Say the numbers in order on the number line.'); } };
  }
  function moreLess(sign, hi, dotsFirst, st) {
    var dots = dotsFirst && (!st || (st.attempts || 0) < 12 || Math.random() < .3), n = dots ? rnd(sign > 0 ? 1 : 2, sign > 0 ? 9 : 10) : rnd(sign > 0 ? 1 : 2, sign > 0 ? hi - 1 : hi), ans = n + sign, e = pick(FOODS);
    var w = within([n, ans + sign, ans - sign], 0, hi + 1, ans);
    var text = dots ? (sign > 0 ? 'One more comes! How many now?' : 'Jammy eats one. How many now?') : 'What is one ' + (sign > 0 ? 'more' : 'less') + ' than ' + em(n) + '?';
    return { key: (sign > 0 ? 'more' : 'less') + n + (dots ? 'd' : ''), ans: ans, wrong: w, text: text,
      pic: dots ? (sign > 0 ? tf({ on: n, g: 1 }) : objs(n, e)) : null, say: dots ? [n, sign > 0 ? 'st_one_more' : 'st_one_less'] : [sign > 0 ? 'st_one_more_than' : 'st_one_less_than', n],
      cell: function (v) { return numCell(v, { dots: dots }); },
      hint: function (l) { return dots ? box(sign > 0 ? tf({ on: n, b: 1 }) : tf({ on: n, x: 1 }), l >= 2 ? 'Count them: <b>' + ans + '</b>.' : sign > 0 ? 'Count the dots, then one more.' : 'One is gone. Count the ones that are left.')
        : box(nline(Math.max(0, n - 3), n + 3, { st: n, ans: ans, end: l >= 2, blank: false, hops: l >= 2 ? [[n, ans]] : [] }), l >= 2 ? 'One hop ' + (sign > 0 ? 'up' : 'back') + ' from ' + n + ': <b>' + ans + '</b>.' : 'Find ' + n + ' on the number line. Hop one ' + (sign > 0 ? 'up' : 'back') + '.'); } };
  }
  function compareItem(st) {
    var nums = (st && (st.attempts || 0) >= 12 && Math.random() < .5), a, b, same = !nums && Math.random() < .2;
    if (nums) { a = rnd(1, 20); do { b = rnd(1, 20); } while (b === a); }
    else { a = rnd(1, 10); b = same ? a : rnd(1, 10); if (!same && a === b) b = a < 10 ? a + 1 : a - 1; }
    var e = pick(FOODS), ans = a === b ? 'same' : a > b ? 'L' : 'R';
    function cell(k) { if (k === 'same') return { label: 'the same', html: '<span class="st-same">= same</span>', fact: ['st_same'] }; var v = k === 'L' ? a : b; return nums ? { label: String(v), fact: ['w_thats', v] } : { label: v + ' ' + (k === 'L' ? 'left' : 'right'), html: objs(v, e), fact: ['w_thats', v] }; }
    return { key: (nums ? 'big' : 'more') + Math.min(a, b) + 'v' + Math.max(a, b), ans: ans, wrong: ans === 'same' ? ['L', 'R'] : [ans === 'L' ? 'R' : 'L'].concat(nums ? [] : ['same']),
      text: nums ? 'Which number is bigger?' : 'Which has more?', say: [nums ? 'st_bigger' : 'st_which_more'], cell: cell, two: true,
      hint: function (l) { return nums ? box(nline(Math.max(0, Math.min(a, b) - 1), Math.max(a, b) + 1, { mark: [a, b], ans: Math.max(a, b), end: l >= 2 }), l >= 2 ? '<b>' + Math.max(a, b) + '</b> is further along the line.' : 'The bigger number is further along the number line.')
        : box('<span class="st-rows">' + tf({ on: a }) + tf({ on: 0, b: b }) + '</span>', l >= 2 ? (a === b ? 'They are the <b>same</b>!' : 'The row with more dots: <b>' + Math.max(a, b) + '</b>.') : 'Put them in rows and look which row is longer.'); } };
  }
  // make 5 (pictures only: no + sign, no equations, no numerals)
  var WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six'];
  function make5Item() {
    if (Math.random() < .6) {
      var k = rnd(1, 4), ans = 5 - k;
      return { key: 'fill' + k, ans: ans, wrong: within([ans - 1, ans + 1, ans + 2], 1, 5, ans), text: 'How many more to fill it?', pic: tf({ on: k }, 5), say: ['st_fill5'], pictures: true,
        cell: function (v) { return { label: WORDS[v] + ' dot' + (v === 1 ? '' : 's'), html: plate(v), fact: [] }; },
        hint: function (l) { return box(l >= 2 ? tf({ on: k, b: ans }, 5) : tf({ on: k, g: ans }, 5), l >= 2 ? 'Fill the empty spots!' : 'Look at the empty spots.'); } };
    }
    var m = rnd(1, 4), pairs = [[m, 5 - m]], g = 0;
    while (pairs.length < 4 && g++ < 50) { var x = rnd(1, 4), y = rnd(1, 4); if (x + y !== 5 && x + y >= 3 && !pairs.some(function (q) { return q[0] === x && q[1] === y; })) pairs.push([x, y]); }
    var key = function (q) { return q[0] + '|' + q[1]; };
    return { key: 'two' + Math.min(m, 5 - m), ans: key(pairs[0]), wrong: pairs.slice(1).map(key), text: 'Which two plates make five dots?', say: ['st_two_make5'], pictures: true,
      cell: function (k2) { var q = k2.split('|').map(Number); return { label: WORDS[q[0]] + ' and ' + WORDS[q[1]] + ' dots', html: '<span class="st-pair">' + plate(q[0]) + plate(q[1]) + '</span>', fact: [], long: true }; },
      hint: function (l) { return box(l >= 2 ? tf({ on: m, b: 5 - m }, 5) : tf({ on: 0, g: 5 }, 5), l >= 2 ? 'These two plates fill the five-frame!' : 'Five dots fill the five-frame. Imagine both plates in it.'); } };
  }

  // T band (2-3): count 1-3, then 1-5. Big objects the kid can tap to count (each tap says the number); the choices are plates
  // of dots with the numeral, so no reading is needed. 2 choices, no timer (Gentle Munch at these ages), no fast-skip.
  var BIG = ['🍎', '🍓', '🍌', '🥕', '🐶', '🐱', '🦆', '🚗', '⚽', '🌼'];
  function bigPic(e) { return A.Icons ? A.Icons.html(e, { size: 64, decorative: true, cls: 'pp-pic' }) : e; }
  function tinyItem(hi) {
    var n = rnd(1, hi), e = pick(BIG), w = within([n - 1, n + 1, n + 2], 1, hi + 1, n);
    return { key: 'tc' + n, ans: n, wrong: w, text: 'How many?', pic: '<span class="st-objs big tap" data-n="' + n + '">' + Array.apply(null, Array(n)).map(function () { return '<i>' + bigPic(e) + '</i>'; }).join('') + '</span>', say: ['st_how_many'], pictures: true,
      cell: function (v) { return { label: String(v), html: '<span class="st-numdot big">' + plate(v) + '<b>' + v + '</b></span>', fact: ['w_thats', v] }; },
      hint: function (l) { return box('<span class="st-objs big">' + Array.apply(null, Array(n)).map(function (_, i) { return '<i>' + bigPic(e) + (l >= 2 ? '<sub>' + (i + 1) + '</sub>' : '') + '</i>'; }).join('') + '</span>', l >= 2 ? 'One, two… <b>' + n + '</b>!' : 'Tap each one and count!'); } };
  }

  /* ---------- ladder registry (plug-in point) ---------- */
  var STEPS = {}, LADDERS = {}, GROUP = {};
  function ladder(def) {
    var after = def.after;
    def.ids = [];
    def.steps.forEach(function (s, i) {
      s.ladder = def.id; s.stepIx = i; s.subject = def.subject || 'math'; s.levels = [s.name]; s.status = 'active'; s.sayFact = s.sayFact !== false; s.isStep = true;
      s.grade = s.grade || def.grade; s.strand = s.strand || def.strand; s.std = s.std || def.std; s.band = def.band; s.secs = s.secs || def.secs;
      if (!s.intro) s.intro = { line: i === 0 ? def.introLine : 'st_new_step', example: s.example || '' };
      if (!s.gen) s.gen = s.facts ? genFacts(s) : genItem(s);
      if (!s.ask) s.ask = s.facts ? askFacts(s) : askItem(s);
      if (s.wrapOld) { s.subject = def.subject || 'math'; }
      else { C.register(s, after); if (def.before && i === 0) { var A2 = C.ACTIVE, at = A2.indexOf(s), bi = A2.indexOf(C.byId[def.before]); if (bi >= 0 && at > bi) { A2.splice(at, 1); A2.splice(bi, 0, s); } } }
      after = s.id; STEPS[s.id] = s; def.ids.push(s.id); if (def.rule) s.rule = def.rule; if (def.maxChoices) s.maxChoices = def.maxChoices;
    });
    (def.groups || []).forEach(function (g) { g.ids.forEach(function (id) { GROUP[id] = g.id; }); });
    LADDERS[def.id] = def; return def;
  }
  // the player whose round is being built (gen(L) has no player argument; pickRound / recordAnswer set it)
  var ctx = { p: null };
  function stOf(s) { try { return ctx.p ? C.state(ctx.p, s.id) : null; } catch (e) { return null; } }

  var pvRecent = {}, pvOwner = null;
  function pvStep(s) { return /^(pv_(tens|compare|ten_more|hto|cmp3)|[as]2_(add|sub|regroup)|time_(hour_half|5min)|coin_values|money_coins|arrays)$/.test(s.id); }
  function freshPV(s, channel, make, keyOf) {
    if (pvOwner !== ctx.p) { pvOwner = ctx.p; pvRecent = {}; }
    var key = channel + s.id, seen = pvRecent[key] || (pvRecent[key] = []), x, k, g = 0;
    do { x = make(); k = keyOf(x); } while (seen.indexOf(k) >= 0 && ++g < 500);
    seen.push(k); if (seen.length > 64) seen.shift(); return x;
  }
  function pvItem(s, channel) { return pvStep(s) ? freshPV(s, channel, function () { return s.item(stOf(s), ctx.p); }, function (x) { return x.key; }) : s.item(stOf(s), ctx.p); }
  // Equivalent numeric forms keep repeated answer tiles from becoming identical copies.
  function pvLook(v, n) { var c = pvCell(v), t = Math.floor(v / 10), o = v % 10;
    if (n === 1) c.label = (t * 10) + ' + ' + o;
    if (n === 2) c.label = t + ' tens + ' + o + ' ones';
    if (n === 3) c.label = (v - 1) + ' + 1';
    if (n === 4) c.label = (v + 1) + ' − 1';
    if (n === 5) c.label = (v + 10) + ' − 10';
    if (n === 6) c.label = '1 + ' + (v - 1);
    if (n >= 7) c.label = (v + n) + ' − ' + n;
    c.long = n > 0; return c;
  }
  function genItem(s) {
    return function (L) {
      var it = pvItem(s, 'board'), pool = it.wrong.slice(), looks = {}, usedLooks = {}, badN = 0;
      function cell(v) { var k = String(v), n = looks[k] || 0, c; do { c = pvStep(s) && typeof v === 'number' ? pvLook(v, n++) : it.cell(v); } while (pvStep(s) && typeof v === 'number' && usedLooks[c.label]); looks[k] = n; usedLooks[c.label] = true; return c; }
      return { text: it.text + (it.pic ? '<span class="st-pic">' + it.pic + '</span>' : ''), plain: it.text, say: it.say, target: it.key, step: s.id, item: it, pictures: !!it.pictures,
        hint: '', stepHint: function (cell, lvl) { return it.hint(lvl); }, worked: function () { return worked(s, it); },
        good: function () { var c = cell(it.ans); c.k = String(it.ans); return c; },
        bad: function () { var c = cell(pvStep(s) ? pool[badN++ % pool.length] : pick(pool)); c.k = c.label; return c; } };
    };
  }
  function cellF(f, sid) {
    if (sid === 's_think') return { label: f.b + ' + ? = ' + f.a, html: f.b + '&nbsp;+&nbsp;' + BOX + '&nbsp;=&nbsp;' + f.a, long: true, fact: [f.b, 'w_plus', f.v, 'w_makes', f.a, 'w_so_box_is', f.v], f: f };
    return { label: f.label, fact: [f.a, f.op === '+' ? 'w_plus' : 'w_minus', f.b, 'w_is', f.v], f: f };
  }
  function nearFact(f) { var g = 0, o; do { var d = pick([-2, -1, 1, 2]); o = Math.random() < .5 ? F(f.a, f.op, Math.max(0, f.b + d)) : F(Math.max(1, f.a + d), f.op, f.b); } while ((o.v === f.v || o.v < 0 || o.a > 20) && g++ < 30); return o; }
  function weighted(p, fam) {   // missed facts more often (a_mix / s_mix "weighted toward missed facts")
    var miss = p ? missedList(p).map(function (m) { return m.k; }) : [], hot = fam.filter(function (f) { return miss.indexOf(f.label) >= 0; });
    return hot.length && Math.random() < .5 ? pick(hot) : pick(fam);
  }
  // batch-1107c: a step with few facts for T still gets different-looking targets on one board, same fact, same band:
  // look 0 = a + b, 1 = b + a (adding), 2 = the fact with a ten-frame picture of the first number
  function lookOf(c, f, k, think) {
    if (think || !k) return c; k = k % 3;
    if (k === 1 && f.op === '+' && f.a !== f.b) { c.label = f.b + ' + ' + f.a; c.fact = [f.b, 'w_plus', f.a, 'w_is', f.v]; c.look = 'swap'; return c; }
    if (k === 1 && A.Learn && A.Learn.dotsFor && f.a <= 20 && f.b <= 20) { c.html = '<span class="lk-pic">' + A.esc(c.label) + '<span class="lk-row">' + A.Learn.dotsFor(f.a) + A.Learn.dotsFor(f.b) + '</span></span>'; c.long = true; c.look = 'both'; return c; }
    if (A.Learn && A.Learn.dotsFor && f.a <= 20) { c.html = '<span class="lk-pic">' + A.esc(c.label) + A.Learn.dotsFor(f.a) + '</span>'; c.long = true; c.look = 'frame'; }
    return c;
  }
  function genFacts(s) {
    return function (L) {
      var p = ctx.p, fam = s.facts(), due = s.id === 's_think' ? [] : dueFacts(p, s.ladder), T;
      var f0 = due.length && Math.random() < .7 ? due[0] : (/mix$/.test(s.id) ? weighted(p, fam) : pick(fam)); T = f0.v;
      var goods = fam.filter(function (f) { return f.v === T; }), rv = due.filter(function (f) { return f.v === T && !goods.some(function (g) { return g.label === f.label; }); }).slice(0, 2);
      var bads = fam.filter(function (f) { return f.v !== T && Math.abs(f.v - T) <= 3; });
      var think = s.id === 's_think', rvLeft = rv.length, n = 0;
      return { text: think ? 'Munch where ' + BOX + ' is ' + em(T) : 'Munch the ones that make ' + em(T), say: [think ? 'munch_rule_missing' : 'munch_rule_make', T], step: s.id, hint: '',
        stepHint: function (cell, lvl) { return factHint(hintFact(cell && cell.f, goods, T, s.id), lvl, s.id); }, target: T, worked: function (cell) { return worked(s, null, cell && cell.f || goods[0]); },
        good: function () { n++; var f = rvLeft > 0 && Math.random() < .35 ? rv[--rvLeft] : goods[(n - 1) % goods.length]; var c = lookOf(cellF(f, s.id), f, Math.floor((n - 1) / goods.length), think); if (rv.indexOf(f) >= 0) c.review = true; return c; },
        bad: function () { var f = bads.length >= 2 && Math.random() < .7 ? pick(bads) : nearFact(pick(goods)); return lookOf(cellF(f, s.id), f, rnd(0, 2), think); } };   // distractors use the same looks (no look is a giveaway)
    };
  }
  function choices(ans, wrong, n) { var w = A.shuffle(wrong.slice()).slice(0, n - 1); return A.shuffle([ans].concat(w)); }
  function askItem(s) {
    return function (L, n) {
      n = Math.min(n, s.maxChoices || n); var it = pvItem(s, 'pitch'), vals = choices(it.ans, it.wrong, Math.min(n, it.wrong.length + 1));
      return { variant: it.variant || (pvStep(s) ? 'compare' : null), text: it.text, pic: it.pic || null, say: it.say, fact: it.cell(it.ans).fact || [], answer: vals.indexOf(it.ans), target: it.key, hint: it.hint(1), hint2: it.hint(2), pictures: !!it.pictures,
        choices: vals.map(function (v) { var c = it.cell(v); return { label: c.label, html: c.html || null, say: c.fact && c.fact.length ? c.fact.slice(-1) : [c.label], value: v, long: !!c.long }; }) };
    };
  }
  function askFacts(s) {
    return function (L, n) {
      var p = ctx.p, due = s.id === 's_think' ? [] : dueFacts(p, s.ladder), f = due.length && Math.random() < .3 ? due[0] : (/mix$/.test(s.id) ? weighted(p, s.facts()) : pick(s.facts())), T = f.v;
      var w = within([T - 1, T + 1, T - 2, T + 2, T + 10, T - 10], 0, 20, T), vals = choices(T, w.slice(0, 4), n);
      var think = s.id === 's_think';
      // qbatch-1107: same fact, another look (true equation, hidden part, number line, make-10 strategy); exactly one right choice
      var VV = A.QVariants;
      if (VV && !think && Math.random() < .55) {
        var ks = f.op === '+' ? ['trueEq', 'bond', 'line'].concat(Math.max(f.a, f.b) >= 8 && T > 10 ? ['strategy', 'strategy'] : []) : ['bondSub', 'line'], k = pick(ks);
        var v = k === 'bondSub' ? VV.bondFixed(f.b, T, f.a, 1, n) : VV[k](f.a, f.b, T, n, 0, 20);
        if (v) { v.target = f.label; v.f = f; v.fact = cellF(f, s.id).fact; v.hint = factHint(f, 1, s.id); v.hint2 = factHint(f, 2, s.id); return v; }
      }
      return { text: think ? f.b + ' + ' + em('?') + ' = ' + f.a : 'What’s ' + f.label + '?', say: think ? [f.b, 'w_plus', 'bbq_what_makes', f.a] : ['bbq_whats', f.a, f.op === '+' ? 'w_plus' : 'w_minus', f.b], fact: cellF(f, s.id).fact,
        answer: vals.indexOf(T), target: f.label, f: f, hint: factHint(f, 1, s.id), hint2: factHint(f, 2, s.id), choices: vals.map(function (v) { return { label: String(v), html: null, say: [v], value: v }; }) };
    };
  }
  // §3.1.3 worked example: a 10-15 s walkthrough of a FRESH but similar fact (the missed one comes back right after via re-ask)
  function worked(s, it, f) {
    var html;
    if (s.facts) { var fam = s.facts().filter(function (x) { return !f || (x.label !== f.label && modeOf(x, s.id) === modeOf(f, s.id)); }); var g = pick(fam.length ? fam : s.facts());
      html = '<p class="st-wq">Watch: <b>' + (s.id === 's_think' ? g.b + ' + ? = ' + g.a : g.label) + '</b></p><div class="st-steps"><div class="s1">' + factHint(g, 1, s.id) + '</div><div class="s2">' + factHint(g, 2, s.id) + '</div></div>'; }
    else { var j = s.item(stOf(s), ctx.p), g2 = 0; while (it && j.key === it.key && g2++ < 10) j = s.item(stOf(s), ctx.p);
      html = '<p class="st-wq">Watch: ' + j.text + '</p>' + (j.pic ? '<div class="st-pic">' + j.pic + '</div>' : '') + '<div class="st-steps"><div class="s1">' + j.hint(1) + '</div><div class="s2">' + j.hint(2) + '</div></div>'; }
    return '<div class="worked st-worked">' + html + '</div>';
  }

  /* ---------- old two-level skills as steps (v2p2b) ----------
     The skill keeps its id, generator and save record; its two levels become sub-levels of ONE step: level 1 until 8+ answers at
     80%+ (or a fast-skip run), then level 2. Mastery and fast-skip are the step rules (fast-skip on level 1 jumps to level 2). */
  function wrapOld(id, lad, ix) {
    var s = C.byId[id], og = s.gen, oa = s.ask;
    s.isStep = true; s.wrapOld = true; s.subLevels = s.levels.length; s.levels = [s.name];
    function L() { var st = stOf(s); return st ? Math.min(st.level || 0, s.subLevels - 1) : s.subLevels - 1; }
    s.gen = function () {
      var r = og(L()), N = (r.say || []).filter(function (x) { return typeof x === 'number'; }).slice(-1)[0];
      r.step = s.id; var tip = r.hint;
      r.stepHint = function (cell, lvl) { var f = cell && parseFact(String(cell.label).replace(/^(\d+) - (\d+)$/, '$1 − $2'));
        if (f && f.v !== N) {   // v2p2b: a missed cell's own fact would point at the wrong value; hint a fact that makes the target
          if (N == null) f = null; else { var gc = null; for (var gi = 0; gi < 12 && r.good; gi++) { var c0 = r.good(), g0 = c0 && parseFact(String(c0.label).replace(/^(\d+) - (\d+)$/, '$1 − $2')); if (g0 && g0.v === N) { gc = g0; if (modeOf(g0, s.id) === modeOf(f, s.id)) break; } }
            f = gc || (f.op === '+' && N > 10 && N <= 20 ? F(10, '+', N - 10) : null); } }
        if (f && !r.wp) return factHint(f, lvl, s.id);
        if (N != null && !r.wp && /^(count10|teen)$/.test(s.id)) return box(tens(N), lvl >= 2 ? 'This is <b>' + N + '</b>.' : 'Look for ' + N + ' dots. Count them!');
        return tip ? box('', tip) : ''; };
      r.hint = ''; return r;
    };
    if (oa) s.ask = function (lv, n) { var q = oa(L(), n); return q; };
    else s.ask = function (lv, n) { return A.Questions.fromGen(s, lv, n); };   // quality1: an old skill with no ask of its own (wordprob) asks from its grid generator (was: askItem -> s.item is not a function)
    return s;
  }
  // T band: tiny counting steps below count to 10 (the old count10 is the 3rd step)
  ladder({ id: 't', subject: 'math', band: 'T', grade: 'PK', strand: 'Counting', std: 'PK', before: 'count10', introLine: 'st_intro_pk', maxChoices: 2, secs: [12, 13], rule: { min: 10, acc: .8, days: 2 },   // 2 choices: 80% (not 85%) over 10+ on 2 days
   
    groups: [{ id: 't_a', ids: ['t_count3', 't_count5'] }, { id: 't_b', ids: ['count10'] }],
    steps: [{ id: 't_count3', name: 'Count to 3', short: 'How many? (1-3, big pictures)', item: function () { return tinyItem(3); } },
      { id: 't_count5', name: 'Count to 5', short: 'How many? (1-5, big pictures)', item: function () { return tinyItem(5); } },
      wrapOld('count10', 't', 2)] });
  // 'bigger & smaller' merges into pre-K 'more or fewer' (its save record stays; migration below)
  (function () { var i = C.ACTIVE.indexOf(C.byId.compare); if (i >= 0) C.ACTIVE.splice(i, 1); C.byId.compare.status = 'retired'; })();

  /* ---------- the ladders ---------- */
  ladder({ id: 'pk', subject: 'math', band: 'P', grade: 'PK', strand: 'Counting', std: 'PK / K.CC', after: 'count10', introLine: 'st_intro_pk', secs: [10, 11],
    groups: [{ id: 'pk_a', ids: ['pk_count10', 'pk_count20', 'pk_numid20', 'pk_next20'] }, { id: 'pk_b', ids: ['pk_before20', 'pk_count30', 'pk_next30', 'pk_more1'] }, { id: 'pk_c', ids: ['pk_less1', 'pk_compare', 'pk_more1_30', 'pk_make5'] }],
    steps: [
      { id: 'pk_count10', name: 'Count to 10', short: 'How many? (1-10)', item: function () { return cntItem(1, 10); } },
      { id: 'pk_count20', name: 'Count to 20', short: 'Ten and some more (11-20)', item: function () { return cntItem(11, 20, 'tens'); } },
      { id: 'pk_numid20', name: 'Find the number', short: 'Find numbers to 20', item: function () { return findItem(1, 20); } },
      { id: 'pk_next20', name: 'What comes next', short: 'Next number to 20', item: function () { return seqItem(1, 20, 'next'); } },
      { id: 'pk_before20', name: 'Before and missing', short: 'Before / missing to 20', item: function () { return seqItem(1, 20, Math.random() < .5 ? 'before' : 'missing'); } },
      { id: 'pk_count30', name: 'Count to 30', short: 'How many / find to 30', item: function () { return Math.random() < .6 ? cntItem(21, 30, 'tens') : findItem(21, 30); } },
      { id: 'pk_next30', name: 'Next and missing to 30', short: 'Next / missing to 30', item: function () { return seqItem(1, 30, pick(['next', 'missing', 'before']), true); } },
      { id: 'pk_more1', name: 'One more', short: 'One more (to 20)', item: function (st) { return moreLess(1, 20, true, st); } },
      { id: 'pk_less1', name: 'One less', short: 'One less (to 20)', item: function (st) { return moreLess(-1, 20, true, st); } },
      { id: 'pk_compare', name: 'More or fewer', short: 'Which has more? Which is bigger?', item: function (st) { return compareItem(st); } },
      { id: 'pk_more1_30', name: 'One more, one less to 30', short: 'One more / less to 30', item: function () { return moreLess(Math.random() < .5 ? 1 : -1, 30, false); } },
      { id: 'pk_make5', name: 'Make 5', short: 'Fill the five-frame (pictures)', item: function () { return make5Item(); } }
    ] });
  // retire the old add20 / sub20 levels (kept in the catalogue so old saves and the guest game still find them)
  ['add20', 'sub20'].forEach(function (id) { var i = C.ACTIVE.indexOf(C.byId[id]); if (i >= 0) C.ACTIVE.splice(i, 1); C.byId[id].status = 'retired'; });
  ladder({ id: 'e20', subject: 'math', band: 'E', grade: '1', strand: 'Add & subtract', std: '1.OA.6', after: 'missing', introLine: 'st_intro_e20', secs: [12, 13],
    groups: [{ id: 'e_a', ids: ['a_dbl', 'a_ndbl', 'a_ten'] }, { id: 'e_b', ids: ['s_teen1', 's_teen10', 's_10'] }, { id: 'e_c', ids: ['a_9', 'a_8', 's_noX', 'a_mk10'] }, { id: 'e_d', ids: ['s_split', 's_think'] }, { id: 'e_e', ids: ['a_mix', 's_mix'] }],
    steps: [
      { id: 'a_dbl', name: 'Doubles', short: 'Doubles 1+1 to 10+10' }, { id: 'a_ndbl', name: 'Near doubles', short: 'Near doubles (6+7)' }, { id: 'a_ten', name: 'Ten plus', short: '10 + n' },
      { id: 's_teen1', name: 'Teen minus its ones', short: '14 − 4 = 10' }, { id: 's_teen10', name: 'Teen minus 10', short: '14 − 10' }, { id: 's_10', name: 'Ten minus', short: '10 − n' },
      { id: 'a_9', name: 'Plus 9', short: '9 + n' }, { id: 'a_8', name: 'Plus 8', short: '8 + n' }, { id: 's_noX', name: 'Take away the ones', short: '17 − 3 (no crossing 10)' },
      { id: 'a_mk10', name: 'Make ten, mixed', short: 'Sums 11-18' }, { id: 's_split', name: 'Across 10 by splitting', short: '13 − 5 = 13 − 3 − 2' },
      { id: 's_think', name: 'Think addition', short: '5 + ? = 13' }, { id: 'a_mix', name: 'All adding to 20', short: 'Every fact to 20' }, { id: 's_mix', name: 'All take-away to 20', short: 'Every fact within 20' }
    ].map(function (s) { s.facts = FAM[s.id]; s.intro = null; return s; }) });
  ladder({ id: 'k', subject: 'math', band: 'P', grade: 'K', strand: 'Add & subtract', std: '1.OA.6', introLine: null,
    groups: ['add10', 'sub10', 'make10', 'teen', 'missing'].map(function (id) { return { id: 'g_' + id, ids: [id] }; }),
    steps: ['add10', 'sub10', 'make10', 'teen', 'missing'].map(function (id, i) { return wrapOld(id, 'k', i); }) });
  ladder({ id: 'wp', subject: 'math', band: 'E', grade: '1', strand: 'Add & subtract', std: '1.OA.1', introLine: null, groups: [{ id: 'g_wordprob', ids: ['wordprob'] }], steps: [wrapOld('wordprob', 'wp', 0)] });
  ladder({ id: 'eo', subject: 'math', band: 'E', grade: '1', strand: 'Numbers', std: '2.OA.3', introLine: null, groups: [{ id: 'g_evenodd', ids: ['evenodd'] }], steps: [wrapOld('evenodd', 'eo', 0)] });
  /* quality1 (minimal B2, parent rule 2): 1st-grade place value, after word problems and before even/odd (i-Ready Classroom
     Mathematics Grade 1: place value follows addition and subtraction within 20; Khan 1st grade "Place value"). Three steps only;
     the full B2 ladder (hundreds, expanded form, ...) is a later pass. Old saves already past it get a 5-question test-out
     (js/core/learn.js pvApi) instead of being sent back. */
  function pvPic(t, o) { return A.PV100.blocks(t, o); }
  function pvCell(v) { return { label: String(v), fact: ['w_thats', v] }; }
  function pvUniq(ans, list) { var out = []; list.forEach(function (x) { if (x !== ans && x > 0 && x < 100 && out.indexOf(x) < 0) out.push(x); }); return out; }
  function pvTensItem() {
    var t = rnd(1, 9), o = rnd(0, 9), v = t * 10 + o, k = pick(['blocks', 'expanded', 'tensCount']), ans = k === 'tensCount' ? t : v;
    return { key: 'pv' + k + v, variant: k, ans: ans,
      wrong: k === 'tensCount' ? uniq([o, t + 1, t - 1, v].filter(function (x) { return x !== ans && x >= 0; })).slice(0, 3) : pvUniq(v, [10 * o + t, t + o, v + 10, v - 10, v + 1]).slice(0, 3),
      text: k === 'blocks' ? 'How many in all?' : k === 'expanded' ? em(t * 10 + ' + ' + o) + ' makes what number?' : 'How many full tens are in ' + em(v) + '?',
      pic: k === 'blocks' ? pvPic(t, o) : '', say: [{ id: 'pv100_' + k, text: k === 'blocks' ? 'How many in all?' : k === 'expanded' ? t * 10 + ' plus ' + o + ' makes what number?' : 'How many full tens are in ' + v + '?' }], cell: pvCell,
      hint: function (l) { return box(pvPic(t, o), l >= 2 ? t + ' tens and ' + o + ' ones make ' + v + '. The answer is <b>' + ans + '</b>.' : 'A long rod is one ten. Count the rods, then the single ones.'); } };
  }
  function pvCompareItem() {
    var a = rnd(10, 99), b, g = 0; do { b = Math.random() < .5 ? +String(a).split('').reverse().join('') : rnd(10, 99); } while ((b === a || b < 10) && g++ < 50); if (b === a || b < 10) b = a === 99 ? 98 : a + 1;
    var hi = Math.max(a, b), hint = function (l) { return box('<span class="pv-cmp">' + pvPic(Math.floor(a / 10), a % 10) + '<b>' + a + '</b></span><span class="pv-cmp">' + pvPic(Math.floor(b / 10), b % 10) + '<b>' + b + '</b></span>',
      l >= 2 ? '<b>' + hi + '</b> is greater.' : 'Compare the tens first. If the tens are the same, compare the ones.'); };
    if (Math.random() < .5) { var ans = a > b ? 'L' : 'R';
      return { key: 'pvc' + Math.min(a, b) + 'v' + hi, ans: ans, wrong: [ans === 'L' ? 'R' : 'L'], two: true, text: 'Which number is greater?', say: ['q1_pv_greater'],
        cell: function (k) { var v = k === 'L' ? a : b; return { label: String(v), fact: ['w_thats', v] }; }, hint: hint }; }
    var sg = a > b ? '>' : '<', NM = { '>': 'q1_pv_gt', '<': 'q1_pv_lt', '=': 'q1_pv_eq' };
    return { key: 'pvs' + a + 'v' + b, ans: sg, wrong: ['<', '>', '='].filter(function (x) { return x !== sg; }), text: 'Which sign makes it true? ' + em(a + ' ' + BOX + ' ' + b), say: ['q1_pv_sign', a, 'q1_pv_and', b],
      cell: function (k) { return { label: k, fact: [a, NM[k], b] }; }, hint: hint };
  }
  function pvTenItem() {
    var more = Math.random() < .5, n = more ? rnd(10, 89) : rnd(20, 99), ans = more ? n + 10 : n - 10;
    var chart = Math.random() < .6;
    return { variant: chart ? 'chart' : 'tenMoreLess', pic: chart ? A.PV100.chart(n, more) : '', key: 'pv10' + (more ? 'm' : 'l') + n, ans: ans, wrong: pvUniq(ans, [more ? n + 1 : n - 1, more ? n - 10 : n + 10, ans + 1, ans - 1]).slice(0, 3), text: chart ? 'Start at ' + em(n) + '. Jump one row ' + (more ? 'down' : 'up') + '. Where do you land?' : 'What is 10 ' + (more ? 'more' : 'less') + ' than ' + em(n) + '?',
      say: [more ? 'q1_pv_10more' : 'q1_pv_10less', n], cell: pvCell,
      hint: function (l) { return box(pvPic(Math.floor(n / 10), n % 10), l >= 2 ? '10 ' + (more ? 'more' : 'less') + ': one ' + (more ? 'more' : 'less') + ' ten, the ones stay the same. <b>' + ans + '</b>.' : 'Ten more adds one long bar. Ten less takes one away. The ones stay the same.'); } };
  }
  ladder({ id: 'pv', subject: 'math', band: 'E', grade: '1', strand: 'Place value', std: '1.NBT.2', after: 'wordprob', introLine: 'st_new_step', secs: [12, 13],
    groups: [{ id: 'g_pv', ids: ['pv_tens', 'pv_compare', 'pv_ten_more'] }],
    steps: [
      { id: 'pv_tens', name: 'Tens and ones', short: '3 tens and 4 ones is 34', std: '1.NBT.2', item: pvTensItem },
      { id: 'pv_compare', name: 'Compare two-digit numbers', short: '47 > 38', std: '1.NBT.3', item: pvCompareItem },
      { id: 'pv_ten_more', name: '10 more, 10 less', short: '10 more than 36 is 46', std: '1.NBT.5', item: pvTenItem }
    ] });
  /* batch1 (2026-10-31): the first half of the 2nd-grade math ladder, after even/odd (i-Ready Classroom Mathematics Grade 2 /
     Khan 2nd grade order; questions are our own): 2-digit adding and taking away without, then with regrouping (2.NBT.5),
     hundreds-tens-ones to 1,000 (2.NBT.1, 2.NBT.3), comparing 3-digit numbers (2.NBT.4), skip counting by 5s, 10s, 100s (2.NBT.2).
     Munch boards: "Munch the ones that make 59" with different 2-digit sums (or "Munch 345" style for place value).
     Wrong answers are the real mistakes: forgetting to regroup, the ten off by one, digits swapped. */
  function g2Ok(kind, a, b) {
    var ao = a % 10, bo = b % 10;
    if (kind === 'a2' || kind === 'a2r') { if (a + b > 99 || a < 10) return false; return kind === 'a2' ? ao + bo <= 9 : ao + bo >= 10 && ao > 0 && bo > 0; }
    if (a - b < 1 || a < 20) return false; return kind === 's2' ? ao >= bo : ao < bo;
  }
  function g2Fact(kind) {
    for (var g = 0; g < 200; g++) {
      var a = rnd(kind[0] === 'a' ? 12 : 31, kind[0] === 'a' ? 78 : 98), b = Math.random() < .12 && a >= 20 ? rnd(3, 9) : rnd(11, kind[0] === 'a' ? 79 : a - 10);
      if (g2Ok(kind, a, b)) return F(a, kind[0] === 'a' ? '+' : '-', b);
    }
    return kind[0] === 'a' ? F(34, '+', 25) : F(58, '-', 23);
  }
  function g2Goods(kind, T) {   // every fact of this kind that makes T (2-digit + 2-digit mostly; a few + one-digit)
    var o = [], op = kind[0] === 'a' ? '+' : '-';
    for (var a = 10; a <= 99; a++) { var b = op === '+' ? T - a : a - T; if (b >= 2 && g2Ok(kind, a, b) && (b >= 10 || Math.random() < .3)) o.push(F(a, op, b)); }
    return o;
  }
  function g2Trap(f) {   // the classic slip: no regrouping (each column on its own, the smaller digit from the bigger one)
    var at = Math.floor(f.a / 10), ao = f.a % 10, bt = Math.floor(f.b / 10), bo = f.b % 10;
    if (f.op === '+') return (at + bt) * 10 + (ao + bo) % 10;
    return (at - bt) * 10 + Math.abs(ao - bo);
  }
  function g2Wrong(f) { var v = f.v; return uniq([g2Trap(f), v + 10, v - 10, v + 1, v - 1].filter(function (x) { return x !== v && x >= 0 && x <= 100; })); }
  function g2Hint(f, l) {
    var at = Math.floor(f.a / 10) * 10, ao = f.a % 10, bt = Math.floor(f.b / 10) * 10, bo = f.b % 10, pic = pvPic(at / 10, ao) + '<i class="pb-op">' + (f.op === '+' ? '+' : '−') + '</i>' + pvPic(bt / 10, bo);
    if (f.op === '+') {
      if (ao + bo >= 10) return box(pic, l >= 2 ? at + ' + ' + bt + ' = ' + (at + bt) + '. ' + ao + ' + ' + bo + ' = ' + (ao + bo) + ', that is 1 more ten and ' + (ao + bo - 10) + ' ones. So <b>' + f.v + '</b>.' : 'Add the tens, then the ones. ' + ao + ' + ' + bo + ' is more than 9: trade 10 ones for 1 ten!');
      return box(pic, l >= 2 ? at + ' + ' + bt + ' = ' + (at + bt) + ', and ' + ao + ' + ' + bo + ' = ' + (ao + bo) + '. So <b>' + f.v + '</b>.' : 'Add the tens: ' + at + ' + ' + bt + '. Then add the ones: ' + ao + ' + ' + bo + '.');
    }
    if (ao < bo) return box(pic, l >= 2 ? 'Trade a ten: ' + f.a + ' is ' + (Math.floor(f.a / 10) - 1) + ' tens and ' + (ao + 10) + ' ones. ' + (ao + 10) + ' − ' + bo + ' = ' + (ao + 10 - bo) + ', and ' + (Math.floor(f.a / 10) - 1) + ' tens − ' + bt / 10 + ' tens = ' + (Math.floor(f.a / 10) - 1 - bt / 10) + ' tens. So <b>' + f.v + '</b>.' : 'You cannot take ' + bo + ' ones from ' + ao + ' ones. Trade 1 ten for 10 ones first!');
    return box(pic, l >= 2 ? at + ' − ' + bt + ' = ' + (at - bt) + ', and ' + ao + ' − ' + bo + ' = ' + (ao - bo) + '. So <b>' + f.v + '</b>.' : 'Take away the tens: ' + at + ' − ' + bt + '. Then the ones: ' + ao + ' − ' + bo + '.');
  }
  function g2Cell(f) { return { label: f.label, fact: [f.a, f.op === '+' ? 'w_plus' : 'w_minus', f.b, 'w_is', f.v], f: f, long: true }; }
  function g2Gen(kind, s) {
    return function () {
      var f0 = g2Fact(kind), T = f0.v, goods = g2Goods(kind, T); if (!goods.length) goods = [f0];
      var bads = [], g = 0;
      while (bads.length < 30 && g++ < 400) { var x = g2Fact(kind); if (x.v !== T && Math.abs(x.v - T) <= 20 && (Math.abs(x.v - T) === 10 || Math.abs(x.v - T) <= 3 || g2Trap(x) === T || Math.random() < .25)) bads.push(x); }
      if (!bads.length) bads = [F(f0.a, f0.op, f0.b + 1)];
      goods = A.shuffle(goods); bads = A.shuffle(bads.filter(function (f, i, a) { return a.map(function (x) { return x.label; }).indexOf(f.label) === i; })); var gn = 0, bn = 0;
      function next(pool, n) { var f = pool[n % pool.length]; return n < pool.length ? g2Cell(f) : pvLook(f.v, 1 + n - pool.length); }
      return { text: 'Munch the ones that make ' + em(T), say: ['munch_rule_make', T], step: s.id, hint: '', target: T,
        stepHint: function (cell, lvl) { return g2Hint(cell && cell.f && cell.f.v === T ? cell.f : pick(goods), lvl); }, worked: function (cell) { var w = pick(goods); return '<div class="worked st-worked"><p class="st-wq">Watch: <b>' + w.label + '</b></p><div class="st-steps"><div class="s1">' + g2Hint(w, 1) + '</div><div class="s2">' + g2Hint(w, 2) + '</div></div></div>'; },
        good: function () { return next(goods, gn++); }, bad: function () { return next(bads, bn++); } };
    };
  }
  function g2Ask(kind) {
    return function (L, n) {
      var f = freshPV({ id: kind }, 'pitch', function () { return g2Fact(kind); }, function (x) { return x.label; }), T = f.v, w = g2Wrong(f), vals = choices(T, w.slice(0, 4), n), line = Math.random() < .5;
      return { variant: line ? 'openLine' : 'model', pic: line ? A.PV100.line(f.a, f.b, f.op) : pvPic(Math.floor(f.a / 10), f.a % 10) + '<b> ' + f.op + ' </b>' + pvPic(Math.floor(f.b / 10), f.b % 10), text: 'What’s ' + f.label + '?', say: ['bbq_whats', f.a, f.op === '+' ? 'w_plus' : 'w_minus', f.b], fact: g2Cell(f).fact, answer: vals.indexOf(T), target: f.label, f: f,
        hint: g2Hint(f, 1), hint2: g2Hint(f, 2), choices: vals.map(function (v) { return { label: String(v), html: null, say: [v], value: v }; }) };
    };
  }
  function hundredsPic(h, t, o) { return A.PV100.blocks3(h, t, o); }
  function uniq3(ans, list) { var out = []; list.forEach(function (x) { if (x !== ans && x >= 100 && x <= 999 && out.indexOf(x) < 0) out.push(x); }); return out; }
  function htoItem() {
    var h = rnd(1, 9), t = rnd(0, 9), o = rnd(0, 9); while (t === h) t = (t + 1) % 10; while (o === h || o === t) o = (o + 1) % 10; var v = 100 * h + 10 * t + o, r = Math.random();
    var swaps = uniq3(v, [100 * h + 10 * o + t, 100 * t + 10 * h + o, 100 * o + 10 * t + h, v + 100, v - 100, v + 10, v - 10]);
    var hint = function (l) { return box(hundredsPic(h, t, o), l >= 2 ? h + ' hundreds is ' + (100 * h) + ', ' + t + ' tens is ' + (10 * t) + ', and ' + o + ' ones. Together: <b>' + v + '</b>.' : 'Each square is a hundred, each long bar is a ten. Count hundreds, then tens, then ones.'); };
    if (r < .4) return { variant: 'blocks3', pic: hundredsPic(h, t, o), key: 'hto' + v, ans: v, wrong: swaps.slice(0, 3), text: 'What number has ' + em(h + ' hundreds') + ', ' + em(t + ' tens') + ' and ' + em(o + ' ones') + '?', say: ['b1_pv_hto1', h, 'b1_pv_hundreds', t, 'q1_pv_tensones2', o, 'q1_pv_tensones3'], cell: pvCell, hint: hint };
    if (r < .7) return { variant: 'expanded', key: 'exp' + v, ans: v, wrong: swaps.slice(0, 3), text: em((100 * h) + ' + ' + (10 * t) + ' + ' + o) + ' makes what number?', say: [100 * h, 'w_plus', 10 * t, 'w_plus', o, 'b1_pv_makes_what'], cell: pvCell, hint: hint };
    var which = pick(t ? ['h', 't'] : ['h']), d = which === 'h' ? h : t, ans = which === 'h' ? 100 * h : 10 * t;
    return { variant: 'digitValue', key: 'val' + v + which, ans: ans, wrong: uniq([d, which === 'h' ? 10 * h : 100 * t, which === 'h' ? 1000 : d * 1000].filter(function (x) { return x !== ans && x > 0; })).slice(0, 3), text: 'In ' + em(v) + ', what is the ' + em(d) + ' worth?', say: ['b1_pv_in', v, 'b1_pv_worth1', d, 'b1_pv_worth2'], cell: pvCell,
      hint: function (l) { return box(hundredsPic(h, t, o), l >= 2 ? 'The ' + d + ' is in the ' + (which === 'h' ? 'hundreds' : 'tens') + ' place, so it is worth <b>' + ans + '</b>.' : 'Which place is the ' + d + ' in: hundreds, tens or ones?'); } };
  }
  function cmp3Item() {
    var a = rnd(100, 999), b, g = 0, mode = Math.random();
    do { b = mode < .35 ? Math.floor(a / 100) * 100 + rnd(0, 99) : mode < .6 ? +String(a).split('').reverse().join('') : rnd(100, 999); } while ((b === a || b < 100 || b > 999) && g++ < 50); if (b === a || b < 100 || b > 999) b = a === 999 ? 998 : a + 1;
    var hi = Math.max(a, b), hint = function (l) { return box('<p class="st-big">' + a + ' &nbsp; ' + b + '</p>', l >= 2 ? '<b>' + hi + '</b> is greater.' : 'Compare the hundreds first. Same hundreds? Compare the tens, then the ones.'); };
    if (Math.random() < .5) { var ans = a > b ? 'L' : 'R';
      return { key: 'c3' + Math.min(a, b) + 'v' + hi, ans: ans, wrong: [ans === 'L' ? 'R' : 'L'], two: true, text: 'Which number is greater?', say: ['q1_pv_greater'],
        cell: function (k) { var v = k === 'L' ? a : b; return { label: String(v), fact: ['w_thats', v] }; }, hint: hint }; }
    var sg = a > b ? '>' : '<', NM = { '>': 'q1_pv_gt', '<': 'q1_pv_lt', '=': 'q1_pv_eq' };
    return { key: 's3' + a + 'v' + b, ans: sg, wrong: ['<', '>', '='].filter(function (x) { return x !== sg; }), text: 'Which sign makes it true? ' + em(a + ' ' + BOX + ' ' + b), say: ['q1_pv_sign', a, 'q1_pv_and', b],
      cell: function (k) { return { label: k, fact: [a, NM[k], b] }; }, hint: hint };
  }
  function skipItem() {
    var by = pick([5, 10, 10, 100]), st = by === 5 ? 5 * rnd(1, 18) : by === 10 ? (Math.random() < .5 ? 10 * rnd(1, 8) : rnd(11, 59)) : (Math.random() < .5 ? 100 * rnd(1, 5) : 10 * rnd(11, 49)), nums = [st, st + by, st + 2 * by], ans = st + 3 * by;
    // batch-1107c: by 100s the near misses are real counting slips (one hundred too far, counted on by ten, the tens changed),
    // never 601 / 599, which no hundreds count can land on
    var w = uniq((by === 100 ? [ans + 100, nums[2] + 10, ans + 10, ans - 10] : [ans + 1, ans - 1, st + 2 * by + (by === 5 ? 10 : 1), ans + by, ans + 5]).filter(function (x) { return x !== ans && x > 0 && x !== nums[2]; }));
    return { key: 'skip' + by + 'f' + st, ans: ans, wrong: w.slice(0, 3), text: 'Count by ' + by + 's. What comes next?', pic: track(nums.concat([null])), say: [by === 5 ? 'b1_skip5' : by === 10 ? 'b1_skip10' : 'b1_skip100'], cell: pvCell,
      hint: function (l) { return box(l >= 2 ? track(nums.concat([ans])) : '', l >= 2 ? nums[2] + ' and ' + by + ' more is <b>' + ans + '</b>.' : by === 5 ? 'Fives end in 5, 0, 5, 0…' : by === 10 ? 'Counting by tens: the tens digit goes up by one, the ones stay the same.' : 'Counting by hundreds: the hundreds digit goes up by one.'); } };
  }
  ladder({ id: 'g2', subject: 'math', band: 'E', grade: '2', strand: 'Add & subtract within 100', std: '2.NBT.5', after: 'evenodd', introLine: 'st_new_step', secs: [16, 18],
    groups: [{ id: 'g2_a', ids: ['a2_add', 's2_sub'] }, { id: 'g2_b', ids: ['a2_regroup', 's2_regroup'] }, { id: 'g2_c', ids: ['pv_hto', 'pv_cmp3', 'skip_count'] }],
    steps: [
      { id: 'a2_add', name: 'Add 2-digit numbers', short: '34 + 25 (no regrouping)', std: '2.NBT.5', kind: 'a2' },
      { id: 's2_sub', name: 'Take away 2-digit numbers', short: '58 − 23 (no regrouping)', std: '2.NBT.5', kind: 's2' },
      { id: 'a2_regroup', name: 'Add with regrouping', short: '38 + 47 (trade 10 ones for a ten)', std: '2.NBT.5', kind: 'a2r' },
      { id: 's2_regroup', name: 'Take away with regrouping', short: '52 − 27 (trade a ten for 10 ones)', std: '2.NBT.5', kind: 's2r' },
      { id: 'pv_hto', name: 'Hundreds, tens and ones', short: '3 hundreds, 4 tens, 5 ones is 345', std: '2.NBT.1', item: htoItem },
      { id: 'pv_cmp3', name: 'Compare 3-digit numbers', short: '462 > 426', std: '2.NBT.4', item: cmp3Item },
      { id: 'skip_count', name: 'Skip counting', short: 'By 5s, 10s and 100s', std: '2.NBT.2', item: skipItem }
    ].map(function (s) { if (s.kind) { s.gen = g2Gen(s.kind, s); s.ask = g2Ask(s.kind); s.secs = [18, 20]; } return s; }) });
  /* qtime (batch 3): telling time. Original items from Learning Coach templates (math_g1_g2 time family), never copied from i-Ready.
     Grade 1 hour/half (1.MD.B.3) after place value; Grade 2 five-minute + a.m./p.m. (2.MD.C.7) after skip counting by 5s. */
  function tmFmt(h, m) { return A.Clock.fmt(h, m); }
  function tmFace(h, m, small) { return A.Clock.face(h, m, { small: !!small }); }
  function tmUniq(ans, list) { var out = []; list.forEach(function (x) { if (x && x !== ans && out.indexOf(x) < 0) out.push(x); }); return out; }
  function tmParse(s) { var m = String(s).match(/^(\d{1,2}):(\d{2})$/); return m ? { h: +m[1], m: +m[2] } : null; }
  function tmDistractors(h, m) {
    var minNum = m / 5, swapH = minNum === 0 ? 12 : minNum, swapM = Math.round((h % 12) * 5); if (swapM >= 60) swapM = 0;
    var nextH = h === 12 ? 1 : h + 1, prevH = h === 1 ? 12 : h - 1;
    return tmUniq(tmFmt(h, m), [
      tmFmt(nextH, m), tmFmt(prevH, m),
      tmFmt(swapH, swapM),
      m > 0 ? tmFmt(h, minNum) : tmFmt(h, 5),           // minute-number-as-minutes (hand on 4 → :04)
      m === 30 ? tmFmt(nextH, 30) : tmFmt(h, m === 0 ? 30 : 0),
      tmFmt(h, (m + 5) % 60), tmFmt(h, (m + 55) % 60)
    ]);
  }
  function tmPickH() { return rnd(1, 12); }
  function tmPickM(kind) { return kind === 'hour_half' ? (Math.random() < .5 ? 0 : 30) : pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]); }
  function tmCellTime(v) { var p = tmParse(v); return { label: String(v), html: p ? tmFace(p.h, p.m, true) : null, fact: ['w_thats', { id: 'tm_say', text: String(v).replace(':', ' ') }], long: true }; }
  function tmCellDigital(v) { return { label: String(v), fact: ['w_thats', { id: 'tm_say', text: String(v).replace(':', ' ') }] }; }
  function tmAmPmEvents() {
    return [
      { ev: 'eats breakfast', ap: 'a.m.' }, { ev: 'gets ready for school', ap: 'a.m.' }, { ev: 'sees the sunrise', ap: 'a.m.' },
      { ev: 'eats dinner', ap: 'p.m.' }, { ev: 'goes to bed', ap: 'p.m.' }, { ev: 'sees the sunset', ap: 'p.m.' }
    ];
  }
  function tmHero() { var ids = ['strawberry', 'blueberry', 'lemon', 'grape', 'pretzel', 'muffin']; return pick(ids); }
  function tmItem(kind) {
    var h = tmPickH(), m = tmPickM(kind), t = tmFmt(h, m), wrong = tmDistractors(h, m).slice(0, 3), r = Math.random();
    var hint = function (l) {
      var face = tmFace(h, m);
      if (m === 0) return box(face, l >= 2 ? 'The minute hand points at 12, so it is <b>' + t + '</b> on the hour.' : 'When the long hand is on 12, say the hour and “o’clock.”');
      if (m === 30) return box(face, l >= 2 ? 'The long hand is on 6 (30 minutes). The short hand sits halfway to ' + (h === 12 ? 1 : h + 1) + '. So <b>' + t + '</b>.' : 'Half past: long hand on 6. The short hand is halfway between two hours.');
      return box(face, l >= 2 ? 'Count by 5s from 12 to the long hand: that is ' + m + ' minutes. Short hand near ' + h + '. So <b>' + t + '</b>.' : 'The long hand shows minutes. Each number is 5 minutes.');
    };
    // a.m. / p.m. only on the grade-2 step
    if (kind === '5min' && r < .22) {
      var e = pick(tmAmPmEvents()), hh = rnd(1, 11), mm = pick([0, 15, 30]);
      return { variant: 'amPm', key: 'ampm' + e.ap + e.ev + hh + mm, ans: e.ap, wrong: [e.ap === 'a.m.' ? 'p.m.' : 'a.m.'], text: 'A picnic pal ' + e.ev + ' at ' + em(tmFmt(hh, mm)) + '. Is that a.m. or p.m.?',
        say: [{ id: 'tm_ampm', text: 'Is ' + tmFmt(hh, mm) + ' in the morning a.m., or after noon p.m.?' }], cell: function (v) { return { label: v, fact: ['w_thats', { id: 'tm_' + v.replace('.', ''), text: v }] }; }, hint: function (l) { return box('', l >= 2 ? '<b>' + e.ap + '</b> — ' + e.ev + ' happens ' + (e.ap === 'a.m.' ? 'in the morning' : 'in the evening') + '.' : 'a.m. is morning. p.m. is afternoon or night.'); } };
    }
    // which clock / digital→analog
    if (r < .55) {
      return { variant: r < .3 ? 'pickClock' : 'matchDigital', key: 'clk' + t, ans: t, wrong: wrong, text: r < .3 ? 'Which clock shows ' + em(t) + '?' : 'Match the digital time ' + em(t) + ' to the clock.',
        say: [{ id: 'tm_which', text: 'Which clock shows ' + t.replace(':', ' ') + '?' }], cell: tmCellTime, hint: hint };
    }
    // read the analog clock
    return { variant: 'readClock', key: 'read' + t, ans: t, wrong: wrong, pic: tmFace(h, m), text: 'What time does the clock show?',
      say: [{ id: 'tm_read', text: 'What time does the clock show?' }], cell: tmCellDigital, hint: hint };
  }
  function timeAsk(kind) {
    return function (L, n) {
      var it = freshPV({ id: 'time_' + kind }, 'pitch', function () { return tmItem(kind); }, function (x) { return x.key; });
      n = Math.min(n || 4, it.wrong.length + 1);
      if (it.variant === 'amPm') n = 2;
      var vals = choices(it.ans, it.wrong, n);
      return { variant: it.variant, text: it.text, pic: it.pic || null, say: it.say, fact: it.cell(it.ans).fact || [], answer: vals.indexOf(it.ans), target: it.key,
        hint: it.hint(1), hint2: it.hint(2),
        choices: vals.map(function (v) { var c = it.cell(v); return { label: c.label, html: c.html || null, say: [String(v).replace(':', ' ')], value: v, long: !!c.long }; }) };
    };
  }
  function timeGen(kind) {
    return function () {
      // Munch boards need several distinct goods: category boards (o'clock vs half past, or a shared minute)
      if (kind === 'hour_half') {
        var half = Math.random() < .5, hours = A.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), gi = 0, bi = 0;
        function mk(h, m) { var lab = tmFmt(h, m); return { label: lab, html: tmFace(h, m, true), fact: ['w_thats', { id: 'tm_say', text: lab.replace(':', ' ') }], k: lab, long: true }; }
        return { text: half ? 'Munch the half-past times' : 'Munch the o’clock times', say: [{ id: half ? 'tm_munch_half' : 'tm_munch_hour', text: half ? 'Munch the half past times' : 'Munch the oclock times' }], target: half ? 'half' : 'hour',
          stepHint: function (cell, lvl) { var p = tmParse(cell && cell.label); if (!p) return ''; var face = tmFace(p.h, p.m); return box(face, lvl >= 2 ? 'That clock shows <b>' + cell.label + '</b>.' : (half ? 'Half past: long hand on 6.' : 'O’clock: long hand on 12.')); },
          good: function () { return mk(hours[gi++ % 12], half ? 30 : 0); },
          bad: function () { return mk(hours[(bi++ + 3) % 12], half ? 0 : 30); } };
      }
      var mm = pick([5, 10, 15, 20, 25, 35, 40, 45, 50, 55]), hours = A.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), gi = 0, bi = 0;
      var other = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].filter(function (x) { return x !== mm; });
      function mk2(h, m) { var lab = tmFmt(h, m); return { label: lab, html: tmFace(h, m, true), fact: ['w_thats', { id: 'tm_say', text: lab.replace(':', ' ') }], k: lab, long: true }; }
      return { text: 'Munch the clocks that show ' + em(':' + (mm < 10 ? '0' : '') + mm), say: [{ id: 'tm_munch_min', text: 'Munch the clocks that show ' + mm + ' minutes' }], target: mm,
        stepHint: function (cell, lvl) { var p = tmParse(cell && cell.label); if (!p) return ''; return box(tmFace(p.h, p.m), lvl >= 2 ? 'Count by 5s to the long hand: <b>' + cell.label + '</b>.' : 'Each number the long hand passes is 5 minutes.'); },
        good: function () { return mk2(hours[gi++ % 12], mm); },
        bad: function () { return mk2(hours[(bi++ + 4) % 12], pick(other)); } };
    };
  }
  ladder({ id: 'tm1', subject: 'math', band: 'E', grade: '1', strand: 'Measurement', std: '1.MD.B.3', after: 'pv_ten_more', introLine: 'st_new_step', secs: [13, 14],
    groups: [{ id: 'g_time1', ids: ['time_hour_half'] }],
    steps: [{ id: 'time_hour_half', name: 'Time to the hour and half hour', short: 'Read and match clocks (o’clock and half past)', std: '1.MD.B.3',
      gen: timeGen('hour_half'), ask: timeAsk('hour_half'),
      intro: { line: 'st_new_step', example: '3:00 · 3:30' } }] });
  ladder({ id: 'tm2', subject: 'math', band: 'E', grade: '2', strand: 'Measurement', std: '2.MD.C.7', after: 'skip_count', introLine: 'st_new_step', secs: [14, 15],
    groups: [{ id: 'g_time2', ids: ['time_5min'] }],
    steps: [{ id: 'time_5min', name: 'Time to 5 minutes', short: '5-minute times and a.m. / p.m.', std: '2.MD.C.7',
      gen: timeGen('5min'), ask: timeAsk('5min'), maxChoices: 4,
      intro: { line: 'st_new_step', example: '3:20 · a.m. / p.m.' } }] });
  /* qcoins (batch 3): US coin recognition (G1) then mixed totals to $1 (2.MD.C.8). Original items from Learning Coach money family. Coins are SVG, never emoji. */
  function cnIds() { return ['penny', 'nickel', 'dime', 'quarter']; }
  function cnMeta(id) { return A.Coins.META[id]; }
  function cnFmt(n) { return A.Coins.fmt(n); }
  function cnOne(id, small) { return A.Coins.one(id, { small: !!small }); }
  function cnBag(bag, small) { return A.Coins.bag(bag, { small: !!small }); }
  function cnTotal(bag) { return A.Coins.cents(bag); }
  function cnCount(bag) { var n = 0, k; for (k in bag) n += bag[k] | 0; return n; }
  function cnKey(bag) { return A.Coins.ORDER.map(function (id) { return id[0] + (bag[id] | 0); }).join(''); }
  function cnClone(bag) { var o = {}, k; for (k in bag) o[k] = bag[k] | 0; return o; }
  function cnRandBag(maxCents) {
    maxCents = maxCents || 100;
    var bag, t, g = 0;
    do {
      bag = { quarter: Math.random() < .55 ? rnd(0, 3) : 0, dime: rnd(0, 4), nickel: rnd(0, 3), penny: rnd(0, 6) };
      if (cnCount(bag) < 2) bag.penny = rnd(2, 5);
      t = cnTotal(bag);
      // trim oversized bags
      while (t > maxCents && (bag.quarter || bag.dime || bag.nickel || bag.penny)) {
        if (bag.quarter && t - 25 >= 10) bag.quarter--;
        else if (bag.dime && t - 10 >= 5) bag.dime--;
        else if (bag.nickel && t - 5 >= 1) bag.nickel--;
        else if (bag.penny) bag.penny--;
        else break;
        t = cnTotal(bag);
      }
    } while ((t < 8 || t > maxCents || cnCount(bag) < 2) && ++g < 40);
    return bag;
  }
  function cnSwapND(bag) {
    var o = cnClone(bag), n = o.nickel | 0, d = o.dime | 0;
    o.nickel = d; o.dime = n; return o;
  }
  function cnForgot(bag) {
    var o = cnClone(bag), order = A.Coins.ORDER.filter(function (id) { return (o[id] | 0) > 0; });
    if (!order.length) return o;
    var id = pick(order); o[id]--; if (!o[id]) delete o[id]; return o;
  }
  function cnUniqCents(ans, list) {
    var out = [], seen = {}; seen[ans] = 1;
    list.forEach(function (x) { x = x | 0; if (x > 0 && x <= 100 && !seen[x]) { seen[x] = 1; out.push(x); } });
    return out;
  }
  function cnDistractors(bag) {
    var ans = cnTotal(bag), count = cnCount(bag), swapped = cnTotal(cnSwapND(bag)), forgot = cnTotal(cnForgot(bag));
    return cnUniqCents(ans, [count, swapped, forgot, ans + 5, ans - 5, ans + 10, ans - 1, ans + 1, ans + 25, count * 5, count * 10]);
  }
  function cnCellCents(v) { return { label: cnFmt(v), fact: ['w_thats', { id: 'cn_cents', text: (v | 0) + ' cents' }] }; }
  function cnCellName(id) { var m = cnMeta(id); return { label: m.name, html: cnOne(id, true), fact: ['w_thats', { id: 'cn_' + id, text: 'a ' + m.name }], long: true }; }
  function cnCellBag(bag) { return { label: cnFmt(cnTotal(bag)), html: cnBag(bag, true), fact: ['w_thats', { id: 'cn_tot', text: cnTotal(bag) + ' cents' }], long: true, bag: cnClone(bag) }; }
  function cnNameWrong(id) { return cnIds().filter(function (x) { return x !== id; }); }
  function cnValueWrong(v) { return cnUniqCents(v, [1, 5, 10, 25, v === 10 ? 5 : 10, v === 5 ? 10 : 5, v === 1 ? 5 : 1, v === 25 ? 10 : 25]); }

  function cnRecognizeItem() {
    var id = pick(cnIds()), m = cnMeta(id), r = Math.random();
    // how many pennies equal this coin? (nickel/dime/quarter)
    if (r < .18 && id !== 'penny') {
      return { variant: 'howMany', key: 'how' + id + m.v, ans: m.v, wrong: cnUniqCents(m.v, [m.v + 1, m.v - 1, m.v === 5 ? 10 : 5, m.v === 10 ? 5 : 10, 25, 1, m.v * 2]).slice(0, 3),
        pic: cnOne(id), text: 'How many pennies equal one ' + em(m.name) + '?',
        say: [{ id: 'cn_howmany', text: 'How many pennies equal one ' + m.name + '?' }], cell: function (v) { return { label: String(v), fact: ['w_thats', v] }; },
        hint: function (l) { return box(cnOne(id), l >= 2 ? 'One ' + m.name + ' is <b>' + m.label + '</b>, so <b>' + m.v + '</b> pennies.' : 'A penny is 1¢. Match the coin\'s value.'); } };
    }
    // which is worth the most / least
    if (r < .36) {
      var most = Math.random() < .5, ansId = most ? 'quarter' : 'penny';
      return { variant: 'mostLeast', key: (most ? 'most' : 'least') + rnd(1, 9), ans: ansId, wrong: cnIds().filter(function (x) { return x !== ansId; }),
        text: most ? 'Which coin is worth the most?' : 'Which coin is worth the least?',
        say: [{ id: most ? 'cn_most' : 'cn_least', text: most ? 'Which coin is worth the most?' : 'Which coin is worth the least?' }], cell: cnCellName,
        hint: function (l) { return box(cnIds().map(function (x) { return cnOne(x, true); }).join(''), l >= 2 ? (most ? 'The <b>quarter</b> is 25¢ — the most.' : 'The <b>penny</b> is 1¢ — the least.') : 'Compare the numbers on the coins.'); } };
    }
    if (r < .58) {
      return { variant: 'nameCoin', key: 'name' + id + rnd(1, 6), ans: id, wrong: cnNameWrong(id), pic: cnOne(id), text: 'What coin is this?',
        say: [{ id: 'cn_name', text: 'What coin is this?' }], cell: cnCellName,
        hint: function (l) { return box(cnOne(id), l >= 2 ? 'This is a <b>' + m.name + '</b>. It is worth <b>' + m.label + '</b>.' : 'Look at the size and the number on the coin.'); } };
    }
    if (r < .79) {
      return { variant: 'valueCoin', key: 'val' + id + rnd(1, 6), ans: m.v, wrong: cnValueWrong(m.v), pic: cnOne(id), text: 'How much is this coin worth?',
        say: [{ id: 'cn_val', text: 'How much is this coin worth?' }], cell: cnCellCents,
        hint: function (l) { return box(cnOne(id), l >= 2 ? 'A <b>' + m.name + '</b> is worth <b>' + m.label + '</b>.' : 'Read the number on the coin.'); } };
    }
    return { variant: 'pickCoin', key: 'pick' + id + rnd(1, 6), ans: id, wrong: cnNameWrong(id), text: 'Which coin is worth ' + em(m.label) + '?',
      say: [{ id: 'cn_pick', text: 'Which coin is worth ' + m.v + ' cents?' }], cell: cnCellName,
      hint: function (l) { return box(cnOne(id), l >= 2 ? 'The coin with <b>' + m.label + '</b> on it is the <b>' + m.name + '</b>.' : 'Match the value on the coin face.'); } };
  }

  function cnTotalItem() {
    var r = Math.random();
    // which group is worth more
    if (r < .28) {
      var a, b, ga = 0;
      do { a = cnRandBag(90); b = cnRandBag(90); } while ((cnTotal(a) === cnTotal(b) || cnKey(a) === cnKey(b)) && ++ga < 30);
      if (cnTotal(a) === cnTotal(b)) { b.penny = (b.penny | 0) + 1; }
      var left = cnTotal(a), right = cnTotal(b), more = left > right ? 'A' : 'B';
      var pic = '<div class="qcoin-cmp"><div class="qcoin-grp"><span class="qcoin-tag">A</span>' + cnBag(a) + '</div><div class="qcoin-grp"><span class="qcoin-tag">B</span>' + cnBag(b) + '</div></div>';
      return { variant: 'worthMore', key: 'more' + cnKey(a) + 'x' + cnKey(b), ans: more, wrong: [more === 'A' ? 'B' : 'A'], pic: pic,
        text: 'Which group is worth more?', say: [{ id: 'cn_more', text: 'Which group is worth more, A or B?' }],
        cell: function (v) { return { label: 'Group ' + v, fact: ['w_thats', { id: 'cn_grp' + v, text: 'group ' + v }] }; },
        hint: function (l) { return box(pic, l >= 2 ? 'Group A is <b>' + cnFmt(left) + '</b>. Group B is <b>' + cnFmt(right) + '</b>. So <b>' + more + '</b> is worth more.' : 'Count bigger coins first, then add.'); },
        bags: { A: a, B: b } };
    }
    // which set makes N¢
    if (r < .55) {
      var bag = cnRandBag(100), tot = cnTotal(bag), wrongBags = [], seen = {}, seenTot = {}, g = 0;
      seen[cnKey(bag)] = 1; seenTot[tot] = 1;
      while (wrongBags.length < 3 && ++g < 60) {
        var w = g % 3 === 1 ? cnSwapND(bag) : g % 3 === 2 ? cnForgot(bag) : cnRandBag(100);
        var wt = cnTotal(w);
        if (wt === tot || seenTot[wt] || seen[cnKey(w)]) {
          w.penny = (w.penny | 0) + (wrongBags.length + 1 + (g % 4));
          wt = cnTotal(w);
        }
        if (wt === tot || wt < 1 || wt > 100 || seenTot[wt] || seen[cnKey(w)]) continue;
        seen[cnKey(w)] = 1; seenTot[wt] = 1; wrongBags.push(w);
      }
      // last-resort distinct cent values as tiny bags
      var fallback = [tot + 5, tot - 5, tot + 10, tot - 1, tot + 1, tot + 25, tot - 10].filter(function (x) { return x > 0 && x <= 100 && !seenTot[x]; });
      while (wrongBags.length < 3 && fallback.length) {
        var v = fallback.shift(), fb = { penny: v };
        if (v >= 25) { fb = { quarter: Math.floor(v / 25), penny: v % 25 }; }
        else if (v >= 10) { fb = { dime: Math.floor(v / 10), penny: v % 10 }; }
        seenTot[v] = 1; wrongBags.push(fb);
      }
      return { variant: 'pickSet', key: 'set' + cnKey(bag), ans: cnKey(bag), wrong: wrongBags.map(cnKey), ansBag: cnClone(bag), wrongBags: wrongBags,
        text: 'Which set makes ' + em(cnFmt(tot)) + '?', say: [{ id: 'cn_set', text: 'Which set makes ' + tot + ' cents?' }],
        cell: function (k) {
          var b0 = k === cnKey(bag) ? bag : (wrongBags.filter(function (w) { return cnKey(w) === k; })[0] || bag);
          return cnCellBag(b0);
        },
        hint: function (l) { return box(cnBag(bag), l >= 2 ? 'Count bigger coins first: <b>' + cnFmt(tot) + '</b>.' : 'Add the values. Quarters, then dimes, nickels, pennies.'); } };
    }
    // how much money?
    var bag2 = cnRandBag(100), tot2 = cnTotal(bag2), wrong2 = cnDistractors(bag2).slice(0, 3);
    return { variant: 'countCoins', key: 'cnt' + cnKey(bag2), ans: tot2, wrong: wrong2, pic: cnBag(bag2),
      text: 'How much money?', say: [{ id: 'cn_how', text: 'How much money?' }], cell: cnCellCents,
      hint: function (l) { return box(cnBag(bag2), l >= 2 ? 'Count bigger coins first. Total: <b>' + cnFmt(tot2) + '</b>.' : 'Quarters (25¢), dimes (10¢), nickels (5¢), pennies (1¢).'); } };
  }

  function coinAsk(kind) {
    return function (L, n) {
      var it = freshPV({ id: kind }, 'pitch', function () { return kind === 'coin_values' ? cnRecognizeItem() : cnTotalItem(); }, function (x) { return x.key; });
      n = Math.min(n || 4, (it.wrong && it.wrong.length ? it.wrong.length : 3) + 1);
      if (it.variant === 'worthMore') n = 2;
      var vals;
      if (it.variant === 'pickSet') {
        var bags = [it.ansBag].concat(it.wrongBags.slice(0, n - 1));
        bags = A.shuffle(bags.slice());
        return { variant: it.variant, text: it.text, pic: it.pic || null, say: it.say, fact: ['w_thats', { id: 'cn_tot', text: cnTotal(it.ansBag) + ' cents' }],
          answer: bags.findIndex(function (b) { return cnKey(b) === cnKey(it.ansBag); }), target: it.key,
          hint: it.hint(1), hint2: it.hint(2),
          choices: bags.map(function (b) { var c = cnCellBag(b); return { label: c.label, html: c.html, say: [cnTotal(b) + ' cents'], value: cnKey(b), long: true }; }) };
      }
      vals = choices(it.ans, it.wrong, n);
      return { variant: it.variant, text: it.text, pic: it.pic || null, say: it.say, fact: (it.cell(it.ans).fact || []),
        answer: vals.indexOf(it.ans), target: it.key, hint: it.hint(1), hint2: it.hint(2),
        choices: vals.map(function (v) { var c = it.cell(v); return { label: c.label, html: c.html || null, say: [String(c.label).replace('¢', ' cents')], value: v, long: !!c.long }; }) };
    };
  }
  function coinGen(kind) {
    return function () {
      if (kind === 'coin_values') {
        // category board: munch one coin type; goods share the type, bads are the other three (cycled)
        var want = pick(cnIds()), others = cnIds().filter(function (x) { return x !== want; }), bi = 0, gi = 0;
        return { text: 'Munch the ' + cnMeta(want).names, say: [{ id: 'cn_munch_' + want, text: 'Munch the ' + cnMeta(want).names }], target: want,
          stepHint: function (cell, lvl) { return box(cell && cell.html || '', lvl >= 2 ? 'That is a <b>' + (cell && cell.label) + '</b>.' : 'Match the coin.'); },
          good: function () { var c = cnCellName(want); c.k = want + (gi++); return c; },
          bad: function () { var id = others[bi++ % others.length], c = cnCellName(id); c.k = id + bi; return c; } };
      }
      // money_coins: munch groups worth a target amount band, or "more than 50¢"
      var over = Math.random() < .5, target = over ? 50 : pick([25, 30, 40, 50, 60, 75]);
      function mk() {
        var b, g = 0;
        do { b = cnRandBag(100); } while (++g < 30 && (over ? cnTotal(b) <= target : cnTotal(b) !== target && Math.abs(cnTotal(b) - target) > 15));
        if (!over) {
          // force exact-ish by adjusting pennies
          var need = target - cnTotal(b); b.penny = Math.max(0, (b.penny | 0) + need);
          if (cnTotal(b) !== target) { b = { quarter: Math.floor(target / 25), dime: 0, nickel: 0, penny: 0 }; var rem = target % 25; b.dime = Math.floor(rem / 10); rem %= 10; b.nickel = Math.floor(rem / 5); b.penny = rem % 5; }
        }
        return cnCellBag(b);
      }
      function mkBad() {
        var b, g = 0;
        do { b = cnRandBag(100); } while (++g < 30 && (over ? cnTotal(b) > target : cnTotal(b) === target));
        if (!over && cnTotal(b) === target) b = cnForgot(b);
        if (over && cnTotal(b) > target) { b = cnForgot(b); if (cnTotal(b) > target) b = { penny: rnd(3, 12) }; }
        return cnCellBag(b);
      }
      return { text: over ? 'Munch groups worth more than ' + cnFmt(target) : 'Munch groups worth ' + cnFmt(target),
        say: [{ id: 'cn_munch_tot', text: over ? 'Munch groups worth more than ' + target + ' cents' : 'Munch groups worth ' + target + ' cents' }], target: (over ? 'gt' : 'eq') + target,
        stepHint: function (cell, lvl) { return box(cell && cell.html || '', lvl >= 2 ? 'That group is <b>' + (cell && cell.label) + '</b>.' : 'Count bigger coins first.'); },
        good: mk, bad: mkBad };
    };
  }

  /* qarrays: 2.OA.C.4 rectangular arrays up to 5×5; total = repeated addition. After even/odd (i-Ready/Khan OA order). */
  function arPickRC(allowOne) {
    var r = rnd(2, 5), c = rnd(2, 5);
    // occasionally allow a 1-row or 1-col for "how many rows / in each row"
    if (allowOne && Math.random() < .18) { if (Math.random() < .5) r = 1; else c = 1; }
    return { r: r, c: c };
  }
  function arUniq(ans, pool) {
    var out = [], seen = {}, i, v; seen[String(ans)] = 1;
    for (i = 0; i < pool.length; i++) {
      v = pool[i]; if (v == null || seen[String(v)]) continue;
      seen[String(v)] = 1; out.push(v);
    }
    return out;
  }
  function arTotalWrong(r, c) {
    var tot = r * c, pool = [r + c, c, r, tot + c, tot - c, tot + r, tot - r, (r + 1) * c, Math.max(1, r - 1) * c, r * (c + 1), r * Math.max(1, c - 1), tot + 1, tot - 1];
    return arUniq(tot, pool);
  }
  function arAddWrong(r, c) {
    var right = A.Arrays.addSentence(r, c), pool = [], i;
    // wrong repeated addend (rows instead of cols)
    if (r !== c) pool.push(A.Arrays.addSentence(c, r));
    // off by one row
    if (r + 1 <= 5) pool.push(A.Arrays.addSentence(r + 1, c));
    if (r - 1 >= 1) pool.push(A.Arrays.addSentence(r - 1, c));
    // wrong addend ±1
    if (c + 1 <= 5) pool.push(A.Arrays.addSentence(r, c + 1));
    if (c - 1 >= 1) pool.push(A.Arrays.addSentence(r, c - 1));
    // r+c style single sum
    pool.push(r + ' + ' + c);
    pool.push(String(r * c));
    // one row only written once
    pool.push(String(c));
    return arUniq(right, pool);
  }
  function arItem() {
    var roll = Math.random(), allowOne = roll >= .28 && roll < .72;
    var rc = arPickRC(allowOne), r = rc.r, c = rc.c, tot = r * c, food = A.Arrays.pickFood(r * 17 + c * 3 + rnd(0, 2));
    var pic = A.Arrays.face(r, c, { foodObj: food, seed: r * 17 + c });
    var obj = tot === 1 ? food.one : food.many;
    // array_add ~28% (need ≥2 rows and ≥2 cols so repeated addition is clear)
    if (roll < .28 && r >= 2 && c >= 2) {
      var ans = A.Arrays.addSentence(r, c), wrong = arAddWrong(r, c).slice(0, 3);
      return { variant: 'array_add', key: 'add' + r + 'x' + c + food.id, ans: ans, wrong: wrong, pic: pic, r: r, c: c,
        text: 'Which addition sentence matches?',
        say: [{ id: 'ar_add', text: 'Which addition sentence matches ' + r + ' rows of ' + c + '?' }],
        cell: function (v) { return { label: String(v), fact: ['w_thats', { id: 'ar_sent', text: String(v) }], long: true }; },
        hint: function (l) { return box(pic, l >= 2 ? 'There are <b>' + r + '</b> rows of <b>' + c + '</b>, so <b>' + ans + '</b>.' : 'Each row has the same number. Add that number once per row.'); } };
    }
    // how many rows ~22%
    if (roll < .50) {
      var wr = arUniq(r, [c, r + 1, Math.max(1, r - 1), r + c, tot, c + 1, Math.max(1, c - 1)]).slice(0, 3);
      return { variant: 'howManyRows', key: 'rows' + r + 'x' + c + food.id, ans: r, wrong: wr, pic: pic, r: r, c: c,
        text: 'How many rows?',
        say: [{ id: 'ar_rows', text: 'How many rows?' }],
        cell: function (v) { return { label: String(v), fact: ['w_thats', v] }; },
        hint: function (l) { return box(pic, l >= 2 ? 'Count the horizontal lines of ' + obj + ': <b>' + r + '</b> rows.' : 'Rows go across. Count them.'); } };
    }
    // how many in each row ~22%
    if (roll < .72) {
      var wc = arUniq(c, [r, c + 1, Math.max(1, c - 1), r + c, tot, r + 1, Math.max(1, r - 1)]).slice(0, 3);
      return { variant: 'howManyInRow', key: 'cols' + r + 'x' + c + food.id, ans: c, wrong: wc, pic: pic, r: r, c: c,
        text: 'How many in each row?',
        say: [{ id: 'ar_inrow', text: 'How many in each row?' }],
        cell: function (v) { return { label: String(v), fact: ['w_thats', v] }; },
        hint: function (l) { return box(pic, l >= 2 ? 'Each row has <b>' + c + '</b> ' + obj + '.' : 'Pick one row and count across.'); } };
    }
    // array_total: how many in all
    var wt = arTotalWrong(r, c).slice(0, 3);
    return { variant: 'array_total', key: 'tot' + r + 'x' + c + food.id + rnd(1, 3), ans: tot, wrong: wt, pic: pic, r: r, c: c,
      text: 'How many in all?',
      say: [{ id: 'ar_tot', text: 'How many ' + food.many + ' in all?' }],
      cell: function (v) { return { label: String(v), fact: ['w_thats', v] }; },
      hint: function (l) { return box(pic, l >= 2 ? '<b>' + r + '</b> rows of <b>' + c + '</b> is <b>' + tot + '</b>.' : 'Add the same number for each row, or count them all.'); } };
  }
  function arrayAsk() {
    return function (L, n) {
      var it = freshPV({ id: 'arrays' }, 'pitch', arItem, function (x) { return x.key; });
      n = Math.min(n || 4, (it.wrong && it.wrong.length ? it.wrong.length : 3) + 1);
      n = Math.max(3, Math.min(4, n));
      var vals = choices(it.ans, it.wrong, n);
      return { variant: it.variant, text: it.text, pic: it.pic || null, say: it.say, fact: (it.cell(it.ans).fact || []),
        answer: vals.indexOf(it.ans), target: it.key, hint: it.hint(1), hint2: it.hint(2),
        choices: vals.map(function (v) { var c = it.cell(v); return { label: c.label, html: c.html || null, say: [String(c.label)], value: v, long: !!c.long }; }) };
    };
  }
  function arrayGen() {
    return function () {
      var mode = Math.random();
      // munch arrays with total N
      if (mode < .55) {
        var want = pick([6, 8, 9, 10, 12, 15, 16, 20, 25]), gi = 0, bi = 0;
        function mkGood() {
          var factors = [], rr, cc;
          for (rr = 1; rr <= 5; rr++) if (want % rr === 0) { cc = want / rr; if (cc >= 1 && cc <= 5) factors.push({ r: rr, c: cc }); }
          var f = factors.length ? factors[gi++ % factors.length] : { r: Math.min(5, want), c: 1 };
          var food = A.Arrays.pickFood(want + gi);
          return { label: String(want), html: A.Arrays.face(f.r, f.c, { foodObj: food, small: true }), fact: ['w_thats', want], k: 'g' + want + f.r + 'x' + f.c + gi };
        }
        function mkBad() {
          var t, g = 0, f;
          do { t = pick([4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 24, 25]); } while (t === want && ++g < 20);
          var factors = [];
          for (var rr = 1; rr <= 5; rr++) if (t % rr === 0) { var cc = t / rr; if (cc >= 1 && cc <= 5) factors.push({ r: rr, c: cc }); }
          f = factors.length ? factors[bi++ % factors.length] : { r: 2, c: 2 };
          var food = A.Arrays.pickFood(t + bi + 3);
          return { label: String(t), html: A.Arrays.face(f.r, f.c, { foodObj: food, small: true }), fact: ['w_thats', t], k: 'b' + t + f.r + 'x' + f.c + bi };
        }
        return { text: 'Munch arrays with ' + want + ' in all', say: [{ id: 'ar_munch_tot', text: 'Munch arrays with ' + want + ' in all' }], target: 'tot' + want,
          stepHint: function (cell, lvl) { return box(cell && cell.html || '', lvl >= 2 ? 'That array has <b>' + (cell && cell.label) + '</b>.' : 'Count the rows of food.'); },
          good: mkGood, bad: mkBad };
      }
      // munch arrays with R rows
      var rows = pick([2, 3, 4, 5]), gi2 = 0, bi2 = 0;
      return { text: 'Munch arrays with ' + rows + ' rows', say: [{ id: 'ar_munch_rows', text: 'Munch arrays with ' + rows + ' rows' }], target: 'rows' + rows,
        stepHint: function (cell, lvl) { return box(cell && cell.html || '', lvl >= 2 ? 'Count the rows across.' : 'Rows go across.'); },
        good: function () {
          var c = rnd(1, 5), food = A.Arrays.pickFood(rows * 9 + c + gi2);
          return { label: rows + ' rows', html: A.Arrays.face(rows, c, { foodObj: food, small: true }), fact: ['w_thats', rows], k: 'gr' + rows + 'c' + c + (gi2++) };
        },
        bad: function () {
          var rr, c, g = 0;
          do { rr = rnd(1, 5); c = rnd(1, 5); } while (rr === rows && ++g < 20);
          if (rr === rows) rr = rows === 5 ? 4 : rows + 1;
          var food = A.Arrays.pickFood(rr * 5 + c + bi2);
          return { label: rr + ' rows', html: A.Arrays.face(rr, c, { foodObj: food, small: true }), fact: ['w_thats', rr], k: 'br' + rr + 'c' + c + (bi2++) };
        } };
    };
  }
  ladder({ id: 'ar', subject: 'math', band: 'E', grade: '2', strand: 'Operations', std: '2.OA.C.4', after: 'evenodd', introLine: 'st_new_step', secs: [14, 16],
    groups: [{ id: 'g_arrays', ids: ['arrays'] }],
    steps: [{ id: 'arrays', name: 'Arrays', short: 'Rows and columns up to 5×5', std: '2.OA.C.4',
      gen: arrayGen(), ask: arrayAsk(), maxChoices: 4,
      intro: { line: 'st_new_step', example: '3 rows of 4 = 4 + 4 + 4' } }] });

  ladder({ id: 'cn1', subject: 'math', band: 'E', grade: '1', strand: 'Measurement', std: '1.MD (money intro)', after: 'time_hour_half', introLine: 'st_new_step', secs: [13, 14],
    groups: [{ id: 'g_coin1', ids: ['coin_values'] }],
    steps: [{ id: 'coin_values', name: 'Coin names and values', short: 'Penny, nickel, dime, quarter — name and cents', std: '1.MD (money intro)',
      gen: coinGen('coin_values'), ask: coinAsk('coin_values'), maxChoices: 4,
      intro: { line: 'st_new_step', example: 'dime = 10¢' } }] });
  ladder({ id: 'cn2', subject: 'math', band: 'E', grade: '2', strand: 'Measurement', std: '2.MD.C.8', after: 'time_5min', introLine: 'st_new_step', secs: [14, 16],
    groups: [{ id: 'g_coin2', ids: ['money_coins'] }],
    steps: [{ id: 'money_coins', name: 'Count mixed coins', short: 'Totals to $1 and which group is worth more', std: '2.MD.C.8',
      gen: coinGen('money_coins'), ask: coinAsk('money_coins'), maxChoices: 4,
      intro: { line: 'st_new_step', example: '1 quarter + 2 dimes = 45¢' } }] });


  ['k', 'wp', 'eo'].forEach(function (l) { LADDERS[l].steps.forEach(function (s) { s.ladder = l; s.band = LADDERS[l].band; s.intro = s.intro || { line: 'st_new_step', example: '' }; }); });
  LADDERS.t.steps[2].ladder = 't'; LADDERS.t.steps[2].band = 'T';
  // coach: steps use their own rule (§0.1); the type label shows on the grown-up page
  K.TYPES.step = { acc: .85, min: 12, days: 2, label: 'Step: 85%+ over 12+ answers on 2 days (a right answer after a hint counts half)' };
  var baseRule = K.rule; K.rule = function (sid) { return STEPS[sid] ? (STEPS[sid].rule ? { acc: STEPS[sid].rule.acc, min: STEPS[sid].rule.min, days: STEPS[sid].rule.days, label: 'Topic: ' + STEPS[sid].rule.min + '+ answers at ' + Math.round(STEPS[sid].rule.acc * 100) + '%+' } : K.TYPES.step) : baseRule(sid); };
  var baseType = K.typeOf; K.typeOf = function (sid) { return STEPS[sid] ? 'step' : baseType(sid); };
  // story map: the two "to 20" areas start on the new ladder
  if (A.Story && A.Story.AREAS) A.Story.AREAS.forEach(function (a) { if (a.skill === 'add20') a.skill = 'a_dbl'; if (a.skill === 'sub20') a.skill = 's_teen1'; if (a.skill === 'compare') a.skill = 'pk_compare'; });

  /* ---------- age bands ---------- */
  // T toddler (2-3: pictures, no fast-skip), P pre-K/K (4-5), E 6+. Age not set: P.
  function band(p) { var a = A.Age.of(p); if (a == null) return 'P'; return a <= 3 ? 'T' : a <= 5 ? 'P' : 'E'; }
  var FAST_MS = { E: 6000, P: 8000, T: 0 };

  /* ---------- mastery (§0.1) ---------- */
  var RULE = { min: 12, acc: .85, days: 2 };
  function ready(p, sid) {
    var R = (STEPS[sid] && STEPS[sid].rule) || RULE, lg = (K.data(p).log[sid] || []).slice(-40), n = lg.length, days = {}, sum = 0;
    lg.forEach(function (x) { days[x.d] = 1; sum += x.c >= 1 ? 1 : x.c > 0 ? .5 : 0; });
    var acc = n ? sum / n : 0, nd = Object.keys(days).length, why = [];
    if (n < R.min) why.push('needs ' + (R.min - n) + ' more answers'); if (acc < R.acc) why.push('accuracy ' + Math.round(acc * 100) + '% (needs ' + Math.round(R.acc * 100) + '%)'); if (nd < R.days) why.push('needs ' + R.days + ' separate days (has ' + nd + ')');
    // steady path: lots of evidence a little under the bar still counts (2.5x the answers at 5 points lower, on 3+ days),
    // so a kid who is nearly there does not grind one step for weeks
    if (why.length && n >= Math.min(40, Math.max(20, Math.round(R.min * 2.5))) && acc >= R.acc - .05 && nd >= 3) why = [];
    // batch1: a child cruising in this subject (A.Learn fit 'up': over 88% first try lately) masters a step after 10 first-try right
    // answers in a row (on 2 days; on one day for a step under her own grade) instead of 12 at 85%, so a strong kid is not held
    var sk1 = STEPS[sid]; if (why.length && sk1 && !sk1.topic && A.Learn && A.Learn.fitOf && A.Learn.fitOf(p, sk1.subject) === 'up') { var t8 = lg.slice(-10), a8 = t8.reduce(function (a, x) { return a + (x.c >= 1 ? 1 : 0); }, 0); var below = A.Learn.ownGrade && A.Learn.glTop(sid) != null && A.Learn.glTop(sid) < A.Learn.ownGrade(p); if (t8.length >= 10 && a8 >= 10 && (nd >= 2 || below)) why = []; }   // 2 separate days, unless the step is under her own grade (catching up)
    var st0 = p.skills && p.skills[sid], sk = STEPS[sid]; if (sk && sk.wrapOld && st0 && (st0.level || 0) < sk.subLevels - 1) why.push('level 2 not reached yet');
    return { ok: !why.length, acc: acc, n: n, days: nd, why: why };
  }
  // P gate before K addition (§1): count20, next20, more1, less1, compare mastered (placed counts) and make5 at 80%+
  function gateOk(p) {
    var ok = ['pk_count20', 'pk_next20', 'pk_more1', 'pk_less1', 'pk_compare'].every(function (id) { return C.state(p, id).status === 'mastered'; });
    var m = C.state(p, 'pk_make5'), lg = (K.data(p).log.pk_make5 || []).slice(-20), acc = lg.length ? lg.reduce(function (a, x) { return a + (x.c >= 1 ? 1 : x.c > 0 ? .5 : 0); }, 0) / lg.length : 0;
    return ok && (m.status === 'mastered' || acc >= .8);
  }
  /* qquality1: even/odd (2.OA.C.3) only after readiness — solid pairing (make 10) or within-20 add success,
     or Bubble skip-counting by 2s. Already-started evenodd keeps going. Band lock (GL=4) keeps it off younger bands. */
  function strongSkill(p, id) {
    var st = C.state(p, id); if (st && st.status === 'mastered') return true;
    if (A.Coach && A.Coach.ready && A.Coach.ready(p, id).ok) return true;
    var lg = ((A.Coach && A.Coach.data(p).log) || {})[id] || [];
    var last = lg.slice(-20); if (last.length < 8) return false;
    var a = last.reduce(function (s, x) { return s + (x.c >= 1 ? 1 : x.c > 0 ? .5 : 0); }, 0) / last.length;
    return a >= .8;
  }
  function evenOddReady(p) {
    if (!p) return false;
    var eo = C.state(p, 'evenodd');
    if (eo && (eo.status === 'mastered' || (eo.attempts | 0) > 0 || eo.placed)) return true;
    if (['make10', 'add20', 'a_mix', 'a_mk10', 'a_dbl'].some(function (id) { return strongSkill(p, id); })) return true;
    var g = p.games && p.games.bubble && p.games.bubble.steps && p.games.bubble.steps.e_skip;
    if (g && (g.status === 'mastered' || (g.n >= 12 && g.ok / g.n >= .8))) return true;
    return false;
  }

  /* ---------- missed facts + spaced review (§3.3) ---------- */
  var MBOX = [0, 1, 3, 7, 14];   // box 0 = next session (an hour or more later), then days
  function mq(p) { var c = K.data(p); return c.missed || (c.missed = {}); }
  function missedList(p) { var q = mq(p); return Object.keys(q).map(function (k) { return q[k]; }).filter(function (m) { return !m.grad; }); }
  function noteMiss(p, sid, key) {
    var q = mq(p), m = q[key] || (q[key] = { k: key, sid: sid, box: 0, days: [], n: 0 });
    m.box = 0; m.grad = false; m.n++; m.at = now(); m.due = now() + 3600e3; m.sid = sid; m.lad = STEPS[sid] && STEPS[sid].ladder;
  }
  function noteRight(p, key, first) {
    var m = mq(p)[key]; if (!m || m.grad) return;
    if (!first) return; if (now() < m.due) return;
    var dk = K.dayKey(now()); if (m.days.indexOf(dk) < 0) m.days.push(dk);
    if (m.days.length >= 3) { m.grad = true; m.gradAt = now(); return; }
    m.box = Math.min(MBOX.length - 1, m.box + 1); m.due = now() + MBOX[m.box] * DAY;
  }
  function dueFacts(p, lad) { if (!p) return []; var t = now(); return missedList(p).filter(function (m) { return m.due <= t && (!lad || m.lad === lad); }).sort(function (a, b) { return a.due - b.due; }).map(function (m) { return parseFact(m.k); }).filter(Boolean); }
  function topMissed(p, n) { return missedList(p).sort(function (a, b) { return b.n - a.n || b.at - a.at; }).slice(0, n || 5); }

  /* ---------- answers: fast-skip run, frustration guard, missed facts ---------- */
  var baseRecord = C.recordAnswer;
  C.recordAnswer = function (p, id, ok, opt) {
    var s = STEPS[id], sig = baseRecord(p, id, ok, opt); if (!s) return sig;
    ctx.p = p; opt = opt || {}; var st = C.state(p, id), S = K.session(p), key = opt.key != null ? String(opt.key) : null, first = !opt.hint;
    if (key) { if (!ok) noteMiss(p, id, key); else noteRight(p, key, first); }
    if (sig) delete sig.speedUp;   // steps skip with their own rule (no 5-question test-out round)
    var lim = s.topic ? (band(p) === 'T' ? 0 : FAST_MS[band(p)] + 2000) : FAST_MS[band(p)], fast = lim > 0 && opt.ms != null && opt.ms < lim;
    st.fsRun = ok && first && fast ? (st.fsRun || 0) + 1 : 0;
    if (st.fsRun >= 5 && st.status !== 'mastered') { st.speedy = true; if (sig) sig.speedy = true; }
    var w = S.stepWin || (S.stepWin = {}), win = w[id] || (w[id] = []); win.push(ok ? 1 : 0); if (win.length > 5) win.shift();
    var T = C.track(p, s.subject), prev = C.prevSkill(id);
    if (win.length >= 3 && win.filter(function (x) { return !x; }).length >= 3 && prev && !T.dropBack && !(p.math && p.math.pin)) { w[id] = []; var how = easier(p, s, prev); if (sig) sig[how] = prev.id; }
    return sig;
  };

  /* easier play after a struggle: up to 2 short easy rounds (one step back) per skill per day; after that the kid steps DOWN one
     step and stays there until a strong round there (8+ answers at 85%+), so she plays where she can succeed instead of bouncing */
  var DROP_CAP = 2;
  // step down to `prev`: a placed (or not yet earned) step is re-earned there; an earned one is practised, then she goes back up
  function stepDownTo(p, s, prev) {
    var T = C.track(p, s.subject), ps = C.state(p, prev.id);
    if (ps.status !== 'mastered' || ps.placed) { ps.status = 'open'; ps.placed = false; ps.checkAt = null; ps.introduced = true; T.returnTo = null; }
    else { ps.stepPractice = true; T.returnTo = s.id; }
    T.current = prev.id; T.dropBack = null; return 'stepDown';
  }
  function easier(p, s, prev) {
    var st = C.state(p, s.id), T = C.track(p, s.subject), d = A.today();
    if (st.dbDay !== d) { st.dbDay = d; st.dbN = 0; }
    if (st.dbN < DROP_CAP) { st.dbN++; T.dropBack = { to: prev.id, from: s.id }; return 'dropBack'; }
    var ps = C.state(p, prev.id); if (ps.status !== 'mastered' || ps.placed) { ps.status = 'open'; ps.placed = false; ps.checkAt = null; } else ps.stepPractice = true;
    T.current = prev.id; T.returnTo = ps.stepPractice ? s.id : null; T.dropBack = null; st.dbN = 0; return 'stepDown';
  }

  /* ---------- rounds ---------- */
  function due(st, t) { return st.status === 'mastered' && ((st.checkAt && st.checkAt <= t) || (st.revAt && st.revAt <= t)) && !(st.lastCheck && t - st.lastCheck < 3 * 3600e3); }
  function dueCheck(p, lad) { var t = now(), L = LADDERS[lad]; if (!L) return null; var fl = A.Learn && A.Learn.floor ? A.Learn.floor(p, 'math') : 0;
    // batch1: a check on a step under her floor is skipped (she is past it; missed facts still come back as review)
    for (var i = 0; i < L.ids.length; i++) { var st = C.state(p, L.ids[i]), gv = A.Learn && A.Learn.glTop ? A.Learn.glTop(L.ids[i]) : null; if (!due(st, t)) continue; if (gv != null && gv < fl) { st.checkAt = null; st.revAt = t + 30 * DAY; continue; } return C.byId[L.ids[i]]; } return null; }
  var basePick = C.pickRound;
  C.pickRound = function (p, opt) {
    ctx.p = p; C.ensure(p);
    var Tm = C.track(p, 'math');
    Tm = C.track(p, (opt && opt.subject) || 'math');
    // qquality1: never open a fresh evenodd round before pairing / within-20 readiness
    if (Tm.current === 'evenodd' && !evenOddReady(p)) { Tm.current = C.byId.a_mix ? 'a_mix' : (C.byId.add20 ? 'add20' : Tm.current); }
    if (Tm.dropBack && C.byId[Tm.dropBack.to]) { var d = Tm.dropBack; Tm.dropBack = null; return { skill: C.byId[d.to], level: 0, review: false, dropBack: true, from: d.from, nOk: 4 }; }
    var r = basePick(p, opt); if (!r || !r.skill) return r;
    var subj = C.subjectOf(r.skill), T = C.track(p, subj), cur = C.byId[T.current];
    if (cur && cur.isStep && !r.placement) {
      if (r.testOut) { r.testOut = false; delete r.nOk; }
      var chk = (T.rounds || 0) > 1 && (T.rounds % 2 === 0) ? dueCheck(p, cur.ladder) : null;
      if (chk) r = { skill: chk, level: 0, review: true, check: true, nOk: 4 };
      else if (r.review && r.skill.isStep) r = { skill: cur, level: 0, review: false };
      // boredom guard: never a 3rd round of the same step in a row while another subject can play
      var run = p.math.stepRun || (p.math.stepRun = { id: null, n: 0 });
      if (r.skill.id === run.id && run.n >= 2 && !(opt && opt.subject) && !(opt && opt.noSwitch)) {
        var w = C.mixWeights(p), other = Object.keys(w).filter(function (k) { return k !== subj && w[k] > 0 && C.list(k).length; });
        if (other.length) { run.n = 0; run.id = null; var r2 = basePick(p, { subject: pick(other) }); r2.rotated = true; return r2; }
      }
    }
    var rr = p.math.stepRun || (p.math.stepRun = { id: null, n: 0 });
    if (r.skill.isStep && !r.review) { if (rr.id === r.skill.id) rr.n++; else { rr.id = r.skill.id; rr.n = 1; } } else if (subj !== 'math' || !r.skill.isStep) { rr.id = null; rr.n = 0; }
    return r;
  };
  // next step to play after `id` (skips steps already mastered/placed); null at the end of the subject
  function nextOpen(p, id) { var n = C.nextSkill(id); while (n && C.state(p, n.id).status === 'mastered') n = C.nextSkill(n.id); return n; }
  // 2-3: math stays with picture counting (up to count to 20); the ceiling lifts by itself at age 4
  var BAND_TOP = { T: 'pk_count20' };
  // quality1 (A7): the band top can come from js/core/learn.js (band P stops at teen numbers unless a grown-up or played mastery lifts it)
  function bandTopOf(p) { return A.Steps && A.Steps.bandTop ? A.Steps.bandTop(p) : BAND_TOP[band(p)]; }
  function overTop(p, id) { var top = bandTopOf(p), L0 = C.list('math'); return !!(top && C.byId[id] && C.subjectOf(C.byId[id]) === 'math' && L0.indexOf(C.byId[id]) > L0.indexOf(C.byId[top])); }
  function advance(p, s, ev) {
    var T = C.track(p, s.subject);
    if (p.math.pin) return;
    if (T.returnTo && T.returnTo !== s.id) { T.current = T.returnTo; T.returnTo = null; ev.back = true; return; }
    var nx = nextOpen(p, s.id);
    if (nx && overTop(p, nx.id)) {   // 2-3 at the ceiling: the picture-counting steps take turns (variety, not one step all month)
      var L1 = C.list('math'), tb = bandTopOf(p), cyc = L1.slice(L1.indexOf(C.byId.t_count5), L1.indexOf(C.byId[tb]) + 1).map(function (k) { return k.id; });
      if (band(p) === 'T' && A.Learn) { var flt = A.Learn.floor(p, 'math'), cyt = cyc.filter(function (id) { var v = A.Learn.glTop(id); return v == null || v >= flt; }); if (cyt.length >= 2) cyc = cyt; }   // quality1: never wrap down below her floor
      if (band(p) !== 'T') { var fl = A.Learn ? A.Learn.floor(p, 'math') : 0; cyc = L1.slice(0, L1.indexOf(C.byId[tb]) + 1).filter(function (k) { var v = A.Learn ? A.Learn.glTop(k.id) : 9; return v == null || v >= fl; }).slice(-4).map(function (k) { return k.id; }); }   // quality1: band P top: its in-band top steps take turns
      ev.ladderTop = true; if (cyc.indexOf(s.id) >= 0) T.current = cyc[(cyc.indexOf(s.id) + 1) % cyc.length]; return; }
    if (!nx) {   // everything done: the top steps of her list take turns as mixed practice (no single step on repeat)
      var L2 = C.list(s.subject).filter(function (k) { return k.isStep; }).map(function (k) { return k.id; }), top = L2.slice(-4);
      ev.ladderTop = true; if (!s.topic) T.current = top[(top.indexOf(s.id) + 1) % top.length]; return; }
    if (s.ladder === 'pk' && nx.ladder !== 'pk' && !gateOk(p)) { ev.ladderTop = true; return; }
    if (nx.id === 'evenodd' && !evenOddReady(p)) { ev.ladderTop = true; return; }   // qquality1: wait for pairing / within-20 readiness
    var ns = C.state(p, nx.id); if (ns.status === 'locked') ns.status = 'open';
    T.current = nx.id; ev.nextStep = nx.id;
    if (nx.isStep && nx.stepIx > 0) ns.introduced = true; else if (!ns.introduced) ev.newSkill = nx.id;   // one "New skill!" card per ladder, not per step
  }
  function master(p, s, how, ev) {
    var st = C.state(p, s.id); st.status = 'mastered'; st.placed = false; st.earnedBy = how; st.pending = false; st.level = s.wrapOld ? s.subLevels - 1 : 0; st.revAt = now() + 7 * DAY; st.revN = 0; st.checkAt = how === 'speedy' ? now() + 3 * DAY : null; st.weak = 0;
    ev.mastered = s.id; ev.stepDone = s.id; advance(p, s, ev);
  }
  var baseFinish = C.finishRound;
  C.finishRound = function (p, round, res) {
    var s = round.skill; if (!s || !s.isStep) return baseFinish(p, round, res);
    ctx.p = p;
    var st = C.state(p, s.id), T = C.track(p, s.subject), tot = res.correct + res.wrong, acc = tot ? res.correct / tot : 1, ev = { acc: acc, step: true }, t = now();
    st.hist.push({ t: Date.now(), c: res.correct, w: res.wrong, l: 0, r: round.review ? 1 : 0, ms: res.ms || 0 }); if (st.hist.length > 60) st.hist = st.hist.slice(-60);
    st.timeMs += res.ms || 0; st.introduced = true; if (!st.day0) st.day0 = A.today();
    if (round.dropBack) { ev.back = true; ev.dropBack = true; ev.celebrate = true; st.speedy = false; return { say: ['st_back_up'], events: ev }; }
    if (round.review || round.check) {
      st.lastCheck = t;
      if (acc >= .75) { st.checkAt = null; st.revN = (st.revN || 0) + 1; st.revAt = t + (st.revN >= 1 ? 14 : 7) * DAY; ev.checked = s.id;
        if (st.placed && ready(p, s.id).ok) { st.placed = false; st.earnedBy = 'review'; ev.mastered = s.id; }   // v2p2b: a placed step proven in played reviews counts as earned (friends come from played mastery)
        return { say: ['fb_review_good'], events: ev }; }
      // quality1 (A3): one slip never reopens a step; only 2 reviews in a row under 70% do (learn.js softSlip)
      if (A.Learn && A.Learn.softSlip(p, s.id, acc)) { st.checkAt = null; ev.slip = s.id; return { say: ['fb_keep_going'], events: ev }; }
      st.status = 'open'; st.reopen = 2; st.checkAt = null; ev.reopened = s.id;
      if (!p.math.pin && T.current !== s.id) { T.returnTo = T.returnTo || T.current; T.current = s.id; }
      return { say: ['fb_keep_going'], events: ev };
    }
    if (st.reopen) {   // a missed check: 2 short rounds, then back (not a full restart)
      st.reopen--; if (acc < .75) st.reopen = Math.max(st.reopen, 1);
      if (!st.reopen) { st.status = 'mastered'; st.revAt = t + 7 * DAY; ev.remastered = s.id; advance(p, s, ev); return { say: ['fb_great_job'], events: ev }; }
      return { say: ['fb_one_more'], events: ev };
    }
    // stepped down to an already-earned step: back up after one strong round there
    if (st.stepPractice) { if (acc >= .85 && tot >= 8 && !(T.holdTo && A.today() < T.holdTo)) { T.holdTo = null; st.stepPractice = false; advance(p, s, ev); ev.back = true; return { say: ['fb_great_job'], events: ev }; } return { say: ['fb_one_more'], events: ev }; }
    if (st.status === 'mastered') { st.speedy = false; st.fsRun = 0; advance(p, s, ev); ev.again = true; return { say: ['fb_great_job'], events: ev }; }
    if (st.speedy && s.wrapOld && (st.level || 0) < s.subLevels - 1) { st.speedy = false; st.fsRun = 0; st.level++; st.subN = st.subC = 0; ev.levelUp = true; ev.speedy = true; return { say: ['st_speedy'], events: ev }; }
    if (st.speedy) { st.speedy = false; st.fsRun = 0; master(p, s, 'speedy', ev); ev.speedy = true; return { say: ['st_speedy'], events: ev }; }
    if (ready(p, s.id).ok) { master(p, s, 'play', ev); return { say: ['fb_mastered'], events: ev }; }
    // gentle step-down: 2 weak rounds in a row on a step the kid was placed past (not earned) -> practise the step below first
    // old two-level skills: level 2 after 8+ answers at 80%+ on level 1
    if (s.wrapOld && (st.level || 0) < s.subLevels - 1) { st.subN = (st.subN || 0) + tot; st.subC = (st.subC || 0) + res.correct; if (st.subN >= 8 && st.subC / st.subN >= .8 && acc >= .75) { st.level++; st.subN = st.subC = 0; ev.levelUp = true; return { say: ['fb_level_up', 'fb_trickier'], events: ev }; } }
    // plateau: many answers on this step and still well under the bar → one step easier (topics: into the band below), or,
    // on the very first step, a different step of the same band for a while (variety instead of a grind)
    st.plN = (st.plN || 0) + tot;
    var RR = s.rule || RULE, rl = (K.data(p).log[s.id] || []).slice(-20), rec = rl.length ? rl.reduce(function (a, x) { return a + (x.c >= 1 ? 1 : x.c > 0 ? .5 : 0); }, 0) / rl.length : 1;
    if (st.plN >= (s.topic ? 20 : 40) && rec < RR.acc - .1 && !p.math.pin) {
      st.plN = 0; st.weak = 0; var pv0 = C.prevSkill(s.id);
      // batch1: a 2nd plateau on the same step means it is past her for now: she stays on earned work 3 days before trying again
      st.plTimes = (st.plTimes || 0) + 1;
      if (pv0 && C.subjectOf(pv0) === s.subject) { var hw0 = stepDownTo(p, s, pv0); if (st.plTimes >= 2 && T.returnTo) { var hd = new Date(); hd.setDate(hd.getDate() + 3); T.holdTo = A.today(hd); st.plTimes = 0; ev.hold = T.holdTo; } ev.stepDown = pv0.id; ev.plateau = true; return { say: ['fb_detour'], events: ev }; }
      var sib = C.list(s.subject).filter(function (k) { return k.id !== s.id && k.isStep && k.band === s.band && C.state(p, k.id).status !== 'mastered'; })[0];
      if (sib) { var ss = C.state(p, sib.id); if (ss.status === 'locked') ss.status = 'open'; ss.introduced = true; T.current = sib.id; T.returnTo = null; ev.sideways = sib.id; return { say: ['fb_one_more'], events: ev }; }
    }
    st.weak = acc < .6 ? (st.weak || 0) + 1 : 0;
    if (st.weak >= 2 && !p.math.pin) {
      var pv = C.prevSkill(s.id);
      if (pv) { var ps = C.state(p, pv.id); st.weak = 0;
        if (ps.placed || ps.status !== 'mastered') { ps.status = 'open'; ps.placed = false; ps.checkAt = null; T.current = pv.id; T.returnTo = null; ev.stepDown = pv.id; return { say: ['fb_detour'], events: ev }; }
        var hw = easier(p, s, pv); ev[hw === 'stepDown' ? 'stepDown' : 'detour'] = pv.id; return { say: ['fb_detour'], events: ev }; }
    }
    return { say: acc >= .8 ? ['fb_one_more'] : acc >= .55 ? ['fb_practice_again'] : ['fb_practice_more'], events: ev };
  };

  /* ---------- warm-up probe (§0.2) ---------- */
  function probeDone(p, lad) { return !!((p.math.probe || {})[lad]); }
  var baseWants0 = null;
  var baseWants = K.wantsPlacement;
  K.wantsPlacement = function (p, sid) {
    var s = STEPS[sid]; if (!s) return baseWants(p, sid);
    if (s.topic) return false;   // topics: no warm-up card (they are the light 'break' content); she starts at her band and fast-skip moves her on
    var st = p.skills && p.skills[sid]; if (!(st && st.status !== 'mastered' && !probeDone(p, s.ladder) && C.track(p, s.subject).current === sid && !A.toddler(p))) return false;
    // batch1: after her first warm-up in this subject, a new ladder's warm-up only runs while she is cruising (fit 'up': over 88%
    // first try lately). A kid who earned the steps below at her level just keeps climbing in play; every extra warm-up was a
    // fresh chance for a lucky streak to place her a grade too high (sim: an average 1st grader ended up on 2nd-grade steps).
    var pb = p.math && p.math.probe || {}, before = Object.keys(pb).some(function (l) { return LADDERS[l] && (LADDERS[l].subject || 'math') === s.subject && !(LADDERS[l].steps[0] || {}).topic; });
    if (before && A.Learn && A.Learn.fitOf && A.Learn.fitOf(p, s.subject) !== 'up') return false;
    return true;
  };
  // plan: one item per step from the start step, about 6 picks: a long ladder strides (a right answer places every step up to it)
  function probePlan(p, sid) {
    var s = STEPS[sid], ids = C.list(s.subject).map(function (k) { return k.id; }), from = Math.max(0, ids.indexOf(sid)), left = ids.length - from, stride = Math.max(1, Math.ceil(left / PROBE_N)), plan = [];
    // a warm-up that starts in pre-K never places past make-5 (addition is earned in play, after the P gate)
    var mk = ids.indexOf('pk_make5'), ttop = bandTopOf(p) && s.subject === 'math' ? ids.indexOf(bandTopOf(p)) : -1, last = ids.length - 1; while (last > from && !STEPS[ids[last]]) last--; var end = mk >= 0 && from < mk ? mk - 1 : last; if (ttop >= from) end = Math.min(end, ttop); left = end - from + 1; var npv = ids.slice(from, end + 1).filter(function (x) { return /^pv_(tens|compare|ten_more)$/.test(x); }).length;   /* batch1: only the 3 quality1 place-value steps (the 2nd-grade pv_hto / pv_cmp3 count) */ left -= npv; /* quality1: the 3 new place-value steps do not stretch the stride (same picks as before below them; a strong kid still warms up through place value and even/odd) */ if (s.topic) { var BN0 = { T: 0, P: 1, E: 2 }; while (end > from && BN0[STEPS[ids[end]].band] > BN0[band(p)]) end--; left = end - from + 1; } stride = Math.max(1, Math.ceil(left / PROBE_N));
    for (var i = from; i <= end; i += stride) plan.push(i);
    if (s.topic) { var BN = { T: 0, P: 1, E: 2 }; while (end > from && BN[STEPS[ids[end]].band] > BN[band(p)]) end--; plan = plan.filter(function (i) { return i <= end; }); }
    if (plan[plan.length - 1] !== end) plan.push(end);
    // batch1: the FIRST pick above her own grade is asked twice in a row (two different items); both must be right to place past
    // it (one lucky answer never lifts her a grade). Later picks are asked once (the warm-up stays short for little ones).
    var own = A.Learn && A.Learn.ownGrade && !s.topic ? A.Learn.ownGrade(p) : null, dbl = false;
    if (own != null) plan = [].concat.apply([], plan.map(function (i) { var v = A.Learn.glTop(ids[i]); if (!dbl && v != null && v > own) { dbl = true; return [i, i]; } return [i]; }));
    return { lad: s.ladder, subj: s.subject, ids: ids, from: from, plan: plan, k: 0, right: -1, rightBefore: -1, asked: 0, askedIds: [], done: false };
  }
  function probeNext(pr) { return pr.done || pr.k >= pr.plan.length ? null : C.byId[pr.ids[pr.plan[pr.k]]]; }
  var PROBE_N = 7;
  function probeAnswer(pr, ok) {
    var ix = pr.plan[pr.k], again = pr.k > 0 && pr.plan[pr.k - 1] === ix;
    pr.asked++; pr.askedIds.push(pr.ids[ix]);
    if (ok) { if (!again) pr.rightBefore = pr.right; pr.right = ix; pr.k++; if (pr.k >= pr.plan.length) pr.done = true; }
    else { if (again) pr.right = pr.rightBefore; pr.done = true; }   // batch1: the 2nd ask of an above-grade pick missed: that pick does not count
  }
  // apply: steps up to the last right one are 'placed' (checked again in 3 days); the kid starts on the first step after it
  function probeFinish(p, pr) {
    var t = now(), start = pr.right < 0 ? pr.from : pr.right + 1, T = C.track(p, pr.subj), out = { placed: [], start: null }, pb = p.math.probe || (p.math.probe = {});
    // a right pick places every step up to it; the gap after it (strided over, not asked) is where she starts
    if (pr.right >= 0 && pr.k < pr.plan.length && pr.plan[pr.k] - pr.right > 1) start = pr.right + 1;
    for (var i = pr.from; i <= pr.right; i++) { var st = C.state(p, pr.ids[i]); if (st.status !== 'mastered') { st.status = 'mastered'; st.placed = true; st.placedBy = 'warmup'; st.introduced = true; st.level = C.byId[pr.ids[i]].subLevels ? C.byId[pr.ids[i]].subLevels - 1 : st.level; st.checkAt = pr.askedIds.indexOf(pr.ids[i]) >= 0 ? t + 3 * DAY : null; out.placed.push(pr.ids[i]); } }
    for (var j = pr.from; j <= Math.min(start, pr.ids.length - 1); j++) { var sk0 = STEPS[pr.ids[j]]; if (sk0) pb[sk0.ladder] = { at: t, asked: pr.asked, placed: out.placed.length }; }
    pb[pr.lad] = pb[pr.lad] || { at: t, asked: pr.asked, placed: out.placed.length };
    delete p.math.probeFromStart;
    var id = start < pr.ids.length ? pr.ids[start] : null, sk = id ? C.byId[id] : nextOpen(p, pr.ids[pr.ids.length - 1]);
    if (!sk && pr.subj === 'math') sk = C.byId[pr.ids[pr.ids.length - 1]];   // she showed it all: start at the top step
    if (sk && overTop(p, sk.id)) sk = C.byId[bandTopOf(p)];
    if (sk && sk.topic && { T: 0, P: 1, E: 2 }[sk.band] > { T: 0, P: 1, E: 2 }[band(p)]) sk = C.byId[pr.ids[pr.from]];
    var mk = pr.ids.indexOf('pk_make5'); if (sk && pr.subj === 'math' && mk >= 0 && pr.from <= mk && pr.ids.indexOf(sk.id) > mk && !gateOk(p)) sk = C.byId.pk_make5;
    if (sk && !p.math.pin) { var s2 = C.state(p, sk.id); if (s2.status !== 'mastered') { s2.status = 'open'; s2.placed = false; } else if (sk.id === 'pk_make5' && s2.placed) { s2.status = 'open'; s2.placed = false; s2.checkAt = null; } T.current = sk.id; T.returnTo = null; }
    out.start = sk ? sk.id : null; return out;
  }
  // Node / sim helper: run the whole probe with answer(step) -> bool
  function probeRun(p, sid, answer) { var pr = probePlan(p, sid), s; while ((s = probeNext(pr))) probeAnswer(pr, !!answer(s)); return probeFinish(p, pr); }

  /* ---------- migration of old saves (once; schema stays 4) ---------- */
  function migrate(p) {
    if (!p.math || p.math.v2p2 >= 2) return; var was = p.math.v2p2; p.math.v2p2 = 2;
    var cmp = p.skills.compare, pc = p.skills.pk_compare;
    if (cmp && pc && cmp.status === 'mastered' && pc.status !== 'mastered') { pc.status = 'mastered'; pc.placed = true; pc.placedBy = 'compare'; pc.from = 'compare';   // counted once as the old skill (if earned), never twice
      pc.introduced = true; pc.mergedFrom = 'compare'; }
    else if (cmp && pc && cmp.attempts) pc.mergedFrom = 'compare';
    if (was === 1) return;
    var sk = p.skills, T = p.math, cur = T.current, t = now(), any = Object.keys(p.skills).some(function (k) { return (sk[k].attempts || 0) > 0 || sk[k].status === 'mastered'; });
    if (!any && !cur) return;
    function placeIt(id, from) { var st = sk[id]; if (st.status !== 'mastered') { st.status = 'mastered'; st.placed = true; st.placedBy = 'migrate'; st.from = from || null; st.introduced = true; st.checkAt = t + 3 * DAY; } }
    var order = C.list('math').map(function (s) { return s.id; }), E = LADDERS.e20.ids, P = LADDERS.pk.ids;
    var a20 = sk.add20 || {}, s20 = sk.sub20 || {}, past = function (id) { return (sk[id] || {}).status === 'mastered'; };
    var newCur = cur;
    if (cur === 'compare' && past('compare')) newCur = 'pk_more1_30';
    if (cur === 'add20') { newCur = (a20.level || 0) >= 1 ? 's_teen1' : 'a_dbl'; if ((a20.level || 0) >= 1) ['a_dbl', 'a_ndbl', 'a_ten'].forEach(function (id) { placeIt(id, 'add20'); }); }
    else if (cur === 'sub20') { ['a_dbl', 'a_ndbl', 'a_ten', 'a_9', 'a_8', 'a_mk10'].forEach(function (id) { placeIt(id, 'add20'); }); if ((s20.level || 0) >= 1) ['s_teen1', 's_10', 's_noX'].forEach(function (id) { placeIt(id, 'sub20'); }); newCur = nextOpen(p, 'a_ten') ? null : null; newCur = E.filter(function (id) { return sk[id].status !== 'mastered'; })[0]; }
    else if (cur === 'compare' && !past('compare')) {
      // was on "bigger & smaller" (the old pre-K start): land on the first counting step not yet shown; the warm-up moves up from there
      if (past('count10')) placeIt('pk_count10', 'count10');
      newCur = P.filter(function (id) { return sk[id].status !== 'mastered'; })[0];
    }
    // everything below the old position is placed (it was placed / mastered there)
    var ci = order.indexOf(newCur), oldIx = { add20: order.indexOf('a_dbl'), sub20: order.indexOf('s_teen1') }[cur];
    if (ci < 0 && cur && C.byId[cur]) ci = order.indexOf(cur);
    if (ci >= 0) order.slice(0, ci).forEach(function (id) { if (STEPS[id] && !(cur === 'compare' && STEPS[id].ladder === 'pk')) placeIt(id, cur); });
    if (past('add20')) E.filter(function (id) { return id[0] === 'a'; }).forEach(function (id) { placeIt(id, 'add20'); });
    if (past('sub20')) E.filter(function (id) { return id[0] === 's'; }).forEach(function (id) { placeIt(id, 'sub20'); });
    if (newCur && C.byId[newCur]) { T.current = newCur; var ns = sk[newCur]; if (ns.status === 'locked') ns.status = 'open'; if (STEPS[newCur] && STEPS[newCur].stepIx > 0) ns.introduced = true; }
    // a migrated step's 3-day check would land on everyone at once: only steps right below the new position get one
    Object.keys(STEPS).forEach(function (id) { var st = sk[id]; if (st.placedBy === 'migrate') { var d = order.indexOf(newCur) - order.indexOf(id); if (!(d > 0 && d <= 2)) st.checkAt = null; } });
    void oldIx;
  }
  var baseEnsure = C.ensure;
  C.ensure = function (p) { var was = p.math && !(p.math.v2p2 >= 2) ? p.math.current : null; baseEnsure(p); if (p.math && !(p.math.v2p2 >= 2) && !ensuring) { ensuring = true; try { if (was) p.math.current = was; migrate(p); if (!C.byId[p.math.current] || C.byId[p.math.current].status !== 'active') { p.math.current = null; baseEnsure(p); } } finally { ensuring = false; } } return p; };
  var ensuring = false;
  // the state/current helpers inside curriculum-math call its own ensure; re-run ours through the exported one
  ['state', 'current'].forEach(function () {});

  /* ---------- rewards: a step group (or a retired skill earned in play) counts as one "skill" ---------- */
  var baseCount = C.masteredCount;
  C.masteredCount = function (p, subj) {
    C.ensure(p); subj = subj || 'math';
    var n = C.list(subj).filter(function (s) { return !s.isStep && p.skills[s.id].status === 'mastered' && !p.skills[s.id].placed; }).length;
    if (subj === 'math') ['add20', 'sub20', 'compare'].forEach(function (id) { var st = p.skills[id]; if (st && st.status === 'mastered' && !st.placed) n++; });
    Object.keys(LADDERS).forEach(function (lid) { var L = LADDERS[lid]; if ((L.subject || 'math') !== subj) return;
      (L.groups || []).forEach(function (g) { var sts = g.ids.map(function (id) { return p.skills[id]; }); if (sts.every(function (st) { return st && st.status === 'mastered'; }) && sts.some(function (st) { return !st.placed; }) && !g.ids.some(function (id) { return /^(add20|sub20)$/.test(p.skills[id].from || ''); })) n++; }); });
    return n;
  };
  void baseCount;

  /* ---------- grown-up page: steps as mastered / placed / in progress / locked (§5.3) ---------- */
  var baseSummary = C.summary;
  C.summary = function (p, id) {
    var m = baseSummary(p, id); if (!STEPS[id]) return m;
    var st = C.state(p, id), r = ready(p, id);
    m.label = st.reopen ? 'Quick review' : st.status === 'mastered' ? (st.placed ? 'Placed (skipped)' : st.earnedBy === 'speedy' ? 'Mastered (speedy)' : 'Mastered') : st.attempts ? 'In progress' : st.status === 'locked' ? 'Locked' : 'Not started';
    m.cls = st.status === 'mastered' ? 'mastered' : st.attempts ? 'practicing' : 'none'; m.ready = st.attempts ? r : null; m.rule = K.TYPES.step.label;
    return m;
  };

  A.Steps = { STEPS: STEPS, LADDERS: LADDERS, GROUP: GROUP, ladder: ladder, band: band, FAST_MS: FAST_MS, ready: ready, gateOk: gateOk, evenOddReady: evenOddReady, factHint: factHint, modeOf: modeOf, parseFact: parseFact, F: F, FAM: FAM,
    missedList: missedList, topMissed: topMissed, dueFacts: dueFacts, noteMiss: noteMiss, MBOX: MBOX, dueCheck: dueCheck, worked: worked, migrate: migrate,
    probePlan: probePlan, probeNext: probeNext, probeAnswer: probeAnswer, probeFinish: probeFinish, probeRun: probeRun, ctx: ctx, tf: tf, plate: plate };
})(window.Arcade);

/* fair starts by age for the step ladders (A.Levels, skills-grade1.js): 4 starts at the first pre-K counting step and 6 at
   doubles, each with the warm-up probe, so a kid who knows more moves up within a few picks */
(function (A) {
  'use strict';
  var Lv = A.Levels; if (!Lv || !A.Steps) return;
  // v2p2b: a new player starts ONE band below the age default, and the warm-up (about 7 picks across the whole math ladder,
  // striding) climbs: a strong kid is back at her age level, or above, after one warm-up
  //   default by age: 2 tiny counting, 3 count to 10, 4 pre-K counting, 5 adding to 10, 6 doubles to 20, 7-8 make ten / story problems
  //   start:          2-3 tiny counting, 4 count to 10, 5 pre-K counting, 6 adding to 10, 7-8 doubles to 20
  // batch1: starts are never under the band (6-7: 1st-2nd grade, 8+: 2nd grade, the top content today); the warm-up climbs
  var M = { toddler: 't_count3', pre: 't_count3', pk: 'count10', k: 'pk_count10', g1: 'a_dbl', g2: 'a_dbl', g3: 'a_mix' };
  Object.keys(M).forEach(function (b) { Lv.AGE_START[b].math = { id: M[b], level: 0 }; });
  Lv.START.math.pk = 'pk_count10'; Lv.START.math.k = 'pk_compare'; Lv.START.math[1] = 'a_dbl'; Lv.START.math[2] = 'a_mix';   // qquality1: evenodd opens only after readiness
  Lv.AGE_TEXT[2] = 'Tiny Picnic: counting to 3 and 5 with big pictures, colors'; Lv.AGE_TEXT[3] = 'counting to 3, 5 and 10, big & little letters, colors';
  Lv.AGE_TEXT[4] = 'counting to 10 and up (a quick warm-up finds the level), letters and beginning sounds (warm-up), shapes';
  Lv.AGE_TEXT[5] = 'counting to 20 and 30 and up (warm-up), first sight words'; Lv.AGE_TEXT[6] = 'doubles and facts to 20 and up (warm-up), sh / ch / th words and up';
  Lv.AGE_TEXT[7] = 'facts to 20 up to 2-digit adding (warm-up), sh / ch / th words and up (warm-up)'; Lv.AGE_TEXT[8] = 'facts to 20, then even & odd after pairing practice (warm-up), 3rd-grade sight words and up';
  // batch1: reading starts in band too (6-7 on digraphs, 8 on 3rd-grade sight words); the reading warm-up climbs from there
  Lv.AGE_START.pk.reading = { id: 'letters', level: 1 };   // batch1: 4 starts at pre-K letters (was K beginning sounds); the warm-up climbs
  Lv.AGE_START.g1.reading = { id: 'digraph', level: 0 }; Lv.AGE_START.g2.reading = { id: 'digraph', level: 0 }; Lv.AGE_START.g3.reading = { id: 'sight3', level: 1 };
  Lv.START.reading[1] = 'digraph'; Lv.START.reading[2] = 'longvowel'; Lv.AGE_TEXT.skip = Lv.AGE_TEXT[5];
})(window.Arcade);

/* v2p2b: tap-to-count on the tiny counting pictures (each tap lights the object and says the next number; no timer, no score) */
(function () {
  if (typeof document === 'undefined' || !document.addEventListener) return;
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('.st-objs.tap i'); if (!t) return;
    e.stopPropagation(); var box = t.parentNode;
    if (!t.classList.contains('tapped')) { t.classList.add('tapped'); var n = box.querySelectorAll('i.tapped').length; t.setAttribute('data-c', n); if (window.Arcade && Arcade.Voice && Arcade.Voice.say) Arcade.Voice.say([n], { kind: 'tap', bubble: false }); }
    else if (window.Arcade && Arcade.Voice && Arcade.Voice.say) Arcade.Voice.say([+t.getAttribute('data-c')], { kind: 'tap', bubble: false });
  }, true);
})();
