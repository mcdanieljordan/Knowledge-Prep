'use strict';
/* ============ game: points, levels, badges, praise ============ */
const LEVELS = [
  { n: 1, xp: 0, title: 'Word Seed', icon: '🌱' }, { n: 2, xp: 40, title: 'Word Sprout', icon: '🌿' }, { n: 3, xp: 100, title: 'Letter Explorer', icon: '🧭' },
  { n: 4, xp: 180, title: 'Sentence Builder', icon: '🧱' }, { n: 5, xp: 280, title: 'Sentence Star', icon: '⭐' }, { n: 6, xp: 400, title: 'Grammar Ranger', icon: '🏕️' },
  { n: 7, xp: 550, title: 'Noun Ninja', icon: '🥷' }, { n: 8, xp: 730, title: 'Verb Voyager', icon: '⛵' }, { n: 9, xp: 940, title: 'Adjective Ace', icon: '🎨' },
  { n: 10, xp: 1190, title: 'Adverb Adventurer', icon: '🚀' }, { n: 11, xp: 1480, title: 'Word Wizard', icon: '🧙' }, { n: 12, xp: 1810, title: 'Word Whiz', icon: '🧠' },
  { n: 13, xp: 2200, title: 'Grammar Guru', icon: '🧘' }, { n: 14, xp: 2650, title: 'Language Legend', icon: '🏆' }, { n: 15, xp: 3200, title: 'Super Scholar', icon: '🎓' },
  { n: 16, xp: 3900, title: 'Grammar Queen', icon: '👑' }
];
const levelFor = xp => { let L = LEVELS[0]; for (const l of LEVELS) if (xp >= l.xp) L = l; return L; };
const nextLevel = xp => LEVELS.find(l => l.xp > xp) || null;
function levelInfo() {
  const cur = levelFor(S.xp), nx = nextLevel(S.xp);
  return { cur, nx, pct: nx ? Math.round(100 * (S.xp - cur.xp) / (nx.xp - cur.xp)) : 100, toGo: nx ? nx.xp - S.xp : 0 };
}

const celebQ = [];
let STREAK = 0;
function addXP(n) {
  if (n <= 0) return;
  const before = levelFor(S.xp).n;
  S.xp += n;
  const after = levelFor(S.xp).n;
  for (let k = before + 1; k <= after; k++) celebQ.push({ type: 'level', level: LEVELS[k - 1] });
  save(); updateHud();
}

/* ---------- praise ---------- */
const BIG = ['Superb!', 'Excellent!', 'Awesome!', 'Fantastic!', 'Brilliant!', 'Marvelous!', 'Terrific!', 'Wonderful!', 'Outstanding!', 'Spectacular!', 'Amazing!', 'Incredible!', 'Splendid!', 'Stellar!', 'Magnificent!', 'Fabulous!', 'Phenomenal!', 'Perfect!', 'Genius!', 'Dazzling!', 'Super smart!', 'Nailed it!', 'You got it!', 'Great job!', 'Way to go!', 'High five!', 'Bingo!', 'Ta-da!', 'Boom!', 'You rock!', 'Bravo!', 'Sparkling!'];
const SUB = ['Your brain is on fire!', 'You are a grammar star!', 'That was super smart!', 'You are getting so good at this!', 'I knew you could do it!', 'Look at you go!', 'You make this look easy!', 'Your hard work is paying off!', 'What a thinker you are!', 'Keep shining!', 'You are a word wizard!', 'Teachers would be proud!'];
const SECOND = ['You figured it out!', 'Way to keep trying!', 'Persistence pays off!', 'That is the spirit!', 'Great fix!', 'You never gave up!', 'Smart thinking!', 'Mistakes help your brain grow!'];
const OOPS = ['Good try!', 'So close!', 'Almost!', 'Not quite. Keep going!', 'Great thinking! Look again.', 'You can do it!', 'Try again, you are learning!', 'Oops! Brains grow from mistakes.'];
const STREAK_MSG = { 3: 'Hat trick! 3 in a row!', 5: 'High five! 5 in a row!', 8: 'On fire! 8 in a row!', 10: 'Perfect ten! 10 in a row!', 15: 'Unstoppable! 15 in a row!', 20: 'Legendary! 20 in a row!', 25: 'Superstar streak! 25 in a row!', 30: 'GRAMMAR GENIUS! 30 in a row!' };
const bigBag = bag(BIG), subBag = bag(SUB), secBag = bag(SECOND), oopsBag = bag(OOPS);
const praiseBig = () => bigBag(), praiseSub = () => subBag().replace('{n}', S.name), praiseSecond = () => secBag(), praiseOops = () => oopsBag();

/* ---------- progress ---------- */
const actKey = (kind, a, b) => `${kind}:${a}:${b}`;
const getAct = key => S.acts[key] || { stars: 0, plays: 0, best: 0 };
const totalStars = () => Object.values(S.acts).reduce((a, x) => a + (x.stars || 0), 0);
const actsDone = () => Object.values(S.acts).filter(x => x.stars > 0).length;
function recordItem(skill, first, second) {
  const k = S.skills[skill] || (S.skills[skill] = { a: 0, f: 0 });
  k.a++; if (first) k.f++;
  S.stats.answered++; if (first) S.stats.first++; else if (second) S.stats.second++;
  S.log.push({ t: Date.now(), s: skill, f: first ? 1 : 0 }); if (S.log.length > 600) S.log.splice(0, S.log.length - 600);
}
const topicWayDone = (tid, w) => getAct(actKey('T', tid, w)).stars > 0;
const topicDone = t => [1, 2, 3].every(w => topicWayDone(t.id, w));
const topicStars = t => [1, 2, 3].reduce((a, w) => a + getAct(actKey('T', t.id, w)).stars, 0);
const qWayDone = (n, w) => getAct(actKey('Q', n, w)).stars > 0;
const qDone = n => [1, 2, 3].every(w => qWayDone(n, w));
const qStars = n => [1, 2, 3].reduce((a, w) => a + getAct(actKey('Q', n, w)).stars, 0);
const pageQsDone = p => (TQ_PAGES[p] || []).every(qDone);

