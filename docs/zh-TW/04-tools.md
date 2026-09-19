# 依需求安裝工具

## 只跟著教程操作

Node.js 20 以上與 TypeSafe API key 就能使用 `node bin/jev.mjs`。不必裝 MCP、全域 CLI 或 skill。金鑰設定見 [README](../../README.zh-TW.md)。

## JavaScript 與 Python 範例

JavaScript：在專案根目錄執行 `npm ci`。Python：

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

Windows Python 路徑通常是 `.venv\Scripts\python.exe`。Bash 使用者也可執行 `bash scripts/setup.sh`，它只安裝 repo 的 JS 與 Python 依賴，不寫入金鑰、不修改 agent 設定、不安裝全域工具。缺少 Python 時會略過 Python 部分。

`npm test` 是不使用金鑰的離線程式測試。`npm run doctor` 會檢查金鑰與連線，包含一次付費 API 判斷。`npm run verify` 是另一項使用真實 API 的範例檢查，詳見[驗證範圍](06-feature-coverage.md)。

## 想讓 coding agent 使用 Jev

[AI 整合指南](16-agent-integration.md)是普通文件，可直接交給助手讀，不需安裝 `jev-workflow`。官方 [TypeSafe skill](https://docs.typesafe.ai/agent-skill)提供 API 與模式知識，依官方目前的安裝說明選用。

[typesafe-mcp](https://github.com/itsmostafa/typesafe-mcp)是另一種讓 agent 呼叫服務的介面，與 CLI、SDK 擇需使用。請先讀它的安裝說明與金鑰儲存方式；這個專案不會替你註冊或啟用它。第三方關卡或停止 hook 同樣不屬於新手的必要依賴。

## 本機可選金鑰檔

CLI 也支援 `~/.config/jev/config.json` 的 `apiKey` 欄位；環境變數優先。此為 CLI 的功能，SDK 範例仍需 `TYPESAFE_API_KEY`。不要把金鑰放進專案。這次使用者電腦的額外安裝見[本機工具紀錄](../local-tools-2026-09-19.md)。
