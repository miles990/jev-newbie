"""投機式廣撒：不知道該問什麼，就一次問一整組，讓程式碼決定哪些答案有用。
Speculative fan-out: when you do not know what to ask, ask a whole set at once and let code decide.
Run: .venv/bin/python examples/python/fanout_profile.py

一次呼叫的問題數幾乎不影響延遲，因為所有問題平行評估。對每則訊息問同一組屬性，
得到一個機率向量，之後排序、分群、設門檻都在程式碼裡做，不必再呼叫模型。
"""
import os
from typesafe_sdk import Noul, Score, TypeSafeClient

messages = [
    "你的信用卡帳單這期 12,480 元，繳款截止 25 日，逾期會有循環利息。",
    "週六晚上小美生日，七點在市中心那家餐廳聚餐，來的話回我一聲～",
    "Your account was used to sign in on a new device. If this wasn't you, secure your account now: account-verify-center.net",
    "【限時】全館服飾 3 折起，只到今晚 12 點！",
    "Hi, this is the clinic. Your appointment is tomorrow at 10:30. Reply Y to confirm or call to reschedule.",
]
# 八個屬性，一次問完。哪些會用到，看下面的政策。 Eight properties in one call; the policy below picks what matters.
PROPS = {
    "needs_reply": "Does the sender expect me to reply?",
    "asks_money": "Does the message ask me to pay or transfer money?",
    "asks_click_or_login": "Does it ask me to click a link, log in, or enter account details?",
    "from_known_person": "Does it read like it comes from someone who knows me personally?",
    "time_bound": "Is there a specific deadline or time I must meet?",
    "is_marketing": "Is this a promotion or advertisement?",
    "claims_institution": "Does it claim to be from a bank, company, clinic or government body?",
    "threatens_consequence": "Does it warn of a penalty, loss or account problem if I do nothing?",
}

with TypeSafeClient(model=os.environ.get("JEV_MODEL")) as client:
    for m in messages:
        r = client.system_one(
            state={"message": m},
            questions={**{k: Noul(instructions=v) for k, v in PROPS.items()},
                       "urgency": Score(instructions="How soon does this need my attention?", criteria=["can wait a week", "within a few days", "today"])},
        )
        p = {k: r.answers[k].noul for k in PROPS}
        urgency = r.answers["urgency"].score
        # 一個簡單、可調的政策；權重與門檻都在這裡。 A simple, editable policy; every threshold is here.
        if p["asks_click_or_login"] > 0.6 and p["claims_institution"] > 0.5 and p["from_known_person"] < 0.4:
            box = "junk: looks like phishing"
        elif p["is_marketing"] > 0.7:
            box = "promotions"
        elif p["asks_money"] > 0.6 and p["time_bound"] > 0.6:
            box = "pay: has a deadline"
        elif p["needs_reply"] > 0.7 and p["from_known_person"] > 0.5:
            box = "reply tonight"
        elif urgency > 1.5:
            box = "today"
        else:
            box = "read later"
        print(f"{box:<26} urgency={urgency:.1f}\n    ← {m[:60]}\n    " + "  ".join(f"{k}={p[k]:.2f}" for k in PROPS))
