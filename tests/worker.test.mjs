import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker from '../worker/index.mjs';
const origin='https://academy.example.test';
function env(){
 const sql=new DatabaseSync(':memory:');
 sql.exec(readFileSync(new URL('../worker/migrations/0001_init.sql',import.meta.url),'utf8'));
 sql.exec(readFileSync(new URL('../worker/migrations/0002_auth.sql',import.meta.url),'utf8'));
 const blobs=new Map();
 return {DB:{prepare(q){return {bind(...args){const stmt=sql.prepare(q);return {first:async()=>stmt.get(...args)||null,run:async()=>stmt.run(...args),all:async()=>({results:stmt.all(...args)})};}}}},ARTIFACTS:{put:async(k,v)=>blobs.set(k,v),get:async(k)=>blobs.has(k)?{body:blobs.get(k)}:null,delete:async(k)=>blobs.delete(k)},close:()=>sql.close()};
}
function req(route,method='GET',payload,extra={}){
 return new Request(origin+route,{method,headers:{...(method!=='GET'?{origin}:{}),...(typeof payload==='string'?{'content-type':'application/json'}:{}),...extra},body:payload});
}
const account={name:'Learner Tester',email:'learner@example.test',password:'uniquePassword#314159'};
const signup=(e,data=account)=>worker.fetch(req('/api/auth/signup','POST',JSON.stringify(data)),e);
const cookie=r=>r.headers.get('set-cookie')?.split(';')[0]||'';
test('health exposes binding state and login fails closed without DB',async()=>{
 assert.equal((await worker.fetch(req('/api/health'),{})).status,200);
 assert.equal((await worker.fetch(req('/api/auth/me'),{})).status,503);
});
test('signup and secure cookie login/session/logout',async()=>{
 const e=env();try{
  const r=await signup(e);assert.equal(r.status,200);
  const c=cookie(r);assert.match(c,/__Host-academy_session=[a-f0-9]{64}/);
  assert.match(r.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=Lax/);
  assert.equal((await worker.fetch(req('/api/auth/me','GET',undefined,{cookie:c}),e)).status,200);
  assert.equal((await signup(e)).status,409);
  const bad=await worker.fetch(req('/api/auth/login','POST',JSON.stringify({email:account.email,password:'bad'})),e);assert.equal(bad.status,401);
  assert.equal((await worker.fetch(req('/api/auth/login','POST',JSON.stringify({email:account.email,password:account.password})),e)).status,200);
  assert.equal((await worker.fetch(req('/api/auth/logout','POST',undefined,{cookie:c}),e)).status,200);
  assert.equal((await worker.fetch(req('/api/auth/me','GET',undefined,{cookie:c}),e)).status,401);
 }finally{e.close();}
});
test('CSRF blocks foreign Origin and missing Origin on unsafe methods',async()=>{
 const e=env();try{
  const c=cookie(await signup(e));
  const r=await worker.fetch(new Request(origin+'/api/v1/progress',{method:'PUT',headers:{origin:'https://attacker.test',cookie:c},body:'{}'}),e);
  assert.equal(r.status,403);
 }finally{e.close();}
});
test('per-user D1 isolation and private R2 artifact access',async()=>{
 const e=env();try{
  const first=cookie(await signup(e)),second=cookie(await signup(e,{...account,email:'learner2@example.test'}));
  const payload={done:[1],notes:{1:'notes'}};
  assert.equal((await worker.fetch(req('/api/v1/progress','PUT',JSON.stringify(payload),{cookie:first}),e)).status,200);
  assert.deepEqual((await (await worker.fetch(req('/api/v1/progress','GET',undefined,{cookie:first}),e)).json()).progress,payload);
  assert.equal((await (await worker.fetch(req('/api/v1/progress','GET',undefined,{cookie:second}),e)).json()).progress,null);
  const uploaded=await worker.fetch(req('/api/v1/artifacts','POST','my notes',{cookie:first,'content-type':'text/plain','x-artifact-name':'note.txt'}),e);
  assert.equal(uploaded.status,201);const {id}=await uploaded.json();
  assert.equal((await worker.fetch(req('/api/v1/artifacts/'+id,'GET',undefined,{cookie:second}),e)).status,404);
 }finally{e.close();}
});
