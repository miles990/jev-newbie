# jev-workflow skill 有沒有用？一次真實任務的 A/B

問題：獨立的工作流 skill 有沒有必要，還是官方 `typesafe-ai` skill 已經能產出同樣的結果？用實驗回答，2026-09-19，headless Claude Code，同一任務、同一 repo，各跑一次。

## 設定

一個小專案：`classify.js` 用四條正規表達式把收件匣訊息分到資料夾；`messages.txt` 有八則範例訊息。兩次的提示詞：

> Using the typesafe-ai skill[ and the jev-workflow skill], replace the keyword classifier in classify.js with a TypeSafe Jev judgment. TYPESAFE_API_KEY is set. messages.txt has sample messages. Make it work and verify it.

A 組：只有官方 skill，且把 `jev-workflow` 從 skills 目錄實體移走，確保不會被自動載入。（第一次嘗試只裝著沒點名，結果被污染：agent 照樣用了它的詞彙。裝了的 skill 就算沒點名也會被讀。）B 組：兩個 skill 都點名。

## 各自交付了什麼

| 交付物 | A：只有官方 skill | B：加上 jev-workflow |
| --- | --- | --- |
| 有選項描述的 Jev 呼叫 | 有，每個資料夾有 `what/not_for/examples` 結構 | 有 |
| 獨立的問題檔 | 無，寫在程式碼裡 | `classify.questions.json` |
| 黃金測試集 | `verify.js` 內嵌 8 筆 | `classify.cases.jsonl` 26 筆已標，用 `jev check --strict` 檢查 |
| 集中一處的信心分段 | 提到「上線前建議設」 | 三段（`auto` ≥ 0.75、`review`、`unsure` < 0.5）加 0.85 的詐騙覆寫 |
| 缺 key／逾時／429 時放行 | 無 | 有，只警告一次，回 `other` |
| 請求雜湊快取 | 無 | 有 |
| 釘住模型並記錄 `model` 欄位 | 無 | `jev-1.13.0`，已記錄 |
| 每次呼叫一行 JSONL 並看過 | 無 | `logs/jev-classify.jsonl`，用 `jev view` 打開過 |
| 測試 | 1 支腳本，只有 live | 6 個：4 個純政策、1 個放行、1 個 live |
| logs 的 `.gitignore`、密鑰掃描 | 無 | 有 |
| 樣本準確率 | 8/8 | 8/8；黃金測試集 26/26 |
| 與舊正規表達式比較 | 無 | 有：舊分類器在黃金測試集只有 20/30 |

兩次都產出了能用且正確的分類器。差別在它周圍的一切：A 交付了一次呼叫；B 交付了一個能測、能調、能稽核、能回滾的決策。

## 結論

要讓 Jev *能動*，這個 skill 不是必要的。要拿到讓 Jev *能留下來*的交付物，它是必要的：升級時能重跑的黃金測試集、集中一處的門檻、log、失敗放行。沒有它，agent 知道這些東西存在（A 組建議「上線前設門檻」），但不做。一頁的作業程序改變了一個能力很強的 agent 交付的東西；這就是它存在的全部理由。

兩個誠實的限制：每組只跑一次、一個小任務、一個 agent；而且同樣的文字可以放在專案的 `CLAUDE.md` 或 `AGENTS.md` 而不是 skill。skill 是可攜的形式：跟著人跨 repo、跨 Claude Code 與 Codex。用你真的會持續更新的那種形式。
