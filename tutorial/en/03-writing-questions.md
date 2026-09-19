# Lesson 3: Ask one clear question

“Is it important?” is vague. Do you mean needs a reply, or needs action today?

```sh
node bin/jev.mjs ask "Does the message request a reply?" --text "The water will be off tomorrow morning. Prepare tonight. No reply needed."
node bin/jev.mjs ask "Does the message request action within a day?" --text "The water will be off tomorrow morning. Prepare tonight. No reply needed."
```

The same message can need action without needing a reply. Combining both conditions hides which one is true.

Add definitions when helpful:

```sh
node bin/jev.mjs ask "Does this need a reply?" --yes "A direct question or request to confirm" --no "Information only; no reply requested" --text "Remember your umbrella tomorrow."
```

Questions may be in English or Chinese. Compare languages on the same labeled data if it matters; do not assume all instructions must be English.

Exercise: split a question containing “and” into two questions, write down your expectations, then compare.

Next: [Add useful context](04-state-and-context.md)
