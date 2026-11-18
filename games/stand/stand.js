/* Picnic Pals — Lemonade Stand (stand1, version 1: the stand only; café upgrades come later).
   A day is about 6 customers (7 on a sunny day), 3-4 minutes. Each customer is a food friend the kid has already MET.
   Order (read aloud + picture bubble; older steps read a short written ticket) → fill it (toddlers tap one whole item; older
   kids build it by tapping ingredients onto the cup, with a count) → pay with cute cartoon DOLLAR BILLS (whole dollars only,
   no coins, no change; never for toddlers) → a tip in the jar. End of day: count the tip jar, then 1-3 stars (star bits).
   Never upset: a wrong order gets a giggle ("Oops, I said no cheese!") and the kid fixes it. Rush hour (ages 6+ only) is an
   optional, gentle timer burst for 3 customers: the only thing a slow rush misses is the bonus.
   Step rules live in js/core/stand-core.js (A.Stand). ?mode=story&stop=i plays a short story-stop day (4 customers).
   stand-r1 (2026-11-05): lemonade, not plates. The order is a recipe card (grouped icons with counts, or a written ticket) and the
   kid taps ingredients into a pitcher that fills and takes the flavor's color. Flavors unlock every few play days (never shown
   early); each met friend has a favorite. A gentle patience face (not for toddlers) sets the tip: 3 first try, 1 after a fix; if
   it runs out the friend waves bye with no tip and nothing else lost. About 5 friends a day, then a happy recap. */
