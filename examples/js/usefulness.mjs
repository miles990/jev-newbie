// 評估一樣東西「有沒有用」：把「有用」拆成幾個可以各自判斷的維度，Jev 逐項給機率，程式碼用你選的權重合成分數。
// Judging whether something is useful: split "useful" into dimensions Jev can judge one by one, then combine
// them with weights YOU choose in code. Change the weights and re-rank without another API call.
// Run: node examples/js/usefulness.mjs [candidates.jsonl] [questions.json]
import { readFileSync } from "node:fs";
import { TypeSafeClient } from "@typesafe-ai/sdk";

const [cand = "examples/usefulness/candidates.jsonl", qfile = "examples/usefulness/usefulness.questions.json"] = process.argv.slice(2);
const questions = JSON.parse(readFileSync(qfile, "utf8")).questions;
const items = readFileSync(cand, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const client = new TypeSafeClient({ defaultModel: process.env.JEV_MODEL });

const results = await Promise.all(items.map(async (state) => {
  const r = await client.systemOne({ state, questions });
  const a = r.answers;
  // Normalize every dimension to 0..1, then weight. Weights are the policy; edit them freely.
  const dims = {
    relevance: a.relevance.score / 3,
    actionable: a.actionable.noul,
    credible: a.credible.noul,
    safe: a.safe.noul,
    cheap: 1 - a.cost.score / 2,
    notPitch: 1 - a.sales_pitch.noul,
  };
  const W = { relevance: 0.35, actionable: 0.2, credible: 0.2, safe: 0.1, cheap: 0.1, notPitch: 0.05 };
  const useful = Object.entries(W).reduce((s, [k, w]) => s + w * dims[k], 0);
  // Hard rules never go through the weighted sum: an unsafe item is out, whatever its score.
  const verdict = a.safe.noul < 0.5 ? "REJECT: unsafe" : a.relevance.score < 1 ? "ignore: unrelated" : useful >= 0.7 ? "worth trying" : useful >= 0.5 ? "maybe" : "skip";
  return { item: state.item, useful, verdict, dims };
}));

results.sort((x, y) => y.useful - x.useful);
for (const r of results) {
  console.log(`${r.useful.toFixed(2)}  ${r.verdict.padEnd(18)} ${r.item.slice(0, 70)}`);
  console.log("      " + Object.entries(r.dims).map(([k, v]) => `${k}=${v.toFixed(2)}`).join("  "));
}
