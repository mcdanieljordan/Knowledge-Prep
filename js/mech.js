'use strict';
/* ============ activity mechanics: each draws into `host` and talks to `ctx` ============ */
const M = {};
const LET = ['A', 'B', 'C', 'D'];
const plainText = s => String(s).replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '');

function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }

/* ---------- multiple choice (tap) ---------- */
M.mc = (host, r, ctx) => {
  ctx.setItems(1);
  let locked = false;
  const opts = r.options.map((o, i) => h('button.opt', { dataset: { i }, onclick: () => choose(i) },
    h('span.let', LET[i]), h('span.txt', { html: esc(o) })));
  host.append(h('div.mc' + (r.options.length === 2 ? '.two' : ''),
    h('div.qcard',
      r.exact ? h('div.qtag', h('span', 'Question ' + r.exact), h('button.mini', { onclick: () => openPageModal(r.page, true) }, '📄 See page ' + r.page)) : null,
      h('div.q', { html: r.prompt }),
      r.sentence ? h('div.sent', { html: esc(r.sentence) }) : null),
    h('div.opts' + (r.options.some(o => o.length > 22) ? '.stack' : ''), opts)));
  ctx.say(plainText(r.prompt) + (r.sentence ? ' ' + r.sentence : ''));
  function choose(i) {
    if (locked || opts[i].classList.contains('dis')) return;
    const ok = i === r.answer;
    const res = ctx.attempt('q', ok, r.single);
    if (ok) {
      opts[i].classList.add('right'); locked = true; opts.forEach(o => o.classList.add('dis'));
      ctx.float(opts[i], res.label); ctx.finish();
    } else {
      opts[i].classList.add('wrong', 'dis'); shake(opts[i]); ctx.hint(res);
      if (res.reveal) {
        opts[r.answer].classList.add('right'); locked = true; opts.forEach(o => o.classList.add('dis')); ctx.finish();
      }
    }
  }
};

/* ---------- sort into buckets (drag) ---------- */
M.sort = (host, r, ctx) => {
  ctx.setItems(r.items.length);
  let left = r.items.length;
  const cols = r.buckets.length;
  const buckets = r.buckets.map(b => h('div.bucket.zone', { dataset: { id: b.id }, style: { '--bc': b.color } },
    h('div.bhead', h('span.bemo', b.emoji), h('span.bname', b.label)), b.sub ? h('div.bsub', b.sub) : null, h('div.drop')));
  const chips = r.items.map(it => h('div.chip.word' + (it.sent ? '.sentchip' : ''), { dataset: { id: it.id, bucket: it.bucket }, html: it.html }));
  host.append(h('div.sort' + (r.items.some(i => i.sent) ? '.sents' : ''), h('div.instr', { html: r.prompt }),
    h('div.buckets.c' + cols, buckets), h('div.pile', chips)));
  ctx.say(plainText(r.prompt));
  function place(chip, zone, how) {
    const it = r.items.find(x => x.id === chip.dataset.id);
    zone.querySelector('.drop').append(h('span.mini' + (how === 'reveal' ? '.rev' : ''), { html: it.html }));
    chip.remove(); zone.classList.add('pulse'); setTimeout(() => zone.classList.remove('pulse'), 500);
    left--; if (left === 0) ctx.finish();
  }
  const dk = makeDragger(host, {
    chip: '.chip', zone: '.bucket', onDrop(chip, zone) {
      const ok = chip.dataset.bucket === zone.dataset.id;
      const res = ctx.attempt(chip.dataset.id, ok);
      if (ok) { ctx.float(zone, res.label); place(chip, zone); }
      else {
        shake(chip); zone.classList.add('bad'); setTimeout(() => zone.classList.remove('bad'), 500); ctx.hint(res);
        if (res.reveal) {
          const z = $$('.bucket', host).find(b => b.dataset.id === chip.dataset.bucket);
          setTimeout(() => place(chip, z, 'reveal'), 450);
        }
      }
    }
  });
};

