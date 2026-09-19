# 第 9 課：未知事物，以及放進你的程式碼

*第三部分。到目前為止都假設你知道會看到哪些種類的東西。你永遠不會完全知道。*

## 情境

一則法院通知。一張學校回條。一個加密貨幣「空投」。一行壞掉的整合吐出來的二進位垃圾。這些都不在你的 `kind` 選項裡，而且下個月還會有新的。同時，你第 3 課寫的正規表達式過濾器還在手機上跑，你同事在一個真實程式碼庫的三個地方有同樣的形狀。

**原因：** 封閉的選項清單感覺處理不了新東西；而且知道技巧不等於換掉了程式碼。**這一課改變什麼：** 你看到未知以 `other` 與低信心浮現，你換掉一段真實的 `if`／`else`，其餘交給裝了 skill、照第 3 到 8 課做的 coding agent。

**目標：** 篩選你從沒見過的東西，然後真的換掉一段脆弱的程式碼。

## A 部分：未知

```sh
.venv/bin/python examples/python/unknown_filter.py
```

六則訊息進去；沒有一則事先列舉過。問題固定，輸入不固定。

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

注意未知怎麼浮出來。學校通知不合任何選項，所以 `other` 勝出、程式碼拿給你看：這就是該新增 `school` 類別的訊號。法院通知被吸進 `appointment`，並帶著「自稱官方」的旗標，今天要看一眼已經夠用。二進位垃圾被另一題「這到底是不是訊息」擋掉。Jev 的封閉集合限制**答案**，從不限制**輸入**。它做不到的是替新類別命名；那是你或 LLM 的事，而且是在 Jev 把整堆篩到剩幾個值得命名的之後。

未知浮現的四種方式都在 [docs/zh-TW/02-find-use-cases.md](../../docs/zh-TW/02-find-use-cases.md#未知)：固定問題對未知輸入；`other` 加低信心；一次問很多屬性的投機式廣撒；用 state 裡的例子取代命名的類別。

## B 部分：換掉一段字串 `if`／`else`

這是大多數程式碼裡都會找到的形狀（來自一個真實專案）：

```js
if (["read","read_file","view_image"].includes(name)) return "reading";
if (["search","grep","glob"].includes(name) || name.startsWith("search_")) return "searching";
return "tool";
```

用 55 個真實工具名稱實測，它對 31 個；一個 Jev `choice` 對 50 個，五個沒中的都站得住腳。換法：

```js
const r = await client.systemOne({ state: { tool_name: name }, questions: { kind: choice(
  "Judging from the name only, what kind of work does an AI coding agent do with this tool?",
  { editing: "creates or modifies files", reading: "reads without changing", searching: "searches files or the web",
    command: "runs a shell command", tool: "cannot tell from the name" }) } });
return r.answers.kind.confidence < 0.5 ? "tool" : r.answers.kind.choice;
```

然後照第 7、8 課做：用你實際會看到的名稱做黃金測試集、以請求雜湊快取（相同名稱不會花第二次）、釘住模型、每次呼叫一行 log。

## C 部分：讓你的 agent 來做

用 `scripts/setup.sh` 設定過的機器上，Claude Code 與 Codex 都有 `evaluate` MCP 工具和 `jev-workflow` skill。在你的 repo 開一個 session，說：

```text
Using the jev-workflow skill, find string if/else, keyword tables and
"call an LLM then parse a label" steps in this codebase, propose Jev
questions for the top three, and prove them with a golden set.
```

這個 skill 會讓 agent 先寫問題檔、跑 `jev check`、把政策集中一處、留下 log。`docs/workspace-audit.md` 就是它在六十個真實專案上產出的結果。

## 接下來

- [docs/zh-TW/03-reliability.md](../../docs/zh-TW/03-reliability.md)：十個習慣與上線前清單。
- [docs/zh-TW/06-feature-coverage.md](../../docs/zh-TW/06-feature-coverage.md)：每個 API 功能與本套件對應的用法。
- <https://docs.typesafe.ai/cookbooks>：重排、引用檢查、guardrail、function calling、結構還原。
