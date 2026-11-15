/* Picnic Pals — background music. Prefers recorded FreePats CC0 tracks in
   assets/music/ (m4a, with mp3 fallback). If a file is missing or fails to
   load, the original live Web Audio sequencer is used instead. Melodies in
   the fallback are generated from a pentatonic scale. Tracks include hub,
   racers, pancake, map, stand, ballpark, munch (also requested as 'game'),
   bubble, cozy, and a one-shot win jingle. Music ducks under the voice and
   has its own on/off + volume (grown-up Settings), separate from sound effects.
   Files start only after the first tap/key (browser autoplay / iOS unlock). */
(function (A) {
  'use strict';
  function S() { return A.Store.settings; }
  var TRACKS = {
    hub: { bpm: 84, root: 65, progs: [[0, 9, 5, 7], [5, 0, 2, 7], [0, 4, 5, 7], [9, 5, 0, 7]], density: .42, drums: 'soft', swing: .1 },
    // Blob Room: slow and cozy, like a music box at bedtime
    cozy: { bpm: 72, root: 67, progs: [[0, 5, 9, 7], [0, 9, 5, 7], [5, 0, 4, 7], [9, 5, 2, 7]], density: .32, drums: 'soft', swing: .14 },
    game: { bpm: 106, root: 62, progs: [[0, 7, 9, 5], [9, 5, 0, 7], [2, 7, 0, 0], [5, 7, 9, 7]], density: .58, drums: 'bouncy', swing: .06 },
    // Blob Baseball: a ballpark organ noodling over a light shuffle
    ballpark: { bpm: 100, root: 65, progs: [[0, 5, 7, 0], [0, 9, 2, 7], [5, 0, 7, 0], [9, 5, 2, 7]], density: .5, drums: 'soft', swing: .16, organ: true }
  };
  var CHORD = { 0: [0, 4, 7], 2: [2, 5, 9], 4: [4, 7, 11], 5: [5, 9, 12], 7: [7, 11, 14], 9: [9, 12, 16] };
  var PENTA = [0, 2, 4, 7, 9];
  var AC = null, out = null, duck = null, noise = null, timer = null;
  var st = { want: null, track: null, playing: false, fast: false, ducked: false, step: 0, next: 0, section: 0, motif: null, notes: 0, jingles: 0, source: null, seq: 0, fileError: null };

  /* Recorded cues (seconds match the mastered loops / win jingle). 'game' is the
     historical name munch gameplay uses; it plays the munch file. */
  var FILE_ID = { hub: 'hub', racers: 'racers', pancake: 'pancake', map: 'map', stand: 'stand', ballpark: 'ballpark', munch: 'munch', bubble: 'bubble', cozy: 'cozy', win: 'win', game: 'munch' };
  var FILE_DUR = { hub: 27.428571, racers: 53.333333, pancake: 64, map: 67.2, stand: 71.111111, ballpark: 68.571429, munch: 54.857143, bubble: 64, cozy: 72, win: 3.9 };
  var PROC_FOR = { hub: 'hub', racers: 'game', pancake: 'game', map: 'hub', stand: 'hub', ballpark: 'ballpark', munch: 'game', bubble: 'game', cozy: 'cozy', game: 'game' };
  var fileRaw = {}, fileBuf = {}, fileFailed = {}, fileWait = {};
  var fileSrc = null, fileGain = null, fileUsing = null, jingleT = null;

  function rnd(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  var R = rnd(Date.now() % 100000 + 7);
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function setup() {
    if (AC) return true;
    if (!A.Audio.isUnlocked()) return false;      // never create audio before the first tap/key (browser autoplay rules)
    AC = A.Audio.context(); if (!AC) return false;
    out = AC.createGain(); duck = AC.createGain(); out.connect(duck); duck.connect(AC.destination);
    out.gain.value = vol(); duck.gain.value = 1;
    var len = AC.sampleRate * .5, buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    noise = buf; return true;
  }
  function vol() { var s = S(); return s.music === false || s.muteAll ? 0 : .22 * (s.musicVol == null ? .5 : s.musicVol) * 2; }

  function fileUrl(id, ext) { return (A.ROOT || '') + 'assets/music/' + id + '.' + ext; }
  function preferExt() {
    var a = document.createElement('audio'), m4 = '';
    try { m4 = a.canPlayType('audio/mp4; codecs="mp4a.40.2"') || a.canPlayType('audio/aac') || a.canPlayType('audio/mp4'); } catch (e) {}
    return m4 ? ['m4a', 'mp3'] : ['mp3', 'm4a'];
  }
  function canFetchFiles() {
    /* file:// pages cannot fetch sibling audio (Chrome CORS). Use the live sequencer instead. */
    try { return location.protocol !== 'file:'; } catch (e) { return false; }
  }
  function prefetch(id) {
    if (!id || fileRaw[id] || fileBuf[id] || fileFailed[id]) return fileRaw[id];
    if (!canFetchFiles()) { fileFailed[id] = true; return Promise.resolve(null); }
    var exts = preferExt();
    fileRaw[id] = (function tryExt(i) {
      if (i >= exts.length) { fileFailed[id] = true; return Promise.resolve(null); }
      return fetch(fileUrl(id, exts[i])).then(function (r) {
        if (!r.ok) return tryExt(i + 1);
        return r.arrayBuffer();
      }).catch(function () { return tryExt(i + 1); });
    })(0);
    return fileRaw[id];
  }
  function decodeRaw(ab) {
    var copy = ab.slice(0);
    try {
      var p = AC.decodeAudioData(copy);
      if (p && typeof p.then === 'function') return p;
    } catch (e) {}
    return new Promise(function (res, rej) { AC.decodeAudioData(ab.slice(0), res, rej); });
  }
  function polishSeam(data, sr) {
    var n = Math.max(2, Math.round(0.008 * sr));
    if (data.length < 4 * n) return;
    var start = data[0];
    for (var i = 0; i < n; i++) {
      var f = i / (n - 1), idx = data.length - n + i;
      data[idx] = data[idx] * (1 - f) + start * f;
    }
  }
  function fitBuffer(buf, id, loop) {
    var dur = FILE_DUR[id], want = dur ? Math.round(dur * buf.sampleRate) : buf.length;
    var take = Math.min(buf.length, Math.max(1, want));
    var outb = AC.createBuffer(buf.numberOfChannels, take, buf.sampleRate);
    for (var c = 0; c < buf.numberOfChannels; c++) {
      var src = buf.getChannelData(c), dst = outb.getChannelData(c);
      dst.set(src.subarray(0, take));
      if (loop) polishSeam(dst, buf.sampleRate);
    }
    return outb;
  }
  function bufferOf(id) {
    if (fileBuf[id]) return Promise.resolve(fileBuf[id]);
    if (fileFailed[id]) return Promise.resolve(null);
    if (fileWait[id]) return fileWait[id];
    fileWait[id] = prefetch(id).then(function (ab) {
      if (!ab || !setup()) return null;
      var loop = id !== 'win';
      return decodeRaw(ab).then(function (buf) {
        fileBuf[id] = fitBuffer(buf, id, loop);
        return fileBuf[id];
      });
    }).catch(function (err) {
      fileFailed[id] = true;
      st.fileError = (id + ': ' + (err && err.message ? err.message : err));
      return null;
    });
    return fileWait[id];
  }

  /* ---------- instruments ---------- */
  function env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
  function marimba(t, m, v) {
    var f = mtof(m), o1 = AC.createOscillator(), o2 = AC.createOscillator(), g1 = AC.createGain(), g2 = AC.createGain();
    o1.frequency.value = f; o2.frequency.value = f * 3.93; o1.type = 'sine'; o2.type = 'sine';
    env(g1, t, .004, .22 * v, .55); env(g2, t, .002, .05 * v, .07);
    o1.connect(g1); o2.connect(g2); g1.connect(out); g2.connect(out);
    o1.start(t); o2.start(t); o1.stop(t + .7); o2.stop(t + .15); st.notes++;
  }
  function bell(t, m, v) { // brighter, for the jingle
    var o = AC.createOscillator(), g = AC.createGain(), o2 = AC.createOscillator(), g2 = AC.createGain();
    o.type = 'triangle'; o.frequency.value = mtof(m); o2.frequency.value = mtof(m) * 2.01;
    env(g, t, .005, .2 * v, .9); env(g2, t, .003, .05 * v, .4);
    o.connect(g); o2.connect(g2); g.connect(out); g2.connect(out); o.start(t); o2.start(t); o.stop(t + 1); o2.stop(t + .5); st.notes++;
  }
  function organ(t, m, v, dur) { // drawbar-style ballpark organ: a few sine partials + a little vibrato
    var f = mtof(m), g = AC.createGain(), lfo = AC.createOscillator(), lg = AC.createGain(); dur = dur || .32;
    lfo.frequency.value = 6.2; lg.gain.value = f * .004; lfo.connect(lg);
    [[1, .5], [2, .3], [3, .14], [4, .08]].forEach(function (h) {
      var o = AC.createOscillator(), og = AC.createGain(); o.type = 'sine'; o.frequency.value = f * h[0]; lg.connect(o.frequency); og.gain.value = h[1];
      o.connect(og); og.connect(g); o.start(t); o.stop(t + dur + .12);
    });
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.16 * v, t + .012); g.gain.setValueAtTime(.13 * v, t + dur * .8); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + .1);
    g.connect(out); lfo.start(t); lfo.stop(t + dur + .12); st.notes++;
  }
  function bass(t, m, dur) {
    var o = AC.createOscillator(), g = AC.createGain(), lp = AC.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = mtof(m); lp.type = 'lowpass'; lp.frequency.value = 520;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.2, t + .02); g.gain.setTargetAtTime(0.0001, t + dur * .7, .08);
    o.connect(lp); lp.connect(g); g.connect(out); o.start(t); o.stop(t + dur + .4);
  }
  function pad(t, ms, dur) {
    ms.forEach(function (m) {
      [-4, 4].forEach(function (cents) {
        var o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.value = mtof(m); o.detune.value = cents;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.018, t + .35); g.gain.setTargetAtTime(0.0001, t + dur - .2, .25);
        o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 1.2);
      });
    });
  }
  function hit(t, kind, v) {
    if (kind === 'kick') {
      var o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + .13);
      env(g, t, .003, .32 * v, .16); o.connect(g); g.connect(out); o.start(t); o.stop(t + .25); return;
    }
    var s = AC.createBufferSource(), f = AC.createBiquadFilter(), g2 = AC.createGain(); s.buffer = noise;
    f.type = 'bandpass'; f.frequency.value = kind === 'snap' ? 1800 : 7000; f.Q.value = kind === 'snap' ? 1.2 : .8;
    env(g2, t, .002, (kind === 'snap' ? .09 : .045) * v, kind === 'snap' ? .09 : .035);
    s.connect(f); f.connect(g2); g2.connect(out); s.start(t, Math.random() * .3); s.stop(t + .15);
  }

  /* ---------- composing ---------- */
  function scaleNotes(root) { var a = []; for (var o = -1; o <= 2; o++) PENTA.forEach(function (p) { a.push(root + o * 12 + p); }); return a; }
  function newMotif(T) { // 2 bars of 8ths: note offsets in scale steps (null = rest)
    var m = [], cur = 5 + Math.floor(R() * 3);
    for (var i = 0; i < 16; i++) {
      var strong = i % 4 === 0;
      if (R() < (strong ? T.density + .25 : T.density - .1)) { cur = Math.max(2, Math.min(11, cur + [-2, -1, -1, 0, 1, 1, 2][Math.floor(R() * 7)])); m.push(cur); }
      else m.push(null);
    }
    m[0] = m[0] == null ? cur : m[0]; return m;
  }
  function nearestChordTone(note, chord, root) { // nudge a note onto the chord (keeps melodies consonant)
    var best = note, bd = 99;
    for (var o = -2; o <= 3; o++) chord.forEach(function (c) { var n = root + c + o * 12; var d = Math.abs(n - note); if (d < bd) { bd = d; best = n; } });
    return best;
  }

  /* ---------- sequencer (procedural fallback) ---------- */
  function stepDur() { var T = TRACKS[st.proc || st.track]; return 60 / (T.bpm * (st.fast ? 1.2 : 1)) / 2; }
  function schedule() {
    if (!AC || !(st.proc || (st.track && TRACKS[st.track]))) return;
    var T = TRACKS[st.proc || st.track], sc = scaleNotes(T.root);
    while (st.next < AC.currentTime + .3) {
      var t = st.next, i = st.step, bar = Math.floor(i / 8) % 4, beat = i % 8, secN = Math.floor(i / 32);
      if (i % 32 === 0) { // new 4-bar section
        st.section = secN; st.prog = T.progs[(secN >> 1) % T.progs.length];
        st.breather = secN > 0 && secN % 6 === 5;
        if (secN % 2 === 0 || !st.motif) st.motif = newMotif(T); else st.variant = Math.floor(R() * 3);
      }
      var chordRoot = st.prog[bar], chord = CHORD[chordRoot] || CHORD[0];
      var swing = (beat % 2 === 1) ? stepDur() * T.swing : 0;
      if (beat === 0) { pad(t, chord.map(function (c) { return T.root - 12 + c; }), stepDur() * 8); bass(t, T.root - 24 + chordRoot, stepDur() * 3); }
      if (beat === 4) bass(t, T.root - 24 + chordRoot + (R() < .3 ? 7 : 0), stepDur() * 3);
      if (!st.breather) {
        var mi = (bar % 2) * 8 + beat, n = st.motif[mi];
        if (n != null && !(bar === 3 && beat > 4)) {
          var note = sc[Math.max(0, Math.min(sc.length - 1, n + (st.section % 2 && bar >= 2 ? (st.variant || 0) - 1 : 0)))];
          if (beat % 4 === 0) note = nearestChordTone(note, chord, T.root);
          if (T.organ) organ(t + swing, note, beat % 4 === 0 ? .9 : .65, stepDur() * 1.6); else marimba(t + swing, note, beat % 4 === 0 ? 1 : .75);
        }
        if (bar === 3 && beat === 4) marimba(t, nearestChordTone(T.root + 12, chord, T.root), .9);
        if (T.drums === 'bouncy') {
          if (beat === 0 || beat === 4) hit(t, 'kick', .9);
          if (beat === 2 || beat === 6) hit(t, 'snap', .7);
          hit(t + swing, 'shaker', beat % 2 ? .6 : 1);
          if (st.fast) hit(t + stepDur() / 2, 'shaker', .5);
        } else if (beat % 2 === 1) hit(t + swing, 'shaker', .5);
      }
      st.next += stepDur(); st.step++;
    }
  }
  function fadeOutGain(g, quick) {
    if (!AC || !g) return;
    var t = AC.currentTime;
    g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + (quick ? .05 : .4));
  }
  function stopFile(quick) {
    if (!fileSrc && !fileGain) return;
    var src = fileSrc, g = fileGain;
    fileSrc = fileGain = null; fileUsing = null;
    fadeOutGain(g, quick);
    if (src) { try { src.stop(AC ? AC.currentTime + (quick ? .08 : .45) : 0); } catch (e) {} }
  }
  function stopProc(quick) {
    clearInterval(timer); timer = null; st.proc = null;
    if (st.source === 'proc') fadeOutGain(out, quick);
  }
  function stopAll(quick) {
    clearTimeout(jingleT); jingleT = null;
    stopFile(quick); stopProc(quick);
    st.playing = false; st.track = null; st.source = null;
    if (AC && out && !fileGain) {
      /* out.gain is shared; restore after a fade so the next start can ramp up */
    }
  }
  function startProc(name) {
    var proc = TRACKS[name] ? name : (PROC_FOR[name] || 'hub');
    if (!TRACKS[proc] || !setup()) return;
    stopFile(true);
    clearInterval(timer); timer = null;
    st.track = name; st.proc = proc; st.playing = true; st.source = 'proc'; st.step = 0; st.motif = null; st.next = AC.currentTime + .08;
    out.gain.cancelScheduledValues(AC.currentTime); out.gain.setValueAtTime(0.0001, AC.currentTime); out.gain.exponentialRampToValueAtTime(Math.max(vol(), 0.0001), AC.currentTime + 1.2);
    timer = setInterval(schedule, 40); schedule();
  }
  function startBuffer(buf, id, name, loop) {
    stopFile(true); stopProc(true);
    if (!setup()) return;
    fileGain = AC.createGain(); fileGain.gain.value = 1;
    fileSrc = AC.createBufferSource();
    fileSrc.buffer = buf;
    fileSrc.loop = !!loop;
    fileSrc.playbackRate.value = (loop && st.fast) ? 1.2 : 1;
    fileSrc.connect(fileGain); fileGain.connect(out);
    st.track = name; st.playing = true; st.source = 'file'; st.proc = null; fileUsing = id;
    out.gain.cancelScheduledValues(AC.currentTime); out.gain.setValueAtTime(0.0001, AC.currentTime); out.gain.exponentialRampToValueAtTime(Math.max(vol(), 0.0001), AC.currentTime + (loop ? 1.2 : .08));
    fileSrc.start(AC.currentTime + .05);
    if (!loop) {
      fileSrc.onended = function () {
        if (fileUsing !== id) return;
        fileSrc = fileGain = null; fileUsing = null;
        st.playing = false; st.track = null; st.source = null;
        if (st.want && S().music !== false && !S().muteAll && !document.hidden) play(st.want);
      };
    }
  }
  function startFileOrProc(name) {
    var id = FILE_ID[name];
    var seq = ++st.seq;
    if (!id) { startProc(name); return; }
    prefetch(id);
    if (fileBuf[id]) { startBuffer(fileBuf[id], id, name, id !== 'win'); return; }
    if (fileFailed[id]) { startProc(name); return; }
    /* Give a short window for a file already being fetched to decode before falling back. */
    var started = false;
    var delay = setTimeout(function () {
      if (st.seq !== seq || started) return;
      started = true;
      startProc(name);
    }, 450);
    bufferOf(id).then(function (buf) {
      if (st.seq !== seq) return;
      clearTimeout(delay);
      if (S().music === false || S().muteAll || document.hidden) return;
      if (!buf) { if (!started) { started = true; startProc(name); } return; }
      startBuffer(buf, id, name, id !== 'win');
    });
  }
  function startLoop(name) { startFileOrProc(name); }
  function stopLoop(quick) {
    var keepWant = st.want;
    stopAll(quick);
    st.want = keepWant;
  }
  function play(name) {
    try {
      st.want = name;
      if (FILE_ID[name]) prefetch(FILE_ID[name]);
      if (S().music === false || S().muteAll || document.hidden) return;
      if (st.track === name && st.playing) return;
      if (!setup()) return;
      startFileOrProc(name);
    } catch (e) { st.fileError = 'play:' + (e && e.message ? e.message : e); }
  }
  function stop() { st.want = null; stopLoop(); }
  function jingle() { // short victory tune (plays even if the loop is stopped; respects the music switch)
    try {
    if (S().music === false || !setup()) return;
    var keep = st.want; stopLoop(true); st.want = keep; st.seq++;
    var seq = st.seq;
    st.jingles++;
    function resume() {
      if (st.want === keep && keep && !st.playing && S().music !== false && !S().muteAll && !document.hidden) play(keep);
    }
    bufferOf('win').then(function (buf) {
      if (st.seq !== seq || S().music === false) return;
      if (buf) {
        startBuffer(buf, 'win', 'win', false);
        clearTimeout(jingleT);
        jingleT = setTimeout(function () { if (st.seq === seq) resume(); }, Math.round((FILE_DUR.win + 0.4) * 1000));
        return;
      }
      var t = AC.currentTime + .05, r = 72;
      out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(Math.max(vol(), .0001), t);
      [[0, 0], [4, .12], [7, .24], [12, .36], [9, .6], [12, .72]].forEach(function (x) { bell(t + x[1], r + x[0], 1); });
      [0, 4, 7, 12].forEach(function (c) { bell(t + 1.0, r + c, .7); }); bass(t + 1.0, r - 24, .8); hit(t + 1.0, 'kick', .8);
      clearTimeout(jingleT); jingleT = setTimeout(resume, 1800);
    });
    } catch (e) { st.fileError = 'jingle:' + (e && e.message ? e.message : e); }
  }
  // Blob Baseball "charge" fanfare: an original rising organ call, then two claps (our own tune, not the stadium classic)
  function charge() {
    try {
    if (S().music === false || !setup()) return;
    var keep = st.want, was = st.playing && st.track; if (was) stopLoop(true); st.want = keep;
    var t = AC.currentTime + .05, r = 67;
    out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(Math.max(vol(), .0001), t);
    [[0, 0, .14], [2, .16, .14], [4, .32, .14], [7, .48, .3], [5, .84, .14], [7, 1.0, .14], [12, 1.16, .5]].forEach(function (x) { organ(t + x[1], r + x[0], 1, x[2]); });
    [0, 4, 7].forEach(function (c) { organ(t + 1.16, r + c, .55, .5); });
    hit(t + 1.85, 'snap', 1.4); hit(t + 2.15, 'snap', 1.4);
    st.charges = (st.charges || 0) + 1;
    if (was) setTimeout(function () { if (st.want === was && !st.playing) play(was); }, 2600);
    } catch (e) { st.fileError = 'charge:' + (e && e.message ? e.message : e); }
  }
  function setFast(on) {
    st.fast = !!on;
    if (fileSrc && fileUsing && fileUsing !== 'win') {
      try { fileSrc.playbackRate.setTargetAtTime(st.fast ? 1.2 : 1, AC.currentTime, .04); } catch (e) { fileSrc.playbackRate.value = st.fast ? 1.2 : 1; }
    }
  }
  function setDuck(on) {
    st.ducked = !!on; if (!AC || !duck) return; var t = AC.currentTime;
    duck.gain.cancelScheduledValues(t); duck.gain.setValueAtTime(duck.gain.value, t); duck.gain.linearRampToValueAtTime(on ? .3 : 1, t + (on ? .15 : .7));
  }
  function apply() { // settings changed
    if (S().music === false || S().muteAll) { stopLoop(); return; }
    if (AC && out && st.playing) { var t = AC.currentTime; out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(out.gain.value, t); out.gain.linearRampToValueAtTime(Math.max(vol(), 0), t + .2); }
    else if (st.want) play(st.want);
  }
  function toggle() { var s = S(); s.music = s.music === false; A.Store.save(); apply(); A.emit('music:changed', s.music); return s.music; }

  A.on('voice:start', function () { setDuck(true); });
  A.on('voice:end', function () { setDuck(false); });
  A.on('audio:unlocked', function () { if (st.want && !st.playing) play(st.want); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { var w = st.want; stopLoop(true); st.want = w; } else if (st.want) play(st.want); });

  prefetch('hub');
  prefetch('win');

  A.Music = { play: play, stop: stop, jingle: jingle, charge: charge, setFast: setFast, apply: apply, toggle: toggle,
    state: function () { return { want: st.want, track: st.track, playing: st.playing, fast: st.fast, ducked: st.ducked, duckGain: duck ? +duck.gain.value.toFixed(2) : null, notes: st.notes, jingles: st.jingles, charges: st.charges || 0, section: st.section, source: st.source, file: fileUsing || null, fileError: st.fileError }; } };
})(window.Arcade);
