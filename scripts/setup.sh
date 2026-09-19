#!/usr/bin/env bash
# Optional local dependencies for SDK examples. The CLI itself needs only Node.js.
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
command -v node >/dev/null || { echo "Install Node.js 20 or later first." >&2; exit 1; }
node -e 'if (Number(process.versions.node.split(".")[0]) < 20) process.exit(1)' || { echo "Node.js 20 or later is required." >&2; exit 1; }
(cd "$here" && npm ci)
if command -v python3 >/dev/null; then
  [ -x "$here/.venv/bin/python" ] || python3 -m venv "$here/.venv"
  if command -v uv >/dev/null; then
    uv pip install --python "$here/.venv/bin/python" -r "$here/requirements.txt"
  else
    "$here/.venv/bin/python" -m ensurepip --upgrade
    "$here/.venv/bin/python" -m pip install -r "$here/requirements.txt"
  fi
else
  echo "Python not found; skipping Python examples."
fi
printf '%s\n' 'Local SDK dependencies installed.' 'CLI: node bin/jev.mjs --help' 'No global tools, agent configuration, or API keys were changed.'
