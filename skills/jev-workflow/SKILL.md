---
name: jev-workflow
description: Add a TypeSafe Jev judgment to a codebase the reliable way. Use when replacing string if/else, keyword tables, regex classifiers, "call an LLM then parse a label" steps, or hand-maintained category lists with a typed decision; when gating agent actions or asset pipelines; or when the user says "use jev", "用 jev", "jev-newbie". Requires TYPESAFE_API_KEY. Pairs with the official typesafe-ai skill (API knowledge); this skill is the workflow.
---

# jev-workflow

Code owns control flow. Jev supplies one narrow judgment at a time, with a probability. This skill is the order of operations that keeps that reliable. Read the official `typesafe-ai` skill for API details; use the `evaluate` MCP tool or the `jev` CLI to try questions.

## 1. Find the smell, name the decision

Look for: `includes(`/`startsWith(`/regex on free text that picks a branch; keyword tables; `JSON.parse` of an LLM reply where only a label survives; category lists duplicated across files; free text that is displayed but never acted on. Write one sentence: "At <file:line> the code decides <X> from <text>." If <X> needs generated text, arithmetic or dates, stop: not a Jev job.

## 2. Write the questions file first

`<name>.questions.json` with `{"questions": {...}}`. Rules:
- one judgment per question; split compound ones
- every `choice` has `other`/`none`; every `score` level describes a concrete situation
- instructions state the literal condition and the boundary cases; name state fields with backticks
- English instructions even for Chinese data; keep the data as-is
- speculative questions are fine: ask what a later branch might need, in the same request

## 3. Golden set before threshold

Collect 20 to 30 real inputs as `<name>.cases.jsonl` (`{"state":..., "expect":{...}}`), label them yourself, run:

```sh
jev check <name>.questions.json <name>.cases.jsonl
```

Read every miss. Fix the question when the model is wrong; fix the label when it is ambiguous; only then choose thresholds. Aim for the accuracy the branch needs, not 100%.

## 4. Policy in one place

In code, one function turns answers into a decision with three bands: high confidence acts, the middle band is `review`, low confidence refuses or escalates. Keep thresholds and the questions file next to each other. Nothing about the model lives anywhere else.

## 5. Integrate with the safety defaults

- cache by request hash
- gates fail open on missing key, timeout, 429; log once, never block on infrastructure errors
- pin `jev-1.13.0` (or the current version) where thresholds matter; log the `model` field
- never send secrets or whole transcripts; send the minimum state the question needs
- log one JSONL line per call (state hash, questions, answers, decision, latency, tokens) and open it with `jev view` at least once

## 6. Report

Say what was replaced (file:line), the questions, golden-set accuracy, thresholds, and what the log showed. Leave the questions file, the cases file and the log path in the repo.

## Do not

- ask Jev to count, add, compare dates, or read images
- ask it for a label that is not in the criteria
- use a `choice` without an escape option
- ship a threshold you did not measure
- put the API key in the browser or in a committed file

---

## 中文速覽

1. **找味道、命名決策**：字串 if/else、關鍵字表、正規表達式分支、只留標籤的 LLM 呼叫、散落的分類清單、顯示了沒用的自由文字。要生成文字、算數、比日期的不是 Jev 的工作。
2. **先寫問題檔** `<name>.questions.json`：一題一個判斷；`choice` 一定有 `other`；`score` 每級描述具體情境；指令用英文寫清楚條件與邊界。
3. **先黃金測試集再門檻**：二三十筆真實資料自己標，`jev check` 跑，每個沒中的都看。
4. **政策集中一處**：三段信心（執行／待審／拒絕），門檻與問題檔放在一起。
5. **安全預設**：請求快取、關卡失敗放行、釘住模型並記錄、只送必要的 state、每次呼叫一行 JSONL 並用 `jev view` 看過。
6. **回報**：換掉了什麼、問題、命中率、門檻、log 顯示什麼。
