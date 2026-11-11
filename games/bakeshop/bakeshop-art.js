/* Bake Shop Clock art map. Locked bakery art lives in arcade/art/bakeshop/.
   SRC holds each piece URL; drawers fall back to SVG if a src is missing. */
(function (A) {
  'use strict';

  var NEEDED = [
    { id: 'shop_bg', name: 'Bakery interior background', notes: 'Warm shop wall, counter, window. Portrait and landscape crops.' },
    { id: 'oven', name: 'Oven body', notes: 'Friendly oven; clock sits in the door window. Leave a circular cutout.' },
    { id: 'clock_face', name: 'Analog clock face', notes: 'Cream face, brown rim, numerals 1–12, tick marks. No hands.' },
    { id: 'hand_hour', name: 'Hour hand', notes: 'Short, fat, rounded tip. Pivot at the base.' },
    { id: 'hand_minute', name: 'Minute hand', notes: 'Longer, slimmer, rounded tip. Pivot at the base.' },
    { id: 'hand_hub', name: 'Hand cap / hub', notes: 'Small circle over the pivot.' },
    { id: 'treat_tag', name: 'Treat tag / ticket', notes: 'Paper tag with room for a small clock. Used for matching.' },
    { id: 'treat_cookie', name: 'Cookie', notes: 'Front-facing bakery cookie.' },
    { id: 'treat_muffin', name: 'Muffin', notes: 'Paper-wrapper muffin.' },
    { id: 'treat_cupcake', name: 'Cupcake', notes: 'Frosted cupcake.' },
    { id: 'treat_pie', name: 'Pie', notes: 'Whole pie, lattice or plain.' },
    { id: 'treat_bread', name: 'Loaf of bread', notes: 'Round or sandwich loaf.' },
    { id: 'treat_pretzel', name: 'Pretzel', notes: 'Twisted pretzel.' },
    { id: 'treat_roll', name: 'Cinnamon roll', notes: 'Iced swirl roll.' },
    { id: 'treat_scone', name: 'Scone', notes: 'Triangular scone.' },
    { id: 'treat_brownie', name: 'Brownie', notes: 'Square brownie.' },
    { id: 'treat_tart', name: 'Tart', notes: 'Fruit tart.' },
    { id: 'treat_donut', name: 'Donut', notes: 'Iced ring donut.' },
    { id: 'treat_bun', name: 'Bun', notes: 'Soft bakery bun.' },
    { id: 'deco_cake_stand', name: 'Cake stand decoration', notes: 'Sits on the counter after an order.' },
    { id: 'deco_flower_pot', name: 'Flower pot decoration', notes: 'Counter or window.' },
    { id: 'deco_cookie_jar', name: 'Cookie jar decoration', notes: 'Counter jar.' },
    { id: 'deco_string_lights', name: 'String lights decoration', notes: 'Hangs above the shop.' },
    { id: 'deco_chalkboard', name: 'Chalkboard menu decoration', notes: 'Wall menu.' },
    { id: 'deco_window_pie', name: 'Pie in the window decoration', notes: 'Window display.' },
    { id: 'deco_plant', name: 'Plant decoration', notes: 'Floor or shelf plant.' },
    { id: 'deco_bunting', name: 'Bunting decoration', notes: 'Festival flags across the shop.' },
    { id: 'deco_shelf_clock', name: 'Shelf clock decoration', notes: 'Small clock on a shelf (not the oven).' },
    { id: 'deco_mixing_bowl', name: 'Mixing bowl decoration', notes: 'Counter bowl and spoon.' },
    { id: 'boss_hat', name: 'Boss baker hat', notes: 'Optional hat for the Picnic Boss friend.' }
  ];

  var ART = '../../art/bakeshop/';
  var SRC = {
    shop_bg: ART + 'shop_bg_portrait.webp',
    shop_bg_portrait: ART + 'shop_bg_portrait.webp',
    shop_bg_landscape: ART + 'shop_bg_landscape.webp',
    oven: ART + 'oven.webp',
    clock_face: ART + 'clock_face.webp',
    hand_hour: ART + 'hand_hour.webp',
    hand_minute: ART + 'hand_minute.webp',
    hand_hub: ART + 'hand_hub.webp',
    treat_tag: ART + 'treat_tag.webp',
    treat_cookie: ART + 'treat_cookie.webp',
    treat_muffin: ART + 'treat_muffin.webp',
    treat_cupcake: ART + 'treat_cupcake.webp',
    treat_pie: ART + 'treat_pie.webp',
    treat_bread: ART + 'treat_bread.webp',
    treat_pretzel: ART + 'treat_pretzel.webp',
    treat_roll: ART + 'treat_roll.webp',
    treat_scone: ART + 'treat_scone.webp',
    treat_brownie: ART + 'treat_brownie.webp',
    treat_tart: ART + 'treat_tart.webp',
    treat_donut: ART + 'treat_donut.webp',
    treat_bun: ART + 'treat_bun.webp',
    deco_cake_stand: ART + 'deco_cake_stand.webp',
    deco_flower_pot: ART + 'deco_flower_pot.webp',
    deco_cookie_jar: ART + 'deco_cookie_jar.webp',
    deco_string_lights: ART + 'deco_string_lights.webp',
    deco_chalkboard: ART + 'deco_chalkboard.webp',
    deco_window_pie: ART + 'deco_window_pie.webp',
    deco_plant: ART + 'deco_plant.webp',
    deco_bunting: ART + 'deco_bunting.webp',
    deco_shelf_clock: ART + 'deco_shelf_clock.webp',
    deco_mixing_bowl: ART + 'deco_mixing_bowl.webp',
    boss_hat: ART + 'boss_hat.webp'
  };
  /* Face is 1024, pivots from the locked anchors. Keep the SVG viewBox at 200 so hit-pad math stays the same. */
  var FACE = 1024, VB = 200, FACE_S = VB / FACE;
  var HOUR_PIVOT = [120, 276], HOUR_SIZE = [240, 328];
  var MIN_PIVOT = [90, 384], MIN_SIZE = [180, 436];
  var HUB_PIVOT = [60, 60], HUB_SIZE = [120, 120];
  var CLOCK_SCALE = 0.4253; /* recommended scale of the 1024 face into the oven cutout */


  function src(id) { return SRC[id] || ''; }
  function imgOr(id, fallback, w, h) {
    var u = src(id);
    if (u) return '<img class="bs-art" data-art="' + id + '" src="' + u + '" width="' + (w || 64) + '" height="' + (h || 64) + '" alt="">';
    return fallback;
  }

  function clockSvg(t, opt) {
    opt = opt || {};
    t = t || { h: 12, m: 0 };
    var size = opt.size || 220;
    var nums = opt.numbers !== false;
    var interactive = !!opt.interactive;
    var id = opt.id || '';
    var ha = A.BakeShop.hourAngle(t);
    var ma = A.BakeShop.minuteAngle(t);
    var i, a, x1, y1, x2, y2, lx, ly;
    var hourHit = interactive ? '<line class="bs-hit" data-hand="hour" x1="100" y1="100" x2="100" y2="36" stroke="#0000" stroke-width="52" stroke-linecap="round"/>' : '';
    var minHit = interactive ? '<line class="bs-hit" data-hand="minute" x1="100" y1="100" x2="100" y2="22" stroke="#0000" stroke-width="52" stroke-linecap="round"/>' : '';
    var showMin = opt.minute !== false;
    var svgOpen = '<svg class="bs-clock' + (interactive ? ' interactive' : '') + '" data-art="clock_face" viewBox="0 0 200 200" width="' + size + '" height="' + size + '" ' + (id ? 'id="' + id + '"' : '') + ' aria-hidden="' + (opt.label ? 'false' : 'true') + '"' + (opt.label ? ' role="img" aria-label="' + opt.label + '"' : '') + '>';
    var faceSrc = src('clock_face');
    if (faceSrc) {
      function handImg(id, pivot, dim) {
        var u = src(id);
        if (!u) return '';
        var w = dim[0] * FACE_S, h = dim[1] * FACE_S;
        var x = 100 - pivot[0] * FACE_S, y = 100 - pivot[1] * FACE_S;
        return '<image href="' + u + '" x="' + x.toFixed(3) + '" y="' + y.toFixed(3) + '" width="' + w.toFixed(3) + '" height="' + h.toFixed(3) + '" pointer-events="none"/>';
      }
      var hiddenNums = '';
      if (nums) {
        for (i = 1; i <= 12; i++) hiddenNums += '<text x="100" y="100" font-size="1" fill="none">' + i + '</text>';
      }
      var hubU = src('hand_hub');
      var hubW = HUB_SIZE[0] * FACE_S;
      var hubXY = 100 - HUB_PIVOT[0] * FACE_S;
      var hub = hubU
        ? '<image href="' + hubU + '" x="' + hubXY.toFixed(3) + '" y="' + hubXY.toFixed(3) + '" width="' + hubW.toFixed(3) + '" height="' + hubW.toFixed(3) + '" pointer-events="none"/>'
        : '<circle cx="100" cy="100" r="8" fill="#3a2714" stroke="#fff8e7" stroke-width="2"/>';
      return svgOpen +
        '<image href="' + faceSrc + '" x="0" y="0" width="200" height="200" pointer-events="none"/>' +
        hiddenNums +
        '<g class="bs-hand-hour" transform="rotate(' + ha + ' 100 100)">' + hourHit + handImg('hand_hour', HOUR_PIVOT, HOUR_SIZE) + '</g>' +
        (showMin ? '<g class="bs-hand-min" transform="rotate(' + ma + ' 100 100)">' + minHit + handImg('hand_minute', MIN_PIVOT, MIN_SIZE) + '</g>' : '') +
        hub +
        '</svg>';
    }
    var ticks = '', labels = '';
    for (i = 0; i < 12; i++) {
      a = i * 30 * Math.PI / 180;
      x1 = 100 + Math.sin(a) * (i % 3 === 0 ? 78 : 82);
      y1 = 100 - Math.cos(a) * (i % 3 === 0 ? 78 : 82);
      x2 = 100 + Math.sin(a) * 88;
      y2 = 100 - Math.cos(a) * 88;
      ticks += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#5a3d1c" stroke-width="' + (i % 3 === 0 ? 3.2 : 1.6) + '" stroke-linecap="round"/>';
    }
    if (nums) {
      for (i = 1; i <= 12; i++) {
        a = i * 30 * Math.PI / 180;
        lx = 100 + Math.sin(a) * 64;
        ly = 100 - Math.cos(a) * 64 + 5.5;
        labels += '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="middle" font-size="16" font-weight="800" fill="#3a2714" font-family="system-ui,sans-serif">' + i + '</text>';
      }
    }
    return svgOpen +
      '<defs><radialGradient id="bsFace" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fffdf6"/><stop offset="1" stop-color="#f3e0b8"/></radialGradient></defs>' +
      '<circle cx="100" cy="100" r="96" fill="#6b3a22" stroke="#3a2714" stroke-width="3"/>' +
      '<circle cx="100" cy="100" r="86" fill="url(#bsFace)" stroke="#c9a36a" stroke-width="3"/>' +
      '<polygon points="100,16 106,28 94,28" fill="#3a2714"/>' +
      ticks + labels +
      (showMin ? '<g class="bs-hand-min" transform="rotate(' + ma + ' 100 100)">' + minHit +
        '<line x1="100" y1="112" x2="100" y2="24" stroke="#3a2714" stroke-width="6" stroke-linecap="round"/></g>' : '') +
      '<g class="bs-hand-hour" transform="rotate(' + ha + ' 100 100)">' + hourHit +
        '<line x1="100" y1="112" x2="100" y2="46" stroke="#b63442" stroke-width="11" stroke-linecap="round"/></g>' +
      '<circle cx="100" cy="100" r="8" fill="#3a2714" stroke="#fff8e7" stroke-width="2"/>' +
      '</svg>';
  }

  var TREAT_SVG = {
    cookie: '<svg viewBox="0 0 64 64" class="bs-art" data-art="treat_cookie"><circle cx="32" cy="32" r="22" fill="#d9a15a" stroke="#8a5a22" stroke-width="2.4"/><circle cx="24" cy="26" r="3" fill="#5a3d1c"/><circle cx="38" cy="24" r="2.6" fill="#5a3d1c"/><circle cx="30" cy="38" r="3" fill="#5a3d1c"/><circle cx="42" cy="36" r="2.4" fill="#5a3d1c"/><circle cx="22" cy="36" r="2" fill="#5a3d1c"/></svg>',
    muffin: '<svg viewBox="0 0 64 64" class="bs-art" data-art="treat_muffin"><ellipse cx="32" cy="26" rx="16" ry="12" fill="#c9844a" stroke="#7a4a1c" stroke-width="2"/><path d="M18 28 h28 l-3 22 a11 8 0 0 1 -22 0Z" fill="#f3e0b8" stroke="#7a4a1c" stroke-width="2"/><path d="M22 32 h4 M30 32 h4 M38 32 h4 M22 38 h4 M30 38 h4 M38 38 h4" stroke="#e8c98a" stroke-width="2"/></svg>',
    cupcake: '<svg viewBox="0 0 64 64" class="bs-art" data-art="treat_cupcake"><path d="M20 34 h24 l-3 18 a9 6 0 0 1 -18 0Z" fill="#f7c9d8" stroke="#8a3a55" stroke-width="2"/><path d="M18 34c4-12 24-12 28 0" fill="#fff6f0" stroke="#8a3a55" stroke-width="2"/><circle cx="32" cy="20" r="5" fill="#e85d6a" stroke="#8a3a55" stroke-width="1.6"/></svg>',
    pie: '<svg viewBox="0 0 64 64" class="bs-art" data-art="treat_pie"><ellipse cx="32" cy="38" rx="22" ry="12" fill="#d9a15a" stroke="#7a4a1c" stroke-width="2"/><path d="M12 36c8-16 32-16 40 0" fill="#c45a2a" stroke="#7a4a1c" stroke-width="2"/><path d="M20 28 32 36 44 28" fill="none" stroke="#f3e0b8" stroke-width="2"/></svg>',
    bread: '<svg viewBox="0 0 64 64" class="bs-art" data-art="treat_bread"><ellipse cx="32" cy="34" rx="22" ry="14" fill="#e8c98a" stroke="#8a5a22" stroke-width="2.2"/><path d="M18 30c4 2 8 2 12 0 M32 28c4 2 8 2 12 0" fill="none" stroke="#c9844a" stroke-width="2"/></svg>',
    pretzel: '<svg viewBox="0 0 64 64" class="bs-art" data-art="treat_pretzel"><path d="M20 40c-8-2-10-16 2-20 8-2 12 4 16 10 4-6 8-12 16-10 12 4 10 18 2 20-6 2-10-2-14-8-4 6-8 10-14 8z" fill="none" stroke="#c9844a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 40c-8-2-10-16 2-20 8-2 12 4 16 10 4-6 8-12 16-10 12 4 10 18 2 20-6 2-10-2-14-8-4 6-8 10-14 8z" fill="none" stroke="#8a5a22" stroke-width="2.2"/></svg>',
    roll: '<svg viewBox="0 0 64 64" class="bs-art" data-art="treat_roll"><circle cx="32" cy="32" r="20" fill="#e8c98a" stroke="#8a5a22" stroke-width="2"/><path d="M32 32c8 0 12-6 10-12-6 2-10 6-10 12 0 8 8 12 14 8" fill="none" stroke="#c45a2a" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="32" r="3" fill="#fff6f0"/></svg>',
    scone: '<svg viewBox="0 0 64 64" class="bs-art" data-art="treat_scone"><path d="M12 42 L32 16 L52 42 Z" fill="#e8c98a" stroke="#8a5a22" stroke-width="2.2"/><path d="M22 36 h8 M28 28 h6" stroke="#c9844a" stroke-width="2" stroke-linecap="round"/></svg>',
    brownie: '<svg viewBox="0 0 64 64" class="bs-art" data-art="treat_brownie"><rect x="14" y="18" width="36" height="30" rx="4" fill="#6b3a22" stroke="#3a2714" stroke-width="2"/><path d="M14 28 h36" stroke="#8a5a22" stroke-width="2"/><circle cx="26" cy="38" r="2" fill="#3a2714"/><circle cx="38" cy="36" r="2" fill="#3a2714"/></svg>',
    tart: '<svg viewBox="0 0 64 64" class="bs-art" data-art="treat_tart"><ellipse cx="32" cy="40" rx="20" ry="10" fill="#e8c98a" stroke="#8a5a22" stroke-width="2"/><path d="M14 38c8-14 28-14 36 0" fill="#e85d6a" stroke="#8a3a55" stroke-width="2"/><circle cx="26" cy="30" r="4" fill="#7ab33a"/><circle cx="38" cy="28" r="4" fill="#e8c44a"/></svg>',
    donut: '<svg viewBox="0 0 64 64" class="bs-art" data-art="treat_donut"><circle cx="32" cy="32" r="20" fill="#e8c98a" stroke="#8a5a22" stroke-width="2"/><circle cx="32" cy="32" r="16" fill="#f7c9d8"/><circle cx="32" cy="32" r="7" fill="#fff6f0" stroke="#8a5a22" stroke-width="2"/></svg>',
    bun: '<svg viewBox="0 0 64 64" class="bs-art" data-art="treat_bun"><ellipse cx="32" cy="36" rx="20" ry="14" fill="#e8c98a" stroke="#8a5a22" stroke-width="2"/><ellipse cx="32" cy="28" rx="14" ry="10" fill="#f3d7a0" stroke="#8a5a22" stroke-width="2"/></svg>'
  };

  var DECO_SVG = {
    cake_stand: '<svg viewBox="0 0 80 80" class="bs-art" data-art="deco_cake_stand"><rect x="20" y="58" width="40" height="6" rx="2" fill="#c9a36a" stroke="#5a3d1c" stroke-width="2"/><rect x="36" y="36" width="8" height="22" fill="#c9a36a" stroke="#5a3d1c" stroke-width="1.6"/><ellipse cx="40" cy="34" rx="22" ry="8" fill="#f3e0b8" stroke="#5a3d1c" stroke-width="2"/><ellipse cx="40" cy="26" rx="12" ry="8" fill="#f7c9d8" stroke="#8a3a55" stroke-width="1.8"/></svg>',
    flower_pot: '<svg viewBox="0 0 80 80" class="bs-art" data-art="deco_flower_pot"><path d="M26 48 h28 l-4 20 h-20Z" fill="#c45a2a" stroke="#5a3d1c" stroke-width="2"/><rect x="24" y="42" width="32" height="8" rx="2" fill="#d97a3a" stroke="#5a3d1c" stroke-width="2"/><circle cx="40" cy="28" r="10" fill="#e85d6a" stroke="#8a3a55" stroke-width="1.8"/><circle cx="32" cy="30" r="6" fill="#f3d15a"/><circle cx="48" cy="30" r="6" fill="#f3d15a"/><rect x="38" y="32" width="4" height="12" fill="#3a7a2a"/></svg>',
    cookie_jar: '<svg viewBox="0 0 80 80" class="bs-art" data-art="deco_cookie_jar"><rect x="24" y="22" width="32" height="8" rx="3" fill="#c9a36a" stroke="#5a3d1c" stroke-width="2"/><path d="M22 30 h36 l-3 36 a15 8 0 0 1 -30 0Z" fill="#c5e8f3" stroke="#5a3d1c" stroke-width="2"/><circle cx="36" cy="46" r="4" fill="#d9a15a"/><circle cx="46" cy="50" r="4" fill="#d9a15a"/></svg>',
    string_lights: '<svg viewBox="0 0 200 40" class="bs-art" data-art="deco_string_lights"><path d="M4 10 Q50 28 100 12 T196 14" fill="none" stroke="#5a3d1c" stroke-width="2"/><circle cx="30" cy="18" r="5" fill="#e85d6a"/><circle cx="70" cy="22" r="5" fill="#f3d15a"/><circle cx="110" cy="14" r="5" fill="#7ab33a"/><circle cx="150" cy="20" r="5" fill="#5aa9f0"/><circle cx="180" cy="16" r="5" fill="#c9b2ff"/></svg>',
    chalkboard: '<svg viewBox="0 0 80 80" class="bs-art" data-art="deco_chalkboard"><rect x="10" y="12" width="60" height="48" rx="4" fill="#2f4a3a" stroke="#c9a36a" stroke-width="4"/><path d="M22 28 h20 M22 38 h28 M22 48 h16" stroke="#e8f3e8" stroke-width="2.4" stroke-linecap="round"/></svg>',
    window_pie: '<svg viewBox="0 0 80 80" class="bs-art" data-art="deco_window_pie"><rect x="12" y="10" width="56" height="56" rx="4" fill="#d6f0ff" stroke="#5a3d1c" stroke-width="3"/><path d="M12 38 h56 M40 10 v56" stroke="#5a3d1c" stroke-width="2"/><ellipse cx="40" cy="50" rx="12" ry="6" fill="#c45a2a" stroke="#7a4a1c" stroke-width="1.6"/></svg>',
    plant: '<svg viewBox="0 0 80 80" class="bs-art" data-art="deco_plant"><path d="M28 58 h24 l-3 14 h-18Z" fill="#c45a2a" stroke="#5a3d1c" stroke-width="2"/><path d="M40 58 C26 40 22 24 32 16 C36 30 36 40 40 58 C44 40 44 28 50 16 C58 28 52 44 40 58Z" fill="#3a7a2a" stroke="#2a5a1c" stroke-width="1.8"/></svg>',
    bunting: '<svg viewBox="0 0 200 36" class="bs-art" data-art="deco_bunting"><path d="M4 6 L196 10" stroke="#5a3d1c" stroke-width="2"/><path d="M16 7 l10 20 10-20Z" fill="#e85d6a"/><path d="M50 8 l10 20 10-20Z" fill="#f3d15a"/><path d="M84 8 l10 20 10-20Z" fill="#7ab33a"/><path d="M118 9 l10 20 10-20Z" fill="#5aa9f0"/><path d="M152 9 l10 20 10-20Z" fill="#c9b2ff"/></svg>',
    shelf_clock: '<svg viewBox="0 0 80 80" class="bs-art" data-art="deco_shelf_clock"><rect x="10" y="60" width="60" height="8" rx="2" fill="#8a5a22"/><circle cx="40" cy="38" r="22" fill="#fffdf6" stroke="#5a3d1c" stroke-width="3"/><line x1="40" y1="38" x2="40" y2="24" stroke="#b63442" stroke-width="3" stroke-linecap="round"/><line x1="40" y1="38" x2="52" y2="38" stroke="#3a2714" stroke-width="2" stroke-linecap="round"/><circle cx="40" cy="38" r="3" fill="#3a2714"/></svg>',
    mixing_bowl: '<svg viewBox="0 0 80 80" class="bs-art" data-art="deco_mixing_bowl"><path d="M16 30 h48 l-6 28 a18 10 0 0 1 -36 0Z" fill="#f4f0ea" stroke="#5a3d1c" stroke-width="2.2"/><path d="M50 18 l8 20" stroke="#c9a36a" stroke-width="3" stroke-linecap="round"/><circle cx="58" cy="16" r="4" fill="#c9a36a" stroke="#5a3d1c" stroke-width="1.4"/></svg>'
  };

  function treat(id, size) {
    size = size || 64;
    var raw = TREAT_SVG[id] || TREAT_SVG.cookie;
    return imgOr('treat_' + id, raw.replace('viewBox', 'width="' + size + '" height="' + size + '" viewBox'), size, size);
  }
  function deco(id, size) {
    size = size || 72;
    var raw = DECO_SVG[id] || DECO_SVG.plant;
    var w = (id === 'bunting' || id === 'string_lights') ? size * 2.4 : size;
    return imgOr('deco_' + id, raw.replace('viewBox', 'width="' + w + '" height="' + size + '" viewBox'), w, size);
  }
  function ovenFrame(clockHtml, opt) {
    opt = opt || {};
    var u = src('oven');
    if (u) return '<div class="bs-oven" data-art="oven"><img class="bs-oven-art" src="' + u + '" alt=""><div class="bs-oven-clock">' + clockHtml + '</div></div>';
    return '<div class="bs-oven" data-art="oven"><div class="bs-oven-body">' +
      '<div class="bs-oven-top"></div><div class="bs-oven-door"><div class="bs-oven-clock">' + clockHtml + '</div></div>' +
      '<div class="bs-oven-knobs"><span></span><span></span><span></span></div>' +
      '</div></div>';
  }

  A.BakeShopArt = {
    NEEDED: NEEDED, SRC: SRC, src: src, CLOCK_SCALE: CLOCK_SCALE,
    clock: clockSvg, treat: treat, deco: deco, oven: ovenFrame,
    treatSvg: TREAT_SVG, decoSvg: DECO_SVG
  };
})(window.Arcade);
