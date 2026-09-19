#!/usr/bin/env sh
# 最小可行的一次呼叫：一則收件匣訊息，三種問題各一題。只需要 curl 與 TYPESAFE_API_KEY。
# The smallest possible call: one inbox message, one question of each type.
set -eu
: "${TYPESAFE_API_KEY:?請先 export TYPESAFE_API_KEY=... (get one at https://console.typesafe.ai)}"
curl -sS https://api.typesafe.ai/v1/systemone \
  -H "Authorization: Bearer $TYPESAFE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "'"${JEV_MODEL:-jev-latest}"'",
    "state": {"message": "你的信用卡帳單這期 12,480 元，繳款截止 25 日，逾期會有循環利息。"},
    "questions": {
      "needs_action_today": {"type": "noul",   "instructions": "Does this message need me to do something today?"},
      "kind":    {"type": "choice", "instructions": "What kind of message is this?",
                  "criteria": {"bill": "a payment I owe", "scam": "phishing or fraud", "ad": "marketing", "other": "anything else"}},
      "urgency": {"type": "score",  "instructions": "How soon does this need my attention?",
                  "criteria": ["can wait a week", "within a few days", "today"]}
    }
  }' | python3 -m json.tool
