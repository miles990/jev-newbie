# Combine judgments with text generation

A workflow can use Jev to decide whether a draft is needed and suggest tone, an LLM to write, and Jev to check responsiveness. Classifier labels are signals, not trusted facts.

```sh
npm ci
node examples/js/jev-then-llm.mjs
```

Requires TYPESAFE_API_KEY. With ANTHROPIC_API_KEY, also set ANTHROPIC_MODEL to an available account model; otherwise it uses an installed, authenticated claude -p CLI. Either path can incur usage.

The example routes, drafts, and checks with at most two attempts. Success only prints REVIEW DRAFT (not sent); nothing is sent. Failed final checks request review. Logs in runs/jev-then-llm.jsonl have a different schema from jev view.

Provide original messages and known facts along with tentative labels. One model checking another is not independent ground truth; verify sources and review appropriately.
