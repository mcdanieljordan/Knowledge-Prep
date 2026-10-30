'use strict';
/* ============ round generators: every call makes a fresh round ============ */
const G = {};
const tagIn = (tok, tags) => tok.tags.some(t => tags.indexOf(t) >= 0);
const aAn = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;
const aType = t => aAn(t);
const nounType = w => W.person.includes(w) ? 'person' : W.place.includes(w) ? 'place' : W.animal.includes(w) ? 'animal' : 'thing';
const ART = ['a', 'an', 'the'];
const isArt = w => ART.includes(wordOnly(w).toLowerCase());
const without = (arr, ex) => arr.filter(x => !ex.includes(x));

function mc(skill, prompt, correct, wrongs, extra) {
  const opts = shuffle([correct].concat(wrongs));
  return Object.assign({ type: 'mc', skill, prompt, options: opts, answer: opts.indexOf(correct), hint: SKILL[skill] ? SKILL[skill].ask : '' }, extra);
}

/* ---- nouns ---- */
G.mcNoun = () => {
  const c = pick1(W.allNoun), t = nounType(c);
  return mc('noun', 'Which word is a noun?', c, pickN(W.notNoun, 2), { explain: `<b>${c}</b> is a noun. It names ${aType(t)}!` });
};
G.mcNounType = () => {
  const t = pick1(['person', 'place', 'animal', 'thing']);
  const others = without(['person', 'place', 'animal', 'thing'], [t]);
  const c = pick1(W[t]);
  return mc('noun', `Which word names ${aType(t)}?`, c, pickN(others, 2).map(o => pick1(W[o])), { hint: 'Ask: Who? Where? What animal? What thing?', explain: `<b>${c}</b> names ${aType(t)}. It is a noun!` });
};
G.mcProper = () => {
  const c = pick1(W.proper);
  return mc('proper', 'Which word is a proper noun?', c, pickN(W.common, 2), { hint: 'Proper nouns begin with a capital letter.', explain: `<b>${c}</b> is a proper noun. It is a special name, so it starts with a capital letter.` });
};
G.mcCommon = () => {
  const c = pick1(W.common);
  return mc('proper', 'Which word is a common noun?', c, pickN(W.proper, 2), { hint: 'A common noun is a general name. It has no capital letter.', explain: `<b>${c}</b> is a common noun. It names something general, with no capital letter.` });
};

/* ---- generic hunt (tap the word in a sentence) ---- */
G.hunt = (bank, steps, o = {}) => {
  const ok = s => steps.every(st => s.some(tok => tagIn(tok, st.tags))) && (!o.filter || o.filter(s));
  let s = deck('h:' + bank, SENT[bank]).draw(1, ok)[0];
  if (!s) s = SENT[bank].find(ok) || SENT[bank][0];
  const skill = o.skill || steps[0].skill;
  return Object.assign({ type: 'hunt', skill, toks: s, steps, hint: o.hint || (SKILL[skill] && SKILL[skill].ask) || '', explain: o.explain }, o.extra || {});
};
const HUNT = {
  noun: () => G.hunt('noun', [{ ask: 'Tap all the NOUNS!', tags: ['n', 'pn'], label: 'a noun', skill: 'noun' }], { hint: 'Nouns name a person, place, animal, or thing. Find them all!' }),
  proper: () => G.hunt('noun', [{ ask: 'Tap the PROPER noun!', tags: ['pn'], label: 'a proper noun', skill: 'proper' }], { hint: 'A proper noun is a special name with a capital letter.' }),
  subj: () => G.hunt('pron', [{ ask: 'Tap the SUBJECTIVE pronoun!', tags: ['sp'], label: 'a subjective pronoun', skill: 'subj' }]),
  obj: () => G.hunt('pron', [{ ask: 'Tap the OBJECTIVE pronoun!', tags: ['op'], label: 'an objective pronoun', skill: 'obj' }]),
  poss: () => G.hunt('pron', [{ ask: 'Tap the POSSESSIVE pronoun!', tags: ['pp'], label: 'a possessive pronoun', skill: 'poss' }]),
  refl: () => G.hunt('pron', [{ ask: 'Tap the REFLEXIVE pronoun!', tags: ['rp'], label: 'a reflexive pronoun', skill: 'refl' }]),
  action: () => G.hunt('verb', [{ ask: 'Tap the ACTION verb!', tags: ['av'], label: 'an action verb', skill: 'action' }], { filter: s => s.filter(t => tagIn(t, ['av'])).length === 1 }),
  helping: () => G.hunt('verb', [{ ask: 'Tap the HELPING verb!', tags: ['hv'], label: 'a helping verb', skill: 'helping' }]),
  linking: () => G.hunt('verb', [{ ask: 'Tap the LINKING verb!', tags: ['lv'], label: 'a linking verb', skill: 'linking' }]),
  past: () => G.hunt('tense', [{ ask: 'Tap the PAST tense verb!', tags: ['past'], label: 'a past-tense verb', skill: 'tense' }]),
  pres: () => G.hunt('tense', [{ ask: 'Tap the PRESENT tense verb!', tags: ['pres'], label: 'a present-tense verb', skill: 'tense' }]),
  fut: () => G.hunt('tense', [{ ask: 'Tap BOTH words of the FUTURE verb phrase!', tags: ['fut'], label: 'the future verb phrase', skill: 'future' }], { hint: 'Future = will + the verb. Tap both words!' }),
  adj: () => G.hunt('adj', [{ ask: 'Tap the ADJECTIVE!', tags: ['adj'], label: 'an adjective', skill: 'adj' }]),
  adv: () => G.hunt('adv', [{ ask: 'Tap the ADVERB!', tags: ['adv'], label: 'an adverb', skill: 'adv' }], { hint: 'Ask: How? When? Where? Which word tells about the action?' }),
  adjadv: () => G.hunt('mix', [{ ask: 'First, tap the ADJECTIVE!', tags: ['adj'], label: 'the adjective', skill: 'adjadv' }, { ask: 'Now tap the ADVERB!', tags: ['adv'], label: 'the adverb', skill: 'adjadv' }], { skill: 'adjadv' }),
  ij: () => G.hunt('ij', [{ ask: 'Tap the INTERJECTION!', tags: ['ij'], label: 'an interjection', skill: 'ij' }]),
  irr: () => G.hunt('plural', [{ ask: 'Tap the IRREGULAR plural noun!', tags: ['irr'], label: 'an irregular plural', skill: 'plurid' }], { hint: 'Irregular plurals change in a special way. They do not just add ‑s.' }),
  mixAdj: () => G.hunt('mix', [{ ask: 'Tap the ADJECTIVE!', tags: ['adj'], label: 'the adjective', skill: 'mix' }]),
  mixVerb: () => G.hunt('mix', [{ ask: 'Tap the VERB!', tags: ['av'], label: 'the verb', skill: 'mix' }]),
  mixNoun: () => G.hunt('mix', [{ ask: 'Tap the NOUN!', tags: ['n'], label: 'a noun', skill: 'mix' }], { filter: s => s.filter(t => tagIn(t, ['n'])).length === 1 }),
  mixAdv: () => G.hunt('mix', [{ ask: 'Tap the ADVERB!', tags: ['adv'], label: 'the adverb', skill: 'mix' }])
};
G.huntNoun = HUNT.noun;

