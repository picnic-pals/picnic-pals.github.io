/* Picnic Pals — learning correctness (quality1, 2026-10-30, parent-approved Step 1 of _review/quality1/PLAN.md).
   One shared layer, loaded after topics.js (all other curriculum wrappers are in place by then). General rules by band and
   placement only: no kid names, no kid-specific branches.
   · GRADE TAGS: every skill / step / Bubble kind / Stand step / topic step / bonus bank / Slugger question kind has a numeric
     grade level `gl` (0 toddler, 1 Pre-K, 2 K, 3 1st, 4 2nd, 5 3rd; halves = in between). Skills also get s.gl and s.gradeTag.
   · BAND FLOOR per subject (floor(p, subj)): the lowest grade level that is still "in band" for this child.
       base  = the grown-up's grade setting for the subject (one grade of slack) or else the age band (2-3: 0, 4-5: 1, 6-7: 2, 8+: 3)
       shown = the highest grade level the child has SHOWN in that subject (earned in play, or placed by a played warm-up / check;
               never by age alone); floor = max(base, ceil(shown) - 1)
       never above the grade level of the child's own current skill (her current work is never "below band").
     'other' (topics, Stand orders, bonus trivia, Slugger) = max(base, the lower of the math and reading floors, rounded down).
   · Every place that serves questions asks this layer: free-play rounds (pickRound), review and checks, topic rounds, Story stops,
     Bubble Pop kinds, Lemonade Stand steps, bonus questions and Slugger's base-running questions. Easy items come back only as
     review of things actually missed (the missed-fact queue / coach items), never as filler, mix or placement checks.
   · Placement v2 (reading and other non-step ladders): a ~5-item binary-search warm-up that can jump bands; strength in one
     subject raises the first probe point in another by one band (it never places it). Math keeps its strided step warm-up.
   · Hooks kept for later (PLAN B / C5): GL accepts new ids (B1 2nd-grade math, B3 reading tiers, B4 preschool path) and every
     floor/ceiling rule reads GL, so new ladders only need tags. Nothing here touches music. */
