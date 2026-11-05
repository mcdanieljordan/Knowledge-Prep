/* Names and teaching methods for every skill the apps report. The dashboard uses this to
   label progress and to write quiz prompts. Load math-dojo/js/catalog.js BEFORE this file. */
(function () {
  var KP = window.KP = window.KP || {};
  KP.apps = {};

  KP.apps['snippys-sentence-shore'] = {
    name: "Snippy's Sentence Shore", emoji: '🦀', path: 'snippys-sentence-shore/', subject: 'English', grades: [2],
    groupLabel: 'Sentences',
    skills: {
      subject: { name: 'Complete Subject', emoji: '🐚', group: 'Sentences', method: 'The complete subject tells WHO or WHAT the sentence is about. It is the naming part and includes all the words that go with the main noun (for example: "The tall boy").' },
      predicate: { name: 'Complete Predicate', emoji: '🌊', group: 'Sentences', method: 'The complete predicate tells what the subject DOES or IS. It starts with the verb and includes everything after it to the end of the sentence.' },
      snip: { name: 'Split Subject + Predicate', emoji: '✂️', group: 'Sentences', method: 'Every complete sentence can be cut into two halves: the complete subject (who or what) and the complete predicate (does or is).' },
      cf: { name: 'Sentence or Fragment?', emoji: '🔍', group: 'Sentences', method: 'A complete sentence has a subject (who or what) AND a predicate (does or is) AND tells a complete thought. A fragment is missing the subject, the predicate, or the whole thought.' },
      fix: { name: 'Fix a Fragment', emoji: '🛠️', group: 'Sentences', method: 'To fix a fragment, add what is missing: a subject (who or what) or a predicate (does or is) so that it becomes a complete thought.' },
      match: { name: 'Match Subjects & Predicates', emoji: '🔗', group: 'Sentences', method: 'A subject and a predicate must make sense together to form a complete sentence. Say it out loud to check.' },
      build: { name: 'Build a Sentence', emoji: '🏰', group: 'Sentences', method: 'Build a complete sentence by putting the subject words first and then the predicate words, so it makes sense and has a capital letter and end mark.' }
    }
  };

  var mdSkills = {};
  if (window.MD && MD.skills) MD.skills.forEach(function (s) { mdSkills[s.id] = { name: s.name, emoji: s.emoji, group: MD.worldById[s.world].name, groupEmoji: MD.worldById[s.world].emoji, order: MD.worlds.indexOf(MD.worldById[s.world]), method: s.method }; });
  KP.apps['math-dojo'] = { name: 'Math Dojo', emoji: '🥷', path: 'math-dojo/', subject: 'Math', grades: [6], groupLabel: 'Worlds', skills: mdSkills, deepLink: true };

  KP.skillInfo = function (app, id) {
    var a = KP.apps[app], s = a && a.skills[id];
    return s ? s : { name: id, emoji: '⭐', group: 'Other', method: '' };
  };
  KP.appInfo = function (app) { return KP.apps[app] || { name: app, emoji: '📱', path: '', subject: '', skills: {} }; };
})();
