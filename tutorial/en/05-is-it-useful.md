# Lesson 5: is this useful to me?

## Scenario

You want to sleep better. In one evening you meet an article, a mattress ad, a friend's tip, a research summary, an app with a free trial, a forum post about melatonin, and, because the internet is the internet, a banana bread recipe. "Is this useful?" is the question you ask about everything, all day, and you answer it by gut.

**Cause:** "useful" is not one judgment. It is relevance, actionability, credibility, safety, cost and whether someone is selling you something, weighted by what *you* care about. **What this lesson changes:** Jev judges each dimension separately; your code adds them up with weights you can change without asking again.

**Goal:** turn "is it useful?" into a repeatable, explainable ranking.

## Do

```sh
node examples/js/usefulness.mjs
```

The candidates are in `examples/usefulness/candidates.jsonl`, each with the same `goal` and a different `item`. The six questions are in `examples/usefulness/usefulness.questions.json`.

## What you should see (recorded 2026-09-19, jev-1.13.0)

```text
0.90  worth trying       Research summary: a 2023 meta-analysis of 20 trials found that a fixed…
      relevance=0.93  actionable=0.95  credible=0.91  safe=0.93  cheap=0.68  notPitch=0.96
0.90  worth trying       Article: '10 tips for better sleep' on a lifestyle site…
      relevance=0.98  actionable=0.96  credible=0.76  safe=0.93  cheap=0.79  notPitch=0.91
0.84  worth trying       A friend's message: 'Honestly the only thing that worked for me was no…
      relevance=0.98  actionable=0.97  credible=0.50  safe=0.92  cheap=0.66  notPitch=0.97
0.63  REJECT: unsafe     Forum post: 'Try taking 10 mg of melatonin every night, it knocks me o…
      relevance=0.92  actionable=0.71  credible=0.16  safe=0.33  cheap=0.51  notPitch=0.93
0.59  maybe              App listing: 'Calm Nights: guided meditations, 7-day free trial, then…
      relevance=0.89  actionable=0.30  credible=0.25  safe=0.86  cheap=0.85  notPitch=0.03
0.39  skip               Ad: 'The SmartSleep mattress uses AI to adapt to your body. Only $1,29…
      relevance=0.82  actionable=0.08  credible=0.13  safe=0.57  cheap=0.00  notPitch=0.02
0.31  ignore: unrelated  A recipe for banana bread.
      relevance=0.01  actionable=0.59  credible=0.05  safe=0.87  cheap=0.50  notPitch=0.88
```

## Notice

- **Every number has a reason you can read.** The friend's tip scores high on actionable and low on credible; the research summary is high on both. The mattress ad is relevant but is a pitch and costs a lot. You can argue with any line, and the argument is about a specific dimension.
- **The weights are yours.** Open `usefulness.mjs`; the `W` object is the whole policy. Care more about credibility? Change 0.2 to 0.4 and re-run; no new API call is needed because the six answers are already in the log.
- **Hard rules never go through the weighted sum.** The melatonin post scores 0.63 but is rejected because `safe` came back 0.33. Safety is a gate, not a weight.
- **"Unrelated" is caught by relevance, not by an `other` option.** Ask "how directly does this address my goal?" and a banana bread recipe answers itself.

This pattern is called composite scoring in the official docs. It works for anything you judge repeatedly: job listings, apartments, courses, tools, articles, pull requests.

## Exercise

Change the `goal` in `candidates.jsonl` to something you actually want ("learn to cook three weeknight dinners", "find a laptop for video editing under $1,000") and paste five things you found today as `item`s. Run it. Then change one weight and see what moves.

Next: [Lesson 6: your own data, in batches](06-batches.md)
