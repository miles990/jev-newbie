# Lesson 8: policy in code and watching the log

## Scenario

The questions are measured. Now they have to run on their own every morning. What happens to a message at 55% confidence? Who decided that "scam" gets deleted but "bill" only gets flagged? When a real bill ends up in junk next month, can anyone see what the model saw?

**Cause:** probabilities are not decisions, and decisions nobody wrote down cannot be reviewed. **What this lesson changes:** the policy becomes ten lines of code in one place, and every call leaves a log line you can open.

**Goal:** turn probabilities into decisions in a way you can read, change and audit.

## Do

```sh
.venv/bin/python examples/python/quickstart.py     # or: node examples/js/quickstart.mjs
jev view                                            # opens runs/report.html
```

## What you should see (recorded 2026-09-19, jev-1.13.0)

```text
kind        = scam  (confidence 1.00)  {'appointment': 0.0, 'bill': 0.0, 'other': 0.0, 'personal': 0.0, 'scam': 1.0}
needs_reply = 0.49
urgency     = 0.39 of 2
action      = move to junk and block the sender
```

and the last lines of `quickstart.py`, which are the whole policy:

```python
if kind.confidence < 0.5:
    action = "show it to me: the model is not sure what this is"
elif kind.choice == "scam":
    action = "move to junk and block the sender"
elif kind.choice == "bill" and urg.score > 1.5:
    action = "put 'pay today' at the top of my list"
elif reply.noul > 0.7:
    action = "remind me to reply tonight"
else:
    action = "file under read-later"
```

## Notice

- **Three bands, not one cutoff.** Below 0.5 confidence the code refuses to guess and shows you the message. Above, it acts. In between you can add a `review` state; the `jev` command does this with `unsure`.
- **Thresholds scale with risk.** Deleting needs a higher bar than flagging. Wrong in the cheap direction is recoverable; wrong in the expensive direction is not.
- **Policy beats literal truth.** Remember the ad that was "urgent" because of a midnight deadline? Add one line: `elif kind.choice == "ad": action = "promotions"` *before* the urgency check. No new question, no new call.
- **The policy is ten lines in one place.** Changing a threshold is a code review, not a model change, and it needs no API call: the log already holds the probabilities.
- **Every call is a log line.** Open the report `jev view` produced. The histogram at the top is the health check: answers piled at 0 and 1 mean clear questions; a hump in the middle means an unclear question or unclear data. Fix the question before touching thresholds.

## Exercise

Add the `ad` rule, then change 0.7 to 0.9 and re-run. Then change a question and watch the histogram move in `jev view`. Notice which change needed a new API call and which did not.

Next: [Lesson 9: the unknown, and into your codebase](09-unknown-and-integration.md)