/* ---- multiple choice from a tagged sentence ---- */
G.mcSentWord = (skill, bank, tags, label, askText, o = {}) => {
  const ok = s => s.filter(t => tagIn(t, tags)).length === 1 && (!o.filter || o.filter(s));
  const s = deck('m:' + bank, SENT[bank]).draw(1, ok)[0] || SENT[bank].find(ok);
  const tgt = s.find(t => tagIn(t, tags));
  const w = wordOnly(tgt.t);
  const others = s.filter(t => t !== tgt && !isArt(t.t)).map(t => wordOnly(t.t)).filter((x, i, a) => x && x !== w && a.indexOf(x) === i);
  const wr = pickN(others, 2);
  return mc(skill, askText, w, wr, { sentence: sentText(s), explain: `<b>${w}</b> is ${label}.${o.why ? ' ' + o.why : ''}` });
};
G.mcVerbWord = kind => {
  const M = {
    action: ['av', 'the action verb', 'It shows what someone does.'],
    helping: ['hv', 'the helping verb', 'It helps the main verb.'],
    linking: ['lv', 'the linking verb', 'It links the subject to a describing word.']
  }[kind];
  const o = { why: M[2] };
  if (kind === 'action') o.filter = s => s.filter(t => tagIn(t, ['av'])).length === 1;
  return G.mcSentWord(kind, 'verb', [M[0]], M[1], `Which word is ${M[1]}?`, o);
};
G.mcIsJob = () => {
  const items = [['Fern is a little girl.', 'linking', 'Is links Fern to a describing word. It is a linking verb here.'], ['Fern is reading.', 'helping', 'Is helps the action verb reading. It is a helping verb here.'],
  ['The flowers are beautiful.', 'linking', 'Are links the flowers to beautiful. It is a linking verb here.'], ['The children are playing.', 'helping', 'Are helps the action verb playing. It is a helping verb here.'],
  ['He was happy.', 'linking', 'Was links He to happy. It is a linking verb here.'], ['The kids were jumping.', 'helping', 'Were helps jumping. It is a helping verb here.']];
  const [s, k, why] = pick1(items);
  const w = k === 'linking' ? (s.match(/ (is|are|was|were) /) || [0, 'is'])[1] : (s.match(/ (is|are|was|were) /) || [0, 'is'])[1];
  return mc(k, `In “${s}” the word <b>${w}</b> is a:`, k === 'linking' ? 'linking verb' : 'helping verb', [k === 'linking' ? 'helping verb' : 'linking verb'], { hint: 'Is there an action verb right after it? Then it is helping. No action, just connecting? Linking.', explain: why });
};
G.mcAdjSent = () => G.mcSentWord('adj', 'adj', ['adj'], 'an adjective', 'What is the adjective in this sentence?', { filter: s => s.filter(t => tagIn(t, ['adj'])).length === 1, why: 'It describes a noun.' });
G.mcAdvSent = () => G.mcSentWord('adv', 'adv', ['adv'], 'an adverb', 'What is the adverb in this sentence?', { why: 'It tells how, when, or where.' });
G.mcAdjOnly = () => G.mcSentWord('adjadv', 'mix', ['adj'], 'the adjective', 'Which word is the adjective?', { why: 'It describes a noun.' });
G.mcAdvOnly = () => G.mcSentWord('adjadv', 'mix', ['adv'], 'the adverb', 'Which word is the adverb?', { why: 'It tells how the action happens.' });
G.mcInterjSent = () => G.mcSentWord('ij', 'ij', ['ij'], 'the interjection', 'Which word is the interjection?', { why: 'It shows a sudden feeling.' });

/* ---- pronouns ---- */
const PRON_LABEL = { subj: 'subjective', obj: 'objective', poss: 'possessive', refl: 'reflexive' };
const PRON_JOB = { subj: 'It tells who performs the action.', obj: 'It receives the action.', poss: 'It shows ownership.', refl: 'It refers back to the person doing the action.' };
G.mcPron = t => {
  t = t || pick1(Object.keys(PRON_LABEL));
  const c = pick1(W[t]);
  const wr = pickN(without(Object.keys(PRON_LABEL), [t]), 2).map(o => pick1(W[o]));
  return mc(t, `Which word is ${aAn(PRON_LABEL[t])} pronoun?`, c, wr, { explain: `<b>${c}</b> is ${aAn(PRON_LABEL[t])} pronoun. ${PRON_JOB[t]}` });
};
G.mcWhichPron = () => {
  const t = pick1(Object.keys(PRON_LABEL)), c = pick1(W[t]);
  const labs = pickN(without(Object.keys(PRON_LABEL), [t]), 2).map(k => PRON_LABEL[k]);
  return mc('pronjob', `What kind of pronoun is <b>${c}</b>?`, PRON_LABEL[t], labs, { explain: `<b>${c}</b> is ${aAn(PRON_LABEL[t])} pronoun. ${PRON_JOB[t]}` });
};
G.gapPron = t => {
  t = t || pick1(Object.keys(PRON_LABEL));
  const it = deck('gp:' + t, GAP[t]).draw(1)[0];
  return gapRound(t, it, `Drag the right pronoun into the blank!`, `<b>${it.a}</b> is ${aAn(PRON_LABEL[t])} pronoun. ${PRON_JOB[t]}`);
};
G.sortPron = () => {
  const B = [
    { id: 'subj', label: 'Subjective', sub: 'does the action', emoji: '🏃', color: '#2f6fe4' }, { id: 'obj', label: 'Objective', sub: 'gets the action', emoji: '🎯', color: '#e0452f' },
    { id: 'poss', label: 'Possessive', sub: 'shows ownership', emoji: '🎒', color: '#1fa34a' }, { id: 'refl', label: 'Reflexive', sub: 'bounces back', emoji: '🪞', color: '#8a3fe0' }];
  const items = [];
  B.forEach(b => pickN(W[b.id], 2).forEach(w => items.push({ id: w + b.id, html: esc(w), bucket: b.id })));
  return { type: 'sort', skill: 'pronjob', prompt: 'Drag each pronoun to its job!', buckets: B, items: shuffle(items), hint: 'Doer = subjective. Done-to = objective. Owner = possessive. Mirror = reflexive.', explain: SKILL.pronjob.rule };
};
G.popPron = t => {
  t = t || pick1(Object.keys(PRON_LABEL));
  const dis = [].concat(...without(Object.keys(PRON_LABEL), [t]).map(k => pickN(W[k], 2)));
  return popRound(t, `Pop all the ${PRON_LABEL[t].toUpperCase()} pronouns!`, pickN(W[t], 4), pickN(dis, 4), SKILL[t].rule);
};
G.matchPronJob = () => {
  const P = [['Subjective', 'performs the action'], ['Objective', 'receives the action'], ['Possessive', 'shows ownership'], ['Reflexive', 'refers back to the subject']];
  return matchRound('pronjob', 'Match each pronoun kind to its job!', P.map((p, i) => ({ id: 'j' + i, left: p[0], right: p[1] })), SKILL.pronjob.rule);
};
G.labelPron = () => {
  const L = [{ id: 'sp', label: 'subjective', tags: ['sp'], color: '#2f6fe4' }, { id: 'op', label: 'objective', tags: ['op'], color: '#e0452f' }, { id: 'pp', label: 'possessive', tags: ['pp'], color: '#1fa34a' }, { id: 'rp', label: 'reflexive', tags: ['rp'], color: '#8a3fe0' }];
  const s = deck('lp', SENT.pron).draw(1, x => x.filter(t => tagIn(t, ['sp', 'op', 'pp', 'rp'])).length >= 2)[0] || SENT.pron[6];
  return labelRound('pronjob', 'Drag the labels onto the pronouns!', s, L, 'Find each pronoun and ask: does it do, get, own, or bounce back?');
};

