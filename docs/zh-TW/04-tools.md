# 工具

要裝什麼、每個工具會改你機器上的什麼、怎麼確認裝好了。`./scripts/setup.sh` 全部做完；`./scripts/doctor.sh` 檢查。

## 必備

**API key。** <https://console.typesafe.ai> → 在 shell 設定檔加 `export TYPESAFE_API_KEY=apikey_...`。

**`jev` CLI（本 repo）。** `bin/jev.mjs`，單檔、零依賴，setup 會連結到 PATH。每次呼叫都記到 `runs/jev-log.jsonl`；`jev view` 畫出來。環境變數：`JEV_MODEL`、`JEV_LOG`。

**typesafe-mcp**（[itsmostafa/typesafe-mcp](https://github.com/itsmostafa/typesafe-mcp)）。一個靜態執行檔 `evaluate`，提供一個 `evaluate` MCP 工具。`evaluate setup mcp` 會註冊到 Claude Code（使用者範圍）、Codex（`~/.codex/config.toml`）與 Claude Desktop，並且**把 API key 明文寫進那些設定檔**。兩個 agent 之後呼叫的是同一個工具、同一種問題格式，這是它們的判斷能互相比較的關鍵。檢查：`claude mcp get evaluate`。

**官方 TypeSafe skill。** 教 agent 三個基本型別、模式與 API 契約。Claude Code：`claude plugin marketplace add typesafe-ai/skills && claude plugin install typesafe@typesafe-ai`。Codex 與其他：`npx skills add typesafe-ai/skills --skill typesafe-ai -g`。<https://docs.typesafe.ai/agent-skill> 上那兩句提示詞是開始一個專案最好的方式：一句探索機會，一句用你的 key 跑實驗。

**jev-workflow skill（本 repo）。** `skills/jev-workflow/SKILL.md`。有立場的流程：找味道、寫問題檔、用黃金測試集跑 `jev check`、再整合。安裝：`npx skills add miles990/jev-newbie --skill jev-workflow -g`。

## SDK

`pip install typesafe-sdk`（Python，同步與非同步，含重試）與 `npm i @typesafe-ai/sdk`（JavaScript，答案型別由問題推導）。兩者都讀 `TYPESAFE_API_KEY`。零依賴的腳本直接 `fetch`／`curl` 打 `POST https://api.typesafe.ai/v1/systemone` 就夠；見 `examples/curl`。

## 給 coding agent 的選配關卡

setup 會安裝但**不啟用**，因為它們會改變你每天用的 agent 的行為：

- **jev-guard**（[leepokai/jev-guard](https://github.com/leepokai/jev-guard)）：對每次工具呼叫評破壞性與外洩風險，掃描工具回傳的 prompt injection。逐個 agent 啟用：`jev-guard install claude` 或 `jev-guard install codex`。先試：`jev-guard check Bash '{"command":"rm -rf ~"}'`。
- **limpet**（[noplan-inc/limpet](https://github.com/noplan-inc/limpet)）：Stop hook，用白話規則（「不要停下來問要不要跑測試」）把 agent 送回去。`claude plugin marketplace add noplan-inc/limpet && claude plugin install limpet@limpet --config typesafe_api_key=$TYPESAFE_API_KEY`。

## 也值得知道

- [Vercel AI Gateway](https://vercel.com/ai-gateway/models/jev) 與 [Cloudflare Workers AI](https://developers.cloudflare.com/ai/models/typesafe/jev/) 用各自的 key 提供 Jev；gateway 的回應沒有信心值欄位。
- 社群清單：[Anil-matcha/awesome-jev-by-typesafe](https://github.com/Anil-matcha/awesome-jev-by-typesafe)、[yibie/awesome-jev](https://github.com/yibie/awesome-jev)。值得抄的模式：pi-jev（shadow 模式、失敗放行、120 秒快取）、jev-drone（2.5 Hz 的顧問式評審、程式碼保留否決權、場景指紋）、wakegate（喚醒 agent 前先問值不值得）、fast-jev-compaction（依相關性修剪上下文）。

下一篇：[05 可觀測性](05-observability.md)
