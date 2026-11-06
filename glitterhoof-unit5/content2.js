'use strict';
/* ===== Content part 2: Phonograms, Roots, Root Detective, Plurals, Past tense ===== */

/* ---------------- 5. Phonograms ---------------- */
const PH = [
  ['ai', 'rain', '/ā/'], ['ay', 'play', '/ā/'], ['oy', 'boy', '/oi/'], ['oi', 'coin', '/oi/'], ['ee', 'feet', '/ē/'], ['ea', 'eat', '/ē/'], ['oa', 'boat', '/ō/'],
  ['ow', 'cow', '/ou/'], ['ou', 'out', '/ou/'], ['ar', 'car', '/ar/'], ['or', 'corn', '/or/'], ['er', 'her', '/er/'], ['ir', 'bird', '/er/'], ['ur', 'fur', '/er/'],
  ['sh', 'ship', '/sh/'], ['ch', 'chip', '/ch/'], ['th', 'thin', '/th/'], ['ck', 'duck', '/k/'], ['ng', 'ring', '/ng/'], ['qu', 'queen', '/kw/']
];
const PH_EASY = PH.filter(p => ['ai', 'ay', 'ee', 'sh', 'ch', 'th', 'oy', 'ar'].includes(p[0]));
const PH_SORT = {
  'ai / ay': [['ai', ['rain', 'mail', 'train', 'paint']], ['ay', ['play', 'day', 'stay', 'tray']]],
  'oi / oy': [['oi', ['coin', 'soil', 'point', 'boil']], ['oy', ['boy', 'toy', 'joy', 'enjoy']]],
  'ee / ea': [['ee', ['feet', 'tree', 'sleep', 'green']], ['ea', ['eat', 'sea', 'meal', 'bead']]],
  'ar / or': [['ar', ['car', 'star', 'farm', 'park']], ['or', ['corn', 'horse', 'fork', 'storm']]]
};
const phWrong = ph => { const grp = [['ai', 'ay', 'ea', 'ee'], ['oy', 'oi', 'ow', 'ou'], ['er', 'ir', 'ur', 'or'], ['sh', 'ch', 'th', 'ck'], ['ng', 'qu', 'ck', 'sh'], ['oa', 'ow', 'ou', 'or'], ['ar', 'or', 'er', 'ir']]; const g = grp.find(x => x.includes(ph)) || grp[0]; return pickN(PH.map(p => p[0]).filter(x => x !== ph && g.includes(x)), 3).concat(pickN(PH.map(p => p[0]).filter(x => x !== ph && !g.includes(x)), 3)).slice(0, 3); };
SKILLS.push({
  id: 'phon', name: 'Phonograms', icon: '🔤', c: '#2fc99e', soft: '#d9f7ee', place: 'Sound Studio',
  blurb: 'Letters that team up to make one sound. Hear it, write it!',
  method: 'A phonogram is one or more letters that stand for one sound. Examples: ai and ay say /ā/ (rain, play), oi and oy say /oi/ (coin, boy), ee and ea say /ē/ (feet, eat), sh, ch, th, ck, ng, qu, and ar, or, er, ir, ur. Ay and oy are used at the end of a word, ai and oi in the middle.',
  learn: [
    ['Letters that team up', 'A <b>phonogram</b> is letters that work together to make one sound.', [['ai, ay → /ā/', 'rain, play'], ['oi, oy → /oi/', 'coin, boy']]],
    ['More teams', '<b>ee</b> and <b>ea</b> say /ē/ (feet, eat). <b>er, ir, ur</b> all say /er/ (her, bird, fur). <b>ar</b> (car) and <b>or</b> (corn).', [['sh, ch, th', 'ship, chip, thin'], ['ck, ng, qu', 'duck, ring, queen']]],
    ['End or middle?', '<b>ay</b> and <b>oy</b> go at the END of a word (play, boy). <b>ai</b> and <b>oi</b> go in the middle (rain, coin).', [['play, day, boy, toy', 'rain, mail, coin, soil']]]
  ],
  gen(lv) {
    const E = D('ph_e', PH_EASY), A = D('ph_a', PH);
    if (lv === 1) return E.draw(5).map(p => pk(`Listen: ${B(p[1])} 🔊<br>Which letters say ${B(p[2])}?`, p[0], [phWrong(p[0])[0]], { say: p[1], hint: `Look in ${p[1]} for the team of letters.`, why: `${p[1]} has ${B(p[0])}. It says ${p[2]}.`, tag: 'phonogram' }));
    if (lv === 2) return A.draw(6).map(p => pk(`Listen: ${B(p[1])} 🔊<br>Which letters say ${B(p[2])} in this word?`, p[0], phWrong(p[0]), { say: p[1], why: `${p[1]} has ${B(p[0])}. It says ${p[2]}.`, tag: 'phonogram' }));
    if (lv === 3) { const keys = pickN(Object.keys(PH_SORT), 2), out = keys.map(k => so(`Sort the words by their spelling team: ${k}`, PH_SORT[k].map(x => x[0]), PH_SORT[k].flatMap((x, i) => pickN(x[1], 3).map(w => [w, i])), { why: 'ay and oy go at the end. ai and oi go in the middle.', tag: 'phonogram-position' })); A.draw(4).forEach(p => out.push(bd(`Listen: ${B(p[1])} 🔊 Build the letters that say ${B(p[2])}`, p[0].split(''), pickN('aeiourtnslp'.split('').filter(l => !p[0].includes(l)), 2), { say: p[1], join: '', why: `${p[1]} has ${B(p[0])}.`, tag: 'phonogram' }))); return out; }
    if (lv === 4) return A.draw(6).map(p => ty(`Listen: ${B(p[1])} 🔊<br>Type the letters that say ${B(p[2])}`, p[0], { say: p[1], hint: `Look for it inside the word ${p[1]}.`, why: `${p[1]} has ${B(p[0])}.`, tag: 'phonogram' }));
    const same = p => PH.filter(x => x[2] === p[2]).map(x => x[0]); const q = A.draw(5).map(p => ty(`🔊 Listen, then type a phonogram for this sound:<br><span class="big">${p[2]}</span>`, same(p), { say: p[1], hideq: true, why: `${p[1]} has ${B(p[0])}. (Other spellings that say ${p[2]} also count!)`, tag: 'dictation' }));
    keys = pickN(Object.keys(PH_SORT), 1).forEach(k => q.push(so(`Sort the words by their spelling team: ${k}`, PH_SORT[k].map(x => x[0]), PH_SORT[k].flatMap((x, i) => pickN(x[1], 3).map(w => [w, i])), { why: 'ay and oy go at the end. ai and oi go in the middle.', tag: 'phonogram-position' })));
    A.draw(2).forEach(p => q.push(pk(`Which letters say ${B(p[2])} in ${B(p[1])}? 🔊`, p[0], phWrong(p[0]), { say: p[1], why: `${p[1]} has ${B(p[0])}.` })));
    return shuffle(q);
  }
});
var keys;