/* ---- verbs ---- */
G.gapVerb = kind => {
  const it = deck('gv:' + kind, GAP.verb).draw(1, x => !kind || x.k === kind)[0];
  const L = { action: 'an action verb', helping: 'a helping verb', linking: 'a linking verb' }[it.k];
  return gapRound(it.k, it, 'Drag the right verb into the blank!', `<b>${it.a}</b> is ${L}.`);
};
G.sortVerbKind = () => {
  const B = [{ id: 'av', label: 'Action', sub: 'shows what someone does', emoji: '🏃', color: '#e0452f' }, { id: 'hv', label: 'Helping', sub: 'works with a main verb', emoji: '🤝', color: '#2f6fe4' }, { id: 'lv', label: 'Linking', sub: 'connects to a describing word', emoji: '🔗', color: '#1fa34a' }];
  const items = [];
  ['av', 'hv', 'lv'].forEach(tg => {
    deck('svk:' + tg, SENT.verb).draw(2, s => tagIn(s.find(t => tagIn(t, [tg])) || { tags: [] }, [tg])).forEach((s, i) => {
      const cands = s.filter(t => tagIn(t, [tg]));
      const hl = cands[0];
      const html = s.map(t => t === hl ? `<b class="hl">${esc(t.t)}</b>` : esc(t.t)).join(' ');
      items.push({ id: tg + i + rnd(1e6), html, bucket: tg, sent: true });
    });
  });
  return { type: 'sort', skill: 'action', prompt: 'What job does the <b class="hl">bold</b> verb do? Drag each sentence!', buckets: B, items: shuffle(items), hint: 'Act it out? Action. Has a buddy verb? Helping. Connects to a describing word? Linking.', explain: 'A verb’s job depends on how it is used in the sentence!' };
};
G.matchVerbJob = () => matchRound('linking', 'Match each verb to its job!', [{ id: 'a', left: 'Action verb', right: 'shows what someone does' }, { id: 'b', left: 'Helping verb', right: 'works with a main verb' }, { id: 'c', left: 'Linking verb', right: 'connects the subject to a describing word' }], SKILL.linking.rule);
G.labelVerbs = () => {
  const L = [{ id: 'hv', label: 'helping verb', tags: ['hv'], color: '#2f6fe4' }, { id: 'av', label: 'action verb', tags: ['av'], color: '#e0452f' }];
  const s = deck('lv', SENT.verb).draw(1, x => x.some(t => tagIn(t, ['hv'])) && x.some(t => tagIn(t, ['av'])))[0];
  return labelRound('helping', 'Drag the labels onto the verbs!', s, L, 'The helping verb has a buddy: the action verb right after it.');
};
const POP_VERB = {
  helping: () => popRound('helping', 'Pop all the HELPING verbs!', pickN(W.helping, 4), pickN(W.action, 4), SKILL.helping.rule),
  linking: () => popRound('linking', 'Pop all the LINKING verbs!', pickN(W.linking, 4), pickN(W.action, 4), SKILL.linking.rule),
  action: () => popRound('action', 'Pop all the ACTION verbs!', pickN(W.action, 4), pickN(['dog', 'pencil', 'tall', 'happy', 'school', 'blue'], 4), SKILL.action.rule)
};
G.popVerb = kind => POP_VERB[kind || 'action']();

