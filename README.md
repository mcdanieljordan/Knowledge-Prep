# Knowledge-Prep

Ensley's Learning Hub: games that turn schoolwork into fun.

Live site: https://mcdanieljordan.github.io/Knowledge-Prep/

## Apps

| App | What it teaches | Status |
|---|---|---|
| [Snippy's Sentence Shore](snippys-sentence-shore/) | Subjects, predicates, complete sentences, fragments (7 levels, 3 ways each) | Live |
| [Glitterhoof Unit 5 Quest](glitterhoof-unit5/) | 2nd grade Unit 5 test prep: 13 skills + final, 5 levels each, one skill at a time | Live |
| [Math Dojo](math-dojo/) | 6th grade math: 7 worlds, 40 skills (integers to financial literacy) | Live |
| [Grown-Ups Dashboard](dashboard/) | Parent + teacher analytics, recommendations, LLM quiz prompts | Live |
| Ensley's Grammar Quest | Parts of speech test prep | Coming soon |

## How the dashboard works

`index.html` builds itself from `library.js`. To add an app, copy it into its own folder and add one entry to `library.js`.

## Adding a new app
1. Load `../shared/hub.js` and report each answer with `Hub.record({app, skill, ok, hints, ms, mode, prompt, given, correct, why})`.
2. Register its skills in `shared/catalog.js`.
3. Add an entry (with `gradeNum`) to `library.js`.
