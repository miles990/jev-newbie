// Evaluate learning resources once; explicitly reuse saved answers when changing weights.
// npm ci; node examples/js/usefulness.mjs
// node examples/js/usefulness.mjs --reuse
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { TypeSafeClient } from '@typesafe-ai/sdk';
const args = process.argv.slice(2);
const reuse = args.includes('--reuse');
const positional = args.filter(a => a !== '--reuse');
const [cand = 'examples/usefulness/candidates.jsonl', qfile = 'examples/usefulness/usefulness.questions.json'] = positional;
if (positional.length > 2 || positional.some(a => a.startsWith('--'))) throw new Error('usage: node examples/js/usefulness.mjs [candidates.jsonl] [questions.json] [--reuse]');
const questions = JSON.parse(readFileSync(qfile, 'utf8')).questions;
const items = readFileSync(cand, 'utf8').split('\n').filter(l => l.trim()).map(l => JSON.parse(l));
const fingerprint = createHash('sha256').update(JSON.stringify({ items, questions })).digest('hex');
const path = 'runs/usefulness-results.json';
let saved;
if (reuse) {
  saved = JSON.parse(readFileSync(path, 'utf8'));
  if (saved.fingerprint !== fingerprint) throw new Error('Inputs or questions changed. Run without --reuse to evaluate again.');
  if (process.env.JEV_MODEL && saved.requestedModel !== process.env.JEV_MODEL) throw new Error('JEV_MODEL changed. Run without --reuse.');
  console.error(`Reusing answers from ${saved.at}; no API calls. Models: ${[...new Set(saved.results.map(r => r.model))].join(', ')}`);
} else {
  const client = new TypeSafeClient({ defaultModel: process.env.JEV_MODEL });
  const results = [];
  for (const state of items) {
    const r = await client.systemOne({ state, questions });
    results.push({ item: state.item, model: r.model, answers: r.answers });
  }
  saved = { fingerprint, requestedModel: process.env.JEV_MODEL || null, at: new Date().toISOString(), questions, results };
  mkdirSync('runs', { recursive: true });
  writeFileSync(path, JSON.stringify(saved, null, 2));
  console.error(`Saved answers: ${path}. Use --reuse to change weights without new calls.`);
}
// Relative weights; the sum is normalized so editing one weight keeps scores in 0..1.
const W = { relevance: 0.4, actionable: 0.3, beginner: 0.2, notPitch: 0.1 };
const weightSum = Object.values(W).reduce((a, b) => a + b, 0);
if (Object.values(W).some(w => !Number.isFinite(w) || w < 0) || weightSum <= 0) throw new Error('Weights must be finite, nonnegative, and have a positive total');
const results = saved.results.map(({ item, answers: a }) => {
  const dims = { relevance: a.relevance.score / 3, actionable: a.actionable.noul, beginner: a.beginner.noul, notPitch: 1 - a.sales_pitch.noul };
  const useful = Object.entries(W).reduce((s, [k, w]) => s + w * dims[k], 0) / weightSum;
  return { item, useful, dims };
}).sort((a, b) => b.useful - a.useful);
for (const r of results) {
  console.log(`${r.useful.toFixed(2)}  ${r.item}`);
  console.log('      ' + Object.entries(r.dims).map(([k, v]) => `${k}=${v.toFixed(2)}`).join('  '));
}
console.log('Ranking score, not a probability of usefulness or a fact check.');