/* ---- tenses ---- */
const tenseOf = s => s.some(t => t.tags.includes('fut')) ? 'future' : s.some(t => t.tags.includes('past')) ? 'past' : 'present';
const TENSE_WHY = { past: 'It already happened, so it is past tense.', present: 'It happens now or regularly, so it is present tense.', future: 'It will happen later, so it is future tense.' };
G.mcTenseSent = want => {
  const s = deck('mt', SENT.tense).draw(1, x => !want || tenseOf(x) === want)[0];
  const tn = tenseOf(s);
  const verb = s.filter(t => tagIn(t, ['pres', 'past', 'fut'])).map(t => wordOnly(t.t)).join(' ');
  return mc(tn === 'future' ? 'future' : 'tense', `What is the tense of <i>${verb}</i> in this sentence?`, cap(tn), without(['Present', 'Past', 'Future'], [cap(tn)]), { sentence: sentText(s), hint: 'Ask: When did it happen? Already, now, or later?', explain: `<b>${verb}</b> is ${tn} tense. ${TENSE_WHY[tn]}` });
};
G.mcTriple = want => {
  want = want || pick1(['past', 'present', 'future']);
  const tr = deck('tr', TRIPLES).draw(1)[0];
  const idx = { present: 0, past: 1, future: 2 }[want];
  return mc(want === 'future' ? 'future' : 'tense', `Which sentence is in the ${want} tense?`, tr[idx], without(tr, [tr[idx]]), { hint: want === 'future' ? 'Future = will + a verb.' : 'Ask: When did it happen?', explain: `“${tr[idx]}” is ${want} tense. ${TENSE_WHY[want]}` });
};
G.sortTense = () => {
  const B = [{ id: 'past', label: 'Past', sub: 'already happened', emoji: '⏪', color: '#8a3fe0' }, { id: 'present', label: 'Present', sub: 'happens now', emoji: '⏺️', color: '#1fa34a' }, { id: 'future', label: 'Future', sub: 'will happen later', emoji: '⏩', color: '#e57a0b' }];
  const items = [];
  ['past', 'present', 'future'].forEach(k => deck('st:' + k, SENT.tense).draw(2, s => tenseOf(s) === k).forEach((s, i) => {
    const html = s.map(t => tagIn(t, ['pres', 'past', 'fut']) ? `<b class="hl">${esc(t.t)}</b>` : esc(t.t)).join(' ');
    items.push({ id: k + i + rnd(1e6), html, bucket: k, sent: true });
  }));
  return { type: 'sort', skill: 'tense', prompt: 'When does it happen? Drag each sentence to the right time!', buckets: B, items: shuffle(items), hint: 'Look at the bold verb. Already happened = past. will + verb = future.', explain: SKILL.tense.rule };
};
G.gapTense = kind => {
  const it = deck('gt', GAP.tense).draw(1, x => !kind || x.k === kind)[0];
  return gapRound(kind === 'future' ? 'future' : 'tense', it, 'Drag the right verb into the blank!', `<b>${it.a}</b> is ${it.k} tense.`);
};
G.gapFuture = () => {
  const it = deck('gf', GAP.future).draw(1)[0];
  return gapRound('future', { t: it.t, a: it.a, w: it.x }, 'Build the future! Drag two words into the blanks.', `<b>${it.a.join(' ')}</b> is the future verb phrase: will + the verb.`);
};
G.matchIrrPast = () => matchRound('tense', 'Match each verb to its PAST tense!', pickN(IRR_PAST, 4).map((p, i) => ({ id: 'ip' + i, left: p[0], right: p[1] })), 'Irregular verbs change in different ways: go → went, eat → ate, see → saw, run → ran.');
G.popTense = kind => {
  kind = kind || pick1(['past', 'future', 'present']);
  const P = {
    past: () => popRound('tense', 'Pop all the PAST tense verbs!', pickN(W.pastW, 4), pickN(W.presW, 2).concat(pickN(W.futW, 2)), SKILL.tense.rule),
    future: () => popRound('future', 'Pop all the FUTURE verb phrases!', pickN(W.futW, 3), pickN(W.pastW, 3).concat(pickN(W.presW, 2)), SKILL.future.rule),
    present: () => popRound('tense', 'Pop all the PRESENT tense verbs!', pickN(W.presW, 4), pickN(W.pastW, 2).concat(pickN(W.futW, 2)), SKILL.tense.rule)
  };
  return P[kind]();
};

/* ---- adjectives and adverbs ---- */
G.mcAdjKind = () => {
  const K = [['what kind', 'adjKind'], ['which one', 'adjWhich'], ['how many', 'adjMany']];
  const [q, key] = pick1(K);
  const c = pick1(W[key]);
  const wr = K.filter(k => k[1] !== key).map(k => pick1(W[k[1]]));
  return mc('adj', `Which adjective tells <b>${q}</b>?`, c, wr, { hint: 'What kind? fluffy. Which one? that. How many? three.', explain: `<b>${c}</b> tells ${q}. It is an adjective.` });
};
G.sortAdjType = () => {
  const B = [{ id: 'kind', label: 'What kind?', sub: 'fluffy kitten', emoji: '🎀', color: '#d6237a' }, { id: 'which', label: 'Which one?', sub: 'that book', emoji: '👉', color: '#2f6fe4' }, { id: 'many', label: 'How many?', sub: 'three birds', emoji: '🔢', color: '#1fa34a' }];
  const items = [];
  pickN(W.adjKind, 3).forEach(w => items.push({ id: w, html: esc(w), bucket: 'kind' }));
  pickN(W.adjWhich, 2).forEach(w => items.push({ id: w, html: esc(w), bucket: 'which' }));
  pickN(W.adjMany, 3).forEach(w => items.push({ id: w, html: esc(w), bucket: 'many' }));
  return { type: 'sort', skill: 'adj', prompt: 'What does each adjective tell? Drag it!', buckets: B, items: shuffle(items), hint: 'Numbers tell how many. This, that, those, these tell which one.', explain: SKILL.adj.rule };
};
G.matchAdjNoun = () => matchRound('adj', 'Which adjective describes each noun? Drag it on!', pick1(ADJNOUN).map((p, i) => ({ id: 'an' + i, left: p[0], right: p[1] })), 'Adjectives describe nouns.');
G.popAdj = () => popRound('adj', 'Pop all the ADJECTIVES!', pickN(W.adj, 4), pickN(['dog', 'pencil', 'jump', 'eat', 'park', 'slowly'], 4), SKILL.adj.rule);
G.popAdjMany = () => popRound('adj', 'Pop the words that tell HOW MANY!', pickN(W.adjMany, 3), pickN(W.adjKind, 2).concat(pickN(W.adjWhich, 2)), 'Numbers tell how many.');
G.mcAdvType = which => {
  which = which || pick1(['how', 'when', 'where']);
  const key = { how: 'advHow', when: 'advWhen', where: 'advWhere' }[which];
  const c = pick1(W[key]);
  return mc('adv', `Which word is an adverb that tells <b>${which}</b>?`, c, [pick1(W.adj), pick1(W.allNoun)], { hint: `Ask: ${cap(which)} did it happen?`, explain: `<b>${c}</b> tells ${which}. It is an adverb.` });
};
G.sortAdvType = () => {
  const B = [{ id: 'how', label: 'How?', sub: 'slowly', emoji: '🐌', color: '#0d9488' }, { id: 'when', label: 'When?', sub: 'tomorrow', emoji: '📅', color: '#e57a0b' }, { id: 'where', label: 'Where?', sub: 'outside', emoji: '📍', color: '#8a3fe0' }];
  const items = [];
  [['how', 'advHow'], ['when', 'advWhen'], ['where', 'advWhere']].forEach(([id, k]) => pickN(W[k], 2).forEach(w => items.push({ id: w, html: esc(w), bucket: id })));
  return { type: 'sort', skill: 'adv', prompt: 'Does each adverb tell HOW, WHEN, or WHERE? Drag it!', buckets: B, items: shuffle(items), hint: 'Slowly = how. Tomorrow = when. Outside = where.', explain: SKILL.adv.rule };
};
G.matchAdvQ = () => matchRound('adv', 'Match each question to an adverb!', [{ id: 'h', left: 'How?', right: pick1(W.advHow) }, { id: 'w', left: 'When?', right: pick1(W.advWhen) }, { id: 'x', left: 'Where?', right: pick1(W.advWhere) }], SKILL.adv.rule);
G.popAdv = () => popRound('adv', 'Pop all the ADVERBS!', pickN(W.advAll, 4), pickN(W.adj, 2).concat(pickN(['dog', 'pencil', 'park', 'book'], 2)), 'Adverbs tell how, when, or where. Not all end in ‑ly!');
G.popAdvType = which => {
  which = which || pick1(['how', 'when', 'where']);
  const K = { how: 'advHow', when: 'advWhen', where: 'advWhere' };
  const dis = [].concat(...Object.keys(K).filter(k => k !== which).map(k => pickN(W[K[k]], 2)));
  return popRound('adv', `Pop the adverbs that tell ${which.toUpperCase()}!`, pickN(W[K[which]], 3), dis, `These adverbs tell ${which}.`);
};
G.popAdjVsAdv = kind => {
  kind = kind || pick1(['adjectives', 'adverbs']);
  if (kind === 'adjectives') return popRound('adjadv', 'Pop the ADJECTIVES (they describe nouns)!', pickN(W.adj, 3), pickN(W.advHow, 3).concat(pickN(['dog', 'book'], 1)), 'Adjectives describe nouns.');
  return popRound('adjadv', 'Pop the ADVERBS (they tell how, when, or where)!', pickN(W.advAll, 3), pickN(W.adj, 3).concat(pickN(['dog', 'book'], 1)), 'Adverbs describe actions.');
};
G.sortAdjAdv = () => {
  const B = [{ id: 'adj', label: 'Adjective', sub: 'describes a noun', emoji: '🎨', color: '#d6237a' }, { id: 'adv', label: 'Adverb', sub: 'how, when, where', emoji: '🐢', color: '#0d9488' }];
  const items = [];
  pickN(W.adj, 4).forEach(w => items.push({ id: w, html: esc(w), bucket: 'adj' }));
  pickN(W.advAll, 4).forEach(w => items.push({ id: w, html: esc(w), bucket: 'adv' }));
  return { type: 'sort', skill: 'adjadv', prompt: 'Adjective or adverb? Drag each word!', buckets: B, items: shuffle(items), hint: 'Describes a THING = adjective. Describes an ACTION = adverb.', explain: SKILL.adjadv.rule };
};
G.labelAdjAdv = () => {
  const L = [{ id: 'adj', label: 'adjective', tags: ['adj'], color: '#d6237a' }, { id: 'adv', label: 'adverb', tags: ['adv'], color: '#0d9488' }];
  const s = deck('laa', SENT.mix).draw(1)[0];
  return labelRound('adjadv', 'Drag the labels onto the adjective and the adverb!', s, L, 'The adjective describes the noun. The adverb tells how the action happens.', ['adj', 'adv']);
};
G.gapAdj = () => { const it = deck('ga', GAP.adj).draw(1)[0]; return gapRound('adj', it, 'Drag an adjective into the blank!', `<b>${it.a}</b> is an adjective. It describes a noun.`); };
G.gapAdv = () => { const it = deck('gv2', GAP.adv).draw(1)[0]; return gapRound('adv', it, 'Drag an adverb into the blank!', `<b>${it.a}</b> is an adverb. It tells how, when, or where.`); };
G.gapNoun = () => { const it = deck('gn', GAP.noun).draw(1)[0]; return gapRound('noun', it, 'Drag a noun into the blank!', `<b>${it.a}</b> is a noun. It names ${aType(nounType(it.a))}.`); };

