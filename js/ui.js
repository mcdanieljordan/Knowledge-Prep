'use strict';
/* ============ ui: Pip the owl, top bar, overlays, celebrations, page viewer ============ */
const PIP_SVG = `
<svg viewBox="0 0 220 240" xmlns="http://www.w3.org/2000/svg" class="pipsvg" aria-hidden="true">
  <ellipse cx="112" cy="228" rx="52" ry="8" fill="rgba(27,42,74,.15)"/>
  <ellipse cx="84" cy="218" rx="22" ry="10" fill="#ffb02e" stroke="#1b2a4a" stroke-width="5"/>
  <ellipse cx="136" cy="218" rx="22" ry="10" fill="#ffb02e" stroke="#1b2a4a" stroke-width="5"/>
  <g class="wingL"><path d="M44 120 C14 150 18 196 50 208 C70 186 70 150 56 122 Z" fill="#5a4fe0" stroke="#1b2a4a" stroke-width="5" stroke-linejoin="round"/></g>
  <g class="wingR"><path d="M176 120 C206 150 202 196 170 208 C150 186 150 150 164 122 Z" fill="#5a4fe0" stroke="#1b2a4a" stroke-width="5" stroke-linejoin="round"/></g>
  <ellipse cx="110" cy="136" rx="70" ry="82" fill="#7b70ff" stroke="#1b2a4a" stroke-width="5"/>
  <path d="M56 68 L44 22 L92 52 Z" fill="#7b70ff" stroke="#1b2a4a" stroke-width="5" stroke-linejoin="round"/>
  <path d="M164 68 L176 22 L128 52 Z" fill="#7b70ff" stroke="#1b2a4a" stroke-width="5" stroke-linejoin="round"/>
  <ellipse cx="110" cy="158" rx="44" ry="54" fill="#fff4d6"/>
  <path d="M88 148 q9 9 18 0 M114 148 q9 9 18 0 M100 172 q9 9 18 0 M88 192 q9 9 18 0 M114 192 q9 9 18 0" stroke="#e6cf92" fill="none" stroke-width="4" stroke-linecap="round"/>
  <circle cx="78" cy="98" r="28" fill="#fff" stroke="#1b2a4a" stroke-width="5"/>
  <circle cx="142" cy="98" r="28" fill="#fff" stroke="#1b2a4a" stroke-width="5"/>
  <g class="eyes"><circle class="pupil" cx="82" cy="101" r="13" fill="#1b2a4a"/><circle class="pupil" cx="138" cy="101" r="13" fill="#1b2a4a"/>
  <circle cx="87" cy="95" r="5" fill="#fff"/><circle cx="143" cy="95" r="5" fill="#fff"/></g>
  <path class="brow" d="M54 70 L94 80 M166 70 L126 80" stroke="#1b2a4a" stroke-width="6" stroke-linecap="round"/>
  <circle cx="52" cy="130" r="9" fill="#ff9db1" opacity=".8"/><circle cx="168" cy="130" r="9" fill="#ff9db1" opacity=".8"/>
  <path d="M98 118 L122 118 L110 140 Z" fill="#ffb02e" stroke="#1b2a4a" stroke-width="5" stroke-linejoin="round"/>
  <g class="cap"><path d="M110 22 L168 44 L110 66 L52 44 Z" fill="#1b2a4a" stroke="#1b2a4a" stroke-width="4" stroke-linejoin="round"/>
  <path d="M82 56 L82 72 Q110 84 138 72 L138 56" fill="#2c3e73" stroke="#1b2a4a" stroke-width="4"/>
  <path d="M168 44 L168 70" stroke="#ffc533" stroke-width="5" stroke-linecap="round"/><circle cx="168" cy="74" r="6" fill="#ffc533"/></g>
</svg>`;
function pipEl(mood) { return h('div.pip' + (mood ? '.' + mood : ''), { html: PIP_SVG }); }
function setMood(el, mood, ms) {
  if (!el) return;
  ['cheer', 'oops', 'think', 'talk'].forEach(m => el.classList.remove(m));
  if (mood) el.classList.add(mood);
  if (ms) setTimeout(() => el.classList.remove(mood), ms);
}

