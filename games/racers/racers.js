/* Snack Racers v1 — garage, race, questions, podium. Cars drive themselves. */
(function (A) {
  'use strict';
  A.UI.boot();
  var P = A.Store.active();
  if (!P) { location.replace(A.ROOT + 'index.html#players'); return; }
  var K = A.Racers, $ = A.$, I = A.Icons;
  var family = A.Store.family ? A.Store.family() : ((A.Store.data.family = A.Store.data.family || { coins: 0, racers: {} }));
  K.garageOf(family);
  var stats = P.games.racers = P.games.racers || { races: 0, wins: 0, best: {}, tier: 0 };
  var G = null, screen = 'menu', busy = false, askedAt = 0;

  function icon(key, size, cls) {
    return I ? I.html(key, { size: size || 48, decorative: true, cls: 'pp-pic' + (cls ? ' ' + cls : '') }) : '';
  }
  function fname(id) {
    var c = (A.FoodData && A.FoodData.cast || []).filter(function (f) { return f.id === id; })[0];
    return (c && c.name) || (A.Blobs && A.Blobs.byId && A.Blobs.byId[id] && A.Blobs.byId[id].name) || 'Friend';
  }
  function friendImg(id, ex) {
    return A.ROOT + 'assets/picnic/friends/' + id + '/' + (ex || 'front') + '_256.webp';
  }
  function say(text, kind) {
    if (!text) return;
    A.Voice.say([{ text: text }], { kind: kind || 'tap', bubble: false });
  }
  function persist() { K.garageOf(family); A.Store.save(); }
  function coinsEl() {
    var el = $('#srCoins');
    if (!el) return;
    el.innerHTML = icon('🪙', 22, 'coin') + '<b>' + (family.coins || 0) + '</b>';
  }

  function oppCarSpec() {
    var blank = { paint: 'natural', sticker: 'none', trail: 'none' };
    var track = (G && G.track) || 'picnic';
    var mode = (G && G.mode) || 'friend';
    if (mode === 'boss') return Object.assign({ body: 'hotdog_v2', wheels: 'waffle_v2', spoiler: 'lettuce_v2' }, blank);
    if (track === 'candy') return Object.assign({ body: 'cupcake_v1', wheels: 'waffle_v2', spoiler: 'candycane_v1' }, blank);
    if (track === 'pizza') return Object.assign({ body: 'hotdog_v2', wheels: 'pizza_v2', spoiler: 'lettuce_v2' }, blank);
    return Object.assign({ body: 'watermelon_v1', wheels: 'cucumber_v1', spoiler: 'candycane_v1' }, blank);
  }
  function carHtml(car, driver, cls, motion) {
    car = car || K.garageOf(family).car;
    var bodyId = K.migrateId('body', car.body) || 'banana_v1';
    var wheelId = K.migrateId('wheels', car.wheels) || 'donut_v1';
    var spoilerId = K.migrateId('spoiler', car.spoiler) || 'pretzel_v1';
    var mount = K.spoilerMount(bodyId);
    var foot = K.spoilerFoot(spoilerId);
    var seat = K.seatOf(bodyId);
    var trail = car.trail && car.trail !== 'none' ? ' trail-' + car.trail : '';
    var move = motion ? (' ' + motion) : '';
    var sticker = car.sticker && car.sticker !== 'none' ? K.findPart('sticker', car.sticker) : null;
    var pose = (motion === 'boosting') ? 'happy' : 'front';
    return '<div class="sr-kart sr-car ' + (cls || '') + trail + move + '" style="--mx:' + mount[0] + ';--my:' + mount[1] + ';--fx:' + foot[0] + ';--fy:' + foot[1] + ';--sx:' + seat[0] + ';--sy:' + seat[1] + '">' +
      '<div class="sr-k-wheel back"><img src="' + K.partSrc('wheels', wheelId, A.ROOT) + '" alt="" draggable="false"></div>' +
      '<div class="sr-k-wheel front"><img src="' + K.partSrc('wheels', wheelId, A.ROOT) + '" alt="" draggable="false"></div>' +
      '<img class="sr-k-body" src="' + K.partSrc('body', bodyId, A.ROOT) + '" alt="" draggable="false">' +
      (driver ? '<div class="sr-k-driver"><img src="' + friendImg(driver, pose) + '" alt="" draggable="false"></div>' : '') +
      '<img class="sr-k-front" src="' + K.partSrc('body_front', bodyId, A.ROOT) + '" alt="" draggable="false">' +
      (sticker && sticker.icon ? '<div class="sr-k-sticker">' + icon(sticker.icon, 32, 'sticker') + '</div>' : '') +
      '<img class="sr-k-spoiler" src="' + K.partSrc('spoiler', spoilerId, A.ROOT) + '" alt="" draggable="false">' +
    '</div>';
  }
  function partThumb(kind, id) {
    if (kind === 'body' || kind === 'wheels' || kind === 'spoiler') {
      return '<img class="sr-thumb sr-thumb-' + kind + '" src="' + K.partSrc(kind, id, A.ROOT) + '" alt="">';
    }
    return '';
  }

  function headerIcons() {
    var s = $('#srSpeak');
    if (s && !s.querySelector('.pp-icon')) s.innerHTML = icon('🔊', 32, 'speak');
    coinsEl();
  }

  function renderMenu() {
    screen = 'menu';
    document.body.className = '';
    var g = K.garageOf(family);
    var tracks = Object.keys(K.TRACKS).map(function (id) {
      var t = K.TRACKS[id], open = !!g.tracks[id];
      return '<button class="sr-btn sr-secondary' + (open ? '' : ' lock') + '" data-act="track" data-id="' + id + '">' +
        A.esc(t.name) + (open ? '' : ' · ' + t.cost + ' coins') + '</button>';
    }).join('');
    var best = stats.best && stats.best.picnic;
    $('#srContent').innerHTML =
      '<div class="sr-menu">' +
        '<div class="sr-panel sr-preview" id="srPreview">' + carHtml(g.car, P.blob) + '</div>' +
        '<div class="sr-panel"><p class="sr-lead">Race your food car.</p>' +
          '<p class="sr-sub">The car drives itself. You answer questions to boost.</p></div>' +
        '<div class="sr-actions">' +
          '<button class="sr-btn" id="srFriend">Race a friend</button>' +
          '<button class="sr-btn" id="srBoss">Race a picnic boss</button>' +
          '<button class="sr-btn sr-secondary" id="srBest">' + (best ? 'Beat your best time' : 'Best-time race') + '</button>' +
          '<button class="sr-btn sr-secondary" id="srGarage">Garage</button>' +
        '</div>' +
        '<div class="sr-panel"><p class="sr-sub">Tracks</p><div class="sr-actions">' + tracks + '</div></div>' +
      '</div>';
    $('#srFriend').onclick = function () { beginRace('friend'); };
    $('#srBoss').onclick = function () { beginRace('boss'); };
    $('#srBest').onclick = function () { beginRace('best'); };
    $('#srGarage').onclick = renderGarage;
    A.$$('[data-act="track"]').forEach(function (el) {
      el.onclick = function () {
        var id = el.getAttribute('data-id');
        if (g.tracks[id]) { family.racers._track = id; persist(); say(K.TRACKS[id].name + ' is ready.', 'tap'); return; }
        var r = K.buy(family, 'track', id);
        if (r.ok) { persist(); coinsEl(); say(K.TRACKS[id].name + ' is unlocked!', 'chatter'); renderMenu(); }
        else say('You need more coins for that track.', 'chatter');
      };
    });
    coinsEl();
  }

  function renderGarage() {
    screen = 'garage';
    document.body.className = 'sr-on-garage';
    var g = K.garageOf(family);
    function section(kind, title) {
      var h = '<div class="sr-sec"><h2>' + title + '</h2><div class="sr-row">';
      (K.PARTS[kind] || []).forEach(function (item) {
        var have = K.owned(g, kind, item.id);
        var on = g.car[kind] === item.id;
        var thumb = partThumb(kind, item.id) || (item.icon ? icon(item.icon, 64, 'part') : '<span class="sr-swatch paint-' + item.id + '"></span>');
        h += '<button class="sr-part' + (on ? ' on' : '') + (have ? '' : ' lock') + '" data-kind="' + kind + '" data-id="' + item.id + '">' +
          thumb +
          '<span>' + A.esc(item.name) + '</span>' +
          (have ? (on ? '<span>On</span>' : '') : '<span class="sr-cost">' + item.cost + ' coins</span>') +
        '</button>';
      });
      return h + '</div></div>';
    }
    var up = '<div class="sr-sec"><h2>Little upgrades</h2><div class="sr-row">';
    [['speed', 'Speed', g.car.speedLv], ['handling', 'Handling', g.car.handleLv]].forEach(function (u) {
      up += '<button class="sr-part' + (u[2] >= 3 ? ' on' : '') + '" data-kind="upgrade" data-id="' + u[0] + '">' +
        '<span>' + u[1] + '</span><span>' + u[2] + ' / 3</span>' +
        (u[2] >= 3 ? '<span>Max</span>' : '<span class="sr-cost">' + K.upgradeCost(u[2]) + ' coins</span>') + '</button>';
    });
    up += '</div></div>';
    $('#srContent').innerHTML =
      '<div class="sr-garage">' +
        '<div class="sr-panel sr-preview">' + carHtml(g.car, P.blob) + '</div>' +
        '<div class="sr-panel"><p class="sr-lead">Family garage</p>' +
          '<p class="sr-sub">Everyone shares these coins and parts. Upgrades only help a little.</p></div>' +
        '<div class="sr-shop">' +
          section('body', 'Body') + section('wheels', 'Wheels') + section('spoiler', 'Spoiler') +
          section('paint', 'Paint') + section('sticker', 'Stickers') +
          section('horn', 'Horns') + section('trail', 'Trails') + up +
        '</div>' +
        '<button class="sr-action" id="srBack">Back</button>' +
      '</div>';
    A.$$('.sr-part').forEach(function (el) {
      el.onclick = function () {
        var kind = el.getAttribute('data-kind'), id = el.getAttribute('data-id');
        if (kind === 'upgrade' || !K.owned(K.garageOf(family), kind, id)) {
          var r = K.buy(family, kind, id);
          if (!r.ok) {
            say(r.why === 'coins' ? 'You need more coins.' : (r.why === 'max' ? 'That is as far as it goes.' : 'You already have that.'), 'chatter');
            return;
          }
          persist(); coinsEl();
          say('Nice!', 'chatter');
          A.Audio.sfx('pop');
          renderGarage();
          return;
        }
        K.equip(family, kind, id);
        persist();
        renderGarage();
      };
    });
    $('#srBack').onclick = renderMenu;
    coinsEl();
  }


  function prop(id, size, cls) {
    return '<span class="sr-prop ' + (cls || '') + '">' + icon(id, size || 64, 'prop') + '</span>';
  }
  function picnicBlanket(topId) {
    return '<span class="sr-picnic"><span class="sr-blanket" aria-hidden="true"></span>' + icon(topId || 'object.basket', 40, 'prop') + '</span>';
  }
  function sceneryStrip(track, which) {
    var bits = '';
    var i;
    if (track === 'candy') {
      var sweets = ['food.candy', 'food.cupcake', 'food.donut', 'gaps.lollipop', 'food.cookie'];
      if (which === 'top') {
        bits += prop('scenery.deciduous_tree', 80, 'tree') + picnicBlanket('food.cupcake');
        for (i = 0; i < sweets.length; i++) bits += prop(sweets[i], 40, 'flower');
        bits += prop('scenery.evergreen_tree', 88, 'tree') + picnicBlanket('food.donut');
        bits += prop('object.balloon', 40, 'ball') + prop('scenery.sunflower', 36, 'flower');
      } else {
        bits += picnicBlanket('food.cookie') + prop('scenery.evergreen_tree', 70, 'tree');
        for (i = 0; i < 4; i++) bits += prop(sweets[i], 36, 'flower');
        bits += picnicBlanket('food.candy') + prop('scenery.deciduous_tree', 74, 'tree') + prop('object.balloon', 32, 'ball');
      }
    } else if (track === 'pizza') {
      if (which === 'top') {
        bits += prop('scenery.deciduous_tree', 80, 'tree') + picnicBlanket('food.pizza');
        bits += prop('food.tomato', 36, 'flower') + prop('food.cheese', 36, 'flower') + prop('scenery.mushroom', 36, 'flower');
        bits += prop('scenery.evergreen_tree', 88, 'tree') + picnicBlanket('food.tomato') + prop('scenery.herb', 32, 'flower');
      } else {
        bits += picnicBlanket('food.pizza') + prop('scenery.evergreen_tree', 70, 'tree');
        bits += prop('food.tomato', 32, 'flower') + prop('food.cheese', 32, 'flower') + picnicBlanket('object.plate');
        bits += prop('scenery.deciduous_tree', 74, 'tree');
      }
    } else {
      if (which === 'top') {
        bits += prop('scenery.deciduous_tree', 80, 'tree') + picnicBlanket('object.basket');
        bits += prop('scenery.tulip', 32, 'flower') + prop('scenery.sunflower', 36, 'flower');
        bits += prop('object.balloon', 40, 'ball') + prop('scenery.evergreen_tree', 88, 'tree');
        bits += picnicBlanket('food.red_apple') + prop('object.lantern', 36, 'ball') + prop('scenery.tulip', 32, 'flower');
        bits += prop('scenery.deciduous_tree', 76, 'tree') + picnicBlanket('object.basket');
      } else {
        bits += picnicBlanket('object.basket') + prop('scenery.evergreen_tree', 70, 'tree');
        bits += prop('scenery.sunflower', 32, 'flower') + prop('object.balloon', 32, 'ball');
        bits += picnicBlanket('food.strawberry') + prop('scenery.deciduous_tree', 74, 'tree');
        bits += prop('scenery.tulip', 30, 'flower') + picnicBlanket('object.basket') + prop('object.lantern', 32, 'ball');
      }
    }
    return '<div class="sr-scenery-strip">' + bits + bits + bits + '</div>';
  }
  function farHtml(track, cam) {
    var sun = track === 'candy' ? 'scenery.sun_with_face' : 'scenery.sun';
    var hills = '<div class="sr-hills" aria-hidden="true">' +
      '<i class="sr-hill a"></i><i class="sr-hill b"></i><i class="sr-hill c"></i>' +
      '<i class="sr-hill d"></i><i class="sr-hill e"></i><i class="sr-hill f"></i>' +
      '<i class="sr-hill g"></i><i class="sr-hill h"></i></div>';
    var treeSet = ['scenery.deciduous_tree', 'scenery.evergreen_tree', 'scenery.deciduous_tree', 'scenery.evergreen_tree'];
    var trees = '', i, left;
    for (i = 0; i < 16; i++) {
      left = 2 + i * 6.1 + (i % 3) * 0.8;
      trees += '<span class="sr-far-tree t' + (i % 4) + '" style="left:' + left + '%">' +
        icon(treeSet[i % 4], (i % 2) ? 40 : 52, 'fartree') + '</span>';
    }
    var clouds = '', spots = [
      [4, 10, 70, 1], [14, 18, 52, 2], [26, 8, 80, 3], [38, 16, 60, 1],
      [48, 6, 64, 2], [58, 14, 48, 3], [70, 10, 72, 1], [82, 18, 56, 2], [90, 8, 66, 3]
    ];
    for (i = 0; i < spots.length; i++) {
      clouds += '<span class="sr-cloud c' + spots[i][3] + '" style="left:' + spots[i][0] +
        '%;top:' + spots[i][1] + '%;width:' + spots[i][2] + 'px">' +
        icon('scenery.cloud', spots[i][2], 'cloud') + '</span>';
    }
    return '<div class="sr-far" style="transform:translateX(-' + (cam * 0.35).toFixed(3) + '%)">' +
      '<div class="sr-sky-wash"></div>' +
      '<div class="sr-sun">' + icon(sun, 72, 'sun') + '</div>' +
      '<div class="sr-clouds">' + clouds + '</div>' +
      hills +
      '<div class="sr-far-trees">' + trees + '</div>' +
    '</div>';
  }
  function midHtml(cam) {
    var bunts = '', i;
    for (i = 0; i < 8; i++) bunts += icon('object.bunting', 160, 'bunting');
    return '<div class="sr-mid" style="transform:translateX(-' + (cam * 0.6).toFixed(3) + '%)">' +
      '<div class="sr-festoon">' + bunts + '</div></div>';
  }
  function whooshHtml() {
    var bits = '', n;
    for (n = 0; n < 8; n++) {
      bits += '<i style="top:' + (8 + n * 12) + '%;width:' + (30 + (n % 3) * 16) + '%;left:' + (10 + (n % 4) * 18) + '%;animation-delay:' + (n * 0.05) + 's"></i>';
    }
    return '<div class="sr-whoosh" aria-hidden="true">' + bits + '</div>';
  }
  function progressHtml(race) {
    var len = K.TRACK_LEN || 1000;
    function row(who, dist, cls, face) {
      var pct = Math.max(2, Math.min(98, 100 * (dist / len)));
      var faceHtml = face === 'sil' ? '<div class="sr-sil"></div>' : '<img src="' + friendImg(face, 'front') + '" alt="">';
      return '<div class="sr-prog-row ' + cls + '">' + faceHtml +
        '<div class="sr-prog-track"><i style="left:' + pct + '%"></i></div>' +
        '<span class="sr-prog-flag">' + icon('🏁', 20, 'flag') + '</span></div>';
    }
    return '<div class="sr-progress" id="srProgress" aria-hidden="true">' +
      row('me', race.playerDist, 'me', P.blob) +
      row('opp', race.oppDist, 'opp', race.friend) +
    '</div>';
  }
  function silHtml() { return '<div class="sr-sil" aria-hidden="true"></div>'; }
  function thirdPlace() {
    if (!G || (G.mode !== 'boss' && G.mode !== 'best')) return null;
    var ids = (A.Friends && A.Friends.of) ? A.Friends.of(P) : [];
    var i, id;
    for (i = 0; i < ids.length; i++) {
      id = ids[i];
      if (id !== P.blob && id !== G.friend) return id;
    }
    return null;
  }

  function beginRace(mode) {
    var track = (family.racers && family.racers._track) || 'picnic';
    if (!K.garageOf(family).tracks[track]) track = 'picnic';
    G = K.startRace(P, family, { mode: mode, track: track, now: Date.now() });
    screen = 'race';
    askedAt = Date.now();
    renderRace();
    sayQuestion();
  }

  function qWho() {
    if (!G) return '';
    if (G.boss) return 'Picnic Boss ' + fname(G.friend) + ' threw a snack on the track!';
    if (G.mode === 'best') return 'Beat your best time.';
    return fname(G.friend) + ' is racing too!';
  }


  function trackLayerUrl(track, layer) {
    return K.trackLayerSrc(track, layer, A.ROOT);
  }
  function parHtml(track, layer, cam) {
    var src = trackLayerUrl(track, layer);
    return '<div class="sr-par sr-par-' + layer + '" style="transform:translateX(-' + cam.toFixed(3) + '%)">' +
      '<div class="sr-par-art">' +
        '<img src="' + src + '" alt="" draggable="false">' +
        '<img src="' + src + '" alt="" draggable="false">' +
      '</div>' +
    '</div>';
  }
  function trackStageHtml(track, cam, bits) {
    var info = (K.TRACK_ART && K.TRACK_ART[track]) || (K.TRACK_ART && K.TRACK_ART.picnic);
    var hasFar = !!(info && info.layers.indexOf('far') >= 0);
    var actors =
      '<div class="sr-par sr-par-actors" style="transform:translateX(-' + cam.toFixed(3) + '%)">' +
        '<div class="sr-start" aria-hidden="true"></div>' +
        '<div class="sr-finish" aria-hidden="true"></div>' +
        '<div class="sr-lane opp"><div style="left:' + bits.opLeft + '%">' + bits.opp + '</div></div>' +
        '<div class="sr-lane me">' + (bits.obs || '') + '<div style="left:' + bits.meLeft + '%">' + bits.me + '</div></div>' +
        (bits.boss || '') +
      '</div>';
    return '<div class="sr-stage">' +
      parHtml(track, 'sky', cam * 0.25) +
      (hasFar ? parHtml(track, 'far', cam * 0.35) : '') +
      parHtml(track, 'mid', cam * 0.6) +
      parHtml(track, 'road', cam) +
      parHtml(track, 'near', cam) +
      actors +
    '</div>';
  }

  function renderRace() {
    if (!G) return;
    document.body.className = 'track-' + G.track;
    var q = K.current(G);
    var g = K.garageOf(family);
    var trackLen = K.TRACK_LEN || 1000;
    /* World is 2.5 screens wide. Positions are % of that world. Camera follows the player. */
    var WORLD_SCREENS = 2.5;
    var START_AT = 3.2;
    var FINISH_AT = 92;
    var view = 100 / WORLD_SCREENS;
    var travel = FINISH_AT - START_AT;
    var meLeft = START_AT + travel * Math.min(1, G.playerDist / trackLen);
    var opLeft = START_AT + travel * Math.min(1, G.oppDist / trackLen);
    var focus = view * 0.30;
    var cam = meLeft - focus;
    if (cam < 0) cam = 0;
    if (cam > 100 - view) cam = 100 - view;
    var obs = '';
    var obsLeft = Math.min(meLeft + view * 0.28, cam + view * 0.82);
    if (obsLeft < meLeft + 5) obsLeft = meLeft + 5;
    if (G.phase === 'question' && G.obstacle && G.boss) {
      var food = K.BY[G.obstacle] || { icon: '🍅', id: G.obstacle };
      obs = '<div class="sr-obstacle" id="srObstacle" style="left:' + obsLeft + '%">' + icon(food.icon, 96, 'obs') + '</div>';
    }
    var boss = '';
    if (G.boss) {
      boss = '<div class="sr-boss" id="srBoss" style="left:' + (obsLeft + 3) + '%"><img src="' + friendImg(G.friend, 'happy') + '" alt=""><span>Boss</span></div>';
    }
    var lastAns = G.answers.length ? G.answers[G.answers.length - 1] : null;
    var boosting = G.phase === 'drive' && lastAns && lastAns.correct;
    var slipping = G.phase === 'drive' && lastAns && !lastAns.correct;
    var itemFx = '';
    if (boosting) itemFx = '<span class="sr-item boost" aria-hidden="true"><svg viewBox="0 0 32 32" width="36" height="36"><ellipse cx="16" cy="13" rx="13" ry="11" fill="#d94a4a" stroke="#5a3d1c" stroke-width="1.6"/><circle cx="11" cy="11" r="3.2" fill="#fff6dc"/><circle cx="19" cy="9" r="2.6" fill="#fff6dc"/><circle cx="21" cy="16" r="2.2" fill="#fff6dc"/><path d="M11 22h10v5c0 2.2-2.2 4-5 4s-5-1.8-5-4z" fill="#f4e2b8" stroke="#5a3d1c" stroke-width="1.5"/></svg></span>';
    if (slipping) itemFx = '<span class="sr-item slip" aria-hidden="true"><svg viewBox="0 0 32 32" width="36" height="36"><path d="M6 22c2-8 8-14 18-16 2 6-1 12-8 16-4 2-8 2-10 0z" fill="#f0c84a" stroke="#5a3d1c" stroke-width="1.6"/><path d="M10 20c3-3 8-6 14-7" fill="none" stroke="#c9a024" stroke-width="1.4"/></svg></span>';
    var pips = '';
    for (var i = 0; i < G.n; i++) {
      var cls = i === G.i && G.phase !== 'podium' ? ' on' : '';
      if (G.answers[i]) cls = G.answers[i].correct ? ' ok' : ' no';
      pips += '<i class="' + cls + '"></i>';
    }
    var card = '';
    if (G.phase === 'question' && q) {
      var pics = '';
      if (q.kind === 'count' && q.count != null && A.CountVisual) {
        var foodIcon = '';
        if (q.food && K.BY[q.food]) foodIcon = icon(K.BY[q.food].icon, 56, 'pic');
        pics = '<div class="sr-pics" id="srPics">' + foodIcon + A.CountVisual.html(q.count) + '</div>';
      } else if (q.kind === 'count' && q.pic && q.pic.length) {
        pics = '<div class="sr-pics" id="srPics">' + q.pic.map(function (id) {
          var f = K.BY[id]; return icon(f ? f.icon : id, 56, 'pic');
        }).join('') + '</div>';
      }
      var choices = q.choices.map(function (c, idx) {
        return '<button class="sr-choice" data-i="' + idx + '">' +
          (c.icon ? icon(c.icon, 64, 'ch') : '') +
          (c.icon ? '<span class="sr-visually-hidden">' + A.esc(c.label) + '</span>' : A.esc(c.label)) +
        '</button>';
      }).join('');
      card = '<div class="sr-qcard' + (G.boss && G.obstacle ? ' boss' : '') + '" id="srCard">' +
        '<div class="sr-qwho">' + A.esc(qWho()) + '</div>' +
        '<button id="srCardSpeak" aria-label="Read the question aloud">' + icon('🔊', 32, 'cardspeak') + '</button>' +
        '<p class="sr-ask" id="srAsk">' + A.esc(q.text) + '</p>' +
        pics +
        '<div class="sr-choices" id="srChoices">' + choices + '</div>' +
      '</div>';
    }
    $('#srContent').innerHTML =
      '<div class="sr-race">' +
        '<div class="sr-pips" aria-hidden="true">' + pips + '</div>' +
        progressHtml(G) +
        '<div class="sr-track ' + G.track + (boosting ? ' boosting' : '') + (slipping ? ' slipping' : '') + ((G.phase === 'question' || G.phase === 'drive') ? ' live' : '') + '" id="srTrack">' +
          trackStageHtml(G.track, cam, {
            meLeft: meLeft, opLeft: opLeft, obsLeft: obsLeft,
            me: carHtml(g.car, P.blob, '', boosting ? 'boosting' : (slipping ? 'slipping' : (G.phase === 'drive' || G.phase === 'question' ? 'rolling' : ''))),
            opp: carHtml(oppCarSpec(), G.boss ? null : G.friend, 'sm', boosting ? 'boosting' : (G.phase === 'drive' || G.phase === 'question' ? 'rolling' : '')),
            obs: obs, boss: boss
          }) +
          itemFx +
          whooshHtml() +
        '</div>' +
        card +
        '<p class="sr-status" id="srStatus">' + (G.phase === 'drive' ? (G.answers[G.answers.length - 1] && G.answers[G.answers.length - 1].correct ? 'Boost!' : 'Slip!') : '') + '</p>' +
      '</div>';
    var speak = $('#srCardSpeak');
    if (speak) speak.onclick = function () { sayQuestion(); };
    A.$$('.sr-choice').forEach(function (el) {
      el.onclick = function () { pickChoice(+el.getAttribute('data-i')); };
    });
    coinsEl();
    fitTrack();
  }

  function fitTrack() {
    var el = document.getElementById('srTrack');
    if (!el) return;
    /* Short landscape keeps its side-panel size. Other viewports scale the 512 canvas to the flex track. */
    if (window.matchMedia('(orientation: landscape) and (max-height: 500px)').matches) {
      el.style.removeProperty('--ts');
      el.style.removeProperty('--crop');
      return;
    }
    var h = el.clientHeight;
    if (h < 8) return;
    el.style.setProperty('--ts', String(h / 280));
    el.style.setProperty('--crop', '232');
  }

  function sayQuestion() {
    var q = G && K.current(G);
    say((q && q.say) || qWho() || "Let's race!", q ? 'prompt' : 'tap');
  }

  function pickChoice(i) {
    if (busy || !G || G.phase !== 'question') return;
    busy = true;
    var ms = Date.now() - (askedAt || Date.now());
    var res = K.applyAnswer(G, i, family, P, { ms: ms, now: Date.now() });
    persist();
    if (!res) { busy = false; return; }
    A.$$('.sr-choice').forEach(function (el, idx) {
      if (idx === i && res.correct) el.classList.add('ok');
      if (idx === i && !res.correct) el.classList.add('no');
    });
    if (res.correct) A.Audio.sfx('pop');
    if (G.obstacle === null) {
      var o = $('#srObstacle'); if (o) o.classList.add('pop');
    }
    say(res.correct ? (G.boss && res.done === false && !G.obstacle ? 'Cleared! Boost!' : 'Boost!') : 'Slip! Keep going.', 'chatter');
    if (res.done) {
      setTimeout(function () { busy = false; renderPodium(); }, 550);
      return;
    }
    renderRace();
    setTimeout(function () {
      K.nextQuestion(G);
      askedAt = Date.now();
      busy = false;
      renderRace();
      sayQuestion();
    }, 700);
  }

  function renderPodium() {
    screen = 'podium';
    if (!G) return;
    var win = !!G.win;
    var me = P.blob;
    var them = G.friend;
    var first = win ? me : them;
    var second = win ? them : me;
    var third = thirdPlace();
    var colors = ['#ff8fa8', '#ffb36b', '#ffe58a', '#8fe3c0', '#9fd2ff', '#c9b2ff'];
    var bits = '', n;
    if (win) {
      for (n = 0; n < 36; n++) {
        bits += '<i style="left:' + (2 + (n * 2.7) % 96) + '%;top:' + ((n % 7) * 10) + '%;background:' + colors[n % colors.length] + ';animation-delay:' + (n * 0.03) + 's"></i>';
      }
    }
    var myCar = K.garageOf(family).car;
    var theirCar = oppCarSpec();
    var extraCar = { body: 'muffin_v2', wheels: 'waffle_v1', spoiler: 'lettuce_v1', paint: 'natural', sticker: 'none', trail: 'none' };
    function onstep(place, car, driver) {
      return '<div class="sr-onstep ' + place + '">' + carHtml(car, (!driver || driver === 'sil') ? null : driver, 'pod') + '</div>';
    }
    var msg = win
      ? (G.newBest ? 'New best time! What a race!' : 'You won! What a race!')
      : 'Nice try. You still earned some coins.';
    $('#srContent').innerHTML =
      '<div class="sr-podium sr-panel' + (win ? ' celebrate' : '') + '" style="position:relative">' +
        (win ? '<div class="sr-confetti" aria-hidden="true">' + bits + '</div>' : '') +
        '<h2>' + (win ? 'First place!' : 'So close!') + '</h2>' +
        '<div class="sr-podium-art' + (third ? '' : ' two') + '">' +
          '<div class="sr-podium-stage">' +
          '<img class="sr-podium-img" src="' + A.ROOT + 'art/racers/env/podium_v1' + (third ? '' : '_two') + '.png" alt="">' +
          (third ? onstep('third', extraCar, third) : '') +
          onstep('second', win ? theirCar : myCar, second) +
          onstep('first', win ? myCar : theirCar, first) +
          '</div>' +
        '</div>' +
        '<div class="sr-coins-won">' + icon('🪙', 110, 'won') + '<b>+' + G.coins + '</b><span>for the family garage</span></div>' +
        '<p>' + A.esc(msg) + '</p>' +
        '<div class="sr-actions" style="width:100%">' +
          '<button class="sr-action" id="srAgain">Try again</button>' +
          '<button class="sr-secondary" id="srToGarage">Garage</button>' +
          '<button class="sr-secondary" id="srToHome">Home</button>' +
        '</div>' +
      '</div>';
    if (win) A.Audio.sfx('win');
    say(msg, 'chatter');
    $('#srAgain').onclick = function () { beginRace(G.mode); };
    $('#srToGarage').onclick = renderGarage;
    $('#srToHome').onclick = home;
    coinsEl();
  }

  function home() {
    A.Voice.stop();
    persist();
    location.href = A.ROOT + 'index.html?from=game#games';
  }

  $('#srHome').onclick = home;
  $('#srSpeak').onclick = function () {
    if (G && G.phase === 'question') sayQuestion();
    else say('Snack Racers. Race your food car.', 'tap');
  };
  headerIcons();

  window.addEventListener('resize', fitTrack);

  window.__racers = {
    family: family, stats: stats,
    get G() { return G; },
    renderMenu: renderMenu, renderGarage: renderGarage, renderRace: renderRace, renderPodium: renderPodium,
    beginRace: beginRace, pickChoice: pickChoice,
    showQuestion: function () { if (G) { G.phase = 'question'; renderRace(); } },
    setObstacle: function (id) { if (G) { G.obstacle = id || 'tomato'; G.boss = true; G.phase = 'question'; renderRace(); } },
    setPlace: function (player, opp) {
      if (!G) return;
      G.playerDist = player;
      if (opp != null) G.oppDist = opp;
      renderRace();
    },
    gotoPodium: function (win) {
      if (!G) G = K.startRace(P, family, { mode: 'friend', now: Date.now() });
      G.phase = 'podium'; G.win = win !== false; G.place = G.win ? 1 : 2; G.coins = G.coins || 8; G.friend = G.friend || 'apple';
      renderPodium();
    },
    buy: function (kind, id) { var r = K.buy(family, kind, id); persist(); coinsEl(); return r; }
  };

  renderMenu();
})(window.Arcade);