/* ---- interjections ---- */
G.mcInterj = () => {
  const c = pick1(W.ij);
  return mc('ij', 'Which word is an interjection?', c, [pick1(['green', 'blue', 'red', 'tall', 'happy']), pick1(W.advHow)], { explain: `<b>${c}</b> shows a sudden feeling. It is an interjection!` });
};
G.mcFeeling = () => {
  const [sc, c, wr] = pick1(SCEN);
  return mc('ij', `${sc}<br>Which interjection fits?`, c, wr, { hint: 'Think about the feeling. Say it out loud!', explain: `<b>${c}</b> fits the feeling. Interjections express feelings!` });
};
G.matchFeel = () => matchRound('ij', 'Match each interjection to its feeling!', pickN(FEEL, 4).map((f, i) => ({ id: 'f' + i, left: f[0], right: f[1] + ' ' + f[2] })), 'Interjections express feelings!');
G.gapPunct = () => {
  const it = deck('gpu', PUNCT).draw(1)[0];
  const ans = it.big ? '!' : ',';
  return { type: 'gap', skill: 'ij', prompt: 'Big feeling or small feeling? Drag the right mark!', parts: [it.a, { gap: 0 }, it.rest], answers: [ans], choices: ['!', ','], punct: true, hint: 'Big feeling = exclamation mark. Small feeling = comma.', explain: it.big ? `A big feeling gets an exclamation mark: <b>${it.a}!</b>` : `A small feeling gets a comma: <b>${it.a},</b>` };
};
G.sortInterj = () => {
  const B = [{ id: 'yes', label: 'Interjection', sub: 'a sudden feeling', emoji: '💥', color: '#c58a00' }, { id: 'no', label: 'Not an interjection', sub: '', emoji: '🙅', color: '#6b7280' }];
  const items = [];
  pickN(W.ij, 4).forEach(w => items.push({ id: w, html: esc(w), bucket: 'yes' }));
  pickN(['happy', 'slowly', 'dog', 'tall', 'jump', 'tomorrow', 'pencil', 'soft'], 4).forEach(w => items.push({ id: w, html: esc(w), bucket: 'no' }));
  return { type: 'sort', skill: 'ij', prompt: 'Is it an interjection? Drag each word!', buckets: B, items: shuffle(items), hint: 'Does it show a sudden feeling, like Wow! or Ouch!?', explain: SKILL.ij.rule };
};
G.popIj = () => popRound('ij', 'Pop all the INTERJECTIONS!', pickN(W.ij, 4), pickN(['happy', 'slowly', 'dog', 'tall', 'tomorrow', 'pencil'], 4), SKILL.ij.rule);
G.memFeel = () => memoryRound('ij', 'Flip cards to match each interjection to its feeling!', pickN(FEEL, 4).map(f => [f[0], f[1]]), 'Interjections express feelings!');

