'use strict';
/* ===== Glitterhoof Kingdom: Unit 5 Quest. One skill at a time, five levels each, easy to boss. ===== */
const APP_ID = 'glitterhoof-unit5';
const SCREENS = {};
let CUR = { name: 'home', args: {} };
let RUN = null;
const plainTxt = s => String(s).replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '');
const skillById = id => SKILLS.find(s => s.id === id);
const skIdx = id => SKILLS.findIndex(s => s.id === id);
const skState = id => S.sk[id] || (S.sk[id] = { learned: false, lv: {}, mastered: false });
const lvDone = (id, l) => !!(skState(id).lv[l] && skState(id).lv[l].pass);
const lvStars = (id, l) => (skState(id).lv[l] || {}).stars || 0;
function skUnlocked(i) { return i === 0 || S.unlockAll || skState(SKILLS[i - 1].id).mastered; }
function lvUnlocked(id, l) { return l === 1 || S.unlockAll || lvDone(id, l - 1); }
function currentSkill() { for (let i = 0; i < SKILLS.length; i++) if (!skState(SKILLS[i].id).mastered) return i; return SKILLS.length - 1; }
function nextLevelOf(id) { for (let l = 1; l <= 5; l++) if (!lvDone(id, l)) return l; return 5; }
const masteredCount = () => SKILLS.filter(s => skState(s.id).mastered).length;
const hubOn = () => { try { return window.Hub ? Hub.ensure('Ensley', 2, '🦄') : null; } catch (e) { return null; } };

/* ---------- speech ---------- */
function speak(txt) {
  if (!S.settings.voice) return;
  try { if (!window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(plainTxt(txt)); u.rate = .85; u.pitch = 1.1; const v = speechSynthesis.getVoices().find(x => /en[-_](US|GB)/i.test(x.lang) && /(female|samantha|karen|zira|google)/i.test(x.name)); if (v) u.voice = v; speechSynthesis.speak(u); } catch (e) { }
}
const speakBtn = (txt, cls) => h('button.spk' + (cls ? '.' + cls : ''), { type: 'button', 'aria-label': 'Hear it', onclick: () => { sfx('tap'); speak(txt); } }, '🔊');

/* ---------- frame helpers ---------- */
const screenFrame = (cls, ...kids) => h('main.' + cls, ...kids);
const backBtn = (to, label, args) => h('button.back', { onclick: () => { sfx('tap'); go(to, args); } }, '◀ ' + label);
const starsEl = n => h('span.stars', [1, 2, 3].map(i => h('i' + (i <= n ? '.on' : ''), '★')));
function go(name, args) {
  CUR = { name, args: args || {} };
  const v = $('#view'); v.replaceChildren(); v.dataset.screen = name; document.body.dataset.screen = name;
  try { SCREENS[name](args || {}); } catch (e) { console.error('screen failed', name, e); v.append(h('div.oops', 'Something went wrong. Tap Home!')); }
  v.scrollTop = 0; updateHud();
}
function toast(msg, ms = 3000) { const t = h('div.toast', msg); document.body.append(t); requestAnimationFrame(() => t.classList.add('in')); setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 400); }, ms); }
function modal(o) {
  const ov = h('div.overlay' + (o.cls ? '.' + o.cls : '')), sheet = h('div.sheet', o.body); ov.append(sheet);
  const api = { close() { ov.classList.add('out'); setTimeout(() => ov.remove(), 220); o.onClose && o.onClose(); }, el: ov, sheet };
  if (o.dismiss !== false) ov.addEventListener('pointerdown', e => { if (e.target === ov) api.close(); });
  $('#ov').append(ov); requestAnimationFrame(() => ov.classList.add('in')); return api;
}
function addGems(n) { S.gems += n; save(); updateHud(); }
function updateHud() {
  const el = $('#hud'); if (!el) return;
  if (!S.setup || document.body.dataset.screen === 'welcome') { el.hidden = true; return; }
  el.hidden = false; const m = masteredCount(), n = SKILLS.length;
  el.replaceChildren(
    h('button.who', { onclick: () => go('wardrobe'), 'aria-label': 'Dress up' }, h('span.whoimg', { html: uniHead(S.uni.look) }), h('span.whotxt', h('b', S.uni.name), h('small', `${m} of ${n} skills mastered`))),
    h('div.meters', h('div.xpbar', h('i', { style: { width: Math.max(3, Math.round(100 * m / n)) + '%' } }), h('span', `🏰 Quest: ${m} / ${n}`))),
    h('div.hchips', h('button.hchip.gem', { onclick: () => go('wardrobe') }, '💎 ', h('b', S.gems)), h('button.hchip.round', { onclick: () => go('home'), 'aria-label': 'Home' }, '🏠'), h('button.hchip.round', { onclick: openSettings, 'aria-label': 'Settings' }, '⚙️')));
}

