# Tutorial · 教程

Ten short lessons (0 to 9), each with a command to run, the real output it produced (model `jev-1.13.0`, 2026-09-19), what to notice, and an exercise. Start at 1; each takes about ten minutes.

十課（0 到 9），每課一個可跑的指令、它真實產生的輸出（模型 `jev-1.13.0`，2026-09-19）、該注意什麼、一個練習。從第 1 課開始，每課約十分鐘。

Three parts, in the order needs actually arrive · 三部分，依需求出現的順序：

**Part 1 · General needs 通用需求** — things everyone has, in any country: sort your own inbox, decide whether something is worth your time.
**Part 2 · Specific needs 特定需求** — your own data and your own labels: batches, a golden set, a policy, a log.
**Part 3 · Unknown needs 未知需求** — inputs nobody anticipated, and handing the method to your coding agent.

| # | English | 繁體中文 | Part |
| --- | --- | --- | --- |
| 0 | [Before you start](en/00-before-you-start.md) | [開始之前](zh-TW/00-before-you-start.md) | 1 |
| 1 | [Your first call](en/01-first-call.md) | [第一次呼叫](zh-TW/01-first-call.md) | 1 |
| 2 | [Three kinds of question](en/02-three-question-types.md) | [三種問題](zh-TW/02-three-question-types.md) | 1 |
| 3 | [Writing a question the model can answer](en/03-writing-questions.md) | [寫出模型答得了的問題](zh-TW/03-writing-questions.md) | 1 |
| 4 | [State and context](en/04-state-and-context.md) | [state 與脈絡](zh-TW/04-state-and-context.md) | 1 |
| 5 | [Is this useful to me?](en/05-is-it-useful.md) | [這對我有用嗎？](zh-TW/05-is-it-useful.md) | 1 |
| 6 | [Your own data, in batches](en/06-batches.md) | [你自己的資料，批次處理](zh-TW/06-batches.md) | 2 |
| 7 | [The golden set](en/07-golden-set.md) | [黃金測試集](zh-TW/07-golden-set.md) | 2 |
| 8 | [Policy in code and watching the log](en/08-policy-and-observability.md) | [程式碼裡的政策與看 log](zh-TW/08-policy-and-observability.md) | 2 |
| 9 | [The unknown, and into your codebase](en/09-unknown-and-integration.md) | [未知事物，以及放進你的程式碼](zh-TW/09-unknown-and-integration.md) | 3 |

## One story · 一條情境貫穿

The lessons follow one thing everybody has: an inbox of bills, scams, invitations and family messages. Every sample message is region-neutral and every quoted output is real. Each lesson opens with the problem, the cause, and what the new capability changes, so nothing is introduced without a reason.

所有課跟著每個人都有的同一樣東西走：一個裝著帳單、詐騙、邀約與家人訊息的收件匣。每則範例訊息都不綁地區，每段引用的輸出都是真的。每課開頭先講問題、原因、這個新能力改變了什麼，沒有一個功能是憑空出現的。

## Jev's capabilities, by the problem each one solves · 功能對照問題

| Capability 功能 | The problem it answers 它解決的問題 | Lesson |
| --- | --- | --- |
| `noul` yes/no probability 是非機率 | "Is this X?" decided by a keyword match that misses paraphrase 關鍵字比對漏掉換句話說 | 1, 2 |
| `choice` one-of-N with probabilities + confidence 單選加機率與信心 | routing by `if`/`else` on strings, no idea how sure it is 用字串 if/else 分流、不知道多確定 | 1, 2, 4 |
| `score` on ordered levels 有序等級的程度 | "how urgent / how useful" squeezed into match-or-not 程度被壓成對到或沒對到 | 1, 2, 5 |
| option descriptions & criteria 選項描述與準則 | the model picks the wrong option because names alone are ambiguous 光有名字太模糊 | 3 |
| one judgment per question 一題一判斷 | a compound question returns a confident wrong average 複合問題回自信的錯誤平均 | 3 |
| JSON `state` with named fields 具名欄位的 state | the right answer depends on facts the message does not contain 正確答案取決於訊息裡沒有的事實 | 4 |
| composite scoring 複合評分 | "is this useful?" is really five judgments with weights you should control 「有用嗎」其實是五個判斷加你該掌控的權重 | 5 |
| many questions per request, parallel 一次多題平行 | a backlog of hundreds; a follow-up question would need a second round trip 積壓成百上千、追問要再一趟 | 5, 6 |
| calibrated probabilities 校準機率 | you need to trust 0.9 means 0.9 before automating 自動化前得相信 0.9 就是 0.9 | 7 |
| golden set (`jev check`) 黃金測試集 | "looks right" is not evidence; label disagreements are undecided policy 看起來對不是證據 | 7 |
| confidence bands in code 程式碼裡的信心分段 | what to do at 55%; different stakes need different bars 55% 該怎麼辦、不同代價不同門檻 | 8 |
| per-call log + `jev view` 每次呼叫的紀錄與檢視 | nobody can see what the model saw when it went wrong 出錯時沒人看得到模型看到什麼 | 8 |
| `other` + low confidence = the unknown 未知的浮現 | new kinds of input the option list never anticipated 選項從沒預料的新輸入 | 9 |
| model pinning (`jev-1.13.0`) 釘住模型 | thresholds silently drift when the alias moves 別名一動門檻就漂 | 7, 8 |
| MCP `evaluate` + `jev-workflow` skill | the technique is known but the code is still unchanged 技巧知道了、程式碼還沒換 | 9 |

Prerequisite: `./scripts/setup.sh` once, and `TYPESAFE_API_KEY` in your shell. Every lesson's command is also re-run by `npm run verify`, so the outputs above stay honest.

前提：跑過一次 `./scripts/setup.sh`，shell 裡有 `TYPESAFE_API_KEY`。每課的指令也會被 `npm run verify` 重跑，所以上面的輸出不會過期而不自知。
