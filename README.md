# jev-newbie

**English** · [繁體中文](README.zh-TW.md)

**Learn to ask Jev questions, classify text, and rate urgency—starting with an everyday message.**

This is a practical guide for beginners. You do not need to know how to write code: once you have the tools ready, copy a command, replace the sample text, and see how the result changes.

## What can Jev help me do?

Imagine receiving this message:

> Want to have dinner on Saturday? Let me know by tomorrow if you can come.

Give Jev the message and ask a specific question:

| What you want to know | What you ask Jev | What it returns |
| --- | --- | --- |
| Should I reply? | Does this message need a reply from me? | The probability of “yes” |
| What kind of message is it? | Choose from invitation, advertisement, pickup notice, or other | A category and probabilities for each option |
| How urgent is it? | Rate it from “can wait” to “today” to “immediately” | A score and probabilities for each level |

**You supply the text and question; Jev returns a judgment.** It does not reply to your friend or take action for you. Its judgments can be wrong, so start with messages you understand and can check yourself.

## Get three things ready

1. **Node.js 20 or later:** this runs the commands in this project.
2. **The project files:** download the ZIP and extract it, or clone the project with Git.
3. **A [TypeSafe API key](https://console.typesafe.ai):** sign in to obtain a service access key that lets the tool call Jev. Treat it like a password.

Open a terminal (Terminal on macOS or PowerShell on Windows). Type `cd ` followed by the path to the extracted folder, for example:

```sh
cd "Downloads/jev-newbie-main"
```

Replace that path with the actual location on your computer. Then set your key, replacing `paste your key here` below.

**macOS / Linux:**

```sh
export TYPESAFE_API_KEY="paste your key here"
```

**Windows PowerShell:**

```powershell
$env:TYPESAFE_API_KEY="paste your key here"
```

This setting lasts for the current terminal session; set it again when you open a new one. The exercises need only Node.js, with no setup script required. Each judgment sends the text to TypeSafe's cloud service and incurs API usage.

## Exercise 1: Does this message need a reply?

Paste this into the same terminal:

```sh
node bin/jev.mjs ask "Does this message need a reply from me?" --text "Want to have dinner on Saturday? Let me know by tomorrow if you can come."
```

There are three parts:

- `node bin/jev.mjs` starts the Jev tool in this project.
- `ask "Does this message need a reply from me?"` asks a yes/no question.
- `--text "..."` supplies the text you want it to judge.

The result shows a percentage and `yes`, `no`, or `unsure`. **The percentage is the model's probability of “yes,” not a measure of whether the message is true.** The tool currently displays `yes` above 65%, `no` below 35%, and `unsure` in between.

Now change only the message to “Thanks, the package arrived. No need to reply.” Run it again and see what changes.

## Exercise 2: Sort a message into a category

```sh
node bin/jev.mjs pick "What kind of message is this?" --options "invitation,advertisement,pickup notice,other" --text "Your package is at the pickup point. Please collect it within three days."
```

`pick` means “choose one of these options.” `--options` lists your categories, separated by commas. The result shows a probability for each category and an arrow beside the selected one. Keep `other` so messages that do not fit the first three categories have somewhere to go.

Try changing the categories to “work,family,shopping,other” and supplying one of your own messages. **You choose the categories; you do not have to use ours.**

## Exercise 3: Rate how urgent something is

```sh
node bin/jev.mjs rate "How soon does this need attention?" --levels "can wait,handle today,handle immediately" --text "We need to leave in ten minutes, but I cannot find the house keys."
```

`rate` judges a degree. Put `--levels` in order from low to high. Here, the three levels are numbered 0, 1, and 2: a score closer to 2 means the model judges it needs more immediate attention. The output also shows probabilities for each level and a corresponding label.

## Look back at your results

```sh
node bin/jev.mjs view
```

This creates an HTML report and usually opens it in your browser. If it does not open, open `runs/report.html` inside the project folder yourself. The report shows text previews, questions, answers, and elapsed time for successful judgments, so you can compare changes to your text or questions.

**Next, find three familiar messages, judge them yourself, and see whether Jev agrees.** If it disagrees, check whether your question is clear, your options cover the possibilities, and any necessary context is missing. A high score does not guarantee a correct answer.

## Want help integrating Jev?

Once you can use the commands, share the [AI integration guide](docs/en/16-agent-integration.md) with Codex or Claude Code to add Jev to your own tool. It covers question design, evaluation, and scoped implementation. It is an ordinary document; no extra jev-workflow skill installation is required.

## Keep learning

- [Step-by-step tutorial](tutorial/README.md): write questions, add context, process multiple messages, and check accuracy.
- [Feature and example reference](docs/en/06-feature-coverage.md): find other commands.
- [Capabilities and limitations](docs/en/07-limits-and-caveats.md): understand which tasks do not suit Jev.
- [Development tool integrations](docs/en/04-tools.md): read this when you want to connect Jev to an application or coding agent.

License: [MIT](LICENSE).

Optional: [parallel-question measurements](docs/en/14-speed-and-computer-use.md) · [community cases and tools](docs/en/17-use-case-research.md).
