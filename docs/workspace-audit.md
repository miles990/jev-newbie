# Workspace audit: where Jev would replace fragile code

> Historical design notes, not verified integrations. File paths and line numbers may be stale. Proposed replacements require checking current code, comparing deterministic alternatives, and measuring labeled outcomes. Semantic models should not replace exact authorization, IDs, status codes, or arithmetic. Performance figures below are historical claims, not current guarantees.
> 歷史設計盤點，不是已完成整合或效能證明。檔案行號可能已變；每項提案需先核對現有程式與確定性替代方案，再以標註資料驗證。


[中文摘要在下方](#中文摘要) · Audited 2026-09-19 by four read-only agents over ~60 of the author's own projects under `~/Workspace`. Third-party clones and empty directories were skipped. Every item names a real file and line, what the code does now, the Jev question that would replace it, and why it matters. **None of the projects used Jev before this audit.** This file exists so anyone can see what "finding use cases in your own code" looks like at scale; the method is in [docs/en/02-find-use-cases.md](en/02-find-use-cases.md).

## Cross-project top 10 by value ÷ effort

| # | Project · file | Today | Jev question | Why first |
| --- | --- | --- | --- | --- |
| 1 | agora `src/moderator.ts:54-113` | Haiku call + regex-JSON extract to get one label | `choice` {advance_phase, continue, request_synthesis} | ~60 lines and one API key deleted; runs every round |
| 2 | clawdbot-mvp `src/todo/detector/patterns.ts:227-366` + `claude.ts:79-120` | ~140 lines of bilingual regex plus a Haiku fallback | `noul` "asks to be reminded later?" + `choice` {high, medium, low} | Deletes both detectors; fixes `之後要` false positives |
| 3 | living-world `packages/core/src/player-intent.ts:3` | if/else on `includes("market")` with invented confidences | `choice` {move_location, steal_item, talk_to_npc, inspect, unknown} + target `choice` over world ids | Input is already JSON world state; smallest diff, biggest gain |
| 4 | laceframe-motion-studio `packages/director-core/src/director.ts:33,38,107` | minor-age / real-identity / adult-confirmation regex gates before paid generation | three `noul`s | Highest stakes gate in the workspace; regex misses paraphrase |
| 5 | autonomy-runtime `src/failure-classifier.ts:3-16` | nine ordered regexes over log text | `choice` over 9 failure types | Whole module is 17 lines; also fixes tanren and agent-middleware copies |
| 6 | structured-gen `src/verify.ts:76-93` | "covered" if 40% of tokens appear as substrings | `noul` per (outline item, section) | The project's correctness claim; English stopwords break on Chinese |
| 7 | skillpkg `packages/core/src/matching/engine.ts:46-90, 262-280` | stopword list + keyword set overlap per skill | `score` per skill {not_applicable, possible, likely, definitely} | Removes the keyword contract every skill author maintains |
| 8 | asurada `src/loop/auto-route.ts:27,125` | fast-model prompt + `raw.includes(c)` to recover a category | `choice` {coding, reasoning, creative, chat, general} | Deletes fetch, timeout, fallback; keeps the route map |
| 9 | ai-pain-solver `src/services/validation.service.ts:11-35, 97-256` | five regex tables flag hedges as hallucination | `noul` unsupported facts + `choice` issue type + `score` quality | Headline feature currently backwards |
| 10 | teaching-monster `src/review-script.mjs:152,176,21,276` | Sonnet scores, then regex-scrape `accuracy: 4/5` from prose | four `score` questions (1-5) + `noul` "ready for slides?" | Already self-reports `parseError`; big latency saving per video |

Honourable mentions: anima `experience.ts:418-471` (score over relationship stages; bad JSON currently freezes progression), trustgraph `ct-classifier.ts:17-111` (five regexes are the product), knowledge-graph `read-gate.ts:376-381` (substring relevance in the headline feature), decision-chain-director `core/risk.ts:20-26` (regulated-domain keyword gate), suno-lyricist `app.js:84` (15-row bilingual theme table), godot-asset-forge `fidelity_fix_router.py:43` (routes expensive rebuilds off two substrings), local-llm-benchmark `omlx-benchmark.ts:322` (quality = character count).

Explicitly **not** Jev: evolve-trader, cryptoFinanceTool, tw-stock-breakout-ranker, finance-tools (numeric signals), logic-gate-lab, stress-bot, game servers (protocol/RTP math), nightwave, spritedoll, character-mesh-studio (pixels and geometry), seatrial and kg (deliberately deterministic).

---

## Group A: agent frameworks

No project currently imports TypeSafe/Jev (grep for `typesafe|jev` across all 15: zero hits).

### asurada — perception-driven personal agent framework (TS, OODA loop)
- fit: high
- [1] `asurada/src/loop/auto-route.ts:27` + `:125` — sends a hand-written `CLASSIFY_SYSTEM` prompt to a "fast" model, then `parseCategory` does `raw.includes(c)` substring matching to recover one of `coding|reasoning|creative|chat|general` → choice over {coding, reasoning, creative, chat, general} → value: removes a whole HTTP round-trip, timeout handling, and a fallback-to-`general` silent-failure path.
- [2] `asurada/src/loop/hesitation.ts:81-167` — six regexes (`DEFAULT_ABSOLUTE_RE`, `SOURCE_RE`, `DEFAULT_HEDGE_RE`, `CONCLUSION_RE`, `REASONING_RE`) plus weighted signal sums produce a 0-100 overconfidence score compared to threshold 30 → score on levels {grounded, hedged, assertive, overconfident} + noul "does this response cite a source for its claims?" → value: the regex list is Chinese+English keyword soup that misses paraphrase.
- [3] `asurada/src/loop/model-router.ts:45-68` — `buildTriagePrompt` asks a model for "exactly one word", then `parseRoutingDecision` regexes `\b(SKIP|REFLECT|ESCALATE)\b` and defaults to ESCALATE on no match → choice over {SKIP, REFLECT, ESCALATE} → value: per-cycle triage on every OODA tick, so latency and cost dominate.

### mini-agent — perception-driven agent, Markdown + shell + Claude CLI
- fit: high
- [1] `mini-agent/src/memory-classifier.ts:68-120` — four hand-maintained regex cue tables (`IMPERATIVE_CUES`, `OBSERVATION_CUES`, `INFERENCE_CUES`, `COMMITMENT_CUES`) with a hardcoded precedence ladder assign `memory_kind` and a fixed confidence (0.85/0.8/0.6/0.5) → choice over {observation, imperative, descriptive, inference, commitment} with Jev's real confidence replacing the fake constants → value: the cue lists are bilingual regexes that must be edited by hand every time the agent phrases something new.
- [2] `mini-agent/src/quality-gate.ts:41-110` — regex checks (`stackPattern`, `rateLimitPattern`, `residuePattern`) scan agent output for junk before it is published → noul "is this output a usable artifact rather than an error dump or template residue?" → value: gate on free text that is only displayed/logged.
- [3] `mini-agent/src/actor-selection-policy.ts:28` — `INTENT_CAPABILITY_HINTS` is a hand-maintained intent→capability keyword table feeding `scoreActor`'s magic `add(35, …)`/`add(10, …)` weights → choice over the actor names from `getDefaultDispatchableActors()` → value: the hint table drifts from reality every time an actor is added.

### tanren — perception-driven agent framework with gates + cognitive modes
- fit: high
- [1] `tanren/src/error-classification.ts:22-37` — six `lower.includes(...)` chains map an error string to `TIMEOUT|RATE_LIMIT|NOT_FOUND|PERMISSION|PARSE|NETWORK|UNKNOWN` → choice over those 7 → value: a 48-line file that is purely a keyword table and silently falls to `UNKNOWN`.
- [2] `tanren/src/meta-gates.ts:24-45` — extracts 4+-letter words, builds sets, and blocks when Jaccard concept overlap `> 0.6` for `threshold` iterations ("confirmation loop") → noul "is this thought restating an insight the agent already had?" → value: word-overlap is a terrible proxy for "same idea"; this gate blocks the agent on a false positive.
- [3] `tanren/src/gates.ts:297-380` — `createGroundBeforeOpineGate` (regex `https?:\/\/|\.com|github|npm`), `createWriteThroughGate` (`COMPLETION_WORDS = /done|fixed|完成|搞定/i`), `createCommitmentGate` (`/let me|i'll|我來|馬上/i`) → three nouls: "is the agent claiming completion?", "is it promising a future action?", "is it opining about an external resource it has not read?" → value: three bilingual keyword regexes replaced by three yes/no questions.

### mushi — 8K-token minimal agent, one API call per cycle
- fit: medium
- [1] `mushi/src/dispatcher.ts:170-180` — escalation filter drops the message if `raw.length < 10` or it matches `NOISE = /no change|unchanged|nothing new|filesystem unchanged/i` or `TEMPLATE = /^STATE (THE|YOUR…)/i` → noul "does this escalation report a real, actionable change?" → value: the noise regex is the only thing stopping the agent from paging its owner every cycle.
- [2] `mushi/src/dispatcher.ts:53-60` — `matchAcknowledgedPattern` does `lower.includes(p.pattern.toLowerCase())` against a stored suppression list → noul "is this alert an instance of the already-acknowledged pattern?" → value: exact substring matching misses the same issue reworded.
- [3] `mushi/src/dispatcher.ts:137` — `<kuro:remember>` rejects content matching `/^(the pattern|a pattern|something|noted)$/i` as a template leak → noul "is this memory a concrete fact rather than prompt-template residue?" → value: tiny allowlist that only catches four literal strings.

### agent-middleware — DAG plan orchestration, 7 worker backends
- fit: medium
- [1] `agent-middleware/src/decision-parser.ts:65-80` — `synthesizeDecisionFromProse` regexes an LLM's markdown for `chose:` / `falsifier:` / `ttl:` fields → choice over the candidate options already in the decision block, plus score for confidence → value: ~40 lines of markdown-shape regex exist only because the model won't format reliably.
- [2] `agent-middleware/src/plan-engine.ts:775` + `:293` — acceptance criteria and step conditions are evaluated with `output.includes(ac.value)` / `'contains'` / `'not_contains'` on worker output → noul "does this step output satisfy the acceptance criterion?" → value: substring matching on generated text is the classic green-but-wrong failure.
- [3] `agent-middleware/src/plan-engine.ts:751` — `lastError.includes('timeout') ? 'timeout' : 'failed'` → choice over {timeout, failed} (better: share autonomy-runtime's failure taxonomy) → value: one-keyword classifier deciding retry behavior.

### autonomy-runtime — execution reliability contracts (verify → classify → decide)
- fit: high
- [1] `autonomy-runtime/src/failure-classifier.ts:3-16` — nine ordered regex alternations over lowercased log text return `transient|provider_hold|max_turns|cancelled|workspace|contract|verification|strategic|unknown`; first match wins → choice over those 9 → value: this is the entire module (17 lines), it feeds `decideNextAction`, and an `unknown` verdict at `decision.ts:28` causes a decompose-or-escalate; the regex ordering is load-bearing and untestable against new provider error strings.
- [2] `autonomy-runtime/src/verify.ts` — evidence-first task closure checks → noul "does this evidence actually demonstrate the claimed task is done?" → value: complements the deterministic checks with a judgment the shell can't make.

### open-multi-agent — TypeScript multi-agent orchestration (`runTeam()`)
- fit: low
- [1] `open-multi-agent/src/agent/loop-detector.ts:76-81` — normalizes text and counts exact consecutive duplicates to detect a stuck agent → noul "is this output a restatement of the previous one?" → value: exact-string equality misses an agent that loops while rephrasing, which is the common case.

### agora — multi-agent roundtable discussion bridge (HTTP + JSON)
- fit: high
- [1] `agora/src/moderator.ts:54-113` — `judgeConvergence` POSTs to `api.anthropic.com` with `claude-haiku-4-5`, then does `text.match(/\{[\s\S]*\}/)`, `JSON.parse`, and validates against `['advance_phase','continue','request_synthesis']`, returning `null` on any failure → choice over {advance_phase, continue, request_synthesis} → value: textbook "call an LLM, regex its prose for JSON, keep only the label"; ~60 lines and an API key collapse to one typed call, and it runs after every discussion round.
- [2] `agora/src/moderator.ts:131-135` — `nextPhase` walks the fixed ladder `diverge → explore → converge → decide → confirm → archived` by index → score over those ordered levels ("where is this discussion actually at?") → value: currently the phase can only advance one step regardless of whether the room already converged.

### oneshot — Go harness looping a headless agent against `seatrial verify`
- fit: high
- [1] `oneshot/internal/report/report.go:312-358` (regex at `:36`) — `classify()` returns `environment|knowledge-gap|spec-ambiguous|flaky` using `envKeywords.MatchString` plus structural fallbacks → choice over {environment, knowledge-gap, spec-ambiguous, flaky} → value: the README calls the bottleneck report "its one piece of real logic", and the default branch is knowledge-gap whenever the keyword list misses.
- [2] `oneshot/internal/route/route.go:112` — `PickNext` routes the next agent by win rate within a *bottleneck class*, falling back to lexical ladder order when `class == ""` → the same choice as [1], fed straight in → value: a wrong or empty class silently disables routing.
- [3] `oneshot/internal/agenthost/agenthost.go:655-658` — detects provider auth state via `strings.Contains(value, "not logged")` → noul "does this CLI output indicate the provider session is authenticated?" → value: breaks whenever a vendor rewords its login banner.

### akari — thin Tanren-based research-partner agent
- fit: none — `akari-runtime.mjs` is a config/bootstrap shim; all judgment lives in tanren.

### anima — conversational AI with persistent memory and character personas
- fit: high
- [1] `anima/src/experience.ts:418-471` — a long "you are updating a persona" LLM call returns JSON; the code keeps only `relationshipStage`, validating against `['stranger','acquaintance','friend','close']` and falling back to the old value on any parse failure → score over the ordered levels {stranger, acquaintance, friend, close} → value: the only structured field extracted from that call is an ordered label; today a malformed JSON response freezes relationship progression forever.
- [2] `anima/src/experience.ts:131-174` — memory-manager prompt + `JSON.parse(result.text)` decides which conversation turns become durable memories → noul "is this turn worth remembering as a durable fact about the user?" per candidate → value: turns one expensive prose call into per-item yes/no with a real probability.
- [3] `anima/src/server.ts:416-445` — web search is a tool the model may call, gated only by a per-character column → noul "does answering this message require current external information?" as a pre-gate → value: skips a tool round-trip on most chit-chat turns.

### myelin — crystallizes repeated LLM decisions into zero-cost deterministic rules
- fit: medium
- [1] `myelin/src/rules.ts:53-75` — `matchRule` supports exact, regex, includes, numeric ranges → Jev as the *fallback classifier* behind the rule cache (choice over the rule's own action set) → value: myelin's premise is "LLM only handles genuinely novel inputs"; at ~$0.00002 and 300 ms, Jev makes the miss path nearly as cheap as the hit path.
- [2] `myelin/src/crystallizer.ts:20-60` — `eventFingerprint` + `numericBucket` infer a rule from exact context-key equality → noul "do these decisions share the same underlying reason?" before promoting a rule → value: fingerprint equality over-fits.

### gatesmith — zero-LLM deterministic acceptance gates with provenance ledger
- fit: medium (constrained: "zero LLM" is an explicit design constraint in CONSTITUTION.md)
- [1] `gatesmith/packages/checks/src/diff-covers-claim.ts:75-99` — token overlap between claim text and `git diff --name-only` paths; its own evidence string calls it 「啟發式」 → noul "does this diff plausibly implement this claim?" → value: returns `unknown` whenever token extraction fails; the four-state verdict already has an `escalate` slot for low confidence.
- [2] `gatesmith/packages/checks/src/no-todo-left.ts` — TODO/FIXME marker scan → noul "is this marker an unfinished obligation rather than a reference in prose/test fixture?" → value: kills false positives.
- [3] Adopting Jev here needs a constitutional carve-out (e.g. Jev verdicts confined to `unknown`/`escalate`, never `pass`).

### seatrial — Go harness that proves an agent's "done" claim with signed receipts
- fit: low — deliberately deterministic (numeric thresholds, receipt chains, CLI `--help` probes). Its LLM-shaped work is already delegated to an external judge program.

### karakuri — docs-only design repo
- fit: none — zero source files. `docs/04-human-gates.md` specifies four human gates, three of which are yes/no or score questions when implemented.

## Group B: knowledge and tooling

### knowledge-nexus — Go MCP server + CLI for a personal knowledge store
- fit: low
- [1] `knowledge-nexus/internal/cli/search.go:11` — `kn search` is a thin FTS passthrough → after retrieval, `score` each hit on {off_topic, tangential, on_topic, directly_answers} against the query → value: FTS returns matches, not answers.

### knowledge-graph — agent memory service (property graph + event sourcing + CE+R retrieval)
- fit: high
- [1] `knowledge-graph/src/read-gate.ts:376-381` — `searchContextEnvelope` scores nodes by counting raw substring hits (+0.5, name +0.3) → `score` each candidate on {irrelevant, weakly_related, relevant, essential} vs the agent's context → value: this is the CE+R core, and it cannot match a paraphrase.
- [2] `knowledge-graph/src/extraction.ts:30-36, 49-64` — Claude API with a tool schema; on any failure falls back to `simpleExtraction`, tagging every sentence `observation` at confidence 0.5 → per sentence: `noul` "durable knowledge claim?" + `choice` over {fact, observation, hypothesis, decision, methodology, lesson} → value: replaces both the expensive call and a fallback that poisons the graph.
- [3] `knowledge-graph/src/quality-gate.ts:36-50` — write gate rejects triples on character-count thresholds → `noul` "specific enough to be re-read months later?" + `score` {junk, thin, adequate, rich} → value: length is a proxy for the thing they want to block.

### kg — Go CLI + one SQLite file; signed knowledge graph
- fit: low
- [1] `kg/internal/query/query.go:195` — optional post-retrieval `score` rerank before `--budget` truncation. The README keeps supersedes/decay/trust deterministic; do not touch those.

### trustgraph — CLI that turns a Markdown discussion into decision packs
- fit: high
- [1] `trustgraph/src/trustgraph/ct-classifier.ts:17-21, 52-111` — five bilingual regexes (`riskPattern` is `/(risk|風險|if .+ then|如果)/i`) route every sentence into risk / decision / unknown / action / claim|hypothesis → `choice` over {risk, decision, unknown, action, claim, hypothesis, none} per sentence → value: this classifier *is* the product, and `如果` matching "risk" misfires on any conditional.
- [2] `trustgraph/src/trustgraph/ct-classifier.ts:92` — unknown priority by `/pay|block|critical|資料不足|missing|do not know/i` → `score` {low, medium, high, blocking}.
- [3] `trustgraph/src/trustgraph/verifier.ts:7,19` — `riskyPatterns` blocks commands via six regexes before `exec` → `noul` "irreversible or remote side effects?" → value: trivially evaded (`rm -fr`, `npm publish`, `terraform apply`).

### prompt-library — CRUD REST service
- fit: none

### product-meeting — multi-agent product meeting simulator
- fit: high
- [1] `product-meeting/src/skills.ts:81-91` — `matchSkills` ranks skill files by keyword overlap with the idea → `score` each skill on {not_applicable, marginal, applicable, central} → value: hand-maintained `keywords:` frontmatter in every skill file.
- [2] `product-meeting/src/conflict.ts:41-44` — conflicts detected only by comparing self-tagged `opinion.position` → `noul` over two agents' reasoning: "do these positions actually contradict?" → value: agents can both tag `support` and still disagree.
- [3] `product-meeting/src/conflict.ts:57` — `requiresBossDecision` on `Math.abs(confidence gap) > 0.5` → `noul` "does this need a human decision?" → value: interrupting the user gated on a constant.

### clawdbot-mvp — Telegram/Signal AI bot with memory and proactive notifications
- fit: high
- [1] `clawdbot-mvp/src/todo/detector/claude.ts:79-120` — zh prompt to Haiku, then `JSON.parse(jsonMatch[0])` for `{isTodo, priority}` → `noul` "asks to be reminded later?" + `choice` {high, medium, low}.
- [2] `clawdbot-mvp/src/todo/detector/patterns.ts:227-366` — ~140 lines of bilingual regexes plus `PRIORITY_INDICATORS` → same two questions replace both detectors → value: stops `之後要` firing on "之後要看電影".
- [3] `clawdbot-mvp/src/proactive/intelligence/context.ts:107-127, 162-165` — `taskKeywords` + `questionPatterns` summed into a numeric priority gated at `>= 3` → `noul` "is the user stuck / waiting?" and `score` {none, gentle_nudge, answer_now} → value: decides unprompted messages; wrong = spam.
- also: `clawdbot-mvp/src/memory/validation/trust-scorer.ts:26-53` (static source weights).

### crabwalk — upstream project by another author
- fit: none

### multi-agent-workflow — 6-stage multi-perspective workflow plugin
- fit: high
- [1] `multi-agent-workflow/cli/validators/perspective.py:214-237` — quality scored by field presence and `len(description) >= 50` → `score` each finding on {boilerplate, vague, specific, actionable} → value: the gate measures verbosity.
- [2] `multi-agent-workflow/cli/validators/quality_gate.py:112-147` — RESEARCH gate passes on `len(consensus.points) >= 2` → `noul` "do these perspectives agree on the same claim?" and "is this conflict resolved?" → value: stage advancement decided by counting dict keys.
- [3] `multi-agent-workflow/shared/tools/model-router.js:11-40` — static stage×perspective → model table → `score` task difficulty {trivial, routine, hard} → value: pays sonnet prices for trivial tasks.

### sqlite-memory-mcp — SQLite+FTS5 memory MCP server
- fit: medium
- [1] `sqlite-memory-mcp/src/tools/memory.ts:70-80` — FTS5 rank order → `score` top-N on {irrelevant, background, relevant, exactly_this} and re-sort → value: reranking makes a ~200-token budget trustworthy.
- [2] `sqlite-memory-mcp/src/tools/failures.ts:70-71` — failures ranked by `occurrence_count` → `noul` "about the same situation?" → value: frequency is not similarity.

### claude-dev-memory — cross-session memory MCP (Letta-backed)
- fit: medium
- [1] `claude-dev-memory/src/tools/search.ts:62-71` — filters by provider `relevance < 0.7` → `score` each entry on {irrelevant, weak, relevant, essential} → value: 0.7 is an untuned cutoff on a vendor's scale.

### task-manager-api, agent-system
- fit: none (CRUD; docs-only)

### skillpkg — agent-skill package manager
- fit: high
- [1] `skillpkg/packages/core/src/matching/engine.ts:46-90` — `extractKeywords` with a ~60-word EN/ZH stopword list → delete; pass the raw goal.
- [2] `skillpkg/packages/core/src/matching/engine.ts:262-280` — set-membership scoring against `triggers.keywords.primary/secondary` → `score` each skill on {not_applicable, possible, likely, definitely} → value: every skill author hand-maintains two keyword lists.

### repo-visualizer — GitHub URL → Mermaid diagrams
- fit: medium
- [1] `repo-visualizer/lib/ai.ts:219-265` — diagram types from filename rules with hardcoded `confidence: "high"` → `choice` over {architecture, dependency, techstack, module, class, sequence, flow, mindmap} with real confidence.
- [2] `repo-visualizer/lib/ai.ts:564-639` — prose suggestions parsed from a fenced block → gate with `noul` per category.

### rts — remote shell/file/system tool server in Go
- fit: low
- [1] `rts/http.go:30-36` — IP allowlist + token only; `exec` has no command-level check → `noul` "destroy data or affect systems beyond this machine?" as an advisory gate (additive).

## Group C: creative and media

### omniflow-studio — node-based AI workflow editor
- fit: medium
- [1] `omniflow-studio/backend/routes/autoflow.py:190` — Gemini decides whether a request has enough info → `noul` "enough to plan a workflow?" + `choice` over the missing-info set {situation, problem, implication, need} → value: replaces a Gemini round-trip in the requirement wizard.
- [2] `omniflow-studio/backend/routes/autoflow.py:132` — advisory improvements prose → `noul` "dangling step?" + `score` {clean, minor-issues, broken}.

### movie-agent — storyboard/MV production planner
- fit: high
- [1] `movie-agent/src/domain/validators.ts:6` — `activeHair` regexes for `/(five|5)/` and `/(ribbon|lock)/` → `noul` "does this panel keep five active ribbons/locks rather than a loose rear curtain?" → value: passes any rephrasing, fires on correct prose.
- [2] `movie-agent/src/domain/validators.ts:15` — `finalBeatChecks` hardcodes three regexes per panel → `choice` {tension-setup-held, gap-closed, facing-broken, unclear} → value: last gate before paid generation.
- [3] `movie-agent/src/domain/validators.ts:110` — shot grammar only checks non-emptiness → `noul` "camera + shot tag consistent with the action?"

### teaching-monster — educational video pipeline
- fit: high
- [1] `teaching-monster/src/review-script.mjs:152, :176` — Sonnet scores a script, then `extractJSON`, then regex fallback `extractScoresFromText` (`:21`), pass rule at `:276` → four `score` questions (1..5) on accuracy/adaptation/structure/engagement + `noul` "ready for slides?" → value: kills a prose-parsing path that already reports `parseError: true`.
- [2] `teaching-monster/src/review-script.mjs:963` — persona fit by counting `exampleKeywords` hits → `score` {no-reference, token-reference, woven-throughout}.
- [3] `teaching-monster/src/code-checks.mjs:257` — `REVIEW_KEYWORDS` regex for reviewer meta-commentary → `noul` "addressed to the student, or reviewer commentary?" Keep `verifyArithmetic` in code.

### laceframe-motion-studio — autonomous AI director for images/video
- fit: high
- [1] `laceframe-motion-studio/packages/director-core/src/director.ts:33` — `minorRolePatterns` + `containsMinorAge` at `:59` gate every brief before paid generation → `noul` "depicts or implies a person under 18?" → value: highest-stakes gate; keep the numeric age comparison in code.
- [2] `director.ts:38` — `identityPatterns` for real-person likeness → `noul` "reproduce a real identifiable person's likeness or voice?"
- [3] `director.ts:107` — `includes("成年")` literal adult-confirmation → `noul` "does this clause affirm an adult subject?" → value: "21+" in English fails today.

### suno-lyricist — Suno lyric generator
- fit: high
- [1] `suno-lyricist/app.js:84` — `THEME_KEYWORDS`, 15 categories with bilingual keyword arrays → `choice` over the 15 theme ids.
- [2] `suno-lyricist/app.js:108` — `analyzeTheme` by `includes(keyword)` → three `choice`s over genre / mood / vocal sets → value: single-char CJK keys like `夜` are brittle.
- [3] `suno-lyricist/app.js:2720` — fuzzy genre remap → `choice` over `STYLE_PRESETS` ids.

### sonoscope — audio-reactive visuals
- fit: medium
- [1] `sonoscope/src/ai/prompt.ts:48` — `TOKENS` substring table mapping prompt text to scene ids → `choice` over 9 scene ids + `score` {calm, medium, intense}. `src/ai/classifier.ts:20` runs on FFT numbers: not Jev.

### nightwave — browser DAW
- fit: none (DSP; the command palette's fuzzy scorer is correct as-is)

### video-gif-studio — reference image → video → transparent GIF
- fit: low
- [1] `video-gif-studio/scripts/grok_video.py:9, :59` — a prompt-safety `noul` before submitting would avoid a moderated paid job. Everything else is pixel work.

### paperdoll-studio — illustration → layered paperdoll
- fit: medium
- [1] `paperdoll-studio/studio/relabel.py:19, :58` — 19-name `SLOTS` whitelist + a vision call with hand-written disambiguation rules → text-only Jev pre-pass: `choice` over the 19 slots given the layer name → value: leaves only ambiguous layers to the slow vision call.

### sprite-forge, character-mesh-studio, spritedoll, dreamina-video
- fit: low/none (job plumbing, geometry, pixels, skill-only)

### godot-asset-forge — Godot 4 asset scaffolding + verify layer
- fit: high
- [1] `godot-asset-forge/processors/anime3d/fidelity_fix_router.py:43` — routes a failed art review by `"face" in f or "plate" in f or "view" in f` else `rebuild_geometry` → `choice` over {face_rig_cleanup, manual_or_external_cleanup, rebuild_geometry, regenerate_or_expand_plates, rerender_or_pose_fix} → value: sends the pipeline to an expensive rebuild off two keywords.
- [2] `godot-asset-forge/processors/anime3d/commercial_acceptance_qa.py:39` — 11 exact-name review categories; the vision reviewer writes Chinese prose → `choice` over the 11 categories per finding → value: prose findings are silently dropped today.
- [3] `commercial_acceptance_qa.py:52` — stage tokens grepped from markdown → `noul` per stage "does this report conclude the stage passed?"

### forma-quest — parametric 3D modelling game
- fit: medium
- [1] `forma-quest/bridge/vision.ts:107, :172-184` — a ~1500-word prompt makes the vision model emit `action` and `domain` labels → let it write findings, then Jev `choice` over `domain` and `action` → value: most of the prompt is labelling rules, not seeing.
- [2] `forma-quest/bridge/vision.ts:205` — `repairPrompt` fed to the editor → `noul` "stays within parametric-editor operations?"

### living-world — AI-native game runtime
- fit: high
- [1] `living-world/packages/core/src/player-intent.ts:3` — if/else over `includes("market"|"市場")` etc. with hardcoded confidences → `choice` {move_location, steal_item, talk_to_npc, inspect, unknown} + `choice` over npc/item ids → value: the most direct swap in the audit.
- [2] `player-intent.ts:9` — target by `includes(location.name)` → `choice` over `Object.keys(world.locations)` given the JSON world state.
- [3] `living-world/packages/core/src/llm-proposals.ts:11` — NPC proposals as free text → `choice` over the `actionType` set in `proposals.ts` → value: per-tick NPC decisions become affordable. Keep `validator.ts` hard rules.

### tanren-card-mvp — Godot card-battler + AI dev team
- fit: medium
- [1] `tanren-card-mvp/tools/verify-brief.mjs:36` — `SPECS` gates briefs on regex field presence → `noul` per field "does this brief actually state its non-goals / acceptance criteria / owner?" → value: catches "plausible-but-broken" content.
- [2] `verify-brief.mjs:24` — first-line token must be `PASS`/`FAIL`/`BLOCKED` → `noul` fallback.
- [3] `tanren-card-mvp/tools/acceptance-scorecard.mjs:29` — judgment items left to a QA agent → `score` {fail, partial, pass} per item.

## Group D: finance and miscellaneous

### claude-lab/decision-chain-director — professional decision workflows
- fit: high
- [1] `decision-chain-director/src/domains/shared.ts:29` (`keywordScore`, dispatched at `src/core/adaptation.ts:28`) — bilingual keyword hit counts pick the domain pack → `choice` over {product-strategy, software-architecture, creative-direction, evidence-research, ai-agent-engineering, general-facilitation} with confidence fallback → value: first and most consequential decision in the chain.
- [2] `decision-chain-director/src/core/risk.ts:20-26` — `regulatedRiskFloor` matches four word lists to force `critical` → `choice` {medical, legal, financial, safety_critical, none} + `noul` "requires a licensed professional's sign-off?" → value: `includes("tax")` misses 「報稅」.
- [3] `decision-chain-director/src/domains/software-architecture.ts:141-155` — regex decides risk and whether research is needed → `score` {low, medium, high, critical} + `noul` "needs current external information?"

### ai-pain-solver — Express API for AI response validation and knowledge RAG
- fit: high
- [1] `ai-pain-solver/src/services/validation.service.ts:11-35, 97, 156, 186, 256` — regex tables flag `據我所知`, `我認為`, `研究顯示`, `等等`, `最新` and subtract points → `noul` "states facts it cannot support?" + `choice` {hallucination, inconsistency, incomplete, outdated, ok} + `score` {poor, weak, acceptable, good} → value: flags every polite hedge and misses confident fabrication.
- [2] `validation.service.ts:223-250` — contradiction = negation word + >50% overlap → `noul` "does A contradict B?"
- [3] `ai-pain-solver/src/services/knowledge.service.ts:106-145`, `prompt.service.ts:276-283` — substring relevance → `noul` per candidate + `choice` over the 8 `PromptCategory` values.

### structured-gen — outline-locked document generator with verification
- fit: high
- [1] `structured-gen/src/verify.ts:76-93` — `hasKeywords`: covered if ≥40% of tokens appear as substrings → `noul` "does this section cover this outline item?" per pair → value: the project's correctness claim; English stopword list breaks on Chinese.
- [2] `structured-gen/src/verify.ts:30-36` — "benefit of doubt" tie-break → `noul` "is the coverage claim justified by the text?"
- [3] `structured-gen/src/outline.ts:69-80`, `write.ts:74-78`, `pipeline.ts:106-109` — three copies of "parse LLM prose into JSON" for a `category` label → `choice` {point, data, term, requirement}.

### local-llm-benchmark — Apple Silicon LLM benchmark harness
- fit: medium
- [1] `local-llm-benchmark/scripts/omlx-benchmark.ts:322` — `success: content.length >= expectedMinLength` → `noul` "correctly answers?" + `score` {wrong, partial, correct, excellent} → value: every quality number rests on a length threshold.
- [2] `local-llm-benchmark/scripts/omlx-vision-benchmark.ts:63-128, 240` — `expectedKeywords` synonym lists → `noul` on the model's text output.
- [3] README:31 asks for a <200 ms model router that does not exist → `choice` over the profile names in `profiles/`.

### agent-adapter — unified adapter over three agent SDKs
- fit: medium
- [1] `agent-adapter/packages/context-kg/src/index.ts:30-38, 194-197` — the calling model must pick `ALLOWED_MEMORY_TYPES` via prompt text → `choice` over {decision, preference, fact, lesson, summary} computed adapter-side.
- [2] `agent-adapter/packages/context-kg/src/index.ts:355-375` — `kg_recall` returns raw hits → `noul` "relevant to the current task?" post-filter.

### claude-lab/adaptive-interaction — Rust runtime with interaction policy
- fit: medium
- [1] `adaptive-interaction/crates/interaction-policy/src/lib.rs:97-240` — fixed allowlist ladder → `noul` "appropriate moment to interrupt on this channel?" as an advisory layer after the hard rules.
- [2] `lib.rs:154-166` — hand-set `RiskClass` per actuator → `score` {low, medium, high} from the intent text.

### weixin_search_mcp — WeChat article search via Sogou
- fit: medium
- [1] `weixin_search_mcp/weixin_search_mcp/tools/weixin_search.py:37-55, 138-154` — fetches full bodies with no relevance check → `noul` "is this title actually about the query?" pre-fetch gate.
- [2] `weixin_search.py:125-136` — `score` {off_topic, tangential, on_topic, directly_answers} before returning.

### claude-usage — token/cost dashboard
- fit: low
- [1] `claude-usage/scanner.py:92-121` — user turns parsed and discarded → `choice` over a work-type set per session → value: "what did I spend tokens on".

### evolve-trader, cryptoFinanceTool, tw-stock-breakout-ranker, finance-tools, logic-gate-lab, stress-bot, battle-chess-game, game-server, claude-code-mcp
- fit: none — numeric signals, protocol drivers, or third-party. `cryptoFinanceTool/origin/ai-suggestion.py:200-240` and `finance-tools/python-openai-trade/trade.py:200-240` ask o1 for prose trading advice: generated text and numeric advice, deliberately excluded.

---

## 中文摘要

2026-09-19 用四個唯讀探索 agent 掃描 `~/Workspace` 下約六十個自有專案。掃描前沒有任何專案用過 Jev。每一項都寫明檔案與行號、現在的做法、能取代它的 Jev 問題、以及為什麼重要。方法見 [docs/zh-TW/02-find-use-cases.md](zh-TW/02-find-use-cases.md)。

跨專案前十名（價值除以工作量）：agora 的收斂判斷（Haiku 呼叫加正規表達式抽 JSON，換成一個 choice）、clawdbot-mvp 的待辦偵測（140 行雙語正規表達式加 Haiku 備援，換成一個 noul 加一個 choice）、living-world 的玩家意圖（if/else 加杜撰的信心值）、laceframe-motion-studio 的未成年與真人肖像關卡（付費生成前最高風險的關卡）、autonomy-runtime 的失敗分類（九條正規表達式）、structured-gen 的覆蓋率驗證（40% 關鍵字重疊）、skillpkg 的技能比對（每位作者手維護關鍵字）、asurada 的自動路由、ai-pain-solver 的幻覺偵測（目前把客氣的保留語氣當幻覺）、teaching-monster 的腳本評分（LLM 打分再用正規表達式刮分數）。

明確不適合的：交易與選股（數值訊號）、遊戲伺服器（協定與 RTP 數學）、DSP 與像素工具、以及刻意保持決定性的 seatrial 與 kg。
