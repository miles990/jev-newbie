# What logs and reports show

Successful CLI judgments and `examples/js/observe.mjs` share a report schema, normally saved to `runs/jev-log.jsonl`: time, model, input preview/hash, questions, answers, decision, latency, and tokens.

```sh
node bin/jev.mjs view
node bin/jev.mjs view runs/jev-log.jsonl --no-open
```

The first tries to open the report; the second only writes HTML. JEV_LOG changes the log location, with the report generated beside it.

Only the first 160 input characters and a hash are stored, so the log cannot fully replay original requests. Previews can contain sensitive information. Failed CLI calls currently report errors rather than a complete failure event log.

The histogram combines yes/no probabilities and Choice/Score confidence. It is exploratory, not a calibration chart or accuracy proof. Concentration can reflect confident errors. Accuracy requires labeled outcomes.

Cost is an estimate using a historical rate, not a bill. Dedicated LLM pipeline logs have a different schema and are not inputs to view.

The [showcase](../../showcase/README.md) preserves a historical report, not validation of the current version.
