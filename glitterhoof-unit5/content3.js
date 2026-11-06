'use strict';
/* ===== Content part 3: Parts of Speech, Subject & Predicate, Sentence or Fragment, Reading, Palace ===== */

/* ---------------- 10. Parts of speech ---------------- */
const TAGS = { Adj: 'Adjective', N: 'Noun', V: 'Verb', Adv: 'Adverb', P: 'Pronoun', I: 'Interjection' };
const POSDEF = {
  Noun: 'names a person, place, animal, or thing', Verb: 'shows action or being', Adjective: 'describes a noun (a, an, the too!)',
  Adverb: 'tells how, when, or where something happens', Pronoun: 'takes the place of a noun', Interjection: 'shows a sudden feeling'
};
const POS_SENT = [
  'The/Adj little/Adj bird/N sings/V sweetly/Adv', 'She/P runs/V quickly/Adv', 'Wow/I the/Adj cake/N smells/V sweet/Adj', 'My/Adj dog/N barks/V loudly/Adv',
  'They/P play/V soccer/N', 'Oops/I I/P dropped/V the/Adj plate/N', 'A/Adj tiny/Adj mouse/N hid/V quietly/Adv', 'He/P eats/V an/Adj apple/N slowly/Adv',
  'Yay/I we/P won/V the/Adj game/N', 'The/Adj red/Adj ball/N bounced/V high/Adv', 'The/Adj cat/N sleeps/V quietly/Adv', 'We/P ate/V pizza/N happily/Adv',
  'The/Adj brave/Adj knight/N fought/V bravely/Adv', 'Hooray/I I/P passed/V the/Adj test/N', 'The/Adj girl/N sings/V loudly/Adv', 'He/P jumped/V high/Adv',
  'A/Adj big/Adj dog/N runs/V fast/Adv', 'Ouch/I she/P tripped/V on/Adj the/Adj step/N'
].filter(s => !s.includes('on/Adj')).map(s => s.split(' ').map(t => { const [w, g] = t.split('/'); return [w, TAGS[g]]; }));
const posQ = (sent, i, opts, o = {}) => { const [w, p] = sent[i], txt = sent.map(x => x[0]).join(' ') + '.'; return pk(`${txt}<br>What part of speech is ${B(w)}?`, p, opts, Object.assign({ why: `${w} is a ${B(p.toLowerCase())}. A ${p.toLowerCase()} ${POSDEF[p]}.`, tag: 'pos-' + p.toLowerCase(), hint: `A ${p.toLowerCase()} ${POSDEF[p]}.` }, o)); };
const posType = (sent, pos) => { const idx = sent.map((x, i) => x[1] === pos ? i : -1).filter(i => i >= 0); return idx.length === 1 ? idx[0] : -1; };
SKILLS.push({
  id: 'pos', name: 'Parts of Speech', icon: '🏷️', c: '#e6b800', soft: '#fff6c2', place: 'Label Lagoon',
  blurb: 'Nouns, verbs, adjectives, adverbs, pronouns, and interjections: label every word!',
  method: 'A noun names a person, place, animal, or thing. A verb shows action or being. An adjective describes a noun (a, an, and the are adjectives called articles). An adverb tells how, when, or where something happens, and often ends in -ly. A pronoun takes the place of a noun (I, he, she, it, we, they). An interjection shows a sudden feeling (wow, oops, ouch, yay).',
  learn: [
    ['Noun and verb', 'A <b>noun</b> names a person, place, animal, or thing. A <b>verb</b> shows action or being.', [['puppy, school, Austin', 'runs, is, jumped']]],
    ['Adjective and adverb', 'An <b>adjective</b> describes a noun. An <b>adverb</b> tells how, when, or where (often -ly).', [['the green paint', 'sings sweetly']]],
    ['Pronoun and interjection', 'A <b>pronoun</b> takes the place of a noun (she, he, it, they, I, we). An <b>interjection</b> shows a sudden feeling (Wow! Oops! Yay!).', [['She runs.', 'Oops! I dropped it.']]]
  ],
  gen(lv) {
    const NV = POS_SENT.filter(s => s.some(x => x[1] === 'Noun') && s.some(x => x[1] === 'Verb'));
    if (lv === 1) return Array.from({ length: 5 }, (_, i) => { const s = pick1(NV), want = i % 2 ? 'Verb' : 'Noun', idx = pick1(s.map((x, j) => x[1] === want ? j : -1).filter(j => j >= 0)); return posQ(s, idx, [want === 'Noun' ? 'Verb' : 'Noun']); });
    if (lv === 2) return Array.from({ length: 6 }, () => { const s = pick1(POS_SENT), idx = rnd(s.length); return posQ(s, idx, pickN(['Noun', 'Verb', 'Adjective', 'Adverb'].filter(x => x !== s[idx][1]), 3)); });
    if (lv === 3) return pickN(POS_SENT.filter(s => s.length <= 5), 6).map(s => lb('Label each word.', s, [...new Set(s.map(x => x[1]))].length < 4 ? ['Noun', 'Verb', 'Adjective', 'Adverb', ...(s.some(x => x[1] === 'Pronoun') ? ['Pronoun'] : []), ...(s.some(x => x[1] === 'Interjection') ? ['Interjection'] : [])].filter((x, i, a) => a.indexOf(x) === i) : ['Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun', 'Interjection'].filter(l => s.some(x => x[1] === l) || ['Noun', 'Verb', 'Adjective', 'Adverb'].includes(l)), { hint: 'Remember: a, an, the are adjectives.', why: 'Check each word with its meaning.', tag: 'pos-label' }));
    const typed = (n) => { const out = []; let g = 0; while (out.length < n && g++ < 80) { const pos = pick1(['Noun', 'Verb', 'Adverb', 'Pronoun', 'Interjection']), s = pick1(POS_SENT), i = posType(s, pos); if (i < 0) continue; out.push(ty(`${s.map(x => x[0]).join(' ')}.<br>Type the ${B(pos.toLowerCase())} in this sentence.`, s[i][0], { hint: `A ${pos.toLowerCase()} ${POSDEF[pos]}.`, why: `${s[i][0]} is the ${pos.toLowerCase()}.`, tag: 'pos-' + pos.toLowerCase() })); } return out; };
    if (lv === 4) return [...typed(3), so('Sort each word.', ['Noun', 'Verb', 'Adjective', 'Adverb'], [['puppy', 0], ['school', 0], ['runs', 1], ['jumped', 1], ['happy', 2], ['green', 2], ['quickly', 3], ['softly', 3]], { why: 'Ask: is it a thing, an action, a describer, or a how?', tag: 'pos-sort' }), ...Array.from({ length: 2 }, () => { const s = pick1(POS_SENT), idx = rnd(s.length); return posQ(s, idx, pickN(['Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun', 'Interjection'].filter(x => x !== s[idx][1]), 3)); })];
    return [...typed(3), ...Array.from({ length: 3 }, () => { const s = pick1(POS_SENT), idx = rnd(s.length); return posQ(s, idx, pickN(['Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun', 'Interjection'].filter(x => x !== s[idx][1]), 3), { hint: null }); }), lb('Label each word.', pick1(POS_SENT.filter(s => s.length >= 5 && s.length <= 5)), ['Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun', 'Interjection'], { why: 'Check each word with its meaning.', tag: 'pos-label' }), so('Sort each word.', ['Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun'], [['dog', 0], ['sings', 1], ['tiny', 2], ['slowly', 3], ['they', 4], ['table', 0], ['jumped', 1]], { why: 'Ask what job the word does.', tag: 'pos-sort' })];
  }
});

