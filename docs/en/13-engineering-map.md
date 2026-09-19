# Jev and the rest of engineering: a map

Strip Jev down to what it is: **a cheap, fast, calibrated oracle for semantic predicates over text.** Give it a state and a closed question; get back a probability, a label with a distribution, or a position on a scale, in under a second, for a fraction of a cent, consistently.

That one sentence tells you how it combines with everything else. Every engineering method that **consumes** a probability, a label or a score can now consume one *about text*. Every method that **produces** candidates, states or hypotheses can have them *judged* for almost nothing. And every method that establishes **truth** (a test, a proof, a measurement, a person) stays exactly where it is, with Jev beside it.

## The three seams

| Seam | What crosses it | Examples |
| --- | --- | --- |
| Numbers out of text | Jev's probabilities, labels, scores become inputs | statistics, decision theory, control loops, ML features, signal processing |
| Judgment over candidates | things other methods generate get a typed verdict | search, optimization, LLM generation, planning, retrieval |
| Truth stays elsewhere | Jev triages, flags, routes; it does not decide | tests, compilers, sensors, arithmetic, law, medicine, a human |

## The map, discipline by discipline

| Discipline | Its method | Where Jev plugs in | What it does not replace |
| --- | --- | --- | --- |
| **Decision theory** | expected utility, cost of error | calibrated `p` per item × your cost table → lowest expected cost action; three-band thresholds scale with stakes | the cost table; the decision on high-stakes actions |
| **Statistics** | hypothesis tests, confidence intervals, bootstrap, calibration | Jev answers are the sample; bootstrap the golden set; check calibration on your data; per-item Bernoulli parameters for simulation | the arithmetic; significance judgments |
| **Monte Carlo / simulation** | sample worlds, propagate uncertainty | Jev supplies the per-item probabilities once; code samples ten thousand times | sampling itself; anything Jev must never "estimate" numerically |
| **Control theory** | feedback, setpoints, observers, safety envelopes | Jev is a slow advisory observer (2 to 10 Hz) that names the situation; fast deterministic loops keep the veto; scene fingerprints avoid re-asking | the controller; the safety reflex |
| **Optimization & search** | hill-climbing, beam search, MCTS, evolutionary loops | Jev is the cheap objective or the policy prior: score every candidate each round; monotone acceptance; stop on no progress | the search algorithm; termination logic; the ground-truth objective when one exists |
| **Machine learning** | feature engineering, active learning, ensembles, distillation | each question is a semantic feature column; disagreement or low confidence selects what to label next; Jev features train a classical model that then runs for free | the model training; the statistics of feature selection |
| **Information retrieval** | BM25, embeddings, rerankers, RAG | first-stage retrieval in code or embeddings; Jev reranks the shortlist, classifies passages, drops injected instructions | the index; exact match |
| **Signal processing** | Fourier, autocorrelation, change detection | Jev turns a text stream into a numeric series over time; code finds periodicity; Jev interprets the named result | the transform |
| **Software engineering** | types, tests, CI gates, contracts, code review | Jev is a typed predicate you can put in a gate: "does this diff cover the claim?", "is this PR risky?", "is the agent done?"; golden sets are its unit tests; `--strict` fails CI | compilers, test suites, linters for syntactic properties |
| **Reliability engineering** | fail-open, circuit breakers, shadow mode, SLOs, canaries | every Jev gate fails open on 429/timeout; ship in shadow mode first; log every call; pin the model version like a dependency | the incident response; the deterministic rules |
| **Queueing & operations** | triage, priority, routing, capacity | intent and urgency per item feed the queue discipline; expected-cost routing; escalate on low confidence | the queue math |
| **Formal methods** | invariants, contracts, assertions | Jev gives no invariants; code enforces identities (`p(A) + p(¬A) = 1` is not guaranteed by the model); typed output guarantees shape, not truth | proofs; schema validation |
| **Human factors / HCI** | escalation, explainability, trust calibration | confidence bands decide when a person sees the item; probabilities are shown, not hidden; readable feature names replace embeddings | the explanation in words (an LLM or a person writes it) |
| **Security** | allowlists, threat models, defense in depth | semantic checks on every tool call and tool result: destructive? exfiltration? prompt injection?; one layer among several, never the only one | the hard rules; secrets handling; authorization |
| **Economics** | cost of information, marginal value | at $0.00002 per judgment, "ask about everything" is rational; the expensive step (LLM, vision, human) is spent only where Jev says it is worth it | budgeting the expensive step |
| **Experimental design** | golden sets, held-out data, A/B, ablation | label 20 to 30 real items before trusting a threshold; hold out from any proposer; ablate a question and re-run the whole set for cents | the experiment's conclusion |
| **Knowledge & ontology work** | taxonomies, entity resolution, alignment | grow a category list by looping `other` through an LLM; align records by asking "same entity?" with three outcomes | naming the new category; the final merge decision |
| **Perception (vision, audio)** | detectors, OCR, ASR, VLMs | nothing until it is text; then Jev structures findings, selects among candidates, gates the expensive call | seeing and hearing |
| **Generative AI / agents** | LLMs, tool use, multi-agent | Jev before (route, guard), into (typed facts in the prompt), after (verify, retry), and around (compaction, wake gating, skill selection) | generation; naming; explanation |

## What the combination buys, in one line each

- **Cheap enough to ask about everything**, so filters move in front of expensive steps instead of behind them.
- **Fast enough for loops**, so evaluation goes inside the iteration instead of at the end.
- **Calibrated enough to compute with**, so probabilities flow into expected costs, simulations and features instead of being thresholded once and thrown away.
- **Typed enough to test**, so a judgment becomes a unit test, a CI gate, a schema-bound column.
- **Consistent enough to compare**, so a change in the metric means a change in the input, not noise.

## What it does not change

The oracle for truth. Tests still test, compilers still compile, sensors still measure, people still decide the things that need a person. Jev takes the semantic predicates that used to be regexes, keyword tables, hand-tuned constants or a second LLM, and makes them cheap, measurable and honest about their uncertainty. That is a large space; it is not the whole of engineering, and the kit is built to keep the line clear.
