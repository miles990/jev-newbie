# Ask an AI assistant to integrate Jev

This is an ordinary document to share with a coding agent, not an installable skill. For direct CLI learning, use the [tutorial](../../tutorial/README.md).

Example request:

> Add classification suggestions to my message organizer. Compare the existing method and Jev on my labeled examples, leave uncertain cases for review, and report accuracy, review rate, latency, and usage. Integrate only within the scope I request.

## Suggested workflow

1. Define the behavior to improve. Keep exact calculations and lookups; not every if/else needs replacement.
2. Write one semantic judgment per question. Bundle questions that share state and do not depend on each other's answers.
3. Use human labels and held-out evaluation data, comparing the existing method. Model answers are not ground truth.
4. Choose action/review/stop/fallback behavior by consequences. Do not universally fail open on API errors.
5. If implementation is requested, add versioning, timeouts, bounded retries, appropriate caching, and logs. The CLI has no generic cache.
6. Report changed locations, tests, and unverified behavior; retain questions, cases, and repeatable commands.

The official [TypeSafe skill](https://docs.typesafe.ai/agent-skill) can supplement API and design guidance. This document requires neither that skill nor MCP.

The former jev-workflow had no independent runtime tools and overlapped the tutorial, so it became this guide. Existing copies installed elsewhere on your computer are not automatically modified.
