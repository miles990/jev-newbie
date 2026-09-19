# Lesson 1: your first call

## Scenario

A credit-card statement lands in your inbox between two ads. You know the drill: find the amount, find the due date, decide whether it is today's problem. Every month you do this by eye, and twice a year you miss one.

**Cause:** the information is in the text, but nothing reads the text for you. **What this lesson changes:** you send the message to Jev with three questions and get back numbers a reminder app could act on.

**Goal:** see exactly what goes in and what comes out, with nothing but `curl`.

## Do

```sh
sh examples/curl/first-call.sh
```

## What you should see

The script sends one `state` and three questions. The recorded answer (`examples/expected/curl-first-call.txt`, model `jev-1.13.0`):

```json
{
 "needs_action_today": {"type": "noul",   "noul": 0.12},
 "kind":               {"type": "choice", "choice": "bill", "confidence": 0.99},
 "urgency":            {"type": "score",  "score": 0.6, "confidence": 0.23,
                        "legend": {"0": "can wait a week", "1": "within a few days", "2": "today"}}
}
```

## Notice

- The message was Chinese; the questions were English. That is the normal setup.
- `noul` is a probability, not a verdict. 0.12 for "needs action today" reads as "probably not today", which is right: the due date is the 25th.
- `choice` returns the pick **and** a distribution over every option (omitted above) **and** a confidence. 0.99 on `bill` means nothing else came close.
- `score` is a weighted position between levels: 0.6 sits between "can wait a week" and "within a few days". Its confidence is only 0.23, because without today's date the model genuinely cannot tell how far away the 25th is. That is honest, and Lesson 4 shows how to fix it: give it the date.
- Nothing came back as prose. There is nothing to parse.

## Exercise

Change the `state` in the script to a message from your own inbox and run it again. Do not change the questions yet.

Next: [Lesson 2: three kinds of question](02-three-question-types.md)
