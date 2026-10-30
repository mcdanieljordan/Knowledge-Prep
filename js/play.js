'use strict';
/* ============ player: lessons, rounds, results, practice test ============ */
let P = null;
const BONUS_AT = { 5: 10, 10: 10, 15: 15, 20: 20, 25: 20, 30: 30 };

function topicAct(t, way) {
  const w = WAYS[way - 1];
  return {
    key: actKey('T', t.id, way), kind: 'topic', topic: t, way, title: t.title, sub: `Way ${way}: ${w.name}`, color: t.color, dark: t.dark, soft: t.soft, icon: t.icon,
    teach: t.learn[way - 1].map(c => Object.assign({ way: w }, c)),
    build: () => topicRounds(t, way),
    back: () => go('topic', { id: t.id }), backLabel: t.title,
    next: () => way < 3 ? { label: `Next: Way ${way + 1} (${WAYS[way].name}) ▶`, go: () => startTopicWay(t.id, way + 1) } : { label: `Back to ${t.island} 🏝️`, go: () => go('topic', { id: t.id }) },
    again: () => startTopicWay(t.id, way)
  };
}
function testAct(q, way) {
  const w = WAYS[way - 1];
  const text = SKILL[q.skill][['rule', 'trick', 'ask'][way - 1]];
  return {
    key: actKey('Q', q.n, way), kind: 'test', q, way, title: `Question ${q.n}`, sub: `Way ${way}: ${w.name}`, color: '#0369a1', dark: '#0a4a72', soft: '#d4ecfa', icon: '📝',
    teach: [{ way: w, h: `${SKILL[q.skill].name}`, p: text, qline: `Question ${q.n} on page ${q.page}: ${plainText(q.stem)}` }],
    build: () => testRounds(q, way),
    back: () => go('qhub', { n: q.n }), backLabel: 'Question ' + q.n,
    next: () => way < 3 ? { label: `Next: Way ${way + 1} (${WAYS[way].name}) ▶`, go: () => startTestWay(q.n, way + 1) } : q.n < 20 ? { label: `Next: Question ${q.n + 1} ▶`, go: () => go('qhub', { n: q.n + 1 }) } : { label: 'Back to the Trail 📝', go: () => go('trail') },
    again: () => startTestWay(q.n, way)
  };
}
function startTopicWay(id, way) { startActivity(topicAct(topicById(id), way)); }
function startTestWay(n, way) { startActivity(testAct(TQ[n - 1], way)); }
function startMock() {
  const rounds = TQ.map(q => {
    const r = exactRound(q); const idx = shuffle(q.opts.map((o, i) => i));
    r.options = idx.map(i => q.opts[i]); r.answer = idx.indexOf(q.a); r.single = true; r.hint = ''; return r;
  });
  startActivity({
    key: 'M:test:1', kind: 'mock', title: 'Practice Test', sub: 'All 20 questions', color: '#4b3fd1', dark: '#2f2699', soft: '#e0ddff', icon: '📝',
    teach: [{ way: { learn: 'Get ready', learnIcon: '📝' }, h: 'The Practice Test', p: 'Here are all 20 questions from your study guide. Read carefully, think, and tap the best answer. You get one try on each one, just like the real test. Do your best!' }],
    build: () => rounds, back: () => go('home'), backLabel: 'Home', again: () => startMock(), next: () => ({ label: 'Back home 🏠', go: () => go('home') })
  });
}

function startActivity(act) {
  P = { act, rounds: act.build().filter(Boolean), i: 0, itemsTotal: 0, itemsFirst: 0, pts: 0, missed: [], mockScore: 0, skipTeach: false };
  go('play');
}

