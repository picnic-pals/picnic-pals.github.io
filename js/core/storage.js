/* Picnic Pals (was Blob Arcade) — profiles & progress, saved only in this browser (localStorage). Versioned schema. */
(function (A) {
  'use strict';
  var KEY = 'blobArcade.data';
  var SCHEMA = 4;
  // everyone starts with these food friends; the others are met by mastering skills (js/core/rewards.js CONFIG.characters)
  var STARTER_BLOBS = (A.FoodData && A.FoodData.starters) || ['strawberry', 'apple', 'corn', 'blueberry'];
  // Picnic Pals: old blob ids → food friend ids (art/foods/README.md). Friends that are unlockables are granted, so nobody loses a buddy.
  var BLOB_TO_FOOD = { mochi: 'mochi', poppy: 'strawberry', dewdrop: 'blueberry', pickle: 'corn', clem: 'carrot', nova: 'grapes' };
  var GRANT_ON_MIGRATE = { mochi: 1, carrot: 1, grapes: 1 };
  function migrateBlobs(p) {
    var now = Date.now(), map = function (id) { return BLOB_TO_FOOD[id] || id; };
    var oldB = (p.unlocks && p.unlocks.blobs) || {}, nb = {};
    Object.keys(oldB).forEach(function (id) { var to = map(id); if (oldB[id]) nb[to] = Math.max(nb[to] || 0, typeof oldB[id] === 'number' ? oldB[id] : 1) || 1; });
    if (p.blob) { var was = p.blob; p.blob = map(was); if (!nb[p.blob]) nb[p.blob] = now; }
    Object.keys(nb).forEach(function (id) { if (!GRANT_ON_MIGRATE[id]) return; nb[id] = nb[id] || now; });
    STARTER_BLOBS.forEach(function (id) { nb[id] = nb[id] || 1; });
    p.unlocks = p.unlocks || {}; p.unlocks.blobs = nb;
    // friendship points follow the friend (merge if two old blobs map to one food)
    if (p.friends) { var nf = {}; Object.keys(p.friends).forEach(function (id) { var to = map(id), f = p.friends[id];
      if (!nf[to]) nf[to] = f; else { var g = nf[to]; g.pts = (g.pts || 0) + (f.pts || 0); g.lvl = Math.max(g.lvl || 1, f.lvl || 1); g.news = (g.news || []).concat(f.news || []); } }); p.friends = nf; }
    if (p.pace && p.pace.queue) p.pace.queue.forEach(function (q) { if (q.kind === 'blob') q.id = map(q.id); });
    (p.flags = p.flags || {}).picnic = 1;
  }

  function blankProfile(name, blob) {
    return {
      id: 'p_' + A.uid(), name: name || 'Player', blob: blob || STARTER_BLOBS[0], color: 'classic', outfit: 'none', held: 'none',
      createdAt: Date.now(), lastPlayed: 0,
      age: null,                      // optional, years (makes the Munch timer more generous for little ones)
      timerPace: 'auto',              // Munch timer length: 'auto' (by age) | 'relaxed' | 'normal' | 'speedy'
      stars: 0,                       // total stars ever earned (never spent; unlocks are milestones)
      // spendable "star bits": every star earned also adds a bit here (via Store.earnStars). Reserved for the Blob Room
      // (furniture, rugs, posters). bits = balance; earned/spent = lifetime totals. Never touches the star total above.
      wallet: { bits: 0, earned: 0, spent: 0 },
      inventory: {},                  // itemId -> { n: count, at: first-owned timestamp } (Blob Room items; reserved)
      room: null,                     // Blob Room layout, made on the first visit: { v, wall, floor, items: [{ u, id, c, r, f }], gifts: {} } (games/room)
      friends: {},                    // blobId -> friendship { pts, lvl, day, taps, visit, news } (js/core/friends.js)
      stickers: {},                   // stickerId -> timestamp earned
      unlocks: { outfits: {}, colors: {}, blobs: STARTER_BLOBS.reduce(function (o, id) { o[id] = 1; return o; }, {}) }, // id -> timestamp (blobs: starter food friends + friends met by mastering skills)
      time: { total: 0, games: {} },  // ms played
      days: {},                       // 'YYYY-MM-DD' -> true
      games: { munch: { rounds: 0, perfect: 0, streak: 0, best: 0, grumblyWins: 0, grumbly: false, timeUps: 0, teamRounds: 0, raceRounds: 0, raceWins: 0 },
        // Blob Baseball: best = most runs in one game (family leaderboard); rt = typical answer seconds per skill
        baseball: { games: 0, best: 0, bestAt: 0, runs: 0, hits: 0, homers: 0, outs: 0, pitches: 0, right: 0, twoGames: 0, twoWins: 0, last: null, rt: {}, swings: {} } },
      bonus: { asked: 0, right: 0, recent: [] }, // bonus questions (recent = last ids asked, to avoid repeats)
      skills: {},                     // skillId -> state (see curriculum-math.js)
      math: { current: null, pin: false, rounds: 0, returnTo: null, timeBoost: {} }, // timeBoost: skillId -> extra-time factor (slow but accurate kids get more time)
      story: { path: null, stops: {}, run: null, bestRun: 0, bestRunAt: 0, bestRunStops: 0, runs: 0, finished: 0, seen: {}, challenges: {} }, // Munch story mode (see story.js)
      sight: { words: {} },           // reserved for the Sight Words game
      flags: {}
    };
  }

  function defaults() {
    return {
      schema: SCHEMA, createdAt: Date.now(), activeId: null,
      settings: { sound: true, voice: true, recorded: true, ttsClips: true, mixVoice: false, rate: 0.9, music: true, musicVol: 0.5, timer: true, bbClock: 0, padRumble: true }, // bbClock: Blob Baseball per-pitch shot clock (seconds, 0 = off); padRumble: light controller rumble
      profiles: [], seeded: false
    };
  }

  // fill any missing keys from a template (for forward-compatible loads)
  function fill(obj, tpl) {
    for (var k in tpl) {
      if (!(k in obj) || obj[k] === undefined || obj[k] === null && tpl[k] !== null) obj[k] = JSON.parse(JSON.stringify(tpl[k]));
      else if (tpl[k] && typeof tpl[k] === 'object' && !Array.isArray(tpl[k]) && typeof obj[k] === 'object') fill(obj[k], tpl[k]);
    }
    return obj;
  }

  // schema migrations: MIGRATE[n] upgrades data from schema n to n+1
  var MIGRATE = {
    // v1 -> v2: Munch timer / music / bonus questions / two players. Ages are not guessed (set them in the grown-up area).
    1: function (d) {
      d.schema = 2;
    },
    // v2 -> v3: blob characters become unlockable. Existing players keep the starters plus whatever blob they use now.
    2: function (d) {
      (d.profiles || []).forEach(function (p) {
        p.unlocks = p.unlocks || {}; var b = p.unlocks.blobs = p.unlocks.blobs || {};
        ['mochi', 'poppy'].forEach(function (id) { b[id] = b[id] || 1; }); if (p.blob) b[p.blob] = b[p.blob] || Date.now();
      });
      d.schema = 3;
    },
    // v3 -> v4: Picnic Pals. Blob characters become food friends; progress, the chosen friend and unlocks carry over.
    3: function (d) {
      (d.profiles || []).forEach(migrateBlobs);
      d.schema = 4;
    }
  };

  var D = null;
  function load() {
    var d = null;
    try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { d = null; }
    if (!d || typeof d !== 'object') d = defaults();
    while (d.schema < SCHEMA && MIGRATE[d.schema]) { MIGRATE[d.schema](d); }
    fill(d, defaults());
    d.profiles = (d.profiles || []).map(function (p) { if (!p.wallet) p.wallet = { bits: p.stars || 0, earned: p.stars || 0, spent: 0 }; fill(p, blankProfile(p.name, p.blob)); if (p.blob && !p.unlocks.blobs[p.blob]) p.unlocks.blobs[p.blob] = Date.now(); return p; }); // the blob in use always stays usable
    D = d;
    if (!D.seeded) seed();
    if (A.Curriculum) D.profiles.forEach(function (p) { A.Curriculum.ensure(p); });
    return D;
  }
  // No preset players: a fresh visitor makes their own player in the hub (name, age, blob).
  function seed() { D.seeded = true; }
  // Age-based start: 6 and up begin math at "Adding to 10" and Reading & Words by grade level (earlier skills count as placed); younger kids start at the beginning.
  // (The subject mix follows p.age on its own, see Curriculum.mixWeights.)
  function startByAge(p) {
    if (!p || !A.Curriculum) return p;
    A.Curriculum.ensure(p);
    // per-subject levels (p.levels: 'auto' = by age, or a grade) set where each ladder starts; see A.Levels in skills-grade1.js
    if (A.Levels) A.Levels.applyAll(p);
    else if (p.age != null && p.age >= 6) A.Curriculum.place(p, 'add10');
    return p;
  }
  var saveT = null;
  var saveOk = true;
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(D)); saveOk = true; } catch (e) { saveOk = false; console.warn('save failed', e); }
  }
  // Can progress be kept? 'ok' | 'none' (storage blocked / failing) | 'maybe' (file:// outside Chrome/Edge: some browsers
  // keep file:// storage only for the session or per file, e.g. Safari and Firefox)
  function persistence() {
    try {
      var k = KEY + '.probe', v = String(Date.now());
      localStorage.setItem(k, v); var ok = localStorage.getItem(k) === v; localStorage.removeItem(k);
      if (!ok || !saveOk) return 'none';
    } catch (e) { return 'none'; }
    if (location.protocol === 'file:') {
      var ua = navigator.userAgent || '', brands = (navigator.userAgentData && navigator.userAgentData.brands) || [];
      var chromium = brands.some(function (b) { return /Chrom|Edge/i.test(b.brand); }) || (/Chrome\/|Edg\//.test(ua) && !/Firefox|FxiOS|OPR\/|SamsungBrowser/.test(ua));
      if (!chromium) return 'maybe';
    }
    return 'ok';
  }

  function prune(o, t) { if (!o || typeof o !== 'object' || Array.isArray(o) || !t || typeof t !== 'object') return o; var r = {};
    for (var k in o) { if (k in t && JSON.stringify(o[k]) === JSON.stringify(t[k]) && k !== 'id' && k !== 'createdAt') continue; r[k] = (k in t && t[k] && typeof t[k] === 'object' && !Array.isArray(t[k])) ? prune(o[k], t[k]) : o[k]; }
    return r; }
  function b64e(s) { return btoa(unescape(encodeURIComponent(s))).replace(/=+$/, ''); }
  function b64d(s) { return decodeURIComponent(escape(atob(s))); }
  function sum(s) { var h = 0x811c9dc5; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return ('0000000' + h.toString(36)).slice(-7); }  // FNV-1a
  A.Store = {
    KEY: KEY, SCHEMA: SCHEMA, blank: blankProfile, startByAge: startByAge,
    load: load, save: save, persistence: persistence, STARTER_BLOBS: STARTER_BLOBS, BLOB_TO_FOOD: BLOB_TO_FOOD, GRANT_ON_MIGRATE: GRANT_ON_MIGRATE, migrateBlobs: migrateBlobs,
    get data() { return D || load(); },
    get settings() { return (D || load()).settings; },
    profiles: function () { return (D || load()).profiles; },
    get: function (id) { return (D || load()).profiles.filter(function (p) { return p.id === id; })[0] || null; },
    active: function () { var d = D || load(); return A.Store.get(d.activeId) || null; },
    setActive: function (id) { var d = D || load(); d.activeId = id; if (id) d.lastId = id; save(); },
    // the last player who played on this device (for the hub's big "Continue" button)
    last: function () { var d = D || load(), p = A.Store.get(d.lastId) || A.Store.get(d.activeId); if (p) return p; var ps = d.profiles.slice().sort(function (a, b) { return (b.lastPlayed || 0) - (a.lastPlayed || 0); }); return ps[0] && ps[0].lastPlayed ? ps[0] : null; },
    /* ---- move a player to another device: a short save code (base64 of compact JSON + checksum) or a .json file ----
       The code holds only game progress and the name the kid typed (no other personal data). */
    exportObj: function (p) { return { app: 'blobArcade', kind: 'player', schema: SCHEMA, at: Date.now(), player: JSON.parse(JSON.stringify(p)) }; },
    // compact: leave out everything still at its blank-player default (import fills it back in), keeps the code short
    exportCompact: function (p) { var o = A.Store.exportObj(p); o.player = prune(o.player, blankProfile(p.name, p.blob)); o.player.id = p.id; o.player.name = p.name; o.player.stars = p.stars; o.player.blob = p.blob; return o; },
    exportCode: function (p) { var j = JSON.stringify(A.Store.exportCompact(p)); return 'BA3.' + b64e(j) + '.' + sum(j); },
    // parse a save code OR the text of a .json file → { ok, player, error }
    parseSave: function (txt) {
      txt = String(txt || '').trim(); var j = null;
      try {
        if (/^BA\d\./.test(txt)) { var m = txt.replace(/\s+/g, '').split('.'); if (m.length !== 3) return { ok: false, error: 'That code is not complete. Copy all of it and try again.' };
          j = b64d(m[1]); if (sum(j) !== m[2]) return { ok: false, error: 'That code has a typo (the check doesn’t match). Copy it again.' }; }
        else if (txt.charAt(0) === '{') j = txt; else return { ok: false, error: 'That doesn’t look like a save code or save file.' };
        var o = JSON.parse(j);
        if (!o || o.app !== 'blobArcade' || o.kind !== 'player' || !o.player || typeof o.player !== 'object') return { ok: false, error: 'That is not a Picnic Pals player save.' };
        if (!(o.schema <= SCHEMA)) return { ok: false, error: 'That save is from a newer version of the game. Update this device first.' };
        var p = o.player; if (typeof p.name !== 'string' || !p.name.trim() || typeof p.stars !== 'number' || !(p.stars >= 0) || typeof p.id !== 'string') return { ok: false, error: 'That save is missing player details.' };
        p.name = p.name.trim().slice(0, 16);
        // compact codes from before Picnic Pals left out the old blob defaults (blob 'mochi', starters mochi + poppy): put them back before migrating
        if (o.schema < 4) { if (!p.blob) p.blob = 'mochi'; p.unlocks = p.unlocks || {}; var ob = p.unlocks.blobs = p.unlocks.blobs || {}; if (o.schema >= 3) { ob.mochi = ob.mochi || 1; ob.poppy = ob.poppy || 1; } }
        if (o.schema < SCHEMA) { var tmp = { schema: o.schema, profiles: [p] }; while (tmp.schema < SCHEMA && MIGRATE[tmp.schema]) MIGRATE[tmp.schema](tmp); }
        fill(p, blankProfile(p.name, p.blob)); if (A.Curriculum) A.Curriculum.ensure(p);
        return { ok: true, player: p };
      } catch (e) { return { ok: false, error: 'That code could not be read. Copy all of it and try again.' }; }
    },
    // the player on this device that an import would replace (same id or same name), or null
    clash: function (p) { return A.Store.profiles().filter(function (q) { return q.id === p.id; })[0] || A.Store.profiles().filter(function (q) { return q.name.toLowerCase() === p.name.toLowerCase(); })[0] || null; },
    // add (or, if `replace` is given, replace that player with) an imported player
    importPlayer: function (p, replace) { var d = D || load(); if (replace) { var i = d.profiles.indexOf(replace); p.id = replace.id; d.profiles[i] = p; } else { if (A.Store.get(p.id)) p.id = 'p_' + A.uid(); d.profiles.push(p); } save(); return p; },
    add: function (name, blob) {
      var p = blankProfile(String(name || '').trim().slice(0, 16) || 'Player', blob);
      if (A.Curriculum) A.Curriculum.ensure(p);
      (D || load()).profiles.push(p); save(); return p;
    },
    rename: function (id, name) { var p = A.Store.get(id); if (p && String(name).trim()) { p.name = String(name).trim().slice(0, 16); save(); } return p; },
    remove: function (id) { var d = D || load(); d.profiles = d.profiles.filter(function (p) { return p.id !== id; }); if (d.activeId === id) d.activeId = null; save(); },
    resetProgress: function (id) {
      var d = D || load(), i = d.profiles.findIndex(function (p) { return p.id === id; }); if (i < 0) return;
      var old = d.profiles[i], p = blankProfile(old.name, old.blob); p.id = old.id; p.flags.preset = old.flags.preset; p.age = old.age; p.timerPace = old.timerPace; if (old.toddler) p.toddler = old.toddler; p.unlocks.blobs[p.blob] = Date.now();
      startByAge(p);
      d.profiles[i] = p; save(); return p;
    },
    resetAll: function () { try { localStorage.removeItem(KEY); } catch (e) {} D = null; load(); },
    markPlayed: function (p) { p.lastPlayed = Date.now(); p.days[A.today()] = true; },
    /* stars: always go through here, so the never-spent total and the spendable star-bit wallet stay in step */
    earnStars: function (p, n, src) { n = Math.max(0, Math.round(n || 0)); if (!p || p.guest || !n) return 0; p.stars += n; var w = p.wallet || (p.wallet = { bits: 0, earned: 0, spent: 0 }); w.bits += n; w.earned += n; if (A.Friends) A.Friends.add(p, p.blob, n, src || 'play'); A.emit && A.emit('stars:earned', { p: p, n: n, src: src || '' }); return n; },
    /* spend star bits (Blob Room shop, later). Returns false if there aren't enough. */
    spendBits: function (p, n, itemId) { var w = p && p.wallet; if (!w || !(n >= 0) || w.bits < n) return false; w.bits -= n; w.spent += n; if (itemId) { var it = p.inventory[itemId] || (p.inventory[itemId] = { n: 0, at: Date.now() }); it.n++; } save(); return true; },
    addTime: function (p, game, ms) {
      if (!p || !(ms > 0)) return; ms = Math.min(ms, 30 * 60000);
      p.time.total += ms; p.time.games[game] = (p.time.games[game] || 0) + ms;
    }
  };
})(window.Arcade);
