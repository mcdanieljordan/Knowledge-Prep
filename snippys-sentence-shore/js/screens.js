/* screens.js: levels, lessons, home map, results, homework, trophies, silly slots, grown-up corner */
(function () {
  'use strict';
  var SS = window.SS, h = SS.h, scr = (SS.screens = {});
  function S() { return SS.state; }
  function hud() { if (SS.hud) SS.hud(); }

  // ======================================================================
  // question builders
  function sentQs(n, tiers, kind, part, skill, support, extra, sents) {
    sents = sents || SS.pickSentences(n, { tiers: tiers });
    return sents.map(function (st) { return Object.assign({ kind: kind, st: st, part: part, skill: skill, support: support }, extra || {}); });
  }
  function fragMix(n, okCount) {
    var bad = ['nosubj', 'nopred', 'both', 'thought'], pools = {}, bads = [], k = 0, g = 0;
    var oks = SS.shuffle(SS.frags.filter(function (f) { return f.ok; })).slice(0, okCount);
    bad.forEach(function (w) { pools[w] = SS.shuffle(SS.frags.filter(function (f) { return f.why === w; })); });
    while (oks.length + bads.length < n && g++ < 60) { var w = bad[k++ % 4]; if (pools[w].length) bads.push(pools[w].pop()); }
    return SS.shuffle(oks.concat(bads));
  }
  function fixMix(n) {
    var by = { sub: [], pred: [], thought: [], both: [] }, order = ['sub', 'pred', 'thought', 'both'], out = [], k = 0, g = 0;
    SS.fixes.forEach(function (f) { by[f.need].push(f); });
    order.forEach(function (o) { by[o] = SS.shuffle(by[o]); });
    while (out.length < n && g++ < 80) { var key = order[k++ % 4]; if (by[key].length) out.push(by[key].pop()); }
    return SS.shuffle(out);
  }
  function matchPickQs(n) {
    var pool = SS.shuffle(SS.matches), out = [];
    for (var i = 0; i < n; i++) {
      var m = pool[i];
      var others = SS.shuffle(SS.matches.filter(function (x) { return x.d !== m.d; })).slice(0, 2);
      out.push({ kind: 'matchPick', m: m, opts: [m.pred].concat(others.map(function (x) { return x.pred; })), skill: 'match', support: 2 });
    }
    return out;
  }
  function matchDragQs(rounds) {
    var all = SS.shuffle(SS.matches), out = [];
    for (var i = 0; i < rounds; i++) out.push({ kind: 'matchDrag', ms: all.slice(i * 3, i * 3 + 3), skill: 'match', support: 1, noRetry: true });
    return out;
  }
  function buildQs(n) {
    var sents = SS.pickSentences(n * 2, { tiers: [1, 2] }).filter(function (s) { return s.text.indexOf(' and ') < 0; }).slice(0, n);
    return sents.map(function (st) { return { kind: 'buildWords', st: st, skill: 'build', support: 0 }; });
  }
  function bossQs() {
    var ss = SS.pickSentences(7, { tiers: [2, 3] });
    var q = sentQs(0, null, 'snip', null, 'snip', 0, null, ss.slice(0, 3));
    q = q.concat(sentQs(0, null, 'tapWords', 'sub', 'subject', 0, null, ss.slice(3, 5)));
    q = q.concat(sentQs(0, null, 'tapWords', 'pred', 'predicate', 0, null, ss.slice(5, 7)));
    q = q.concat(fragMix(2, 1).map(function (f) { return { kind: 'cfReason', f: f, askWhy: true, skill: 'cf', support: 0 }; }));
    q = q.concat(fixMix(1).map(function (fx) { return { kind: 'fixPick', fx: fx, mode: 'identify', skill: 'fix', support: 0 }; }));
    return SS.shuffle(q);
  }

  // ======================================================================
  // levels
  var LV = (SS.levels = [
    { id: 'L1', name: 'Subject Shells', ask: 'WHO or WHAT?', emoji: '🐚', blurb: 'Find the complete subject.', ways: [
      { name: 'Look & Tap', icon: '👀', blurb: 'Snippy helps you step by step.', make: function () { return sentQs(6, [1], 'guided2', 'sub', 'subject', 2); } },
      { name: 'Pop the Bubble', icon: '🫧', blurb: 'Pick the right bubble. Hints help!', make: function () { return sentQs(8, [1, 2], 'bubbles', 'sub', 'subject', 1); } },
      { name: 'Tap the Words', icon: '👆', blurb: 'Do it all on your own!', make: function () { return sentQs(8, [2, 3], 'tapWords', 'sub', 'subject', 0); } }] },
    { id: 'L2', name: 'Predicate Pier', ask: 'DOES or IS?', emoji: '🌊', blurb: 'Find the complete predicate.', ways: [
      { name: 'Look & Tap', icon: '👀', blurb: 'Snippy helps you step by step.', make: function () { return sentQs(6, [1], 'guided2', 'pred', 'predicate', 2); } },
      { name: 'Pop the Bubble', icon: '🫧', blurb: 'Pick the right bubble. Hints help!', make: function () { return sentQs(8, [1, 2], 'bubbles', 'pred', 'predicate', 1); } },
      { name: 'Tap the Words', icon: '👆', blurb: 'Do it all on your own!', make: function () { return sentQs(8, [2, 3], 'tapWords', 'pred', 'predicate', 0); } }] },
    { id: 'L3', name: 'Snip It!', ask: 'Cut it in two!', emoji: '✂️', blurb: 'Snip sentences into two halves.', ways: [
      { name: 'Glowing Clue', icon: '💡', blurb: 'The action word glows to help you.', make: function () { return sentQs(6, [1], 'snip', null, 'snip', 2); } },
      { name: 'Snip with Hints', icon: '✂️', blurb: 'Find the action word yourself.', make: function () { return sentQs(8, [1, 2], 'snip', null, 'snip', 1); } },
      { name: 'Snip & Label', icon: '🏷️', blurb: 'Snip, then name the subject half.', make: function () { return sentQs(8, [2, 3], 'snip', null, 'snip', 0, { label: true }); } }] },
    { id: 'L4', name: 'Fragment Detective', ask: 'Sentence or piece?', emoji: '🔍', blurb: 'Tell sentences from fragments.', ways: [
      { name: '3 Questions', icon: '❓', blurb: 'Answer 3 questions about each one.', make: function () { return fragMix(6, 2).map(function (f) { return { kind: 'checklist', f: f, skill: 'cf', support: 2 }; }); } },
      { name: 'Sentence or Piece?', icon: '🕵️', blurb: 'Decide, then say what is missing.', make: function () { return fragMix(8, 3).map(function (f) { return { kind: 'cfReason', f: f, askWhy: true, skill: 'cf', support: 1 }; }); } },
      { name: 'Sort the Shells', icon: '🧺', blurb: 'Drag cards into the right bucket.', make: function () { return [fragMix(6, 3), fragMix(6, 3)].map(function (it) { return { kind: 'sortBuckets', items: it, skill: 'cf', support: 0, noRetry: true }; }); } }] },
    { id: 'L5', name: 'Fix-It Shop', ask: 'Make it whole!', emoji: '🛠️', blurb: 'Fix fragments into sentences.', ways: [
      { name: 'Fix with a Clue', icon: '🧩', blurb: 'A clue tells what is missing.', make: function () { return fixMix(6).map(function (fx) { return { kind: 'fixPick', fx: fx, mode: 'label', skill: 'fix', support: 2 }; }); } },
      { name: 'Fix It!', icon: '🔧', blurb: 'Pick the piece that fixes it.', make: function () { return fixMix(8).map(function (fx) { return { kind: 'fixPick', fx: fx, mode: 'pick', skill: 'fix', support: 1 }; }); } },
      { name: 'Detective Fixer', icon: '🕵️', blurb: 'Find what is missing, then fix it.', make: function () { return fixMix(8).map(function (fx) { return { kind: 'fixPick', fx: fx, mode: 'identify', skill: 'fix', support: 0 }; }); } }] },
    { id: 'L6', name: 'Build-a-Sentence', ask: 'Put it together!', emoji: '🏰', blurb: 'Match and build whole sentences.', ways: [
      { name: 'What Fits?', icon: '🤔', blurb: 'Pick the ending that makes sense.', make: function () { return matchPickQs(6); } },
      { name: 'Match Up', icon: '🔗', blurb: 'Drag the endings to their subjects.', make: function () { return matchDragQs(3); } },
      { name: 'Word Builder', icon: '🧱', blurb: 'Build a sentence word by word.', make: function () { return buildQs(6); } }] },
    { id: 'L7', name: 'Crab King', ask: 'The big boss!', emoji: '👑', boss: true, blurb: 'Show everything you learned!', ways: [
      { name: 'Beat the Crab King', icon: '👑', blurb: '10 questions. Use all your tricks!', make: bossQs }] }
  ]);
  function byId(id) { return LV.filter(function (l) { return l.id === id; })[0]; }
  function idxOf(id) { for (var i = 0; i < LV.length; i++) if (LV[i].id === id) return i; return -1; }

  SS.levelOpen = function (id) {
    var i = idxOf(id);
    if (S().unlockAll || i <= 0) return true;
    return SS.getWay(LV[i - 1].id, 3).stars >= 2 || (LV[i - 1].boss && SS.getWay(LV[i - 1].id, 1).stars >= 1);
  };
  SS.wayOpen = function (id, w) { return S().unlockAll || w === 1 || SS.getWay(id, w - 1).stars >= 1; };
  function levelDone(L) { return L.boss ? SS.getWay(L.id, 1).stars >= 2 : SS.getWay(L.id, 3).stars >= 2; }

  // ======================================================================
  // lessons
  var LESSONS = {
    L1: [
      { t: 'Two halves!', p: 'Every sentence has **two halves**. Each half has its own job.', ex: { sub: 'The little puppy', pred: 'chased a butterfly.', show: 'both', cut: true }, pose: 'happy' },
      { t: 'The SUBJECT', p: 'The **subject** tells **WHO or WHAT** the sentence is about. Who chased a butterfly? **The little puppy!**', ex: { sub: 'The little puppy', pred: 'chased a butterfly.', show: 'sub' } },
      { t: 'Find the action word', p: 'Here is a trick! Find the **action word** (what someone does). The subject is **everything BEFORE it**.', ex: { sub: 'My older sister', pred: 'plays the piano.', show: 'sub', verb: true } },
      { t: 'The COMPLETE subject', p: 'The **complete subject** has **ALL** the words about the who or what. “puppy” is only a piece. **“The little brown puppy”** is the complete subject!', ex: { sub: 'The little brown puppy', pred: 'sat down.', show: 'sub' }, pose: 'cheer' }
    ],
    L2: [
      { t: 'The PREDICATE', p: 'The **predicate** tells what the subject **DOES or IS**. What did the lion do? **roared loudly!**', ex: { sub: 'The hungry lion', pred: 'roared loudly.', show: 'pred' }, pose: 'happy' },
      { t: 'Start at the action word', p: 'The predicate **starts at the action word** and goes **all the way to the period**.', ex: { sub: 'Our school bus', pred: 'arrived early.', show: 'pred', verb: true } },
      { t: 'The COMPLETE predicate', p: '“chased” is only a piece. **“chased a butterfly.”** is the complete predicate!', ex: { sub: 'The little puppy', pred: 'chased a butterfly.', show: 'pred' } },
      { t: '“Is” counts too!', p: 'Sometimes the action word is **is** or **are**. The predicate still starts there!', ex: { sub: 'The sky', pred: 'is blue and bright.', show: 'pred', verb: true }, pose: 'cheer' }
    ],
    L3: [
      { t: 'Snip it!', p: 'Snippy can **snip** a sentence into **two halves**. Snip, snip!', ex: { sub: 'The baby', pred: 'laughed at the funny clown.', show: 'both', cut: true }, pose: 'snip' },
      { t: 'Where do I snip?', p: 'Find the **action word**. Snip **right before it**.', ex: { sub: 'My grandmother', pred: 'baked delicious cookies.', show: 'none', verb: true } },
      { t: 'Name the halves', p: 'The **first half** is the **subject** (WHO or WHAT). The **second half** is the **predicate** (DOES or IS).', ex: { sub: 'The students', pred: 'walked to the library.', show: 'both', cut: true }, pose: 'cheer' }
    ],
    L4: [
      { t: 'What is a sentence?', p: 'A **sentence** is a **complete thought**. It makes sense all by itself.', ex: { sub: 'The dog', pred: 'wagged its tail.', show: 'both' }, pose: 'happy' },
      { t: 'Three questions', p: 'Ask 3 questions:\n**1.** Is there a WHO or WHAT?\n**2.** Is there a DOES or IS?\n**3.** Does it finish the thought?' },
      { t: 'Just a piece', p: 'If ANY answer is **No**, it is just a **piece** (a fragment). This one has no WHO or WHAT and no DOES or IS. It only tells where.', ex: { frag: 'Under the kitchen table.' } },
      { t: 'Sneaky pieces', p: 'Some pieces start a thought but do not finish it. After the school bell rang… then what? It leaves us hanging!', ex: { frag: 'After the school bell rang.' }, pose: 'think' }
    ],
    L5: [
      { t: 'Fix it!', p: 'A fragment can be **fixed**! Just add the missing piece.', ex: { fix: { pre: '', piece: 'The boy', post: 'ran down the hill.' } }, pose: 'happy' },
      { t: 'What is missing?', p: 'Is it missing a **WHO or WHAT**? A **DOES or IS**? Or the **rest of the thought**? Ask the three questions!' },
      { t: 'Read it out loud', p: 'After you fix it, **read it out loud**. Does it sound finished? Then you did it!', ex: { sub: 'My favorite stuffed bear', pred: 'sits on my bed.', show: 'both' }, pose: 'cheer' }
    ],
    L6: [
      { t: 'Put it together', p: 'A **subject** plus a **predicate** makes a **sentence**!', ex: { sub: 'The baker', pred: 'made bread in the morning.', show: 'both' }, pose: 'happy' },
      { t: 'Make sense?', p: 'The two halves should **make sense** together. “The baker made bread.” makes sense!\nA silly one like “The baker barked at the moon.” is still a complete sentence, but it is silly!', ex: { sub: 'The fish', pred: 'swam in the bowl.', show: 'both' } },
      { t: 'Capital and period', p: 'Start with a **capital letter**. End with a **period**. Now you can build any sentence!', ex: { sub: 'The farmer', pred: 'milked the cows.', show: 'both' }, pose: 'cheer' }
    ]
  };

  function halvesEl(st) {
    var L = h('div', { class: 'half hsub' }), R = h('div', { class: 'half hpred' });
    var lw = h('div', { class: 'sent' }), rw = h('div', { class: 'sent' });
    st.words.forEach(function (w, i) { (i < st.s ? lw : rw).appendChild(h('span', { class: 'w ' + (i < st.s ? 'is-sub' : 'is-pred') }, w)); });
    L.appendChild(lw); R.appendChild(rw);
    L.appendChild(h('div', { class: 'cap' }, 'SUBJECT · WHO or WHAT')); R.appendChild(h('div', { class: 'cap' }, 'PREDICATE · DOES or IS'));
    return h('div', { class: 'halves' }, L, R);
  }
  function exEl(ex) {
    var box = h('div', { class: 'ex' });
    if (ex.frag) { box.appendChild(h('div', { class: 'fragcard' }, ex.frag)); return box; }
    if (ex.fix) {
      var f = ex.fix, before = [f.pre, f.post].filter(Boolean).join(' ');
      box.appendChild(h('div', { class: 'fragcard' }, before.charAt(0).toUpperCase() + before.slice(1)));
      box.appendChild(h('div', { class: 'arrow' }, '⬇ add a piece'));
      var line = h('div', { class: 'fixline' });
      if (f.pre) line.appendChild(h('span', { class: 'fpart' }, f.pre));
      line.appendChild(h('span', { class: 'slot filled' }, f.piece));
      if (f.post) line.appendChild(h('span', { class: 'fpart' }, f.post));
      box.appendChild(line); return box;
    }
    var st = SS.mkSentence(ex.sub, ex.pred);
    if (ex.cut) { box.appendChild(halvesEl(st)); return box; }
    var s = SS.sentenceEl(st, false);
    if (ex.show && ex.show !== 'none') SS.paint(s, st, ex.show);
    if (ex.verb) { var v = s.chips[st.s]; v.classList.add('verb'); v.appendChild(h('small', { class: 'vtag' }, 'ACTION')); }
    box.appendChild(s);
    if (ex.show && ex.show !== 'none') box.appendChild(SS.tagRow(ex.show));
    return box;
  }

  scr.lesson = function (id, idx) {
    SS.current = 'lesson'; hud();
    var L = byId(id), slides = LESSONS[id], sl = slides[idx], last = idx === slides.length - 1;
    var crab = SS.crab(sl.pose || 'idle');
    var dots = h('div', { class: 'dots lessondots' }); slides.forEach(function (_, i) { dots.appendChild(h('i', { class: i === idx ? 'cur' : (i < idx ? 'ok' : '') })); });
    var text = h('div', { class: 'ltext' });
    sl.p.split('\n').forEach(function (line) { var p = h('p'); SS.rich(p, line); text.appendChild(p); });
    var nav = h('div', { class: 'row lessonnav' },
      idx > 0 ? h('button', { class: 'btn ghost', onclick: function () { scr.lesson(id, idx - 1); } }, '← Back') : h('span'),
      h('button', { class: 'btn ghost', onclick: function () { SS.speak(sl.t + '. ' + sl.p.replace(/\*\*/g, '').replace(/\n/g, ' ')); } }, '🔊 Read it'),
      h('div', { class: 'grow' }),
      h('button', { class: 'btn primary big', onclick: function () {
        if (last) { S().seen = S().seen || {}; S().seen[id] = 1; SS.save(); SS.snd.cheer(); scr.level(id); }
        else { SS.snd.pop(); scr.lesson(id, idx + 1); }
      } }, last ? 'Let’s play! ➜' : 'Next ➜'));
    var root = h('div', { class: 'lesson' },
      h('div', { class: 'p-top' }, h('button', { class: 'btn ghost small', onclick: function () { scr.level(id); } }, '✕ Close'),
        h('div', { class: 'p-title' }, L.emoji + ' ' + L.name + ': Watch Snippy'), dots),
      h('div', { class: 'lbody' }, h('div', { class: 'p-side' }, crab),
        h('div', { class: 'lcard card' }, h('h2', null, sl.t), text, sl.ex ? exEl(sl.ex) : null)),
      nav);
    SS.mount(root);
    if (SS.state.settings.read) SS.speak(sl.t + '. ' + sl.p.replace(/\*\*/g, '').replace(/\n/g, ' '));
  };

  // ======================================================================
  // play flow + results
  function playWay(L, w) {
    var way = L.ways[w - 1];
    return SS.runSession({ qs: way.make(), title: L.emoji + ' ' + L.name + ' · ' + way.name, lv: L.id, way: w, boss: !!L.boss }).then(function (res) {
      hud();
      if (!res) return scr.level(L.id);
      var st = res.rec.stars, ctx = { title: L.name + ' · ' + way.name, res: res, again: function () { playWay(L, w); }, back: function () { scr.level(L.id); }, backLabel: 'Back to ' + L.name };
      if (L.boss) {
        ctx.note = st >= 2 ? 'You beat the Crab King! 👑' : 'The Crab King is tough! Try again!';
        ctx.next = st >= 2 ? { label: 'Back to the map', fn: scr.home } : null;
      } else if (w < 3) {
        ctx.note = st === 3 ? 'PERFECT! You are a sentence superstar!' : st === 2 ? 'Great job!' : 'Good try! Practice makes a pro.';
        ctx.next = { label: 'Next: Way ' + (w + 1) + ' ➜', fn: function () { playWay(L, w + 1); } };
      } else if (st >= 2) {
        var nl = LV[idxOf(L.id) + 1];
        ctx.note = 'LEVEL COMPLETE! 🎉 ' + (st === 3 ? 'Three stars!' : 'Great work!');
        ctx.next = nl ? { label: 'Next level: ' + nl.name + ' ➜', fn: function () { scr.level(nl.id); } } : { label: 'Back to the map', fn: scr.home };
      } else {
        ctx.note = 'So close! Let’s practice a little more, then try again.';
        ctx.next = { label: 'Practice Way 2', fn: function () { playWay(L, 2); } };
      }
      scr.results(ctx);
    });
  }
  SS.playWay = playWay;

  scr.results = function (ctx) {
    SS.current = 'results'; hud();
    var rec = ctx.res.rec, stars = rec.stars;
    var starRow = h('div', { class: 'bigstars' });
    for (var i = 0; i < 3; i++) starRow.appendChild(h('span', { class: 'bigstar' + (i < stars ? ' on' : ''), style: 'animation-delay:' + (0.25 + i * 0.35) + 's' }, '★'));
    var badges = h('div', { class: 'newbadges' });
    ctx.res.badges.forEach(function (b) { badges.appendChild(h('div', { class: 'badge got' }, h('span', { class: 'be' }, b.e), h('b', null, 'New badge: ' + b.n))); });
    var root = h('div', { class: 'results' },
      h('div', { class: 'rcard card' },
        SS.crab(stars >= 2 ? 'cheer' : 'happy', ctx.res && ctx.king),
        h('h2', null, ctx.note),
        starRow,
        h('p', { class: 'rline' }, h('b', null, Math.round(rec.score * 100) + '%'), ' correct on the first try  ·  ', h('b', null, '+' + rec.shells + ' 🐚')),
        badges,
        h('div', { class: 'row center wrap' },
          h('button', { class: 'btn ghost', onclick: ctx.again }, '↻ Play again'),
          h('button', { class: 'btn ghost', onclick: ctx.back }, ctx.backLabel || 'Back'),
          ctx.next ? h('button', { class: 'btn primary big', onclick: ctx.next.fn }, ctx.next.label) : null)));
    SS.mount(root);
    for (var k = 0; k < stars; k++) (function (n) { setTimeout(function () { SS.snd.star(); }, 300 + n * 350); })(k);
    if (stars >= 2) { SS.snd.cheer(); SS.confetti(46); } else SS.snd.ok();
    if (ctx.res.badges.length) setTimeout(function () { SS.snd.cheer(); SS.confetti(30); }, 1200);
  };

  // ======================================================================
  // home map
  function pips(L) {
    var d = h('div', { class: 'pips' });
    L.ways.forEach(function (_, i) { d.appendChild(h('i', { class: 's' + SS.getWay(L.id, i + 1).stars })); });
    return d;
  }
  scr.home = function () {
    SS.current = 'home'; hud();
    var played = Object.keys(S().ways).length > 0;
    var cur = null;
    LV.forEach(function (L) { if (!cur && SS.levelOpen(L.id) && !levelDone(L)) cur = L.id; });
    var msg = played ? 'Welcome back, ' + S().name + '! You have ' + S().shells + ' shells!' : 'Hi ' + S().name + '! I’m Snippy! Let’s snip some sentences together!';
    var map = h('div', { class: 'map' });
    LV.forEach(function (L, i) {
      var open = SS.levelOpen(L.id), done = levelDone(L);
      var n = h('button', { class: 'node n' + (i + 1) + (open ? '' : ' locked') + (cur === L.id ? ' current' : '') + (done ? ' done' : '') + (L.boss ? ' bossnode' : ''), 'aria-label': L.name,
        onclick: function () {
          if (!open) { SS.snd.no(); SS.toast('Finish ' + LV[i - 1].name + ' to open this one!'); return; }
          SS.snd.pop(); scr.level(L.id);
        } },
        h('span', { class: 'nemoji' }, open ? L.emoji : '🔒'),
        h('span', { class: 'nnum' }, L.boss ? 'BOSS' : 'Level ' + (i + 1)),
        h('b', { class: 'nname' }, L.name),
        h('span', { class: 'nask' }, L.ask),
        pips(L));
      map.appendChild(n);
    });
    var bottom = h('div', { class: 'homebtns' },
      h('button', { class: 'bigbtn hw', onclick: function () { scr.homework(); } }, h('span', null, '📘'), h('b', null, 'Homework Trail'), h('small', null, 'Practice your real worksheet')),
      h('button', { class: 'bigbtn sl', onclick: function () { scr.slots(); } }, h('span', null, '🎰'), h('b', null, 'Silly Slots'), h('small', null, 'Spin for silly sentences')),
      h('button', { class: 'bigbtn tr', onclick: function () { scr.trophies(); } }, h('span', null, '🏆'), h('b', null, 'My Trophies'), h('small', null, Object.keys(S().badges).length + ' of ' + SS.badges.length + ' badges')));
    var crab = SS.crab('happy');
    var root = h('div', { class: 'home' },
      h('div', { class: 'home-side' }, h('div', { class: 'saybubble' }, msg), crab),
      h('div', { class: 'home-main' }, map, bottom));
    SS.mount(root);
  };

  // ======================================================================
  // level hub
  scr.level = function (id) {
    SS.current = 'level'; hud();
    var L = byId(id), seen = (S().seen || {})[id];
    var cards = h('div', { class: 'ways' });
    L.ways.forEach(function (way, i) {
      var w = i + 1, open = SS.wayOpen(id, w), st = SS.getWay(id, w).stars;
      var stars = h('div', { class: 'wstars' });
      for (var k = 0; k < 3; k++) stars.appendChild(h('span', { class: k < st ? 'on' : '' }, '★'));
      cards.appendChild(h('button', { class: 'way card' + (open ? '' : ' locked'), onclick: function () {
        if (!open) { SS.snd.no(); SS.toast('Finish Way ' + (w - 1) + ' first!'); return; }
        SS.snd.pop(); playWay(L, w);
      } },
        h('div', { class: 'wnum' }, L.boss ? 'BOSS' : 'Way ' + w),
        h('div', { class: 'wicon' }, open ? way.icon : '🔒'),
        h('b', { class: 'wname' }, way.name),
        h('span', { class: 'wblurb' }, way.blurb),
        stars,
        h('span', { class: 'wgo' }, open ? (st ? 'Play again' : 'Play!') : 'Locked')));
    });
    var msg = L.boss ? 'The Crab King wants a challenge! Use everything you learned!'
      : seen ? 'Pick a way to play! Each way is a little harder.' : 'Start by watching me show you the trick!';
    var lesson = LESSONS[id] ? h('button', { class: 'lessonbtn' + (seen ? '' : ' pulse'), onclick: function () { SS.snd.pop(); scr.lesson(id, 0); } },
      h('span', { class: 'le' }, '🎬'), h('b', null, 'Watch Snippy'), h('small', null, seen ? 'See the lesson again' : 'Start here!')) : null;
    var root = h('div', { class: 'levelhub' },
      h('div', { class: 'p-top' }, h('button', { class: 'btn ghost small', onclick: scr.home }, '← Map'), h('div', { class: 'p-title' }, L.emoji + ' ' + L.name + ' · ' + L.ask)),
      h('div', { class: 'lhmain' },
        h('div', { class: 'p-side' }, h('div', { class: 'saybubble' }, msg), SS.crab(L.boss ? 'cheer' : 'happy', !!L.boss)),
        h('div', { class: 'lhright' }, h('p', { class: 'lhblurb' }, L.blurb), lesson, cards)));
    SS.mount(root);
  };

  // ======================================================================
  // homework trail
  var HWP = [
    { k: 'A', name: 'Part A', range: '#1 to 5', desc: 'Find the complete SUBJECT.' },
    { k: 'B', name: 'Part B', range: '#6 to 10', desc: 'Find the complete PREDICATE.' },
    { k: 'C', name: 'Part C', range: '#11 to 18', desc: 'Sentence or fragment?' },
    { k: 'D', name: 'Part D', range: '#19 and 20', desc: 'Subject and predicate of one sentence.' }
  ];
  function hwQs(k) {
    return SS.HW.filter(function (i) { return i.part === k; }).map(function (it) {
      if (it.kind === 'cf') return { kind: 'cfReason', f: it.frag, askWhy: true, skill: 'cf', support: 1, num: it.n, noRetry: false };
      return { kind: 'tapWords', st: it.sent, part: it.kind, skill: it.kind === 'sub' ? 'subject' : 'predicate', support: 1, num: it.n };
    });
  }
  function playHw(i) {
    var p = HWP[i];
    return SS.runSession({ qs: hwQs(p.k), title: '📘 Homework ' + p.name, lv: 'HW', way: p.k }).then(function (res) {
      hud();
      if (!res) return scr.homework();
      var nx = HWP[i + 1], st = res.rec.stars;
      scr.results({ title: 'Homework', res: res, note: st === 3 ? 'PERFECT! Homework hero!' : st === 2 ? 'Great job on ' + p.name + '!' : 'Good try! Play it again to get more stars.',
        again: function () { playHw(i); }, back: scr.homework, backLabel: 'Back to Homework Trail',
        next: nx ? { label: 'Next: ' + nx.name + ' ➜', fn: function () { playHw(i + 1); } } : null });
    });
  }
  scr.homework = function () {
    SS.current = 'homework'; hud();
    var cards = h('div', { class: 'ways' });
    HWP.forEach(function (p, i) {
      var st = (S().ways['HWw' + p.k] || {}).stars || 0, stars = h('div', { class: 'wstars' });
      for (var k = 0; k < 3; k++) stars.appendChild(h('span', { class: k < st ? 'on' : '' }, '★'));
      cards.appendChild(h('button', { class: 'way card', onclick: function () { SS.snd.pop(); playHw(i); } },
        h('div', { class: 'wnum' }, p.name), h('div', { class: 'wicon' }, '📘'), h('b', { class: 'wname' }, p.range), h('span', { class: 'wblurb' }, p.desc), stars,
        h('span', { class: 'wgo' }, st ? 'Play again' : 'Play!')));
    });
    SS.mount(h('div', { class: 'levelhub' },
      h('div', { class: 'p-top' }, h('button', { class: 'btn ghost small', onclick: scr.home }, '← Map'), h('div', { class: 'p-title' }, '📘 Homework Trail')),
      h('div', { class: 'lhmain' },
        h('div', { class: 'p-side' }, h('div', { class: 'saybubble' }, 'These are the questions from your real worksheet! Hints are on.'), SS.crab('happy')),
        h('div', { class: 'lhright' }, h('p', { class: 'lhblurb' }, 'Practice each part, one at a time.'), cards))));
  };

  // ======================================================================
  // trophies
  scr.trophies = function () {
    SS.current = 'trophies'; hud();
    var total = 0; Object.keys(S().ways).forEach(function (k) { total += S().ways[k].stars || 0; });
    var grid = h('div', { class: 'badgegrid' });
    SS.badges.forEach(function (b) {
      var got = !!S().badges[b.id];
      grid.appendChild(h('div', { class: 'badge' + (got ? ' got' : '') }, h('span', { class: 'be' }, got ? b.e : '❔'), h('b', null, got ? b.n : '???'), h('small', null, b.d)));
    });
    SS.mount(h('div', { class: 'trophies' },
      h('div', { class: 'p-top' }, h('button', { class: 'btn ghost small', onclick: scr.home }, '← Map'), h('div', { class: 'p-title' }, '🏆 My Trophies')),
      h('div', { class: 'tstats' },
        h('div', { class: 'stat card' }, h('span', null, '🐚'), h('b', null, S().shells), h('small', null, 'shells')),
        h('div', { class: 'stat card' }, h('span', null, '⭐'), h('b', null, total), h('small', null, 'stars')),
        h('div', { class: 'stat card' }, h('span', null, '🏅'), h('b', null, Object.keys(S().badges).length), h('small', null, 'badges'))),
      grid));
  };

  // ======================================================================
  // silly slots
  scr.slots = function () {
    SS.current = 'slots'; hud();
    var left = h('div', { class: 'reel sub' }, '?'), right = h('div', { class: 'reel pred' }, '?');
    var out = h('div', { class: 'slotout' }), say = h('div', { class: 'saybubble' }, 'Pull the lever! I’ll make a silly sentence.');
    var spinBtn = h('button', { class: 'btn primary big', onclick: spin }, '🎰 SPIN!');
    var busy = false, count = 0;
    function spin() {
      if (busy) return; busy = true; SS.clear(out); spinBtn.disabled = true;
      left.classList.remove('done'); right.classList.remove('done');
      var a = SS.pickOne(SS.matches), b = SS.pickOne(SS.matches);
      if (Math.random() < 0.3) b = a;
      var t0 = Date.now(), dur = SS.reduced ? 0 : 1100;
      function tick() {
        if (Date.now() - t0 >= dur) { left.textContent = a.sub; right.textContent = b.pred; left.classList.add('done'); right.classList.add('done'); SS.snd.star(); askQ(a, b); return; }
        left.textContent = SS.pickOne(SS.matches).sub; right.textContent = SS.pickOne(SS.matches).pred; SS.snd.pop();
        setTimeout(tick, 110);
      }
      tick();
    }
    function askQ(a, b) {
      var full = a.sub + ' ' + b.pred; if (S().settings.read) SS.speak(full);
      say.textContent = 'Read it: “' + full + '” Does it make sense, or is it silly?';
      var sense = a === b, row = h('div', { class: 'row center wrap' });
      function ans(guess) {
        SS.clear(out);
        var st = SS.mkSentence(a.sub, b.pred);
        var sent = SS.sentenceEl(st, false); SS.paint(sent, st, 'both');
        count++; S().slots = (S().slots || 0) + 1; S().shells += 1; SS.save(); hud();
        var nu = SS.checkBadges(null);
        say.textContent = (guess === sense ? SS.praise() + ' ' : 'Ha ha! ') + (sense ? 'That one makes sense.' : 'That one is silly!') + ' Silly or not, it has a subject and a predicate, so it is a COMPLETE sentence! +1 🐚';
        out.appendChild(sent); out.appendChild(SS.tagRow('both'));
        if (nu.length) { SS.confetti(30); SS.snd.cheer(); out.appendChild(h('div', { class: 'badge got' }, h('span', { class: 'be' }, nu[0].e), h('b', null, 'New badge: ' + nu[0].n))); }
        else SS.snd.ok();
        busy = false; spinBtn.disabled = false; spinBtn.textContent = '🎰 Spin again!';
      }
      row.appendChild(h('button', { class: 'btn leaf big', onclick: function () { ans(true); } }, '👍 Makes sense'));
      row.appendChild(h('button', { class: 'btn sun big', onclick: function () { ans(false); } }, '🤪 Silly!'));
      SS.clear(out); out.appendChild(row);
    }
    SS.mount(h('div', { class: 'slots' },
      h('div', { class: 'p-top' }, h('button', { class: 'btn ghost small', onclick: scr.home }, '← Map'), h('div', { class: 'p-title' }, '🎰 Silly Slots')),
      h('div', { class: 'lhmain' }, h('div', { class: 'p-side' }, say, SS.crab('happy')),
        h('div', { class: 'lhright' }, h('div', { class: 'reels' }, left, h('span', { class: 'plus' }, '+'), right), h('div', { class: 'row center' }, spinBtn), out))));
  };

  // ======================================================================
  // grown-up corner
  var SKILLS = { subject: 'Finding the complete subject', predicate: 'Finding the complete predicate', snip: 'Snipping a sentence into two halves',
    cf: 'Whole sentence or fragment?', fix: 'Fixing fragments', match: 'Matching subjects with predicates', build: 'Building a sentence in order' };
  var SKILL_LV = { subject: 'L1', predicate: 'L2', snip: 'L3', cf: 'L4', fix: 'L5', match: 'L6', build: 'L6' };
  var SLIPS = {
    'short-sub': 'Leaves describing words out of the subject (says “puppy” for “The little brown puppy”).',
    'long-sub': 'Puts the action word into the subject.',
    'short-pred': 'Stops the predicate too early.',
    'long-pred': 'Starts the predicate too soon (grabs a subject word).',
    'other-half': 'Picks the wrong half (mixes up subject and predicate).',
    'mixed-sub': 'Has trouble finding where the subject ends.',
    'mixed-pred': 'Has trouble finding where the predicate starts.',
    'verb-miss': 'Taps a describing word instead of the action word.',
    'snip-early': 'Snips too early (cuts inside the subject).',
    'snip-late': 'Snips too late (cuts after the action word).',
    'snip-label': 'Mixes up which half is the subject.',
    'ck1': 'Unsure whether a WHO or WHAT is there.',
    'ck2': 'Unsure whether a DOES or IS is there.',
    'ck3': 'Unsure whether the thought is finished.',
    'cf-says-whole': 'Calls a fragment a whole sentence.',
    'cf-says-piece': 'Calls a whole sentence a fragment.',
    'cfwhy': 'Names the wrong missing part of a fragment.',
    'sort-whole-as-piece': 'Sorts a whole sentence as a piece.',
    'sort-piece-as-whole': 'Sorts a fragment as a whole sentence.',
    'fix-sub': 'Chooses a piece that does not give a WHO or WHAT.',
    'fix-pred': 'Chooses a piece that does not give a DOES or IS.',
    'fix-thought': 'Chooses a piece that does not finish the thought.',
    'fix-both': 'Chooses a piece that does not fix both halves.',
    'fixdx': 'Cannot yet name what a fragment is missing.',
    'match': 'Pairs a subject with a silly predicate.',
    'build-order': 'Puts words in the wrong order.'
  };
  function fmtDate(t) { try { return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch (e) { return ''; } }
  function lvName(lv, w) { if (lv === 'HW') return 'Homework ' + w; var L = byId(lv); return L ? L.name + (L.boss ? '' : ' · Way ' + w) : lv; }

  scr.grownup = function () {
    SS.current = 'grownup'; hud();
    var st = S(), secs = 0, bars = h('div', { class: 'gbars' }), weakest = null, weakPct = 101;
    st.sessions.forEach(function (x) { secs += x.s || 0; });
    Object.keys(SKILLS).forEach(function (k) {
      var s = st.skills[k], pct = s && s.n ? Math.round(100 * s.clean / s.n) : null;
      if (s && s.n >= 5 && pct < weakPct) { weakPct = pct; weakest = k; }
      bars.appendChild(h('div', { class: 'gbar' }, h('span', { class: 'gl' }, SKILLS[k]),
        h('div', { class: 'gtrack' }, h('i', { style: 'width:' + (pct == null ? 0 : pct) + '%', class: pct == null ? '' : (pct >= 80 ? 'hi' : pct >= 55 ? 'mid' : 'lo') })),
        h('span', { class: 'gp' }, pct == null ? 'not tried yet' : pct + '% first try (' + s.n + ')')));
    });
    var groups = {};
    Object.keys(st.slips).forEach(function (k) { var g = k.split(':')[0]; groups[g] = (groups[g] || 0) + st.slips[k]; });
    var slipList = h('ul', { class: 'gslips' });
    var top = Object.keys(groups).sort(function (a, b) { return groups[b] - groups[a]; }).slice(0, 6);
    top.forEach(function (g) { slipList.appendChild(h('li', null, h('b', null, groups[g] + '×  '), SLIPS[g] || g)); });
    if (!top.length) slipList.appendChild(h('li', null, 'No mistakes recorded yet.'));
    var rec = h('table', { class: 'gtable' }, h('tr', null, h('th', null, 'Date'), h('th', null, 'Game'), h('th', null, 'Stars'), h('th', null, 'First-try'), h('th', null, 'Time')));
    st.sessions.slice(0, 10).forEach(function (x) {
      rec.appendChild(h('tr', null, h('td', null, fmtDate(x.t)), h('td', null, lvName(x.lv, x.w)), h('td', null, '★'.repeat(x.st)), h('td', null, x.sc + '%'), h('td', null, Math.max(1, Math.round((x.s || 0) / 60)) + ' min')));
    });
    function toggle(label, get, set) {
      var b = h('button', { class: 'btn ghost toggle', 'aria-pressed': get() ? 'true' : 'false' }, label + ': ' + (get() ? 'ON' : 'OFF'));
      b.addEventListener('click', function () { set(!get()); SS.save(); hud(); b.setAttribute('aria-pressed', get() ? 'true' : 'false'); b.textContent = label + ': ' + (get() ? 'ON' : 'OFF'); });
      return b;
    }
    var code = h('textarea', { class: 'gcode', readonly: true, rows: 3 }); code.value = JSON.stringify(st);
    var restore = h('textarea', { class: 'gcode', rows: 2, placeholder: 'Paste a saved progress code here' });
    var msg = h('div', { class: 'gmsg' });
    var suggest = weakest ? 'Tip: she misses “' + SKILLS[weakest].toLowerCase() + '” the most. Try ' + byId(SKILL_LV[weakest]).name + ', Way 2.' : 'Play a few games and tips will show up here.';
    SS.mount(h('div', { class: 'grownup' },
      h('div', { class: 'p-top' }, h('button', { class: 'btn ghost small', onclick: scr.home }, '← Back to the game'), h('div', { class: 'p-title' }, '🔒 Grown-Up Corner')),
      h('div', { class: 'gscroll' },
        h('div', { class: 'gstats' },
          h('div', { class: 'stat card' }, h('b', null, st.sessions.length), h('small', null, 'games played (last 60)')),
          h('div', { class: 'stat card' }, h('b', null, Math.round(secs / 60)), h('small', null, 'minutes (last 60)')),
          h('div', { class: 'stat card' }, h('b', null, st.shells), h('small', null, 'shells')),
          h('div', { class: 'stat card' }, h('b', null, SS.hasDb() ? 'Yes' : 'No'), h('small', null, 'shared with Claude'))),
        h('h3', null, 'How she is doing (first try, no hints)'), bars, h('p', { class: 'gtip' }, suggest),
        h('h3', null, 'Most common slips'), slipList,
        h('h3', null, 'Recent games'), rec,
        h('h3', null, 'Settings'),
        h('div', { class: 'row wrap' },
          toggle('Read questions out loud', function () { return st.settings.read; }, function (v) { st.settings.read = v; }),
          toggle('Sound', function () { return st.settings.sound; }, function (v) { st.settings.sound = v; }),
          toggle('Unlock every level', function () { return !!st.unlockAll; }, function (v) { st.unlockAll = v; })),
        h('h3', null, 'Backup'),
        h('p', { class: 'gtip' }, 'This code is a copy of all progress. Save it somewhere safe.'),
        code,
        h('div', { class: 'row wrap' },
          h('button', { class: 'btn ghost', onclick: function () {
            code.value = JSON.stringify(S());
            try { navigator.clipboard.writeText(code.value).then(function () { msg.textContent = 'Copied!'; }, function () { code.select(); msg.textContent = 'Press copy on the selected text.'; }); }
            catch (e) { code.select(); msg.textContent = 'Press copy on the selected text.'; }
          } }, 'Copy code'),
          h('button', { class: 'btn ghost', onclick: function () {
            try { var o = JSON.parse(restore.value); if (!o || o.v !== 1) throw 0; SS.setAll(o); hud(); msg.textContent = 'Restored!'; setTimeout(scr.grownup, 600); }
            catch (e) { msg.textContent = 'That code did not work.'; }
          } }, 'Restore from code')),
        restore, msg,
        h('h3', null, 'Start over'),
        h('button', { class: 'btn danger', onclick: function () {
          SS.ask('Erase ALL stars, shells and badges? This cannot be undone.', 'Erase everything', 'Keep').then(function (y) {
            if (y) { var nm = S().name; SS.setAll(Object.assign(SS.blank(), { name: nm })); hud(); scr.grownup(); SS.toast('Everything was reset.'); }
          });
        } }, 'Erase all progress'))));
  };
})();
