# Lesson 0: Before you start

Start with everyday messages; programming experience is not required. Later lessons introduce data files and optional code integration.

Follow the [README setup](../../README.md): install Node.js 20 or later, download this project, open a terminal in its folder, and set `TYPESAFE_API_KEY`. Run all tutorial commands from that folder.

```sh
node -v
node bin/jev.mjs --help
```

These commands show your Node version and help without calling the API. Node commands work in PowerShell too; advanced Bash scripts need Bash, such as Git Bash or WSL.

No MCP server, agent skill, or global `jev` installation is needed. `state` is the input, a question describes what you want to judge, and probabilities describe the model's answer. Choice/Score confidence measures distribution concentration, not accuracy.

API calls send input to the cloud and incur usage. Cost depends on request size and service pricing, not a fixed price per question. Use the sample messages first.

If Node is missing, install it and reopen the terminal. If `bin/jev.mjs` is missing, check your current folder. If the key is missing, set it in this terminal. `node bin/jev.mjs doctor` checks connectivity with one small live judgment.

Next: [Your first judgment](01-first-call.md)