/* ---------- welcome ---------- */
SCREENS.welcome = () => {
  const look = Object.assign({}, S.uni.look), prev = h('div.wprev'), nameIn = h('input#w-uni', { type: 'text', maxlength: 14, value: 'Sparkle', 'aria-label': 'Unicorn name' });
  const draw = () => { prev.innerHTML = sceneSVG('blush') + uni(look, { mood: 'cheer', cls: 'wuni' }); };
  const sw = (cat, ids) => h('div.swrow', ids.map(id => { const set = catOf(cat).set[id], col = cat === 'coat' ? set.c[0] : set.s[Math.min(1, set.s.length - 1)]; const b = h('button.swatch' + (look[cat] === id ? '.on' : ''), { style: { '--sw': col }, 'aria-label': set.n, onclick: () => { look[cat] = id; $$('.swatch', b.parentNode).forEach(x => x.classList.remove('on')); b.classList.add('on'); sfx('pop'); draw(); } }); return b; }));
  draw();
  $('#view').append(screenFrame('welcome', h('div.wcard', prev, h('div.wform',
    h('h1', 'Meet your unicorn!'), h('p', 'Give her a name and pick her colors. You can change everything later.'),
    h('label', { for: 'w-uni' }, 'Her name'), nameIn, h('div.wlab', 'Coat'), sw('coat', ['cream', 'lilac', 'pink', 'mint', 'sky', 'peach']), h('div.wlab', 'Mane'), sw('mane', ['pinkberry', 'grape', 'blueberry', 'minty', 'sunshine']),
    h('button.btn.big', { onclick: () => { S.uni.name = nameIn.value.trim() || 'Sparkle'; S.uni.look = look; S.setup = true; ['coat', 'mane'].forEach(c => { S.owned[itemKey(c, look[c])] = 1; }); save(); sfx('great'); rainFX(90); go('home'); } }, 'Start the adventure! ✨')))));
};

/* ---------- home ---------- */
const GREET = ['Hi {n}! Ready to sparkle?', 'One skill at a time. You can do it!', 'I love learning with you!', 'You are so smart, {n}!', 'Tap me, I am ticklish!', 'Rainbows are my favorite!'];
const PETS = ['Hee hee! That tickles!', 'More sparkles please!', 'I love you, {n}!', 'You make me so happy!', 'Yay, a friend hug!'];
SCREENS.home = () => {
  const i = currentSkill(), sk = SKILLS[i], st = skState(sk.id), lv = nextLevelOf(sk.id), all = masteredCount() === SKILLS.length;
  const uniBox = h('div.hunicorn', { role: 'button', tabindex: '0', 'aria-label': 'Pet your unicorn' }), bubble = h('div.hbubble', { html: esc(pick1(GREET).replace('{n}', S.name)) });
  const showUni = (m, ms) => { uniBox.innerHTML = uni(S.uni.look, { mood: m, cls: 'hmain' }); if (ms) setTimeout(() => { if (CUR.name === 'home') showUni('happy'); }, ms); };
  showUni('happy');
  uniBox.addEventListener('click', e => { sfx('sparkle'); buzz(20); burst(e.clientX, e.clientY, { n: 16, kinds: ['heart', 'star'], speed: 7 }); bubble.innerHTML = esc(pick1(PETS).replace('{n}', S.name)); showUni('cheer', 1800); });
  const tile = (icon, label, sub, fn) => h('button.tile2', { onclick: () => { sfx('tap'); fn(); } }, h('span.t2i', icon), h('b', label), h('small', sub));
  $('#view').append(screenFrame('home',
    h('section.hstage', h('div.hscene', { html: sceneSVG(S.uni.look.scene) }), bubble, uniBox),
    h('section.hmenu',
      h('button.cta', { onclick: () => { sfx('tap'); go('skill', { id: sk.id }); } }, h('span.ctai', all ? '👑' : sk.icon), h('span.ctat', h('b', all ? 'Rainbow Palace is open!' : (st.learned ? 'Continue: ' : 'Start: ') + sk.name), h('small', all ? 'Take the royal test' : st.learned ? `Level ${lv}: ${LVNAME[lv]}` : 'Learn it first, then play'))),
      h('div.tiles',
        tile('🗺️', 'Quest Path', `${masteredCount()} of ${SKILLS.length} mastered`, () => go('path')),
        tile('👗', 'Dress-Up', 'Spend your gems', () => go('wardrobe')),
        tile('📖', 'Spell Scrolls', 'Review the rules', () => go('scrolls')),
        tile('⚙️', 'Grown-Ups', 'Settings', openSettings)))));
};

