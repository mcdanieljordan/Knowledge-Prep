/* core.js: tiny DOM helper, sound, speech, saved progress, badges, Snippy the crab */
(function () {
  'use strict';
  var SS = (window.SS = window.SS || {});

  // ---------- DOM helpers
  function add(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { add(el, x); }); return; }
    el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
  }
  var h = (SS.h = function (tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  });
  SS.clear = function (el) { while (el.firstChild) el.removeChild(el.firstChild); return el; };
  SS.wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  SS.reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  // **bold** markup -> safe nodes
  SS.rich = function (el, str) {
    SS.clear(el);
    String(str).split('**').forEach(function (p, i) {
      if (!p) return;
      el.appendChild(i % 2 ? h('b', null, p) : document.createTextNode(p));
    });
    return el;
  };
  SS.norm = function (s) { return String(s).replace(/[.!?]\s*$/, '').trim(); };
  SS.toast = function (msg) {
    var t = h('div', { class: 'toast' }, msg);
    document.getElementById('app').appendChild(t);
    setTimeout(function () { t.classList.add('out'); }, 2200);
    setTimeout(function () { t.remove(); }, 2700);
  };
  SS.ask = function (msg, yes, no) {
    return new Promise(function (res) {
      var ov = h('div', { class: 'overlay' },
        h('div', { class: 'dialog card', role: 'dialog' },
          h('p', null, msg),
          h('div', { class: 'row' },
            h('button', { class: 'btn ghost', onclick: function () { ov.remove(); res(false); } }, no || 'Stay'),
            h('button', { class: 'btn primary', onclick: function () { ov.remove(); res(true); } }, yes || 'Yes'))));
      document.getElementById('app').appendChild(ov);
    });
  };

  // ---------- state + saving
  var KEY = 'ss-ensley-v1';
  function blank() {
    return {
      v: 1, name: 'Ensley', created: Date.now(), updated: 0, shells: 0,
      ways: {}, badges: {}, skills: {}, slips: {}, sessions: [], slots: 0, unlockAll: false,
      settings: { read: false, sound: true }
    };
  }
  SS.blank = blank;
  SS.state = blank();
  function fill(o) {
    var b = blank();
    Object.keys(o || {}).forEach(function (k) { b[k] = o[k]; });
    b.settings = Object.assign({ read: false, sound: true }, b.settings || {});
    return b;
  }
  function localSave() { try { localStorage.setItem(KEY, JSON.stringify(SS.state)); } catch (e) {} }
  SS.load = function () {
    try { var s = localStorage.getItem(KEY); if (s) SS.state = fill(JSON.parse(s)); } catch (e) {}
  };
  var dbh = null, dirty = false, pushing = false, timer = null, fails = 0;
  SS.hasDb = function () { return !!dbh; };
  SS.connect = function () {
    return new Promise(function (resolve) {
      try {
        if (!(window.claude && typeof window.claude.use === 'function')) return resolve(false);
        Promise.resolve(window.claude.use('db')).then(function (d) {
          dbh = d || null;
          if (!dbh) return resolve(false);
          return dbh.doc('progress/ensley').get().then(function (snap) {
            var changed = false;
            if (snap && snap.exists) {
              var r = snap.data();
              if (r && (r.updated || 0) > (SS.state.updated || 0)) { SS.state = fill(r); localSave(); changed = true; }
            } else if (SS.state.updated) { dirty = true; push(); }
            resolve(changed ? 'pulled' : 'ok');
          });
        }).catch(function () { dbh = dbh || null; resolve(!!dbh); });
      } catch (e) { resolve(false); }
    });
  };
  function push() {
    if (!dbh || pushing || !dirty) return;
    pushing = true; dirty = false;
    Promise.resolve(dbh.doc('progress/ensley').set(SS.state)).then(function () { fails = 0; }).catch(function () {
      fails++; if (fails < 5) dirty = true;
    }).then(function () {
      pushing = false;
      if (dirty) { clearTimeout(timer); timer = setTimeout(push, 4000); }
    });
  }
  SS.save = function () {
    SS.state.updated = Date.now();
    localSave();
    if (dbh) { dirty = true; clearTimeout(timer); timer = setTimeout(push, 2500); }
  };
  document.addEventListener('visibilitychange', function () { if (document.hidden && dirty) { clearTimeout(timer); push(); } });
  SS.setAll = function (o) { SS.state = fill(o); SS.save(); };

  // ---------- sound
  var actx = null;
  function ac() {
    if (actx === null) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = false; } }
    if (actx && actx.state === 'suspended') { try { actx.resume(); } catch (e) {} }
    return actx;
  }
  function tone(f, t0, dur, type, vol) {
    if (!SS.state.settings.sound) return;
    var a = ac(); if (!a) return;
    try {
      var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + t0;
      o.type = type || 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.16, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.05);
    } catch (e) {}
  }
  SS.snd = {
    ok: function () { tone(659, 0, 0.14, 'triangle'); tone(880, 0.1, 0.22, 'triangle'); },
    no: function () { tone(300, 0, 0.16, 'sine', 0.12); tone(250, 0.12, 0.2, 'sine', 0.1); },
    pop: function () { tone(520, 0, 0.07, 'sine', 0.12); },
    star: function () { tone(988, 0, 0.1, 'triangle'); tone(1319, 0.09, 0.25, 'triangle'); },
    cheer: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.11, 0.22, 'triangle'); }); },
    snip: function () {
      if (!SS.state.settings.sound) return;
      var a = ac(); if (!a) return;
      try {
        var n = (a.sampleRate * 0.07) | 0, b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
        for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
        var s = a.createBufferSource(); s.buffer = b;
        var g = a.createGain(); g.gain.value = 0.22;
        var f = a.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2500;
        s.connect(f); f.connect(g); g.connect(a.destination); s.start();
      } catch (e) {}
      tone(1800, 0, 0.05, 'square', 0.04);
    }
  };
  SS.speak = function (t) {
    try {
      if (!('speechSynthesis' in window) || !t) return;
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(t); u.rate = 0.88; u.pitch = 1.1;
      speechSynthesis.speak(u);
    } catch (e) {}
  };

  // ---------- words of praise
  var PRAISE = ['Amazing!', 'Super snip!', 'You rock!', 'Brilliant!', 'Wowza!', 'Fantastic!', 'Shell-ebrate!', 'Great job!',
    'You got it!', 'Awesome!', 'Superstar!', 'Crab-tastic!', 'Hooray!', 'Perfect!', 'Nice thinking!', 'Way to go!'];
  var OOPS = ['Almost! Try again.', 'Good try! Look again.', 'Not quite. You can do it!', 'Oops! Let’s think.', 'So close! Try once more.'];
  SS.praise = function () { return SS.pickOne(PRAISE); };
  SS.oops = function () { return SS.pickOne(OOPS); };

  // ---------- confetti
  SS.confetti = function (n) {
    if (SS.reduced) return;
    var fx = document.getElementById('fx'); if (!fx) return;
    var cols = ['#FF6F59', '#FFC83D', '#1790B5', '#34B26E', '#ffffff'];
    for (var i = 0; i < (n || 24); i++) {
      var p = h('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = cols[i % cols.length];
      p.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
      p.style.animationDelay = Math.random() * 0.35 + 's';
      p.style.animationDuration = 1.2 + Math.random() * 0.7 + 's';
      fx.appendChild(p);
      (function (q) { setTimeout(function () { q.remove(); }, 2400); })(p);
    }
  };

  // ---------- progress
  SS.getWay = function (lv, w) { return SS.state.ways[lv + 'w' + w] || { stars: 0, plays: 0, best: 0 }; };
  SS.record = function (rec) {
    var S = SS.state, key = rec.lv + 'w' + rec.way;
    var w = S.ways[key] || (S.ways[key] = { stars: 0, plays: 0, best: 0 });
    w.plays++; w.stars = Math.max(w.stars, rec.stars); w.best = Math.max(w.best, Math.round(rec.score * 100));
    rec.items.forEach(function (it) {
      var sk = S.skills[it.skill] || (S.skills[it.skill] = { n: 0, clean: 0, hints: 0 });
      sk.n += it.n; sk.clean += it.clean; sk.hints += it.hints || 0;
      (it.slips || []).forEach(function (sl) { S.slips[sl] = (S.slips[sl] || 0) + 1; });
    });
    try { if (window.Hub) { var hp = Hub.ensure('Ensley', 2, '🦀'); var hs = Math.round((rec.secs || 0) * 1000 / Math.max(1, rec.items.length));
      rec.items.forEach(function (it) { Hub.record({ profile: hp.id, app: 'snippys-sentence-shore', skill: it.skill, ok: it.sc >= 1, hints: it.hints, ms: hs, mode: rec.lv + 'w' + rec.way, why: (it.slips || [])[0], prompt: it.prompt, given: '', correct: '' }); });
      Hub.session({ profile: hp.id, app: 'snippys-sentence-shore', skill: rec.lv, mode: 'w' + rec.way, n: rec.count, ok: Math.round(rec.score * rec.count), ms: (rec.secs || 0) * 1000 }); } } catch (e) { }
    S.shells += rec.shells;
    S.sessions.unshift({ t: Date.now(), lv: rec.lv, w: rec.way, sc: Math.round(rec.score * 100), st: rec.stars, n: rec.count, s: rec.secs, sh: rec.shells });
    if (S.sessions.length > 60) S.sessions.length = 60;
    SS.save();
  };

  SS.badges = [
    { id: 'first', n: 'First Snip', e: '✂️', d: 'Finish your first game' },
    { id: 'L1', n: 'Subject Star', e: '🐚', d: 'Finish Level 1' },
    { id: 'L2', n: 'Predicate Pro', e: '🌊', d: 'Finish Level 2' },
    { id: 'L3', n: 'Snip Master', e: '🦀', d: 'Finish Level 3' },
    { id: 'L4', n: 'Fragment Detective', e: '🔍', d: 'Finish Level 4' },
    { id: 'L5', n: 'Fix-It Fixer', e: '🛠️', d: 'Finish Level 5' },
    { id: 'L6', n: 'Sentence Builder', e: '🏰', d: 'Finish Level 6' },
    { id: 'boss', n: 'Crab King Champ', e: '👑', d: 'Beat the Crab King' },
    { id: 'hw', n: 'Homework Hero', e: '📘', d: 'Finish all 4 homework parts' },
    { id: 'perfect', n: 'Perfect Round', e: '🌟', d: 'Get 3 stars with no mistakes' },
    { id: 'streak', n: 'On Fire', e: '🔥', d: '5 right in a row' },
    { id: 'slots', n: 'Silly Slots Fan', e: '🎰', d: 'Spin 10 times' },
    { id: 'shells', n: 'Shell Collector', e: '🏖️', d: 'Collect 50 shells' }
  ];
  SS.checkBadges = function (rec) {
    var S = SS.state, nu = [];
    function g(id) {
      if (S.badges[id]) return;
      S.badges[id] = Date.now();
      nu.push(SS.badges.filter(function (b) { return b.id === id; })[0]);
    }
    if (rec) {
      g('first');
      if (/^L[1-6]$/.test(rec.lv) && rec.way === 3 && rec.stars >= 2) g(rec.lv);
      if (rec.lv === 'L7' && rec.stars >= 2) g('boss');
      if (rec.lv === 'HW') {
        var all = ['A', 'B', 'C', 'D'].every(function (p) { return (S.ways['HWw' + p] || {}).stars >= 1; });
        if (all) g('hw');
      }
      if (rec.stars === 3 && rec.perfect) g('perfect');
      if (rec.streak >= 5) g('streak');
    }
    if (S.slots >= 10) g('slots');
    if (S.shells >= 50) g('shells');
    if (nu.length) SS.save();
    return nu;
  };

  // ---------- Snippy the crab
  var CRAB = '<svg class="crab" viewBox="0 0 220 190" role="img" aria-label="Snippy the crab">' +
    '<g class="legs" stroke="#D4452F" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none">' +
    '<path d="M62 128 L34 138 L22 160"/><path d="M70 138 L46 156 L40 178"/><path d="M82 144 L68 166 L68 184"/>' +
    '<path d="M158 128 L186 138 L198 160"/><path d="M150 138 L174 156 L180 178"/><path d="M138 144 L152 166 L152 184"/></g>' +
    '<g class="armL"><path d="M66 118 Q38 112 32 86" stroke="#F05A44" stroke-width="13" fill="none" stroke-linecap="round"/>' +
    '<g transform="translate(30 90) rotate(-12)" fill="#FF6F59"><path class="cl" d="M0 0 L0 -50 A25 25 0 0 0 0 0 Z"/><path class="cr" d="M0 0 L0 -50 A25 25 0 0 1 0 0 Z"/></g></g>' +
    '<g class="armR"><path d="M154 118 Q182 112 188 86" stroke="#F05A44" stroke-width="13" fill="none" stroke-linecap="round"/>' +
    '<g transform="translate(190 90) rotate(12)" fill="#FF6F59"><path class="cl" d="M0 0 L0 -50 A25 25 0 0 0 0 0 Z"/><path class="cr" d="M0 0 L0 -50 A25 25 0 0 1 0 0 Z"/></g></g>' +
    '<ellipse cx="110" cy="132" rx="64" ry="46" fill="#FF6F59"/><ellipse cx="110" cy="146" rx="46" ry="26" fill="#FF8F7C" opacity=".55"/>' +
    '<g stroke="#F05A44" stroke-width="7" stroke-linecap="round"><path d="M88 94 L88 66"/><path d="M132 94 L132 66"/></g>' +
    '<circle cx="88" cy="58" r="15" fill="#fff"/><circle cx="132" cy="58" r="15" fill="#fff"/>' +
    '<g class="pupils" fill="#1E3A5F"><circle cx="90" cy="60" r="7"/><circle cx="134" cy="60" r="7"/></g>' +
    '<g fill="#fff"><circle cx="92" cy="57" r="2.4"/><circle cx="136" cy="57" r="2.4"/></g>' +
    '<circle cx="80" cy="136" r="8" fill="#FF9E8F" opacity=".75"/><circle cx="140" cy="136" r="8" fill="#FF9E8F" opacity=".75"/>' +
    '<path class="m-smile" d="M93 130 Q110 150 127 130" stroke="#1E3A5F" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<path class="m-grin" d="M90 128 Q110 162 130 128 Z" fill="#8B2A1F" stroke="#1E3A5F" stroke-width="4" stroke-linejoin="round"/>' +
    '<path class="m-flat" d="M97 142 Q110 134 123 142" stroke="#1E3A5F" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<ellipse class="m-o" cx="110" cy="140" rx="8" ry="9" fill="#8B2A1F" stroke="#1E3A5F" stroke-width="4"/>' +
    '<path class="sweat" d="M150 84 Q158 98 150 104 Q142 98 150 84 Z" fill="#7FD3F0"/>' +
    '<path class="crown" d="M82 40 L88 8 L100 28 L110 4 L120 28 L132 8 L138 40 Z" fill="#FFC83D" stroke="#C98F00" stroke-width="3" stroke-linejoin="round"/>' +
    '</svg>';
  SS.crab = function (pose, king) {
    var el = h('div', { class: 'crabwrap' + (king ? ' king' : ''), 'data-pose': pose || 'idle', html: CRAB });
    el.set = function (p) {
      el.removeAttribute('data-pose');
      void el.offsetWidth;
      el.setAttribute('data-pose', p || 'idle');
    };
    return el;
  };

  // ---------- sentence pieces used everywhere
  SS.sentenceEl = function (st, clickable) {
    var d = h('div', { class: 'sent' });
    d.chips = st.words.map(function (w, i) {
      var c = h(clickable ? 'button' : 'span', { class: 'w' + (clickable ? ' chip' : ''), 'data-i': i }, w);
      d.appendChild(c); return c;
    });
    return d;
  };
  SS.paint = function (sentEl, st, mode) {
    sentEl.chips.forEach(function (c, i) {
      c.classList.toggle('is-sub', i < st.s && mode !== 'pred');
      c.classList.toggle('is-pred', i >= st.s && mode !== 'sub');
    });
  };
  SS.tagRow = function (mode) {
    var r = h('div', { class: 'tagrow' });
    if (mode !== 'pred') r.appendChild(h('span', { class: 'tag tsub' }, 'SUBJECT · WHO or WHAT'));
    if (mode !== 'sub') r.appendChild(h('span', { class: 'tag tpred' }, 'PREDICATE · DOES or IS'));
    return r;
  };

  // ---------- drag with tap-tap backup (works on iPad touch and mouse)
  SS.dragDrop = function (items, targets, onDrop) {
    var sel = null;
    function select(it) {
      items.forEach(function (i) { i.classList.remove('sel'); });
      sel = it; if (it) it.classList.add('sel');
    }
    items.forEach(function (it) {
      var sx = 0, sy = 0, drag = false, id = null;
      it.addEventListener('pointerdown', function (e) {
        if (it.disabled || it.getAttribute('data-locked')) return;
        id = e.pointerId; sx = e.clientX; sy = e.clientY; drag = false;
        try { it.setPointerCapture(id); } catch (_) {}
      });
      it.addEventListener('pointermove', function (e) {
        if (id !== e.pointerId) return;
        var dx = e.clientX - sx, dy = e.clientY - sy;
        if (!drag && Math.hypot(dx, dy) > 10) { drag = true; it.classList.add('dragging'); select(null); }
        if (drag) it.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.06)';
      });
      function end(e) {
        if (id !== e.pointerId) return;
        id = null;
        try { it.releasePointerCapture(e.pointerId); } catch (_) {}
        if (drag) {
          drag = false; it.classList.remove('dragging');
          it.style.pointerEvents = 'none';
          var el = document.elementFromPoint(e.clientX, e.clientY);
          it.style.pointerEvents = '';
          var t = el && el.closest ? el.closest('.drop') : null;
          var ok = t && targets.indexOf(t) >= 0 ? onDrop(it, t) : false;
          if (ok) { it.style.transform = ''; }
          else {
            it.style.transition = 'transform .25s'; it.style.transform = '';
            setTimeout(function () { it.style.transition = ''; }, 280);
          }
        } else if (e.type === 'pointerup') {
          if (sel === it) select(null); else { select(it); SS.snd.pop(); }
        }
      }
      it.addEventListener('pointerup', end);
      it.addEventListener('pointercancel', end);
      it.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (sel === it) select(null); else select(it); } });
    });
    targets.forEach(function (t) {
      t.addEventListener('click', function () {
        if (!sel) return;
        var it = sel; select(null); onDrop(it, t);
      });
    });
    return { select: select };
  };

  // ---------- diagnosing a wrong answer for subject / predicate picks
  SS.diagnose = function (selText, st, part) {
    var ans = SS.norm(part === 'sub' ? st.sub : st.pred), other = SS.norm(part === 'sub' ? st.pred : st.sub);
    var sel = SS.norm(selText), P = part === 'sub' ? 'subject' : 'predicate';
    if (!sel) return { msg: 'Tap some words first!', slip: null, empty: true };
    if (sel === other) return { msg: 'That’s the OTHER half! We want the ' + P + '.', slip: 'other-half' };
    if (ans.indexOf(sel) >= 0 && sel !== ans) {
      return { msg: part === 'sub' ? 'Close! But the COMPLETE subject has ALL the words about the who or what.' :
        'Close! But the COMPLETE predicate goes all the way to the period.', slip: 'short-' + part };
    }
    if (sel.indexOf(ans) >= 0 && sel !== ans) {
      return { msg: part === 'sub' ? 'Too many words! The action word starts the predicate.' :
        'Too many! The predicate starts at the action word.', slip: 'long-' + part };
    }
    return { msg: 'Not quite. Find the action word first!', slip: 'mixed-' + part };
  };
})();
