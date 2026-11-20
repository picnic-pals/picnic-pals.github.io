/* Picnic Pals — fixed design stage (portrait 400x720, landscape 1024x640), uniformly scaled to the viewport. */
(function (A) {
  'use strict';
  var PORTRAIT = { w: 400, h: 720 };
  var LANDSCAPE = { w: 1024, h: 640 };
  var frame, stage, ro, armed = false, fitting = false;

  function viewport() {
    var vv = window.visualViewport;
    var w = Math.max(1, Math.round((vv && vv.width) || window.innerWidth || document.documentElement.clientWidth || 400));
    var h = Math.max(1, Math.round((vv && vv.height) || window.innerHeight || document.documentElement.clientHeight || 720));
    return { w: w, h: h };
  }
  function design(vp) {
    return (vp.w <= vp.h) ? PORTRAIT : LANDSCAPE;
  }
  function fit() {
    if (!stage || !frame || fitting) return null;
    fitting = true;
    var vp = viewport();
    var d = design(vp);
    var scale = Math.min(vp.w / d.w, vp.h / d.h);
    if (!isFinite(scale) || scale <= 0) scale = 1;
    var ox = Math.round((vp.w - d.w * scale) / 2);
    var oy = Math.round((vp.h - d.h * scale) / 2);
    stage.style.width = d.w + 'px';
    stage.style.height = d.h + 'px';
    stage.style.transform = 'scale(' + scale + ')';
    stage.style.left = ox + 'px';
    stage.style.top = oy + 'px';
    var root = document.documentElement;
    root.classList.add('stage-on');
    root.dataset.stage = (d === PORTRAIT) ? 'portrait' : 'landscape';
    root.style.setProperty('--stage-w', d.w);
    root.style.setProperty('--stage-h', d.h);
    root.style.setProperty('--stage-scale', String(scale));
    root.style.setProperty('--stage-ox', ox + 'px');
    root.style.setProperty('--stage-oy', oy + 'px');
    // Keep tappable chrome at ~60px on the real screen after the stage scales down (phone landscape).
    var tap = (scale > 0 && scale < 1) ? Math.ceil(60 / scale) : 60;
    if (tap > 100) tap = 100;
    if (tap < 60) tap = 60;
    root.style.setProperty('--tap', tap + 'px');
    root.style.setProperty('--tap-screen', (tap * scale) + 'px');
    var size = { w: d.w, h: d.h, scale: scale, ox: ox, oy: oy, vw: vp.w, vh: vp.h, orient: root.dataset.stage };
    try { window.dispatchEvent(new Event('resize')); } catch (err) {}
    fitting = false;
    return size;
  }
  function adopt(node) {
    if (!stage || !node || node === frame || node === stage) return;
    if (node.parentNode === document.body && node !== frame) stage.appendChild(node);
  }
  function mount() {
    if (armed) return stage;
    if (!document.body) return null;
    armed = true;
    frame = document.createElement('div');
    frame.className = 'stage-frame';
    frame.setAttribute('data-stage-frame', '');
    stage = document.createElement('div');
    stage.className = 'stage-scale';
    stage.setAttribute('data-stage-root', '');
    var kids = [];
    var i, n;
    for (i = 0, n = document.body.childNodes.length; i < n; i++) kids.push(document.body.childNodes[i]);
    kids.forEach(function (node) { stage.appendChild(node); });
    frame.appendChild(stage);
    document.body.appendChild(frame);
    document.documentElement.classList.add('stage-on');
    if (window.MutationObserver) {
      new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          m.addedNodes && m.addedNodes.forEach(function (node) {
            if (node.nodeType === 1 && node.parentNode === document.body && node !== frame) stage.appendChild(node);
          });
        });
      }).observe(document.body, { childList: true });
    }
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', function () { setTimeout(fit, 80); });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', fit);
      window.visualViewport.addEventListener('scroll', fit);
    }
    return stage;
  }
  function disabled() {
    try {
      if (/[?&]nostage=1(?:&|$)/.test(location.search || '')) return true;
      if (localStorage.getItem('blobArcade.stage') === '0') return true;
    } catch (e) {}
    return false;
  }
  function boot() {
    if (disabled()) return;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  }

  A.Stage = {
    PORTRAIT: PORTRAIT,
    LANDSCAPE: LANDSCAPE,
    mount: mount,
    fit: fit,
    size: function () {
      var vp = viewport(), d = design(vp), scale = Math.min(vp.w / d.w, vp.h / d.h);
      return { w: d.w, h: d.h, scale: scale, vw: vp.w, vh: vp.h, orient: vp.w <= vp.h ? 'portrait' : 'landscape' };
    },
    root: function () { return stage; },
    frame: function () { return frame; }
  };
  boot();
})(window.Arcade = window.Arcade || {});