(function (A) {
  'use strict';
  var C = A.Curriculum, K = A.Coach, S = A.Steps, Q = A.Questions;
  if (!C || !K || !S || !Q) return;
  var DAY = 864e5;
  function now() { return K.now ? K.now() : Date.now(); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* ---------- 1. grade tags (Common Core / i-Ready unit order; see _review/quality1/BUILD-NOTES.md) ---------- */
  var GL = {
    // math (steps; wrapped old skills keep one tag)
    t_count3: 0, t_count5: 0, count10: 1, pk_count10: 1, pk_compare: 1, pk_more1: 1, pk_less1: 1, pk_make5: 1,
    pk_count20: 2, pk_numid20: 2, pk_next20: 2, pk_before20: 2, pk_count30: 2, pk_next30: 2, pk_more1_30: 2,
    add10: 2.5, sub10: 2.5, make10: 2, teen: 2, missing: 3, wordprob: 3, evenodd: 4, compare: 2, add20: 3, sub20: 3,
    a_dbl: 3, a_ndbl: 3, a_ten: 3, s_teen1: 3, s_teen10: 3, s_10: 3, a_9: 3, a_8: 3, s_noX: 3, a_mk10: 3, s_split: 3, s_think: 3, a_mix: 3, s_mix: 3,
    pv_tens: 3, pv_compare: 3, pv_ten_more: 3,   // 1st-grade place value (1.NBT.2, 1.NBT.3, 1.NBT.5): the minimal B2 test-out
    // reading
    letters: 1, begsound: 2, rhymes: 2, sight: 2, cvc: 2.5, digraph: 3, sight2: 3, opposites: 2.5, nounverb: 3, longvowel: [3, 4], sight3: [4, 5],
    homophones: 4.5, affixes: 4.5, comprehension: [3, 3.5],
    // early concepts
    colors: 1, shapes: [1, 1.5],
    // topic steps (T = 0, P = 1 unless listed; E by content)
    an_e1: 3, an_e2: 3, an_e3: 3, an_e4: 3, cs_e1: 2.5, cs_e2: 2, cs_e3: 3, cs_e4: 2, sw_e1: 3, sw_e2: 3, sw_e3: 3,
    lt_p3: 1, lt_p4: 2, lt_e1: 3, lt_e2: 4, lt_e3: 3, lt_e4: 3,   // quality1: lt_e1 / lt_e2 are now ABC order by the 2nd / 3rd letter
    // Bubble Pop kinds ([per sub-level])
    t_pop: 0, t_color: 0, t_peek: 0, t_shape: 0, t_animal: 0, t_size: 0, t_count3: 0, t_count5: 0,
    p_shape: 1, p_color: 1, p_animal: 1, p_letter: 1, p_num: [1, 2], p_begin: 2, p_bigger: 2, p_order: [1, 2], p_combo: 1,
    e_sight: [2, 2.5, 3], e_numword: [2, 3, 3], e_add: [2.5, 3, 3], e_evenodd: [4, 4, 4], e_rhyme: [2, 2, 2.5], e_missing: [2.5, 3, 3], e_make10: [2, 3, 3],
    e_skip: [3, 3, 4.5], e_spell: [2.5, 3, 3], e_tens: [3, 3, 3], e_sight3: [4, 5], e_homo: [4.5], e_prefix: [4.5, 4.5],
    // Lemonade Stand
    o_match: 0, o_color: 0, o_count: [1, 2], o_counton: 2, o_sort: 1, o_read: 3, o_two: 2, o_three: 3, o_long: 3, o_sort2: 3, o_double: 3, o_memory: 3,
    m_count5: 1, m_count10: 2, m_add: 2.5, m_enough: 3, m_three: 3, m_change: 4,
    // Slugger base-running / scoreboard questions
    bb_where: 3, bb_runs: 1, bb_onbase: 1, bb_left: 2, bb_count: 1, bb_tied: 2.5, bb_towin: 3, bb_totie: 3,
    // bonus trivia banks (d = grade level)
    bonus_d1: 1, bonus_d2: 2, bonus_d3: 3, bonus_d4: 4
  };
  var SUBJ_OF_KIND = { // Bubble kinds / Stand steps -> the subject whose floor applies
    p_num: 'math', p_bigger: 'math', p_order: 'math', e_numword: 'math', e_add: 'math', e_evenodd: 'math', e_make10: 'math', e_skip: 'math', e_tens: 'math',
    p_letter: 'reading', p_begin: 'reading', e_sight: 'reading', e_rhyme: 'reading', e_missing: 'reading', e_spell: 'reading', e_sight3: 'reading', e_homo: 'reading', e_prefix: 'reading',
    m_count5: 'math', m_count10: 'math', m_add: 'math', m_enough: 'math', m_three: 'math', m_change: 'math',
    bb_where: 'math', bb_runs: 'math', bb_onbase: 'math', bb_left: 'math', bb_count: 'math', bb_tied: 'math', bb_towin: 'math', bb_totie: 'math'
  };
  var GRADE_NAME = ['Toddler', 'Pre-K', 'K', '1st', '2nd', '3rd', '4th', '5th'];
  function gl(id, sub) {
    var v = GL[id];
    if (v == null) { if (/^(a|s)_/.test(id)) v = 3; else if (/_t\d$/.test(id)) v = 0; else if (/_p\d$/.test(id)) v = 1; else if (/_e\d$/.test(id)) v = 3; else return null; }
    if (Array.isArray(v)) v = v[Math.max(0, Math.min(sub || 0, v.length - 1))];
    return v;
  }
  function glTop(id) { var v = GL[id]; return Array.isArray(v) ? Math.max.apply(null, v) : gl(id, 0); }
  function glLevels(id) { var v = GL[id]; return Array.isArray(v) ? v.length : 1; }
  function gradeTag(v) { if (v == null) return ''; return v % 1 ? GRADE_NAME[Math.floor(v)] + '–' + GRADE_NAME[Math.ceil(v)] : GRADE_NAME[v]; }
  function tagSkills() { (C.SKILLS || C.ACTIVE || []).concat(C.ACTIVE || []).forEach(function (s) { if (!s || s.gl != null) return; var v = GL[s.id]; if (v == null) v = gl(s.id, 0); if (v == null) return; s.gl = v; s.gradeTag = Array.isArray(v) ? v.map(gradeTag).join(' / ') : gradeTag(v); }); }
  tagSkills();
  // a skill's grade level at a level (non-step skills have one tag per level; steps one tag)
  function glAt(s, level) { if (typeof s === 'string') s = C.byId[s]; if (!s) return null; return s.isStep && !s.wrapOld ? gl(s.id, 0) : gl(s.id, level || 0); }

  /* ---------- 2. band floors ---------- */
  var AGE_FLOOR = { toddler: 0, pre: 0, pk: 1, k: 1, g1: 2, g2: 2, g3: 3, none: 1 };
  var GRADE_GL = { pk: 1, k: 2, '1': 3, '2': 4, '3': 5, '4': 6, '5': 7 };
  function ageFloor(p) { var b = A.Age && A.Age.band ? A.Age.band(p) : 'none'; return AGE_FLOOR[b] != null ? AGE_FLOOR[b] : 1; }
  function baseFloor(p, subj) { var g = p && p.levels && p.levels[subj]; if (g && GRADE_GL[g] != null) return Math.max(0, GRADE_GL[g] - 1); return ageFloor(p); }
  // placed by something the child actually answered (warm-up / check / probe), or an old save's played position; never age alone
  function shownState(st) { return !!(st && st.status === 'mastered' && (!st.placed || /warmup|probe|check|compare|migrate/.test(st.placedBy || ''))); }
  function shown(p, subj) {
    var m = -1; if (!p || !p.skills) return m;
    C.list(subj).forEach(function (s) { var st = p.skills[s.id]; if (shownState(st)) { var v = glTop(s.id); if (v != null && v > m) m = v; } });
    return m;
  }
  function curGl(p, subj) {
    try { var s = C.current(p, subj); if (!s) return null; var st = p.skills[s.id]; return glAt(s, st ? st.level : 0); } catch (e) { return null; }
  }
  function floor(p, subj) {
    if (!p) return 0;
    if (!subj || subj === 'other' || /^tp_/.test(subj)) return otherFloor(p);
    if (subj === 'concepts') return baseFloor(p, 'concepts');
    if (!C.list(subj).length) return baseFloor(p, subj);
    var f = baseFloor(p, subj), sh = shown(p, subj), gset = p.levels && GRADE_GL[p.levels[subj]] != null;
    // a grade a grown-up picked on the grown-up page is the floor (their pick wins over what she showed in play)
    if (sh >= 0 && !gset) f = Math.max(f, Math.ceil(sh) - 1);
    // her current skill normally sets no higher floor than itself (a grown-up's pick, a slip-back). quality1: but when she has
    // already shown more AND open in-band skills exist (e.g. comprehension sitting after affixes in the list), the current skill
    // does not drag the floor down; the band lock then moves her to an in-band skill.
    var cg = curGl(p, subj);
    if (cg != null && cg < f) {
      var cl = ceil(p, subj), alt = sh >= 0 && C.list(subj).some(function (k) { var st = p.skills && p.skills[k.id], v = glTop(k.id), v0 = glAt(k, 0); return v != null && v >= f && (v0 == null || v0 <= cl) && st && st.status !== 'locked'; });
      if (!alt) f = cg;
    }
    return f;
  }
  function otherFloor(p) {
    var b = ageFloor(p), fm = floor(p, 'math'), off = p.levels && p.levels.reading === 'off', fr = off || !C.list('reading').length ? fm : floor(p, 'reading');
    return Math.max(b, Math.floor(Math.min(fm, fr)));
  }
  // ceiling: 2-3 never past Pre-K-ish (1.5), 4-5 never past the K / 1st-grade line (2.5) unless a grown-up set the subject to 1st
  // grade or up, or a 5-year-old EARNED (in play) the top skill under that line; 6+ no ceiling
  function ceil(p, subj) {
    if (!p) return 9; var b = S.band(p); if (b === 'E') return 9;
    var sj = !subj || subj === 'other' || /^tp_/.test(subj) ? 'math' : subj, g = p.levels && p.levels[sj];
    if (g && GRADE_GL[g] >= 3) return 9;
    if (b === 'T') return 1.5;
    var a = A.Age.of(p); if (a != null && a >= 5 && sj !== 'concepts' && C.list(sj).length) {
      var under = C.list(sj).filter(function (k) { var v = glAt(k, 0); return v != null && v <= 2.5; }), last = under[under.length - 1], st = last && p.skills && p.skills[last.id];
      if (st && st.status === 'mastered' && !st.placed) return 9; }
    return 2.5;
  }
  function subjOfKind(id) { return SUBJ_OF_KIND[id] || 'other'; }
  function kindOk(p, id, sub) { var v = gl(id, sub); return v == null || (v >= floor(p, subjOfKind(id)) && v <= ceil(p, subjOfKind(id))); }

  /* ---------- 3. A2: Early Concepts leaves the mix once the child is past it ---------- */
  function conceptsLive(p) {
    var L = C.list('concepts'); if (!L.length || !p) return false;
    var top = Math.max.apply(null, L.map(function (s) { return glTop(s.id); }));
    if (baseFloor(p, 'concepts') > top) return false;
    return !L.every(function (s) { var st = p.skills && p.skills[s.id]; return st && st.status === 'mastered'; });
  }
  function mixBase(p, base) { if (base && base.concepts && !conceptsLive(p)) base.concepts = 0; return base; }
  // placement marks colors / shapes as placed (by band) for a child past them: the grown-up page shows "Placed (skipped)"
  function placeConcepts(p) {
    if (!p || !p.skills || conceptsLive(p) || (p.levels && p.levels.concepts && p.levels.concepts !== 'auto')) return;
    C.list('concepts').forEach(function (s) { var st = p.skills[s.id]; if (st && st.status !== 'mastered' && !st.attempts) { st.status = 'mastered'; st.placed = true; st.placedBy = 'band'; st.introduced = true; st.level = s.levels.length - 1; } });
  }

  /* ---------- 4. A3: review = real misses only ---------- */
  function played(st) { return !!(st && (st.hist || []).some(function (h) { return !h.r; })); }   // a non-review round in play
  function realMisses(p, sid) {
    var st = p.skills && p.skills[sid]; if (!st) return false;
    if ((st.attempts || 0) > (st.correct || 0)) return true;
    try { var m = K.mostMissed(p, sid, 1); return !!(m && m.length); } catch (e) { return false; }
  }
  function reviewOk(p, s) {
    if (typeof s === 'string') s = C.byId[s]; if (!s) return false;
    var st = p.skills[s.id], f = floor(p, C.subjectOf(s)), top = glTop(s.id);
    if (top == null || top >= f) return played(st) || (st && st.placed && /warmup|probe|check/.test(st.placedBy || '')) || realMisses(p, s.id);
    return played(st) && realMisses(p, s.id);   // below the floor: only a skill that was really played AND really missed
  }
  // a failed review never reopens the skill on one slip: only 2 reviews in a row under 70% do
  function softSlip(p, sid, acc) {
    var st = p.skills && p.skills[sid]; if (!st) return false;
    if (acc >= .7) { st.revLow = 0; return true; }
    // a skill only PLACED by a warm-up (never earned in play) that she mostly misses on its check (under half): the placement
    // guessed too high, so it reopens as the short 2-round review (not a restart). One slip on an earned skill never does.
    if (st.placed && /warmup|probe|check/.test(st.placedBy || '') && acc < .5) { st.revLow = 0; return false; }
    st.revLow = (st.revLow || 0) + 1;
    if (st.revLow >= 2) { st.revLow = 0; return false; }
    st.revAt = now() + 2 * DAY; return true;
  }

  /* ---------- 5. rounds: every free-play round stays in band ---------- */
  function lowestLevelInBand(s, f) { var n = s.isStep && !s.wrapOld ? 1 : Math.max(1, (s.levels || []).length); for (var l = 0; l < n; l++) { var v = glAt(s, l); if (v == null || v >= f) return l; } return n - 1; }
  function currentRound(p, subj) {
    var cur = C.current(p, subj); if (!cur) return null; var st = C.state(p, cur.id), top = Math.max(0, (cur.levels || [1]).length - 1);
    var lv = cur.isStep ? 0 : Math.max(0, Math.min(st.level || 0, top));
    return { skill: cur, level: lv, review: false, inBand: true };
  }
  function inBandTopic(p, subj) {
    var L = S.LADDERS[subj]; if (!L) return null; var f = floor(p, 'other'), BN = { T: 0, P: 1, E: 2 }, kb = BN[S.band(p)];
    var ok = L.ids.filter(function (id) { var st = S.STEPS[id]; return BN[st.band] <= kb && (gl(id, 0) == null || gl(id, 0) >= f); });
    if (!ok.length) return null;
    var T = C.track(p, subj), i = ok.indexOf(T.current); return C.byId[ok[i >= 0 ? i : 0]] || null;
  }
  function otherSubject(p, not) {
    var w = C.mixWeights(p), ks = Object.keys(w).filter(function (k) { return k !== not && w[k] > 0 && C.list(k).length && !(k === 'concepts' && !conceptsLive(p)); });
    if (!ks.length) return 'math';
    ks.sort(function (a, b) { return w[b] - w[a]; }); return ks[0];
  }
  var basePick = C.pickRound;
  C.pickRound = function (p, opt) {
    var r = basePick(p, opt); if (!r || !r.skill || r.placement || r.testOut) return r;
    // parent rule 2: a player already past 1st-grade place value gets a short test-out first (never sent back without one)
    if (opt && opt.placement && pvWants(p) && C.subjectOf(r.skill) === 'math' && !r.story) return { skill: C.byId.pv_tens, level: 0, review: false, placement: true, pvCheck: true, nQ: PV_PLAN.length };
    return fixRound(p, r, opt, 0);
  };
  function fixRound(p, r, opt, depth) {
    var s = r.skill, subj = C.subjectOf(s), why = null;
    if (depth > 3) return r;
    if (subj === 'concepts' && !conceptsLive(p) && !(p.mix && p.mix === 'concepts')) {
      var alt = basePick(p, Object.assign({}, opt || {}, { subject: otherSubject(p, 'concepts'), noRotate: true, placement: false }));
      return alt && alt.skill ? fixRound(p, alt, opt, depth + 1) : r;
    }
    if (r.topic || s.topic) {
      var f0 = floor(p, 'other'), v0 = gl(s.id, 0);
      if (v0 != null && v0 < f0) {
        var t2 = inBandTopic(p, subj);
        if (t2) { C.track(p, subj).current = t2.id; var st2 = C.state(p, t2.id); if (st2.status === 'locked') st2.status = 'open'; st2.introduced = true; r.skill = t2; r.level = 0; r.bandFixed = 'topic'; return r; }
        var m2 = basePick(p, Object.assign({}, opt || {}, { subject: 'math', noRotate: true, placement: false })); if (m2 && m2.skill) { m2.bandFixed = 'topic-out'; return fixRound(p, m2, opt, depth + 1); }
      }
      return r;
    }
    var f = floor(p, subj);
    // the current skill itself fell under her floor (she showed more since it opened, e.g. a reading warm-up): move on to the
    // next in-band skill, or let the in-band top skills take turns. Never a below-floor skill as her "current" round.
    if (!r.review && !r.check && !r.dropBack && !s.isStep && !(p.math && p.math.pin) && C.track(p, subj).current === s.id && glTop(s.id) != null && glTop(s.id) < f) {
      var Lc = C.list(subj), Tc = C.track(p, subj), nx = null;
      for (var j = Lc.indexOf(s) + 1; j < Lc.length; j++) { var sj = p.skills[Lc[j].id], vj = glTop(Lc[j].id), v0j = glAt(Lc[j], 0); if ((vj == null || vj >= f) && (v0j == null || v0j <= ceil(p, subj)) && (!sj || sj.status !== 'mastered')) { nx = Lc[j]; break; } }
      var tl = topList(p, subj); if (!nx && tl.length) nx = tl[Math.floor(Math.random() * tl.length)];
      if (nx && nx !== s) { var ns = C.state(p, nx.id); if (ns.status === 'locked') ns.status = 'open'; Tc.current = nx.id; var cr0 = currentRound(p, subj); if (cr0) { cr0.bandFixed = 'current'; return cr0; } }
    }
    if (r.dropBack) {
      if (glAt(s, 0) != null && glAt(s, 0) < f && C.byId[r.from]) return { skill: C.byId[r.from], level: 0, review: false, eased: true, nOk: 4, bandFixed: 'dropBack' };
      return r;
    }
    if (r.review || r.check) {
      if (!reviewOk(p, s)) { why = 'review'; if (r.check) { var cs = C.state(p, s.id); cs.checkAt = null; } }
      else { var lvR = lowestLevelInBand(s, f); if (!s.isStep && (r.level || 0) < lvR) r.level = lvR; return r; }
    }
    if (!why && r.eased) { var ve = glAt(s, r.level); if (ve != null && ve < f) { r.level = Math.min((s.levels || [1]).length - 1, r.level + 1); r.eased = false; } }
    if (!why) return r;
    var cr = currentRound(p, subj); if (!cr) return r; cr.bandFixed = why; if (r.rotated) cr.rotated = true; return cr;
  }

  /* finish: a step-down / plateau never lands below the floor (the child stays on her step, at its first level) */
  var baseFinish = C.finishRound;
  C.finishRound = function (p, round, res) {
    var s = round && round.skill; if (!s || !p || !p.skills) return baseFinish(p, round, res);
    var subj = C.subjectOf(s), T = C.track(p, subj), f = floor(p, subj), cur0 = T.current, ret0 = T.returnTo, snap = {};
    var prev = cur0 ? C.prevSkill(cur0) : null;
    [cur0, prev && prev.id, s.id].forEach(function (id) { if (id && p.skills[id]) snap[id] = JSON.stringify(p.skills[id]); });
    var out = baseFinish(p, round, res), cur1 = T.current;
    if (cur1 && cur1 !== cur0 && C.byId[cur1] && !s.topic) {
      var v = glAt(C.byId[cur1], (p.skills[cur1] || {}).level || 0), ev = out && out.events || {};
      var down = ev.stepDown || ev.detour || ev.reopened || ev.plateau;
      if (v != null && v < f && down) {
        Object.keys(snap).forEach(function (id) { p.skills[id] = JSON.parse(snap[id]); });
        T.current = cur0; T.returnTo = ret0; T.dropBack = null;
        if (ev) { delete ev.stepDown; delete ev.detour; delete ev.reopened; delete ev.plateau; ev.bandHeld = true; }
      }
    }
    // advanced onto a skill below the floor (e.g. comprehension after affixes for a 2nd-3rd grade reader) or above the band's
    // ceiling: skip a below-floor skill (placed by band, never counted as shown) / hold at the ceiling
    var cur2 = T.current, c2 = cur2 && C.byId[cur2];
    if (c2 && !s.topic && cur2 !== cur0 && !(p.math && p.math.pin)) {
      var ev2 = out && out.events || {}, v2 = glAt(c2, (p.skills[cur2] || {}).level || 0), cl = ceil(p, subj), L2 = C.list(subj);
      if (v2 != null && v2 > cl && !c2.isStep) { T.current = cur0; if (p.skills[cur0] && p.skills[cur0].status === 'mastered') topRotate(p, C.byId[cur0], out, true); ev2.ceiling = true; delete ev2.newSkill; }
      else if (v2 != null && glTop(cur2) < floor(p, subj) && !(ev2.stepDown || ev2.detour || ev2.reopened || ev2.plateau || ev2.back)) {
        var k = L2.indexOf(c2), nxt = null;
        for (var j = k; j < L2.length; j++) { var sj = p.skills[L2[j].id], v0x = glAt(L2[j], 0);
          if ((v0x != null && v0x > cl && !L2[j].isStep) || (L2[j].isStep && S.bandTop && S.bandTop(p) && j > L2.indexOf(C.byId[S.bandTop(p)]))) break;   // never past the ceiling / the step band top
          if (glTop(L2[j].id) < floor(p, subj)) { if (sj && sj.status !== 'mastered' && !sj.attempts) { sj.status = 'mastered'; sj.placed = true; sj.placedBy = 'band'; } continue; } if (!sj || sj.status !== 'mastered') { nxt = L2[j]; break; } }
        if (nxt) { var ns = C.state(p, nxt.id); if (ns.status === 'locked') ns.status = 'open'; T.current = nxt.id; }
        else { T.current = cur0; topRotate(p, C.byId[cur0], out, true); }
        delete ev2.newSkill; ev2.bandSkip = cur2;
      }
    }
    // at the very top of a subject (nothing left to open): the in-band top skills take turns (never one skill all month)
    topRotate(p, s, out);
    return out;
  };
  function topList(p, subj) { var L = C.list(subj), f = floor(p, subj), cl = ceil(p, subj); return L.filter(function (k) { var v = glTop(k.id), v0 = glAt(k, 0); return (v == null || v >= f) && (v0 == null || v0 <= cl) && (p.skills[k.id] || {}).status !== 'locked'; }).slice(-4); }
  function topRotate(p, s, out, force) {
    if (!s || s.topic || s.isStep || (p.math && p.math.pin)) return;   // step ladders rotate their own top (steps-math.js advance)
    var subj = C.subjectOf(s), T = C.track(p, subj), L = C.list(subj); if (!L.length || subj === 'concepts') return;
    if (T.current !== s.id) return;
    var st = p.skills[s.id]; if (!st || st.status !== 'mastered') return;
    var cl = ceil(p, subj), after = L.slice(L.indexOf(s) + 1).filter(function (k) { var v0 = glAt(k, 0); return (p.skills[k.id] || {}).status !== 'mastered' && (v0 == null || v0 <= cl) && glTop(k.id) >= floor(p, subj); });
    if (after.length && !force) return;
    var top = topList(p, subj);
    if (top.length < 2) return;
    var i = top.indexOf(s); T.current = top[(i + 1) % top.length].id; if (out && out.events) out.events.ladderTop = true;
  }

  /* ---------- 6. A7: the preschool band top + pictures beside every number ---------- */
  // band P (4-5) stops at teen numbers unless a grown-up set math to 1st grade or up, or a 5-year-old earned teen numbers in play
  function pTopOpen(p) { var g = p && p.levels && p.levels.math; if (g && GRADE_GL[g] >= 3) return true; var a = A.Age.of(p), st = p && p.skills && p.skills.teen; return a != null && a >= 5 && !!(st && st.status === 'mastered' && !st.placed); }
  S.bandTop = function (p) { var b = S.band(p); if (b === 'T') return 'pk_count20'; if (b === 'P' && !pTopOpen(p)) return 'teen'; return null; };
  function pBand(p) { return !!p && (S.band(p) === 'P' || S.band(p) === 'T'); }
  var tf = S.tf;
  function dotsFor(n) { n = Math.max(0, Math.min(40, n | 0)); var h = '<span class="pb-frames">', full = Math.floor(n / 10), rest = n % 10; for (var i = 0; i < full; i++) h += tf({ on: 10 }); if (rest || !full) h += tf({ on: rest }); return h + '</span>'; }
  function eqPic(label) {
    var m = String(label).match(/^\s*(\d+)\s*([+−-])\s*(\d+)\s*$/); if (!m) return null; var a = +m[1], b = +m[3];
    if (m[2] === '+') return '<span class="pbpic"><b>' + a + ' + ' + b + '</b><span class="pb-row">' + (a <= 10 ? tf({ on: a }) : dotsFor(a)) + '<i class="pb-op">+</i>' + (b <= 10 ? tf({ on: b, b: 0 }).replace(/class="on"/g, 'class="on b"') : dotsFor(b)) + '</span></span>';
    return '<span class="pbpic"><b>' + a + ' − ' + b + '</b><span class="pb-row">' + (a <= 10 ? tf({ on: a, x: b }) : dotsFor(a)) + '</span></span>';
  }
  function numPic(label) { var m = String(label).match(/^\s*(\d+)\s*$/); if (!m || +m[1] > 40) return null; return '<span class="pbpic num"><b>' + m[1] + '</b>' + dotsFor(+m[1]) + '</span>'; }
  function picturizeCell(c) { if (!c || c.html) return c; var h = eqPic(c.label) || numPic(c.label); if (h) { c.html = h; c.long = c.long || /pb-row/.test(h); c.pictured = true; } return c; }
  function textPic(text) { var m = String(text).replace(/<[^>]+>/g, ' ').match(/(\d+)/g); if (!m || /pb-frames|st-pic|frame/.test(text)) return text; var n = +m[m.length - 1]; if (n > 30) return text; return text + '<span class="st-pic pb-target">' + dotsFor(n) + '</span>'; }
  function picturizeGen(s) {
    if (!s || s.__pb || !s.gen) return; var g0 = s.gen; s.__pb = true;
    s.gen = function (L) {
      var r = g0.apply(this, arguments), p = S.ctx.p; if (!r || !pBand(p)) return r;
      var gd = r.good, bd = r.bad; if (gd) r.good = function () { return picturizeCell(gd.apply(this, arguments)); }; if (bd) r.bad = function () { return picturizeCell(bd.apply(this, arguments)); };
      if (/\d/.test(String(r.text).replace(/<[^>]+>/g, ''))) r.text = textPic(r.text); r.pictures = true; return r;
    };
  }
  function picturizeAsk(q) {
    if (!q || !q.choices) return q;
    // all or nothing: when one numeral choice is too big to draw (a reversed-digit distractor like 91 on "Find 19"), no choice gets
    // dots, so a bare one never stands out (numeral naming is the skill there; the ask keeps its picture)
    var pics = q.choices.map(function (c) { return c.html ? null : eqPic(c.label) || numPic(c.label); });
    var allNum = q.choices.every(function (c, i) { return c.html || pics[i] || !/^\s*\d/.test(String(c.label)); });
    if (allNum) q.choices.forEach(function (c, i) { if (pics[i]) c.html = pics[i]; });
    var plain = String(q.text || '').replace(/<[^>]+>/g, ' ');
    if (!q.pic && /\d/.test(plain)) { var nums = (plain.match(/\d+/g) || []).map(Number).filter(function (n) { return n <= 30; }); if (nums.length) q.pic = '<span class="pb-qpic">' + nums.map(dotsFor).join('<i class="pb-op">' + (/−|-/.test(plain) ? '−' : /\+/.test(plain) ? '+' : '·') + '</i>') + '</span>'; }
    q.pictures = true; return q;
  }
  C.list('math').forEach(picturizeGen);
  var baseMake = Q.make;
  Q.make = function (skill, level, opt) {
    var q = baseMake(skill, level, opt), s = typeof skill === 'string' ? C.byId[skill] : skill, p = S.ctx.p;
    if (s && C.subjectOf(s) === 'math' && pBand(p)) picturizeAsk(q);
    if (q && !q.text) q.text = q.plain || '';
    return q;
  };

  /* ---------- 7. A1: Story stops follow the child ---------- */
  function storyPick(p, subj, i, little, boss) {
    var f = floor(p, subj), cur = C.current(p, subj); if (!cur) return null;
    if (glTop(cur.id) != null && glTop(cur.id) < f && !cur.isStep) { var tl0 = topList(p, subj); if (tl0.length) cur = tl0[(i || 0) % tl0.length]; }   // her current fell under the floor: an in-band top skill
    var cst = C.state(p, cur.id), top = Math.max(0, (cur.levels || [1]).length - 1), clv = cur.isStep ? 0 : Math.min(cst.level || 0, top);
    var cands = [{ skill: cur.id, level: clv }];
    if (!little && !boss) {
      var nx = C.nextSkill(cur.id), ns = nx && p.skills[nx.id]; if (nx && ns && ns.status !== 'locked' && ns.status !== 'mastered') cands.push({ skill: nx.id, level: 0, stretch: true });
      C.list(subj).forEach(function (s) { var st = p.skills[s.id]; if (s.id !== cur.id && st && st.status === 'mastered' && !st.placed && glTop(s.id) >= f) cands.push({ skill: s.id, level: lowestLevelInBand(s, f), earned: true }); });
    }
    var cl = ceil(p, subj); cands = cands.filter(function (x, k) { var v = glAt(x.skill, x.level); return k === 0 || v == null || v <= cl; });
    var c = cands[(i || 0) % cands.length]; var v = glAt(c.skill, c.level); if (v != null && v < f) c = cands[0];
    return c;
  }
  if (A.Story && A.Story.config) {
    var baseConfig = A.Story.config, ST = A.Story;
    ST.config = function (p, i) {
      var c = baseConfig(p, i), st = ST.STOPS[i]; if (!c || !p || !st) return c;
      var sk = C.byId[c.skill]; if (!sk) return c;
      var subj = C.subjectOf(sk), little = ST.path ? ST.path(p) === 'little' : false;
      if (st.side && !st.area.trail && !st.area.boss) {   // side places (Letter Lagoon, Word Woods): a subject slot
        var slot = subj; if (slot === 'concepts' && !conceptsLive(p)) slot = C.list('reading').length && !(p.levels && p.levels.reading === 'off') ? 'reading' : 'math';
        if (slot === 'reading' && p.levels && p.levels.reading === 'off') slot = conceptsLive(p) ? 'concepts' : 'math';
        var boss = A.Story2 && A.Story2.isBoss ? A.Story2.isBoss(i) : false, pk = storyPick(p, slot, i, little, boss);
        if (pk) { c.skill = pk.skill; c.level = pk.level; c.slot = slot; c.capped = false; }
      } else if (subj === 'math' || subj === 'reading') {
        var f = floor(p, subj), v = glAt(sk, c.level);
        if (v != null && v < f) { var pk2 = storyPick(p, subj, i, true, false); if (pk2) { c.skill = pk2.skill; c.level = pk2.level; c.lifted = true; } }
      }
      return c;
    };
  }

  /* ---------- 8. A5: placement v2 for non-step ladders (reading): ~5 picks, binary search, can jump bands ---------- */
  var PROBE_MAX = 5;
  function ldata(p) { var l = p.learn || (p.learn = { v: 1, probe: {} }); l.probe = l.probe || {}; return l; }
  function usesProbe(p, s) {
    if (!p || !s || s.isStep || s.topic) return false; var subj = C.subjectOf(s);
    if (subj === 'concepts' || C.list(subj).length < 4 || (A.toddler && A.toddler(p))) return false;
    if (ldata(p).probe[subj]) return false;
    var st = p.skills && p.skills[s.id]; if (!st || st.status === 'mastered' || st.attempts) return false;
    // a warm-up already done or turned off for this skill (placeDone set, offer cleared: an earlier check, a grown-up's pick) is
    // never offered again (quality1 polish: the probe used to ignore it and re-run on every board)
    if (st.placeDone && st.placeOffer === false) return false;
    if (C.track(p, subj).current !== s.id) return false;
    var L = C.list(subj); return L.indexOf(s) < L.length - 1;
  }
  // how far ahead the child is in the OTHER core subject (in grade levels over her age band's floor)
  function aheadElsewhere(p, subj) { var o = subj === 'math' ? 'reading' : 'math'; if (!C.list(o).length) return 0; var sh = shown(p, o); return sh < 0 ? 0 : sh - (ageFloor(p) + 1); }
  function probePlan(p, sid) {
    var s = C.byId[sid], subj = C.subjectOf(s), cl = ceil(p, subj), L0 = C.list(subj), i0 = L0.indexOf(s);
    // quality1 polish: the probe never asks a skill above her ceiling, even one that sits between in-band skills in the list
    // (digraphs and 1st-grade sight words sit before opposites); those are neither asked nor placed
    var L = L0.filter(function (k, i) { var v0 = glAt(k, 0); return i <= i0 || v0 == null || v0 <= cl; }), from = L.indexOf(s), hi = L.length - 1;
    while (hi > from && glAt(L[hi], 0) > cl) hi--;
    var norm = ageFloor(p) + 1 + (aheadElsewhere(p, subj) >= 1 ? 1 : 0);   // the age band's own grade, one band higher when strong elsewhere
    var first = from; for (var k = from; k <= hi; k++) { first = k; if (glAt(L[k], 0) >= norm) break; }
    return { subj: subj, ids: L.map(function (x) { return x.id; }), from: from, lo: from, hi: hi, mid: Math.max(from, Math.min(hi, first)), asked: 0, right: -1, log: [], done: false, boost: aheadElsewhere(p, subj) >= 1 };
  }
  function probeNext(pr) { if (pr.done || pr.asked >= PROBE_MAX || pr.lo > pr.hi) return null; var s = C.byId[pr.ids[pr.mid]]; return { skill: s, level: Math.max(0, (s.levels || [1]).length - 1) }; }
  function probeAnswer(pr, ok) {
    pr.asked++; pr.log.push({ id: pr.ids[pr.mid], ok: !!ok });
    if (ok) { pr.right = Math.max(pr.right, pr.mid); pr.lo = pr.mid + 1; } else pr.hi = pr.mid - 1;
    if (pr.lo > pr.hi || pr.asked >= PROBE_MAX) pr.done = true; else pr.mid = Math.floor((pr.lo + pr.hi) / 2);
  }
  function probeFinish(p, pr) {
    var T = C.track(p, pr.subj), out = { placed: [], start: null }, t = now();
    // every skill up to the highest right pick is placed — unless a miss sits at or below it (then only up to that miss)
    var lowMiss = pr.log.filter(function (x) { return !x.ok; }).map(function (x) { return pr.ids.indexOf(x.id); }).reduce(function (a, b) { return Math.min(a, b); }, Infinity);
    var upto = Math.min(pr.right, lowMiss - 1);
    for (var i = pr.from; i <= upto; i++) { var id = pr.ids[i], st = C.state(p, id), sk = C.byId[id];
      if (st.status !== 'mastered') { st.status = 'mastered'; st.placed = true; st.placedBy = 'probe'; st.introduced = true; st.level = Math.max(0, sk.levels.length - 1); st.placeDone = true; st.placeOffer = false; out.placed.push(id); } }
    var start = Math.min(pr.ids.length - 1, upto + 1), sid = pr.ids[Math.max(pr.from, start)];
    // quality1 polish: all right up to her ceiling (pr.hi) never starts her on the skill above it (a 4-year-old who knew every
    // K skill started on 1st-grade digraphs); she starts on the top in-band skill instead
    if (upto >= pr.ids.length - 1 || glTop(sid) < floor(p, pr.subj) || pr.ids.indexOf(sid) > pr.hi) { var tl = topList(p, pr.subj); sid = tl.length ? tl[tl.length - 1].id : pr.ids[Math.min(pr.hi, pr.ids.length - 1)]; }
    var s2 = C.state(p, sid); if (s2.status === 'locked') s2.status = 'open'; s2.placeOffer = false; s2.placeDone = true; s2.introduced = s2.introduced || out.placed.length > 0;
    if (!(p.math && p.math.pin)) { T.current = sid; T.returnTo = null; }
    C.list(pr.subj).forEach(function (k) { var st = p.skills[k.id]; if (st) { st.placeOffer = false; st.placeStart = false; } });
    ldata(p).probe[pr.subj] = { at: t, asked: pr.asked, placed: out.placed.length, start: sid, boost: !!pr.boost };
    out.start = sid; return out;
  }
  // one uniform API for the warm-up card (UI.warmup) and the sim: next() -> {skill, level} | null, answer(ok), finish()
  /* place-value test-out (old saves past it): up to 5 picks across the 3 steps, stops at the first miss.
     Right ones are placed ('check'); the first missed step becomes her current math step (she climbs back up from there). */
  var PV = ['pv_tens', 'pv_compare', 'pv_ten_more'], PV_PLAN = ['pv_tens', 'pv_compare', 'pv_ten_more', 'pv_compare', 'pv_ten_more'];
  function pvPast(p) {
    if (!C.byId.pv_tens || !p || !p.skills) return false; var L = C.list('math'), cur = p.math && p.math.current, ci = L.indexOf(C.byId[cur]), pi = L.indexOf(C.byId.pv_ten_more);
    var allM = L.every(function (s) { var st = p.skills[s.id]; return !st || st.status === 'mastered' || PV.indexOf(s.id) >= 0; });
    return (ci > pi || allM) && PV.some(function (id) { var st = p.skills[id]; return !st || st.status !== 'mastered'; });
  }
  function pvWants(p) { var l = ldata(p); return l.pvOffer === 1 && !(A.Store && A.Store.settings && A.Store.settings.placement === false) && !(A.toddler && A.toddler(p)); }
  function pvApi(p) {
    var k = 0, stop = false, miss = null, asked = 0;
    return { n: PV_PLAN.length, pv: true,
      next: function () { if (stop || k >= PV_PLAN.length) return null; return { skill: C.byId[PV_PLAN[k]], level: 0 }; },
      answer: function (ok) { asked++; if (!ok) { stop = true; miss = PV_PLAN[k]; } k++; },
      finish: function () {
        var out = { placed: [], start: null, asked: asked }, mi = miss ? PV.indexOf(miss) : PV.length, T = C.track(p, 'math');
        for (var i = 0; i < mi; i++) { var st = C.state(p, PV[i]); if (st.status !== 'mastered') { st.status = 'mastered'; st.placed = true; st.placedBy = 'check'; st.introduced = true; st.placeDone = true; st.placeOffer = false; out.placed.push(PV[i]); } }
        if (miss && !(p.math && p.math.pin)) { var ms = C.state(p, miss); ms.status = 'open'; ms.placed = false; ms.introduced = true; ms.placeDone = true; ms.placeOffer = false; T.current = miss; T.returnTo = null; out.start = miss; }
        var l = ldata(p); l.pvOffer = 2; l.pvAt = now(); l.pvResult = miss ? 'learn:' + miss : 'passed';
        return out; } };
  }
  function placementApi(p, skill) {
    if (skill && skill.id === 'pv_tens' && pvWants(p)) return pvApi(p);
    if (skill && skill.isStep) { var pr0 = S.probePlan(p, skill.id); return { n: pr0.plan.length, next: function () { var s = S.probeNext(pr0); return s ? { skill: s, level: 0 } : null; }, answer: function (ok) { S.probeAnswer(pr0, ok); }, finish: function () { var o = S.probeFinish(p, pr0); return { placed: o.placed, start: o.start, asked: pr0.asked }; } }; }
    if (usesProbe(p, skill)) { var pr = probePlan(p, skill.id); return { n: PROBE_MAX, v2: true, next: function () { return probeNext(pr); }, answer: function (ok) { probeAnswer(pr, ok); }, finish: function () { var o = probeFinish(p, pr); return { placed: o.placed, start: o.start, asked: pr.asked }; } }; }
    return null;
  }
  var baseWants = K.wantsPlacement;
  K.wantsPlacement = function (p, sid) { var s = C.byId[sid]; if (s && usesProbe(p, s)) return !(A.Store && A.Store.settings && A.Store.settings.placement === false); return baseWants(p, sid); };

  /* ---------- 9. A3 review entry points + A4 Bubble / Stand + A10 bonus + A8 Slugger ---------- */
  // Bubble Pop / Lemonade Stand: a kind or step is in band for this child (its own sub-level)
  function bubbleSub(p, id) { var n = glLevels(id), f = floor(p, subjOfKind(id)); for (var s = 0; s < n; s++) if (gl(id, s) >= f) return s; return -1; }   // first in-band sub-level, -1 = none
  // Slugger: the base-running / scoreboard question kinds this child can get (never below her math floor; pre-readers count dots)
  function sluggerKinds(p) {
    var pre = A.Age.preReader(p), f = floor(p, 'math'), all = pre ? ['bb_runs', 'bb_onbase', 'bb_count'] : ['bb_where', 'bb_runs', 'bb_left', 'bb_towin', 'bb_tied', 'bb_totie'];
    var ok = all.filter(function (k) { return gl(k, 0) >= f; }); return ok.length ? ok : pre ? all : ['bb_where', 'bb_towin', 'bb_totie'];
  }
  function bonusMinD(p) { if (A.Age.preReader(p)) return 1; var f = floor(p, 'other'); return f >= 3 ? 3 : f >= 2 ? 2 : 1; }

  /* ---------- 10. old saves: one idempotent, additive migration (nothing is ever removed) ---------- */
  var baseEnsure = C.ensure;
  C.ensure = function (p) {
    var r = baseEnsure(p); if (!p || !p.skills) return r;
    if (!p.learn || !p.learn.v) {
      var l = ldata(p);
      // an existing player whose reading track already moved (old 5-question checks) keeps it; the v2 warm-up runs once for her
      // only if she never had a reading check and has not moved past the first reading skills (it can only move her up)
      l.v = 1; l.at = now();
    }
    placeConcepts(p);
    var l2 = ldata(p); if (!l2.pvv) { l2.pvv = 1; if (pvPast(p)) l2.pvOffer = 1; }   // once per save: offer the place-value test-out
    return r;
  };

  /* ---------- 11. content patches (quality1): topics-data.js is generated, so fixes are applied here, in place, at load ---------- */
  var Q1_LINES = [
    ['q1_bp_tens1', 'Pop the number with', 'Bubble Pop tens and ones: + number, then "tens and"'], ['q1_bp_tens2', 'tens and', '+ number, then "ones."'], ['q1_bp_tens3', 'ones.'],
    ['q1_bp_more10', 'Pop the number that is 10 more than', '+ number'], ['q1_bp_less10', 'Pop the number that is 10 less than', '+ number'],
    ['q1_bp_cloze', 'Pop the word that fits.', 'Followed by the sentence'],
    ['q1_ls_costs', 'It costs', '+ number + "dollars"'], ['q1_ls_paid', 'They paid', '+ number + "dollars"'], ['q1_ls_change', 'How much change do they get back?'],
    ['q1_tq_abc', 'Which word comes first in ABC order?'], ['q1_tq_thunder', 'Thunder is the sound made by...'], ['tw_east', 'east', 'topic answer word'],
    ['q1_howto', 'How to play', 'Title of the how-to card'],
    ['q1_howto_munch', 'Read the question at the top. Walk your friend to a right answer and munch it!', 'How-to card: Picnic Munch'],
    ['q1_howto_bubble', 'Listen, or read the card at the top. Pop the bubbles that match!', 'How-to card: Bubble Pop'],
    ['q1_howto_stand', 'Listen to the order, or read the ticket. Tap what they ask for, then tap the big button!', 'How-to card: Lemonade Stand'],
    ['q1_howto_tiny', 'Listen for what to find. Tap the picture. Every tap is OK!', 'How-to card: Tiny Picnic'],
    ['q1_howto_story', 'Walk the path with your friends. Play each stop to find the missing star-snacks!', 'How-to card: Story'],
    ['q1_pv_count', 'How many in all? Count the tens, then the ones.'], ['q1_pv_tensones1', 'What number has', '+ number + "tens and"'], ['q1_pv_tensones2', 'tens and', '+ number + "ones?"'], ['q1_pv_tensones3', 'ones?'],
    ['q1_pv_greater', 'Which number is greater?'], ['q1_pv_sign', 'Which sign goes between', '+ number + "and" + number'], ['q1_pv_and', 'and'],
    ['q1_pv_gt', 'is greater than', 'between two numbers'], ['q1_pv_lt', 'is less than', 'between two numbers'], ['q1_pv_eq', 'is equal to', 'between two numbers'],
    ['q1_pv_10more', 'What is 10 more than', '+ number'], ['q1_pv_10less', 'What is 10 less than', '+ number'],
    ['q1_pv_check', 'Quick check! Tens and ones.', 'Place-value test-out card for players already past it']
  ];
  function patchTopics() {
    var D = A.TopicsData || []; function step(id) { var r = null; D.forEach(function (t) { t.steps.forEach(function (s) { if (s.id === id) r = s; }); }); return r; }
    function w(x, e) { return { w: x, e: e || null, raw: x }; }
    function abc(list, fact) { return list.map(function (r) { return { q: 'Which word comes first in ABC order?', ans: w(r[0]), wrong: [w(r[1]), w(r[2])], qe: '🔤', fact: fact, say: 'q1_tq_abc' }; }); }
    var s1 = step('lt_e1'), s2 = step('lt_e2'), w2 = step('sw_e2'), w3 = step('sw_e3');
    // lt_e1: ABC order by the FIRST letter (1st grade); lt_e2: by the SECOND letter (2nd grade, same first letter). Was: letter after / before (K).
    if (s1) { s1.name = 'ABC order'; s1.items.splice.apply(s1.items, [0, s1.items.length].concat(abc([['ant', 'dog', 'sun'], ['bed', 'map', 'top'], ['cup', 'fish', 'rug'], ['egg', 'hat', 'pig'], ['frog', 'lamp', 'van'],
      ['goat', 'kite', 'web'], ['jam', 'nest', 'yak'], ['leaf', 'owl', 'tree'], ['milk', 'rain', 'zoo'], ['boat', 'goat', 'ship']], 'Look at the first letter. The letter closest to A comes first.'))); }
    if (s2) { s2.name = 'ABC order by the 2nd letter'; s2.items.splice.apply(s2.items, [0, s2.items.length].concat(abc([['bag', 'bed', 'bug'], ['cat', 'cot', 'cup'], ['dig', 'dog', 'duck'], ['fan', 'fig', 'fox'], ['hat', 'hen', 'hop'],
      ['map', 'men', 'mop'], ['pan', 'pen', 'pig'], ['sad', 'sock', 'sun'], ['tag', 'ten', 'top'], ['wag', 'web', 'win']], 'They all start with the same letter, so look at the 2nd letter.'))); }
    // sw_e2: "Which comes first in a storm?" had two defensible answers; sw_e3: no joke choice ("up to the moon")
    if (w2) w2.items.forEach(function (it, i) { if (/comes first in a storm/i.test(it.q)) w2.items[i] = { q: 'Thunder is the sound made by...', ans: w('lightning', '⚡'), wrong: [w('wind', '🌬️'), w('rain', '🌧️')], qe: '⛈️',
      fact: 'Lightning heats the air so fast that it makes a big boom. That boom is thunder.', say: 'q1_tq_thunder' }; });
    if (w3) w3.items.forEach(function (it) { it.wrong.forEach(function (x, k) { if (/up to the moon/i.test(x.w)) it.wrong[k] = { w: 'east', e: null, raw: 'east', say: 'tw_east' }; }); });
  }
  patchTopics();
  if (A.VoiceLines && A.VoiceLines.add) A.VoiceLines.add('quality1', 'Quality pass 1 (new questions and asks)', 'later', 'Read by the device voice until recorded (quality1). Calm, clear, like a teacher reading a question.', Q1_LINES);

  A.Learn = { GL: GL, gl: gl, glTop: glTop, glAt: glAt, gradeTag: gradeTag, GRADE_NAME: GRADE_NAME, subjOfKind: subjOfKind, tag: function (id, v) { GL[id] = v; tagSkills(); },
    ageFloor: ageFloor, baseFloor: baseFloor, ceil: ceil, topList: topList, shown: shown, floor: floor, otherFloor: otherFloor, kindOk: kindOk, bubbleSub: bubbleSub,
    conceptsLive: conceptsLive, mixBase: mixBase, reviewOk: reviewOk, softSlip: softSlip, realMisses: realMisses, fixRound: fixRound,
    pBand: pBand, picturizeCell: picturizeCell, picturizeAsk: picturizeAsk, eqPic: eqPic, numPic: numPic, dotsFor: dotsFor, pTopOpen: pTopOpen,
    storyPick: storyPick, usesProbe: usesProbe, probePlan: probePlan, probeNext: probeNext, probeAnswer: probeAnswer, probeFinish: probeFinish, placementApi: placementApi, PROBE_MAX: PROBE_MAX, pvPast: pvPast, pvWants: pvWants, PV: PV,
    sluggerKinds: sluggerKinds, bonusMinD: bonusMinD, tagSkills: tagSkills };
})(window.Arcade);
