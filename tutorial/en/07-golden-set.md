# Lesson 7: the golden set

## Scenario

You ran `classify` on 300 notifications and the labels look plausible. Then you notice the ad marked "today" and wonder what else is quietly wrong. You have no way to answer "how right is it?" except reading all 300 again.

**Cause:** "looks right" is not a measurement, and half of the disagreements are decisions you never made (is a landlord's reminder a bill? is a deadline in an ad urgent?). **What this lesson changes:** you label twenty real messages yourself and let `jev check` measure the questions against them, so every miss becomes either a fix or a decision.

**Goal:** stop trusting a question because it "looks right"; measure it against labels you wrote.

## Do

```sh
jev check examples/cli/inbox.questions.json examples/cli/inbox.cases.jsonl
```

Each case in the `.jsonl` is `{"state": {"item": "..."}, "expect": {"kind": "bill", "needs_reply": false}}`. Only the keys you list are checked.

## What you should see

```text
kind                   8/8 (100%)
needs_reply            5/5 (100%)
asks_to_click_or_login 5/5 (100%)
urgency                1/1 (100%)

19/19 expectations met across 8 cases.
```

## The story behind one missing expectation

The ad case ("30% off, only until midnight!") has no `urgency` expectation. When it did, we expected 0 and Jev answered 2 with confidence 0.98. Jev is right about the words: there is a deadline tonight. We are right about the world: ads are never urgent to us. That is not a model error and not a label error. It is a **policy**, and policies live in code (Lesson 8), so we removed the expectation and wrote the rule where it belongs.

That is what a golden set is for. Your misses will sort into three piles:
1. **The model is wrong.** Rewrite the question; add the boundary case to the criteria.
2. **Your label is ambiguous.** Decide, then write the decision into the criteria.
3. **It is a policy, not a judgment.** Move it to code.

## The routine

1. Collect 20 to 30 real inputs. Real, not invented; invented ones are always easier than life.
2. Label them yourself. Only label what you are sure about.
3. `jev check`. Read every miss. Sort it into one of the three piles.
4. Only now choose thresholds (next lesson). Re-run the set whenever the question, the criteria or the model version changes. `--strict` makes it fail a script or CI.

## Exercise

Write eight cases for the question you built in Lesson 6. Expect at least one miss. Decide which pile it is in.

Next: [Lesson 8: policy in code and watching the log](08-policy-and-observability.md)
