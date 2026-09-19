# Lesson 7: Check against labeled answers

A plausible label is not a measured accuracy rate. Prepare examples with answers you have checked yourself—a golden set.

```sh
node bin/jev.mjs check examples/cli/inbox.questions.json examples/cli/inbox.cases.jsonl
```

Each [case](../../examples/cli/inbox.cases.jsonl) contains state and expected answers:

```json
{"state":{"item":"Dinner Saturday. Please confirm you can come."},"expect":{"kind":"invite","needs_reply":true}}
```

Expected keys must exist in the questions file. Use JSON booleans for yes/no, option names for choice, and integer levels for scores. Only listed expectations are graded.

The included set has eight cases: enough to demonstrate operation, not to establish production accuracy. Low confidence is reported separately and alone does not fail strict mode.

```sh
node bin/jev.mjs check examples/cli/inbox.questions.json examples/cli/inbox.cases.jsonl --strict
```

Strict mode fails on mismatches. Empty sets, malformed labels, and missing answers also fail. Yes/no grading uses greater than 0.5, unlike the three-band display in ask.

Inspect disagreements: unclear question, incorrect label, or model error? Do not remove failures just to make the score perfect. Document changed meanings and retain unseen evaluation data after tuning.

Exercise: start with 20–30 examples, including ambiguous and out-of-category inputs. That count is a starting point; required evidence depends on risk and the real distribution.

Next: [Turn judgments into suggestions and logs](08-policy-and-observability.md)
