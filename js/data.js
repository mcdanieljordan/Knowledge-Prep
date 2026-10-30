'use strict';
/* ============ content: banks, lessons, test questions, pages ============ */

const WAYS = [
  { n: 1, name: 'Pick It', icon: '👆', tag: 'Tap the right answers', learn: 'The Rule', learnIcon: '📘' },
  { n: 2, name: 'Drag It', icon: '🧲', tag: 'Drag and drop words', learn: 'The Trick', learnIcon: '🪄' },
  { n: 3, name: 'Play It', icon: '🎮', tag: 'Pop bubbles and match', learn: 'Ask Yourself', learnIcon: '❓' }
];

/* ---------- word banks ---------- */
const W = {
  person: ['teacher', 'girl', 'doctor', 'boy', 'baker', 'nurse', 'farmer', 'pilot', 'king', 'artist'],
  place: ['school', 'park', 'store', 'house', 'library', 'zoo', 'beach', 'farm', 'kitchen', 'playground'],
  animal: ['dog', 'rabbit', 'kitten', 'horse', 'bird', 'fish', 'frog', 'duck', 'cow', 'pig'],
  thing: ['pencil', 'book', 'chair', 'ball', 'cup', 'shoe', 'kite', 'table', 'backpack', 'cookie', 'hat', 'bike'],
  notNoun: ['quickly', 'slowly', 'jump', 'eat', 'sing', 'swim', 'happy', 'tall', 'loudly', 'kindly', 'giggle', 'bright', 'soft', 'hop'],
  common: ['city', 'teacher', 'school', 'girl', 'boy', 'dog', 'park', 'state', 'river', 'town', 'doctor', 'country', 'store', 'pig'],
  proper: ['Austin', 'Texas', 'Charlotte', 'Wilbur', 'Fern', 'Cedar Park', 'Florida', 'Lily', 'Sam'],
  subj: ['I', 'he', 'she', 'we', 'they'],
  obj: ['me', 'him', 'us', 'them'],
  poss: ['mine', 'yours', 'hers', 'ours', 'theirs'],
  refl: ['myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves'],
  action: ['run', 'jump', 'eat', 'write', 'swim', 'hop', 'sing', 'giggle', 'laugh'],
  helping: ['will', 'has', 'have', 'had', 'do', 'does', 'did', 'am', 'is', 'are', 'was', 'were'],
  linking: ['am', 'is', 'are', 'was', 'were', 'smells', 'looks'],
  adj: ['fluffy', 'tall', 'sweet', 'beautiful', 'tiny', 'happy', 'red', 'blue', 'little', 'huge', 'soft', 'shiny'],
  adjKind: ['fluffy', 'tall', 'sweet', 'beautiful', 'tiny', 'happy', 'red', 'huge', 'soft', 'shiny'],
  adjWhich: ['that', 'this', 'those', 'these'],
  adjMany: ['one', 'two', 'three', 'five', 'ten', 'many'],
  advHow: ['slowly', 'beautifully', 'quickly', 'carefully', 'gracefully', 'peacefully'],
  advWhen: ['tomorrow', 'yesterday', 'soon', 'today', 'later'],
  advWhere: ['outside', 'here', 'away', 'inside', 'there'],
  ij: ['Wow!', 'Oops!', 'Hooray!', 'Ouch!', 'Oh!', 'Yay!'],
  pastW: ['walked', 'played', 'barked', 'jumped', 'ate', 'went', 'saw', 'ran'],
  presW: ['walk', 'plays', 'barks', 'jump', 'eat', 'go', 'see', 'run'],
  futW: ['will walk', 'will play', 'will eat', 'will go', 'will visit', 'will see']
};
W.allNoun = [].concat(W.person, W.place, W.animal, W.thing);
W.advAll = [].concat(W.advHow, W.advWhen, W.advWhere);

const PL = {
  s: [['cat', 'cats'], ['book', 'books'], ['dog', 'dogs'], ['horse', 'horses'], ['kitten', 'kittens'], ['pencil', 'pencils'], ['chair', 'chairs'], ['ball', 'balls'], ['hat', 'hats'], ['bird', 'birds']],
  es: [['bus', 'buses'], ['box', 'boxes'], ['dish', 'dishes'], ['bench', 'benches'], ['fox', 'foxes'], ['brush', 'brushes'], ['glass', 'glasses'], ['lunch', 'lunches']],
  ies: [['baby', 'babies'], ['puppy', 'puppies'], ['lady', 'ladies'], ['candy', 'candies'], ['penny', 'pennies'], ['bunny', 'bunnies'], ['story', 'stories'], ['pony', 'ponies']],
  irr: [['child', 'children'], ['man', 'men'], ['woman', 'women'], ['mouse', 'mice'], ['goose', 'geese'], ['tooth', 'teeth'], ['foot', 'feet']]
};
const PL_RULE = {
  s: 'Most nouns just add ‑s: cat → cats.',
  es: 'Nouns ending in s, x, ch, or sh add ‑es: box → boxes.',
  ies: 'Consonant + y: change the y to i and add ‑es: baby → babies.',
  irr: 'This one is irregular. It changes in a special way: child → children.'
};