/* ---------------- 6. Roots and morphemes ---------------- */
const MORPH = [
  ['bene', 'good, well', '👍', 'benefit'], ['-ment', 'noun suffix', '🏷️', 'movement'], ['per-', 'thoroughly', '💯', 'persist'], ['manu', 'hand', '✋', 'manual'],
  ['sist', 'to stand', '🧍', 'resist'], ['port', 'to carry', '🎒', 'report'], ['mem', 'mindful, to remember', '🧠', 'memory'], ['in- im- il-', 'in or not', '🚪', 'invisible'],
  ['fact', 'to do, to make', '🛠️', 'factory'], ['ex-', 'out', '➡️', 'exit'], ['tract', 'to pull', '🪢', 'tractor'], ['re-', 'back or again', '🔁', 'return'],
  ['sup-', 'under', '⬇️', 'support'], ['spect', 'to look', '👀', 'inspect']
];
const MORPH_EASY = MORPH.filter(m => ['manu', 'port', 'mem', 'spect', 'bene', 'fact'].includes(m[0]));
const mTyped = m => [m[0], m[0].replace(/[-\s]/g, ''), ...(m[0] === 'in- im- il-' ? ['in', 'im', 'il', 'in-', 'im-', 'il-'] : [])];
SKILLS.push({
  id: 'roots', name: 'Root Meanings', icon: '🌱', c: '#1fb58c', soft: '#d9f7ee', place: 'Root Garden',
  blurb: 'Word parts hold secret meanings. Learn the roots!',
  method: 'Many words are built from word parts called morphemes. Meanings: bene = good, well; -ment = noun suffix; per- = thoroughly; manu = hand; sist = to stand; port = to carry; mem = mindful, to remember; in-/im-/il- = in or not; fact = to do, to make; ex- = out; tract = to pull; re- = back or again; sup- = under; spect = to look.',
  learn: [
    ['Secret meanings', 'A <b>root</b> is a word part with a meaning. If you know the roots you can figure out new words!', [['manu = hand ✋', 'manual'], ['port = to carry 🎒', 'report']]],
    ['Memorize these (part 1)', '<b>bene</b> = good, well · <b>-ment</b> = noun suffix · <b>per-</b> = thoroughly · <b>manu</b> = hand · <b>sist</b> = to stand', [['bene → benefit', 'sist → resist']]],
    ['Memorize these (part 2)', '<b>port</b> = to carry · <b>mem</b> = mindful, to remember · <b>in- im- il-</b> = in or not · <b>fact</b> = to do, to make', [['port → report', 'fact → factory']]],
    ['Extra roots for the roots page', '<b>ex-</b> = out · <b>tract</b> = to pull · <b>re-</b> = back or again · <b>sup-</b> = under · <b>spect</b> = to look', [['extract', 'inspect']]]
  ],
  gen(lv) {
    const E = D('mo_e', MORPH_EASY), A = D('mo_a', MORPH);
    if (lv === 1) return E.draw(5).map(m => pk(`${m[2]} What does ${B(m[0])} mean?`, m[1], [pick1(MORPH.filter(x => x[1] !== m[1]))[1]], { hint: `Think of the word "${m[3]}".`, why: `${m[0]} means ${B(m[1])}, like in ${m[3]}.`, tag: 'meaning' }));
    if (lv === 2) return A.draw(6).map((m, i) => i % 2 ? pk(`Which word part means ${B(m[1])}?`, m[0], others(MORPH, m[0], 3, x => x[0]), { hint: `Think of the word "${m[3]}".`, why: `${m[0]} means ${B(m[1])}.`, tag: 'reverse' }) : pk(`What does ${B(m[0])} mean?`, m[1], others(MORPH, m[1], 3, x => x[1]), { hint: `Think of the word "${m[3]}".`, why: `${m[0]} means ${B(m[1])}, like in ${m[3]}.`, tag: 'meaning' }));
    if (lv === 3) { const s = shuffle(MORPH.slice(0, 9)); const out = [pr('Match each word part to its meaning.', s.slice(0, 4).map(m => [m[0], m[1]]), { why: 'Practice saying each one out loud.' }), pr('Match each word part to its meaning.', s.slice(4, 8).map(m => [m[0], m[1]])), pr('Match each word part to its meaning.', pickN(MORPH.slice(9), 4).map(m => [m[0], m[1]]))]; A.draw(3).forEach(m => out.push(pk(`Which word part is hiding in ${B(m[3])}?`, m[0], others(MORPH, m[0], 3, x => x[0]), { why: `${m[3]} has ${B(m[0])} (${m[1]}).`, tag: 'find-root' }))); return out; }
    if (lv === 4) return A.draw(6).map(m => ty(`Type the word part that means ${B(m[1])}`, mTyped(m), { hint: `It is in "${m[3]}".`, why: `${B(m[0])} means ${m[1]}.`, tag: 'reverse' }));
    const q = []; A.draw(3).forEach(m => q.push(pk(`What does ${B(m[0])} mean?`, m[1], others(MORPH, m[1], 3, x => x[1]), { why: `${m[0]} means ${B(m[1])}.`, tag: 'meaning' }))); A.draw(2).forEach(m => q.push(ty(`Type the word part that means ${B(m[1])}`, mTyped(m), { why: `${B(m[0])} means ${m[1]}.`, tag: 'reverse' })));
    q.push(pr('Match each word part to its meaning.', pickN(MORPH, 5).map(m => [m[0], m[1]])));
    A.draw(2).forEach(m => q.push(pk(`Which word part is hiding in ${B(m[3])}?`, m[0], others(MORPH, m[0], 3, x => x[0]), { why: `${m[3]} has ${B(m[0])}.` })));
    return shuffle(q);
  }
});

