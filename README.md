# jev-newbie

**English** · [繁體中文](README.zh-TW.md)

Classify, filter, and score text with simple Jev commands. This starter kit includes a CLI, runnable examples, and tutorials to help you try a judgment before adding it to your application.

## See an example

Ask whether a message is a complaint:

```sh
node bin/jev.mjs ask "這句話是在抱怨嗎？" --text "又壞了，第三次了"
```

The question means “Is this a complaint?” and the message means “It broke again, for the third time.” [Recorded output](examples/expected/cli-ask.txt):

```text
██████████████████··  92%  yes
```

92% is the probability the model returned for this question; your result may differ. Jev returns judgments and scores, and your code decides what happens next. It does not write a reply or verify that the input is true.

## Run your first judgment

You need **Node.js 20 or later**, Git, and a [TypeSafe API key](https://console.typesafe.ai). Calls send your input to TypeSafe's cloud service and incur API usage.

```sh
git clone https://github.com/miles990/jev-newbie.git
cd jev-newbie
export TYPESAFE_API_KEY="your API key"

node bin/jev.mjs ask "Is this a complaint?" --text "It broke again, for the third time"
node bin/jev.mjs view
```

These two commands need only Node.js; no package installation is required. `view` creates and opens an HTML report with input previews, answers, code decisions, and latency for successful judgments. Records are saved to `runs/jev-log.jsonl`.

## Three everyday commands

```sh
# Ask a yes/no question
node bin/jev.mjs ask "Does this need a reply?" --text "Dinner on Saturday — let me know if you can come"

# Pick from categories you define
node bin/jev.mjs pick "What kind of message is this?" --options invite,ad,personal,other --text "Dinner on Saturday — let me know if you can come"

# View your judgment history
node bin/jev.mjs view
```

You can also score text, classify and filter batches, and check results against labeled examples. Start with the [tutorial](tutorial/README.md), then use your own data to evaluate accuracy and choose thresholds.

## Where to go next

- **Learn step by step:** the [tutorial](tutorial/README.md), with commands, outputs, and exercises.
- **Find a feature:** the [CLI and example reference](docs/en/06-feature-coverage.md), including scoring, batches, and output comparisons.
- **Decide whether it fits:** [use cases](docs/en/02-find-use-cases.md), [reliability](docs/en/03-reliability.md), and [limitations](docs/en/07-limits-and-caveats.md).
- **Connect your development tools:** the [SDK, MCP, and agent skill guide](docs/en/04-tools.md). Use `scripts/setup.sh` when you want the full environment; it also installs global tools and configures coding agents.
- **Explore integrations:** [Jev with an LLM](docs/en/08-jev-with-an-llm.md), the [existing-project use-case audit](docs/workspace-audit.md), and a [sample report](showcase/README.md).

License: [MIT](LICENSE).
