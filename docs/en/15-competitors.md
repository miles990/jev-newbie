# Compare alternative approaches

Start with the task, labeled inputs, and constraints rather than whether a product is a direct competitor.

| Approach | When to try it | What to measure |
| --- | --- | --- |
| Rules/lookups | Explicit conditions, stable structure | Maintenance and semantic misses |
| Keywords/search | Stable vocabulary, simple needs | Paraphrases, false matches, misses |
| Embeddings/rerankers | Retrieval and relevance | Ranking quality, latency, coverage |
| Supervised classifier | Existing labels, fixed categories | Labeling/training and drift |
| LLM | Explanations, generation, multi-step reasoning | Format, cost, latency, quality |
| Jev | Several bounded semantic questions | Accuracy, review rate, usage, latency |

This repository has no fair cross-product benchmark. Earlier claims of no competitors, fixed speedups, or percentages without reproducible repository evidence should not guide selection.

Compare the same held-out data under equivalent goals. The official [use-case map](https://docs.typesafe.ai/concepts/use-case-map) is an idea index, not a benchmark.

Skills, MCP, and guides are interfaces or instructions, not competing models. The former jev-workflow content now lives in the [AI integration guide](16-agent-integration.md), without another installable skill.
