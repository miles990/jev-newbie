# Limits and common misunderstandings

- Typed options do not guarantee correct choices.
- Choice/Score confidence comes from the distribution; it is not your task's measured accuracy.
- Other is not guaranteed detection of unfamiliar inputs.
- Parallel questions cannot read one another's answers. If a question needs an actual earlier output, use code or another request.
- The model does not fetch evidence. A claim labeled research or official in state is not thereby verified.
- Media URLs are text, not image/audio input. Use OCR, transcription, or vision first.
- Keep exact math, dates, IDs, and explicit rules in code.
- A pinned model is not a bit-for-bit reproducibility guarantee.

Long inputs, more questions, concurrency, rate limits, and retries can affect usage and latency. Check your account limits and measure. Compare languages on your own labeled data.

Sources: [API](https://docs.typesafe.ai/api), [confidence](https://docs.typesafe.ai/confidence), [fan-out](https://docs.typesafe.ai/patterns/fan-out).
