/* Blob Arcade — blob FRIENDS: little bios and friendship levels (Blob Room).
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
  var BIO = {
    mochi: { face: 'love', fav: 'snackcart', speed: 1, napP: .15, likes: ['snackcart', 'table_round', 'rug_round'],
      hi: 'This is Mochi! Mochi is sweet, cheerful, and always a little bit hungry.',
      lk: 'Mochi likes snacks, sunshine, and giving big squishy hugs.',
      dl: "Mochi doesn't like rainy days with no snacks.",
      food: "Mochi's favorite food is a warm, sticky rice bun.",
      taps: ['Hee hee, that tickles!', 'Is it snack time yet?', "You're my best buddy!"], napLine: 'Mmm... dreaming of dumplings...' },
    poppy: { face: 'dreamy', fav: 'bed_cloud', speed: .7, napP: .45, likes: ['bed_cloud', 'beanbag_pink', 'beanbag_blue', 'sofa', 'bed_simple'],
      hi: 'This is Poppy! Poppy is dreamy and cozy, and loves slow, happy hums.',
      lk: 'Poppy likes naps, soft pillows, and humming sleepy songs.',
      dl: "Poppy doesn't like loud, beeping alarm clocks.",
      food: "Poppy's favorite food is warm milk with honey.",
      taps: ['Mmm... hello, sleepyhead!', "Let's snuggle on the beanbag.", 'Hum, hum, hum... la la la.'], napLine: 'Zzz... five more minutes...' },
    clem: { face: 'wink', fav: 'soccergoal', speed: 1.6, napP: .05, likes: ['soccergoal', 'soccerball', 'batrack', 'hoop'],
      hi: 'This is Clem! Clem is sporty and brave, and loves to run, kick, and cheer.',
      lk: 'Clem likes running races, kicking balls, and cheering really loud!',
      dl: "Clem doesn't like sitting still for too long.",
      food: "Clem's favorite food is orange slices after a big game.",
      taps: ['Ready, set, go!', "Wanna race me? Let's go!", 'High five! Yeah!'], napLine: 'Zzz... scoring a goal... zzz...' },
    dewdrop: { face: 'wow', fav: 'fishtank', speed: 1.1, napP: .1, likes: ['fishtank', 'plant_tall', 'bookshelf', 'telescope'],
      hi: 'This is Dewdrop! Dewdrop is curious about everything, and asks why a lot.',
      lk: 'Dewdrop likes rain puddles, bubbles, and finding things out.',
      dl: "Dewdrop doesn't like it when nobody answers her questions.",
      food: "Dewdrop's favorite food is cold, juicy watermelon.",
      taps: ['Why is the sky blue? Do you know?', 'Ooh, bubbles! Pop, pop!', "Hi hi! Let's explore!"], napLine: 'Zzz... splish, splash...' },
    pickle: { face: 'silly', fav: 'toybox', speed: 1.3, napP: .08, likes: ['toybox', 'blocks', 'train', 'drum', 'plant_cactus'],
      hi: 'This is Pickle! Pickle is a silly joker, and is always up to something fun.',
      lk: 'Pickle likes jokes, funny faces, and playing hide and seek.',
      dl: "Pickle doesn't like being bored. Boring is so boring!",
      food: "Pickle's favorite food is crunchy pickles, of course!",
      taps: ["Knock knock! Who's there? Pickle! Hee hee!", 'Boo! Did I surprise you?', "Let's make silly faces!"], napLine: 'Zzz... hee hee... zzz...' },
    nova: { face: 'starry', fav: 'telescope', speed: .85, napP: .2, likes: ['telescope', 'lamp_star', 'poster_space', 'fairylights'],
      hi: 'This is Nova! Nova is a dreamer and a stargazer, and hums little songs.',
      lk: 'Nova likes the stars, the moon, and making wishes.',
      dl: "Nova doesn't like cloudy nights, because the stars hide.",
      food: "Nova's favorite food is star-shaped cookies.",
      taps: ['Twinkle, twinkle! Hello, friend.', 'Did you make a wish today?', 'Look up! Can you see a star?'], napLine: 'Zzz... floating on the moon...' }
  };
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
