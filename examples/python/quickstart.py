"""第一支 Python 程式：三種問題、一次呼叫、程式碼決定。
Run: .venv/bin/python examples/python/quickstart.py
"""
import os
from typesafe_sdk import Choice, Noul, Score, TypeSafeClient

state = {"ticket": "付款失敗三天了，今天一定要處理，不然我要退款。", "account_tier": "business"}

with TypeSafeClient(model=os.environ.get("JEV_MODEL")) as client:  # reads TYPESAFE_API_KEY from the environment
    r = client.system_one(
        state=state,
        questions={
            "urgent": Noul(instructions="Does the ticket explicitly communicate time pressure?"),
            "intent": Choice(
                instructions="What is the customer's main request?",
                criteria={
                    "refund": "wants money returned",
                    "fix": "wants a bug or failure fixed",
                    "information": "asks a question only",
                    "other": "none of the above clearly fits",
                },
            ),
            "frustration": Score(
                instructions="How frustrated does the customer appear?",
                criteria=["calm", "annoyed but civil", "very angry"],
            ),
        },
    )

intent, urgent, frus = r.answers["intent"], r.answers["urgent"], r.answers["frustration"]
print(f"intent      = {intent.choice}  (confidence {intent.confidence:.2f})  {intent.probabilities}")
print(f"urgent      = {urgent.noul:.2f}")
print(f"frustration = {frus.score:.2f} of {len(frus.legend) - 1}")

# 決策寫在程式碼裡，門檻看得見、改得動，不必重新呼叫模型。
if intent.confidence < 0.5:
    action = "ask a human: the model is not sure what this is"
elif intent.choice == "refund" and urgent.noul > 0.7:
    action = "route to billing with priority flag"
elif intent.choice == "refund":
    action = "route to billing"
else:
    action = f"route to {intent.choice}"
print("action      =", action)
