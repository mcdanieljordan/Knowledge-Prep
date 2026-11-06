'use strict';
/* ===== Content part 1: helpers + Compound Words, Articles, -er endings, Vowel sounds ===== */
const LVN = { 1: 5, 2: 6, 3: 6, 4: 6, 5: 8 };          // questions per level (level 5 = boss)
const LVNAME = ['', 'Peek', 'Pick', 'Play', 'Prove', 'Boss'];
const LVICON = ['', '🌸', '🌈', '🎮', '✏️', '👑'];
const NEED = { 1: .7, 2: .75, 3: .8, 4: .85, 5: .9 };     // share of points needed to pass
const D = (name, list) => deck(name, list);
const norm = s => String(s).toLowerCase().replace(/[.,!?;:]/g, '').replace(/[-_]/g, '').replace(/\s+/g, ' ').trim();
const dedupe = a => [...new Set(a)];
const others = (pool, ok, n, key) => pickN(dedupe(pool.map(x => key ? key(x) : x)).filter(x => x !== ok), n);
function pk(q, ok, wrongs, o = {}) {
  wrongs = dedupe(wrongs).filter(w => w !== ok);
  const opts = shuffle([ok, ...wrongs]);
  return Object.assign({ k: 'pick', q, opts, a: opts.indexOf(ok), ans: ok }, o);
}
const ty = (q, ans, o = {}) => Object.assign({ k: 'type', q, ans: [].concat(ans) }, o);
function bd(q, target, extra, o = {}) { return Object.assign({ k: 'build', q, target, tiles: shuffle([...target, ...(extra || [])]), join: o.join == null ? ' ' : o.join }, o); }
const so = (q, buckets, items, o = {}) => Object.assign({ k: 'sort', q, buckets, items: shuffle(items) }, o);
const pr = (q, pairs, o = {}) => Object.assign({ k: 'pair', q, pairs }, o);
const lb = (q, words, labels, o = {}) => Object.assign({ k: 'label', q, words, labels }, o);
const sl = (q, words, at, o = {}) => Object.assign({ k: 'split', q, words, at }, o);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const B = s => `<b>${s}</b>`;
const SKILLS = [];

