/* games.js: every kind of question + the session runner */
(function () {
  'use strict';
  var SS = window.SS, h = SS.h, K = (SS.kinds = {});

  SS.mount = function (node) {
    var s = document.getElementById('screen');
    SS.clear(s); s.appendChild(node); s.scrollTop = 0;
    node.classList.add('enter');
  };
  function btn(text, cls, fn) { return h('button', { class: cls || 'opt', onclick: fn }, text); }
  function sayPart(part, st) {
    return part === 'sub'
      ? '“' + st.sub + '” is the complete subject. It tells WHO or WHAT.'
      : '“' + st.pred + '” is the complete predicate. It tells what the subject DOES or IS.';
  }

  // =========================================================================
  // 1. guided2: tap the action word, then pick the half (most support)
  K.guided2 = function (c) {
    var st = c.q.st, part = c.q.part, W = st.words, s = st.s, verb = SS.norm(W[s]), step = 1;
    c.speak = st.text;
    var sent = SS.sentenceEl(st, true), area = h('div', { class: 'opts' });
    var col = h('div', { class: 'col' }, sent, area);
    c.host.appendChild(col);
    c.instr('Step 1: Tap the **ACTION WORD**. What does someone do?');
    c.say('Every sentence has an action word. Let’s find it!', 'idle');
    function region(on) {
      sent.chips.forEach(function (ch, i) { ch.classList.toggle('glow', on && (part === 'sub' ? i < s : i >= s)); });
    }
    c.hint(function (l) {
      if (step === 1) {
        if (l === 1) return 'Which word tells what someone DOES?';
        sent.chips[s].classList.add('glow');
        return l === 2 ? 'Look at the glowing word!' : 'The action word is “' + verb + '”. Tap it!';
      }
      if (l === 1) return part === 'sub' ? 'The subject is everything BEFORE “' + verb + '”.' : 'The predicate starts AT “' + verb + '” and goes to the end.';
      region(true); return 'The glowing words are the answer!';
    });
    sent.chips.forEach(function (ch, i) {
      ch.addEventListener('click', function () {
        if (c.done || step !== 1) return;
        if (i === s) {
          step = 2; SS.snd.pop();
          sent.chips.forEach(function (x) { x.classList.remove('glow'); });
          ch.classList.add('verb'); ch.appendChild(h('small', { class: 'vtag' }, 'ACTION'));
          c.say('Yes! “' + verb + '” is the action word.', 'happy');
          step2();
        } else c.wrong('“' + SS.norm(W[i]) + '” is not the action word. Which word tells what someone DOES?', 'verb-miss');
      });
    });
    function step2() {
      c.instr(part === 'sub'
        ? 'Step 2: The **subject** is everything BEFORE “' + verb + '”. Tap it!'
        : 'Step 2: The **predicate** starts AT “' + verb + '” and goes to the end. Tap it!');
      var right = part === 'sub' ? st.sub : st.pred, wrong;
      if (part === 'sub') wrong = s >= 2 ? W[s - 1] : st.pred;
      else wrong = (W.length - s >= 2) ? verb : st.sub;
      if (SS.norm(wrong) === SS.norm(right)) wrong = part === 'sub' ? st.pred : st.sub;
      SS.shuffle([right, wrong]).forEach(function (t) {
        var b = btn(t, 'opt big', function () {
          if (c.done) return;
          if (SS.norm(t) === SS.norm(right)) {
            region(false); SS.paint(sent, st, 'both'); col.appendChild(SS.tagRow('both'));
            b.classList.add('good'); c.right(sayPart(part, st));
          } else {
            var d = SS.diagnose(t, st, part);
            b.classList.add('nope'); b.disabled = true; region(true);
            c.wrong(d.msg, d.slip);
          }
        });
        area.appendChild(b);
      });
    }
  };

  // =========================================================================
  // 2. bubbles: pop the bubble with the right half
  K.bubbles = function (c) {
    var st = c.q.st, part = c.q.part, s = st.s, W = st.words;
    c.speak = st.text;
    var sent = SS.sentenceEl(st, false), field = h('div', { class: 'bubbles' });
    var col = h('div', { class: 'col' }, sent, field);
    c.host.appendChild(col);
    c.instr(part === 'sub' ? 'Pop the bubble with the **complete subject** (WHO or WHAT).' : 'Pop the bubble with the **complete predicate** (DOES or IS).');
    c.say('Read the whole sentence first. Then pop!', 'idle');
    var right = part === 'sub' ? st.sub : st.pred;
    var opts = part === 'sub' ? SS.subOptions(st) : SS.predOptions(st);
    var btns = opts.map(function (t, i) {
      var b = h('button', { class: 'bub', style: 'animation-delay:' + (i * 0.4) + 's' }, t);
      b.addEventListener('click', function () {
        if (c.done || b.disabled) return;
        if (SS.norm(t) === SS.norm(right)) {
          b.classList.add('popped'); SS.snd.pop(); SS.paint(sent, st, 'both'); col.appendChild(SS.tagRow('both'));
          btns.forEach(function (x) { if (x !== b) x.classList.add('gone'); });
          c.right(sayPart(part, st));
        } else {
          var d = SS.diagnose(t, st, part);
          b.classList.add('nope'); b.disabled = true; c.wrong(d.msg, d.slip);
        }
      });
      field.appendChild(b); return b;
    });
    c.hint(function (l) {
      if (l === 1) return part === 'sub' ? 'Find the action word. The subject comes BEFORE it.' : 'Find the action word. The predicate starts there.';
      if (l === 2) { sent.chips[s].classList.add('glow'); return 'The action word is glowing!'; }
      var n = 0;
      btns.forEach(function (b, i) { if (n < 2 && SS.norm(opts[i]) !== SS.norm(right) && !b.disabled) { b.classList.add('gone'); b.disabled = true; n++; } });
      return 'I popped two wrong bubbles for you!';
    });
  };

  // =========================================================================
  // 3. tapWords: tap every word of the half (independent)
  K.tapWords = function (c) {
    var st = c.q.st, part = c.q.part, s = st.s, W = st.words, sel = {};
    c.speak = st.text;
    var sent = SS.sentenceEl(st, true);
    var go = h('button', { class: 'btn leaf big', disabled: true }, 'Check ✔');
    var col = h('div', { class: 'col' }, c.q.num ? h('div', { class: 'hwnum' }, 'Homework #' + c.q.num) : null, sent, h('div', { class: 'row center' }, go));
    c.host.appendChild(col);
    c.instr(part === 'sub' ? 'Tap ALL the words in the **complete subject** (WHO or WHAT). Then press Check.'
      : 'Tap ALL the words in the **complete predicate** (DOES or IS). Then press Check.');
    c.say(c.support ? 'Take your time. Use the hint if you need it.' : 'You can do this on your own!', 'idle');
    function ids() { return Object.keys(sel).map(Number).sort(function (a, b) { return a - b; }); }
    sent.chips.forEach(function (ch, i) {
      ch.addEventListener('click', function () {
        if (c.done) return;
        if (sel[i]) { delete sel[i]; ch.classList.remove('on-' + part); } else { sel[i] = 1; ch.classList.add('on-' + part); }
        SS.snd.pop(); go.disabled = ids().length === 0;
      });
    });
    go.addEventListener('click', function () {
      if (c.done) return;
      var idx = ids(), want = [], k;
      for (k = (part === 'sub' ? 0 : s); k < (part === 'sub' ? s : W.length); k++) want.push(k);
      var ok = idx.length === want.length && idx.every(function (v, j) { return v === want[j]; });
      if (ok) {
        sent.chips.forEach(function (x) { x.classList.remove('on-sub', 'on-pred'); });
        SS.paint(sent, st, 'both'); col.insertBefore(SS.tagRow('both'), go.parentNode);
        go.disabled = true; c.right(sayPart(part, st));
      } else {
        var d = SS.diagnose(idx.map(function (i) { return W[i]; }).join(' '), st, part);
        c.wrong(d.msg, d.slip);
      }
    });
    c.hint(function (l) {
      if (l === 1) return 'Find the action word first. What does someone DO?';
      if (l === 2) { sent.chips[s].classList.add('glow'); return 'The action word is “' + SS.norm(W[s]) + '”.'; }
      sent.chips.forEach(function (ch, i) { ch.classList.toggle('glow', part === 'sub' ? i < s : i >= s); });
      return part === 'sub' ? 'The subject is ALL the glowing words before the action word.' : 'The predicate is the action word and ALL the words after it.';
    });
  };

  // =========================================================================
  // 4. snip: tap the gap to cut the sentence into two halves
  K.snip = function (c) {
    var st = c.q.st, W = st.words, s = st.s, verb = SS.norm(W[s]), cut = false;
    c.speak = st.text;
    var line = h('div', { class: 'snipline' }), gaps = [], wEls = [];
    var col = h('div', { class: 'col' }, line);
    c.host.appendChild(col);
    W.forEach(function (w, i) {
      var wEl = h('span', { class: 'w' }, w); wEls.push(wEl);
      var unit = h('span', { class: 'unit' }, wEl);
      if (i < W.length - 1) {
        var g = h('button', { class: 'gap', 'aria-label': 'Snip after ' + SS.norm(w) }, h('i'));
        gaps.push(g); unit.appendChild(g);
        g.addEventListener('click', function () { doSnip(i + 1, g); });
      }
      line.appendChild(unit);
    });
    if (c.support >= 2) {
      wEls[s].classList.add('glow');
      c.instr('Snip RIGHT BEFORE the glowing **action word**. Tap the gap!');
      c.say('The action word is glowing. The cut goes right before it!', 'idle');
    } else {
      c.instr('Snip the sentence into **two halves**. Tap the gap where the cut goes!');
      c.say('Find the action word. Then snip!', 'idle');
    }
    c.hint(function (l) {
      if (cut) {
        if (l === 1) return 'The subject tells WHO or WHAT the sentence is about.';
        if (l === 2) return 'The subject is the half that comes BEFORE the action word.';
        return 'It’s the first half!';
      }
      if (l === 1) return 'Find the action word. What does someone DO?';
      if (l === 2) { wEls[s].classList.add('glow'); return 'The action word is glowing. Snip just before it.'; }
      gaps[s - 1].classList.add('pulse'); return 'Tap the bouncing scissors spot!';
    });
    function doSnip(g, el) {
      if (cut || c.done) return;
      SS.snd.snip(); c.pose('snip');
      if (g === s) { cut = true; el.classList.add('cutting'); setTimeout(showHalves, SS.reduced ? 0 : 330); }
      else if (g < s) {
        el.classList.add('miss'); setTimeout(function () { el.classList.remove('miss'); }, 500);
        c.wrong('Too early! “' + SS.norm(W[g]) + '” still tells about the subject. Keep going!', 'snip-early');
      } else {
        el.classList.add('miss'); setTimeout(function () { el.classList.remove('miss'); }, 500);
        c.wrong('Too late! “' + verb + '” is the action word. It belongs in the second half.', 'snip-late');
      }
    }
    function showHalves() {
      var L = h('div', { class: 'half hsub' }), R = h('div', { class: 'half hpred' });
      var lw = h('div', { class: 'sent' }), rw = h('div', { class: 'sent' });
      W.forEach(function (w, i) { (i < s ? lw : rw).appendChild(h('span', { class: 'w ' + (i < s ? 'is-sub' : 'is-pred') }, w)); });
      L.appendChild(lw); R.appendChild(rw);
      var halves = h('div', { class: 'halves' }, L, R);
      line.replaceWith(halves);
      function caps() {
        L.appendChild(h('div', { class: 'cap' }, 'SUBJECT · WHO or WHAT'));
        R.appendChild(h('div', { class: 'cap' }, 'PREDICATE · DOES or IS'));
      }
      if (c.q.label) {
        c.instr('Which half is the **SUBJECT** (WHO or WHAT)? Tap it!');
        c.say('Nice snip! Now tell me which half is the subject.', 'happy');
        L.classList.add('tappable'); R.classList.add('tappable');
        L.addEventListener('click', function () { if (c.done) return; caps(); c.right('The subject is “' + st.sub + '”. The predicate is “' + st.pred + '”.'); });
        R.addEventListener('click', function () { if (c.done) return; c.wrong('The subject tells WHO or WHAT. Which half is that?', 'snip-label'); });
      } else {
        caps(); c.instr('Two halves!');
        c.right('First half: the subject (WHO or WHAT). Second half: the predicate (DOES or IS).');
      }
    }
  };

  // =========================================================================
  // 5. checklist: three yes/no questions (guided fragment detective)
  var FB = [
    { yes: 'Hmm… WHO or WHAT is it about? It doesn’t say!', no: 'There IS a WHO or WHAT in there. Look again!' },
    { yes: 'Hmm… what does it DO, or what IS it? It doesn’t say!', no: 'There IS a DOES or IS in there. Look again!' },
    { yes: 'It leaves us hanging. What happens next? It’s not finished!', no: 'It IS finished. You could say it all by itself!' }
  ];
  var CKQ = ['Is there a **WHO or WHAT**? (a subject)', 'Is there a **DOES or IS**? (a predicate)', 'Does it **finish a thought**? Could it stand alone?'];
  K.checklist = function (c) {
    var f = c.q.f, ans = SS.checks[f.ok ? '' : f.why], i = 0, curBtns = null;
    c.speak = f.t;
    var card = h('div', { class: 'fragcard' }, f.t), rows = h('div', { class: 'checks' });
    c.host.appendChild(h('div', { class: 'col' }, card, rows));
    c.instr('Be a **detective**! Answer the 3 questions about this.');
    c.say('Read it out loud. Then answer each question.', 'idle');
    c.hint(function (l) {
      if (l === 1) return 'Read it out loud. Does it sound finished?';
      if (l === 2) { SS.speak(f.t); return 'Listen carefully to it!'; }
      if (curBtns) (ans[i] ? curBtns.yes : curBtns.no).classList.add('glow');
      return 'The answer to this one is ' + (ans[i] ? 'YES' : 'NO') + '.';
    });
    function ask() {
      var q = h('div', { class: 'q' }); SS.rich(q, (i + 1) + '. ' + CKQ[i]);
      var yes = btn('Yes ✔', 'opt yes'), no = btn('No ✘', 'opt no');
      var row = h('div', { class: 'ck enter' }, q, h('div', { class: 'yn' }, yes, no));
      rows.appendChild(row); curBtns = { yes: yes, no: no };
      var k = i;
      function pick(said) {
        if (c.done) return;
        if (said === !!ans[k]) {
          SS.snd.pop();
          row.querySelector('.yn').replaceWith(h('div', { class: 'res ' + (said ? 'y' : 'n') }, said ? '✔ Yes' : '✘ No'));
          i++;
          if (i < 3) ask(); else verdict();
        } else c.wrong(FB[k][said ? 'yes' : 'no'], 'ck' + (k + 1));
      }
      yes.addEventListener('click', function () { pick(true); });
      no.addEventListener('click', function () { pick(false); });
    }
    function verdict() {
      var whole = ans.every(function (x) { return x === 1; });
      card.classList.add(whole ? 'whole' : 'piece');
      c.host.firstChild.appendChild(h('div', { class: 'stamp ' + (whole ? 'whole' : 'piece') }, whole ? 'WHOLE SENTENCE!' : 'JUST A PIECE!'));
      c.right(whole ? 'All three are YES, so it is a whole sentence!' : 'One answer is NO, so it is just a piece. ' + SS.whyText[f.why]);
    }
    ask();
  };

  // =========================================================================
  // 6. cfReason: whole sentence or just a piece? (then: what is missing?)
  var WHYBTN = { nosubj: 'No WHO or WHAT', nopred: 'No DOES or IS', both: 'Both are missing', thought: 'The thought isn’t finished' };
  K.cfReason = function (c) {
    var f = c.q.f, askWhy = c.q.askWhy !== false, stage = 1, area = h('div', { class: 'opts' });
    c.speak = f.t;
    var card = h('div', { class: 'fragcard' }, f.t);
    c.host.appendChild(h('div', { class: 'col' }, c.q.num ? h('div', { class: 'hwnum' }, 'Homework #' + c.q.num) : null, card, area));
    c.instr('Is it a **whole sentence** or **just a piece** (a fragment)?');
    c.say('Ask yourself: WHO or WHAT? DOES or IS? Finished thought?', 'idle');
    var whole = btn('Whole sentence ✔', 'opt big yes'), piece = btn('Just a piece ✂', 'opt big no');
    area.appendChild(whole); area.appendChild(piece);
    c.hint(function (l) {
      if (stage === 2) {
        if (l === 1) return 'Ask: is there a WHO or WHAT? Is there a DOES or IS?';
        if (l === 2) return 'Does it start a thought but not finish it? Or does it only tell where?';
        Object.keys(WHYBTN).forEach(function (k) { if (k === f.why && area.querySelector('[data-k="' + k + '"]')) area.querySelector('[data-k="' + k + '"]').classList.add('glow'); });
        return 'Look at the glowing choice!';
      }
      if (l === 1) return 'Is there a WHO or WHAT? Is there a DOES or IS? Is the thought finished?';
      if (l === 2) {
        var a = SS.checks[f.ok ? '' : f.why];
        card.parentNode.appendChild(h('div', { class: 'minick' },
          h('span', { class: a[0] ? 'y' : 'n' }, (a[0] ? '✔' : '✘') + ' WHO/WHAT'),
          h('span', { class: a[1] ? 'y' : 'n' }, (a[1] ? '✔' : '✘') + ' DOES/IS'),
          h('span', { class: a[2] ? 'y' : 'n' }, (a[2] ? '✔' : '✘') + ' FINISHED')));
        return 'Here are the three answers. Do you see a ✘?';
      }
      (f.ok ? whole : piece).classList.add('glow');
      return f.ok ? 'It passes all three. It is a whole sentence!' : 'One of the three is a ✘. It is just a piece.';
    });
    whole.addEventListener('click', function () {
      if (c.done || stage !== 1) return;
      if (f.ok) c.right('It has a WHO or WHAT, a DOES or IS, and it finishes the thought!');
      else c.wrong('It’s missing something. Ask: WHO or WHAT? DOES or IS? Finished thought?', 'cf-says-whole:' + f.why);
    });
    piece.addEventListener('click', function () {
      if (c.done || stage !== 1) return;
      if (f.ok) c.wrong('It IS a whole sentence! It has a WHO or WHAT and a DOES or IS, and it finishes the thought.', 'cf-says-piece');
      else if (!askWhy) c.right('It’s just a piece. ' + SS.whyText[f.why]);
      else {
        stage = 2; SS.snd.pop(); SS.clear(area);
        c.instr('Right, it’s a piece! What is **missing**?');
        c.say('Look at the three questions. Which one is the problem?', 'happy');
        SS.shuffle(Object.keys(WHYBTN)).forEach(function (k) {
          var b = btn(WHYBTN[k], 'opt big', function () {
            if (c.done) return;
            if (k === f.why) { b.classList.add('good'); c.right(SS.whyText[f.why]); }
            else { b.classList.add('nope'); b.disabled = true; c.wrong('Not quite. Check: WHO or WHAT? DOES or IS? Finished thought?', 'cfwhy:' + f.why); }
          });
          b.setAttribute('data-k', k); area.appendChild(b);
        });
      }
    });
  };

  // =========================================================================
  // 7. sortBuckets: sort cards into Whole Sentence / Just a Piece
  K.sortBuckets = function (c) {
    var items = c.q.items, total = items.length, placed = 0, bad = {};
    var tray = h('div', { class: 'tray' });
    function bucket(k, title, ico, cls) {
      return h('div', { class: 'bucket drop ' + cls, 'data-k': k }, h('div', { class: 'bt' }, ico + ' ' + title), h('div', { class: 'placed' }));
    }
    var bOk = bucket('ok', 'Whole Sentence', '✔', 'bok'), bNo = bucket('no', 'Just a Piece', '✂', 'bno');
    c.host.appendChild(h('div', { class: 'col' }, h('div', { class: 'buckets' }, bOk, bNo), tray));
    c.instr('Drag each card to the right bucket. (Or tap a card, then tap a bucket.)');
    c.say('Ask: WHO or WHAT? DOES or IS? Finished thought?', 'idle');
    var cards = items.map(function (f, i) {
      var k = h('div', { class: 'cardfrag', tabindex: '0', role: 'button' }, f.t);
      k._f = f; k._i = i; tray.appendChild(k); return k;
    });
    function nextCard() { return cards.filter(function (k) { return !k.getAttribute('data-locked'); })[0]; }
    SS.dragDrop(cards, [bOk, bNo], function (card, b) {
      var f = card._f, want = f.ok ? 'ok' : 'no';
      if (b.getAttribute('data-k') === want) {
        card.setAttribute('data-locked', '1'); card.classList.remove('sel'); card.classList.add('inbucket');
        b.querySelector('.placed').appendChild(card); card.style.transform = ''; placed++; SS.snd.pop();
        c.say(f.ok ? 'Yes! That is a whole sentence.' : 'Yes! A piece. ' + SS.whyShort[f.why] + '.', 'happy');
        if (placed === total) {
          var nb = Object.keys(bad).length;
          c.right('You sorted all ' + total + ' cards!', { n: total, clean: total - nb });
        }
        return true;
      }
      bad[card._i] = 1; c.slips.push(f.ok ? 'sort-whole-as-piece' : 'sort-piece-as-whole:' + f.why);
      card.classList.add('shake'); setTimeout(function () { card.classList.remove('shake'); }, 450);
      c.wrong(f.ok ? 'That one is a whole sentence! It has a WHO or WHAT and a DOES or IS.' : 'That one is just a piece. ' + SS.whyText[f.why]);
      return false;
    });
    c.hint(function (l) {
      var n = nextCard();
      if (l === 1) return 'Ask: WHO or WHAT? DOES or IS? Finished thought?';
      if (n) n.classList.add('glow');
      if (l === 2) return 'Try the glowing card next!';
      return n ? 'The glowing card is ' + (n._f.ok ? 'a WHOLE sentence.' : 'just a PIECE.') : 'You are almost done!';
    });
  };

  // =========================================================================
  // 8. fixPick: choose the piece that fixes a fragment
  var NEED_BTN = { sub: 'It needs a WHO or WHAT', pred: 'It needs a DOES or IS', thought: 'It needs the rest of the thought', both: 'It needs a WHO/WHAT and a DOES/IS' };
  K.fixPick = function (c) {
    var fx = c.q.fx, mode = c.q.mode, stage = mode === 'identify' ? 0 : 1, nWrong = mode === 'label' ? 1 : 2;
    c.speak = fx.frag;
    var slot = h('span', { class: 'slot' }, '?'), line = h('div', { class: 'fixline' });
    if (fx.pre) line.appendChild(h('span', { class: 'fpart' }, fx.pre));
    line.appendChild(slot);
    if (fx.post) line.appendChild(h('span', { class: 'fpart' }, fx.post));
    var area = h('div', { class: 'opts' }), col = h('div', { class: 'col' }, line);
    if (mode === 'label') col.appendChild(h('div', { class: 'need' }, SS.needText[fx.need]));
    col.appendChild(area); c.host.appendChild(col);
    function compose(p) { return [fx.pre, p, fx.post].filter(Boolean).join(' '); }
    var pickBtns = [];
    function pick() {
      stage = 1; SS.clear(area); pickBtns = [];
      c.instr('Which piece **fixes** it? Tap it to fill the empty spot.');
      var opts = SS.shuffle([fx.piece].concat(fx.wrong.slice(0, nWrong)));
      opts.forEach(function (t) {
        var b = btn(t, 'opt big', function () {
          if (c.done) return;
          if (t === fx.piece) {
            slot.textContent = fx.piece; slot.classList.add('filled'); b.classList.add('good'); SS.snd.pop();
            col.appendChild(h('div', { class: 'result' }, fx.result));
            c.right('Read it: “' + fx.result + '” It sounds finished!');
            if (SS.state.settings.read) SS.speak(fx.result);
          } else {
            b.classList.add('nope'); b.disabled = true;
            c.wrong('Read it: “' + compose(t) + '” It’s not fixed yet. ' + SS.needText[fx.need], 'fix-' + fx.need);
          }
        });
        b._t = t; pickBtns.push(b); area.appendChild(b);
      });
    }
    if (stage === 0) {
      c.instr('First: what is this **missing**?');
      c.say('Detective time! Ask: WHO or WHAT? DOES or IS? Finished thought?', 'idle');
      SS.shuffle(Object.keys(NEED_BTN)).forEach(function (k) {
        var b = btn(NEED_BTN[k], 'opt big', function () {
          if (c.done || stage !== 0) return;
          if (k === fx.need) { SS.snd.pop(); c.say('Yes! ' + SS.needText[fx.need], 'happy'); pick(); }
          else { b.classList.add('nope'); b.disabled = true; c.wrong('Look again. Ask: WHO or WHAT? DOES or IS? Finished thought?', 'fixdx:' + fx.need); }
        });
        b.setAttribute('data-k', k); area.appendChild(b);
      });
    } else {
      c.say(mode === 'label' ? SS.needText[fx.need] + ' Pick the piece that fits!' : 'It’s a fragment! Pick the piece that fixes it.', 'idle');
      pick();
    }
    c.hint(function (l) {
      if (stage === 0) {
        if (l === 1) return 'Ask: WHO or WHAT? DOES or IS? Finished thought?';
        if (l === 2) return 'Read it out loud. What is missing?';
        var g = area.querySelector('[data-k="' + fx.need + '"]'); if (g) g.classList.add('glow');
        return 'Look at the glowing choice!';
      }
      if (l === 1) return SS.needText[fx.need];
      if (l === 2) {
        var w = pickBtns.filter(function (b) { return b._t !== fx.piece && !b.disabled; })[0];
        if (w) { w.classList.add('gone'); w.disabled = true; }
        return 'I took away one wrong piece.';
      }
      pickBtns.forEach(function (b) { if (b._t === fx.piece) b.classList.add('glow'); });
      return 'The glowing piece fixes it!';
    });
  };

  // =========================================================================
  // 9. matchPick: which ending makes sense?
  K.matchPick = function (c) {
    var m = c.q.m, opts = c.q.opts, area = h('div', { class: 'opts' });
    c.speak = m.sub;
    var subj = h('div', { class: 'subjcard' }, h('span', { class: 'w is-sub' }, m.sub), h('span', { class: 'qmark' }, '?'));
    var col = h('div', { class: 'col' }, subj, area);
    c.host.appendChild(col);
    c.instr('Pick the **predicate** that makes **sense** with “' + m.sub + '”.');
    c.say('Think about what ' + m.sub.toLowerCase() + ' really does.', 'idle');
    var bs = SS.shuffle(opts).map(function (t) {
      var b = btn(t, 'opt big', function () {
        if (c.done || b.disabled) return;
        if (t === m.pred) {
          subj.replaceWith(h('div', { class: 'sent' }, m.sub.split(' ').map(function (w) { return h('span', { class: 'w is-sub' }, w); }),
            t.split(' ').map(function (w) { return h('span', { class: 'w is-pred' }, w); })));
          b.classList.add('good'); area.classList.add('dim'); c.right('“' + m.sub + ' ' + t + '” That makes sense!');
          if (SS.state.settings.read) SS.speak(m.sub + ' ' + t);
        } else { b.classList.add('nope'); b.disabled = true; c.wrong('“' + m.sub + ' ' + t + '” That is silly! Pick the one that makes sense.', 'match'); }
      });
      b._t = t; area.appendChild(b); return b;
    });
    c.hint(function (l) {
      if (l === 1) return 'What does ' + m.sub.toLowerCase() + ' really do?';
      if (l === 2) { var w = bs.filter(function (b) { return b._t !== m.pred && !b.disabled; })[0]; if (w) { w.classList.add('gone'); w.disabled = true; } return 'I took away one silly one.'; }
      bs.forEach(function (b) { if (b._t === m.pred) b.classList.add('glow'); }); return 'The glowing one makes sense!';
    });
  };

  // =========================================================================
  // 10. matchDrag: drag each predicate to its subject
  K.matchDrag = function (c) {
    var ms = c.q.ms, placed = 0, bad = {};
    var rows = ms.map(function (m) {
      var r = h('div', { class: 'mrow drop' }, h('span', { class: 'w is-sub' }, m.sub), h('div', { class: 'mslot' }, '?'));
      r._m = m; return r;
    });
    var tray = h('div', { class: 'tray' });
    var cards = SS.shuffle(ms).map(function (m, i) {
      var k = h('div', { class: 'cardfrag pred', tabindex: '0', role: 'button' }, m.pred); k._m = m; k._i = i; tray.appendChild(k); return k;
    });
    c.host.appendChild(h('div', { class: 'col' }, h('div', { class: 'mrows' }, rows), tray));
    c.instr('Drag each predicate to the subject it goes with. (Or tap, then tap.)');
    c.say('Which ending makes sense for each subject?', 'idle');
    SS.dragDrop(cards, rows, function (card, row) {
      if (row.getAttribute('data-done')) return false;
      if (card._m === row._m) {
        row.setAttribute('data-done', '1'); card.setAttribute('data-locked', '1'); card.classList.remove('sel'); card.classList.add('inslot');
        var slot = row.querySelector('.mslot'); SS.clear(slot); slot.appendChild(card); card.style.transform = '';
        placed++; SS.snd.pop(); c.say('“' + row._m.sub + ' ' + card._m.pred + '” Yes!', 'happy');
        if (placed === ms.length) c.right('You matched them all!', { n: ms.length, clean: ms.length - Object.keys(bad).length });
        return true;
      }
      bad[card._i] = 1; card.classList.add('shake'); setTimeout(function () { card.classList.remove('shake'); }, 450);
      c.wrong('“' + row._m.sub + ' ' + card._m.pred + '” That is silly! Try another one.', 'match');
      return false;
    });
    c.hint(function (l) {
      var r = rows.filter(function (x) { return !x.getAttribute('data-done'); })[0];
      if (!r) return 'You are almost done!';
      if (l === 1) return 'What does ' + r._m.sub.toLowerCase() + ' really do?';
      r.classList.add('glow');
      if (l === 2) return 'Start with the glowing subject.';
      cards.forEach(function (k) { if (k._m === r._m) k.classList.add('glow'); });
      return 'The glowing predicate goes with it!';
    });
  };

  // =========================================================================
  // 11. buildWords: put the scrambled words in order
  K.buildWords = function (c) {
    var st = c.q.st, W = st.words, built = 0, placed = [];
    c.speak = st.text;
    var line = h('div', { class: 'buildline' }), tray = h('div', { class: 'tray words' });
    c.host.appendChild(h('div', { class: 'col' }, line, tray));
    c.instr('Tap the words in the right order to **build the sentence**.');
    c.say('A sentence starts with a capital letter and ends with a period.', 'idle');
    var chips = SS.shuffle(W.map(function (w, i) { return { w: w, i: i }; })).map(function (o) {
      var b = h('button', { class: 'chip' }, o.w);
      b.addEventListener('click', function () {
        if (c.done || b.disabled) return;
        if (o.w === W[built]) {
          b.disabled = true; b.classList.add('used'); SS.snd.pop();
          var sp = h('span', { class: 'w' }, o.w); line.appendChild(sp); placed.push(sp); built++;
          tray.querySelectorAll('.glow').forEach(function (x) { x.classList.remove('glow'); });
          if (built === W.length) {
            placed.forEach(function (p, i) { p.classList.add(i < st.s ? 'is-sub' : 'is-pred'); });
            c.host.firstChild.appendChild(SS.tagRow('both'));
            c.right('“' + st.text + '” You built it!');
            if (SS.state.settings.read) SS.speak(st.text);
          }
        } else {
          var msg;
          if (built === 0 && !/^[A-Z]/.test(o.w)) msg = 'A sentence starts with a CAPITAL letter. Find the capital word!';
          else if (/[.!?]$/.test(o.w) && built < W.length - 1) msg = 'The period goes at the END of the sentence.';
          else msg = 'Read what you have so far. Which word comes next?';
          b.classList.add('shake'); setTimeout(function () { b.classList.remove('shake'); }, 450);
          c.wrong(msg, 'build-order');
        }
      });
      tray.appendChild(b); b._w = o.w; return b;
    });
    c.hint(function (l) {
      if (l === 1) return 'Start with the word that has a capital letter. The word with the period goes last.';
      var n = chips.filter(function (b) { return !b.disabled && b._w === W[built]; })[0];
      if (n) n.classList.add('glow');
      return l === 2 ? 'The next word is glowing!' : 'The next word is “' + SS.norm(W[built]) + '”.';
    });
  };

  // =========================================================================
  // Session runner
  SS.runSession = function (o) {
    return new Promise(function (resolve) {
      var qs = o.qs, total = qs.length, queue = qs.map(function (q) { return Object.assign({}, q); });
      var done = 0, requeued = 0, items = [], scoreSum = 0, streak = 0, best = 0, t0 = Date.now(), cur = null, c = null, last = null;
      var clean = true, hp = total, quit = false;
      var crab = SS.crab('idle', !!o.boss), bubble = h('div', { class: 'saybubble' });
      var instr = h('div', { class: 'instr' }), stage = h('div', { class: 'stage' }), ribbon = h('div', { class: 'ribbon' }, 'Second chance!');
      ribbon.hidden = true;
      var dots = h('div', { class: 'dots' });
      for (var i = 0; i < total; i++) dots.appendChild(h('i'));
      var hpbar = null;
      if (o.boss) { hpbar = h('div', { class: 'hpbar', 'aria-label': 'Crab King health' }); for (var j = 0; j < total; j++) hpbar.appendChild(h('i', { class: 'full' })); }
      var hintBtn = h('button', { class: 'btn sun hintbtn', onclick: onHint }, '💡 Hint');
      var readBtn = h('button', { class: 'btn ghost', onclick: function () { SS.speak((c && c.speak) || instr.textContent); } }, '🔊 Read it');
      var nextBtn = h('button', { class: 'btn primary big nextbtn', onclick: onNext }, 'Next ➜');
      nextBtn.hidden = true;
      var back = h('button', { class: 'btn ghost small', onclick: function () {
        SS.ask('Leave this game? Your stars from this game will not be saved.', 'Leave', 'Keep playing').then(function (y) {
          if (y) { quit = true; try { speechSynthesis.cancel(); } catch (e) {} resolve(null); }
        });
      } }, '← Back');
      var root = h('div', { class: 'play' + (o.boss ? ' boss' : '') },
        h('div', { class: 'p-top' }, back, h('div', { class: 'p-title' }, o.title), dots, hpbar),
        h('div', { class: 'p-main' },
          h('div', { class: 'p-side' }, bubble, crab),
          h('div', { class: 'p-stage' }, ribbon, instr, stage)),
        h('div', { class: 'p-foot' }, hintBtn, readBtn, h('div', { class: 'grow' }), nextBtn));
      SS.mount(root);

      function onHint() {
        if (!c || c.done) return;
        c.hints++;
        var lv = Math.min(c.hints, 3);
        var msg = c.hintFn ? c.hintFn(lv) : 'Look carefully!';
        c.say('💡 ' + msg, 'think');
        hintBtn.setAttribute('data-l', lv);
      }
      function shake() { stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake'); }
      function startQ() {
        if (quit) return;
        if (!queue.length) return finish();
        cur = queue.shift();
        SS.clear(stage); SS.clear(instr); nextBtn.hidden = true; hintBtn.removeAttribute('data-l'); hintBtn.disabled = false;
        ribbon.hidden = !cur.retry; stage.className = 'stage';
        c = { q: cur, support: cur.support == null ? 1 : cur.support, host: stage, tries: 0, hints: 0, slips: [], done: false, speak: '', hintFn: null };
        c.instr = function (t) { SS.rich(instr, t); };
        c.say = function (t, pose) { SS.rich(bubble, t); crab.set(pose || 'idle'); };
        c.pose = function (p) { crab.set(p); };
        c.hint = function (fn) { c.hintFn = fn; };
        c.wrong = function (msg, slip) {
          c.tries++; if (slip) c.slips.push(slip); streak = 0; clean = false;
          SS.snd.no(); c.say(msg, 'oops'); shake();
        };
        c.right = function (msg, extra) {
          if (c.done) return; c.done = true; extra = extra || {};
          var n = 1, cl, sc;
          if (extra.n != null) { n = extra.n; cl = extra.clean; sc = n ? cl / n : 1; }
          else {
            sc = (c.tries === 0 && c.hints === 0) ? 1 : (c.tries === 0 || (c.tries === 1 && c.hints === 0)) ? 0.5 : 0;
            cl = sc === 1 ? 1 : 0;
          }
          if (c.hints) clean = false;
          if (sc === 1) { streak++; best = Math.max(best, streak); } else streak = 0;
          SS.snd.ok(); if (sc === 1) { SS.snd.star(); SS.confetti(8); }
          c.say(SS.praise() + ' ' + msg, sc === 1 ? 'cheer' : 'happy');
          hintBtn.disabled = true;
          last = { n: n, clean: cl, sc: sc, c: c, q: cur };
          nextBtn.hidden = false;
          if (SS.state.settings.read && !extra.silent) SS.speak(msg.replace(/[“”]/g, ''));
          setTimeout(function () { try { nextBtn.focus({ preventScroll: true }); } catch (e) {} }, 60);
        };
        SS.__cur = c;
        cur.kind in K ? K[cur.kind](c) : c.right('(missing game)');
        if (SS.state.settings.read && c.speak) setTimeout(function () { SS.speak(c.speak); }, 450);
      }
      function onNext() {
        if (!last) return;
        var r = last; last = null;
        items.push({ skill: r.q.skill, n: r.n, clean: r.clean, sc: r.sc, hints: r.c.hints, slips: r.c.slips });
        if (!r.q.retry) {
          scoreSum += r.sc;
          var d = dots.children[done]; if (d) d.className = r.sc === 1 ? 'ok' : r.sc > 0 ? 'part' : 'miss';
          done++;
          if (hpbar && r.sc >= 0.5) { hp--; var f = hpbar.querySelectorAll('.full'); if (f.length) f[f.length - 1].className = 'empty'; }
          if (r.sc < 1 && requeued < 3 && !o.boss && !r.q.noRetry) {
            requeued++; queue.splice(Math.min(2, queue.length), 0, Object.assign({}, r.q, { retry: true }));
          }
        }
        startQ();
      }
      function finish() {
        try { speechSynthesis.cancel(); } catch (e) {}
        var score = total ? scoreSum / total : 1;
        var stars = score >= 0.85 ? 3 : score >= 0.6 ? 2 : 1;
        var shells = 0;
        items.forEach(function (it) { shells += Math.round(it.sc * 2 * Math.min(it.n, 3)); });
        shells += stars * 2;
        var rec = {
          lv: o.lv, way: o.way, score: score, stars: stars, shells: shells, count: total,
          secs: Math.round((Date.now() - t0) / 1000), perfect: clean && stars === 3, streak: best,
          items: items.map(function (it) { return { skill: it.skill, n: it.n, clean: it.clean, hints: it.hints, slips: it.slips }; })
        };
        SS.record(rec);
        var nu = SS.checkBadges(rec);
        resolve({ rec: rec, badges: nu });
      }
      startQ();
    });
  };
})();
