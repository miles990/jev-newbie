# Install only what you need

## Following the tutorial

Node.js 20 or later and a TypeSafe API key are enough for `node bin/jev.mjs`. No global CLI, MCP, or skill is required. See the [README](../../README.md) for key setup.

## SDK examples

For JavaScript run `npm ci` in the project root. For Python:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

On Windows the Python path is usually `.venv\Scripts\python.exe`. Bash users can run `bash scripts/setup.sh` to install only local JS/Python dependencies. It does not write keys, configure agents, or install global tools, and skips Python if unavailable.

`npm test` runs offline code tests without a key. `npm run doctor` checks credentials and connectivity with one live judgment. `npm run verify` is a separate live example check; see [coverage](06-feature-coverage.md).

## Using a coding agent

The [AI integration guide](16-agent-integration.md) is an ordinary document to share with an assistant; no jev-workflow installation is needed. The official [TypeSafe skill](https://docs.typesafe.ai/agent-skill) provides API and pattern guidance; follow its current installation instructions if needed.

[typesafe-mcp](https://github.com/itsmostafa/typesafe-mcp) is an alternative interface for agents. Choose CLI, SDK, or MCP to fit your needs. Review its configuration and key storage before installation; this project does not register or enable it. Third-party hooks are not beginner dependencies.

## Optional local key file

The CLI also reads `apiKey` from `~/.config/jev/config.json`; an explicit environment variable takes precedence. SDK examples still require `TYPESAFE_API_KEY`. Keep credentials outside the repository. See the [local installation record](../local-tools-2026-09-19.md) for this machine, not a prerequisite for readers.
