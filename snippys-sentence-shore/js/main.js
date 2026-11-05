/* main.js: start-up, top bar, grown-up lock */
(function () {
  'use strict';
  var SS = window.SS;
  SS.hud = function () {
    var b = document.querySelector('#shells b'); if (b) b.textContent = SS.state.shells;
    var sb = document.getElementById('sndBtn'); if (sb) sb.textContent = SS.state.settings.sound ? '🔊' : '🔇';
    var app = document.getElementById('app'); if (app) app.setAttribute('data-screen', SS.current || '');
  };
  function boot() {
    SS.load(); SS.hud();
    document.getElementById('homeBtn').addEventListener('click', function () {
      if (document.querySelector('.play')) {
        SS.ask('Leave this game and go to the map?', 'Go to the map', 'Keep playing').then(function (y) { if (y) { try { speechSynthesis.cancel(); } catch (e) {} SS.screens.home(); } });
      } else SS.screens.home();
    });
    document.getElementById('sndBtn').addEventListener('click', function () {
      SS.state.settings.sound = !SS.state.settings.sound; SS.save(); SS.hud(); SS.snd.pop();
    });
    var gu = document.getElementById('gu'), tm = null;
    gu.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    gu.addEventListener('pointerdown', function () {
      gu.classList.add('holding');
      tm = setTimeout(function () { tm = null; gu.classList.remove('holding'); SS.screens.grownup(); }, 1700);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
      gu.addEventListener(ev, function () {
        if (tm) { clearTimeout(tm); tm = null; SS.toast('Grown-ups: press and hold the lock for 2 seconds.'); }
        gu.classList.remove('holding');
      });
    });
    SS.screens.home();
    SS.connect().then(function (r) {
      if (r === 'pulled') { SS.hud(); if (SS.current === 'home') SS.screens.home(); }
    });
    window.__ss = SS;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
