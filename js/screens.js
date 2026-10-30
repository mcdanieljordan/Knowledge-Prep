'use strict';
/* ============ screens: home, island, test trail, pages, trophies, grown-ups ============ */
const SCREENS = {};
let CUR = { name: 'home', params: {} };
function go(name, params = {}) {
  stopSpeak(); closeOverlays();
  CUR = { name, params };
  const app = $('#app');
  app.replaceChildren();
  app.dataset.screen = name;
  SCREENS[name](params);
  checkBadges();
}
const topicById = id => TOPICS.find(t => t.id === id);
const starsStr = n => '★'.repeat(n) + '☆'.repeat(3 - n);
const TEST_DATE = new Date(2026, 10, 3);
function daysToTest() {
  const now = new Date(); const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((TEST_DATE - a) / 86400000);
}

/* where should she go next? */
function nextUp() {
  for (const t of TOPICS) for (const w of [1, 2, 3]) if (!topicWayDone(t.id, w) && t.id !== 'boss') return { label: `${t.island}: ${WAYS[w - 1].name}`, go: () => startTopicWay(t.id, w), color: t.color };
  const bw = [1, 2, 3].find(w => !topicWayDone('boss', w));
  if (bw) return { label: `Boss Battle: ${WAYS[bw - 1].name}`, go: () => startTopicWay('boss', bw) };
  for (const q of TQ) for (const w of [1, 2, 3]) if (!qWayDone(q.n, w)) return { label: `Question ${q.n}: ${WAYS[w - 1].name}`, go: () => startTestWay(q.n, w) };
  return { label: 'Take the Practice Test', go: () => startMock() };
}

/* ---------------- HOME ---------------- */
SCREENS.home = () => {
  const app = $('#app');
  const nx = nextUp(), d = daysToTest();
  const msgs = [`Ready to practice, ${S.name}?`, 'Every game teaches you something new!', 'You can do hard things!', 'Pick an island and let’s play!', 'Mistakes help your brain grow!'];
  const msg = d >= 0 ? (d === 0 ? 'Test day! You are ready. Do your best!' : d === 1 ? 'Your test is tomorrow! Let’s practice!' : `Your English test is in ${d} days. Let’s get ready!`) : pick1(msgs);
  const tiles = TOPICS.map(t => {
    const m = topicMastery(t);
    return h('button.tile', { style: { '--tc': t.color, '--td': t.dark, '--ts': t.soft }, onclick: () => go('topic', { id: t.id }) },
      h('div.ticon', t.icon), h('div.tname', t.island), h('div.tsub', t.title),
      h('div.tways', [1, 2, 3].map(w => h('span.tw' + (topicWayDone(t.id, w) ? '.on' : ''), topicWayDone(t.id, w) ? '✓' : String(w)))),
      m != null ? h('div.tm', `${m}% first try`) : h('div.tm.new', 'New!'));
  });
  const doneQ = TQ.filter(q => qDone(q.n)).length;
  tiles.push(h('button.tile.trail', { style: { '--tc': '#0369a1', '--td': '#0a4a72', '--ts': '#d4ecfa' }, onclick: () => go('trail') },
    h('div.ticon', '📝'), h('div.tname', 'Test Trail'), h('div.tsub', 'The 20 test questions'),
    h('div.tbar', h('i', { style: { width: (doneQ * 5) + '%' } })), h('div.tm', `${doneQ} of 20 done`)));
  app.append(topbar({ title: 'Ensley’s Grammar Quest', icon: '📚' }),
    h('main.home',
      h('section.hero',
        h('div.pipwrap', pipEl('talk')),
        h('div.hbub', h('div.hhi', `Hi ${S.name}!`), h('div.hmsg', msg), d >= 0 ? h('div.dchip', `🗓️ Test: Tuesday, November 3`) : null),
        h('button.bigbtn.go.cont', { style: { '--tc': nx.color || '#1fa34a' }, onclick: nx.go }, h('small', 'Up next'), h('span', '▶ ' + nx.label))),
      h('section.tiles', tiles),
      h('section.homebar',
        h('button.homebtn', { onclick: () => go('pages') }, h('span', '📄'), h('b', 'My Pages'), h('small', 'See the filled-in guide')),
        h('button.homebtn', { onclick: () => startMock() }, h('span', '📝'), h('b', 'Practice Test'), h('small', 'All 20 questions')),
        h('button.homebtn', { onclick: () => go('trophies') }, h('span', '🏆'), h('b', 'Trophy Room'), h('small', `${Object.keys(S.badges).length} of ${BADGES.length} badges`)),
        h('button.homebtn.grown', { onclick: () => go('grownups') }, h('span', '👩‍🏫'), h('b', 'Grown-Ups'), h('small', 'Progress report')))));
  setTimeout(() => speak(`Hi ${S.name}! ${msg}`), 400);
};

