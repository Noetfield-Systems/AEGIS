/**
 * Bounded, single-replica security utilities for AEGIS internal operator access.
 * Sessions are opaque HMAC-authenticated cookies backed by an atomic on-disk registry.
 * This is NOT customer IAM, distributed-rate limiting, or a verified identity provider.
 */
import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
import {readFile,writeFile,rename} from 'node:fs/promises';
import path from 'node:path';

const hmac=(secret,payload)=>createHmac('sha256',secret).update(payload).digest('hex');
const equal=(a,b)=>{
 const x=Buffer.from(String(a??'')),y=Buffer.from(String(b??''));
 return x.length===y.length&&timingSafeEqual(x,y);
};
export function cookieValue(header,name){
 const item=String(header||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='));
 return item?item.slice(name.length+1):null;
}
export function csvSafeCell(input){
 const raw=String(input??'');
 // Excel/LibreOffice can interpret CSV formulas even inside quoted cells.
 // Prefix a literal apostrophe before leading whitespace/control + formula introducer.
 const unsafe=/^[\u0000-\u0020\uFEFF]*[=+\-@]/u.test(raw)||/^[\t\r\n]/.test(raw);
 const safe=unsafe?"'"+raw:raw;
 return '"'+safe.replaceAll('"','""')+'"';
}
export function createLoginGuard({secret,clock=Date.now,limit=8,windowMs=15*60_000}){
 const counts=new Map();
 const expire=24*3600_000;
 function clientCookie(secure=false){
  const id=randomUUID(),until=clock()+expire;
  const value=id+'.'+until+'.'+hmac(secret,'client:'+id+':'+until);
  return 'aegis_login_client='+value+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400'+(secure?'; Secure':'');
 }
 function keyFor(header,ip='unknown',userAgent=''){
  const raw=cookieValue(header,'aegis_login_client');
  if(raw){
   const [id,end,signature,...extra]=raw.split('.');
   if(!extra.length&&/^[0-9a-f-]{36}$/i.test(id||'')&&/^\d{13}$/.test(end||'')&&Number(end)>clock()&&
      equal(signature,hmac(secret,'client:'+id+':'+end)))return 'client:'+id;
  }
  // Compatibility for API clients that do not load /login first. Distinguishes
  // user agents instead of blocking all users sharing the reverse proxy IP.
  return 'legacy:'+hmac(secret,String(ip)+'\x00'+String(userAgent).slice(0,220));
 }
 function state(key){
  const entry=counts.get(key);if(!entry)return {count:0,until:clock()+windowMs};
  if(clock()>=entry.until){counts.delete(key);return {count:0,until:clock()+windowMs}}
  return entry;
 }
 function blocked(key){return state(key).count>=limit}
 function failed(key){
  const current=state(key);counts.set(key,{count:current.count+1,until:current.until});
  if(counts.size>5000){
   for(const [k,v] of counts)if(v.until<=clock())counts.delete(k);
   if(counts.size>5000)counts.delete(counts.keys().next().value);
  }
 }
 function success(key){counts.delete(key)}
 return {clientCookie,keyFor,blocked,failed,success};
}
export async function createSessionRegistry({dir,secret,adminPassword,clock=Date.now,ttlMs=12*3600_000}){
 const filename=path.join(dir,'aegis-auth-sessions.json');
 // A change to either secret or admin credential invalidates all earlier sessions.
 const generation=hmac(secret,'aegis-auth-credentials-v2:'+adminPassword);
 let current={schema:2,generation,sessions:[]};
 let dirty=false;
 try{
  const old=JSON.parse(await readFile(filename,'utf8'));
  if(old?.schema!==2||!Array.isArray(old.sessions)||typeof old.generation!=='string')throw Error('invalid authentication registry');
  if(old.generation===generation){
   if(old.sessions.length>2500)throw Error('oversized authentication registry');
   if(!old.sessions.every(s=>s&&typeof s.id==='string'&&/^[0-9a-f-]{36}$/i.test(s.id)&&Number.isSafeInteger(s.exp)))throw Error('invalid session registry entry');
   current={...old,sessions:old.sessions.filter(s=>s.exp>clock())};
   dirty=current.sessions.length!==old.sessions.length;
  }else dirty=true;
 }catch(e){if(e.code!=='ENOENT')throw e;dirty=true}
 const sessionMap=new Map(current.sessions.map(s=>[s.id,s.exp]));
 let queue=Promise.resolve();
 async function atomicSave(){
  const tmp=filename+'.'+randomUUID()+'.tmp';
  await writeFile(tmp,JSON.stringify({schema:2,generation,sessions:[...sessionMap].map(([id,exp])=>({id,exp}))}),{mode:0o600});
  await rename(tmp,filename);
 }
 if(dirty)await atomicSave();
 function parse(header){
  const raw=cookieValue(header,'aegis_session');
  if(!raw)return null;
  const [version,exp,id,mac,...extra]=raw.split('.');
  if(extra.length||version!=='v2'||!/^\d{13}$/.test(exp||'')||!/^[0-9a-f-]{36}$/i.test(id||''))return null;
  const expires=Number(exp);
  if(expires<=clock()||sessionMap.get(id)!==expires)return null;
  if(!equal(mac,hmac(secret,'v2:'+exp+':'+id)))return null;
  return id;
 }
 function valid(header){return parse(header)!==null}
 function update(callback){
  const task=queue.then(async()=>{
   const next=new Map(sessionMap);
   const output=callback(next);
   // Persist before making the new state authoritative to requests.
   const tmp=filename+'.'+randomUUID()+'.tmp';
   await writeFile(tmp,JSON.stringify({schema:2,generation,sessions:[...next].map(([id,exp])=>({id,exp}))}),{mode:0o600});
   await rename(tmp,filename);
   sessionMap.clear();for(const [id,exp] of next)sessionMap.set(id,exp);
   return output;
  });
  queue=task.then(()=>{},()=>{});return task;
 }
 async function issue(secure=false){
  return update(next=>{
   for(const [id,exp] of next)if(exp<=clock())next.delete(id);
   if(next.size>=2000)throw Error('maximum active operator sessions reached');
   const id=randomUUID(),exp=clock()+ttlMs;
   next.set(id,exp);
   const mac=hmac(secret,'v2:'+exp+':'+id);
   return 'aegis_session=v2.'+exp+'.'+id+'.'+mac+'; HttpOnly; SameSite=Strict; Path=/; Max-Age='+Math.ceil(ttlMs/1000)+(secure?'; Secure':'');
  });
 }
 async function revoke(header){
  const id=parse(header);
  if(!id)return false;
  await update(next=>{next.delete(id)});
  return true;
 }
 return {issue,revoke,valid,filename};
}
