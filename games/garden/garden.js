/* Picnic Pals — Garden: 6-plot bed, seed shelf, Avatar r2 art, hop-then-wave pop-out. */
(function (A) {
  'use strict';
  var K = A.Garden, Art = A.GardenArt, $ = A.$, P = A.Store && A.Store.active();
  if (!P) { location.replace(A.ROOT + 'index.html#players'); return; }

  var G = K.newSession(P);
  var lastSay = '';
  var busy = false;
  var cheerMs = 900;
  var hopMs = K.HOP_MS || 600;
  var popFrame = '';

  function friendSrc(id, pose, px) {
    if (A.Blobs && A.Blobs.art) return A.Blobs.art(id, pose || 'front', px || 256);
    return A.ROOT + 'assets/picnic/friends/' + id + '/' + (pose || 'front') + '_' + (px || 256) + '.webp';
  }
  function lockedSrc(id) {
    return A.ROOT + 'assets/picnic/friends/' + id + '/locked_256.webp';
  }
  function isLand() {
    var stage = document.documentElement.getAttribute('data-stage');
    if (stage === 'landscape') return true;
    if (stage === 'portrait') return false;
    var el = $('#gdStage') || document.getElementById('garden');
    if (el && el.clientWidth && el.clientHeight) return el.clientWidth > el.clientHeight;
    return window.innerWidth > window.innerHeight;
  }
  function say(text, kind) {
    if (!text) return;
    lastSay = typeof text === 'string' ? text : '';
    if (Array.isArray(text)) {
      lastSay = text.map(function (t) { return typeof t === 'string' ? t : (t && (t.text || t.id) || ''); }).join(' ');
      A.Voice.say(text, { kind: kind || 'tap', bubble: false });
      return;
    }
    A.Voice.say([{ text: text }], { kind: kind || 'tap', bubble: false });
  }
  function promptSpeech() {
    if (G.phase === 'title') return 'Welcome to the garden! Let us grow a new friend.';
    if (G.phase === 'pop') return K.jobLine('pop', K.nameOf(G.justUnlocked));
    if (G.phase === 'rest') return 'The plants are growing! They will still be here when you come back.';
    if (G.phase === 'done') return 'The garden is full of friends!';
    if (G.nudge) return G.nudge;
    if (G.heldPacket) return 'Drag or tap the seed onto a clear dirt spot to plant ' + K.nameOf(G.heldPacket) + '.';
    if (!K.selectedPlot(G.state) && K.packetsOpen(G.state).length) return 'Drag or tap a seed onto a clear dirt spot.';
    if (G.question) return G.question.say || G.question.text;
    if (G.band && G.band.toddler) return 'Tap Water to help the plant grow.';
    return lastSay;
  }
  function markStar() {
    if (G.state.starredThis) return;
    if (A.Store && A.Store.earnStars) A.Store.earnStars(P, 1, 'garden');
    G.state.sessions = (G.state.sessions || 0) + 1;
    G.state.starredThis = true;
    K.saveState(P, G.state);
  }

  function px(n) { return Math.round(n) + 'px'; }
  function stageScale() {
    var s = parseFloat((document.documentElement.style.getPropertyValue('--stage-scale') || window.getComputedStyle(document.documentElement).getPropertyValue('--stage-scale')).trim());
    return (s && s > 0.05) ? s : 1;
  }
  function renderedMin(n) { return Math.ceil(n / stageScale()); }
  function minHit(el, x, y, size) {
    var hit = Math.max(renderedMin(60), size);
    el.style.position = 'absolute';
    el.style.left = px(x - hit / 2);
    el.style.top = px(y - hit / 2);
    el.style.width = px(hit);
    el.style.height = px(hit);
  }

  function layoutWorld() {
    var scene = $('#gdScene');
    if (!scene || !Art) return;
    var land = isLand();
    var bg = $('#gdBg');
    if (bg) {
      bg.src = Art.bgSrc(land);
      if (Art.bgSrc2x) bg.srcset = Art.bgSrc(land) + ' 1x, ' + Art.bgSrc2x(land) + ' 2x';
    }
    var spots = Art.stageSpots ? Art.stageSpots(land) : Art.BED_SPOTS;
    var plantSize = land ? 92 : 78;
    spots.forEach(function (spot, i) {
      var wrap = document.querySelector('.gd-spot[data-i="' + i + '"]');
      if (!wrap) return;
      var img = wrap.querySelector('.gd-plant');
      var burst = wrap.querySelector('.gd-burst');
      var spark = wrap.querySelector('.gd-spark');
      var hit = Math.max(renderedMin(60), plantSize * 0.7);
      minHit(wrap, spot.x, spot.y, hit);
      wrap.style.zIndex = String(6 + (spot.row || 0) * 2);
      wrap.style.background = 'transparent';
      wrap.style.boxShadow = 'none';
      if (wrap.classList.contains('selected')) wrap.style.boxShadow = '0 0 0 4px #fff36a, 0 0 0 7px #3a6a32';
      if (img) {
        img.style.position = 'absolute';
        img.style.width = px(plantSize);
        img.style.height = px(plantSize);
        img.style.left = '50%';
        img.style.top = '50%';
        img.style.transform = 'translate(-50%, -85%)';
      }
      if (burst) {
        burst.style.width = px(plantSize * 0.7);
        burst.style.height = px(plantSize * 0.7);
        burst.style.left = '50%';
        burst.style.top = '55%';
        burst.style.marginLeft = px(-plantSize * 0.35);
        burst.style.marginTop = px(-plantSize * 0.35);
        burst.style.transform = 'none';
      }
      if (spark) {
        spark.style.width = px(plantSize * 0.55);
        spark.style.height = px(plantSize * 0.55);
        spark.style.left = '50%';
        spark.style.top = '30%';
        spark.style.marginLeft = px(-plantSize * 0.275);
        spark.style.marginTop = px(-plantSize * 0.275);
        spark.style.transform = 'none';
      }
      wrap.dataset.sx = String(spot.x);
      wrap.dataset.sy = String(spot.y);
    });

    var fa = Art.friendAnchor ? Art.friendAnchor(land) : null;
    var buddy = $('#gdBuddy');
    var shadow = $('#gdBuddyShadow');
    if (fa && buddy) {
      var fh = fa.height || (land ? 150 : 78);
      /* Friend poses are square 256 canvases with ~24px empty pad under the feet.
         Use a square box and sit the opaque feet on the anchor, not the canvas edge. */
      var pad = 24 / 256;
      var fw = fh;
      buddy.style.position = 'absolute';
      buddy.style.left = px(fa.foot[0] - fw / 2);
      buddy.style.top = px(fa.foot[1] - fh * (1 - pad));
      buddy.style.width = px(fw);
      buddy.style.height = px(fh);
      buddy.style.objectPosition = 'center bottom';
      buddy.style.zIndex = '7';
      if (shadow) {
        var sw = Math.round(fw * 1.05);
        var sh = Math.round(sw * 44 / 160);
        shadow.style.position = 'absolute';
        shadow.style.left = px(fa.foot[0] - sw / 2);
        shadow.style.top = px(fa.foot[1] - sh * 0.55);
        shadow.style.width = px(sw);
        shadow.style.height = px(sh);
        shadow.style.zIndex = '6';
      }
    }
    layoutCan(null);
  }

  function layoutCan() {
    var can = $('#gdCan'), stream = $('#gdStream');
    if (!can) return;
    var sel = document.querySelector('.gd-spot.selected');
    var sx, sy, canS, spout, top, left, streamS, spots, mid;
    if (sel && sel.dataset.sx) { sx = +sel.dataset.sx; sy = +sel.dataset.sy; }
    else if (Art.stageSpots) {
      spots = Art.stageSpots(isLand());
      mid = spots[4] || spots[0];
      if (!mid) return;
      sx = mid.x; sy = mid.y;
    } else return;
    canS = isLand() ? 96 : 80;
    spout = Art.POUR_SPOUT;
    if (can.classList.contains('pour')) {
      left = sx - (spout.x / 512) * canS;
      top = sy - 18 - (spout.y / 512) * canS;
      can.style.width = px(canS);
      can.style.height = px(canS);
      can.style.left = px(left);
      can.style.top = px(top);
      if (stream) {
        streamS = canS;
        stream.style.width = px(streamS);
        stream.style.height = px(streamS);
        stream.style.left = px((left + (spout.x / 512) * canS) - (Art.STREAM_TOP.x / 512) * streamS);
        stream.style.top = px((top + (spout.y / 512) * canS) - (Art.STREAM_TOP.y / 512) * streamS);
      }
    } else {
      can.style.width = px(canS * 0.85);
      can.style.height = px(canS * 0.85);
      can.style.left = px(sx + 24);
      can.style.top = px(sy - canS * 0.7);
    }
  }

  function renderScene(shot, job) {
    var land = isLand();
    var st = G.state;
    var html = '';
    html += '<img class="gd-bg" id="gdBg" src="' + Art.bgSrc(land) + '" alt="">';
    if (Art.shadowSrc) html += '<img class="gd-buddy-shadow" id="gdBuddyShadow" src="' + Art.shadowSrc() + '" alt="">';
    var hero = (P && (P.blob || P.friend)) || 'strawberry';
    html += '<img class="gd-buddy" id="gdBuddy" src="' + friendSrc(hero, 'front', 256) + '" alt="">';
    (st.plots || []).forEach(function (pl, i) {
      var selected = st.selected === i;
      var stage = 'empty';
      if (pl.id) {
        if (G.justUnlocked === pl.id && (job === 'hop' || popFrame === 'hop')) stage = 'hop';
        else if (G.justUnlocked === pl.id && (job === 'wave' || job === 'pop' || popFrame === 'wave')) stage = 'wave';
        else stage = K.stageOf(pl.answers, K.needOf(pl.id));
        if (stage === 'empty') stage = 'seed';
        if (stage === 'peek') stage = 'popout';
        if (stage === 'pop' && G.justUnlocked === pl.id) stage = popFrame || 'hop';
        if (stage === 'pop') stage = 'wave';
      }
      html += '<button type="button" class="gd-spot' + (selected ? ' selected' : '') + (pl.id ? ' planted' : ' empty') + '" data-i="' + i + '" aria-label="Plot ' + (i + 1) + '">';
      if (pl.id && stage && stage !== 'empty') {
        html += '<img class="gd-plant' + (job === 'plant' && selected ? ' gd-just' : '') + '" src="' + Art.stageSrc(pl.id, stage === 'popout' ? 'peek' : stage) + '" alt="">';
      }
      if (job === 'plant' && selected) html += '<img class="gd-burst" src="' + Art.src('soil_burst') + '" alt="">';
      if ((job === 'sun' || job === 'water' || job === 'plant') && selected) {
        html += '<img class="gd-spark" src="' + Art.src(job === 'water' ? 'sparkle_b' : 'sparkle_a') + '" alt="">';
      }
      html += '</button>';
    });
    var pour = job === 'water';
    html += '<img class="gd-can' + (pour ? ' pour' : '') + '" id="gdCan" src="' + Art.src(pour ? 'watering_can_pour' : 'watering_can_upright') + '" alt="">';
    if (pour) html += '<img class="gd-stream" id="gdStream" src="' + Art.src('water_stream') + '" alt="">';
    return html;
  }

  function renderTitle() {
    document.body.className = 'gd-on-title' + (isLand() ? ' gd-land' : ' gd-port');
    var st = G.state;
    var beds = K.ids().map(function (id) {
      var pl = st.plants[id] || { answers: 0, unlocked: false };
      var src = pl.unlocked ? friendSrc(id, 'happy') : lockedSrc(id);
      var label = pl.unlocked ? K.nameOf(id) : '';
      return '<div class="gd-bed" data-id="' + id + '"><img class="' + (pl.unlocked ? '' : 'sil') + '" src="' + src + '" alt=""><span class="nm">' + A.esc(label) + '</span></div>';
    }).join('');
    var startLabel = G.doneAll ? 'Visit the garden' : (K.unlockedCount(st) ? 'Keep growing' : "Let's grow!");
    $('#gdStage').innerHTML =
      '<div class="gd-title" id="gdTitle">' +
        '<img class="gd-bg gd-title-bg" src="' + Art.bgSrc(isLand()) + '" alt="">' +
        '<div class="gd-title-ui">' +
          '<h2>Garden</h2>' +
          '<p class="gd-tag">Plant seeds, water with right answers, and grow new friends.</p>' +
          '<div class="gd-beds">' + beds + '</div>' +
          '<div class="gd-actions"><button type="button" class="gd-action" id="gdStart">' + A.esc(startLabel) + '</button></div>' +
        '</div>' +
      '</div>';
    $('#gdStart').onclick = function () { startPlay(); };
    say('Welcome to the garden! Let us grow a new friend.', 'chatter');
  }

  function hasPlant() {
    return !!K.selectedPlot(G.state);
  }

  function seedTrayHtml() {
    var st = G.state, html = '<div class="gd-seeds pp-kit-tray" id="gdSeeds">';
    K.ids().forEach(function (id) {
      var open = K.packetOpen(st, id);
      var held = G.heldPacket === id;
      var unlocked = !!(st.plants[id] && st.plants[id].unlocked);
      var growing = K.growingOn(st, id) >= 0;
      var gone = unlocked || growing;
      var cls = 'gd-seedbtn' + (open ? ' open' : ' shut') + (held ? ' held' : '') + (gone ? ' gone' : '');
      var aria = held ? 'Selected seed' : (open ? 'Seed, drag or tap to plant' : (gone ? 'Seed already planted' : 'Seed, still locked'));
      html += '<button type="button" class="' + cls + '" data-id="' + id + '" aria-label="' + aria + '"' + (open ? '' : ' disabled') + '>';
      html += '<img class="pkt" src="' + Art.packetSrc(id) + '" draggable="false"' + (Art.packetSrc2x ? ' srcset="' + Art.packetSrc(id) + ' 1x, ' + Art.packetSrc2x(id) + ' 2x"' : '') + ' alt="">';
      html += '</button>';
    });
    return html + '</div>';
  }
  function layoutCard(pass) {
    var card = $('#gdCard'), play = document.querySelector('.gd-play'), stage;
    if (!card) return;
    placeCard();
    stage = document.querySelector('.stage-scale') || document.getElementById('garden');
    var land = isLand();
    var nItems = card.querySelectorAll('.gd-food, .gd-array img, .gd-pic img').length;
    var few = nItems > 0 && nItems <= 5;
    var many = nItems >= 12;
    var icon = land ? (few ? 64 : many ? 36 : 48) : (few ? 44 : many ? 26 : 34);
    var ask = land ? 32 : 26;
    var choiceH = land ? (few ? 96 : 80) : (few ? 72 : 64);
    var choicePic = land ? 48 : 40;
    var cv = land ? 20 : 16;
    var iconMax = land ? (few ? 72 : many ? 44 : 56) : (few ? 56 : many ? 32 : 44);
    var askMax = land ? 36 : 32;
    var choiceMax = land ? 112 : 96;
    card.style.justifyContent = 'flex-start';
    card.style.setProperty('--gd-icon', icon + 'px');
    card.style.setProperty('--gd-ask', ask + 'px');
    card.style.setProperty('--gd-choice-h', choiceH + 'px');
    card.style.setProperty('--gd-choice-pic', choicePic + 'px');
    card.style.setProperty('--gd-cv', cv + 'px');
    if (play) play.classList.remove('gd-tight');
    function fitVisuals() {
      if (A.CountVisual && A.CountVisual.fit) A.CountVisual.fit(card);
    }
    function apply() {
      card.style.setProperty('--gd-icon', icon + 'px');
      card.style.setProperty('--gd-ask', ask + 'px');
      card.style.setProperty('--gd-choice-h', choiceH + 'px');
      card.style.setProperty('--gd-choice-pic', choicePic + 'px');
      card.style.setProperty('--gd-cv', cv + 'px');
      fitVisuals();
    }
    apply();
    function overflowing() {
      var sh = card.scrollHeight > card.clientHeight + 2 || card.scrollWidth > card.clientWidth + 2;
      var box = (stage || play || card).getBoundingClientRect();
      var off = false;
      card.querySelectorAll('.gd-choice, .gd-ask, .gd-pic, .gd-water, .gd-seedbtn').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom > box.bottom + 3 || r.top < box.top - 3 || r.right > box.right + 3 || r.left < box.left - 3) off = true;
      });
      return sh || off;
    }
    function leftover() {
      var used = card.scrollHeight;
      var have = card.clientHeight;
      if (play && !land) {
        var scene = document.querySelector('.gd-scene');
        var sceneMin = scene ? (parseFloat(getComputedStyle(scene).minHeight) || 200) : 200;
        var gap = parseFloat(getComputedStyle(play).gap) || 6;
        have = Math.max(have, play.clientHeight - sceneMin - gap);
      }
      return have - used;
    }
    var guard = 0;
    while (overflowing() && guard++ < 12) {
      if (icon > 16) { icon -= 2; apply(); continue; }
      if (cv > 10) { cv -= 2; apply(); continue; }
      if (choiceH > 60) { choiceH -= 4; apply(); continue; }
      if (choicePic > 28) { choicePic -= 4; apply(); continue; }
      if (ask > 20) { ask -= 2; apply(); continue; }
      if (play && !play.classList.contains('gd-tight')) { play.classList.add('gd-tight'); apply(); continue; }
      break;
    }
    guard = 0;
    while (!overflowing() && leftover() > 28 && guard++ < 12) {
      var grew = false;
      if (nItems && icon < iconMax) { icon += 2; grew = true; }
      else if (choiceH < choiceMax) { choiceH += 4; grew = true; }
      else if (ask < askMax) { ask += 1; grew = true; }
      else if (cv < (land ? 28 : 22)) { cv += 1; grew = true; }
      if (!grew) break;
      apply();
      if (overflowing()) {
        if (icon > 16 && nItems) icon -= 2;
        else if (choiceH > 60) choiceH -= 4;
        else if (ask > 20) ask -= 1;
        apply();
        break;
      }
    }
    if (card.classList.contains('gd-card-q')) {
      card.style.justifyContent = 'space-evenly';
    } else {
      card.style.justifyContent = '';
    }
    if ((pass || 0) < 1) {
      requestAnimationFrame(function () { layoutCard(1); });
    }
  }
  function renderCard(shot) {
    if (!hasPlant()) {
      var ask = G.heldPacket ? plantPrompt(K.nameOf(G.heldPacket)) : plantPrompt();
      return '<div class="gd-card pp-kit-card" id="gdCard"><p class="gd-ask" id="gdAsk">' + A.esc(ask) + '</p></div>';
    }
    if (G.band && G.band.toddler) {
      return '<div class="gd-card pp-kit-card" id="gdCard"><p class="gd-ask" id="gdAsk">Tap Water to help the plant grow.</p>' +
        '<p class="gd-nudge" id="gdNudge">' + A.esc(G.nudge || '') + '</p>' +
        '<button type="button" class="gd-water" id="gdWater">Water</button></div>';
    }
    var q = G.question;
    if (!q) {
      var ask2 = G.heldPacket ? plantPrompt(K.nameOf(G.heldPacket)) : plantPrompt();
      return '<div class="gd-card pp-kit-card" id="gdCard"><p class="gd-ask" id="gdAsk">' + A.esc(ask2) + '</p></div>';
    }
    var html = '<div class="gd-card pp-kit-card gd-card-q" id="gdCard"><p class="gd-ask" id="gdAsk">' + (q.html || A.esc(q.text)) + '</p>';
    if (q.pic) html += '<div class="gd-pic">' + q.pic + '</div>';
    if (G.nudge && !(K.revealsAnswer && K.revealsAnswer(q, G.nudge))) {
      html += '<p class="gd-nudge" id="gdNudge">' + A.esc(G.nudge) + '</p>';
    }
    var n = (q.choices || []).length;
    var picAns = (q.choices || []).some(function (c) { return !!(c.html); });
    html += '<div class="gd-choices n' + n + (picAns ? ' has-pic' : '') + '" id="gdChoices">';
    (q.choices || []).forEach(function (c, i) {
      html += '<button type="button" class="gd-choice" data-i="' + i + '">' + (c.html || A.esc(c.label)) + '</button>';
    });
    html += '</div></div>';
    return html;
  }


  function placeCard() {
    var card = $('#gdCard');
    if (!card) return;
    var land = isLand();
    card.style.position = 'absolute';
    card.style.zIndex = '12';
    card.style.margin = '0';
    if (land) {
      var box = (Art && Art.CARD_LANDSCAPE) || { x: 232, y: 116, w: 560, h: 64 };
      card.style.left = px(box.x);
      card.style.top = px(box.y);
      card.style.width = px(box.w);
      card.style.minHeight = px(box.h);
      card.style.maxHeight = px(G.question ? 280 : 130);
      card.style.right = 'auto';
      card.style.bottom = 'auto';
    } else {
      var y = (Art && Art.CARD_Y_PORTRAIT) || 482;
      card.style.left = '12px';
      card.style.top = px(y);
      card.style.width = '376px';
      card.style.right = 'auto';
      card.style.bottom = 'auto';
      card.style.maxHeight = px(G.question ? 188 : 136);
    }
  }
  function layoutTray() {
    var tray = $('#gdSeeds');
    if (!tray) return;
    var land = isLand();
    tray.style.position = 'absolute';
    tray.style.zIndex = '13';
    tray.style.left = land ? '40px' : '4px';
    tray.style.width = land ? '944px' : '392px';
    tray.style.right = 'auto';
    tray.style.bottom = 'auto';
    /* 22px kit shelf under the bags. Landscape 120px. Portrait can't fit five 110px
       bags on the 400px shelf, so use the largest size that keeps all five visible. */
    var bag = land ? 120 : 74;
    var shelf = 22;
    tray.style.height = px(bag + shelf);
    tray.style.top = px(land ? 640 - bag - shelf : 720 - bag - shelf);
  }

  function bindWorld() {
    document.querySelectorAll('.gd-packet').forEach(function (el) {
      el.onclick = function () { if (!busy) onPacket(el.getAttribute('data-id')); };
    });
    document.querySelectorAll('.gd-spot').forEach(function (el) {
      el.onclick = function () { if (!busy) onSpot(+el.getAttribute('data-i')); };
    });
  }

  var drag = null;
  var scrollLockBound = false;

  function plantPrompt(name) {
    if (name) return 'Drag or tap the seed onto a clear dirt spot to plant ' + name + '.';
    return 'Drag or tap a seed onto a clear dirt spot.';
  }
  function playRoot() {
    return document.querySelector('.stage-scale') || document.querySelector('[data-stage-root]') || $('#gdStage') || document.getElementById('garden');
  }
  function ghostHost() {
    /* stage-frame is unscaled; position:fixed inside the scaled stage would miss the finger. */
    return document.querySelector('.stage-frame') || document.body;
  }
  function bindScrollLock() {
    if (scrollLockBound) return;
    scrollLockBound = true;
    function block(e) {
      if (!drag) return;
      if (e.cancelable) e.preventDefault();
    }
    document.addEventListener('touchmove', block, { passive: false, capture: true });
    document.addEventListener('wheel', block, { passive: false, capture: true });
  }
  function setDragging(on) {
    bindScrollLock();
    document.documentElement.classList.toggle('gd-dragging', !!on);
    try { document.body.style.overflow = on ? 'hidden' : ''; } catch (err) {}
  }
  function scenePoint(e) {
    var scene = $('#gdScene') || document.getElementById('garden');
    var x = e.clientX, y = e.clientY;
    if (e.touches && e.touches[0]) { x = e.touches[0].clientX; y = e.touches[0].clientY; }
    if (!scene) return { x: x, y: y };
    var r = scene.getBoundingClientRect();
    var sx = r.width / (isLand() ? 1024 : 400);
    var sy = r.height / (isLand() ? 640 : 720);
    return { x: (x - r.left) / (sx || 1), y: (y - r.top) / (sy || 1) };
  }
  function dirtBox() {
    var d = Art.dirtPatch && Art.dirtPatch(isLand());
    var pad = 48;
    if (!d) return null;
    if (d.safe_drop_bbox_xyxy) {
      var b = d.safe_drop_bbox_xyxy;
      return { x0: b[0] - pad, y0: b[1] - pad, x1: b[2] + pad, y1: b[3] + pad };
    }
    if (d.bbox_xywh) {
      var w = d.bbox_xywh;
      return { x0: w[0] - pad, y0: w[1] - pad, x1: w[0] + w[2] + pad, y1: w[1] + w[3] + pad };
    }
    return null;
  }
  function inDirt(p) {
    var b = dirtBox();
    if (!b) return false;
    return p.x >= b.x0 && p.x <= b.x1 && p.y >= b.y0 && p.y <= b.y1;
  }
  function plotTargets() {
    var spots = (Art.stageSpots ? Art.stageSpots(isLand()) : []);
    var slop = (A.Kit && A.Kit.tapSlop) ? A.Kit.tapSlop() : 28;
    var r = 80 + slop;
    return spots.map(function (s, i) {
      return { x: s.x, y: s.y, r: r, i: i, empty: !(G.state.plots[i] && G.state.plots[i].id) };
    });
  }
  function closestEmpty(p) {
    var list = plotTargets().filter(function (t) { return t.empty; });
    var best = null, bestD = Infinity, i, d;
    for (i = 0; i < list.length; i++) {
      d = Math.hypot(p.x - list[i].x, p.y - list[i].y);
      if (d < bestD) { best = list[i]; bestD = d; }
    }
    return best;
  }
  function hitPlot(p) {
    var all = plotTargets();
    var empty = all.filter(function (t) { return t.empty; });
    var filled = all.filter(function (t) { return !t.empty; });
    var emptyNear = (A.Kit && A.Kit.nearest) ? A.Kit.nearest(p.x, p.y, empty) : null;
    if (emptyNear) return emptyNear;
    if (inDirt(p)) return closestEmpty(p);
    var filledNear = (A.Kit && A.Kit.nearest) ? A.Kit.nearest(p.x, p.y, filled) : null;
    if (filledNear) return filledNear;
    return null;
  }
  function markHot(i) {
    document.querySelectorAll('.gd-spot').forEach(function (el) {
      var idx = +el.getAttribute('data-i');
      var empty = el.classList.contains('empty');
      el.classList.toggle('drop-ready', !!(drag && empty));
      el.classList.toggle('drop-hot', !!(drag && empty && idx === i));
    });
  }
  function makeGhost(el) {
    var img = el.querySelector('.pkt');
    var g = document.createElement('img');
    g.className = 'gd-drag-ghost';
    g.src = img ? (img.currentSrc || img.src) : '';
    g.alt = '';
    g.setAttribute('aria-hidden', 'true');
    g.draggable = false;
    var sz = img ? img.getBoundingClientRect() : { width: 74, height: 74 };
    g.style.width = Math.max(60, Math.round(sz.width)) + 'px';
    g.style.height = Math.max(60, Math.round(sz.height)) + 'px';
    (ghostHost()).appendChild(g);
    return g;
  }
  function moveGhost(g, x, y) {
    if (!g) return;
    g.style.left = Math.round(x) + 'px';
    g.style.top = Math.round(y) + 'px';
  }
  function clearDrag() {
    if (drag && drag.ghost && drag.ghost.parentNode) drag.ghost.parentNode.removeChild(drag.ghost);
    if (drag && drag.el) drag.el.classList.remove('dragging');
    drag = null;
    setDragging(false);
    document.querySelectorAll('.gd-spot').forEach(function (el) {
      el.classList.remove('drop-ready', 'drop-hot');
    });
  }
  function afterPlant(name, plotIndex) {
    G.heldPacket = null;
    K.saveState(P, G.state);
    say('You planted ' + name + '!', 'chatter');
    renderPlay('plant');
    var wrap = document.querySelector('.gd-spot[data-i="' + plotIndex + '"]');
    if (A.Kit && A.Kit.celebrate) {
      var host = playRoot();
      var opt = { root: host, sfx: 'ok' };
      if (wrap && wrap.getBoundingClientRect) {
        var r = wrap.getBoundingClientRect();
        var hb = host && host.getBoundingClientRect ? host.getBoundingClientRect() : { left: 0, top: 0 };
        opt.x = r.left - hb.left + r.width / 2;
        opt.y = r.top - hb.top + r.height / 2;
        opt.around = wrap;
      }
      A.Kit.celebrate(opt);
    } else if (A.Audio && A.Audio.sfx) A.Audio.sfx('ok');
    busy = true;
    setTimeout(function () {
      busy = false;
      if (G.pendingGrowth) {
        G.pendingGrowth = false;
        afterCorrect(K.applyCorrect(P, G));
        return;
      }
      if (!G.question && !(G.band && G.band.toddler)) nextQuestion();
      else renderPlay('');
    }, cheerMs || 0);
  }
  function finishDrop(e) {
    if (busy) { clearDrag(); return; }
    var p = scenePoint(e);
    var hit = hitPlot(p);
    if (hit && G.heldPacket) {
      var pl = G.state.plots[hit.i];
      if (pl && pl.id) {
        say('That patch already has a plant. Try an empty one.', 'chatter');
        clearDrag();
        return;
      }
      if (K.plantAt(G.state, hit.i, G.heldPacket)) {
        var name = K.nameOf(G.heldPacket);
        clearDrag();
        afterPlant(name, hit.i);
        return;
      }
    }
    clearDrag();
  }
  function bindSeedDrag() {
    if (!A.Kit || !A.Kit.onDrag) return;
    document.querySelectorAll('.gd-seedbtn').forEach(function (el) {
      if (el.getAttribute('data-pp-kit-drag') === '1' || el.disabled) return;
      var id = el.getAttribute('data-id');
      el.setAttribute('data-pp-kit-drag', '1');
      try { el.style.touchAction = 'none'; } catch (err) {}
      A.Kit.onDrag(el, {
        slop: 8,
        onStart: function (e) {
          if (busy || el.disabled) return;
          if (e && e.preventDefault) e.preventDefault();
          onPacket(id, 'silent');
          setDragging(true);
          drag = { id: id, el: el, ghost: null };
          markHot(-1);
        },
        onMove: function (e, pt) {
          if (!drag || drag.id !== id) return;
          if (e && e.preventDefault) e.preventDefault();
          if (!drag.ghost) {
            drag.ghost = makeGhost(el);
            el.classList.add('dragging');
          }
          moveGhost(drag.ghost, pt.x, pt.y);
          var hit = hitPlot(scenePoint(e));
          var hot = (hit && !(G.state.plots[hit.i] && G.state.plots[hit.i].id)) ? hit.i : -1;
          markHot(hot);
        },
        onEnd: function (e) { finishDrop(e); },
        onCancel: function () { clearDrag(); },
        onTap: function () {
          clearDrag();
          if (!busy && !el.disabled) onPacket(id);
        }
      });
    });
  }
  function bindCard() {
    if ($('#gdWater')) $('#gdWater').onclick = function () { if (!busy) onToddlerTap(); };
    if ($('#gdSeeds')) {
      if (A.Kit && A.Kit.onDrag) bindSeedDrag();
      else {
        $('#gdSeeds').addEventListener('click', function (e) {
          var b = e.target.closest('.gd-seedbtn'); if (!b || busy || b.disabled) return;
          onPacket(b.getAttribute('data-id'));
        });
      }
    }
    if ($('#gdChoices')) {
      $('#gdChoices').addEventListener('click', function (e) {
        var b = e.target.closest('.gd-choice'); if (!b || busy) return;
        onPick(+b.dataset.i, b);
      });
    }
  }

  function renderPlay(job) {
    document.body.className = 'gd-on-play' + (isLand() ? ' gd-land' : ' gd-port');
    var shot = K.snapshot(G);
    var showTray = !hasPlant() || !G.question;
    if (G.band && G.band.toddler && hasPlant()) showTray = false;
    if (G.question) showTray = false;
    $('#gdStage').innerHTML =
      '<div class="gd-play">' +
        '<div class="gd-scene" id="gdScene">' + renderScene(shot, job || '') + '</div>' +
        renderCard(shot) +
        (showTray ? seedTrayHtml() : '') +
      '</div>';
    bindWorld();
    bindCard();
    layoutWorld();
    layoutCard();
    layoutTray();
  }

  function renderPop(res) {
    document.body.className = 'gd-on-pop' + (isLand() ? ' gd-land' : ' gd-port');
    var name = res.name || K.nameOf(res.friend);
    var more = K.unlockedCount(G.state) < K.ids().length;
    $('#gdStage').innerHTML =
      '<div class="gd-msg" id="gdPop">' +
        '<img class="gd-bg gd-title-bg" src="' + Art.bgSrc(isLand()) + '" alt="">' +
        '<div class="gd-msg-ui">' +
          '<img src="' + Art.stageSrc(res.friend, 'wave') + '" alt="">' +
          '<h2>' + A.esc(name) + ' popped out!</h2>' +
          '<p>' + A.esc(name) + ' joined your friends.</p>' +
          '<div class="gd-actions">' +
            (more ? '<button type="button" class="gd-action" id="gdNext">Grow another</button>' : '') +
            '<button type="button" class="gd-action" id="gdPopHome">Home</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    if ($('#gdNext')) $('#gdNext').onclick = function () { continueAfterPop(); };
    $('#gdPopHome').onclick = home;
    say(name + ' popped out to join you!', 'chatter');
    if (A.Audio && A.Audio.sfx) A.Audio.sfx('win');
  }

  function continueAfterPop() {
    K.finishPop(G);
    K.saveState(P, G.state);
    G.sessionRight = 0;
    popFrame = '';
    if (K.unlockedCount(G.state) >= K.ids().length) { G.phase = 'done'; G.doneAll = true; render(); return; }
    G.phase = 'play';
    startPlay(true);
  }

  function renderRest() {
    document.body.className = 'gd-on-rest' + (isLand() ? ' gd-land' : ' gd-port');
    $('#gdStage').innerHTML =
      '<div class="gd-msg" id="gdRest">' +
        '<img class="gd-bg gd-title-bg" src="' + Art.bgSrc(isLand()) + '" alt="">' +
        '<div class="gd-msg-ui">' +
          '<h2>The plants are growing!</h2>' +
          '<p>They will still be here when you come back.</p>' +
          '<div class="gd-actions">' +
            '<button type="button" class="gd-action" id="gdKeep">Keep growing</button>' +
            '<button type="button" class="gd-action" id="gdRestHome">Home</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    $('#gdKeep').onclick = function () { G.sessionRight = 0; G.phase = 'play'; startPlay(true); };
    $('#gdRestHome').onclick = home;
    say('The plants are growing! They will still be here when you come back.', 'chatter');
  }

  function renderDone() {
    document.body.className = 'gd-on-done' + (isLand() ? ' gd-land' : ' gd-port');
    $('#gdStage').innerHTML =
      '<div class="gd-msg"><img class="gd-bg gd-title-bg" src="' + Art.bgSrc(isLand()) + '" alt="">' +
      '<div class="gd-msg-ui"><h2>The garden is full!</h2><p>Every garden friend has grown and joined you.</p>' +
      '<div class="gd-actions"><button type="button" class="gd-action" id="gdDoneHome">Home</button></div></div></div>';
    $('#gdDoneHome').onclick = home;
    say('The garden is full of friends!', 'chatter');
  }

  function render(job) {
    if (G.phase === 'title') return renderTitle();
    if (G.phase === 'pop') return renderPop({ friend: G.justUnlocked, name: K.nameOf(G.justUnlocked) });
    if (G.phase === 'rest') return renderRest();
    if (G.phase === 'done' || G.doneAll) return renderDone();
    renderPlay(job);
  }

  function nextQuestion() {
    G.nudge = '';
    if (!hasPlant()) {
      G.question = null;
      renderPlay('');
      say(promptSpeech(), 'prompt');
      return;
    }
    G.recent = G.recent || [];
    G.question = (G.band && G.band.toddler) ? null : K.makeQuestion(P, { band: G.band, recent: G.recent });
    renderPlay('');
    say(promptSpeech(), 'prompt');
  }

  function startPlay(resume) {
    if (K.unlockedCount(G.state) >= K.ids().length && !K.selectedPlot(G.state)) { G.phase = 'done'; G.doneAll = true; render(); return; }
    G.phase = 'play';
    if (!resume) { G.justUnlocked = null; popFrame = ''; }
    if (A.Audio && A.Audio.sfx) A.Audio.sfx('ok');
    nextQuestion();
  }

  function afterCorrect(res) {
    markStar();
    if (A.Audio && A.Audio.sfx) A.Audio.sfx('ok');
    G.phase = res.unlocked ? 'pop' : (res.sessionDone ? 'rest' : 'play');
    var line = K.jobLine(res.job, res.name);
    say(line, 'chatter');
    if (res.unlocked) {
      popFrame = 'hop';
      renderPlay('hop');
      setTimeout(function () {
        popFrame = 'wave';
        renderPlay('wave');
        setTimeout(function () { busy = false; popFrame = 'wave'; renderPop(res); }, hopMs);
      }, hopMs);
      return;
    }
    renderPlay(res.job);
    setTimeout(function () {
      busy = false;
      if (res.sessionDone) renderRest();
      else nextQuestion();
    }, cheerMs);
  }

  function onPacket(id) {
    if (G.phase !== 'play' && G.phase !== 'title') return;
    if (!K.packetOpen(G.state, id)) {
      if (K.growingOn(G.state, id) >= 0) {
        K.selectPlot(G.state, K.growingOn(G.state, id));
        G.heldPacket = null;
        say(K.nameOf(id) + ' is already growing. Tap the plant you want to water.', 'chatter');
        renderPlay('');
        return;
      }
      if (G.state.plants[id] && G.state.plants[id].unlocked) {
        say(K.nameOf(id) + ' already joined you.', 'chatter');
        return;
      }
      say('Grow Pip first, then more seeds will open.', 'chatter');
      return;
    }
    G.heldPacket = id;
    G.nudge = plantPrompt(K.nameOf(id));
    say(G.nudge, 'chatter');
    if (arguments[1] === 'silent') {
      document.querySelectorAll('.gd-seedbtn').forEach(function (b) {
        b.classList.toggle('held', b.getAttribute('data-id') === id);
      });
      var askEl = $('#gdAsk'); if (askEl) askEl.textContent = G.nudge;
      var n = $('#gdNudge'); if (n) n.textContent = '';
      return;
    }
    renderPlay('');
    var n2 = $('#gdNudge'); if (n2) n2.textContent = G.nudge;
  }

  function onSpot(i) {
    if (G.phase !== 'play') return;
    var pl = G.state.plots[i];
    if (G.heldPacket) {
      if (pl && pl.id) {
        say('That patch already has a plant. Try an empty one.', 'chatter');
        return;
      }
      if (K.plantAt(G.state, i, G.heldPacket)) {
        var name = K.nameOf(G.heldPacket);
        afterPlant(name, i);
        return;
      }
    }
    if (pl && pl.id) {
      K.selectPlot(G.state, i);
      G.heldPacket = null;
      say('You will water ' + K.nameOf(pl.id) + ' next.', 'chatter');
      renderPlay('');
    }
  }

  function onPick(i, el) {
    var q = G.question; if (!q || G.phase !== 'play') return;
    busy = true;
    if (i === q.answer) {
      if (el) el.classList.add('right');
      if (q.skill && A.Curriculum && A.Curriculum.recordAnswer && !P.guest) {
        A.Curriculum.recordAnswer(P, q.skill, true, { hint: q.misses > 0 });
      }
      var res = K.applyCorrect(P, G);
      if (res.needPlant) {
        G.pendingGrowth = true;
        say(G.nudge || plantPrompt(), 'chatter');
        var n = $('#gdNudge'); if (n) n.textContent = G.nudge || '';
        busy = false;
        return;
      }
      afterCorrect(res);
    } else {
      q.misses = (q.misses || 0) + 1;
      if (q.skill && A.Curriculum && A.Curriculum.recordAnswer && !P.guest && q.misses === 1) {
        A.Curriculum.recordAnswer(P, q.skill, false, {});
      }
      G.nudge = K.hintFor(q);
      if (K.revealsAnswer && K.revealsAnswer(q, G.nudge)) G.nudge = '';
      if (el) { el.classList.add('wrong'); setTimeout(function () { el.classList.remove('wrong'); }, 400); }
      if (A.Audio && A.Audio.sfx) A.Audio.sfx('locked');
      say(G.nudge, 'chatter');
      var nd = $('#gdNudge'); if (nd) nd.textContent = G.nudge;
      busy = false;
    }
  }

  function onToddlerTap() {
    if (!hasPlant()) {
      G.nudge = plantPrompt();
      say(G.nudge, 'chatter');
      var n = $('#gdNudge'); if (n) n.textContent = G.nudge;
      return;
    }
    busy = true;
    var res = K.applyCorrect(P, G);
    afterCorrect(res);
  }

  function plantHook(id, plot) {
    var ok = K.plantAt(G.state, plot, id);
    if (ok) {
      G.heldPacket = null;
      K.saveState(P, G.state);
      if (G.phase === 'title') G.phase = 'play';
      if (G.phase === 'play') {
        if (!G.question && !(G.band && G.band.toddler)) nextQuestion();
        else renderPlay('');
      }
    }
    return ok;
  }

  function home() {
    A.Voice.stop();
    if (G.phase === 'pop') K.finishPop(G);
    K.saveState(P, G.state);
    if (!window.__noNav) location.href = A.ROOT + 'index.html?from=game#games';
  }

  $('#gdHome').onclick = home;
  if (A.HowTo) A.HowTo.button('garden', '#gdHome');
  $('#gdSpeak').onclick = function () { say(promptSpeech(), 'tap'); };

  if (A.Music && A.Music.play) A.Music.play('cozy');

  window.addEventListener('resize', function () {
    if ($('#gdScene')) layoutWorld();
    if ($('#gdCard')) layoutCard();
  });

  window.__garden = {
    G: G,
    snapshot: function () { return K.snapshot(G); },
    lastSay: function () { return lastSay; },
    startPlay: startPlay,
    nextQuestion: nextQuestion,
    plant: plantHook,
    selectPlot: function (i) { var ok = K.selectPlot(G.state, i); if (ok && G.phase === 'play') renderPlay(''); return ok; },
    answer: function (ok) {
      if (G.band && G.band.toddler) { onToddlerTap(); return; }
      if (!hasPlant()) return;
      if (!G.question) nextQuestion();
      if (!G.question) return;
      var i = ok ? G.question.answer : (G.question.answer + 1) % G.question.choices.length;
      var el = document.querySelector('.gd-choice[data-i="' + i + '"]');
      onPick(i, el);
    },
    tapWater: onToddlerTap,
    render: render,
    layout: function () { layoutWorld(); layoutCard(); },
    setCheerMs: function (ms) { cheerMs = ms; hopMs = ms; },
    nameOf: K.nameOf,
    dragActive: function () { return !!drag; },
    dragState: function () {
      return drag ? { id: drag.id, hasGhost: !!drag.ghost } : null;
    }
  };

  (A.HowTo && A.HowTo.first ? A.HowTo.first('garden') : Promise.resolve()).then(renderTitle);
})(window.Arcade);
