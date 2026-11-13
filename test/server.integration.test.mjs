import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {randomBytes} from 'node:crypto';

async function freePort(){
 return await new Promise((resolve,reject)=>{
  const s=net.createServer();
  s.once('error',reject);
  s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p))});
 });
}
test('E2E: private bilingual web application, static assets and evidence gate', {timeout:16000},async t=>{
 const temp=await mkdtemp(path.join(os.tmpdir(),'aegis-smoke-'));
 const port=await freePort();
 const base='http://127.0.0.1:'+port;
 const password='test-password-'+randomBytes(10).toString('hex');
 const secret=randomBytes(32).toString('hex');
 const proc=spawn(process.execPath,['server.mjs'],{cwd:path.join(path.dirname(fileURLToPath(import.meta.url)),'..'),env:{...process.env,PORT:String(port),ADMIN_PASSWORD:password,SESSION_SECRET:secret,DATA_DIR:temp},stdio:['ignore','pipe','pipe']});
 let stderr='';proc.stderr.on('data',x=>{stderr+=x.toString()});
 t.after(async()=>{proc.kill('SIGTERM');await rm(temp,{recursive:true,force:true})});
 let ready=false;
 for(let i=0;i<75;i++){
  if(proc.exitCode!==null)break;
  try{const r=await fetch(base+'/api/health');if(r.ok&&(await r.json()).ok){ready=true;break}}catch{}
  await sleep(80);
 }
 assert.ok(ready,'server did not start: '+stderr);
 for(const [url,contains] of [['/','/premium.css'],['/premium.css','--amber'],['/locale.js','aegis_language'],['/aegis-emblem.svg','<svg'],['/ottawa-silhouette.svg','<svg'],['/app.js','function overview']]){
  const r=await fetch(base+url);assert.equal(r.status,200,url);assert.ok((await r.text()).includes(contains),url+' did not contain required asset');
 }
 assert.equal((await fetch(base+'/api/state')).status,401,'private data must require login');
 const bad=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:'wrong'})});
 assert.equal(bad.status,401);
 const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
 assert.equal(login.status,200);
 const cookie=login.headers.get('set-cookie')?.split(';')[0];
 assert.ok(cookie?.startsWith('aegis_session='));
 const headers={Cookie:cookie,'Content-Type':'application/json'};
 const initial=await (await fetch(base+'/api/state',{headers})).json();
 assert.equal(initial.derived.score,0);
 assert.equal(initial.derived.openGates.length,10);
 const rating=await fetch(base+'/api/rating',{method:'POST',headers,body:JSON.stringify({id:'Q3b',value:20})});
 assert.equal(rating.status,200);
 assert.equal((await rating.json()).derived.score,0,'user-rated score without real reviewed evidence must remain zero');
 const gate=await fetch(base+'/api/gate',{method:'POST',headers,body:JSON.stringify({id:'M-TRL',value:'passed'})});
 assert.equal(gate.status,400,'mandatory gate cannot pass without evidence');
 const exportRes=await fetch(base+'/api/export?format=json',{headers});
 assert.equal(exportRes.status,200);
 const payload=await exportRes.json();assert.equal(payload.derived.score,0);
});
