#!/usr/bin/env node
// jev — 傻瓜也能用的 TypeSafe Jev 命令列工具。單一檔案、零依賴、每次呼叫都留下可檢視的紀錄。
// A single-file, dependency-free CLI for TypeSafe Jev. Every call is appended to a JSONL log; `jev view` renders it.
//
//   jev ask   "question?"              [--text "..."|--file f|stdin]   yes/no probability (noul)        是／否機率
//   jev pick  "question?" --options a,b,c [--text|--file|stdin]        one of N + confidence (choice)   單選＋信心
//   jev rate  "question?" --levels l1,l2,l3 [--text|--file|stdin]      degree on levels (score)         程度
//   jev filter <items> "yes/no?"       [--min 0.5]                     keep lines with p ≥ min          逐行篩選
//   jev classify <items> "question?" --options a,b,c [--min-conf 0.5] label each line, low conf=unsure 逐行分類
//   jev run <questions.json> <items>   [--label name]                  ask a whole set at once          投機式廣撒
//   jev check <questions.json> <cases.jsonl> [--min-conf 0.5] [--strict] golden set: accuracy + confidence 黃金測試集
//   jev view [log.jsonl] [--no-open]                                   render the log as HTML           產生報告
//   jev doctor                                                         key, connectivity, latency       環境檢查
//   jev models                                                         list models your key can use     列出模型
//
// Common flags 共用參數: --model jev-1.13.0|jev-latest|jev-preview   --json '{"a":1}' (JSON state instead of text)
//   --options "a:desc,b:desc"  option descriptions (choice)   --yes "..." --no "..."  criteria for noul
//   --label name  tag the log rows   --min-conf 0.5   --min 0.5   --strict
// <items>: a text file, one item per line; a .jsonl file uses each line's object as the state.
// <items>：每行一個項目的文字檔；.jsonl 時每行的物件整個當 state。
// Env: TYPESAFE_API_KEY (required), JEV_MODEL (default jev-latest), JEV_LOG (default runs/jev-log.jsonl).
import { readFileSync, appendFileSync, mkdirSync, existsSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://api.typesafe.ai/v1/systemone";
const MODEL_ENV = process.env.JEV_MODEL || "jev-latest";
const LOG = process.env.JEV_LOG || "runs/jev-log.jsonl";
const KEY = process.env.TYPESAFE_API_KEY;
const argv = process.argv.slice(2);
const cmd = argv.shift();
const MODEL = (() => { const i = argv.indexOf("--model"); if (i < 0) return MODEL_ENV; const v = argv[i + 1]; argv.splice(i, 2); return v; })();

const die = (m) => { console.error("jev: " + m); process.exit(2); };
const flag = (name, def) => { const i = argv.indexOf("--" + name); if (i < 0) return def; const v = argv[i + 1]; argv.splice(i, 2); return v ?? true; };
const positional = () => argv.filter((a) => !a.startsWith("--"));
const csv = (s) => (s ? String(s).split(",").map((x) => x.trim()).filter(Boolean) : []);
// "a:desc,b:desc" or "a,b" → criteria map {a: "desc"|null}
const optionMap = (s) => Object.fromEntries(csv(s).map((o) => { const i = o.indexOf(":"); return i < 0 ? [o, null] : [o.slice(0, i).trim(), o.slice(i + 1).trim()]; }));
const noulCriteria = () => { const yes = flag("yes"); const no = flag("no"); return yes || no ? { criteria: { ...(yes ? { true: yes } : {}), ...(no ? { false: no } : {}) } } : {}; };
const readText = (file) => (file === "-" || !file ? readFileSync(0, "utf8") : readFileSync(file, "utf8"));

function stateFromArgs() {
  const text = flag("text"); const file = flag("file"); const json = flag("json");
  if (json) { try { return JSON.parse(json); } catch (e) { die("--json is not valid JSON: " + e.message); } }
  if (text) return { text };
  if (file) return { text: readText(file).trim() };
  if (!process.stdin.isTTY) return { text: readFileSync(0, "utf8").trim() };
  die("give the thing to judge with --text \"...\", --file path, or pipe it on stdin");
}
function itemsFrom(path) {
  const raw = readText(path);
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (path.endsWith(".jsonl")) return lines.map((l, i) => ({ id: String(i + 1), state: JSON.parse(l) }));
  return lines.map((l, i) => ({ id: String(i + 1), state: { item: l.trim() } }));
}

async function systemOne(state, questions) {
  if (!KEY) die("TYPESAFE_API_KEY is not set. Get a key at https://console.typesafe.ai and `export TYPESAFE_API_KEY=...`");
  const body = JSON.stringify({ model: MODEL, state, questions });
  const t0 = performance.now();
  for (let attempt = 0; attempt < 5; attempt++) {
    const r = await fetch(API, { method: "POST", headers: { Authorization: "Bearer " + KEY, "Content-Type": "application/json" }, body });
    if (r.status === 429 || r.status === 529) { await new Promise((x) => setTimeout(x, 800 * (attempt + 1))); continue; }
    const text = await r.text();
    if (!r.ok) die(`API ${r.status}: ${text.slice(0, 300)}`);
    const j = JSON.parse(text);
    j.latencyMs = Math.round(performance.now() - t0);
    return j;
  }
  die("rate limited after 5 attempts");
}
function log(record) {
  try { mkdirSync(dirname(LOG), { recursive: true }); appendFileSync(LOG, JSON.stringify(record) + "\n"); } catch (e) { console.error("jev: could not write log: " + e.message); }
}
function compact(answers) {
  return Object.fromEntries(Object.entries(answers).map(([k, a]) => [k, a.type === "noul" ? { type: "noul", p: a.noul } : { type: a.type, value: a[a.type], confidence: a.confidence, probabilities: a.probabilities }]));
}
async function judge(state, questions, decide, meta) {
  const r = await systemOne(state, questions);
  const answers = compact(r.answers);
  const decision = decide ? decide(r.answers) : null;
  log({ at: new Date().toISOString(), cmd: meta.cmd, label: meta.label || "", id: meta.id || "", model: r.model, stateHash: createHash("sha256").update(JSON.stringify(state)).digest("hex").slice(0, 12), statePreview: JSON.stringify(state).slice(0, 160), questions: Object.fromEntries(Object.entries(questions).map(([k, q]) => [k, { type: q.type, instructions: q.instructions, criteria: q.criteria ?? null }])), answers, decision, latencyMs: r.latencyMs, inputTokens: r.usage?.input_tokens ?? null });
  return { answers: r.answers, decision, latencyMs: r.latencyMs };
}
const pct = (x) => (x * 100).toFixed(0).padStart(3) + "%";
const bar = (x, w = 20) => "█".repeat(Math.round(x * w)).padEnd(w, "·");

const commands = {
  async ask() {
    const [q] = positional(); if (!q) die('usage: jev ask "yes/no question?" --text "..."');
    const label = flag("label", ""); const crit = noulCriteria(); const state = stateFromArgs();
    const { answers } = await judge(state, { q: { type: "noul", instructions: q, ...crit } }, (a) => (a.q.noul > 0.65 ? "yes" : a.q.noul < 0.35 ? "no" : "unsure"), { cmd: "ask", label });
    const p = answers.q.noul; console.log(`${bar(p)} ${pct(p)}  ${p > 0.65 ? "yes" : p < 0.35 ? "no" : "unsure (0.35–0.65)"}`);
  },
  async pick() {
    const [q] = positional(); const criteria = optionMap(flag("options")); if (!q || Object.keys(criteria).length < 2) die('usage: jev pick "question?" --options "a:desc,b:desc,other" --text "..."');
    const minConf = Number(flag("min-conf", 0.5)); const label = flag("label", ""); const state = stateFromArgs();
    const { answers } = await judge(state, { q: { type: "choice", instructions: q, criteria } }, (a) => (a.q.confidence < minConf ? "unsure" : a.q.choice), { cmd: "pick", label });
    const a = answers.q; for (const [k, v] of Object.entries(a.probabilities).sort((x, y) => y[1] - x[1])) console.log(`${bar(v)} ${pct(v)}  ${k}${k === a.choice ? "  ←" : ""}`);
    console.log(`confidence ${a.confidence.toFixed(2)}${a.confidence < minConf ? "  → unsure: below --min-conf " + minConf : ""}`);
  },
  async rate() {
    const [q] = positional(); const levels = csv(flag("levels")); if (!q || levels.length < 2) die('usage: jev rate "question?" --levels low,mid,high --text "..."');
    const label = flag("label", ""); const state = stateFromArgs();
    const { answers } = await judge(state, { q: { type: "score", instructions: q, criteria: levels } }, (a) => levels[Math.round(a.q.score)], { cmd: "rate", label });
    const a = answers.q; levels.forEach((l, i) => console.log(`${bar(a.probabilities[String(i)] ?? 0)} ${pct(a.probabilities[String(i)] ?? 0)}  ${i} ${l}`));
    console.log(`score ${a.score.toFixed(2)} of ${levels.length - 1}  → ${levels[Math.round(a.score)]}  confidence ${a.confidence.toFixed(2)}`);
  },
  async filter() {
    const [path, q] = positional(); if (!path || !q) die('usage: jev filter items.txt "yes/no question?" [--min 0.5] [--yes "..." --no "..."]');
    const min = Number(flag("min", 0.5)); const label = flag("label", "filter"); const crit = noulCriteria(); const items = itemsFrom(path); let kept = 0;
    await Promise.all(items.map(async (it) => { const { answers } = await judge(it.state, { q: { type: "noul", instructions: q, ...crit } }, (a) => (a.q.noul >= min ? "keep" : "drop"), { cmd: "filter", label, id: it.id }); it.p = answers.q.noul; }));
    for (const it of items.sort((a, b) => b.p - a.p)) { const keep = it.p >= min; kept += keep; console.log(`${keep ? "✓" : " "} ${pct(it.p)}  ${it.state.item ?? JSON.stringify(it.state).slice(0, 100)}`); }
    console.error(`\n${kept}/${items.length} kept at p ≥ ${min}. Log: ${LOG}`);
  },
  async classify() {
    const [path, q] = positional(); const criteria = optionMap(flag("options")); if (!path || !q || Object.keys(criteria).length < 2) die('usage: jev classify items.txt "question?" --options "a:desc,b:desc,other" [--min-conf 0.5]');
    const minConf = Number(flag("min-conf", 0.5)); const label = flag("label", "classify"); const items = itemsFrom(path); const counts = {};
    await Promise.all(items.map(async (it) => { const { answers } = await judge(it.state, { q: { type: "choice", instructions: q, criteria } }, (a) => (a.q.confidence < minConf ? "unsure" : a.q.choice), { cmd: "classify", label, id: it.id }); it.a = answers.q; }));
    for (const it of items) { const lab = it.a.confidence < minConf ? "unsure" : it.a.choice; counts[lab] = (counts[lab] || 0) + 1; console.log(`${lab.padEnd(12)} ${it.a.confidence.toFixed(2)}  ${it.state.item ?? JSON.stringify(it.state).slice(0, 100)}`); }
    console.error("\n" + Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join("  ") + `\nLog: ${LOG}`);
  },
  async run() {
    const [qfile, path] = positional(); if (!qfile || !path) die("usage: jev run questions.json items.txt [--label name]");
    const spec = JSON.parse(readFileSync(qfile, "utf8")); const questions = spec.questions ?? spec; const label = flag("label", qfile.replace(/.*\//, "").replace(/\.json$/, ""));
    const items = itemsFrom(path); const keys = Object.keys(questions);
    await Promise.all(items.map(async (it) => { const { answers } = await judge(it.state, questions, null, { cmd: "run", label, id: it.id }); it.a = answers; }));
    console.log("item".padEnd(40) + keys.map((k) => k.slice(0, 10).padStart(11)).join(""));
    for (const it of items) console.log(String(it.state.item ?? JSON.stringify(it.state)).slice(0, 38).padEnd(40) + keys.map((k) => { const a = it.a[k]; return (a.type === "noul" ? a.noul.toFixed(2) : a.type === "choice" ? a.choice.slice(0, 10) : a.score.toFixed(2)).padStart(11); }).join(""));
    console.error(`\n${items.length} items × ${keys.length} questions. Log: ${LOG}  →  jev view`);
  },
  async check() {
    const [qfile, cfile] = positional(); if (!qfile || !cfile) die("usage: jev check questions.json cases.jsonl   (each case: {\"state\":..., \"expect\": {\"q\": \"label\" | true | false | 2}})");
    const spec = JSON.parse(readFileSync(qfile, "utf8")); const questions = spec.questions ?? spec; const minConf = Number(flag("min-conf", 0.5)); const label = flag("label", "check");
    const cases = readText(cfile).split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));
    const tally = {}; const lowConf = [];
    await Promise.all(cases.map(async (c, i) => { const { answers } = await judge(c.state, questions, null, { cmd: "check", label, id: String(i + 1) }); c.answers = answers; }));
    for (const [i, c] of cases.entries()) for (const [k, want] of Object.entries(c.expect ?? {})) {
      const a = c.answers[k]; if (!a) continue; tally[k] ??= { hit: 0, n: 0, miss: [] }; tally[k].n++;
      let got, hit; if (a.type === "noul") { got = a.noul > 0.5; hit = got === Boolean(want); } else if (a.type === "choice") { got = a.choice; hit = got === String(want); if (a.confidence < minConf) lowConf.push(`#${i + 1} ${k} conf=${a.confidence.toFixed(2)}`); } else { got = Math.round(a.score); hit = got === Number(want); }
      if (hit) tally[k].hit++; else tally[k].miss.push(`#${i + 1} want=${want} got=${a.type === "noul" ? a.noul.toFixed(2) : got}${a.confidence != null ? " conf=" + a.confidence.toFixed(2) : ""}  ${JSON.stringify(c.state).slice(0, 70)}`);
    }
    for (const [k, t] of Object.entries(tally)) { console.log(`${k.padEnd(16)} ${t.hit}/${t.n} (${pct(t.hit / t.n)})`); for (const m of t.miss) console.log("   ✗ " + m); }
    if (lowConf.length) console.log(`\nlow confidence (< ${minConf}): ${lowConf.length}\n   ` + lowConf.join("\n   "));
    const total = Object.values(tally).reduce((s, t) => s + t.n, 0), hits = Object.values(tally).reduce((s, t) => s + t.hit, 0);
    console.error(`\n${hits}/${total} expectations met across ${cases.length} cases. Log: ${LOG}`); if (hits < total && flag("strict")) process.exit(1);
  },
  async models() {
    if (!KEY) die("TYPESAFE_API_KEY is not set");
    const r = await fetch("https://api.typesafe.ai/v1/models", { headers: { Authorization: "Bearer " + KEY } }); if (!r.ok) die("API " + r.status);
    for (const m of (await r.json()).models) console.log(`${m.name.padEnd(14)} ${String(m.release_date).slice(0, 10)}  ${m.description}`);
    console.log("\nVersioned ids such as jev-1.13.0 are accepted too. Current default: " + MODEL);
  },
  async doctor() {
    console.log("TYPESAFE_API_KEY  " + (KEY ? "set (" + KEY.length + " chars)" : "MISSING — export TYPESAFE_API_KEY=..."));
    if (!KEY) return;
    const t0 = performance.now(); const r = await fetch("https://api.typesafe.ai/v1/models", { headers: { Authorization: "Bearer " + KEY } });
    console.log(`models endpoint   ${r.status} in ${Math.round(performance.now() - t0)} ms`); if (!r.ok) return;
    const j = await systemOne({ text: "ping" }, { ok: { type: "noul", instructions: "Is this the word ping?" } });
    console.log(`systemone         ${j.model} in ${j.latencyMs} ms, p=${j.answers.ok.noul.toFixed(2)}  ✓`);
    console.log(`log file          ${resolve(LOG)} ${existsSync(LOG) ? "(" + readFileSync(LOG, "utf8").split("\n").filter(Boolean).length + " records)" : "(none yet)"}`);
  },
  async view() {
    const [logPath = LOG] = positional(); if (!existsSync(logPath)) die(`no log at ${logPath}. Run a command first.`);
    const records = readFileSync(logPath, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
    const tpl = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "view.html"), "utf8");
    const out = resolve(dirname(logPath), "report.html");
    writeFileSync(out, tpl.replace("__RECORDS__", JSON.stringify(records).replace(/<\/script/g, "<\\/script")));
    console.log(`${records.length} records → ${out}`);
    if (!flag("no-open")) { const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open"; spawn(opener, [out], { stdio: "ignore", detached: true }).unref(); }
  },
};
if (!cmd || cmd === "--help" || cmd === "-h" || !commands[cmd]) { console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 22).map((l) => l.replace(/^\/\/ ?/, "")).join("\n")); process.exit(cmd && !commands[cmd] ? 2 : 0); }
await commands[cmd]();
