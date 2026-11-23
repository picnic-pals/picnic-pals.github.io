/* Pancake Stack Race: pure order/build/race rules. rng injection for tests; no storage or DOM here. */
(function (A) {
  'use strict';

  var COLORS = [
    { id: 'gold', name: 'golden' },
    { id: 'berry', name: 'berry' },
    { id: 'blue', name: 'blueberry' }
  ];
  var COLOR_BY = {};
  COLORS.forEach(function (c) { COLOR_BY[c.id] = c; });

  var TOPPINGS = [
    { id: 'syrup', name: 'syrup' },
    { id: 'berries', name: 'berries' },
    { id: 'cream', name: 'whipped cream' },
    { id: 'butter', name: 'butter' },
    { id: 'banana', name: 'banana slices' },
    { id: 'choc', name: 'chocolate chips' }
  ];

  var DECOS = [
    { id: 'bunting', name: 'bunting' },
    { id: 'menu_board', name: 'menu board' },
    { id: 'flower_pot', name: 'flower pot' },
    { id: 'string_lights', name: 'string lights' },
    { id: 'plant', name: 'plant' },
    { id: 'sign', name: 'stand sign' },
    { id: 'stool', name: 'stool' },
    { id: 'jar', name: 'syrup jar' }
  ];

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
  var N_ORDERS = 8;
  var uid = 1;

  function rngOf(rng) { return typeof rng === 'function' ? rng : Math.random; }
  function num(rng, lo, hi) { return lo + Math.floor(rngOf(rng)() * (hi - lo + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rngOf(rng)() * arr.length)]; }

  /* Canonical tens/hundreds/ones taps to build n. Keep place-value "Make N" orders at or under this. */
  var MAX_BUILD_TAPS = 12;
  function placeTaps(n) {
    n = Math.abs(n) | 0;
    var t = 0;
    while (n > 0) {
      t += n % 10;
      n = Math.floor(n / 10);
    }
    return t;
  }
  function numTaps(rng, lo, hi, maxTaps) {
    maxTaps = maxTaps == null ? MAX_BUILD_TAPS : maxTaps;
    var n, i;
    for (i = 0; i < 40; i++) {
      n = num(rng, lo, hi);
      if (placeTaps(n) <= maxTaps) return n;
    }
    for (n = lo; n <= hi; n++) if (placeTaps(n) <= maxTaps) return n;
    return lo;
  }

  function rank(id) {
    return id === 'toddler' ? 0 : id === 'count' ? 1 : id === 'g1' ? 2 : 3;
  }
  function bandFor(p) {
    var age = A.Age && A.Age.band ? A.Age.band(p) : 'none';
    var tod = (A.Age && A.Age.toddler ? A.Age.toddler(p) : age === 'toddler') || (A.toddler && A.toddler(p));
    var id;
    if (tod || age === 'toddler' || age === 'pre') id = 'toddler';
    else if (age === 'pk' || age === 'k' || age === 'none') id = 'count';
    else if (age === 'g1') id = 'g1';
    else id = 'g2';
    var explicit = p && p.levels && p.levels.math;
    var floor = A.Learn && A.Learn.floor ? A.Learn.floor(p, 'math') : 0;
    if (explicit && explicit !== 'auto') {
      var up = +explicit >= 1 ? 'g1' : 'count';
      if (rank(up) > rank(id)) id = up;
    }
    if (floor >= 3 && rank('g1') > rank(id)) id = 'g1';
    return {
      id: id,
      toddler: id === 'toddler',
      count: id === 'count',
      place: id === 'g1' || id === 'g2',
      g1: id === 'g1',
      g2: id === 'g2'
    };
  }

  function ready20(p, saved) {
    if (saved && saved.count20) return true;
    try {
      var C = A.Curriculum, st = C && C.state ? C.state(p, 'pk_count20') : null;
      if (st && (st.status === 'mastered' || st.placed)) return true;
    } catch (e) {}
    return false;
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

  function nextUid() { return 'c' + (uid++); }

  function cake(kind, color) {
    return { uid: nextUid(), kind: kind || 'one', color: color || 'gold' };
  }
  function addCake(plate, kind, color) {
    return (plate || []).concat([cake(kind, color)]);
  }
  function takeCake(plate, id) {
    return (plate || []).filter(function (c) { return c.uid !== id; });
  }
  function valueOf(plate) {
    return (plate || []).reduce(function (s, c) {
      return s + (c.kind === 'hundred' ? 100 : c.kind === 'ten' ? 10 : 1);
    }, 0);
  }
  function countKind(plate, kind) {
    return (plate || []).filter(function (c) { return c.kind === kind; }).length;
  }
  function cakesForValue(n, color) {
    color = color || 'gold';
    var out = [], h, t, o;
    h = Math.floor(n / 100); n -= h * 100;
    t = Math.floor(n / 10); n -= t * 10;
    o = n;
    while (h--) out.push(cake('hundred', color));
    while (t--) out.push(cake('ten', color));
    while (o--) out.push(cake('one', color));
    return out;
  }
  function startPlate(order) {
    if (order && order.kind === 'shift10') return cakesForValue(order.start, 'gold');
    return [];
  }

  function targetOf(order) {
    if (!order) return 0;
    return order.target != null ? order.target : (order.n || 0);
  }
  /* How far over the target the plate is. Shift-10 hides the end number, so it never reports overage. */
  function overBy(order, plate) {
    if (!order || order.kind === 'shift10') return 0;
    return valueOf(plate) - targetOf(order);
  }
  function wobbleLevel(over) {
    if (over <= 0) return 0;
    if (over <= 2) return 1;
    if (over <= 5) return 2;
    return 3;
  }
  function checkPlate(order, plate) {
    if (!order) return false;
    plate = plate || [];
    if (order.kind === 'picture') {
      if (plate.length !== order.n) return false;
      return plate.every(function (c) { return c.kind === 'one' && c.color === order.color; });
    }
    if (order.kind === 'count') {
      if (plate.length !== order.n) return false;
      return plate.every(function (c) { return c.kind === 'one'; });
    }
    /* Any equivalent amount is correct (canonical tens+ones or another mix).
       Marking a correct total wrong was the age 6-7 "right amount" miss. */
    if (order.kind === 'twoway') {
      return valueOf(plate) === order.target;
    }
    return valueOf(plate) === order.target;
  }

  /* Spoken / written text must never contain the hidden answer for shift10, or a "N ones" spoiler for two-ways. */
  function leaksAnswer(order, text) {
    if (!order || !text) return false;
    var s = String(text);
    if (hasBlockedName(s)) return true;
    if (order.kind === 'shift10') {
      var re = new RegExp('(?:^|\\D)' + order.target + '(?:\\D|$)');
      if (re.test(s)) return true;
    }
    if (order.kind === 'twoway') {
      var ones = order.target - 10 * order.needTens;
      if (new RegExp('\\b' + ones + '\\s+ones?\\b', 'i').test(s)) return true;
    }
    return false;
  }

  function scrub(s) {
    return scrubBlockedNames(s);
  }

  function raceParams(band) {
    if (!band || band.toddler) return { step: 0.4, miss: 0, needed: 0 };
    if (band.count) return { step: 0.55, miss: 1.5, needed: 6 };
    return { step: 0.7875, miss: 1.1, needed: 7 };
  }
  function winsRace(firstTries, band) {
    var need = raceParams(band).needed;
    return (firstTries || 0) >= need;
  }
  function friendGain(band, firstTry) {
    var p = raceParams(band);
    return p.step + (firstTry ? 0 : p.miss);
  }
  /* Bar heights that always agree with winsRace at the end of a session. */
  function raceVisual(g) {
    var player = g && g.playerDone || 0;
    var friend = Math.round((g && g.friendDone) || 0);
    var win = winsRace(g && g.firstTries, g && g.band);
    if (player > 0 && g && (g.done || g.phase === 'win')) {
      if (win && friend >= player) friend = Math.max(0, player - 1);
      if (!win && friend <= player) friend = player + 1;
    }
    if (friend < 0) friend = 0;
    return { player: player, friend: friend, first: win };
  }

  function kindFor(band, tier, boss) {
    if (band.toddler) return 'picture';
    if (band.count) return 'count';
    if (tier >= 3) return 'shift10';
    if (tier >= 2) return 'twoway';
    if (tier >= 1) return 'hundreds';
    return 'build';
  }

  function makeOrder(p, opt) {
    opt = opt || {};
    var band = opt.band || bandFor(p);
    var rng = opt.rng || Math.random;
    var boss = !!opt.boss;
    var tier = opt.tier == null ? 0 : opt.tier;
    var saved = (p && p.games && p.games.pancake) || {};
    var can20 = opt.count20 != null ? !!opt.count20 : ready20(p, saved);
    var friend = opt.friend || pick(rng, friendsOf(p));
    var kind = opt.kind || kindFor(band, tier, boss);
    var color = opt.color || pick(rng, COLORS).id;
    var topping = opt.topping || pick(rng, TOPPINGS).id;
    var n, target, start, needTens, text, say, dir;

    if (kind === 'picture') {
      n = opt.n != null ? opt.n : (boss ? 3 : num(rng, 1, 3));
      if (n < 1) n = 1;
      if (n > 5) n = 5;
      target = n;
      text = '';
      say = 'Make a stack like the picture.';
    } else if (kind === 'count') {
      if (opt.n != null) n = opt.n;
      else if (can20) n = boss ? num(rng, 16, 20) : num(rng, 11, 20);
      else n = boss ? num(rng, 8, 10) : num(rng, 1, 10);
      target = n;
      text = 'Make ' + n + '.';
      say = text;
    } else if (kind === 'build') {
      if (opt.target != null) target = opt.target;
      else if (band.g2) target = boss ? numTaps(rng, 60, 99) : numTaps(rng, 21, 79);
      else target = boss ? numTaps(rng, 40, 69) : numTaps(rng, 11, 39);
      n = target;
      text = 'Make ' + target + '.';
      say = text;
    } else if (kind === 'hundreds') {
      if (opt.target != null) target = opt.target;
      else if (band.g2) target = boss ? numTaps(rng, 180, 249) : numTaps(rng, 101, 219);
      else target = boss ? numTaps(rng, 140, 199) : numTaps(rng, 101, 139);
      n = target;
      text = 'Make ' + target + '.';
      say = text;
    } else if (kind === 'twoway') {
      /* Same ladder step as before, but a plain "Make N" with tens and ones.
         "Make N with K tens" needed a regrouping explanation and too many taps. */
      if (opt.target != null) target = opt.target;
      else target = boss ? numTaps(rng, 37, 68) : numTaps(rng, 23, 58);
      n = target;
      needTens = Math.floor(target / 10);
      text = 'Make ' + target + '.';
      say = text;
    } else {
      kind = 'shift10';
      dir = opt.dir || (rng() < 0.5 ? 'add' : 'sub');
      if (opt.start != null) start = opt.start;
      else {
        start = num(rng, 16, 79);
        if (start <= 20) dir = 'add';
        if (start >= 80) dir = 'sub';
      }
      target = dir === 'add' ? start + 10 : start - 10;
      n = target;
      text = 'Start with ' + start + '. ' + (dir === 'add' ? 'Add 10.' : 'Take away 10.');
      say = text;
    }

    text = scrub(text);
    say = scrub(say);

    return {
      kind: kind, n: n, target: target, start: start || 0, dir: dir || null,
      needTens: needTens || 0, color: color, topping: topping,
      text: text, say: say, friend: friend, boss: boss, deco: opt.deco || DECOS[0].id,
      band: band.id, count20: !!can20, key: kind + ':' + target + ':' + (needTens || 0) + ':' + (start || 0)
    };
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
    var item = { id: id, slot: 's' + g.scene.length, topping: (g.order && g.order.topping) || TOPPINGS[0].id };
    g.scene.push(item);
    g.toppings = (g.toppings || []).concat([item.topping]);
    return item;
  }

  function newSession(p, rng) {
    var saved = (p && p.games && p.games.pancake) || {};
    var scene = saved.scene || [];
    var tier = saved.tier || 0;
    if (tier > 3) tier = 3;
    if (tier < 0) tier = 0;
    var band = bandFor(p);
    if (!band.place) tier = saved.tier || 0;
    return {
      band: band, rng: rngOf(rng), i: 0, nOrders: N_ORDERS, phase: 'ready',
      streak: 0, firstTry: true, nudged: false, misses: 0, tier: band.place ? tier : 0,
      count20: ready20(p, saved), count10Wins: saved.count10Wins || 0,
      order: null, plate: [], friend: pick(rngOf(rng), friendsOf(p)),
      recent: [], scene: scene.slice(), toppings: saved.toppings ? saved.toppings.slice() : [],
      done: false, placedThis: null,
      playerDone: 0, friendDone: 0, firstTries: 0,
      race: raceParams(band)
    };
  }
  function nextOrder(g, p, opt) {
    opt = opt || {};
    if (g.done) return null;
    var boss = g.i >= g.nOrders - 1;
    var o = makeOrder(p, {
      boss: boss, streak: g.streak, tier: g.tier, i: g.i + 1, recent: g.recent,
      rng: opt.rng || g.rng, band: g.band, friend: opt.friend || g.friend,
      deco: opt.deco || nextDeco(g), count20: g.count20
    });
    g.order = o; g.phase = 'stack';
    g.plate = startPlate(o); g.friend = o.friend; g.firstTry = true; g.nudged = false; g.i++;
    g.recent.push(o.key); if (g.recent.length > 12) g.recent.shift();
    g.placedThis = null;
    return o;
  }
  function promoteAfter() {
    return 2;
  }
  function complete(g) {
    if (!g.order || !checkPlate(g.order, g.plate)) return false;
    var first = g.firstTry && !g.nudged;
    if (first) g.firstTries++;
    g.playerDone++;
    g.friendDone += friendGain(g.band, first);
    if (first) {
      g.streak++;
      var need = g.band && g.band.g2 ? 1 : promoteAfter();
      if (g.band && g.band.place && g.streak >= need && g.tier < 3) { g.tier++; g.streak = 0; }
      if (g.order.kind === 'count' && g.order.n <= 10) {
        g.count10Wins = (g.count10Wins || 0) + 1;
        if (g.count10Wins >= 4) g.count20 = true;
      }
    } else g.streak = 0;
    if (g.order.boss || g.i >= g.nOrders) g.done = true;
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
    var st = p.games.pancake = p.games.pancake || { sessions: 0 };
    st.scene = (g.scene || []).map(function (d) { return { id: d.id, slot: d.slot, topping: d.topping }; });
    st.tier = g.tier || 0;
    st.count20 = !!g.count20;
    st.count10Wins = g.count10Wins || 0;
    st.toppings = (g.toppings || []).slice();
    return st;
  }

  A.Pancake = {
    COLORS: COLORS, COLOR_BY: COLOR_BY, TOPPINGS: TOPPINGS, DECOS: DECOS, N_ORDERS: N_ORDERS,
    MAX_BUILD_TAPS: MAX_BUILD_TAPS, placeTaps: placeTaps,
    bandFor: bandFor, ready20: ready20, raceParams: raceParams, winsRace: winsRace, friendGain: friendGain, raceVisual: raceVisual,
    makeOrder: makeOrder, checkPlate: checkPlate, startPlate: startPlate,
    addCake: addCake, takeCake: takeCake, valueOf: valueOf, countKind: countKind, cakesForValue: cakesForValue,
    targetOf: targetOf, overBy: overBy, wobbleLevel: wobbleLevel,
    leaksAnswer: leaksAnswer, scrub: scrub,
    newSession: newSession, nextOrder: nextOrder, complete: complete,
    failNudge: failNudge, autoPlace: autoPlace, nextDeco: nextDeco, saveState: saveState,
    friendsOf: friendsOf
  };
})(window.Arcade);