/* ---------------- ISLAND ---------------- */
function wayCard(i, o) {
  const w = WAYS[i - 1], a = getAct(o.key);
  return h('div.waycard' + (a.stars ? '.done' : ''), { style: { '--tc': o.color, '--td': o.dark } },
    h('div.wnum', 'Way ' + i), h('div.wicon', w.icon), h('div.wname', w.name), h('div.wtag', w.tag),
    h('div.wlearn', w.learnIcon + ' First: ' + w.learn),
    h('div.wstars', starsStr(a.stars)),
    h('button.bigbtn.play', { onclick: o.go }, a.plays ? '▶ Play again' : '▶ Play'));
}
SCREENS.topic = ({ id }) => {
  const t = topicById(id);
  $('#app').append(topbar({ title: t.island, icon: t.icon, color: t.color }),
    h('main.island', { style: { '--tc': t.color, '--td': t.dark, '--ts': t.soft } },
      h('section.ihead', h('div.iicon', t.icon), h('div.itext', h('h1', t.title), h('p', t.blurb),
        h('div.ipages', t.pages.map(p => h('button.pagebtn', { onclick: () => openPageModal(p) }, '📄 See page ' + p))))),
      h('div.iline', 'Three different ways to learn the same thing. Do one, or do all three to become a master!'),
      h('section.ways', [1, 2, 3].map(w => wayCard(w, { key: actKey('T', t.id, w), color: t.color, dark: t.dark, go: () => startTopicWay(t.id, w) })))));
  speak(`${t.island}. ${t.blurb}`);
};

/* ---------------- TEST TRAIL ---------------- */
SCREENS.trail = () => {
  const cols = Object.keys(TQ_PAGES).map(p => {
    p = +p;
    return h('div.tcol',
      h('button.tcolhead', { onclick: () => openPageModal(p) }, h('span', '📄'), h('b', 'Page ' + p), h('small', 'See page')),
      TQ_PAGES[p].map(n => {
        const dots = [1, 2, 3].map(w => h('span.dot' + (qWayDone(n, w) ? '.on' : '')));
        return h('button.qtile' + (qDone(n) ? '.done' : ''), { onclick: () => go('qhub', { n }) },
          h('span.qn', 'Q' + n), h('span.ql', TQ_SHORT[n]), h('span.dots', dots));
      }));
  });
  const doneQ = TQ.filter(q => qDone(q.n)).length;
  $('#app').append(topbar({ title: 'Test Trail', icon: '📝', color: '#0369a1' }),
    h('main.trail',
      h('section.trhead',
        h('div.tt', h('h1', 'The 20 practice questions'), h('p', `Every question has 3 ways to learn it. ${doneQ} of 20 questions fully done!`)),
        h('button.bigbtn.go', { style: { '--tc': '#4b3fd1' }, onclick: () => startMock() }, '📝 Practice Test')),
      h('section.tcols', cols)));
};

SCREENS.qhub = ({ n }) => {
  const q = TQ[n - 1];
  const opts = q.opts.map((o, i) => h('div.hopt', h('span.let', LET[i]), h('span', { html: esc(o) })));
  $('#app').append(topbar({ title: `Question ${n}`, icon: '📝', color: '#0369a1', back: () => go('trail'), backLabel: 'Trail' }),
    h('main.qhub', { style: { '--tc': '#0369a1', '--td': '#0a4a72' } },
      h('section.qprint',
        h('div.qprow', h('div.qpn', 'Page ' + q.page), h('button.pagebtn', { onclick: () => openPageModal(q.page) }, '📄 See it filled in')),
        h('div.q', { html: q.n + '. ' + q.stem }), q.sentence ? h('div.sent', q.sentence) : null, h('div.hopts', opts)),
      h('div.iline', `${SKILL[q.skill].name}: three ways to learn it`),
      h('section.ways', [1, 2, 3].map(w => wayCard(w, { key: actKey('Q', n, w), color: '#0369a1', dark: '#0a4a72', go: () => startTestWay(n, w) }))),
      h('section.qnav',
        h('button.tb', { disabled: n <= 1, onclick: () => go('qhub', { n: n - 1 }) }, '◀ Question ' + (n - 1)),
        h('button.tb', { disabled: n >= 20, onclick: () => go('qhub', { n: n + 1 }) }, 'Question ' + (n + 1) + ' ▶'))));
};

