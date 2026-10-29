/* Picnic Pals — rewards: stickers, outfits/colours, room-furniture pricing, character unlock rules, long-term goals.
   Stars are never spent or lost; unlocks are milestones. The Blob Room spends a separate star-bit wallet.
   TIERS: common = stars every round (small per-round result only) · uncommon = stickers, cheap outfits/colors/furniture, at most
   CONFIG.uncommonPerSession per session, batch-celebrated once in the hub (never mid-round) · rare = real milestones (a mastered
   skill, the weekly goal, a story area, a perfect challenge) · epic = friends (several mastered skills, over weeks) and showpieces.
   Tune everything in CONFIG. Existing saves keep everything already unlocked (grandfather()). */
(function (A) {
  'use strict';
  var TT = A.TITLES || {}; // game titles live in util.js (A.TITLES); node tools that skip util.js just get blank hints
  var st5 = function (cx, cy, r, fill, ex) { return A.Blobs.star5(cx, cy, r, fill, ex); };
  var INK = '#4a3b6b';
  function face(y, col) { col = col || INK; return '<circle cx="43" cy="' + y + '" r="2.6" fill="' + col + '"/><circle cx="57" cy="' + y + '" r="2.6" fill="' + col + '"/><path d="M45 ' + (y + 6) + 'Q50 ' + (y + 10) + ' 55 ' + (y + 6) + '" stroke="' + col + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>'; }
  var ART = {
    donut: '<circle cx="50" cy="52" r="26" fill="#f2c48d"/><circle cx="50" cy="50" r="23" fill="#ff9fc0"/><circle cx="50" cy="51" r="8" fill="#fff4e0"/>' +
      [[36, 40, 20, '#9fd2ff'], [60, 36, -30, '#ffe58a'], [66, 54, 60, '#8fe3c0'], [40, 62, -50, '#c9b2ff'], [54, 66, 10, '#fff'], [33, 52, 80, '#ffe58a']].map(function (s) { return '<rect x="' + (s[0] - 4) + '" y="' + (s[1] - 1.5) + '" width="8" height="3" rx="1.5" fill="' + s[3] + '" transform="rotate(' + s[2] + ' ' + s[0] + ' ' + s[1] + ')"/>'; }).join(''),
    star: st5(50, 53, 32, '#ffd23c', 'stroke="#e8a400" stroke-width="2.5" stroke-linejoin="round"') + face(50),
    rainbow: ['#ff8fa8', '#ffb36b', '#ffe58a', '#8fe3c0', '#9fd2ff'].map(function (c, i) { var r = 32 - i * 6; return '<path d="M' + (50 - r) + ' 66 A' + r + ' ' + r + ' 0 0 1 ' + (50 + r) + ' 66" stroke="' + c + '" stroke-width="6.5" fill="none"/>'; }).join('') +
      '<circle cx="18" cy="68" r="8" fill="#fff"/><circle cx="27" cy="70" r="7" fill="#fff"/><circle cx="82" cy="68" r="8" fill="#fff"/><circle cx="73" cy="70" r="7" fill="#fff"/>',
    rocket: '<path d="M44 72 Q40 84 50 90 Q60 84 56 72Z" fill="#ffc93c"/><path d="M50 14 C66 28 66 52 60 72 H40 C34 52 34 28 50 14Z" fill="#fff" stroke="#b9a3f5" stroke-width="2.5"/>' +
      '<path d="M40 56 L28 70 L40 70Z M60 56 L72 70 L60 70Z" fill="#ff8fb1"/><circle cx="50" cy="40" r="8" fill="#9fd2ff" stroke="#b9a3f5" stroke-width="2.5"/>',
    trophy: '<path d="M32 22 H68 V36 C68 50 60 58 50 58 C40 58 32 50 32 36Z" fill="#ffd23c" stroke="#e5a800" stroke-width="2.5"/><path d="M32 28 C20 28 20 44 34 46 M68 28 C80 28 80 44 66 46" stroke="#e5a800" stroke-width="3.5" fill="none"/>' +
      '<rect x="45" y="57" width="10" height="12" fill="#e5a800"/><rect x="34" y="68" width="32" height="10" rx="3" fill="#b9a3f5"/>' + st5(50, 38, 8, '#fff'),
    planet: '<circle cx="50" cy="50" r="21" fill="#c9b2ff"/><path d="M36 40 Q50 36 64 42" stroke="#b39af0" stroke-width="3" fill="none"/><ellipse cx="50" cy="52" rx="35" ry="9" fill="none" stroke="#ffd23c" stroke-width="4" transform="rotate(-18 50 52)"/>' +
      '<path d="M29 45 A21 21 0 0 1 71 45" fill="#c9b2ff"/>' + st5(20, 22, 5, '#ffd23c') + st5(80, 78, 4, '#ff9fc0'),
    sun: (function () { var s = ''; for (var i = 0; i < 10; i++) s += '<rect x="47" y="12" width="6" height="14" rx="3" fill="#ffb43c" transform="rotate(' + (i * 36) + ' 50 50)"/>'; return s; })() + '<circle cx="50" cy="50" r="22" fill="#ffd23c"/>' + face(47, '#8a5a00') + '<ellipse cx="38" cy="55" rx="4" ry="2.5" fill="#ff9f7a" opacity=".7"/><ellipse cx="62" cy="55" rx="4" ry="2.5" fill="#ff9f7a" opacity=".7"/>',
    icecream: '<path d="M36 52 L50 88 L64 52Z" fill="#f2c48d" stroke="#d9a066" stroke-width="2"/><path d="M41 60 L56 72 M45 52 L60 64 M40 66 L53 56" stroke="#d9a066" stroke-width="1.5"/>' +
      '<circle cx="50" cy="48" r="15" fill="#ffd6e3"/><circle cx="50" cy="34" r="13" fill="#8fe3c0"/><circle cx="50" cy="21" r="10" fill="#fff6cf"/><circle cx="50" cy="12" r="4" fill="#ff5a6e"/>',
    cupcake: '<path d="M30 54 H70 L64 82 H36Z" fill="#9fd2ff"/><path d="M38 54 L40 82 M50 54 V82 M62 54 L60 82" stroke="#7bb8ef" stroke-width="2"/>' +
      '<ellipse cx="50" cy="52" rx="23" ry="9" fill="#ffd6e3"/><ellipse cx="50" cy="42" rx="17" ry="8" fill="#ffd6e3"/><ellipse cx="50" cy="33" rx="10" ry="6" fill="#ffd6e3"/><circle cx="50" cy="24" r="6" fill="#ff5a6e"/>',
    balloon: '<path d="M50 70 Q46 80 52 86 Q58 92 50 96" stroke="#b9a3f5" stroke-width="2" fill="none"/><ellipse cx="50" cy="42" rx="20" ry="25" fill="#ff8fb1"/><path d="M46 68 L54 68 L50 64Z" fill="#ff8fb1"/><ellipse cx="42" cy="32" rx="5" ry="8" fill="#fff" opacity=".55" transform="rotate(20 42 32)"/>',
    watermelon: '<path d="M16 42 A34 34 0 0 0 84 42Z" fill="#5fd3a3"/><path d="M21 42 A29 29 0 0 0 79 42Z" fill="#fff"/><path d="M24 42 A26 26 0 0 0 76 42Z" fill="#ff7a90"/>' +
      [[36, 50], [50, 58], [64, 50], [43, 62], [57, 62], [50, 48]].map(function (q) { return '<ellipse cx="' + q[0] + '" cy="' + q[1] + '" rx="2" ry="3" fill="' + INK + '"/>'; }).join(''),
    medal: '<path d="M34 12 L46 46 L56 42 L46 12Z" fill="#9fd2ff"/><path d="M66 12 L54 46 L44 42 L54 12Z" fill="#ff8fb1"/><circle cx="50" cy="62" r="22" fill="#ffd23c" stroke="#e5a800" stroke-width="3"/>' + st5(50, 62, 12, '#fff6cf'),
    flower: (function () { var s = ''; for (var i = 0; i < 5; i++) s += '<circle cx="50" cy="30" r="14" fill="#ff9fc0" transform="rotate(' + (i * 72) + ' 50 50)"/>'; return s; })() + '<circle cx="50" cy="50" r="13" fill="#ffd23c"/>' + face(47, '#8a5a00'),
    crown: '<path d="M18 70 L16 32 L34 50 L50 24 L66 50 L84 32 L82 70Z" fill="#ffd23c" stroke="#e5a800" stroke-width="3" stroke-linejoin="round"/><rect x="18" y="66" width="64" height="10" rx="4" fill="#e5a800"/>' +
      '<circle cx="50" cy="55" r="5" fill="#ff7aa6"/><circle cx="32" cy="58" r="4" fill="#8fe3c0"/><circle cx="68" cy="58" r="4" fill="#9fd2ff"/>',
    ladybug: '<circle cx="50" cy="28" r="11" fill="' + INK + '"/><circle cx="50" cy="56" r="26" fill="#ff5a6e"/><path d="M50 32 V82" stroke="' + INK + '" stroke-width="2.5"/>' +
      [[38, 48, 5], [62, 48, 5], [36, 66, 4.5], [64, 66, 4.5], [50, 74, 3]].map(function (q) { return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + q[2] + '" fill="' + INK + '"/>'; }).join('') + '<circle cx="45" cy="26" r="2" fill="#fff"/><circle cx="55" cy="26" r="2" fill="#fff"/>',
    moon: '<path d="M62 16 A34 34 0 1 0 84 66 A28 28 0 1 1 62 16Z" fill="#ffe58a" stroke="#e8c23c" stroke-width="2"/><circle cx="44" cy="58" r="2.5" fill="' + INK + '"/><path d="M48 66 Q53 69 57 65" stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round"/>' + st5(76, 24, 6, '#fff') + st5(84, 40, 4, '#fff'),
    strawberry: '<path d="M50 88 C26 72 22 44 34 36 C42 31 46 34 50 36 C54 34 58 31 66 36 C78 44 74 72 50 88Z" fill="#ff5a6e"/>' +
      [[40, 50], [50, 46], [60, 50], [44, 62], [56, 62], [50, 74], [38, 64], [62, 64]].map(function (q) { return '<ellipse cx="' + q[0] + '" cy="' + q[1] + '" rx="1.6" ry="2.4" fill="#ffe58a"/>'; }).join('') +
      '<path d="M50 38 L40 26 L50 30 L50 18 L54 30 L64 26Z" fill="#5fd3a3"/>',
    baseball: '<circle cx="50" cy="52" r="30" fill="#fff" stroke="#e6dccb" stroke-width="2"/><path d="M30 30 Q42 52 30 74 M70 30 Q58 52 70 74" stroke="#ff5a6e" stroke-width="2.6" fill="none" stroke-dasharray="3 3"/>' + face(50),
    homer: (function () { var s = ''; for (var i = 0; i < 8; i++) s += '<rect x="47" y="8" width="6" height="16" rx="3" fill="' + ['#ffd23c', '#ff8fb1', '#9fd2ff', '#8fe3c0'][i % 4] + '" transform="rotate(' + (i * 45) + ' 50 50)"/>'; return s; })() +
      '<circle cx="50" cy="50" r="20" fill="#fff" stroke="#e6dccb" stroke-width="2"/><path d="M37 37 Q45 50 37 63 M63 37 Q55 50 63 63" stroke="#ff5a6e" stroke-width="2.2" fill="none"/>' + st5(50, 50, 7, '#ffd23c'),
    cloud: '<path d="M26 70 C10 70 10 48 26 46 C26 30 46 24 54 36 C60 22 84 26 82 46 C96 48 94 70 78 70Z" fill="#eee6ff" stroke="#c9b2ff" stroke-width="2.5"/>' + face(52) + '<path d="M70 20 L76 30 M80 16 L82 26" stroke="#9fd2ff" stroke-width="3" stroke-linecap="round"/>'
  };
  var BG = { donut: '#fff0f6', star: '#fff8d6', rainbow: '#eaf6ff', rocket: '#f0eaff', trophy: '#fff6dd', planet: '#eef0ff', sun: '#fff4d6', icecream: '#ffeef4', cupcake: '#eef8ff',
    balloon: '#fff0f4', baseball: '#eaffef', homer: '#fff8d6', watermelon: '#effcf5', medal: '#fff8e6', flower: '#fff2f7', crown: '#fffbe6', ladybug: '#f2fff4', moon: '#eef0ff', strawberry: '#fff0f2', cloud: '#f4f0ff' };
  function stickerSVG(art, gray) {
    return '<svg class="sticker' + (gray ? ' gray' : '') + '" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48" fill="#fff"/><circle cx="50" cy="50" r="43" fill="' + (BG[art] || '#fff') + '"/>' + (ART[art] || '') + '</svg>';
  }

  function mc() { return A.Curriculum; }
  /* ======================= ONE PLACE TO TUNE REWARD PACING =======================
     Three tracks run side by side, so one prize is nearly always close:
       friends  — characters, earned only by MASTERING skills (coach.js mastery spans separate days; placed/skipped skills don't
                  count, so every kid's milestones sit on their own ladder)
       hats     — Pop Quiz themes (Pop Quiz isn't built yet: data hook only, see hats + Rewards.popQuizTheme)
       weekly   — furniture + stickers for the forgiving weekly goal (play N of 7 days; never resets), reviews, bosses, effort
     No random draws, no expiring offers, no streak loss, no sibling leaderboards. Stars are never lost. */
  var FRIEND_GAP = 4;            // play days per friend after the first (see characters below)
  var CONFIG = {
    uncommonPerSession: 2,        // uncommon unlocks earned per play session (day); extras wait for the next session
    cardsPerSession: 3,           // prizes shown on the end-of-session card in the hub; extras queue for next session
    // star-cost outfits/colors (stars are a lifetime total, never spent). Cheap ones are uncommon, dearer ones rare.
    outfitCost: { none: 0, bow: 12, cap: 10, headband: 65, sunglasses: 90, flower: 135, partyhat: 190, beanie: 260, crown: 360 },
    colorCost: { classic: 0, berry: 20, mint: 45, sunny: 75, sky: 115, grape: 165, cocoa: 260, rainbow: 420 },
    rareAt: 100,                  // star-cost unlocks at/above this count as rare (not limited by the per-session cap)
    outfitNeed: { crown: 'weeks4' }, colorNeed: { rainbow: 'master3' },    // badge needed on top of the stars
    weekly: { days: 3, of: 7 },   // weekly goal: play on 3 days in a Mon–Sun week. Missing a day never resets anything.
    // room furniture (v2p1b, 2026-10-25): star bits come 1 per star, about 2-3 a round (~12 on a 5-round day, ~54 in a 5-day week,
    // ~224 in a month: tools/reward-sim.js). Three bands: CHEAP fixed prices 4-20 (one is buyable after a game or two; every shop item
    // can be bought again, so there is always a cheap buy), MID 22-65 on the curve (a few days of play), SHOWPIECES 100-150 (big
    // goals for the savings jar). The cheap ladder is spaced so reward-sim stays at day 1 <= 3, week 1 <= 17, month 1 <= 51.
    furniture: { curve: [[5, 22], [9, 25], [14, 35], [18, 50], [24, 65], [99, 80]],   // [old base price up to, new price]
      fixed: { plates: 4, soccerball: 9, blocks: 12, poster_mochi: 15, pennant: 18, plant_flower: 18, poster_space: 20, poster_baseball: 20 },
      firstWin: { plant_cactus: 25 },
      gates: { bed_cloud: 'week1', plant_tree: 'week1', fishtank: 'master1', telescope: 'area1', tent: 'perfectCh', piano: 'weeks4', lemonade_jug: 'week1', thermos: 'area1' },  // badge AND price
      showpieces: { bed_cloud: 100, fishtank: 120, telescope: 130, tent: 140, piano: 150 } },
    // FRIENDS track — data only, keyed by character id; add more entries to extend. need: { mastered | weeks | popquiz | reviews | bosses : n }
    // Picnic Pals food friends (ids/order from art/foods/cast.json via js/core/foods-data.js): 4 starters, then one new friend per
    // mastered skill, in cast.json unlock order (Dora Dumpling first). Existing players keep everything they had (unlocks are never removed).
    characters: (function () {
      var FD = A.FoodData || {}, order = FD.order || ['mochi', 'banana', 'pear', 'carrot', 'broccoli', 'sushi', 'taco', 'pizza', 'pancake', 'cupcake'];
      return { starter: (FD.starters || ['strawberry', 'apple', 'corn', 'blueberry']).slice(),
        // spacing (2026-10-21): with the tuned mastery rule (coach.js) a fast kid can master a skill every couple of days, so every
        // friend after the first also needs FRIEND_GAP play days per friend (friend #2 at 4 play days, #3 at 8 …): about one a week.
        unlockable: order.map(function (id, i) { var n = { mastered: i + 1 }; if (i > 0) n.days = FRIEND_GAP * i; return { id: id, need: n }; }) };
    })(),
    // HATS track hook: Pop Quiz theme id → outfit id (granted when Rewards.popQuizTheme(p, theme) is called and that outfit exists).
    // Pop Quiz isn't built: until it is, each of these is earned by the existing milestone in outfitEarn below (either path unlocks it).
    hats: { space: 'astronaut', animals: 'safari', dinosaurs: 'dino', ocean: 'snorkel', bugs: 'bee', weather: 'rainhat', body: 'headlamp', vehicles: 'conductor', world: 'explorer' },
    // EARN RULES for the theme hats + held items. An outfit listed here is LOCKED UNTIL EARNED (no price = not free).
    // need (all must hold): stars (lifetime star shop, the outfitCost curve continued) · weeks (weekly 3-of-7 goal met in n weeks)
    // · mastered (skills) · area (finish Story area #i: both stops) · area3at (3 stars on both stops of area #i) · area3 (any area) ·
    // chPerfect · days (play days) · island (finish the whole Picnic Island story) · badge. Area numbers are Story.AREAS order.
    // Spread out on purpose: 2 in week 1, a few in month 1, the rest multi-week (weeks/mastery/hard 3-star challenges).
    outfitEarn: {
      kite: { need: { weeks: 1 } },                 // first weekly goal
      lollipop: { need: { area: 1 } },              // Compare Berry Beach
      explorer: { need: { area: 2 } },              // Add-Up Broccoli Woods (Pop Quiz: World, later)
      book: { need: { mastered: 2 } },              // pairs with the bookworm glasses
      bouquet: { need: { stars: 160 } },
      trophy: { need: { chPerfect: 3 } },           // 3 friend challenges with no oopsies (1 came too early from a lucky round)
      snorkel: { need: { area: 6 } },               // Mystery Melon Bay, the island's lagoon (Pop Quiz: Ocean, later)
      conductor: { need: { weeks: 5 } },            // (Pop Quiz: Vehicles, later)
      teddy: { need: { days: 25 } },                // 25 play days, any pace
      bubbles: { need: { area3: 2 } },              // 3 stars on both stops of 2 areas
      bee: { need: { area3at: 8 } },                // 3 stars all through Take-Away Apple Grove (Pop Quiz: Bugs, later)
      net: { need: { area: 8, weeks: 5 } },         // Take-Away Apple Grove + five great weeks (pairs with the bee)
      headlamp: { need: { area: 9, mastered: 4 } }, // Even-Odd Cookie Caves (the last area) + 4 mastered skills (Pop Quiz: Body, later)
      dino: { need: { area3at: 5 } },               // 3 stars all through Teen Cocoa Volcano (Pop Quiz: Dinosaurs, later)
      telescope: { need: { area3at: 7 } },          // 3 stars all through Big Sum Lolly Lighthouse
      umbrella: { need: { weeks: 6 } },
      rainhat: { need: { weeks: 8 } },              // pairs with the umbrella (Pop Quiz: Weather, later)
      ukulele: { need: { weeks: 10 } },
      wand: { need: { mastered: 5 } },
      wizard: { need: { mastered: 7 } },            // big mastery milestone
      gradcap: { need: { mastered: 10 } },          // every math skill on the island
      astronaut: { need: { stars: 450 } },          // (Pop Quiz: Space, later)
      safari: { need: { stars: 600 } },             // (Pop Quiz: Animals, later)
      basket: { need: { stars: 750 } },
      flag: { need: { stars: 900, weeks: 6 } },
      golden_basket: { need: { island: 1 } }        // the rarest: finish the whole Picnic Island story
    },
    // long-term goals (weeks). The hub shows the first unfinished one as the "next goal" bar.
    goals: [
      { id: 'g_week1', name: 'Play 3 days this week', icon: '📅', of: 'weekDays', need: 3 },
      { id: 'g_master1', name: 'Master a skill', icon: '🏅', of: 'mastered', need: 1 },
      { id: 'g_stars150', name: 'Earn 150 stars', icon: '⭐', of: 'stars', need: 150 },
      { id: 'g_master3', name: 'Master 3 skills', icon: '🎓', of: 'mastered', need: 3 },
      { id: 'g_weeks4', name: 'Meet your weekly goal 4 times', icon: '🧺', of: 'weeks', need: 4 },
      { id: 'g_friends', name: 'Meet every friend', icon: '💛', of: 'friends', need: 0 },
      { id: 'g_stars500', name: 'Earn 500 stars', icon: '🌟', of: 'stars', need: 500 },
      { id: 'g_master6', name: 'Master 6 skills', icon: '👑', of: 'mastered', need: 6 }
    ]
  };
  var LEGACY_OUTFIT = { bow: 3, cap: 6, headband: 10, sunglasses: 15, flower: 20, partyhat: 26, beanie: 33, crown: 45 };   // pre-pacing costs (grandfathering)
  var LEGACY_COLOR = { berry: 8, mint: 12, sunny: 18, sky: 24, grape: 30, cocoa: 38, rainbow: 55 };
  /* ---------- milestone stats ---------- */
  function dayNum(k) { var a = k.split('-'); return Math.round(Date.UTC(+a[0], +a[1] - 1, +a[2]) / 864e5); }
  function weekOf(k) { var n = dayNum(k); return n - ((n + 3) % 7); }     // Monday-based week number (day 0 = Thu 1970-01-01)
  function today() { return A.today ? A.today() : new Date().toISOString().slice(0, 10); }
  function weekCounts(p) { var w = {}; Object.keys(p.days || {}).forEach(function (k) { if (/^\d{4}-\d\d-\d\d$/.test(k)) { var x = weekOf(k); w[x] = (w[x] || 0) + 1; } }); return w; }
  function weeksMet(p) { var w = weekCounts(p), n = 0; for (var k in w) if (w[k] >= CONFIG.weekly.days) n++; return n; }
  function weekDays(p) { return weekCounts(p)[weekOf(today())] || 0; }
  function mastered(p) { try { var C = mc(); return C.masteredCount(p, 'math') + (C.list('reading').length ? C.masteredCount(p, 'reading') : 0); } catch (e) { return 0; } }
  function masteredSkills(p) { try { var C = mc(); return C.ACTIVE.filter(function (s) { var st = p.skills[s.id]; return st && st.status === 'mastered' && !st.placed; }); } catch (e) { return []; } }
  function tinyN(p) { return ((p.games || {}).tiny || {}).rounds || 0; }
  function sdata(p) { var s = p.story || (p.story = {}); s.stops = s.stops || {}; s.challenges = s.challenges || {}; return s; }
  function stopOk(p, i, f) { var s = sdata(p); return ['big', 'little'].some(function (pa) { var r = s.stops[pa + ':' + i]; return r && !r.placed && f(r); }); }   // stops passed by placement (not played) never earn rewards
  function areasN(p, f) { var n = 0; ((A.Story && A.Story.AREAS) || []).forEach(function (a, ai) { if (!a.side && stopOk(p, ai * 2, f) && stopOk(p, ai * 2 + 1, f)) n++; }); return n; }
  function areaOk(p, ai, f) { return stopOk(p, ai * 2, f) && stopOk(p, ai * 2 + 1, f); }
  function areaName(ai) { var a = ((A.Story && A.Story.AREAS) || [])[ai]; return a && a.name ? a.name : 'area ' + (ai + 1); }
  function chPerfect(p) { var c = sdata(p).challenges, n = 0; for (var k in c) if (c[k] && c[k].perfect) n++; return n; }
  function cast() { return CONFIG.characters; }
  function allChars() { return cast().starter.concat(cast().unlockable.map(function (u) { return u.id; })); }
  function friendsN(p) { var b = (p.unlocks && p.unlocks.blobs) || {}; return allChars().filter(function (id) { return b[id] || p.blob === id; }).length; }
  function stats(p) { var e = p.effort || {};
    return { stars: p.stars || 0, mastered: mastered(p), days: Object.keys(p.days || {}).length, weekDays: weekDays(p), weeks: weeksMet(p),
      areas: areasN(p, function (r) { return r.passed; }), area3: areasN(p, function (r) { return r.stars >= 3; }), chPerfect: chPerfect(p),
      friends: friendsN(p), friendsAll: allChars().length, stickers: Object.keys(p.stickers || {}).length,
      popquiz: Object.keys((p.popquiz || {}).themes || {}).length, island: (sdata(p).finished || 0) > 0 ? 1 : 0, reviews: e.reviews || 0, bosses: e.bosses || 0, tries: e.tries || 0 }; }
  // badges: milestones that gate outfits and furniture
  var BADGES = {
    week1: { name: 'Weekly goal', hint: 'Play on 3 days in one week', test: function (x) { return x.weeks >= 1; } },
    weeks4: { name: 'Four great weeks', hint: 'Meet your weekly goal in 4 weeks', test: function (x) { return x.weeks >= 4; } },
    master1: { name: 'Skill master', hint: 'Master a skill', test: function (x) { return x.mastered >= 1; } },
    master3: { name: 'Super learner', hint: 'Master 3 skills', test: function (x) { return x.mastered >= 3; } },
    area1: { name: 'Area hero', hint: 'Beat a whole Story area', test: function (x) { return x.areas >= 1; } },
    perfectCh: { name: 'Perfect challenge', hint: 'Win a friend challenge with no oopsies', test: function (x) { return x.chPerfect >= 1; } }
  };
  function badge(p, id, x) { var b = BADGES[id]; return !!b && b.test(x || stats(p)); }
  /* ---------- earn rules (CONFIG.outfitEarn): theme hats + held items, locked until earned ---------- */
  var EARN = CONFIG.outfitEarn;
  function earnParts(p, id, x) {
    var r = EARN[id]; if (!r) return null; x = x || stats(p);
    return Object.keys(r.need).map(function (k) { var n = r.need[k], ok, have, need = n;
      if (k === 'area') { ok = areaOk(p, n, function (q) { return q.passed; }); have = ok ? 1 : 0; need = 1; }
      else if (k === 'area3at') { ok = areaOk(p, n, function (q) { return q.stars >= 3; }); have = ok ? 1 : 0; need = 1; }
      else if (k === 'badge') { ok = badge(p, n, x); have = ok ? 1 : 0; need = 1; }
      else { have = Math.min(x[k] || 0, n); ok = (x[k] || 0) >= n; }
      return { what: k, n: n, have: have, need: need, ok: ok }; });
  }
  function earnOk(p, id, x) { var ps = earnParts(p, id, x); return !!ps && ps.every(function (q) { return q.ok; }); }
  // plain hint for a locked tile: "Finish Compare Berry Beach to earn this!" (item names are fine; never names a friend)
  function earnHint(p, id) {
    var ps = earnParts(p, id); if (!ps) return ''; var all = ps.filter(function (q) { return !q.ok; }); if (!all.length) all = ps;
    var bits = all.map(function (q) { var n = q.n;
      switch (q.what) {
        case 'area': return 'finish ' + areaName(n);
        case 'area3at': return 'get 3 stars on both stops of ' + areaName(n);
        case 'area3': return n > 1 ? 'get 3 stars on both stops of ' + n + ' island areas' : 'get 3 stars on both stops of any island area';
        case 'stars': return 'collect ' + n + ' stars';
        case 'weeks': return n === 1 ? 'play on 3 days in one week' : 'meet your weekly goal in ' + n + ' weeks';
        case 'mastered': return 'master ' + n + ' skill' + (n > 1 ? 's' : '');
        case 'chPerfect': return n > 1 ? 'win ' + n + ' friend challenges with no oopsies' : 'win a friend challenge with no oopsies';
        case 'days': return 'play on ' + n + ' different days';
        case 'island': return 'finish the whole Picnic Island story';
        case 'badge': return (BADGES[n] || { hint: n }).hint.toLowerCase();
      } return q.what + ' ' + n; });
    var t = bits.join(' and '); return t.charAt(0).toUpperCase() + t.slice(1) + ' to earn this!';
  }
  // short on-tile label for a locked Dress Up tile ("3★ Apple Grove"); tapping still reads the full earnHint
  function earnShort(p, id) {
    var ps = earnParts(p, id); if (!ps) return ''; var all = ps.filter(function (q) { return !q.ok; }); if (!all.length) all = ps;
    function place(n) { return areaName(n).split(' ').slice(-2).join(' '); }
    return all.map(function (q) { var n = q.n;
      switch (q.what) {
        case 'area': return 'Finish ' + place(n);
        case 'area3at': return '3\u2605 ' + place(n);
        case 'area3': return '3\u2605 on ' + n + (n > 1 ? ' areas' : ' area');
        case 'stars': return n + ' \u2B50';
        case 'weeks': return n === 1 ? '3 days in a week' : n + (all.length > 1 ? ' weeks' : ' great weeks');
        case 'mastered': return all.length > 1 ? n + ' skills' : 'Master ' + n + ' skill' + (n > 1 ? 's' : '');
        case 'chPerfect': return n + ' perfect challenge' + (n > 1 ? 's' : '');
        case 'days': return n + ' play days';
        case 'island': return 'Finish the island';
        case 'badge': return (BADGES[n] || { name: n }).name;
      } return q.what + ' ' + n; }).join(' + ');
  }
  function earnProgress(p, id) { var ps = earnParts(p, id); if (!ps) return null; var have = 0, need = 0; ps.forEach(function (q) { have += q.have; need += q.need; });
    return { ok: ps.every(function (q) { return q.ok; }), have: have, need: need, parts: ps, hint: earnHint(p, id) }; }
  // multi-week rules (weeks >= 2, 5+ mastered, 3-star areas, the island, 400+ stars, 20+ days) are epic, the rest rare
  function earnTier(id) { var n = (EARN[id] || {}).need || {}; return (n.weeks >= 2 || n.mastered >= 5 || 'area3at' in n || n.island || n.stars >= 400 || n.days >= 20) ? 'epic' : 'rare'; }
  /* ---------- FRIENDS track (data-driven, keyed by id) ---------- */
  var NEED_TXT = { mastered: ['master', 'skill'], days: ['play', 'day'], weeks: ['meet your weekly goal', 'time'], popquiz: ['finish', 'Pop Quiz theme'], reviews: ['finish', 'Memory Lane review'], bosses: ['beat', 'boss round'] };
  function charRule(id) { return cast().unlockable.filter(function (u) { return u.id === id; })[0] || null; }
  function charProgress(p, id, x) {
    var r = charRule(id); if (!r) return { ok: cast().starter.indexOf(id) >= 0, parts: [] };
    x = x || stats(p); var parts = Object.keys(r.need).map(function (k) { return { what: k, have: Math.min(x[k] || 0, r.need[k]), need: r.need[k], ok: (x[k] || 0) >= r.need[k] }; });
    return { ok: parts.every(function (q) { return q.ok; }), parts: parts };
  }
  function charName(id) { var r = charRule(id); return (r && r.name) || (A.Blobs && A.Blobs.byId && A.Blobs.byId[id] || { name: id }).name; }
  // "Master 1 more skill to meet a new friend!" (never names the friend: keeps the surprise)
  function charHint(p, id) {
    var pr = charProgress(p, id), bits = pr.parts.filter(function (q) { return !q.ok; }).map(function (q) { var t = NEED_TXT[q.what] || [q.what, ''], m = q.need - q.have;
      return t[0] + ' ' + m + ' more ' + t[1] + (m > 1 && t[1] ? 's' : ''); });
    var s = bits.join(' and '); return s ? s.charAt(0).toUpperCase() + s.slice(1) + ' to meet a new friend!' : '';
  }
  // the next friend to meet (in list order) with progress — for the "Next friend" card
  function nextFriend(p) {
    var b = (p.unlocks && p.unlocks.blobs) || {}, x = stats(p), r = cast().unlockable.filter(function (u) { return !b[u.id] && p.blob !== u.id; })[0]; if (!r) return null;
    var pr = charProgress(p, r.id, x), have = 0, need = 0; pr.parts.forEach(function (q) { have += q.have; need += q.need; });
    return { id: r.id, name: charName(r.id), have: have, need: need, pct: need ? Math.round(100 * have / need) : 100, hint: charHint(p, r.id) };
  }
  /* ---------- HATS track hook (Pop Quiz, later) ---------- */
  function popQuizTheme(p, theme) { var q = p.popquiz || (p.popquiz = { themes: {} }); q.themes = q.themes || {}; if (!q.themes[theme]) q.themes[theme] = Date.now(); return check(p); }
  /* ---------- weekly track hooks: reviews / bosses / effort ("tried again") counters ---------- */
  function effort(p, kind, n) { var e = p.effort || (p.effort = {}); e[kind] = (e[kind] || 0) + (n || 1); }
  /* ---------- furniture prices on a curve + badge gates (applied to the shared room catalog) ---------- */
  function furniturePrice(base) { var c = CONFIG.furniture.curve; for (var i = 0; i < c.length; i++) if (base <= c[i][0]) return c[i][1]; return c[c.length - 1][1]; }
  function applyRoomPrices() {
    var RC = A.RoomCatalog; if (!RC || RC.paced) return; RC.paced = true; var F = CONFIG.furniture;
    RC.ITEMS.forEach(function (it) {
      if (it.starter || it.need) return;
      it.base = it.price; it.price = (F.fixed && F.fixed[it.id]) || (F.firstWin && F.firstWin[it.id]) || F.showpieces[it.id] || furniturePrice(it.base);
      var g = F.gates[it.id]; if (g && BADGES[g]) { it.badge = g; it.hint = BADGES[g].hint; it.tier = F.showpieces[it.id] ? 'epic' : 'rare'; }
      else it.tier = it.price <= 30 ? 'uncommon' : 'rare';
    });
    var e0 = RC.earned; RC.earned = function (p, it) { if (it.badge) return badge(p, it.badge); return e0(p, it); };
  }
  applyRoomPrices();
  var STICKERS = [
    { id: 'first_munch', name: 'First Munch!', hint: 'Finish a ' + TT.munch + ' round', art: 'donut', test: function (p) { return p.games.munch.rounds >= 1; } },
    { id: 'stars_10', name: '10 Stars', hint: 'Earn 10 stars', art: 'star', test: function (p) { return p.stars >= 10; } },
    { id: 'perfect_1', name: 'Perfect!', hint: 'A round with no oopsies', art: 'sun', test: function (p) { return p.games.munch.perfect >= 1; } },
    { id: 'stars_25', name: '25 Stars', hint: 'Earn 25 stars', art: 'rainbow', test: function (p) { return p.stars >= 25; } },
    { id: 'rounds_10', name: '10 Rounds', hint: 'Play 10 rounds', art: 'cupcake', test: function (p) { return p.games.munch.rounds >= 10; } },
    { id: 'dress_up', name: 'Dress Up', hint: 'Change your friend in Dress Up', art: 'strawberry', test: function (p) { return !!p.flags.dressed; } },
    { id: 'master_1', name: 'Skill Master', hint: 'Master a new math skill', art: 'medal', test: function (p) { return mc().masteredCount(p) >= 1; } },
    { id: 'perfect_3', name: 'Triple Perfect', hint: '3 perfect rounds', art: 'icecream', test: function (p) { return (p.games.munch.perfect || 0) >= 3; } },   // design2: any 3 perfect rounds (not in a row: no streak pressure)
    { id: 'days_3', name: '3 Play Days', hint: 'Play on 3 different days', art: 'ladybug', test: function (p) { return Object.keys(p.days).length >= 3; } },
    { id: 'stars_50', name: '50 Stars', hint: 'Earn 50 stars', art: 'rocket', test: function (p) { return p.stars >= 50; } },
    { id: 'grumbly', name: 'Cloud Dodger', hint: 'Finish a round with Grumbly on', art: 'cloud', test: function (p) { return (p.games.munch.grumblyWins || 0) >= 1; } },
    { id: 'rounds_25', name: '25 Rounds', hint: 'Play 25 rounds', art: 'balloon', test: function (p) { return p.games.munch.rounds >= 25; } },
    { id: 'master_3', name: 'Super Learner', hint: 'Master 3 math skills', art: 'flower', test: function (p) { return mc().masteredCount(p) >= 3; } },
    { id: 'days_7', name: '7 Play Days', hint: 'Play on 7 different days', art: 'moon', test: function (p) { return Object.keys(p.days).length >= 7; } },
    { id: 'stars_100', name: '100 Stars', hint: 'Earn 100 stars', art: 'trophy', test: function (p) { return p.stars >= 100; } },
    { id: 'rounds_50', name: '50 Rounds', hint: 'Play 50 rounds', art: 'watermelon', test: function (p) { return p.games.munch.rounds >= 50; } },
    { id: 'stars_200', name: '200 Stars', hint: 'Earn 200 stars', art: 'planet', test: function (p) { return p.stars >= 200; } },
    { id: 'bb_first', name: 'Play Ball!', hint: 'Finish a game of ' + TT.baseball, art: 'baseball', test: function (p) { return ((p.games.baseball || {}).games || 0) >= 1; } },
    { id: 'bb_homer', name: 'Home Run Hero', hint: 'Hit a home run in ' + TT.baseball, art: 'homer', test: function (p) { return ((p.games.baseball || {}).homers || 0) >= 1; } },
    { id: 'week_1', tier: 'rare', name: 'Great Week', hint: 'Play on 3 days in one week', art: 'sun', test: function (p) { return weeksMet(p) >= 1; } },
    { id: 'week_4', tier: 'rare', name: 'Four Great Weeks', hint: 'Meet your weekly goal in 4 weeks', art: 'moon', test: function (p) { return weeksMet(p) >= 4; } },
    { id: 'area_1', tier: 'rare', name: 'Area Hero', hint: 'Beat a whole Story area', art: 'trophy', test: function (p) { return areasN(p, function (r) { return r.passed; }) >= 1; } },
    { id: 'ch_perfect', tier: 'rare', name: 'Flawless!', hint: 'Win 2 friend challenges with no oopsies', art: 'medal', test: function (p) { return chPerfect(p) >= 2; } },   // 2, so one lucky round isn't enough
    { id: 'area_3star', tier: 'epic', name: 'Three-Star Area', hint: 'Get 3 stars on both stops of 2 Story areas', art: 'crown', test: function (p) { return areasN(p, function (r) { return r.stars >= 3; }) >= 2; } },
    { id: 'master_5', tier: 'epic', name: 'Brain Champ', hint: 'Master 5 skills', art: 'planet', test: function (p) { return mastered(p) >= 5; } },
    // Tiny Picnic (toddler mode): a sticker every few rounds, nothing more (one star per round is given by the game)
    { id: 'tiny_3', name: 'Tiny Picnic', hint: 'Play 3 Tiny Picnic rounds', art: 'strawberry', test: function (p) { return tinyN(p) >= 3; } },
    { id: 'tiny_8', name: 'Picnic Helper', hint: 'Play 8 Tiny Picnic rounds', art: 'cupcake', test: function (p) { return tinyN(p) >= 8; } },
    { id: 'tiny_15', name: 'Picnic Pal', hint: 'Play 15 Tiny Picnic rounds', art: 'balloon', test: function (p) { return tinyN(p) >= 15; } },
    { id: 'tiny_25', name: 'Picnic Star', hint: 'Play 25 Tiny Picnic rounds', art: 'rainbow', test: function (p) { return tinyN(p) >= 25; } },
    { id: 'master_all', name: 'Math Champ', hint: 'Master every skill to 20', art: 'crown', test: function (p) { return mc().masteredAll(p) && mc().masteredCount(p) > 0; } }
  ];
  // tiers of the original stickers (new ones carry their own) and harder thresholds (ids kept, so old saves keep what they earned)
  var STK_TIER = { master_1: 'rare', perfect_3: 'rare', days_7: 'rare', master_3: 'epic', stars_100: 'rare', stars_200: 'rare', rounds_50: 'rare', master_all: 'epic', grumbly: 'rare', bb_homer: 'rare' };
  // design2: stars_25 40 -> 60 stars, so the easier (not-in-a-row) Triple Perfect keeps week-1 pacing at 17 (reward-sim)
  var STK_FIX = { stars_25: 60, stars_50: 90, stars_100: 160, stars_200: 320, rounds_10: 15, rounds_25: 40, rounds_50: 90 };
  STICKERS.forEach(function (s) {
    s.tier = s.tier || STK_TIER[s.id] || 'uncommon';
    var n = STK_FIX[s.id]; if (!n) return;
    if (/^stars_/.test(s.id)) { s.hint = 'Earn ' + n + ' stars'; s.test = function (p) { return p.stars >= n; }; }
    else { s.hint = 'Play ' + n + ' rounds'; s.test = function (p) { return p.games.munch.rounds >= n; }; }
  });
  var STK_BY = {}; STICKERS.forEach(function (s) { STK_BY[s.id] = s; });
  var OUTFIT_COST = CONFIG.outfitCost, COLOR_COST = CONFIG.colorCost;

  function pace(p) { var x = p.pace || (p.pace = { v: 1, day: '', n: 0, queue: [] }); x.queue = x.queue || []; return x; }
  // old saves: keep every outfit/color the old (cheaper) star costs had already unlocked; won characters stay in p.unlocks.blobs
  function grandfather(p) {
    if (!p || !p.unlocks || (p.flags && p.flags.paced)) return; p.flags = p.flags || {}; p.flags.paced = 1;
    var u = p.unlocks; u.outfits = u.outfits || {}; u.colors = u.colors || {};
    Object.keys(LEGACY_OUTFIT).forEach(function (id) { if (p.stars >= LEGACY_OUTFIT[id] && !u.outfits[id]) u.outfits[id] = 1; });
    Object.keys(LEGACY_COLOR).forEach(function (id) { if (p.stars >= LEGACY_COLOR[id] && !u.colors[id]) u.colors[id] = 1; });
  }
  function costOk(p, kind, id, x) { var cost = (kind === 'outfit' ? OUTFIT_COST : COLOR_COST)[id] || 0, nd = (kind === 'outfit' ? CONFIG.outfitNeed : CONFIG.colorNeed)[id]; return p.stars >= cost && (!nd || badge(p, nd, x)); }
  function unlocked(p, kind, id) {
    grandfather(p);
    if (kind === 'blob') return !!(p.unlocks.blobs && p.unlocks.blobs[id]) || p.blob === id;
    if (kind === 'outfit' && EARN[id]) return !!p.unlocks.outfits[id];   // earn-rule items: only once earned (never "free")
    var cost = (kind === 'outfit' ? OUTFIT_COST : COLOR_COST)[id] || 0;
    return cost === 0 || !!p.unlocks[kind === 'outfit' ? 'outfits' : 'colors'][id];
  }
  function tierOf(it) {
    if (it.kind === 'sticker') return STK_BY[it.id].tier;
    if (it.kind === 'blob') return 'epic';
    if (it.kind === 'hat') return 'rare';
    if (it.kind === 'outfit' && EARN[it.id]) return earnTier(it.id);
    var cost = (it.kind === 'outfit' ? OUTFIT_COST : COLOR_COST)[it.id] || 0; return cost >= CONFIG.rareAt ? 'rare' : 'uncommon';
  }
  /* Find newly-earned rewards and record them. Uncommon ones are limited per session (day); everything earned goes into
     p.pace.queue and is celebrated together back in the hub (celebrateSession). Returns [{kind, id, tier}] earned now. */
  function check(p) {
    if (!p || p.guest) return [];
    grandfather(p); var P = pace(p), d = today(); if (P.day !== d) { P.day = d; P.n = 0; }
    var x = stats(p), cand = [], bl = p.unlocks.blobs || (p.unlocks.blobs = {});
    cast().unlockable.forEach(function (u) { if (!bl[u.id] && charProgress(p, u.id, x).ok && (!A.Blobs || !A.Blobs.byId || A.Blobs.byId[u.id])) cand.push({ kind: 'blob', id: u.id }); });
    var th = (p.popquiz || {}).themes || {}; Object.keys(th).forEach(function (t) { var o = CONFIG.hats[t]; if (o && A.Blobs && A.Blobs.outfitById && A.Blobs.outfitById[o] && !p.unlocks.outfits[o]) cand.push({ kind: 'hat', id: o }); });
    STICKERS.forEach(function (s) { if (!p.stickers[s.id] && s.test(p)) cand.push({ kind: 'sticker', id: s.id }); });
    Object.keys(EARN).forEach(function (id) { if (!p.unlocks.outfits[id] && earnOk(p, id, x)) cand.push({ kind: 'outfit', id: id }); });
    Object.keys(OUTFIT_COST).forEach(function (id) { if (OUTFIT_COST[id] > 0 && !p.unlocks.outfits[id] && costOk(p, 'outfit', id, x)) cand.push({ kind: 'outfit', id: id }); });
    Object.keys(COLOR_COST).forEach(function (id) { if (COLOR_COST[id] > 0 && !p.unlocks.colors[id] && costOk(p, 'color', id, x)) cand.push({ kind: 'color', id: id }); });
    var out = [];
    cand.forEach(function (it) {
      it.tier = tierOf(it);
      if (it.tier === 'uncommon') { if (P.n >= CONFIG.uncommonPerSession) return; P.n++; }
      var t = Date.now();
      if (it.kind === 'sticker') p.stickers[it.id] = t; else if (it.kind === 'outfit' || it.kind === 'hat') p.unlocks.outfits[it.id] = t; else if (it.kind === 'color') p.unlocks.colors[it.id] = t; else bl[it.id] = t;
      if (it.kind === 'blob' || /^master/.test(it.id)) { var ms = masteredSkills(p).slice(-1)[0]; if (ms) it.skill = ms.id; }
      out.push(it); P.queue.push({ kind: it.kind, id: it.id, tier: it.tier, skill: it.skill || null });
    });
    return out;
  }
  // "You can compare numbers to 20 now!" — what was learned (skill.can if a skill has one, else its short description)
  function learnedLine(sid) { var s = A.Curriculum && A.Curriculum.byId[sid]; if (!s) return ''; return s.can ? 'You can ' + s.can + ' now!' : 'You mastered ' + (s.short || s.name) + '!'; }
  // the old "next star prize" (outfit/color by stars)
  // the next star prize, skipping anything the player already owns (e.g. the colour picked at creation)
  function nextGoal(p) {
    var all = [];
    Object.keys(OUTFIT_COST).forEach(function (id) { if (OUTFIT_COST[id] > p.stars && !CONFIG.outfitNeed[id] && !unlocked(p, 'outfit', id)) all.push({ kind: 'outfit', id: id, cost: OUTFIT_COST[id] }); });
    Object.keys(COLOR_COST).forEach(function (id) { if (COLOR_COST[id] > p.stars && !CONFIG.colorNeed[id] && !unlocked(p, 'color', id) && p.color !== id) all.push({ kind: 'color', id: id, cost: COLOR_COST[id] }); });
    all.sort(function (a, b) { return a.cost - b.cost; }); return all[0] || null;
  }
  function goals(p) { var x = stats(p); return CONFIG.goals.map(function (g) { var need = g.of === 'friends' ? x.friendsAll : g.need, have = Math.min(x[g.of] || 0, need);
    return { id: g.id, name: g.name, icon: g.icon, have: have, need: need, pct: need ? Math.round(100 * have / need) : 100, done: have >= need }; }); }
  // long-term goal for the "next goal" bar: the first unfinished CONFIG.goals entry
  function longGoal(p) { return goals(p).filter(function (g) { return !g.done; })[0] || null; }
  function itemName(it) {
    if (it.kind === 'sticker') return STK_BY[it.id].name;
    if (it.kind === 'outfit' || it.kind === 'hat') return (A.Blobs && A.Blobs.outfitById[it.id] || { name: it.id }).name;
    if (it.kind === 'color') return (A.Blobs && A.Blobs.colorById[it.id] || { name: it.id }).name + ' color';
    if (it.kind === 'blob') return charName(it.id);
    return it.id;
  }
  function itemArt(p, it) {
    if (it.kind === 'sticker') return stickerSVG(STK_BY[it.id].art);
    if (it.kind === 'outfit' || it.kind === 'hat') return A.Blobs.svg({ blob: p.blob, color: p.color, outfit: it.id });
    if (it.kind === 'color') return A.Blobs.svg({ blob: p.blob, color: it.id, outfit: p.outfit });
    return A.Blobs.svg({ blob: it.id, expr: 'happy' });
  }
  /* new-friend reveal: a picnic basket shakes, opens, and the friend pops out (art/theme/unlock -> assets/picnic/unlock,
     built by tools/build-unlock-art.js with no sparkle or glow). Friends without reveal art just show in the prize list. */
  var UNLOCK_ROOT = (function () { var sc = typeof document !== "undefined" && document.currentScript; return sc && sc.src ? sc.src.replace(/js\/core\/rewards\.js(\?.*)?$/, '') + 'assets/picnic/unlock/' : 'assets/picnic/unlock/'; })();
  var REVEAL_IDS = ['mochi', 'banana', 'pear', 'carrot', 'broccoli', 'sushi', 'taco', 'pizza', 'pancake', 'cupcake', 'avocado', 'watermelon', 'pretzel', 'grapes', 'onigiri', 'pineapple', 'waffle', 'lemon', 'donut', 'popcorn', 'peach', 'cheese', 'cookie'];
  function hasRevealArt(id) { return REVEAL_IDS.indexOf(id) >= 0; }
  function lockedArt(id) { return hasRevealArt(id) ? UNLOCK_ROOT + 'locked_' + id + '.webp' : ''; }
  function revealHTML(id) {
    var u = function (n) { return '<img src="' + UNLOCK_ROOT + n + '.webp" alt="" draggable="false">'; };
    return '<div class="fbasket" aria-hidden="true"><span class="fb1">' + u('basket_closed') + '</span><span class="fb2">' + u('basket_opening') + '</span><span class="fb3">' + u('basket_open') + '</span>' +
      '<span class="fb4">' + u('reveal_' + id) + '</span></div><p class="fbname">' + A.esc(charName(id)) + '</p>';
  }
  /* end of session (back in the hub): ONE card with up to CONFIG.cardsPerSession prizes (biggest first); extras stay queued */
  var ORDER = { epic: 0, rare: 1, uncommon: 2 };
  function takeSession(p) { var P = pace(p); P.queue.sort(function (a, b) { return (a.tier in ORDER ? ORDER[a.tier] : 2) - (b.tier in ORDER ? ORDER[b.tier] : 2); });
    var now = P.queue.slice(0, CONFIG.cardsPerSession); P.queue = P.queue.slice(CONFIG.cardsPerSession); return now; }
  function celebrateSession(p) {
    if (!p || !pace(p).queue.length) return Promise.resolve(false);
    var items = takeSession(p), left = pace(p).queue.length; if (A.Store) A.Store.save();
    var learned = items.filter(function (it) { return it.skill; }).map(function (it) { return learnedLine(it.skill); })[0] || '';
    var html = '<div class="sessprizes">' + items.map(function (it) { return '<div class="sp ' + it.tier + '"><span class="spa">' + itemArt(p, it) + '</span><b>' + A.esc(itemName(it)) + '</b>' +
      '<small>' + ({ blob: 'New friend!', sticker: 'Sticker', outfit: 'Outfit', hat: 'Hat', color: 'Color' }[it.kind] || '') + (it.tier === 'rare' || it.tier === 'epic' ? ' ★' : '') + '</small>' + '</div>'; }).join('') + '</div>' +
      (learned ? '<p class="splearn">' + A.esc(learned) + '</p>' : '') + (left ? '<p class="spmore">+' + left + ' more waiting for next time!</p>' : '');
    var voice = ['rw_session_prizes']; if (items.some(function (it) { return it.kind === 'blob'; })) voice.push('rw_new_friend'); if (learned) voice.push('rw_you_learned'); if (left) voice.push('rw_more_next_time');
    var nf = items.filter(function (it) { return it.kind === 'blob' && hasRevealArt(it.id); })[0];
    return A.UI.card({ tag: "Today's prizes", title: items.length === 1 ? itemName(items[0]) : 'You earned ' + items.length + ' prizes!', art: nf ? revealHTML(nf.id) : '', html: html, glow: !items.some(function (it) { return it.kind === 'blob'; }),
      voice: voice, sfx: 'unlock', confetti: !nf, btn: 'Yay!', cls: 'reward session' + (nf ? ' newfriend' : ''), minMs: nf ? 1800 : 0 }).then(function () { return true; });
  }
  // Show celebration cards one after another
  function celebrate(p, items, who) { // who: show the player name on each card (two-player mode)
    var pre = who ? who + ' · ' : '';
    var chain = Promise.resolve();
    (items || []).forEach(function (it) {
      chain = chain.then(function () {
        if (it.kind !== 'skill' && !it.now) { if (!pre) A.UI.toast('🎁 ' + itemName(it) + ' — saved for the end!'); return; }   // batch-celebrated in the hub
        if (it.kind === 'sticker') {
          var s = STK_BY[it.id];
          return A.UI.card({ tag: pre + 'New sticker!', title: s.name, art: stickerSVG(s.art), glow: true, sub: s.hint, voice: ['hub_new_sticker'], sfx: 'unlock', confetti: true, btn: 'Yay!', cls: 'reward' });
        }
        if (it.kind === 'outfit') {
          var o = A.Blobs.outfitById[it.id];
          return A.UI.card({ tag: pre + 'Unlocked!', title: o.name, art: '<div class="dance">' + A.Blobs.svg({ blob: p.blob, color: p.color, outfit: it.id }) + '</div>', glow: true, sub: 'Try it on in Dress Up!', voice: ['hub_new_outfit'], sfx: 'unlock', confetti: true, btn: 'Yay!', cls: 'reward' });
        }
        if (it.kind === 'color') {
          var c = A.Blobs.colorById[it.id];
          return A.UI.card({ tag: pre + 'New color!', title: c.name, art: '<div class="dance">' + A.Blobs.svg({ blob: p.blob, color: it.id, outfit: p.outfit }) + '</div>', glow: true, sub: 'Try it on in Dress Up!', voice: ['hub_new_color'], sfx: 'unlock', confetti: true, btn: 'Yay!', cls: 'reward' });
        }
        if (it.kind === 'skill') {
          var sk = A.Curriculum.byId[it.id];
          return A.UI.card({ tag: pre + 'New skill!', title: sk.name, art: '<div class="dance">' + A.Blobs.forProfile(p) + '</div>', html: '<div class="example">' + (sk.intro && sk.intro.example || '') + '</div>', sub: sk.short, voice: ['fb_new_skill', sk.intro.line], sfx: 'unlock', confetti: true, btn: "Let's go!", cls: 'skillcard' });
        }
      });
    });
    return chain;
  }

  A.Rewards = { CONFIG: CONFIG, BADGES: BADGES, badge: badge, stats: stats, weeksMet: weeksMet, weekDays: weekDays, charRule: charRule, charProgress: charProgress, charHint: charHint, nextFriend: nextFriend,
    characters: function () { return CONFIG.characters; }, popQuizTheme: popQuizTheme, effort: effort, furniturePrice: furniturePrice, applyRoomPrices: applyRoomPrices, grandfather: grandfather, pace: pace,
    longGoal: longGoal, goals: goals, takeSession: takeSession, celebrateSession: celebrateSession, revealHTML: revealHTML, hasRevealArt: hasRevealArt, lockedArt: lockedArt, itemName: itemName, tierOf: tierOf, learnedLine: learnedLine,
    STICKERS: STICKERS, stickerById: STK_BY, stickerSVG: stickerSVG, OUTFIT_COST: OUTFIT_COST, COLOR_COST: COLOR_COST, unlocked: unlocked, check: check, celebrate: celebrate, nextGoal: nextGoal,
    OUTFIT_EARN: EARN, earnOk: earnOk, earnHint: earnHint, earnShort: earnShort, earnProgress: earnProgress, earnTier: earnTier };
})(window.Arcade);
