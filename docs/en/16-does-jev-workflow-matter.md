# Does the jev-workflow skill matter? An A/B on a real task

> Historical experiment, not reproduced in this audit. Read the corrected interpretation below.
Question: is a separate workflow skill necessary, or does the official `typesafe-ai` skill already produce the same result? Answer by experiment, 2026-09-19, headless Claude Code, same task, same repo, one run each.

## Setup

A tiny project: `classify.js` routes inbox messages to folders with four regexes; `messages.txt` has eight sample messages. Prompt for both runs:

> Using the typesafe-ai skill[ and the jev-workflow skill], replace the keyword classifier in classify.js with a TypeSafe Jev judgment. TYPESAFE_API_KEY is set. messages.txt has sample messages. Make it work and verify it.

Condition A: official skill only, with `jev-workflow` physically removed from the skills directory so it could not be auto-loaded. (A first attempt with the skill merely installed but not named was contaminated: the agent used its vocabulary anyway. Loading should be verified from traces.) Condition B: both skills named.

## What each run shipped

| Deliverable | A: official skill only | B: plus jev-workflow |
| --- | --- | --- |
| Jev call with described options | yes, structured `what/not_for/examples` per folder | yes |
| Separate questions file | no, inline in code | `classify.questions.json` |
| Golden set | 8 cases inline in `verify.js` | 26 labeled cases in `classify.cases.jsonl`, checked with `jev check --strict` |
| Confidence bands in one place | mentioned as future work | three bands (`auto` ≥ 0.75, `review`, `unsure` < 0.5) plus a scam override at 0.85 |
| Fail-open on missing key / timeout / 429 | no | yes, warns once, returns `other` |
| Request cache by hash | no | yes |
| Pinned model, logged `model` field | no | `jev-1.13.0`, logged |
| JSONL log per call, viewed once | no | `logs/jev-classify.jsonl`, opened with `jev view` |
| Tests | 1 script, live only | 6 tests: 4 policy-only, 1 fail-open, 1 live |
| `.gitignore` for logs, secret scan | no | yes |
| Accuracy on the sample | 8/8 | 8/8; golden set 26/26 |
| Compared against the old regex | no | yes: old classifier scored 20/30 on the golden set |

Both runs produced a working, correct classifier. The difference is everything around it: A shipped a call; B shipped a decision you can test, tune, audit and roll back.

## Corrected interpretation

This historical record was not reproduced in this audit. One run per condition does not establish necessity, general effectiveness, or causality. Similar vocabulary does not prove an unnamed skill was loaded; that requires load traces. The table uses both 26 and 30 cases, so it is not evidence of a fair same-dataset comparison.

Logging, tests, and failure policies are useful regardless of packaging. Fail-open is task-dependent, not a universal benefit. The project now uses an [ordinary integration guide](16-agent-integration.md), avoiding a redundant installation for beginners. A reusable skill can be reconsidered if repeated cross-project needs justify it.
