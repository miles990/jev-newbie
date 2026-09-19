import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const cli = process.env.TEST_CLI || resolve('bin/jev.mjs');
const fixture = resolve('tests/fixtures/mock-api.mjs');
function run(args, files = {}, env = {}) {
  const cwd = mkdtempSync(join(tmpdir(), 'jev-test-'));
  try {
    for (const [name, value] of Object.entries(files)) writeFileSync(join(cwd, name), value);
    const r = spawnSync(process.execPath, ['--import', fixture, cli, ...args], { cwd, env: { ...process.env, TYPESAFE_API_KEY: 'test-only', JEV_LOG: join(cwd, 'log.jsonl'), ...env }, encoding: 'utf8', timeout: 5000 });
    return { ...r, report: (() => { try { return readFileSync(join(cwd, 'report.html'), 'utf8'); } catch { return ''; } })() };
  } finally { rmSync(cwd, { recursive: true, force: true }); }
}
const questions = JSON.stringify({ q: { type: 'noul', instructions: 'Keep?' } });
const cases = JSON.stringify({ state: { item: 'keep' }, expect: { q: true } })+'\n';
test('help succeeds and does not expose implementation', () => { const r=run(['--help']); assert.equal(r.status,0); assert.ok(!r.stdout.includes('import {')); });
test('flags can precede positionals', () => { const r=run(['pick','--options','yes,no','Question?','--text','hello']); assert.equal(r.status,0,r.stderr); assert.match(r.stdout,/yes/); });
test('reject invalid thresholds, missing values, mixed inputs and unknown commands', () => {
 for(const args of [['ask','q','--text'],['pick','q','--options','yes,no','--text','x','--min-conf','NaN'],['ask','q','--text','x','--json','{}'],['toString']]) assert.notEqual(run(args).status,0,args.join(' '));
});
test('doctor fails without credentials or with HTTP error', () => { assert.notEqual(run(['doctor'],{}, {TYPESAFE_API_KEY:''}).status,0); assert.notEqual(run(['doctor'],{}, {TEST_MODE:'unauthorized'}).status,0); });
test('strict evaluation catches missing answers and mismatches', () => {
 const files={'q.json':questions,'cases.jsonl':cases};
 assert.equal(run(['check','q.json','cases.jsonl','--strict'],files).status,0);
 assert.notEqual(run(['check','q.json','cases.jsonl','--strict'],files,{TEST_MODE:'missing'}).status,0);
 assert.equal(run(['check','q.json','cases.jsonl','--strict'],{...files,'cases.jsonl':cases.replace('true','false')}).status,1);
});
test('empty evaluation, unknown expected key and string boolean fail before grading', () => {
 for(const data of ['',cases.replace('"q":true','"missing":true'),cases.replace('true','"false"')]) assert.notEqual(run(['check','q.json','cases.jsonl','--strict'],{'q.json':questions,'cases.jsonl':data}).status,0);
});
test('filter only-kept emits clean input, including JSONL objects', () => {
 const r=run(['filter','items.txt','Keep?','--only-kept'],{'items.txt':'keep\ndrop\n'}); assert.equal(r.status,0,r.stderr); assert.equal(r.stdout,'keep\n');
 const j=run(['filter','items.jsonl','Keep?','--only-kept'],{'items.jsonl':'{"item":"keep","id":7}\n{"item":"drop"}\n'}); assert.equal(j.stdout,'{"item":"keep","id":7}\n');
});
test('batch honors concurrency limit', () => { const r=run(['filter','items.txt','Keep?','--concurrency','2'],{'items.txt':Array(9).fill('keep').join('\n')},{TEST_MAX_ACTIVE:'2'}); assert.equal(r.status,0,r.stderr); });
test('timeout and malformed probabilities fail clearly', () => {
 const r=run(['ask','q','--text','x','--timeout','10'],{},{TEST_MODE:'timeout'}); assert.equal(r.status,2); assert.match(r.stderr,/timeout/i);
 assert.equal(run(['ask','q','--text','x'],{},{TEST_MODE:'bad-probability'}).status,2);
});
test('report embeds hostile text as data, not HTML', () => {
 const payload='$& </SCRIPT><script>globalThis.pwned=1</script><!--';
 const r=run(['view','input.jsonl','--no-open'],{'input.jsonl':JSON.stringify({statePreview:payload,answers:{},questions:{}})+'\n'});
 assert.equal(r.status,0,r.stderr); assert.ok(!r.report.includes(payload)); assert.ok(r.report.includes('\\u003c/SCRIPT>')); assert.ok(r.report.includes('$& '));
});