/* ---------------- 7. Root Detective (definitions from prefix and root) ---------------- */
const DEC = [
  { w: 'extract', p: ['ex-', 'out'], r: ['tract', 'to pull'], lit: ['to', 'pull', 'out'], dict: 'to take something out', cmp: 'Both mean taking something out.', core: true },
  { w: 'report', p: ['re-', 'back or again'], r: ['port', 'to carry'], lit: ['to', 'carry', 'back'], dict: 'to tell what happened', cmp: 'Both mean bringing something back.', core: true },
  { w: 'support', p: ['sup-', 'under'], r: ['port', 'to carry'], lit: ['to', 'carry', 'from', 'under'], dict: 'to hold something up', cmp: 'Both mean holding something up from below.', core: true },
  { w: 'inspect', p: ['in-', 'in'], r: ['spect', 'to look'], lit: ['to', 'look', 'into'], dict: 'to look at something closely', cmp: 'Both mean looking carefully at something.', core: true },
  { w: 'export', p: ['ex-', 'out'], r: ['port', 'to carry'], lit: ['to', 'carry', 'out'], dict: 'to send goods out of a country' },
  { w: 'import', p: ['im-', 'in'], r: ['port', 'to carry'], lit: ['to', 'carry', 'in'], dict: 'to bring goods into a country' },
  { w: 'resist', p: ['re-', 'back'], r: ['sist', 'to stand'], lit: ['to', 'stand', 'back'], dict: 'to push against something' },
  { w: 'persist', p: ['per-', 'thoroughly'], r: ['sist', 'to stand'], lit: ['to', 'stand', 'thoroughly'], dict: 'to keep going' },
  { w: 'factory', p: ['', ''], r: ['fact', 'to make'], lit: ['a', 'place', 'to', 'make', 'things'], dict: 'a building where things are made' },
  { w: 'manual', p: ['', ''], r: ['manu', 'hand'], lit: ['by', 'hand'], dict: 'done with the hands' }
];
const DEC_CORE = DEC.filter(d => d.core);
const litTxt = d => d.lit.join(' ');
SKILLS.push({
  id: 'decode', name: 'Root Detective', icon: '🔍', c: '#c95bd0', soft: '#fbe3fb', place: 'Detective Dell',
  blurb: 'Use the prefix and root to figure out what a word means!',
  method: 'To find a literal definition, put the meaning of the prefix and the root together. extract = ex (out) + tract (to pull) = to pull out. report = re (back) + port (to carry) = to carry back. support = sup (under) + port (to carry) = to carry from under. inspect = in (in) + spect (to look) = to look into. Then compare it with the dictionary definition.',
  learn: [
    ['Be a word detective', 'Break a word into its parts. Add the meanings together to get the <b>literal definition</b>.', [['extract = ex + tract', 'out + pull = to pull out']]],
    ['Four words to know', '<b>report</b> = re + port = to carry back · <b>support</b> = sup + port = to carry from under · <b>inspect</b> = in + spect = to look into', [['report → carry back', 'inspect → look into']]],
    ['Compare to the dictionary', 'The dictionary definition is the real meaning. See how close your detective guess is!', [['extract: literal = to pull out', 'dictionary = to take something out']]]
  ],
  gen(lv) {
    const C = D('dec_c', DEC_CORE), A = D('dec_a', DEC);
    const partsTxt = d => d.p[0] ? `${d.p[0]} (${d.p[1]}) + ${d.r[0]} (${d.r[1]})` : `${d.r[0]} (${d.r[1]})`;
    if (lv === 1) return C.draw(4).concat(A.draw(1)).map(d => pk(`${B(d.w)} = ${partsTxt(d)}<br>What is the literal meaning?`, litTxt(d), [pick1(DEC.filter(x => x !== d)) && litTxt(pick1(DEC.filter(x => x !== d && litTxt(x) !== litTxt(d))))], { hint: 'Put the two meanings together.', why: `${d.w} = ${B(litTxt(d))}.`, tag: 'literal' }));
    if (lv === 2) return A.draw(6).map(d => pk(`${B(d.w)}<br>What is the literal meaning (prefix + root)?`, litTxt(d), others(DEC, litTxt(d), 3, x => litTxt(x)), { hint: partsTxt(d), why: `${d.w} = ${partsTxt(d)} = ${B(litTxt(d))}.`, tag: 'literal' }));
    if (lv === 3) { const out = []; C.draw(4).forEach(d => out.push(bd(`Build the literal meaning of ${B(d.w)}<br><small>${partsTxt(d)}</small>`, d.lit, pickN(['up', 'down', 'over', 'push', 'fast'].filter(x => !d.lit.includes(x)), 2), { why: `${d.w} = ${B(litTxt(d))}.`, tag: 'literal' }))); out.push(pr('Match each word to its dictionary meaning.', DEC_CORE.map(d => [d.w, d.dict]), { why: 'The dictionary meaning is the real meaning.' })); out.push(pr('Match each word to its literal meaning.', pickN(DEC, 4).map(d => [d.w, litTxt(d)]))); return out; }
    if (lv === 4) { const out = C.draw(4).map(d => bd(`Write the literal definition of ${B(d.w)}<br><small>${partsTxt(d)}</small>`, d.lit, pickN(['up', 'down', 'push', 'fast', 'over'].filter(x => !d.lit.includes(x)), 3), { why: `${d.w} = ${B(litTxt(d))}.`, tag: 'literal' })); A.draw(2).forEach(d => out.push(ty(`Type the root of ${B(d.w)} (the word part with the main idea).`, [d.r[0]], { hint: `It means ${d.r[1]}.`, why: `${d.w} has the root ${B(d.r[0])}.`, tag: 'find-root' }))); return out; }
    const q = []; C.draw(3).forEach(d => q.push(bd(`Write the literal definition of ${B(d.w)}<br><small>${partsTxt(d)}</small>`, d.lit, pickN(['up', 'down', 'push', 'fast', 'over'].filter(x => !d.lit.includes(x)), 3), { why: `${d.w} = ${B(litTxt(d))}.`, tag: 'literal' })));
    A.draw(2).forEach(d => q.push(pk(`${B(d.w)}<br>What is the literal meaning?`, litTxt(d), others(DEC, litTxt(d), 3, x => litTxt(x)), { why: `${d.w} = ${partsTxt(d)}`, tag: 'literal' })));
    C.draw(2).forEach(d => q.push(pk(`Which is the DICTIONARY meaning of ${B(d.w)}?`, d.dict, others(DEC, d.dict, 3, x => x.dict), { why: `${d.w} means ${B(d.dict)}.`, tag: 'dictionary' })));
    q.push(pr('Match each word to its dictionary meaning.', pickN(DEC_CORE, 4).map(d => [d.w, d.dict])));
    return shuffle(q);
  }
});

