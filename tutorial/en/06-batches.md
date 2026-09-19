# Lesson 6: your own data, in batches

*Part 2 begins here. Lessons 1 to 5 used messages everyone gets. From now on the data is yours: your inbox export, your notes, your bookmarks, your team's tickets.*

## Scenario

You exported a week of notifications: 300 lines. You want three lists: what needs a reply, what is a bill with a date, what can be deleted. One at a time would take an afternoon.

**Cause:** one-at-a-time is fine for a single message, useless for a pile. **What this lesson changes:** you point the same questions at a whole file and get a table back, in parallel, for a few cents.

**Goal:** apply one question to a whole file, then a whole set of questions to a whole file.

## Do

```sh
jev filter   examples/cli/inbox-messages.txt "Does the sender expect me to reply?" --min 0.5
jev classify examples/cli/inbox-messages.txt "What kind of message is this?" \
             --options "bill:a payment I owe,scam:phishing or fraud,invite:an invitation,appointment:a booking or delivery notice,ad:marketing,personal:someone I know asks me something,other"
jev run      examples/cli/inbox.questions.json examples/cli/inbox-messages.txt
```

## What you should see (recorded 2026-09-19, jev-1.13.0)

`filter` sorts by probability and marks what passed the bar:

```text
✓  95%  週六晚上小美生日，七點在市中心那家餐廳聚餐，來的話回我一聲～
✓  94%  媽：你上次說的那個電鍋是哪個牌子？我想買一個給阿姨。
✓  93%  Hi, this is the clinic. Your appointment is tomorrow at 10:30. Reply Y to confirm or call to reschedule.
   46%  您的包裹因地址不完整無法投遞，請點擊連結補填資料：http://parcel-redelivery.co/x9
   28%  這個月房租記得在 5 號前匯，謝謝。
   ...
3/8 kept at p ≥ 0.5.
```

`classify` labels every line (8/8 matched what a person would say). `run` prints one row per message and one column per question:

```text
item                                           kind    urgency needs_repl asks_to_cl
你的信用卡帳單這期 12,480 元…                       bill       0.90       0.23       0.02
您的包裹因地址不完整無法投遞…                       scam       0.98       0.46       0.97
週六晚上小美生日…                                 invite       1.10       0.96       0.01
【限時】全館服飾 3 折起…                             ad       1.97       0.12       0.04
Hi, this is the clinic…                     appointmen       1.86       0.94       0.01
```

## Notice

- Items are plain lines. A `.jsonl` file works too: each line's object becomes the whole `state`, which is how you add `sender` or `today` per item (Lesson 4).
- Every item is one request, sent in parallel. Every request is one line in `runs/jev-log.jsonl`.
- The question file for `run` is the full API shape: any `type`, `instructions`, `criteria`. Copy `examples/cli/inbox.questions.json` and edit it. Ask more than you need; extra questions are almost free.
- Look at the ad's urgency: 1.97, "today", because it says "only until midnight". That is literally true and practically wrong. Lesson 8 shows the fix: ads are never urgent, and that rule belongs in code, not in the question.

## Exercise

Export twenty real lines from something you have (notifications, bookmarks, a to-do list, commit messages). Write a question and options that fit. Run `classify`. Look hard at the `unsure` ones.

Next: [Lesson 7: the golden set](07-golden-set.md)
