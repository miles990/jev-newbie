#!/usr/bin/env bash
# 一鍵安裝：把用 Jev 需要的東西全部裝好。可重複執行；已裝的會跳過。
# One-shot setup for everything in this kit. Safe to re-run.
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
say(){ printf '\n\033[1m%s\033[0m\n' "$*"; }
have(){ command -v "$1" >/dev/null 2>&1; }

say "1/6 API key"
if [ -z "${TYPESAFE_API_KEY:-}" ]; then
  echo "TYPESAFE_API_KEY 未設定。到 https://console.typesafe.ai 申請，然後："
  echo "  export TYPESAFE_API_KEY=apikey_...   # 建議寫進 ~/.zshrc 或 ~/.bashrc"
  echo "設好後重新執行本腳本。"; exit 1
fi
echo "ok (${#TYPESAFE_API_KEY} chars)"

say "2/6 這個 repo 的 JS 與 Python 範例依賴"
have node || { echo "需要 Node.js 20+：https://nodejs.org"; exit 1; }
(cd "$here" && npm install --silent)
if have uv; then (cd "$here" && uv venv -q .venv && uv pip install -q --python .venv/bin/python typesafe-sdk)
elif have python3; then (cd "$here" && python3 -m venv .venv && .venv/bin/pip install -q typesafe-sdk)
else echo "沒有 python3，略過 Python 範例"; fi
echo "ok"

say "3/6 jev 命令列工具（本 repo 的 bin/jev.mjs，連結到全域）"
(cd "$here" && npm link --silent >/dev/null 2>&1 || true)
have jev && echo "ok: $(which jev)" || echo "npm link 失敗，改用：node $here/bin/jev.mjs"

say "4/6 typesafe-mcp：讓 Claude Code、Codex、Claude Desktop 共用同一個 evaluate 工具"
if have evaluate; then echo "already installed: $(evaluate version 2>/dev/null | head -1)"
else curl -fsSL https://raw.githubusercontent.com/itsmostafa/typesafe-mcp/main/install.sh | sh; fi
export PATH="$HOME/.local/bin:$PATH"
evaluate setup mcp || echo "evaluate setup mcp 失敗；可稍後手動執行"
echo "注意：evaluate 會把 TYPESAFE_API_KEY 寫進 Claude Code 的 MCP 設定與 ~/.codex/config.toml（明文）。"

say "5/6 官方 TypeSafe skill：給 Claude Code 與 Codex 完整的 API 知識"
if have claude; then claude plugin marketplace add typesafe-ai/skills >/dev/null 2>&1 || true; claude plugin install typesafe@typesafe-ai >/dev/null 2>&1 && echo "claude plugin: ok" || echo "claude plugin: 已存在或需手動安裝"; fi
if have npx; then npx -y skills@latest add typesafe-ai/skills --skill typesafe-ai -g -a codex -y >/dev/null 2>&1 && echo "codex skill: ok" || echo "codex skill: 略過"; fi
say "5b/6 本 repo 的工作流 skill（jev-workflow）"
if have npx; then npx -y skills@latest add "$here" --skill jev-workflow -g -a '*' -y >/dev/null 2>&1 && echo "jev-workflow skill: ok" || echo "jev-workflow skill: 略過（可手動複製 skills/jev-workflow 到你的 agent skills 目錄）"; fi

say "6/6 選配：jev-guard（工具呼叫安全關卡）與 limpet（過早停止關卡）"
if have npm; then npm i -g jev-guard >/dev/null 2>&1 && jev-guard key "$TYPESAFE_API_KEY" >/dev/null && echo "jev-guard: 已安裝並存好 key。要啟用 hooks 請自行執行：jev-guard install claude   或   jev-guard install codex" || echo "jev-guard: 略過"; fi
echo "limpet：claude plugin marketplace add noplan-inc/limpet && claude plugin install limpet@limpet --config typesafe_api_key=\$TYPESAFE_API_KEY"
echo "（這兩個會改變你每天用的 agent 行為，所以只安裝、不自動啟用。）"

say "完成。試試看："
echo "  jev doctor"
echo "  jev ask \"這句話是在抱怨嗎？\" --text \"又壞了，第三次了\""
echo "  jev view"
