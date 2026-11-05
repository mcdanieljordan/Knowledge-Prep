/* Knowledge-Prep shared progress system.
   Every app loads this file and reports attempts here. The Parent Dashboard reads it.
   All data stays in THIS browser (localStorage). Use Export / Import on the dashboard to move it. */
(function () {
  'use strict';
  var KEY = 'kp-hub-v1', MAXLOG = 6000;
  var mem = null;
  function blank() { return { v: 1, profiles: [], current: null, log: [], sessions: [], settings: {} }; }
  function load() {
    if (mem) return mem;
    try { var raw = localStorage.getItem(KEY); mem = raw ? JSON.parse(raw) : blank(); } catch (e) { mem = blank(); }
    if (!mem.log) mem.log = []; if (!mem.sessions) mem.sessions = []; if (!mem.profiles) mem.profiles = []; if (!mem.settings) mem.settings = {};
    return mem;
  }
  var saveT = null;
  function save() {
    clearTimeout(saveT);
    saveT = setTimeout(flush, 250);
  }
  function flush() {
    try { localStorage.setItem(KEY, JSON.stringify(load())); } catch (e) { /* storage full or blocked: stay in memory */ }
  }
  window.addEventListener('pagehide', flush);
  window.addEventListener('visibilitychange', function () { if (document.hidden) flush(); });

  function uid() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
  function clean(s, n) { return String(s == null ? '' : s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n || 140); }

  var Hub = {
    KEY: KEY,
    data: load,
    flush: flush,
    profiles: function () { return load().profiles.slice(); },
    profile: function (id) { return load().profiles.filter(function (p) { return p.id === id; })[0] || null; },
    current: function () {
      var d = load(), p = Hub.profile(d.current);
      if (!p && d.profiles.length === 1) { d.current = d.profiles[0].id; p = d.profiles[0]; }
      return p;
    },
    setCurrent: function (id) { load().current = id; save(); },
    addProfile: function (name, grade, emoji) {
      var d = load(), p = { id: uid(), name: clean(name, 20) || 'Player', grade: +grade || 1, emoji: emoji || '⭐', created: Date.now() };
      d.profiles.push(p); d.current = p.id; flush(); return p;
    },
    /* Find a profile by first name (case-insensitive) or create it. Used by apps built for one child. */
    ensure: function (name, grade, emoji) {
      var f = load().profiles.filter(function (p) { return p.name.toLowerCase() === String(name).toLowerCase(); })[0];
      if (f) return f;
      var prev = load().current, p = Hub.addProfile(name, grade, emoji);
      if (prev) { load().current = prev; save(); }
      return p;
    },
    updateProfile: function (id, patch) { var p = Hub.profile(id); if (p) { Object.assign(p, patch); save(); } },
    removeProfile: function (id) {
      var d = load();
      d.profiles = d.profiles.filter(function (p) { return p.id !== id; });
      d.log = d.log.filter(function (r) { return r.p !== id; });
      d.sessions = d.sessions.filter(function (r) { return r.p !== id; });
      if (d.current === id) d.current = null; flush();
    },
    /* Report one answered question. Never throws. */
    record: function (o) {
      try {
        var p = o.profile || (Hub.current() || {}).id; if (!p) return;
        var r = { t: o.t || Date.now(), p: p, a: o.app, s: o.skill, ok: o.ok ? 1 : 0, h: o.hints | 0, ms: Math.max(0, Math.round(o.ms || 0)), m: o.mode || '' };
        if (!o.ok) { r.g = clean(o.given, 40); r.c = clean(o.correct, 40); r.q = clean(o.prompt, 140); if (o.why) r.w = clean(o.why, 60); }
        var d = load(); d.log.push(r);
        if (d.log.length > MAXLOG) d.log.splice(0, d.log.length - MAXLOG);
        save();
      } catch (e) { }
    },
    /* Report a finished round (for time-on-task and star history). */
    session: function (o) {
      try {
        var p = o.profile || (Hub.current() || {}).id; if (!p) return;
        var d = load(); d.sessions.push({ t: o.t || Date.now(), p: p, a: o.app, s: o.skill || '', m: o.mode || '', n: o.n | 0, ok: o.ok | 0, ms: Math.round(o.ms || 0) });
        if (d.sessions.length > 3000) d.sessions.splice(0, d.sessions.length - 3000);
        save();
      } catch (e) { }
    },
    setting: function (k, v) { var d = load(); if (v === undefined) return d.settings[k]; d.settings[k] = v; save(); },

    /* ---- move progress between devices ---- */
    exportCode: function () {
      flush();
      var json = JSON.stringify(load());
      return 'KP1:' + btoa(unescape(encodeURIComponent(json)));
    },
    importCode: function (code) {
      var m = String(code || '').trim().replace(/\s+/g, ''); if (m.indexOf('KP1:') !== 0) throw new Error('That code does not look right. It should start with KP1:');
      var inc = JSON.parse(decodeURIComponent(escape(atob(m.slice(4)))));
      var d = load(), idMap = {};
      (inc.profiles || []).forEach(function (p) {
        var f = d.profiles.filter(function (x) { return x.id === p.id || (x.name.toLowerCase() === p.name.toLowerCase() && x.grade === p.grade); })[0];
        if (f) idMap[p.id] = f.id; else { d.profiles.push(p); idMap[p.id] = p.id; }
      });
      var seen = {}; d.log.forEach(function (r) { seen[r.t + r.p + r.s] = 1; });
      var added = 0;
      (inc.log || []).forEach(function (r) { r.p = idMap[r.p] || r.p; var k = r.t + r.p + r.s; if (!seen[k]) { d.log.push(r); seen[k] = 1; added++; } });
      var seenS = {}; d.sessions.forEach(function (r) { seenS[r.t + r.p + r.s + r.a] = 1; });
      (inc.sessions || []).forEach(function (r) { r.p = idMap[r.p] || r.p; var k = r.t + r.p + r.s + r.a; if (!seenS[k]) { d.sessions.push(r); seenS[k] = 1; } });
      d.log.sort(function (a, b) { return a.t - b.t; }); d.sessions.sort(function (a, b) { return a.t - b.t; });
      flush(); return added;
    },

    /* ---- "Who's playing?" picker (shared by the hub and every app) ---- */
    EMOJIS: ['🥷', '🦄', '🐱', '🐶', '🦊', '🐼', '🐸', '🚀', '⭐', '🌈', '🎮', '🦋'],
    pickProfile: function (cb, opts) {
      opts = opts || {};
      var ov = document.createElement('div');
      ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', "Who's playing?");
      ov.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(30,58,95,.72);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Fredoka,Andika,system-ui,sans-serif;overflow:auto';
      var box = document.createElement('div');
      box.style.cssText = 'background:#FFF1D0;border-radius:26px;padding:24px;max-width:640px;width:100%;color:#1E3A5F;box-shadow:0 12px 40px rgba(0,0,0,.35);max-height:100%;overflow:auto';
      ov.appendChild(box); document.body.appendChild(ov);
      function done(p) { Hub.setCurrent(p.id); ov.remove(); cb && cb(p); }
      function btn(txt, css, fn) { var b = document.createElement('button'); b.type = 'button'; b.innerHTML = txt; b.style.cssText = 'font:inherit;cursor:pointer;border:3px solid #E9D9AE;background:#fff;color:#1E3A5F;border-radius:18px;min-height:56px;padding:10px 18px;font-size:22px;font-weight:600;' + (css || ''); b.onclick = fn; return b; }
      function list() {
        box.innerHTML = '<h2 style="margin:0 0 14px;font-size:30px">Who\'s playing? 🎮</h2>';
        var row = document.createElement('div'); row.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px';
        Hub.profiles().forEach(function (p) {
          row.appendChild(btn('<span style="font-size:44px;display:block">' + p.emoji + '</span>' + p.name + '<small style="display:block;font-size:15px;font-weight:500;color:#5C6F8A">Grade ' + p.grade + '</small>', 'padding:14px;', function () { done(p); }));
        });
        row.appendChild(btn('<span style="font-size:44px;display:block">➕</span>Add a player', 'padding:14px;border-style:dashed', form));
        box.appendChild(row);
        if (opts.cancel) { var c = btn('Never mind', 'margin-top:14px;font-size:18px;min-height:44px', function () { ov.remove(); }); box.appendChild(c); }
      }
      function form() {
        var emoji = Hub.EMOJIS[Math.floor(Math.random() * Hub.EMOJIS.length)];
        box.innerHTML = '<h2 style="margin:0 0 14px;font-size:30px">New player</h2>';
        var inp = document.createElement('input'); inp.placeholder = 'First name'; inp.maxLength = 20; inp.setAttribute('aria-label', 'First name');
        inp.style.cssText = 'font:inherit;font-size:24px;padding:12px 16px;border-radius:14px;border:3px solid #E9D9AE;width:100%;margin-bottom:12px;color:#1E3A5F';
        var gl = document.createElement('div'); gl.textContent = 'Grade'; gl.style.cssText = 'font-weight:600;margin:6px 0';
        var gsel = document.createElement('select'); gsel.setAttribute('aria-label', 'Grade');
        gsel.style.cssText = 'font:inherit;font-size:22px;padding:10px 14px;border-radius:14px;border:3px solid #E9D9AE;color:#1E3A5F;background:#fff';
        for (var g = 0; g <= 12; g++) { var o = document.createElement('option'); o.value = g; o.textContent = g === 0 ? 'Kindergarten' : 'Grade ' + g; gsel.appendChild(o); }
        gsel.value = opts.grade || 2;
        var el = document.createElement('div'); el.textContent = 'Pick a buddy'; el.style.cssText = 'font-weight:600;margin:14px 0 6px';
        var er = document.createElement('div'); er.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px';
        function mk(e) { var b = btn(e, 'min-height:56px;width:60px;padding:0;font-size:30px;' + (e === emoji ? 'border-color:#FF6F59;background:#FFE9E4' : ''), function () { emoji = e; Array.prototype.forEach.call(er.children, function (c) { c.style.borderColor = '#E9D9AE'; c.style.background = '#fff'; }); b.style.borderColor = '#FF6F59'; b.style.background = '#FFE9E4'; }); return b; }
        Hub.EMOJIS.forEach(function (e) { er.appendChild(mk(e)); });
        var go = btn('Let\'s go! ▶', 'margin-top:18px;background:#FF6F59;border-color:#FF6F59;color:#fff;width:100%', function () {
          var nm = inp.value.trim(); if (!nm) { inp.style.borderColor = '#FF6F59'; inp.focus(); return; }
          done(Hub.addProfile(nm, gsel.value, emoji));
        });
        box.appendChild(inp); box.appendChild(gl); box.appendChild(gsel); box.appendChild(el); box.appendChild(er); box.appendChild(go);
        if (Hub.profiles().length) box.appendChild(btn('Back', 'margin-top:10px;font-size:18px;min-height:44px;width:100%', list));
        setTimeout(function () { inp.focus(); }, 50);
      }
      if (Hub.profiles().length) list(); else form();
    }
  };
  window.Hub = Hub;
})();
