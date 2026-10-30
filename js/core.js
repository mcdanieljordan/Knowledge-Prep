'use strict';
/* ============ core: helpers, storage, sound, voice, confetti ============ */
const KEY = 'ensley_grammar_quest_v1';
const NAME = 'Ensley';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

function h(spec, attrs, ...kids) {
  if (attrs != null && (typeof attrs === 'string' || typeof attrs === 'number' || attrs.nodeType || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; }
  const tag = (spec.match(/^[a-z0-9]+/i) || ['div'])[0];
  const el = document.createElement(tag);
  (spec.match(/[.#][\w-]+/g) || []).forEach(p => { if (p[0] === '.') el.classList.add(p.slice(1)); else el.id = p.slice(1); });
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'style' && typeof v === 'object') { for (const sk in v) { if (sk.startsWith('--')) el.style.setProperty(sk, v[sk]); else el.style[sk] = v[sk]; } }
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className += ' ' + v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  kids.flat(Infinity).forEach(c => { if (c == null || c === false) return; el.append(c.nodeType ? c : document.createTextNode(String(c))); });
  return el;
}

const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1);[a[i], a[j]] = [a[j], a[i]]; } return a; };
const pickN = (a, n) => shuffle(a).slice(0, n);
const pick1 = a => a[rnd(a.length)];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
/* a bag that never repeats until every entry has been used */
function bag(arr) {
  let q = [], last = null;
  return () => {
    if (!q.length) { q = shuffle(arr); if (q[0] === last && q.length > 1) q.push(q.shift()); }
    last = q.shift(); return last;
  };
}
/* a deck: draw n items, cycling through everything before repeating */
const DECKS = {};
function deck(name, list) {
  const d = DECKS[name] || (DECKS[name] = { q: [] });
  return {
    draw(n = 1, ok) {
      const out = [];
      let guard = 0;
      while (out.length < n && guard++ < 200) {
        if (!d.q.length) d.q = shuffle(list);
        const idx = ok ? d.q.findIndex(ok) : 0;
        if (idx < 0) { d.q = shuffle(list); if (!d.q.some(ok)) break; continue; }
        out.push(d.q.splice(idx, 1)[0]);
      }
      return out;
    }
  };
}

/* ============ state ============ */
function defaultState() {
  return {
    v: 1, name: NAME, xp: 0, badges: {}, acts: {}, skills: {}, pages: {},
    settings: { voice: true, sound: true, vol: 'high' },
    stats: { answered: 0, first: 0, second: 0, bestStreak: 0, rounds: 0, perfect: 0 },
    mock: { best: 0, runs: 0, last: null },
    log: [], created: Date.now()
  };
}
let S = defaultState();
let memoryOnly = false;
function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const o = JSON.parse(raw); S = Object.assign(defaultState(), o, { settings: Object.assign(defaultState().settings, o.settings || {}), stats: Object.assign(defaultState().stats, o.stats || {}), mock: Object.assign(defaultState().mock, o.mock || {}) }); }
  } catch (e) { memoryOnly = true; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { memoryOnly = true; }
}
function exportCode() { try { return btoa(unescape(encodeURIComponent(JSON.stringify(S)))); } catch (e) { return ''; } }
function importCode(code) {
  try {
    const o = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    if (!o || o.v !== 1) return false;
    S = Object.assign(defaultState(), o); save(); return true;
  } catch (e) { return false; }
}

