/* p4/color2 (2026-11-05): coloring engine (games/color + coloring break) + Gallery.
   Tools: Fill, Brush (sizes + glitter/rainbow), Stickers (move/resize/rotate/flip), Undo, Start over.
   Toddlers (simple): Fill + Stickers only. Patterns + light colors + finish celebration allowed.
   Mix (blend two colors) is non-toddler. Pinch-zoom on the stage. Saved as vectors in p.gallery (schema 4). */
(function (A) {
  var NS = 'http://www.w3.org/2000/svg', uid = 0, GALLERY_MAX = 60, POINT_CAP = 3000;
  var SOLIDS = [
    ['red', '#ff5d5d'], ['orange', '#ffa53b'], ['yellow', '#ffe14d'], ['green', '#6fd36a'], ['teal', '#3fd0c9'],
    ['blue', '#4fa3ff'], ['purple', '#a77bff'], ['pink', '#ff8fc7'], ['brown', '#b07a4f'], ['black', '#3b2d55'],
    ['white', '#ffffff'], ['sky', '#9ad9ff'], ['mint', '#9aefc7'], ['lavender', '#d2b8ff'], ['peach', '#ffc49a'],
    ['blush', '#ffc1d9'], ['gray', '#c5c0d0']
  ];
  var SPECIAL = [['rainbow', 'rainbow'], ['sparkle', 'sparkle'], ['polka', 'polka'], ['stripes', 'stripes'], ['hearts', 'hearts'], ['stars', 'stars'], ['glitter', 'glitter']];
  var COLORS = SOLIDS.concat(SPECIAL);
  var PATTERNS = ['polka', 'stripes', 'hearts', 'stars'];
  var STICKERS = ['⭐', '❤️', '🌸', '🌈', '🦋', '🎈', '🍓', '🍎', '🌽', '🫐', '🍰', '☀️', '🌙', '☁️', '🍀', '🎀', '🎵', '⚽', '🐶', '🐱', '🐸', '🐝', '🍦', '🍪', '🚀', '🎁'];
  var BRUSH = [8, 18, 34];
  function css() { if (document.getElementById('funCss')) return; var l = document.createElement('link'); l.id = 'funCss'; l.rel = 'stylesheet'; l.href = (A.ROOT || '') + 'css/fun.css'; document.head.appendChild(l); }
  function hexOk(c) { return typeof c === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(c); }
  function patKey(name, hex) { return name + '_' + (hex || '').replace('#', ''); }
  function parsePaint(c) {
    if (!c) return { kind: 'solid', v: '#fff' };
    if (c === 'rainbow' || c === 'sparkle' || c === 'glitter') return { kind: c };
    if (hexOk(c)) return { kind: 'solid', v: c };
    var m = /^(polka|stripes|hearts|stars):(#[0-9a-fA-F]{3,8})$/.exec(c);
    if (m) return { kind: 'pat', name: m[1], hex: m[2] };
    return { kind: 'solid', v: c };
  }
  function patDef(id, name, hex) {
    var h = hex || '#ff5d5d', light = h;
    if (name === 'polka') {
      return '<pattern id="' + id + '" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="' + h + '" opacity=".22"/><circle cx="8" cy="8" r="5" fill="' + h + '"/><circle cx="22" cy="20" r="4" fill="' + h + '"/></pattern>';
    }
    if (name === 'stripes') {
      return '<pattern id="' + id + '" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(25)"><rect width="20" height="20" fill="' + h + '" opacity=".18"/><rect width="10" height="20" fill="' + h + '"/></pattern>';
    }
    if (name === 'hearts') {
      return '<pattern id="' + id + '" width="36" height="32" patternUnits="userSpaceOnUse"><rect width="36" height="32" fill="' + h + '" opacity=".15"/>' +
        '<path d="M18 26 C 10 18 6 14 6 10 A5 5 0 0 1 18 10 A5 5 0 0 1 30 10 C 30 14 26 18 18 26Z" fill="' + h + '"/></pattern>';
    }
    // stars
    return '<pattern id="' + id + '" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="' + h + '" opacity=".16"/>' +
      '<path d="M12 4 L14 10 L20 12 L14 14 L12 20 L10 14 L4 12 L10 10Z" fill="' + h + '"/><path d="M30 22 L31.5 27 L36 28.5 L31.5 30 L30 35 L28.5 30 L24 28.5 L28.5 27Z" fill="' + light + '"/></pattern>';
  }
  function glitterDef(id) {
    return '<pattern id="' + id + '" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="#ffe9a8"/>' +
      '<circle cx="6" cy="8" r="2.2" fill="#fff"/><circle cx="18" cy="6" r="1.6" fill="#fff59a"/><circle cx="22" cy="18" r="2" fill="#fff"/>' +
      '<path d="M10 20 L11 23 L14 24 L11 25 L10 28 L9 25 L6 24 L9 23Z" fill="#fff"/><circle cx="4" cy="22" r="1.2" fill="#ffd0ff"/></pattern>';
  }
  function collectPaints(e) {
    var need = {}, f = e.f || {};
    Object.keys(f).forEach(function (id) { need[f[id]] = 1; });
    (e.s || []).forEach(function (st) { need[st.c] = 1; });
    return Object.keys(need);
  }
  function defs(k, paints) {
    var s = '<defs><linearGradient id="clRb' + k + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5d5d"/><stop offset=".2" stop-color="#ffa53b"/><stop offset=".4" stop-color="#ffe14d"/>' +
      '<stop offset=".6" stop-color="#6fd36a"/><stop offset=".8" stop-color="#4fa3ff"/><stop offset="1" stop-color="#a77bff"/></linearGradient>' +
      '<pattern id="clSp' + k + '" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#ffd76a"/><rect width="40" height="40" fill="#fff3b8" opacity=".45"/>' +
      '<path d="M10 4 L12 10 L18 12 L12 14 L10 20 L8 14 L2 12 L8 10Z" fill="#fff"/><path d="M30 22 L31.5 27 L36 28.5 L31.5 30 L30 35 L28.5 30 L24 28.5 L28.5 27Z" fill="#fff"/><circle cx="30" cy="8" r="2" fill="#fff"/></pattern>' +
      glitterDef('clGl' + k);
    var seen = {}, list = paints || [];
    // always emit a few pattern bases so live UI can paint immediately
    ['#ff5d5d', '#4fa3ff', '#6fd36a', '#ffe14d', '#a77bff', '#ff8fc7', '#ffa53b', '#3fd0c9', '#9ad9ff', '#9aefc7', '#d2b8ff', '#ffc49a', '#ffc1d9', '#c5c0d0', '#b07a4f', '#3b2d55', '#ffffff'].forEach(function (hx) {
      PATTERNS.forEach(function (n) { var id = 'cl' + patKey(n, hx) + '_' + k; if (!seen[id]) { seen[id] = 1; s += patDef(id, n, hx); } });
    });
    list.forEach(function (c) {
      var p = parsePaint(c);
      if (p.kind === 'pat') { var id = 'cl' + patKey(p.name, p.hex) + '_' + k; if (!seen[id]) { seen[id] = 1; s += patDef(id, p.name, p.hex); } }
    });
    return s + '</defs>';
  }
  function paint(c, k) {
    var p = parsePaint(c);
    if (p.kind === 'rainbow') return 'url(#clRb' + k + ')';
    if (p.kind === 'sparkle') return 'url(#clSp' + k + ')';
    if (p.kind === 'glitter') return 'url(#clGl' + k + ')';
    if (p.kind === 'pat') return 'url(#cl' + patKey(p.name, p.hex) + '_' + k + ')';
    return p.v || '#fff';
  }
  function friendImg(id) { return A.Blobs ? A.Blobs.art(id, 'happy', 256) : ''; }
  function stkTransform(s) {
    var r = s.r || 0, fl = s.flip ? -1 : 1;
    return 'translate(' + s.x + ' ' + s.y + ') rotate(' + r + ') scale(' + fl + ' 1)';
  }
  function stickerSVG(s) {
    var w = 100 * s.s, inner = s.f ? '<image href="' + friendImg(s.f) + '" x="' + (-w / 2) + '" y="' + (-w / 2) + '" width="' + w + '" height="' + w + '"/>' :
      '<text x="0" y="0" font-size="' + (w * .8) + '" text-anchor="middle" dominant-baseline="central">' + s.e + '</text>';
    return '<g class="cl-stk" transform="' + stkTransform(s) + '">' + inner + '</g>';
  }
  function strokePath(st) { var p = st.p.split(' '); return 'M' + p[0] + (p.length > 1 ? ' L' + p.slice(1).join(' L') : ' l0.1 0'); }
  function rainbowStrokeParts(st, k) {
    // cycle hue along the stroke as short segments (gallery + live)
    var pts = st.p.split(' '); if (pts.length < 2) return '<path d="' + strokePath(st) + '" stroke="' + paint('rainbow', k) + '" stroke-width="' + st.w + '"/>';
    var s = '', i, n = pts.length;
    for (i = 0; i < n - 1; i++) {
      var hue = Math.round((i / Math.max(1, n - 2)) * 300);
      s += '<path d="M' + pts[i] + ' L' + pts[i + 1] + '" stroke="hsl(' + hue + ',90%,58%)" stroke-width="' + st.w + '"/>';
    }
    return s;
  }
  function strokeSVG(st, k) {
    if (st.c === 'rainbow') return rainbowStrokeParts(st, k);
    return '<path d="' + strokePath(st) + '" stroke="' + paint(st.c, k) + '" stroke-width="' + st.w + '"/>';
  }
  function render(e, cls) {
    var pg = A.ColorPages.byId[e.pg]; if (!pg) return ''; var k = 'g' + (uid++), f = e.f || {};
    var s = '<svg class="' + (cls || 'cl-pic') + '" viewBox="0 0 800 600" xmlns="' + NS + '">' + defs(k, collectPaints(e)) + '<g>';
    pg.regions.forEach(function (r) { s += '<path d="' + r.d + '" fill="' + paint(f[r.id], k) + '"/>'; });
    s += '</g><g fill="none" stroke-linecap="round" stroke-linejoin="round">';
    (e.s || []).forEach(function (st) { s += strokeSVG(st, k); });
    s += '</g><g fill="none" stroke="#3b2d55" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">';
    pg.regions.forEach(function (r) { s += '<path d="' + r.d + '"/>'; }); pg.lines.forEach(function (d) { s += '<path d="' + d + '"/>'; });
    s += '</g>'; (e.k || []).forEach(function (st) { s += stickerSVG(st); });
    return s + '</svg>';
  }
  var Gallery = {
    MAX: GALLERY_MAX,
    list: function (p) { return (p && p.gallery) || []; },
    full: function (p) { return Gallery.list(p).length >= GALLERY_MAX; },
    put: function (p, e) {
      if (!p || p.guest) return false; var g = p.gallery || (p.gallery = []), i = g.map(function (x) { return x.id; }).indexOf(e.id);
      if (i >= 0) { g[i] = e; } else { if (g.length >= GALLERY_MAX) return false; g.push(e); }
      if (A.Store) A.Store.save(); return true;
    },
    remove: function (p, id) { var g = Gallery.list(p), i = g.map(function (x) { return x.id; }).indexOf(id); if (i >= 0) { g.splice(i, 1); if (A.Store) A.Store.save(); } },
    render: render
  };
  function mixHex(a, b) {
    function to(h) { h = h.replace('#', ''); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
    function hex(n) { var s = Math.max(0, Math.min(255, Math.round(n))).toString(16); return s.length < 2 ? '0' + s : s; }
    var A2 = to(a), B = to(b); return '#' + hex((A2[0] + B[0]) / 2) + hex((A2[1] + B[1]) / 2) + hex((A2[2] + B[2]) / 2);
  }
  function reducedMotion() { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function mount(host, o) {
    css(); o = o || {}; var P = o.p, simple = !!o.simple, pg = A.ColorPages.byId[o.page] || A.ColorPages.PAGES[0], k = 'c' + (uid++);
    var st = { id: o.entry ? o.entry.id : 'g' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36), pg: pg.id, f: {}, s: [], k: [] };
    if (o.entry) { st.f = JSON.parse(JSON.stringify(o.entry.f || {})); st.s = JSON.parse(JSON.stringify(o.entry.s || [])); st.k = JSON.parse(JSON.stringify(o.entry.k || [])); }
    var tool = 'fill', color = o.color || '#ff5d5d', solid = hexOk(color) ? color : '#ff5d5d', size = 1, hist = [], selStk = -1, drawing = null;
    var mixMode = false, mixFirst = null, extraSw = [];
    var zoom = 1, panX = 0, panY = 0, pinch = null;
    var met = A.Story2 && A.Story2.met && P ? A.Story2.met(P) : ((A.Blobs && A.Blobs.STARTERS) || []);
    var tools = simple ? [['fill', '🪣', 'Fill'], ['stk', '⭐', 'Stickers']] : [['fill', '🪣', 'Fill'], ['brush', '🖌️', 'Brush'], ['stk', '⭐', 'Stickers']];
    function swHTML(c) {
      var v = c[1], lab = c[0], cls = 'cl-sw cl-sw-' + lab, style = hexOk(v) ? ' style="background:' + v + '"' : '';
      if (lab === 'polka') style = ' style="background:radial-gradient(circle at 30% 30%,' + solid + ' 28%,#fff 29%)"';
      if (lab === 'stripes') style = ' style="background:repeating-linear-gradient(45deg,' + solid + ',' + solid + ' 6px,#fff 6px,#fff 12px)"';
      if (lab === 'hearts') style = ' style="background:linear-gradient(#fff,' + solid + ')"';
      if (lab === 'stars') style = ' style="background:radial-gradient(circle at 50% 50%,' + solid + ' 20%,#fff8c8 21%)"';
      if (lab === 'glitter') style = ' style="background:radial-gradient(circle at 30% 30%,#fff 10%,transparent 11%),linear-gradient(135deg,#ffe9a8,#ffd0ff)"';
      return '<button class="' + cls + '" data-c="' + v + '" data-lab="' + lab + '" aria-label="' + lab + '"' + style + '></button>';
    }
    host.innerHTML = '<div class="cl' + (simple ? ' cl-simple' : '') + '"><div class="cl-tools">' + tools.map(function (t) { return '<button class="cl-tool" data-tool="' + t[0] + '" aria-label="' + t[2] + '"><span>' + t[1] + '</span><small>' + t[2] + '</small></button>'; }).join('') +
      (simple ? '' : '<div class="cl-sizes">' + BRUSH.map(function (w, i) { return '<button class="cl-size" data-size="' + i + '" aria-label="Brush size ' + (i + 1) + '"><i style="width:' + (8 + w * .7) + 'px;height:' + (8 + w * .7) + 'px"></i></button>'; }).join('') + '</div>') +
      '<button class="cl-tool cl-undo" data-act="undo" aria-label="Undo"><span>↩️</span><small>Undo</small></button><button class="cl-tool cl-clear" data-act="clear" aria-label="Start over"><span>🔄</span><small>Start over</small></button></div>' +
      '<div class="cl-stage"><div class="cl-stage-inner"><svg class="cl-svg" viewBox="0 0 800 600" xmlns="' + NS + '">' + defs(k, []) + '<g class="cl-fills"></g><g class="cl-brush" fill="none" stroke-linecap="round" stroke-linejoin="round"></g>' +
      '<g class="cl-lines" fill="none" stroke="#3b2d55" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" pointer-events="none"></g><g class="cl-stks"></g></svg></div>' +
      '<button class="cl-zoomout" data-act="zoomout" aria-label="Zoom out" title="Zoom out">🔎</button></div>' +
      '<div class="cl-swatches"></div>' +
      '<div class="cl-tray">' + STICKERS.map(function (e) { return '<button class="cl-ts" data-e="' + e + '">' + e + '</button>'; }).join('') + met.map(function (id) { return '<button class="cl-ts cl-tsf" data-f="' + id + '"><img src="' + friendImg(id) + '" alt="" draggable="false"></button>'; }).join('') + '</div></div>';
    var root = host.querySelector('.cl'), svg = root.querySelector('svg'), stage = root.querySelector('.cl-stage'), inner = root.querySelector('.cl-stage-inner');
    var gF = svg.querySelector('.cl-fills'), gB = svg.querySelector('.cl-brush'), gL = svg.querySelector('.cl-lines'), gS = svg.querySelector('.cl-stks'), swHost = root.querySelector('.cl-swatches');
    function el(n, at) { var e = document.createElementNS(NS, n); for (var a in at) e.setAttribute(a, at[a]); return e; }
    function ensurePatDef(name, hex) {
      var id = 'cl' + patKey(name, hex) + '_' + k; if (svg.getElementById(id)) return;
      var d = svg.querySelector('defs'); if (!d) return;
      d.insertAdjacentHTML('beforeend', patDef(id, name, hex));
    }
    function paintVal() {
      if (PATTERNS.indexOf(color) >= 0) { ensurePatDef(color, solid); return color + ':' + solid; }
      return color;
    }
    function renderSwatches() {
      var html = SOLIDS.map(swHTML).join('') + SPECIAL.map(swHTML).join('') +
        extraSw.map(function (hx, i) { return '<button class="cl-sw cl-sw-mix" data-c="' + hx + '" data-lab="mix' + i + '" aria-label="mixed color" style="background:' + hx + '"></button>'; }).join('');
      if (!simple) html += '<button class="cl-sw cl-sw-mixer" data-act="mix" aria-label="Mix colors" title="Mix two colors">🎨</button>';
      swHost.innerHTML = html; setColor(color);
    }
    pg.regions.forEach(function (r) {
      var pv = st.f[r.id]; if (pv) { var pp = parsePaint(pv); if (pp.kind === 'pat') ensurePatDef(pp.name, pp.hex); }
      gF.appendChild(el('path', { d: r.d, 'data-r': r.id, fill: paint(st.f[r.id], k), stroke: 'none', class: 'cl-r' })); gL.appendChild(el('path', { d: r.d }));
    });
    pg.lines.forEach(function (d) { gL.appendChild(el('path', { d: d })); });
    function applyZoom() {
      // Transform the SVG itself so getScreenCTM + hit-testing stay in sync when zoomed.
      svg.style.transformOrigin = '50% 50%';
      svg.style.transform = 'translate(' + panX + 'px,' + panY + 'px) scale(' + zoom + ')';
      inner.style.transform = '';
      root.dataset.zoom = zoom > 1.01 ? '1' : '0';
    }
    function resetZoom() { zoom = 1; panX = 0; panY = 0; applyZoom(); }
    function drawStrokes() {
      gB.innerHTML = '';
      st.s.forEach(function (s) {
        if (s.c === 'rainbow') {
          var pts = s.p.split(' ');
          if (pts.length < 2) { gB.appendChild(el('path', { d: strokePath(s), stroke: paint('rainbow', k), 'stroke-width': s.w })); return; }
          for (var i = 0; i < pts.length - 1; i++) {
            var hue = Math.round((i / Math.max(1, pts.length - 2)) * 300);
            gB.appendChild(el('path', { d: 'M' + pts[i] + ' L' + pts[i + 1], stroke: 'hsl(' + hue + ',90%,58%)', 'stroke-width': s.w }));
          }
        } else gB.appendChild(el('path', { d: strokePath(s), stroke: paint(s.c, k), 'stroke-width': s.w }));
      });
    }
    function drawStk() {
      gS.innerHTML = ''; st.k.forEach(function (s, i) {
        var g = el('g', { class: 'cl-stk' + (i === selStk ? ' sel' : ''), transform: stkTransform(s), 'data-i': i }), w = 100 * s.s;
        if (s.f) g.appendChild(el('image', { href: friendImg(s.f), x: -w / 2, y: -w / 2, width: w, height: w }));
        else { var t = el('text', { x: 0, y: 0, 'font-size': w * .8, 'text-anchor': 'middle', 'dominant-baseline': 'central' }); t.textContent = s.e; g.appendChild(t); }
        g.appendChild(el('rect', { x: -w / 2, y: -w / 2, width: w, height: w, fill: 'transparent', class: 'cl-hit' }));
        if (i === selStk) {
          g.appendChild(el('rect', { x: -w / 2 - 4, y: -w / 2 - 4, width: w + 8, height: w + 8, rx: 12, class: 'cl-selbox' }));
          g.appendChild(el('circle', { cx: w / 2, cy: w / 2, r: 22, class: 'cl-handle', 'data-h': i }));
          // rotate + flip handles (screen-space-ish buttons as circles)
          var rot = el('g', { class: 'cl-rot', 'data-rot': i }); rot.appendChild(el('circle', { cx: 0, cy: -w / 2 - 28, r: 20, class: 'cl-rotdot' }));
          var rt = el('text', { x: 0, y: -w / 2 - 28, 'font-size': 18, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'cl-rotlbl', 'pointer-events': 'none' }); rt.textContent = '↻'; rot.appendChild(rt); g.appendChild(rot);
          var flp = el('g', { class: 'cl-flip', 'data-flip': i }); flp.appendChild(el('circle', { cx: -w / 2 - 28, cy: 0, r: 20, class: 'cl-flipdot' }));
          var ft = el('text', { x: -w / 2 - 28, y: 0, 'font-size': 16, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'cl-fliplbl', 'pointer-events': 'none' }); ft.textContent = '⇋'; flp.appendChild(ft); g.appendChild(flp);
        }
        gS.appendChild(g);
      });
    }
    drawStrokes(); drawStk(); renderSwatches(); applyZoom();
    function pt(ev) {
      var m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 };
      var p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; p = p.matrixTransform(m.inverse());
      return { x: Math.round(p.x), y: Math.round(p.y) };
    }
    function sfx(n) { if (A.Audio) A.Audio.sfx(n); }
    function say(id) { if (A.Voice) A.Voice.say([id], { kind: 'prompt' }); }
    function setTool(t) { tool = t; root.dataset.tool = t; root.querySelectorAll('.cl-tool[data-tool]').forEach(function (b) { b.classList.toggle('on', b.dataset.tool === t); }); if (t !== 'stk') { selStk = -1; drawStk(); } }
    function setColor(c) {
      color = c;
      if (hexOk(c)) solid = c;
      if (PATTERNS.indexOf(c) >= 0) ensurePatDef(c, solid);
      root.querySelectorAll('.cl-sw').forEach(function (b) {
        var on = b.dataset.c === c || (PATTERNS.indexOf(c) >= 0 && b.dataset.c === c);
        b.classList.toggle('on', on);
      });
      root.classList.toggle('cl-mixing', !!mixMode);
    }
    function setSize(i) { size = i; root.querySelectorAll('.cl-size').forEach(function (b) { b.classList.toggle('on', +b.dataset.size === i); }); }
    setTool('fill'); setColor(color); setSize(1);
    var api = {
      root: root, svg: svg, state: function () { return st; }, tool: function () { return tool; }, color: function () { return color; },
      setTool: setTool, setColor: setColor, setSize: setSize, zoom: function () { return zoom; }, setZoom: function (z, x, y) { zoom = Math.max(1, Math.min(3, z == null ? 1 : z)); if (x != null) panX = x; if (y != null) panY = y; applyZoom(); }, resetZoom: resetZoom, met: function () { return met.slice(); }, solids: function () { return SOLIDS.slice(); }, extra: function () { return extraSw.slice(); },
      fill: function (rid, c) {
        var r = gF.querySelector('[data-r="' + rid + '"]'); if (!r) return false;
        c = c || paintVal(); var pp = parsePaint(c); if (pp.kind === 'pat') ensurePatDef(pp.name, pp.hex);
        hist.push({ t: 'fill', r: rid, prev: st.f[rid] }); st.f[rid] = c; r.setAttribute('fill', paint(c, k));
        r.classList.remove('cl-pop'); void r.getBBox; r.classList.add('cl-pop'); sfx('pop'); if (o.onChange) o.onChange(); return true;
      },
      stroke: function (pts, c, w) {
        var use = c || paintVal(); if (use === 'glitter' || color === 'glitter') use = 'glitter';
        if (color === 'rainbow' || use === 'rainbow') use = 'rainbow';
        // pattern paints on brush fall back to solid
        if (PATTERNS.indexOf(color) >= 0 && !c) use = solid;
        var p = pts.map(function (q) { return q.x + ',' + q.y; }).join(' ');
        st.s.push({ c: use, w: w || BRUSH[size], p: p }); hist.push({ t: 'stroke' }); capPoints(); drawStrokes(); if (o.onChange) o.onChange();
      },
      addSticker: function (s) {
        st.k.push({ e: s.e, f: s.f, x: s.x == null ? 400 + Math.round(Math.random() * 120 - 60) : s.x, y: s.y == null ? 300 + Math.round(Math.random() * 80 - 40) : s.y, s: s.s || 1, r: s.r || 0, flip: !!s.flip });
        hist.push({ t: 'add' }); selStk = st.k.length - 1; drawStk(); sfx('pop'); if (o.onChange) o.onChange(); return selStk;
      },
      moveSticker: function (i, x, y, sc, noHist) {
        var s = st.k[i]; if (!s) return;
        if (!noHist) hist.push({ t: 'move', i: i, prev: { x: s.x, y: s.y, s: s.s, r: s.r || 0, flip: !!s.flip } });
        s.x = Math.round(x); s.y = Math.round(y); if (sc) s.s = Math.max(.4, Math.min(3, Math.round(sc * 100) / 100)); drawStk();
      },
      rotateSticker: function (i, deg) {
        var s = st.k[i]; if (!s) return;
        hist.push({ t: 'move', i: i, prev: { x: s.x, y: s.y, s: s.s, r: s.r || 0, flip: !!s.flip } });
        s.r = ((s.r || 0) + (deg == null ? 45 : deg)) % 360; drawStk(); sfx('tap'); if (o.onChange) o.onChange();
      },
      flipSticker: function (i) {
        var s = st.k[i]; if (!s) return;
        hist.push({ t: 'move', i: i, prev: { x: s.x, y: s.y, s: s.s, r: s.r || 0, flip: !!s.flip } });
        s.flip = !s.flip; drawStk(); sfx('tap'); if (o.onChange) o.onChange();
      },
      undo: function () {
        var h = hist.pop(); if (!h) return false;
        if (h.t === 'fill') { if (h.prev == null) delete st.f[h.r]; else st.f[h.r] = h.prev; gF.querySelector('[data-r="' + h.r + '"]').setAttribute('fill', paint(st.f[h.r], k)); }
        else if (h.t === 'stroke') { st.s.pop(); drawStrokes(); } else if (h.t === 'add') { st.k.pop(); selStk = -1; drawStk(); }
        else if (h.t === 'move') { var s = st.k[h.i]; if (s) { s.x = h.prev.x; s.y = h.prev.y; s.s = h.prev.s; s.r = h.prev.r || 0; s.flip = !!h.prev.flip; } drawStk(); }
        else if (h.t === 'clear') { st.f = h.prev.f; st.s = h.prev.s; st.k = h.prev.k; gF.querySelectorAll('.cl-r').forEach(function (r) { r.setAttribute('fill', paint(st.f[r.dataset.r], k)); }); drawStrokes(); drawStk(); }
        sfx('tap'); return true;
      },
      clear: function () { hist.push({ t: 'clear', prev: { f: st.f, s: st.s, k: st.k } }); st.f = {}; st.s = []; st.k = []; selStk = -1; gF.querySelectorAll('.cl-r').forEach(function (r) { r.setAttribute('fill', '#fff'); }); drawStrokes(); drawStk(); sfx('soft'); },
      empty: function () { return !Object.keys(st.f).length && !st.s.length && !st.k.length; },
      save: function () { if (api.empty()) return 'empty'; var e = { id: st.id, pg: st.pg, at: Date.now(), f: st.f, s: st.s, k: st.k }; return Gallery.put(P, JSON.parse(JSON.stringify(e))) ? 'saved' : 'full'; },
      celebrate: function () {
        return new Promise(function (resolve) {
          if (api.empty()) { resolve('empty'); return; }
          var quiet = reducedMotion();
          root.classList.add(quiet ? 'cl-done-quiet' : 'cl-done-pop');
          sfx('yay'); sfx('star');
          if (!quiet && A.UI && A.UI.rain) A.UI.rain(36);
          // friends cheer strip
          var cheer = document.createElement('div'); cheer.className = 'cl-cheer' + (quiet ? ' quiet' : '');
          met.slice(0, 4).forEach(function (id) {
            var im = document.createElement('img'); im.src = friendImg(id); im.alt = ''; cheer.appendChild(im);
          });
          var bub = document.createElement('div'); bub.className = 'cl-cheer-msg'; bub.textContent = 'Hang it in the gallery!'; cheer.appendChild(bub);
          root.appendChild(cheer);
          if (A.Voice) A.Voice.say([{ id: 'cl_hang', text: 'Hang it in the gallery!' }], { kind: 'prompt' });
          setTimeout(function () {
            var r = api.save();
            if (cheer.parentNode) cheer.parentNode.removeChild(cheer);
            root.classList.remove('cl-done-pop', 'cl-done-quiet');
            resolve(r);
          }, quiet ? 600 : 1400);
        });
      },
      destroy: function () { host.innerHTML = ''; }
    };
    function capPoints() { var n = 0; st.s.forEach(function (s) { n += s.p.split(' ').length; }); while (n > POINT_CAP && st.s.length > 1) { n -= st.s[0].p.split(' ').length; st.s.shift(); } }
    var drag = null, pointers = {};
    function pointerCount() { return Object.keys(pointers).length; }
    function pinchDist() {
      var ids = Object.keys(pointers); if (ids.length < 2) return 0;
      var a = pointers[ids[0]], b = pointers[ids[1]]; return Math.hypot(a.x - b.x, a.y - b.y);
    }
    function pinchMid() {
      var ids = Object.keys(pointers); var a = pointers[ids[0]], b = pointers[ids[1]]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }
    stage.addEventListener('pointerdown', function (ev) {
      pointers[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
      if (pointerCount() >= 2) {
        drawing = null; drag = null;
        pinch = { d0: pinchDist(), z0: zoom, mid: pinchMid(), pan0x: panX, pan0y: panY };
        return;
      }
      if (ev.target.closest && ev.target.closest('.cl-zoomout')) return;
      ev.preventDefault(); var p = pt(ev), t = ev.target;
      var h = t.closest && t.closest('.cl-handle'), sg = t.closest && t.closest('.cl-stk');
      var rot = t.closest && t.closest('.cl-rot'), flp = t.closest && t.closest('.cl-flip');
      if (rot) { api.rotateSticker(+rot.getAttribute('data-rot')); return; }
      if (flp) { api.flipSticker(+flp.getAttribute('data-flip')); return; }
      if (h) { var i = +h.getAttribute('data-h'), s0 = st.k[i]; drag = { i: i, mode: 'size', x0: s0.x, y0: s0.y, d0: Math.max(30, Math.hypot(p.x - s0.x, p.y - s0.y)), s0: s0.s, moved: false, prev: { x: s0.x, y: s0.y, s: s0.s, r: s0.r || 0, flip: !!s0.flip } }; stage.setPointerCapture(ev.pointerId); return; }
      if (sg && (tool === 'stk' || tool === 'fill')) { var j = +sg.getAttribute('data-i'), s1 = st.k[j]; selStk = j; drawStk(); drag = { i: j, mode: 'move', dx: p.x - s1.x, dy: p.y - s1.y, moved: false, prev: { x: s1.x, y: s1.y, s: s1.s, r: s1.r || 0, flip: !!s1.flip } }; stage.setPointerCapture(ev.pointerId); return; }
      if (tool === 'fill') { var r = t.closest && t.closest('.cl-r'); if (r) api.fill(r.getAttribute('data-r')); return; }
      if (tool === 'brush') {
        var strokeC = color === 'glitter' ? 'glitter' : color === 'rainbow' ? 'rainbow' : (PATTERNS.indexOf(color) >= 0 ? solid : paintVal());
        drawing = { pts: [p], path: el('path', { d: 'M' + p.x + ' ' + p.y + ' l0.1 0', stroke: paint(strokeC === 'rainbow' ? 'rainbow' : strokeC, k), 'stroke-width': BRUSH[size] }), c: strokeC };
        gB.appendChild(drawing.path); stage.setPointerCapture(ev.pointerId); return;
      }
      if (tool === 'stk') { selStk = -1; drawStk(); }
    });
    stage.addEventListener('pointermove', function (ev) {
      if (pointers[ev.pointerId]) pointers[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
      if (pinch && pointerCount() >= 2) {
        var d = pinchDist(); if (d > 0 && pinch.d0 > 0) {
          var nz = Math.max(1, Math.min(3, pinch.z0 * d / pinch.d0));
          var mid = pinchMid(), dx = mid.x - pinch.mid.x, dy = mid.y - pinch.mid.y;
          zoom = nz; panX = pinch.pan0x + dx; panY = pinch.pan0y + dy; applyZoom();
        }
        return;
      }
      var p = pt(ev);
      if (drag) {
        var s = st.k[drag.i]; if (!s) return; drag.moved = true;
        if (drag.mode === 'move') { s.x = Math.max(0, Math.min(800, p.x - drag.dx)); s.y = Math.max(0, Math.min(600, p.y - drag.dy)); }
        else { s.s = Math.max(.4, Math.min(3, Math.round(drag.s0 * Math.max(30, Math.hypot(p.x - drag.x0, p.y - drag.y0)) / drag.d0 * 100) / 100)); }
        drawStk(); return;
      }
      if (drawing) {
        var l = drawing.pts[drawing.pts.length - 1]; if (Math.hypot(p.x - l.x, p.y - l.y) < 4) return; drawing.pts.push(p);
        if (drawing.c === 'rainbow') {
          // live preview: rebuild multi-hue
          while (drawing.path.nextSibling && drawing.path.parentNode === gB) { /* keep first */ break; }
          drawing.path.setAttribute('d', 'M' + drawing.pts.map(function (q) { return q.x + ' ' + q.y; }).join(' L'));
          drawing.path.setAttribute('stroke', paint('rainbow', k));
        } else drawing.path.setAttribute('d', 'M' + drawing.pts.map(function (q) { return q.x + ' ' + q.y; }).join(' L'));
      }
    });
    function up(ev) {
      delete pointers[ev.pointerId];
      if (pointerCount() < 2) pinch = null;
      if (drag) { if (drag.moved) { hist.push({ t: 'move', i: drag.i, prev: drag.prev }); if (o.onChange) o.onChange(); } drag = null; }
      if (drawing) { var d = drawing; drawing = null; if (d.path.parentNode) d.path.parentNode.removeChild(d.path); api.stroke(d.pts, d.c); }
    }
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    root.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b) return;
      if (b.dataset.tool) { setTool(b.dataset.tool); sfx('tap'); say(b.dataset.tool === 'fill' ? 'cl_fill' : b.dataset.tool === 'brush' ? 'cl_brush' : 'cl_stickers'); }
      else if (b.dataset.act === 'mix') {
        mixMode = !mixMode; mixFirst = null; root.classList.toggle('cl-mixing', mixMode); sfx('tap');
        if (mixMode && A.Voice) A.Voice.say([{ id: 'cl_mix', text: 'Tap two colors to mix!' }], { kind: 'prompt' });
      }
      else if (b.dataset.act === 'zoomout') { resetZoom(); sfx('tap'); }
      else if (b.dataset.c) {
        var c = b.dataset.c;
        if (mixMode && hexOk(c)) {
          if (!mixFirst) { mixFirst = c; b.classList.add('mix-pick'); sfx('tap'); return; }
          var blended = mixHex(mixFirst, c);
          if (extraSw.indexOf(blended) < 0) extraSw.push(blended);
          mixMode = false; mixFirst = null; renderSwatches(); setColor(blended); sfx('pop');
          if (A.Voice) A.Voice.say([{ id: 'cl_mixed', text: 'A new color!' }], { kind: 'prompt' });
          return;
        }
        setColor(c); sfx('tap'); if (tool === 'stk') setTool('fill');
      }
      else if (b.dataset.size != null) { setSize(+b.dataset.size); setTool('brush'); sfx('tap'); }
      else if (b.dataset.act === 'undo') { if (api.undo()) say('cl_undo'); }
      else if (b.dataset.act === 'clear') { if (!api.empty()) { api.clear(); say('cl_clear'); } }
      else if (b.dataset.e || b.dataset.f) { setTool('stk'); api.addSticker({ e: b.dataset.e, f: b.dataset.f }); }
    });
    return api;
  }
  A.Coloring = { mount: mount, COLORS: COLORS, SOLIDS: SOLIDS, PATTERNS: PATTERNS, STICKERS: STICKERS, BRUSH: BRUSH, css: css, paint: paint, defs: defs, mixHex: mixHex };
  A.Gallery = Gallery;
})(window.Arcade);
