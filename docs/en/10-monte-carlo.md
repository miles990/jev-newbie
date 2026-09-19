# Simulations and their assumptions

```sh
npm ci
node examples/js/monte-carlo.mjs
```

This example simulates threshold policies and assumed costs from twelve messages' model scores, then bootstraps a small labeled set. It never deletes or replies to messages.

Distinguish model probabilities, simulation under model assumptions, and observed outcomes. Simulation adds no independent evidence and cannot correct a wrong model by itself.

The code samples scam and reply as independent Bernoulli variables, although they can be dependent. Results are conditional on independence and calibration. Cost values are teaching assumptions, not measured losses.

An all-correct eight-case sample can yield a 100%–100% ordinary bootstrap interval. This does not establish zero population error; resampling cannot invent unobserved failures. More independent data and an appropriate interval method are needed.

Every execution calls Jev again. A fixed random seed reproduces sampling only for the same probability inputs.