/* ---------------- MY PAGES ---------------- */
SCREENS.pages = () => {
  const cards = PAGES.map(p => h('button.pcard' + (S.pages[p.n] ? '.seen' : ''), { onclick: () => openPageModal(p.n) },
    h('div.pthumb', h('img', { src: pageSrc(p.n, p.filled), alt: 'Page ' + p.n, loading: 'lazy' }), p.filled ? h('span.pfill', '✏️ filled in') : null, S.pages[p.n] ? h('span.pseen', '✔') : null),
    h('div.pn', 'Page ' + p.n), h('div.pt', p.title)));
  $('#app').append(topbar({ title: 'My Pages', icon: '📄', color: '#7c5cff' }),
    h('main.pages', h('div.iline', 'Tap a page to see it. Pages 1, 8, 9, 10, and 11 are filled in so you can copy them by hand. Every page has games to practice what is on it!'),
      h('section.pgrid', cards)));
};

/* ---------------- TROPHY ROOM ---------------- */
SCREENS.trophies = () => {
  const li = levelInfo();
  const got = Object.keys(S.badges).length;
  const accu = S.stats.answered ? Math.round(100 * S.stats.first / S.stats.answered) : 0;
  const bub = h('div.tdesc', 'Tap any badge to see how to earn it!');
  const grid = BADGES.map(b => {
    const have = !!S.badges[b.id];
    return h('button.bdg' + (have ? '.have' : ''), { onclick: () => { bub.innerHTML = `<b>${b.icon} ${esc(b.name)}</b><br>${esc(b.desc)}${have ? '<br><span class="got">You earned this! 🎉</span>' : ''}`; if (have) { sfx('good'); } else sfx('tap'); } },
      h('span.bi', have ? b.icon : '🔒'), h('span.bn', b.name));
  });
  $('#app').append(topbar({ title: 'Trophy Room', icon: '🏆', color: '#c58a00' }),
    h('main.trophy',
      h('section.tleft',
        h('div.lvbig', h('div.lvi', li.cur.icon), h('div.lvt', h('small', `Level ${li.cur.n}`), h('b', li.cur.title))),
        h('div.lvbar', h('i', { style: { width: li.pct + '%' } })),
        h('div.lvnote', li.nx ? `${li.toGo} more points to ${li.nx.title} ${li.nx.icon}` : 'You reached the top level! 👑'),
        h('div.stats',
          h('div.st', h('b', S.xp), h('small', 'points')), h('div.st', h('b', totalStars()), h('small', 'stars')),
          h('div.st', h('b', S.stats.bestStreak), h('small', 'best streak')), h('div.st', h('b', accu + '%'), h('small', 'first try')),
          h('div.st', h('b', `${got}/${BADGES.length}`), h('small', 'badges')), h('div.st', h('b', Object.keys(S.pages).length + '/12'), h('small', 'pages seen'))),
        bub),
      h('section.tright', h('div.bgrid', grid))));
};

