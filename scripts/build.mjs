import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const preview=process.argv.includes('--preview');
fs.rmSync(dist,{recursive:true,force:true});
fs.mkdirSync(dist,{recursive:true});
for(const item of ['index.html','assets','src','content/live','public-config.json']){
 const source=path.join(root,item),destination=path.join(dist,item);
 fs.cpSync(source,destination,{recursive:true});
}
fs.writeFileSync(path.join(dist,'.nojekyll'),'');
if(preview){
 const source=path.join(root,'content/queue/2026-11-06.json');
 const batch=JSON.parse(fs.readFileSync(source,'utf8'));
 const p=path.join(dist,'content/live','public-config.json');
 for(const lesson of batch.days){fs.writeFileSync(path.join(p,`day-${String(lesson.day).padStart(2,'0')}.json`),JSON.stringify(lesson,null,2));}
 const catalog={schemaVersion:1,updatedAtIST:'2026-11-06',releasedDays:[1,2,3],lastReleaseDate:'2026-11-06'};
 fs.writeFileSync(path.join(p,'catalog.json'),JSON.stringify(catalog,null,2));
 console.log('PREVIEW ONLY: injecting prepared 3-day batch into dist; not for publication.');
}
console.log(`Static site built at ${dist}. No unpublished queue files copied.`);
