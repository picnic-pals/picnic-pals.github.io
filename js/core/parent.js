/* Blob Arcade — grown-up area: progress dashboard, skill override, voice recorder, settings, players. */
(function (A) {
  'use strict';
  var P = A.Parent = {}, ov = null, st = { tab: 'progress', kid: null, opts: {}, changed: false, filter: 'all' };
  var C = function () { return A.Curriculum; };
  function save() { A.Store.save(); st.changed = true; }
  function kidAv(p) { return '<span class="av">' + A.Blobs.forProfile(p, { expr: 'idle' }) + '</span>'; }
  function pct(x) { return x == null ? '—' : Math.round(x * 100) + '%'; }

  P.open = function (opts) {
    st.opts = opts || {}; st.changed = false;
    if (!ov) build();
    var act = A.Store.active(); if (!st.kid || !A.Store.get(st.kid)) st.kid = act ? act.id : (A.Store.profiles()[0] || {}).id;
    if (st.opts.tab) st.tab = st.opts.tab;
    ov.classList.add('on'); render();
    A.Voice.stop();
  };
  P.close = function () {
    stopMic(); ov.classList.remove('on'); A.Store.save();
    if (st.opts.onClose) st.opts.onClose(st.changed);
  };
  P.isOpen = function () { return !!(ov && ov.classList.contains('on')); };

  function build() {
    ov = A.el('<div class="overlay" id="parent" role="dialog" aria-modal="true" aria-label="Grown-up area"><div class="panel"><header><h2>Grown-up area</h2>' +
      '<nav class="tabs"><button data-t="progress">Progress</button><button data-t="voice">Voice recorder</button><button data-t="settings">Settings</button><button data-t="players">Players</button></nav>' +
      '<button class="close">Done</button></header><div class="body"></div></div></div>');
    document.body.appendChild(ov);
    ov.querySelector('.close').addEventListener('click', P.close);
    A.$$('.tabs button', ov).forEach(function (b) { b.addEventListener('click', function () { st.tab = b.dataset.t; stopMic(); render(); }); });
    ov.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); P.close(); } e.stopPropagation(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && P.isOpen() && !A.$('#gate') && !ov.contains(e.target)) { e.preventDefault(); e.stopPropagation(); P.close(); } }, true);
    A.on('clips:changed', function () { if (P.isOpen() && st.tab === 'voice') renderVoiceCounts(); });
  }
  function body() { return ov.querySelector('.body'); }
  function render() {
    A.$$('.tabs button', ov).forEach(function (b) { b.classList.toggle('on', b.dataset.t === st.tab); });
    var b = body(); b.scrollTop = 0;
    ({ progress: renderProgress, voice: renderVoice, settings: renderSettings, players: renderPlayers })[st.tab](b);
  }

  /* ================= PROGRESS ================= */
  function renderProgress(b) {
    var kids = A.Store.profiles(), p = A.Store.get(st.kid) || kids[0];
    if (!p) { b.innerHTML = '<p class="muted">No players yet. Add one in the Players tab.</p>'; return; }
    st.kid = p.id; C().ensure(p);
    var h = '<div class="kids">' + kids.map(function (k) { return '<button data-kid="' + k.id + '" class="' + (k.id === p.id ? 'on' : '') + '">' + kidAv(k) + A.esc(k.name) + '</button>'; }).join('') + '</div>';
    var nStk = Object.keys(p.stickers).length, cur = C().byId[p.math.current], cs = p.skills[p.math.current];
    h += '<div class="sum">' +
      '<div><b>⭐ ' + p.stars + '</b><span>stars earned</span></div>' +
      '<div><b>' + p.games.munch.rounds + '</b><span>Munch rounds</span></div>' +
      '<div><b>' + (p.games.baseball.games || 0) + '</b><span>baseball games · best ' + (p.games.baseball.best || 0) + ' runs</span></div>' +
      '<div><b>' + A.fmtTime(p.time.total) + '</b><span>time played</span></div>' +
      '<div><b>' + nStk + ' / ' + A.Rewards.STICKERS.length + '</b><span>stickers</span></div>' +
      '<div><b>' + Object.keys(p.days).length + '</b><span>days played</span></div>' +
      '<div><b>' + A.ago(p.lastPlayed) + '</b><span>last played</span></div></div>';
    h += '<div class="mixbox exportbox"><b>Progress snapshot</b> <button class="sbtn pri" data-exp="copy">📋 Copy progress summary</button> <button class="sbtn" data-exp="json">⬇ Download .json</button>' +
      ' <label class="anon"><input type="checkbox" data-anon' + (st.anon ? ' checked' : '') + '> Use “Player 1” instead of the name</label>' +
      '<small class="muted">Plain-text summary (status, accuracy, items seen, last practiced, next review, most-missed items, mistakes we spotted, weekly goal, time played). For a teacher or tutor.</small><pre class="exp-out" hidden></pre></div>';
    // subject mix (Free Play, 2 Players, Baseball, bonus questions) + one table per subject
    var W = C().mixWeights(p), SUBJ = C().SUBJECTS.filter(function (x) { return C().list(x.id).length; });
    var mixTxt = SUBJ.filter(function (x) { return W[x.id]; }).map(function (x) { return Math.round(W[x.id] * 100) + '% ' + x.name; }).join(' · ');
    h += '<div class="mixbox"><label><b>Subject mix</b> <select data-mix aria-label="Subject mix"><option value="mixed"' + (p.mix === 'mixed' || !p.mix ? ' selected' : '') + '>Mixed (by age)</option>' +
      SUBJ.map(function (x) { return '<option value="' + x.id + '"' + (p.mix === x.id ? ' selected' : '') + '>Only ' + x.name + '</option>'; }).join('') + '</select></label>' +
      '<p class="muted">Free Play, 2 Players, ' + A.TITLES.baseball + ' and bonus questions: <b data-mixtxt>' + mixTxt + '</b>. Mixed: age 3 and under gets about 40% Early Concepts, 30% letters &amp; sounds, 30% math; age 4 about 45% math, 40% reading, 15% Early Concepts; age 5 about 50% math, 45% reading, 5% Early Concepts; age 6 and up about 60% math, 30% reading, 10% Early Concepts. Story mode keeps its own areas (Letter Lagoon and Word Woods have the reading skills).</p></div>';
    if (A.Levels) {   // per-subject start level (grade); changing it moves that ladder's start, adaptive up / down from there
      h += '<div class="mixbox lvbox"><b>Levels</b> ' + SUBJ.map(function (x) {
        var cur = (p.levels && p.levels[x.id]) || 'auto', opts = [['auto', 'Auto (by age: ' + A.Levels.autoName(p, x.id) + ')']].concat(A.Levels.GRADES).concat(x.id === 'concepts' ? [['off', 'Off']] : []);
        return '<label class="lvsel">' + x.name + ' <select data-sublvl="' + x.id + '" aria-label="' + x.name + ' level">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === cur ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>' +
          (A.Levels.soon(p, x.id) ? ' <small class="soon" data-soon="' + x.id + '">starts at the top skill · more coming soon</small>' : '') + '</label>';
      }).join(' ') + '<p class="muted">Sets where each subject starts (earlier skills count as placed). <b>Auto</b> starts by age: 2–3 at counting to 3 and big letters; 4 at counting to 10 and beginning sounds; 5 at counting to 20 and first sight words; 6 at adding to 10 and short-vowel words; 7 at doubles and homophones; 8+ at doubles and prefixes &amp; suffixes. A short warm-up (a few questions, it stops at the first miss) then moves the start up. Skills stay in the grade band for the age unless you pick a grade here. Too easy or too hard? The game still moves up and down on its own.</p></div>';
    }
    h += '<p class="muted">Each subject is its own ladder. A skill is <b>mastered</b> after 2 rounds of 80%+ at its top level; then the next skill in that subject unlocks. Every 4th round of a subject is a quick review of a mastered skill. In ' + A.TITLES.baseball + ' each half-inning counts as one round.</p>';
    h += '<div class="togs" style="margin-bottom:12px">' +
      tog('pin', 'Stay on the chosen skill', 'Turns off automatic moving to new skills (levels still adjust).', p.math.pin) +
      (A.ReadAloud ? tog('readstories', 'Read stories aloud', 'Reading stories: read the story out loud by itself. Auto: on for age 5 and under, off for 6+ (they read it, and only the question is spoken). The 🔊 button always reads it.', A.ReadAloud.on(p)) : '') +
      tog('grumbly', 'Grumbly in ' + A.TITLES.munch, 'A slow, gentle cloud that wanders and bumps the player back to the corner. Extra challenge.', p.games.munch.grumbly) + '</div>';
    SUBJ.forEach(function (x) {
      var T = C().track(p, x.id), cur = C().byId[T.current], cs = p.skills[T.current];
      h += '<section class="subj" data-subj="' + x.id + '"><h3>' + x.emoji + ' ' + x.name + (W[x.id] ? ' <small class="muted">' + Math.round(W[x.id] * 100) + '% of rounds</small>' : ' <small class="muted">off in the mix</small>') + '</h3>' +
        (x.id === 'math' ? '<p class="muted"><label>Now practicing: <select data-step="math">' + C().SKILLS.filter(function (s) { return C().subjectOf(s) === 'math' && s.status === 'active'; }).map(function (s) { return '<option value="' + s.id + '"' + (s.id === T.current ? ' selected' : '') + '>' + A.esc(s.name) + '</option>'; }).join('') + '</select></label> <small>pick the step to work on</small>'   // v2p2b: math is steps; a grown-up picks the step, not a level
        : '<p class="muted">Now practicing: <b>' + A.esc(cur.name) + '</b> — level ' + (cs.level + 1) + ' of ' + cur.levels.length + ' (' + A.esc(cur.levels[cs.level]) + ')') +
        (T.returnTo ? ' · short review detour, then back to <b>' + A.esc(C().byId[T.returnTo].name) + '</b>' : '') + '</p>';
      h += '<table><thead><tr><th>Skill</th><th>Status</th><th>' + (x.id === 'math' ? 'Step' : 'Level') + '</th><th>Accuracy</th><th class="hide-sm">Answers</th><th>Recent rounds</th><th class="hide-sm">Time</th><th>Set</th></tr></thead><tbody>';
      C().SKILLS.forEach(function (s) { if (C().subjectOf(s) === x.id) h += skillRow(p, s); });
      h += '</tbody></table></section>';
    });
    h += '<h3>Sight words</h3><p class="muted">The Dolch Pre-Primer words are now the “Sight words” skill in Reading &amp; Words (' + A.TITLES.munch + ', Baseball, Letter Lagoon). Word lists: ' + A.SightWords.lists.map(function (l) { return l.name + ' (' + l.words.length + ' words)'; }).join(', ') + '.</p>';
    b.innerHTML = h;
    A.$$('[data-kid]', b).forEach(function (x) { x.addEventListener('click', function () { st.kid = x.dataset.kid; render(); }); });
    var an = b.querySelector('[data-anon]'); if (an) an.addEventListener('change', function () { st.anon = an.checked; });
    A.$$('[data-exp]', b).forEach(function (x) { x.addEventListener('click', function () { exportProgress(p, x.dataset.exp, b); }); });
    A.$$('[data-cur]', b).forEach(function (x) { x.addEventListener('click', function () { C().setCurrent(p, x.dataset.cur); save(); render(); A.UI.toast(p.name + ' will practice ' + C().byId[x.dataset.cur].name + ' next.'); }); });
    A.$$('[data-mast]', b).forEach(function (x) { x.addEventListener('click', function () { C().markMastered(p, x.dataset.mast); save(); render(); }); });
    A.$$('[data-reset]', b).forEach(function (x) { x.addEventListener('click', function () { if (x.dataset.armed) { C().resetSkill(p, x.dataset.reset); save(); render(); } else { x.dataset.armed = 1; x.textContent = 'Tap again'; x.classList.add('red'); } }); });
    A.$$('[data-sublvl]', b).forEach(function (x) { x.addEventListener('change', function () { A.Levels.set(p, x.dataset.sublvl, x.value); save(); render(); A.UI.toast(p.name + ': ' + x.options[x.selectedIndex].text); }); });
    A.$$('[data-mix]', b).forEach(function (x) { x.addEventListener('change', function () { p.mix = x.value; p.mixCredit = {}; save(); render(); A.UI.toast(p.name + ': ' + x.options[x.selectedIndex].text); }); });
    A.$$('[data-step]', b).forEach(function (x) { x.addEventListener('change', function () { C().setCurrent(p, x.value); save(); render(); A.UI.toast(p.name + ' will practice ' + C().byId[x.value].name + ' next.'); }); });
    A.$$('[data-lvl]', b).forEach(function (x) { x.addEventListener('change', function () { C().setCurrent(p, x.dataset.lvl, +x.value); save(); render(); }); });
    A.$$('.tog', b).forEach(function (t) { t.addEventListener('click', function () {
      if (t.dataset.k === 'pin') p.math.pin = !p.math.pin; else if (t.dataset.k === 'grumbly') p.games.munch.grumbly = !p.games.munch.grumbly;
      else if (t.dataset.k === 'readstories') A.ReadAloud.set(p, !A.ReadAloud.on(p));
      save(); t.classList.toggle('on');
    }); });
  }
  // the grown-up progress snapshot: copy as plain text, or download as .json (coach.js progressSummary / progressText)
  function exportProgress(p, how, b) {
    var opt = { anon: !!st.anon }, out = b.querySelector('.exp-out');
    if (how === 'json') {
      var o = A.Coach.progressSummary(p, opt), txt = JSON.stringify(o, null, 2), fn = 'progress-' + (opt.anon ? 'player-1' : String(p.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')) + '-' + o.exported.slice(0, 10) + '.json';
      P.lastExport = { kind: 'json', name: fn, text: txt };
      try { var url = URL.createObjectURL(new Blob([txt], { type: 'application/json' })), a = document.createElement('a'); a.href = url; a.download = fn; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 4000); } catch (e) {}
      A.UI.toast('Downloaded ' + fn); return;
    }
    var t = A.Coach.progressText(p, opt); P.lastExport = { kind: 'text', text: t };
    out.textContent = t; out.hidden = false;
    var done = function () { A.UI.toast('Progress summary copied'); }, fallback = function () { try { var r = document.createRange(); r.selectNodeContents(out); var sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); document.execCommand('copy'); } catch (e) {} A.UI.toast('Summary shown below — select it and copy'); };
    try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, fallback); else fallback(); } catch (e) { fallback(); }
  }
  function skillRow(p, s) {
    var m = C().summary(p, s.id), h = '';
    if (s.status !== 'active') return '<tr class="later"><td><b>' + A.esc(s.name) + '</b><br><small>' + A.esc(s.short) + ' · ' + s.std + '</small></td><td><span class="st later">Later (grade ' + s.grade + ')</span></td><td colspan="6"><small>' + s.levels.map(A.esc).join(' → ') + '</small></td></tr>';
    var spark = '<span class="sparkbars" title="Last rounds (green = 80%+)">' + m.recent.map(function (a) { return '<i class="' + (a >= .8 ? 'g' : a >= .55 ? 'y' : 'r') + '" style="height:' + Math.max(4, Math.round(a * 24)) + 'px"></i>'; }).join('') + '</span>' +
      (m.trend ? ' ' + ({ up: '↗', down: '↘', flat: '→' })[m.trend] : '') + (m.recent.length ? '' : '<small class="muted">—</small>');
    var lvlSel = C().subjectOf(s) === 'math' && s.levels.length < 2 ? (m.current ? '<small>▶ this step</small>' : '<small class="muted">—</small>') : '<select data-lvl="' + s.id + '">' + s.levels.map(function (L, i) { return '<option value="' + i + '"' + (i === m.level ? ' selected' : '') + '>' + (i + 1) + ': ' + A.esc(L) + '</option>'; }).join('') + '</select>';
    h += '<tr class="' + (m.current ? 'cur' : '') + '" data-skill="' + s.id + '"><td><b>' + A.esc(s.name) + '</b>' + (m.current ? ' <small>▶ now</small>' : '') + '<br><small class="muted">' + A.esc(s.short) + ' · ' + s.std + '</small></td>' +
      '<td><span class="st ' + m.cls + '">' + m.label + '</span>' + coachInfo(m) + '</td><td>' + lvlSel + '</td><td>' + pct(m.acc) + '</td><td class="hide-sm">' + m.attempts + '</td><td>' + spark + '</td><td class="hide-sm">' + A.fmtTime(m.timeMs) + '</td>' +
      '<td><div class="act">' + (m.current ? '' : '<button class="sbtn pri" data-cur="' + s.id + '">Practice this</button>') +
      (m.cls === 'mastered' ? '<button class="sbtn" data-reset="' + s.id + '" title="Clear this skill\'s progress">Reset</button>' : '<button class="sbtn" data-mast="' + s.id + '">Mark mastered</button>') + '</div></td></tr>';
    return h;
  }
  // mastery coaching details under the status: last practiced, next spaced review, most-missed items, what mastery still needs
  function shortDate(t) { if (!t) return '—'; var d = new Date(t), n = new Date(); var same = d.toDateString() === n.toDateString(); return same ? 'today' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }
  function coachInfo(m) {
    if (!m.attempts && !m.lastPracticed) return '';
    var h = '<div class="coach"><small>Last: ' + shortDate(m.lastPracticed) + (m.cls === 'review' ? ' · Next review: <b>now</b>' : m.nextReview ? ' · Next review: ' + (m.nextReview <= Date.now() ? '<b>due</b>' : shortDate(m.nextReview)) : '') + '</small>';
    if (m.missed && m.missed.length) h += '<small class="missed">Most missed: ' + m.missed.map(function (x) { return '<b>' + A.esc(x.k.replace(/^rc_(\d)_(\d+)$/, function (_, L, i) { return 'story ' + (+L + 1) + '.' + (+i + 1); }).replace(/^hom_(\d+)$/, 'sentence $1')) + '</b> ×' + x.m; }).join(', ') + '</small>';
    if (m.cls === 'practicing' && m.ready && !m.ready.ok) h += '<small class="muted" title="' + A.esc(m.rule) + '">To master: ' + A.esc(m.ready.why.join('; ')) + '</small>';
    return h + '</div>';
  }
  function tog(k, label, small, on) { return '<button class="tog' + (on ? ' on' : '') + '" data-k="' + k + '"><span>' + label + (small ? '<small>' + small + '</small>' : '') + '</span><span class="sw"></span></button>'; }

  /* ================= VOICE RECORDER ================= */
  var mic = { stream: null, rec: null, id: null, chunks: [], t0: 0, timer: null, err: null };
  function micSupported() { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder); }
  function stopMic() {
    if (mic.rec && mic.rec.state !== 'inactive') { mic.cancel = true; try { mic.rec.stop(); } catch (e) {} }
    if (mic.stream) { mic.stream.getTracks().forEach(function (t) { t.stop(); }); }
    clearInterval(mic.timer); mic.stream = null; mic.rec = null; mic.id = null;
  }
  function extFor(type) { type = type || ''; return /webm/.test(type) ? 'webm' : /ogg/.test(type) ? 'ogg' : /mp4|m4a|aac/.test(type) ? 'm4a' : /mpeg|mp3/.test(type) ? 'mp3' : /wav/.test(type) ? 'wav' : 'webm'; }
  var MIME = { mp3: 'audio/mpeg', m4a: 'audio/mp4', mp4: 'audio/mp4', aac: 'audio/aac', wav: 'audio/wav', webm: 'audio/webm', ogg: 'audio/ogg', oga: 'audio/ogg' };

  // where a line's voice comes from: 'rec' (your voice, recorded here), 'file' (your voice, audio/voice/), 'tts' (built-in clip), 'none' (computer voice)
  function lineState(id) {
    var S = A.Store.settings;
    if (S.recorded !== false && A.Clips.has(id)) return 'rec';
    if (S.recorded !== false && A.Voice.fileFor(id)) return 'file';
    if (S.ttsClips !== false && A.Voice.ttsFor(id)) return 'tts';
    return 'none';
  }
  function isOwn(x) { return x === 'rec' || x === 'file'; }
  var SRC_LABEL = { rec: 'your voice', file: 'your voice', tts: 'built-in clip', none: 'computer voice' };
  var SRC_TITLE = { rec: 'Your voice: recorded here (saved in this browser)', file: 'Your voice: a file in audio/voice/', tts: 'Built-in clip: computer-generated (audio/voice-tts/). Record it to replace it with your voice.', none: 'Computer voice: the browser’s speech voice' };
  function renderVoice(b) {
    var V = A.VoiceLines, h = '';
    h += '<p class="muted">Every line the games say has an ID. For each line the game plays the first of: ' +
      '<span class="src rec">your voice</span> a recording made here (saved on this device only) or a file named <code>&lt;ID&gt;.m4a</code> (or .mp3, .wav, .webm) in the <code>audio/voice/</code> folder · ' +
      '<span class="src tts">built-in clip</span> a computer-generated clip that ships with the arcade (<code>audio/voice-tts/</code>) · ' +
      '<span class="src none">computer voice</span> the browser’s speech voice (' + A.esc(A.Voice.voiceName()) + '). ' +
      'Your recordings always win: record a line (or drop a file in <code>audio/voice/</code>) and it replaces the built-in clip. ' +
      'Sentences are built from parts, e.g. <i>“Munch the ones that make”</i> + <i>“7”</i>. A sentence plays in your voice once every part is recorded; until then it uses the built-in clips, so one sentence never jumps between voices (see Settings to mix).</p>';
    h += '<div id="vcounts"></div>';
    h += '<div class="bar"><button class="sbtn pri" data-v="export">⬇ Export recordings (.zip)</button><label class="sbtn" style="cursor:pointer">⬆ Import .zip or audio files<input type="file" data-v="import" multiple accept=".zip,audio/*,.m4a,.mp3,.wav,.webm,.ogg" hidden></label>' +
      '<button class="sbtn" data-v="scan">🔎 Scan audio/voice folder</button><button class="sbtn" data-v="filter">' + (st.filter === 'todo' ? 'Show all lines' : 'Show only lines not in your voice') + '</button><button class="sbtn red" data-v="clear">Delete all recordings here</button></div>';
    var micMsg = '';
    if (!micSupported()) micMsg = 'Recording is not available in this browser' + (window.isSecureContext === false ? ' because the page is not opened from a secure address (use https:// or http://localhost, or open the file directly in Chrome)' : '') + '. You can still record on a phone and import the files, or drop them in <code>audio/voice/</code>.';
    else if (mic.err) micMsg = mic.err;
    h += '<div class="note' + (micMsg ? ' err' : '') + '" id="micnote">' + (micMsg || 'Tip: press <b>● Record</b>, say the line cheerfully, then press <b>■ Stop</b> (it also stops by itself after 12 seconds). It plays back so you can check it. Quiet room, phone-distance from the mic.') + '</div>';
    h += '<p class="muted">Recording on your phone instead? Name each file exactly as shown (for example <code>munch_rule_make.m4a</code>), then either import them here or put them in the <code>audio/voice/</code> folder of the website and run <code>tools/make-voice-manifest</code>. The full list is in <code>RECORDING_SCRIPT.md</code>.</p>';
    V.sections.forEach(function (s, si) {
      var rows = s.lines.filter(function (l) { return st.filter !== 'todo' || !isOwn(lineState(l.id)); });
      if (!rows.length) return;
      h += '<details data-sec="' + s.id + '"' + (si === 0 ? ' open' : '') + '><summary><span class="when ' + s.when + '">' + (s.when === 'now' ? 'needed now' : 'later') + '</span>' + A.esc(s.title) + '<span class="cnt" data-cnt="' + s.id + '"></span></summary><div class="lines">' +
        (s.note ? '<p class="muted" style="margin:4px 6px 8px">' + A.esc(s.note) + '</p>' : '') +
        rows.map(function (l) {
          return '<div class="line" data-id="' + l.id + '"><span class="src"></span><code>' + l.id + '.m4a</code><span class="tx">' + A.esc(l.text) + (l.note ? '<small>' + A.esc(l.note) + '</small>' : '') + '</span>' +
            '<span class="act"><button class="sbtn rec" data-rec="' + l.id + '">● Record</button><button class="sbtn" data-play="' + l.id + '">▶ Play</button><button class="sbtn" data-playtts="' + l.id + '" title="Hear the built-in clip">▶ Built-in</button><button class="sbtn red" data-del="' + l.id + '" title="Delete this recording">✕</button></span></div>';
        }).join('') + '</div></details>';
    });
    b.innerHTML = h;
    renderVoiceCounts();
    b.querySelector('[data-v=export]').addEventListener('click', exportZip);
    b.querySelector('[data-v=import]').addEventListener('change', function (e) { importFiles(Array.from(e.target.files || [])); e.target.value = ''; });
    b.querySelector('[data-v=filter]').addEventListener('click', function () { st.filter = st.filter === 'todo' ? 'all' : 'todo'; render(); });
    b.querySelector('[data-v=scan]').addEventListener('click', function (e) {
      var btn = e.currentTarget; btn.disabled = true;
      A.Voice.scanFiles(function (i, n, f) { btn.textContent = 'Scanning… ' + i + '/' + n + ' (' + f + ' found)'; }).then(function (found) {
        btn.disabled = false; btn.textContent = '🔎 Scan audio/voice folder'; A.UI.toast('Found ' + Object.keys(found).length + ' voice files in audio/voice/'); renderVoiceCounts();
      });
    });
    b.querySelector('[data-v=clear]').addEventListener('click', function (e) {
      var x = e.currentTarget; if (!x.dataset.armed) { x.dataset.armed = 1; x.textContent = 'Tap again to delete ALL recordings on this device'; return; }
      A.Clips.clear().then(function () { A.UI.toast('All recordings on this device deleted.'); render(); });
    });
    A.$$('[data-rec]', b).forEach(function (x) { x.addEventListener('click', function () { toggleRecord(x.dataset.rec, x); }); });
    A.$$('[data-play]', b).forEach(function (x) { x.addEventListener('click', function () {
      var id = x.dataset.play;
      A.Voice.playClip(id).then(function (ok) { if (!ok) A.Voice.say([id], { force: true }); });
    }); });
    A.$$('[data-playtts]', b).forEach(function (x) { x.addEventListener('click', function () { var f = A.Voice.ttsFor(x.dataset.playtts); if (f) A.Voice.playUrl(A.Voice.ttsUrl(f)); }); });
    A.$$('[data-del]', b).forEach(function (x) { x.addEventListener('click', function () {
      if (!x.dataset.armed) { x.dataset.armed = 1; x.textContent = 'Delete?'; setTimeout(function () { delete x.dataset.armed; x.textContent = '✕'; }, 2500); return; }
      A.Clips.del(x.dataset.del);
    }); });
  }
  function renderVoiceCounts() {
    var b = body(), V = A.VoiceLines; if (!b.querySelector('#vcounts')) return;
    var tot = 0, done = 0, nowT = 0, nowD = 0, rec = 0, files = 0, tts = 0, none = 0;
    V.sections.forEach(function (s) {
      var d = 0, t = 0;
      s.lines.forEach(function (l) { var x = lineState(l.id); if (isOwn(x)) d++; if (x === 'rec') rec++; if (x === 'file') files++; if (x === 'tts') { tts++; t++; } if (x === 'none') none++; });
      tot += s.lines.length; done += d; if (s.when === 'now') { nowT += s.lines.length; nowD += d; }
      var c = b.querySelector('[data-cnt="' + s.id + '"]'); if (c) c.textContent = d + ' of ' + s.lines.length + ' in your voice' + (t ? ' · ' + t + ' built-in' : '');
    });
    b.querySelector('#vcounts').innerHTML = '<b>' + nowD + ' of ' + nowT + '</b> “needed now” lines in your voice &nbsp;·&nbsp; ' + done + ' of ' + tot + ' total' +
      ' <span class="muted">(' + rec + ' recorded here, ' + files + ' files in audio/voice/)</span><div class="prog"><i style="width:' + (nowT ? Math.round(100 * nowD / nowT) : 0) + '%"></i></div>' +
      '<div class="muted srcsum"><span class="src rec">your voice</span> ' + done + ' &nbsp; <span class="src tts">built-in clip</span> ' + tts + (A.Voice.phraseCount() && A.Store.settings.ttsClips !== false ? ' (+ ' + A.Voice.phraseCount() + ' whole-sentence clips)' : '') + ' &nbsp; <span class="src none">computer voice</span> ' + none + '</div>';
    A.$$('.line', b).forEach(function (row) {
      var id = row.dataset.id, x = lineState(id), src = row.querySelector('.src');
      src.className = 'src ' + x; src.textContent = SRC_LABEL[x]; src.title = SRC_TITLE[x]; row.dataset.src = x;
      var rb = row.querySelector('[data-rec]'); if (mic.id !== id) rb.textContent = x === 'rec' ? '● Re-record' : '● Record';
      row.querySelector('[data-del]').style.visibility = x === 'rec' ? 'visible' : 'hidden';
      row.querySelector('[data-playtts]').style.display = isOwn(x) && A.Voice.ttsFor(id) ? '' : 'none';
      rb.disabled = !micSupported();
    });
  }
  function setMicNote(msg, err) { var n = body().querySelector('#micnote'); if (n) { n.innerHTML = msg; n.classList.toggle('err', !!err); } }
  function toggleRecord(id, btn) {
    if (mic.rec && mic.rec.state === 'recording') { var was = mic.id; mic.rec.stop(); if (was === id) return; }
    if (!micSupported()) return;
    var getStream = mic.stream ? Promise.resolve(mic.stream) : navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    getStream.then(function (stream) {
      mic.stream = stream; mic.err = null;
      var type = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].filter(function (t) { try { return MediaRecorder.isTypeSupported(t); } catch (e) { return false; } })[0];
      var rec = type ? new MediaRecorder(stream, { mimeType: type }) : new MediaRecorder(stream);
      mic.rec = rec; mic.id = id; mic.chunks = []; mic.cancel = false; mic.t0 = Date.now();
      rec.ondataavailable = function (e) { if (e.data && e.data.size) mic.chunks.push(e.data); };
      rec.onstop = function () {
        clearInterval(mic.timer); var cancelled = mic.cancel, chunks = mic.chunks, ms = Date.now() - mic.t0, rid = mic.id; mic.id = null;
        A.$$('[data-rec]', body()).forEach(function (x) { x.classList.remove('live'); x.disabled = false; });
        if (cancelled || !chunks.length) { renderVoiceCounts(); return; }
        var blob = new Blob(chunks, { type: rec.mimeType || type || 'audio/webm' });
        A.Clips.put(rid, blob, { ms: ms }).then(function () { setMicNote('Saved <b>' + rid + '</b> (' + (ms / 1000).toFixed(1) + 's). Playing it back…'); A.Voice.playBlob(blob); })
          .catch(function (e) { setMicNote('Could not save the recording: ' + A.esc(e.message || e), true); });
      };
      rec.start();
      A.$$('[data-rec]', body()).forEach(function (x) { x.disabled = x !== btn; });
      btn.classList.add('live');
      var line = A.VoiceLines.byId[id];
      setMicNote('🔴 Recording <b>' + id + '</b>: say “<b>' + A.esc(line.text) + '</b>” — then press Stop.');
      mic.timer = setInterval(function () { var s = Math.floor((Date.now() - mic.t0) / 1000); btn.textContent = '■ Stop (' + s + 's)'; if (s >= 12 && rec.state === 'recording') rec.stop(); }, 250);
      btn.textContent = '■ Stop (0s)';
    }).catch(function (e) {
      mic.err = 'Microphone not available: ' + A.esc((e && (e.message || e.name)) || 'permission denied') + '. Check the browser’s microphone permission for this page, or record on your phone and import the files.';
      setMicNote(mic.err, true);
    });
  }
  function exportZip() {
    A.Clips.all().then(function (recs) {
      if (!recs || !recs.length) { A.UI.toast('No recordings on this device yet.'); return; }
      var files = recs.map(function (r) { return { name: r.id + '.' + extFor(r.type), data: r.blob }; });
      files.push({ name: 'README.txt', data: 'Picnic Pals voice recordings (' + recs.length + ' files), exported ' + new Date().toString() + '.\r\nImport this zip in the grown-up area (Voice recorder > Import) on another device,\r\nor unzip the files into the website folder audio/voice/ and run tools/make-voice-manifest.\r\n' });
      return A.Zip.make(files).then(function (zip) {
        var a = document.createElement('a'); a.href = URL.createObjectURL(zip); a.download = 'picnic-pals-voice-' + A.today() + '.zip';
        document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
        A.UI.toast('Exported ' + recs.length + ' recordings.');
      });
    }).catch(function (e) { A.UI.toast('Export failed: ' + (e.message || e)); });
  }
  function importFiles(list) {
    var entries = [], skipped = [], jobs = list.map(function (f) {
      if (/\.zip$/i.test(f.name)) return A.Zip.read(f).then(function (es) { es.forEach(function (e) { if (e.error) skipped.push(e.name + ' (' + e.error + ')'); else entries.push(e); }); }).catch(function (e) { skipped.push(f.name + ' (' + e.message + ')'); });
      entries.push({ name: f.name, data: f }); return Promise.resolve();
    });
    Promise.all(jobs).then(function () {
      var puts = [], n = 0;
      entries.forEach(function (e) {
        var base = e.name.split('/').pop(); if (!base || base[0] === '.' || /__MACOSX/.test(e.name) || /\.txt$/i.test(base)) return;
        var m = base.match(/^(.*)\.([a-z0-9]+)$/i); if (!m) { skipped.push(base); return; }
        var id = m[1].trim().toLowerCase().replace(/[\s-]+/g, '_'), ext = m[2].toLowerCase();
        if (!A.VoiceLines.byId[id] || !MIME[ext]) { skipped.push(base); return; }
        var blob = e.data instanceof Blob ? new Blob([e.data], { type: MIME[ext] }) : new Blob([e.data], { type: MIME[ext] });
        n++; puts.push(A.Clips.put(id, blob));
      });
      return Promise.all(puts).then(function () {
        A.UI.toast('Imported ' + n + ' recording' + (n === 1 ? '' : 's') + (skipped.length ? ' · skipped ' + skipped.length + ' (unknown names)' : '') + '.', 4000);
        if (skipped.length) console.info('Skipped while importing:', skipped);
        render();
      });
    }).catch(function (e) { A.UI.toast('Import failed: ' + (e.message || e)); });
  }

  /* ================= SETTINGS ================= */
  function talkName(m) { return { full: 'Full', toddler: 'Toddler: short questions and names', prompts: 'Prompts only', tap: 'Tap to hear', off: 'Off' }[m] || m; }
  function talkHelp(t) { return { full: 'Talks a lot: questions, cheers, tips.', prompts: 'Reads each question once.', tap: 'Quiet unless your child taps 🔊.', off: 'No voice. Words on screen only.' }[t] || ''; }
  function renderSettings(b) {
    var s = A.Store.settings;
    var kids = A.Store.profiles(), PT = A.PlayTime;
    function slider(k, label, small) { var v = s.muteAll ? 0 : (s[k] == null ? (k === 'musicVol' ? .5 : 1) : s[k]); return '<label class="tog volrow" data-x="' + k + '"><span>' + label + '<small>' + small + '</small></span><input type="range" min="0" max="1" step="0.05" data-vol="' + k + '" value="' + (s[k] == null ? (k === 'musicVol' ? .5 : 1) : s[k]) + '" aria-label="' + label + '"><b class="volpct" data-volpct="' + k + '">' + Math.round(100 * (s[k] == null ? (k === 'musicVol' ? .5 : 1) : s[k])) + '%</b></label>'; }
    b.innerHTML = '<h3>Volume</h3><div class="togs">' +
      tog('muteAll', 'Mute everything', 'Turns off the voice, sound effects and music at once. Your volume levels are kept for later.', !!s.muteAll) +
      slider('voiceVol', 'Voice volume', 'The friendly voice that reads everything out loud.') +
      slider('sfxVol', 'Sound effects volume', 'Pops, chomps and cheers.') +
      slider('musicVol', 'Music volume', 'The background tunes.') +
      '</div><h3>Play time</h3><p class="muted">Set a daily play-time limit for each child. When time is up, the game waits for a natural stopping point (the end of a round), then shows a calm “Great stopping point!” screen. Your child never loses stars or prizes. Only a grown-up can add more time. Play time is counted on this device only and starts fresh each day.</p><div class="togs">' +
      (kids.length ? kids.map(function (k) { var L = PT ? PT.limit(k.id) : 0, used = PT ? Math.floor(PT.used(k.id) / 60000) : 0, ex = PT ? PT.extra(k.id) : 0;
        return '<label class="tog ptrow" data-x="pt"><span>' + A.esc(k.name) + '<small>Played today: ' + used + ' min' + (ex ? ' · extra time added today: ' + ex + ' min' : '') + '</small></span>' +
          '<select data-ptlimit="' + k.id + '" aria-label="Daily play-time limit for ' + A.esc(k.name) + '">' + (PT ? PT.LIMITS : [0]).map(function (m) { return '<option value="' + m + '"' + (m === L ? ' selected' : '') + '>' + (m ? m + ' minutes a day' : 'No limit') + '</option>'; }).join('') + '</select>' +
          '<button class="sbtn" data-ptadd="' + k.id + '" title="Add 15 minutes for today only">+15 min today</button></label>'; }).join('') : '<p class="muted">Add a player first.</p>') +
      tog('breakReminder', 'Stretch-break reminder', 'Every 20 minutes of play, at the end of a round, a friend says “Time for a stretch!” Your child taps OK to keep playing.', !!s.breakReminder) +
      '</div><h3 id="talkHead">How much talking</h3><p class="muted">How much the game talks out loud, for each child. Words always show on screen in a speech bubble. ' +
      '<b>Auto</b> picks by age: children who read (age 6 and up, or Reading level 1st grade and up) get <b>Tap to hear</b>; age 5 and under get <b>Prompts only</b>; toddlers (age 2) hear short questions and the names of things. ' +
      '<b>Full</b>: talks a lot, like before. <b>Prompts only</b>: reads each question once, and the word or number a non-reader needs. ' +
      '<b>Tap to hear</b>: quiet unless your child taps 🔊, taps the question, or presses R (“listen and find” word games still say the word). <b>Off</b>: no voice at all. Sound effects and music follow their own volume.</p><div class="togs">' +
      (kids.length ? kids.map(function (k) { var t = A.Talk.setting(k), eff = A.Talk.mode(k);
        return '<label class="tog talkrow" data-x="talk"><span>' + A.esc(k.name) + '<small data-talknow="' + k.id + '">' + (t === 'auto' ? 'Now: ' + talkName(eff) : talkHelp(t)) + '</small></span>' +
          '<select data-talk="' + k.id + '" aria-label="How much talking for ' + A.esc(k.name) + '">' + A.Talk.MODES.map(function (m) { return '<option value="' + m + '"' + (m === t ? ' selected' : '') + '>' + A.Talk.LABELS[m] + '</option>'; }).join('') + '</select></label>'; }).join('') : '<p class="muted">Add a player first.</p>') +
      '</div><h3>Sound & voice</h3><div class="togs">' +
      tog('sound', 'Sound effects', 'Boops, chomps and cheers.', s.sound) +
      tog('voice', 'Voice (master switch)', 'Off: no voice for anyone. On: each child follows their “How much talking” setting above.', s.voice) +
      tog('recorded', 'Use your recordings', 'Play the lines you recorded in the Voice recorder, when there is one.', s.recorded !== false) +
      tog('ttsClips', 'Use the built-in voice', 'A friendly recorded computer voice that comes with the game. Off: your device’s own reading voice is used instead.', s.ttsClips !== false) +
      tog('mixVoice', 'Mix voices in one sentence', 'Off (recommended): a sentence uses your recordings only when you recorded every part of it, so the voice never switches halfway.', s.mixVoice) +
      '<button class="tog" data-x="rate"><span>Computer voice speed<small>For your device’s own reading voice only.</small></span><select data-rate><option value="0.8">Slow</option><option value="0.9">Normal</option><option value="1">Quick</option></select></button>' +
      '</div><h3>Music & games</h3><div class="togs">' +
      tog('music', 'Music', 'Gentle background tunes. They get quieter whenever the voice is talking. Kids can also turn music off with the 🎵 button or the M key.', s.music !== false) +
      '<button class="tog" data-x="bbclock"><span>' + A.TITLES.baseball + ' shot clock<small>Optional time limit per pitch. Off (default): no clock — answering fast just makes bigger hits. When it runs out it is a strike, and the answer is shown.</small></span><select data-bbclock aria-label="Baseball shot clock"><option value="0">Off</option><option value="30">30 s</option><option value="20">20 s</option><option value="15">15 s</option><option value="10">10 s</option></select></button>' +
      tog('breaks', 'Fun breaks', 'Now and then (about 1 level in 5 or 6), a short silly break between levels: a dance, jokes, peekaboo, coloring and more. 15 to 30 seconds, always skippable, no scores. Off: no breaks.', s.breaks !== false) +
      tog('timer', 'Munch timer', 'A friendly countdown bar in ' + A.TITLES.munch + '. When time runs out the round ends kindly and still earns stars. Each player’s pace is set in Players (Relaxed / Normal / Speedy). Off = no clock, and bonus questions give a star instead of time.', s.timer !== false) +
      tog('padRumble', 'Controller rumble', 'Game controllers: a light buzz for a correct munch and a bigger one for a home run (controllers that support it, in Chrome/Edge). Controllers can play every game but can never open this grown-up area.', s.padRumble !== false) +
      tog('placement', 'Placement check for new skills', 'When a new skill opens, ' + A.TITLES.munch + ' first asks 5 quick questions (“Let’s see what you already know!”). 5 of 5 skips the skill (it still comes back for review), 4 of 5 starts a level higher.', s.placement !== false) +
      '</div><h3>Story problems</h3><div class="togs">' +
      '<label class="tog petset" data-x="pet"><span>Pet name<small>Used in the picnic story problems. Stays on this device only (it is not in save codes or exports). Default: Biscuit. A custom name is read by the browser’s voice.</small></span>' +
      '<span class="petin"><input data-petname maxlength="16" autocomplete="off" spellcheck="false" placeholder="Biscuit" aria-label="Pet name"><select data-pettype aria-label="Pet type"><option value="dog">🐶 Dog</option><option value="cat">🐱 Cat</option><option value="other">🐾 Other</option></select></span></label>' +
      '</div><div class="bar"><button class="sbtn pri" data-test>🔊 Test voice: “Hi, I’m Jammy!”</button></div>' +
      '<h3>Privacy</h3><p class="muted">Everything stays on this device, inside this web browser: progress, play time and your voice recordings. There are no accounts, no ads, no tracking, and nothing is sent over the internet. Clearing this browser’s history and site data erases it, so use Export in the Voice recorder to back up your recordings.</p>' +
      '<h3>Start over</h3><p class="muted">Erases all players and progress on this device (recordings are kept).</p><div class="bar"><button class="sbtn red" data-resetall>Erase all progress</button></div>' +
      '<p class="muted" style="margin-top:24px">Picnic Pals · save version ' + A.Store.SCHEMA + ' · ' + A.VoiceLines.all.length + ' voice lines · ' + C().list('math').length + ' math skills · ' + (C().ACTIVE.length - C().list('math').length) + ' reading & early-concepts skills</p>';
    b.querySelector('[data-rate]').value = String(s.rate || 0.9);
    var pet = s.pet || {}, pn = b.querySelector('[data-petname]'), pt = b.querySelector('[data-pettype]');
    pn.value = pet.name && pet.name !== 'Biscuit' ? pet.name : ''; pt.value = pet.type || 'dog';
    function savePet() { s.pet = { name: String(pn.value || '').replace(/[<>]/g, '').trim().slice(0, 16) || 'Biscuit', type: pt.value }; save(); }
    pn.addEventListener('change', savePet); pn.addEventListener('input', savePet); pt.addEventListener('change', savePet);
    [pn, pt].forEach(function (x) { x.addEventListener('click', function (e) { e.stopPropagation(); }); x.addEventListener('keydown', function (e) { e.stopPropagation(); }); });
    var bc = b.querySelector('[data-bbclock]'); bc.value = String(s.bbClock || 0); bc.addEventListener('change', function (e) { s.bbClock = +e.target.value; save(); }); bc.addEventListener('click', function (e) { e.stopPropagation(); });
    A.$$('[data-vol]', b).forEach(function (mv) {
      var k = mv.dataset.vol;
      mv.addEventListener('input', function (e) { s[k] = +e.target.value; save(); var pc = b.querySelector('[data-volpct="' + k + '"]'); if (pc) pc.textContent = Math.round(100 * s[k]) + '%'; if (k === 'musicVol' && A.Music) A.Music.apply(); });
      mv.addEventListener('change', function () { if (k === 'sfxVol') A.Audio.sfx('pop'); if (k === 'voiceVol') A.Voice.say(['hub_looking_good'], { force: true }); });
      mv.addEventListener('click', function (e) { e.stopPropagation(); }); mv.addEventListener('keydown', function (e) { if (e.key !== 'Escape') e.stopPropagation(); });
    });
    A.$$('[data-talk]', b).forEach(function (x) { x.addEventListener('click', function (e) { e.stopPropagation(); }); x.addEventListener('change', function () {
      var k = A.Store.get(x.dataset.talk); if (!k) return; k.talk = x.value; save(); var eff = A.Talk.mode(k), sm = b.querySelector('[data-talknow="' + k.id + '"]');
      if (sm) sm.textContent = x.value === 'auto' ? 'Now: ' + talkName(eff) : talkHelp(x.value);
      A.UI.toast(k.name + ': ' + A.Talk.LABELS[x.value] + (x.value === 'auto' ? ' (' + talkName(eff) + ')' : '')); }); });
    A.$$('[data-ptlimit]', b).forEach(function (x) { x.addEventListener('click', function (e) { e.stopPropagation(); }); x.addEventListener('change', function () { PT.setLimit(x.dataset.ptlimit, +x.value); var k = A.Store.get(x.dataset.ptlimit); A.UI.toast(k.name + ': ' + x.options[x.selectedIndex].text); }); });
    A.$$('[data-ptadd]', b).forEach(function (x) { x.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); PT.addTime(x.dataset.ptadd, 15); var k = A.Store.get(x.dataset.ptadd); A.UI.toast('+15 minutes today for ' + k.name); render(); }); });
    b.querySelector('[data-rate]').addEventListener('change', function (e) { s.rate = +e.target.value; save(); });
    A.$$('.tog[data-k]', b).forEach(function (t) { t.addEventListener('click', function () {
      var k = t.dataset.k; if (k === 'muteAll' || k === 'breakReminder') { s[k] = !s[k]; save(); t.classList.toggle('on'); if (A.Music) { A.Music.apply(); A.emit('music:changed'); } if (k === 'muteAll') A.Voice.stop(); return; }
      s[k] = (k === 'recorded' || k === 'ttsClips' || k === 'music' || k === 'timer' || k === 'padRumble' || k === 'placement' || k === 'breaks') ? s[k] === false : !s[k]; save(); t.classList.toggle('on'); if (k === 'sound' && s.sound) A.Audio.sfx('tap');
      if (k === 'music' && A.Music) { A.Music.apply(); A.emit('music:changed'); }
    }); });
    b.querySelector('[data-test]').addEventListener('click', function () { A.Voice.say(['hub_im', 'blob_strawberry'], { force: true }); });
    b.querySelector('[data-resetall]').addEventListener('click', function (e) {
      var x = e.currentTarget; if (!x.dataset.armed) { x.dataset.armed = 1; x.textContent = 'Tap again to erase everything'; return; }
      A.Store.resetAll(); st.kid = null; save(); A.UI.toast('All progress erased.'); render();
    });
  }

  /* ---- Move to another device: save code + .json download ---- */
  function showMove(b, p) {
    var box = b.querySelector('#moveBox'), code = A.Store.exportCode(p), json = JSON.stringify(A.Store.exportObj(p));
    var url = URL.createObjectURL(new Blob([json], { type: 'application/json' })), fn = 'picnic-pals-' + p.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.json';
    box.innerHTML = '<h3>📦 Move ' + A.esc(p.name) + ' to another device</h3>' +
      '<p class="muted">On the other device open Grown-ups → Players → “Move a player here”, then paste this code or pick the file. ' +
      '<b>Privacy:</b> the code holds only game progress (stars, skills, stickers, room) and the name the kid typed (“' + A.esc(p.name) + '”). No other personal data, and nothing is sent anywhere.</p>' +
      '<div class="bar"><textarea readonly data-code rows="3" style="flex:1;min-width:260px" aria-label="Save code for ' + A.esc(p.name) + '">' + A.esc(code) + '</textarea></div>' +
      '<div class="bar"><button class="sbtn pri" data-copy>📋 Copy code</button><a class="sbtn" data-dl href="' + url + '" download="' + fn + '">⬇️ Download .json file</a><span class="muted">' + code.length + ' characters</span><button class="sbtn" data-mclose>Close</button></div>';
    box.querySelector('[data-copy]').addEventListener('click', function () { var t = box.querySelector('[data-code]'); t.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} if (navigator.clipboard) navigator.clipboard.writeText(code).catch(function () {}); A.UI.toast(ok || navigator.clipboard ? 'Save code copied!' : 'Select the code and copy it.'); });
    box.querySelector('[data-mclose]').addEventListener('click', function () { box.innerHTML = ''; });
    box.scrollIntoView({ block: 'nearest' }); box.querySelector('[data-copy]').focus();
  }
  /* ================= PLAYERS ================= */
  function renderPlayers(b) {
    var kids = A.Store.profiles();
    var h = '<h3>Players</h3><p class="muted">Kids can make their own player with the big “+ New player” tile. To rename or delete a player, use “🔒 Edit players” on the Who’s playing screen (it asks the grown-up question first; deleting asks again). Friend, backdrop color, hats and held items are in Dress Up (new players start with Jammy, Crisp, Niblet and Bloop; the other friends join one at a time as your child masters new skills, or use “Unlock all characters”. “📦 Move to another device” makes a save code / .json file). Age is optional; it makes the Munch timer and story path friendlier for little ones.</p><div class="players">';
    kids.forEach(function (k) {
      h += '<div class="pl" data-pid="' + k.id + '">' + kidAv(k) + '<input type="text" maxlength="16" value="' + A.esc(k.name) + '" aria-label="Name">' +
        '<select data-blob aria-label="Blob">' + A.Blobs.CAST.map(function (c) { return '<option value="' + c.id + '"' + (c.id === k.blob ? ' selected' : '') + '>' + c.name + '</option>'; }).join('') + '</select>' +
        '<select data-age aria-label="Age">' + [['', 'Age: —'], [2, 'Age 2'], [3, 'Age 3'], [4, 'Age 4'], [5, 'Age 5'], [6, 'Age 6'], [7, 'Age 7'], [8, 'Age 8+']].map(function (o) { return '<option value="' + o[0] + '"' + (String(k.age == null ? '' : Math.min(k.age, 8)) === String(o[0]) ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>' +
        '<select data-toddler aria-label="Toddler mode" title="Toddler mode: Tiny Picnic (big pictures, no wrong answers, no timer) becomes the main game and the school-level games are hidden. Auto: on for age 2.">' + [['auto', 'Toddler mode: Auto (age 2)'], ['on', 'Toddler mode: On'], ['off', 'Toddler mode: Off']].map(function (o) { return '<option value="' + o[0] + '"' + ((k.toddler || 'auto') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>' +
        '<select data-gentle aria-label="Gentle Munch" title="Gentle Munch: no hearts (misses never end the round) and no countdown. Auto: on for age 4 and under.">' + [['auto', 'Gentle Munch: Auto (4 and under)'], ['on', 'Gentle Munch: On'], ['off', 'Gentle Munch: Off (hearts + timer)']].map(function (o) { return '<option value="' + o[0] + '"' + ((k.munchGentle || 'auto') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>' +
        '<select data-pace aria-label="Munch timer pace" title="Munch timer pace. Auto: no countdown at age 5 and under, Normal otherwise. Picking a pace turns the countdown on.">' + [['auto', 'Timer: Auto (off at 5 and under)'], ['relaxed', 'Timer: Relaxed'], ['normal', 'Timer: Normal'], ['speedy', 'Timer: Speedy']].map(function (o) { return '<option value="' + o[0] + '"' + ((k.timerPace || 'auto') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>' +
        '<span class="muted">⭐ ' + k.stars + ' · ' + A.fmtTime(k.time.total) + (k.story && k.story.bestRun ? ' · 🏆 ' + k.story.bestRun : '') + ' · ✦ ' + ((k.wallet && k.wallet.bits) || 0) + ' star bits' + '</span><span style="flex:1"></span>' +
        '<button class="sbtn" data-unlockall title="Make every food friend selectable for this player">' + (A.Blobs.CAST.every(function (c) { return k.unlocks.blobs && k.unlocks.blobs[c.id]; }) ? '✓ All characters' : '🔓 Unlock all characters') + '</button>' +
        '<button class="sbtn" data-bits title="Give this player 10 star bits to spend in the Picnic Spot shop (stars and progress are not changed)">✦ +10 star bits</button><button class="sbtn" data-room title="Empty the Picnic Spot back to the starter spot. Everything bought stays in the kid\'s things box.">🏠 Reset room</button>' + '<button class="sbtn" data-move title="Export this player as a save code or .json file to move to another device">📦 Move to another device</button>' + '<button class="sbtn" data-rp>Reset progress</button><button class="sbtn red" data-del>🗑 Delete player</button></div>';
    });
    h += '</div><div class="movebox" id="moveBox"></div><h3>Move a player here from another device</h3><p class="muted">Paste a save code, or pick a .json save file. You will be asked before anything is replaced.</p>' +
      '<div class="bar"><textarea data-impcode rows="2" placeholder="Paste a save code (starts with BA3.)" aria-label="Save code" style="flex:1;min-width:260px"></textarea><input type="file" accept=".json,application/json" data-impfile aria-label="Save file"><button class="sbtn pri" data-imp>Import</button></div><div class="impmsg" data-impmsg role="status"></div>' +
      '<h3>Add a player</h3><div class="bar"><input type="text" maxlength="16" placeholder="Name (e.g. Player 1)" data-newname><select data-newblob>' + A.Blobs.CAST.map(function (c) { return '<option value="' + c.id + '">' + c.name + '</option>'; }).join('') + '</select>' +
      // "Start at" for each subject (same grades as the per-subject Levels menus above)
      ['math', 'reading'].filter(function (x) { return A.Levels && A.Curriculum.list(x).length; }).map(function (x) { var nm = x === 'math' ? 'Math' : 'Reading';
        return '<select data-newstart="' + x + '" aria-label="' + nm + ' starts at"><option value="auto">' + nm + ' starts at: Auto (by age)</option>' + A.Levels.GRADES.map(function (g) { return '<option value="' + g[0] + '">' + nm + ' starts at: ' + g[1] + (g[0] === 'pk' || g[0] === 'k' ? '' : ' grade') + '</option>'; }).join('') + '</select>'; }).join('') +
      '<button class="sbtn pri" data-add>Add player</button></div>';
    b.innerHTML = h;
    A.$$('.pl', b).forEach(function (row) {
      var id = row.dataset.pid, p = A.Store.get(id);
      row.querySelector('input').addEventListener('change', function (e) { A.Store.rename(id, e.target.value); save(); render(); });
      row.querySelector('[data-blob]').addEventListener('change', function (e) { p.blob = e.target.value; save(); render(); });
      row.querySelector('[data-unlockall]').addEventListener('click', function () { if (A.Story) A.Story.unlockAll(p); else A.Blobs.CAST.forEach(function (c) { p.unlocks.blobs[c.id] = Date.now(); }); save(); A.UI.toast('All characters unlocked for ' + p.name + '.'); render(); });
      row.querySelector('[data-age]').addEventListener('change', function (e) {   // a new age: offer to move the starting point (soft confirm; stars and prizes stay)
        var sel = e.target, age = sel.value === '' ? null : +sel.value, was = p.age;
        if (!A.Levels || !A.Levels.reAge) { p.age = age; save(); return; }
        A.UI.confirm({ title: 'Move ' + p.name + "'s starting point?", sub: 'Age ' + (age == null ? 'not set' : age >= 8 ? '8+' : age) + ' starts at ' + A.Levels.ageText(age) + '. Stars, prizes and skills already learned are kept, and a quick, playful check fine-tunes it.', yes: 'Yes, move it', no: 'Just change the age' })
          .then(function (yes) { if (yes) { A.Levels.reAge(p, age); A.UI.toast(p.name + ' will start at ' + A.Levels.ageText(age) + '.'); } else p.age = age; if (was !== age || yes) save(); render(); });
      });
      row.querySelector('[data-pace]').addEventListener('change', function (e) { p.timerPace = e.target.value; save(); });
      row.querySelector('[data-toddler]').addEventListener('change', function (e) { p.toddler = e.target.value; if (p.toddler === 'auto') delete p.toddler; save(); A.UI.toast(p.name + ': ' + e.target.options[e.target.selectedIndex].text); });
      row.querySelector('[data-gentle]').addEventListener('change', function (e) { p.munchGentle = e.target.value; if (p.munchGentle === 'auto') delete p.munchGentle; save(); });
      row.querySelector('[data-bits]').addEventListener('click', function () { var w = p.wallet || (p.wallet = { bits: 0, earned: 0, spent: 0 }); w.bits += 10; w.granted = (w.granted || 0) + 10; save(); A.UI.toast('✦ +10 star bits for ' + p.name + '!'); render(); });
      row.querySelector('[data-room]').addEventListener('click', function (e) { var x = e.currentTarget; if (!x.dataset.armed) { x.dataset.armed = 1; x.textContent = 'Tap again to reset ' + p.name + '’s room'; x.classList.add('red'); return; } p.room = null; save(); A.UI.toast(p.name + '’s room is back to the starter room. Bought things are in the things box.'); render(); });
      row.querySelector('[data-move]').addEventListener('click', function () { showMove(b, p); });
      row.querySelector('[data-rp]').addEventListener('click', function (e) { var x = e.currentTarget; if (!x.dataset.armed) { x.dataset.armed = 1; x.textContent = 'Tap again to reset ' + p.name; x.classList.add('red'); return; } A.Store.resetProgress(id); save(); render(); });
      row.querySelector('[data-del]').addEventListener('click', function (e) { var x = e.currentTarget; if (!x.dataset.armed) { x.dataset.armed = 1; x.textContent = 'Tap again to delete ' + p.name + ' (can’t be undone)'; return; } A.Store.remove(id); if (st.kid === id) st.kid = null; save(); render(); });
    });
    var msg = b.querySelector('[data-impmsg]');
    function doImport(txt) {
      var r = A.Store.parseSave(txt); msg.className = 'impmsg'; if (!r.ok) { msg.classList.add('bad'); msg.textContent = '⚠️ ' + r.error; return; }
      var np = r.player, old = A.Store.clash(np);
      if (!old) { A.Store.importPlayer(np); save(); A.UI.toast(np.name + ' moved to this device!'); render(); return; }
      msg.innerHTML = 'A player called <b>' + A.esc(old.name) + '</b> is already on this device (⭐ ' + old.stars + '). The save has ⭐ ' + np.stars + '. ' +
        '<button class="sbtn red" data-repl>Replace ' + A.esc(old.name) + '</button> <button class="sbtn" data-asnew>Keep both</button> <button class="sbtn" data-cancel>Cancel</button>';
      msg.querySelector('[data-repl]').addEventListener('click', function () { A.Store.importPlayer(np, old); save(); A.UI.toast(np.name + ' was replaced with the save.'); render(); });
      msg.querySelector('[data-asnew]').addEventListener('click', function () { np.name = (np.name + ' 2').slice(0, 16); A.Store.importPlayer(np); save(); A.UI.toast('Added ' + np.name + '!'); render(); });
      msg.querySelector('[data-cancel]').addEventListener('click', function () { msg.textContent = 'Nothing was changed.'; });
    }
    b.querySelector('[data-imp]').addEventListener('click', function () {
      var f = b.querySelector('[data-impfile]').files[0], code = b.querySelector('[data-impcode]').value;
      if (f) { if (f.size > 2e6) { msg.textContent = '⚠️ That file is too big to be a save.'; return; } var rd = new FileReader(); rd.onload = function () { doImport(String(rd.result)); }; rd.readAsText(f); }
      else if (code.trim()) doImport(code); else { msg.textContent = 'Paste a save code or pick a save file first.'; }
    });
    A.$$('textarea, input[type=file]', b).forEach(function (x) { x.addEventListener('keydown', function (e) { e.stopPropagation(); }); });
    b.querySelector('[data-add]').addEventListener('click', function () {
      var nm = b.querySelector('[data-newname]').value.trim(); if (!nm) { b.querySelector('[data-newname]').focus(); return; }
      var p = A.Store.add(nm, b.querySelector('[data-newblob]').value);
      A.$$('[data-newstart]', b).forEach(function (x) { if (x.value !== 'auto') A.Levels.set(p, x.dataset.newstart, x.value); });
      save(); A.UI.toast('Added ' + p.name + '!'); render();
    });
  }
})(window.Arcade);
