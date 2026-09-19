# Lesson 2: three kinds of question

## Scenario

Three messages, three different worries. A security alert: is it trying to make me click? A party invitation: what kind of message is this? A clinic reminder: how soon do I need to deal with it? A single "important or not" switch cannot hold those three answers.

**Cause:** different questions have different answer shapes; forcing them through one shape loses information. **What this lesson changes:** you pick the question type by what the answer means.

**Goal:** learn when to ask yes/no, pick-one, or rate, using the `jev` command.

## Do

```sh
jev ask  "Is this message trying to get me to click a link or log in?" \
         --text "Your account was used to sign in on a new device. If this wasn't you, secure your account now: account-verify-center.net"
jev pick "What kind of message is this?" \
         --options "bill:a payment I owe,scam:phishing or fraud,invite:an invitation,personal:someone I know asks me something,other" \
         --text "週六晚上小美生日，七點在市中心那家餐廳聚餐，來的話回我一聲～"
jev rate "How soon does this need my attention?" --levels "can wait a week,within a few days,today" \
         --text "Hi, this is the clinic. Your appointment is tomorrow at 10:30. Reply Y to confirm or call to reschedule."
```

## What you should see (recorded 2026-09-19, jev-1.13.0)

```text
███████████████████·  97%  yes                    ← ask: one probability

████████████████████ 100%  invite  ←              ← pick: every option gets a share
····················   0%  personal
····················   0%  other
····················   0%  bill
····················   0%  scam
confidence 1.00

····················   0%  0 can wait a week      ← rate: a distribution over ordered levels
█████···············  23%  1 within a few days
███████████████·····  77%  2 today
score 1.77 of 2  → today  confidence 0.65
```

## Which one to use

| You want to know | Use | Why |
| --- | --- | --- |
| whether a condition holds | `ask` (noul) | one number, no confidence needed |
| which one of a known set | `pick` (choice) | you get the runner-up too, and a confidence |
| how much, along one dimension | `rate` (score) | levels are ordered, so 1.77 means "closer to today than to a few days" |

Two rules that save you later:
- `pick` **always** gets an `other` option. Without it the model must pick something even when nothing fits.
- `rate` levels must describe situations, not adjectives. "within a few days" beats "medium".

## Exercise

Run `jev pick` on a message that fits none of your options and watch `other` win or the confidence collapse. That is the model telling you the set is incomplete.

Next: [Lesson 3: writing a question the model can answer](03-writing-questions.md)
