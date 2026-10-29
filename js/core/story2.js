/* Picnic Pals — Story mode v2 (story2, 2026-10-29, owner-approved Phase 3 plan). No DOM here; the maps live in games/munch/story2-map.js.
   · A world of PLACES. Each place has its own map: 4 trail stops + a gentle mini boss (main places) or its 6 side stops, the last one
     the mini boss (Letter Lagoon, Word Woods). A place shows only once it is reached (the boss of the place before it was passed);
     nothing about later places is ever shown or named.
   · Levels ARE the existing Story stops (saves stay by stop index + path, so Munch / Slugger / Stand / Bubble stops all keep working).
     Main-place bosses are extra side-style stops appended after every other stop (old indices never move).
   · Your friend is the hero: p.story.hero (default: the friend the kid picked, p.blob). Each hero keeps its own story progress:
     p.story is the active hero's progress and p.storyHeroes[id] holds the others (switching swaps them, so every older piece of code
     that reads p.story keeps working). Shared bits (intro seen, book mode) carry over.
   · Old saves: migrate() (idempotent, s.v2 = 1) gives the current progress to the current friend and marks the bosses of every place
     before the furthest place already played as passed (migrated, no stars), so nothing played is ever hidden.
   · Skill cap: every stop asks at most one step above the kid's current step (math: Story.fitStop; reading/early side stops: capV2).
   · Toddlers / age 3 and under get the simple version: each place is 2 stops + the boss, with 5 snacks. */
