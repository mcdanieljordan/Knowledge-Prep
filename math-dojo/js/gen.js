/* Math Dojo question generators. Every call makes a fresh question.
   A question: { skill, prompt(html), answer(string), traps:[{v,w}], steps:[html], why, mc?, choices?, alg?, lowest?, meta } */
(function () {
  var MD = window.MD = window.MD || {};
  var G = MD.gen = {};
  var MINUS = '−';

  function R(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function S(n) { return n < 0 ? MINUS + Math.abs(n) : String(n); }
  function P(n) { return n < 0 ? '(' + MINUS + Math.abs(n) + ')' : String(n); }
  function F(n, d) { return '<span class="fr"><i>' + S(n) + '</i><b>' + d + '</b></span>'; }
  function fx(x, dp) { return String(parseFloat((+x).toFixed(dp == null ? 4 : dp))); }
  function money(x) { return '$' + (Math.abs(x - Math.round(x)) < 1e-9 ? Math.round(x).toLocaleString('en-US') : x.toFixed(2)); }
  function plain(n) { return String(n).replace(/−/g, '-'); }
  // rationals
  function fr(n, d) { if (d < 0) { n = -n; d = -d; } var g = gcd(n, d); return { n: n / g, d: d / g }; }
  function fstr(f) { return f.d === 1 ? String(f.n) : f.n + '/' + f.d; }
  function fadd(a, b) { return fr(a.n * b.d + b.n * a.d, a.d * b.d); }
  function fsub(a, b) { return fr(a.n * b.d - b.n * a.d, a.d * b.d); }
  function fmul(a, b) { return fr(a.n * b.n, a.d * b.d); }
  function fdiv(a, b) { return fr(a.n * b.d, a.d * b.n); }
  function FH(f) { return f.d === 1 ? S(f.n) : F(f.n, f.d); }
  function cmpf(a, b) { return a.n * b.d - b.n * a.d; }

  function Q(skill, prompt, answer, o) {
    o = o || {};
    var seen = {}, traps = [];
    var ansKey = MD.keyOf(answer, o);
    seen[ansKey] = 1;
    (o.traps || []).forEach(function (t) {
      if (t == null || t[0] == null) return;
      var v = typeof t[0] === 'number' ? fx(t[0], 4) : String(t[0]);
      var k = MD.keyOf(v, o);
      if (k == null || seen[k] || (typeof t[0] === 'number' && !isFinite(t[0]))) return;
      seen[k] = 1; traps.push({ v: plain(v), w: t[1] });
    });
    return { skill: skill, money: o.unit === 'dollars' || /^\$/.test(String(answer)), pct: /%$/.test(String(answer)), prompt: prompt, answer: plain(String(answer)), traps: traps, steps: o.steps || [], why: o.why || '', mc: !!o.mc, choices: o.choices || null, alg: o.alg || null, lowest: !!o.lowest, unit: o.unit || '', ask: o.ask || '', meta: o.meta || null };
  }

  // ---------- parsing / checking (shared by the app and the tests)
  MD.parseNum = function (str) {
    var s = String(str == null ? '' : str).replace(/[−–—]/g, '-').replace(/[$,%]/g, '').trim();
    var m = s.match(/^(-?)(\d+)\s+(\d+)\/(\d+)$/);
    if (m) { var w = +m[2], n = +m[3], d = +m[4]; if (!d) return null; return { v: (m[1] ? -1 : 1) * (w + n / d), frac: true, n: (m[1] ? -1 : 1) * (w * d + n), d: d }; }
    s = s.replace(/\s+/g, '');
    m = s.match(/^(-?\d+)\/(\d+)$/);
    if (m) { var dd = +m[2]; if (!dd) return null; return { v: +m[1] / dd, frac: true, n: +m[1], d: dd }; }
    if (/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return { v: parseFloat(s), frac: false };
    return null;
  };
  MD.parseLinear = function (str) {
    var s = String(str || '').toLowerCase().replace(/[−–]/g, '-').replace(/[\s*]/g, '');
    if (!s || !/^[0-9x+\-.]+$/.test(s)) return null;
    if (!/^[+-]/.test(s)) s = '+' + s;
    var terms = s.match(/[+-][^+-]+/g); if (!terms || terms.join('') !== s) return null;
    var x = 0, c = 0;
    for (var i = 0; i < terms.length; i++) {
      var sg = terms[i][0] === '-' ? -1 : 1, body = terms[i].slice(1);
      if (body.slice(-1) === 'x') { var co = body.slice(0, -1); co = co === '' ? 1 : parseFloat(co); if (isNaN(co)) return null; x += sg * co; }
      else { var v = parseFloat(body); if (isNaN(v)) return null; c += sg * v; }
    }
    return { x: x, c: c };
  };
  function normIneq(str) {
    var s = String(str || '').toLowerCase().replace(/[−–]/g, '-').replace(/\s+/g, '').replace(/>=/g, '≥').replace(/<=/g, '≤');
    var m = s.match(/^(-?[\d.]+)([<>≤≥])x$/);
    if (m) { var flip = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' }; s = 'x' + flip[m[2]] + m[1]; }
    var mm = s.match(/^x([<>≤≥])(-?[\d.]+)$/);
    return mm ? 'x' + mm[1] + parseFloat(mm[2]) : s;
  }
  MD.keyOf = function (v, q) {
    q = q || {};
    if (q.alg === 'ineq') return normIneq(v);
    if (q.alg === 'expr') { var l = MD.parseLinear(v); return l ? 'e' + l.x + ',' + l.c : String(v).toLowerCase(); }
    if (q.alg === 'text') return String(v).toLowerCase().trim();
    var p = MD.parseNum(v); return p ? 'n' + (Math.round(p.v * 1e6) / 1e6) : String(v).toLowerCase().trim();
  };
  /* returns {ok, why, bad} */
  MD.check = function (q, input) {
    var key = MD.keyOf(input, q), res = { ok: false, why: '' };
    if (key === MD.keyOf(q.answer, q)) {
      res.ok = true;
      if (q.lowest && !q.alg) { var p = MD.parseNum(input); if (p && p.frac && gcdAbs(p.n, p.d) > 1) { res.ok = false; res.why = 'Right value, but it can still be simplified'; res.close = true; } }
      return res;
    }
    for (var i = 0; i < q.traps.length; i++) if (MD.keyOf(q.traps[i].v, q) === key) { res.why = q.traps[i].w; break; }
    return res;
  };
  function gcdAbs(a, b) { return gcd(a, b); }
  /* nice display text for a numeric answer: $ and commas for money, % for percents */
  MD.fmtAns = function (q, t) {
    var p = MD.parseNum(t); if (!p || p.frac || q.alg || q.mc) return t;
    var neg = p.v < 0 ? '-' : '', a = Math.abs(p.v), s = a >= 1000 ? a.toLocaleString('en-US', { maximumFractionDigits: 4 }) : String(parseFloat(a.toFixed(4)));
    if (q.money) { if (a < 1000 && /\./.test(s) && s.split('.')[1].length < 2) s += '0'; return neg + '$' + s; }
    if (q.pct) return neg + s + '%';
    return a >= 1000 ? neg + s : t;
  };
  /* build multiple-choice options: [{t, ok, w}] shuffled */
  MD.choicesFor = function (q, n) {
    var out = MD.choicesRaw(q, n);
    if (!q.choices) out.forEach(function (c) { c.t = MD.fmtAns(q, c.t); });
    return out;
  };
  MD.choicesRaw = function (q, n) {
    n = n || 4;
    if (q.choices) return shuffle(q.choices);
    var out = [{ t: q.answer, ok: true }], used = {}; used[MD.keyOf(q.answer, q)] = 1;
    q.traps.forEach(function (t) { var k = MD.keyOf(t.v, q); if (out.length < n && !used[k]) { used[k] = 1; out.push({ t: t.v, ok: false, w: t.w }); } });
    var p = MD.parseNum(q.answer), tries = 0;
    while (out.length < n && p && tries++ < 60) {
      var cand;
      if (p.frac) { var nn = p.n + pick([-2, -1, 1, 2]), dd = p.d + pick([-1, 0, 1]); if (dd < 2 || nn <= 0) continue; cand = nn + '/' + dd; }
      else { var d = pick([1, 2, 3, 5, 10]) * pick([-1, 1]); cand = fx(p.v + d, 4); if (Math.abs(p.v) >= 20 && Math.random() < 0.4) cand = fx(p.v * pick([0.5, 2, 10, 0.1]), 4); }
      var k2 = MD.keyOf(cand, q); if (!used[k2]) { used[k2] = 1; out.push({ t: cand, ok: false }); }
    }
    return shuffle(out);
  };

  // ---------- SVG helpers
  var INK = '#1E3A5F', FILL = '#CFEBF5', FILL2 = '#FFE2A8';
  function svg(w, h, inner) { return '<svg class="fig" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" font-family="Fredoka,Andika,sans-serif" font-size="15" fill="' + INK + '">' + inner + '</svg>'; }
  function txt(x, y, t, anchor) { return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'middle') + '" font-weight="600">' + t + '</text>'; }
  function figTri(b, h) { return svg(250, 150, '<polygon points="20,120 220,120 120,25" fill="' + FILL + '" stroke="' + INK + '" stroke-width="3"/><line x1="120" y1="25" x2="120" y2="120" stroke="#FF6F59" stroke-width="2.5" stroke-dasharray="6 4"/><rect x="120" y="108" width="12" height="12" fill="none" stroke="#FF6F59" stroke-width="2"/>' + txt(120, 142, 'b = ' + b) + txt(150, 78, 'h = ' + h, 'start')); }
  function figPara(b, h, s) { return svg(270, 150, '<polygon points="30,120 190,120 240,30 80,30" fill="' + FILL + '" stroke="' + INK + '" stroke-width="3"/><line x1="80" y1="30" x2="80" y2="120" stroke="#FF6F59" stroke-width="2.5" stroke-dasharray="6 4"/><rect x="80" y="108" width="12" height="12" fill="none" stroke="#FF6F59" stroke-width="2"/>' + txt(110, 142, 'b = ' + b) + txt(88, 80, 'h = ' + h, 'start') + txt(228, 80, 's = ' + s, 'start')); }
  function figRect(l, w) { return svg(250, 150, '<rect x="30" y="25" width="190" height="95" fill="' + FILL + '" stroke="' + INK + '" stroke-width="3"/>' + txt(125, 142, 'length = ' + l) + txt(125, 78, 'width = ' + w)); }
  function figTrap(b1, b2, h) { return svg(270, 160, '<polygon points="20,125 240,125 190,30 70,30" fill="' + FILL + '" stroke="' + INK + '" stroke-width="3"/><line x1="70" y1="30" x2="70" y2="125" stroke="#FF6F59" stroke-width="2.5" stroke-dasharray="6 4"/><rect x="70" y="113" width="12" height="12" fill="none" stroke="#FF6F59" stroke-width="2"/>' + txt(130, 22, 'b1 = ' + b1) + txt(130, 148, 'b2 = ' + b2) + txt(78, 82, 'h = ' + h, 'start')); }
  function figCircle(label, isDiam) { return svg(230, 160, '<circle cx="115" cy="80" r="58" fill="' + FILL + '" stroke="' + INK + '" stroke-width="3"/>' + (isDiam ? '<line x1="57" y1="80" x2="173" y2="80" stroke="#FF6F59" stroke-width="3"/>' : '<line x1="115" y1="80" x2="173" y2="80" stroke="#FF6F59" stroke-width="3"/>') + '<circle cx="115" cy="80" r="3.5" fill="' + INK + '"/>' + txt(115, 70, label)); }
  function figRectTri(w, h, t) { return svg(260, 170, '<rect x="40" y="85" width="180" height="65" fill="' + FILL + '" stroke="' + INK + '" stroke-width="3"/><polygon points="40,85 220,85 130,25" fill="' + FILL2 + '" stroke="' + INK + '" stroke-width="3"/><line x1="130" y1="25" x2="130" y2="85" stroke="#FF6F59" stroke-width="2.5" stroke-dasharray="6 4"/>' + txt(130, 166, 'w = ' + w) + txt(34, 122, 'h = ' + h, 'end') + txt(138, 60, 't = ' + t, 'start')); }
  function figTwoRect(a, b, c, d) { return svg(270, 150, '<rect x="20" y="30" width="140" height="90" fill="' + FILL + '" stroke="' + INK + '" stroke-width="3"/><rect x="160" y="65" width="90" height="55" fill="' + FILL2 + '" stroke="' + INK + '" stroke-width="3"/>' + txt(90, 80, 'A: ' + a + ' × ' + b) + txt(205, 98, 'B: ' + c + ' × ' + d)); }
  function numline(v, closed, right) {
    var x0 = 30, step = 32, y = 38, out = '<line x1="14" y1="' + y + '" x2="286" y2="' + y + '" stroke="' + INK + '" stroke-width="3"/>';
    var cx = x0 + 4 * step + 14;
    for (var i = -4; i <= 4; i++) { var x = cx + i * step; out += '<line x1="' + x + '" y1="' + (y - 7) + '" x2="' + x + '" y2="' + (y + 7) + '" stroke="' + INK + '" stroke-width="2"/>' + txt(x, y + 26, S(v + i)); }
    out += '<line x1="' + cx + '" y1="' + (y - 11) + '" x2="' + (right ? 284 : 16) + '" y2="' + (y - 11) + '" stroke="#FF6F59" stroke-width="5"/>';
    out += '<polygon points="' + (right ? '284,' + (y - 18) + ' 296,' + (y - 11) + ' 284,' + (y - 4) : '16,' + (y - 18) + ' 4,' + (y - 11) + ' 16,' + (y - 4)) + '" fill="#FF6F59"/>';
    out += '<circle cx="' + cx + '" cy="' + (y - 11) + '" r="8" fill="' + (closed ? INK : '#fff') + '" stroke="' + INK + '" stroke-width="3"/>';
    return svg(300, 78, out);
  }

  // =============== WORLD 1: INTEGERS
  G['int-abs'] = function () {
    var t = R(0, 3), a = R(2, 19), sg = pick([-1, 1]);
    if (t === 0) return Q('int-abs', 'What is <b>|' + S(-a) + '|</b> ?', a, { traps: [[-a, 'Absolute value is a distance, so it is never negative']], steps: ['Absolute value = distance from zero.', 'Distance can\'t be negative: ' + a + ' steps.'], why: '|' + S(-a) + '| = ' + a });
    if (t === 1) return Q('int-abs', 'What is the <b>opposite</b> of ' + S(sg * a) + ' ?', -sg * a, { traps: [[sg * a, 'The opposite flips the sign'], [0, 'Opposites are on opposite sides of zero, not at zero']], steps: ['Opposites are the same distance from zero.', 'They are on opposite sides.'], why: 'The opposite of ' + S(sg * a) + ' is ' + S(-sg * a) });
    if (t === 2) { var b = R(2, 19); while (b === a) b = R(2, 19); var x = -a, y = b, big = a > b ? x : y; return Q('int-abs', 'Which number has the <b>greater absolute value</b>: ' + S(x) + ' or ' + S(y) + ' ?', big, { traps: [[big === x ? y : x, 'Compare the distances from zero, ignore the sign']], steps: ['|' + S(x) + '| = ' + a + ' and |' + y + '| = ' + y, 'Bigger distance: ' + Math.max(a, b)], why: 'Greater absolute value is ' + S(big) });
    }
    var c = R(2, 12), d = R(2, 12); return Q('int-abs', 'What is <b>|' + S(-c) + '| + |' + d + '|</b> ?', c + d, { traps: [[d - c, 'You added the signed numbers. Take each absolute value first'], [-(c + d), 'Absolute values are positive']], steps: ['|' + S(-c) + '| = ' + c, '|' + d + '| = ' + d, c + ' + ' + d + ' = ' + (c + d)], why: c + ' + ' + d + ' = ' + (c + d) });
  };
  G['int-compare'] = function () {
    var set = {}, arr = []; while (arr.length < 4) { var v = R(-15, 15); if (!set[v]) { set[v] = 1; arr.push(v); } }
    var sorted = arr.slice().sort(function (a, b) { return a - b; });
    var least = Math.random() < 0.5, ans = least ? sorted[0] : sorted[3];
    var negs = arr.filter(function (v) { return v < 0; });
    var tr = [];
    if (least && negs.length >= 2) tr.push([negs.sort(function (a, b) { return b - a; })[0], 'Negatives are tricky: −11 is LESS than −3 because it is farther left']);
    else tr.push([arr.slice().sort(function (a, b) { return Math.abs(a) - Math.abs(b); })[least ? 3 : 0], 'Check the number line: right is greater, left is less']);
    tr.push([least ? sorted[3] : sorted[0], 'That is the opposite end of the number line']);
    return Q('int-compare', 'Which number is the <b>' + (least ? 'LEAST' : 'GREATEST') + '</b>?<div class="big">' + shuffle(arr).map(S).join(', &nbsp; ') + '</div>', ans, { traps: tr, steps: ['Picture the number line. Right = greater.', 'Order them: ' + sorted.map(S).join(', '), (least ? 'Least' : 'Greatest') + ' = ' + S(ans)], why: 'In order: ' + sorted.map(S).join(' < '), meta: { arr: arr, least: least } });
  };
  G['int-add'] = function () {
    var a, b; do { a = R(-15, 15); b = R(-15, 15); } while (!a || !b || (a === -b));
    var ans = a + b, same = (a < 0) === (b < 0), A = Math.abs(a), B = Math.abs(b), tr = [], st = [];
    if (same) { tr.push([-ans, 'Same signs keep their sign: negatives stay negative']); tr.push([Math.abs(A - B), 'Signs are the same, so ADD the sizes']); st = ['Are the signs the same? <b>Yes</b>.', 'Add like normal: ' + A + ' + ' + B + ' = ' + (A + B), 'Keep the ' + (a < 0 ? 'negative' : 'positive') + ' sign: <b>' + S(ans) + '</b>']; }
    else { tr.push([A + B, 'Signs are different, so take the DIFFERENCE, not the sum']); tr.push([-ans, 'Use the sign of the BIGGER size, not the smaller']); st = ['Are the signs the same? <b>No</b>.', 'Difference of sizes: ' + Math.max(A, B) + ' − ' + Math.min(A, B) + ' = ' + Math.abs(A - B), 'Bigger size is ' + Math.max(A, B) + ' (it is ' + (A > B ? (a < 0 ? 'negative' : 'positive') : (b < 0 ? 'negative' : 'positive')) + '): <b>' + S(ans) + '</b>']; }
    return Q('int-add', '<b>' + S(a) + ' + ' + P(b) + '</b> = ?', ans, { traps: tr, steps: st, why: S(a) + ' + ' + P(b) + ' = ' + S(ans), meta: { a: a, b: b } });
  };
  G['int-sub'] = function () {
    var a, b; do { a = R(-15, 15); b = R(-15, 15); } while (!a || !b || a === b);
    if (Math.random() < 0.55 && b > 0) b = -b;
    var ans = a - b;
    return Q('int-sub', '<b>' + S(a) + ' − ' + P(b) + '</b> = ?', ans, { traps: [[a + b, 'Forgot to FLIP the sign of the second number'], [b - a, 'Subtracted in the wrong order: keep the FIRST number'], [-ans, 'Check the sign after you add']], steps: ['<b>K</b>eep ' + S(a), '<b>C</b>hange − to +', '<b>F</b>lip ' + S(b) + ' to ' + S(-b), 'Now add: ' + S(a) + ' + ' + P(-b) + ' = <b>' + S(ans) + '</b>'], why: S(a) + ' − ' + P(b) + ' = ' + S(a) + ' + ' + P(-b) + ' = ' + S(ans), meta: { a: a, b: b } });
  };
  G['int-muldiv'] = function () {
    var mul = Math.random() < 0.55, a, b, ans, p;
    if (mul) { do { a = R(-9, 9); b = R(-9, 9); } while (Math.abs(a) < 2 || Math.abs(b) < 2); ans = a * b; p = '<b>' + S(a) + ' × ' + P(b) + '</b> = ?'; }
    else { var q; do { q = R(-9, 9); b = R(-9, 9); } while (Math.abs(q) < 2 || Math.abs(b) < 2); a = q * b; ans = q; p = '<b>' + S(a) + ' ÷ ' + P(b) + '</b> = ?'; }
    var same = (a < 0) === (b < 0);
    return Q('int-muldiv', p, ans, { traps: [[-ans, same ? 'Signs the same means POSITIVE' : 'Signs different means NEGATIVE'], [Math.abs(ans) * (same ? -1 : 1) * 1, 'Check: are the signs the same?']], steps: ['Are the signs the same? <b>' + (same ? 'Yes' : 'No') + '</b>', (mul ? 'Multiply' : 'Divide') + ' the sizes: ' + Math.abs(a) + (mul ? ' × ' : ' ÷ ') + Math.abs(b) + ' = ' + Math.abs(ans), same ? 'Same signs → <b>positive</b>: ' + S(ans) : 'Different signs → <b>negative</b>: ' + S(ans)], why: S(a) + (mul ? ' × ' : ' ÷ ') + P(b) + ' = ' + S(ans), meta: { a: a, b: b, mul: mul } });
  };

  // =============== WORLD 2: RATIONAL NUMBERS
  var BENCH = [[1, 10, '0.1', '10'], [1, 8, '0.125', '12.5'], [1, 5, '0.2', '20'], [1, 4, '0.25', '25'], [3, 8, '0.375', '37.5'], [2, 5, '0.4', '40'], [1, 2, '0.5', '50'], [3, 5, '0.6', '60'], [3, 4, '0.75', '75']];
  G['rat-equiv'] = function () {
    if (Math.random() < 0.5) {
      var g = R(2, 7), n = R(1, 7), d = R(n + 1, 9); while (gcd(n, d) !== 1) { n = R(1, 7); d = R(n + 1, 9); }
      var an = n * g, ad = d * g, tr = [];
      for (var k = 2; k < g; k++) if (g % k === 0) tr.push([(n * g / k) + '/' + (d * g / k), 'Close! It can still be simplified more']);
      return Q('rat-equiv', 'Simplify: <b>' + F(an, ad) + '</b>', n + '/' + d, { lowest: true, traps: tr, steps: ['Find a number that goes into both ' + an + ' and ' + ad + '.', 'Divide top and bottom by ' + g + '.', an + ' ÷ ' + g + ' = ' + n + ' and ' + ad + ' ÷ ' + g + ' = ' + d], why: an + '/' + ad + ' = ' + n + '/' + d, meta: { n: an, d: ad } });
    }
    var n2 = R(1, 5), d2 = R(n2 + 1, 9), m = R(2, 6);
    return Q('rat-equiv', 'Fill in the blank: <b>' + F(n2, d2) + ' = ' + F('?', d2 * m) + '</b>', n2 * m, { traps: [[n2 + (d2 * m - d2), 'You ADDED. Expanding means MULTIPLY top and bottom by the same number'], [m, 'Multiply the top by the same number as the bottom']], steps: ['Bottom: ' + d2 + ' → ' + d2 * m + ' (× ' + m + ')', 'Do the same to the top: ' + n2 + ' × ' + m + ' = ' + n2 * m], why: n2 + '/' + d2 + ' = ' + n2 * m + '/' + d2 * m });
  };
  G['rat-convert'] = function () {
    var t = R(0, 4), b = pick(BENCH);
    if (t === 0) { var dec = pick(['0.35', '0.8', '0.07', '0.62', '0.9', '0.45', '0.04', '1.2']), pc = fx(parseFloat(dec) * 100, 2); return Q('rat-convert', 'Write <b>' + dec + '</b> as a percent.', pc + '%', { traps: [[fx(parseFloat(dec) * 10, 3) + '%', 'Decimal → percent moves the point TWO places right'], [fx(parseFloat(dec) * 1000, 2) + '%', 'Only two places: ×100'], [fx(parseFloat(dec) / 100, 5) + '%', 'Percent → decimal goes left. Decimal → percent goes right']], steps: ['Decimal → percent: × 100', 'Move the point 2 places right', '<b>' + pc + '%</b>'], why: dec + ' = ' + pc + '%' }); }
    if (t === 1) { var pc2 = pick(['45', '8', '72', '3', '60', '125', '6.5', '33']), d2 = fx(parseFloat(pc2) / 100, 5); return Q('rat-convert', 'Write <b>' + pc2 + '%</b> as a decimal.', d2, { traps: [[fx(parseFloat(pc2) / 10, 4), 'Percent → decimal: move the point TWO places left'], [fx(parseFloat(pc2) * 100, 3), 'Percent → decimal goes left (÷100)']], steps: ['Percent → decimal: ÷ 100', 'Move the point 2 places left', '<b>' + d2 + '</b>'], why: pc2 + '% = ' + d2 }); }
    if (t === 2) return Q('rat-convert', 'Write <b>' + F(b[0], b[1]) + '</b> as a percent. <small>(benchmark fraction!)</small>', b[3] + '%', { traps: [[b[0] + '%', 'The fraction needs converting: divide, then × 100'], [fx(parseFloat(b[2]) * 10, 3) + '%', 'Move the point two places']], steps: [b[0] + ' ÷ ' + b[1] + ' = ' + b[2], '× 100 → <b>' + b[3] + '%</b>'], why: b[0] + '/' + b[1] + ' = ' + b[2] + ' = ' + b[3] + '%' });
    if (t === 3) return Q('rat-convert', 'Write <b>' + b[3] + '%</b> as a fraction in simplest form.', b[0] + '/' + b[1], { lowest: true, traps: [[b[3] + '/100', 'Percent over 100 is right, now SIMPLIFY']], steps: ['Percent over 100: ' + b[3] + '/100', 'Simplify to <b>' + b[0] + '/' + b[1] + '</b>'], why: b[3] + '% = ' + b[0] + '/' + b[1] });
    return Q('rat-convert', 'Write <b>' + b[2] + '</b> as a fraction in simplest form.', b[0] + '/' + b[1], { lowest: true, traps: [[b[2].slice(2) + '/1' + new Array(b[2].length - 1).join('0'), 'Close! Simplify it']], steps: ['Place value: ' + b[2] + ' = ' + b[2].slice(2) + '/' + '1' + new Array(b[2].length - 1).join('0'), 'Simplify to <b>' + b[0] + '/' + b[1] + '</b>'], why: b[2] + ' = ' + b[0] + '/' + b[1] });
  };
  function decStr(x, dp) { return fx(x, dp); }
  G['dec-addsub'] = function () {
    var add = Math.random() < 0.55, dA = R(1, 2), dB = R(1, 2), A, B;
    A = R(120, 4999) / Math.pow(10, dA); B = R(11, 999) / Math.pow(10, dB);
    if (!add && B > A) { var t = A; A = B; B = t; }
    var ans = add ? A + B : A - B, dp = Math.max(dA, dB);
    var ia = Math.round(A * Math.pow(10, dA)), ib = Math.round(B * Math.pow(10, dB)), mis = add ? ia + ib : ia - ib;
    var mdp = Math.max(dA, dB), trapV = mis / Math.pow(10, mdp);
    var As = A.toFixed(dp), Bs = B.toFixed(dp);
    return Q('dec-addsub', '<b>' + fx(A, 2) + (add ? ' + ' : ' − ') + fx(B, 2) + '</b> = ?', fx(ans, 3), { traps: [[trapV, 'Line up the DECIMAL POINTS, not the last digits'], [add ? A - B : A + B, 'Check the operation: ' + (add ? 'add' : 'subtract')]], steps: ['Line up the decimals and add zeros:<br><code>' + As + '<br>' + (add ? '+ ' : '− ') + Bs + '</code>', (add ? 'Add' : 'Subtract') + ' and bring the decimal point straight down.', 'Answer: <b>' + fx(ans, 3) + '</b>'], why: fx(A, 2) + (add ? ' + ' : ' − ') + fx(B, 2) + ' = ' + fx(ans, 3), meta: { A: A, B: B, add: add } });
  };
  G['dec-mul'] = function () {
    var dA = R(1, 2), dB = R(1, 2), ia = R(12, dA === 1 ? 99 : 199), ib = R(2, dB === 1 ? 9 : 49), A = ia / Math.pow(10, dA), B = ib / Math.pow(10, dB);
    var prod = ia * ib, ans = prod / Math.pow(10, dA + dB), ph = dA + dB;
    return Q('dec-mul', '<b>' + fx(A, 2) + ' × ' + fx(B, 2) + '</b> = ?', fx(ans, 4), { traps: [[ans * 10, 'Count the placeholders carefully: ' + ph + ' places in the original numbers'], [ans / 10, 'Count the placeholders carefully: ' + ph + ' places in the original numbers'], [prod / Math.pow(10, Math.max(dA, dB)), 'Add the placeholders from BOTH numbers']], steps: ['Ignore the decimals: ' + ia + ' × ' + ib + ' = ' + prod, 'Count placeholders: ' + dA + ' + ' + dB + ' = ' + ph, 'Put the decimal ' + ph + ' places in from the right: <b>' + fx(ans, 4) + '</b>'], why: fx(A, 2) + ' × ' + fx(B, 2) + ' = ' + fx(ans, 4), meta: { A: A, B: B } });
  };
  G['dec-div'] = function () {
    var bs = [0.5, 0.2, 0.4, 0.25, 1.2, 0.3, 0.6, 2.5, 0.8, 1.5], B = pick(bs), qd = pick([1, 2]), q = R(3, 60) / Math.pow(10, qd - 1 === 0 ? 0 : 1);
    q = (qd === 1) ? R(3, 40) : R(15, 399) / 10;
    var A = q * B; A = parseFloat(A.toFixed(4)); var shift = (B.toString().split('.')[1] || '').length;
    var ai = A * Math.pow(10, shift), bi = B * Math.pow(10, shift);
    return Q('dec-div', '<b>' + fx(A, 4) + ' ÷ ' + fx(B, 4) + '</b> = ?', fx(q, 4), { traps: [[q * 10, 'Move BOTH decimals the same number of places'], [q / 10, 'Move BOTH decimals the same number of places'], [A * B, 'Check the operation: this is DIVISION']], steps: ['Move BOTH decimals ' + shift + ' place' + (shift > 1 ? 's' : '') + ' right so the divisor is whole: <b>' + fx(ai, 4) + ' ÷ ' + fx(bi, 4) + '</b>', 'Divide like normal.', 'Answer: <b>' + fx(q, 4) + '</b>'], why: fx(A, 4) + ' ÷ ' + fx(B, 4) + ' = ' + fx(q, 4), meta: { A: A, B: B } });
  };
  function randFrac(maxD) { var d = R(2, maxD), n = R(1, d - 1); return fr(n, d); }
  G['frac-addsub'] = function () {
    var add = Math.random() < 0.6, a = randFrac(8), b = randFrac(8), tries = 0;
    while ((a.d === b.d || !add && cmpf(a, b) <= 0) && tries++ < 50) { a = randFrac(8); b = randFrac(8); if (!add && cmpf(a, b) < 0) { var t = a; a = b; b = t; } }
    var ans = add ? fadd(a, b) : fsub(a, b), L = lcm(a.d, b.d), an = a.n * (L / a.d), bn = b.n * (L / b.d);
    var wrong = add ? fr(a.n + b.n, a.d + b.d) : fr(Math.max(1, a.n - b.n), a.d + b.d);
    return Q('frac-addsub', '<b>' + FH(a) + ' ' + (add ? '+' : '−') + ' ' + FH(b) + '</b> = ?', fstr(ans), { lowest: true, traps: [[fstr(wrong), 'Don\'t add the denominators. Find a COMMON denominator first'], [add ? fstr(fsub(a, b)) : fstr(fadd(a, b)), 'Check the operation']], steps: ['Common denominator: <b>' + L + '</b>', 'Expand: ' + F(an, L) + ' ' + (add ? '+' : '−') + ' ' + F(bn, L), (add ? 'Add' : 'Subtract') + ' the tops, keep the bottom: ' + F(add ? an + bn : an - bn, L), 'Simplify: <b>' + fstr(ans) + '</b>'], why: fstr(a) + (add ? ' + ' : ' − ') + fstr(b) + ' = ' + fstr(ans), meta: { a: a, b: b, add: add } });
  };
  G['frac-mul'] = function () {
    var a = randFrac(8), b = randFrac(8), ans = fmul(a, b);
    return Q('frac-mul', '<b>' + FH(a) + ' × ' + FH(b) + '</b> = ?', fstr(ans), { lowest: true, traps: [[(a.n * b.n) + '/' + (a.d * b.d), 'Right idea, but SIMPLIFY'], [fstr(fdiv(a, b)), 'Multiplying is straight across. No flipping'], [fstr(fr(a.n + b.n, a.d + b.d)), 'Multiply the tops and multiply the bottoms']], steps: ['Straight across. Top: ' + a.n + ' × ' + b.n + ' = ' + a.n * b.n, 'Bottom: ' + a.d + ' × ' + b.d + ' = ' + a.d * b.d, 'Simplify: <b>' + fstr(ans) + '</b>'], why: fstr(a) + ' × ' + fstr(b) + ' = ' + fstr(ans), meta: { a: a, b: b } });
  };
  G['frac-div'] = function () {
    var a = randFrac(8), b = randFrac(8), ans = fdiv(a, b);
    return Q('frac-div', '<b>' + FH(a) + ' ÷ ' + FH(b) + '</b> = ?', fstr(ans), { lowest: true, traps: [[fstr(fmul(a, b)), 'You forgot to FLIP the second fraction (Keep, Change, FLIP)'], [fstr(fdiv(b, a)), 'KEEP the first fraction, flip the SECOND'], [(a.n * b.d) + '/' + (a.d * b.n), 'Right idea, but SIMPLIFY']], steps: ['<b>K</b>eep ' + fstr(a), '<b>C</b>hange ÷ to ×', '<b>F</b>lip ' + fstr(b) + ' to ' + b.d + '/' + b.n, 'Multiply straight across and simplify: <b>' + fstr(ans) + '</b>'], why: fstr(a) + ' ÷ ' + fstr(b) + ' = ' + fstr(ans), meta: { a: a, b: b } });
  };

  // =============== WORLD 3: ALGEBRA
  G['exp-gemdas'] = function () {
    var t = R(0, 4), a = R(2, 9), b = R(2, 9), c = R(2, 6), p, v, tr, st;
    if (t === 0) { p = a + ' + ' + b + ' × ' + c; v = a + b * c; tr = [[(a + b) * c, 'Multiply BEFORE you add (M comes before A)']]; st = ['No grouping or exponents.', 'Multiply first: ' + b + ' × ' + c + ' = ' + b * c, a + ' + ' + b * c + ' = ' + v]; }
    else if (t === 1) { p = '(' + a + ' + ' + b + ') × ' + c; v = (a + b) * c; tr = [[a + b * c, 'Do the parentheses FIRST (G in GEMDAS)']]; st = ['Grouping first: ' + a + ' + ' + b + ' = ' + (a + b), (a + b) + ' × ' + c + ' = ' + v]; }
    else if (t === 2) { var m = R(2, 5), n = R(2, 6), e = R(2, 3); p = a + ' + ' + b + '<sup>2</sup> − ' + m + ' × ' + n; v = a + b * b - m * n; if (v < 0) return G['exp-gemdas'](); tr = [[(a + b) * (a + b) - m * n, 'Exponents only apply to the number right next to them'], [a + b * b - m + n, 'Multiplication before subtraction']]; st = ['Exponent first: ' + b + '<sup>2</sup> = ' + b * b, 'Multiply: ' + m + ' × ' + n + ' = ' + m * n, a + ' + ' + b * b + ' − ' + m * n + ' = ' + v]; }
    else if (t === 3) { var q = R(2, 6), w = q * R(2, 6); p = w + ' ÷ ' + q + ' × ' + b; v = (w / q) * b; tr = [[w / (q * b), 'Multiplication and division are equal partners: go LEFT to RIGHT']]; st = ['M and D go left to right.', w + ' ÷ ' + q + ' = ' + w / q, (w / q) + ' × ' + b + ' = ' + v]; }
    else { var s2 = R(2, 5), d2 = R(2, 5), big = R(10, 30); p = big + ' − ' + s2 + ' × (' + a + ' + ' + d2 + ')'; v = big - s2 * (a + d2); if (v < 0) return G['exp-gemdas'](); tr = [[(big - s2) * (a + d2), 'Multiply before subtracting'], [big - s2 * a + d2, 'Do the parentheses FIRST']]; st = ['Parentheses: ' + a + ' + ' + d2 + ' = ' + (a + d2), 'Multiply: ' + s2 + ' × ' + (a + d2) + ' = ' + s2 * (a + d2), big + ' − ' + s2 * (a + d2) + ' = ' + v]; }
    return Q('exp-gemdas', '<b>' + p + '</b> = ?', v, { traps: tr, steps: st, why: p.replace(/<[^>]+>/g, '') + ' = ' + v, meta: { p: p.replace(/<sup>2<\/sup>/g, '**2').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-') } });
  };
  G['exp-terms'] = function () {
    var a = R(2, 9), b = R(2, 9), t = R(0, 3);
    while (b === a) b = R(2, 9);
    if (t === 0) return Q('exp-terms', 'In <b>' + a + 'x + ' + b + '</b>, what is the <b>coefficient</b>?', a, { traps: [[b, 'The constant is the number by itself. The coefficient sticks to the letter']], steps: ['The coefficient is the number multiplying the variable.'], why: 'The coefficient is ' + a });
    if (t === 1) return Q('exp-terms', 'In <b>' + a + 'x + ' + b + '</b>, what is the <b>constant</b>?', b, { traps: [[a, 'The constant is the number with NO letter']], steps: ['The constant is the number by itself.'], why: 'The constant is ' + b });
    if (t === 2) return Q('exp-terms', 'In <b>' + a + 'x + ' + b + '</b>, which letter is the <b>variable</b>?', 'x', { alg: 'text', mc: true, choices: [{ t: 'x', ok: true }, { t: String(a), ok: false, w: 'The variable is the letter' }, { t: String(b), ok: false, w: 'The variable is the letter' }, { t: a + 'x', ok: false, w: 'That is a term; the variable is just the letter' }], steps: ['The variable is the mystery letter.'], why: 'The variable is x' });
    var good = a + 'x and ' + b + 'x', opts = [{ t: good, ok: true }, { t: a + ' and ' + b + 'x', ok: false, w: 'A plain number and an x-term are NOT like terms' }, { t: a + 'x and ' + b + 'y', ok: false, w: 'Different letters are not like terms' }, { t: a + ' and ' + b + 'y', ok: false, w: 'Like terms must match' }];
    return Q('exp-terms', 'Which pair are <b>like terms</b>?', good, { mc: true, alg: 'text', choices: opts, steps: ['Like terms have the SAME letter part (or both are plain numbers).'], why: good + ' are like terms' });
  };
  function lin(x, c) { // build "ax + c" display from numbers (x!=0, c!=0)
    var s = (x === 1 ? '' : x === -1 ? '-' : x) + 'x'; return s + (c ? (c > 0 ? '+' : '-') + Math.abs(c) : '');
  }
  G['exp-combine'] = function () {
    var a, c, b, d, tries = 0;
    do { a = R(1, 9); c = R(1, 9); b = R(-9, 9); d = R(-9, 9); tries++; } while ((!b || !d || b + d === 0 || a + c === 0) && tries < 50);
    function X(k) { return (k === 1 ? '' : k) + 'x'; }
    var order = R(0, 1), terms = order ? [b, X(a), d, X(c)] : [X(a), b, X(c), d];
    function dsp(ts) { return ts.map(function (t, i) { var neg = typeof t === 'number' ? t < 0 : false, body = typeof t === 'number' ? Math.abs(t) : t; return (i === 0 ? (neg ? MINUS : '') : (neg ? ' ' + MINUS + ' ' : ' + ')) + body; }).join(''); }
    var ans = lin(a + c, b + d), allSum = a + c + b + d;
    return Q('exp-combine', 'Simplify: <b>' + dsp(terms) + '</b>', ans, { alg: 'expr', traps: [[allSum + 'x', 'x terms and plain numbers are NOT like terms. They can\'t be combined'], [lin(a + c, b - d), 'Watch the signs on the constants'], [lin(a - c, b + d), 'Add the x coefficients']], steps: ['x terms: ' + X(a) + ' + ' + X(c) + ' = ' + X(a + c), 'Constants: ' + S(b) + ' + ' + P(d) + ' = ' + S(b + d), 'Put them together: <b>' + X(a + c) + ' ' + (b + d < 0 ? MINUS : '+') + ' ' + Math.abs(b + d) + '</b>'], why: dsp(terms) + ' = ' + ans.replace(/-/g, MINUS), meta: { a: a, b: b, c: c, d: d } });
  };
  G['eq-1step'] = function () {
    var t = R(0, 3), x = R(-12, 15), a = R(2, 12), p, st, tr, ans;
    while (x === 0) x = R(-12, 15);
    ans = x;
    if (t === 0) { p = 'x + ' + a + ' = ' + S(x + a); st = [a + ' is being ADDED to x.', 'Inverse: SUBTRACT ' + a + ' from both sides.', S(x + a) + ' − ' + a + ' = ' + S(x)]; tr = [[x + 2 * a, 'Use the INVERSE (opposite) operation: subtract']]; }
    else if (t === 1) { p = 'x − ' + a + ' = ' + S(x - a); st = [a + ' is being SUBTRACTED from x.', 'Inverse: ADD ' + a + ' to both sides.', S(x - a) + ' + ' + a + ' = ' + S(x)]; tr = [[x - 2 * a, 'Use the INVERSE (opposite) operation: add']]; }
    else if (t === 2) { p = a + 'x = ' + S(a * x); st = ['x is being MULTIPLIED by ' + a + '.', 'Inverse: DIVIDE both sides by ' + a + '.', S(a * x) + ' ÷ ' + a + ' = ' + S(x)]; tr = [[a * a * x, 'Use the INVERSE: divide, don\'t multiply again']]; }
    else { p = 'x ÷ ' + a + ' = ' + S(x); ans = x * a; st = ['x is being DIVIDED by ' + a + '.', 'Inverse: MULTIPLY both sides by ' + a + '.', S(x) + ' × ' + a + ' = ' + S(x * a)]; tr = [[x / a, 'Use the INVERSE: multiply, don\'t divide again']]; }
    st.push('Check by plugging back in!');
    return Q('eq-1step', 'Solve: <b>' + p + '</b><div class="small">x = ?</div>', ans, { traps: tr, steps: st, why: 'x = ' + S(ans), meta: { p: p, ans: ans } });
  };
  G['eq-2step'] = function () {
    var t = R(0, 2), x = R(-8, 12), a = R(2, 9), b = R(1, 12), p, st, tr;
    if (x === 0) x = 3;
    if (t === 0) { var c = a * x + b; p = a + 'x + ' + b + ' = ' + S(c); st = ['Undo the + ' + b + ': subtract ' + b + ' from both sides → ' + a + 'x = ' + S(a * x), 'Undo the × ' + a + ': divide both sides by ' + a + ' → x = ' + S(x)]; tr = [[a * x, 'You stopped halfway. Now divide by ' + a], [(c + b) / a, 'Subtract ' + b + ', don\'t add it']]; }
    else if (t === 1) { var c2 = a * x - b; p = a + 'x − ' + b + ' = ' + S(c2); st = ['Undo the − ' + b + ': ADD ' + b + ' to both sides → ' + a + 'x = ' + S(a * x), 'Divide both sides by ' + a + ' → x = ' + S(x)]; tr = [[a * x, 'You stopped halfway. Now divide by ' + a], [(c2 - b) / a, 'Add ' + b + ', don\'t subtract it']]; }
    else { var y = x * a, c3 = x + b; p = 'x ÷ ' + a + ' + ' + b + ' = ' + S(c3); x = y; st = ['Undo the + ' + b + ': subtract ' + b + ' → x ÷ ' + a + ' = ' + S(c3 - b), 'Undo the ÷ ' + a + ': multiply by ' + a + ' → x = ' + S(y)]; tr = [[c3 - b, 'You stopped halfway. Now multiply by ' + a], [(c3 + b) * a, 'Subtract ' + b + ', don\'t add it']]; }
    st.push('Check by plugging back in!');
    return Q('eq-2step', 'Solve: <b>' + p + '</b><div class="small">x = ?</div>', x, { traps: tr, steps: st, why: 'x = ' + S(x), meta: { p: p, ans: x } });
  };
  var SYM = { '<': '<', '>': '>', '<=': '≤', '>=': '≥' };
  function flipSym(s) { return { '<': '>', '>': '<', '<=': '>=', '>=': '<=' }[s]; }
  function ineqStr(op, n) { return 'x ' + SYM[op] + ' ' + S(n); }
  G['ineq-solve'] = function () {
    var ops = ['<', '>', '<=', '>='], op = pick(ops), t = R(0, 2), x = R(-8, 10), a = R(2, 9), p, ansOp = op, tr, st;
    while (x === 0) x = R(-8, 10);
    if (t === 0) { p = 'x + ' + a + ' ' + SYM[op] + ' ' + S(x + a); st = ['Subtract ' + a + ' from both sides.', 'No negative involved, so the symbol stays.']; tr = [[null]]; }
    else if (t === 1) { p = a + 'x ' + SYM[op] + ' ' + S(a * x); st = ['Divide both sides by ' + a + ' (positive).', 'Positive: the symbol stays.']; tr = [[null]]; }
    else { p = MINUS + a + 'x ' + SYM[op] + ' ' + S(-a * x); ansOp = flipSym(op); st = ['Divide both sides by ' + MINUS + a + '.', '<b>Dividing by a NEGATIVE flips the symbol!</b> ' + SYM[op] + ' becomes ' + SYM[ansOp]]; }
    var ans = 'x ' + SYM[ansOp] + ' ' + S(x);
    var traps = [];
    if (t === 2) traps.push([ineqStr(op, x), 'You divided by a negative. FLIP the symbol!']);
    traps.push([ineqStr(flipSym(ansOp), x), t === 2 ? 'Flip once: when you divide by a negative' : 'Only flip when multiplying/dividing by a NEGATIVE']);
    traps.push([ineqStr(ansOp, -x), 'Check the number. Do the inverse operation']);
    return Q('ineq-solve', 'Solve: <b>' + p + '</b>', ans, { alg: 'ineq', traps: traps, steps: st.concat(['Answer: <b>' + ans + '</b>']), why: p + '  →  ' + ans, mc: false, meta: { p: p, ans: ans } });
  };
  G['ineq-graph'] = function () {
    var ops = ['<', '>', '<=', '>='], op = pick(ops), v = R(-6, 8), closed = op.indexOf('=') >= 0, right = op[0] === '>';
    var asked = Math.random() < 0.6;
    if (asked) {
      var optsG = [[closed, right], [!closed, right], [closed, !right], [!closed, !right]].map(function (c) { return { t: numline(v, c[0], c[1]), ok: c[0] === closed && c[1] === right, w: c[0] !== closed ? (closed ? 'Closed circle: ≥ and ≤ include the number' : 'Open circle: > and < do NOT include the number') : 'The arrow shows which way the answers go' }; });
      return Q('ineq-graph', 'Which graph shows <b>' + ineqStr(op, v) + '</b> ?', 'graph', { mc: true, choices: optsG, steps: [(closed ? '≥ or ≤ → CLOSED circle (the number counts)' : '> or < → OPEN circle (the number does not count)'), (right ? '"Greater" → arrow points RIGHT' : '"Less" → arrow points LEFT')], why: ineqStr(op, v) + ' has a ' + (closed ? 'closed' : 'open') + ' circle at ' + S(v) + ' and the arrow points ' + (right ? 'right' : 'left') });
    }
    var optsI = ['<', '>', '<=', '>='].map(function (o) { return { t: ineqStr(o, v), ok: o === op, w: (o.indexOf('=') >= 0) !== closed ? 'Circle type tells you if it\'s "or equal to"' : 'Arrow direction tells you < or >' }; });
    return Q('ineq-graph', 'Which inequality matches this graph?<div class="figwrap">' + numline(v, closed, right) + '</div>', ineqStr(op, v), { mc: true, alg: 'ineq', choices: optsI, steps: [(closed ? 'Closed circle → "or equal to" (≥ or ≤)' : 'Open circle → just > or <'), (right ? 'Arrow right → greater (>)' : 'Arrow left → less (<)')], why: 'It is ' + ineqStr(op, v) });
  };

  // =============== WORLD 4: PROPORTIONALITY
  G['prop-unit'] = function () {
    var cs = [['miles', 'hours', 'A car travels {A} miles in {B} hours. How many miles per hour?', 'per hour'], ['dollars', 'pounds', '{B} pounds of apples cost ${A}. What is the price per pound?', 'dollars per pound'], ['pages', 'minutes', 'Mia reads {A} pages in {B} minutes. How many pages per minute?', 'pages per minute'], ['words', 'minutes', 'Sam types {A} words in {B} minutes. Words per minute?', 'words per minute'], ['laps', 'minutes', 'A swimmer does {A} laps in {B} minutes. Laps per minute?', 'laps per minute']];
    var c = pick(cs), B = R(2, 9), k = pick([3, 4, 5, 6, 8, 10, 12, 15, 20, 25]), A = B * k;
    if (c[0] === 'dollars') { k = pick([1.5, 2.5, 3, 4, 0.75, 1.25, 2]); A = parseFloat((B * k).toFixed(2)); }
    return Q('prop-unit', c[2].replace('{A}', A).replace('{B}', B), fx(k, 3), { unit: c[3], traps: [[fx(B / A, 4), 'Flipped! The thing you are finding goes on TOP (focus ÷ reference)'], [fx(A * B, 3), 'A rate is a DIVISION problem']], steps: ['Template: ' + c[0] + ' / ' + c[1] + '  (focus over reference)', 'Divide: ' + A + ' ÷ ' + B + ' = ' + fx(k, 3)], why: A + ' ÷ ' + B + ' = ' + fx(k, 3) + ' ' + c[3], meta: { A: A, B: B } });
  };
  G['prop-solve'] = function () {
    var cs = [['notebooks', 'dollars', '{a} notebooks cost ${c}. How much do {b} notebooks cost?', true], ['cups of flour', 'servings', 'A recipe uses {a} cups of flour for {c} servings. How many servings can you make with {b} cups?', false], ['gallons of gas', 'miles', 'A car goes {c} miles on {a} gallons. How many miles on {b} gallons?', false], ['tickets', 'dollars', '{a} tickets cost ${c}. What do {b} tickets cost?', true]];
    var cs0 = pick(cs), a = R(2, 8), b = R(3, 15); while (b === a) b = R(3, 15);
    var k = pick([2, 3, 4, 5, 6, 8, 10, 1.5, 2.5]), c = parseFloat((a * k).toFixed(2)), x = parseFloat((b * k).toFixed(2));
    var money$ = cs0[0] === 'notebooks' || cs0[0] === 'tickets', focusU = cs0[1];
    var text = cs0[2].replace('{a}', a).replace('{b}', b).replace('{c}', c);
    return Q('prop-solve', text, fx(x, 2), { traps: [[fx(c * a / b, 3), 'The numbers are in the wrong places. Keep units in the same position (focus over reference)'], [fx(c + (b - a), 3), 'This is MULTIPLICATIVE, not additive: use a proportion, not adding']], steps: ['Template: ' + focusU + ' / ' + cs0[0] + '', 'Standard proportion: ' + c + '/' + a + ' = x/' + b, 'Cross-multiply: ' + a + ' × x = ' + c + ' × ' + b + ' = ' + fx(c * b, 3), 'Divide by ' + a + ': x = <b>' + fx(x, 2) + '</b>'], why: c + '/' + a + ' = ' + fx(x, 2) + '/' + b, unit: focusU, meta: { a: a, b: b, c: c, x: x } });
  };
  G['prop-pctchange'] = function () {
    var inc = Math.random() < 0.6, old = pick([20, 25, 40, 50, 60, 80, 100, 120, 200]), pct = pick([5, 10, 15, 20, 25, 30, 40, 50]);
    var nw = inc ? old * (1 + pct / 100) : old * (1 - pct / 100); nw = parseFloat(nw.toFixed(2));
    var diff = Math.abs(nw - old);
    return Q('prop-pctchange', 'A price changes from <b>' + old + '</b> to <b>' + fx(nw, 2) + '</b>. What is the percent <b>' + (inc ? 'increase' : 'decrease') + '</b>?', pct + '%', { traps: [[fx(diff / nw * 100, 3) + '%', 'Divide by the OLD (starting) value, not the new one'], [fx(diff / old, 4) + '%', 'Multiply by 100 to make it a percent'], [fx(diff, 3) + '%', 'That is the change in dollars. Divide by the old value and ×100']], steps: ['Change: ' + fx(nw, 2) + ' − ' + old + ' → size ' + fx(diff, 2), 'Divide by the OLD value: ' + fx(diff, 2) + ' ÷ ' + old + ' = ' + fx(diff / old, 4), '× 100 = <b>' + pct + '%</b>'], why: (inc ? 'Increase' : 'Decrease') + ' of ' + pct + '%', meta: { old: old, nw: nw, pct: pct } });
  };
  G['prop-interest'] = function () {
    var P0 = pick([100, 200, 250, 400, 500, 800, 1000, 1500]), r = pick([2, 3, 4, 5, 6, 8, 10]), t = R(2, 6), total = Math.random() < 0.35, I = P0 * r / 100 * t;
    var base = money(P0) + ' is saved at <b>' + r + '%</b> simple interest for <b>' + t + ' years</b>. ';
    var ans = total ? P0 + I : I;
    return Q('prop-interest', base + (total ? 'How much money is there <b>in total</b> at the end?' : 'How much <b>interest</b> is earned?'), fx(ans, 2), { unit: 'dollars', traps: [[total ? I : P0 + I, total ? 'That\'s only the interest. Add the starting money (principal) too' : 'That includes the starting money. The question asks only for the interest'], [P0 * r * t, 'Turn the rate into a DECIMAL (' + r + '% = ' + fx(r / 100, 3) + ')'], [P0 * r / 100, 'Don\'t forget to multiply by the TIME (years)']], steps: ['Rate as a decimal: ' + r + '% = ' + fx(r / 100, 3), 'I = P × R × T = ' + P0 + ' × ' + fx(r / 100, 3) + ' × ' + t + ' = ' + fx(I, 2), total ? 'Total = P + I = ' + P0 + ' + ' + fx(I, 2) + ' = <b>' + fx(ans, 2) + '</b>' : 'Interest = <b>' + fx(I, 2) + '</b>'], why: 'I = ' + P0 + ' × ' + fx(r / 100, 3) + ' × ' + t + ' = ' + fx(I, 2), meta: { P0: P0, r: r, t: t, total: total } });
  };

  // =============== WORLD 5: STATISTICS
  function sortNum(a) { return a.slice().sort(function (x, y) { return x - y; }); }
  function med(a) { var s = sortNum(a), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
  MD.statMedian = med;
  function dataset(n, lo, hi) { var o = []; for (var i = 0; i < n; i++) o.push(R(lo, hi)); return o; }
  G['stat-mean'] = function () {
    var n = pick([4, 5, 6]), m = R(5, 25), d, tries = 0;
    do { d = dataset(n - 1, 2, 40); var last = n * m - d.reduce(function (a, b) { return a + b; }, 0); d.push(last); tries++; } while ((last < 1 || last > 45) && tries < 80);
    d = shuffle(d); var sum = d.reduce(function (a, b) { return a + b; }, 0), mean = sum / n;
    return Q('stat-mean', 'Find the <b>mean</b>:<div class="big">' + d.join(', &nbsp; ') + '</div>', fx(mean, 3), { traps: [[sum, 'You found the sum. DIVIDE by how many numbers there are'], [med(d), 'That is the median (middle). Mean = sum ÷ count'], [fx(sum / (n + 1), 3), 'Divide by the number of values (count them!)']], steps: ['Add them up: ' + d.join(' + ') + ' = ' + sum, 'Count them: ' + n + ' numbers', sum + ' ÷ ' + n + ' = <b>' + fx(mean, 3) + '</b>'], why: 'Mean = ' + sum + ' ÷ ' + n + ' = ' + fx(mean, 3), meta: { d: d } });
  };
  G['stat-median'] = function () {
    var n = pick([5, 6, 7, 8]), d = dataset(n, 1, 40), s = sortNum(d);
    var m = med(d), tr = [[d[Math.floor(n / 2)], 'Put the numbers IN ORDER first']];
    tr.push([fx(d.reduce(function (a, b) { return a + b; }, 0) / n, 3), 'That is the mean (average). Median is the middle']);
    if (n % 2 === 0) tr.push([s[n / 2], 'With an even count, the median is the mean of the TWO middle numbers']);
    return Q('stat-median', 'Find the <b>median</b>:<div class="big">' + d.join(', &nbsp; ') + '</div>', fx(m, 3), { traps: tr, steps: ['Put in order: ' + s.join(', '), n % 2 ? 'Odd count: the middle one is ' + fx(m, 3) : 'Even count: the two middle numbers are ' + s[n / 2 - 1] + ' and ' + s[n / 2] + '. Their mean is ' + fx(m, 3)], why: 'Median = ' + fx(m, 3), meta: { d: d } });
  };
  G['stat-moderange'] = function () {
    if (Math.random() < 0.5) {
      var m = R(2, 30), d = [m, m, m], others = []; while (others.length < R(3, 5)) { var v = R(1, 35); if (v !== m && others.indexOf(v) < 0) others.push(v); }
      d = shuffle(d.concat(others));
      return Q('stat-moderange', 'Find the <b>mode</b>:<div class="big">' + d.join(', &nbsp; ') + '</div>', m, { traps: [[3, 'The mode is WHICH number appears most, not how many times'], [Math.max.apply(null, d), 'Mode = most often, not the biggest'], [med(d), 'That is the median. Mode = most often']], steps: ['Count how often each number appears.', m + ' appears 3 times (the most).'], why: 'Mode = ' + m, meta: { d: d } });
    }
    var d2 = dataset(R(5, 7), 3, 50), mx = Math.max.apply(null, d2), mn = Math.min.apply(null, d2);
    if (mx === mn) d2[0] = mn + 7, mx = d2[0];
    mx = Math.max.apply(null, d2); mn = Math.min.apply(null, d2);
    return Q('stat-moderange', 'Find the <b>range</b>:<div class="big">' + d2.join(', &nbsp; ') + '</div>', mx - mn, { traps: [[mx, 'Range = biggest MINUS smallest'], [mx + mn, 'Range is a difference: subtract'], [fx((mx + mn) / 2, 2), 'That is the midpoint. Range = biggest − smallest']], steps: ['Biggest: ' + mx + '   Smallest: ' + mn, mx + ' − ' + mn + ' = <b>' + (mx - mn) + '</b>'], why: 'Range = ' + mx + ' − ' + mn + ' = ' + (mx - mn), meta: { d: d2 } });
  };
  G['stat-iqr'] = function () {
    var n = pick([8, 9, 10]), set = {}, d = []; while (d.length < n) { var v = R(2, 60); if (!set[v]) { set[v] = 1; d.push(v); } }
    var s = sortNum(d), h = Math.floor(n / 2), lower = s.slice(0, h), upper = s.slice(n - h), q1 = med(lower), q3 = med(upper), iqr = q3 - q1, rng = s[n - 1] - s[0];
    return Q('stat-iqr', 'Find the <b>interquartile range (IQR)</b>:<div class="big">' + shuffle(d).join(', &nbsp; ') + '</div>', fx(iqr, 3), { traps: [[rng, 'That is the RANGE. IQR = Q3 − Q1'], [fx(q3, 3), 'That is Q3. Subtract Q1'], [fx(q1, 3), 'That is Q1. IQR = Q3 − Q1']], steps: ['Order: ' + s.join(', '), 'Lower half: ' + lower.join(', ') + ' → Q1 = ' + fx(q1, 3) + (n % 2 ? '  (middle number left out)' : ''), 'Upper half: ' + upper.join(', ') + ' → Q3 = ' + fx(q3, 3), 'IQR = ' + fx(q3, 3) + ' − ' + fx(q1, 3) + ' = <b>' + fx(iqr, 3) + '</b>'], why: 'IQR = ' + fx(q3, 3) + ' − ' + fx(q1, 3) + ' = ' + fx(iqr, 3), meta: { d: d } });
  };
  var STATV = [
    ['What kind of data is <b>hair color</b>?', 'Categorical', ['Numerical', 'Skewed', 'An outlier'], 'Hair colors are categories that can be counted.'],
    ['What kind of data is the <b>height in inches</b> of everyone in a room?', 'Numerical', ['Categorical', 'Frequency', 'A mode'], 'Heights are numbers.'],
    ['A data point that is <b>far away</b> from the others is called a(n)...', 'Outlier', ['Mode', 'Median', 'Quartile'], 'An outlier deviates a lot from the other data.'],
    ['In a frequency table, <b>frequency</b> tells you...', 'How many times a value appears', ['The biggest value', 'The middle value', 'The range'], 'Frequency = how many times each value or category appears.'],
    ['Data with a long "tail" of outliers on the <b>right</b> has...', 'Right (positive) skew', ['Left (negative) skew', 'No spread', 'A mode of zero'], 'Skew is named for the side of the tail.'],
    ['Which is a <b>measure of center</b>?', 'Median', ['Range', 'IQR', 'Outlier'], 'Mean, median, and mode are measures of center.'],
    ['Which is a <b>measure of spread</b>?', 'IQR', ['Mean', 'Median', 'Mode'], 'Range and IQR tell how spread out the data is.'],
    ['The <b>IQR</b> is the range of the...', 'Middle 50% of the data', ['Whole data set', 'Top 10%', 'Smallest number'], 'IQR = Q3 − Q1, the middle half of the data.'],
    ['A <b>histogram</b> is different from a bar graph because its bars...', 'Touch (they show ranges)', ['Are always red', 'Show categories', 'Have gaps'], 'Histogram bars are stuck together because each bar is a range of values.'],
    ['A <b>dot plot</b> shows each data point as a...', 'Dot above a number line', ['Slice of a circle', 'Stem and leaf', 'Box'], 'Each data value gets a dot above its place on the number line.'],
    ['Can a data set have <b>more than one mode</b> or none?', 'Yes, both are possible', ['No, always exactly one', 'Only one or none', 'Only two'], 'There can be no mode or more than one.'],
    ['Why can\'t we use statistics to study something that <b>never changes</b>?', 'Statistics studies things that vary', ['It is too small', 'It has no mean', 'It has too many outliers'], 'No variability means nothing to describe.']
  ];
  G['stat-vocab'] = function () {
    var it = pick(STATV), choices = [{ t: it[1], ok: true }].concat(it[2].map(function (x) { return { t: x, ok: false, w: 'Think about the definition' }; }));
    return Q('stat-vocab', it[0], it[1], { mc: true, alg: 'text', choices: choices, steps: ['Remember the definition from your study guide.'], why: it[3] });
  };

  // =============== WORLD 6: GEOMETRY
  G['geo-perim'] = function () {
    var t = R(0, 2);
    if (t === 0) { var l = R(4, 20), w = R(3, 15); return Q('geo-perim', 'Find the <b>perimeter</b> of the rectangle.<div class="figwrap">' + figRect(l, w) + '</div>', 2 * (l + w), { unit: 'units', traps: [[l * w, 'That\'s the AREA. Perimeter is the distance AROUND'], [l + w, 'A rectangle has 4 sides: add them all (two lengths AND two widths)']], steps: ['Add all four sides: ' + l + ' + ' + w + ' + ' + l + ' + ' + w, '= <b>' + 2 * (l + w) + '</b>'], why: 'P = 2(' + l + ' + ' + w + ') = ' + 2 * (l + w), meta: { l: l, w: w } }); }
    if (t === 1) { var a = R(5, 14), b = R(5, 14), c = R(Math.abs(a - b) + 1, a + b - 1); return Q('geo-perim', 'A triangle has sides <b>' + a + ', ' + b + ', and ' + c + '</b>. What is its perimeter?', a + b + c, { unit: 'units', traps: [[a * b * c, 'Perimeter is the SUM of the sides'], [a + b, 'Add all THREE sides']], steps: ['Add every side: ' + a + ' + ' + b + ' + ' + c + ' = <b>' + (a + b + c) + '</b>'], why: 'P = ' + a + ' + ' + b + ' + ' + c + ' = ' + (a + b + c), meta: { sum: a + b + c } }); }
    var n = pick([5, 6, 8]), s = R(3, 12), nm = { 5: 'pentagon (5 sides)', 6: 'hexagon (6 sides)', 8: 'octagon (8 sides)' }[n];
    return Q('geo-perim', 'A <b>regular ' + nm + '</b> has sides of length <b>' + s + '</b>. What is the perimeter?', n * s, { unit: 'units', traps: [[s * s, 'Perimeter: add ALL ' + n + ' equal sides'], [(n - 1) * s, 'Count all ' + n + ' sides']], steps: ['All ' + n + ' sides are equal.', n + ' × ' + s + ' = <b>' + n * s + '</b>'], why: 'P = ' + n + ' × ' + s + ' = ' + n * s, meta: { n: n, s: s } });
  };
  G['geo-area-basic'] = function () {
    var t = R(0, 2);
    if (t === 0) { var l = R(4, 16), w = R(3, 12); return Q('geo-area-basic', 'Find the <b>area</b> of the rectangle.<div class="figwrap">' + figRect(l, w) + '</div>', l * w, { unit: 'square units', traps: [[2 * (l + w), 'That is the PERIMETER (around). Area = length × width'], [l + w, 'Area is MULTIPLICATION: length × width']], steps: ['A = length × width', l + ' × ' + w + ' = <b>' + l * w + '</b> square units'], why: 'A = ' + l + ' × ' + w + ' = ' + l * w, meta: { l: l, w: w } }); }
    if (t === 1) { var b = R(5, 16), h = R(3, 10), s = h + R(2, 5); return Q('geo-area-basic', 'Find the <b>area</b> of the parallelogram.<div class="figwrap">' + figPara(b, h, s) + '</div>', b * h, { unit: 'square units', traps: [[b * s, 'Use the HEIGHT (straight up), not the slanted side'], [fx(b * h / 2, 2), 'Only triangles get the ½. Parallelogram: A = b × h']], steps: ['A = b × h. Use the height (the dashed line), not the slanted side.', b + ' × ' + h + ' = <b>' + b * h + '</b> square units'], why: 'A = ' + b + ' × ' + h + ' = ' + b * h, meta: { b: b, h: h } }); }
    var bb = R(4, 20), hh = R(3, 14); if ((bb * hh) % 2) bb += 1;
    return Q('geo-area-basic', 'Find the <b>area</b> of the triangle.<div class="figwrap">' + figTri(bb, hh) + '</div>', fx(bb * hh / 2, 2), { unit: 'square units', traps: [[bb * hh, 'A triangle is HALF of b × h. Don\'t forget the ½'], [bb + hh, 'Area means multiply, not add']], steps: ['A = ½ × b × h', '½ × ' + bb + ' × ' + hh + ' = ' + bb * hh + ' ÷ 2 = <b>' + fx(bb * hh / 2, 2) + '</b> square units'], why: 'A = ½ × ' + bb + ' × ' + hh + ' = ' + fx(bb * hh / 2, 2), meta: { b: bb, h: hh, tri: true } });
  };
  G['geo-area-trap'] = function () {
    var b1 = R(3, 12), b2 = b1 + R(2, 8), h = R(2, 10); if (((b1 + b2) * h) % 2) h += 1;
    var A = (b1 + b2) * h / 2;
    return Q('geo-area-trap', 'Find the <b>area</b> of the trapezoid.<div class="figwrap">' + figTrap(b1, b2, h) + '</div>', fx(A, 2), { unit: 'square units', traps: [[(b1 + b2) * h, 'Don\'t forget the ½ (take half at the end)'], [fx(b2 * h / 2, 2), 'Add BOTH bases: b1 + b2'], [fx((b1 + b2) / 2 + h, 2), 'Multiply by the height, don\'t add it']], steps: ['A = ½ (b1 + b2) × h', 'Add the bases: ' + b1 + ' + ' + b2 + ' = ' + (b1 + b2), 'Times the height: ' + (b1 + b2) + ' × ' + h + ' = ' + (b1 + b2) * h, 'Half: <b>' + fx(A, 2) + '</b>'], why: 'A = ½ (' + b1 + ' + ' + b2 + ') × ' + h + ' = ' + fx(A, 2), meta: { b1: b1, b2: b2, h: h } });
  };
  G['geo-circle'] = function () {
    var t = R(0, 4), r = R(2, 10), d = 2 * r;
    if (t === 0) return Q('geo-circle', 'A circle has a <b>diameter of ' + d + '</b>. What is its <b>radius</b>?<div class="figwrap">' + figCircle('d = ' + d, true) + '</div>', r, { unit: 'units', traps: [[d * 2, 'Radius is HALF the diameter']], steps: ['Radius = ½ × diameter', d + ' ÷ 2 = <b>' + r + '</b>'], why: 'r = ' + d + ' ÷ 2 = ' + r });
    if (t === 1) return Q('geo-circle', 'A circle has a <b>radius of ' + r + '</b>. What is its <b>diameter</b>?<div class="figwrap">' + figCircle('r = ' + r, false) + '</div>', d, { unit: 'units', traps: [[r / 2, 'Diameter is TWICE the radius']], steps: ['Diameter = 2 × radius', '2 × ' + r + ' = <b>' + d + '</b>'], why: 'd = 2 × ' + r + ' = ' + d });
    if (t === 2) return Q('geo-circle', 'Find the <b>circumference</b>. Use π = 3.14.<div class="figwrap">' + figCircle('d = ' + d, true) + '</div>', fx(3.14 * d, 3), { unit: 'units', traps: [[3.14 * r * r, 'That\'s AREA. Circumference = π × diameter'], [3.14 * r, 'Use the whole diameter: C = π × d'], [3.14 * d * d, 'Circumference: C = π × d (no squaring)']], steps: ['C = π × d', '3.14 × ' + d + ' = <b>' + fx(3.14 * d, 3) + '</b>'], why: 'C = 3.14 × ' + d + ' = ' + fx(3.14 * d, 3), meta: { d: d } });
    if (t === 3) return Q('geo-circle', 'Find the <b>circumference</b>. Use π = 3.14.<div class="figwrap">' + figCircle('r = ' + r, false) + '</div>', fx(3.14 * 2 * r, 3), { unit: 'units', traps: [[3.14 * r, 'You were given the RADIUS. Double it to get the diameter first'], [3.14 * r * r, 'That\'s AREA. Circumference = π × diameter']], steps: ['The diameter is 2 × ' + r + ' = ' + d, 'C = π × d = 3.14 × ' + d + ' = <b>' + fx(3.14 * d, 3) + '</b>'], why: 'C = 3.14 × ' + d + ' = ' + fx(3.14 * d, 3), meta: { r: r, circ: true } });
    return Q('geo-circle', 'Find the <b>area</b>. Use π = 3.14.<div class="figwrap">' + figCircle('r = ' + r, false) + '</div>', fx(3.14 * r * r, 4), { unit: 'square units', traps: [[3.14 * r * 2, 'r² means r × r, not r × 2'], [3.14 * d * d, 'Use the RADIUS, not the diameter'], [3.14 * d, 'That\'s the circumference. Area = π × r × r']], steps: ['A = π × r²', 'r² = ' + r + ' × ' + r + ' = ' + r * r, '3.14 × ' + r * r + ' = <b>' + fx(3.14 * r * r, 4) + '</b>'], why: 'A = 3.14 × ' + r * r + ' = ' + fx(3.14 * r * r, 4), meta: { r: r, area: true } });
  };
  G['geo-composite'] = function () {
    if (Math.random() < 0.5) {
      var a = R(4, 12), b = R(3, 9), c = R(2, 8), d = R(2, 7), A1 = a * b, A2 = c * d;
      return Q('geo-composite', 'Find the <b>total area</b> of this shape made of two rectangles.<div class="figwrap">' + figTwoRect(a, b, c, d) + '</div>', A1 + A2, { unit: 'square units', traps: [[A1, 'Add the area of the second rectangle too'], [A2, 'Add the area of the first rectangle too'], [2 * (a + b) + 2 * (c + d), 'Area, not perimeter']], steps: ['Rectangle A: ' + a + ' × ' + b + ' = ' + A1, 'Rectangle B: ' + c + ' × ' + d + ' = ' + A2, 'Add: ' + A1 + ' + ' + A2 + ' = <b>' + (A1 + A2) + '</b>'], why: A1 + ' + ' + A2 + ' = ' + (A1 + A2), meta: { sum: A1 + A2 } });
    }
    var w = pick([6, 8, 10, 12, 14]), h = R(3, 9), t = R(3, 9), A1b = w * h, A2b = w * t / 2;
    return Q('geo-composite', 'Find the <b>total area</b> of this house shape (a rectangle with a triangle on top).<div class="figwrap">' + figRectTri(w, h, t) + '</div>', fx(A1b + A2b, 2), { unit: 'square units', traps: [[A1b, 'Add the triangle\'s area too'], [A1b + w * t, 'The triangle is HALF of w × t'], [A2b, 'Add the rectangle\'s area too']], steps: ['Rectangle: ' + w + ' × ' + h + ' = ' + A1b, 'Triangle: ½ × ' + w + ' × ' + t + ' = ' + fx(A2b, 2), 'Add: ' + A1b + ' + ' + fx(A2b, 2) + ' = <b>' + fx(A1b + A2b, 2) + '</b>'], why: A1b + ' + ' + fx(A2b, 2) + ' = ' + fx(A1b + A2b, 2), meta: { sum: A1b + A2b } });
  };

  // =============== WORLD 7: FINANCIAL LITERACY
  var FINV = [
    ['Money placed into an account is called a...', 'Deposit', ['Withdrawal', 'Transfer', 'Expense'], 'A deposit is + on a check register.'],
    ['Money taken out of an account is a...', 'Withdrawal', ['Deposit', 'Balance', 'Credit'], 'A withdrawal is − on a check register.'],
    ['A <b>transfer</b> on a check register can be...', 'Either + or −', ['Only +', 'Only −', 'Neither'], 'Moving money in is +, moving it out is −.'],
    ['<b>Rent</b> is the same every month. It is a...', 'Fixed expense', ['Variable expense', 'Deposit', 'Credit'], 'Fixed expenses do not change month to month.'],
    ['<b>Groceries</b> cost different amounts each month. They are a...', 'Variable expense', ['Fixed expense', 'Deposit', 'Transfer'], 'Variable expenses change from month to month.'],
    ['A <b>debit card</b> is linked to a...', 'Checking account', ['Credit report', 'Loan', 'Mortgage'], 'Debit spends YOUR money from checking.'],
    ['A <b>credit card</b> lets you...', 'Borrow money and pay it back later', ['Spend only what you have', 'Get free money', 'Skip paying'], 'Credit = trust that you will pay back later.'],
    ['What is a <b>budget</b>?', 'An estimate of income and spending', ['A record of what you actually spent', 'A credit score', 'A kind of loan'], 'A budget is a plan; a check register is the record.'],
    ['What is a <b>check register</b>?', 'A record of actual income and expenses', ['A plan for spending', 'A credit card', 'A bank loan'], 'The check register shows what actually happened.'],
    ['Why use a check register?', 'To know how much money you have', ['To get a loan', 'To raise your credit score', 'To avoid banks'], 'Registers keep track of your real balance.'],
    ['A record of a borrower\'s responsible repayment of debts is a...', 'Credit history', ['Budget', 'Deposit', 'Transfer'], 'Credit history shows how well you repay.'],
    ['Spending a lot makes your <b>spending</b> someone else\'s...', 'Income', ['Debt', 'Budget', 'Mortgage'], 'Your spending is another person\'s income.']
  ];
  G['fin-vocab'] = function () {
    var it = pick(FINV), ch = [{ t: it[1], ok: true }].concat(it[2].map(function (x) { return { t: x, ok: false, w: 'Think about the money word\'s meaning' }; }));
    return Q('fin-vocab', it[0], it[1], { mc: true, alg: 'text', choices: ch, steps: ['Remember the money words from your study guide.'], why: it[3] });
  };
  G['fin-register'] = function () {
    var start = pick([100, 150, 200, 250, 300, 500]), n = pick([3, 4]), rows = [], bal = start, names = [['Paycheck', 1], ['Birthday gift', 1], ['Grocery store', -1], ['Phone bill', -1], ['Shoes', -1], ['Transfer in', 1], ['Transfer out', -1], ['Movie night', -1], ['Babysitting', 1], ['Gas', -1]];
    var used = shuffle(names).slice(0, n);
    used.forEach(function (it, i) { var amt = pick([10, 15, 20, 25, 30, 40, 45, 60, 75, 80]); if (i === 0 && it[1] < 0) amt = Math.min(amt, start - 5); rows.push({ d: it[0], s: it[1], a: amt }); bal += it[1] * amt; });
    var wrongBal = start + rows.reduce(function (acc, r) { return acc + Math.abs(r.a); }, 0), tr = [[wrongBal, 'Withdrawals SUBTRACT. Only deposits and + transfers add']];
    var firstSignFlip = start + rows.reduce(function (acc, r, i) { return acc + (i === 0 ? -r.s : r.s) * r.a; }, 0); tr.push([firstSignFlip, 'Check the first line: is it + or −?']);
    var run = start, table = '<table class="reg"><tr><th>#</th><th>What</th><th>Type</th><th>Amount</th></tr><tr><td></td><td>Starting balance</td><td></td><td>$' + start + '</td></tr>';
    rows.forEach(function (r, i) { table += '<tr><td>' + (i + 1) + '</td><td>' + r.d + '</td><td>' + (r.s > 0 ? '<b class="plus">+</b>' : '<b class="minus">−</b>') + '</td><td>$' + r.a + '</td></tr>'; });
    table += '</table>';
    var st = [], r2 = start; rows.forEach(function (r) { var nb = r2 + r.s * r.a; st.push((r.s > 0 ? 'Add ' : 'Subtract ') + '$' + r.a + ': ' + S(r2) + (r.s > 0 ? ' + ' : ' − ') + r.a + ' = ' + S(nb)); r2 = nb; });
    return Q('fin-register', 'Balance this check register. What is the <b>ending balance</b>?' + table, '$' + bal, { unit: 'dollars', traps: tr, steps: st, why: 'Ending balance: ' + (bal < 0 ? MINUS + '$' + Math.abs(bal) + ' (overdrawn!)' : '$' + bal), meta: { start: start, rows: rows, bal: bal } });
  };
  G['fin-pctof'] = function () {
    var p = pick([5, 10, 15, 20, 25, 30, 40, 50, 75]), n = pick([20, 40, 60, 80, 100, 120, 200, 240]), t = R(0, 2), v = p * n / 100;
    if (t === 0) return Q('fin-pctof', 'What is <b>' + p + '% of ' + n + '</b>?', fx(v, 2), { traps: [[p * n, 'Turn the percent into a DECIMAL first (÷100, "Dr. Pepper")'], [p / n, 'Multiply the decimal by the number']], steps: [p + '% = ' + fx(p / 100, 3), fx(p / 100, 3) + ' × ' + n + ' = <b>' + fx(v, 2) + '</b>'], why: p + '% of ' + n + ' = ' + fx(v, 2), meta: { p: p, n: n } });
    if (t === 1) return Q('fin-pctof', 'A shirt costs <b>$' + n + '</b> and is <b>' + p + '% off</b>. How much do you <b>save</b>?', fx(v, 2), { unit: 'dollars', traps: [[n - v, 'That\'s the sale PRICE. The question asks how much you SAVE'], [p * n, 'Turn the percent into a decimal first']], steps: ['Discount = ' + p + '% of ' + n, fx(p / 100, 3) + ' × ' + n + ' = <b>$' + fx(v, 2) + '</b>'], why: 'You save $' + fx(v, 2), meta: { p: p, n: n } });
    return Q('fin-pctof', 'A shirt costs <b>$' + n + '</b> and is <b>' + p + '% off</b>. What is the <b>sale price</b>?', fx(n - v, 2), { unit: 'dollars', traps: [[v, 'That\'s only the discount. Subtract it from the price'], [n + v, 'A discount makes the price LOWER']], steps: ['Discount: ' + fx(p / 100, 3) + ' × ' + n + ' = ' + fx(v, 2), 'Sale price: ' + n + ' − ' + fx(v, 2) + ' = <b>$' + fx(n - v, 2) + '</b>'], why: 'Sale price = $' + fx(n - v, 2), meta: { p: p, n: n, price: true } });
  };
  G['fin-pctfrom'] = function () {
    var pct = pick([2, 5, 8, 10, 12.5, 15, 20, 25, 30, 40, 50]), ref = pick([40, 80, 200, 400, 500, 800, 1000]), foc = pct * ref / 100;
    if (foc !== Math.round(foc * 100) / 100) return G['fin-pctfrom']();
    var cs = [['makes $' + fx(foc, 2) + ' on a $' + ref + ' investment. What is the <b>% profit</b>?'], ['saves $' + fx(foc, 2) + ' out of $' + ref + '. What <b>percent</b> was saved?'], ['got ' + fx(foc, 2) + ' questions right out of ' + ref + '. What percent is that?']];
    var t = R(0, 1), who = pick(['Old Tom', 'Zoe', 'Maya', 'Jay']);
    var p = (t === 0 ? who + ' ' : who + ' ') + cs[t][0];
    return Q('fin-pctfrom', p, pct + '%', { traps: [[fx(ref / foc * 100, 3) + '%', 'Focus (the part) goes on TOP, reference (the whole) on the bottom'], [fx(foc / ref, 4) + '%', 'Multiply by 100 to get a percent'], [fx(foc, 3) + '%', 'Divide by the starting amount, then × 100']], steps: ['focus/reference = x/100', fx(foc, 2) + '/' + ref + ' = x/100', fx(foc, 2) + ' ÷ ' + ref + ' = ' + fx(foc / ref, 4), '× 100 = <b>' + pct + '%</b>'], why: foc + '/' + ref + ' = ' + pct + '/100', meta: { foc: foc, ref: ref, pct: pct } });
  };
  G['fin-salary'] = function () {
    var low = pick([28000, 30000, 32000, 35000, 40000]), diff = pick([10000, 12000, 15000, 20000, 25000]), high = low + diff, yrs = pick([5, 10, 15, 20]), cost = pick([20000, 30000, 40000, 50000]);
    var ans = diff * yrs - cost; if (ans <= 0) return G['fin-salary']();
    return Q('fin-salary', 'Job A pays <b>' + money(low) + '</b> a year with no college. Job B pays <b>' + money(high) + '</b> a year but needs college that costs <b>' + money(cost) + '</b>. After <b>' + yrs + ' years</b>, how much <b>more</b> has Job B earned (counting the college cost)?', ans, { unit: 'dollars', traps: [[diff * yrs, 'Don\'t forget to SUBTRACT the cost of college'], [diff - cost, 'Multiply the yearly difference by the number of YEARS first'], [(low + high) * yrs - cost, 'Subtract the salaries to find the DIFFERENCE']], steps: ['Difference: ' + money(high) + ' − ' + money(low) + ' = ' + money(diff), 'Times ' + yrs + ' years: ' + money(diff * yrs), 'Subtract college: ' + money(diff * yrs) + ' − ' + money(cost) + ' = <b>' + money(ans) + '</b>'], why: 'Job B earns ' + money(ans) + ' more', meta: { diff: diff, yrs: yrs, cost: cost } });
  };
  var FCRED = [
    ['A credit report score of <b>800 to 850</b> means...', 'Good credit', ['Bad credit', 'No credit', 'A bankruptcy'], 'Good credit → approved for loans, mortgage, credit cards.'],
    ['A score in the <b>600 to 700</b> range (on your chart) points to...', 'Bad credit', ['Good credit', 'A scholarship', 'A grant'], 'Bad credit → no loans, mortgage, or credit cards.'],
    ['How long do <b>foreclosure and bankruptcy</b> stay on your record?', '7 years', ['1 year', '3 years', 'Forever'], 'They stay for 7 years!'],
    ['Which one is <b>NOT</b> a primary way to pay for college?', 'Hoping to find money on the street', ['Scholarships', 'Grants', 'Student loans'], 'The five ways: savings, scholarships, grants, student loans, work-study.'],
    ['<b>Work-study</b> is a way to...', 'Pay for college by working', ['Skip college', 'Raise your credit score', 'Open a bank'], 'Work-study = working to help pay for school.'],
    ['What can <b>good credit</b> help you get approved for?', 'Loans, a mortgage, and credit cards', ['Nothing', 'Only scholarships', 'Only a checking account'], 'Good credit opens doors to loans, mortgages, cards, leasing and hiring.'],
    ['What can <b>bad credit</b> cause?', 'No loans, no mortgage, no credit cards', ['Free money', 'More scholarships', 'A higher salary'], 'Bad credit blocks loans, mortgages, cards and can cause hiring and leasing issues.'],
    ['Money you do <b>NOT</b> have to pay back for college is a...', 'Grant or scholarship', ['Student loan', 'Credit card', 'Mortgage'], 'Grants and scholarships are gifts; loans must be repaid.']
  ];
  G['fin-credit'] = function () {
    var it = pick(FCRED), ch = [{ t: it[1], ok: true }].concat(it[2].map(function (x) { return { t: x, ok: false, w: 'Check the credit and college chart in your study guide' }; }));
    return Q('fin-credit', it[0], it[1], { mc: true, alg: 'text', choices: ch, steps: ['Look back at the Financial Flowchart in the study guide.'], why: it[3] });
  };

  MD.make = function (id) { var q = G[id](); q.id = id; return q; };
})();