/* ---------- play screen ---------- */
SCREENS.play = () => {
  const a = P.act;
  const bubble = h('div.bubble', h('div.btext'), h('button.speak', { onclick: () => speak(P.lastSay || ''), 'aria-label': 'Read aloud' }, '🔊 Read to me'));
  const pip = pipEl();
  const prog = h('div.prog'), host = h('div.host'), foot = h('div.foot');
  $('#app').append(topbar({ title: `${a.title}: ${a.sub}`, icon: a.icon, color: a.color, back: a.back, backLabel: a.backLabel }),
    h('main.play', { style: { '--tc': a.color, '--td': a.dark, '--ts': a.soft } }, h('aside.rail', bubble, pip), h('section.stage', prog, host, foot)));
  P.el = { bubble, pip, prog, host, foot };
  P.teach = a.teach || [];
  if (P.teach.length) showTeach(0); else showRound(0);
};

function setBubble(html, o = {}) {
  const b = P.el.bubble; $('.btext', b).innerHTML = html; P.lastSay = plainText(html);
  b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
  if (o.mood) setMood(P.el.pip, o.mood, 1500);
  if (o.speak !== false) speak(plainText(html));
}

function groupsEl(gs) {
  return h('div.groups.g' + gs.length, gs.map(g => h('div.grp', h('div.gh', h('span', g.e), h('b', g.l)), h('div.gi', g.i.map(x => h('span.gchip', x))))));
}
function showTeach(i) {
  const a = P.act, c = P.teach[i], { host, foot, prog } = P.el;
  const w = c.way;
  prog.replaceChildren(...P.teach.map((_, k) => h('span.pd' + (k < i ? '.done' : k === i ? '.on' : ''))), h('span.plabel', `${w.learnIcon} ${w.learn}`));
  host.replaceChildren(h('div.teach',
    h('div.thead', h('span.tway', `${w.learnIcon} ${w.learn}`), h('h2', c.h)),
    h('p.tp', { html: c.p }),
    c.groups ? groupsEl(c.groups) : null,
    c.ex ? h('div.exs', c.ex.map(x => h('span.exchip', { html: x }))) : null,
    c.sent ? h('div.sents', c.sent.map(s => h('div.sentcard', { html: s }))) : null,
    c.qline ? h('div.qline', c.qline) : null));
  const last = i === P.teach.length - 1;
  foot.replaceChildren(
    h('div.fl', i > 0 ? h('button.tb', { onclick: () => showTeach(i - 1) }, '◀ Back') : null, h('button.tb.skip', { onclick: () => showRound(0) }, 'Skip lesson ⏭')),
    h('button.bigbtn.go', { onclick: () => last ? showRound(0) : showTeach(i + 1) }, last ? 'Let’s play! 🎮' : 'Next ▶'));
  const say = [c.h + '.', plainText(c.p)].concat(c.sent ? c.sent.map(plainText) : [], c.qline ? [c.qline] : []).join(' ');
  P.lastSay = say; setBubble(`Listen up, ${S.name}! 👂<br>Tap 🔊 to hear it again.`, { speak: false, mood: 'think' });
  speak(say);
}

function floatText(el, txt, cls) {
  if (!txt) return;
  const r = el.getBoundingClientRect();
  const f = h('div.floaty' + (cls ? '.' + cls : ''), txt);
  f.style.left = (r.left + r.width / 2) + 'px'; f.style.top = (r.top + r.height / 2) + 'px';
  document.body.append(f); setTimeout(() => f.remove(), 1200);
}

function showRound(i) {
  P.i = i; P.busy = false;
  const r = P.rounds[i];
  const fresh = h('div.host'); P.el.host.replaceWith(fresh); P.el.host = fresh;   // new element so old drag listeners disappear
  const { host, foot, prog } = P.el;
  prog.replaceChildren(...P.rounds.map((_, k) => h('span.pd' + (k < i ? '.done' : k === i ? '.on' : ''))), h('span.plabel', `Round ${i + 1} of ${P.rounds.length}`));
  foot.replaceChildren(h('div.praise.idle', STREAK >= 3 ? `🔥 ${STREAK} in a row!` : 'You can do it!'));
  stopSpeak();
  const ctx = makeCtx(r); P.ctx = ctx;
  try { M[r.type](host, r, ctx); } catch (e) { console.error('round failed', r, e); }
  setTimeout(() => { if (P && P.ctx === ctx && !ctx.items() && !ctx.done()) { P.rounds.splice(i, 1); P.i = i - 1; nextRound(i - 1); } }, 80);
}
function nextRound(i) {
  const go2 = () => { if (!P) return; if (i + 1 >= P.rounds.length) showResult(); else showRound(i + 1); };
  if (celebQ.length) flushCelebrations(go2); else go2();
}

