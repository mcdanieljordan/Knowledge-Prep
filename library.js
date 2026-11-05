/* THE LIBRARY LIST. To add an app or skill, add one entry here. The dashboard builds itself from this file. */
window.LIBRARY = {
  title: "Ensley's Learning Hub",
  apps: [
    {
      id: 'snippys-sentence-shore',
      name: "Snippy's Sentence Shore",
      emoji: '🦀',
      color: '#1790B5',
      kind: 'game',
      subject: 'English',
      grade: '2nd grade',
      status: 'live',
      path: 'snippys-sentence-shore/',
      blurb: 'Help Snippy the crab find subjects, predicates, and complete sentences. 7 levels, each taught 3 ways.',
      tags: ['subject', 'predicate', 'complete sentence', 'fragment', 'grammar', 'sentences', 'homework'],
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
    { name: 'Parts of Speech', ask: 'Nouns, verbs, adjectives, and more.', subject: 'English', app: 'ensley-grammar-quest', level: '8 islands', emoji: '🧭' }
  ]
};
