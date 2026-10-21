/* Blob Room — original SVG art for every shop item. ART[id] = [W, H, inner svg] in a W×H box whose bottom-centre
   stands on the floor (floor items), lies flat (rugs) or hangs (wall items). Wallpapers and floors are styles in room.js. */
(function (A) {
  'use strict';
  var K = '#4a3b6b', O = ' stroke="' + K + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
  function r(x, y, w, h, rx, fill, ex) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + fill + '"' + (ex === 0 ? '' : O) + (ex || '') + '/>'; }
  function c(x, y, rr, fill, ex) { return '<circle cx="' + x + '" cy="' + y + '" r="' + rr + '" fill="' + fill + '"' + (ex === 0 ? '' : O) + (ex || '') + '/>'; }
  function e(x, y, rx, ry, fill, ex) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '"' + (ex === 0 ? '' : O) + (ex || '') + '/>'; }
  function p(d, fill, ex) { return '<path d="' + d + '" fill="' + (fill || 'none') + '"' + (ex === 0 ? '' : O) + (ex || '') + '/>'; }
  function star(cx, cy, R, fill, ex) { var pts = []; for (var i = 0; i < 10; i++) { var a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? R * .45 : R; pts.push((cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1)); } return p('M' + pts.join('L') + 'Z', fill, ex); }
  function sh(w, h) { return e(w / 2, h - 5, w * .42, 6, '#4a3b6b', 0).replace('/>', ' opacity=".14"/>'); }
  function beanbag(col, dk) { return sh(110, 90) + p('M14 80 C4 50 30 22 56 24 C84 26 106 48 98 80 Z', col) + p('M30 52 Q50 40 74 46', 'none', ' stroke="' + dk + '" stroke-width="3" stroke-linecap="round"') + e(38, 40, 10, 5, '#fff', 0).replace('/>', ' opacity=".55"/>'); }
  function book(x, y, h, col) { return r(x, y - h, 9, h, 2, col, ' stroke="' + K + '" stroke-width="2"'); }
  var ART = {
    bed_simple: [200, 130, sh(200, 130) + r(8, 18, 34, 104, 12, '#c98b5e') + r(8, 82, 186, 38, 10, '#e0a878') + r(36, 64, 156, 26, 12, '#fff') +
      r(86, 58, 106, 36, 12, '#9fd2ff') + p('M104 60 V92 M128 60 V92 M152 60 V92 M176 60 V92', 'none', ' stroke="#fff" stroke-width="4"') + e(66, 62, 24, 12, '#ffe0ec') + r(14, 118, 12, 10, 3, K, 0) + r(176, 118, 12, 10, 3, K, 0)],
    bed_cloud: [210, 140, sh(210, 140) + p('M14 120 C2 110 8 86 28 88 C26 62 60 56 70 74 C78 52 116 52 122 74 C134 56 170 60 168 86 C192 82 206 106 192 122 Z', '#fff') +
      r(40, 78, 140, 30, 14, '#cdb0ff') + star(70, 92, 7, '#ffe68a', 0) + star(110, 96, 6, '#ffe68a', 0) + star(150, 90, 7, '#ffe68a', 0) + e(46, 76, 22, 11, '#ffeef5') + c(24, 70, 4, '#ffe68a', 0) + c(186, 66, 3, '#ffe68a', 0)],
    sofa: [200, 120, sh(200, 120) + r(22, 20, 156, 60, 22, '#ff9fbe') + r(8, 54, 40, 56, 16, '#ff86ad') + r(152, 54, 40, 56, 16, '#ff86ad') + r(40, 64, 60, 34, 12, '#ffc3d6') + r(100, 64, 60, 34, 12, '#ffc3d6') +
      r(36, 96, 128, 16, 6, '#ff86ad') + r(22, 110, 10, 8, 2, K, 0) + r(168, 110, 10, 8, 2, K, 0) + c(140, 44, 6, '#ffe68a', 0) + c(60, 44, 6, '#fff', 0)],
    beanbag_pink: [110, 90, beanbag('#ffb3cf', '#f47aa6')], beanbag_blue: [110, 90, beanbag('#b3d9ff', '#5d9fe0')],
    chair: [80, 110, sh(80, 110) + r(14, 10, 52, 50, 12, '#ffd23c') + r(10, 56, 60, 14, 6, '#ffc21a') + p('M16 70 L12 104 M64 70 L68 104 M30 70 L30 98 M50 70 L50 98', 'none') + c(40, 34, 8, '#fff', 0)],
    tent: [180, 170, sh(180, 170) + p('M90 8 L10 160 H170 Z', '#ffe0b3') + p('M90 8 L50 160 H130 Z', '#ff9fbe') + p('M90 60 L66 160 H114 Z', '#7a5c9a') + p('M90 8 V-2 L110 6 L90 12', '#62d4a5') +
      p('M30 120 L150 120', 'none', ' stroke="#fff" stroke-width="5" stroke-dasharray="10 8"') + star(90, 104, 7, '#ffe68a', 0)],
    table_round: [120, 90, sh(120, 90) + e(60, 34, 54, 14, '#e0a878') + r(52, 40, 16, 40, 4, '#c98b5e') + e(60, 82, 26, 6, '#c98b5e') + r(46, 14, 18, 18, 5, '#fff') + p('M64 20 Q74 22 64 28', 'none') + c(84, 24, 7, '#ff9fbe')],
    desk: [150, 110, sh(150, 110) + r(6, 36, 138, 14, 5, '#e0a878') + r(96, 50, 42, 54, 6, '#f0c49a') + p('M104 66 H130 M104 84 H130', 'none') + p('M14 50 L14 104', 'none', O) +
      r(22, 16, 30, 20, 3, '#9fd2ff') + r(30, 8, 14, 8, 2, '#fff') + p('M70 36 L74 6 L90 2', 'none') + e(92, 4, 10, 6, '#ffd23c')],
    bookshelf: [130, 170, sh(130, 170) + r(8, 6, 114, 158, 8, '#c98b5e') + r(16, 14, 98, 142, 4, '#a8743a', 0) + p('M16 60 H114 M16 108 H114', 'none') +
      book(22, 58, 38, '#ff8fb1') + book(33, 58, 32, '#5aa9f0') + book(44, 58, 40, '#ffd23c') + book(58, 58, 30, '#62d4a5') + book(84, 58, 36, '#cdb0ff') +
      book(22, 106, 34, '#62d4a5') + book(36, 106, 40, '#ff8a5a') + c(80, 92, 12, '#9fd2ff') + book(98, 106, 30, '#ff8fb1') +
      book(26, 154, 36, '#5aa9f0') + book(40, 154, 30, '#ffd23c') + r(64, 128, 36, 26, 5, '#ff9fbe')],
    dresser: [130, 120, sh(130, 120) + r(10, 34, 110, 78, 10, '#cdb0ff') + p('M10 60 H120 M10 86 H120', 'none') + c(65, 47, 4, '#ffd23c') + c(65, 73, 4, '#ffd23c') + c(65, 99, 4, '#ffd23c') +
      r(22, 18, 22, 16, 4, '#e0a878') + p('M33 18 C26 4 40 0 33 -6 M33 18 C42 6 50 10 46 2', 'none', ' stroke="#43b98a" stroke-width="4" stroke-linecap="round"') + r(80, 14, 26, 20, 4, '#fff')],
    toyshelf: [140, 130, sh(140, 130) + r(8, 10, 124, 114, 8, '#9fd2ff') + p('M70 10 V124 M8 66 H132', 'none') + c(38, 46, 14, '#ff5a6e') + p('M26 42 Q38 50 50 42', 'none', ' stroke="#fff" stroke-width="3"') +
      r(84, 32, 26, 26, 4, '#ffd23c') + '<text x="97" y="52" font-size="18" text-anchor="middle" font-family="sans-serif" font-weight="700" fill="' + K + '">A</text>' +
      e(40, 104, 18, 12, '#ffd23c') + c(50, 90, 8, '#ffd23c') + p('M56 90 L64 92', 'none') + r(84, 84, 34, 24, 10, '#62d4a5')],
    snackcart: [140, 140, sh(140, 140) + r(16, 60, 108, 60, 8, '#fff4e6') + p('M8 44 H132 L124 22 H16 Z', '#ff8fb1') + p('M30 22 L26 44 M52 22 L50 44 M74 22 V44 M96 22 L98 44 M118 22 L120 44', 'none', ' stroke="#fff" stroke-width="5"') +
      p('M24 44 V60 M116 44 V60', 'none') + e(46, 58, 14, 9, '#fff') + e(74, 58, 14, 9, '#ffe8c8') + e(102, 58, 14, 9, '#fff') + c(36, 124, 10, '#a8743a') + c(104, 124, 10, '#a8743a') + p('M40 88 H100', 'none', ' stroke="#ff8fb1" stroke-width="5"')],
    fishtank: [150, 140, sh(150, 140) + r(12, 92, 126, 42, 6, '#a8743a') + r(8, 14, 134, 80, 10, '#bfe8ff', ' fill-opacity=".9"') + p('M10 34 Q40 28 75 34 T140 34', 'none', ' stroke="#fff" stroke-width="3"') +
      p('M30 92 C26 72 36 62 30 50 M40 92 C44 76 36 70 42 58', 'none', ' stroke="#43b98a" stroke-width="5" stroke-linecap="round"') + p('M70 60 Q84 48 96 60 Q84 72 70 60 Z M96 60 L106 52 V68 Z', '#ff8a5a') + c(80, 58, 2, K, 0) +
      p('M104 78 Q112 72 120 78 Q112 84 104 78 Z M120 78 L126 74 V82 Z', '#ffd23c') + c(116, 40, 4, '#fff', 0) + c(122, 28, 3, '#fff', 0) + r(8, 86, 134, 8, 3, '#f2d6a2')],
    globe: [70, 110, sh(70, 110) + p('M14 50 A24 24 0 0 0 60 64', 'none') + c(35, 42, 24, '#78b8f5') + p('M22 34 Q30 24 38 32 Q34 42 24 42 Z M40 50 Q50 44 54 54 Q46 62 40 56 Z', '#62d4a5', ' stroke="' + K + '" stroke-width="2"') + p('M35 66 V96', 'none') + e(35, 100, 20, 6, '#e0a878')],
    piano: [140, 110, sh(140, 110) + r(6, 20, 128, 54, 10, '#ff5a6e') + r(14, 50, 112, 22, 3, '#fff') + p('M28 50 V72 M42 50 V72 M56 50 V72 M70 50 V72 M84 50 V72 M98 50 V72 M112 50 V72', 'none', ' stroke="' + K + '" stroke-width="2"') +
      r(24, 50, 8, 12, 1, K, 0) + r(38, 50, 8, 12, 1, K, 0) + r(66, 50, 8, 12, 1, K, 0) + r(80, 50, 8, 12, 1, K, 0) + r(94, 50, 8, 12, 1, K, 0) + p('M20 74 V104 M120 74 V104', 'none') + p('M54 34 Q60 26 66 34 M76 30 V22', 'none', ' stroke="#fff" stroke-width="3"')],
    plant_tall: [90, 140, sh(90, 140) + p('M45 98 C20 90 4 60 14 40 C30 54 40 70 45 98 Z', '#62d4a5') + p('M45 98 C70 90 88 58 76 36 C60 52 50 70 45 98 Z', '#4fc47e') + p('M45 98 C38 70 40 34 46 10 C56 34 54 70 45 98 Z', '#8fe3b0') +
      p('M24 96 H66 L60 134 H30 Z', '#ff8a5a') + p('M22 96 H68', 'none')],
    plant_cactus: [60, 100, sh(60, 100) + p('M22 70 V30 C22 14 38 14 38 30 V70 Z', '#62d4a5') + p('M22 50 H14 V36 M38 44 H46 V30', 'none', ' stroke="' + K + '" stroke-width="3"') + c(30, 14, 5, '#ff8fb1') + p('M12 70 H48 L44 96 H16 Z', '#ffd23c')],
    plant_flower: [60, 90, sh(60, 90) + p('M30 60 V30 M30 52 Q18 40 14 30 M30 48 Q42 38 46 26', 'none', ' stroke="#43b98a" stroke-width="3"') + c(30, 24, 8, '#ff8fb1') + c(30, 24, 3, '#ffd23c', 0) + c(14, 26, 7, '#cdb0ff') + c(46, 22, 7, '#ffd23c') + p('M14 60 H46 L42 86 H18 Z', '#5aa9f0')],
    plant_tree: [120, 180, sh(120, 180) + p('M54 140 V90 M66 140 V96', 'none', ' stroke="#a8743a" stroke-width="10"') + c(60, 62, 46, '#62d4a5') + c(36, 80, 26, '#4fc47e') + c(86, 80, 24, '#4fc47e') +
      c(46, 50, 6, '#ff5a6e') + c(78, 60, 6, '#ff5a6e') + c(62, 86, 6, '#ff5a6e') + p('M34 140 H86 L80 176 H40 Z', '#e0a878')],
    lamp_floor: [70, 170, sh(70, 170) + p('M35 60 V158', 'none', ' stroke="' + K + '" stroke-width="5"') + e(35, 160, 22, 6, '#c98b5e') + p('M12 60 L22 14 H48 L58 60 Z', '#ffe68a') + p('M22 40 H48', 'none', ' stroke="#ffc93c" stroke-width="3"')],
    lamp_star: [70, 150, sh(70, 150) + p('M35 70 V138', 'none', ' stroke="' + K + '" stroke-width="5"') + e(35, 140, 20, 6, '#9f78f0') + star(35, 40, 30, '#fff3a0') + c(35, 40, 6, '#fff', 0)],
    lamp_mushroom: [80, 100, sh(80, 100) + p('M30 58 V92 H50 V58', '#fff4e6') + p('M6 60 C6 20 74 20 74 60 Z', '#ff8fb1') + c(26, 40, 6, '#fff', 0) + c(48, 32, 5, '#fff', 0) + c(58, 48, 4, '#fff', 0)],
    toybox: [120, 100, sh(120, 100) + p('M20 40 L28 20 L40 38', '#ffd23c') + c(76, 30, 14, '#5aa9f0') + r(8, 40, 104, 56, 8, '#ff8a5a') + r(4, 34, 112, 14, 6, '#ff5a6e') + star(60, 70, 12, '#ffe68a')],
    blocks: [70, 110, sh(70, 110) + r(8, 72, 30, 30, 4, '#ff8fb1') + r(38, 72, 26, 30, 4, '#5aa9f0') + r(20, 44, 30, 28, 4, '#ffd23c') + r(26, 14, 24, 30, 4, '#62d4a5') +
      '<g font-family="sans-serif" font-weight="700" font-size="16" text-anchor="middle" fill="' + K + '"><text x="23" y="93">1</text><text x="51" y="93">2</text><text x="35" y="64">3</text><text x="38" y="35">★</text></g>'],
    train: [130, 80, sh(130, 80) + r(70, 24, 52, 40, 6, '#ff5a6e') + r(96, 10, 22, 20, 3, '#ff5a6e') + r(102, 2, 10, 10, 2, K, 0) + r(8, 34, 52, 30, 6, '#5aa9f0') + p('M60 52 H70', 'none') +
      c(22, 66, 8, '#ffd23c') + c(46, 66, 8, '#ffd23c') + c(84, 66, 9, '#ffd23c') + c(110, 66, 9, '#ffd23c') + c(112, -6, 6, '#fff', ' stroke="#ccc" stroke-width="2"') + r(76, 30, 14, 12, 2, '#fff')],
    drum: [80, 80, sh(80, 80) + r(10, 26, 60, 46, 4, '#ff5a6e') + e(40, 26, 30, 9, '#fff4e6') + p('M10 40 L25 64 L40 40 L55 64 L70 40', 'none', ' stroke="#ffd23c" stroke-width="4"') + p('M50 18 L74 0 M60 22 L78 8', 'none', ' stroke="#a8743a" stroke-width="5"')],
    rocket: [80, 150, sh(80, 150) + p('M40 6 C62 30 62 90 56 120 H24 C18 90 18 30 40 6 Z', '#fff') + p('M40 6 C50 16 54 26 56 34 H24 C26 26 30 16 40 6 Z', '#ff5a6e') + c(40, 60, 11, '#9fd2ff') +
      p('M24 96 L8 128 L24 120 Z M56 96 L72 128 L56 120 Z', '#ff5a6e') + p('M30 122 Q40 146 50 122 Z', '#ffd23c')],
    plush_bunny: [70, 100, sh(70, 100) + e(26, 22, 7, 20, '#fff') + e(44, 22, 7, 20, '#fff') + e(26, 24, 3, 12, '#ffc3d6', 0) + e(44, 24, 3, 12, '#ffc3d6', 0) + c(35, 54, 20, '#fff') + e(35, 84, 24, 16, '#fff') +
      c(28, 52, 2.5, K, 0) + c(42, 52, 2.5, K, 0) + p('M32 60 Q35 63 38 60', 'none', ' stroke="' + K + '" stroke-width="2"') + c(24, 58, 3, '#ffb3cf', 0) + c(46, 58, 3, '#ffb3cf', 0)],
    easel: [100, 160, sh(100, 160) + p('M50 10 L20 154 M50 10 L80 154 M50 10 V150', 'none', ' stroke="#a8743a" stroke-width="6"') + r(14, 24, 72, 62, 4, '#fff') + p('M22 74 A28 28 0 0 1 78 74', 'none', ' stroke="#ff5a6e" stroke-width="6"') +
      p('M30 74 A20 20 0 0 1 70 74', 'none', ' stroke="#ffd23c" stroke-width="6"') + p('M38 74 A12 12 0 0 1 62 74', 'none', ' stroke="#5aa9f0" stroke-width="6"') + r(18, 86, 64, 8, 3, '#c98b5e')],
    telescope: [100, 150, sh(100, 150) + p('M50 80 L22 146 M50 80 L78 146 M50 80 V146', 'none', ' stroke="' + K + '" stroke-width="4"') + p('M14 72 L80 22 L90 36 L24 86 Z', '#9f78f0') + r(78, 14, 16, 30, 5, '#ffd23c', ' transform="rotate(-37 86 29)"') + star(20, 20, 8, '#ffe68a', 0)],
    soccergoal: [170, 120, sh(170, 120) + p('M14 114 V14 H156 V114', 'none', ' stroke="#fff" stroke-width="8" stroke-linejoin="round"') + p('M14 114 V14 H156 V114', 'none', ' stroke="' + K + '" stroke-width="2"') +
      p('M34 18 V110 M58 18 V110 M82 18 V110 M106 18 V110 M130 18 V110 M18 36 H152 M18 58 H152 M18 80 H152 M18 100 H152', 'none', ' stroke="#ffffff" stroke-width="2" opacity=".8"')],
    soccerball: [46, 46, sh(46, 46) + c(23, 22, 19, '#fff') + p('M23 13 L31 19 L28 28 H18 L15 19 Z', K, 0)],
    batrack: [100, 140, sh(100, 140) + r(10, 70, 80, 64, 6, '#c98b5e') + p('M30 74 L22 8 M48 74 L52 6', 'none', ' stroke="#e0a868" stroke-width="10" stroke-linecap="round"') + p('M30 74 L22 8 M48 74 L52 6', 'none', ' stroke="' + K + '" stroke-width="2"') +
      p('M62 36 C62 18 90 18 90 36 C90 50 80 58 70 56 C62 54 62 46 62 36 Z', '#d9894a') + c(76, 100, 10, '#fff') + p('M70 94 Q74 100 70 106 M82 94 Q78 100 82 106', 'none', ' stroke="#ff5a6e" stroke-width="2"')],
    hoop: [100, 170, sh(100, 170) + p('M50 60 V164', 'none', ' stroke="' + K + '" stroke-width="6"') + e(50, 164, 24, 6, '#5aa9f0') + r(14, 8, 72, 50, 6, '#fff') + r(36, 24, 28, 22, 2, 'none', ' stroke="#ff5a6e" stroke-width="3"') +
      e(50, 58, 20, 5, 'none', ' stroke="#ff8a2a" stroke-width="4"') + p('M32 60 L40 84 H60 L68 60 M40 60 L46 84 M60 60 L54 84', 'none', ' stroke="#fff" stroke-width="2"') + c(82, 104, 12, '#ff8a2a')],
    trophy_story: [90, 130, sh(90, 130) + r(18, 100, 54, 24, 4, '#a8743a') + p('M45 74 V100', 'none', ' stroke="#e5ab1f" stroke-width="8"') + p('M18 14 H72 C72 50 62 74 45 74 C28 74 18 50 18 14 Z', '#ffd23c') +
      p('M18 22 C2 22 4 50 22 50 M72 22 C88 22 86 50 68 50', 'none') + star(45, 40, 12, '#fff8d0', 0) + r(28, 106, 34, 10, 2, '#ffe68a', 0)],
    bat_gold: [90, 140, sh(90, 140) + r(14, 112, 62, 22, 5, '#7a5c9a') + p('M40 112 L56 10', 'none', ' stroke="#ffd23c" stroke-width="14" stroke-linecap="round"') + p('M40 112 L56 10', 'none', ' stroke="' + K + '" stroke-width="2"') + star(70, 30, 8, '#fff3a0', 0) + star(24, 50, 6, '#fff3a0', 0)],
    plush_grumbly: [90, 90, sh(90, 90) + p('M18 80 C2 80 2 56 16 52 C14 34 34 26 42 38 C48 20 74 22 76 42 C90 42 92 66 80 76 C76 84 26 84 18 80 Z', '#d8c8ff', ' stroke="#9b86d6" stroke-width="3"') +
      p('M34 56 Q38 60 42 56 M54 56 Q58 60 62 56', 'none', ' stroke="#5b4a85" stroke-width="3"') + p('M44 66 Q48 69 52 66', 'none', ' stroke="#5b4a85" stroke-width="2.5"') + c(28, 62, 4, '#ffb3cf', 0) + c(68, 62, 4, '#ffb3cf', 0)],
    // rugs (flat, seen in perspective)
    rug_round: [230, 80, e(115, 40, 110, 36, '#ffb3cf') + e(115, 40, 82, 26, '#ffd6e3', 0) + e(115, 40, 50, 15, '#ffb3cf', 0)],
    rug_rainbow: [250, 90, e(125, 45, 120, 40, '#ff8fb1') + e(125, 45, 100, 32, '#ffd23c', 0) + e(125, 45, 80, 25, '#8fe3b0', 0) + e(125, 45, 60, 18, '#9fd2ff', 0) + e(125, 45, 40, 11, '#cdb0ff', 0)],
    rug_star: [230, 80, e(115, 40, 110, 36, '#7a5c9a') + '<g transform="translate(115 40) scale(1 .34)">' + star(0, 0, 80, '#ffe68a', 0) + '</g>' + c(30, 36, 3, '#fff', 0) + c(196, 44, 3, '#fff', 0) + c(70, 62, 2, '#fff', 0)],
    rug_diamond: [230, 80, e(115, 40, 110, 36, '#8fdc9e') + p('M115 12 L190 40 L115 68 L40 40 Z', '#f2d6a2', ' stroke="#fff" stroke-width="3"') + p('M115 30 L140 40 L115 50 L90 40 Z', '#8fdc9e', 0) + r(110, 60, 10, 6, 1, '#fff', 0)],
    rug_sticker: [240, 84, e(120, 42, 114, 38, '#fff4e6') + c(60, 36, 12, '#ff8fb1', 0) + c(100, 58, 10, '#ffd23c', 0) + c(150, 30, 12, '#9fd2ff', 0) + c(186, 52, 10, '#8fe3b0', 0) + c(120, 26, 8, '#cdb0ff', 0) + star(80, 52, 6, '#ffc93c', 0) + star(160, 60, 6, '#ff8fb1', 0)],
    // wall things
    poster_space: [100, 130, r(6, 6, 88, 118, 4, '#2d2a5a') + c(50, 64, 20, '#ff8fb1') + e(50, 64, 34, 8, 'none', ' stroke="#ffd23c" stroke-width="4"') + star(20, 22, 6, '#ffe68a', 0) + star(80, 100, 5, '#ffe68a', 0) + c(76, 26, 3, '#fff', 0) + c(24, 104, 2.5, '#fff', 0)],
    poster_mochi: [100, 130, r(6, 6, 88, 118, 4, '#ffeef5') + p('M50 30 C74 30 86 52 86 70 C86 90 70 98 50 98 C30 98 14 90 14 70 C14 52 26 30 50 30 Z', '#fff4e6') + p('M50 30 C46 20 40 18 36 20 M50 30 C54 18 62 18 66 22', 'none', ' stroke="#43b98a" stroke-width="4"') +
      c(38, 64, 4, K, 0) + c(62, 64, 4, K, 0) + p('M44 76 Q50 82 56 76', 'none') + c(30, 74, 5, '#ffb3cf', 0) + c(70, 74, 5, '#ffb3cf', 0) + '<text x="50" y="116" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="700" fill="' + K + '">MOCHI</text>'],
    poster_baseball: [100, 130, r(6, 6, 88, 118, 4, '#9fd2ff') + p('M14 112 L74 24', 'none', ' stroke="#e0a868" stroke-width="10" stroke-linecap="round"') + c(66, 86, 16, '#fff') + p('M56 76 Q62 86 56 96 M76 76 Q70 86 76 96', 'none', ' stroke="#ff5a6e" stroke-width="2.5"') + star(28, 28, 8, '#ffd23c', 0)],
    frame_sun: [110, 90, r(5, 5, 100, 80, 6, '#e0a878') + r(14, 14, 82, 62, 2, '#bfe8ff', 0) + c(74, 32, 10, '#ffd23c', 0) + p('M14 76 L40 46 L58 64 L72 52 L96 76 Z', '#62d4a5', 0)],
    clock: [80, 80, c(40, 40, 34, '#fff') + c(40, 40, 34, 'none', ' stroke="#ff8fb1" stroke-width="6"') + p('M40 40 V20 M40 40 L54 48', 'none', ' stroke="' + K + '" stroke-width="4"') + c(40, 40, 3, K, 0)],
    shelf_wall: [120, 70, r(6, 52, 108, 10, 3, '#c98b5e') + p('M18 52 H40 L36 30 H22 Z', '#ff8a5a') + p('M29 30 C20 18 30 10 29 2 M29 30 C38 18 44 22 42 12', 'none', ' stroke="#43b98a" stroke-width="4"') + book(56, 52, 30, '#5aa9f0') + book(66, 52, 26, '#ffd23c') + book(76, 52, 32, '#ff8fb1') + c(100, 42, 9, '#cdb0ff')],
    fairylights: [130, 50, p('M4 10 Q36 40 66 14 Q96 40 126 10', 'none', ' stroke="#7a6a99" stroke-width="2"') + [[16, 22, '#ff8fb1'], [34, 30, '#ffd23c'], [52, 26, '#8fe3b0'], [66, 16, '#9fd2ff'], [80, 26, '#cdb0ff'], [98, 30, '#ff8fb1'], [116, 20, '#ffd23c']].map(function (b) { return c(b[0], b[1], 5, b[2], ' stroke="#fff" stroke-width="1.5" class="bulb"'); }).join('')],
    pennant: [110, 60, p('M6 6 L104 28 L6 52 Z', '#3d8ef0') + '<text x="40" y="34" font-size="13" text-anchor="middle" font-family="sans-serif" font-weight="700" fill="#fff">GO BLOBS</text>'],
    mirror: [80, 110, e(40, 55, 32, 48, '#e0a878') + e(40, 55, 24, 40, '#dff3ff', 0) + p('M28 34 L40 22 M28 50 L48 30', 'none', ' stroke="#fff" stroke-width="4"')],
    star_big: [110, 110, star(55, 58, 50, '#ffd23c') + star(55, 58, 26, '#fff3a0', 0) + c(44, 50, 4, K, 0) + c(66, 50, 4, K, 0) + p('M48 64 Q55 70 62 64', 'none', ' stroke="' + K + '" stroke-width="3"')],
    hr_ball: [90, 90, r(5, 5, 80, 80, 8, '#7a5c9a') + c(45, 40, 20, '#fff') + p('M33 28 Q41 40 33 52 M57 28 Q49 40 57 52', 'none', ' stroke="#ff5a6e" stroke-width="2.5"') + '<text x="45" y="78" font-size="13" text-anchor="middle" font-family="sans-serif" font-weight="700" fill="#ffd23c">HOME RUN</text>']
  };
  // wallpapers & floors (swatches for the shop; the room draws them full-size)
  var STYLE = {
    wp_cream: { a: '#fff3df', b: '#fbe6c8', k: 'stripe' }, wp_stripes: { a: '#ffe3ec', b: '#fff6f9', k: 'stripe' }, wp_dots: { a: '#e6f3ff', b: '#ffffff', k: 'dots' },
    wp_stars: { a: '#3a3570', b: '#ffe68a', k: 'stars' }, wp_clouds: { a: '#c9e6ff', b: '#ffffff', k: 'clouds' }, wp_leaves: { a: '#e3f8ec', b: '#8fe3b0', k: 'leaves' },
    fl_wood: { a: '#e8b987', b: '#d9a06c', k: 'planks' }, fl_checker: { a: '#ffe0ec', b: '#ffffff', k: 'checker' }, fl_carpet: { a: '#d9ccff', b: '#cbbaf7', k: 'carpet' }, fl_tiles: { a: '#cff3e2', b: '#aee6cd', k: 'tiles' }
  };
  function swatch(id) {
    var s = STYLE[id], h = '<rect width="100" height="100" rx="12" fill="' + s.a + '"/>';
    if (s.k === 'stripe') h += '<path d="M20 0V100M50 0V100M80 0V100" stroke="' + s.b + '" stroke-width="12"/>';
    if (s.k === 'dots') for (var i = 0; i < 9; i++) h += '<circle cx="' + (18 + (i % 3) * 32) + '" cy="' + (18 + Math.floor(i / 3) * 32) + '" r="6" fill="#9fd2ff"/>';
    if (s.k === 'stars') h += star(30, 30, 9, s.b, 0) + star(72, 60, 7, s.b, 0) + star(36, 78, 5, s.b, 0);
    if (s.k === 'clouds') h += e(34, 36, 20, 10, s.b, 0) + e(70, 72, 22, 11, s.b, 0);
    if (s.k === 'leaves') h += p('M20 30 Q34 14 46 30 Q34 46 20 30Z M56 70 Q70 54 82 70 Q70 86 56 70Z', s.b, 0);
    if (s.k === 'planks') h += '<path d="M0 25H100M0 50H100M0 75H100M40 0V25M70 25V50M30 50V75M60 75V100" stroke="' + s.b + '" stroke-width="3"/>';
    if (s.k === 'checker') for (var j = 0; j < 16; j++) if ((j + Math.floor(j / 4)) % 2) h += '<rect x="' + (j % 4) * 25 + '" y="' + Math.floor(j / 4) * 25 + '" width="25" height="25" fill="#ff9fbe"/>';
    if (s.k === 'carpet') for (var k = 0; k < 12; k++) h += '<circle cx="' + (12 + (k % 4) * 25) + '" cy="' + (16 + Math.floor(k / 4) * 32) + '" r="3" fill="' + s.b + '"/>';
    if (s.k === 'tiles') h += '<path d="M0 33H100M0 66H100M33 0V100M66 0V100" stroke="#fff" stroke-width="3"/>';
    return '<svg viewBox="0 0 100 100" aria-hidden="true">' + h + '<rect width="100" height="100" rx="12" fill="none" stroke="' + K + '" stroke-width="3"/></svg>';
  }
  function svg(id, cls) {
    if (STYLE[id]) return swatch(id);
    var a = ART[id]; if (!a) return '';
    return '<svg class="' + (cls || 'it') + '" viewBox="' + (id.indexOf('rug') === 0 ? '0 0 ' : '-4 -12 ') + (a[0] + (id.indexOf('rug') === 0 ? 0 : 8)) + ' ' + (a[1] + (id.indexOf('rug') === 0 ? 0 : 16)) + '" aria-hidden="true" focusable="false">' + a[2] + '</svg>';
  }
  A.RoomArt = { ART: ART, STYLE: STYLE, svg: svg, swatch: swatch, star: star };
})(window.Arcade);
