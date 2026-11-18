/* Picnic Packer: pure order rules. rng injection supports reproducible orders; no storage or DOM here. */
(function (A) {
  'use strict';

  var FOODS = [
    { id: 'strawberry', name: 'strawberry', plural: 'strawberries', icon: 'food.strawberry' },
    { id: 'lemon', name: 'lemon', plural: 'lemons', icon: 'food.lemon' },
    { id: 'banana', name: 'banana', plural: 'bananas', icon: 'food.banana' },
    { id: 'blueberry', name: 'blueberry', plural: 'blueberries', icon: 'food.blueberry' },
    { id: 'grapes', name: 'grape', plural: 'grapes', icon: 'food.grapes' },
    { id: 'cookie', name: 'cookie', plural: 'cookies', icon: 'food.cookie' },
    { id: 'cupcake', name: 'cupcake', plural: 'cupcakes', icon: 'food.cupcake' },
    { id: 'pancake', name: 'pancake', plural: 'pancakes', icon: 'food.pancake' },
    { id: 'waffle', name: 'waffle', plural: 'waffles', icon: 'food.waffle' },
    { id: 'donut', name: 'donut', plural: 'donuts', icon: 'food.donut' },
    { id: 'apple', name: 'apple', plural: 'apples', icon: 'food.red_apple' },
    { id: 'carrot', name: 'carrot', plural: 'carrots', icon: 'food.carrot' },
    { id: 'cheese', name: 'cheese', plural: 'pieces of cheese', icon: 'food.cheese' },
    { id: 'peach', name: 'peach', plural: 'peaches', icon: 'food.peach' },
    { id: 'pear', name: 'pear', plural: 'pears', icon: 'food.pear' },
    { id: 'pineapple', name: 'pineapple', plural: 'pineapples', icon: 'food.pineapple' },
    { id: 'watermelon', name: 'watermelon', plural: 'watermelons', icon: 'food.watermelon' },
    { id: 'pizza', name: 'pizza', plural: 'pizzas', icon: 'food.pizza' },
    { id: 'taco', name: 'taco', plural: 'tacos', icon: 'food.taco' },
    { id: 'sandwich', name: 'sandwich', plural: 'sandwiches', icon: 'food.sandwich' },
    { id: 'tomato', name: 'tomato', plural: 'tomatoes', icon: 'food.tomato' },
    { id: 'pie', name: 'pie', plural: 'pies', icon: 'food.pie' },
    { id: 'cherries', name: 'cherry', plural: 'cherries', icon: 'food.cherries' },
    { id: 'candy', name: 'candy', plural: 'candies', icon: 'food.candy' },
    { id: 'ice_cream', name: 'ice cream', plural: 'ice creams', icon: 'gaps.ice_cream' },
    { id: 'coconut', name: 'coconut', plural: 'coconuts', icon: 'gaps.coconut' },
    { id: 'muffin', name: 'muffin', plural: 'muffins', icon: 'food.muffin' },
    { id: 'pretzel', name: 'pretzel', plural: 'pretzels', icon: 'food.pretzel' }
  ];
  var BY = {};
  FOODS.forEach(function (f) { BY[f.id] = f; });

  var DECOS = [
    { id: 'balloon', name: 'balloon', icon: 'object.balloon' },
    { id: 'tulip', name: 'tulip', icon: 'scenery.tulip' },
    { id: 'sunflower', name: 'sunflower', icon: 'scenery.sunflower' },
    { id: 'blossom', name: 'blossom', icon: 'scenery.blossom' },
    { id: 'cherry_blossom', name: 'cherry blossom', icon: 'scenery.cherry_blossom' },
    { id: 'kite', name: 'kite', icon: 'object.kite' },
    { id: 'umbrella', name: 'umbrella', icon: 'nature.umbrella' },
    { id: 'rainbow', name: 'rainbow', icon: 'scenery.rainbow' },
    { id: 'plant', name: 'plant', icon: 'nature.potted_plant' },
    { id: 'candle', name: 'candle', icon: 'scenery.candle' },
    { id: 'lantern', name: 'lantern', icon: 'object.lantern' },
    { id: 'bunting', name: 'bunting', icon: 'object.bunting' }
  ];

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
    var young = id === 'pre' || id === 'k';
    return {
      id: id, toddler: id === 'toddler',
      picture: id === 'toddler' || young,
      words: id === 'g1' || id === 'g2',
      maxCount: id === 'toddler' ? 3 : (id === 'pre' ? 8 : 10),
      maxFoods: id === 'toddler' ? 1 : (young ? 2 : 3)
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
  function noun(id, n) { var f = BY[id]; return !f ? id : (n === 1 ? f.name : f.plural); }
  function phrase(id, n) { return n + ' ' + noun(id, n); }
  function listPhrases(want) {
    var ids = Object.keys(want).filter(function (id) { return want[id] > 0; });
    return ids.map(function (id, i) {
      var p = phrase(id, want[id]);
      if (i === 0) return p;
      if (i === ids.length - 1) return (ids.length > 2 ? ', and ' : ' and ') + p;
      return ', ' + p;
    }).join('');
  }
  function keyOf(want) {
    return Object.keys(want).sort().map(function (id) { return id + ':' + want[id]; }).join(',');
  }
  function countsOf(items) {
    var o = {}, i;
    for (i = 0; i < items.length; i++) o[items[i].id] = (o[items[i].id] || 0) + 1;
    return o;
  }
  function sameCounts(a, b) {
    var ka = Object.keys(a).filter(function (k) { return a[k] > 0; }).sort();
    var kb = Object.keys(b).filter(function (k) { return b[k] > 0; }).sort();
    if (ka.length !== kb.length) return false;
    for (var i = 0; i < ka.length; i++) if (ka[i] !== kb[i] || a[ka[i]] !== b[kb[i]]) return false;
    return true;
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

  function pickFoods(rng, n, avoid) {
    var pool = FOODS.map(function (f) { return f.id; }).filter(function (id) { return !avoid || avoid.indexOf(id) < 0; });
    return shuffle(rng, pool).slice(0, n);
  }

  function orderText(kind, want, pre) {
    if (kind === 'add' || kind === 'sub') {
      var id = Object.keys(want)[0], have = (pre && pre[id]) || 0, need = want[id];
      return 'I have ' + have + ' ' + noun(id, have) + '. I need ' + need + '.';
    }
    if (kind === 'add2') {
      var ids = Object.keys(want), lines = [];
      ids.forEach(function (id) {
        lines.push('I have ' + ((pre && pre[id]) || 0) + ' ' + noun(id, (pre && pre[id]) || 0) + '. I need ' + want[id] + ' ' + noun(id, want[id]) + '.');
      });
      return lines.join(' ');
    }
    return 'Please pack ' + listPhrases(want) + '.';
  }

  function binsFor(rng, want, band, boss) {
    var need = Object.keys(want);
    var extra = band.toddler ? (boss ? 4 : 3) : (boss ? 5 : 4);
    var rest = pickFoods(rng, extra, need);
    return shuffle(rng, need.concat(rest));
  }

  function makeOrder(p, opt) {
    opt = opt || {};
    var band = opt.band || bandFor(p);
    var rng = opt.rng || Math.random;
    var boss = !!opt.boss;
    var streak = opt.streak || 0;
    var tier = opt.tier == null ? Math.min(2, Math.floor(streak / 2)) : opt.tier;
    var recent = opt.recent || [];
    var friendList = friendsOf(p);
    var friend = opt.friend || pick(rng, friendList);
    var want = {}, pre = {}, kind, i, tryN, key;

    for (tryN = 0; tryN < 16; tryN++) {
      want = {}; pre = {};
      if (band.id === 'toddler') {
        kind = 'picture';
        var tFoods = boss ? pickFoods(rng, 2) : pickFoods(rng, 1);
        if (boss) {
          want[tFoods[0]] = 2;
          want[tFoods[1]] = num(rng, 1, 2);
        } else {
          var tmax = tier <= 0 ? 1 : (tier === 1 ? 2 : 3);
          want[tFoods[0]] = num(rng, Math.max(1, tmax - 1), tmax);
        }
      } else if (band.id === 'pre' || band.id === 'k') {
        kind = 'count';
        // 4–5 year olds: at most two foods; the boss stays around 8 items.
        var pf = boss ? 2 : (tier >= 1 && (streak >= 2 || rng() < (band.id === 'k' ? 0.55 : 0.4)) ? 2 : 1);
        if (pf > 2) pf = 2;
        var pids = pickFoods(rng, pf);
        var left = boss ? 8 : (band.id === 'pre'
          ? (tier <= 0 ? 5 : (tier === 1 ? 7 : 8))
          : (tier <= 0 ? 6 : (tier === 1 ? 8 : 10)));
        for (i = 0; i < pids.length; i++) {
          var lo = boss ? 2 : (tier <= 0 ? 2 : 3);
          var hi = Math.min(band.maxCount, Math.max(lo, left - 2 * (pids.length - 1 - i)));
          var n = num(rng, lo, hi);
          want[pids[i]] = n;
          left -= n;
        }
      } else {
        // g1 / g2 written orders; g2 takes a small step up
        var hard = band.id === 'g2';
        var kinds = boss ? (hard ? ['add2', 'add2', 'add', 'sub'] : ['add2', 'add', 'sub'])
          : (tier <= 0 ? ['words'] : (tier === 1 ? ['words', 'words', 'add'] : (hard ? ['words', 'add', 'sub', 'add2'] : ['words', 'add', 'sub'])));
        kind = pick(rng, kinds);
        if (kind === 'words') {
          var gf = boss ? num(rng, 2, 3) : (tier >= 1 && rng() < 0.55 ? 2 : 1);
          var gids = pickFoods(rng, gf);
          for (i = 0; i < gids.length; i++) want[gids[i]] = num(rng, boss ? (hard ? 5 : 4) : 3, boss ? (hard ? 10 : 9) : (tier <= 0 ? 6 : 10));
        } else if (kind === 'add' || kind === 'sub') {
          var gid = pickFoods(rng, 1)[0];
          var needN, haveN;
          if (kind === 'add') {
            needN = num(rng, boss ? (hard ? 9 : 8) : (hard ? 7 : 6), hard ? 12 : 10);
            haveN = num(rng, 2, Math.min(4, needN - 3));
          } else {
            haveN = num(rng, boss ? (hard ? 9 : 8) : (hard ? 7 : 6), hard ? 12 : 10);
            needN = num(rng, 2, haveN - 2);
          }
          want[gid] = needN;
          pre[gid] = haveN;
        } else {
          // add2: two-food change problem (boss or high tier)
          var pair = pickFoods(rng, 2);
          for (i = 0; i < pair.length; i++) {
            var need2 = num(rng, hard ? 7 : 6, hard ? 12 : 10);
            var have2 = num(rng, 1, Math.min(4, need2 - 3));
            want[pair[i]] = need2;
            pre[pair[i]] = have2;
          }
        }
      }
      key = kind + '|' + keyOf(want);
      if (recent.indexOf(key) < 0) break;
    }


    if (boss && (band.id === 'g1' || band.id === 'g2')) {
      var cap = band.id === 'g2' ? 14 : 12, guardC = 0, kC, idsC;
      function itemCount(w) { var n = 0, k; for (k in w) n += w[k] || 0; return n; }
      while (itemCount(want) > cap && guardC++ < 40) {
        idsC = Object.keys(want).filter(function (k) { return want[k] > 1; });
        if (!idsC.length) break;
        idsC.sort(function (a, b) { return want[b] - want[a]; });
        want[idsC[0]]--;
      }
    }

    var text = orderText(kind === 'words' || kind === 'count' || kind === 'picture' ? kind : kind, want, pre);
    if (kind === 'count' || kind === 'picture' || kind === 'words') text = orderText('words', want, pre);
    var o = {
      friend: friend, boss: boss, want: want, pre: pre, kind: kind,
      text: text, say: text, bins: binsFor(rng, want, band, boss),
      deco: (opt.deco || pick(rng, DECOS).id), key: key
    };
    return o;
  }

  function fillPre(pre) {
    var items = [], id, n, k;
    pre = pre || {};
    for (id in pre) if (pre[id] > 0) {
      for (k = 0; k < pre[id]; k++) items.push({ id: id, uid: id + '-pre-' + k, pre: true });
    }
    return items;
  }

  function addItem(basket, id) {
    basket = basket || [];
    basket.push({ id: id, uid: id + '-' + Date.now() + '-' + basket.length, pre: false });
    return basket;
  }
  function takeOut(basket, uid) {
    return (basket || []).filter(function (it) { return it.uid !== uid; });
  }
  function matches(basket, want) { return sameCounts(countsOf(basket || []), want || {}); }
  function overfilled(basket, want) {
    var c = countsOf(basket || []), id;
    for (id in c) if (c[id] > ((want && want[id]) || 0)) return true;
    return false;
  }
  function overfilledId(basket, want) {
    var c = countsOf(basket || []), id;
    for (id in c) if (c[id] > ((want && want[id]) || 0) && want && want[id]) return id;
    for (id in c) if (c[id] > ((want && want[id]) || 0)) return id;
    return null;
  }
  function extraKinds(basket, want) {
    var c = countsOf(basket || []), out = [], id;
    for (id in c) if (c[id] > 0 && !(want && want[id])) out.push(id);
    return out;
  }
  function countLabel(basket) {
    var c = countsOf(basket || []), parts = [], id;
    for (id in c) if (c[id] > 0) parts.push(c[id] + ' ' + noun(id, c[id]));
    return parts.length ? parts.join(', ') : '0';
  }
  function missing(basket, want) {
    var c = countsOf(basket || []), out = {}, id;
    for (id in (want || {})) if ((c[id] || 0) < want[id]) out[id] = want[id] - (c[id] || 0);
    return out;
  }

  /* Session-only meadow spots. Type-specific first, then leftover generic edges. */
  var DECO_SLOTS = {
    bunting: ['bunting-top', 'bunting-top-2'],
    lantern: ['lantern-left', 'lantern-right'],
    balloon: ['balloon-left', 'balloon-right'],
    kite: ['kite-right'],
    tulip: ['flower-left'],
    sunflower: ['flower-right'],
    blossom: ['flower-left-2'],
    cherry_blossom: ['flower-right-2'],
    umbrella: ['ground-left'],
    rainbow: ['rainbow-top'],
    plant: ['ground-right'],
    candle: ['ground-left-2']
  };
  var FESTOON_SEQ = ['bunting', 'lantern', 'balloon', 'bunting', 'lantern'];
  var GENERIC_SLOTS = ['lantern-left', 'lantern-right', 'balloon-left', 'balloon-right', 'flower-left', 'flower-right', 'ground-left', 'ground-right'];

  function usedSlots(scene) {
    var used = {}, i;
    for (i = 0; i < (scene || []).length; i++) used[scene[i].slot] = true;
    return used;
  }
  function slotFor(id, scene) {
    var used = usedSlots(scene), list = (DECO_SLOTS[id] || []).concat(GENERIC_SLOTS), i, s;
    for (i = 0; i < list.length; i++) {
      s = list[i];
      if (!used[s]) return s;
    }
    return 'ground-right';
  }
  function nextDeco(g) {
    var usedId = {}, i, id, slots, n;
    (g.scene || []).forEach(function (d) { usedId[d.id] = (usedId[d.id] || 0) + 1; });
    for (i = 0; i < FESTOON_SEQ.length; i++) {
      id = FESTOON_SEQ[i];
      slots = DECO_SLOTS[id] || [id];
      n = usedId[id] || 0;
      if (n < slots.length) return id;
    }
    for (i = 0; i < DECOS.length; i++) if (!usedId[DECOS[i].id]) return DECOS[i].id;
    return DECOS[0].id;
  }
  function autoPlace(g) {
    var id = (g.order && g.order.deco) || nextDeco(g);
    var item = { id: id, slot: slotFor(id, g.scene) };
    g.scene = (g.scene || []).concat([item]);
    g.placedThis = null;
    return item;
  }

  function newSession(p, rng) {
    var saved = (p && p.games && p.games.packer && p.games.packer.scene) || [];
    return {
      band: bandFor(p), rng: rngOf(rng), i: 0, nFriend: 4, phase: 'ready',
      streak: 0, firstTry: true, nudged: false, misses: 0, tier: 0,
      order: null, basket: [], scene: saved.slice(), friend: null, recent: [],
      done: false, placedThis: null, timerOn: !!(p && p.games && p.games.packer && p.games.packer.timer)
    };
  }

  function nextOrder(g, p, opt) {
    opt = opt || {};
    if (g.done) return null;
    var boss = g.i >= g.nFriend;
    var o = makeOrder(p, {
      boss: boss, streak: g.streak, tier: g.tier, recent: g.recent,
      rng: opt.rng || g.rng, band: g.band, friend: opt.friend, deco: opt.deco || nextDeco(g)
    });
    g.order = o; g.basket = fillPre(o.pre); g.phase = 'order'; g.friend = o.friend;
    g.firstTry = true; g.nudged = false; g.i++; g.recent.push(o.key);
    if (g.recent.length > 12) g.recent.shift();
    return o;
  }

  function complete(g) {
    if (g.phase !== 'order' || !g.order || !matches(g.basket, g.order.want)) return false;
    if (g.firstTry && !g.nudged) { g.streak++; if (g.streak >= 2 && g.tier < 2) { g.tier++; g.streak = 0; } }
    else { g.streak = 0; }
    if (g.order.boss) g.done = true;
    autoPlace(g);
    g.phase = g.done ? 'win' : 'ready';
    return true;
  }

  function failNudge(g) {
    if (g.phase !== 'order') return;
    g.nudged = true; g.firstTry = false; g.misses++;
    if (g.misses >= 2 && g.tier > 0) { g.tier--; g.misses = 0; }
  }

  function saveState(p, g) {
    if (!p) return null;
    var st = p.games.packer = p.games.packer || { sessions: 0, orders: 0, timer: false };
    st.timer = !!g.timerOn;
    st.scene = (g.scene || []).map(function (d) { return { id: d.id, slot: d.slot, x: d.x, y: d.y }; });
    return st;
  }

  A.Packer = {
    FOODS: FOODS, BY: BY, DECOS: DECOS, bandFor: bandFor, makeOrder: makeOrder,
    fillPre: fillPre, addItem: addItem, takeOut: takeOut, countsOf: countsOf,
    matches: matches, overfilled: overfilled, overfilledId: overfilledId, extraKinds: extraKinds, countLabel: countLabel, missing: missing, sameCounts: sameCounts,
    phrase: phrase, listPhrases: listPhrases, noun: noun,
    newSession: newSession, nextOrder: nextOrder, complete: complete,
    failNudge: failNudge, autoPlace: autoPlace, nextDeco: nextDeco, saveState: saveState, friendsOf: friendsOf
  };
})(window.Arcade);
