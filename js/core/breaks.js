/* p4 (2026-10-29): fun breaks between levels (Story and Free Play). Rare (about 1 level in 5-6), always skippable, never
   block progress, never the same type twice in a row (least-recently-seen first, so a repeat inside a week is rare), no
   scores and no right or wrong, and they star ONLY friends the kid has met. 15-30 s each. Everything is read aloud (device
   voice lines in voice-lines.js 'breaks').
   Hooks (no game file changes): Store.earnStars counts a finished level; PlayTime.checkpoint (every game's "between rounds"
   point) shows a break when one is due. Off in automated browsers unless localStorage 'blobArcade.breaks' = '1' (keeps the
   older suites deterministic); a grown-up can turn breaks off with settings.breaks = false.
   Save: p.breaks = { n, next, last, hist: [[type, time]], jokes: [heard ids], skits: [seen ids] }. */
(function (A) {
  var D = A.BreaksData, TYPES = ['dance', 'joke', 'skit', 'peek', 'sounds', 'dress', 'concert', 'pop', 'weather', 'color'];
  var TODDLER_OK = { dance: 1, peek: 1, sounds: 1, dress: 1, concert: 1, pop: 1, weather: 1, color: 1, skit: 1, joke: 1 };
  var WEEK = 7 * 864e5, pending = false, open = null, NOW = function () { return Date.now(); };
  function on() { try { if (A.Store && A.Store.settings && A.Store.settings.breaks === false) return false; if (localStorage.getItem('blobArcade.breaks') === '1') return true; if (localStorage.getItem('blobArcade.breaks') === '0') return false; } catch (e) {} return !(typeof navigator !== 'undefined' && navigator.webdriver); }
  function data(p) { var b = p.breaks || (p.breaks = {}); if (b.n == null) b.n = 0; if (!b.next) b.next = 5 + (Math.random() < .5 ? 0 : 1); b.hist = b.hist || []; b.jokes = b.jokes || []; b.skits = b.skits || []; return b; }
  function toddler(p) { return !!(A.toddler && A.toddler(p)); }
  function reader(p) { var a = A.Age ? A.Age.of(p) : p.age; return !toddler(p) && ((a != null && a >= 6) || (A.StoryBook && A.StoryBook.isReader && A.StoryBook.isReader(p))); }
  function met(p) { var m = A.Story2 && A.Story2.met ? A.Story2.met(p) : (A.Blobs.STARTERS || []).slice(); var h = A.Story2 && A.Story2.hero ? A.Story2.hero(p) : p.blob; if (h && m.indexOf(h) > 0) { m.splice(m.indexOf(h), 1); m.unshift(h); } return m; }
  function shuffle(a, r) { a = a.slice(); r = r || Math.random; for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var lastCount = -1e15;   // a finished level calls markPlayed and earnStars together: count it once
  function count(p) { if (!p || p.guest || A.Breaks && A.Breaks.noCount) return; var t = Date.now(); if (t - lastCount < 4000) { pending = true; return; } lastCount = t; var b = data(p); b.n++; pending = true; }
  function due(p) { if (!p || p.guest || !on()) return false; var b = data(p); return b.n >= b.next; }
  function pick(p, r) {   // never the last type; prefer types not seen in the past week, then the longest ago
    var b = data(p), now = NOW(), seen = {}, list = TYPES.filter(function (t) { return t !== b.last && (!toddler(p) || TODDLER_OK[t]); });
    b.hist.forEach(function (h) { seen[h[0]] = Math.max(seen[h[0]] || 0, h[1]); });
    var fresh = list.filter(function (t) { return !seen[t] || now - seen[t] > WEEK; });
    if (fresh.length) return shuffle(fresh, r)[0];
    return list.slice().sort(function (x, y) { return seen[x] - seen[y]; })[0];
  }
  function mark(p, type) { var b = data(p); b.n = 0; b.next = 5 + (Math.random() < .5 ? 0 : 1); b.last = type; b.hist.push([type, NOW()]); if (b.hist.length > 40) b.hist.splice(0, b.hist.length - 40); if (A.Store) A.Store.save(); }
  // ---------- little helpers ----------
  function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function art(id, pose) { return A.Blobs.art(id, pose || 'happy', 256); }
  function name(id) { var c = A.Blobs.byId[id]; return c ? c.name : ''; }
  function tone(f, d, o) { if (A.Audio) A.Audio.tone(f, d, o); }
  var SND = {
    boing: function () { tone(200, .35, { to: 600, vol: .14 }); }, boing2: function () { tone(320, .3, { to: 900, vol: .12 }); tone(900, .2, { to: 400, vol: .08, when: .25 }); },
    sing: function (f) { tone(f || 523, .45, { type: 'triangle', vol: .14 }); tone((f || 523) * 1.005, .45, { type: 'sine', vol: .06 }); }, sing2: function () { SND.sing(659); },
    laugh: function () { [620, 560, 640, 540].forEach(function (f, i) { tone(f, .09, { type: 'square', vol: .05, to: f * .8, when: i * .13 }); }); },
    burp: function () { tone(120, .38, { type: 'sawtooth', to: 70, vol: .1 }); tone(95, .2, { type: 'triangle', to: 60, vol: .08, when: .12 }); },
    slide: function () { tone(300, .45, { to: 1000, vol: .1 }); }, pop: function () { tone(600, .08, { to: 1300, vol: .14 }); }, drum: function () { tone(140, .16, { type: 'triangle', to: 50, vol: .22 }); },
    giggle: function () { [880, 990, 880, 1046].forEach(function (f, i) { tone(f, .07, { type: 'triangle', vol: .07, when: i * .09 }); }); },
    chime: function () { [1046, 1318, 1568].forEach(function (f, i) { tone(f, .2, { type: 'triangle', vol: .06, when: i * .07 }); }); },
    splash: function () { for (var i = 0; i < 6; i++) tone(1500 + Math.random() * 1500, .05, { type: 'square', vol: .02, when: i * .02, to: 400 }); }
  };
  // a tiny step sequencer (8th notes) for the dance / concert music
  function Seq(bpm, step) { var t = null, i = 0; return { start: function () { if (t) return; t = setInterval(function () { step(i++); }, 60000 / bpm / 2); }, stop: function () { clearInterval(t); t = null; }, on: function () { return !!t; } }; }
  var SCALE = [262, 294, 330, 392, 440, 523, 587, 659, 784];
  // ---------- the player ----------
  function show(p, type, o) {
    o = o || {}; if (open) return Promise.resolve(false); type = type || pick(p); var fr = met(p);
    if (A.Coloring) A.Coloring.css(); else css();
    return new Promise(function (resolve) {
      var root = el('<div class="brk brk-' + type + '" role="dialog" aria-label="Fun break"><div class="brk-bg"></div><div class="brk-stage"></div>' +
        '<div class="brk-cap" aria-live="polite"></div><button class="brk-skip" aria-label="Skip">Skip ⏭</button><button class="brk-done">Back to play ▶</button></div>');
      document.body.appendChild(root); requestAnimationFrame(function () { root.classList.add('on'); });
      var stage = root.querySelector('.brk-stage'), cap = root.querySelector('.brk-cap'), timers = [], seqs = [], ended = false, taps = [];
      var musicWas = A.Music && A.Music.state ? A.Music.state().want : null; if (A.Music && musicWas) A.Music.stop();
      var ctx = {
        p: p, type: type, root: root, stage: stage, friends: fr, simple: toddler(p), reader: reader(p), sound: SND, art: art, name: name,
        later: function (fn, ms) { var t = setTimeout(function () { if (!ended) fn(); }, ms); timers.push(t); return t; },
        say: function (parts, text) { parts = typeof parts === 'string' ? [parts] : parts; var line = A.VoiceLines && A.VoiceLines.byId[parts[0]]; cap.textContent = text || (A.Voice ? A.Voice.text(parts) : (line ? line.text : '')); cap.classList.add('on');
          return A.Voice ? A.Voice.say(parts, { kind: 'prompt', bubble: false }) : Promise.resolve(); },
        seq: function (bpm, fn) { var s = Seq(bpm, fn); seqs.push(s); return s; },
        onTap: function (fn) { taps.push(fn); },
        ready: function () { root.classList.add('can-done'); },
        end: function () { finish('done'); }
      };
      ctx.friend = function (id, cls, pose) { var f = el('<div class="bf ' + (cls || '') + '" data-f="' + id + '"><img src="' + art(id, pose) + '" alt="' + name(id) + '" draggable="false"></div>'); stage.appendChild(f); return f; };
      ctx.pose = function (f, pose) { var i = f.querySelector('img'); if (i) i.src = art(f.dataset.f, pose); };
      ctx.anim = function (f, cls, ms) { if (A.Blobs.anim) A.Blobs.anim(f, cls, ms || 700); };
      function finish(how) {
        if (ended) return; ended = true; timers.forEach(clearTimeout); seqs.forEach(function (s) { s.stop(); }); if (A.Voice) A.Voice.stop();
        if (ctx.onEnd) try { ctx.onEnd(how); } catch (e) {}
        document.removeEventListener('keydown', key, true); root.classList.remove('on'); setTimeout(function () { if (root.parentNode) root.parentNode.removeChild(root); }, 300);
        open = null; mark(p, type); if (A.Music && musicWas) A.Music.play(musicWas);
        A.Breaks.lastResult = { type: type, how: how }; resolve(how);
      }
      function key(e) { e.stopPropagation(); if (e.key === 'Escape') { e.preventDefault(); finish('skip'); } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (root.classList.contains('can-done') && document.activeElement === root.querySelector('.brk-done')) finish('done'); else taps.forEach(function (fn) { fn(null); }); } }
      document.addEventListener('keydown', key, true);
      root.querySelector('.brk-skip').addEventListener('click', function (e) { e.stopPropagation(); if (A.Audio) A.Audio.sfx('tap'); finish('skip'); });
      root.querySelector('.brk-done').addEventListener('click', function (e) { e.stopPropagation(); if (A.Audio) A.Audio.sfx('pop'); finish('done'); });
      stage.addEventListener('pointerdown', function (e) { taps.forEach(function (fn) { fn(e); }); });
      open = { type: type, ctx: ctx, finish: finish };
      ctx.later(function () { ctx.ready(); }, o.readyMs || 15000);   // a big "Back to play" after ~15 s
      ctx.later(function () { finish('auto'); }, o.maxMs || (type === 'color' ? 90000 : 30000));
      try { (B[type] || B.pop)(ctx); } catch (e) { finish('error'); }
    });
  }
  function css() { if (document.getElementById('funCss')) return; var l = document.createElement('link'); l.id = 'funCss'; l.rel = 'stylesheet'; l.href = (A.ROOT || '') + 'css/fun.css'; document.head.appendChild(l); }
  // ---------- the break types ----------
  var B = {};
  B.dance = function (c) {
    var n = Math.min(c.friends.length, c.simple ? 2 : 3), fs = shuffle(c.friends.slice(1)).slice(0, n - 1); fs.unshift(c.friends[0]);
    var moves = shuffle(D.MOVES), own = fs.map(function (id, i) { return moves[i]; }), els = fs.map(function (id, i) { return c.friend(id, 'dancer d' + i + ' ' + own[i].cls); });
    c.stage.insertAdjacentHTML('afterbegin', '<div class="disco"><i></i><i></i><i></i><i></i></div>');
    var mel = [0, 2, 4, 5, 4, 2, 0, 4, 5, 7, 5, 4, 2, 4, 0, 0], beat = c.seq(220, function (i) { if (i % 2 === 0) SND.drum(); if (i % 4 === 2) tone(1800, .03, { type: 'square', vol: .02 }); tone(SCALE[mel[i % 16]] * (i % 8 < 4 ? 1 : 1.5) / 1.5, .18, { type: 'triangle', vol: .07 }); });
    var freeze = !c.simple && Math.random() < .5, counting = c.reader && !freeze && Math.random() < .6, calls = shuffle(D.MOVES.filter(function (m) { return own.indexOf(m) < 0; })).slice(0, 4);
    function all(cls) { els.forEach(function (e, i) { e.className = 'bf dancer d' + i + ' ' + (cls || own[i].cls); }); }
    c.say('br_dance'); beat.start(); var t = 2600;
    calls.forEach(function (m, k) {
      c.later(function () { all(m.cls); c.say(['br_mv_' + m.id]); }, t); t += 3400;
      c.later(function () { all(); }, t - 400);
      if (freeze && (k === 1 || k === 3)) { c.later(function () { beat.stop(); all(); c.stage.classList.add('frozen'); c.say('br_freeze'); }, t); t += 2600;
        c.later(function () { c.stage.classList.remove('frozen'); els.forEach(function (e) { c.pose(e, 'cheering'); }); SND.giggle(); c.say('br_unfreeze'); beat.start(); }, t);
        c.later(function () { els.forEach(function (e) { c.pose(e, 'happy'); }); }, t + 1500); t += 1600; }
      if (counting && k === 1) { var w = ['br_jump5', 'br_clap5', 'br_stomp5'][Math.floor(Math.random() * 3)], mv = { br_jump5: 'mv-jump', br_clap5: 'mv-clap', br_stomp5: 'mv-stomp' }[w];
        c.later(function () { beat.stop(); all('mv-still'); c.say([w]); }, t); t += 1800;
        for (var q = 1; q <= 5; q++) (function (q) { c.later(function () { all('mv-still'); void c.stage.offsetWidth; all(mv + '1'); SND.drum(); c.say(['num_' + q]); }, t); t += 1000; })(q);
        c.later(function () { all(); SND.giggle(); beat.start(); }, t); t += 400; }
    });
    c.later(function () { beat.stop(); els.forEach(function (e) { c.pose(e, 'cheering'); }); c.say('br_done'); c.ready(); }, Math.min(t, 28000));
  };
  B.joke = function (c) {
    var b = data(c.p), m = c.friends, ok = D.JOKES.filter(function (j) { return m.indexOf(j.a) >= 0 && m.indexOf(j.b) >= 0; });
    var left = ok.filter(function (j) { return b.jokes.indexOf(j.id) < 0; }); if (!left.length) { b.jokes = b.jokes.filter(function (id) { return !ok.some(function (j) { return j.id === id; }); }); left = ok; }
    var list = shuffle(left).slice(0, 2), k = 0, A1, B1, bub, wait = false;
    c.stage.insertAdjacentHTML('beforeend', '<div class="jk-bub" aria-live="polite"></div><button class="jk-tap">Tap for the silly part! 👆</button>');
    bub = c.stage.querySelector('.jk-bub'); var tapBtn = c.stage.querySelector('.jk-tap');
    function one() {
      var j = list[k]; if (!j) { c.say('br_done'); c.ready(); return; } if (A1) { A1.remove(); B1.remove(); }
      A1 = c.friend(j.a, 'jk-a'); B1 = c.friend(j.b, 'jk-b', 'thinking'); bub.className = 'jk-bub left'; bub.textContent = j.q;
      c.say(['br_' + j.id + '_q'], j.q).then(function () { wait = true; tapBtn.classList.add('on'); });
      c.later(function () { wait = true; tapBtn.classList.add('on'); }, 6000);
      c.current = j;
    }
    function punch() {
      if (!wait) return; wait = false; tapBtn.classList.remove('on'); var j = list[k]; if (b.jokes.indexOf(j.id) < 0) b.jokes.push(j.id);
      bub.className = 'jk-bub left punch'; bub.innerHTML = '<small></small><span></span>'; bub.firstChild.textContent = j.q; bub.lastChild.textContent = j.p;
      c.say(['br_' + j.id + '_p'], j.p).then(function () { [A1, B1].forEach(function (f) { c.pose(f, 'cheering'); f.classList.add('crackup'); }); SND.laugh(); c.later(SND.giggle, 400); c.say('br_laugh');
        c.later(function () { k++; one(); }, 3200); });
    }
    c.onTap(punch); tapBtn.addEventListener('click', function (e) { e.stopPropagation(); punch(); });
    c.say('br_joke').then(one); c.punch = punch;
  };
  B.skit = function (c) {
    var b = data(c.p), m = c.friends, ok = D.SKITS.filter(function (k) { return k.cast.every(function (id) { return m.indexOf(id) >= 0; }); });
    var left = ok.filter(function (k) { return b.skits.indexOf(k.id) < 0; }); if (!left.length) { b.skits = []; left = ok; }
    var sk = shuffle(left)[0], i = 0, busy = false; b.skits.push(sk.id); c.skit = sk;
    c.stage.insertAdjacentHTML('beforeend', '<div class="sk-title">' + sk.title + '</div><div class="sk-prop"></div><div class="sk-hint">👆 Tap!</div>');
    var fs = sk.cast.map(function (id, j) { return c.friend(id, 'sk-f sk-f' + j); }), prop = c.stage.querySelector('.sk-prop'), hint = c.stage.querySelector('.sk-hint');
    function beat() {
      var bt = sk.beats[i]; if (!bt) return; busy = true; hint.classList.remove('on'); prop.textContent = bt[2];
      c.stage.dataset.fx = bt[1]; fs.forEach(function (f) { f.classList.remove('fx'); void f.offsetWidth; f.classList.add('fx'); });
      prop.classList.remove('fx'); void prop.offsetWidth; prop.classList.add('fx');
      (/sneeze|giggle|pop|wave|shake/.test(bt[1]) ? SND.giggle : /hop|jump|bonk/.test(bt[1]) ? SND.boing : /splash|puddle/.test(bt[1]) ? SND.splash : SND.pop)();
      c.say(['br_' + sk.id + '_' + (i + 1)], bt[0]).then(function () { busy = false; i++; if (i < sk.beats.length) hint.classList.add('on'); else { fs.forEach(function (f) { c.pose(f, 'cheering'); }); SND.laugh(); c.ready(); } });
      c.later(function () { if (busy) { busy = false; i++; if (i < sk.beats.length) hint.classList.add('on'); else c.ready(); } }, 7000);
    }
    c.onTap(function () { if (!busy && i < sk.beats.length) beat(); });
    c.say('br_skit').then(beat); c.next = function () { if (!busy && i < sk.beats.length) beat(); };
  };
  B.peek = function (c) {
    var spots = ['🌳', '☁️', '🧺'], round = 0, who = shuffle(c.friends).slice(0, 3), hid = -1, f = null;
    c.stage.insertAdjacentHTML('beforeend', '<div class="pk-row">' + spots.map(function (s, i) { return '<button class="pk-spot pk' + i + '" data-i="' + i + '"><span class="pk-cover">' + s + '</span><span class="pk-bug"></span></button>'; }).join('') + '</div>');
    var btns = [].slice.call(c.stage.querySelectorAll('.pk-spot'));
    function hide() {
      if (round >= 3) { c.say('br_done'); c.ready(); return; } hid = Math.floor(Math.random() * 3); var id = who[round % who.length];
      if (f) f.remove(); f = el('<div class="bf pk-friend" data-f="' + id + '"><img src="' + art(id, 'happy') + '" alt="" draggable="false"></div>'); btns[hid].insertBefore(f, btns[hid].firstChild);
      btns.forEach(function (b) { b.classList.remove('found', 'bug'); }); c.say('br_peek'); c.hidden = hid;
    }
    btns.forEach(function (b, i) { b.addEventListener('click', function (e) { e.stopPropagation(); c.peekTap(i); }); });
    c.peekTap = function (i) {
      var b = btns[i]; if (b.classList.contains('found')) return;
      if (i === hid) { b.classList.add('found'); c.pose(f, 'cheering'); SND.giggle(); c.say('br_peek_found'); round++; hid = -1; c.later(hide, 2600); }
      else { b.querySelector('.pk-bug').textContent = ['🐞', '🌼', '🐛', '🍄'][Math.floor(Math.random() * 4)]; b.classList.remove('bug'); void b.offsetWidth; b.classList.add('bug'); SND.boing(); c.say('br_peek_bug'); }
    };
    hide();
  };
  B.sounds = function (c) {
    var fs = c.friends.slice(0, c.simple ? 3 : 4), song = [], playing = false;
    var kinds = ['sing', 'boing', 'laugh', 'burp', 'slide', 'boing2', 'pop', 'drum'], kindOf = {};
    fs.forEach(function (id, i) { kindOf[id] = D.SOUNDS[id] || kinds[i % kinds.length]; });
    var used = {}; fs.forEach(function (id, i) { if (used[kindOf[id]]) kindOf[id] = kinds.filter(function (k) { return !used[k]; })[0]; used[kindOf[id]] = 1; });
    c.stage.insertAdjacentHTML('beforeend', '<div class="sm-row"></div><div class="sm-song" aria-label="Your song"></div><button class="sm-play">▶ Play my song</button>');
    var row = c.stage.querySelector('.sm-row'), track = c.stage.querySelector('.sm-song'), playBtn = c.stage.querySelector('.sm-play');
    var els = fs.map(function (id, i) { var f = el('<button class="bf sm-f" data-f="' + id + '"><img src="' + art(id, 'happy') + '" alt="' + name(id) + '" draggable="false"><span class="sm-k">' + ({ sing: '🎵', sing2: '🎶', boing: '🌀', boing2: '🌀', laugh: '😂', burp: '💨', slide: '🎢', pop: '💥', drum: '🥁' }[kindOf[id]] || '🎵') + '</span></button>'); row.appendChild(f); return f; });
    function play(id, f) { var k = kindOf[id]; (SND[k] || SND.pop)(k === 'sing' ? SCALE[3 + fs.indexOf(id)] : undefined); f.classList.remove('hit'); void f.offsetWidth; f.classList.add('hit'); }
    els.forEach(function (f) { f.addEventListener('click', function (e) { e.stopPropagation(); if (playing) return; var id = f.dataset.f; play(id, f); if (song.length < 8) { song.push(id); track.insertAdjacentHTML('beforeend', '<img src="' + art(id, 'happy') + '" alt="">'); } if (song.length >= 3) playBtn.classList.add('on'); }); });
    playBtn.addEventListener('click', function (e) { e.stopPropagation(); if (playing || !song.length) return; playing = true; c.say('br_playsong'); var imgs = track.querySelectorAll('img');
      song.forEach(function (id, i) { c.later(function () { play(id, els[fs.indexOf(id)]); imgs.forEach(function (im, j) { im.classList.toggle('now', j === i); }); }, 900 + i * 520); });
      c.later(function () { playing = false; SND.giggle(); c.ready(); }, 900 + song.length * 520 + 400); });
    c.tapFriend = function (i) { els[i].click(); }; c.playSong = function () { playBtn.click(); }; c.song = song;
    c.say('br_sounds');
  };
  B.dress = function (c) {
    var id = c.friends[0], O = A.Blobs.outfitById || {}, hats = ['cap', 'partyhat', 'flower', 'beanie', 'explorer', 'rainhat', 'safari', 'conductor'].filter(function (h) { return O[h]; }).slice(0, 6);
    var RARE = ['wizard', 'astronaut', 'crown', 'dino', 'bee', 'snorkel'].filter(function (h) { return O[h]; }), capes = ['#ff5d5d', '#4fa3ff', '#a77bff', '#ffd23f'], cur = { hat: 'none', cape: null }, taps = 0;
    c.stage.insertAdjacentHTML('beforeend', '<div class="dr-model"><div class="dr-cape"></div><div class="dr-friend"></div><div class="dr-spark"></div></div><div class="dr-rows">' +
      '<div class="dr-row">' + hats.map(function (h) { return '<button class="dr-it" data-hat="' + h + '"><img src="' + A.Blobs.wearUrl('hats', O[h].art, 256) + '" alt=""></button>'; }).join('') + '</div>' +
      '<div class="dr-row"><button class="dr-it" data-hat="sunglasses"><img src="' + A.Blobs.wearUrl('hats', (O.sunglasses || {}).art || 'sunglasses', 256) + '" alt=""></button>' + capes.map(function (k) { return '<button class="dr-it dr-capeb" data-cape="' + k + '"><i style="background:' + k + '"></i></button>'; }).join('') + '<button class="dr-it" data-hat="none">🙂</button></div></div>');
    var model = c.stage.querySelector('.dr-friend'), cape = c.stage.querySelector('.dr-cape'), spark = c.stage.querySelector('.dr-spark');
    function draw() { model.innerHTML = A.Blobs.svg({ blob: id, outfit: cur.hat, expr: 'happy' }); cape.style.background = cur.cape || 'transparent'; cape.classList.toggle('on', !!cur.cape); }
    draw();
    c.stage.querySelector('.dr-rows').addEventListener('click', function (e) { var b = e.target.closest('.dr-it'); if (!b) return; e.stopPropagation(); taps++;
      if (b.dataset.cape) cur.cape = cur.cape === b.dataset.cape ? null : b.dataset.cape; else if (b.dataset.hat) cur.hat = b.dataset.hat;
      if (b.dataset.hat && b.dataset.hat !== 'none' && RARE.length && taps >= 3 && Math.random() < .2 && !c.rareShown) { cur.hat = RARE[Math.floor(Math.random() * RARE.length)]; c.rareShown = cur.hat; spark.classList.remove('on'); void spark.offsetWidth; spark.classList.add('on'); SND.chime(); c.say('br_surprise'); }
      else SND.pop(); draw(); var m = c.stage.querySelector('.dr-model'); m.classList.remove('hop'); void m.offsetWidth; m.classList.add('hop'); if (taps >= 4) c.ready(); });
    c.wear = function (h) { cur.hat = h; draw(); }; c.outfit = function () { return cur; };
    c.say('br_dress');
  };
  B.concert = function (c) {
    var fs = c.friends.slice(0, c.simple ? 3 : 4), ins = D.INSTR, act = {}, ic = { drum: '🥁', horn: '🎺', piano: '🎹', guitar: '🎸', shaker: '🪇' };
    c.stage.insertAdjacentHTML('beforeend', '<div class="cc-stage"></div><div class="cc-notes"><i>♪</i><i>♫</i><i>♪</i></div>');
    var row = c.stage.querySelector('.cc-stage');
    var els = fs.map(function (id, i) { var f = el('<button class="bf cc-f" data-f="' + id + '"><img src="' + art(id, 'happy') + '" alt="' + name(id) + '" draggable="false"><span class="cc-i">' + ic[ins[i % ins.length]] + '</span></button>'); row.appendChild(f); return f; });
    var mel = [4, 2, 0, 2, 4, 4, 4, -1, 2, 2, 2, -1, 4, 7, 7, -1], chords = [[0, 2, 4], [3, 5, 7], [4, 6, 8], [3, 5, 7]];
    var seq = c.seq(200, function (i) {
      fs.forEach(function (id, k) { if (!act[id]) return; var x = ins[k % ins.length], b = i % 16;
        if (x === 'drum') { if (b % 4 === 0) SND.drum(); if (b % 4 === 2) tone(1700, .03, { type: 'square', vol: .025 }); }
        if (x === 'horn' && mel[b] >= 0) tone(SCALE[mel[b]], .2, { type: 'sawtooth', vol: .035 });
        if (x === 'piano' && b % 4 === 0) chords[Math.floor(b / 4)].forEach(function (n) { tone(SCALE[n] / 2, .5, { type: 'triangle', vol: .05 }); });
        if (x === 'guitar' && b % 2 === 0) tone(SCALE[chords[Math.floor(b / 4)][(b / 2) % 3]], .14, { type: 'triangle', vol: .07 });
        if (x === 'shaker') tone(3000 + Math.random() * 1500, .02, { type: 'square', vol: .012 });
      });
      c.stage.classList.toggle('beat', i % 2 === 0);
    });
    function toggle(i) { var id = fs[i]; act[id] = !act[id]; els[i].classList.toggle('playing', !!act[id]); SND.pop(); if (Object.keys(act).some(function (k) { return act[k]; })) seq.start(); else seq.stop(); }
    els.forEach(function (f, i) { f.addEventListener('click', function (e) { e.stopPropagation(); toggle(i); }); });
    toggle(0); c.toggle = toggle; c.active = act; c.say('br_concert');
  };
  B.pop = function (c) {
    var n = 0, end = Date.now() + 10000, colors = ['#ff8fc7', '#4fa3ff', '#ffe14d', '#6fd36a', '#a77bff', '#ffa53b'];
    function spawn() {
      if (Date.now() > end) { c.say('br_done'); c.ready(); return; }
      var b = el('<button class="pp-b" style="left:' + (5 + Math.random() * 85) + '%;--c:' + colors[n++ % colors.length] + ';animation-duration:' + (4 + Math.random() * 3) + 's" aria-label="Pop"></button>');
      b.addEventListener('pointerdown', function (e) { e.stopPropagation(); if (b.classList.contains('popped')) return; b.classList.add('popped'); SND.pop(); setTimeout(function () { b.remove(); }, 300); });
      b.addEventListener('animationend', function () { b.remove(); }); c.stage.appendChild(b); c.later(spawn, 380);
    }
    c.say('br_pop'); spawn(); c.friend(c.friends[0], 'pp-friend', 'cheering');
  };
  B.weather = function (c) {
    var kind = ['snow', 'rain', 'rainbow'][Math.floor(Math.random() * 3)], fs = c.friends.slice(0, c.simple ? 2 : 3).map(function (id, i) { return c.friend(id, 'wx-f wx-f' + i); });
    c.stage.dataset.wx = kind; c.weather = kind;
    if (kind === 'rainbow') c.stage.insertAdjacentHTML('afterbegin', '<div class="wx-rainbow"></div>');
    if (kind === 'rain') fs.forEach(function (f) { f.insertAdjacentHTML('beforeend', '<span class="wx-puddle"></span>'); });
    function drop() {
      var d = el('<span class="wx-' + (kind === 'snow' ? 'flake' : kind === 'rain' ? 'drop' : 'spark') + '" style="left:' + Math.random() * 100 + '%;animation-duration:' + (kind === 'rain' ? .9 + Math.random() * .5 : 4 + Math.random() * 3) + 's">' + (kind === 'snow' ? '❄' : kind === 'rain' ? '' : '✦') + '</span>');
      d.addEventListener('animationend', function () { d.remove(); }); c.stage.appendChild(d); c.later(drop, kind === 'rain' ? 70 : 260);
    }
    drop();
    c.onTap(function (e) {
      var f = fs[Math.floor(Math.random() * fs.length)];
      if (kind === 'snow') { var t = e && e.target && e.target.classList && e.target.classList.contains('wx-flake') ? e.target : null; if (t) { t.classList.add('caught'); } c.pose(f, 'munching'); setTimeout(function () { c.pose(f, 'happy'); }, 600); SND.chime(); }
      else if (kind === 'rain') { f.classList.remove('splash'); void f.offsetWidth; f.classList.add('splash'); SND.splash(); }
      else { var s = el('<span class="wx-burst" style="left:' + (e ? e.clientX : innerWidth / 2) + 'px;top:' + (e ? e.clientY : innerHeight / 2) + 'px">✨</span>'); document.body.appendChild(s); setTimeout(function () { s.remove(); }, 900); SND.chime(); }
      c.anim(f, 'hop', 600);
    });
    c.say(kind === 'snow' ? 'br_snow' : kind === 'rain' ? 'br_rain' : 'br_rainbow');
  };
  B.color = function (c) {
    var pages = A.ColorPages.available(c.p), pg = shuffle(pages)[0], host = el('<div class="cb-host"></div>'); c.stage.appendChild(host);
    var cl = A.Coloring.mount(host, { p: c.p, page: pg.id, simple: true }); c.coloring = cl;
    c.onEnd = function () { if (!cl.empty()) cl.save(); };   // whatever was colored goes to the gallery (skip too)
    c.say('br_color'); c.later(function () { c.ready(); }, 8000);
  };
  // ---------- hooks ----------
  function hook() {
    if (A.Store && A.Store.earnStars && !A.Store.earnStars._br) { var es = A.Store.earnStars; A.Store.earnStars = function (p, n, src) { try { if (src !== 'break' && A.Store.active && p === A.Store.active()) count(p); } catch (e) {} return es.apply(this, arguments); }; A.Store.earnStars._br = 1; }
    if (A.Store && A.Store.markPlayed && !A.Store.markPlayed._br) { var mp = A.Store.markPlayed; A.Store.markPlayed = function (p) { try { if (A.Store.active && p === A.Store.active()) count(p); } catch (e) {} return mp.apply(this, arguments); }; A.Store.markPlayed._br = 1; }
    if (A.PlayTime && A.PlayTime.checkpoint && !A.PlayTime.checkpoint._br) {
      var cp = A.PlayTime.checkpoint; A.PlayTime.checkpoint = function () { return Promise.resolve(cp.apply(this, arguments)).then(function (ok) {
        if (ok === false || !pending) return ok; pending = false; var p = A.Store && A.Store.active(); if (!due(p)) return ok;
        return show(p).then(function () { return ok; }); }); };
      A.PlayTime.checkpoint._br = 1;
    }
  }
  hook();
  A.Breaks = { TYPES: TYPES, on: on, data: data, count: count, due: due, pick: pick, mark: mark, show: show, met: met, hook: hook, isOpen: function () { return !!open; }, current: function () { return open; },
    skip: function () { if (open) open.finish('skip'); }, setClock: function (f) { NOW = f || function () { return Date.now(); }; }, pending: function () { return pending; }, resetCount: function () { lastCount = -1e15; } };
})(window.Arcade);
