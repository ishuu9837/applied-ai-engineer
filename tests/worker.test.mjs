import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.mjs';

const origin='https://academy.example.test';
const env={ASSETS:{fetch:async request=>new Response('public learning site',{status:200})}};

test('public learning site works without D1, R2, or a login',async()=>{
 const response=await worker.fetch(new Request(origin+'/'),env);
 assert.equal(response.status,200);
 assert.equal(await response.text(),'public learning site');
});

test('all legacy authentication, progress, and artifact APIs are disabled',async()=>{
 for(const path of ['/api/auth/signup','/api/auth/login','/api/auth/me','/api/v1/progress','/api/v1/artifacts','/api/health']){
  const response=await worker.fetch(new Request(origin+path),env);
  assert.equal(response.status,404,path);
  assert.match((await response.json()).error,/disabled/i);
 }
});

test('API cannot create accounts even when POSTed directly',async()=>{
 const response=await worker.fetch(new Request(origin+'/api/auth/signup',{
  method:'POST',headers:{'content-type':'application/json'},
  body:JSON.stringify({email:'test@example.com',password:'Test1234!',name:'Tester'})
 }),env);
 assert.equal(response.status,404);
});
