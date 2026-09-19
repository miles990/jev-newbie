// 第一支 JavaScript 程式：一則收件匣訊息、三種問題、一次呼叫、程式碼決定該怎麼處理。
// Your first JavaScript program: one inbox message, three questions, one call, code decides what to do.
// Run: node examples/js/quickstart.mjs
import { choice, noul, score, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient({ defaultModel: process.env.JEV_MODEL }); // reads TYPESAFE_API_KEY
const r = await client.systemOne({
  state: {
    message: "您的包裹因地址不完整無法投遞，請點擊連結補填資料：http://parcel-redelivery.co/x9",
    sender: "unknown number, not in my contacts",
    my_recent_orders: "none in the last month",
  },
  questions: {
    kind: choice("What kind of message is this?", {
      bill: "a payment I genuinely owe",
      scam: "phishing or fraud: asks me to click, log in or pay through an odd channel",
      appointment: "a real delivery, booking or appointment notice",
      personal: "someone I know wants a conversation",
      other: "none of the above clearly fits",
    }),
    needsReply: noul("Does the sender expect me to reply?"),
    urgency: score("How soon does this need my attention?", ["can wait a week", "within a few days", "today"]),
  },
});

const { kind, needsReply, urgency } = r.answers;
console.log("kind       ", kind.choice, `(confidence ${kind.confidence.toFixed(2)})`, Object.fromEntries(Object.entries(kind.probabilities).sort()));
console.log("needsReply ", needsReply.noul.toFixed(2));
console.log("urgency    ", urgency.score.toFixed(2));

const action =
  kind.confidence < 0.5 ? "show it to me" :
  kind.choice === "scam" ? "move to junk and block the sender" :
  kind.choice === "bill" && urgency.score > 1.5 ? "pay today" :
  needsReply.noul > 0.7 ? "remind me to reply tonight" :
  "file under read-later";
console.log("action     ", action);
