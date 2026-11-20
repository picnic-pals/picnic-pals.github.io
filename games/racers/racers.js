/* Snack Racers v1 — garage, race, questions, podium. Cars drive themselves. */
(function (A) {
  'use strict';
  A.UI.boot();
  if (A.Music) A.Music.play('racers');
  var P = A.Store.active();
  if (!P) { location.replace(A.ROOT + 'index.html#players'); return; }
  var K = A.Racers, $ = A.$, I = A.Icons;
  var family = A.Store.family ? A.Store.family() : ((A.Store.data.family = A.Store.data.family || { coins: 0, racers: {} }));
  K.garageOf(family);
  var stats = P.games.racers = P.games.racers || { races: 0, wins: 0, best: {}, tier: 0 };
  var G = null, screen = 'menu', busy = false, askedAt = 0;
  var P2 = null, twoBusy = [false, false], askedAtTwo = [0, 0];
  var params = new URLSearchParams(location.search || '');

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
          '<button class="sr-btn" id="srTwo">Two players</button>' +
        '</div>' +
        '<div class="sr-panel"><p class="sr-sub">Tracks</p><div class="sr-actions">' + tracks + '</div></div>' +
      '</div>';
    $('#srFriend').onclick = function () { beginRace('friend'); };
    $('#srBoss').onclick = function () { beginRace('boss'); };
    $('#srBest').onclick = function () { beginRace('best'); };
    $('#srGarage').onclick = renderGarage;
    $('#srTwo').onclick = renderTwoPicker;
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


  function makeGuest(kind) {
    var age = kind === 'easy' ? 4 : kind === 'hard' ? 8 : 6;
    var blob = kind === 'easy' ? 'carrot' : kind === 'hard' ? 'corn' : 'apple';
    var g = A.Store.blank('Guest', blob);
    g.id = 'guest-' + kind;
    g.guest = true;
    g.age = age;
    g.color = 'sky';
    return g;
  }
  function resolveP2(id) {
    if (!id) return null;
    var p = /^guest-/.test(id) ? makeGuest(String(id).replace(/^guest-/, '')) : (A.Store.get && A.Store.get(id));
    if (p && P && p.id === P.id) return null;
    return p || null;
  }
  function p2CarSpec() {
    var mine = (K.garageOf(family).car || {}).body;
    var blank = { paint: 'natural', sticker: 'none', trail: 'none' };
    if (mine === 'watermelon_v1') return Object.assign({ body: 'sandwich_v1', wheels: 'cookie_v1', spoiler: 'broccoli_v1' }, blank);
    return Object.assign({ body: 'watermelon_v1', wheels: 'cucumber_v1', spoiler: 'candycane_v1' }, blank);
  }
  function renderTwoPicker() {
    screen = 'picker';
    document.body.className = '';
    P2 = null;
    var others = (A.Store.profiles() || []).filter(function (p) { return P && p.id !== P.id; });
    var tiles = others.map(function (p) {
      return '<button class="sr-btn sr-pick" data-p2="' + A.esc(p.id) + '">' +
        '<img class="sr-pick-face" src="' + friendImg(p.blob, 'front') + '" alt="">' +
        '<span>' + A.esc(p.name) + '</span></button>';
    }).join('');
    var guests = [
      ['easy', 'carrot', 'Guest', 'Counting'],
      ['medium', 'apple', 'Guest', 'Adding'],
      ['hard', 'corn', 'Guest', 'Bigger math']
    ].map(function (g) {
      return '<button class="sr-btn sr-secondary sr-pick" data-p2="guest-' + g[0] + '">' +
        '<img class="sr-pick-face" src="' + friendImg(g[1], 'front') + '" alt="">' +
        '<span>' + g[2] + '<small>' + g[3] + '</small></span></button>';
    }).join('');
    $('#srContent').innerHTML =
      '<div class="sr-picker sr-panel">' +
        '<p class="sr-lead">Who is player two?</p>' +
        '<p class="sr-sub">Each of you gets your own questions and your own buttons.</p>' +
        '<div class="sr-actions sr-pick-list">' + tiles + guests +
          '<button class="sr-secondary" id="srPickBack">Back</button>' +
        '</div>' +
      '</div>';
    A.$$('[data-p2]').forEach(function (el) {
      el.onclick = function () { beginTwoRace(resolveP2(el.getAttribute('data-p2'))); };
    });
    $('#srPickBack').onclick = renderMenu;
    coinsEl();
  }
  function beginTwoRace(p2) {
    if (!p2) { renderTwoPicker(); return; }
    P2 = p2;
    var track = (family.racers && family.racers._track) || 'picnic';
    if (!K.garageOf(family).tracks[track]) track = 'picnic';
    G = K.startRace(P, family, { mode: 'two', track: track, p2: P2, now: Date.now() });
    if (!G || G.mode !== 'two') { renderTwoPicker(); return; }
    screen = 'race';
    twoBusy = [false, false];
    askedAtTwo = [Date.now(), Date.now()];
    renderTwoRace();
  }
  function twoPips(side) {
    var html = '', i, cls;
    for (i = 0; i < side.n; i++) {
      cls = '';
      if (side.answers[i]) cls = side.answers[i].correct ? ' ok' : ' no';
      else if (i === side.i && !side.done && side.phase !== 'done') cls = ' on';
      html += '<i class="' + cls + '"></i>';
    }
    return html;
  }
  function racerFact(q) {
    var S = A.Steps;
    if (!q || !S || !S.F || q.a == null || q.b == null) return null;
    if (q.kind === 'add') return S.F(q.a, '+', q.b);
    if (q.kind === 'sub') return S.F(q.a, '-', q.b);
    if (q.kind === 'missing') return S.F(q.a, '+', Math.max(0, q.b - q.a));
    return null;
  }
  function racerFactHint(q, lvl) {
    var f = racerFact(q);
    if (f && A.Steps.factHint) return A.Steps.factHint(f, lvl, q.kind === 'sub' ? 's_mix' : 'a_mix');
    return '';
  }
  function qBits(q, who) {
    if (!q) return '';
    var pics = '';
    if (q.kind === 'count' && q.count != null && A.CountVisual) {
      var food = q.food && K.BY[q.food], item = food ? food.icon : q.food;
      pics = '<div class="sr-pics">' + A.CountVisual.html(q.count, { item: item, noun: (food && food.plural) || 'foods' }) + '</div>';
    } else if (q.kind === 'count' && q.pic && q.pic.length) {
      pics = '<div class="sr-pics">' + q.pic.map(function (id) {
        var f = K.BY[id]; return icon(f ? f.icon : id, 44, 'pic');
      }).join('') + '</div>';
    } else if ((q.kind === 'add' || q.kind === 'sub' || q.kind === 'missing') && A.CountVisual && q.a != null) {
      var cvOpt = { noun: 'dots' }, factPic;
      if (q.kind === 'sub') factPic = A.CountVisual.html(q.a, cvOpt) + '<i class="pb-op">-</i>' + A.CountVisual.html(q.b, cvOpt);
      else if (q.kind === 'missing') factPic = A.CountVisual.html(q.a, cvOpt) + '<i class="pb-op">+</i><b class="sr-qmark">?</b>';
      else factPic = A.CountVisual.html(q.a, cvOpt) + '<i class="pb-op">+</i>' + A.CountVisual.html(q.b, cvOpt);
      pics = '<div class="sr-pics sr-fact">' + factPic + '</div>';
    }
    var choices = (q.choices || []).map(function (c, idx) {
      return '<button class="sr-choice" type="button" data-who="' + who + '" data-i="' + idx + '">' +
        (c.icon ? icon(c.icon, 48, 'ch') : '') +
        (c.icon ? '<span class="sr-visually-hidden">' + A.esc(c.label) + '</span>' : A.esc(c.label)) +
      '</button>';
    }).join('');
    return '<p class="sr-ask">' + A.esc(q.text) + '</p>' + pics +
      '<div class="sr-choices">' + choices + '</div>';
  }
  function sideCardHtml(who) {
    var side = G.sides[who];
    var face = friendImg(side.blob, side.done ? 'happy' : 'front');
    var body, q;
    if (side.done) {
      body = '<p class="sr-ask sr-wait">You finished! Waiting for the other racer.</p>';
    } else if (side.phase === 'drive') {
      var last = side.answers[side.answers.length - 1];
      body = '<p class="sr-ask sr-fx ' + (last && last.correct ? 'boost' : 'slip') + '">' + (last && last.correct ? 'Boost!' : 'Oops! Keep going.') + '</p>';
    } else {
      q = K.current(G, who);
      body = qBits(q, who);
    }
    return '<div class="sr-side p' + (who + 1) + '" data-who="' + who + '" id="srSide' + who + '">' +
      '<div class="sr-who-bar">' +
        '<img class="sr-who-face" src="' + face + '" alt="">' +
        '<b class="sr-who-name">' + A.esc(side.name) + '</b>' +
        '<button type="button" class="sr-side-hear" data-hear="' + who + '" aria-label="Hear ' + A.esc(side.name) + '\'s question">Hear</button>' +
        '<span class="sr-pips" aria-hidden="true">' + twoPips(side) + '</span>' +
      '</div>' +
      '<div class="sr-qcard" data-who="' + who + '">' + body + '</div>' +
    '</div>';
  }
  function bindTwoSide(who) {
    var root = document.getElementById('srSide' + who);
    if (!root) return;
    A.$$('#srSide' + who + ' .sr-choice').forEach(function (el) {
      var go = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        pickTwoChoice(who, +el.getAttribute('data-i'));
      };
      el.addEventListener('pointerdown', go);
    });
    var hear = root.querySelector('[data-hear]');
    if (hear) hear.onclick = function (e) { if (e) e.stopPropagation(); sayTwoQuestion(who); };
    var ask = root.querySelector('.sr-ask');
    if (ask) ask.onclick = function () { sayTwoQuestion(who); };
  }
  function sayTwoQuestion(who) {
    var q = G && K.current(G, who);
    var side = G && G.sides && G.sides[who];
    if (q) say((q.say || q.text), 'prompt');
    else if (side && side.done) say(side.name + ' is finished.', 'tap');
    else say('Answer the questions on your side.', 'tap');
  }
  function renderTwoRace() {
    if (!G || G.mode !== 'two') return;
    document.body.className = 'sr-two track-' + G.track;
    var trackLen = K.TRACK_LEN || 1000;
    var WORLD_SCREENS = 2.5, START_AT = 3.2, FINISH_AT = 92;
    var view = 100 / WORLD_SCREENS, travel = FINISH_AT - START_AT;
    var meLeft = START_AT + travel * Math.min(1, G.sides[0].dist / trackLen);
    var opLeft = START_AT + travel * Math.min(1, G.sides[1].dist / trackLen);
    var cam = (meLeft + opLeft) / 2 - view * 0.5;
    if (cam < 0) cam = 0;
    if (cam > 100 - view) cam = 100 - view;
    var b0 = G.sides[0].phase === 'drive' && G.sides[0].answers.length && G.sides[0].answers[G.sides[0].answers.length - 1].correct;
    var s0 = G.sides[0].phase === 'drive' && G.sides[0].answers.length && !G.sides[0].answers[G.sides[0].answers.length - 1].correct;
    var b1 = G.sides[1].phase === 'drive' && G.sides[1].answers.length && G.sides[1].answers[G.sides[1].answers.length - 1].correct;
    var s1 = G.sides[1].phase === 'drive' && G.sides[1].answers.length && !G.sides[1].answers[G.sides[1].answers.length - 1].correct;
    var move0 = b0 ? 'boosting' : (s0 ? 'slipping' : 'rolling');
    var move1 = b1 ? 'boosting' : (s1 ? 'slipping' : 'rolling');
    $('#srContent').innerHTML =
      '<div class="sr-two" id="srTwoPlay">' +
        sideCardHtml(0) +
        '<div class="sr-track ' + G.track + ' live' + ((b0 || b1) ? ' boosting' : '') + ((s0 || s1) ? ' slipping' : '') + '" id="srTrack">' +
          trackStageHtml(G.track, cam, {
            meLeft: meLeft, opLeft: opLeft, obsLeft: 0,
            me: carHtml(K.garageOf(family).car, G.sides[0].blob, '', move0),
            opp: carHtml(p2CarSpec(), G.sides[1].blob, '', move1),
            obs: '', boss: ''
          }) +
        '</div>' +
        sideCardHtml(1) +
      '</div>';
    bindTwoSide(0);
    bindTwoSide(1);
    coinsEl();
    fitTrack();
    fitTwoPics();
  }
  function paintTwoSide(who) {
    var el = document.getElementById('srSide' + who);
    if (!el) { renderTwoRace(); return; }
    var fresh = document.createElement('div');
    fresh.innerHTML = sideCardHtml(who);
    el.replaceWith(fresh.firstChild);
    bindTwoSide(who);
    /* Keep the shared track in sync without rebuilding the other player's buttons. */
    var trackHost = document.getElementById('srTrack');
    if (!trackHost || !G || !G.sides) return;
    var trackLen = K.TRACK_LEN || 1000;
    var WORLD_SCREENS = 2.5, START_AT = 3.2, FINISH_AT = 92;
    var view = 100 / WORLD_SCREENS, travel = FINISH_AT - START_AT;
    var meLeft = START_AT + travel * Math.min(1, G.sides[0].dist / trackLen);
    var opLeft = START_AT + travel * Math.min(1, G.sides[1].dist / trackLen);
    var cam = (meLeft + opLeft) / 2 - view * 0.5;
    if (cam < 0) cam = 0;
    if (cam > 100 - view) cam = 100 - view;
    var b0 = G.sides[0].phase === 'drive' && G.sides[0].answers.length && G.sides[0].answers[G.sides[0].answers.length - 1].correct;
    var s0 = G.sides[0].phase === 'drive' && G.sides[0].answers.length && !G.sides[0].answers[G.sides[0].answers.length - 1].correct;
    var b1 = G.sides[1].phase === 'drive' && G.sides[1].answers.length && G.sides[1].answers[G.sides[1].answers.length - 1].correct;
    var s1 = G.sides[1].phase === 'drive' && G.sides[1].answers.length && !G.sides[1].answers[G.sides[1].answers.length - 1].correct;
    var move0 = b0 ? 'boosting' : (s0 ? 'slipping' : (G.sides[0].done ? '' : 'rolling'));
    var move1 = b1 ? 'boosting' : (s1 ? 'slipping' : (G.sides[1].done ? '' : 'rolling'));
    trackHost.className = 'sr-track ' + G.track + ' live' + ((b0 || b1) ? ' boosting' : '') + ((s0 || s1) ? ' slipping' : '');
    trackHost.innerHTML = trackStageHtml(G.track, cam, {
      meLeft: meLeft, opLeft: opLeft, obsLeft: 0,
      me: carHtml(K.garageOf(family).car, G.sides[0].blob, '', move0),
      opp: carHtml(p2CarSpec(), G.sides[1].blob, '', move1),
      obs: '', boss: ''
    });
    fitTrack();
    fitTwoPics();
  }
  function pickTwoChoice(who, i) {
    who = who === 1 || who === '1' ? 1 : 0;
    if (!G || G.mode !== 'two' || twoBusy[who]) return;
    var side = G.sides[who];
    if (!side || side.done || side.phase !== 'question') return;
    twoBusy[who] = true;
    var ms = Date.now() - (askedAtTwo[who] || Date.now());
    var res = K.applyAnswer(G, i, family, P, { ms: ms, now: Date.now(), who: who });
    persist();
    if (!res) { twoBusy[who] = false; return; }
    var root = document.getElementById('srSide' + who);
    if (root) {
      A.$$('#srSide' + who + ' .sr-choice').forEach(function (el) {
        if (+el.getAttribute('data-i') === i) el.classList.add(res.correct ? 'ok' : 'no');
        if (!res.correct && +el.getAttribute('data-i') === i) el.classList.add('shake');
      });
    }
    if (res.correct) A.Audio.sfx('pop');
    paintTwoSide(who);
    if (res.done) {
      setTimeout(function () { twoBusy = [false, false]; renderTwoPodium(); }, 550);
      return;
    }
    setTimeout(function () {
      if (!G || G.mode !== 'two' || G.phase === 'podium') { twoBusy[who] = false; return; }
      K.nextQuestion(G, who);
      askedAtTwo[who] = Date.now();
      twoBusy[who] = false;
      paintTwoSide(who);
    }, res.correct ? 500 : 700);
  }
  function winChrome(on) {
    if (!on) return { top: '', bot: '' };
    return {
      top: '<div class="sr-win-logo" aria-hidden="true"></div>',
      bot: '<div class="sr-win-friends" aria-hidden="true"></div>'
    };
  }
  function renderTwoPodium() {
    screen = 'podium';
    if (!G) return;
    document.body.className = 'sr-two-over';
    var s0 = G.sides[0], s1 = G.sides[1];
    var tie = !!G.tie;
    var winWho = G.winner;
    var first = tie ? s0.blob : (winWho === 0 ? s0.blob : s1.blob);
    var second = tie ? s1.blob : (winWho === 0 ? s1.blob : s0.blob);
    var firstCar = (tie || winWho === 0) ? K.garageOf(family).car : p2CarSpec();
    var secondCar = (tie || winWho === 0) ? p2CarSpec() : K.garageOf(family).car;
    var title = tie ? "It's a tie!" : ((winWho === 0 ? s0.name : s1.name) + ' wins!');
    var msg = tie ? 'What a race! You finished together.' : 'What a race!';
    var colors = ['#ff8fa8', '#ffb36b', '#ffe58a', '#8fe3c0', '#9fd2ff', '#c9b2ff'];
    var bits = '', n;
    for (n = 0; n < 36; n++) {
      bits += '<i style="left:' + (2 + (n * 2.7) % 96) + '%;top:' + ((n % 7) * 10) + '%;background:' + colors[n % colors.length] + ';animation-delay:' + (n * 0.03) + 's"></i>';
    }
    function onstep(place, car, driver) {
      return '<div class="sr-onstep ' + place + '">' + carHtml(car, driver, 'pod') + '</div>';
    }
    var chrome = winChrome(true);
    var art;
    if (tie) {
      art = '<div class="sr-podium-art tie"><div class="sr-podium-stage"><div class="sr-tie-row">' +
        '<div class="sr-tie-col">' + onstep('tie-a', firstCar, first) + '<div class="sr-tie-block">1</div></div>' +
        '<div class="sr-tie-col">' + onstep('tie-b', secondCar, second) + '<div class="sr-tie-block">1</div></div>' +
      '</div></div></div>';
    } else {
      art = '<div class="sr-podium-art two"><div class="sr-podium-stage">' +
        '<img class="sr-podium-img" src="' + A.ROOT + 'art/racers/env/podium_v1_two.png" alt="">' +
        onstep('second', secondCar, second) +
        onstep('first', firstCar, first) +
      '</div></div>';
    }
    $('#srContent').innerHTML =
      '<div class="sr-podium sr-panel celebrate sr-two-podium" style="position:relative">' +
        '<div class="sr-confetti" aria-hidden="true">' + bits + '</div>' +
        chrome.top +
        '<h2 class="sr-title">' + A.esc(title) + '</h2>' +
        art +
        '<div class="sr-coins-won">' + icon('🪙', 110, 'won') + '<b>+' + G.coins + '</b><span>for the family garage</span></div>' +
        '<p>' + A.esc(msg) + '</p>' +
        '<div class="sr-actions" style="width:100%">' +
          '<button class="sr-action" id="srAgain">Try again</button>' +
          '<button class="sr-secondary" id="srToHome">Home</button>' +
        '</div>' +
        chrome.bot +
      '</div>';
    A.Audio.sfx('win');
    say(title + ' ' + msg, 'chatter');
    $('#srAgain').onclick = function () { beginTwoRace(P2); };
    $('#srToHome').onclick = home;
    coinsEl();
  }

  function beginRace(mode) {
    if (mode === 'two') { if (P2) beginTwoRace(P2); else renderTwoPicker(); return; }
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
    if (G.mode === 'two') { renderTwoRace(); return; }
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
    var showQ = (G.phase === 'question' && q) ? q : (G.phase === 'drive' && G.missHint && G.missQ ? G.missQ : null);
    if (showQ) {
      q = showQ;
      var pics = '';
      if (q.kind === 'count' && q.count != null && A.CountVisual) {
        var food = q.food && K.BY[q.food], item = food ? food.icon : q.food;
        pics = '<div class="sr-pics" id="srPics">' + A.CountVisual.html(q.count, { item: item, noun: (food && food.plural) || 'foods' }) + '</div>';
      } else if (q.kind === 'count' && q.pic && q.pic.length) {
        pics = '<div class="sr-pics" id="srPics">' + q.pic.map(function (id) {
          var f = K.BY[id]; return icon(f ? f.icon : id, 56, 'pic');
        }).join('') + '</div>';
      } else if ((q.kind === 'add' || q.kind === 'sub' || q.kind === 'missing') && A.CountVisual && q.a != null) {
        var cvOpt = { noun: 'dots' };
        var factPic;
        if (q.kind === 'sub') factPic = A.CountVisual.html(q.a, cvOpt) + '<i class="pb-op">−</i>' + A.CountVisual.html(q.b, cvOpt);
        else if (q.kind === 'missing') factPic = A.CountVisual.html(q.a, cvOpt) + '<i class="pb-op">+</i><b class="sr-qmark">?</b>';
        else factPic = A.CountVisual.html(q.a, cvOpt) + '<i class="pb-op">+</i>' + A.CountVisual.html(q.b, cvOpt);
        pics = '<div class="sr-pics sr-fact" id="srPics">' + factPic + '</div>';
      }
      if (G.missHintHtml) pics = '<div class="sr-pics sr-hintpic" id="srPics">' + G.missHintHtml + '</div>';
      else if (G.missHint) pics += '<p class="sr-hint">' + A.esc(G.missHint) + '</p>';
      var choices = q.choices.map(function (c, idx) {
        return '<button class="sr-choice" data-i="' + idx + '">' +
          (c.icon ? icon(c.icon, 64, 'ch') : '') +
          (c.icon ? '<span class="sr-visually-hidden">' + A.esc(c.label) + '</span>' : A.esc(c.label)) +
        '</button>';
      }).join('');
      card = '<div class="sr-qcard' + (G.boss && G.obstacle ? ' boss' : '') + (G.phase === 'drive' && G.missHint ? ' hinting' : '') + '" id="srCard">' +
        '<div class="sr-qwho">' + A.esc(qWho()) + '</div>' +
        '<button id="srCardSpeak" aria-label="Read the question aloud">' + icon('🔊', 32, 'cardspeak') + '</button>' +
        '<p class="sr-ask" id="srAsk">' + A.esc(q.text) + '</p>' +
        pics +
        (G.phase === 'drive' && G.missHint ? '' : '<div class="sr-choices" id="srChoices">' + choices + '</div>') +
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
    var two = (el.closest && el.closest('.sr-two')) || document.body.classList.contains('sr-two');
    /* Short landscape 1P keeps its CSS --box size. 2P has no fixed --box, so always scale. */
    if (!two && window.matchMedia('(orientation: landscape) and (max-height: 500px)').matches) {
      el.style.removeProperty('--ts');
      el.style.removeProperty('--crop');
      return;
    }
    var h = el.clientHeight;
    if (h < 8) return;
    el.style.setProperty('--ts', String(h / 280));
    el.style.setProperty('--crop', '232');
  }

  function fitTwoPics() {
    A.$$('.sr-two .sr-pics').forEach(function (el) {
      el.style.transform = '';
      el.style.height = '';
      var cap = el.clientWidth;
      if (cap < 8) return;
      var sw = el.scrollWidth;
      if (sw > cap + 1) {
        var s = Math.max(0.55, cap / sw);
        el.style.transformOrigin = 'top center';
        el.style.transform = 'scale(' + s + ')';
        el.style.height = (el.scrollHeight * s) + 'px';
      }
    });
  }

  function sayQuestion() {
    var q = G && K.current(G);
    say((q && q.say) || qWho() || "Let's race!", q ? 'prompt' : 'tap');
  }

  function pickChoice(i) {
    if (busy || !G || G.phase !== 'question') return;
    busy = true;
    var ms = Date.now() - (askedAt || Date.now());
    var missed = K.current(G);
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
    var wait = 700;
    if (!res.correct) {
      var food = missed && missed.food && K.BY[missed.food];
      G.missQ = missed;
      G.missHintHtml = '';
      if (missed && missed.kind === 'count') { G.missHint = 'Count the ' + ((food && food.plural) || 'foods') + '.'; wait = 1400; }
      else if (missed && (missed.kind === 'add' || missed.kind === 'sub' || missed.kind === 'missing')) {
        var html = racerFactHint(missed, 2);
        if (html) {
          G.missHintHtml = html;
          G.missHint = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        } else if (missed.kind === 'add') G.missHint = (missed.a + missed.b > 10) ? ('Make 10, then add the rest. ' + missed.a + ' + ' + missed.b + '.') : ('Count the dots: ' + missed.a + ' + ' + missed.b + '.');
        else if (missed.kind === 'sub') G.missHint = 'Start at ' + missed.a + ' and take away ' + missed.b + '.';
        else G.missHint = 'How many more to get from ' + missed.a + ' to ' + missed.b + '?';
        wait = 3000;
      } else { G.missHint = 'Look again, then try the next one.'; wait = 1400; }
    } else {
      G.missHint = '';
      G.missHintHtml = '';
      G.missQ = null;
    }
    renderRace();
    setTimeout(function () {
      G.missHint = ''; G.missHintHtml = ''; G.missQ = null;
      K.nextQuestion(G);
      askedAt = Date.now();
      busy = false;
      renderRace();
      sayQuestion();
    }, wait);
  }

  function renderPodium() {
    screen = 'podium';
    if (!G) return;
    if (G.mode === 'two') { renderTwoPodium(); return; }
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
    var chrome = winChrome(win);
    $('#srContent').innerHTML =
      '<div class="sr-podium sr-panel' + (win ? ' celebrate' : '') + '" style="position:relative">' +
        (win ? '<div class="sr-confetti" aria-hidden="true">' + bits + '</div>' : '') +
        chrome.top +
        '<h2 class="sr-title">' + (win ? 'First place!' : 'So close!') + '</h2>' +
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
        chrome.bot +
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
    if (G && G.mode === 'two') say('Two players. Each of you answers the questions on your side.', 'tap');
    else if (G && G.phase === 'question') sayQuestion();
    else say('Snack Racers. Race your food car.', 'tap');
  };
  headerIcons();
  if (A.HowTo) A.HowTo.button('racers', '#srHome');

  window.addEventListener('resize', fitTrack);

  window.__racers = {
    family: family, stats: stats,
    get G() { return G; },
    renderMenu: renderMenu, renderGarage: renderGarage, renderRace: renderRace, renderPodium: renderPodium,
    beginRace: beginRace, beginTwoRace: beginTwoRace, pickChoice: pickChoice, pickTwoChoice: pickTwoChoice,
    renderTwoPicker: renderTwoPicker,
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

  (A.HowTo && A.HowTo.first ? A.HowTo.first('racers') : Promise.resolve()).then(function () {
    if (params.get('mode') === 'two') {
      P2 = resolveP2(params.get('p2'));
      if (P2) beginTwoRace(P2);
      else renderTwoPicker();
      return;
    }
    renderMenu();
  });
})(window.Arcade);
