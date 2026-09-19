# Commands, examples, and validation

Run commands as `node bin/jev.mjs` from the project root.

| Command | Purpose |
| --- | --- |
| `ask "question" --text "text"` | Yes/no; optional --yes and --no criteria |
| `pick "question" --options "a,b,other" --text "text"` | Choice; a:description adds a rubric |
| `rate "question" --levels "low,medium,high" --text "text"` | Ordered score |
| `filter items.txt "question"` | Display all and mark matches; --only-kept emits matching input |
| `classify items.txt "question" --options "a,b,other"` | Classify a batch |
| `run questions.json items.txt` | One request per item, several questions per request |
| `check questions.json cases.jsonl --strict` | Fail on label mismatches |
| `view [log.jsonl] --no-open` | Generate HTML |
| `doctor` / `models` | Connectivity / available models |

Use one of --text, --file, --json, or stdin. Text/file input is wrapped as {text: ...}; each JSONL value becomes the whole state. --min sets the filter cutoff; --min-conf sets Choice review and check's low-confidence reporting threshold.

Common flags include --model and --label; batch --concurrency defaults to 4 (maximum 32); per-attempt --timeout defaults to 30000 ms. Model defaults to JEV_MODEL or jev-latest; log defaults to JEV_LOG or runs/jev-log.jsonl.

## Separate validation layers

- npm test: offline regression tests with a mock API, not model accuracy.
- npm run verify: requires a key and JS/Python dependencies; calls the real API, compares selected historical outputs, runs updated examples, and checks two case sets. Drift or a different model can fail comparisons.
- npm run verify -- --record: updates selected expected outputs only after the whole run succeeds. Failures are not promoted to new baselines.

Historical comparisons allow numeric drift of 0.15 while retaining text structure and numeric positions. This is output regression tolerance, not accuracy or calibration evaluation. Superseded recordings live in examples/recorded-legacy, not as current results.

Advanced LLM, Monte Carlo, feature, and latency examples are not all covered by verify. Consult each guide before running. See the [official API](https://docs.typesafe.ai/api) for the service contract.
