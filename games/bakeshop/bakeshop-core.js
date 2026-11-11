/* Bake Shop Clock: pure time/order rules. rng injection supports reproducible orders; no storage or DOM here. */
(function (A) {
  'use strict';

  var TREATS = [
    { id: 'cookie', name: 'cookie', plural: 'cookies' },
    { id: 'muffin', name: 'muffin', plural: 'muffins' },
    { id: 'cupcake', name: 'cupcake', plural: 'cupcakes' },
    { id: 'pie', name: 'pie', plural: 'pies' },
    { id: 'bread', name: 'loaf', plural: 'loaves of bread', tray: 'bread' },
    { id: 'pretzel', name: 'pretzel', plural: 'pretzels' },
    { id: 'roll', name: 'cinnamon roll', plural: 'cinnamon rolls' },
    { id: 'scone', name: 'scone', plural: 'scones' },
    { id: 'brownie', name: 'brownie', plural: 'brownies' },
    { id: 'tart', name: 'tart', plural: 'tarts' },
    { id: 'donut', name: 'donut', plural: 'donuts' },
    { id: 'bun', name: 'bun', plural: 'buns' }
  ];
  var TREAT_BY = {};
  TREATS.forEach(function (t) { TREAT_BY[t.id] = t; });

  var DECOS = [
    { id: 'cake_stand', name: 'cake stand' },
    { id: 'flower_pot', name: 'flower pot' },
    { id: 'cookie_jar', name: 'cookie jar' },
    { id: 'string_lights', name: 'string lights' },
    { id: 'chalkboard', name: 'chalkboard' },
    { id: 'window_pie', name: 'pie in the window' },
    { id: 'plant', name: 'plant' },
    { id: 'bunting', name: 'bunting' },
    { id: 'shelf_clock', name: 'shelf clock' },
    { id: 'mixing_bowl', name: 'mixing bowl' }
  ];

  var EASY_HOURS = [12, 3, 6, 9];
  var ALL_HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  function nameHash(s) {
    var h = 2166136261, i;
    s = String(s || '').toLowerCase();
    for (i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  /* FNV-1a 32-bit hashes of blocked first names. The names themselves are not stored. */
  var BLOCKED_NAME_HASH = { 3427945586: 1, 2064598676: 1, 3177907039: 1, 3852794181: 1, 884288956: 1 };
  function hasBlockedName(text) {
    var words = String(text || '').match(/[A-Za-z]+/g) || [], i;
    for (i = 0; i < words.length; i++) if (BLOCKED_NAME_HASH[nameHash(words[i])]) return true;
    return false;
  }
  function scrubBlockedNames(text) {
    return String(text || '').replace(/[A-Za-z]+/g, function (w) {
      return BLOCKED_NAME_HASH[nameHash(w)] ? 'a friend' : w;
    });
  }

  function rngOf(rng) { return typeof rng === 'function' ? rng : Math.random; }
  function num(rng, lo, hi) { return lo + Math.floor(rngOf(rng)() * (hi - lo + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rngOf(rng)() * arr.length)]; }
  function shuffle(rng, arr) {
    var a = arr.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(rngOf(rng)() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function rank(id) {
    return id === 'toddler' ? 0 : id === 'pre' ? 1 : id === 'k' ? 2 : id === 'g1' ? 3 : 4;
  }
  function bandFor(p) {
    var age = A.Age && A.Age.band ? A.Age.band(p) : 'none';
    var tod = (A.Age && A.Age.toddler ? A.Age.toddler(p) : age === 'toddler') || (A.toddler && A.toddler(p));
    var id;
    if (tod) id = 'toddler';
    else if (age === 'pre' || age === 'pk') id = 'pre';
    else if (age === 'k' || age === 'none') id = 'k';
    else if (age === 'g1') id = 'g1';
    else id = 'g2';
    var explicit = p && p.levels && p.levels.math;
    var floor = A.Learn && A.Learn.floor ? A.Learn.floor(p, 'math') : 0;
    if (explicit && explicit !== 'auto') {
      var up = +explicit >= 1 ? 'g1' : 'pre';
      if (rank(up) > rank(id)) id = up;
    }
    if (floor >= 3 && rank('g1') > rank(id)) id = 'g1';
    return {
      id: id,
      toddler: id === 'toddler',
      oclock: id === 'pre' || id === 'k',
      easy: id === 'pre',
      dragSet: id === 'g1' || id === 'g2',
      g1: id === 'g1',
      g2: id === 'g2'
    };
  }

  function toMin(t) {
    var h = t.h === 12 ? 0 : t.h;
    return h * 60 + (t.m || 0);
  }
  function fromMin(n) {
    n = ((n % 720) + 720) % 720;
    var h = Math.floor(n / 60);
    if (h === 0) h = 12;
    return { h: h, m: n % 60 };
  }
  function addMin(t, d) { return fromMin(toMin(t) + d); }
  function sameTime(a, b) { return a && b && a.h === b.h && a.m === b.m; }
  function snapTime(t, grain) {
    grain = grain || 5;
    return fromMin(Math.round(toMin(t) / grain) * grain);
  }
  function hourAngle(t) { return 0.5 * toMin(t); }
  function minuteAngle(t) { return 6 * (t.m || 0); }
  function timeFromHourAngle(deg, grain) {
    deg = ((deg % 360) + 360) % 360;
    return snapTime(fromMin(Math.round(deg / 0.5)), grain || 5);
  }
  function timeFromMinuteAngle(cur, deg, grain) {
    deg = ((deg % 360) + 360) % 360;
    grain = grain || 5;
    cur = cur || { h: 12, m: 0 };
    var prevM = cur.m || 0;
    var prevDeg = 6 * prevM;
    var dAng = deg - prevDeg;
    if (dAng > 180) dAng -= 360;
    if (dAng < -180) dAng += 360;
    var next = fromMin(toMin(cur) + dAng / 6);
    return snapTime(next, grain);
  }

  function formatDigital(t) {
    var m = t.m || 0;
    return t.h + ':' + (m < 10 ? '0' : '') + m;
  }
  var MIN_WORDS = { 5: 'five', 10: 'ten', 20: 'twenty', 25: 'twenty-five' };
  function minWord(n) { return MIN_WORDS[n] || String(n); }
  function formatTime(t) {
    var m = t.m || 0;
    var h = t.h;
    var nextH = h === 12 ? 1 : h + 1;
    if (m === 0) return h + " o'clock";
    if (m === 15) return 'quarter past ' + h;
    if (m === 30) return 'half past ' + h;
    if (m === 45) return 'quarter to ' + nextH;
    if (m < 30) return minWord(m) + ' past ' + h;
    return minWord(60 - m) + ' to ' + nextH;
  }

  function grainFor(band, tier, wantElapsed) {
    if (wantElapsed) return band.g2 && tier >= 2 ? 5 : (band.g1 && tier >= 3 ? 5 : 15);
    if (band.toddler) return 60;
    /* Age 5 (k) unlocks half-hour after mastering o'clock. Age 4 (pre/easy) stays o'clock only. */
    if (band.oclock) return (!band.easy && tier >= 3) ? 30 : 60;
    if (band.g1) {
      if (tier <= 0) return 30;
      if (tier === 1) return 15;
      return 5;
    }
    if (tier <= 0) return 15;
    return 5;
  }
  function useElapsed(band, tier, i, boss, fiveMinSets) {
    if (!band.dragSet) return false;
    /* Elapsed is gated on having actually done 5-minute *sets*. g2 unlocks sooner (1 set) than g1 (2 sets). */
    var seen = fiveMinSets || 0;
    if (seen < (band.g2 ? 1 : 2)) return false;
    if (band.g2) return tier >= 2 || (tier >= 1 && (boss || i >= 3));
    return tier >= 3 || (tier >= 2 && (boss || i >= 4));
  }

  function randomTime(rng, grain, hours) {
    var h = pick(rng, hours || ALL_HOURS);
    var steps = 60 / grain;
    var m = num(rng, 0, steps - 1) * grain;
    if (m === 60) m = 0;
    return { h: h, m: m };
  }
  function distractors(rng, target, n, grain, hours) {
    var out = [], seen = {}, key = target.h + ':' + target.m;
    seen[key] = true;
    var guard = 0;
    while (out.length < n && guard < 40) {
      guard++;
      var t = randomTime(rng, grain, hours);
      var k = t.h + ':' + t.m;
      if (seen[k]) continue;
      seen[k] = true;
      out.push(t);
    }
    return out;
  }

  function friendsOf(p) {
    var list = (A.Friends && A.Friends.of ? A.Friends.of(p) : null) || [];
    if (!list.length) {
      var u = (p && p.unlocks && p.unlocks.blobs) || {};
      list = Object.keys(u);
    }
    if (!list.length) list = ['strawberry', 'apple', 'corn', 'blueberry'];
    return list;
  }
  function treatOf(rng, recent) {
    var pool = TREATS.map(function (t) { return t.id; }).filter(function (id) { return !recent || recent.indexOf('t:' + id) < 0; });
    if (!pool.length) pool = TREATS.map(function (t) { return t.id; });
    return TREAT_BY[pick(rng, pool)];
  }

  var ELAPSED_FORMS = [
    function (treat, n, when) { return treat.plural.charAt(0).toUpperCase() + treat.plural.slice(1) + ' bake ' + n + ' minutes and go in at ' + when + '. When are they done?'; },
    function (treat, n, when) { return 'The ' + treat.plural + ' go in at ' + when + ' and bake for ' + n + ' minutes. What time do they come out?'; },
    function (treat, n, when) { return 'A tray of ' + (treat.tray || treat.plural) + ' needs ' + n + ' minutes. We start at ' + when + '. When should we take them out?'; }
  ];

  function elapsedPrompt(rng, treat, bake, start) {
    var form = pick(rng, ELAPSED_FORMS);
    return form(treat, bake, formatTime(start));
  }

  function makeOrder(p, opt) {
    opt = opt || {};
    var band = opt.band || bandFor(p);
    var rng = opt.rng || Math.random;
    var boss = !!opt.boss;
    var streak = opt.streak || 0;
    var tier = opt.tier == null ? 0 : opt.tier;
    var i = opt.i || 1;
    var recent = opt.recent || [];
    var friend = opt.friend || pick(rng, friendsOf(p));
    var treat = treatOf(rng, recent);
    var elapsed = useElapsed(band, tier, i, boss, opt.fiveMinSets);
    var grain = grainFor(band, tier, elapsed);
    /* At elapsed tiers, about 1 in 3 non-boss orders stay a plain set at the hardest unlocked grain (5-minute, sometimes quarter). */
    if (elapsed && !boss && !opt.forceElapsed && opt.plainSet !== false && (opt.plainSet === true || rng() < 1 / 3)) {
      elapsed = false;
      grain = rng() < 0.25 ? 15 : 5;
    }
    var hours = band.easy ? EASY_HOURS : ALL_HOURS;
    var target, choices, answer, kind, text, say, bakeMin, start;

    if (band.toddler) {
      kind = 'match';
      grain = 60;
      target = { h: pick(rng, boss ? ALL_HOURS : EASY_HOURS.concat([1, 2, 10, 11])), m: 0 };
      var nChoice = boss ? 3 : 2;
      var dHours = ALL_HOURS;
      if (!boss) dHours = EASY_HOURS.concat(ALL_HOURS);
      choices = shuffle(rng, [target].concat(distractors(rng, target, nChoice - 1, 60, dHours)));
      answer = choices.findIndex(function (c) { return sameTime(c, target); });
      text = '';
      say = 'Which clock matches the tag?';
    } else if (band.oclock) {
      kind = 'oclock';
      if (!band.easy && grain === 30) {
        target = randomTime(rng, 30, ALL_HOURS);
      } else {
        grain = 60;
        target = { h: pick(rng, hours), m: 0 };
      }
      var n = band.easy ? (boss ? 3 : 2) : (boss ? 4 : 3);
      choices = shuffle(rng, [target].concat(distractors(rng, target, n - 1, grain, band.easy ? EASY_HOURS.concat(ALL_HOURS) : ALL_HOURS)));
      answer = choices.findIndex(function (c) { return sameTime(c, target); });
      text = 'Tap the clock that shows ' + formatTime(target) + '.';
      say = text;
    } else if (elapsed) {
      kind = 'elapsed';
      var bakeOpts = grain <= 5 ? [10, 15, 20, 25, 30, 35, 40, 45] : [15, 30, 45, 60];
      if (boss && grain <= 5) bakeOpts = [25, 35, 40, 50];
      bakeMin = pick(rng, bakeOpts);
      if (band.g1 && !boss) start = { h: pick(rng, ALL_HOURS), m: pick(rng, [0, 30]) };
      else if (boss && band.g2) start = randomTime(rng, 5, ALL_HOURS);
      else start = randomTime(rng, Math.max(grain, 15), ALL_HOURS);
      start = snapTime(start, start.m % 15 === 0 ? 15 : grain);
      target = addMin(start, bakeMin);
      text = elapsedPrompt(rng, treat, bakeMin, start);
      say = text;
    } else {
      kind = 'set';
      target = randomTime(rng, grain, ALL_HOURS);
      if (boss && grain === 5) target = randomTime(rng, 5, ALL_HOURS);
      var prevSet = null;
      if (recent.length) {
        var lastKey = recent[recent.length - 1];
        if (lastKey && lastKey.indexOf('set:') === 0) {
          var bits = lastKey.split(':');
          prevSet = { h: +bits[1], m: +bits[2] };
        }
      }
      var guardSet = 0;
      while (prevSet && sameTime(target, prevSet) && guardSet++ < 24) {
        target = randomTime(rng, grain, ALL_HOURS);
      }
      text = 'Set the oven to ' + formatTime(target) + '.';
      say = text;
    }

    if (hasBlockedName(text) || hasBlockedName(say)) {
      text = scrubBlockedNames(text);
      say = scrubBlockedNames(say);
    }

    var key = kind + ':' + target.h + ':' + target.m + ':' + treat.id;
    return {
      kind: kind, target: target, grain: grain, choices: choices || null, answer: answer == null ? -1 : answer,
      treat: treat.id, treatName: treat.name, treatPlural: treat.plural,
      bakeMin: bakeMin || 0, start: start || null,
      text: text, say: say, friend: friend, boss: boss, deco: opt.deco || DECOS[0].id,
      key: key, easy: !!band.easy, band: band.id
    };
  }

  function checkPick(order, idx) {
    if (!order || !order.choices) return false;
    return idx === order.answer && sameTime(order.choices[idx], order.target);
  }
  function checkSet(order, set) {
    if (!order || !set) return false;
    var got = snapTime(set, order.grain || 5);
    var want = snapTime(order.target, order.grain || 5);
    return sameTime(got, want);
  }

  function nextDeco(g) {
    var used = {};
    (g.scene || []).forEach(function (d) { used[d.id] = true; });
    var i;
    for (i = 0; i < DECOS.length; i++) if (!used[DECOS[i].id]) return DECOS[i].id;
    return DECOS[(g.scene || []).length % DECOS.length].id;
  }
  function autoPlace(g) {
    g.scene = (g.scene || []).slice();
    if (g.scene.length >= DECOS.length) g.scene.shift();
    var id = (g.order && g.order.deco) || nextDeco(g);
    if (g.scene.some(function (d) { return d.id === id; })) id = nextDeco(g);
    if (g.scene.some(function (d) { return d.id === id; })) return g.scene[g.scene.length - 1];
    var item = { id: id, slot: 's' + g.scene.length };
    g.scene.push(item);
    return item;
  }

  function startSet(order, rng) {
    var grain = (order && order.grain) || 60;
    var hours = (order && order.easy) ? EASY_HOURS : ALL_HOURS;
    var t, guard = 0;
    do {
      t = randomTime(rng, grain, hours);
      guard++;
    } while (order && order.target && sameTime(t, order.target) && guard < 40);
    if (order && order.target && sameTime(t, order.target)) {
      t = snapTime(addMin(order.target, Math.max(grain, 60)), grain);
      if (sameTime(t, order.target)) t = addMin(t, 60);
    }
    return t;
  }

  function newSession(p, rng) {
    var saved = (p && p.games && p.games.bakeshop) || {};
    var scene = saved.scene || [];
    var tier = saved.tier || 0;
    if (tier > 3) tier = 3;
    if (tier < 0) tier = 0;
    return {
      band: bandFor(p), rng: rngOf(rng), i: 0, nFriend: 4, phase: 'ready',
      streak: 0, firstTry: true, nudged: false, misses: 0, tier: tier,
      fiveMinSets: saved.fiveMinSets || 0,
      order: null, set: { h: 12, m: 0 }, pick: -1, pickOk: false,
      scene: scene.slice(), friend: null, recent: [],
      done: false, placedThis: null
    };
  }
  function nextOrder(g, p, opt) {
    opt = opt || {};
    if (g.done) return null;
    var boss = g.i >= g.nFriend;
    var o = makeOrder(p, {
      boss: boss, streak: g.streak, tier: g.tier, i: g.i + 1, recent: g.recent,
      rng: opt.rng || g.rng, band: g.band, friend: opt.friend, deco: opt.deco || nextDeco(g),
      fiveMinSets: g.fiveMinSets
    });
    g.order = o; g.phase = (o.kind === 'match' || o.kind === 'oclock') ? 'pick' : 'set';
    g.set = startSet(o, opt.rng || g.rng); g.pick = -1; g.pickOk = false;
    g.friend = o.friend; g.firstTry = true; g.nudged = false; g.i++;
    g.recent.push(o.key); if (g.recent.length > 12) g.recent.shift();
    return o;
  }
  function complete(g) {
    if (!g.order) return false;
    if (g.phase === 'pick') {
      if (!checkPick(g.order, g.pick)) return false;
      g.pickOk = true;
      if (g.order.kind === 'oclock') {
        g.phase = 'set';
        if (!g.set || sameTime(g.set, g.order.target)) g.set = startSet(g.order, g.rng);
        return 'set';
      }
    }
    if (g.order.kind !== 'match' && !checkSet(g.order, g.set)) return false;
    if (g.order.kind === 'match' && !checkPick(g.order, g.pick)) return false;
    if (g.order.kind === 'set' && g.order.grain === 5) g.fiveMinSets = (g.fiveMinSets || 0) + 1;
    if (g.firstTry && !g.nudged) { g.streak++; if (g.streak >= 2 && g.tier < 3) { g.tier++; g.streak = 0; } }
    else g.streak = 0;
    if (g.order.boss) g.done = true;
    autoPlace(g);
    g.phase = g.done ? 'win' : 'ready';
    return true;
  }
  function failNudge(g) {
    g.nudged = true; g.firstTry = false; g.misses++;
    if (g.misses >= 2 && g.tier > 0) { g.tier--; g.misses = 0; }
  }
  function saveState(p, g) {
    if (!p) return null;
    var st = p.games.bakeshop = p.games.bakeshop || { sessions: 0 };
    st.scene = (g.scene || []).map(function (d) { return { id: d.id, slot: d.slot }; });
    st.tier = g.tier || 0;
    st.fiveMinSets = g.fiveMinSets || 0;
    return st;
  }

  A.BakeShop = {
    TREATS: TREATS, TREAT_BY: TREAT_BY, DECOS: DECOS, EASY_HOURS: EASY_HOURS,
    bandFor: bandFor, grainFor: grainFor, useElapsed: useElapsed,
    toMin: toMin, fromMin: fromMin, addMin: addMin, sameTime: sameTime, snapTime: snapTime,
    hourAngle: hourAngle, minuteAngle: minuteAngle,
    timeFromHourAngle: timeFromHourAngle, timeFromMinuteAngle: timeFromMinuteAngle,
    formatTime: formatTime, formatDigital: formatDigital, makeOrder: makeOrder,
    scrubBlockedNames: scrubBlockedNames, hasBlockedName: hasBlockedName,
    checkPick: checkPick, checkSet: checkSet, startSet: startSet,
    newSession: newSession, nextOrder: nextOrder, complete: complete,
    failNudge: failNudge, autoPlace: autoPlace, nextDeco: nextDeco, saveState: saveState,
    friendsOf: friendsOf
  };
})(window.Arcade);
