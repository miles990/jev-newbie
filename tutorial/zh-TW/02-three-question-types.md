# 第 2 課：三種問題

## 情境

三則訊息，三種擔心。一則安全警示：它是不是想騙我點連結？一則生日邀約：這是哪一類訊息？一則診所提醒：我多快要處理？一個「重要／不重要」的開關裝不下這三個答案。

**原因：** 不同的問題有不同的答案形狀，硬塞進一種形狀會丟資訊。**這一課改變什麼：** 你依答案的意義選問題型別。

**目標：** 用 `jev` 指令學會什麼時候問是非、單選、程度。

## 做

```sh
jev ask  "Is this message trying to get me to click a link or log in?" \
         --text "Your account was used to sign in on a new device. If this wasn't you, secure your account now: account-verify-center.net"
jev pick "What kind of message is this?" \
         --options "bill:a payment I owe,scam:phishing or fraud,invite:an invitation,personal:someone I know asks me something,other" \
         --text "週六晚上小美生日，七點在市中心那家餐廳聚餐，來的話回我一聲～"
jev rate "How soon does this need my attention?" --levels "can wait a week,within a few days,today" \
         --text "Hi, this is the clinic. Your appointment is tomorrow at 10:30. Reply Y to confirm or call to reschedule."
```

## 你應該看到（2026-09-19 錄，jev-1.13.0）

```text
███████████████████·  97%  yes                    ← ask：一個機率

████████████████████ 100%  invite  ←              ← pick：每個選項都有份額
····················   0%  personal
····················   0%  other
····················   0%  bill
····················   0%  scam
confidence 1.00

····················   0%  0 can wait a week      ← rate：有序等級上的分布
█████···············  23%  1 within a few days
███████████████·····  77%  2 today
score 1.77 of 2  → today  confidence 0.65
```

## 用哪一種

| 你想知道 | 用 | 為什麼 |
| --- | --- | --- |
| 一個條件成不成立 | `ask`（noul） | 一個數字，不需要信心值 |
| 已知集合裡的哪一個 | `pick`（choice） | 連第二名和信心值都拿到 |
| 某個維度上有多少 | `rate`（score） | 等級有序，1.77 是「比幾天內更接近今天」 |

兩條以後會救你的規則：
- `pick` **一定**要有 `other`。沒有它，模型即使都不合也得選一個。
- `rate` 的等級要描述情境，不是形容詞。「幾天內」勝過「中等」。

## 練習

拿一則跟你的選項都不合的訊息跑 `jev pick`，看 `other` 勝出或信心崩掉。那是模型在告訴你集合不完整。

下一課：[第 3 課：寫出模型答得了的問題](03-writing-questions.md)
