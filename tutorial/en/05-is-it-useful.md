# Lesson 5: Which learning resource suits me?

You want to photograph everyday objects with your phone. Compare tutorials and advertisements by relevance, practical exercises, beginner suitability, and whether they are mainly sales pitches.

This first JavaScript example needs dependencies installed once:

```sh
npm ci
node examples/js/usefulness.mjs
```

It reads the [candidate resources](../../examples/usefulness/candidates.jsonl) and [questions](../../examples/usefulness/usefulness.questions.json), evaluates each item, prints a ranking, and saves answers to `runs/usefulness-results.json`. The sample resources are in Chinese; replace them with your own language if preferred.

The combined 0–1 score is a weighted ranking, not a probability of usefulness or proof that a tutorial is correct.

To change preferences, edit `W` in [usefulness.mjs](../../examples/js/usefulness.mjs), then run:

```sh
node examples/js/usefulness.mjs --reuse
```

`--reuse` loads saved answers without API calls. Without it, the script evaluates again. Changed inputs, questions, or an explicitly selected model require fresh evaluation. Weights are normalized automatically.

Exercise: increase relevance, then practical-exercise weight, and compare rankings. An unchanged ranking is a valid outcome.

Next: [Process several messages](06-batches.md)
