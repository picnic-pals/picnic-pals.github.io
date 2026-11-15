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
    if (G.heldPacket) return 'Tap a soft patch of soil to plant ' + K.nameOf(G.heldPacket) + '.';
    if (!K.selectedPlot(G.state) && K.packetsOpen(G.state).length) return 'Tap a seed packet, then a patch of soil.';
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
  function minHit(el, x, y, size) {
    var hit = Math.max(60, size);
    el.style.position = 'absolute';
    el.style.left = px(x - hit / 2);
    el.style.top = px(y - hit / 2);
    el.style.width = px(hit);
    el.style.height = px(hit);
  }

  function layoutWorld() {
    var scene = $('#gdScene');
    if (!scene || !Art) return;
    var W = scene.clientWidth, H = scene.clientHeight;
    if (!W || !H) return;
    var land = W > H;
    var bg = $('#gdBg');
    if (bg) bg.src = Art.bgSrc(land);

    var shelfDraw, shelfVX, shelfVY, bedVW, bedVX, bedVY;
    var bedRatio = (Art.BBOX.soil_bed[3] - Art.BBOX.soil_bed[1]) / (Art.BBOX.soil_bed[2] - Art.BBOX.soil_bed[0]);
    var bedPad = (1024 - Art.BBOX.soil_bed[3]) / (Art.BBOX.soil_bed[2] - Art.BBOX.soil_bed[0]);
    if (land) {
      shelfDraw = Math.min(W * 0.34, H * 0.72, 300);
      shelfVX = W * 0.01;
      shelfVY = Math.max(8, (H - shelfDraw * (Art.BBOX.seed_shelf[3] - Art.BBOX.seed_shelf[1]) / (Art.BBOX.seed_shelf[2] - Art.BBOX.seed_shelf[0])) * 0.4);
      bedVW = Math.min(W * (H < 420 ? 0.54 : 0.60), H * (H < 420 ? 0.98 : 1.08), 520);
      var bedVH = bedVW * bedRatio;
      bedVX = Math.min(W * 0.38, W - bedVW - 8);
      bedVY = H - 6 - bedVH - bedVW * bedPad;
      if (bedVY < H * 0.08) { bedVY = H * 0.08; }
    } else {
      shelfDraw = Math.min(W * 0.56, 280);
      shelfVX = 6;
      shelfVY = Math.max(4, H * 0.02);
      bedVW = Math.min(W * 0.94, 440);
      var bedVH = bedVW * bedRatio;
      bedVX = (W - bedVW) / 2;
      bedVY = H - 6 - bedVH - bedVW * bedPad;
      var shelfBottom = shelfVY + shelfDraw * (Art.BBOX.seed_shelf[3] - Art.BBOX.seed_shelf[1]) / (Art.BBOX.seed_shelf[2] - Art.BBOX.seed_shelf[0]);
      if (bedVY < shelfBottom - H * 0.22) bedVY = Math.max(H * 0.28, shelfBottom - H * 0.22);
    }

    var shelfVisH = shelfDraw * (Art.BBOX.seed_shelf[3] - Art.BBOX.seed_shelf[1]) / (Art.BBOX.seed_shelf[2] - Art.BBOX.seed_shelf[0]);
    var shelfRight = shelfVX + shelfDraw;
    var sun = $('#gdSun');
    var cloud = $('#gdCloud');
    var sunS = Math.min(W, H) * (land && H < 420 ? 0.18 : 0.16);
    var skyLeft = Math.min(shelfRight + 4, W * 0.55);
    var sunLeft = Math.min(W - sunS - 6, Math.max(skyLeft, W * 0.70));
    if (sun) {
      sun.style.left = px(sunLeft);
      sun.style.top = px(Math.max(2, H * 0.01));
      sun.style.width = px(sunS);
      sun.style.height = px(sunS);
    }
    if (cloud) {
      var cS = sunS * 0.85;
      var cloudLeft = Math.max(skyLeft, sunLeft - cS - 8);
      if (cloudLeft + cS > sunLeft - 2) cloudLeft = Math.max(2, sunLeft - cS - 4);
      cloud.style.left = px(cloudLeft);
      cloud.style.top = px(Math.max(2, H * 0.02));
      cloud.style.width = px(cS);
      cloud.style.height = px(cS);
    }

    var shelfArt = $('#gdShelfArt');
    var shelfPlaced = shelfArt ? Art.placeCanvas(shelfArt, 1024, Art.BBOX.seed_shelf, shelfVX, shelfVY, shelfDraw) : null;
    var packetPx = 512 * Art.PACKET_SCALE * ((shelfPlaced ? shelfPlaced.img : shelfDraw * 1024 / (Art.BBOX.seed_shelf[2] - Art.BBOX.seed_shelf[0])) / 1024);
    Art.SHELF_SLOTS.forEach(function (slot) {
      var wrap = document.querySelector('.gd-packet[data-id="' + slot.id + '"]');
      if (!wrap || !shelfPlaced) return;
      var foot = Art.packetFoot(slot.id);
      var pos = Art.canvasToScene(shelfPlaced, slot.x, slot.y);
      var img = wrap.querySelector('img');
      var iw = packetPx;
      var hit = Math.max(60, iw);
      var cx = pos.x, cy = pos.y - iw * 0.28;
      minHit(wrap, cx, cy, iw);
      if (img) {
        img.style.position = 'absolute';
        img.style.width = px(iw);
        img.style.height = px(iw);
        img.style.left = px((pos.x - (foot.x / 512) * iw) - (cx - hit / 2));
        img.style.top = px((pos.y - (foot.y / 512) * iw) - (cy - hit / 2));
      }
    });

    var bedArt = $('#gdBedArt');
    var bedPlaced = bedArt ? Art.placeCanvas(bedArt, 1024, Art.BBOX.soil_bed, bedVX, bedVY, bedVW) : null;
    var plantSize = bedPlaced ? Math.max(70, bedPlaced.scale * 210) : 90;
    Art.BED_SPOTS.forEach(function (spot, i) {
      var wrap = document.querySelector('.gd-spot[data-i="' + i + '"]');
      if (!wrap || !bedPlaced) return;
      var pos = Art.canvasToScene(bedPlaced, spot.x, spot.y);
      var img = wrap.querySelector('.gd-plant');
      var burst = wrap.querySelector('.gd-burst');
      var spark = wrap.querySelector('.gd-spark');
      var foot = Art.stageFoot();
      var hit = Math.max(60, plantSize * 0.55);
      var cx = pos.x, cy = pos.y - plantSize * 0.22;
      minHit(wrap, cx, cy, hit);
      wrap.style.zIndex = String(6 + (spot.row || 0) * 2);
      if (img) {
        img.style.position = 'absolute';
        img.style.width = px(plantSize);
        img.style.height = px(plantSize);
        img.style.left = px((pos.x - (foot.x / 512) * plantSize) - (cx - hit / 2));
        img.style.top = px((pos.y - (foot.y / 512) * plantSize) - (cy - hit / 2));
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
      wrap.dataset.sx = String(pos.x);
      wrap.dataset.sy = String(pos.y);
    });

    layoutCan(bedPlaced);
  }

  function layoutCan(bedPlaced) {
    var can = $('#gdCan'), stream = $('#gdStream');
    if (!can) return;
    var sel = document.querySelector('.gd-spot.selected');
    var sx, sy, canS, spout, top, left, streamS;
    if (sel && sel.dataset.sx) { sx = +sel.dataset.sx; sy = +sel.dataset.sy; }
    else if (bedPlaced) {
      var mid = Art.canvasToScene(bedPlaced, Art.BED_SPOTS[4].x, Art.BED_SPOTS[4].y);
      sx = mid.x; sy = mid.y;
    } else return;
    canS = Math.max(70, (bedPlaced ? bedPlaced.scale * 200 : 90));
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
    var sunOn = job === 'sun' || !!(shot && shot.plots && shot.plots.some(function (pl) { return pl.stage === 'grown' || pl.stage === 'peek' || pl.stage === 'pop'; }));
    var html = '';
    html += '<img class="gd-bg" id="gdBg" src="' + Art.bgSrc(land) + '" alt="">';
    html += '<img class="gd-sun' + (sunOn ? ' on' : '') + '" id="gdSun" src="' + Art.src('sun') + '" alt="">';
    html += '<img class="gd-cloud" id="gdCloud" src="' + Art.src('rain_cloud') + '" alt="">';
    html += '<img class="gd-shelf-art" id="gdShelfArt" src="' + Art.src('seed_shelf') + '" alt="">';
    Art.SHELF_SLOTS.forEach(function (slot) {
      var open = K.packetOpen(st, slot.id);
      var held = G.heldPacket === slot.id;
      var gone = !!(st.plants[slot.id] && st.plants[slot.id].unlocked) || K.growingOn(st, slot.id) >= 0;
      var cls = 'gd-packet' + (open ? ' open' : ' shut') + (held ? ' held' : '') + (gone ? ' gone' : '');
      html += '<button type="button" class="' + cls + '" data-id="' + slot.id + '" aria-label="' + A.esc(K.nameOf(slot.id)) + ' seeds">';
      html += '<img src="' + Art.packetSrc(slot.id) + '" alt=""></button>';
    });
    html += '<img class="gd-bed-art" id="gdBedArt" src="' + Art.src('soil_bed') + '" alt="">';
    (st.plots || []).forEach(function (pl, i) {
      var selected = st.selected === i;
      var stage = 'empty';
      if (pl.id) {
        if (G.justUnlocked === pl.id && (job === 'hop' || popFrame === 'hop')) stage = 'hop';
        else if (G.justUnlocked === pl.id && (job === 'wave' || job === 'pop' || popFrame === 'wave')) stage = 'wave';
        else stage = K.stageOf(pl.answers, K.needOf(pl.id));
        if (stage === 'peek') stage = 'popout';
        if (stage === 'pop' && G.justUnlocked === pl.id) stage = popFrame || 'hop';
        if (stage === 'pop') stage = 'wave';
      }
      html += '<button type="button" class="gd-spot' + (selected ? ' selected' : '') + (pl.id ? ' planted' : ' empty') + '" data-i="' + i + '" aria-label="Plot ' + (i + 1) + '">';
      if (pl.id && stage && stage !== 'empty') {
        html += '<img class="gd-plant" src="' + Art.stageSrc(pl.id, stage === 'popout' ? 'peek' : stage) + '" alt="">';
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

  function renderCard(shot) {
    if (!hasPlant() && !(G.band && G.band.toddler && hasPlant())) {
      if (!hasPlant()) {
        return '<div class="gd-card" id="gdCard"><p class="gd-ask" id="gdAsk">Tap a seed packet, then a patch of soil.</p><p class="gd-nudge" id="gdNudge">' + A.esc(G.nudge || '') + '</p></div>';
      }
    }
    if (G.band && G.band.toddler) {
      return '<div class="gd-card" id="gdCard"><p class="gd-ask" id="gdAsk">Tap Water to help the plant grow.</p>' +
        '<p class="gd-nudge" id="gdNudge">' + A.esc(G.nudge || '') + '</p>' +
        '<button type="button" class="gd-water" id="gdWater">Water</button></div>';
    }
    var q = G.question;
    if (!q) return '<div class="gd-card" id="gdCard"><p class="gd-ask" id="gdAsk">Tap a seed packet, then a patch of soil.</p><p class="gd-nudge" id="gdNudge">' + A.esc(G.nudge || '') + '</p></div>';
    var html = '<div class="gd-card" id="gdCard"><p class="gd-ask" id="gdAsk">' + (q.html || A.esc(q.text)) + '</p>';
    if (q.pic) html += '<div class="gd-pic">' + q.pic + '</div>';
    html += '<p class="gd-nudge" id="gdNudge">' + A.esc(G.nudge || '') + '</p>';
    var n = (q.choices || []).length;
    html += '<div class="gd-choices n' + n + '" id="gdChoices">';
    (q.choices || []).forEach(function (c, i) {
      html += '<button type="button" class="gd-choice" data-i="' + i + '">' + (c.html || A.esc(c.label)) + '</button>';
    });
    html += '</div></div>';
    return html;
  }

  function bindWorld() {
    document.querySelectorAll('.gd-packet').forEach(function (el) {
      el.onclick = function () { if (!busy) onPacket(el.getAttribute('data-id')); };
    });
    document.querySelectorAll('.gd-spot').forEach(function (el) {
      el.onclick = function () { if (!busy) onSpot(+el.getAttribute('data-i')); };
    });
  }

  function bindCard() {
    if ($('#gdWater')) $('#gdWater').onclick = function () { if (!busy) onToddlerTap(); };
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
    $('#gdStage').innerHTML =
      '<div class="gd-play">' +
        '<div class="gd-scene" id="gdScene">' + renderScene(shot, job || '') + '</div>' +
        renderCard(shot) +
      '</div>';
    bindWorld();
    bindCard();
    layoutWorld();
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
    G.question = (G.band && G.band.toddler) ? null : K.makeQuestion(P, { band: G.band });
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
    G.nudge = 'Tap a soft patch of soil to plant ' + K.nameOf(id) + '.';
    say(G.nudge, 'chatter');
    renderPlay('');
    var n = $('#gdNudge'); if (n) n.textContent = G.nudge;
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
        G.heldPacket = null;
        K.saveState(P, G.state);
        say('You planted ' + name + '!', 'chatter');
        if (G.pendingGrowth) {
          G.pendingGrowth = false;
          afterCorrect(K.applyCorrect(P, G));
          return;
        }
        if (!G.question && !(G.band && G.band.toddler)) nextQuestion();
        else renderPlay('');
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
        say(G.nudge || 'Tap a seed packet, then a patch of soil.', 'chatter');
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
      if (el) { el.classList.add('wrong'); setTimeout(function () { el.classList.remove('wrong'); }, 400); }
      if (A.Audio && A.Audio.sfx) A.Audio.sfx('locked');
      say(G.nudge, 'chatter');
      var nd = $('#gdNudge'); if (nd) nd.textContent = G.nudge;
      busy = false;
    }
  }

  function onToddlerTap() {
    if (!hasPlant()) {
      G.nudge = 'Tap a seed packet, then a patch of soil.';
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
  $('#gdSpeak').onclick = function () { say(promptSpeech(), 'tap'); };

  if (A.Music && A.Music.play) A.Music.play('cozy');

  window.addEventListener('resize', function () {
    if ($('#gdScene')) layoutWorld();
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
    layout: layoutWorld,
    setCheerMs: function (ms) { cheerMs = ms; hopMs = ms; },
    nameOf: K.nameOf
  };

  renderTitle();
})(window.Arcade);