/* ---------- fill the blank (drag) ---------- */
M.gap = (host, r, ctx) => {
  ctx.setItems(r.answers.length);
  let left = r.answers.length;
  const line = h('div.gapline' + (r.punct ? '.punct' : ''), r.parts.map(p => typeof p === 'string' ? h('span.gt', p) : h('span.zone.gapslot', { dataset: { i: p.gap } }, '')));
  const chips = r.choices.map(c => h('div.chip.word', { dataset: { w: c }, html: esc(c) }));
  host.append(h('div.gap', h('div.instr', { html: r.prompt }), line, h('div.pile.center', chips)));
  ctx.say(plainText(r.prompt) + ' ' + r.parts.map(p => typeof p === 'string' ? p : 'blank').join(''));
  function fill(slot, word, how) {
    slot.textContent = word; slot.classList.add('full', 'ok'); if (how === 'reveal') slot.classList.add('rev');
    const c = $$('.chip', host).find(x => x.dataset.w === word); if (c) c.remove();
    left--;
    if (left === 0) {
      const full = r.parts.map(p => typeof p === 'string' ? p : r.answers[p.gap]).join('').replace(/\s+/g, ' ');
      setTimeout(() => speak(full), 250);
      ctx.finish();
    }
  }
  makeDragger(host, {
    chip: '.chip', zone: '.gapslot', onDrop(chip, slot) {
      const i = +slot.dataset.i, ok = chip.dataset.w === r.answers[i];
      const res = ctx.attempt('g' + i, ok);
      if (ok) { ctx.float(slot, res.label); fill(slot, chip.dataset.w); }
      else {
        shake(chip); shake(slot); ctx.hint(res);
        if (res.reveal) setTimeout(() => fill(slot, r.answers[i], 'reveal'), 450);
      }
    }
  });
};

/* ---------- match pairs (drag) ---------- */
M.match = (host, r, ctx) => {
  ctx.setItems(r.pairs.length);
  let left = r.pairs.length;
  const rows = r.pairs.map(p => h('div.mrow', h('div.mleft', { html: esc(p.left) }), h('div.zone.mslot', { dataset: { id: p.id } })));
  const chips = shuffle(r.pairs).map(p => h('div.chip.word', { dataset: { pair: p.id }, html: esc(p.right) }));
  host.append(h('div.match', h('div.instr', { html: r.prompt }), h('div.mwrap', h('div.mrows', rows), h('div.mpile', chips))));
  ctx.say(plainText(r.prompt));
  function fill(slot, chip, how) {
    slot.textContent = chip.textContent; slot.classList.add('full', 'ok'); if (how === 'reveal') slot.classList.add('rev');
    chip.remove(); left--; if (left === 0) ctx.finish();
  }
  makeDragger(host, {
    chip: '.chip', zone: '.mslot', onDrop(chip, slot) {
      const ok = chip.dataset.pair === slot.dataset.id;
      const res = ctx.attempt(chip.dataset.pair, ok);
      if (ok) { ctx.float(slot, res.label); fill(slot, chip); }
      else {
        shake(chip); shake(slot); ctx.hint(res);
        if (res.reveal) { const s = $$('.mslot', host).find(x => x.dataset.id === chip.dataset.pair); setTimeout(() => fill(s, chip, 'reveal'), 450); }
      }
    }
  });
};

/* ---------- label the words in a sentence (drag labels onto words) ---------- */
M.label = (host, r, ctx) => {
  const need = [];
  r.toks.forEach((t, i) => { if (r.labels.some(l => tagIn(t, l.tags))) need.push(i); });
  ctx.setItems(need.length);
  let left = need.length;
  const toks = r.toks.map((t, i) => h('span.ltok.zone', { dataset: { i } }, h('span.lw', t.t), h('span.ltag')));
  const chips = r.labels.map(l => h('div.chip.lab', { dataset: { id: l.id }, style: { '--bc': l.color } }, l.label));
  host.append(h('div.label', h('div.instr', { html: r.prompt }), h('div.ltoks', toks), h('div.pile.center', chips)));
  ctx.say(plainText(r.prompt));
  function mark(i, lab, how) {
    const z = toks[i]; z.classList.add('full', 'ok'); z.style.setProperty('--bc', lab.color);
    z.querySelector('.ltag').textContent = lab.label; if (how === 'reveal') z.classList.add('rev');
    left--; if (left === 0) { setTimeout(() => speak(sentText(r.toks)), 300); ctx.finish(); }
  }
  makeDragger(host, {
    chip: '.chip', zone: '.ltok', onDrop(chip, z) {
      const i = +z.dataset.i, lab = r.labels.find(l => l.id === chip.dataset.id), tok = r.toks[i];
      if (!need.includes(i)) {
        ctx.attempt('x' + i, false); shake(z); ctx.say(`<b>${esc(wordOnly(tok.t))}</b> is not one of these. Look for the ${r.labels.map(l => l.label).join(' and the ')}!`);
        return;
      }
      const ok = tagIn(tok, lab.tags);
      const res = ctx.attempt('t' + i, ok);
      if (ok) { ctx.float(z, res.label); mark(i, lab); }
      else {
        shake(z); ctx.hint(res);
        if (res.reveal) { const right = r.labels.find(l => tagIn(tok, l.tags)); setTimeout(() => mark(i, right, 'reveal'), 450); }
      }
    }
  });
};

