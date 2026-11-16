/* Picnic Pals — Lemonade Stand (stand1, 2026-10-28): menu, order/money step ladders and the day plan. No DOM here
   (games/stand/stand.js draws it; tools/stand-sim.js and _test/stand1-test.js run it in Node).
   LADDERS plug in with A.Stand.ladder({ id, name, gate(p), top(p), steps: [{ id, name, band, params(ctx), build(params, ctx) }] }).
   Version 1 has two: 'orders' (fill the order) and 'money' (whole-dollar cartoon bills only: no coins, no change).
   Later (not built): a 'change' ladder gated on the cash-register upgrade, and appliance upgrades (blender first, then toaster
   and oven) registered with A.Stand.upgrade({ id, name, items: [menu item ids it unlocks] }); menu items with needs: 'blender'
   only appear once the kid owns that upgrade (p.games.stand.up[id]).
   Step rules follow steps-math.js (§0-3), applied to stand answers (one answer = one customer's order or payment):
     mastery 12+ answers at 85%+ on 2+ days (a fix after an oops counts half); nearly-there: 30+ answers at 80%+ on 3+ days;
     fast-skip after 5 fast first-try right answers in a row (never at 2-3); warm-up probe when a ladder first opens above its
     first step (strided picks, stops at the first miss); picture hints only after a miss (stand.js); missed orders come back
     (next day, then 1, 3, 7, 14 days; graduate after first-try right on 3 days; at most 30% of customers);
     stuck: 3 misses in 5 → one easier customer (at most 2 a day per step, never 2 in a row); plateau (30+ answers, last 20
     10 points under the bar) → step down one step; easy-round cap: at the top of a band the top steps take turns.
   Money opens from MATH MASTERY, not age: counting to 10 mastered (earned, or placed by a played warm-up/check, or a later math
   step earned), or the stand's own counted-order step (to 10) mastered. Toddlers (2-3) never see money at all. */
