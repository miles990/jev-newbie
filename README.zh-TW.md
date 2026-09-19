# jev-newbie

[English](README.md) · **繁體中文**

給 [TypeSafe Jev](https://typesafe.ai) 新手的實戰入門包：它能做什麼、不能做什麼、要裝哪些工具才能跟你的 coding agent 配合得好、可以直接跑的範例、一個傻瓜也能用的 `jev` 命令列工具，以及一個把每次判斷攤開來給你看的檢視器。

Jev 是 *System One* 模型。你送它文字或 JSON 的 **state** 加上 **型別化的問題**，它在約 300 毫秒內回你**帶校準機率的型別化答案**，每次約 0.00002 美元。它從不生成文字，所以它做的每一件事都能攤在桌上檢查。

```text
state（文字或 JSON）＋ 問題（是非 · 單選 · 程度）→ 機率 → 你的程式碼做決定
```

## 教程

八課、每課十分鐘，每課一個可跑的指令與真實錄下的輸出：[tutorial/README.md](tutorial/README.md)。沒用過 Jev 就從這裡開始。

## 60 秒上手

```sh
git clone https://github.com/miles990/jev-newbie && cd jev-newbie
export TYPESAFE_API_KEY=apikey_...        # 到 https://console.typesafe.ai 申請
./scripts/setup.sh                         # 裝 SDK、jev CLI、給 Claude Code／Codex 用的 MCP server、skill
jev doctor
jev ask  "這句話是在抱怨嗎？" --text "又壞了，這禮拜第三次"
jev pick "使用者要什麼？" --options greet,task,question,other --text "幫我跑一下測試"
jev rate "多急？" --levels "可以等,今天,一小時內" --text "正式環境掛了，客戶在等"
jev view                                   # 打開一頁報告，看剛剛每一次呼叫
```

每個指令都會在 `runs/jev-log.jsonl` 追加一行：送了什麼、回了什麼、程式碼決定了什麼、延遲與 token。`jev view` 把它變成一頁可讀、可分享的報告。

## 裡面有什麼

| 路徑 | 內容 |
| --- | --- |
| `bin/jev.mjs` | 單檔、零依賴的 CLI：`ask` `pick` `rate` `filter` `classify` `run` `check` `view` `doctor` |
| `bin/view.html` | `jev view` 用的報告模板（中英雙語、深淺色） |
| `examples/curl` `examples/python` `examples/js` | 同一次呼叫的三種語言版本，加上未知輸入篩選、投機式廣撒、可稽核的包裝 |
| `examples/cli` | 給 `jev run` 與 `jev check` 用的問題集、項目清單與黃金測試集 |
| `scripts/setup.sh` `scripts/doctor.sh` | 一鍵安裝與環境檢查 |
| `skills/jev-workflow` | 教 Claude Code／Codex 照這個 repo 的工作流做事的 agent skill |
| `tutorial/` | 八課循序教程，附真實錄下的輸出，中英雙語 |
| `docs/en` `docs/zh-TW` | 短指南：Jev 是什麼、怎麼找用法、可靠性、工具、可觀測性 |
| `docs/zh-TW/15-competitors.md` | 目前沒有直接競品；依成本、標籤、延遲列出替代品；已發表的對照測試結果 |
| `docs/zh-TW/14-speed-and-computer-use.md` | 實測延遲（1 題對 13 題、循序對平行）與 Jev 看不到螢幕仍能操作瀏覽器與桌面的做法 |
| `docs/zh-TW/13-engineering-map.md` | 把 Jev 當校準的語意預言機，對照每個工程學科：接在哪、永遠不取代什麼 |
| `docs/zh-TW/10-monte-carlo.md` `11-multimodal.md` `12-features.md` | Jev 搭配 Monte Carlo（政策模擬、期望成本、bootstrap）、多模態周邊、當特徵抽取器搭配 Fourier 等訊號方法 |
| `docs/zh-TW/09-converging-loops.md` | LLM 提案、Jev 量測、程式碼決定：三種會收斂的迴圈，附 58% → 0% 的真實執行 |
| `docs/zh-TW/08-jev-with-an-llm.md` | Jev 與 LLM 之間接縫的四個位置，附可跑的 Jev → LLM → Jev 流程 |
| `docs/zh-TW/07-limits-and-caveats.md` | 硬限制、軟限制、校準、語言、服務與設計上的但書，附來源 |
| `docs/zh-TW/06-feature-coverage.md` | Jev 每一項 API 功能對應的 CLI 參數與範例，以及錄下的輸出如何重現 |
| `docs/workspace-audit.md` | 對約六十個真實專案的稽核：哪裡能用 Jev 取代脆弱程式碼，附檔案與行號 |
| `showcase/` | 用某個生產 repo 的 492 次真實呼叫做出來的可觀測面板 |

## 三種「這裡適合 Jev」的味道

1. **對字串做 `if`／`else`。** 關鍵字表、正規表達式分類、工具名稱後綴表。每加一個案例就要改程式碼。
2. **顯示了但沒有用的自由文字。** agent 的訊息、審查備註、使用者輸入：印在畫面上，邏輯卻沒用到。
3. **散在多處的人工分類清單。** 新增一筆要改六個地方。

把判斷寫成封閉問題（是非用 `noul`，N 選一含 `other` 用 `choice`，程度用 `score`），拿二十筆真實資料用 `jev check` 試，再把門檻寫進程式碼。完整說明：[docs/zh-TW/02-find-use-cases.md](docs/zh-TW/02-find-use-cases.md)。

## 篩選未知，而不只是已知

Jev 的封閉集合限制的是**答案**，不是**輸入**。輸入可以是它從沒見過的工具、訊息或檔案，固定的是問題。新東西會以 `other`、平坦的機率分布或低信心的形式出現，由程式碼把它們交給人。四種模式與範例：[docs/zh-TW/02-find-use-cases.md#未知](docs/zh-TW/02-find-use-cases.md#未知)。

## 最可靠的用法

封閉問題加上「都不是」選項 · 先用二三十筆已標答案的黃金測試集再相信門檻 · 三段信心（執行／待審／拒絕）· 關卡失敗時放行 · 每次呼叫都留一行紀錄 · 釘住模型版本。細節與檢查清單：[docs/zh-TW/03-reliability.md](docs/zh-TW/03-reliability.md)。

## 工具

| 工具 | 用途 | 安裝 |
| --- | --- | --- |
| `jev`（本 repo） | 在 shell 試任何問題、全部留紀錄、看報告 | `./scripts/setup.sh` |
| [typesafe-mcp](https://github.com/itsmostafa/typesafe-mcp) | Claude Code、Codex、Claude Desktop 共用一個 `evaluate` MCP 工具 | `evaluate setup mcp` |
| 官方 [TypeSafe skill](https://docs.typesafe.ai/agent-skill) | 給 agent 完整的 API 知識 | `claude plugin install typesafe@typesafe-ai`／`npx skills add typesafe-ai/skills` |
| `typesafe-sdk`／`@typesafe-ai/sdk` | Python 與 JavaScript 客戶端，含重試與型別 | `pip install typesafe-sdk`／`npm i @typesafe-ai/sdk` |
| [jev-guard](https://github.com/leepokai/jev-guard)、[limpet](https://github.com/noplan-inc/limpet) | 現成的工具呼叫安全關卡與過早停止關卡 | setup 會安裝，由你決定是否啟用 |

更多說明，包括每個工具會改動你機器上的什麼：[docs/zh-TW/04-tools.md](docs/zh-TW/04-tools.md)。

## 可重現，不是杜撰

本 repo 裡出現的每一段輸出都來自真實呼叫。`npm run verify` 用釘住的模型重跑全部範例並與 `examples/expected/` 比對；黃金測試集的 `jev check --strict` 是硬性通過與否。見 [docs/zh-TW/06-feature-coverage.md](docs/zh-TW/06-feature-coverage.md)。

## Jev 不做的事

生成文字 · 看圖片、聲音、影片 · 算數 · 比日期 · 發明新標籤。這些留給程式碼、視覺模型或 LLM。Jev 的工作是挑選、評分、回答是非，並附上誠實的機率。

## 授權

MIT
