"""投機式廣撒：不知道該問什麼，就一次問一整組，讓程式碼決定哪些答案有用。
Run: .venv/bin/python examples/python/fanout_profile.py

一次呼叫的問題數幾乎不影響延遲，因為所有問題平行評估。對每個未知項目問同一組屬性，
得到一個機率向量，之後排序、分群、設門檻都在程式碼裡做，不必再呼叫模型。
"""
import os
from typesafe_sdk import Noul, Score, TypeSafeClient

messages = [
    "幫我把這段 SQL 改成用 index，現在跑 40 秒。",
    "謝謝，昨天的修正很有幫助！",
    "系統又掛了！！客戶在等，快點！！！",
    "請問你們有支援 SSO 嗎？",
    "我要取消訂閱並全額退款，這已經是第三次寄信了。",
]
# 十個屬性，一次問完。哪些會用到，看下面的程式碼。
PROPS = {
    "asks_question": "Does the writer ask a question that needs an answer?",
    "reports_outage": "Does the writer report that something is down or broken right now?",
    "requests_refund": "Does the writer ask for money back or cancellation?",
    "expresses_thanks": "Is the message mainly gratitude with nothing to do?",
    "needs_engineer": "Would answering properly require an engineer rather than support staff?",
    "mentions_repeat": "Does the writer say they have contacted before without resolution?",
    "contains_code_or_sql": "Does the message include code, SQL or a technical artifact?",
    "sales_opportunity": "Is the writer evaluating whether to buy or expand usage?",
}

with TypeSafeClient(model=os.environ.get("JEV_MODEL")) as client:
    for m in messages:
        r = client.system_one(
            state={"message": m},
            questions={**{k: Noul(instructions=v) for k, v in PROPS.items()},
                       "urgency": Score(instructions="How urgent is this message?", criteria=["can wait days", "should be handled today", "needs attention within the hour"])},
        )
        p = {k: r.answers[k].noul for k in PROPS}
        urgency = r.answers["urgency"].score
        # 一個簡單、可調的政策；權重與門檻都在這裡。
        if p["reports_outage"] > 0.7 or urgency > 1.5:
            queue = "P1 incident"
        elif p["requests_refund"] > 0.6 and p["mentions_repeat"] > 0.5:
            queue = "escalate: churn risk"
        elif p["needs_engineer"] > 0.6 or p["contains_code_or_sql"] > 0.6:
            queue = "engineering"
        elif p["sales_opportunity"] > 0.6:
            queue = "sales"
        elif p["expresses_thanks"] > 0.7:
            queue = "close, no action"
        else:
            queue = "support"
        print(f"{queue:<22} urgency={urgency:.1f}\n    ← {m}\n    " + "  ".join(f"{k}={p[k]:.2f}" for k in PROPS))
