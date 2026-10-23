/* Mochi Munch — start menu: Story / Free Play / 2 Players (+ partner pick and Team / Race), and high scores.
   Keyboard: arrows + Space/Enter (or click/tap). Esc goes back a step. Each choice opens munch with ?mode=… */
(function (A) {
  'use strict';
  var $ = A.$, B = A.Blobs, V = A.Voice, SFX = A.Audio.SFX, UI = A.UI;
  var P = null, step = 'main', partner = null, sec = null;
  function nameParts(p, alt) { return A.Voice.name(p, alt); }
  function tile(id, title, sub, art, cls) {
    return '<button class="mtile ' + (cls || '') + '" data-nav data-id="' + id + '"><span class="ma">' + art + '</span><span class="mt">' + A.esc(title) + '</span>' + (sub ? '<span class="ms">' + sub + '</span>' : '') + '</button>';
  }
  var ISLAND = '<svg viewBox="0 0 100 70"><rect width="100" height="70" rx="10" fill="#9fd8f7"/><path d="M14 56 C4 40 14 18 34 14 C52 10 62 20 76 16 C92 12 98 34 88 48 C80 62 56 60 40 62 C28 64 20 62 14 56Z" fill="#c8efb0" stroke="#fff3c4" stroke-width="3"/>' +
    '<path d="M22 50 Q40 30 52 42 T80 26" fill="none" stroke="#fff" stroke-width="2.4" stroke-dasharray="1 4" stroke-linecap="round"/><text x="22" y="52" font-size="10">🌼</text><text x="48" y="44" font-size="10">🏖️</text><text x="74" y="28" font-size="10">🗼</text><text x="82" y="16" font-size="9">⭐</text></svg>';
  var GRID = '<svg viewBox="0 0 100 70"><rect width="100" height="70" rx="10" fill="#fff6e6"/>' + [0, 1, 2].map(function (r) { return [0, 1, 2, 3].map(function (c) { var cols = ['#fff6cf', '#d4f7e8', '#ffd6e3', '#dcefff', '#e9e0ff']; return '<rect x="' + (10 + c * 21) + '" y="' + (6 + r * 20) + '" width="18" height="17" rx="4" fill="' + cols[(r * 4 + c) % 5] + '"/><text x="' + (19 + c * 21) + '" y="' + (18 + r * 20) + '" font-size="9" text-anchor="middle" font-weight="700" fill="#4a3b6b" font-family="sans-serif">' + ((r * 4 + c) * 3 % 10) + '</text>'; }).join(''); }).join('') + '</svg>';

  function build() {
    sec = A.el('<section class="screen" id="menu"><div class="mhead"><button class="iconbtn" id="menuHome" aria-label="Back to the arcade" data-nav>⌂</button>' +
      '<div class="mlogo"><span class="mav" id="menuAv"></span><span><b>' + A.TITLES.munch + '</b><small id="menuHi"></small></span></div>' +
      '<button class="chipbtn gold" id="menuScores" data-nav>🏆 High scores</button><button class="iconbtn music" id="menuMusic" aria-label="Music on/off (M)">🎵</button></div>' +
      '<h2 class="mq" id="menuQ"></h2><div class="mtiles" id="menuTiles"></div><div id="menuSeats"></div><div class="keys mk"><span class="grp"><kbd>←</kbd><kbd>→</kbd> choose</span><span class="grp"><kbd class="wide">Space</kbd> pick</span><span class="grp"><kbd>Esc</kbd> back</span></div><div id="menuPadKeys"></div></section>');
    document.body.insertBefore(sec, document.body.firstChild);
    $('#menuHome').addEventListener('click', function () { SFX.tap(); A.Music.stop(); location.href = A.ROOT + 'index.html#games'; });
    $('#menuScores').addEventListener('click', function () { SFX.pop(); A.MunchMap.scores(P); });
    $('#menuMusic').addEventListener('click', function () { A.Music.toggle(); music(); });
    document.addEventListener('keydown', function (e) {
      if (UI.cardOpen || A.Parent.isOpen() || A.$('#gate')) return;
      if (e.key === 'Escape' || e.key === 'Backspace') { e.preventDefault(); back(); }
      else if (e.key === 'm' || e.key === 'M') { A.Music.toggle(); music(); }
      else if (e.key === 'h' || e.key === 'H') { A.MunchMap.scores(P); }
      else if ((e.key === 'f' || e.key === 'F') && document.activeElement && document.activeElement.matches('#menu button')) { e.preventDefault(); if (!e.repeat) document.activeElement.click(); }
    });
    UI.arrowNav(function () { return A.$$('#menu [data-nav]'); });
  }
  function music() { var b = $('#menuMusic'); b.classList.toggle('off', A.Store.settings.music === false); }
  function back() { SFX.tap(); if (step === 'mode') render('partner'); else if (step === 'partner') render('main'); else location.href = A.ROOT + 'index.html#games'; }
  function go(q) { SFX.pop(); V.say(['hub_lets_go']); setTimeout(function () { location.href = 'index.html?' + q; }, 380); }
  function render(s) {
    step = s; var box = $('#menuTiles'), q = $('#menuQ'), R = A.Story.run(P), st = A.Story.data(P);
    if (s === 'main') {
      q.textContent = 'What do you want to play?';
      box.innerHTML = tile('story', 'Story', A.Story.WORLD + ' adventure' + (R.stop || st.bestRun ? '<br><b>Stop ' + Math.min(R.stop + 1, 20) + ' of 20</b> · best ' + (st.bestRun || 0) : ''), ISLAND, 'story') +
        tile('free', 'Free Play', 'Munch at your own level', GRID, 'free') +
        tile('two', '2 Players', 'Team or race, one keyboard', '<span class="pair">' + B.forProfile(P, { expr: 'happy' }) + B.svg({ blob: P.blob === 'apple' ? 'blueberry' : 'apple', expr: 'happy' }) + '</span>', 'two');
      wire({ story: function () { go('mode=story'); }, free: function () { go('mode=free'); }, two: function () { V.say(['hub_pick_friend']); render('partner'); } });
    } else if (s === 'partner') {
      q.textContent = 'Who is playing with ' + P.name + '?';
      var others = A.Store.profiles().filter(function (p) { return p.id !== P.id; }), h = '', fns = {};
      others.forEach(function (p) { h += tile('p:' + p.id, p.name, '⭐ ' + p.stars, '<span class="one">' + B.forProfile(p, { expr: 'happy' }) + '</span>', 'kidt'); fns['p:' + p.id] = function () { partner = { id: p.id, p: p }; V.say([nameParts(p), 'hub_team_or_race']); render('mode'); }; });
      [['easy', 'Guest · Easy', 'Counting'], ['medium', 'Guest · Medium', 'Adding to 10'], ['hard', 'Guest · Hard', 'Adding to 20']].forEach(function (g) {
        h += tile('g:' + g[0], g[1], g[2], '<span class="one">' + B.svg({ blob: 'corn', color: 'sky', expr: 'happy' }) + '</span>', 'guest'); fns['g:' + g[0]] = function () { partner = { id: 'guest-' + g[0], p: { name: 'Guest', guest: true } }; V.say(['name_guest', 'hub_team_or_race']); render('mode'); };
      });
      box.innerHTML = h + '<button class="mtile backt" data-nav data-id="back"><span class="mt">◀ Back</span></button>'; fns.back = back; wire(fns);
    } else {
      q.textContent = P.name + ' & ' + partner.p.name + ': team or race?';
      box.innerHTML = tile('team', 'Team', 'Munch together, share the stars', '<span class="big">🤝</span>', 'team') + tile('versus', 'Race', 'Who finishes first? (friendly!)', '<span class="big">🏁</span>', 'race') +
        '<button class="mtile backt" data-nav data-id="back"><span class="mt">◀ Back</span></button>';
      wire({ team: function () { go('mode=team&p2=' + encodeURIComponent(partner.id)); }, versus: function () { go('mode=versus&p2=' + encodeURIComponent(partner.id)); }, back: back });
    }
    // 2-player setup: who plays with a controller? ("Press A to join", X swaps); X = high scores elsewhere
    var two = s !== 'main'; A.Pad.context({ setup: two });
    $('#menuPadKeys').innerHTML = A.Pad.keys([['dpad', 'choose'], ['a', 'pick'], ['b', 'back'], ['x', two ? 'swap controllers' : 'high scores']], 'mk');
    if (two) A.Pad.mountSeats($('#menuSeats'), function () { return [P.name, partner && s === 'mode' ? partner.p.name : 'friend']; }); else $('#menuSeats').innerHTML = '';
    var first = box.querySelector('[data-nav]'); setTimeout(function () { try { first.focus({ preventScroll: true }); } catch (e) {} }, 30);
  }
  // short descriptions on hover / focus / long-press (never spoken; 2026-10-22)
  var TIPS = { story: 'Follow the map from stop to stop on a picnic journey.', free: 'Munch the right answers at your own level.', two: 'Play with a friend on one keyboard.',
    team: 'Work together and share the stars.', versus: 'A friendly race. Who finishes first?', back: 'Go back one step.',
    'g:easy': 'Play with a guest who is learning to count.', 'g:medium': 'Play with a guest who adds to 10.', 'g:hard': 'Play with a guest who adds to 20.' };
  function tipTiles() { A.$$('#menuTiles .mtile').forEach(function (b) { var id = b.dataset.id, t = TIPS[id] || (/^p:/.test(id) ? 'Play together with ' + (b.querySelector('.mt') || b).textContent.trim() + '.' : ''); if (t) UI.tip(b, t, { name: (b.querySelector('.mt') || b).textContent.trim() }); }); }
  function wire(fns) { tipTiles(); A.$$('#menuTiles .mtile').forEach(function (b) { b.addEventListener('click', function () { var f = fns[b.dataset.id]; if (f) f(); }); b.addEventListener('pointerenter', function () { B.anim(b, 'squish', 420); }); }); }
  function show(p) {
    P = p; build(); A.Story.data(P);
    A.$$('.screen').forEach(function (s) { s.classList.toggle('on', s === sec); });
    $('#menuAv').innerHTML = B.forProfile(P, { expr: 'happy' }); $('#menuHi').textContent = 'Hi, ' + P.name + '!'; music();
    document.body.classList.add('menu');
    render('main'); V.say(['menu_pick']); A.Music.play('hub');
    UI.gear({ onClose: function () { music(); A.Music.apply(); render(step); } });
    window.__munchMenu = { render: render, step: function () { return step; } };
  }
  A.MunchMenu = { show: show };
})(window.Arcade);
