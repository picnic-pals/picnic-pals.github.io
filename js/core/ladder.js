/* Picnic Pals — the rated ladder (ladder1121; design: _sim/ADAPTIVE_PLAN.md sections 5 and 9).
   Per profile switch: p.engine = 'ladder' | 'classic' (unset = A.Ladder.DEFAULT). Toddler mode / age 3 and under keep the
   simple classic path. Concepts and topic subjects keep the classic picker. Everything stays on this device (localStorage,
   p.learn.rate); nothing is sent anywhere.
   How it works:
   - One fine ladder per subject (math, reading): every (skill, level) sorted by a difficulty d in grade units (Learn.GL tags,
     spread inside runs of equal tags), with blend sub-rungs wherever two neighbours are more than 0.15 grade apart (a sub-rung
     serves the next skill k/(m+1) of the time, else the rung below it: an easy ramp into a new skill).
   - One rating per subject (theta, grade units). Cold start: age prior - 0.3, or seeded once from an old save's progress.
     After each answer theta += K (right - P), P = g + (1-g) sig(1.8 (theta - d) + 0.3), g = 1 / number of choices
     (under-5s see 3). K starts at 0.6 and shrinks to 0.08. Reviews count 0.3, hinted / guided answers count half and never
     pull the rating down; a quit after 2+ misses counts as half a miss.
   - Controller: the highest rung with P >= target (free play 78%; story stop 1 90%, stops 2-5 85%, boss 80%). The rung is
     re-decided once per set of 5 answers, with a dead band (+0.02 up / +0.10 down), at most 2 rungs down; up at most 4 rungs a
     decision in the 15-answer warm-up, then 1 rung per 2 answers (per 3 after 40 answers).
   - Guards: 2 misses in a row -> one rung down + an automatic picture hint; a 3rd -> a 2-choice guided item. A set of 5 under
     50% -> switch subject next round; twice on the bottom rung -> teach mode (the skill's intro plays again) + a grown-up flag.
     A guided item on the same skill on 2 different days -> a grown-up flag.
   - Review: 1 question in 8 (about 1 round in 5 for round games) from a different mastered skill, never a look-alike of the
     current skill. Each reviewed skill has a timer that doubles after a right review and halves after a miss.
   - Mastery (labels, friends): theta >= the skill's top rung + 0.3 with 8+ answers makes it "pending"; a right review on a
     LATER day makes it mastered.
   - The kid only ever sees a climb meter that goes up (best rung reached); the rating itself is for the grown-up page. */
