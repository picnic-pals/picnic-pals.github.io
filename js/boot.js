/* Picnic Pals first-paint title layer. No Arcade deps: this file loads
   before hub.js so Play works as soon as the button is in the DOM.
   Only the current painted title is shown — the old wordmark/sky path is gone. */
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
      isPainted: function () { return true; }
    };
    return;
  }

  function titleUrl(ext) {
    var portrait = window.matchMedia('(orientation: portrait)').matches;
    return root + 'assets/picnic/title/title_a_' + (portrait ? 'portrait' : 'landscape') + (ext || '.webp');
  }

  function applyTitle() {
    var webp = titleUrl('.webp'), png = titleUrl('.png');
    boot.classList.add('painted');
    boot.style.setProperty('--boot-title', 'url("' + webp + '"), url("' + png + '")');
    boot.style.backgroundImage = 'image-set(url("' + webp + '") type("image/webp"), url("' + png + '") type("image/png"))';
    boot.style.backgroundSize = 'cover';
    boot.style.backgroundPosition = 'center center';
    boot.style.backgroundRepeat = 'no-repeat';
    boot.style.backgroundColor = '#f3e9ff';
  }

  function preload() {
    var img = new Image();
    img.onload = applyTitle;
    img.onerror = function () {
      if (img.src.indexOf('.webp') >= 0) { img.src = titleUrl('.png'); return; }
      applyTitle();
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

  function onPlay() {
    playHit = true;
    if (hubReady) hide();
  }
  if (play) {
    play.addEventListener('pointerup', function (e) {
      if (e.button != null && e.button !== 0) return;
      e.preventDefault();
      onPlay();
    });
    play.addEventListener('click', onPlay);
    play.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPlay(); }
    });
  }

  window.addEventListener('resize', function () {
    if (hidden || boot.hidden) return;
    applyTitle();
  });

  setTimeout(function () { waited = true; maybeHide(); }, wantTitle ? 120000 : 2500);

  window.__brandBoot = {
    ready: function () { hubReady = true; maybeHide(); },
    hide: hide,
    isVisible: function () { return !hidden && boot && !boot.hidden; },
    isPainted: function () { return !!(boot && boot.classList.contains('painted')); }
  };

  boot.classList.add('painted');
  applyTitle();
  preload();
})();
