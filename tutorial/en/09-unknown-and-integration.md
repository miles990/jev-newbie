# Lesson 9: the unknown, and into your codebase

*Part 3. Everything so far assumed you knew the kinds of things you would see. You never fully do.*

## Scenario

A court notice. A school permission slip. A crypto "airdrop". A line of binary garbage from a broken integration. None of these were in your `kind` options, and next month there will be new ones. Meanwhile, the regex filter you wrote in Lesson 3 is still running on your phone, and a colleague has the same shape in three places of a real codebase.

**Cause:** closed option lists feel like they cannot handle the new; and knowing the technique is not the same as having replaced the code. **What this lesson changes:** you see the unknown surface as `other` and low confidence, you replace one real `if`/`else`, and you hand the rest to your coding agent with a skill that follows Lessons 3 to 8.

**Goal:** filter things you have never seen, then replace one piece of fragile code for real.

## Part A: the unknown

```sh
.venv/bin/python examples/python/unknown_filter.py
```

Six messages go in; none was enumerated in advance. The questions are fixed; the inputs are not.

```text
bill                                         conf=0.98
    ← 這個月房租記得在 5 號前匯，謝謝。
scam                                         conf=1.00
    ← Your account was used to sign in on a new device…
appointment                                  conf=0.90  ⚑ claims to be official
    ← 法院通知：您有一件民事調解案件，請於 10/3 上午九時到場。
scam                                         conf=1.00
    ← 恭喜！您被選中領取 0.5 BTC 空投，請連接錢包領取。
NEW KIND → show me, I may need a new category conf=0.87  ⚑ claims to be official
    ← 家長您好，下週三校外教學請攜帶水壺與雨具，回條請於週一交回。
NOT A MESSAGE → ignore                       conf=0.87
    ← \x00\x1f\x8b\x08\x00binary-blob-000
```

Notice how the unknown surfaces. The school notice does not fit any option, so `other` wins and code shows it to you: that is the signal to add a `school` category. The court notice was absorbed into `appointment` with a flag that it claims to be official, which is good enough to be looked at today. The binary blob failed a separate "is this even a message?" question. Jev's closed set constrains the **answer**, never the **input**. What it cannot do is name the new category; that is where you, or an LLM, come in, after Jev has filtered the pile down to the few worth naming.

Four ways the unknown shows up, all in [docs/en/02-find-use-cases.md](../../docs/en/02-find-use-cases.md#the-unknown): a fixed question over unknown input; `other` plus low confidence; a speculative fan-out of many properties; examples in the state instead of named categories.

## Part B: replace a string `if`/`else`

This is the shape you will find in most codebases (it is from a real one):

```js
if (["read","read_file","view_image"].includes(name)) return "reading";
if (["search","grep","glob"].includes(name) || name.startsWith("search_")) return "searching";
return "tool";
```

Measured on 55 real tool names it was right 31 times; one Jev `choice` was right 50 times, and its five misses were all defensible. The replacement:

```js
const r = await client.systemOne({ state: { tool_name: name }, questions: { kind: choice(
  "Judging from the name only, what kind of work does an AI coding agent do with this tool?",
  { editing: "creates or modifies files", reading: "reads without changing", searching: "searches files or the web",
    command: "runs a shell command", tool: "cannot tell from the name" }) } });
return r.answers.kind.confidence < 0.5 ? "tool" : r.answers.kind.choice;
```

Then do what Lessons 7 and 8 taught: a golden set of the names you actually see, a cache keyed by request hash (identical names never cost twice), a pinned model, one log line per call.

## Part C: let your agent do it

Both Claude Code and Codex on a machine set up by `scripts/setup.sh` have an `evaluate` MCP tool and the `jev-workflow` skill. Start a session in your repo and say:

```text
Using the jev-workflow skill, find string if/else, keyword tables and
"call an LLM then parse a label" steps in this codebase, propose Jev
questions for the top three, and prove them with a golden set.
```

The skill makes the agent write the questions file first, run `jev check`, keep the policy in one place, and leave the log behind. `docs/workspace-audit.md` shows what that produced across sixty real projects.

## Where to go next

- [docs/en/03-reliability.md](../../docs/en/03-reliability.md): the ten habits and the pre-ship checklist.
- [docs/en/06-feature-coverage.md](../../docs/en/06-feature-coverage.md): every API feature and where this kit exercises it.
- <https://docs.typesafe.ai/cookbooks>: reranking, citation checks, guardrails, function calling, structure recovery.
