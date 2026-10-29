/* Picnic Pals — Coloring (p4, 2026-10-29). Pick a page (only pages already earned are shown; a newly earned one gets a quiet
   sparkle, never a preview of what is next), color it (Fill, Brush, Stickers; toddlers: Fill + Stickers), Save to the kid's own
   Gallery (p.gallery, vectors, capped; nothing is ever dropped), flip through the Gallery and reopen a picture to color more.
   Leaving a picture saves it too, so nothing a kid made is lost. No scores, no stars, no right or wrong. */
(function (A) {
  'use strict';
  var $ = A.$, UI = A.UI, V = A.Voice, CP = A.ColorPages, G = A.Gallery;
  UI.boot();
  if (A.Breaks) A.Breaks.noCount = true;   // coloring is never a 'level' (no breaks counted here)
  var P = A.Store.active();
  if (!P) { location.replace(A.ROOT + 'index.html#players'); return; }
  var simple = !!(A.toddler && A.toddler(P)), cl = null, gi = 0, editing = null;
  function say(id) { V.say([id], { kind: 'prompt' }); }
  function view(id) { ['vPick', 'vDraw', 'vGal'].forEach(function (v) { $('#' + v).classList.toggle('on', v === id); }); document.body.dataset.view = id; }
  /* ---------- page picker ---------- */
  function pages() {
    var av = CP.available(P), seen = P.colorSeen;
    if (!seen) { seen = P.colorSeen = {}; av.forEach(function (pg) { seen[pg.id] = 1; }); A.Store.save(); }   // first visit: nothing is "new"
    var host = $('#pages'); host.innerHTML = ''; var fresh = false;
    av.forEach(function (pg) {
      var isNew = !seen[pg.id]; fresh = fresh || isNew;
      var b = A.el('<button class="cpage' + (isNew ? ' new' : '') + '" data-pg="' + pg.id + '" aria-label="' + A.esc(pg.name) + '">' + G.render({ pg: pg.id, f: {} }, 'cthumb') + '<span class="cpn">' + A.esc(pg.name) + '</span>' + (isNew ? '<span class="cnew" aria-hidden="true">✨</span>' : '') + '</button>');
      b.addEventListener('click', function () { A.Audio.sfx('pop'); open(pg.id); });
      host.appendChild(b);
    });
    $('#cTitle').textContent = 'Coloring'; view('vPick'); say(fresh ? 'cl_newpage' : 'cl_pick');
  }
  /* ---------- coloring ---------- */
  function open(pgId, entry) {
    if (P.colorSeen && !P.colorSeen[pgId]) { P.colorSeen[pgId] = 1; A.Store.save(); }
    editing = entry || null; var pg = CP.byId[pgId]; $('#cTitle').textContent = pg ? pg.name : 'Coloring';
    cl = A.Coloring.mount($('#draw'), { p: P, page: pgId, simple: simple, entry: entry }); view('vDraw'); say('cl_title');
  }
  function keep(quiet) {   // save the picture (if anything is colored); returns 'saved' | 'full' | 'empty'
    if (!cl) return 'empty'; var r = cl.save(); if (r === 'saved') { A.Store.markPlayed(P); A.Store.save(); }
    if (!quiet) { if (r === 'saved') { say('cl_saved'); A.Audio.sfx('yay'); } else if (r === 'full') say('cl_full'); }
    return r;
  }
  $('#saveBtn').addEventListener('click', function () {
    var id = cl && cl.state().id, r = keep();
    if (r === 'saved') { var b = $('#saveBtn'); b.classList.remove('done'); void b.offsetWidth; b.classList.add('done'); setTimeout(function () { gallery(id); }, 900); }
    else if (r === 'full') UI.toast && UI.toast('The gallery is full! A grown-up can make room.');
  });
  $('#backBtn').addEventListener('click', function () { A.Audio.sfx('tap'); keep(true); cl = null; pages(); });
  /* ---------- gallery ---------- */
  function gallery(focusId) {
    if (cl) { keep(true); cl = null; }
    var g = G.list(P); $('#cTitle').textContent = 'My gallery'; view('vGal');
    if (!g.length) { $('#gFrame').innerHTML = '<div class="gempty">🖍️<br>Color a page and save it here!</div>'; $('#gNum').textContent = ''; $('#gEdit').style.display = 'none'; say('cl_gallery'); return; }
    gi = focusId ? Math.max(0, g.map(function (e) { return e.id; }).indexOf(focusId)) : g.length - 1; $('#gEdit').style.display = ''; showG(); say('cl_gallery');
  }
  function showG(dir) {
    var g = G.list(P); if (!g.length) return; gi = (gi + g.length) % g.length; var f = $('#gFrame');
    f.innerHTML = '<div class="gpic' + (dir ? ' in' + (dir > 0 ? 'R' : 'L') : '') + '">' + G.render(g[gi], 'gsvg') + '</div>';
    $('#gNum').textContent = (gi + 1) + ' / ' + g.length; $('#gPrev').disabled = $('#gNext').disabled = g.length < 2;
  }
  $('#gPrev').addEventListener('click', function () { A.Audio.sfx('tap'); gi--; showG(-1); });
  $('#gNext').addEventListener('click', function () { A.Audio.sfx('tap'); gi++; showG(1); });
  $('#gEdit').addEventListener('click', function () { var e = G.list(P)[gi]; if (e) { A.Audio.sfx('pop'); open(e.pg, e); } });
  $('#gPages').addEventListener('click', function () { A.Audio.sfx('tap'); pages(); });
  $('#galBtn').addEventListener('click', function () { A.Audio.sfx('tap'); gallery(); });
  (function swipe() { var x0 = null; $('#gFrame').addEventListener('pointerdown', function (e) { x0 = e.clientX; }); $('#gFrame').addEventListener('pointerup', function (e) { if (x0 == null) return; var d = e.clientX - x0; x0 = null; if (Math.abs(d) > 60) { gi += d < 0 ? 1 : -1; A.Audio.sfx('tap'); showG(d < 0 ? 1 : -1); } }); })();
  /* ---------- home (press and hold, like every game) ---------- */
  function goHome() { V.stop(); keep(true); A.Store.save(); location.href = A.ROOT + 'index.html?from=game#games'; }
  var HOLD_MS = 800, hb = $('#homeBtn'), holdT = null, hintT = null;
  function holdStart(e) { if (e.button > 0) return; e.preventDefault(); clearTimeout(holdT); hb.classList.remove('hint'); hb.classList.add('holding'); holdT = setTimeout(function () { holdT = null; hb.classList.remove('holding'); A.Audio.sfx('tap'); goHome(); }, HOLD_MS); }
  function holdEnd() { if (!holdT) return; clearTimeout(holdT); holdT = null; hb.classList.remove('holding'); hb.classList.add('hint'); clearTimeout(hintT); hintT = setTimeout(function () { hb.classList.remove('hint'); }, 1800); }
  hb.addEventListener('pointerdown', holdStart); hb.addEventListener('pointerup', holdEnd); hb.addEventListener('pointerleave', holdEnd); hb.addEventListener('pointercancel', holdEnd);
  hb.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  hb.addEventListener('click', function (e) { if (e.detail === 0) { A.Audio.sfx('tap'); goHome(); } });
  window.addEventListener('pagehide', function () { keep(true); });
  document.addEventListener('keydown', function (e) { if (UI.cardOpen || A.Parent.isOpen()) return; if (e.key === 'Escape') goHome();
    if (document.body.dataset.view === 'vGal') { if (e.key === 'ArrowLeft') $('#gPrev').click(); if (e.key === 'ArrowRight') $('#gNext').click(); } });
  UI.gear({ onClose: function () { if (A.Music) A.Music.apply(); } });
  if (A.Music) A.Music.play('hub');
  A.ColorGame = { open: open, pages: pages, gallery: gallery, keep: keep, api: function () { return cl; }, index: function () { return gi; } };
  var q = location.search; if (/gallery=1/.test(q)) gallery(); else pages();
})(window.Arcade);