/* ---- plurals ---- */
const REG = ['s', 'es', 'ies'];
const wrongPl = (sg, type) => {
  if (type === 's') return [sg + 'es', sg + sg.slice(-1) + 'es'];
  if (type === 'es') return [sg + 's', sg + 'ies'];
  if (type === 'ies') return [sg + 's', sg + 'es'];
  return [sg + 's', sg + 'es'];
};
G.mcPlural = type => {
  type = type || pick1(['s', 'es', 'ies', 'irr']);
  const [sg, pl] = pick1(PL[type]);
  return mc('plural', `What is the plural of <b>${sg}</b>?`, pl, wrongPl(sg, type), { hint: 'Look at the ending. s, x, ch, sh → -es. Consonant + y → flip to i and add ‑es.', explain: `<b>${pl}</b> is right! ${PL_RULE[type]}` });
};
G.mcPluralRule = () => {
  const type = pick1(['s', 'es', 'ies', 'irr']);
  const [sg, pl] = pick1(PL[type]);
  const R = { s: 'add ‑s', es: 'add ‑es', ies: 'change y to i, add ‑es', irr: 'special (irregular)' };
  return mc('plural', `How do you make the plural of <b>${sg}</b>?`, R[type], pickN(without(Object.keys(R), [type]), 2).map(k => R[k]), { hint: 'Look at the last letters of the word.', explain: `${sg} → <b>${pl}</b>. ${PL_RULE[type]}` });
};
G.mcRegIrr = want => {
  const irr = want === undefined ? Math.random() < 0.5 : want === 'irr';
  const type = irr ? 'irr' : pick1(REG);
  const [sg, pl] = pick1(PL[type]);
  return {
    type: 'mc', skill: 'plurid', prompt: `The plural noun <i>${pl}</i> is:`, options: ['Regular', 'Irregular'], answer: irr ? 1 : 0, hint: 'Did it just add ‑s or -es (or flip the y)? Regular. A surprise change? Irregular.',
    explain: irr ? `<b>${pl}</b> is irregular. ${sg} changes in a special way.` : `<b>${pl}</b> is regular. ${PL_RULE[type]}`
  };
};
G.sortRule = () => {
  const B = [{ id: 's', label: 'add ‑s', sub: '', emoji: '➕', color: '#1fa34a' }, { id: 'es', label: 'add ‑es', sub: 's, x, ch, sh', emoji: '🐍', color: '#2f6fe4' }, { id: 'ies', label: 'y → ies', sub: 'flip the y', emoji: '🙃', color: '#d6237a' }, { id: 'irr', label: 'special', sub: 'irregular', emoji: '🦹', color: '#8a3fe0' }];
  const items = [];
  B.forEach(b => pickN(PL[b.id], 2).forEach(p => items.push({ id: p[0], html: esc(p[0]), bucket: b.id })));
  return { type: 'sort', skill: 'plural', prompt: 'How do you make each word plural? Drag it!', buckets: B, items: shuffle(items), hint: 'Hiss words (s, x, ch, sh) add ‑es. Baby → babies. Child → children is special.', explain: SKILL.plural.rule };
};
G.sortRegIrr = () => {
  const B = [{ id: 'reg', label: 'Regular', sub: 'follows a rule', emoji: '📏', color: '#1fa34a' }, { id: 'irr', label: 'Irregular', sub: 'breaks the rules', emoji: '🦹', color: '#8a3fe0' }];
  const items = [];
  const regs = [].concat(...REG.map(k => PL[k]));
  pickN(regs, 4).forEach(p => items.push({ id: p[1], html: esc(p[1]), bucket: 'reg' }));
  pickN(PL.irr, 4).forEach(p => items.push({ id: p[1], html: esc(p[1]), bucket: 'irr' }));
  return { type: 'sort', skill: 'plurid', prompt: 'Is each plural noun regular or irregular? Drag it!', buckets: B, items: shuffle(items), hint: 'Regular: just -s or -es (or flip the y). Irregular: a special change.', explain: SKILL.plurid.rule };
};
G.endingBuild = () => {
  const words = [].concat(pickN(PL.s, 1), pickN(PL.es, 2), pickN(PL.ies, 2));
  const typeOf = pl => PL.s.includes(pl) ? 's' : PL.es.includes(pl) ? 'es' : 'ies';
  const ws = shuffle(words).map(p => { const t = typeOf(p); return { base: p[0], op: t, result: p[1], note: PL_RULE[t] }; });
  return { type: 'ending', skill: 'plural', prompt: 'Make it plural! Drag the right ending onto the word.', words: ws, ops: [{ id: 's', label: '+ s' }, { id: 'es', label: '+ es' }, { id: 'ies', label: 'y → ies' }], hint: 'Hiss ending (s, x, ch, sh)? -es. Consonant + y? flip it. Otherwise -s.', explain: SKILL.plural.rule };
};
G.matchIrr = () => matchRound('plural', 'Match each word to its irregular plural!', pickN(PL.irr, 4).map((p, i) => ({ id: 'ir' + i, left: p[0], right: p[1] })), 'Irregular plurals change in special ways: child → children, man → men, mouse → mice.');
G.popIrr = () => {
  const regs = [].concat(...REG.map(k => PL[k]));
  return popRound('plurid', 'Pop all the IRREGULAR plurals!', pickN(PL.irr, 4).map(p => p[1]), pickN(regs, 4).map(p => p[1]), 'Irregular plurals change in a special way.');
};
G.memPlural = () => {
  const regs = [].concat(...REG.map(k => PL[k]));
  return memoryRound('plural', 'Match each word to its plural!', pickN(regs, 3).concat(pickN(PL.irr, 3)), 'Some plurals follow rules. Some are irregular!');
};

/* ---- proper nouns ---- */
G.sortCP = () => {
  const B = [{ id: 'c', label: 'Common noun', sub: 'general, no capital', emoji: '🏘️', color: '#2f6fe4' }, { id: 'p', label: 'Proper noun', sub: 'special name, CAPITAL', emoji: '🎩', color: '#d6237a' }];
  const items = [];
  pickN(W.common, 3).forEach(w => items.push({ id: w, html: esc(w), bucket: 'c' }));
  pickN(W.proper, 3).forEach(w => items.push({ id: w, html: esc(w), bucket: 'p' }));
  return { type: 'sort', skill: 'proper', prompt: 'Common or proper? Look for the capital letter!', buckets: B, items: shuffle(items), hint: 'A capital letter means a special name: a proper noun.', explain: SKILL.proper.rule };
};
G.matchCP = () => matchRound('proper', 'Match each common noun to a proper noun (a special name)!', pickN(CPAIRS, 4).map((p, i) => ({ id: 'cp' + i, left: p[0], right: p[1] })), 'Proper nouns are special names with capital letters.');
G.popProper = () => popRound('proper', 'Pop all the PROPER nouns (capital letters)!', pickN(W.proper, 4), pickN(W.common, 4), SKILL.proper.rule);
G.memCP = () => memoryRound('proper', 'Match each common noun to its special name!', pickN(CPAIRS, 4), 'Proper nouns are special names with capital letters.');

