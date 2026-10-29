/* Picnic Pals v2 — Phase 2b: topic ladders (spec §4) and the round rotation (spec §5.1).
   Topics: animals, colors & shapes, seasons & weather, letters. Each theme is its own subject with ONE step ladder going
   T (2-3) → P (4-5) → E (6+); items come from js/core/topics-data.js (generated from the spec by tools/build-topics.js).
   Same engine as the number steps (steps-math.js): fast-skip, warm-up, hints after a miss, drop-back cap, step-down,
   except topic steps master at 8 answers at 80% (one day is enough: they are the "break" content).
   Content goes up with age: a kid starts at the first step of her band and never moves above her band in a topic.
     T: pictures only (2 choices, no reading; the question is spoken), P: picture + word (3 choices, spoken),
     E: words (3-4 choices, read first, voice on tap). Topics earn no rewards on their own (rewards stay as they are).
   Rotation (§5.1), only in the default mixed mode (a grown-up's single-subject choice wins):
     2-3: topic, topic, math, topic   4-5: math, reading, math, topic   6+: math, math, reading, topic
     The topic slot takes the themes in turn (never the same twice in a row); Early Concepts joins that turn while it is on.
     A topic round is 5 items. Spaced review never lands in a topic round. */
(function (A) {
  var C = A.Curriculum, S = A.Steps, K = A.Coach, D = A.TopicsData || [];
  if (!C || !S || !D.length) return;
  var BN = { T: 0, P: 1, E: 2 }, THEMES = [], RULE = { min: 8, acc: .8, days: 1 };
  function rnd(n) { return Math.floor(Math.random() * n); }
  function esc(s) { return A.esc ? A.esc(s) : String(s); }
  function cellHtml(c, b) {
    if (b === 'T') return '<span class="tp-emo">' + (c.e || '') + '</span>';
    if (b === 'P') return c.e ? '<span class="tp-emo">' + c.e + '</span>' + (c.w && c.w !== c.e ? '<span class="tp-w">' + esc(c.w) + '</span>' : '') : '<span class="tp-w only">' + esc(c.w) + '</span>';
    return '<span class="tp-w only">' + esc(c.w || c.raw) + '</span>';
  }
  function say(c) { return c.say ? [c.say] : c.w ? [c.w] : []; }
  function topicItem(stepDef) {
    return function (st) {
      var items = stepDef.items, last = (st && st.tpLast) || [], i, g = 0;
      do { i = rnd(items.length); } while (last.indexOf(i) >= 0 && g++ < 20);
      if (st) { last.push(i); st.tpLast = last.slice(-Math.min(5, items.length - 2)); }
      var it = items[i], b = stepDef.band, map = { a: it.ans }; it.wrong.forEach(function (w, k) { map['w' + k] = w; });
      var qtxt = esc(it.q) + (it.qe && b !== 'E' ? '<span class="tp-qe">' + it.qe + '</span>' : it.qe ? ' <span class="tp-qe">' + it.qe + '</span>' : '');
      return { key: stepDef.id + '#' + i, ans: 'a', wrong: Object.keys(map).filter(function (k) { return k !== 'a'; }), text: '<span class="tp-q">' + qtxt + '</span>', say: [it.say], pictures: b !== 'E',
        cell: function (v) { var c = map[v]; return { label: c.w || c.raw, html: cellHtml(c, b), fact: v === 'a' ? say(c).concat(it.factSay && b !== 'E' ? [it.factSay] : []) : say(c) }; },
        // hints after a miss: 1 = look again (the question's picture, the fact if there is one), 2 = the answer shown
        hint: function (l) { var a = it.ans;
          return '<div class="st-hint tp-hint">' + (l >= 2 ? '<span class="tp-emo">' + (a.e || '') + '</span><p>It\'s <b>' + esc(a.w || a.raw) + '</b>!' + (it.fact ? ' ' + esc(it.fact) : '') + '</p>' : (it.qe ? '<span class="tp-emo">' + it.qe + '</span>' : '') + '<p>' + (it.fact && b === 'E' ? esc(it.fact) : 'Look again. ' + esc(it.q)) + '</p>') + '</div>'; },
        fact: it.fact };
    };
  }
  D.forEach(function (t) {
    var subj = 'tp_' + t.id;
    C.SUBJECTS.push({ id: subj, name: t.name, emoji: { animals: '🐾', colors: '🎨', seasons: '🌦️', letters: '🔤' }[t.id] || '🌍', topic: true });
    var steps = t.steps.map(function (s) { return { id: s.id, name: s.name, short: t.name + ': ' + s.name + ' (' + s.items.length + ' questions)', item: topicItem(s), topic: true, sband: s.band }; });
    var L = S.ladder({ id: subj, subject: subj, band: 'P', grade: 'PK', strand: t.name, std: 'topic', introLine: null, rule: RULE, maxChoices: 4, steps: steps });
    L.steps.forEach(function (s) { s.band = s.sband; s.topic = true; s.maxChoices = s.band === 'T' ? 2 : s.band === 'P' ? 3 : 4; s.intro = { line: 'st_new_step', example: '' }; });
    THEMES.push({ id: t.id, subj: subj, ladder: L });
  });
  function kb(p) { return S.band(p); }
  function startFor(p, th) { var b = BN[kb(p)], ids = th.ladder.ids, first = null; ids.forEach(function (id) { if (first == null && BN[S.STEPS[id].band] === b) first = id; }); if (first) return first; var low = ids.filter(function (id) { return BN[S.STEPS[id].band] < b; }); return low.length ? low[low.length - 1] : null; }
  function themeOk(p, th) { return !!startFor(p, th); }
  // new or existing player: each theme starts at the first step of her band; easier steps of the theme are placed (no check)
  var baseEnsure = C.ensure;
  C.ensure = function (p) {
    baseEnsure(p); if (!p || !p.skills) return;
    THEMES.forEach(function (th) { var T = C.track(p, th.subj); if (T.tpInit === kb(p)) return; var st0 = startFor(p, th); if (!st0) return;
      var anyPlayed = th.ladder.ids.some(function (id) { var s = p.skills[id]; return s && s.attempts; }); T.tpInit = kb(p);
      if (anyPlayed && BN[S.STEPS[T.current] ? S.STEPS[T.current].band : 'T'] >= BN[S.STEPS[st0].band]) return;   // keep her place (a birthday never moves her down)
      th.ladder.ids.forEach(function (id) { var s = C.state(p, id); if (id === st0) { if (s.status === 'locked') s.status = 'open'; s.introduced = true; } /* no "New skill!" card for topics (light break content) */ else if (th.ladder.ids.indexOf(id) < th.ladder.ids.indexOf(st0) && s.status !== 'mastered') { s.status = 'mastered'; s.placed = true; s.placedBy = 'age'; s.checkAt = null; } });
      T.current = st0; });
  };
  // a topic never climbs above her band: at the top of her band the theme keeps playing her band's steps in turn
  var baseFinish = C.finishRound;
  C.finishRound = function (p, round, res) {
    var out = baseFinish(p, round, res), s = round && round.skill; if (!s || !s.topic) return out;
    var T = C.track(p, s.subject), cur = S.STEPS[T.current], b = BN[kb(p)];
    if (!cur || BN[cur.band] > b || (out.events && out.events.ladderTop)) {
      var mine = S.LADDERS[s.subject].ids.filter(function (id) { return BN[S.STEPS[id].band] === b || (BN[S.STEPS[id].band] < b && !S.LADDERS[s.subject].ids.some(function (j) { return BN[S.STEPS[j].band] === b; })); });
      if (mine.length) { var i = mine.indexOf(s.id); T.current = mine[(i + 1) % mine.length]; }
      if (out.events) { delete out.events.newSkill; out.events.topicLoop = true; }
    }
    return out;
  };
  /* ---------- rotation (§5.1) ---------- */
  var PAT = { T: ['topic', 'topic', 'math', 'topic'], P: ['math', 'reading', 'math', 'topic'], E: ['math', 'math', 'reading', 'topic'] };
  function liveSubj(id) { return C.list(id).length > 0; }
  function nextTheme(p, R) {
    var w = C.mixWeights(p), pool = THEMES.filter(function (th) { return themeOk(p, th) && (!p.levels || p.levels[th.subj] !== 'off'); }).map(function (th) { return th.subj; });
    if (w.concepts > 0 && liveSubj('concepts')) pool.push('concepts');
    if (!pool.length) return null;
    var i = (R.ti || 0) % pool.length, pick = pool[i]; if (pick === R.lastTopic && pool.length > 1) { i = (i + 1) % pool.length; pick = pool[i]; }
    R.ti = i + 1; R.lastTopic = pick; return pick;
  }
  function rotate(p) {
    var R = p.rot || (p.rot = { i: 0, ti: 0 }), pat = PAT[kb(p)], slot = pat[(R.i || 0) % pat.length], w = C.mixWeights(p); R.i = (R.i || 0) + 1;
    if (slot === 'topic') return nextTheme(p, R) || 'math';
    if (slot === 'reading' && !(w.reading > 0 && liveSubj('reading'))) return 'math';
    return slot;
  }
  var basePick = C.pickRound;
  C.pickRound = function (p, opt) {
    THEMES.forEach(function (th) { var T = C.track(p, th.subj), c = S.STEPS[T.current]; if (c && BN[c.band] > BN[kb(p)]) { var st0 = startFor(p, th); if (st0) T.current = st0; } });   // never above her band
    var mixed = (p.mix || 'mixed') === 'mixed';
    if (mixed && !p.guest && !(opt && opt.subject) && !p.nextSubject && !(opt && opt.noRotate)) {
      var subj = rotate(p), r = basePick(p, Object.assign({}, opt || {}, { subject: subj }));
      if (r && r.skill && r.skill.topic) { r.topic = true; r.review = false; if (!r.placement) r.nOk = 5; }
      return r;
    }
    var r2 = basePick(p, opt); if (r2 && r2.skill && r2.skill.topic) { r2.topic = true; r2.review = false; if (!r2.placement) r2.nOk = 5; }
    return r2;
  };
  // the grown-up mix menu shows topic themes only when a grown-up picks one; mixWeights gives them no weight of their own
  A.Topics = { THEMES: THEMES, PAT: PAT, rotate: rotate, startFor: startFor, themeOk: themeOk, RULE: RULE };
})(window.Arcade);
