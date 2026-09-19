#!/usr/bin/env bash
# Required CLI environment and live connectivity. No changes to agent settings.
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
command -v node >/dev/null || { echo "Node.js 20 or later is required." >&2; exit 1; }
node -e 'if (Number(process.versions.node.split(".")[0]) < 20) process.exit(1)' || { echo "Node.js 20 or later is required." >&2; exit 1; }
exec node "$here/bin/jev.mjs" doctor
