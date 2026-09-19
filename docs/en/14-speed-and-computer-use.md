# Speed, and computer use

## Speed: what we measured

`examples/js/latency.mjs`, from Taiwan, 2026-09-19, `jev-1.13.0`, direct API:

```text
15 sequential calls, 1 question:      min 218 · p50 259 · p90 586 · max 788 ms
15 sequential calls, 13 questions:    min 213 · p50 266 · p90 338 · max 350 ms
20 parallel calls, 13 questions:      min 310 · p50 668 · p90 723 · max 739 ms   wall clock for all 20: 744 ms
same request twice (no client cache): 201 ms then 238 ms
```

What that means in practice:

- **A call is about a quarter of a second**, end to end, with TLS. Official figures are 70 to 500 ms; the extra is mostly distance. Budget 300 ms typical, 800 ms worst case.
- **Questions are free in latency.** Thirteen questions took the same time as one (p50 266 vs 259 ms). This is the single most important performance fact about Jev: never split questions across calls to "keep it fast"; do the opposite.
- **Parallel calls are nearly free too.** Twenty calls fired at once all finished within 744 ms; per-call latency rose to about 670 ms because they shared the connection, but throughput was 27 calls per second from one process with no tuning. Rate limits (1,200 requests per minute, 250k tokens per second at time of writing) are the ceiling, not the client.
- **Repeats are not cached server-side.** The same request twice cost 201 then 238 ms. Cache by request hash in your code; the `jev` CLI and every script here do, and a cache hit is 0 ms.
- **Compared to an LLM call** (two to ten seconds, cents each), Jev is ten to forty times faster and a hundred times cheaper. That is why it fits inside loops and in front of every expensive step, where an LLM never could.

Where speed matters most:

| Setting | Jev's fit | Evidence |
| --- | --- | --- |
| Per-message routing in a UI | comfortably under a human's perception of delay | 259 ms p50 |
| Agent tool-call gates | every call, every result | pi-jev, jev-guard run on each step |
| Batch tagging | thousands of items in minutes from one process | 27 calls/s measured; parallelize across processes for more |
| Real-time control loops | advisory at 2 to 10 Hz, not the inner loop | jev-drone 2.5 Hz, a community FPS at ~9 Hz, typesafe-mario every 8 frames |
| Converging loops | re-score a whole set every round | 12 items × 3 rounds in seconds |

Not fast enough for: anything that needs thousands of evaluations per decision (a full MCTS inner loop), or a hard real-time deadline under 100 ms. Fingerprint states and cache, or precompute a table, and it fits again.

## Computer use: Jev cannot see the screen, and still drives it

Every "Jev drives a browser or desktop" project in the community works the same way, and it is the same shape as the multimodal chapter:

```text
screen → text representation → candidates → Jev picks the action → code executes → repeat
```

The text representation is what makes it possible: a browser's DOM or accessibility tree, a desktop's accessibility API, OCR'd text regions with bounding boxes. Each interactive element becomes a candidate with an id, a role and its visible text. Jev answers one `choice` over those candidates ("which element advances the goal?") plus a few `noul`s ("is the goal complete?", "is this a login or payment step?", "did the last action fail?"). Code clicks. When text must be typed, an LLM writes it; that is the only generative step.

Projects that do exactly this:

- **jev-ultrafast** (by the browser-use team): Jev decides each action and element, calls a small LLM only when text is needed; a full Google Flights search in about 7 seconds.
- **fastbrowse, Jev Browser, public-browser**: same pattern, the last one driving a real Chrome profile from Claude Code with roughly 30% fewer tokens and 25% lower cost reported.
- **jev-desktop**: reads the operating system's accessibility tree and picks the control and the action for a local executor.
- **trycua/cua jev-use**: a computer-use driver whose action selection is a bounded Jev `choice` over OCR/text regions with coordinates and confidence.

Why it works: a screen has at most a few dozen actionable elements, so "which one?" is a closed set; the goal is text; and 300 ms per step is fast enough that a twenty-step task finishes in seconds. Why it is safer than an LLM driving: the action space is enumerated by code, so Jev cannot invent a click; and every risky step ("is this a payment?") is one more question in the same request.

What it cannot do: canvas-only interfaces with no text, games rendered as pixels, or anything where the right element is not in the candidate list. Those need a vision model to produce the candidates first, and then Jev picks among them. And a computer-use agent still needs the gates from earlier chapters: a destructive-action check before every click, shadow mode first, a person for payments and credentials.
