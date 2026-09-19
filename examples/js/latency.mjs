// Compare question bundling and request concurrency. 3 warmup + 30 comparison + 4 concurrent calls (37 total).
// Uses the same text; no claims about server caching or universal speedups.
import { TypeSafeClient, noul } from '@typesafe-ai/sdk';
import { mkdirSync, writeFileSync } from 'node:fs';
const client = new TypeSafeClient({ defaultModel: process.env.JEV_MODEL });
const state = { message: 'Dinner on Saturday? Let me know by tomorrow if you can come.' };
const questions = {
  reply: noul('Does the message request a reply?'),
  invite: noul('Does the message invite the recipient to an activity?'),
  deadline: noul('Does the message specify a deadline for a response?'),
  ad: noul('Is the message primarily an advertisement?'),
};
const rows = []; let tokens=0; const models=new Set();
async function call(q) { const start=performance.now(); const r=await client.systemOne({state,questions:q}); tokens+=r.usage?.input_tokens||0; models.add(r.model); return Math.round(performance.now()-start); }
await call({reply:questions.reply}); await call(questions); await call({reply:questions.reply});
for(let round=0;round<5;round++) {
 const oneMs=await call({reply:questions.reply});
 const bundledMs=await call(questions);
 const sequentialStart=performance.now();
 for(const [k,q] of Object.entries(questions)) await call({[k]:q});
 rows.push({round:round+1,oneMs,bundledMs,fourSequentialMs:Math.round(performance.now()-sequentialStart)});
}
const parallelStart=performance.now(); const parallel=await Promise.all(Array.from({length:4},()=>call(questions)));
const parallelWallMs=Math.round(performance.now()-parallelStart);
const median=key=>rows.map(r=>r[key]).sort((a,b)=>a-b)[2];
const report={at:new Date().toISOString(),models:[...models],rounds:rows,medians:{oneMs:median('oneMs'),bundledMs:median('bundledMs'),fourSequentialMs:median('fourSequentialMs')},parallel:{requests:4,questionsPerRequest:4,latenciesMs:parallel,wallMs:parallelWallMs},inputTokens:tokens};
mkdirSync('runs',{recursive:true});writeFileSync('runs/latency.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
console.log('Small local sample, no accuracy comparison or latency guarantee. 37 total API calls including warmup.');