(function (A) {
  'use strict';
  var $ = A.$, UI = A.UI, V = A.Voice, S = A.Stand;
  UI.boot();
  var P = A.Store.active();
  if (!P) { location.replace(A.ROOT + 'index.html#players'); return; }
  var qs = {}; location.search.replace(/^\?/, '').split('&').forEach(function (kv) { var q = kv.split('='); if (q[0]) qs[decodeURIComponent(q[0])] = decodeURIComponent(q[1] || ''); });
  var ST = A.Story, STORY = qs.mode === 'story' && ST && ST.STOPS[+qs.stop] && ST.gameOf(P, +qs.stop) === 'stand' && ST.playable(P, +qs.stop), SI = STORY ? +qs.stop : -1;
  var MAPURL = '../munch/index.html?mode=story';
  var g = S.data(P);
  var G = { plan: null, i: 0, c: null, phase: '', o: null, m: null, tray: {}, taken: [], miss: 0, t0: 0, busy: false, tod: S.toddler(P),
    res: { served: 0, firstOk: 0, tips: 0, walked: 0, tipFirst: false, rushTried: false, rushWon: false }, rush: { asked: false, on: false, left: 0, ok: 0, t: null }, tst: Date.now() };
  function img(id, pose) { return A.ROOT + 'assets/picnic/friends/' + id + '/' + (pose || 'front') + '_256.webp'; }
  function fname(id) { return (A.Blobs.byId[id] || { name: id }).name; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  /* ---------- art: items, cups, cartoon bills, the tip jar ---------- */
  var SHOP_BERRY = '#ff9fbf', svgUid = 0;
  function looks() { return S.looks(P); }
  function cupStyle() {
    var c = looks().cups;
    if (c === 'cups-pink') return { body: '#ffd0e4', stroke: '#ef86b0', straw: '#ff7aa6' };
    if (c === 'cups-rainbow') return { body: '#fffdf7', stroke: '#d7c4f0', straw: '#7a5cff', rainbow: true };
    return { body: '#ffffff', stroke: '#e7dcef', straw: '#ff7aa6' };
  }
  function cupSvg(c) {
    var sh = cupStyle();
    var rainbow = sh.rainbow
      ? '<path d="M20 36 H80" stroke="#ff6b8a" stroke-width="4" stroke-linecap="round"/><path d="M21 40 H79" stroke="#ffd23c" stroke-width="3.2" stroke-linecap="round"/><path d="M22 44 H78" stroke="#7fd6ff" stroke-width="3.2" stroke-linecap="round"/>'
      : '';
    return '<svg class="cupsvg" viewBox="0 0 100 110" aria-hidden="true"><path d="M62 4 L56 40" stroke="' + sh.straw + '" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M18 30 H82 L74 102 Q50 110 26 102 Z" fill="' + sh.body + '" stroke="' + sh.stroke + '" stroke-width="3"/>' +
      '<path d="M22 46 H78 L72 98 Q50 106 28 98 Z" fill="' + c + '"/>' + rainbow +
      '<ellipse cx="50" cy="46" rx="28" ry="5" fill="#ffffff" opacity=".55"/>' +
      '<circle cx="41" cy="70" r="3" fill="#4a3b6b"/><circle cx="59" cy="70" r="3" fill="#4a3b6b"/><path d="M43 79 Q50 85 57 79" stroke="#4a3b6b" stroke-width="3" fill="none" stroke-linecap="round"/></svg>';
  }
  function juiceOf(fl, filled) {
    if (!filled) return looks().flavor === 'flavor-berry' ? '#ffd0e4' : '#e3f4ff';
    if (fl === 'silly') return '#c6e58a';
    if ((!fl || fl === 'plain') && looks().flavor === 'flavor-berry') return SHOP_BERRY;
    return flv(fl).juice;
  }
  var SVG = {
    rasp: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 6 Q16 2 12 5 M20 6 Q24 2 28 5" stroke="#4caf50" stroke-width="3" fill="none" stroke-linecap="round"/>' + [[14, 14], [20, 13], [26, 14], [11, 20], [17, 20], [23, 20], [29, 20], [14, 26], [20, 26], [26, 26], [17, 32], [23, 32]].map(function (c) { return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="4.6" fill="#e8457f" stroke="#c22e66" stroke-width="1"/>'; }).join('') + '</svg>',
    sugar: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 14 L20 8 L32 14 L32 28 L20 34 L8 28 Z" fill="#fff" stroke="#c9bfe0" stroke-width="2.5" stroke-linejoin="round"/><path d="M8 14 L20 20 L32 14 M20 20 L20 34" stroke="#c9bfe0" stroke-width="2.5" fill="none"/><circle cx="14" cy="22" r="1.4" fill="#d8d0ea"/><circle cx="26" cy="24" r="1.4" fill="#d8d0ea"/></svg>'
  };
  function art(id) { var it = S.BY[id]; if (!it) return ''; return it.svg ? '<span class="emo svgi">' + SVG[it.svg] + '</span>' : '<span class="emo">' + it.e + '</span>'; }
  function flv(id) { return S.FL[id] || S.FL.plain; }
  function flIcon(id) { var f = flv(id); return f.e ? '<span class="emo">' + f.e + '</span>' : '<span class="emo svgi">' + SVG.rasp + '</span>'; }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  // a little glass pitcher; level 0-1, juice color
  function pitcherSvg(level, juice) { var lv = Math.max(0, Math.min(1, level)), y = 108 - 84 * lv, id = 'pbody' + (++svgUid);
    var glass = looks().flavor === 'flavor-berry' ? '#ffe4f0' : '#f4fbff';
    var rim = looks().flavor === 'flavor-berry' ? '#f0b0c8' : '#a9d8f0';
    return '<svg class="psvg" viewBox="0 0 120 120" aria-hidden="true"><defs><clipPath id="' + id + '"><path d="M22 18 H90 L84 108 Q56 116 28 108 Z"/></clipPath></defs>' +
      '<path d="M88 34 Q112 36 108 62 Q104 84 84 86" stroke="' + (looks().flavor === 'flavor-berry' ? '#f3c0d4' : '#c9e6f5') + '" stroke-width="9" fill="none" stroke-linecap="round"/>' +
      '<path d="M22 18 H90 L84 108 Q56 116 28 108 Z" fill="' + glass + '"/>' +
      '<g clip-path="url(#' + id + ')"><g class="jlev" data-level="' + lv.toFixed(3) + '" style="transform:translateY(' + (y - 24).toFixed(1) + 'px)"><rect class="juice" x="0" y="24" width="120" height="120" fill="' + juice + '"/><ellipse cx="56" cy="24" rx="40" ry="4" fill="#fff" opacity=".45"/></g></g>' +
      '<path d="M22 18 H90 L84 108 Q56 116 28 108 Z" fill="none" stroke="' + rim + '" stroke-width="4" stroke-linejoin="round"/><path d="M14 14 Q20 18 22 18 H90" stroke="' + rim + '" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<path d="M32 30 L30 92" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/></svg>'; }
  function jarSvg(fill) { var y = 104 - 70 * Math.max(0, Math.min(1, fill)), id = 'jbody' + (++svgUid);
    return '<svg class="jsvg" viewBox="0 0 100 110" aria-hidden="true"><rect x="22" y="6" width="56" height="16" rx="6" fill="#ffb347" stroke="#e08a1e" stroke-width="3"/>' +
      '<defs><clipPath id="' + id + '"><rect x="14" y="22" width="72" height="84" rx="20"/></clipPath></defs><rect x="14" y="22" width="72" height="84" rx="20" fill="#eefaff"/>' +
      '<g clip-path="url(#' + id + ')"><rect x="0" y="' + y.toFixed(1) + '" width="100" height="110" fill="#9fe3a8"/></g>' +
      '<rect x="14" y="22" width="72" height="84" rx="20" fill="none" stroke="#8fcfe8" stroke-width="4"/><path d="M26 34 L26 88" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"/>' +
      '<text x="50" y="76" text-anchor="middle" font-size="26" font-weight="800" fill="#2f7a3b" font-family="sans-serif">TIPS</text></svg>'; }
  var BILLC = {
    1:  { a: '#d7efd8', b: '#9fd4a6', ink: '#14532d', edge: '#2f7a45', word: 'ONE DOLLAR' },
    5:  { a: '#c8e6cb', b: '#86c494', ink: '#14532d', edge: '#2a7040', word: 'FIVE DOLLARS' },
    10: { a: '#b7dcbd', b: '#6fb480', ink: '#134e28', edge: '#256638', word: 'TEN DOLLARS' },
    20: { a: '#a8d2b0', b: '#5ea572', ink: '#0f3f21', edge: '#1f5c32', word: 'TWENTY DOLLARS' }
  };
  function billSeal(c, v) {
    var i, a, x, y, petals = '';
    for (i = 0; i < 12; i++) {
      a = (i * 30 - 90) * Math.PI / 180;
      x = (148 + Math.cos(a) * 24.5).toFixed(1);
      y = (50 + Math.sin(a) * 24.5).toFixed(1);
      petals += '<circle cx="' + x + '" cy="' + y + '" r="4.4" fill="' + c.a + '" stroke="' + c.edge + '" stroke-width="1.15"/>';
    }
    return petals +
      '<circle cx="148" cy="50" r="20.5" fill="#f4fff6" stroke="' + c.edge + '" stroke-width="2.1"/>' +
      '<circle cx="148" cy="50" r="16.5" fill="none" stroke="' + c.edge + '" stroke-width="1.1"/>' +
      '<text x="148" y="58" text-anchor="middle" font-size="22" font-weight="800" fill="' + c.ink + '" font-family="system-ui,sans-serif">' + v + '</text>';
  }
  var billUid = 0;
  function billSvg(v) {
    var c = BILLC[v] || BILLC[1];
    billUid += 1;
    var id = 'bf' + billUid, fs = v >= 10 ? 36 : 42;
    return '<svg class="bill" viewBox="0 0 200 100" aria-hidden="true">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="' + c.a + '"/><stop offset="100%" stop-color="' + c.b + '"/>' +
      '</linearGradient></defs>' +
      '<rect x="2" y="2" width="196" height="96" rx="10" fill="url(#' + id + ')" stroke="' + c.edge + '" stroke-width="4"/>' +
      '<rect x="9" y="9" width="182" height="82" rx="6" fill="none" stroke="' + c.edge + '" stroke-width="1.6" opacity=".7"/>' +
      '<rect x="13" y="13" width="174" height="74" rx="4" fill="none" stroke="#f3fff5" stroke-width="1.4" opacity=".8"/>' +
      '<text x="16" y="28" font-size="16" font-weight="800" fill="' + c.ink + '" font-family="system-ui,sans-serif">' + v + '</text>' +
      '<text x="184" y="28" text-anchor="end" font-size="16" font-weight="800" fill="' + c.ink + '" font-family="system-ui,sans-serif">' + v + '</text>' +
      '<text x="16" y="90" font-size="16" font-weight="800" fill="' + c.ink + '" font-family="system-ui,sans-serif">' + v + '</text>' +
      '<text x="184" y="90" text-anchor="end" font-size="16" font-weight="800" fill="' + c.ink + '" font-family="system-ui,sans-serif">' + v + '</text>' +
      '<text x="62" y="58" text-anchor="middle" font-size="' + fs + '" font-weight="800" fill="' + c.ink + '" font-family="system-ui,sans-serif">$' + v + '</text>' +
      '<text x="62" y="76" text-anchor="middle" font-size="7.5" font-weight="800" fill="' + c.ink + '" font-family="system-ui,sans-serif" letter-spacing="1.2">' + c.word + '</text>' +
      billSeal(c, v) +
      '</svg>';
  }
  function heart() { return '<span class="emo heart">💛</span>'; }
  function swatch(c) { return '<span class="swatch" style="background:' + S.COLORS[c] + '"></span>'; }
  function wantHtml(w) {
    if (w.swatch && w.round != null) return '<span class="want"><b>' + w.n + '</b><span class="swcol">' + swatch(w.swatch) + '<small>' + w.swatch + (w.round ? ' + round' : ', not round') + '</small></span><span class="emo shape">' + (w.round ? '⚪' : '🚫⚪') + '</span></span>';
    if (w.swatch) return '<span class="want">' + (w.n ? '<b>' + w.n + '</b>' : '') + '<span class="swcol">' + swatch(w.swatch) + (w.n ? '<small>only ' + w.swatch + '</small>' : '') + '</span></span>';
    if (w.no) return '<span class="want no">' + art(w.id) + '<s></s></span>';
    if (w.plus) return '<span class="want plus"><b>+' + w.plus + '</b>' + art(w.id) + '</span>';
    return '<span class="want">' + (w.n > 1 || (w.n && !G.tod) ? '<b>' + w.n + '</b>' : '') + art(w.id) + '</span>';
  }
  /* ---------- the friend ---------- */
  function friend(pose, cls) { var f = $('#friend'); f.innerHTML = '<img src="' + img(G.c.friend, pose) + '" alt="' + A.esc(fname(G.c.friend)) + '" draggable="false">'; if (cls) { f.classList.remove(cls); void f.offsetWidth; f.classList.add(cls); } }
  function sayLine(parts) { line(parts); return say(parts); }
  function say(parts, kind) { return V.say(parts, { kind: kind || 'prompt', bubble: false }); }
  function bubble(html, cls) { var b = $('#bubble'); b.className = 'bubble ' + (cls || ''); b.innerHTML = html; }
  // the customer's own words show in their speech bubble (never in the player's friend bubble)
  function line(parts) { var b = $('#bubble'), l = b.querySelector('.line'); if (!l) { l = A.el('<p class="line"></p>'); b.appendChild(l); } l.textContent = tidy(V.text(parts)); l.classList.remove('pop'); void l.offsetWidth; l.classList.add('pop'); }
  function dots() { var n = G.plan.list.length, h = ''; for (var k = 0; k < n; k++) h += '<i class="' + (k < G.i ? 'on' : k === G.i ? 'now' : '') + '"></i>'; $('#dots').innerHTML = h; }
  function jarChip() { var j = $('#jarChip'); if (!j) { j = A.el('<span class="jarchip" id="jarChip" aria-hidden="true"></span>'); $('#dots').after(j); } j.innerHTML = jarSvg(Math.min(1, G.res.tips / 15)) + '<b>' + G.res.tips + '</b>'; }
  function clear() { $('#tray').innerHTML = ''; $('#bins').innerHTML = ''; $('#acts').innerHTML = ''; $('#counter').className = 'counter'; }
  // C2 + stand-r1: the written ask reads as real sentences ("..., please? My cup has 6 already."; questions end with "?")
  function tidy(x) {
    x = String(x || '').replace(/\s+/g, ' ').trim().replace(/([^.!?,])\s+Then\b/g, '$1, then');
    return (x.match(/[^.!?]+[.!?]*/g) || []).map(function (t) { t = t.trim(); if (!t) return '';
      if (/^(can|could|may|do|does|is|are|how|what|which|will|would)\b/i.test(t)) t = t.replace(/[.!?]*$/, '?');
      return cap(t); }).filter(Boolean).join(' ');
  }
  /* ---------- the patience face (soft: a friend who waits too long just waves bye; no tip, nothing else lost) ---------- */
  function patEl() { var e = $('#pat'); if (!e) { e = A.el('<div class="pat" id="pat" role="img" aria-label="How patient your friend is"><span class="face">😊</span><i><b></b></i></div>'); $('#cust').appendChild(e); } return e; }
  function patStart() { var ms = S.patienceMs(P, G.o && G.o.step); G.pat = { full: ms, left: ms, last: Date.now() }; var e = patEl(); e.classList.toggle('off', !ms); patDraw(); }
  function patDraw() { var e = patEl(), q = G.pat && G.pat.full ? G.pat.left / G.pat.full : 1; e.querySelector('b').style.width = Math.round(q * 100) + '%'; e.querySelector('.face').textContent = q > .55 ? '😊' : q > .25 ? '🙂' : '😐'; e.classList.toggle('low', q <= .25); }
  setInterval(function () { var t = Date.now(), pt = G.pat; if (!pt) return; var dt = t - pt.last; pt.last = t;
    if (!pt.full || G.busy || G.over || (G.phase !== 'order' && G.phase !== 'pay') || UI.cardOpen || document.hidden) return;
    pt.left = Math.max(0, pt.left - dt); patDraw(); if (pt.left <= 0) walkOff(); }, 250);
  function walkOff() {
    G.busy = true; G.phase = 'walk'; G.pat.full = 0; G.res.walked++; G.cm = 0; clear(); friend('happy');
    var bye = [{ id: 'sr1_bye', text: "That's okay! I'll come back another day. Bye bye!" }];
    bubble('<div class="byeb">🤷 👋</div>', 'tipb'); line(bye);
    if (G.rush.on) rushServed();
    return say(bye, 'chatter').then(function () { return wait(300); }).then(function () { $('#friend').classList.add('leave'); return wait(450); })
      .then(function () { $('#friend').classList.remove('leave'); G.i++; nextCustomer(); });
  }
  function bigBtn(label, cls, fn, aria) { var b = A.el('<button class="sbtn ' + (cls || '') + '">' + label + '</button>'); if (aria) b.setAttribute('aria-label', aria); b.addEventListener('click', function () { if (!G.busy) fn(b); }); return b; }

  /* ---------- a customer ---------- */
  function nextCustomer() {
    if (G.i >= G.plan.list.length) return tipJar();
    if (G.plan.rush && !G.rush.asked && G.i === 2 && G.plan.list.length - G.i >= 3) return offerRush();
    G.c = G.plan.list[G.i]; dots(); jarChip();
    var o = S.makeOrder(P, 'orders', { flavor: G.c.flavor }); if (G.c.silly) o = S.sillyOrder(P, o);
    G.o = o; G.cm = 0; G.added = []; G.fp = {}; G.tray = {}; Object.keys(o.pre || {}).forEach(function (k) { G.tray[k] = o.pre[k]; }); G.miss = 0; G.peeks = 0; G.flipped = false; G.phase = 'order'; G.busy = false;
    friend('front', 'arrive'); clear();
    if (G.rush.on) startRushClock();
    renderOrder(); patStart();
    var pre = o.why === 'easy' ? ['ls_easy'] : o.why === 'warmup' && !G.warmSaid ? (G.warmSaid = true, ['ls_warmup']) : [];
    var fl = flv(G.c.flavor);
    if (!(o.thisOne && G.tod)) pre = [{ id: 'sr1_hi_' + fl.id + (G.c.fav ? '_fav' : ''), text: G.c.fav ? 'Hi! ' + cap(fl.name) + ' is my favorite!' : 'Hi! I would like ' + fl.name + '.' }].concat(pre);
    if (o.memory) say(pre.concat(o.say, o.ticketSay)).then(function () { flipSoon(o); }); else say(pre.concat(o.say)); G.t0 = Date.now();
  }
  function renderBubble() {
    var o = G.o, hint = G.miss > 0;
    var pics = '<div class="wants">' + o.want.map(function (w, k) { return (k && !w.no ? '<i class="wplus">+</i>' : '') + wantHtml(w); }).join('') + '</div>';
    var fl = flv(G.c.flavor), hideHead = !!(o.thisOne && G.tod), head = hideHead ? '' : '<div class="rhead">' + flIcon(fl.id) + '<span>' + A.esc(cap(o.silly ? 'pickle ' + fl.name + '?!' : fl.name)) + '</span>' + (G.c.fav ? '<em>⭐ favorite</em>' : '') + '</div>';
    if (o.memory && G.flipped && !hint) {   // stand2: "remember the order": the ticket has flipped over; a big Peek button shows it again
      bubble('<div class="ticket back" aria-label="The ticket flipped over. Remember the order!"><span class="think">🤔</span><p>Remember?</p></div>', 'tk mem');
      var pk = A.el('<button class="sbtn peek" aria-label="Peek at the ticket">👀 Peek</button>'); pk.addEventListener('click', peek); $('#bubble').appendChild(pk); return;
    }
    if (o.ticket) bubble(head + '<div class="ticket' + (o.sentence ? ' long' : '') + '" role="button" tabindex="0" aria-label="Read the ticket aloud">' + o.ticket.split('\n').map(function (l) { return '<p class="' + (/^NO /.test(l) ? 'neg' : '') + '">' + hiNo(A.esc(l)) + '</p>'; }).join('') + '<span class="spk">🔊</span></div>' + (hint ? pics : ''), 'tk' + (o.sentence ? ' long' : ''));
    else bubble(head + '<div class="rcard">' + pics + '</div>', o.kind === 'pick' ? 'pk' : '');
    var tk = A.$('.ticket'); if (tk) tk.addEventListener('click', function () { say(o.ticketSay, 'tap'); });
  }
  function hiNo(t) { return t.replace(/(but no [a-z ]+|No [a-z]+!|NOT round|ROUND|DOUBLE it all!|each)/g, '<em>$1</em>'); }
  function flipSoon(o) { setTimeout(function () { if (G.o === o && G.phase === 'order' && !G.miss && !G.flipped) { G.flipped = true; renderBubble(); } }, G.peeks ? 3000 : 4500); }
  function peek() { if (G.phase !== 'order' || !G.flipped) return; var o = G.o; G.peeks++; G.flipped = false; renderBubble(); say(o.ticketSay, 'tap'); flipSoon(o); }
  // C2: the ask is always written in the speech bubble too (works with the sound off)
  function ask(parts) { var b = $('#bubble'), l = b.querySelector('.ask'); if (!l) { l = A.el('<p class="ask"></p>'); b.insertBefore(l, b.firstChild); } var x = String(V.text(parts || []) || '').trim(); l.textContent = tidy(x); }
  function renderOrder() {
    hideReady();
    var o = G.o, hint = G.miss > 0;
    renderBubble(); ask(o.say);
    var bins = $('#bins'); bins.innerHTML = ''; bins.className = 'bins n' + o.bins.length + (o.kind === 'pick' ? ' pick' : '');
    o.bins.forEach(function (id) {
      var it = S.BY[id], b = A.el('<button class="bin" data-id="' + id + '" aria-label="' + A.esc(it.name) + '">' + art(id) + (o.kind === 'build' && !G.tod ? '<small>' + A.esc(it.name) + '</small>' : '') + '</button>');
      b.addEventListener('click', function () { tapBin(id, b); }); bins.appendChild(b);
    });
    renderTray();
    if (o.kind === 'build') { var acts = $('#acts'); acts.innerHTML = ''; acts.appendChild(bigBtn('↩️', 'undo', undo, 'Take one out')); acts.appendChild(bigBtn('Serve! 🍹', 'serve', serve, 'Serve the lemonade')); }
    else { $('#acts').innerHTML = ''; $('#counter').classList.add('pickmode'); }
  }
  /* stand-r1 float (2026-11-05): each ingredient in the pitcher gets its own random spot, bob, drift and turn (made once when it
     drops in, kept until it is taken out), so nothing moves in step. Ice and fruit float near the juice top; sugar and honey sink.
     Animations run on transform only; the phase is kept across re-renders with a negative delay. */
  var FLOATERS = { main: 1, top: 1 };
  // stand-r1 level: the same fixed step per ingredient, whatever the order, so a full-looking pitcher never gives away the count.
  // The biggest order on any step is 10 and the pitcher takes 15 taps at most (tapBin), so 15 steps still sit under the brim (0.885
  // of 1.0); extra taps stay at that level. Undo lowers it one step.
  var LV_STEP = .055, LV_MAX_N = 15;
  function lvlOf(n) { return .06 + LV_STEP * Math.max(0, Math.min(n, LV_MAX_N)); }
  function rr(a, b) { return a + Math.random() * (b - a); }
  function sgn() { return Math.random() < .5 ? -1 : 1; }
  function floatStyle(key, id, lvl) {
    var fp = G.fp || (G.fp = {}), q = fp[key];
    if (!q) { var r0 = rr(-18, 18); var xs = Object.keys(fp).map(function (k) { return fp[k]; }), bx = 0, bu = 0, bd = -1;
      // a fresh spot that keeps clear of the others (so every one can still be counted): best of 10 random tries
      for (var tr = 0; tr < 10; tr++) { var cx = rr(2, 70), cu = Math.random(), dm = xs.reduce(function (m, o) { return Math.min(m, Math.hypot(cx - o.x, (cu - o.u) * 40)); }, 999); if (dm > bd) { bd = dm; bx = cx; bu = cu; } }
      q = fp[key] = { x: bx, u: bu, d: rr(3.6, 7.2), ph: Math.random(), t0: Date.now(),
      dx1: sgn() * rr(.6, 2.2), dy1: -rr(.5, 1.8), dx2: sgn() * rr(.6, 2.2), dy2: rr(.3, 1.4), r0: r0, r1: r0 + sgn() * rr(6, 22), r2: r0 + sgn() * rr(4, 16) }; }
    var it = S.BY[id] || {}, fl = FLOATERS[it.kind] || id === 'ice' || id === 'mint',
      surf = ((108 - 84 * lvl) / 1.2 - 20) / 71 * 100,   // the juice top, in % of the pile box (20%..91% of the pitcher)
      top = fl ? surf - 8 + q.u * Math.max(16, (80 - surf) * .6) : 58 + q.u * 22;
    top = Math.max(0, Math.min(76, top));
    var delay = -(((Date.now() - q.t0) / 1000 / q.d + q.ph) % 1) * q.d;
    return 'left:' + q.x.toFixed(1) + '%;top:' + top.toFixed(1) + '%;--d:' + q.d.toFixed(2) + 's;--fd:' + delay.toFixed(2) + 's;--dx1:' + q.dx1.toFixed(2) + 'cqw;--dy1:' + q.dy1.toFixed(2) + 'cqw;--dx2:' + q.dx2.toFixed(2) + 'cqw;--dy2:' + q.dy2.toFixed(2) + 'cqw;--r0:' + q.r0.toFixed(0) + 'deg;--r1:' + q.r1.toFixed(0) + 'deg;--r2:' + q.r2.toFixed(0) + 'deg';
  }
  // served: the pitcher tips and pours; the ingredients swirl away (shrink + fade), each a little after the other
  function pourOut() { var pit = A.$('#tray .pitcher'); if (!pit) return; pit.classList.add('pour');
    A.$$('#tray .pitcher .ti').forEach(function (e, k) { e.style.setProperty('--out', (k % 6) * 60 + 'ms'); e.classList.add('gone'); }); }
  function renderTray() {
    var o = G.o, t = $('#tray'), n = S.count(G.tray), h = '';
    // batch1: count-on orders keep the friend's first ones under a covered cup marked with how many (she counts on from there)
    var pre = o.pre || {}, cupN = 0;
    Object.keys(G.tray).forEach(function (id) { var k0 = 0; if (o.cupPre && pre[id]) { k0 = Math.min(pre[id], G.tray[id]); cupN += k0; } for (var k = k0; k < G.tray[id]; k++) h += '<span class="ti fl' + (!o.cupPre && k < (pre[id] || 0) ? ' pre' : '') + '" data-id="' + id + '" data-k="' + id + '#' + k + '" style="' + floatStyle(id + '#' + k, id, lvlOf(n)) + '">' + art(id) + '</span>'; });
    var cupH = o.cupPre ? '<span class="precup" role="img" aria-label="The cup has ' + cupN + ' already"><span class="pc">' + cupSvg('#ffc94d') + '</span><b>' + cupN + '</b></span>' : '';
    var ghosts = ''; if (G.miss >= 2 && o.need && !o.cat) { var tot = 0; for (var k2 in o.need) tot += o.need[k2]; for (var j = n; j < tot; j++) ghosts += '<i class="ghost"></i>'; }
    else if (G.miss >= 2 && o.cat) for (var j2 = n; j2 < o.cat.n; j2++) ghosts += '<i class="ghost"></i>';
    // stand2: ticket steps count only what is in the pitcher (the chip never gives away the order); pre-reader two-item orders list both
    var chipIds = o.ticket ? Object.keys(G.tray).filter(function (id) { return G.tray[id] > 0; }) : o.need && Object.keys(o.need).length > 1 ? Object.keys(o.need) : [];
    var multi = chipIds.length > 1, cnt = multi ? chipIds.map(function (id) { return '<span class="ci">' + art(id) + ' ' + (G.tray[id] || 0) + '</span>'; }).join('') : String(n);
    // batch1: on counting orders the count stays hidden until she serves once (she counts what she put in)
    var hideCnt = o.kind === 'pick' || (!o.ticket && G.miss === 0), loose = n - cupN, sz = loose > 10 ? ' n3' : loose > 5 ? ' n2' : '';
    // stand-r1: the pitcher fills as she taps (level grows with each tap, never reaching full at "the answer") and takes the flavor color
    var juice = o.silly ? '#c6e58a' : juiceOf(G.c && G.c.flavor, true), lvl = lvlOf(n);
    var old = {}, oldJ = A.$('#tray .jlev'), oldT = oldJ ? oldJ.style.transform : null; A.$$('#tray .ti.fl').forEach(function (e) { old[e.getAttribute('data-k')] = e.style.top; });
    t.innerHTML = '<div class="cupspot' + (hideCnt ? ' nocnt' : '') + '">' + cupH + '<div class="pitcher' + (n ? ' full' : '') + '" style="--juice:' + juice + '">' + pitcherSvg(lvl, n ? juice : juiceOf(G.c && G.c.flavor, false)) + '<div class="pile tf' + sz + '">' + h + ghosts + '</div></div>' + (hideCnt ? '' : '<span class="cnt' + (multi ? ' multi' : '') + '" aria-live="polite">' + cnt + '</span>') + '</div>';
    var moved = A.$$('#tray .ti.fl').filter(function (e) { var k = e.getAttribute('data-k'); if (old[k] == null || old[k] === e.style.top) return false; e.dataset.top = e.style.top; e.style.transition = 'none'; e.style.top = old[k]; return true; });
    A.$$('#tray .ti.fl').forEach(function (e) { if (old[e.getAttribute('data-k')] == null) e.classList.add('new'); });
    var nj = A.$('#tray .jlev'); if (nj && oldT && oldT !== nj.style.transform) { var nt = nj.style.transform; nj.style.transition = 'none'; nj.style.transform = oldT; moved.push({ style: {}, dataset: {} }); void t.offsetWidth; nj.style.transition = ''; nj.style.transform = nt; }
    if (moved.length) { void t.offsetWidth; moved.forEach(function (e) { e.style.transition = ''; e.style.top = e.dataset.top; }); }
  }
  // take the last ingredient back out (a big button instead of tiny targets inside the pitcher)
  function undo() { if (G.phase !== 'order') return; var pre = G.o.pre || {}, id = G.added.pop();
    if (!id) { id = Object.keys(G.tray).filter(function (k) { return G.tray[k] > (pre[k] || 0); })[0]; } if (!id || !G.tray[id] || G.tray[id] <= (pre[id] || 0)) return;
    if (G.fp) delete G.fp[id + '#' + (G.tray[id] - 1)]; G.tray[id]--; if (!G.tray[id]) delete G.tray[id]; A.Audio.sfx('tap'); renderTray(); }
  function tapBin(id, b) {
    if (G.busy || G.phase !== 'order') return; var o = G.o;
    if (o.kind === 'pick') {
      if (o.need[id]) { b.classList.add('yay'); G.tray = {}; G.tray[id] = 1; renderTray(); return served(); }
      G.miss++; G.cm++; b.classList.remove('giggle'); void b.offsetWidth; b.classList.add('giggle'); A.Audio.sfx('boing'); friend('happy');
      G.busy = true; say(['ls_it_' + id], 'name').then(function () { if (G.o === o && A.Talk.allows('name')) say(o.say); }); setTimeout(function () { G.busy = false; }, 700); return;
    }
    if (S.count(G.tray) >= 15) return;
    G.tray[id] = (G.tray[id] || 0) + 1; G.added.push(id); A.Audio.sfx('pop'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); renderTray();
    // batch1: counting out loud on each tap only for ages 2-5 (T / P bands); a 6+ counts herself
    if (o.countAloud && S.band(P) !== 'E') { var n = o.cat ? S.count(G.tray) : G.tray[id]; V.say([n], { kind: 'tap' }); }
  }
  var OOPS = { no: 'ls_oops_no', more: 'ls_oops_more', less: 'ls_oops_less', wrong: 'ls_oops_wrong', color: 'ls_oops_color', round: 'ls_oops_round', notround: 'ls_oops_notround' };
  function serve() {
    if (G.phase !== 'order') return; var r = S.checkOrder(G.o, G.tray);
    if (r.ok) return served();
    G.miss++; G.cm++; G.busy = true; A.Audio.sfx('boing'); friend('oops', 'giggle');
    var lp = [OOPS[r.oops] || 'ls_oops_wrong']; if (r.oops === 'no') lp.push('ls_its_' + r.item); if (G.o.cupPre && (r.oops === 'more' || r.oops === 'less')) lp.push('b1_ls_how_many_more'); var oopsL = lp;
    renderOrder(); // the picture hint shows after a miss (and the counting slots after a 2nd)
    sayLine(oopsL).then(function () { G.busy = false; friend('thinking'); });
    setTimeout(function () { G.busy = false; }, 1400);
  }
  function served() {
    G.busy = true; G.phase = 'served'; var o = G.o, first = G.miss === 0, ms = Date.now() - G.t0;
    var ev = S.record(P, o, { ok: true, first: first, ms: ms, peek: G.peeks > 0 }); G.res.served++; if (first) G.res.firstOk++; events(ev);
    A.Audio.sfx('yay'); friend('cheering', 'hop'); $('#counter').classList.add('done'); pourOut();
    var react = ['ls_react_' + G.c.friend]; line(o.silly ? ['ls_giggle'] : react);
    return say(o.silly ? ['ls_giggle'].concat(react) : react, 'chatter').then(function () { return wait(500); }).then(function () { return G.plan.money ? pay() : thanks(); });
  }
  function events(ev) {
    if (ev.speedy) { UI.toast && UI.toast('⚡ Speedy! On to something new!'); say(['ls_speedy'], 'chatter'); }
    else if (ev.mastered) { UI.toast && UI.toast('🌟 New stand skill!'); }
  }
  /* ---------- paying with dollar bills ---------- */
  function pay() {
    var m = S.makeOrder(P, 'money', { flavor: G.c.flavor }); if (!m) return thanks();
    G.m = m; G.phase = 'pay'; G.taken = []; G.miss = 0; G.busy = false; clear(); $('#counter').classList.add('paying');
    friend('happy'); renderPay(); say(m.say); G.t0 = Date.now();
  }
  function takenGroups(taken) {
    var order = [], counts = {};
    (taken || []).forEach(function (v) {
      if (!counts[v]) { order.push(v); counts[v] = 0; }
      counts[v]++;
    });
    return order.map(function (v) { return { v: v, n: counts[v] }; });
  }
  function billStackHtml(v, n) {
    var layers = Math.min(3, Math.max(1, n)), i, h = '<span class="billstack" data-n="' + n + '">';
    for (i = layers; i >= 1; i--) {
      h += '<span class="layer l' + i + '">' + billSvg(v) + '</span>';
    }
    h += '</span>';
    if (n > 1) h += '<small class="run">x' + n + '</small>';
    return h;
  }
  function bindPayOnce() {
    if (G.payBound) return;
    G.payBound = true;
    var bins = $('#bins'), tray = $('#tray');
    if (!bins || !tray) return;
    function addBill(v) {
      if (G.busy || G.phase !== 'pay' || !G.m || G.m.kind === 'enough') return;
      v = +v; if (!v) return;
      G.taken.push(v);
      A.Audio.sfx('pop');
      renderPay();
      V.say([sum(G.taken)], { kind: 'tap' });
    }
    function takeBack(v) {
      if (G.busy || G.phase !== 'pay') return;
      v = +v;
      var i = G.taken.lastIndexOf(v);
      if (i >= 0) G.taken.splice(i, 1);
      A.Audio.sfx('tap');
      renderPay();
    }
    function undoPay() {
      if (G.busy || !G.taken.length) return;
      G.taken.pop();
      A.Audio.sfx('tap');
      renderPay();
    }
    function onBins(e) {
      var t = e.target && e.target.closest ? e.target.closest('.billbtn.denom') : null;
      if (!t || !bins.contains(t)) return;
      addBill(t.getAttribute('data-v'));
    }
    function onTray(e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('#payUndo')) return undoPay();
      var back = t.closest('.billbtn.in');
      if (back) return takeBack(back.getAttribute('data-v'));
      var speak = t.closest('#tray .billbtn');
      if (speak && G.m && G.m.kind === 'enough') {
        var v = +speak.getAttribute('data-v');
        V.say([v, v === 1 ? 'ls_dollar' : 'ls_dollars'], { kind: 'tap' });
      }
    }
    if (A.UI && A.UI.onTap) { A.UI.onTap(bins, onBins); A.UI.onTap(tray, onTray); }
    else { bins.addEventListener('click', onBins); tray.addEventListener('click', onTray); }
  }
  function renderPay() {
    hideReady();
    bindPayOnce();
    var m = G.m, hint = G.miss > 0;
    var tags = m.change ? '<span class="tag">Costs $' + m.change.cost + '</span><span class="tag paid">Paid $' + m.change.paid + '</span><span class="q">Change?</span>'
      : m.prices.map(function (v, k) { var c = m.items && m.items[k]; return (k ? '<span class="plus">+</span>' : '') + '<span class="tag">' + (c ? '<span class="cups">' + flIcon(c.fl) + (c.n > 1 ? '<sub>' + c.n + '</sub>' : '') + '</span>' : '') + '$' + v + '</span>'; }).join('');
    var parts = [], added = sum(G.taken);
    G.taken.forEach(function (v) { parts.push('$' + v); });
    var tally = parts.length ? parts.join(' + ') + ' = $' + added : 'Added: $0';
    var priceRow = '<div class="prices">' + tags +
      (m.kind === 'enough' ? '<span class="q">Enough?</span>' : '') +
      (hint && m.kind !== 'enough' && !m.change && m.prices.length > 1 ? '<span class="eq">= $' + m.total + '</span>' : '') +
      (m.kind !== 'enough' ? '<span class="pay-tally price-tally" id="payTally">' + A.esc(tally) + '</span>' : '') +
      '</div>';
    bubble(priceRow, 'pay'); ask(m.say);
    var bins = $('#bins'); bins.innerHTML = ''; bins.className = 'bins wallet';
    var t = $('#tray');
    $('#counter').classList.add('paying');
    $('#counter').classList.toggle('enough', m.kind === 'enough');
    $('#counter').classList.toggle('take', m.kind !== 'enough');
    if (m.kind === 'enough') {
      var left = m.bills.slice(), run = 0, bills = '';
      left.forEach(function (v) {
        run += v;
        bills += '<button type="button" class="billbtn" data-v="' + v + '" aria-label="' + v + ' dollar bill">' + billSvg(v) + (hint ? '<small class="run">$' + run + '</small>' : '') + '</button>';
      });
      t.innerHTML = '<div class="cashbox wal"><span class="lbl">' + A.esc(fname(G.c.friend)) + '\'s bills</span><div class="pile">' + bills + '</div></div>';
      /* taps: delegated on #tray in bindPayOnce */
    } else {
      var denoms = (S.payDenoms && S.payDenoms(P, m)) || [20, 10, 5, 1];
      denoms.forEach(function (v) {
        var n = G.taken.filter(function (x) { return x === v; }).length;
        var b = A.el('<button class="billbtn denom" data-v="' + v + '" aria-label="Add a ' + v + ' dollar bill">' + billSvg(v) + (n ? '<small class="run">x' + n + '</small>' : '') + '</button>');
        bins.appendChild(b);
      });
      var groups = takenGroups(G.taken);
      var pile = groups.length
        ? groups.map(function (g) {
            return '<button type="button" class="billbtn in stack" data-v="' + g.v + '" aria-label="Take back a ' + g.v + ' dollar bill">' + billStackHtml(g.v, g.n) + '</button>';
          }).join('')
        : '<span class="pile-empty">Tap a bill to pay</span>';
      var undoBtn = G.taken.length ? '<button type="button" class="sbtn undo" id="payUndo" aria-label="Undo last bill">Undo</button>' : '';
      t.innerHTML = '<div class="cashbox compact"><span class="lbl">' + (m.change ? 'Change' : 'Cash box') + '</span><div class="pile">' +
        pile + '</div><span class="pay-tally box-tally">' + A.esc(tally) + '</span>' + undoBtn + '</div>';
      /* take-back and Undo: delegated on #tray in bindPayOnce */
    }
    var acts = $('#acts'); acts.innerHTML = '';
    if (m.kind === 'enough') { acts.appendChild(bigBtn('Yes, enough ✓', 'yes', function () { payAnswer(true); })); acts.appendChild(bigBtn('Not enough', 'no', function () { payAnswer(false); })); }
    else {
      acts.appendChild(bigBtn('Done ✓', 'serve', function () { payAnswer(G.taken.slice()); }, 'Done paying'));
    }
  }
  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
  function payAnswer(v) {
    var m = G.m, r = S.checkPay(m, v);
    if (r.ok) {
      G.busy = true; var ev = S.record(P, m, { ok: true, first: G.miss === 0, ms: Date.now() - G.t0 }); events(ev);
      A.Audio.sfx('yay'); friend('cheering', 'hop');
      var ln = m.kind === 'enough' ? [m.ans ? 'ls_yes_enough' : 'ls_not_enough'] : ['ls_thanks']; line(ln);
      return say(ln, 'chatter').then(function () { return wait(300); }).then(thanks);
    }
    G.miss++; G.cm++; G.busy = true; A.Audio.sfx('boing'); friend('oops', 'giggle');
    var l2 = m.kind === 'enough' ? ['ls_enough_oops'] : [r.oops === 'less' ? 'ls_pay_less' : 'ls_pay_more'];
    renderPay(); sayLine(l2).then(function () { G.busy = false; friend('thinking'); }); setTimeout(function () { G.busy = false; }, 1400);
  }
  /* ---------- thanks + tip, then the next friend ---------- */
  function thanks() {
    G.phase = 'thanks'; var c = G.c, tip = S.tipFor({ first: !G.cm, tod: G.tod });
    G.res.tips += tip; jarChip(); A.Audio.sfx('star');
    var j = $('#jarChip'); if (j) { j.classList.remove('jump'); void j.offsetWidth; j.classList.add('jump'); }
    if (G.rush.on) rushServed();
    var tl = tip >= 3 ? ['ls_surprise_tip'] : ['ls_tip'], one = G.plan.money ? billSvg(1) : heart(), fly = '';
    for (var k = 0; k < tip; k++) fly += one;
    bubble('<div class="tipfly n' + tip + '">' + fly + '</div>', 'tipb'); line(tl);
    return say(tl, 'chatter').then(function () { return wait(400); }).then(function () { $('#friend').classList.add('leave'); return wait(450); })
      .then(function () { $('#friend').classList.remove('leave'); G.i++; nextCustomer(); });
  }
  /* ---------- rush hour (ages 6+, optional, gentle) ---------- */
  var RUSH_MS = 45000;
  function offerRush() {
    G.rush.asked = true; clear(); bubble(''); $('#friend').innerHTML = '';
    say(['ls_rush_ask']);
    return UI.confirm({ title: 'Rush hour!', sub: 'Three friends are in a hurry. Want to try a speedy round? No stress: there is a bonus if you beat the clock.', yes: "Let's rush! ⏱️", no: 'No thanks', cls: 'rushask',
      art: '<div class="rushart">' + (A.Icons ? A.Icons.html('⏱️', { size: 48, decorative: true, cls: 'pp-pic', slot: 'stand:rushart' }) : '⏱️') + '🍋</div>' }).then(function (yes) {
      if (yes) { G.rush.on = true; G.rush.left = 3; G.rush.ok = 0; G.res.rushTried = true; document.body.classList.add('rush'); say(['ls_rush_go']); }
      nextCustomer();
    });
  }
  function startRushClock() {
    var bar = $('#rushBar'), i = bar.querySelector('i'); bar.classList.add('on'); bar.classList.remove('late');
    G.rush.t = Date.now(); i.style.transition = 'none'; i.style.width = '100%'; void i.offsetWidth; i.style.transition = 'width ' + RUSH_MS + 'ms linear'; i.style.width = '0%';
    clearTimeout(G.rush.timer); G.rush.timer = setTimeout(function () { bar.classList.add('late'); }, RUSH_MS);
  }
  function rushServed() {
    var inTime = Date.now() - G.rush.t <= RUSH_MS; if (inTime) G.rush.ok++; G.rush.left--; clearTimeout(G.rush.timer);
    if (G.rush.left <= 0) { G.rush.on = false; document.body.classList.remove('rush'); $('#rushBar').classList.remove('on'); G.res.rushWon = G.rush.ok >= 3;
      UI.toast && UI.toast(G.res.rushWon ? '⏱️ Rush bonus! Super speedy!' : '⏱️ Rush hour is over. Great helping!'); say([G.res.rushWon ? 'ls_rush_win' : 'ls_rush_done'], 'chatter'); }
  }
  /* ---------- end of day: count the tip jar ---------- */
  function tipJar() {
    G.phase = 'tip'; G.busy = false; G.pat = null; clear(); dots(); G.res.tod = G.tod; document.body.classList.add('tipq'); patEl().classList.add('off');
    var jc = $('#jarChip'); if (jc) jc.remove();   // batch1 (plan P1): the tip-jar chip showed the answer to "How many hearts?"
    $('#friend').innerHTML = '<img src="' + img(P.blob, 'happy') + '" alt="" draggable="false">';
    var n = G.res.tips, money = G.plan.money, counted = 0, firstTry = true;
    bubble('<div class="jarq">' + (money ? 'How many dollars?' : 'How many hearts?') + '</div>', 'jarb');
    var t = $('#tray'); $('#counter').classList.add('jarmode');
    var h = ''; for (var k = 0; k < n; k++) h += '<button class="jt" data-k="' + k + '" aria-label="Count">' + (money ? billSvg(1) : heart()) + '<sub></sub></button>';
    t.innerHTML = '<div class="jar"><div class="jarlid"></div><div class="jarglass">' + h + '</div><span class="cnt" id="jarCnt">0</span></div>';
    A.$$('#tray .jt').forEach(function (b) { b.addEventListener('click', function () { if (b.classList.contains('on')) return; counted++; b.classList.add('on'); b.querySelector('sub').textContent = counted; $('#jarCnt').textContent = counted; A.Audio.sfx('pop'); V.say([counted], { kind: 'tap' });
      if (G.tod && counted >= n) setTimeout(function () { endDay(true); }, 900); }); });
    say(['ls_jar', 'ls_jar_tap']);
    if (G.tod) return;
    var opts = A.shuffle([n, n + 1, Math.max(1, n - 1) === n ? n + 2 : n - 1].filter(function (v, i, a) { return a.indexOf(v) === i; }));
    var acts = $('#acts'); acts.innerHTML = '';
    opts.forEach(function (v) { acts.appendChild(bigBtn((money ? '$' : '') + v, 'num', function (b) {
      if (v === n) { A.Audio.sfx('yay'); b.classList.add('yay'); G.res.tipFirst = firstTry; return endDay(firstTry); }
      firstTry = false; A.Audio.sfx('boing'); b.classList.add('giggle'); say(['ls_jar_oops']); autoCount();
    }, String(v))); });
    function autoCount() { var bs = A.$$('#tray .jt'); counted = 0; bs.forEach(function (b) { b.classList.remove('on'); b.querySelector('sub').textContent = ''; });
      bs.forEach(function (b, k) { setTimeout(function () { counted = k + 1; b.classList.add('on'); b.querySelector('sub').textContent = counted; $('#jarCnt').textContent = counted; }, 500 + k * 450); }); }
  }
  function endDay(tipOk) {
    if (G.over) return; G.over = true; G.busy = true;
    var stars = S.finishDay(P, G.res), ms = Math.min(Date.now() - G.tst, 15 * 60000);
    try { A.Store.addTime(P, 'stand', ms); } catch (e) {}
    A.Store.markPlayed(P); A.Store.earnStars(P, stars, STORY ? 'story' : 'stand');
    var out = null;
    if (STORY) out = ST.record(P, SI, { correct: G.res.firstOk, wrong: G.res.served - G.res.firstOk, finished: true, frac: 1, gaveUp: false, secsLeft: 0, timerOn: false, stars: stars });
    var rewards = A.Rewards.check(P); A.Store.save();
    var html = '<div class="stars">' + [0, 1, 2].map(function (i) { return '<span>' + UI.STAR.replace('<svg', '<svg class="' + (i < stars ? 'got' : '') + '" style="animation-delay:' + (.3 + i * .3).toFixed(2) + 's"') + '</span>'; }).join('') + '</div>' +
      '<div class="recap"><div class="rc">' + pitcherSvg(.8, flv('plain').juice) + '<b>' + G.res.served + '</b><span>cups sold</span></div><div class="rc">' + jarSvg(Math.min(1, G.res.tips / 15)) + '<b>' + G.res.tips + '</b><span>' + (G.plan.money ? 'dollars' : 'hearts') + ' in the tip jar</span></div></div>' +
      (G.res.rushWon ? '<p class="daysum">⏱️ Rush bonus!</p>' : '');
    for (var s1 = 0; s1 < stars; s1++) setTimeout(function () { A.Audio.sfx('star'); }, 400 + s1 * 300);
    G.result = { stars: stars, res: G.res, out: out };
    return wait(600).then(function () {
      return UI.card({ tag: STORY ? (ST.STOPS[SI].area.emoji + ' Stop ' + ST.STOPS[SI].n + ' · ' + ST.STOPS[SI].area.name) : '🍋 Lemonade Stand', title: stars > 0 ? 'What a great day!' : 'What a busy stand!', cls: 'celebrate standdone', html: html,
        art: '<div class="dance"><img class="hero" src="' + img(P.blob, 'cheering') + '" alt="" draggable="false"></div>', btn: STORY ? 'Map ▶' : '🏠 Back home', voice: stars > 0 ? ['ls_day_done', 'fb_you_got', stars, stars === 1 ? 'fb_star' : 'fb_stars'] : ['ls_day_done'], sfx: 'win', confetti: stars > 0, minMs: 1000 });
    }).then(function () { var nf = G.res.newFlavor && S.FL[G.res.newFlavor]; if (!nf) return null; A.Store.save();
      return UI.card({ tag: '🍋 Lemonade Stand', title: 'New flavor!', cls: 'celebrate newflavor', html: '<p class="nfl">' + flIcon(nf.id) + ' <b>' + A.esc(cap(nf.name)) + '</b> is on the menu!</p>',
        art: '<div class="nfart" style="--juice:' + nf.juice + '">' + pitcherSvg(.85, nf.juice) + '</div>', btn: 'Yay! ▶', voice: [{ id: 'sr1_newfl_' + nf.id, text: 'A new flavor! ' + cap(nf.name) + ' is on the menu!' }], sfx: 'win', confetti: true, minMs: 900 });
    }).then(function () { return A.Rewards.celebrate(P, rewards); })
      .then(function () { return A.PlayTime ? A.PlayTime.checkpoint().then(function (ok) { if (!ok) return new Promise(function () {}); }) : null; })
      .then(function () { if (window.__noNav) return; if (STORY) { var next = out && out.runAdded ? Math.min(SI + 1, ST.mainCount() - 1) : SI; location.href = MAPURL + '&from=' + SI + '&to=' + next; } else goHome(); });
  }
  function goHome() { V.stop(); A.Store.save(); location.href = STORY ? MAPURL : A.ROOT + 'index.html?from=game#games'; }
  // Home is a single tap.
  var hb = $('#homeBtn');
  if (A.UI && A.UI.bindHome) A.UI.bindHome(hb, goHome);
  else hb.addEventListener('click', function () { A.Audio.sfx('tap'); goHome(); });
  function sayAgain() { if (G.phase === 'order' && G.o) say(G.o.ticket ? G.o.ticketSay : G.o.say, 'tap'); else if (G.phase === 'pay' && G.m) say(G.m.say, 'tap'); else if (G.phase === 'tip') say(['ls_jar_tap'], 'tap'); else if (G.phase === 'ready' || G.phase === 'shop') say(['ls_hello'], 'tap'); }
  $('#sayBtn').addEventListener('click', sayAgain);
  $('#bubble').addEventListener('click', function (e) { if (!e.target.closest('.ticket')) sayAgain(); });
  document.addEventListener('keydown', function (e) {
    if (UI.cardOpen || A.Parent.isOpen()) return;
    var n = +e.key; if (n >= 1 && n <= 9) { var b = A.$$('#bins button')[n - 1]; if (b) b.click(); }
    if (e.key === 'Enter' && !/BUTTON/.test((document.activeElement || {}).tagName || '')) { var s = A.$('#acts .sbtn'); if (s) s.click(); }
    if (e.key === 'r' || e.key === 'R') sayAgain();
    if (e.key === 'Escape') goHome();
  });
  UI.arrowNav && UI.arrowNav(function () { return A.$$('#stand button'); });
  UI.gear({ onClose: function () { if (A.Music) A.Music.apply(); } });
  if (A.Music) A.Music.play('stand');

  /* ---------- tip shop + ready screen (visual first; Voice.say is a help label only) ---------- */
  function moneyShop() { return !S.toddler(P); }
  function pricePics(n, money) {
    n = Math.max(0, n || 0);
    if (!money) {
      return '<span class="pricepics">' + heart() + '<b>' + n + '</b></span>';
    }
    var v = n >= 20 ? 20 : n >= 10 ? 10 : n >= 5 ? 5 : 1;
    return '<span class="pricepics">' + billSvg(v) + '<b>' + n + '</b></span>';
  }
  function signSvg() {
    return '<svg class="signsvg" viewBox="0 0 140 110" aria-hidden="true">' +
      '<rect x="66" y="2" width="8" height="18" rx="3" fill="#c98a4b"/>' +
      '<circle cx="70" cy="22" r="5" fill="#e8a400"/>' +
      '<rect x="8" y="26" width="124" height="78" rx="14" fill="#ffe46b" stroke="#e0b000" stroke-width="4"/>' +
      '<rect x="16" y="34" width="108" height="62" rx="10" fill="#fff8c8" stroke="#f0c84a" stroke-width="2"/>' +
      '<circle cx="28" cy="48" r="8" fill="#ffd23c" stroke="#f0b400" stroke-width="2"/>' +
      '<path d="M28 36 L28 38 M28 58 L28 60 M16 48 L18 48 M38 48 L40 48 M19 39 L21 41 M35 55 L37 57 M19 57 L21 55 M35 41 L37 39" stroke="#f0b400" stroke-width="2" stroke-linecap="round"/>' +
      '<text x="78" y="62" text-anchor="middle" font-size="15" font-weight="800" fill="#4a3b6b" font-family="system-ui,sans-serif">LEMONADE</text>' +
      '<text x="78" y="80" text-anchor="middle" font-size="11" font-weight="700" fill="#8a6d3b" font-family="system-ui,sans-serif">STAND</text></svg>';
  }
  function awningArt(kind) {
    var a = kind === 'mint' ? '#7ed9a8' : '#7ec8ff', b = '#fff';
    return '<svg class="awnart" viewBox="0 0 160 54" aria-hidden="true">' +
      '<path d="M4 8 H156 V32" fill="none"/>' +
      '<rect x="4" y="8" width="38" height="24" fill="' + a + '"/>' +
      '<rect x="42" y="8" width="38" height="24" fill="' + b + '"/>' +
      '<rect x="80" y="8" width="38" height="24" fill="' + a + '"/>' +
      '<rect x="118" y="8" width="38" height="24" fill="' + b + '"/>' +
      '<path d="M4 8 H156 V32 H4 Z" fill="none" stroke="#4a3b6b" stroke-width="3"/>' +
      '<ellipse cx="23" cy="40" rx="16" ry="10" fill="' + a + '" stroke="#4a3b6b" stroke-width="2"/>' +
      '<ellipse cx="61" cy="40" rx="16" ry="10" fill="' + b + '" stroke="#4a3b6b" stroke-width="2"/>' +
      '<ellipse cx="99" cy="40" rx="16" ry="10" fill="' + a + '" stroke="#4a3b6b" stroke-width="2"/>' +
      '<ellipse cx="137" cy="40" rx="16" ry="10" fill="' + b + '" stroke="#4a3b6b" stroke-width="2"/></svg>';
  }
  function shopArt(id) {
    if (id === 'awning-blue') return awningArt('blue');
    if (id === 'awning-mint') return awningArt('mint');
    if (id === 'cups-pink') { var keep = looks().cups; S.data(P).eq.cups = 'cups-pink'; var h = cupSvg(SHOP_BERRY); S.data(P).eq.cups = keep; return h; }
    if (id === 'cups-rainbow') { var keep2 = looks().cups; S.data(P).eq.cups = 'cups-rainbow'; var h2 = cupSvg('#ffe46b'); S.data(P).eq.cups = keep2; return h2; }
    if (id === 'sign-sunny') return signSvg();
    if (id === 'flavor-berry') return pitcherSvg(.75, SHOP_BERRY);
    return '';
  }
  function applyLooks() {
    var L = looks(), el = $('#stand'); if (!el) return L;
    ['up-awning-blue', 'up-awning-mint', 'up-cups-pink', 'up-cups-rainbow', 'up-sign-sunny', 'up-flavor-berry'].forEach(function (c) { el.classList.remove(c); });
    if (L.awning) el.classList.add('up-' + L.awning);
    if (L.cups) el.classList.add('up-' + L.cups);
    if (L.sign) el.classList.add('up-' + L.sign);
    if (L.flavor) el.classList.add('up-' + L.flavor);
    var sign = $('#standSign');
    if (!sign) { sign = A.el('<div class="stand-sign" id="standSign" aria-hidden="true"></div>'); el.appendChild(sign); }
    sign.innerHTML = L.sign === 'sign-sunny' ? signSvg() : '';
    sign.classList.toggle('on', L.sign === 'sign-sunny');
    return L;
  }
  function ensurePanes() {
    if (!$('#readyPane')) $('#stand').appendChild(A.el('<div class="ready" id="readyPane" hidden></div>'));
    if (!$('#tipShop')) $('#stand').appendChild(A.el('<div class="tipshop" id="tipShop" hidden></div>'));
  }
  function showReady() {
    ensurePanes();
    G.phase = 'ready';
    G.busy = false;
    document.body.classList.add('stand-ready');
    document.body.classList.remove('tipq', 'rush');
    applyLooks();
    $('#tipShop').hidden = true;
    $('#readyPane').hidden = false;
    renderReady();
    say(['ls_hello']);
  }
  function renderReady() {
    var money = moneyShop(), n = S.jar(P), L = looks(), juice = juiceOf('plain', true);
    $('#readyPane').innerHTML =
      '<div class="ready-preview" aria-hidden="true">' +
        '<div class="awning stand-awn"></div>' +
        (L.sign === 'sign-sunny' ? '<div class="r-sign">' + signSvg() + '</div>' : '') +
        '<div class="ready-wares">' + pitcherSvg(.7, juice) + cupSvg(juice) + '</div>' +
      '</div>' +
      '<div class="ready-jar" id="readyJar">' + jarSvg(Math.min(1, n / 30)) + '<span class="ready-total">' + pricePics(n, money) + '</span></div>' +
      '<div class="ready-acts">' +
        '<button type="button" class="ready-btn shop" id="shopBtn" aria-label="Tip shop"><span class="rb-art">' + jarSvg(.7) + '</span><span class="rb-lab">Tip shop</span></button>' +
        '<button type="button" class="ready-btn open" id="openStand" aria-label="Open the stand"><span class="rb-lab">Open the stand</span></button>' +
      '</div>';
    $('#shopBtn').addEventListener('click', function () { A.Audio.sfx('tap'); showShop(); });
    $('#openStand').addEventListener('click', function () { A.Audio.sfx('pop'); openDay(); });
  }
  function showShop() {
    ensurePanes();
    G.phase = 'shop';
    $('#readyPane').hidden = false;
    $('#tipShop').hidden = false;
    renderShop();
  }
  function closeShop() {
    var shop = $('#tipShop'); if (shop) shop.hidden = true;
    G.phase = 'ready';
    renderReady();
  }
  function renderShop() {
    var money = moneyShop(), n = S.jar(P), L = looks(), items = '';
    S.SHOP.forEach(function (it) {
      var have = S.owned(P, it.id), on = L[it.slot] === it.id, need = !have && n < it.price;
      items += '<button type="button" class="shop-item' + (have ? ' owned' : '') + (on ? ' on' : '') + (need ? ' need' : '') + '" data-id="' + it.id + '" aria-label="' + A.esc(it.name) + ', ' + it.price + '">' +
        '<span class="si-art">' + shopArt(it.id) + '</span>' +
        '<span class="si-name">' + A.esc(it.name) + '</span>' +
        '<span class="si-price">' + (have ? (on ? '<span class="si-got on-stand">On the stand</span>' : '<span class="si-got">Yours</span>') : pricePics(it.price, money)) + '</span></button>';
    });
    $('#tipShop').innerHTML =
      '<div class="shop-top">' +
        '<button type="button" class="shop-back" id="shopBack" aria-label="Back">Back</button>' +
        '<div class="shop-jar" id="shopJar">' + jarSvg(Math.min(1, n / 30)) + '<span class="ready-total">' + pricePics(n, money) + '</span></div>' +
      '</div>' +
      '<div class="shop-grid" id="shopGrid">' + items + '</div>';
    $('#shopBack').addEventListener('click', function () { A.Audio.sfx('tap'); closeShop(); });
    A.$$('#shopGrid .shop-item').forEach(function (btn) {
      btn.addEventListener('click', function () { tapShop(btn.getAttribute('data-id'), btn); });
    });
  }
  function tapShop(id, btn) {
    var it = S.shopItem(id); if (!it) return;
    V.say([{ text: it.name }], { kind: 'prompt', bubble: false });
    if (S.owned(P, id)) {
      S.equip(P, id);
      A.Store.save();
      A.Audio.sfx('pop');
      applyLooks();
      renderShop();
      return;
    }
    var r = S.buy(P, id);
    if (!r.ok) {
      btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake');
      A.Audio.sfx('boing');
      return;
    }
    A.Store.save();
    A.Audio.sfx('star');
    applyLooks();
    renderShop();
  }
  function hideReady() {
    var shop = $('#tipShop'); if (shop) shop.hidden = true;
    var ready = $('#readyPane'); if (ready) ready.hidden = true;
    document.body.classList.remove('stand-ready');
  }
  function openDay() {
    hideReady();
    start();
  }

  function start() {
    bindPayOnce();
    applyLooks();
    G.plan = S.planDay(P, STORY ? { n: 4, rush: false } : {}); G.i = 0; G.tst = Date.now();
    $('#sunny').innerHTML = G.plan.sunny ? '☀️' : '⛅'; document.body.classList.toggle('sunnyday', !!G.plan.sunny); document.body.classList.toggle('tod', G.tod);
    A.Store.save();
    say(['ls_hello']).then(function () { nextCustomer(); });
  }
  A.HowTo.button('stand', '#sayBtn');   // quality1 (C3)
  (A.PlayTime ? A.PlayTime.checkpoint() : Promise.resolve(true)).then(function (ok) { if (ok) A.HowTo.first('stand').then(showReady); });
  window.__stand = { payRender: function () { renderPay(); }, walkOff: walkOff, undo: undo, tidy: tidy, G: G, P: function () { return P; }, S: S, next: nextCustomer, serve: serve, tapBin: function (id) { var b = A.$('#bins .bin[data-id="' + id + '"]'); if (b) tapBin(id, b); }, payAnswer: payAnswer, tipJar: tipJar, endDay: endDay, offerRush: offerRush, RUSH_MS: RUSH_MS, render: renderOrder, peek: peek, showReady: showReady, showShop: showShop, closeShop: closeShop, openDay: openDay, applyLooks: applyLooks, looks: looks };
})(window.Arcade);
