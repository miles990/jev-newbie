# Turn text into analyzable features

Each question can become a feature column: asks a question, mentions a deadline, or is marketing. One request fills several columns for an input; statistical or ML code handles analysis.

```sh
npm ci
node examples/js/features.mjs
```

The example writes runs/features.csv and correlates columns with needs_reply. Only five rows carry that label, so the result illustrates the process rather than establishing useful or useless features.

- Record questions, model, and data provenance.
- Separate feature exploration from final evaluation; repeated selection can overfit.
- If a deployed model still consumes Jev features, new inputs still need Jev calls. Training a downstream model does not automatically remove API cost.
- Correlation is not causation. Scaling requirements depend on the downstream model even for 0–1 features.

Fourier transforms, correlations, and eigenvalues are code's job. Jev supplies candidate semantic signals.
