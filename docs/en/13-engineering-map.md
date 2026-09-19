# How other methods fit

These are design ideas, not claims that every method is implemented or validated here.

| Method | Jev can provide | Separate responsibility |
| --- | --- | --- |
| Search/ranking | Relevance and topic | Retrieval, indexing, ranking evaluation |
| Decision analysis | Semantic judgments | Costs, calibration, action policy |
| Simulation | Conditional probability inputs | Dependence assumptions and validation |
| Machine learning | Semantic features | Labels, training, held-out evaluation |
| Iterative optimization | A proxy metric | Budgets, stopping, true-objective checks |
| Software testing | Supplemental claim/output judgments | Compilation, tests, contracts, evidence |
| Interface operation | Candidate element/action selection | Fresh state, authorization, execution, verification |

Related questions can share a request; actions depending on earlier outcomes remain sequential. Compare saved work against latency, usage, and error costs.

Complete the [tutorial](../../tutorial/README.md), then evaluate one use case. The [official map](https://docs.typesafe.ai/concepts/use-case-map) offers directions to explore.
