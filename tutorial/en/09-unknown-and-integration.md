# Lesson 9: Unknown inputs and help from an AI assistant

You defined invitation, advertisement, and pickup notice, but receive a school notice. Other offers an escape option; the model may still confidently misclassify it.

```sh
node bin/jev.mjs pick "What kind of message is this?" --options "invitation,advertisement,pickup notice,other" --text "School trip next week. Parents, please return the consent form by Monday."
```

Review other, low-confidence cases, and random samples before adding a school category. Low confidence alone cannot detect every unfamiliar input.

If you use a coding agent, share the [AI integration guide](../../docs/en/16-agent-integration.md) and ask:

> I want classification suggestions in my message organizer. Evaluate whether Jev is useful, compare it against labeled examples, and leave uncertain messages for review. Report the evaluation, then integrate only within the scope I request.

This is an ordinary document; no jev-workflow skill installation is needed. Stable explicit rules often do not need a model. Start where semantic understanding actually helps.

You can now ask questions, add context, process batches, compare labels, and inspect logs. Try one small use case on your own data before integrating.

Next: [reliability](../../docs/en/03-reliability.md), [command reference](../../docs/en/06-feature-coverage.md), and the [advanced guide index](../../docs/README.md).
