import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {currentISTDate} from '../src/roadmap.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const queue=path.join(root,'content/queue');
const live=path.join(root,'content/live');
const start='2026-11-06';
const end='2026-11-25';
const allowed=Array.from({length:4},(_,i)=>`2026-11-${String(i+6).padStart(2,'0')}`);
const dateArg=process.argv.find(a=>a.startsWith('--date='));
const today=dateArg?dateArg.slice(7):currentISTDate();
if(!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error(`Invalid date: ${today}`);
const catalogPath=path.join(live,'catalog.json');
const catalog=JSON.parse(fs.readFileSync(catalogPath,'utf8'));
const storedDays=new Set(catalog.releasedDays);
if(today<start){console.log(`Not started (${today}). No change.`);process.exit(0);}
for(let i=0;i<allowed.length;i++){
  const publishOn=allowed[i];if(publishOn>today)break;
  const expected=Array.from({length:5},(_,j)=>i*5+j+1);
  const pending=expected.filter(day=>!storedDays.has(day));
  if(!pending.length)continue;
  const source=path.join(queue,`${publishOn}.json`);
  if(!fs.existsSync(source))throw new Error(`Missing prepared batch: ${source}. No unreviewed content will be generated or published.`);
  const batch=JSON.parse(fs.readFileSync(source,'utf8'));
  if(batch.schemaVersion!==1||batch.releaseDateIST!==publishOn||!Array.isArray(batch.days)||batch.days.length!==5||batch.days.some((x,j)=>x.day!==expected[j]||!Array.isArray(x.quiz)||x.quiz.length!==5||!Array.isArray(x.tasks)))throw new Error(`Invalid batch ${publishOn}: expected exactly five validated lesson objects for Days ${expected[0]}–${expected[4]}`);
  for(const lesson of batch.days){
    const filename=`day-${String(lesson.day).padStart(2,'0')}.json`;
    fs.writeFileSync(path.join(live,filename),JSON.stringify(lesson,null,2)+'\n');
    storedDays.add(lesson.day);
  }
  catalog.lastReleaseDate=publishOn;
  console.log(`Published Days ${expected[0]}–${expected[4]} from prepared material.`);
}
catalog.releasedDays=[...storedDays].sort((a,b)=>a-b);
if(today<=end){
 const courseDay=Math.max(0,Math.min(20,Math.floor((Date.parse(today+'T00:00:00Z')-Date.parse(start+'T00:00:00Z'))/86400000)+1));
 const status={dateIST:today,courseDay,note:'Daily schedule marker; lesson publishing requires a prepared reviewed batch.'};
 fs.writeFileSync(path.join(live,'day-status.json'),JSON.stringify(status,null,2)+'\n');
}
if(catalog.lastReleaseDate){catalog.updatedAtIST=today;}
fs.writeFileSync(catalogPath,JSON.stringify(catalog,null,2)+'\n');
console.log(`Release status: ${catalog.releasedDays.length}/20 days published on ${today}.`);
