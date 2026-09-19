# Find use cases

Do not start from "what can AI do". Start from your own code and look for three smells. When you find one, write the judgment as a closed question, try it on real data, then put the threshold in code.

## Smell 1: `if`/`else` on strings

Keyword tables, regex classifiers, `name.endsWith("_hold")`, `error.includes("timeout")`. Every new case means editing code, and the code silently falls to a default when the list misses.

```js
// before
const kind = ["read","read_file","view_image"].includes(name) ? "reading" : "tool";
// after: one choice, works on names it has never seen
choice("Judging from the name only, what kind of work does the agent do with this tool?",
       { editing: "...", reading: "...", searching: "...", command: "...", tool: "cannot tell from the name" })
```

Measured on 55 real tool names: the hand table was right 31 times, Jev 50 times.

## Smell 2: free text that is shown but never acted on

Agent messages, reviewer notes, rejection reasons, user input. They are printed and forgotten. Ask the two or three questions the next step actually needs: "Is this asking the user something?" "Is this claiming completion?" "Which defect category?"

## Smell 3: hand-maintained category lists scattered across files

The same set of things tagged in six files. Tag them once at registration with a fan-out of questions, write the answers into the data, and let code read fields instead of lists.

## Smell 4: "call an LLM, then parse its prose"

If the only thing you keep from an LLM call is a label, a yes/no or a level, that call is a Jev call in disguise. Replace the fetch, the regex, the JSON extraction and the fallback with one typed question.

## The unknown

Jev's closed set constrains the **answer**, not the **input**. The input can be anything new; the question is what stays fixed. New things surface in four ways:

1. **Fixed question, unknown input.** "Is this suspicious?" over code you have never seen. "Is this relevant to the current task?" over any tool output.
2. **`none` plus a flat distribution.** Always include `other`/`none`. An answer of `none`, a flat distribution or a confidence below your bar means "this is new". Route it to a person or an LLM to name the category, then add the category to the question.
3. **Speculative fan-out.** Do not know what to ask? Ask fifty properties at once and get a probability vector per item; cluster or sort in code. Try `jev run` with a question file.
4. **Examples instead of categories.** Put ten accepted and ten rejected samples in the state and ask which side the new item resembles. Categories do not need names, only examples.

What Jev cannot do here: invent the new label. Discovery is a human or generative step; Jev finds the candidates worth looking at and, once the label exists, verifies at scale. The reliable shape is a cascade: Jev screens everything, low-confidence cases go to an LLM, Jev re-verifies the LLM's answer with a new question.

## Collecting and organizing data

Jev does not fetch anything, so it cannot speed up *collection* by itself. It speeds up the two steps around collection that usually cost the most time:

- **Deciding what to collect.** Gate before the expensive fetch: "is this title actually about the query?" over search results, "is this page worth scraping?", "does this issue need the full thread?". One `noul` per candidate, then fetch only the survivors.
- **Organizing what you collected.** Map-reduce over the pile with one request per item and many questions per request: relevance to your goal, topic, sentiment, whether it duplicates an earlier item, whether it contains a claim you need to verify. The answers become columns; sorting, grouping and deduping happen in code.

```sh
# 1. collect candidates with any tool (RSS, agent-reach, gh, a scraper) into one-per-line
# 2. keep only what matters
jev filter candidates.txt "Is this item about pricing changes for developer tools?" --min 0.6 > kept.txt
# 3. tag the survivors with a whole question set at once, then look
jev run tagging.questions.json kept.txt && jev view
```

At about 300 ms and $0.00002 per item, a thousand items cost two cents and ten minutes sequentially, far less in parallel. Keep the raw items; Jev's answers are annotations you can re-run when the questions change.

## Try it in five minutes

```sh
printf '%s\n' "line one" "line two" > items.txt
jev filter items.txt "Is this line about billing?"
jev classify items.txt "What is this?" --options bug,billing,feature,other
cp examples/cli/support.questions.json my.questions.json   # edit the questions
jev run my.questions.json items.txt && jev view
```

Read next: [03 Reliability](03-reliability.md)
