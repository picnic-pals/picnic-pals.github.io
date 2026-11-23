/* Bake Shop Clock v2 (rework 1122): pure rules. Levels, orders, snapping, hints, progress. No DOM, no storage writes
   beyond the profile object handed in. rng injection keeps orders reproducible in tests. */
(function (A) {
  'use strict';

  /* Four visible clock levels. O'clock opens half past when it is solid (5 of the last 6 first tries on its new times right, plus
     2 right clock reads). Quarters and 5 minutes are a grade-2 bonus: each opens only after the level before it is solid on 2 different days. */
  var LEVELS = [
    { id: 'oclock', name: "O'clock", short: "O'clock", grain: 60, minute: false, skill: 'time_hour_half', lessons: ['hands', 'oclock'],
      tip: 'The short hand points to the hour' },
    { id: 'half', name: 'Half past', short: 'Half past', grain: 30, minute: true, skill: 'time_hour_half', lessons: ['half'],
      tip: 'The long hand goes on 12 or 6' },
    { id: 'quarter', name: 'Quarter past and quarter to', short: 'Quarters', grain: 15, minute: true, skill: 'time_5min', lessons: ['quarter'],
      tip: 'The long hand goes on 12, 3, 6 or 9' },
    { id: 'five', name: 'Five-minute times', short: '5 minutes', grain: 5, minute: true, skill: 'time_5min', lessons: ['five'],
      tip: 'Count by 5s for the long hand' }
  ];
  var NEED = 5, BOARD = 5;

  /* Lesson cards: picture clock + one short read-aloud line. */
  var LESSONS = {
    hands: { title: 'Two hands', text: 'The short hand shows the hour. The long hand shows the minutes.', clock: { h: 2, m: 0 }, label: 'hands' },
    oclock: { title: "O'clock", text: "At o'clock, the long hand sits on 12. The short hand points to the hour. This says 3 o'clock, or 3:00.", clock: { h: 3, m: 0 }, glow: [12, 3] },
    half: { title: 'Half past', text: 'At half past, the long hand sits on 6. The short hand is halfway to the next number. This says half past 4, or 4:30.', clock: { h: 4, m: 30 }, glow: [6] },
    quarter: { title: 'Quarter past and quarter to', text: 'Quarter past: the long hand sits on 3. Quarter to: the long hand sits on 9.', clocks: [{ h: 2, m: 15 }, { h: 2, m: 45 }], glows: [[3], [9]], caps: ['quarter past 2', 'quarter to 3'] },
    five: { title: 'Five-minute times', text: 'Each number is 5 minutes for the long hand. Count by 5s: 5, 10, 15, 20. This says 20 past 4.', clock: { h: 4, m: 20 }, glow: [1, 2, 3, 4] }
  };

  /* Treats are Picnic Pals kawaii bakery art. A friend treat appears only once the kid has met that friend (locked friends stay
     hidden). The menu grows by one treat each time a level is mastered. */
  var TREATS = [
    { id: 'muffin', name: 'muffin', plural: 'muffins', art: 'art/food-fight/muffin.png', friend: false },
    { id: 'cookie', name: 'cookie', plural: 'cookies', friend: true },
    { id: 'cupcake', name: 'cupcake', plural: 'cupcakes', friend: true },
    { id: 'donut', name: 'donut', plural: 'donuts', friend: true },
    { id: 'pretzel', name: 'pretzel', plural: 'pretzels', friend: true },
    { id: 'waffle', name: 'waffle', plural: 'waffles', friend: true },
    { id: 'pancake', name: 'pancake', plural: 'pancakes', friend: true },
    { id: 'mochi', name: 'mochi', plural: 'mochi', friend: true }
  ];
  var TREAT_BY = {};
  TREATS.forEach(function (t) { TREAT_BY[t.id] = t; });
  var MENU_START = 3;

  var EASY_HOURS = [12, 3, 6, 9];
  var ALL_HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  function nameHash(s) {
    var h = 2166136261, i;
    s = String(s || '').toLowerCase();
    for (i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
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
    return String(text || '').replace(/[A-Za-z]+/g, function (w) { return BLOCKED_NAME_HASH[nameHash(w)] ? 'a friend' : w; });
  }

  function rngOf(rng) { return typeof rng === 'function' ? rng : Math.random; }
  function pick(rng, arr) { return arr[Math.floor(rngOf(rng)() * arr.length)]; }
  function shuffle(rng, arr) {
    var a = arr.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(rngOf(rng)() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ---- time helpers ---- */
  function toMin(t) { return (t.h === 12 ? 0 : t.h) * 60 + (t.m || 0); }
  function fromMin(n) { n = ((n % 720) + 720) % 720; var h = Math.floor(n / 60); return { h: h === 0 ? 12 : h, m: n % 60 }; }
  function addMin(t, d) { return fromMin(toMin(t) + d); }
  function sameTime(a, b) { return !!(a && b && a.h === b.h && (a.m || 0) === (b.m || 0)); }
  function hourAngle(t) { return 0.5 * toMin(t); }
  function minuteAngle(t) { return 6 * (t.m || 0); }
  function wrapH(h) { h = ((h - 1) % 12 + 12) % 12 + 1; return h; }
  function snapMin(m, grain) {
    grain = grain || 5; if (grain >= 60) return 0;
    var s = Math.round(m / grain) * grain; return ((s % 60) + 60) % 60;
  }
  /* Dragging the short hand picks the hour whose spot (with the current minutes) is closest. Minutes stay. */
  function hourFromAngle(deg, cur) {
    deg = ((deg % 360) + 360) % 360;
    var off = 0.5 * ((cur && cur.m) || 0);
    var k = Math.round((deg - off) / 30);
    return wrapH(k === 0 ? 12 : k);
  }
  /* Dragging the long hand snaps it to the level's spots (12 / 12+6 / quarters / every 5). The hour stays put. */
  function minuteFromAngle(deg, grain) {
    deg = ((deg % 360) + 360) % 360;
    return snapMin(deg / 6, grain);
  }
  function stepHour(t, d) { return { h: wrapH(t.h + d), m: t.m || 0 }; }
  function stepMinute(t, d, grain) {
    grain = grain || 5; if (grain >= 60) return { h: t.h, m: 0 };
    return { h: t.h, m: (((snapMin(t.m || 0, grain) + d * grain) % 60) + 60) % 60 };
  }
  /* A number tapped on the face: the hour hand goes to it, or the long hand to its minute spot (snapped to the level). */
  function tapNumber(t, n, hand, grain) {
    if (hand === 'minute' && grain < 60) return { h: t.h, m: snapMin((n % 12) * 5, grain) };
    return { h: wrapH(n), m: t.m || 0 };
  }

  var MIN_WORDS = { 5: 'five', 10: 'ten', 20: 'twenty', 25: 'twenty-five' };
  function formatTime(t) {
    var m = t.m || 0, h = t.h, nextH = h === 12 ? 1 : h + 1;
    if (m === 0) return h + " o'clock";
    if (m === 15) return 'quarter past ' + h;
    if (m === 30) return 'half past ' + h;
    if (m === 45) return 'quarter to ' + nextH;
    if (m < 30) return (MIN_WORDS[m] || m) + ' past ' + h;
    return (MIN_WORDS[60 - m] || (60 - m)) + ' to ' + nextH;
  }
  function formatDigital(t) { var m = t.m || 0; return t.h + ':' + (m < 10 ? '0' : '') + m; }
  /* Ticket parts: the big time words and the digital form under them ("half past 4" / "4:30"). Wording is unchanged. */
  function ticketParts(t) {
    return { big: formatTime(t), small: formatDigital(t) };
  }

  /* ---- who is playing ---- */
  function isToddler(p) {
    if (!p) return false;
    if (A.Age && A.Age.toddler && A.Age.toddler(p)) return true;
    if (A.toddler && A.toddler(p)) return true;
    return p.age != null && p.age !== '' && +p.age <= 2;
  }
  /* Pre-K (age 3 to under 5, not in Toddler mode): o'clock only, picture tickets, pick-the-clock, then copy-the-clock. */
  function isPreK(p) {
    if (!p || isToddler(p)) return false;
    if (A.Age && A.Age.little) return !!A.Age.little(p);
    return p.age != null && p.age !== '' && +p.age < 5;
  }

  /* ---- saved progress (p.games.bakeshop, v3) ---- */
  function skillRec(p, id) { var s = p && p.skills && p.skills[id]; return s || null; }
  function hasClockSkill(p, id) {
    var s = skillRec(p, id); if (!s) return false;
    if (s.status === 'mastered' && !s.placed) return true;              /* earned in play, not placed by age */
    return (s.attempts || 0) >= 5 && (s.correct || 0) / Math.max(1, s.attempts) >= 0.8;
  }
  /* Everyone starts at o'clock unless they already have clock skill on record. Age alone never skips ahead.
     Earned clock skill (half past or 5-minute) starts at half past: o'clock and half past stay the focus until they are solid.
     Earned 5-minute skill keeps quarters and 5 minutes open (topFor), but the day still starts on half past. */
  function startLevelFor(p) {
    if (hasClockSkill(p, 'time_5min') || hasClockSkill(p, 'time_hour_half')) return 1;
    return 0;
  }
  function topFor(p) {
    if (hasClockSkill(p, 'time_5min')) return 3;
    if (hasClockSkill(p, 'time_hour_half')) return 1;
    return 0;
  }
  function today() { var d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }
  var WIN = 6, READS_NEED = 2, SOLID_DAYS = 2, DAY_MIN = 3;
  function trues(n) { var a = []; for (var i = 0; i < n; i++) a.push(1); return a; }
  function state(p) {
    if (!p) return null;
    p.games = p.games || {};
    var st = p.games.bakeshop = p.games.bakeshop || { sessions: 0 };
    if (st.v !== 2 && st.v !== 3) {
      var s0 = startLevelFor(p), t0 = topFor(p);
      st.v = 2; st.lv = s0; st.top = t0; st.prog = [0, 0, 0, 0]; st.layers = 0; st.seen = {}; st.board = []; st.day = today();
      delete st.scene; delete st.tier; delete st.fiveMinSets;
    }
    if (!Array.isArray(st.prog)) st.prog = [0, 0, 0, 0];
    if (st.v === 2) {
      /* v2 -> v3: levels already opened stay open; mastered levels count as solid; partial progress carries over (up to 4 of 5). */
      st.v = 3; st.win = [[], [], [], []]; st.reads = [0, 0, 0, 0]; st.solid = [[], [], [], []];
      for (var i = 0; i < 4; i++) {
        if ((st.layers || 0) > i || i < (st.top | 0)) { st.win[i] = trues(5); st.reads[i] = READS_NEED; st.solid[i] = [1, 2]; }
        else st.win[i] = trues(Math.min(4, st.prog[i] || 0));
      }
    }
    if (!Array.isArray(st.win)) st.win = [[], [], [], []];
    if (!Array.isArray(st.reads)) st.reads = [0, 0, 0, 0];
    if (!Array.isArray(st.solid)) st.solid = [[], [], [], []];
    if (!st.pk) st.pk = { last: [], copy: false };
    if (!st.seen) st.seen = {};
    if (!Array.isArray(st.board)) st.board = [];
    if (!st.todayN || st.todayN.day !== today()) st.todayN = { day: today(), n: [0, 0, 0, 0] };
    if (st.day !== today()) { st.board = []; st.day = today(); }
    st.top = Math.max(0, Math.min(LEVELS.length - 1, st.top | 0));
    st.lv = Math.max(0, Math.min(st.top, st.lv | 0));
    for (var k = 0; k < 4; k++) st.prog[k] = winRight(st, k);
    return st;
  }
  function winRight(st, lv) { return ((st.win && st.win[lv]) || []).filter(function (x) { return x; }).length; }
  /* A level is solid when 5 of the last 6 first tries on its NEW times were right, plus 2 right clock reads (o'clock, half past). */
  function gateMet(st, lv) {
    return winRight(st, lv) >= NEED && (lv > 1 || (st.reads[lv] || 0) >= READS_NEED);
  }
  /* The day starts on o'clock / half past until half past has been solid on 2 different days. */
  function focusLevel(st) {
    if (st.lv >= 2 && (st.solid[1] || []).length < SOLID_DAYS) return 1;
    return st.lv;
  }
  function isNewItem(lv, t) {
    var m = t.m || 0;
    if (lv === 0) return m === 0;
    if (lv === 1) return m === 30;
    if (lv === 2) return m === 15 || m === 45;
    return m % 15 !== 0;
  }

  function metFriends(p) {
    var list = (A.Story2 && A.Story2.met) ? A.Story2.met(p) : null;
    if (!list || !list.length) list = Object.keys((p && p.unlocks && p.unlocks.blobs) || {});
    if (!list.length) list = ['strawberry', 'apple', 'blueberry'];
    return list;
  }
  /* The menu: muffin, then bakery friends she has met, in a fixed order; 3 to start, +1 per mastered level. */
  function menu(p, st) {
    var met = metFriends(p), out = [];
    TREATS.forEach(function (t) { if (!t.friend || met.indexOf(t.id) >= 0) out.push(t.id); });
    var n = MENU_START + ((st && st.layers) || 0);
    return out.slice(0, Math.max(1, n));
  }

  /* ---- orders ---- */
  function targetFor(lv, rng, recent) {
    rng = rngOf(rng);
    var L = LEVELS[lv] || LEVELS[0], t, guard = 0, mins;
    do {
      var h = pick(rng, ALL_HOURS), m = 0;
      if (L.id === 'half') m = rng() < 0.7 ? 30 : 0;
      else if (L.id === 'quarter') m = rng() < 0.65 ? pick(rng, [15, 45]) : pick(rng, [0, 30]);
      else if (L.id === 'five') {
        mins = [5, 10, 20, 25, 35, 40, 50, 55];
        m = rng() < 0.75 ? pick(rng, mins) : pick(rng, [0, 15, 30, 45]);
      }
      t = { h: h, m: m };
      guard++;
    } while (recent && recent.some(function (r) { return sameTime(r, t); }) && guard < 30);
    return t;
  }
  /* Pre-K picture clocks: two other hours far from the target (at least 3 hours away, and from each other), never neighbors. */
  function hourGap(a, b) { var d = Math.abs(a - b) % 12; return Math.min(d, 12 - d); }
  function farHours(rng, h, n) {
    var pool = shuffle(rng, ALL_HOURS.filter(function (x) { return hourGap(x, h) >= 3; })), out = [];
    pool.forEach(function (x) { if (out.length < n && out.every(function (y) { return hourGap(x, y) >= 3; })) out.push(x); });
    return out;
  }
  /* "What time is it?" choices: the right time plus 3 likely mix-ups.
     Half past (4:30): 5:30 (hour hand read as the next number), 6:20 (hands swapped), 4:00, 3:30.
     O'clock (2:00): 12:10 (hands swapped), 3:00, 1:00 (and 2:30 once half past is open). */
  function readChoices(t, lv, rng) {
    var h = t.h, m = t.m || 0, nx = wrapH(h + 1), pv = wrapH(h - 1), c = [];
    if (m === 30) c = [{ h: nx, m: 30 }, { h: 6, m: (h % 12) * 5 }, { h: h, m: 0 }, { h: pv, m: 30 }, { h: nx, m: 0 }];
    else c = [{ h: 12, m: (h % 12) * 5 }, { h: nx, m: 0 }, { h: pv, m: 0 }].concat(lv >= 1 ? [{ h: h, m: 30 }, { h: pv, m: 30 }] : [{ h: wrapH(h + 2), m: 0 }]);
    var out = [];
    c.forEach(function (x) { if (out.length < 3 && !sameTime(x, t) && !out.some(function (y) { return sameTime(x, y); })) out.push(x); });
    var all = shuffle(rng, [t].concat(out));
    return { choices: all, answer: all.indexOf(t) };
  }
  /* The clock starts on a different time that is still on the level's spots, so a kid has to move a hand. */
  function startSet(order, rng) {
    rng = rngOf(rng);
    var grain = (order && order.grain) || 60, t, guard = 0;
    do {
      t = { h: pick(rng, ALL_HOURS), m: grain >= 60 ? 0 : snapMin(Math.floor(rng() * 60), grain) };
      guard++;
    } while (order && order.target && (sameTime(t, order.target) || t.h === order.target.h) && guard < 40);
    if (order && order.target && sameTime(t, order.target)) t = stepHour(t, 3);
    return t;
  }
  /* opt.kind: 'set' (default), 'read' (grade 1: show a clock, pick the time), 'match' / 'copy' (pre-K). Toddlers always 'match' (2). */
  function makeOrder(p, opt) {
    opt = opt || {};
    var rng = rngOf(opt.rng), st = opt.st || state(p), lv = opt.lv == null ? st.lv : opt.lv;
    var treats = opt.menu || menu(p, st);
    var lastTreat = opt.lastTreat || null;
    var pool = treats.length > 1 ? treats.filter(function (id) { return id !== lastTreat; }) : treats;
    var treat = TREAT_BY[pick(rng, pool)] || TREATS[0];
    var friends = (opt.friends || metFriends(p)).filter(function (f) { return f !== treat.id; });
    var friend = opt.friend || pick(rng, friends.length ? friends : ['strawberry']);
    var toddler = opt.toddler != null ? opt.toddler : isToddler(p);
    var prek = !toddler && (opt.prek != null ? opt.prek : isPreK(p));
    if (toddler || prek) lv = 0;
    var L = LEVELS[lv] || LEVELS[0];
    var target, kind = opt.kind || 'set', choices = null, answer = -1, r;
    var Tn = treat.plural.charAt(0).toUpperCase() + treat.plural.slice(1), text, say;
    if (toddler) {
      kind = 'match';
      target = { h: pick(rng, EASY_HOURS), m: 0 };
      var other = { h: pick(rng, EASY_HOURS.filter(function (h) { return h !== target.h; })), m: 0 };
      choices = shuffle(rng, [target, other]);
      answer = choices[0] === target ? 0 : 1;
      text = say = 'Which clock matches the ticket?';
    } else if (prek) {
      kind = kind === 'copy' ? 'copy' : 'match';
      target = opt.target || { h: pick(rng, (opt.recent && opt.recent.length ? ALL_HOURS.filter(function (h) { return !opt.recent.some(function (x) { return x.h === h; }); }) : ALL_HOURS)), m: 0 };
      if (kind === 'match') {
        var far = farHours(rng, target.h, 2).map(function (h) { return { h: h, m: 0 }; });
        choices = shuffle(rng, [target].concat(far));
        answer = choices.indexOf(target);
        text = Tn + ' at ' + target.h + " o'clock.";
        say = Tn + ' at ' + target.h + " o'clock! Tap the clock that says " + target.h + " o'clock.";
      } else {
        text = Tn + ' at ' + target.h + " o'clock.";
        say = Tn + ' at ' + target.h + " o'clock! Make the shop clock look like the ticket. Move the short hand to " + target.h + '.';
      }
    } else if (kind === 'read') {
      target = opt.target || targetFor(lv, rng, opt.recent);
      r = readChoices(target, lv, rng); choices = r.choices; answer = r.answer;
      text = 'What time is it?';
      say = 'The ' + treat.plural + ' are ready! What time does the shop clock say? Tap the time.';
    } else {
      kind = 'set';
      target = opt.target || targetFor(lv, rng, opt.recent);
      text = say = Tn + ', please, at ' + formatTime(target) + '.';
    }
    if (hasBlockedName(text)) text = scrubBlockedNames(text);
    if (hasBlockedName(say)) say = scrubBlockedNames(say);
    var little = toddler || prek;
    return {
      kind: kind, lv: lv, level: L.id, grain: little ? 60 : L.grain, minute: !little && L.minute && kind !== 'read', target: target,
      choices: choices, answer: answer, treat: treat.id, treatName: treat.name, treatPlural: treat.plural,
      friend: friend, text: text, say: say, prek: prek, toddler: toddler,
      skill: little ? null : skillFor(target), newItem: !little && isNewItem(lv, target)
    };
  }
  /* Smart levels logging goes by the TIME, not the level: :00 / :30 -> time_hour_half, anything else -> time_5min. */
  function skillFor(t) { var m = t.m || 0; return (m === 0 || m === 30) ? 'time_hour_half' : 'time_5min'; }
  function ladderChoices(o) {
    if (o.choices) return o.choices.length;
    return { 60: 12, 30: 24, 15: 48, 5: 144 }[o.grain] || 12;
  }
  function isPickKind(o) { return !!o && (o.kind === 'match' || o.kind === 'read'); }
  function checkSet(order, set) {
    if (!order || !set) return false;
    if (isPickKind(order)) return false;
    return set.h === order.target.h && (order.minute ? (set.m || 0) === (order.target.m || 0) : true);
  }
  function checkPick(order, i) { return isPickKind(order) && i === order.answer && sameTime(order.choices[i], order.target); }

  /* After a miss on a set order. Miss 1: the rule, no number glow (the wrong hand pulses). Miss 2: glow the number.
     Miss 3 and later: show it (the game moves the hand there; the kid taps It's ready!). Hour first, then minutes. */
  function hintFor(order, set, misses) {
    misses = misses || 2;
    if (!order || isPickKind(order)) return { hand: null, glow: [], say: 'Look at the ticket clock.' };
    var t = order.target, m = t.m || 0, nextH = t.h === 12 ? 1 : t.h + 1, out;
    if (set.h !== t.h) {
      if (misses === 1) {
        if (order.prek || order.kind === 'copy') out = { hand: 'hour', glow: [], say: 'The short hand points to the hour. Look at the ticket clock.' };
        else if (m === 0) out = { hand: 'hour', glow: [], say: 'The short hand points to the hour. Find ' + t.h + ' on the ticket.' };
        else if (m === 30) out = { hand: 'hour', glow: [t.h, nextH], say: 'At half past, the short hand is halfway between ' + t.h + ' and ' + nextH + '.' };
        else if (m === 45) out = { hand: 'hour', glow: [], say: 'Quarter to ' + nextH + ': the short hand is almost at ' + nextH + '.' };
        else out = { hand: 'hour', glow: [], say: 'The short hand goes just past ' + t.h + '. Find ' + t.h + ' on the ticket.' };
      } else if (m === 0) out = { hand: 'hour', glow: [t.h], say: 'The short hand points to ' + t.h + '.' };
      else out = { hand: 'hour', glow: [t.h, nextH], say: 'The short hand goes between ' + t.h + ' and ' + nextH + '.' };
    } else if (order.minute && (set.m || 0) !== m) {
      var n = m === 0 ? 12 : m / 5;
      if (misses === 1) {
        var line = m === 0 ? "O'clock: the long hand points straight up to 12."
          : m === 30 ? 'Half past: the long hand points straight down.'
          : m === 15 ? 'Quarter past: the long hand points to 3, a quarter of the way around.'
          : m === 45 ? 'Quarter to: the long hand points to 9, three quarters of the way around.'
          : 'Count by 5s on the numbers until you reach ' + m + '.';
        out = { hand: 'minute', glow: [], say: line };
      } else if (order.grain === 5 && m % 15 !== 0) {
        var counts = []; for (var k = 5; k <= m; k += 5) counts.push(k);
        out = { hand: 'minute', glow: [n], say: 'The long hand goes on ' + n + '. Count by 5s: ' + counts.join(', ') + '.' };
      } else out = { hand: 'minute', glow: [n], say: 'The long hand goes on ' + n + '.' };
    } else return { hand: null, glow: [], say: 'Almost! Look at the hands again.', step: 0 };
    out.step = Math.min(3, misses);
    if (misses >= 3) { out.show = true; out.say = 'Like this! Now tap It\u2019s ready!'; out.glow = out.hand === 'hour' ? (m === 0 ? [t.h] : [t.h, nextH]) : [m === 0 ? 12 : m / 5]; }
    return out;
  }
  /* After a wrong pick on a "What time is it?" or pre-K / toddler picture order. */
  function hintPick(order, picked, misses) {
    misses = misses || 1;
    var t = order.target, m = t.m || 0, nextH = t.h === 12 ? 1 : t.h + 1;
    if (order.kind === 'match') {
      if (order.toddler) return { hand: null, glow: [], say: 'Look at the ticket clock.' };
      return misses === 1 ? { hand: 'hour', glow: [], say: 'Look at the short hand on the ticket clock.' }
        : { hand: 'hour', glow: [t.h], say: 'The short hand points to ' + t.h + '.' };
    }
    var hourWrong = !picked || picked.h !== t.h;
    if (hourWrong) {
      if (misses === 1) return { hand: 'hour', glow: [], say: m === 30 ? 'Short hand first. At half past it has just passed the hour.' : 'Look at the short hand first. It shows the hour.' };
      return { hand: 'hour', glow: m === 30 ? [t.h, nextH] : [t.h], say: m === 30 ? 'The short hand is between ' + t.h + ' and ' + nextH + '. The hour is ' + t.h + '.' : 'The short hand points to ' + t.h + '.' };
    }
    if (misses === 1) return { hand: 'minute', glow: [], say: m === 30 ? 'Now the long hand. Straight down means half past, :30.' : 'Now the long hand. Straight up on 12 means o\u2019clock, :00.' };
    return { hand: 'minute', glow: [m === 30 ? 6 : 12], say: m === 30 ? 'The long hand is on 6. That is :30.' : 'The long hand is on 12. That is :00.' };
  }

  /* ---- a session (one day's order board) ---- */
  function newSession(p, rng) {
    var st = state(p);
    var g = {
      p: p, rng: rngOf(rng), st: st, toddler: isToddler(p), prek: isPreK(p), order: null, set: { h: 12, m: 0 }, phase: 'set',
      firstTry: true, misses: 0, hint: null, recent: [], lastTreat: null, active: 'hour', pick: -1, n: 0, review: [], wrong: []
    };
    if (!g.toddler && !g.prek) st.lv = focusLevel(st);
    return g;
  }
  /* Which kind of order comes next. Grade 1 at o'clock / half past: about 1 in 3 are "What time is it?" reads (never the first
     order of the day), a missed time comes back as a read 3 orders later, and reads come first if they are all the gate still needs.
     Pre-K: pick-the-clock; after 5 of the last 6 right, copy-the-clock (hour hand only) is mixed in. */
  function chooseKind(g, rng) {
    var st = g.st, lv = st.lv;
    if (g.toddler) return { kind: 'match' };
    if (g.prek) return { kind: st.pk.copy && rng() < 0.5 ? 'copy' : 'match' };
    if (lv > 1) return { kind: 'set' };
    for (var i = 0; i < g.review.length; i++) {
      var rv = g.review[i];
      if (rv.due <= g.n && (lv >= 1 || (rv.t.m || 0) === 0)) { g.review.splice(i, 1); return { kind: 'read', target: rv.t }; }
    }
    if (g.n === 0) return { kind: 'set' };
    if (winRight(st, lv) >= NEED && (st.reads[lv] || 0) < READS_NEED) return { kind: 'read' };
    return { kind: rng() < 1 / 3 ? 'read' : 'set' };
  }
  function nextOrder(g, p, opt) {
    opt = opt || {};
    var rng = rngOf(opt.rng || g.rng), ck = opt.kind ? { kind: opt.kind, target: opt.target } : chooseKind(g, rng);
    var o = makeOrder(p, { rng: rng, st: g.st, lv: g.st.lv, recent: g.recent, lastTreat: g.lastTreat, toddler: g.toddler, prek: g.prek, friend: opt.friend, kind: ck.kind, target: ck.target });
    g.order = o; g.phase = isPickKind(o) ? 'pick' : 'set';
    g.set = isPickKind(o) ? { h: 12, m: 0 } : startSet(o, rng);
    g.firstTry = true; g.misses = 0; g.hint = null; g.pick = -1; g.active = 'hour'; g.wrong = [];
    g.recent.push(o.target); if (g.recent.length > 3) g.recent.shift();
    g.lastTreat = o.treat; g.n++;
    return o;
  }
  /* Call when the kid taps "It's ready!" (or picks a clock / a time). Returns {ok, first, mastered, unlocked, boardFull, ...}. */
  function submit(g) {
    var o = g.order; if (!o) return { ok: false };
    var pickK = isPickKind(o), ok = pickK ? checkPick(o, g.pick) : checkSet(o, g.set), st = g.st;
    var res = { ok: ok, first: g.firstTry, mastered: false, unlocked: -1, boardFull: false, newTreat: null, solidDay: false, pkCopy: false };
    if (g.firstTry) record(g, o, ok, res);
    if (!ok) {
      g.misses++; g.firstTry = false;
      if (pickK) { g.wrong.push(g.pick); g.hint = hintPick(o, o.choices && o.choices[g.pick], g.misses); }
      else g.hint = hintFor(o, g.set, g.misses);
      if (g.hint.hand && !pickK) g.active = g.hint.hand;
      /* spaced review: a missed grade-1 time comes back as a read 3 orders later */
      if (g.misses === 1 && !o.prek && !o.toddler && o.lv <= 1 && o.kind === 'set') g.review.push({ t: o.target, due: g.n + 2 });
      return res;
    }
    g.hint = null; g.phase = 'done';
    st.board.push(o.treat);
    if (st.board.length >= BOARD) res.boardFull = true;
    return res;
  }
  /* First tries only: progress, the gate, cake layers and unlocks. Never takes away a level or a layer. */
  function record(g, o, ok, res) {
    var st = g.st;
    if (o.toddler) return;
    if (o.prek) {
      st.pk.last.push(ok ? 1 : 0); if (st.pk.last.length > WIN) st.pk.last.shift();
      if (!st.pk.copy && st.pk.last.filter(function (x) { return x; }).length >= NEED) { st.pk.copy = true; res.pkCopy = true; }
      return;
    }
    var lv = o.lv;
    if (!o.newItem) return;
    st.win[lv].push(ok ? 1 : 0); if (st.win[lv].length > WIN) st.win[lv].shift();
    if (ok && o.kind === 'read') st.reads[lv] = (st.reads[lv] || 0) + 1;
    if (ok) st.todayN.n[lv] = (st.todayN.n[lv] || 0) + 1;
    st.prog[lv] = winRight(st, lv);
    if (!ok || !gateMet(st, lv)) return;
    var before = menu(g.p || null, st);
    if (st.layers === lv) { st.layers = lv + 1; res.mastered = true; }
    var after = menu(g.p || null, st);
    if (after.length > before.length) res.newTreat = after[after.length - 1];
    var d = st.todayN.day;
    if (st.todayN.n[lv] >= DAY_MIN && st.solid[lv].indexOf(d) < 0) { st.solid[lv].push(d); res.solidDay = true; }
    if (lv === st.top && st.top < LEVELS.length - 1) {
      var open = lv === 0 ? true : st.solid[lv].length >= SOLID_DAYS;
      if (open) { st.top = lv + 1; res.unlocked = st.top; }
    }
  }

  function levelInfo(st, i) {
    var L = LEVELS[i];
    return { i: i, id: L.id, name: L.name, short: L.short, open: i <= st.top, prog: Math.min(NEED, winRight(st, i)), need: NEED,
      reads: Math.min(READS_NEED, st.reads[i] || 0), readsNeed: i <= 1 ? READS_NEED : 0, days: Math.min(SOLID_DAYS, (st.solid[i] || []).length),
      bonus: i >= 2, solid: gateMet(st, i) };
  }

  A.BakeShop = {
    LEVELS: LEVELS, LESSONS: LESSONS, TREATS: TREATS, TREAT_BY: TREAT_BY, NEED: NEED, BOARD: BOARD, WIN: WIN, READS_NEED: READS_NEED, SOLID_DAYS: SOLID_DAYS, MENU_START: MENU_START,
    EASY_HOURS: EASY_HOURS, ALL_HOURS: ALL_HOURS,
    toMin: toMin, fromMin: fromMin, addMin: addMin, sameTime: sameTime, hourAngle: hourAngle, minuteAngle: minuteAngle,
    snapMin: snapMin, hourFromAngle: hourFromAngle, minuteFromAngle: minuteFromAngle, stepHour: stepHour, stepMinute: stepMinute,
    tapNumber: tapNumber, formatTime: formatTime, formatDigital: formatDigital, ticketParts: ticketParts,
    isToddler: isToddler, isPreK: isPreK, startLevelFor: startLevelFor, topFor: topFor, focusLevel: focusLevel, gateMet: gateMet, winRight: winRight, isNewItem: isNewItem, hasClockSkill: hasClockSkill, state: state, menu: menu, metFriends: metFriends,
    targetFor: targetFor, startSet: startSet, makeOrder: makeOrder, checkSet: checkSet, checkPick: checkPick, hintFor: hintFor, hintPick: hintPick, readChoices: readChoices, farHours: farHours, skillFor: skillFor, ladderChoices: ladderChoices, isPickKind: isPickKind, chooseKind: chooseKind,
    newSession: newSession, nextOrder: nextOrder, submit: submit, levelInfo: levelInfo,
    scrubBlockedNames: scrubBlockedNames, hasBlockedName: hasBlockedName
  };
})(window.Arcade);
