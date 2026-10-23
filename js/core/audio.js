/* Blob Arcade — sound effects (Web Audio, synthesized: no files) and the VOICE MANAGER.
   Voice playback order for each line id:
     (a) "your voice": a recording made in the in-app recorder (IndexedDB, this device only)
     (b) "your voice": a file audio/voice/<id>.<mp3|m4a|wav|webm|ogg> listed in audio/voice/manifest.js
         (or found by the grown-up area "Scan" button)
     (c) "built-in clip": computer-generated clips in audio/voice-tts/ (Kokoro TTS, see tools/generate-tts.py),
         including whole-sentence clips for composed sentences ("3 plus 4 is 7")
     (d) "computer voice": the browser speech voice (Web Speech API)
   Sentences are arrays of parts: line ids, numbers (-> num_<n>) or {id, text} objects. A sentence plays in your
   voice when every part is in your voice; otherwise it uses one consistent built-in voice (unless "mix" is on). */
(function (A) {
  'use strict';
  function S() { return A.Store.settings; }
  // grown-up volume sliders (0..1 each) + mute-all, saved on the device in settings
  function lvl(k) { var s = S(); if (s.muteAll) return 0; var v = s[k]; return v == null ? 1 : Math.max(0, Math.min(1, +v)); }
  A.vol = { voice: function () { return lvl('voiceVol'); }, sfx: function () { return lvl('sfxVol'); } };

  /* ================= SFX ================= */
  var AC = null, unlocked = false;
  function ctx(force) {
    if (!force && !S().sound) return null;
    try {
      if (!AC) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); }
      if (AC.state === 'suspended') AC.resume();
    } catch (e) { return null; }
    return AC;
  }
  function tone(f, dur, o) {
    o = o || {}; var a = ctx(); if (!a) return; var t = a.currentTime + (o.when || 0);
    var osc = a.createOscillator(), g = a.createGain(); osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    var v = Math.max(0.0002, (o.vol || .18) * lvl('sfxVol')); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(a.destination); osc.start(t); osc.stop(t + dur + .05);
  }
  var SFX = {
    step: function () { tone(740, .06, { vol: .05, to: 880 }); },
    bump: function () { tone(180, .12, { vol: .1, type: 'triangle', to: 120 }); },
    chomp: function () { tone(420, .07, { type: 'triangle', to: 200, vol: .2 }); tone(380, .07, { type: 'triangle', to: 180, vol: .18, when: .1 }); },
    yay: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, .16, { type: 'triangle', vol: .14, when: .12 + i * .07 }); }); },
    oops: function () { tone(392, .22, { vol: .12, to: 330, when: .08 }); tone(330, .3, { vol: .1, to: 262, when: .3 }); },
    tap: function () { tone(880, .05, { vol: .06 }); },
    pop: function () { tone(600, .08, { vol: .12, to: 1200, type: 'sine' }); },
    win: function () { [523, 659, 784, 659, 784, 1047].forEach(function (f, i) { tone(f, .22, { type: 'triangle', vol: .14, when: i * .13 }); });
      [1568, 2093, 2637].forEach(function (f, i) { tone(f, .15, { vol: .05, when: .9 + i * .08 }); }); },
    unlock: function () { [392, 523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, .2, { type: 'triangle', vol: .12, when: i * .09 }); });
      [2093, 2637, 3136].forEach(function (f, i) { tone(f, .12, { vol: .04, when: .6 + i * .07 }); }); },
    star: function () { tone(1200, .12, { type: 'triangle', vol: .1 }); },
    boing: function () { tone(200, .35, { to: 600, vol: .12 }); },
    soft: function () { tone(523, .25, { vol: .1 }); tone(440, .35, { vol: .1, when: .2 }); },
    tick: function () { tone(1320, .035, { vol: .045, type: 'triangle' }); tone(990, .05, { vol: .03, when: .02 }); },
    sparkle: function () { [1568, 1976, 2349, 2637].forEach(function (f, i) { tone(f, .14, { vol: .05, when: i * .06 }); }); },
    bonus: function () { [659, 784, 988, 1319].forEach(function (f, i) { tone(f, .18, { type: 'triangle', vol: .12, when: i * .08 }); }); tone(1760, .3, { vol: .05, when: .36 }); },
    timeup: function () { tone(784, .18, { type: 'triangle', vol: .1 }); tone(659, .18, { type: 'triangle', vol: .1, when: .16 }); tone(523, .34, { type: 'triangle', vol: .1, when: .32 }); },
    locked: function () { tone(330, .1, { vol: .08, type: 'square', to: 300 }); tone(262, .14, { vol: .07, type: 'square', when: .12 }); }
  };

  /* ================= recorded clips (IndexedDB) ================= */
  var DBN = 'blobArcadeVoice', dbp = null, recIds = new Set(), urlCache = {};
  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      if (!window.indexedDB) return rej(new Error('IndexedDB not available'));
      var r; try { r = indexedDB.open(DBN, 1); } catch (e) { return rej(e); }
      r.onupgradeneeded = function () { r.result.createObjectStore('clips', { keyPath: 'id' }); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
    dbp.catch(function () {});
    return dbp;
  }
  function tx(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var t = d.transaction('clips', mode), st = t.objectStore('clips'), out = fn(st);
        t.oncomplete = function () { res(out instanceof IDBRequest ? out.result : out); };
        t.onerror = function () { rej(t.error); }; t.onabort = function () { rej(t.error); };
      });
    });
  }
  var Clips = {
    ready: null,
    has: function (id) { return recIds.has(id); },
    count: function () { return recIds.size; },
    ids: function () { return Array.from(recIds); },
    put: function (id, blob, meta) {
      var rec = { id: id, blob: blob, type: blob.type || (meta && meta.type) || '', ts: Date.now(), size: blob.size, ms: (meta && meta.ms) || 0 };
      return tx('readwrite', function (st) { st.put(rec); }).then(function () { recIds.add(id); dropUrl(id); A.emit('clips:changed', id); return rec; });
    },
    get: function (id) { return tx('readonly', function (st) { return st.get(id); }); },
    del: function (id) { return tx('readwrite', function (st) { st.delete(id); }).then(function () { recIds.delete(id); dropUrl(id); A.emit('clips:changed', id); }); },
    all: function () { return tx('readonly', function (st) { return st.getAll(); }); },
    clear: function () { return tx('readwrite', function (st) { st.clear(); }).then(function () { recIds.clear(); Object.keys(urlCache).forEach(dropUrl); A.emit('clips:changed'); }); }
  };
  function dropUrl(id) { if (urlCache[id]) { try { URL.revokeObjectURL(urlCache[id]); } catch (e) {} delete urlCache[id]; } }
  Clips.ready = tx('readonly', function (st) { return st.getAllKeys(); }).then(function (keys) { (keys || []).forEach(function (k) { recIds.add(k); }); return true; })
    .catch(function (e) { console.info('Voice recordings storage unavailable:', e && e.message); return false; });

  /* ================= voice files on disk ================= */
  // Tier 1 "your voice" files: audio/voice/<id>.<ext>, listed in audio/voice/manifest.js (or found by Scan)
  // Tier 2 "built-in clips": audio/voice-tts/<id>.mp3 + whole sentences in audio/voice-tts/phrases/, listed in audio/voice-tts/manifest.js
  var SCAN_KEY = 'blobArcade.voiceScan';
  var manifest = window.ARCADE_VOICE_MANIFEST || { files: {} };
  var TTS = window.ARCADE_TTS_MANIFEST || { files: {}, phrases: [] };
  var phraseSet = {}; (TTS.phrases || []).forEach(function (k) { phraseSet[k] = true; });
  var scanned = {}; try { scanned = JSON.parse(localStorage.getItem(SCAN_KEY) || '{}') || {}; } catch (e) {}
  var badFiles = {}; // URLs that failed to load this session (never retried -> no 404 spam)
  function fileUrl(f) { return A.ROOT + 'audio/voice/' + f; }
  function ttsUrl(f) { return A.ROOT + 'audio/voice-tts/' + f; }
  function phraseUrl(key) { return A.ROOT + 'audio/voice-tts/phrases/' + key + '.mp3'; }
  function fileFor(id) { var f = (manifest.files && manifest.files[id]) || scanned[id]; return f && !badFiles[fileUrl(f)] ? f : null; }
  function ttsFor(id) { var f = TTS.files && TTS.files[id]; return f && !badFiles[ttsUrl(f)] ? f : null; }
  function hasPhrase(key) { return !!phraseSet[key] && !badFiles[phraseUrl(key)]; }

  function probe(url) {
    return new Promise(function (res) {
      var a = new Audio(), done = false;
      function fin(ok) { if (done) return; done = true; a.removeAttribute('src'); try { a.load(); } catch (e) {} res(ok); }
      a.preload = 'metadata'; a.onloadedmetadata = function () { fin(true); }; a.oncanplay = function () { fin(true); }; a.onerror = function () { fin(false); };
      setTimeout(function () { fin(false); }, 4000); a.src = url;
    });
  }
  // Parent-triggered: look for <id>.<ext> files in audio/voice/ for every line
  function scanFiles(onProgress) {
    var L = A.VoiceLines.all, found = {}, i = 0, exts = A.VoiceLines.EXTS, running = 0;
    return new Promise(function (resolve) {
      function next() {
        if (i >= L.length && running === 0) { scanned = found; try { localStorage.setItem(SCAN_KEY, JSON.stringify(found)); } catch (e) {} resolve(found); return; }
        while (running < 6 && i < L.length) {
          (function (line) {
            running++;
            var j = 0;
            (function tryExt() {
              if (j >= exts.length) { running--; onProgress && onProgress(i, L.length, Object.keys(found).length); next(); return; }
              var f = line.id + '.' + exts[j++];
              probe(fileUrl(f)).then(function (ok) { if (ok) { found[line.id] = f; running--; onProgress && onProgress(i, L.length, Object.keys(found).length); next(); } else tryExt(); });
            })();
          })(L[i++]);
        }
      }
      next();
    });
  }

  /* ================= speech (fallback) ================= */
  var hasSpeech = ('speechSynthesis' in window) && ('SpeechSynthesisUtterance' in window), VOICE = null, voicesKnown = false, voiceCount = 0;
  // Player names have no built-in clips (any name works), so they are spoken by the browser's speech voice.
  // Without one, sentences use generic stand-ins instead (a name part's .alt, e.g. "Player 1", or nothing).
  function canSayNames() { return hasSpeech && !(voicesKnown && voiceCount === 0) && !A.Voice.noSpeech; }
  function nameOf(p, alt) {
    if (p && p.guest) return 'name_guest';
    var nm = String((p && p.name) || 'Player');
    return { id: 'name_' + nm.toLowerCase().replace(/[^a-z0-9]/g, ''), text: nm + '!', alt: alt || [] };
  }
  function resolveNames(parts) {
    var named = canSayNames(), out = [];
    parts.forEach(function (p) { if (p && typeof p === 'object' && p.alt && !named) out.push.apply(out, p.alt); else out.push(p); });
    return out;
  }
  function pickVoice() {
    if (!hasSpeech) return; var vs = []; try { vs = speechSynthesis.getVoices() || []; } catch (e) {}
    if (vs.length) voicesKnown = true; voiceCount = vs.length;
    var en = vs.filter(function (v) { return /^en/i.test(v.lang); }); if (!en.length) { VOICE = null; return; }
    var prefs = [/samantha/i, /google us english/i, /jenny/i, /aria/i, /ava/i, /allison/i, /susan/i, /zira/i, /karen/i, /moira/i, /tessa/i, /serena/i, /female/i];
    for (var i = 0; i < prefs.length; i++) { var f = en.filter(function (v) { return prefs[i].test(v.name); }); if (f.length) { VOICE = f.filter(function (v) { return v.localService; })[0] || f[0]; return; } }
    VOICE = en.filter(function (v) { return /en[-_]US/i.test(v.lang); })[0] || en[0];
  }
  if (hasSpeech) { pickVoice(); try { speechSynthesis.addEventListener('voiceschanged', function () { voicesKnown = true; pickVoice(); }); } catch (e) {} }
  function speak(text, tok) {
    return new Promise(function (res) {
      if (!hasSpeech || !text || tok !== TOK) return res();
      var done = false; function fin() { if (!done) { done = true; res(); } }
      try {
        var u = new SpeechSynthesisUtterance(text.replace(/−/g, ' minus ').replace(/\+/g, ' plus '));
        u.rate = S().rate || .9; u.pitch = 1.15; u.volume = lvl('voiceVol'); if (VOICE) { u.voice = VOICE; u.lang = VOICE.lang; } else u.lang = 'en-US';
        u.onend = u.onerror = fin;
        speechSynthesis.speak(u);
        setTimeout(fin, 1500 + text.length * 95); // safety: some browsers never fire onend
      } catch (e) { fin(); }
    });
  }


  /* ================= voice manager ================= */
  var TOK = 0, current = null, sources = [], speaking = false;
  function norm(part) {
    if (typeof part === 'number') return { id: 'num_' + part, text: String(part) };
    if (typeof part === 'string') { var l = A.VoiceLines.byId[part]; return { id: part, text: l ? l.text : part }; }
    return { id: part.id, text: part.text != null ? part.text : ((A.VoiceLines.byId[part.id] || {}).text || '') };
  }
  function textOf(parts) {
    var t = (parts || []).map(function (p) { return norm(p).text; }).join(' ').replace(/\s+([,.!?])/g, '$1').replace(/\s+/g, ' ').trim();
    if (t && !/[.!?]$/.test(t)) t += '!';
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  var useOwn = function () { return S().recorded !== false; }, useTts = function () { return S().ttsClips !== false; };
  // "Your voice" source for one line: in-browser recording first, then a file in audio/voice/
  function ownSrc(id) {
    if (!useOwn()) return Promise.resolve(null);
    return Clips.ready.then(function () {
      if (recIds.has(id)) {
        if (urlCache[id]) return { tier: 'rec', url: urlCache[id] };
        return Clips.get(id).then(function (r) {
          if (r && r.blob) { urlCache[id] = URL.createObjectURL(r.blob); return { tier: 'rec', url: urlCache[id] }; }
          return fileFor(id) ? { tier: 'file', url: fileUrl(fileFor(id)) } : null;
        }).catch(function () { return null; });
      }
      var f = fileFor(id); return f ? { tier: 'file', url: fileUrl(f) } : null;
    });
  }
  function ttsSrc(id) { var f = useTts() && ttsFor(id); return f ? { tier: 'tts', url: ttsUrl(f) } : null; }
  // Where a single line will come from: 'rec' (recorded here), 'file' (audio/voice/), 'tts' (built-in clip) or 'speech'
  function sourceOf(id) { return ownSrc(id).then(function (o) { return o || ttsSrc(id) || { tier: 'speech', url: null }; }); }
  function srcFor(id) { return sourceOf(id).then(function (s) { return s.url; }); }

  /* Build a playback plan for a sentence (array of parts):
     1. every part in YOUR voice -> your clips back-to-back
     2. else built-in clips: whole-sentence phrase clips where available (longest match), single clips otherwise
     3. else (or if a part is missing everywhere) -> the browser's speech voice for the whole sentence
     "Mix voices" (settings, off by default) lets one sentence mix your clips, built-in clips and speech. */
  function plan(parts) {
    var items = parts.map(norm), ids = items.map(function (it) { return it.id; });
    return Promise.all(ids.map(ownSrc)).then(function (own) {
      var segs = [], i, j;
      if (own.every(Boolean)) return { tier: 'own', segs: items.map(function (it, k) { return { url: own[k].url, text: it.text, tier: own[k].tier }; }) };
      var mix = S().mixVoice && own.some(Boolean);
      if (useTts()) {
        var ok = true;
        for (i = 0; i < items.length;) {
          if (mix && own[i]) { segs.push({ url: own[i].url, text: items[i].text, tier: own[i].tier }); i++; continue; }
          var hit = 0;
          for (j = items.length; j > i + 1; j--) {
            if (mix && own.slice(i, j).some(Boolean)) continue;
            if (hasPhrase(ids.slice(i, j).join('.'))) { hit = j; break; }
          }
          if (hit) { segs.push({ url: phraseUrl(ids.slice(i, hit).join('.')), text: textOf(parts.slice(i, hit)), tier: 'tts', phrase: true }); i = hit; continue; }
          var t = ttsSrc(ids[i]);
          if (t) segs.push({ url: t.url, text: items[i].text, tier: 'tts' });
          else { ok = false; segs.push({ url: null, text: items[i].text, tier: 'speech' }); }
          i++;
        }
        if (ok) return { tier: 'tts', segs: segs };
        if (S().mixVoice) return { tier: 'mixed', segs: segs };
      } else if (mix) {
        return { tier: 'mixed', segs: items.map(function (it, k) { return own[k] ? { url: own[k].url, text: it.text, tier: own[k].tier } : { url: null, text: it.text, tier: 'speech' }; }) };
      }
      return { tier: 'speech', segs: [{ url: null, text: textOf(parts), tier: 'speech' }] };
    });
  }

  /* ---- smooth playback ----
     Preferred: Web Audio. Each clip is decoded, its leading/trailing silence trimmed and its volume evened out,
     then the parts are scheduled back-to-back with short, natural gaps (works for recordings made here and for
     files when the arcade is served over http/https). Fallback (e.g. opened as file://): <audio> elements,
     all preloaded before the first one starts so there is no loading pause between parts. */
  var GAP_PART = 0.04, GAP_SENT = 0.28, TARGET_RMS = 0.085;
  var bufCache = {}, bufOrder = [];
  function canWA(url) { return !!(AC && AC.state === 'running' && window.fetch && url && !/^file:/i.test(new URL(url, location.href).protocol)); }
  function prep(buf) {
    var d = buf.getChannelData(0), sr = buf.sampleRate, fr = Math.round(sr * 0.01), n = Math.floor(d.length / fr), db = [], mx = -120, k, s, x;
    for (k = 0; k < n; k++) { s = 0; for (var q = k * fr; q < (k + 1) * fr; q++) s += d[q] * d[q]; x = 10 * Math.log10(s / fr + 1e-12); db.push(x); if (x > mx) mx = x; }
    var thr = Math.max(mx - 40, -62), a = 0, b = n - 1;
    while (a < n && db[a] < thr) a++; while (b > a && db[b] < thr) b--;
    if (a >= n) return { buf: buf, start: 0, dur: buf.duration, gain: 1 };
    var start = Math.max(0, a * fr / sr - 0.02), end = Math.min(buf.duration, (b + 1) * fr / sr + 0.05);
    var e = 0, c = 0, pk = 0; for (k = a; k <= b; k++) if (db[k] > thr + 10) { for (q = k * fr; q < (k + 1) * fr; q++) { e += d[q] * d[q]; if (Math.abs(d[q]) > pk) pk = Math.abs(d[q]); } c += fr; }
    var rms = c ? Math.sqrt(e / c) : 0, g = rms > 0 ? TARGET_RMS / rms : 1;
    g = Math.max(0.5, Math.min(4, g)); if (pk * g > 0.95) g = 0.95 / pk;
    return { buf: buf, start: start, dur: end - start, gain: g };
  }
  function decode(url) {
    if (bufCache[url]) return bufCache[url];
    var p = fetch(url).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); })
      .then(function (ab) { return new Promise(function (res, rej) { var pr = AC.decodeAudioData(ab, res, rej); if (pr && pr.then) pr.then(res, rej); }); })
      .then(prep);
    p.catch(function () { delete bufCache[url]; });
    bufCache[url] = p; bufOrder.push(url);
    while (bufOrder.length > 48) { var old = bufOrder.shift(); if (old !== url) delete bufCache[old]; }
    return p;
  }
  function gapAfter(seg) { return /[.!?]["”]?$/.test((seg.text || '').trim()) ? GAP_SENT : GAP_PART; }
  function playWA(segs, tok) {
    return Promise.race([
      Promise.all(segs.map(function (s) { return decode(s.url); })),
      new Promise(function (res, rej) { setTimeout(function () { rej(new Error('decode timeout')); }, 3000); })
    ]).then(function (bufs) {
      if (tok !== TOK) return true;
      var t = AC.currentTime + 0.04, t0 = t;
      bufs.forEach(function (b, i) {
        var src = AC.createBufferSource(), g = AC.createGain(); src.buffer = b.buf; g.gain.value = b.gain * lvl('voiceVol');
        src.connect(g); g.connect(AC.destination); src.start(t, b.start, b.dur); sources.push(src);
        t += b.dur + (i < bufs.length - 1 ? gapAfter(segs[i]) : 0);
      });
      A.Voice.last.mode = 'webaudio'; A.Voice.last.ms = Math.round((t - t0) * 1000);
      return new Promise(function (res) { setTimeout(function () { res(true); }, (t - AC.currentTime) * 1000 + 30); });
    });
  }
  function playEl(segs, tok) {
    var els = segs.map(function (s) { var a = new Audio(); a.preload = 'auto'; a.src = s.url; a.volume = lvl('voiceVol'); return a; });
    function ready(a) { return new Promise(function (res) { if (a.readyState >= 3) return res(); var d = false; function f() { if (!d) { d = true; res(); } } a.oncanplaythrough = f; a.onerror = f; setTimeout(f, 1500); }); }
    A.Voice.last.mode = 'element';
    return Promise.all(els.map(ready)).then(function () {
      var chain = Promise.resolve(true);
      els.forEach(function (a, i) {
        chain = chain.then(function (okSoFar) {
          if (tok !== TOK) return okSoFar;
          return playEl1(a, segs[i], tok).then(function (ok) {
            if (!ok && tok === TOK) return speak(segs[i].text, tok).then(function () { return false; });
            return wait(i < els.length - 1 && /[.!?]$/.test((segs[i].text || '').trim()) ? (GAP_SENT - 0.12) * 1000 : 0).then(function () { return okSoFar && ok; });
          });
        });
      });
      return chain;
    });
  }
  function wait(ms) { return new Promise(function (r) { ms > 0 ? setTimeout(r, ms) : r(); }); }
  function playEl1(a, seg, tok) {
    return new Promise(function (res) {
      if (tok !== TOK) return res(true);
      current = a; var done = false;
      function fin(ok) { if (done) return; done = true; a.onended = a.onerror = null; res(ok); }
      a.onended = function () { fin(true); };
      a.onerror = function () { if (seg.url.indexOf('blob:') !== 0) badFiles[seg.url] = true; fin(false); };
      var p = a.play(); if (p && p.catch) p.catch(function () { fin(false); });
      setTimeout(function () { fin(true); }, 15000);
    });
  }
  function playUrl(url, tok) { var a = new Audio(url); a.volume = lvl('voiceVol'); return playEl1(a, { url: url, text: '' }, tok); }
  // play a run of clip segments (no speech inside)
  function playClips(segs, tok) {
    if (!segs.length) return Promise.resolve(true);
    ctx(true);
    if (segs.every(function (s) { return canWA(s.url); })) return playWA(segs, tok).catch(function () { return tok === TOK ? playEl(segs, tok) : true; });
    return playEl(segs, tok);
  }
  function stop() {
    TOK++;
    if (current) { try { current.pause(); } catch (e) {} current = null; }
    sources.forEach(function (s) { try { s.stop(); } catch (e) {} }); sources = [];
    if (hasSpeech) try { speechSynthesis.cancel(); } catch (e) {}
  }
  /* ================= "How much talking" (per player, grown-up setting p.talk; 2026-10-22 voice) =================
     p.talk: 'auto' (by age) | 'full' | 'prompts' | 'tap' | 'off'. Effective modes: 'full' | 'toddler' | 'prompts' | 'tap' | 'off'.
     Auto: Toddler mode -> 'toddler' (short prompts + item names); readers (age 6+, or reading level 1st grade and up) -> 'tap';
     pre-readers (age 5 and under, or age not set) -> 'prompts'. No player picked yet -> 'prompts'.
     Every A.Voice.say() call names its kind (opts.kind, default 'chatter'):
       chatter  greetings, praise, how-to, cheers, menu lines   -> full only
       focus    keyboard / controller focus reads a tile           -> full only
       name     item / choice names (toddler taps, baseball cards) -> full, toddler
       prompt   the question / prompt when it appears              -> full, toddler, prompts
       target   the target word or number a pre-reader needs       -> full, toddler, prompts
       answer   the right answer / fact after a miss               -> full, toddler, prompts
       listen   audio-only tests (sight-word "listen and find"), and the word after a miss there -> every mode but off
       tap      the kid asked (🔊 button, R key, tapping the prompt bubble) -> every mode but off
     opts.force (grown-up area test buttons, storybook word taps the kid asked for) skips this check; the master Voice switch still applies. */
  var TALK_MODES = ['auto', 'full', 'prompts', 'tap', 'off'];
  var ALLOW = { full: 'chatter focus name prompt target answer listen tap', toddler: 'name prompt target answer listen tap',
    prompts: 'prompt target answer listen tap', tap: 'listen tap', off: '' };
  function reader(p) {
    var a = A.Age ? A.Age.of(p) : null, lv = p && p.levels && p.levels.reading;
    return (a != null && a >= 6) || (!!lv && lv !== 'auto' && /^[1-9]$/.test(String(lv)));
  }
  var Talk = {
    MODES: TALK_MODES, ALLOW: ALLOW,
    LABELS: { auto: 'Auto (by age)', full: 'Full', prompts: 'Prompts only', tap: 'Tap to hear', off: 'Off' },
    setting: function (p) { var t = p && p.talk; return TALK_MODES.indexOf(t) >= 0 ? t : 'auto'; },
    reader: reader,
    // effective mode for a player (default: the active player)
    mode: function (p) {
      if (p === undefined) p = A.Store && A.Store.active ? A.Store.active() : null;
      if (!p) return 'prompts';
      var t = Talk.setting(p);
      if (t !== 'auto') return t;
      if (A.toddler && A.toddler(p)) return 'toddler';
      return reader(p) ? 'tap' : 'prompts';
    },
    allows: function (kind, p) { var m = Talk.mode(p); return (' ' + ALLOW[m] + ' ').indexOf(' ' + (kind || 'chatter') + ' ') >= 0; },
    // concat only the allowed pieces: list of [parts, kind]
    pick: function (list, p) { return list.reduce(function (a, x) { return x && x[0] && x[0].length && Talk.allows(x[1], p) ? a.concat(x[0]) : a; }, []); }
  };
  A.Talk = Talk;
  var LOG = [];   // what was actually spoken (after the talking check) — read by the tests
  function say(parts, opts) {
    opts = opts || {};
    if (!parts || !parts.length) { stop(); return Promise.resolve(); }
    var kind = opts.kind || 'chatter';
    if (!opts.force && !opts.picked && !Talk.allows(kind)) {
      // not spoken at this talking level: a page that has no text of its own for this line gets a food-friend bubble
      LOG.push({ kind: kind, said: false, text: textOf(parts) });
      if (opts.bubble !== false && kind !== 'focus' && A.UI && A.UI.friendBubble && !A.Voice.ownBubble) A.UI.friendBubble(textOf(parts));
      return Promise.resolve();
    }
    stop(); var tok = TOK;
    if (!S().voice && !opts.force) return Promise.resolve();
    LOG.push({ kind: kind, said: true, text: textOf(parts) }); if (LOG.length > 200) LOG.splice(0, 100);
    parts = resolveNames(parts); if (!parts.length) return Promise.resolve();
    A.emit('voice:start'); speaking = true;
    return plan(parts).then(function (pl) {
      if (tok !== TOK) return;
      A.Voice.last = { tier: pl.tier, urls: pl.segs.map(function (s) { return s.url; }), text: textOf(parts), mode: 'speech' };
      if (pl.tier === 'speech') return speak(pl.segs[0].text, tok);
      // group consecutive clip segments; speak the (rare, mix-only) missing ones in between
      var chain = Promise.resolve(), run = [], pend = [];
      function flushRun() { if (!run.length) return; var r = run; run = []; chain = chain.then(function () { if (tok === TOK) return playClips(r, tok); }); }
      function flushPend() { if (!pend.length) return; var t = pend.join(' '); pend = []; chain = chain.then(function () { return speak(t, tok); }); }
      pl.segs.forEach(function (s) { if (s.url) { flushPend(); run.push(s); } else { flushRun(); pend.push(s.text); } });
      flushRun(); flushPend();
      return chain;
    }).then(function () { if (tok === TOK) { speaking = false; A.emit('voice:end'); } });
  }

  A.Audio = {
    SFX: SFX, tone: tone,
    unlock: function () { ctx(true); if (!unlocked) { unlocked = true; A.emit('audio:unlocked'); } },
    isUnlocked: function () { return unlocked; },
    context: function () { return ctx(true); },
    sfx: function (name) { if (SFX[name]) SFX[name](); }
  };
  A.Voice = {
    say: say, stop: stop, text: textOf, log: LOG,
    // say the allowed pieces of [[parts, kind], ...] in one go (e.g. a miss: 'Oops' (chatter) + the fact (answer))
    sayMix: function (list, opts) {
      var parts = Talk.pick(list), all = list.reduce(function (a, x) { return x && x[0] ? a.concat(x[0]) : a; }, []);
      if (parts.length < all.length) { LOG.push({ kind: 'mix', said: false, text: textOf(all.filter(function (x) { return parts.indexOf(x) < 0; })) });
        if ((!opts || opts.bubble !== false) && A.UI && A.UI.friendBubble && !A.Voice.ownBubble) A.UI.friendBubble(textOf(all)); }
      if (!parts.length) return Promise.resolve(); var o = {}; for (var k in (opts || {})) o[k] = opts[k]; o.picked = true; o.kind = list.filter(function (x) { return Talk.allows(x[1]); }).map(function (x) { return x[1]; }).join('+'); return A.Voice.say(parts, o); }, norm: norm, srcFor: srcFor, sourceOf: sourceOf, plan: plan, last: {},
    hasSpeech: hasSpeech, canSayNames: canSayNames, name: nameOf, named: function (withName, without) { return canSayNames() ? withName : without; }, isSpeaking: function () { return speaking; },
    voiceName: function () { return VOICE ? VOICE.name : (hasSpeech ? 'default voice' : 'none'); },
    fileFor: fileFor, fileUrl: fileUrl, ttsFor: ttsFor, ttsUrl: ttsUrl, hasPhrase: hasPhrase, manifest: manifest, tts: TTS, scanFiles: scanFiles,
    scannedCount: function () { return Object.keys(scanned).length; },
    manifestCount: function () { return Object.keys(manifest.files || {}).length; },
    ttsCount: function () { return Object.keys(TTS.files || {}).length; },
    phraseCount: function () { return (TTS.phrases || []).length; },
    playClip: function (id) { stop(); var tok = TOK; return srcFor(id).then(function (u) { return u ? playUrl(u, tok) : false; }); },
    playUrl: function (u) { stop(); return playUrl(u, TOK); },
    playBlob: function (blob) { stop(); var tok = TOK, u = URL.createObjectURL(blob); return playUrl(u, tok).then(function (ok) { URL.revokeObjectURL(u); return ok; }); }
  };
  A.Clips = Clips;
})(window.Arcade);
