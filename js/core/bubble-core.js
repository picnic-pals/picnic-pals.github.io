/* Picnic Pals — Bubble Pop (bubble1, 2026-10-29): bubble kinds (the step ladder), targets and the round plan. No DOM here
   (games/bubble/bubble.js draws it; tools/bubble-sim.js and _test/bubble1-test.js run it in Node).
   A met food friend blows bubbles that float up slowly; a spoken target ("Pop the 7!") says which ones to pop. A round is about
   10 right pops (8 at a story stop) and pays 1-3 stars, like one Munch round, so the reward caps hold.
   One ladder per age band (T 2-3, P 4-5, E 6+). Each step is a bubble KIND; two kinds are "learning" at a time, so rounds can
   take turns and the same kind never comes twice in a row (when there is anything else to play). A kind the kid has not
   reached is never shown or named anywhere.
   Step rules (as steps-math.js / stand-core.js, per pop):
     mastery 20+ pops at 85%+ on 2+ days (E kinds: 24+); nearly-there 40+ at 80%+ on 3+ days; a pop after a miss on the same
     target counts half; fast-skip after 10 fast first-try pops in a row (never at 2-3); warm-up placement in the first round
     (strided kinds above the age start, 2 targets each, stops at the first miss); picture/glow hints only after a miss (bubble.js);
     stuck: 3 misses in 5 → one easier target (at most 2 a day); plateau (40+ pops, last 20 under 75%) → step down one kind,
     8 good pops there and back up; spaced review of mastered kinds (1, 3, 7, 14, 30 days).
   Ages 2-3: no wrong answers (every bubble pops; a non-target pop just says what it was). No timers under 6: the optional
   bubble storm (a speed bonus, like rush hour) is ages 6+ only. */
