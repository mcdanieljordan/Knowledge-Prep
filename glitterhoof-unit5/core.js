'use strict';
/* ============ core: helpers, saved game, sound, sparkles ============ */
const KEY = 'glitterhoof_unit5_v1';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* never print the word "null": empty things are simply skipped */
['replaceChildren', 'append'].forEach(m => { const orig = Element.prototype[m]; Element.prototype[m] = function (...k) { return orig.apply(this, k.flat(Infinity).filter(x => x != null && x !== false)); }; });

/* tiny element builder: h('div.card#id', {onclick}, ...kids) */
function h(spec, attrs, ...kids) {
  if (attrs != null && (typeof attrs === 'string' || typeof attrs === 'number' || attrs.nodeType || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; }
  const tag = (spec.match(/^[a-z0-9]+/i) || ['div'])[0];
  const el = tag === 'svg' ? document.createElementNS('http://www.w3.org/2000/svg', 'svg') : document.createElement(tag);
  (spec.match(/[.#][\w-]+/g) || []).forEach(p => { if (p[0] === '.') el.classList.add(p.slice(1)); else el.id = p.slice(1); });
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'style' && typeof v === 'object') { for (const sk in v) { if (sk.startsWith('--')) el.style.setProperty(sk, v[sk]); else el.style[sk] = v[sk]; } }
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  kids.flat(Infinity).forEach(c => { if (c == null || c === false) return; el.append(c.nodeType ? c : document.createTextNode(String(c))); });
  return el;
}
const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1);[a[i], a[j]] = [a[j], a[i]]; } return a; };
const pickN = (a, n) => shuffle(a).slice(0, n);
const pick1 = a => a[rnd(a.length)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const plain = s => String(s).replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '');
const sleep = ms => new Promise(r => setTimeout(r, ms));
function bag(arr) {                        // never repeats until everything was used
  let q = [], last = null;
  return () => { if (!q.length) { q = shuffle(arr); if (q[0] === last && q.length > 1) q.push(q.shift()); } last = q.shift(); return last; };
}
const DECKS = {};
function deck(name, list) {                // draw n without repeats until the whole deck is used
  const d = DECKS[name] || (DECKS[name] = { q: [] });
  return {
    draw(n = 1, ok) {
      const out = []; let guard = 0;
      const good = x => !out.includes(x) && (!ok || ok(x));
      while (out.length < n && guard++ < 200) {
        if (!d.q.length) d.q = shuffle(list);
        const idx = d.q.findIndex(good);
        if (idx < 0) { d.q = shuffle(list); if (!d.q.some(good)) break; continue; }
        out.push(d.q.splice(idx, 1)[0]);
      }
      return out;
    }
  };
}

/* ============ saved game ============ */
function defaultState() {
  return {
    v: 1, name: 'Ensley', setup: false,
    uni: { name: 'Sparkle', look: { coat: 'cream', mane: 'pinkberry', style: 'flow', horn: 'gold', wings: 'none', head: 'none', face: 'none', neck: 'none', cape: 'none', scene: 'blush' } },
    xp: 0, gems: 25, owned: {}, sk: {}, seen: {}, hist: [], unlockAll: false,
    stats: { answered: 0, first: 0, second: 0, bestStreak: 0, rounds: 0, perfect: 0 },
    settings: { sound: true, voice: true }, created: Date.now()
  };
}
let S = defaultState();
let memoryOnly = false;
function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const o = JSON.parse(raw); const d = defaultState(); S = Object.assign(d, o, { uni: Object.assign(d.uni, o.uni || {}, { look: Object.assign(d.uni.look, (o.uni || {}).look || {}) }), stats: Object.assign(d.stats, o.stats || {}), settings: Object.assign(d.settings, o.settings || {}) }); }
  } catch (e) { memoryOnly = true; }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { memoryOnly = true; } }
function exportCode() { try { return btoa(unescape(encodeURIComponent(JSON.stringify(S)))); } catch (e) { return ''; } }
function importCode(code) {
  try { const o = JSON.parse(decodeURIComponent(escape(atob(String(code).trim())))); if (!o || o.v !== 1) return false; S = Object.assign(defaultState(), o); save(); return true; } catch (e) { return false; }
}

/* ============ sound (all made with the browser, no files) ============ */
let AC = null;
function ac() {
  if (!S.settings.sound) return null;
  try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) { AC = null; }
  return AC;
}
function tone(f, t, d, type = 'sine', v = 0.12) {
  const a = ac(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(), s = a.currentTime + t;
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, s); g.gain.linearRampToValueAtTime(v, s + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, s + d);
  o.connect(g); g.connect(a.destination); o.start(s); o.stop(s + d + 0.05);
}
const NOTES = { C5: 523, D5: 587, E5: 659, G5: 784, A5: 880, C6: 1047, E6: 1319, G6: 1568, C7: 2093 };
const SFX = {
  tap() { tone(700, 0, .06, 'triangle', .07); },
  good() { tone(NOTES.E5, 0, .14, 'sine', .12); tone(NOTES.A5, .09, .22, 'sine', .12); tone(NOTES.C7, .16, .3, 'sine', .04); },
  great() { [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6, NOTES.E6].forEach((f, i) => { tone(f, i * .075, .3, 'sine', .11); tone(f * 2, i * .075 + .02, .25, 'sine', .035); }); },
  soft() { tone(330, 0, .18, 'sine', .08); tone(294, .12, .26, 'sine', .07); },
  pop() { tone(900, 0, .05, 'triangle', .12); tone(1500, .03, .08, 'sine', .08); },
  flip() { tone(520, 0, .06, 'triangle', .07); },
  sparkle() { [1568, 2093, 1760, 2349].forEach((f, i) => tone(f, i * .05, .16, 'sine', .05)); },
  level() { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, i * .1, .34, 'triangle', .13)); },
  egg() { tone(220, 0, .08, 'square', .06); tone(196, .06, .1, 'square', .05); },
  crack() { tone(1200, 0, .04, 'square', .08); tone(800, .03, .06, 'square', .06); },
  reveal() { [392, 523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, i * .08, .4, 'triangle', .12)); },
  coin() { tone(1319, 0, .08, 'square', .06); tone(1760, .07, .22, 'square', .06); },
  boop(i = 0) { tone([523, 659, 784, 1047][i % 4], 0, .3, 'sine', .14); },
  whoosh() { tone(300, 0, .2, 'sawtooth', .03); tone(600, .05, .2, 'sine', .04); }
};
function sfx(n, a) { try { SFX[n] && SFX[n](a); } catch (e) { } }
function buzz(ms = 12) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { } }

/* ============ sparkles (one canvas on top of everything) ============ */
const FX = { ps: [], run: false, c: null, ctx: null };
function fxInit() {
  FX.c = $('#fx'); if (!FX.c) return;
  FX.ctx = FX.c.getContext('2d');
  const size = () => { const r = devicePixelRatio || 1; FX.c.width = innerWidth * r; FX.c.height = innerHeight * r; FX.ctx.setTransform(r, 0, 0, r, 0, 0); };
  size(); addEventListener('resize', size);
}
const FXCOL = ['#ff5fa8', '#ffcf4a', '#55d6b4', '#5cc8ff', '#a97bff', '#ff9ad0', '#ffffff'];
function starPath(c, r, spikes = 4, inner = .42) {
  c.beginPath();
  for (let i = 0; i < spikes * 2; i++) { const rr = i % 2 ? r * inner : r, a = Math.PI * i / spikes - Math.PI / 2; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  c.closePath();
}
function heartPath(c, r) {
  c.beginPath(); c.moveTo(0, r * .9);
  c.bezierCurveTo(-r * 1.6, -r * .2, -r * .7, -r * 1.3, 0, -r * .45);
  c.bezierCurveTo(r * .7, -r * 1.3, r * 1.6, -r * .2, 0, r * .9); c.closePath();
}
function burst(x, y, o = {}) {
  if (!FX.c) return;
  const n = o.n || 24, kinds = o.kinds || ['star', 'dot', 'heart'], cols = o.cols || FXCOL, spd = o.speed || 9;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = (.35 + Math.random()) * spd;
    FX.ps.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (o.lift == null ? 3 : o.lift), g: o.g == null ? .32 : o.g, r: (o.size || 9) * (.6 + Math.random() * .8), rot: Math.random() * 6, vr: (Math.random() - .5) * .3, c: pick1(cols), k: pick1(kinds), life: 0, max: (o.life || 62) + rnd(24) });
  }
  if (!FX.run) { FX.run = true; requestAnimationFrame(fxStep); }
}
function rainFX(n = 90, kinds) {            // confetti from the top
  if (!FX.c) return;
  for (let i = 0; i < n; i++) FX.ps.push({ x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * .4, vx: (Math.random() - .5) * 2.4, vy: 2 + Math.random() * 4, g: .05, r: 7 + Math.random() * 8, rot: Math.random() * 6, vr: (Math.random() - .5) * .25, c: pick1(FXCOL), k: pick1(kinds || ['star', 'dot', 'heart', 'rib']), life: 0, max: 150 + rnd(80) });
  if (!FX.run) { FX.run = true; requestAnimationFrame(fxStep); }
}
function burstAt(el, o) { if (!el) return; const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, o); }
function fxStep() {
  const c = FX.ctx; c.clearRect(0, 0, innerWidth, innerHeight);
  FX.ps = FX.ps.filter(p => p.life < p.max && p.y < innerHeight + 40);
  FX.ps.forEach(p => {
    p.life++; p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vx *= .985;
    const fade = Math.max(0, Math.min(1, (p.max - p.life) / 22));
    c.save(); c.globalAlpha = fade; c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.c;
    if (p.k === 'star') { starPath(c, p.r, 4, .38); c.fill(); }
    else if (p.k === 'heart') { heartPath(c, p.r * .8); c.fill(); }
    else if (p.k === 'rib') { c.fillRect(-p.r, -p.r * .25, p.r * 2, p.r * .5); }
    else { c.beginPath(); c.arc(0, 0, p.r * .45, 0, 7); c.fill(); }
    c.restore();
  });
  if (FX.ps.length) requestAnimationFrame(fxStep); else { FX.run = false; c.clearRect(0, 0, innerWidth, innerHeight); }
}
function floatText(el, txt, cls) {
  if (!txt) return;
  const r = el.getBoundingClientRect();
  const f = h('div.floaty' + (cls ? '.' + cls : ''), txt);
  f.style.left = (r.left + r.width / 2) + 'px'; f.style.top = (r.top + r.height / 2) + 'px';
  document.body.append(f); setTimeout(() => f.remove(), 1300);
}

/* ============ screen size: everything is sized in rem so it fits any iPad ============ */
function fit() {
  const w = innerWidth, hg = innerHeight, land = w >= hg;
  const fs = land ? Math.min(w / 62, hg / 40) : Math.min(w / 40, hg / 64);
  document.documentElement.style.fontSize = Math.max(10, Math.min(24, fs)) + 'px';
  document.documentElement.dataset.shape = land ? 'land' : 'port';
}