/* ---- nouns: sort & pop ---- */
G.sortNounType = () => {
  const B = [{ id: 'person', label: 'Person', sub: '', emoji: '🧑', color: '#2f6fe4' }, { id: 'place', label: 'Place', sub: '', emoji: '🏫', color: '#1fa34a' }, { id: 'animal', label: 'Animal', sub: '', emoji: '🐶', color: '#e57a0b' }, { id: 'thing', label: 'Thing', sub: '', emoji: '📦', color: '#8a3fe0' }];
  const items = [];
  B.forEach(b => pickN(W[b.id], 2).forEach(w => items.push({ id: w, html: esc(w), bucket: b.id })));
  return { type: 'sort', skill: 'noun', prompt: 'Is each noun a person, place, animal, or thing? Drag it!', buckets: B, items: shuffle(items), hint: 'Who? Where? Which animal? What thing?', explain: SKILL.noun.rule };
};
G.popNouns = () => popRound('noun', 'Pop all the NOUNS!', pickN(W.allNoun, 4), pickN(W.notNoun, 4), SKILL.noun.rule);
G.popNounType = () => {
  const t = pick1(['person', 'place', 'animal', 'thing']);
  const lab = { person: 'PEOPLE', place: 'PLACES', animal: 'ANIMALS', thing: 'THINGS' }[t];
  const dis = [].concat(...without(['person', 'place', 'animal', 'thing'], [t]).map(k => pickN(W[k], 2)));
  return popRound('noun', `Pop the nouns that name ${lab}!`, pickN(W[t], 3), dis, SKILL.noun.rule);
};

/* ---- mix: parts of speech ---- */
G.mcPOS = () => {
  const cat = pick1(Object.keys(POS)), w = pick1(POS[cat]);
  const art = { Noun: 'a noun', Verb: 'a verb', Adjective: 'an adjective', Adverb: 'an adverb' }[cat];
  const J = { Noun: 'It names a person, place, animal, or thing.', Verb: 'It shows an action.', Adjective: 'It describes a noun.', Adverb: 'It tells how, when, or where.' }[cat];
  return mc('mix', `What kind of word is <b>${w}</b>?`, cat, pickN(without(Object.keys(POS), [cat]), 2), { hint: 'Names? Does? Describes a noun? Tells how, when, where?', explain: `<b>${w}</b> is ${art}. ${J}` });
};
G.sortPOS = () => {
  const C = { Noun: ['#2f6fe4', '🏠', 'names a thing'], Verb: ['#e0452f', '🏃', 'an action'], Adjective: ['#d6237a', '🎨', 'describes a noun'], Adverb: ['#0d9488', '🐢', 'how, when, where'] };
  const B = Object.keys(C).map(k => ({ id: k, label: k, sub: C[k][2], emoji: C[k][1], color: C[k][0] }));
  const items = [];
  B.forEach(b => pickN(POS[b.id], 2).forEach(w => items.push({ id: w, html: esc(w), bucket: b.id })));
  return { type: 'sort', skill: 'mix', prompt: 'What kind of word is each one? Drag it!', buckets: B, items: shuffle(items), hint: 'Names a thing? Noun. An action? Verb. Describes a noun? Adjective. How, when, where? Adverb.', explain: SKILL.mix.rule };
};
G.labelMix = () => {
  const L = [{ id: 'n', label: 'noun', tags: ['n', 'pn'], color: '#2f6fe4' }, { id: 'av', label: 'verb', tags: ['av'], color: '#e0452f' }, { id: 'adj', label: 'adjective', tags: ['adj'], color: '#d6237a' }, { id: 'adv', label: 'adverb', tags: ['adv'], color: '#0d9488' }];
  const s = deck('lm', SENT.mix).draw(1)[0];
  return labelRound('mix', 'Drag each label onto the right word!', s, L, 'Noun names, verb acts, adjective describes a noun, adverb tells how.');
};
G.popPOS = () => {
  const cat = pick1(Object.keys(POS));
  const dis = [].concat(...without(Object.keys(POS), [cat]).map(k => pickN(POS[k], 2)));
  return popRound('mix', `Pop all the ${cat.toUpperCase()}S!`, pickN(POS[cat], 3), pickN(dis, 5), SKILL.mix.rule);
};

/* ---- round builders shared above ---- */
function gapRound(skill, it, prompt, explain) {
  const raw = it.t.split('___');
  const parts = [];
  const answers = Array.isArray(it.a) ? it.a : [it.a];
  raw.forEach((seg, i) => { if (seg) parts.push(seg); if (i < raw.length - 1) parts.push({ gap: i }); });
  const choices = shuffle(answers.concat(it.w || []));
  return { type: 'gap', skill, prompt, parts, answers, choices, hint: SKILL[skill] ? SKILL[skill].ask : '', explain };
}
function popRound(skill, prompt, targets, distract, explain) {
  const items = shuffle(targets.map(t => ({ t, ok: true })).concat(distract.map(t => ({ t, ok: false }))));
  return { type: 'pop', skill, prompt, items, hint: 'Look carefully at each bubble. Does it match?', explain: explain || '' };
}
function matchRound(skill, prompt, pairs, explain) {
  return { type: 'match', skill, prompt, pairs, hint: 'Think about which two go together.', explain };
}
function memoryRound(skill, prompt, pairs, explain) {
  return { type: 'memory', skill, prompt, pairs, hint: 'Flip two cards. If they match, they stay!', explain };
}
function labelRound(skill, prompt, toks, labels, explain, only) {
  return { type: 'label', skill, prompt, toks, labels, hint: explain, explain };
}

