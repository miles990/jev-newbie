// 延遲基準：循序 vs 平行、1 題 vs 12 題、快取命中。Latency benchmark: sequential vs parallel, 1 vs 12 questions, cache hit.
// Run: node examples/js/latency.mjs   (about 60 uncached calls, a few cents)
import { TypeSafeClient, noul, choice } from "@typesafe-ai/sdk";
const jev = new TypeSafeClient({ defaultModel: process.env.JEV_MODEL });
const msg = (i) => ({ message: `Reminder ${i}: your appointment is tomorrow at 10:30, reply Y to confirm.`, nonce: Date.now() + i });
const one = { needsReply: noul("Does the sender expect me to reply?") };
const twelve = Object.fromEntries(["needsReply","isScam","isAd","hasDeadline","asksMoney","asksClick","fromKnown","polite","urgentToday","mentionsPlace","isQuestion","isInvite"].map((k) => [k, noul(`Judge property ${k} of the message.`)]));
twelve.kind = choice("What kind of message is this?", { bill: null, scam: null, invite: null, appointment: null, ad: null, personal: null, other: null });
const stats = (ms) => { const s = [...ms].sort((a, b) => a - b); return `min ${s[0]} · p50 ${s[Math.floor(s.length / 2)]} · p90 ${s[Math.floor(s.length * 0.9)]} · max ${s.at(-1)} ms`; };
async function timed(state, q) { const t = performance.now(); await jev.systemOne({ state, questions: q }); return Math.round(performance.now() - t); }

let ms = []; for (let i = 0; i < 15; i++) ms.push(await timed(msg(i), one));
console.log(`15 sequential calls, 1 question:      ${stats(ms)}`);
ms = []; for (let i = 0; i < 15; i++) ms.push(await timed(msg(100 + i), twelve));
console.log(`15 sequential calls, 13 questions:    ${stats(ms)}`);
const t0 = performance.now(); ms = await Promise.all(Array.from({ length: 20 }, (_, i) => timed(msg(200 + i), twelve)));
console.log(`20 parallel calls, 13 questions:      ${stats(ms)}   wall clock for all 20: ${Math.round(performance.now() - t0)} ms`);
const fixed = { message: "same input twice", nonce: 1 }; const a = await timed(fixed, one), b = await timed(fixed, one);
console.log(`same request twice (no client cache): ${a} ms then ${b} ms  → cache by request hash in your code to make the second one 0 ms`);
