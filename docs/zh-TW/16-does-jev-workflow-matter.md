# jev-workflow skill 有沒有用？一次真實任務的 A/B

> 歷史實驗紀錄，未於本次重跑；請先看文末「修正後的結論」。
問題：獨立的工作流 skill 有沒有必要，還是官方 `typesafe-ai` skill 已經能產出同樣的結果？用實驗回答，2026-09-19，headless Claude Code，同一任務、同一 repo，各跑一次。

## 設定

一個小專案：`classify.js` 用四條正規表達式把收件匣訊息分到資料夾；`messages.txt` 有八則範例訊息。兩次的提示詞：

> Using the typesafe-ai skill[ and the jev-workflow skill], replace the keyword classifier in classify.js with a TypeSafe Jev judgment. TYPESAFE_API_KEY is set. messages.txt has sample messages. Make it work and verify it.

A 組：只有官方 skill，且把 `jev-workflow` 從 skills 目錄實體移走，確保不會被自動載入。（第一次嘗試只裝著沒點名，結果被污染：agent 照樣用了它的詞彙。是否載入仍須查載入紀錄。）B 組：兩個 skill 都點名。

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

## 修正後的結論

這份歷史紀錄每組只有一次執行，未在本次稽核重跑，不能證明 skill 的必要性、普遍效果或因果關係。詞彙相似也不足以證明未點名的 skill 被載入；需要工具載入紀錄。表中的樣本數 26 與 30 不一致，不能當作同一資料集的公平比較。

記錄、測試與故障政策有實用價值，但不依赖 skill 這種封裝。API 故障是否放行應按任務決定，不能當成通用優點。因此目前採用[普通整合指南](16-agent-integration.md)，讓新手不必安裝重複的 skill；需要跨專案固定流程時再評估技能封裝。
