/* Math Dojo: game engine and screens */
(function () {
  'use strict';
  var MD = window.MD, Hub = window.Hub, APP = MD.APP;
  var root = document.getElementById('app');
  var prof = null, ST = null, SKEY = 'md-state-v1';

  // ---------- helpers
  function h(tag, a, kids) {
    var e = document.createElement(tag);
    if (a) for (var k in a) {
      var v = a[k]; if (v == null || v === false) continue;
      if (k === 'class') e.className = v; else if (k === 'html') e.innerHTML = v; else if (k === 'text') e.textContent = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v); else if (k === 'style') e.style.cssText = v; else e.setAttribute(k, v);
    }
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pretty(s) {
    s = String(s);
    var m = s.match(/^(-?)(\d+)\/(\d+)$/);
    if (m) return (m[1] ? '−' : '') + '<span class="fr"><i>' + m[2] + '</i><b>' + m[3] + '</b></span>';
    return s.replace(/(^|[\s(])-(?=[\dx])/g, '$1−').replace(/>=/g, '≥').replace(/<=/g, '≤').replace(/</g, '&lt;').replace(/&lt;(?=\s*−?\d)/, '&lt;');
  }
  function today() { return new Date().toLocaleDateString('en-CA'); }
  function yesterday() { var d = new Date(); d.setDate(d.getDate() - 1); return d.toLocaleDateString('en-CA'); }

  // ---------- state (per player)
  function allState() { try { return JSON.parse(localStorage.getItem(SKEY)) || {}; } catch (e) { return {}; } }
  function loadState() {
    var s = allState()[prof.id] || {};
    ST = Object.assign({ coins: 0, skills: {}, bosses: {}, owned: ['🥷'], avatar: '🥷', badges: {}, streak: 0, lastDay: '', missionDay: '', sound: true, rounds: 0 }, s);
  }
  function saveState() { var a = allState(); a[prof.id] = ST; try { localStorage.setItem(SKEY, JSON.stringify(a)); } catch (e) { } }
  function sk(id) { return ST.skills[id] || (ST.skills[id] = { stars: 0, plays: 0 }); }
  function totalStars() { return MD.skills.reduce(function (n, s) { return n + ((ST.skills[s.id] || {}).stars || 0); }, 0); }
  function worldStars(w) { var l = MD.skills.filter(function (s) { return s.world === w; }); return { got: l.reduce(function (n, s) { return n + ((ST.skills[s.id] || {}).stars || 0); }, 0), max: l.length * 3 }; }
  var BELTS = [['White', '#F4F4F4', 0], ['Yellow', '#FFD84A', .08], ['Orange', '#FF9F3A', .22], ['Green', '#34B26E', .38], ['Blue', '#2E86DE', .54], ['Purple', '#8A5CF6', .7], ['Brown', '#8B5A2B', .85], ['Black', '#222', 1]];
  function belt() { var f = totalStars() / (MD.skills.length * 3), b = BELTS[0]; BELTS.forEach(function (x) { if (f >= x[2]) b = x; }); return b; }
  function recentAcc(id) {
    var log = Hub.data().log, n = 0, ok = 0;
    for (var i = log.length - 1; i >= 0 && n < 12; i--) { var r = log[i]; if (r.p === prof.id && r.a === APP && r.s === id && r.m !== 'try') { n++; ok += (r.ok && !r.h) ? 1 : 0; } }
    return n ? { n: n, acc: ok / n } : null;
  }

  // ---------- sound and fun
  var AC = null;
  function beep(freqs, dur, type) {
    if (!ST || !ST.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      var t = AC.currentTime;
      freqs.forEach(function (f, i) { var o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t + i * dur); g.gain.exponentialRampToValueAtTime(0.18, t + i * dur + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + (i + 1) * dur); o.connect(g); g.connect(AC.destination); o.start(t + i * dur); o.stop(t + (i + 1) * dur + 0.02); });
    } catch (e) { }
  }
  var snd = { ok: function () { beep([660, 880], 0.09); }, no: function () { beep([220, 180], 0.12, 'sine'); }, win: function () { beep([523, 659, 784, 1047], 0.12); } };
  var PRAISE = ['Ninja move! 🥷', 'Boom! 💥', 'Nailed it! 🔨', 'You got it! ⭐', 'Super smart! 🧠', 'Yes yes yes! 🎉', 'Sharp as a katana! ⚔️', 'Math magic! ✨', 'Too easy for you! 😎', 'Epic! 🚀', 'Whoa, nice! 🌟'];
  var NOPE = ['Not yet. Learn from it! 💪', 'Close one! Check below.', 'Oops! Even ninjas miss. 🥷', 'Almost! Look at how it works.', 'Good try! Here is the trick.'];
  var JOKES = ['Why was six afraid of seven? Because seven eight (ate) nine!', 'Why did the student wear glasses in math class? To improve di-vision!', 'What do you call a number that can\'t sit still? A roamin\' numeral!', 'Why is the obtuse angle always upset? Because it is never right!', 'What did zero say to eight? Nice belt!', 'Why did the circle skip class? It was tired of going around in circles!', 'What is a math teacher\'s favorite season? Sum-mer!', 'Why do plants hate math? It gives them square roots!', 'What did the triangle say to the circle? You\'re pointless!', 'Why was the equal sign so humble? It knew it wasn\'t less than or greater than anyone.', 'How do you stay cool in math class? Stand near a fan (a-fan-of-numbers)!', 'What is a fraction\'s favorite pizza? Whatever slice is left over!'];
  function confetti(n) {
    var fx = h('div', { class: 'confetti', 'aria-hidden': 'true' }); document.body.appendChild(fx);
    var em = ['⭐', '✨', '🎉', '🪙', '💥', '🌟', '🥷'];
    for (var i = 0; i < (n || 22); i++) { var p = h('span', { text: pick(em) }); p.style.left = Math.random() * 100 + '%'; p.style.animationDelay = Math.random() * 0.4 + 's'; p.style.animationDuration = 1.2 + Math.random() * 0.9 + 's'; p.style.fontSize = 18 + Math.random() * 20 + 'px'; fx.appendChild(p); }
    setTimeout(function () { fx.remove(); }, 2600);
  }

  // ---------- screens
  function show(node) { root.innerHTML = ''; root.appendChild(node); window.scrollTo(0, 0); }
  function topbar(title, o) {
    o = o || {};
    var b = belt();
    return h('div', { class: 'tb' }, [
      o.back ? h('button', { class: 'ib', 'aria-label': 'Back', onclick: o.back, text: '◀' }) : h('a', { class: 'ib', href: '../', 'aria-label': 'Back to the hub', text: '🏠' }),
      h('div', { class: 'tt', text: title || 'Math Dojo' }),
      h('div', { class: 'tr' }, [
        h('span', { class: 'beltpill', title: b[0] + ' belt' }, [h('i', { style: 'background:' + b[1] }), b[0]]),
        h('span', { class: 'coin', text: '🪙 ' + ST.coins }),
        h('button', { class: 'ib', 'aria-label': 'Sound', text: ST.sound ? '🔊' : '🔇', onclick: function () { ST.sound = !ST.sound; saveState(); this.textContent = ST.sound ? '🔊' : '🔇'; snd.ok(); } }),
        h('button', { class: 'chip', onclick: function () { Hub.pickProfile(function (p) { prof = p; loadState(); S.home(); }, { cancel: true, grade: 6 }); }, 'aria-label': 'Switch player' }, [prof.emoji + ' ' + prof.name])
      ])
    ]);
  }
  var S = {};
  S.home = function () {
    var done = ST.missionDay === today(), tot = totalStars(), max = MD.skills.length * 3, b = belt();
    var mission = h('button', { class: 'mission' + (done ? ' done' : ''), onclick: function () { startMission(); } }, [
      h('div', { class: 'mem', text: done ? '✅' : '🎯' }),
      h('div', { class: 'mt' }, [h('b', { text: done ? 'Mission complete!' : "Today's Mission" }), h('span', { text: done ? 'Come back tomorrow. Or play it again for practice.' : '6 quick questions picked just for you. +30 🪙' })]),
      h('div', { class: 'go', text: done ? 'Again ▶' : 'Start ▶' })
    ]);
    var worlds = MD.worlds.map(function (w) {
      var ws = worldStars(w.id), pct = ws.max ? ws.got / ws.max : 0;
      return h('button', { class: 'world', style: '--c:' + w.color, onclick: function () { S.world(w.id); } }, [
        h('div', { class: 'we', text: w.emoji }), h('div', { class: 'wn', text: w.name }), h('div', { class: 'wb', text: w.eus + ' · ' + w.blurb }),
        h('div', { class: 'bar' }, [h('i', { style: 'width:' + Math.round(pct * 100) + '%' })]), h('div', { class: 'ws', text: '⭐ ' + ws.got + ' / ' + ws.max }), ST.bosses[w.id] ? h('div', { class: 'wk', text: '👑' }) : null
      ]);
    });
    show(h('div', { class: 'screen' }, [
      topbar('Math Dojo'),
      h('div', { class: 'hero' }, [
        h('div', { class: 'av', text: ST.avatar }),
        h('div', { class: 'hi' }, [h('b', { text: 'Hi ' + prof.name + '! ' }), h('span', { text: ST.streak > 1 ? '🔥 ' + ST.streak + ' day streak!' : 'Ready to train?' }), h('div', { class: 'bt' }, [h('div', { class: 'bar big' }, [h('i', { style: 'width:' + Math.round(tot / max * 100) + '%;background:' + b[1] })]), h('small', { text: b[0] + ' belt · ' + tot + ' / ' + max + ' stars' })])]),
        mission
      ]),
      h('div', { class: 'worlds' }, worlds),
      h('div', { class: 'foot' }, [
        h('button', { class: 'btn alt', onclick: S.cheat, text: '📖 Cheat Sheets' }), h('button', { class: 'btn alt', onclick: S.shop, text: '🛍️ Shop' }), h('button', { class: 'btn alt', onclick: S.trophies, text: '🏆 Trophies' })
      ])
    ]));
  };
  S.world = function (wid) {
    var w = MD.worldById[wid], list = MD.skills.filter(function (s) { return s.world === wid; });
    var next = null; list.forEach(function (s) { if (!next && sk(s.id).stars < 3) next = s.id; });
    var cards = list.map(function (s) {
      var r = sk(s.id), ra = recentAcc(s.id);
      return h('button', { class: 'skill' + (s.id === next ? ' next' : ''), onclick: function () { S.skill(s.id); } }, [
        h('div', { class: 'se', text: s.emoji }), h('div', { class: 'sn' }, [h('b', { text: s.name }), h('small', { text: ra ? Math.round(ra.acc * 100) + '% recent' : 'New!' })]),
        h('div', { class: 'stars', text: [1, 2, 3].map(function (i) { return i <= r.stars ? '⭐' : '☆'; }).join('') }), s.id === next ? h('div', { class: 'nx', text: 'Next up' }) : null
      ]);
    });
    var boss = h('button', { class: 'bossbtn', style: '--c:' + w.color, onclick: function () { startBoss(wid); } }, [h('span', { text: ST.bosses[wid] ? '👑' : '👹' }), h('div', {}, [h('b', { text: 'Boss Battle' }), h('small', { text: ST.bosses[wid] ? 'You beat this boss!' : 'Mix of everything in ' + w.name })]), h('em', { text: 'Fight ▶' })]);
    show(h('div', { class: 'screen', style: '--c:' + w.color }, [topbar(w.emoji + ' ' + w.name, { back: S.home }), h('div', { class: 'wsub', text: w.eus + ' · ' + w.blurb }), h('div', { class: 'skills' }, cards), boss]));
  };
  S.skill = function (id, back) {
    var s = MD.skillById[id], w = MD.worldById[s.world], r = sk(id), ra = recentAcc(id);
    function way(key, em, name, desc, fn, star) { return h('button', { class: 'way', onclick: fn }, [h('div', { class: 'wm', text: em }), h('div', {}, [h('b', { text: name }), h('small', { text: desc })]), h('div', { class: 'wst', text: r.stars >= star ? '⭐' : '☆' })]); }
    show(h('div', { class: 'screen', style: '--c:' + w.color }, [
      topbar(s.emoji + ' ' + s.name, { back: back || function () { S.world(s.world); } }),
      h('div', { class: 'skillhead' }, [h('div', { class: 'stars big', text: [1, 2, 3].map(function (i) { return i <= r.stars ? '⭐' : '☆'; }).join('') }), h('small', { text: ra ? 'Recent score: ' + Math.round(ra.acc * 100) + '%' : 'Brand new skill. You got this!' })]),
      h('div', { class: 'ways' }, [
        way('learn', '📖', 'Learn it', 'See the trick, step by step', function () { S.learn(id); }, 0),
        way('try', '🤝', 'Try it', 'Practice with help. Hints included! (1 ⭐)', function () { startRound(id, 'try'); }, 1),
        way('pick', '🎯', 'Pick it', 'Choose the answer on your own (2 ⭐)', function () { startRound(id, 'pick'); }, 2),
        way('type', '🥷', 'Prove it', 'Type the answer. Ninja level! (3 ⭐)', function () { startRound(id, 'type'); }, 3)
      ])
    ]));
  };
  S.learn = function (id, back) {
    var s = MD.skillById[id], w = MD.worldById[s.world], shown = 1;
    var steps = h('ol', { class: 'lsteps' });
    var nextBtn = h('button', { class: 'btn alt', onclick: function () { shown++; draw(); } }, ['Next step ▶']);
    function draw() {
      steps.innerHTML = ''; s.ex.steps.slice(0, shown).forEach(function (t) { steps.appendChild(h('li', { html: pretty2(t) })); });
      var fin = shown >= s.ex.steps.length; nextBtn.style.display = fin ? 'none' : ''; ans.style.display = fin ? '' : 'none';
    }
    var ans = h('div', { class: 'lans', html: 'Answer: <b>' + pretty2(s.ex.a) + '</b>' });
    function pretty2(t) { return String(t).replace(/(\d+)\/(\d+)/g, '<span class="fr"><i>$1</i><b>$2</b></span>'); }
    show(h('div', { class: 'screen', style: '--c:' + w.color }, [
      topbar('📖 ' + s.name, { back: back || function () { S.skill(id); } }),
      h('div', { class: 'learn' }, [
        h('div', { class: 'lcard' }, [h('h3', { text: 'The trick' }), h('ul', {}, s.rule.map(function (t) { return h('li', { html: pretty2(t) }); }))]),
        h('div', { class: 'lcard ex' }, [h('h3', { text: 'Watch it work' }), h('div', { class: 'lq', html: '<b>' + pretty2(s.ex.q) + '</b>' }), steps, nextBtn, ans])
      ]),
      h('div', { class: 'foot' }, [h('button', { class: 'btn', onclick: function () { startRound(id, 'try'); }, text: '🤝 Try it now' })])
    ])); draw();
  };
  S.cheat = function () {
    var cards = [];
    MD.worlds.forEach(function (w) {
      cards.push(h('h3', { class: 'wh', style: 'color:' + w.color, text: w.emoji + ' ' + w.name }));
      MD.skills.filter(function (s) { return s.world === w.id; }).forEach(function (s) { cards.push(h('button', { class: 'cheat', style: '--c:' + w.color, onclick: function () { S.learn(s.id, S.cheat); } }, [h('span', { text: s.emoji }), h('b', { text: s.name })])); });
    });
    show(h('div', { class: 'screen' }, [topbar('📖 Cheat Sheets', { back: S.home }), h('div', { class: 'wsub', text: 'Tap any skill to see the trick. Great for homework!' }), h('div', { class: 'cheats' }, cards)]));
  };
  var SHOP = [['🥷', 0, 'Ninja'], ['🦸', 60, 'Hero'], ['🧙', 80, 'Wizard'], ['🐉', 120, 'Dragon'], ['🤖', 150, 'Robot'], ['🦄', 180, 'Unicorn'], ['👽', 220, 'Alien'], ['🦖', 260, 'T-Rex'], ['🧁', 100, 'Cupcake'], ['🐸', 70, 'Froggo'], ['🚀', 200, 'Rocket'], ['🦊', 90, 'Fox']];
  S.shop = function () {
    var cards = SHOP.map(function (it) {
      var own = ST.owned.indexOf(it[0]) >= 0, cur = ST.avatar === it[0];
      return h('button', { class: 'shopi' + (cur ? ' cur' : ''), onclick: function () {
        if (own) { ST.avatar = it[0]; saveState(); S.shop(); }
        else if (ST.coins >= it[1]) { ST.coins -= it[1]; ST.owned.push(it[0]); ST.avatar = it[0]; saveState(); snd.win(); confetti(); S.shop(); }
        else { snd.no(); this.classList.add('shake'); }
      } }, [h('div', { class: 'sav', text: it[0] }), h('b', { text: it[2] }), h('small', { text: cur ? 'Wearing' : own ? 'Tap to wear' : '🪙 ' + it[1] })]);
    });
    show(h('div', { class: 'screen' }, [topbar('🛍️ Shop', { back: S.home }), h('div', { class: 'wsub', text: 'Spend coins to change your buddy. Earn coins by answering questions!' }), h('div', { class: 'shop' }, cards)]));
  };
  var BADGES = [['first', '🥋', 'First Round', 'Finish any round'], ['star3', '🌟', 'Three Stars', 'Get 3 stars on a skill'], ['five', '🏅', 'Five Masters', '3 stars on 5 skills'], ['perfect', '💯', 'Perfect Round', '5 out of 5 on Pick it or Prove it'], ['streak3', '🔥', 'On Fire', '3 days in a row'], ['mission', '🎯', 'Mission Done', 'Finish a Daily Mission'], ['boss1', '👑', 'Boss Beater', 'Beat a Boss Battle'], ['boss7', '🏆', 'Dojo Master', 'Beat all 7 bosses'], ['coins200', '💰', 'Coin Collector', 'Earn 200 coins']];
  function earn(id) { if (!ST.badges[id]) { ST.badges[id] = Date.now(); var b = BADGES.filter(function (x) { return x[0] === id; })[0]; return b ? [b] : []; } return []; }
  function checkBadges(rd) {
    var nu = [], threes = MD.skills.filter(function (s) { return sk(s.id).stars >= 3; }).length;
    nu = nu.concat(earn('first'));
    if (threes >= 1) nu = nu.concat(earn('star3')); if (threes >= 5) nu = nu.concat(earn('five'));
    if (rd.perfect) nu = nu.concat(earn('perfect')); if (ST.streak >= 3) nu = nu.concat(earn('streak3'));
    if (rd.mode === 'mission') nu = nu.concat(earn('mission'));
    var bc = Object.keys(ST.bosses).length; if (bc >= 1) nu = nu.concat(earn('boss1')); if (bc >= 7) nu = nu.concat(earn('boss7'));
    if (ST.coins >= 200) nu = nu.concat(earn('coins200'));
    return nu;
  }
  S.trophies = function () {
    var cards = BADGES.map(function (b) { var got = ST.badges[b[0]]; return h('div', { class: 'tro' + (got ? ' got' : '') }, [h('div', { class: 'te', text: got ? b[1] : '🔒' }), h('b', { text: b[2] }), h('small', { text: b[3] })]); });
    show(h('div', { class: 'screen' }, [topbar('🏆 Trophies', { back: S.home }), h('div', { class: 'shop' }, cards)]));
  };

  // ---------- rounds
  function startRound(id, mode) {
    var s = MD.skillById[id], w = MD.worldById[s.world];
    play({ title: s.emoji + ' ' + s.name, color: w.color, mode: mode, ids: [id, id, id, id, id], skill: id, world: s.world,
      back: function () { S.skill(id); } });
  }
  function startMission() {
    var weights = MD.skills.map(function (s) { var ra = recentAcc(s.id), wgt = ra ? (1.15 - ra.acc) * (ra.n >= 6 ? 1 : 1.4) : 0.9; if (sk(s.id).stars === 0 && !ra) wgt = 0.6; return { id: s.id, w: Math.max(0.1, wgt) }; });
    var ids = [], cnt = {}, tries = 0;
    while (ids.length < 6 && tries++ < 200) {
      var tot = weights.reduce(function (a, x) { return a + x.w; }, 0), r = Math.random() * tot, c = null;
      for (var i = 0; i < weights.length; i++) { r -= weights[i].w; if (r <= 0) { c = weights[i].id; break; } }
      if (c && (cnt[c] || 0) < 2) { cnt[c] = (cnt[c] || 0) + 1; ids.push(c); }
    }
    play({ title: '🎯 Daily Mission', color: '#FF6F59', mode: 'mission', ids: ids, back: S.home });
  }
  var BOSSES = ['👹', '🐲', '🦖', '👾', '🤖', '🧟', '🦑'];
  function startBoss(wid) {
    var list = MD.skills.filter(function (s) { return s.world === wid; }), ids = [];
    var ordered = shuffle(list).sort(function (a, b) { var x = recentAcc(a.id), y = recentAcc(b.id); return (x ? x.acc : 0.5) - (y ? y.acc : 0.5); });
    for (var i = 0; i < 8; i++) ids.push(ordered[i % ordered.length].id);
    var w = MD.worldById[wid];
    play({ title: '👑 ' + w.name + ' Boss', color: w.color, mode: 'boss', ids: shuffle(ids), world: wid, boss: BOSSES[MD.worlds.indexOf(w)], hp: 6, back: function () { S.world(wid); } });
  }

  function play(o) {
    var queue = o.ids.map(function (id) { return { id: id, retry: false }; }), total = o.ids.length, done = 0, results = [], retries = 0, streak = 0, hp = o.hp || 0, startT = Date.now(), coinsGain = 0, skin = pick(['balloon', 'bubble', 'tile']), ended = false;
    var wrap = h('div', { class: 'screen play', style: '--c:' + o.color });
    var dots = h('div', { class: 'dots' }), streakEl = h('div', { class: 'streakb' }), coinEl = h('div', { class: 'coin' });
    var bossBar = o.boss ? h('div', { class: 'boss' }, [h('span', { class: 'bface', text: o.boss }), h('div', { class: 'bar hp' }, [h('i')]), h('small', { text: 'Boss HP' })]) : null;
    wrap.appendChild(h('div', { class: 'ptop' }, [h('button', { class: 'ib', 'aria-label': 'Quit', text: '✕', onclick: function () { var b = this; if (done === 0 || b.dataset.arm) { cleanup(); o.back(); } else { b.dataset.arm = 1; b.textContent = 'Quit?'; setTimeout(function () { delete b.dataset.arm; b.textContent = '✕'; }, 2500); } } }), h('div', { class: 'ptitle', text: o.title }), dots, streakEl, coinEl]));
    if (bossBar) wrap.appendChild(bossBar);
    var stage = h('div', { class: 'stage' }); wrap.appendChild(stage);
    show(wrap);
    function drawDots(cur) { dots.innerHTML = ''; for (var i = 0; i < total; i++) { var d = h('i'); var r = results[i]; d.className = r ? (r.ok ? 'ok' : 'miss') : (i === done ? 'cur' : ''); dots.appendChild(d); } }
    function drawHud() { coinEl.textContent = '🪙 ' + (ST.coins); streakEl.textContent = streak >= 3 ? '🔥 ' + streak : ''; if (bossBar) bossBar.querySelector('.hp i').style.width = (hp / o.hp * 100) + '%'; }
    var keyHandler = null;
    function cleanup() { if (keyHandler) document.removeEventListener('keydown', keyHandler); keyHandler = null; ended = true; }

    function next() {
      if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
      if (o.boss && hp <= 0) return finish(true);
      if (!queue.length) return finish(false);
      var it = queue.shift(), q = MD.make(it.id); q._retry = it.retry; ask(q, it);
    }

    function ask(q, it) {
      stage.innerHTML = ''; drawDots(); drawHud();
      var wrongs = 0, revealed = (o.mode === 'try') ? 1 : 0, hints = 0, resolved = false, firstGiven = '', firstWhy = '', t0 = Date.now(), typedStr = '', nudged = false;
      var card = h('div', { class: 'pq' }), prompt = h('div', { class: 'prompt', html: q.prompt }), unit = q.unit ? h('div', { class: 'unit', text: 'Answer in ' + q.unit }) : null;
      var steps = h('ol', { class: 'hsteps' }), hintBtn = null, feed = h('div', { class: 'feed' });
      card.appendChild(prompt); if (unit) card.appendChild(unit); card.appendChild(steps);
      if (q._retry) card.insertBefore(h('div', { class: 'retag', text: '🔁 Another one like that. You can do it!' }), prompt);
      function drawSteps() { steps.innerHTML = ''; q.steps.slice(0, revealed).forEach(function (t) { steps.appendChild(h('li', { html: t })); }); if (hintBtn) hintBtn.style.display = (revealed >= q.steps.length || resolved) ? 'none' : ''; }
      var asType = o.mode === 'type' && !q.mc;   // typed answer
      var right = h('div', { class: 'pa' });
      if (o.mode !== 'type' || q.mc) {
        hintBtn = h('button', { class: 'hint', text: o.mode === 'try' ? '💡 Next step' : '💡 Hint', onclick: function () { if (revealed < q.steps.length) { revealed++; hints++; drawSteps(); } } });
      } else if (o.mode === 'type') {
        hintBtn = h('button', { class: 'hint stuck', text: "🤷 I'm stuck", onclick: function () { hints = 9; giveUp(); } });
      }
      if (hintBtn) card.appendChild(hintBtn);
      drawSteps();

      function finishQ(ok, given, why) {
        if (resolved) return; resolved = true;
        var ms = Date.now() - t0, gain = 0;
        Hub.record({ app: APP, skill: q.id, ok: ok, hints: hints, ms: ms, mode: o.mode, given: given || firstGiven, correct: q.answer.replace(/-/g, '−'), prompt: q.prompt, why: why || firstWhy, profile: prof.id });
        if (!q._retry) { results.push({ ok: ok && hints === 0 && !nudged, id: q.id, ms: ms }); done++; }
        if (ok) { streak++; gain = (hints === 0 && wrongs === 0 && !nudged) ? 10 : 5; } else streak = 0;
        if (o.mode === 'try') gain = ok ? 5 : 2;
        ST.coins += gain; coinsGain += gain;
        if (o.boss && ok && hints === 0 && wrongs === 0) hp--;
        if (!ok && !o.boss && !q._retry && retries < 3 && o.mode !== 'try') { retries++; queue.splice(Math.min(2, queue.length), 0, { id: q.id, retry: true }); }
        saveState(); drawDots(); drawHud();
        right.classList.add('locked');
        var good = ok;
        if (good) { snd.ok(); if (streak && streak % 3 === 0) confetti(14); }
        else snd.no();
        feed.className = 'feed show ' + (good ? 'good' : 'bad');
        feed.innerHTML = '';
        var head = h('div', { class: 'fh', text: good ? pick(PRAISE) + (gain ? '  +' + gain + ' 🪙' : '') : pick(NOPE) });
        feed.appendChild(head);
        if (!good) {
          feed.appendChild(h('div', { class: 'fa', html: 'Answer: <b>' + pretty(MD.fmtAns(q, q.answer)) + '</b>' + (q.unit ? ' ' + q.unit : '') }));
          if (why) feed.appendChild(h('div', { class: 'fw', text: '💭 ' + why }));
          if (q.steps.length) feed.appendChild(h('ol', { class: 'fs' }, q.steps.map(function (t) { return h('li', { html: t }); })));
        } else if (q.why && o.mode !== 'try') feed.appendChild(h('div', { class: 'fw ok', html: q.why.replace(/-/g, '−') }));
        var nb = h('button', { class: 'btn big', text: (!queue.length || (o.boss && hp <= 0)) ? 'Finish ▶' : 'Next ▶', onclick: next });
        feed.appendChild(nb); setTimeout(function () { try { nb.focus({ preventScroll: true }); } catch (e) { } feed.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 60);
      }
      function giveUp() { if (!resolved) { firstGiven = firstGiven || '(stuck)'; finishQ(false, firstGiven, firstWhy || 'Needed help'); } }
      function submit(input, choice, btn) {
        if (resolved) return;
        var res = choice ? { ok: !!choice.ok, why: choice.w || '' } : MD.check(q, input);
        if (res.ok) { if (btn) btn.classList.add('right'); finishQ(wrongs === 0 && !firstGiven, input, ''); return; }
        if (res.close) { nudged = true; if (!firstGiven) { firstGiven = input; firstWhy = res.why; } msg(res.why + '. Try again!'); typedStr = ''; setDisp(); return; }
        wrongs++; if (!firstGiven) { firstGiven = choice ? choice.t.replace(/<[^>]+>/g, '') : input; firstWhy = res.why; }
        if (btn) { btn.classList.add('wrong'); btn.disabled = true; }
        if (o.mode === 'try') {
          snd.no(); if (revealed < q.steps.length) { revealed++; drawSteps(); }
          msg((res.why ? res.why + '. ' : 'Not quite. ') + 'Check the next step!');
          if (wrongs >= 3) { revealed = q.steps.length; drawSteps(); finishQ(false, firstGiven, firstWhy); }
          typedStr = ''; setDisp();
        } else { finishQ(false, firstGiven, res.why); }
      }
      function msg(t) { var m = card.querySelector('.tmsg'); if (!m) { m = h('div', { class: 'tmsg' }); card.appendChild(m); } m.textContent = t; m.classList.remove('pop'); void m.offsetWidth; m.classList.add('pop'); }
      var disp = null;
      function setDisp() { if (disp) disp.innerHTML = (typedStr ? pretty2(typedStr) : '<span class="ph">type here</span>'); }
      function pretty2(s) { return s.replace(/-/g, '−').replace(/>=/g, '≥').replace(/<=/g, '≤').replace(/</g, '&lt;'); }

      if (!asType) {
        var chs = MD.choicesFor(q, 4), grid = h('div', { class: 'choices ' + skin + (chs.some(function (c) { return /^</.test(c.t); }) ? ' fig' : '') });
        chs.forEach(function (c, i) {
          var b = h('button', { class: 'choice c' + (i % 4), html: /^</.test(c.t) ? c.t : pretty(c.t), onclick: function () { submit(c.t, c, b); } });
          grid.appendChild(b);
        });
        right.appendChild(grid);
      } else {
        disp = h('div', { class: 'disp', 'aria-live': 'polite' }); right.appendChild(disp);
        var keys = [];
        var rows = [['7', '8', '9', '⌫'], ['4', '5', '6', '−'], ['1', '2', '3', q.alg === 'ineq' ? '<' : '/'], ['0', q.alg === 'expr' || q.alg === 'ineq' ? 'x' : '.', q.alg === 'ineq' ? '>' : q.alg === 'expr' ? '+' : '/', 'C']];
        if (q.alg === 'ineq') rows = [['7', '8', '9', '⌫'], ['4', '5', '6', '−'], ['1', '2', '3', 'x'], ['0', '<', '>', 'C'], ['≤', '≥', '.', '']];
        else if (q.alg === 'expr') rows = [['7', '8', '9', '⌫'], ['4', '5', '6', '−'], ['1', '2', '3', '+'], ['0', 'x', '.', 'C']];
        else rows = [['7', '8', '9', '⌫'], ['4', '5', '6', '−'], ['1', '2', '3', '/'], ['0', '.', '', 'C']];
        function press(k) {
          if (resolved) return;
          if (k === '⌫') typedStr = typedStr.slice(0, -1); else if (k === 'C') typedStr = ''; else if (typedStr.length < 14) typedStr += (k === '−' ? '-' : k === '≤' ? '<=' : k === '≥' ? '>=' : k);
          setDisp();
        }
        var pad = h('div', { class: 'pad' });
        rows.forEach(function (r) { r.forEach(function (k) { pad.appendChild(k === '' ? h('i') : h('button', { class: 'key' + (k === '⌫' || k === 'C' ? ' fn' : ''), text: k, onclick: function () { press(k); } })); }); });
        right.appendChild(pad);
        right.appendChild(h('button', { class: 'btn big go', text: 'Check ✓', onclick: function () { if (typedStr) submit(typedStr.replace(/−/g, '-')); } }));
        keyHandler = function (e) {
          if (resolved) { if (e.key === 'Enter') { var b = feed.querySelector('.btn'); if (b) b.click(); } return; }
          if (e.key === 'Enter') { if (typedStr) submit(typedStr); return; }
          if (e.key === 'Backspace') { press('⌫'); return; }
          if (/^[0-9.\/x+<>=-]$/.test(e.key)) { typedStr += e.key; setDisp(); }
        };
        document.addEventListener('keydown', keyHandler); setDisp();
      }
      stage.appendChild(h('div', { class: 'pbody' }, [card, right])); stage.appendChild(feed);
    }

    function finish(bossWon) {
      cleanup();
      var n = results.length, clean = results.filter(function (r) { return r.ok; }).length, score = n ? clean / n : 0, now = today(), secs = Math.round((Date.now() - startT) / 1000);
      var stars = 0, note = '', first = false;
      if (o.mode === 'try') stars = 1; else if (o.mode === 'pick') stars = clean >= 4 ? 2 : 0; else if (o.mode === 'type') stars = clean >= 4 ? 3 : 0;
      var gain = 0;
      if (o.skill) { var r = sk(o.skill); r.plays++; if (stars > r.stars) { r.stars = stars; first = true; } }
      if (score >= 0.8 && o.mode !== 'try') gain += 20;
      if (o.mode === 'mission' && ST.missionDay !== now) { ST.missionDay = now; gain += 30; }
      if (o.boss && bossWon) { gain += 50; if (!ST.bosses[o.world]) ST.bosses[o.world] = true; }
      ST.coins += gain; coinsGain += gain; ST.rounds++;
      if (ST.lastDay !== now) { ST.streak = (ST.lastDay === yesterday()) ? ST.streak + 1 : 1; ST.lastDay = now; }
      var nu = checkBadges({ mode: o.mode, perfect: n >= 5 && clean === n && (o.mode === 'pick' || o.mode === 'type') });
      saveState();
      Hub.session({ profile: prof.id, app: APP, skill: o.skill || o.mode, mode: o.mode, n: n, ok: clean, ms: Date.now() - startT });
      var win = o.boss ? bossWon : score >= 0.8 || o.mode === 'try';
      if (win) { snd.win(); confetti(30); } else snd.no();
      var title = o.boss ? (bossWon ? 'BOSS DEFEATED! 👑' : 'The boss got away... 😤') : o.mode === 'try' ? 'Nice practice! 🤝' : score === 1 ? 'PERFECT! 💯' : score >= 0.8 ? 'Awesome job! 🎉' : score >= 0.6 ? 'Getting there! 💪' : 'Keep going, ninja! 🥷';
      if (o.mode === 'pick' && stars === 0 && n) note = 'Get 4 out of 5 to earn the 2nd star. Try again or check the cheat sheet!';
      if (o.mode === 'type' && stars === 0 && n) note = 'Get 4 out of 5 to earn the 3rd star. Practice with Try it first!';
      if (o.boss && !bossWon) note = 'You hit it ' + (o.hp - hp) + ' time' + (o.hp - hp === 1 ? '' : 's') + '. Practice the skills below and fight again!';
      var weak = results.filter(function (r) { return !r.ok; }).map(function (r) { return r.id; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
      var again = function () { if (o.mode === 'mission') startMission(); else if (o.boss) startBoss(o.world); else startRound(o.skill, o.mode); };
      var nextMode = { try: 'pick', pick: 'type' }[o.mode];
      var btns = [h('button', { class: 'btn', onclick: again, text: 'Play again 🔁' })];
      if (o.skill && nextMode && (o.mode === 'try' || stars >= 2)) btns.unshift(h('button', { class: 'btn go', onclick: function () { startRound(o.skill, nextMode); }, text: nextMode === 'pick' ? 'Next: Pick it 🎯 ▶' : 'Next: Prove it 🥷 ▶' }));
      if (o.skill && o.mode !== 'try' && stars === 0) btns.unshift(h('button', { class: 'btn go', onclick: function () { S.learn(o.skill, function () { S.skill(o.skill); }); }, text: '📖 Review the trick' }));
      btns.push(h('button', { class: 'btn alt', onclick: o.back, text: 'Back' }));
      var weakEl = weak.length ? h('div', { class: 'weak' }, [h('b', { text: 'Practice these:' })].concat(weak.map(function (id) { var s = MD.skillById[id]; return h('button', { class: 'chip', onclick: function () { S.learn(id, S.home); }, text: s.emoji + ' ' + s.name }); }))) : null;
      show(h('div', { class: 'screen results', style: '--c:' + o.color }, [
        topbar('Results', { back: o.back }),
        h('div', { class: 'rcard' }, [
          h('div', { class: 'rav', text: ST.avatar }), h('h2', { text: title }),
          o.mode !== 'try' && !o.boss ? h('div', { class: 'rscore', text: clean + ' / ' + n + ' on your own' }) : h('div', { class: 'rscore', text: o.boss ? (bossWon ? 'Boss HP: 0' : 'Boss HP left: ' + hp) : 'You finished! Practice makes progress.' }),
          h('div', { class: 'rstars', text: o.skill ? [1, 2, 3].map(function (i) { return i <= sk(o.skill).stars ? '⭐' : '☆'; }).join('') : '' }),
          first && stars ? h('div', { class: 'newstar', text: '✨ New star earned!' }) : null,
          h('div', { class: 'rcoins', text: '+' + coinsGain + ' 🪙' + (o.mode === 'mission' && gain >= 30 ? ' (mission bonus!)' : '') }),
          note ? h('div', { class: 'rnote', text: note }) : null,
          nu.length ? h('div', { class: 'rbadge' }, nu.map(function (b) { return h('span', { text: b[1] + ' ' + b[2] + '!' }); })) : null,
          weakEl,
          h('div', { class: 'joke' }, [h('small', { text: 'Sensei Joke 🥷' }), h('div', { text: pick(JOKES) })]),
          h('div', { class: 'rbtns' }, btns)
        ])
      ]));
    }
    next();
  }

  // ---------- boot
  function boot() {
    function go(p) {
      prof = p; loadState(); saveState();
      var hash = location.hash.replace('#', ''), m;
      if ((m = hash.match(/skill=([\w-]+)/)) && MD.skillById[m[1]]) { S.skill(m[1], S.home); }
      else if ((m = hash.match(/world=(w\d)/)) && MD.worldById[m[1]]) S.world(m[1]);
      else if (/mission/.test(hash)) startMission();
      else S.home();
    }
    var cur = Hub.current();
    if (cur) go(cur); else Hub.pickProfile(go, { grade: 6 });
  }
  window.MDApp = { S: S, boot: boot };
  boot();
})();
