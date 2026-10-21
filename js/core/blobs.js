/* Blob Arcade — the BLOB CAST. Original characters drawn in SVG.
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

  /* ---------- outfits (unlockable) ---------- */
  var OUTFITS = [
    { id: 'none', name: 'Just me' }, { id: 'bow', name: 'Bow' }, { id: 'cap', name: 'Sports cap', hat: true },
    { id: 'headband', name: 'Sweatband' }, { id: 'sunglasses', name: 'Sunglasses' }, { id: 'flower', name: 'Flower' },
    { id: 'partyhat', name: 'Party hat', hat: true }, { id: 'beanie', name: 'Cozy beanie', hat: true }, { id: 'crown', name: 'Crown', hat: true }
  ];
  var OUTFIT_BY = {}; OUTFITS.forEach(function (o) { OUTFIT_BY[o.id] = o; });
  OUTFIT_BY.helmet = { id: 'helmet', name: 'Batting helmet', hat: true, hidden: true }; // Blob Baseball only (not in Dress Up); color: svg({helmet: '#hex'})

  /* ---------- shared face parts ---------- */
  function sparkle(x, y, r, fill) { return '<path d="M' + f(x) + ' ' + f(y - r) + 'Q' + f(x) + ' ' + f(y) + ' ' + f(x + r) + ' ' + f(y) + 'Q' + f(x) + ' ' + f(y) + ' ' + f(x) + ' ' + f(y + r) + 'Q' + f(x) + ' ' + f(y) + ' ' + f(x - r) + ' ' + f(y) + 'Q' + f(x) + ' ' + f(y) + ' ' + f(x) + ' ' + f(y - r) + 'Z" fill="' + (fill || '#fff') + '"/>'; }
  function star5(cx, cy, r, fill, extra) {
    var p = []; for (var i = 0; i < 10; i++) { var a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * .45 : r; p.push(f(cx + Math.cos(a) * rr) + ' ' + f(cy + Math.sin(a) * rr)); }
    return '<path d="M' + p.join('L') + 'Z" fill="' + fill + '" ' + (extra || '') + '/>';
  }
  function ovalEyes(c, starHL) {
    var y = c.eye.y, L = 60 - c.eye.dx, R = 60 + c.eye.dx, s = '';
    [L, R].forEach(function (x) {
      s += '<ellipse cx="' + x + '" cy="' + y + '" rx="9.5" ry="11.5" fill="' + INK + '"/>';
      s += starHL ? sparkle(x + 3, y - 4, 5.5) : '<circle cx="' + (x + 3.5) + '" cy="' + (y - 5) + '" r="4" fill="#fff"/>';
      s += '<circle cx="' + (x - 3) + '" cy="' + (y + 5) + '" r="2" fill="#fff" opacity=".8"/>';
    });
    return s;
  }
  function happyEyes(c) {
    var y = c.eye.y, s = '';
    [60 - c.eye.dx, 60 + c.eye.dx].forEach(function (x) { s += '<path d="M' + (x - 9) + ' ' + (y + 3) + 'Q' + x + ' ' + (y - 9) + ' ' + (x + 9) + ' ' + (y + 3) + '"/>'; });
    return '<g class="e-happy" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round">' + s + '</g>';
  }
  function sadEyes(c) {
    var y = c.eye.y, L = 60 - c.eye.dx, R = 60 + c.eye.dx;
    return '<g class="e-sad"><circle cx="' + L + '" cy="' + (y + 2) + '" r="6" fill="' + INK + '"/><circle cx="' + R + '" cy="' + (y + 2) + '" r="6" fill="' + INK + '"/>' +
      '<circle cx="' + (L + 2) + '" cy="' + y + '" r="1.8" fill="#fff"/><circle cx="' + (R + 2) + '" cy="' + y + '" r="1.8" fill="#fff"/>' +
      '<path d="M' + (L - 9) + ' ' + (y - 9) + 'L' + (L + 6) + ' ' + (y - 14) + 'M' + (R + 9) + ' ' + (y - 9) + 'L' + (R - 6) + ' ' + (y - 14) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/></g>';
  }
  function mouths(c) {
    var m = c.mouth;
    return '<g class="mo-open"><ellipse cx="60" cy="' + (m + 4) + '" rx="10" ry="9" fill="#5a2d4a"/><ellipse cx="60" cy="' + (m + 9) + '" rx="6" ry="4" fill="#ff8fb1"/></g>' +
      '<path class="mo-sad" d="M53 ' + (m + 5) + 'Q60 ' + (m - 2) + ' 67 ' + (m + 5) + '" fill="none" stroke="' + INK + '" stroke-width="2.8" stroke-linecap="round"/>' +
      '<g class="mo-cheer"><path d="M47 ' + m + 'Q60 ' + (m + 3) + ' 73 ' + m + 'Q71 ' + (m + 15) + ' 60 ' + (m + 15) + 'Q49 ' + (m + 15) + ' 47 ' + m + 'Z" fill="#5a2d4a"/><ellipse cx="60" cy="' + (m + 11) + '" rx="6" ry="3.5" fill="#ff8fb1"/></g>';
  }
  /* extra faces (Blob Room friendship unlocks + napping): love, wink, wow, starry, dreamy, sleepy, silly */
  function moreFaces(c) {
    var y = c.eye.y, L = 60 - c.eye.dx, R = 60 + c.eye.dx, m = c.mouth, s = '';
    function heart(x) { return '<path d="M' + x + ' ' + (y + 8) + 'C' + (x - 13) + ' ' + (y - 1) + ' ' + (x - 8) + ' ' + (y - 12) + ' ' + x + ' ' + (y - 5) + 'C' + (x + 8) + ' ' + (y - 12) + ' ' + (x + 13) + ' ' + (y - 1) + ' ' + x + ' ' + (y + 8) + 'Z" fill="#ff5d8f" stroke="#e0407a" stroke-width="1.5"/>'; }
    s += '<g class="e-love">' + heart(L) + heart(R) + '<circle cx="' + (L - 3) + '" cy="' + (y - 3) + '" r="2" fill="#fff"/><circle cx="' + (R - 3) + '" cy="' + (y - 3) + '" r="2" fill="#fff"/></g>';
    s += '<g class="e-wink"><path d="M' + (L - 9) + ' ' + (y + 2) + 'Q' + L + ' ' + (y - 8) + ' ' + (L + 9) + ' ' + (y + 2) + '" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
      '<ellipse cx="' + R + '" cy="' + y + '" rx="9" ry="11" fill="' + INK + '"/><circle cx="' + (R + 3) + '" cy="' + (y - 4) + '" r="3.6" fill="#fff"/></g>';
    s += '<g class="e-wow">' + [L, R].map(function (x) { return '<circle cx="' + x + '" cy="' + y + '" r="11.5" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/><circle cx="' + x + '" cy="' + (y + 1) + '" r="6" fill="' + INK + '"/><circle cx="' + (x + 2) + '" cy="' + (y - 2) + '" r="2" fill="#fff"/>'; }).join('') + '</g>';
    s += '<g class="e-starry">' + star5(L, y, 12, '#ffd23c', 'stroke="#e5a800" stroke-width="1.6" stroke-linejoin="round"') + star5(R, y, 12, '#ffd23c', 'stroke="#e5a800" stroke-width="1.6" stroke-linejoin="round"') + '</g>';
    s += '<g class="e-dreamy">' + [L, R].map(function (x) { return '<path d="M' + (x - 9) + ' ' + (y - 1) + 'Q' + x + ' ' + (y + 11) + ' ' + (x + 9) + ' ' + (y - 1) + 'Z" fill="' + INK + '"/><path d="M' + (x - 10) + ' ' + (y - 1) + 'L' + (x + 10) + ' ' + (y - 1) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><circle cx="' + (x + 3) + '" cy="' + (y + 3) + '" r="1.8" fill="#fff"/>'; }).join('') + '</g>';
    s += '<g class="e-sleepy" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round">' + [L, R].map(function (x) { return '<path d="M' + (x - 9) + ' ' + y + 'Q' + x + ' ' + (y + 7) + ' ' + (x + 9) + ' ' + y + '"/>'; }).join('') + '</g>';
    s += '<ellipse class="mo-o" cx="60" cy="' + (m + 5) + '" rx="5.5" ry="6.5" fill="#5a2d4a"/>';
    s += '<g class="mo-tongue"><path d="M47 ' + m + 'Q60 ' + (m + 3) + ' 73 ' + m + 'Q71 ' + (m + 12) + ' 60 ' + (m + 12) + 'Q49 ' + (m + 12) + ' 47 ' + m + 'Z" fill="#5a2d4a"/><path d="M54 ' + (m + 9) + 'Q60 ' + (m + 24) + ' 66 ' + (m + 9) + 'Z" fill="#ff7aa6" stroke="#e0507f" stroke-width="1.2"/></g>';
    s += '<g class="blush"><ellipse cx="' + (60 - c.cheek.dx) + '" cy="' + c.cheek.y + '" rx="10" ry="6" fill="#ff7aa6" opacity=".55"/><ellipse cx="' + (60 + c.cheek.dx) + '" cy="' + c.cheek.y + '" rx="10" ry="6" fill="#ff7aa6" opacity=".55"/></g>';
    return s;
  }
  function cheeks(c, col) {
    return '<ellipse cx="' + (60 - c.cheek.dx) + '" cy="' + c.cheek.y + '" rx="8.5" ry="5" fill="' + col + '" opacity=".6"/><ellipse cx="' + (60 + c.cheek.dx) + '" cy="' + c.cheek.y + '" rx="8.5" ry="5" fill="' + col + '" opacity=".6"/>';
  }
  function smile(c, w, h) { var m = c.mouth; return '<path class="mo-idle" d="M' + (60 - w) + ' ' + m + 'Q60 ' + (m + h) + ' ' + (60 + w) + ' ' + m + '" fill="none" stroke="' + INK + '" stroke-width="2.8" stroke-linecap="round"/>'; }

  /* ---------- the cast ---------- */
  var CAST = [
    { id: 'mochi', name: 'Mochi', looks: 'Cream rice-dumpling blob with a two-leaf green sprout', personality: 'Sweet, cheerful and always a little bit hungry.',
      pal: { l: '#ffffff', m: '#fff4e6', d: '#ffdcc8', s: '#f2c6ae', foot: '#ffb59c', cheek: '#ff9fbe' },
      body: 'M60 18 C92 18 112 46 113 70 C114 92 94 101 60 101 C26 101 6 92 7 70 C8 46 28 18 60 18Z',
      hatY: 28, eye: { y: 60, dx: 18 }, mouth: 75, cheek: { y: 75, dx: 33 }, feet: 100, arm: { y: 72, x: 10 }, sheen: [42, 34, 12, 6, -20], bow: [84, 30], flower: [36, 32], band: 38,
      topper: function (id) {
        return '<g class="sprout"><path d="M60 22 Q59 12 61 6" stroke="#4fcf98" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
          '<path d="M61 8 Q72 -2 82 6 Q72 14 61 8Z" fill="url(#' + id + 'l)"/><path d="M60 10 Q50 2 42 9 Q51 15 60 10Z" fill="url(#' + id + 'l)"/></g>';
      },
      eyes: function (c) { return ovalEyes(c, false); },
      mouthIdle: function (c) { var m = c.mouth; return '<path class="mo-idle" d="M53 ' + m + 'Q56.5 ' + (m + 5) + ' 60 ' + m + 'Q63.5 ' + (m + 5) + ' 67 ' + m + '" fill="none" stroke="' + INK + '" stroke-width="2.8" stroke-linecap="round"/>'; }
    },
    { id: 'poppy', name: 'Poppy', looks: 'Tall pink gumdrop blob with sleepy half-moon eyes and a curl on top', personality: 'Dreamy and cozy; loves naps and slow, happy hums.',
      pal: { l: '#fff3f8', m: '#ffc9de', d: '#f7a3c3', s: '#e58bb0', cheek: '#ff7fa8' },
      body: 'M60 14 C86 14 102 38 103 66 C104 92 88 102 60 102 C32 102 16 92 17 66 C18 38 34 14 60 14Z',
      hatY: 25, eye: { y: 58, dx: 17 }, mouth: 74, cheek: { y: 71, dx: 31 }, feet: 0, arm: { y: 72, x: 18 }, sheen: [44, 30, 10, 5, -25], bow: [82, 26], flower: [38, 26], band: 33,
      topper: function (id, p) { return '<path class="curl" d="M60 15 C56 6 62 0 68 3 C73 6 70 13 64 11" stroke="' + p.d + '" stroke-width="4.5" fill="none" stroke-linecap="round"/>'; },
      eyes: function (c, p) {
        var y = c.eye.y, s = '';
        [60 - c.eye.dx, 60 + c.eye.dx].forEach(function (x, i) {
          // peaceful, sleepy closed eyes with little lashes
          s += '<path d="M' + (x - 9) + ' ' + (y - 1) + 'Q' + x + ' ' + (y + 8) + ' ' + (x + 9) + ' ' + (y - 1) + '" stroke="' + INK + '" stroke-width="3.4" fill="none" stroke-linecap="round"/>';
          var d = i ? 1 : -1, ox = x + 9 * d;
          s += '<path d="M' + ox + ' ' + (y - 1) + 'l' + (3.5 * d) + ' -2.5M' + (ox - 4 * d) + ' ' + (y + 3) + 'l' + (3 * d) + ' 1.5" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>';
        });
        return s;
      },
      mouthIdle: function (c) { return '<ellipse class="mo-idle" cx="60" cy="' + (c.mouth + 2) + '" rx="3.6" ry="4.2" fill="#5a2d4a"/>'; }
    },
    { id: 'dewdrop', name: 'Dewdrop', looks: 'Sky-blue raindrop-shaped blob with huge, sparkly starlit eyes', personality: 'Curious about everything; asks "why?" a lot.',
      pal: { l: '#f0faff', m: '#b8e3ff', d: '#80c5f4', s: '#5eaee6', foot: '#7cbdf0', cheek: '#ff9fbe' },
      body: 'M60 10 C66 24 106 44 106 72 C106 94 86 103 60 103 C34 103 14 94 14 72 C14 44 54 24 60 10Z',
      hatY: 34, eye: { y: 66, dx: 17 }, mouth: 84, cheek: { y: 82, dx: 34 }, feet: 101, arm: { y: 78, x: 15 }, sheen: [44, 44, 8, 4, -40], bow: [80, 38], flower: [40, 40], band: 46,
      eyes: function (c) {
        var y = c.eye.y, s = '';
        [60 - c.eye.dx, 60 + c.eye.dx].forEach(function (x) {
          s += '<ellipse cx="' + x + '" cy="' + y + '" rx="12" ry="14" fill="' + INK + '"/>';
          s += '<ellipse cx="' + x + '" cy="' + (y + 6) + '" rx="8" ry="5.5" fill="#6f86d6" opacity=".55"/>';
          s += '<circle cx="' + (x + 4) + '" cy="' + (y - 5) + '" r="5" fill="#fff"/><circle cx="' + (x - 5) + '" cy="' + (y + 5) + '" r="2.3" fill="#fff"/>';
          s += sparkle(x + 6, y + 6, 3.2);
        });
        return s;
      },
      mouthIdle: function (c) { var m = c.mouth; return '<path class="mo-idle" d="M55 ' + m + 'Q60 ' + (m + 7) + ' 65 ' + m + 'Z" fill="#5a2d4a" stroke="#5a2d4a" stroke-width="1.5" stroke-linejoin="round"/>'; }
    },
    { id: 'pickle', name: 'Pickle', looks: 'Lime-green squarish marshmallow blob with a cheeky wink and a toothy grin', personality: 'Silly joker; always up to something fun.',
      pal: { l: '#f4fde6', m: '#c9f09d', d: '#9edb65', s: '#80c24a', foot: '#86c94f', cheek: '#ffa3b5' },
      body: 'M32 24 H88 C101 24 108 32 108 45 V86 C108 97 100 103 88 103 H32 C20 103 12 97 12 86 V45 C12 32 19 24 32 24Z',
      hatY: 31, eye: { y: 58, dx: 19 }, mouth: 74, cheek: { y: 72, dx: 36 }, feet: 101, arm: { y: 74, x: 13 }, sheen: [32, 34, 10, 4, -12], bow: [90, 30], flower: [32, 30], band: 40,
      extra: function (c, p) { return [[30, 88], [40, 95], [88, 91], [97, 82], [77, 97], [24, 54]].map(function (q) { return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="2.6" fill="' + p.d + '" opacity=".55"/>'; }).join(''); },
      eyes: function (c) {
        var y = c.eye.y, L = 60 - c.eye.dx, R = 60 + c.eye.dx;
        return '<path d="M' + (L - 8) + ' ' + (y - 6) + 'L' + (L + 6) + ' ' + y + 'L' + (L - 8) + ' ' + (y + 6) + '" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<ellipse cx="' + R + '" cy="' + y + '" rx="9" ry="11" fill="' + INK + '"/><circle cx="' + (R + 3) + '" cy="' + (y - 5) + '" r="3.8" fill="#fff"/>' +
          '<path d="M' + (R - 9) + ' ' + (y - 17) + 'Q' + R + ' ' + (y - 23) + ' ' + (R + 9) + ' ' + (y - 17) + '" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
      },
      mouthIdle: function (c) {
        var m = c.mouth;
        return '<g class="mo-idle"><path d="M45 ' + m + 'Q62 ' + (m + 3) + ' 79 ' + (m - 2) + 'Q75 ' + (m + 15) + ' 61 ' + (m + 15) + 'Q48 ' + (m + 15) + ' 45 ' + m + 'Z" fill="#5a2d4a"/>' +
          '<ellipse cx="63" cy="' + (m + 11) + '" rx="7" ry="3.2" fill="#ff8fb1"/><rect x="55" y="' + (m + .8) + '" width="7" height="5.5" rx="1.5" fill="#fff"/></g>';
      }
    },
    { id: 'nova', name: 'Nova', looks: 'Lavender round blob with a star antenna, star-shaped cheeks and twinkly eyes', personality: 'Dreamer and stargazer; hums little songs.',
      pal: { l: '#f8f1ff', m: '#dac4ff', d: '#b394f5', s: '#9b7be6', foot: '#a988ee', cheek: '#ff9fcf' },
      body: 'M60 22 C89 22 108 43 108 67 C108 91 88 103 60 103 C32 103 12 91 12 67 C12 43 31 22 60 22Z',
      hatY: 31, eye: { y: 62, dx: 18 }, mouth: 79, cheek: { y: 77, dx: 34 }, feet: 101, arm: { y: 74, x: 13 }, sheen: [40, 38, 11, 5, -25], bow: [84, 32], flower: [36, 34], band: 40,
      topper: function () { return '<g class="antenna"><path d="M60 23 Q57 14 61 7" stroke="#9b7be6" stroke-width="3" fill="none" stroke-linecap="round"/>' + star5(61, 4, 8, '#ffd23c', 'stroke="#e8a400" stroke-width="1.5" stroke-linejoin="round"') + '</g>'; },
      cheeks: function (c) { return star5(60 - c.cheek.dx, c.cheek.y, 7, '#ff9fcf', 'opacity=".85"') + star5(60 + c.cheek.dx, c.cheek.y, 7, '#ff9fcf', 'opacity=".85"'); },
      eyes: function (c) { return ovalEyes(c, true); },
      mouthIdle: function (c) { return smile(c, 7, 6); }
    },
    { id: 'clem', name: 'Clem', looks: 'Orange wide bean-shaped blob with a spiky hair tuft and freckles', personality: 'Sporty and brave; loves to run, kick and cheer.',
      pal: { l: '#fff6ea', m: '#ffd0a0', d: '#ffa75a', s: '#ef8c3a', foot: '#f39444', cheek: '#ff8f8f' },
      body: 'M60 28 C95 28 114 50 114 74 C114 94 96 103 60 103 C24 103 6 94 6 74 C6 50 25 28 60 28Z',
      hatY: 37, eye: { y: 63, dx: 20 }, mouth: 78, cheek: { y: 76, dx: 38 }, feet: 101, arm: { y: 78, x: 8 }, sheen: [36, 42, 12, 5, -18], bow: [88, 38], flower: [32, 40], band: 46,
      topper: function (id, p) { return '<path class="tuft" d="M48 31 Q46 18 53 12 Q54 22 58 27 Q57 11 66 6 Q64 19 65 27 Q69 17 78 17 Q71 24 72 32Z" fill="' + p.d + '" stroke="' + p.s + '" stroke-width="1.5" stroke-linejoin="round"/>'; },
      extra: function (c) {
        var y = c.cheek.y - 7, s = '';
        [[-44, 0], [-38, -3], [-40, 4], [38, -3], [44, 0], [40, 4]].forEach(function (q) { s += '<circle cx="' + (60 + q[0]) + '" cy="' + (y + q[1]) + '" r="1.7" fill="#c9692a" opacity=".75"/>'; });
        return s;
      },
      eyes: function (c) {
        var y = c.eye.y, s = '';
        [60 - c.eye.dx, 60 + c.eye.dx].forEach(function (x, i) {
          s += '<circle cx="' + x + '" cy="' + y + '" r="8" fill="' + INK + '"/><circle cx="' + (x + 2.5) + '" cy="' + (y - 3) + '" r="3" fill="#fff"/>';
          s += '<path d="M' + (x - 8) + ' ' + (y - (i ? 13 : 15)) + 'L' + (x + 8) + ' ' + (y - (i ? 15 : 13)) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
        });
        return s;
      },
      mouthIdle: function (c) { var m = c.mouth; return '<g class="mo-idle"><path d="M50 ' + m + 'Q60 ' + (m + 2) + ' 70 ' + m + 'Q68 ' + (m + 11) + ' 60 ' + (m + 11) + 'Q52 ' + (m + 11) + ' 50 ' + m + 'Z" fill="#5a2d4a"/><ellipse cx="60" cy="' + (m + 8) + '" rx="5" ry="2.6" fill="#ff8fb1"/></g>'; }
    }
  ];
  var BY = {}; CAST.forEach(function (c) { BY[c.id] = c; });

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

  /* ---------- render ---------- */
  function svg(o) {
    o = o || {};
    var c = BY[o.blob] || CAST[0], id = 'b' + (uid++) + '_';
    var col = COLOR_BY[o.color] || COLORS[0], p = {};
    for (var k in c.pal) p[k] = c.pal[k];
    if (col.id !== 'classic') { p.l = col.l; p.m = col.m; p.d = col.d; p.s = col.s; p.foot = col.d; }
    var outfit = OUTFIT_BY[o.outfit] || OUTFITS[0];
    var grad = col.rainbow
      ? '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd1dc"/><stop offset=".22" stop-color="#ffe2b8"/><stop offset=".42" stop-color="#fff5b5"/><stop offset=".62" stop-color="#cdf5d8"/><stop offset=".8" stop-color="#c9e4ff"/><stop offset="1" stop-color="#e3d3ff"/></linearGradient>'
      : '<radialGradient id="' + id + 'b" cx="40%" cy="32%" r="72%"><stop offset="0" stop-color="' + p.l + '"/><stop offset=".6" stop-color="' + p.m + '"/><stop offset="1" stop-color="' + p.d + '"/></radialGradient>';
    var s = '<svg class="blob x-' + (o.expr || 'idle') + ' blob-' + c.id + '" viewBox="0 -16 120 128" aria-hidden="true" focusable="false"><defs>' + grad +
      '<linearGradient id="' + id + 'l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ff0c8"/><stop offset="1" stop-color="#4fcf98"/></linearGradient>' +
      '<clipPath id="' + id + 'c"><path d="' + c.body + '"/></clipPath></defs>' +
      '<ellipse class="shadow" cx="60" cy="106" rx="40" ry="5" fill="#4a3b6b" opacity=".13"/><g class="bob">';
    if (c.feet) s += '<ellipse cx="40" cy="' + c.feet + '" rx="11" ry="7" fill="' + (p.foot || p.d) + '"/><ellipse cx="80" cy="' + c.feet + '" rx="11" ry="7" fill="' + (p.foot || p.d) + '"/>';
    s += '<g transform="translate(' + c.arm.x + ' ' + c.arm.y + ')"><g class="arm arm-l"><ellipse cx="-4" cy="0" rx="9" ry="6" fill="' + p.m + '" stroke="' + p.s + '" stroke-width="1.6"/></g></g>';
    s += '<g transform="translate(' + (120 - c.arm.x) + ' ' + c.arm.y + ')"><g class="arm arm-r"><ellipse cx="4" cy="0" rx="9" ry="6" fill="' + p.m + '" stroke="' + p.s + '" stroke-width="1.6"/></g></g>';
    if (c.topper && !outfit.hat) s += '<g class="topper">' + c.topper(id, p) + '</g>';
    s += '<path d="' + c.body + '" fill="url(#' + id + 'b)" stroke="' + p.s + '" stroke-width="2"/>';
    var sh = c.sheen; s += '<ellipse cx="' + sh[0] + '" cy="' + sh[1] + '" rx="' + sh[2] + '" ry="' + sh[3] + '" fill="#fff" opacity=".75" transform="rotate(' + sh[4] + ' ' + sh[0] + ' ' + sh[1] + ')"/>';
    if (c.extra) s += c.extra(c, p);
    if (outfit.id === 'headband') s += ACC.headband(c, id);
    s += '<g class="e-idle"><g class="blink">' + c.eyes(c, p) + '</g></g>' + happyEyes(c) + sadEyes(c);
    s += c.cheeks ? c.cheeks(c) : cheeks(c, p.cheek);
    s += c.mouthIdle(c) + mouths(c) + moreFaces(c);
    if (outfit.id !== 'none' && outfit.id !== 'headband' && ACC[outfit.id]) s += ACC[outfit.id](c, id, o);
    s += '</g></svg>';
    return s;
  }

  // Grumbly: the gentle optional wanderer cloud from Mochi Munch v1 (not a playable blob)
  function grumbly() {
    return '<svg viewBox="0 0 120 90" aria-hidden="true"><g fill="#d8c8ff" stroke="#b9a3f5" stroke-width="2"><path d="M25 75 C8 75 6 52 22 48 C20 30 42 22 52 34 C58 16 88 16 92 38 C110 36 116 62 100 72 C96 80 30 80 25 75Z"/></g>' +
      '<path d="M42 52 Q48 57 54 52M68 52 Q74 57 80 52" stroke="#5b4a85" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M55 64 Q61 68 67 64" stroke="#5b4a85" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="36" cy="60" rx="6" ry="3.5" fill="#ffb3cf" opacity=".7"/><ellipse cx="86" cy="60" rx="6" ry="3.5" fill="#ffb3cf" opacity=".7"/>' +
      '<text x="98" y="22" font-size="16" fill="#9b86d6" font-family="sans-serif" font-weight="bold">z</text><text x="108" y="12" font-size="11" fill="#9b86d6" font-family="sans-serif" font-weight="bold">z</text></svg>';
  }

  A.Blobs = {
    CAST: CAST, byId: BY, COLORS: COLORS, colorById: COLOR_BY, OUTFITS: OUTFITS, outfitById: OUTFIT_BY,
    svg: svg, star5: star5, grumbly: grumbly,
    forProfile: function (p, extra) { var o = { blob: p.blob, color: p.color, outfit: p.outfit }; for (var k in extra || {}) o[k] = extra[k]; return svg(o); },
    // play a one-shot animation class on a wrapper element (hop, chomp, happy, wobble, squish, jump)
    anim: function (el, cls, ms) {
      if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
      clearTimeout(el['_t' + cls]); el['_t' + cls] = setTimeout(function () { el.classList.remove(cls); }, ms || 500);
    }
  };
})(window.Arcade);
