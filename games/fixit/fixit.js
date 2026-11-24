/* Fix-It Shop v1 (1123; locked painted art 1124): a friend brings a broken thing. 6+ taps the broken part first; younger kids see it pointed out and
   sparkling. Then pick the right tool from the toolbox: every tool shows its picture and its word, and a tap reads the name.
   Right tool: a short fix animation and a cheer. Wrong tool: a short silly fail, then a hint (no lives, no timer).
   Every 3 finished jobs builds the next part of the birdhouse (5 parts) and opens a new tool with a "New tool!" teach job. */
(function (A) {
  'use strict';
  var K = A.FixIt, Art = A.FixItArt, $ = A.$, P = A.Store && A.Store.active();
  if (!P) { location.replace(A.ROOT + 'index.html#players'); return; }

  var G = K.newSession(P);
  var st = G.st;
  var busy = false, overlay = null, lastSay = '', friend = 'strawberry', pose = 'front', timers = [];
  var T = { fix: 1500, fail: 1300, found: 300 };

  function esc(s) { return A.esc ? A.esc(String(s)) : String(s); }
  function sfx(n) { try { A.Audio.sfx(n); } catch (e) {} }
  function persist() { try { A.Store.save(); } catch (e) {} }
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function say(parts, kind) {
    if (!parts) return;
    if (!Array.isArray(parts)) parts = [{ text: String(parts) }];
    try { lastSay = A.Voice.text(parts); } catch (e) { lastSay = parts.map(function (x) { return x.text || x; }).join(' '); }
    try { A.Voice.say(parts, { kind: kind || 'tap', bubble: false }); } catch (e) {}
  }
  function friendImg(id, ex) { return A.ROOT + 'assets/picnic/friends/' + id + '/' + (ex || 'front') + '_256.webp'; }
  /* customers are friends she has met (locked friends never show), not her own friend */
  function metFriends() {
    var list = (A.Story2 && A.Story2.met) ? A.Story2.met(P) : null;
    if (!list || !list.length) list = Object.keys((P.unlocks && P.unlocks.blobs) || {});
    var others = list.filter(function (f) { return f !== P.blob; });
    return others.length ? others : (list.length ? list : ['strawberry']);
  }
  function pickFriend() {
    var l = metFriends().filter(function (f) { return f !== friend; });
    if (!l.length) l = metFriends();
    friend = l[Math.floor(Math.random() * l.length)];
  }
  function tool(id) { return K.TOOL_BY[id]; }
  function points() { return G.phase === 'pick' && (!K.finds(G.tier) || G.teach || G.findMiss >= 2); }
  var SPEAKER = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 15 H13 L22 7 V33 L13 25 H6 Z" fill="#4a3424"/><path d="M27 13 Q32 20 27 27 M31 9 Q39 20 31 31" fill="none" stroke="#4a3424" stroke-width="3.5" stroke-linecap="round"/></svg>';

  /* ---------- order card ---------- */
  function renderOrder() {
    var j = G.job; if (!j) return;
    $('#fxOrder').innerHTML = '<img class="fx-friend" src="' + friendImg(friend, pose) + '" alt="A friend">' +
      '<div class="fx-otext" id="fxText">' + esc(j.text) + '</div>' +
      '<button type="button" class="fx-speak" id="fxSpeak" aria-label="Hear it">' + SPEAKER + '</button>';
    fitText($('#fxText'), 21, 15);
    $('#fxSpeak').onclick = function (e) { e.stopPropagation(); say(overlay && overlay.speak ? overlay.speak : [{ text: G.job.text }], 'tap'); };
  }
  function setPose(p) { pose = p; var im = document.querySelector('.fx-friend'); if (im) im.src = friendImg(friend, p); }
  function fitText(el, max, min) {
    if (!el) return;
    var land = document.documentElement.getAttribute('data-stage') === 'landscape', size = land ? max + 2 : max;
    el.style.fontSize = size + 'px';
    while (size > min && (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1 || el.getBoundingClientRect().height > el.parentNode.clientHeight - 6)) { size -= 1; el.style.fontSize = size + 'px'; }
  }

  /* ---------- scene ---------- */
  function svg() { return $('#fxSvg'); }
  function fxLayer() { var s = svg(); return s && s.querySelector('.fx-fx'); }
  function renderScene() {
    var j = G.job;
    $('#fxScene').innerHTML = Art.scene(j.id, { id: 'fxSvg', label: j.text }) + '<p class="fx-tip" id="fxTip"></p>';
    $('#fxScene').classList.toggle('finding', G.phase === 'find');
    showMarks();
    tip(G.phase === 'find' ? 'Tap the part that is broken.' : (G.teach ? 'Try the new ' + tool(j.tool).word + '!' : 'Pick a tool to fix it.'));
  }
  function showMarks() {
    var L = fxLayer(); if (!L) return;
    var old = L.querySelectorAll('.fx-spark, .fx-point'); old.forEach(function (n) { n.remove(); });
    if (G.phase !== 'pick') return;
    var p = G.job.part, html = Art.sparkle(p.x, p.y, G.job.r);
    /* the hand comes from the outside edge; near the top of the scene it points up from below so it stays in view */
    if (points()) { var right = p.x >= 200, up = p.y < 125; if (right && p.x + 84 > 396) right = false; else if (!right && p.x - 84 < 4) right = true; html += Art.pointer(p.x + (right ? 12 : -12), p.y + (up ? 16 : -16), up ? !right : right, up); }
    L.insertAdjacentHTML('afterbegin', html);
  }
  function tip(text, cls) {
    var t = $('#fxTip'); if (!t) return;
    t.textContent = text || '';
    t.className = 'fx-tip' + (cls ? ' ' + cls : '');
    var land = document.documentElement.getAttribute('data-stage') === 'landscape', size = land ? 21 : 18;
    t.style.fontSize = size + 'px';
    while (size > 14 && t.scrollHeight > t.clientHeight + 1) { size -= 1; t.style.fontSize = size + 'px'; }
  }

  /* ---------- tray ---------- */
  function renderTray() {
    var tray = $('#fxTray'), n = G.tray.length;
    tray.className = 'fx-tray n' + n + (G.phase === 'find' ? ' dim' : '');
    tray.innerHTML = G.tray.map(function (id) {
      var t = tool(id), out = G.wrong.indexOf(id) >= 0, glow = G.glow === id && !out;
      return '<button type="button" class="fx-tool' + (out ? ' out' : '') + (glow ? ' glow' : '') + '" data-tool="' + id + '" aria-label="' + esc(t.word) + '">' +
        Art.tool(id) + '<span class="fx-tword">' + esc(t.word) + '</span></button>';
    }).join('');
    tray.querySelectorAll('.fx-tword').forEach(function (w) { var max = parseFloat(getComputedStyle(w).fontSize); while (max > 13 && w.scrollWidth > w.clientWidth + 0.5) { max -= 1; w.style.fontSize = max + 'px'; } });
  }

  /* ---------- project meter ---------- */
  function renderMeter(pop) {
    var m = $('#fxMeter'), dots = '';
    for (var i = 0; i < K.JOBS_PER_STAGE; i++) dots += '<i class="' + (i < st.inStage ? 'on' : '') + '"></i>';
    m.innerHTML = Art.birdhouse(st.stage, { small: true }) + '<span class="fx-mt"><span>' + st.stage + ' of 5</span><span class="fx-dots">' + dots + '</span></span>';
    m.setAttribute('aria-label', 'Birdhouse: ' + st.stage + ' of 5 parts built. Tap to see it.');
    if (pop) { m.classList.remove('pop'); void m.offsetWidth; m.classList.add('pop'); }
  }

  function render() { renderOrder(); renderScene(); renderTray(); renderMeter(false); }

  /* ---------- finding the problem (6+) ---------- */
  function scenePoint(e) {
    var s = svg(); if (!s || !s.getScreenCTM) return null;
    var pt = s.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    var m = s.getScreenCTM(); if (!m) return null;
    var q = pt.matrixTransform(m.inverse());
    return { x: q.x, y: q.y };
  }
  function onSceneTap(e) {
    if (busy || overlay || G.phase !== 'find') return;
    var u = scenePoint(e); if (!u) return;
    tapAt(u.x, u.y);
  }
  function tapAt(x, y) {
    var r = K.find(G, x, y);
    if (r.ignored) return r;
    if (r.ok) {
      sfx('sparkle');
      $('#fxScene').classList.remove('finding');
      showMarks();
      $('#fxTray').classList.remove('dim');
      tip('You found it! Now pick a tool.', 'yay');
      say([{ text: 'You found it! Now pick a tool.' }], 'prompt');
      persist();
      return r;
    }
    sfx('soft');
    if (r.show) { G.phase = 'pick'; G.found = true; $('#fxScene').classList.remove('finding'); $('#fxTray').classList.remove('dim'); showMarks(); tip('Here it is! Now pick a tool.', 'hint'); say([{ text: 'Here it is! Now pick a tool.' }], 'prompt'); }
    else { tip('Look closely. What looks broken?', 'hint'); say([{ text: 'Look closely. What looks broken?' }], 'prompt'); }
    return r;
  }

  /* ---------- picking a tool ---------- */
  function sprite(id, cls) {
    var p = G.job.part, x = Math.max(56, Math.min(344, p.x + 34)), y = Math.max(52, Math.min(250, p.y - 40));
    return '<g class="fx-tool-at" transform="translate(' + x + ' ' + y + ')"><g class="fx-sprite ' + cls + '">' + Art.toolImage(id, 84) + '</g></g>';
  }
  function onTool(id, btn) {
    if (busy || overlay) return;
    var t = tool(id); if (!t) return;
    if (G.phase === 'find') {
      say([t.say], 'tap');
      tip('First, tap the part that is broken.', 'hint');
      var tr = $('#fxTray'); tr.classList.remove('nudge'); void tr.offsetWidth; tr.classList.add('nudge');
      return;
    }
    if (G.phase !== 'pick' || G.wrong.indexOf(id) >= 0) { say([t.say], 'tap'); return; }
    var res = K.choose(G, id);
    if (res.ignored) return;
    busy = true;
    say([t.say], 'tap');
    var L = fxLayer();
    L.querySelectorAll('.fx-spark, .fx-point, .fx-smear, .fx-tool-at').forEach(function (n) { n.remove(); });
    L.insertAdjacentHTML('beforeend', sprite(id, 'go-' + id));
    if (btn) btn.classList.add('picked');
    if (res.ok) return onRight(id);
    return onWrong(id, res, btn);
  }
  function onRight(id) {
    var j = G.job, ms = T.fix;
    later(function () {
      var s = svg(); if (s) s.classList.add('fixed');
      fxLayer().insertAdjacentHTML('beforeend', Art.burst(j.part.x, j.part.y));
      sfx('yay');
      setPose('cheering'); document.body.classList.add('fx-cheer');
      tip(j.done, 'yay');
      say([{ text: j.done }], 'chatter');
    }, Math.round(ms * 0.55));
    later(function () {
      var sp = fxLayer() && fxLayer().querySelector('.fx-sprite'); if (sp) sp.classList.add('fx-flop');
    }, Math.round(ms * 0.75));
    later(function () {
      document.body.classList.remove('fx-cheer');
      var res = K.complete(G);
      persist();
      renderMeter(true);
      var steps = [];
      if (res.stageUp) steps.push(function (next) { stageCard(res, next); });
      if (res.projectDone) steps.push(function (next) { doneCard(next); });
      if (res.newTool) steps.push(function (next) { newToolCard(res.newTool, next); });
      steps.push(function () { busy = false; startJob(); });
      runSteps(steps);
    }, ms + 900);
  }
  function onWrong(id, res, btn) {
    var j = G.job, ms = T.fail;
    later(function () {
      sfx('boing');
      fxLayer().insertAdjacentHTML('beforeend', Art.smear(id, j.part.x, j.part.y));
      var ob = svg() && svg().querySelector('.fx-obj'); if (ob) { ob.classList.remove('wiggle'); void ob.getBoundingClientRect(); ob.classList.add('wiggle'); }
      setPose('oops'); document.body.classList.add('fx-oops');
      tip(res.fail, 'hint');
    }, Math.round(ms * 0.5));
    later(function () {
      var sp = fxLayer() && fxLayer().querySelector('.fx-sprite'); if (sp) sp.classList.add('fx-flop');
    }, Math.round(ms * 0.7));
    later(function () {
      document.body.classList.remove('fx-oops');
      var at = fxLayer() && fxLayer().querySelector('.fx-tool-at'); if (at) at.remove();
      var sm = fxLayer() && fxLayer().querySelector('.fx-smear'); if (sm) { sm.style.transition = 'opacity .5s'; sm.style.opacity = '0'; later(function () { if (sm.parentNode) sm.remove(); }, 550); }
      setPose('thinking');
      renderTray();
      var b = document.querySelector('.fx-tool[data-tool="' + id + '"]'); if (b) { b.classList.add('wrong'); later(function () { b.classList.remove('wrong'); }, 450); }
      showMarks();
      tip(res.hint, 'hint');
      say([{ text: res.fail + ' ' + res.hint }], 'prompt');
      busy = false;
      persist();
    }, ms);
  }
  function runSteps(list) { var i = 0; (function go() { var f = list[i++]; if (f) f(go); })(); }

  /* ---------- cards (tap outside does the same as the main button) ---------- */
  function openCard(html, speak, cls, onBack) {
    var host = $('#fxOverlay');
    host.innerHTML = '<div class="fx-ov-back" id="fxBack"></div><div class="fx-card ' + (cls || '') + '" role="dialog" aria-modal="true">' + html + '</div>';
    host.hidden = false;
    overlay = { speak: speak, back: onBack };
    $('#fxBack').onclick = function () { if (overlay && overlay.back) overlay.back(); };
    if (speak) say(speak, 'prompt');
    return host;
  }
  function closeCard() { var host = $('#fxOverlay'); host.hidden = true; host.innerHTML = ''; overlay = null; }
  function starSvg() { return '<svg viewBox="-20 -20 40 40" aria-hidden="true"><path d="M0 -17 L5 -5 L17 -5 L7 3 L11 16 L0 8 L-11 16 L-7 3 L-17 -5 L-5 -5 Z" fill="#ffd23c" stroke="#4a3424" stroke-width="3" stroke-linejoin="round"/></svg>'; }

  function stageCard(res, next) {
    var proj = K.PROJECTS[st.project % K.PROJECTS.length], line = proj.stageText[res.stage - 1] || 'Nice building!';
    try { A.Store.earnStars(P, 1, 'fixit'); } catch (e) {}
    persist();
    sfx('unlock');
    var go = function () { sfx('tap'); closeCard(); next(); };
    openCard('<h2>Birdhouse: ' + res.stage + ' of 5</h2><div class="fx-card-pic">' + Art.birdhouse(res.stage) + '</div>' +
      '<p class="fx-card-text">' + esc(line) + '</p><p class="fx-star">' + starSvg() + '+1 star</p>' +
      '<div class="fx-cardbtns"><button type="button" class="fx-btn1" id="fxStageGo">Yay!</button></div>', [{ text: line }], 'fx-stage', go);
    $('#fxStageGo').onclick = go;
  }
  function doneCard(next) {
    sfx('win');
    st.sessionsDone = (st.sessionsDone || 0) + 1;
    persist();
    var again = function () { sfx('tap'); K.newProject(st); persist(); renderMeter(true); closeCard(); next(); };
    openCard('<img class="fx-win-friend" src="' + friendImg(friend, 'cheering') + '" alt=""><h2>You built a birdhouse!</h2><div class="fx-card-pic">' + Art.birdhouse(5, { hero: true }) + '</div>' +
      '<p class="fx-card-text">A little bird moved in. Great fixing!</p>' +
      '<div class="fx-cardbtns"><button type="button" class="fx-btn2" id="fxDoneHome">Home</button><button type="button" class="fx-btn1" id="fxDoneAgain">Build another</button></div>',
      [{ text: 'You built a birdhouse! A little bird moved in. Great fixing!' }], 'fx-done', again);
    $('#fxDoneAgain').onclick = again;
    $('#fxDoneHome').onclick = function () { K.newProject(st); persist(); home(); };
  }
  function newToolCard(id, next) {
    var t = tool(id), go = function () { sfx('tap'); closeCard(); next(); };
    sfx('unlock');
    openCard('<h2>New tool!</h2><div class="fx-card-pic">' + Art.tool(id) + '</div><p class="fx-bigword">' + esc(t.word) + '</p>' +
      '<p class="fx-card-text">' + esc(t.what) + '</p>' +
      '<div class="fx-cardbtns"><button type="button" class="fx-btn2" id="fxNewHear" aria-label="Hear it again">Hear</button><button type="button" class="fx-btn1" id="fxNewGo">Try it!</button></div>',
      [{ text: 'New tool! ' + t.word.charAt(0).toUpperCase() + t.word.slice(1) + '. ' + t.what }], 'fx-new', go);
    $('#fxNewGo').onclick = go;
    $('#fxNewHear').onclick = function () { say([{ text: t.word + '. ' + t.what }], 'tap'); };
  }
  function projectCard() {
    if (busy || overlay) return;
    sfx('tap');
    var left = K.JOBS_PER_STAGE - st.inStage, line = st.stage >= 5 ? 'Your birdhouse is done!' :
      'Fix ' + left + ' more ' + (left === 1 ? 'thing' : 'things') + ' to build the next part.';
    openCard('<h2>Birdhouse: ' + st.stage + ' of 5</h2><div class="fx-card-pic">' + Art.birdhouse(st.stage) + '</div>' +
      '<p class="fx-card-text">' + esc(line) + (st.built ? ' Birdhouses built: ' + st.built + '.' : '') + '</p>' +
      '<div class="fx-cardbtns"><button type="button" class="fx-btn2" id="fxProjClose">Close</button></div>', [{ text: line }], 'fx-proj', closeCard);
    $('#fxProjClose').onclick = function () { sfx('tap'); closeCard(); };
  }

  /* ---------- flow ---------- */
  function startJob(opt) {
    timers.forEach(clearTimeout); timers = [];
    pickFriend(); pose = 'front';
    K.nextJob(G, opt);
    persist();
    render();
    say([{ text: G.job.text + (G.phase === 'find' ? ' Tap the part that is broken.' : '') }], 'prompt');
  }
  function home() {
    try { A.Voice.stop(); } catch (e) {}
    persist();
    if (!window.__noNav) location.href = A.ROOT + 'index.html?from=game#games';
  }

  $('#fxHome').onclick = home;
  $('#fxMeter').onclick = projectCard;
  $('#fxScene').addEventListener('click', onSceneTap);
  $('#fxTray').addEventListener('click', function (e) { var b = e.target.closest('.fx-tool'); if (b) onTool(b.getAttribute('data-tool'), b); });

  function syncTapClass() {
    var tap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tap')) || 60;
    document.documentElement.classList.toggle('fx-tap-lg', tap > 72);
  }
  syncTapClass();
  window.addEventListener('resize', function () { syncTapClass(); fitText($('#fxText'), 21, 15); });

  window.__fixit = {
    G: G, K: K, T: T, startJob: startJob, render: render, tapAt: tapAt, pick: function (id) { onTool(id, document.querySelector('.fx-tool[data-tool="' + id + '"]')); },
    lastSay: function () { return lastSay; }, overlayOpen: function () { return !$('#fxOverlay').hidden; }, busy: function () { return busy; },
    friend: function () { return friend; }, projectCard: projectCard
  };

  if (A.HowTo) A.HowTo.button('fixit', '#fxTitle');
  st.sessions = (st.sessions || 0) + 1;
  startJob();
  if (A.HowTo && A.HowTo.first) A.HowTo.first('fixit').then(function (shown) { if (shown && G.job) say([{ text: G.job.text }], 'prompt'); });
})(window.Arcade);
