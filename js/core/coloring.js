/* p4 (2026-10-29): the coloring engine (games/color and the coloring break) + the per-kid Gallery.
   Tools: Fill (tap a part: it all becomes the color; mess-free), Brush (3 sizes), Stickers (drag on, move, resize with the
   corner handle), Undo, Start over. Toddlers (simple): Fill + Stickers only. Layers: fills, brush, line art (never painted
   over, so lines stay clean), stickers. Saved as vectors (fills + simplified strokes + stickers) in p.gallery: small and
   lossless for the picture; capped at GALLERY_MAX pages (a full gallery never drops a page: the grown-up makes room). */
(function (A) {
  var NS = 'http://www.w3.org/2000/svg', uid = 0, GALLERY_MAX = 60, POINT_CAP = 3000;
  var COLORS = [['red', '#ff5d5d'], ['orange', '#ffa53b'], ['yellow', '#ffe14d'], ['green', '#6fd36a'], ['teal', '#3fd0c9'], ['blue', '#4fa3ff'], ['purple', '#a77bff'],
    ['pink', '#ff8fc7'], ['brown', '#b07a4f'], ['black', '#3b2d55'], ['white', '#ffffff'], ['rainbow', 'rainbow'], ['sparkle', 'sparkle']];
  var STICKERS = ['⭐', '❤️', '🌸', '🌈', '🦋', '🎈', '🍓', '🍎', '🌽', '🫐', '🍰', '☀️'];
  var BRUSH = [8, 18, 34];
  function css() { if (document.getElementById('funCss')) return; var l = document.createElement('link'); l.id = 'funCss'; l.rel = 'stylesheet'; l.href = (A.ROOT || '') + 'css/fun.css'; document.head.appendChild(l); }
  function defs(k) {
    return '<defs><linearGradient id="clRb' + k + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5d5d"/><stop offset=".2" stop-color="#ffa53b"/><stop offset=".4" stop-color="#ffe14d"/>' +
      '<stop offset=".6" stop-color="#6fd36a"/><stop offset=".8" stop-color="#4fa3ff"/><stop offset="1" stop-color="#a77bff"/></linearGradient>' +
      '<pattern id="clSp' + k + '" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#ffd76a"/><rect width="40" height="40" fill="#fff3b8" opacity=".45"/>' +
      '<path d="M10 4 L12 10 L18 12 L12 14 L10 20 L8 14 L2 12 L8 10Z" fill="#fff"/><path d="M30 22 L31.5 27 L36 28.5 L31.5 30 L30 35 L28.5 30 L24 28.5 L28.5 27Z" fill="#fff"/><circle cx="30" cy="8" r="2" fill="#fff"/></pattern></defs>';
  }
  function paint(c, k) { return c === 'rainbow' ? 'url(#clRb' + k + ')' : c === 'sparkle' ? 'url(#clSp' + k + ')' : c || '#fff'; }
  function friendImg(id) { return A.Blobs ? A.Blobs.art(id, 'happy', 256) : ''; }
  function stickerSVG(s) {
    var w = 100 * s.s, inner = s.f ? '<image href="' + friendImg(s.f) + '" x="' + (-w / 2) + '" y="' + (-w / 2) + '" width="' + w + '" height="' + w + '"/>' :
      '<text x="0" y="0" font-size="' + (w * .8) + '" text-anchor="middle" dominant-baseline="central">' + s.e + '</text>';
    return '<g class="cl-stk" transform="translate(' + s.x + ' ' + s.y + ')">' + inner + '</g>';
  }
  function strokePath(st) { var p = st.p.split(' '); return 'M' + p[0] + (p.length > 1 ? ' L' + p.slice(1).join(' L') : ' l0.1 0'); }
  // a full picture (gallery / thumbnails): page + saved entry, as an SVG string
  function render(e, cls) {
    var pg = A.ColorPages.byId[e.pg]; if (!pg) return ''; var k = 'g' + (uid++), f = e.f || {};
    var s = '<svg class="' + (cls || 'cl-pic') + '" viewBox="0 0 800 600" xmlns="' + NS + '">' + defs(k) + '<g>';
    pg.regions.forEach(function (r) { s += '<path d="' + r.d + '" fill="' + paint(f[r.id], k) + '"/>'; });
    s += '</g><g fill="none" stroke-linecap="round" stroke-linejoin="round">';
    (e.s || []).forEach(function (st) { s += '<path d="' + strokePath(st) + '" stroke="' + paint(st.c, k) + '" stroke-width="' + st.w + '"/>'; });
    s += '</g><g fill="none" stroke="#3b2d55" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">';
    pg.regions.forEach(function (r) { s += '<path d="' + r.d + '"/>'; }); pg.lines.forEach(function (d) { s += '<path d="' + d + '"/>'; });
    s += '</g>'; (e.k || []).forEach(function (st) { s += stickerSVG(st); });
    return s + '</svg>';
  }
  var Gallery = {
    MAX: GALLERY_MAX,
    list: function (p) { return (p && p.gallery) || []; },
    full: function (p) { return Gallery.list(p).length >= GALLERY_MAX; },
    put: function (p, e) {   // add or update (same id); false only when full (nothing is ever dropped)
      if (!p || p.guest) return false; var g = p.gallery || (p.gallery = []), i = g.map(function (x) { return x.id; }).indexOf(e.id);
      if (i >= 0) { g[i] = e; } else { if (g.length >= GALLERY_MAX) return false; g.push(e); }
      if (A.Store) A.Store.save(); return true;
    },
    remove: function (p, id) { var g = Gallery.list(p), i = g.map(function (x) { return x.id; }).indexOf(id); if (i >= 0) { g.splice(i, 1); if (A.Store) A.Store.save(); } },
    render: render
  };
  function mount(host, o) {
    css(); o = o || {}; var P = o.p, simple = !!o.simple, pg = A.ColorPages.byId[o.page] || A.ColorPages.PAGES[0], k = 'c' + (uid++);
    var st = { id: o.entry ? o.entry.id : 'g' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36), pg: pg.id, f: {}, s: [], k: [] };
    if (o.entry) { st.f = JSON.parse(JSON.stringify(o.entry.f || {})); st.s = JSON.parse(JSON.stringify(o.entry.s || [])); st.k = JSON.parse(JSON.stringify(o.entry.k || [])); }
    var tool = 'fill', color = o.color || '#ff5d5d', size = 1, hist = [], selStk = -1, drawing = null;
    var met = A.Story2 && A.Story2.met && P ? A.Story2.met(P) : ((A.Blobs && A.Blobs.STARTERS) || []);
    var tools = simple ? [['fill', '🪣', 'Fill'], ['stk', '⭐', 'Stickers']] : [['fill', '🪣', 'Fill'], ['brush', '🖌️', 'Brush'], ['stk', '⭐', 'Stickers']];
    host.innerHTML = '<div class="cl' + (simple ? ' cl-simple' : '') + '"><div class="cl-tools">' + tools.map(function (t) { return '<button class="cl-tool" data-tool="' + t[0] + '" aria-label="' + t[2] + '"><span>' + t[1] + '</span><small>' + t[2] + '</small></button>'; }).join('') +
      (simple ? '' : '<div class="cl-sizes">' + BRUSH.map(function (w, i) { return '<button class="cl-size" data-size="' + i + '" aria-label="Brush size ' + (i + 1) + '"><i style="width:' + (8 + w * .7) + 'px;height:' + (8 + w * .7) + 'px"></i></button>'; }).join('') + '</div>') +
      '<button class="cl-tool cl-undo" data-act="undo" aria-label="Undo"><span>↩️</span><small>Undo</small></button><button class="cl-tool cl-clear" data-act="clear" aria-label="Start over"><span>🔄</span><small>Start over</small></button></div>' +
      '<div class="cl-stage"><svg class="cl-svg" viewBox="0 0 800 600" xmlns="' + NS + '">' + defs(k) + '<g class="cl-fills"></g><g class="cl-brush" fill="none" stroke-linecap="round" stroke-linejoin="round"></g>' +
      '<g class="cl-lines" fill="none" stroke="#3b2d55" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" pointer-events="none"></g><g class="cl-stks"></g></svg></div>' +
      '<div class="cl-swatches">' + COLORS.map(function (c) { return '<button class="cl-sw cl-sw-' + c[0] + '" data-c="' + c[1] + '" aria-label="' + c[0] + '"' + (c[1].charAt(0) === '#' ? ' style="background:' + c[1] + '"' : '') + '></button>'; }).join('') + '</div>' +
      '<div class="cl-tray">' + STICKERS.map(function (e) { return '<button class="cl-ts" data-e="' + e + '">' + e + '</button>'; }).join('') + met.map(function (id) { return '<button class="cl-ts cl-tsf" data-f="' + id + '"><img src="' + friendImg(id) + '" alt="" draggable="false"></button>'; }).join('') + '</div></div>';
    var root = host.querySelector('.cl'), svg = root.querySelector('svg'), gF = svg.querySelector('.cl-fills'), gB = svg.querySelector('.cl-brush'), gL = svg.querySelector('.cl-lines'), gS = svg.querySelector('.cl-stks');
    function el(n, at) { var e = document.createElementNS(NS, n); for (var a in at) e.setAttribute(a, at[a]); return e; }
    pg.regions.forEach(function (r) { gF.appendChild(el('path', { d: r.d, 'data-r': r.id, fill: paint(st.f[r.id], k), stroke: 'none', class: 'cl-r' })); gL.appendChild(el('path', { d: r.d })); });
    pg.lines.forEach(function (d) { gL.appendChild(el('path', { d: d })); });
    function drawStrokes() { gB.innerHTML = ''; st.s.forEach(function (s) { gB.appendChild(el('path', { d: strokePath(s), stroke: paint(s.c, k), 'stroke-width': s.w })); }); }
    function drawStk() {
      gS.innerHTML = ''; st.k.forEach(function (s, i) {
        var g = el('g', { class: 'cl-stk' + (i === selStk ? ' sel' : ''), transform: 'translate(' + s.x + ' ' + s.y + ')', 'data-i': i }), w = 100 * s.s;
        if (s.f) g.appendChild(el('image', { href: friendImg(s.f), x: -w / 2, y: -w / 2, width: w, height: w }));
        else { var t = el('text', { x: 0, y: 0, 'font-size': w * .8, 'text-anchor': 'middle', 'dominant-baseline': 'central' }); t.textContent = s.e; g.appendChild(t); }
        g.appendChild(el('rect', { x: -w / 2, y: -w / 2, width: w, height: w, fill: 'transparent', class: 'cl-hit' }));
        if (i === selStk) { g.appendChild(el('rect', { x: -w / 2 - 4, y: -w / 2 - 4, width: w + 8, height: w + 8, rx: 12, class: 'cl-selbox' })); g.appendChild(el('circle', { cx: w / 2, cy: w / 2, r: 22, class: 'cl-handle', 'data-h': i })); }
        gS.appendChild(g); });
    }
    drawStrokes(); drawStk();
    function pt(ev) { var m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 }; var p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; p = p.matrixTransform(m.inverse()); return { x: Math.round(p.x), y: Math.round(p.y) }; }
    function sfx(n) { if (A.Audio) A.Audio.sfx(n); }
    function say(id) { if (A.Voice) A.Voice.say([id], { kind: 'prompt' }); }
    function setTool(t) { tool = t; root.dataset.tool = t; root.querySelectorAll('.cl-tool[data-tool]').forEach(function (b) { b.classList.toggle('on', b.dataset.tool === t); }); if (t !== 'stk') { selStk = -1; drawStk(); } }
    function setColor(c) { color = c; root.querySelectorAll('.cl-sw').forEach(function (b) { b.classList.toggle('on', b.dataset.c === c); }); }
    function setSize(i) { size = i; root.querySelectorAll('.cl-size').forEach(function (b) { b.classList.toggle('on', +b.dataset.size === i); }); }
    setTool('fill'); setColor(color); setSize(1);
    var api = {
      root: root, svg: svg, state: function () { return st; }, tool: function () { return tool; }, color: function () { return color; }, setTool: setTool, setColor: setColor, setSize: setSize,
      fill: function (rid, c) { var r = gF.querySelector('[data-r="' + rid + '"]'); if (!r) return false; c = c || color; hist.push({ t: 'fill', r: rid, prev: st.f[rid] }); st.f[rid] = c; r.setAttribute('fill', paint(c, k));
        r.classList.remove('cl-pop'); void r.getBBox; r.classList.add('cl-pop'); sfx('pop'); if (o.onChange) o.onChange(); return true; },
      stroke: function (pts, c, w) { var p = pts.map(function (q) { return q.x + ',' + q.y; }).join(' '); st.s.push({ c: c || color, w: w || BRUSH[size], p: p }); hist.push({ t: 'stroke' }); capPoints(); drawStrokes(); if (o.onChange) o.onChange(); },
      addSticker: function (s) { st.k.push({ e: s.e, f: s.f, x: s.x == null ? 400 + Math.round(Math.random() * 120 - 60) : s.x, y: s.y == null ? 300 + Math.round(Math.random() * 80 - 40) : s.y, s: s.s || 1 }); hist.push({ t: 'add' }); selStk = st.k.length - 1; drawStk(); sfx('pop'); if (o.onChange) o.onChange(); return selStk; },
      moveSticker: function (i, x, y, sc, noHist) { var s = st.k[i]; if (!s) return; if (!noHist) hist.push({ t: 'move', i: i, prev: { x: s.x, y: s.y, s: s.s } }); s.x = Math.round(x); s.y = Math.round(y); if (sc) s.s = Math.max(.4, Math.min(3, Math.round(sc * 100) / 100)); drawStk(); },
      undo: function () { var h = hist.pop(); if (!h) return false;
        if (h.t === 'fill') { if (h.prev == null) delete st.f[h.r]; else st.f[h.r] = h.prev; gF.querySelector('[data-r="' + h.r + '"]').setAttribute('fill', paint(st.f[h.r], k)); }
        else if (h.t === 'stroke') { st.s.pop(); drawStrokes(); } else if (h.t === 'add') { st.k.pop(); selStk = -1; drawStk(); }
        else if (h.t === 'move') { var s = st.k[h.i]; if (s) { s.x = h.prev.x; s.y = h.prev.y; s.s = h.prev.s; } drawStk(); }
        else if (h.t === 'clear') { st.f = h.prev.f; st.s = h.prev.s; st.k = h.prev.k; gF.querySelectorAll('.cl-r').forEach(function (r) { r.setAttribute('fill', paint(st.f[r.dataset.r], k)); }); drawStrokes(); drawStk(); }
        sfx('tap'); return true; },
      clear: function () { hist.push({ t: 'clear', prev: { f: st.f, s: st.s, k: st.k } }); st.f = {}; st.s = []; st.k = []; selStk = -1; gF.querySelectorAll('.cl-r').forEach(function (r) { r.setAttribute('fill', '#fff'); }); drawStrokes(); drawStk(); sfx('soft'); },
      empty: function () { return !Object.keys(st.f).length && !st.s.length && !st.k.length; },
      save: function () { if (api.empty()) return 'empty'; var e = { id: st.id, pg: st.pg, at: Date.now(), f: st.f, s: st.s, k: st.k }; return Gallery.put(P, JSON.parse(JSON.stringify(e))) ? 'saved' : 'full'; },
      destroy: function () { host.innerHTML = ''; }
    };
    function capPoints() { var n = 0; st.s.forEach(function (s) { n += s.p.split(' ').length; }); while (n > POINT_CAP && st.s.length > 1) { n -= st.s[0].p.split(' ').length; st.s.shift(); } }
    // input (touch + mouse via pointer events)
    var drag = null;
    svg.addEventListener('pointerdown', function (ev) {
      ev.preventDefault(); var p = pt(ev), t = ev.target, h = t.closest && t.closest('.cl-handle'), sg = t.closest && t.closest('.cl-stk');
      if (h) { var i = +h.getAttribute('data-h'), s0 = st.k[i]; drag = { i: i, mode: 'size', x0: s0.x, y0: s0.y, d0: Math.max(30, Math.hypot(p.x - s0.x, p.y - s0.y)), s0: s0.s, moved: false, prev: { x: s0.x, y: s0.y, s: s0.s } }; svg.setPointerCapture(ev.pointerId); return; }
      if (sg && (tool === 'stk' || tool === 'fill')) { var j = +sg.getAttribute('data-i'), s1 = st.k[j]; selStk = j; drawStk(); drag = { i: j, mode: 'move', dx: p.x - s1.x, dy: p.y - s1.y, moved: false, prev: { x: s1.x, y: s1.y, s: s1.s } }; svg.setPointerCapture(ev.pointerId); return; }
      if (tool === 'fill') { var r = t.closest && t.closest('.cl-r'); if (r) api.fill(r.getAttribute('data-r')); return; }
      if (tool === 'brush') { drawing = { pts: [p], path: el('path', { d: 'M' + p.x + ' ' + p.y + ' l0.1 0', stroke: paint(color, k), 'stroke-width': BRUSH[size] }) }; gB.appendChild(drawing.path); svg.setPointerCapture(ev.pointerId); return; }
      if (tool === 'stk') { selStk = -1; drawStk(); }
    });
    svg.addEventListener('pointermove', function (ev) {
      var p = pt(ev);
      if (drag) { var s = st.k[drag.i]; if (!s) return; drag.moved = true;
        if (drag.mode === 'move') { s.x = Math.max(0, Math.min(800, p.x - drag.dx)); s.y = Math.max(0, Math.min(600, p.y - drag.dy)); }
        else { s.s = Math.max(.4, Math.min(3, Math.round(drag.s0 * Math.max(30, Math.hypot(p.x - drag.x0, p.y - drag.y0)) / drag.d0 * 100) / 100)); }
        drawStk(); return; }
      if (drawing) { var l = drawing.pts[drawing.pts.length - 1]; if (Math.hypot(p.x - l.x, p.y - l.y) < 4) return; drawing.pts.push(p);
        drawing.path.setAttribute('d', 'M' + drawing.pts.map(function (q) { return q.x + ' ' + q.y; }).join(' L')); }
    });
    function up() {
      if (drag) { if (drag.moved) { hist.push({ t: 'move', i: drag.i, prev: drag.prev }); if (o.onChange) o.onChange(); } drag = null; }
      if (drawing) { var d = drawing; drawing = null; if (d.path.parentNode) d.path.parentNode.removeChild(d.path); api.stroke(d.pts); }
    }
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
    root.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b) return;
      if (b.dataset.tool) { setTool(b.dataset.tool); sfx('tap'); say(b.dataset.tool === 'fill' ? 'cl_fill' : b.dataset.tool === 'brush' ? 'cl_brush' : 'cl_stickers'); }
      else if (b.dataset.c) { setColor(b.dataset.c); sfx('tap'); if (tool === 'stk') setTool('fill'); }
      else if (b.dataset.size != null) { setSize(+b.dataset.size); setTool('brush'); sfx('tap'); }
      else if (b.dataset.act === 'undo') { if (api.undo()) say('cl_undo'); }
      else if (b.dataset.act === 'clear') { if (!api.empty()) { api.clear(); say('cl_clear'); } }
      else if (b.dataset.e || b.dataset.f) { setTool('stk'); api.addSticker({ e: b.dataset.e, f: b.dataset.f }); }
    });
    return api;
  }
  A.Coloring = { mount: mount, COLORS: COLORS, STICKERS: STICKERS, BRUSH: BRUSH, css: css };
  A.Gallery = Gallery;
})(window.Arcade);
