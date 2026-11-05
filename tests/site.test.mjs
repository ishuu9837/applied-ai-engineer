import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {roadmap, releaseDateFor, currentISTDate, isAvailable} from '../src/roadmap.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const batch=JSON.parse(fs.readFileSync(path.join(root,'content/queue/2026-11-06.json'),'utf8'));
test('20 consecutive curriculum days with correct five-day release dates',()=>{
 assert.equal(roadmap.length,20);
 assert.deepEqual(roadmap.map(x=>x.day),Array.from({length:20},(_,i)=>i+1));
 assert.equal(releaseDateFor(1),'2026-11-06');
 assert.equal(releaseDateFor(5),'2026-11-06');
 assert.equal(releaseDateFor(6),'2026-11-07');
 assert.equal(releaseDateFor(20),'2026-11-09');
});
test('November 6 releases five lessons only if published',()=>{
 assert.equal(isAvailable(1,[1,2,3,4,5],'2026-11-05'),false);
 assert.equal(isAvailable(1,[],'2026-11-06'),false);
 assert.equal(isAvailable(5,[1,2,3,4,5],'2026-11-06'),true);
 assert.equal(isAvailable(6,[1,2,3,4,5],'2026-11-07'),false);
});
test('India time zone formats deterministically',()=>{
 assert.equal(currentISTDate(new Date('2026-11-05T18:30:00Z')),'2026-11-06');
});
test('first prepared batch contains five complete days',()=>{
 assert.equal(batch.releaseDateIST,'2026-11-06');
 assert.equal(batch.days.length,5);
 for(const [i,d] of batch.days.entries()){
  assert.equal(d.day,i+1);
  assert.equal(d.quiz.length,5);
  assert.equal(d.interview.length,3);
  assert.equal(d.agenda.length,5);
  assert.ok(d.tasks.length>=3);
  for(const item of d.tasks){assert.equal(item.hints.length,3); if(item.reference){assert.ok(item.reference.expected);assert.ok(item.reference.run);}}
 }
});
test('public build never exposes queued unpublished content',()=>{
 execFileSync(process.execPath,['scripts/build.mjs'],{cwd:root,stdio:'pipe'});
 assert.equal(fs.existsSync(path.join(root,'dist/content/queue')),false);
 assert.equal(fs.existsSync(path.join(root,'dist/content/live/catalog.json')),true);
 assert.equal(fs.existsSync(path.join(root,'dist/.nojekyll')),true);
});