/* ---------------- 8. Plural nouns ---------------- */
const PLU_S = ['cat', 'dog', 'book', 'bird', 'frog', 'hat', 'pen', 'tree', 'desk', 'cup', 'star', 'girl'];
const PLU_ES = ['box', 'dish', 'bus', 'church', 'fox', 'wish', 'glass', 'brush', 'watch', 'dress'];
const PLU_Y = [['baby', 'babies'], ['city', 'cities'], ['puppy', 'puppies'], ['story', 'stories'], ['lady', 'ladies'], ['berry', 'berries'], ['fly', 'flies'], ['bunny', 'bunnies']];
const PLU_YK = [['boy', 'boys'], ['day', 'days'], ['toy', 'toys'], ['key', 'keys'], ['monkey', 'monkeys']];
const PLU_F = [['leaf', 'leaves'], ['wolf', 'wolves'], ['knife', 'knives'], ['shelf', 'shelves'], ['loaf', 'loaves'], ['wife', 'wives']];
const PLU_I = [['tooth', 'teeth'], ['child', 'children'], ['mouse', 'mice'], ['foot', 'feet'], ['man', 'men'], ['woman', 'women'], ['goose', 'geese'], ['fish', 'fish'], ['sheep', 'sheep']];
const PLU_ALL = [...PLU_S.map(w => [w, w + 's', 's']), ...PLU_ES.map(w => [w, w + 'es', 'es']), ...PLU_Y.map(x => [...x, 'y']), ...PLU_YK.map(x => [...x, 's']), ...PLU_F.map(x => [...x, 'f']), ...PLU_I.map(x => [...x, 'irr'])];
const PLU_RULE = { s: 'Just add -s.', es: 'It ends in s, x, z, ch, or sh, so add -es.', y: 'Consonant + y: change the y to i and add -es.', f: 'Change f or fe to v and add -es.', irr: 'This is an irregular plural. You just have to remember it!' };
const pluWrong = x => { const w = x[0]; const c = [w + 's', w + 'es', w.replace(/y$/, 'ies'), w.replace(/y$/, 's'), w.replace(/fe?$/, 'ves'), w + 'ies', w + 'ves']; return dedupe(c).filter(y => y !== x[1]); };
const pluName = r => ({ s: 'add -s', es: 'add -es', y: 'y → ies', f: 'f → ves', irr: 'irregular' }[r]);
SKILLS.push({
  id: 'plu', name: 'Plural Nouns', icon: '🌼', c: '#ff9f1c', soft: '#fff0cc', place: 'Twin Meadow',
  blurb: 'One cat, two cats! One mouse, two mice! Make words mean more than one.',
  method: 'A plural noun means more than one. Add -s to most nouns (cat, cats). Add -es to nouns ending in s, x, z, ch, or sh (box, boxes). If a noun ends in a consonant plus y, change y to i and add -es (baby, babies). Many nouns ending in f or fe change to ves (leaf, leaves). Irregular plurals change in other ways (tooth, teeth; child, children; mouse, mice) or stay the same (fish, sheep).',
  learn: [
    ['More than one', 'A <b>plural</b> noun means more than one. Most nouns just add <b>-s</b>.', [['cat → cats', 'book → books']]],
    ['Add -es', 'If the word ends in <b>s, x, z, ch, sh</b> add <b>-es</b>. You can hear the extra beat!', [['box → boxes', 'church → churches']]],
    ['Change the ending', 'Consonant + <b>y</b> → change y to <b>ies</b> (baby → babies). Words ending in <b>f/fe</b> often change to <b>ves</b> (leaf → leaves).', [['baby → babies', 'wolf → wolves']]],
    ['Irregular plurals', 'Some plurals are special and you just remember them!', [['tooth → teeth', 'child → children'], ['mouse → mice', 'foot → feet']]]
  ],
  gen(lv) {
    const simple = D('pl_s', PLU_ALL.filter(x => x[2] === 's' || x[2] === 'es')), all = D('pl_a', PLU_ALL), harder = D('pl_h', PLU_ALL.filter(x => x[2] !== 's'));
    if (lv === 1) return simple.draw(5).map(x => pk(`One ${B(x[0])}. Two ___?`, x[1], [x[2] === 's' ? x[0] + 'es' : x[0] + 's'], { hint: PLU_RULE[x[2]], why: `${x[0]} → ${B(x[1])}. ${PLU_RULE[x[2]]}`, tag: 'plural-' + x[2] }));
    if (lv === 2) return all.draw(6).map(x => pk(`One ${B(x[0])}. Two ___?`, x[1], pluWrong(x).slice(0, 3), { hint: PLU_RULE[x[2]], why: `${x[0]} → ${B(x[1])}. ${PLU_RULE[x[2]]}`, tag: 'plural-' + x[2] }));
    if (lv === 3) { const out = []; ['s', 'es', 'y', 'irr'].forEach(() => 0); out.push(so('Sort the plural words by how they are made.', ['add -s', 'add -es', 'y → ies'], [...pickN(PLU_ALL.filter(x => x[2] === 's'), 2), ...pickN(PLU_ALL.filter(x => x[2] === 'es'), 2), ...pickN(PLU_ALL.filter(x => x[2] === 'y'), 2)].map(x => [x[1], ['s', 'es', 'y'].indexOf(x[2])]), { why: 'Look at how the singular word ends.', tag: 'plural-rule' })); out.push(pr('Match each singular word to its irregular plural.', pickN(PLU_I.filter(x => x[0] !== x[1]), 4))); out.push(so('Sort: regular plural or irregular plural?', ['regular', 'irregular'], [['cats', 0], ['boxes', 0], ['babies', 0], ['teeth', 1], ['children', 1], ['mice', 1]], { why: 'Irregular plurals change in special ways.', tag: 'plural-irr' })); harder.draw(3).forEach(x => out.push(pk(`One ${B(x[0])}. Two ___?`, x[1], pluWrong(x).slice(0, 3), { hint: PLU_RULE[x[2]], why: `${x[0]} → ${B(x[1])}. ${PLU_RULE[x[2]]}`, tag: 'plural-' + x[2] }))); return out; }
    if (lv === 4) return all.draw(6).map(x => ty(`One ${B(x[0])}. Type the plural: two ___`, x[1], { hint: PLU_RULE[x[2]], why: `${x[0]} → ${B(x[1])}. ${PLU_RULE[x[2]]}`, tag: 'plural-' + x[2] }));
    const q = []; harder.draw(4).forEach(x => q.push(ty(`One ${B(x[0])}. Type the plural: two ___`, x[1], { why: `${x[0]} → ${B(x[1])}. ${PLU_RULE[x[2]]}`, tag: 'plural-' + x[2] }))); simple.draw(1).forEach(x => q.push(ty(`One ${B(x[0])}. Type the plural: two ___`, x[1], { why: `${x[0]} → ${B(x[1])}`, tag: 'plural-' + x[2] }))); all.draw(2).forEach(x => q.push(pk(`One ${B(x[0])}. Two ___?`, x[1], pluWrong(x).slice(0, 3), { why: `${x[0]} → ${B(x[1])}`, tag: 'plural-' + x[2] })));
    q.push(so('Sort the plural words by how they are made.', ['add -s', 'add -es', 'y → ies', 'irregular'], [['cats', 0], ['dogs', 0], ['boxes', 1], ['buses', 1], ['babies', 2], ['cities', 2], ['teeth', 3], ['mice', 3]], { why: 'Look at the singular word.', tag: 'plural-rule' }));
    return shuffle(q).slice(0, 8);
  }
});

