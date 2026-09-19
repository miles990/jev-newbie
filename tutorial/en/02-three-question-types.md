# Lesson 2: Three question types

Whether to reply, what category a message belongs to, and how urgent it is need different answer shapes.

```sh
node bin/jev.mjs ask "Does this need a reply?" --text "Dinner Saturday? Please let me know."
node bin/jev.mjs pick "What kind of message is this?" --options "invitation,advertisement,pickup notice,other" --text "Your package is ready. Collect it within three days."
node bin/jev.mjs rate "How soon does this need attention?" --levels "can wait,handle today,handle immediately" --text "We leave in ten minutes but I cannot find my keys."
```

`ask` returns probability of yes. `pick` displays option probabilities, an arrow, and confidence. `rate` uses ordered levels numbered 0, 1, 2; the score can fall between levels.

Confidence is not accuracy: 0.9 describes a concentrated distribution, not a guarantee of being right nine times out of ten. Use low confidence as a review signal.

Separate options with commas. Include `other` if inputs may fall outside your categories. Give levels concrete meanings in increasing order.

Exercise: try work, family, shopping, and other on three messages. An unfamiliar input is not guaranteed to produce other or low confidence.

Next: [Ask one clear question](03-writing-questions.md)
