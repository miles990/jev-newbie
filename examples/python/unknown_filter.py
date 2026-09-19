"""對「沒見過的訊息」做篩選：固定問題、未知輸入、other 選項、低信心就攔下。
Filtering messages you have never seen: fixed questions, unknown inputs, an `other` option, low confidence stops.
Run: .venv/bin/python examples/python/unknown_filter.py

Jev 的封閉集合限制的是答案，不是輸入。下面的訊息沒有一則事先列舉過；固定的是問題。
新的種類會以「other」或平坦的機率分布出現，程式碼把它們攔下來交給人。
"""
import os
from typesafe_sdk import Choice, Noul, TypeSafeClient

# 任意、未事先列舉的訊息：有平常的，有沒遇過的種類，有一則根本不是給人看的。
messages = [
    "這個月房租記得在 5 號前匯，謝謝。",
    "Your account was used to sign in on a new device. If this wasn't you, secure your account now: account-verify-center.net",
    "法院通知：您有一件民事調解案件，請於 10/3 上午九時到場。",
    "恭喜！您被選中領取 0.5 BTC 空投，請連接錢包領取。",
    "家長您好，下週三校外教學請攜帶水壺與雨具，回條請於週一交回。",
    "\\x00\\x1f\\x8b\\x08\\x00binary-blob-000",
]
KINDS = {
    "bill": "a payment I genuinely owe",
    "scam": "phishing or fraud",
    "invite": "an invitation to an event",
    "appointment": "a real delivery, booking or appointment notice",
    "personal": "someone I know wants a conversation",
    "other": "a real message, but none of the kinds above fits",
}

with TypeSafeClient(model=os.environ.get("JEV_MODEL")) as client:
    for m in messages:
        r = client.system_one(
            state={"message": m},
            questions={
                "kind": Choice(instructions="What kind of message is this?", criteria=KINDS),
                "is_message": Noul(instructions="Is this readable text meant for a person at all?"),
                "official": Noul(instructions="Does this claim to come from a government body, school, bank or other institution?"),
            },
        )
        k, is_msg, official = r.answers["kind"], r.answers["is_message"], r.answers["official"]
        if is_msg.noul < 0.5:
            verdict = "NOT A MESSAGE → ignore"
        elif k.choice == "other" or k.confidence < 0.5:
            verdict = "NEW KIND → show me, I may need a new category"
        else:
            verdict = k.choice
        flag = "  ⚑ claims to be official" if official.noul > 0.6 else ""
        print(f"{verdict:<44} conf={k.confidence:.2f}{flag}\n    ← {m[:60]}")