/* ---------------- 11. Subject and predicate ---------------- */
const SP_RAW = [
  'The little brown puppy|chased a butterfly.', 'My older sister|plays the piano.', 'Three colorful birds|sat in the tree.', 'The hungry lion|roared loudly.', 'Our school bus|arrived early.',
  'The baby|laughed at the funny clown.', 'My grandmother|baked delicious cookies.', 'The students|walked to the library.', 'A tiny mouse|ran across the kitchen.', 'The bright yellow sun|shines in the sky.',
  'The playful kittens|chased a red ball across the room.', 'The fluffy white rabbit|hopped across the yard.', 'Mom|made pancakes for breakfast.', 'Sam and Mia|rode their bikes to school.',
  'The girl with the red backpack|waved at me.', 'We|planted seeds in the garden.', 'The cold winter wind|blew through the trees.', 'Our soccer team|won the game.', 'A big gray elephant|sprayed water with its trunk.',
  'The sleepy kitten|curled up in a basket.', 'Two kind neighbors|shared their garden.', 'The loud alarm clock|rang at six.', 'Ava|reads a book every night.', 'The cookies in the jar|smell sweet.'
];
const SP = SP_RAW.map(s => { const [a, b] = s.split('|'); return { s: a, p: b, words: (a + ' ' + b).split(' '), at: a.split(' ').length }; });
const SP_EASY = SP.filter(x => x.at <= 3 && x.words.length <= 6);
const spWrongS = x => { const sw = x.s.split(' '); const c = [x.p, sw.length > 1 ? sw[sw.length - 1].replace(/^./, m => m) : x.s + ' ' + x.p.split(' ')[0], x.s + ' ' + x.p.split(' ')[0], sw.length > 1 ? sw.slice(0, -1).join(' ') : x.p.split(' ').slice(0, 2).join(' ')]; return dedupe(c).filter(y => y !== x.s); };
const spWrongP = x => { const pw = x.p.replace(/\.$/, '').split(' '); const c = [x.s + '.', pw.length > 1 ? pw.slice(1).join(' ') + '.' : x.s, x.s.split(' ').slice(-1)[0] + ' ' + x.p, pw.length > 1 ? pw.slice(0, -1).join(' ') + '.' : x.s + ' ' + x.p]; return dedupe(c).filter(y => y !== x.p); };
const sentTxt = x => x.words.join(' ');
SKILLS.push({
  id: 'sp', name: 'Subject & Predicate', icon: '✂️', c: '#1790b5', soft: '#dff3ff', place: 'Snip Shore',
  blurb: 'Every sentence has two halves: WHO or WHAT, and what they DO or ARE.',
  method: 'Every complete sentence has two parts. The complete subject tells WHO or WHAT the sentence is about, including all the describing words. The complete predicate tells what the subject DOES or IS, and it includes the verb and everything after the subject.',
  learn: [
    ['Two halves', 'A sentence can be cut in two: the <b>complete subject</b> and the <b>complete predicate</b>.', [['The little brown puppy | chased a butterfly.', 'subject | predicate']]],
    ['Subject = WHO or WHAT', 'The <b>complete subject</b> tells who or what the sentence is about. Include ALL the describing words!', [['The hungry lion | roared loudly.', 'Three colorful birds | sat in the tree.']]],
    ['Predicate = DOES or IS', 'The <b>complete predicate</b> tells what the subject does or is. It starts with the verb and goes to the end.', [['My older sister | plays the piano.', 'The baby | laughed at the funny clown.']]]
  ],
  gen(lv) {
    const E = D('sp_e', SP_EASY), A = D('sp_a', SP);
    if (lv === 1) return E.draw(5).map((x, i) => i % 2 ? pk(`${B(sentTxt(x))}<br>Which part tells WHAT THE SUBJECT DOES?`, x.p, [x.s], { hint: 'The predicate tells what the subject does or is.', why: `The complete predicate is ${B(x.p)}`, tag: 'predicate' }) : pk(`${B(sentTxt(x))}<br>Which part tells WHO or WHAT the sentence is about?`, x.s, [x.p], { hint: 'The subject is who or what.', why: `The complete subject is ${B(x.s)}`, tag: 'subject' }));
    if (lv === 2) return A.draw(6).map((x, i) => i % 2 ? pk(`${B(sentTxt(x))}<br>What is the complete predicate?`, x.p, spWrongP(x).slice(0, 3), { hint: 'It tells what the subject does or is, to the end.', why: `The complete predicate is ${B(x.p)}`, tag: 'predicate' }) : pk(`${B(sentTxt(x))}<br>What is the complete subject?`, x.s, spWrongS(x).slice(0, 3), { hint: 'Include every describing word before the verb.', why: `The complete subject is ${B(x.s)}`, tag: 'subject-incomplete' }));
    if (lv === 3) return A.draw(6).map(x => sl('Tap the line where the sentence splits into the complete subject and the complete predicate.', x.words, x.at, { hint: 'The subject ends right before the verb.', why: `${x.s} | ${x.p}`, tag: 'split' }));
    if (lv === 4) return A.draw(6).map((x, i) => i % 2 ? bd(`${x.s} ...<br>Build the complete predicate.`, x.p.split(' '), pickN(['quickly', 'blue', 'very', 'under', 'happy'].filter(w => !x.p.includes(w)), 2), { why: `${x.s} | ${B(x.p)}`, tag: 'predicate' }) : bd(`... ${x.p}<br>Build the complete subject.`, x.s.split(' '), pickN(['quickly', 'blue', 'very', 'under', 'happy'].filter(w => !x.s.includes(w)), 2), { why: `${B(x.s)} | ${x.p}`, tag: 'subject' }));
    const q = []; A.draw(2).forEach(x => q.push(sl('Tap the line where the sentence splits into subject and predicate.', x.words, x.at, { why: `${x.s} | ${x.p}`, tag: 'split' }))); A.draw(2).forEach(x => q.push(ty(`${B(sentTxt(x))}<br>Type the complete subject.`, x.s, { why: `The complete subject is ${B(x.s)}`, tag: 'subject' }))); A.draw(2).forEach(x => q.push(pk(`${B(sentTxt(x))}<br>What is the complete predicate?`, x.p, spWrongP(x).slice(0, 3), { why: `The complete predicate is ${B(x.p)}`, tag: 'predicate' })));
    A.draw(1).forEach(x => q.push(bd(`${x.s} ...<br>Build the complete predicate.`, x.p.split(' '), ['quickly', 'blue'].filter(w => !x.p.includes(w)), { why: `${x.s} | ${B(x.p)}`, tag: 'predicate' }))); A.draw(1).forEach(x => q.push(pk(`${B(sentTxt(x))}<br>What is the complete subject?`, x.s, spWrongS(x).slice(0, 3), { why: `The complete subject is ${B(x.s)}`, tag: 'subject-incomplete' })));
    return shuffle(q);
  }
});