/* ---- skills → generators for each way ---- */
const SK = {};
const pn = t => ({
  pick: [() => G.mcPron(t), HUNT[t], () => G.mcPron(t)],
  drag: [() => G.gapPron(t), G.sortPron, G.labelPron],
  play: [() => G.popPron(t), () => G.popPron(t), G.popPron]
});
SK.noun = { pick: [G.mcNoun, G.mcNounType, HUNT.noun, G.mcNoun], drag: [G.sortNounType, G.gapNoun, G.sortNounType], play: [G.popNouns, G.popNounType, G.popNouns] };
SK.proper = { pick: [G.mcProper, HUNT.proper, G.mcCommon], drag: [G.sortCP, G.matchCP, G.sortCP], play: [G.popProper, G.memCP, G.popProper] };
SK.plural = { pick: [() => G.mcPlural(), G.mcPluralRule, () => G.mcPlural()], drag: [G.endingBuild, G.sortRule, G.matchIrr], play: [G.memPlural, G.popIrr, G.memPlural] };
SK.plurid = { pick: [() => G.mcRegIrr(), HUNT.irr, () => G.mcRegIrr()], drag: [G.sortRegIrr, G.matchIrr, G.sortRegIrr], play: [G.popIrr, G.memPlural, G.popIrr] };
SK.subj = pn('subj'); SK.obj = pn('obj'); SK.poss = pn('poss'); SK.refl = pn('refl');
SK.pronjob = { pick: [G.mcWhichPron, G.mcWhichPron, () => G.mcPron()], drag: [G.matchPronJob, G.sortPron, G.labelPron], play: [() => G.popPron(), () => G.popPron(), () => G.popPron()] };
SK.action = { pick: [() => G.mcVerbWord('action'), HUNT.action, () => G.mcVerbWord('action')], drag: [() => G.gapVerb('action'), G.sortVerbKind, G.labelVerbs], play: [() => G.popVerb('action'), () => G.popVerb('action'), () => G.popVerb('action')] };
SK.helping = { pick: [() => G.mcVerbWord('helping'), HUNT.helping, G.mcIsJob], drag: [() => G.gapVerb('helping'), G.labelVerbs, G.sortVerbKind], play: [() => G.popVerb('helping'), () => G.popVerb('helping'), () => G.popVerb('helping')] };
SK.linking = { pick: [() => G.mcVerbWord('linking'), HUNT.linking, G.mcIsJob], drag: [() => G.gapVerb('linking'), G.matchVerbJob, G.sortVerbKind], play: [() => G.popVerb('linking'), () => G.popVerb('linking'), () => G.popVerb('linking')] };
SK.tense = { pick: [() => G.mcTenseSent(), () => G.mcTriple(), HUNT.past, () => G.mcTenseSent()], drag: [G.sortTense, () => G.gapTense(), G.matchIrrPast], play: [() => G.popTense(), G.memPlural && (() => memoryRound('tense', 'Match each verb to its past tense!', pickN(MEM_PAST, 6), 'Past tense: it already happened. Irregular verbs change in special ways.')), () => G.popTense()] };
SK.future = { pick: [() => G.mcTriple('future'), HUNT.fut, () => G.mcTenseSent('future')], drag: [G.gapFuture, () => G.gapTense('future'), G.sortTense], play: [() => G.popTense('future'), () => G.popTense('future'), () => G.popTense('future')] };
SK.adj = { pick: [G.mcAdjSent, G.mcAdjKind, HUNT.adj, G.mcAdjSent], drag: [G.gapAdj, G.sortAdjType, G.matchAdjNoun], play: [G.popAdj, G.popAdjMany, G.popAdj] };
SK.adv = { pick: [G.mcAdvSent, () => G.mcAdvType(), HUNT.adv, G.mcAdvSent], drag: [G.gapAdv, G.sortAdvType, G.matchAdvQ], play: [G.popAdv, () => G.popAdvType(), G.popAdv] };
SK.adjadv = { pick: [HUNT.adjadv, G.mcAdjOnly, G.mcAdvOnly], drag: [G.labelAdjAdv, G.sortAdjAdv, G.labelAdjAdv], play: [() => G.popAdjVsAdv('adjectives'), () => G.popAdjVsAdv('adverbs'), G.popAdjVsAdv] };
SK.ij = { pick: [G.mcInterj, HUNT.ij, G.mcFeeling, G.mcInterjSent], drag: [G.matchFeel, G.gapPunct, G.sortInterj], play: [G.popIj, G.memFeel, G.popIj] };
SK.mix = { pick: [G.mcPOS, HUNT.mixAdj, G.mcPOS, HUNT.mixNoun], drag: [G.labelMix, G.sortPOS, G.labelMix], play: [G.popPOS, G.popPOS, G.popPOS] };

/* overrides so a question’s extra practice matches that exact question */
const TQ_OVERRIDE = {
  12: { pick: [() => G.mcTenseSent('past'), () => G.mcTriple('past')], drag: [G.sortTense, () => G.gapTense('past')], play: [() => G.popTense('past'), () => memoryRound('tense', 'Match each verb to its past tense!', pickN(MEM_PAST, 6), 'Past tense: it already happened.')] },
  13: { pick: [() => G.mcTriple('future'), () => G.mcTriple('future')], drag: [G.gapFuture, () => G.gapTense('future')], play: [() => G.popTense('future'), () => G.popTense('future')] },
  16: { pick: [() => G.mcAdvType('when'), () => G.mcAdvType('when')], drag: [G.sortAdvType, () => G.matchAdvQ()], play: [() => G.popAdvType('when'), () => G.popAdv()] },
  19: { pick: [HUNT.fut, () => G.mcTriple('future')], drag: [G.gapFuture, G.sortTense], play: [() => G.popTense('future'), () => G.popTense('future')] },
  20: { pick: [G.mcInterjSent, HUNT.ij], drag: [G.gapPunct, G.matchFeel], play: [G.popIj, G.memFeel] }
};

/* the question exactly as printed on the worksheet */
function exactRound(q) {
  return {
    type: 'mc', skill: q.skill, prompt: q.stem, sentence: q.sentence || '', options: q.opts.slice(), answer: q.a, exact: q.n, letters: true,
    hint: SKILL[q.skill].ask, explain: q.why, page: q.page
  };
}
function cycle(fns, n) {
  const out = []; let guard = 0;
  while (out.length < n && guard++ < 60) {
    const fn = fns[out.length % fns.length];
    if (!fn) break;
    const r = fn(); if (r) out.push(r);
  }
  return out;
}
/* topic ways: pull from every skill in the island in turn */
function topicRounds(topic, way) {
  const kind = ['pick', 'drag', 'play'][way - 1];
  const total = [8, 6, 6][way - 1];
  const fnsBySkill = topic.skills.map(s => SK[s][kind]);
  const out = [];
  const pos = fnsBySkill.map(() => 0);
  let i = 0, guard = 0;
  while (out.length < total && guard++ < 100) {
    const si = i % fnsBySkill.length; i++;
    const fns = fnsBySkill[si];
    const fn = fns[pos[si] % fns.length]; pos[si]++;
    try { const r = fn(); if (r) out.push(r); } catch (e) { console.error(e); }
  }
  return out;
}
function testRounds(q, way) {
  const kind = ['pick', 'drag', 'play'][way - 1];
  const ov = TQ_OVERRIDE[q.n];
  const fns = (ov && ov[kind]) || SK[q.skill][kind];
  if (way === 1) return [exactRound(q)].concat(cycle(fns.slice(0, 3), 2));
  return cycle(fns, 3);
}
