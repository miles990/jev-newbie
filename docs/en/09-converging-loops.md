# Bounded improvement loops

[llm-then-jev-loop.mjs](../../examples/js/llm-then-jev-loop.mjs) starts with a small taxonomy. Jev classifies, an LLM proposes a category for unresolved items, and code reevaluates while retaining the round with the lowest other/low-confidence rate.

```sh
npm ci
node examples/js/llm-then-jev-loop.mjs
```

Dependencies and LLM credentials match the [previous guide](08-jev-with-an-llm.md). The loop stops after at most five rounds or ten categories, or on no progress; it does not request an unevaluable proposal after the final round.

Stopping does not establish a correct taxonomy. A lower other rate may reflect broader categories or overconfidence. Evaluate accuracy, overlap, and usefulness against independent labels.

The example retains the best metric, not guaranteed monotonic improvements or convergence to truth. Reruns can differ.
