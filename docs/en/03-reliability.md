# Reliability: the most dependable way to use Jev

Jev's typed output guarantees the *interface*, not the *truth*. Reliability comes from how you ask, how you gate, and how you watch. Ten habits, in the order you will need them.

## 1. Closed questions with a way out

Every `choice` gets an `other` or `none` option. Every `noul` is a literal condition, not a vibe. Levels of a `score` describe concrete situations, not adjectives. If you cannot write what "level 2" looks like, you do not have a score question yet.

## 2. One judgment per question

"Is this urgent and about billing?" is two questions. Split them; combine in code. A question that weighs several factors returns a mushy probability.

## 3. Put the rule in the instructions, not in your head

Jev reads literally. When a wrong answer makes you explain what you meant, that explanation is the missing half of the instruction. Put boundary cases in the criteria.

## 4. A golden set before a threshold

Label twenty to thirty real items yourself. Run `jev check questions.json cases.jsonl`. Read the misses: half of them are usually your label being ambiguous, which is also a finding. Only then pick thresholds.

## 5. Three confidence bands, not one cutoff

- High: act automatically.
- Middle: mark as `review`; show it, do not decide on it.
- Low: refuse or route to a person or an LLM.

Where the bands sit depends on the cost of being wrong. Spending more (escalating, blocking, paging) needs a higher bar than spending less.

## 6. Gates fail open, judges fail silent

A missing key, a timeout, a 429: the call proceeds and one line is logged. A safety gate that blocks on infrastructure errors will be turned off within a week. Shadow mode first, enforce later.

## 7. Cache by request hash

Identical state plus identical questions gives the same answer. Hash the request, cache the answer, and re-runs and CI cost nothing. The `jev` CLI and every script in this repo do this.

## 8. Pin the model, log the model

`jev-latest` moves. Pin `jev-1.13.0` in anything with thresholds, and record the `model` field from every response so you can re-run the golden set when you upgrade.

## 9. Keep math, dates and lookups in code

Counting, arithmetic, date windows, exact IDs: compute them in code and pass the result or a named bucket. Jev is for the part that needs common sense.

## 10. Log every call, look at the log

One JSONL line per call: state hash, questions, answers, decision, model, latency, tokens. `jev view` renders it. If the probability histogram piles up in the middle, the question or the data is unclear; if it sits at the ends, you are done.

## Checklist before shipping

- [ ] every choice has `other`/`none`
- [ ] each question is one judgment
- [ ] boundary cases written into criteria
- [ ] golden set of 20+ labeled cases passes at the accuracy you need
- [ ] three bands with thresholds in one file
- [ ] gate fails open; judge never blocks on errors
- [ ] request cache on
- [ ] model pinned and logged
- [ ] no arithmetic or date logic delegated to the model
- [ ] JSONL log written and viewed once

Read next: [04 Tools](04-tools.md)
