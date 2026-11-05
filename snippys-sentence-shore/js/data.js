/* Snippy's Sentence Shore: all the sentences, fragments, fixes and matches. */
(function () {
  var SS = (window.SS = window.SS || {});
  var B = window.SS_BASE;

  // ---------- small helpers
  SS.rnd = function (n) { return Math.floor(Math.random() * n); };
  SS.pickOne = function (a) { return a[SS.rnd(a.length)]; };
  SS.shuffle = function (a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = SS.rnd(i + 1); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  SS.sample = function (a, n) { return SS.shuffle(a).slice(0, n); };
  SS.cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

  // ---------- sentences: subject + predicate, split index = first word of the predicate
  function mk(sub, pred, src) {
    var sw = sub.split(' ');
    var words = (sub + ' ' + pred).split(' ');
    var s = sw.length;
    return {
      text: sub + ' ' + pred, sub: sub, pred: pred, words: words, s: s,
      tier: s <= 2 ? 1 : (s === 3 ? 2 : 3), src: src || 'bank'
    };
  }
  SS.mkSentence = mk;

  var pool = [];
  ['A', 'B', 'D', 'E'].forEach(function (k) { B[k].forEach(function (p) { pool.push(mk(p[0], p[1], k)); }); });

  // Homework sentences (exact), so Ensley can practice her real worksheet
  var HWS = [
    ['The little brown puppy', 'chased a butterfly.'], ['My older sister', 'plays the piano.'],
    ['Three colorful birds', 'sat in the tree.'], ['The hungry lion', 'roared loudly.'], ['Our school bus', 'arrived early.'],
    ['The baby', 'laughed at the funny clown.'], ['My grandmother', 'baked delicious cookies.'],
    ['The students', 'walked to the library.'], ['A tiny mouse', 'ran across the kitchen.'],
    ['The bright yellow sun', 'shines in the sky.']
  ];
  SS.HW = [];
  HWS.forEach(function (p, i) {
    SS.HW.push({ n: i + 1, part: i < 5 ? 'A' : 'B', kind: i < 5 ? 'sub' : 'pred', sent: mk(p[0], p[1], 'hw') });
  });
  var HWC = [
    ['The dog wagged its tail.', true, ''], ['Under the kitchen table.', false, 'both'], ['My best friend likes to draw.', true, ''],
    ['Ran through the green grass.', false, 'nosubj'], ['The beautiful flowers bloomed.', true, ''],
    ['A basket of fresh apples.', false, 'nopred'], ['The children played at recess.', true, ''],
    ['After the school bell rang.', false, 'thought']
  ];
  HWC.forEach(function (c, i) { SS.HW.push({ n: 11 + i, part: 'C', kind: 'cf', frag: { t: c[0], ok: c[1], why: c[2] } }); });
  var kit = mk('The playful kittens', 'chased a red ball across the room.', 'hw');
  SS.HW.push({ n: 19, part: 'D', kind: 'sub', sent: kit });
  SS.HW.push({ n: 20, part: 'D', kind: 'pred', sent: kit });

  // ---------- fresh sentence maker (sensible sentences, new every play)
  var G = {
    people: {
      dets: ['The', 'My', 'Our'],
      adjs: ['friendly', 'tall', 'kind', 'brave', 'sleepy', 'funny', 'little', 'new', 'young', 'happy'],
      nouns: ['teacher', 'neighbor', 'baker', 'farmer', 'coach', 'nurse', 'artist', 'singer', 'doctor', 'boy', 'girl'],
      withs: ['red hat', 'blue backpack', 'yellow raincoat', 'green scarf', 'purple umbrella'],
      preds: ['baked cookies for the class.', 'waved at the crowd.', 'cleaned the whole room.', 'painted a colorful picture.',
        'sang a happy song.', 'walked to the park.', 'read a long story.', 'built a tall tower.', 'fixed the broken fence.',
        'planted flowers in the garden.', 'ate lunch outside.', 'helped the little kids.', 'ran across the field.',
        'carried the heavy box.', 'found a shiny coin.', 'drew a funny face.']
    },
    animals: {
      dets: ['The', 'My'],
      adjs: ['fluffy', 'tiny', 'hungry', 'sleepy', 'little', 'brown', 'gray', 'playful', 'curious', 'noisy', 'shy'],
      nouns: ['rabbit', 'puppy', 'kitten', 'duck', 'frog', 'mouse', 'bear', 'fox', 'turtle', 'owl', 'monkey', 'pony'],
      withs: ['long tail', 'floppy ears', 'fluffy tail', 'bright eyes'],
      preds: ['ran across the yard.', 'slept under the big tree.', 'hid behind a rock.', 'looked at the moon.',
        'made a funny noise.', 'found some food.', 'played near the water.', 'followed its mother.', 'watched the clouds.', 'sat in the sun.']
    }
  };
  var NAMES = ['Sam', 'Mia', 'Ava', 'Ben', 'Mom', 'Dad', 'Nora', 'Leo'];
  SS.gen = function (tier) {
    var cat = SS.rnd(2) ? 'people' : 'animals';
    var g = G[cat], sub;
    var det = SS.pickOne(g.dets), noun = SS.pickOne(g.nouns), adj = SS.pickOne(g.adjs);
    if (tier === 1) {
      var r = SS.rnd(4);
      if (cat === 'people' && r === 0) { cat = 'people'; g = G.people; sub = SS.pickOne(NAMES); }
      else if (cat === 'people' && r === 1) { sub = SS.pickOne(['We', 'They', 'She', 'He']); }
      else sub = det + ' ' + noun;
    } else if (tier === 2) {
      if (cat === 'people' && SS.rnd(3) === 0) {
        var a = SS.pickOne(NAMES), b = SS.pickOne(NAMES); while (b === a) b = SS.pickOne(NAMES);
        sub = a + ' and ' + b;
      } else sub = det + ' ' + adj + ' ' + noun;
    } else {
      if (SS.rnd(2)) {
        var adj2 = SS.pickOne(g.adjs); while (adj2 === adj) adj2 = SS.pickOne(g.adjs);
        sub = det + ' ' + adj + ' ' + adj2 + ' ' + noun;
      } else sub = det + ' ' + noun + ' with the ' + SS.pickOne(g.withs);
    }
    var pred = SS.pickOne(g.preds);
    return mk(sub, pred, 'gen');
  };

  // Pick n sentences. opts: tiers (array), exclude (set of text), fresh (0..1 share made fresh)
  SS.pickSentences = function (n, opts) {
    opts = opts || {};
    var tiers = opts.tiers || [1, 2, 3];
    var ex = opts.exclude || {};
    var out = [], seen = {};
    var cands = SS.shuffle(pool.filter(function (p) { return tiers.indexOf(p.tier) >= 0 && !ex[p.text]; }));
    var fresh = opts.fresh == null ? 0.35 : opts.fresh;
    var guard = 0;
    while (out.length < n && guard++ < 400) {
      var s;
      if (Math.random() < fresh || !cands.length) s = SS.gen(SS.pickOne(tiers));
      else s = cands.pop();
      if (seen[s.text] || ex[s.text]) continue;
      seen[s.text] = 1; out.push(s);
    }
    return out;
  };

  // ---------- complete sentences and fragments
  // why: '' (complete), 'nosubj', 'nopred', 'both', 'thought'
  SS.frags = B.C.map(function (c) { return { t: c[0], ok: c[1], why: c[2] }; });
  // a few extra complete sentences and fragments so rounds feel fresh
  SS.frags = SS.frags.concat([
    { t: 'The puppy chewed a toy.', ok: true, why: '' }, { t: 'Grandma baked a pie.', ok: true, why: '' },
    { t: 'My little sister giggled.', ok: true, why: '' }, { t: 'The bus stopped at the corner.', ok: true, why: '' },
    { t: 'Our teacher reads to us.', ok: true, why: '' }, { t: 'Fish swim in the ocean.', ok: true, why: '' },
    { t: 'Under the warm blanket.', ok: false, why: 'both' }, { t: 'Across the busy street.', ok: false, why: 'both' },
    { t: 'Flew over the house.', ok: false, why: 'nosubj' }, { t: 'Painted a picture of the sea.', ok: false, why: 'nosubj' },
    { t: 'The tiny red ladybug.', ok: false, why: 'nopred' }, { t: 'My cousin from Texas.', ok: false, why: 'nopred' },
    { t: 'Before the sun came up.', ok: false, why: 'thought' }, { t: 'Since we were hungry.', ok: false, why: 'thought' }
  ]);
  SS.pickFrags = function (n, opts) {
    opts = opts || {};
    var okShare = opts.okShare == null ? 0.5 : opts.okShare;
    var oks = SS.shuffle(SS.frags.filter(function (f) { return f.ok; }));
    var bad = SS.shuffle(SS.frags.filter(function (f) { return !f.ok && (!opts.whys || opts.whys.indexOf(f.why) >= 0); }));
    var nOk = Math.round(n * okShare), out = [];
    for (var i = 0; i < nOk && oks.length; i++) out.push(oks.pop());
    while (out.length < n && bad.length) out.push(bad.pop());
    while (out.length < n && oks.length) out.push(oks.pop());
    return SS.shuffle(out);
  };
  SS.whyText = {
    nosubj: 'It has no WHO or WHAT. Who or what is doing it?',
    nopred: 'It has no DOES or IS. What does the WHO or WHAT do?',
    both: 'It only tells where or when. It has no WHO or WHAT and no DOES or IS.',
    thought: 'It starts a thought but does not finish it. What happens next?'
  };
  SS.whyShort = {
    nosubj: 'No WHO or WHAT', nopred: 'No DOES or IS', both: 'Both halves are missing', thought: 'The thought is not finished'
  };
  // three questions on the Fragment Detective checklist: [subject?, predicate?, finished thought?]
  SS.checks = { '': [1, 1, 1], nosubj: [0, 1, 0], nopred: [1, 0, 0], both: [0, 0, 0], thought: [1, 1, 0] };

  // ---------- Fix-It Shop. result = pre + piece + post. need: sub | pred | thought | both
  function fx(need, pre, piece, post, wrong) {
    return { need: need, pre: pre, piece: piece, post: post, wrong: wrong,
      frag: [pre, post].filter(Boolean).join(' '),
      result: [pre, piece, post].filter(Boolean).join(' ') };
  }
  SS.fixes = [
    fx('sub', '', 'The boy', 'ran down the hill.', ['ate a sandwich.', 'on the big hill']),
    fx('sub', '', 'My friends', 'played soccer after school.', ['under the table', 'jumped high']),
    fx('sub', '', 'The ducks', 'swam across the lake.', ['across the road', 'quickly ran']),
    fx('sub', '', 'The little girl', 'jumped over the puddle.', ['in the rain', 'danced and sang']),
    fx('sub', '', 'My brother', 'ate all of the cookies.', ['after lunch', 'a plate of']),
    fx('sub', '', 'Sam', 'walked to the park with Grandma.', ['at the park', 'sat down']),
    fx('pred', 'The shiny red apple', 'fell off the table.', '', ['The little dog', 'on the table']),
    fx('pred', 'My favorite stuffed bear', 'sits on my bed.', '', ['The soft pillow', 'in my room']),
    fx('pred', 'A basket of warm muffins', 'sat on the counter.', '', ['My mom', 'in the oven']),
    fx('pred', 'The little girl with curly hair', 'giggled at the joke.', '', ['My best friend', 'at the party']),
    fx('pred', 'Ten children in my class', 'sang a song.', '', ['Two friends', 'in the gym']),
    fx('pred', 'My favorite book about dragons', 'is on the shelf.', '', ['My big brother', 'in the library']),
    fx('thought', 'Because I was tired,', 'I went to bed early.', '', ['when the bell rang', 'after lunch']),
    fx('thought', 'When the bell rings,', 'we line up.', '', ['after the bell', 'because we are late']),
    fx('thought', 'After we finished our homework,', 'we played outside.', '', ['before dinner', 'when it was time']),
    fx('both', '', 'A lost fox hid', 'in the dark forest.', ['The lost fox', 'hid quietly']),
    fx('both', '', 'My favorite book sat', 'on the top shelf.', ['The favorite book', 'sat quietly']),
    fx('both', '', 'The farmer parked his truck', 'behind the old barn.', ['The old farmer', 'parked quietly'])
  ];
  SS.needText = {
    sub: 'This needs a WHO or WHAT (a subject).',
    pred: 'This needs a DOES or IS (a predicate).',
    thought: 'This thought is not finished. It needs the rest!',
    both: 'This needs both halves: a WHO or WHAT and a DOES or IS.'
  };

  // ---------- Matching pool: each pair has a "domain" so a round never has two that could swap
  function mt(d, sub, pred) { return { d: d, sub: sub, pred: pred }; }
  SS.matches = [
    mt('food', 'The baker', 'made bread in the morning.'), mt('sky', 'The airplane', 'landed on the long runway.'),
    mt('water', 'The fish', 'swam in the bowl.'), mt('snow', 'The snowman', 'melted in the sun.'),
    mt('bugs', 'The bees', 'buzzed around the flowers.'), mt('school', 'The teacher', 'graded our spelling tests.'),
    mt('health', 'The doctor', 'checked my ears and throat.'), mt('farm', 'The farmer', 'milked the cows.'),
    mt('art', 'The painter', 'painted a picture of the sea.'), mt('fire', 'The firefighter', 'sprayed water on the fire.'),
    mt('teeth', 'The dentist', 'cleaned my teeth.'), mt('pets', 'The cat', 'purred on my lap.'),
    mt('barn', 'The rooster', 'crowed at sunrise.'), mt('music', 'The singer', 'sang a song on stage.'),
    mt('mail', 'The mail carrier', 'delivered the letters.'), mt('books', 'The librarian', 'stamped the library books.'),
    mt('garden', 'The gardener', 'watered the tulips.'), mt('bikes', 'The mechanic', 'fixed my bike tire.'),
    mt('pond', 'The frog', 'croaked by the pond.'), mt('shell', 'The turtle', 'hid inside its shell.'),
    mt('baby', 'The baby', 'giggled in her crib.'),
    mt('barn2', 'The cow', 'mooed in the barn.'), mt('space', 'The astronaut', 'floated inside the spaceship.')
  ];
  SS.pickMatches = function (n) {
    var pool2 = SS.shuffle(SS.matches), out = [], used = {};
    pool2.forEach(function (m) { if (out.length < n && !used[m.d]) { used[m.d] = 1; out.push(m); } });
    return out;
  };

  // ---------- pieces for the Pop games
  function dropLast(a) { return a.slice(0, a.length - 1); }
  // Wrong answers for "find the complete subject"
  SS.subOptions = function (st) {
    var w = st.words, s = st.s, opts = [], seen = {};
    function add(t) { t = t.trim(); if (t && !seen[t] && t !== st.sub) { seen[t] = 1; opts.push(t); } }
    if (s >= 2) { add(dropLast(w.slice(0, s)).join(' ')); add(w[s - 1]); }   // missing describing words
    add(w.slice(0, s + 1).join(' ').replace(/[.!?]$/, ''));                    // too much: includes the action word
    add(st.pred);                                                               // the other half
    if (w.length > s + 1) add(w.slice(s + 1).join(' '));                        // part of the other half
    return SS.shuffle([st.sub].concat(SS.sample(opts, 3)));
  };
  SS.predOptions = function (st) {
    var w = st.words, s = st.s, opts = [], seen = {};
    function add(t) { t = t.trim(); if (t && !seen[t] && t !== st.pred) { seen[t] = 1; opts.push(t); } }
    add(st.sub);
    add(w.slice(s - 1).join(' '));                                              // too much: includes the last subject word
    if (w.length - s >= 2) add(w.slice(s + 1).join(' '));                       // missing the action word
    if (w.length - s >= 3) add(w.slice(s, w.length - 1).join(' ') + '.');       // missing the end
    add(w[s].replace(/[.!?]$/, ''));                                            // just the action word
    return SS.shuffle([st.pred].concat(SS.sample(opts, 3)));
  };
})();