/* ---------- top bar ---------- */
function hudEls() {
  const li = levelInfo();
  return [
    STREAK >= 2 ? h('div.chip2.streak', '🔥 ' + STREAK) : null,
    h('button.xpchip', { onclick: () => go('trophies'), 'aria-label': 'Level and points' },
      h('span.xl', li.cur.icon), h('span.xb', h('span.xt', `Level ${li.cur.n}`), h('span.bar', h('i', { style: { width: li.pct + '%' } }))), h('span.xn', '⭐ ' + S.xp)),
    h('button.tb.icon' + (S.settings.voice ? '' : '.off'), { onclick: () => { S.settings.voice = !S.settings.voice; if (!S.settings.voice) stopSpeak(); save(); updateHud(); }, 'aria-label': 'Voice' }, S.settings.voice ? '🗣️' : '🤐'),
    h('button.tb.icon' + (S.settings.sound ? '' : '.off'), { onclick: () => { S.settings.sound = !S.settings.sound; save(); updateHud(); sfx('tap'); }, 'aria-label': 'Sound' }, S.settings.sound ? '🔔' : '🔕'),
    h('button.tb.icon', { onclick: () => { const ks = ['high', 'med', 'low']; S.settings.vol = ks[(ks.indexOf(S.settings.vol) + 1) % 3]; save(); updateHud(); if (S.settings.sound) sfx('good'); else speak('Hi!'); }, 'aria-label': 'Volume', title: 'Volume' }, { high: '🔊', med: '🔉', low: '🔈' }[S.settings.vol] || '🔊')
  ];
}
function updateHud() { $$('.hud').forEach(el => el.replaceChildren(...hudEls().filter(Boolean))); }
function topbar(o = {}) {
  return h('header.topbar', { style: { '--tc': o.color || '#2f6fe4' } },
    h('button.tb.back', { onclick: o.back || (() => go('home')) }, o.back ? '◀ ' + (o.backLabel || 'Back') : '🏠 Home'),
    h('div.ttitle', o.icon ? h('span.ti', o.icon) : null, h('span', o.title || '')),
    o.mid || null,
    h('div.hud', hudEls().filter(Boolean)));
}

/* ---------- overlays ---------- */
function overlay(cls, inner) {
  const ov = h('div.overlay' + (cls ? '.' + cls : ''), inner);
  document.body.append(ov);
  return ov;
}
function closeOverlays() { $$('.overlay').forEach(o => o.remove()); }

function showCelebration(item, next) {
  const isLevel = item.type === 'level';
  const icon = isLevel ? item.level.icon : item.badge.icon;
  const title = isLevel ? `LEVEL UP!` : 'NEW BADGE!';
  const name = isLevel ? `Level ${item.level.n}: ${item.level.title}` : item.badge.name;
  const sub = isLevel ? `${S.name}, you are now a ${item.level.title}!` : item.badge.desc;
  const ov = overlay('celeb', h('div.cbox' + (isLevel ? '.level' : '.badge'),
    h('div.cburst'), h('div.cicon', icon), h('div.ctitle', title), h('div.cname', name), h('div.csub', sub),
    h('button.bigbtn.go', { onclick: () => { ov.remove(); sfx('tap'); next && next(); } }, isLevel ? 'Keep going! 🚀' : 'Yay! 🎉')));
  sfx(isLevel ? 'level' : 'badge'); confetti(isLevel ? 220 : 150);
  speak(`${title} ${name}. ${sub}`);
}
function flushCelebrations(done) {
  const it = celebQ.shift();
  if (!it) { done && done(); return; }
  showCelebration(it, () => flushCelebrations(done));
}

