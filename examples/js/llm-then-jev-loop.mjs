// LLM → Jev 收斂閉環：LLM 提案，Jev 對整批資料打分，程式碼決定收斂，直到指標達標或不再進步。
// A converging LLM → Jev loop: the LLM proposes, Jev scores the whole set, code decides convergence.
//
// The concrete loop here is TAXONOMY DISCOVERY. Start with a tiny category list. Jev classifies every message.
// Items that land in `other` (or low confidence) are the unknown. The LLM looks at them and proposes ONE new
// category (name + description). Code adds it, Jev re-classifies everything, and the loop repeats until the
// `other` rate is below the target, or the last round made no progress, or the iteration cap is hit.
//
// Why this converges: Jev re-scores the entire set every round for a few hundredths of a cent, the metric is a
// single number computed in code, the taxonomy only ever grows, and the best round is kept even if a later one regresses.
//
// Run: node examples/js/llm-then-jev-loop.mjs   (TYPESAFE_API_KEY; ANTHROPIC_API_KEY or a local `claude -p` for the LLM step)
import { execFileSync } from "node:child_process";
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { TypeSafeClient, choice } from "@typesafe-ai/sdk";

const jev = new TypeSafeClient({ defaultModel: process.env.JEV_MODEL });
const LOG = "runs/llm-then-jev-loop.jsonl"; mkdirSync("runs", { recursive: true });
const log = (rec) => appendFileSync(LOG, JSON.stringify({ at: new Date().toISOString(), ...rec }) + "\n");

async function llm(prompt) {
  if (process.env.ANTHROPIC_API_KEY) {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const r = await new Anthropic().messages.create({ model: "claude-opus-5", max_tokens: 512, messages: [{ role: "user", content: prompt }] });
    if (r.stop_reason === "refusal") return "";
    return r.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  }
  return execFileSync("claude", ["-p", prompt, "--output-format", "text"], { encoding: "utf8", timeout: 120000 }).trim();
}

// The data: inbox messages plus a few kinds the starting taxonomy does not know about.
const messages = [
  ...readFileSync("examples/cli/inbox-messages.txt", "utf8").split("\n").filter(Boolean),
  "法院通知：您有一件民事調解案件，請於 10/3 上午九時到場。",
  "家長您好，下週三校外教學請攜帶水壺與雨具，回條請於週一交回。",
  "Your flight BR123 departs at 08:40. Online check-in is now open.",
  "電費本期 1,860 元，將於 28 日自動扣款。",
];

// Deliberately poor starting taxonomy. The loop will grow it.
let taxonomy = { bill: "a payment I owe", scam: "phishing or fraud", other: "none of the above fits" };
const TARGET_OTHER_RATE = 0.10, MIN_CONF = 0.6, MAX_ROUNDS = 5, MAX_CATEGORIES = 10;

async function classifyAll() {
  const rows = await Promise.all(messages.map(async (m) => {
    const r = await jev.systemOne({ state: { message: m }, questions: { kind: choice("What kind of message is this?", taxonomy) } });
    const a = r.answers.kind;
    return { m, kind: a.choice, conf: a.confidence, unknown: a.choice === "other" || a.confidence < MIN_CONF };
  }));
  const unknown = rows.filter((r) => r.unknown);
  const metric = { otherRate: unknown.length / rows.length, meanConf: rows.reduce((s, r) => s + r.conf, 0) / rows.length };
  return { rows, unknown, metric };
}

let best = null;
for (let round = 1; round <= MAX_ROUNDS; round++) {
  const { rows, unknown, metric } = await classifyAll();
  log({ round, taxonomy: Object.keys(taxonomy), metric, unknown: unknown.map((u) => u.m) });
  console.log(`\nround ${round}  categories=${Object.keys(taxonomy).length}  other-rate=${(metric.otherRate * 100).toFixed(0)}%  mean-conf=${metric.meanConf.toFixed(2)}`);
  for (const r of rows) console.log(`  ${(r.unknown ? "?" : " ")} ${r.kind.padEnd(12)} ${r.conf.toFixed(2)}  ${r.m.slice(0, 44)}`);

  // Keep the best round so a bad proposal can never make the final answer worse.
  if (!best || metric.otherRate < best.metric.otherRate) best = { round, taxonomy: { ...taxonomy }, metric };

  // Convergence checks, all in code.
  if (metric.otherRate <= TARGET_OTHER_RATE) { console.log(`\n✓ converged: other-rate ${(metric.otherRate * 100).toFixed(0)}% ≤ ${TARGET_OTHER_RATE * 100}%`); break; }
  if (Object.keys(taxonomy).length >= MAX_CATEGORIES) { console.log("\n■ stopped: category cap reached; the rest goes to a person"); break; }
  if (round > 1 && metric.otherRate >= best.metric.otherRate && best.round !== round) { console.log("\n■ stopped: no progress this round; keeping the best taxonomy"); break; }

  // The LLM does the one thing Jev cannot: name a new category for the unknown pile.
  const prompt = `Here are messages a classifier could not place. Existing categories: ${Object.keys(taxonomy).filter((k) => k !== "other").join(", ")}.
Propose exactly ONE new category that covers as many of these as possible and is clearly distinct from the existing ones.
Answer on one line in the form  id: description  where id is a single lowercase word and description is under 12 words. Nothing else.

${unknown.map((u) => "- " + u.m).join("\n")}`;
  const reply = await llm(prompt);
  const m = reply.match(/^\s*([a-z][a-z_]{1,20})\s*:\s*(.{3,120})$/m);
  if (!m || taxonomy[m[1]]) { console.log(`\n■ stopped: LLM proposal unusable (${JSON.stringify(reply.slice(0, 80))})`); break; }
  taxonomy = { ...Object.fromEntries(Object.entries(taxonomy).filter(([k]) => k !== "other")), [m[1]]: m[2].trim(), other: taxonomy.other };
  console.log(`  + LLM proposed: ${m[1]}: ${m[2].trim()}`);
  log({ round, proposal: { id: m[1], description: m[2].trim() } });
}
console.log(`\nbest taxonomy (round ${best.round}, other-rate ${(best.metric.otherRate * 100).toFixed(0)}%): ${JSON.stringify(best.taxonomy)}\nlog: ${LOG}`);
