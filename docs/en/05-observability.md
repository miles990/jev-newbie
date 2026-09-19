# Observability and verification

Because Jev never generates text, every call is fully inspectable: a state, a set of questions, a set of probabilities, a decision your code made. Make that visible and the model stops being a black box.

## The record

One JSONL line per call. This is what `bin/jev.mjs` and `examples/js/observe.mjs` write:

```json
{"at":"2026-09-19T12:00:00Z","cmd":"classify","label":"support","id":"3","model":"jev-1.13.0",
 "stateHash":"a1b2c3d4e5f6","statePreview":"{\"item\":\"系統又掛了！！\"}",
 "questions":{"q":{"type":"choice","instructions":"What does the writer mainly want?","criteria":{"bug":null,"billing":null}}},
 "answers":{"q":{"type":"choice","value":"bug","confidence":0.93,"probabilities":{"bug":0.95,"billing":0.05}}},
 "decision":"bug","latencyMs":312,"inputTokens":221}
```

Keep the state hash rather than the full state when the text is sensitive; keep the preview short.

## The viewer

`jev view` renders the log into `runs/report.html`: summary tiles (records, median latency, tokens, cost, model), a probability/confidence histogram, filters by label, a search box, and one row per call with bars for every answer and the code's decision as a pill. The 0.35 to 0.65 band is shaded on every bar.

How to read the histogram: answers piled at 0 and 1 mean the question is clear; a hump in the middle means the question or the data is ambiguous. Fix the question before touching thresholds.

## Verification

- **Golden set.** `jev check questions.json cases.jsonl` compares answers with labels you wrote. Read every miss; label ambiguity is a finding, not noise.
- **Regression on upgrade.** Pin the model; when a new version ships, re-run the golden set and diff the report.
- **Shadow mode.** For a gate, log the verdict for a week without acting on it, then look at what it would have blocked.
- **Cross-agent consistency.** When Claude Code and Codex share one `evaluate` MCP tool and one questions file, the same input gets the same judgment in both.

## A worked example

`showcase/observe-agent-avatar.html` is a dashboard built from 492 real calls in a production repo: a prompt gate over 273 generation prompts, tool-name routing for 55 tools, Chinese versus English routing of 30 user sentences, and clip tagging. Total cost US$0.016. Open it to see what "observable Jev" looks like at scale.
