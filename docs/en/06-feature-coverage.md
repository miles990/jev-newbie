# Feature coverage: every Jev capability and where this kit exercises it

Source of truth: <https://docs.typesafe.ai/api> and <https://docs.typesafe.ai/primitives>. Reviewed 2026-09-19 against `jev-1.13.0`.

| API feature | What it is | `jev` CLI | Examples |
| --- | --- | --- | --- |
| `noul` question | probability that a yes/no condition holds | `ask`, `filter` | all quickstarts, `unknown_filter.py`, `fanout_profile.py` |
| `noul` criteria (`true`/`false` descriptions) | say what a yes and a no mean | `--yes "..." --no "..."` on `ask` and `filter` | `examples/cli/support.questions.json` (add `criteria`) |
| `choice` question | one option from a closed set; probabilities + confidence | `pick`, `classify` | quickstarts, `unknown_filter.py`, `observe.mjs` |
| `choice` option descriptions (`criteria` map) | rubric per option, `null` when none | `--options "a:desc,b:desc"` | `support.questions.json` |
| `score` question | probability-weighted position on ordered levels; legend + confidence | `rate` | quickstarts, `fanout_profile.py`, `support.questions.json` |
| Many questions per request (parallel) | fan-out; latency ≈ one question | `run`, `check` | `fanout_profile.py`, `support.questions.json` |
| Structured `instructions` / `criteria` (objects, arrays) | JSON structure instead of strings | via `run`/`check` question files (any JSON accepted) | write it in `<name>.questions.json` |
| JSON `state` (object or array) | named fields, records, conversations | `--json '{...}'`, `.jsonl` item files | `quickstart.py` (`account_tier`), `unknown_filter.py` |
| String `state` | plain text | `--text`, `--file`, stdin | `first-call.sh` |
| `model` selection, aliases, pinning | `jev-latest`, `jev-preview`, `jev-1.13.0` | `--model`, `JEV_MODEL` | `verify-examples.sh` pins `jev-1.13.0` |
| `GET /v1/models` | list what your key can use | `models` | `doctor` |
| `confidence` on choice/score | distribution concentration | shown; `--min-conf` gate | three-band policy in `quickstart.*` |
| `probabilities` per option/level | full distribution | shown on `pick`, `rate`, in `view` | logged on every call |
| `usage.input_tokens` | cost accounting | logged; summed in `view` | `observe.mjs` |
| Rate limits (429 / 529) | back off and retry | built into `systemOne()` | SDKs retry by default |
| Errors (401 / 422) | key and validation failures | reported with body excerpt | `doctor` |
| Jev + LLM pipeline | gate → draft → verify → retry | not in CLI | `examples/js/jev-then-llm.mjs` (Anthropic SDK or `claude -p`) |
| LLM → Jev converging loop | propose → re-score whole set → monotone accept → stop | not in CLI | `examples/js/llm-then-jev-loop.mjs` |
| SDKs | Python and JavaScript clients | not used by the CLI (raw fetch) | `examples/python`, `examples/js` |
| MCP tool for agents | `evaluate` via typesafe-mcp | `scripts/setup.sh` | `docs/en/04-tools.md` |
| Agent skill | official `typesafe-ai` + this repo's `jev-workflow` | `scripts/setup.sh` | `skills/jev-workflow/SKILL.md` |

Not features of Jev, so not here: text generation, image input, arithmetic, dates. See [01 What Jev is](01-what-jev-is.md).

## Reproducibility

Every number and every sample output in this repo came from real calls. `scripts/verify-examples.sh` re-runs all examples with `JEV_MODEL=jev-1.13.0` and diffs against `examples/expected/*.txt`, which were recorded the same way (`--record`). Labels are stable across runs; probabilities can move by a few hundredths, so differences are shown for review rather than failed. The hard check is the golden set: `jev check --strict`.

One case in `examples/cli/support.cases.jsonl` deliberately carries no `intent` expectation: "make this SQL use an index, it takes 40 s" was labeled `bug` by us and `feature` by Jev at confidence 0.71. Both readings are defensible, which is exactly the kind of label ambiguity a golden set is meant to surface; we kept the case and dropped the ambiguous expectation rather than bend either side.
