/* THE LIBRARY LIST. To add an app or skill, add one entry here. The dashboard builds itself from this file. */
window.LIBRARY = {
  title: "Knowledge Prep Hub",
  apps: [
    {
      id: 'snippys-sentence-shore',
      name: "Snippy's Sentence Shore",
      emoji: '🦀',
      color: '#1790B5',
      kind: 'game',
      subject: 'English',
      grade: '2nd grade',
      gradeNum: 2,
      status: 'live',
      path: 'snippys-sentence-shore/',
      blurb: 'Help Snippy the crab find subjects, predicates, and complete sentences. 7 levels, each taught 3 ways.',
      tags: ['subject', 'predicate', 'complete sentence', 'fragment', 'grammar', 'sentences', 'homework'],
      updated: '2026-11-05'
    },
    {
      id: 'math-dojo',
      name: 'Math Dojo',
      emoji: '🥷',
      color: '#6C4AB6',
      kind: 'game',
      subject: 'Math',
      grade: '6th grade',
      gradeNum: 6,
      status: 'live',
      path: 'math-dojo/',
      blurb: 'Train like a ninja through 7 math worlds: integers, fractions, algebra, ratios, stats, shapes, and money. Learn it, try it, prove it, beat the boss.',
      tags: ['math', 'integers', 'fractions', 'decimals', 'gemdas', 'equations', 'inequalities', 'ratios', 'percent', 'mean', 'median', 'area', 'circles', 'financial literacy', 'EUS'],
      updated: '2026-11-05'
    },
    {
      id: 'ensley-grammar-quest',
      name: "Ensley's Grammar Quest",
      emoji: '🧭',
      color: '#34B26E',
      kind: 'game',
      subject: 'English',
      grade: '2nd grade',
      gradeNum: 2,
      status: 'soon',
      blurb: 'Parts of speech test prep: 8 islands, a boss battle, and the 20 practice questions. Coming to the hub soon.',
      tags: ['nouns', 'pronouns', 'verbs', 'adjectives', 'adverbs', 'interjections', 'parts of speech', 'test']
    }
  ],
  skills: [
    { name: 'Complete Subject', ask: 'WHO or WHAT is the sentence about?', subject: 'English', app: 'snippys-sentence-shore', level: 'Level 1 · Subject Shells', emoji: '🐚' },
    { name: 'Complete Predicate', ask: 'What does or is the subject?', subject: 'English', app: 'snippys-sentence-shore', level: 'Level 2 · Predicate Pier', emoji: '🌊' },
    { name: 'Subject + Predicate Split', ask: 'Cut a sentence into two halves.', subject: 'English', app: 'snippys-sentence-shore', level: 'Level 3 · Snip It!', emoji: '✂️' },
    { name: 'Sentence or Fragment?', ask: 'Does it have a who AND a what-happens?', subject: 'English', app: 'snippys-sentence-shore', level: 'Level 4 · Fragment Detective', emoji: '🔍' },
    { name: 'Fix a Fragment', ask: 'Add the missing piece.', subject: 'English', app: 'snippys-sentence-shore', level: 'Level 5 · Fix-It Shop', emoji: '🛠️' },
    { name: 'Build a Sentence', ask: 'Match and build whole sentences.', subject: 'English', app: 'snippys-sentence-shore', level: 'Level 6 · Build-a-Sentence', emoji: '🏰' },
    { name: 'Integers', ask: 'Negative numbers, absolute value, KCF.', subject: 'Math', app: 'math-dojo', level: 'Integer Island', emoji: '🏝️' },
    { name: 'Fractions & Decimals', ask: 'Add, multiply, divide with Keep-Change-Flip.', subject: 'Math', app: 'math-dojo', level: 'Fraction Forest', emoji: '🌲' },
    { name: 'Expressions & Equations', ask: 'GEMDAS, like terms, solving for x.', subject: 'Math', app: 'math-dojo', level: 'Algebra Alley', emoji: '🧩' },
    { name: 'Ratios & Percents', ask: 'Unit rates, proportions, percent change.', subject: 'Math', app: 'math-dojo', level: 'Ratio Rapids', emoji: '🌊' },
    { name: 'Statistics', ask: 'Mean, median, mode, IQR.', subject: 'Math', app: 'math-dojo', level: 'Stats Stadium', emoji: '🏟️' },
    { name: 'Area & Circles', ask: 'Perimeter, area, circles, composite shapes.', subject: 'Math', app: 'math-dojo', level: 'Shape City', emoji: '🏙️' },
    { name: 'Financial Literacy', ask: 'Check registers, percents, salary, credit.', subject: 'Math', app: 'math-dojo', level: 'Money Mountain', emoji: '🏔️' },
    { name: 'Parts of Speech', ask: 'Nouns, verbs, adjectives, and more.', subject: 'English', app: 'ensley-grammar-quest', level: '8 islands', emoji: '🧭' }
  ]
};
