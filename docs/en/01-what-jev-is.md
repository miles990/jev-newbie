# What Jev is

Jev is TypeSafe AI's first *System One* model. Instead of generating text, it evaluates a piece of **state** against **typed questions** and returns **typed answers with calibrated probabilities**. It was trained with reinforcement learning for calibrated decisions, so a 0.9 means roughly "right nine times in ten" on the kind of task it was built for.

## The three primitives

| Question | Returns | Use when |
| --- | --- | --- |
| `noul` | probability that the answer is yes, 0 to 1 | a condition either holds or not |
| `choice` | the chosen option, a probability per option, a confidence | exactly one of a defined set applies; always include `other` or `none` |
| `score` | a probability-weighted position on ordered levels, a confidence | a degree along one dimension whose levels you can describe |

Ask several independent questions over the same state in one request. They run in parallel, so ten questions cost about the same latency as one.

## What it is good at

Classification, routing, ranking, relevance, verification, gating, extraction by selection (pick which candidate span is the value), and any place where code needs common sense about a piece of text.

## What it does not do

- **Generate text.** No summaries, no explanations, no names for new categories.
- **See images, audio or video.** Text and JSON only. Preprocess other media into text or structured fields first.
- **Arithmetic, counting, date comparison.** Compute in code, then pass the result or a named bucket.
- **Read your mind.** It answers the question you wrote, literally. If a wrong answer makes you say "what I meant was...", that sentence belongs in the instructions.

## Jev, an LLM, and an AI agent: what is the difference?

| | LLM (GPT, Claude, Gemini…) | AI agent (Claude Code, Codex, a chatbot) | Jev |
| --- | --- | --- | --- |
| Produces | text, code, plans | actions: runs tools, edits files, sends messages | a typed judgment with a probability |
| Best at | explaining, writing, reasoning step by step, naming new things | doing multi-step work with a person in the loop | deciding one narrow thing fast and consistently |
| Speed / cost per call | seconds, cents | many LLM calls per task | ~300 ms, ~$0.00002 |
| Can it be wrong in shape? | yes: prose to parse, JSON that does not validate | yes: takes an action you did not want | no: the answer is always one of your options, but it can still be *wrong* |
| Tells you how sure it is | rarely, and not calibrated | no | always, and calibrated |
| Sees images, generates text | yes / yes | yes / yes | no / no |

**Not a replacement. A division of labor.** An LLM writes; an agent acts; Jev judges. The reliable shape people are converging on:

- **Jev in front of the LLM**: decide whether the request needs the expensive model at all, which model, and whether the input is safe (routing, guardrails). Most turns never reach the LLM.
- **Jev inside the agent loop**: before a tool runs, "is this destructive?"; after it returns, "is this output relevant?"; before the agent stops, "is it actually done?". Cheap enough to run on every step.
- **Jev after the LLM**: verify the LLM's claim, citation or label against the evidence, and only escalate the failures to a person.
- **LLM after Jev**: when Jev says `other` or low confidence, the LLM names the new category or writes the explanation Jev cannot.

In this repo, Lessons 1 to 8 are Jev alone; Lesson 9 is Jev handing work to an agent and an agent using Jev as its judge.

## Numbers to keep in mind (September 2026)

- Price: $0.042 per million input tokens, output free. A typical call is a few hundred tokens.
- Latency: about 250 to 600 ms end to end from Taiwan; TypeSafe quotes 70 to 500 ms.
- Context: 64k tokens per request, 32k for the state plus the longest question.
- Language: English is best. Chinese works; in our tests Chinese user messages routed as accurately as their English translations, but test on your own data.
- Model alias `jev-latest` moves between releases. Pin `jev-1.13.0` when thresholds matter and log the `model` field every response carries.

Read next: [02 Find use cases](02-find-use-cases.md) · Official docs: <https://docs.typesafe.ai>
