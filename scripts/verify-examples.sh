#!/usr/bin/env bash
# 重跑每一個範例，把輸出和 examples/expected/ 裡錄下的結果比對。
# Run selected live examples and compare historical outputs; updated examples are smoke checks.
# Model outputs can change; comparisons are regression signals, not correctness guarantees.
# Probabilities may move
# by a few hundredths between runs. compare-output.py therefore requires every label and line to match
# exactly and tolerates numeric drift up to 0.15 (scores are 0..N sums); anything beyond that fails. The golden set at the end
# is checked with --strict.
#   ./scripts/verify-examples.sh            # compare
#   ./scripts/verify-examples.sh --record   # overwrite the expected outputs (do this when you change an example)
set -uo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"; cd "$here"
: "${TYPESAFE_API_KEY:?export TYPESAFE_API_KEY first}"
command -v node >/dev/null && command -v python3 >/dev/null || exit 2
[ -x .venv/bin/python ] && [ -d node_modules/@typesafe-ai/sdk ] || { echo "Run bash scripts/setup.sh first" >&2; exit 2; }
mode="${1:-compare}"
[ "$mode" = compare ] || [ "$mode" = --record ] || { echo "Usage: $0 [--record]" >&2; exit 2; }
export JEV_MODEL="${JEV_MODEL:-jev-1.13.0}"
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
mkdir -p runs examples/expected
export JEV_LOG="runs/verify-$(date +%Y%m%dT%H%M%S)-$$.jsonl"
fail=0
run(){
  local name="$1"; shift
  local out="examples/expected/$name.txt" got="$work/$name.txt" msg
  if ! "$@" > "$got" 2>&1; then
    echo "  ✗ $name: command failed"; cat "$got"; fail=1; return
  fi
  if [ "$mode" = --record ]; then echo "  staged $name"; return; fi
  if msg=$(python3 scripts/compare-output.py "$out" "$got" 2>&1); then echo "  ✓ $name ($msg)"; else echo "  ✗ $name: output changed"; printf '%s\n' "$msg"; fail=1; fi
}
smoke(){ local name="$1"; shift; if "$@" > "$work/smoke-$name.txt" 2>&1; then echo "  ✓ $name: executed (no recorded comparison)"; else cat "$work/smoke-$name.txt"; fail=1; fi; }
echo "model: $JEV_MODEL"
run curl-first-call        sh -c 'sh examples/curl/first-call.sh | python3 -c "import json,sys;d=json.load(sys.stdin);print(json.dumps({k:{kk:(round(vv,2) if isinstance(vv,float) else vv) for kk,vv in v.items() if kk!=\"probabilities\"} for k,v in d[\"answers\"].items()},ensure_ascii=False,indent=1))"'
smoke python-quickstart      .venv/bin/python examples/python/quickstart.py
run python-unknown-filter  .venv/bin/python examples/python/unknown_filter.py
run python-fanout          .venv/bin/python examples/python/fanout_profile.py
smoke js-quickstart          node examples/js/quickstart.mjs
run cli-ask                node bin/jev.mjs ask "這句話是在抱怨嗎？" --text "又壞了，第三次了"
run cli-pick               sh -c 'echo "幫我把測試跑一遍" | node bin/jev.mjs pick "使用者要什麼？" --options greet,task,question,other'
run cli-rate               node bin/jev.mjs rate "多急？" --levels 可以等幾天,今天要處理,一小時內要處理 --text "系統掛了客戶在等"
run cli-filter             node bin/jev.mjs filter examples/cli/support-messages.txt "Is the writer reporting something broken?" --min 0.5
run cli-classify           node bin/jev.mjs classify examples/cli/support-messages.txt "What does the writer mainly want?" --options bug,billing,feature,question,thanks,other
run cli-run                node bin/jev.mjs run examples/cli/support.questions.json examples/cli/support-messages.txt
# tutorial: inbox lessons (region-neutral everyday messages)
run inbox-classify         node bin/jev.mjs classify examples/cli/inbox-messages.txt "What kind of message is this?" --options "bill:a payment I owe,scam:phishing or fraud,invite:an invitation,appointment:a booking or delivery notice,ad:marketing,personal:someone I know asks me something,other"
run inbox-filter           node bin/jev.mjs filter examples/cli/inbox-messages.txt "Does the sender expect me to reply?" --min 0.5
run inbox-run              node bin/jev.mjs run examples/cli/inbox.questions.json examples/cli/inbox-messages.txt
M="房東說明天早上八點到十點停水，要我今晚先把水存好。"
run tut3-compound          node bin/jev.mjs ask "Is this message urgent and about money?" --text "$M"
run tut3-split-action      node bin/jev.mjs ask "Does this message need action from me within a day?" --text "$M"
run tut3-split-money       node bin/jev.mjs ask "Is this message about money, bills or payments?" --text "$M"
O="scam:a scam or phishing attempt,legit:a genuine message I should act on,unsure:cannot tell from the message alone"
R="這個月房租記得在 5 號前匯，謝謝。"
run tut4-text-only         node bin/jev.mjs pick "What is this message?" --options "$O" --text "$R"
run tut4-unknown-sender    node bin/jev.mjs pick "What is this message?" --options "$O" --json "{\"message\":\"$R\",\"sender\":\"unknown number, not in my contacts\",\"my_situation\":\"I have no pending orders and I own my apartment\"}"
run tut4-landlord          node bin/jev.mjs pick "What is this message?" --options "$O" --json "{\"message\":\"$R\",\"sender\":\"saved contact: my landlord\",\"my_situation\":\"I rent and pay on the 5th every month\"}"
smoke usefulness             node examples/js/usefulness.mjs
echo
echo "golden set (hard check):"
node bin/jev.mjs check examples/cli/inbox.questions.json examples/cli/inbox.cases.jsonl --strict || fail=1
node bin/jev.mjs check examples/cli/support.questions.json examples/cli/support.cases.jsonl --strict || fail=1
node bin/jev.mjs view "$JEV_LOG" --no-open || fail=1
if [ "$mode" = --record ] && [ "$fail" = 0 ]; then
  for file in "$work"/*.txt; do
    case "$(basename "$file")" in smoke-*) continue;; esac
    cp "$file" "examples/expected/$(basename "$file")"
  done
  echo "Updated recorded outputs after all checks passed."
fi
exit $fail
