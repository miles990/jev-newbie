# 指令、範例與驗證範圍

所有指令在專案根目錄以 `node bin/jev.mjs` 執行，以下簡寫為「CLI」。

| 指令 | 功能 |
| --- | --- |
| `ask "問題" --text "文字"` | 是非；可加 `--yes`、`--no` 定義準則 |
| `pick "問題" --options "a,b,other" --text "文字"` | 單選；`a:說明` 可補充類別意思 |
| `rate "問題" --levels "低,中,高" --text "文字"` | 有序評分 |
| `filter items.txt "問題"` | 全部顯示並標示通過項目；`--only-kept` 只輸出通過的原文 |
| `classify items.txt "問題" --options "a,b,other"` | 逐筆分類 |
| `run questions.json items.txt` | 每筆輸入一次請求、一次多題 |
| `check questions.json cases.jsonl --strict` | 比較人工標籤；不符時失敗 |
| `view [log.jsonl] --no-open` | 產生 HTML 報告 |
| `doctor`／`models` | 連線檢查／可用模型 |

輸入可選 `--text`、`--file`、`--json` 或 stdin。前兩者會包成 `{text: ...}`。批次 `.jsonl` 每行整個值作為 state。`--min` 控制 filter 門檻；`--min-conf` 控制單選覆核與 check 的低信心提示。

共用參數：`--model`、`--label`；批次 `--concurrency`（預設 4，最多 32）；每次 API 嘗試 `--timeout`（毫秒，預設 30000）。模型預設 `JEV_MODEL` 或 `jev-latest`；紀錄預設 `JEV_LOG` 或 `runs/jev-log.jsonl`。

## 三種不同的驗證

- `npm test`：離線、模擬 API 的程式回歸測試。不測模型準確率。
- `npm run verify`：需金鑰和 JS／Python 依賴，真實呼叫 API；比對選定歷史輸出、執行已更新範例、檢查兩組案例。不同模型或機率漂移可能使比對失敗。
- `npm run verify -- --record`：只有整輪成功才更新指定的預期輸出。紀錄模式不是把失敗寫成新標準答案。

歷史比對容許數值差 0.15，文字結構與數值位置仍需相符；這只是輸出回歸門檻，不是準確率或校準測試。程式修改後的舊輸出移到 `examples/recorded-legacy/`，不冒充新結果。

LLM、Monte Carlo、特徵、延遲等進階示範不全包含在 verify；執行前查看各頁所需依賴與成本。完整 API 定義見[官方參考](https://docs.typesafe.ai/api)。
