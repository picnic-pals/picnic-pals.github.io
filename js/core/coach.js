/* Blob Arcade — mastery coaching engine (per the 2026-10-21 curriculum review, §3.5 and §4).
   Pure logic on a player profile, no DOM, so it runs in Node too (see _test/coach-test.js, fake clock via Coach.setClock).
   - Per-item tracking: p.coach.items[skill][item] = { s: seen, c: correct, h: hint-assisted correct, m: misses, b: Leitner box 1-6,
     l: last seen (ms), due: next review (ms), d: [days answered correctly without a hint] }.
     An item is a fact ("3 + 4"), a word ("said") or a story passage ("rc_1_7").
   - p.coach.log[skill] = the last answers [{ t, d: day, k: item, c: credit 0 / HINT_CREDIT (.9) / 1 }]: a correct answer after a miss or hint earns partial credit.
   - Leitner: a miss drops the item to box 1 (ask again this session); a correct, hint-free answer when the item is due moves it up one
     box. Box 1 = same session, then 1, 3, 7, 14 and 30 days.
   - Mastery (ready()) needs the accuracy threshold over enough items AND enough separate days, by skill type (TYPES below).
   - Session coaching (in memory, not saved): misses in a row (2 = ease off + hint, 3 = worked example), fast correct answers in a
     row (5 = speed up / test-out), correct streaks (celebrate at 5, 10, 15 …), and a re-ask queue (a missed item comes back 2-3
     questions later).
   Old saves: ensure() adds p.coach; nothing else in the save changes (schema stays v3, extra fields are ignored by older code). */