(function (A) {
  'use strict';
  var C = A.Curriculum, Ln = A.Learn, Q = A.Questions, K = A.Coach;
  if (!C || !Ln || !Q) return;
  var CFG = { target: .78, story0: .90, story: .85, boss: .85, slope: 1.8, off: .3, K0: .6, Kn: 10, Kmin: .08, warm: 15, gap: .15, subStep: .12,
    upBand: .02, downBand: .10, maxDown: 2, set: 5, reviewEvery: 8, reviewRoundEvery: 5, mastPlus: .3, mastMin: 8, stretchGap: 5, littleCeil: 2.5 };
  var SUBJ = { math: 1, reading: 1 };
  // look-alike skills: never reviewed right next to each other (associative interference; Math Academy, ADAPTIVE_PLAN 9.2)
  var LOOKALIKE = [['add10', 'sub10'], ['add20', 'sub20'], ['pk_more1', 'pk_less1'], ['pk_next20', 'pk_before20'], ['pk_next30', 'pk_before20'],
    ['a_dbl', 'a_ndbl'], ['s_teen1', 's_teen10'], ['pk_compare', 'compare', 'pv_compare', 'pv_cmp3'], ['time_hour_half', 'time_5min'],
    ['coin_values', 'money_coins'], ['a2_add', 'a2_regroup'], ['s2_sub', 's2_regroup'], ['sight', 'sight2', 'sight3'], ['homophones', 'affixes'],
    ['rhymes', 'begsound'], ['cvc', 'digraph'], ['longvowel', 'digraph'], ['opposites', 'nounverb']];
  var GRADE_GL = { pk: 1, k: 2, '1': 3, '2': 4, '3': 5, '4': 6, '5': 7 };
  function now() { return K && K.now ? K.now() : Date.now(); }
  function dayN(t) { t = t == null ? now() : t; return Math.floor((t - new Date(t).getTimezoneOffset() * 6e4) / 864e5); }
  function sig(x) { return 1 / (1 + Math.exp(-x)); }
  function pHat(th, d, g) { return g + (1 - g) * sig(CFG.slope * (th - d) + CFG.off); }
  function dFor(th, P, g) { var q = (P - g) / (1 - g); q = Math.min(.999, Math.max(.001, q)); return th - (Math.log(q / (1 - q)) - CFG.off) / CFG.slope; }
  function agePrior(a) { return a == null ? 2.0 : a <= 2 ? .2 : a <= 3 ? .6 : a < 5 ? 1.0 + (a - 4) * .4 : a < 6 ? 1.8 : a < 7 ? 2.6 : a < 8 ? 3.0 : 3.6; }

  /* ---------- the ladders ---------- */
  // finer difficulty: equal-tag runs spread -0.2 .. +0.3 in list order; level 2 of a 2-level skill +0.2 (array tags are per level)
  function fineD(sid, lv) {
    var s = C.byId[sid], base = Ln.glAt(sid, lv || 0); if (base == null) return null;
    var arr = Array.isArray(Ln.GL[sid]);
    if (!arr && s && s.levels && s.levels.length > 1 && !s.isStep) base += .2 * Math.min(lv || 0, s.levels.length - 1);
    if (!arr && s) { var same = C.list(C.subjectOf(s)).filter(function (k) { return !Array.isArray(Ln.GL[k.id]) && Ln.glTop(k.id) === Ln.glTop(sid); }), r = same.map(function (k) { return k.id; }).indexOf(sid);
      if (same.length > 1 && r >= 0) base += -.2 + .5 * r / (same.length - 1); }
    return +base.toFixed(3);
  }
  // an easy tier of the next skill for a sub-step `need` grade under it: 1 = smallest numbers / shortest words (about -0.15),
  // 2 = + wrong choices far from the answer (about -0.3), 3 = + the picture hint shown up front (about -0.45)
  function tierFor(need) { return Math.min(3, Math.max(1, Math.round(need / CFG.gap + .2))); }
  var cache = {};
  function rungs(subj) {
    if (cache[subj]) return cache[subj];
    var raw = [];
    C.list(subj).forEach(function (s, ix) { var n = s.isStep ? 1 : (s.levels || [1]).length; for (var lv = 0; lv < n; lv++) { var d = fineD(s.id, lv); if (d != null) raw.push({ skill: s.id, level: lv, d: d, ix: ix }); } });
    raw.sort(function (a, b) { return a.d - b.d || a.ix - b.ix || a.level - b.level; });
    var out = raw.length ? [raw[0]] : [];
    for (var i = 1; i < raw.length; i++) {
      var prev = out[out.length - 1], nx = raw[i], base = prev.sub ? prev.prev : { skill: prev.skill, level: prev.level }, last = prev.d, m = Math.max(0, Math.ceil((nx.d - last) / CFG.gap - 1e-9) - 1), subs = [];
      for (var k = 1; k <= m; k++) { var dk = +(last + (nx.d - last) * k / (m + 1)).toFixed(3); subs.push({ skill: nx.skill, level: nx.level, d: dk, sub: k, of: m, tier: tierFor(nx.d - dk), prev: base, ix: nx.ix }); }
      out = out.concat(subs); out.push(nx);
    }
    out.forEach(function (r, i) { r.i = i; });
    return (cache[subj] = out);
  }
  function rungOf(subj, sid, lv) { var R = rungs(subj), best = null; R.forEach(function (r) { if (!r.sub && r.skill === sid && (lv == null || r.level === lv)) best = best || r; }); return best; }
  function topRung(subj, sid) { var R = rungs(subj), t = null; R.forEach(function (r) { if (!r.sub && r.skill === sid) t = r; }); return t; }

  /* ---------- profile state ---------- */
  var DEFAULT = true;    // round 2: on for every profile (old picker: the grown-up switch); see _ladder1121-progress.md
  function eligible(p) { return !!p && !(A.toddler && A.toddler(p)) && !(p.age != null && p.age !== '' && +p.age <= 3); }
  function on(p) { if (!eligible(p)) return false; return p.engine ? p.engine === 'ladder' : L.DEFAULT; }
  function setOn(p, v) { if (p) p.engine = v ? 'ladder' : 'classic'; }
  function choices(p) { return A.Age && A.Age.choices ? A.Age.choices(p) : 4; }
  function introduced(p, sid) { var st = p.skills && p.skills[sid]; return !!(st && (st.introduced || st.attempts > 0)); }
  function earned(p, sid) { var st = p.skills && p.skills[sid]; return !!(st && st.status === 'mastered' && !st.placed); }
  function store(p) { p.learn = p.learn || { v: 1, probe: {} }; return p.learn.rate || (p.learn.rate = {}); }
  // seed once: from the old save's progress (current skill / earned skills / a grown-up grade), else the age prior
  function seed(p, subj, dry) {
    var R = rungs(subj), th = agePrior(A.Age && A.Age.of ? A.Age.of(p) : p.age) - .3, n = 0, why = 'age';
    var g = p.levels && GRADE_GL[p.levels[subj]]; if (g != null) { th = g - .3; why = 'grade'; }
    var T = C.track ? C.track(p, subj) : null, cur = T && T.current && C.byId[T.current], st = cur && p.skills && p.skills[cur.id];
    var tops = []; C.list(subj).forEach(function (s) { if (earned(p, s.id)) { var t = topRung(subj, s.id); if (t) tops.push(t.d); } });
    if (st && (st.attempts > 0 || st.status === 'open' || tops.length)) {
      var r = rungOf(subj, cur.id, cur.isStep ? 0 : Math.min(st.level || 0, (cur.levels || [1]).length - 1)) || topRung(subj, cur.id);
      if (r && (st.attempts > 0 || tops.length || why !== 'age')) { th = r.d + .17; why = 'save'; }
      if (tops.length) { tops.sort(function (a, b) { return a - b; }); th = Math.max(th, tops[Math.max(0, tops.length - 2)] + .1); why = 'save'; }
      var att = 0; C.list(subj).forEach(function (s) { att += (p.skills[s.id] && p.skills[s.id].attempts) || 0; }); if (att >= 20) n = CFG.warm;
    }
    var s = { th: +th.toFixed(3), n: n, cur: 0, best: 0, lastUpN: -99, decN: -99, lastP: null, missRun: 0, hint: false, guided: false, q: 0, rounds: 0,
      setA: 0, setOk: 0, low: 0, sw: false, srv: null, by: {}, cnt: {}, mast: {}, gday: {}, flags: {}, log: '', moves: [], lastRev: null, lastStretch: -99, seeded: why, v: 1 };
    s.cur = idxFor(p, subj, s, s.th, CFG.target); s.best = s.cur; if (dry) return s; sync(p, subj, s);
    move(s, 'start', null, s.cur, why === 'save' ? 'started from earlier progress' : why === 'grade' ? 'started from the grade you picked' : 'started from age');
    return s;
  }
  // keep the classic 'current skill' (grown-up page, story names, other games) on her ladder rung
  // a sub-step whose next skill is not taught yet falls back to the rung below it, unless that rung is under her floor (4+: no toddler skills)
  function backOk(p, subj, r) { if (!r.sub || introduced(p, r.skill)) return false; var b = rungOf(subj, r.prev.skill, r.prev.level); return !b || b.i >= bounds(p, subj).lo; }
  function sync(p, subj, s) { try { var r = rungs(subj)[s.cur], sid = backOk(p, subj, r) ? r.prev.skill : r.skill, T = C.track(p, subj), ss = C.state(p, sid); if (p.math && p.math.pin) return; T.current = sid; T.returnTo = null; if (ss.status === 'locked') ss.status = 'open'; } catch (e) {} }
  function st(p, subj) { var all = store(p); if (!all[subj] || all[subj].v !== 1) all[subj] = seed(p, subj); return all[subj]; }
  function move(s, kind, from, to, why) { s.moves.push({ t: now(), k: kind, f: from, to: to, why: why }); if (s.moves.length > 12) s.moves.splice(0, s.moves.length - 12); }
  // which rungs she may get: little ones (under 5) stop at 2.5 unless she earned it; a grown-up pin keeps her on the current skill
  function bounds(p, subj) {
    var R = rungs(subj), lo = 0, hi = R.length - 1, a = A.Age && A.Age.of ? A.Age.of(p) : null;
    if (a != null && a < 5) { while (hi > 0 && R[hi].d > CFG.littleCeil && !earned(p, R[hi].skill)) hi--; }
    // 4 and up: never the toddler-grade skills (tagged 0: count to 3 / to 5); the classic start placed them already
    if (a != null && a >= 4) { while (lo < hi && Ln.glTop(R[lo].skill) != null && Ln.glTop(R[lo].skill) < 1) lo++; }
    if (p.math && p.math.pin) { var T = C.track(p, subj), sid = T && T.current, ids = R.filter(function (r) { return r.skill === sid && !r.sub; }).map(function (r) { return r.i; }); if (ids.length) { lo = ids[0]; hi = ids[ids.length - 1]; } }
    return { lo: lo, hi: hi };
  }
  function gOf(p, ch) { return 1 / Math.max(2, ch || choices(p)); }
  function idxFor(p, subj, s, th, P) { var R = rungs(subj), b = bounds(p, subj), d = dFor(th, P, gOf(p)), k = b.lo; for (var i = b.lo; i <= b.hi; i++) if (R[i].d <= d) k = i; return k; }
  function K_(s) { return Math.max(CFG.Kmin, CFG.K0 / (1 + s.n / CFG.Kn)); }
  // how many rungs up this decision may take: warm-up (first 15 answers) up to 4 a question; after that at most 1 rung per 2
  // answers since the last move up (per 3 after 40 answers). A per-question game (Slugger) decides once per set of 5 -> at most 1
  // rung a set; a round game (Munch: 8-20 answers a round) at most 3 rungs between rounds.
  function upCap(s, round) { if (s.n < CFG.warm) return 4 * Math.max(1, s.n - Math.max(0, s.decN)); var k = Math.floor((s.n - Math.max(s.lastUpN, 0)) / (s.n < 40 ? 2 : 3)); return Math.min(k, round ? 3 : 1); }
  // boredom matters more than frustration (Baker et al. 2010): a run of 8 right in a row (no hints) moves the rating a bit faster
  function hot(s) { return s.log.length >= 8 && s.log.slice(-8) === '11111111'; }
  // re-decide the rung (once per set of 5 answers, during the warm-up every time, or when the target changes)
  function decide(p, subj, s, P, round) {
    var R = rungs(subj), b = bounds(p, subj), g = gOf(p), dT = dFor(s.th, P, g), up = upCap(s, round), want = Math.min(Math.max(s.cur, b.lo), b.hi), from = s.cur;
    while (want + 1 <= b.hi && R[want + 1].d <= dT - CFG.upBand && want - from < up) want++;
    while (want > b.lo && R[want].d > dT + CFG.downBand && from - want < CFG.maxDown) want--;
    s.decN = s.n; s.lastP = P;
    if (want !== from) { if (want > from) s.lastUpN = s.n; move(s, want > from ? 'up' : 'down', from, want, want > from ? 'strong answers, so one step up' : 'a bit hard, so a step easier'); }
    s.cur = want; if (s.cur > s.best) s.best = s.cur;
  }
  // the (skill, level) a rung serves: a sub-step serves the next skill at an easy tier (round 2: no more blending two skills, so
  // two questions in a row never differ by more than one step)
  function resolve(p, r) { return r.sub ? { skill: r.skill, level: r.level, tier: r.tier } : { skill: r.skill, level: r.level }; }
  function dOfServed(subj, r, sk) { if (!r.sub || sk.skill === r.skill) return r.d; var b = rungOf(subj, sk.skill, sk.level); return b ? b.d : r.d; }
  function lookalike(a, b) { if (!a || !b) return false; if (a === b) return true; return LOOKALIKE.some(function (g) { return g.indexOf(a) >= 0 && g.indexOf(b) >= 0; }); }
  // a review: a DIFFERENT mastered / pending skill that is due, never a look-alike of the current one or of the last review
  function reviewPick(p, subj, s) {
    var R = rungs(subj), cur = R[s.cur], today = dayN();
    C.list(subj).forEach(function (k) { if (p.skills[k.id] && p.skills[k.id].status === 'mastered' && !s.mast[k.id]) s.mast[k.id] = { since: null, h: 1, due: today, done: 1 }; });
    var ok1 = function (strict) { return function (sid) {
      var m = s.mast[sid], t = topRung(subj, sid); if (!t || !C.byId[sid]) return false;
      if (m.due > today || lookalike(sid, cur.skill) || (cur.sub && lookalike(sid, cur.prev.skill)) || (strict && lookalike(sid, s.lastRev))) return false;
      if (!m.done && m.since != null && m.since >= today) return false;   // pending: only on a LATER day
      return t.d <= s.th + .3 && t.d >= s.th - 1.2;   // not above her, and not so far below that it is pointless
    }; };
    var cands = Object.keys(s.mast).filter(ok1(true)); if (!cands.length) cands = Object.keys(s.mast).filter(ok1(false)).filter(function (sid) { return sid === s.lastRev; });
    if (!cands.length) return null;
    cands.sort(function (a, b) { var ma = s.mast[a], mb = s.mast[b]; return (ma.done ? 1 : 0) - (mb.done ? 1 : 0) || ma.due - mb.due; });
    var sid = cands[0], tr = topRung(subj, sid), r = tr;
    rungs(subj).forEach(function (x) { if (!x.sub && x.skill === sid && x.d <= s.th) r = x; });
    return r;
  }
  function serve(s, r, sk, kind, extra) { var o = { skill: sk.skill, level: sk.level, d: kind === 'stretch' ? r.d : null, i: r.i, kind: kind, tier: sk.tier || 0, tierHint: (sk.tier || 0) >= 3 }; for (var k in extra || {}) o[k] = extra[k]; s.srv = o; s.by[sk.skill] = { level: sk.level, d: o.d }; return o; }
  /* the next thing to ask. o: {target, round: true (a whole round: Munch / a baseball half), mc: true (one multiple-choice question),
     story: true (no review / switch), untaughtOk: true (the caller plays the skill intro itself, e.g. Munch)} */
  function pick(p, subj, o) {
    o = o || {}; var s = st(p, subj), R = rungs(subj), P = o.target || CFG.target;
    if (o.round) s.rounds++; else s.q++;
    // a review never takes the place of the hinted / guided question that follows misses
    var revDue = !o.story && !o.noReview && !(o.mc && (s.hint || s.guided)) && (o.round ? s.rounds % CFG.reviewRoundEvery === 0 : s.q % CFG.reviewEvery === 0);
    if (revDue) { var rv = reviewPick(p, subj, s); if (rv) { s.lastRev = rv.skill; var x = serve(s, rv, { skill: rv.skill, level: rv.level }, 'review', { review: true }); x.d = rv.d; s.by[rv.skill].d = rv.d; return x; } }
    if (s.n < CFG.warm || s.n - s.decN >= CFG.set || P !== s.lastP || o.round) decide(p, subj, s, P, !!o.round);
    var r = R[s.cur], sk = resolve(p, r), d = dOfServed(subj, r, sk);
    if (o.mc && s.guided) { var x2 = serve(s, r, sk, 'guided', { guided: true, hint: true, choices: 2 }); x2.d = d; s.by[sk.skill].d = d; return x2; }
    var x3 = serve(s, r, sk, 'current', { hint: !!s.hint }); x3.d = d; s.by[sk.skill].d = d; return x3;
  }
  // a story stop: no state change. Stop 1 aims 90%, stops 2-5 85%, the boss 80%; never more than one rung over her free-play rung
  // and never more than 2 under it. Only skills she has been taught (or her current skill).
  function peek(p, subj, P) {
    var s = st(p, subj), R = rungs(subj), b = bounds(p, subj), want = idxFor(p, subj, s, s.th, P);
    want = Math.max(Math.max(b.lo, s.cur - CFG.maxDown), Math.min(want, Math.min(b.hi, s.cur + 1)));
    var curSkill = C.track(p, subj).current;
    // a story stop only uses a skill she has been taught, her current skill, or an easier rung whose skill is at most one
    // catalog step past her current skill (the ladder sorts by grade, which can differ from the catalog order)
    var cat = C.list(subj).map(function (k) { return k.id; }), cIx = cat.indexOf(curSkill);
    function okStop(r) { var sid = backOk(p, subj, r) ? r.prev.skill : r.skill; return introduced(p, sid) || sid === curSkill || (r.i <= s.cur && (cIx < 0 || cat.indexOf(sid) <= cIx + 1)); }
    while (want > b.lo && !okStop(R[want])) want--;
    var r = R[want], sk = backOk(p, subj, r) ? { skill: r.prev.skill, level: r.prev.level } : resolve(p, r);
    var d = dOfServed(subj, r, sk); s.by[sk.skill] = { level: sk.level, d: d };
    return { skill: sk.skill, level: sk.level, d: d, i: r.i, target: P, tier: sk.tier || 0 };
  }
  // Slugger "Tricky!": one rung above her rung, from a skill she has been taught; at most 1 in 5 pitches; else null
  function stretch(p, subj) {
    var s = st(p, subj), R = rungs(subj), b = bounds(p, subj);
    if (s.q - s.lastStretch < CFG.stretchGap) return null;
    var j = s.cur + 1; if (j > b.hi) return null;
    var r = R[j], sk = resolve(p, r);
    if (!introduced(p, sk.skill)) return null;
    s.q++; s.lastStretch = s.q; var x = serve(s, r, sk, 'stretch', { stretch: true }); x.d = dOfServed(subj, r, sk); s.by[sk.skill].d = x.d; return x;
  }
  function easier(p, subj) { var s = st(p, subj), R = rungs(subj), b = bounds(p, subj), r = R[Math.max(b.lo, s.cur - 1)], sk = resolve(p, r); var x = serve(s, r, sk, 'easier', {}); x.d = dOfServed(subj, r, sk); return x; }
  // the item's difficulty for an answer: what was served (this skill), else the skill's rung nearest her rung
  function dOfAnswer(subj, s, sid) {
    if (s.srv && s.srv.skill === sid && s.srv.d != null) return { d: s.srv.d, srv: s.srv };
    if (s.by[sid] && s.by[sid].d != null) return { d: s.by[sid].d, srv: null };
    var R = rungs(subj), best = null; R.forEach(function (r) { if (!r.sub && r.skill === sid && (!best || Math.abs(r.i - s.cur) < Math.abs(best.i - s.cur))) best = r; });
    return best ? { d: best.d, srv: null } : null;
  }
  function flag(s, sid, why) { s.flags[sid] = { why: why, t: now() }; }
  /* one answer (called from C.recordAnswer). o: {hint, review, guided, choices} */
  function answer(p, subj, sid, ok, o) {
    o = o || {}; var s = st(p, subj), R = rungs(subj), dd = dOfAnswer(subj, s, sid); if (!dd) return null;
    var srv = dd.srv || {}, review = !!(o.review || srv.review), guided = !!(o.guided || srv.guided), hint = !!(o.hint || guided);
    var g = gOf(p, guided ? 2 : o.choices), w = review ? .3 : (hint ? .5 : (ok && hot(s) ? 1.5 : 1)), pr = pHat(s.th, dd.d, g), delta = K_(s) * w * ((ok ? 1 : 0) - pr);
    if (hint && delta < 0) delta = 0;   // hinted / guided: half credit up, never down
    s.th = +(s.th + delta).toFixed(4);
    var ev = {};
    if (review) {
      var m = s.mast[sid], today = dayN();
      if (m) {
        if (ok) { var pst = p.skills[sid]; if ((!m.done && (m.since == null || today > m.since)) || (pst && pst.status === 'mastered' && pst.placed)) { m.done = 1; if (pst && (pst.status !== 'mastered' || pst.placed)) { pst.status = 'mastered'; pst.placed = false; pst.earnedBy = 'ladder'; pst.pending = false; ev.mastered = sid; (s.newMast = s.newMast || []).push(sid); } }
          m.h = Math.min(64, (m.h || 1) * 2); m.due = today + m.h; }
        else { m.h = Math.max(1, (m.h || 1) / 2); m.due = today + 1; }
      }
      s.srv = null; return ev;
    }
    s.n++; s.log = (s.log + (ok ? (hint ? 'h' : '1') : '0')).slice(-20); s.cnt[sid] = (s.cnt[sid] || 0) + 1;
    // mastery: pending once she is well above the skill's top rung with enough answers; mastered after a right review on a later day
    var t = topRung(subj, sid), pst2 = p.skills[sid];
    if (t && !s.mast[sid] && s.cnt[sid] >= CFG.mastMin && s.th >= t.d + CFG.mastPlus && !(pst2 && pst2.status === 'mastered' && !pst2.placed)) { var td = dayN(); s.mast[sid] = { since: td, h: 1, due: td + 1, done: 0 }; ev.pending = sid; }
    // guards
    if (ok) { s.missRun = 0; s.hint = false; s.guided = false; }
    else {
      s.missRun++;
      if (s.missRun === 2) { var b = bounds(p, subj), from = s.cur; s.cur = Math.max(b.lo, s.cur - 1); s.hint = true; s.decN = s.n; if (from !== s.cur) move(s, 'down', from, s.cur, '2 misses in a row, so a step easier with a hint'); else move(s, 'hint', from, from, '2 misses in a row, so a hint'); ev.eased = true; }
      else if (s.missRun >= 3) { s.guided = true; s.hint = true; var td2 = dayN(), gd = s.gday[sid] || (s.gday[sid] = []); if (gd.indexOf(td2) < 0) gd.push(td2); if (gd.length > 4) gd.shift(); if (gd.length >= 2) flag(s, sid, 'guided'); move(s, 'guided', s.cur, s.cur, '3 misses in a row, so a 2-choice helper question'); ev.guided = true; }
    }
    // sets of 5: under 50% -> switch activity next round; twice in a row on the bottom rung -> teach mode
    s.setA++; if (ok) s.setOk++;
    if (s.setA >= CFG.set) {
      if (s.setOk / s.setA < .5) {
        s.low++; s.sw = true; ev.switchNext = true;
        if (s.cur <= bounds(p, subj).lo && s.low >= 2) { var rr = R[s.cur], tsid = rr.skill; s.teach = tsid; s.low = 0; flag(s, tsid, 'teach'); move(s, 'teach', s.cur, s.cur, 'hard at the first step, so the skill is shown again'); ev.teach = tsid; }
      } else s.low = 0;
      s.setA = 0; s.setOk = 0;
    }
    if (s.cur > s.best) s.best = s.cur;
    return ev;
  }
  // a round closed early after 2+ misses: half a miss on her rung and one rung easier next time (closing while doing well: ignored)
  function quit(p, subj, misses) {
    if (!(misses >= 2)) return false; var s = st(p, subj), R = rungs(subj), b = bounds(p, subj), r = R[s.cur];
    s.th = +(s.th + K_(s) * .5 * (0 - pHat(s.th, r.d, gOf(p)))).toFixed(4);
    var from = s.cur; s.cur = Math.max(b.lo, s.cur - 1); s.decN = s.n; move(s, 'quit', from, s.cur, 'stopped after misses, so a step easier'); return true;
  }
  // a grown-up picked a skill (Now practicing): start the rating there
  function reseedAt(p, sid, lv) {
    var subj = C.subjectOf(C.byId[sid]); if (!SUBJ[subj]) return; var s = st(p, subj), r = rungOf(subj, sid, lv) || rungOf(subj, sid); if (!r) return;
    var from = s.cur; s.th = +(r.d + .17).toFixed(3); s.cur = r.i; s.decN = s.n; s.missRun = 0; s.hint = false; s.guided = false; move(s, 'set', from, r.i, 'a grown-up picked ' + C.byId[sid].name); var T = C.track(p, subj); T.current = sid;
  }
  function reset(p, subj) { var all = store(p); delete all[subj]; return st(p, subj); }
  function meter(p, subj) { return st(p, subj).best + 1; }
  /* ---------- grown-up page ---------- */
  function line(p, subj) {
    var s = st(p, subj), R = rungs(subj), r = R[s.cur], cur = C.byId[r.sub ? r.prev.skill : r.skill], name = (C.SUBJECTS.filter(function (x) { return x.id === subj; })[0] || { name: subj }).name;
    var nx = null; for (var j = s.cur + 1; j < R.length && !nx; j++) if (R[j].skill !== cur.id && R[j].skill !== r.skill) nx = C.byId[R[j].skill];
    var right = s.log.split('').filter(function (c) { return c !== '0'; }).length;
    return name + ' level ' + s.th.toFixed(1) + ' (' + Ln.gradeTag(Math.max(0, Math.min(7, Math.round(s.th * 2) / 2))) + '), aiming for about 8 in 10' +
      (cur ? '. Now: ' + (r.sub ? 'easing into ' + C.byId[r.skill].name : cur.name) : '') + (nx ? '. Next: ' + nx.name : '. At the top for now') + (s.log.length ? '. Last ' + s.log.length + ': ' + right + ' right' : '') + '.';
  }
  function info(p, subj) {
    var s = st(p, subj), R = rungs(subj);
    return { line: line(p, subj), theta: s.th, n: s.n, rung: s.cur, rungs: R.length, best: s.best, meter: s.best + 1, moves: s.moves.slice(-5).reverse(),
      flags: Object.keys(s.flags).map(function (k) { return { skill: k, name: C.byId[k] ? C.byId[k].name : k, why: s.flags[k].why, t: s.flags[k].t }; }) };
  }

  /* ---------- wiring (only for profiles with the ladder on) ---------- */
  var basePick = C.pickRound;
  C.pickRound = function (p, opt) {
    if (!on(p)) return basePick(p, opt);
    C.ensure(p);
    var subj = (opt && opt.subject) || p.nextSubject || (C.chooseSubject ? C.chooseSubject(p) : 'math');
    if (!SUBJ[subj]) return basePick(p, Object.assign({}, opt || {}, { subject: subj }));
    p.nextSubject = null;
    var s = st(p, subj);
    if (s.sw && !(opt && opt.subject) && p.mix !== subj) {   // a hard set: switch activity (the other subject) for one round
      s.sw = false; var o = subj === 'math' ? 'reading' : 'math', w = C.mixWeights(p);
      if (w[o] > 0 && C.list(o).length && !(p.levels && p.levels[o] === 'off')) { move(s, 'switch', s.cur, s.cur, 'a hard set, so a round of ' + o + ' first'); subj = o; s = st(p, subj); }
    } else s.sw = false;
    var pk = pick(p, subj, { round: true, untaughtOk: true }), sk = C.byId[pk.skill], T = C.track(p, subj), sst = C.state(p, pk.skill);
    if (s.teach) { var ts = C.state(p, s.teach); if (ts) ts.introduced = false; s.teach = null; }
    if (!pk.review) { T.current = pk.skill; T.returnTo = null; if (sst.status === 'locked') sst.status = 'open'; if (!sk.isStep) sst.level = pk.level; }
    var round = { skill: sk, level: pk.level, review: !!pk.review, tier: pk.tier || 0, ladder: { subj: subj, i: pk.i, d: pk.d, kind: pk.kind, best0: s.best } };
    if (pk.review) round.nOk = 5;
    return round;
  };
  var baseRec = C.recordAnswer;
  C.recordAnswer = function (p, id, ok, opt) {
    var out = baseRec.apply(this, arguments);
    try { if (on(p) && C.byId[id] && SUBJ[C.subjectOf(C.byId[id])]) answer(p, C.subjectOf(C.byId[id]), id, ok, opt); } catch (e) { if (A.debug) console.warn(e); }
    return out;
  };
  var baseFinish = C.finishRound;
  C.finishRound = function (p, round, res) {
    if (!round || !round.ladder || !on(p)) return baseFinish(p, round, res);
    var s0 = round.skill, sst = C.state(p, s0.id), subj = round.ladder.subj, s = st(p, subj), tot = res.correct + res.wrong, acc = tot ? res.correct / tot : 1;
    sst.hist.push({ t: Date.now(), c: res.correct, w: res.wrong, l: round.level, r: round.review ? 1 : 0, ms: res.ms || 0 }); if (sst.hist.length > 60) sst.hist = sst.hist.slice(-60);
    sst.timeMs += res.ms || 0; sst.introduced = true; if (!sst.day0) sst.day0 = A.today();
    if (res.gaveUp && res.wrong >= 2) quit(p, subj, res.wrong);
    var ev = { acc: acc, ladder: true }, say = [];
    if (s.newMast && s.newMast.length) { ev.mastered = s.newMast[0]; s.newMast = []; say = ['fb_mastered']; }
    else if (s.best > (round.ladder.best0 || 0)) { ev.levelUp = true; say = ['fb_level_up']; }
    else if (round.review) say = acc >= .8 ? ['fb_review_good'] : [];
    else if (acc < .5) say = ['fb_keep_going'];   // never a "you went down" message: the kid's meter only goes up
    ev.meter = s.best + 1;
    return { say: say, events: ev };
  };
  if (C.setCurrent) { var baseSet = C.setCurrent; C.setCurrent = function (p, id, level) { var r = baseSet.apply(this, arguments); try { if (on(p) && C.byId[id]) reseedAt(p, id, level); } catch (e) {} return r; }; }
  if (A.Levels && A.Levels.set) { var baseLv = A.Levels.set; A.Levels.set = function (p, subj, v) { var r = baseLv.apply(this, arguments); try { if (SUBJ[subj] && p.learn && p.learn.rate && p.learn.rate[subj]) { delete p.learn.rate[subj]; } } catch (e) {} return r; }; }
  // per-question games (Slugger): Questions.step asks the ladder. offset 0 = her rung (review / hint / guided included), 1 = Tricky
  // (one rung up, taught skills only, max 1 in 5), .5 = the top of her rung, -1 = one rung easier. A story round keeps its stop's skill.
  var baseStep = Q.step;
  Q.step = function (p, round, offset) {
    var sid = round && round.skill && (round.skill.id || round.skill), sk = sid && C.byId[sid];
    if (!sk || !on(p) || !SUBJ[C.subjectOf(sk)]) return baseStep.apply(this, arguments);
    var subj = C.subjectOf(sk), s = st(p, subj);
    if (offset >= 1) { var x = stretch(p, subj); if (!x) return { skill: sk, level: round.level, atLevel: true, offset: 0, hard: false }; return { skill: C.byId[x.skill], level: x.level, atLevel: false, offset: 1, hard: false, tier: x.tier || 0, tierHint: !!x.tierHint, ladder: x }; }
    if (offset < 0) { var e = easier(p, subj); return { skill: C.byId[e.skill], level: e.level, easy: true, atLevel: true, offset: -1, tier: e.tier || 0, tierHint: !!e.tierHint, ladder: e }; }
    if (round.story) { s.q++; var hs = { skill: sk, level: round.level, atLevel: true, offset: offset > 0 ? .5 : 0, hard: offset > 0, hint: !!s.hint, tier: offset > 0 ? 0 : round.tier || 0, tierHint: offset > 0 ? false : (round.tier || 0) >= 3 };
      s.srv = { skill: sid, level: round.level, d: (s.by[sid] && s.by[sid].d) || (rungOf(subj, sid, round.level) || {}).d, kind: 'story' };
      if (s.guided) { hs.guided = true; hs.hint = true; hs.choices = 2; s.srv.guided = true; } return hs; }
    if (offset > 0 && offset < 1) { var cr = rungs(subj)[s.cur], csk = resolve(p, cr); return csk.tier ? { skill: C.byId[csk.skill], level: csk.level, atLevel: true, offset: .5, tier: Math.max(1, csk.tier - 1) } : { skill: C.byId[csk.skill], level: csk.level, atLevel: true, offset: .5, hard: true }; }
    var pk = pick(p, subj, { mc: true, target: round.ladderTarget || CFG.target });
    return { skill: C.byId[pk.skill], level: pk.level, atLevel: !pk.review, offset: 0, tier: pk.tier || 0, tierHint: !!pk.tierHint, review: !!pk.review, hint: !!pk.hint, guided: !!pk.guided, choices: pk.choices || null, ladder: pk };
  };
  // story: stops and bosses ask the ladder (never bump to a new skill); the little path's boss stays as it is
  function stopTarget(i) {
    var S2 = A.Story2; if (!S2 || !S2.LEVELS) return CFG.story;
    if (S2.isBoss && S2.isBoss(i)) return CFG.boss;   // .85 rung + the harder tier (see wireStory)
    var k = S2.placeOfStop ? S2.placeOfStop(i) : -1; if (k < 0) return CFG.story;
    return S2.LEVELS[k].indexOf(i) === 0 ? CFG.story0 : CFG.story;
  }
  function wireStory() {
    var ST = A.Story; if (!ST || !ST.config || ST.config._ladder) return;
    var prevCfg = ST.config;
    ST.config = function (p, i) {
      var c = prevCfg(p, i); if (!c || !c.skill || !on(p) || !C.byId[c.skill]) return c;
      var boss = A.Story2 && A.Story2.isBoss ? A.Story2.isBoss(i) : !!c.boss, little = ST.path && ST.path(p) === 'little';
      if (boss && little) return c;
      var subj = c.slot && SUBJ[c.slot] ? c.slot : C.subjectOf(C.byId[c.skill]); if (!SUBJ[subj]) return c;
      var P = stopTarget(i), r = peek(p, subj, P);
      c.skill = r.skill; c.level = r.level; c.hard = false; c.tier = r.tier || 0; c.ladder = { subj: subj, i: r.i, d: r.d, target: P };
      if (boss) {   // boss rules stay (free miss, no regen, the snack ramp). The small step = the harder tier of her ladder skill
        c.hard = true; c.tier = 0; c.bossHarder = true; c.ladderBoss = true; c.ladder.d = r.d + CFG.gap;
        var sb = st(p, subj).by[r.skill]; if (sb) sb.d = c.ladder.d;   // her answers are rated at the stepped difficulty
      }
      return c;
    };
    ST.config._ladder = true;
  }
  wireStory();

  /* ---------- round 2: Bubble Pop, Lemonade Stand, Slugger's scoreboard questions and the bonus questions ----------
     Their math / reading kinds (tagged in grade units in learn.js) are picked from a band around her ladder rung instead of the
     classic floor: from half a grade under her rung to 0.75 over it (never past the little-ones ceiling). First-try answers on
     those kinds nudge her rating at half weight (their tags are coarse); they never count toward sets, guards or mastery. */
  var SIDE = { under: .5, over: .75, w: .5 };
  // side games only READ the rating: a profile that has no rating yet gets a dry seed (nothing is stored, her current skill is not
  // moved), so opening Bubble Pop or the Stand never changes a save; their answers nudge a rating only once one exists
  function peekSt(p, subj) { var r = p && p.learn && p.learn.rate && p.learn.rate[subj]; return r && r.v === 1 ? r : seed(p, subj, true); }
  function rungD(p, subj) { var s = peekSt(p, subj); return rungs(subj)[s.cur].d; }
  function sideBand(p, subj, ceil0) { var d = rungD(p, subj); return { lo: d - SIDE.under, hi: Math.min(ceil0 == null ? 9 : ceil0, d + SIDE.over) }; }
  function famOf(id) { var pre = String(id).split('_')[0], sj = Ln.subjOfKind(id); return Object.keys(Ln.GL).filter(function (k) { return k.split('_')[0] === pre && Ln.subjOfKind(k) === sj; }); }
  // like learn.js capOf: the floor never leaves fewer than 2 kinds of the family (so a strong kid still has some to play)
  function famCap(ids, f) { var need = Math.min(2, ids.length), tops = ids.map(Ln.glTop).filter(function (v) { return v != null; }); if (!ids.length) return f;
    for (var g = Math.floor(f * 2) / 2; g > 0; g -= .5) { if (tops.filter(function (v) { return v >= g; }).length >= need) return g; } return 0; }
  function sideOn(p, id) { var sj = Ln.subjOfKind(id); return on(p) && SUBJ[sj] && C.list(sj).length ? sj : null; }
  function sideLo(p, id, sj) { var b = sideBand(p, sj); return Math.min(b.lo, famCap(famOf(id), b.lo)); }
  function rateSide(p, id, sub, ok) {
    var sj = sideOn(p, id); if (!sj) return; var v = Ln.gl(id, sub || 0); if (v == null) return;
    var s = p.learn && p.learn.rate && p.learn.rate[sj]; if (!s || s.v !== 1) return; var g = gOf(p), P = pHat(s.th, v, g); s.th = +(s.th + SIDE.w * K_(s) * ((ok ? 1 : 0) - P)).toFixed(4); s.side = (s.side || 0) + 1;
  }
  function wireSide() {
    if (Ln._ladderSide) return; Ln._ladderSide = true;
    var bSub = Ln.bubbleSub, kOk = Ln.kindOk, ceil0 = Ln.ceil, bMin = Ln.bonusMinD, sk0 = Ln.sluggerKinds;
    Ln.bubbleSub = function (p, id) { var sj = sideOn(p, id); if (!sj) return bSub.apply(this, arguments);
      var n = Array.isArray(Ln.GL[id]) ? Ln.GL[id].length : 1, f = sideLo(p, id, sj); for (var k = 0; k < n; k++) if (Ln.gl(id, k) >= f) return k; return -1; };
    Ln.kindOk = function (p, id, sub) { var sj = sideOn(p, id); if (!sj) return kOk.apply(this, arguments);
      var v = Ln.gl(id, sub); return v == null || (v >= sideLo(p, id, sj) && v <= sideBand(p, sj, ceil0(p, sj)).hi); };
    Ln.ceil = function (p, subj) { var c = ceil0.apply(this, arguments); if (!p || !on(p) || !SUBJ[subj] || !C.list(subj).length) return c; return sideBand(p, subj, c).hi; };
    if (bMin) Ln.bonusMinD = function (p) { if (!on(p) || (A.Age && A.Age.preReader && A.Age.preReader(p))) return bMin.apply(this, arguments);
      // trivia, not a skill: her rating (the lower of math / reading) picks the grade of the bonus questions (1 Pre-K, 2 K, 3 1st)
      var f = Math.min(peekSt(p, 'math').th, C.list('reading').length && !(p.levels && p.levels.reading === 'off') ? peekSt(p, 'reading').th : 9); return f >= 3 ? 3 : f >= 2 ? 2 : 1; };
    if (sk0) Ln.sluggerKinds = function (p) { if (!on(p) || (A.Age && A.Age.preReader && A.Age.preReader(p))) return sk0.apply(this, arguments);
      var all = ['bb_where', 'bb_runs', 'bb_left', 'bb_towin', 'bb_tied', 'bb_totie'], f = sideLo(p, 'bb_where', 'math'); if (rungD(p, 'math') - SIDE.under >= 3.5) return [];
      var ok = all.filter(function (k) { return Ln.gl(k, 0) >= f; }); return ok.length ? ok : ['bb_where', 'bb_towin', 'bb_totie']; };
    // first-try answers in Bubble Pop (one per target) and Lemonade Stand (one per order) nudge the rating
    if (A.Bubble && A.Bubble.record && !A.Bubble.record._ladder) { var bRec = A.Bubble.record; A.Bubble.record = function (p, t, r) {
      try { if (t && !t._lr && t.step) { t._lr = 1; var q = A.Bubble.state(p, t.step); rateSide(p, t.step, q && q.sub, !!(r && r.ok)); } } catch (e) {}
      return bRec.apply(this, arguments); }; A.Bubble.record._ladder = true; }
    if (A.Stand && A.Stand.record && !A.Stand.record._ladder) { var sRec = A.Stand.record; A.Stand.record = function (p, o, r) {
      try { if (o && o.step && r) { var q = A.Stand.state ? A.Stand.state(p, o.step) : null; rateSide(p, o.step, q && q.sub, !!r.first); } } catch (e) {}
      return sRec.apply(this, arguments); }; A.Stand.record._ladder = true; }
  }
  wireSide();

  var L = A.Ladder = { CFG: CFG, DEFAULT: DEFAULT, LOOKALIKE: LOOKALIKE, on: on, setOn: setOn, eligible: eligible, rungs: rungs, fineD: fineD, rungOf: rungOf, topRung: topRung,
    state: st, seed: seed, pick: pick, peek: peek, stretch: stretch, easier: easier, answer: answer, quit: quit, reseedAt: reseedAt, reset: reset, meter: meter,
    line: line, info: info, pHat: pHat, SIDE: SIDE, sideBand: sideBand, rateSide: rateSide, dFor: dFor, agePrior: agePrior, dayN: dayN, stopTarget: stopTarget, lookalike: lookalike, _clear: function () { cache = {}; } };
})(window.Arcade);
