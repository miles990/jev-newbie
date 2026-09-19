# Connecting Jev to an LLM

Jev decides; an LLM writes. The question is where to put the seam. There are four positions, and most real systems use two or three of them at once.

## 1. Jev before the LLM: decide whether to call it at all

Most inputs do not need an LLM. A scam does not need a reply drafted; an ad does not need summarizing; a tool call that is obviously safe does not need review. One Jev request per input answers "does this need the expensive step?" and, if so, which one.

```js
const j = await jev.systemOne({ state: { message }, questions: {
  kind: choice("What kind of message is this?", { scam: "...", ad: "...", invite: "...", other: "..." }),
  needsReply: noul("Does the sender expect a reply?"),
}});
if (j.answers.kind.choice === "scam") return junk(message);          // no LLM
if (j.answers.needsReply.noul < 0.7) return readLater(message);      // no LLM
```

This is what the community model routers do (which model, how much reasoning effort) and what guardrails do (is the input safe). In our inbox example two of four messages never reach the LLM.

## 2. Jev into the LLM: pass typed facts, not raw guesses

Whatever Jev decided goes into the prompt as facts the LLM can trust: the kind, the language, the tone, the urgency. The LLM then does the one thing Jev cannot, write the text, without also having to re-derive the classification.

```text
Facts decided by a classifier (trust them): kind=invite, language=Traditional Chinese, tone=warm.
Rules: answer exactly what the sender asked; do not promise money, dates or personal data beyond ...
```

Two things happen: the prompt gets shorter and more stable (good for caching), and the LLM's output becomes easier to verify, because you know what it was asked to do.

## 3. Jev after the LLM: verify, then loop the verdict back

The LLM's draft goes back into Jev with the original: does it answer the question, does it overcommit, is it the right language, is it polite. Typed verdicts, thresholds in code. A failed draft is retried once with the failure named in the prompt; a second failure goes to a person.

```js
const v = await jev.systemOne({ state: { original, draft, situation }, questions: {
  answers: noul("Does `draft` answer what the sender in `original` actually asked?"),
  overcommits: noul("Does `draft` promise money, a date or personal data that `situation` does not support?"),
}});
const ok = v.answers.answers.noul > 0.7 && v.answers.overcommits.noul < 0.3;
```

This is the SDE-cascade and citation-check pattern from the official cookbooks, and what jev-review, limpet and Foreman do for code.

## 4. LLM after Jev: name what Jev could not

When Jev returns `other` or a flat distribution, the item is new. That is the moment for the LLM: name the category, explain the anomaly, write the summary a person needs. Then the new category goes back into the Jev question, and the next thousand items are cheap again.

## The example

`examples/js/jev-then-llm.mjs` runs positions 1 to 3 over four inbox messages: Jev gates, the LLM drafts replies for the two that need one, Jev checks each draft and retries once if it fails. The LLM step uses the Anthropic SDK when `ANTHROPIC_API_KEY` is set and otherwise falls back to the local `claude -p` command, so anyone with Claude Code can run it. Every stage is logged to `runs/jev-then-llm.jsonl`. Because the LLM's text is not deterministic, this example is not part of `npm run verify`; the Jev verdicts on each draft are the check.

## Rules of thumb

- Keep the seam typed. What crosses from Jev to the LLM is a few fields; what crosses back is text that Jev then judges. Never let the LLM's prose become the thing your code branches on.
- Jev never asks the LLM for a label it could produce itself. If you find yourself parsing a category out of the LLM's answer, that step is a Jev call in disguise.
- Log both sides. The log line for a draft should carry the Jev facts that shaped it and the Jev verdict that judged it; that is how you find out whether a bad reply came from the facts, the prompt or the model.