(function (A) {
  'use strict';
  var HINT_CREDIT = .9;   // mastery credit for a correct answer given after a miss / with a hint showing (was .5; with math at 90%
                         // that kept a typical 85% kid from a first mastery for weeks, see /tmp/dora/sim.js — tuned 2026-10-21)
  var DAY = 864e5, BOX_DAYS = [0, 0, 1, 3, 7, 14, 30];   // index = box (1..6); box 1 = this session
  var clock = function () { return Date.now(); };
  function now() { return clock(); }
  function dayKey(t) { var d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  // thresholds by skill type (review §4 "Thresholds by skill type")
  var TYPES = {
    facts: { acc: .85, min: 30, days: 3, label: 'Add/sub facts: 85%+ over 30+ answers on 3 days' },
    count: { acc: .85, min: 20, days: 2, label: 'Number sense: 85%+ over 20+ answers on 2 days' },
    letters: { acc: .85, min: 20, days: 2, label: 'Letters: 85%+ over 20+ answers on 2 days' },
    phonics: { acc: .9, min: 15, days: 2, label: 'Phonics: 90%+ over 15+ words on 2 days' },
    sight: { acc: .85, min: 15, days: 3, perItemDays: 3, itemShare: .8, minItems: 8, label: 'Sight words: each word right on 3 separate days' },
    story: { acc: .8, min: 10, days: 2, distinct: 10, label: 'Stories: 80%+ over 10+ different passages on 2 days' },
    vocab: { acc: .85, min: 15, days: 2, label: 'Words: 85%+ over 15+ answers on 2 days' },
    concepts: { acc: .9, min: 15, days: 2, label: 'Shapes & colors: 90%+ over 15+ answers on 2 days' },
    wordprob: { acc: .85, min: 20, days: 2, label: 'Story problems: 85%+ over 20+ answers on 2 days' }
  };
  var TYPE_OF = { add10: 'facts', sub10: 'facts', make10: 'facts', missing: 'facts', add20: 'facts', sub20: 'facts', wordprob: 'wordprob',
    count10: 'count', compare: 'count', teen: 'count', evenodd: 'count',
    letters: 'letters', begsound: 'letters', rhymes: 'phonics', cvc: 'phonics', digraph: 'phonics', longvowel: 'phonics', homophones: 'phonics', affixes: 'phonics',
    sight: 'sight', sight2: 'sight', sight3: 'sight', comprehension: 'story', opposites: 'vocab', nounverb: 'vocab', colors: 'concepts', shapes: 'concepts' };
  function typeOf(sid) { return TYPE_OF[sid] || 'vocab'; }
  function rule(sid) { return TYPES[typeOf(sid)]; }

  /* ---------- saved data ---------- */
  function data(p) {
    var c = p.coach;
    if (!c || typeof c !== 'object') c = p.coach = { v: 1, items: {}, log: {} };
    if (!c.items) c.items = {}; if (!c.log) c.log = {}; if (!c.v) c.v = 1;
    return c;
  }
  function items(p, sid) { var c = data(p); return c.items[sid] || (c.items[sid] = {}); }
  function item(p, sid, key) {
    var m = items(p, sid), r = m[key];
    if (!r) r = m[key] = { s: 0, c: 0, h: 0, m: 0, b: 1, l: 0, due: 0, d: [] };
    if (!r.d) r.d = []; if (!r.b) r.b = 1;
    return r;
  }

  /* ---------- session (in memory only) ---------- */
  var SESS = {};
  function sess(p) {
    var s = SESS[p.id || '_'];
    if (!s || now() - s.at > 2 * 3600e3) s = SESS[p.id || '_'] = { at: now(), n: 0, missRun: 0, okRun: 0, fastRun: 0, reask: [], best: 0 };
    s.at = now(); return s;
  }
  function resetSession(p) { delete SESS[p.id || '_']; }

  // Record one answer. opt: { hint: true (a hint/worked example was showing), ms: response time, fast: ms under this skill's target }
  // Returns the coaching signals for this answer.
  function answer(p, sid, key, ok, opt) {
    opt = opt || {}; key = String(key);
    var t = now(), r = item(p, sid, key), S = sess(p), hint = !!opt.hint, credit = ok ? (hint ? Coach.HINT_CREDIT : 1) : 0, wasDue = !r.l || t >= r.due;
    r.s++; r.l = t;
    if (ok) {
      r.c++; if (hint) r.h++;
      if (!hint) { if (wasDue) r.b = Math.min(6, r.b + 1); var dk = dayKey(t); if (r.d.indexOf(dk) < 0) { r.d.push(dk); if (r.d.length > 6) r.d.shift(); } }
    } else { r.m++; r.b = 1; }
    r.due = t + BOX_DAYS[r.b] * DAY;
    var lg = data(p).log[sid] || (data(p).log[sid] = []); lg.push({ t: t, d: dayKey(t), k: key, c: credit }); if (lg.length > 80) lg.splice(0, lg.length - 80);
    // session signals
    S.n++;
    var sig = { credit: credit, easeOff: false, worked: false, speedUp: false, streak: 0, reask: false };
    if (ok) {
      S.missRun = 0; S.okRun++; S.fastRun = opt.fast && !hint ? S.fastRun + 1 : 0;
      if (S.okRun >= 5 && S.okRun % 5 === 0) sig.streak = S.okRun;
      if (S.fastRun >= 5) { sig.speedUp = true; S.fastRun = 0; }
      S.reask = S.reask.filter(function (q) { return q.k !== key; });
    } else {
      S.okRun = 0; S.fastRun = 0; S.missRun++;
      if (S.missRun === 2) sig.easeOff = true;
      if (S.missRun >= 3) { sig.worked = true; S.missRun = 0; }
      // re-ask: this item comes back 2-3 questions from now
      S.reask = S.reask.filter(function (q) { return q.k !== key; }); S.reask.push({ k: key, sid: sid, at: S.n + 2 + (opt.gap != null ? opt.gap : Math.round(Math.random())) });
      sig.reask = true;
    }
    return sig;
  }
  // a missed item that is due to be asked again now (2-3 questions after the miss), or null
  function reaskDue(p, sid) { var S = sess(p), q = S.reask.find(function (x) { return x.at <= S.n + 1 && (!sid || x.sid === sid); }); return q ? q.k : null; }
  function reaskTake(p, key) { var S = sess(p); S.reask = S.reask.filter(function (q) { return q.k !== key; }); }

  /* ---------- mastery ---------- */
  // Is the skill ready to be mastered? { ok, acc, n, days, why }
  function ready(p, sid) {
    var R = rule(sid), lg = (data(p).log[sid] || []).slice(-Math.max(R.min, 40)), n = lg.length;
    var acc = n ? lg.reduce(function (a, x) { return a + x.c; }, 0) / n : 0, days = {}, keys = {};
    lg.forEach(function (x) { days[x.d] = 1; keys[x.k] = 1; });
    var nd = Object.keys(days).length, nk = Object.keys(keys).length, why = [];
    if (n < R.min) why.push('needs ' + (R.min - n) + ' more answers');
    if (acc < R.acc) why.push('accuracy ' + Math.round(acc * 100) + '% (needs ' + Math.round(R.acc * 100) + '%)');
    if (nd < R.days) why.push('needs ' + R.days + ' separate days (has ' + nd + ')');
    if (R.distinct && nk < R.distinct) why.push('needs ' + R.distinct + ' different ' + (typeOf(sid) === 'story' ? 'passages' : 'items') + ' (has ' + nk + ')');
    if (R.perItemDays) {
      var all = Object.keys(items(p, sid)).map(function (k) { return items(p, sid)[k]; }), good = all.filter(function (r) { return r.d.length >= R.perItemDays; }).length;
      if (all.length < R.minItems || good < Math.ceil(all.length * R.itemShare)) why.push(good + ' of ' + all.length + ' words right on ' + R.perItemDays + ' days');
    }
    return { ok: !why.length, acc: acc, n: n, days: nd, distinct: nk, why: why };
  }

  // Keep ~75-85% of questions winnable: -1 = make the next round easier, +1 = can be harder, 0 = fine
  function winnable(p, sid) {
    var lg = (data(p).log[sid] || []).slice(-20); if (lg.length < 8) return 0;
    var acc = lg.reduce(function (a, x) { return a + (x.c > 0 ? 1 : 0); }, 0) / lg.length;
    return acc < .75 ? -1 : acc > .9 ? 1 : 0;
  }

  /* ---------- spaced review ---------- */
  function dueItems(p, sid, at) { at = at || now(); var m = items(p, sid); return Object.keys(m).filter(function (k) { return m[k].l && m[k].due <= at; }); }
  function nextDue(p, sid) { var m = items(p, sid), best = 0; Object.keys(m).forEach(function (k) { var r = m[k]; if (r.l && r.b > 1 && (!best || r.due < best)) best = r.due; }); return best || null; }
  function lastSeen(p, sid) { var m = items(p, sid), t = 0; Object.keys(m).forEach(function (k) { t = Math.max(t, m[k].l || 0); }); return t || null; }
  function mostMissed(p, sid, n) {
    var m = items(p, sid);
    return Object.keys(m).filter(function (k) { return m[k].m > 0; }).sort(function (a, b) { return m[b].m - m[a].m || m[b].l - m[a].l; }).slice(0, n || 3)
      .map(function (k) { return { k: k, m: m[k].m, s: m[k].s }; });
  }
  function boxShare(p, sid, minBox) { var m = items(p, sid), ks = Object.keys(m); if (!ks.length) return 0; return ks.filter(function (k) { return m[k].b >= minBox; }).length / ks.length; }
  // which bucket a mastered skill is in for the session mix: 'recent' (items mostly in boxes 1-3) or 'older' (boxes 4-6)
  function bucket(p, sid) { return boxShare(p, sid, 4) >= .5 ? 'older' : 'recent'; }
  // the session mix: ~65% current skill, 20% recent, 15% older mastered (smooth weighted round-robin, so short sessions come out right)
  var MIX = { current: .65, recent: .2, older: .15 };
  function chooseSlot(p, have) {
    var c = data(p).mix || (data(p).mix = {}), w = {}, tot = 0, best = null;
    Object.keys(MIX).forEach(function (k) { if (k === 'current' || have[k]) { w[k] = MIX[k]; tot += MIX[k]; } });
    Object.keys(w).forEach(function (k) { c[k] = (c[k] || 0) + w[k] / tot; if (best == null || c[k] > c[best] + 1e-9) best = k; });
    c[best] -= 1; return best;
  }
  // test-out: a 5-question probe; all right, fast and hint-free jumps the level (or the skill) and puts its items in box 3
  function testOutPassed(res) { return res && res.correct >= 5 && !res.wrong && !res.hinted; }
  function bumpItems(p, sid, box) { var m = items(p, sid), t = now(); Object.keys(m).forEach(function (k) { if (m[k].b < box) { m[k].b = box; m[k].due = t + BOX_DAYS[box] * DAY; } }); }

  var Coach = {
    DAY: DAY, BOX_DAYS: BOX_DAYS, TYPES: TYPES, HINT_CREDIT: HINT_CREDIT, MIX: MIX, typeOf: typeOf, rule: rule, dayKey: dayKey,
    setClock: function (fn) { clock = fn || function () { return Date.now(); }; }, now: now,
    data: data, item: item, items: items, answer: answer, session: sess, resetSession: resetSession, reaskDue: reaskDue, reaskTake: reaskTake,
    ready: ready, winnable: winnable, dueItems: dueItems, nextDue: nextDue, lastSeen: lastSeen, mostMissed: mostMissed, boxShare: boxShare,
    bucket: bucket, chooseSlot: chooseSlot, testOutPassed: testOutPassed, bumpItems: bumpItems
  };
  A.Coach = Coach;
})(typeof window !== 'undefined' ? window.Arcade : global.Arcade);

/* ---------- Coaching engine v2 (owner-approved 2026-10-21) ----------
   1. Per-item mastery estimate (Elo-style): a rating per player per skill (p.coach.theta[sid]) and a difficulty per item
      (item.e). P(correct) = 1 / (1 + e^-(theta - e)). Each answer nudges both (a hint-assisted answer counts as half).
      pickItem() picks the candidate whose expected success is closest to the target (82.5%, inside the 80-85% band),
      shifted easier after misses (ease-off) and a little harder after a fast run (speed-up). The 65/20/15 session mix
      still decides WHICH skill a round practices; this only picks items inside the round.
   2. Error diagnosis: ERRORS is a data table { id, label, test(ctx), hint } — add a row to add a pattern. diagnose() records
      p.coach.errors[sid][id] counts and a short p.coach.errLog.
   3. Placement check: placementResult(p, sid, score of 5): 5 = skip (mastered, 'placed', still in spaced review),
      4 = start one level higher, else start normally.
   4. progressSummary()/progressText(): the grown-up export (per player; optional "Player 1" instead of the name).
   Old saves: coach v1 data is migrated on load (ratings seeded from each item's own history); nothing is deleted. */
(function (A) {
  'use strict';
  var K = A.Coach; if (!K) return;
  var TARGET = 0.825, BAND = [0.8, 0.85], THETA0 = 1.2;
  function sig(x) { return 1 / (1 + Math.exp(-x)); }
  function logit(q) { q = Math.min(.98, Math.max(.05, q)); return Math.log(q / (1 - q)); }

  /* ---- migration v1 -> v2 (safe: only adds fields) ---- */
  function migrate(c) {
    c.theta = c.theta || {}; c.errors = c.errors || {}; c.errLog = c.errLog || [];
    Object.keys(c.items || {}).forEach(function (sid) {
      var m = c.items[sid], ks = Object.keys(m), tc = 0, ts = 0;
      ks.forEach(function (k) { var r = m[k]; tc += (r.c || 0) - .5 * (r.h || 0); ts += r.s || 0; });
      if (c.theta[sid] == null) c.theta[sid] = ts ? logit((tc + 1.6) / (ts + 2)) : THETA0;
      ks.forEach(function (k) { var r = m[k]; if (r.e == null) r.e = c.theta[sid] - logit((((r.c || 0) - .5 * (r.h || 0)) + 1.6) / ((r.s || 0) + 2)); });
    });
    c.v = 2; return c;
  }
  var baseData = K.data;
  K.data = function (p) { var c = baseData(p); if (!(c.v >= 2) || !c.theta) migrate(c); return c; };
  function theta(p, sid) { var c = K.data(p); return c.theta[sid] != null ? c.theta[sid] : THETA0; }
  function itemDiff(p, sid, key, prior) { var m = K.items(p, sid)[String(key)]; return m && m.e != null ? m.e : (prior || 0); }
  // expected chance of a right answer for this player on this item (prior: difficulty guess for a new item, 0 = average)
  function prob(p, sid, key, prior) { return sig(theta(p, sid) - itemDiff(p, sid, key, prior)); }

  var baseAnswer = K.answer;
  K.answer = function (p, sid, key, ok, opt) {
    opt = opt || {}; key = String(key);
    var c = K.data(p), exists = !!K.items(p, sid)[key], P = prob(p, sid, key, opt.diff);
    var res = baseAnswer(p, sid, key, ok, opt), r = K.item(p, sid, key);
    if (!exists || r.e == null) r.e = opt.diff || 0;
    var o = ok ? (opt.hint ? .5 : 1) : 0, n = (c.log[sid] || []).length;
    var kt = Math.max(.06, .5 / (1 + n / 25)), ki = Math.max(.1, .8 / (1 + (r.s - 1) / 3));   // big steps while little is known, small ones later
    c.theta[sid] = theta(p, sid) + kt * (o - P);
    r.e = r.e - ki * (o - P);
    res.p = P; return res;
  };

  // the target chance of success right now: 82.5%; after misses (ease off) easier, after a fast run (speed up) a bit harder
  function target(p, opt) {
    var S = K.session(p); opt = opt || {};
    if (opt.easeOff || S.missRun >= 2) return .92;
    if (S.missRun === 1) return .87;
    if (opt.speedUp || S.fastRun >= 3) return .76;
    return TARGET;
  }
  /* pick one candidate. cands: [{ key, diff? (prior difficulty), ...anything }]. Avoids the items answered in the last 2 turns
     when there is a choice. Returns the chosen candidate with .p (expected success). */
  function pickItem(p, sid, cands, opt) {
    if (!cands || !cands.length) return null;
    var T = target(p, opt), lg = (K.data(p).log[sid] || []).slice(-2).map(function (x) { return x.k; }), best = null, bs = 1e9;
    cands.forEach(function (cd) {
      var q = prob(p, sid, cd.key, cd.diff), s = Math.abs(q - T) + (lg.indexOf(String(cd.key)) >= 0 && cands.length > 1 ? .2 : 0) + (opt && opt.rand ? opt.rand() : Math.random()) * .01;
      cd.p = q; if (s < bs) { bs = s; best = cd; }
    });
    return best;
  }
  // average expected success over a set of item keys
  function expected(p, sid, keys) { return keys.length ? keys.reduce(function (a, k) { return a + prob(p, sid, k); }, 0) / keys.length : null; }

  /* ---- error diagnosis (data-driven) ----
     ctx: { sid, chosen: the wrong answer's label, answer: the right answer's label, value: chosen's number value (a fact is
     evaluated, "3 + 5" -> 8), target: the right number, op: '+' | '-' (the story's operation), a, b: the story's numbers, word: bool } */
  function num(s) { return /^\d+$/.test(String(s)) ? +s : null; }
  function evalFact(s) { var m = String(s).replace(/\s+/g, '').match(/^(\d+)([+\-−])(\d+)$/); if (m) return m[2] === '+' ? +m[1] + +m[3] : +m[1] - +m[3]; return num(s); }
  function rev(s) { return String(s).split('').reverse().join(''); }
  function sorted(s) { return String(s).toLowerCase().split('').sort().join(''); }
  var ERRORS = [
    { id: 'teen_reversal', label: 'Teen reversal (14 vs 41)', hint: 'teen',
      test: function (x) { var a = String(x.answer), c = String(x.chosen); return num(a) != null && num(c) != null && a.length === 2 && c.length === 2 && a !== c && rev(a) === c && ((+a >= 11 && +a <= 19) || (+c >= 11 && +c <= 19)); } },
    { id: 'wrong_operation', label: 'Wrong operation (added instead of subtracted, or the other way)', hint: 'story_picture',
      test: function (x) { if (!x.op || x.a == null || x.b == null || x.value == null) return false; var other = x.op === '+' ? Math.abs(x.a - x.b) : x.a + x.b; return x.value === other && other !== x.target; } },
    { id: 'count_on_off_by_one', label: 'Off by one when counting on', hint: 'count_on',
      test: function (x) { return x.target != null && x.value != null && Math.abs(x.value - x.target) === 1 && (x.op === '+' || x.op === '-' || /[+\-−]/.test(String(x.chosen)) || /^(add|sub|make|missing|wordprob|count)/.test(x.sid || '')); } },
    { id: 'bd_confusion', label: 'b / d mix-up', hint: 'bed',
      test: function (x) { var a = String(x.answer).toLowerCase(), c = String(x.chosen).toLowerCase(); if (a === c || a.length !== c.length || !/[bd]/.test(a + c)) return false;
        return c.replace(/[bd]/g, function (ch) { return ch === 'b' ? 'd' : 'b'; }) === a || (a.replace(/[bd]/g, '') === c.replace(/[bd]/g, '') && diffs(a, c).every(function (d) { return /[bd]/.test(d[0]) && /[bd]/.test(d[1]); })); } },
    { id: 'sight_lookalike', label: 'Look-alike word (was / saw)', hint: 'first_letter',
      test: function (x) { var a = String(x.answer).toLowerCase(), c = String(x.chosen).toLowerCase(); return /^[a-z]{2,}$/.test(a) && /^[a-z]{2,}$/.test(c) && a !== c && (rev(a) === c || sorted(a) === sorted(c)); } }
  ];
  function diffs(a, b) { var o = []; for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) o.push([a[i], b[i]]); return o; }
  // the mini-lessons, by hint id: { title, say: [voice parts], text: plain words (also used by the export), html(ctx) }
  var HINTS = {
    teen: { title: 'Tens and ones', say: ['err_teen'], text: 'Teen numbers start with 1 ten. 14 is 1 ten and 4 ones.',
      html: function (x) { var t = +x.answer >= 11 && +x.answer <= 19 ? +x.answer : +x.chosen, o = t - 10, C = A.Curriculum;
        return '<div class="diag teen"><div class="tens">' + (C ? C.frame(10) : '') + '<b>1 ten</b></div><div class="ones">' + (C ? C.frame(o) : '') + '<b>' + o + ' ones</b></div>' +
          '<p><b>' + t + '</b> = 1 ten and ' + o + ' ones. ' + rev(t) + ' would be ' + String(t).charAt(1) + ' tens!</p></div>'; } },
    count_on: { title: 'Count on', say: ['err_count_on'], text: 'Start from the number, then count up.',
      html: function (x) { return '<div class="diag counton"><p>Start from the number, then count up.</p>' + (x.a != null && x.b != null && x.op === '+' ? '<p class="hops"><b>' + x.a + '</b>' + Array.apply(null, Array(Math.min(x.b, 12))).map(function (_, i) { return ' → ' + (x.a + i + 1); }).join('') + '</p>' : '') + '</div>'; } },
    bed: { title: 'The “bed” trick', say: ['err_bed'], text: 'Make a bed with your hands: b comes first, d comes last — b-e-d.',
      html: function () { return '<div class="diag bed"><div class="hands"><span>👍<b>b</b></span><span class="e">e</span><span><b>d</b>👍</span></div><p>Make two thumbs-up: your left hand is <b>b</b>, your right hand is <b>d</b>. It looks like a <b>bed</b>!</p></div>'; } },
    story_picture: { title: 'Picture the story', say: ['err_story'], text: 'Draw the story: are we putting together (+) or taking away (−)?',
      html: function (x) { var em = x.em || '🍎', a = Math.min(x.a || 0, 20), b = Math.min(x.b || 0, 20), s = '';
        if (x.op === '+') s = '<span>' + Array(a + 1).join(em) + '</span><b> + </b><span>' + Array(b + 1).join(em) + '</span>';
        else s = '<span>' + Array(a - b + 1).join(em) + '<s>' + Array(b + 1).join(em) + '</s></span>';
        return '<div class="diag story"><div class="pic">' + s + '</div><p>' + (x.op === '+' ? 'More are coming: put them <b>together</b>.' : 'Some go away: <b>take away</b>.') + '</p></div>'; } },
    count_dots: { title: 'Count each one', say: ['err_count_dots'], text: 'Touch each dot and count them: 1, 2, 3…',
      html: function (x) { var t = num(x.answer), C = A.Curriculum; return '<div class="diag countdots"><p>Touch each dot and count them: 1, 2, 3…</p>' + (t != null && t <= 20 && C && C.frame ? '<div>' + C.frame(Math.min(t, 10)) + (t > 10 ? C.frame(t - 10) : '') + '</div><p><b>' + t + '</b></p>' : '') + '</div>'; } },
    count_back: { title: 'Count back', say: ['err_count_back'], text: 'Start from the big number, then count back.',
      html: function (x) { return '<div class="diag countback"><p>Start from the big number, then count back.</p>' + (x.a != null && x.b != null && (x.op === '-' || x.op === '−') ? '<p class="hops"><b>' + x.a + '</b>' + Array.apply(null, Array(Math.min(x.b, 12))).map(function (_, i) { return ' → ' + (x.a - i - 1); }).join('') + '</p>' : '') + '</div>'; } },
    make_ten: { title: 'Make 10', say: ['err_make_ten'], text: 'How many more make 10? Count up to 10 on your fingers.',
      html: function () { var C = A.Curriculum; return '<div class="diag maketen"><p>How many more make <b>10</b>? Count up to 10 on your fingers.</p>' + (C && C.frame ? '<div>' + C.frame(10) + '</div>' : '') + '</div>'; } },
    number_line: { title: 'Numbers in order', say: ['err_number_line'], text: 'Say the numbers in order. Which one is missing?',
      html: function () { return '<div class="diag numline"><p>Say the numbers in order. Which one is missing?</p></div>'; } },
    first_letter: { title: 'Look at the first letter', say: ['err_first_letter'], text: 'Look at the first letter.',
      html: function (x) { var a = String(x.answer), c = String(x.chosen); return '<div class="diag first"><p class="w"><b>' + A.esc(a.charAt(0)) + '</b>' + A.esc(a.slice(1)) + ' · <b>' + A.esc(c.charAt(0)) + '</b>' + A.esc(c.slice(1)) + '</p><p>Look at the first letter.</p></div>'; } }
  };
  // an off-by-one miss gets the hint that fits the skill: count the dots (find the number), count back (take away),
  // make 10, numbers in order (missing number), tens and ones (teen numbers), count on (adding)
  function offByOneHint(sid, x) {
    sid = sid || ''; var ch = String(x.chosen), minus = x.op === '-' || x.op === '−' || /[\-−]/.test(ch), plus = x.op === '+' || /\+/.test(ch);
    if (/^teen/.test(sid)) return 'teen';
    if (/^make/.test(sid)) return 'make_ten';
    if (/^missing/.test(sid)) return 'number_line';
    if (/^sub/.test(sid) || minus) return 'count_back';
    if (/^add/.test(sid) || plus) return 'count_on';
    return 'count_dots';   // count10 / compare / even-odd / anything else: find the number
  }
  function tag(ctx) { for (var i = 0; i < ERRORS.length; i++) { try { if (ERRORS[i].test(ctx)) return ERRORS[i]; } catch (e) {} } return null; }
  // tag + record a wrong answer. Returns { type, label, hint: HINTS[...] } or null
  function diagnose(p, sid, ctx) {
    ctx = ctx || {}; ctx.sid = sid; if (ctx.value == null) ctx.value = evalFact(ctx.chosen); if (ctx.target == null) ctx.target = num(ctx.answer);
    var e = tag(ctx); if (!e) return null;
    var hid = e.id === 'count_on_off_by_one' ? offByOneHint(sid, ctx) : e.hint;
    var c = K.data(p), m = c.errors[sid] || (c.errors[sid] = {}); m[e.id] = (m[e.id] || 0) + 1;
    c.errLog.push({ t: K.now(), sid: sid, type: e.id, k: String(ctx.chosen) + '→' + String(ctx.answer) }); if (c.errLog.length > 40) c.errLog.splice(0, c.errLog.length - 40);
    return { type: e.id, label: e.label, hint: HINTS[hid], hintId: hid, ctx: ctx };
  }
  function errorCounts(p, sid) { return (K.data(p).errors || {})[sid] || {}; }

  /* ---- placement check (5 questions when a skill first opens) ---- */
  var PLACE_N = 5;
  // should the next round of this skill start with a placement check?
  function wantsPlacement(p, sid) { var st = p.skills && p.skills[sid]; return !!(st && st.placeOffer && !st.placeDone && st.status !== 'mastered' && !st.attempts); }
  // score = right answers of 5. Returns 'skip' | 'higher' | 'normal' | 'back'
  //  5/5 -> skip the skill and check the next one (up to PLACE_CHAIN skills per subject in a row: the first session)
  //  4/5 -> start at the top level · 3/5 -> as placed · 2 or fewer on the START skill -> step back one skill (its top level)
  var PLACE_CHAIN = 4;
  function placementResult(p, sid, score) {
    var C = A.Curriculum, s = C.byId[sid], st = C.state(p, sid), top = Math.max(s.levels.length, s.subLevels || 0) - 1, out, T = C.track(p, C.subjectOf(s));
    st.placeOffer = false; st.placeDone = true; st.placeCheck = { at: K.now(), score: score, of: PLACE_N };
    if (score >= PLACE_N) {
      out = 'skip'; C.markMastered(p, sid); st.placed = true; st.placedBy = 'check'; st.introduced = true; st.placeStart = false;
      K.bumpItems(p, sid, 2);   // the check's items stay in spaced review (due tomorrow)
      T.placeSteps = (T.placeSteps || 0) + 1;
      var nx = C.nextSkill(sid); if (nx && T.placeSteps < PLACE_CHAIN) { var ns = C.state(p, nx.id); if (!ns.attempts && !ns.placeDone && ns.status !== 'mastered') ns.placeOffer = true; }
    } else if (score === PLACE_N - 1) { out = 'higher'; st.level = Math.min(top, st.level + 1); if (st.level === 0 && top > 0) st.level = 1; }
    else if (score <= 2 && st.placeStart) {
      // the start was too high: one skill back (at its top level), or this skill's first level if it is the first rung / already at level 2
      var pv = C.prevSkill ? C.prevSkill(sid) : null;
      if (st.level > 0) { st.level = 0; out = 'back'; }
      else if (pv) {
        var ps = C.state(p, pv.id); ps.status = 'open'; ps.placed = false; ps.level = Math.max(pv.levels.length, pv.subLevels || 0) - 1; ps.placeDone = true; ps.placeOffer = false;
        if (!p.math.pin) { T.current = pv.id; T.returnTo = null; }
        out = 'back';
      } else out = 'normal';
    }
    else out = 'normal';
    st.placeStart = false;
    st.placeCheck.result = out; return out;
  }

  /* ---- progress snapshot export (grown-up page) ---- */
  function iso(t) { if (!t) return null; var d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function label(k) { return String(k).replace(/^rc_(\d)_(\d+)$/, function (_, L, i) { return 'story ' + (+L + 1) + '.' + (+i + 1); }).replace(/^hom_(\d+)$/, 'sentence $1'); }
  function progressSummary(p, opt) {
    opt = opt || {}; var C = A.Curriculum, R = A.Rewards, name = opt.anon ? 'Player 1' : p.name, ERR = {};
    ERRORS.forEach(function (e) { ERR[e.id] = e.label; });
    var wk = R && R.weekDays ? { daysThisWeek: R.weekDays(p), goalDays: R.CONFIG.weekly.days, ofDays: R.CONFIG.weekly.of, weeksMet: R.weeksMet ? R.weeksMet(p) : null } : weekly(p);
    var skills = C.ACTIVE.map(function (s) {
      var st = C.state(p, s.id), m = C.summary(p, s.id), its = K.items(p, s.id), e = errorCounts(p, s.id);
      return { id: s.id, name: s.name, subject: C.subjectOf(s), status: m.label, level: st.level + 1, levels: s.levels.length,
        accuracy: st.attempts ? Math.round(st.correct / st.attempts * 100) / 100 : null, answers: st.attempts, itemsSeen: Object.keys(its).length,
        estimate: Object.keys(its).length ? Math.round(expected(p, s.id, Object.keys(its)) * 100) / 100 : null,
        lastPracticed: iso(m.lastPracticed), nextReview: iso(m.nextReview), placement: st.placeCheck ? st.placeCheck.score + '/' + st.placeCheck.of + ' (' + st.placeCheck.result + ')' : null,
        mostMissed: K.mostMissed(p, s.id, 3).map(function (x) { return { item: label(x.k), missed: x.m, seen: x.s }; }),
        errors: Object.keys(e).map(function (k) { return { type: k, label: ERR[k] || k, count: e[k] }; }).sort(function (a, b) { return b.count - a.count; }) };
    });
    return { app: 'blobArcade', kind: 'progress', v: 1, exported: new Date(K.now()).toISOString(), player: name, age: p.age != null ? p.age : null,
      stars: p.stars || 0, timePlayedMin: Math.round(((p.time && p.time.total) || 0) / 60000), weeklyGoal: wk, skills: skills };
  }
  // weekly goal without rewards.js (Node): play days in each Mon-Sun week, goal 3 of 7
  function weekly(p) {
    function wk(k) { var d = new Date(k + 'T12:00:00'), n = Math.floor(d.getTime() / 864e5); return n - ((n + 3) % 7); }
    var w = {}, met = 0; Object.keys(p.days || {}).forEach(function (k) { if (/^\d{4}-\d\d-\d\d$/.test(k)) { var x = wk(k); w[x] = (w[x] || 0) + 1; } });
    for (var k in w) if (w[k] >= 3) met++;
    return { daysThisWeek: w[wk(K.dayKey(K.now()))] || 0, goalDays: 3, ofDays: 7, weeksMet: met };
  }
  function pctS(x) { return x == null ? '—' : Math.round(x * 100) + '%'; }
  function progressText(p, opt) {
    var o = progressSummary(p, opt), L = [];
    L.push('Progress summary: ' + o.player + (o.age != null ? ' (age ' + o.age + ')' : '') + ' — ' + o.exported.slice(0, 10));
    L.push('Time played: ' + o.timePlayedMin + ' min · Stars: ' + o.stars);
    if (o.weeklyGoal) L.push('Weekly goal: ' + o.weeklyGoal.daysThisWeek + ' of ' + o.weeklyGoal.goalDays + ' play days this week (goal met in ' + o.weeklyGoal.weeksMet + ' weeks so far)');
    var subj = null;
    o.skills.filter(function (s) { return s.answers || s.status !== 'Not started'; }).forEach(function (s) {
      if (s.subject !== subj) { subj = s.subject; L.push(''); L.push('== ' + ({ math: 'Math', reading: 'Reading & Words', concepts: 'Early Concepts' }[subj] || subj) + ' =='); }
      L.push('• ' + s.name + ': ' + s.status + ' (level ' + s.level + ' of ' + s.levels + ')');
      L.push('    accuracy ' + pctS(s.accuracy) + ' over ' + s.answers + ' answers · ' + s.itemsSeen + ' items seen · last practiced ' + (s.lastPracticed || '—') + ' · next review ' + (s.nextReview || '—') + (s.placement ? ' · placement check ' + s.placement : ''));
      if (s.mostMissed.length) L.push('    most missed: ' + s.mostMissed.map(function (m) { return m.item + ' (×' + m.missed + ')'; }).join(', '));
      if (s.errors.length) L.push('    mistakes we spotted: ' + s.errors.map(function (e) { return e.label + ' ×' + e.count; }).join('; '));
    });
    if (L[L.length - 1] && /Weekly goal|Time played/.test(L[L.length - 1])) L.push('', 'No skills practiced yet.');
    return L.join('\n');
  }

  K.v2 = true; K.TARGET = TARGET; K.BAND = BAND; K.migrate = migrate; K.theta = theta; K.prob = prob; K.target = target; K.pickItem = pickItem; K.expected = expected;
  K.ERRORS = ERRORS; K.HINTS = HINTS; K.offByOneHint = offByOneHint; K.tag = tag; K.diagnose = diagnose; K.errorCounts = errorCounts; K.evalFact = evalFact;
  K.PLACE_N = PLACE_N; K.PLACE_CHAIN = PLACE_CHAIN; K.wantsPlacement = wantsPlacement; K.placementResult = placementResult;
  K.progressSummary = progressSummary; K.progressText = progressText;
})(typeof window !== 'undefined' ? window.Arcade : global.Arcade);
