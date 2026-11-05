// Public, authentication-free static learning site.
// No user accounts, cookies, database queries, or private storage endpoints.
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname.startsWith('/api/')){
   return new Response(JSON.stringify({error:'API disabled: this academy uses browser-local progress only.'}),{
    status:404,
    headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}
   });
  }
  if(env.ASSETS)return env.ASSETS.fetch(request);
  return new Response('Static assets binding missing',{status:503});
 }
};