/* ---------------- 12. Sentence or fragment ---------------- */
const FR = [
  ['The dog wagged its tail.', 'C'], ['My best friend likes to draw.', 'C'], ['The beautiful flowers bloomed.', 'C'], ['The children played at recess.', 'C'], ['Mom made pancakes.', 'C'], ['We planted seeds.', 'C'],
  ['The ducks swam in the pond.', 'C'], ['Two sleepy kittens curled up on the couch.', 'C'], ['The cold wind blew.', 'C'], ['Our teacher reads funny stories.', 'C'],
  ['Under the kitchen table.', 'F', 'Missing the subject and the predicate.'], ['Ran through the green grass.', 'F', 'Missing the subject. Who ran?'], ['A basket of fresh apples.', 'F', 'Missing the predicate. What about the basket?'],
  ['After the school bell rang.', 'F', 'It is an unfinished thought. What happened after?'], ['Because I was tired.', 'F', 'It is an unfinished thought.'], ['The shiny red apple.', 'F', 'Missing the predicate.'],
  ['Played soccer after school.', 'F', 'Missing the subject. Who played?'], ['In the dark forest.', 'F', 'Missing the subject and the predicate.'], ['When the bell rings.', 'F', 'It is an unfinished thought.'],
  ['Swam across the lake.', 'F', 'Missing the subject.'], ['A big gray elephant.', 'F', 'Missing the predicate.'], ['My favorite stuffed bear.', 'F', 'Missing the predicate.']
];
const FR_C = FR.filter(x => x[1] === 'C'), FR_F = FR.filter(x => x[1] === 'F');
const FRMISS = x => /subject and the predicate/.test(x[2]) ? 'Both' : /subject/.test(x[2]) && !/predicate/.test(x[2]) ? 'Subject' : /predicate/.test(x[2]) ? 'Predicate' : 'Unfinished thought';
const FIX = [
  [['The', 'boy', 'ran', 'down', 'the', 'hill.'], 'Ran down the hill.', ['happy', 'blue']], [['The', 'shiny', 'red', 'apple', 'fell', 'off', 'the', 'table.'], 'The shiny red apple.', ['quickly']],
  [['My', 'friends', 'played', 'soccer', 'after', 'school.'], 'Played soccer after school.', ['very']], [['The', 'ducks', 'swam', 'across', 'the', 'lake.'], 'Swam across the lake.', ['green']],
  [['My', 'favorite', 'stuffed', 'bear', 'sits', 'on', 'my', 'bed.'], 'My favorite stuffed bear.', ['under']], [['A', 'troll', 'lives', 'under', 'the', 'old', 'bridge.'], 'Under the old bridge.', ['pretty']]
];
SKILLS.push({
  id: 'frag', name: 'Sentence or Fragment?', icon: '🔍', c: '#d9534f', soft: '#ffe3e1', place: 'Detective Docks',
  blurb: 'A complete sentence has a who, a what-happens, and a finished thought.',
  method: 'A complete sentence has a subject (who or what), a predicate (what the subject does or is), and it expresses a complete thought. A fragment is missing the subject, the predicate, or the complete thought. Words like After, Because, and When at the start can leave a thought unfinished.',
  learn: [
    ['A complete sentence', 'It has a <b>subject</b>, a <b>predicate</b>, and a <b>complete thought</b>.', [['The dog wagged its tail.', 'who + what it did ✅']]],
    ['A fragment', 'A <b>fragment</b> is missing a piece. It does not make a complete thought.', [['Ran through the green grass. (who ran?)', 'A basket of fresh apples. (what about it?)']]],
    ['Tricky starters', 'Watch for <b>After</b>, <b>Because</b>, and <b>When</b>. They can leave the thought unfinished!', [['After the school bell rang. ❌', 'After the bell rang, we went home. ✅']]]
  ],
  gen(lv) {
    const C = D('fr_c', FR_C), F = D('fr_f', FR_F), A = D('fr_a', FR);
    const cf = x => pk(`${B(x[0])}<br>Complete sentence or fragment?`, x[1] === 'C' ? 'Complete sentence' : 'Fragment', [x[1] === 'C' ? 'Fragment' : 'Complete sentence'], { hint: 'Does it have a who AND what happens, and a finished thought?', why: x[1] === 'C' ? `It has a subject, a predicate, and a finished thought.` : x[2], tag: x[1] === 'C' ? 'called-sentence-fragment' : 'called-fragment-sentence' });
    if (lv === 1) { const f = F.draw(2), c = C.draw(3); return shuffle([...f, ...c]).map(cf); }
    if (lv === 2) return A.draw(6).map((x, i) => x[1] === 'C' || i % 2 ? cf(x) : pk(`${B(x[0])}<br>What is missing?`, FRMISS(x), ['Subject', 'Predicate', 'Both', 'Unfinished thought'].filter(m => m !== FRMISS(x)).slice(0, 3), { hint: 'Ask: who? what happened?', why: x[2], tag: 'missing' }));
    if (lv === 3) { const mk = () => so('Sort each group of words.', ['Complete sentence', 'Fragment'], [...C.draw(3), ...F.draw(3)].map(x => [x[0], x[1] === 'C' ? 0 : 1]), { why: 'A sentence needs a subject, a predicate, and a finished thought.', tag: 'sort-cf' }); return [mk(), mk(), ...F.draw(2).map(x => pk(`${B(x[0])}<br>What is missing?`, FRMISS(x), ['Subject', 'Predicate', 'Both', 'Unfinished thought'].filter(m => m !== FRMISS(x)).slice(0, 3), { why: x[2], tag: 'missing' })), ...A.draw(2).map(cf)]; }
    if (lv === 4) { const fx = pickN(FIX, 3); return [...fx.map(f => bd(`Fix the fragment:<br>${B(f[1])}<br>Build a complete sentence.`, f[0], f[2], { why: 'Add the missing subject or predicate so it makes a complete thought.', tag: 'fix', ordered: true })), ...A.draw(3).map(cf)]; }
    const q = []; A.draw(3).forEach(x => q.push(cf(x))); F.draw(2).forEach(x => q.push(pk(`${B(x[0])}<br>What is missing?`, FRMISS(x), ['Subject', 'Predicate', 'Both', 'Unfinished thought'].filter(m => m !== FRMISS(x)).slice(0, 3), { why: x[2], tag: 'missing' }))); const f = pick1(FIX); q.push(bd(`Fix the fragment:<br>${B(f[1])}<br>Build a complete sentence.`, f[0], f[2], { why: 'Add the missing piece.', tag: 'fix' })); q.push(so('Sort each group of words.', ['Complete sentence', 'Fragment'], [...C.draw(3), ...F.draw(3)].map(x => [x[0], x[1] === 'C' ? 0 : 1]), { why: 'Needs a subject, a predicate, and a finished thought.', tag: 'sort-cf' })); q.push(pk('Which one is a complete sentence?', pick1(FR_C)[0], F.draw(3).map(x => x[0]), { why: 'It has a subject, a predicate, and a finished thought.' }));
    return shuffle(q).slice(0, 8);
  }
});

