/* Blob Arcade — Mochi Munch story mode: "Blob Island" journey data, scoring and high scores (no DOM here).
   The island has one themed area per math skill (in curriculum order) and two stops per area (skill level 1, level 2),
   so a full journey visits every level. Two paths keep it fair for different ages:
     Big Steps    — each stop plays its own level (level 1 then level 2).
     Little Steps — both stops in an area play the easier level, with fewer snacks; the timer pace is relaxed by age as usual.
   Adapts: after two tries that don't pass, a stop becomes a "helper" stop (fewer snacks, more time).
   Score per stop: 100 per snack + up to 200 for accuracy + time bonus (5 per second left, max 300; 100 flat with the timer off) + 150 if perfect.
   A journey's score adds up as you pass each new stop; the best journey per kid feeds the family high-score board. */
(function (A) {
  'use strict';
  var AREAS = [
    { id: 'meadow', skill: 'count10', name: 'Counting Meadow', emoji: '🌼', friend: 'poppy', bg: '#bff0b0', x: 12, y: 74,
      beat: "Hi, I'm Poppy! The star-snacks landed in my flowers. Let's count and find them!" },
    { id: 'cliffs', skill: 'compare', name: 'Compare Cliffs', emoji: '⛰️', friend: 'clem', bg: '#e8d6c0', x: 24, y: 50,
      beat: 'Clem here! Up on the cliffs, big and small numbers are hiding. Which one is bigger?' },
    { id: 'beach', skill: 'add10', name: 'Adding Beach', emoji: '🏖️', friend: 'dewdrop', bg: '#ffe9a8', x: 18, y: 24,
      beat: "Splash! I'm Dewdrop. The waves washed snacks onto the sand. Let's add them up!" },
    { id: 'woods', skill: 'sub10', name: 'Take-Away Woods', emoji: '🌲', friend: 'pickle', bg: '#a8dca0', x: 38, y: 14,
      beat: "Hee hee! I'm Pickle. The squirrels nibbled some snacks. Take away and see what's left!" },
    { id: 'grove', skill: 'make10', name: 'Ten Tree Grove', emoji: '🌳', friend: 'nova', bg: '#c9f0c0', x: 52, y: 34,
      beat: "I'm Nova. The ten tree only opens for numbers that make ten together!" },
    { id: 'town', skill: 'teen', name: 'Teen Town', emoji: '🏘️', friend: 'clem', bg: '#ffd9c7', x: 48, y: 62,
      beat: 'Welcome to Teen Town! Every number here is ten and some more.' },
    { id: 'caves', skill: 'missing', name: 'Mystery Caves', emoji: '🕳️', friend: 'dewdrop', bg: '#d6cdea', x: 64, y: 80,
      beat: 'Ooh, spooky caves! A number is missing. Can you find the hidden one?' },
    { id: 'bay', skill: 'add20', name: 'Big Sum Bay', emoji: '⛵', friend: 'poppy', bg: '#b8e2ff', x: 80, y: 66,
      beat: 'The boats in the bay carry lots of snacks. Time for bigger adding!' },
    { id: 'volcano', skill: 'sub20', name: 'Volcano Valley', emoji: '🌋', friend: 'pickle', bg: '#ffc9b0', x: 76, y: 38,
      beat: 'Hot, hot, hot! Take away big numbers to cool down the sleepy volcano.' },
    { id: 'lighthouse', skill: 'evenodd', name: 'Even-Odd Lighthouse', emoji: '🗼', friend: 'nova', bg: '#e3dcff', x: 88, y: 14,
      beat: 'The lighthouse blinks even, odd, even, odd. This is the last area!' }
  ];
  var PROLOGUE = 'Oh no! A big wind blew the star-snacks all over Blob Island. Help Mochi find them before the Blob Festival tonight!';
  var FINALE = 'You found every star-snack! The Blob Festival can begin. Hooray for you!';
  var STOPS = [];
  AREAS.forEach(function (a, ai) { [0, 1].forEach(function (lv) { STOPS.push({ i: STOPS.length, area: a, ai: ai, lv: lv, n: STOPS.length + 1 }); }); });
  // Plug-in point: add an area (one skill, two stops) before games/munch/map.js loads, e.g. for a new subject skill.
  // area: { id, skill (a skill id registered with A.Curriculum), name, emoji, friend (blob id), bg, x, y (0–100 map position), beat }
  // The map lays out stops along the trail in AREAS order; give the area voice lines area_<id> and beat_<id> for the built-in voice.
  // Side areas ({side: true, stops: [skill ids]}) are a little trip off the main trail: one stop per skill, open from the start
  // (each stop opens when the one before it is passed), not part of the journey score. Add them after every main area, so
  // saved progress (stops are saved by index) never moves.
  function addArea(area) {
    var ai = AREAS.length; AREAS.push(area);
    if (area.side) (area.stops || [area.skill]).forEach(function (sk, k) { STOPS.push({ i: STOPS.length, area: area, ai: ai, lv: k, k: k, n: k + 1, skill: sk, side: true }); });
    else [0, 1].forEach(function (lv) { STOPS.push({ i: STOPS.length, area: area, ai: ai, lv: lv, n: STOPS.length + 1 }); });
    return area;
  }
  function mainCount() { var n = 0; STOPS.forEach(function (s) { if (!s.side) n++; }); return n; }
  function isSide(i) { return !!(STOPS[i] && STOPS[i].side); }
  function passedAny(p, i) { var s = data(p); return ['big', 'little'].some(function (pa) { var r = s.stops[pa + ':' + i]; return r && r.passed; }); }
  // can this stop be played now? main trail: up to the first unpassed stop; side trip: its first stop, then each one after a pass
  function playable(p, i) {
    var st = STOPS[i]; if (!st) return false;
    if (!st.side) return i <= unlockedTo(p);
    return st.k === 0 || passedAny(p, i - 1) || passedAny(p, i);
  }
  var PATHS = { little: { id: 'little', name: 'Little Steps', emoji: '🐣' }, big: { id: 'big', name: 'Big Steps', emoji: '🚀' } };

  function data(p) { var s = p.story; if (!s.stops) s.stops = {}; if (!s.seen) s.seen = {}; if (!s.challenges) s.challenges = {}; return s; }

  /* ---------- friend challenges: beat an area's challenge level under a target time to unlock a new blob ----------
     The challenge opens once both stops of its area are passed (on either path). Win = munch every snack before the clock
     runs out with at most 1 oops. Target time is tuned per skill (≈60% of the normal per-snack time) and scaled like the
     normal timer: Little Steps uses the easier level + fewer snacks, and the timer pace (Relaxed for age 5 and under) applies. */
  var CH = [
    { area: 'cliffs', blob: 'clem', hi: "Hey hey! I'm Clem! Ready, set, go! Let's run and munch together!" },
    { area: 'beach', blob: 'dewdrop', hi: "Hi! I'm Dewdrop! Ooh, why is the sea so splashy? Let's find out together!" },
    { area: 'woods', blob: 'pickle', hi: "Hee hee! I'm Pickle! Knock knock! Who's there? Me, your new friend!" },
    { area: 'grove', blob: 'nova', hi: "Hello, I'm Nova. I love the stars, and now I have a new friend. Twinkle twinkle!" }
  ];
  var CH_PER = { count10: [9, 10], compare: [10, 11], add10: [11, 12], sub10: [12, 13], make10: [12, 13], teen: [10, 11], missing: [13, 14], add20: [13, 14], sub20: [14, 15], evenodd: [9, 10] };
  var PACE = { relaxed: 1.4, normal: 1, speedy: 0.75 };
  function paceOf(p) { var x = p.timerPace; if (!x || x === 'auto') x = p.age != null && p.age <= 5 ? 'relaxed' : 'normal'; return x; }
  CH.forEach(function (c) { c.ai = AREAS.findIndex(function (a) { return a.id === c.area; }); c.a = AREAS[c.ai]; });
  function chFor(blob) { return CH.filter(function (c) { return c.blob === blob; })[0] || null; }
  function chConfig(p, k) {
    var c = CH[k], little = path(p) === 'little', lv = little ? 0 : 1, nOk = little ? 5 : 7, sid = c.a.skill;
    var secs = (8 + CH_PER[sid][lv] * .6 * nOk) * PACE[paceOf(p)] * (p.age != null && p.age <= 4 ? 1.15 : 1);
    return { k: k, ch: c, skill: sid, level: lv, nOk: nOk, target: Math.max(25, Math.round(secs / 5) * 5), maxWrong: 1 };
  }
  function chOpen(p, k) { var c = CH[k], s = data(p); return [c.ai * 2, c.ai * 2 + 1].every(function (i) { return ['big', 'little'].some(function (pa) { var r = s.stops[pa + ':' + i]; return r && r.passed; }); }); }
  function chHint(p, blob) { var c = chFor(blob); if (!c) return ''; var cfg = chConfig(p, CH.indexOf(c)); return 'Beat the ' + c.a.name + ' challenge in under ' + cfg.target + ' seconds!'; }
  // record a challenge try; returns {won, firstWin, secs, newBest}
  function chRecord(p, k, r) {
    var c = CH[k], s = data(p), x = s.challenges[c.area] || (s.challenges[c.area] = { tries: 0, wins: 0, best: 0 }), cfg = chConfig(p, k);
    x.tries++; var won = !!(r.finished && r.wrong <= cfg.maxWrong && r.secs <= cfg.target), out = { won: won, secs: r.secs, target: cfg.target };
    if (won) { x.wins++; if (!x.best || r.secs < x.best) { out.newBest = !!x.best; x.best = Math.round(r.secs * 10) / 10; }
      var b = p.unlocks.blobs || (p.unlocks.blobs = {}); if (!b[c.blob]) { b[c.blob] = Date.now(); out.firstWin = true; } }
    return out;
  }
  function unlockAll(p) { var b = p.unlocks.blobs || (p.unlocks.blobs = {}); A.Blobs.CAST.forEach(function (c) { if (!b[c.id]) b[c.id] = Date.now(); }); }
  function defaultPath(p) { return p.age != null && p.age <= 5 ? 'little' : 'big'; }
  function path(p) { var s = data(p); return s.path || defaultPath(p); }
  function setPath(p, id) { var s = data(p); if (s.path === id) return; s.path = id; s.run = null; }   // a new path starts a new journey
  function stopInfo(p, i) { return data(p).stops[path(p) + ':' + i] || null; }
  function unlockedTo(p) { // highest playable stop index on the current path
    var s = data(p), n = 0, M = mainCount(); for (var i = 0; i < M; i++) { var r = s.stops[path(p) + ':' + i]; if (r && r.passed) n = i + 1; else break; }
    return Math.min(n, M - 1);
  }
  function run(p) { var s = data(p); if (!s.run || s.run.path !== path(p)) s.run = { path: path(p), stop: 0, score: 0, started: Date.now(), done: false }; return s.run; }
  function newRun(p) { var s = data(p); s.run = null; s.runs = (s.runs || 0) + 1; return run(p); }
  // what a stop plays: skill, level, number of snacks, extra time
  function config(p, i) {
    var st = STOPS[i], little = path(p) === 'little', info = stopInfo(p, i) || {}, helper = (info.fails || 0) >= 2 && !info.passed;
    if (st.side) return { skill: st.skill, level: little ? 0 : 1, nOk: little ? 5 : 7, helper: helper, side: true, timeX: (helper ? 1.3 : 1) * (little ? 1.1 : 1) };
    return { skill: st.area.skill, level: little ? 0 : st.lv, nOk: little ? 5 : 6 + st.lv, helper: helper, timeX: (helper ? 1.3 : 1) * (little ? 1.1 : 1) };
  }
  function scoreFor(r) { // r: {correct, wrong, finished, secsLeft, timerOn}
    var att = r.correct + r.wrong, acc = att ? r.correct / att : 0;
    var pts = { snacks: 100 * r.correct, accuracy: Math.round(200 * acc * (r.finished ? 1 : r.frac || 0)), time: 0, perfect: r.finished && r.wrong === 0 ? 150 : 0 };
    if (r.finished) pts.time = r.timerOn ? Math.min(300, Math.round(r.secsLeft) * 5) : 100;
    pts.total = pts.snacks + pts.accuracy + pts.time + pts.perfect;
    return pts;
  }
  // record a played stop; returns {pts, passed, runAdded, newBestStop, newBestRun, finale, firstPass}
  function record(p, i, r) {
    var s = data(p), key = path(p) + ':' + i, info = s.stops[key] || (s.stops[key] = { best: 0, stars: 0, passed: false, fails: 0, plays: 0 });
    var pts = scoreFor(r), passed = !!(r.finished || (r.frac >= .75 && !r.gaveUp)), out = { pts: pts, passed: passed };
    info.plays++; out.firstPass = passed && !info.passed;
    if (passed) { info.passed = true; info.fails = 0; } else info.fails = (info.fails || 0) + 1;
    if (pts.total > info.best) { out.newBestStop = info.best > 0; info.best = pts.total; }
    info.stars = Math.max(info.stars || 0, r.stars || 0);
    var R = run(p), st = STOPS[i];
    if (st.side) { if (passed && STOPS[i + 1] && STOPS[i + 1].side && STOPS[i + 1].ai === st.ai) out.sideNext = i + 1; if (passed && (!STOPS[i + 1] || STOPS[i + 1].ai !== st.ai)) out.sideDone = true; return out; }
    if (passed && !R.done && R.stop === i) {
      R.score += pts.total; R.stop++; out.runAdded = pts.total;
      if (R.stop >= mainCount()) { R.done = true; s.finished = (s.finished || 0) + 1; out.finale = true; }
      if (R.score > (s.bestRun || 0)) { out.newBestRun = (s.bestRun || 0) > 0; s.bestRun = R.score; s.bestRunAt = Date.now(); s.bestRunStops = R.stop; s.bestRunPath = R.path; }
    }
    return out;
  }
  // family board: each player's best journey (all profiles on this device)
  function board(profiles) {
    return profiles.map(function (p) { var s = data(p); return { p: p, score: s.bestRun || 0, stops: s.bestRunStops || 0, path: s.bestRunPath || path(p), finished: s.finished || 0 }; })
      .sort(function (a, b) { return b.score - a.score || b.stops - a.stops || a.p.name.localeCompare(b.p.name); });
  }
  A.Story = { addArea: addArea, mainCount: mainCount, isSide: isSide, playable: playable, AREAS: AREAS, STOPS: STOPS, PATHS: PATHS, PROLOGUE: PROLOGUE, FINALE: FINALE, data: data, path: path, defaultPath: defaultPath, setPath: setPath,
    CH: CH, chFor: chFor, chConfig: chConfig, chOpen: chOpen, chHint: chHint, chRecord: chRecord, unlockAll: unlockAll,
    stopInfo: stopInfo, unlockedTo: unlockedTo, run: run, newRun: newRun, config: config, scoreFor: scoreFor, record: record, board: board };
})(window.Arcade);