(function (A) {
  'use strict';
  var DAY = 864e5, NOWF = function () { return Date.now(); };
  function now() { return NOWF(); }
  function today() { var d = new Date(now()); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  var RNG = Math.random;
  function rnd(a, b) { return a + Math.floor(RNG() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(RNG() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(RNG() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function seed01(str) { var x = 2166136261 >>> 0; for (var i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } x ^= x >>> 13; x = Math.imul(x, 0x5bd1e995) >>> 0; x ^= x >>> 15; return (x >>> 0) / 4294967296; }

  /* ---------- menu (stand-r1, 2026-11-05): lemonade ingredients that go into a pitcher, plus unlockable flavors ----------
     kinds: 'main' = the fruit in the pitcher (lemon always; a flavor fruit only once that flavor is unlocked), 'add' = sugar, ice,
     honey, mint, 'top' = a garnish (cherry, orange slice; the silly pickle), 'cup' = an empty cup (Double it: "2 cups with 3 ice each"). */
  var ITEMS = [
    { id: 'lemon', round: true, e: '🍋', kind: 'main', name: 'lemon', pl: 'lemons', color: 'yellow' },
    { id: 'strawberry', e: '🍓', kind: 'main', flavor: 'strawberry', name: 'strawberry', pl: 'strawberries', color: 'red' },
    { id: 'raspberry', round: true, e: '', svg: 'rasp', kind: 'main', flavor: 'raspberry', name: 'raspberry', pl: 'raspberries', color: 'pink' },
    { id: 'blueberry', round: true, e: '🫐', kind: 'main', flavor: 'blueberry', name: 'blueberry', pl: 'blueberries', color: 'blue' },
    { id: 'peach', round: true, e: '🍑', kind: 'main', flavor: 'peach', name: 'peach', pl: 'peaches', color: 'orange' },
    { id: 'kiwi', round: true, e: '🥝', kind: 'main', flavor: 'kiwi', name: 'kiwi', pl: 'kiwis', color: 'green' },
    { id: 'sugar', e: '', svg: 'sugar', kind: 'add', name: 'sugar cube', pl: 'sugar cubes', color: 'white' },
    { id: 'ice', e: '🧊', kind: 'add', name: 'ice cube', pl: 'ice cubes', color: 'blue' },
    { id: 'mint', e: '🌿', kind: 'add', name: 'mint leaf', pl: 'mint leaves', color: 'green' },
    { id: 'honey', e: '🍯', kind: 'add', name: 'honey pot', pl: 'honey pots', color: 'brown' },
    { id: 'cherry', round: true, e: '🍒', kind: 'top', name: 'cherry', pl: 'cherries', color: 'red' },
    { id: 'orange', round: true, e: '🍊', kind: 'top', name: 'orange slice', pl: 'orange slices', color: 'orange' },
    { id: 'melon', e: '🍉', kind: 'top', name: 'watermelon slice', pl: 'watermelon slices', color: 'red' },
    { id: 'apple', round: true, e: '🍏', kind: 'top', name: 'apple slice', pl: 'apple slices', color: 'green' },
    { id: 'pickle', e: '🥒', kind: 'top', name: 'pickle', pl: 'pickles', color: 'green', silly: true },
    { id: 'cup', e: '🥤', kind: 'cup', name: 'cup', pl: 'cups', color: 'pink' }
  ];
  var BY = {}; ITEMS.forEach(function (it) { BY[it.id] = it; });
  var COLORS = { red: '#ff5a6e', yellow: '#ffd23c', blue: '#6fb4ff', green: '#5fd38a', pink: '#ff8fb8', purple: '#a98bff', orange: '#ffa24a', brown: '#c98a4b', white: '#ffffff' };
  // flavors: plain lemonade first, then one more every few play days (FLAVOR_DAYS). Never listed anywhere before they unlock.
  var FLAVORS = [
    { id: 'plain', name: 'lemonade', fruit: 'lemon', e: '🍋', juice: '#ffe46b', price: 1 },
    { id: 'strawberry', name: 'strawberry lemonade', fruit: 'strawberry', e: '🍓', juice: '#ff9fbf', price: 2 },
    { id: 'raspberry', name: 'raspberry lemonade', fruit: 'raspberry', e: '', juice: '#e8619e', price: 2 },
    { id: 'blueberry', name: 'blueberry lemonade', fruit: 'blueberry', e: '🫐', juice: '#94a9ff', price: 3 },
    { id: 'peach', name: 'peach lemonade', fruit: 'peach', e: '🍑', juice: '#ffbb85', price: 3 },
    { id: 'kiwi', name: 'kiwi lemonade', fruit: 'kiwi', e: '🥝', juice: '#a9df70', price: 4 }
  ];
  var FL = {}; FLAVORS.forEach(function (f) { FL[f.id] = f; });
  var FLAVOR_DAYS = [0, 2, 5, 8, 11, 14];   // play days (distinct dates with a finished stand day) needed for flavor k
  function flData(p) { var g = data(p), f = g.fl; if (!f || typeof f !== 'object' || !Array.isArray(f.got)) f = g.fl = { got: ['plain'], pd: 0, last: '' }; if (f.got.indexOf('plain') < 0) f.got.unshift('plain'); return f; }
  function flavors(p) { var got = p ? flData(p).got : ['plain']; return FLAVORS.filter(function (f) { return got.indexOf(f.id) >= 0; }); }
  function hasFlavor(p, id) { return !!p && flData(p).got.indexOf(id) >= 0; }
  // one more play day; unlocks the next flavor when it is due. Returns the new flavor id (or null).
  function notePlayDay(p) { var f = flData(p), d = today(); if (f.last === d) return null; f.last = d; f.pd = (f.pd || 0) + 1;
    var k = f.got.length; if (k < FLAVORS.length && f.pd >= FLAVOR_DAYS[k]) { var nf = FLAVORS.filter(function (x) { return f.got.indexOf(x.id) < 0; })[0]; if (nf) { f.got.push(nf.id); return nf.id; } } return null; }
  // each friend has a fixed favorite flavor; until it unlocks they order another unlocked one (the favorite is never shown early)
  function favOf(p, fid) { var all = FLAVORS[Math.floor(seed01('fav|' + fid) * FLAVORS.length)], got = flavors(p);
    if (hasFlavor(p, all.id)) return { id: all.id, fav: true }; return { id: got[Math.floor(seed01('alt|' + fid + '|' + got.length) * got.length)].id, fav: false }; }
  var BILLS = [1, 5, 10, 20];                 // whole dollars only. Pay UI shows one of each denom, tapped repeatedly.
  var UPGRADES = [];
  function upgrade(def) { UPGRADES.push(def); return def; }
  function owned(p, id) { var g = data(p); return !!(g.up && g.up[id]); }
  function menuOk(p, it) { return (!it.needs || (p && owned(p, it.needs))) && (!it.flavor || hasFlavor(p, it.flavor)); }
  function of(kind, p) { return ITEMS.filter(function (it) { return it.kind === kind && menuOk(p, it); }); }
  // every counted ingredient a kid can see today (never a locked flavor fruit, never the silly pickle or the empty cup)
  function ingr(p) { return ITEMS.filter(function (it) { return (it.kind === 'main' || it.kind === 'add' || it.kind === 'top') && !it.silly && menuOk(p, it); }); }
  function ids(a) { return a.map(function (x) { return x.id; }); }
  function mainPick(ctx) { return ctx.fav && BY[ctx.fav] && menuOk(ctx.p, BY[ctx.fav]) && RNG() < .6 ? ctx.fav : pick(of('main', ctx.p)).id; }
  function anyPick(ctx) { return ctx.fav && BY[ctx.fav] && menuOk(ctx.p, BY[ctx.fav]) && RNG() < .4 ? ctx.fav : pick(ingr(ctx.p)).id; }
  function decoys(ctx, not, n) { return shuffle(ids(ingr(ctx.p)).filter(function (x) { return not.indexOf(x) < 0; })).slice(0, n); }

  /* ---------- order helpers ---------- */
  function nm(it, n) { return n === 1 ? it.name : it.pl; }
  function part(id, n) { return n === 1 ? 'ls_it_' + id : 'ls_its_' + id; }
  // order shape: { step, key, kind: 'pick'|'build', bins: [ids], need: {id:n} | null, cat: {color, n} | null, no: [ids], pre: {id:n},
  //   want: [recipe-card pieces], ticket: text | null, say: [voice parts], silly }
  function pickOrder(P, ctx, pool) {
    var bins = shuffle(pool.filter(function (x) { return x !== P.id; })).slice(0, P.n - 1).concat([P.id]);
    var o = { kind: 'pick', bins: shuffle(bins), need: {}, no: [], pre: {} };
    o.need[P.id] = 1; return o;
  }
  var HARD = { min: 10, acc: .80, days: 2 };   // stand2: mastery for the harder ticket steps: 10 answers at 80%+ on 2+ days
  var SAYC = ['yellow', 'pink', 'blue', 'green'];   // colors with a recorded "Can I have the ... one?" line
  /* ---------- the ORDERS ladder (same steps and bands as stand1/stand2; the food is now lemonade ingredients) ---------- */
  var ORDER_STEPS = [
    { id: 'o_match', name: 'Match the picture', band: 'T', fast: false,
      params: function (ctx) { return { id: anyPick(ctx), n: ctx.band === 'T' && !ctx.done ? 2 : 3 }; },
      build: function (P, ctx) { var o = pickOrder(P, ctx, ids(ingr(ctx.p))); var nm0 = (BY[P.id] && BY[P.id].name) || 'one'; o.say = [{ id: 'ls_this_one', text: 'Can I have this ' + nm0 + ', please?' }]; o.want = [{ id: P.id, n: 1 }]; o.showPic = true; o.thisOne = true; return o; } },
    { id: 'o_color', name: 'Find the color', band: 'T', fast: false,
      params: function (ctx) { return { id: pick(ingr(ctx.p).filter(function (x) { return SAYC.indexOf(x.color) >= 0; })).id, n: ctx.band === 'T' && !ctx.done ? 2 : 3 }; },
      build: function (P, ctx) { var c = BY[P.id].color, seen = {}; seen[c] = 1;
        var others = shuffle(ingr(ctx.p)).filter(function (x) { if (seen[x.color]) return false; seen[x.color] = 1; return true; }).slice(0, P.n - 1);
        var o = { kind: 'pick', bins: shuffle([P.id].concat(ids(others))), need: {}, no: [], pre: {} }; o.need[P.id] = 1;
        o.say = ['ls_color_' + c]; o.want = [{ swatch: c }]; o.color = c; o.showPic = true; return o; } },
    { id: 'o_count', name: 'Count the order', band: 'P', sub: [[1, 5], [3, 10]],
      params: function (ctx) { var r = ctx.sub ? [3, 10] : [1, 5]; return { id: anyPick(ctx), n: rnd(r[0], r[1]) }; },
      build: function (P, ctx) { var o = { kind: 'build', bins: shuffle([P.id].concat(decoys(ctx, [P.id], 2))), need: {}, no: [], pre: {} };
        o.need[P.id] = P.n; o.say = ['ls_i_want', P.n, part(P.id, P.n)]; o.want = [{ id: P.id, n: P.n }]; o.showPic = true; o.countAloud = true; return o; } },
    { id: 'o_counton', name: 'Count on', band: 'P',
      // "Can I have 9 lemons, please? My cup has 6 already." The 6 sit under a covered cup marked 6, so she counts on from 6 to 9.
      params: function (ctx) { var a = rnd(2, 6), b = rnd(1, 4); if (b === a) b = a > 1 ? a - 1 : a + 1; return { id: anyPick(ctx), a: a, b: b }; },
      build: function (P, ctx) { var o = { kind: 'build', bins: shuffle([P.id].concat(decoys(ctx, [P.id], 2))), need: {}, no: [], pre: {} };
        var t = P.a + P.b; o.need[P.id] = t; o.pre[P.id] = P.a; o.cupPre = true; o.say = ['ls_i_want', t, part(P.id, t), 'b1_ls_please_q', 'b1_ls_cup_has', P.a, 'b1_ls_already'];
        o.want = [{ id: P.id, n: t }]; o.showPic = true; o.countAloud = true; return o; } },
    { id: 'o_sort', name: 'Sort by color', band: 'P',
      params: function (ctx) { var cs = ['red', 'red', 'yellow', 'green', 'blue']; return { color: pick(cs), n: rnd(2, 4) }; },
      build: function (P, ctx) { var pool = ingr(ctx.p), good = pool.filter(function (x) { return x.color === P.color; }), bad = shuffle(pool.filter(function (x) { return x.color !== P.color; }));
        var bins = shuffle(shuffle(good).slice(0, 2).concat(bad.slice(0, good.length >= 2 ? 2 : 3)));
        var o = { kind: 'build', bins: ids(bins), need: null, cat: { color: P.color, n: P.n }, no: [], pre: {} };
        o.say = [{ id: 'sr1_sort_only', text: 'Can I have only ' + P.n + ' ' + P.color + ' things, please?' }]; o.want = [{ swatch: P.color, n: P.n }]; o.showPic = true; o.countAloud = true; return o; } },
    { id: 'o_read', name: 'Read the ticket', band: 'E', ok: function (p) { return readerOk(p); },
      params: function (ctx) { var a = mainPick(ctx), ad = pick(of('add', ctx.p)).id, no = RNG() < .7 ? pick(ids(of('add', ctx.p).concat(of('top', ctx.p))).filter(function (x) { return x !== ad; })) : null; return { a: a, na: rnd(1, 4), b: ad, nb: rnd(1, 3), no: no }; },
      build: function (P, ctx) { var o = { kind: 'build', bins: shuffle([P.a, P.b].concat(P.no ? [P.no] : [], decoys(ctx, [P.a, P.b, P.no], P.no ? 1 : 2))), need: {}, no: P.no ? [P.no] : [], pre: {} };
        o.need[P.a] = P.na; o.need[P.b] = P.nb;
        o.ticket = P.na + ' ' + nm(BY[P.a], P.na) + '\n' + P.nb + ' ' + nm(BY[P.b], P.nb) + (P.no ? '\nNO ' + BY[P.no].pl : '');
        o.say = ['ls_read_ticket']; o.ticketSay = [P.na, part(P.a, P.na), 'ls_and', P.nb, part(P.b, P.nb)].concat(P.no ? ['ls_no', 'ls_its_' + P.no] : []);
        o.want = [{ id: P.a, n: P.na }, { id: P.b, n: P.nb }].concat(P.no ? [{ id: P.no, no: true }] : []); o.showPic = false; return o; } },
    { id: 'o_two', name: 'Two-item orders', band: 'P',
      params: function (ctx) { return { d: mainPick(ctx), nd: rnd(1, 3), s: pick(of('add', ctx.p)).id, ns: rnd(1, 4) }; },
      build: function (P, ctx) { var o = { kind: 'build', bins: shuffle([P.d, P.s].concat(decoys(ctx, [P.d, P.s], 2))), need: {}, no: [], pre: {} }; o.need[P.d] = P.nd; o.need[P.s] = P.ns;
        o.ticket = P.nd + ' ' + nm(BY[P.d], P.nd) + '\n' + P.ns + ' ' + nm(BY[P.s], P.ns);
        o.ticketSay = [P.nd, part(P.d, P.nd), 'ls_and', P.ns, part(P.s, P.ns)]; o.want = [{ id: P.d, n: P.nd }, { id: P.s, n: P.ns }];
        if (ctx.reader) { o.say = ['ls_read_ticket']; o.showPic = false; } else { o.ticket = null; o.say = ['ls_i_want'].concat(o.ticketSay); o.showPic = true; o.countAloud = true; } return o; } },
    /* stand2: harder steps above Two-item orders, for readers 6+. Apart from Three-item tickets they are never placed by the
       warm-up (probe: false): every kid climbs them by playing. */
    { id: 'o_three', name: 'Three-item tickets', band: 'E', ok: bigReader, rule: HARD, slow: 1.3,
      params: function (ctx) { var adds = shuffle(ids(of('add', ctx.p))); return { d: mainPick(ctx), nd: rnd(1, 3), s: adds[0], ns: rnd(1, 3), f: RNG() < .5 ? adds[1] : pick(['cherry', 'orange']), nf: rnd(2, 4), no: RNG() < .4 ? adds[2] : null }; },
      build: function (P, ctx) { var L = [[P.d, P.nd], [P.s, P.ns], [P.f, P.nf]]; return ticketOrder(ctx, L, P.no, null); } },
    { id: 'o_long', name: 'Longer tickets', band: 'E', ok: bigReader, probe: false, rule: HARD, slow: 1.5,
      params: function (ctx) { var adds = shuffle(ids(of('add', ctx.p))), m = mainPick(ctx);
        return { t: rnd(0, 2), a: m, na: rnd(1, 4), b: adds[0], nb: rnd(1, 3), x: adds[1], top: pick(['cherry', 'orange']), nt: rnd(1, 2), extra: RNG() < .5 }; },
      build: function (P, ctx) { return longOrder(P, ctx); } },
    { id: 'o_sort2', name: 'Two-rule sorting', band: 'E', ok: bigReader, probe: false, rule: HARD, slow: 1.2,
      params: function (ctx) { var c = pick(['red', 'red', 'green', 'blue']); return { color: c, round: RNG() < .6, n: rnd(2, 5) }; },
      build: function (P, ctx) { var pool = ingr(ctx.p),
          fits = function (x) { return x.color === P.color && !!x.round === P.round; }, good = pool.filter(fits);
        if (!good.length) { P.round = !P.round; good = pool.filter(fits); }
        var half = shuffle(pool.filter(function (x) { return !fits(x) && (x.color === P.color || !!x.round === P.round); })), other = shuffle(pool.filter(function (x) { return !fits(x) && x.color !== P.color && !!x.round !== P.round; }));
        var bins = shuffle(shuffle(good).slice(0, 2).concat(half.slice(0, 2), other.slice(0, 1))).slice(0, 5);
        var o = { kind: 'build', bins: ids(bins), need: null, cat: { color: P.color, round: P.round, n: P.n }, no: [], pre: {} };
        o.ticket = P.n + ' ' + P.color + ' things\nthat are ' + (P.round ? 'ROUND' : 'NOT round');
        o.say = ['ls_read_ticket']; o.ticketSay = ['ls_i_want', P.n, 'ls_c_' + P.color, P.round ? 'ls_and_round' : 'ls_not_round'];
        o.want = [{ swatch: P.color, n: P.n, round: P.round }]; o.showPic = false; o.countAloud = true; return o; } },
    { id: 'o_double', name: 'Double it!', band: 'E', ok: bigReader, probe: false, rule: HARD, slow: 1.3,
      params: function (ctx) { var t = RNG() < .5 ? 'each' : 'double';
        if (t === 'each') { var k = rnd(2, 3); return { t: t, base: 'cup', k: k, top: pick(['ice', 'ice', 'cherry', 'mint']), each: rnd(1, k === 3 ? 2 : 3) }; }
        return { t: t, a: mainPick(ctx), na: rnd(1, 2), b: pick(of('add', ctx.p)).id, nb: rnd(1, 3) }; },
      build: function (P, ctx) { var o = { kind: 'build', need: {}, no: [], pre: {} };
        if (P.t === 'each') { o.need[P.base] = P.k; o.need[P.top] = P.k * P.each;
          o.bins = shuffle([P.base, P.top].concat(decoys(ctx, [P.top], 2)));
          o.ticket = 'Make it ' + P.k + ' ' + nm(BY[P.base], P.k) + '\nwith ' + P.each + ' ' + nm(BY[P.top], P.each) + ' each';
          o.ticketSay = ['ls_make_it', P.k, part(P.base, P.k), 'ls_with', P.each, part(P.top, P.each), 'ls_each']; }
        else { o.need[P.a] = 2 * P.na; o.need[P.b] = 2 * P.nb;
          o.bins = shuffle([P.a, P.b].concat(decoys(ctx, [P.a, P.b], 2)));
          o.ticket = P.na + ' ' + nm(BY[P.a], P.na) + '\n' + P.nb + ' ' + nm(BY[P.b], P.nb) + '\nDOUBLE it all!';
          o.ticketSay = [P.na, part(P.a, P.na), 'ls_and', P.nb, part(P.b, P.nb), 'ls_double']; }
        o.say = ['ls_read_ticket']; o.want = Object.keys(o.need).map(function (k) { return { id: k, n: o.need[k] }; }); o.showPic = false; return o; } },
    { id: 'o_memory', name: 'Remember the order', band: 'E', ok: bigReader, probe: false, rule: HARD, slow: 1.4,
      params: function (ctx) { var adds = shuffle(ids(of('add', ctx.p))), three = RNG() < .5;
        return { a: mainPick(ctx), na: rnd(1, 3), b: adds[0], nb: rnd(1, 3), c: three ? adds[1] : null, nc: rnd(1, 3) }; },
      build: function (P, ctx) { var L = [[P.a, P.na], [P.b, P.nb]]; if (P.c) L.push([P.c, P.nc]); var o = ticketOrder(ctx, L, null, null); o.memory = true; o.say = ['ls_remember']; return o; } }
  ];
  // a ticket with lines [[id, n], ...] and an optional NO line; bins = the items + the NO item + decoys (5 bins at most)
  function ticketOrder(ctx, lines, no, extraText) {
    var li = lines.map(function (l) { return l[0]; }), o = { kind: 'build', need: {}, no: no ? [no] : [], pre: {} };
    lines.forEach(function (l) { o.need[l[0]] = l[1]; });
    o.bins = shuffle(li.concat(no ? [no] : [], decoys(ctx, li.concat([no]), 5)).slice(0, 5));
    o.ticket = lines.map(function (l) { return l[1] + ' ' + nm(BY[l[0]], l[1]); }).join('\n') + (no ? '\nNO ' + BY[no].pl : '');
    o.ticketSay = []; lines.forEach(function (l, i) { if (i) o.ticketSay.push('ls_and'); o.ticketSay.push(l[1], part(l[0], l[1])); }); if (no) o.ticketSay.push('ls_no', 'ls_its_' + no);
    o.say = ['ls_read_ticket']; o.want = lines.map(function (l) { return { id: l[0], n: l[1] }; }).concat(no ? [{ id: no, no: true }] : []); o.showPic = false; return o;
  }
  // longer tickets: whole sentences with "but" / "and" / two sentences
  function longOrder(P, ctx) {
    var o = { kind: 'build', need: {}, no: [], pre: {} }, txt, vs, li;
    if (P.t === 0) {        // "2 lemons with 3 ice cubes, but no honey, and 1 cherry."
      o.need[P.a] = P.na; o.need[P.b] = P.nb; o.need[P.top] = P.nt; o.no = [P.x]; li = [P.a, P.b, P.top, P.x];
      txt = P.na + ' ' + nm(BY[P.a], P.na) + ' with ' + P.nb + ' ' + nm(BY[P.b], P.nb) + ', but no ' + BY[P.x].pl + ', and ' + P.nt + ' ' + nm(BY[P.top], P.nt) + '.';
      vs = [P.na, part(P.a, P.na), 'ls_with', P.nb, part(P.b, P.nb), 'ls_but_no', 'ls_its_' + P.x, 'ls_and', P.nt, part(P.top, P.nt)];
    } else if (P.t === 1) { // "I'd like 3 lemons. And 2 sugar cubes, please!" (+ "No pickles!")
      o.need[P.a] = P.na; o.need[P.b] = P.nb; li = [P.a, P.b];
      txt = "I'd like " + P.na + ' ' + nm(BY[P.a], P.na) + '. And ' + P.nb + ' ' + nm(BY[P.b], P.nb) + ', please!';
      vs = ['ls_id_like', P.na, part(P.a, P.na), 'ls_and', P.nb, part(P.b, P.nb), 'ls_please'];
      if (P.extra) { o.no = ['pickle']; li.push('pickle'); txt += ' No pickles!'; vs.push('ls_no', 'ls_its_pickle'); }
    } else {                // "2 lemons and 3 ice cubes, but no mint leaves."
      o.need[P.a] = P.na; o.need[P.b] = P.nb; o.no = [P.x]; li = [P.a, P.b, P.x];
      txt = P.na + ' ' + nm(BY[P.a], P.na) + ' and ' + P.nb + ' ' + nm(BY[P.b], P.nb) + ', but no ' + BY[P.x].pl + '.';
      vs = [P.na, part(P.a, P.na), 'ls_and', P.nb, part(P.b, P.nb), 'ls_but_no', 'ls_its_' + P.x];
    }
    o.bins = shuffle(li.concat(decoys(ctx, li, 5)).slice(0, 5)); o.ticket = txt; o.sentence = true; o.ticketSay = vs; o.say = ['ls_read_ticket'];
    o.want = Object.keys(o.need).map(function (k) { return { id: k, n: o.need[k] }; }).concat(o.no.map(function (k) { return { id: k, no: true }; })); o.showPic = false; return o;
  }
  function bigReader(p) { return band(p) === 'E' && readerOk(p); }
  /* ---------- the MONEY ladder (whole dollars, cartoon bills) ---------- */
  /* Bills the kid can tap when counting out a price. One of each, used many times. Younger bands see $5 and $1 only. */
  function payDenoms(p, m) {
    if (m && m.kind === 'enough') return null;
    var a = age(p), step = m && m.step;
    if (step === 'm_count5' || (a != null && a <= 5)) return [5, 1];
    return [20, 10, 5, 1];
  }
  function wallet(total, extra, big) { // bills the customer holds: enough to pay `total` exactly, plus a few extra $1s
    var w = [], left = total;
    if (big) { while (left >= 10) { w.push(10); left -= 10; } while (left >= 5) { w.push(5); left -= 5; } }
    for (var i = 0; i < left; i++) w.push(1);
    for (var j = 0; j < extra; j++) w.push(big && j === 0 && RNG() < .5 ? 5 : 1);
    return w.sort(function (a, b) { return b - a; });
  }
  // stand-r1: a price line is a few cups of one unlocked flavor (plain $1, then pricier flavors as they unlock), so a new flavor
  // brings bigger, mixed prices at the kid's own money step. Always whole dollars; falls back to plain cups.
  function cupsFor(ctx, lo, hi) { var fl = ctx && ctx.p ? flavors(ctx.p) : [FL.plain], opts = [];
    fl.forEach(function (f) { for (var n = 1; n * f.price <= hi; n++) if (n * f.price >= lo) opts.push({ fl: f.id, n: n, price: n * f.price }); });
    var mine = opts.filter(function (o) { return ctx && o.fl === ctx.flavor; }); if (mine.length && RNG() < .5) opts = mine;
    return opts.length ? pick(opts) : { fl: 'plain', n: lo, price: lo }; }
  var MONEY_STEPS = [
    { id: 'm_count5', name: 'Count bills to 5', band: 'P', ok: function (p) { return moneyOpen(p); }, params: function (ctx) { var c = cupsFor(ctx, 1, 5); return { price: c.price, it: [c] }; },
      build: function (P) { return { items: P.it || null, kind: 'take', prices: [P.price], total: P.price, bills: wallet(P.price, rnd(1, 3)), say: ['ls_that_is', P.price, P.price === 1 ? 'ls_dollar' : 'ls_dollars'], showTotal: true }; } },
    { id: 'm_count10', name: 'Count bills to 10', band: 'P', ok: function (p) { return moneyOpen(p); }, params: function (ctx) { var c = cupsFor(ctx, 4, 10); return { price: c.price, it: [c] }; },
      build: function (P) { return { items: P.it || null, kind: 'take', prices: [P.price], total: P.price, bills: wallet(P.price, rnd(1, 2)), say: ['ls_that_is', P.price, 'ls_dollars'], showTotal: true }; } },
    { id: 'm_add', name: 'Add two prices', band: 'P', ok: function (p) { return !!mathMastered(p, 'add10'); }, params: function (ctx) { var a = cupsFor(ctx, 1, 5), b = cupsFor(ctx, 1, Math.min(5, 10 - a.price)); return { a: a.price, b: b.price, it: [a, b] }; },
      build: function (P) { var t = P.a + P.b; return { items: P.it || null, kind: 'take', prices: [P.a, P.b], total: t, bills: wallet(t, rnd(1, 2), t >= 5), say: ['ls_price_is', P.a, 'ls_plus', P.b], showTotal: false }; } },
    { id: 'm_enough', name: 'Do I have enough?', band: 'P', ok: function (p) { return !!mathMastered(p, 'add10'); }, params: function (ctx) { var c = cupsFor(ctx, 2, 10), price = c.price, yes = RNG() < .5, have = yes ? rnd(price, Math.min(15, price + 4)) : rnd(Math.max(1, price - 4), price - 1); return { price: price, have: have, it: [c] }; },
      build: function (P) { return { items: P.it || null, kind: 'enough', prices: [P.price], total: P.price, have: P.have, bills: wallet(P.have, 0, P.have >= 5), ans: P.have >= P.price, say: ['ls_that_is', P.price, 'ls_dollars', 'ls_enough'] }; } },
    { id: 'm_three', name: 'Three items to $20', band: 'P', ok: function (p) { return !!mathMastered(p, 'make10'); }, params: function (ctx) { var a = cupsFor(ctx, 2, 8), b = cupsFor(ctx, 1, 6), c = cupsFor(ctx, 1, Math.max(1, Math.min(6, 20 - a.price - b.price))); return { a: a.price, b: b.price, c: c.price, it: [a, b, c] }; },
      build: function (P) { var t = P.a + P.b + P.c; return { items: P.it || null, kind: 'take', prices: [P.a, P.b, P.c], total: t, bills: wallet(t, rnd(1, 2), true), say: ['ls_price_is', P.a, 'ls_plus', P.b, 'ls_plus', P.c], showTotal: false }; } },
    // quality1: making change (2.OA.1 / 2.MD.8, whole dollars): it costs $C, the friend paid with a $5, $10 or $20 bill; give back the change
    { id: 'm_change', name: 'Making change', band: 'E', ok: function (p) { return !!mathMastered(p, 'make10') && band(p) === 'E'; }, probe: false,
      params: function (ctx) { var paid = pick([5, 10, 10, 20]), c = cupsFor(ctx, 1, paid - 1); return { paid: paid, cost: c.price, it: [c] }; },
      build: function (P) { var ch = P.paid - P.cost; return { items: P.it || null, kind: 'take', prices: [P.cost], change: { paid: P.paid, cost: P.cost }, total: ch, bills: wallet(ch, rnd(1, 2), ch >= 5), say: ['q1_ls_costs', P.cost, 'ls_dollars', 'q1_ls_paid', P.paid, 'ls_dollars', 'q1_ls_change'], showTotal: false }; } }
  ];

  /* ---------- ladder registry ---------- */
  var LADDERS = {}, STEPS = {}, ORDER = [];
  function ladder(def) { def.ids = def.steps.map(function (s) { return s.id; }); def.steps.forEach(function (s, i) { s.ladder = def.id; s.ix = i; STEPS[s.id] = s; }); LADDERS[def.id] = def; ORDER.push(def.id); return def; }
  var BN = { T: 0, P: 1, E: 2 };
  function age(p) { return A.Age && A.Age.of ? A.Age.of(p) : (p && p.age); }
  function band(p) { if (A.Steps && A.Steps.band) return A.Steps.band(p); var a = age(p); if (a == null) return 'P'; return a <= 3 ? 'T' : a <= 5 ? 'P' : 'E'; }
  function toddler(p) { return band(p) === 'T' || (A.toddler ? A.toddler(p) : false); }
  // math mastery gate for money: counting to 10
  // a math skill counts as mastered when it was earned, or placed by a played warm-up / check (never by age alone), or any later
  // math step was earned or proven that way
  // batch1 (plan P2: money never opened for a new 6+): a warm-up "probe" placement counts too, and a skill under her math floor
  // (learn.js band lock: e.g. counting to 10 for any 1st grader) counts as known
  function mathMastered(p, sid) {
    var C = A.Curriculum, st = p && p.skills && p.skills[sid];
    if (st && st.status === 'mastered' && (!st.placed || /warmup|probe|check|migrate/.test(st.placedBy || ''))) return sid;
    try { var Lb = A.Learn; if (Lb && Lb.glTop && p && p.skills) { var gv = Lb.glTop(sid); if (gv != null && gv < Lb.floor(p, 'math')) return 'band:' + sid; } } catch (e) {}
    if (C && C.list && p && p.skills) { try { var L = C.list('math').map(function (s) { return s.id; }), i0 = L.indexOf(sid); if (i0 < 0) return '';
      for (var i = i0 + 1; i < L.length; i++) { var s = p.skills[L[i]]; if (s && s.status === 'mastered' && (!s.placed || /warmup|probe|check/.test(s.placedBy || ''))) return 'math:' + L[i]; } } catch (e) {} }
    return '';
  }
  function mathCount10(p) {
    var m = mathMastered(p, 'count10'); if (m) return m;
    var a = age(p); if (a != null && a >= 6 && !toddler(p)) return 'age6';   // stand-r1: ages 6+ open money by age (no Munch needed)
    var g = p && p.games && p.games.stand, oc = g && g.steps && g.steps.o_count;
    if (oc && oc.status === 'mastered' && !oc.placed) return 'stand:o_count';   // the stand's own counted orders (to 10), earned
    return '';
  }
  // reads a short ticket: 6+, or reading mastery on the reading track (sight words / phonics), never age alone below 6
  function readerOk(p) { if (band(p) === 'E') return true; try { return !!(A.Curriculum && A.Curriculum.masteredCount && A.Curriculum.list('reading').length && A.Curriculum.masteredCount(p, 'reading') >= 2); } catch (e) { return false; } }
  function moneyOpen(p) { if (toddler(p)) return false; var g = p && p.games && p.games.stand; if (g && g.moneyOn) return true; var ok = !!mathCount10(p); if (ok && g) g.moneyOn = 1; return ok; }   // stand2: once open, money stays open (a step-down never takes it away)
  ladder({ id: 'orders', name: 'Orders', gate: function () { return true; }, top: function (p) { return toddler(p) ? 'o_color' : null; }, steps: ORDER_STEPS,
    start: function (p) { var a = age(p); if (toddler(p)) return 'o_match'; if (a == null || a <= 4) return 'o_count'; if (a === 5) return 'o_counton'; if (a === 6) return 'o_sort'; return 'o_read'; } });
  ladder({ id: 'money', name: 'Money', gate: moneyOpen, top: function () { return null; }, steps: MONEY_STEPS,
    start: function (p) { var a = age(p); return a != null && a >= 7 ? 'm_count10' : 'm_count5'; } });

  /* ---------- save data (p.games.stand; created lazily, so old saves need no migration and lose nothing) ---------- */
  function data(p) {
    var G = p.games || (p.games = {}), g = G.stand;
    if (!g || typeof g !== 'object') g = G.stand = {};
    if (!g.v) g.v = 1; g.days = g.days || 0; g.customers = g.customers || 0; g.tips = g.tips || 0; g.steps = g.steps || {}; g.tracks = g.tracks || {}; g.missed = g.missed || {}; g.up = g.up || {}; g.rush = g.rush || { tries: 0, wins: 0 };
    if (!g.fl || typeof g.fl !== 'object' || !Array.isArray(g.fl.got)) g.fl = { got: ['plain'], pd: 0, last: '' };   // stand-r1: unlocked flavors (schema 4, safe default)
    return g;
  }
  function sst(p, id) { var g = data(p), s = g.steps[id]; if (!s) s = g.steps[id] = { n: 0, ok: 0, hist: [], days: {}, fast: 0, status: 'locked' }; return s; }
  function topIx(p, L) { var t = L.top(p); return t ? L.ids.indexOf(t) : L.ids.length - 1; }
  /* quality1 band lock (js/core/learn.js): a step whose grade tag (at its own sub-level) is under the child's floor is marked done
     ('band') and never served as the current step, a rotation, or an easier customer; a step past her ceiling never opens.
     A real missed order can still come back as review. Without A.Learn (old Node tests) nothing changes. */
  function LN() { return A.Learn && A.Learn.bubbleSub ? A.Learn : null; }
  function inBand(p, id) { var Ln = LN(); if (!Ln) return true; var sb = Ln.bubbleSub(p, id); return sb >= 0 && Ln.kindOk(p, id, Math.max(sb, (data(p).steps[id] || {}).sub || 0)); }
  function underCeil(p, id) { var Ln = LN(); if (!Ln) return true; var v = Ln.gl(id, 0); return v == null || v <= Ln.ceil(p, Ln.subjOfKind(id)); }
  function bandMark(p, L, T) {
    var Ln = LN(); if (!Ln) return;
    L.ids.forEach(function (id) { var q = sst(p, id), sb = Ln.bubbleSub(p, id);
      if (sb < 0) { if (q.status !== 'mastered') { q.status = 'mastered'; q.placed = true; q.by = 'band'; } }
      else if (sb > 0 && q.status !== 'mastered' && (q.sub || 0) < sb) q.sub = sb; });
    if (T && T.cur && !inBand(p, T.cur)) { var ci = L.ids.indexOf(T.cur), bt = bandTop(p, L);
      for (var k = ci + 1; k <= bt; k++) if (stepOk(p, L.steps[k]) && inBand(p, L.ids[k])) { T.cur = L.ids[k]; if (sst(p, T.cur).status === 'locked') sst(p, T.cur).status = 'open'; return; } }
  }
  function stepOk(p, s) { var b = BN[band(p)]; if (!underCeil(p, s.id)) return false; return s.ok ? !!s.ok(p) && BN[s.band] <= b + 1 : BN[s.band] <= b; }   // a gated step may open one band early (e.g. a 5-year-old reader)
  function bandTop(p, L) { // the highest step open to this kid: her band, or a step's own gate (reading / math mastery)
    var last = 0; L.steps.forEach(function (s, i) { if (stepOk(p, s)) last = i; }); return Math.min(last, topIx(p, L));
  }
  function nextOk(p, L, i) { for (var k = i + 1; k < L.steps.length; k++) if (stepOk(p, L.steps[k])) return k; return -1; }
  function track(p, lad) {
    var g = data(p), L = LADDERS[lad], T = g.tracks[lad];
    if (!L.gate(p)) return null;
    if (!T) {
      T = g.tracks[lad] = { cur: null, probe: null, drop: {}, weak: 0, last: [] };
      var st0 = L.start(p), i0 = Math.max(0, Math.min(L.ids.indexOf(st0), bandTop(p, L)));
      L.ids.forEach(function (id, i) { var s = sst(p, id); if (i < i0 && s.status !== 'mastered') { s.status = 'mastered'; s.placed = true; s.by = 'age'; } });
      T.cur = L.ids[i0]; sst(p, T.cur).status = 'open'; bandMark(p, L, T); i0 = L.ids.indexOf(T.cur);
      // warm-up probe (not for toddlers): strided picks from the start step up to the band top; stops at the first miss
      var top = bandTop(p, L);
      while (top > i0 && L.steps[top].probe === false) top--;   // stand2: harder steps are climbed by playing, never placed by the warm-up
      if (!toddler(p) && top > i0) { var okIx = []; for (var k = i0; k <= top; k++) if (k === i0 || (stepOk(p, L.steps[k]) && inBand(p, L.ids[k]))) okIx.push(k); var plan = okIx.filter(function (x, j) { return okIx.length <= 4 || j % 2 === 0; }); if (plan[plan.length - 1] !== top) plan.push(top); T.probe = { plan: plan, k: 0, right: -1, from: i0 }; }
    }
    // a birthday can raise the band ceiling; never move a kid down
    if (!T.probe) bandMark(p, L, T);
    var ci = L.ids.indexOf(T.cur), bt = bandTop(p, L); if (ci > bt) { T.cur = L.ids[bt]; }
    else if (sst(p, T.cur).status === 'mastered' && !T.probe) { var nx = nextOk(p, L, ci); if (nx >= 0 && nx <= bt) { T.cur = L.ids[nx]; if (sst(p, T.cur).status === 'locked') sst(p, T.cur).status = 'open'; } }
    return T;
  }
  function ctxFor(p, s, o) { var st = sst(p, s.id), fl = o && o.flavor && FL[o.flavor] ? o.flavor : 'plain'; return { p: p, band: band(p), sub: st.sub || 0, done: st.status === 'mastered', reader: readerOk(p), flavor: fl, fav: FL[fl].fruit }; }
  function fastMs(p) { var b = band(p), a = age(p); if (b === 'T' || a == null) return 0; return b === 'E' ? 10000 : 14000; }   // a stand order takes longer than one Munch cell
  /* which step serves the next customer on a ladder */
  function nextStep(p, lad, o) {
    o = o || {}; var T = track(p, lad); if (!T) return null; var L = LADDERS[lad];
    if (T.probe && T.probe.k < T.probe.plan.length) return { step: STEPS[L.ids[T.probe.plan[T.probe.k]]], why: 'warmup' };
    var ci = L.ids.indexOf(T.cur), d = today(), dr = T.drop[T.cur] || {};
    if (T.dropNext && ci > 0 && T.lastWhy !== 'easy' && inBand(p, L.ids[ci - 1])) { T.dropNext = false; return { step: STEPS[L.ids[ci - 1]], why: 'easy' }; }
    T.dropNext = false;
    var due = dueMissed(p, lad); if (due.length && RNG() < .3) { var m = due[0]; return { step: STEPS[m.step], why: 'missed', params: m.params, key: m.k }; }
    var top = bandTop(p, L), cs = sst(p, T.cur);
    if (ci >= top && cs.status === 'mastered') { var lo = Math.max(0, top - 2), rot = []; for (var j = lo; j <= top; j++) if (inBand(p, L.ids[j]) && stepOk(p, L.steps[j])) rot.push(j); if (!rot.length) rot = [top];
      var k = rot[Math.floor(RNG() * rot.length)]; return { step: STEPS[L.ids[k]], why: 'rotate' }; }   // the band top: top steps take turns (in band only)   // the band top: top steps take turns
    return { step: STEPS[T.cur], why: 'cur' };
  }
  function sig(it) { return JSON.stringify([it.need, it.cat, it.prices, it.total, it.no]); }
  function okBuilt(p, it) { if (!it) return false; var all = (it.bins || []).concat(Object.keys(it.need || {}), it.no || []); return all.every(function (id) { return BY[id] && menuOk(p, BY[id]); }); }
  function makeOrder(p, lad, o) {
    var ns = nextStep(p, lad, o); if (!ns) return null; var s = ns.step, cx = ctxFor(p, s, o), T = track(p, lad), P = ns.params || s.params(cx), it = null;
    // a review order saved before stand-r1 (old menu ids) is retired instead of crashing
    if (ns.params) { try { it = s.build(JSON.parse(JSON.stringify(P)), cx); } catch (e) { it = null; } if (!okBuilt(p, it)) { var mm = data(p).missed[ns.key]; if (mm) mm.grad = true; ns = { step: s, why: ns.why === 'missed' ? 'cur' : ns.why }; P = s.params(cx); it = null; } }
    // never the same order twice in a row (same step + numbers, or the same ingredients and counts on any step)
    for (var tr = 0; tr < 12; tr++) { if (!it) it = s.build(P, cx); if (ns.params && sig(it) === T.lastSig) { ns = { step: s, why: 'cur' }; P = s.params(cx); it = null; continue; } if (ns.params || (T.lastKey !== s.id + '|' + JSON.stringify(P) && sig(it) !== T.lastSig)) break; P = s.params(cx); it = null; }
    it.step = s.id; it.ladder = lad; it.why = ns.why; it.params = P; it.key = ns.key || s.id + '|' + JSON.stringify(P); it.flavor = cx.flavor;
    T.lastWhy = ns.why; T.lastKey = s.id + '|' + JSON.stringify(P); T.lastSig = sig(it);
    return it;
  }
  /* order check: returns { ok, oops: null | 'more' | 'less' | 'wrong' | 'no' | 'color', item } */
  function count(tray) { var n = 0; for (var k in tray) n += tray[k]; return n; }
  function checkOrder(o, tray) {
    var k;
    if (o.no) for (var i = 0; i < o.no.length; i++) if (tray[o.no[i]]) return { ok: false, oops: 'no', item: o.no[i] };
    if (o.cat) { for (k in tray) if (tray[k] && BY[k].color !== o.cat.color) return { ok: false, oops: 'color', item: k }; if (o.cat.round != null) for (k in tray) if (tray[k] && !!BY[k].round !== o.cat.round) return { ok: false, oops: o.cat.round ? 'round' : 'notround', item: k }; var n = count(tray); return n === o.cat.n ? { ok: true } : { ok: false, oops: n < o.cat.n ? 'more' : 'less' }; }
    for (k in tray) if (tray[k] && !o.need[k]) return { ok: false, oops: 'wrong', item: k };
    for (k in o.need) { var h = tray[k] || 0; if (h < o.need[k]) return { ok: false, oops: 'more', item: k }; if (h > o.need[k]) return { ok: false, oops: 'less', item: k }; }
    return { ok: true };
  }
  function checkPay(m, taken) { if (m.kind === 'enough') return { ok: taken === m.ans }; var t = taken.reduce(function (a, b) { return a + b; }, 0); return t === m.total ? { ok: true } : { ok: false, oops: t < m.total ? 'more' : 'less', have: t }; }

  /* ---------- answers → step rules ---------- */
  var RULE = { min: 12, acc: .85, days: 2 }, STEADY = { min: 30, acc: .80, days: 3 }, MISS_GAPS = [1, 1, 3, 7, 14];
  function dueMissed(p, lad) { var g = data(p), t = now(); return Object.keys(g.missed).map(function (k) { return g.missed[k]; }).filter(function (m) { return !m.grad && m.lad === lad && m.due <= t && m.day !== today(); }).sort(function (a, b) { return a.due - b.due; }); }
  function noteMiss(p, o) { var g = data(p), m = g.missed[o.key] || (g.missed[o.key] = { k: o.key, lad: o.ladder, step: o.step, params: o.params, n: 0, okDays: {} }); m.n++; m.grad = false; m.gap = 0; m.day = today(); m.due = now() + DAY * MISS_GAPS[0] * 0.5; }
  function noteRight(p, o, first) { var g = data(p), m = g.missed[o.key]; if (!m || !first || m.day === today()) return; m.okDays[today()] = 1; m.gap = Math.min((m.gap || 0) + 1, MISS_GAPS.length - 1); m.due = now() + DAY * MISS_GAPS[m.gap]; m.day = today(); if (Object.keys(m.okDays).length >= 3) m.grad = true; }
  function acc(s) { return s.n ? s.ok / s.n : 0; }
  function ruleOf(id) { return (STEPS[id] && STEPS[id].rule) || RULE; }
  function ready(s) { var dn = Object.keys(s.days).length, a = acc(s), R = ruleOf(s.id); return (s.n >= R.min && a >= R.acc && dn >= R.days) || (s.n >= STEADY.min && a >= STEADY.acc && dn >= STEADY.days); }
  function advance(p, lad, how) {
    var L = LADDERS[lad], T = track(p, lad), ci = L.ids.indexOf(T.cur), s = sst(p, T.cur), top = bandTop(p, L);
    if (s.status !== 'mastered') { s.status = 'mastered'; s.how = how; s.placed = false; s.at = now(); }
    var nx = nextOk(p, L, ci); if (ci < top && nx >= 0 && nx <= top) { T.cur = L.ids[nx]; var n = sst(p, T.cur); if (n.status === 'locked') n.status = 'open'; }
    return L.ids[ci];
  }
  /* record one answer (one customer's order or payment). r: { ok, first (right with no oops), ms }. Returns events. */
  function record(p, o, r) {
    var lad = o.ladder, L = LADDERS[lad], T = track(p, lad), s = sst(p, o.step), ev = {}; s.id = o.step;
    var credit = r.first ? (r.peek ? .9 : 1) : r.ok ? .5 : 0;   // stand2: a right order after a peek at the flipped ticket still counts (a little less)
    s.n++; s.ok += credit; s.days[today()] = 1; s.hist.push(r.first ? 1 : 0); if (s.hist.length > 20) s.hist.shift();
    s.win = s.win || []; s.win.push(r.first ? 1 : 0); if (s.win.length > 20) s.win.shift();   // stand2: plateau window (never cut by an easier customer)
    if (s.back) { s.back.n++; s.back.ok += credit; }
    if (r.first) noteRight(p, o, true); else noteMiss(p, o);
    data(p).answers = (data(p).answers || 0) + 1;
    // warm-up probe
    if (o.why === 'warmup' && T.probe) {
      var pr = T.probe; if (r.first) { pr.right = pr.plan[pr.k]; pr.k++; } else pr.k = pr.plan.length;
      if (pr.k >= pr.plan.length) { var to = pr.right; if (to >= 0) { for (var i = pr.from; i <= to; i++) { var q = sst(p, L.ids[i]); if (q.status !== 'mastered') { q.status = 'mastered'; q.placed = true; q.by = 'warmup'; } } T.cur = L.ids[Math.min(to + 1, bandTop(p, L))]; sst(p, T.cur).status = sst(p, T.cur).status === 'mastered' ? 'mastered' : 'open'; }
        ev.warmupDone = { placedTo: to >= 0 ? L.ids[to] : null, cur: T.cur }; T.probe = null; }
      return ev;
    }
    if (o.step !== T.cur || o.why === 'missed' && o.step !== T.cur) return ev;
    // sub-level (o_count: up to 5, then up to 10) after 8+ answers at 80%+
    if (STEPS[o.step].sub && !s.sub && s.n >= 8 && acc(s) >= .8) { s.sub = 1; ev.subUp = true; }
    // fast-skip: 5 fast first-try right in a row (never at 2-3)
    var fm = fastMs(p); if (r.first && !r.peek && fm && r.ms != null && r.ms <= fm * (STEPS[o.step].slow || 1) && STEPS[o.step].fast !== false) s.fast++; else s.fast = 0;
    if (s.fast >= 5 && (!STEPS[o.step].sub || s.sub)) { s.fast = 0; ev.speedy = advance(p, lad, 'speedy'); ev.mastered = ev.speedy; return ev; }
    if (s.fast >= 5 && STEPS[o.step].sub && !s.sub) { s.sub = 1; s.fast = 0; ev.subUp = true; }
    if (s.back) { if (s.back.n >= 6 && s.back.ok / s.back.n >= .8) { delete s.back; ev.mastered = advance(p, lad, 'earned'); return ev; } }   // stand2: back on a step after a step-down: 6 good answers and up again
    else if (s.status !== 'mastered' && ready(s) && (!STEPS[o.step].sub || s.sub)) { ev.mastered = advance(p, lad, 'earned'); return ev; }
    // stuck: 3 misses in the last 5 → one easier customer (max 2 a day per step)
    var h5 = s.hist.slice(-5), miss5 = h5.filter(function (x) { return !x; }).length, d = today(), dr = T.drop[o.step] || (T.drop[o.step] = { day: d, n: 0 });
    if (dr.day !== d) { dr.day = d; dr.n = 0; }
    var dd = T.dropDay && T.dropDay.day === d ? T.dropDay : (T.dropDay = { day: d, n: 0 });
    if (miss5 >= 3 && h5.length >= 5 && dr.n < 2 && dd.n < 2 && L.ids.indexOf(o.step) > 0) { dr.n++; dd.n++; T.dropNext = true; ev.easier = true; s.hist = s.hist.slice(-2); }
    // plateau: many answers, still well under the bar → step down one step (re-earn a placed one)
    if (s.n >= 30 && s.win.length >= 20 && s.win.reduce(function (a, b) { return a + b; }, 0) / 20 < ruleOf(o.step).acc - .10) {
      // stand2: step down to the step before (open again, placed or earned), 6 good answers there and back up; never bounce straight back
      var ci = L.ids.indexOf(o.step), pi = ci - 1; while (pi > 0 && !stepOk(p, L.steps[pi])) pi--;
      if (pi >= 0 && ci > 0 && inBand(p, L.ids[pi])) { var pv = sst(p, L.ids[pi]); pv.status = 'open'; pv.placed = false; pv.back = { n: 0, ok: 0 }; T.cur = L.ids[pi]; s.hist = []; s.win = []; ev.stepDown = T.cur; }
    }
    return ev;
  }

  /* ---------- the day plan ---------- */
  function sunny(p, d) { return seed01(String((p && p.id) || 'x') + '|' + (d || today())) < .35; }
  function rushOk(p) { var a = age(p); return a != null && a >= 6; }   // RUSH HOUR: ages 6+ only (an optional, gentle timer burst)
  /* stand-r1 tips come from accuracy: right the first time = 3, after a fix = 1, a friend who ran out of patience = 0.
     Toddlers always tip 1 (a short heart count, no meter). */
  function tipFor(r) { if (r.walked) return 0; if (r.tod) return 1; return r.first ? 3 : 1; }
  // the patience meter (ms) by band: none for toddlers; very long for 4-5; long for 6+. Slow ticket steps get extra time.
  function patienceMs(p, step) { var b = band(p); if (b === 'T' || toddler(p)) return 0; return Math.round((b === 'E' ? 75000 : 100000) * ((STEPS[step] && STEPS[step].slow) || 1)); }
  function customers(p, n) { // met friends only (never a locked one); the kid's own friend runs the stand
    var met = (A.Friends && A.Friends.of ? A.Friends.of(p) : Object.keys((p.unlocks && p.unlocks.blobs) || {})).filter(function (id) { return id !== p.blob; });
    if (!met.length) met = [p.blob];
    var out = [], bag = []; for (var i = 0; i < n; i++) { if (!bag.length) bag = shuffle(met); var c = bag.shift(); if (out.length && out[out.length - 1] === c && bag.length) { bag.push(c); c = bag.shift(); } out.push(c); }
    return out;
  }
  function planDay(p, o) {
    o = o || {}; var g = data(p), sun = o.sunny != null ? o.sunny : sunny(p), n = o.n || 5;   // stand-r1: short days, about 5 friends
    var who = customers(p, n), money = moneyOpen(p), plan = { sunny: sun, money: money, rush: !!(o.rush !== false && rushOk(p) && n >= 5), list: [] };
    who.forEach(function (f, i) { var fv = favOf(p, f); plan.list.push({ friend: f, flavor: fv.id, fav: fv.fav, silly: i > 0 && RNG() < .15 }); });
    track(p, 'orders'); if (money) track(p, 'money');
    return plan;
  }
  // a silly order: a pickle in the lemonade (or similar); only on counted build steps
  function sillyOrder(p, o) { if (o.kind !== 'build' || o.cat || o.ticket) return o; var k = Object.keys(o.need)[0]; if (!k || o.pre[k]) return o; o.need = {}; o.need.pickle = o.need.pickle || Math.min(3, Math.max(1, (o.params && o.params.n) || 1)); o.bins = shuffle(['pickle'].concat(o.bins.filter(function (b) { return b !== 'pickle'; }).slice(0, 2))); o.say = ['ls_silly', o.need.pickle, part('pickle', o.need.pickle)]; o.want = [{ id: 'pickle', n: o.need.pickle }]; o.silly = true; o.key += '|silly'; return o; }
  /* end of day: stars 1-3 (like one Munch round, so the reward caps hold): 1 for the day, +1 if most orders were right first
     time, +1 for counting the tip jar right first time OR the rush-hour bonus. Star bits come with the stars (Store.earnStars). */
  // batch1 (plan P2: stars follow effort): 1 for the day, +1 at 70%+ orders right the first time, +1 at 90%+ AND the tip jar (or the
  // rush) right the first time. Was: 3 stars after many mistakes if the tip jar was right. Toddlers: the jar is a tap-count (no
  // wrong answer), so it counts as right.
  // stand-r1: the 3rd star needs every served order right the first time (no 3 stars after a retry); a friend who walked off
  // is not counted against her (no penalty beyond the lost tip)
  function dayStars(r) {
    var served = r.served || 0, first = r.firstOk || 0, walked = r.walked || 0;
    var f = served ? first / served : 0;
    var s = 1;
    if (f >= .7) s++;
    if (served && first >= served && (r.tipFirst || r.rushWon || r.tod)) s++;
    /* Kind, no-guilt: a really rough day (lots of misses, or several friends walking off) earns no star. Toddlers stay at least 1. */
    if (!r.tod && served >= 4 && f < 0.35) return 0;
    if (!r.tod && walked >= 3) return 0;
    return Math.min(3, s);
  }
  function finishDay(p, r) { var g = data(p); g.days++; g.customers += r.served || 0; g.tips += r.tips || 0; g.best = Math.max(g.best || 0, r.tips || 0); g.lastDay = today(); g.cups = (g.cups || 0) + (r.served || 0); r.newFlavor = notePlayDay(p); if (r.rushTried) g.rush.tries++; if (r.rushWon) g.rush.wins++; return dayStars(r); }
  function summary(p) { var g = data(p); return ORDER.map(function (lad) { var L = LADDERS[lad], T = g.tracks[lad]; return { ladder: lad, open: !!L.gate(p), cur: T ? T.cur : null, steps: L.ids.map(function (id) { var s = g.steps[id] || {}; return { id: id, name: STEPS[id].name, status: s.status || 'locked', placed: !!s.placed, n: s.n || 0, acc: s.n ? Math.round(100 * s.ok / s.n) : null }; }) }; }); }

  A.Stand = { ITEMS: ITEMS, BY: BY, COLORS: COLORS, FLAVORS: FLAVORS, FL: FL, FLAVOR_DAYS: FLAVOR_DAYS, flavors: flavors, hasFlavor: hasFlavor, notePlayDay: notePlayDay, favOf: favOf, ingr: ingr, tipFor: tipFor, patienceMs: patienceMs, BILLS: BILLS, UPGRADES: UPGRADES, upgrade: upgrade, owned: owned, LADDERS: LADDERS, STEPS: STEPS, ORDER: ORDER, ladder: ladder,
    band: band, toddler: toddler, moneyOpen: moneyOpen, mathCount10: mathCount10, mathMastered: mathMastered, readerOk: readerOk, stepOk: stepOk, data: data, state: sst, track: track, nextStep: nextStep, makeOrder: makeOrder, checkOrder: checkOrder, checkPay: checkPay, payDenoms: payDenoms,
    record: record, ready: ready, RULE: RULE, STEADY: STEADY, fastMs: fastMs, sunny: sunny, rushOk: rushOk, customers: customers, planDay: planDay, sillyOrder: sillyOrder, dayStars: dayStars, finishDay: finishDay,
    summary: summary, bandTop: bandTop, inBand: inBand, bigReader: bigReader, count: count, seed01: seed01,
    setClock: function (f) { NOWF = f; }, setRng: function (f) { RNG = f || Math.random; }, today: today };
})(window.Arcade);
