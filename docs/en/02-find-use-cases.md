# Find a useful application

Start with recurring decisions in your life or work, not code you can replace.

| Goal | Jev judges | Code or people handle |
| --- | --- | --- |
| Organize messages | Category, reply needed, urgency | Display, reminders, replies |
| Organize bookmarks | Relevance and topic | Retrieval, storage, sorting |
| Choose learning resources | Beginner suitability and exercises | Fact checking and preferences |
| Check drafts | Relevance and unsupported commitments | Editing and sending |
| Navigate interfaces | Select a known candidate control | Observation, policy, clicks |

Combine questions about one input in a request. Processing many inputs requires multiple requests. The [official use-case map](https://docs.typesafe.ai/concepts/use-case-map) offers ideas, not evidence of accuracy on your task.

Keyword classifiers may be worth comparing, but retain explicit IDs, status codes, authorization, and stable lookup tables. Compare against labeled data before replacing an existing method.

```sh
node bin/jev.mjs filter examples/cli/inbox-messages.txt "Does the sender expect me to reply?" --only-kept > kept.txt
node bin/jev.mjs run examples/cli/inbox.questions.json kept.txt
```

Default filter output includes every item and its score; only `--only-kept` emits matching original text. Skip the second command if nothing matched and the file is empty.

Keep other and review paths. Low confidence can indicate ambiguity or unfamiliarity, but does not reliably detect every unknown input.
