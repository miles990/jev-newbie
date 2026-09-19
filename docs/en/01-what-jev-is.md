# What Jev does

Jev takes text or JSON and questions you define, returning yes/no probabilities, choices, or ordered scores. It suits semantic judgments whose results fit fixed fields.

| Type | Use | Output |
| --- | --- | --- |
| `noul` | Does this need a reply? | Probability of yes |
| `choice` | Which category? | Option, distribution, confidence |
| `score` | How urgent or relevant? | Weighted level, distribution, confidence |

Several questions about the same input can be evaluated in parallel within one request. Code decides which answers matter afterward, saving sequential round trips. See [parallel judgments](14-speed-and-computer-use.md).

It does not generate replies, fetch websites, or directly inspect images. Keep exact calculations, dates, lookups, and actions in code. High confidence is not verification; unfamiliar inputs can be confidently misclassified.

Latency, pricing, and model aliases can change. Measure your inputs, model, network, and retry behavior rather than generalizing from one demo.

Sources: [API](https://docs.typesafe.ai/api), [confidence](https://docs.typesafe.ai/confidence), [use-case map](https://docs.typesafe.ai/concepts/use-case-map).