/* ---------------- 9. Past tense ---------------- */
const PST_ED = [['walk', 'walked'], ['jump', 'jumped'], ['play', 'played'], ['help', 'helped'], ['look', 'looked'], ['paint', 'painted'], ['talk', 'talked'], ['clean', 'cleaned']];
const PST_D = [['bake', 'baked'], ['love', 'loved'], ['hope', 'hoped'], ['use', 'used'], ['smile', 'smiled'], ['dance', 'danced']];
const PST_DBL = [['hop', 'hopped'], ['stop', 'stopped'], ['drop', 'dropped'], ['plan', 'planned'], ['clap', 'clapped'], ['skip', 'skipped']];
const PST_Y = [['try', 'tried'], ['cry', 'cried'], ['carry', 'carried'], ['hurry', 'hurried'], ['copy', 'copied']];
const PST_IRR = [['go', 'went'], ['eat', 'ate'], ['see', 'saw'], ['run', 'ran'], ['take', 'took'], ['give', 'gave'], ['swim', 'swam'], ['come', 'came'], ['say', 'said'], ['buy', 'bought'], ['make', 'made'], ['write', 'wrote'], ['sit', 'sat'], ['drink', 'drank'], ['fly', 'flew'], ['sleep', 'slept'], ['find', 'found']];
const PST_ALL = [...PST_ED.map(x => [...x, 'ed']), ...PST_D.map(x => [...x, 'd']), ...PST_DBL.map(x => [...x, 'dbl']), ...PST_Y.map(x => [...x, 'y']), ...PST_IRR.map(x => [...x, 'irr'])];
const PST_RULE = { ed: 'Regular verb: add -ed.', d: 'It ends in e, so just add -d.', dbl: 'Double the last letter, then add -ed.', y: 'Change the y to i, then add -ed.', irr: 'Irregular verb: it changes in a special way. Remember it!' };
const pstWrong = x => { const w = x[0]; return dedupe([w + 'ed', w + 'd', w + w.slice(-1) + 'ed', w.replace(/y$/, 'ied'), w.replace(/y$/, 'yed'), w + 'en', w + 'ed'.replace('ed', 'd')]).filter(y => y !== x[1]); };
SKILLS.push({
  id: 'past', name: 'Past Tense Verbs', icon: '⏰', c: '#f0a010', soft: '#fff0cc', place: 'Clock Castle',
  blurb: 'Yesterday I walked. Yesterday I went! Past tense verbs tell what already happened.',
  method: 'Past tense verbs tell about something that already happened. Regular verbs add -ed (walk, walked). If the verb ends in e, add -d (bake, baked). Some verbs double the last letter (hop, hopped) or change y to i (try, tried). Irregular verbs change in special ways (go, went; eat, ate; see, saw; run, ran).',
  learn: [
    ['It already happened', '<b>Past tense</b> verbs tell what already happened. Most add <b>-ed</b>.', [['walk → walked', 'jump → jumped']]],
    ['Small changes', 'Ends in e → add <b>d</b> (bake → baked). Short word → double the last letter (hop → hopped). Consonant + y → <b>ied</b> (try → tried).', [['bake → baked', 'hop → hopped'], ['try → tried', '']]],
    ['Irregular verbs', 'Some verbs do NOT use -ed. They change in special ways. Learn them!', [['go → went', 'eat → ate'], ['see → saw', 'run → ran']]]
  ],
  gen(lv) {
    const simple = D('ps_s', PST_ALL.filter(x => x[2] === 'ed' || x[2] === 'd')), all = D('ps_a', PST_ALL), irr = D('ps_i', PST_ALL.filter(x => x[2] === 'irr')), hard = D('ps_h', PST_ALL.filter(x => x[2] !== 'ed'));
    const sent = x => `Yesterday I ___ (${x[0]}).`;
    if (lv === 1) return simple.draw(5).map(x => pk(`${sent(x)}`, x[1], [x[0], x[0] + 'ing'], { hint: PST_RULE[x[2]], why: `${x[0]} → ${B(x[1])}. ${PST_RULE[x[2]]}`, tag: 'past-' + x[2] }));
    if (lv === 2) return all.draw(6).map(x => pk(`${sent(x)}`, x[1], pstWrong(x).slice(0, 3), { hint: PST_RULE[x[2]], why: `${x[0]} → ${B(x[1])}. ${PST_RULE[x[2]]}`, tag: 'past-' + x[2] }));
    if (lv === 3) { const out = []; out.push(so('Sort the verbs: regular (-ed) or irregular?', ['regular', 'irregular'], [['walked', 0], ['jumped', 0], ['baked', 0], ['went', 1], ['ate', 1], ['saw', 1]], { why: 'Regular verbs end in -ed or -d.', tag: 'past-irr' })); out.push(pr('Match the present word to its past tense.', pickN(PST_IRR, 4))); out.push(pr('Match the present word to its past tense.', pickN(PST_IRR, 4))); hard.draw(3).forEach(x => out.push(pk(`${sent(x)}`, x[1], pstWrong(x).slice(0, 3), { hint: PST_RULE[x[2]], why: `${x[0]} → ${B(x[1])}. ${PST_RULE[x[2]]}`, tag: 'past-' + x[2] }))); return out; }
    if (lv === 4) return all.draw(6).map(x => ty(`${sent(x)} Type the past tense of ${B(x[0])}.`, x[1], { hint: PST_RULE[x[2]], why: `${x[0]} → ${B(x[1])}. ${PST_RULE[x[2]]}`, tag: 'past-' + x[2] }));
    const q = []; hard.draw(4).forEach(x => q.push(ty(`${sent(x)} Type the past tense of ${B(x[0])}.`, x[1], { why: `${x[0]} → ${B(x[1])}. ${PST_RULE[x[2]]}`, tag: 'past-' + x[2] }))); simple.draw(1).forEach(x => q.push(ty(`${sent(x)} Type the past tense of ${B(x[0])}.`, x[1], { why: `${x[0]} → ${B(x[1])}`, tag: 'past-' + x[2] }))); irr.draw(2).forEach(x => q.push(pk(`${sent(x)}`, x[1], pstWrong(x).slice(0, 3), { why: `${x[0]} → ${B(x[1])}. ${PST_RULE[x[2]]}`, tag: 'past-irr' })));
    q.push(pk('Which verb is IRREGULAR?', 'went', ['walked', 'jumped', 'played'], { why: 'went does not end in -ed.', tag: 'past-irr' }));
    return shuffle(q).slice(0, 8);
  }
});