/* ---------- page viewer ---------- */
function pageSrc(n, filled) { return `assets/pages/p${String(n).padStart(2, '0')}${filled ? '_filled' : ''}.webp`; }
function openPageModal(n, fromQ) {
  closeOverlays();
  n = Math.max(1, Math.min(12, n));
  let pg = PAGES[n - 1], filled = pg.filled;
  S.pages[n] = Date.now(); save(); checkBadges();
  const ov = overlay('pv');
  function close() { ov.remove(); flushCelebrations(); }
  function zoom() {
    const z = overlay('zoom');
    let w = 100;
    const img = h('img', { src: pageSrc(n, filled), alt: 'Page ' + n, style: { width: '100%' } });
    const sc = h('div.zscroll', img);
    const setW = v => { w = v; img.style.width = w + '%'; };
    z.append(h('div.zbar', h('button.tb', { onclick: () => z.remove() }, '✖ Close'), h('div.ztitle', `Page ${n}`),
      h('button.tb', { onclick: () => setW(Math.max(100, w - 40)) }, '➖ Smaller'), h('button.tb', { onclick: () => setW(Math.min(260, w + 40)) }, '➕ Bigger')), sc);
  }
  function draw() {
    pg = PAGES[n - 1];
    const img = h('img.pgimg', { src: pageSrc(n, filled && pg.filled), alt: 'Page ' + n, onclick: zoom });
    const links = [];
    pg.topics.forEach(tid => {
      const t = TOPICS.find(x => x.id === tid);
      links.push(h('div.lrow', { style: { '--bc': t.color } }, h('div.lname', h('span.li', t.icon), h('span', t.island)),
        h('div.lways', [1, 2, 3].map(w => h('button.wbtn' + (topicWayDone(t.id, w) ? '.done' : ''), { title: WAYS[w - 1].name, onclick: () => { ov.remove(); startTopicWay(t.id, w); } }, h('span', WAYS[w - 1].icon), h('small', 'Way ' + w))))));
    });
    pg.qs.forEach(qn => {
      const q = TQ[qn - 1];
      links.push(h('div.lrow.q', { style: { '--bc': '#0369a1' } }, h('div.lname', h('span.li', 'Q' + qn), h('span', TQ_SHORT[qn])),
        h('div.lways', [1, 2, 3].map(w => h('button.wbtn' + (qWayDone(qn, w) ? '.done' : ''), { title: WAYS[w - 1].name, onclick: () => { ov.remove(); startTestWay(qn, w); } }, h('span', WAYS[w - 1].icon), h('small', 'Way ' + w))))));
    });
    if (n >= 11) links.push(h('div.lrow.q', { style: { '--bc': '#4b3fd1' } }, h('div.lname', h('span.li', '📝'), h('span', 'Full Practice Test')), h('div.lways', h('button.wbtn.wide', { onclick: () => { ov.remove(); startMock(); } }, 'Start ▶'))));
    ov.replaceChildren(h('div.pvbox',
      h('div.pvhead',
        h('button.tb', { onclick: close }, '✖ Close'),
        h('button.tb', { disabled: n <= 1, onclick: () => { n--; filled = PAGES[n - 1].filled; S.pages[n] = Date.now(); save(); checkBadges(); draw(); } }, '◀'),
        h('div.pvtitle', h('b', `Page ${n} of 12`), h('span', pg.title)),
        h('button.tb', { disabled: n >= 12, onclick: () => { n++; filled = PAGES[n - 1].filled; S.pages[n] = Date.now(); save(); checkBadges(); draw(); } }, '▶')),
      h('div.pvmain',
        h('div.pvpage', h('div.pgscroll', img), h('button.zoombtn', { onclick: zoom }, '🔍 Tap to zoom')),
        h('div.pvside',
          h('div.pvdesc', pg.desc),
          pg.filled ? h('div.seg', h('button' + (filled ? '.on' : ''), { onclick: () => { filled = true; draw(); } }, '✏️ Answered'), h('button' + (!filled ? '.on' : ''), { onclick: () => { filled = false; draw(); } }, '📄 Blank')) : null,
          pg.filled && filled ? h('div.pvnote', 'This is how your page looks with the answers filled in. Copy it by hand!') : null,
          links.length ? h('div.lhead', 'Practice this page') : h('div.pvnote', 'Read this page, then try the games on the pages before and after it.'),
          h('div.llist', links)))));
  }
  draw();
}