function makeCtx(r) {
  const tries = {}, extra = new Set();
  let wrongs = 0;
  let items = 0, firstKeys = 0, doneKeys = 0, roundPts = 0, bonus = 0, finished = false, streakNote = '';
  return {
    round: r,
    items: () => items, done: () => finished,
    setItems(n) { items = n; },
    say(html, o) { setBubble(html, o); },
    hint(res) {
      if (r.single) return;
      const oops = praiseOops();
      // answer is about to be shown: just a short kind word, the explanation comes next
      if (res && res.reveal) { setBubble(`<b>${oops}</b>`, { mood: 'oops' }); return; }
      wrongs++;
      // say the hint out loud only the first time; after that, keep it on screen and say just a short kind word
      setBubble(r.hint ? `<b>${oops}</b><br>💡 ${r.hint}` : `<b>${oops}</b>`, { mood: 'oops', speak: wrongs === 1 });
      if (wrongs > 1) speak(oops);
    },
    float: floatText,
    attempt(key, ok, single) {
      if (key[0] === 'x') { if (!extra.has(key)) { extra.add(key); STREAK = 0; updateHud(); sfx('bad'); } return { ok: false, n: 1, reveal: false }; }
      const t = tries[key] || (tries[key] = { n: 0, done: false });
      if (t.done) return { ok: true, dup: true, label: '' };
      t.n++;
      if (ok) {
        t.done = true; doneKeys++;
        const first = t.n === 1; if (first) firstKeys++;
        const base = Math.max(2, Math.round(10 / Math.max(1, items)));
        const pts = first ? base : t.n === 2 ? Math.max(1, Math.round(base / 2)) : 1;
        roundPts += pts; addXP(pts); recordItem(r.skill, first, t.n === 2);
        if (first) {
          STREAK++; if (STREAK > S.stats.bestStreak) S.stats.bestStreak = STREAK;
          if (STREAK_MSG[STREAK]) { streakNote = STREAK_MSG[STREAK]; if (BONUS_AT[STREAK]) { bonus += BONUS_AT[STREAK]; addXP(BONUS_AT[STREAK]); } }
        }
        sfx('good'); updateHud();
        return { ok: true, first, n: t.n, pts, label: '+' + pts };
      }
      STREAK = 0; sfx('bad'); updateHud();
      return { ok: false, n: t.n, reveal: !!single || t.n >= 2 };
    },
    finish() {
      if (finished) return; finished = true;
      const perfect = items > 0 && firstKeys === items && extra.size === 0;
      P.itemsTotal += items + extra.size; P.itemsFirst += firstKeys; P.pts += roundPts + bonus;
      if (!perfect) P.missed.push(P.i);
      if (P.act.kind === 'mock' && perfect) P.mockScore++;
      S.stats.rounds++; if (perfect) S.stats.perfect++; save();
      const praise = perfect ? praiseBig() : (r.single && doneKeys === 0 ? praiseOops() : praiseSecond());
      const pts = roundPts + bonus;
      const last = P.i + 1 >= P.rounds.length;
      const why = r.explain || (SKILL[r.skill] && SKILL[r.skill].rule) || '';
      sfx(perfect ? 'great' : 'good'); setMood(P.el.pip, perfect ? 'cheer' : 'think', 2400);
      if (perfect && (streakNote || Math.random() < 0.25)) confetti(streakNote ? 120 : 60);
      P.el.foot.replaceChildren(
        h('div.praise' + (perfect ? '.big' : ''), h('span.pw', praise), pts ? h('span.pp', `+${pts} points`) : null, streakNote ? h('span.bonus', '🔥 ' + streakNote + (bonus ? ` +${bonus} bonus!` : '')) : null),
        h('button.bigbtn.go.pulse', { onclick: () => { if (!P || P.busy) return; P.busy = true; sfx('tap'); nextRound(P.i); } }, last ? 'See my stars ⭐' : 'Next ➜'));
      setBubble((perfect ? `<b>${praiseSub()}</b><br>` : '') + why, { speak: false });
      speak(praise + ' ' + plainText(why));
      const mine = P.ctx; setTimeout(() => { if (P && P.ctx === mine && celebQ.length && !$('.overlay')) flushCelebrations(); }, 900);
    }
  };
}

