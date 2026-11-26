/* Snack Racers v1 — pure race, question, and shared-garage rules. */
(function (A) {
  'use strict';
  var NQ = 10;
  var TRACK_LEN = 1000;
  var BASE = 60;
  var BOOST = 50;
  var GHOST = 0.95;
  var UPGRADE_COST = [25, 40, 55];
  var MISS_PENALTY = 8;

  var FOODS = [
    { id: 'strawberry', name: 'strawberry', plural: 'strawberries', icon: '🍓' },
    { id: 'lemon', name: 'lemon', plural: 'lemons', icon: '🍋' },
    { id: 'banana', name: 'banana', plural: 'bananas', icon: '🍌' },
    { id: 'blueberry', name: 'blueberry', plural: 'blueberries', icon: '🫐' },
    { id: 'cookie', name: 'cookie', plural: 'cookies', icon: '🍪' },
    { id: 'apple', name: 'apple', plural: 'apples', icon: '🍎' },
    { id: 'carrot', name: 'carrot', plural: 'carrots', icon: '🥕' },
    { id: 'donut', name: 'donut', plural: 'donuts', icon: '🍩' },
    { id: 'pretzel', name: 'pretzel', plural: 'pretzels', icon: '🥨' },
    { id: 'taco', name: 'taco', plural: 'tacos', icon: '🌮' },
    { id: 'sandwich', name: 'sandwich', plural: 'sandwiches', icon: '🥪' },
    { id: 'tomato', name: 'tomato', plural: 'tomatoes', icon: '🍅' },
    { id: 'cheese', name: 'cheese', plural: 'pieces of cheese', icon: '🧀' },
    { id: 'peach', name: 'peach', plural: 'peaches', icon: '🍑' },
    { id: 'grapes', name: 'grape', plural: 'grapes', icon: '🍇' },
    { id: 'bread', name: 'bread', plural: 'loaves', icon: '🍞' },
    { id: 'tangerine', name: 'orange', plural: 'oranges', icon: '🍊' },
    { id: 'cupcake', name: 'cupcake', plural: 'cupcakes', icon: '🧁' },
    { id: 'pizza', name: 'pizza', plural: 'pizzas', icon: '🍕' },
    { id: 'candy', name: 'candy', plural: 'candies', icon: '🍬' }
  ];
  var BY = {};
  FOODS.forEach(function (f) { BY[f.id] = f; });

  var PART_ALIAS = {
    banana: 'banana_v1', bread: 'bread_v1', sandwich: 'sandwich_v1', taco: 'taco_v1',
    donut: 'donut_v1', cookie: 'cookie_v1', tangerine: 'orange_v1', orange: 'orange_v1',
    pretzel: 'pretzel_v1', carrot: 'carrot_v2', broccoli: 'broccoli_v1'
  };
  var ART = {
    canvas: 512, groundY: 408, seat: [300, 220],
    wheelScale: 0.3, wheelCenter: [256, 256],
    axleBack: [152, 348], axleFront: [372, 348],
    spoilerFoot: [108, 198],
    spoilerFeet: { lettuce_v2: [138, 198] },
    mounts: {
      banana_v1: [113, 195], banana_v2: [113, 194],
      bread_v1: [128, 184], bread_v2: [128, 205],
      sandwich_v1: [112, 133], sandwich_v2: [128, 194],
      taco_v1: [128, 216], taco_v2: [128, 216],
      hotdog_v2: [127, 203], watermelon_v1: [113, 177],
      cupcake_v1: [127, 158], muffin_v2: [128, 158],
      pickle_v1: [127, 211]
    },
    seats: {
      cupcake_v1: [300, 111],
      muffin_v2: [300, 100]
    }
  };
  var PARTS = {
    body: [
      { id: 'banana_v1', name: 'Banana', cost: 0 },
      { id: 'banana_v2', name: 'Ripe Banana', cost: 12 },
      { id: 'bread_v1', name: 'Bread', cost: 0 },
      { id: 'bread_v2', name: 'Toasty Bread', cost: 12 },
      { id: 'sandwich_v1', name: 'Sandwich', cost: 16 },
      { id: 'sandwich_v2', name: 'Tall Sandwich', cost: 18 },
      { id: 'taco_v1', name: 'Taco', cost: 20 },
      { id: 'taco_v2', name: 'Crunchy Taco', cost: 22 },
      { id: 'watermelon_v1', name: 'Watermelon', cost: 16 },
      { id: 'hotdog_v2', name: 'Hot Dog', cost: 18 },
      { id: 'pickle_v1', name: 'Pickle', cost: 20 },
      { id: 'cupcake_v1', name: 'Cupcake', cost: 22 },
      { id: 'muffin_v2', name: 'Muffin', cost: 24 }
    ],
    wheels: [
      { id: 'donut_v1', name: 'Donut', cost: 0 },
      { id: 'donut_v2', name: 'Frosted Donut', cost: 10 },
      { id: 'cookie_v1', name: 'Cookie', cost: 0 },
      { id: 'cookie_v2', name: 'Choco Cookie', cost: 10 },
      { id: 'orange_v1', name: 'Orange', cost: 12 },
      { id: 'orange_v2', name: 'Juicy Orange', cost: 14 },
      { id: 'waffle_v1', name: 'Waffle', cost: 14 },
      { id: 'waffle_v2', name: 'Berry Waffle', cost: 16 },
      { id: 'cucumber_v1', name: 'Cucumber', cost: 16 },
      { id: 'cucumber_v2', name: 'Garden Cucumber', cost: 18 },
      { id: 'pizza_v1', name: 'Mini Pizza', cost: 18 },
      { id: 'pizza_v2', name: 'Pizza Slice', cost: 20 }
    ],
    spoiler: [
      { id: 'pretzel_v1', name: 'Pretzel', cost: 0 },
      { id: 'carrot_v2', name: 'Carrot', cost: 14 },
      { id: 'broccoli_v1', name: 'Broccoli', cost: 16 },
      { id: 'lettuce_v1', name: 'Lettuce', cost: 18 },
      { id: 'candycane_v1', name: 'Candy Cane', cost: 20 },
      { id: 'lettuce_v2', name: 'Lettuce Wing', cost: 22 }
    ],
    paint: [
      { id: 'natural', name: 'Natural', cost: 0 },
      { id: 'berry', name: 'Berry', cost: 8 },
      { id: 'leaf', name: 'Leaf', cost: 8 },
      { id: 'sunset', name: 'Sunset', cost: 10 }
    ],
    sticker: [
      { id: 'none', name: 'None', icon: '', cost: 0 },
      { id: 'star', name: 'Star', icon: '⭐', cost: 10 },
      { id: 'heart', name: 'Heart', icon: '❤️', cost: 10 },
      { id: 'blossom', name: 'Blossom', icon: '🌼', cost: 10 }
    ],
    horn: [
      { id: 'none', name: 'None', cost: 0 },
      { id: 'bell', name: 'Bell', icon: '🔔', cost: 12 }
    ],
    trail: [
      { id: 'none', name: 'None', cost: 0 },
      { id: 'crumbs', name: 'Crumbs', icon: '🍪', cost: 12 },
      { id: 'sparkle', name: 'Sparkle', icon: '⭐', cost: 14 }
    ]
  };

  var TRACKS = {
    picnic: { id: 'picnic', name: 'Picnic Park', cost: 0, friendPace: 95, bossPace: 102, obstacles: 3 },
    candy: { id: 'candy', name: 'Candy Lane', cost: 25, friendPace: 98, bossPace: 102, obstacles: 4 },
    pizza: { id: 'pizza', name: 'Pizza Speedway', cost: 25, friendPace: 100, bossPace: 103, obstacles: 5 }
  };

  function rank(id) {
    return id === 'toddler' ? 0 : id === 'pre' ? 1 : id === 'k' ? 2 : id === 'g1' ? 3 : 4;
  }
  function bandFor(p) {
    var age = A.Age && A.Age.band ? A.Age.band(p) : 'none';
    var tod = A.toddler ? A.toddler(p) : age === 'toddler';
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
      id: id, toddler: id === 'toddler',
      picture: id === 'toddler' || id === 'pre' || id === 'k',
      words: id === 'g1' || id === 'g2'
    };
  }

  function rngOf(rng) { return typeof rng === 'function' ? rng : Math.random; }
  function num(rng, lo, hi) { return lo + Math.floor(rngOf(rng)() * (hi - lo + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rngOf(rng)() * arr.length)]; }
  function shuffle(rng, arr) {
    var a = arr.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(rngOf(rng)() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function friendsOf(p) {
    var list = (A.Friends && A.Friends.of) ? A.Friends.of(p) : ((p && p.met) || ['strawberry', 'apple', 'corn', 'blueberry']);
    return (list || []).slice();
  }
  /* Never return an unmet friend. Prefer someone other than the player's own character. */
  function pickOpponent(p, want) {
    var ids = friendsOf(p);
    if (!ids.length) ids = ['strawberry', 'apple', 'corn', 'blueberry'];
    if (want && ids.indexOf(want) >= 0) return want;
    var self = p && p.blob, others = ids.filter(function (id) { return id !== self; });
    return others[0] || ids[0];
  }

  function makeQuestion(p, opt) {
    opt = opt || {};
    var rng = rngOf(opt.rng);
    var band = opt.band || bandFor(p);
    var tier = opt.tier || 0;
    var q, choices, i, n, food, foods, pics, right, wrong, vals, a, b, T, kind;
    if (band.id === 'toddler') {
      food = pick(rng, FOODS);
      foods = shuffle(rng, FOODS.filter(function (f) { return f.id !== food.id; })).slice(0, 2);
      foods.push(food);
      foods = shuffle(rng, foods);
      q = {
        kind: 'picture',
        text: 'Which one is the ' + food.name + '?',
        say: 'Which one is the ' + food.name + '?',
        pic: null, food: food.id,
        choices: foods.map(function (f) { return { id: f.id, label: f.name, icon: f.icon }; }),
        answer: foods.findIndex(function (f) { return f.id === food.id; })
      };
    } else if (band.id === 'pre' || band.id === 'k') {
      if (band.id === 'pre') {
        n = tier >= 2 ? num(rng, 3, 8) : (tier >= 1 ? num(rng, 2, 6) : num(rng, 1, 5));
      } else {
        n = tier >= 2 ? num(rng, 4, 10) : (tier >= 1 ? num(rng, 2, 8) : num(rng, 1, 6));
      }
      food = pick(rng, FOODS);
      pics = [];
      for (i = 0; i < n; i++) pics.push(food);
      right = n;
      vals = [right];
      var guard = 0, bump = 1;
      var cap = band.id === 'pre' ? 8 : 10;
      while (vals.length < 3 && guard++ < 40) {
        wrong = num(rng, 1, cap);
        if (vals.indexOf(wrong) < 0) vals.push(wrong);
      }
      while (vals.length < 3) {
        if (right + bump <= cap + 2 && vals.indexOf(right + bump) < 0) vals.push(right + bump);
        else if (right - bump >= 0 && vals.indexOf(right - bump) < 0) vals.push(right - bump);
        bump++;
      }
      vals = shuffle(rng, vals);
      q = {
        kind: 'count',
        text: 'How many ' + food.plural + '?',
        say: 'How many ' + food.plural + '?',
        pic: pics.map(function (f) { return f.id; }),
        food: food.id, count: n,
        choices: vals.map(function (v) { return { id: String(v), label: String(v), icon: null }; }),
        answer: vals.indexOf(right)
      };
    } else {
      var hard = band.id === 'g2';
      kind = (tier <= 0 ? (rng() < 0.7 ? 'add' : 'sub') : (tier === 1 ? (rng() < 0.5 ? 'add' : 'sub') : (hard ? (rng() < 0.35 ? 'add' : (rng() < 0.65 ? 'sub' : 'missing')) : (rng() < 0.45 ? 'add' : (rng() < 0.7 ? 'sub' : 'missing')))));
      if (kind === 'add') {
        a = (hard || tier >= 2) ? num(rng, 4, 9) : num(rng, 2, 6);
        b = (hard || tier >= 2) ? num(rng, 3, 9) : num(rng, 1, 5);
        if (a + b > 12 && tier < 2 && !hard) b = num(rng, 1, 4);
        T = a + b;
        q = { kind: 'add', text: "What's " + a + ' + ' + b + '?', say: "What's " + a + ' plus ' + b + '?', a: a, b: b };
      } else if (kind === 'sub') {
        a = (hard || tier >= 2) ? num(rng, 6, 12) : num(rng, 4, 10);
        b = (hard || tier >= 2) ? num(rng, 2, Math.min(8, a - 1)) : num(rng, 1, Math.min(5, a - 1));
        T = a - b;
        q = { kind: 'sub', text: "What's " + a + ' − ' + b + '?', say: "What's " + a + ' take away ' + b + '?', a: a, b: b };
      } else {
        a = hard ? num(rng, 3, 9) : num(rng, 2, 8);
        T = hard ? num(rng, 2, 8) : num(rng, 1, 6);
        b = a + T;
        q = { kind: 'missing', text: a + ' + ? = ' + b, say: a + ' plus what makes ' + b + '?', a: a, b: b };
      }
      vals = [T];
      var guard = 0, bump = 1;
      while (vals.length < 3 && guard++ < 40) {
        wrong = T + num(rng, -3, 3);
        if (wrong >= 0 && wrong !== T && vals.indexOf(wrong) < 0) vals.push(wrong);
      }
      while (vals.length < 3) {
        if (T + bump >= 0 && vals.indexOf(T + bump) < 0) vals.push(T + bump);
        else if (T - bump >= 0 && vals.indexOf(T - bump) < 0) vals.push(T - bump);
        bump++;
      }
      vals = shuffle(rng, vals);
      q.pic = null;
      q.choices = vals.map(function (v) { return { id: String(v), label: String(v), icon: null }; });
      q.answer = vals.indexOf(T);
    }
    return q;
  }

  function defaultGarage() {
    return {
      owned: {
        body: ['banana_v1', 'bread_v1'],
        wheels: ['donut_v1', 'cookie_v1'],
        spoiler: ['pretzel_v1'],
        paint: ['natural'],
        sticker: ['none'],
        horn: ['none'],
        trail: ['none']
      },
      car: {
        body: 'banana_v1', wheels: 'donut_v1', spoiler: 'pretzel_v1',
        paint: 'natural', sticker: 'none', horn: 'none', trail: 'none',
        speedLv: 0, handleLv: 0
      },
      tracks: { picnic: true, candy: false, pizza: false }
    };
  }

  function migrateId(kind, id) {
    if (!id || typeof id !== 'string') return id;
    if (kind === 'paint' || kind === 'sticker' || kind === 'horn' || kind === 'trail' || kind === 'track' || kind === 'upgrade') return id;
    return PART_ALIAS[id] || id;
  }
  function uniq(arr) {
    var out = [], i, x;
    for (i = 0; i < arr.length; i++) {
      x = arr[i];
      if (x && out.indexOf(x) < 0) out.push(x);
    }
    return out;
  }
  function garageOf(family) {
    family = family || {};
    if (typeof family.coins !== 'number') family.coins = 0;
    if (!family.racers || typeof family.racers !== 'object') family.racers = defaultGarage();
    var d = defaultGarage(), g = family.racers, k, i;
    if (!g.owned) g.owned = d.owned;
    for (k in g.owned) {
      if (Object.prototype.toString.call(g.owned[k]) === '[object Array]') {
        g.owned[k] = uniq(g.owned[k].map(function (id) { return migrateId(k, id); }));
      }
    }
    for (k in d.owned) {
      if (!g.owned[k]) g.owned[k] = d.owned[k].slice();
      for (i = 0; i < d.owned[k].length; i++) if (g.owned[k].indexOf(d.owned[k][i]) < 0) g.owned[k].push(d.owned[k][i]);
    }
    if (!g.car) g.car = d.car;
    for (k in d.car) if (g.car[k] == null) g.car[k] = d.car[k];
    g.car.body = migrateId('body', g.car.body);
    g.car.wheels = migrateId('wheels', g.car.wheels);
    g.car.spoiler = migrateId('spoiler', g.car.spoiler);
    if (!g.tracks) g.tracks = d.tracks;
    if (!g.tracks.picnic) g.tracks.picnic = true;
    return g;
  }

  function upgradeCost(lv) {
    lv = lv || 0;
    return UPGRADE_COST[Math.min(lv, UPGRADE_COST.length - 1)];
  }
  function findPart(kind, id) {
    id = migrateId(kind, id);
    var list = PARTS[kind] || [], i;
    for (i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    if (kind === 'track') return TRACKS[id] || null;
    if (kind === 'upgrade') return { id: id, name: id === 'speed' ? 'Speed' : 'Handling', cost: upgradeCost(0) };
    return null;
  }
  function owned(g, kind, id) {
    id = migrateId(kind, id);
    if (kind === 'track') return !!(g.tracks && g.tracks[id]);
    if (kind === 'upgrade') return false;
    return !!(g.owned[kind] && g.owned[kind].indexOf(id) >= 0);
  }
  function buy(family, kind, id) {
    id = migrateId(kind, id);
    var g = garageOf(family), item = findPart(kind, id), cost;
    if (!item) return { ok: false, why: 'unknown' };
    if (kind === 'upgrade') {
      var lv = id === 'speed' ? g.car.speedLv : g.car.handleLv;
      if (lv >= 3) return { ok: false, why: 'max' };
      cost = upgradeCost(lv);
      if ((family.coins || 0) < cost) return { ok: false, why: 'coins' };
      family.coins -= cost;
      if (id === 'speed') g.car.speedLv++; else g.car.handleLv++;
      return { ok: true, family: family, garage: g };
    }
    if (owned(g, kind, id)) return { ok: false, why: 'owned' };
    cost = item.cost || 0;
    if ((family.coins || 0) < cost) return { ok: false, why: 'coins' };
    family.coins -= cost;
    if (kind === 'track') g.tracks[id] = true;
    else {
      g.owned[kind] = g.owned[kind] || [];
      g.owned[kind].push(id);
      g.car[kind] = id;
    }
    return { ok: true, family: family, garage: g };
  }
  function equip(family, kind, id) {
    id = migrateId(kind, id);
    var g = garageOf(family);
    if (kind === 'upgrade' || kind === 'track') return { ok: false, why: 'kind' };
    if (!owned(g, kind, id)) return { ok: false, why: 'owned' };
    g.car[kind] = id;
    return { ok: true, garage: g };
  }

  function playerBase(family) {
    var g = garageOf(family);
    return BASE * (1 + 0.01 * (g.car.speedLv || 0));
  }
  function playerBoost(family) {
    var g = garageOf(family);
    return BOOST * (1 + 0.015 * (g.car.handleLv || 0));
  }
  function oppPace(track, mode, bestPace, band) {
    var t = TRACKS[track] || TRACKS.picnic;
    if (mode === 'boss') return t.bossPace;
    if (mode === 'best') return (bestPace || t.friendPace) * GHOST;
    var pace = t.friendPace;
    /* Ages 4–5 first Picnic Park friend uses the usual 7/10 bar (same friendPace as ages 6–7). Later tracks keep the usual ramp. */
    return pace;
  }


  function factKey(q) {
    if (!q) return '';
    if (q.kind === 'count') return 'c:' + q.food + ':' + q.count;
    if (q.a != null && q.b != null) return (q.kind || 'f') + ':' + q.a + ':' + q.b + ':' + (q.op || '');
    return 't:' + String(q.text || '');
  }
  function buildQuestions(p, band, tier, rng) {
    var qs = [], i, recent = [], q, g = 0, key;
    for (i = 0; i < NQ; i++) {
      g = 0;
      do { q = makeQuestion(p, { band: band, tier: tier, rng: rng }); key = factKey(q); } while (recent.indexOf(key) >= 0 && g++ < 24);
      qs.push(q);
      recent.push(key);
      if (recent.length > 3) recent.shift();
    }
    return qs;
  }
  function makeSide(p, rng) {
    var band = bandFor(p);
    var tier = (p && p.games && p.games.racers && p.games.racers.tier) || 0;
    return {
      id: p && p.id, name: (p && p.name) || 'Player', blob: p && p.blob, guest: !!(p && p.guest),
      band: band, tier: tier,
      i: 0, n: NQ, items: buildQuestions(p, band, tier, rng),
      answers: [], dist: 0,
      base: BASE, boost: BOOST,
      phase: 'question', done: false
    };
  }
  function startTwoRace(p, family, opt, trackId, rng) {
    var p2 = opt && opt.p2;
    if (!p2) return null;
    var s0 = makeSide(p, rng), s1 = makeSide(p2, rng);
    return {
      mode: 'two', track: trackId, boss: false,
      friend: p2.blob,
      sides: [s0, s1],
      p2: p2,
      phase: 'question',
      i: 0, n: NQ, items: s0.items, answers: s0.answers,
      playerDist: 0, oppDist: 0,
      base: BASE, boost: BOOST, oppPace: 0,
      obstacles: [], obstacle: null,
      startedAt: (opt && opt.now) || 0,
      finishedAt: 0, time: 0,
      win: false, place: 0, coins: 0, newBest: false, tie: false, winner: null,
      rng: rng
    };
  }
  function sideOf(race, who) {
    if (!race || race.mode !== 'two' || !race.sides) return null;
    return race.sides[who === 1 || who === '1' ? 1 : 0] || null;
  }

  function startRace(p, family, opt) {
    opt = opt || {};
    var trackId = opt.track || 'picnic';
    var g = garageOf(family);
    if (!g.tracks[trackId]) trackId = 'picnic';
    var track = TRACKS[trackId];
    var mode = opt.mode || 'friend';
    if (mode !== 'boss' && mode !== 'best' && mode !== 'two') mode = 'friend';
    var band = bandFor(p);
    var tier = (opt.tier != null) ? opt.tier : ((p && p.games && p.games.racers && p.games.racers.tier) || 0);
    var rng = rngOf(opt.rng);
    if (mode === 'two') {
      var two = startTwoRace(p, family, opt, trackId, rng);
      if (two) return two;
      mode = 'friend';
    }
    var qs = [], i, used = {}, recent = [];
    function factKey(q) {
      if (!q) return '';
      if (q.kind === 'count') return 'c:' + q.food + ':' + q.count;
      if (q.a != null && q.b != null) return (q.kind || 'f') + ':' + q.a + ':' + q.b + ':' + (q.op || '');
      return 't:' + String(q.text || '');
    }
    for (i = 0; i < NQ; i++) {
      var q, g = 0, key;
      do { q = makeQuestion(p, { band: band, tier: tier, rng: rng }); key = factKey(q); } while (recent.indexOf(key) >= 0 && g++ < 24);
      qs.push(q);
      recent.push(key);
      if (recent.length > 3) recent.shift();
    }
    var nObs = mode === 'boss' ? track.obstacles : 0;
    var slots = [], obs = [];
    for (i = 1; i < NQ; i++) slots.push(i);
    slots = shuffle(rng, slots);
    for (i = 0; i < nObs && i < slots.length; i++) obs.push(slots[i]);
    obs.sort(function (a, b) { return a - b; });
    var best = (p && p.games && p.games.racers && p.games.racers.best && p.games.racers.best[trackId]) || null;
    var race = {
      mode: mode, track: trackId, boss: mode === 'boss',
      friend: pickOpponent(p, opt.friend),
      band: band, tier: tier,
      i: 0, n: NQ, items: qs,
      answers: [],
      playerDist: 0, oppDist: 0,
      base: playerBase(family), boost: playerBoost(family),
      oppPace: oppPace(trackId, mode, best && best.pace, band),
      obstacles: obs,
      obstacle: nObs && obs.indexOf(0) >= 0 ? pick(rng, FOODS).id : null,
      phase: 'question',
      startedAt: opt.now || 0,
      finishedAt: 0, time: 0,
      win: false, place: 0, coins: 0, newBest: false,
      rng: rng
    };
    return race;
  }

  function current(race, who) {
    if (race && race.mode === 'two') {
      var s = sideOf(race, who == null ? 0 : who);
      return s && s.items && s.items[s.i] || null;
    }
    return race && race.items && race.items[race.i] || null;
  }

  function applyAnswer(race, choice, family, p, opt) {
    opt = opt || {};
    if (race && race.mode === 'two') return applyTwoAnswer(race, choice, family, p, opt);
    if (!race || race.phase !== 'question') return null;
    var q = current(race);
    if (!q) return null;
    var correct = (+choice === q.answer);
    var ms = opt.ms == null ? 800 : Math.max(0, opt.ms);
    race.answers.push({ i: race.i, correct: correct, ms: ms, obstacle: race.obstacle });
    if (correct) {
      race.playerDist += race.base + race.boost;
      race.obstacle = null;
    } else {
      var pen = race.obstacle ? MISS_PENALTY : 0;
      race.playerDist += Math.max(0, race.base - pen);
      race.obstacle = null;
    }
    race.oppDist += race.oppPace;
    if (correct && !race._streak) race._streak = 0;
    if (correct) { race._streak = (race._streak || 0) + 1; race._misses = 0; }
    else { race._streak = 0; race._misses = (race._misses || 0) + 1; }
    race.i++;
    if (race.i >= race.n || race.playerDist >= TRACK_LEN) return finishRace(race, family, p, opt);
    race.phase = 'drive';
    race.obstacle = (race.obstacles.indexOf(race.i) >= 0) ? pick(rngOf(race.rng), FOODS).id : null;
    return { correct: correct, race: race, done: false };
  }

  function nextQuestion(race, who) {
    if (!race || race.phase === 'podium') return race;
    if (race.mode === 'two') {
      if (who == null) {
        if (race.sides) race.sides.forEach(function (s) {
          if (s && !s.done && s.phase === 'drive') s.phase = 'question';
        });
      } else {
        var s = sideOf(race, who);
        if (s && !s.done && s.phase === 'drive') s.phase = 'question';
      }
      return race;
    }
    if (race.i >= race.n || race.playerDist >= TRACK_LEN) return race;
    race.phase = 'question';
    return race;
  }

  function applyTwoAnswer(race, choice, family, p, opt) {
    opt = opt || {};
    var who = (opt.who === 1 || opt.who === '1') ? 1 : 0;
    var s = sideOf(race, who);
    if (!s || s.done || s.phase !== 'question') return null;
    var q = s.items && s.items[s.i];
    if (!q) return null;
    var correct = (+choice === q.answer);
    var ms = opt.ms == null ? 800 : Math.max(0, opt.ms);
    s.answers.push({ i: s.i, correct: correct, ms: ms });
    if (correct) s.dist += s.base + s.boost;
    else s.dist += s.base;
    s.i++;
    if (s.i >= s.n || s.dist >= TRACK_LEN) { s.done = true; s.phase = 'done'; }
    else s.phase = 'drive';
    race.playerDist = race.sides[0].dist;
    race.oppDist = race.sides[1].dist;
    if (race.sides[0].done && race.sides[1].done) return finishTwoRace(race, family, p, opt);
    return { correct: correct, race: race, done: false, who: who };
  }

  function noteTwoStats(pl, race, correct, won) {
    if (!pl || pl.guest) return;
    var st = (pl.games = pl.games || {}).racers = pl.games.racers || { races: 0, wins: 0, best: {}, tier: 0 };
    st.races = (st.races || 0) + 1;
    if (won) st.wins = (st.wins || 0) + 1;
    st.right = (st.right || 0) + correct;
  }

  function finishTwoRace(race, family, p, opt) {
    opt = opt || {};
    var s0 = race.sides[0], s1 = race.sides[1];
    var c0 = s0.answers.filter(function (a) { return a.correct; }).length;
    var c1 = s1.answers.filter(function (a) { return a.correct; }).length;
    race.playerDist = s0.dist;
    race.oppDist = s1.dist;
    race.tie = s0.dist === s1.dist;
    race.win = s0.dist > s1.dist;
    race.winner = race.tie ? null : (race.win ? 0 : 1);
    race.place = race.tie ? 0 : (race.win ? 1 : 2);
    race.correct = [c0, c1];
    race.coins = race.tie ? 4 : 6;
    race.phase = 'podium';
    race.finishedAt = opt.now || race.startedAt || 0;
    if (family) family.coins = (family.coins || 0) + race.coins;
    noteTwoStats(p, race, c0, race.winner === 0);
    noteTwoStats(race.p2, race, c1, race.winner === 1);
    return { correct: s0.answers.length ? s0.answers[s0.answers.length - 1].correct : false, race: race, done: true };
  }


  function coinsFor(win, correct) {
    if (win) return 5 + Math.min(3, Math.max(0, correct - 7));
    return 2 + (correct >= 5 ? 1 : 0);
  }

  function finishRace(race, family, p, opt) {
    opt = opt || {};
    var correct = race.answers.filter(function (a) { return a.correct; }).length;
    var think = 0, i;
    for (i = 0; i < race.answers.length; i++) think += race.answers[i].ms || 0;
    race.time = 8000 + think + (race.n - correct) * 400;
    race.finishedAt = (opt.now || race.startedAt || 0) + race.time;
    race.win = race.playerDist >= race.oppDist;
    race.place = race.win ? 1 : 2;
    race.coins = coinsFor(race.win, correct);
    race.phase = 'podium';
    race.correct = correct;
    if (family) family.coins = (family.coins || 0) + race.coins;
    var pace = race.playerDist / Math.max(1, race.n);
    if (p) {
      var st = (p.games = p.games || {}).racers = p.games.racers || { races: 0, wins: 0, best: {}, tier: 0 };
      st.races = (st.races || 0) + 1;
      if (race.win) st.wins = (st.wins || 0) + 1;
      st.right = (st.right || 0) + correct;
      var prev = (st.best || {})[race.track];
      if (race.win && (!prev || race.time < prev.time)) {
        st.best = st.best || {};
        st.best[race.track] = { time: race.time, pace: pace };
        race.newBest = true;
      }
      if (race._streak >= 2 && (st.tier || 0) < 2) { st.tier = (st.tier || 0) + 1; }
      if ((race._misses || 0) >= 2 && (st.tier || 0) > 0) { st.tier = st.tier - 1; }
      race.tierNext = st.tier || 0;
    }
    return { correct: race.answers[race.answers.length - 1].correct, race: race, done: true };
  }

  function neededToWin(track, mode, family, bestPace, band) {
    var base = playerBase(family), boost = playerBoost(family);
    var pace = oppPace(track, mode, bestPace, band);
    var k = 0;
    while (k <= NQ && (base * NQ + boost * k) < pace * NQ) k++;
    return k;
  }

  function partFile(kind, id) {
    id = migrateId(kind, id);
    if (kind === 'body') return 'bodies/body_' + id + '.png';
    if (kind === 'body_front') return 'bodies/body_' + id + '_front.png';
    if (kind === 'wheels') return 'wheels/wheel_' + id + '.png';
    if (kind === 'spoiler') return 'spoilers/spoiler_' + id + '.png';
    return '';
  }
  function partSrc(kind, id, root) {
    var f = partFile(kind, id);
    return f ? ((root || '') + 'art/racers/' + f) : '';
  }
  function spoilerMount(bodyId) {
    bodyId = migrateId('body', bodyId);
    return ART.mounts[bodyId] || ART.mounts.banana_v1;
  }
  function spoilerFoot(id) {
    id = migrateId('spoiler', id);
    return (ART.spoilerFeet && ART.spoilerFeet[id]) || ART.spoilerFoot;
  }
  function seatOf(bodyId) {
    bodyId = migrateId('body', bodyId);
    return ART.seats[bodyId] || ART.seat;
  }

  var TRACK_ART = {
    picnic: {
      style: 'A',
      layers: ['tile', 'road'],
      farRate: 0.55,
      roadRate: 1,
      tileSize: { landscape: [791, 640], portrait: [890, 720] },
      files: {
        tile: { landscape: 'track/track_A_tile_landscape.webp', portrait: 'track/track_A_tile_portrait.webp' },
        road: { landscape: 'track/track_A_road_landscape.webp', portrait: 'track/track_A_road_portrait.webp' }
      }
    },
    candy: { folder: 'bg_candy_lane_v4', layers: ['sky', 'far', 'mid', 'road', 'near'] },
    pizza: { folder: 'bg_pizza_speedway_v4', layers: ['sky', 'mid', 'road', 'near'] }
  };
  function trackLayerSrc(track, layer, root, orient) {
    var t = TRACK_ART[track] || TRACK_ART.picnic;
    if (t.style === 'A' && t.files) {
      var rec = t.files[layer] || t.files.tile;
      var o = (orient === 'portrait' || orient === 'landscape') ? orient : 'landscape';
      return (root || '') + 'art/racers/' + rec[o];
    }
    return (root || '') + 'art/racers/env/tracks/layers/' + t.folder + '/' + layer + '.png';
  }

  A.Racers = {
    NQ: NQ, TRACK_LEN: TRACK_LEN, BASE: BASE, BOOST: BOOST, reachedFinish: function (d) { return d >= TRACK_LEN; }, GHOST: GHOST, UPGRADE_COST: UPGRADE_COST, MISS_PENALTY: MISS_PENALTY, FOODS: FOODS, BY: BY, PARTS: PARTS, TRACKS: TRACKS,
    PART_ALIAS: PART_ALIAS, ART: ART,
    migrateId: migrateId, partFile: partFile, partSrc: partSrc, spoilerMount: spoilerMount, spoilerFoot: spoilerFoot, seatOf: seatOf,
    TRACK_ART: TRACK_ART, trackLayerSrc: trackLayerSrc,
    bandFor: bandFor, makeQuestion: makeQuestion,
    friendsOf: friendsOf, pickOpponent: pickOpponent,
    defaultGarage: defaultGarage, garageOf: garageOf,
    findPart: findPart, upgradeCost: upgradeCost, buy: buy, equip: equip, owned: owned,
    playerBase: playerBase, playerBoost: playerBoost, oppPace: oppPace,
    startRace: startRace, current: current, applyAnswer: applyAnswer, sideOf: sideOf,
    nextQuestion: nextQuestion, finishRace: finishRace, coinsFor: coinsFor,
    neededToWin: neededToWin
  };
})(window.Arcade);
