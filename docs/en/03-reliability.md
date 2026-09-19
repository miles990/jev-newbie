# Reliability: measure before acting

Typed answers constrain format, not semantic correctness. Confidence measures concentration, not observed accuracy.

1. Ask one clear question at a time and provide relevant context. Include other for open-ended inputs.
2. Label examples manually and retain boundary cases and failures. The eight bundled cases are teaching data.
3. Separate tuning data from held-out evaluation. Do not delete failures to obtain a perfect score.
4. Measure accuracy, review rate, false acceptance, and false rejection; choose thresholds by consequences.
5. Record model version, questions, inputs, and policy. Reevaluate after model changes.
6. Choose failure behavior by task. Optional ranking can fall back; failed authorization, payment, or deletion checks should stop or request review, not universally fail open.
7. Bound timeouts, concurrency, and retries. First record suggestions without acting, then assess integration.

## What this project implements

The CLI has per-attempt timeouts, bounded batch concurrency, limited 429/529 retries, and successful-call logs. It is not a production service framework and has no generic request cache. stateHash is for records, not avoiding subsequent calls.

Lesson 5's `usefulness.mjs --reuse` explicitly reloads saved answers for offline ranking. A custom cache must include full state, questions, and model version and invalidate when they change.

Sources: [confidence](https://docs.typesafe.ai/confidence), [API errors](https://docs.typesafe.ai/api).
