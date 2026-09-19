# jev-workflow

**The delivery procedure for putting a Jev judgment into a codebase.** One sentence: *the official skill tells an agent how to call Jev; jev-workflow tells it how to ship a Jev decision it can defend.*

**把 Jev 判斷放進程式碼庫的交付程序。** 一句話：*官方 skill 教 agent 怎麼呼叫 Jev；jev-workflow 教它怎麼交付一個站得住的 Jev 決策。*

## Where it sits · 它在堆疊裡的位置

```text
knowledge   官方 typesafe-ai skill      what the API is, primitives, patterns          知識
plumbing    typesafe-mcp `evaluate`     how the agent reaches Jev                      管線
design      Augustus                    whether and where a judgment belongs (theory)  設計
delivery    jev-workflow  ◀ this        the order of operations from smell to shipped  交付
runtime     jev-judgment                the agent using Jev on its own turns           執行期
```

Install all of the top four together; they do not overlap. 四個一起裝，互不重疊。

## For whom · 給誰

A person who owns a codebase and says to Claude Code or Codex: "replace this regex / keyword table / LLM-then-parse step with Jev". The skill makes the agent produce a questions file, a golden set, a single policy, a log and a report, instead of a clever one-off prompt. 給擁有一個程式碼庫、對 agent 說「把這段換成 Jev」的人。skill 讓 agent 產出問題檔、黃金測試集、單一政策、log 與回報，而不是一次性的聰明 prompt。

## The six steps · 六步

1. find the smell, name the decision 找味道、命名決策
2. questions file first 先寫問題檔
3. golden set before threshold 先黃金測試集再門檻
4. policy in one place, three confidence bands 政策集中一處、三段信心
5. safety defaults: cache, fail-open, pinned model, minimal state, JSONL log 安全預設
6. report what was replaced, with numbers 附數字回報

Full text and the "do not" list: [SKILL.md](SKILL.md). The same order is taught to people in [`tutorial/`](../../tutorial/README.md).

## Install · 安裝

```sh
npx skills add miles990/jev-newbie --skill jev-workflow -g -a '*'
```

Trigger words: "use jev", "用 jev", "jev-newbie", or name the skill.
