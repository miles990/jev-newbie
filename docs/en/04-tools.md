# Tools

What to install, what each one changes on your machine, and how to check it worked. `./scripts/setup.sh` does all of it; `./scripts/doctor.sh` checks.

## Must have

**API key.** <https://console.typesafe.ai> → `export TYPESAFE_API_KEY=apikey_...` in your shell profile.

**`jev` CLI (this repo).** `bin/jev.mjs`, single file, zero dependencies, linked to your PATH by setup. Every call logs to `runs/jev-log.jsonl`; `jev view` renders it. Env: `JEV_MODEL`, `JEV_LOG`.

**typesafe-mcp** ([itsmostafa/typesafe-mcp](https://github.com/itsmostafa/typesafe-mcp)). One static binary `evaluate` that exposes an `evaluate` MCP tool. `evaluate setup mcp` registers it with Claude Code (user scope), Codex (`~/.codex/config.toml`) and Claude Desktop, and **writes your API key in plain text into those config files**. Both agents then call the same tool with the same question shape, which is what keeps their judgments comparable. Check: `claude mcp get evaluate`.

**Official TypeSafe skill.** Teaches the agent the three primitives, patterns and API contract. Claude Code: `claude plugin marketplace add typesafe-ai/skills && claude plugin install typesafe@typesafe-ai`. Codex and others: `npx skills add typesafe-ai/skills --skill typesafe-ai -g`. The two prompts on <https://docs.typesafe.ai/agent-skill> are the best way to start a project: one explores for opportunities, the other runs experiments with your key.

**jev-workflow skill (this repo).** `skills/jev-workflow/SKILL.md`. Opinionated: find the smell, write the questions file, `jev check` against a golden set, then integrate. Install: `npx skills add miles990/jev-newbie --skill jev-workflow -g`.

## SDKs

`pip install typesafe-sdk` (Python, sync and async, retries) and `npm i @typesafe-ai/sdk` (JavaScript, typed answers inferred from questions). Both read `TYPESAFE_API_KEY`. For scripts with no dependencies, a raw `fetch`/`curl` to `POST https://api.typesafe.ai/v1/systemone` is enough; see `examples/curl`.

## Optional gates for coding agents

Installed by setup but **not activated**, because they change how your agents behave every day:

- **jev-guard** ([leepokai/jev-guard](https://github.com/leepokai/jev-guard)): scores every tool call for destructiveness and exfiltration, scans tool results for prompt injection. Activate per agent: `jev-guard install claude` or `jev-guard install codex`. Try first: `jev-guard check Bash '{"command":"rm -rf ~"}'`.
- **limpet** ([noplan-inc/limpet](https://github.com/noplan-inc/limpet)): a Stop hook that checks plain-language rules ("do not stop to ask whether to run the tests") and sends the agent back. `claude plugin marketplace add noplan-inc/limpet && claude plugin install limpet@limpet --config typesafe_api_key=$TYPESAFE_API_KEY`.

## Also worth knowing

- [Vercel AI Gateway](https://vercel.com/ai-gateway/models/jev) and [Cloudflare Workers AI](https://developers.cloudflare.com/ai/models/typesafe/jev/) serve Jev under their own keys; the gateway response carries no confidence field.
- Community lists: [Anil-matcha/awesome-jev-by-typesafe](https://github.com/Anil-matcha/awesome-jev-by-typesafe), [yibie/awesome-jev](https://github.com/yibie/awesome-jev). Patterns worth copying: pi-jev (shadow mode, fail open, 120 s cache), jev-drone (advisory judge at 2.5 Hz, code keeps the veto, scene fingerprinting), wakegate (ask before waking an agent), fast-jev-compaction (prune context by relevance).

Read next: [05 Observability](05-observability.md)