/* ---------------- 1. Compound words ---------------- */
const COMP = [
  ['sun', 'flower', '🌻'], ['rain', 'bow', '🌈'], ['cup', 'cake', '🧁'], ['snow', 'man', '⛄'], ['butter', 'fly', '🦋'], ['foot', 'ball', '⚽'],
  ['pan', 'cake', '🥞'], ['tooth', 'brush', '🪥'], ['bed', 'room', '🛏️'], ['star', 'fish', '⭐'], ['fire', 'fly', '✨'], ['back', 'pack', '🎒'],
  ['class', 'room', '🏫'], ['home', 'work', '📚'], ['sand', 'box', '🏖️'], ['lunch', 'box', '🥪'], ['air', 'plane', '✈️'], ['gold', 'fish', '🐠'],
  ['head', 'band', '🎀'], ['arm', 'chair', '💺'], ['sun', 'screen', '🧴'], ['butter', 'milk', '🥛'], ['tea', 'cup', '🍵'], ['waist', 'band', '👖'],
  ['head', 'rest', '💺'], ['sun', 'set', '🌇'], ['up', 'set', '😢'], ['off', 'set', '↔️'], ['butter', 'cup', '🌼'], ['arm', 'rest', '🛋️']
];
const COMP_EASY = COMP.slice(0, 12);
const COMP_PAGE = [['head', 'rest'], ['arm', 'chair'], ['sun', 'screen'], ['butter', 'milk'], ['waist', 'band'], ['tea', 'cup'], ['up', 'set']];
const compWord = c => c[0] + c[1];
const compHint = c => `${c[0]} + ${c[1]}`;
const NOTCOMP = [['happy', 'a feeling word'], ['running', 'one word with -ing'], ['sunny', 'sun + y is not two words'], ['careful', 'care + ful is a suffix word'], ['playing', 'play + ing is a suffix word']];
SKILLS.push({
  id: 'comp', name: 'Compound Words', icon: '🧩', c: '#ff5fa8', soft: '#ffe0ef', place: 'Puzzle Pond',
  blurb: 'Two small words snap together to make one big word!',
  method: 'A compound word is made of two smaller words joined together with no space (sun + set = sunset). The meaning often comes from both parts.',
  learn: [
    ['Two words, one word!', 'A <b>compound word</b> is two small words joined together.', [['sun + flower', 'sunflower 🌻'], ['rain + bow', 'rainbow 🌈']]],
    ['No space in the middle', 'We write them as ONE word. Do not leave a gap.', [['sun set ❌', 'sunset ✅'], ['tea cup ❌', 'teacup ✅']]],
    ['Look for the little words', 'To read a big word, find the two words hiding inside it.', [['headband', 'head + band'], ['armchair', 'arm + chair']]]
  ],
  gen(lv) {
    const E = D('comp_e', COMP_EASY), A = D('comp_a', COMP);
    if (lv === 1) return E.draw(5).map(c => pk(`${c[2]}<br>${B(c[0])} + ${B(c[1])} = ?`, compWord(c), [c[0] + ' ' + c[1], c[1] + c[0]], { hint: 'Put the two words together with no space.', why: `${compHint(c)} makes ${B(compWord(c))}.`, tag: 'gap-or-swap' }));
    if (lv === 2) return A.draw(6).map(c => pk(`Which word is made from ${B(c[0])} + ${B(c[1])}?`, compWord(c), [c[1] + c[0], c[0] + c[1][0] + c[1], c[0].slice(0, -1) + c[1]], { hint: 'Say the first word, then the second word, fast!', why: `${compHint(c)} = ${compWord(c)}`, tag: 'wrong-join' }));
    if (lv === 3) {
      const sets = shuffle(COMP_PAGE), out = [];
      out.push(pr('Match each word to its partner to make a compound word.', sets.slice(0, 4).map(p => [p[0], p[1]]), { join: true, why: 'Say each pair out loud to check it.' }));
      out.push(pr('Match each word to its partner.', sets.slice(3, 7).map(p => [p[0], p[1]]), { join: true }));
      A.draw(2).forEach(c => out.push(bd(`${c[2]} Build the word: ${B(c[0])} + ${B(c[1])}`, [c[0], c[1]], pickN(dedupe(COMP.flat()).filter(x => x !== c[0] && x !== c[1]), 2), { join: '', why: `${compHint(c)} = ${compWord(c)}`, tag: 'build' })));
      const so1 = COMP.filter(c => c[0].length <= 5).slice(0, 12); const pick8 = pickN(so1, 3);
      out.push(...pick8.slice(0, 2).map(c => pk(`Which two little words are inside ${B(compWord(c))}?`, compHint(c), pickN(COMP.filter(x => x !== c), 3).map(compHint), { why: `${compWord(c)} = ${compHint(c)}` })));
      return out.slice(0, 6);
    }
    if (lv === 4) return A.draw(6).map((c, i) => i % 2 ? bd(`${c[2]} Build the compound word: ${B(c[0])} + ${B(c[1])}`, [c[0], c[1]], pickN(COMP, 2).map(x => x[1]).filter(w => w !== c[1] && w !== c[0]).slice(0, 2), { join: '', why: compHint(c) + ' = ' + compWord(c) }) : ty(`${c[2]} Type the compound word: ${B(c[0])} + ${B(c[1])}`, compWord(c), { hint: 'Join them with no space.', why: compHint(c) + ' = ' + compWord(c), tag: 'spelling' }));
    const out = [];
    A.draw(3).forEach(c => out.push(ty(`${c[2]} Type the compound word: ${B(c[0])} + ${B(c[1])}`, compWord(c), { why: compHint(c) + ' = ' + compWord(c), tag: 'spelling' })));
    A.draw(2).forEach(c => out.push(pk(`Which word is made from ${B(c[0])} + ${B(c[1])}?`, compWord(c), [c[1] + c[0], c[0] + ' ' + c[1], c[0] + c[1] + 's'].filter(x => x !== compWord(c)), { why: compHint(c) + ' = ' + compWord(c) })));
    out.push(so('Sort: compound word or not?', ['Compound word', 'Not compound'], [['sunset', 0], ['teacup', 0], ['headband', 0], ['happy', 1], ['running', 1], ['playing', 1]], { why: 'A compound word has two whole words inside it.' }));
    out.push(pr('Match each word to its partner.', pickN(COMP_PAGE, 5), { join: true }));
    out.push(pk('Which is a compound word?', pick1(['butterfly', 'sunscreen', 'armchair']), ['happy', 'running', 'careful'], { why: 'It has two whole words inside it.' }));
    return shuffle(out).slice(0, 8);
  }
});