/* tagged sentences: word|tag+tag (tag goes after punctuation) */
const SENT = {
  noun: [
    'The dog|n ran to the park.|n', 'My teacher|n read a book.|n', 'The rabbit|n ate a carrot.|n', 'A girl|n sat on a chair.|n',
    'The doctor|n walked to school.|n', 'Wilbur|pn eats slops.|n', 'Charlotte|pn weaves a web.|n', 'The kitten|n drank milk.|n',
    'Fern|pn lives in Texas.|pn', 'The girl|n lives in Austin.|pn', 'Charlotte|pn is a spider.|n', 'Fern|pn has a pencil.|n',
    'The frog|n jumped into the pond.|n', 'A bird|n sat on the fence.|n'
  ],
  pron: [
    'She|sp reads every night.', 'They|sp play soccer.', 'Mom helped him.|op', 'Dad gave me|op a book.', 'The red backpack is mine.|pp',
    'The blue shoes are hers.|pp', 'I|sp made the card by myself.|rp', 'She|sp dressed herself.|rp', 'We|sp cleaned the room ourselves.|rp',
    'The ball is theirs.|pp', 'The dog is ours.|pp', 'He|sp hurt himself.|rp', 'Grandma called us.|op', 'Mom hugged them.|op',
    'The book is yours.|pp', 'I|sp will help them.|op'
  ],
  verb: [
    'The rabbit hops.|av', 'Wilbur eats|av slops.', 'Charlotte weaves|av a web.', 'Lily is|hv painting.|av', 'The children are|hv playing.|av',
    'I will|hv visit|av Grandma.', 'Fern is|lv a little girl.', 'The soup smells|lv delicious.', 'The sky looks|lv blue.', 'Sam is|hv running.|av',
    'The flowers are|lv beautiful.', 'The cat chased|av the mouse.', 'Fern is|hv reading.|av', 'The dog barks.|av', 'We are|hv singing.|av',
    'The cookies taste|lv sweet.', 'He was|lv happy.', 'The kids were|hv jumping.|av', 'She has|hv finished|av her work.', 'I am|lv tall.'
  ],
  tense: [
    'I walk|pres to school.', 'He plays|pres soccer.', 'The dog barks.|pres', 'She eats|pres lunch.', 'We run|pres every day.',
    'I walked|past to school yesterday.', 'He played|past soccer.', 'The dog barked|past last night.', 'We went|past to the park.',
    'She ate|past breakfast.', 'I saw|past a bird.', 'The boy ran|past home.',
    'I will|fut walk|fut to school tomorrow.', 'He will|fut play|fut soccer.', 'They will|fut visit|fut Grandma.', 'We will|fut eat|fut lunch.', 'She will|fut read|fut a book.'
  ],
  adj: [
    'I see a fluffy|adj+kind kitten.', 'I like that|adj+which book.', 'Three|adj+many birds sat on the fence.', 'The tall|adj+kind tree swayed.',
    'The lemonade tastes sweet.|adj+kind', 'We saw a beautiful|adj+kind butterfly.', 'The tiny|adj+kind bird sang.', 'The happy|adj+kind girl danced gracefully.|adv+how',
    'She wore a yellow|adj+kind hat.', 'Those|adj+which dogs are loud.|adj+kind', 'I have two|adj+many red|adj+kind apples.', 'This|adj+which flower smells sweet.|adj+kind',
    'The big|adj+kind dog barked.'
  ],
  adv: [
    'The turtle moved slowly.|adv+how', 'The children sang beautifully.|adv+how', 'The boy ran quickly.|adv+how', 'We will leave tomorrow.|adv+when',
    'She arrived yesterday.|adv+when', 'Dad is coming soon.|adv+when', 'The children played outside.|adv+where', 'Please come here.|adv+where',
    'The bird flew away.|adv+where', 'The baby slept peacefully.|adv+how', 'He walked carefully.|adv+how', 'The dancer moved gracefully.|adv+how'
  ],
  ij: [
    'Wow!|ij That is amazing!', 'Oops!|ij I dropped my pencil.', 'Hooray!|ij We won the game!', 'Ouch!|ij That hurt!', 'Oh!|ij I understand now.',
    'Yay!|ij It is my birthday!', 'Wow!|ij That is a huge tree!', 'Oh,|ij I forgot my book.', 'Oops!|ij I lost my pencil.'
  ],
  plural: [
    'The mice|irr ate the cheese.', 'Three children|irr sat on the benches.|reg', 'The geese|irr swam near the boxes.|reg', 'My feet|irr hurt after the games.|reg',
    'The men|irr fixed the buses.|reg', 'The women|irr carried baskets.|reg', 'My teeth|irr are clean.'
  ],
  mix: [
    'The tiny|adj bird|n sang|av loudly.|adv', 'A happy|adj girl|n danced|av gracefully.|adv', 'The brown|adj dog|n runs|av quickly.|adv',
    'Charlotte|n weaves|av a beautiful|adj web.|n', 'The soft|adj kitten|n sleeps|av peacefully.|adv', 'The teacher|n reads|av a big|adj book.|n'
  ]
};
function parseSent(str) {
  return str.split(' ').map(tok => {
    const i = tok.lastIndexOf('|');
    if (i < 0) return { t: tok, tags: [] };
    return { t: tok.slice(0, i), tags: tok.slice(i + 1).split('+') };
  });
}
Object.keys(SENT).forEach(k => { SENT[k] = SENT[k].map(parseSent); });
const sentText = toks => toks.map(x => x.t).join(' ');
const wordOnly = w => w.replace(/[^A-Za-z’']/g, '');

const TRIPLES = [
  ['I eat breakfast.', 'I ate breakfast.', 'I will eat breakfast.'], ['He plays soccer.', 'He played soccer.', 'He will play soccer.'],
  ['We walk to school.', 'We walked to school.', 'We will walk to school.'], ['The dog barks.', 'The dog barked.', 'The dog will bark.'],
  ['I see a bird.', 'I saw a bird.', 'I will see a bird.'], ['She runs home.', 'She ran home.', 'She will run home.'],
  ['They visit Grandma.', 'They visited Grandma.', 'They will visit Grandma.'], ['We go to the park.', 'We went to the park.', 'We will go to the park.']
];

const GAP = {
  noun: [
    { t: 'My ___ read me a story.', a: 'teacher', w: ['quickly', 'sing'] }, { t: 'We play at the ___.', a: 'park', w: ['jump', 'happy'] },
    { t: 'I write with a ___.', a: 'pencil', w: ['soft', 'eat'] }, { t: 'The ___ hopped away.', a: 'rabbit', w: ['slowly', 'tall'] },
    { t: 'She sat on a ___.', a: 'chair', w: ['swim', 'kindly'] }, { t: 'The ___ ate the cookie.', a: 'girl', w: ['sing', 'loudly'] },
    { t: 'The ___ drank milk.', a: 'kitten', w: ['quickly', 'giggle'] }
  ],
  subj: [
    { t: '___ reads every night.', a: 'She', w: ['Her', 'Hers'] }, { t: '___ play soccer.', a: 'They', w: ['Them', 'Theirs'] },
    { t: '___ went to the park.', a: 'We', w: ['Us', 'Ours'] }, { t: '___ am happy.', a: 'I', w: ['Me', 'Mine'] }, { t: '___ is tall.', a: 'He', w: ['Him', 'Himself'] }
  ],
  obj: [
    { t: 'Mom helped ___.', a: 'him', w: ['he', 'himself'] }, { t: 'Dad gave ___ a book.', a: 'me', w: ['I', 'mine'] },
    { t: 'Grandma called ___.', a: 'us', w: ['we', 'ours'] }, { t: 'The teacher thanked ___.', a: 'them', w: ['they', 'theirs'] }, { t: 'I will help ___.', a: 'her', w: ['she', 'hers'] }
  ],
  poss: [
    { t: 'The red backpack is ___.', a: 'mine', w: ['me', 'I'] }, { t: 'The blue shoes are ___.', a: 'hers', w: ['her', 'she'] },
    { t: 'That ball is ___.', a: 'ours', w: ['us', 'we'] }, { t: 'The book is ___.', a: 'yours', w: ['you', 'yourself'] }, { t: 'The dog is ___.', a: 'theirs', w: ['them', 'they'] }
  ],
  refl: [
    { t: 'I made the card by ___.', a: 'myself', w: ['I', 'mine'] }, { t: 'She dressed ___.', a: 'herself', w: ['she', 'hers'] },
    { t: 'He hurt ___.', a: 'himself', w: ['he', 'his'] }, { t: 'We cleaned the room ___.', a: 'ourselves', w: ['we', 'ours'] }, { t: 'They made lunch by ___.', a: 'themselves', w: ['they', 'theirs'] }
  ],
  verb: [
    { t: 'Fern ___ a little girl.', a: 'is', w: ['hops', 'eats'], k: 'linking' }, { t: 'The sky ___ blue.', a: 'looks', w: ['jumps', 'sings'], k: 'linking' },
    { t: 'The children ___ playing.', a: 'are', w: ['eat', 'tall'], k: 'helping' }, { t: 'I ___ visit Grandma.', a: 'will', w: ['run', 'sweet'], k: 'helping' },
    { t: 'The rabbit ___.', a: 'hops', w: ['is', 'blue'], k: 'action' }, { t: 'The soup ___ delicious.', a: 'smells', w: ['runs', 'jumps'], k: 'linking' },
    { t: 'Wilbur ___ slops.', a: 'eats', w: ['is', 'happy'], k: 'action' }, { t: 'Lily ___ painting.', a: 'is', w: ['hops', 'tall'], k: 'helping' }
  ],
  tense: [
    { t: 'Yesterday, I ___ to school.', a: 'walked', w: ['walk', 'will walk'], k: 'past' }, { t: 'Tomorrow, I ___ to school.', a: 'will walk', w: ['walked', 'walks'], k: 'future' },
    { t: 'Every day, he ___ soccer.', a: 'plays', w: ['played', 'will play'], k: 'present' }, { t: 'Last night, the dog ___.', a: 'barked', w: ['barks', 'will bark'], k: 'past' },
    { t: 'Tomorrow, they ___ Grandma.', a: 'will visit', w: ['visited', 'visits'], k: 'future' }, { t: 'Yesterday, we ___ to the park.', a: 'went', w: ['go', 'will go'], k: 'past' },
    { t: 'Yesterday, she ___ breakfast.', a: 'ate', w: ['eat', 'will eat'], k: 'past' }, { t: 'Tomorrow, he ___ the ball.', a: 'will throw', w: ['threw', 'throws'], k: 'future' }
  ],
  future: [
    { t: 'I ___ ___ to school tomorrow.', a: ['will', 'walk'], x: ['walked', 'walks'] }, { t: 'He ___ ___ soccer tomorrow.', a: ['will', 'play'], x: ['played', 'plays'] },
    { t: 'They ___ ___ Grandma tomorrow.', a: ['will', 'visit'], x: ['visited', 'visits'] }, { t: 'We ___ ___ lunch tomorrow.', a: ['will', 'eat'], x: ['ate', 'eats'] },
    { t: 'She ___ ___ a book later.', a: ['will', 'read'], x: ['reads', 'reading'] }
  ],
  adj: [
    { t: 'The ___ tree swayed.', a: 'tall', w: ['run', 'quickly'] }, { t: 'I see a ___ kitten.', a: 'fluffy', w: ['jump', 'slowly'] },
    { t: 'The lemonade tastes ___.', a: 'sweet', w: ['sing', 'loudly'] }, { t: 'We saw a ___ butterfly.', a: 'beautiful', w: ['swim', 'quickly'] },
    { t: 'She wore a ___ hat.', a: 'yellow', w: ['giggle', 'softly'] }, { t: 'I have ___ red apples.', a: 'two', w: ['run', 'quietly'] }
  ],
  adv: [
    { t: 'The turtle moved ___.', a: 'slowly', w: ['tall', 'soft'] }, { t: 'We will leave ___.', a: 'tomorrow', w: ['beautiful', 'tiny'] },
    { t: 'The children played ___.', a: 'outside', w: ['green', 'sweet'] }, { t: 'Please come ___.', a: 'here', w: ['soft', 'blue'] },
    { t: 'The bird flew ___.', a: 'away', w: ['red', 'sweet'] }, { t: 'The boy ran ___.', a: 'quickly', w: ['tiny', 'blue'] }
  ]
};
const PUNCT = [
  { a: 'Wow', big: true, rest: ' That is amazing!' }, { a: 'Hooray', big: true, rest: ' We won the game!' }, { a: 'Ouch', big: true, rest: ' That hurt!' },
  { a: 'Yay', big: true, rest: ' It is my birthday!' }, { a: 'Oops', big: true, rest: ' I dropped my pencil.' },
  { a: 'Oh', big: false, rest: ' I forgot my book.' }, { a: 'Well', big: false, rest: ' I will try again.' }, { a: 'Hmm', big: false, rest: ' let me think.' }
];
const FEEL = [
  ['Ouch!', '🤕', 'hurt'], ['Hooray!', '🎉', 'we won'], ['Oops!', '😬', 'a mistake'], ['Wow!', '😮', 'amazed'], ['Yay!', '🥳', 'so excited']
];
const SCEN = [
  ['You stub your toe.', 'Ouch!', ['Hooray!', 'Wow!']], ['Your team wins the game.', 'Hooray!', ['Ouch!', 'Oops!']],
  ['You drop your pencil.', 'Oops!', ['Yay!', 'Wow!']], ['You see a giant rainbow.', 'Wow!', ['Ouch!', 'Oops!']],
  ['It is your birthday today.', 'Yay!', ['Ouch!', 'Oops!']]
];
const CPAIRS = [['city', 'Austin'], ['state', 'Texas'], ['pig', 'Wilbur'], ['spider', 'Charlotte'], ['girl', 'Fern'], ['town', 'Cedar Park']];
const ADJNOUN = [
  [['snow', 'cold'], ['sugar', 'sweet'], ['elephant', 'huge'], ['grass', 'green']],
  [['sun', 'hot'], ['lemon', 'sour'], ['ant', 'tiny'], ['pillow', 'soft']]
];
const IRR_PAST = [['go', 'went'], ['eat', 'ate'], ['see', 'saw'], ['run', 'ran']];
const MEM_PAST = [['go', 'went'], ['eat', 'ate'], ['see', 'saw'], ['run', 'ran'], ['walk', 'walked'], ['play', 'played']];
const POS = {
  Noun: ['dog', 'pencil', 'school', 'teacher', 'cookie', 'park', 'girl', 'frog'],
  Verb: ['eat', 'sing', 'swim', 'giggle', 'write', 'hop', 'laugh', 'jump'],
  Adjective: ['happy', 'tall', 'fluffy', 'tiny', 'sweet', 'huge', 'soft', 'shiny'],
  Adverb: ['quickly', 'slowly', 'loudly', 'gracefully', 'carefully', 'tomorrow', 'outside', 'soon']
};

/* ---------- three ways to learn each skill (short) ---------- */
const SKILL = {
  noun: { name: 'Nouns', rule: 'A <b>noun</b> is a word that names a person, place, animal, or thing.', trick: 'Picture it! If you can picture a person, place, animal, or thing in your head, it is a noun.', ask: 'Ask: Who? Where? What animal? What thing? If the word answers one of those, it is a noun.' },
  proper: { name: 'Proper nouns', rule: 'A <b>proper noun</b> names a specific person, place, or thing. It begins with a capital letter. Austin, Texas, Charlotte.', trick: 'Proper nouns wear a CAPITAL hat 🎩 because they are special names. “girl” has no hat. “Fern” does!', ask: 'Ask: Is it one special name? Then it needs a capital letter. That makes it a proper noun.' },
  plural: { name: 'Making plurals', rule: 'Most nouns add <b>‑s</b>. Nouns ending in s, x, ch, or sh add <b>‑es</b>. Consonant + y: change <b>y to i</b> and add ‑es.', trick: 'The Hiss Trick 🐍: words that end with a hissing sound (s, x, ch, sh) need extra room, so add ‑es. The Y Flip 🙃: baby turns the y upside down into an i: babies!', ask: 'Ask: What does the word end in? s, x, ch, or sh → ‑es. Consonant + y → flip the y to i and add ‑es. Anything else → ‑s.' },
  plurid: { name: 'Regular or irregular?', rule: '<b>Regular</b> plurals follow a spelling rule (add ‑s, add ‑es, or change y to i). <b>Irregular</b> plurals change in a different way: child → children.', trick: 'Irregular words are rule breakers 🦹. Learn them like secret passwords: man → men, mouse → mice, tooth → teeth, foot → feet.', ask: 'Ask: Did the word just add ‑s or ‑es (or flip the y)? Regular! Did it change in a surprising way? Irregular!' },
  subj: { name: 'Subjective pronouns', rule: '<b>Subjective</b> pronouns tell who or what performs the action: I, you, he, she, it, we, they.', trick: 'SUBjective = the DOER. She reads. They play.', ask: 'Ask: Who does the action? That word is the subjective pronoun.' },
  obj: { name: 'Objective pronouns', rule: '<b>Objective</b> pronouns receive the action or follow words like to, for, or with: me, you, him, her, it, us, them.', trick: 'OBJective = the one the action is done TO. Mom helped HIM.', ask: 'Ask: Who gets the action? Or who comes after to, for, or with? That is the objective pronoun.' },
  poss: { name: 'Possessive pronouns', rule: '<b>Possessive</b> pronouns show ownership: mine, yours, his, hers, ours, theirs.', trick: 'POSSESSive = I POSSESS it. It is MINE!', ask: 'Ask: Whose is it? A word that answers “whose?” and stands alone is possessive.' },
  refl: { name: 'Reflexive pronouns', rule: '<b>Reflexive</b> pronouns refer back to the person or thing doing the action: myself, yourself, himself, herself, itself, ourselves, yourselves, themselves.', trick: 'REFLEXive = REFLECTION 🪞. Like a mirror, the action bounces back: She dressed herself.', ask: 'Ask: Is the doer also the one getting the action? Then use a ‑self or ‑selves word.' },
  pronjob: { name: 'Pronoun jobs', rule: 'Subjective = performs the action. Objective = receives the action. Possessive = shows ownership. Reflexive = refers back to the subject.', trick: 'Doer, Done-to, Owner, Mirror. Four jobs, four kinds of pronouns!', ask: 'Ask: Does it DO, get DONE TO, OWN, or bounce BACK?' },
  action: { name: 'Action verbs', rule: '<b>Action verbs</b> show what someone or something does: run, jump, eat, write, swim.', trick: 'Can you ACT it out? 🏃 If you can run it, jump it, or eat it, it is an action verb.', ask: 'Ask: Can someone DO it? Then it is an action verb.' },
  helping: { name: 'Helping verbs', rule: '<b>Helping verbs</b> work with a main verb: am, is, are, was, were, has, have, had, do, does, did, will.', trick: 'A helping verb has a BUDDY 🤝, another verb right after it: is painting, will visit.', ask: 'Ask: Is there another verb right after it? Then it is helping that verb.' },
  linking: { name: 'Linking verbs', rule: '<b>Linking verbs</b> connect the subject to a word that describes or identifies it. They do not show action.', trick: 'Linking = a CHAIN 🔗, like an equals sign. Fern = a little girl. The sky = blue.', ask: 'Ask: Is there no action, just a connection to a describing word? Then it is a linking verb.' },
  tense: { name: 'Verb tenses', rule: 'Verb <b>tense</b> tells when an action happens: present (now), past (already happened), future (later).', trick: 'Time Machine ⏰: Yesterday ⏪ = past. Today ⏺ = present. Tomorrow ⏩ = future.', ask: 'Ask: When did it happen? Already → past. Now or usually → present. Later → future.' },
  future: { name: 'Future tense', rule: '<b>Future tense</b> means an action will happen later. It often uses <b>will + the base verb</b>. The whole verb phrase shows the future: will visit.', trick: 'See WILL? Jump to tomorrow! ⏩ Will + verb = future.', ask: 'Ask: Is it going to happen later? Look for will + a verb.' },
  adj: { name: 'Adjectives', rule: 'An <b>adjective</b> describes a noun or pronoun. It tells what kind, which one, or how many.', trick: 'Adjectives are describers 🎨. They paint a picture of the noun: tiny, fluffy, tall.', ask: 'Ask: What kind? Which one? How many? A word that answers (about a noun) is an adjective.' },
  adv: { name: 'Adverbs', rule: 'An <b>adverb</b> often describes a verb by telling how, when, or where an action happens.', trick: 'Adverbs are action helpers 🛠️. They go with the verb: moved slowly. Many end in ‑ly, but not all!', ask: 'Ask: How? When? Where? A word that answers (about an action) is an adverb.' },
  adjadv: { name: 'Adjectives and adverbs', rule: 'An <b>adjective</b> describes a noun (the HAPPY girl). An <b>adverb</b> describes a verb (danced GRACEFULLY).', trick: 'Adjective = describes a THING. Adverb = describes an ACTION.', ask: 'Ask: Does it describe a noun (adjective)? Or tell how, when, or where the action happens (adverb)?' },
  ij: { name: 'Interjections', rule: 'An <b>interjection</b> is a word or short expression that shows a sudden feeling or emotion: Wow! Oops! Hooray!', trick: 'Feeling words 💥! An interjection pops out when your feeling pops out.', ask: 'Ask: Is it a sudden feeling at the start of the sentence? Say it out loud with feeling!' },
  mix: { name: 'All the parts of speech', rule: 'Noun = names. Verb = action or is. Adjective = describes a noun. Adverb = how, when, where.', trick: 'Noun = thing. Verb = do. Adjective = describe. Adverb = how/when/where.', ask: 'Ask: Does it name, do, describe a noun, or describe an action?' }
};

/* ---------- islands (topics) and their lessons ---------- */
const TOPICS = [
  {
    id: 'nouns', title: 'Nouns', island: 'Noun Nook', icon: '🏠', color: '#2f6fe4', dark: '#1b4aa8', soft: '#dbe8ff', pages: [1], skills: ['noun', 'proper'],
    badge: { icon: '🥷', name: 'Noun Ninja' }, blurb: 'Words that name people, places, animals, and things.',
    learn: [
      [
        { h: 'What is a noun?', p: 'A <b>noun</b> is a word that names a person, place, animal, or thing.', groups: [{ l: 'Person', e: '🧑‍🏫', i: ['teacher', 'girl', 'doctor'] }, { l: 'Place', e: '🏫', i: ['school', 'park', 'Austin'] }, { l: 'Animal', e: '🐰', i: ['dog', 'rabbit', 'kitten'] }, { l: 'Thing', e: '✏️', i: ['pencil', 'book', 'chair'] }] },
        { h: 'Common and proper nouns', p: 'A <b>common noun</b> names a general person, place, animal, or thing. No capital letter unless it starts a sentence. A <b>proper noun</b> names a specific one and begins with a capital letter.', groups: [{ l: 'Common', e: '🏘️', i: ['city', 'teacher', 'school'] }, { l: 'Proper', e: '🎩', i: ['Austin', 'Texas', 'Charlotte'] }] },
        { h: 'Remember!', p: 'A noun names something!', sent: ['<b>Wilbur</b> eats <b>slops</b>.', 'Both words in bold are nouns.'] }
      ],
      [
        { h: 'Picture it!', p: 'If you can <b>picture</b> a person, a place, an animal, or a thing in your head, it is a noun.', ex: ['teacher ✔', 'park ✔', 'pencil ✔', 'jump ✘ (you DO it)'] },
        { h: 'The Capital Hat Trick 🎩', p: 'Proper nouns wear a <b>capital hat</b> because they are special names.', ex: ['pig → Wilbur', 'city → Austin', 'state → Texas', 'girl → Fern'] }
      ],
      [
        { h: 'Ask the questions', p: 'Ask <b>Who? Where? What animal? What thing?</b> If the word answers, it is a noun.', ex: ['Who? teacher', 'Where? park', 'Which animal? rabbit', 'What? book'] },
        { h: 'General or special?', p: 'Is it <b>one of many</b> (a girl) or <b>one special name</b> (Fern)? Special names get a capital letter.', ex: ['girl → general', 'Fern → special!', 'school → general', 'Cedar Park → special!'] }
      ]
    ]
  },
  {
    id: 'plurals', title: 'Plural Nouns', island: 'Plural Playground', icon: '🎠', color: '#1fa34a', dark: '#12762f', soft: '#d9f6e2', pages: [1, 2, 3], skills: ['plural', 'plurid'],
    badge: { icon: '💪', name: 'Plural Power' }, blurb: 'One cat, two cats! Regular and irregular plurals.',
    learn: [
      [
        { h: 'What is a plural?', p: 'A <b>plural noun</b> names <b>more than one</b> person, place, animal, or thing.', ex: ['one cat → two cats', 'one box → two boxes'] },
        { h: 'Regular plurals follow a rule', p: 'Regular plural nouns follow a spelling rule.', groups: [{ l: 'Most nouns: add ‑s', e: '➕', i: ['cat → cats', 'book → books'] }, { l: 's, x, ch, sh: add ‑es', e: '🐍', i: ['bus → buses', 'box → boxes', 'dish → dishes'] }, { l: 'Consonant + y: change y to i, add ‑es', e: '🙃', i: ['baby → babies', 'puppy → puppies'] }] },
        { h: 'Irregular plurals break the rules', p: 'They do not follow the usual rules for adding ‑s or ‑es. Their spelling changes in a different way.', ex: ['child → children', 'man → men', 'woman → women', 'mouse → mice', 'goose → geese', 'tooth → teeth', 'foot → feet'] },
        { h: 'Remember!', p: 'On the test, you must tell if the plural noun is <b>regular or irregular</b>.', ex: ['horses = regular', 'boxes = regular', 'children = irregular', 'mice = irregular'] }
      ],
      [
        { h: 'The Hiss Trick 🐍', p: 'If a word ends with a hissing or buzzing sound (<b>s, x, ch, sh</b>), it needs extra room. Add <b>‑es</b>!', ex: ['bus → bus-es', 'box → box-es', 'dish → dish-es', 'bench → bench-es'] },
        { h: 'The Y Flip 🙃', p: 'When a word ends in a <b>consonant + y</b>, flip the y into an <b>i</b> and add ‑es.', ex: ['bab<b>y</b> → bab<b>ies</b>', 'pupp<b>y</b> → pupp<b>ies</b>', 'lad<b>y</b> → lad<b>ies</b>'] },
        { h: 'Rule Breakers 🦹', p: 'Irregular plurals are like secret passwords. Learn them by heart!', ex: ['child → children', 'foot → feet', 'tooth → teeth', 'mouse → mice'] }
      ],
      [
        { h: 'Ask: How many?', p: 'Is it <b>one</b> or <b>more than one</b>? More than one means it is plural.', ex: ['one dog', 'two dogs', 'one child', 'two children'] },
        { h: 'Ask: Did it follow a rule?', p: 'Did the word add <b>‑s or ‑es</b>, or flip the y? That is <b>regular</b>. Did it change in a surprising way? That is <b>irregular</b>.', ex: ['dogs → regular', 'babies → regular', 'mice → irregular', 'teeth → irregular'] },
        { h: 'Say it out loud!', p: 'Funny-sounding? “Two mouses” sounds wrong. “Two mice” sounds right! Your ears can help.', ex: ['two mouses ✘', 'two mice ✔', 'two foots ✘', 'two feet ✔'] }
      ]
    ]
  },
  {
    id: 'pronouns', title: 'Pronouns', island: 'Pronoun Park', icon: '🛝', color: '#8a3fe0', dark: '#5f23a6', soft: '#ecdcff', pages: [3, 4], skills: ['subj', 'obj', 'poss', 'refl', 'pronjob'],
    badge: { icon: '🤝', name: 'Pronoun Pal' }, blurb: 'Small words that take the place of nouns.',
    learn: [
      [
        { h: 'What is a pronoun?', p: 'A <b>pronoun</b> is a word that takes the place of a noun.', ex: ['Fern reads. → She reads.', 'Mom helped Sam. → Mom helped him.'] },
        { h: 'Subjective pronouns', p: 'They tell <b>who or what performs the action</b> or is being described.', ex: ['I, you, he, she, it, we, they'], sent: ['<b>She</b> reads every night.', '<b>They</b> play soccer.'] },
        { h: 'Objective pronouns', p: 'They <b>receive the action</b> or follow certain words, such as <i>to, for,</i> or <i>with</i>.', ex: ['me, you, him, her, it, us, them'], sent: ['Mom helped <b>him</b>.', 'Dad gave <b>me</b> a book.'] },
        { h: 'Possessive pronouns', p: 'They show <b>ownership</b>.', ex: ['mine, yours, his, hers, ours, theirs'], sent: ['The red backpack is <b>mine</b>.', 'The blue shoes are <b>hers</b>.'] },
        { h: 'Reflexive pronouns', p: 'They <b>refer back</b> to the person or thing doing the action.', ex: ['myself, yourself, himself, herself, itself, ourselves, yourselves, themselves'], sent: ['I made the card by <b>myself</b>.', 'She dressed <b>herself</b>.'] }
      ],
      [
        { h: 'Four jobs 🎭', p: 'Every pronoun has a job!', groups: [{ l: 'Subjective', e: '🏃', i: ['performs the action'] }, { l: 'Objective', e: '🎯', i: ['receives the action'] }, { l: 'Possessive', e: '🎒', i: ['shows ownership'] }, { l: 'Reflexive', e: '🪞', i: ['refers back to the subject'] }] },
        { h: 'Memory hooks 🪝', p: 'Make each name a picture in your head.', ex: ['SUBjective = the DOER', 'OBJective = gets it DONE TO', 'POSSESSive = I POSSESS it, it is MINE', 'REFLEXive = a REFLECTION in a mirror'] }
      ],
      [
        { h: 'Ask the questions', p: 'Pick the pronoun by asking a question.', ex: ['Who does it? → subjective (She runs.)', 'Who gets it? → objective (Mom helped him.)', 'Whose is it? → possessive (It is hers.)', 'Did the doer do it to itself? → reflexive (She dressed herself.)'] },
        { h: 'Swap it!', p: 'A pronoun takes the place of a noun. Swap it back and see if it still works.', ex: ['She reads → Fern reads ✔', 'Mom helped him → Mom helped Sam ✔'] }
      ]
    ]
  },
  {
    id: 'verbs', title: 'Verbs', island: 'Verb Valley', icon: '🏃', color: '#e0452f', dark: '#a82b19', soft: '#ffdcd5', pages: [4, 5], skills: ['action', 'helping', 'linking'],
    badge: { icon: '🦸', name: 'Verb Hero' }, blurb: 'Action verbs, helping verbs, and linking verbs.',
    learn: [
      [
        { h: 'What is a verb?', p: 'A <b>verb</b> is a word that shows an action or tells what someone or something is or is like.' },
        { h: 'Action verbs', p: 'They show <b>what someone or something does</b>.', ex: ['run, jump, eat, write, swim'], sent: ['The rabbit <b>hops</b>.', 'Wilbur <b>eats</b> slops.', 'Charlotte <b>weaves</b> a web.'] },
        { h: 'Helping verbs', p: 'They work with a <b>main verb</b> to help show an action or when it happens.', ex: ['am, is, are, was, were, has, have, had, do, does, did, will'], sent: ['Lily <b>is</b> painting.', 'The children <b>are</b> playing.', 'I <b>will</b> visit Grandma.'] },
        { h: 'Linking verbs', p: 'They <b>connect the subject to a word that describes or identifies it</b>. They do not show an action.', ex: ['am, is, are, was, were'], sent: ['Fern <b>is</b> a little girl.', 'The soup <b>smells</b> delicious.', 'The sky <b>looks</b> blue.'] },
        { h: 'Remember!', p: 'A verb’s job depends on how it is used in the sentence.', sent: ['“is” is a <b>linking</b> verb in “Fern <b>is</b> a little girl.”', '“is” is a <b>helping</b> verb in “Fern <b>is</b> reading.”'] }
      ],
      [
        { h: 'Action = Act it out 🏃', p: 'Can you <b>act it out</b>? Then it is an action verb. Run it! Jump it! Swim it!', ex: ['run', 'jump', 'swim', 'eat'] },
        { h: 'Helping = Has a buddy 🤝', p: 'A helping verb has a <b>buddy</b>: another verb right after it.', ex: ['is painting', 'are playing', 'will visit'] },
        { h: 'Linking = A chain 🔗', p: 'A linking verb works like an <b>equals sign</b>. It links the subject to a describing word.', ex: ['Fern = a little girl', 'The sky = blue', 'The soup = delicious'] }
      ],
      [
        { h: 'Question 1', p: 'Ask: <b>Can I act it out?</b> If yes, it is an <b>action verb</b>.', ex: ['hops ✔', 'eats ✔', 'weaves ✔'] },
        { h: 'Question 2', p: 'Ask: <b>Is there another verb right after it?</b> If yes, it is a <b>helping verb</b>.', ex: ['is running (is helps running)', 'will visit (will helps visit)'] },
        { h: 'Question 3', p: 'Ask: <b>No action, just connecting to a describing word?</b> If yes, it is a <b>linking verb</b>.', ex: ['The flowers are beautiful.', 'The sky looks blue.'] }
      ]
    ]
  },
  {
    id: 'tenses', title: 'Verb Tenses', island: 'Time Machine', icon: '⏰', color: '#e57a0b', dark: '#a85606', soft: '#ffe9cf', pages: [5, 6], skills: ['tense', 'future'],
    badge: { icon: '⏳', name: 'Time Traveler' }, blurb: 'Past, present, and future: when does it happen?',
    learn: [
      [
        { h: 'What is tense?', p: 'Verb <b>tense</b> tells <b>when</b> an action happens.' },
        { h: 'Present tense', p: 'An action happens <b>now</b> or <b>regularly</b>.', sent: ['I <b>walk</b> to school.', 'He <b>plays</b> soccer.', 'The dog <b>barks</b>.'] },
        { h: 'Past tense', p: 'An action <b>already happened</b>. Many regular past-tense verbs end in <b>‑ed</b>, but irregular verbs change in different ways.', sent: ['I <b>walked</b> to school yesterday.', 'He <b>played</b> soccer.', 'The dog <b>barked</b> last night.'], ex: ['go → went', 'eat → ate', 'see → saw', 'run → ran'] },
        { h: 'Future tense', p: 'An action <b>will happen later</b>. It often uses <b>will + the base form</b> of the verb.', sent: ['I <b>will walk</b> to school tomorrow.', 'He <b>will play</b> soccer.', 'They <b>will visit</b> Grandma.'] },
        { h: 'Remember!', p: 'The <b>entire verb phrase</b> shows the future action.', sent: ['In “I will visit Grandma,” the future-tense verb phrase is <b>will visit</b>.'] }
      ],
      [
        { h: 'Time Machine ⏰', p: 'Hop in the time machine!', groups: [{ l: 'Yesterday', e: '⏪', i: ['past', 'walked'] }, { l: 'Today', e: '⏺️', i: ['present', 'walk'] }, { l: 'Tomorrow', e: '⏩', i: ['future', 'will walk'] }] },
        { h: 'Clue words 🔎', p: 'Little clue words tell you the time.', groups: [{ l: 'Past', e: '⏪', i: ['yesterday', 'last night'] }, { l: 'Present', e: '⏺️', i: ['every day', 'now'] }, { l: 'Future', e: '⏩', i: ['tomorrow', 'later'] }] },
        { h: 'WILL = Future ➡️', p: 'See the word <b>will</b>? Jump to tomorrow! Will + a verb means <b>future</b>.', ex: ['will walk', 'will play', 'will visit'] }
      ],
      [
        { h: 'Ask: When?', p: 'When did it happen? <b>Already</b> → past. <b>Now or usually</b> → present. <b>Later</b> → future.' },
        { h: 'Look at the ending', p: 'An <b>‑ed</b> ending is usually past (walked). Funny changes are <b>irregular past</b>. <b>will + verb</b> is future.', ex: ['walked → past', 'ran → irregular past', 'will walk → future'] }
      ]
    ]
  },
  {
    id: 'adjectives', title: 'Adjectives', island: 'Adjective Alley', icon: '🎨', color: '#d6237a', dark: '#9c1457', soft: '#ffdcec', pages: [6, 7], skills: ['adj'],
    badge: { icon: '🌈', name: 'Adjective Artist' }, blurb: 'Describing words that paint a picture.',
    learn: [
      [
        { h: 'What is an adjective?', p: 'An <b>adjective</b> describes a noun or pronoun. It can tell <b>what kind, which one,</b> or <b>how many</b>.' },
        { h: 'Three kinds of clues', p: 'Adjectives answer three questions.', groups: [{ l: 'What kind?', e: '🎀', i: ['A fluffy kitten'] }, { l: 'Which one?', e: '👉', i: ['That book'] }, { l: 'How many?', e: '🔢', i: ['Three birds'] }] },
        { h: 'More examples', p: 'Find the adjective in each sentence.', sent: ['The <b>tall</b> tree swayed.', 'The lemonade tastes <b>sweet</b>.', 'We saw a <b>beautiful</b> butterfly.'] },
        { h: 'Remember!', p: 'Adjectives describe <b>nouns and pronouns</b>!' }
      ],
      [
        { h: 'Describers 🎨', p: 'Adjectives <b>paint a picture</b>. Each word makes a different dog!', ex: ['a big dog', 'a tiny dog', 'a fluffy dog', 'a muddy dog'] },
        { h: 'Best buddies 🤝', p: 'An adjective always sticks with the <b>noun</b> it describes.', ex: ['tall → tree', 'fluffy → kitten', 'sweet → lemonade'] }
      ],
      [
        { h: 'Find the noun first', p: 'Find the <b>noun</b>. Then ask: which word tells <b>more about it</b>?', sent: ['The tiny bird sang. The noun is <b>bird</b>. <b>Tiny</b> tells what kind!'] },
        { h: 'Ask the 3 questions', p: '<b>What kind? Which one? How many?</b> A word that answers about a noun is an adjective.', ex: ['What kind? fluffy', 'Which one? that', 'How many? three'] }
      ]
    ]
  },
  {
    id: 'adverbs', title: 'Adverbs', island: 'Adverb Avenue', icon: '🐢', color: '#0d9488', dark: '#09665e', soft: '#d3f5f1', pages: [7], skills: ['adv'],
    badge: { icon: '🚀', name: 'Adverb Ace' }, blurb: 'Words that tell how, when, or where.',
    learn: [
      [
        { h: 'What is an adverb?', p: 'An <b>adverb</b> often describes a verb by telling <b>how, when,</b> or <b>where</b> an action happens.' },
        { h: 'How? When? Where?', p: 'Adverbs answer three questions.', groups: [{ l: 'How?', e: '🐌', i: ['slowly', 'beautifully', 'quickly'] }, { l: 'When?', e: '📅', i: ['tomorrow', 'yesterday', 'soon'] }, { l: 'Where?', e: '📍', i: ['outside', 'here', 'away'] }] },
        { h: 'Not always ‑ly!', p: 'Many adverbs end in <b>‑ly</b>, but not all adverbs do.', ex: ['slowly', 'carefully', 'tomorrow', 'outside'], sent: ['Ask yourself, “How, when, or where did the action happen?”'] }
      ],
      [
        { h: 'Action helpers 🛠️', p: 'Adverbs go with the <b>action</b> (the verb).', ex: ['moved slowly', 'ran quickly', 'flew away', 'leave tomorrow'] },
        { h: 'The ‑ly clue 🔎', p: 'Lots of adverbs end in <b>‑ly</b>. But watch out for the sneaky ones that do not!', ex: ['soon', 'here', 'outside', 'away', 'tomorrow'] }
      ],
      [
        { h: 'Three little questions', p: 'Ask <b>HOW? WHEN? WHERE?</b> If a word answers about the action, it is an adverb.' },
        { h: 'Adjective or adverb?', p: '<b>Adjectives</b> describe nouns (a TALL tree). <b>Adverbs</b> describe actions (ran QUICKLY).', ex: ['tall tree → adjective', 'ran quickly → adverb'] }
      ]
    ]
  },
  {
    id: 'interjections', title: 'Interjections', island: 'Wow Wonderland', icon: '🎉', color: '#c58a00', dark: '#8c6100', soft: '#fff1c2', pages: [7, 8], skills: ['ij'],
    badge: { icon: '🧙', name: 'Wow Wizard' }, blurb: 'Words that show a sudden feeling.',
    learn: [
      [
        { h: 'What is an interjection?', p: 'An <b>interjection</b> is a word or short expression that shows a <b>sudden feeling or emotion</b>.' },
        { h: 'Examples', p: 'Interjections express feelings!', sent: ['<b>Wow!</b> That is amazing!', '<b>Oops!</b> I dropped my pencil.', '<b>Hooray!</b> We won the game!', '<b>Ouch!</b> That hurt!', '<b>Oh!</b> I understand now.', '<b>Yay!</b> It is my birthday!'] },
        { h: 'Where do they go?', p: 'An interjection often appears at the <b>beginning</b> of a sentence. It can be followed by an <b>exclamation mark</b> or a <b>comma</b>, depending on how strong the feeling is.', sent: ['<b>Wow!</b> That is a huge tree!', '<b>Oh,</b> I forgot my book.'] }
      ],
      [
        { h: 'Feeling words 💥', p: 'An interjection <b>pops out</b> when your feeling pops out!', ex: ['Hooray! = so happy', 'Ouch! = that hurts', 'Oops! = a mistake', 'Wow! = amazed'] },
        { h: 'Big or small feeling?', p: '<b>Big feeling</b> → exclamation mark ❗. <b>Small feeling</b> → comma.', ex: ['Wow! (big)', 'Oh, (small)'] }
      ],
      [
        { h: 'Ask yourself', p: 'Is it a <b>sudden feeling</b>? Is it at the <b>start</b> of the sentence? Then it is an interjection.' },
        { h: 'Say it out loud!', p: 'Say each one with feeling. Your voice tells you it is an interjection!', ex: ['Wow!', 'Oops!', 'Hooray!', 'Ouch!', 'Yay!'] }
      ]
    ]
  },
  {
    id: 'boss', title: 'Boss Battle', island: 'Parts of Speech Party', icon: '👑', color: '#4b3fd1', dark: '#2f2699', soft: '#e0ddff', pages: [11, 12], skills: ['mix', 'adjadv'],
    badge: { icon: '👑', name: 'Boss Beater' }, blurb: 'Mix it all together. Noun, verb, adjective, adverb!',
    learn: [
      [
        { h: 'Parts of speech', p: 'Each word in a sentence has a job.', groups: [{ l: 'Noun', e: '🏠', i: ['names a person, place, animal, or thing'] }, { l: 'Verb', e: '🏃', i: ['shows action or tells what something is'] }, { l: 'Adjective', e: '🎨', i: ['describes a noun'] }, { l: 'Adverb', e: '🐢', i: ['tells how, when, or where'] }] },
        { h: 'Also on the test', p: 'Do not forget these!', groups: [{ l: 'Pronoun', e: '🤝', i: ['takes the place of a noun'] }, { l: 'Interjection', e: '💥', i: ['shows a sudden feeling'] }] }
      ],
      [
        { h: 'Quick hooks 🪝', p: 'One word to remember each job.', ex: ['Noun = THING', 'Verb = DO', 'Adjective = DESCRIBE a noun', 'Adverb = HOW, WHEN, WHERE'] },
        { h: 'Sentence puzzle 🧩', p: 'In “The tiny bird sang loudly”: <b>tiny</b> describes the bird (adjective), <b>bird</b> is a thing (noun), <b>sang</b> is the action (verb), <b>loudly</b> tells how (adverb).' }
      ],
      [
        { h: 'Four questions', p: 'Ask: Does it <b>name</b>? <b>Do</b>? <b>Describe a noun</b>? Or tell <b>how, when, where</b>?' },
        { h: 'Try swapping', p: 'Say the sentence with the word and think: what is its job?', ex: ['Does it name something? → noun', 'Can I act it out? → verb', 'Does it describe a noun? → adjective', 'Does it tell how, when, or where? → adverb'] }
      ]
    ]
  }
];

/* ---------- the 20 practice questions, exactly as printed ---------- */
const TQ = [
  { n: 1, page: 8, skill: 'noun', stem: 'Which word is a noun?', opts: ['quickly', 'pencil', 'jump'], a: 1, why: 'Pencil is a noun. It names a thing.' },
  { n: 2, page: 8, skill: 'proper', stem: 'Which word is a proper noun?', opts: ['school', 'teacher', 'Texas'], a: 2, why: 'Texas is a proper noun. It names one special place, so it starts with a capital letter.' },
  { n: 3, page: 9, skill: 'plurid', stem: 'The plural noun <i>dogs</i> is:', opts: ['Regular', 'Irregular'], a: 0, why: 'Dogs is regular. You just add ‑s to dog.' },
  { n: 4, page: 9, skill: 'plurid', stem: 'The plural noun <i>teeth</i> is:', opts: ['Regular', 'Irregular'], a: 1, why: 'Teeth is irregular. Tooth changes in a special way, not by adding ‑s.' },
  { n: 5, page: 9, skill: 'subj', stem: 'Which word is a subjective pronoun?', opts: ['them', 'she', 'mine'], a: 1, why: 'She is subjective. It tells who performs the action.' },
  { n: 6, page: 9, skill: 'obj', stem: 'Which word is an objective pronoun?', opts: ['him', 'he', 'himself'], a: 0, why: 'Him is objective. It receives the action.' },
  { n: 7, page: 9, skill: 'poss', stem: 'Which word is a possessive pronoun?', opts: ['we', 'us', 'ours'], a: 2, why: 'Ours is possessive. It shows ownership.' },
  { n: 8, page: 9, skill: 'refl', stem: 'Which word is a reflexive pronoun?', opts: ['myself', 'me', 'my'], a: 0, why: 'Myself is reflexive. It refers back to the person doing the action.' },
  { n: 9, page: 9, skill: 'action', stem: 'Which word is the action verb?', sentence: 'The cat chased the mouse.', opts: ['cat', 'chased', 'mouse'], a: 1, why: 'Chased shows what the cat did. It is the action verb.' },
  { n: 10, page: 10, skill: 'helping', stem: 'Which word is the helping verb?', sentence: 'Sam is running.', opts: ['Sam', 'is', 'running'], a: 1, why: 'Is helps the main verb running. It is the helping verb.' },
  { n: 11, page: 10, skill: 'linking', stem: 'Which word is the linking verb?', sentence: 'The flowers are beautiful.', opts: ['flowers', 'beautiful', 'are'], a: 2, why: 'Are links the flowers to the describing word beautiful. It shows no action.' },
  { n: 12, page: 10, skill: 'tense', stem: 'What is the tense of <i>played</i> in “We played yesterday”?', opts: ['Present', 'Past', 'Future'], a: 1, why: 'Played already happened. Yesterday is a clue. It is past tense.' },
  { n: 13, page: 10, skill: 'future', stem: 'Which sentence is in the future tense?', opts: ['I eat breakfast.', 'I ate breakfast.', 'I will eat breakfast.'], a: 2, why: 'Will eat means it will happen later. That is future tense.' },
  { n: 14, page: 10, skill: 'adj', stem: 'What is the adjective in “The tiny bird sang”?', opts: ['tiny', 'bird', 'sang'], a: 0, why: 'Tiny describes the bird. It tells what kind.' },
  { n: 15, page: 10, skill: 'adv', stem: 'What is the adverb in “The baby slept peacefully”?', opts: ['baby', 'slept', 'peacefully'], a: 2, why: 'Peacefully tells how the baby slept. It is an adverb.' },
  { n: 16, page: 11, skill: 'adv', stem: 'Which word is an adverb that tells when?', opts: ['tomorrow', 'beautiful', 'rabbit'], a: 0, why: 'Tomorrow tells when. It is an adverb.', when: true },
  { n: 17, page: 11, skill: 'ij', stem: 'Which word is an interjection?', opts: ['Wow!', 'green', 'slowly'], a: 0, why: 'Wow! shows a sudden feeling. It is an interjection.' },
  { n: 18, page: 11, skill: 'adjadv', stem: 'Which sentence correctly identifies the adjective and adverb?', sentence: '“The happy girl danced gracefully.”', opts: ['happy = adjective; gracefully = adverb', 'happy = adverb; gracefully = adjective', 'happy = noun; gracefully = verb'], a: 0, why: 'Happy describes the girl, so it is an adjective. Gracefully tells how she danced, so it is an adverb.' },
  { n: 19, page: 11, skill: 'future', stem: 'In “They will play outside,” what is the future-tense verb phrase?', opts: ['They', 'will play', 'outside'], a: 1, why: 'Will play shows the future. The whole verb phrase is will play.', phrase: true },
  { n: 20, page: 11, skill: 'ij', stem: 'In “Oops! I lost my pencil,” what is the interjection?', opts: ['I', 'lost', 'Oops'], a: 2, why: 'Oops shows a sudden feeling. It is the interjection.' }
];
const TQ_PAGES = { 8: [1, 2], 9: [3, 4, 5, 6, 7, 8, 9], 10: [10, 11, 12, 13, 14, 15], 11: [16, 17, 18, 19, 20] };
const TQ_SHORT = { 1: 'Noun', 2: 'Proper noun', 3: 'Plural: dogs', 4: 'Plural: teeth', 5: 'Subjective', 6: 'Objective', 7: 'Possessive', 8: 'Reflexive', 9: 'Action verb', 10: 'Helping verb', 11: 'Linking verb', 12: 'Tense: played', 13: 'Future sentence', 14: 'Adjective', 15: 'Adverb', 16: 'Adverb: when', 17: 'Interjection', 18: 'Adjective + adverb', 19: 'Future phrase', 20: 'Interjection in a sentence' };

/* ---------- the 12 pages of the study guide ---------- */
const PAGES = [
  { n: 1, title: 'Welcome and Nouns', desc: 'Name line, directions, nouns, common and proper nouns.', topics: ['nouns', 'plurals'], qs: [], filled: true },
  { n: 2, title: 'Plural Nouns', desc: 'Regular and irregular plural nouns.', topics: ['plurals'], qs: [], filled: false },
  { n: 3, title: 'Plurals and Pronouns', desc: 'Plural examples, then subjective, objective, and possessive pronouns.', topics: ['plurals', 'pronouns'], qs: [], filled: false },
  { n: 4, title: 'Pronouns and Verbs', desc: 'Reflexive pronouns, then action and helping verbs.', topics: ['pronouns', 'verbs'], qs: [], filled: false },
  { n: 5, title: 'Verbs and Tenses', desc: 'Helping and linking verbs, present and past tense.', topics: ['verbs', 'tenses'], qs: [], filled: false },
  { n: 6, title: 'Tenses and Adjectives', desc: 'Irregular past, future tense, and adjectives.', topics: ['tenses', 'adjectives'], qs: [], filled: false },
  { n: 7, title: 'Adjectives, Adverbs, Interjections', desc: 'More adjectives, all about adverbs, and interjections.', topics: ['adjectives', 'adverbs', 'interjections'], qs: [], filled: false },
  { n: 8, title: 'Practice Questions 1 to 2', desc: 'Interjection examples, then the first two practice questions.', topics: ['interjections'], qs: [1, 2], filled: true },
  { n: 9, title: 'Practice Questions 3 to 9', desc: 'Plurals, pronouns, and action verbs.', topics: [], qs: [3, 4, 5, 6, 7, 8, 9], filled: true },
  { n: 10, title: 'Practice Questions 10 to 15', desc: 'Helping and linking verbs, tenses, adjectives, adverbs.', topics: [], qs: [10, 11, 12, 13, 14, 15], filled: true },
  { n: 11, title: 'Practice Questions 16 to 20', desc: 'Adverbs, interjections, and the Final Study Checklist.', topics: ['boss'], qs: [16, 17, 18, 19, 20], filled: true },
  { n: 12, title: 'Checklist and Finish', desc: 'The rest of the checklist. Do your best, read carefully, check your work!', topics: ['boss'], qs: [], filled: false }
];
