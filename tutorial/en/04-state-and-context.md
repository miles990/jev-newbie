# Lesson 4: Add useful context

“Bring your racket tomorrow” means something different depending on whether you are attending. The model does not know your plans unless you provide them.

```sh
node bin/jev.mjs ask "Do I need to prepare for this message?" --text "Bring your racket tomorrow."
node bin/jev.mjs ask "Given my plan, do I need to prepare for this message?" --json '{"message":"Bring your racket tomorrow.","my_plan":"I confirmed I will attend badminton tomorrow and have not packed."}'
```

JSON holds named fields: `message` and `my_plan` here. Field names and strings use double quotes; wrap the entire JSON in single quotes in the terminal.

Context may change the answer; it does not verify the supplied facts. Send only relevant information. Compute date differences, totals, and deadlines in code, then supply results such as `due_today: true`.

Exercise: change the plan to “I cancelled my attendance.” Keep the question and message unchanged so you can compare.

Next: [Which learning resource suits me?](05-is-it-useful.md)
