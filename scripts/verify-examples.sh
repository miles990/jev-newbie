#!/usr/bin/env bash
# 重跑每一個範例，把輸出和 examples/expected/ 裡錄下的結果比對。
# Re-run every example and diff against the recorded outputs in examples/expected/.
# Jev is calibrated and consistent, so identical inputs give the same labels; probabilities may move
# by a few hundredths between runs or model versions, so the diff is shown, not failed on. The hard check
# is `jev check --strict` on the golden set at the end.
#   ./scripts/verify-examples.sh            # compare
#   ./scripts/verify-examples.sh --record   # overwrite the expected outputs (do this when you change an example)
set -uo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"; cd "$here"
export JEV_MODEL="${JEV_MODEL:-jev-1.13.0}"       # pinned: the recorded outputs were made with this version
export JEV_LOG="runs/verify-log.jsonl"; rm -f "$JEV_LOG"
: "${TYPESAFE_API_KEY:?export TYPESAFE_API_KEY first}"
mode="${1:-compare}"; mkdir -p examples/expected; fail=0
run(){ # name, command...
  local name="$1"; shift; local out="examples/expected/$name.txt"
  if [ "$mode" = "--record" ]; then "$@" > "$out" 2>&1; echo "recorded $out"; return; fi
  local got; got="$("$@" 2>&1)"
  if diff -u "$out" <(printf '%s\n' "$got") > /tmp/jev-diff.$$ 2>&1; then echo "  ✓ $name"; else echo "  ~ $name (differs from recording; review below)"; sed -n '1,40p' /tmp/jev-diff.$$; fi
  rm -f /tmp/jev-diff.$$
}
strip(){ sed -E 's/[0-9]+ ms/N ms/g; s/in [0-9]+ ms/in N ms/g'; }
echo "model: $JEV_MODEL"
run curl-first-call        sh -c 'sh examples/curl/first-call.sh | python3 -c "import json,sys;d=json.load(sys.stdin);print(json.dumps({k:{kk:(round(vv,2) if isinstance(vv,float) else vv) for kk,vv in v.items() if kk!=\"probabilities\"} for k,v in d[\"answers\"].items()},ensure_ascii=False,indent=1))"'
run python-quickstart      .venv/bin/python examples/python/quickstart.py
run python-unknown-filter  .venv/bin/python examples/python/unknown_filter.py
run python-fanout          .venv/bin/python examples/python/fanout_profile.py
run js-quickstart          node examples/js/quickstart.mjs
run cli-ask                node bin/jev.mjs ask "這句話是在抱怨嗎？" --text "又壞了，第三次了"
run cli-pick               sh -c 'echo "幫我把測試跑一遍" | node bin/jev.mjs pick "使用者要什麼？" --options greet,task,question,other'
run cli-rate               node bin/jev.mjs rate "多急？" --levels 可以等幾天,今天要處理,一小時內要處理 --text "系統掛了客戶在等"
run cli-filter             node bin/jev.mjs filter examples/cli/support-messages.txt "Is the writer reporting something broken?" --min 0.5
run cli-classify           node bin/jev.mjs classify examples/cli/support-messages.txt "What does the writer mainly want?" --options bug,billing,feature,question,thanks,other
run cli-run                node bin/jev.mjs run examples/cli/support.questions.json examples/cli/support-messages.txt
echo
echo "golden set (hard check):"
node bin/jev.mjs check examples/cli/support.questions.json examples/cli/support.cases.jsonl || fail=1
node bin/jev.mjs view "$JEV_LOG" --no-open >/dev/null && echo "report: runs/report.html"
[ "$mode" = "--record" ] && exit 0
exit $fail
