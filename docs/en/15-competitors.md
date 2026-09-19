# Competitors and substitutes

Reviewed 2026-09-19, four days after Jev's launch. Short version: **no other company sells a "System One model" yet**, but every job Jev does has an established substitute, and honest comparisons exist. Pick by the row that matches your job, not by the category name.

## Direct competitors: none found

Searches for decision-model APIs turn up two kinds of things that look adjacent but are not the same product:

- **Rule engines with a decision API** (decide.fyi, Entropy0's `/v1/decide`): deterministic rulebooks, lookup tables, severity ladders. No learned judgment; they answer "do the facts satisfy the rules?" and are the right tool when the rules can be written down. Jev answers "what do these words mean?" when they cannot. They compose: Jev fills a fact ("is this a payment step?"), the rule engine decides.
- **Emulators of Jev's API shape**: an "imposter Jev" gateway that fakes the typed-output contract on top of an LLM, and TypeSafe's own `system-one-adapter-python`, which backs the same request shape with OpenAI or Anthropic models for compatibility testing. Useful for portability; they inherit the LLM's cost, latency and calibration.

## Substitutes, by what they cost you

Adapted from Arize's comparison (2026-09-18) and independent tests:

| Approach | Labels needed | Cost per decision | Latency | Probability you can act on | Explanation |
| --- | --- | --- | --- | --- | --- |
| Logistic regression on embeddings | yes, hundreds+ | ~$0.02–0.12 per 1M tokens (one embedding call) | tens of ms | yes | no |
| Fine-tuned encoder (ModernBERT class) | yes, hundreds+ | GPU time, ~76k tokens/s per GPU | single-digit ms | yes, with temperature scaling | no |
| NLI zero-shot (bart-large-mnli) | no | self-hosted | tens of ms | entailment score | no |
| Cross-encoder / reranker (Qwen3-Reranker, Cohere, Voyage) | no | per search of ~100 docs | tens to hundreds of ms | relevance score only | no |
| Small tuned judge (Selene Mini class, 8B) | no | self-hosted autoregressive | seconds | verbalized | yes |
| Frontier LLM as judge (Sonnet 5, GPT, Gemini) | no | $0.03–0.18 per decision on TypeSafe's evals | 3–38 s | verbalized, often overconfident | yes |
| Guardrail models (Llama Guard, ShieldGemma, moderation APIs) | no | cheap to free | tens of ms | category scores, safety only | no |
| **Jev** | no | ~$0.0004 per case on TypeSafe's evals; $0.00002 for a short message | 0.2–0.6 s | trained and calibrated for it | no |

## What the head-to-heads say

- **Near Here, event validation, 50 real cases** (2026-09-16): Jev 96% vs Gemini 3.5 Flash-Lite 86% vs Mistral Small 4 84%; Jev rejected none of the 13 valid events; median 0.58 s vs 2.7–3.4 s; cost per 1,000 decisions $0.043 vs $0.37–2.50. Their caveat: narrow task, cases informed prompt selection.
- **Ben Greenberg, hackathon judging gate, 102 submissions × 3 runs** (2026-09-18): Jev Choice plus four Nouls 100% vs Claude Sonnet 5 (high reasoning) 99%; Jev's two Choice-only errors sat at confidence 0.2–0.3, Sonnet's three errors sat at 0.9–1.0; ECE 0.037 vs 0.058; 378 ms vs 3,554 ms; 10,000 evaluations $2.27 vs $129.74. At a 0.5 confidence threshold he could automate 98% of decisions with 100% accuracy among them.
- **Arize's spam test**: 98.3% accuracy zero-shot; below 0.1 only 0.1% were spam, above 0.9 99.9% were, in the 0.5–0.6 band 38%. That curve is the product.
- **A catalog reranking run, 33,047 entries, 164 queries, 9,831 graded pairs**: reported that Jev reranking *alone* did not beat the incumbent. Reranking is where specialized cross-encoders are strongest (Qwen3-Reranker-8B tops the BTZSC zero-shot classification benchmark at macro F1 0.72); Jev earns its place there as a second stage over a shortlist, or when the relevance criterion is something a reranker was not trained on.

## How to choose

| If you have | Use | Because |
| --- | --- | --- |
| thousands of labels and a fixed task | fine-tuned encoder or embeddings + logistic | single-digit ms, runs on your hardware, cheapest at scale |
| no labels, a task defined in plain English, need for a usable probability | **Jev** | zero-shot, calibrated, fast, cheap; the golden set is 20 labels, not 2,000 |
| a need for the *reason* in words | LLM judge on a sample | Jev never explains; run it on everything, sample failures through an LLM |
| pure relevance ranking over many documents | a reranker first, Jev second | rerankers win their home turf; Jev adds criteria they lack |
| safety categories only | a guardrail model, or Jev with your own hazard questions | guardrail models are fixed taxonomies; Jev lets you write the hazards |
| rules you can write down | a rule engine, with Jev filling the semantic facts | deterministic where possible |

## Skills and agent tooling like `jev-workflow`

Checked 2026-09-19. Five things overlap with this repo's `jev-workflow` skill; none does the same job.

| Project | What it is | Overlap with jev-workflow | Difference |
| --- | --- | --- | --- |
| Official `typesafe-ai` skill | API contract, primitives, patterns, cookbooks | none; it is the prerequisite | knows *how to call* Jev; says nothing about golden sets, thresholds in one place, logs, or fail-open |
| **Augustus** (24601) | a design skill: maps Choice/Score/Noul onto decision theory, MCDA, signal detection, fail-open vs fail-closed; "companion, not replacement" to the official skill | closest in spirit: both are about *where* and *whether* to place a judgment | Augustus is theory-first and cross-domain (business, life); jev-workflow is an operating procedure for a codebase (find the smell → questions file → `jev check` → policy → log). Use Augustus to decide, jev-workflow to ship |
| **jev-judgment** (HyunjunJeon) | a runtime skill: the agent calls Jev at three moments (before asking the user a closed question, before a risky command, before stopping) | both change agent behavior | it makes the agent *use* Jev during its own work; jev-workflow makes the agent *build* Jev into the user's code. Complementary |
| **jev-code** (devagrawal09) | a CLI toolkit the agent delegates to: find relevant files, check a diff against the task, triage failures and review comments | both bound the agent's judgment | it is four fixed workflows with their own questions; jev-workflow produces new questions for the user's own problem |
| **jev-superpowers** (AkashPriyadarshii) | the "superpowers" development framework re-skinned with Jev gates: package vetting, completion gates | both add gates | it is a whole methodology; jev-workflow is one skill you add to whatever methodology you already run |
| typesafe-mcp, jev-mcp, pi-typesafe-jev, SemDecide | tools that expose Jev to an agent or a shell | none; they are the plumbing jev-workflow tells the agent to use | no workflow, no discipline |

What is only here: the six-step order (smell → questions file → golden set → single policy → safety defaults → report), the `jev check --strict` CI gate, the `jev view` log, and the bilingual tutorial that teaches the same order to a person. What is only elsewhere: Augustus's decision-theory framing (worth reading before designing a high-stakes gate) and jev-judgment's runtime hooks (worth installing so the agent itself guesses less). All three install side by side with `npx skills add`.

## Where Jev's position is weakest

Three things could erode it quickly: LLM vendors exposing calibrated logprobs with constrained decoding at Haiku-class prices; open reranker or encoder models fine-tuned to return calibrated judgments; and rate limits or early-access constraints while competitors are generally available. Pin versions, keep your questions and golden sets in files, and the switch is a client change.
