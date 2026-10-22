/* Blob Arcade — background music, made live with Web Audio (no audio files, no copyrighted tunes).
   A tiny sequencer plays soft marimba melodies over bass, pad and light percussion. Melodies are generated
   from a pentatonic scale in 4-bar sections (A A' B A'' …, with a gentle "breather" every few sections),
   so the loop keeps changing without getting busy. Tracks: 'hub' (calm), 'game' (bouncy), game + fast
   (a little quicker when the timer is low) and a short victory jingle.
   Music ducks under the voice and has its own on/off + volume (grown-up Settings), separate from sound effects. */
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
  var st = { want: null, track: null, playing: false, fast: false, ducked: false, step: 0, next: 0, section: 0, motif: null, notes: 0, jingles: 0 };

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

  /* ---------- sequencer ---------- */
  function stepDur() { var T = TRACKS[st.track]; return 60 / (T.bpm * (st.fast ? 1.2 : 1)) / 2; }
  function schedule() {
    if (!AC || !st.track) return;
    var T = TRACKS[st.track], sc = scaleNotes(T.root);
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
  function startLoop(name) {
    if (!setup()) { st.want = name; return; }
    stopLoop(true);
    st.track = name; st.playing = true; st.step = 0; st.motif = null; st.next = AC.currentTime + .08;
    out.gain.cancelScheduledValues(AC.currentTime); out.gain.setValueAtTime(0.0001, AC.currentTime); out.gain.exponentialRampToValueAtTime(Math.max(vol(), 0.0001), AC.currentTime + 1.2);
    timer = setInterval(schedule, 40); schedule();
  }
  function stopLoop(quick) {
    clearInterval(timer); timer = null; st.playing = false; st.track = null;
    if (AC && out) { var t = AC.currentTime; out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(out.gain.value, t); out.gain.linearRampToValueAtTime(0, t + (quick ? .05 : .4)); }
  }
  function play(name) {
    st.want = name;
    if (S().music === false || S().muteAll || document.hidden) return;
    if (st.track === name && st.playing) return;
    startLoop(name);
  }
  function stop() { st.want = null; stopLoop(); }
  function jingle() { // short victory tune (plays even if the loop is stopped; respects the music switch)
    if (S().music === false || !setup()) return;
    var keep = st.want; stopLoop(true); st.want = keep;
    var t = AC.currentTime + .05, r = 72;
    out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(Math.max(vol(), .0001), t);
    [[0, 0], [4, .12], [7, .24], [12, .36], [9, .6], [12, .72]].forEach(function (x) { bell(t + x[1], r + x[0], 1); });
    [0, 4, 7, 12].forEach(function (c) { bell(t + 1.0, r + c, .7); }); bass(t + 1.0, r - 24, .8); hit(t + 1.0, 'kick', .8);
    st.jingles++;
  }
  // Blob Baseball "charge" fanfare: an original rising organ call, then two claps (our own tune, not the stadium classic)
  function charge() {
    if (S().music === false || !setup()) return;
    var keep = st.want, was = st.playing && st.track; if (was) stopLoop(true); st.want = keep;
    var t = AC.currentTime + .05, r = 67;
    out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(Math.max(vol(), .0001), t);
    [[0, 0, .14], [2, .16, .14], [4, .32, .14], [7, .48, .3], [5, .84, .14], [7, 1.0, .14], [12, 1.16, .5]].forEach(function (x) { organ(t + x[1], r + x[0], 1, x[2]); });
    [0, 4, 7].forEach(function (c) { organ(t + 1.16, r + c, .55, .5); });
    hit(t + 1.85, 'snap', 1.4); hit(t + 2.15, 'snap', 1.4);
    st.charges = (st.charges || 0) + 1;
    if (was) setTimeout(function () { if (st.want === was && !st.playing) play(was); }, 2600);
  }
  function setFast(on) { st.fast = !!on; }
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

  A.Music = { play: play, stop: stop, jingle: jingle, charge: charge, setFast: setFast, apply: apply, toggle: toggle,
    state: function () { return { want: st.want, track: st.track, playing: st.playing, fast: st.fast, ducked: st.ducked, duckGain: duck ? +duck.gain.value.toFixed(2) : null, notes: st.notes, jingles: st.jingles, charges: st.charges || 0, section: st.section }; } };
})(window.Arcade);
