/* Blob Arcade — multiple-choice questions from the shared curriculum (used by Blob Baseball; any game can use it).
   A.Questions.make(skill, level, {choices: 3|4}) -> question:
     { skill, level, text: html for the big sign, pic: optional html (dots, pictures), say: [voice parts],
       choices: [{ label, html, say: [parts] }], answer: index of the ONE right choice, fact: [parts] said after }
   Where it comes from (the registry, see curriculum-math.js):
     1. skill.ask(level, n) if the skill provides one (the math skills get theirs below), else
     2. derived from the skill's Munch generator gen(level): its rule is the question, one good() cell is the right
        choice and bad() cells are the others. So any skill registered with A.Curriculum.register() works here too. */
(function (A) {
  'use strict';
  var C = A.Curriculum, rnd = A.rnd, pick = A.pick;
  var frame = function (v) { return C.frame(v); };
  function frames2(v) { return '<span class="frames2">' + C.frame(10) + C.frame(v - 10) + '</span>'; }
  function em(t) { return '<b class="hl">' + t + '</b>'; }

  // n distinct numbers: the answer plus nearby wrong ones inside [lo, hi]
  function near(T, n, lo, hi, offs) {
    offs = offs || [-1, 1, -2, 2, -3, 3, 4, -4];
    var out = [T], g = 0;
    while (out.length < n && g++ < 300) { var v = T + pick(offs); if (v >= lo && v <= hi && out.indexOf(v) < 0) out.push(v); }
    for (var v2 = lo; out.length < n && v2 <= hi + n; v2++) if (out.indexOf(v2) < 0) out.push(v2);
    return out;
  }
  function numQ(o, vals, T) { // shuffle number choices; o: {text, say, fact, pic, choiceHtml}
    var arr = A.shuffle(vals.slice());
    o.choices = arr.map(function (v) { return { label: String(v), html: o.choiceHtml ? o.choiceHtml(v) : null, say: [v], value: v }; });
    o.answer = arr.indexOf(T); delete o.choiceHtml; return o;
  }
  function sum(L, T) { var a = (T >= 2) ? rnd(1, T - 1) : rnd(0, T); return [a, T - a]; }

  var ASK = {
    count10: function (L, n) {
      var N = L ? rnd(3, 10) : rnd(1, 5), hi = L ? 10 : 6;
      if (Math.random() < .55) return numQ({ text: 'How many dots?', pic: frame(N), say: ['bbq_how_many_dots'], fact: ['bonus_wrong', N] }, near(N, n, 1, hi, [-1, 1, -2, 2]), N);
      return numQ({ text: 'Find the number ' + em(N), say: ['bbq_find', N], fact: ['bonus_wrong', N], choiceHtml: frame }, near(N, n, 1, hi, [-1, 1, -2, 2, 3]), N);
    },
    compare: function (L, n) {
      var max = L ? 20 : 10, big = Math.random() < .5, vals = [];
      while (vals.length < n) { var v = rnd(0, max); if (vals.indexOf(v) < 0) vals.push(v); }
      var T = big ? Math.max.apply(null, vals) : Math.min.apply(null, vals);
      return numQ({ text: 'Which number is the ' + em(big ? 'biggest' : 'smallest') + '?', say: [big ? 'bbq_biggest' : 'bbq_smallest'], fact: ['bonus_wrong', T] }, vals, T);
    },
    add10: function (L, n) { var T = L ? rnd(5, 10) : rnd(3, 6), ab = sum(L, T); return numQ({ text: 'What’s ' + ab[0] + ' + ' + ab[1] + '?', say: ['bbq_whats', ab[0], 'w_plus', ab[1]], fact: [ab[0], 'w_plus', ab[1], 'w_is', T] }, near(T, n, 0, 12), T); },
    sub10: function (L, n) {
      var T = L ? rnd(0, 7) : rnd(1, 4), maxA = L ? 10 : 6, a = T < maxA ? rnd(T + 1, maxA) : T, b = a - T;
      return numQ({ text: 'What’s ' + a + ' − ' + b + '?', say: ['bbq_whats', a, 'w_minus', b], fact: [a, 'w_minus', b, 'w_is', T] }, near(T, n, 0, 10), T);
    },
    make10: function (L, n) {
      var a = rnd(1, 9), T = 10 - a;
      return numQ({ text: a + ' + ' + em('?') + ' = 10', say: [a, 'w_plus', 'bbq_what_makes_ten'], fact: [a, 'w_plus', T, 'w_makes', 10] }, near(T, n, 0, 10), T);
    },
    teen: function (L, n) {
      var N = rnd(11, L ? 20 : 15), k = N - 10;
      if (Math.random() < .5) return numQ({ text: 'How many dots?', pic: frames2(N), say: ['bbq_how_many_dots'], fact: [10, 'w_plus', k, 'w_is', N] }, near(N, n, 10, 20, [-1, 1, -2, 2]), N);
      return numQ({ text: 'What’s 10 + ' + k + '?', say: ['bbq_whats', 10, 'w_plus', k], fact: [10, 'w_plus', k, 'w_is', N] }, near(N, n, 10, 20, [-1, 1, -2, 2, 3, -3]), N);
    },
    missing: function (L, n) {
      var m = L ? rnd(1, 9) : rnd(1, 4), max = L ? 10 : 6, a = rnd(1, Math.max(1, max - m)), c = a + m;
      return numQ({ text: a + ' + ' + em('?') + ' = ' + c, say: [a, 'w_plus', 'bbq_what_makes', c], fact: [a, 'w_plus', m, 'w_makes', c] }, near(m, n, 0, 10), m);
    },
    add20: function (L, n) { var T = L ? rnd(13, 18) : rnd(11, 14), a = rnd(Math.max(1, T - 10), Math.min(10, T - 1)), b = T - a; return numQ({ text: 'What’s ' + a + ' + ' + b + '?', say: ['bbq_whats', a, 'w_plus', b], fact: [a, 'w_plus', b, 'w_is', T] }, near(T, n, 8, 20), T); },
    sub20: function (L, n) {
      var T = L ? rnd(3, 9) : rnd(10, 14), a = T >= 10 ? rnd(T + 1, Math.min(20, T + 6)) : rnd(Math.max(11, T + 1), Math.min(18, T + 9)), b = a - T;
      return numQ({ text: 'What’s ' + a + ' − ' + b + '?', say: ['bbq_whats', a, 'w_minus', b], fact: [a, 'w_minus', b, 'w_is', T] }, near(T, n, 0, 20), T);
    },
    evenodd: function (L, n) {
      var max = L ? 20 : 10, even = Math.random() < .5, vals = [];
      function num(par) { var v; do { v = rnd(1, max); } while ((v % 2 === 0) !== par || vals.indexOf(v) >= 0); return v; }
      var T = num(even); vals.push(T); while (vals.length < n) vals.push(num(!even));
      return numQ({ text: 'Which number is ' + em(even ? 'even' : 'odd') + '?', say: [even ? 'bbq_even' : 'bbq_odd'], fact: [T, even ? 'w_is_even' : 'w_is_odd'] }, vals, T);
    }
  };
  /* qbatch-1107: Baseball variants on the same facts (exactly one correct of n). Same skill and range as the base fact;
     only the representation changes: true equation, hidden part (number bond), number-line spot, strategy (make 10). */
  function tx(id, t) { return [{ id: 'qb_' + id, text: t }]; }
  function choicesFrom(o, labels, right) { var arr = A.shuffle(labels.slice()); o.choices = arr.map(function (l) { return { label: l, say: [{ id: 'qb_c', text: l.replace('−', 'minus') }] }; }); o.answer = arr.indexOf(right); return o; }
  function bondPic(a, b, T, hide) { return '<span class="qb-bond"><b class="w">' + T + '</b><span><b' + (hide === 0 ? ' class="q">?' : '>' + a) + '</b><b' + (hide === 1 ? ' class="q">?' : '>' + b) + '</b></span></span>'; }
  function linePic(lo, hi, at) { var h = '<span class="qb-line">'; for (var v = lo; v <= hi; v++) h += '<i class="' + (v === at ? 'at' : '') + '">' + (v === lo || v === hi || v % 5 === 0 ? '<em>' + v + '</em>' : '') + '</i>'; return h + '</span>'; }
  var VAR = {
    trueEq: function (a, b, T, n, lo, hi) {
      var right = a + ' + ' + b + ' = ' + T, set = [right], g = 0;
      while (set.length < n && g++ < 60) { var w = T + pick([-2, -1, 1, 2]); if (w < lo || w > hi) continue; var aa = rnd(Math.max(0, w - 10), Math.min(10, w)), l = aa + ' + ' + (w - aa) + ' = ' + T; if (set.indexOf(l) < 0) set.push(l); }
      return set.length === n ? choicesFrom({ text: 'Which one is ' + em('true') + '?', say: tx('true', 'Which one is true?'), fact: [a, 'w_plus', b, 'w_is', T], variant: 'trueEq' }, set, right) : null;
    },
    bond: function (a, b, T, n, lo, hi) { var h = rnd(0, 1), m = h ? b : a; return numQ({ text: 'What is the hidden part?', pic: bondPic(a, b, T, h), say: tx('bond', 'What is the hidden part?'), fact: [a, 'w_plus', b, 'w_is', T], variant: 'bond' }, near(m, n, 0, 10), m); },
    bondFixed: function (a, b, T, h, n) { var m = h ? b : a; return numQ({ text: 'What is the hidden part?', pic: bondPic(a, b, T, h), say: tx('bond', 'What is the hidden part?'), fact: ['w_thats', m], variant: 'bond' }, near(m, n, 0, 20), m); },
    line: function (a, b, T, n, lo, hi) { var L0 = T > 10 ? 10 : 0, L1 = L0 + 10; if (T > L1) return null; return numQ({ text: 'What number is the star on?', pic: linePic(L0, L1, T), say: tx('line', 'What number is the star on?'), fact: ['w_thats', T], variant: 'line' }, near(T, n, L0, L1, [-1, 1, -2, 2]), T); },
    strategy: function (a, b, T, n) {
      var big = Math.max(a, b), sm = Math.min(a, b); if (big < 8 || big > 9 || T <= 10) return null; var give = 10 - big, right = '10 + ' + (sm - give);
      var set = [right, '10 + ' + sm, '10 + ' + (sm - give + 1), big + ' + ' + (sm - give)].filter(function (x, i, z) { return z.indexOf(x) === i; }).slice(0, n);
      return set.length === n ? choicesFrom({ text: big + ' + ' + sm + ' is the same as…', say: tx('strat', big + ' plus ' + sm + ' is the same as'), fact: [big, 'w_plus', sm, 'w_is', T], variant: 'strategy' }, set, right) : null;
    }
  };
  function withVariants(base, lo, hi, keys) {
    return function (L, n) {
      var q = base(L, n); if (Math.random() < .4) return q;
      var m = String(q.text).match(/(\d+) \+ (\d+)/); if (!m) return q; var a = +m[1], b = +m[2], T = a + b;
      var k = pick(keys), v = VAR[k](a, b, T, n, lo, hi); return v || q;
    };
  }
  ASK.add10 = withVariants(ASK.add10, 0, 12, ['trueEq', 'bond', 'line']);
  ASK.add20 = withVariants(ASK.add20, 8, 20, ['trueEq', 'bond', 'line', 'strategy', 'strategy']);
  // Original PV100 visual vocabulary; no recorded speech is required.
  A.PV100 = {
    blocks: function (t, o) { var h = '<span class="pv-pic" aria-label="' + t + ' tens and ' + o + ' ones">'; for (var i = 0; i < t; i++) h += '<i class="pv-rod"></i>'; h += '<span class="pv-ones">'; for (var j = 0; j < o; j++) h += '<i class="pv-one"></i>'; return h + '</span></span>'; },
    blocks3: function (h, t, o) { var x = '<span class="pv-pic pv3">'; for (var i = 0; i < h; i++) x += '<i class="pv-flat"></i>'; return x + this.blocks(t, o) + '</span>'; },
    chart: function (n, more) { var start = Math.floor((n - 1) / 10) * 10 - (more ? 0 : 10) + 1, h = '<span class="pv100-chart" aria-label="Two rows of a hundred chart">'; for (var i = 0; i < 20; i++) { var v = start + i; h += '<span' + (v === n ? ' class="from"' : '') + '>' + (v === n + (more ? 10 : -10) ? '?' : v) + '</span>'; } return h + '</span>'; },
    line: function (a, b, op) { var tens = Math.floor(b / 10) * 10, ones = b % 10, mid = op === '+' ? a + tens : a - tens, sign = op === '+' ? '+' : '−';
      return '<svg class="pv100-line" viewBox="0 0 320 100" role="img" aria-label="Start at ' + a + ', jump ' + sign + tens + ', then ' + sign + ones + '. Find the endpoint."><path d="M15 78H305 M25 78Q85 0 155 78 M155 78Q220 20 295 78" fill="none" stroke="#476e9b" stroke-width="3"/><g font-size="17" text-anchor="middle" fill="#263f5e"><text x="25" y="98">' + a + '</text><text x="155" y="98">' + mid + '</text><text x="295" y="98">?</text><text x="85" y="30">' + sign + tens + '</text><text x="225" y="43">' + sign + ones + '</text></g></svg>'; }
  };
  A.QVariants = VAR;

  Object.keys(ASK).forEach(function (id) { if (C.byId[id] && !C.byId[id].ask) C.byId[id].ask = ASK[id]; });

  // any skill with only a Munch generator: rule = question, one good cell + distinct bad cells
  function fromGen(s, L, n) {
    var r = s.gen(L), good = r.good(), cells = [good], seen = {}, g = 0; seen[good.label] = 1;
    while (cells.length < n && g++ < 200) { var b = r.bad(); if (!seen[b.label]) { seen[b.label] = 1; cells.push(b); } }
    var arr = A.shuffle(cells.slice());
    return { text: r.text, say: r.say, fact: good.fact || [], answer: arr.indexOf(good),
      choices: arr.map(function (c) { return { label: c.label, html: c.html || null, say: c.fact ? null : [c.label], long: !!c.long }; }) };
  }
  // how "big" a question is: its largest number (text, choices). Used for {hard: true}: bigger numbers within the same level.
  function size(q) { var m = 0, t = String(q.text || '') + ' ' + q.choices.map(function (c) { return c.label; }).join(' '); (t.match(/\d+/g) || []).forEach(function (x) { m = Math.max(m, +x); }); return m; }
  /* opt: {choices: 3|4, hard: true (pick the biggest-number question of a few — the top of the level)} */
  function make(skill, level, opt) {
    var s = typeof skill === 'string' ? C.byId[skill] : skill, n = (opt && opt.choices) || 4;
    function one() { return s.ask ? s.ask(level, n) : fromGen(s, level, n); }
    var q = one();
    if (opt && opt.hard) { var best = q, bs = size(q); for (var i = 0; i < 7; i++) { var c = one(), cs = size(c); if (cs > bs) { best = c; bs = cs; } } q = best; q.hard = true; }
    q.skill = s.id; q.level = level; q.key = q.text + '|' + q.choices.map(function (c) { return c.label; }).join(',');
    return q;
  }
  /* the difficulty ladder: every (skill, level) step of the active curriculum in order (optionally one subject only) */
  function ladder(subj) { var out = []; C.ACTIVE.forEach(function (s) { if (subj && (s.subject || 'math') !== subj) return; s.levels.forEach(function (_, l) { out.push({ skill: s, level: l }); }); }); return out; }
  /* a step relative to a kid's round. offset: -1 easier (one step down, or the same step with fewer choices at the very start),
     0 her level, 0.5 top of her level (bigger numbers), +1 a challenge (next step: next level or the next skill's easy level;
     at the very end: bigger numbers). Little ones (age <= 4) never jump to a new skill — their challenge stays in the same skill.
     Returns {skill, level, hard, easy, atLevel, offset} */
  function step(p, round, offset) {
    var sid = round.skill.id || round.skill, sk = C.byId[sid], L = ladder((sk && sk.subject) || 'math'), /* each subject is its own ladder */ idx = L.findIndex(function (x) { return x.skill.id === sid && x.level === round.level; });
    if (idx < 0) return { skill: C.byId[sid], level: round.level, hard: offset > 0, easy: offset < 0, atLevel: true, offset: offset };
    var here = L[idx], little = p && A.Age.little(p);
    if (offset < 0) {
      // batch-1107c (band lock): the easier pitch comes from the step below only as review of a real miss there; otherwise it is
      // the same step, made easier (fewer choices)
      var prev = idx > 0 ? L[idx - 1] : null, missed = prev && p && A.Coach && A.Coach.mostMissed ? A.Coach.mostMissed(p, prev.skill.id, 1) : [];
      if (prev && !round.review && missed && missed.length && missed[0].m > 0) return { skill: prev.skill, level: prev.level, atLevel: false, offset: -1, review: true };
      return { skill: here.skill, level: here.level, easy: true, atLevel: true, offset: -1 }; }
    if (offset === 0) return { skill: here.skill, level: here.level, atLevel: true, offset: 0 };
    if (offset < 1) return { skill: here.skill, level: here.level, hard: true, atLevel: true, offset: .5 };
    var nx = L[idx + 1];
    if (nx && (!little || nx.skill.id === sid)) return { skill: nx.skill, level: nx.level, atLevel: false, offset: 1, hard: nx.skill.id !== sid ? false : false };
    return { skill: here.skill, level: here.level, hard: true, atLevel: true, offset: 1 };
  }
  A.Questions = { make: make, ASK: ASK, fromGen: fromGen, ladder: ladder, step: step, size: size };
})(window.Arcade);
