# Lesson 4: state and context

## Scenario

"Remember to transfer this month's rent before the 5th, thanks." If it is from your landlord it is a bill. If it is from an unknown number and you own your flat, it is a scam. The words are identical.

**Cause:** the model only saw the message; who sent it and your situation lived in your head. **What this lesson changes:** you put the facts your phone already knows into the `state`, and the same question starts giving the answer that is true for *you*.

**Goal:** see that the same message gets a different, correct answer when you supply context.

## Do

```sh
Q="What is this message?"
O="scam:a scam or phishing attempt,legit:a genuine message I should act on,unsure:cannot tell from the message alone"
R="這個月房租記得在 5 號前匯，謝謝。"
jev pick "$Q" --options "$O" --text "$R"
jev pick "$Q" --options "$O" --json "{\"message\":\"$R\",\"sender\":\"unknown number, not in my contacts\",\"my_situation\":\"I have no pending orders and I own my apartment\"}"
jev pick "$Q" --options "$O" --json "{\"message\":\"$R\",\"sender\":\"saved contact: my landlord\",\"my_situation\":\"I rent and pay on the 5th every month\"}"
```

## What you should see (recorded 2026-09-19, jev-1.13.0)

```text
█████████████████···  84%  legit  ←     confidence 0.76   ← text only: a guess
████████████████████  99%  scam   ←     confidence 0.99   ← unknown sender, I own my flat
████████████████████  99%  legit  ←     confidence 0.98   ← from my landlord, I rent
```

## Notice

- With the text alone the model leans "legit" but is not sure (0.76). With context it is certain both ways, and both are right.
- `state` is not just "the text". It is everything a careful friend would want to know before judging: the message, who sent it, what your situation is, what happened before.
- Use a JSON object with named fields (`--json`) whenever there is more than one piece. Refer to fields in the question when it helps: "Given `sender` and `my_situation`, what is this?"
- Remember Lesson 1: the bill's urgency had confidence 0.23 because the model did not know today's date. Adding `"today": "2026-09-19"` to the state is the same trick.
- Do not dump everything. Irrelevant detail makes answers worse. Send what the question needs.

## Exercise

Pick a message whose meaning depends on who sent it. Ask with and without `sender` in `--json` and watch the answer move.

Next: [Lesson 5: is this useful to me?](05-is-it-useful.md)
