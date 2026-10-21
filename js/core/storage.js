/* Blob Arcade — profiles & progress, saved only in this browser (localStorage). Versioned schema. */
(function (A) {
  'use strict';
  var KEY = 'blobArcade.data';
  var SCHEMA = 3;
  var STARTER_BLOBS = ['mochi', 'poppy'];   // everyone starts with these; the other blobs are won in Story mode challenges

  function blankProfile(name, blob) {
    return {
      id: 'p_' + A.uid(), name: name || 'Player', blob: blob || 'mochi', color: 'classic', outfit: 'none',
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
      unlocks: { outfits: {}, colors: {}, blobs: { mochi: 1, poppy: 1 } }, // id -> timestamp (blobs: starters + friends won in Story challenges)
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
        STARTER_BLOBS.forEach(function (id) { b[id] = b[id] || 1; }); if (p.blob) b[p.blob] = b[p.blob] || Date.now();
      });
      d.schema = 3;
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
  // Age-based start: 6 and up begin math at "Adding to 10" (earlier skills count as placed); younger kids start at the beginning.
  // (The subject mix follows p.age on its own, see Curriculum.mixWeights.)
  function startByAge(p) {
    if (!p || !A.Curriculum) return p;
    A.Curriculum.ensure(p);
    if (p.age != null && p.age >= 6) A.Curriculum.place(p, 'add10');
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

  A.Store = {
    KEY: KEY, SCHEMA: SCHEMA, blank: blankProfile, startByAge: startByAge,
    load: load, save: save, persistence: persistence, STARTER_BLOBS: STARTER_BLOBS,
    get data() { return D || load(); },
    get settings() { return (D || load()).settings; },
    profiles: function () { return (D || load()).profiles; },
    get: function (id) { return (D || load()).profiles.filter(function (p) { return p.id === id; })[0] || null; },
    active: function () { var d = D || load(); return A.Store.get(d.activeId) || null; },
    setActive: function (id) { (D || load()).activeId = id; save(); },
    add: function (name, blob) {
      var p = blankProfile(String(name || '').trim().slice(0, 16) || 'Player', blob);
      if (A.Curriculum) A.Curriculum.ensure(p);
      (D || load()).profiles.push(p); save(); return p;
    },
    rename: function (id, name) { var p = A.Store.get(id); if (p && String(name).trim()) { p.name = String(name).trim().slice(0, 16); save(); } return p; },
    remove: function (id) { var d = D || load(); d.profiles = d.profiles.filter(function (p) { return p.id !== id; }); if (d.activeId === id) d.activeId = null; save(); },
    resetProgress: function (id) {
      var d = D || load(), i = d.profiles.findIndex(function (p) { return p.id === id; }); if (i < 0) return;
      var old = d.profiles[i], p = blankProfile(old.name, old.blob); p.id = old.id; p.flags.preset = old.flags.preset; p.age = old.age; p.timerPace = old.timerPace; p.unlocks.blobs[p.blob] = Date.now();
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
