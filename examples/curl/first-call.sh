#!/usr/bin/env sh
# 最小可行的一次呼叫：一個 state，三種問題各一題。只需要 curl 與 TYPESAFE_API_KEY。
# The smallest possible call: one state, one question of each type.
set -eu
: "${TYPESAFE_API_KEY:?請先 export TYPESAFE_API_KEY=... (get one at https://console.typesafe.ai)}"
curl -sS https://api.typesafe.ai/v1/systemone \
  -H "Authorization: Bearer $TYPESAFE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "jev-latest",
    "state": {"message": "付款失敗三天了，今天一定要處理，不然我要退款。"},
    "questions": {
      "urgent":     {"type": "noul",   "instructions": "Does the message convey time pressure?"},
      "department": {"type": "choice", "instructions": "Which team should handle this message?",
                     "criteria": {"billing": "payments, refunds, invoices", "technical": "bugs, outages", "other": "anything else"}},
      "frustration":{"type": "score",  "instructions": "How frustrated is the writer?",
                     "criteria": ["calm", "annoyed but civil", "very angry"]}
    }
  }' | python3 -m json.tool