/* ---------------- 2. Articles and adjectives ---------------- */
const ART_PHRASES = [
  ['a', 'laptop', 'computer', ['Adjective', 'Adjective', 'Noun']], ['an', 'extra', 'ticket', ['Adjective', 'Adjective', 'Noun']], ['the', 'green', 'paint', ['Adjective', 'Adjective', 'Noun']],
  ['a', 'long', 'train', ['Adjective', 'Adjective', 'Noun']], ['the', 'evil', 'queen', ['Adjective', 'Adjective', 'Noun']], ['the', 'plain', 'oil', ['Adjective', 'Adjective', 'Noun']]
];
const ART_EXTRA = [['a', 'big', 'dog'], ['an', 'old', 'shoe'], ['the', 'red', 'ball'], ['a', 'happy', 'girl'], ['the', 'tiny', 'ant'], ['an', 'orange', 'cat'], ['a', 'soft', 'pillow'], ['the', 'loud', 'drum'], ['an', 'icy', 'lake'], ['a', 'brave', 'knight']].map(x => [...x, ['Adjective', 'Adjective', 'Noun']]);
const ALLPH = ART_PHRASES.concat(ART_EXTRA);
const AN_WORDS = ['apple', 'egg', 'orange', 'owl', 'ant', 'ice cream', 'umbrella', 'elephant', 'ear', 'inch', 'arm', 'octopus'];
const A_WORDS = ['dog', 'cat', 'pig', 'ball', 'bike', 'frog', 'kite', 'book', 'sun', 'tree', 'moon', 'unicorn', 'house', 'duck'];
SKILLS.push({
  id: 'art', name: 'Articles & Adjectives', icon: '🎨', c: '#8f5cf2', soft: '#eee4ff', place: 'Glitter Gallery',
  blurb: 'A, an, and the are describing words too! They are called articles.',
  method: 'An adjective describes a noun. The words a, an, and the are articles, and articles are adjectives. Use "an" before a vowel sound (an apple) and "a" before a consonant sound (a dog). In "a laptop computer" the words a and laptop describe computer, so they are adjectives and computer is the noun.',
  learn: [
    ['Adjectives describe', 'An <b>adjective</b> tells more about a noun.', [['the green paint', 'green describes paint'], ['a long train', 'long describes train']]],
    ['Articles are adjectives', '<b>a</b>, <b>an</b>, and <b>the</b> are adjectives too. They are called <b>articles</b>.', [['a laptop computer', 'a = adjective, laptop = adjective, computer = noun']]],
    ['A or AN?', 'Use <b>an</b> before a vowel sound (a, e, i, o, u). Use <b>a</b> before a consonant sound.', [['an apple', 'a dog'], ['an egg', 'a frog']]]
  ],
  gen(lv) {
    const aw = () => { const an = Math.random() < .5; const w = an ? pick1(AN_WORDS) : pick1(A_WORDS); return { an, w }; };
    const art = ({ an, w }) => an ? 'an' : 'a';
    if (lv === 1) return Array.from({ length: 5 }, () => aw()).map(x => pk(`Pick the right word:<br><b>___ ${x.w}</b>`, art(x), [art(x) === 'a' ? 'an' : 'a'], { hint: x.an ? 'It starts with a vowel sound, so use AN.' : 'It starts with a consonant sound, so use A.', why: x.an ? `${x.w} starts with a vowel sound, so we say an ${x.w}.` : `${x.w} starts with a consonant sound, so we say a ${x.w}.`, tag: 'a-vs-an' }));
    if (lv === 2) return D('art2', ALLPH).draw(6).map((p, i) => i % 2 ? pk(`Which word in <b>${p[0]} ${p[1]} ${p[2]}</b> is the NOUN?`, p[2], [p[0], p[1]], { why: `${p[2]} is the noun. ${p[0]} and ${p[1]} describe it.`, tag: 'noun-vs-adj' }) : pk(`Which word describes the noun in <b>${p[0]} ${p[1]} ${p[2]}</b>?`, p[1], [p[2], p[1] === p[0] ? 'x' : p[0]].filter(x => x !== 'x'), { hint: 'The adjective comes before the noun.', why: `${p[1]} describes ${p[2]}.`, tag: 'adj' }));
    if (lv === 3) return D('art3', ALLPH).draw(6).map(p => lb(`Label each word: <b>Adjective</b> or <b>Noun</b>?`, [[p[0], 'Adjective'], [p[1], 'Adjective'], [p[2], 'Noun']], ['Adjective', 'Noun'], { hint: 'Remember: a, an, the are adjectives too!', why: `${p[0]} and ${p[1]} are adjectives (they describe). ${p[2]} is the noun.`, tag: 'article-adj' }));
    if (lv === 4) { const q = []; D('art4', ALLPH).draw(3).forEach(p => q.push(ty(`Type the adjective that is NOT an article:<br><b>${p[0]} ${p[1]} ${p[2]}</b>`, p[1], { why: `${p[1]} describes ${p[2]}.`, tag: 'adj' }))); Array.from({ length: 3 }, () => aw()).forEach(x => q.push(ty(`Type a or an:<br><b>___ ${x.w}</b>`, art(x), { why: `We say ${art(x)} ${x.w}.`, tag: 'a-vs-an' }))); return shuffle(q); }
    const q = []; D('art5', ART_PHRASES).draw(4).forEach(p => q.push(lb(`Label each word: <b>Adjective</b> or <b>Noun</b>?`, [[p[0], 'Adjective'], [p[1], 'Adjective'], [p[2], 'Noun']], ['Adjective', 'Noun'], { why: `${p[0]} and ${p[1]} are adjectives. ${p[2]} is the noun.`, tag: 'article-adj' })));
    Array.from({ length: 2 }, () => aw()).forEach(x => q.push(ty(`Type a or an:<br><b>___ ${x.w}</b>`, art(x), { why: `We say ${art(x)} ${x.w}.`, tag: 'a-vs-an' })));
    q.push(pk('Which of these words is an adjective?', pick1(['the', 'a', 'an']), ['run', 'table', 'quickly'], { why: 'Articles (a, an, the) are adjectives.', tag: 'article-adj' }));
    q.push(pk('Which group has ONLY adjectives?', 'a, big, the', ['a, dog, the', 'big, run, the', 'an, apple, red'], { why: 'dog, run, and apple are not adjectives.', tag: 'article-adj' }));
    return shuffle(q);
  }
});

