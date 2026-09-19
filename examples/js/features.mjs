// Jev as a feature extractor：把文字變成數值特徵矩陣，給傳統 ML 或統計用；並用相關性看哪些特徵真的有用。
// Jev as a feature extractor: turn text into a numeric feature matrix for classical ML or statistics, and use
// correlation with a label to see which proposed features actually carry signal (the "feature discovery" idea).
//
// Each question is one feature column. One Jev request per item answers all of them in parallel. The output is a CSV
// you can load into pandas, scikit-learn, Excel or a spreadsheet. Jev does the reading; the statistics stay in code.
// Run: node examples/js/features.mjs   → runs/features.csv
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { TypeSafeClient, noul, score } from "@typesafe-ai/sdk";

const jev = new TypeSafeClient({ defaultModel: process.env.JEV_MODEL });
mkdirSync("runs", { recursive: true });
const cases = readFileSync("examples/cli/inbox.cases.jsonl", "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const extra = ["帳號有異常登入，請回撥 0800-123-456 確認身分。", "你好，上次會議的簡報可以再寄一次給我嗎？", "Package arriving today. Track it here: bit.ly/3xTrK", "這個月房租記得匯，謝謝。（來自未儲存的號碼）"];
const items = [...cases.map((c) => ({ text: c.state.item, label: c.expect.needs_reply })), ...extra.map((t) => ({ text: t, label: null }))];

// Candidate features. Some are obviously useful, some are probably noise; the correlation table at the end tells which.
const FEATURES = {
  asks_question: "Does the message contain a question addressed to me?",
  from_known_person: "Does it read like it comes from someone who knows me personally?",
  has_deadline: "Does it mention a specific deadline, date or time?",
  asks_money: "Does it ask me to pay or transfer money?",
  asks_click_or_login: "Does it ask me to click a link, log in, or enter account details?",
  is_marketing: "Is this a promotion or advertisement?",
  claims_institution: "Does it claim to be from a bank, company, clinic or government body?",
  polite_closing: "Does it end with thanks or a polite closing?",
  mentions_food: "Does it mention food or a meal?",
  uses_english: "Is the message mainly in English?",
};
const rows = await Promise.all(items.map(async (it) => {
  const r = await jev.systemOne({ state: { message: it.text }, questions: { ...Object.fromEntries(Object.entries(FEATURES).map(([k, q]) => [k, noul(q)])), urgency: score("How soon does this need my attention?", ["can wait a week", "within a few days", "today"]) } });
  const f = Object.fromEntries(Object.keys(FEATURES).map((k) => [k, r.answers[k].noul]));
  return { ...it, features: { ...f, urgency: r.answers.urgency.score / 2 } };
}));

// 1. the feature matrix as CSV
const cols = [...Object.keys(FEATURES), "urgency"];
const csv = ["text,label," + cols.join(","), ...rows.map((r) => [JSON.stringify(r.text), r.label ?? "", ...cols.map((c) => r.features[c].toFixed(3))].join(","))].join("\n");
writeFileSync("runs/features.csv", csv);
console.log(`feature matrix: ${rows.length} rows × ${cols.length} features → runs/features.csv\n`);
console.log("text".padEnd(30) + cols.map((c) => c.slice(0, 9).padStart(10)).join(""));
for (const r of rows) console.log(r.text.slice(0, 28).padEnd(30) + cols.map((c) => r.features[c].toFixed(2).padStart(10)).join(""));

// 2. which features carry signal for the label "needs_reply"? (point-biserial correlation, computed in code)
const labeled = rows.filter((r) => r.label !== null && r.label !== undefined);
const corr = (xs, ys) => { const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n; const sxy = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0); const sx = Math.sqrt(xs.reduce((s, x) => s + (x - mx) ** 2, 0)), sy = Math.sqrt(ys.reduce((s, y) => s + (y - my) ** 2, 0)); return sx && sy ? sxy / (sx * sy) : 0; };
const ys = labeled.map((r) => (r.label ? 1 : 0));
console.log(`\ncorrelation with label needs_reply (n=${labeled.length} labeled rows; small, so treat as a hint, not a result):`);
for (const c of cols.map((c) => ({ c, r: corr(labeled.map((r) => r.features[c]), ys) })).sort((a, b) => Math.abs(b.r) - Math.abs(a.r)))
  console.log(`  ${c.c.padEnd(22)} r=${c.r >= 0 ? "+" : ""}${c.r.toFixed(2)}  ${Math.abs(c.r) > 0.5 ? "◆ useful" : Math.abs(c.r) > 0.25 ? "◇ weak" : "· noise"}`);
console.log("\nNext: drop the noise columns, add a proposed feature, re-run. That loop is the official autoresearch cookbook; with real labels and a held-out set it feeds a CatBoost or logistic model.");
