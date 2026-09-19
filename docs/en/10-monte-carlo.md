# Monte Carlo with Jev

Jev's answers are calibrated probabilities. That is exactly the input Monte Carlo methods want. The pairing works in one direction: **Jev supplies the per-item probabilities once; code samples from them as many times as it likes.** Never the other way round, because Jev cannot sample, count or add.

## Three things it buys you

**1. Policy simulation.** Sample each message's "true" outcome from Jev's probabilities ten thousand times, apply a threshold policy, and count how often it deletes a real message or misses a reply. You get a distribution, not a single guess, and you can compare two thresholds on the same sampled worlds.

**2. Expected-cost decisions.** Instead of a fixed cutoff, give each action a cost and pick the lowest expected cost per item: `E[delete] = (1 − p_scam) × cost_of_deleting_real`, and so on. Thresholds disappear; what remains is a cost table you can argue about with a colleague.

**3. Confidence intervals on your golden set.** Bootstrap the labeled cases to see how much your "8/8" actually promises. With eight cases the interval is wide and the script says so.

## The run

`examples/js/monte-carlo.mjs`, one Jev pass over twelve messages (the inbox plus four deliberately ambiguous ones), then pure arithmetic with a seeded random generator, so re-runs reproduce the same numbers for the same probabilities. Recorded 2026-09-19, `jev-1.13.0`:

```text
Policy simulation over 10000 sampled weeks of this inbox:
  delete if p(scam)>0.8,  reply if p(reply)>0.7: wrong deletes/wk=0.000, missed replies/wk=1.17, replies owed p50/p90=5/6
  delete if p(scam)>0.95, reply if p(reply)>0.5: wrong deletes/wk=0.000, missed replies/wk=1.16, replies owed p50/p90=5/6

Expected-cost decisions (minutes of pain):
  ignore  E=  2.2  (delete 34.0, reply 2.7, ignore 2.2)  Package arriving today. Track it here: b…
  reply   E=  1.8  (delete 37.6, reply 1.8, ignore 5.8)  這個月房租記得匯，謝謝。（來自未儲存的號碼）
  delete  E=  0.0  (delete  0.0, reply 1.7, ignore 1.0)  帳號有異常登入，請回撥 0800-123-456 確認身分。
```

Two honest observations. The deletion threshold did not matter at all on this inbox: every message Jev thought might be a scam it thought so at 0.99 or above, and everything else sat below 0.15, so no policy between 0.6 and 0.95 ever deleted a real message. Monte Carlo has something to say only where the probabilities are actually in the middle; here that was the reply question, where three messages sat between 0.15 and 0.45 and produced about one missed reply per week under every policy. That is the real finding: not "which threshold", but "the reply question is where the uncertainty lives, so that is where to spend a golden set".

## Other places the pairing fits

- **Cost of errors under uncertain costs.** When the cost numbers themselves are distributions (how bad is a missed reply, really?), sample them too.
- **Decision loops.** In the game and drone projects from the community, Jev's `choice` distribution acts as a policy prior and code runs rollouts. Jev at 300 ms is fast enough for a few hundred leaf evaluations per decision if you fingerprint states and cache; not for millions.
- **Robustness estimation.** Jev is nearly deterministic for identical input, so sampling the *same* input is wasted. Sample the *state* instead: paraphrase the question, reorder options, drop a field, and look at how much the answer moves. That is a Monte Carlo over inputs, and it is the honest way to measure how brittle a question is.

## What not to do

- Do not ask Jev to simulate, count or add. Everything after the one pass is code.
- Do not treat Jev's probability as a random draw: it is a point estimate of a probability. The randomness belongs to the world you sample, not to the model.
- Do not report a Monte Carlo result without the golden set beside it. Calibration is what makes the sampling meaningful; the golden set is what tells you the calibration holds on your data.