(function (A) {
  'use strict';
  var ST = A.Story; if (!ST) return;
  var STARTERS = ['strawberry', 'apple', 'corn', 'blueberry'];
  var PLACES = [
    { id: 'meadow', name: 'Berry Meadow', emoji: '🌼', areas: ['meadow', 'cliffs'], guide: '🐰', deco: ['🦋', '🌷', '🐝', '🌼', '🦋', '🌷'], sound: 'chirp', boss: 'the Giant Dandelion Puff', bossEmoji: '🌬️', theme: ['#c8f2b8', '#fff6c8'] },
    { id: 'lagoon', name: 'Letter Lagoon', emoji: '🪷', areas: ['lagoon'], guide: '🐸', deco: ['🪷', '🫧', '💧', '🪷', '🫧', '🐟'], sound: 'ribbit', boss: 'the Big Lily Pad Hop', bossEmoji: '🐸', theme: ['#a8e4f0', '#d8f6ff'] },
    { id: 'hills', name: 'Muffin Hills', emoji: '🧁', areas: ['beach', 'woods'], guide: '🐿️', deco: ['🧁', '🌳', '🍂', '🧁', '🌳', '🔔'], sound: 'bell', boss: 'the Tall Muffin Tower', bossEmoji: '🧁', theme: ['#ffe6c2', '#fff4e0'] },
    { id: 'woods', name: 'Word Woods', emoji: '🌲', areas: ['wordwoods'], guide: '🦉', deco: ['🌲', '✨', '🍄', '🌲', '✨', '🌙'], sound: 'hoot', boss: 'the Sleepy Owl Riddle', bossEmoji: '🦉', theme: ['#9fd59a', '#d9f2c8'] },
    { id: 'peaks', name: 'Pancake Peaks', emoji: '🥞', areas: ['grove', 'town'], guide: '🐐', deco: ['🥞', '⛰️', '☁️', '🍯', '⛰️', '🥞'], sound: 'whoosh', boss: 'the Wobbly Pancake Stack', bossEmoji: '🥞', theme: ['#e6dcff', '#fff1d6'] },
    { id: 'bay', name: 'Melon Bay', emoji: '🍉', areas: ['caves', 'bay'], guide: '🦀', deco: ['🍉', '🌊', '🐚', '⛵', '🌊', '🐚'], sound: 'wave', boss: 'the Great Sand Castle', bossEmoji: '🏰', theme: ['#b8e2ff', '#fff0c8'] },
    { id: 'caves', name: 'Cookie Caves', emoji: '🍪', areas: ['volcano', 'lighthouse'], guide: '🐛', deco: ['🍪', '💎', '✨', '🍪', '💎', '🕯️'], sound: 'drip', boss: 'the Cookie Crystal Cave', bossEmoji: '💎', theme: ['#d6cdea', '#f3ecff'] }
  ];
  // starter plot flavors (each hero's own short line on the world map and at every new place; name-free voice + {hero} text)
  var FLAVOR = {
    strawberry: { how: 'plans the way', tag: 'With a picnic plan, we will find everyone!', boss: 'A plan and a smile. You can do it!' },
    apple: { how: 'reads the map', tag: 'My compass points this way. Let\'s explore!', boss: 'Explorers try big things. Let\'s try!' },
    corn: { how: 'tells silly jokes', tag: 'Knock knock! It\'s us, coming to find you!', boss: 'Big challenge? Big giggles! Let\'s go!' },
    blueberry: { how: 'bounces up high to look', tag: 'Boing! I can see far from up here!', boss: 'Boing boing! Let\'s bounce through it!' },
    other: { how: 'helps the friends', tag: 'Let\'s go find our friends together!', boss: 'This one is big and fun. Let\'s try!' }
  };
  var SIMPLE_N = 2;
  /* ---------- levels ---------- */
  var BYAREA = {}; ST.AREAS.forEach(function (a, ai) { BYAREA[a.id] = ai; });
  var FIRST_NEW = ST.STOPS.length;   // stops added below (trail + boss) start here
  var LEVELS = [];   // per place: stop indices in order (the last one is the mini boss)
  var BOSS = {};     // stop index -> place index
  PLACES.forEach(function (pl, k) {
    var idx = []; pl.areas.forEach(function (aid) { ST.STOPS.forEach(function (s) { if (s.area.id === aid) idx.push(s.i); }); });
    pl.side = pl.areas.length === 1 && ST.AREAS[BYAREA[pl.areas[0]]] && ST.AREAS[BYAREA[pl.areas[0]]].side;
    if (!pl.side) { var last = ST.STOPS[idx[idx.length - 1]];
      // a 5th trail level (the place's last skill again, a little longer) so every main place has 6 levels: 5 stops + the boss
      ST.addArea({ id: 'trail_' + pl.id, name: pl.name, emoji: pl.emoji, friend: 'strawberry', side: true, trail: true, place: pl.id, stops: [last.area.skill], skill: last.area.skill, bg: pl.theme[0], beat: '' }); idx.push(ST.STOPS.length - 1);
      var a = ST.addArea({ id: 'boss_' + pl.id, name: pl.name, emoji: pl.bossEmoji, friend: 'strawberry', side: true, boss: true, place: pl.id, stops: [last.area.skill], skill: last.area.skill, bg: pl.theme[0], beat: '' });
      idx.push(ST.STOPS.length - 1); }
    if (!pl.side) { var src = ST.STOPS[idx[idx.length - 3]]; idx.slice(-2).forEach(function (j) { var sj = ST.STOPS[j];   // follow the area's skill even if a later file renames it
      Object.defineProperty(sj.area, 'skill', { get: function () { return src.area.skill; }, enumerable: true, configurable: true });
      Object.defineProperty(sj.area, 'stops', { get: function () { return [src.area.skill]; }, enumerable: true, configurable: true });
      Object.defineProperty(sj, 'skill', { get: function () { return src.area.skill; }, enumerable: true, configurable: true }); }); }
    LEVELS.push(idx); BOSS[idx[idx.length - 1]] = k; pl.ix = k;
  });
  function placeOfStop(i) { for (var k = 0; k < LEVELS.length; k++) if (LEVELS[k].indexOf(i) >= 0) return k; return -1; }
  function simple(p) { return !!(p && ((A.toddler && A.toddler(p)) || (p.age != null && p.age <= 3))); }
  function levels(p, k) { var L = LEVELS[k] || []; return simple(p) ? L.slice(0, SIMPLE_N).concat(L.slice(-1)) : L.slice(); }
  function isBoss(i) { return BOSS[i] != null; }
  function passed(p, i) { var r = ST.data(p).stops[ST.path(p) + ':' + i]; return !!(r && r.passed); }
  function bossPassed(p, k) { return passed(p, LEVELS[k][LEVELS[k].length - 1]); }
  var NOWF = function () { return Date.now(); };
  function dayOf(t) { var d = new Date(t); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  // the next place opens the day after its boss was first passed ("the path is ready tomorrow": a surprise saved for next time,
  // never a lock on anything already reached; replays and friend switches are always open). Migrated bosses open at once.
  function bossDayOk(p, k) { var r = ST.data(p).stops[ST.path(p) + ':' + LEVELS[k][LEVELS[k].length - 1]]; if (!r || !r.passed) return false; if (r.migrated || !r.firstPassAt) return true; return dayOf(r.firstPassAt) !== dayOf(NOWF()); }
  function waiting(p) { var R = reachedList(p), k = R[R.length - 1]; return k < PLACES.length - 1 && bossPassed(p, k) && !bossDayOk(p, k); }
  function reached(p, k) { migrate(p); return k === 0 || (k < PLACES.length && bossDayOk(p, k - 1)); }
  function reachedList(p) { var out = []; for (var k = 0; k < PLACES.length; k++) { if (reached(p, k)) out.push(k); else break; } return out; }
  function done(p, k) { return levels(p, k).every(function (i) { return passed(p, i); }); }
  function finished(p) { return PLACES.every(function (pl, k) { return bossPassed(p, k); }); }
  // a level is open when its place is reached and the level before it (in this kid's list) is passed; replays are always fine
  function playable(p, i) {
    var k = placeOfStop(i); if (k < 0 || !reached(p, k)) return false;
    var L = levels(p, k), j = L.indexOf(i); if (j < 0) return false;
    return j === 0 || passed(p, L[j - 1]) || passed(p, i);
  }
  function current(p, k) { var L = levels(p, k); for (var j = 0; j < L.length; j++) if (!passed(p, L[j])) return L[j]; return L[L.length - 1]; }
  function currentPlace(p) { var R = reachedList(p); for (var j = 0; j < R.length; j++) if (!done(p, R[j])) return R[j]; return R[R.length - 1]; }
  function progress(p, k) { var L = levels(p, k); return { n: L.filter(function (i) { return passed(p, i); }).length, of: L.length, stars: L.reduce(function (a, i) { var r = ST.data(p).stops[ST.path(p) + ':' + i]; return a + ((r && r.stars) || 0); }, 0) }; }

  /* ---------- heroes ---------- */
  function heroName(id) { var c = A.Blobs && A.Blobs.byId[id]; return c ? c.name : 'our friend'; }
  // "{hero} the {food}": short, natural food words ("Crisp the apple", "Niblet the corn"), not the catalog labels
  var FOOD = { pizza: 'pizza', corn: 'corn', grapes: 'bunch of grapes', popcorn: 'popcorn', pancake: 'pancake', watermelon: 'watermelon', mochi: 'rice dumpling', cookie: 'cookie', donut: 'donut', pretzel: 'pretzel', cheese: 'cheese', onigiri: 'rice ball', avocado: 'avocado', sushi: 'sushi' };
  function foodName(id) { if (FOOD[id]) return FOOD[id]; var c = A.Blobs && A.Blobs.byId[id]; return c ? String(c.food || '').toLowerCase().replace(/ \(.*\)$/, '') : 'friend'; }
  function met(p) { var b = (p.unlocks && p.unlocks.blobs) || {}, out = STARTERS.slice(); Object.keys(b).forEach(function (id) { if (out.indexOf(id) < 0 && A.Blobs && A.Blobs.byId[id]) out.push(id); });
    if (A.Rewards && A.Rewards.unlocked) out = out.filter(function (id) { return STARTERS.indexOf(id) >= 0 || A.Rewards.unlocked(p, 'blob', id); }); return out; }
  function hero(p) { var s = p.story || {}; var h = s.hero || p.blob || 'strawberry'; return met(p).indexOf(h) >= 0 ? h : (STARTERS.indexOf(p.blob) >= 0 ? p.blob : 'strawberry'); }
  function pals(p) { var h = hero(p), o = STARTERS.filter(function (x) { return x !== h; }).map(heroName); if (STARTERS.indexOf(h) < 0) return 'the picnic pals'; return o.slice(0, -1).join(', ') + ' and ' + o[o.length - 1]; }
  function fill(t, p) { return String(t).replace(/\{hero\}/g, heroName(hero(p))).replace(/\{food\}/g, foodName(hero(p))).replace(/\{pals\}/g, pals(p)); }
  function flavor(p) { return FLAVOR[hero(p)] || FLAVOR.other; }
  var SHARED = ['introSeen', 'bookMode', 'path'];
  function switchHero(p, id) {
    migrate(p); if (met(p).indexOf(id) < 0) return false; var cur = hero(p); if (cur === id) return true;
    var H = p.storyHeroes || (p.storyHeroes = {}); H[cur] = p.story;
    var nx = H[id] || { stops: {}, seen: {}, challenges: {}, v2: 1, placeV: 2, mixV: 1, hero: id }; delete H[id];
    SHARED.forEach(function (f) { if (p.story && p.story[f] != null && nx[f] == null) nx[f] = p.story[f]; });
    nx.seen = nx.seen || {}; nx.seen.prologue = nx.seen.prologue || Date.now();   // the picture book is the prologue now
    nx.hero = id; p.story = nx; var m = meta(p); m.heroAt = Date.now(); m.asked[id] = 1; return true;
  }
  function meta(p) { var m = p.storyMeta || (p.storyMeta = {}); m.asked = m.asked || {}; return m; }
  // after an unlock: a friend the kid has met but never been asked about → "play as … or keep going?" (once per friend)
  function askHero(p) { var m = meta(p), h = hero(p), list = met(p).filter(function (id) { return STARTERS.indexOf(id) < 0 && id !== h && !m.asked[id] && !(p.storyHeroes || {})[id]; }); return list[0] || null; }
  function heroes(p) { var H = p.storyHeroes || {}, h = hero(p); return met(p).map(function (id) { var s = id === h ? p.story : H[id]; return { id: id, name: heroName(id), active: id === h, started: !!(s && Object.keys(s.stops || {}).length) }; }); }

  /* ---------- migration (old saves never lose progress) ---------- */
  function migrate(p) {
    if (!p) return; var s = ST.data(p); if (s.v2) return;
    s.v2 = 1; if (!s.hero) s.hero = STARTERS.indexOf(p.blob) >= 0 || (p.blob && A.Blobs && A.Blobs.byId[p.blob]) ? p.blob : 'strawberry';
    if (s.introSeen) { s.seen = s.seen || {}; }
    ['big', 'little'].forEach(function (pa) {
      var far = -1; Object.keys(s.stops).forEach(function (key) { if (key.indexOf(pa + ':') !== 0) return; var r = s.stops[key]; if (!(r.passed || r.plays > 0)) return; var k = placeOfStop(+key.split(':')[1]); if (k > far) far = k; });
      for (var k = 0; k < far; k++) { var b = LEVELS[k][LEVELS[k].length - 1], kk = pa + ':' + b; if (!(s.stops[kk] && s.stops[kk].passed)) s.stops[kk] = { best: 0, stars: 0, passed: true, fails: 0, plays: 0, migrated: true }; }
    });
  }
  /* ---------- stop config: skill cap + gentle boss ---------- */
  function curOf(p, subj) { var C = A.Curriculum; try { var list = C.list(subj).map(function (k) { return k.id; }), cur = C.current(p, subj); return cur ? { id: cur.id, ix: list.indexOf(cur.id), list: list } : null; } catch (e) { return null; } }
  // side (reading / early) stops: at most ONE step above the kid's current reading step; a step not opened yet stays the kid's own
  function capV2(p, sid) {
    var cm = curOf(p, 'reading'); if (!cm || cm.ix < 0) return { skill: sid, capped: false };
    var ix = cm.list.indexOf(sid); if (ix < 0 || ix <= cm.ix + 1) return { skill: sid, capped: false };
    var nx = cm.list[cm.ix + 1], ns = null; try { ns = A.Curriculum.state(p, nx); } catch (e) {}
    return { skill: ns && ns.status !== 'locked' ? nx : cm.id, capped: true };
  }
  var baseConfig = ST.config;
  ST.config = function (p, i) {
    var c = baseConfig(p, i), st = ST.STOPS[i];
    if (st && st.side && !st.area.boss) { var f = capV2(p, c.skill); if (f.capped) { c.skill = f.skill; c.capped = true; c.level = 0; } }
    if (st && (st.area.boss || st.area.trail)) {   // main-place boss: plays like a main stop of the place's last area (fitted to the kid), a bit bigger
      var kk = placeOfStop(i), Lk = LEVELS[kk], last = ST.STOPS[Lk[Lk.length - 3]], f2 = ST.fitStop(p, last.area.skill, 1, ST.path(p) === 'little');
      c.skill = f2.skill; c.level = f2.level; c.capped = !!f2.capped;
    }
    if (isBoss(i)) { c.boss = true; c.nOk = simple(p) ? 5 : ST.path(p) === 'little' ? 7 : 10; c.timeX = (c.timeX || 1) * 1.5; c.bossName = PLACES[BOSS[i]].boss; }
    else if (simple(p)) c.nOk = Math.min(c.nOk, 5);
    return c;
  };
  var baseRecord = ST.record;
  ST.record = function (p, i, r) { var out = baseRecord(p, i, r); if (isBoss(i) && out.firstPass) { var x = ST.data(p).stops[ST.path(p) + ':' + i]; x.firstPassAt = NOWF(); out.bossDone = true; out.nextTomorrow = BOSS[i] < PLACES.length - 1; } return out; };
  var basePlayable = ST.playable;
  ST.playable = function (p, i) { var k = placeOfStop(i); if (k >= 0 && ST.ON2) return playable(p, i) || (i < FIRST_NEW && basePlayable(p, i)); return basePlayable(p, i); };   // the maps use Story2.playable; game pages also accept the old trail rule for the original stops (the stand/bubble/slugger stop pages)
  A.Story2 = { PLACES: PLACES, LEVELS: LEVELS, BOSS: BOSS, FLAVOR: FLAVOR, STARTERS: STARTERS, placeOfStop: placeOfStop, levels: levels, isBoss: isBoss, simple: simple,
    reached: reached, reachedList: reachedList, done: done, finished: finished, playable: playable, current: current, currentPlace: currentPlace, progress: progress,
    hero: hero, heroName: heroName, foodName: foodName, pals: pals, fill: fill, flavor: flavor, met: met, switchHero: switchHero, askHero: askHero, heroes: heroes, meta: meta,
    migrate: migrate, capV2: capV2, passed: passed, waiting: waiting, setClock: function (f) { NOWF = f || function () { return Date.now(); }; } };
  /* intro picture book v2 text (Learning Coach's 2026-10-25 revision as recorded in the notes: page 4 names no friends, pages 1 and 5
     follow the hero; pages 2-3 unchanged and keep their recorded clips). null = keep the page as it is. */
  // Learning Coach's intro text (2026-10-29, exact). simple = pre-readers and K, rich = readers. {hero} = the hero, {food} = its food.
  A.StoryBook2Text = [
    { simple: 'The sun is out. {hero} and the friends have a big picnic.', rich: 'It was a bright, sunny morning, and {hero} the {food} had planned the biggest picnic ever.' },
    { simple: 'Niblet is so silly! We all laugh and play.', rich: 'The food friends munched and played on the checkered blanket. Niblet told a corny joke, and everyone giggled.' },
    { simple: 'The friends look up. Oh no! The sky is gray.', rich: 'Suddenly the friends looked up. The sun was gone, and the sky turned gloomy and gray.' },
    { simple: 'Whoosh! Away go some of our friends!', rich: 'Whoosh! Balloons, books, and the picnic basket swirled into the air, and some of our friends tumbled away like dandelion fluff.' },
    { simple: '{hero} and the friends are sad. "We can find them," said {hero}. "Let\'s go!"', rich: '{hero} and the other friends stared at the empty blanket. Then {hero} stood tall. "Let\'s go! We will follow the paths and find every single friend."' }
  ];
  // toddlers (the simple version) play every story level as Munch: one game to learn, no Slugger/Stand/Bubble rules
  var baseGameOf = ST.gameOf; ST.gameOf = function (p, i) { if (ST.ON2 && simple(p) && A.toddler && A.toddler(p)) return 'munch'; return baseGameOf(p, i); };
  // the old island map (?map=1, remembered for the tab) keeps the old play rules; ?map=2 goes back to places
  ST.ON2 = true; try { var q = (window.location && location.search) || ''; if (/[?&]map=2\b/.test(q)) ST.ON2 = true; else if (/[?&]map=1\b/.test(q) || (window.sessionStorage && sessionStorage.getItem('blobArcade.map1') === '1')) ST.ON2 = false; } catch (e) {}
})(window.Arcade);
