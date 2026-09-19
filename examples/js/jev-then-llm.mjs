// Jev → LLM → Jev：把 Jev 的判斷接到 LLM，再用 Jev 驗證 LLM 的產出。
// Jev → LLM → Jev: feed Jev's judgments into an LLM, then let Jev verify what the LLM wrote.
//
// Three positions, all in one small pipeline over inbox messages:
//   1. Jev BEFORE the LLM  — decide whether a message needs a reply at all (most never reach the LLM)
//   2. Jev INTO the LLM    — hand the LLM structured facts (kind, tone, language) instead of raw guesses
//   3. Jev AFTER the LLM   — check the draft: does it answer the question? does it promise things it should not?
//                            If it fails, the verdict goes back to the LLM for one retry.
//
// Run: node examples/js/jev-then-llm.mjs
// Needs TYPESAFE_API_KEY. For the LLM step it uses the Anthropic SDK when ANTHROPIC_API_KEY is set,
// otherwise it falls back to the local `claude -p` CLI (Claude Code) so people without an API key can still run it.
import { execFileSync } from "node:child_process";
import { appendFileSync, mkdirSync } from "node:fs";
import { TypeSafeClient, choice, noul, score } from "@typesafe-ai/sdk";

const jev = new TypeSafeClient({ defaultModel: process.env.JEV_MODEL });
const LOG = "runs/jev-then-llm.jsonl"; mkdirSync("runs", { recursive: true });
const log = (rec) => appendFileSync(LOG, JSON.stringify({ at: new Date().toISOString(), ...rec }) + "\n");

// ---- the LLM step: SDK if a key exists, otherwise the local Claude Code CLI ----
async function llm(prompt) {
  if (process.env.ANTHROPIC_API_KEY) {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic();
    const r = await client.messages.create({ model: "claude-opus-5", max_tokens: 1024, messages: [{ role: "user", content: prompt }] });
    if (r.stop_reason === "refusal") return "";
    return r.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  }
  return execFileSync("claude", ["-p", prompt, "--output-format", "text"], { encoding: "utf8", timeout: 120000 }).trim();
}

const inbox = [
  { message: "週六晚上小美生日，七點在市中心那家餐廳聚餐，來的話回我一聲～", sender: "saved contact: 小美" },
  { message: "Hi, this is the clinic. Your appointment is tomorrow at 10:30. Reply Y to confirm or call to reschedule.", sender: "clinic (in contacts)" },
  { message: "您的包裹因地址不完整無法投遞，請點擊連結補填資料：http://parcel-redelivery.co/x9", sender: "unknown number" },
  { message: "【限時】全館服飾 3 折起，只到今晚 12 點！", sender: "shop newsletter" },
];
const me = { name: "Alex", availability: "free Saturday evening; tomorrow morning is free", style: "short, warm, no emoji" };

for (const item of inbox) {
  // 1. Jev BEFORE: one request, several questions; most messages stop here.
  const j = await jev.systemOne({
    state: { ...item },
    questions: {
      kind: choice("What kind of message is this?", { scam: "phishing or fraud", ad: "marketing", invite: "an invitation", appointment: "a booking or delivery notice", personal: "someone I know asks me something", other: "none of these" }),
      needsReply: noul("Does the sender expect a reply from me?"),
      language: choice("Which language should a reply be written in?", { zh: "Traditional Chinese", en: "English" }),
      tone: choice("What tone fits a reply to this sender?", { warm: "friendly and personal", neutral: "plain and polite", formal: "formal" }),
      urgency: score("How soon does this need my attention?", ["can wait a week", "within a few days", "today"]),
    },
  });
  const a = j.answers;
  const gate = a.kind.choice === "scam" ? "junk" : a.kind.choice === "ad" ? "promotions" : a.needsReply.noul > 0.7 ? "draft-reply" : "read-later";
  log({ stage: "jev-before", item, decision: gate, answers: { kind: a.kind.choice, kindConf: a.kind.confidence, needsReply: a.needsReply.noul, language: a.language.choice, tone: a.tone.choice, urgency: a.urgency.score } });
  console.log(`\n${item.message.slice(0, 48)}…\n  jev: ${a.kind.choice} (${a.kind.confidence.toFixed(2)}), reply p=${a.needsReply.noul.toFixed(2)}, ${a.language.choice}/${a.tone.choice} → ${gate}`);
  if (gate !== "draft-reply") continue;

  // 2. Jev INTO the LLM: the brief is structured facts Jev decided, not the raw message alone.
  let feedback = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    const prompt = `Draft a reply for ${me.name} to the message below. Output only the reply text, nothing else.
Facts decided by a classifier (trust them): kind=${a.kind.choice}, language=${a.language.choice === "zh" ? "Traditional Chinese" : "English"}, tone=${a.tone.choice}.
${me.name}'s situation: ${me.availability}. Style: ${me.style}.
Rules: answer exactly what the sender asked; do not promise money, dates or personal data beyond the situation above.${feedback ? `\nA checker rejected the previous draft: ${feedback}. Fix that.` : ""}

Message from ${item.sender}:
${item.message}`;
    const draft = await llm(prompt);
    console.log(`  llm draft (attempt ${attempt}): ${draft.replace(/\n/g, " ").slice(0, 110)}`);

    // 3. Jev AFTER: verify the draft against the original. Typed verdicts, no prose to parse.
    const v = await jev.systemOne({
      state: { original: item.message, draft, situation: me.availability },
      questions: {
        answers: noul("Does `draft` answer what the sender in `original` actually asked?"),
        overcommits: noul("Does `draft` promise money, a date, an address or personal data that `situation` does not support?"),
        sameLanguage: noul("Is `draft` written in the same language as `original`?"),
        polite: noul("Is `draft` polite and appropriate to send as-is?"),
      },
    });
    const b = v.answers;
    const ok = b.answers.noul > 0.7 && b.overcommits.noul < 0.3 && b.sameLanguage.noul > 0.7 && b.polite.noul > 0.7;
    log({ stage: "jev-after", item, attempt, draft, verdict: ok ? "send" : "retry", checks: { answers: b.answers.noul, overcommits: b.overcommits.noul, sameLanguage: b.sameLanguage.noul, polite: b.polite.noul } });
    console.log(`  jev check: answers=${b.answers.noul.toFixed(2)} overcommits=${b.overcommits.noul.toFixed(2)} sameLanguage=${b.sameLanguage.noul.toFixed(2)} polite=${b.polite.noul.toFixed(2)} → ${ok ? "SEND" : "retry"}`);
    if (ok) break;
    feedback = [b.answers.noul <= 0.7 && "it did not answer the sender's question", b.overcommits.noul >= 0.3 && "it promised something the situation does not support", b.sameLanguage.noul <= 0.7 && "wrong language", b.polite.noul <= 0.7 && "not polite enough"].filter(Boolean).join("; ");
  }
}
console.log(`\nlog: ${LOG}`);
