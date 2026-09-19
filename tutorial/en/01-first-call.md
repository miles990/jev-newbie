# Lesson 1: Your first judgment

A friend invites you to dinner. Does the message need a reply?

```sh
node bin/jev.mjs ask "Does this message need a reply from me?" --text "Dinner on Saturday? Let me know by tomorrow if you can come."
```

The text after `ask` is your question; the text after `--text` is the input. Keep both in quotes.

The output contains a bar, percentage, and `yes`, `no`, or `unsure`. The percentage means probability of yes. This tool displays yes above 65%, no below 35%, and unsure otherwise. These are demonstration thresholds, not a service guarantee.

A reasonable expectation here is yes. Run the command to see the actual number; this page does not invent a recorded result.

```sh
node bin/jev.mjs ask "Does this message need a reply from me?" --text "Thanks, the package arrived. No need to reply."
```

Change only the input first. If you disagree with the result, check that the question expresses what you intended.

Next: [Three question types](02-three-question-types.md)
