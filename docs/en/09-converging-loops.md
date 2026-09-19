# Converging loops: LLM proposes, Jev measures, code decides

The previous page put Jev before, into and after an LLM. This page closes the circle: the LLM's output feeds Jev, Jev's numbers feed the LLM, and the loop stops on its own. What makes it stop is never the LLM and never Jev. It is a scalar metric computed in code from Jev's typed answers, with rules that force convergence.

## Why Jev is the right measuring instrument for a loop

- **It re-scores the whole set every round for almost nothing.** Twelve messages, one question each, three rounds: under a cent. You never have to sample or guess whether the last change helped.
- **It is consistent.** The same input gets the same label across rounds, so a change in the metric reflects the proposal, not noise.
- **It is typed.** The metric is `count(other) / n` or `mean(confidence)`, not a parse of prose.
- **It cannot be talked into anything.** The LLM proposes; it does not grade its own work.

## The three loops that converge

### A. Draft → check → revise (already in `jev-then-llm.mjs`)

The LLM writes a reply; Jev answers "does it answer the question?", "does it overcommit?"; failing checks are named and fed back; one retry; then a person. Convergence rule: all checks above threshold, or attempt cap.

### B. Taxonomy discovery (`llm-then-jev-loop.mjs`)

Start with a poor category list. Jev classifies everything; items in `other` or below confidence 0.6 are the unknown pile. The LLM looks at the pile and proposes **one** new category. Code adds it, Jev re-classifies, repeat.

Real run, `jev-1.13.0`, 2026-09-19:

```text
round 1  categories=3  other-rate=58%  mean-conf=0.95
  + LLM proposed: schedule: upcoming appointments, events, or travel with a specific time
round 2  categories=4  other-rate=17%  mean-conf=0.98
  + LLM proposed: shopping: Shopping messages: promotions, sales, and purchase inquiries
round 3  categories=5  other-rate=0%  mean-conf=0.99
✓ converged: other-rate 0% ≤ 10%
```

Three rounds, 58% → 17% → 0%. Notice the one debatable absorption: "Mum asks which rice cooker brand" landed in `shopping`. The loop optimized the metric it was given; whether that placement is what *you* want is a golden-set question (Lesson 7), which is why a converged taxonomy still gets a human look before it ships.

### C. Question discovery (the official autoresearch cookbook)

The LLM proposes candidate *questions*; Jev answers them over a labeled set; code measures which questions predict the labels; the LLM proposes better ones. Same shape, one level up: the thing being improved is the Jev question itself.

## The convergence rules, all in code

1. **One scalar metric** from Jev's answers: other-rate, accuracy on a golden set, mean confidence, pass rate of checks.
2. **A target** (`other-rate ≤ 10%`, `all checks pass`) that ends the loop the moment it is met.
3. **Monotone acceptance.** Keep the best round's state. A proposal that makes the metric worse is discarded, never applied.
4. **A no-progress stop.** If a round does not improve the best, stop; do not let the LLM thrash.
5. **A cap** on rounds and on the size of what grows (categories, criteria, prompt length).
6. **Validation of the LLM's proposal** before it is applied: shape, uniqueness, length. An unusable proposal ends the loop rather than corrupting the state.
7. **A human at the exit.** Converged or stopped, the result is shown with the metric and the log before it is used.

## Pitfalls

- **Overfitting the checker.** If the LLM sees the same items Jev grades, it can propose categories that fit those twelve messages and nothing else. Hold out a set Jev grades but the LLM never sees, and report both numbers.
- **Oscillation.** Two proposals that undo each other. Monotone acceptance plus the no-progress stop makes this impossible.
- **Jev's literalness.** A category description written by the LLM becomes a Jev criterion; vague descriptions produce vague probabilities. Cap description length and require distinctness in the prompt.
- **Metric gaming.** `other-rate` can hit 0% by absorbing everything into one broad category. Pair it with `mean confidence` and with the golden set.

## Can everything be put through this loop?

No. The loop always *terminates* if you follow the rules above; it *converges to something useful* only when four conditions hold:

1. **The goal is judgeable in text.** Jev has to be able to answer "is this better?" from words. Categories, relevance, tone, whether a draft answers a question: yes. Whether code compiles, whether a number is right, whether an image looks correct, whether a fact is true in the world: no. Those need a different oracle (a compiler, a test, a calculator, a sensor, a person), and the loop should be built around that oracle instead, with Jev only judging the textual parts.
2. **The metric is independent of the proposer.** If the LLM can see exactly what Jev grades, it can satisfy the grader without satisfying you. Hold out data, and report the held-out number.
3. **The proposal space can actually move the metric.** A loop that lets the LLM rewrite a category description can fix vague categories; it cannot fix a question that asks the wrong thing. Some loops need a person to change the question, not the LLM to change the answer.
4. **"Converged" is not "correct".** The loop stops when the number stops moving. That number is a proxy you chose, and Goodhart's law applies: the taxonomy loop reached 0% `other` partly by putting a family message under `shopping`. A golden set, a second metric (mean confidence), and a human at the exit are what turn "the metric stopped moving" into "this is right".

| Task | Loops well? | Why |
| --- | --- | --- |
| Grow a category list until few items are `other` | yes | judgeable, cheap to re-score, monotone |
| Improve a reply until Jev's checks pass | yes | checks are textual; two rounds usually enough |
| Improve a Jev question until it predicts labels | yes, with a held-out set | the official autoresearch cookbook |
| Tune a prompt until an eval passes | yes, with a real eval | same loop; Jev can be the grader for textual rubrics |
| Make code pass tests | no, not with Jev as the oracle | tests are the oracle; Jev can only triage failures |
| Make a number, date or sum correct | no | Jev cannot check arithmetic |
| Make an image or video correct | no | Jev cannot see it |
| Decide a legal, medical or safety question | terminate, then a person | the loop can narrow; it must not decide |

So the honest statement is: **anything whose quality is a closed textual judgment can be looped to convergence cheaply; everything else needs its own oracle, and Jev sits beside it, not in its place.**

## Where this leads

Loop B is how a `kind` question grows from three categories to the ones your data actually has. Loop A is how every LLM output in a product gets a gate. Loop C is how the questions themselves get better. All three run on the same primitives from Lessons 1 to 8; the only new idea is that the stopping condition is a number Jev produced and code checked.
