# Lesson 6: Process several messages

Start with the eight supplied messages. A text file contains one item per line.

```sh
node bin/jev.mjs filter examples/cli/inbox-messages.txt "Does the sender expect me to reply?" --min 0.5
node bin/jev.mjs classify examples/cli/inbox-messages.txt "What kind of message is this?" --options "bill,scam,invite,appointment,ad,personal,other"
node bin/jev.mjs run examples/cli/inbox.questions.json examples/cli/inbox-messages.txt
```

`filter` displays all items and marks those meeting the threshold. `classify` prints a category or unsure below its confidence threshold. `run` loads several questions from a file and prints a table.

To save only matching original text for the next step:

```sh
node bin/jev.mjs filter examples/cli/inbox-messages.txt "Does the sender expect me to reply?" --only-kept > kept.txt
```

JSONL is also supported: one JSON object per line, used as the whole state. Keep the `.jsonl` extension when saving filtered JSONL.

Each item makes one request. The CLI processes at most four at once by default; lower it with `--concurrency 2`. Each attempt times out after 30 seconds by default. Start small and measure usage and latency.

Next: [Check against labeled answers](07-golden-set.md)

## Several questions about the same message

The `run` command bundles every question in the file into one request per message. Independent judgments share the input, then your code combines their answers. For example, an invitation that expects a reply can enter your reply queue.

[Measured speed and limits](../../docs/en/14-speed-and-computer-use.md) · [Research with Jev](../../docs/en/17-use-case-research.md)
