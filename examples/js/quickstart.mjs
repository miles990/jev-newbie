// 第一支 JavaScript 程式：三種問題、一次呼叫、程式碼決定。
// Run: node examples/js/quickstart.mjs
import { choice, noul, score, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient({ defaultModel: process.env.JEV_MODEL }); // reads TYPESAFE_API_KEY
const r = await client.systemOne({
  state: { message: "付款失敗三天了，今天一定要處理，不然我要退款。" },
  questions: {
    urgent: noul("Does the message convey time pressure?"),
    intent: choice("What is the writer's main request?", {
      refund: "wants money returned",
      fix: "wants a failure fixed",
      information: "asks a question only",
      other: "none of the above clearly fits",
    }),
    frustration: score("How frustrated is the writer?", ["calm", "annoyed but civil", "very angry"]),
  },
});

const { intent, urgent, frustration } = r.answers;
console.log("intent     ", intent.choice, `(confidence ${intent.confidence.toFixed(2)})`, intent.probabilities);
console.log("urgent     ", urgent.noul.toFixed(2));
console.log("frustration", frustration.score.toFixed(2));

const action =
  intent.confidence < 0.5 ? "ask a human" :
  intent.choice === "refund" && urgent.noul > 0.7 ? "billing, priority" :
  `route to ${intent.choice}`;
console.log("action     ", action);