/* ---------------- 3. -er endings ---------------- */
const ER_SIMPLE = ['short', 'gray', 'black', 'long', 'plain', 'clean', 'strong', 'fast', 'tall', 'small', 'cold', 'loud', 'tough', 'quick', 'dark', 'slow', 'smart', 'high', 'deep', 'soft', 'old', 'warm', 'young', 'light'];
const ER_E = ['nice', 'large', 'cute', 'wide', 'safe', 'late', 'close', 'brave'];
const ER_DBL = ['big', 'hot', 'sad', 'fat', 'thin', 'red', 'wet', 'mad', 'flat'];
const ER_Y = ['happy', 'funny', 'silly', 'easy', 'busy', 'lucky', 'tiny', 'sunny', 'messy', 'pretty'];
const erOf = w => ER_SIMPLE.includes(w) ? w + 'er' : ER_E.includes(w) ? w + 'r' : ER_DBL.includes(w) ? w + w.slice(-1) + 'er' : w.slice(0, -1) + 'ier';
const erWrong = w => { const c = [w + 'er', w + 'r', w + w.slice(-1) + 'er', w.replace(/y$/, '') + 'er', w.replace(/y$/, '') + 'ier', w.replace(/e$/, '') + 'er', w + 'ier']; return dedupe(c).filter(x => x !== erOf(w)); };
const ER_ALL = [...ER_SIMPLE, ...ER_E, ...ER_DBL, ...ER_Y];
const erRule = w => ER_SIMPLE.includes(w) ? 'Just add -er.' : ER_E.includes(w) ? 'It ends in e, so just add -r.' : ER_DBL.includes(w) ? 'Double the last letter, then add -er.' : 'Change the y to i, then add -er.';
SKILLS.push({
  id: 'er', name: 'Adding -er', icon: '📏', c: '#2fa6e8', soft: '#dff3ff', place: 'Comparison Cliffs',
  blurb: 'Add -er to a describing word to compare two things.',
  method: 'Add the ending -er to an adjective to compare two things (short, shorter). If a word ends in e, add just r (nice, nicer). If it ends in one vowel and one consonant, double the last letter (big, bigger). If it ends in a consonant plus y, change y to i (happy, happier).',
  learn: [
    ['Compare two things', 'Add <b>-er</b> to a describing word to compare two things.', [['short → shorter', 'The pencil is shorter than the ruler.'], ['strong → stronger', 'My dad is stronger than me.']]],
    ['Most words: just add -er', 'Write the word, then add <b>er</b> at the end. Nothing else changes!', [['long → longer', 'fast → faster'], ['clean → cleaner', 'plain → plainer']]],
    ['A few special words', 'Words that end in e just add <b>r</b> (nice → nicer). Short words like big double the last letter (big → bigger). Words ending in y change to <b>ier</b> (happy → happier).', [['nice → nicer', 'big → bigger'], ['happy → happier', '']]]
  ],
  gen(lv) {
    const S1 = D('er1', ER_SIMPLE), A = D('er_a', ER_ALL);
    if (lv === 1) return S1.draw(5).map(w => pk(`Add <b>-er</b> to ${B(w)}`, erOf(w), [w + 'r', w + 'est'], { hint: 'Write the word, then add er.', why: `${w} + er = ${erOf(w)}`, tag: 'add-er' }));
    if (lv === 2) return S1.draw(6).map(w => pk(`${cap(w)}. Compare two things: ${B(w + ' + er')} = ?`, erOf(w), erWrong(w).slice(0, 3), { why: `${w} + er = ${erOf(w)}`, tag: 'add-er' }));
    if (lv === 3) { const q = []; S1.draw(2).forEach(w => q.push(bd(`Build the word: ${B(w)} + ${B('er')}`, [w, 'er'], ['ed', 'ing'], { join: '', why: `${w} + er = ${erOf(w)}`, tag: 'add-er' }))); q.push(so('Sort the words: do they just add -er, or change?', ['Just add -er', 'Change first'], [['long', 0], ['clean', 0], ['fast', 0], ['big', 1], ['happy', 1], ['nice', 1]], { why: 'big doubles, happy changes y to i, and nice just adds r.' })); A.draw(3).forEach(w => q.push(pk(`Which is the best -er word for ${B(w)}?`, erOf(w), erWrong(w).slice(0, 3), { hint: erRule(w), why: `${w} → ${erOf(w)}. ${erRule(w)}`, tag: 'er-rule' }))); return shuffle(q); }
    if (lv === 4) return S1.draw(3).map(w => ty(`Type the -er word for ${B(w)}`, erOf(w), { why: `${w} + er = ${erOf(w)}`, tag: 'spelling' })).concat(A.draw(3, w => !ER_SIMPLE.includes(w)).map(w => ty(`Type the -er word for ${B(w)}`, erOf(w), { hint: erRule(w), why: `${w} → ${erOf(w)}. ${erRule(w)}`, tag: 'er-rule' })));
    const q = []; S1.draw(3).forEach(w => q.push(ty(`Type the -er word for ${B(w)}`, erOf(w), { why: `${w} + er = ${erOf(w)}` })));
    A.draw(3, w => !ER_SIMPLE.includes(w)).forEach(w => q.push(ty(`Type the -er word for ${B(w)}`, erOf(w), { why: `${w} → ${erOf(w)}. ${erRule(w)}`, tag: 'er-rule' })));
    q.push(so('Sort by what you do to the word.', ['Just add -er', 'Double the letter', 'Change y to i'], [['tall', 0], ['soft', 0], ['big', 1], ['hot', 1], ['funny', 2], ['easy', 2]], { why: 'Look at the last letters of the word.' }));
    const w = pick1(['tall', 'fast', 'strong', 'small']); q.push(pk(`A giraffe is ___ than a dog. (${w})`, erOf(w), erWrong(w).slice(0, 3), { why: `We compare two things, so use ${erOf(w)}.` }));
    return shuffle(q);
  }
});

