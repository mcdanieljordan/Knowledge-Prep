/* Parent & Teacher Dashboard: reads the shared progress log (shared/hub.js) and turns it into
   clear stats, recommendations, and copy-ready quiz prompts for any LLM. */
(function () {
  'use strict';
  var Hub = window.Hub, KP = window.KP, MD = window.MD;
  var DAY = 86400000;
  var demo = /[?&]demo=1/.test(location.search);
  var D = demo ? makeDemo() : Hub.data();
  var root = document.getElementById('app');
  var view = { tab: 'overview', range: 30, open: {} };

  // ---------- tiny helpers
  function h(tag, a, kids) {
    var e = document.createElement(tag);
    if (a) for (var k in a) { var v = a[k]; if (v == null || v === false) continue; if (k === 'class') e.className = v; else if (k === 'html') e.innerHTML = v; else if (k === 'text') e.textContent = v; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v); else e.setAttribute(k, v); }
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function pct(x) { return Math.round(x * 100) + '%'; }
  function dkey(t) { return new Date(t).toLocaleDateString('en-CA'); }
  function mins(ms) { var m = Math.round(ms / 60000); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; }
  function ago(t) { if (!t) return 'never'; var d = Math.floor((Date.now() - t) / DAY); return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d + ' days ago'; }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
  function prof(id) { return D.profiles.filter(function (p) { return p.id === id; })[0]; }
  function gradeLabel(g) { return g === 0 ? 'Kindergarten' : 'Grade ' + g; }
  function copyText(txt, btn) {
    function done() { if (btn) { var o = btn.dataset.o || btn.textContent; btn.dataset.o = o; btn.textContent = '✅ Copied!'; setTimeout(function () { btn.textContent = o; }, 1800); } }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(done, fallback); else fallback();
    function fallback() { var t = document.createElement('textarea'); t.value = txt; t.style.cssText = 'position:fixed;left:-999px'; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); done(); } catch (e) { if (btn) btn.textContent = 'Select the text and copy'; } t.remove(); }
  }
  function copybox(txt, label) {
    var pre = h('pre', { class: 'cb-text', text: txt });
    var btn = h('button', { class: 'btn small', text: '📋 Copy' });
    btn.onclick = function () { copyText(txt, btn); };
    return h('div', { class: 'copybox' }, [h('div', { class: 'cb-head' }, [h('b', { text: label || 'Copy box' }), btn]), pre]);
  }

  // ---------- analytics
  var STATUS = { none: ['Not started', '#B8C0CC'], start: ['Just started', '#2E86DE'], strong: ['Strong', '#1F9D55'], grow: ['Growing', '#E0A100'], help: ['Needs help', '#D9534F'] };
  function ownOK(r) { return !!r.ok && !r.h; }
  function skillStat(rows) {
    rows = rows.slice().sort(function (a, b) { return a.t - b.t; });
    var att = rows.filter(function (r) { return r.m !== 'try'; }), rec = att.slice(-20);
    var st = { n: rows.length, ni: att.length, nrec: rec.length, ok: rec.filter(ownOK).length, last: rows.length ? rows[rows.length - 1].t : 0, tags: {}, misses: [] };
    st.acc = rec.length ? st.ok / rec.length : null;
    st.hintRate = att.length ? att.filter(function (r) { return r.h > 0; }).length / att.length : 0;
    var ms = att.map(function (r) { return Math.min(r.ms, 120000); }).filter(function (x) { return x > 0; });
    st.avgMs = ms.length ? ms.reduce(function (a, b) { return a + b; }, 0) / ms.length : 0;
    att.forEach(function (r) { if (!r.ok) { if (r.w) st.tags[r.w] = (st.tags[r.w] || 0) + 1; } });
    st.misses = att.filter(function (r) { return !r.ok && r.q; }).slice(-5).reverse();
    if (att.length >= 10) { var a = att.slice(-5), b = att.slice(-10, -5); st.trend = a.filter(ownOK).length / 5 - b.filter(ownOK).length / 5; }
    st.status = !rows.length ? 'none' : (st.ni < 5 ? 'start' : st.acc >= 0.85 ? 'strong' : st.acc >= 0.65 ? 'grow' : 'help');
    if (rows.length && !att.length) st.status = 'start';
    st.topTag = Object.keys(st.tags).sort(function (x, y) { return st.tags[y] - st.tags[x]; })[0] || '';
    return st;
  }
  function rangeRows(pid, days, offsetDays) {
    var end = Date.now() - (offsetDays || 0) * DAY, start = days ? end - days * DAY : 0;
    return D.log.filter(function (r) { return r.p === pid && r.t >= start && r.t <= end; });
  }
  function bySkill(rows) { var m = {}; rows.forEach(function (r) { var k = r.a + '|' + r.s; (m[k] = m[k] || []).push(r); }); return m; }
  function summary(pid, days) {
    var rows = rangeRows(pid, days), prev = days ? rangeRows(pid, days, days).filter(function (r) { return r.t < Date.now() - days * DAY; }) : [];
    var att = rows.filter(function (r) { return r.m !== 'try'; }), pa = prev.filter(function (r) { return r.m !== 'try'; });
    var sess = D.sessions.filter(function (s) { return s.p === pid && s.t >= (days ? Date.now() - days * DAY : 0); });
    var ms = sess.length ? sess.reduce(function (a, s) { return a + Math.min(s.ms, 30 * 60000); }, 0) : rows.reduce(function (a, r) { return a + Math.min(r.ms, 120000); }, 0);
    var daysSet = {}; rows.forEach(function (r) { daysSet[dkey(r.t)] = 1; });
    var map = bySkill(rows), strong = 0, attempted = 0;
    Object.keys(map).forEach(function (k) { var s = skillStat(map[k]); if (s.status !== 'none') { attempted++; if (s.status === 'strong') strong++; } });
    return { rows: rows, q: rows.length, ms: ms, acc: att.length ? att.filter(ownOK).length / att.length : null, prevAcc: pa.length ? pa.filter(ownOK).length / pa.length : null, days: Object.keys(daysSet).length, strong: strong, attempted: attempted, last: rows.length ? rows[rows.length - 1].t : 0, hintRate: att.length ? att.filter(function (r) { return r.h > 0; }).length / att.length : 0 };
  }
  function appsFor(p, rows) {
    var have = {}; rows.forEach(function (r) { have[r.a] = 1; });
    return Object.keys(KP.apps).filter(function (id) { return have[id] || KP.apps[id].grades.indexOf(p.grade) >= 0; });
  }
  /* recommendations: weakest skills first */
  function focusList(p, rowsAll) {
    var map = bySkill(rowsAll), out = [];
    Object.keys(map).forEach(function (k) {
      var parts = k.split('|'), st = skillStat(map[k]);
      if (st.ni < 3 || st.acc == null || st.acc >= 0.8) return;
      var pri = (1 - st.acc) * (0.5 + Math.min(st.ni, 10) / 20) + st.hintRate * 0.15 + (st.trend != null && st.trend < -0.15 ? 0.1 : 0);
      out.push({ app: parts[0], skill: parts[1], st: st, pri: pri });
    });
    out.sort(function (a, b) { return b.pri - a.pri; });
    return out;
  }
  function strengthList(rowsAll) {
    var map = bySkill(rowsAll), out = [];
    Object.keys(map).forEach(function (k) { var parts = k.split('|'), st = skillStat(map[k]); if (st.ni >= 6 && st.acc >= 0.85) out.push({ app: parts[0], skill: parts[1], st: st }); });
    out.sort(function (a, b) { return b.st.acc - a.st.acc || b.st.ni - a.st.ni; });
    return out;
  }
  function nextUp(p, rowsAll) {
    var have = {}; rowsAll.forEach(function (r) { have[r.a + '|' + r.s] = 1; });
    var out = [];
    Object.keys(KP.apps).forEach(function (id) {
      var a = KP.apps[id]; if (a.grades.indexOf(p.grade) < 0) return;
      var ids = Object.keys(a.skills).sort(function (x, y) { return (a.skills[x].order || 0) - (a.skills[y].order || 0); });
      ids.forEach(function (s) { if (!have[id + '|' + s] && out.length < 2) out.push({ app: id, skill: s }); });
    });
    return out;
  }
  function reasonText(p, f) {
    var st = f.st, info = KP.skillInfo(f.app, f.skill), parts = [];
    parts.push(p.name + ' got ' + st.ok + ' of ' + st.nrec + ' right without help (' + pct(st.acc) + ').');
    if (st.hintRate >= 0.3) parts.push('Needed hints on ' + pct(st.hintRate) + ' of questions.');
    if (st.topTag) parts.push('Most common slip: "' + st.topTag + '" (' + st.tags[st.topTag] + '×).');
    if (st.trend != null && st.trend <= -0.2) parts.push('Slipping lately.'); else if (st.trend != null && st.trend >= 0.2) parts.push('Improving lately.');
    return parts.join(' ');
  }

  // ---------- LLM quiz prompts
  function missLine(r) { return '- Question: ' + r.q + '  |  ' + (r.g ? 'Answered: ' + r.g + '  |  ' : '') + (r.c ? 'Correct: ' + r.c : '') + (r.w ? '  |  Likely mistake: ' + r.w : ''); }
  function buildPrompt(p, items, opts) {
    opts = opts || {};
    var count = opts.count || 8, multi = items.length > 1, app0 = KP.appInfo(items[0].app), subj = app0.subject || 'school';
    var L = [];
    L.push('You are a friendly, patient tutor for ' + p.name + ', a ' + gradeLabel(p.grade).toLowerCase() + ' student. ' + p.name + ' gets bored easily and loves simple, silly, fast-moving things. Make learning feel like a game.');
    L.push('');
    L.push('TASK: Create ONE self-contained interactive quiz as a single HTML file (inline CSS and JavaScript, no outside libraries, no sign-in). It must work on an iPad in landscape and have big tap-friendly buttons.');
    L.push('');
    L.push(multi ? 'SKILLS TO PRACTICE (mix them, weakest first):' : 'SKILL TO PRACTICE:');
    items.forEach(function (it, i) {
      var info = KP.skillInfo(it.app, it.skill), st = it.stat;
      L.push((multi ? (i + 1) + '. ' : '') + info.name + (info.group && info.group !== 'Other' ? ' (' + info.group + ')' : ''));
      if (info.method) L.push('   Teacher\'s method (use these exact steps and words): ' + info.method);
      if (st) {
        var tg = Object.keys(st.tags).sort(function (a, b) { return st.tags[b] - st.tags[a]; }).slice(0, 3);
        if (tg.length) { L.push('   What ' + p.name + ' keeps getting wrong:'); tg.forEach(function (t) { L.push('   * ' + t + ' (' + st.tags[t] + ' times)'); }); }
        if (st.misses.length) { L.push('   Real examples of recent mistakes:'); st.misses.slice(0, 3).forEach(function (r) { L.push('   ' + missLine(r)); }); }
        if (st.acc != null) L.push('   Current score on this skill without help: ' + pct(st.acc) + '.');
      }
    });
    L.push('');
    L.push('QUIZ RULES:');
    L.push('1. Exactly ' + count + ' questions. Start easy, get a little harder each question. Use fresh random numbers or examples every time, with a "Play again" button that makes a new set.');
    L.push('2. One question at a time. Use big multiple-choice buttons for the first ' + Math.ceil(count * 0.6) + ' questions, then typed answers for the rest.');
    L.push('3. Make the wrong choices match the real mistakes listed above, so each wrong answer teaches something.');
    L.push('4. When an answer is wrong: do NOT just say "wrong". Show a one-sentence hint about that exact mistake, let ' + p.name + ' try once more, and then show the step-by-step solution using the teacher\'s method above.');
    L.push('5. Praise often with short silly messages and emoji. Show a progress bar and stars. End with a confetti celebration.');
    L.push('6. Use plain, kind language, short sentences, and a large readable font (at least 20px). No timers. No scary red screens.');
    L.push('7. At the end, show a score summary: which questions needed help and ONE sentence about what to practice next.');
    L.push('8. Keep it ' + subj + '-appropriate for the grade level and stay on the listed skill' + (multi ? 's' : '') + '.');
    L.push('');
    L.push('OUTPUT: Reply with only the complete HTML code in a single code block that I can save as quiz.html and open.');
    return L.join('\n');
  }
  function teacherSummary(p, days) {
    var S = summary(p.id, days), rowsAll = rangeRows(p.id, 0), foc = focusList(p, rowsAll), str = strengthList(rowsAll), L = [];
    L.push('Progress summary for ' + p.name + ' (' + gradeLabel(p.grade) + ')  |  ' + (days ? 'Last ' + days + ' days' : 'All time'));
    L.push('Practice: ' + plural(S.days, 'day') + ', about ' + mins(S.ms) + ', ' + plural(S.q, 'question') + ' answered.');
    L.push('Accuracy without help: ' + (S.acc == null ? 'not enough data yet' : pct(S.acc)) + (S.prevAcc != null && S.acc != null ? ' (was ' + pct(S.prevAcc) + ' in the period before)' : '') + '.');
    if (str.length) L.push('Strong skills: ' + str.slice(0, 5).map(function (x) { return KP.skillInfo(x.app, x.skill).name + ' (' + pct(x.st.acc) + ')'; }).join('; ') + '.');
    if (foc.length) { L.push('Needs support:'); foc.slice(0, 5).forEach(function (f) { L.push('- ' + KP.skillInfo(f.app, f.skill).name + ': ' + pct(f.st.acc) + ' without help' + (f.st.topTag ? '. Common slip: ' + f.st.topTag : '') + '.'); }); }
    else L.push('Nothing is flagged as a concern right now.');
    L.push('Last practiced: ' + ago(S.last) + '.');
    return L.join('\n');
  }

  // ---------- charts
  function dayChart(pid, days) {
    var n = days || 30, today = new Date(); today.setHours(0, 0, 0, 0);
    var buckets = [], map = {};
    for (var i = n - 1; i >= 0; i--) { var d = new Date(today.getTime() - i * DAY), k = d.toLocaleDateString('en-CA'); var b = { k: k, d: d, q: 0, ok: 0, att: 0 }; buckets.push(b); map[k] = b; }
    rangeRows(pid, n + 1).forEach(function (r) { var b = map[dkey(r.t)]; if (!b) return; b.q++; if (r.m !== 'try') { b.att++; if (ownOK(r)) b.ok++; } });
    var max = Math.max(10, Math.max.apply(null, buckets.map(function (b) { return b.q; }))), W = 1100, H = 230, pl = 40, pb = 34, pt = 12, bw = (W - pl - 10) / n;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Questions answered per day, colored by accuracy" class="chart">';
    [0, 0.5, 1].forEach(function (f) { var y = pt + (H - pt - pb) * (1 - f); s += '<line x1="' + pl + '" x2="' + (W - 6) + '" y1="' + y + '" y2="' + y + '" stroke="#E5E9F0"/><text x="' + (pl - 6) + '" y="' + (y + 4) + '" text-anchor="end" font-size="12" fill="#5C6F8A">' + Math.round(max * f) + '</text>'; });
    buckets.forEach(function (b, i) {
      var x = pl + i * bw + bw * 0.12, w = bw * 0.76, hh = (H - pt - pb) * (b.q / max), y = H - pb - hh, acc = b.att ? b.ok / b.att : null;
      var col = acc == null ? '#9FB3C8' : acc >= 0.8 ? '#1F9D55' : acc >= 0.6 ? '#E0A100' : '#D9534F';
      if (b.q) s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" rx="3" fill="' + col + '"><title>' + b.k + ': ' + b.q + ' questions' + (acc != null ? ', ' + pct(acc) + ' on own' : '') + '</title></rect>';
      if (n <= 14 || i % Math.ceil(n / 10) === 0 || i === n - 1) s += '<text x="' + (x + w / 2) + '" y="' + (H - 12) + '" text-anchor="middle" font-size="12" fill="#5C6F8A">' + (b.d.getMonth() + 1) + '/' + b.d.getDate() + '</text>';
    });
    return s + '</svg>';
  }

  // ---------- views
  function render() {
    root.innerHTML = '';
    var header = h('header', { class: 'top' }, [
      h('div', { class: 'brand' }, [h('a', { href: '../', class: 'back', text: '← Hub' }), h('h1', { text: 'Parent & Teacher Dashboard' })]),
      h('div', { class: 'range' }, [h('span', { text: 'Show:' })].concat([[7, '7 days'], [30, '30 days'], [0, 'All time']].map(function (r) { return h('button', { class: 'pill' + (view.range === r[0] ? ' on' : ''), text: r[1], onclick: function () { view.range = r[0]; render(); } }); })))
    ]);
    root.appendChild(header);
    if (demo) root.appendChild(h('div', { class: 'demo' }, [h('b', { text: 'Sample data. ' }), 'These two players are made up so you can see how the dashboard looks. Nothing here is saved. ', h('a', { href: './', text: 'Back to real data' })]));
    var tabs = h('nav', { class: 'tabs' }, [h('button', { class: 'tab' + (view.tab === 'overview' ? ' on' : ''), text: '🏠 Overview', onclick: function () { view.tab = 'overview'; render(); } })]);
    D.profiles.forEach(function (p) { tabs.appendChild(h('button', { class: 'tab' + (view.tab === p.id ? ' on' : ''), text: p.emoji + ' ' + p.name, onclick: function () { view.tab = p.id; render(); } })); });
    root.appendChild(tabs);
    if (!D.profiles.length) return root.appendChild(emptyState());
    if (view.tab !== 'overview' && !prof(view.tab)) view.tab = 'overview';
    root.appendChild(view.tab === 'overview' ? overview() : child(prof(view.tab)));
    root.appendChild(h('footer', { class: 'foot' }, [h('span', { text: 'Progress is saved in this browser on this device. ' }), 'Use ', h('b', { text: 'Move progress' }), ' (bottom of each child\'s page) to copy it to another device.']));
  }
  function emptyState() {
    return h('section', { class: 'card empty' }, [h('h2', { text: 'No players yet' }), h('p', { text: 'Open an app from the hub and add a player. As soon as they answer questions, their progress shows up here.' }), h('div', { class: 'row' }, [h('a', { class: 'btn', href: '../', text: 'Go to the hub' }), h('a', { class: 'btn alt', href: '?demo=1', text: 'See sample data' })])]);
  }
  function overview() {
    var wrap = h('div', { class: 'grid2' });
    D.profiles.forEach(function (p) {
      var S = summary(p.id, view.range), rowsAll = rangeRows(p.id, 0), foc = focusList(p, rowsAll);
      var top = foc[0];
      wrap.appendChild(h('section', { class: 'card kid' }, [
        h('div', { class: 'kidhead' }, [h('span', { class: 'bigav', text: p.emoji }), h('div', {}, [h('h2', { text: p.name }), h('small', { text: gradeLabel(p.grade) + ' · last played ' + ago(S.last) })])]),
        h('div', { class: 'mini' }, [mini(S.q, 'questions'), mini(mins(S.ms), 'time'), mini(S.acc == null ? '–' : pct(S.acc), 'on own'), mini(S.days, 'active days')]),
        top ? h('div', { class: 'flag' }, [h('b', { text: 'Focus: ' + KP.skillInfo(top.app, top.skill).name }), h('div', { text: reasonText(p, top) })]) : h('div', { class: 'flag ok', text: S.q ? 'Nothing urgent. Keep it up!' : 'No practice yet.' }),
        h('button', { class: 'btn', text: 'Open ' + p.name + "'s dashboard ▶", onclick: function () { view.tab = p.id; render(); } })
      ]));
    });
    return wrap;
  }
  function mini(v, l) { return h('div', { class: 'tile' }, [h('b', { text: String(v) }), h('small', { text: l })]); }

  function child(p) {
    var days = view.range, S = summary(p.id, days), rowsAll = rangeRows(p.id, 0), rowsR = S.rows;
    var page = h('div', { class: 'page' });
    // tiles
    var delta = (S.acc != null && S.prevAcc != null) ? Math.round((S.acc - S.prevAcc) * 100) : null;
    page.appendChild(h('div', { class: 'tiles' }, [
      tile('⏱️', mins(S.ms), 'Practice time'), tile('❓', S.q, 'Questions answered'),
      tile('🎯', S.acc == null ? '–' : pct(S.acc), 'Right without help', delta == null ? '' : (delta >= 0 ? '▲ ' : '▼ ') + Math.abs(delta) + ' pts vs before', delta == null ? '' : delta >= 0 ? 'up' : 'down'),
      tile('📅', S.days + (days ? ' / ' + days : ''), 'Days practiced'), tile('💪', S.strong + ' / ' + S.attempted, 'Skills strong')
    ]));
    // focus
    var foc = focusList(p, rowsAll), str = strengthList(rowsAll), nu = nextUp(p, rowsAll);
    var fc = h('section', { class: 'card' }, [h('h2', { text: '🎯 Focus now' }), h('p', { class: 'sub', text: 'Where ' + p.name + ' needs the most help, based on recent answers. Each card has a ready-made prompt for any AI.' })]);
    if (!foc.length) fc.appendChild(h('div', { class: 'flag ok', text: rowsAll.length < 10 ? 'Not enough practice yet to find weak spots. After about 10 questions on a skill, recommendations appear here.' : 'No weak spots right now. Great work!' }));
    foc.slice(0, 3).forEach(function (f, i) {
      var info = KP.skillInfo(f.app, f.skill), app = KP.appInfo(f.app), prompt = buildPrompt(p, [{ app: f.app, skill: f.skill, stat: f.st }]), shown = h('div', { class: 'pv', hidden: '' });
      fc.appendChild(h('div', { class: 'rec' }, [
        h('div', { class: 'rnum', text: String(i + 1) }),
        h('div', { class: 'rbody' }, [
          h('h3', {}, [info.emoji + ' ' + info.name, h('span', { class: 'chipsm', style: 'background:' + STATUS[f.st.status][1], text: STATUS[f.st.status][0] }), h('span', { class: 'appl', text: app.name })]),
          h('p', { text: reasonText(p, f) }),
          h('div', { class: 'row' }, [
            app.path ? h('a', { class: 'btn small alt', href: '../' + app.path + (app.deepLink ? '#skill=' + f.skill : ''), text: '▶ Practice in the app' }) : null,
            (function () { var b = h('button', { class: 'btn small', text: '📋 Copy quiz prompt' }); b.onclick = function () { copyText(prompt, b); }; return b; })(),
            h('button', { class: 'btn small alt', text: '👁 Preview prompt', onclick: function () { if (shown.hasAttribute('hidden')) { shown.removeAttribute('hidden'); if (!shown.firstChild) shown.appendChild(copybox(prompt, 'Quiz prompt for ' + info.name)); } else shown.setAttribute('hidden', ''); } })
          ]), shown
        ])
      ]));
    });
    if (nu.length && foc.length < 3) fc.appendChild(h('div', { class: 'flag', html: '<b>Try next:</b> ' + nu.map(function (x) { var i = KP.skillInfo(x.app, x.skill); return i.emoji + ' ' + i.name; }).join(' · ') }));
    if (str.length) fc.appendChild(h('div', { class: 'flag ok' }, [h('b', { text: '🌟 Going well: ' }), str.slice(0, 5).map(function (x) { return KP.skillInfo(x.app, x.skill).name + ' (' + pct(x.st.acc) + ')'; }).join(' · ')]));
    page.appendChild(fc);
    // chart + by app
    var ch = h('section', { class: 'card' }, [h('h2', { text: '📈 Practice over time' }), h('div', { class: 'legend', html: '<i style="background:#1F9D55"></i>80%+ on own <i style="background:#E0A100"></i>60-79% <i style="background:#D9534F"></i>under 60% <i style="background:#9FB3C8"></i>only guided practice' })]);
    var cdiv = h('div', { class: 'chartwrap', html: dayChart(p.id, days || 30) }); ch.appendChild(cdiv);
    var apps = {}; rowsR.forEach(function (r) { (apps[r.a] = apps[r.a] || []).push(r); });
    var cards = Object.keys(apps).map(function (a) { var rr = apps[a], att = rr.filter(function (r) { return r.m !== 'try'; }); var ap = KP.appInfo(a); return h('div', { class: 'tile wide' }, [h('b', { text: ap.emoji + ' ' + ap.name }), h('small', { text: rr.length + ' questions · ' + (att.length ? pct(att.filter(ownOK).length / att.length) + ' on own' : 'guided only') })]); });
    if (cards.length) ch.appendChild(h('div', { class: 'tiles small' }, cards));
    if (!rowsR.length) ch.appendChild(h('p', { class: 'sub', text: 'Nothing practiced in this time range.' }));
    page.appendChild(ch);
    // skill map + table
    page.appendChild(skillSection(p, rowsAll));
    // prompt lab
    page.appendChild(promptLab(p, rowsAll, foc));
    // teacher summary
    var sumTxt = teacherSummary(p, days);
    page.appendChild(h('section', { class: 'card' }, [h('h2', { text: '📝 Summary to share (teacher or family)' }), h('p', { class: 'sub', text: 'Copy this into an email or message, or print the whole page.' }), copybox(sumTxt, 'Progress summary'), h('div', { class: 'row' }, [h('button', { class: 'btn alt', text: '🖨️ Print this page', onclick: function () { window.print(); } })])]));
    // tools
    page.appendChild(tools(p));
    return page;
  }
  function tile(ic, v, l, note, cls) { return h('div', { class: 'tile big' }, [h('div', { class: 'ti', text: ic }), h('b', { text: String(v) }), h('small', { text: l }), note ? h('em', { class: cls || '', text: note }) : null]); }

  function skillSection(p, rowsAll) {
    var sec = h('section', { class: 'card' }, [h('h2', { text: '🧠 Skill by skill' }), h('p', { class: 'sub', text: '"On own" counts only questions answered correctly on the first try with no hints. Guided practice (Try it) is not counted. Tap a row for details.' })]);
    var map = bySkill(rowsAll), apps = appsFor(p, rowsAll);
    if (!apps.length) { sec.appendChild(h('p', { text: 'No skills to show yet.' })); return sec; }
    apps.forEach(function (aid) {
      var app = KP.appInfo(aid), ids = Object.keys(app.skills);
      var stats = {}; ids.forEach(function (s) { stats[s] = skillStat(map[aid + '|' + s] || []); });
      Object.keys(map).forEach(function (k) { var pp = k.split('|'); if (pp[0] === aid && !stats[pp[1]]) { stats[pp[1]] = skillStat(map[k]); ids.push(pp[1]); } });
      ids.sort(function (a, b) { return ((app.skills[a] || {}).order || 0) - ((app.skills[b] || {}).order || 0); });
      sec.appendChild(h('h3', { class: 'apph', text: app.emoji + ' ' + app.name }));
      // heat map
      var heat = h('div', { class: 'heat' }), groups = {}; ids.forEach(function (s) { var g = KP.skillInfo(aid, s).group; (groups[g] = groups[g] || []).push(s); });
      Object.keys(groups).forEach(function (g) {
        var gi = h('div', { class: 'hg' }, [h('small', { text: g })]), sq = h('div', { class: 'sqs' });
        groups[g].forEach(function (s) { var st = stats[s], info = KP.skillInfo(aid, s); sq.appendChild(h('button', { class: 'sq', style: 'background:' + STATUS[st.status][1], title: info.name + ': ' + STATUS[st.status][0] + (st.acc != null ? ' (' + pct(st.acc) + ')' : ''), text: info.emoji, onclick: function () { view.open[aid + '|' + s] = true; render(); setTimeout(function () { var el = document.getElementById('row-' + aid + '-' + s); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 30); } })); });
        gi.appendChild(sq); heat.appendChild(gi);
      });
      sec.appendChild(heat);
      sec.appendChild(h('div', { class: 'legend', html: Object.keys(STATUS).map(function (k) { return '<i style="background:' + STATUS[k][1] + '"></i>' + STATUS[k][0]; }).join(' ') }));
      var tbl = h('div', { class: 'tbl' });
      tbl.appendChild(h('div', { class: 'tr th' }, ['Skill', 'Status', 'On own', 'Tries', 'Hints', 'Speed', 'Trend'].map(function (t) { return h('div', { text: t }); })));
      var lastG = '';
      ids.forEach(function (s) {
        var st = stats[s], info = KP.skillInfo(aid, s), key = aid + '|' + s;
        if (info.group !== lastG) { lastG = info.group; if (Object.keys(groups).length > 1) tbl.appendChild(h('div', { class: 'gh', text: (info.groupEmoji || '') + ' ' + info.group })); }
        var row = h('div', { class: 'tr row' + (view.open[key] ? ' open' : ''), id: 'row-' + aid + '-' + s, onclick: function () { view.open[key] = !view.open[key]; render(); } }, [
          h('div', { class: 'nm', text: info.emoji + ' ' + info.name }),
          h('div', {}, [h('span', { class: 'chipsm', style: 'background:' + STATUS[st.status][1], text: STATUS[st.status][0] })]),
          h('div', { class: 'accbar' }, [st.acc == null ? '–' : h('div', {}, [h('i', { style: 'width:' + Math.round(st.acc * 100) + '%;background:' + STATUS[st.status][1] }), h('span', { text: pct(st.acc) })])]),
          h('div', { text: st.ni ? String(st.ni) : '–' }), h('div', { text: st.ni ? pct(st.hintRate) : '–' }), h('div', { text: st.avgMs ? Math.round(st.avgMs / 1000) + 's' : '–' }),
          h('div', { class: 'trend', text: st.trend == null ? '–' : st.trend >= 0.15 ? '↗' : st.trend <= -0.15 ? '↘' : '→' })
        ]);
        tbl.appendChild(row);
        if (view.open[key]) tbl.appendChild(detail(p, aid, s, st));
      });
      sec.appendChild(tbl);
    });
    return sec;
  }
  function detail(p, aid, s, st) {
    var info = KP.skillInfo(aid, s), app = KP.appInfo(aid), d = h('div', { class: 'detail' });
    if (!st.ni) d.appendChild(h('p', { text: 'Not practiced yet.' }));
    var tg = Object.keys(st.tags).sort(function (a, b) { return st.tags[b] - st.tags[a]; });
    if (tg.length) d.appendChild(h('div', {}, [h('b', { text: 'Common mistakes' }), h('ul', {}, tg.slice(0, 4).map(function (t) { return h('li', { text: t + ' (' + st.tags[t] + '×)' }); }))]));
    if (st.misses.length) d.appendChild(h('div', {}, [h('b', { text: 'Recent misses' }), h('ul', { class: 'miss' }, st.misses.map(function (r) { return h('li', {}, [h('span', { text: r.q }), h('em', { text: (r.g ? 'Answered ' + r.g + '. ' : '') + (r.c ? 'Correct: ' + r.c + '. ' : '') + (r.w || '') })]); }))]));
    if (info.method) d.appendChild(h('p', { class: 'method', text: 'Teacher\'s method: ' + info.method }));
    var prompt = buildPrompt(p, [{ app: aid, skill: s, stat: st }]);
    d.appendChild(h('div', { class: 'row' }, [
      app.path ? h('a', { class: 'btn small alt', href: '../' + app.path + (app.deepLink ? '#skill=' + s : ''), text: '▶ Practice in the app', onclick: function (e) { e.stopPropagation(); } }) : null,
      (function () { var b = h('button', { class: 'btn small', text: '📋 Copy quiz prompt' }); b.onclick = function (e) { e.stopPropagation(); copyText(prompt, b); }; return b; })()
    ]));
    return d;
  }
  function promptLab(p, rowsAll, foc) {
    var sec = h('section', { class: 'card' }, [h('h2', { text: '🧪 Quiz prompt lab' }), h('p', { class: 'sub', text: 'Pick skills, copy the prompt, and paste it into any AI (Claude, ChatGPT, Gemini). It builds a quick interactive quiz that targets the exact mistakes ' + p.name + ' makes.' })]);
    var apps = appsFor(p, rowsAll), all = [], sel = {};
    apps.forEach(function (aid) { Object.keys(KP.apps[aid].skills).forEach(function (s) { all.push({ app: aid, skill: s }); }); });
    foc.slice(0, 3).forEach(function (f) { sel[f.app + '|' + f.skill] = true; });
    var count = 8, out = h('div'), chips = h('div', { class: 'chipsel' });
    var map = bySkill(rowsAll);
    function draw() {
      var items = all.filter(function (x) { return sel[x.app + '|' + x.skill]; }).map(function (x) { return { app: x.app, skill: x.skill, stat: skillStat(map[x.app + '|' + x.skill] || []) }; });
      out.innerHTML = '';
      if (!items.length) out.appendChild(h('p', { class: 'sub', text: 'Tap one or more skills above.' }));
      else out.appendChild(copybox(buildPrompt(p, items, { count: count }), 'Prompt for ' + items.length + ' skill' + (items.length === 1 ? '' : 's')));
    }
    function chipsDraw() {
      chips.innerHTML = '';
      all.forEach(function (x) { var info = KP.skillInfo(x.app, x.skill), on = sel[x.app + '|' + x.skill]; chips.appendChild(h('button', { class: 'pill' + (on ? ' on' : ''), text: info.emoji + ' ' + info.name, onclick: function () { sel[x.app + '|' + x.skill] = !on; chipsDraw(); draw(); } })); });
    }
    var cnt = h('select', { 'aria-label': 'Number of questions', onchange: function () { count = +this.value; draw(); } }, [6, 8, 10, 12].map(function (n) { var o = h('option', { value: n, text: n + ' questions' }); if (n === 8) o.selected = true; return o; }));
    sec.appendChild(h('div', { class: 'row' }, [h('button', { class: 'btn small alt', text: '🎯 Use top 3 focus skills', onclick: function () { sel = {}; foc.slice(0, 3).forEach(function (f) { sel[f.app + '|' + f.skill] = true; }); chipsDraw(); draw(); } }), h('button', { class: 'btn small alt', text: 'Clear', onclick: function () { sel = {}; chipsDraw(); draw(); } }), cnt]));
    sec.appendChild(chips); sec.appendChild(out); chipsDraw(); draw();
    return sec;
  }
  function tools(p) {
    var sec = h('section', { class: 'card tools' }, [h('h2', { text: '⚙️ Tools' })]);
    // move progress
    var code = '', exp = h('div');
    sec.appendChild(h('div', { class: 'tool' }, [h('h3', { text: 'Move progress to another device' }), h('p', { class: 'sub', text: 'Progress lives in this browser only. To see it on another phone or computer: copy the code here, then paste it into "Import" on the dashboard there.' }),
      h('button', { class: 'btn small', text: 'Make export code', onclick: function () { exp.innerHTML = ''; exp.appendChild(copybox(Hub.exportCode(), 'Export code (all players)')); } }), exp,
      h('textarea', { id: 'imp', rows: 3, placeholder: 'Paste an export code here (starts with KP1:)', 'aria-label': 'Import code' }),
      h('button', { class: 'btn small alt', text: 'Import', onclick: function () { try { var n = Hub.importCode(document.getElementById('imp').value); alert('Imported ' + n + ' new answers.'); D = Hub.data(); render(); } catch (e) { alert(e.message || 'Could not read that code.'); } } })]));
    // PIN
    var has = Hub.setting('pin');
    sec.appendChild(h('div', { class: 'tool' }, [h('h3', { text: 'Grown-up PIN' }), h('p', { class: 'sub', text: 'Optional 4-digit PIN so kids cannot open this page. It is a speed bump, not high security.' }),
      has ? h('button', { class: 'btn small alt', text: 'Remove PIN', onclick: function () { Hub.setting('pin', ''); render(); } }) : h('button', { class: 'btn small', text: 'Set a PIN', onclick: function () { var v = prompt('Choose a 4-digit PIN'); if (v && /^\d{4}$/.test(v)) { Hub.setting('pin', hash(v)); sessionStorage.setItem('kp-ok', '1'); render(); } else if (v) alert('Please use exactly 4 digits.'); } })]));
    // delete
    sec.appendChild(h('div', { class: 'tool danger' }, [h('h3', { text: 'Remove ' + p.name }), h('p', { class: 'sub', text: 'Deletes this player and all of their progress from this browser. Export first if you might want it back.' }), h('button', { class: 'btn small danger', text: 'Delete ' + p.name + "'s data", onclick: function () { if (confirm('Delete ' + p.name + ' and all of their progress? This cannot be undone.') && confirm('Really delete? Last chance.')) { Hub.removeProfile(p.id); D = Hub.data(); view.tab = 'overview'; render(); } } })]));
    return sec;
  }

  // ---------- PIN gate
  function hash(s) { var x = 5381; for (var i = 0; i < s.length; i++) x = ((x << 5) + x + s.charCodeAt(i)) | 0; return 'h' + (x >>> 0).toString(36); }
  function gate() {
    var pin = Hub.setting('pin');
    if (demo || !pin || sessionStorage.getItem('kp-ok') === '1') return start();
    var g = document.getElementById('gate'); g.hidden = false; root.style.display = 'none';
    var inp = h('input', { type: 'password', inputmode: 'numeric', maxlength: '4', placeholder: '••••', 'aria-label': 'PIN' }), msg = h('div', { class: 'msg' });
    function tryIt() { if (hash(inp.value) === pin) { sessionStorage.setItem('kp-ok', '1'); g.hidden = true; root.style.display = ''; start(); } else { msg.textContent = 'Not quite. Try again.'; inp.value = ''; } }
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryIt(); }); inp.addEventListener('input', function () { if (inp.value.length === 4) tryIt(); });
    g.appendChild(h('div', { class: 'gatebox' }, [h('h2', { text: '🔒 Grown-ups only' }), h('p', { text: 'Enter your 4-digit PIN.' }), inp, msg, h('a', { href: '../', class: 'back', text: '← Back to the hub' })]));
    setTimeout(function () { inp.focus(); }, 50);
  }
  function start() { if (D.profiles.length && view.tab === 'overview' && D.profiles.length === 1) view.tab = D.profiles[0].id; render(); }

  // ---------- sample data (demo=1): never saved
  function makeDemo() {
    var d = { profiles: [{ id: 'dA', name: 'Ensley', grade: 2, emoji: '🦀' }, { id: 'dB', name: 'Maya', grade: 6, emoji: '🥷' }], log: [], sessions: [] }, now = Date.now();
    function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
    var weak = { 'int-sub': .38, 'frac-div': .42, 'dec-mul': .5, 'eq-2step': .48, 'ineq-solve': .4, 'prop-solve': .55, 'fin-pctfrom': .45, 'geo-circle': .6, 'frac-addsub': .6, 'dec-div': .55 };
    var strong = { 'int-add': .93, 'int-abs': .95, 'stat-mean': .9, 'geo-area-basic': .88, 'eq-1step': .9, 'fin-vocab': .92, 'stat-median': .86 };
    var mathIds = MD.skills.map(function (s) { return s.id; });
    for (var day = 27; day >= 0; day--) {
      if (Math.random() < 0.28) continue;
      var t0 = now - day * DAY - Math.random() * 3 * 3600000, nq = 8 + Math.floor(Math.random() * 26), prog = 1 - day / 40, t = t0, sMs = 0;
      for (var i = 0; i < nq; i++) {
        var id = pick(mathIds), base = weak[id] || strong[id] || (.62 + Math.random() * .2), acc = Math.min(.97, base + prog * .12), mode = pick(['try', 'pick', 'pick', 'type', 'mission']), ms = 6000 + Math.random() * 22000;
        t += ms; sMs += ms; var ok = Math.random() < acc, q = MD.make(id), r = { t: Math.round(t), p: 'dB', a: 'math-dojo', s: id, ok: ok ? 1 : 0, h: (mode === 'try' || (Math.random() < .12)) ? 1 : 0, ms: Math.round(ms), m: mode };
        if (!ok) { var tr = q.traps.length ? pick(q.traps) : { v: '0', w: '' }; r.g = tr.v; r.c = q.answer; r.q = q.prompt.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140); if (tr.w) r.w = tr.w; }
        d.log.push(r);
      }
      d.sessions.push({ t: Math.round(t0), p: 'dB', a: 'math-dojo', s: '', m: 'pick', n: nq, ok: 0, ms: Math.round(sMs + 60000) });
      if (Math.random() < 0.5) {
        var sk = ['subject', 'predicate', 'snip', 'cf', 'fix', 'match', 'build'], tm = t0 - 4 * 3600000, sm = 0, n2 = 6 + Math.floor(Math.random() * 8), q2 = ['Is "Ran to the park" a sentence or a fragment?', 'Find the complete subject: "The small brown dog barked loudly."', 'Find the complete predicate: "My best friend plays soccer."', 'Fix the fragment: "The cold wind"'];
        for (var j = 0; j < n2; j++) { var s2 = pick(sk), a2 = { subject: .8, predicate: .55, snip: .7, cf: .5, fix: .6, match: .85, build: .75 }[s2] + prog * .12, m2 = 5000 + Math.random() * 15000; tm += m2; sm += m2; var ok2 = Math.random() < a2; var rr = { t: Math.round(tm), p: 'dA', a: 'snippys-sentence-shore', s: s2, ok: ok2 ? 1 : 0, h: Math.random() < .15 ? 1 : 0, ms: Math.round(m2), m: 'L' + (1 + (j % 5)) + 'w2' }; if (!ok2) { rr.q = pick(q2); rr.w = pick(['sort-piece-as-whole:nosubj', 'sort-whole-as-piece', 'picked-only-the-noun', 'left-out-describing-words']); rr.g = '(wrong choice)'; } d.log.push(rr); }
        d.sessions.push({ t: Math.round(t0 - 4 * 3600000), p: 'dA', a: 'snippys-sentence-shore', s: 'L1', m: 'w2', n: n2, ok: 0, ms: Math.round(sm + 30000) });
      }
    }
    d.log.sort(function (a, b) { return a.t - b.t; });
    return d;
  }

  gate();
  window.KPDash = { render: render, view: view, setData: function (x) { D = x; } };
})();
