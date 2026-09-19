# 本機 Jev 工具配置紀錄 / Local setup

2026-09-19；這是本次在 macOS 使用者帳號的安裝結果，不是專案安裝腳本的預設行為。第三方來源與固定 commit 見[版本紀錄](research/installed-revisions-2026-09-19.json)。原始工具放在 `~/.local/share/jev-tools/`，額外命令放在 `~/.local/bin/`。

| 入口 | 用途 | 實際驗證 |
| --- | --- | --- |
| `jev` | 入門判斷、分類、批次與 HTML 報告 | doctor 能連 API；33 項標記答案通過 |
| 既有 `evaluate` MCP | agent 直接呼叫 Jev | 已從本次工具呼叫取得有效答案 |
| `jev-evaluate` | 明確指定 Jev 的 MCP CLI | 指向原有 `~/.local/bin/evaluate`，避免與 Homebrew 音樂分析工具同名 |
| `jev-rerank` | 把 JSONL 候選依查詢重新排序 | 五份學習資料實測；兩篇入門練習排前兩名 |
| `jev-code` | 找程式、檢查 diff、整理失敗與評論 | 從 source build；上游測試 99/99；有界搜尋找到 `bin/jev.mjs`，但覆蓋不完整 |
| `jev-use` skill | Jev-cu 桌面決策與執行流程 | 已安裝；上游離線測試 18/18，API 快照選擇 12/12；未驗證完整桌面任務 |

## 可以直接使用

```sh
jev ask '這則訊息需要我回覆嗎？' --text '週六吃飯嗎？明天前告訴我。'
jev-rerank '適合初學者、能用手機練習攝影的資料' examples/usefulness/candidates.jsonl --top 3
jev-code 'Find bin/jev.mjs batch concurrency function' --repo . --excerpts --max-files 6 --max-requests 8
```

後兩個指令在本專案目錄執行。`jev-rerank` 是本次替 hev 的 Python library 建立的薄 CLI；輸出分數與完整原始項目，不會替你搜網路。大資料先分批。`jev-code` 的報告會列出未檢查的內容；exit 10 代表覆蓋不完整，不等於程式壞了。第一次較泛的查詢沒有找到強候選；加入檔名與 excerpt 才找到目標，因此不能宣稱它全面勝過 rg 或 CodeGraph。

若 shell 找不到新指令，用 `~/.local/bin/jev-rerank` 或 `~/.local/bin/jev-code`。若 `jev` 不在 PATH，專案內可用 `node bin/jev.mjs`。

新開的 Codex 任務可明確要求：「使用 jev-use，先讀取介面並預覽下一步，再執行這個桌面任務。」skill 位於 `~/.codex/skills/jev-use/SKILL.md`；安裝後新任務載入。需要可用的 Computer Use 工具與 macOS 無障礙權限。測試快照通過不代表已完成你的實際任務。

## 金鑰與設定

沿用已有的 TypeSafe key，沒有另建帳號。CLI 與兩個新 launcher 從 `~/.config/jev/config.json` 讀 `apiKey`；目錄權限 700、檔案 600。明確設定的 `TYPESAFE_API_KEY` 優先。Jev-cu 使用其工具目錄內權限 600 的 `.env.local`；既有 MCP 設定保留。這些都是本機檔案，沒有加入專案或此報告。

SDK 範例仍依 SDK 慣例讀環境變數；CLI 的本機 fallback 不會自動改寫你的 shell 設定。若需要換 key，這幾處需同步更新。此專案一般使用者仍可照 README 設定環境變數，不必建立本機設定檔。

## 尚未開啟的常駐整合

沒有啟用自動模型路由、上下文刪減、全域權限 hooks 或 shell 歷史補全。這些需要在真正任務中比較完整耗時、成本與漏判，不以作者展示或星數作為啟用依據。現有安裝都是明確呼叫才執行。

## 更新與移除

工具各自保留 Git checkout；更新前看上游差異，再於該目錄拉取、重新安裝依賴／build、重跑測試。`jev-use` 可用 `node ~/.local/share/jev-tools/Jev-cu/scripts/install-skill.mjs --uninstall` 移除。其他額外 launcher 可逐個刪除，再移除對應工具目錄；不要誤刪 Homebrew 的同名音樂工具或原有 MCP 設定。
