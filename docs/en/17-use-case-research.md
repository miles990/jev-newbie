# Jev use-case research

Reviewed on 2026-09-19: 18 GitHub projects, three Reddit records, six X posts and one author article. Jev evaluated eight questions per record (224 judgments). Reposts and repository announcements are not independent experiments. Collection used platform tools; Jev classified supplied text rather than searching the web itself.

[Full source-linked Traditional Chinese report](../zh-TW/17-use-case-research.md) · [model judgments and revisions](../research/judgments-2026-09-19.json) · [local tool verification](../local-tools-2026-09-19.md).

Useful patterns include source ranking, code triage, UI action selection, context pruning, model routing, wake-up filtering, writing checks, and composing bounded game elements. Treat each as a hypothesis to test against your current method. We installed on-demand tools; global routing/compaction hooks were not activated without a measured benefit.

Important corrections: the MCP project is an interface, although Jev labeled it routing; Jev-cu bundles questions despite its low README-based score. The ad-analysis repost repeats Berman's demo, which also uses a Gemini pipeline. Sprite Fusion composes terrain from choices; it does not ask Jev to generate sprites or game code. Author-reported times are not reproduced benchmarks.

Try the small authored dataset:

```sh
node bin/jev.mjs run examples/research/questions.json examples/research/demo-sources.jsonl --label my-research
node bin/jev.mjs view
```

Replace the demo with JSONL records containing `source_id`, `url`, and `content`. Keep original sources and inspect model mistakes before using a threshold to discard records.

Discover more through the [official use-case map](https://docs.typesafe.ai/concepts/use-case-map) and [Logicrw's index](https://logicrw.github.io/awesome-jev-projects/). Index inclusion does not establish local compatibility, quality, or performance.
