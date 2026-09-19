import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const comparator=resolve('scripts/compare-output.py');
function compare(a,b){const dir=mkdtempSync(join(tmpdir(),'jev-compare-'));try{writeFileSync(join(dir,'a'),a);writeFileSync(join(dir,'b'),b);return spawnSync('python3',[comparator,join(dir,'a'),join(dir,'b')],{encoding:'utf8'});}finally{rmSync(dir,{recursive:true,force:true});}}
test('numeric columns cannot silently exchange values',()=>assert.equal(compare('a 0.1 0.9\n','a 0.9 0.1\n').status,1));
test('row ordering and log filenames are incidental',()=>assert.equal(compare('a 0.9\nb 0.2\nLog: runs/old.jsonl\n','b 0.21\na 0.91\nLog: runs/new.jsonl\n').status,0));
test('changed decisions remain a failure despite close probabilities',()=>assert.equal(compare('yes 51%\n','no 49%\n').status,1));

test('multiline values stay attached to the original item',()=>{
 const a='today urgency=2.0\n  ← message A\n  reply=0.1 risk=0.9\ntoday urgency=1.8\n  ← message B\n  reply=0.2 risk=0.1\n';
 const b='today urgency=1.8\n  ← message B\n  reply=0.2 risk=0.1\ntoday urgency=2.0\n  ← message A\n  reply=0.12 risk=0.9\n';
 assert.equal(compare(a,b).status,0);
 assert.equal(compare(a,b.replace('reply=0.12 risk=0.9','reply=0.2 risk=0.1').replace('reply=0.2 risk=0.1\ntoday','reply=0.1 risk=0.9\ntoday')).status,1);
});
