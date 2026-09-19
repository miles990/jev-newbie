# 功能覆蓋：Jev 的每一項能力與本工具包對應的用法

依據：<https://docs.typesafe.ai/api> 與 <https://docs.typesafe.ai/primitives>。2026-09-19 對照 `jev-1.13.0` 檢查。

| API 功能 | 說明 | `jev` CLI | 範例 |
| --- | --- | --- | --- |
| `noul` 問題 | 是非條件成立的機率 | `ask`、`filter` | 所有 quickstart、`unknown_filter.py`、`fanout_profile.py` |
| `noul` 準則（`true`／`false` 描述） | 說明「是」與「否」各代表什麼 | `ask`、`filter` 的 `--yes "..." --no "..."` | `examples/cli/support.questions.json`（加 `criteria`） |
| `choice` 問題 | 封閉集合單選；機率＋信心 | `pick`、`classify` | quickstart、`unknown_filter.py`、`observe.mjs` |
| `choice` 選項描述（`criteria` 對照） | 每個選項的評分準則，無則 `null` | `--options "a:desc,b:desc"` | `support.questions.json` |
| `score` 問題 | 有序等級上的加權位置；legend＋信心 | `rate` | quickstart、`fanout_profile.py`、`support.questions.json` |
| 一次請求多題（平行） | 廣撒；延遲約等於一題 | `run`、`check` | `fanout_profile.py`、`support.questions.json` |
| 結構化 `instructions`／`criteria`（物件、陣列） | 用 JSON 結構取代字串 | `run`／`check` 的問題檔可放任何 JSON | 寫在 `<name>.questions.json` |
| JSON `state`（物件或陣列） | 具名欄位、紀錄、對話 | `--json '{...}'`、`.jsonl` 項目檔 | `quickstart.py`（`account_tier`）、`unknown_filter.py` |
| 字串 `state` | 純文字 | `--text`、`--file`、stdin | `first-call.sh` |
| `model` 選擇、別名、釘版本 | `jev-latest`、`jev-preview`、`jev-1.13.0` | `--model`、`JEV_MODEL` | `verify-examples.sh` 釘住 `jev-1.13.0` |
| `GET /v1/models` | 列出你的 key 可用的模型 | `models` | `doctor` |
| choice／score 的 `confidence` | 分布集中程度 | 顯示；`--min-conf` 門檻 | `quickstart.*` 的三段政策 |
| 每個選項／等級的 `probabilities` | 完整分布 | `pick`、`rate` 顯示；`view` 可看 | 每次呼叫都記錄 |
| `usage.input_tokens` | 成本統計 | 記錄；`view` 加總 | `observe.mjs` |
| 速率限制（429／529） | 退避重試 | `systemOne()` 內建 | SDK 預設重試 |
| 錯誤（401／422） | key 與驗證失敗 | 回報並附錯誤內容片段 | `doctor` |
| Jev＋LLM 流程 | 關卡 → 擬稿 → 驗證 → 重試 | CLI 無 | `examples/js/jev-then-llm.mjs`（Anthropic SDK 或 `claude -p`） |
| LLM → Jev 收斂迴圈 | 提案 → 整批重打分 → 單調接受 → 停止 | CLI 無 | `examples/js/llm-then-jev-loop.mjs` |
| 機率 → Monte Carlo | 政策模擬、期望成本、bootstrap 信賴區間 | CLI 無 | `examples/js/monte-carlo.mjs` |
| 問題 → 特徵矩陣 | 校準特徵的 CSV 加與標籤的相關性 | `run` 印出表格 | `examples/js/features.mjs` |
| 延遲基準 | 循序對平行、1 題對 13 題、重複 | `doctor` 顯示一次 | `examples/js/latency.mjs` |
| SDK | Python 與 JavaScript 客戶端 | CLI 不用（直接 fetch） | `examples/python`、`examples/js` |
| 給 agent 的 MCP 工具 | typesafe-mcp 的 `evaluate` | `scripts/setup.sh` | `docs/zh-TW/04-tools.md` |
| Agent skill | 官方 `typesafe-ai` 與本 repo 的 `jev-workflow` | `scripts/setup.sh` | `skills/jev-workflow/SKILL.md` |

不是 Jev 的功能所以不在表裡：生成文字、影像輸入、算數、日期。見 [01 Jev 是什麼](01-what-jev-is.md)。

## 可重現性

本 repo 的每個數字與每段範例輸出都來自真實呼叫。`scripts/verify-examples.sh` 用 `JEV_MODEL=jev-1.13.0` 重跑全部範例，與 `examples/expected/*.txt` 比對；那些檔案也是用同一支腳本 `--record` 錄下的。標籤在多次執行間穩定，機率可能差幾個百分點，所以差異只顯示供檢視、不判失敗。硬性檢查是黃金測試集：`jev check --strict`。

`examples/cli/support.cases.jsonl` 有一筆刻意不放 `intent` 的預期：「幫我把這段 SQL 改成用 index，現在跑 40 秒」我們標 `bug`，Jev 以信心 0.71 判 `feature`。兩種讀法都說得通，這正是黃金測試集要揭露的標籤模糊；我們保留這筆案例、拿掉模糊的預期，而不是勉強任何一方。
