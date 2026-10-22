/* Picnic Pals — the FOOD FRIENDS cast (approved art, web copies in assets/picnic/). Was the Blob Arcade blob cast.
   A.Blobs.svg({blob, color, outfit, expr}) -> SVG string.
   Expressions: idle | happy | chomp | sad | cheer | love | wink | wow | starry | dreamy | sleepy | silly (as class x-<expr> on the svg, or animation classes on a parent:
   .hop .chomp .happy .wobble .dance .squish — see css/core.css). */
(function (A) {
  'use strict';
  var INK = '#3b2d55', uid = 0;
  function f(n) { return Math.round(n * 10) / 10; }

  /* ---------- colour variants (unlockable) ---------- */
  var COLORS = [
    { id: 'classic', name: 'Classic' },
    { id: 'berry', name: 'Berry', l: '#fff0f6', m: '#ffb3cf', d: '#f47aa6', s: '#de6592' },
    { id: 'mint', name: 'Mint', l: '#effff8', m: '#aef0d2', d: '#62d4a5', s: '#43b98a' },
    { id: 'sunny', name: 'Sunny', l: '#fffbe6', m: '#ffe68a', d: '#ffc93c', s: '#e5ab1f' },
    { id: 'sky', name: 'Sky', l: '#eef7ff', m: '#b3d9ff', d: '#78b8f5', s: '#5d9fe0' },
    { id: 'grape', name: 'Grape', l: '#f5edff', m: '#cdb0ff', d: '#9f78f0', s: '#8862da' },
    { id: 'cocoa', name: 'Toasty', l: '#fbf1e8', m: '#e3c3a5', d: '#c4976f', s: '#a87d57' },
    { id: 'rainbow', name: 'Rainbow', rainbow: true, l: '#fff', m: '#ffd9e6', d: '#d6c4ff', s: '#c79ad8' }
  ];
  var COLOR_BY = {}; COLORS.forEach(function (c) { COLOR_BY[c.id] = c; });
  COLOR_BY.classic.l = '#fffdf5'; COLOR_BY.classic.m = '#f6ecd9'; COLOR_BY.classic.d = '#e7d6b8';
  // food friends keep their own colours: a colour is the friend's personal BACKDROP (the circle / card behind them)
  function backdrop(id) {
    var c = COLOR_BY[id] || COLOR_BY.classic;
    if (c.rainbow) return 'background:conic-gradient(from 200deg, #ffb3c9, #ffe08a, #b6f0c8, #a9d8ff, #d6bfff, #ffb3c9);box-shadow:inset 0 0 0 4px #ffffffaa';
    return 'background:radial-gradient(circle at 50% 42%, ' + c.l + ' 0 34%, ' + c.m + ' 66%, ' + c.d + ' 100%);box-shadow:inset 0 0 0 3px ' + c.d;
  }

  /* ---------- outfits (unlockable) ---------- */
  // ids, star costs and pacing are the old Blob Arcade outfits (rewards.js); the art is now the Picnic Pals hats (theme/hats)
  // and held items (theme/held). art: hat id, held: held-item id (Dress Up shows those in their own "Hold" row).
  var OUTFITS = [
    { id: 'none', name: 'Just me' }, { id: 'bow', name: 'Balloon', held: 'balloon' }, { id: 'cap', name: 'Sun hat', hat: true, art: 'sunhat' },
    { id: 'headband', name: 'Ice-cream cone', held: 'icecream' }, { id: 'sunglasses', name: 'Bookworm glasses', art: 'bookworm' }, { id: 'flower', name: 'Flower crown', hat: true, art: 'flowercrown' },
    { id: 'partyhat', name: 'Party hat', hat: true, art: 'partyhat' }, { id: 'beanie', name: "Chef's hat", hat: true, art: 'chef' }, { id: 'crown', name: 'Crown', hat: true, art: 'crown' },
    // the rest of the approved theme art (theme/hats + theme/held). Each one is LOCKED UNTIL EARNED: see rewards.js CONFIG.outfitEarn.
    { id: 'explorer', name: 'Explorer cap', hat: true, art: 'explorer' }, { id: 'snorkel', name: 'Snorkel mask', art: 'snorkel' }, { id: 'conductor', name: 'Conductor cap', hat: true, art: 'conductor' },
    { id: 'bee', name: 'Bee antennae', hat: true, art: 'bee' }, { id: 'dino', name: 'Dino hood', hat: true, art: 'dino' }, { id: 'headlamp', name: "Doctor's headlamp", art: 'headlamp' },
    { id: 'rainhat', name: 'Rain hat', hat: true, art: 'rainhat' }, { id: 'safari', name: 'Safari hat', hat: true, art: 'safari' }, { id: 'astronaut', name: 'Astronaut helmet', hat: true, art: 'astronaut' },
    { id: 'wizard', name: 'Wizard hat', hat: true, art: 'wizard' }, { id: 'gradcap', name: 'Graduation cap', hat: true, art: 'gradcap' },
    { id: 'kite', name: 'Kite', held: 'kite' }, { id: 'lollipop', name: 'Lollipop', held: 'lollipop' }, { id: 'bouquet', name: 'Flower bouquet', held: 'bouquet' },
    { id: 'book', name: 'Book', held: 'book' }, { id: 'trophy', name: 'Trophy', held: 'trophy' }, { id: 'bubbles', name: 'Bubble wand', held: 'bubbles' },
    { id: 'net', name: 'Butterfly net', held: 'net' }, { id: 'telescope', name: 'Telescope', held: 'telescope' }, { id: 'teddy', name: 'Teddy bear', held: 'teddy' },
    { id: 'umbrella', name: 'Umbrella', held: 'umbrella' }, { id: 'wand', name: 'Magic wand', held: 'wand' }, { id: 'ukulele', name: 'Ukulele', held: 'ukulele' },
    { id: 'flag', name: 'Flag', held: 'flag' }, { id: 'basket', name: 'Picnic basket', held: 'basket' }, { id: 'golden_basket', name: 'Golden picnic basket', held: 'golden_basket' }
  ];
  // balloon colour choices (free once the balloon is earned): tinted copies of the one balloon art, built by tools/build-wear-art.py
  var BALLOON_COLORS = [{ id: 'red', name: 'Red', hex: '#ff6f8e' }, { id: 'blue', name: 'Blue', hex: '#6fa8ff' }, { id: 'yellow', name: 'Yellow', hex: '#ffd23c' },
    { id: 'green', name: 'Green', hex: '#6fdc8c' }, { id: 'purple', name: 'Purple', hex: '#b48cff' }];
  var OUTFIT_BY = {}; OUTFITS.forEach(function (o) { OUTFIT_BY[o.id] = o; });
  OUTFIT_BY.helmet = { id: 'helmet', name: 'Batting helmet', hat: true, hidden: true }; // Snack Slugger only (not in Dress Up); color: svg({helmet: '#hex'})

  /* ---------- shared face parts ---------- */
  function sparkle(x, y, r, fill) { return '<path d="M' + f(x) + ' ' + f(y - r) + 'Q' + f(x) + ' ' + f(y) + ' ' + f(x + r) + ' ' + f(y) + 'Q' + f(x) + ' ' + f(y) + ' ' + f(x) + ' ' + f(y + r) + 'Q' + f(x) + ' ' + f(y) + ' ' + f(x - r) + ' ' + f(y) + 'Q' + f(x) + ' ' + f(y) + ' ' + f(x) + ' ' + f(y - r) + 'Z" fill="' + (fill || '#fff') + '"/>'; }
  function star5(cx, cy, r, fill, extra) {
    var p = []; for (var i = 0; i < 10; i++) { var a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * .45 : r; p.push(f(cx + Math.cos(a) * rr) + ' ' + f(cy + Math.sin(a) * rr)); }
    return '<path d="M' + p.join('L') + 'Z" fill="' + fill + '" ' + (extra || '') + '/>';
  }
  /* ---------- the cast: Picnic Pals food friends (art in assets/picnic/friends, data in foods-data.js) ---------- */
  var FD = A.FoodData || { cast: [], anchors: {}, starters: [], order: [] };
  var CAST = FD.cast.map(function (f) { return { id: f.id, name: f.name, food: f.food, looks: f.looks, personality: f.personality, favorite: f.favorite, catchphrase: f.catchphrase,
    placeholder: f.placeholder, starter: f.status === 'Starter', unlock: f.unlock, colors: f.colors, size: f.size }; });
  // the old blob ids (saves before Picnic Pals) and the food friend each one became (see art/foods/README.md)
  var OLD = { mochi: 'mochi', poppy: 'strawberry', dewdrop: 'blueberry', pickle: 'corn', clem: 'carrot', nova: 'grapes' };
  var BY = {}; CAST.forEach(function (c) { BY[c.id] = c; });
  // expression → pose picture. Parent animation classes: .happy → happy, .dance → cheering, .chomp → munching, .wobble → oops
  var POSE = { idle: 'front', front: 'front', happy: 'happy', cheer: 'cheering', cheering: 'cheering', chomp: 'munching', munch: 'munching', munching: 'munching',
    sad: 'sad', oops: 'oops', think: 'thinking', thinking: 'thinking', sleepy: 'sleepy', dreamy: 'sleepy', love: 'happy', wink: 'happy', silly: 'happy',
    wow: 'cheering', starry: 'cheering', bat: 'batting', batting: 'batting', kick: 'kicking', kicking: 'kicking' };
  var BASE_POSES = ['front', 'happy', 'cheering', 'oops', 'sad', 'munching', 'sleepy', 'thinking'];
  var ROOT = (function () { var sc = document.currentScript; return sc && sc.src ? sc.src.replace(/js\/core\/blobs\.js(\?.*)?$/, '') : ''; })();
  var WD = A.WearData || { hats: {}, items: {}, hand: {} };
  function wearUrl(kind, id, px) { return ROOT + 'assets/picnic/wear/' + kind + '/' + id + '_' + (px || 256) + '.webp'; }
  function artUrl(id, pose, px) { return ROOT + 'assets/picnic/friends/' + id + '/' + pose + '_' + (px || 256) + '.webp'; }

  /* ---------- accessories ---------- */
  function hat(c, inner) { return '<g class="acc" transform="translate(60 ' + c.hatY + ')">' + inner + '</g>'; }
  var ACC = {
    helmet: function (c, id, o) {
      var col = (o && o.helmet) || '#3d8ef0', dk = (o && o.helmetDark) || '#2a6cc4';
      return hat(c, '<path d="M-31 6 C-33 -32 31 -32 31 4 L31 8 C20 6 -20 6 -31 8Z" fill="' + col + '" stroke="' + dk + '" stroke-width="2"/>' +
        '<path d="M-31 2 C-38 4 -38 20 -27 22 C-22 22 -20 16 -21 8Z" fill="' + col + '" stroke="' + dk + '" stroke-width="2"/><circle cx="-28" cy="13" r="2.4" fill="' + dk + '"/>' +
        '<path d="M8 3 C24 -2 44 0 50 7 C40 11 20 10 8 7Z" fill="' + dk + '"/><ellipse cx="-12" cy="-18" rx="9" ry="4.5" fill="#fff" opacity=".55" transform="rotate(-20 -12 -18)"/>');
    },
    cap: function (c) { return hat(c, '<path d="M-30 3 C-31 -30 31 -30 30 3Z" fill="#4f8ff7" stroke="#3a73d6" stroke-width="2"/><path d="M0 -26V2" stroke="#3a73d6" stroke-width="1.5" opacity=".6"/>' +
      '<circle cx="0" cy="-27" r="3.2" fill="#3a73d6"/><path d="M6 -1 C24 -8 46 -6 53 3 C44 9 20 9 6 3Z" fill="#3a73d6"/>' + star5(-13, -11, 6.5, '#fff')); },
    partyhat: function (c) { return hat(c, '<g transform="rotate(-10)"><path d="M-17 2 L0 -42 L17 2Z" fill="#ff8fb1" stroke="#e46f98" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="-5" cy="-8" r="2.6" fill="#ffe58a"/><circle cx="6" cy="-15" r="2.6" fill="#9fd2ff"/><circle cx="-1" cy="-26" r="2.4" fill="#ffe58a"/><circle cx="7" cy="-2" r="2.4" fill="#8fe3c0"/>' +
      '<ellipse cx="0" cy="2" rx="18" ry="4" fill="#ffe58a"/><circle cx="0" cy="-43" r="6" fill="#9fd2ff" stroke="#7bb8ef" stroke-width="1.5"/></g>'); },
    crown: function (c) { return hat(c, '<path d="M-24 3 L-26 -21 L-13 -9 L0 -27 L13 -9 L26 -21 L24 3Z" fill="#ffd23c" stroke="#e5a800" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="-26" cy="-22" r="3" fill="#ffd23c" stroke="#e5a800"/><circle cx="0" cy="-28" r="3" fill="#ffd23c" stroke="#e5a800"/><circle cx="26" cy="-22" r="3" fill="#ffd23c" stroke="#e5a800"/>' +
      '<circle cx="0" cy="-6" r="3.8" fill="#ff7aa6"/><circle cx="-13" cy="-3" r="2.6" fill="#8fe3c0"/><circle cx="13" cy="-3" r="2.6" fill="#9fd2ff"/>'); },
    beanie: function (c) { return hat(c, '<path d="M-32 4 C-33 -36 33 -36 32 4Z" fill="#8fe3c0" stroke="#4fcf98" stroke-width="2"/>' +
      '<path d="M-18 -3V-24M-6 -3V-29M6 -3V-29M18 -3V-24" stroke="#4fcf98" stroke-width="2" opacity=".55" stroke-linecap="round"/>' +
      '<rect x="-34" y="-7" width="68" height="13" rx="6.5" fill="#4fd3a1"/><circle cx="0" cy="-33" r="8" fill="#fff" stroke="#e3dcea" stroke-width="1.5"/>'); },
    bow: function (c) { return '<g class="acc" transform="translate(' + c.bow[0] + ' ' + c.bow[1] + ') rotate(18)"><path d="M0 0 C-6 -11 -19 -12 -19 0 C-19 12 -6 11 0 0Z M0 0 C6 -11 19 -12 19 0 C19 12 6 11 0 0Z" fill="#ff6f9f" stroke="#e0507f" stroke-width="1.8"/><circle r="4.6" fill="#ff9fc0" stroke="#e0507f" stroke-width="1.5"/></g>'; },
    flower: function (c) {
      var s = '<g class="acc" transform="translate(' + c.flower[0] + ' ' + c.flower[1] + ')">';
      for (var i = 0; i < 6; i++) s += '<ellipse cx="0" cy="-8" rx="4.8" ry="7.5" fill="#fff" stroke="#f1d3e2" stroke-width="1.2" transform="rotate(' + (i * 60) + ')"/>';
      return s + '<circle r="5.5" fill="#ffd23c" stroke="#efb500" stroke-width="1.2"/></g>';
    },
    headband: function (c, id) { return '<g class="acc" clip-path="url(#' + id + 'c)"><rect x="0" y="' + (c.band - 6) + '" width="120" height="12" fill="#ff5a6e"/><rect x="0" y="' + (c.band - 1.5) + '" width="120" height="3" fill="#fff"/><rect x="0" y="' + (c.band + 4) + '" width="120" height="2" fill="#d63f55" opacity=".5"/></g>'; },
    sunglasses: function (c) {
      var y = c.eye.y, L = 60 - c.eye.dx, R = 60 + c.eye.dx, s = '<g class="acc">';
      s += '<path d="M' + (L + 11) + ' ' + (y - 4) + 'Q60 ' + (y - 9) + ' ' + (R - 11) + ' ' + (y - 4) + '" stroke="#2d2547" stroke-width="3" fill="none"/>';
      [L, R].forEach(function (x) {
        s += '<rect x="' + (x - 12) + '" y="' + (y - 9) + '" width="24" height="17" rx="7" fill="#2d2547"/>';
        s += '<path d="M' + (x - 7) + ' ' + (y - 5) + 'L' + (x - 1) + ' ' + (y - 5) + 'L' + (x - 7) + ' ' + (y + 2) + 'Z" fill="#fff" opacity=".35"/>';
      });
      s += '<path d="M' + (L - 12) + ' ' + (y - 5) + 'L' + (L - 22) + ' ' + (y - 8) + 'M' + (R + 12) + ' ' + (y - 5) + 'L' + (R + 22) + ' ' + (y - 8) + '" stroke="#2d2547" stroke-width="3" stroke-linecap="round"/>';
      return s + '</g>';
    }
  };

  /* ---------- render ----------
     One <svg class="blob food x-<expr>"> per friend: a picture per pose (only the one for the current expression shows, so
     games can still switch faces by class), plus outfits placed on the per-pose head / eye anchors. */
  function accFor(c, outfitId, pose, id, o) {
    var an = (FD.anchors[c.id] || {})[pose] || (FD.anchors[c.id] || {}).front; if (!an || outfitId === 'none' || !ACC[outfitId] && outfitId !== 'headband') return '';
    var eyes = outfitId === 'sunglasses', a = eyes ? an.eyes : an.head; if (!a) return '';
    var head = { hatY: 0, bow: [84, 2], flower: [36, 4], eye: { y: 0, dx: 18 } }, inner;
    if (outfitId === 'headband') inner = '<g class="acc"><rect x="28" y="2" width="64" height="11" rx="5.5" fill="#ff5a6e"/><rect x="28" y="6.5" width="64" height="2.5" fill="#fff"/></g>';
    else inner = ACC[outfitId](head, id, o);
    return '<g class="accw" transform="translate(' + a[0] + ' ' + a[1] + ') rotate(' + a[2] + ') scale(' + a[3] + ') translate(-60 0)">' + inner + '</g>';
  }
  // a hat from theme/hats on the per-pose head / eye anchor (anchors.json: translate(units) rotate(rot) scale(scale / png_px_per_unit))
  function hatFor(c, hatId, pose, px) {
    var h = WD.hats[hatId], an = (FD.anchors[c.id] || {})[pose] || (FD.anchors[c.id] || {}).front, a = h && an && an[h.anchor]; if (!a) return '';
    return '<g class="acc hat hat-' + hatId + '" transform="translate(' + a[0] + ' ' + a[1] + ') rotate(' + a[2] + ') scale(' + f3(a[3] / h.ppu) + ')"><image href="' + wearUrl('hats', hatId, px) + '" x="' + (-h.px[0]) + '" y="' + (-h.px[1]) + '" width="' + h.size + '" height="' + h.size + '"/></g>';
  }
  // a held item from theme/held on the per-pose hand anchor (held.json); upright items (balloon) ignore the pose lean
  function heldFor(c, itemId, pose, px, tint, zoom) {
    var it = WD.items[itemId], a = it && (WD.hand[c.id] || {})[pose]; if (!a) return '';
    var art = itemId === 'balloon' && tint && (WD.balloonTints || []).indexOf(tint) >= 0 ? 'balloon_' + tint : itemId;
    var k = f3(a[3] / it.ppu), ang = it.upright ? it.rot : a[2] + it.rot;
    return '<g class="acc held held-' + itemId + '" transform="translate(' + a[0] + ' ' + a[1] + ') rotate(' + ang + ') scale(' + (a[4] ? -k : k) + ' ' + k + ')">' + (zoom > 1 ? '<g transform="scale(' + zoom + ')">' : '') + '<image href="' + wearUrl('held', art, px) + '" x="' + (-it.grip[0]) + '" y="' + (-it.grip[1]) + '" width="' + it.size + '" height="' + it.size + '"/>' + (zoom > 1 ? '</g>' : '') + '</g>';
  }
  function f3(n) { return Math.round(n * 10000) / 10000; }
  // o.outfit = what's worn on the head/face (an outfit id); o.held = what's held (an outfit id whose art is a held item).
  // An outfit id that is a held item passed as o.outfit (old saves, reward cards) is drawn as held.
  function svg(o) {
    o = o || {};
    var c = BY[o.blob] || BY[OLD[o.blob]] || CAST[0], id = 'b' + (uid++) + '_', px = o.hi ? 512 : 256;
    var expr = o.expr || 'idle', main = POSE[expr] || 'front', outfit = OUTFIT_BY[o.outfit] || OUTFITS[0], held = OUTFIT_BY[o.held];
    if (outfit.held) { held = held && held.held ? held : outfit; outfit = OUTFITS[0]; }
    if (held && !held.held) held = null;
    var poses = BASE_POSES.indexOf(main) < 0 ? BASE_POSES.concat([main]) : BASE_POSES;
    var s = '<svg class="blob food x-' + expr + ' blob-' + c.id + (held ? ' holding' : '') + '" viewBox="-16 -26 152 152" overflow="visible" aria-hidden="true" focusable="false"><g class="bob">';
    poses.forEach(function (p) {
      var hat = outfit.art ? hatFor(c, outfit.art, p, px) : outfit.id !== 'none' ? accFor(c, outfit.id, p, id + p, o) : '';
      var hold = held && (WD.hand[c.id] || {})[p] ? heldFor(c, held.held, p, px, o.balloon, o.heldZoom) : '';
      // layer order (theme/held/README): <pose>_body, the item, <pose>_hand, then the hat
      var body = hold ? '<image href="' + wearUrl('layers/' + c.id, p + '_body', px) + '" x="-16" y="-26" width="152" height="152"/>' + hold +
        '<image href="' + wearUrl('layers/' + c.id, p + '_hand', px) + '" x="-16" y="-26" width="152" height="152"/>'
        : '<image href="' + artUrl(c.id, p, px) + '" x="-16" y="-26" width="152" height="152"/>';
      s += '<g class="pz pz-' + p + '">' + body + hat + '</g>';
    });
    return s + '</g></svg>';
  }
  // the picture of one pose (for <img> use)
  function art(id, pose, px) { var c = BY[id] || BY[OLD[id]] || CAST[0]; return artUrl(c.id, POSE[pose] || pose || 'front', px); }

  // Grumbly: the gentle optional wanderer cloud from Mochi Munch v1 (not a playable blob)
  function grumbly() {
    return '<svg viewBox="0 0 120 90" aria-hidden="true"><g fill="#d8c8ff" stroke="#b9a3f5" stroke-width="2"><path d="M25 75 C8 75 6 52 22 48 C20 30 42 22 52 34 C58 16 88 16 92 38 C110 36 116 62 100 72 C96 80 30 80 25 75Z"/></g>' +
      '<path d="M42 52 Q48 57 54 52M68 52 Q74 57 80 52" stroke="#5b4a85" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M55 64 Q61 68 67 64" stroke="#5b4a85" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="36" cy="60" rx="6" ry="3.5" fill="#ffb3cf" opacity=".7"/><ellipse cx="86" cy="60" rx="6" ry="3.5" fill="#ffb3cf" opacity=".7"/>' +
      '<text x="98" y="22" font-size="16" fill="#9b86d6" font-family="sans-serif" font-weight="bold">z</text><text x="108" y="12" font-size="11" fill="#9b86d6" font-family="sans-serif" font-weight="bold">z</text></svg>';
  }

  A.Blobs = {
    CAST: CAST, byId: BY, OLD_IDS: OLD, STARTERS: FD.starters, ORDER: FD.order, POSE: POSE, art: art, artUrl: artUrl, COLORS: COLORS, colorById: COLOR_BY, OUTFITS: OUTFITS, outfitById: OUTFIT_BY, HATS: OUTFITS.filter(function (o) { return !o.held; }), HELD: [{ id: 'none', name: 'Empty paws' }].concat(OUTFITS.filter(function (o) { return o.held; })), BALLOON_COLORS: BALLOON_COLORS, wearUrl: wearUrl,
    svg: svg, star5: star5, grumbly: grumbly, backdrop: backdrop,
    forProfile: function (p, extra) { var o = { blob: p.blob, color: p.color, outfit: p.outfit, held: p.held, balloon: p.balloon }; for (var k in extra || {}) o[k] = extra[k]; return svg(o); },
    // play a one-shot animation class on a wrapper element (hop, chomp, happy, wobble, squish, jump)
    anim: function (el, cls, ms) {
      if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
      clearTimeout(el['_t' + cls]); el['_t' + cls] = setTimeout(function () { el.classList.remove(cls); }, ms || 500);
    }
  };
})(window.Arcade);