/* ---------- build the plural (drag an ending onto the word) ---------- */
M.ending = (host, r, ctx) => {
  ctx.setItems(r.words.length);
  let idx = 0, busy = false;
  const card = h('div.zone.wcard');
  const note = h('div.enote');
  const count = h('div.ecount');
  const chips = r.ops.map(o => h('div.chip.word.op', { dataset: { op: o.id } }, o.label));
  host.append(h('div.ending', h('div.instr', { html: r.prompt }), count, card, note, h('div.pile.center', chips)));
  ctx.say(plainText(r.prompt));
  function show() {
    const w = r.words[idx];
    card.className = 'zone wcard'; card.innerHTML = `<span class="base">${esc(w.base)}</span><span class="qmark">?</span>`;
    note.textContent = ''; count.textContent = `Word ${idx + 1} of ${r.words.length}`;
    ctx.say(`Make <b>${esc(w.base)}</b> plural!`);
    busy = false;
  }
  function advance(w) {
    const common = (() => { let i = 0; while (i < w.base.length && i < w.result.length && w.base[i] === w.result[i]) i++; return i; })();
    card.className = 'zone wcard full';
    card.innerHTML = `<span class="base">${esc(w.result.slice(0, common))}</span><span class="newbit">${esc(w.result.slice(common))}</span>`;
    note.textContent = w.note; speak(w.result);
    idx++; busy = true;
    setTimeout(() => { if (idx >= r.words.length) ctx.finish(); else show(); }, 2100);
  }
  show();
  makeDragger(host, {
    chip: '.chip', zone: '.wcard', locked: () => busy, onDrop(chip, z) {
      if (busy) return;
      const w = r.words[idx], ok = chip.dataset.op === w.op;
      const res = ctx.attempt('w' + idx, ok);
      if (ok) { ctx.float(z, res.label); advance(w); }
      else { shake(z); ctx.hint(res); if (res.reveal) setTimeout(() => advance(w), 450); }
    }
  });
};

/* ---------- tap the word(s) in the sentence ---------- */
M.hunt = (host, r, ctx) => {
  const keys = []; // {step, i}
  r.steps.forEach((st, si) => r.toks.forEach((t, i) => { if (tagIn(t, st.tags)) keys.push({ si, i }); }));
  ctx.setItems(keys.length);
  let si = 0, found = 0;
  const ask = h('div.instr.big');
  const toks = r.toks.map((t, i) => h('button.ht', { dataset: { i }, onclick: () => tap(i) }, t.t));
  host.append(h('div.hunt', ask, h('div.htoks', toks)));
  function setAsk() { ask.innerHTML = esc(r.steps[si].ask); ctx.say(r.steps[si].ask); }
  setAsk();
  const stepKeys = () => keys.filter(k => k.si === si);
  function mark(i, how) { toks[i].classList.add('found'); if (how === 'reveal') toks[i].classList.add('rev'); toks[i].disabled = true; }
  function tap(i) {
    const btn = toks[i]; if (btn.disabled) return;
    const tok = r.toks[i], st = r.steps[si];
    const isT = tagIn(tok, st.tags);
    const sk = stepKeys();
    if (isT) {
      const res = ctx.attempt('t' + si + '_' + i, true);
      ctx.float(btn, res.label); mark(i); found++;
      if (sk.every(k => toks[k.i].disabled)) {
        if (si === r.steps.length - 1) {
          const words = r.steps.map(s => r.toks.filter(t => tagIn(t, s.tags)).map(t => wordOnly(t.t)).join(' '));
          ctx.finish(words);
        } else { si++; setTimeout(setAsk, 700); }
      }
    } else {
      const unfound = sk.find(k => !toks[k.i].disabled);
      const res = ctx.attempt('t' + si + '_' + unfound.i, false);
      shake(btn); btn.classList.add('wrongtap'); setTimeout(() => btn.classList.remove('wrongtap'), 600);
      ctx.hint(res);
      if (res.reveal) {
        mark(unfound.i, 'reveal');
        if (sk.every(k => toks[k.i].disabled)) {
          if (si === r.steps.length - 1) ctx.finish(); else { si++; setTimeout(setAsk, 700); }
        }
      }
    }
  }
};

