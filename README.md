# jev-newbie

**English** · [繁體中文](README.zh-TW.md)

A hands-on starter kit for [TypeSafe Jev](https://typesafe.ai): what it can and cannot do, what to install so it works well with your coding agents, runnable examples, a foolproof `jev` command-line tool, and a viewer that shows exactly what Jev decided and why.

Jev is a *System One* model. You send it text or JSON **state** plus **typed questions**; it returns **typed answers with calibrated probabilities** in about 300 ms for about $0.00002 per call. It never generates text, so everything it does can be laid out on a table and checked.

```text
state (text or JSON) + questions (yes/no · pick one · rate) → probabilities → your code decides
```

## Tutorial

Eight ten-minute lessons, each with a runnable command and its real recorded output: [tutorial/README.md](tutorial/README.md). Start there if you have never used Jev.

## 60-second start

```sh
git clone https://github.com/miles990/jev-newbie && cd jev-newbie
export TYPESAFE_API_KEY=apikey_...        # https://console.typesafe.ai
./scripts/setup.sh                         # installs SDKs, the jev CLI, the MCP server for Claude Code / Codex, the skills
jev doctor
jev ask  "Is this a complaint?" --text "It broke again, third time this week"
jev pick "What does the user want?" --options greet,task,question,other --text "run the tests for me"
jev rate "How urgent?" --levels "can wait,today,within the hour" --text "prod is down, customers waiting"
jev view                                   # opens a report of every call you just made
```

Every command appends one line to `runs/jev-log.jsonl`: what went in, what came out, what the code decided, latency and tokens. `jev view` turns that into a page you can read and share.

## What is in here

| Path | What it is |
| --- | --- |
| `bin/jev.mjs` | Single-file, zero-dependency CLI: `ask` `pick` `rate` `filter` `classify` `run` `check` `view` `doctor` |
| `bin/view.html` | The report template `jev view` fills in (bilingual, light/dark) |
| `examples/curl` `examples/python` `examples/js` | The same first call in three languages, plus unknown-input filtering, speculative fan-out, and an audited wrapper |
| `examples/cli` | A question set, an item list and a golden test set for `jev run` and `jev check` |
| `scripts/setup.sh` `scripts/doctor.sh` | One-shot install and environment check |
| `skills/jev-workflow` | An agent skill that teaches Claude Code / Codex the workflow in this repo |
| `tutorial/` | Eight step-by-step lessons with real recorded outputs, in both languages |
| `docs/en` `docs/zh-TW` | Short guides: what Jev is, how to find use cases, reliability, tools, observability |
| `docs/en/15-competitors.md` | No direct competitor yet; substitutes by cost, labels and latency; the head-to-head results published so far |
| `docs/en/14-speed-and-computer-use.md` | Measured latency (1 vs 13 questions, sequential vs parallel) and how Jev drives browsers and desktops without seeing them |
| `docs/en/13-engineering-map.md` | Jev as a calibrated semantic oracle mapped onto every engineering discipline: where it plugs in, what it never replaces |
| `docs/en/10-monte-carlo.md` `11-multimodal.md` `12-features.md` | Jev with Monte Carlo (policy simulation, expected cost, bootstrap), around images/audio, and as a feature extractor with Fourier and other signal methods |
| `docs/en/09-converging-loops.md` | LLM proposes, Jev measures, code decides: three loops that converge, with a real 58% → 0% run |
| `docs/en/08-jev-with-an-llm.md` | Four positions for the seam between Jev and an LLM, with a runnable Jev → LLM → Jev pipeline |
| `docs/en/07-limits-and-caveats.md` | Hard limits, soft limits, calibration, language, service and design caveats, with sources |
| `docs/en/06-feature-coverage.md` | Every Jev API feature mapped to the CLI flag and example that exercises it, plus how the recorded outputs are reproduced |
| `docs/workspace-audit.md` | A real audit of ~60 projects: where Jev would replace fragile code, with file and line |
| `showcase/` | A published observability dashboard built from 492 real calls in a production repo |

## The three smells that mean "Jev fits here"

1. **`if`/`else` on strings.** Keyword tables, regex classifiers, tool-name suffix maps. Every new case means editing code.
2. **Free text that is shown but never acted on.** Agent messages, review notes, user input: printed on screen, ignored by logic.
3. **Hand-maintained category lists scattered across files.** Adding one item means touching six places.

Write the judgment as a closed question (`noul` for yes/no, `choice` for one of N with an `other` option, `score` for a degree), try it on twenty real items with `jev check`, then put the threshold in code. Full guide: [docs/en/02-find-use-cases.md](docs/en/02-find-use-cases.md).

## Filtering the unknown, not just the known

Jev's closed set constrains the **answer**, not the **input**. Inputs can be tools, messages or files it has never seen; the question stays fixed. New things show up as `other`, a flat distribution or low confidence, and code routes those to a human. Four patterns with examples: [docs/en/02-find-use-cases.md#the-unknown](docs/en/02-find-use-cases.md#the-unknown).

## The most reliable way to use Jev

Closed questions with a no-match option · a golden set of 20 to 30 labeled cases before trusting a threshold · three confidence bands (act / review / refuse) · gates that fail open · a log line for every call · a pinned model version. Details and the checklist: [docs/en/03-reliability.md](docs/en/03-reliability.md).

## Tools

| Tool | Why | Install |
| --- | --- | --- |
| `jev` (this repo) | Try any question from the shell, log everything, view it | `./scripts/setup.sh` |
| [typesafe-mcp](https://github.com/itsmostafa/typesafe-mcp) | One `evaluate` MCP tool shared by Claude Code, Codex and Claude Desktop | `evaluate setup mcp` |
| Official [TypeSafe skill](https://docs.typesafe.ai/agent-skill) | Gives your agent the full API knowledge | `claude plugin install typesafe@typesafe-ai` / `npx skills add typesafe-ai/skills` |
| `typesafe-sdk` / `@typesafe-ai/sdk` | Python and JavaScript clients with retries and types | `pip install typesafe-sdk` / `npm i @typesafe-ai/sdk` |
| [jev-guard](https://github.com/leepokai/jev-guard), [limpet](https://github.com/noplan-inc/limpet) | Ready-made tool-call safety gate and early-stop gate for coding agents | installed by setup, activated by you |

More, including what each one changes on your machine: [docs/en/04-tools.md](docs/en/04-tools.md).

## Reproducible, not made up

Every output shown in this repo was produced by a real call. `npm run verify` re-runs all examples with a pinned model and diffs them against `examples/expected/`; `jev check --strict` on the golden set is the hard pass/fail. See [docs/en/06-feature-coverage.md](docs/en/06-feature-coverage.md).

## What Jev does not do

Generate text · read images, audio or video · arithmetic · date comparison · invent new labels. Keep those in code, a vision model or an LLM. Jev's job is to pick, rate, and say yes/no with an honest probability.

## License

MIT
