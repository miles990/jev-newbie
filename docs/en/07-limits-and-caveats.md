# Limits and caveats

What Jev cannot do, where it is weak, and the small print around using it. Sources: the official [jaggedness page](https://docs.typesafe.ai/model-jaggedness/jev-1.13), [models](https://docs.typesafe.ai/models), [legal](https://docs.typesafe.ai/legal), community reports, and our own measurements on 2026-09-19 with `jev-1.13.0`.

## Hard limits: it simply does not do these

| Limit | What it means for you |
| --- | --- |
| No text generation | It cannot summarize, explain, translate, or name a new category. Pair it with an LLM for those. |
| Text only | No images, audio or video. Convert to text or structured fields first; the visual judgment itself stays with a vision model. |
| Closed answers | A `choice` can only return one of your options. Always include `other`/`none`, or you force a wrong pick. |
| No memory between calls | Every request is independent. Anything it needs to know goes in `state` every time. |
| 64k tokens per request, 32k for state plus the longest question | Long documents must be chunked; results across chunks are combined in code. |

## Soft limits: it is unreliable at these, so keep them in code

From the official jaggedness list, each verified in our runs:

1. **Literal reading.** It answers the words you wrote, not the intent. "Urgent and about money" returned "no" for an urgent water-outage notice, correctly and uselessly. Split compound questions; write boundary cases into the criteria.
2. **Arithmetic and counting.** Do not ask it to add, count occurrences, or compare amounts. Count in code, ask one yes/no per item, sum the answers.
3. **Dates and times.** It reads dates as text. "Is the 25th soon?" got confidence 0.23 because it did not know today's date. Put `today` in the state, or compute the gap in code and pass a named bucket.
4. **Indirection.** Multi-hop reasoning ("the sender's company's policy implies…") degrades. Bring the relevant fact into the state directly.
5. **Large, noisy state.** Irrelevant detail lowers accuracy. Send what the question needs, not the whole record.
6. **Adversarial text.** Content written to manipulate a model can move a probability. Test edge cases; do not make a single Noul the only barrier for anything high-stakes.
7. **Contradictory instructions and criteria.** If the question says one thing and an option description another, answers wobble. Keep them aligned.
8. **Structural invariants.** It does not guarantee that "is A" and "is not A" sum to one, or that levels are used consistently across items. Ask each decision one way; enforce identities in code.
9. **Numeric precision of scores.** A score of 1.38 is not "38% of the way to level 2"; use it to threshold, not to reconstruct a number.

## Calibration: what the probabilities do and do not promise

- Calibration is a property of the model on tasks like its training set, in English. It is not a guarantee on *your* data. Measure with a golden set before trusting a threshold.
- `confidence` describes how concentrated the distribution is, not whether the answer is correct. A confident wrong answer is possible and looks identical to a confident right one; only the golden set tells them apart.
- Several equally acceptable options spread probability and lower confidence without meaning the answer is bad. For harmless preferences, a low confidence need not block.
- Probabilities move by a few hundredths between runs; scores by about a tenth. Labels are stable. Do not put a threshold exactly where your data sits.

## Language

English is the primary training language and where accuracy is best. Chinese works: in our 30-sentence test, Chinese user messages routed as accurately as their English translations, and the inbox golden set passed 19/19. That is one small test, not a guarantee. Test on your own data and pay extra attention to confidence in any non-English workload. Write questions and option descriptions in English even when the data is Chinese; the data itself stays as-is.

## Service and operational caveats

- **Early access.** At launch, access was by waitlist. Rate limits (250k tokens/s, 1,200 requests/min at time of writing) are documented as changing dynamically. Expect 429s; retry with backoff (the SDKs and the `jev` CLI already do).
- **Alias drift.** `jev-latest` moves to new versions without notice. Pin `jev-1.13.0` where thresholds matter and log the `model` field every response carries, so you can re-run the golden set on upgrade.
- **Latency is not 150 ms for you.** Official figures are 70 to 500 ms; measured from Taiwan we saw 250 to 600 ms end to end, and a community project reported about 750 ms direct. Budget for half a second.
- **Cost.** Input tokens only, $0.042 per million. Cheap per call; a million-item batch is still $10 to $40 depending on state size.
- **Data handling.** TypeSafe states it does not train on customer requests or responses; zero-data-retention terms are enterprise-only. Do not send secrets, credentials or whole transcripts. Send the minimum state the question needs.
- **Key handling by tools.** `evaluate setup mcp` writes your API key in plain text into agent config files. Know where it lives; rotate it if a machine is shared.
- **Vercel AI Gateway and Cloudflare Workers AI** serve Jev under their own keys, but the gateway response carries no `confidence` field; derive it from the distribution or use the direct API.

## Design caveats: things Jev should never be the only line of defense for

- Safety, legal, medical and financial gates. Use Jev to flag and to route to a person; keep the hard rules in code and keep a human on the "no" side.
- Anything that needs an explanation to the user. Jev gives the decision; it cannot say why in words. Log the probabilities and the question so a person can.
- Anything with a ground truth you can compute. Exact IDs, sums, date windows, schema validation: code is cheaper, faster and always right.

## Community caveats worth repeating

The awesome-jev maintainers warn that many early projects share one scaffold and a thin commit history; check that a project actually calls the API, has a runnable check, and sources its numbers before adopting it. The same standard applies to this repo, which is why every output here is recorded and re-run by `npm run verify`.