/* ---------- results ---------- */
function showResult() {
  if (P.finished) return; P.finished = true;
  const a = P.act, mock = a.kind === 'mock';
  let pct = P.itemsTotal ? P.itemsFirst / P.itemsTotal : 1, stars;
  if (mock) { const sc = P.mockScore; stars = sc >= 18 ? 3 : sc >= 14 ? 2 : 1; pct = sc / 20; S.mock.best = Math.max(S.mock.best, sc); S.mock.runs++; S.mock.last = sc; }
  else stars = pct >= 0.85 ? 3 : pct >= 0.6 ? 2 : 1;
  const bonus = 15 + stars * 10; addXP(bonus);
  const prev = getAct(a.key);
  S.acts[a.key] = { stars: Math.max(prev.stars, stars), plays: prev.plays + 1, best: Math.max(prev.best || 0, Math.round(pct * 100)), last: Date.now() };
  save(); checkBadges(); stopSpeak();
  const nx = a.next ? a.next() : { label: 'Done', go: () => a.back() };
  const msg = stars === 3 ? 'PERFECT! Triple star!' : stars === 2 ? 'Great job! So close to 3 stars!' : 'You finished! Every try makes you stronger!';
  const detail = mock ? `You got ${P.mockScore} of 20 right.` : `You got ${P.itemsFirst} of ${P.itemsTotal} right on the first try.`;
  const missed = mock ? P.missed.map(k => P.rounds[k]).filter(Boolean) : [];
  const starEls = [1, 2, 3].map(n => h('span.rs' + (n <= stars ? '.on' : '.off'), '★'));
  const pip = pipEl('cheer');
  const app = $('#app'); app.replaceChildren(); app.dataset.screen = 'result';
  app.append(topbar({ title: `${a.title}: ${a.sub}`, icon: a.icon, color: a.color, back: a.back, backLabel: a.backLabel }),
    h('main.result', { style: { '--tc': a.color, '--td': a.dark, '--ts': a.soft } },
      h('div.rpip', pip),
      h('section.rcard',
        h('div.rhead', mock ? 'Practice Test done!' : 'Way complete!'), h('div.rstars', starEls), h('div.rmsg', msg),
        h('div.rdetail', detail), h('div.rpts', `+${P.pts + bonus} points earned ⭐`),
        mock && missed.length ? h('div.rmiss', h('b', 'Practice these:'), h('div.rmrow', missed.map(r => h('button.qpill', { onclick: () => go('qhub', { n: r.exact }) }, 'Q' + r.exact)))) : null,
        h('div.rbtns', h('button.bigbtn.go', { onclick: nx.go }, nx.label), h('button.bigbtn.alt', { onclick: () => a.again && a.again() }, '🔁 Play again'), h('button.bigbtn.alt', { onclick: a.back }, '⬅ Back')))));
  starEls.forEach((s, i) => { if (s.classList.contains('on')) setTimeout(() => { s.classList.add('pop'); sfx('star'); }, 350 + i * 450); });
  if (stars === 3) setTimeout(() => confetti(160), 1400);
  setTimeout(() => speak(`${msg} ${detail}`), 600);
  setTimeout(() => flushCelebrations(), 2000);
}
