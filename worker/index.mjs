import {getUser,handleAuth} from './auth.mjs';
/**
 * Field Academy single-user API. Set Cloudflare Access on the Worker hostname.
 * Only an Access-authenticated request receives ctx.access. Never trust a
 * browser-supplied email or unsigned assertion as identity.
 */
const MAX_PROGRESS_BYTES = 64 * 1024;
const MAX_ARTIFACT_BYTES = 1024 * 1024;
const ACCEPT_ARTIFACT_TYPES = new Set(['application/json', 'text/plain']);
const JSON_HEADERS = {'content-type':'application/json; charset=utf-8', 'cache-control':'no-store', 'x-content-type-options':'nosniff'};
function json(body,status=200,extra={}) {return new Response(JSON.stringify(body),{status,headers:{...JSON_HEADERS,...extra}});}
function crossOriginHeaders(req,env){
  const origin=req.headers.get('origin');
  if(origin && origin===env.PUBLIC_ORIGIN){
    return {'access-control-allow-origin':origin,'access-control-allow-credentials':'true', 'access-control-allow-methods':'GET, PUT, POST, OPTIONS','access-control-allow-headers':'Content-Type, X-Artifact-Name', 'vary':'Origin'};
  }
  return {'vary':'Origin'};
}
const withCORS=(res,extra)=>{const headers=new Headers(res.headers);for(const [k,v] of Object.entries(extra))headers.set(k,v);return new Response(res.body,{status:res.status,headers});};
async function digest(text){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');}
function validProgress(payload){
 if(!payload||typeof payload!=='object'||Array.isArray(payload))return false;
 const approved=['checklist','tasks','hints','acknowledged','quiz','notes','done','coachScores','stageDone','bugHunts'];
 return Object.keys(payload).every(x=>approved.includes(x)) && JSON.stringify(payload).length<=MAX_PROGRESS_BYTES;
}
async function progressRoute(request,env,userId){
 if(request.method==='GET'){
  const row=await env.DB.prepare('SELECT data_json FROM progress WHERE user_id = ?').bind(userId).first();
  return json({progress:row?JSON.parse(row.data_json):null});
 }
 if(request.method==='PUT'){
  const raw=await request.text();
  if(new TextEncoder().encode(raw).length>MAX_PROGRESS_BYTES)return json({error:'Payload too large'},413);
  let body;try{body=JSON.parse(raw);}catch{return json({error:'Invalid JSON'},400);}
  if(!validProgress(body))return json({error:'Invalid progress payload'},422);
  const payload=JSON.stringify(body);
  await env.DB.prepare(`INSERT INTO progress (user_id, data_json, updated_at)
    VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET data_json=excluded.data_json, updated_at=excluded.updated_at`)
    .bind(userId,payload,new Date().toISOString()).run();
  return json({ok:true,bytes:payload.length});
 }
 return json({error:'Method not allowed'},405,{'allow':'GET, PUT'});
}
async function artifactsRoute(request,env,userId,path){
 if(path==='/v1/artifacts' && request.method==='GET'){
  const results=await env.DB.prepare('SELECT id, name, bytes, content_type, created_at FROM artifacts WHERE user_id = ? ORDER BY created_at DESC LIMIT 30').bind(userId).all();
  return json({artifacts:results.results||[]});
 }
 if(path==='/v1/artifacts' && request.method==='POST'){
  const type=(request.headers.get('content-type')||'').split(';')[0].toLowerCase();
  if(!ACCEPT_ARTIFACT_TYPES.has(type))return json({error:'Only text/plain or application/json allowed'},415);
  const declared=Number(request.headers.get('content-length'));
  if(Number.isFinite(declared)&&declared>MAX_ARTIFACT_BYTES)return json({error:'Max 1 MiB artifact'},413);
  const data=await request.arrayBuffer();
  if(data.byteLength>MAX_ARTIFACT_BYTES)return json({error:'Max 1 MiB artifact'},413);
  const name=(request.headers.get('x-artifact-name')||'study-notes.txt').trim();
  if(name.length>100 || !/^[a-zA-Z0-9._ -]{1,100}$/.test(name))return json({error:'Invalid artifact name'},422);
  const id=crypto.randomUUID();const key=`private/${userId}/${id}`;
  await env.ARTIFACTS.put(key,data,{httpMetadata:{contentType:type}});
  try {
    await env.DB.prepare('INSERT INTO artifacts (id, user_id, object_key, name, bytes, content_type, created_at) VALUES (?,?,?,?,?,?,?)')
      .bind(id,userId,key,name,data.byteLength,type,new Date().toISOString()).run();
  } catch(error){await env.ARTIFACTS.delete(key);throw error;}
  return json({id,name,bytes:data.byteLength},201);
 }
 const match=path.match(/^\/v1\/artifacts\/([0-9a-f-]{36})$/);
 if(match && request.method==='GET'){
  const row=await env.DB.prepare('SELECT object_key, name, content_type FROM artifacts WHERE id=? AND user_id=?').bind(match[1],userId).first();
  if(!row)return json({error:'Not found'},404);
  const obj=await env.ARTIFACTS.get(row.object_key);
  if(!obj)return json({error:'Object missing'},404);
  return new Response(obj.body,{status:200,headers:{'content-type':row.content_type,'content-disposition':`attachment; filename="${row.name.replaceAll('"','')}"`, 'cache-control':'private, no-store','x-content-type-options':'nosniff'}});
 }
 return json({error:'Route or method not found'},404);
}
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  const route=url.pathname.startsWith('/api/')?url.pathname.slice(4):url.pathname;
  if(route==='/health')return json({status:'ok',database:!!env.DB,storage:!!env.ARTIFACTS});
  if(!route.startsWith('/auth/')&&!route.startsWith('/v1/')){
    if(env.ASSETS)return env.ASSETS.fetch(request);
    return json({error:'Not found'},404);
  }
  if(request.method!=='GET'&&request.method!=='HEAD'&&request.headers.get('origin')!==url.origin)return json({error:'Origin not permitted'},403);
  if(!env.DB)return json({error:'D1 database binding DB is required'},503);
  try {
   if(route.startsWith('/auth/'))return handleAuth(request,env,route);
   const user=await getUser(request,env);
   if(!user)return json({error:'Sign in required'},401);
   if(route==='/v1/progress')return progressRoute(request,env,user.id);
   if(route.startsWith('/v1/artifacts'))return artifactsRoute(request,env,user.id,route);
   return json({error:'Not found'},404);
  }catch(error){console.error('API error',error?.message||'unknown');return json({error:'Internal server error'},500);}
 }
};
