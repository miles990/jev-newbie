# Lesson 3: writing a question the model can answer

## Scenario

You set up a filter: "flag anything urgent and about money". The landlord's message that the water will be off tomorrow morning sails through unflagged. You find out when the tap runs dry.

**Cause:** the question bundled two judgments; the message was urgent but not about money, so the bundle said "no". **What this lesson changes:** you learn to see that failure in the numbers and split the question so each answer means one thing.

**Goal:** see with your own eyes why compound questions fail, and how splitting fixes it.

## Do

```sh
M="房東說明天早上八點到十點停水，要我今晚先把水存好。"
jev ask "Is this message urgent and about money?"              --text "$M"
jev ask "Does this message need action from me within a day?"  --text "$M"
jev ask "Is this message about money, bills or payments?"      --text "$M"
```

## What you should see (recorded 2026-09-19, jev-1.13.0)

```text
█···················   7%  no         ← compound: "urgent and about money"
███████████████████·  94%  yes        ← split 1: needs action within a day
█···················   5%  no         ← split 2: about money?
```

## Notice

The compound question answered "no" with confidence, and it was *literally correct*: the message is not about money. But you did not want a literal AND; you wanted to be warned about urgent things. The split questions give you both facts separately, and your code decides what to do with them:

```js
const urgent = a.needsActionSoon.noul > 0.7;
const money  = a.aboutMoney.noul > 0.65;
const flag = urgent ? (money ? "pay today" : "do today") : money ? "bill" : "later";
```

This is the single most common mistake with Jev, and it is mechanical to fix: **one judgment per question, combine in code.**

## Three more habits

1. **Write the literal condition.** Jev answers what you wrote. If a wrong answer makes you say "what I meant was…", put that sentence in the question.
2. **Describe options.** `--options "bill:a payment I owe,scam:phishing or fraud,other"` beats bare names.
3. **Put boundary cases in the criteria.** "A reminder from my landlord counts as a bill" settles the argument before it happens.

## Exercise

Take a question you would naturally write with "and" or "or" in it. Split it. Run both versions on three messages and compare.

Next: [Lesson 4: state and context](04-state-and-context.md)