/* ---------------- 13. Reading: The Gift ---------------- */
const GIFT = ['Dad has a gift for Tom. He hid it in his truck. The gift is not big. But it is fun.', 'Tom thinks Dad forgot his gift. Tom feels sad.', 'Later in the day, Dad sneaks to his truck. He gets the gift and sets it on an open shelf.', 'Tom sees it. Quick! Tom runs and gets the gift. He rips the paper and opens the box.', 'It is a red horn. Tom honks it, and Dad jumps.', 'Tom thanks Dad for the gift. He honks the horn and feels glad.'];
const RD = [
  { q: 'Who has a gift for Tom?', ok: 'Dad', bad: ['Mom', 'Grandpa', 'Tom'], ty: ['dad'], why: 'The story starts: Dad has a gift for Tom.' },
  { q: 'Where did Dad hide the gift?', ok: 'in his truck', bad: ['under the bed', 'on a shelf', 'in the box'], ty: ['truck', 'in his truck', 'his truck', 'in the truck'], why: 'He hid it in his truck.' },
  { q: 'How big is the gift?', ok: 'not big', bad: ['very big', 'huge'], ty: ['not big', 'small'], why: 'The gift is not big.' },
  { q: 'Why does Tom feel sad?', ok: 'He thinks Dad forgot his gift.', bad: ['He lost his toy.', 'It is raining.', 'He is hungry.'], ty: ['forgot', 'dad forgot', 'he thinks dad forgot'], why: 'Tom thinks Dad forgot his gift.' },
  { q: 'What does Dad do later in the day?', ok: 'He sneaks to his truck and gets the gift.', bad: ['He goes to sleep.', 'He throws the gift away.', 'He eats lunch.'], ty: ['sneaks', 'gets the gift', 'sneaks to his truck'], why: 'Later in the day, Dad sneaks to his truck.' },
  { q: 'Where does Dad put the gift?', ok: 'on an open shelf', bad: ['in a box', 'under a chair', 'in the truck'], ty: ['shelf', 'on a shelf', 'on an open shelf', 'open shelf'], why: 'He sets it on an open shelf.' },
  { q: 'What does Tom do when he sees the gift?', ok: 'He runs and gets it.', bad: ['He cries.', 'He hides.', 'He goes to bed.'], ty: ['runs', 'gets it', 'runs and gets it'], why: 'Quick! Tom runs and gets the gift.' },
  { q: 'What is the gift?', ok: 'a red horn', bad: ['a blue ball', 'a green car', 'a toy truck'], ty: ['horn', 'a horn', 'a red horn', 'red horn'], why: 'It is a red horn.' },
  { q: 'What color is the horn?', ok: 'red', bad: ['blue', 'green', 'yellow'], ty: ['red'], why: 'It is a red horn.' },
  { q: 'What happens when Tom honks the horn?', ok: 'Dad jumps.', bad: ['Dad cries.', 'Tom jumps.', 'The truck leaves.'], ty: ['dad jumps', 'jumps', 'dad jumped'], why: 'Tom honks it, and Dad jumps.' },
  { q: 'How does Tom feel at the end?', ok: 'glad', bad: ['sad', 'mad', 'sleepy'], ty: ['glad', 'happy'], why: 'He honks the horn and feels glad.' }
];
const RD_ORDER = [['Dad hides the gift in his truck.', 'Tom thinks Dad forgot.', 'Dad sets the gift on a shelf.', 'Tom opens the box.', 'Tom honks the horn.'], ['Tom feels sad.', 'Dad sneaks to his truck.', 'Tom sees the gift.', 'Tom rips the paper.', 'Tom thanks Dad.']];
const RD_TF = [['Dad hid the gift in his truck.', 0], ['The gift is very big.', 1], ['Tom feels sad at first.', 0], ['The gift is a red horn.', 0], ['Dad jumps when Tom honks.', 0], ['Tom is mad at the end.', 1], ['Dad forgot the gift.', 1], ['Tom rips the paper.', 0]];
SKILLS.push({
  id: 'read', name: 'Reading: The Gift', icon: '📖', c: '#34b26e', soft: '#e1f7e8', place: 'Story Tower',
  blurb: 'Read the story about Tom and Dad, then show what you understood.',
  method: 'To understand a story, read slowly and ask who, what, where, and why. Look back in the text to find the answer. The story is "The Gift": Dad has a gift for Tom, hides it in his truck, Tom thinks Dad forgot and feels sad, Dad sneaks the gift to an open shelf, Tom opens it (a red horn), honks it, and Dad jumps. Tom feels glad.',
  learn: GIFT.map((t, i) => ['The Gift (part ' + (i + 1) + ' of 6)', t, [[i === 0 ? 'Read slowly. Ask: who? what? where?' : '', '']]]),
  gen(lv) {
    const R = D('rd', RD);
    const pick2 = x => pk(x.q, x.ok, [x.bad[0]], { hint: 'Look back at the story!', why: x.why, tag: 'comprehension' });
    if (lv === 1) return R.draw(5).map(pick2);
    if (lv === 2) return R.draw(6).map(x => pk(x.q, x.ok, x.bad.slice(0, 2), { hint: 'Look back at the story!', why: x.why, tag: 'comprehension' }));
    if (lv === 3) return [bd('Put the story in order.', RD_ORDER[0], [], { why: 'Think: what happened first, next, and last?', tag: 'sequence', ordered: true, join: ' ' }), bd('Put the story in order.', RD_ORDER[1], [], { why: 'Think: what happened first, next, and last?', tag: 'sequence', ordered: true, join: ' ' }), so('True or false?', ['True', 'False'], pickN(RD_TF, 4).map(x => [x[0], x[1]]), { why: 'Look back at the story to check.', tag: 'true-false' }), so('True or false?', ['True', 'False'], pickN(RD_TF, 4).map(x => [x[0], x[1]]), { why: 'Look back at the story to check.', tag: 'true-false' }), ...R.draw(2).map(x => pk(x.q, x.ok, x.bad.slice(0, 3), { why: x.why, tag: 'comprehension' }))];
    const T = D('rd_t', RD.filter(x => x.ty));
    if (lv === 4) return T.draw(6).map(x => ty(x.q + '<br><small>Type a short answer.</small>', x.ty, { hint: 'Look back at the story!', why: x.why, tag: 'comprehension' }));
    const q = T.draw(4).map(x => ty(x.q + '<br><small>Type a short answer.</small>', x.ty, { why: x.why, tag: 'comprehension' })); R.draw(2).forEach(x => q.push(pk(x.q, x.ok, x.bad.slice(0, 3), { why: x.why, tag: 'comprehension' }))); q.push(bd('Put the story in order.', pick1(RD_ORDER), [], { why: 'Think: first, next, last.', tag: 'sequence', ordered: true })); q.push(so('True or false?', ['True', 'False'], pickN(RD_TF, 4).map(x => [x[0], x[1]]), { why: 'Look back at the story.', tag: 'true-false' }));
    return q;
  }
});

/* ---------------- 14. Rainbow Palace: the final mix ---------------- */
SKILLS.push({
  id: 'palace', name: 'Rainbow Palace', icon: '👑', c: '#6a4bd8', soft: '#e4dcff', place: 'Rainbow Palace', single: true,
  blurb: 'The royal test! 20 questions from everything you mastered.',
  method: 'A mixed review of every Unit 5 skill: compound words, articles and adjectives, -er endings, vowel sounds, phonograms, root meanings, literal definitions, plurals, past tense, parts of speech, subject and predicate, fragments, and reading.',
  learn: [['Royal test!', 'This is a mix of everything you learned. You can do it, take your time!', [['', '']]]],
  gen() {
    const learnSkills = SKILLS.filter(s => !s.single), out = [];
    learnSkills.forEach(s => { out.push(...shuffle(s.gen(5)).slice(0, s.id === 'read' || s.id === 'frag' ? 2 : 1)); });
    learnSkills.forEach(s => { if (out.length < 20) out.push(shuffle(s.gen(5))[0]); });
    return shuffle(out).slice(0, 20);
  }
});