/* ---------- quest path (one skill at a time) ---------- */
SCREENS.path = () => {
  const cur = currentSkill();
  const stones = SKILLS.map((s, i) => {
    const open = skUnlocked(i), st = skState(s.id), done = st.mastered, next = i === cur && !done;
    const stars = [1, 2, 3, 4, 5].reduce((a, l) => a + (lvStars(s.id, l) > 0 ? 1 : 0), 0);
    return h('button.stone' + (done ? '.done' : '') + (next ? '.next' : '') + (open ? '' : '.locked'), { style: { '--c': s.c, '--soft': s.soft }, disabled: !open, onclick: () => { sfx('tap'); go('skill', { id: s.id }); } },
      h('span.sn', done ? '✔' : open ? String(i + 1) : '🔒'), h('span.sic', s.icon), h('span.stx', h('b', s.name), h('small', open ? (s.single ? 'The final royal test' : `${s.place} · ${stars} of 5 levels`) : 'Master the one before to open')),
      next ? h('span.sunicorn', { html: uniHead(S.uni.look) }) : null);
  });
  $('#view').append(screenFrame('pathscreen', h('div.mhead', backBtn('home', 'Home'), h('h1', 'Quest Path'), h('p', 'Master one skill, then the next one opens. Follow the rainbow!')), h('div.stones', stones)));
  setTimeout(() => { const n = $('.stone.next'); n && n.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 80);
};

/* ---------- one skill ---------- */
SCREENS.skill = ({ id }) => {
  const s = skillById(id), st = skState(id), i = skIdx(id);
  if (!skUnlocked(i)) { go('path'); return; }
  const lvls = s.single ? [5] : [1, 2, 3, 4, 5];
  const card = l => {
    const open = lvUnlocked(id, l) && (st.learned || s.single || S.unlockAll), done = lvDone(id, l);
    return h('button.lvl' + (done ? '.done' : '') + (open ? '' : '.locked') + (l === 5 ? '.boss' : ''), { disabled: !open, onclick: () => { sfx('tap'); startLevel(id, l); } },
      h('span.li', open ? LVICON[l] : '🔒'), h('b', s.single ? 'Royal Test' : `Level ${l}`), h('small', s.single ? '20 questions' : LVNAME[l] + (l === 5 ? ' (mastery!)' : '')), starsEl(lvStars(id, l)), h('em', open ? (done ? 'Done!' : 'Play') : 'Locked'));
  };
  $('#view').append(screenFrame('skillscreen', { style: { '--c': s.c, '--soft': s.soft } },
    backBtn('path', 'Path'),
    h('div.rhero', h('div.ricon', s.icon), h('div.rtxt', h('h1', s.name), h('p', s.blurb)), h('div.rst', st.mastered ? '🏆 Mastered!' : (s.place))),
    h('button.step', { onclick: () => { sfx('tap'); startLearn(id); } }, h('span.sicon', '📜'), h('b', 'Spell Scrolls'), h('small', st.learned ? 'Read it again' : 'Start here: learn it first!')),
    h('div.lvls', lvls.map(card)),
    h('div.rmascot', h('div.rbub', st.learned ? (st.mastered ? 'You mastered this one! 🎉' : 'Pass Level ' + nextLevelOf(id) + ' to keep going!') : 'Read the Spell Scrolls first. Then Level 1 opens!'), h('div.rmuni', { html: uni(S.uni.look, { mood: 'happy', cls: 'hmain' }) }))));
};
SCREENS.scrolls = () => {
  $('#view').append(screenFrame('pathscreen', h('div.mhead', backBtn('home', 'Home'), h('h1', 'Spell Scrolls'), h('p', 'Tap a skill to read the rules again.')),
    h('div.stones', SKILLS.filter(s => !s.single).map(s => h('button.stone', { style: { '--c': s.c, '--soft': s.soft }, onclick: () => { sfx('tap'); startLearn(s.id, true); } }, h('span.sic', s.icon), h('span.stx', h('b', s.name), h('small', s.blurb)))))));
};

/* ---------- learn (spell scrolls) ---------- */
function startLearn(id, fromScrolls) {
  const s = skillById(id); let i = 0; const done = () => { skState(id).learned = true; save(); sfx('great'); if (fromScrolls) go('scrolls'); else go('skill', { id }); };
  const render = () => {
    const [title, text, ex] = s.learn[i], last = i === s.learn.length - 1;
    const v = $('#view'); v.replaceChildren(); v.dataset.screen = 'learn';
    v.append(screenFrame('learnscreen', { style: { '--c': s.c, '--soft': s.soft } },
      h('div.lhead', h('button.back', { onclick: () => { sfx('tap'); fromScrolls ? go('scrolls') : go('skill', { id }); } }, '✕ Close'), h('b', `${s.icon} ${s.name}`), h('span.lpg', `${i + 1} / ${s.learn.length}`)),
      h('div.lcard', h('h2', title), h('p.ltext', { html: text }), speakBtn(text, 'ltts'),
        h('div.lex', ex.filter(r => r[0] || r[1]).map(r => h('div.lrow', h('span', { html: r[0] }), r[1] ? h('span.lr2', { html: r[1] }) : null)))),
      h('div.lnav', h('button.btn.soft', { disabled: i === 0, onclick: () => { i--; sfx('flip'); render(); } }, '◀ Back'), h('button.btn' + (last ? '.pulse' : ''), { onclick: () => { sfx('flip'); if (last) done(); else { i++; render(); } } }, last ? "I'm ready! ✨" : 'Next ▶')),
      h('div.rmascot', h('div.rmuni', { html: uni(S.uni.look, { mood: 'happy', cls: 'hmain' }) }))));
  };
  render();
}

/* ============================ PLAY ============================ */
const PRAISE = ['Magical!', 'Sparkly!', 'Fabulous!', 'Amazing!', 'Superb!', 'Dazzling!', 'Wonderful!', 'You did it!', 'Brilliant!', 'Super smart!'];
const SECOND = ['You figured it out!', 'Great fixing!', 'Brain power!', 'Never giving up!', 'Smart thinking!'];
const OOPS = ['Almost!', 'So close!', 'Good try!', 'Look again!', 'Try another!', 'You can do it!'];
function startLevel(id, l) {
  const s = skillById(id); let qs;
  try { qs = s.gen(l); } catch (e) { console.error(e); toast('Could not make this level. Try again!'); return; }
  RUN = { id, l, s, qs, i: 0, score: 0, firsts: 0, miss: [], t0: Date.now(), streak: 0, results: [], quit: false };
  go('play');
}
SCREENS.play = () => {
  if (!RUN) { go('home'); return; }
  const R = RUN, s = R.s;
  const dots = h('div.pdots', R.qs.map((_, i) => h('i')));
  R.ui = {};
  R.ui.dots = dots;
  R.ui.q = h('div.pq'); R.ui.ans = h('div.pans'); R.ui.fb = h('div.pfb');
  R.ui.bub = h('div.pbub'); R.ui.muni = h('div.pmuni');
  R.ui.quit = h('button.back', { onclick: e => { const b = e.currentTarget; if (b.dataset.arm) { RUN = null; sfx('tap'); go('skill', { id: s.id }); } else { b.dataset.arm = '1'; b.textContent = 'Quit? Tap again'; setTimeout(() => { if (b.isConnected) { delete b.dataset.arm; b.textContent = '✕ Quit'; } }, 2500); } } }, '✕ Quit');
  $('#view').append(screenFrame('play', { style: { '--c': s.c, '--soft': s.soft } },
    h('div.ptop', R.ui.quit, h('div.pmid', h('b', s.single ? 'Royal Test' : `${s.name}: Level ${R.l} (${LVNAME[R.l]})`), dots), h('div.pscore', '⭐ ', h('b#sc', '0'))),
    h('div.pbody2', h('div.pside', R.ui.bub, R.ui.muni), h('div.pmain', R.ui.q, R.ui.ans, R.ui.fb))));
  showQ();
};
function mascot(mood, text) { const R = RUN; if (!R || !R.ui) return; R.ui.muni.innerHTML = uni(S.uni.look, { mood, cls: 'pu' }); if (text != null) { R.ui.bub.innerHTML = esc(text); R.ui.bub.classList.remove('pop'); void R.ui.bub.offsetWidth; R.ui.bub.classList.add('pop'); } }
function showQ() {
  const R = RUN; if (!R) return; const q = R.qs[R.i]; if (!q) return finishRun();
  R.cur = { q, tries: 0, done: false, t0: Date.now(), hintShown: false, hints: 0 };
  $$('i', R.ui.dots).forEach((d, i) => { d.className = i < R.i ? (R.results[i] === 1 ? 'ok' : R.results[i] > 0 ? 'half' : 'miss') : i === R.i ? 'now' : ''; });
  R.ui.q.replaceChildren(h('div.qnum', `Question ${R.i + 1} of ${R.qs.length}`), h('div.qtext', { html: q.q.replace(/<small>/g, '<small>').replace(/class="big"/g, 'class="big"') }), q.say || q.k === 'pick' || q.k === 'type' ? speakBtn(q.say || q.q, 'qtts') : null);
  if (q.hideq) { /* dictation: do not show the key word */ }
  R.ui.ans.replaceChildren(); R.ui.fb.replaceChildren();
  mascot('happy', R.l === 1 ? pick1(['Take your time. You can do it!', 'This one is a gentle start!', 'Think it through.']) : pick1(['Sparkle time!', 'I believe in you!', 'Think it through.', 'You can do it!']));
  const hintLine = (R.l === 1 && q.hint) ? h('div.hint', '🪄 Hint: ' + q.hint) : null; if (hintLine) { R.ui.fb.append(hintLine); R.cur.hintShown = true; }
  (K[q.k] || K.pick)(R.ui.ans, q, R.cur);
  if (q.say) setTimeout(() => speak(q.say), 350);
  $('#view').scrollTop = 0;
}
/* result of one try: ok true/false; returns whether the question is finished */
function answered(ok, o = {}) {
  const R = RUN, c = R.cur, q = c.q; if (c.done) return true;
  c.tries++;
  if (ok) {
    c.done = true; const pts = o.pts != null ? o.pts : c.tries === 1 ? 1 : .5; R.score += pts; R.results[R.i] = pts; if (pts === 1) { R.firsts++; R.streak++; } else R.streak = 0;
    S.stats.answered++; if (pts === 1) S.stats.first++; else S.stats.second++; S.stats.bestStreak = Math.max(S.stats.bestStreak, R.streak);
    $('#sc').textContent = String(Math.round(R.score * 10) / 10).replace(/\.0$/, '');
    sfx(pts === 1 ? 'good' : 'soft'); buzz(15);
    const gem = pts === 1 ? 2 : 1; addGems(gem); const fx = c.fxEl || R.ui.ans; floatText(fx, `+${gem} 💎`); burstAt(fx, { n: pts === 1 ? 26 : 12, speed: 8 });
    mascot('cheer', pts === 1 ? pick1(PRAISE) : pick1(SECOND));
    report(q, true, c, o);
    R.ui.fb.replaceChildren(h('div.good', h('b', pts === 1 ? pick1(PRAISE) : pick1(SECOND)), q.why ? h('span', { html: ' ' + q.why }) : null), nextBtn());
    return true;
  }
  sfx('soft'); R.streak = 0;
  if (c.tries >= 2) {
    c.done = true; R.results[R.i] = 0; S.stats.answered++; mascot('happy', "That's okay! Let's learn it.");
    report(q, false, c, o);
    R.ui.fb.replaceChildren(h('div.reveal', h('b', 'Here is the answer:'), h('div.rans', { html: o.reveal || '' }), q.why ? h('div', { html: q.why }) : null), nextBtn());
    return true;
  }
  mascot('happy', pick1(OOPS));
  c.hints++; R.ui.fb.replaceChildren(h('div.try', h('b', pick1(OOPS) + ' Try once more.'), q.hint ? h('div', { html: '🪄 Hint: ' + q.hint }) : null));
  return false;
}
function nextBtn() { const R = RUN; const last = R.i === R.qs.length - 1; return h('button.btn.big.pulse#nextb', { onclick: () => { sfx('tap'); R.i++; if (R.i >= R.qs.length) finishRun(); else showQ(); } }, last ? 'See my result ▶' : 'Next ▶'); }
function report(q, ok, c, o) {
  try {
    const p = hubOn(); if (!p) return;
    const R = RUN, first = ok && c.tries === 1;
    Hub.record({ profile: p.id, app: APP_ID, skill: R.s.id, ok: first, hints: first ? 0 : 1, ms: Date.now() - c.t0, mode: 'L' + R.l, prompt: plainTxt(q.q), given: o.given || '', correct: o.reveal ? plainTxt(o.reveal) : (q.ans != null ? String([].concat(q.ans)[0]) : ''), why: q.tag || '' });
  } catch (e) { }
}

/* ---------- question kinds ---------- */
const K = {};
const mark = (el, cls) => { el.classList.add(cls); };
K.pick = (host, q, c) => {
  const opts = h('div.opts' + (q.opts.length === 2 ? '.two' : ''), q.opts.map((o, i) => h('button.opt', { type: 'button', onclick: e => {
    if (c.done) return; const b = e.currentTarget; sfx('tap');
    if (i === q.a) { mark(b, 'right'); c.fxEl = b; $$('.opt', opts).forEach(x => { x.disabled = true; }); answered(true); }
    else { mark(b, 'wrong'); b.disabled = true; const fin = answered(false, { reveal: esc(q.ans), given: o }); if (fin) { $$('.opt', opts).forEach((x, j) => { x.disabled = true; if (j === q.a) x.classList.add('right'); }); } }
  } }, h('span.let', 'ABCD'[i]), h('span.ot', { html: esc(o) }))));
  host.append(opts);
};
const typeOk = (q, v) => q.ans.some(a => norm(a) === norm(v));
K.type = (host, q, c) => {
  const inp = h('input.tin', { type: 'text', autocomplete: 'off', autocapitalize: 'none', autocorrect: 'off', spellcheck: 'false', 'aria-label': 'Type your answer', placeholder: 'Type here' });
  const go1 = h('button.btn', { type: 'button', onclick: () => check() }, 'Check ✓');
  function check() {
    if (c.done) return; const v = inp.value; if (!norm(v)) { inp.focus(); return; }
    if (typeOk(q, v)) { inp.classList.add('right'); inp.disabled = true; go1.disabled = true; c.fxEl = inp; answered(true, { given: v }); }
    else { inp.classList.add('wrong'); setTimeout(() => inp.classList.remove('wrong'), 600); const fin = answered(false, { given: v, reveal: esc(q.ans[0]) }); if (fin) { inp.disabled = true; go1.disabled = true; } else { inp.select(); } }
  }
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
  host.append(h('div.trow', inp, go1)); setTimeout(() => { try { inp.focus(); } catch (e) { } }, 250);
};
K.build = (host, q, c) => {
  const slots = h('div.bline'), bank = h('div.bbank'); let line = [];
  const tiles = q.tiles.map((t, i) => ({ t, i, used: false }));
  const drawB = () => {
    slots.replaceChildren(...(line.length ? line.map(ti => h('button.tile.placed', { onclick: () => { if (c.done) return; ti.used = false; line = line.filter(x => x !== ti); sfx('pop'); drawB(); } }, ti.t)) : [h('span.bph', 'Tap the tiles in order')]));
    bank.replaceChildren(...tiles.map(ti => h('button.tile' + (ti.used ? '.used' : ''), { disabled: ti.used, onclick: () => { if (c.done || ti.used) return; ti.used = true; line.push(ti); sfx('pop'); drawB(); } }, ti.t)));
    chk.disabled = line.length === 0;
  };
  const chk = h('button.btn', { onclick: () => {
    if (c.done) return; const got = line.map(x => x.t).join(q.join), want = q.target.join(q.join);
    if (got === want || (q.join === ' ' && norm(got) === norm(want))) { c.fxEl = slots; slots.classList.add('right'); chk.disabled = true; $$('.tile', bank).forEach(x => x.disabled = true); answered(true, { given: got }); }
    else { slots.classList.add('wrong'); setTimeout(() => slots.classList.remove('wrong'), 600); const fin = answered(false, { given: got, reveal: esc(want) }); if (fin) { chk.disabled = true; $$('.tile', bank).forEach(x => x.disabled = true); } }
  } }, 'Check ✓');
  const clr = h('button.btn.soft', { onclick: () => { if (c.done) return; tiles.forEach(t => t.used = false); line = []; sfx('tap'); drawB(); } }, 'Start over');
  host.append(slots, bank, h('div.brow', clr, chk)); drawB();
};
K.sort = (host, q, c) => {
  const items = q.items.map(([t, b], i) => ({ t, b, i, at: -1, ok: false })); let sel = null;
  const tray = h('div.stray'), zones = q.buckets.map((b, bi) => h('div.zone', { onclick: () => place(bi) }, h('div.zh', { html: esc(b) }), h('div.zin')));
  const chk = h('button.btn', { disabled: true, onclick: () => check() }, 'Check ✓');
  function place(bi) { if (c.done || !sel) return; sel.at = bi; sel = null; sfx('pop'); draw(); }
  function draw() {
    tray.replaceChildren(...items.filter(x => x.at < 0).map(x => h('button.chip2' + (sel === x ? '.sel' : ''), { onclick: () => { if (c.done) return; sel = sel === x ? null : x; sfx('tap'); draw(); } }, x.t)));
    zones.forEach((z, bi) => { $('.zin', z).replaceChildren(...items.filter(x => x.at === bi).map(x => h('button.chip2.in' + (x.ok ? '.ok' : '') + (x.bad ? '.bad' : ''), { onclick: e => { e.stopPropagation(); if (c.done || x.ok) return; x.at = -1; x.bad = false; sfx('pop'); draw(); } }, x.t))); z.classList.toggle('hot', !!sel); });
    chk.disabled = items.some(x => x.at < 0);
  }
  function check() {
    if (c.done) return; const wrong = items.filter(x => x.at !== x.b); items.forEach(x => { x.ok = x.at === x.b; x.bad = x.at !== x.b; });
    if (!wrong.length) { c.fxEl = chk; chk.disabled = true; answered(true); draw(); }
    else { const fin = answered(false, { given: wrong.map(x => x.t).join(', '), reveal: q.buckets.map((b, bi) => `<b>${esc(b)}</b>: ${items.filter(x => x.b === bi).map(x => esc(x.t)).join(', ')}`).join('<br>') }); if (fin) { items.forEach(x => { x.at = x.b; x.ok = true; x.bad = false; }); chk.disabled = true; } else { items.forEach(x => { if (x.bad) { x.at = -1; x.bad = false; } }); sel = null; } draw(); }
  }
  host.append(h('div.stip', 'Tap a word, then tap where it goes.'), tray, h('div.zones' + (q.buckets.length > 3 ? '.four' : ''), zones), h('div.brow', chk)); draw();
};
const PCOL = ['#ff5fa8', '#38b6f2', '#2fc99e', '#ffb21f', '#8f5cf2', '#ff7a5c'];
K.pair = (host, q, c) => {
  const L = q.pairs.map(p => p[0]), Rr = shuffle(q.pairs.map(p => p[1])); let selL = null, misses = 0; const done = {};
  const col = h('div.pcol'), colR = h('div.pcol');
  function draw() {
    col.replaceChildren(...L.map((t, i) => h('button.pbtn' + (done[t] != null ? '.done' : '') + (selL === t ? '.sel' : ''), { style: done[t] != null ? { '--pc': PCOL[done[t] % 6] } : {}, disabled: done[t] != null, onclick: () => { if (c.done) return; selL = t; sfx('tap'); draw(); } }, t)));
    colR.replaceChildren(...Rr.map(t => { const m = Object.keys(done).find(k => q.pairs.find(p => p[0] === k)[1] === t); return h('button.pbtn' + (m != null ? '.done' : ''), { style: m != null ? { '--pc': PCOL[done[m] % 6] } : {}, disabled: m != null, onclick: e => {
      if (c.done || !selL) { if (!selL) toast('Tap a word on the left first!', 1500); return; }
      const ok = q.pairs.find(p => p[0] === selL)[1] === t;
      if (ok) { done[selL] = Object.keys(done).length; sfx('boop', Object.keys(done).length); burstAt(e.currentTarget, { n: 10, speed: 6 }); selL = null; draw(); if (Object.keys(done).length === L.length) { c.fxEl = col; const pts = misses === 0 ? 1 : misses <= 2 ? .5 : 0; if (pts > 0) answered(true, { pts }); else { c.tries = 2; answered(false, { reveal: q.pairs.map(p => `${esc(p[0])} = ${esc(p[1])}`).join('<br>'), given: misses + ' wrong' }); R.cur.done = true; } } }
      else { misses++; sfx('soft'); e.currentTarget.classList.add('wrong'); setTimeout(() => draw(), 500); mascot('happy', pick1(OOPS)); }
    } }, t); }));
  }
  const R = RUN; host.append(h('div.stip', 'Tap a word on the left, then its match on the right.'), h('div.pairs', col, colR)); draw();
};
K.label = (host, q, c) => {
  const lab = q.words.map(() => null); let sel = 0;
  const row = h('div.lrowl'), pal = h('div.lpal'), chk = h('button.btn', { disabled: true, onclick: () => check() }, 'Check ✓');
  const LC = { Noun: '#ff5fa8', Verb: '#38b6f2', Adjective: '#2fc99e', Adverb: '#ffb21f', Pronoun: '#8f5cf2', Interjection: '#ff7a5c' };
  function draw() {
    row.replaceChildren(...q.words.map((w, i) => h('button.lw2' + (sel === i ? '.sel' : '') + (lab[i] ? '.set' : '') + (w.bad ? '.bad' : '') + (w.ok ? '.ok' : ''), { style: lab[i] ? { '--lc': LC[lab[i]] || '#8f5cf2' } : {}, onclick: () => { if (c.done) return; sel = i; sfx('tap'); draw(); } }, h('span', w[0]), h('small', lab[i] || '?'))));
    pal.replaceChildren(...q.labels.map(l => h('button.lchip', { style: { '--lc': LC[l] || '#8f5cf2' }, onclick: () => { if (c.done || sel == null) return; lab[sel] = l; q.words[sel].bad = false; sfx('pop'); const nx = lab.findIndex(x => !x); sel = nx < 0 ? sel : nx; draw(); } }, l)));
    chk.disabled = lab.some(x => !x);
  }
  function check() {
    if (c.done) return; const wrong = q.words.filter((w, i) => lab[i] !== w[1]);
    if (!wrong.length) { c.fxEl = row; q.words.forEach(w => w.ok = true); chk.disabled = true; answered(true); draw(); }
    else { q.words.forEach((w, i) => { w.bad = lab[i] !== w[1]; }); const fin = answered(false, { given: wrong.map(w => w[0]).join(', '), reveal: q.words.map(w => `${esc(w[0])} = <b>${esc(w[1])}</b>`).join('<br>') }); if (fin) { q.words.forEach((w, i) => { lab[i] = w[1]; w.bad = false; w.ok = true; }); chk.disabled = true; } draw(); }
  }
  host.append(h('div.stip', 'Tap a word, then tap its label.'), row, pal, h('div.brow', chk)); draw();
};
K.split = (host, q, c) => {
  const row = h('div.srow'); let picked = null;
  function draw() {
    const kids = []; q.words.forEach((w, i) => { if (i > 0) kids.push(h('button.gap' + (picked === i ? '.sel' : '') + (c.done && i === q.at ? '.right' : ''), { 'aria-label': 'Split here', onclick: () => pickGap(i) }, h('i'))); kids.push(h('span.sw' + (picked != null ? (i < picked ? '.sub' : '.pred') : ''), w)); });
    row.replaceChildren(...kids);
  }
  function pickGap(i) {
    if (c.done) return; picked = i; sfx('tap'); draw();
    if (i === q.at) { c.fxEl = row; answered(true, { given: q.words.slice(0, i).join(' ') }); draw(); }
    else { const fin = answered(false, { given: q.words.slice(0, i).join(' '), reveal: `<b>${esc(q.words.slice(0, q.at).join(' '))}</b> | ${esc(q.words.slice(q.at).join(' '))}` }); if (fin) { picked = q.at; draw(); } else { setTimeout(() => { picked = null; draw(); }, 700); } }
  }
  host.append(h('div.stip', 'Tap the little line between two words.'), row); draw();
};

/* ---------- finish a level ---------- */
function finishRun() {
  const R = RUN; if (!R) return; const n = R.qs.length, pct = R.score / n, pass = pct >= NEED[R.l], stars = pct >= .999 ? 3 : pct >= .9 ? 2 : pass ? 1 : 0;
  const st = skState(R.s.id), prev = st.lv[R.l] || {}; const first = !prev.pass && pass;
  st.lv[R.l] = { pass: prev.pass || pass, best: Math.max(prev.best || 0, Math.round(pct * 100)), stars: Math.max(prev.stars || 0, stars) };
  let mastered = false; if (pass && R.l === 5 && !st.mastered) { st.mastered = true; mastered = true; }
  S.stats.rounds++; if (pct >= .999) S.stats.perfect++;
  const gems = pass ? (first ? 6 + R.l * 2 : 3) + (stars === 3 ? 4 : 0) + (mastered ? 20 : 0) : 1; S.gems += gems; save();
  try { const p = hubOn(); if (p) Hub.session({ profile: p.id, app: APP_ID, skill: R.s.id, mode: 'L' + R.l, n, ok: Math.round(R.score), ms: Date.now() - R.t0 }); } catch (e) { }
  const ids = R.s.id, lvN = R.l; RUN = null;
  go('result', { id: ids, l: lvN, pass, stars, pct, gems, mastered, first, n, score: R.score });
}
SCREENS.result = a => {
  const s = skillById(a.id), nextSkill = SKILLS[skIdx(a.id) + 1];
  const pctTxt = Math.round(a.pct * 100) + '%';
  if (a.pass) { sfx(a.mastered ? 'level' : 'great'); setTimeout(() => rainFX(a.mastered ? 160 : 90), 200); } else sfx('soft');
  const msg = a.mastered ? (s.single ? 'You finished the whole quest!' : `You mastered ${s.name}!`) : a.pass ? 'Level passed!' : 'So close! Let\'s practice and try again.';
  const sub = a.mastered ? (nextSkill ? `A new skill opened: ${nextSkill.name}` : 'Grammar Queen!') : a.pass ? (a.l < 5 ? `Level ${a.l + 1} is open now!` : '') : `You need ${Math.round(NEED[a.l] * 100)}% to pass. You got ${pctTxt}.`;
  const btns = [];
  if (a.pass && a.l < 5) btns.push(h('button.btn.big', { onclick: () => startLevel(a.id, a.l + 1) }, `Level ${a.l + 1} ▶`));
  if (a.mastered && nextSkill) btns.push(h('button.btn.big', { onclick: () => go('skill', { id: nextSkill.id }) }, `Next: ${nextSkill.name} ▶`));
  if (!a.pass) btns.push(h('button.btn.big', { onclick: () => startLevel(a.id, a.l) }, 'Try again 🔁'));
  if (!a.pass) btns.push(h('button.btn.soft', { onclick: () => startLearn(a.id) }, '📜 Read the scrolls'));
  btns.push(h('button.btn.soft', { onclick: () => go('skill', { id: a.id }) }, 'Back to skill'));
  $('#view').append(screenFrame('result', { style: { '--c': s.c, '--soft': s.soft } }, h('div.rcard', h('div.runi', { html: uni(S.uni.look, { mood: a.pass ? 'cheer' : 'happy', cls: 'celuni' }) }), h('h1', msg), h('p', sub), h('div.rst2', starsEl(a.stars)), h('div.rnums', h('div', h('b', a.score.toFixed(a.score % 1 ? 1 : 0)), h('small', `of ${a.n} points`)), h('div', h('b', pctTxt), h('small', 'score')), h('div', h('b', '+' + a.gems), h('small', '💎 gems'))), h('div.rbtns', btns))));
};

/* ---------- dress-up ---------- */
SCREENS.wardrobe = (args) => {
  let cat = args.cat || 'coat'; const wrap = h('div.wardrobe'), view = h('div.wview'), tabs = h('div.wtabs'), grid = h('div.wgrid');
  const price = it => it.price || 0;
  const draw = () => {
    view.innerHTML = sceneSVG(S.uni.look.scene) + uni(S.uni.look, { mood: 'happy', cls: 'wuni' });
    tabs.replaceChildren(...CATS.map(c => h('button.wtab' + (c.id === cat ? '.on' : ''), { onclick: () => { cat = c.id; sfx('tap'); draw(); } }, c.icon + ' ' + c.name)));
    const c = catOf(cat);
    grid.replaceChildren(...Object.keys(c.set).map(id => {
      const it = c.set[id], own = isOwned(cat, id), on = S.uni.look[cat] === id;
      return h('button.witem' + (on ? '.on' : ''), { onclick: () => {
        if (own) { S.uni.look[cat] = id; save(); sfx('pop'); draw(); updateHud(); }
        else if (S.gems >= price(it)) { S.gems -= price(it); S.owned[itemKey(cat, id)] = 1; S.uni.look[cat] = id; save(); sfx('reveal'); burstAt(view, { n: 40, speed: 10 }); draw(); updateHud(); }
        else { sfx('soft'); toast(`You need ${price(it) - S.gems} more 💎. Keep learning!`, 2200); }
      } }, h('div.wthumb', { html: itemThumb(cat, id) }), h('b', it.n || id), own ? h('span.wchip.own', on ? 'Wearing' : 'Yours') : h('span.wchip.price', `💎 ${price(it)}`), h('span.rar', { style: { '--rc': (RAR[it.rar] || RAR.common).c } }, (RAR[it.rar] || RAR.common).n));
    }));
  };
  wrap.append(h('div.wleft', view, h('div.wname', S.uni.name)), h('div.wright', tabs, grid));
  $('#view').append(screenFrame('wardrobe', h('div.mhead', backBtn('home', 'Home'), h('h1', 'Dress-Up'), h('p', `You have 💎 ${S.gems}. Earn more by answering questions!`)), wrap)); draw();
};

/* ---------- settings / grown-up corner ---------- */
function openSettings() {
  let m; const toggle = (label, key) => { const b = h('button.tog' + (S.settings[key] ? '.on' : ''), { onclick: () => { S.settings[key] = !S.settings[key]; save(); b.classList.toggle('on', S.settings[key]); b.textContent = S.settings[key] ? 'On' : 'Off'; } }, S.settings[key] ? 'On' : 'Off'); return h('div.srow2', h('span', label), b); };
  const code = h('textarea.imp', { rows: 3, placeholder: 'Paste a save code here', 'aria-label': 'Save code' });
  let taps = 0; const unlock = h('button.btn.soft.sm', { onclick: () => { S.unlockAll = !S.unlockAll; save(); toast(S.unlockAll ? 'Everything is unlocked (grown-up mode)' : 'Back to one skill at a time', 2500); m.close(); go('home'); } }, S.unlockAll ? 'Lock the path again' : 'Unlock all skills');
  m = modal({ body: h('div.setcard', h('h2', 'Settings'), toggle('Sounds', 'sound'), toggle('Read-aloud voice', 'voice'),
    h('div.gu', h('h3', 'Grown-ups'), h('p', 'Skills open one at a time. Use this only to skip ahead or check a later skill.'), unlock,
      h('p', 'Move progress to another device:'), h('button.btn.soft.sm', { onclick: () => { const c = exportCode(); code.value = c; code.select(); try { navigator.clipboard && navigator.clipboard.writeText(c); } catch (e) { } toast('Save code made. Copy it from the box.', 2500); } }, 'Make save code'), code,
      h('button.btn.soft.sm', { onclick: () => { if (importCode(code.value)) { toast('Loaded!'); m.close(); go('home'); } else toast('That code did not work.'); } }, 'Load code'),
      h('a.dashlink', { href: '../dashboard/' }, '📊 Parent & Teacher Dashboard')),
    h('button.btn', { onclick: () => m.close() }, 'Done')) });
}

/* ---------- boot ---------- */
(function boot() {
  fit(); addEventListener('resize', fit); addEventListener('orientationchange', () => setTimeout(fit, 250));
  loadState(); fxInit(); if (window.speechSynthesis) try { speechSynthesis.getVoices(); } catch (e) { }
  document.addEventListener('pointerdown', () => { ac(); }, { once: true });
  window.G5 = { S: () => S, go, startLevel, RUN: () => RUN, SKILLS, K, finishRun };
  hubOn();
  go(S.setup ? 'home' : 'welcome');
})();
