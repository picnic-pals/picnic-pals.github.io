/* Picnic Pals — food FRIENDS (was Blob Arcade blob friends): little bios and friendship levels (Blob Room).
   Friendship grows when a kid plays games AS that blob (1 point per star earned), visits the room (each friend
   living there: +1 once a day) and taps a friend in the room (+1, up to 3 a day each). Levels unlock small things:
     2 Pal          → "likes" (read aloud in the bio)
     3 Good friend  → a new face (expression) the blob shows in the room
     4 Best friend  → dislikes + favorite food
     5 Forever      → a present: the blob's favorite room item (free), and a golden frame
   State per profile: p.friends[blobId] = { pts, lvl, day, taps, visit, news: [levels not yet celebrated] }. */
(function (A) {
  'use strict';
  var LEVELS = [0, 8, 20, 40, 70];               // points needed for levels 1..5
  var NAMES = ['New friend', 'Pal', 'Good friend', 'Best friend', 'Forever friend'];
  var TAPS_PER_DAY = 3;
  // personality: walk speed, how often they nap, what they like to visit
  // room behaviour carried over from the old blob each food friend replaced (art/foods/README.md migration table); others get a default
  var ROOM = {
    mochi: { face: 'love', fav: 'snackcart', speed: 1, napP: .15, likes: ['snackcart', 'table_round', 'rug_round'] },
    strawberry: { face: 'wink', fav: 'bed_cloud', speed: 1.1, napP: .2, likes: ['bed_cloud', 'beanbag_pink', 'sofa', 'rug_round'] },
    carrot: { face: 'wink', fav: 'soccergoal', speed: 1.6, napP: .05, likes: ['soccergoal', 'soccerball', 'batrack', 'hoop'] },
    blueberry: { face: 'wow', fav: 'fishtank', speed: 1.1, napP: .1, likes: ['fishtank', 'plant_tall', 'bookshelf', 'telescope'] },
    corn: { face: 'silly', fav: 'toybox', speed: 1.3, napP: .08, likes: ['toybox', 'blocks', 'train', 'drum', 'plant_cactus'] },
    grapes: { face: 'starry', fav: 'telescope', speed: .85, napP: .2, likes: ['telescope', 'lamp_star', 'poster_space', 'fairylights'] },
    pear: { face: 'dreamy', fav: 'bed_cloud', speed: .7, napP: .45, likes: ['bed_cloud', 'beanbag_blue', 'bed_simple'] },
    banana: { face: 'silly', fav: 'toybox', speed: 1.4, napP: .06, likes: ['toybox', 'hoop', 'blocks'] },
    broccoli: { face: 'love', fav: 'plant_tree', speed: 1, napP: .1, likes: ['plant_tree', 'plant_tall', 'bookshelf'] }
  };
  function low(t) { return t ? t.charAt(0).toLowerCase() + t.slice(1) : t; }
  // bios from art/foods/bios.json (via foods-data.js), read aloud by the browser voice unless clips exist
  var BIO = {};
  ((A.FoodData && A.FoodData.cast) || []).forEach(function (c) {
    var r = ROOM[c.id] || { face: 'love', fav: 'rug_round', speed: 1, napP: .12, likes: ['rug_round', 'sofa', 'table_round'] }, n = c.name, cp = c.catchphrase || '';
    var fav = (c.favorite || '').replace(/^"|"$/g, '');
    BIO[c.id] = { face: r.face, fav: r.fav, speed: r.speed, napP: r.napP, likes: r.likes,
      hi: 'This is ' + n + '! ' + n + ' is ' + low(c.personality).replace(/\.$/, '') + '.',
      lk: n + "'s favorite thing is " + low(fav).replace(/\.$/, '') + '.',
      dl: n + ' always says: ' + cp,
      food: n + ' is a ' + low(c.food).replace(/ \(.*\)$/, '') + ' and loves a good picnic.',
      taps: [cp.replace(/^["“]|["”]$/g, ''), 'Hi, friend!', "It's picnic time!"], napLine: 'Zzz... picnic dreams...' };
  });
  function today() { return A.today ? A.today() : new Date().toISOString().slice(0, 10); }
  function st(p, b) { var f = p.friends || (p.friends = {}); return f[b] || (f[b] = { pts: 0, lvl: 1, day: '', taps: 0, visit: '', news: [] }); }
  function lvlFor(pts) { var l = 1; for (var i = 0; i < LEVELS.length; i++) if (pts >= LEVELS[i]) l = i + 1; return l; }
  function has(p, b) { return p.blob === b || !!(p.unlocks && p.unlocks.blobs && p.unlocks.blobs[b]); }
  /* add friendship points; returns the new level if it went up (and queues it for the room to celebrate) */
  function add(p, b, n, why) {
    if (!p || p.guest || !BIO[b] || !has(p, b) || !(n > 0)) return 0;
    var s = st(p, b), before = s.lvl; s.pts += n; s.lvl = lvlFor(s.pts);
    if (s.lvl > before) { for (var l = before + 1; l <= s.lvl; l++) s.news.push(l); A.emit && A.emit('friend:level', { p: p, blob: b, lvl: s.lvl, why: why }); return s.lvl; }
    return 0;
  }
  function tap(p, b) { var s = st(p, b), d = today(); if (s.day !== d) { s.day = d; s.taps = 0; } if (s.taps >= TAPS_PER_DAY) return { pts: 0, lvl: 0 }; s.taps++; return { pts: 1, lvl: add(p, b, 1, 'tap') }; }
  function visit(p) { var d = today(), ups = []; friendsOf(p).forEach(function (b) { var s = st(p, b); if (s.visit !== d) { s.visit = d; var l = add(p, b, 1, 'visit'); if (l) ups.push(b); } }); return ups; }
  function friendsOf(p) { return A.Blobs.CAST.map(function (c) { return c.id; }).filter(function (b) { return has(p, b); }); }
  /* what a friend has unlocked so far */
  function info(p, b) {
    var s = st(p, b), bio = BIO[b], L = s.lvl;
    return { blob: b, lvl: L, name: NAMES[L - 1], pts: s.pts, next: L < 5 ? LEVELS[L] : null, prev: LEVELS[L - 1],
      likes: L >= 2, face: L >= 3 ? bio.face : null, dislikes: L >= 4, food: L >= 4, gift: L >= 5, fav: bio.fav,
      nextUnlock: ['', 'what I like', 'a new face', 'more about me', 'a present for your room', ''][L] || '' };
  }
  /* voice parts for the bio card (only what is unlocked) */
  function bioParts(p, b) { var i = info(p, b), v = ['fr_' + b + '_hi']; if (i.likes) v.push('fr_' + b + '_likes'); if (i.dislikes) v.push('fr_' + b + '_dislikes'); if (i.food) v.push('fr_' + b + '_food'); return v; }
  function takeNews(p) { var out = []; friendsOf(p).forEach(function (b) { var s = st(p, b); while (s.news.length) out.push({ blob: b, lvl: s.news.shift() }); }); return out; }
  A.Friends = { BIO: BIO, LEVELS: LEVELS, NAMES: NAMES, TAPS_PER_DAY: TAPS_PER_DAY, state: st, add: add, tap: tap, visit: visit, info: info, of: friendsOf, bioParts: bioParts, takeNews: takeNews, levelFor: lvlFor };
})(window.Arcade);
