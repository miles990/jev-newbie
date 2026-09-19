// Monte Carlo × Jev：Jev 給每個項目校準過的機率；Monte Carlo 把這些機率推過你的政策，算出結果的分布與風險。
// Monte Carlo with Jev: Jev supplies calibrated per-item probabilities; Monte Carlo propagates them through your
// policy to get distributions, expected costs and confidence intervals — all in code, after ONE Jev pass.
//
// Three uses, all in this file:
//   1. Simulate a policy: sample each message's true outcome from Jev's probabilities 10,000 times and see how often
//      a threshold policy deletes a real message or misses a reply. Compare two thresholds honestly.
//   2. Expected-cost decisions: per message, choose the action with the lowest expected cost instead of a fixed cutoff.
//   3. Bootstrap the golden set: resample the labeled cases to put a confidence interval on accuracy.
// Jev is called once per message (12 calls). Everything after that is arithmetic, which is exactly what Jev is bad at
// and code is good at. The RNG is seeded, so the numbers are reproducible.
//
// Run: node examples/js/monte-carlo.mjs
import { readFileSync } from "node:fs";
import { TypeSafeClient, choice, noul } from "@typesafe-ai/sdk";

const jev = new TypeSafeClient({ defaultModel: process.env.JEV_MODEL });
// The inbox file plus four deliberately ambiguous messages: Monte Carlo only has something to say where Jev is unsure.
const messages = [
  ...readFileSync("examples/cli/inbox-messages.txt", "utf8").split("\n").filter(Boolean),
  "帳號有異常登入，請回撥 0800-123-456 確認身分。",
  "你好，上次會議的簡報可以再寄一次給我嗎？",
  "Package arriving today. Track it here: bit.ly/3xTrK",
  "這個月房租記得匯，謝謝。（來自未儲存的號碼）",
];
const cases = readFileSync("examples/cli/inbox.cases.jsonl", "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));

// seeded RNG (mulberry32) so re-runs give the same Monte Carlo numbers for the same probabilities
let seed = 20260919; const rand = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pct = (x) => (x * 100).toFixed(1) + "%";
const quantile = (arr, q) => { const s = [...arr].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };

// ---- one Jev pass: per message, p(scam) and p(needs reply)
const items = await Promise.all(messages.map(async (m) => {
  const r = await jev.systemOne({ state: { message: m }, questions: {
    kind: choice("What kind of message is this?", { bill: "a payment I owe", scam: "phishing or fraud", invite: "an invitation", appointment: "a booking or delivery notice", ad: "marketing", personal: "someone I know asks me something", other: "none of the above" }),
    needsReply: noul("Does the sender expect me to reply?"),
  }});
  return { m, pScam: r.answers.kind.probabilities.scam ?? 0, pReply: r.answers.needsReply.noul, kind: r.answers.kind.choice };
}));
console.log("Jev probabilities (one pass):");
for (const it of items) console.log(`  p(scam)=${it.pScam.toFixed(2)}  p(reply)=${it.pReply.toFixed(2)}  ${it.kind.padEnd(12)} ${it.m.slice(0, 40)}`);

// ---- 1. simulate a policy: how often does it delete a real message or miss a reply?
const N = 10000;
function simulate(deleteAbove, replyAbove) {
  const wrongDeletes = [], missedReplies = [], repliesOwed = [];
  for (let i = 0; i < N; i++) {
    let wd = 0, mr = 0, owed = 0;
    for (const it of items) {
      const isScam = rand() < it.pScam, wantsReply = rand() < it.pReply;   // sample the "true" world from Jev's calibrated p
      const deleted = it.pScam > deleteAbove, replied = !deleted && it.pReply > replyAbove;
      if (deleted && !isScam) wd++;
      if (wantsReply && !isScam && !replied) mr++;
      if (wantsReply && !isScam) owed++;
    }
    wrongDeletes.push(wd); missedReplies.push(mr); repliesOwed.push(owed);
  }
  const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  return { deleteAbove, replyAbove, wrongDeletes: mean(wrongDeletes), pAnyWrongDelete: wrongDeletes.filter((x) => x > 0).length / N, missedReplies: mean(missedReplies), owedP50: quantile(repliesOwed, 0.5), owedP90: quantile(repliesOwed, 0.9) };
}
console.log(`\nPolicy simulation over ${N} sampled weeks of this inbox:`);
for (const s of [simulate(0.8, 0.7), simulate(0.95, 0.5), simulate(0.6, 0.9)])
  console.log(`  delete if p(scam)>${s.deleteAbove}, reply if p(reply)>${s.replyAbove}: wrong deletes/wk=${s.wrongDeletes.toFixed(3)} (P(any)=${pct(s.pAnyWrongDelete)}), missed replies/wk=${s.missedReplies.toFixed(2)}, replies owed p50/p90=${s.owedP50}/${s.owedP90}`);

// ---- 2. expected-cost decision per message (no fixed threshold at all)
const COST = { readScam: 1, deleteReal: 40, missReply: 15, replyNoise: 3 };   // your numbers; units are minutes of pain
console.log("\nExpected-cost decisions (cost units: minutes of pain):");
for (const it of items) {
  const eDelete = (1 - it.pScam) * COST.deleteReal;
  const eKeepReply = it.pScam * COST.readScam + (1 - it.pReply) * COST.replyNoise;
  const eKeepIgnore = it.pScam * COST.readScam + it.pReply * (1 - it.pScam) * COST.missReply;
  const best = Object.entries({ delete: eDelete, reply: eKeepReply, ignore: eKeepIgnore }).sort((a, b) => a[1] - b[1])[0];
  console.log(`  ${best[0].padEnd(7)} E=${best[1].toFixed(1).padStart(5)}  (delete ${eDelete.toFixed(1)}, reply ${eKeepReply.toFixed(1)}, ignore ${eKeepIgnore.toFixed(1)})  ${it.m.slice(0, 40)}`);
}

// ---- 3. bootstrap the golden set: a confidence interval on "kind" accuracy
const graded = cases.map((c) => { const it = items.find((x) => x.m === c.state.item); return c.expect.kind ? (it.kind === c.expect.kind ? 1 : 0) : null; }).filter((x) => x !== null);
const boots = [];
for (let b = 0; b < 5000; b++) { let hit = 0; for (let i = 0; i < graded.length; i++) hit += graded[Math.floor(rand() * graded.length)]; boots.push(hit / graded.length); }
console.log(`\nGolden-set accuracy for kind: ${graded.reduce((s, x) => s + x, 0)}/${graded.length} observed; bootstrap 90% interval ${pct(quantile(boots, 0.05))}–${pct(quantile(boots, 0.95))} (n=${graded.length}: too small to promise more than that)`);