/* ---------- badges ---------- */
const BADGES = [
  { id: 'first', icon: '🎈', name: 'First Steps', desc: 'Finish your very first activity.', test: () => actsDone() >= 1 },
  ...TOPICS.map(t => ({ id: 'topic_' + t.id, icon: t.badge.icon, name: t.badge.name, desc: `Finish all 3 ways in ${t.island}.`, test: () => topicDone(t) })),
  { id: 'p8', icon: '📄', name: 'Page 8 Champ', desc: 'Finish every way for the questions on page 8.', test: () => pageQsDone(8) },
  { id: 'p9', icon: '📘', name: 'Page 9 Champ', desc: 'Finish every way for the questions on page 9.', test: () => pageQsDone(9) },
  { id: 'p10', icon: '📗', name: 'Page 10 Champ', desc: 'Finish every way for the questions on page 10.', test: () => pageQsDone(10) },
  { id: 'p11', icon: '📙', name: 'Page 11 Champ', desc: 'Finish every way for the questions on page 11.', test: () => pageQsDone(11) },
  { id: 'testready', icon: '🏆', name: 'Test Ready!', desc: 'Finish all 3 ways of all 20 practice questions.', test: () => TQ.every(q => qDone(q.n)) },
  { id: 'mock18', icon: '🎯', name: 'Mock Test Master', desc: 'Score 18 or more on the Practice Test.', test: () => S.mock.best >= 18 },
  { id: 'mock20', icon: '💯', name: 'Perfect Test!', desc: 'Score 20 out of 20 on the Practice Test.', test: () => S.mock.best >= 20 },
  { id: 's3', icon: '🎩', name: 'Hat Trick', desc: 'Get 3 right in a row on the first try.', test: () => S.stats.bestStreak >= 3 },
  { id: 's5', icon: '✋', name: 'High Five', desc: 'Get 5 right in a row on the first try.', test: () => S.stats.bestStreak >= 5 },
  { id: 's10', icon: '🔟', name: 'Perfect Ten', desc: 'Get 10 right in a row on the first try.', test: () => S.stats.bestStreak >= 10 },
  { id: 's20', icon: '🔥', name: 'Unstoppable', desc: 'Get 20 right in a row on the first try.', test: () => S.stats.bestStreak >= 20 },
  { id: 's30', icon: '🌋', name: 'Streak Legend', desc: 'Get 30 right in a row on the first try.', test: () => S.stats.bestStreak >= 30 },
  { id: 'perfect1', icon: '⭐', name: 'Triple Star', desc: 'Earn 3 stars on any activity.', test: () => Object.values(S.acts).some(a => a.stars >= 3) },
  { id: 'stars10', icon: '🌟', name: 'Star Collector', desc: 'Collect 10 stars.', test: () => totalStars() >= 10 },
  { id: 'stars30', icon: '🌠', name: 'Star Hoarder', desc: 'Collect 30 stars.', test: () => totalStars() >= 30 },
  { id: 'stars75', icon: '💫', name: 'Super Star', desc: 'Collect 75 stars.', test: () => totalStars() >= 75 },
  { id: 'retry5', icon: '🔁', name: 'Try, Try Again', desc: 'Fix a mistake and get it right 5 times.', test: () => S.stats.second >= 5 },
  { id: 'retry20', icon: '💪', name: 'Never Give Up', desc: 'Fix a mistake and get it right 20 times.', test: () => S.stats.second >= 20 },
  { id: 'xp100', icon: '💰', name: 'Century', desc: 'Earn 100 points.', test: () => S.xp >= 100 },
  { id: 'xp500', icon: '🥁', name: 'Five Hundred', desc: 'Earn 500 points.', test: () => S.xp >= 500 },
  { id: 'xp1000', icon: '🚀', name: 'One Thousand', desc: 'Earn 1,000 points.', test: () => S.xp >= 1000 },
  { id: 'xp2000', icon: '👑', name: 'Two Thousand', desc: 'Earn 2,000 points.', test: () => S.xp >= 2000 },
  { id: 'peek', icon: '👀', name: 'Page Peeker', desc: 'Open a page of your study guide.', test: () => Object.keys(S.pages).length >= 1 },
  { id: 'book', icon: '📚', name: 'Bookworm', desc: 'Open all 12 pages of your study guide.', test: () => Object.keys(S.pages).length >= 12 },
  { id: 'threeways', icon: '🔱', name: 'Three-Way Winner', desc: 'Finish all 3 ways of any practice question.', test: () => TQ.some(q => qDone(q.n)) }
];
function checkBadges() {
  BADGES.forEach(b => {
    if (!S.badges[b.id] && b.test()) { S.badges[b.id] = Date.now(); celebQ.push({ type: 'badge', badge: b }); }
  });
  save();
}

/* ---------- mastery per island (for the home map rings) ---------- */
function topicMastery(t) {
  let a = 0, f = 0;
  t.skills.forEach(s => { const k = S.skills[s]; if (k) { a += k.a; f += k.f; } });
  return a ? Math.round(100 * f / a) : null;
}
