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

## Where this leads

Loop B is how a `kind` question grows from three categories to the ones your data actually has. Loop A is how every LLM output in a product gets a gate. Loop C is how the questions themselves get better. All three run on the same primitives from Lessons 1 to 8; the only new idea is that the stopping condition is a number Jev produced and code checked.
