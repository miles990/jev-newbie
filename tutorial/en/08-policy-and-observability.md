# Lesson 8: Turn judgments into suggestions and logs

Your code decides how to use model answers. This example sends uncertain categories for review and records successful calls.

```sh
npm ci
node examples/js/observe.mjs
node bin/jev.mjs view
```

It processes three messages, writes `runs/jev-log.jsonl`, and produces `runs/report.html`. It only prints suggestions; it does not operate your inbox.

The demonstration policy in [observe.mjs](../../examples/js/observe.mjs) is:

```js
const policy = (a) => a.kind.confidence < 0.5 ? "clarify" : a.kind.confidence < 0.8 ? "review" : a.kind.choice;
```

Below 0.5 asks for context; 0.5 to below 0.8 requests review; at least 0.8 displays the category. These thresholds have not been validated on your data. Do not use them directly for deletion, payments, or blocking.

Whether advertisements always go to promotions is your policy. A deadline in an advertisement does not necessarily create an obligation for you.

Reports expose answers and decisions, not internal reasoning. Concentrated histograms do not prove accuracy. Running this example again calls the API even if only the policy changed; offline reuse requires loading saved answers, as implemented in lesson 5.

Logs contain text previews. Check their contents before sharing.

Next: [Unknown inputs and help from an AI assistant](09-unknown-and-integration.md)