/* ---------------- 4. Vowel sounds: long, short, broad ---------------- */
const VW = {
  a: { short: ['cat', 'hat', 'map', 'bag', 'jam', 'sad'], long: ['cake', 'name', 'game', 'baby', 'paper', 'lake'], broad: ['water', 'walnut', 'fall', 'wasp', 'ball', 'wash', 'call', 'wall', 'talk', 'spa', 'sofa', 'zebra', 'orca', 'toga', 'comma', 'data'] },
  e: { short: ['bed', 'pen', 'red', 'net', 'ten', 'leg'], long: ['me', 'she', 'we', 'he', 'be'] },
  i: { short: ['sit', 'pig', 'big', 'lip', 'kid', 'win'], long: ['hi', 'bike', 'five', 'kite', 'time'] },
  o: { short: ['hop', 'dog', 'pot', 'mop', 'box', 'log'], long: ['go', 'no', 'bone', 'home', 'open', 'so'] },
  u: { short: ['cup', 'sun', 'bug', 'run', 'mud', 'tub'], long: ['cube', 'mule', 'music', 'unit', 'tuba'] }
};
const VMARK = { short: '˘ (short)', long: '¯ (long)', broad: '¨ (broad)' };
const VSAY = { short: 'short', long: 'long', broad: 'broad' };
const vowelPos = (w, v) => { const i = ['spa', 'sofa', 'zebra', 'orca', 'toga', 'comma', 'data', 'papa', 'mama'].includes(w) ? w.lastIndexOf(v) : w.indexOf(v); return i; };
function vwItem(types, vowels) {
  const vs = vowels || Object.keys(VW), v = pick1(vs.filter(x => types.some(t => VW[x][t]))), ts = types.filter(t => VW[v][t]), t = pick1(ts), w = pick1(VW[v][t]);
  return { v, t, w };
}
const vwTxt = it => { const i = vowelPos(it.w, it.v); return it.w.slice(0, i) + `<u class="vowel">${it.v}</u>` + it.w.slice(i + 1); };
const vwSym = (v, t) => (v + (t === 'short' ? '̆' : t === 'long' ? '̄' : '̈'));
SKILLS.push({
  id: 'vow', name: 'Vowel Sounds', icon: '🔔', c: '#ff7a5c', soft: '#ffe6df', place: 'Echo Valley',
  blurb: 'Vowels can be long, short, or broad. Listen and mark them.',
  method: 'A vowel can make a short sound (cat, mark ˘), a long sound that says its name (cake, mark ¯), or a broad sound (water, ball, wash, mark ¨ two dots). The letter a is broad after w and before l (wall, wash, water) and when it is the last sound in a word like spa or sofa.',
  learn: [
    ['Three vowel sounds', '<b>Short</b> ˘ as in cat. <b>Long</b> ¯ says its name, as in cake. <b>Broad</b> ¨ as in water.', [['cat → ă', 'cake → ā'], ['water → ä', '']]],
    ['A can be broad', 'The letter <b>a</b> says the broad sound /ä/ after <b>w</b> (wash, wasp, water) and before <b>l</b> (ball, call, fall, wall).', [['wash, wasp, water', 'ball, call, fall, wall']]],
    ['Last A says /ä/', 'When <b>a</b> is the last sound in a word it says /ä/: spa, sofa, zebra, data, comma.', [['spa, orca, toga', 'zebra, data, comma']]]
  ],
  gen(lv) {
    const A = (types, n, vs) => Array.from({ length: n }, () => vwItem(types, vs));
    if (lv === 1) return A(['short', 'long'], 5, ['a']).map(it => pk(`Listen: ${B(it.w)} 🔊<br>Is the ${B(it.v)} short or long?`, VSAY[it.t], [VSAY[it.t === 'short' ? 'long' : 'short']], { say: it.w, hint: 'Short sounds quick (cat). Long says its own name (cake).', why: `In ${it.w} the ${it.v} is ${it.t}.`, tag: 'long-short' }));
    if (lv === 2) return A(['short', 'long', 'broad'], 6, ['a']).map(it => pk(`Say it: ${B(it.w)} 🔊<br>What sound does the <b>a</b> make?`, VSAY[it.t], ['short', 'long', 'broad'].filter(x => x !== it.t), { say: it.w, hint: 'After w or before l the a is usually broad.', why: `In ${it.w} the a is ${it.t} (${VMARK[it.t]}).`, tag: 'broad-a' }));
    if (lv === 3) { const mk = () => { const pool = { short: pickN(VW.a.short, 2), long: pickN(VW.a.long, 2), broad: pickN(VW.a.broad, 3) }; return so('Sort each word by the sound of the <b>a</b>.', ['short ˘', 'long ¯', 'broad ¨'], [...pool.short.map(w => [w, 0]), ...pool.long.map(w => [w, 1]), ...pool.broad.map(w => [w, 2])], { why: 'Say each word out loud and listen to the a.', tag: 'sort-vowel' }); }; return [mk(), mk(), ...A(['short', 'long', 'broad'], 4, ['a']).map(it => pk(`${vwTxt(it)} 🔊<br>Which mark goes over the a?`, vwSym('a', it.t), ['short', 'long', 'broad'].filter(x => x !== it.t).map(t => vwSym('a', t)), { say: it.w, why: `${it.w}: ${vwSym('a', it.t)}`, tag: 'mark' }))]; }
    if (lv === 4) return A(['short', 'long', 'broad'], 6, ['a', 'e', 'i', 'o', 'u']).map(it => it.t === 'broad' ? pk(`${vwTxt(it)} 🔊<br>Which mark goes over the a?`, vwSym('a', 'broad'), [vwSym('a', 'short'), vwSym('a', 'long')], { say: it.w, why: `${it.w}: ${vwSym('a', 'broad')}`, tag: 'broad-a' }) : pk(`${vwTxt(it)} 🔊<br>Which mark goes over the ${it.v}?`, vwSym(it.v, it.t), ['short', 'long'].filter(x => x !== it.t).map(t => vwSym(it.v, t)).concat(it.v === 'a' ? [vwSym('a', 'broad')] : []), { say: it.w, why: `${it.w}: ${vwSym(it.v, it.t)}`, tag: 'mark' }));
    const q = []; A(['short', 'long', 'broad'], 5, ['a', 'e', 'i', 'o', 'u']).forEach(it => q.push(pk(`${vwTxt(it)} 🔊<br>Which mark goes over the ${it.v}?`, vwSym(it.v, it.t), ['short', 'long', 'broad'].filter(x => x !== it.t && (x !== 'broad' || it.v === 'a')).map(t => vwSym(it.v, t)), { say: it.w, why: `${it.w}: ${vwSym(it.v, it.t)}`, tag: 'mark' })));
    q.push(so('Sort each word by the sound of the <b>a</b>.', ['short ˘', 'long ¯', 'broad ¨'], [['cat', 0], ['map', 0], ['cake', 1], ['baby', 1], ['wall', 2], ['wash', 2], ['sofa', 2]], { why: 'Say each word out loud and listen to the a.', tag: 'sort-vowel' }));
    q.push(pk('Which word has a BROAD a?', pick1(['water', 'ball', 'wasp']), ['cat', 'cake', 'map'], { why: 'a after w, or before l, is broad.', tag: 'broad-a' }));
    q.push(pk('Which word has a LONG a?', pick1(['cake', 'name', 'game']), ['cat', 'ball', 'map'], { why: 'Long a says its own name.', tag: 'long-short' }));
    return q;
  }
});
