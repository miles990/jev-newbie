# 可觀測性與驗證

因為 Jev 從不生成文字，每次呼叫都能完整檢視：一個 state、一組問題、一組機率、一個你的程式碼做的決定。把這些攤開，模型就不再是黑盒子。

## 紀錄格式

每次呼叫一行 JSONL。`bin/jev.mjs` 與 `examples/js/observe.mjs` 寫的就是這個：

```json
{"at":"2026-09-19T12:00:00Z","cmd":"classify","label":"support","id":"3","model":"jev-1.13.0",
 "stateHash":"a1b2c3d4e5f6","statePreview":"{\"item\":\"系統又掛了！！\"}",
 "questions":{"q":{"type":"choice","instructions":"What does the writer mainly want?","criteria":{"bug":null,"billing":null}}},
 "answers":{"q":{"type":"choice","value":"bug","confidence":0.93,"probabilities":{"bug":0.95,"billing":0.05}}},
 "decision":"bug","latencyMs":312,"inputTokens":221}
```

文字敏感時只留 state 雜湊，不留全文；預覽保持簡短。

## 檢視器

`jev view` 把 log 畫成 `runs/report.html`：摘要方塊（筆數、延遲中位數、token、費用、模型）、機率／信心直方圖、依標籤篩選、搜尋框，以及每次呼叫一列，每個答案一條橫條，程式碼的決定是一顆膠囊。每條橫條都畫出 0.35 到 0.65 的灰帶。

怎麼讀直方圖：答案堆在 0 與 1 兩端，問題清楚；中間有一坨，問題或資料模糊。先修問題，再動門檻。

## 驗證

- **黃金測試集。** `jev check questions.json cases.jsonl` 把答案跟你寫的標籤比對。每個沒中的都看，標籤模糊是發現，不是雜訊。
- **升級時回歸。** 釘住模型；新版本出來時重跑黃金測試集，比較報告。
- **Shadow 模式。** 關卡先只記錄判決一週、不動作，再看它會擋掉什麼。
- **跨 agent 一致。** Claude Code 與 Codex 共用一個 `evaluate` MCP 工具和一份問題檔，相同輸入在兩邊得到相同判斷。

## 實例

`showcase/observe-agent-avatar.html` 是用某個生產 repo 的 492 次真實呼叫做的面板：273 份生成 prompt 的關卡、55 個工具名稱的路由、30 句中英使用者句子的路由、素材標籤。總費用 0.016 美元。打開看看「可觀測的 Jev」在規模化時長什麼樣。
