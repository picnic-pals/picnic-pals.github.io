/* Blob Arcade — BLOB ROOM: a cozy room per kid. Shop (star bits), decorate on a floor grid + wall slots,
   blob friends who wander, sit, nap and chat (friendship levels + bios), and a trophy shelf.
   Layout saved per profile in p.room (autosaves on every change). */
(function (A) {
  'use strict';
  var $ = A.$, B = A.Blobs, V = A.Voice, UI = A.UI, R = A.Rewards, CAT = A.RoomCatalog, ART = A.RoomArt, F = A.Friends, M = A.Music;
  UI.boot();
  var qs = {}; location.search.replace(/^\?/, '').split('&').forEach(function (kv) { if (kv) { var a = kv.split('='); qs[decodeURIComponent(a[0])] = decodeURIComponent(a[1] || ''); } });
  var P = A.Store.active();
  if (!P) { location.href = '../../index.html'; return; }
  var S = A.Store.settings;
  // v2p1b: new short read-aloud lines (no recorded/TTS clip yet, so V.say speaks them with the device voice)
  var NEWL = { rm_demo: 'Tap a thing to pick it. Then drag it where you want!', rm_drag: 'Drag it where you want!',
    rm_jar_set: 'Saving up for it! Your jar fills up as you play.', rm_jar_ready: 'Your jar is full! You can buy it now!',
    rm_jar_empty: 'Pick something in the shop to save up for!', rm_no_room: 'Your picnic spot is full! Put something away first.',
    rm_buy_it: 'Do you want to buy it?', rm_new_shop: 'Something new is in the shop! Come and see!', rm_things: 'Here are your things! Tap one to put it out.' };
  if (A.VoiceLines && A.VoiceLines.byId) Object.keys(NEWL).forEach(function (id) { if (!A.VoiceLines.byId[id]) A.VoiceLines.byId[id] = { id: id, text: NEWL[id], section: 'room' }; });
  // grown-ups can grant star bits or reset the room in the parent area: pick up their changes when it closes
  var bitsAtOpen = P.wallet.bits;
  UI.gear({ onClose: function () { musicBtn(); M.apply(); var q = A.Store.get(P.id); if (!q || q.room !== RM || q.wallet.bits !== bitsAtOpen) location.reload(); } });
  if (A.PlayTime) setTimeout(function () { A.PlayTime.checkpoint(); }, 600);   // play-time limit: checked on arrival (no rounds here)

  /* ================= geometry: a cut-away room, 1200 × 760 ================= */
  // Picnic Spot: the painted scene (assets/picnic/room/room_bg.webp, 1024x640 stretched to 1200x760) is the room; the floor grid
  // and wall slots are invisible and line up with its floor (back edge at y 427, x 141..1061) and back wall.
  var VW = 1200, VH = 760, BX0 = 141, BX1 = 1061, BY0 = 83, BY1 = 427, FY1 = 760, COLS = 7, ROWS = 4, SLOTS = 6;
  var BG = '../../assets/picnic/room/room_bg.webp';
  var SLOT_X = [222, 318, 508, 690, 884, 980], SLOT_Y = [190, 190, 112, 112, 190, 190]; // two each side of the window, two above it
  function lerp(a, b, t) { return a + (b - a) * t; }
  function sOf(t) { return t * (.6 + .4 * t); }                   // depth: back of the floor 0 → front 1 (rows nearer you are taller)
  function tOf(s) { return (-.6 + Math.sqrt(.36 + 1.6 * s)) / .8; }
  function yAt(s) { return BY1 + (FY1 - BY1) * s; }
  function xAt(u, s) { return lerp(BX0 - BX0 * s, BX1 + (VW - BX1) * s, u); }
  function scaleAt(y) { return .62 + .5 * (y - BY1) / (FY1 - BY1); }
  function cellXY(c, r) { var s = sOf((r + .5) / ROWS); return { x: xAt((c + .5) / COLS, s), y: yAt(s) }; }
  function cellPoly(c, r) {
    var s0 = sOf(r / ROWS), s1 = sOf((r + 1) / ROWS), u0 = c / COLS, u1 = (c + 1) / COLS;
    return [[xAt(u0, s0), yAt(s0)], [xAt(u1, s0), yAt(s0)], [xAt(u1, s1), yAt(s1)], [xAt(u0, s1), yAt(s1)]];
  }
  function slotXY(i) { return { x: SLOT_X[i], y: SLOT_Y[i] }; }
  function slotRect(i) { var w = i === 2 || i === 3 ? 170 : 90, h = i === 2 || i === 3 ? 70 : 170; return { x: SLOT_X[i] - w / 2, y: SLOT_Y[i] - h / 2, w: w, h: h }; }
  function nearestSlot(x, y) { var b = 0, bd = 1e9; for (var i = 0; i < SLOTS; i++) { var d = Math.hypot(x - SLOT_X[i], (y - SLOT_Y[i]) * 1.5); if (d < bd) { bd = d; b = i; } } return b; }
  function pts(a) { return a.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '); }
  function pct(x, y) { return 'left:' + (x / VW * 100).toFixed(3) + '%;top:' + (y / VH * 100).toFixed(3) + '%;'; }
  // a point (room units) → floor cell or wall slot
  function hit(x, y) {
    if (y >= BY1) { var s = (y - BY1) / (FY1 - BY1), r = Math.min(ROWS - 1, Math.floor(tOf(s) * ROWS)), l = xAt(0, s), rr = xAt(1, s), c = Math.floor((x - l) / (rr - l) * COLS); if (c < 0 || c >= COLS) return null; return { k: 'floor', c: c, r: r }; }
    if (x >= BX0 && x <= BX1 && y > 60) return { k: 'wall', s: nearestSlot(x, y) };
    return null;
  }
  // sky, wall and season helpers
  var NOW = new Date(), HOUR = qs.h != null ? +qs.h : NOW.getHours() + NOW.getMinutes() / 60, MONTH = qs.m != null ? +qs.m : NOW.getMonth() + 1;
  var TOD = HOUR >= 7 && HOUR < 17 ? 'day' : (HOUR >= 17 && HOUR < 20) || (HOUR >= 6 && HOUR < 7) ? 'dusk' : 'night';
  var SEASON = MONTH === 12 || MONTH <= 2 ? 'winter' : MONTH <= 5 ? 'spring' : MONTH <= 8 ? 'summer' : 'autumn';
  function sideWall(left, u, v) { // bilinear point on a side wall: u 0 (back corner) → 1 (front), v 0 (top) → 1 (floor)
    var bx = left ? BX0 : BX1, fx = left ? 0 : VW, top = [lerp(bx, fx, u), lerp(BY0, BY0 - 400, u)], bot = [lerp(bx, fx, u), lerp(BY1, FY1, u)];
    return [lerp(top[0], bot[0], v), lerp(top[1], bot[1], v)];
  }
  function quadOnWall(left, u0, u1, v0, v1) { return [sideWall(left, u0, v0), sideWall(left, u1, v0), sideWall(left, u1, v1), sideWall(left, u0, v1)]; }

  /* ================= the room's data ================= */
  function starter() {
    return { v: 1, wall: 'wp_cream', floor: 'fl_wood', n: 5, visits: 0, gifts: {}, prizes: {},
      items: [{ u: 1, id: 'bed_simple', c: 0, r: 1, f: 0 }, { u: 2, id: 'rug_round', c: 3, r: 2, f: 0 }, { u: 3, id: 'plant_flower', c: 6, r: 0, f: 0 }, { u: 4, id: 'frame_sun', s: 1, f: 0 }] };
  }
  function own(id, n) { var it = P.inventory[id] || (P.inventory[id] = { n: 0, at: Date.now() }); it.n += n || 1; return it; }
  var firstVisit = !P.room;
  if (!P.room) { P.room = starter(); ['bed_simple', 'rug_round', 'plant_flower', 'frame_sun', 'wp_cream', 'fl_wood'].forEach(function (id) { if (!P.inventory[id]) own(id); }); }
  var RM = P.room; RM.gifts = RM.gifts || {}; RM.prizes = RM.prizes || {}; RM.items = RM.items || [];
  ['wp_cream', 'fl_wood'].forEach(function (id) { if (!P.inventory[id]) own(id); });
  // never show or hint at a friend a kid hasn't met: friend-themed things (the Dora Dumpling poster) only exist for kids who have
  // that friend. Old rooms keep them in RM.stash (still owned) and they come back by themselves once the friend is met.
  var FRIEND_ITEM = { poster_mochi: 'mochi' };
  function friendOk(id) { var b = FRIEND_ITEM[id]; return !b || F.of(P).indexOf(b) >= 0; }
  // v2p1c: badge-gated showpieces and special prizes are invisible until earned (no lock tiles, no "do X to open it up")
  function shown(it) { return !!it && !((it.need || it.badge) && !CAT.earned(P, it)); }
  function inShop(it) { return it.cat !== 'paper' && !it.starter && friendOk(it.id) && shown(it); }
  RM.stash = (RM.stash || []).filter(function (x) { if (!friendOk(x.id)) return true; var it = CAT.byId[x.id]; if (it && (it.kind === 'wall' ? !atSlot(x.s) : !at(x.c, x.r, it.kind === 'rug'))) RM.items.push(x); return false; });
  var bareSlots = [];
  RM.items = RM.items.filter(function (x) {
    if (friendOk(x.id)) return true; RM.stash.push(x);
    if (CAT.byId[x.id].kind === 'wall') bareSlots.push(x.s);
    return false;
  });
  // the wall isn't left bare: a strawberry picture (a spare one, or a new one) hangs where the hidden poster was.
  // (v2p1c: was pushed inside the filter above, so it was dropped by the filter's result and the wall stayed bare)
  bareSlots.forEach(function (s) { if (atSlot(s)) return; if (avail('frame_sun') <= 0) own('frame_sun'); RM.items.push({ u: ++RM.n, id: 'frame_sun', s: s, f: 0 }); });
  function placedCount(id) { return RM.items.filter(function (x) { return x.id === id; }).length; }
  function avail(id) { return ((P.inventory[id] || {}).n || 0) - placedCount(id); }
  function at(c, r, rug) { return RM.items.filter(function (x) { var it = CAT.byId[x.id]; return x.c === c && x.r === r && (rug ? it.kind === 'rug' : it.kind === 'floor'); })[0] || null; }
  function atSlot(s) { return RM.items.filter(function (x) { return x.s === s && CAT.byId[x.id].kind === 'wall'; })[0] || null; }
  var savedT = null;
  function save() { A.Store.save(); var s = $('#saved'); s.classList.add('on'); clearTimeout(savedT); savedT = setTimeout(function () { s.classList.remove('on'); }, 1100); }

  /* ================= drawing the room (walls, window, floor, shelf) ================= */
  var NS = 'http://www.w3.org/2000/svg';
  function wallPattern(id, pid) {
    var s = ART.STYLE[id] || ART.STYLE.wp_cream, h = '<pattern id="' + pid + '" patternUnits="userSpaceOnUse" width="80" height="80"><rect width="80" height="80" fill="' + s.a + '"/>';
    if (s.k === 'stripe') h += '<rect x="0" width="26" height="80" fill="' + s.b + '"/>';
    if (s.k === 'dots') h += '<circle cx="20" cy="20" r="7" fill="#b9dcff"/><circle cx="60" cy="60" r="7" fill="#ffd0e0"/>';
    if (s.k === 'stars') h += ART.star(22, 22, 9, s.b, 0) + ART.star(60, 58, 6, s.b, 0) + '<circle cx="64" cy="18" r="2" fill="#fff"/>';
    if (s.k === 'clouds') h += '<ellipse cx="24" cy="24" rx="18" ry="8" fill="#fff"/><ellipse cx="62" cy="62" rx="16" ry="7" fill="#fff"/>';
    if (s.k === 'leaves') h += '<path d="M14 28 Q26 12 38 28 Q26 44 14 28Z M50 66 Q62 50 74 66 Q62 82 50 66Z" fill="' + s.b + '"/>';
    return h + '</pattern>';
  }
  function floorSvg(id) {
    var s = ART.STYLE[id] || ART.STYLE.fl_wood, h = '<path d="M' + BX0 + ' ' + BY1 + ' H' + BX1 + ' L' + VW + ' ' + FY1 + ' H0 Z" fill="' + s.a + '"/>', SUB = 2, k, j;
    if (s.k === 'checker' || s.k === 'tiles' || s.k === 'carpet' || s.k === 'planks') {
      for (k = 0; k < ROWS * SUB; k++) {
        var s0 = sOf(k / (ROWS * SUB)), s1 = sOf((k + 1) / (ROWS * SUB));
        for (j = 0; j < COLS * SUB; j++) {
          var u0 = j / (COLS * SUB), u1 = (j + 1) / (COLS * SUB), q = [[xAt(u0, s0), yAt(s0)], [xAt(u1, s0), yAt(s0)], [xAt(u1, s1), yAt(s1)], [xAt(u0, s1), yAt(s1)]];
          if (s.k === 'checker' && (k + j) % 2) h += '<polygon points="' + pts(q) + '" fill="#ffb3cf"/>';
          if (s.k === 'tiles') h += '<polygon points="' + pts(q) + '" fill="' + ((k + j) % 3 ? s.a : s.b) + '" stroke="#fff" stroke-width="3"/>';
          if (s.k === 'carpet' && (k + j) % 2 === 0) { var m = [(q[0][0] + q[2][0]) / 2, (q[0][1] + q[2][1]) / 2]; h += '<ellipse cx="' + m[0].toFixed(1) + '" cy="' + m[1].toFixed(1) + '" rx="' + (6 + 6 * s1).toFixed(1) + '" ry="' + (2.5 + 3 * s1).toFixed(1) + '" fill="' + s.b + '"/>'; }
        }
        if (s.k === 'planks') {
          h += '<path d="M' + xAt(0, s0).toFixed(1) + ' ' + yAt(s0).toFixed(1) + ' H' + xAt(1, s0).toFixed(1) + '" stroke="' + s.b + '" stroke-width="' + (2 + 2 * s0).toFixed(1) + '"/>';
          for (j = (k % 2); j < COLS * SUB; j += 3) { var ux = (j + .5) / (COLS * SUB); h += '<path d="M' + xAt(ux, s0).toFixed(1) + ' ' + yAt(s0).toFixed(1) + ' L' + xAt(ux, s1).toFixed(1) + ' ' + yAt(s1).toFixed(1) + '" stroke="' + s.b + '" stroke-width="2"/>'; }
        }
      }
    }
    return h;
  }
  function windowSvg() {
    var q = quadOnWall(false, .18, .78, .3, .6), sky = { day: ['#9fd8ff', '#dff3ff'], dusk: ['#ff9f7a', '#ffd9a8'], night: ['#1d2457', '#3a3f86'] }[TOD];
    var cx = (q[0][0] + q[2][0]) / 2, cy = (q[0][1] + q[2][1]) / 2, h = '<defs><linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + sky[0] + '"/><stop offset="1" stop-color="' + sky[1] + '"/></linearGradient>' +
      '<clipPath id="winClip"><polygon points="' + pts(q) + '"/></clipPath></defs><g id="window" class="' + TOD + ' ' + SEASON + '"><polygon points="' + pts(q) + '" fill="url(#skyG)"/><g clip-path="url(#winClip)">';
    if (TOD === 'day') h += '<circle cx="' + (cx + 22) + '" cy="' + (cy - 46) + '" r="22" fill="#ffe36b"/><ellipse cx="' + (cx - 20) + '" cy="' + (cy - 10) + '" rx="26" ry="10" fill="#fff" opacity=".9"/>';
    if (TOD === 'dusk') h += '<circle cx="' + (cx + 10) + '" cy="' + (cy + 40) + '" r="30" fill="#ffd25a" opacity=".9"/>';
    if (TOD === 'night') { h += '<circle cx="' + (cx + 18) + '" cy="' + (cy - 44) + '" r="18" fill="#fff6c8"/><circle cx="' + (cx + 26) + '" cy="' + (cy - 50) + '" r="16" fill="#2a3170"/>'; for (var i = 0; i < 9; i++) h += '<circle class="twk" cx="' + (cx - 50 + (i * 37) % 100).toFixed(0) + '" cy="' + (cy - 70 + (i * 53) % 140).toFixed(0) + '" r="2" fill="#fff"/>'; }
    // outside: hills; the season shows on them
    var hill = { winter: '#f4f8ff', spring: '#9fe0a8', summer: '#7fd08f', autumn: '#e8b36a' }[SEASON];
    h += '<path d="M' + (cx - 90) + ' ' + (cy + 70) + ' Q' + cx + ' ' + (cy + 20) + ' ' + (cx + 90) + ' ' + (cy + 60) + ' V' + (cy + 200) + ' H' + (cx - 90) + 'Z" fill="' + hill + '"' + (TOD === 'night' ? ' opacity=".55"' : '') + '/>';
    if (SEASON === 'autumn') h += '<circle cx="' + (cx - 30) + '" cy="' + (cy + 44) + '" r="14" fill="#ff8a2a"/><circle cx="' + (cx + 34) + '" cy="' + (cy + 36) + '" r="12" fill="#d9582a"/>';
    if (SEASON === 'spring') h += '<circle cx="' + (cx - 30) + '" cy="' + (cy + 52) + '" r="5" fill="#ff8fb1"/><circle cx="' + (cx + 20) + '" cy="' + (cy + 46) + '" r="5" fill="#ffd23c"/>';
    h += '</g><polygon points="' + pts(q) + '" fill="none" stroke="#fff" stroke-width="12" stroke-linejoin="round"/><polygon points="' + pts(q) + '" fill="none" stroke="#c9a77d" stroke-width="3"/>' +
      '<path d="M' + ((q[0][0] + q[1][0]) / 2) + ' ' + ((q[0][1] + q[1][1]) / 2) + ' L' + ((q[3][0] + q[2][0]) / 2) + ' ' + ((q[3][1] + q[2][1]) / 2) + ' M' + ((q[0][0] + q[3][0]) / 2) + ' ' + ((q[0][1] + q[3][1]) / 2) + ' L' + ((q[1][0] + q[2][0]) / 2) + ' ' + ((q[1][1] + q[2][1]) / 2) + '" stroke="#fff" stroke-width="7"/>';
    // the windowsill, with a seasonal touch
    var sill = quadOnWall(false, .14, .82, .6, .64);
    h += '<polygon points="' + pts(sill) + '" fill="#f2d6a2" stroke="#c9a77d" stroke-width="2"/>';
    var sx = (sill[0][0] + sill[1][0]) / 2, sy = (sill[0][1] + sill[1][1]) / 2;
    if (SEASON === 'autumn') h += '<g id="seasonProp" class="pumpkin"><ellipse cx="' + sx + '" cy="' + (sy - 6) + '" rx="22" ry="16" fill="#ff8a2a" stroke="#c45f10" stroke-width="2.5"/><path d="M' + sx + ' ' + (sy - 22) + ' v-8" stroke="#43b98a" stroke-width="5" stroke-linecap="round"/><path d="M' + (sx - 8) + ' ' + (sy - 20) + ' Q' + (sx - 12) + ' ' + (sy - 6) + ' ' + (sx - 8) + ' ' + (sy + 8) + ' M' + (sx + 8) + ' ' + (sy - 20) + ' Q' + (sx + 12) + ' ' + (sy - 6) + ' ' + (sx + 8) + ' ' + (sy + 8) + '" stroke="#c45f10" stroke-width="2" fill="none"/></g>';
    if (SEASON === 'winter') h += '<g id="seasonProp" class="snowblob"><circle cx="' + sx + '" cy="' + (sy - 12) + '" r="12" fill="#fff" stroke="#bcd" stroke-width="2"/><circle cx="' + sx + '" cy="' + (sy - 30) + '" r="8" fill="#fff" stroke="#bcd" stroke-width="2"/><path d="M' + (sx - 2) + ' ' + (sy - 30) + ' l8 2 l-8 2z" fill="#ff8a2a"/></g>';
    if (SEASON === 'spring') h += '<g id="seasonProp" class="tulips"><rect x="' + (sx - 14) + '" y="' + (sy - 18) + '" width="28" height="18" rx="4" fill="#9fd2ff" stroke="#5d9fe0" stroke-width="2"/><circle cx="' + (sx - 7) + '" cy="' + (sy - 26) + '" r="6" fill="#ff8fb1"/><circle cx="' + (sx + 7) + '" cy="' + (sy - 28) + '" r="6" fill="#ffd23c"/></g>';
    if (SEASON === 'summer') h += '<g id="seasonProp" class="shell"><path d="M' + (sx - 16) + ' ' + sy + ' Q' + sx + ' ' + (sy - 34) + ' ' + (sx + 16) + ' ' + sy + 'Z" fill="#ffc3d6" stroke="#f47aa6" stroke-width="2"/></g>';
    return h + '</g>';
  }
  function shelfSvg() { // the trophy shelf on the left wall (tap it to open the trophy shelf)
    var q = quadOnWall(true, .2, .75, .5, .535), t = trophies().filter(function (x) { return x.got; }).slice(0, 3), h = '<g id="wallShelf" class="tapme"><polygon points="' + pts(q) + '" fill="#c98b5e" stroke="#8a5a36" stroke-width="2"/>';
    t.forEach(function (x, i) { var u = .3 + i * .17, b = sideWall(true, u, .5); h += '<g transform="translate(' + b[0].toFixed(1) + ' ' + b[1].toFixed(1) + ') scale(' + (1 - u * .1).toFixed(2) + ')">' + cupSvg(x.col, true) + '</g>'; });
    if (!t.length) { var b0 = sideWall(true, .47, .5); h += '<text x="' + b0[0] + '" y="' + (b0[1] - 8) + '" font-size="18" text-anchor="middle" fill="#a8743a" font-family="sans-serif" font-weight="700">🏆?</text>'; }
    return h + '</g>';
  }
  function cupSvg(col, small) {
    var c = { gold: ['#ffd23c', '#e5ab1f'], silver: ['#e3e8f2', '#b7c0d4'], bronze: ['#f0b07a', '#c98451'], none: ['#d9d2e6', '#bfb5d4'] }[col] || ['#ffd23c', '#e5ab1f'];
    var g = '<path d="M-14 -46 H14 C14 -26 8 -16 0 -16 C-8 -16 -14 -26 -14 -46 Z" fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="2.5"/><path d="M-14 -42 C-24 -42 -22 -28 -12 -28 M14 -42 C24 -42 22 -28 12 -28" fill="none" stroke="' + c[1] + '" stroke-width="2.5"/>' +
      '<rect x="-3" y="-16" width="6" height="8" fill="' + c[1] + '"/><rect x="-12" y="-8" width="24" height="8" rx="2" fill="' + c[1] + '"/>';
    return small ? g : '<svg viewBox="-30 -56 60 60" aria-hidden="true">' + g + '</svg>';
  }
  function drawRoom() {
    var svg = $('#roomSvg'), h = '<defs>' + wallPattern(RM.wall, 'wpat') + '<linearGradient id="shadeL" x1="0" x2="1"><stop offset="0" stop-color="#3b2d55" stop-opacity=".18"/><stop offset="1" stop-color="#3b2d55" stop-opacity=".06"/></linearGradient>' +
      '<linearGradient id="shadeR" x1="1" x2="0"><stop offset="0" stop-color="#3b2d55" stop-opacity=".18"/><stop offset="1" stop-color="#3b2d55" stop-opacity=".06"/></linearGradient>' +
      '<radialGradient id="warm" cx="50%" cy="45%" r="70%"><stop offset=".55" stop-color="#ffcf8a" stop-opacity="0"/><stop offset="1" stop-color="#ff9f5a" stop-opacity=".22"/></radialGradient></defs>';
    h += '<image href="' + BG + '" x="0" y="0" width="' + VW + '" height="' + VH + '" preserveAspectRatio="none"/>';
    if (MONTH === 12) { h += '<path id="garland" d="M' + (BX0 + 10) + ' ' + (BY0 + 4) + ' Q' + ((BX0 + BX1) / 2) + ' ' + (BY0 + 50) + ' ' + (BX1 - 10) + ' ' + (BY0 + 4) + '" stroke="#43b98a" stroke-width="10" fill="none" stroke-linecap="round"/>'; for (var g = 0; g < 9; g++) { var t = (g + .5) / 9, gx = lerp(BX0 + 10, BX1 - 10, t), gy = BY0 + 4 + 4 * 46 * t * (1 - t); h += '<circle cx="' + gx.toFixed(0) + '" cy="' + gy.toFixed(0) + '" r="6" fill="' + ['#ff5a6e', '#ffd23c', '#5aa9f0'][g % 3] + '"/>'; } }
    h += shelfSvg();
    // decorate grid (hidden unless decorating)
    h += '<g id="grid">';
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) h += '<polygon class="cell" data-c="' + c + '" data-r="' + r + '" points="' + pts(cellPoly(c, r)) + '"/>';
    for (var s = 0; s < SLOTS; s++) { var sr = slotRect(s); h += '<rect class="slot" data-s="' + s + '" x="' + sr.x + '" y="' + sr.y + '" width="' + sr.w + '" height="' + sr.h + '" rx="14"/>'; }
    h += '<polygon id="cur" points="0,0"/></g><rect width="' + VW + '" height="' + VH + '" fill="url(#warm)" pointer-events="none"/>';
    svg.innerHTML = h;
    $('#wallShelf').addEventListener('click', function (e) { if (D.on) return; e.stopPropagation(); openShelf('trophies'); });
    document.body.classList.toggle('night', TOD === 'night'); document.body.classList.toggle('dusk', TOD === 'dusk');
    $('#season').className = SEASON; $('#season').innerHTML = SEASON === 'winter' ? '<i></i><i></i><i></i><i></i><i></i><i></i>' : SEASON === 'autumn' ? '<i></i><i></i><i></i><i></i>' : SEASON === 'spring' ? '<i></i><i></i><i></i>' : '<i class="bfly">🦋</i>';
  }

  /* ================= things in the room ================= */
  function thingHTML(x, ghost) {
    var it = CAT.byId[x.id], kind = it.kind, pos, sc, w, z, cls = 'thing k-' + kind + (ghost ? ' ghost' : '') + (x.f ? ' flip' : '') + (!ghost && x === SEL ? ' sel' : '');
    if (kind === 'wall') { pos = slotXY(x.s); sc = 1; w = it.w * 1.35; z = 5; }
    else { pos = cellXY(x.c, x.r); sc = scaleAt(pos.y); w = it.w * sc * (kind === 'rug' ? 1.25 : 1.45); z = kind === 'rug' ? 2 : Math.round(pos.y) + 8; if (kind === 'floor') pos.y += 14 * sc; }
    return '<div class="' + cls + '" data-u="' + (x.u || '') + '" data-id="' + x.id + '" style="' + pct(pos.x, pos.y) + 'width:' + (w / VW * 100).toFixed(3) + '%;z-index:' + (ghost ? 700 : z) + '">' + ART.svg(x.id) + '</div>';
  }
  function renderThings() {
    var h = RM.items.map(function (x) { return thingHTML(x); }).join('');
    if (D.on && D.hold) { var g = D.hold, gx = { id: g.id, f: g.f }; if (CAT.byId[g.id].kind === 'wall') { if (D.cur.k === 'wall') { gx.s = D.cur.s; h += thingHTML(gx, true); } } else if (D.cur.k === 'floor') { gx.c = D.cur.c; gx.r = D.cur.r; h += thingHTML(gx, true); } }
    $('#things').innerHTML = h;
    renderGlows(); placeSelBar();
  }
  function renderGlows() {
    var g = '';
    if (TOD !== 'day') RM.items.forEach(function (x) {
      var it = CAT.byId[x.id]; if (!it.light) return;
      var pos = it.kind === 'wall' ? slotXY(x.s) : cellXY(x.c, x.r), sc = it.kind === 'wall' ? 1 : scaleAt(pos.y), y = it.kind === 'wall' ? pos.y : pos.y - 110 * sc;
      g += '<i style="' + pct(pos.x, y) + 'width:' + (34 * sc).toFixed(1) + '%;--lc:' + it.light + '"></i>';
    });
    $('#glows').innerHTML = g;
  }

  /* ================= blob friends ================= */
  var SPEED = 1, FR = [];
  function friendSvg(b, expr) { return b === P.blob ? B.forProfile(P, { expr: expr }) : B.svg({ blob: b, expr: expr }); }
  function setExpr(f, expr) { var s = f.el.querySelector('svg.blob'); if (s) s.setAttribute('class', 'blob food x-' + expr + ' blob-' + f.b); f.expr = expr; }
  function freeCells() { var out = []; for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) if (!at(c, r)) out.push({ c: c, r: r }); return out; }
  function makeFriends() {
    $('#friendsL').innerHTML = ''; FR = [];
    var cells = A.shuffle ? A.shuffle(freeCells()) : freeCells().sort(function () { return Math.random() - .5; });
    F.of(P).forEach(function (b, i) {
      var cell = cells[i % Math.max(1, cells.length)] || { c: i % COLS, r: 2 }, p0 = cellXY(cell.c, cell.r);
      var el = A.el('<div class="friend" data-nav role="button" tabindex="0" data-b="' + b + '" aria-label="' + B.byId[b].name + '">' + (b === P.blob ? '<span class="myspot" style="' + B.backdrop(P.color) + '"></span>' : '') + '<div class="fb">' + friendSvg(b, 'idle') + '</div><span class="bub"></span><span class="zz">z<b>z</b><i>z</i></span></div>');
      var f = { b: b, el: el, x: p0.x + (Math.random() * 30 - 15), y: p0.y, tx: 0, ty: 0, st: 'idle', until: Date.now() + 600 + Math.random() * 2400, dir: 1, seat: null, expr: 'idle', bio: F.BIO[b] || { speed: 1, napP: .1, likes: [] } };
      el.addEventListener('click', function (e) { e.stopPropagation(); if (D.on || Date.now() < gestureUntil) return; tapFriend(f, e); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) tapFriend(f, null); } });
      $('#friendsL').appendChild(el); FR.push(f); placeFriend(f);
    });
  }
  function placeFriend(f) {
    var sc = scaleAt(Math.max(BY1, f.y)), lift = f.st === 'sit' || f.st === 'nap' ? (f.seatDy || 0) : 0;
    f.el.style.cssText = pct(f.x, f.y - lift) + 'width:' + (104 * sc / VW * 100).toFixed(3) + '%;z-index:' + (Math.round(f.y) + 12);
    f.el.classList.toggle('left', f.dir < 0);
  }
  function pickTarget(f) {
    // 45%: go and hang out at something they like (sit on it if it's a seat); otherwise wander to a random spot
    var liked = RM.items.filter(function (x) { return (f.bio.likes || []).indexOf(x.id) >= 0 && CAT.byId[x.id].kind !== 'wall'; });
    var t = null, seat = null;
    if (liked.length && Math.random() < .45) {
      var x = A.pick(liked), it = CAT.byId[x.id];
      if (it.seat && !FR.some(function (o) { return o !== f && o.seat === x.u; })) { seat = x; t = cellXY(x.c, x.r); t.y += 14 * scaleAt(t.y) - 2; }
      else { var nb = [[x.c - 1, x.r], [x.c + 1, x.r], [x.c, x.r + 1], [x.c, x.r - 1]].filter(function (q) { return q[0] >= 0 && q[0] < COLS && q[1] >= 0 && q[1] < ROWS && !at(q[0], q[1]); }); if (nb.length) { var q = A.pick(nb); t = cellXY(q[0], q[1]); } }
    }
    if (!t) { var fc = freeCells(), cc = fc.length ? A.pick(fc) : { c: A.rnd(0, COLS - 1), r: A.rnd(0, ROWS - 1) }; t = cellXY(cc.c, cc.r); t.x += Math.random() * 40 - 20; }
    f.tx = t.x; f.ty = t.y; f.seatTo = seat; f.st = 'walk'; f.seat = null; f.seatDy = 0; f.el.classList.add('walk'); f.el.classList.remove('sitting', 'napping');
    if (f.expr !== 'idle') setExpr(f, 'idle');
  }
  function arrive(f) {
    f.el.classList.remove('walk');
    var now = Date.now();
    if (f.seatTo) { var it = CAT.byId[f.seatTo.id]; f.seat = f.seatTo.u; f.seatDy = (it.seat || 30) * scaleAt(f.y) * .9; f.st = 'sit'; f.el.classList.add('sitting'); }
    else f.st = 'idle';
    if (Math.random() < (f.bio.napP != null ? f.bio.napP : .1) * (f.seat ? 1.8 : 1) * (TOD === 'night' ? 2 : 1)) { f.st = 'nap'; f.el.classList.add('napping'); setExpr(f, 'sleepy'); f.until = now + (8000 + Math.random() * 7000) / SPEED; }
    else { f.until = now + (1800 + Math.random() * 3800) / SPEED; if (Math.random() < .3) setExpr(f, 'happy'); }
    placeFriend(f);
  }
  var lastT = 0;
  function step(t) {
    var dt = Math.min(.1, (t - (lastT || t)) / 1000); lastT = t;
    var now = Date.now();
    if (!document.hidden) FR.forEach(function (f) {
      if (f.st === 'walk') {
        var dx = f.tx - f.x, dy = f.ty - f.y, d = Math.sqrt(dx * dx + dy * dy), sp = 95 * (f.bio.speed || 1) * scaleAt(f.y) * SPEED * dt;
        if (Math.abs(dx) > 2) f.dir = dx < 0 ? -1 : 1;
        if (d <= sp) { f.x = f.tx; f.y = f.ty; arrive(f); } else { f.x += dx / d * sp; f.y += dy / d * sp; placeFriend(f); }
      } else if (now > f.until && !D.on) { if (f.st === 'react') { f.st = 'idle'; f.until = now + 800; setExpr(f, 'idle'); f.el.querySelector('.bub').classList.remove('on'); } else pickTarget(f); }
    });
    requestAnimationFrame(step);
  }
  var tapN = {};
  function tapFriend(f, e) {
    var b = f.b, napping = f.st === 'nap', inf = F.info(P, b), res = F.tap(P, b), bio = f.bio;
    tapN[b] = ((tapN[b] || 0) % 3) + 1;
    var line = napping ? 'fr_' + b + '_nap' : 'fr_' + b + '_tap' + tapN[b], text = napping ? bio.napLine : bio.taps[tapN[b] - 1];
    f.el.classList.remove('walk', 'napping'); B.anim(f.el, napping ? 'wobble' : 'jump', 600);
    if (!napping) { f.st = 'react'; f.until = Date.now() + 2600; setExpr(f, inf.face || 'happy'); }
    else f.until = Date.now() + 2400;
    var bub = f.el.querySelector('.bub'); bub.textContent = text; bub.classList.add('on'); clearTimeout(f.bubT); f.bubT = setTimeout(function () { bub.classList.remove('on'); }, 2600);
    var r = f.el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height * .2;
    hearts(x, y, res.pts ? 5 : 2); if (res.pts) UI.plusText(x, y - 20, '+1 💗');
    A.Audio.sfx(napping ? 'soft' : 'pop');
    V.say(napping ? [line, 'rm_shh'] : [line]);
    save(); renderFriendCount();
    if (res.lvl) setTimeout(showNews, 1500);
    return res;
  }
  function hearts(x, y, n) { for (var i = 0; i < n; i++) { var h = document.createElement('div'); h.className = 'heart'; h.textContent = '💗'; h.style.left = (x + Math.random() * 60 - 30) + 'px'; h.style.top = y + 'px'; h.style.animationDelay = (i * .08) + 's'; document.body.appendChild(h); setTimeout(function (el) { el.remove(); }.bind(null, h), 1500); } }

  /* friendship news: level-ups (from games, visits, taps) are celebrated here */
  var newsBusy = false;
  function showNews() {
    if (newsBusy || UI.cardOpen) return Promise.resolve();
    var news = F.takeNews(P); if (!news.length) return Promise.resolve();
    newsBusy = true; save();
    var chain = Promise.resolve();
    news.forEach(function (n) {
      chain = chain.then(function () {
        var b = n.blob, nm = B.byId[b].name, bio = F.BIO[b], extra = '', voice = ['fr_lvl' + n.lvl, 'rm_friend_up'];
        if (n.lvl === 2) { extra = 'Now you know what ' + nm + ' likes! Look in ' + nm + "'s bio."; voice.push('fr_unlock_likes'); }
        if (n.lvl === 3) { extra = nm + ' learned a new face!'; voice.push('fr_unlock_face'); }
        if (n.lvl === 4) { extra = 'Now you know all about ' + nm + '!'; voice.push('fr_unlock_more'); }
        if (n.lvl === 5) { extra = nm + ' made you a present: ' + CAT.byId[bio.fav].name + '! It\'s in your things.'; voice.push('fr_unlock_gift'); if (!RM.gifts[b]) { RM.gifts[b] = Date.now(); own(bio.fav); save(); } }
        var face = n.lvl >= 3 ? bio.face : 'love';
        return UI.card({ tag: F.NAMES[n.lvl - 1] + '!', title: nm + ' is now your ' + F.NAMES[n.lvl - 1] + '!', art: '<div class="dance">' + friendSvg(b, face) + '</div>' + (n.lvl === 5 ? '<div class="giftart">' + ART.svg(bio.fav) + '</div>' : ''), glow: true,
          html: '<div class="hearts big">' + heartsHTML(n.lvl) + '</div>', sub: extra, voice: voice, sfx: 'unlock', confetti: true, btn: 'Yay!', cls: 'reward friendup' });
      });
    });
    return chain.then(function () { newsBusy = false; renderTray(); });
  }
  function heartsHTML(l) { var h = ''; for (var i = 1; i <= 5; i++) h += '<i class="' + (i <= l ? 'on' : '') + '">' + (i <= l ? '💗' : '🤍') + '</i>'; return h; }
  function renderFriendCount() { $('#rSub').textContent = F.of(P).length + ' food friends picnic here'; }

  /* ================= special prizes (achievements) ================= */
  function checkPrizes() {
    var won = CAT.ITEMS.filter(function (it) { return it.need && !RM.prizes[it.id] && CAT.earned(P, it); });
    won.forEach(function (it) { RM.prizes[it.id] = Date.now(); own(it.id); });
    if (won.length) save();
    return won;
  }

  /* ================= trophies ================= */
  function trophies() {
    var g = P.games, st = P.story || {}, bb = g.baseball || {}, mu = g.munch || {}, maxF = F.of(P).reduce(function (m, b) { return Math.max(m, F.info(P, b).lvl); }, 0);
    return [
      { id: 'story', name: 'Story champion', got: (st.finished || 0) >= 1, col: 'gold', hint: 'Finish Story mode in ' + A.TITLES.munch, val: st.finished > 1 ? '×' + st.finished : '' },
      { id: 'munchbest', name: 'Munch high score', got: (st.bestRun || 0) > 0, col: 'silver', hint: 'Play a Story run in ' + A.TITLES.munch, val: st.bestRun ? String(st.bestRun) : '' },
      { id: 'perfect', name: 'Perfect round', got: (mu.perfect || 0) >= 1, col: 'bronze', hint: 'A Munch round with no oopsies', val: mu.perfect ? '×' + mu.perfect : '' },
      { id: 'grumbly', name: 'Grumbly buster', got: (mu.grumblyWins || 0) >= 1, col: 'silver', hint: 'Beat Grumbly in ' + A.TITLES.munch, val: '' },
      { id: 'bbbest', name: 'Baseball best', got: (bb.best || 0) > 0, col: 'gold', hint: 'Score a run in ' + A.TITLES.baseball, val: bb.best ? bb.best + ' runs' : '' },
      { id: 'homer', name: 'Home run hero', got: (bb.homers || 0) >= 1, col: 'bronze', hint: 'Hit a home run in ' + A.TITLES.baseball, val: bb.homers ? '×' + bb.homers : '' },
      { id: 'bb2', name: '2-player win', got: (bb.twoWins || 0) + (mu.raceWins || 0) >= 1, col: 'silver', hint: 'Win a 2-player game', val: '' },
      { id: 'forever', name: 'Forever friend', got: maxF >= 5, col: 'gold', hint: 'Grow a friendship to level 5', val: '' }
    ];
  }

  /* ================= panels (shop, trophy shelf) ================= */
  var panel = null;
  function openPanel(id, html, onClose) {
    closePanel(true);
    panel = A.el('<div class="rpanel on" id="' + id + '" role="dialog" aria-modal="true"><div class="pbox">' + html + '</div></div>');
    panel._close = onClose; document.body.appendChild(panel);
    panel.querySelector('[data-x]').addEventListener('click', function () { closePanel(); });
    panel.addEventListener('click', function (e) { if (e.target === panel) closePanel(); });
    return panel;
  }
  function closePanel(quiet) {
    if (!panel) return; var p = panel; panel = null; p.remove(); if (!quiet) { A.Audio.sfx('tap'); if (p._close) p._close(); var f = $('#mainBar .rbtn'); if (f && !D.on) f.focus({ preventScroll: true }); }
  }
  function focusFirst(sel) { setTimeout(function () { var f = panel && panel.querySelector(sel || '[data-nav]'); if (f) f.focus({ preventScroll: true }); }, 30); }

  /* ---------- SHOP ---------- */
  var shopCat = 'cozy';
  function openShop(cat) {
    shopCat = cat || shopCat;
    var cats = CAT.CATS.filter(function (c) { return c.id !== 'paper' && CAT.ITEMS.some(function (it) { return it.cat === c.id && inShop(it); }); });
    if (!cats.some(function (c) { return c.id === shopCat; })) shopCat = cats.length ? cats[0].id : shopCat;
    var tabs = cats.map(function (c) { return '<button class="ptab' + (c.id === shopCat ? ' on' : '') + '" data-nav data-cat="' + c.id + '">' + c.icon + ' ' + c.name + '</button>'; }).join('');
    var items = CAT.ITEMS.filter(function (it) { return it.cat === shopCat && inShop(it); }), NEW = RM.shopNew || {};
    var grid = items.map(function (it) {
      var n = (P.inventory[it.id] || {}).n || 0, afford = P.wallet.bits >= it.price, isNew = !!NEW[it.id];
      var tag = it.need && !it.badge ? '<span class="pr won">✓ Won!</span>' : '<span class="pr' + (afford ? '' : ' no') + '">' + (it.badge ? '🏅 ' : '') + '✦ ' + it.price + '</span>';
      return '<button class="sitem' + (!(it.need && !it.badge) && afford ? ' can' : '') + (it.tier ? ' t-' + it.tier : '') + (n ? ' owned' : '') + (isNew ? ' isnew' : '') + '" data-nav data-id="' + it.id + '" aria-label="' + (isNew ? 'New! ' : '') + A.esc(it.name) + (it.need && !it.badge ? ', won' : ', ' + it.price + ' star bits') + (n ? ', you have ' + n : '') + '">' +
        '<span class="sa">' + ART.svg(it.id, 'thumb') + '</span><span class="sn">' + A.esc(it.name) + '</span>' + tag + (n ? '<span class="have">×' + n + '</span>' : '') + (RM.goal === it.id ? '<span class="goalb">🫙</span>' : '') + (isNew ? '<span class="newtag">✨ New</span>' : '') + '</button>';
    }).join('');
    var pn = openPanel('shop', '<div class="phead"><h2>🛍️ Shop</h2><div class="bits small"><span class="bi">✦</span><b>' + P.wallet.bits + '</b><small>star bits</small></div><button class="iconbtn px" data-x aria-label="Close shop (Esc)">✕</button></div>' +
      '<div class="ptabs">' + tabs + '</div><div class="sgrid scroll">' + grid + '</div><p class="phint">Tap a thing to buy it · Play games to earn more ✦ (1 for every star!)</p>');
    A.$$('.ptab', pn).forEach(function (b) { b.addEventListener('click', function () { A.Audio.sfx('tap'); openShop(b.dataset.cat); focusFirst('.ptab.on'); }); });
    A.$$('.sitem', pn).forEach(function (b) { b.addEventListener('click', function () { shopItem(CAT.byId[b.dataset.id]); }); });
    // a "New" tag shows until the kid has seen that tile once
    var seen = items.filter(function (it) { return NEW[it.id]; }); if (seen.length) { seen.forEach(function (it) { delete NEW[it.id]; }); save(); shopBadge(); }
  }
  function shopBadge() { var nw = RM.shopNew || {}, any = Object.keys(nw).some(function (id) { return inShop(CAT.byId[id] || {}); }); $('#shopBtn').classList.toggle('hasnew', any); }
  // v2p1c: when a kid earns a badge showpiece it appears in the shop with a happy surprise (once), tagged New until seen.
  // Players who already had some earned get them silently on the first run (they could already see them).
  function newInShop() {
    var badgeItems = CAT.ITEMS.filter(function (it) { return it.badge && inShop(it); }), first = !RM.shopKnown;
    RM.shopKnown = RM.shopKnown || {}; RM.shopNew = RM.shopNew || {};
    var fresh = badgeItems.filter(function (it) { return !RM.shopKnown[it.id]; });
    fresh.forEach(function (it) { RM.shopKnown[it.id] = Date.now(); if (!first) RM.shopNew[it.id] = 1; });
    if (fresh.length) save();
    return first ? [] : fresh;
  }
  function shopItem(it) {
    var n = (P.inventory[it.id] || {}).n || 0, art = '<div class="bigthumb">' + ART.svg(it.id, 'thumb') + '</div>';
    A.Audio.sfx('pop'); var tile = panel && panel.querySelector('.sitem[data-id="' + it.id + '"]'); if (tile) B.anim(tile, 'jump', 400);
    V.say(['it_' + it.id], { kind: 'name' });
    if (!shown(it)) return Promise.resolve(false);   // never reached from the shop (not-yet-earned things aren't listed)
    if (it.need && !it.badge) return UI.card({ tag: 'Special prize', title: it.name, art: art, sub: 'You won this! It\'s in your things.', btn: 'OK', voice: ['it_' + it.id, 'rm_owned'], cls: 'shopcard' }).then(function () { focusItem(it.id); });
    var short = it.price - P.wallet.bits;
    if (short > 0) {   // not yet: a friendly "save up" choice (the savings jar), never a plain "no"
      var isGoal = RM.goal === it.id;
      return UI.confirm({ title: it.name, art: art + jarMini(it), sub: 'You have ✦ ' + P.wallet.bits + '. ' + short + ' more to go!', yes: isGoal ? 'OK' : '🫙 Save up for it', no: isGoal ? 'Close' : 'Not now', cls: 'shopcard save',
        voice: ['it_' + it.id, 'rm_it_costs', it.price, 'rm_bits_you_have', P.wallet.bits] }).then(function (yes) {
        if (yes && !isGoal) setGoal(it.id);
        focusItem(it.id);
      });
    }
    return UI.confirm({ title: it.name, art: art, sub: (n ? 'You have ' + n + '. ' : '') + 'It costs ✦ ' + it.price + '. You have ✦ ' + P.wallet.bits + '.', yes: 'Buy it! ✦ ' + it.price, no: 'Not now', cls: 'shopcard', voice: ['it_' + it.id, 'rm_it_costs', it.price, 'rm_bits_you_have', P.wallet.bits] }).then(function (yes) {
      if (!yes) return focusItem(it.id);
      return buy(it);
    });
  }
  function focusItem(id) { setTimeout(function () { var b = panel && panel.querySelector('.sitem[data-id="' + id + '"]'); if (b) b.focus({ preventScroll: true }); }, 40); }
  // buying: one tap on "Buy it!" -> the shop closes and the thing pops straight into the picnic spot, picked, ready to drag
  function buy(it) {
    if (!A.Store.spendBits(P, it.price, it.id)) return Promise.resolve(false);
    $('#bitCount').textContent = P.wallet.bits; B.anim($('#bits'), 'jump', 600);
    if (RM.goal === it.id) RM.goal = null;
    A.Audio.sfx('unlock'); UI.rain(28); save(); renderJar();
    var paper = it.kind === 'paper' || it.kind === 'tiles';
    if (paper) { if (it.kind === 'paper') RM.wall = it.id; else RM.floor = it.id; save(); drawRoom(); V.say([it.kind === 'paper' ? 'rm_new_wall' : 'rm_new_floor']); return Promise.resolve(true); }
    closePanel(true);
    var x = popIn(it.id, true);
    UI.toast('🎉 ' + it.name + ' is yours!');
    V.say(x ? ['rm_bought', 'rm_drag'] : ['rm_bought']);
    return Promise.resolve(true);
  }

  /* ---------- TROPHY SHELF (trophies · stickers · friends) ---------- */
  var shelfTab = 'trophies';
  function openShelf(tab) {
    shelfTab = tab || shelfTab;
    var tabs = [['trophies', '🏆 Trophies'], ['stickers', '⭐ Stickers'], ['friends', '💗 Picnic friends']].map(function (t) { return '<button class="ptab' + (t[0] === shelfTab ? ' on' : '') + '" data-nav data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join(''), body = '';
    // design1 (2026-10-22): the shelf shows only what was earned / met (no "???", hints or totals for what is still ahead)
    var MORE = '<p class="pcount more">Keep playing to find more!</p>';
    if (shelfTab === 'trophies') body = '<div class="trgrid">' + trophies().filter(function (t) { return t.got; }).map(function (t) {
      return '<div class="trophy' + (t.got ? ' got' : '') + '" data-nav tabindex="0" data-tr="' + t.id + '" aria-label="' + A.esc(t.name) + (t.got ? '' : ', not yet: ' + A.esc(t.hint)) + '"><span class="cup">' + cupSvg(t.got ? t.col : 'none') + '</span><b>' + (t.got ? A.esc(t.name) : '???') + '</b><small>' + (t.got ? A.esc(t.val || '🎉') : A.esc(t.hint)) + '</small></div>';
    }).join('') + '</div>' + MORE;
    if (shelfTab === 'stickers') { var got = Object.keys(P.stickers || {}).length; body = '<p class="pcount">' + got + ' sticker' + (got === 1 ? '' : 's') + '</p><div class="stgrid">' + R.STICKERS.filter(function (s) { return !!P.stickers[s.id]; }).map(function (s) { var g = !!P.stickers[s.id]; return '<div class="stk' + (g ? ' got' : '') + '" data-nav tabindex="0" aria-label="' + (g ? A.esc(s.name) : 'Not yet: ' + A.esc(s.hint)) + '">' + (g ? R.stickerSVG(s.art) : '<span class="q">?</span>') + '<small>' + (g ? A.esc(s.name) : A.esc(s.hint)) + '</small></div>'; }).join('') + '</div>' + MORE; }
    if (shelfTab === 'friends') body = '<div class="frgrid">' + B.CAST.filter(function (c) { return F.of(P).indexOf(c.id) >= 0; }).map(function (c) {
      var has = F.of(P).indexOf(c.id) >= 0, inf = has ? F.info(P, c.id) : null;
      return '<button class="fcard' + (has ? '' : ' locked') + (inf && inf.lvl >= 5 ? ' gold' : '') + '" data-nav data-b="' + c.id + '" aria-label="' + (has ? c.name + ', ' + inf.name : 'Secret friend') + '"><span class="fa">' + (has ? friendSvg(c.id, 'happy') : B.svg({ blob: c.id })) + '</span><b>' + (has ? c.name : '???') + '</b>' +
        (has ? '<span class="hearts">' + heartsHTML(inf.lvl) + '</span><small>' + inf.name + '</small>' : '<small>🔒 Secret friend</small>') + '</button>';
    }).join('') + '</div>' + MORE;
    var pn = openPanel('shelf', '<div class="phead"><h2>🏆 Trophy shelf</h2><button class="iconbtn px" data-x aria-label="Close (Esc)">✕</button></div><div class="ptabs">' + tabs + '</div><div class="pbody scroll">' + body + '</div>');
    A.$$('.ptab', pn).forEach(function (b) { b.addEventListener('click', function () { A.Audio.sfx('tap'); openShelf(b.dataset.tab); focusFirst('.ptab.on'); }); });
    A.$$('.fcard', pn).forEach(function (b) { b.addEventListener('click', function () { var id = b.dataset.b; if (b.classList.contains('locked')) { A.Audio.sfx('locked'); B.anim(b, 'nudge', 500); V.say(['rm_locked_friend']); UI.toast('🔒 ' + (A.Story && A.Story.chHint ? A.Story.chHint(P, id) : 'Win a Story challenge')); return; } openBio(id).then(function () { openShelf('friends'); var f = panel && panel.querySelector('.fcard[data-b="' + id + '"]'); if (f) f.focus({ preventScroll: true }); }); }); });
    A.$$('.trophy', pn).forEach(function (t) { t.addEventListener('click', function () { B.anim(t, 'jump', 500); A.Audio.sfx(t.classList.contains('got') ? 'star' : 'locked'); }); t.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); t.click(); } }); });
  }
  function openBio(b) {
    var c = B.byId[b], bio = F.BIO[b], inf = F.info(P, b), nm = c.name;
    function row(icon, ok, text, lockLvl) { return '<li class="' + (ok ? '' : 'lk') + '"><span>' + icon + '</span>' + (ok ? A.esc(text) : '🔒 Become ' + F.NAMES[lockLvl - 1] + 's to find out') + '</li>'; }
    var prog = inf.next ? '<div class="fprog"><i style="width:' + Math.round(100 * (inf.pts - inf.prev) / (inf.next - inf.prev)) + '%"></i></div><small class="fnext">' + (inf.next - inf.pts) + ' more friendship points to ' + F.NAMES[inf.lvl] + ' (' + inf.nextUnlock + ')</small>' : '<small class="fnext">The very best of friends! 🌟</small>';
    var html = '<div class="hearts big">' + heartsHTML(inf.lvl) + '</div>' + prog + '<ul class="bio">' + '<li><span>👋</span>' + A.esc(bio.hi) + '</li>' + row('💗', inf.likes, bio.lk, 2) +
      '<li class="' + (inf.face ? '' : 'lk') + '"><span>😊</span>' + (inf.face ? 'New face! <span class="miniface">' + friendSvg(b, inf.face) + '</span>' : '🔒 Become Good friends to see a new face') + '</li>' +
      row('🙈', inf.dislikes, bio.dl, 4) + row('🍽️', inf.food, bio.food, 4) +
      '<li class="' + (inf.gift ? '' : 'lk') + '"><span>🎁</span>' + (inf.gift ? 'Favorite thing: ' + A.esc(CAT.byId[bio.fav].name) + ' (a present for your room!) <span class="minithumb">' + ART.svg(bio.fav, 'thumb') + '</span>' : '🔒 Become Forever friends for a present') + '</li></ul>' +
      '<p class="fhow">Play as ' + nm + ', visit your room, and tap ' + nm + ' to grow your friendship!</p>';
    A.Audio.sfx('pop');
    return UI.card({ tag: inf.name, title: nm, art: '<div class="dance">' + friendSvg(b, inf.face || 'happy') + '</div>', html: html, btn: 'Bye, ' + nm + '!', voice: F.bioParts(P, b), cls: 'biocard' + (inf.gift ? ' gold' : '') });
  }

  /* ================= DECORATE ================= */
  var D = { on: false, hold: null, cur: { k: 'floor', c: 3, r: 2 }, undo: [] }, gestureUntil = 0;
  function snap() { return JSON.stringify({ items: RM.items, wall: RM.wall, floor: RM.floor, n: RM.n }); }
  function pushUndo() { D.undo.push(snap()); if (D.undo.length > 40) D.undo.shift(); }
  function startDecor(holdId) {
    D.on = true; D.hold = null; D.undo = []; document.body.classList.add('decor');
    FR.forEach(function (f) { f.el.classList.remove('walk'); });
    renderTray(); V.say([holdId ? 'rm_pick_spot' : 'rm_things']);
    if (holdId) pickFromTray(holdId); else { renderThings(); drawCursor(); }
    setTimeout(function () { var t = A.$('#tray .chip'); if (!holdId && t) t.focus({ preventScroll: true }); else $('#roomBox').focus({ preventScroll: true }); }, 40);
    padKeys();
  }
  function endDecor() {
    if (D.hold) cancelHold(); deselect();
    D.on = false; document.body.classList.remove('decor'); renderThings(); save(); padKeys();
    setTimeout(function () { $('#decoBtn').focus({ preventScroll: true }); }, 30); V.say(['rm_placed']);
  }
  function renderTray() {
    if (!D.on) return;
    var ids = Object.keys(P.inventory).filter(function (id) { return CAT.byId[id]; });
    var things = ids.filter(function (id) { var k = CAT.byId[id].kind; return (k === 'floor' || k === 'rug' || k === 'wall') && avail(id) > 0 && friendOk(id); });
    var styles = []; // wallpapers/floors don't apply to the painted picnic scene (still kept in saves)
    var h = things.map(function (id) { return '<button class="chip' + (D.hold && D.hold.id === id && !D.hold.from ? ' on' : '') + '" data-nav data-id="' + id + '" role="option" aria-label="' + A.esc(CAT.byId[id].name) + ', ' + avail(id) + ' to place">' + ART.svg(id, 'thumb') + '<span class="cn">' + A.esc(CAT.byId[id].name) + '</span>' + (avail(id) > 1 ? '<b class="cx">×' + avail(id) + '</b>' : '') + '</button>'; }).join('');
    if (!things.length) h += '<span class="empty">All your things are out! 🛍️ Shop for more.</span>';
    h += styles.map(function (id) { var it = CAT.byId[id], cur = RM.wall === id || RM.floor === id; return '<button class="chip style' + (cur ? ' cur' : '') + '" data-nav data-id="' + id + '" aria-label="' + A.esc(it.name) + (cur ? ', in use' : '') + '">' + ART.swatch(id) + '<span class="cn">' + A.esc(it.name) + '</span></button>'; }).join('');
    $('#tray').innerHTML = h;
    A.$$('#tray .chip').forEach(function (b) { b.addEventListener('click', function (e) { var it = CAT.byId[b.dataset.id]; if (it.kind === 'paper' || it.kind === 'tiles') applyStyle(it);
      else if (e.detail === 0) { pickFromTray(it.id); $('#roomBox').focus({ preventScroll: true }); }
      else { B.anim(b, 'jump', 300); popIn(it.id); } }); });
  }
  function applyStyle(it) {
    var key = it.kind === 'paper' ? 'wall' : 'floor'; if (RM[key] === it.id) return;
    pushUndo(); RM[key] = it.id; drawRoom(); renderThings(); drawCursor(); renderTray(); save(); A.Audio.sfx('sparkle'); V.say([key === 'wall' ? 'rm_new_wall' : 'rm_new_floor']);
  }
  function firstFree(kind) {
    if (kind === 'wall') { for (var s = 0; s < SLOTS; s++) if (!atSlot(s)) return { k: 'wall', s: s }; return { k: 'wall', s: 0 }; }
    var rug = kind === 'rug', order = [[3, 2], [2, 2], [4, 2], [3, 1], [2, 1], [4, 1], [1, 2], [5, 2], [3, 3], [1, 1], [5, 1], [0, 2], [6, 2], [2, 3], [4, 3], [1, 0], [3, 0], [5, 0], [0, 0], [6, 0], [0, 1], [6, 1], [0, 3], [6, 3], [1, 3], [5, 3], [2, 0], [4, 0]];
    for (var i = 0; i < order.length; i++) if (!at(order[i][0], order[i][1], rug)) return { k: 'floor', c: order[i][0], r: order[i][1] };
    return { k: 'floor', c: 3, r: 2 };
  }
  function pickFromTray(id) {
    if (avail(id) <= 0) return;
    if (D.hold) cancelHold(true);
    var it = CAT.byId[id]; D.hold = { id: id, f: 0, from: null }; D.cur = firstFree(it.kind);
    A.Audio.sfx('pop'); renderTray(); renderThings(); drawCursor(); V.say(['it_' + id], { kind: 'name' });
  }
  function pickUp(x) {
    pushUndo(); RM.items = RM.items.filter(function (y) { return y !== x; });
    D.hold = { id: x.id, f: x.f || 0, from: x }; A.Audio.sfx('pop'); renderTray(); renderThings(); drawCursor();
  }
  function cancelHold(quiet) { // put a moved thing back where it was (or just stop holding a new one)
    if (!D.hold) return; var h = D.hold; D.hold = null;
    if (h.from) { RM.items.push(h.from); D.undo.pop(); }
    if (!quiet) { renderTray(); renderThings(); drawCursor(); }
  }
  function curTarget() { // what's under the cursor (floor thing first, then rug), or the wall thing
    if (D.cur.k === 'wall') return atSlot(D.cur.s);
    return at(D.cur.c, D.cur.r) || at(D.cur.c, D.cur.r, true);
  }
  function canPlace() {
    if (!D.hold) return false; var k = CAT.byId[D.hold.id].kind;
    if (k === 'wall') return D.cur.k === 'wall' && !atSlot(D.cur.s);
    return D.cur.k === 'floor' && !at(D.cur.c, D.cur.r, k === 'rug');
  }
  function act() { // Space / A / tap on the room
    if (!D.on) return;
    if (D.hold) {
      if (!canPlace()) { A.Audio.sfx('locked'); B.anim($('#roomBox'), 'nudge', 400); V.say(['rm_spot_taken']); return false; }
      var h = D.hold, k = CAT.byId[h.id].kind, x = { u: h.from ? h.from.u : ++RM.n, id: h.id, f: h.f };
      if (!h.from) pushUndo();
      if (k === 'wall') x.s = D.cur.s; else { x.c = D.cur.c; x.r = D.cur.r; }
      RM.items.push(x); D.hold = null; save(); A.Audio.sfx('star'); renderTray(); renderThings(); drawCursor();
      var el = A.$('#things .thing[data-u="' + x.u + '"]'); if (el) B.anim(el, 'placed', 500);
      V.say(['rm_placed']); return true;
    }
    var t = curTarget(); if (t) { pickUp(t); return true; }
    A.Audio.sfx('tap'); return false;
  }
  function flip() {
    if (SEL && !D.hold) return flipThing(SEL);
    if (!D.on) return; var t = D.hold || curTarget(); if (!t) return;
    if (!D.hold) pushUndo();
    t.f = t.f ? 0 : 1; A.Audio.sfx('boing'); renderThings(); if (!D.hold) save(); V.say(['rm_flip']);
  }
  function putAway() {
    if (SEL && !D.hold) return putAwayThing(SEL);
    if (!D.on) return;
    if (D.hold) { var h = D.hold; D.hold = null; if (!h.from) { renderTray(); renderThings(); drawCursor(); return; } save(); }
    else { var t = curTarget(); if (!t) return; pushUndo(); RM.items = RM.items.filter(function (y) { return y !== t; }); save(); }
    A.Audio.sfx('soft'); renderTray(); renderThings(); drawCursor(); V.say(['rm_put_away']);
  }
  function undo() {
    if (!D.on) return;
    if (D.hold) { cancelHold(); if (!D.undo.length) return; }
    var s = D.undo.pop(); if (!s) { A.Audio.sfx('locked'); return; }
    var o = JSON.parse(s); RM.items = o.items; RM.wall = o.wall; RM.floor = o.floor; RM.n = o.n; save();
    drawRoom(); renderTray(); renderThings(); drawCursor(); A.Audio.sfx('boing'); V.say(['rm_undo']);
  }
  function drawCursor() {
    var c = $('#cur'); if (!c) return;
    var q = D.cur.k === 'wall' ? (function () { var r = slotRect(D.cur.s); return [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]]; })() : cellPoly(D.cur.c, D.cur.r);
    c.setAttribute('points', pts(q));
    c.setAttribute('class', D.hold ? (canPlace() ? 'ok' : 'bad') : curTarget() ? 'grab' : '');
    A.$$('#grid .slot').forEach(function (s) { s.classList.toggle('show', !!(D.hold && CAT.byId[D.hold.id].kind === 'wall')); });
  }
  function moveCur(dc, dr) {
    var k = D.hold ? CAT.byId[D.hold.id].kind : null;
    if (D.cur.k === 'floor') {
      if (dr < 0 && D.cur.r === 0 && k !== 'floor' && k !== 'rug') { D.cur = { k: 'wall', s: Math.max(0, Math.min(SLOTS - 1, Math.round((D.cur.c + .5) / COLS * SLOTS - .5))) }; }
      else if (dr > 0 && D.cur.r === ROWS - 1 && !D.hold) { var t = A.$('#tray .chip'); if (t) { t.focus(); return; } }
      else { D.cur.c = Math.max(0, Math.min(COLS - 1, D.cur.c + dc)); D.cur.r = Math.max(0, Math.min(ROWS - 1, D.cur.r + dr)); }
    } else {
      if (dr > 0 && k !== 'wall') D.cur = { k: 'floor', c: Math.max(0, Math.min(COLS - 1, Math.round((D.cur.s + .5) / SLOTS * COLS - .5))), r: 0 };
      else D.cur.s = Math.max(0, Math.min(SLOTS - 1, D.cur.s + dc));
    }
    A.Audio.sfx('step'); renderThings(); drawCursor();
  }
  function roomPoint(e) { var b = $('#roomBox').getBoundingClientRect(); return { x: (e.clientX - b.left) / b.width * VW, y: (e.clientY - b.top) / b.height * VH }; }
  $('#roomBox').addEventListener('pointermove', function (e) {
    if (!D.on || G || e.pointerType === 'touch' || e.pointerType === 'pen') return; var h = hit.apply(null, (function (p) { return [p.x, p.y]; })(roomPoint(e))); if (!h) return;
    if (D.hold && (CAT.byId[D.hold.id].kind === 'wall') !== (h.k === 'wall')) return;
    if (h.k === D.cur.k && (h.k === 'wall' ? h.s === D.cur.s : h.c === D.cur.c && h.r === D.cur.r)) return;
    D.cur = h; renderThings(); drawCursor();
  });
  $('#roomBox').addEventListener('click', function (e) {
    if (Date.now() < gestureUntil) return;
    if (e.target.closest && e.target.closest('#selBar')) return;
    if (SEL && !D.hold && e.detail !== 0) { var q = roomPoint(e); moveSelTo(q.x, q.y); return; }
    if (!D.on) return;
    if (e.detail === 0 || e.clientX == null || (e.clientX === 0 && e.clientY === 0)) { act(); return; }   // controller A / keyboard click on the focused room
    var p = roomPoint(e), h = hit(p.x, p.y); if (!h) return;
    // tapping a placed thing (when not holding) picks it up, even if the tap lands on its art above its square
    if (!D.hold) { var el = e.target.closest && e.target.closest('.thing'); if (el && el.dataset.u) { var x = RM.items.filter(function (y) { return String(y.u) === el.dataset.u; })[0]; if (x) { D.cur = CAT.byId[x.id].kind === 'wall' ? { k: 'wall', s: x.s } : { k: 'floor', c: x.c, r: x.r }; pickUp(x); return; } } }
    if (D.hold && (CAT.byId[D.hold.id].kind === 'wall') !== (h.k === 'wall')) { A.Audio.sfx('locked'); V.say(['rm_spot_taken']); return; }
    D.cur = h; act();
  });
  $('#flipBtn').addEventListener('click', flip); $('#awayBtn').addEventListener('click', putAway); $('#undoBtn').addEventListener('click', undo); $('#doneBtn').addEventListener('click', endDecor);

  /* ================= v2p1b: touch-first, no hidden modes ================= */
  // Any time: press a thing and drag it with a finger (it snaps to the nearest free spot; a 🗑️ corner shows up for putting it away),
  // or tap it to pick it (big ↔ Flip and 🗑️ Put away buttons pop up beside it) and then tap a spot to move it there.
  // Pointer events + touch-action:none on the room, so it works the same for fingers, a pen and a mouse.
  var SEL = null, G = null;
  function itemByU(u) { return RM.items.filter(function (y) { return String(y.u) === String(u); })[0] || null; }
  function thingEl(x) { return x ? A.$('#things .thing[data-u="' + x.u + '"]') : null; }
  function anchorOf(x) { return CAT.byId[x.id].kind === 'wall' ? slotXY(x.s) : cellXY(x.c, x.r); }
  function freeFor(x, c, r) { var o = at(c, r, CAT.byId[x.id].kind === 'rug'); return !o || o === x; }
  function freeSlot(x, s) { var o = atSlot(s); return !o || o === x; }
  function snapFor(x, px, py) {   // nearest free spot for thing x (floor things: floor squares; wall things: wall spots)
    var k = CAT.byId[x.id].kind, best = null, bd = 1e9, d, i;
    if (k === 'wall') { for (i = 0; i < SLOTS; i++) { if (!freeSlot(x, i)) continue; d = Math.hypot(px - SLOT_X[i], (py - SLOT_Y[i]) * 1.3); if (d < bd) { bd = d; best = { k: 'wall', s: i }; } } return best; }
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) { if (!freeFor(x, c, r)) continue; var q = cellXY(c, r); d = Math.hypot(px - q.x, (py - q.y) * 1.6); if (d < bd) { bd = d; best = { k: 'floor', c: c, r: r }; } }
    return best;
  }
  function setPos(x, t) { if (t.k === 'wall') { x.s = t.s; delete x.c; delete x.r; } else { x.c = t.c; x.r = t.r; delete x.s; } }
  function showSnap(t) {
    var c = $('#cur'); if (!c) return;
    if (!t) { if (D.on) drawCursor(); else c.setAttribute('points', '0,0'); return; }
    var q = t.k === 'wall' ? (function () { var r = slotRect(t.s); return [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]]; })() : cellPoly(t.c, t.r);
    c.setAttribute('points', pts(q)); c.setAttribute('class', 'ok');
  }
  function select(x, quiet) {
    SEL = x || null; A.$$('#things .thing.sel').forEach(function (e) { e.classList.remove('sel'); });
    var el = thingEl(SEL); if (el) el.classList.add('sel');
    document.body.classList.toggle('picking', !!SEL);   // while a thing is picked, friends let taps through to the spot under them
    placeSelBar();
    if (SEL && !quiet) { A.Audio.sfx('pop'); if (el) B.anim(el, 'placed', 450); }
  }
  function deselect() { if (SEL) select(null, true); }
  function placeSelBar() {
    var bar = $('#selBar'); if (SEL && RM.items.indexOf(SEL) < 0) SEL = null;
    var el = thingEl(SEL); if (!SEL || !el) { bar.classList.remove('on'); document.body.classList.remove('picking'); return; }
    var box = $('#roomBox').getBoundingClientRect(), r = el.getBoundingClientRect();
    var cx = (r.left + r.width / 2 - box.left) / box.width * 100, top = (r.top - box.top) / box.height * 100;
    bar.style.left = Math.max(12, Math.min(88, cx)).toFixed(2) + '%'; bar.style.top = Math.max(17, top).toFixed(2) + '%';
    bar.classList.add('on');
  }
  function flipThing(x) { pushUndo(); x.f = x.f ? 0 : 1; save(); A.Audio.sfx('boing'); renderThings(); var el = thingEl(x); if (el) B.anim(el, 'placed', 450); V.say(['rm_flip']); }
  function putAwayThing(x) {
    pushUndo(); RM.items = RM.items.filter(function (y) { return y !== x; }); if (SEL === x) SEL = null;
    save(); A.Audio.sfx('soft'); renderThings(); renderTray(); B.anim($('#decoBtn'), 'jump', 500); UI.toast('🧺 ' + CAT.byId[x.id].name + ' is back in your things'); V.say(['rm_put_away']);
  }
  function moveSelTo(px, py) {   // "tap a thing, then tap a spot"
    var x = SEL; if (!x) return; var h = hit(px, py);
    if (!h) { deselect(); A.Audio.sfx('tap'); return; }
    var t = snapFor(x, px, py); if (!t) { A.Audio.sfx('locked'); B.anim($('#roomBox'), 'nudge', 400); return; }
    pushUndo(); setPos(x, t); save(); A.Audio.sfx('star'); renderThings(); var el = thingEl(x); if (el) B.anim(el, 'placed', 450); deselect();
  }
  // a thing from "My things" (or just bought) pops into the middle of the spot, picked and ready to drag
  function popIn(id) {
    if (avail(id) <= 0 || !friendOk(id)) return null;
    var it = CAT.byId[id], x = { u: ++RM.n, id: id, f: 0 }, t = snapFor(x, VW / 2, it.kind === 'wall' ? 150 : cellXY(3, 2).y);
    if (!t) { RM.n--; A.Audio.sfx('locked'); V.say(['rm_no_room']); UI.toast('🧺 Your spot is full! Put something away first.'); return null; }
    pushUndo(); setPos(x, t); RM.items.push(x); save(); A.Audio.sfx('pop'); renderThings(); renderTray(); select(x, true);
    var el = thingEl(x); if (el) B.anim(el, 'popin', 700);
    return x;
  }
  function overTrash(cx, cy) { var t = $('#trash').getBoundingClientRect(); return t.width > 0 && cx >= t.left - 24 && cx <= t.right + 24 && cy >= t.top - 24 && cy <= t.bottom + 24; }
  var RB = $('#roomBox');
  RB.addEventListener('pointerdown', function (e) {
    if (panel || UI.cardOpen || D.hold || G || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if (e.target.closest && e.target.closest('#selBar')) return;
    var el = e.target.closest && e.target.closest('#things .thing');
    if (!el && e.target.closest && e.target.closest('.friend') && document.elementsFromPoint) {   // a friend is standing in front: the thing under the finger wins
      var under = document.elementsFromPoint(e.clientX, e.clientY).filter(function (n) { return n.tagName !== 'DIV' && n.closest && n.closest('#things .thing'); })[0];
      if (under) el = under.closest('#things .thing');
    }
    var x = el && itemByU(el.dataset.u);
    if (!x) return;
    e.preventDefault();
    G = { x: x, el: el, id: e.pointerId, sx: e.clientX, sy: e.clientY, k: RB.getBoundingClientRect().width / VW, a: anchorOf(x), moved: false, t: null, trash: false };
    try { RB.setPointerCapture(e.pointerId); } catch (er) {}
    el.classList.add('lift'); A.Audio.sfx('tap');
  });
  RB.addEventListener('pointermove', function (e) {
    if (!G || e.pointerId !== G.id) return;
    var dx = e.clientX - G.sx, dy = e.clientY - G.sy;
    if (!G.moved && Math.abs(dx) + Math.abs(dy) < 12) return;
    if (!G.moved) { G.moved = true; document.body.classList.add('dragging'); $('#selBar').classList.remove('on'); }
    e.preventDefault();
    G.el.style.translate = dx.toFixed(1) + 'px ' + dy.toFixed(1) + 'px';
    G.trash = overTrash(e.clientX, e.clientY); $('#trash').classList.toggle('hot', G.trash);
    G.t = G.trash ? null : snapFor(G.x, G.a.x + dx / G.k, G.a.y + dy / G.k); showSnap(G.t);
  });
  function endGesture(e, cancel) {
    if (!G || (e && e.pointerId !== G.id)) return; var g = G; G = null; gestureUntil = Date.now() + 450;
    document.body.classList.remove('dragging'); $('#trash').classList.remove('hot'); g.el.classList.remove('lift');
    if (cancel) { g.el.style.translate = ''; showSnap(null); placeSelBar(); return; }
    if (!g.moved) { select(g.x); return; }
    if (g.trash) { showSnap(null); putAwayThing(g.x); return; }
    if (g.t) { pushUndo(); setPos(g.x, g.t); save(); A.Audio.sfx('star'); } else A.Audio.sfx('soft');
    SEL = g.x; renderThings(); showSnap(null); var el = thingEl(g.x); if (el) B.anim(el, 'placed', 450);
  }
  RB.addEventListener('pointerup', function (e) { endGesture(e); });
  RB.addEventListener('pointercancel', function (e) { endGesture(e, true); });
  RB.addEventListener('lostpointercapture', function (e) { if (G && e.pointerId === G.id) endGesture(e, !G.moved ? false : false); });
  ['pointerdown', 'click'].forEach(function (ev) { $('#selBar').addEventListener(ev, function (e) { e.stopPropagation(); }); });
  $('#selFlip').addEventListener('click', function () { if (SEL) flipThing(SEL); });
  $('#selAway').addEventListener('click', function () { if (SEL) putAwayThing(SEL); });
  window.addEventListener('resize', function () { placeSelBar(); });

  // the keyboard hint strip: body.touchui is set/cleared for every page in js/core/util.js (key or controller input shows it)

  /* ================= v2p1b: savings jar (pick one thing to save up for) ================= */
  var jarN = 0;
  function goalIt() { var it = RM.goal && CAT.byId[RM.goal]; return it && !it.starter && it.price > 0 && inShop(it) ? it : null; }
  function jarSvg(f) {
    f = Math.max(0, Math.min(1, f || 0)); var id = 'jc' + (++jarN), h = 46 * f;
    return '<svg class="jarsvg" viewBox="0 0 60 72" aria-hidden="true"><defs><clipPath id="' + id + '"><path d="M12 20 H48 V60 Q48 68 40 68 H20 Q12 68 12 60Z"/></clipPath></defs>' +
      '<path d="M12 20 H48 V60 Q48 68 40 68 H20 Q12 68 12 60Z" fill="#eef8ff"/><rect x="10" y="' + (68 - h).toFixed(1) + '" width="40" height="' + h.toFixed(1) + '" fill="#ffd23c" clip-path="url(#' + id + ')"/>' +
      (f > .08 ? '<g clip-path="url(#' + id + ')" fill="#fff6c8"><circle cx="22" cy="' + (66 - h * .4).toFixed(1) + '" r="3"/><circle cx="36" cy="' + (64 - h * .7).toFixed(1) + '" r="2.4"/></g>' : '') +
      '<path d="M12 20 H48 V60 Q48 68 40 68 H20 Q12 68 12 60Z" fill="none" stroke="#7fb8e6" stroke-width="3.5"/><rect x="15" y="8" width="30" height="12" rx="4" fill="#ff9fc0" stroke="#e57aa0" stroke-width="2.5"/></svg>';
  }
  function jarMini(it) { var have = Math.min(P.wallet.bits, it.price); return '<div class="jarmini">' + jarSvg(have / it.price) + '<b>✦ ' + P.wallet.bits + ' / ' + it.price + '</b></div>'; }
  function renderJar() {
    var b = $('#jarBtn'), it = goalIt(); if (!b) return;
    if (RM.goal && !it) RM.goal = null;
    if (!it) { b.className = 'jar empty'; b.innerHTML = jarSvg(0) + '<span class="jt">Goal?</span>'; b.setAttribute('aria-label', 'Savings jar: pick something to save up for'); return; }
    var ready = P.wallet.bits >= it.price;
    b.className = 'jar' + (ready ? ' ready' : '');
    b.innerHTML = jarSvg(P.wallet.bits / it.price) + '<span class="jg">' + ART.svg(it.id, 'thumb') + '</span><span class="jt">' + (ready ? 'Ready!' : '✦ ' + P.wallet.bits + '/' + it.price) + '</span>';
    b.setAttribute('aria-label', 'Savings jar: ' + it.name + ', ' + P.wallet.bits + ' of ' + it.price + ' star bits' + (ready ? ', ready to buy' : ''));
  }
  function setGoal(id) {
    RM.goal = id; save(); renderJar(); A.Audio.sfx('sparkle'); V.say(['rm_jar_set']); B.anim($('#jarBtn'), 'jump', 600);
    if (panel && panel.id === 'shop') { openShop(shopCat); focusItem(id); }
  }
  $('#jarBtn').addEventListener('click', function () {
    var it = goalIt(); B.anim($('#jarBtn'), 'jump', 500);
    if (!it) { A.Audio.sfx('pop'); V.say(['rm_jar_empty']); openShop(); focusFirst('.sitem'); return; }
    if (P.wallet.bits >= it.price) V.say(['rm_jar_ready']);
    openShop(it.cat); shopItem(it);
  });

  /* ================= v2p1b: the how-to demo (~10 s): plays on a kid's first visit, the big ? replays it ================= */
  function demo() {
    return new Promise(function (resolve) {
      var old = $('#rdemo'); if (old) old.remove();
      var ov = A.el('<div class="overlay on rdemo roomintro" id="rdemo" role="dialog" aria-modal="true" aria-label="How to play"><div class="card"><h2>' + A.esc(P.name) + "'s Picnic Spot</h2>" +
        '<div class="dstage" aria-hidden="true"><img class="dbg" src="' + BG + '" alt="" draggable="false"><div class="dpal">' + B.forProfile(P, { expr: 'happy' }) + '</div>' +
        '<div class="dtray"><span class="dchip c1">' + ART.svg('plant_tall', 'thumb') + '</span><span class="dchip">' + ART.svg('beanbag_pink', 'thumb') + '</span><span class="dchip">' + ART.svg('lamp_star', 'thumb') + '</span></div>' +
        '<div class="ditem">' + ART.svg('plant_tall', 'thumb') + '</div><div class="dhand">👆</div></div>' +
        '<p class="dsay"><span class="s1">👆 Tap to pick</span><span class="s2">✋ Drag it where you want!</span></p>' +
        '<div class="row2"><button class="bigbtn mint" data-go>Got it! ▶</button></div></div></div>');
      document.body.appendChild(ov); UI.cardOpen = true; var t0 = Date.now();
      function close() {
        if (!ov.parentNode) return; document.removeEventListener('keydown', key, true); clearTimeout(ov._t); ov.remove();
        UI.cardOpen = !!document.querySelector('.overlay.on'); P.flags = P.flags || {}; P.flags.roomDemo = (P.flags.roomDemo || 0) + 1; save(); A.Audio.sfx('pop'); resolve();
      }
      function key(e) { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); if (Date.now() - t0 > 300) close(); } }
      document.addEventListener('keydown', key, true);
      ov.querySelector('[data-go]').addEventListener('click', close);
      ov.addEventListener('click', function (e) { if (e.target === ov && Date.now() - t0 > 1500) close(); });
      A.Audio.sfx('pop'); setTimeout(function () { if (ov.parentNode) V.say(['rm_demo'], { kind: 'prompt' }); }, 350);
      setTimeout(function () { var g = ov.querySelector('[data-go]'); if (g) g.focus({ preventScroll: true }); }, 60);
    });
  }
  $('#helpBtn').addEventListener('click', function () { A.Audio.sfx('pop'); B.anim($('#helpBtn'), 'jump', 400); deselect(); closePanel(true); demo(); });

  /* ================= keys (keyboard; the controller sends the same keys) ================= */
  document.addEventListener('keydown', function (e) {
    if (UI.cardOpen || A.Parent.isOpen() || A.$('#gate')) return;
    var k = e.key, ae = document.activeElement;
    if (panel) {
      if (k === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closePanel(); return; }
      if (k === 'h' || k === 'H') return;
      return;   // arrows: UI.arrowNav moves between the panel's buttons
    }
    if (k === 'm' || k === 'M') { if (!D.on) { M.toggle(); musicBtn(); } else { e.preventDefault(); undo(); } return; }
    if (D.on) {
      var inTray = ae && ae.closest && ae.closest('#decoBar');
      if (k === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); if (D.hold) { cancelHold(); A.Audio.sfx('tap'); } else endDecor(); return; }
      if (k === 'r' || k === 'R') { e.preventDefault(); flip(); return; }
      if (k === 'Delete' || k === 'Backspace' || k === 'h' || k === 'H') { e.preventDefault(); putAway(); return; }
      if (k === 'z' || k === 'Z' || k === 'u' || k === 'U') { e.preventDefault(); undo(); return; }
      if (inTray) {
        if (k === 'ArrowUp') { e.preventDefault(); e.stopImmediatePropagation(); $('#roomBox').focus({ preventScroll: true }); return; }
        if (k === 'ArrowLeft' || k === 'ArrowRight') { e.preventDefault(); e.stopImmediatePropagation(); var all = A.$$('#decoBar [data-nav]'), i = all.indexOf(ae); var n = all[Math.max(0, Math.min(all.length - 1, i + (k === 'ArrowLeft' ? -1 : 1)))]; if (n) { n.focus(); n.scrollIntoView({ block: 'nearest', inline: 'nearest' }); A.Audio.sfx('step'); } return; }
        if (k === 'ArrowDown') { e.preventDefault(); e.stopImmediatePropagation(); return; }
        return; // Space/Enter click the chip
      }
      if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown') { e.preventDefault(); e.stopImmediatePropagation(); if (ae !== $('#roomBox')) $('#roomBox').focus({ preventScroll: true }); moveCur(k === 'ArrowLeft' ? -1 : k === 'ArrowRight' ? 1 : 0, k === 'ArrowUp' ? -1 : k === 'ArrowDown' ? 1 : 0); return; }
      if (k === ' ' || k === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) act(); return; }
      return;
    }
    if (k === 'Escape') { e.preventDefault(); goHome(); return; }
    if (k === 's' || k === 'S') { e.preventDefault(); $('#shopBtn').click(); return; }
    if (k === 'd' || k === 'D') { e.preventDefault(); $('#decoBtn').click(); return; }
    if (k === 't' || k === 'T' || k === 'h' || k === 'H') { e.preventDefault(); $('#trophyBtn').click(); return; }
    if (k === 'f' || k === 'F') { e.preventDefault(); $('#friendBtn').click(); return; }
    if ((k === ' ' || k === 'Enter') && (!ae || ae === document.body || ae === $('#roomBox'))) { e.preventDefault(); var f0 = A.$('#mainBar .rbtn'); if (f0) f0.focus(); }
  }, true);
  UI.arrowNav(function () { return panel ? A.$$('[data-nav]', panel) : D.on ? [] : A.$$('#room .rtop [data-nav], #mainBar [data-nav], #friendsL .friend'); });

  /* ================= buttons & boot ================= */
  function goHome() { V.stop(); M.stop(); V.say(['rm_bye']); setTimeout(function () { location.href = '../../index.html#games'; }, 450); }
  function musicBtn() { var b = $('#musicBtn'); b.classList.toggle('off', S.music === false); }
  $('#homeBtn').addEventListener('click', function () { if (D.on) endDecor(); goHome(); });
  $('#musicBtn').addEventListener('click', function () { M.toggle(); musicBtn(); });
  $('#shopBtn').addEventListener('click', function () { A.Audio.sfx('pop'); V.say(['rm_shop']); openShop(); focusFirst('.sitem'); });
  $('#decoBtn').addEventListener('click', function () { A.Audio.sfx('pop'); startDecor(); });
  $('#trophyBtn').addEventListener('click', function () { A.Audio.sfx('pop'); V.say(['rm_trophies']); openShelf('trophies'); focusFirst('.trophy'); });
  $('#friendBtn').addEventListener('click', function () { A.Audio.sfx('pop'); V.say(['rm_friends']); openShelf('friends'); focusFirst('.fcard'); });
  function padKeys() {
    $('#padKeys').innerHTML = D.on ? A.Pad.keys([['dpad', 'move'], ['a', 'place / pick up'], ['y', 'flip'], ['x', 'put away'], ['back', 'undo'], ['b', 'done']]) : A.Pad.keys([['dpad', 'choose'], ['a', 'pick'], ['x', 'trophies'], ['b', 'back']]);
  }
  A.on('pad:mode', padKeys);
  A.Pad.context({});

  $('#rAv').innerHTML = B.forProfile(P, { expr: 'happy' }); $('#rAv').setAttribute('style', B.backdrop(P.color)); $('#rName').textContent = P.name + "'s " + A.TITLES.room; $('#bitCount').textContent = P.wallet.bits; musicBtn();
  drawRoom(); renderThings(); renderFriendCount(); padKeys();
  // a daily visit: each friend living here gets a friendship point
  var ups = F.visit(P); RM.visits = (RM.visits || 0) + 1; var prizes = checkPrizes(), fresh = newInShop(); save(); shopBadge();
  makeFriends(); requestAnimationFrame(step);
  M.play('cozy');
  renderJar();
  var intro = !(P.flags && P.flags.roomDemo) ? demo() : (V.say(['rm_welcome_back']), Promise.resolve());
  intro.then(function () {
    var chain = Promise.resolve();
    prizes.forEach(function (it) { chain = chain.then(function () { return UI.card({ tag: 'Special prize!', title: it.name, art: '<div class="bigthumb dance">' + ART.svg(it.id, 'thumb') + '</div>', glow: true, sub: 'For: ' + it.hint + '. It\'s in your things!', voice: ['rm_prize_won', 'it_' + it.id], sfx: 'unlock', confetti: true, btn: 'Yay!', cls: 'reward' }); }); });
    fresh.forEach(function (it) { chain = chain.then(function () { return UI.card({ tag: '✨ New in the shop!', title: it.name, art: '<div class="bigthumb dance">' + ART.svg(it.id, 'thumb') + '</div>', glow: true, sub: 'Come and see it in the shop!', voice: ['rm_new_shop'], sfx: 'unlock', confetti: true, btn: 'Yay!', cls: 'reward newshop' }); }); });
    return chain.then(showNews);
  }).then(function () { var f = $('#shopBtn'); if (f && !panel && !D.on) f.focus({ preventScroll: true }); });

  window.__room = { P: P, RM: RM, D: D, FR: FR, friends: function () { return FR; }, set speed(v) { SPEED = v; }, get speed() { return SPEED; },
    cellXY: cellXY, slotXY: slotXY, hit: hit, avail: avail, at: at, atSlot: atSlot, act: act, flip: flip, putAway: putAway, undo: undo, moveCur: moveCur, buy: function (id) { return buy(CAT.byId[id]); },
    tap: function (i) { return tapFriend(FR[i], null); }, newInShop: newInShop, shown: shown, popIn: popIn, select: select, friendOk: friendOk, placeFriend: function (f) { placeFriend(f); }, sel: function () { return SEL; }, demo: demo, setGoal: setGoal, snapFor: snapFor, jar: renderJar, pickTarget: pickTarget, tod: TOD, season: SEASON, openBio: openBio, openShop: openShop, openShelf: openShelf, startDecor: startDecor, endDecor: endDecor, panel: function () { return panel && panel.id; } };
})(window.Arcade);
