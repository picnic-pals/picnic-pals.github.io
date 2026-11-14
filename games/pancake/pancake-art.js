/* Pancake Stack Race art map. Locked stand art lives in arcade/art/pancake/.
   SRC holds each piece URL; drawers fall back to SVG if a src is missing.
   Stack geometry uses the locked 1024-canvas anchors (do not scale a one to fill the canvas). */
(function (A) {
  'use strict';

  var NEEDED = [
    { id: 'stand_bg', name: 'Pancake stand background', notes: 'Warm outdoor breakfast stand, counter, sky. Portrait and landscape crops.' },
    { id: 'stand_bg_portrait', name: 'Stand background, portrait crop', notes: 'Tall crop of the stand and sky.' },
    { id: 'stand_bg_landscape', name: 'Stand background, landscape crop', notes: 'Wide crop of the stand and sky.' },
    { id: 'griddle', name: 'Griddle', notes: 'Flat breakfast griddle on the counter. Room for a plate in front.' },
    { id: 'plate', name: 'Serving plate', notes: 'Round cream plate. Pancakes stack on top. Leave a clear center.' },
    { id: 'friend_plate', name: 'Friend\'s plate', notes: 'Matching plate for the race stack on the friend\'s side.' },
    { id: 'pancake_gold', name: 'Small golden pancake (one)', notes: 'Front-facing small pancake. Used as a one.' },
    { id: 'pancake_berry', name: 'Small berry pancake (one)', notes: 'Pink/berry small pancake for picture-match orders.' },
    { id: 'pancake_blue', name: 'Small blueberry pancake (one)', notes: 'Blue small pancake for picture-match orders.' },
    { id: 'pancake_ten', name: 'Big pancake (ten)', notes: 'Clearly larger than a one. Used as a ten in place-value orders.' },
    { id: 'waffle_hundred', name: 'Giant waffle (hundred)', notes: 'Big square waffle, clearly larger than a ten. Used as a hundred.' },
    { id: 'topping_syrup', name: 'Syrup topping', notes: 'A shine of syrup that pops onto a finished stack.' },
    { id: 'topping_berries', name: 'Berry topping', notes: 'A few berries that pop onto a finished stack.' },
    { id: 'topping_cream', name: 'Whipped cream topping', notes: 'A dollop of cream that pops onto a finished stack.' },
    { id: 'topping_butter', name: 'Butter topping', notes: 'A pat of butter that pops onto a finished stack.' },
    { id: 'topping_banana', name: 'Banana-slice topping', notes: 'Banana slices that pop onto a finished stack.' },
    { id: 'topping_choc', name: 'Chocolate-chip topping', notes: 'Chocolate chips that pop onto a finished stack.' },
    { id: 'deco_bunting', name: 'Bunting decoration', notes: 'Flags across the stand after an order.' },
    { id: 'deco_menu_board', name: 'Menu board decoration', notes: 'A little menu on the stand.' },
    { id: 'deco_flower_pot', name: 'Flower pot decoration', notes: 'Counter or window box.' },
    { id: 'deco_string_lights', name: 'String lights decoration', notes: 'Hangs above the stand.' },
    { id: 'deco_plant', name: 'Plant decoration', notes: 'Floor or shelf plant.' },
    { id: 'deco_sign', name: 'Stand sign decoration', notes: 'A painted "Pancakes" sign.' },
    { id: 'deco_stool', name: 'Stool decoration', notes: 'A guest stool by the counter.' },
    { id: 'deco_jar', name: 'Syrup jar decoration', notes: 'A jar of syrup on the counter.' },
    { id: 'boss_banner', name: 'Breakfast-party banner', notes: 'Festive banner for the boss order. No text required.' },
    { id: 'spatula', name: 'Spatula', notes: 'Optional utensil on the griddle. Decorative.' }
  ];

  var ART = '../../art/pancake/';
  var SRC = {
    stand_bg: ART + 'stand_bg_portrait.webp',
    stand_bg_portrait: ART + 'stand_bg_portrait.webp',
    stand_bg_landscape: ART + 'stand_bg_landscape.webp',
    griddle: ART + 'griddle.webp',
    plate: ART + 'plate.webp',
    friend_plate: ART + 'friend_plate.webp',
    pancake_gold: ART + 'pancake_gold.webp',
    pancake_berry: ART + 'pancake_berry.webp',
    pancake_blue: ART + 'pancake_blue.webp',
    pancake_ten: ART + 'pancake_ten.webp',
    waffle_hundred: ART + 'waffle_hundred.webp',
    topping_syrup: ART + 'topping_syrup.webp',
    syrup_bottle_upright: ART + 'syrup_bottle_upright.webp',
    syrup_bottle_pour: ART + 'syrup_bottle_pour.webp',
    syrup_stream: ART + 'syrup_stream.webp',
    syrup_cork: ART + 'syrup_cork.webp',
    topping_berries: ART + 'topping_berries.webp',
    topping_cream: ART + 'topping_cream.webp',
    topping_butter: ART + 'topping_butter.webp',
    topping_banana: ART + 'topping_banana.webp',
    topping_choc: ART + 'topping_choc.webp',
    deco_bunting: ART + 'deco_bunting.webp',
    deco_menu_board: ART + 'deco_menu_board.webp',
    deco_flower_pot: ART + 'deco_flower_pot.webp',
    deco_string_lights: ART + 'deco_string_lights.webp',
    deco_plant: ART + 'deco_plant.webp',
    deco_sign: ART + 'deco_sign.webp',
    deco_stool: ART + 'deco_stool.webp',
    deco_jar: ART + 'deco_jar.webp',
    boss_banner: ART + 'boss_banner.webp',
    spatula: ART + 'spatula.webp'
  };

  function src(id) { return SRC[id] || ''; }
  function has(id) { return !!src(id); }

  var CANVAS = 1024;
  var GEOM = {
    pancake_gold:   { cx: 512, base: 799, top: 722, step: 77,  bbox: [327, 524, 697, 800], width: 370 },
    pancake_berry:  { cx: 512, base: 799, top: 722, step: 77,  bbox: [327, 524, 697, 800], width: 370 },
    pancake_blue:   { cx: 512, base: 799, top: 722, step: 77,  bbox: [327, 524, 697, 800], width: 370 },
    pancake_ten:    { cx: 512, base: 799, top: 644, step: 155, bbox: [242, 391, 782, 800], width: 540 },
    waffle_hundred: { cx: 512, base: 798, top: 603, step: 195, bbox: [153, 256, 871, 799], width: 720 },
    plate:          { anchor: [512, 629], bbox: [33, 283, 991, 879] },
    friend_plate:   { anchor: [512, 648], bbox: [33, 328, 991, 879] },
    topping_syrup:  { anchor: [512, 726], drip: 779, bbox: [362, 573, 662, 780] },
    topping_berries:{ anchor: [512, 779], bbox: [377, 558, 647, 780] },
    topping_cream:  { anchor: [512, 779], bbox: [387, 551, 637, 780] },
    topping_butter: { anchor: [512, 779], bbox: [417, 625, 607, 780] },
    topping_banana: { anchor: [512, 779], bbox: [377, 567, 647, 780] },
    topping_choc:   { anchor: [512, 779], bbox: [387, 600, 637, 780] }
  };
  function pieceId(kind, color) {
    if (kind === 'hundred') return 'waffle_hundred';
    if (kind === 'ten') return 'pancake_ten';
    var c = color || 'gold';
    return 'pancake_' + (c === 'berry' || c === 'blue' ? c : 'gold');
  }
  function escAttr(s) {
    return A.esc ? A.esc(s) : String(s).replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }
  function imgTag(id, cls) {
    return '<img class="' + cls + '" data-art="' + id + '" src="' + src(id) + '" alt="" draggable="false">';
  }
  function thumb(id, w) {
    var g = GEOM[id], u = src(id);
    if (!u) return '';
    w = w || 48;
    if (!g || !g.bbox) {
      return '<span class="pc-thumb" data-art="' + id + '" style="width:' + w + 'px;height:' + w + 'px">' +
        '<img src="' + u + '" alt="" draggable="false" style="width:100%;height:auto;left:0;top:0"></span>';
    }
    var bw = g.bbox[2] - g.bbox[0], bh = g.bbox[3] - g.bbox[1];
    var h = w * bh / bw;
    var imgW = w * CANVAS / bw;
    var left = -g.bbox[0] * w / bw;
    var top = -g.bbox[1] * w / bw;
    return '<span class="pc-thumb" data-art="' + id + '" style="width:' + w + 'px;height:' + h.toFixed(2) + 'px">' +
      '<img src="' + u + '" alt="" draggable="false" style="width:' + imgW.toFixed(2) + 'px;height:auto;left:' + left.toFixed(2) + 'px;top:' + top.toFixed(2) + 'px"></span>';
  }
  function kindOf(c) {
    return (c && (c.kind === 'hundred' || c.kind === 'ten')) ? c.kind : 'one';
  }
  function pieceWidth(kind, color) {
    var g = GEOM[pieceId(kind, color)] || GEOM.pancake_gold;
    return g.width || (g.bbox[2] - g.bbox[0]);
  }
  var COL_MAX = { hundred: 9, ten: 9, one: 10 };
  function groupList(cakes) {
    var buckets = { hundred: [], ten: [], one: [] };
    (cakes || []).forEach(function (c) { buckets[kindOf(c)].push(c); });
    var out = [];
    ['hundred', 'ten', 'one'].forEach(function (k) {
      var list = buckets[k], cap = COL_MAX[k] || 9, i;
      if (!list.length) return;
      for (i = 0; i < list.length; i += cap) out.push({ kind: k, cakes: list.slice(i, i + cap) });
    });
    return out;
  }
  function extendBBox(box, x, y, bbox, s) {
    s = (s == null) ? 1 : s;
    box.minX = Math.min(box.minX, x + bbox[0] * s);
    box.minY = Math.min(box.minY, y + bbox[1] * s);
    box.maxX = Math.max(box.maxX, x + bbox[2] * s);
    box.maxY = Math.max(box.maxY, y + bbox[3] * s);
  }
  function badgeOk(opts, group, count) {
    if (!opts || !opts.badges || !count) return false;
    if (opts.badges === 'live') return group === 'one' && count === 10;
    return true;
  }
  function measureGroups(cakes, opts) {
    opts = opts || {};
    var plateId = opts.plateId || 'plate';
    var plat = GEOM[plateId] || GEOM.plate;
    var items = [{ typ: 'plate', id: plateId, x: 0, y: 0, s: 1 }];
    var box = { minX: plat.bbox[0], minY: plat.bbox[1], maxX: plat.bbox[2], maxY: plat.bbox[3] };
    var groups = groupList(cakes);
    var widths = groups.map(function (g) { return pieceWidth(g.kind, g.cakes[0] && g.cakes[0].color); });
    var gap = 96;
    var total = widths.reduce(function (s, w) { return s + w; }, 0) + Math.max(0, widths.length - 1) * gap;
    var usable = 800;
    var s = (total > usable && total > 0) ? usable / total : 1;
    var left = plat.anchor[0] - (total * s) / 2;
    var i, j, g, geom, id, worldX, worldY, x, y, tp, tip;
    for (i = 0; i < groups.length; i++) {
      g = groups[i];
      worldX = left + (widths[i] * s) / 2;
      worldY = plat.anchor[1];
      g.cx = worldX;
      g.s = s;
      for (j = 0; j < g.cakes.length; j++) {
        id = pieceId(g.cakes[j].kind, g.cakes[j].color);
        geom = GEOM[id] || GEOM.pancake_gold;
        x = worldX - geom.cx * s;
        y = worldY - geom.base * s;
        items.push({ typ: 'cake', id: id, cake: g.cakes[j], group: g.kind, bottom: j === 0, x: x, y: y, s: s });
        extendBBox(box, x, y, geom.bbox, s);
        worldY -= geom.step * s;
      }
      if (opts.topping && i === groups.length - 1 && GEOM['topping_' + opts.topping]) {
        tp = GEOM['topping_' + opts.topping];
        x = worldX - tp.anchor[0] * s;
        y = worldY - tp.anchor[1] * s;
        items.push({ typ: 'topping', id: 'topping_' + opts.topping, x: x, y: y, s: s });
        tip = tp.drip != null ? tp.drip : tp.bbox[3];
        extendBBox(box, x, y, [tp.bbox[0], tp.bbox[1], tp.bbox[2], tip], s);
      }
      if (badgeOk(opts, g.kind, g.cakes.length)) {
        items.push({ typ: 'badge', group: g.kind, count: g.cakes.length, x: worldX, y: plat.bbox[3] + 8, s: 1 });
        box.maxY = Math.max(box.maxY, plat.bbox[3] + 40);
        box.minX = Math.min(box.minX, worldX - 20);
        box.maxX = Math.max(box.maxX, worldX + 20);
      }
      left += (widths[i] + gap) * s;
    }
    box.minX -= 10; box.minY -= 10; box.maxX += 10; box.maxY += 10;
    return { items: items, minX: box.minX, minY: box.minY, w: box.maxX - box.minX, h: box.maxY - box.minY, groups: groups, pieceScale: s };
  }
  function measureTenframeCompact(cakes, opts, list, plat, plateId) {
    var items = [{ typ: 'plate', id: plateId, x: 0, y: 0, s: 1 }];
    var box = { minX: plat.bbox[0], minY: plat.bbox[1], maxX: plat.bbox[2], maxY: plat.bbox[3] };
    var geom0 = GEOM.pancake_gold;
    var pw = geom0.width || 370;
    var ph = geom0.bbox[3] - geom0.bbox[1];
    var cols = 5;
    var cellW = pw + 28;
    var cellH = ph + 16;
    var frameGap = 110;
    var frames = Math.max(1, Math.ceil(list.length / 10));
    var rows = frames * 2;
    var gridW = cols * cellW;
    var platW = plat.bbox[2] - plat.bbox[0];
    var s = platW / gridW;
    if (s > 1) s = 1;
    var left = plat.anchor[0] - (gridW * s) / 2;
    function yOff(rowFromBottom) {
      var y = rowFromBottom * cellH * s;
      if (rowFromBottom >= 2) y += frameGap * s;
      return y;
    }
    var gridSpan = rows > 1 ? yOff(rows - 1) : 0;
    var platMidY = (plat.bbox[1] + plat.bbox[3]) / 2;
    var bottomWorldY = platMidY + gridSpan / 2;
    var i, cake, id, geom, frame, idx, col, rowInFrame, rowFromBottom, worldX, worldY, x, y, frameCounts, frameY;
    frameCounts = [];
    frameY = [];
    for (i = 0; i < list.length; i++) {
      cake = list[i];
      frame = Math.floor(i / 10);
      idx = i % 10;
      col = idx % 5;
      rowInFrame = Math.floor(idx / 5);
      /* Lower frame sits toward the plate; later frames stack up. Row 0 is the bottom row of a frame. */
      rowFromBottom = frame * 2 + (1 - rowInFrame);
      worldX = left + (cellW * s) / 2 + col * cellW * s;
      worldY = bottomWorldY - yOff(rowFromBottom);
      id = pieceId(cake.kind, cake.color);
      geom = GEOM[id] || geom0;
      x = worldX - geom.cx * s;
      y = worldY - geom.base * s;
      items.push({ typ: 'cake', id: id, cake: cake, group: 'one', frame: frame, bottom: rowFromBottom === 0, x: x, y: y, s: s });
      extendBBox(box, x, y, geom.bbox, s);
      frameCounts[frame] = (frameCounts[frame] || 0) + 1;
      frameY[frame] = (frameY[frame] || 0) + worldY;
    }
    if (opts.topping && list.length && GEOM['topping_' + opts.topping]) {
      var last = items[items.length - 1];
      var tp = GEOM['topping_' + opts.topping];
      x = last.x + (512 - tp.anchor[0]) * s;
      y = last.y + (512 - tp.anchor[1]) * s - 40 * s;
      items.push({ typ: 'topping', id: 'topping_' + opts.topping, x: x, y: y, s: s });
      extendBBox(box, x, y, tp.bbox, s);
    }
    if (opts.badges && list.length) {
      for (i = 0; i < frameCounts.length; i++) {
        if (!badgeOk(opts, 'one', frameCounts[i])) continue;
        var midY = frameY[i] / frameCounts[i];
        items.push({ typ: 'badge', group: 'one', count: frameCounts[i], x: plat.bbox[2] - 12, y: midY - 18, s: 1 });
      }
      if (items.some(function (it) { return it.typ === 'badge'; })) box.maxX = Math.max(box.maxX, plat.bbox[2] + 36);
    }
    box.minX -= 8; box.minY -= 8; box.maxX += 8; box.maxY += 8;
    return { items: items, minX: box.minX, minY: box.minY, w: box.maxX - box.minX, h: box.maxY - box.minY, pieceScale: s, vertical: true, compact: true };
  }
  function measureTenframe(cakes, opts) {
    opts = opts || {};
    var plateId = opts.plateId || 'plate';
    var plat = GEOM[plateId] || GEOM.plate;
    var items = [{ typ: 'plate', id: plateId, x: 0, y: 0, s: 1 }];
    var box = { minX: plat.bbox[0], minY: plat.bbox[1], maxX: plat.bbox[2], maxY: plat.bbox[3] };
    var list = (cakes || []).slice();
    var compact = !!opts.vertical || ((opts.fitH || 999) < 260) || ((opts.fitW || 999) < 560 && list.length > 10);
    if (compact && list.length) return measureTenframeCompact(cakes, opts, list, plat, plateId);
    var geom0 = GEOM.pancake_gold;
    var pw = geom0.width || 370;
    var ph = (geom0.bbox[3] - geom0.bbox[1]);
    var gap = 140;
    var rowGap = 100;
    var frames = list.length ? Math.max(1, Math.ceil(list.length / 10)) : 0;
    var frameW = 5 * pw + 4 * gap;
    var frameH = 2 * ph + rowGap;
    var frameGap = 100;
    var vertical = !!opts.vertical || (frames > 1 && (opts.fitW || 999) < 560);
    var totalW = vertical ? frameW : (frames * frameW + Math.max(0, frames - 1) * frameGap);
    var usable = 860;
    var s = (totalW > usable && totalW > 0) ? usable / totalW : 1;
    var left = plat.anchor[0] - (totalW * s) / 2;
    var i, cake, id, geom, frame, idx, col, row, worldX, worldY, x, y, frameCounts;
    frameCounts = [];
    for (i = 0; i < list.length; i++) {
      cake = list[i];
      frame = Math.floor(i / 10);
      idx = i % 10;
      col = idx % 5;
      row = Math.floor(idx / 5);
      frameCounts[frame] = (frameCounts[frame] || 0) + 1;
      if (vertical) {
        worldX = left + (pw * s) / 2 + col * (pw + gap) * s;
        worldY = plat.anchor[1] - frame * (frameH + frameGap) * s - row * (ph + rowGap) * s;
      } else {
        worldX = left + frame * (frameW + frameGap) * s + (pw * s) / 2 + col * (pw + gap) * s;
        worldY = plat.anchor[1] - row * (ph + rowGap) * s;
      }
      id = pieceId(cake.kind, cake.color);
      geom = GEOM[id] || geom0;
      x = worldX - geom.cx * s;
      y = worldY - geom.base * s;
      items.push({ typ: 'cake', id: id, cake: cake, group: 'one', frame: frame, bottom: row === 0 && frame === (vertical ? frames - 1 : 0) || row === 0, x: x, y: y, s: s });
      extendBBox(box, x, y, geom.bbox, s);
    }
    if (opts.topping && list.length && GEOM['topping_' + opts.topping]) {
      var last = items[items.length - 1];
      var tp = GEOM['topping_' + opts.topping];
      x = last.x + (512 - tp.anchor[0]) * s;
      y = last.y + (512 - tp.anchor[1]) * s - 40 * s;
      items.push({ typ: 'topping', id: 'topping_' + opts.topping, x: x, y: y, s: s });
      extendBBox(box, x, y, tp.bbox, s);
    }
    if (opts.badges && list.length) {
      var anyBadge = false;
      for (i = 0; i < frameCounts.length; i++) {
        if (!badgeOk(opts, 'one', frameCounts[i])) continue;
        if (vertical) worldX = left + (totalW * s) / 2;
        else worldX = left + i * (frameW + frameGap) * s + (frameW * s) / 2;
        items.push({ typ: 'badge', group: 'one', count: frameCounts[i], x: worldX, y: plat.bbox[3] + 8, s: 1 });
        anyBadge = true;
      }
      if (anyBadge) box.maxY = Math.max(box.maxY, plat.bbox[3] + 40);
    }
    box.minX -= 10; box.minY -= 10; box.maxX += 10; box.maxY += 10;
    return { items: items, minX: box.minX, minY: box.minY, w: box.maxX - box.minX, h: box.maxY - box.minY, pieceScale: s, vertical: vertical };
  }
  function measureStack(cakes, opts) {
    opts = opts || {};
    if (opts.mode === 'tenframe') return measureTenframe(cakes, opts);
    return measureGroups(cakes, opts);
  }
  function stackStage(cakes, opts) {
    opts = opts || {};
    var plateId = opts.plateId || 'plate';
    if (!has(plateId)) return '';
    var availW = Math.max(40, opts.fitW || 280);
    var availH = Math.max(40, opts.fitH || 180);
    var m = measureStack(cakes, Object.assign({}, opts, { fitW: availW, fitH: availH }));
    var scale = Math.min(availW / m.w, availH / m.h, opts.maxScale || 0.5);
    if (opts.mode === 'tenframe') {
      var vis = (GEOM.pancake_gold.width || 370) * (m.pieceScale || 1) * scale;
      if (vis < 46 && !m.vertical) {
        m = measureStack(cakes, Object.assign({}, opts, { fitW: availW, fitH: availH, vertical: true }));
        scale = Math.min(availW / m.w, availH / m.h, opts.maxScale || 0.5);
        vis = (GEOM.pancake_gold.width || 370) * (m.pieceScale || 1) * scale;
      }
      if (vis < 46) {
        var need = 46 / ((GEOM.pancake_gold.width || 370) * (m.pieceScale || 1) || 1);
        if (need > scale && m.w * need <= availW + 8 && m.h * need <= availH + 8) scale = need;
      }
    }
    if (scale < 0.08) scale = 0.08;
    var tw = m.w * scale, th = m.h * scale;
    var html = '<div class="pc-stack-stage' + (opts.cls ? ' ' + opts.cls : '') + '" data-cw="' + m.w + '" data-ch="' + m.h + '" data-scale="' + scale.toFixed(4) + '" style="width:' + tw.toFixed(1) + 'px;height:' + th.toFixed(1) + 'px">';
    m.items.forEach(function (it) {
      var left, top, szW, szH, st;
      if (it.typ === 'badge') {
        left = (it.x - m.minX) / m.w * 100;
        top = (it.y - m.minY) / m.h * 100;
        html += '<span class="pc-count-badge" data-group="' + escAttr(it.group) + '" style="left:' + left.toFixed(3) + '%;top:' + top.toFixed(3) + '%">' + it.count + '</span>';
        return;
      }
      left = (it.x - m.minX) / m.w * 100;
      top = (it.y - m.minY) / m.h * 100;
      var ps = (it.s == null) ? 1 : it.s;
      szW = CANVAS * ps / m.w * 100;
      szH = CANVAS * ps / m.h * 100;
      st = 'left:' + left.toFixed(3) + '%;top:' + top.toFixed(3) + '%;width:' + szW.toFixed(3) + '%;height:' + szH.toFixed(3) + '%;';
      if (it.typ === 'plate') {
        html += '<img class="pc-plate-art" src="' + src(it.id) + '" alt="" draggable="false" style="' + st + '">';
      } else if (it.typ === 'cake') {
        var extra = (it.bottom ? ' data-bottom="1"' : '') + (it.group ? ' data-group="' + escAttr(it.group) + '"' : '');
        if (opts.interactive) {
          var bb = (GEOM[it.id] || GEOM.pancake_gold).bbox;
          var hit = 'left:' + (bb[0] / CANVAS * 100).toFixed(3) + '%;top:' + (bb[1] / CANVAS * 100).toFixed(3) + '%;width:' + ((bb[2] - bb[0]) / CANVAS * 100).toFixed(3) + '%;height:' + ((bb[3] - bb[1]) / CANVAS * 100).toFixed(3) + '%;';
          html += '<button type="button" class="pc-cake" data-uid="' + escAttr(it.cake.uid) + '" data-kind="' + escAttr(it.cake.kind) + '" aria-label="Take off a pancake"' + extra + ' style="' + st + '">' +
            imgTag(it.id, 'pc-cake-art') + '<span class="pc-hit" style="' + hit + '"></span></button>';
        } else {
          html += '<div class="pc-cake" data-kind="' + escAttr(it.cake.kind) + '" aria-hidden="true"' + extra + ' style="' + st + '">' +
            imgTag(it.id, 'pc-cake-art') + '</div>';
        }
      } else {
        html += '<div class="pc-tops' + (opts.pop ? ' pop' : '') + '" style="' + st + '">' + imgTag(it.id, 'pc-top-art') + '</div>';
      }
    });
    html += '</div>';
    return html;
  }
  function fitWrap(wrap, cakes, opts) {
    if (!wrap) return;
    var w = wrap.clientWidth || 0, h = wrap.clientHeight || 0;
    if (w < 20) w = 280;
    if (h < 20) h = 160;
    wrap.innerHTML = stackStage(cakes, Object.assign({}, opts, { fitW: w - 4, fitH: h - 4 }));
  }

  var FILL = {
    gold: { a: '#f2c56a', b: '#d8892e', c: '#fff3c4' },
    berry: { a: '#f08aa4', b: '#c44562', c: '#ffe0e8' },
    blue: { a: '#7eb0e8', b: '#3b6fb3', c: '#e4f1ff' }
  };

  function pancakeSvg(color, w, kind) {
    var f = FILL[color] || FILL.gold;
    var ten = kind === 'ten';
    var vb = ten ? '0 0 140 90' : '0 0 90 54';
    var rx = ten ? 62 : 40, ry = ten ? 24 : 20;
    var cx = ten ? 70 : 45, cy = ten ? 58 : 28;
    var layers = '';
    if (ten) {
      layers = '<ellipse cx="' + cx + '" cy="34" rx="' + rx + '" ry="' + ry + '" fill="' + f.b + '" stroke="#5a3d1c" stroke-width="3"/>' +
        '<ellipse cx="' + cx + '" cy="28" rx="' + rx + '" ry="' + ry + '" fill="' + f.a + '" stroke="#5a3d1c" stroke-width="3"/>';
    }
    return '<svg class="pc-cake-art" viewBox="' + vb + '" width="' + (w || (ten ? 88 : 64)) + '" height="auto" aria-hidden="true">' +
      layers +
      '<ellipse cx="' + cx + '" cy="' + (cy + 4) + '" rx="' + rx + '" ry="' + ry + '" fill="' + f.b + '"/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + f.a + '" stroke="#5a3d1c" stroke-width="3"/>' +
      '<ellipse cx="' + (cx - 12) + '" cy="' + (cy - 6) + '" rx="' + (rx * 0.32) + '" ry="' + (ry * 0.28) + '" fill="' + f.c + '" opacity=".7"/>' +
      '</svg>';
  }
  function waffleSvg(w) {
    var cells = '', x, y;
    for (y = 0; y < 4; y++) for (x = 0; x < 4; x++) {
      cells += '<rect x="' + (14 + x * 18) + '" y="' + (14 + y * 18) + '" width="14" height="14" rx="2" fill="#e8a24a" stroke="#b56a1e" stroke-width="1.5"/>';
    }
    return '<svg class="pc-cake-art pc-waffle-art" viewBox="0 0 100 100" width="' + (w || 88) + '" height="auto" aria-hidden="true">' +
      '<rect x="4" y="4" width="92" height="92" rx="14" fill="#f3c56a" stroke="#5a3d1c" stroke-width="3"/>' + cells + '</svg>';
  }
  function cake(kind, color, w, opt) {
    opt = opt || {};
    var id = pieceId(kind, color);
    w = w || (kind === 'hundred' ? 88 : (kind === 'ten' ? 88 : 64));
    if (has(id)) return opt.full ? imgTag(id, 'pc-cake-art' + (kind === 'hundred' ? ' pc-waffle-art' : '')) : thumb(id, w);
    if (kind === 'hundred') return waffleSvg(w);
    return pancakeSvg(color || 'gold', w, kind);
  }
  function toppingSvg(id, w) {
    w = w || 36;
    if (has('topping_' + id)) return thumb('topping_' + id, w);
    var inner = '';
    if (id === 'syrup') inner = '<path d="M8 6 C 20 18 28 14 40 28 L 36 8 Z" fill="#c45c14" stroke="#5a3d1c" stroke-width="2"/>';
    else if (id === 'berries') inner = '<circle cx="16" cy="20" r="8" fill="#d23a5a" stroke="#5a3d1c" stroke-width="2"/><circle cx="30" cy="16" r="7" fill="#e85a7a" stroke="#5a3d1c" stroke-width="2"/><circle cx="24" cy="28" r="6" fill="#b83452" stroke="#5a3d1c" stroke-width="2"/>';
    else if (id === 'cream') inner = '<path d="M8 28 C 8 10 40 10 40 28 C 30 22 18 22 8 28Z" fill="#fffaf0" stroke="#5a3d1c" stroke-width="2"/><circle cx="24" cy="14" r="6" fill="#fff"/>';
    else if (id === 'butter') inner = '<rect x="10" y="16" width="28" height="16" rx="3" fill="#ffe566" stroke="#5a3d1c" stroke-width="2"/>';
    else if (id === 'banana') inner = '<ellipse cx="16" cy="22" rx="8" ry="10" fill="#ffe566" stroke="#5a3d1c" stroke-width="2"/><ellipse cx="32" cy="22" rx="8" ry="10" fill="#f7d44a" stroke="#5a3d1c" stroke-width="2"/>';
    else inner = '<circle cx="14" cy="18" r="5" fill="#5a3d1c"/><circle cx="28" cy="16" r="5" fill="#3a2714"/><circle cx="22" cy="28" r="4.5" fill="#5a3d1c"/>';
    return '<svg class="pc-top-art" viewBox="0 0 48 40" width="' + w + '" height="auto" aria-hidden="true">' + inner + '</svg>';
  }
  function decoSvg(id, w) {
    w = w || 64;
    if (id === 'boss_banner' && has('boss_banner')) return imgTag('boss_banner', 'pc-deco-art pc-banner-art');
    if (has('deco_' + id)) return imgTag('deco_' + id, 'pc-deco-art');
    var inner = '';
    if (id === 'bunting') inner = '<path d="M4 8 H60" stroke="#5a3d1c" stroke-width="3"/><path d="M8 8 L16 28 L24 8Z" fill="#ff8fa8" stroke="#5a3d1c" stroke-width="2"/><path d="M24 8 L32 28 L40 8Z" fill="#ffe566" stroke="#5a3d1c" stroke-width="2"/><path d="M40 8 L48 28 L56 8Z" fill="#8fe3c0" stroke="#5a3d1c" stroke-width="2"/>';
    else if (id === 'menu_board') inner = '<rect x="8" y="6" width="48" height="40" rx="4" fill="#3a2714" stroke="#5a3d1c" stroke-width="2"/><rect x="12" y="12" width="40" height="6" rx="2" fill="#efe2c4"/><rect x="12" y="22" width="28" height="5" rx="2" fill="#efe2c4"/><rect x="12" y="32" width="34" height="5" rx="2" fill="#efe2c4"/>';
    else if (id === 'flower_pot') inner = '<rect x="22" y="8" width="8" height="16" fill="#6fd36a" stroke="#5a3d1c" stroke-width="2"/><circle cx="26" cy="8" r="8" fill="#ff8fa8" stroke="#5a3d1c" stroke-width="2"/><path d="M16 24 L36 24 L32 44 L20 44Z" fill="#d8892e" stroke="#5a3d1c" stroke-width="2"/>';
    else if (id === 'string_lights') inner = '<path d="M4 14 Q 32 4 60 14" fill="none" stroke="#5a3d1c" stroke-width="2"/><circle cx="12" cy="16" r="5" fill="#ffe566"/><circle cx="32" cy="10" r="5" fill="#ff8fa8"/><circle cx="52" cy="16" r="5" fill="#8fe3c0"/>';
    else if (id === 'plant') inner = '<ellipse cx="32" cy="18" rx="12" ry="16" fill="#6fd36a" stroke="#5a3d1c" stroke-width="2"/><ellipse cx="20" cy="24" rx="10" ry="14" fill="#4caf50" stroke="#5a3d1c" stroke-width="2"/><rect x="26" y="30" width="12" height="18" fill="#d8892e" stroke="#5a3d1c" stroke-width="2"/>';
    else if (id === 'sign') inner = '<rect x="8" y="8" width="48" height="28" rx="6" fill="#fff8e7" stroke="#5a3d1c" stroke-width="3"/><rect x="28" y="36" width="8" height="16" fill="#8a5a2a" stroke="#5a3d1c" stroke-width="2"/>';
    else if (id === 'stool') inner = '<rect x="16" y="16" width="32" height="8" rx="3" fill="#e8b86a" stroke="#5a3d1c" stroke-width="2"/><path d="M20 24 V44 M44 24 V44 M24 24 L18 44 M40 24 L46 44" stroke="#5a3d1c" stroke-width="3" fill="none"/>';
    else inner = '<path d="M20 8 C 20 4 44 4 44 16 C 44 28 20 24 20 36 C 20 44 40 44 40 36" fill="none" stroke="#c45c14" stroke-width="6" stroke-linecap="round"/><ellipse cx="20" cy="40" rx="10" ry="6" fill="#d8892e" stroke="#5a3d1c" stroke-width="2"/>';
    return '<svg class="pc-deco-art" viewBox="0 0 64 56" width="' + w + '" height="auto" aria-hidden="true">' + inner + '</svg>';
  }
  function plateSvg(w) {
    if (has('plate')) return imgTag('plate', 'pc-plate-art');
    return '<svg class="pc-plate-art" viewBox="0 0 160 70" width="' + (w || 160) + '" height="auto" aria-hidden="true">' +
      '<ellipse cx="80" cy="40" rx="74" ry="22" fill="#e8d8b8" stroke="#5a3d1c" stroke-width="3"/>' +
      '<ellipse cx="80" cy="36" rx="58" ry="14" fill="#fff8e7" stroke="#c9a36a" stroke-width="2"/>' +
      '</svg>';
  }

  A.PancakeArt = {
    NEEDED: NEEDED, SRC: SRC, src: src, has: has, GEOM: GEOM, pieceId: pieceId,
    cake: cake, pancake: pancakeSvg, waffle: waffleSvg, topping: toppingSvg, deco: decoSvg, plate: plateSvg,
    thumb: thumb, stackStage: stackStage, fitWrap: fitWrap, measureStack: measureStack, groupList: groupList, kindOf: kindOf
  };
})(window.Arcade);
