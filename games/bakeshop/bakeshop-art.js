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
  var ANCHORS = {
  "units": "1x stage px (double for -2x)",
  "stage": {
    "landscape": [
      1024,
      640
    ],
    "portrait": [
      400,
      720
    ]
  },
  "notes": "A (mode oven): draw locked oven.png bottom-centred on oven_bottom_center at oven_height px tall (scale = oven_scale_1x); clock_face/hands/hub behind it at clock_center with clock_scale_1x (= oven scale x 0.4253, per the locked anchors). B (mode frame): clock_face straight in the wall frame, centred on clock_center, rim radius clock_outer_r (scale clock_scale_1x); hands/hub same scale. customers = [foot_x, foot_y, height] for waiting customers (contact shadow under feet). Mockup time 3:00.",
  "status": "locked",
  "option": "A",
  "landscape": {
    "mode": "oven",
    "oven_bottom_center": [
      508,
      394
    ],
    "oven_height": 330,
    "customers": [
      [
        700,
        630,
        240
      ],
      [
        880,
        630,
        165
      ]
    ],
    "pickup_counter_top_y": 395,
    "clock_center": [
      507.5,
      237.6
    ],
    "clock_outer_r": 74.8,
    "oven_scale_1x": 0.3503,
    "clock_scale_1x": 0.149
  },
  "portrait": {
    "mode": "oven",
    "oven_bottom_center": [
      200,
      282
    ],
    "oven_height": 232,
    "customers": [
      [
        215,
        600,
        190
      ],
      [
        325,
        606,
        130
      ]
    ],
    "pickup_counter_top_y": 282,
    "clock_center": [
      199.6,
      172.0
    ],
    "clock_outer_r": 52.6,
    "oven_scale_1x": 0.2463,
    "clock_scale_1x": 0.1047
  }
};
  function pack(land) { return ANCHORS[land ? 'landscape' : 'portrait']; }
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

  /* ---- v2 big clock (rework 1122, numerals moved out 1122b) ----
     The locked face keeps its wooden rim and gold ring; the cream dial is redrawn in SVG so the numerals can sit farther out,
     right inside short rim ticks: every numeral's ink starts at least ~60.3 units from the center (layout measured with
     Fredoka bold). Hands are drawn as arrows in the locked hands' colors: minute tip ~55 (about 5 short of the numerals),
     hour tip ~40 (clearly shorter, still pointing plainly at its number). Knobs ride on the hands, far inside the numerals;
     each has a big invisible pad (r HIT units, sized to at least 60px on screen by the game). */
  var KNOB = { hourR: 22, hourVis: 6, minR: 40, minVis: 4.8, hit: 21, numR: 66, numIn: 60.3 };
  var HAND_LEN = { hour: 40, minute: 55 };
  /* numeral n: [text x, text y, font size, letter spacing, ink center x, ink center y] */
  var NUM = { 1: [130.52, 47.64, 16, 0, 133.32, 42.28], 2: [153.42, 71.97, 16, 0, 157.98, 66.53], 3: [160.19, 105.36, 16, 0, 164.75, 100], 4: [153.57, 138.89, 16, 0, 157.81, 133.37],
    5: [129.78, 163.52, 16, 0, 133.62, 158.24], 6: [95.84, 171.38, 16, 0, 100, 166.1], 7: [62.22, 163.68, 16, 0, 66.38, 158.24], 8: [37.87, 138.89, 16, 0, 42.19, 133.37],
    9: [31.49, 105.44, 16, 0, 35.65, 100], 10: [33.77, 70.63, 15, -0.8, 40.42, 65.6], 11: [61.21, 46.61, 15, -0.8, 66.28, 41.59], 12: [93.36, 39.35, 15, -0.8, 100, 34.25] };
  var HUB_IMG = { x: 91.5, s: 17 };
  var HAND_PATH = {
    hour: 'M100 60 L108.5 73 L104.2 72 L104.2 106 Q104.2 109.5 100 109.5 Q95.8 109.5 95.8 106 L95.8 72 L91.5 73 Z',
    minute: 'M100 45 L105.6 57 L102.4 56.2 L102.4 108 Q102.4 111 100 111 Q97.6 111 97.6 108 L97.6 56.2 L94.4 57 Z'
  };
  function numXY(n, r) {
    if (r == null && NUM[n]) return { x: NUM[n][4], y: NUM[n][5] };
    var a = (n % 12) * 30 * Math.PI / 180; r = r || KNOB.numR; return { x: 100 + Math.sin(a) * r, y: 100 - Math.cos(a) * r };
  }
  var DIAL = null;
  function dial() {
    if (DIAL) return DIAL;
    var d = '<circle class="bs-dial" cx="100" cy="100" r="81" fill="url(#bsDialG)"/><g class="bs-tick">', i, a, s1, c1;
    for (i = 0; i < 60; i++) {
      a = i * 6 * Math.PI / 180; s1 = Math.sin(a); c1 = Math.cos(a);
      if (i % 5 === 0) d += '<circle cx="' + (100 + s1 * 79.8).toFixed(2) + '" cy="' + (100 - c1 * 79.8).toFixed(2) + '" r="1.8" fill="#3b2715"/>';
      else d += '<line x1="' + (100 + s1 * 79.2).toFixed(2) + '" y1="' + (100 - c1 * 79.2).toFixed(2) + '" x2="' + (100 + s1 * 81).toFixed(2) + '" y2="' + (100 - c1 * 81).toFixed(2) + '" stroke="#a9835a" stroke-width="1.1" stroke-linecap="round"/>';
    }
    d += '</g><g class="bs-num" font-family="Fredoka Arcade, ui-rounded, system-ui, sans-serif" font-weight="700" fill="#3b2715">';
    for (i = 1; i <= 12; i++) d += '<text x="' + NUM[i][0] + '" y="' + NUM[i][1] + '" font-size="' + NUM[i][2] + '"' + (NUM[i][3] ? ' letter-spacing="' + NUM[i][3] + '"' : '') + '>' + i + '</text>';
    DIAL = d + '</g>';
    return DIAL;
  }
  var GRAD = '<defs><radialGradient id="bsDialG" cx="100" cy="100" r="81" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fffff9"/><stop offset=".25" stop-color="#fffdf1"/>' +
    '<stop offset=".5" stop-color="#fcf2da"/><stop offset=".75" stop-color="#f5e6c4"/><stop offset="1" stop-color="#f2e0b6"/></radialGradient></defs>';
  function bigClock(t, opt) {
    opt = opt || {};
    t = t || { h: 12, m: 0 };
    var ha = A.BakeShop.hourAngle(t), ma = A.BakeShop.minuteAngle(t);
    var knobs = opt.knobs || {}, glow = opt.glow || [], id = opt.id ? ' id="' + opt.id + '"' : '';
    var lab = opt.label ? ' role="img" aria-label="' + opt.label + '"' : ' aria-hidden="true"';
    var face = src('clock_face'), out = '<svg class="bs-big' + (opt.cls ? ' ' + opt.cls : '') + '"' + id + ' viewBox="0 0 200 200"' + lab + '>' + GRAD;
    out += face ? '<image href="' + face + '" x="0" y="0" width="200" height="200"/>'
      : '<circle cx="100" cy="100" r="96" fill="#6b3a22"/><circle cx="100" cy="100" r="84" fill="#fff8e7"/>';
    out += dial();
    glow.forEach(function (n) {
      var c = numXY(n);
      out += '<circle class="bs-glow" data-glow="' + n + '" cx="' + c.x.toFixed(2) + '" cy="' + c.y.toFixed(2) + '" r="10.5"/>';
    });
    out += '<g class="bs-hand-hour" transform="rotate(' + ha + ' 100 100)"><path d="' + HAND_PATH.hour + '" fill="#d0562a" stroke="#5a2410" stroke-width="1.6" stroke-linejoin="round"/></g>';
    out += '<g class="bs-hand-min" transform="rotate(' + ma + ' 100 100)"><path d="' + HAND_PATH.minute + '" fill="#24304f" stroke="#0f1424" stroke-width="1.2" stroke-linejoin="round"/></g>';
    var hub = src('hand_hub');
    out += hub ? '<image class="bs-hub" href="' + hub + '" x="' + HUB_IMG.x + '" y="' + HUB_IMG.x + '" width="' + HUB_IMG.s + '" height="' + HUB_IMG.s + '"/>'
      : '<circle class="bs-hub" cx="100" cy="100" r="7" fill="#3a2714"/>';
    if (knobs.hour) {
      out += '<g class="bs-knob-g" transform="rotate(' + ha + ' 100 100)">' +
        '<circle class="bs-pad" data-hand="hour" cx="100" cy="' + (100 - KNOB.hourR) + '" r="' + KNOB.hit + '"/>' +
        '<circle class="bs-knob bs-knob-hour' + (opt.active === 'hour' ? ' on' : '') + '" data-knob="hour" cx="100" cy="' + (100 - KNOB.hourR) + '" r="' + KNOB.hourVis + '"/></g>';
    }
    if (knobs.minute) {
      out += '<g class="bs-knob-g" transform="rotate(' + ma + ' 100 100)">' +
        '<circle class="bs-pad" data-hand="minute" cx="100" cy="' + (100 - KNOB.minR) + '" r="' + KNOB.hit + '"/>' +
        '<circle class="bs-knob bs-knob-min' + (opt.active === 'minute' ? ' on' : '') + '" data-knob="minute" cx="100" cy="' + (100 - KNOB.minR) + '" r="' + KNOB.minVis + '"/></g>';
    }
    return out + '</svg>';
  }
  /* Celebration cake: one layer per mastered clock level (4 total). Empty layers are dashed outlines. */
  function cake(layers, size) {
    size = size || 64; layers = Math.max(0, Math.min(4, layers || 0));
    var cols = ['#f7c9d8', '#fde3a7', '#c9e8d0', '#d9cdf5'], out = '<svg class="bs-cake" viewBox="0 0 100 100" width="' + size + '" height="' + size + '" aria-hidden="true">';
    out += '<ellipse cx="50" cy="92" rx="42" ry="6" fill="#e6d2b0"/><rect x="10" y="86" width="80" height="6" rx="3" fill="#fffdf6" stroke="#5a3d1c" stroke-width="2"/>';
    for (var i = 0; i < 4; i++) {
      var w = 72 - i * 12, x = 50 - w / 2, y = 70 - i * 16, on = i < layers;
      out += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="16" rx="5" fill="' + (on ? cols[i] : 'none') + '" stroke="' + (on ? '#5a3d1c' : '#b9a27e') + '" stroke-width="2"' + (on ? '' : ' stroke-dasharray="4 3"') + '/>';
      if (on) out += '<path d="M' + (x + 3) + ' ' + (y + 4) + ' q' + (w / 8) + ' 6 ' + (w / 4) + ' 0 t' + (w / 4) + ' 0 t' + (w / 4) + ' 0 t' + (w / 4 - 6) + ' 0" fill="none" stroke="#fffdf6" stroke-width="2.4" stroke-linecap="round"/>';
    }
    if (layers > 0) {
      /* kawaii face on the bottom layer, a cherry once finished */
      out += '<circle cx="42" cy="78" r="2.2" fill="#3a2714"/><circle cx="58" cy="78" r="2.2" fill="#3a2714"/><path d="M46 81 q4 3.5 8 0" fill="none" stroke="#3a2714" stroke-width="1.8" stroke-linecap="round"/>' +
        '<ellipse cx="36" cy="81" rx="3" ry="1.8" fill="#f29bb0" opacity=".8"/><ellipse cx="64" cy="81" rx="3" ry="1.8" fill="#f29bb0" opacity=".8"/>';
    }
    if (layers >= 4) out += '<circle cx="50" cy="14" r="5.5" fill="#e0384f" stroke="#5a3d1c" stroke-width="1.6"/><path d="M50 9 q3 -6 8 -6" fill="none" stroke="#3a7a3a" stroke-width="1.8"/>';
    return out + '</svg>';
  }
  function treatSrc(id) {
    var T = A.BakeShop.TREAT_BY[id];
    if (T && T.art) return A.ROOT + T.art;
    return A.ROOT + 'assets/picnic/friends/' + id + '/happy_256.webp';
  }

  A.BakeShopArt = {
    NEEDED: NEEDED, SRC: SRC, src: src, CLOCK_SCALE: CLOCK_SCALE, ANCHORS: ANCHORS, pack: pack,
    clock: clockSvg, treat: treat, deco: deco, oven: ovenFrame,
    treatSvg: TREAT_SVG, decoSvg: DECO_SVG,
    bigClock: bigClock, cake: cake, treatSrc: treatSrc, KNOB: KNOB, HAND_LEN: HAND_LEN, NUM: NUM, numXY: numXY
  };
})(window.Arcade);