/* ============ sound ============ */
let AC = null;
function ac() {
  if (!S.settings.sound) return null;
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
  } catch (e) { AC = null; }
  return AC;
}
const VOLS = { high: 1, med: 0.55, low: 0.25 };
const volLevel = () => VOLS[S.settings.vol] || 1;
function note(f, t, d, type = 'sine', v = 0.15) {
  const a = ac(); if (!a) return;
  v *= volLevel();
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.value = f;
  const s = a.currentTime + t;
  g.gain.setValueAtTime(0.0001, s);
  g.gain.linearRampToValueAtTime(v, s + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, s + d);
  o.connect(g); g.connect(a.destination);
  o.start(s); o.stop(s + d + 0.05);
}
const SFX = {
  tap() { note(520, 0, .08, 'triangle', .09); },
  good() { note(660, 0, .12); note(880, .1, .2); },
  great() { note(523, 0, .1); note(659, .09, .1); note(784, .18, .1); note(1047, .27, .28); },
  bad() { note(260, 0, .16, 'sine', .1); note(200, .12, .22, 'sine', .09); },
  pop() { note(900, 0, .05, 'square', .05); note(1500, .03, .09, 'triangle', .1); },
  flip() { note(420, 0, .07, 'triangle', .08); },
  level() { [523, 659, 784, 1047, 1319].forEach((f, i) => note(f, i * .11, .28, 'triangle', .15)); },
  badge() { [784, 988, 1175, 1568].forEach((f, i) => note(f, i * .1, .32, 'sine', .14)); },
  star() { note(1175, 0, .15, 'sine', .12); note(1568, .1, .25, 'sine', .12); },
  drop() { note(330, 0, .06, 'triangle', .1); }
};
function sfx(n) { try { SFX[n] && SFX[n](); } catch (e) { } }

/* ============ voice ============ */
let VOICE = null;
function pickVoice() {
  if (VOICE) return VOICE;
  try {
    const vs = speechSynthesis.getVoices() || [];
    const en = vs.filter(v => /^en[-_](US|GB|AU|CA)/i.test(v.lang));
    for (const p of ['Samantha', 'Ava', 'Allison', 'Karen', 'Serena', 'Nicky', 'Zoe', 'Tessa', 'Moira']) {
      const v = en.find(x => x.name.indexOf(p) >= 0); if (v) return VOICE = v;
    }
    return VOICE = en[0] || null;
  } catch (e) { return null; }
}
function speakClean(t) {
  return String(t).replace(/\u2011/g, '-').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, 'and').replace(/___+/g, ' blank ')
    .replace(/→/g, ' becomes ').replace(/=/g, ' equals ').replace(/\+/g, ' plus ').replace(/-es\b/g, ' e s').replace(/-s\b/g, ' s')
    .replace(/\p{Extended_Pictographic}|️|‍/gu, '').replace(/\s+/g, ' ').trim();
}
let speakTimer = 0;
function speak(t) {
  if (!S.settings.voice) return;
  try {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    clearTimeout(speakTimer);
    speakTimer = setTimeout(() => {
      try {
        const u = new SpeechSynthesisUtterance(speakClean(t));
        u.rate = 0.9; u.pitch = 1.08; u.lang = 'en-US'; u.volume = volLevel();
        const v = pickVoice(); if (v) u.voice = v;
        speechSynthesis.speak(u);
      } catch (e) { }
    }, 40);
  } catch (e) { }
}
function stopSpeak() { try { clearTimeout(speakTimer); speechSynthesis.cancel(); } catch (e) { } }

/* ============ confetti ============ */
function confetti(n = 150) {
  const c = $('#confetti'); if (!c) return;
  const ctx = c.getContext('2d');
  c.width = innerWidth; c.height = innerHeight; c.style.display = 'block';
  const cols = ['#ff6b5a', '#ffc533', '#3ecf6a', '#35b6ff', '#7c5cff', '#ff7ad9', '#ffffff'];
  const ps = Array.from({ length: n }, () => ({
    x: innerWidth / 2 + (Math.random() - .5) * 260, y: innerHeight * .45,
    vx: (Math.random() - .5) * 18, vy: -Math.random() * 15 - 5, s: 8 + Math.random() * 10,
    r: Math.random() * 6, vr: (Math.random() - .5) * .45, c: pick1(cols)
  }));
  let f = 0;
  (function step() {
    ctx.clearRect(0, 0, c.width, c.height);
    ps.forEach(p => {
      p.vy += .38; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .6); ctx.restore();
    });
    if (++f < 140) requestAnimationFrame(step); else { ctx.clearRect(0, 0, c.width, c.height); c.style.display = 'none'; }
  })();
}
