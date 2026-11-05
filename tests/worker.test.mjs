import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.mjs';
const origin='https://academy.example.test';
function context(email){return {access:{getIdentity:async()=>({email})}};}
function request(path,method='GET',data,headers={}){
 return new Request(`https://api.example.test${path}`,{method,headers:{origin,...headers},body:data});
}
function bindings(){
 const progress=new Map(), artifacts=new Map(), blobs=new Map();
 return {
  PUBLIC_ORIGIN: origin,
  ALLOWED_EMAIL: 'learner@example.test',
  DB: {
   prepare(sql) {
    return {
     bind(...params) {
      return {
       async first() {
        if (sql.includes('FROM progress')) return progress.get(params[0]) || null;
        if (sql.includes('FROM artifacts')) return artifacts.get(params[0]) || null;
        return null;
       },
       async run() {
        if(sql.includes('INTO progress'))progress.set(params[0],{data_json:params[1]});
        if(sql.includes('INTO artifacts'))artifacts.set(params[0],{object_key:params[2],name:params[3],content_type:params[5]});
        return {success:true};
       },
       async all(){return {results:[]};}
      };
     }
    };
   }
  },
  ARTIFACTS: {
   async put(k,data){blobs.set(k,data)},
   async get(k){return blobs.has(k)?{body:blobs.get(k)}:null},
   async delete(k){blobs.delete(k)}
  }
 };
}
test('worker health is public and safe',async()=>{
 const r=await worker.fetch(request('/health'),bindings(),{});assert.equal(r.status,200);assert.equal((await r.json()).status,'ok');
});
test('worker progress is denied without Access',async()=>{
 const env=bindings();const r=await worker.fetch(request('/v1/progress'),env,{});assert.equal(r.status,401);
});
test('worker rejects other Access identities',async()=>{
 const env=bindings();const r=await worker.fetch(request('/v1/progress'),env,context('not-owner@example.test'));assert.equal(r.status,401);
});
test('worker saves and reads D1 progress for owner',async()=>{
 const env=bindings();const payload={tasks:{d1a:true},done:[],bugHunts:{}};
 let r=await worker.fetch(request('/v1/progress','PUT',JSON.stringify(payload),{'content-type':'application/json'}),env,context('learner@example.test'));
 assert.equal(r.status,200);
 r=await worker.fetch(request('/v1/progress'),env,context('learner@example.test'));
 assert.deepEqual((await r.json()).progress,payload);
});
test('worker rejects cross-origin and excessive payloads',async()=>{
 const env=bindings();
 let r=await worker.fetch(new Request('https://api.example.test/v1/progress',{headers:{origin:'https://evil.example.test'}}),env,context('learner@example.test'));
 assert.equal(r.status,403);
 r=await worker.fetch(request('/v1/progress','PUT',JSON.stringify({notes:{1:'x'.repeat(66000)}})),env,context('learner@example.test'));
 assert.equal(r.status,413);
});
test('worker stores private R2 artifact and returns attachment',async()=>{
 const env=bindings(),ctx=context('learner@example.test');
 let r=await worker.fetch(request('/v1/artifacts','POST','My notes',{'content-type':'text/plain','x-artifact-name':'notes.txt'}),env,ctx);
 assert.equal(r.status,201);const {id}=await r.json();
 r=await worker.fetch(request('/v1/artifacts/'+id),env,ctx);
 assert.equal(r.status,200); assert.match(r.headers.get('content-disposition'),/attachment/);
 assert.equal(await r.text(),'My notes');
});