/* ---------- bubble pop (tap) ---------- */
M.pop = (host, r, ctx) => {
  const targets = r.items.filter(i => i.ok).length;
  ctx.setItems(targets);
  let found = 0, wrong = new Set(), wrongCount = 0;
  const bubs = r.items.map((it, i) => {
    const b = h('button.bub' + (it.t.length > 9 ? '.long' : ''), { dataset: { i }, style: { animationDelay: (-Math.random() * 4).toFixed(2) + 's', animationDuration: (3.4 + Math.random() * 2).toFixed(2) + 's', '--hue': (i * 47) % 360 }, onclick: () => tap(i) }, h('span', it.t));
    return b;
  });
  host.append(h('div.popgame', h('div.instr.big', { html: esc(r.prompt) }), h('div.pond', bubs), h('div.popcount', `Popped: 0 of ${targets}`)));
  const cnt = $('.popcount', host);
  ctx.say(r.prompt);
  function tap(i) {
    const b = bubs[i], it = r.items[i];
    if (b.classList.contains('gone')) return;
    if (it.ok) {
      const res = ctx.attempt('p' + i, true);
      ctx.float(b, res.label); b.classList.add('gone'); b.disabled = true; found++;
      cnt.textContent = `Popped: ${found} of ${targets}`;
      if (found === targets) ctx.finish();
    } else {
      wrongCount++;
      if (!wrong.has(i)) { wrong.add(i); ctx.attempt('x' + i, false); }
      b.classList.remove('wob'); void b.offsetWidth; b.classList.add('wob');
      ctx.hint();
      if (wrongCount >= 3) bubs.forEach((bb, j) => { if (r.items[j].ok && !bb.classList.contains('gone')) bb.classList.add('glow'); });
    }
  }
};

/* ---------- memory match (tap cards) ---------- */
M.memory = (host, r, ctx) => {
  ctx.setItems(r.pairs.length);
  const cards = shuffle(r.pairs.flatMap((p, i) => [{ pid: i, t: p[0] }, { pid: i, t: p[1] }]));
  let open = [], matched = 0, busy = false;
  const seen = new Set();
  const els = cards.map((c, i) => h('button.mcard', { dataset: { i }, onclick: () => flip(i) },
    h('span.mfront', '❓'), h('span.mback', { html: esc(c.t) })));
  host.append(h('div.memory', h('div.instr.big', { html: esc(r.prompt) }), h('div.mgrid.n' + cards.length, els)));
  ctx.say(r.prompt);
  function flip(i) {
    const el = els[i];
    if (busy || el.classList.contains('open') || el.classList.contains('done')) return;
    el.classList.add('open'); sfx('flip'); open.push(i);
    if (open.length < 2) return;
    busy = true;
    const [a, b] = open; open = [];
    if (cards[a].pid === cards[b].pid) {
      const res = ctx.attempt('p' + cards[a].pid, true);
      setTimeout(() => {
        els[a].classList.add('done'); els[b].classList.add('done'); ctx.float(els[b], res.label);
        matched++; busy = false; if (matched === r.pairs.length) ctx.finish();
      }, 450);
    } else {
      const known = seen.has(a) || seen.has(b);
      seen.add(a); seen.add(b);
      if (known) ctx.attempt('x' + a + '_' + b + '_' + Math.random(), false); else sfx('tap');
      setTimeout(() => { els[a].classList.remove('open'); els[b].classList.remove('open'); busy = false; }, 1000);
    }
  }
};
