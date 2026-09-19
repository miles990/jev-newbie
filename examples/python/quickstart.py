"""第一支 Python 程式：一則收件匣訊息、三種問題、一次呼叫、程式碼決定該怎麼處理。
Your first Python program: one inbox message, three questions, one call, code decides what to do.
Run: .venv/bin/python examples/python/quickstart.py
"""
import os
from typesafe_sdk import Choice, Noul, Score, TypeSafeClient

# 除了訊息本身，也把你已經知道的事實放進 state：這封是誰寄的、你最近有沒有訂東西。
# Besides the message, put the facts you already know into the state: who sent it, whether you ordered anything.
state = {
    "message": "您的包裹因地址不完整無法投遞，請點擊連結補填資料：http://parcel-redelivery.co/x9",
    "sender": "unknown number, not in my contacts",
    "my_recent_orders": "none in the last month",
}

with TypeSafeClient(model=os.environ.get("JEV_MODEL")) as client:  # reads TYPESAFE_API_KEY from the environment
    r = client.system_one(
        state=state,
        questions={
            "kind": Choice(
                instructions="What kind of message is this?",
                criteria={
                    "bill": "a payment I genuinely owe",
                    "scam": "phishing or fraud: asks me to click, log in or pay through an odd channel",
                    "appointment": "a real delivery, booking or appointment notice",
                    "personal": "someone I know wants a conversation",
                    "other": "none of the above clearly fits",
                },
            ),
            "needs_reply": Noul(instructions="Does the sender expect me to reply?"),
            "urgency": Score(
                instructions="How soon does this need my attention?",
                criteria=["can wait a week", "within a few days", "today"],
            ),
        },
    )

kind, reply, urg = r.answers["kind"], r.answers["needs_reply"], r.answers["urgency"]
print(f"kind        = {kind.choice}  (confidence {kind.confidence:.2f})  {dict(sorted(kind.probabilities.items()))}")
print(f"needs_reply = {reply.noul:.2f}")
print(f"urgency     = {urg.score:.2f} of {len(urg.legend) - 1}")

# 決策寫在程式碼裡，門檻看得見、改得動，儲存答案後可離線調整；重跑本腳本仍會呼叫 API。
# The policy lives in code: thresholds are visible and editable after saving and reusing answers; running this script again calls the API.
if kind.confidence < 0.5:
    action = "show it to me: the model is not sure what this is"
elif kind.choice == "scam":
    action = "flag as suspicious for me to review"
elif kind.choice == "bill" and urg.score > 1.5:
    action = "put 'pay today' at the top of my list"
elif reply.noul > 0.7:
    action = "remind me to reply tonight"
else:
    action = "file under read-later"
print("action      =", action)
