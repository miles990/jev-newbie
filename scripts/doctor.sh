#!/usr/bin/env bash
# 檢查環境：key、API 連線與延遲、各工具是否就位、MCP 是否註冊。
set -uo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
ok(){ printf '  \033[32m✓\033[0m %s\n' "$*"; }; bad(){ printf '  \033[31m✗\033[0m %s\n' "$*"; }; warn(){ printf '  \033[33m!\033[0m %s\n' "$*"; }
echo "jev-newbie doctor"
[ -n "${TYPESAFE_API_KEY:-}" ] && ok "TYPESAFE_API_KEY set (${#TYPESAFE_API_KEY} chars)" || bad "TYPESAFE_API_KEY missing"
if [ -n "${TYPESAFE_API_KEY:-}" ]; then
  t0=$(date +%s%N 2>/dev/null || python3 -c 'import time;print(int(time.time()*1e9))')
  code=$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TYPESAFE_API_KEY" https://api.typesafe.ai/v1/models)
  t1=$(date +%s%N 2>/dev/null || python3 -c 'import time;print(int(time.time()*1e9))')
  [ "$code" = 200 ] && ok "api.typesafe.ai reachable, key accepted ($(( (t1-t0)/1000000 )) ms)" || bad "api.typesafe.ai returned $code"
fi
command -v node >/dev/null && ok "node $(node -v)" || bad "node missing"
[ -d "$here/node_modules/@typesafe-ai/sdk" ] && ok "@typesafe-ai/sdk installed in repo" || warn "run scripts/setup.sh for JS examples"
[ -x "$here/.venv/bin/python" ] && "$here/.venv/bin/python" -c 'import typesafe_sdk' 2>/dev/null && ok "typesafe-sdk (python) installed in .venv" || warn "python examples not set up"
command -v jev >/dev/null && ok "jev CLI on PATH ($(which jev))" || warn "jev CLI not linked; use node $here/bin/jev.mjs"
command -v evaluate >/dev/null && ok "typesafe-mcp evaluate $(evaluate version 2>/dev/null | head -1)" || warn "typesafe-mcp not installed"
command -v claude >/dev/null && { claude mcp get evaluate >/dev/null 2>&1 && ok "Claude Code MCP 'evaluate' registered" || warn "Claude Code: evaluate MCP not registered (evaluate setup mcp)"; }
[ -f "$HOME/.codex/config.toml" ] && { grep -q 'mcp_servers.evaluate' "$HOME/.codex/config.toml" && ok "Codex MCP 'evaluate' registered" || warn "Codex: evaluate MCP not registered"; }
[ -d "$HOME/.agents/skills/typesafe-ai" ] || [ -d "$HOME/.claude/skills/typesafe-ai" ] && ok "official typesafe-ai skill present" || warn "official skill not installed"
[ -d "$HOME/.agents/skills/jev-workflow" ] || [ -d "$HOME/.claude/skills/jev-workflow" ] && ok "jev-workflow skill present" || warn "jev-workflow skill not installed (optional)"
command -v jev-guard >/dev/null && ok "jev-guard installed (hooks not activated unless you ran 'jev-guard install')" || warn "jev-guard not installed (optional)"
