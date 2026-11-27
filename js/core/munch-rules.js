/* Picnic Munch rule deck: one named rule per board, rotated by age band.
   Math and early-reading Free Play boards vary; locked-in skills stay when pinned.
   PreK/K reading tiles: hand-drawn picture + word. 1st/2nd: word only. No emoji tiles.
   Missing Kokoro clips use the device-speech fallback and are listed, never generated. */
(function (A) {
  'use strict';
  var C = A.Curriculum, rnd = A.rnd, pick = A.pick;
  var missingClips = {}, missingPics = {};

  function player(p) {
    return p || (A.Steps && A.Steps.ctx && A.Steps.ctx.p) || (A.Store && A.Store.active && A.Store.active()) || null;
  }
  function bandOf(p) {
    var b = (A.Age && A.Age.band) ? A.Age.band(player(p)) : 'none';
    if (!b || b === 'none' || b === 'toddler' || b === 'pre' || b === 'pk') return 'pk';
    if (b === 'k') return 'k';
    if (b === 'g1' || b === 'g2') return 'g1';
    return 'g2';
  }
  function littleReader(p) { var b = bandOf(p); return b === 'pk' || b === 'k'; }
  function em(t) { return '<b class="hl">' + t + '</b>'; }
  function clipOk(id) {
    if (id == null) return false;
    if (typeof id === 'number') id = 'num_' + id;
    try { return !!(A.Voice && ((A.Voice.ttsFor && A.Voice.ttsFor(id)) || (A.Voice.fileFor && A.Voice.fileFor(id)))); }
    catch (e) { return false; }
  }
  function noteClip(id, text) {
    if (!id || clipOk(id)) return;
    if (!missingClips[id]) missingClips[id] = text || id;
  }
  function notePic(w) {
    if (w && !missingPics[w]) missingPics[w] = 1;
  }
  function part(id, text) {
    if (typeof id === 'number') { noteClip('num_' + id, String(id)); return { id: 'num_' + id, text: String(id) }; }
    noteClip(id, text || id);
    return { id: id, text: text != null ? text : id };
  }
  var HAND_ART = {
    airplane:1, ant:1, apple:1, ball:1, balloon:1, banana:1, basket:1, basketball:1, bat:1, bear:1,
    beaver:1, bed:1, bee:1, bell:1, bento:1, bike:1, bird:1, "birthday cake":1, blueberries:1, blueberry:1,
    boat:1, bolt:1, bone:1, book:1, box:1, bread:1, brick:1, broccoli:1, bulb:1, bus:1,
    butterfly:1, cactus:1, cake:1, calendar:1, camel:1, candy:1, "canned food":1, cap:1, car:1, carrot:1,
    cat:1, caterpillar:1, chain:1, chair:1, cheese:1, cheetah:1, cherries:1, "cherry blossom":1, chestnut:1, chick:1,
    chicken:1, chipmunk:1, chocolate:1, clock:1, clover:1, coat:1, coconut:1, "cold face":1, cold_face:1, cookie:1,
    corn:1, cow:1, crab:1, crocodile:1, crown:1, cucumber:1, cup:1, "cup with straw":1, cupcake:1, deer:1,
    desert:1, dice:1, dinosaur:1, dish:1, dog:1, dolphin:1, donut:1, door:1, droplet:1, drum:1,
    duck:1, eagle:1, ear:1, egg:1, eggplant:1, elephant:1, eyes:1, feather:1, fire:1, "fire truck":1,
    fire_truck:1, fish:1, flamingo:1, foot:1, fox:1, frog:1, gamepad:1, giraffe:1, globe:1, gloves:1,
    goat:1, grapes:1, "green apple":1, guitar:1, hamburger:1, hammer:1, hat:1, "hatching chick":1, hedgehog:1, helicopter:1,
    hippo:1, hippopotamus:1, honey:1, horse:1, house:1, ice:1, "ice cream":1, "ice cube":1, ice_cream:1, jam:1,
    jeans:1, "juice box":1, kangaroo:1, key:1, kite:1, kiwi:1, koala:1, ladybug:1, leaf:1, "leaf fluttering":1,
    leaves:1, leg:1, lemon:1, leopard:1, "light bulb":1, light_bulb:1, lightning:1, lion:1, lizard:1, lock:1,
    lollipop:1, lotus:1, magnet:1, map:1, "meat on bone":1, milk:1, mittens:1, monkey:1, moon:1, mouse:1,
    mushroom:1, nest:1, "nest with eggs":1, nose:1, octopus:1, orange:1, owl:1, paint:1, painting:1, pancake:1,
    panda:1, parrot:1, "paw prints":1, peach:1, pear:1, pen:1, pencil:1, penguin:1, pie:1, pig:1,
    pin:1, pineapple:1, pizza:1, plane:1, planet:1, plant:1, plate:1, "polar bear":1, polar_bear:1, popcorn:1,
    "pot of food":1, potato:1, "potted plant":1, pumpkin:1, rabbit:1, raccoon:1, rain:1, rainbow:1, "red apple":1, ring:1,
    robin:1, robot:1, rock:1, rocket:1, rose:1, sailboat:1, salad:1, salt:1, sandwich:1, seal:1,
    "see-no-evil monkey":1, shark:1, sheep:1, shell:1, ship:1, shirt:1, shoe:1, shortcake:1, shorts:1, sled:1,
    snail:1, snake:1, "snow cloud":1, snowflake:1, snowman:1, soap:1, soccer:1, "soccer ball":1, sock:1, spider:1,
    "spider web":1, spoon:1, storm:1, strawberry:1, sun:1, "sun rain":1, sunflower:1, sunglasses:1, sunrise:1, sunset:1,
    taco:1, "tanabata tree":1, teddy:1, "teddy bear":1, teeth:1, tent:1, thermometer:1, tie:1, tiger:1, tomato:1,
    tooth:1, tornado:1, train:1, tree:1, "tropical drink":1, turtle:1, "two-hump camel":1, umbrella:1, van:1, volcano:1,
    waffle:1, "water drop":1, watermelon:1, web:1, whale:1, wind:1, window:1, wing:1, wood:1, worm:1,
    zebra:1
  };
  function hasArt(w) {
    if (!w) return false;
    var key = String(w).toLowerCase();
    if (A.Icons && A.Icons.hasWordArt && A.Icons.hasWordArt(key)) return true;
    if (A.EarlyWords && A.EarlyWords.hasWordArt && A.EarlyWords.hasWordArt(key)) return true;
    if (A.Icons && A.Icons.hasRhymeArt && A.Icons.hasRhymeArt(key)) return true;
    if (A.EarlyWords && A.EarlyWords.hasRhymeArt && A.EarlyWords.hasRhymeArt(key)) return true;
    if (!HAND_ART[key] || !A.Icons) return false;
    var e = A.EarlyWords && A.EarlyWords.PICS && A.EarlyWords.PICS[w];
    var opt = { word: w, context: 'quiz' };
    return !!(A.Icons.has(e, opt) || A.Icons.has(w, opt) || A.Icons.has(null, opt));
  }
  function frame(v) {
    if (A.CountVisual && A.CountVisual.html) return A.CountVisual.html(v, { pattern: v <= 5 ? 'five_frame' : 'ten_frame' });
    return String(v);
  }
  function keyOf(rule) { return String((rule && (rule.deckKind || '')) + ':' + (rule && rule.target != null ? rule.target : '')); }

  function isFamily(id) {
    return /^(count10|pk_compare|compare|add10|sub10|add20|sub20|make10|evenodd|letters|begsound|rhymes|sight|sight2|sight3)$/.test(id || '');
  }
  function subjectOf(id) {
    var s = C && C.byId && C.byId[id];
    if (s && s.subject) return s.subject;
    if (/^(letters|begsound|rhymes|sight|sight2|sight3)$/.test(id || '')) return 'reading';
    return 'math';
  }

  /* ---------- math rule builders ---------- */
  function findN(band) {
    var max = band === 'pk' ? 5 : 10, N = band === 'pk' ? rnd(0, 5) : rnd(0, 10);
    if (band === 'pk' && N === 0 && Math.random() < .5) N = rnd(1, 5);
    function mk(v) {
      var kind = Math.random();
      var html = null;
      if (v > 0 && kind < .5) html = frame(v);
      return { label: String(v), html: html, fact: v === N ? ['w_thats', part(v)] : ['w_thats', part(v), 'w_not', part(N)] };
    }
    return { text: 'Munch the number ' + em(N), hint: 'Look for ' + N + '.', say: ['munch_rule_number', N],
      target: N, deckKind: 'find', good: function () { return mk(N); },
      bad: function () { var w; do { w = rnd(0, max); } while (w === N); return mk(w); } };
  }
  function compareN(band, mode) {
    var max, N, big;
    if (mode === 'greater10') { max = band === 'g2' ? 40 : 20; N = 10; big = true; }
    else if (mode === 'less10') { max = 10; N = 10; big = false; }
    else if (mode === 'greater20') { max = 40; N = 20; big = true; }
    else if (band === 'pk') { max = 5; N = rnd(1, 3); big = mode !== 'smaller'; }
    else if (band === 'k') { max = 10; N = rnd(3, 7); big = mode === 'smaller' ? false : mode === 'bigger' ? true : Math.random() < .5; }
    else if (band === 'g2') { max = 40; N = rnd(15, 25); big = mode === 'smaller' ? false : mode === 'bigger' ? true : Math.random() < .5; }
    else { max = 20; N = rnd(6, 14); big = mode === 'smaller' ? false : mode === 'bigger' ? true : Math.random() < .5; }
    if (N < 1) N = 1; if (N >= max) N = max - 1;
    var lo = 0;
    function mk(v) { return { label: String(v), fact: [part(v), v > N ? 'w_bigger_than' : v < N ? 'w_smaller_than' : 'w_same_as', part(N)] }; }
    var say, text, kind;
    if (mode === 'greater10') { text = 'Munch numbers greater than ' + em(10); say = [part('munch_rule_greater_10', 'Munch numbers greater than 10')]; kind = 'greater10'; }
    else if (mode === 'less10') { text = 'Munch numbers less than ' + em(10); say = [part('munch_rule_less_10', 'Munch numbers less than 10')]; kind = 'less10'; }
    else if (mode === 'greater20') { text = 'Munch numbers greater than ' + em(20); say = [part('munch_rule_greater_20', 'Munch numbers greater than 20')]; kind = 'greater20'; }
    else { text = 'Munch numbers ' + (big ? 'bigger' : 'smaller') + ' than ' + em(N); say = [big ? 'munch_rule_bigger' : 'munch_rule_smaller', N]; kind = big ? 'bigger' : 'smaller'; }
    return { text: text, hint: big ? 'More than ' + N : 'Less than ' + N, say: say, target: kind + N, deckKind: kind,
      good: function () { return mk(big ? rnd(N + 1, max) : rnd(lo, N - 1)); },
      bad: function () { return mk(Math.random() < .2 ? N : (big ? rnd(lo, N - 1) : rnd(N + 1, max))); } };
  }
  function evenOdd(band, to100) {
    var max = to100 || band === 'g2' ? 40 : band === 'pk' ? 10 : band === 'k' ? 10 : 20;
    if (band === 'g2' && to100) max = 100;
    var even = Math.random() < .5;
    function num(par) { var v, g = 0; do { v = rnd(1, max); } while ((v % 2 === 0) !== par && g++ < 40); return v; }
    function mk(v) { return { label: String(v), fact: [part(v), v % 2 ? 'w_is_odd' : 'w_is_even'] }; }
    return { text: 'Munch the ' + em(even ? 'even' : 'odd') + ' numbers', hint: even ? '2, 4, 6, 8 … they make pairs!' : '1, 3, 5, 7 … one is left over!',
      say: [even ? 'munch_rule_even' : 'munch_rule_odd'], target: even ? 'even' : 'odd', deckKind: to100 ? 'even100' : 'evenodd',
      good: function () { return mk(num(even)); }, bad: function () { return mk(num(!even)); } };
  }
  function multiples(band) {
    var n = band === 'g2' ? pick([3, 4]) : pick([2, 5, 10]);
    var max = n === 10 ? 100 : n === 5 ? 50 : 40;
    if (n === 2) max = 20;
    function ok(v) { return v >= n && v <= max && v % n === 0; }
    function goodN() { return n * rnd(1, Math.floor(max / n)); }
    function badN() { var v, g = 0; do { v = rnd(1, max); } while (ok(v) && g++ < 40); return v; }
    return { text: 'Munch the multiples of ' + em(n), hint: 'Count by ' + n + 's.',
      say: [part('munch_rule_multiples', 'Munch the multiples of'), n], target: n, deckKind: 'multiples',
      good: function () { return { label: String(goodN()), fact: [part(goodN())] }; },
      bad: function () { var v = badN(); return { label: String(v), fact: [part(v), 'w_not', part(n)] }; } };
  }
  function endsWith(digit) {
    var d = digit != null ? digit : pick([0, 5]), max = 100;
    function ok(v) { return v >= 0 && v <= max && (Math.abs(v) % 10) === d; }
    function goodN() { var t = rnd(0, Math.floor(max / 10)); return t * 10 + d; }
    function badN() { var v, g = 0; do { v = rnd(0, max); } while (ok(v) && g++ < 40); return v; }
    return { text: 'Munch numbers that end with ' + em(d), hint: 'Look at the last digit.',
      say: [part('munch_rule_ends_with', 'Munch numbers that end with'), d], target: d, deckKind: 'ends',
      good: function () { var v = goodN(); return { label: String(v), fact: [part(v)] }; },
      bad: function () { var v = badN(); return { label: String(v), fact: [part(v)] }; } };
  }
  function fromSkill(id, level, used) {
    var s = C && C.byId && C.byId[id];
    if (!s || !s.gen) return null;
    var rule, k, t = 0;
    do { rule = s.gen(level); k = keyOf(Object.assign({ deckKind: id }, rule)); } while (used && used.indexOf(k) >= 0 && t++ < 8);
    if (rule) { rule.deckKind = rule.deckKind || id; if (/^(letters|begsound|rhymes|sight|sight2|sight3)$/.test(id)) { rule.reading = true; rule.sayWord = true; } }
    return rule;
  }
  function equalsN(band, used) {
    var id = (band === 'g2' || band === 'g1') && Math.random() < .35 && C.byId.add20 ? 'add20' : 'add10';
    if (band === 'k' || band === 'pk') id = C.byId.add10 ? 'add10' : 'count10';
    var level = band === 'pk' ? 0 : (band === 'k' || band === 'g2' ? 1 : 0);
    var r = fromSkill(id, level, used);
    if (r) r.deckKind = 'equals';
    return r;
  }

  /* ---------- reading: same-ending (1st/2nd), using existing rhyme families ---------- */
  function sameEnding(used) {
    var E = A.EarlyWords;
    if (!E || !E.RHYMES) return fromSkill('rhymes', 1, used);
    var families = { oat: 'boat', ake: 'cake', ar: 'car', ee: 'tree', air: 'chair', ock: 'sock', ed: 'sled', ain: 'train' };
    var ids = Object.keys(families).filter(function (k) { return E.RHYMES[k] && E.RHYMES[k].length >= 2; });
    if (!ids.length) return fromSkill('rhymes', 1, used);
    var setId = pick(ids), T = families[setId], set = (E.RHYMES[setId] || []).slice();
    var far = [];
    Object.keys(E.RHYMES).forEach(function (k) { if (k !== setId) far = far.concat(E.RHYMES[k]); });
    if (E.RHYME_OTHERS) far = far.concat(E.RHYME_OTHERS);
    var line = E.pic ? E.pic(T).line : 'pw_' + T;
    noteClip(line, T);
    function cell(w, ok) {
      var p = E.pic ? E.pic(w) : { line: 'pw_' + w };
      noteClip(p.line, w);
      return { label: w, html: '<span class="ea-word">' + String(w).replace(/</g, '') + '</span>',
        fact: ok ? [p.line, 'w_rhymes_with', line] : [p.line, 'w_no_rhyme', line], name: [p.line], k: w };
    }
    var others = set.filter(function (w) { return w !== T; });
    if (!others.length) others = set.slice();
    return { text: 'Munch the ones with the same ending as ' + em(T), hint: 'Does it end like ' + T + '?',
      say: [part('munch_rule_ends_like', 'Munch the ones with the same ending as'), { id: line, text: T }],
      target: T, deckKind: 'ending', reading: true, sayWord: true,
      good: function () { return cell(pick(others), true); },
      bad: function () { return cell(pick(far.length ? far : ['sun', 'dog', 'map']), false); } };
  }

  function mathDeck(band) {
    if (band === 'pk') return ['find', 'bigger'];
    if (band === 'k') return ['find', 'bigger', 'smaller', 'evenodd', 'equals'];
    if (band === 'g1') return ['equals', 'evenodd', 'multiples', 'greater10', 'less10'];
    return ['equals', 'multiples', 'greater20', 'even100', 'ends', 'evenodd'];
  }
  function readingDeck(band) {
    if (band === 'pk') return ['letters', 'begsound', 'rhymes'];
    if (band === 'k') return ['begsound', 'rhymes', 'sight', 'letters'];
    if (band === 'g1') return ['sight', 'rhymes', 'begsound', 'ending'];
    return ['sight', 'rhymes', 'ending', 'begsound'];
  }

  function buildKind(kind, band, used, p) {
    if (kind === 'find') return findN(band);
    if (kind === 'bigger' || kind === 'smaller') return compareN(band, kind);
    if (kind === 'greater10' || kind === 'less10' || kind === 'greater20') return compareN(band, kind);
    if (kind === 'evenodd') return evenOdd(band, false);
    if (kind === 'even100') return evenOdd(band, true);
    if (kind === 'multiples') return multiples(band);
    if (kind === 'ends') return endsWith();
    if (kind === 'equals') return equalsN(band, used);
    if (kind === 'ending') return sameEnding(used);
    var level = (band === 'k' || band === 'g2') ? 1 : 0;
    if (kind === 'sight' && band === 'g2' && C.byId.sight3) return fromSkill('sight3', level, used);
    if (kind === 'sight' && (band === 'g1' || band === 'g2') && C.byId.sight2) return fromSkill(C.byId.sight3 && band === 'g2' ? 'sight3' : 'sight2', level, used);
    return fromSkill(kind, level, used);
  }

  function pickRule(pl, used) {
    var p = pl.P || player(), band = bandOf(p), sid = pl.round && pl.round.skill && pl.round.skill.id;
    var subj = subjectOf(sid);
    var deck = (subj === 'reading' ? readingDeck : mathDeck)(band).slice();
    var usedKinds = (used || []).map(function (k) { return String(k).split(':')[0]; });
    var fresh = deck.filter(function (k) { return usedKinds.indexOf(k) < 0; });
    if (!fresh.length) fresh = deck.slice();
    A.shuffle(fresh);
    var i, rule;
    for (i = 0; i < fresh.length; i++) {
      rule = buildKind(fresh[i], band, used, p);
      if (rule) return rule;
    }
    return null;
  }

  function applies(pl) {
    if (!pl || !pl.round || !pl.round.skill || !pl.P || pl.P.guest) return false;
    var r = pl.round;
    if (r.review || r.testOut || r.placement || r.dropBack || r.check || r.topic || r.challenge || r.hard || r.story) return false;
    if (pl.P.math && pl.P.math.pin) return false;
    if (r.tier) return false;
    if (r.boards && r.boards < 2) return false;
    return isFamily(r.skill.id);
  }

  function ruleFor(pl, opt) {
    opt = opt || {};
    if (!pl || !pl.round || !pl.round.skill || !pl.round.skill.gen) return null;
    if (opt.hard || opt.tier) return null;
    var r = pl.round, used = r.deckUsed || (r.deckUsed = []);
    var rule = null;
    if (applies(pl) && (r.board || 1) > 1) rule = pickRule(pl, used);
    if (!rule) {
      var t = 0, k;
      do { rule = r.skill.gen(r.level); k = keyOf(Object.assign({ deckKind: r.skill.id }, rule || {})); } while (used.indexOf(k) >= 0 && t++ < 8);
      if (rule && !rule.deckKind) rule.deckKind = r.skill.id;
    }
    if (rule) used.push(keyOf(rule));
    return rule;
  }

  A.MunchRules = {
    bandOf: bandOf, littleReader: littleReader, hasArt: hasArt, applies: applies, ruleFor: ruleFor,
    pick: pickRule, isFamily: isFamily, mathDeck: mathDeck, readingDeck: readingDeck, buildKind: buildKind,
    noteClip: noteClip, notePic: notePic, clipOk: clipOk, part: part,
    missingClips: function () { return Object.keys(missingClips).sort().map(function (id) { return { id: id, text: missingClips[id] }; }); },
    missingPics: function () { return Object.keys(missingPics).sort(); }
  };
})(window.Arcade);
