# Jev as a feature extractor

"Can Jev find features?" Two readings, two answers.

- **Eigenvalues, principal components, any linear algebra:** no. That is arithmetic; Jev does not do it, and code does it perfectly.
- **Features in the machine-learning sense, numeric columns extracted from text:** yes, and this is one of the official use cases ("feature extraction for predictive modeling"). Every Jev question is a feature column. One request per item fills a whole row.

## Why Jev features are unusual

- **They are semantic.** "Does the sender expect a reply?" is a column a bag-of-words model cannot produce and an embedding does not expose directly.
- **They are calibrated probabilities**, so they drop straight into logistic regression, gradient boosting or a spreadsheet without scaling tricks.
- **They are cheap and consistent**, so you can add, drop and re-run columns over the whole dataset in minutes. That is what makes *feature discovery* practical: propose a question, measure whether it predicts the label, keep or discard.
- **They are readable.** A model that uses `asks_click_or_login` and `from_known_person` can be explained to a colleague; a 768-dimensional embedding cannot.

## The run

`examples/js/features.mjs`: twelve messages, ten yes/no features plus one score, one Jev request each, written to `runs/features.csv`. Then a point-biserial correlation with the golden-set label `needs_reply`, computed in code. Recorded 2026-09-19, `jev-1.13.0`:

```text
correlation with label needs_reply (n=5 labeled rows; small, so treat as a hint, not a result):
  asks_click_or_login    r=-0.92  ◆ useful
  asks_money             r=-0.69  ◆ useful
  from_known_person      r=+0.68  ◆ useful
  asks_question          r=+0.66  ◆ useful
  is_marketing           r=-0.63  ◆ useful
  polite_closing         r=+0.56  ◆ useful
  mentions_food          r=+0.48  ◇ weak
  has_deadline           r=-0.41  ◇ weak
  uses_english           r=+0.41  ◇ weak
  urgency                r=-0.09  · noise
  claims_institution     r=-0.00  · noise
```

Five labeled rows is far too few to trust any of these numbers; the script says so. What the run shows is the *shape* of the work: two of the eleven proposed features were noise for this label, `mentions_food` was a deliberately silly feature that still picked up the party invitation, and the strongest signals were the ones a person would have guessed. With a few hundred labeled rows the same table becomes a real feature-selection result.

## The loop this enables

1. Propose questions (you, or an LLM).
2. Jev fills the columns over the labeled set.
3. Code measures predictive value: correlation, information gain, or a held-out score from a small model.
4. Keep the columns that carry signal, drop the rest, propose more. Stop when the held-out score stops improving.

This is the official autoresearch cookbook, which grows a CatBoost regressor this way. It is also the third converging loop from chapter 9, with a classical model as the metric instead of an `other` rate.

## Fourier analysis and other signal methods

Fourier transforms, autocorrelation, wavelets: all arithmetic on a numeric series, so all in code, never in Jev. The seam is the same as with Monte Carlo, on either side of the math:

- **Jev produces the series.** Run one question over every item in time order and you have a signal: the daily share of messages that are complaints, the weekly scam rate, the fraction of an agent's turns that claim completion, the mood of a support queue by hour. A Fourier transform over that series finds periodicity you would not see by eye: a 7-day cycle in complaints, a monthly spike that lines up with billing, a 24-hour pattern in an agent's failures that points at a cron job. Jev turned text into numbers; Fourier found the rhythm.
- **Jev interprets what the math found, as text.** Convert the spectrum into named facts: "dominant period 7 days, second peak 30 days, amplitude rising over the last quarter". Then ask Jev the semantic question the numbers cannot answer: "Given `context` (this is a support queue for a subscription product billed monthly), is a 30-day period expected or anomalous?" Numbers become words first; Jev judges the words.
- **Jev does not touch the transform.** No asking it whether two frequencies are close, whether a peak is significant, or what the period is. Compute it, bucket it, name it, then ask.

Is it necessary? Rarely. Most text pipelines have no periodic structure worth finding. It earns its place when the thing you care about is *rhythm over time* in unstructured data: queues, logs, chats, agent transcripts. There, "Jev features over time → spectral analysis in code → Jev on the named result" is a clean three-step pipeline, and every step is cheap.

## Practical rules

- **Features are questions; write them as literal conditions.** Vague questions give mushy columns.
- **Log the question text with the column.** A CSV of numbers without the questions that produced them is unreproducible.
- **Hold out.** Whoever proposes features must not see the rows the score is computed on.
- **Pin the model.** Feature columns produced by `jev-1.13.0` and by a later version are not guaranteed identical; a trained model is tied to the version that produced its features.
- **Do not ask Jev for the statistics.** Correlations, splits, importances: code.