(function (A) {
  'use strict';
  var DAY = 864e5, NOWF = function () { return Date.now(); }, RNG = Math.random;
  function now() { return NOWF(); }
  function today() { var d = new Date(now()); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function rnd(a, b) { return a + Math.floor(RNG() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(RNG() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(RNG() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function tx(t) { return { text: String(t) }; }   // a device-voice word (sight words, letters, numbers as words)

  /* ---------- bubble contents ---------- */
  var COLORS = { red: '#ff5a6e', blue: '#5aa8ff', yellow: '#ffd23c', green: '#5fd38a', purple: '#a98bff', orange: '#ffa24a' };
  var CN = Object.keys(COLORS);
  var SHAPES = { circle: 'circles', square: 'squares', triangle: 'triangles', star: 'stars', heart: 'hearts' };
  var ANIMALS = [
    { id: 'cow', e: '🐮', pl: 'cows', snd: 'moo' }, { id: 'duck', e: '🦆', pl: 'ducks', snd: 'quack' }, { id: 'frog', e: '🐸', pl: 'frogs', snd: 'ribbit' },
    { id: 'pig', e: '🐷', pl: 'pigs', snd: 'oink' }, { id: 'dog', e: '🐶', pl: 'dogs', snd: 'woof' }, { id: 'cat', e: '🐱', pl: 'cats', snd: 'meow' },
    { id: 'sheep', e: '🐑', pl: 'sheep', snd: 'baa' }, { id: 'fish', e: '🐟', pl: 'fish', snd: 'blub' }];
  var AN = {}; ANIMALS.forEach(function (a) { AN[a.id] = a; });
  var LETTERS = 'ABCDEFGHIJKLMNOPRSTW'.split('');
  var BEGIN = [['b', 'ball', '⚽'], ['c', 'cat', '🐱'], ['d', 'dog', '🐶'], ['f', 'fish', '🐟'], ['h', 'hat', '🎩'], ['m', 'moon', '🌙'], ['p', 'pig', '🐷'], ['s', 'sun', '☀️'], ['t', 'tree', '🌳'], ['k', 'kite', '🪁'], ['l', 'leaf', '🍃'], ['r', 'rain', '🌧️']];
  var RHYMES = [['cat', 'hat', 'bat', 'mat', 'rat', 'sat'], ['dog', 'log', 'frog', 'hog', 'fog'], ['sun', 'run', 'fun', 'bun'], ['pig', 'big', 'dig', 'wig'], ['hen', 'ten', 'pen', 'men'], ['top', 'hop', 'mop', 'pop']];
  var CVC = ['cat', 'dog', 'sun', 'pig', 'hen', 'bus', 'cup', 'map', 'bed', 'fox', 'jam', 'net', 'hat', 'top', 'rug', 'lip', 'van', 'web'];
  var SPELL = ['cat', 'dog', 'sun', 'pig', 'hen', 'cup', 'map', 'bed', 'fox', 'frog', 'fish', 'duck', 'milk', 'star', 'jump', 'cake'];
  var NUMW = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  // pictures for the missing-letter words (so the word is clear with the sound off) and a small word list for the "makes another word" guard
  var PIC = { cat: '🐱', dog: '🐶', sun: '☀️', pig: '🐷', hen: '🐔', bus: '🚌', cup: '🥤', map: '🗺️', bed: '🛏️', fox: '🦊', jam: '🍓', net: '🥅', hat: '🎩', top: '🪀', rug: '🧶', lip: '👄', van: '🚐', web: '🕸️',
    frog: '🐸', fish: '🐟', duck: '🦆', milk: '🥛', star: '⭐', jump: '🦘', cake: '🎂', bird: '🐦', tree: '🌳', ship: '🚢' };
  var WORDS3 = ('bat bad bag ban bed beg bet bib bid big bin bit bog bop bud bug bum bun bus but cab can cap cat cob cod cog cot cub cud cup cut dab dad dam den dig dim din dip dog dot dub dug fan fat fed fib fig fin fit fix fog fox fun fur gap gas gem get gum gun gut had ham has hat hem hen hid him hip his hit hog hop hot hub hug hum hut jab jam jet jig job jog jot jug kid kin kit lab lad lap led leg let lid lip lit log lot lug mad man map mat men met mid mix mob mom mop mud mug nab nag nap net nod not nut pad pal pan pat peg pen pet pig pin pit pod pop pot pub pug pun pup put rag ram ran rap rat red rib rid rig rim rip rob rod rot rub rug run rut sad sag sap sat set sip sit sob sod son sub sum sun tab tag tan tap ten tin tip top tot tub tug van vat vet wag web wed wet wig win wit yak yam yes yet zip ' +
    'frog from fish dish wish duck deck dock luck milk mild silk star stir scar spar jump bump dump hump lump pump camp cake bake lake make rake take wake bird tree free ship shop chip whip slip drip trip flip frig').split(' ');
  var WSET = {}; WORDS3.forEach(function (w) { WSET[w] = 1; });
  function realWord(w) { return !!WSET[w]; }
  function sight() { var S = A.SightWords; return S ? S.PREPRIMER.concat(S.PRIMER).filter(function (w) { return w.length >= 2 && w !== 'I'; }) : ['the', 'and', 'see', 'go', 'my', 'is']; }
  // content factories (the UI draws them by cls)
  function cNum(v) { return { key: 'n' + v, cls: 'num', t: String(v), v: v, say: [v] }; }
  function cLet(l) { return { key: 'l' + l, cls: 'letter', t: l, v: l.toLowerCase(), say: [tx(l)] }; }
  function cWord(w) { return { key: 'w' + w, cls: 'word', t: w, v: w, say: [tx(w)] }; }
  function cCol(c) { return { key: 'c' + c, cls: 'color', col: c, v: c, say: ['bp_c_' + c] }; }
  function cShape(s, c) { return { key: 's' + s + (c || ''), cls: 'shape', shape: s, col: c || pick(CN), v: s, say: ['bp_sh_' + s] }; }
  function cAn(a, c) { var x = AN[a]; return { key: 'a' + a + (c || ''), cls: 'animal', e: x.e, v: a, col: c || null, say: ['bp_an_' + a] }; }
  function cSum(a, b) { return { key: 'm' + a + '+' + b, cls: 'num sum', t: a + '+' + b, v: a + b, say: [a, 'bp_plus', b] }; }
  function others(all, not, n) { return shuffle(all.filter(function (x) { return not.indexOf(x) < 0; })).slice(0, n); }

  /* ---------- the kinds (steps) ---------- */
  // gen(ctx) → target { say: [voice parts], show: { text | e | col | shape }, need, good: [contents], bad: [contents], seq: [contents] | null, any: bool }
  var T_STEPS = [
    { id: 't_pop', name: 'Pop the bubbles', band: 'T', gen: function () { var g = CN.map(cCol); return { say: ['bp_pop_any'], show: { e: '🫧' }, need: 3, good: g, bad: [], any: true }; } },
    { id: 't_color', name: 'Pop a color', band: 'T', gen: function () { var c = pick(['red', 'blue', 'yellow', 'green']); return { say: ['bp_pop_the', 'bp_c_' + c, 'bp_ones'], show: { col: c }, need: 3, good: [cCol(c)], bad: others(CN, [c], 2).map(cCol) }; } },
    { id: 't_peek', name: 'Peekaboo bubbles', band: 'T', gen: function (cx) { var f = cx.friends; return { say: ['bp_peek'], show: { e: '🙈' }, need: 3, good: f.map(function (id) { return { key: 'f' + id, cls: 'peek', friend: id, v: id, say: ['bp_boo'] }; }), bad: [], any: true }; } },
    { id: 't_shape', name: 'Pop a shape', band: 'T', gen: function () { var s = pick(['circle', 'star', 'heart']); return { say: ['bp_pop_the', 'bp_shs_' + s], show: { shape: s }, need: 3, good: [cShape(s)], bad: others(['circle', 'star', 'heart', 'square'], [s], 2).map(function (x) { return cShape(x); }) }; } },
    { id: 't_animal', name: 'Animal sounds', band: 'T', gen: function () { var a = pick(['cow', 'duck', 'pig', 'dog', 'cat', 'sheep']); return { say: ['bp_pop_the', 'bp_snd_' + a, 'bp_bubble'], show: { text: AN[a].snd }, need: 2, good: [{ key: 'snd' + a, cls: 'sound', t: AN[a].snd, v: a, e: AN[a].e, say: ['bp_snd_' + a, 'bp_its_a', 'bp_an_' + a] }], bad: [], any: true }; } },
    { id: 't_size', name: 'Big and little', band: 'T', gen: function () { var big = RNG() < .5; return { say: [big ? 'bp_big' : 'bp_little'], show: { size: big ? 'big' : 'little' }, need: 3, good: [{ key: big ? 'big' : 'lit', cls: 'color', col: pick(CN), sz: big ? 'big' : 'little', v: big ? 'big' : 'little', say: [big ? 'bp_w_big' : 'bp_w_little'] }], bad: [{ key: big ? 'lit' : 'big', cls: 'color', col: pick(CN), sz: big ? 'little' : 'big', v: big ? 'little' : 'big', say: [big ? 'bp_w_little' : 'bp_w_big'] }] }; } },
    { id: 't_count3', name: 'Count to 3', band: 'T', gen: function () { return { say: ['bp_count', 3, 'bp_bubbles'], show: { text: '1 2 3' }, need: 3, good: CN.map(cCol), bad: [], any: true, countAloud: true }; } },
    { id: 't_count5', name: 'Count to 5', band: 'T', gen: function () { return { say: ['bp_count', 5, 'bp_bubbles'], show: { text: '1 2 3 4 5' }, need: 5, good: CN.map(cCol), bad: [], any: true, countAloud: true }; } }
  ];
  var P_STEPS = [
    { id: 'p_shape', name: 'Shapes', band: 'P', gen: function () { var s = pick(Object.keys(SHAPES)); return { say: ['bp_pop_the', 'bp_shs_' + s], show: { shape: s }, need: 2, good: [cShape(s)], bad: others(Object.keys(SHAPES), [s], 3).map(function (x) { return cShape(x); }) }; } },
    { id: 'p_color', name: 'Colors', band: 'P', gen: function () { var c = pick(CN); return { say: ['bp_pop_the', 'bp_c_' + c, 'bp_ones'], show: { col: c }, need: 2, good: [cCol(c)], bad: others(CN, [c], 3).map(cCol) }; } },
    { id: 'p_animal', name: 'Animals', band: 'P', gen: function () { var a = pick(ANIMALS), snd = RNG() < .4 && a.id !== 'fish'; return { say: snd ? ['bp_says', 'bp_snd_' + a.id] : ['bp_pop_the', 'bp_ans_' + a.id], show: snd ? { text: a.snd } : { e: a.e }, need: 2, good: [cAn(a.id)], bad: others(ANIMALS.map(function (x) { return x.id; }), [a.id], 3).map(function (x) { return cAn(x); }) }; } },
    { id: 'p_letter', name: 'Letters', band: 'P', gen: function () { var l = pick(LETTERS); return { say: ['bp_pop_the', tx(l)], show: { text: l }, need: 1, good: [cLet(l)], bad: others(LETTERS, [l], 3).map(cLet) }; } },
    { id: 'p_num', name: 'Numbers', band: 'P', sub: 1, gen: function (cx) { var top = cx.sub ? 30 : 10, v = rnd(cx.sub ? 11 : 1, top), b = []; while (b.length < 3) { var x = rnd(1, top); if (x !== v && b.indexOf(x) < 0 && String(x).split('').reverse().join('') !== String(v)) b.push(x); } return { say: ['bp_pop_the', v], show: { text: String(v) }, need: 1, good: [cNum(v)], bad: b.map(cNum) }; } },
    { id: 'p_begin', name: 'Beginning sounds', band: 'P', gen: function () { var w = pick(BEGIN); return { say: ['bp_starts', tx(w[1])], ask: 'Which letter does it start with?', show: { e: w[2] }, need: 1, good: [cLet(w[0].toUpperCase())], bad: others(BEGIN.map(function (x) { return x[0].toUpperCase(); }), [w[0].toUpperCase()], 3).map(cLet) }; } },
    { id: 'p_bigger', name: 'The bigger number', band: 'P', gen: function () { var a = rnd(1, 9), b = a; while (b === a) b = rnd(1, 10); var hi = Math.max(a, b), lo = Math.min(a, b); return { say: ['bp_bigger', a, 'bp_or', b], show: { text: a + ' or ' + b }, need: 1, good: [cNum(hi)], bad: [cNum(lo)] }; } },
    { id: 'p_order', name: 'Pop 1 to 10 in order', band: 'P', sub: 1, gen: function (cx) { var n = cx.sub ? 10 : 5, seq = []; for (var i = 1; i <= n; i++) seq.push(cNum(i)); return { say: ['bp_order', n], show: { text: '1 → ' + n }, need: n, seq: seq, good: [], bad: [] }; } },
    { id: 'p_combo', name: 'Two-rule bubbles', band: 'P', gen: function () {
      if (RNG() < .5) { var a = pick(['fish', 'duck', 'frog', 'pig']), c = pick(['blue', 'red', 'yellow', 'green']); return { say: ['bp_pop_the', 'bp_c_' + c, 'bp_an_' + a], show: { e: AN[a].e, col: c }, need: 2, good: [cAn(a, c)], bad: [cAn(a, pick(CN.filter(function (x) { return x !== c; }))), cAn(pick(ANIMALS.filter(function (x) { return x.id !== a; })).id, c), cAn(pick(ANIMALS.filter(function (x) { return x.id !== a; })).id)] }; }
      var n = rnd(2, 4), b = pick(['duck', 'frog', 'cow', 'cat']); return { say: ['bp_pop_n', n, 'bp_ans_' + b], show: { text: n + ' ×', e: AN[b].e }, need: n, exact: true, good: [cAn(b)], bad: others(ANIMALS.map(function (x) { return x.id; }), [b], 3).map(function (x) { return cAn(x); }), countAloud: true }; } }
  ];
  var E_STEPS = [
    { id: 'e_sight', name: 'Sight words', band: 'E', sub: 2, gen: function (cx) { var L = sight(), pool = cx.sub === 2 ? L.slice(40) : cx.sub ? L : L.slice(0, 40), w = pick(pool);
      if (A.SightWords && A.SightWords.quiet && A.SightWords.quiet()) { var cz = clozeT(pool); if (cz) return cz; }   // no voice: a fill-in sentence instead of "the word you hear"
      return { say: ['bp_find_word', tx(w)], ask: 'Pop the word you hear!', show: { text: '🔊' }, need: 1, good: [cWord(w)], bad: others(pool.filter(function (x) { return x[0] === w[0] || x.length === w.length; }).concat(shuffle(pool).slice(0, 6)), [w], 3).map(cWord) }; } },
    { id: 'e_numword', name: 'Number words', band: 'E', sub: 2, gen: function (cx) { var top = cx.sub ? 20 : 10, v = cx.sub === 2 ? rnd(11, 20) : rnd(1, top), b = others(Array.from({ length: top }, function (_, i) { return i + 1; }), [v], 3); return { say: ['bp_pop_the', tx(NUMW[v])], show: { text: NUMW[v] }, need: 1, good: [cNum(v)], bad: b.map(cNum) }; } },
    { id: 'e_add', name: 'Pop the answer', band: 'E', sub: 2, gen: function (cx) { var a, b; if (cx.sub === 2) { if (RNG() < .5) { a = rnd(11, 18); b = -rnd(2, 9); } else { a = rnd(4, 9); b = rnd(11 - a, 9); } } else if (cx.sub) { a = rnd(4, 9); b = rnd(11 - a, 9); } else { a = rnd(1, 6); b = rnd(1, 10 - a); } var s = a + b, bad = others([s - 2, s - 1, s + 1, s + 2, s + 10].filter(function (x) { return x > 0; }), [s], 3); return { say: b < 0 ? ['bp_answer', a, 'bp_minus', -b] : ['bp_answer', a, 'bp_plus', b], show: { text: b < 0 ? a + ' − ' + -b : a + ' + ' + b }, need: 1, good: [cNum(s)], bad: bad.map(cNum) }; } },
    { id: 'e_evenodd', name: 'Even and odd', band: 'E', sub: 2, gen: function (cx) { var even = RNG() < .5, g = [], b = [], lo = cx.sub === 2 ? 21 : 1, hi = cx.sub ? (cx.sub === 2 ? 60 : 30) : 20; for (var i = lo; i <= hi; i++) ((i % 2 === 0) === even ? g : b).push(i); return { say: ['bp_pop_the', even ? 'bp_even' : 'bp_odd'], show: { text: even ? 'even' : 'odd' }, need: 3, good: shuffle(g).slice(0, 6).map(cNum), bad: shuffle(b).slice(0, 5).map(cNum) }; } },
    { id: 'e_rhyme', name: 'Rhymes', band: 'E', sub: 2, gen: function (cx) { var f = pick(RHYMES), w = f[0], g = f.slice(1), b = []; RHYMES.forEach(function (o) { if (o !== f) b = b.concat(o.slice(0, 2)); }); return { say: ['bp_rhyme', tx(w)], show: { text: w }, need: cx.sub ? 3 : 2, good: g.map(cWord), bad: shuffle(b).slice(0, cx.sub === 2 ? 7 : 5).map(cWord) }; } },
    { id: 'e_missing', name: 'The missing letter', band: 'E', sub: 2, gen: function (cx) { var w = cx.sub === 2 ? pick(['frog', 'fish', 'duck', 'milk', 'star', 'jump', 'cake', 'bird', 'tree', 'ship']) : pick(CVC), k = cx.sub ? rnd(0, w.length - 1) : 1, l = w[k], gap = w.slice(0, k) + '_' + w.slice(k + 1), pool = ('aeiou'.indexOf(l) >= 0 ? ['a', 'e', 'i', 'o', 'u'] : 'bcdfghjklmnprstw'.split('')).filter(function (x) { return !realWord(gap.replace('_', x)); });   // quality1: a wrong letter never makes another real word (s_n: not "sin")
      return { say: ['bp_missing', tx(w)], ask: 'Which letter is missing? Pop it!', show: { text: gap, e: PIC[w] }, need: 1, good: [cLet(l)], bad: others(pool, [l], 3).map(function (x) { return cLet(x); }), lower: true }; } },
    { id: 'e_make10', name: 'Ways to make 10', band: 'E', sub: 2, gen: function (cx) { var M = cx.sub === 2 ? pick([12, 14, 15]) : cx.sub ? pick([5, 8, 10]) : 10, g = [], b = []; for (var a = 1; a < M; a++) { if (a > 9 || M - a > 9) continue; g.push(cSum(a, M - a)); var d = rnd(1, 9); if (a + d !== M) b.push(cSum(a, d)); } return { say: M === 10 ? ['bp_make10'] : ['bp_make', M], show: { text: '= ' + M }, need: 3, good: shuffle(g).slice(0, 6), bad: shuffle(b).slice(0, 5) }; } },
    { id: 'e_skip', name: 'Skip-counting', band: 'E', sub: 2, gen: function (cx) { var by = cx.sub === 2 ? pick([3, 4]) : cx.sub ? pick([5, 10]) : 2, seq = []; for (var i = 1; i <= 5; i++) seq.push(cNum(by * i)); return { say: ['bp_skip', by], show: { text: by + ', ' + by * 2 + ', …' }, need: 5, seq: seq, good: [], bad: [cNum(by * 2 + 1), cNum(by * 3 - 1)] }; } },
    { id: 'e_spell', name: 'Spell the word', band: 'E', sub: 2, gen: function (cx) { var pool = SPELL.filter(function (w) { return (cx.sub ? w.length >= 4 : w.length === 3) && new Set(w).size === w.length; }), w = pick(pool), seq = w.split('').map(function (l) { return cLet(l); });
      return { say: ['bp_spell', tx(w)], ask: 'Spell the word for the picture!', show: { e: { cat: '🐱', dog: '🐶', sun: '☀️', pig: '🐷', hen: '🐔', cup: '🥤', map: '🗺️', bed: '🛏️', fox: '🦊', frog: '🐸', fish: '🐟', duck: '🦆', milk: '🥛', star: '⭐', jump: '🦘', cake: '🎂' }[w] || '🔤' }, need: w.length, seq: seq, good: [], bad: others('abdeghlmnoprstu'.split('').filter(function (x) { return w.indexOf(x) < 0; }), [], 3).map(cLet), word: w, lower: true }; } }
,
    /* quality1: four more 1st-3rd grade kinds so a 7-8-year-old always has in-band bubbles (never below her floor) */
    { id: 'e_tens', name: 'Tens and ones', band: 'E', sub: 2, gen: function (cx) {
      if (!cx.sub) { var t = rnd(2, 9), o = rnd(1, 9); while (o === t) o = rnd(1, 9); var v = 10 * t + o;
        return { say: ['q1_bp_tens1', t, 'q1_bp_tens2', o, 'q1_bp_tens3'], ask: 'Pop the number with ' + t + ' tens and ' + o + ' ones.', show: { text: t + ' tens, ' + o + ' ones' }, need: 1, good: [cNum(v)],
          bad: others([10 * o + t, t + o, 10 * t, v + 10, v - 10, v + 1].filter(function (x) { return x > 0 && x !== v; }), [v], 3).map(cNum) }; }
      var more = cx.sub === 1, n = more ? rnd(11, 89) : rnd(21, 99), ans = more ? n + 10 : n - 10;
      return { say: [more ? 'q1_bp_more10' : 'q1_bp_less10', n], ask: 'Pop the number that is 10 ' + (more ? 'more' : 'less') + ' than ' + n + '.', show: { text: '10 ' + (more ? 'more' : 'less') + ' than ' + n }, need: 1, good: [cNum(ans)],
        bad: others([more ? n - 10 : n + 10, more ? n + 1 : n - 1, ans + 1, ans - 1, n].filter(function (x) { return x > 0 && x !== ans; }), [ans], 3).map(cNum) }; } },
    { id: 'e_sight3', name: 'Big kid words', band: 'E', sub: 1, gen: function (cx) { var G = A.Grade1Words || {}; return clozeT((cx.sub ? G.DOLCH3 : G.DOLCH2) || []) || clozeT(sight()); } },
    { id: 'e_homo', name: 'Sound-alike words', band: 'E', gen: function () { var G = A.Grade1Words, i = rnd(0, G.HOMO.length - 1), h = G.HOMO[i], grp = G.HOMO_GROUPS[h[2]] || [h[1]];
      return { say: ['q1_bp_cloze', 'hom_' + i], ask: 'Pop the word that fits:', show: { sent: h[0].replace('___', '____') }, need: 1, good: [cWord(h[1])], bad: grp.filter(function (w) { return w !== h[1]; }).map(cWord) }; } },
    { id: 'e_prefix', name: 'Word parts', band: 'E', sub: 1, gen: function (cx) { var G = A.Grade1Words, a = pick(G.AFFIX[cx.sub ? 1 : 0]), tr = String(G.AFFIX_TRAPS[a[0]] || a[2]).split(' ');
      return { say: ['aff_' + a[0]], ask: 'Which word means\u2026', show: { sent: '\u201c' + a[1] + '\u201d' }, need: 1, good: [cWord(a[0])], bad: tr.filter(function (w) { return w !== a[0]; }).map(cWord) }; } }
  ];
  // a fill-in sentence from the curated sight-word bank (js/core/sightwords.js): one word fits, the others cannot
  function clozeT(words) {
    var S = A.SightWords; if (!S || !S.cloze) return null; var can = (words || []).filter(function (w) { return S.cloze(w); }); if (!can.length) return null;
    var w = pick(can), c = S.cloze(w);
    return { say: ['q1_bp_cloze', tx(c.text.replace('___', 'blank'))], ask: 'Pop the word that fits:', show: { sent: c.text.replace('___', '____') }, need: 1, good: [cWord(w)], bad: shuffle(c.bad).slice(0, 3).map(cWord), cloze: true };
  }
  var LAD = { T: T_STEPS, P: P_STEPS, E: E_STEPS }, STEPS = {};
  [T_STEPS, P_STEPS, E_STEPS].forEach(function (L) { L.forEach(function (s, i) { s.ix = i; STEPS[s.id] = s; }); });

  /* ---------- the kid ---------- */
  function age(p) { return A.Age && A.Age.of ? A.Age.of(p) : (p && p.age); }
  function band(p) { if (A.Steps && A.Steps.band) return A.Steps.band(p); var a = age(p); if (a == null) return 'P'; return a <= 3 ? 'T' : a <= 5 ? 'P' : 'E'; }
  function toddler(p) { return band(p) === 'T' || (A.toddler ? !!A.toddler(p) : false); }
  function bandOf(p) { return toddler(p) ? 'T' : band(p); }
  function stormOk(p) { var a = age(p); return a != null && a >= 6 && !toddler(p); }   // NO timers under 6
  function fastMs(p) { var b = bandOf(p); return b === 'T' ? 0 : b === 'E' ? 2500 : 3500; }
  function data(p) {
    var G = p.games || (p.games = {}), g = G.bubble; if (!g || typeof g !== 'object') g = G.bubble = {};
    if (!g.v) g.v = 1; g.rounds = g.rounds || 0; g.pops = g.pops || 0; g.golden = g.golden || 0; g.steps = g.steps || {}; g.tracks = g.tracks || {}; g.storm = g.storm || { tries: 0, wins: 0 };
    return g;
  }
  function sst(p, id) { var g = data(p), s = g.steps[id]; if (!s) s = g.steps[id] = { n: 0, ok: 0, days: {}, win: [], h5: [], fast: 0, status: 'locked' }; return s; }
  function startIx(p, b) { var a = age(p); if (b === 'T') return a != null && a >= 3 ? 1 : 0; if (b === 'P') return a != null && a >= 5 ? 3 : 0; return a == null || a <= 6 ? 0 : a === 7 ? 2 : 3; }
  /* quality1 band lock (js/core/learn.js): a kind (at its first in-band sub-level) is "in band" when its grade tag is at or above
     the child's floor for its subject and not past her ceiling. Kinds below the floor are marked done ('band', no reviews) and
     never come back as filler, review, an easier target or a step-down. Without A.Learn (old Node tests) everything is in band. */
  function LN() { return A.Learn && A.Learn.bubbleSub ? A.Learn : null; }
  function inBand(p, id) { var Ln = LN(); if (!Ln) return true; var sb = Ln.bubbleSub(p, id); return sb >= 0 && Ln.kindOk(p, id, Math.max(sb, (data(p).steps[id] || {}).sub || 0)); }
  function underCeil(p, id) { var Ln = LN(); if (!Ln) return true; var q = data(p).steps[id] || {}; return Ln.gl(id, q.sub || 0) == null || Ln.gl(id, q.sub || 0) <= Ln.ceil(p, Ln.subjOfKind(id)); }
  function bandMark(p, L) {
    var Ln = LN(); if (!Ln) return;
    L.forEach(function (s) { var q = sst(p, s.id), sb = Ln.bubbleSub(p, s.id);
      if (sb < 0) { if (q.status !== 'mastered') { q.status = 'mastered'; q.placed = true; q.by = 'band'; delete q.due; } }
      else if (q.status !== 'mastered' && (q.sub || 0) < sb) { q.sub = sb; q.n = 0; q.ok = 0; q.days = {}; q.win = []; q.fast = 0; } });
  }
  function bandTop(p, L) {   // nothing left in band to learn or review: the highest kinds of the ladder (never easier filler)
    var ok = L.filter(function (s) { return inBand(p, s.id); }); if (ok.length) return ok.slice(-3).map(function (s) { return s.id; });
    var Ln = LN(); return L.slice().sort(function (a, b) { return Ln.glTop(b.id) - Ln.glTop(a.id); }).slice(0, 3).map(function (s) { return s.id; });
  }
  var K = 2;   // kinds learning at the same time
  function track(p) {
    var g = data(p), b = bandOf(p), L = LAD[b], T = g.tracks[b];
    if (!T) {
      T = g.tracks[b] = { learn: [], probe: null, last: null, drop: { day: '', n: 0 }, dropNext: false };
      var i0 = startIx(p, b);
      L.forEach(function (s, i) { var q = sst(p, s.id); if (i < i0 && q.status !== 'mastered') { q.status = 'mastered'; q.placed = true; q.by = 'age'; } });
      bandMark(p, L);
      if (b !== 'T' && i0 < L.length - 1) { var plan = []; for (var k = i0 + 1; k <= Math.min(L.length - 1, i0 + 2); k += 1) if (inBand(p, L[k].id) && sst(p, L[k].id).status !== 'mastered') plan.push(k);
        if (plan.length) T.probe = { plan: plan, k: 0, n: 0, right: -1, from: i0 }; }
    }
    fill(p, T, L); return T;
  }
  function fill(p, T, L) {   // keep K kinds learning: the lowest not-yet-mastered kinds (in band, under the ceiling)
    bandMark(p, L);
    T.learn = T.learn.filter(function (id) { return sst(p, id).status !== 'mastered'; });
    for (var i = 0; i < L.length && T.learn.length < K; i++) { var id = L[i].id, s = sst(p, id); if (s.status !== 'mastered' && T.learn.indexOf(id) < 0 && !(s.rest > now()) && underCeil(p, id)) { T.learn.push(id); if (s.status === 'locked') s.status = 'open'; } }
    T.learn.sort(function (a, b) { return STEPS[a].ix - STEPS[b].ix; });
  }
  function reached(p) { var b = bandOf(p), T = track(p); return LAD[b].filter(function (s) { var q = sst(p, s.id); return q.status === 'mastered' || T.learn.indexOf(s.id) >= 0; }).map(function (s) { return s.id; }); }
  var GAPS = [1, 3, 7, 14, 30];
  function due(p) { var b = bandOf(p), t = now(); return LAD[b].filter(function (s) { var q = sst(p, s.id); return q.status === 'mastered' && q.by !== 'age' && q.by !== 'band' && q.due && q.due <= t && inBand(p, s.id); }).map(function (s) { return s.id; }); }
  /* which kind the next round plays: warm-up / a due review (30%) / a learning kind, never the same kind twice in a row */
  /* no stuck spots: a kind learned on 7+ days still under 70% rests for 4 days (the next kind opens meanwhile), then comes back */
  function rest(p, T, L) {
    var d = today(), moved = false;
    T.learn.slice().forEach(function (id) { var q = sst(p, id); q.ldays = q.ldays || {}; q.ldays[d] = 1;
      if (Object.keys(q.ldays).length >= 7 && acc(q) < .7 && q.n >= 12) { var other = L.some(function (x) { var o = sst(p, x.id); return x.id !== id && (o.status === 'mastered' || T.learn.indexOf(x.id) >= 0 || !(o.rest > now())); });   // something else to play meanwhile
        if (other) { q.rest = now() + 4 * DAY; q.ldays = {}; q.rests = (q.rests || 0) + 1; T.learn = T.learn.filter(function (x) { return x !== id; }); moved = true; } } });
    if (moved) fill(p, T, L);
    L.forEach(function (x) { var q = sst(p, x.id); if (q.rest && q.rest <= now() && q.status !== 'mastered' && T.learn.indexOf(x.id) < 0) { delete q.rest; T.learn.push(x.id); T.learn.sort(function (a, b) { return STEPS[a].ix - STEPS[b].ix; }); } });   // rest over: back alongside
  }
  function nextKind(p) {
    var b = bandOf(p), T = track(p), L = LAD[b];
    if (T.probe) return { step: STEPS[L[T.probe.plan[T.probe.k]] ? L[T.probe.plan[T.probe.k]].id : L[0].id], why: 'warmup' };
    rest(p, T, L);
    var dd = due(p).filter(function (id) { return id !== T.last; }); if (dd.length && RNG() < .3) return { step: STEPS[dd[0]], why: 'review' };
    var cand = T.learn.filter(function (id) { return id !== T.last; });
    if (!cand.length) { var m = reached(p).filter(function (id) { return id !== T.last && sst(p, id).status === 'mastered' && inBand(p, id); }); if (m.length) return { step: STEPS[pick(m.slice(-3))], why: 'review' }; cand = T.learn.slice(); }
    if (!cand.length) { var all = reached(p).filter(function (id) { return id !== T.last && inBand(p, id); }); cand = all.length ? all.slice(-3) : bandTop(p, L).filter(function (id) { return id !== T.last; }); if (!cand.length) cand = bandTop(p, L); return { step: STEPS[pick(cand)], why: 'top' }; }
    cand.sort(function (a, b) { return (sst(p, a).lr || 0) - (sst(p, b).lr || 0); });   // the kind played longest ago (every learning kind gets turns)
    return { step: STEPS[cand[0]], why: 'learn' };
  }
  // quality1 polish: a kind she already has (placed or mastered at sub-level 0) is never shown at a sub-level under her floor,
  // e.g. an "easier target" of Pop the answer for an 8-year-old is at least its 1st-grade sub-level
  function ctxFor(p, s, friends) { var q = sst(p, s.id), sub = q.sub || 0, Ln = LN(); if (Ln) { var sb = Ln.bubbleSub(p, s.id); if (sb > sub) sub = Math.min(sb, s.sub || 0); }
    return { p: p, sub: sub, friends: friends && friends.length ? friends : ['strawberry'] }; }
  // a round: a kind and its targets (generated one at a time so the step can change mid-round after an easier target)
  function makeRound(p, o) {
    o = o || {}; var nk = nextKind(p), T = track(p); T.last = nk.step.id; T.seq = (T.seq || 0) + 1; sst(p, nk.step.id).lr = T.seq;
    return { step: nk.step.id, why: nk.why, goal: o.goal || 10, friends: o.friends || [], golden: RNG() < (o.goldenP != null ? o.goldenP : .3), storm: !o.story && stormOk(p) && RNG() < .35 };
  }
  function makeTarget(p, R) {
    var T = track(p), id = R.step, why = R.why;
    if (T.dropNext && why !== 'warmup') { T.dropNext = false; var L = LAD[bandOf(p)], ix = STEPS[id].ix; if (ix > 0 && inBand(p, L[ix - 1].id)) { id = L[ix - 1].id; why = 'easy'; } }   // never an easier kind below the floor
    var s = STEPS[id], cx = ctxFor(p, s, R.friends), t = s.gen(cx); t.step = id; t.sub = cx.sub; t.why = why; t.got = 0; t.miss = 0; t.at = 0; return t;
  }
  // which bubbles match: any (toddler free pops), a sequence (next one), or a good content key
  function matches(t, c) { if (t.any) return true; if (t.seq) return t.seq[t.got] && t.seq[t.got].key === c.key; return t.good.some(function (g) { return g.key === c.key; }); }
  /* ---------- answers → rules ---------- */
  var RULE = { min: 20, acc: .85, days: 2 }, RULE_E = { min: 24, acc: .85, days: 2 }, STEADY = { min: 40, acc: .80, days: 3 }, KEEPGOING = { min: 90, acc: .60, days: 7 };   // keep-going: a kid who keeps trying moves on (with review later)
  function acc(s) { return s.n ? s.ok / s.n : 0; }
  function ready(id, s) { var R = STEPS[id].band === 'E' ? RULE_E : RULE, dn = Object.keys(s.days).length, a = acc(s); return (s.n >= R.min && a >= R.acc && dn >= R.days) || (s.n >= STEADY.min && a >= STEADY.acc && dn >= STEADY.days) || (s.n >= KEEPGOING.min && a >= KEEPGOING.acc && dn >= KEEPGOING.days); }
  function subUp(s) { s.ldays = {}; s.N = (s.N || 0) + s.n; s.sub = (s.sub || 0) + 1; s.n = 0; s.ok = 0; s.days = {}; s.fast = 0; s.win = []; }   // a new level inside a kind: counts start again
  function master(p, id, how) { var s = sst(p, id); s.status = 'mastered'; s.placed = false; s.by = how; s.at = now(); s.gap = 0; s.due = now() + GAPS[0] * DAY; delete s.back; fill(p, track(p), LAD[bandOf(p)]); }
  /* one pop on a target: r = { ok (it matched), ms }. Returns events. A right pop after a miss on the same target counts half. */
  function record(p, t, r, R) {
    var T = track(p), s = sst(p, t.step), ev = {}, first = r.ok && !t.miss, d = today();
    if (!r.ok) { t.miss++; s.h5.push(0); if (s.h5.length > 5) s.h5.shift(); s.fast = 0;
      if (t.why !== 'warmup' && s.h5.filter(function (x) { return !x; }).length >= 3 && s.h5.length >= 5) { if (T.drop.day !== d) T.drop = { day: d, n: 0 }; if (T.drop.n < 2 && STEPS[t.step].ix > 0) { T.drop.n++; T.dropNext = true; ev.easier = true; s.h5 = []; } }
      if (bandOf(p) === 'T' || t.why === 'warmup') { if (t.why === 'warmup' && T.probe) { endProbe(p, T); ev.warmupDone = true; } }
      return ev; }
    t.got++; data(p).pops++;
    var credit = first ? 1 : .5; s.n++; s.ok += credit; s.days[d] = 1; s.win.push(first ? 1 : 0); if (s.win.length > 20) s.win.shift(); s.h5.push(first ? 1 : 0); if (s.h5.length > 5) s.h5.shift();
    if (s.back) { s.back.n++; s.back.ok += credit; }
    if (t.why === 'warmup' && T.probe) { var pr = T.probe; pr.n++; if (t.got >= t.need) { if (pr.n >= 2) { pr.right = pr.plan[pr.k]; pr.k++; pr.n = 0; if (pr.k >= pr.plan.length) { endProbe(p, T); ev.warmupDone = true; } } } return ev; }
    if (t.why === 'review') { var q = s; q.revOk = (q.revOk || 0) + (first ? 1 : 0); q.revN = (q.revN || 0) + 1; if (q.revN >= 6) { if (q.revOk / q.revN >= .8) q.gap = Math.min((q.gap || 0) + 1, GAPS.length - 1); else q.gap = 0; q.due = now() + GAPS[q.gap] * DAY; q.revOk = q.revN = 0; ev.reviewed = true; } return ev; }
    if (t.why === 'easy' || T.learn.indexOf(t.step) < 0) return ev;
    var st = STEPS[t.step];
    if (st.sub && (s.sub || 0) < st.sub && ((s.n >= 12 && acc(s) >= .8) || (s.n >= 50 && acc(s) >= .6 && Object.keys(s.days).length >= 4))) {   // next level: 12 pops at 80%, or a keep-going kid after 50 pops on 4 days
      subUp(s); ev.subUp = true; return ev; }
    var fm = fastMs(p); if (first && fm && r.ms != null && r.ms <= fm) s.fast++; else s.fast = 0;
    var top = !st.sub || (s.sub || 0) >= st.sub;
    if (s.fast >= 10 && top && Object.keys(s.days).length >= 2) { s.fast = 0; master(p, t.step, 'speedy'); ev.speedy = ev.mastered = t.step; return ev; }
    if (s.fast >= 10 && !top) { subUp(s); ev.subUp = true; return ev; }
    if (s.back) { if (s.back.n >= 8 && s.back.ok / s.back.n >= .8) { master(p, t.step, 'earned'); ev.mastered = t.step; } return ev; }
    if (s.status !== 'mastered' && top && ready(t.step, s)) { master(p, t.step, 'earned'); ev.mastered = t.step; return ev; }
    // plateau: 40+ pops, last 20 under 75% → step down one kind (re-earn 8 good pops there)
    if (s.n >= 40 && s.win.length >= 20 && s.win.reduce(function (a, b) { return a + b; }, 0) / 20 < .75 && st.ix > 0) {
      var pv = LAD[bandOf(p)][st.ix - 1].id, q2 = sst(p, pv); if (q2.status === 'mastered' && inBand(p, pv)) { q2.status = 'open'; q2.placed = false; q2.back = { n: 0, ok: 0 }; T.learn = [pv].concat(T.learn.filter(function (x) { return x !== pv; })).slice(0, K + 1); s.win = []; ev.stepDown = pv; }
    }
    return ev;
  }
  function endProbe(p, T) { var pr = T.probe, L = LAD[bandOf(p)]; if (pr.right >= 0) for (var i = pr.from; i <= pr.right; i++) { var q = sst(p, L[i].id); if (q.status !== 'mastered') { q.status = 'mastered'; q.placed = true; q.by = 'warmup'; q.due = now() + 3 * DAY; q.gap = 1; } } T.probe = null; fill(p, T, L); }
  /* end of round: 1-3 stars like one Munch round (1 for the round, +1 for 80%+ right first time, +1 for the golden bubble or a won storm) */
  function roundStars(res) { var s = 1; if (res.pops && res.first / res.pops >= .8) s++; if (res.golden || res.stormWon) s++; return Math.min(3, s); }
  function finishRound(p, res) { var g = data(p); g.rounds++; if (res.golden) g.golden++; if (res.stormTried) g.storm.tries++; if (res.stormWon) g.storm.wins++; g.lastDay = today(); return roundStars(res); }
  function friends(p) { var met = (A.Friends && A.Friends.of ? A.Friends.of(p) : Object.keys((p.unlocks && p.unlocks.blobs) || {})); if (p.blob && met.indexOf(p.blob) < 0) met = [p.blob].concat(met); return met.length ? met : ['strawberry']; }
  function summary(p) { var b = bandOf(p), T = track(p); return { band: b, learn: T.learn.slice(), steps: LAD[b].map(function (s) { var q = sst(p, s.id); return { id: s.id, name: s.name, status: q.status, placed: !!q.placed, n: q.n, acc: q.n ? Math.round(100 * q.ok / q.n) : null }; }).filter(function (x) { return x.status !== 'locked'; }) }; }
  A.Bubble = { COLORS: COLORS, SHAPES: SHAPES, ANIMALS: ANIMALS, AN: AN, LETTERS: LETTERS, BEGIN: BEGIN, RHYMES: RHYMES, NUMW: NUMW, LAD: LAD, STEPS: STEPS, RULE: RULE, RULE_E: RULE_E,
    band: bandOf, toddler: toddler, stormOk: stormOk, fastMs: fastMs, data: data, state: sst, track: track, reached: reached, due: due, nextKind: nextKind, makeRound: makeRound, makeTarget: makeTarget,
    matches: matches, record: record, inBand: inBand, clozeT: clozeT, ready: ready, roundStars: roundStars, finishRound: finishRound, friends: friends, summary: summary,
    setClock: function (f) { NOWF = f; }, setRng: function (f) { RNG = f || Math.random; }, today: today };
})(window.Arcade);
