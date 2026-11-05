// Email/password authentication for Cloudflare Pages Functions and Workers.
// This MVP requires D1 binding DB and does NOT yet verify email ownership.
const enc=new TextEncoder();
const COOKIE='__Host-academy_session',TTL=7*24*3600,ITER=120000;
const J={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
const json=(v,s=200,h={})=>new Response(JSON.stringify(v),{status:s,headers:{...J,...h}});
const fail=(m,s=400)=>json({error:m},s);
const clock=()=>Math.floor(Date.now()/1000);
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const bytes=h=>new Uint8Array((h.match(/../g)||[]).map(x=>parseInt(x,16)));
const token=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
const sha=async s=>hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));
const cookie=(value,age)=>COOKIE+'='+value+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age='+age;
const cookieToken=r=>(r.headers.get('cookie')||'').match(/(?:^|;\s*)__Host-academy_session=([a-f0-9]{64})(?:;|$)/)?.[1]||'';
const equal=(a,b)=>{if(!a||!b||a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0;};
async function hashPassword(password,salt,iterations=ITER){
  const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:bytes(salt),iterations,hash:'SHA-256'},key,256));
}
async function body(r){if(!r.headers.get('content-type')?.startsWith('application/json'))return null;if(Number(r.headers.get('content-length'))>4096)return null;const raw=await r.text();if(enc.encode(raw).length>4096)return null;try{return JSON.parse(raw)}catch{return null}}
async function limit(env,key,threshold,windowSecs){
  const bucket=Math.floor(clock()/windowSecs),hash=await sha(key+':'+bucket);
  await env.DB.prepare('INSERT INTO auth_rate_limits (key,bucket,attempts) VALUES (?,?,1) ON CONFLICT(key,bucket) DO UPDATE SET attempts=attempts+1').bind(hash,bucket).run();
  const row=await env.DB.prepare('SELECT attempts FROM auth_rate_limits WHERE key=? AND bucket=?').bind(hash,bucket).first();
  return (row?.attempts||0)>threshold;
}
export async function getUser(r,env){
  const t=cookieToken(r);if(!t||!env.DB)return null;
  const row=await env.DB.prepare('SELECT u.id,u.email,u.name FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?').bind(await sha(t),clock()).first();
  return row||null;
}
async function newSession(env,user){
  const raw=token(),now=clock();
  await env.DB.prepare('INSERT INTO sessions (token_hash,user_id,expires_at,created_at) VALUES (?,?,?,?)').bind(await sha(raw),user.id,now+TTL,now).run();
  return json({user:{id:user.id,email:user.email,name:user.name}},200,{'set-cookie':cookie(raw,TTL)});
}
export async function handleAuth(r,env,path){
  if(!env.DB)return fail('D1 DB binding missing. Configure Cloudflare D1 and run migrations.',503);
  const origin=r.headers.get('origin');
  if(!['GET','HEAD','OPTIONS'].includes(r.method) && origin!==new URL(r.url).origin)return fail('Origin not permitted',403);
  if(path==='/auth/me'&&r.method==='GET'){
    const u=await getUser(r,env);
    return u?json({user:u}):fail('Sign in required',401);
  }
  if(path==='/auth/signup'&&r.method==='POST'){
    if(env.SIGNUP_DISABLED==='true')return fail('Registration temporarily closed',403);
    const input=await body(r);
    if(!input||typeof input.email!=='string'||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)||input.email.length>254||typeof input.name!=='string'||input.name.trim().length<2||input.name.trim().length>64||typeof input.password!=='string'||input.password.length<12||input.password.length>128)return fail('Enter a valid name, email, and password of 12–128 characters.',422);
    if(await limit(env,'sign-ip:'+(r.headers.get('cf-connecting-ip')||'unknown'),5,3600))return fail('Too many registrations. Try later.',429);
    const email=input.email.trim().toLowerCase();
    if(await env.DB.prepare('SELECT id FROM users WHERE email=?').bind(email).first())return fail('Unable to register this email',409);
    const id=crypto.randomUUID(),salt=hex(crypto.getRandomValues(new Uint8Array(16)));
    const pwHash=await hashPassword(input.password,salt);
    try{await env.DB.prepare('INSERT INTO users (id,email,name,password_hash,salt,iterations,created_at) VALUES (?,?,?,?,?,?,?)').bind(id,email,input.name.trim(),pwHash,salt,ITER,clock()).run();}
    catch(e){if(String(e).includes('UNIQUE'))return fail('Unable to register this email',409);throw e;}
    return newSession(env,{id,email,name:input.name.trim()});
  }
  if(path==='/auth/login'&&r.method==='POST'){
    const input=await body(r);
    if(!input||typeof input.email!=='string'||typeof input.password!=='string'||input.password.length>128)return fail('Invalid credentials',401);
    const email=input.email.trim().toLowerCase(),ip=r.headers.get('cf-connecting-ip')||'unknown';
    if(await limit(env,'log-ip:'+ip,30,900)||await limit(env,'log-email:'+email,8,900))return fail('Too many attempts. Try later.',429);
    const u=await env.DB.prepare('SELECT id,email,name,password_hash,salt,iterations FROM users WHERE email=?').bind(email).first();
    const candidate=await hashPassword(input.password,u?.salt||'f95c0fe31ae6446c0dcd9fbbcf0aa514',u?.iterations||ITER);
    if(!u||!equal(candidate,u.password_hash))return fail('Invalid credentials',401);
    return newSession(env,u);
  }
  if(path==='/auth/logout'&&r.method==='POST'){
    const t=cookieToken(r);
    if(t)await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha(t)).run();
    return json({ok:true},200,{'set-cookie':cookie('',0)});
  }
  return fail('Not found',404);
}
