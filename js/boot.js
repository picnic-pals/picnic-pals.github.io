/* Picnic Pals first-paint title layer. No Arcade deps: this file loads
   before hub.js so Play works as soon as the button is in the DOM. */
(function () {
  var boot = document.getElementById('boot');
  if (!boot) return;
  var play = document.getElementById('bootPlay');
  var root = boot.getAttribute('data-root') || '';
  var hubReady = false;
  var playHit = false;
  var waited = false;
  var hidden = false;
  var stay = /(?:^|[?&])boot=(stay|1|title)(?:&|$)/.test(location.search || '');
  var wantTitle = /(?:^|[?&])boot=title(?:&|$)/.test(location.search || '');
  var seen = false;
  try { seen = sessionStorage.getItem('picnicBootSeen') === '1'; } catch (e) {}

  document.documentElement.classList.add('boot-up');
  // After the title has been dismissed once in this tab, don't replay it on every hub return.
  if (seen && !stay && !wantTitle) {
    hidden = true;
    document.documentElement.classList.remove('boot-up');
    try { sessionStorage.setItem('picnicBootSeen', '1'); } catch (e) {}
    boot.classList.add('gone');
    boot.hidden = true;
    boot.style.pointerEvents = 'none';
    boot.setAttribute('aria-hidden', 'true');
    window.__brandBoot = {
      ready: function () { hubReady = true; },
      hide: function () {},
      isVisible: function () { return false; },
      isPainted: function () { return !!boot && boot.classList.contains('painted'); }
    };
    return;
  }

  function titleUrl(ext) {
    var portrait = window.matchMedia('(orientation: portrait)').matches;
    return root + 'assets/picnic/title/title_a_' + (portrait ? 'portrait' : 'landscape') + (ext || '.webp');
  }

  function applyTitle() {
    var webp = titleUrl('.webp'), png = titleUrl('.png');
    boot.style.backgroundImage = 'image-set(url("' + webp + '") type("image/webp"), url("' + png + '") type("image/png"))';
    boot.style.backgroundSize = 'cover';
    boot.style.backgroundPosition = 'center center';
    boot.style.backgroundRepeat = 'no-repeat';
    boot.style.backgroundColor = '#f3e9ff';
    boot.classList.add('painted');
    // Stay up until Play is tapped or the dwell timer fires. Do not hide on paint.
  }

  function preload() {
    var img = new Image();
    img.onload = applyTitle;
    img.onerror = function () {
      if (img.src.indexOf('.webp') >= 0) { img.src = titleUrl('.png'); return; }
      waited = true;
      maybeHide();
    };
    img.src = titleUrl('.webp');
  }

  function hide() {
    if (hidden || stay) return;
    hidden = true;
    document.documentElement.classList.remove('boot-up');
    try { sessionStorage.setItem('picnicBootSeen', '1'); } catch (e) {}
    boot.classList.add('gone');
    boot.setAttribute('aria-hidden', 'true');
    var nk = document.getElementById('nkName'), form = document.getElementById('newkid');
    if (nk && form && form.classList.contains('on')) { try { nk.focus(); } catch (e) {} }
    setTimeout(function () {
      if (boot.classList.contains('gone')) {
        boot.hidden = true;
        boot.style.pointerEvents = 'none';
      }
    }, 450);
  }

  function maybeHide() {
    if (stay) return;
    if (!hubReady) return;
    if (playHit || waited) hide();
  }

  if (play) {
    play.addEventListener('click', function () {
      playHit = true;
      if (hubReady) hide();
    });
  }

  window.addEventListener('resize', function () {
    if (hidden || boot.hidden) return;
    if (boot.classList.contains('painted')) applyTitle();
  });

  setTimeout(function () { waited = true; maybeHide(); }, wantTitle ? 120000 : 2500);

  window.__brandBoot = {
    ready: function () { hubReady = true; maybeHide(); },
    hide: hide,
    isVisible: function () { return !hidden && boot && !boot.hidden; },
    isPainted: function () { return !!(boot && boot.classList.contains('painted')); }
  };

  preload();
})();
