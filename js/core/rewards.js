/* Blob Arcade — rewards: stickers for milestones, and blob outfits/colours unlocked by total stars earned.
   Stars are never spent (kids never "lose" anything); unlocks are milestones. */
(function (A) {
  'use strict';
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
  var STICKERS = [
    { id: 'first_munch', name: 'First Munch!', hint: 'Finish a Mochi Munch round', art: 'donut', test: function (p) { return p.games.munch.rounds >= 1; } },
    { id: 'stars_10', name: '10 Stars', hint: 'Earn 10 stars', art: 'star', test: function (p) { return p.stars >= 10; } },
    { id: 'perfect_1', name: 'Perfect!', hint: 'A round with no oopsies', art: 'sun', test: function (p) { return p.games.munch.perfect >= 1; } },
    { id: 'stars_25', name: '25 Stars', hint: 'Earn 25 stars', art: 'rainbow', test: function (p) { return p.stars >= 25; } },
    { id: 'rounds_10', name: '10 Rounds', hint: 'Play 10 rounds', art: 'cupcake', test: function (p) { return p.games.munch.rounds >= 10; } },
    { id: 'dress_up', name: 'Dress Up', hint: 'Change your blob in Dress Up', art: 'strawberry', test: function (p) { return !!p.flags.dressed; } },
    { id: 'master_1', name: 'Skill Master', hint: 'Master a new math skill', art: 'medal', test: function (p) { return mc().masteredCount(p) >= 1; } },
    { id: 'perfect_3', name: 'Triple Perfect', hint: '3 perfect rounds in a row', art: 'icecream', test: function (p) { return (p.games.munch.best || 0) >= 3; } },
    { id: 'days_3', name: '3 Play Days', hint: 'Play on 3 different days', art: 'ladybug', test: function (p) { return Object.keys(p.days).length >= 3; } },
    { id: 'stars_50', name: '50 Stars', hint: 'Earn 50 stars', art: 'rocket', test: function (p) { return p.stars >= 50; } },
    { id: 'grumbly', name: 'Cloud Dodger', hint: 'Finish a round with Grumbly on', art: 'cloud', test: function (p) { return (p.games.munch.grumblyWins || 0) >= 1; } },
    { id: 'rounds_25', name: '25 Rounds', hint: 'Play 25 rounds', art: 'balloon', test: function (p) { return p.games.munch.rounds >= 25; } },
    { id: 'master_3', name: 'Super Learner', hint: 'Master 3 math skills', art: 'flower', test: function (p) { return mc().masteredCount(p) >= 3; } },
    { id: 'days_7', name: '7 Play Days', hint: 'Play on 7 different days', art: 'moon', test: function (p) { return Object.keys(p.days).length >= 7; } },
    { id: 'stars_100', name: '100 Stars', hint: 'Earn 100 stars', art: 'trophy', test: function (p) { return p.stars >= 100; } },
    { id: 'rounds_50', name: '50 Rounds', hint: 'Play 50 rounds', art: 'watermelon', test: function (p) { return p.games.munch.rounds >= 50; } },
    { id: 'stars_200', name: '200 Stars', hint: 'Earn 200 stars', art: 'planet', test: function (p) { return p.stars >= 200; } },
    { id: 'bb_first', name: 'Play Ball!', hint: 'Finish a game of Blob Baseball', art: 'baseball', test: function (p) { return ((p.games.baseball || {}).games || 0) >= 1; } },
    { id: 'bb_homer', name: 'Home Run Hero', hint: 'Hit a home run in Blob Baseball', art: 'homer', test: function (p) { return ((p.games.baseball || {}).homers || 0) >= 1; } },
    { id: 'master_all', name: 'Math Champ', hint: 'Master every skill to 20', art: 'crown', test: function (p) { return mc().masteredAll(p) && mc().masteredCount(p) > 0; } }
  ];
  var STK_BY = {}; STICKERS.forEach(function (s) { STK_BY[s.id] = s; });
  var OUTFIT_COST = { none: 0, bow: 3, cap: 6, headband: 10, sunglasses: 15, flower: 20, partyhat: 26, beanie: 33, crown: 45 };
  var COLOR_COST = { classic: 0, berry: 8, mint: 12, sunny: 18, sky: 24, grape: 30, cocoa: 38, rainbow: 55 };

  function unlocked(p, kind, id) {
    if (kind === 'blob') return !!(p.unlocks.blobs && p.unlocks.blobs[id]) || p.blob === id;
    var cost = (kind === 'outfit' ? OUTFIT_COST : COLOR_COST)[id] || 0;
    return cost === 0 || p.stars >= cost || !!p.unlocks[kind === 'outfit' ? 'outfits' : 'colors'][id];
  }
  // Find newly-earned rewards, record them, return [{kind, id}] for celebrating.
  function check(p) {
    var out = [];
    STICKERS.forEach(function (s) { if (!p.stickers[s.id] && s.test(p)) { p.stickers[s.id] = Date.now(); out.push({ kind: 'sticker', id: s.id }); } });
    Object.keys(OUTFIT_COST).forEach(function (id) { if (OUTFIT_COST[id] > 0 && !p.unlocks.outfits[id] && p.stars >= OUTFIT_COST[id]) { p.unlocks.outfits[id] = Date.now(); out.push({ kind: 'outfit', id: id }); } });
    Object.keys(COLOR_COST).forEach(function (id) { if (COLOR_COST[id] > 0 && !p.unlocks.colors[id] && p.stars >= COLOR_COST[id]) { p.unlocks.colors[id] = Date.now(); out.push({ kind: 'color', id: id }); } });
    return out;
  }
  function nextGoal(p) {
    var all = [];
    Object.keys(OUTFIT_COST).forEach(function (id) { if (OUTFIT_COST[id] > p.stars) all.push({ kind: 'outfit', id: id, cost: OUTFIT_COST[id] }); });
    Object.keys(COLOR_COST).forEach(function (id) { if (COLOR_COST[id] > p.stars) all.push({ kind: 'color', id: id, cost: COLOR_COST[id] }); });
    all.sort(function (a, b) { return a.cost - b.cost; }); return all[0] || null;
  }
  // Show celebration cards one after another
  function celebrate(p, items, who) { // who: show the player name on each card (two-player mode)
    var pre = who ? who + ' · ' : '';
    var chain = Promise.resolve();
    (items || []).forEach(function (it) {
      chain = chain.then(function () {
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

  A.Rewards = { STICKERS: STICKERS, stickerById: STK_BY, stickerSVG: stickerSVG, OUTFIT_COST: OUTFIT_COST, COLOR_COST: COLOR_COST, unlocked: unlocked, check: check, celebrate: celebrate, nextGoal: nextGoal };
})(window.Arcade);
