/* Fix-It Shop art (1124): the locked painted art in games/fixit/art/ (webp, exported by _design/fixit/export_art1124.py).
   Jobs: one 400x300 SVG scene per job (the PNGs are 800x600 = 2x) with the broken and fixed pictures stacked in place
   (.fx-broken / .fx-fixed cross-fade), so tap math stays in scene units. Sparkles, the pointing hand and the tool doing
   its job are drawn into the scene's .fx-fx layer. Tools, birdhouse stages and cards use plain <img>.
   The old hand-drawn SVG set is kept in _design/fixit/old-1123/ for reference. */
(function (A) {
  'use strict';
  var INK = '#4a3424';
  var BASE = (A.ROOT || '../../') + 'games/fixit/art/';
  function url(p) { return BASE + p; }
  var TOOL_IDS = ['hammer', 'screwdriver', 'paintbrush', 'wrench', 'glue', 'sandpaper', 'saw', 'tape'];

  /* a toolbox icon (an <img>; size in CSS px when given) */
  function tool(id, size, cls) {
    return '<img class="fx-tsvg fx-timg ' + (cls || '') + '" src="' + url('toolbox/' + id + '.webp') + '" alt=""' +
      (size ? ' width="' + size + '" height="' + size + '"' : '') + ' draggable="false">';
  }
  /* the same icon inside an SVG (the tool doing its job in the scene), centred on 0,0 */
  function toolImage(id, s) {
    s = s || 96;
    return '<image href="' + url('toolbox/' + id + '.webp') + '" x="' + (-s / 2) + '" y="' + (-s / 2) + '" width="' + s + '" height="' + s + '"/>';
  }

  /* one job scene: broken and fixed pictures share one frame */
  function scene(jobId, opt) {
    opt = opt || {};
    return '<svg class="fx-scene-svg' + (opt.cls ? ' ' + opt.cls : '') + '"' + (opt.id ? ' id="' + opt.id + '"' : '') +
      ' viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + (opt.label || '') + '">' +
      '<g class="fx-obj"><image class="fx-broken" href="' + url('jobs/' + jobId + '_broken.webp') + '" x="0" y="0" width="400" height="300"/>' +
      '<image class="fx-fixed" href="' + url('jobs/' + jobId + '_fixed.webp') + '" x="0" y="0" width="400" height="300"/></g>' +
      '<g class="fx-fx"></g></svg>';
  }
  function jobSrc(jobId, state) { return url('jobs/' + jobId + '_' + (state || 'broken') + '.webp'); }

  /* sparkle: a soft ring round the part plus three twinkling glossy sparkles */
  function sp(x, y, s, cls) {
    return '<g transform="translate(' + x + ' ' + y + ')"><image class="' + cls + '" href="' + url('ui/sparkle_128.webp') + '" x="' + (-s / 2) + '" y="' + (-s / 2) + '" width="' + s + '" height="' + s + '"/></g>';
  }
  function sparkle(x, y, r) {
    var R = Math.max(30, Math.min(r || 40, 46));
    return '<g class="fx-spark" transform="translate(' + x + ' ' + y + ')">' +
      '<circle r="' + R + '" fill="#fff6a8" opacity=".45" class="fx-ring"/>' +
      '<circle r="' + R + '" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="7 6" opacity=".9"/>' +
      sp(-R + 2, -R + 6, 30, 'fx-tw1') + sp(R - 2, -R + 14, 22, 'fx-tw2') + sp(R - 6, R - 4, 26, 'fx-tw3') + '</g>';
  }
  /* the house pointing hand, fingertip at (x, y). fromRight: the hand comes in from the right.
     up: the hand is below the part, pointing up (for parts near the top of the scene). Fingertip in the 90px image:
     pointing_hand (18, 86), mirror (72, 86). */
  function pointer(x, y, fromRight, up) {
    var S = 90, tx = fromRight ? 18 : 72, ty = 86;
    var img = '<image href="' + url(fromRight ? 'ui/pointing_hand.webp' : 'ui/pointing_hand_mirror.webp') + '" x="' + (-tx) + '" y="' + (-ty) + '" width="' + S + '" height="' + S + '"/>';
    return '<g class="fx-point" transform="translate(' + x + ' ' + y + ')' + (up ? ' rotate(180)' : '') + '"><g class="fx-point-b">' + img + '</g></g>';
  }
  function star4(x, y, s, cls) { return '<path class="' + (cls || '') + '" transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')" d="M0 -16 Q3 -3 16 0 Q3 3 0 16 Q-3 3 -16 0 Q-3 -3 0 -16Z" fill="#ffe14d" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>'; }
  /* the fix burst: glossy sparkles flying out */
  function burst(x, y) {
    var s = '<g transform="translate(' + x + ' ' + y + ')"><g class="fx-burst">';
    for (var i = 0; i < 8; i++) {
      var a = i * 45 * Math.PI / 180, d = 48, z = i % 2 ? 24 : 34;
      s += '<image href="' + url('ui/sparkle_128.webp') + '" x="' + (Math.cos(a) * d - z / 2).toFixed(1) + '" y="' + (Math.sin(a) * d - z / 2).toFixed(1) + '" width="' + z + '" height="' + z + '"/>';
    }
    return s + '</g></g>';
  }
  /* a wrong tool leaves a little silly mark: pink paint, a glue blob, or bonk lines */
  function smear(kind, x, y) {
    if (kind === 'paintbrush') return '<path class="fx-smear" d="M' + (x - 34) + ' ' + (y - 6) + ' Q' + (x - 10) + ' ' + (y - 22) + ' ' + (x + 30) + ' ' + (y - 10) + ' Q' + (x + 40) + ' ' + (y + 6) + ' ' + (x + 20) + ' ' + (y + 14) + ' Q' + (x - 14) + ' ' + (y + 22) + ' ' + (x - 34) + ' ' + (y - 6) + 'Z" fill="#ff7fa6" stroke="' + INK + '" stroke-width="2.5" opacity=".9"/>';
    if (kind === 'glue') return '<g class="fx-smear"><path d="M' + (x - 22) + ' ' + y + ' Q' + (x - 20) + ' ' + (y - 22) + ' ' + x + ' ' + (y - 20) + ' Q' + (x + 24) + ' ' + (y - 18) + ' ' + (x + 20) + ' ' + (y + 4) + ' Q' + (x + 18) + ' ' + (y + 24) + ' ' + x + ' ' + (y + 18) + ' Q' + (x - 24) + ' ' + (y + 20) + ' ' + (x - 22) + ' ' + y + 'Z" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/><circle cx="' + (x - 6) + '" cy="' + (y - 8) + '" r="4" fill="#e8f2ff"/></g>';
    return '<g class="fx-smear fx-puff" stroke="' + INK + '" stroke-width="4" stroke-linecap="round" fill="none"><path d="M' + (x - 40) + ' ' + (y - 30) + ' l-12 -10 M' + (x + 40) + ' ' + (y - 30) + ' l12 -10 M' + (x - 44) + ' ' + (y + 10) + ' l-14 2 M' + (x + 44) + ' ' + (y + 10) + ' l14 2"/></g>';
  }

  /* birdhouse project: 5 stages share one 600x800 frame (base and post never move). Stage 0 shows the finished one as a faint ghost.
     opt.small: the 120px file (meter); opt.hero: the finished one with flowers (win card). */
  var BH = ['stage1_base', 'stage2_walls', 'stage3_roof', 'stage4_paint', 'stage5_perch'];
  function birdhouse(stage, opt) {
    opt = opt || {};
    var n = opt.hero ? 'hero' : stage < 1 ? 'stage5_perch' : BH[Math.min(5, stage) - 1];
    return '<img class="fx-bh' + (stage < 1 && !opt.hero ? ' ghost' : '') + (opt.cls ? ' ' + opt.cls : '') + '" src="' + url('birdhouse/' + n + (opt.small ? '_sm' : '') + '.webp') + '" alt="" draggable="false">';
  }

  /* the hub tile picture: hammer, screwdriver and a birdhouse */
  function tile() {
    return '<img class="fxt-h" src="' + url('toolbox/hammer.webp') + '" alt=""><img class="fxt-s" src="' + url('toolbox/screwdriver.webp') + '" alt="">' +
      '<img class="fxt-b" src="' + url('birdhouse/stage4_paint_sm.webp') + '" alt="">';
  }

  A.FixItArt = { tool: tool, toolImage: toolImage, TOOL_IDS: TOOL_IDS, scene: scene, jobSrc: jobSrc, sparkle: sparkle, pointer: pointer, burst: burst,
    smear: smear, birdhouse: birdhouse, tile: tile, star4: star4, INK: INK, url: url, BASE: BASE };
})(window.Arcade = window.Arcade || {});
