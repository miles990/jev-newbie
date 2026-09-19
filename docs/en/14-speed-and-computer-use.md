# Parallel questions, speed, and computer use

Jev can answer multiple independent questions about one shared state in one request. This reduces repeated input and round trips. It differs from issuing several API requests concurrently. Dependent decisions still need sequential steps; more questions still consume tokens. See the [official fan-out pattern](https://docs.typesafe.ai/patterns/fan-out).

On 2026-09-19, our short-text `jev-1.13.0` benchmark used three warmups, five comparison rounds and one four-request concurrent batch (37 calls total):

| Method | Measured time |
| --- | --- |
| One question | median 257 ms |
| Four questions bundled | median 258 ms |
| Four questions in sequential requests | median 1,018 ms |
| Four concurrent requests, four questions each | 638 ms for the batch |

[Raw measurements](../research/latency-2026-09-19.json); reproduce with `node examples/js/latency.mjs` after setting the API key and installing dependencies. This small sample is not a latency guarantee, accuracy comparison, or benchmark against another model. Timing repeated calls does not establish server caching. The CLI has no general API cache; the usefulness example has explicit offline `--reuse`.

[Jev-cu](https://github.com/Sac-Y/Jev-cu) reads macOS accessibility text, asks Jev to choose an element/action, applies local policy, then executes through Codex Computer Use and observes again. This requires desktop permissions. Our upstream unit tests passed 18/18 and live API selections on saved snapshots passed 12/12. Neither proves end-to-end desktop task success or speed. Bounded choices restrict the action space, but can still be wrong.

Choices can also compose content: [Sprite Fusion's experiment](https://www.spritefusion.com/blog/generating-game-level-in-real-time-with-jev) chooses terrain widths, gaps, heights and surface types together, then game code places the blocks. The author reports five requests at 319–375 ms, without a traditional procedural-generation baseline. Assets and game code are separate; code must still validate reachability and joint constraints.

See the [case research](17-use-case-research.md).
