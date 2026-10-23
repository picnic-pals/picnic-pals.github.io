/* Picnic Pals — core utilities. Classic script (no modules) so it works from file:// too. */
(function () {
  'use strict';
  var A = window.Arcade = window.Arcade || {};
  // Work out the arcade root from this script's own (relative) src, e.g. "../../js/core/util.js" -> "../../"
  var cs = document.currentScript;
  var src = cs ? (cs.getAttribute('src') || '') : '';
  A.ROOT = src.replace(/js\/core\/util\.js.*$/, '');
  /* Game and place titles: the ONE place to rename them. Every on-screen title, tag, hint and page <title> reads these
     (elements with data-title="munch|baseball|room" get their text filled in on load). The recorded clips munch_title / bb_title
     ("Picnic Munch!", "Snack Slugger!") are audio and need re-recording/regenerating separately when the names change. */
  A.TITLES = { munch: 'Picnic Munch', baseball: 'Snack Slugger', room: 'Picnic Spot', app: 'Picnic Pals' };
  if (document.addEventListener) document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.querySelectorAll('[data-title]'), function (el) { var t = A.TITLES[el.getAttribute('data-title')]; if (t) el.textContent = t; });
    var pt = document.documentElement.getAttribute('data-page-title'); if (pt && A.TITLES[pt]) document.title = A.TITLES[pt] + ' · ' + A.TITLES.app;
  });

  A.$ = function (s, r) { return (r || document).querySelector(s); };
  A.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  A.rnd = function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };
  A.pick = function (a) { return a[A.rnd(0, a.length - 1)]; };
  A.shuffle = function (a) { for (var i = a.length - 1; i > 0; i--) { var j = A.rnd(0, i), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  A.clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
  A.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  A.el = function (html) { var t = document.createElement('template'); t.innerHTML = String(html).trim(); return t.content.firstElementChild; };
  A.uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };
  A.today = function (d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  A.wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  A.fmtTime = function (ms) {
    var m = Math.round((ms || 0) / 60000);
    if (m < 1) return ms > 0 ? '<1 min' : '0 min';
    if (m < 60) return m + ' min';
    return Math.floor(m / 60) + ' h ' + (m % 60) + ' min';
  };
  A.ago = function (ts) {
    if (!ts) return 'never';
    var d = Math.floor((Date.now() - ts) / 86400000);
    return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d + ' days ago';
  };
  A.go = function (path) { location.href = A.ROOT + path; };
  A.isTouchOnly = function () { try { return matchMedia('(hover: none) and (pointer: coarse)').matches; } catch (e) { return false; } };

  // tiny event bus
  var subs = {};
  A.on = function (ev, fn) { (subs[ev] = subs[ev] || []).push(fn); };
  A.emit = function (ev, data) { (subs[ev] || []).slice().forEach(function (fn) { try { fn(data); } catch (e) { console.warn(e); } }); };
  A.off = function (ev, fn) { var a = subs[ev]; if (!a) return; var i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); };
  /* A.Age: the ONE place for age cut-offs (2026-10-21 ux3a). Everything that changes with age asks here.
       toddler    age 2 and under  -> Toddler mode auto (Tiny Picnic)
       little     age 4 and under  -> Gentle Munch auto (no hearts, no timer), 3 answer choices (Baseball, bonus), Little Steps story path,
                                      no fluency timing, extra time, Questions.step never jumps to a new skill
       preReader  age 5 and under  -> relaxed timer pace, stories read aloud, little-kid bonus questions
     band(): 'none' (age not set, starts like age 5), 'toddler' (<=2), 'pre' (3), 'pk' (4), 'k' (5), 'g1' (6), 'g2' (7), 'g3' (8+)
     boards(): Munch boards per level (ages 4-5: 2; 6-7: 2 at level 1, 3 at the top level; 8+: 3; toddlers / age 3: 1). */
  function ageOf(p) { var a = p && typeof p === 'object' ? p.age : p; return a == null || a === '' || isNaN(+a) ? null : +a; }
  A.Age = {
    TODDLER_MAX: 2, LITTLE_MAX: 4, PREREADER_MAX: 5,
    of: ageOf,
    toddler: function (p) { var a = ageOf(p); return a != null && a <= 2; },
    little: function (p) { var a = ageOf(p); return a != null && a <= 4; },
    preReader: function (p) { var a = ageOf(p); return a != null && a <= 5; },
    band: function (p) { var a = ageOf(p); if (a == null) return 'none'; if (a <= 2) return 'toddler'; if (a <= 3) return 'pre'; if (a <= 4) return 'pk'; if (a <= 5) return 'k'; if (a <= 6) return 'g1'; if (a <= 7) return 'g2'; return 'g3'; },
    choices: function (p) { return A.Age.little(p) ? 3 : 4; },
    boards: function (p, level, top) { var a = ageOf(p); if (a == null) a = 5; if (a <= 3) return 1; if (a <= 5) return 2; if (a <= 7) return level != null && top != null && level >= top ? 3 : 2; return 3; },
    // correct cells per Munch board (20 cells): 6-7 at ages 4-5, 8-9 at 6-7, 9-10 at 8+ (5 for toddlers / age 3)
    cellsPerBoard: function (p) { var a = ageOf(p); if (a == null) a = 5; if (a <= 3) return [5, 6]; if (a <= 5) return [6, 7]; if (a <= 7) return [8, 9]; return [9, 10]; }
  };
  // Gentle Munch (per player, grown-up setting p.munchGentle: 'auto' | 'on' | 'off'): no hearts (misses never end the round)
  // and no countdown. Auto = on for age 4 and under (A.Age.little).
  // Toddler mode (per player, grown-up setting p.toddler: 'auto' | 'on' | 'off'): Tiny Picnic is the main game and the
  // grade-level games are tucked away. Auto: on for age 2 (and younger).
  A.toddler = function (p) { if (!p) return false; var t = p.toddler || 'auto'; return t === 'on' || (t === 'auto' && A.Age.toddler(p)); };
  A.gentleMunch = function (p) { if (!p) return false; var g = p.munchGentle || 'auto'; return g === 'on' || (g === 'auto' && A.Age.little(p)); };
  // after9 (2026-10-22) hint-before-heart: with hearts on (not Gentle Munch), at age 6 and under (or age not set) the FIRST
  // wrong tap on each board costs no heart; it shows a hint instead (a snack that is right glows). Misses still count for
  // stars and the coach. Was: 56% of age-5 rounds (35% at 6) ended in a Snack break; sim now ~20% at 5 / ~25-33% at 6 for an
  // 80% kid (_review/after9). Returns the free misses per board (0 or 1).
  A.munchFreeMisses = function (p) { if (!p || A.gentleMunch(p)) return 0; var a = ageOf(p); return a == null || a <= 6 ? 1 : 0; };
})();
