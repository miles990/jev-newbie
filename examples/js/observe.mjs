// 可觀測的 Jev：把每一次呼叫記成一行 JSONL，之後才能回頭調門檻、比較模型版本。
// Run: node examples/js/observe.mjs   → 寫入 runs/jev-log.jsonl
// 用法：import { ask } from "./observe.mjs" 取代直接呼叫 client.systemOne。
import { createHash } from "node:crypto";
import { appendFileSync, mkdirSync } from "node:fs";
import { TypeSafeClient, choice, noul } from "@typesafe-ai/sdk";

const client = new TypeSafeClient({ defaultModel: process.env.JEV_MODEL });
const LOG = "runs/jev-log.jsonl";
mkdirSync("runs", { recursive: true });

/** Ask Jev and append one auditable record: what went in, what came out, what code decided. */
export async function ask(state, questions, decide, { label = "" } = {}) {
  const t0 = performance.now();
  const r = await client.systemOne({ state, questions });
  const answers = Object.fromEntries(Object.entries(r.answers).map(([k, a]) => [k,
    a.type === "noul" ? { noul: a.noul } : { [a.type]: a[a.type], confidence: a.confidence, probabilities: a.probabilities }]));
  const decision = decide(r.answers);
  const record = {
    at: new Date().toISOString(), label, model: r.model,
    stateHash: createHash("sha256").update(JSON.stringify(state)).digest("hex").slice(0, 12),
    questions: Object.fromEntries(Object.entries(questions).map(([k, q]) => [k, q.instructions])),
    answers, decision, latencyMs: Math.round(performance.now() - t0), inputTokens: r.usage.input_tokens,
  };
  appendFileSync(LOG, JSON.stringify(record) + "\n");
  return { ...r, decision };
}

// Demo: three messages through the same questions and the same policy.
if (import.meta.url === `file://${process.argv[1]}`) {
  const Q = {
    kind: choice("What kind of inbox message is this?", { invite: "invites me somewhere", ad: "marketing", personal: "someone I know asks me something", other: "none of these" }),
    needsReply: noul("Does the message expect a reply?"),
  };
  const policy = (a) => (a.kind.confidence < 0.5 ? "clarify" : a.kind.choice);
  for (const m of ["週六晚上小美生日，來的話回我一聲～", "【限時】全館服飾 3 折起！", "媽：你上次說的電鍋是哪個牌子？"]) {
    const r = await ask({ message: m }, Q, policy, { label: "demo" });
    console.log(`${m.padEnd(12)} → ${r.decision.padEnd(9)} conf=${r.answers.kind.confidence.toFixed(2)} needsReply=${r.answers.needsReply.noul.toFixed(2)}`);
  }
  console.log(`\nlogged to ${LOG}. Try: node -e "console.table(require('fs').readFileSync('${LOG}','utf8').trim().split('\\n').map(JSON.parse).map(r=>({label:r.label,decision:r.decision,ms:r.latencyMs,tokens:r.inputTokens})))"`);
}
