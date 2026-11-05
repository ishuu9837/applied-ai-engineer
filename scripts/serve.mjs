import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
const port=Number(process.env.PORT||4173);
const server=http.createServer((req,res)=>{
 let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end('Bad URL');return;}
 const file=path.resolve(root,`.${url==='/'?'/index.html':url}`);
 if(!file.startsWith(root+path.sep)&&file!==path.join(root,'index.html')){res.writeHead(403).end('Forbidden');return;}
 fs.readFile(file,(err,data)=>{
   if(err){res.writeHead(404).end('Not found');return;}
   res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(data);
 });
});
server.listen(port,'127.0.0.1',()=>console.log(`Open http://127.0.0.1:${port} (Ctrl+C to stop)`));
