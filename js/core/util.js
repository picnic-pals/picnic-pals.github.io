/* Blob Arcade — core utilities. Classic script (no modules) so it works from file:// too. */
(function () {
  'use strict';
  var A = window.Arcade = window.Arcade || {};
  // Work out the arcade root from this script's own (relative) src, e.g. "../../js/core/util.js" -> "../../"
  var cs = document.currentScript;
  var src = cs ? (cs.getAttribute('src') || '') : '';
  A.ROOT = src.replace(/js\/core\/util\.js.*$/, '');

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
})();