/* ---------------- GROWN-UPS ---------------- */
SCREENS.grownups = () => {
  const app = $('#app');
  app.append(topbar({ title: 'Grown-Up Corner', icon: '👩‍🏫', color: '#475569' }));
  const gate = h('main.gate',
    h('div.gcard', h('div.gbig', '🔒'), h('h1', 'Grown-ups only'), h('p', 'Press and hold the button for 2 seconds.'),
      (() => {
        let timer = null; const bar = h('i');
        const b = h('button.holdbtn', { 'aria-label': 'Hold to open' }, h('span', 'Hold here'), h('div.holdbar', bar));
        const start = e => { e.preventDefault(); bar.style.transition = 'width 2s linear'; bar.style.width = '100%'; timer = setTimeout(() => { app.replaceChildren(topbar({ title: 'Grown-Up Corner', icon: '👩‍🏫', color: '#475569' }), dash()); }, 2000); };
        const stop = () => { clearTimeout(timer); bar.style.transition = 'none'; bar.style.width = '0%'; };
        b.addEventListener('pointerdown', start); b.addEventListener('pointerup', stop); b.addEventListener('pointerleave', stop); b.addEventListener('pointercancel', stop);
        return b;
      })()));
  app.append(gate);
};
function dash() {
  const rows = TOPICS.map(t => {
    const m = topicMastery(t);
    return h('tr', h('td', t.icon + ' ' + t.title), [1, 2, 3].map(w => h('td.c', starsStr(getAct(actKey('T', t.id, w)).stars))),
      h('td', m == null ? '–' : h('div.mbar', h('i', { style: { width: m + '%', background: m >= 80 ? '#1fa34a' : m >= 60 ? '#e57a0b' : '#e0452f' } }), h('span', m + '%'))));
  });
  const skillRows = Object.keys(S.skills).map(k => ({ k, a: S.skills[k].a, f: S.skills[k].f, p: Math.round(100 * S.skills[k].f / S.skills[k].a) }))
    .filter(x => x.a >= 3).sort((x, y) => x.p - y.p);
  const weak = skillRows.filter(x => x.p < 70).slice(0, 6);
  const code = h('textarea.codebox', { readonly: true, rows: 3 }); code.value = exportCode();
  const imp = h('textarea.codebox', { rows: 2, placeholder: 'Paste a progress code here' });
  const msg = h('div.gmsg');
  const qrows = TQ.map(q => h('span.qcell' + (qDone(q.n) ? '.done' : qStars(q.n) ? '.part' : ''), 'Q' + q.n));
  return h('main.dash',
    h('section.dcol',
      h('h2', 'How is Ensley doing?'),
      h('div.dstats', [[S.xp, 'points'], [S.stats.answered, 'answers'], [S.stats.answered ? Math.round(100 * S.stats.first / S.stats.answered) + '%' : '–', 'right on first try'], [S.stats.bestStreak, 'best streak'], [`${S.mock.best}/20`, 'best practice test']].map(([a, b]) => h('div.dst', h('b', a), h('small', b)))),
      h('h3', 'Islands (stars for Way 1, 2, 3)'),
      h('table.dtab', h('thead', h('tr', h('th', 'Island'), h('th.c', 'Pick'), h('th.c', 'Drag'), h('th.c', 'Play'), h('th', 'First-try'))), h('tbody', rows)),
      h('h3', 'Test questions (all 3 ways done = green)'), h('div.qcells', qrows)),
    h('section.dcol',
      h('h3', 'Needs more practice'),
      weak.length ? h('ul.weak', weak.map(x => h('li', `${SKILL[x.k] ? SKILL[x.k].name : x.k}: ${x.p}% first try (${x.a} answers)`))) : h('p.muted', skillRows.length ? 'Nothing below 70%. Great work!' : 'Play a few games and this list will fill in.'),
      h('h3', 'Save or move progress'),
      h('p.muted', memoryOnly ? 'This browser is not saving progress. Use the code below to keep it.' : 'Progress saves on this iPad automatically. Copy this code to back it up or move to another device.'),
      code,
      h('div.gbtns', h('button.tb', { onclick: () => { code.removeAttribute('readonly'); code.select(); try { document.execCommand('copy'); msg.textContent = 'Copied!'; } catch (e) { msg.textContent = 'Press and hold the code, then tap Copy.'; } code.setAttribute('readonly', ''); } }, '📋 Copy code')),
      imp, h('div.gbtns', h('button.tb', { onclick: () => { if (importCode(imp.value)) { msg.textContent = 'Loaded!'; go('home'); } else msg.textContent = 'That code did not work.'; } }, '📥 Load code')),
      h('div.gbtns', (() => { const b = h('button.tb.danger', '🗑️ Start over'); let armed = false; b.onclick = () => { if (armed) { S = defaultState(); save(); go('home'); } else { armed = true; b.textContent = 'Tap again to erase everything'; setTimeout(() => { armed = false; b.textContent = '🗑️ Start over'; }, 4000); } }; return b; })()),
      msg));
}
