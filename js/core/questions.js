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
    var here = L[idx], little = p && p.age != null && p.age <= 4;
    if (offset < 0) { if (idx > 0 && !round.review) return { skill: L[idx - 1].skill, level: L[idx - 1].level, atLevel: false, offset: -1 }; return { skill: here.skill, level: here.level, easy: true, atLevel: true, offset: -1 }; }
    if (offset === 0) return { skill: here.skill, level: here.level, atLevel: true, offset: 0 };
    if (offset < 1) return { skill: here.skill, level: here.level, hard: true, atLevel: true, offset: .5 };
    var nx = L[idx + 1];
    if (nx && (!little || nx.skill.id === sid)) return { skill: nx.skill, level: nx.level, atLevel: false, offset: 1, hard: nx.skill.id !== sid ? false : false };
    return { skill: here.skill, level: here.level, hard: true, atLevel: true, offset: 1 };
  }
  A.Questions = { make: make, ASK: ASK, fromGen: fromGen, ladder: ladder, step: step, size: size };
})(window.Arcade);
