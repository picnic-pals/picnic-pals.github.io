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
        return { text: 'Munch the ones that make ' + em(T), hint: 'Add them up!', say: ['munch_rule_make', T],
          good: function () { return sum(T); }, bad: function () { return sum(near(T, 1, 10, [-2, -1, 1, 2])); } };
      } },
    { id: 'sub10', name: 'Take away to 10', short: 'Subtraction within 10', strand: 'Add & subtract', std: '1.OA.6', grade: '1', sayFact: true,
      levels: ['Small take-aways', 'Take away within 10'],
      intro: { line: 'skill_sub10', example: '<b>5 − 2</b> makes <b>3</b>' },
      gen: function (L) {
        var T = L ? rnd(0, 7) : rnd(1, 4), maxA = L ? 10 : 6;
        function diff(d) { var a = d < maxA ? rnd(d + 1, maxA) : d; return minus(a, a - d); }
        return { text: 'Munch the ones that make ' + em(T), hint: 'Take away!', say: ['munch_rule_make', T],
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
          good: function () { return mk(N); }, bad: function () { var v; do { v = rnd(Math.max(10, N - 4), Math.min(20, N + 4)); } while (v === N || v < 11); return mk(v); } };
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
  // the subject mix: 'mixed' -> weights by age (5 and under: 40% early concepts, 30% letters & sounds, 30% math; older: mostly math)
  function mixWeights(p) {
    var m = p.mix || 'mixed', w = {}, have = live().map(function (x) { return x.id; });
    if (m !== 'mixed' && have.indexOf(m) >= 0) { w[m] = 1; return w; }
    var little = p.age != null && p.age <= 5;
    var base = little ? { concepts: .4, reading: .3, math: .3 } : { math: .8, reading: .12, concepts: .08 };
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

  function blankState() { return { status: 'locked', level: 0, topPasses: 0, struggles: 0, attempts: 0, correct: 0, hist: [], timeMs: 0, introduced: false, placed: false, last: 0 }; }

  function ensure(p) {
    p.skills = p.skills || {};
    ACTIVE.forEach(function (s) { if (!p.skills[s.id]) p.skills[s.id] = blankState(); else A.Store && fillState(p.skills[s.id]); });
    if (!p.mix) p.mix = 'mixed';
    live().forEach(function (x) {
      var T = track(p, x.id), L = list(x.id);
      if (!T.current || !BY[T.current] || BY[T.current].status !== 'active' || subjOf(BY[T.current]) !== x.id) T.current = L[0].id;
      var st = p.skills[T.current]; if (st.status === 'locked') st.status = 'open';
    });
    return p;
  }
  function fillState(st) { var b = blankState(); for (var k in b) if (!(k in st)) st[k] = b[k]; }
  function state(p, id) { ensure(p); return p.skills[id]; }

  // Start a kid at a given skill: earlier skills count as mastered ("placed" — not earned in-game).
  function place(p, id) {
    ensure(p);
    var L = list(subjOf(BY[id])), idx = L.findIndex(function (s) { return s.id === id; }); if (idx < 0) return;
    L.forEach(function (s, i) {
      var st = p.skills[s.id];
      if (i < idx) { st.status = 'mastered'; st.placed = true; st.level = s.levels.length - 1; st.introduced = true; }
    });
    var cur = p.skills[id]; if (cur.status !== 'mastered') cur.status = 'open';
    var T = track(p, subjOf(BY[id])); T.current = id; T.returnTo = null;
  }

  // Parent override: practice this skill (and optionally a level) now.
  function setCurrent(p, id, level) {
    var s = BY[id]; if (!s || s.status !== 'active') return;
    var st = state(p, id); if (st.status === 'locked') st.status = 'open';
    if (level != null) st.level = A.clamp(level, 0, s.levels.length - 1);
    var T = track(p, subjOf(s)); T.current = id; T.returnTo = null;
    p.nextSubject = subjOf(s);   // the very next round practices it (then the mix carries on)
  }
  function markMastered(p, id) {
    var st = state(p, id); st.status = 'mastered'; st.introduced = true; st.level = BY[id].levels.length - 1; st.placed = st.attempts === 0;
    var T = track(p, subjOf(BY[id])), nx = nextSkill(id); if (nx) { var ns = state(p, nx.id); if (ns.status === 'locked') ns.status = 'open'; if (T.current === id && !p.math.pin) T.current = nx.id; }
  }
  function resetSkill(p, id) { var T = track(p, subjOf(BY[id])), L = list(subjOf(BY[id])); p.skills[id] = blankState(); p.skills[id].status = T.current === id ? 'open' : 'locked'; if (L[0] && L[0].id === id) p.skills[id].status = 'open'; }
  // the next / previous skill in the same subject's ladder
  function nextSkill(id) { var L = list(subjOf(BY[id])), i = L.findIndex(function (s) { return s.id === id; }); return i >= 0 ? L[i + 1] || null : null; }
  function prevSkill(id) { var L = list(subjOf(BY[id])), i = L.findIndex(function (s) { return s.id === id; }); return i > 0 ? L[i - 1] : null; }

  // What should the next round be?  Every 4th round mixes in a quick review of a mastered skill.
  // opt.subject: force a subject (else the kid's mix decides)
  function pickRound(p, opt) {
    ensure(p);
    var subj = (opt && opt.subject) || p.nextSubject || chooseSubject(p); p.nextSubject = null;
    if (!list(subj).length) subj = 'math';
    var T = track(p, subj), cur = T.current, st = p.skills[cur];
    T.rounds = (T.rounds || 0) + 1;
    var mastered = list(subj).filter(function (s) { return p.skills[s.id].status === 'mastered' && s.id !== cur; });
    if (!p.math.pin && T.rounds % 4 === 0 && mastered.length && st.introduced) {
      var r = pick(mastered); return { skill: r, level: r.levels.length - 1, review: true };
    }
    return { skill: BY[cur], level: A.clamp(st.level, 0, BY[cur].levels.length - 1), review: false };
  }

  function recordAnswer(p, id, ok) { var st = state(p, id); st.attempts++; if (ok) st.correct++; st.last = Date.now(); }

  // Call when a round ends. Returns {say:[parts], events:{...}}
  function finishRound(p, round, res) {
    var s = round.skill, st = state(p, s.id), top = s.levels.length - 1, T = track(p, subjOf(s));
    var tot = res.correct + res.wrong, acc = tot ? res.correct / tot : 1;
    st.hist.push({ t: Date.now(), c: res.correct, w: res.wrong, l: round.level, r: round.review ? 1 : 0, ms: res.ms || 0 });
    if (st.hist.length > 60) st.hist = st.hist.slice(-60);
    st.timeMs += res.ms || 0; st.introduced = true;
    var ev = { acc: acc }, say;
    if (round.review) {
      say = acc >= .8 ? ['fb_review_good'] : ['fb_keep_going'];
      return { say: say, events: ev };
    }
    if (res.timedOut) { // the timer ran out: slow-but-accurate is never punished
      ev.timedOut = true; ev.frac = res.frac;
      if (acc >= .8 && (res.frac || 0) < .75) { st.struggles = 0; return { say: ['fb_careful'], events: ev }; } // same level again (and the game adds time)
      // otherwise: >= 75% munched and accurate counts like a finished round; low accuracy uses the normal rules below
    }
    if (res.gaveUp) { // ran out of hearts
      if (st.level > 0) { st.level--; ev.levelDown = true; }
      else st.struggles++;
    } else if (acc >= .8) {
      st.struggles = 0;
      if (T.returnTo && T.returnTo !== s.id) { // back from a confidence-building detour
        T.current = T.returnTo; T.returnTo = null; ev.back = true; say = ['fb_back_now'];
      } else if (st.level < top) { st.level++; ev.levelUp = true; say = ['fb_level_up', 'fb_trickier']; }
      else {
        st.topPasses++;
        if (st.status !== 'mastered' && st.topPasses >= 2) {
          st.status = 'mastered'; st.placed = false; ev.mastered = s.id;
          var nx = nextSkill(s.id);
          if (nx && !p.math.pin) {
            var ns = state(p, nx.id); if (ns.status === 'locked') ns.status = 'open';
            T.current = nx.id; ev.newSkill = nx.id; say = ['fb_mastered'];
          } else if (nx) { var ns2 = state(p, nx.id); if (ns2.status === 'locked') ns2.status = 'open'; say = ['fb_mastered']; }
          else say = [subjOf(s) === 'math' ? 'fb_champion' : 'fb_star_learner'];
        } else if (st.status === 'mastered') {
          var n2 = nextSkill(s.id);
          if (n2 && !p.math.pin) { var s2 = state(p, n2.id); if (s2.status === 'locked') s2.status = 'open'; T.current = n2.id; if (!s2.introduced) ev.newSkill = n2.id; say = ['fb_great_job']; }
          else say = n2 ? ['fb_great_job'] : [subjOf(s) === 'math' ? 'fb_champion' : 'fb_star_learner'];
        } else say = ['fb_one_more'];
      }
    } else if (acc >= .55) { st.struggles = 0; say = ['fb_practice_again']; }
    else {
      if (st.level > 0) { st.level--; ev.levelDown = true; say = ['fb_easier']; }
      else st.struggles++;
    }
    if (!say) {
      var pv = prevSkill(s.id);
      if (st.struggles >= 2 && pv && !p.math.pin) {
        st.struggles = 0; T.returnTo = s.id; T.current = pv.id;
        var ps = state(p, pv.id); ps.level = pv.levels.length - 1; if (ps.status === 'locked') ps.status = 'open';
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
    var label = st.status === 'mastered' ? (st.placed ? 'Mastered (placed)' : 'Mastered') : st.attempts > 0 ? 'Practicing' : (st.status === 'open' ? 'Not started' : 'Not started');
    var cls = st.status === 'mastered' ? 'mastered' : st.attempts > 0 ? 'practicing' : 'none';
    var acc = st.attempts ? st.correct / st.attempts : null;
    var trend = null;
    if (recent.length >= 4) { var h = Math.floor(recent.length / 2); var a1 = avg(recent.slice(0, h)), a2 = avg(recent.slice(h)); trend = a2 - a1 > .07 ? 'up' : a1 - a2 > .07 ? 'down' : 'flat'; }
    return { label: label, cls: cls, acc: acc, recent: recent, trend: trend, level: st.level, levels: s.levels.length, attempts: st.attempts, timeMs: st.timeMs, rounds: st.hist.length, current: track(p, subjOf(s)).current === id };
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
    register: register, SUBJECTS: SUBJECTS, subjectOf: subjOf, list: list, track: track, mixWeights: mixWeights, chooseSubject: chooseSubject,
    current: function (p, subj) { ensure(p); return BY[track(p, subj || 'math').current]; },
    SKILLS: SKILLS, ACTIVE: ACTIVE, byId: BY, frame: frame,
    ensure: ensure, state: state, place: place, setCurrent: setCurrent, markMastered: markMastered, resetSkill: resetSkill,
    pickRound: pickRound, recordAnswer: recordAnswer, finishRound: finishRound, summary: summary, nextSkill: nextSkill,
    // (math stickers: these count math skills; subj gives another subject)
    masteredCount: function (p, subj) { ensure(p); return list(subj || 'math').filter(function (s) { return p.skills[s.id].status === 'mastered' && !p.skills[s.id].placed; }).length; },
    masteredAll: function (p, subj) { ensure(p); return list(subj || 'math').every(function (s) { return p.skills[s.id].status === 'mastered'; }); }
  };
})(window.Arcade);
